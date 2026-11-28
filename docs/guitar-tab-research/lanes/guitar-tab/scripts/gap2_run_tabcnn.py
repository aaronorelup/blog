"""gap round 2 (guitar-tab lane): run TabCNN weights published by others on one audio file.

Two backends, both decoded to notes the same way as this lane's SynthTab runs (amt-tools 0.3.2 from PyPI:
TablatureWrapper + StackedNoteTranscriber, GuitarProfile tuning E2 A2 D3 G3 B3 E4, 19 frets):

  --backend amt   a whole pickled amt-tools TabCNN model (Zenodo record 11406378,
                  `best_TabCNN_tablature_trancription_model`), opened with torch.load(weights_only=True) and an
                  allow-list of the classes the pickle names (listed with pickletools beforehand, without loading).
                  Features: amt_tools.features.CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)
                  on amt_tools.tools.load_normalize_audio(path, 22050), as in scripts/run_synthtab_tabcnn.py.
                  Inference: amt_tools.inference.run_offline.
  --backend onnx  an ONNX file from huggingface.co/cstr/tabcnn-onnx, run with ONNX Runtime (CPU).
                  --front card: the front-end the model card gives for the variant (--variant):
                     gpfx:    |librosa.cqt(y, sr=22050, hop_length=512, n_bins=192, bins_per_octave=24)|,
                              librosa.amplitude_to_db(C, ref=np.max), then (x - min) / (max - min + 1e-9)
                     vanilla: y = librosa.util.normalize(y), then the raw CQT magnitude
                     (y from librosa.load(path, sr=22050, mono=True)).
                  --front amt: the amt-tools features above (used only to compare the ONNX export with the
                     pickled model on identical input).
                  --front prep: (vanilla only) the order of the training repository's preprocess.py
                     (onnx_runtime_dart tool/tabcnn, commit 7bdf47d): scipy.io.wavfile.read at the file's rate,
                     librosa.util.normalize, librosa.resample(orig_sr, 22050), then the raw CQT magnitude.
                  Windows: 9 frames, 4 zero frames padded on each side, input [N, 192, 9, 1].
                  Output [N, 6, 21] log-softmax; card: "class 0 = closed, class k = fret k-1"; string index 0 is
                  taken as the lowest string (checked against the pickled model, see trials.md).

Writes <prefix>.frames.csv (time, fret of string 1..6, -1 = silent), <prefix>.gtreval.json (notes with onset, offset,
pitch, string, fret; tuning_midi, capo 0) and prints timings and, for ONNX, the CPUs each thread may run on.
"""
import argparse, collections, json, os, time, glob
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("--backend", choices=["amt", "onnx"], required=True)
ap.add_argument("--model", required=True)
ap.add_argument("--variant", choices=["gpfx", "vanilla"], default="gpfx")
ap.add_argument("--front", choices=["card", "amt", "prep"], default="card")
ap.add_argument("audio"); ap.add_argument("outprefix")
a = ap.parse_args()
ncpu = len(os.sched_getaffinity(0))

import torch
torch.set_num_threads(max(1, ncpu))
import amt_tools.tools as tools
from amt_tools.tools.instrument import GuitarProfile
from amt_tools.features import CQT
from amt_tools.transcribe import ComboEstimator, TablatureWrapper, StackedNoteTranscriber

t0 = time.time()
SR, HOP = 22050, 512


def amt_features(path):
    audio, _ = tools.load_normalize_audio(path, SR)
    dp = CQT(sample_rate=SR, hop_length=HOP, n_bins=192, bins_per_octave=24)
    return dp.process_audio(audio), dp.get_times(audio)          # (1, 192, T), (T,)


if a.backend == "amt":
    from amt_tools.models import TabCNN
    from amt_tools.models.common import SoftmaxGroups
    from amt_tools.inference import run_offline
    import _codecs
    allow = [TabCNN, SoftmaxGroups, GuitarProfile, torch.nn.Sequential, torch.nn.Conv2d, torch.nn.ReLU,
             torch.nn.MaxPool2d, torch.nn.Dropout, torch.nn.Linear, set, collections.OrderedDict, torch.device,
             np.dtype, np.dtypes.Float64DType, np.dtypes.Int64DType, _codecs.encode,
             (np._core.multiarray.scalar, "numpy.core.multiarray.scalar")]   # numpy 2 moved it
    with torch.serialization.safe_globals(allow):
        model = torch.load(a.model, map_location="cpu", weights_only=True)
    model.change_device("cpu") if hasattr(model, "change_device") else None
    model.device = torch.device("cpu"); model.eval()
    profile = model.profile
    t1 = time.time()
    feats, times = amt_features(a.audio)
    est = ComboEstimator([TablatureWrapper(profile=profile), StackedNoteTranscriber(profile=profile)])
    with torch.no_grad():
        pred = run_offline({tools.KEY_FEATS: feats, tools.KEY_TIMES: times}, model, est)
    tab = pred[tools.KEY_TABLATURE]                     # (6, T), index 0 = lowest string, -1 = silent
    stacked = pred[tools.KEY_NOTES]
    t2 = time.time()
    thread_cpus = None
    desc = "Zenodo 11406378 best_TabCNN_tablature_trancription_model (amt-tools TabCNN, torch)"
