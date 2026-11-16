"""One Gemini API call (Interactions API, v1beta) with one audio or video file sent inline, JSON output by schema.

Usage:
  python -I gemini_trial.py --model gemini-4-carbon --media /home/user/gtr/inputs/S3/S3.mono.wav --mime audio/wav \
      --prompt prompts/chords_prompt.txt --schema prompts/chords_schema.json --out <dir> [--thinking low|medium|high]
      [--max-output 24576]

Writes into <dir>: request.json (the request body with the base64 media replaced by its sha256 and size), response.json
(the raw HTTP response body), answer.json (the model's JSON answer, parsed), meta.json (model, HTTP status, wall-clock,
usage, computed cost). The key is read from the key store at run time and sent only in the x-goog-api-key header.

Prices (USD per 1M tokens, Standard paid tier), read 2026-11-10 from https://aistudio.google.com/docs/pricing
(the redirect target of https://ai.google.dev/gemini-api/docs/pricing):
  gemini-4-carbon        input $2.00 ("through November 30, 2026"), output incl. thinking $10.00
  gemini-3.5-flash-lite  input $0.30 "(text / image / video / audio)", output incl. thinking $2.50
"""
import argparse, base64, hashlib, json, os, subprocess, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/scripts")
from getkey import getkey  # noqa: E402
import llm_common  # noqa: E402

PRICES = {  # USD per 1M tokens: (input, output incl. thinking)
    "gemini-4-carbon": (2.00, 10.00),
    "gemini-3.5-flash-lite": (0.30, 2.50),
}
URL = "https://generativelanguage.googleapis.com/v1beta/interactions"

ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True)
ap.add_argument("--media", required=True)
ap.add_argument("--mime", required=True)
ap.add_argument("--prompt", required=True)
ap.add_argument("--schema", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--thinking", default=None)
ap.add_argument("--max-output", type=int, default=24576)
ap.add_argument("--fps", type=float, default=None)
a = ap.parse_args()

if a.model not in PRICES:
    raise SystemExit("no price recorded for " + a.model)
pin, pout = PRICES[a.model]
os.makedirs(a.out, exist_ok=True)
data = open(a.media, "rb").read()
sha = hashlib.sha256(data).hexdigest()
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.media],
                           capture_output=True, text=True).stdout.strip())
kind = "video" if a.mime.startswith("video/") else "audio"
# documented rates: audio 32 tokens/s; video about 300 tokens/s at the default media resolution (258 per frame at 1 fps + 32 audio)
est_in = int(dur * (300 if kind == "video" else 32)) + 2000
worst = est_in * pin / 1e6 + a.max_output * pout / 1e6
s_before, t_before = llm_common.check_cap("gemini", worst)

prompt = open(a.prompt).read()
schema = json.load(open(a.schema))
media_part = {"type": kind, "data": "<base64>", "mime_type": a.mime}
if a.fps:
    media_part["processing"] = {"type": "static", "fps": a.fps}
body = {
    "model": a.model,
    "input": [media_part, {"type": "text", "text": prompt}],
    "response_format": {"type": "text", "mime_type": "application/json", "schema": schema},
    "generation_config": {"max_output_tokens": a.max_output},
    "store": False,
}
if a.thinking:
    body["generation_config"]["thinking_level"] = a.thinking
logged = json.loads(json.dumps(body))
logged["input"][0]["data"] = f"<base64 of {os.path.basename(a.media)}: {len(data)} bytes, sha256 {sha}>"
json.dump(logged, open(os.path.join(a.out, "request.json"), "w"), indent=1)
body["input"][0]["data"] = base64.b64encode(data).decode()

key = getkey("GEMINI_API_KEY")
t0 = time.time()
r = requests.post(URL, json=body, timeout=900,
                  headers={"x-goog-api-key": key, "Content-Type": "application/json", "Api-Revision": "2026-05-20"})
wall = time.time() - t0
del key
open(os.path.join(a.out, "response.json"), "w").write(r.text)
meta = {"model": a.model, "media": a.media, "media_bytes": len(data), "media_sha256": sha, "media_duration_s": dur,
        "mime": a.mime, "http_status": r.status_code, "wall_s": round(wall, 3), "thinking_level": a.thinking,
        "max_output_tokens": a.max_output, "price_usd_per_1M": {"input": pin, "output_incl_thinking": pout},
        "price_source": "https://aistudio.google.com/docs/pricing (read 2026-11-10)"}
try:
    j = r.json()
except ValueError:
    j = {}
u = j.get("usage") or {}
if u:
    tin = int(u.get("total_input_tokens") or 0)
    tout = int(u.get("total_output_tokens") or 0)
    tth = int(u.get("total_thought_tokens") or 0)
    ttool = int(u.get("total_tool_use_tokens") or 0)
    cost = (tin + ttool) * pin / 1e6 + (tout + tth) * pout / 1e6
    meta.update({"usage": u, "cost_usd": round(cost, 6),
                 "cost_formula": "(total_input_tokens + total_tool_use_tokens) * input price + "
                                 "(total_output_tokens + total_thought_tokens) * output price"})
    llm_common.log_spend({"service": "gemini", "model": a.model, "tag": os.path.basename(a.out.rstrip('/')),
                          "http_status": r.status_code, "usage": u, "cost_usd": round(cost, 6)})
meta["status"] = j.get("status")
text = ""
for st in j.get("steps", []) or []:
    if st.get("type") == "model_output":
        for c in st.get("content", []) or []:
            if c.get("type") == "text":
                text += c.get("text", "")
meta["output_text_chars"] = len(text)
try:
    ans = json.loads(text)
    json.dump(ans, open(os.path.join(a.out, "answer.json"), "w"), indent=1)
    meta["answer_parsed"] = True
except ValueError:
    open(os.path.join(a.out, "answer.txt"), "w").write(text)
    meta["answer_parsed"] = False
meta["spent_gemini_before_usd"] = round(s_before, 6)
json.dump(meta, open(os.path.join(a.out, "meta.json"), "w"), indent=1)
print(json.dumps({k: meta.get(k) for k in ("model", "http_status", "status", "wall_s", "cost_usd", "answer_parsed")}))
print("usage:", json.dumps(u))
if r.status_code != 200:
    print(r.text[:2000])
