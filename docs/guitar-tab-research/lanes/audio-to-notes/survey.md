# Lane 1, audio-to-notes: survey of audio-to-notes, audio-to-MIDI and melody-extraction tools

Agent: docs-audio-to-notes. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from live
sources on 2026-11-10 unless a line says otherwise. This file records facts and quotes only; it does not rank
or recommend anything. The tools were not run by this agent (the try-audio-to-notes agent runs them, see
`trials.md`).

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
5. RMVPE (`Dream-High/RMVPE`). No PyPI; last commit 2024-01-25. Code Apache-2.0; no weights in the repo (an `rmvpe.pt` exists in `lj1995/VoiceConversionWebUI`, MIT tag; link to the paper's model unconfirmed). RUNNABLE only with weights from elsewhere.
6. FCPE / torchfcpe (`CNChTu/FCPE`). PyPI `torchfcpe` 0.0.4 (2024-03-06); last commit 2025-10-14. Code MIT; bundled `fcpe_c_v001.pt` in the MIT repo; the paper's DDSP-200K weights on Hugging Face are CC BY-NC-SA 4.0. RUNNABLE.
7. SwiftF0 (`lars76/swift-f0`, ONNX). PyPI `swift-f0` 0.3.0 (2026-09-25); last commit 2026-09-25. Code MIT; bundled ONNX in the MIT package; training data `lars1234/pitch-benchmark` is tagged CC BY-NC-SA 4.0. Has note segmentation and MIDI export. RUNNABLE (also in-browser via ONNX Runtime Web).
8. PENN / FCNF0++ (`interactiveaudiolab/penn`). PyPI `penn` 1.0.0 (2025-04-02); last commit 2025-04-02. Code MIT; weights `maxrmorrison/fcnf0-plus-plus` (MIT tag). RUNNABLE.
9. aubio (`aubio/aubio`, C + Python, `aubionotes` / `aubiopitch` CLI). PyPI 0.4.9 (2019-02-08); repo `VERSION` 0.5.0-alpha, last commit 2026-04-10. GPL-3.0-or-later. No weights. RUNNABLE (binaries present on the box).
10. Essentia (`MTG/essentia`: PitchYinProbabilistic, PredominantPitchMelodia, MultiPitchKlapuri, PitchCREPE, PitchContourSegmentation, Audio2Midi). PyPI `essentia` / `essentia-tensorflow` 2.1b6.dev1438 (2026-05-19); last commit 2026-11-05. Code AGPL-3.0 (commercial license on request); models CC BY-NC-SA 4.0 or CC BY-NC-ND 4.0 depending on the page (all quoted). RUNNABLE.
11. MELODIA Vamp plugin 1.0 (MTG-UPF, Linux 32/64-bit build behind a download form; "free of charge for non-commercial use only") and wrapper `justinsalamon/audio_to_midi_melodia` (last commit 2020-04-03; no LICENSE file). RUNNABLE after the form.
12. CREPE Notes (`xavriley/crepe_notes`). PyPI `crepe-notes` 0.2.0 (2026-03-13); last commit 2026-03-13. GPL-3.0. Uses CREPE, PESTO, PENN or torchcrepe weights. RUNNABLE.

### Polyphonic and multi-instrument note transcription (audio to MIDI)

13. Spotify Basic Pitch (`spotify/basic-pitch`). PyPI 0.4.0 (2024-08-16); last commit 2025-11-13. Code Apache-2.0; model files ship in the package with no separate license file. RUNNABLE.
14. NeuralNote (`DamRsn/NeuralNote`, VST3/AU/Standalone). Last commit 2026-11-07. v2 uses MuScriptor GGUF weights (CC BY-NC 4.0), v1 used Basic Pitch. Code Apache-2.0. Installers for macOS and Windows; Linux build from source. NOT-CPU-BOX (desktop plugin).
15. MT3 (`magenta/mt3`, JAX/T5X). No PyPI; last commit 2026-10-27. Code Apache-2.0; checkpoints at `gs://mt3/checkpoints` with no license statement found. Documented route is Colab. To check on CPU.
16. YourMT3+ (GitHub `mimbres/YourMT3` holds README + GPL-3.0 LICENSE, last commit 2024-11-29; code and checkpoints in the Hugging Face Space `mimbres/YourMT3`, card `license: apache-2.0`, last modified 2025-01-31). Callable as a Gradio Space; local run to check.
17. MR-MT3 (`gudgud96/MR-MT3`). Last commit 2024-07-12. Code MIT; weights `gudgud1014/MR-MT3` (MIT tag). Research environment (TensorFlow 2.11 + torch pins). To check.
18. mt3-pytorch (`kunato/mt3-pytorch`). Last commit 2022-05-24. No LICENSE file. To check.
19. MuScriptor (`muscriptor/muscriptor`, Kyutai and Mirelo, arXiv 2607.08168). PyPI `muscriptor` 0.4.0 (2026-10-20); last commit 2026-10-20. Code MIT; weights CC BY-NC 4.0, gated on Hugging Face (free login, automatic approval); small 103M / medium 307M / large 1.4B parameters. Outputs MIDI with beats and bars, MusicXML and tab PDFs (with MuseScore 4). RUNNABLE (`small` per README) with a Hugging Face token.
20. Omnizart (`Music-and-Culture-Technology-Lab/omnizart`: music, vocal, vocal-contour, drum, chord, beat). PyPI 0.6.3 (2026-05-31; 0.6.0 added Python up to 3.14); last commit 2026-05-31. Code MIT; checkpoints release `checkpoints-20211001`, license not stated. RUNNABLE (to check).
21. Timbre-Trap (`sony/timbre-trap`, multi-pitch). Last commit 2024-05-05. Code MIT; weights in the Space `cwitkowitz/timbre-trap` (no license field). RUNNABLE (to check).
22. Sheet Sage (`chrisdonahue/sheetsage`, melody + chords lead sheet). Last commit 2025-05-13. Code MIT; models and data CC BY-NC-SA 3.0. Docker (~4 GB); Jukebox mode needs a GPU with at least 12 GB. RUNNABLE without Jukebox (to check).
23. Deep Salience (`rabitt/ismir2017-deepsalience`, melody, bass, multi-f0, vocal weights in repo). Last commit 2019-11-22. MIT. To check (Keras).

### Piano transcription models

24. Onsets and Frames (`magenta/magenta`, "inactive (archived, read only)", last commit 2026-01-05; PyTorch port `jongwook/onsets-and-frames`, MIT, last commit 2021-07-19). Code Apache-2.0; MAESTRO and E-GMD checkpoints (no license statement found). To check.
25. ByteDance piano transcription (`qiuqiangkong/piano_transcription_inference`). PyPI 0.0.6 (2025-01-26); last commit 2025-01-26. No LICENSE file (setup.py classifier MIT); weights on Zenodo, CC BY 4.0. RUNNABLE.
26. Transkun (`Yujia-Yan/Transkun`). PyPI 2.0.1 (2024-09-28); last commit 2024-11-22. MIT; checkpoint shipped in the package. CLI default device CPU. RUNNABLE.
27. hFT-Transformer (`sony/hFT-Transformer`). Last commit 2026-10-28. Code MIT; checkpoints CC BY-NC-SA 4.0 (LICENSE-CHECKPOINTS.md). README lists "GPU" in requirements. To check.
28. Aria-AMT (`EleutherAI/aria-amt`). Last commit 2025-12-16. Code Apache-2.0; checkpoint stored in the `loubb/aria-midi` dataset repo (CC BY-NC-SA 4.0). Python 3.11. To check.
29. Onsets and Velocities (`andres-fr/iamusica_training`). Last commit 2023-08-31. GPL-3.0; 12.7 MB checkpoint in repo. To check.

### Melody extraction and singing-voice note transcription

30. melodyExtraction_JDC (last commit 2019-12-27) and melodyExtraction_SSL (2021-09-14), Keras, MIT. To check.
31. MTANet (`Annmixiu/MTANet`), last commit 2024-05-27, no LICENSE file.
32. SOME (`openvpi/SOME`, last commit 2026-03-07, MIT) and its successor GAME (`openvpi/GAME`, last commit 2026-10-25, MIT): singing voice to MIDI with float pitches; GAME accepts user-adjusted note boundaries. RUNNABLE (to check; weights from GitHub releases).
33. ROSVOT (`RickyL-2000/ROSVOT`, ACL 2024), last commit 2024-11-20, MIT code, checkpoint on Google Drive, trained on Mandarin data. To check (README installs CUDA 11.8 torch).

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
    README lists "Python versions 3.7, 3.8, 3.9, 3.10, 3.11". No GPU is required by the docs.
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
  The README's example sets `device = 'cuda:0'`; `device` is an argument, so CPU is selectable.
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
- **Output:** `librosa.pyin` returns "f0 : time series of fundamental frequencies in Hertz", "voiced_flag : ...
  boolean flags", "voiced_prob : ... the probability that a frame is voiced", one value per frame
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
  note events.
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
- **Author-reported measurements:** v1 paper table: PESTO trained on MIR-1K, raw pitch accuracy 96.1 % on MIR-1K
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
  "download the RMVPE pretrained model from here" pointing to https://github.com/yxlllc/RMVPE/releases (not read).
  The Hugging Face repository `lj1995/VoiceConversionWebUI` holds files named `rmvpe.pt` (181,184,272 bytes) and
  `rmvpe.onnx` (361,688,443 bytes), with card license tag `mit` (Hugging Face API, read 2026-11-10). This agent
  did not find a statement in the Dream-High repository naming either source. UNVERIFIED: which checkpoint
  corresponds to the paper; settled by a release note or model card that names the training run.
- **How a program calls it:** Python only, from the repository's `src/` (no CLI, no package). UNVERIFIED: exact
  call signature (read `src/inference.py` to settle).
- **Input / output:** the paper estimates vocal f0 in polyphonic music, frame-level; output is pitch per frame.
- **License facts:**
  - a. Code: Apache-2.0. https://raw.githubusercontent.com/Dream-High/RMVPE/main/LICENSE (Apache License Version
    2.0 text), read 2026-11-10, includes the grant "each Contributor hereby grants to You a perpetual, worldwide,
    non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of,
    publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or
    Object form."
  - b. Weights: none in the repository (see above).
  - c. Training data (paper, 3.1, reference marks removed): "public datasets MDB-stem-synth, MIR-1K, Cmedia and MIR
    ST500"; "For
    MDB-stem-synth, MIR-1K and Cmedia datasets, we randomly spilt these datasets (at song-level) into training (80%)".
    See the dataset section for MDB-stem-synth and MIR-1K. Cmedia and MIR-ST500: licenses not read (UNVERIFIED).
  - d. Service: not applicable.
