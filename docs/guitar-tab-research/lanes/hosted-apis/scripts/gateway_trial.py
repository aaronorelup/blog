"""One call through the Vercel AI Gateway (OpenAI-compatible Chat Completions, https://ai-gateway.vercel.sh/v1) with
one audio or video file sent inline as a `file` part (data URL), JSON output by schema (response_format json_schema).

Usage:
  python -I gateway_trial.py --model google/gemini-4-carbon --media <file> --mime audio/wav --prompt <txt> \
      --schema <json> --out <dir> [--effort low|medium|high] [--max-tokens 24576]

Writes into <dir>: request.json (body with the base64 replaced by sha256 and size), response.json (raw body),
answer.json (parsed JSON answer) or answer.txt, meta.json (status, wall-clock, usage, cost). The key is read from
the key store at run time and sent only in the Authorization header.

Prices (USD per token) are read from the gateway's own model list, https://ai-gateway.vercel.sh/v1/models
(public, no key), at run time, and stored in meta.json; the response's own cost field is stored when present.
"""
import argparse, base64, hashlib, json, os, subprocess, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/scripts")
from getkey import getkey  # noqa: E402
import llm_common  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True)
ap.add_argument("--media", required=True)
ap.add_argument("--mime", required=True)
ap.add_argument("--prompt", required=True)
ap.add_argument("--schema", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--effort", default=None)
ap.add_argument("--max-tokens", type=int, default=24576)
ap.add_argument("--service", default="vercel-ai-gateway")
ap.add_argument("--only", default=None, help="comma list of gateway providers to allow (providerOptions.gateway.only)")
ap.add_argument("--schema-in-prompt", action="store_true", help="for models without response_format: append the schema to the prompt")
a = ap.parse_args()

os.makedirs(a.out, exist_ok=True)
cat = requests.get("https://ai-gateway.vercel.sh/v1/models", timeout=60).json()
entry = next((m for m in cat.get("data", []) if m.get("id") == a.model), None)
if not entry:
    raise SystemExit("model not in gateway list: " + a.model)
pr = entry.get("pricing") or {}
pin, pout = float(pr.get("input") or 0), float(pr.get("output") or 0)
if pin <= 0 or pout <= 0:
    raise SystemExit("no token price in the gateway list for " + a.model + ": " + json.dumps(pr))

data = open(a.media, "rb").read()
sha = hashlib.sha256(data).hexdigest()
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.media],
                           capture_output=True, text=True).stdout.strip())
kind = "video" if a.mime.startswith("video/") else "audio"
est_in = int(dur * (300 if kind == "video" else 32)) + 2000
worst = est_in * pin + a.max_tokens * pout
s_before, _ = llm_common.check_cap(a.service, worst)

prompt = open(a.prompt).read()
schema = json.load(open(a.schema))
fname = os.path.basename(a.media)
body = {
    "model": a.model,
    "messages": [{"role": "user", "content": [
        {"type": "file", "file": {"filename": fname, "file_data": "<data url>"}},
        {"type": "text", "text": prompt}]}],
    "response_format": {"type": "json_schema", "json_schema": {"name": "answer", "schema": schema}},
    "max_tokens": a.max_tokens,
}
if a.effort:
    body["reasoning"] = {"effort": a.effort}
if a.only:
    body["providerOptions"] = {"gateway": {"only": a.only.split(","), "order": a.only.split(",")}}
if a.schema_in_prompt:
    del body["response_format"]
    body["messages"][0]["content"][1]["text"] = prompt + "\nAnswer with JSON only, no other text, matching this JSON schema:\n" + json.dumps(schema)
logged = json.loads(json.dumps(body))
logged["messages"][0]["content"][0]["file"]["file_data"] = f"<data:{a.mime};base64 of {fname}: {len(data)} bytes, sha256 {sha}>"
json.dump(logged, open(os.path.join(a.out, "request.json"), "w"), indent=1)
body["messages"][0]["content"][0]["file"]["file_data"] = f"data:{a.mime};base64," + base64.b64encode(data).decode()

