import os, sys, threading, queue, traceback, io, json, time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
TOKEN = os.environ.get("SPIKE_TOKEN", "")
LOG = []
def log(*a):
    s = time.strftime("%H:%M:%S ") + " ".join(str(x) for x in a); LOG.append(s); print(s, flush=True)
NS = {}; READY = {"ok": False}; Q = queue.Queue(); JOBS = {}
OUT = "/tmp/spike_out"; os.makedirs(OUT, exist_ok=True)
def loader():
    try:
        while not os.path.exists(os.environ.get("DEPS_FLAG", "/nonexistent")) and os.environ.get("DEPS_FLAG"):
            time.sleep(5)
        os.chdir("/content/TRELLIS.2"); sys.path.insert(0, "/content/TRELLIS.2")
        here = os.path.dirname(os.path.abspath(__file__))
        if os.path.exists(os.path.join(here, "trellis_core.py")):
            src = open(os.path.join(here, "trellis_core.py")).read()
        else:
            src = open("worker_runpod.py").read().replace('runpod.serverless.start({"handler": generate})', "")
        log("loading pipeline"); exec(compile(src, "worker_runpod.py", "exec"), NS); READY["ok"] = True; log("READY")
    except Exception:
        log("LOAD FAILED", traceback.format_exc())
def worker():
    while True:
        name, data, p = Q.get()
        JOBS[name] = "running"; t0 = time.time()
        try:
            from PIL import Image
            img = Image.open(io.BytesIO(data)).convert("RGBA")
            rb = p.get("rembg", "1") == "1"
            st = NS["image_to_3d"](img, seed=int(p.get("seed", "42")), resolution=p.get("res", "1024"), remove_bg=rb)
            path = NS["extract_glb"](st, decimation_target=int(p.get("dec", "200000")), texture_size=int(p.get("tex", "2048")), output_dir=OUT)
            os.rename(path, f"{OUT}/{name}.glb"); JOBS[name] = f"done {time.time()-t0:.0f}s"; log("done", name, f"{time.time()-t0:.0f}s")
        except Exception:
            JOBS[name] = "failed"; log("FAILED", name, traceback.format_exc())
class H(BaseHTTPRequestHandler):
    def _ok(self, code, body, ctype="application/json"):
        self.send_response(code); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def _auth(self, q):
        return q.get("t", [""])[0] == TOKEN
    def do_GET(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        if u.path == "/health": return self._ok(200, b"ok")
        if not self._auth(q): return self._ok(403, b"no")
        if u.path == "/status": return self._ok(200, json.dumps({"ready": READY["ok"], "jobs": JOBS, "queue": Q.qsize()}).encode())
        if u.path == "/log":
            boot = open("/root/spike/boot.log").read()[-6000:] if os.path.exists("/root/spike/boot.log") else ""
            return self._ok(200, (boot + "\n----\n" + "\n".join(LOG[-200:])).encode(), "text/plain")
        if u.path.startswith("/result/"):
            f = f"{OUT}/{os.path.basename(u.path)}"
            if os.path.exists(f): return self._ok(200, open(f, "rb").read(), "model/gltf-binary")
            return self._ok(404, b"none")
        self._ok(404, b"?")
    def do_POST(self):
        u = urlparse(self.path); q = parse_qs(u.query)
        if not self._auth(q): return self._ok(403, b"no")
        if u.path == "/exec":   # token-guarded debug shell: body is a bash command, returns its output (120 s limit)
            import subprocess
            cmd = self.rfile.read(int(self.headers.get("Content-Length", 0))).decode()
            r = subprocess.run(["bash", "-c", cmd], capture_output=True, text=True, timeout=120)
            return self._ok(200, (r.stdout[-8000:] + r.stderr[-4000:]).encode(), "text/plain")
        n = int(self.headers.get("Content-Length", 0)); data = self.rfile.read(n)
        p = {k: v[0] for k, v in q.items()}; name = p["name"]
        JOBS[name] = "queued"; Q.put((name, data, p)); self._ok(200, b"queued")
    def log_message(self, *a): pass
threading.Thread(target=loader, daemon=True).start()
def worker_when_ready():
    while not READY["ok"]:
        time.sleep(2)
    worker()
threading.Thread(target=worker_when_ready, daemon=True).start()
log("http up"); ThreadingHTTPServer(("0.0.0.0", 8000), H).serve_forever()
