"""Read the ElevenLabs account's subscription (tier, credit limit and use) with GET /v1/user/subscription (no charge).
Only plan fields are kept; nothing that identifies the account is written. The key is read at run time and sent only
in the xi-api-key header. Usage: python -I elevenlabs_account.py <out.json>
"""
import json, os, sys
import requests

sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
from getkey import getkey  # noqa: E402

key = getkey("ELEVENLABS_API_KEY")
r = requests.get("https://api.elevenlabs.io/v1/user/subscription", headers={"xi-api-key": key}, timeout=60)
del key
j = r.json() if r.headers.get("content-type", "").startswith("application/json") else {"text": r.text[:300]}
keep = ["tier", "character_count", "character_limit", "status", "billing_period", "currency",
        "next_character_count_reset_unix", "can_extend_character_limit", "max_character_limit_extension"]
slim = {k: j.get(k) for k in keep if k in j}
slim["http_status"] = r.status_code
if r.status_code != 200:
    slim["error"] = j
json.dump(slim, open(sys.argv[1], "w"), indent=1)
print(json.dumps(slim))
