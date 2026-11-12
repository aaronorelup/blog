"""Run All-In-One (PyPI allin1 1.1.0) on one audio file, stage by stage, and time each stage.

Usage: venv-allin1/bin/python -I allin1_run.py --audio <wav> --outdir <dir> [--model harmonix-all]

This calls the package's own functions in the same order and with the same defaults as allin1.analyze()
(allin1/analyze.py of the 1.1.0 wheel):
  1. allin1.demix.demix([path], demix_dir, 'cpu')       -> runs `<python> -m demucs.separate --out <demix_dir>
                                                           --name htdemucs --device cpu <path>` in a subprocess
  2. allin1.spectrogram.extract_spectrograms(...)        -> madmom spectrograms of the 4 stems (multiprocess=True)
  3. allin1.models.load_pretrained_model(model, 'cpu')   -> downloads/loads the checkpoints from Hugging Face
  4. allin1.helpers.run_inference(...) under torch.no_grad()
  5. allin1.helpers.save_results(result, outdir)         -> allin1's own <name>.json
The stems and spectrograms are deleted afterwards, as analyze() does by default (keep_byproducts=False).
Stage times: time.perf_counter; CPU seconds of this process (resource.RUSAGE_SELF) and of its waited-for children
(RUSAGE_CHILDREN, i.e. the Demucs subprocess and the spectrogram worker processes).
Also writes, from allin1's result: beats.txt (one time per line), downbeats.txt (one time per line),
beat_positions.txt (time<TAB>position), tempo.txt (allin1's bpm), segments.lab (start<TAB>end<TAB>label),
timings.json.
"""
import argparse
import json
import os
import resource
import shutil
import time


def cpu():
    s = resource.getrusage(resource.RUSAGE_SELF)
    c = resource.getrusage(resource.RUSAGE_CHILDREN)
    return s.ru_utime + s.ru_stime, c.ru_utime + c.ru_stime


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--model", default="harmonix-all")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    T = {}

    def stage(name, t0, c0):
        t1 = time.perf_counter()
        s1, ch1 = cpu()
        T[name] = {"wall_s": round(t1 - t0, 3), "cpu_self_s": round(s1 - c0[0], 3), "cpu_children_s": round(ch1 - c0[1], 3)}
        print("[allin1_run]", name, json.dumps(T[name]), flush=True)
        return time.perf_counter(), cpu()

    t0, c0 = time.perf_counter(), cpu()
    t_all = t0
    import torch
    from pathlib import Path
    from allin1.demix import demix
    from allin1.spectrogram import extract_spectrograms
    from allin1.models import load_pretrained_model
    from allin1.helpers import run_inference, save_results
    import allin1
    t0, c0 = stage("import", t0, c0)

    path = Path(os.path.abspath(a.audio))
    demix_dir = Path(os.path.abspath(os.path.join(a.outdir, "demix")))
    spec_dir = Path(os.path.abspath(os.path.join(a.outdir, "spec")))
    device = "cpu"

    demix_paths = demix([path], demix_dir, device)
    t0, c0 = stage("demix_htdemucs_subprocess", t0, c0)

    spec_paths = extract_spectrograms(demix_paths, spec_dir, True)
    t0, c0 = stage("extract_spectrograms", t0, c0)

    model = load_pretrained_model(model_name=a.model, device=device)
    t0, c0 = stage("load_pretrained_model", t0, c0)

    with torch.no_grad():
        result = run_inference(path=path, spec_path=spec_paths[0], model=model, device=device,
                               include_activations=False, include_embeddings=False)
    t0, c0 = stage("run_inference", t0, c0)

    save_results(result, a.outdir)
    t0, c0 = stage("save_results", t0, c0)

    # byproducts removed as analyze() does with keep_byproducts=False
    shutil.rmtree(demix_dir, ignore_errors=True)
    shutil.rmtree(spec_dir, ignore_errors=True)

    T["total_in_script_wall_s"] = round(time.perf_counter() - t_all, 3)
    T["torch_threads"] = torch.get_num_threads()
    T["allin1_version"] = getattr(allin1, "__version__", None)
    T["model"] = a.model

    with open(os.path.join(a.outdir, "beats.txt"), "w") as f:
        f.writelines("%.3f\n" % b for b in result.beats)
    with open(os.path.join(a.outdir, "downbeats.txt"), "w") as f:
        f.writelines("%.3f\n" % b for b in result.downbeats)
    with open(os.path.join(a.outdir, "beat_positions.txt"), "w") as f:
        f.writelines("%.3f\t%d\n" % (b, p) for b, p in zip(result.beats, result.beat_positions))
    with open(os.path.join(a.outdir, "tempo.txt"), "w") as f:
        f.write("%s\n" % result.bpm)
    with open(os.path.join(a.outdir, "segments.lab"), "w") as f:
        f.writelines("%.3f\t%.3f\t%s\n" % (s.start, s.end, s.label) for s in result.segments)
    with open(os.path.join(a.outdir, "timings.json"), "w") as f:
        json.dump(T, f, indent=1)
    print("[allin1_run] done", json.dumps({"bpm": result.bpm, "beats": len(result.beats),
                                          "downbeats": len(result.downbeats), "segments": len(result.segments)}))


if __name__ == "__main__":
    main()
