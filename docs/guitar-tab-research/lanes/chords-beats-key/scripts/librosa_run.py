"""librosa 1.0.0: beat tracking, global tempo, tuning offset, and a chroma + Krumhansl-Kessler key baseline.

The key part is a BASELINE WRITTEN FOR THIS LANE (not a librosa function): librosa has no key estimator.

Usage (venv-librosa, Python 3.12):
  python -I librosa_run.py --audio <file.wav> --outdir <dir>

Writes into <outdir>:
  beats.txt          one beat time per line, seconds  (librosa.beat.beat_track(y, sr, units='time'), defaults:
                     hop_length=512, start_bpm=120, tightness=100, trim=True)
  tempo.txt          one number, BPM                  (librosa.feature.tempo(y, sr), default aggregate=np.mean)
  tuning.json        estimate_tuning (fraction of a semitone and cents), on the whole file
  key_baseline.txt   one line, e.g. "G major"
  key_baseline.json  the 24 correlation values
  timings.json       wall-clock of each stage, time.perf_counter inside this script
Audio is loaded with librosa.load(path, sr=22050, mono=True) (librosa's default resampling to 22050 Hz, mono).
"""
import argparse
import json
import os
import time

import numpy as np

# Krumhansl-Kessler key profiles (Krumhansl 1990, "Cognitive Foundations of Musical Pitch"), tonic first.
KK_MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
KK_MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
PC = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]


def kk_key(chroma_mean):
    scores = {}
    for i in range(12):
        for mode, prof in (("major", KK_MAJOR), ("minor", KK_MINOR)):
            scores["%s %s" % (PC[i], mode)] = float(np.corrcoef(chroma_mean, np.roll(prof, i))[0, 1])
    best = max(scores, key=scores.get)
    return best, scores


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import librosa
    tim = {"librosa_version": librosa.__version__, "import_s": round(time.perf_counter() - t0, 3)}

    t = time.perf_counter()
    y, sr = librosa.load(a.audio, sr=22050, mono=True)
    tim["load_resample_s"] = round(time.perf_counter() - t, 3)

    t = time.perf_counter()
    tempo_bt, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
    tim["beat_track_s"] = round(time.perf_counter() - t, 3)
    np.savetxt(os.path.join(a.outdir, "beats.txt"), beats, fmt="%.3f")

    t = time.perf_counter()
    tempo = librosa.feature.tempo(y=y, sr=sr)
    tim["tempo_s"] = round(time.perf_counter() - t, 3)
    tempo_val = float(np.atleast_1d(tempo)[0])
    with open(os.path.join(a.outdir, "tempo.txt"), "w") as f:
        f.write("%.3f\n" % tempo_val)

    t = time.perf_counter()
    tun = float(librosa.estimate_tuning(y=y, sr=sr))
    tim["estimate_tuning_s"] = round(time.perf_counter() - t, 3)
    with open(os.path.join(a.outdir, "tuning.json"), "w") as f:
        json.dump({"estimate_tuning_semitones": tun, "estimate_tuning_cents": round(tun * 100, 2),
                   "call": "librosa.estimate_tuning(y=y, sr=22050) defaults n_fft=2048, resolution=0.01, bins_per_octave=12"}, f, indent=1)

    t = time.perf_counter()
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)  # tuning=None -> librosa estimates it internally
    best, scores = kk_key(chroma.mean(axis=1))
    tim["key_baseline_s"] = round(time.perf_counter() - t, 3)
    with open(os.path.join(a.outdir, "key_baseline.txt"), "w") as f:
        f.write(best + "\n")
    with open(os.path.join(a.outdir, "key_baseline.json"), "w") as f:
        json.dump({"best": best, "method": "mean of librosa.feature.chroma_cqt(y, sr=22050) over the whole file, Pearson correlation "
                   "with the 24 rotations of the Krumhansl-Kessler major and minor profiles, highest wins",
                   "correlations": {k: round(v, 4) for k, v in sorted(scores.items(), key=lambda kv: -kv[1])}}, f, indent=1)

    tim["outputs"] = {"n_beats": int(len(beats)), "beat_track_tempo": float(np.atleast_1d(tempo_bt)[0]),
                      "tempo": tempo_val, "tuning_cents": round(tun * 100, 2), "key_baseline": best}
    with open(os.path.join(a.outdir, "timings.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
