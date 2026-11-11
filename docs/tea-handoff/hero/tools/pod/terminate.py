"""terminate pods by id and mark them in PODS.txt after the API confirms they are gone. usage: terminate.py ID... [--reason text]"""
import os, sys, subprocess, time, runpod
env = {k: v for k, v in os.environ.items() if k != "INFISICAL_CLIENT_ID"}
runpod.api_key = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "RUNPOD_API_KEY"], capture_output=True, text=True, env=env).stdout.strip()
F = "/workspace/teahouse_alt/hero_work/PODS.txt"
ids = [a for a in sys.argv[1:] if not a.startswith("--")]
for i in ids:
    runpod.terminate_pod(i)
time.sleep(3)
alive = {p["id"] for p in runpod.get_pods()}
lines = open(F).read().splitlines()
out = []
for l in lines:
    pid = l.split(",")[0].strip()
    if pid in ids:
        state = "STILL LISTED (check!)" if pid in alive else f"TERMINATED {time.strftime('%H:%M %Z')} (API confirms gone)"
        l = ", ".join(l.split(", ")[:4]) + ", " + state
    out.append(l)
open(F, "w").write("\n".join(out) + "\n"); print(open(F).read()); print("alive now:", alive)