- **Author-reported measurements (paper, Table 1, last row, the proposed model):** raw pitch accuracy 95.42 % on
  MIR-1K, 89.32 % on MIR ST500, 83.57 % on Cmedia.

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
- **Input:** a mono `torch.Tensor` of audio; the README example resamples to 16 kHz with hop 160.
- **Output:** an f0 tensor per frame (Hz); `extact_midi` returns a MIDI structure and can write a `.mid` file.
- **Constraints a re-run can pass:** `f0_min`, `f0_max` (defaults 80 and 880 Hz), voicing `threshold`, `tempo`
  for the MIDI export.
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/CNChTu/FCPE/main/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2023 CN_ChiTu" and "Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software ... to deal in the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software".
  - b. Weights: two different files. (1) The package bundles `torchfcpe/assets/fcpe_c_v001.pt` (43,363,260 bytes,
    git tree at 6a149c1), called "another model which released earlier" in the README; no separate license for it
    was found, so it sits under the repository's MIT LICENSE. (2) "The model we use in our paper is DDSP-200K, you
    can get the model from here" (README) links https://huggingface.co/ChiTu/FCPE , whose README is exactly
    "license: cc-by-nc-sa-4.0" (card front matter, https://huggingface.co/ChiTu/FCPE/raw/main/README.md, read
    2026-11-10); file `DDSP_200k.pt`, 43,362,881 bytes.
  - c. Training data (paper, 2.3): "we re-synthesize the M4Singer and VCTK datasets using the Differentiable
    Digital Signal Processing (DDSP) method and use them for training all model variants." M4Singer and VCTK
    licenses: not read (UNVERIFIED).
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
  - c. Training data: README: "Selecting None will download and use FCNF0++ pretrained on MDB-stem-synth and
    PTDB". See the dataset section for MDB-stem-synth; PTDB-TUG license not read (UNVERIFIED).
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
  the `aubio` command's subcommands were not read here.
