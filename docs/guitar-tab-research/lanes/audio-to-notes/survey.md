# Lane 1, audio-to-notes: survey of audio-to-notes, audio-to-MIDI and melody-extraction tools

Agent: docs-audio-to-notes. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from live
sources on 2026-11-10 unless a line says otherwise. This file records facts and quotes only; it does not rank
or recommend anything. The tools were not run by this agent (the try-audio-to-notes agent runs them, see
`trials.md`).

Checked and corrected in place by verify-docs-audio-to-notes on 2026-11-10: every quoted license or terms clause
was re-fetched, call signatures and output formats were re-read in the source code, and facts it added are marked
with their source. The tally and the list of changes are in "Verification log" at the end of this file.

How dates were read:

- "last commit" = the committer date of `HEAD` of the default branch, read from a fresh `git clone --depth 1`
  of `https://github.com/<owner>/<repo>` made on 2026-11-10 (api.github.com is blocked on this box). Script:
  `scripts/repo_facts.sh`.
- "PyPI" = the latest version and the upload time of its first file, read from
  `https://pypi.org/pypi/<package>/json` on 2026-11-10. Script: `scripts/pypi_facts.py`.

The commit heads and PyPI facts read are saved in `samples/docs/repo_heads_2026-11-10.tsv` and
`samples/docs/pypi_2026-11-10.tsv`. Tool sections below appear in the order they were written; their numbers match
the tool list.

Marks in the tool list:

- `RUNNABLE`: looks runnable on a CPU-only Linux box (a pip package, a Linux binary or documented CPU
  inference). It is a pointer for the try agent, checked in each tool's section, not a test result.
- `NOT-CPU-BOX`: the docs point to a GPU, macOS or Windows only, a desktop plugin, or a service.

## Tool list

One line per tool. Dates: PyPI upload of the latest version and the last commit, read 2026-11-10. "Code" and
"weights" give the license names; the quoted clauses are in each tool's section (the section number is the list
number). RUNNABLE / NOT-CPU-BOX are pointers for the try agent, not test results.

### Monophonic pitch (f0) trackers and pitch-to-note wrappers

1. CREPE (`marl/crepe`, Keras/TensorFlow). PyPI `crepe` 0.0.16 (2024-08-19); last commit 2024-08-19; weights branch last changed 2018-05-31. Code MIT; no separate weights license found. RUNNABLE.
2. torchcrepe (`maxrmorrison/torchcrepe`, PyTorch port of CREPE). PyPI 0.0.24 (2025-05-16); last commit 2025-05-16. Code MIT; weights converted from CREPE, inside the MIT repo. RUNNABLE.
3. pYIN: `librosa.pyin` (librosa 1.0.0, 2026-08-11, Python >= 3.12; last commit 2026-11-10; ISC); pYIN Vamp plugin (`c4dm/pyin`, last commit 2020-02-06; GPL-2.0-or-later; has a `notes` output); Tony desktop annotator (`sonic-visualiser/tony`, last commit 2024-07-02; GPL-2.0-or-later). No weights. RUNNABLE (librosa).
4. PESTO (`SonyCSLParis/pesto`). PyPI `pesto-pitch` 2.0.1 (2025-02-18); last commit 2025-10-15. Code LGPL-3.0; weights in the repo. RUNNABLE.
5. RMVPE (`Dream-High/RMVPE`). No PyPI from the authors (a third-party ONNX wrapper `rmvpe-onnx` 0.2.3, MIT, is on PyPI); last commit 2024-01-25. Code Apache-2.0; no weights in the repo (an `rmvpe.pt` exists in `lj1995/VoiceConversionWebUI`, MIT tag; link to the paper's model unconfirmed). RUNNABLE only with weights from elsewhere. Gap round 1: ran here through `rmvpe-onnx` 0.2.3 with `rmvpe.onnx` (`trials.md`).
6. FCPE / torchfcpe (`CNChTu/FCPE`). PyPI `torchfcpe` 0.0.4 (2024-03-06); last commit 2025-10-14. Code MIT; bundled `fcpe_c_v001.pt` in the MIT repo; the paper's DDSP-200K weights on Hugging Face are CC BY-NC-SA 4.0. The README's MIDI export (`extact_midi`) is in the repository's `main` but not in the PyPI 0.0.4 package. RUNNABLE.
7. SwiftF0 (`lars76/swift-f0`, ONNX). PyPI `swift-f0` 0.3.0 (2026-09-25); last commit 2026-09-25. Code MIT; bundled ONNX in the MIT package; training data `lars1234/pitch-benchmark` is tagged CC BY-NC-SA 4.0. Has note segmentation and MIDI export. RUNNABLE (also in-browser via ONNX Runtime Web).
8. PENN / FCNF0++ (`interactiveaudiolab/penn`). PyPI `penn` 1.0.0 (2025-04-02); last commit 2025-04-02. Code MIT; weights `maxrmorrison/fcnf0-plus-plus` (MIT tag). RUNNABLE.
9. aubio (`aubio/aubio`, C + Python, `aubionotes` / `aubiopitch` CLI). PyPI 0.4.9 (2019-02-08); repo `VERSION` 0.5.0-alpha, last commit 2026-04-10. GPL-3.0-or-later. No weights. RUNNABLE (binaries present on the box).
10. Essentia (`MTG/essentia`: PitchYinProbabilistic, PredominantPitchMelodia, MultiPitchKlapuri, PitchCREPE, PitchContourSegmentation, Audio2Midi). PyPI `essentia` / `essentia-tensorflow` 2.1b6.dev1438 (2026-05-19; CPython 3.14 wheels only; 2.1b6.dev1389 of 2025-07-24 is the last with Linux wheels for CPython 3.9 to 3.13); last commit 2026-11-05. Code AGPL-3.0 (commercial license on request); models CC BY-NC-SA 4.0 or CC BY-NC-ND 4.0 depending on the page (all quoted). RUNNABLE.
11. MELODIA Vamp plugin 1.0 (MTG-UPF, Linux 32/64-bit build behind a download form; "free of charge for non-commercial use only") and wrapper `justinsalamon/audio_to_midi_melodia` (last commit 2020-04-03; no LICENSE file). RUNNABLE after the form. The MTG page answered HTTP 403 to the verifier, so its quotes are UNVERIFIED here (section 11).
12. CREPE Notes (`xavriley/crepe_notes`). PyPI `crepe-notes` 0.2.0 (2026-03-13); last commit 2026-03-13. GPL-3.0. Uses CREPE, PESTO, PENN or torchcrepe weights, and madmom's `CNNOnsetProcessor` (madmom model files: CC BY-NC-SA 4.0) unless `--disable-splitting`. Accepts a precomputed f0 CSV (`--f0`) and a tuning offset in cents (`--tuning-offset`). RUNNABLE.

### Polyphonic and multi-instrument note transcription (audio to MIDI)

13. Spotify Basic Pitch (`spotify/basic-pitch`). PyPI 0.4.0 (2024-08-16); last commit 2025-11-13. Code Apache-2.0; model files ship in the package with no separate license file. RUNNABLE.
14. NeuralNote (`DamRsn/NeuralNote`, VST3/AU/Standalone). Last commit 2026-11-07. v2 uses MuScriptor GGUF weights (CC BY-NC 4.0), v1 used Basic Pitch. Code Apache-2.0. Installers for macOS and Windows; Linux build from source. NOT-CPU-BOX (desktop plugin).
15. MT3 (`magenta/mt3`, JAX/T5X). No PyPI release from Magenta (the PyPI name `mt3` belongs to an unrelated outlier-detection package); last commit 2026-10-27. Code Apache-2.0; checkpoints at `gs://mt3/checkpoints` with no license statement found (no license or readme file in a listing of the public bucket). Documented route is Colab (the notebook installs `jax[cuda12]`). To check on CPU.
16. YourMT3+ (GitHub `mimbres/YourMT3` holds README + GPL-3.0 LICENSE, last commit 2024-11-29; code and checkpoints in the Hugging Face Space `mimbres/YourMT3`, card `license: apache-2.0`, last modified 2025-01-31). Callable as a Gradio Space (ZeroGPU hardware; its `/process_audio` returns HTML with the MIDI embedded as a base64 data URL); local run to check.
17. MR-MT3 (`gudgud96/MR-MT3`). Last commit 2024-07-12. Code MIT; weights `gudgud1014/MR-MT3` (MIT tag). Research environment (TensorFlow 2.11 + torch pins). `inference.py` calls `self.model.cuda()` unconditionally. NOT-CPU-BOX as shipped (a code change would be needed).
18. mt3-pytorch (`kunato/mt3-pytorch`). Last commit 2022-05-24. No LICENSE file. To check.
19. MuScriptor (`muscriptor/muscriptor`, Kyutai and Mirelo, arXiv 2607.08168). PyPI `muscriptor` 0.4.0 (2026-10-20); last commit 2026-10-20. Code MIT; weights CC BY-NC 4.0 "supplemented by" specific conditions of use, gated on Hugging Face (free login, automatic approval); small 103M / medium 307M / large 1.4B parameters. Outputs MIDI with beats and bars, JSON or JSONL note events, MusicXML and tab PDFs (with MuseScore 4); the CLI takes an instrument list (`--instruments`). RUNNABLE (`small` per README) with a Hugging Face token.
20. Omnizart (`Music-and-Culture-Technology-Lab/omnizart`: music, vocal, vocal-contour, drum, chord, beat). PyPI 0.6.3 (2026-05-31; 0.6.0 added Python up to 3.14); last commit 2026-05-31. Code MIT; checkpoints release `checkpoints-20211001`, license not stated; the vocal mode downloads Spleeter 2-stem ONNX files from a `k2-fsa/sherpa-onnx` release. PyPI 0.6.3 is a source archive only and requires TensorFlow and madmom. RUNNABLE (to check).
21. Timbre-Trap (`sony/timbre-trap`, multi-pitch). Last commit 2024-05-05. Code MIT; weights in the Space `cwitkowitz/timbre-trap` (no license field). The Space returns audio (a WAV file), not notes, and its runtime stage was `RUNTIME_ERROR` on 2026-11-10. RUNNABLE (to check).
22. Sheet Sage (`chrisdonahue/sheetsage`, melody + chords lead sheet). Last commit 2025-05-13. Code MIT; models and data CC BY-NC-SA 3.0; the README adds that madmom, Jukebox and Melisma "all have additional licensing terms affecting commercial use". Docker (~4 GB); Jukebox mode needs a GPU with at least 12 GB. RUNNABLE without Jukebox (to check).
23. Deep Salience (`rabitt/ismir2017-deepsalience`, melody, bass, multi-f0, vocal weights in repo). Last commit 2019-11-22. MIT. CLI writes a salience `.npz` (default) or tab-separated f0 / multi-f0 files. To check (old Keras 2 imports).

### Piano transcription models

24. Onsets and Frames (`magenta/magenta`, "inactive (archived, read only)", last commit 2026-01-05; PyTorch port `jongwook/onsets-and-frames`, MIT, last commit 2021-07-19). Code Apache-2.0; MAESTRO and E-GMD checkpoints (no license statement found). Writes one `.midi` file per input. To check.
25. ByteDance piano transcription (`qiuqiangkong/piano_transcription_inference`). PyPI 0.0.6 (2025-01-26); last commit 2025-01-26. No LICENSE file (setup.py classifier MIT); weights on Zenodo, CC BY 4.0 (trained on MAESTRO v2, CC BY-NC-SA 4.0). RUNNABLE.
26. Transkun (`Yujia-Yan/Transkun`). PyPI 2.0.1 (2024-09-28); last commit 2024-11-22. MIT; checkpoint shipped in the package. CLI default device CPU. RUNNABLE.
27. hFT-Transformer (`sony/hFT-Transformer`). Last commit 2026-10-28. Code MIT; checkpoints CC BY-NC-SA 4.0 (LICENSE-CHECKPOINTS.md). README lists "GPU" in requirements. To check.
28. Aria-AMT (`EleutherAI/aria-amt`). Last commit 2025-12-16. Code Apache-2.0; checkpoint stored in the `loubb/aria-midi` dataset repo (CC BY-NC-SA 4.0). Python 3.11. Its `transcribe` command starts with `assert cuda_is_available(), "CUDA device not found"` (`amt/run.py`). NOT-CPU-BOX as shipped.
29. Onsets and Velocities (`andres-fr/iamusica_training`). Last commit 2023-08-31. GPL-3.0; 12.7 MB checkpoint in repo. To check.

### Melody extraction and singing-voice note transcription

30. melodyExtraction_JDC (last commit 2019-12-27) and melodyExtraction_SSL (2021-09-14), Keras, MIT. To check.
31. MTANet (`Annmixiu/MTANet`), last commit 2024-05-27, no LICENSE file.
32. SOME (`openvpi/SOME`, last commit 2026-03-07, MIT) and its successor GAME (`openvpi/GAME`, last commit 2026-10-25, MIT): singing voice to MIDI with float pitches; GAME accepts user-adjusted note boundaries. RUNNABLE (to check; weights from GitHub releases).
33. ROSVOT (`RickyL-2000/ROSVOT`, ACL 2024), last commit 2024-11-20, MIT code, checkpoint on Google Drive, trained on Mandarin data. To check (README installs CUDA 11.8 torch).
35. VocalParse (`pymaster17/VocalParse`, arXiv 2605.04613, May 2026; added by the verifier): singing voice to lyrics, MIDI pitch tokens, note values and a global BPM, as one token sequence from a fine-tuned Qwen3-ASR-1.7B. Last commit 2026-06-16. Code Apache-2.0; checkpoint `pymaster/VocalParse` (card `license: apache-2.0`, 4.08 GB); trained with M4Singer (CC BY-NC-SA 4.0) and GTSinger among its data. To check (README installs CUDA 12.4 torch).

### Services and desktop products (pointers; covered by the apps-survey and hosted-apis lanes)

34. basicpitch.io, muscriptor.kyutai.org, Hugging Face Spaces (YourMT3, Timbre-Trap), swift-f0.github.io, Klangio, Music.AI, AnthemScore, Melodyne, Ableton Live "Convert to MIDI".

## Training datasets: where their licenses are quoted

Several models below were trained on the same public datasets. Each dataset's license clause is quoted once,
in the section "Training datasets and their license clauses" near the end of this file, and the tool sections
point there by name.

## 13. Spotify Basic Pitch

- **What, who, links:** a Python library for "Automatic Music Transcription (AMT), using lightweight neural
  network developed by Spotify's Audio Intelligence Lab" (README,
  https://raw.githubusercontent.com/spotify/basic-pitch/main/README.md, read 2026-11-10). Repository
  https://github.com/spotify/basic-pitch . Paper: Bittner et al., "A Lightweight Instrument-Agnostic Model for
  Polyphonic Note Transcription and Multipitch Estimation", ICASSP 2022, https://arxiv.org/abs/2203.09893 (PDF
  read 2026-11-10). The paper reports "a total of only 16,782 parameters" for the model it calls NMP.
- **Version and maintenance:** PyPI `basic-pitch` 0.4.0, uploaded 2024-08-16 (12 releases since 2022-05-12).
  Last commit on `main`: 2025-11-13 (fa5997a). No archive notice in the README.
- **How a program calls it:**
  - CLI (README): `basic-pitch <output-directory> <input-audio-path>` (several input paths allowed), with
    `--sonify-midi` ("a `.wav` audio rendering of the MIDI file"), `--save-model-outputs` ("raw model outputs as
    an NPZ file"), `--save-note-events` ("the predicted note events as a CSV file"), and `--model-serialization`
    to pick the runtime.
  - Python (README): `from basic_pitch.inference import predict` then
    `model_output, midi_data, note_events = predict(<input-audio-path>)`; `predict_and_save(...)` writes the files;
    load once with `Model(ICASSP_2022_MODEL_PATH)` to predict in a loop.
  - Browser and Node: the README points to the "sibling repo" `spotify/basic-pitch-ts` (`npm install`-able);
    that belongs to the browser-audio-sync lane.
  - Runtime: "Basic Pitch comes with the original TensorFlow model and the TensorFlow model converted to CoreML,
    TensorFlowLite, and ONNX ... TensorFlowLite will be installed on Linux" (README). `pyproject.toml` at `main`
    pins `tensorflow>=2.4.1,<2.15.1` for Python >= 3.11 and `tflite-runtime` on Linux for Python < 3.11. The
    README lists "Python versions 3.7, 3.8, 3.9, 3.10, 3.11"; the `pyproject.toml` classifiers list 3.8 to 3.11.
    No GPU is required by the docs. On this box the try agent needed `numpy<2` (tflite-runtime 2.14.0 failed to load
    the model with numpy 2.2.6) and `setuptools<81` (resampy imports `pkg_resources`) (`trials.md`; the failed CLI
    runs r0032, r0033, r0035, r0037, r0038, r0039, r0040 and r0065 exit with code 1 in the ledger; the working batch
    is r0234).
- **Input (README, "Model Input"):** "Input audio maybe be of any sample rate, however, all audio will be
  resampled to 22050 Hz before processing." Stereo is "down-mixed to mono". "This model can process any size or
  length of audio, but processing of larger/longer audio files could be limited by your machine's available disk
  space."
- **Output (from `basic_pitch/inference.py` and `note_creation.py` at `main`, read 2026-11-10):**
  - `model_output`: a dict of three posteriorgrams, keys `"note"`, `"onset"`, `"contour"`. The paper: note and
    onset at 1 bin per semitone, contour (multipitch) at 3 bins per semitone; `constants.py`:
    `ANNOTATIONS_BASE_FREQUENCY = 27.5`, `ANNOTATIONS_N_SEMITONES = 88`, `FFT_HOP = 256`,
    `AUDIO_SAMPLE_RATE = 22050` (about 86 frames per second).
  - `note_events`: a list of tuples `(start_time_s, end_time_s, pitch_midi, amplitude, pitch_bends)`, times in
    seconds; the CSV writer's header row is `["start_time_s", "end_time_s", "pitch_midi", "velocity", "pitch_bend"]`.
  - `midi_data`: a `pretty_midi.PrettyMIDI` object; notes are written with program "Electric Piano 1",
    `velocity=int(np.round(MIDI_VELOCITY_SCALE * amplitude))`, and pitch bends as MIDI pitch-bend events. There is
    no string, fret, instrument label or per-note confidence field beyond amplitude.
  - As observed by the try agent (`trials.md`, run r0234): the CLI writes `<stem>_basic_pitch.mid`, `.csv` and
    `.npz`; the MIDI has one instrument, program 4 (0-based, which is General MIDI "Electric Piano 1"), 220 ticks per
    quarter note, tempo 120; each CSV row carries a variable number of pitch-bend values after the velocity column,
    and the rows are not in time order. The CLI also accepted an MP4 video file directly.
- **Constraints a re-run can pass (`predict()` signature):** `onset_threshold` (default 0.5),
  `frame_threshold` (0.3), `minimum_note_length` in ms (127.7), `minimum_frequency` and `maximum_frequency` in Hz
  ("Pitch events with frequencies outside of this range will be excluded", README), `multiple_pitch_bends`,
  `melodia_trick` (default True), `midi_tempo` (120). No tuning, capo, key or instrument parameter.
- **Access needs:** none beyond pip. The README also points to a demo site, https://basicpitch.io (not read).
- **License facts:**
  - a. Code: Apache-2.0. LICENSE, https://raw.githubusercontent.com/spotify/basic-pitch/main/LICENSE, read
    2026-11-10: "Copyright 2022 Spotify AB" and "each Contributor hereby grants to You a perpetual, worldwide,
    non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works
    of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source
    or Object form." The README's own license paragraph (same URL as the README above) reads: "This software is
    licensed under the Apache License, Version 2.0 (the "Apache License"). You may choose either license to govern
    your use of this software only upon the condition that you accept all of the terms of either the Apache
    License." and "Unless required by applicable law or agreed to in writing, software distributed under the
    Apache License or the GPL License is distributed on an "AS IS" BASIS". (The README mentions a "GPL License";
    no GPL file is in the repository root listing at fa5997a.)
  - b. Weights: the model files ship inside the package, under `basic_pitch/saved_models/icassp_2022/`
    (`nmp.onnx`, `nmp.tflite`, `nmp/saved_model.pb` with variables, `nmp.mlpackage`). The wheel
    `basic_pitch-0.4.0-py2.py3-none-any.whl` (downloaded from PyPI 2026-11-10) contains only
    `dist-info/LICENSE` (the Apache-2.0 text) and `dist-info/NOTICE` as license files; no separate license file for
    the model files was found in the wheel or in the repository tree at fa5997a. NOTICE lists third-party code
    (librosa ISC, mir_eval MIT, numpy BSD, pretty-midi MIT, resampy ISC, scipy BSD, tensorflow Apache 2.0) and
    says "The tests for `basic-pitch` include audio files from the Vocadito dataset liscened under Creative
    Commons Attribution 4.0 International."
  - c. Training data (paper, Table 1, tracks used for training): GuitarSet 648, MAESTRO 1154, Slakh 1590 ("We use
    the de-duplicated "redux" version of Slakh"), iKala 252, MedleyDB 103; Molina and Phenicx were test-only. The
    paper says "we only use public datasets for training and evaluation in order to foster reproducibility." See
    the dataset section for GuitarSet, MAESTRO, Slakh2100, MedleyDB and iKala.
  - d. Service: not applicable (local library).
- **Author-reported measurements (paper, Table 2, note-level F-measure without offsets, "Fno"):** NMP: Molina
  .52, GuitarSet .79, MAESTRO .71, Slakh .42, Phenicx .49 (frame accuracy Acc on GuitarSet .70).

## 1. CREPE

- **What, who, links:** "a monophonic pitch tracker based on a deep convolutional neural network operating
  directly on the time-domain waveform input" (README, https://raw.githubusercontent.com/marl/crepe/master/README.md,
  read 2026-11-10). Repository https://github.com/marl/crepe . Paper: Kim, Salamon, Li, Bello (Music and Audio Research
  Laboratory, New York University, per the paper),
  "CREPE: A Convolutional Representation for Pitch Estimation", ICASSP 2018, https://arxiv.org/abs/1802.06182
  (PDF read 2026-11-10).
