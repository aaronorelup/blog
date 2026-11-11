import os, sys, json, base64, subprocess, urllib.request, concurrent.futures as cf, time
sys.path.insert(0, os.path.dirname(__file__))
env = {k: v for k, v in os.environ.items() if k != "INFISICAL_CLIENT_ID"}
KEY = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "XAI_API_KEY"], capture_output=True, text=True, env=env).stdout.strip()
import importlib.util
spec = importlib.util.spec_from_file_location("g", os.path.join(os.path.dirname(__file__), "gen_stills_jobs.py")); g = importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
MODEL = os.environ.get("IMG_MODEL", "grok-imagine-image-2.0")
OUT = "/workspace/teahouse_alt/hero_work/stills"
def gen(name):
    refs, prompt = g.JOBS[name]
    imgs = [{"type": "image_url", "url": "data:image/jpeg;base64," + base64.b64encode(open(r, "rb").read()).decode()} for r in refs]
    body = {"model": MODEL, "prompt": "Use the reference image(s) for the exact design. " + prompt + g.ISO, "response_format": "b64_json"}
    if len(imgs) == 1: body["image"] = imgs[0]
    else: body["images"] = imgs
    err = ""
    for attempt in range(2):
        try:
            r = urllib.request.Request("https://api.x.ai/v1/images/edits", data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY, "User-Agent": "spike-client"})
            d = json.load(urllib.request.urlopen(r, timeout=180))
            fn = f"{OUT}/{name}.jpg"; open(fn, "wb").write(base64.b64decode(d["data"][0]["b64_json"])); return f"{name} ok {fn}"
        except urllib.error.HTTPError as e:
            err = f"{e.code} {e.read()[:300]}"; time.sleep(2)
        except Exception as e:
            err = str(e)[:200]; time.sleep(2)
    return f"{name} FAIL {err}"
with cf.ThreadPoolExecutor(6) as ex:
    for r in ex.map(gen, sys.argv[1:]): print(r, flush=True)