else:
    import onnxruntime as ort, librosa
    profile = GuitarProfile(tuning=["E2", "A2", "D3", "G3", "B3", "E4"], num_frets=19)
    so = ort.SessionOptions()
    so.intra_op_num_threads = ncpu; so.inter_op_num_threads = 1
    so.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
    sess = ort.InferenceSession(a.model, sess_options=so, providers=["CPUExecutionProvider"])
    t1 = time.time()
    if a.front == "amt":
        f, times = amt_features(a.audio)
        X = f[0]                                         # (192, T)
    elif a.front == "prep":
        from scipy.io import wavfile
        sr0, y = wavfile.read(a.audio)
        y = librosa.util.normalize(y.astype(float))
        y = librosa.resample(y, orig_sr=sr0, target_sr=SR)
        X = np.abs(librosa.cqt(y, hop_length=HOP, sr=SR, n_bins=192, bins_per_octave=24))
        times = librosa.frames_to_time(np.arange(X.shape[1]), sr=SR, hop_length=HOP)
    else:
        y, _ = librosa.load(a.audio, sr=SR, mono=True)
        if a.variant == "vanilla":
            y = librosa.util.normalize(y)
        C = np.abs(librosa.cqt(y, sr=SR, hop_length=HOP, n_bins=192, bins_per_octave=24))
        if a.variant == "gpfx":
            X = librosa.amplitude_to_db(C, ref=np.max)
            X = (X - X.min()) / (X.max() - X.min() + 1e-9)
        else:
            X = C
        times = librosa.frames_to_time(np.arange(X.shape[1]), sr=SR, hop_length=HOP)
    T = X.shape[1]
    Xp = np.pad(X.astype(np.float32), ((0, 0), (4, 4)))
    win = np.lib.stride_tricks.sliding_window_view(Xp, 9, axis=1)       # (192, T, 9)
    batch = np.ascontiguousarray(np.transpose(win, (1, 0, 2))[..., None])  # (T, 192, 9, 1)
    iname = sess.get_inputs()[0].name
    outs = []
    for s in range(0, T, 512):
        outs.append(sess.run(None, {iname: batch[s:s + 512]})[0])
    logp = np.concatenate(outs, 0)                       # (T, 6, 21)
    cls = logp.argmax(-1)                                # (T, 6)
    tab = np.where(cls == 0, -1, cls - 1).T.astype(int)   # (6, T), index 0 = lowest string
    est = ComboEstimator([TablatureWrapper(profile=profile), StackedNoteTranscriber(profile=profile)])
    pred = est.process_track({tools.KEY_TABLATURE: tab, tools.KEY_TIMES: times})
    stacked = pred[tools.KEY_NOTES]
    t2 = time.time()
    thread_cpus = sorted({open(p).read().split("Cpus_allowed_list:")[1].split()[0]
                          for p in glob.glob(f"/proc/{os.getpid()}/task/*/status")})
    nthreads = len(glob.glob(f"/proc/{os.getpid()}/task/*"))
    desc = f"cstr/tabcnn-onnx {os.path.basename(a.model)} (ONNX Runtime {ort.__version__}, front-end {a.front}" + \
           (f", {a.variant})" if a.front == "card" else ")")

tun = profile.get_midi_tuning()
with open(a.outprefix + ".frames.csv", "w") as fh:
    fh.write("time,s1,s2,s3,s4,s5,s6\n")
    for j, t in enumerate(times):
        fh.write(f"{t:.6f}," + ",".join(str(int(tab[5 - k, j])) for k in range(6)) + "\n")
notes = []
for idx, key in enumerate(sorted(stacked.keys())):
    pitches, intervals = stacked[key]
    for p, (on, off) in zip(pitches, intervals):
        midi = int(round(float(p)))
        notes.append({"onset": round(float(on), 6), "offset": round(float(off), 6), "pitch": midi,
                      "string": 6 - idx, "fret": int(midi - int(tun[idx]))})
notes.sort(key=lambda n: (n["onset"], -n["string"]))
json.dump({"tool": desc, "tuning_midi": [int(x) for x in tun], "capo": 0, "num_frets": int(profile.get_num_frets()),
           "frame_hop_s": float(times[1] - times[0]), "notes": notes}, open(a.outprefix + ".gtreval.json", "w"), indent=1)
print(f"{desc}: load {t1 - t0:.2f}s, features+inference+decoding {t2 - t1:.2f}s, frames {len(times)}, "
      f"notes {len(notes)}, tuning {list(map(int, tun))}, num_frets {profile.get_num_frets()}, cores {ncpu}"
      + (f", threads {nthreads}, Cpus_allowed_list of the threads {thread_cpus}" if thread_cpus is not None else ""))
