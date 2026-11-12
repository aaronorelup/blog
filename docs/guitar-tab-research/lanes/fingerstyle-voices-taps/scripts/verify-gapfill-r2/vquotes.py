#!/usr/bin/env python3
"""Check (verifier, round 2) the quotes and source facts that gap round 2 added, against copies fetched 2026-11-12.

Usage: python3 -I vquotes.py <folder of fetched sources>
Every check is (file in the folder, text that must occur). HTML is reduced to text (tags removed, entities decoded);
every file is also checked with whitespace collapsed and with Markdown link markup [text](url) reduced to text and
** removed. Prints FOUND or MISSING per check (and which normalisation found it), then a count.
"""
import html
import json
import re
import sys

D = sys.argv[1]


def variants(name):
    raw = open(f"{D}/{name}", encoding="utf-8", errors="replace").read()
    out = {"raw": raw}
    if name.endswith(".html"):
        t = html.unescape(re.sub(r"<[^>]+>", " ", raw))
        t = re.sub(r"\s+", " ", t)
        out["html-text"] = re.sub(r" ([,.;:)])", r"\1", t).replace("( ", "(")
    ws = re.sub(r"\s+", " ", raw)
    out["whitespace"] = ws
    md = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", ws).replace("**", "")
    out["markdown-text"] = md
    return out


