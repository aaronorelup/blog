"""Gap round 2: run the LiveChord beat refiner (PyPI livechord-beat-refiner 0.1.0) on one clip and one prior tracker.

Usage (inside venv-livechord):
  python -I livechord_run.py --audio /home/user/gtr/inputs/S3/S3.wav --outdir <out>/livechord/S3 \
      --prior beat_this_final0|madmom_dbn_downbeat --checkpoint <model.safetensors>

Priors, read from this lane's earlier outputs (nothing is re-run):
  beat_this_final0     out/beat_this/<clip>/final0_beats.txt and final0_downbeats.txt (Beat This! 1.1.0, final0,
                       run r0397)
  madmom_dbn_downbeat  out/madmom/<clip>/downbeats.txt, rows "time<TAB>position in bar" from RNNDownBeatProcessor +
                       DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=100) (madmom 0.16.1); beats = every row,
                       downbeats = rows with position 1
Calls, in this order: livechord_beat_refiner.infer._get_model(checkpoint) (timed: loads the safetensors file into the
model; refine() would do the same on its first call), then refine(audio_path, beats, downbeats,
checkpoint_path=checkpoint) with the package's defaults (threshold 0.5, min_distance_beat 2, min_distance_downbeat 4),
timed with time.perf_counter. refine() never raises: on failure it returns the input with applied=False and a reason,
so both are written out and checked by the caller.
Writes beats_<prior>.txt, downbeats_<prior>.txt (one time per line, as returned) and livechord_<prior>.json.
"""
import argparse
import hashlib
import json
import os
import time

T0 = time.perf_counter()
OUT = "/home/user/gtr/lanes/chords-beats-key/out"


def sha256(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def read_prior(prior, clip):
    if prior == "beat_this_final0":
        bf = os.path.join(OUT, "beat_this", clip, "final0_beats.txt")
        df = os.path.join(OUT, "beat_this", clip, "final0_downbeats.txt")
        beats = [float(x) for x in open(bf).read().split()]
        downbeats = [float(x) for x in open(df).read().split()]
        files = [bf, df]
    elif prior == "madmom_dbn_downbeat":
        f = os.path.join(OUT, "madmom", clip, "downbeats.txt")
        rows = [line.split() for line in open(f) if line.strip()]
        beats = [float(r[0]) for r in rows]
        downbeats = [float(r[0]) for r in rows if int(float(r[1])) == 1]
        files = [f]
    else:
        raise SystemExit("unknown prior " + prior)
    return beats, downbeats, files


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--prior", required=True, choices=["beat_this_final0", "madmom_dbn_downbeat"])
    ap.add_argument("--checkpoint", required=True)
    a = ap.parse_args()
    clip = os.path.basename(a.audio).split(".")[0]
    os.makedirs(a.outdir, exist_ok=True)
    beats, downbeats, files = read_prior(a.prior, clip)

    t = time.perf_counter()
    import torch
    from pathlib import Path
    import livechord_beat_refiner
    from livechord_beat_refiner import infer
    t_import = time.perf_counter() - t

    t = time.perf_counter()
    model = infer._get_model(Path(a.checkpoint))
    t_load = time.perf_counter() - t

    t = time.perf_counter()
    out = infer.refine(a.audio, beats, downbeats, checkpoint_path=a.checkpoint)
    t_refine = time.perf_counter() - t

    with open(os.path.join(a.outdir, "beats_%s.txt" % a.prior), "w") as f:
        f.write("".join("%s\n" % x for x in out["refined_beats"]))
    with open(os.path.join(a.outdir, "downbeats_%s.txt" % a.prior), "w") as f:
        f.write("".join("%s\n" % x for x in out["refined_downbeats"]))
    rec = {
        "clip": clip, "prior": a.prior, "audio": a.audio, "audio_sha256": sha256(a.audio),
        "prior_files": [{"path": p, "sha256": sha256(p)} for p in files],
        "checkpoint": a.checkpoint, "checkpoint_sha256": sha256(a.checkpoint),
        "package_version": getattr(livechord_beat_refiner, "__version__", None), "torch": torch.__version__,
        "torch_threads": torch.get_num_threads(), "model_loaded": model is not None,
        "timings_s": {"import": round(t_import, 3), "model_load": round(t_load, 3), "refine": round(t_refine, 3),
                      "refine_elapsed_sec_reported": out.get("elapsed_sec"),
                      "process_total": round(time.perf_counter() - T0, 3)},
        "applied": out["applied"], "reason": out["reason"],
        "n_beats_in": out["n_beats_in"], "n_beats_out": out["n_beats_out"],
        "n_downbeats_in": out["n_downbeats_in"], "n_downbeats_out": out["n_downbeats_out"],
        "beats_in": beats, "downbeats_in": downbeats,
        "refined_beats": out["refined_beats"], "refined_downbeats": out["refined_downbeats"],
    }
    with open(os.path.join(a.outdir, "livechord_%s.json" % a.prior), "w") as f:
        json.dump(rec, f, indent=1)
    print(json.dumps({k: rec[k] for k in ("clip", "prior", "applied", "reason", "n_beats_in", "n_beats_out",
                                          "n_downbeats_in", "n_downbeats_out", "timings_s")}))
    if not out["applied"]:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
