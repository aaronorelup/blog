"""Verifier's copy of scripts/batch_run.py with the output root as an argument (batch_run.py writes into the trial's
out/ folder, which the verifier must not overwrite). Same job command and the same per-job timing.

Usage: python3 -I vbatch.py --plan plan.json --log log.jsonl --outroot <dir>
plan.json: a list of {"tool", "python", "script", "clips": [...], "args": [...], "suffix": ".wav", "tag": "..."}
Each job runs: <python> -I <script> --audio /home/user/gtr/inputs/<clip>/<clip><suffix> --outdir <outroot>/<tool>/<clip> <args>
"""
import argparse
import json
import os
import subprocess
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", required=True)
    ap.add_argument("--log", required=True)
    ap.add_argument("--outroot", required=True)
    a = ap.parse_args()
    for job in json.load(open(a.plan)):
        for clip in job["clips"]:
            wav = "/home/user/gtr/inputs/%s/%s%s" % (clip, clip, job.get("suffix", ".wav"))
            od = os.path.join(a.outroot, job["tool"], clip)
            os.makedirs(od, exist_ok=True)
            tag = job.get("tag", job["tool"])
            cmd = [job["python"], "-I", job["script"], "--audio", wav, "--outdir", od] + job.get("args", [])
            with open(os.path.join(od, tag + ".stdout.txt"), "w") as so, open(os.path.join(od, tag + ".stderr.txt"), "w") as se:
                t = time.perf_counter()
                p = subprocess.Popen(cmd, stdout=so, stderr=se)
                _, status, ru = os.wait4(p.pid, 0)
                wall = time.perf_counter() - t
            rec = {"tool": job["tool"], "tag": tag, "clip": clip, "cmd": cmd, "wall_s": round(wall, 3),
                   "cpu_user_s": round(ru.ru_utime, 3), "cpu_sys_s": round(ru.ru_stime, 3),
                   "max_rss_mb": round(ru.ru_maxrss / 1024.0, 1), "exit_code": os.waitstatus_to_exitcode(status)}
            with open(a.log, "a") as f:
                f.write(json.dumps(rec) + "\n")
            print(json.dumps({k: rec[k] for k in ("tool", "tag", "clip", "wall_s", "max_rss_mb", "exit_code")}), flush=True)


if __name__ == "__main__":
    main()
