"""Run several (tool script, clip) jobs one after another inside ONE gtr-run slot, timing each job separately.

Usage: python3 -I batch_run.py --plan plan.json --log batch_log.jsonl
plan.json: a list of {"tool", "python", "script", "clips": [...], "args": [...], "suffix": ".wav", "tag": "..."}
Each job runs: <python> -I <script> --audio /home/user/gtr/inputs/<clip>/<clip><suffix> --outdir <out>/<tool>/<clip> <args>
and gets one JSON line in the log: wall_s (time.perf_counter around the child), cpu_user_s and cpu_sys_s and
max_rss_mb from os.wait4's rusage of that child (the child and the descendants it waited for), exit code.
stdout/stderr of each job go to <out>/<tool>/<clip>/<tag>.stdout.txt / .stderr.txt.
"""
import argparse
import json
import os
import subprocess
import time

OUT = "/home/user/gtr/lanes/chords-beats-key/out"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", required=True)
    ap.add_argument("--log", required=True)
    a = ap.parse_args()
    plan = json.load(open(a.plan))
    for job in plan:
        for clip in job["clips"]:
            wav = "/home/user/gtr/inputs/%s/%s%s" % (clip, clip, job.get("suffix", ".wav"))
            od = os.path.join(OUT, job["tool"], clip)
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
                   "max_rss_mb": round(ru.ru_maxrss / 1024.0, 1), "exit_code": os.waitstatus_to_exitcode(status),
                   "affinity": sorted(os.sched_getaffinity(0))}
            with open(a.log, "a") as f:
                f.write(json.dumps(rec) + "\n")
            print(json.dumps({k: rec[k] for k in ("tool", "tag", "clip", "wall_s", "max_rss_mb", "exit_code")}), flush=True)


if __name__ == "__main__":
    main()
