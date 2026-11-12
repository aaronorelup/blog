"""Gap round 1 (gapfill-audio-to-notes): write this round's facts into tools.json.

usage: python gap1_update_tools_json.py <tools.json> [samples/onsets-frames/tools_json_facts.json]
Idempotent: sets fields of existing entries by name, adds the new entries once, keeps the file's formatting
(json.dumps(indent=1, ensure_ascii=False), no trailing newline). Every value comes from trials.md / survey.md as
written in gap round 1.
"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path))
by = {t["name"]: t for t in d["tools"]}
G1 = "gap round 1 (gapfill-audio-to-notes, 2026-11-10)"
REFUSAL = ("Permission for this action was denied by the Claude Code auto mode classifier. "
           "Reason: [Code from External].")

# ---- RMVPE and rmvpe-onnx: ran ----
rmvpe_scores = {
    "S1": {"RPA": 0.652, "RCA": 0.652, "voicing_recall": 0.180, "voicing_false_alarm": 0.075, "overall_accuracy": 0.232, "eval_id": "e1478"},
    "S2n": {"RPA": 0.416, "RCA": 0.546, "voicing_recall": 0.347, "voicing_false_alarm": 0.084, "overall_accuracy": 0.315, "eval_id": "e1479"},
    "S2s": {"RPA": 0.383, "RCA": 0.391, "voicing_recall": 0.200, "voicing_false_alarm": 0.022, "overall_accuracy": 0.247, "eval_id": "e1480"},
    "S4 (mix, truth = lead line)": {"RPA": 0.129, "RCA": 0.541, "voicing_recall": 0.515, "voicing_false_alarm": 0.186, "overall_accuracy": 0.297, "eval_id": "e1481"},
    "S4lead": {"RPA": 0.959, "RCA": 0.959, "voicing_recall": 0.992, "voicing_false_alarm": 0.227, "overall_accuracy": 0.905, "eval_id": "e1482"},
    "R1b (--voice lead)": {"RPA": 0.847, "RCA": 0.847, "voicing_recall": 0.942, "voicing_false_alarm": 0.376, "overall_accuracy": 0.748, "eval_id": "e1483"},
}
rmvpe_runs = [
    {
        "run_id": "r0516", "input_id": "S1,S2n,S2s,S4,S4lead,R1b,R2,R3a", "cores": 2, "wall_s": 34.68,
        "peak_mb": 1198.7, "exit_code": 0,
        "output_files": ["/home/user/gtr/lanes/audio-to-notes/out/rmvpe/f0/<clip>.f0.csv"],
        "metrics": {
            "round": G1,
            "command": "scripts/run_rmvpe.py: soundfile.read(clip); RMVPE(model_path=rmvpe.onnx, device='cpu').predict(audio, sr); raw outputs written as time_s,frequency_hz,confidence (no threshold)",
            "cpu_s": 54.9, "slot_wait_s": 0.0, "model_setup_s": 1.383,
            "predict_s_per_clip": {"S1": 16.054, "S2n": 2.295, "S2s": 1.761, "S4": 2.194, "S4lead": 2.444, "R1b": 1.679, "R2": 2.146, "R3a": 1.133},
            "predict_note": "S1 was the first predict() call in the process",
            "f0_scores_conf_threshold_0.03_gtr_eval_0.11.1": rmvpe_scores,
            "bass_voice_RPA": {"S2n": {"RPA": 0.196, "eval_id": "e1484"}, "S2s": {"RPA": 0.008, "eval_id": "e1485"}},
            "frames_conf_ge_0.03_and_ge_0.5": {"S1": [499, 84, 2984], "S2n": [912, 21, 2936], "S2s": [515, 0, 2936], "S4": [1637, 66, 3875], "S4lead": [3008, 2047, 3875], "R1b": [2135, 1655, 2934], "R2": [2905, 1683, 3601], "R3a": [1475, 121, 1800]},
            "median_confidence_in_truth_notes": {"S1": 0.0074, "S2n": 0.0162, "S2s": 0.0116, "S4": 0.0326, "S4lead": 0.7241, "R1b": 0.8685},
            "no_truth_outputs_kept": ["R2", "R3a"],
        },
    },
    {
        "run_id": "r0517", "input_id": "S1", "cores": None, "wall_s": 7.4, "peak_mb": 1007.6, "exit_code": 0,
        "output_files": ["/home/user/gtr/lanes/audio-to-notes/out/rmvpe/cli/S1.csv"],
        "metrics": {
            "round": G1, "nolock": True,
            "command": "rmvpe-onnx predict S1.wav --model rmvpe.onnx --device cpu --csv S1.csv",
            "cpu_s": 10.5,
            "printed": "Threshold 0.03; Frames 2984; Voiced 498 (16.7 %); F0 range 216.3 – 392.8 Hz; Time 2902.0 ms",
        },
    },
]
rmvpe_outputs = [
    "rmvpe-onnx predict(): time (s, hop 160 samples at 16 kHz = 10 ms), frequency (Hz, salience-weighted average of the 9 bins around the peak), confidence (largest of the 360 sigmoid outputs, 0 to 1), activation (frames x 360, 20-cent bins, centres 31.70 to 2005.50 Hz); a frequency in every frame, no voiced flag, no notes",
    "CLI --csv: header time,frequency,confidence; frames below --confidence-threshold (default 0.03) written as 0 Hz; without --csv it only prints a summary",
]
for name in ("RMVPE", "rmvpe-onnx"):
    t = by[name]
    t["tried"] = True
    t["tried_how"] = "local-cpu (rmvpe-onnx 0.2.3, ONNX Runtime 1.31.1, rmvpe.onnx from lj1995/VoiceConversionWebUI)"
    t["runs"] = [r for r in t["runs"] if r.get("run_id") not in ("r0516", "r0517")] + rmvpe_runs
    t["not_run_reason"] = None
    t["for_aaron"] = False
    t["outputs"] = rmvpe_outputs if name == "rmvpe-onnx" else t["outputs"] + [o for o in rmvpe_outputs if o not in t["outputs"]]
    t["constraints_accepted"] = ["model_path", "device (cpu, cuda, dml, rocm, coreml, tensorrt, openvino)",
                                 "CLI --confidence-threshold (default 0.03)",
                                 "no frequency-range, hop, tuning or key input"]
    t["inputs"] = ["audio read with soundfile (CLI help: typically WAV); multichannel downmixed with librosa.to_mono, resampled to 16 kHz inside predict()"]
by["rmvpe-onnx"]["unverified"] = [u for u in by["rmvpe-onnx"].get("unverified", []) if "which files" not in u]
by["rmvpe-onnx"]["license"]["code"]["quote"] = ("Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated "
                                               "documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation "
                                               "the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software")
by["rmvpe-onnx"]["license"]["code"]["url"] = "https://raw.githubusercontent.com/NewComer00/rmvpe-onnx/HEAD/LICENSE"
by["rmvpe-onnx"]["license"]["code"]["note"] = ("three MIT notices in one file (read 2026-11-10): Copyright (c) 2026 NewComer00; Copyright (c) 2023 liujing04, "
                                              "源文雨, Ftps; Copyright (c) 2022 lj1995. PyPI license MIT; requires huggingface-hub and onnxruntime")
by["rmvpe-onnx"]["license"]["weights"] = {
    "name": "rmvpe.onnx in lj1995/VoiceConversionWebUI (361,688,443 bytes, sha256 5370e71a...fa3660fd)",
    "quote": "license: mit",
    "url": "https://huggingface.co/lj1995/VoiceConversionWebUI/raw/main/README.md",
    "note": "the card is front matter only (21 bytes), read 2026-11-10; the wrapper's README credits the model 'Copyright (c) 2022 lj1995 — MIT License'",
}

# ---- tools that still did not run ----
by["CREPE"]["not_run_reason"] = (
    "(corrected in " + G1 + ": the 200 MB disk limit no longer applied.) PyPI has crepe 0.0.16 only as a source archive (16,519 bytes). "
    "Building it on the box stopped with \"ModuleNotFoundError: No module named 'pkg_resources'\" (setup.py line 6), and with the build "
    "constraint setuptools<81 with \"urllib.error.HTTPError: HTTP Error 403: Forbidden\": setup.py downloads its weights from "
    "https://github.com/marl/crepe/raw/models/, which answers 403 to this box (raw.githubusercontent.com serves the same files). "
    "Installing the source with the five weight files put in place (from raw.githubusercontent.com) together with tensorflow==2.15.0 "
    "was refused by the session's permission system: \"" + REFUSAL + "\" Nothing ran. The same CREPE weights ran through torchcrepe "
    "and Essentia's crepe-*-1.pb.")
by["MT3 (Magenta)"]["not_run_reason"] = (
    "(corrected in " + G1 + ": the disk limit no longer applied.) The Colab notebook's install route (git clone magenta/mt3 at 7ecf19d, "
    "then uv pip install \"jax[cpu]\" nest-asyncio pyfluidsynth==1.3.0 -e <clone>) was refused by the session's permission system: \""
    + REFUSAL + "\" Nothing ran. The fallback mt3-pytorch (kunato) was refused the same way. No model variant ran.")
mp = by["mt3-pytorch (kunato)"]
mp["not_run_reason"] = (
    G1 + ": its requirements.txt does not resolve on the box (ddsp 3.3.4 needs crepe>=0.0.11, whose source build fails: "
    "pkg_resources missing, then HTTP 403 from github.com for the weights); the README's usage (InferenceHandler('./pretrained').inference(...)) "
    "run from the clone with device cpu was refused by the session's permission system: \"" + REFUSAL + "\" Nothing ran.")
mp["for_aaron"] = True
mp["callable_via"] = ["python"]
mp["inputs"] = ["audio file path; librosa.load at 16 kHz (inference.py)"]
mp["outputs"] = ["a MIDI file written with note_seq.sequence_proto_to_midi_file (default ./out/<audio file stem>.mid); codec num_velocity_bins=1 and NoteEncodingWithTiesSpec on 256-frame inputs (the MT3 notebook's mt3 settings)"]
mp["constraints_accepted"] = ["valid_programs (other General MIDI programs become bad_words_ids)", "num_beams", "device (default cuda)"]
mp.setdefault("unverified", [])
mp["weights_facts"] = ("pretrained/mt3.pth is a Git LFS object of 183,672,643 bytes, sha256 b8a3807e...3745398f, at "
                       "https://media.githubusercontent.com/media/kunato/mt3-pytorch/master/pretrained/mt3.pth; gudgud1014/MR-MT3 holds a mt3.pth "
                       "with the same size and LFS sha256")
by["MR-MT3"]["not_run_reason"] = (
    "(corrected in " + G1 + ": the disk limit no longer applied.) Not attempted: its inference runs from a clone of the repository, and "
    "running code from cloned repositories was refused twice by the session's permission system in that round (\"[Code from External]\": "
    "the MT3 install and the mt3-pytorch run). As shipped, inference.py calls self.model.cuda() without a device check. Checkpoints "
    "(gudgud1014/MR-MT3): mt3.pth 183,672,643 bytes, slakh_f1_0.65.pth and commu_mt3.pt 183,637,952 bytes each, ten .ckpt files of "
    "582,509,233 to 582,536,411 bytes.")
ym = by["YourMT3+"]
ym["not_run_reason"] = (
    "This lane's anonymous call to the ZeroGPU Space was refused for lack of quota (\"You have exceeded your ZeroGPU quota (90s requested vs. "
    "79s left)...\"). (corrected in " + G1 + ": the disk limit no longer applied, and the default checkpoint, 561,544,628 bytes, fits the round's "
    "4 GB rule.) A local CPU run was not attempted: the code exists only in the Space's git repository, and running code from cloned "
    "repositories was refused twice by the session's permission system in that round (\"[Code from External]\"). No local 2-core runtime is "
    "on record; the hosted-apis lane's calls to mimbres/YourMT3-cpu (r0164 31.18 s, r0245 31.34 s, cpu-basic) are the CPU timings on record.")
ym["unverified"] = [u for u in ym.get("unverified", []) if "no successful call is on record" not in u]
ym.setdefault("corrections", [])
note = ("corrected in " + G1 + ": the entry 'whether the Space returns a successful transcription (no successful call is on record)' was "
        "removed: the hosted-apis lane's call r0112 to mimbres/YourMT3 and r0164 / r0245 to mimbres/YourMT3-cpu returned MIDI (its trials.md)")
if note not in ym["corrections"]:
    ym["corrections"].append(note)
by["Omnizart"]["not_run_reason"] = (
    "(corrected in " + G1 + ": one install attempt was made.) Omnizart 0.5.0 (the last release pinning TensorFlow: tensorflow==2.5.0, "
    "Python >=3.6.1,<3.9) on CPython 3.8.20 fetched by uv: resolved 91 packages (tensorflow 2.5.0, spleeter 2.4.0, librosa 0.8.1, numpy "
    "1.19.5), then stopped after 17.0 s building vamp 1.1.0 from source: \"ModuleNotFoundError: No module named 'numpy'\" (vamp's setup.py "
    "imports numpy, not declared as a build dependency). Nothing installed; music and vocal modes did not run. One attempt only, as the "
    "round allowed.")
jw = by["onsets-and-frames (PyTorch port, jongwook)"]
jw["not_run_reason"] = (
    G1 + ": no pretrained checkpoint is published for it (its README covers training and evaluating your own model, "
    "runs/model/model-100000.pt; a clone at 783ca08 holds no .pt, .pth, .ckpt or .bin file), so Magenta's own checkpoint and "
    "transcribe script were run instead (see 'Onsets and Frames (Magenta)').")

# ---- new entries ----
new = [
    {
        "name": "mt3-infer",
        "kind": "library",
        "what": "Production-ready, unified inference toolkit for the MT3 music transcription model family (PyPI description): one Python API and CLI over vendored MR-MT3, mt3-pytorch and YourMT3 code",
        "url": "https://github.com/openmirlab/mt3-infer",
        "version": "PyPI 0.2.0 (uploaded 2026-07-11); repository HEAD d8cbd287 (git ls-remote, 2026-11-10)",
        "tried": False, "tried_how": None, "runs": [],
        "not_run_reason": G1 + ": added to the survey; not run. The MT3, mt3-pytorch, MR-MT3 and YourMT3+ code could not be run from their repositories (session permission system), and this package, which vendors three of them, was not used in their place.",
        "for_aaron": False,
        "callable_via": ["python", "cli"],
        "inputs": ["audio array and sample rate (transcribe(audio, sr=16000)); CLI mt3-infer transcribe input.wav -o output.mid"],
        "outputs": ["a MIDI object with .save() (description)"],
        "constraints_accepted": ["model: mr_mt3, mt3_pytorch, yourmt3", "device", "auto_filter (MT3-PyTorch instrument-leakage filter)", "no tuning, key or note-range input in the description"],
        "license": {
            "code": {"spdx": "MIT", "quote": "MIT License Copyright (c) 2025 MT3-Infer Contributors",
                     "url": "https://raw.githubusercontent.com/openmirlab/mt3-infer/master/LICENSE",
                     "also": ["This project includes code adapted from the following sources:",
                              "MR-MT3 (https://github.com/gudgud96/MR-MT3) License: MIT",
                              "MT3-PyTorch (https://github.com/kunato/mt3-pytorch) License: No license declared upstream. Vendored code is retained unmodified; see mt3_infer/models/mt3_pytorch/.",
                              "YourMT3 (https://huggingface.co/spaces/mimbres/YourMT3) License: Apache-2.0",
                              "Magenta MT3 (https://github.com/magenta/mt3, Apache-2.0, Google Research) is NOT currently vendored anywhere in this repository"]},
            "weights": {"name": "downloaded on first use from the upstream projects (MR-MT3 176 MB, MT3-PyTorch 176 MB, YourMT3 536 MB per its model table)", "quote": None, "url": None, "note": "which URLs its downloader uses was not read"},
            "training_data": [], "service_terms": []},
        "pricing": None, "handoffs_out": [],
        "unverified": ["which URLs its checkpoint downloader uses (settled by reading its download module)"],
    },
    {
        "name": "yourmt3 (PyPI, third party)",
        "kind": "library",
        "what": "PyPI package 'yourmt3' (summary 'Music Transcription'): YourMT3 model types (YMT3+, YPTF+Single, YPTF+Multi, YPTF+MoE+Multi 1 and 2) with weights from the Hugging Face repo shethjenil/Audio2Midi_Models",
        "url": "https://pypi.org/project/yourmt3/",
        "version": "0.1.4 (uploaded 2025-08-31)",
        "tried": False, "tried_how": None, "runs": [],
        "not_run_reason": G1 + ": added to the survey; not run (as for mt3-infer).",
        "for_aaron": False,
        "callable_via": ["python"],
        "inputs": ["audio file path (model.predict(path, batch_size, progress_callback))"],
        "outputs": ["a MIDI file (the description's Gradio example returns gr.File(label='midi'))"],
        "constraints_accepted": ["model type", "batch size"],
        "license": {
            "code": {"spdx": None, "quote": None, "url": "https://pypi.org/pypi/yourmt3/json", "note": "no license field, no license classifier and no license text in the PyPI metadata (read 2026-11-10)"},
            "weights": {"name": "shethjenil/Audio2Midi_Models (revision 4300d378): YMT3+.pt 185,123,699 bytes and six other files", "quote": None, "url": "https://huggingface.co/shethjenil/Audio2Midi_Models", "note": "no license tag and no card data (Hugging Face API cardData null, 2026-11-10)"},
            "training_data": [], "service_terms": []},
        "pricing": None, "handoffs_out": [],
        "unverified": ["whether its weights are the YourMT3 authors' checkpoints (settled by comparing hashes with the Space's files)"],
    },
]
names = {t["name"] for t in d["tools"]}
for t in new:
    if t["name"] not in names:
        d["tools"].append(t)
    else:
        by[t["name"]].update(t)

# Onsets and Frames (Magenta): filled from the run, if its facts file exists
try:
    oaf = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
except FileNotFoundError:
    oaf = None
if oaf:
    t = by["Onsets and Frames (Magenta)"]
    t.update(oaf)

with open(path, "w") as f:
    f.write(json.dumps(d, indent=1, ensure_ascii=False))
print("tools:", len(d["tools"]))
