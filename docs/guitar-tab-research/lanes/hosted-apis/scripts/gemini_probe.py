"""Two no-cost probes of the Gemini key after the first trial call returned HTTP 402:
1. countTokens (v1beta/models/<model>:countTokens) on one audio file sent inline: how many tokens the file counts as.
2. generateContent (the legacy endpoint) with a one-word text prompt, to see whether the 402 is specific to the
   Interactions API or applies to the whole project.
The key is read at run time and sent only in the x-goog-api-key header. Usage: python -I gemini_probe.py <model> <wav> <outdir>
"""
import base64, json, os, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
from getkey import getkey  # noqa: E402

model, wav, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
key = getkey("GEMINI_API_KEY")
H = {"x-goog-api-key": key, "Content-Type": "application/json"}
base = "https://generativelanguage.googleapis.com/v1beta/models/" + model
b64 = base64.b64encode(open(wav, "rb").read()).decode()
res = {}
t0 = time.time()
r = requests.post(base + ":countTokens", headers=H, timeout=120, json={
    "contents": [{"parts": [{"inline_data": {"mime_type": "audio/wav", "data": b64}}, {"text": "List the chords."}]}]})
res["countTokens"] = {"http_status": r.status_code, "wall_s": round(time.time() - t0, 3), "body": r.json()}
t0 = time.time()
r = requests.post(base + ":generateContent", headers=H, timeout=120, json={
    "contents": [{"parts": [{"text": "Reply with the single word: ok"}]}]})
res["generateContent_text"] = {"http_status": r.status_code, "wall_s": round(time.time() - t0, 3), "body": r.json()}
del key
json.dump(res, open(os.path.join(out, "probe_" + model + ".json"), "w"), indent=1)
print(json.dumps(res, indent=1)[:3000])