- **Input:** "Run analysis on this audio file. Most uncompressed and compressed are supported, depending on how
  aubio was built"; `-r` resamples ("If 0, the sampling rate of the original source will be used").
- **Output (`doc/aubionotes.txt`):** "the detected notes are printed on standard output, in seconds and midi note
  number"; `aubiopitch`: pitch values "printed on the console, prefixed by a timestamp in seconds. If no pitch
  candidate is found, the output is 0." Units by `-u`: "midi, bin, cent, and Hz". Pitch methods include
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
  commit 2026-11-05 (23ae7ba).
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
    parameters `minFrequency` (60), `maxFrequency` (2300), `loudnessThreshold` (-51 dB).
- **Constraints a re-run can pass:** frequency ranges on most pitch algorithms; a tuning reference
  (`tuningFrequency`) on `PitchContourSegmentation`; `referenceFrequency` on Melodia.
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
  which needs the plugin installed ("Non-python dependencies: Melodia melody extraction Vamp plugin"). Essentia's
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
  - b, c. DSP algorithm, no trained weights or training data.

## 15. MT3 (Multi-Task Multitrack Music Transcription, Google Magenta)

- **What, who, links:** "MT3 is a multi-instrument automatic music transcription model that uses the T5X
  framework. This is not an officially supported Google product." (README,
  https://raw.githubusercontent.com/magenta/mt3/main/README.md, read 2026-11-10). Repository
  https://github.com/magenta/mt3 . Paper: Gardner et al., "MT3: Multi-Task Multitrack Music Transcription", ICLR
  2022, https://arxiv.org/abs/2111.03017 (PDF read 2026-11-10).
- **Version and maintenance:** no PyPI release; `mt3/version.py` says `__version__ = '0.0.1'`; last commit
  2026-10-27 (7ecf19d). README: "For now, we do not (easily) support training."
