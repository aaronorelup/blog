"""Video question asked as still frames (the Vercel AI Gateway refused video/mp4 file parts for the free-tier models):
the R3a frames sampled at 1 frame per second (ffmpeg fps=1, JPEG), each sent as an image_url part (base64 data URL)
preceded by a text label with its time, then the video prompt; JSON output by schema where the model supports it.
Usage: python -I gateway_frames_trial.py <model> <frames_dir> <prompt.txt> <schema.json> <outdir> [--schema-in-prompt]
The key is read at run time and sent only in the Authorization header.
"""
import base64, glob, hashlib, json, os, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/scripts")
from getkey import getkey  # noqa: E402
import llm_common  # noqa: E402

model, fdir, ppath, spath, out = sys.argv[1:6]
schema_in_prompt = "--schema-in-prompt" in sys.argv
os.makedirs(out, exist_ok=True)
cat = {m["id"]: m for m in requests.get("https://ai-gateway.vercel.sh/v1/models", timeout=60).json()["data"]}
pr = cat[model]["pricing"]
pin, pout = float(pr["input"]), float(pr["output"])
frames = sorted(glob.glob(os.path.join(fdir, "*.jpg")))
llm_common.check_cap("vercel-ai-gateway", (2000 * len(frames) + 2000) * pin + 16384 * pout)
schema = json.load(open(spath))
prompt = ("The images below are frames taken from the video at one frame per second; the label before each frame "
          "gives its time in seconds from the start of the video.\n" + open(ppath).read())
content, logged = [], []
for i, f in enumerate(frames):
    b = open(f, "rb").read()
    content.append({"type": "text", "text": f"Frame at t = {i}.0 s:"})
    content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(b).decode()}})
    logged.append({"t_s": float(i), "file": os.path.basename(f), "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()})
if schema_in_prompt:
    prompt += "\nAnswer with JSON only, no other text, matching this JSON schema:\n" + json.dumps(schema)
content.append({"type": "text", "text": prompt})
body = {"model": model, "messages": [{"role": "user", "content": content}], "max_tokens": 16384}
if not schema_in_prompt:
    body["response_format"] = {"type": "json_schema", "json_schema": {"name": "answer", "schema": schema}}
json.dump({"model": model, "frames": logged, "prompt": prompt, "response_format": body.get("response_format"),
           "max_tokens": 16384}, open(os.path.join(out, "request.json"), "w"), indent=1)
key = getkey("VERCEL_AI_GATEWAY_API_KEY")
t0 = time.time()
r = requests.post("https://ai-gateway.vercel.sh/v1/chat/completions", json=body, timeout=900,
                  headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
wall = time.time() - t0
del key
open(os.path.join(out, "response.json"), "w").write(r.text)
try:
    j = r.json()
except ValueError:
    j = {}
u = j.get("usage") or {}
cost = None
if u:
    cost = max(int(u.get("prompt_tokens") or 0) * pin + int(u.get("completion_tokens") or 0) * pout,
               u.get("cost") if isinstance(u.get("cost"), (int, float)) else 0)
    llm_common.log_spend({"service": "vercel-ai-gateway", "model": model, "tag": os.path.basename(out.rstrip("/")),
                          "http_status": r.status_code, "usage": u, "cost_usd": round(cost, 6)})
msg = ((j.get("choices") or [{}])[0].get("message") or {})
text = (msg.get("content") or "").strip()
prov = ((msg.get("provider_metadata") or {}).get("gateway") or {}).get("routing", {}).get("finalProvider")
meta = {"model": model, "provider": prov, "http_status": r.status_code, "wall_s": round(wall, 3), "n_frames": len(frames),
        "usage": u, "cost_usd": cost, "finish_reason": (j.get("choices") or [{}])[0].get("finish_reason")}
json.dump(meta, open(os.path.join(out, "meta.json"), "w"), indent=1)
t = text
if t.startswith("```"):
    t = t.strip("`")
    t = t[4:] if t.startswith("json") else t
try:
    json.dump(json.loads(t), open(os.path.join(out, "answer.json"), "w"), indent=1)
except ValueError:
    open(os.path.join(out, "answer.txt"), "w").write(text)
print(json.dumps(meta)[:700])
print(text[:2500] if r.status_code == 200 else r.text[:800])
