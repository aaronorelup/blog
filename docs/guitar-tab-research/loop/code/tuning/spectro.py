#!/usr/bin/env python3
"""spectro.py <video_or_audio> <out.png> --t0 S --t1 S [--notes notes.csv] [--lo 36] [--hi 88] [--width 1600]

A spectrogram of one stretch of the recording's sound on a pitch axis: one row per third of a semitone, MIDI numbers
--lo to --hi (labelled with note names at every C and every 5th semitone), time in seconds on the recording's clock.
With --notes, every note of that list inside the stretch is drawn as a box (onset to offset, at its pitch) so you can
see which notes the sound supports. The sound is read with ffmpeg from the file (a video's audio track is fine).
"""
import argparse, csv, subprocess, sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
SR = 22050


def audio(path, t0, t1):
    cmd = ["ffmpeg", "-nostdin", "-loglevel", "error", "-ss", str(t0), "-t", str(t1 - t0), "-i", path, "-vn", "-ac", "1",
           "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--t0", type=float, required=True); ap.add_argument("--t1", type=float, required=True)
    ap.add_argument("--notes"); ap.add_argument("--lo", type=int, default=36); ap.add_argument("--hi", type=int, default=88)
    ap.add_argument("--width", type=int, default=1600)
    a = ap.parse_args()
    if a.t1 <= a.t0 or a.t1 - a.t0 > 120:
        sys.exit("give a stretch of at most 120 s")
    y = audio(a.src, a.t0, a.t1)
    n_fft, hop = 8192, 256
    y = np.pad(y, (n_fft // 2, n_fft // 2))
    win = np.hanning(n_fft).astype(np.float32)
    nfr = 1 + (len(y) - n_fft) // hop
    frames = np.lib.stride_tricks.as_strided(y, (nfr, n_fft), (y.strides[0] * hop, y.strides[0]))
    S = np.abs(np.fft.rfft(frames * win, axis=1)).T                     # (bins, frames)
    freqs = np.fft.rfftfreq(n_fft, 1 / SR)
    rows = np.arange(a.lo - 0.5, a.hi + 0.5, 1 / 3)                      # pitch rows
    fr = 440.0 * 2 ** ((rows - 69) / 12)
    P = np.vstack([np.interp(fr, freqs, S[:, j]) for j in range(S.shape[1])]).T
    D = 20 * np.log10(P + 1e-6); D -= D.max(); D = np.clip(D, -70, 0)
    tt = a.t0 + np.arange(S.shape[1]) * hop / SR
    w = a.width / 100
    fig, ax = plt.subplots(figsize=(w, 7), dpi=100)
    ax.imshow(D, origin="lower", aspect="auto", cmap="magma", extent=[tt[0], tt[-1], rows[0], rows[-1]])
    if a.notes:
        with open(a.notes) as fh:
            rd = csv.DictReader(fh)
            for r in rd:
                on, off, p = float(r["onset"]), float(r.get("offset") or float(r["onset"]) + 0.3), int(round(float(r["pitch"])))
                if off < a.t0 or on > a.t1 or not (a.lo <= p <= a.hi):
                    continue
                ax.add_patch(plt.Rectangle((on, p - 0.45), off - on, 0.9, fill=False, ec="cyan", lw=0.8))
    ticks = [m for m in range(a.lo, a.hi + 1) if m % 12 == 0 or m % 5 == 0]
    ax.set_yticks(ticks); ax.set_yticklabels([f"{NAMES[m % 12]}{m // 12 - 1} ({m})" for m in ticks], fontsize=7)
    ax.set_xlabel("seconds"); ax.set_title(f"{a.t0:.2f}-{a.t1:.2f} s" + (" with notes (cyan)" if a.notes else ""))
    ax.grid(axis="y", color="white", alpha=0.15, lw=0.5)
    fig.tight_layout(); fig.savefig(a.out); print(a.out)


if __name__ == "__main__":
    main()
