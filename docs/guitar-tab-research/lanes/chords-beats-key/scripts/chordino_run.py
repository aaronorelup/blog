"""Chordino and NNLS Chroma "Tuning" (Vamp plugins by M. Mauch) through chord-extractor 0.1.3 and the vamp 1.1.0 host.

Usage (venv-chordext, Python 3.11):
  python -I chordino_run.py --audio <file.wav> --outdir <dir>
chord-extractor ships the plugin library chord_extractor/_lib/nnls-chroma.so and sets VAMP_PATH to it.
Runs:
  1. chord_extractor.extractors.Chordino() with its defaults (useNNLS=1, rollon=1, tuningmode=0 global, whitening=1,
     s=0.7, boostn=0.1) -> .extract(file) loads the file with librosa.load(file) (librosa default: 22050 Hz mono)
     and calls vamp.collect(data, rate, 'nnls-chroma:chordino', parameters=...). Output: chord changes
     (label, timestamp). Written as chords_chordino.lab: each change lasts until the next one, the last one until the
     end of the file.
  2. The same with tuningmode=1 (local tuning) -> chords_chordino_localtuning.lab
  3. vamp.collect(data, rate, 'nnls-chroma:tuning') on the same librosa-loaded audio -> nnls_tuning.json (raw
     output and the concert-pitch value parsed from it).
Timings (time.perf_counter inside this script) -> timings_chordino.json.
"""
import argparse
import json
import os
import re
import time


def to_lab(changes, dur, path):
    # A change that starts at or after the end of the audio file is dropped (Chordino can report a final "N" a few
    # hundred ms after the end of the file, e.g. 24.335 s for the 24.000 s clip S3).
    with open(path, "w") as f:
        for i, c in enumerate(changes):
            end = changes[i + 1].timestamp if i + 1 < len(changes) else dur
            end = min(end, dur)
            if c.timestamp >= end:
                continue
            f.write("%.3f\t%.3f\t%s\n" % (c.timestamp, end, c.chord))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import librosa
    import vamp
    from chord_extractor.extractors import Chordino, TuningMode
    tim = {"import_s": round(time.perf_counter() - t0, 3), "VAMP_PATH": os.environ.get("VAMP_PATH"),
           "librosa": librosa.__version__}
    dur = librosa.get_duration(path=a.audio)

    t = time.perf_counter()
    ch = Chordino().extract(a.audio)
    tim["chordino_default_s"] = round(time.perf_counter() - t, 3)
    to_lab(ch, dur, os.path.join(a.outdir, "chords_chordino.lab"))
    tim["n_changes_default"] = len(ch)
    tim["labels_default"] = sorted(set(c.chord for c in ch))

    t = time.perf_counter()
    ch2 = Chordino(tuning_mode=TuningMode.LOCAL).extract(a.audio)
    tim["chordino_localtuning_s"] = round(time.perf_counter() - t, 3)
    to_lab(ch2, dur, os.path.join(a.outdir, "chords_chordino_localtuning.lab"))
    tim["n_changes_localtuning"] = len(ch2)

    t = time.perf_counter()
    data, rate = librosa.load(a.audio)
    out = vamp.collect(data, rate, "nnls-chroma:tuning")
    tim["nnls_tuning_s"] = round(time.perf_counter() - t, 3)
    raw = json.loads(json.dumps(out, default=lambda o: o.tolist() if hasattr(o, "tolist") else str(o)))
    hz = None
    try:
        first = out["list"][0]
        lab = first.get("label", "")
        m = re.search(r"(\d+(?:\.\d+)?)\s*Hz", lab)
        if m:
            hz = float(m.group(1))
        elif "values" in first and len(first["values"]):
            hz = float(first["values"][0])
    except Exception as e:  # noqa
        tim["nnls_tuning_parse_error"] = repr(e)
    with open(os.path.join(a.outdir, "nnls_tuning.json"), "w") as f:
        json.dump({"tuning_hz": hz, "raw": raw, "call": "vamp.collect(librosa.load(file) [22050 Hz mono], 'nnls-chroma:tuning')"}, f, indent=1)
    tim["tuning_hz"] = hz
    with open(os.path.join(a.outdir, "timings_chordino.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