- **How a program calls it:** the README's route is the Colab notebook
  `mt3/colab/music_transcription_with_transformers.ipynb` ("Use our colab notebook to transcribe audio files of
  your choosing"), whose cells import `jax`, `t5`, `t5x`, `seqio`, `note_seq` and TensorFlow (`setup.py` installs
  `t5x` from git), load a checkpoint from the Google Cloud Storage path `gs://mt3/checkpoints`, and offer two models: the ISMIR 2021 piano model and
  the ICLR 2022 multi-instrument model. No CLI and no HTTP API. CPU runs: not documented in the README.
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
    Apache 2.0 notice). UNVERIFIED: the checkpoints' license; settled by a license file in the bucket or a
    statement from the authors.
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
  HuggingFace Spaces Demo (Free GPU) is out!" at https://huggingface.co/spaces/mimbres/YourMT3 . README also:
  "2024.11 Sorry! YouTube is blocked again...".
- **Where the code and weights are:** the Space's file list (Hugging Face API, read 2026-11-10; last modified
  2025-01-31) contains `amt/src/...` (the model code) and several checkpoints under `amt/logs/2024/.../checkpoints/`
  of 361 MB to 759 MB each (for example `.../mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b80_ps2/checkpoints/model.ckpt`,
  758,957,292 bytes).
- **How a program calls it:** the Space is a Gradio app (`sdk: gradio`, `app_file: app.py`), so
  `gradio_client` can call it (the hosted-apis lane covers calling Spaces); locally, by running the Space's code.
  No PyPI package.
- **Output:** UNVERIFIED: the output format and fields of `app.py` were not read (read the Space's `app.py` to
  settle; the try agent's `trials.md` may record what the Space returned).
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
- **How a program calls it:** a research codebase: conda environment with pinned packages (`transformers==4.18.0`,
  `torch`, `t5==0.9.3`, `note-seq==0.0.3`, `tensorflow==2.11`, ...) listed in the README, then `inference.py`
  (in the tree). Weights: Hugging Face `gudgud1014/MR-MT3` (card license tag `mit`, API read 2026-11-10) with
  files such as `mt3.pth` (183,672,643 bytes), `slakh_f1_0.65.pth`, and several `.ckpt` files of about 582 MB.
- **Input / output:** the README's Slakh preparation step is "Re-sample Slakh `.flac` to 16kHz". UNVERIFIED:
  inference arguments and output format (read `inference.py` to settle).
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/gudgud96/MR-MT3/master/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2024 Hao Hao Tan, Kin Wai Cheuk, Taemin Cho, Wei-Hsiang Liao, Yuki Mitsufuji" with the standard
    MIT grant.
  - b. Weights: `gudgud1014/MR-MT3` card license tag `mit` (its README is 24 bytes, front matter only).
  - c. Training data (paper, 4.1): Slakh2100 ("in which the duplicated tracks are removed"); evaluations also on
    ComMU and NSynth.
- **Author-reported measurements (paper, results table):** "MR-MT3 Slakh Mixes" 67.3 against "MT3 Slakh Mixes"
  64.9 in the table's first Slakh column (column label not re-read; UNVERIFIED which F1 variant).

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
  2026-11-10). Hosted UI: https://muscriptor.kyutai.org (not read).
- **Version and maintenance:** PyPI `muscriptor` 0.4.0 uploaded 2026-10-20 (first upload 2026-07-10,
  `requires_python='>=3.10'`, `license_expression='MIT'`); last commit 2026-10-20 (8a1ef88).
- **How a program calls it (README):** CLI `uvx muscriptor transcribe path/to/audio_file.wav` (`--help` for
  options), web UI `uvx muscriptor serve`, Python `pip install muscriptor` (`load_model()` named in the README).
  Weights download on first use after a Hugging Face login: "To use MuScriptor locally, you first need to log into
  HuggingFace and accept the CC BY-NC 4.0 license" (access "is granted automatically"; the Hugging Face API shows
  `gated: auto` for all three repositories).
- **Model sizes (README table):** `small` 103M parameters, `medium` (default) 307M, `large` 1.4B; "`small` is the
  practical choice on CPU-only machines, `medium` is the default speed/accuracy trade-off, and `large` ... really
  wants a GPU." Weight files (Hugging Face API, read 2026-11-10): small 411,888,600 bytes, medium 1,228,144,472
  bytes, large 5,465,642,136 bytes (`model.safetensors`). GGUF conversions exist at `DamRsn/muscriptor-gguf`
  (card license `cc-by-nc-4.0`; f16 files 209 MB, 618 MB, 2.74 GB; last modified 2026-11-08).
- **Output (README):** MIDI with "beats, time signature and bar lines ... detected from the audio and written
  into the MIDI" (a tempo map when the tempo is not steady); with `--format sheets` (needs MuseScore 4 or newer):
  `score.mid`, `score.musicxml`, `full_score.pdf`, one PDF per instrument and "a tablature PDF for fretted ones"
  (for example `01_electric_guitar_tab.pdf`). UNVERIFIED: the per-note fields and how instruments are labelled in
  the MIDI (read the CLI `--help` or the code to settle).