CHECKS = [
    ("ort_threading.html", "By default with intra_op_num_threads=0 or not set, each session will start with the main thread on the 1st core (not affinitized). Then extra threads per additional physical core are created, and affinitized to that core (1 or 2 logical processors)."),
    ("ort_threading.html", "there will be no affinity set to any of the created thread."),
    ("fmp_HRPS.html", "param_list = [ [1024, 256, 0.2, 500, 1.1], [1024, 256, 0.2, 500, 2], [1024, 256, 0.2, 500, 4], [1024, 256, 0.2, 500, 32], ]"),
    ("fmp_HRPS.html", "libfmp.c8.experiment_hrps_parameter(fn_wav, param_list)"),
    ("fmp_HRPS.html", "Fs = 22050 fn_wav"),
    ("fmp_HRPS.html", "N = 1024 H = 512 L_h_sec = 0.2 L_p_Hz = 500 beta = 2"),
    ("dyci2_card_eguitar.md", "| Sample rate (`get_sr`) | 8000 Hz |"),
    ("dyci2_card_eguitar.md", "| Segment length (`get_seglen`) | 7168 samples (896 ms, latency floor) |"),
    ("dyci2_card_eguitar.md", "| Front-end | one log-mel spectrogram: n_fft 2048, hop 512, 128 mel bands, f_min 150 Hz (window of 256 ms at 8 kHz, spectrum up to 4 kHz) |"),
    ("dyci2_card_eguitar.md", "| Exported with | TorchScript, loads with torch 2.4.1 |"),
    ("dyci2_card_eguitar.md", "3.7 ms (Apple Silicon, CPU, 1 thread)"),
    ("dyci2_card_eguitar.md", "PyTorch warns once about `padding='same'` with an even kernel; harmless."),
    ("dyci2_card_eguitar.md", "| Architecture | `v2` |"),
    ("dyci2_card_eguitar.md", "| SHA-256 | `93cfb7a1e6440b57530e464609e038381dc5d1286eb9504cc0d74c894e9c5d1b` |"),
    ("dyci2_card_eguitar.md", "Runs at 8 kHz with a 896 ms segment: noticeably slower to react than the 44.1 kHz models."),
    ("hf_ipt_README.md", "A model takes `(batch, 1, segment_length)` float32 raw audio and returns logits `(batch, num_classes)`; it exports `get_sr()`, `get_seglen()` and `get_classnames()`."),
    ("hf_ipt_README.md", "license: cc-by-nc-4.0"),
    ("libipt_README.md", "TorchScript model loading → resampling buffer → energy gating → softmax → temporal smoothing"),
    ("libipt_README.md", "is downloaded into `libs/libtorch` automatically on first configure if absent"),
    ("libipt_README.md", "libtorch (2.4.1, CPU"),
    ("libipt_README.md", "macOS Apple Silicon (arm64), or Windows x64 (Visual Studio 2022+)"),
    ("libipt_README.md", 'ipt_create("model.ts", IPT_DEVICE_CPU, -60.0, 20)'),
    ("libipt_aabf10b_energy_threshold.h", "if (m_threshold_db <= MINIMUM_THRESHOLD) { return true; }"),
    ("libipt_aabf10b_energy_threshold.h", "static constexpr double MINIMUM_THRESHOLD = -80.0;"),
    ("libipt_aabf10b_model.h", "torch::softmax"),
    ("libipt_aabf10b_ipt_classifier.h", "get_segment_length()"),
    ("libipt_aabf10b_ipt_classifier.h", "double energy_threshold_db = EnergyThreshold::MINIMUM_THRESHOLD"),
    ("ipt_tilde_README.md", "macOS 10.13 or later with an Apple Silicon processor (M1 or later — Intel Macs are not supported), **or** Windows 10/11 on an x64 CPU with AVX2 (any desktop CPU from roughly 2013 onward)"),
    ("ipt_tilde_README.md", "`@period` allows you to throttle the output of ipt~ while keeping leaky integrator smoothing"),
    ("ipt_tilde_README.md", "NEW v1.2.0"),
    ("numpy_1.24.0-notes.html", "The deprecation for the aliases np.object, np.bool, np.float, np.complex, np.str, and np.int is expired"),
    ("tf_RELEASE.md", "`tf.contrib` has been deprecated, and functionality has been either migrated to the core TensorFlow API, to an ecosystem project such as tensorflow/addons or tensorflow/io, or removed entirely."),
    ("qm_plugin_doc.html", "System identifier – vamp:qm-vamp-plugins:qm-onsetdetector"),
    ("qm_plugin_doc.html", "Note Onset Detector analyses a single channel of audio and estimates the onset times of notes within the music – that is, the times at which notes and other audible events begin."),
    ("qm_plugin_doc.html", "The plugin is non-causal, returning all results at the end of processing."),
    ("qm_plugin_doc.html", 'The peak picker does not have a simple threshold level; instead, this parameter controls the required "steepness" of the slopes in the smoothed detection function either side of a peak value, in order for that peak to be accepted as an onset.'),
    ("qm_plugin_doc.html", 'The most versatile method is the default, "Complex Domain"'),
    ("qm_plugin_doc.html", '"Spectral Difference"'),
    ("qm_plugin_doc.html", '"Phase Deviation"'),
    ("qm_plugin_doc.html", '"Broadband Energy Rise"'),
    ("qm_plugin_doc.html", "Adaptive Whitening"),
    ("qm_plugin_doc.html", "The detected note onset times, returned as a single feature with timestamp but no value for each detected note."),
    ("qm_plugin_doc.html", "Smoothed Detection Function"),
    ("qm_plugin_doc.html", "The Note Onset Detector Vamp plugin was written by Chris Duxbury, Juan Pablo Bello and Christian Landone."),
    ("adtlib_setup.py", "install_requires=['numpy','scipy','cython','madmom','fpdf']"),
    ("adtlib_setup.py", "Programming Language :: Python :: 2.7"),
    ("adtlib_setup.py", "from distutils.core import setup"),
    ("adtlib_README.md", "Required Packages"),
    ("adtlib_README.md", "tensorflow"),
    ("adtlib_usage.md", "ADT [-h] [-od {None,dir}] [-o {yes,no}] [-ot {yes,no}] [I [I ...]]"),
    ("adtlib_utils_init.py", "from tensorflow.contrib import rnn"),
    ("adtlib_utils_init.py", "tf.placeholder"),
    ("adtlib_utils_init.py", "tf.variable_scope"),
    ("adtlib_utils_init.py", "tf.nn.bidirectional_dynamic_rnn"),
    ("adtlib_utils_init.py", "tf.train.Saver"),
    ("adtlib_utils_init.py", "with tf.Session() as sess"),
    ("tuttut_README.md", "Converts MIDI files to guitar tabs."),
    ("tuttut_README.md", "It can handle any tuning for any number of strings, and will do the arrangement accordingly."),
    ("tuttut_README.md", "The tool works best for single-channel, single-instrument MIDI files, it might spit out some janky stuff if you throw multi-channel complicated files at it."),
    ("mb_README.md", "set PYTHONPATH='.'"),
    ("mb_README.md", "└── melody_default/"),
    ("mb_README.md", "model_best.ckpt"),
    ("mb_README.md", "https://drive.google.com/drive/folders/1ceIfC1UugZQHPgpEEMkdAF0VhZ1EeLl3"),
    ("mb_README.md", "No gpu is needed for evaluation"),
    ("mb_melody_extraction.sh", "--bridge=False"),
    ("mb_melody_extraction.sh", 'model_path="result/finetune/melody_default/model_best.ckpt"'),
    ("mb_requirements.txt", "mido==1.2.10"), ("mb_requirements.txt", "chorder==0.1.2"),
    ("mb_requirements.txt", "miditoolkit==0.1.14"), ("mb_requirements.txt", "scikit_learn==0.24.2"),
    ("mb_requirements.txt", "torchaudio==0.9.0"), ("mb_requirements.txt", "transformers==4.8.2"),
    ("mb_requirements.txt", "numpy>=1.13.3"), ("mb_requirements.txt", "torch>=1.3.1"),
    ("mb_utils.py", "DEFAULT_VELOCITY_BINS = np.linspace(0, 128, 32+1, dtype=np.int)"),
    ("mb_utils.py", "DEFAULT_RESOLUTION = 480"),
    ("mb_utils.py", "def quantize_items(items, ticks=120):"),
    ("mb_utils.py", "def group_items(items, max_time, ticks_per_bar=DEFAULT_RESOLUTION*4):"),
    ("mb_extract.py", "ticks_per_bar = DEFAULT_RESOLUTION * 4 # assume 4/4"),
    ("mb_extract.py", "model.load_state_dict(checkpoint['state_dict'])"),
    ("mb_extract.py", "help='View bridge as melody (True) or accompaniment (False)'"),
    ("mb_model.py", "self.classes = ['Bar', 'Position', 'Pitch', 'Duration']"),
    ("mb_model.py", "self.emb_sizes = [256, 256, 256, 256]"),
    ("mb_model.py", "self.in_linear = nn.Linear(np.sum(self.emb_sizes), bertConfig.d_model)"),
    ("sad_musicldm_env.yml", "python=3.9.16"), ("sad_musicldm_env.yml", "torch==1.13.1+cu116"),
    ("sad_musicldm_env.yml", "torchaudio==0.13.1+cu116"), ("sad_musicldm_env.yml", "torchvision==0.14.1+cu116"),
    ("sad_musicldm_env.yml", "pytorch-lightning==1.9.4"),
    ("sad_onset_detect.yml", "python=3.10"), ("sad_onset_detect.yml", "madmom"),
    ("sad_test_inference.yaml", 'accelerator: "gpu"'), ("sad_test_inference.yaml", "devices: [0]"),
    ("sad_test_inference.yaml", "precision: 32"),
    ("sad_test_inference.yaml", "resume_from_checkpoint: /PATH/TO/PROJECT/msgld_obtb.ckpt"),
    ("sad_test_inference.yaml", 'reload_from_ckpt: "/PATH/TO/PROJECT/vae-ckpt.ckpt"'),
    ("sad_test_inference.yaml", "demucs_input_root: /PATH/TO/PROJECT/test_data"),
    ("sad_README.md", "CUDA_VISIBLE_DEVICES=0 python integrated_train.py --config config/MSG-LD/integrated_musicldm_test_inference.yaml --separate_only"),
    ("sad_README.md", "Set `CUDA_VISIBLE_DEVICES` to select a GPU (optional)."),
    ("sad_README.md", "from collections import MutableSequence"),
    ("sad_README.md", "from collections.abc import MutableSequence"),
    ("sad_README.md", "Edit line 23"),
    ("sad_README.md", "wget https://huggingface.co/ddman1101/Separate-and-Detect/resolve/main/msgld_obtb.ckpt -P checkpoints/"),
    ("sad_README.md", "wget https://zenodo.org/record/10643148/files/vae-ckpt.ckpt"),
    ("sad_README.md", "wget https://zenodo.org/record/10643148/files/hifigan-ckpt.ckpt"),
    ("sad_README.md", "conda env create -f musicldm_env.yml"), ("sad_README.md", "conda env create -f onset_detect.yml"),
    ("sad_onset_README.md", "val_0/stem_0/your_audio.wav"), ("sad_onset_README.md", "val_0/stem_4/your_audio.wav"),
    ("sad_onset_README.md", "timestamp    drum_type"),
    ("sad_onset_README.md", "Drum type (Kick, Snare, Toms, Hi_Hats, Cymbals)"),
    ("sad_onset_README.md", "--output_dir ./transcription_results"),
    ("sad_onset_README.md", "/PATH/TO/PROJECT/inference_outputs/val_0/mix/MusicDelta_Beatles_MIX_from_0.wav"),
    ("sad_integrated_train.py", "run_demucs = mdb_cfg.get('run_demucs', False)"),
    ("sad_hf_README.md", "license: mit"),
    ("basic_pitch_inference_0.4.0.py", 'self.model = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])'),
]
cache = {}
missing = 0
for name, q in CHECKS:
    if name not in cache:
        cache[name] = variants(name)
    hit = [k for k, t in cache[name].items() if q in t or re.sub(r"\s+", " ", q) in t]
    if not hit:
        missing += 1
    print("FOUND  " if hit else "MISSING", name, "|", (hit[0] if hit else "-"), "|", q[:110])
