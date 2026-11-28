"""Print the API (endpoints, parameters, returns) that each public Hugging Face Space exposes, via gradio_client
without a token, plus the runtime hardware the Hub reports. No prediction is made.
Usage: python -I hf_space_view.py <out.json> <space_id> [<space_id> ...]
"""
import json, sys
import requests
from gradio_client import Client

out = {}
for sid in sys.argv[2:]:
    rec = {}
    try:
        rt = requests.get(f"https://huggingface.co/api/spaces/{sid}/runtime", timeout=30).json()
        rec["runtime"] = {"stage": rt.get("stage"), "hardware": rt.get("hardware"), "sdk_version": rt.get("sdkVersion")}
        info = requests.get(f"https://huggingface.co/api/spaces/{sid}", timeout=30).json()
        rec["space"] = {k: info.get(k) for k in ("id", "author", "sha", "lastModified", "likes", "sdk", "cardData")}
    except Exception as e:  # noqa: BLE001
        rec["hub_error"] = repr(e)[:300]
    try:
        c = Client(sid, verbose=False)
        rec["api"] = c.view_api(print_info=False, return_format="dict")
    except Exception as e:  # noqa: BLE001
        rec["client_error"] = repr(e)[:500]
    out[sid] = rec
    print("=" * 10, sid, json.dumps(rec.get("runtime")), rec.get("client_error", ""))
    for name, ep in ((rec.get("api") or {}).get("named_endpoints") or {}).items():
        ps = [(p.get("parameter_name"), (p.get("python_type") or {}).get("type"), p.get("parameter_default"))
              for p in ep.get("parameters", [])]
        rs = [((r.get("python_type") or {}).get("type"), r.get("label")) for r in ep.get("returns", [])]
        print("  ", name, "params:", ps, "returns:", rs)
json.dump(out, open(sys.argv[1], "w"), indent=1, default=str)
