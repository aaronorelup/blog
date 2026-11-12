"""List the models the xAI and DeepSeek keys can see, with input modalities where the API reports them (no charge).
xAI: GET https://api.x.ai/v1/language-models (and /v1/models). DeepSeek: GET https://api.deepseek.com/models.
Keys are read at run time and sent only in the Authorization header. Usage: python -I list_models_xai_deepseek.py <outdir>
"""
import json, os, sys
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
from getkey import getkey  # noqa: E402

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
res = {}
k = getkey("XAI_API_KEY")
for path in ("/v1/language-models", "/v1/models"):
    r = requests.get("https://api.x.ai" + path, headers={"Authorization": "Bearer " + k}, timeout=60)
    try:
        res["xai" + path] = {"http_status": r.status_code, "body": r.json()}
    except ValueError:
        res["xai" + path] = {"http_status": r.status_code, "text": r.text[:500]}
del k
k = getkey("DEEPSEEK_API_KEY")
r = requests.get("https://api.deepseek.com/models", headers={"Authorization": "Bearer " + k}, timeout=60)
try:
    res["deepseek/models"] = {"http_status": r.status_code, "body": r.json()}
except ValueError:
    res["deepseek/models"] = {"http_status": r.status_code, "text": r.text[:500]}
del k
json.dump(res, open(os.path.join(out, "models_xai_deepseek.json"), "w"), indent=1)
for name, v in res.items():
    print(name, v["http_status"])
    body = v.get("body") or {}
    for m in (body.get("models") or body.get("data") or []):
        print("  ", m.get("id"), "| in:", m.get("input_modalities"), "| out:", m.get("output_modalities"),
              "| prices:", {kk: m.get(kk) for kk in m if "price" in kk})
