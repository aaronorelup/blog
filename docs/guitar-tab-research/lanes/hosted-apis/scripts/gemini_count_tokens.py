"""countTokens (no charge, no generation) for the Gemini trial inputs, per model: how many input tokens each audio or
video file counts as when sent inline. Usage: python -I gemini_count_tokens.py <out.json> <model> [<model> ...]
The key is read at run time and sent only in the x-goog-api-key header.
"""
import base64, json, os, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
from getkey import getkey  # noqa: E402

FILES = [("S3", "/home/user/gtr/inputs/S3/S3.mono.wav", "audio/wav"),
         ("S4", "/home/user/gtr/inputs/S4/S4.mono.wav", "audio/wav"),
         ("S2n", "/home/user/gtr/inputs/S2n/S2n.mono.wav", "audio/wav"),
         ("S5capo2", "/home/user/gtr/inputs/S5capo2/S5capo2.mono.wav", "audio/wav"),
         ("R3a", "/home/user/gtr/inputs/R3a/R3a.mp4", "video/mp4")]
out, models = sys.argv[1], sys.argv[2:]
key = getkey("GEMINI_API_KEY")
H = {"x-goog-api-key": key, "Content-Type": "application/json"}
res = []
for m in models:
    for cid, path, mime in FILES:
        b64 = base64.b64encode(open(path, "rb").read()).decode()
        t0 = time.time()
        r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:countTokens", headers=H,
                          timeout=180, json={"contents": [{"parts": [{"inline_data": {"mime_type": mime, "data": b64}}]}]})
        res.append({"model": m, "clip": cid, "file": path, "mime": mime, "bytes": os.path.getsize(path),
                    "http_status": r.status_code, "wall_s": round(time.time() - t0, 3), "body": r.json()})
        print(m, cid, r.status_code, json.dumps(r.json())[:300])
del key
json.dump(res, open(out, "w"), indent=1)
