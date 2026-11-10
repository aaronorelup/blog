"""CREMA 0.2.0 (PyPI) chord model: crema.analyze.analyze(filename=...) -> JAMS with a 'chord' annotation.

Usage (venv-tf, Python 3.11, tensorflow-cpu 2.12.1, keras 2.12.0, numpy 1.23.5, librosa 0.10.2.post1, pumpp 0.6.0;
crema installed with --no-deps because its metadata asks for the `tensorflow` package and this box reuses the cached
`tensorflow-cpu` 2.12.1 wheel):
  python -I crema_run.py --audio <file.wav> --outdir <dir>
Writes chords_crema.lab ("start<TAB>end<TAB>label"), crema.jams (the whole JAMS document), timings_crema.json.
"""
import argparse
import json
import os
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import tensorflow as tf
    from crema.analyze import analyze
    tim = {"tensorflow": tf.__version__, "import_s": round(time.perf_counter() - t0, 3)}
    t = time.perf_counter()
    jam = analyze(filename=a.audio)
    tim["analyze_s"] = round(time.perf_counter() - t, 3)
    jam.save(os.path.join(a.outdir, "crema.jams"))
    ann = jam.search(namespace="chord")[0]
    iv, labels = ann.to_interval_values()
    with open(os.path.join(a.outdir, "chords_crema.lab"), "w") as f:
        for (s, e), lab in zip(iv, labels):
            f.write("%.3f\t%.3f\t%s\n" % (s, e, lab))
    conf = [o.confidence for o in ann.data]
    tim["outputs"] = {"n_segments": len(labels), "labels": sorted(set(labels)),
                      "confidence_min_max": [float(min(conf)), float(max(conf))] if conf else None,
                      "annotation_metadata": str(ann.annotation_metadata.annotator)[:300]}
    with open(os.path.join(a.outdir, "timings_crema.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
