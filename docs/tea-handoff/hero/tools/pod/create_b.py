"""Plan B: generic RunPod PyTorch image + bootstrap (boot.sh) that installs TRELLIS.2 wheels and weights. usage: create_b.py GPU_ID..."""
import os, sys, base64, subprocess, time, runpod
env = {k: v for k, v in os.environ.items() if k != "INFISICAL_CLIENT_ID"}
runpod.api_key = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "RUNPOD_API_KEY"], capture_output=True, text=True, env=env).stdout.strip()
D = "/workspace/teahouse_alt/hero_work"; tok = open(f"{D}/tools/pod/token").read().strip()
subprocess.run(["tar", "czf", "/tmp/claude-1000/spike_pod.tgz", "-C", f"{D}/tools/pod", "server.py", "trellis_core.py", "boot.sh"], check=True)
b64 = base64.b64encode(open("/tmp/claude-1000/spike_pod.tgz", "rb").read()).decode()
args = f'bash -c "mkdir -p /root/spike && echo {b64} | base64 -d | tar xz -C /root/spike && bash /root/spike/boot.sh"'
for g in sys.argv[1:]:
    for cloud in ("SECURE", "COMMUNITY"):
        try:
            p = runpod.create_pod(name="hero-spike-trellis2-b", image_name="runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404", gpu_type_id=g, cloud_type=cloud,
                                  container_disk_in_gb=80, volume_in_gb=0, ports="8000/http", docker_args=args,
                                  env={"SPIKE_TOKEN": tok, "PIP_BREAK_SYSTEM_PACKAGES": "1"}, support_public_ip=False)
            line = f"{p['id']}, {g} {cloud} (plan B runpod/pytorch + boot.sh), ${p.get('costPerHr')}/h, created {time.strftime('%Y-%m-%d %H:%M %Z')}, RUNNING (booting)\n"
            open(f"{D}/PODS.txt", "a").write(line); print(line); sys.exit(0)
        except Exception as e:
            print("fail", g, cloud, str(e)[:150])
