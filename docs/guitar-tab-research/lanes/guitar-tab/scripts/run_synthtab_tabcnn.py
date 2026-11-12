"""Run a SynthTab TabCNN checkpoint (audio -> per-string fret activations -> tab notes) on one audio file.

Model code: amt-tools 0.3.2 from PyPI (amt_tools.models.TabCNN). The SynthTab checkpoints pickle the class as
'tabcnn.TabCNN' (SynthTab's own copy, demo_embedding/tabcnn.py), which differs from amt-tools' class only by
nn.ReLU(inplace=True) instead of nn.ReLU() (diff checked 2026-11-10). The checkpoint is opened with
torch.load(weights_only=True) and an explicit allow-list of the classes it names (listed by pickletools without
loading), with 'tabcnn.TabCNN' mapped onto amt-tools' TabCNN. No code from the SynthTab repository is imported.

Feature settings copied from SynthTab demo_embedding/evaluate.py: amt_tools.features.CQT(sample_rate=22050,
hop_length=512, n_bins=192, bins_per_octave=24); audio loaded with amt_tools.tools.load_normalize_audio(path, 22050).
Decoding: amt_tools.transcribe.ComboEstimator([TablatureWrapper(profile), StackedNoteTranscriber(profile)])
(the estimator chain FretNet's example uses for TabCNN-style output), run with amt_tools.inference.run_offline.

Writes: <name>.frames.csv (time, then fret of string 1..6, -1 = silent; the model's own frame output),
        <name>.gtreval.json (notes {onset, offset, pitch, string, fret}; glue: stacked index 0 = lowest string =
        string 6, fret = MIDI pitch - open-string pitch of the checkpoint's own GuitarProfile tuning).
"""
import argparse, json, time, collections, sys
import numpy as np, torch
import amt_tools.tools as tools
from amt_tools.models import TabCNN
from amt_tools.models.common import SoftmaxGroups
from amt_tools.tools.instrument import GuitarProfile
from amt_tools.features import CQT
from amt_tools.transcribe import ComboEstimator, TablatureWrapper, StackedNoteTranscriber
from amt_tools.inference import run_offline

ap = argparse.ArgumentParser()
ap.add_argument("ckpt"); ap.add_argument("audio"); ap.add_argument("outprefix")
a = ap.parse_args()
torch.set_num_threads(max(1, len(__import__("os").sched_getaffinity(0))))
allow = [(TabCNN, "tabcnn.TabCNN"), SoftmaxGroups, GuitarProfile, torch.nn.Sequential, torch.nn.Conv2d,
         torch.nn.ReLU, torch.nn.MaxPool2d, torch.nn.Dropout, torch.nn.Linear, set, collections.OrderedDict,
         torch.device, np.dtype, np.dtypes.Float64DType, np.dtypes.Int64DType]
allow.append((np._core.multiarray.scalar, "numpy.core.multiarray.scalar"))   # numpy 2 moved it; the pickle names the old path
import _codecs; allow.append(_codecs.encode)
t0 = time.time()
with torch.serialization.safe_globals(allow):
    model = torch.load(a.ckpt, map_location="cpu", weights_only=True)
model.change_device("cpu") if hasattr(model, "change_device") else None
model.device = torch.device("cpu"); model.eval()
profile = model.profile
t1 = time.time()
audio, _ = tools.load_normalize_audio(a.audio, 22050)
dp = CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)
feats = {tools.KEY_FEATS: dp.process_audio(audio), tools.KEY_TIMES: dp.get_times(audio)}
est = ComboEstimator([TablatureWrapper(profile=profile), StackedNoteTranscriber(profile=profile)])
with torch.no_grad():
    pred = run_offline(feats, model, est)
t2 = time.time()
times = feats[tools.KEY_TIMES]
tab = pred[tools.KEY_TABLATURE]            # (strings, frames): fret or -1, index 0 = lowest string
tun = profile.get_midi_tuning()            # open-string MIDI pitches, lowest first
with open(a.outprefix + ".frames.csv", "w") as fh:
    fh.write("time,s1,s2,s3,s4,s5,s6\n")
    for j, t in enumerate(times):
        frets = [int(tab[5 - k, j]) for k in range(6)]     # string 1 (highest) first
        fh.write(f"{t:.6f}," + ",".join(str(x) for x in frets) + "\n")
notes = []
stacked = pred[tools.KEY_NOTES]
for idx, key in enumerate(sorted(stacked.keys())):
    pitches, intervals = stacked[key]
    for p, (on, off) in zip(pitches, intervals):
        midi = int(round(float(p)))
        notes.append({"onset": round(float(on), 6), "offset": round(float(off), 6), "pitch": midi,
                      "string": 6 - idx, "fret": int(midi - int(tun[idx]))})
notes.sort(key=lambda n: (n["onset"], -n["string"]))
json.dump({"tool": "SynthTab TabCNN checkpoint " + a.ckpt.split("pretrained_models/")[-1], "tuning_midi": [int(x) for x in tun],
           "capo": 0, "num_frets": int(profile.get_num_frets()), "frame_hop_s": float(times[1] - times[0]),
           "notes": notes}, open(a.outprefix + ".gtreval.json", "w"), indent=1)
print(f"load {t1-t0:.2f}s, features+inference+decoding {t2-t1:.2f}s, frames {len(times)}, notes {len(notes)}, "
      f"tuning {list(map(int, tun))}, num_frets {profile.get_num_frets()}, stacked keys {sorted(stacked.keys())}")