key = getkey("VERCEL_AI_GATEWAY_API_KEY")
t0 = time.time()
r = requests.post("https://ai-gateway.vercel.sh/v1/chat/completions", json=body, timeout=900,
                  headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
wall = time.time() - t0
del key
open(os.path.join(a.out, "response.json"), "w").write(r.text)
meta = {"service": a.service, "model": a.model, "media": a.media, "media_bytes": len(data), "media_sha256": sha,
        "media_duration_s": dur, "mime": a.mime, "http_status": r.status_code, "wall_s": round(wall, 3),
        "reasoning_effort": a.effort, "max_tokens": a.max_tokens,
        "price_usd_per_token": {"input": pin, "output": pout},
        "price_source": "https://ai-gateway.vercel.sh/v1/models entry 'pricing' (read at run time)",
        "response_headers": {k: v for k, v in r.headers.items() if k.lower().startswith(("x-vercel-ai", "x-ai-gateway", "x-gateway"))}}
try:
    j = r.json()
except ValueError:
    j = {}
u = j.get("usage") or {}
if u:
    pt = int(u.get("prompt_tokens") or 0)
    ct = int(u.get("completion_tokens") or 0)
    rt = int(((u.get("completion_tokens_details") or {}).get("reasoning_tokens")) or 0)
    computed = pt * pin + ct * pout
    meta.update({"usage": u, "cost_usd_computed": round(computed, 6),
                 "cost_formula": "prompt_tokens * input price + completion_tokens * output price "
                                 "(completion_tokens includes reasoning tokens in the OpenAI usage format; "
                                 "reasoning_tokens reported separately: %d)" % rt})
    reported = u.get("cost") if isinstance(u.get("cost"), (int, float)) else None
    if reported is None:
        for k in ("cost", "market_cost"):
            if isinstance(j.get(k), (int, float)):
                reported = j[k]
    meta["cost_usd_reported"] = reported
    cost = max(computed, reported or 0)
    meta["cost_usd"] = round(cost, 6)
    llm_common.log_spend({"service": a.service, "model": a.model, "tag": os.path.basename(a.out.rstrip('/')),
                          "http_status": r.status_code, "usage": u, "cost_usd": round(cost, 6)})
text = ""
ch = (j.get("choices") or [{}])[0]
msg = ch.get("message") or {}
text = msg.get("content") or ""
meta["finish_reason"] = ch.get("finish_reason")
meta["reasoning_text_chars"] = len(msg.get("reasoning") or "")
try:
    meta["final_provider"] = (msg.get("provider_metadata") or {}).get("gateway", {}).get("routing", {}).get("finalProvider")
except AttributeError:
    meta["final_provider"] = None
meta["provider_metadata"] = j.get("provider_metadata") or msg.get("provider_metadata") or j.get("providerMetadata")
meta["output_text_chars"] = len(text)
if text.strip().startswith("```"):
    text = text.strip().strip("`")
    text = text[4:] if text.startswith("json") else text
try:
    ans = json.loads(text)
    json.dump(ans, open(os.path.join(a.out, "answer.json"), "w"), indent=1)
    meta["answer_parsed"] = True
except ValueError:
    open(os.path.join(a.out, "answer.txt"), "w").write(text)
    meta["answer_parsed"] = False
meta["spent_service_before_usd"] = round(s_before, 6)
json.dump(meta, open(os.path.join(a.out, "meta.json"), "w"), indent=1)
print(json.dumps({k: meta.get(k) for k in ("model", "http_status", "finish_reason", "wall_s", "cost_usd",
                                            "cost_usd_reported", "answer_parsed")}))
print("usage:", json.dumps(u))
if r.status_code != 200:
    print(r.text[:2000])
