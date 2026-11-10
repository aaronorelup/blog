"""List the Gemini API models this key can see (GET v1beta/models), save names and limits as JSON.

The key is read at run time from the key store and sent only in the x-goog-api-key header; it is never printed or
written anywhere. Usage: python gemini_list_models.py <out.json>
"""
import json, os, sys
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
from getkey import getkey  # noqa: E402

out = sys.argv[1]
key = getkey("GEMINI_API_KEY")
models, token = [], None
while True:
    params = {"pageSize": 1000}
    if token:
        params["pageToken"] = token
    r = requests.get("https://generativelanguage.googleapis.com/v1beta/models", params=params,
                     headers={"x-goog-api-key": key}, timeout=60)
    print("HTTP", r.status_code)
    r.raise_for_status()
    j = r.json()
    models += j.get("models", [])
    token = j.get("nextPageToken")
    if not token:
        break
keep = ["name", "version", "displayName", "description", "inputTokenLimit", "outputTokenLimit",
        "supportedGenerationMethods", "thinking"]
slim = [{k: m.get(k) for k in keep if k in m} for m in models]
with open(out, "w") as f:
    json.dump(slim, f, indent=1)
print(len(slim), "models")
for m in slim:
    print(m["name"], "|", m.get("displayName"), "|", m.get("inputTokenLimit"), "|",
          ",".join(m.get("supportedGenerationMethods", [])))
