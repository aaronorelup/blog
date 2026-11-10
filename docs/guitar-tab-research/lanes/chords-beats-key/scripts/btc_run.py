"""BTC (Bi-directional Transformer for Chord recognition, Park et al., ISMIR 2019), inference on one audio file.

Repository: https://github.com/jayg996/BTC-ISMIR19 at commit 2682317 (cloned to /home/user/gtr/lanes/chords-beats-key/src/BTC-ISMIR19,
left unmodified). This wrapper repeats the inference loop of the repository's test.py (same feature function, same
normalisation with the checkpoint's mean/std, same 108-frame windows, same lab line format '%.3f %.3f %s') with three
changes needed on this box, all in this file:
  1. numpy 2 removed np.float / np.int, which the repository's utils use: they are set to float / int before import.
  2. torch 2.15 loads checkpoints with weights_only=True by default; the BTC checkpoints hold numpy arrays (mean, std),
     so torch.load is called with weights_only=False and map_location='cpu'.
  3. Absolute paths for run_config.yaml and the two checkpoints instead of the repository's relative './test/...'.

Usage (venv-btc, Python 3.11, torch 2.15.0+cpu, librosa 0.11.0):
  python -I btc_run.py --audio <file.wav> --outdir <dir> [--repo <clone>]
Writes chords_btc_majmin.lab (25 classes, btc_model.pt) and chords_btc_largevoca.lab (170 classes,
btc_model_large_voca.pt), timings_btc.json.
"""
import argparse
import json
import os
import sys
import time

REPO = "/home/user/gtr/lanes/chords-beats-key/src/BTC-ISMIR19"


def run(repo, audio, voca, out_lab):
    import numpy as np
    import torch
    from btc_model import BTC_model, HParams
    from utils.mir_eval_modules import audio_file_to_features, idx2chord, idx2voca_chord
    config = HParams.load(os.path.join(repo, "run_config.yaml"))
    if voca:
        config.feature["large_voca"] = True
        config.model["num_chords"] = 170
        model_file = os.path.join(repo, "test", "btc_model_large_voca.pt")
        idx_to_chord = idx2voca_chord()
    else:
        model_file = os.path.join(repo, "test", "btc_model.pt")
        idx_to_chord = idx2chord
    model = BTC_model(config=config.model).to("cpu")
    ck = torch.load(model_file, map_location="cpu", weights_only=False)
    mean, std = ck["mean"], ck["std"]
    model.load_state_dict(ck["model"])
    t = time.perf_counter()
    feature, feature_per_second, song_length_second = audio_file_to_features(audio, config)
    t_feat = time.perf_counter() - t
    feature = feature.T
    feature = (feature - mean) / std
    time_unit = feature_per_second
    n_timestep = config.model["timestep"]
    num_pad = n_timestep - (feature.shape[0] % n_timestep)
    feature = np.pad(feature, ((0, num_pad), (0, 0)), mode="constant", constant_values=0)
    num_instance = feature.shape[0] // n_timestep
    start_time = 0.0
    lines = []
    t = time.perf_counter()
    with torch.no_grad():
        model.eval()
        feature = torch.tensor(feature, dtype=torch.float32).unsqueeze(0)
        for ti in range(num_instance):
            self_attn_output, _ = model.self_attn_layers(feature[:, n_timestep * ti:n_timestep * (ti + 1), :])
            prediction, _ = model.output_layer(self_attn_output)
            prediction = prediction.squeeze()
            for i in range(n_timestep):
                if ti == 0 and i == 0:
                    prev_chord = prediction[i].item()
                    continue
                if prediction[i].item() != prev_chord:
                    lines.append("%.3f %.3f %s\n" % (start_time, time_unit * (n_timestep * ti + i), idx_to_chord[prev_chord]))
                    start_time = time_unit * (n_timestep * ti + i)
                    prev_chord = prediction[i].item()
                if ti == num_instance - 1 and i + num_pad == n_timestep:
                    if start_time != time_unit * (n_timestep * ti + i):
                        lines.append("%.3f %.3f %s\n" % (start_time, time_unit * (n_timestep * ti + i), idx_to_chord[prev_chord]))
                    break
    t_inf = time.perf_counter() - t
    with open(out_lab, "w") as f:
        f.writelines(lines)
    return {"feature_s": round(t_feat, 3), "inference_s": round(t_inf, 3), "n_segments": len(lines),
            "frames_per_second": float(feature_per_second), "song_length_s": float(song_length_second),
            "labels": sorted(set(l.split()[2] for l in lines))}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--repo", default=REPO)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import numpy as np
    np.float = float  # removed in numpy >= 1.24, used by the repository's utils
    np.int = int
    sys.path.insert(0, a.repo)
    import torch
    tim = {"torch": torch.__version__, "torch_threads": torch.get_num_threads(), "import_s": round(time.perf_counter() - t0, 3)}
    for voca, name in ((False, "majmin"), (True, "largevoca")):
        t = time.perf_counter()
        r = run(a.repo, a.audio, voca, os.path.join(a.outdir, "chords_btc_%s.lab" % name))
        r["total_s"] = round(time.perf_counter() - t, 3)
        tim[name] = r
    with open(os.path.join(a.outdir, "timings_btc.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
