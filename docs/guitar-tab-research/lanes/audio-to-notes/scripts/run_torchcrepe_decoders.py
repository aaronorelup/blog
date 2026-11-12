"""torchcrepe 0.0.24 'tiny' on a few clips with each of its decoders (viterbi = default, weighted_argmax, argmax),
everything else as in run_f0.py. usage: python run_torchcrepe_decoders.py <outdir> <clip,clip,...>"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import mono_path, write_f0_csv
import numpy as np, soundfile as sf, torch, torchcrepe
import torchaudio.functional as AF
torch.set_num_threads(2)
out = sys.argv[1]; clips = sys.argv[2].split(","); os.makedirs(out, exist_ok=True)
rec = {}
for clip in clips:
    y, sr = sf.read(mono_path(clip), dtype="float32", always_2d=True)
    x = AF.resample(torch.from_numpy(y.mean(axis=1))[None], sr, 16000)
    for name in ("viterbi", "weighted_argmax", "argmax"):
        t0 = time.perf_counter()
        p, per = torchcrepe.predict(x, 16000, hop_length=160, fmin=50.0, fmax=2006.0, model="tiny",
                                    decoder=getattr(torchcrepe.decode, name), return_periodicity=True,
                                    batch_size=512, device="cpu")
        p = p[0].numpy(); c = per[0].numpy()
        os.makedirs(os.path.join(out, name), exist_ok=True)
        write_f0_csv(os.path.join(out, name, f"{clip}.f0.csv"), np.arange(len(p)) * 0.01, p, c)
        rec[f"{clip}/{name}"] = {"seconds": round(time.perf_counter() - t0, 3), "frames_ge_1500hz": int((p >= 1500).sum()), "n": len(p)}
        print(clip, name, rec[f"{clip}/{name}"], flush=True)
json.dump(rec, open(os.path.join(out, "timings.json"), "w"), indent=1)