- **Version and maintenance:** PyPI `crepe` 0.0.16, uploaded 2024-08-19. Last commit on `master` 2024-08-19
  (c9b71ce). The weights live on the repository's `models` branch (five files `model-{tiny,small,medium,large,full}.h5.bz2`,
  1.3 MB to 57.7 MB compressed; last commit on that branch 2018-05-31), downloaded by `setup.py` from
  `https://github.com/marl/crepe/raw/models/` at install time.
- **How a program calls it (README):** CLI `crepe audio_file.wav` (or `python -m crepe audio_file.wav`), options
  `--step-size <ms>`, `--model-capacity {tiny|small|medium|large|full}`, `--viterbi`, `--save-activation`,
  `--save-plot`, `--plot-voicing`. Python: `time, frequency, confidence, activation = crepe.predict(audio, sr, viterbi=True)`.
  Install: `pip install --upgrade tensorflow` ("if you don't already have tensorflow >= 2.0.0") then
  `pip install crepe`. "Prediction is significantly faster if Keras (and the corresponding backend) is
  configured to run on GPU" (README); no GPU requirement is stated.
- **Input:** "The model is trained on 16 kHz audio, so if the input audio has a different sample rate, it will be
  first resampled to 16 kHz using resampy" (README). Monophonic audio.
- **Output (README):** `<name>.f0.csv` with header `time,frequency,confidence`: "timestamps (a 10 ms hop size is
  used by default)", "the predicted fundamental frequency in Hz", "the voicing confidence". Optional `.npy`
  activation matrix (360 pitch bins: `crepe/core.py` builds `Dense(360, activation='sigmoid', name="classifier")`). Frame-level f0 only: no note events, no MIDI.
- **Constraints a re-run can pass:** step size, model capacity, Viterbi smoothing. No frequency-range or tuning
  argument in the CLI options listed in the README.
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/marl/crepe/master/LICENSE, read 2026-11-10: "The MIT License
    (MIT) Copyright (c) 2018 Jong Wook Kim" and "Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software
    without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute,
    sublicense, and/or sell copies of the Software".
  - b. Weights: no license file on the `models` branch (its tree holds only the five `.h5.bz2` files), read
    2026-11-10 from a fetch of `https://github.com/marl/crepe` branch `models`. The README's MIT badge and LICENSE
    are on `master`; no statement was found that names a separate license for the weights.
  - c. Training data (README): "The provided model is trained using the following datasets, composed of vocal and
    instrumental audio": MIR-1K, Bach10, RWC-Synth, MedleyDB, MDB-STEM-Synth, NSynth. The paper's own experiments
    describe RWC-synth ("6.16 hours of audio synthesized from the RWC Music Database") and MDB-stem-synth. See the
    dataset section for MedleyDB, MDB-stem-synth, NSynth, MIR-1K, Bach10 and RWC.
  - d. Service: not applicable.
- **Author-reported measurements (paper, Table 1):** raw pitch accuracy (50-cent threshold) 0.999 ± 0.002 on
  RWC-synth and 0.967 ± 0.091 on MDB-stem-synth.

## 2. torchcrepe

- **What, who, links:** "Pytorch implementation of the CREPE [1] pitch tracker ... The provided model weights were
  obtained by converting the "tiny" and "full" models using MMdnn" (README,
  https://raw.githubusercontent.com/maxrmorrison/torchcrepe/master/README.md, read 2026-11-10). By Max Morrison.
  Repository https://github.com/maxrmorrison/torchcrepe .
- **Version and maintenance:** PyPI `torchcrepe` 0.0.24 uploaded 2025-05-16; last commit 2025-05-16 (19e2ec3).
  Weights are in the repository and package: `torchcrepe/assets/full.pth` (88,991,291 bytes) and
  `torchcrepe/assets/tiny.pth` (1,962,363 bytes) (git tree at 19e2ec3).
- **How a program calls it (README):** `pip install torchcrepe`; Python
  `pitch = torchcrepe.predict(audio, sr, hop_length, fmin, fmax, model, batch_size=..., device=...)`, with
  `return_periodicity=True`, `decoder=torchcrepe.decode.viterbi | weighted_argmax | argmax`, filters
  (`torchcrepe.filter.median`, `.mean`), thresholds (`torchcrepe.threshold.At(.21)`, `Hysteresis`,
  `Silence(-60.)`), `predict_from_file(...)`, `predict_from_file_to_file(...)`, `embed(...)`. CLI
  `python -m torchcrepe --audio_files ... --output_files ... [--hop_length] [--fmin] [--fmax] [--model] [--decoder] [--gpu]`.
  The README's example sets `device = 'cuda:0'`; in `torchcrepe/core.py` at 19e2ec3 the signature is
  `predict(audio, sample_rate, hop_length=None, fmin=50., fmax=MAX_FMAX, model='full', decoder=torchcrepe.decode.viterbi,
  return_harmonicity=False, return_periodicity=False, batch_size=None, device='cpu', pad=True)`, so CPU is the default.
- **Input:** `core.py`: `SAMPLE_RATE = 16000`, `WINDOW_SIZE = 1024`, `PITCH_BINS = 360`, `CENTS_PER_BIN = 20`,
  `MAX_FMAX = 2006.` Hz.
- **Output:** a pitch tensor in Hz per frame (unvoiced as `UNVOICED = np.nan` after thresholding) and an optional
  periodicity tensor ("A periodicity metric similar to the Crepe confidence score"); frame-level only.
- **Constraints a re-run can pass:** `fmin` and `fmax` (a note range), hop length, decoder, periodicity threshold.
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/maxrmorrison/torchcrepe/master/LICENSE, read 2026-11-10:
    "MIT License Copyright (c) 2020 Max Morrison" and "Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software ... to deal in the Software without restriction, including without
    limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
    Software".
  - b. Weights: the `.pth` files sit inside the MIT-licensed repository; no separate weights license was found in
    the README or tree. They are conversions of CREPE's weights (see CREPE b).
  - c. Training data: the same as CREPE (converted weights).
  - d. Service: not applicable.

## 3. pYIN: `librosa.pyin`, the pYIN Vamp plugin, and Tony

- **What, who, links:** probabilistic YIN (Mauch and Dixon, ICASSP 2014), a DSP f0 estimator with no trained
  weights. Three implementations were read:
  - `librosa.pyin` in librosa (https://github.com/librosa/librosa). PyPI `librosa` 1.0.0 uploaded 2026-08-11,
    `requires_python='>=3.12'`; last commit 2026-11-10 (6c9fe7c). The function's docstring was read from
    https://raw.githubusercontent.com/librosa/librosa/main/librosa/core/pitch.py (2026-11-10). The rendered docs
    page `https://librosa.org/doc/latest/generated/librosa.pyin.html` returned HTTP 404 on 2026-11-10;
    `https://librosa.org/doc/0.11.0/generated/librosa.pyin.html` returned 200.
  - The pYIN Vamp plugin (Centre for Digital Music, Queen Mary University of London), git mirror
    https://github.com/c4dm/pyin, last commit 2020-02-06 (1d68cac). Its project page
    https://code.soundsoftware.ac.uk/projects/pyin returned HTTP 503 on 2026-11-10 (not read).
  - Tony, "a program for computer-aided melody annotation ... uses the pYIN Vamp plugin to extract pitch track and
    notes from monophonic audio" (README, git clone of https://github.com/sonic-visualiser/tony, last commit
    2024-07-02, 8fb3390). Listed features include "note track extraction", "facility to manually adjust pitch
    track and note track", "note pitch automatically snaps to pitch track", "import/export of pitch track and note
    track". Desktop application.
- **How a program calls it:** Python
  `f0, voiced_flag, voiced_prob = librosa.pyin(y, fmin=..., fmax=..., sr=22050, frame_length=2048, hop_length=None, ...)`
  (docstring). The Vamp plugin is called from any Vamp host ("Sonic Visualiser and Sonic Annotator", plugin
  README), for example the Sonic Annotator command line, which belongs with the other Vamp hosts.
- **Input:** `librosa.pyin`: an audio array `y` ("Multi-channel is supported"), `sr` default 22050, `fmin` and
  `fmax` required ("The recommended minimum is librosa.note_to_hz('C2') (~65 Hz)", "The recommended maximum is
  librosa.note_to_hz('C7') (~2093 Hz)").
- **Output:** `librosa.pyin` returns "f0 : np.ndarray [shape=(..., n_frames)] time series of fundamental
  frequencies in Hertz.", "voiced_flag : ... boolean flags", "voiced_prob : ... the probability that a frame is
  voiced", one value per frame
  (`hop_length` defaults to `frame_length // 4`); times come from `librosa.times_like`. No note events. The Vamp
  plugin (`PYinVamp.cpp`) has outputs including `smoothedpitchtrack` ("Frame-by-frame pitch estimate after
  smoothing", Hz) and `notes` ("Derived fixed-pitch note frequencies", Hz, with durations).
- **Constraints a re-run can pass:** `fmin`/`fmax` (a note range), `frame_length`, `hop_length`,
  `max_transition_rate`, `switch_prob`, `resolution`. The Vamp plugin parameters include `threshdistr`,
  `outputunvoiced`, `lowampsuppression`, `onsetsensitivity`, `prunethresh` (identifiers in `PYinVamp.cpp`).
- **License facts:**
  - a. Code: librosa is ISC. https://raw.githubusercontent.com/librosa/librosa/main/LICENSE.md, read 2026-11-10:
    "Copyright (c) 2013--2026, librosa development team. Permission to use, copy, modify, and/or distribute this
    software for any purpose with or without fee is hereby granted, provided that the above copyright notice and
    this permission notice appear in all copies." The pYIN Vamp plugin: `PYinVamp.cpp` header, git mirror
    https://github.com/c4dm/pyin at 1d68cac, read 2026-11-10: "you can redistribute it and/or modify it under the
    terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the
    License, or (at your option) any later version." (COPYING is GPL version 2.) Tony: README at 8fb3390: "This
    program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
    License as published by the Free Software Foundation, either version 2 of the License, or (at your option) any
    later version." and "If you make use of this software for any public or commercial purpose, we ask you to
    kindly mention the authors and Queen Mary, University of London in your user-visible documentation."
  - b. Weights: none (DSP algorithm).
  - c. Training data: none.
  - d. Service: not applicable.

## 4. PESTO

- **What, who, links:** a pitch estimator "based on machine learning" (README,
  https://raw.githubusercontent.com/SonyCSLParis/pesto/master/README.md, read 2026-11-10). Sony CSL Paris.
  Repository https://github.com/SonyCSLParis/pesto ("minimal code implementation for inference only"; training
  code in `SonyCSLParis/pesto-full`, not read). Papers: PESTO v1 (Riou, Lattner, Hadjeres, Peeters),
  https://arxiv.org/abs/2309.02265, whose first line reads "An improved version of this paper has been published in
  TISMIR.";
  PESTO v2, https://arxiv.org/abs/2508.01488 (both PDFs read 2026-11-10).
- **Version and maintenance:** PyPI `pesto-pitch` 2.0.1 uploaded 2025-02-18; last commit 2025-10-15 (62bc0c9).
  Weights in the repository and package: `pesto/weights/mir-1k.ckpt` (123,538 bytes) and
  `pesto/weights/mir-1k_g7.ckpt` (534,664 bytes) (git tree at 62bc0c9).
- **How a program calls it (README):** `pip install pesto-pitch`; CLI `pesto my_file.wav` (or
  `python -m pesto`), options `-s` step size in ms, `-r/--reduction` decoding, `-F` output in semitones,
  `--gpu <id>` ("The default `--gpu -1` uses the CPU"), export formats `.csv`, `.npz` ("Timesteps, pitch,
  confidence, and activations"), `.png`. Python: `timesteps, pitch, confidence, activations = pesto.predict(x, sr)`;
  `load_model("mir-1k_g7", step_size=20.)`; a streaming mode (`load_model(..., streaming=True)`); export to
  TorchScript (`python -m realtime.export_jit`) and ONNX (`python -m realtime.export_onnx`).
- **Input:** mono audio ("PESTO takes mono audio as input"); loads files with torchaudio, "supporting various
  formats and sampling rates without needing resampling" (README).
- **Output:** CSV `time,frequency,confidence` per frame (README), or semitones with `-F`. Frame-level only, no
  note events. In Python, `pesto.predict` returned `timesteps` in milliseconds and a pitch on every frame with no
  voiced/unvoiced decision (`trials.md`).
- **Constraints a re-run can pass:** step size, decoding, output unit. No fmin/fmax option is listed in the
  README.
- **License facts:**
  - a. Code: LGPL-3.0. https://raw.githubusercontent.com/SonyCSLParis/pesto/master/LICENSE.md, read 2026-11-10:
    "GNU Lesser General Public License ... Version 3, 29 June 2007" and "This version of the GNU Lesser General
    Public License incorporates the terms and conditions of version 3 of the GNU General Public License,
    supplemented by the additional permissions listed below." PyPI classifier: "GNU Lesser General Public License
    v3 (LGPLv3)".
  - b. Weights: the `.ckpt` files are inside the LGPL-3.0 repository; no separate weights license found in the
    README or tree.
  - c. Training data: the checkpoint names are `mir-1k` and `mir-1k_g7`; the v1 paper's results table lists
    "PESTO (ours) 28.9k [parameters] MIR-1K" and a second model trained on MDB-stem-synth. PESTO is trained
    self-supervised (v1 abstract: "trained only on a small unlabeled dataset"). See the dataset section for MIR-1K.
  - d. Service: not applicable.
- **Author-reported measurements:** v1 paper, Table 1: PESTO trained on MIR-1K, raw pitch accuracy 96.1 % on MIR-1K
  and 94.6 % on MDB-stem-synth. README benchmark example: "Audio File: wav (2m51s)", "Hardware: Intel i7-1185G7 (11th Gen,
  8 cores)", "With a 10ms step size, PESTO would perform pitch estimation of the file in 13 seconds".

## 5. RMVPE

- **What, who, links:** "the Pytorch implementation of "RMVPE: A Robust Model for Vocal Pitch Estimation in
  Polyphonic Music"" (the whole README, https://raw.githubusercontent.com/Dream-High/RMVPE/main/README.md, read
  2026-11-10). Paper: Haojie Wei, Xueke Cao, Tangpeng Dan, Yueguo Chen, https://arxiv.org/abs/2306.15412 (PDF read
  2026-11-10).
  Repository https://github.com/Dream-High/RMVPE .
- **Version and maintenance:** no PyPI package; last commit 2024-01-25 (a6db1cd). The repository tree has
  `train.py`, `evaluate.py`, `src/inference.py` and no weight files and no link to weights.
- **Where weights are published (facts found, link between them not confirmed):** the SOME README tells users to
  "download the RMVPE pretrained model from here" pointing to https://github.com/yxlllc/RMVPE/releases (the
  release page is on github.com, which this box cannot read). The repository `yxlllc/RMVPE` (last commit 2026-03-12,
  0aabafb; root listing `README.md evaluate.py export.py main.py src train.py`, no LICENSE file) has a README in
  Chinese whose training section reads "数据集是我处理过的 mir1k 和 ptdb 混合数据集, 外加 m4singer 声码器合成数据" (the
  author's processed mix of MIR-1K and PTDB, plus M4Singer audio re-synthesized with a vocoder), read 2026-11-10 from
  https://raw.githubusercontent.com/yxlllc/RMVPE/main/README.md. A release asset answers at
  https://github.com/yxlllc/RMVPE/releases/download/230917/rmvpe.zip (HTTP 200, 340,638,958 bytes, HEAD request
  2026-11-10; the tag name was tried by the verifier, not read from a page, and the zip was not downloaded).
  The Hugging Face repository `lj1995/VoiceConversionWebUI` holds files named `rmvpe.pt` (181,184,272 bytes) and
  `rmvpe.onnx` (361,688,443 bytes), with card license tag `mit` (Hugging Face API, read 2026-11-10). This agent
  did not find a statement in the Dream-High repository naming either source. UNVERIFIED: which checkpoint
  corresponds to the paper; settled by a release note or model card that names the training run.
- **How a program calls it:** Python only, from the repository's `src/` (no CLI, no package). A third-party PyPI
  wrapper exists: `rmvpe-onnx` 0.2.3, "RMVPE pitch estimator — pure ONNX Runtime inference", license MIT, wheel
  14,520 bytes, requiring `huggingface-hub` and `onnxruntime` (PyPI JSON, verifier 2026-11-10); per `trials.md` it
  downloads `rmvpe.onnx` from `lj1995/VoiceConversionWebUI` (not run). `src/inference.py`
  at a6db1cd (read 2026-11-10) defines `class Inference` with `__init__(self, model, seg_len, seg_frames, hop_length,
  batch_size, device)` and `inference(self, audio)`, which pads the audio, cuts it into overlapping segments, runs
  the model in mini-batches and returns `(hidden_vec_segments, out_segments)`, each trimmed to
  `len(audio) // hop_length + 1` frames. The conversion of `out_segments` to Hz was not traced here.
- **Input / output:** the paper estimates vocal f0 in polyphonic music, frame-level; output is pitch per frame.
- **License facts:**
  - a. Code: Apache-2.0. https://raw.githubusercontent.com/Dream-High/RMVPE/main/LICENSE (Apache License Version
    2.0 text), read 2026-11-10, includes the grant "each Contributor hereby grants to You a perpetual, worldwide,
    non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of,
    publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or
    Object form."
  - b. Weights: none in the repository (see above).
  - c. Training data (paper, 3.1, reference and footnote marks removed): "public datasets MDB-stem-synth, MIR-1K,
    Cmedia and MIR ST500"; "For
    MDB-stem-synth, MIR-1K and Cmedia datasets, we randomly spilt these datasets (at song-level) into training (80%)".
    See the dataset section for MDB-stem-synth and MIR-1K. Cmedia and MIR-ST500: licenses not read (UNVERIFIED). The
    `yxlllc/RMVPE` README names a different mix (MIR-1K, PTDB and vocoder-resynthesized M4Singer, above); PTDB-TUG and
    M4Singer are in the dataset section.
  - d. Service: not applicable.
- **Author-reported measurements (paper, Table 1, last row, the proposed model):** raw pitch accuracy 95.42 % on
  MIR-1K, 89.32 % on MIR ST500, 83.57 % on Cmedia.
