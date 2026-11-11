import os, sys, base64, subprocess, json, time, secrets, runpod
env = {k: v for k, v in os.environ.items() if k != "INFISICAL_CLIENT_ID"}
runpod.api_key = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "RUNPOD_API_KEY"], capture_output=True, text=True, env=env).stdout.strip()
D = "/workspace/teahouse_alt/hero_work"
tokf = f"{D}/tools/pod/token"
if not os.path.exists(tokf):
    open(tokf, "w").write(secrets.token_hex(16)); os.chmod(tokf, 0o600)
tok = open(tokf).read().strip()
b64 = base64.b64encode(open(f"{D}/tools/pod/server.py", "rb").read()).decode()
args = f'bash -c "echo {b64} | base64 -d > /tmp/server.py && python3 /tmp/server.py; sleep infinity"'
gpus = sys.argv[1:]
for g in gpus:
    for cloud in ("SECURE", "COMMUNITY"):
        try:
            p = runpod.create_pod(name=f"hero-spike-trellis2", image_name="camenduru/trellis2:latest", gpu_type_id=g, cloud_type=cloud,
                                  container_disk_in_gb=60, volume_in_gb=0, ports="8000/http", docker_args=args,
                                  env={"SPIKE_TOKEN": tok, "HF_HUB_OFFLINE": "1"}, support_public_ip=False)
            price = p.get("costPerHr") or p.get("machine", {}).get("costPerHr")
            line = f"{p['id']}, {g} {cloud}, ${price}/h, created {time.strftime('%Y-%m-%d %H:%M %Z')}, RUNNING (pulling)\n"
            open(f"{D}/PODS.txt", "a").write(line); print(line, json.dumps(p)[:300]); break
        except Exception as e:
            print("fail", g, cloud, str(e)[:200])
    else:
        continue
