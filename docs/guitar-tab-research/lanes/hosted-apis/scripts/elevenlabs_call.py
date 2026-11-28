"""ElevenLabs API calls that take audio in: stem separation (POST /v1/music/stem-separation) and speech to text
(POST /v1/speech-to-text). Credits used are measured as the change in the account's character_count
(GET /v1/user/subscription) before and after the call; only that difference is written down, no account details.

Usage:
  python -I elevenlabs_call.py stems <audio> <outdir> [--variation six_stems_v1|two_stems_v1] [--format mp3_44100_192]
  python -I elevenlabs_call.py stt <audio> <outdir> [--model scribe_v2]

USD for the spend cap: the API price page (https://elevenlabs.io/pricing/api, read 2026-11-10) lists no stem
separation rate, so a call is counted at credits_used * 0.00022 USD (22 USD / 100,000 credits, an upper-bound
estimate written down as such) or, for speech to text, at the page's "$0.20 per hour" rate, whichever is larger.
The key is read at run time and sent only in the xi-api-key header.
"""
import argparse, hashlib, json, os, subprocess, sys, time, zipfile
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/scripts")
from getkey import getkey  # noqa: E402
import llm_common  # noqa: E402

USD_PER_CREDIT_EST = 0.00022
ap = argparse.ArgumentParser()
ap.add_argument("mode", choices=["stems", "stt"])
ap.add_argument("audio")
ap.add_argument("out")
ap.add_argument("--variation", default="six_stems_v1")
ap.add_argument("--format", default="mp3_44100_192")
ap.add_argument("--model", default="scribe_v2")
ap.add_argument("--samples", default=None, help="directory for the small JSON record (in git)")
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
data = open(a.audio, "rb").read()
sha = hashlib.sha256(data).hexdigest()
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.audio],
                           capture_output=True, text=True).stdout.strip())
worst = max(dur / 60 * 0.30, 0.05)
llm_common.check_cap("elevenlabs", worst)

key = getkey("ELEVENLABS_API_KEY")
H = {"xi-api-key": key}


def credits():
    r = requests.get("https://api.elevenlabs.io/v1/user/subscription", headers=H, timeout=60)
    return r.json().get("character_count")


c0 = credits()
t0 = time.time()
if a.mode == "stems":
    r = requests.post("https://api.elevenlabs.io/v1/music/stem-separation", headers=H, timeout=1800,
                      params={"output_format": a.format},
                      data={"stem_variation_id": a.variation},
                      files={"file": (os.path.basename(a.audio), data, "audio/wav")})
else:
    r = requests.post("https://api.elevenlabs.io/v1/speech-to-text", headers=H, timeout=600,
                      data={"model_id": a.model, "timestamps_granularity": "word", "tag_audio_events": "true",
                            "diarize": "false"},
                      files={"file": (os.path.basename(a.audio), data, "audio/wav")})
wall = time.time() - t0
c1 = credits()
for _ in range(24):  # the count is updated with a delay: poll up to 120 s until it changes
    if c1 != c0 or r.status_code != 200:
        break
    time.sleep(5)
    c1 = credits()
del key, H
used = (c1 - c0) if (c0 is not None and c1 is not None) else None
rec = {"mode": a.mode, "audio": a.audio, "audio_bytes": len(data), "audio_sha256": sha, "audio_duration_s": dur,
       "http_status": r.status_code, "wall_s": round(wall, 3), "content_type": r.headers.get("content-type"),
       "response_bytes": len(r.content), "credits_used_measured": used,
       "headers_kept": {k: v for k, v in r.headers.items() if k.lower() in ("character-cost", "x-character-count",
                                                                         "request-id", "history-item-id")}}
if a.mode == "stems":
    rec.update({"stem_variation_id": a.variation, "output_format": a.format})
else:
    rec.update({"model_id": a.model, "params": {"timestamps_granularity": "word", "tag_audio_events": True}})
usd = (used or 0) * USD_PER_CREDIT_EST
if a.mode == "stt":
    usd = max(usd, dur / 3600 * 0.20)
rec["cost_usd_counted"] = round(usd, 6)
rec["cost_rule"] = "max(credits_used * 0.00022 USD (estimate), published per-hour rate for STT)"
if r.status_code == 200 and a.mode == "stems":
    zpath = os.path.join(a.out, "stems.zip")
    open(zpath, "wb").write(r.content)
    files = []
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            files.append({"name": info.filename, "bytes": info.file_size})
        z.extractall(os.path.join(a.out, "stems"))
    for f in files:
        p = os.path.join(a.out, "stems", f["name"])
        if os.path.isfile(p):
            pr = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                                 "stream=codec_name,sample_rate,channels,bit_rate:format=duration",
                                 "-of", "json", p], capture_output=True, text=True).stdout
            f["ffprobe"] = json.loads(pr) if pr else None
    rec["zip_files"] = files
elif r.status_code == 200:
    open(os.path.join(a.out, "stt.json"), "w").write(r.text)
else:
    rec["error_body"] = r.text[:2000]
llm_common.log_spend({"service": "elevenlabs", "model": a.mode + ":" + (a.variation if a.mode == "stems" else a.model),
                      "tag": os.path.basename(a.out.rstrip("/")), "http_status": r.status_code,
                      "credits_used": used, "cost_usd": round(usd, 6)})
json.dump(rec, open(os.path.join(a.out, "record.json"), "w"), indent=1)
if a.samples:
    os.makedirs(a.samples, exist_ok=True)
    json.dump(rec, open(os.path.join(a.samples, "record.json"), "w"), indent=1)
    if a.mode == "stt" and r.status_code == 200:
        open(os.path.join(a.samples, "stt.json"), "w").write(r.text)
print(json.dumps({k: rec.get(k) for k in ("mode", "http_status", "wall_s", "credits_used_measured", "cost_usd_counted",
                                           "response_bytes")}))
print(json.dumps(rec.get("zip_files") or rec.get("error_body") or "")[:1500])
