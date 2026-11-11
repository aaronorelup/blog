import os, subprocess, json, urllib.request, sys
env = {k: v for k, v in os.environ.items() if k != "INFISICAL_CLIENT_ID"}
key = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "RUNPOD_API_KEY"], capture_output=True, text=True, env=env).stdout.strip()
q = sys.argv[1]
r = urllib.request.Request("https://api.runpod.io/graphql", data=json.dumps({"query": q}).encode(), headers={"Content-Type": "application/json", "Authorization": "Bearer " + key, "User-Agent": "spike-client"})
print(json.dumps(json.load(urllib.request.urlopen(r)), indent=1)[:int(os.environ.get("GQL_MAX","3000"))])
