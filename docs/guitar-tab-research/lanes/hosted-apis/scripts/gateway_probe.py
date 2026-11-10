"""Probe which audio- or video-capable models the Vercel AI Gateway key may call (free tier vs restricted):
one text-only request per model ("Reply with the single word ok", max_tokens 16). A restricted model answers HTTP 403
without running; an allowed one costs a few tokens. Usage: python -I gateway_probe.py <out.json> <model> [<model> ...]
The key is read at run time and sent only in the Authorization header.
"""
import json, os, sys, time
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/scripts")
from getkey import getkey  # noqa: E402
import llm_common  # noqa: E402

out, models = sys.argv[1], sys.argv[2:]
cat = {m["id"]: m for m in requests.get("https://ai-gateway.vercel.sh/v1/models", timeout=60).json()["data"]}
llm_common.check_cap("vercel-ai-gateway", 0.01 * len(models))
key = getkey("VERCEL_AI_GATEWAY_API_KEY")
res = []
for m in models:
    t0 = time.time()
    r = requests.post("https://ai-gateway.vercel.sh/v1/chat/completions", timeout=120,
                      headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
                      json={"model": m, "max_tokens": 16,
                            "messages": [{"role": "user", "content": "Reply with the single word ok"}]})
    try:
        j = r.json()
    except ValueError:
        j = {"raw": r.text[:500]}
    rec = {"model": m, "http_status": r.status_code, "wall_s": round(time.time() - t0, 3)}
    if r.status_code == 200:
        u = j.get("usage") or {}
        pr = cat.get(m, {}).get("pricing") or {}
        cost = int(u.get("prompt_tokens") or 0) * float(pr.get("input") or 0) + \
            int(u.get("completion_tokens") or 0) * float(pr.get("output") or 0)
        rec.update({"usage": u, "cost_usd": round(cost, 8),
                    "reply": ((j.get("choices") or [{}])[0].get("message") or {}).get("content")})
        llm_common.log_spend({"service": "vercel-ai-gateway", "model": m, "tag": "probe", "http_status": 200,
                              "usage": u, "cost_usd": round(cost, 8)})
    else:
        e = j.get("error") or {}
        rec["error"] = {"type": e.get("type"), "message": e.get("message")}
    res.append(rec)
    print(json.dumps(rec)[:400])
del key
json.dump(res, open(out, "w"), indent=1)