- **Constraints a re-run can pass (README):** `--bpm`, `--beats-per-bar`, `--first-downbeat`, `--fixed-tempo`,
  `--beat-scale 2|0.5`, `--quantize`, `--grid`, `--quantize-strength`, `--fill-gaps`, `--trim-leading-bars`,
  `--model`. The paper (contribution 4): "Instrument-conditioned Transcription: By optionally conditioning on
  instrument presence, we stabilize pre-..." (text cut at the PDF column break) and "we provide the model with the
  set of instru[ments]" as a conditioning prefix. Whether the released CLI exposes instrument conditioning:
  UNVERIFIED (check `--help`). No tuning or capo option is listed in the README.
- **Access needs:** a free Hugging Face account and acceptance of the gated model terms.
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/muscriptor/muscriptor/main/LICENSE, read 2026-11-10: "MIT
    License Copyright (c) 2026 Kyutai x Mirelo" with the standard MIT grant. README: "The code in this repository
    is released under the MIT license."
  - b. Weights: README: "The model weights, published on HuggingFace, are released under the CC BY-NC 4.0 license
    (non-commercial use)." Hugging Face card license tag `cc-by-nc-4.0` on `MuScriptor/muscriptor-small`,
    `-medium`, `-large` (API read 2026-11-10; the model cards' README files returned HTTP 401 to an anonymous
    request because the repositories are gated).
  - c. Training data (paper, 3.1): "a dataset of roughly 1.45 million MIDI files (both from publicly available
    sources like Lakh MIDI and from commercial data providers)", synthesized "using a randomly selected soundfont
    (from a collection of over 250 soundfonts)", and "an internal dataset of 170 000 real music audio recordings
    (totalling over 11 000 hours) with aligned note annotations". The paper PDF carries "Licensed under a Creative
    Commons Attribution 4.0 International License (CC BY 4.0)" for the paper text.
  - d. Service: the hosted UI's terms were not read (UNVERIFIED).

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
  (also `vocal`, `vocal-contour`, `beat`); Docker image `mctlab/omnizart:latest`; Colab and Replicate badges. CHANGELOG
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
    (UNVERIFIED).
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
  it also lists "Transcription, reconstruction, and consistency objectives"). UNVERIFIED: the output format of the
  Space's `app.py`.
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
  - b. Weights: CC BY-NC-SA 3.0 (the same LICENSE note).
  - c. Training data (README): "Sheet Sage was trained on a new dataset of 50 hours of aligned melody and harmony
    annotations derived from Hooktheory's TheoryTab DB, which we release alongside this system under a CC BY-NC-SA
    3.0" license.

## 23. Deep Salience

- **What, who, links:** companion code for Bittner, McFee, Salamon, Li, Bello, "Deep Salience Representations for
  F0 Estimation in Polyphonic Music", ISMIR 2017 (README, https://raw.githubusercontent.com/rabitt/ismir2017-deepsalience/master/README.md,
  read 2026-11-10). Repository https://github.com/rabitt/ismir2017-deepsalience , last commit 2019-11-22 (4b2ff44).
- **How a program calls it:** "To compute output from these models, run the script predict/predict_on_audio.py"
  (Keras). Weights in the repository: `predict/weights/{bass,melody1,melody2,melody3,multif0,pitch,vocal}.h5`
  (about 1.67 MB each). UNVERIFIED: the script's arguments and output format.
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
  license"; that repository was not read) and `ggml` ("MIT license").
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
  `onsets_frames_transcription_transcribe <piano_recording1.wav, ...>` (with `--config="drums"` for drums). A Colab
  notebook is linked. Output format: not stated in the README lines read (UNVERIFIED).
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
  (`transcribed_dict`); the paper covers notes and sustain pedals (title). UNVERIFIED: the dict's exact keys.
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
  with data augmentation".
- **License facts:**
  - a. Code: MIT. https://raw.githubusercontent.com/Yujia-Yan/Transkun/main/LICENSE, read 2026-11-10: "MIT License
    Copyright (c) 2021 Yujia Yan" with the standard MIT grant.
  - b. Weights: the shipped checkpoint is in the MIT-licensed package; the paper checkpoints are Google Drive links
    in the README's model cards. No separate weights license statement was found.
  - c. Training data: V2 paper, section 5.1 "Dataset": "Maestro v3.0.0. This dataset contains about 200 hours of
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
  the model for MAESTRO"). No pip package, no single-file transcription CLI in the README lines read.
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
- **Output:** written to `-save_dir`; the format is not stated in the README lines read (UNVERIFIED).
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
  Python 3.10+ madmom issue and a git install fix).
