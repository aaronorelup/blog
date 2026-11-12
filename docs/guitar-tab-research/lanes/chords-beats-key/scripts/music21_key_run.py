"""music21 10.5.2 key analysis on symbolic notes (MIDI), for many clips and two note sources.

Usage (venv-librosa, Python 3.12, music21 10.5.2):
  python -I music21_key_run.py --outroot <dir> --clips S3 S4 ...
Sources per clip:
  truthmidi       /home/user/gtr/inputs/<id>/<id>.mid (the inputs builder's MIDI, i.e. the exact notes)
  basicpitch-onnx /home/user/gtr/lanes/audio-to-notes/out/basic-pitch/onnx-default/<id>.mid (another lane's
                  transcription: Basic Pitch 0.4.0 predict() with the ONNX model and default settings, ledger run r0234)
Each MIDI is read with music21.converter.parse(path). Parts whose instrument is a percussion instrument (MIDI channel
10) are removed before analysis. Methods: s.analyze(<m>) for m in key (music21's default, AardenEssen),
key.krumhansl (Krumhansl-Schmuckler), key.simple, key.bellman, key.temperley.
Writes <outroot>/<id>/key_<source>_<method>.txt ("G major") and m21_<source>.json (key, correlationCoefficient,
the four alternateInterpretations with the highest correlation), and <outroot>/timings.json.
"""
import argparse
import json
import os
import time

METHODS = ["key", "key.krumhansl", "key.simple", "key.bellman", "key.temperley"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outroot", required=True)
    ap.add_argument("--clips", nargs="+", required=True)
    a = ap.parse_args()
    t0 = time.perf_counter()
    import music21
    from music21 import converter, instrument
    tim = {"music21": music21.__version__, "import_s": round(time.perf_counter() - t0, 3)}
    for cid in a.clips:
        srcs = {"truthmidi": "/home/user/gtr/inputs/%s/%s.mid" % (cid, cid),
                "basicpitch-onnx": "/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/onnx-default/%s.mid" % cid}
        od = os.path.join(a.outroot, cid)
        os.makedirs(od, exist_ok=True)
        for src, path in srcs.items():
            if not os.path.exists(path):
                tim["%s/%s" % (cid, src)] = "missing: " + path
                continue
            t = time.perf_counter()
            s = converter.parse(path)
            removed = 0
            for p in list(s.parts):
                ins = p.getInstrument(returnDefault=False)
                ch = getattr(ins, "midiChannel", None) if ins is not None else None
                if ch == 9 or isinstance(ins, instrument.UnpitchedPercussion):
                    s.remove(p)
                    removed += 1
            n_notes = len(s.recurse().notes)
            res = {"source": path, "percussion_parts_removed": removed, "n_note_or_chord_objects": n_notes, "methods": {}}
            for m in METHODS:
                k = s.analyze(m)
                label = "%s %s" % (k.tonic.name.replace("-", "b"), k.mode)
                res["methods"][m] = {"key": label, "correlationCoefficient": round(float(k.correlationCoefficient), 4),
                                     "alternates": [("%s %s" % (x.tonic.name.replace("-", "b"), x.mode), round(float(x.correlationCoefficient), 4))
                                                    for x in k.alternateInterpretations[:4]]}
                with open(os.path.join(od, "key_%s_%s.txt" % (src, m.replace("key.", "") if m != "key" else "default-aarden")), "w") as f:
                    f.write(label + "\n")
            tim["%s/%s_s" % (cid, src)] = round(time.perf_counter() - t, 3)
            with open(os.path.join(od, "m21_%s.json" % src), "w") as f:
                json.dump(res, f, indent=1)
            print(cid, src, {m: res["methods"][m]["key"] for m in METHODS}, flush=True)
    with open(os.path.join(a.outroot, "timings.json"), "w") as f:
        json.dump(tim, f, indent=1)


if __name__ == "__main__":
    main()
