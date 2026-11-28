"""aubio 0.4.9 (Ubuntu packages aubio-tools / python3-aubio): `aubio tempo`, `aubio beat` and `aubiotrack` on many clips.

Usage (system Python 3.12, where the Debian python3-aubio module is built):
  /usr/bin/python3.12 -I aubio_run.py --outroot <dir> --clips S3 S4 ...
Each clip: /home/user/gtr/inputs/<id>/<id>.wav. Commands run with default settings (buffer 1024, hop 512, the file's own
sample rate):
  /usr/bin/python3.12 /usr/bin/aubio tempo <wav>   -> one line "<bpm> bpm"
  /usr/bin/python3.12 /usr/bin/aubio beat <wav>    -> one beat time (s) per line
  aubiotrack -i <wav>                              -> one beat time (s) per line
Writes <outroot>/<id>/{tempo.txt, beats_aubio_beat.txt, beats_aubiotrack.txt} and <outroot>/timings.json
(wall-clock of each command, time.perf_counter around subprocess.run).
"""
import argparse
import json
import os
import subprocess
import time

AUBIO = ["/usr/bin/python3.12", "/usr/bin/aubio"]


def run(cmd):
    t = time.perf_counter()
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p, round(time.perf_counter() - t, 3)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outroot", required=True)
    ap.add_argument("--clips", nargs="+", required=True)
    a = ap.parse_args()
    tim = {}
    for cid in a.clips:
        wav = "/home/user/gtr/inputs/%s/%s.wav" % (cid, cid)
        od = os.path.join(a.outroot, cid)
        os.makedirs(od, exist_ok=True)
        rec = {}
        p, dt = run(AUBIO + ["tempo", wav])
        open(os.path.join(od, "tempo.txt"), "w").write(p.stdout)
        rec["aubio_tempo_s"] = dt
        rec["tempo_stdout"] = p.stdout.strip().splitlines()[-1] if p.stdout.strip() else None
        rec["tempo_rc"] = p.returncode
        p, dt = run(AUBIO + ["beat", wav])
        lines = [l.strip() for l in p.stdout.splitlines() if l.strip()]
        open(os.path.join(od, "beats_aubio_beat.txt"), "w").write("\n".join(lines) + "\n")
        rec["aubio_beat_s"] = dt
        rec["aubio_beat_n"] = len(lines)
        rec["beat_rc"] = p.returncode
        p, dt = run(["aubiotrack", "-i", wav])
        lines = [l.strip() for l in p.stdout.splitlines() if l.strip()]
        open(os.path.join(od, "beats_aubiotrack.txt"), "w").write("\n".join(lines) + "\n")
        rec["aubiotrack_s"] = dt
        rec["aubiotrack_n"] = len(lines)
        rec["aubiotrack_rc"] = p.returncode
        tim[cid] = rec
        print(cid, json.dumps(rec), flush=True)
    with open(os.path.join(a.outroot, "timings.json"), "w") as f:
        json.dump(tim, f, indent=1)


if __name__ == "__main__":
    main()
