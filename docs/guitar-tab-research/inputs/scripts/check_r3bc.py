#!/usr/bin/env python3
"""check_r3bc.py - read back the R3b and R3c files and write _checks/r3bc_checks.json.

For each clip: ffprobe facts of <id>.mp4, <id>.webm, <id>.wav, <id>.mono.wav and the kept original; WAV sample
counts, peak and RMS level, the correlation of the left and right channels, and the largest difference between
<id>.mono.wav and (L+R)/2 of <id>.wav in 16-bit steps; and the camera cuts inside the excerpt MP4 (ffmpeg scene score
> 0.12, the threshold used for R3a). Reads only; writes the one JSON file.

Usage: python check_r3bc.py INPUTS_DIR
"""
import json
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf

ORIGINALS = {"R3b": "original/BrylieChristopherOxley-guitar-2018-10-06.mp4",
             "R3c": "original/Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm.1080p.vp9.webm"}


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration,bit_rate:stream=codec_type,codec_name,profile,width,height,pix_fmt,"
                          "r_frame_rate,avg_frame_rate,field_order,sample_rate,channels,nb_frames",
                          "-of", "json", path], capture_output=True, text=True, check=True).stdout
    p = json.loads(out)
    return {"duration_s": float(p["format"]["duration"]), "bit_rate": int(p["format"].get("bit_rate", 0) or 0),
            "streams": p["streams"], "bytes": os.path.getsize(path)}


def cuts(path):
    err = subprocess.run(["ffmpeg", "-nostdin", "-v", "info", "-i", path, "-an", "-vf",
                          "scale=320:-1,select='gt(scene,0.12)',showinfo", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return [float(x) for x in re.findall(r"pts_time:([0-9.]+)", err)]


def db(x):
    return round(20 * np.log10(max(float(x), 1e-12)), 2)


def main():
    root = sys.argv[1]
    report = {"what": "read-back of the R3b and R3c files (check_r3bc.py)", "clips": {}}
    for cid in ("R3b", "R3c"):
        d = os.path.join(root, cid)
        r = {f: probe(os.path.join(d, f)) for f in (cid + ".mp4", cid + ".webm", cid + ".wav", cid + ".mono.wav",
                                                    ORIGINALS[cid])}
        st, sr = sf.read(os.path.join(d, cid + ".wav"), dtype="int16", always_2d=True)
        mo, sr2 = sf.read(os.path.join(d, cid + ".mono.wav"), dtype="int16", always_2d=True)
        s = st.astype(np.float64)
        avg = (s[:, 0] + s[:, 1]) / 2
        n = min(len(avg), len(mo))
        r["wav_facts"] = {
            "stereo_frames": int(st.shape[0]), "stereo_channels": int(st.shape[1]), "sample_rate": sr,
            "mono_frames": int(mo.shape[0]), "mono_channels": int(mo.shape[1]), "mono_sample_rate": sr2,
            "duration_s": round(st.shape[0] / sr, 6),
            "peak_dbfs": db(np.max(np.abs(s)) / 32768), "rms_dbfs": db(np.sqrt(np.mean(s ** 2)) / 32768),
            "left_right_correlation": round(float(np.corrcoef(s[:, 0], s[:, 1])[0, 1]), 4),
            "left_minus_right_rms_dbfs": db(np.sqrt(np.mean((s[:, 0] - s[:, 1]) ** 2)) / 32768),
            "mono_vs_half_sum_max_abs_lsb": float(np.max(np.abs(mo[:n, 0].astype(np.float64) - avg[:n]))),
            "samples_at_full_scale": int(np.sum(np.abs(st.astype(np.int32)) >= 32767)),
        }
        r["cuts_in_excerpt_mp4_s"] = cuts(os.path.join(d, cid + ".mp4"))
        report["clips"][cid] = r
    os.makedirs(os.path.join(root, "_checks"), exist_ok=True)
    out = os.path.join(root, "_checks", "r3bc_checks.json")
    with open(out, "w") as f:
        json.dump(report, f, indent=1)
        f.write("\n")
    for cid, r in report["clips"].items():
        print(cid, json.dumps(r["wav_facts"]), "cuts:", r["cuts_in_excerpt_mp4_s"])
    print("wrote", out)


if __name__ == "__main__":
    main()