print(f"{len(CHECKS) - missing} of {len(CHECKS)} found; {missing} missing")

# structured facts
p = json.load(open(f"{D}/libfmp_pypi.json"))
print("libfmp 1.3.0:", p["info"]["license"], p["info"]["requires_python"], p["info"]["requires_dist"],
      [(u["filename"], u["upload_time_iso_8601"][:10]) for u in p["urls"]])
m = json.load(open(f"{D}/ipt_models_api.json"))
print("ipt_models:", m["sha"], m.get("lastModified"), "gated", m.get("gated"), (m.get("cardData") or {}).get("license"),
      [(s["rfilename"], s.get("size"), (s.get("lfs") or {}).get("sha256")) for s in m["siblings"]])
m = json.load(open(f"{D}/sad_hf_api.json"))
print("Separate-and-Detect HF:", m["sha"], m.get("lastModified"), (m.get("cardData") or {}).get("license"),
      [(s["rfilename"], s.get("size")) for s in m["siblings"]])
z = json.load(open(f"{D}/zenodo_10643148.json"))
print("Zenodo 10643148:", z["metadata"]["title"], z["metadata"].get("license"), [(f["key"], f["size"]) for f in z["files"]])
a = json.load(open(f"{D}/adtlib_pypi.json"))
print("ADTLib PyPI:", a["info"]["version"], repr(a["info"].get("requires_python")),
      [(f["filename"], f["size"], f["upload_time"][:10], f["packagetype"]) for f in a["urls"]],
      [c for c in a["info"]["classifiers"] if "License" in c or "Python" in c])
t = json.load(open(f"{D}/tf1155_pypi.json"))
print("tensorflow 1.15.5:", sorted({u["python_version"] for u in t["urls"]}), sorted({u["upload_time"][:10] for u in t["urls"]}),
      [r for r in t["info"]["requires_dist"] if r.startswith("numpy")])
dk = json.load(open(f"{D}/docker_python37.json"))
print("docker python:3.7", dk.get("last_updated"), dk.get("tag_status"))
src = open(f"{D}/adtlib_utils_init.py").read().splitlines()
print("ADTLib utils line 16:", src[15].strip())
bp = open(f"{D}/basic_pitch_inference_0.4.0.py").read().splitlines()
print("basic_pitch inference.py line 132:", bp[131].strip())
y = open(f"{D}/sad_test_inference.yaml").read()
print("Separate-and-Detect config run_demucs lines:", [l.strip() for l in y.splitlines() if "run_demucs" in l or "valid_data" in l])
