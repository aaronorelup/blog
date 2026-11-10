"""xAI speech to text (POST https://api.x.ai/v1/stt, multipart form, file last) on one audio file.
Cost counted at the published REST rate "$0.10 / hr" (https://docs.x.ai/developers/pricing.md, read 2026-11-10).
Usage: python -I xai_stt.py <audio> <outdir> [language]
The key is read at run time and sent only in the Authorization header.
"""
import hashlib, json, os, subprocess, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/scripts")
from getkey import getkey  # noqa: E402
import llm_common  # noqa: E402

audio, out = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)
data = open(audio, "rb").read()
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio],
                           capture_output=True, text=True).stdout.strip())
cost = dur / 3600 * 0.10
llm_common.check_cap("xai", cost)
fields = [("model", (None, "grok-voice-transcribe-2.0"))]
if lang:
    fields.append(("language", (None, lang)))
fields.append(("file", (os.path.basename(audio), data, "audio/wav")))
key = getkey("XAI_API_KEY")
t0 = time.time()
r = requests.post("https://api.x.ai/v1/stt", headers={"Authorization": "Bearer " + key}, files=fields, timeout=600)
wall = time.time() - t0
del key
open(os.path.join(out, "response.json"), "w").write(r.text)
meta = {"endpoint": "POST https://api.x.ai/v1/stt", "model": "grok-voice-transcribe-2.0", "language": lang,
        "audio": audio, "audio_bytes": len(data), "audio_sha256": hashlib.sha256(data).hexdigest(),
        "audio_duration_s": dur, "http_status": r.status_code, "wall_s": round(wall, 3),
        "cost_usd_counted": round(cost, 6), "cost_rule": "duration_h * 0.10 USD (published REST rate)"}
json.dump(meta, open(os.path.join(out, "meta.json"), "w"), indent=1)
llm_common.log_spend({"service": "xai", "model": "grok-voice-transcribe-2.0", "tag": os.path.basename(out.rstrip("/")),
                      "http_status": r.status_code, "cost_usd": round(cost, 6) if r.status_code == 200 else 0})
print(json.dumps(meta))
print(r.text[:2500])
