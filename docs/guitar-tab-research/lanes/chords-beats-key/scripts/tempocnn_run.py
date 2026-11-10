"""Run tempo-cnn (PyPI tempocnn 0.0.8) on one audio file with several of its tempo models and its meter model.

Usage: venv-tempocnn/bin/python -I tempocnn_run.py --audio <wav> --outdir <dir> [--models fcn,cnn,...]

Calls the package's own API the way its `tempo` and `meter` console scripts do (tempocnn/commands.py of the 0.0.8 wheel):
  features = tempocnn.feature.read_features(file)              # librosa.load(sr=11025), 40-band mel, as `tempo` does
  TempoClassifier(model).estimate_tempo(features, interpolate=False)   -> what `tempo -m <model> -i <file>` prints
  TempoClassifier(model).estimate_mirex(features, interpolate=False)   -> what `tempo --mirex` writes (t1, t2, s1)
  MeterClassifier('fma2018-meter').estimate_meter(read_features(file, frames=512))  -> what `meter -i <file>` prints
Model aliases resolve inside the package: deeptemp -> deeptemp_k16, deepsquare -> deepsquare_k16,
shallowtemp -> shallowtemp_k6, mazurka -> dt_maz_v_fold0. Model files not in the wheel are fetched by the package
from raw.githubusercontent.com/hendriks73/tempo-cnn/main/tempocnn/models/ into ~/.tempocnn/<version>/ (HOME is
set by the caller). Writes tempo_<model>.txt (the estimate_tempo value), tempocnn.json (all values, MIREX triples,
meter, timings).
"""
import argparse
import json
import os
import time

DEFAULT_MODELS = "fcn,cnn,ismir2018,fma2018,deeptemp,deepsquare,shallowtemp,mazurka"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--models", default=DEFAULT_MODELS)
    ap.add_argument("--no-meter", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    T = {}
    t0 = time.perf_counter()
    import tensorflow as tf
    from tempocnn.classifier import TempoClassifier, MeterClassifier
    from tempocnn.feature import read_features
    import tempocnn.version as V
    T["import_s"] = round(time.perf_counter() - t0, 3)

    t0 = time.perf_counter()
    feats = read_features(a.audio)
    T["read_features_s"] = round(time.perf_counter() - t0, 3)
    out = {"input": os.path.abspath(a.audio), "tempocnn_version": getattr(V, "__version__", None),
           "tensorflow": tf.__version__, "feature_shape": list(feats.shape), "models": {}, "timings": T}
    for m in [x for x in a.models.split(",") if x]:
        rec = {}
        t0 = time.perf_counter()
        clf = TempoClassifier(m)
        rec["load_s"] = round(time.perf_counter() - t0, 3)
        rec["resolved_model_name"] = clf.model_name
        rec["n_params"] = int(clf.model.count_params())
        t0 = time.perf_counter()
        tempo = clf.estimate_tempo(feats, interpolate=False)
        rec["estimate_tempo_s"] = round(time.perf_counter() - t0, 3)
        rec["tempo"] = float(tempo)
        t0 = time.perf_counter()
        t1, t2, s1 = clf.estimate_mirex(feats, interpolate=False)
        rec["estimate_mirex_s"] = round(time.perf_counter() - t0, 3)
        rec["mirex"] = {"t1": float(t1), "t2": float(t2), "s1": float(s1)}
        out["models"][m] = rec
        with open(os.path.join(a.outdir, "tempo_%s.txt" % m), "w") as f:
            f.write("%s\n" % rec["tempo"])
        print(m, json.dumps(rec), flush=True)
    if not a.no_meter:
        t0 = time.perf_counter()
        mc = MeterClassifier("fma2018-meter")
        load_s = round(time.perf_counter() - t0, 3)
        t0 = time.perf_counter()
        meter = mc.estimate_meter(read_features(a.audio, frames=512))
        out["meter"] = {"model": "fma2018-meter", "numerator": int(meter), "load_s": load_s,
                        "estimate_s": round(time.perf_counter() - t0, 3)}
        with open(os.path.join(a.outdir, "meter_fma2018.txt"), "w") as f:
            f.write("%d\n" % int(meter))
        print("meter", json.dumps(out["meter"]), flush=True)
    json.dump(out, open(os.path.join(a.outdir, "tempocnn.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