- **License facts:** a. Code: GPL-3.0. https://raw.githubusercontent.com/xavriley/crepe_notes/main/LICENSE ("GNU
  GENERAL PUBLIC LICENSE Version 3, 29 June 2007"), read 2026-11-10; PyPI license field "GNU General Public License
  v3.0 license". b, c. It runs CREPE (or PESTO, PENN, torchcrepe) weights; see those sections.

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
  Melody Extraction from Polyphonic Music"" (README, https://raw.githubusercontent.com/Annmixiu/MTANet/main/README.md,
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
  al., https://arxiv.org/abs/2405.09940 (PDF downloaded 2026-11-10). Last commit 2024-11-20 (3c8332b).
- **How a program calls it:** conda environment with Python 3.9 and torch (README install commands use the
  `cu118` index), checkpoint from a Google Drive link ("Download the checkpoints.zip and unzip it under the
  project root"). Output: MIDI ("turn a waveform of singing voice into a sequence of note events, in the form of
  MIDI"); "If word boundaries are given ... the output MIDI notes are aligned with word timestamps." "The
  checkpoint we provided was trained with Mandarin datasets."
- **License facts:** a. Code: MIT, https://raw.githubusercontent.com/RickyL-2000/ROSVOT/main/LICENSE ("MIT License
  Copyright (c) 2024 Ruiqi Li"), read 2026-11-10. b. Weights: Google Drive zip; no license statement found. c.
  Training data: "Mandarin datasets" (README); names and licenses not read (UNVERIFIED).

## 34. Services and desktop products in this category (pointers)

The apps-survey lane covers desktop and mobile products and the hosted-apis lane covers HTTP APIs. Facts read by
this agent for this category:

- Basic Pitch's README links a demo site, https://basicpitch.io (not read).
- MuScriptor has a hosted UI at https://muscriptor.kyutai.org (README; not read). Its weights' license
  (CC BY-NC 4.0) is in section 19.
- YourMT3+ and Timbre-Trap run as public Hugging Face Spaces (sections 16 and 21); the hosted-apis lane covers
  calling Spaces with `gradio_client`.
- SwiftF0 runs in the browser with ONNX Runtime Web (README; demo https://swift-f0.github.io/ not read).
- Klangio, Music.AI, AnthemScore, Melodyne, Ableton Live's "Convert to MIDI": not read by this agent (see the
  apps-survey and hosted-apis lanes).

## Training datasets and their license clauses

Read 2026-11-10. "Used by" lists the released weights above whose authors name the dataset as training data.

| Dataset | Used by (training) | License clause, verbatim, and where it was read |
|---|---|---|
| GuitarSet | Basic Pitch, MT3, YourMT3+ | Zenodo record https://zenodo.org/records/3371780 (version 1.1.0, published 2019-08-20): "License Creative Commons Attribution 4.0 International". A newer Zenodo record titled "GuitarSet" (id 18308760, 2026-01-20) also carries `cc-by-4.0` in the Zenodo API. |
| MAESTRO (v2, v3) | Basic Pitch, MT3, YourMT3+, Onsets and Frames, ByteDance piano, Transkun, hFT-Transformer, Onsets and Velocities | https://magenta.tensorflow.org/datasets/maestro : "The dataset is made available by Google LLC under a Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0) license." |
| Slakh2100 (and Cerberus4, which the MT3 paper says "is derived from the Slakh2100 dataset") | Basic Pitch, MT3, YourMT3+, MR-MT3 | Zenodo record https://zenodo.org/records/4599666 (version "slack2100-redux", 2019-10-20): "License Creative Commons Attribution 4.0 International". |
| MusicNet | MT3, YourMT3+ (MusicNet-EM) | Zenodo record https://zenodo.org/records/5120004 (version 1.0, 2016-11-30): "License Creative Commons Attribution 4.0 International"; description: "The audio recordings in MusicNet consist of Creative Commons licensed and Public Domain performances, sourced from the Isabella Stewart Gardner Museum, the European Archive Foundation, and Musopen." |
| URMP | MT3, YourMT3+, Timbre-Trap | https://labsites.rochester.edu/air/projects/URMP.html (page read 2026-11-10): no license statement found on the page. |
| MedleyDB | Basic Pitch, CREPE | Zenodo record "MedleyDB 2.0 Audio" https://zenodo.org/records/1715175 (restricted files), access conditions: "MedleyDB is offered free of charge for non-commercial research use only under the terms of the Creative Commons Attribution Noncommercial License: http://creativecommons.org/licenses/by-nc-sa/4.0/". |
| MDB-stem-synth | CREPE, Essentia CREPE, PESTO (one checkpoint in the paper), RMVPE, PENN | Zenodo record https://zenodo.org/records/1481172 (version 1.0.0, 2018-11-08): "MDB-stem-synth is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)." |
| NSynth | CREPE | https://magenta.tensorflow.org/datasets/nsynth : "The dataset is made available by Google Inc. under a Creative Commons Attribution 4.0 International (CC BY 4.0) license." |
| MIR-1K | CREPE, PESTO, RMVPE | The Zenodo copy https://zenodo.org/records/3532216 is restricted, with the condition "if you want use mir1k dataset pls directly contact the author of mir1k, here the dataset just a backup of my using." The original distributor's terms were not read (UNVERIFIED). |
| iKala | Basic Pitch | The Zenodo copy https://zenodo.org/records/3532214 is restricted: "If you need this dataset plz contact the author of ikala, this version is just a backup for myself." Original terms not read (UNVERIFIED). |
| RWC Music Database (RWC-synth) | CREPE, Essentia CREPE | https://staff.aist.go.jp/m.goto/RWC-MDB/ : the connection was reset on 2026-11-10 (not read, UNVERIFIED). |
| E-GMD | Onsets and Frames (drum checkpoint), YourMT3+ ("EGMD") | https://magenta.tensorflow.org/datasets/e-gmd : "The dataset is made available by Google LLC under a Creative Commons Attribution 4.0 International (CC BY 4.0) License." |
| Lakh MIDI | MuScriptor (synthetic pre-training, alongside MIDI "from commercial data providers") | https://colinraffel.com/projects/lmd/ : "The Lakh MIDI Dataset is distributed with a CC-BY 4.0 license" and "attributing each of the MIDI files in the dataset to a particular author is not feasible." |
| HookTheory (TheoryTab) | Sheet Sage | quoted in section 22 (CC BY-NC-SA 3.0, per the Sheet Sage LICENSE note). |
| pitch-benchmark (Hugging Face) | SwiftF0 0.3.0 | card license tag `cc-by-nc-sa-4.0` (section 7). |
| Aria-MIDI (Hugging Face) | hosts the Aria-AMT checkpoint | `license: cc-by-nc-sa-4.0` (section 28). |
| Not read (UNVERIFIED) | | Bach10, Cmedia, MIR-ST500, PTDB-TUG, M4Singer, VCTK, ENST-Drums, SMT-Bass, MAPS, Molina, Phenicx, ComMU. |

## Handoff facts

One fact per line, "X outputs ..., which Y accepts as ...", each half with the source read on 2026-11-10. These
are documentation facts; tested handoffs (runs) are in `trials.md`.

Stems into transcribers (source-separation lane to this lane):

- Demucs writes stems as files: "Separated tracks are stored in the `separated/MODEL_NAME/TRACK_NAME` folder. There
  you will find four stereo wav files sampled at 44.1 kHz: `drums.wav`, `bass.wav`, `other.wav`, `vocals.wav`"
  and the 6-source model "adds a `guitar` and `piano` source" (https://raw.githubusercontent.com/adefossez/demucs/main/README.md),
  which Basic Pitch accepts as an input audio path: "Input audio maybe be of any sample rate, however, all audio
  will be resampled to 22050 Hz", stereo "down-mixed to mono" (https://raw.githubusercontent.com/spotify/basic-pitch/main/README.md).
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
  `duration` [s] and `MIDIpitch` (https://essentia.upf.edu/reference/std_PitchContourSegmentation.html).
- SwiftF0's `detect` outputs a `PitchResult` (`timestamps`, `pitch_hz`, `confidence`, `loudness_db`), which its own
  `segment_notes(result, pitch_hold_ms=80.0)` accepts and turns into `Note(start, end, pitch_hz)` for
  `export_to_midi` (SwiftF0 README).
- PESTO, PENN and torchcrepe are pitch backends that CREPE Notes accepts with `--pitch-tracker pesto|penn|torchcrepe`,
  writing `[audio_file_stem].[pitch_tracker].transcription.mid` (https://raw.githubusercontent.com/xavriley/crepe_notes/main/README.md).
- RMVPE pretrained weights (release https://github.com/yxlllc/RMVPE/releases, not read) are what SOME's README
  asks for "For better pitch extraction results" in its `pretrained/` directory (SOME README).
- Basic Pitch's model file is what NeuralNote v1 used; NeuralNote v2 accepts MuScriptor GGUF files from
  `DamRsn/muscriptor-gguf` (https://raw.githubusercontent.com/DamRsn/NeuralNote/main/README.md).

Notes or MIDI to notation and tab tools (this lane to the guitar-tab and web-tab-render lanes):

- Basic Pitch outputs a MIDI file (program "Electric Piano 1", velocity from amplitude, pitch-bend events) and a
  CSV with header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend` (`basic_pitch/note_creation.py` and
  `inference.py`, https://raw.githubusercontent.com/spotify/basic-pitch/main/basic_pitch/), with no string or fret
  field; music21's converter accepts MIDI through its `ConverterMidi` subconverter, and "quantizePost specifies
  whether to quantize a stream resulting from MIDI conversion. By default, MIDI streams are quantized to the
  nearest sixteenth or triplet-eighth" (https://www.music21.org/music21docs/moduleReference/moduleConverter.html).
- A MIDI file from any transcriber here (Basic Pitch, MT3, YourMT3+, Transkun, ByteDance piano, CREPE Notes,
  SwiftF0, SOME, GAME), which the MuseScore 4 command line accepts for conversion ("-o | --export-to file ... The
  file type depends on the extension of the filename given"; "-M | --midi-operations file: Specify MIDI import
  operations file", https://musescore.org/en/handbook/4/command-line-usage).
- MuScriptor `--format sheets` outputs `score.mid`, `score.musicxml`, `full_score.pdf`, per-instrument PDFs and
  "a tablature PDF for fretted ones" (needs MuseScore 4) (https://raw.githubusercontent.com/muscriptor/muscriptor/main/README.md),
  and alphaTab lists among its importers "MusicXML ( .xml ) — open XML standard" next to "Guitar Pro 3–5", "Guitar
  Pro 6", "Guitar Pro 7 and 8" and "CapXML" (https://alphatab.net/docs/introduction). MIDI is not among the
  importers on that page.
- MT3 outputs MIDI whose notes carry an instrument value matching "the original General MIDI specification, which
  contains 128 "programs"" (MT3 paper, https://arxiv.org/abs/2111.03017), so guitar notes can be selected by
  program number before a string-and-fret step (the program numbers for guitars are in the GM specification, not
  read here).

Beat and tempo into transcribers (chords-beats-key lane to this lane):

- A tempo in BPM from a beat tracker or the user, which Sheet Sage accepts as `--beats_per_minute_hint 120` and
  downbeat times as `-s`/`-e` with `--segment_hints_are_downbeats` (Sheet Sage README); which MuScriptor accepts as
  `--bpm`, `--beats-per-bar`, `--first-downbeat`, `--beat-scale` (MuScriptor README); which `audio_to_midi_melodia.py`
  requires as its `bpm` argument (https://raw.githubusercontent.com/justinsalamon/audio_to_midi_melodia/master/README.md);
  which FCPE's `extact_midi` accepts as `tempo` (FCPE README); and which Basic Pitch's `predict()` accepts as
  `midi_tempo` (default 120, `basic_pitch/inference.py`). In each case the tempo only sets the MIDI or score grid,
  per the cited text.
- MuScriptor writes "beats, time signature and bar lines ... detected from the audio" into its MIDI as a tempo map
  (MuScriptor README), and Sheet Sage "runs beat detection on your input" with madmom (Sheet Sage README): both
  outputs carry beat information that a metronome or tab renderer could read (the reader side is in the
  browser-audio-sync and web-tab-render lanes; not read here).

User constraints into the tools that accept them (human-in-the-loop re-runs):

- A pitch range in Hz (from a tuning, capo and number of frets chosen by the user; the arithmetic is not from a
  source), which Basic Pitch accepts as `minimum_frequency` / `maximum_frequency` ("Pitch events with frequencies
  outside of this range will be excluded"), `librosa.pyin` as `fmin` / `fmax`, torchcrepe and PENN as `fmin` /
  `fmax`, FCPE as `f0_min` / `f0_max`, SwiftF0 as `fmin` / `fmax` ("A frame whose best pitch lies outside the band
  gets confidence 0"), and Essentia's Melodia, Klapuri and Audio2Midi as `minFrequency` / `maxFrequency` (sources in
  each tool's section).
- A tuning reference in Hz (for example from a detuned recording), which Essentia's `PitchContourSegmentation`
  accepts as `tuningFrequency` ("tuning reference frequency [Hz]", default 440) when it quantizes pitch to MIDI
  notes (Essentia reference page above). No other tool in this lane lists a tuning-reference input in the pages read.
- Note boundaries corrected by the user, which GAME accepts: "Estimate note pitches from note boundaries adjusted by
  user in interactive tuning tools" and "notes and pitches can align and adapt to known boundaries" (GAME README);
  ROSVOT accepts word boundaries ("If word boundaries are given ... the output MIDI notes are aligned with word
  timestamps", ROSVOT README).
- A known set of instruments, which the MuScriptor paper describes as optional conditioning ("By optionally
  conditioning on instrument presence") (https://arxiv.org/abs/2607.08168); whether the released CLI accepts it is
  UNVERIFIED.
- Onset and frame thresholds and a minimum note length, which Basic Pitch accepts as `onset_threshold`,
  `frame_threshold`, `minimum_note_length` (ms); aubio's `aubionotes` as `-t`, `-M` (minimum inter-onset interval in
  seconds), `-s` (silence dB), `-l` (pitch tolerance); CREPE Notes as min duration, min velocity and sensitivity.
- No tool in this lane's sources accepts a capo position, an open-string tuning, or a string or fret assignment as
  an input: a text search on 2026-11-10 for "capo", and for "tuning" or "string" next to "guitar" or "fret", over
  every README, doc page and model card fetched for this file found no such parameter. Those constraints belong to
  the guitar-tab lane's tools.