- **Added in gap round 1 (`gapfill-audio-to-notes`, read 2026-11-10): the PyPI wrapper `rmvpe-onnx`.** Version 0.2.3,
  uploaded 2026-04-11 (PyPI JSON); source https://github.com/NewComer00/rmvpe-onnx (HEAD a16200fd by `git ls-remote`).
  Its README (the PyPI description): "A simple wrapper around ONNX-related code in `rvc/lib/rmvpe.py @ 7e03261`" of
  RVC-Project/Retrieval-based-Voice-Conversion, and "ONNX model from lj1995/VoiceConversionWebUI". Requires Python
  >= 3.10, `huggingface-hub>=1.9`, `librosa>=0.11`, `onnxruntime>=1.24` (Python >= 3.11), `scipy>=1.15`; the `cli`
  extra adds plotly and soundfile. Calls: `from rmvpe_onnx import RMVPE`, `time, frequency, confidence, activation =
  RMVPE().predict(audio=audio, sr=sr)`; CLI `rmvpe-onnx download` and `rmvpe-onnx predict audio.wav [--csv out.csv]
  [--confidence-threshold 0.03] [--device ...] [--model path] [--plot]`. Input and output, from the package source
  (`rmvpe_onnx/model.py`): audio is downmixed to mono and resampled to 16 kHz; a 128-band log-mel spectrogram (30 to
  8,000 Hz, window 1,024, hop 160 samples) goes into the ONNX model; per 10 ms frame it returns a frequency in Hz, a
  confidence (the largest of the 360 sigmoid outputs) and the 360-bin activation (20-cent bins, centres 31.70 to
  2,005.50 Hz). README: "The Python API returns raw outputs with no confidence thresholding applied." The CLI's CSV
  has the header `time,frequency,confidence` and writes 0 Hz in frames below the threshold (default 0.03). Constraint
  inputs: device, model path, confidence threshold; no pitch range, tuning or key input. Model file: `rmvpe.onnx` in
  `lj1995/VoiceConversionWebUI` (361,688,443 bytes, sha256 5370e71a...fa3660fd, the digest in the package's
  `weights.py`). Run in gap round 1: `trials.md`, "Gap round 1".
  - a2. Wrapper code: MIT. https://raw.githubusercontent.com/NewComer00/rmvpe-onnx/HEAD/LICENSE (read 2026-11-10)
    holds three MIT notices, "Copyright (c) 2026 NewComer00", "Copyright (c) 2023 liujing04 / Copyright (c) 2023 源文雨 /
    Copyright (c) 2023 Ftps" and "Copyright (c) 2022 lj1995", each followed by "Permission is hereby granted, free of
    charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
    publish, distribute, sublicense, and/or sell copies of the Software".
  - b2. Weights used by the wrapper: the card of `lj1995/VoiceConversionWebUI`
    (https://huggingface.co/lj1995/VoiceConversionWebUI/raw/main/README.md, read 2026-11-10) is front matter only
    (21 bytes): "license: mit". The wrapper's README credits the model as "Copyright (c) 2022 lj1995 — MIT License".
    Which training run produced this file: UNVERIFIED (above).

## 6. FCPE / torchfcpe

- **What, who, links:** "TorchFCPE(Fast Context-based Pitch Estimation) is a PyTorch-based library designed for
  audio pitch extraction and MIDI conversion" and "Note: that the MIDI extractor of FCPE is quantized from f0 using
  non neural network methods" (README, https://raw.githubusercontent.com/CNChTu/FCPE/main/README.md, read
  2026-11-10). Paper: Luo et al. 2025, https://arxiv.org/abs/2509.15140 (PDF read 2026-11-10). Repository
  https://github.com/CNChTu/FCPE .
- **Version and maintenance:** PyPI `torchfcpe` 0.0.4 uploaded 2024-03-06; last commit 2025-10-14 (6a149c1). The
  README says: "I won't be updating FCPE (or benchmark) so soon".
- **How a program calls it (README):** `pip install torchfcpe`; `model = spawn_bundled_infer_model(device='cpu')`;
  `f0 = model.infer(audio, sr=16000, decoder_mode='local_argmax', threshold=0.006, f0_min=80, f0_max=880,
  interp_uv=False, output_interp_target_length=...)`; `midi = model.extact_midi(audio, sr=sr, ..., output_path="test.mid")`
  (spelling `extact_midi` as in the README), with `tempo` ("If None, BPM is automatically predicted").
  Version difference (verifier, 2026-11-10): `extact_midi` and the `torchfcpe/f02midi/` module exist in the
  repository's `main` at 6a149c1 (`torchfcpe/models_infer.py`), but not in the PyPI 0.0.4 package: the try agent's
  installed copy (`venv-torchf0/.../site-packages/torchfcpe/`, torchfcpe 0.0.4) has no `extact_midi` and no
  `f02midi`. In 0.0.4 the `infer()` keyword for the voicing mask is spelled `retur_uv`; in `main` it is `return_uv`.
  The MIDI export therefore needs an install from the GitHub source, not from PyPI.
- **Input:** a mono `torch.Tensor` of audio; the README example resamples to 16 kHz with hop 160.
- **Output:** an f0 tensor per frame (Hz) (0.0.4 docstring: "f0 Hz, shape (B, (n_sample//hop_size + 1) or
  output_interp_target_length, 1)"); in `main`, `extact_midi` returns the value of
  `f02midi(f0, tempo=tempo, output_path=output_path, sr=sr, y=wav)`, and `output_path` is a required argument.
- **Constraints a re-run can pass:** `f0_min`, `f0_max` (default `None` in both 0.0.4 and `main`, documented as
  "Use in post-processing"; 80 and 880 Hz are the values in the README example), voicing `threshold` (default
  0.006), `tempo` for the MIDI export (`main` only).
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/CNChTu/FCPE/main/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2023 CN_ChiTu" and "Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software ... to deal in the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software".
  - b. Weights: two different files. (1) The package bundles `torchfcpe/assets/fcpe_c_v001.pt` (43,363,260 bytes,
    git tree at 6a149c1), called "another model which released earlier" in the README; no separate license for it
    was found, so it sits under the repository's MIT LICENSE. (2) "The model we use in our paper is DDSP-200K, you
    can get the model from here" (README) links https://huggingface.co/ChiTu/FCPE , whose README.md (36 bytes) holds
    only the front matter "license: cc-by-nc-sa-4.0" between two `---` lines (card front matter, https://huggingface.co/ChiTu/FCPE/raw/main/README.md, read
    2026-11-10); file `DDSP_200k.pt`, 43,362,881 bytes.
  - c. Training data (paper, 2.3, reference marks removed): "we re-synthesize the M4Singer and VCTK datasets using
    the Differentiable Digital Signal Processing (DDSP) method and use them for training all model variants." M4Singer
    is CC BY-NC-SA 4.0 and VCTK 0.92 is CC BY 4.0 (quoted in the dataset section, added by the verifier).
  - d. Service: not applicable.
- **Author-reported measurements (paper abstract):** "96.79% Raw Pitch Accuracy (RPA) on the MIR-1K dataset" and
  "The Real-Time Factor (RTF) is 0.0062 on a single RTX 4090 GPU".

## 7. SwiftF0

- **What, who, links:** a "pitch detector for monophonic audio (one voice or instrument, not chords). A small
  neural network with 14 386 parameters reads the pitch from a spectrogram of the audio" (README,
  https://raw.githubusercontent.com/lars76/swift-f0/main/README.md, read 2026-11-10). By Lars Nieradzik. Paper:
  https://arxiv.org/abs/2508.18440 (PDF read 2026-11-10); the paper's model "contains 95,842 parameters", the
  README's (0.3.0) has 14,386. Training code:
  https://github.com/lars76/swift-f0-training (README read 2026-11-10: "Training code and ONNX export for SwiftF0
  0.3.0").
- **Version and maintenance:** PyPI `swift-f0` 0.3.0 uploaded 2026-09-25 (first upload 2025-07-08); last commit
  2026-09-25 (d1ba77f).
