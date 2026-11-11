import os, subprocess, runpod, json
env = {k: v for k, v in os.environ.items() if k != "INFISICAL_CLIENT_ID"}
runpod.api_key = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "RUNPOD_API_KEY"], capture_output=True, text=True, env=env).stdout.strip()
for p in runpod.get_pods():
    q = runpod.get_pod(p["id"])
    print(p["id"], p.get("name"), q.get("desiredStatus"), "costPerHr=", q.get("costPerHr"), "uptime=", (q.get("runtime") or {}).get("uptimeInSeconds"), q.get("imageName"), q.get("lastStatusChange"))
