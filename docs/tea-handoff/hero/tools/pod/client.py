"""submit stills to the pod and fetch GLBs. usage: client.py submit name img [k=v...] | wait name... | status | log"""
import sys, os, time, urllib.request, json
POD = os.environ.get("POD") or open("/workspace/teahouse_alt/hero_work/PODS.txt").read().split(",")[0].strip()
BASE = f"https://{POD}-8000.proxy.runpod.net"; TOK = open("/workspace/teahouse_alt/hero_work/tools/pod/token").read().strip()
RAW = "/workspace/teahouse_alt/hero_work/raw"
def get(path): return urllib.request.urlopen(urllib.request.Request(BASE + path + ("&" if "?" in path else "?") + "t=" + TOK, headers={"User-Agent": "spike"}), timeout=120).read()
cmd = sys.argv[1]
if cmd == "submit":
    name, img = sys.argv[2], sys.argv[3]; extra = "&".join(sys.argv[4:])
    r = urllib.request.Request(f"{BASE}/submit?t={TOK}&name={name}&{extra}", data=open(img, "rb").read(), method="POST", headers={"User-Agent": "spike"})
    print(urllib.request.urlopen(r, timeout=120).read())
elif cmd == "status": print(get("/status").decode())
elif cmd == "log": print(get("/log").decode()[-4000:])
elif cmd == "wait":
    names = sys.argv[2:]; left = set(names)
    while left:
        st = json.loads(get("/status"))["jobs"]
        for n in list(left):
            s = st.get(n, "?")
            if s.startswith("done"):
                open(f"{RAW}/{n}.glb", "wb").write(get(f"/result/{n}.glb")); print(n, s, os.path.getsize(f"{RAW}/{n}.glb"), flush=True); left.discard(n)
            elif s == "failed": print(n, "FAILED", flush=True); left.discard(n)
        time.sleep(10)