- **How a program calls it (README):** `pip install swift-f0` ("The only hard dependencies are numpy and
  onnxruntime"; extras `[audio]`, `[viz]`, `[midi]`, `[full]`). Python: `SwiftF0(threads=None, spin=True)`,
  `.detect(audio, sample_rate, fmin=None, fmax=None)`, `.detect_file(path, ...)`, `.stream()` with
  `push(audio, sample_rate)` / `flush()` ("A frame is final once 176 ms of audio after it have arrived"),
  `segment_notes(result, pitch_hold_ms=80.0)`, `export_to_csv`, `export_to_midi(...)`. Browser: "The demo runs
  entirely client-side with ONNX Runtime Web" (https://swift-f0.github.io/, not read). No CLI is listed.
- **Input:** "Multichannel audio (channels last) is mixed to mono and resampled to 16 kHz if needed";
  `detect_file` reads "WAV, FLAC, OGG, MP3, AIFF and others". Constants: `SAMPLE_RATE` 16000, `FRAME_PERIOD`
  0.016 s, `FMIN` 46.875 Hz, `FMAX` 2093.75 Hz.
- **Output:** `PitchResult` with `timestamps` ("seconds, one per 16 ms frame"), `pitch_hz`, `confidence` ("voicing
  score, voiced when >= 0.5"), `loudness_db`. `segment_notes` returns `Note(start, end, pitch_hz)` with times in
  seconds; "The MIDI export and the plots use the nearest MIDI number."
- **Constraints a re-run can pass:** `fmin`/`fmax` ("A frame whose best pitch lies outside the band gets
  confidence 0"), `pitch_hold_ms` for note segmentation, MIDI `tempo` and `velocity`.
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/lars76/swift-f0/main/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2025-2026 Lars Nieradzik" with the standard MIT grant ("to deal in the Software without
    restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute,
    sublicense, and/or sell copies of the Software"). README: "MIT, see LICENSE". The training repository's
    LICENSE is also MIT ("Copyright (c) 2025-2026 Lars Nieradzik").
  - b. Weights: the bundled ONNX model ships in the MIT-licensed package; the training README calls `model.onnx`
    "the file the Python package runs". No separate weights license was found.
  - c. Training data: the training README downloads the training split with
    `hf download lars1234/pitch-benchmark train.tar ... --repo-type dataset`. That Hugging Face dataset's card
    license tag is `cc-by-nc-sa-4.0` (API https://huggingface.co/api/datasets/lars1234/pitch-benchmark, read
    2026-11-10). The paper (section 3.6) lists NSynth, PTDB-TUG, MIR-1k, MDB-STEM-Synth, Vocadito,
    Bach10-mf0-synth and its own SpeechSynth. Which corpora are in `train.tar`: UNVERIFIED (read the dataset card
    in full to settle).
  - d. Service: not applicable.
- **Author-reported measurements (README):** "In the Pitch Detection Benchmark, SwiftF0 has the highest pitch F1
  of the 19 trackers tested, statistically tied with RMVPE. It runs at 180 times real time on a single laptop CPU
  core." Attributed to the author; the benchmark is https://github.com/lars76/pitch-benchmark (not read).

## 8. PENN (FCNF0++)

- **What, who, links:** "Training, evaluation, and inference of neural pitch and periodicity estimators in
  PyTorch. Includes the original code for the paper "Cross-domain Neural Pitch and Periodicity Estimation""
  (README, https://raw.githubusercontent.com/interactiveaudiolab/penn/master/README.md, read 2026-11-10).
  Interactive Audio Lab (copyright holder in LICENSE). Paper: https://arxiv.org/abs/2301.12258 (PDF read 2026-11-10).
- **Version and maintenance:** PyPI `penn` 1.0.0 uploaded 2025-04-02; last commit 2025-04-02 (78ed3ba).
- **How a program calls it (README):** `pip install penn`; `pitch, periodicity = penn.from_audio(audio,
  sample_rate, hopsize=hopsize, fmin=fmin, fmax=fmax, checkpoint=checkpoint, batch_size=batch_size, center=center,
  decoder=decoder, interp_unvoiced_at=interp_unvoiced_at, gpu=gpu)` (README example, which sets `hopsize = .01`,
  `fmin = 30.`, `fmax = 1000.`, `checkpoint = None`, `interp_unvoiced_at = .065`) ("Set to None to use cpu"), plus `penn.from_file`, `from_file_to_file`, `from_files_to_files`.
  With `checkpoint=None` the code downloads `fcnf0++.pt` from the Hugging Face repository
  `maxrmorrison/fcnf0-plus-plus` (`penn/core.py` at 78ed3ba: `huggingface_hub.hf_hub_download('maxrmorrison/fcnf0-plus-plus', 'fcnf0++.pt')`).
- **Input:** audio tensor and its sample rate; the paper's proposed systems "use an 8 kHz sample rate".
- **Output:** pitch (Hz) and periodicity per frame; frame-level only.
- **Constraints a re-run can pass:** `fmin`, `fmax`, hop size, unvoiced interpolation threshold.
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/interactiveaudiolab/penn/master/LICENSE, read 2026-11-10:
    "MIT License Copyright (c) 2022 Interactive Audio Lab" with the standard MIT grant.
  - b. Weights: `maxrmorrison/fcnf0-plus-plus` on Hugging Face, card license tag `mit`, file `fcnf0++.pt`
    107,245,425 bytes (API read 2026-11-10).
  - c. Training data: README (a comment in its Python example, split over two comment lines): "Selecting None will
    download and use FCNF0++ pretrained on MDB-stem-synth and PTDB". See the dataset section for MDB-stem-synth
    (CC BY-NC 4.0) and PTDB-TUG (Open Database License, added by the verifier).
  - d. Service: not applicable.

## 9. aubio (`aubio pitch`, `aubio notes`, `aubionotes`, `aubiopitch`)

- **What, who, links:** a C library with Python bindings and command-line tools. Repository https://github.com/aubio/aubio ; docs at https://aubio.org (the CLI man pages were
  read from the repository's `doc/aubionotes.txt` and `doc/aubiopitch.txt` at ad5cf97, 2026-11-10).
- **Version and maintenance:** PyPI `aubio` 0.4.9 uploaded 2019-02-08 (the latest PyPI release). The repository's
  `VERSION` file at `master` reads `AUBIO_MAJOR_VERSION=0`, `AUBIO_MINOR_VERSION=5`, `AUBIO_PATCH_VERSION=0`,
  `AUBIO_VERSION_STATUS='-alpha'`; last commit 2026-04-10 (ad5cf97). On this box `/usr/bin/aubio`,
  `/usr/bin/aubionotes` and `/usr/bin/aubiopitch` exist (checked with `which`; not run by this agent).
- **How a program calls it:** CLI `aubionotes [-i] source [-r rate] [-B win] [-H hop] [-O method] [-t thres]
  [-d drop] [-p method] [-u unit] [-l thres] [-T time-format] [-s sil] ...` and `aubiopitch` with the same pitch
  options plus `-o sink` ("Save results in this file"). A Python module is published on PyPI as `aubio`; its API and
  the `aubio` command's subcommands were not read here. The man pages above were read at `master` (0.5.0-alpha); the
  box has the Ubuntu package `aubio-tools` 0.4.9, where the try agent found the `aubio` Python entry point printing
  a traceback on `--version` while `aubiopitch` and `aubionotes` worked (`trials.md`, run r0130).
- **Input:** "Run analysis on this audio file. Most uncompressed and compressed are supported, depending on how
  aubio was built"; `-r` resamples ("If 0, the sampling rate of the original source will be used").
- **Output (`doc/aubionotes.txt`):** "the detected notes are printed on standard output, in seconds and midi note
  number"; `aubiopitch`: pitch values "printed on the console, prefixed by a timestamp in seconds. If no pitch
  candidate is found, the output is 0." As observed with 0.4.9 (`trials.md`, run r0130): `aubionotes` prints
  lines `midi_pitch onset_s offset_s` (pitch as a float such as `66.000000`) plus some lines holding a single time
  value; `aubiopitch` prints `time_s pitch_hz` once per hop of 256 samples. Units by `-u`: "midi, bin, cent, and
  Hz". Pitch methods include
  `yinfft` ("Currently, the default method is set to yinfft"), `yinfast`, `yin`, `mcomb`, `fcomb`, `schmitt`,
  `specacf` (method list in `doc/aubiopitch.txt`).
- **Constraints a re-run can pass:** onset method and threshold, minimum inter-onset interval (`-M`), pitch
  method, pitch tolerance (`-l`), silence threshold (`-s`), release drop (`-d`). No tuning or note-range option in
  the man pages read.
- **License facts:**
  - a. Code: GPL-3.0-or-later. `COPYING`, https://raw.githubusercontent.com/aubio/aubio/master/COPYING, read
    2026-11-10: "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007". PyPI metadata: license "GNU/GPL version 3",
    classifier "GNU General Public License v3 or later (GPLv3+)".
  - b, c. No trained weights; no training data.
  - d. Service: not applicable.

## 10. Essentia (PitchYinProbabilistic, PredominantPitchMelodia, MultiPitchKlapuri, PitchCREPE, PitchContourSegmentation, Audio2Midi)

- **What, who, links:** "an open-source C++ library for audio analysis and audio-based music information retrieval
  released under the Affero GPLv3 license" with Python wrappers (README,
  https://raw.githubusercontent.com/MTG/essentia/master/README.md, read 2026-11-10). Music Technology Group,
  Universitat Pompeu Fabra. Repository https://github.com/MTG/essentia ; docs https://essentia.upf.edu .
- **Version and maintenance:** PyPI `essentia` and `essentia-tensorflow` 2.1b6.dev1438 uploaded 2026-05-19; last
  commit 2026-11-05 (23ae7ba). Verifier (PyPI JSON, 2026-11-10), confirming `trials.md`: every file of
  2.1b6.dev1438 is a CPython 3.14 wheel (`cp314`, macOS arm64 and x86_64, manylinux2014 x86_64); the previous
  version with Linux wheels for CPython 3.9 to 3.13 is 2.1b6.dev1389 (uploaded 2025-07-24), which is what the try
  agent installed on Python 3.11.
- **How a program calls it:** Python `essentia.standard` algorithms, for example (models page,
  https://essentia.upf.edu/models.html, read 2026-11-10):
  `audio = MonoLoader(filename="audio.wav", sampleRate=16000, resampleQuality=4)()`,
  `model = PitchCREPE(graphFilename="crepe-full-1.pb")`, `time, frequency, confidence, activations = model(audio)`.
  The TensorFlow-based algorithms need the `essentia-tensorflow` package. C++ API and command-line extractors also
  exist (README).
- **Inputs, outputs and parameters (algorithm reference pages, read 2026-11-10):**
  - `PitchYinProbabilistic` (https://essentia.upf.edu/reference/std_PitchYinProbabilistic.html): input "the
    input mono audio signal"; outputs `pitch` and `voicedProbabilities`; parameters `frameSize` 2048, `hopSize`
    256, `lowRMSThreshold`, `outputUnvoiced` ("zero, abs, negative"), `sampleRate` 44100.
  - `PredominantPitchMelodia` (https://essentia.upf.edu/reference/std_PredominantPitchMelodia.html): "estimates
    the fundamental frequency of the predominant melody from polyphonic music signals using the MELODIA
    algorithm"; outputs `pitch` ("the estimated pitch values [Hz]") and `pitchConfidence`; "The first value
    corresponds to the beginning of the input signal (time 0)"; parameters include `minFrequency` (80),
    `maxFrequency` (20000), `hopSize` (128), `frameSize` (2048), `referenceFrequency` (55), `voicingTolerance`,
    `guessUnvoiced`.
  - `MultiPitchKlapuri` (https://essentia.upf.edu/reference/std_MultiPitchKlapuri.html): output `pitch`
    (`vector_vector_real`, "the estimated pitch values [Hz]", several per frame); parameters include
    `minFrequency` (80), `maxFrequency` (1760), `numberHarmonics` (10), `hopSize` (128).
  - `PitchCREPE` (https://essentia.upf.edu/reference/std_PitchCREPE.html): input "the input audio signal
    sampled at 16000 Hz"; outputs `time`, `frequency` ("in Hz"), `confidence` ("of voice activity, between 0 and
    1"), `activations`; parameters `graphFilename`, `hopSize` in ms (10), `batchSize`.
  - `PitchContourSegmentation` (https://essentia.upf.edu/reference/std_PitchContourSegmentation.html): inputs a
    pitch contour in Hz and the signal; outputs `onset` ("note onset times [s]"), `duration` ("[s]"),
    `MIDIpitch` ("quantized MIDI pitch value"); parameters include `tuningFrequency` (default 440 Hz),
    `minDuration` (0.1 s), `pitchDistanceThreshold` (60 cents).
  - `Audio2Midi` (https://essentia.upf.edu/reference/std_Audio2Midi.html): per-frame input; outputs `pitch`,
    `loudness`, `messageType` ("{noteoff, noteon, noteoff-noteon}"), `midiNoteNumber`, `timeCompensation`;
    parameters `minFrequency` (60), `maxFrequency` (2300), `loudnessThreshold` (-51 dB), and (added by the verifier
    from the same page) `tuningFrequency` ("integer ∈ {432, 440}, default = 440", "tuning frequency for semitone
    index") and `transpositionAmount` ("integer ∈ (-69, 50), default = 0", "Apply transposition (in semitones) to
    the detected MIDI notes.").
- **Constraints a re-run can pass:** frequency ranges on most pitch algorithms; a tuning reference
  (`tuningFrequency`) on `PitchContourSegmentation` (any integer Hz) and on `Audio2Midi` (432 or 440 only); a
  transposition in semitones (`transpositionAmount`) on `Audio2Midi`; `referenceFrequency` on Melodia.
- **Observed on this box (`trials.md`, batch r0321):** `PitchYinProbabilistic` with its defaults returned
  frequencies that did not match the input (for a 110 Hz test sine a median of 103.826 Hz, for 440 Hz 293.665 Hz),
  while Essentia's `PitchYin` read the same sines correctly; the cause is UNVERIFIED in `trials.md`.
- **Access needs:** a commercial license for the library and models is "upon request" from UPF (quotes below).
- **License facts:**
  - a. Code: AGPL-3.0. `COPYING.txt` at master is the "GNU AFFERO GENERAL PUBLIC LICENSE Version 3"; "Essentia
    Licensing.txt" (https://raw.githubusercontent.com/MTG/essentia/master/Essentia%20Licensing.txt, read
    2026-11-10): "Essentia is free software: you can redistribute it and/or modify it under the terms of the GNU
    Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version." The licensing page (https://essentia.upf.edu/licensing_information.html,
    read 2026-11-10): "Essentia is available under an open licence, Affero GPLv3, for non-commercial applications,
    thus it is possible to test the library before deciding to licence it under a comercial licence." and "Some
    Essentia library algorithms use third-party libraries with licenses such as GPL, LGPL, and others for which UPF
    is not able to provide full sublicensing rights to third parties." PyPI metadata: `license_expression`
    `AGPL-3.0-only`.
  - b. Weights (the sources disagree; all quoted):
    - Licensing page: "All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use, and
      are also available under a proprietary license upon request."
    - Models page (https://essentia.upf.edu/models.html): "All the models created by the MTG are licensed under CC
      BY-NC-SA 4.0 and are also available under proprietary license upon request. Check the LICENSE of the models."
    - That LICENSE (https://essentia.upf.edu/models/LICENSE, read 2026-11-10): "The model files are copyrighted by
      Universitat Pompeu Fabra 2019-2021 and distributed under the following license: Creative Commons
      Attribution-NonCommercial-NoDerivatives 4.0", followed by "All legal details can be found here:
      http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode" and "For a commercial use, the models are also
      available under proprietary license upon request". On CREPE: "Models with OpenL3 and CREPE architecture are
      derived from work licensed under the MIT license terms."
    - `MTG/essentia-models` LICENSE (https://raw.githubusercontent.com/MTG/essentia-models/master/LICENSE, read
      2026-11-10): "This licensing file applies to all model files (*.pb file extension) hosted in this directory.
      The model files are copyrighted by Universitat Pompeu Fabra 2019-2020 and distributed under the following
      license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0".
    - The CREPE metadata file (https://essentia.upf.edu/models/pitch/crepe/crepe-full-1.json, read 2026-11-10) has
      no license field; it names `"author": "Pablo Alonso"`, `"release_date": "10/08/2021"`, and describes "360
      dimensions corresponding to pitch values ranging from C1 (32.70Hz) to B7(1975.5Hz) divided with 20-cent
      steps. This is the full version of the model (85MB)."
  - c. Training data: the models page says the CREPE models were "trained on the RWC-synth and the MDB-stem-synth
    datasets"; the metadata gives `"dataset": {"name": "RWC-synth, MDB-stem-synth"}`. See the dataset section.
  - d. Service: not applicable.

## 11. MELODIA Vamp plugin and `audio_to_midi_melodia`

- **What, who, links:** "The MELODIA plug-in automatically estimates the pitch of a song's main melody" (MTG
  page, https://www.upf.edu/web/mtg/melodia, read 2026-11-10). By Justin Salamon, Music Technology Group, UPF.
  Paper: Salamon and Gómez, IEEE TASLP 20(6), 2012 (cited on that page). The wrapper
  https://github.com/justinsalamon/audio_to_midi_melodia (last commit 2020-04-03) "Extract[s] the melody notes from
  an audio file and export[s] them to MIDI and (optionally) JAMS files" (README read 2026-11-10).
- **Version:** "MELODIA 1.0" (MTG page). Platforms: "available for Windows, OSX and Linux"; Linux zip
  "MTG-MELODIA 1.0 (Linux 32/64-bit).zip" to be copied to `/usr/local/lib/vamp`. Download is behind a "DOWNLOAD
  FORM" (not filled in by this agent).
- **How a program calls it:** from a Vamp host ("Sonic Visualiser, Sonic Annotator or Audacity", MTG page), or
  through `audio_to_midi_melodia.py infile outfile bpm [--smooth SMOOTH] [--minduration MINDURATION] [--jams]`,
  which needs the plugin installed (the README's "Non-python dependencies" heading lists "Melodia melody extraction
  Vamp plugin"). Essentia's
  `PredominantPitchMelodia` (section 10) estimates the melody "using the MELODIA algorithm" (Essentia reference
  page) and is covered by Essentia's licenses, not by the plugin's.
- **Input:** "Audio file in a format supported by your Vamp host (e.g. wav, mp3, ogg)".
- **Output:** "Melody: The pitch of the main melody. Each row of the output contains a timestamp and the
  corresponding frequency of the melody in Hertz. Non-voiced segments are indicated by zero or negative frequency
  values", plus salience-function and pitch-contour outputs from the "intermediate steps" plugin. The wrapper
  writes MIDI (notes quantized after melody extraction, tempo taken from the `bpm` argument) and optional JAMS.
- **License facts:**
  - a. Plugin: MTG page, read 2026-11-10: "The MELODIA 1.0 Vamp plug-in is offered free of charge for
    non-commercial use only." and "Plug-in authored by Justin Salamon. © Copyright 2012 Music Technology Group,
    Universitat Pompeu Fabra. All Rights Reserved." Wrapper: no LICENSE file in the root listing of
    https://github.com/justinsalamon/audio_to_midi_melodia at b4fb5b4 on 2026-11-10.
    UNVERIFIED by the verifier: could not fetch https://www.upf.edu/web/mtg/melodia on 2026-11-10 (HTTP 403 with a
    Cloudflare "Just a moment..." challenge page, from curl and from the web-fetch tool; the archived copy at
    web.archive.org, snapshot 2026-10-31, could not be reached: connection reset). The docs agent's saved text of the
    page, fetched at about 21:05 UTC the same day (`/home/user/gtr/lanes/audio-to-notes/fetched/web/melodia_mtg.txt`,
    outside the repo), contains both license quotes and the version, platform, host, input and output quotes above
    word for word. Settled by reading the live page in a browser.
  - b, c. DSP algorithm, no trained weights or training data.

## 15. MT3 (Multi-Task Multitrack Music Transcription, Google Magenta)

- **What, who, links:** "MT3 is a multi-instrument automatic music transcription model that uses the T5X
  framework. This is not an officially supported Google product." (README,
  https://raw.githubusercontent.com/magenta/mt3/main/README.md, read 2026-11-10). Repository
  https://github.com/magenta/mt3 . Paper: Gardner et al., "MT3: Multi-Task Multitrack Music Transcription", ICLR
  2022, https://arxiv.org/abs/2111.03017 (PDF read 2026-11-10).
- **Version and maintenance:** no PyPI release from Magenta; `mt3/version.py` says `__version__ = '0.0.1'`; last
  commit 2026-10-27 (7ecf19d). README: "For now, we do not (easily) support training." The PyPI project named `mt3`
  (0.2.1, 2022-06-09) is unrelated: its summary is "A simple module for outlier detection thanks to Modified
  Thompson Tau Test" and its home page is https://gitlab.com/h4c5/mt3 (PyPI JSON, read 2026-11-10).
- **How a program calls it:** the README's route is the Colab notebook
  `mt3/colab/music_transcription_with_transformers.ipynb` ("Use our colab notebook to transcribe audio files of
  your choosing"), whose cells import `jax`, `t5`, `t5x`, `seqio`, `note_seq` and TensorFlow (`setup.py` installs
  `t5x` from git), load a checkpoint from the Google Cloud Storage path `gs://mt3/checkpoints`, and offer two models: the ISMIR 2021 piano model and
  the ICLR 2022 multi-instrument model. No CLI and no HTTP API (a community Space, `akhaliq/MT3`, had the runtime
  stage `RUNTIME_ERROR` in the Hugging Face API on 2026-11-10, verifier and `trials.md`). CPU runs: not documented
  in the README. The
  notebook's install cell runs `python3 -m pip install jax[cuda12] nest-asyncio pyfluidsynth==1.3.0 -e .`, copies
  the checkpoints with `gcloud storage -q cp --recursive gs://mt3/checkpoints .`, and picks the model with
  `MODEL = "mt3" #@param["ismir2021", "mt3"]` (its markdown says the `mt3` model transcribes "without velocities").
- **Input:** the notebook sets `SAMPLE_RATE = 16000` and loads uploaded audio with
  `note_seq.audio_io.wav_data_to_samples_librosa`.
- **Output:** a `note_seq` NoteSequence, written to a MIDI file with `note_seq.sequence_proto_to_midi_file(...)`
  (notebook). The paper's output
  vocabulary includes "Instrument (128 values): Indicates which instrument the following messages should be
  directed to ... The choice of 128 distinct values is selected to match the original General MIDI specification,
  which contains 128 "programs" used to designate specific instruments."
- **Constraints a re-run can pass:** model choice (piano or multi-instrument); no tuning, key or note-range input
  in the notebook cells read.
- **Access needs:** a Colab runtime (Google account) as the documented path.
- **License facts:**
  - a. Code: Apache-2.0. https://raw.githubusercontent.com/magenta/mt3/main/LICENSE (Apache License 2.0 text),
    read 2026-11-10; source headers read "Licensed under the Apache License, Version 2.0" (`mt3/version.py`,
    "Copyright 2026 The MT3 Authors").
  - b. Weights: hosted at `gs://mt3/checkpoints`; no license statement for the checkpoints was found in the README
    or the notebook (the notebook's own header is "Copyright 2021 Google LLC. All Rights Reserved." followed by the
    Apache 2.0 notice). The bucket is publicly listable: a listing through the Cloud Storage JSON API
    (`https://storage.googleapis.com/storage/v1/b/mt3/o?prefix=checkpoints/`, verifier, 2026-11-10) returned 2,319
    objects in four folders, `ismir2021/` (296 files, 172,048,241 bytes), `mt3/` (296 files, 171,589,452 bytes),
    `ismir2022_base/` (1,031 files, 850,605,043 bytes) and `ismir2022_small/` (695 files, 193,899,548 bytes), and no
    object whose name contains "license", "readme", "notice", "terms" or "copying". UNVERIFIED: the checkpoints'
    license; settled by a statement from the authors.
  - c. Training data (paper, dataset table and text): Slakh2100, Cerberus4 ("derived from the Slakh2100
    dataset"), MAESTROv3, MusicNet, GuitarSet, URMP; "By training a single model across a mixture of all six
    datasets". See the dataset section.
  - d. Service: not applicable.
- **Author-reported measurements (paper, Table 2, Onset F1, MT3 trained on the mixture):** MAESTRO 0.95,
  Cerberus4 0.92, GuitarSet 0.90, MusicNet 0.50, Slakh2100 0.76, URMP 0.77.

## 16. YourMT3+

- **What, who, links:** "YourMT3: Multi-task and multi-track music transcription for everyone"; YourMT3+ is the
  MLSP 2024 paper, Chang et al., https://arxiv.org/abs/2407.04822 (PDF read 2026-11-10). GitHub
  https://github.com/mimbres/YourMT3 holds only `README.md` and `LICENSE` (tree at 8a4fbca, last commit
  2024-11-29); the README links the code as "(pre-release)" via an issue comment, a Colab demo, and "2024.08
  HuggingFace Spaces Demo (Free GPU) is out!" (an emoji before "HuggingFace" left out) at
  https://huggingface.co/spaces/mimbres/YourMT3 . README also:
  "2024.11 Sorry! YouTube is blocked again...".
- **Where the code and weights are:** the Space's file list (Hugging Face API, read 2026-11-10; last modified
  2025-01-31) contains `amt/src/...` (the model code) and several checkpoints under `amt/logs/2024/.../checkpoints/`
  of 361 MB to 759 MB each (for example `.../mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b80_ps2/checkpoints/model.ckpt`,
  758,957,292 bytes).
- **How a program calls it:** the Space is a Gradio app (`sdk: gradio`, `app_file: app.py`), so
  `gradio_client` can call it (the hosted-apis lane covers calling Spaces); locally, by running the Space's code.
  No PyPI package.
- **Output (verifier, from the Space's `app.py` and `html_helper.py`,
  https://huggingface.co/spaces/mimbres/YourMT3/raw/main/app.py, read 2026-11-10):** the upload handler
  `process_audio(audio_filepath)` transcribes to a MIDI file, turns it into a data URL (`to_data_url`:
  `'data:audio/midi;base64,'+...`) and returns `create_html_from_midi(midifile)`, an HTML page with an embedded
  `html-midi-player`; so a client receives an HTML string and the MIDI bytes are the base64 part of the data URL.
  The model selected in `app.py` is `model_name = 'YPTF.MoE+Multi (noPS)'`, whose checkpoint is
  `mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b36_nops@last.ckpt` (561,544,628 bytes in the Space's
  file list). The Gradio API listing the try agent
  saved (`/home/user/gtr/lanes/audio-to-notes/logs/yourmt3-api.txt`) shows `predict(audio_filepath,
  api_name="/process_audio")` returning "[Html] value_27: str". Its one call (S2n,
  `out/yourmt3-space/space_calls.json`) returned an error, not a transcription: "You have exceeded your ZeroGPU quota
  (90s requested vs. 79s left)" (Space hardware `zero-a10g`, Space sha 5e66c1e).
- **License facts (sources disagree; both quoted):**
  - a. Code: GitHub `LICENSE` (https://raw.githubusercontent.com/mimbres/YourMT3/main/LICENSE, read 2026-11-10)
    is "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007". The Space's card front matter
    (https://huggingface.co/spaces/mimbres/YourMT3/raw/main/README.md, read 2026-11-10) says `license: apache-2.0`.
  - b. Weights: inside the Space repository; the only license statement found for them is that card's
    `license: apache-2.0`.
  - c. Training data (paper, Table 1, "Train"): MusicNet-EM, GuitarSet, MIR-ST500, ENST-Drums, Slakh, EGMD,
    Maestro, CMedia, URMP, SMT-Bass. See the dataset section for the ones whose licenses were read.
  - d. Service: the Space runs on Hugging Face; Hugging Face's terms are the hosted-apis lane's.
- **Author-reported measurements (paper, Table 2, note onset F1):** GuitarSet (MT3 protocol) 91.65 (noPS) /
  88.87 (PS) for YPTF.MoE+M, against 89.10 for "MT3 (colab)"; Slakh instrument-agnostic onset F1 84.14 / 84.56
  for YPTF.MoE+M.

## 17. MR-MT3

- **What, who, links:** "Code accompanying paper: MR-MT3: Memory Retaining Multi-Track Music Transcription to
  Mitigate Instrument Leakage" (README, https://raw.githubusercontent.com/gudgud96/MR-MT3/master/README.md, read
  2026-11-10). Authors in LICENSE: Hao Hao Tan, Kin Wai Cheuk, Taemin Cho, Wei-Hsiang Liao, Yuki Mitsufuji. Paper
  https://arxiv.org/abs/2403.10024 (PDF read 2026-11-10). Repository https://github.com/gudgud96/MR-MT3 .
- **Version and maintenance:** no PyPI package; last commit 2024-07-12 (826ea84).
- **How a program calls it:** a research codebase: conda environment (`conda create --name mrmt3 python==3.10`) with
  pinned packages (`transformers==4.18.0`, `torch`, `t5==0.9.3`, `note-seq==0.0.3`, `tensorflow==2.11`, ...) listed
  in the README. The README's route to transcription is evaluation: "Refer to `test.sh`" and "each command runs
  `test.py` that: transcribe MIDI files based on a given `eval.audio_dir`". Weights: Hugging Face `gudgud1014/MR-MT3`
  (card license tag `mit`, API read 2026-11-10) with files such as `mt3.pth` (183,672,643 bytes),
  `slakh_f1_0.65.pth`, and several `.ckpt` files of about 582 MB.
- **Input / output (verifier, `inference.py` at 826ea84):** `class InferenceHandler(model=None, weight_path=None,
  device=torch.device('cuda'), mel_norm=True, contiguous_inference=False, use_tf_spectral_ops=False)` with
  `SAMPLE_RATE = 16000`; `inference(audio, audio_path, outpath=None, valid_programs=None, num_beams=1, batch_size=5,
  max_length=1024)` writes a MIDI file with `note_seq.sequence_proto_to_midi_file` (default path
  `./out/<audio file stem>.mid`). `valid_programs` turns every other MIDI program into `bad_words_ids` for
  generation, i.e. it restricts which instruments can be decoded. The generation loop calls `self.model.cuda()`
  without a device check, so the file as shipped needs a CUDA GPU. The README's Slakh preparation step is
  "Re-sample Slakh `.flac` to 16kHz".
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/gudgud96/MR-MT3/master/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2024 Hao Hao Tan, Kin Wai Cheuk, Taemin Cho, Wei-Hsiang Liao, Yuki Mitsufuji" with the standard
    MIT grant.
  - b. Weights: `gudgud1014/MR-MT3` card license tag `mit` (its README is 24 bytes, front matter only).
  - c. Training data (paper, 4.1): Slakh2100 ("in which the duplicated tracks are removed"); evaluations also on
    ComMU and NSynth.
- **Author-reported measurements (paper, Table 4 "Cross-dataset evaluation", models trained from scratch on Slakh
  mixes, evaluated on Slakh; verifier re-read 2026-11-10):** onset F1 in % (the "Onset F1 Scores (%)" header of the
  paper's Tables 2 and 3) in the "Flat" column: "MR-MT3 Slakh Mixes" 67.3 against "MT3 Slakh Mixes" 64.9; "Full"
  column 35.3 against 33.5; instrument leakage ratio (in parentheses after the model names) 1.24 against 1.65.

## 18. mt3-pytorch (kunato)

- **What, links:** a PyTorch port of MT3 inference, https://github.com/kunato/mt3-pytorch . Last commit
  2022-05-24 (e203122). Root listing includes `inference.py`, `mt3_net.py`, `pretrained/`.
- **License facts:** no LICENSE file in the repository root listing at e203122, read 2026-11-10 (no license file
  found at https://github.com/kunato/mt3-pytorch on 2026-11-10). Weights: converted from MT3 (see MT3 b).

## 19. MuScriptor (Kyutai and Mirelo)

- **What, who, links:** "MuScriptor is a multi-instrument music transcription model developed by Kyutai and
  Mirelo. It turns a recording into MIDI and into sheet music." (README,
  https://raw.githubusercontent.com/muscriptor/muscriptor/main/README.md, read 2026-11-10; the README also makes
  a comparative claim about accuracy, not repeated here). Paper: Rouard, Krause, Roebel, Simon-Gabriel, Défossez,
  "MuScriptor: An Open Model for Multi-Instrument Music Transcription", https://arxiv.org/abs/2607.08168 (PDF read
  2026-11-10). Hosted UI: https://muscriptor.kyutai.org (not read by the docs agent; its static HTML was read by the
  verifier, section 34).
- **Version and maintenance:** PyPI `muscriptor` 0.4.0 uploaded 2026-10-20 (first upload 2026-07-10,
  `requires_python='>=3.10'`, `license_expression='MIT'`); last commit 2026-10-20 (8a1ef88).
- **How a program calls it (README):** CLI `uvx muscriptor transcribe path/to/audio_file.wav` (`--help` for
  options), web UI `uvx muscriptor serve`, Python `pip install muscriptor` (`load_model()` named in the README; the
  README also says "if you install with pip/uv instead, use Python 3.10–3.12").
  Weights download on first use after a Hugging Face login: "To use MuScriptor locally, you first need to log into
  HuggingFace and accept the CC BY-NC 4.0 license" (access "is granted automatically"; the Hugging Face API shows
  `gated: auto` for all three repositories).
  - Python API, two sources that differ (verifier, 2026-11-10). The model card on the HTML page
    https://huggingface.co/MuScriptor/muscriptor-small (readable anonymously although the raw card file is gated)
    shows `model = TranscriptionModel.load_model("small")`, `model.transcribe_to_midi("audio.wav")` (MIDI bytes)
    and `model.transcribe("audio.wav")`, with instruments passed as `instrument_group=`. The code at 8a1ef88
    (`muscriptor/transcription_model.py`) has `load_model`, `transcribe(audio, use_sampling=False,
    temperature=1.0, cfg_coef=1.0, instruments: list[str] | None = None, batch_size=None, no_eos_is_ok=True,
    beam_size=1, prelude_forcing=True)` yielding `NoteStartEvent | NoteEndEvent | ProgressEvent`,
    `transcribe_and_postprocess`, `detect_beat_grid_for` and `events_to_midi_bytes`, and no `transcribe_to_midi`
    (`git grep` of `muscriptor/*.py` at that commit); its docstring: "``instruments``, when given, is a hard
    constraint: every program/drum token outside the listed groups is masked out during generation". In
    `muscriptor/events.py` `NoteStartEvent` has `pitch: int`, `start_time: float`, `index: int`,
    `instrument: str`, and `NoteEndEvent` has `end_time: float` and its `start_event`.
  - CLI (`muscriptor/main.py` at 8a1ef88, read by the verifier): `transcribe` takes `--format` "midi (default),
    json (single array of events), jsonl (one event per line, streamed as transcription progresses), or sheets",
    `--output/-o`, `--model/-m` ("Model size ('small', 'medium', 'large'; default: medium), a local safetensors path,
    or an hf:// / http(s):// URL"), `--device/-d` ("'auto', 'cpu', 'cuda', 'cuda:0', 'mps', …"), `--instruments`,
    `--detect-tempo true|false|best-effort` (default best-effort), `--auralize` (needs `fluidsynth`), the timing and
    quantization options below, and others; `muscriptor list-instruments` prints the accepted instrument names.
- **Model sizes (README table):** `small` 103M parameters, `medium` (default) 307M, `large` 1.4B; "`small` is the
  practical choice on CPU-only machines, `medium` is the default speed/accuracy trade-off, and `large` ... really
  wants a GPU." Weight files (Hugging Face API, read 2026-11-10): small 411,888,600 bytes, medium 1,228,144,472
  bytes, large 5,465,642,136 bytes (`model.safetensors`). GGUF conversions exist at `DamRsn/muscriptor-gguf`
  (card license `cc-by-nc-4.0`; f16 files 209 MB, 618 MB, 2.74 GB; last modified 2026-11-08).
- **Output (README):** MIDI with "beats, time signature and bar lines ... detected from the audio and written
  into the MIDI" (a tempo map when the tempo is not steady); with `--format sheets` (needs MuseScore 4 or newer):
  `score.mid`, `score.musicxml`, `full_score.pdf`, one PDF per instrument and "a tablature PDF for fretted ones"
  (for example `01_electric_guitar_tab.pdf`).
  - Per-note fields (verifier): the model card says "the tokenizer recovers onset/offset timing, pitch, and
    instrument, but not velocity. It also cannot represent two notes of the same pitch and instrument sounding at
    the same time. Drums are onset-only." and "the 128 MIDI programs are mapped to 36 instrument subgroups using the
    MT3_FULL_PLUS taxonomy". In the code, `notes_to_midi(notes, velocity: int = 100, program_names=..., ...)`
    (`muscriptor/utils/midi.py`) writes the MIDI with `mido`, one fixed velocity, and track names taken from
    `program_names` ("maps program numbers to human-readable track names").
  - Input (model card): "raw waveform (16 kHz, mono) of a 5-second segment"; "Input audio can be WAV or any format
    libsndfile reads (mp3, flac, ogg, m4a, …)".
- **Constraints a re-run can pass (README):** `--bpm`, `--beats-per-bar`, `--first-downbeat`, `--fixed-tempo`,
  `--beat-scale 2|0.5`, `--quantize`, `--grid`, `--quantize-strength`, `--fill-gaps`, `--trim-leading-bars`,
  `--model`. The paper (contribution 4): "Instrument-conditioned Transcription: By optionally conditioning on
  instrument presence, we stabilize predictions across different segments of a music recording and allow users to
  customize their transcription output." and (3.2) "we provide the model with the set of instruments present in the
  full track rather than the local excerpt". The released CLI exposes it (verifier, `muscriptor/main.py` at
  8a1ef88): `--instruments`, "Comma-separated list of expected instrument group names. When given, every instrument
  not in the list is forbidden from being decoded at all. Case-insensitive; unambiguous abbreviations are accepted
  (e.g. 'timp,cello,dist'). Run 'muscriptor list-instruments' to see all available names." The model card's
  example is `muscriptor transcribe --model small --instruments "acoustic_piano,acoustic_guitar,acoustic_bass"
  audio.wav -o out.mid`; the card's Python argument is `instrument_group` (space-separated group IDs), the code's is
  `instruments` (a list of group names, see above). No tuning or capo option is in the README or in `main.py`.
- **Access needs:** a free Hugging Face account and acceptance of the gated model terms.
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/muscriptor/muscriptor/main/LICENSE, read 2026-11-10: "MIT
    License Copyright (c) 2026 Kyutai x Mirelo" with the standard MIT grant. README: "The code in this repository
    is released under the MIT license."
  - b. Weights: README: "The model weights, published on HuggingFace, are released under the CC BY-NC 4.0 license
    (non-commercial use)." Hugging Face card license tag `cc-by-nc-4.0` on `MuScriptor/muscriptor-small`,
    `-medium`, `-large` (API read 2026-11-10; the model cards' README files returned HTTP 401 to an anonymous
    request because the repositories are gated). The gate text and the card are shown on the HTML model page
    (https://huggingface.co/MuScriptor/muscriptor-small, read by the verifier 2026-11-10; the gate is part of the
    access terms and was missing from this file): "MuScriptor is the result of a research collaboration between
    Mirelo and Kyutai whose purpose is to transcribe audio to MIDI/music sheet. It is provided primarily for research
    purposes under the CC BY-NC 4.0 licence supplemented by the below specific conditions of use." and "Specific
    conditions of use: MuScriptor and any generated content by MuScriptor are provided as is without any warranty of
    any kind, including but not limited to any warranty of non-infringement. Use of MuScriptor and its output must
    comply with all applicable laws and must not result in, involve, or facilitate any illegal or unauthorized
    activity. Prohibited uses include, without limitation, inputting music files and transcribing them to MIDI/music
    sheet without having all the necessary rights, including intellectual property rights, under applicable laws.
    Accordingly, users of MuScriptor undertake and warrant to have all the necessary rights, including intellectual
    property rights, in connection with their use of MuScriptor and its output. We disclaim all liability for any
    non-compliant use and users of MuScriptor shall indemnify, defend, and hold harmless Mirelo and Kyutai from and
    against any and all claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees)
    incurred by Mirelo and/or Kyutai arising out of or resulting from their failure to comply with the terms of the
    CC BY-NC 4.0 licence and/or these specific conditions of use." The card's own license section: "Code released
    under the MIT License. Weights released under CC-BY-NC." The GGUF copies at `DamRsn/muscriptor-gguf` carry a
    `LICENSE` file (19,347 bytes) whose first line is "Attribution-NonCommercial 4.0 International" (read
    2026-11-10).
  - c. Training data (paper, 3.1, reference mark removed): "a dataset of roughly 1.45 million MIDI files (both from
    publicly available sources like Lakh MIDI and from commercial data providers)", synthesized "using a randomly selected soundfont
    (from a collection of over 250 soundfonts)", and "an internal dataset of 170 000 real music audio recordings
    (totalling over 11 000 hours) with aligned note annotations". The paper PDF carries "Licensed under a Creative
    Commons Attribution 4.0 International License (CC BY 4.0)" for the paper text.
  - d. Service: no terms, price or privacy link was found in the hosted UI's static HTML (verifier, 2026-11-10; the
    page needs JavaScript and the app was not run). UNVERIFIED: whether the running app shows terms; settled by
    opening the page in a browser.

## 20. Omnizart (music, vocal, vocal-contour, drum, chord, beat)

- **What, who, links:** "Omnizart is a Python library that aims for democratizing automatic music transcription.
  Given polyphonic music, it is able to transcribe pitched instruments, vocal melody, chords, drum events, and
  beat." (README, https://raw.githubusercontent.com/Music-and-Culture-Technology-Lab/omnizart/main/README.md,
  read 2026-11-10). Music and Culture Technology Lab (MCTLab in the LICENSE). JOSS paper
  https://doi.org/10.21105/joss.03391 (not read). Docs https://music-and-culture-technology-lab.github.io/omnizart-doc/ .
- **Version and maintenance:** PyPI `omnizart` 0.6.3 uploaded 2026-05-31; last commit 2026-05-31 (bcd8cb4).
  CHANGELOG (same repository, read 2026-11-10): "0.6.3 - 2026-05-31 ... Replaced the heavy PyTorch-based external
  CLI dependencies on Spleeter/Demucs with a lightweight, in-code `sherpa-onnx` backend"; "0.6.0 - 2026-05-30 ...
  Major compatibility upgrade supporting Python versions up to 3.14"; the previous entry is "0.5.0 - 2021-12-09
  Official Open JOSS reviewed version."
- **How a program calls it (README):** `pip install omnizart`, `omnizart download-checkpoints`, then
  `omnizart music transcribe <path/to/audio.wav>`, `omnizart drum transcribe ...`, `omnizart chord transcribe ...`
  (also `vocal`, `vocal-contour`, `beat`); Docker image `mctlab/omnizart:latest`; Colab and Replicate badges. PyPI
  0.6.3 ships only a source archive (`omnizart-0.6.3.tar.gz`, 10,563,808 bytes) and requires `madmom>=0.16.1`,
  `sherpa-onnx>=1.10.0`, `tensorflow>=2.5.0` (for Python < 3.14) and `vamp>=1.1.0` (PyPI JSON, verifier
  2026-11-10). CHANGELOG
  0.4.2 (2021-11-16): "Migrate checkpoints from private Google Drive to Github release", linking the release tag
  `checkpoints-20211001`.
- **Input / output (music CLI page, https://music-and-culture-technology-lab.github.io/omnizart-doc/music/cli.html,
  read 2026-11-10):** "Transcribe a single audio and output as a MIDI file"; `-m/--model-path` ("Supported modes
  are: Piano, Stream, Pop"); `-o/--output` ("Path to output the prediction file (could be MIDI, CSV, …, etc.)").
  The README's table: `music` "Transcribe musical notes of pitched instruments", `vocal` "Transcribe note-level
  vocal melody", `vocal-contour` "Transcribe frame-level vocal melody (F0)". The training CLI's label option:
  "note- (onset, duration) or stream-level (onset, duration, instrument)".
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/Music-and-Culture-Technology-Lab/omnizart/main/LICENSE, read
    2026-11-10: "MIT License Copyright (c) 2020 MCTLab" with the standard MIT grant.
  - b. Weights: GitHub release `checkpoints-20211001`; no separate license statement for the checkpoints was read
    (UNVERIFIED). `omnizart/cli/cli.py` at bcd8cb4 downloads them from
    `https://github.com/Music-and-Culture-Technology-Lab/omnizart/releases/download/checkpoints-20211001/<name>@variables.data-00000-of-00001`
    (names include `music_piano`, `music_piano-v2`, `music_pop`, `music_note_stream`, `vocal_semi`, `contour`,
    `drum_keras`, `chord_v1`, `beat_blstm`). Since 0.6.3 the vocal mode also downloads
    `https://github.com/k2-fsa/sherpa-onnx/releases/download/source-separation-models/sherpa-onnx-spleeter-2stems-fp16.tar.bz2`
    (`omnizart/vocal/app.py`, `_ensure_sherpa_spleeter_model`, verifier 2026-11-10; the archive answers HTTP 200 with
    35,271,738 bytes to a HEAD request); the license of that ONNX
    conversion of Spleeter was not read here (UNVERIFIED; the source-separation lane covers Spleeter).
  - c. Training data: the music CLI page lists the datasets its feature extraction accepts: "Maps: Piano solo
    performances (smaller)", "Maestro: Piano solo performances (larger)", "MusicNet: Classical music performances,
    with 11 classes of instruments", "Pop: Pop music, including various instruments, drums, and vocal". Which
    dataset trained each released mode (Piano, Stream, Pop): UNVERIFIED.

## 21. Timbre-Trap

- **What, who, links:** "Code for the paper "Timbre-Trap: A Low-Resource Framework for Instrument-Agnostic Music
  Transcription"" (README, https://raw.githubusercontent.com/sony/timbre-trap/main/README.md, read 2026-11-10);
  multi-pitch estimation. Paper (Cwitkowitz, Cheuk, Choi, Martínez-Ramírez, Toyama, Liao, Mitsufuji; University of
  Rochester, Sony AI, Sony Group Corporation): https://arxiv.org/abs/2309.15717 (PDF read
  2026-11-10). Repository https://github.com/sony/timbre-trap , last commit 2024-05-05 (7afe7e9); no PyPI package.
- **How a program calls it:** "Clone the repository, install the requirements, then install timbre-trap"
  (`pip install -e timbre-trap/`); "A dedicated Hugging Face Space is available for performing inference with
  Timbre-Trap": https://huggingface.co/spaces/cwitkowitz/timbre-trap (Gradio, last modified 2026-01-15, holds
  `models/tt-orig.pt`, 11,353,410 bytes).
- **Output:** multi-pitch estimation (README heading: "Instrument-Agnostic Multi-Pitch Estimation (Timbre-Trap)";
  it also lists "Transcription, reconstruction, and consistency objectives"). The Space's `app.py`
  (https://huggingface.co/spaces/cwitkowitz/timbre-trap/raw/main/app.py, read by the verifier 2026-11-10) returns
  audio, not notes: its inputs are an audio file and a "Remove Timbre" checkbox ("switch between transcription
  (checked) and reconstruction (unchecked) mode"); `process_fn` resamples to 22050 Hz mono, runs
  `model.chunked_inference(audio, transcribe)`, inverts the coefficients with `model.sliCQ.decode`, low-pass filters
  at 8000 Hz, resamples back and saves `_outputs/output.wav`, which is the only output component (`gr.Audio`). The
  model card in `app.py` reads "De-timbre your audio!". It is built as a HARP endpoint (`pyharp`) and runs on CPU when
  no CUDA device is present. A pitch list or MIDI would need the repository's own code. The Space's runtime stage
  was `RUNTIME_ERROR` (Hugging Face API `api/spaces/cwitkowitz/timbre-trap`, verifier 2026-11-10; also reported in
  `trials.md`).
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/sony/timbre-trap/main/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2024 Sony" with the standard MIT grant.
  - b. Weights: `tt-orig.pt` in the Space; the Space card has no license field (API and README read 2026-11-10).
  - c. Training data (paper): "the URMP dataset is used for training and validation"; Bach10, Su and the player-05
    split of GuitarSet are used for evaluation. See the dataset section for URMP and GuitarSet.

## 22. Sheet Sage

- **What, who, links:** "Sheet Sage transcribes your favorite pop song into a lead sheet containing the melody and
  chords!" (README, https://raw.githubusercontent.com/chrisdonahue/sheetsage/main/README.md, read 2026-11-10).
  Paper: Donahue, Thickstun, Liang (Stanford University), "Melody Transcription via Generative Pre-Training",
  https://arxiv.org/abs/2212.01884 (PDF read 2026-11-10). Repository https://github.com/chrisdonahue/sheetsage , last commit 2025-05-13
  (bbdd7b7).
- **How a program calls it (README):** Linux with Docker: `./prepare.sh` downloads "a ~4GB Docker container and
  ~100MB of data", then `./sheetsage.sh my_song.mp3` (or a YouTube URL). Options: `-s <start>`, `-e <end>`,
  `--beats_per_minute_hint 120`, `--segment_hints_are_downbeats`, `--legacy_behavior`, and `-j` for Jukebox
  features, for which "you must first ensure you have a GPU w/ at least 12GB memory and CUDA installed".
- **Output:** "a directory output/<UUID> containing a PDF with the lead sheet (along with the corresponding
  LilyPond file), and a MIDI file containing audio-aligned melody and harmony." Beat and downbeat detection use
  madmom (README).
- **Constraints a re-run can pass:** segment start and end, a tempo hint, downbeat hints.
- **Access needs:** the Jukebox mode needs a GPU with at least 12 GB memory (README).
- **License facts:**
  - a. Code: MIT, with a note. https://raw.githubusercontent.com/chrisdonahue/sheetsage/main/LICENSE, read
    2026-11-10: "IMPORTANT NOTE: All *code* in this repository is MIT-licensed, but dataset and trained models are
    distributed under CC BY-NC-SA 3.0, as they are derived from user contributions on HookTheory
    (https://forum.hooktheory.com/tos). See README.md for more details."
  - b. Weights: CC BY-NC-SA 3.0 (the same LICENSE note). The README's own "Licensing" paragraph (same README URL,
    read by the verifier 2026-11-10; missing from this file before): "Because they are trained on user contributions
    to HookTheory, the transcription models underneath the hood of Sheet Sage (specifically, all of the files
    referenced in sheetsage.json which are downloaded by the prepare.sh script) are released under CC BY-NC-SA 3.0.
    Moreover, Sheet Sage makes use of madmom, Jukebox, and Melisma, which all have additional licensing terms
    affecting commercial use." (Link markup removed.) madmom's own LICENSE is quoted in section 12 (CREPE Notes).
  - c. Training data (README): "Sheet Sage was trained on a new dataset of 50 hours of aligned melody and harmony
    annotations derived from Hooktheory's TheoryTab DB, which we release alongside this system under a CC BY-NC-SA
    3.0" license.

## 23. Deep Salience

- **What, who, links:** companion code for Bittner, McFee, Salamon, Li, Bello, "Deep Salience Representations for
  F0 Estimation in Polyphonic Music", ISMIR 2017 (README, https://raw.githubusercontent.com/rabitt/ismir2017-deepsalience/master/README.md,
  read 2026-11-10). Repository https://github.com/rabitt/ismir2017-deepsalience , last commit 2019-11-22 (4b2ff44).
- **How a program calls it:** "To compute output from these models, run the script predict/predict_on_audio.py"
  (Keras). Weights in the repository: `predict/weights/{bass,melody1,melody2,melody3,multif0,pitch,vocal}.h5`
  (about 1.67 MB each). Arguments and outputs (verifier, `predict/predict_on_audio.py` at 4b2ff44, read
  2026-11-10): `python predict/predict_on_audio.py <audio_fpath> <task> <save_dir> [-f singlef0|multif0|salience]
  [-t THRESHOLD] [-n USE_NEG]`, where task is one of "all, bass, melody1, melody2, melody3, multif0, pitch, vocal";
  `-f salience` (the default) writes `<name>_<task>_salience.npz` with arrays `salience`, `times`, `freqs`;
  `singlef0` writes a tab-separated `<name>_<task>_singlef0.csv` of `time<TAB>frequency` rows (unvoiced frames as
  negative values when `-n` is true, the default); `multif0` writes `<name>_<task>_multif0.csv`, each row a time
  followed by a variable number of frequencies. `-t` (default 0.3) is the amplitude threshold. The script imports
  `keras.layers.convolutional` and `keras.layers.normalization` (Keras 2 module paths).
- **License facts:** a. Code: MIT. https://raw.githubusercontent.com/rabitt/ismir2017-deepsalience/master/LICENSE,
  read 2026-11-10: "MIT License Copyright (c) 2017 Rachel Bittner" with the standard MIT grant. b. Weights: in the
  MIT repository; no separate statement found. c. Training data: not read here (the paper is not on arXiv under a
  link in the README; UNVERIFIED).

## 14. NeuralNote

- **What, who, links:** an audio plugin for "audio-to-MIDI transcription" inside a "Digital Audio Workstation" (README, https://raw.githubusercontent.com/DamRsn/NeuralNote/main/README.md,
  read 2026-11-10). Repository owner `DamRsn`. Website https://neuralnote.co/ (not read). Last commit 2026-11-07 (ae7fd80).
- **Version facts (README):** "NeuralNote v2 is out!" and "v2 replaces Spotify's Basic Pitch with MuScriptor, from
  Kyutai and Mirelo ... It is a transformer with 103M to 1.4B parameters, compared with fewer than 17K for Basic
  Pitch." "Transcription runs on your machine, on the GPU or the CPU". v1 used Basic Pitch.
- **How it is used:** a VST3/AU plugin and Standalone app; "drop an audio file on the plugin (.wav, .aiff, .flac,
  .mp3, .ogg (vorbis) and, on macOS, .m4a are supported)", click Transcribe, then drag the MIDI to a track or save
  the MIDI file. Downloads: macOS 11 or later (arm64 and x64 installers), Windows x64; "Linux: prebuilt binaries
  are coming soon. In the meantime, you can build from source." "The transcription model is not included. Download
  it from within NeuralNote" (GGUF files from `DamRsn/muscriptor-gguf`). No CLI or HTTP API is described in the
  README. The README's third-party list includes `muscriptor.cpp` (https://github.com/DamRsn/muscriptor.cpp, "MIT
  license") and `ggml` ("MIT license"); the README describes muscriptor.cpp as "a C++/ggml port of MuScriptor" that
  "takes 16 kHz mono float32 audio and returns note events". Verifier, 2026-11-10: `DamRsn/muscriptor.cpp` (last
  commit 2026-11-07, 8589219) has a LICENSE beginning "MIT License" and "Copyright (c) 2026 Damien Ronssin"
  (https://raw.githubusercontent.com/DamRsn/muscriptor.cpp/main/LICENSE).
- **Access needs:** a macOS or Windows desktop with a DAW or the Standalone app (or a Linux source build).
- **License facts:**
  - a. Code: Apache-2.0. README: "NeuralNote's code is published under the Apache-2.0 license."
    https://raw.githubusercontent.com/DamRsn/NeuralNote/main/LICENSE is the Apache License 2.0 text (read
    2026-11-10).
  - b. Weights: README: "The MuScriptor model weights are not open source. They were released by Kyutai and Mirelo
    under the CC BY-NC 4.0 license, and are redistributed as GGUF files on Hugging Face under that same license.
    They may only be used non-commercially. The Apache-2.0 license covers NeuralNote's code only, not the weights."
  - c. Training data: MuScriptor's (section 19).
  - Third-party list in the README includes "JUCE (JUCE Starter)" and "ASIO SDK headers (Steinberg ASIO license,
    bundled with JUCE, Windows only)".

## 24. Onsets and Frames (Google Magenta)

- **What, who, links:** piano and drum transcription models, "including velocity estimation" (README, https://raw.githubusercontent.com/magenta/magenta/main/magenta/models/onsets_frames_transcription/README.md,
  read 2026-11-10). Papers: Hawthorne et al., https://arxiv.org/abs/1710.11153 and the MAESTRO paper
  https://arxiv.org/abs/1810.12247 (PDFs downloaded 2026-11-10).
- **Maintenance:** the `magenta/magenta` README (read 2026-11-10) begins: "This repository is currently inactive
  (archived, read only) and serves only as a supplement some of our papers." Last commit 2026-01-05 (c15687e).
  PyTorch port: https://github.com/jongwook/onsets-and-frames , last commit 2021-07-19 (783ca08).
- **How a program calls it (README):** download the piano checkpoint
  `https://storage.googleapis.com/magentadata/models/onsets_frames_transcription/maestro_checkpoint.zip` ("trained on
  the MAESTRO dataset") or the drum checkpoint `e-gmd_checkpoint.zip` ("trained on the E-GMD dataset"), then
  `onsets_frames_transcription_transcribe --model_dir="${MODEL_DIR}" <piano_recording1.wav, ...>` (with
  `--config="drums"` for drums). A Colab notebook is linked. Output (verifier, from
  `magenta/models/onsets_frames_transcription/onsets_frames_transcription_transcribe.py` at c15687e, read
  2026-11-10): for each input file the script writes `filename + FLAGS.transcribed_file_suffix + '.midi'` with
  `midi_io.sequence_proto_to_midi_file`, i.e. a MIDI file next to the input (`--transcribed_file_suffix` defaults to
  empty); other flags are `--checkpoint_path`, `--hparams`, `--load_audio_with_librosa` ("required for 24-bit
  audio") and `--log`. The script uses TensorFlow 1-style `tf.app.flags`.
- **License facts:**
  - a. Code: Apache-2.0. https://raw.githubusercontent.com/magenta/magenta/main/LICENSE, read 2026-11-10:
    "Copyright 2016 The Magenta Team. All rights reserved. Apache License Version 2.0, January 2004". The PyTorch
    port: https://raw.githubusercontent.com/jongwook/onsets-and-frames/master/LICENSE, read 2026-11-10: "Copyright
    2019 Jong Wook Kim" with the MIT grant text.
  - b. Weights: no license statement for the checkpoint zips was found in the README read. UNVERIFIED.
  - c. Training data: MAESTRO (piano), E-GMD (drums). See the dataset section for MAESTRO.

## 25. ByteDance piano transcription (`piano_transcription_inference`)

- **What, who, links:** "a piano transcription inference package that can be easily installed. Users can
  transcribe their favorite piano recordings to MIDI files after installation" (README,
  https://raw.githubusercontent.com/qiuqiangkong/piano_transcription_inference/master/README.md, read 2026-11-10).
  Paper: Qiuqiang Kong, Bochen Li, Xuchen Song, Yuan Wan, Yuxuan Wang, "High-resolution Piano Transcription with
  Pedals by Regressing Onset and Offset Times", https://arxiv.org/abs/2010.01815 (PDF read 2026-11-10). Training
  code under the GitHub organization `bytedance`: https://github.com/bytedance/piano_transcription (last commit
  2022-03-09).
- **Version and maintenance:** PyPI `piano-transcription-inference` 0.0.6 uploaded 2025-01-26; last commit
  2025-01-26 (0226e74).
- **How a program calls it (README):** `pip install piano_transcription_inference`; Python
  `transcriptor = PianoTranscription(device='cuda', checkpoint_path=None)  # device: 'cuda' | 'cpu'` then
  `transcribed_dict = transcriptor.transcribe(audio, 'out.mid')`, with audio loaded by
  `librosa.load(path, sr=sample_rate, mono=True)`; or `python3 example.py --audio_path=... --output_midi_path=...`.
  "This will download the pretrained model from https://zenodo.org/record/4034264." "This repo support Linux and
  Mac." "If users met the problem of "Killed". This is caused by there are not sufficient memory."
- **Output:** a MIDI file (the `transcribe(audio, 'cut_liszt.mid')` example writes one) and a Python dict
  (`transcribed_dict`); the paper covers notes and sustain pedals (title). Keys (verifier,
  `piano_transcription_inference/inference.py` and `utilities.py` at 0226e74, read 2026-11-10):
  `transcribed_dict = {'output_dict': ..., 'est_note_events': ..., 'est_pedal_events': ...}`; `output_dict` holds
  `reg_onset_output`, `reg_offset_output`, `frame_output`, `velocity_output` (per the docstring); a note event is a
  dict such as `{'midi_note': 51, 'onset_time': 696.63544, 'offset_time': 696.9948, 'velocity': 44}` (docstring
  example in `write_events_to_midi`), and pedal events are written to the MIDI as control change 64. The class
  signature is `PianoTranscription(model_type='Note_pedal', checkpoint_path=None, segment_samples=16000*10,
  device=torch.device('cuda'))`, so CPU use needs `device='cpu'` as in the README comment; with no
  `checkpoint_path` it downloads the Zenodo file to `~/piano_transcription_inference_data/` by calling `wget`
  through `os.system`.
- **License facts:**
  - a. Code: no LICENSE file in the repository root listing at 0226e74 (no license file found at
    https://github.com/qiuqiangkong/piano_transcription_inference on 2026-11-10). `setup.py` (read 2026-11-10)
    declares the classifier "License :: OSI Approved :: MIT License"; PyPI shows the same classifier. The training
    repository `bytedance/piano_transcription` also has no LICENSE file in its root listing at 1ade7dc.
  - b. Weights: Zenodo record https://zenodo.org/records/4034264 (read 2026-11-10): "Published September 17,
    2020", file `CRNN_note_F1=0.9677_pedal_F1=0.9186.pth` (172.0 MB), "License Creative Commons Attribution 4.0
    International".
  - c. Training data (paper): "we use the MAESTRO dataset V2.0.0, a large-scale dataset containing paired audio
    recording and MIDI files to train and evaluate our proposed piano transcription system" (reference mark
    removed). See the dataset section for MAESTRO.
- **Author-reported measurements:** onset F1 96.72 % on MAESTRO (paper abstract).

## 26. Transkun

- **What, who, links:** code "for transcribing expressive piano performance into MIDI" (README,
  https://raw.githubusercontent.com/Yujia-Yan/Transkun/main/README.md, read 2026-11-10). Yujia Yan and Zhiyao Duan.
  V2 paper (ISMIR 2024): https://arxiv.org/abs/2404.09466 (PDF downloaded 2026-11-10).
- **Version and maintenance:** PyPI `transkun` 2.0.1 uploaded 2024-09-28; last commit 2024-11-22 (c5cb837). The
  package ships `transkun/pretrained/2.0.pt` (56,408,978 bytes) and `2.0.conf`.
- **How a program calls it (README):** `pip3 install transkun`; `transkun input.mp3 output.mid` (default device
  CPU per the CLI help: "--device [DEVICE] ... DEFAULT: cpu"; `--device cuda` for GPU), plus `--weight`, `--conf`,
  `--segmentHopSize`. Colab notebook linked.
- **Output:** a MIDI file with notes, velocities and sustain pedal ("pedal activation", "pedal onset" columns in the
  model cards). README: "The code/pip package shipped checkpoint is trained without pedal extension of notes, and
  with data augmentation". As observed by the try agent on this box (`trials.md`, run r0216, `--device cpu`): one
  instrument, program 0, 960 ticks per quarter note, tempo 120, sustain pedal as CC64 events, no pitch bends. The
  CLI in `transkun/transcribe.py` at c5cb837 also takes `--segmentSize` (verifier).
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/Yujia-Yan/Transkun/main/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2021 Yujia Yan" with the standard MIT grant.
  - b. Weights: the shipped checkpoint is in the MIT-licensed package; the paper checkpoints are Google Drive links
    in the README's model cards. No separate weights license statement was found.
  - c. Training data: V2 paper, section 5.1 "Dataset" (reference mark removed): "Maestro v3.0.0. This dataset
  contains about 200 hours of
    piano performances ... We use the standard train/validation/test splits." The model cards also report MAPS and
    SMD. See the dataset section for MAESTRO.
- **Author-reported measurements (README model card, "Transkun V2 No Ext" on "Maestro V3 No Ext"):** note onset
  F1 0.9833, onset+offset F1 0.8149, onset+offset+velocity F1 0.8109.

## 27. hFT-Transformer

- **What, who, links:** "the official PyTorch implementation of "Automatic Piano Transcription with Hierarchical
  Frequency-Time Transformer" presented in ISMIR2023" (README, https://raw.githubusercontent.com/sony/hFT-Transformer/master/README.md,
  read 2026-11-10). Sony. Paper https://arxiv.org/abs/2307.04305 . Last commit 2026-10-28 (226992b).
- **How a program calls it (README):** requirements listed as "GPU", "Python", "Required Python libraries";
  shell scripts for corpus generation, training and evaluation on MAESTRO-V3; pretrained checkpoint
  `wget https://github.com/sony/hFT-Transformer/releases/download/ismir2023/checkpoint.zip` ("model_016_003.pkl is
  the model for MAESTRO"). No pip package, no single-file transcription CLI in the README lines read. The zip
  answers HTTP 200 with 20,540,269 bytes (HEAD request by the verifier, 2026-11-10; not downloaded).
- **License facts:**
  - a. Code: MIT, code only. https://raw.githubusercontent.com/sony/hFT-Transformer/master/LICENSE-CODE, read
    2026-11-10: "MIT License This license applies only to the source code in this repository. It does not apply to
    checkpoints, model weights, or trained parameters."
  - b. Weights: https://raw.githubusercontent.com/sony/hFT-Transformer/master/LICENSE-CHECKPOINTS.md, read
    2026-11-10: "The checkpoints are distributed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0
    International License." and "Commercial use is not permitted."
  - c. Training data: same file: "These checkpoints were trained using the MAESTRO v3.0.0 dataset." and "The
    MAESTRO v3.0.0 dataset is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0
    International License."

## 28. Aria-AMT (EleutherAI)

- **What, who, links:** an "implementation of seq-to-seq automatic piano transcription" (README,
  https://raw.githubusercontent.com/EleutherAI/aria-amt/main/README.md, read 2026-11-10). Repository
  https://github.com/EleutherAI/aria-amt , last commit 2025-12-16 (a1ab73f). No PyPI package ("Requires Python
  3.11", `pip install -e .` from a clone).
- **How a program calls it (README):** `aria-amt transcribe medium-double <path-to-checkpoint> -load_path
  <path-to-audio> -save_dir <dir> -bs 1 -compile` (`-load_dir` for batches; "NOTE: Int8 quantization is only
  supported on GPUs that support BF16."). Weights: "Piano (v1)"
  `https://huggingface.co/datasets/loubb/aria-midi/resolve/main/piano-medium-double-1.0.safetensors` (446,577,344
  bytes per the Hugging Face API and the download's `x-linked-size` header, 2026-11-10). The README also shows
  `yt-dlp` for getting audio from YouTube (the hosted-apis lane covers YouTube terms).
- **Output (verifier, `amt/run.py` and `amt/inference/transcribe.py` at a1ab73f, read 2026-11-10):** MIDI files:
  `-save_dir` is "dir to save midi files"; each input is saved as `<input stem>.mid` (with `_<index>` before `.mid` for
  each segment when segments are given with `-segments_json_path`; `get_save_path`) from the
  tokenizer's `mid_dict.to_midi()`. `-load_path` is "path to mp3/wav file". The `transcribe` function begins with
  `assert cuda_is_available(), "CUDA device not found"`, so the command as shipped stops on a machine without a
  CUDA GPU.
- **License facts:**
  - a. Code: Apache-2.0. https://raw.githubusercontent.com/EleutherAI/aria-amt/main/LICENSE (Apache License 2.0
    text), read 2026-11-10.
  - b. Weights: the checkpoint sits in the Hugging Face dataset repository `loubb/aria-midi`, whose card says
    `license: cc-by-nc-sa-4.0` and "Aria-MIDI is distributed with the CC-BY-NC-SA 4.0 license. By accessing this
    dataset, you declare that you agree to our disclaimer." (https://huggingface.co/datasets/loubb/aria-midi/raw/main/README.md,
    read 2026-11-10). The disclaimer (`DISCLAIMER.md`, same repository) includes: "This dataset may contain
    material that is protected by copyright, trademark, or other intellectual property rights owned by third
    parties." No license statement specific to the `.safetensors` file was found.
  - c. Training data: not stated in the README read (UNVERIFIED).

## 29. Onsets and Velocities

- **What, links:** software "to train and evaluate the Deep Learning piano onset+velocity detection model" of
  "Onsets and Velocities: Affordable Real-Time Piano Transcription Using Convolutional Neural Networks",
  https://arxiv.org/abs/2303.04485 (README, https://raw.githubusercontent.com/andres-fr/iamusica_training/master/README.md,
  read 2026-11-10). Last commit 2023-08-31 (629ff11). A pretrained model is in the repository:
  `assets/OnsetsAndVelocities_2023_03_04_09_53_53.289step=43500_f1=0.9675__0.9480.torch` (12,722,905 bytes).
- **License facts:** a. Code: GPL-3.0 (https://raw.githubusercontent.com/andres-fr/iamusica_training/master/LICENSE,
  "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007", read 2026-11-10). b. Weights: in the GPL-3.0 repository; no
  separate statement found. c. Training data (README): "training and evaluation is done using the MAESTRO dataset.
  Specifically, we focus on the latest version, MAESTROv3."

## 12. CREPE Notes (`crepe_notes`)

- **What, who, links:** "Post-processing for the CREPE pitch tracker to turn f0 pitch estimates into discrete
  notes (MIDI)" (README, https://raw.githubusercontent.com/xavriley/crepe_notes/main/README.md, read 2026-11-10).
  Repository owner `xavriley`: https://github.com/xavriley/crepe_notes , last commit 2026-03-13 (5390b17); PyPI
  `crepe-notes` 0.2.0 uploaded 2026-03-13.
- **How a program calls it (README):** `pip install crepe-notes[crepe]` (extras `[pesto]`, `[penn]`,
  `[torchcrepe]`), CLI `crepe_notes [path_to_original_audio]` or `crepe_notes --pitch-tracker pesto|penn|torchcrepe
  ...`; "A '.mid' file will be created in the current directory with the name
  `[audio_file_stem].[pitch_tracker].transcription.mid`." Features listed: "outputs midi notes for monophonic
  audio", "include MIDI velocity information", "options to filter notes that are too quiet or too short". The README
  names three parameters to tune: "Min duration, min velocity and sensitivity". It depends on madmom (README notes a
  Python 3.10+ madmom issue and a git install fix). madmom on PyPI is 0.16.1 with a single source archive
  (`madmom-0.16.1.tar.gz`, 20,040,947 bytes, no wheel) and the license field "BSD, CC BY-NC-SA" (PyPI JSON,
  verifier 2026-11-10).
- **CLI options in the code (verifier, `crepe_notes/cli.py` and `crepe_notes/crepe_notes.py` at 5390b17, read
  2026-11-10):** `--sensitivity` (default 0.001), `--min-duration` (default 0.03, "Minimum duration of a note in
  seconds"), `--min-velocity` (default 6), `--disable-splitting` ("Disable detection of repeated notes via onset
  detection"), `--tuning-offset` ("Manually apply a tuning offset in cents. Fractional numbers are allowed. Set to 0
  for no offset, otherwise it will be calculated automatically."), `--use-smoothing`, `--use-cwd`, `--f0` (a path),
  `--save-analysis-files`, `--output-label`, `--pitch-tracker crepe|pesto|penn|torchcrepe` (default crepe).
  `--f0` is read with `np.genfromtxt(f0_path, delimiter=',', names=True)` and only its `frequency` and
  `confidence` columns are used; the code treats rows as 10 ms steps (`step_size=0.01`). Without `--f0` it looks
  for `<audio>.<pitch_tracker>.f0.csv`, then `<audio>.f0.csv` (CREPE's CLI output name), before running the
  tracker. Repeated-note splitting runs `madmom.features.CNNOnsetProcessor` (a trained CNN) unless
  `--disable-splitting` is given.
- **License facts:** a. Code: GPL-3.0. https://raw.githubusercontent.com/xavriley/crepe_notes/main/LICENSE ("GNU
  GENERAL PUBLIC LICENSE Version 3, 29 June 2007"), read 2026-11-10; PyPI license field "GNU General Public License
  v3.0 license". b, c. It runs CREPE (or PESTO, PENN, torchcrepe) weights; see those sections. It also runs madmom's
  CNN onset model (above). madmom's LICENSE (https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE, read by the
  verifier 2026-11-10; madmom last commit 2024-08-25, 27f032e): "This software package contains source code files
  and data/model files. They are distributed under the following licenses." Source code: a BSD-style license
  ("Redistribution and use in source and binary forms, with or without modification, are permitted provided that
  the following conditions are met"). Models: "Data and model files usually have .npy, .npz, .h5, .hdf5, .pkl or
  .mat file extensions." and "All model and data files are distributed under the following license: Creative
  Commons Attribution-NonCommercial-ShareAlike 4.0". In madmom's repository the `madmom/models` folder is a git
  submodule (`.gitmodules`), so the model files themselves were not listed here.

## 30. melodyExtraction_JDC and melodyExtraction_SSL (Sangeun Kum)

- **What, links:** JDC: "The source code of "Joint Detection and Classification of Singing Voice Melody Using
  Convolutional Recurrent Neural Networks", Applied Sciences (2019)" (README,
  https://raw.githubusercontent.com/keums/melodyExtraction_JDC/master/README.md, read 2026-11-10), Keras 2.2.2,
  weights in the repository's `weights/` folder; last commit 2019-12-27. SSL: https://github.com/keums/melodyExtraction_SSL
  (paper https://arxiv.org/abs/2008.06358, not read), last commit 2021-09-14.
- **License facts:** both MIT: https://raw.githubusercontent.com/keums/melodyExtraction_JDC/master/LICENSE ("MIT
  License Copyright (c) 2019 Sangeun Kum") and https://raw.githubusercontent.com/keums/melodyExtraction_SSL/master/LICENSE
  ("MIT License Copyright (c) 2020 Sangeun Kum"), read 2026-11-10, standard MIT grant. Training data: not read
  (UNVERIFIED).

## 31. MTANet

- **What, links:** "The official implementation of "MTANET: Multi-band Time-frequency attention Network for Singing
  Melody Extraction from Polyphonic Music." (the README does not close its inner quotation mark) (README, https://raw.githubusercontent.com/Annmixiu/MTANet/main/README.md,
  read 2026-11-10). Last commit 2024-05-27 (2856a89).
- **License facts:** no LICENSE file in the repository root listing at 2856a89 (no license file found at
  https://github.com/Annmixiu/MTANet on 2026-11-10).

## 32. SOME and its successor GAME (OpenVPI)

- **What, who, links:** SOME: "SOME is a MIDI extractor that can convert singing voice to MIDI sequence" (README,
  https://raw.githubusercontent.com/openvpi/SOME/main/README.md, read 2026-11-10); last commit 2026-03-07 (e523eef).
  The README's first note: "The next-generation midi extractor is released! See GAME: Generative Adaptive MIDI
  Extractor." GAME: "the upgraded successor of SOME, designed for transcribing singing voice into music scores"
  (README, https://raw.githubusercontent.com/openvpi/GAME/main/README.md, read 2026-11-10); repository
  https://github.com/openvpi/GAME , last commit 2026-10-25 (69ba01d).
- **How a program calls them:** SOME: `python infer.py --model CKPT_PATH --wav WAV_PATH` (saves a MIDI file),
  `python webui.py --work_dir WORK_DIR` (Gradio); pretrained models from https://github.com/openvpi/SOME/releases
  (not read); optional RMVPE weights for pitch. GAME: `python infer.py extract [path-or-directory] -m [model-path]
  [--glob *.wav] [--output-formats mid,txt,csv]` ("By default, MIDI files are saved besides each audio file"), and
  `python infer.py align transcriptions.csv -m ...` for DiffSinger datasets; pretrained models from the GAME
  releases or discussions (not read). GAME README: "tested under Python 3.12, PyTorch 2.8.0, CUDA 12.9".
- **Input / output facts:** SOME: "9x faster than real-time on an i5 12400 CPU, and 300x on a 3080Ti GPU" (author
  claim) and "SOME can produce non-integer MIDI values". GAME: "Produces floating point pitch values, same as what
  SOME does"; "notes and pitches can align and adapt to known boundaries"; "Thresholds of boundaries and note
  presence are adjustable"; one use case: "Estimate note pitches from note boundaries adjusted by user in
  interactive tuning tools".
- **Constraints a re-run can pass (GAME README):** known note or word boundaries, boundary and note-presence
  thresholds, a language choice.
- **License facts:** a. Code: both MIT: https://raw.githubusercontent.com/openvpi/SOME/main/LICENSE ("MIT License
  Copyright (c) 2023 Team OpenVPI") and https://raw.githubusercontent.com/openvpi/GAME/main/LICENSE ("MIT License
  Copyright (c) 2026 Team OpenVPI"), read 2026-11-10. b. Weights: release assets not read (UNVERIFIED). c. Training
  data: not read (UNVERIFIED).

## 33. ROSVOT

- **What, who, links:** "ROSVOT: Robust Singing Voice Transcription and MIDI Extraction" (README,
  https://raw.githubusercontent.com/RickyL-2000/ROSVOT/main/README.md, read 2026-11-10; it calls itself "the official PyTorch implementation of ROSVOT (ACL'24)"), paper by Ruiqi Li et
  al., "Robust Singing Voice Transcription Serves Synthesis" (title in the arXiv API, verifier 2026-11-10),
  https://arxiv.org/abs/2405.09940 (PDF downloaded 2026-11-10). Last commit 2024-11-20 (3c8332b).
- **How a program calls it:** conda environment with Python 3.9 and torch (README install commands use the
  `cu118` index), checkpoint from a Google Drive link ("Download the checkpoints.zip and unzip it under the
  project root"). Output: MIDI ("turn a waveform of singing voice into a sequence of note events, in the form of
  MIDI"); "If word boundaries are given ... the output MIDI notes are aligned with word timestamps." "The
  checkpoint we provided was trained with Mandarin datasets."
- **License facts:** a. Code: MIT, https://raw.githubusercontent.com/RickyL-2000/ROSVOT/main/LICENSE ("MIT License
  Copyright (c) 2024 Ruiqi Li"), read 2026-11-10. b. Weights: Google Drive zip; no license statement found. c.
  Training data: "Mandarin datasets" (README); names and licenses not read (UNVERIFIED).

## 35. VocalParse (added by the verifier)

Everything in this section was read by verify-docs-audio-to-notes on 2026-11-10.

- **What, who, links:** "VocalParse transcribes singing audio into a **unified autoregressive structured sequence**,
  jointly modeling lyrics, pitch, note values, and global tempo (BPM) in a single decoder stream" and "The
  implementation is built on Qwen3-ASR" (README, https://raw.githubusercontent.com/pymaster17/VocalParse/main/README.md;
  bold as in the README). Paper: "VocalParse: Towards Unified and Scalable Singing Voice Transcription with Large
  Audio Language Models", https://arxiv.org/abs/2605.04613. Repository https://github.com/pymaster17/VocalParse , last
  commit 2026-06-16 (e7b3946). No PyPI package (https://pypi.org/pypi/vocalparse/json and `.../vocal-parse/json`
  return 404); install is `uv pip install -e .` from a clone, or from the git URL per the model card.
- **How a program calls it (README):** `from vocalparse import transcribe_one` then
  `transcribe_one(audio=..., checkpoint="./vocalparse-weights")`, or `python -m vocalparse.demo --audio
  path/to/song.wav --checkpoint ./vocalparse-weights`; batch API `VocalParseTranscriber(checkpoint=...)` with
  `trx.transcribe([wav_a, wav_b, ...])  # list[np.float32 array] -> list[str]`. The install shown uses
  `uv venv --python 3.10` and `uv pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124`;
  "With the default install, pass `attn_implementation="sdpa"`". CPU inference is not described.
- **Input / output (model card, https://huggingface.co/pymaster/VocalParse/raw/main/README.md):** input "Mono 16 kHz
  singing audio"; output "Interleaved lyric + pitch + note sequence with global BPM", a string such as
  `感 <P_68> <NOTE_4> 受 <P_60> <NOTE_8> 到 <P_65> <NOTE_8> ... <BPM_89>`, where `<P_0>` to `<P_127>` are "MIDI
  notes", 12 note-value tokens (e.g. `<NOTE_4>`, `<NOTE_DOT_8>`) and `<BPM_0>` to `<BPM_255>`. Limitations listed on
  the card: "Primarily trained on Mandarin Chinese singing.", "Physical note durations are not predicted by this
  checkpoint.", "Long audio segments (> 30s) should be pre-segmented before inference." No MIDI writer is named in
  the card or README lines read.
- **License facts:**
  - a. Code: Apache-2.0 (LICENSE, https://raw.githubusercontent.com/pymaster17/VocalParse/main/LICENSE, the
    "Apache License Version 2.0, January 2004" text).
  - b. Weights: `pymaster/VocalParse`, card front matter `license: apache-2.0`, `base_model: Qwen/Qwen3-ASR-1.7B`
    (Hugging Face API: not gated, last modified 2026-06-18, `model.safetensors` 4,076,867,480 bytes). The base
    model `Qwen/Qwen3-ASR-1.7B` carries the card license `apache-2.0` (Hugging Face API).
  - c. Training data (paper, "Training Details"): "We train VocalParse on a 2000-hour singing dataset collected
    through SingCrawl, together with two open-source datasets, GTSinger [45] (Chinese subset) and M4Singer [43]".
    M4Singer's dataset license is CC BY-NC-SA 4.0 (dataset section). GTSinger's license and the SingCrawl
    collection's terms were not read (UNVERIFIED).

## 34. Services and desktop products in this category (pointers)

The apps-survey lane covers desktop and mobile products and the hosted-apis lane covers HTTP APIs. Facts read by
this agent for this category:

- Basic Pitch's README links a demo site, https://basicpitch.io. Verifier, 2026-11-10: it redirects to
  https://basicpitch.spotify.com/, which reads "Try Basic Pitch, a free audio-to-MIDI converter with pitch bend
  detection, built by Spotify."; no price, terms or privacy link was found in that page's HTML.
- MuScriptor has a hosted UI at https://muscriptor.kyutai.org (README). Its weights' license (CC BY-NC 4.0, with
  the gate's "specific conditions of use") is in section 19. Verifier, 2026-11-10: the page's HTML reads "Free,
  open-source music transcription. Upload an mp3/wav/... and MuScriptor turns every instrument into MIDI, sheet music
  PDFs and guitar tabs you can download." and "Enable JavaScript to use the transcriber."; no price and no terms link
  were found in the HTML (the app itself is rendered by JavaScript and was not run). The README says
  `uvx muscriptor serve` "gives you the same UI as hosted on https://muscriptor.kyutai.org/".
- NeuralNote's site https://neuralnote.co/ (verifier, 2026-11-10), FAQ: "Is it free? Yes." and "Does my audio leave
  my computer? No. Transcription runs entirely on your machine. NeuralNote only goes online to download models and
  to check for updates." and "35 instrument groups, from piano, guitars and bass to strings, brass, woodwinds,
  voice, synths and drums. You can tell it which ones are in the recording, or let it detect them with Automatic".
- YourMT3+ and Timbre-Trap run as public Hugging Face Spaces (sections 16 and 21); the hosted-apis lane covers
  calling Spaces with `gradio_client`.
- SwiftF0 runs in the browser with ONNX Runtime Web (README; demo https://swift-f0.github.io/ returns a page that
  says "SwiftF0 needs JavaScript to analyse audio in your browser", verifier 2026-11-10; the app was not run).
- Klangio, Music.AI, AnthemScore, Melodyne, Ableton Live's "Convert to MIDI": not read by this agent (see the
  apps-survey and hosted-apis lanes).

## Not covered

Found by the verifier's completeness search on 2026-11-10 (web search, then the linked page or API read the same
day) and not surveyed in full here:

- Harmonica, https://arxiv.org/abs/2609.04640 (Ou, Martel, Hennessy-Priest, Cho; dated 2026-09-04): "a family of
  instrument-agnostic music transcription models built around multi-depth harmonic convolution" (abstract). The
  paper PDF names no code or weights link; it points to "www.oulongshen.xyz/amt" for examples (not read).
- MIROS, the winning system of the 2025 AMT Challenge, described in https://arxiv.org/abs/2603.27528 , where it "extends the
  YourMT3+ encoder–decoder framework for automatic music transcription by adopting MusicFM as the encoder backbone".
  No code or weights link in that paper.
- VOCANO, https://github.com/B05901022/VOCANO (singing voice to MIDI; last commit 2021-08-09, 669b3fa; LICENSE "MIT
  License" "Copyright (c) 2021 AustinHsu"; README: default device `-d cpu`, MIDI written under `generated/midi/`).
  Checkpoint location and license not read.
- SPICE: Self-supervised Pitch Estimation, https://arxiv.org/abs/1910.11664 (2019): Google's pitch model; where the
  weights are published and under which terms was not read.
- DSP pitch trackers outside the music-transcription literature: Praat's pitch analysis through `praat-parselmouth`
  (PyPI 0.4.7, license field "GPLv3", https://github.com/YannickJadoul/Parselmouth), the WORLD vocoder's DIO and
  Harvest through `pyworld` (PyPI 0.3.6, https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder), and the
  Rust crate `pitch-core` 0.1.1 (crates.io, updated 2026-05-11: "Streaming pitch (f0) tracker — pure-DSP backends
  (SWIPE', pYIN, Praat-AC). No model files, no GPU.").

## Training datasets and their license clauses

Read 2026-11-10. "Used by" lists the released weights above whose authors name the dataset as training data.

| Dataset | Used by (training) | License clause, verbatim, and where it was read |
|---|---|---|
| GuitarSet | Basic Pitch, MT3, YourMT3+ | Zenodo record https://zenodo.org/records/3371780 (version 1.1.0, published 2019-08-20): "License Creative Commons Attribution 4.0 International". A newer Zenodo record titled "GuitarSet" (id 18308760, 2026-01-20) also carries `cc-by-4.0` in the Zenodo API; verifier: that record is a single file, `GuitarSet_Split.rar` (34,166,451 bytes), uploaded by a different creator ("Lojan, Brigith"), not by the GuitarSet authors listed on 3371780 (Qingyang Xi, Rachel M. Bittner, Johan Pauwels, Xuzhou Ye, Juan P. Bello). |
| MAESTRO (v2, v3) | Basic Pitch, MT3, YourMT3+, Onsets and Frames, ByteDance piano, Transkun, hFT-Transformer, Onsets and Velocities | https://magenta.tensorflow.org/datasets/maestro : "The dataset is made available by Google LLC under a Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0) license." |
| Slakh2100 (and Cerberus4, which the MT3 paper says "is derived from the Slakh2100 dataset") | Basic Pitch, MT3, YourMT3+, MR-MT3 | Zenodo record https://zenodo.org/records/4599666 (version "slack2100-redux", 2019-10-20): "License Creative Commons Attribution 4.0 International". |
| MusicNet | MT3, YourMT3+ (MusicNet-EM) | Zenodo record https://zenodo.org/records/5120004 (version 1.0, 2016-11-30): "License Creative Commons Attribution 4.0 International"; description: "The audio recordings in MusicNet consist of Creative Commons licensed and Public Domain performances, sourced from the Isabella Stewart Gardner Museum, the European Archive Foundation, and Musopen." |
| URMP | MT3, YourMT3+, Timbre-Trap | https://labsites.rochester.edu/air/projects/URMP.html (page read 2026-11-10, re-read by the verifier the same day): no license statement found on the page; the "dataset documentation file" it links was not read (UNVERIFIED). |
| MedleyDB | Basic Pitch, CREPE | Zenodo record "MedleyDB 2.0 Audio" https://zenodo.org/records/1715175 (restricted files), access conditions: "MedleyDB is offered free of charge for non-commercial research use only under the terms of the Creative Commons Attribution Noncommercial License: http://creativecommons.org/licenses/by-nc-sa/4.0/". |
| MDB-stem-synth | CREPE, Essentia CREPE, PESTO (one checkpoint in the paper), RMVPE, PENN | Zenodo record https://zenodo.org/records/1481172 (version 1.0.0, 2018-11-08): "MDB-stem-synth is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)." |
| NSynth | CREPE | https://magenta.tensorflow.org/datasets/nsynth : "The dataset is made available by Google Inc. under a Creative Commons Attribution 4.0 International (CC BY 4.0) license." |
| MIR-1K | CREPE, PESTO, RMVPE | The Zenodo copy https://zenodo.org/records/3532216 is restricted, with the condition "if you want use mir1k dataset pls directly contact the author of mir1k, here the dataset just a backup of my using." The original distributor's terms were not read (UNVERIFIED). |
| iKala | Basic Pitch | The Zenodo copy https://zenodo.org/records/3532214 is restricted: "If you need this dataset plz contact the author of ikala, this version is just a backup for myself." Original terms not read (UNVERIFIED). |
| RWC Music Database (RWC-synth) | CREPE, Essentia CREPE | https://staff.aist.go.jp/m.goto/RWC-MDB/ : the connection was reset on 2026-11-10 (not read, UNVERIFIED; the verifier's retry the same day was also reset). |
| E-GMD | Onsets and Frames (drum checkpoint), YourMT3+ ("EGMD") | https://magenta.tensorflow.org/datasets/e-gmd : "The dataset is made available by Google LLC under a Creative Commons Attribution 4.0 International (CC BY 4.0) License." |
| Lakh MIDI | MuScriptor (synthetic pre-training, alongside MIDI "from commercial data providers") | https://colinraffel.com/projects/lmd/ : "The Lakh MIDI Dataset is distributed with a CC-BY 4.0 license" and "attributing each of the MIDI files in the dataset to a particular author is not feasible." |
| HookTheory (TheoryTab) | Sheet Sage | quoted in section 22 (CC BY-NC-SA 3.0, per the Sheet Sage LICENSE note). |
| pitch-benchmark (Hugging Face) | SwiftF0 0.3.0 | card license tag `cc-by-nc-sa-4.0` (section 7). |
| Aria-MIDI (Hugging Face) | hosts the Aria-AMT checkpoint | `license: cc-by-nc-sa-4.0` (section 28). |
| PTDB-TUG | PENN (FCNF0++ "pretrained on MDB-stem-synth and PTDB"), SwiftF0 (paper 3.6), RMVPE as retrained in `yxlllc/RMVPE` (README) | Added by the verifier. https://www.spsc.tugraz.at/databases-and-tools/ptdb-tug-pitch-tracking-database-from-graz-university-of-technology.html (read 2026-11-10): "This PTDB-TUG Database is made available under the Open Database License: http://opendatacommons.org/licenses/odbl/1.0/. Any rights in individual contents of the database are licensed under the Database Contents License: http://opendatacommons.org/licenses/dbcl/1.0/" |
| VCTK (version 0.92) | FCPE (DDSP-200K, re-synthesized) | Added by the verifier. Edinburgh DataShare https://datashare.ed.ac.uk/handle/10283/3443 (read 2026-11-10): the item's `dc.rights` field reads "Creative Commons Attribution 4.0 International Public License" (the page also lists a `license_text.txt` file, not opened). |
| M4Singer | FCPE (DDSP-200K, re-synthesized), VocalParse, RMVPE as retrained in `yxlllc/RMVPE` (vocoder-resynthesized) | Added by the verifier. README https://raw.githubusercontent.com/M4Singer/M4Singer/master/README.md reads "Please note that, if you are using M4Singer, it means that you have accepted the terms of license." (link markup removed); the license file https://raw.githubusercontent.com/M4Singer/M4Singer/master/dataset_license.md (read 2026-11-10): "We agree to the dataset license: CC BY-NC-SA 4.0 (NonCommercial!)." and "We accept full responsibility for our use of the dataset and shall defend and indemnify the authors of M4Singer, against any and all claims arising from our use of the dataset, including but not limited to our use of any copies of copyrighted audio files that we may create from the dataset." |
| IDMT-SMT-Bass ("SMT-Bass") | YourMT3+ | Added by the verifier. Zenodo record https://zenodo.org/records/7188892 ("IDMT-SMT-Bass Dataset", created January 17, 2023; read 2026-11-10): "License Creative Commons Attribution Non Commercial No Derivatives 4.0 International". That YourMT3+'s "SMT-Bass" is this dataset is the verifier's reading of the name, not a statement from the paper. |
| ENST-Drums | YourMT3+ | Added by the verifier. Zenodo record https://zenodo.org/records/21506051 (v2, created July 27, 2026; read 2026-11-10): "A large part of ENST-Drums is publicly available under some conditions. These conditions include: The use and exploitation of the database should be limited to research purposes. No commercial use is possible. The database is distributed under the licence "Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)"" (link markup removed). The older record https://zenodo.org/records/1415902 shows "License Other (Non-Commercial)". |
| Not read (UNVERIFIED) | | Bach10 (the original Rochester release; the Zenodo records found by title are derived sets), Cmedia, MIR-ST500, GTSinger, MAPS (the Onsets and Velocities README sends users to request a login at https://adasp.telecom-paris.fr/resources/2010-07-08-maps-database/, not read), Molina, Phenicx, ComMU. |

## Handoff facts

One fact per line, "X outputs ..., which Y accepts as ...", each half with the source read on 2026-11-10. These
are documentation facts; tested handoffs (runs) are in `trials.md`.

Stems into transcribers (source-separation lane to this lane):

- Demucs writes stems as files: "Separated tracks are stored in the `separated/MODEL_NAME/TRACK_NAME` folder. There
  you will find four stereo wav files sampled at 44.1 kHz: `drums.wav`, `bass.wav`, `other.wav`, `vocals.wav`"
  and the 6-source model "adds a `guitar` and `piano` source" (https://raw.githubusercontent.com/adefossez/demucs/main/README.md),
  which Basic Pitch accepts as an input audio path: "Input audio maybe be of any sample rate, however, all audio
  will be resampled to 22050 Hz", stereo "down-mixed to mono" (https://raw.githubusercontent.com/spotify/basic-pitch/main/README.md).
  Tested on this box (`trials.md`, "Handoff test"): the source-separation lane's `htdemucs_6s` stems from runs r0021
  (S4) and r0054 (S6taps), 44.1 kHz stereo WAV, were read by Basic Pitch 0.4.0 in run r0243 (exit 0 in the ledger).
- Demucs stereo 44.1 kHz WAV stems (same Demucs source), which CREPE accepts as a WAV file ("if the input audio has a
  different sample rate, it will be first resampled to 16 kHz", https://raw.githubusercontent.com/marl/crepe/master/README.md)
  and SwiftF0 accepts through `detect_file` ("WAV, FLAC, OGG, MP3, AIFF and others"; "Multichannel audio ... is mixed
  to mono and resampled to 16 kHz", https://raw.githubusercontent.com/lars76/swift-f0/main/README.md).
- Demucs `vocals.wav` (same Demucs source), which GAME accepts as singing-voice audio ("works on dirty or separated
  voice mixed with noise, reverb or even accompaniments"; `python infer.py extract [path-or-directory] -m [model-path]`,
  https://raw.githubusercontent.com/openvpi/GAME/main/README.md) and SOME accepts as a WAV path
  (`python infer.py --model CKPT_PATH --wav WAV_PATH`, https://raw.githubusercontent.com/openvpi/SOME/main/README.md).

Inside this lane:

- CREPE, torchcrepe, pYIN (`librosa.pyin`), PESTO, PENN and SwiftF0 output one f0 value in Hz per frame (sections
  1 to 8), which Essentia's `PitchContourSegmentation` accepts as "pitch ( vector_real ) - estimated pitch contour
  [Hz]" together with the audio "signal" and a `hopSize` "of the extracted pitch", returning `onset` [s],
  `duration` [s] and `MIDIpitch` (https://essentia.upf.edu/reference/std_PitchContourSegmentation.html). Run on
  this box with Essentia's own `PredominantPitchMelodia` contour as the input, `hopSize=128`, in batch r0321 (exit 0;
  `trials.md`), and with the 10 ms f0 contours of FCPE, PESTO, torchcrepe `full` and Essentia CREPE `tiny`
  (`hopSize=441`, `sampleRate=44100`) in run r0341 (exit 0); the first attempt, r0338 (exit 1), stopped on a NaN MIDI
  pitch the algorithm returned for some segments ("ValueError: cannot convert float NaN to integer"), and the rerun
  drops and counts those notes (`trials.md`, "Handoff test inside the lane").
- SwiftF0's `detect` outputs a `PitchResult` (`timestamps`, `pitch_hz`, `confidence`, `loudness_db`), which its own
  `segment_notes(result, pitch_hold_ms=80.0)` accepts and turns into `Note(start, end, pitch_hz)` for
  `export_to_midi` (SwiftF0 README, https://raw.githubusercontent.com/lars76/swift-f0/main/README.md). Run on this
  box: `detect_file` then `segment_notes` in run r0131 (exit 0; `trials.md`).
- PESTO, PENN and torchcrepe are pitch backends that CREPE Notes accepts with `--pitch-tracker pesto|penn|torchcrepe`,
  writing `[audio_file_stem].[pitch_tracker].transcription.mid` (https://raw.githubusercontent.com/xavriley/crepe_notes/main/README.md).
- CREPE's CLI writes `<name>.f0.csv` with the header `time,frequency,confidence` and a 10 ms step by default
  (https://raw.githubusercontent.com/marl/crepe/master/README.md), which CREPE Notes accepts as `--f0 <path>` or picks
  up by that name next to the audio: it reads the file with `np.genfromtxt(..., delimiter=',', names=True)`, uses
  the `frequency` and `confidence` columns and treats rows as 10 ms steps (`crepe_notes/cli.py` and
  `crepe_notes/crepe_notes.py` at 5390b17, https://raw.githubusercontent.com/xavriley/crepe_notes/main/crepe_notes/cli.py).
  An f0 file from another tracker would need the same column names and step (added by the verifier; not run).
- RMVPE pretrained weights (release https://github.com/yxlllc/RMVPE/releases; the release page was not read, and an
  asset `releases/download/230917/rmvpe.zip` answers HTTP 200, section 5) are what SOME's README asks for "For better
  pitch extraction results" in its `pretrained/` directory (https://raw.githubusercontent.com/openvpi/SOME/main/README.md).
- Basic Pitch's model file is what NeuralNote v1 used; NeuralNote v2 accepts MuScriptor GGUF files from
  `DamRsn/muscriptor-gguf` (https://raw.githubusercontent.com/DamRsn/NeuralNote/main/README.md).

Notes or MIDI to notation and tab tools (this lane to the guitar-tab and web-tab-render lanes):

- Basic Pitch outputs a MIDI file (program "Electric Piano 1", velocity from amplitude, pitch-bend events) and a
  CSV with header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend` (`basic_pitch/note_creation.py` and
  `inference.py`, https://raw.githubusercontent.com/spotify/basic-pitch/main/basic_pitch/note_creation.py and
  https://raw.githubusercontent.com/spotify/basic-pitch/main/basic_pitch/inference.py), with no string or fret
  field (observed in run r0234: program 4 0-based, 220 ticks per quarter note, tempo 120, CSV rows not in time order
  and carrying a variable number of pitch-bend values, `trials.md`); music21's converter accepts MIDI through its `ConverterMidi` subconverter, and "quantizePost specifies
  whether to quantize a stream resulting from MIDI conversion. By default, MIDI streams are quantized to the
  nearest sixteenth or triplet-eighth" (https://www.music21.org/music21docs/moduleReference/moduleConverter.html).
- A MIDI file from any transcriber here (Basic Pitch, MT3, YourMT3+, Transkun, ByteDance piano, CREPE Notes,
  SwiftF0, SOME, GAME), which the MuseScore 4 command line accepts for conversion ("-o | --export-to file ... The
  file type depends on the extension of the filename given"; "-M | --midi-operations file" with the description
  "Specify MIDI import operations file (see examples below)", https://musescore.org/en/handbook/4/command-line-usage).
- MuScriptor `--format sheets` outputs `score.mid`, `score.musicxml`, `full_score.pdf`, per-instrument PDFs and
  "a tablature PDF for fretted ones" (needs MuseScore 4) (https://raw.githubusercontent.com/muscriptor/muscriptor/main/README.md),
  and alphaTab lists among its importers "MusicXML ( .xml ) — open XML standard" next to "Guitar Pro 3–5", "Guitar
  Pro 6", "Guitar Pro 7 and 8" and "CapXML" (https://alphatab.net/docs/introduction). MIDI is not among the
  importers on that page (re-checked by the verifier: MIDI appears there only in the audio engine's description, which
  "converts the data model to MIDI"); the importer list also names "alphaTex — a text format for writing music
  notation by hand".
- YourMT3+'s Space returns, from `/process_audio`, an HTML string whose MIDI is embedded as
  `data:audio/midi;base64,...` (`html_helper.py` `to_data_url`, https://huggingface.co/spaces/mimbres/YourMT3/raw/main/app.py),
  so a client has to decode that base64 part to get a `.mid` file for the tools above (verifier, from the code; no
  successful call is on record: the try agent's call hit the ZeroGPU quota, `out/yourmt3-space/space_calls.json`).
- MT3 outputs MIDI whose notes carry an instrument value matching "the original General MIDI specification, which
  contains 128 "programs"" (MT3 paper, https://arxiv.org/abs/2111.03017). Verifier: the earlier second half of
  this line ("so guitar notes can be selected by program number before a string-and-fret step") named no tool and
  no source for that step, so it was removed. The only inputs in this lane that take instrument or program values
  are MuScriptor's `--instruments` and MR-MT3's `valid_programs` (both under "User constraints" below).

Beat and tempo into transcribers (chords-beats-key lane to this lane):

- A tempo in BPM from a beat tracker or the user, which Sheet Sage accepts as `--beats_per_minute_hint 120` and
  downbeat times as `-s`/`-e` with `--segment_hints_are_downbeats` (Sheet Sage README); which MuScriptor accepts as
  `--bpm`, `--beats-per-bar`, `--first-downbeat`, `--beat-scale` (MuScriptor README); which `audio_to_midi_melodia.py`
  requires as its `bpm` argument (https://raw.githubusercontent.com/justinsalamon/audio_to_midi_melodia/master/README.md);
  which FCPE's `extact_midi` accepts as `tempo` (FCPE README; the method is in the repository's `main`, not in the
  PyPI 0.0.4 package, see section 6); and which Basic Pitch's `predict()` accepts as
  `midi_tempo` (default 120, `basic_pitch/inference.py`). In each case the tempo only sets the MIDI or score grid,
  per the cited text.
- Output side only (no reader established in this lane): MuScriptor writes "beats, time signature and bar lines ...
  detected from the audio" into its MIDI as a tempo map (https://raw.githubusercontent.com/muscriptor/muscriptor/main/README.md),
  and Sheet Sage "runs beat detection on your input" with madmom
  (https://raw.githubusercontent.com/chrisdonahue/sheetsage/main/README.md). Verifier: the earlier claim that "a
  metronome or tab renderer could read" these had no source for the reading side, so it was removed; readers belong
  to the browser-audio-sync and web-tab-render lanes.

User constraints into the tools that accept them (human-in-the-loop re-runs):

- A pitch range in Hz (from a tuning, capo and number of frets chosen by the user; the arithmetic is not from a
  source), which Basic Pitch accepts as `minimum_frequency` / `maximum_frequency` ("Pitch events with frequencies
  outside of this range will be excluded"), `librosa.pyin` as `fmin` / `fmax`, torchcrepe and PENN as `fmin` /
  `fmax`, FCPE as `f0_min` / `f0_max`, SwiftF0 as `fmin` / `fmax` ("A frame whose best pitch lies outside the band
  gets confidence 0"), and Essentia's Melodia, Klapuri and Audio2Midi as `minFrequency` / `maxFrequency` (sources in
  each tool's section). Run on this box with 82.4 to 1319 Hz: Basic Pitch in run r0234 and SwiftF0 in run r0131
  (`trials.md`, which records the scores with and without the limit).
- A tuning correction applied to the audio before transcription, which Basic Pitch then read: `sox S7flat30.wav
  S7flat30.plus30c.wav pitch 30` (SoX shifts by cents) followed by Basic Pitch 0.4.0 in run r0319 (exit 0;
  `trials.md`, "Tuning-correction re-run test"). Basic Pitch itself has no tuning input.
- A tuning reference in Hz (for example from a detuned recording), which Essentia's `PitchContourSegmentation`
  accepts as `tuningFrequency` ("tuning reference frequency [Hz]", default 440) when it quantizes pitch to MIDI
  notes (Essentia reference page above); Essentia's `Audio2Midi` also has `tuningFrequency`, limited to 432 or 440,
  and `transpositionAmount` in semitones (https://essentia.upf.edu/reference/std_Audio2Midi.html, verifier
  2026-11-10). A tuning offset in cents, which CREPE Notes accepts as `--tuning-offset`
  ("Manually apply a tuning offset in cents. Fractional numbers are allowed. Set to 0 for no offset, otherwise it will
  be calculated automatically.", `crepe_notes/cli.py` at 5390b17; `crepe_notes.py` divides it by 100 and subtracts
  it from `hz_to_midi(freqs)` in `freqs_to_midi`; with no value it estimates one with `librosa.pitch_tuning`). The
  docs agent's statement that no other tool lists a tuning input was based on the
  pages it read; CREPE Notes' option is in its code, not its README (verifier, 2026-11-10).
- Note boundaries corrected by the user, which GAME accepts: "Estimate note pitches from note boundaries adjusted by
  user in interactive tuning tools" and "notes and pitches can align and adapt to known boundaries" (GAME README);
  ROSVOT accepts word boundaries ("If word boundaries are given ... the output MIDI notes are aligned with word
  timestamps", ROSVOT README).
- A known set of instruments, which the MuScriptor paper describes as optional conditioning ("By optionally
  conditioning on instrument presence") (https://arxiv.org/abs/2607.08168) and which the released CLI accepts as
  `--instruments` ("When given, every instrument not in the list is forbidden from being decoded at all";
  `muscriptor list-instruments` prints the names; `muscriptor/main.py` at 8a1ef88) or, in Python, `transcribe(...,
  instruments=[...])` (code at 8a1ef88; the model card shows `instrument_group=` instead). MR-MT3's `InferenceHandler.inference(..., valid_programs=...)` takes a list of
  MIDI programs and blocks all others during decoding (`inference.py` at 826ea84). (Verifier, 2026-11-10.)
- Onset and frame thresholds and a minimum note length, which Basic Pitch accepts as `onset_threshold`,
  `frame_threshold`, `minimum_note_length` (ms); aubio's `aubionotes` as `-t`, `-M` (minimum inter-onset interval in
  seconds), `-s` (silence dB), `-l` (pitch tolerance); CREPE Notes as `--min-duration` (s), `--min-velocity` and
  `--sensitivity` (`crepe_notes/cli.py`).
- No tool in this lane's sources accepts a capo position, an open-string tuning, or a string or fret assignment as
  an input: a text search on 2026-11-10 for "capo", and for "tuning" or "string" next to "guitar" or "fret", over
  every README, doc page and model card fetched for this file found no such parameter. The verifier also read the
  command-line and inference code of Basic Pitch, CREPE, torchcrepe, FCPE, SwiftF0, PENN, CREPE Notes, MuScriptor,
  MR-MT3, Transkun, ByteDance piano transcription, Aria-AMT, Deep Salience and Onsets and Frames on 2026-11-10 and
  found none either (the nearest are CREPE Notes' `--tuning-offset` and MuScriptor's `--instruments`, above). Those
  constraints belong to the guitar-tab lane's tools.


## Verification log (verify-docs-audio-to-notes, 2026-11-10)

Method:

- Quotes: each quoted passage was re-fetched from the URL the survey gives (raw GitHub files, Hugging Face files and
  API, Zenodo pages and API, arXiv PDFs read with `pdftotext`, the Essentia, Magenta, music21, MuseScore and alphaTab
  pages) and compared after collapsing whitespace. "Markup-only" means identical once markdown link syntax, RST
  backticks, bold marks or the case of a first word are set aside. Script: `scripts/verify_docs/check_quotes.py`;
  inputs `scripts/verify_docs/quotes.txt` (the survey's quotes as the docs agent wrote them) and
  `scripts/verify_docs/quotes_added.txt` (quotes added by the verifier); results
  `samples/verify-docs/quote_checks.tsv` and `samples/verify-docs/quote_checks_added.tsv`. The fetched copies are
  outside the repo, in `/home/user/gtr/lanes/audio-to-notes/verify-docs/fetched/`.
- Versions and dates: PyPI JSON for 29 package names, shallow blobless clones of 49 repositories, the Hugging Face
  API for 15 repositories, the Zenodo API for 9 records and the arXiv API for 26 IDs
  (`samples/verify-docs/hub_facts_2026-11-10.txt`, `samples/verify-docs/repo_heads_verify_2026-11-10.tsv`,
  `scripts/verify_docs/hub_facts.py`, `scripts/verify_docs/git_heads.sh`).
- Calls and formats: the source files named in each section, at the commits named there.
- Links: every URL in this file outside github.com was fetched (`samples/verify-docs/url_status_2026-11-10.tsv`);
  GitHub repository links were checked by cloning, release assets by HEAD requests.

Tally:

- License and terms clauses quoted in the survey: 90 checked. 79 verbatim; 9 verbatim as rendered text (the source
  has markdown link markup inside the quoted words); 0 corrected; 2 unverifiable: "UNVERIFIED: could not fetch
  https://www.upf.edu/web/mtg/melodia on 2026-11-10 (HTTP 403)" (both MELODIA clauses; the docs agent's saved copy
  of the page contains them). In addition, 4 license-file headers the survey described without quoting (pYIN
  COPYING; the Apache-2.0 texts of MT3, NeuralNote and Aria-AMT) were confirmed.
- License names taken from metadata (PyPI license fields and classifiers, Hugging Face card tags, Zenodo license
  ids): all re-read; all matched.
- Other quoted passages: 216 checked. 157 verbatim (one of them checked without the survey's editorial brackets); 42
  markup-only; 2 with reference marks removed as the survey said; 9 corrected; 6 unverifiable (the MELODIA page).
  The 9 corrections: the librosa `f0` return line (a type annotation dropped without a mark); the FCPE, MuScriptor
  and Transkun papers (reference marks removed without saying so); the MuScriptor paper's contribution 4 (quoted as
  cut off at a column break, although the full sentence is in the PDF); the audio_to_midi_melodia README (a heading
  and a list item joined into one quote); the YourMT3 README (an emoji left out); the MTANet README (a closing
  quotation mark added that the README does not have); the MuseScore handbook (a colon added).
- Quotes added by the verifier: 79, all re-checked against their URLs: 75 verbatim, 4 markup-only.
- Links fixed: 1 (`https://raw.githubusercontent.com/spotify/basic-pitch/main/basic_pitch/`, a directory URL that
  returns 404, replaced by the two file URLs). Every other non-GitHub URL returned 200 or 206 except the four the
  survey already lists as unreadable (code.soundsoftware.ac.uk gave no answer, librosa's "latest" pyin page 404, the
  RWC page reset the connection, the MELODIA page 403). All 26 arXiv IDs resolve, and the titles and authors this
  file gives match the arXiv API; all GitHub repositories named exist.
- Versions and dates: every PyPI version and upload date, last-commit hash and date, Hugging Face size and date and
  Zenodo version in the survey matched the re-read values. Added: Essentia's latest version has CPython 3.14 wheels
  only; the PyPI name `mt3` is an unrelated package; `rmvpe-onnx` exists on PyPI; `omnizart` 0.6.3 and `madmom`
  0.16.1 are source archives only.
- Other facts corrected: FCPE's `f0_min` / `f0_max` defaults (`None`; 80 and 880 are the README example's values);
  FCPE's `extact_midi` is in the GitHub source, not in the PyPI 0.0.4 package; the statement that no other tool takes
  a tuning input (CREPE Notes' `--tuning-offset`, Essentia `Audio2Midi`'s `tuningFrequency` and
  `transpositionAmount`); MR-MT3 and Aria-AMT marked NOT-CPU-BOX as shipped (their inference code requires CUDA);
  MR-MT3's author-reported numbers now name their table and metric; the newer GuitarSet Zenodo record identified as
  a single-file upload by a different creator. One doc-versus-code difference is stated with both sources:
  MuScriptor's model card shows `transcribe_to_midi` and `instrument_group=`, while the code at 8a1ef88 has
  `transcribe(..., instruments=[...])` and `events_to_midi_bytes` and no `transcribe_to_midi`.
- UNVERIFIED items settled from code or pages: 16 (RMVPE call signature; YourMT3+ Space output; MR-MT3 inference
  arguments and output; MR-MT3 table column; MuScriptor per-note fields; MuScriptor CLI instrument conditioning;
  Timbre-Trap Space output; Deep Salience arguments and outputs; Onsets and Frames output; ByteDance dict keys;
  Aria-AMT output; the licenses of PTDB-TUG, M4Singer, VCTK, ENST-Drums and IDMT-SMT-Bass). The file carried 32
  UNVERIFIED marks when the docs agent finished and carries 24 above this log, some of them new.
- License clauses the survey had missed, now quoted with links: MuScriptor's gated "specific conditions of use";
  madmom's model-file license (CC BY-NC-SA 4.0), which reaches CREPE Notes' default onset splitting, Sheet Sage and
  Omnizart's dependencies; Sheet Sage's README licensing paragraph (madmom, Jukebox, Melisma); muscriptor.cpp (MIT)
  and the GGUF repository's LICENSE file (CC BY-NC 4.0 text); five dataset licenses (PTDB-TUG ODbL and DbCL, VCTK
  CC BY 4.0, M4Singer CC BY-NC-SA 4.0 with an indemnity clause, IDMT-SMT-Bass CC BY-NC-ND 4.0, ENST-Drums CC BY-NC-ND
  4.0 "limited to research purposes"); `yxlllc/RMVPE` has no LICENSE file; the MT3 checkpoint bucket holds no
  license file.
- Handoff facts: 2 lines lost an unsupported second half (MT3 program numbers that "can be selected ... before a
  string-and-fret step"; beats that "a metronome or tab renderer could read"); 6 lines gained a source URL or a run
  id (Demucs stems into Basic Pitch, r0243; SwiftF0 `segment_notes`, r0131; Essentia Melodia into
  `PitchContourSegmentation`, r0321, and four other trackers' contours into it, r0341; the pitch-range limit, r0234
  and r0131; a SoX tuning shift into Basic Pitch,
  r0319; the SOME README URL); 2 lines were added (CREPE's `.f0.csv` into CREPE Notes `--f0`; the YourMT3+ Space's
  HTML with embedded MIDI); the FCPE tempo input was limited to the GitHub source; the tuning and instrument lines
  were corrected. Run ids were checked in `/home/user/gtr/ledger/runs.jsonl` (all exit 0, except the runs cited as
  failures: eight Basic Pitch CLI runs and r0338).
- Agreement with `trials.md` (read up to its "Media kept outside git" section): where both files describe an output
  format (Basic Pitch MIDI and CSV, aubio's printed lines, SwiftF0's `PitchResult` and notes, Transkun's MIDI, PESTO,
  FCPE, Essentia, the YourMT3+ Space), they agree; facts observed in `trials.md` were added here with their run ids.
  One version difference is now stated in section 10: this file names Essentia 2.1b6.dev1438 (latest on PyPI), the
  try agent ran 2.1b6.dev1389 because the latest has CPython 3.14 wheels only.
- Judging language: none found outside attributed quotes. The MuScriptor README's accuracy claim stays out; the
  SwiftF0 README's "highest pitch F1" and SOME's speed figures remain as attributed quotes; RUNNABLE and NOT-CPU-BOX
  remain pointers for the try agent.
- Tools added: 1 section (35, VocalParse, May 2026) and 7 entries under "Not covered" (Harmonica, MIROS, VOCANO,
  SPICE, praat-parselmouth, pyworld, pitch-core).
- The docs agent's closing summary, checked: its counts hold (34 numbered entries, 32 UNVERIFIED marks, about 20 MB
  of fetched copies). Of the pages it lists as unreadable, basicpitch.io, the static HTML of muscriptor.kyutai.org,
  neuralnote.co and the MuScriptor model card (through the HTML model page, although the raw card file answers 401)
  were readable on 2026-11-10. Its summary of constraint inputs missed CREPE Notes' `--tuning-offset` and Essentia
  `Audio2Midi`'s `tuningFrequency` and `transpositionAmount`.
