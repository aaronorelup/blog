"""Video in through the Vercel AI Gateway's Responses / OpenResponses endpoint (POST https://ai-gateway.vercel.sh/v1/responses)
after the Chat Completions `file` part with video/mp4 was refused for the free-tier models ("'file part media type
video/mp4' functionality not supported"). Sends the clip as an `input_video` part with a base64 data URL in `video_url`
(the docs list `input_video` with `video_url` for OpenResponses), the prompt plus the JSON schema as text.
Usage: python -I gateway_video_responses.py <model> <video.mp4> <prompt.txt> <schema.json> <outdir> [input_file]
The key is read at run time and sent only in the Authorization header.
"""
import base64, hashlib, json, os, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/scripts")
from getkey import getkey  # noqa: E402
import llm_common  # noqa: E402

model, video, ppath, spath, out = sys.argv[1:6]
part_kind = sys.argv[6] if len(sys.argv) > 6 else "input_video"
os.makedirs(out, exist_ok=True)
cat = {m["id"]: m for m in requests.get("https://ai-gateway.vercel.sh/v1/models", timeout=60).json()["data"]}
pr = cat[model]["pricing"]
pin, pout = float(pr["input"]), float(pr["output"])
llm_common.check_cap("vercel-ai-gateway", 20000 * pin + 8192 * pout)
data = open(video, "rb").read()
sha = hashlib.sha256(data).hexdigest()
text = open(ppath).read() + "\nAnswer with JSON only, no other text, matching this JSON schema:\n" + open(spath).read()
durl = "data:video/mp4;base64," + base64.b64encode(data).decode()
if part_kind == "input_video":
    vpart = {"type": "input_video", "video_url": durl}
else:
    vpart = {"type": "input_file", "filename": os.path.basename(video), "file_data": durl}
body = {"model": model, "max_output_tokens": 8192,
        "input": [{"role": "user", "content": [vpart, {"type": "input_text", "text": text}]}]}
logged = json.loads(json.dumps(body))
logged["input"][0]["content"][0]["video_url" if part_kind == "input_video" else "file_data"] = \
    f"<data:video/mp4;base64 of {os.path.basename(video)}: {len(data)} bytes, sha256 {sha}>"
json.dump(logged, open(os.path.join(out, "request.json"), "w"), indent=1)
key = getkey("VERCEL_AI_GATEWAY_API_KEY")
t0 = time.time()
r = requests.post("https://ai-gateway.vercel.sh/v1/responses", json=body, timeout=600,
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
    cost = int(u.get("input_tokens") or 0) * pin + int(u.get("output_tokens") or 0) * pout
    rep = u.get("cost") if isinstance(u.get("cost"), (int, float)) else 0
    cost = max(cost, rep or 0)
    llm_common.log_spend({"service": "vercel-ai-gateway", "model": model, "tag": os.path.basename(out.rstrip("/")),
                          "http_status": r.status_code, "usage": u, "cost_usd": round(cost, 6)})
outtext = j.get("output_text") or ""
if not outtext:
    for o in j.get("output", []) or []:
        for c in o.get("content", []) or []:
            if c.get("type") in ("output_text", "text"):
                outtext += c.get("text", "")
meta = {"model": model, "endpoint": "/v1/responses", "part": part_kind, "http_status": r.status_code,
        "wall_s": round(wall, 3), "usage": u, "cost_usd": cost, "media_sha256": sha, "media_bytes": len(data)}
json.dump(meta, open(os.path.join(out, "meta.json"), "w"), indent=1)
t = outtext.strip()
if t.startswith("```"):
    t = t.strip("`")
    t = t[4:] if t.startswith("json") else t
try:
    json.dump(json.loads(t), open(os.path.join(out, "answer.json"), "w"), indent=1)
except ValueError:
    open(os.path.join(out, "answer.txt"), "w").write(outtext)
print(json.dumps(meta)[:600])
if r.status_code != 200:
    print(r.text[:800])
else:
    print(outtext[:1500])
