# Lane 2, chords-beats-key: survey of chord, beat, tempo, key and tuning tools

Agent: docs-chords-beats-key. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from the
live pages on 2026-11-10 unless a line says otherwise. Raw copies of files fetched with curl or git (LICENSE
files, READMEs, PyPI JSON) are kept outside the repo in `/home/user/gtr/lanes/chords-beats-key/raw/` (not
committed). This file records facts and quotes only; it does not rank or recommend.

Checked and corrected in place on 2026-11-10 by a second agent (verify-docs-chords-beats-key): every quote was
re-fetched from its URL and compared, versions and dates were re-read, and missing tools and training-data licenses
were added. What changed and the counts are in "## Verification log" at the end. Its copies of the fetched pages are
in `/home/user/gtr/lanes/chords-beats-key/verify/` (not committed); its scripts are `scripts/verify_*`.

Marks used in the tool list:

- `RUNNABLE`: looks installable and runnable on the CPU-only Linux research box (pip / apt / npm package or a
  repository with CPU inference code and released weights). Whether it actually ran is in `trials.md`, not here.
- `NEEDS-ACCOUNT`: a hosted service or API that needs an account or key.
- `NO-CODE-FOUND`: a paper or product with no public code or API found on 2026-11-10.

## Tool list

First pass written in the first 15 minutes from web search results, then updated with the dates and licenses found
in the sections below. Each line is a pointer; the section is what counts. Dates: HEAD commit of the default branch
(shallow clone, 2026-11-10) and the latest PyPI or npm upload. License: code / weights where they differ.

### Chord recognition

1. Chordino + NNLS Chroma + Tuning (Vamp plugins, C4DM QMUL). HEAD 2020-04-22. GPL-2.0-or-later. RUNNABLE (build
   from source, or the binary bundled in chord-extractor). 18 built-in chord profiles per root, or a user chord.dict.
2. madmom chords (DeepChroma + CRF, CNN + CRF), JKU Linz. HEAD 2024-08-25; PyPI 0.16.1 of 2018-11-14. Code BSD-2 /
   models CC BY-NC-SA 4.0. RUNNABLE (from GitHub source). 25 classes (12 maj, 12 min, N), 10 fps.
3. autochord (Bi-LSTM-CRF on NNLS chroma). HEAD 2023-02-22; PyPI 0.1.4 of 2021-10-07. Repo LICENSE Apache-2.0, PyPI
   classifier MIT; bundles `nnls-chroma.so`; model from Google Drive. RUNNABLE? (TensorFlow). 25 classes.
4. chord-extractor (Chordino wrapper). HEAD 2025-08-14; PyPI 0.1.3 of 2025-08-14 (Python <3.12). GPL-2.0. RUNNABLE.
5. BTC (Bi-directional Transformer). HEAD 2020-05-23. MIT, weights in the repository. RUNNABLE (PyTorch, CPU
   fallback). 25 or 170 classes.
6. CREMA. HEAD 2022-04-19; PyPI 0.2.0 of 2022-04-21. LICENSE.md BSD-2, PyPI ISC. RUNNABLE? (old pins). JAMS output.
7. lv-chordia / ISMIR 2019 large-vocabulary model (Chord-CNN-LSTM). HEAD 2024-04-09; PyPI lv-chordia 1.1.0 of
   2026-07-11. MIT. RUNNABLE. JSON output, selectable chord dictionaries.
8. ChordMini (ChordMiniApp). HEAD 2026-07-30. MIT (app; its model repository ptnghia-j/ChordMini is also MIT, but
   the paper's pseudo-label training audio includes CC BY-NC-SA 4.0 datasets, see section). Needs Firebase and Gemini
   keys for the full app; NEEDS-ACCOUNT. Uses BTC variants, Chord-CNN-LSTM, Beat-Transformer, madmom.
9. Essentia ChordsDetection (HPCP template matching). PyPI essentia 2.1b6.dev1438 of 2026-05-19. AGPL-3.0 (commercial
   license from UPF). RUNNABLE. 24 major/minor triads; marked "experimental" by its docs.
10. Omnizart chord. HEAD 2026-05-31; PyPI 0.6.3 of 2026-05-31. MIT. RUNNABLE? (TensorFlow). MIDI + CSV, 24 maj/min + N
    (the label map also holds an "X" class).
11. Harmony Transformer v1 (2019-11-08) and v2 (2021-05-05). No license file found; training scripts only (v1 ships
    McGill Billboard chroma features and lab files in the repository; v2 is for symbolic music). No weights.
12. ACR_seq2seq (ICASSP 2026; arXiv 2604.24386). HEAD 2026-05-31. No license file found; README is a citation only;
    the tree holds training code (`base/`, `pre_train/`, `full_train/`) and no checkpoint files.
13. ChordFormer (arXiv 2502.11840, 2025). NO-CODE-FOUND.
14. BMACE (arXiv 2601.02101, an ISMIR 2024 late-breaking demo per the arXiv comment). NO-CODE-FOUND.
15. QM Vamp Plugins (key, beat, bar-beat, chromagram, tonal change). HEAD 2021-06-02. GPL; README says binaries may be
    used "for any purpose commercial or non-commercial". RUNNABLE (binaries or source build).
16. pyace (2017 to 2021). HEAD 2021-06-01. BSD-3-style. Not examined further.

### Beat, downbeat and tempo

17. madmom beat / downbeat / tempo (RNN + DBN). Same dates and code/model split as item 2. RUNNABLE. Beats, downbeats
    with bar position, tempo; meter and tempo-range arguments.
18. librosa beat_track / feature.tempo / plp. PyPI 1.0.0 of 2026-08-11 (Python >=3.12); HEAD 2026-11-10. ISC.
    RUNNABLE. Beats and global tempo, no downbeats.
19. Beat This! HEAD 2026-05-28; PyPI beat-this 1.1.0 of 2026-04-14. MIT code and weights. RUNNABLE (CPU allowed).
    Beats and downbeats.
20. BeatNet. HEAD 2026-04-13; PyPI 1.1.3 of 2023-11-28 (`setup.py` at HEAD says 1.2.0, not on PyPI). CC BY 4.0
    (repository LICENSE). RUNNABLE. Beats and downbeats, online and offline. BeatNet+ is item 42.
21. All-In-One (allin1). HEAD 2023-10-10; PyPI 1.1.0 of 2023-10-10. MIT code, MIT weights on Hugging Face. RUNNABLE?
    (needs NATTEN built on Linux, madmom from GitHub, Demucs). BPM, beats, downbeats, beat positions, sections.
22. Essentia RhythmExtractor2013 and TempoCNN. AGPL-3.0 code; TempoCNN models CC BY-NC-SA 4.0.
    RUNNABLE. BPM and beat ticks; TempoCNN global and local tempo.
23. aubio (aubiotrack and friends). HEAD 2026-04-10; PyPI 0.4.9 of 2019-02-08; Ubuntu aubio-tools on the box.
    GPL-3.0-or-later. RUNNABLE (C tools). Beat times.
24. tempo-cnn. HEAD 2024-10-17; PyPI tempocnn 0.0.8 of 2024-10-17 (Python 3.9 to 3.11). AGPL-3.0 code and models.
    RUNNABLE. Global tempo, tempogram, meter.
25. DeepRhythm. HEAD 2026-07-21; PyPI deeprhythm 0.0.13 of 2024-12-07. AGPL-3.0 (weights are files in the same
    repository). RUNNABLE. Global tempo with confidence. (Added.)
26. Beat Transformer. HEAD 2024-04-07. MIT. RUNNABLE? (repository targets 8-fold evaluation and Colab; Spleeter
    stems). Beats and downbeats.
27. BEAST (ICASSP 2024). HEAD 2024-09-11. MIT. Evaluation script and Google Drive model only.
28. realtime-bpm-analyzer (npm). npm 5.6.1 of 2026-11-03; HEAD 2026-11-10. Apache-2.0. RUNNABLE (browser and Node).
    Tempo candidates.
29. essentia.js. HEAD 2022-07-19; npm 0.1.3 of 2021-06-24. AGPL-3.0. RUNNABLE (browser and Node).

### Key and tuning

30. librosa estimate_tuning / pitch_tuning. ISC. RUNNABLE. Tuning offset in fractions of a bin. No key estimator.
31. Essentia KeyExtractor (16 profile types, default "bgate"), TuningFrequency (Hz and cents). AGPL-3.0. RUNNABLE.
32. madmom key (CNN ensemble, 24 keys). Code BSD-2 / models CC BY-NC-SA 4.0. RUNNABLE.
33. libKeyFinder (HEAD 2024-07-09) and keyfinder-cli (HEAD 2026-11-10). GPL-3.0. RUNNABLE (CMake build; not in Ubuntu
    24.04 apt).
34. S-KEY (Deezer). HEAD 2026-10-27. MIT code; weights "only for non-commercial research purposes". RUNNABLE (poetry,
    CPU). Trained on songs from the Deezer catalog (paper).
35. music21 key analysis (symbolic). PyPI 10.5.2 of 2026-10-28 (pre-release 11.0.0b14 uploaded 2026-10-31); HEAD
    2026-11-08. BSD-3-Clause. RUNNABLE.
36. NNLS Tuning plugin (concert pitch in Hz, global and local). GPL-2.0-or-later. RUNNABLE.
37. Guitar open-string tuning classification (Hulme et al., DLfM 2024 per search results). HEAD 2024-04-25. No license
    file found. RUNNABLE? (TensorFlow; models on Google Drive). Five classes in its evaluation code: DADGAD, Drop D,
    Open D, Open G, Standard. Rochester ECE 477 report 2023 (seven tunings): no code URL in its text; 2019 project not
    read.
38. Capo position from audio: NO-CODE-FOUND (no paper, dataset or code found).

### Hosted services and products (pointers only; terms in other lanes)

39. Music.AI (Moises), Klangio, Replicate-hosted All-In-One and chord models: hosted-apis lane. NEEDS-ACCOUNT.
40. Spotify audio-features / audio-analysis: closed to new Web API use cases from 2024-11-27 (Spotify's announcement,
    read 2026-11-10). NEEDS-ACCOUNT.
41. GetSongBPM API (lookup by title, not audio analysis; page answered HTTP 403 on 2026-11-10), Cyanite, Tunebat,
    Chordify, Chord ai, Capo app: apps-survey lane.

### Added by the verifier (2026-11-10)

42. BeatNet+ (TISMIR 2024). https://github.com/mjhydri/BeatNet-Plus HEAD 2026-04-13. No license file and no license
    statement found. Weights in the repository. Beats and downbeats (online, offline, realtime, streaming).
43. STONE (Deezer, ISMIR 2024; the predecessor of S-KEY). https://github.com/deezer/stone HEAD 2025-10-24. No license
    file and no license statement found. Two checkpoints in the repository. Key signature and mode.
44. key-cnn (Hendrik Schreiber). https://github.com/hendriks73/key-cnn HEAD 2020-07-30. AGPL-3.0 ("Source code and
    models"). Not on PyPI. Global key.
45. web-audio-beat-detector (npm). npm 8.2.39 of 2026-08-26; HEAD 2026-08-30. MIT. RUNNABLE (browser). Tempo and
    first-beat offset from an `AudioBuffer`.
46. Essentia ChordsDetectionBeats (one chord per beat interval), TonalExtractor (key, chords, HPCP in one call) and
    PercivalBpmEstimator (tempo). Same AGPL-3.0 code license as item 9; no trained weights. RUNNABLE.

---

# Sections

Common license texts quoted below (all read 2026-11-10 from the files named in each section):

- MIT grant sentence: "Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the "Software"), to deal in the Software without restriction, including without
  limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
  Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:"
- GPL-3.0 section 5(c): "c) You must license the entire work, as a whole, under this License to anyone who comes into
  possession of a copy. This License will therefore apply, along with any applicable section 7 additional terms, to
  the whole of the work, and all its parts, regardless of how they are packaged."
- GPL-2.0 section 2(b): "b) You must cause any work that you distribute or publish, that in whole or in part contains
  or is derived from the Program or any part thereof, to be licensed as a whole at no charge to all third parties
  under the terms of this License."
- AGPL-3.0 section 13: "Notwithstanding any other provision of this License, if you modify the Program, your modified
  version must prominently offer all users interacting with it remotely through a computer network (if your version
  supports such interaction) an opportunity to receive the Corresponding Source of your version by providing access to
  the Corresponding Source from a network server at no charge, through some standard or customary means of
  facilitating copying of software."
- CC BY 4.0 section 2(a)(1): "Subject to the terms and conditions of this Public License, the Licensor hereby grants
  You a worldwide, royalty-free, non-sublicensable, non-exclusive, irrevocable license to exercise the Licensed Rights
  in the Licensed Material to: a. reproduce and Share the Licensed Material, in whole or in part; and b. produce,
  reproduce, and Share Adapted Material."

Repository dates below are the HEAD commit date of the default branch from a shallow `git clone` made 2026-11-10
(script: `scripts/repo_facts.sh`, output kept at `/home/user/gtr/lanes/chords-beats-key/raw/repo_facts_1.tsv`).
PyPI versions and upload dates are from `https://pypi.org/pypi/<name>/json` read 2026-11-10 (script:
`scripts/pypi_facts.py`).

## Beat This! (beat and downbeat tracking)

- What: beat and downbeat tracker from the ISMIR 2024 paper "Beat This! Accurate Beat Tracking Without DBN
  Postprocessing" by Francesco Foscarin, Jan Schlüter and Gerhard Widmer (JKU Linz). Repository
  https://github.com/CPJKU/beat_this (HEAD 2026-05-28, commit b95c8ab). Paper https://arxiv.org/abs/2407.21658.
  PyPI `beat-this` 1.1.0, uploaded 2026-04-14 (first PyPI upload 2026-04-13).
- How to call (README, https://raw.githubusercontent.com/CPJKU/beat_this/main/README.md):
  - CLI: "beat_this path/to/audio.file -o path/to/output.beats"; several files: "beat_this path/to/*.mp3
    path/to/whole_directory/ -o path/to/output_directory". "with `--gpu=-1` it will force the CPU" (mid-sentence in the
    README). "If you want to use the DBN for postprocessing, add `--dbn`" (needs madmom from GitHub). Model choice with
    `--model`.
  - Python: "from beat_this.inference import File2Beats", "file2beats = File2Beats(checkpoint_path="final0",
    device="cuda", dbn=False)", "beats, downbeats = file2beats(audio_path)".
  - torch.hub: "torch.hub.load('CPJKU/beat_this', 'beat_this', 'final0', device='cuda')".
  - Needs: PyTorch plus "tqdm einops soxr rotary-embedding-torch". The README says it "will use the first GPU in
    your system by default, and fall back to CPU if PyTorch does not have CUDA access."
- Models (README "Available models"): `final0..2` "trained on all data except the GTZAN dataset ... About 78 MB per
  model"; `small0..2` "About 8.1 MB per model"; `single_final*`, `fold0..7`, `hung0..2` and ablation models.
  Downloaded automatically from "https://cloud.cp.jku.at/index.php/s/7ik4RrBKTS273gp".
- Input: an audio file path; the inference code resamples to 22050 Hz with soxr
  (`beat_this/inference.py` line 274-275: "if sr != 22050: signal = soxr.resample(signal, in_rate=sr, out_rate=22050)").
- Output: two NumPy arrays of times in seconds, `beats` and `downbeats`. The `.beats` file: "each line has a time in
  seconds, a tab, and a beat number (1 = downbeat)" (docstring of `save_beat_tsv`,
  https://raw.githubusercontent.com/CPJKU/beat_this/main/beat_this/utils.py). No tempo value and no time signature
  field are listed in the README outputs; beat numbers per bar come from the downbeats.
- Constraints a re-run can take: model choice, `--dbn` (madmom DBN with madmom's default parameters). No tempo range
  or meter argument is documented in the README.
- License facts:
  - a. Code: MIT, https://raw.githubusercontent.com/CPJKU/beat_this/main/LICENSE ("Copyright (c) 2024 Institute of
    Computational Perception, JKU Linz, Austria"), MIT grant sentence as above. Read 2026-11-10.
  - b. Weights: README "License" section: "The code and the published model weights are released under the [MIT
    license](LICENSE). Note that some of the training files are fully copyrighted or under limited Creative Commons
    licenses, and it is up to the user to assess whether this may impact their use case." Read 2026-11-10.
  - c. Training data: annotations listed at https://raw.githubusercontent.com/CPJKU/beat_this_annotations/main/README.md
    (read 2026-11-10): asap, ballroom, beatles, candombe, filosax, groove_midi, gtzan, guitarset, hainsworth, harmonix,
    hjdb, jaah, rwc, simac, smc, tapcorrect. That annotations repository has its own LICENSE, MIT, "Copyright (c)
    2024 Institute of Computational Perception" (https://raw.githubusercontent.com/CPJKU/beat_this_annotations/main/LICENSE,
    read 2026-11-10); it holds annotations, not audio. Per-dataset license clauses were not read for this file except
    GuitarSet (Zenodo record 3371780 metadata: license "cc-by-4.0", https://zenodo.org/api/records/3371780, read
    2026-11-10) and the Harmonix Set repository (MIT, "Copyright (c) 2019 Oriol Nieto",
    https://raw.githubusercontent.com/urinieto/harmonixset/main/LICENSE; its README says "Users must agree to the
    License included before using these data."). RWC: the RWC Music Database page
    (https://staff.aist.go.jp/m.goto/RWC-MDB/) could not be fetched on 2026-11-10 (curl: connection reset; fetch tool:
    HTTP 503), so its terms are UNVERIFIED. The README also warns: "the results may be unfairly good if you run
    inference on any file from the training datasets" (GuitarSet is one of them, so this applies to the R1 inputs).
- Author measurements: not copied here (paper tables not read today).

## BeatNet and BeatNet+ (beat, downbeat, tempo, meter; online and offline)

- What: "BeatNet: Real-time and Offline Joint Music Beat, Downbeat, Tempo, and Meter Tracking System" (README title;
  the README calls it "the original ISMIR-2021 paper", https://arxiv.org/abs/2108.03576, whose arXiv title is "BeatNet:
  CRNN and Particle Filtering for Online Joint Beat Downbeat and Meter Tracking", by Mojtaba Heydari, Frank Cwitkowitz
  and Zhiyao Duan). Repository https://github.com/mjhydri/BeatNet (HEAD 2026-04-13, commit 81cedd4). PyPI `BeatNet`
  1.1.3 uploaded 2023-11-28; the README says "New in v1.2.0: The official training pipeline is now included", and
  `setup.py` at HEAD has `version="1.2.0"` (line 65); v1.2.0 is not on PyPI as of 2026-11-10. BeatNet+ has its own
  repository and section below.
- How to call (README, https://raw.githubusercontent.com/mjhydri/BeatNet/main/README.md): Python only:
  "from BeatNet.BeatNet import BeatNet", "estimator = BeatNet(1, mode='offline', inference_model='DBN', plot=[],
  thread=False)", "Output = estimator.process("audio file directory")". Modes: 'stream' (microphone, needs pyaudio),
  'realtime', 'online' (causal, particle filtering 'PF'), 'offline' ('DBN', uses madmom's DBN). "device: Type of
  device being used. Cuda or cpu (by default)." Needs madmom (README note on madmom 0.16.1 with Python >= 3.10 and
  NumPy >= 1.24 and the source fixes it lists).
- Models: three CRNN weight files in the repository: "model_1_weights.pt # Pre-trained weights (GTZAN)",
  "model_2_weights.pt # Pre-trained weights (Ballroom)", "model_3_weights.pt # Pre-trained weights (Rock Corpus)",
  selected with the first argument (1 to 3); `src/BeatNet/BeatNet.py` lines 77-81 load these three files. The tree at
  HEAD also holds `model-1.pt`, `model-2.pt` and `model-3.pt` in the same folder, which the README listing does not
  name.
- Input: "Raw audio waveform object or directory." "By using the audio directory as the system input, the system
  automatically resamples the audio file to 22050 Hz. However, in the case of using an audio object as the input,
  make sure that the audio sample rate is equal to 22050 Hz."
- Output: "A vector including beats and downbeats columns, respectively with the following shape:
  numpy_array(num_beats, 2)." (README "System Output"). Tempo and meter are in the title; no separate tempo or meter
  field is documented in the README output section.
- License facts:
  - a. Code: the repository LICENSE file is the Creative Commons Attribution 4.0 International legal code
    (https://raw.githubusercontent.com/mjhydri/BeatNet/main/LICENSE, read 2026-11-10); grant clause CC BY 4.0
    section 2(a)(1) as above. The README carries a "CC BY 4.0" badge linking http://creativecommons.org/licenses/by/4.0/.
    PyPI metadata for 1.1.3 has an empty license field and no license classifier.
  - b. Weights: in the same repository (`models/`), so the repository LICENSE file covers them; no separate weights
    license was found.
  - c. Training data: the README names GTZAN, Ballroom and Rock Corpus for the three weight files; the training
    command lists "--dataset BALLROOM GTZAN BEATLES CMR ROCK_CORPUS". Dataset licenses were not read today (UNVERIFIED).

## BeatNet+ (beat, downbeat, tempo, meter; causal CRNN) (added by the verifier)

- What: Mojtaba Heydari and Zhiyao Duan, "BeatNet+: Real-Time Rhythm Analysis for Diverse Music Audio", Transactions of
  ISMIR 7(1), pp. 274-287, published 2024-12-06, doi 10.5334/tismir.198
  (https://transactions.ismir.net/articles/10.5334/tismir.198, read 2026-11-10). Its "Reproducibility" section: "We
  open‑source the following: codes: https://github.com/mjhydri/BeatNet-Plus ; annotations:
  https://github.com/mjhydri/BeatNet-Plus/tree/main/annotations ." The repository README's BibTeX gives a different
  title ("BeatNet+: Advancing Music Beat and Downbeat Tracking for Non-Percussive Music and Singing Voices") and adds
  Frank Cwitkowitz as an author. Repository https://github.com/mjhydri/BeatNet-Plus (HEAD 2026-04-13, commit bb90eb0;
  top level: README.md, setup.py, src, test). `setup.py`: `version="1.0.0"`, `python_requires='>=3.8'`. PyPI has no
  project named BeatNetPlus, beatnet-plus or beatnetplus (HTTP 404 for each, 2026-11-10).
- How to call (README, https://raw.githubusercontent.com/mjhydri/BeatNet-Plus/main/README.md, read 2026-11-10):
  "from BeatNetPlus.inference import BeatNetPlusInference", "estimator = BeatNetPlusInference(
  'src/BeatNetPlus/models/generic_weights.pt', mode='online', inference_model='PF', device='cpu' )" (shown over several
  lines), "output = estimator.process("path/to/audio.wav")". Modes listed: online (particle filtering), offline (DBN),
  realtime, streaming (microphone). Install: "git clone https://github.com/mjhydri/BeatNet-Plus.git", "pip install -e ."
  with "numpy, librosa, madmom, torch, scipy, tensorboard, pyyaml, matplotlib".
- Input: audio file; the README architecture block starts from "Audio (22050 Hz)".
- Output (README "Output Format"): "All inference modes return a numpy array of shape `(num_beats, 2)`": column 0
  "Beat time in seconds", column 1 "Beat type: **1** = downbeat, **2** = regular beat". (BeatNet's README does not
  spell out the second column this way; Beat This! `.beats` files number every beat in the bar instead.)
- Models (README "Pre-trained Models"): "Three pre-trained weight files are included in `src/BeatNetPlus/models/`":
  `generic_weights.pt`, `generic_main_weights.pt`, `af_non_percussive_weights.pt` (the last one listed for
  "Non-percussive music, ambient, classical").
- Author measurement (README, "Key improvements over BeatNet" list): "Achieves **80.62** beat F1 and **56.51** downbeat
  F1 on GTZAN (vs BeatNet's 75.44 / 46.69)".
- License facts: a. Code: no LICENSE file in the tree at HEAD and no license statement in the README or `setup.py`
  (read 2026-11-10). b. Weights: in the same repository; no license statement found. c. Training data (README
  "Datasets" table): Ballroom, Hainsworth, Rock Corpus, MUSDB18, URSing, RWC Pop, RWC Jazz, RWC Royalty-free for
  training; "GTZAN is used exclusively for testing". MUSDB18 (Zenodo record 1117372, https://zenodo.org/api/records/1117372,
  read 2026-11-10): license id "other-nc", and its description says "MUSDB18 is provided for educational purposes only
  and the material contained in them should not be used for any commercial purpose without the express permission of
  the copyright holders". RWC terms: UNVERIFIED (page not reachable, see Beat This!). Others not read.

## All-In-One (`allin1`): tempo, beats, downbeats, sections

- What: music structure analyzer `allin1`; copyright holder in LICENSE "Taejun Kim". Paper (linked from the README):
  Taejun Kim and Juhan Nam, "All-In-One Metrical And Functional Structure Analysis With Neighborhood Attentions on
  Demixed Audio", https://arxiv.org/abs/2307.16425; arXiv comment: "This paper has been accepted for publication at the
  IEEE Workshop on Applications of Signal Processing to Audio and Acoustics (WASPAA), 2023" (read 2026-11-10).
  Repository https://github.com/mir-aidj/all-in-one (HEAD 2023-10-10, commit 18e7890). PyPI `allin1` 1.1.0 uploaded
  2023-10-10. Classifiers list Python 3.8 to 3.11 (pyproject.toml at HEAD).
- How to call (README, https://raw.githubusercontent.com/mir-aidj/all-in-one/main/README.md):
  - CLI: "allin1 [-h] [-o OUT_DIR] [-v] [--viz-dir VIZ_DIR] [-s] [--sonif-dir SONIF_DIR] [-a] [-e] [-m MODEL] [-d DEVICE]
    [-k] [--demix-dir DEMIX_DIR] [--spec-dir SPEC_DIR]"; "-d DEVICE ... (default: cuda if available else cpu)".
  - Python: "import allin1", `allin1.analyze(...)`, `allin1.load_result(...)`, `allin1.visualize(result)`,
    `allin1.sonify(result)` ("It will mix metronome clicks for beats and downbeats, and event sounds for segment
    boundaries").
  - Needs: NATTEN ("Required for Linux and Windows; macOS will auto-install"), madmom from GitHub ("pip install
    git+https://github.com/CPJKU/madmom"), and Demucs: `src/allin1/demix.py` runs "sys.executable, '-m',
    'demucs.separate'" with "'--name', 'htdemucs'" (source read from the clone at commit 18e7890), so every input is
    first split into stems by Demucs (Demucs weights: see the source-separation lane).
  - Speed claim (README "Speed", author's figure): "With an RTX 4090 GPU and Intel i9-10940X CPU (14 cores, 28
    threads, 3.30 GHz), the `harmonix-all` model processed 10 songs (33 minutes) in 73 seconds."
- Output: JSON per file with "bpm", "beats" (seconds), "downbeats" (seconds), "beat_positions" (1, 2, 3, 4, ...) and
  "segments" with start, end and "label" (README example). Optional `--activ` saves frame-level activations
  'beat', 'downbeat', 'segment', 'label' ("These have a resolution of 100 FPS, equivalent to 0.01 seconds per frame.");
  `--embed` saves embeddings. Labels: 'start', 'end', 'intro', 'outro', 'break', 'bridge', 'inst', 'solo', 'verse', 'chorus'.
  No chord output.
- Models: "The models are trained on the Harmonix Set with 8-fold cross-validation." "`harmonix-all`: (Default) An
  ensemble model averaging the predictions of 8 models trained on each fold." Weights are fetched by
  `hf_hub_download(repo_id='taejunkim/allinone', ...)` (`src/allin1/models/loaders.py` line 53).
- License facts:
  - a. Code: MIT, https://raw.githubusercontent.com/mir-aidj/all-in-one/main/LICENSE ("Copyright (c) 2023 Taejun
    Kim"), read 2026-11-10. PyPI license field empty.
  - b. Weights: Hugging Face model repository `taejunkim/allinone` (https://huggingface.co/api/models/taejunkim/allinone,
    read 2026-11-10): tags include "license:mit"; its model card README is only the YAML header "license: mit"
    (https://huggingface.co/taejunkim/allinone/raw/main/README.md). The repository also lists `all-fold*` and
    `raveform-fold3` checkpoints besides `harmonix-fold*`; what `all-` and `raveform` were trained on is not stated
    there; `TRAINING.md` in the code repository has a "Prepare Data (Harmonix Set)" section and names no other
    dataset (searched for dataset names, 2026-11-10).
  - c. Training data: Harmonix Set (annotations repository MIT, https://raw.githubusercontent.com/urinieto/harmonixset/main/LICENSE;
    the audio is not distributed there: README lists "YouTube URLs" and mel spectrograms on Dropbox, and "Users must
    agree to the License included before using these data."). Read 2026-11-10.

## madmom (beats, downbeats, tempo, chords, key, onsets)

- What: Python audio signal processing library with trained models, Department of Computational Perception, JKU Linz,
  and OFAI. Repository https://github.com/CPJKU/madmom (HEAD 2024-08-25, commit 27f032e); models in the git submodule
  https://github.com/CPJKU/madmom_models (HEAD 2022-01-06, commit 7e3dc1b). PyPI `madmom` 0.16.1 uploaded
  2018-11-14 (no later PyPI release). Docs http://madmom.readthedocs.org.
- How to call:
  - Programs installed with the package (repository `bin/` at HEAD): BarTracker, BeatDetector, BeatTracker,
    CNNChordRecognition, CNNOnsetDetector, CRFBeatDetector, ComplexFlux, DBNBeatTracker, DBNDownBeatTracker,
    DCChordRecognition, GMMPatternTracker, KeyRecognition, LogFiltSpecFlux, MMBeatTracker, OnsetDetector,
    OnsetDetectorLL, PianoTranscriptor, PickleProcessor, SpectralOnsetDetection, SuperFlux, SuperFluxNN,
    TCNBeatTracker, TCNTempoDetector, TempoDetector, evaluate. Typical shape: `DBNBeatTracker single in.wav -o out.txt`.
    The sub-commands come from `io_arguments()` in `madmom/processors.py` (HEAD): `add_parser('pickle', ...)` (line
    955), `'single'` (line 963), `'batch'` (line 979) and `'online'` (line 1000, only for programs that pass
    `online=True`, as `bin/DBNBeatTracker` does at line 68).
  - Python processors (source at commit 27f032e): `madmom.features.chords.DeepChromaChordRecognitionProcessor`,
    `CNNChordFeatureProcessor` + `CRFChordRecognitionProcessor`; `madmom.features.downbeats.RNNDownBeatProcessor` +
    `DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=100)`; `madmom.features.key.CNNKeyRecognitionProcessor`;
    `madmom.features.tempo.TempoEstimationProcessor`; beats in `madmom.features.beats`.
  - Install: "Python 2.7 or Python 3.5 or newer" with numpy, scipy, cython (README). Other READMEs read today state
    that PyPI 0.16.1 does not work on newer stacks: Beat This! README: "the current version on PyPI only supports
    Python<3.10 and numpy<1.20"; BeatNet README: "madmom 0.16.1 has compatibility issues with Python >= 3.10 and NumPy
    >= 1.24". All-In-One and Beat This! install it from GitHub instead.
- Outputs:
  - Chords: segments `(start, end, label)` in seconds, e.g. "array([(0. , 0.2, 'N'), (0.2, 1.6, 'F:maj'), (1.6,
    2.4..., 'A:maj'), (2.4..., 4.1, 'D:min')]" (docstring of `CRFChordRecognitionProcessor`). Vocabulary: "Ids 0-11
    encode major chords starting with root 'A', 12-23 minor chords. Id 24 represents 'N', the no-chord class." (25
    classes). Frame rate: `fps=10` default for both chord processors (0.1 s).
  - Key: one of 24 labels, `KEY_LABELS = ['A major', 'Bb major', ..., 'G# minor']` (`madmom/features/key.py`), from
    an ensemble of CNNs (Korzeniowski and Widmer, ISMIR 2018).
  - Downbeats: `DBNDownBeatTrackingProcessor` takes `beats_per_bar` ("int or list") and `min_bpm`, `max_bpm`, and
    returns beat times with their position in the bar (docstring at line 122 onward). Frame rate 100 fps for the RNN
    activations.
- Constraints a re-run can take: `beats_per_bar` (meter), `min_bpm` / `max_bpm` (tempo range), `fps`. No key or
  chord-vocabulary constraint in the chord processors.
- License facts (code and models differ):
  - a. Code: https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE, read 2026-11-10: "Unless indicated otherwise
    (either in the file directly or a LICENCE file inside any directory), all source code files are published under
    this license:" followed by a 2-clause BSD text ("Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:"). PyPI: license "BSD, CC BY-NC-SA",
    classifiers "License :: Free for non-commercial use" and "License :: OSI Approved :: BSD License".
  - b. Models: same LICENSE file: "All model and data files are distributed under the following license: Creative
    Commons Attribution-NonCommercial-ShareAlike 4.0" ... "NonCommercial: You must not use the material for commercial
    purposes." ... "If you want to include any of these files (or a variation or modification thereof) or technology
    which utilises them in a commercial product, please contact Gerhard Widmer [...]. Please note that pickled
    Processors (i.e. saved models) fall into this category." The models repository
    (https://raw.githubusercontent.com/CPJKU/madmom_models/master/README.rst, read 2026-11-10) adds: "Please note that
    pickled madmom Processors using any of the files included in this repository inherit the above license."
  - c. Training data of the shipped models: not stated in the code or license files read today (UNVERIFIED; the
    papers cited in the docstrings would settle it). Second-hand, for the key model only: the S-KEY paper describes
    madmom's key CNN as "trained on a varied corpus (electronic dance music, pop/rock, and classical music)"
    (https://arxiv.org/html/2501.12907v2, section III-C, read 2026-11-10).
- Output format on the box: the try agent's madmom run on S3 (ledger run r0063) wrote chord `.lab` lines such as
  `2.600<TAB>5.300<TAB>G:maj` (tab-separated) on a 0.1 s grid and the key "G major" (`/home/user/gtr/lanes/chords-beats-key/out/madmom/S3/`,
  read 2026-11-10), consistent with the docstrings above. trials.md did not exist yet when this was checked.

## Chordino, NNLS Chroma and the NNLS Tuning plugin (Vamp)

- What: three Vamp plugins in one library by Matthias Mauch (C4DM, Queen Mary University of London): NNLS Chroma
  (`vamp:nnls-chroma:nnls-chroma`), Chordino (`vamp:nnls-chroma:chordino`) and Tuning (`vamp:nnls-chroma:tuning`).
  GitHub mirror https://github.com/c4dm/nnls-chroma (HEAD 2020-04-22, commit 4c5f214); homepage
  https://code.soundsoftware.ac.uk/projects/nnls-chroma . Listed on https://www.vamp-plugins.org/download.html (read
  2026-11-10) as "Chordino and NNLS Chroma Matthias Mauch With source code Included in Vamp Plugin Pack". Paper: Mauch
  and Dixon, "Approximate Note Transcription for the Improved Identification of Difficult Chords", ISMIR 2010.
- How to call: inside any Vamp host: the `vamp` Python module (`vamp.collect(data, rate, "nnls-chroma:chordino")`,
  see the vamp host section), Sonic Annotator (CLI), Sonic Visualiser (desktop), or the wrappers chord-extractor and
  autochord below. Ubuntu 24.04's apt has `vamp-plugin-sdk` (2.10.0) but no package for these plugins, Sonic
  Annotator or the QM plugins (`apt-cache policy` on the box, 2026-11-10).
- Input: "a single channel of audio using frame-wise spectral input from the Vamp host" (README,
  https://raw.githubusercontent.com/c4dm/nnls-chroma/master/README).
- Outputs (README): Chordino: "Chord Estimate: estimated chord times and labels"; "Harmonic Change Value"; "Note
  Representation of Chord Estimate: a simple MIDI-like represenation of the estimated chord with bass note (if
  applicable) and chord notes". NNLS Chroma: log-frequency spectra, "Semitone Spectrum", "Bass Chromagram", chromagram
  and a 24-dim "Chromagram and Bass Chromagram". Tuning: "returns a single label (at time 0 seconds) containing an
  estimate of the concert pitch in Hz" and "Local Tuning ... at every analysis frame".
- Chord vocabulary: "Chord profiles given by the user in the file "chord.dict" are used"; without that file the
  built-in table in `chromamethods.cpp` is used: 18 profiles per root (`for (int iChord = 0; iChord < 18; ++iChord)`),
  named "", "m", "m7b5", "6", "7", "maj7", "m7", "m6", "dim", "aug" (some profiles of the same name differ in bass
  note), with a second set of names in Harte syntax (":min", ":hdim7", ":maj6", ":7", ...). Source read at commit
  4c5f214.
- Parameters a re-run can take (README): "HMM (Viterbi decoding) (on or off; default: on)", "spectral roll on",
  "tuning mode (global or local; default: global)", "spectral whitening", "spectral shape", "chroma normalisation",
  "boost likelihood of the N (no chord) label (0.0 -- 1.0; default: 0.1)", and the user chord dictionary file. The
  README states for tuning: "tuning, after which each centre bin (i.e. bin 2, 5, 8, ...) corresponds to a semitone,
  even if the tuning of the piece deviates from 440 Hz standard pitch."
- License facts:
  - a. Code: GPL-2.0-or-later. README: "This program is free software: you can redistribute it and/or modify it under
    the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the
    License, or (at your option) any later version." COPYING is the GPL v2 text. Read 2026-11-10 from
    https://raw.githubusercontent.com/c4dm/nnls-chroma/master/README and .../COPYING.
  - Binaries: GPL-2.0 section 3: "You may copy and distribute the Program (or a work based on it, under Section 2) in
    object code or executable form under the terms of Sections 1 and 2 above provided that you also do one of the
    following: a) Accompany it with the complete corresponding machine-readable source code, ..." (COPYING, same URL).
    The README also asks: "If you make use of this software for any public or commercial purpose, we ask you to
    kindly mention the authors and Queen Mary, University of London in your user-visible documentation. We're very
    happy to see this sort of use, but would much appreciate being credited, separately from the requirements of the
    software license itself (see below)."
  - b. Weights: none (template matching and an HMM with built-in parameters).
  - c. Training data: none stated.

## QM Vamp Plugins (key, tempo and beat, bar and beat, chromagram, tonal change)

- What: Vamp plugin set from C4DM, Queen Mary University of London. https://github.com/c4dm/qm-vamp-plugins (HEAD
  2021-06-02, commit c918afc). Plugins listed in the README: "Note onset detector", "Beat tracker and tempo
  estimator", "Key estimator and tonal change detector", "Polyphonic note transcription estimator", "Segmenter",
  "Chromagram, constant-Q spectrogram, and MFCC calculation plugins" and others. Source files at HEAD include
  `BarBeatTrack.cpp`, `BeatTrack.cpp`, `KeyDetect.cpp`, `TonalChangeDetect.cpp`, `ChromagramPlugin.cpp`. Docs:
  https://vamp-plugins.org/plugin-doc/qm-vamp-plugins.html (read 2026-11-10 by the verifier; the original survey did
  not read it).
- How to call: any Vamp host (vamp Python module, Sonic Annotator, Sonic Visualiser). README: "Ready-to-use binary
  builds of these plugins are provided for common platforms"; Linux source build "`./repoint install`" then
  "make -f build/linux/Makefile.linux64".
- Output fields (plugin-doc page above, read 2026-11-10):
  - Tempo and Beat Tracker, `vamp:qm-vamp-plugins:qm-tempotracker`: "Beats – The estimated beat locations, returned as
    a single feature, with timestamp but no value, for each beat, labelled with the corresponding estimated tempo at
    that beat."; "Tempo – The estimated tempo, returned as a feature each time the estimated tempo changes, with a
    single value for the tempo in beats per minute."
  - Bar and Beat Tracker, `vamp:qm-vamp-plugins:qm-barbeattracker`: parameter "Beats per Bar – The number of beats per
    bar (or measure). The plugin assumes that the number of beats per bar is fixed throughout the music."; outputs
    "Beats" ("labelled with the number of that beat within the bar"), "Bars", "Beat Count", "Beat Spectral
    Difference".
  - Key Detector, `vamp:qm-vamp-plugins:qm-keydetector`: parameter "Tuning Frequency – The frequency of concert A in
    the music under analysis."; outputs "Tonic Pitch", "Key Mode" ("where major is 0 and minor is 1"), "Key" ("with
    value counted from 1 to 24 where 1-12 are the major keys and 13-24 are the minor keys") and "Key Strength Plot";
    "The key profiles are drawn from analysis of Book I of the Well Tempered Klavier by J S Bach, recorded at A=440
    equal temperament."
  - Tonal Change, `vamp:qm-vamp-plugins:qm-tonalchange`: "detecting harmonic changes such as chord boundaries";
    outputs "Transform to 6D Tonal Content Space", "Tonal Change Detection Function" and "Tonal Change Positions – The
    resulting estimated positions of tonal changes." No chord labels are listed.
- License facts: a. README "Licence" (https://raw.githubusercontent.com/c4dm/qm-vamp-plugins/master/README.md, read
  2026-11-10): "These plugins are provided under the terms of the GNU General Public License. You may install and use
  the plugin binaries without fee for any purpose commercial or non-commercial. You may also modify and redistribute
  the plugins in source or binary form, provided you comply with the terms given by the GNU General Public License."
  and "Further copyrights apply to the qm-dsp library used in these plugins. See the README for that library for
  details." COPYING is the GPL v2 text. b. Weights: none. c. Training data: none stated.

## vamp (Python Vamp host, "vampy-host")

- What: "This module allows Python code to load and use native-code Vamp plugins" (README). Chris Cannam and George
  Fazekas, C4DM. https://github.com/c4dm/vampy-host (HEAD 2016-11-09, commit b43546b). PyPI `vamp` 1.1.0 uploaded
  2015-07-08.
- How to call: "No code for loading audio files is included"; it "expects to receive decoded audio data of one or
  more channels". Example from the README: "import vamp", "data, rate = librosa.load("example.wav")",
  "chroma = vamp.collect(data, rate, "nnls-chroma:nnls-chroma")" returns a dict such as {'matrix': (step, array)}.
  Plugins are found through the `VAMP_PATH` environment variable (chord-extractor README).
- License: COPYING.rst (https://raw.githubusercontent.com/c4dm/vampy-host/master/COPYING.rst, read 2026-11-10):
  "Python Vamp Host Copyright (c) 2008-2015 Queen Mary, University of London Permission is hereby granted, free of
  charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to
  deal in the Software without restriction, ..." (MIT-style). PyPI license "MIT".

## chord-extractor (Python wrapper around Chordino)

- What: "Python library for extracting chord sequences from sound files of multiple formats with the option of
  leveraging multiprocessing" that "wraps Chordino" (README, https://raw.githubusercontent.com/ohollo/chord-extractor/master/README.md).
  https://github.com/ohollo/chord-extractor (HEAD 2025-08-14, commit e227137). PyPI `chord-extractor` 0.1.3 uploaded
  2025-08-14; PyPI `requires_python` is "<3.12,>=3.8".
- How to call (README): "from chord_extractor.extractors import Chordino", "chordino = Chordino(roll_on=1)",
  "chords = chordino.extract(conversion_file_path)", bulk `chordino.extract_many(files, callback=..., num_extractors=2,
  num_preprocessors=2, ...)`. Prerequisites: libsndfile1; timidity for MIDI input; ffmpeg for mp3; numpy before
  install. "Included in the installation is a compiled library for Chordino. If you are using a Linux 64-bit OS,
  chord-extractor will default to using this binary."
- Input: audio files readable by librosa; MIDI converted with timidity (`preprocess`). Output: list of
  `ChordChange(chord='C', timestamp=0.743038548)` (chord label and start time in seconds); bulk mode returns
  `LabelledChordSequence(id=..., sequence=[...])`.
- Constraints: Chordino parameters. The README shows `roll_on`; `Chordino.__init__` in
  `chord_extractor/extractors/chordino.py` (HEAD) takes `use_nnls=True`, `roll_on=1`, `tuning_mode=TuningMode.GLOBAL`,
  `spectral_whitening=1`, `spectral_shape=0.7`, `boost_n_likelihood=0.1` and `**kwargs` passed to the plugin, and
  calls `vamp.collect(data, rate, 'nnls-chroma:chordino', parameters=self._params)` (line 104).
- License facts: a. Code: LICENSE is the GPL v2 text (https://raw.githubusercontent.com/ohollo/chord-extractor/master/LICENSE,
  read 2026-11-10), clause 2(b) as above; PyPI classifier "License :: OSI Approved :: GNU General Public License v2
  (GPLv2)". It ships the Chordino binary (GPL-2.0-or-later, see Chordino). b, c: no weights.

## autochord (Bi-LSTM-CRF on NNLS chroma)

- What: "a Python library for automatic chord recognition (using TensorFlow)" and "a Javascript app for visualization
  of chord transcriptions" (README, https://raw.githubusercontent.com/cjbayron/autochord/main/README.md). Christopher
  John Bayron. https://github.com/cjbayron/autochord (HEAD 2023-02-22, commit dd6033d). PyPI `autochord` 0.1.4 uploaded
  2021-10-07.
- How to call: "import autochord", "autochord.recognize('audio.wav', lab_fn='chords.lab')". "Under the hood
  `autochord.recognize()` runs the NNLS-Chroma VAMP plugin to extract chroma features from the audio, and feeds it to a
  Bi-LSTM-CRF model in TensorFlow". "Upon import `autochord` takes care of setting up the VAMP plugin and downloading
  the pre-trained chord recognition model." The package contains `src/autochord/res/nnls-chroma.so` and downloads the
  model from `_CHORD_MODEL_URL = 'https://drive.google.com/uc?id=1XBn7FyYjF8Ff6EuC7PjwwPzFBLRXGP7n'`
  (`src/autochord/__init__.py`, commit dd6033d). The chroma it feeds the model is the plugin's `bothchroma` output:
  `vamp.collect(samples, _SAMPLE_RATE, 'nnls-chroma:nnls-chroma', output='bothchroma', ...)` (same file, lines 97-98).
  Tested "for Python 3 setup in Ubuntu (18.04)"; "Windows is unsupported".
- Output: a code comment in the README reads "This gives out a list of tuples in the format: # (chord start, chord end,
  chord name)", e.g. "(0.0, 5.944308390022676, 'D:maj')"; optional `.lab` file: "The output file follows the MIREX
  chord label format." Vocabulary: "the model can recognize 25 chord classes: the 12 major triads, 12 minor triads,
  and no-chord ('N')."
- Author measurement: "The measured test accuracy of the TensorFlow model is 67.33%." (README; test set not named
  there).
- License facts (sources differ):
  - a. Code: the repository LICENSE is the Apache License 2.0 text
    (https://raw.githubusercontent.com/cjbayron/autochord/main/LICENSE, read 2026-11-10). PyPI 0.1.4 carries the
    classifier "License :: OSI Approved :: MIT License". Both quoted as found. The bundled `nnls-chroma.so` is the
    GPL-2.0-or-later NNLS Chroma plugin (see Chordino).
  - b. Weights: downloaded from Google Drive; no separate license statement for them was found in the README or code.
  - c. Training data: `model-development/dataloader.py` line 1: "Loader for Billboard data features and labels",
    `_BASE_DIR = 'data/McGill-Billboard'`. The McGill Billboard page moved: the old ddmal.music.mcgill.ca address
    returns 404, the page is now https://ddmal.ca/research/The_McGill_Billboard_Project_(Chord_Analysis_Dataset)/
    (read 2026-11-10): "In order to facilitate the best possible use of these data in the future, we have made them
    available legally under a CC0 license, but we ask that users follow scholarly norms in any public-facing work based
    on upon these data by citing the following ISMIR paper" and "To the extent possible under law, the DDMAL has waived
    all copyright and related or neighbouring rights to the McGill Billboard annotations. This work is published from
    Canada." The same page: "Although we cannot distribute the original audio due to copyright, we have two feature
    sets available. Users interested in chord recognition may want the non-negative-least-squares chroma vectors and
    tuning estimates from the Chordino VAMP plugin". So the CC0 waiver covers the annotations; the audio is not
    distributed.

## BTC, Bi-directional Transformer for Chord recognition

- What: source code for "A Bi-Directional Transformer for Musical Chord Recognition" (ISMIR 2019), copyright
  holder in LICENSE Jonggwon Park. https://github.com/jayg996/BTC-ISMIR19 (HEAD 2020-05-23, commit 2682317). No PyPI package.
- How to call (README, https://raw.githubusercontent.com/jayg996/BTC-ISMIR19/master/README.md): "$ python test.py
  --audio_dir audio_folder --save_dir save_folder --voca False". "voca : False means major and minor label type, and
  True means large vocabulary label type (default: False)". The code at HEAD sets
  `parser.add_argument('--voca', default=True, ...)` (test.py line 17), i.e. the code default differs from the README
  text; both quoted as found. Requirements listed: "pytorch >= 1.0.0", numpy, pandas, pyrubberband, librosa, pyyaml,
  mir_eval, pretty_midi. `test.py` uses CUDA when `torch.cuda.is_available()`, otherwise CPU.
- Models in the repository: `test/btc_model.pt` (12,154,754 bytes) and `test/btc_model_large_voca.pt` (12,229,576
  bytes) (git tree listing at HEAD).
- Vocabulary: `num_chords : 25` in `run_config.yaml`, and `config.model['num_chords'] = 170` when `--voca` is true
  (test.py lines 24-27). Time resolution: `song_hz: 22050`, `hop_length: 2048` (run_config.yaml), i.e. 2048 / 22050 =
  0.0929 s per frame (computed here from those two values).
- Output: "The resulting files are lab files ... and midi files"; lab lines are written as
  `'%.3f %.3f %s\n' % (start_time, time_unit * (n_timestep * t + i), idx_to_chord[prev_chord])` (test.py line 80;
  the survey's earlier shorthand was `(start_time, end_time, chord)`), and the MIDI file is written next to it with the
  `.midi` extension (`midi.write(save_path.replace('.lab', '.midi'))`, test.py line 129).
- License facts: a. Code: MIT, "Copyright (c) 2019 Jonggwon Park",
  https://raw.githubusercontent.com/jayg996/BTC-ISMIR19/master/LICENSE, read 2026-11-10. b. Weights: in the same
  repository; no separate weights license found. c. Training data (README "Data"): "We used Isophonics[1], Robbie
  Williams[2], UsPop2002[3] dataset which consists of chord label files. Due to copyright issue, these datasets do not
  include audio files. The audio files used in this work were collected from online music service providers."
  Dataset license clauses: the Isophonics reference-annotations page (https://isophonics.net/content/reference-annotations,
  read 2026-11-10) carries no license or copyright statement; Robbie Williams and UsPop2002 annotation licenses were
  not read (UNVERIFIED).

## CREMA (convolutional and recurrent estimators for music analysis)

- What: Brian McFee's chord model package. https://github.com/bmcfee/crema (HEAD 2022-04-19, commit 051c916). PyPI
  `crema` 0.2.0 uploaded 2022-04-21. Docs http://crema.readthedocs.io (not read today).
- How to call (README, https://raw.githubusercontent.com/bmcfee/crema/main/README.md): CLI "python -m crema.analyze
  file.mp3" (prints JAMS) or "python -m crema.analyze file.mp3 -o file.jams"; Python "from crema.analyze import
  analyze", "jam = analyze(filename='/path/to/file.mp3')" or "jam = analyze(y=y, sr=sr)".
- Output: a JAMS document (JSON) whose chord annotation uses `namespace='chord'` (`crema/models/chord.py` line 42 at
  HEAD). The vocabulary size was not determined (UNVERIFIED; the model resources sit behind the symlink
  `crema/models/chord`, not read).
- License facts (sources differ): a. LICENSE.md begins "BSD 2-Clause License" then "Copyright (c) 2017, Brian McFee"
  (https://raw.githubusercontent.com/bmcfee/crema/main/LICENSE.md, read 2026-11-10); the README badge says "license-BSD";
  PyPI 0.2.0 says license "ISC" with classifier "License :: OSI Approved :: ISC License (ISCL)". Both quoted as found.
  b. Weights ship inside the package; no separate weights license found. c. Training data: not read today (UNVERIFIED).

## lv-chordia and the ISMIR 2019 large-vocabulary chord model (Chord-CNN-LSTM)

- What: "official repo for the ISMIR 2019 paper Large-Vocabulary Chord Transcription via Chord Structure
  Decomposition" (Junyan Jiang, Ke Chen, Wei Li, Gus Xia). https://github.com/music-x-lab/ISMIR2019-Large-Vocabulary-Chord-Recognition
  (HEAD 2024-04-09, commit 481f4ce). PyPI `lv-chordia` 1.1.0 uploaded 2026-07-11 (first upload 2025-11-14), an
  "inference-only" repackaging: "This package ships the pre-trained ensemble models and the code path needed to run
  chord recognition on audio" and "All pre-trained model weights (100% original)" (PyPI description, read 2026-11-10).
  The PyPI project URLs point to the music-x-lab repository (no separate source repository for the package is
  listed); PyPI author field "Junyan Jiang, Ke Chen, Wei Li, Gus Xia", maintainer "Package Maintainers"; PyPI
  `requires_python` ">=3.8" while the description's badge says "Python 3.10+". ChordMini credits this model as
  "Chord-CNN-LSTM".
- How to call:
  - Original repository: "python3 chord_recognition.py path_to_audio_file path_to_output_file [chord_dict]".
  - lv-chordia CLI: "lv-chordia input_audio.mp3" ("outputs JSON to stdout"), "lv-chordia input_audio.mp3 --chord-dict
    ismir2017"; it also accepts http, https and ftp URLs and downloads them.
  - Python: "from lv_chordia.chord_recognition import chord_recognition", "results =
    chord_recognition(audio_path="input_audio.mp3", chord_dict_name="submission")".
- Output: lv-chordia: JSON list of {"start_time": seconds, "end_time": seconds, "chord": "C:maj"} ("Chord label in
  JAMS format"). Original repository: a `.lab` file.
- Vocabulary (original README): "chord_dict ... tells the HMM which chord dictionary to use for decoding": "submission:
  the default value (recommended to use). It is the chord dictionary we used for ISMIR 2019 submission.";
  "ismir2017: the chord dictionary for MIREX competition."; "full: the list of all chords from MARL dataset. It is not
  tested and not recommended to use." Dictionaries are editable in `data/*_chord_list.txt`. lv-chordia: "Ensemble model
  with 5 pre-trained networks". The number of chord classes in each dictionary was not counted today.
- Constraint a re-run can take: the chord dictionary (restricting decoding to a chosen chord list).
- License facts: a. Code: MIT, "Copyright (c) 2023 Music X Lab"
  (https://raw.githubusercontent.com/music-x-lab/ISMIR2019-Large-Vocabulary-Chord-Recognition/master/LICENSE, read
  2026-11-10); lv-chordia on PyPI: license text starting "MIT License Copyright (c) 2023 Music X Lab", classifier
  "License :: OSI Approved :: MIT License". b. Weights: "This repo contains the pretrained models that does not
  incorporate label reweighting"; the re-weighted models are on Google Drive; no separate weights license found.
  c. Training data: the training section expects "chord_data_1217/" with audio and `.lab` files; the paper's dataset
  description and its license were not read today (UNVERIFIED).

## ChordMini (ChordMiniApp)

- What: "Open-source music analysis tool for chord recognition, beat tracking, piano visualizer, guitar diagrams,
  lyrics synchronization, and experimental melody transcription" (README,
  https://raw.githubusercontent.com/ptnghia-j/ChordMiniApp/main/README.md). Nghia Phan et al.; paper "Enhancing
  Automatic Chord Recognition via Pseudo-Labeling and Knowledge Distillation", arXiv:2602.19778 (2026).
  https://github.com/ptnghia-j/ChordMiniApp (HEAD 2026-07-30, commit 33623b8).
- How it runs: a Next.js front end plus a Python backend on port 5001 ("cd python_backend && python app.py"). Backend
  models listed: "Beat Detection: Beat-Transformer and madmom models"; "Chord Recognition: Chord-CNN-LSTM, BTC-SL,
  BTC-PL models". Requirements listed: "Python 3.10.x", "Docker (recommended for the standalone Sheet Sage melody
  service)", "Firebase account (free tier)", "Gemini API (free tier)"; optional keys for YouTube, Music.AI, Genius.
  "spleeter" is "only required by the current Beat-Transformer source-separation path". Checkpoints for SongFormer
  come through Git LFS.
- Outputs: shown in the UI as a beat-synchronised chord grid, guitar diagrams from "@tombatossals/chords-db", MIDI
  export from the piano view. The backend's HTTP response fields were not read today (UNVERIFIED).
- Models: `.gitmodules` at HEAD pulls the models from three more repositories: `python_backend/models/ChordMini` from
  https://github.com/ptnghia-j/ChordMini (HEAD 2026-06-11, commit aa6e3a8), `python_backend/models/Chord-CNN-LSTM` from
  https://github.com/ptnghia-j/chord-cnn-lstm-model (HEAD 2025-05-27) and `python_backend/models/Beat-Transformer` from
  https://github.com/ptnghia-j/beat-transformer-model (HEAD 2025-05-27). The ChordMini model repository README
  ("Included Checkpoints") lists "`checkpoints/btc_model_best.pth`: BTC CL (full) checkpoint",
  "`checkpoints/2e1d_model_best.pth`: ChordNet (2E1D) CL (full) checkpoint" and
  "`checkpoints/btc_model_large_voca.pt`: original BTC teacher (https://github.com/jayg996/BTC-ISMIR19)". Which of these
  the app labels BTC-SL and BTC-PL is not stated in the lines read (UNVERIFIED).
- Paper: arXiv 2602.19778 v5 (last revised 2026-07-03), authors Nghia Phan, Rong Jin, Gang Liu, Xiao Dong; arXiv
  comment "Accepted to DAFx26" (read 2026-11-10).
- License facts: a. Code: MIT, "Copyright (c) 2025 ChordMini Project"
  (https://raw.githubusercontent.com/ptnghia-j/ChordMiniApp/main/LICENSE, read 2026-11-10). b. Weights: the model
  repository's LICENSE is MIT, "Copyright (c) 2026 ChordMini contributors"
  (https://raw.githubusercontent.com/ptnghia-j/ChordMini/main/LICENSE, read 2026-11-10); no separate weights license
  found. Third-party pieces carry their own licenses (madmom models CC BY-NC-SA 4.0, see madmom; Beat-Transformer, see
  below). c. Training data (paper section 4.1, https://arxiv.org/html/2602.19778v5, read 2026-11-10): "We use three
  large-scale unlabeled datasets for pseudo-label generation, totaling over 1,000 hours of audio": the Free Music
  Archive, MAESTRO and DALI; "Labeled Datasets. We aggregate annotations from the Isophonics [19], the McGill Billboard
  corpus [2], the RWC Pop dataset [8], and the USPop annotations distributed with [20], collecting a fixed subset of
  600 songs." The model repository README links FMA, DALI and MAESTRO. Their licenses, read 2026-11-10:
  - MAESTRO (https://magenta.tensorflow.org/datasets/maestro): "The dataset is made available by Google LLC under a
    Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0) license."
  - DALI (https://raw.githubusercontent.com/gabolsgabs/DALI/master/README.md): "This work is licensed under a Creative
    Commons Attribution-NonCommercial-ShareAlike 4.0 International License."
  - FMA (https://raw.githubusercontent.com/mdeff/fma/master/README.md): "The metadata is released under the [Creative
    Commons Attribution 4.0 International License (CC BY 4.0)][ccby40]." and "We do not hold the copyright on the audio
    and distribute it under the license chosen by the artist."
  - McGill Billboard annotations: CC0 (see autochord). RWC: UNVERIFIED (page unreachable). Isophonics: no license
    statement on its page (see BTC). USPop: not read.
  Services: Gemini, Firebase, YouTube APIs have their own terms (hosted-apis lane).

## Omnizart chord (Harmony Transformer based)

- What: "Omnizart is a Python library that aims for democratizing automatic music transcription" (README), "powered by the
  research outcomes from Music and Culture Technology (MCT) Lab". https://github.com/Music-and-Culture-Technology-Lab/omnizart (HEAD 2026-05-31, commit bcd8cb4).
  PyPI `omnizart` 0.6.3 uploaded 2026-05-31; pyproject at HEAD: `python = ">=3.8,<3.15"` and
  `tensorflow = { version = ">=2.5.0", markers = "python_version < '3.14'" }`.
  JOSS paper doi 10.21105/joss.03391.
- How to call (README): "pip install omnizart", "omnizart download-checkpoints", "omnizart chord transcribe
  <path/to/audio.wav>"; Docker "mctlab/omnizart:latest". Python: `omnizart.chord.app.ChordTranscription.transcribe(
  input_audio, model_path=None, output="./")` ("This function transcribes chord progression in the audio and will
  outputs MIDI and CSV files", `omnizart/chord/app.py` lines 31-35).
- Output: a MIDI file and a CSV with fieldnames `["chord", "start", "end"]` (`write_csv` in
  `omnizart/chord/inference.py`). Label set: `CHORD_INT_MAPPING` in `omnizart/constants/feature.py` (HEAD) maps
  'C:maj' ... 'B:maj' (sharps spelled C#, D#, F#, G#, A#) to 0-11, 'C:min' ... 'B:min' to 12-23, 'N' to 24 and 'X' to
  25; `inference.py` skips both "X" and "N" when it writes MIDI notes (line 50). Frame length from
  `omnizart/defaults/chord.yaml`: "Each frame last for 0.046 seconds".
- Omnizart's `beat` application is "beat tracking in MIDI domain" (docstring in `omnizart/beat/app.py`), not audio.
- License facts: a. Code: MIT, "Copyright (c) 2020 MCTLab"
  (https://raw.githubusercontent.com/Music-and-Culture-Technology-Lab/omnizart/main/LICENSE, read 2026-11-10); PyPI
  license "MIT". b. Weights: `omnizart/checkpoints/chord/chord_v1/` is in the repository tree; no separate weights
  license found. c. Training data: `omnizart/chord/app.py` imports `McGillBillBoard` and its feature extraction is
  documented as "Extract feature of McGill BillBoard dataset"; the Billboard annotations are CC0 and the audio is not
  distributed (quotes in the autochord section, page read 2026-11-10).

## Harmony Transformer and Harmony Transformer v2

- What: Tsung-Ping Chen and Li Su, "Harmony transformer: incorporating chord segmentation into harmony recognition",
  ISMIR 2019 (http://archives.ismir.net/ismir2019/paper/000030.pdf). https://github.com/Tsung-Ping/Harmony-Transformer
  (HEAD 2019-11-08, commit c324386). v2: https://github.com/Tsung-Ping/Harmony-Transformer-v2 (HEAD 2021-05-05, commit
  c94f3bb), "evaluated ... in terms of automatic chord recognition for symbolic music" (TISMIR 2021); its files train
  on the BPS-FH dataset with "24 maj-min chord representations" and Roman-numeral representations; requirements
  "tensorflow >= 1.8.0".
- How to call: training scripts only (v1: `Harmony_Transformer.py`, `Preprocessing_Billboard.py`; v2:
  `chord_symbol_recognition.py`, `functional_harmony_recognition.py`); no released inference CLI was found in the two
  READMEs.
- Data in the v1 repository (tree at HEAD, read 2026-11-10): `McGill-Billboard/McGill-Billboard-Features/<id>/bothchroma.csv`
  and `tuning.csv` (890 `bothchroma.csv` files), `McGill-Billboard/McGill-Billboard-MIREX/<id>/*.lab` and
  `McGill-Billboard/readme.txt` (which only names "The McGill Billboard Project" and its old URL). The Billboard
  annotations are CC0 (see autochord).
- License facts: no license file found at https://github.com/Tsung-Ping/Harmony-Transformer or
  https://github.com/Tsung-Ping/Harmony-Transformer-v2 (file list of HEAD, re-checked 2026-11-10: v1 holds
  Harmony_Transformer.py, Preprocessing_Billboard.py, README.md and the McGill-Billboard folder; v2 holds README.md
  and four .py files). No weights found.

## ACR_seq2seq (event-based seq2seq chord recognition, ICASSP 2026)

- What: L. Kim and J. Park, "An Event-Based Sequence Modeling Approach to Recognizing Non-Triad Chords with
  Oversegmentation Minimization", ICASSP 2026, pp. 15277-15281, doi 10.1109/ICASSP55912.2026.11464925 (README,
  https://raw.githubusercontent.com/KimLeekyung/ACR_seq2seq/main/README.md). https://github.com/KimLeekyung/ACR_seq2seq
  (HEAD 2026-05-31, commit 96f5d8c). arXiv version: https://arxiv.org/abs/2604.24386, submitted 2026-04-27, comment
  "accepted to ICASSP 2026" (read 2026-11-10).
- How to call, inputs, outputs: the README contains only the citation. The tree at HEAD holds `base/` (audio and
  signal processors, datamodules, metrics, transformer layers), `pre_train/` and `full_train/` (each with `run.py`,
  `model.py` and `hparams.yaml`) and no checkpoint files (re-checked 2026-11-10). Inference usage: not documented
  (UNVERIFIED; reading `run.py` would settle it).
- License facts: no license file found at https://github.com/KimLeekyung/ACR_seq2seq (top-level file list of HEAD,
  2026-11-10).

## ChordFormer, BMACE and other papers without code found

- ChordFormer (Muhammad Waseem Akram, Stefano Dettori, Valentina Colla, Giorgio Carlo Buttazzo), "ChordFormer: A
  Conformer-Based Architecture for Large-Vocabulary Audio Chord Recognition", arXiv 2502.11840, submitted 2025-02-17
  (arXiv page read 2026-11-10 by the verifier). NO-CODE-FOUND (search 2026-11-10; the abstract names no code link).
- BMACE: Chunyu Yuan and Johanna Devaney, "A Mamba-Based Model for Automatic Chord Recognition", arXiv 2601.02101,
  submitted 2026-01-05, arXiv comment "International Society of Music Information Retrieval, Late-Breaking Demo 2024";
  the abstract names the model "BMACE (Bidirectional Mamba-based network, for Automatic Chord Estimation)" (read
  2026-11-10). NO-CODE-FOUND.
- ChordCoT: Chih-Cheng Chang, Bo-Yu Chen, Lu-Rong Chen, Li Su, "Enhancing Automatic Chord Recognition through LLM
  Chain-of-Thought Reasoning", arXiv 2509.18700, submitted 2025-09-23 (read 2026-11-10). Abstract: it converts the
  outputs of "music source separation, key detection, chord recognition, and beat tracking" into text and uses "a
  5-stage chain-of-thought framework that allows GPT-4o to systematically analyze, compare, and refine chord
  recognition results"; it reports "overall accuracy gains of 1-2.77% on the MIREX metric" (authors' abstract, three
  datasets, table not read). Repository
  https://github.com/WildHoneyPie/ChordCoT (HEAD 2025-09-21; files README.md and prompts.py; no license file); its
  README says "Note: The code is currently being organized and cleaned up. Updates will be pushed soon." (read
  2026-11-10). Added by the verifier.
- pyace (Junqi Deng), https://github.com/tangkk/pyace (HEAD 2021-06-01, commit 4321145); LICENSE begins "Copyright 2017
  Junqi Deng Redistribution and use in source and binary forms, with or without modification, are permitted provided
  that the following conditions are met:" (https://raw.githubusercontent.com/tangkk/pyace/master/LICENSE, read
  2026-11-10). Not examined further.

## librosa (beat tracking, tempo, PLP, tuning estimation)

- What: Python audio analysis library. https://github.com/librosa/librosa (HEAD 2026-11-10, commit 6c9fe7c); PyPI
  `librosa` 1.0.0 uploaded 2026-08-11, "requires_python >=3.12" (PyPI JSON). `librosa/version.py` at HEAD: version
  "1.0.0".
- How to call (source at commit 6c9fe7c): `librosa.beat.beat_track(..., start_bpm=120.0, tightness=100, trim=True,
  bpm=None, prior=None, units="frames")`; `librosa.beat.plp(...)`; `librosa.feature.tempo(...)` (defined in
  `librosa/feature/rhythm.py` with `tempogram`, `fourier_tempogram`, `tempogram_ratio`, `hybrid_tempogram`,
  `metrogram`); `librosa.estimate_tuning(y=y, sr=sr, resolution=..., bins_per_octave=12)` and
  `librosa.pitch_tuning(frequencies, resolution=0.01, bins_per_octave=12)` in `librosa/core/pitch.py`.
- In 1.0.0 these functions take keyword-only arguments (`def beat_track(*, y=..., sr=22050, onset_envelope=...,
  hop_length=512, start_bpm=120.0, tightness=100, trim=True, bpm=None, prior=None, units="frames", sparse=True)`,
  `librosa/beat.py` line 37 onward; `def estimate_tuning(*, y=None, sr=22050, S=None, n_fft=2048, resolution=0.01,
  bins_per_octave=12, **kwargs)`, `librosa/core/pitch.py` line 27).
- Outputs (docstrings): `beat_track` returns "tempo : float [scalar, non-negative] or np.ndarray The estimated global
  tempo (in beats per minute)" ("By default, the tempo is returned as an ndarray even for mono input") and "beats :
  np.ndarray The estimated beat event locations" ("in the specified units (default is frame indices)"; `units` can be
  "frames", "samples" or "time"). `estimate_tuning` returns "tuning: float in `[-0.5, 0.5)` estimated tuning deviation
  (fractions of a bin)" (with 12 bins per octave, a bin is one semitone). No downbeat, chord or key estimator exists in
  the files read.
- Constraints a re-run can take: `bpm` ("If provided, ``start_bpm`` will be ignored"), `start_bpm`, `prior` (a
  scipy distribution over tempo), `tightness`.
- License: ISC, "Copyright (c) 2013--2026, librosa development team." "Permission to use, copy, modify, and/or
  distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright
  notice and this permission notice appear in all copies." (https://raw.githubusercontent.com/librosa/librosa/main/LICENSE.md,
  read 2026-11-10). No trained weights.

## Essentia (KeyExtractor, TuningFrequency, RhythmExtractor2013, ChordsDetection, TempoCNN) and essentia.js

- What: C++ audio analysis library with Python bindings, Music Technology Group (MTG), Universitat Pompeu Fabra.
  https://github.com/MTG/essentia (HEAD 2026-11-05, commit 23ae7ba). PyPI `essentia` and `essentia-tensorflow`
  2.1b6.dev1438 uploaded 2026-05-19 (license expression "AGPL-3.0-only"). essentia.js (WebAssembly build):
  https://github.com/MTG/essentia.js (HEAD 2022-07-19, commit 819c00e), LICENSE file is the AGPL v3 text.
- How to call: Python `from essentia.standard import MonoLoader, KeyExtractor, RhythmExtractor2013, TempoCNN, ...`
  (TempoCNN example on https://essentia.upf.edu/models.html: "audio = MonoLoader(filename="audio.wav",
  sampleRate=11025, resampleQuality=4)()", "model = TempoCNN(graphFilename="deeptemp-k4-3.pb")", "global_tempo,
  local_tempo, local_tempo_probabilities = model(audio)"). essentia.js runs the same algorithms in the browser or
  Node (not read further today).
- Algorithms, inputs and outputs (reference pages https://essentia.upf.edu/reference/std_<Name>.html, read 2026-11-10):
  - KeyExtractor: input "audio ( vector_real )"; outputs "key ( string )", "scale ( string )", "strength ( real )";
    parameters include "profileType ( string ∈ {diatonic, krumhansl, temperley, weichai, tonictriad, temperley2005,
    thpcp, shaath, gomez, noland, faraldo, pentatonic, edmm, edma, bgate, braw}, default = bgate )", "sampleRate ...
    default = 44100", "tuningFrequency ( real ∈ (0, ∞), default = 440 ) : the tuning frequency of the input signal";
    "Tuning frequency can be estimated in advance using TuningFrequency algorithm."
  - TuningFrequency: inputs spectral peak "frequencies" and "magnitudes"; outputs "tuningFrequency ( real ) - the
    tuning frequency [Hz]" and "tuningCents ( real ) - the deviation from 440 Hz (between -35 to 65 cents)".
  - RhythmExtractor2013: input "signal"; outputs "bpm ( real )", "ticks ( vector_real ) - the estimated tick
    locations [s]", "confidence ( real )", "estimates", "bpmIntervals"; parameters "maxTempo ( integer ∈ [60, 250],
    default = 208 )", "method ( string ∈ {multifeature, degara}, default = multifeature )", "minTempo ( integer ∈ [40,
    180], default = 40 )"; "Note that the algorithm requires the sample rate of the input signal to be 44100 Hz in order
    to work correctly." No downbeat output.
  - ChordsDetection: input "pcp ( vector_vector_real )" (HPCP frames); outputs "chords ( vector_string )" and
    "strength ( vector_real )"; "It finds the best matching major or minor triad and outputs the result as a string
    (e.g. A#, Bm, G#m, C)" (24 labels); "Quality: experimental (prone to errors, algorithm needs improvement)";
    parameters "hopSize ... default = 2048", "windowSize ( real ∈ (0, ∞), default = 2 ) : the size of the window on
    which to estimate the chords [s]".
  - TempoCNN: input "the input audio signal sampled at 11025 Hz"; outputs "globalTempo ( real )", "localTempo (
    vector_real )", "localTempoProbabilities ( vector_real )"; "localTempo is a vector containing the most likely BPM
    estimated each ~6 seconds by default."
- License facts (code and models differ):
  - a. Code: COPYING.txt is the AGPL v3 text (https://raw.githubusercontent.com/MTG/essentia/master/COPYING.txt);
    section 13 as quoted above. Licensing page (https://essentia.upf.edu/licensing_information.html, read
    2026-11-10): "Essentia is available under an open licence, Affero GPLv3 , for non-commercial applications, thus it
    is possible to test the library before deciding to licence it under a comercial licence. Contact Music Technology
    Group (UPF) for more information about licensing conditions". Same page: "Some Essentia library algorithms use
    third-party libraries with licenses such as GPL , LGPL , and others for which UPF is not able to provide full
    sublicensing rights to third parties." and it lists "NNLS Chroma - http://www.isophonics.net/nnls-chroma – used by
    LogSpectrum and NNLSChroma algorithms."
  - b. Models (TempoCNN and other TensorFlow models): licensing page: "All the models are available under the CC
    BY-NC-SA 4.0 license for non-commercial use, and are also available under a proprietary license upon request."
    Models page (https://essentia.upf.edu/models.html, read 2026-11-10): "All the models created by the MTG are licensed
    under CC BY-NC-SA 4.0 and are also available under proprietary license upon request."
  - c. Training data for TempoCNN (models page): "trained on the Extended Ballroom, LMDTempo, and MTGTempo datasets".
    Dataset licenses not read today (UNVERIFIED). KeyExtractor, TuningFrequency, RhythmExtractor2013 and
    ChordsDetection use no trained weights (profiles and signal processing).
  - essentia.js: LICENSE is the AGPL v3 text (https://raw.githubusercontent.com/MTG/essentia.js/master/LICENSE, read
    2026-11-10).

## aubio (onsets, beats, tempo)

- What: "aubio is a library to label music and sounds" (README). https://github.com/aubio/aubio (HEAD 2026-04-10,
  commit ad5cf97); PyPI `aubio` 0.4.9 uploaded 2019-02-08; Ubuntu 24.04 package `aubio-tools` 0.4.9-4.4build1 is
  installed on the box.
- How to call: C command-line tools on the box: `aubiotrack`, `aubioonset`, `aubiopitch`, `aubionotes`, `aubiocut`,
  `aubiomfcc`, `aubioquiet`. `aubiotrack --help` (run on the box 2026-11-10): "usage: aubiotrack [ options ]" with
  "-i --input input file", "-o --output output file", "-r --samplerate", "-B --bufsize", "-H --hopsize", "-O --onset
  select onset detection algorithm <default|energy|hfc|complex|phase|specdiff|kl|mkl|specflux>", "-T --time-format
  select time values output format (samples, ms, seconds) default=seconds". README: "`aubiotrack` outputs the time
  stamp of detected beats". The Python entry point `/usr/bin/aubio` (aubio 0.4.9) failed on the box with
  "ModuleNotFoundError: No module named 'aubio._aubio'" when run with `--help` under the default Python 3.13 (seen
  while reading the help, 2026-11-10; trials.md covers runs).
- Output: beat times (seconds by default), one per line. No downbeat, chord or key output.
- License: GPL-3.0-or-later. COPYING is the GPL v3 text (https://raw.githubusercontent.com/aubio/aubio/master/COPYING,
  read 2026-11-10); PyPI license "GNU/GPL version 3", classifier "GNU General Public License v3 or later (GPLv3+)". No
  trained weights.

## tempo-cnn (tempo and meter CNNs)

- What: Tempo-CNN, "a tempo estimator" (README). https://github.com/hendriks73/tempo-cnn (HEAD 2024-10-17, commit 482c64a). PyPI
  `tempocnn` 0.0.8 uploaded 2024-10-17, "requires_python <3.12,>=3.9".
- How to call (README, https://raw.githubusercontent.com/hendriks73/tempo-cnn/main/README.rst): "tempo -i
  my_audio.wav"; "tempo -m ismir2018 --jams -i my_audio.wav"; "--mirex" for MIREX-style output; "tempo -m deeptemp
  --jams -i my_audio.wav"; "tempo -m mazurka -i my_audio.wav"; "--interpolate"; "tempogram -p my_audio.wav" (writes a
  `.png`); "meter -m fma2018-meter -i my_audio.wav"; Python `classifier.estimate_tempo(features, interpolate=False)`.
  "In a clean Python 3.9 environment, simply run: pip install tempocnn". "Note that some models may be downloaded (and
  cached) at execution time."
- Output: global tempo in BPM (plain, JAMS or MIREX format), tempogram image, meter estimate.
- License facts: a and b: README "License": "Source code and models can be licensed under the GNU AFFERO GENERAL PUBLIC
  LICENSE v3. For details, please see the LICENSE file." LICENSE is the AGPL v3 text
  (https://raw.githubusercontent.com/hendriks73/tempo-cnn/main/LICENSE, read 2026-11-10). PyPI license "AGPL".
  c. Training data: not read today (UNVERIFIED).

## DeepRhythm (tempo CNN)

- What: "DeepRhythm is a convolutional neural network designed for rapid, precise tempo prediction for modern music"
  (README, https://raw.githubusercontent.com/bleugreen/deeprhythm/main/README.md, read 2026-11-10). PyPI `deeprhythm`
  0.0.13 uploaded 2024-12-07.
- How to call: "pip install deeprhythm"; Python "from deeprhythm import DeepRhythmPredictor", "model =
  DeepRhythmPredictor()", "tempo = model.predict('path/to/song.mp3')", "tempo, confidence =
  model.predict('path/to/song.mp3', include_confidence=True)"; batch "python -m deeprhythm.batch_infer /path/to/dir"
  ("will create in a jsonl file mapping filepath to predicted BPM"); flags "-d, --device [cuda/cpu/mps]", "-c, --conf".
- Output: one tempo in BPM per file, optional confidence. It splits audio into "8 second clips" and the CNN outputs
  "num_classes (256)" tempo classes.
- Author measurement (README "Benchmarks"): "DeepRhythm (cpu) | 95.91 | 96.54 | 0.12 | 115.02" (Acc1 %, Acc2 %,
  average s, total s); "Test done on 953 songs, mostly Electronic, Hip Hop, Pop, and Rock"; "Acc1 = Prediction within
  +/- 2% of actual bpm". The same table lists TempoCNN, Essentia and Librosa rows measured by the author.
- License: LICENSE is the AGPL v3 text (https://raw.githubusercontent.com/bleugreen/deeprhythm/main/LICENSE, read
  2026-11-10); PyPI classifier "GNU Affero General Public License v3". Weights license and training data: not stated
  in the README lines read (UNVERIFIED).

## Beat Transformer (demixed beat and downbeat tracking)

- What: "Beat Transformer: Demixed Beat and Downbeat Tracking with Dilated Self-Attention" (README: "Proceedings of the 23rd International
  Society for Music Information Retrieval Conference (ISMIR 2022)", https://arxiv.org/abs/2209.07140; README contact
  Jingwei Zhao). https://github.com/zhaojw1998/Beat-Transformer (HEAD 2024-04-07, commit
  063667f).
- How to call (README): "To quickly reproduce the accuracy reported in our paper, simply run
  `./code/eight_fold_test.py`"; testing on new music is offered through a Google Colab notebook; `./preprocessing/demixing.py`
  calls Spleeter to demix each piece first. Checkpoints in `checkpoint/`. ChordMini uses it as its beat model.
- Output: beat and downbeat times (from the paper title; exact output format not read today, UNVERIFIED).
- License facts: a. Code: MIT, "Copyright (c) 2022 Zhao Jingwei"
  (https://raw.githubusercontent.com/zhaojw1998/Beat-Transformer/main/LICENSE, read 2026-11-10). b. Checkpoints in the
  same repository; no separate license found. c. Training data (README): "We use a total of 7 datasets for model
  training and testing": Ballroom, Hainsworth, GTZAN, SMC, Carnatic, Harmonix ("I used the Griffin-Lim algorithm in
  Librosa to convert mel-spectrogram to audio"), RWC POP ("seems NOT royalty-free so I'm afraid I cannot share the
  audio"). Spleeter's own license: see the source-separation lane.

## BEAST (online beat and downbeat tracking, streaming Transformer)

- What: "BEAST: Online Joint Beat and Downbeat Tracking Based on Streaming Transformer", "accepted by ICASSP 2024"
  (README; https://arxiv.org/abs/2312.17156; copyright holder in LICENSE Chih-Cheng Chang). https://github.com/WildHoneyPie/BEAST (HEAD 2024-09-11, commit f680f17).
- How to call (README): download "the preprocessed GTZAN data" and "the pretrained model" from Google Drive, then "Run
  `./code/eval.py`". "More information to be updated." No inference CLI for new audio is documented.
- License facts: a. Code: MIT, "Copyright (c) 2023 Chih-Cheng Chang"
  (https://raw.githubusercontent.com/WildHoneyPie/BEAST/main/LICENSE, read 2026-11-10). b. Pretrained model on Google
  Drive; no separate license found. c. Training data: not read today (UNVERIFIED).

## realtime-bpm-analyzer (tempo in the browser and Node)

- What: "A powerful TypeScript library for detecting beats-per-minute (BPM) in real-time" (readme,
  https://raw.githubusercontent.com/dlepaux/realtime-bpm-analyzer/main/readme.md). https://github.com/dlepaux/realtime-bpm-analyzer
  (HEAD 2026-11-10, commit a68a82b). npm `realtime-bpm-analyzer` latest 5.6.1, published 2026-11-03, license
  "Apache-2.0" (https://registry.npmjs.org/realtime-bpm-analyzer, read 2026-11-10).
- How to call: "npm install realtime-bpm-analyzer"; "import { createRealtimeBpmAnalyzer } from
  'realtime-bpm-analyzer';", "const analyzer = await createRealtimeBpmAnalyzer(audioContext);",
  "analyzer.on('bpm', (data) => { ... data.bpm[0].tempo"; an AudioWorklet that "loads from a `blob:` URL by
  default" (option `processorUrl` for strict CSP); offline `analyzeFullBuffer`; Node: "import {analyzeChannelData} from
  'realtime-bpm-analyzer/node';", "const tempos = await analyzeChannelData(channelData, 44100);".
- Output: tempo candidates (`tempo` values); no beat times, downbeats, chords or key are listed in the readme lines
  read.
- License: license.md is the Apache License 2.0 text
  (https://raw.githubusercontent.com/dlepaux/realtime-bpm-analyzer/main/license.md, read 2026-11-10). No weights.

## libKeyFinder and keyfinder-cli (key estimation)

- What: "libkeyfinder is a small C++11 library for estimating the musical key of digital audio. It is published under
  the GNU General Public License version 3 or later." (README, https://raw.githubusercontent.com/mixxxdj/libkeyfinder/main/README.md).
  Written by Ibrahim Sha'ath in 2011; "In 2020, Ibrahim handed over maintenance of libkeyfinder to the Mixxx DJ software
  team". https://github.com/mixxxdj/libkeyfinder (HEAD 2024-07-09, commit 941e517). keyfinder-cli:
  https://github.com/EvanPurkhiser/keyfinder-cli (HEAD 2026-11-10, commit 788e010). Neither is packaged in Ubuntu
  24.04 apt (`apt-cache policy`, 2026-11-10); both build with CMake (libkeyfinder needs FFTW3; keyfinder-cli needs
  ffmpeg and libkeyfinder).
- How to call (keyfinder-cli README): "$ keyfinder-cli AMajor.mp3" prints "A"; "In the case that there is no key
  (silence) nothing will be printed to stdout and the program will exit with a 0 status code."; notation flags "-n
  standard", "-n openkey", "-n camelot". PyPI `keyfinder` 1.1.0 (2019-04-14) is a Python binding from the same author
  (home page https://github.com/evanpurkhiser/keyfinder-py; not read further).
- Output: one global key string per file (24 major/minor keys in standard notation, e.g. "Eb" for E flat major per the
  README's notation description).
- License: libkeyfinder LICENSE and keyfinder-cli LICENSE are both the GPL v3 text (read 2026-11-10 at
  https://raw.githubusercontent.com/mixxxdj/libkeyfinder/main/LICENSE and
  https://raw.githubusercontent.com/EvanPurkhiser/keyfinder-cli/main/LICENSE); GPL-3.0 section 5(c) as above. No
  trained weights (key profiles).

## S-KEY (self-supervised key estimation, Deezer)

- What: "`skey` is a Python package for state-of-the-art automatic musical key detection from audio recordings, based
  on the S-KEY model proposed by Yuexuan Kong et al." (README, https://raw.githubusercontent.com/deezer/skey/main/README.md);
  paper "S-KEY: Self-supervised Learning of Major and Minor Keys from Audio", ICASSP 2025, https://arxiv.org/abs/2501.12907.
  https://github.com/deezer/skey (HEAD 2026-10-27, commit 80d9590). The PyPI name `skey` (0.2) belongs to an unrelated
  project (home page http://github.com/dleonik/skey); this package installs from the repository with "poetry install".
- How to call: CLI "poetry skey path/to/audio --device cpu" ("The prediction will be printed if the path is an audio
  file, will be saved into a .csv file if the path is a directory"); options "--checkpoint", "--ext", "--device
  (default: cpu, e.g., cuda, mps)". Python "from skey import detect_key", "detect_key(audio_dir="path/to/audio",
  extension="mp3", device="cpu")". "CPU and GPU support". Weights `skey/models/skey.pt` (765,465 bytes) are in the
  repository.
- Output: a predicted major or minor key per file (printed or CSV); exact CSV columns not read today (UNVERIFIED).
- License facts (code and weights differ): README "License": "The code of SKEY is MIT-licensed. The MIT license does
  not apply to the model weights in skey.pt. You may use the model weights only for non-commercial research purposes."
  LICENSE: MIT, "Copyright (c) 2019-present, Deezer SA." (https://raw.githubusercontent.com/deezer/skey/main/LICENSE).
  Read 2026-11-10. c. Training data: not read today (UNVERIFIED; the arXiv paper would settle it).
- A community ONNX conversion exists at https://huggingface.co/aaatmy/skey-onnx (named in a search result; not read).

## music21 key analysis on symbolic notes

- What: Python toolkit for symbolic music (Michael Scott Asato Cuthbert). https://github.com/cuthbertLab/music21 (HEAD
  2026-11-08, commit 8bfcfc4); PyPI `music21` 10.5.2 uploaded 2026-10-28, "requires_python >=3.11", license
  expression "BSD-3-Clause".
- How to call (source `music21/analysis/discrete.py` at HEAD): `s.analyze('key')` or
  `analysis.discrete.analyzeStream(s, 'key')` on a Stream parsed from MIDI or MusicXML. Key-weight classes:
  `KrumhanslSchmuckler` (identifiers 'key.krumhansl', ...), `AardenEssen` (its identifiers include 'key' and
  'keyscape', i.e. the plain 'key' method maps to Aarden-Essen in this version), `SimpleWeights`, `BellmanBudge`,
  `TemperleyKostkaPayne`. Results carry `correlationCoefficient` and `alternateInterpretations`.
- Input: symbolic notes (any Stream), e.g. MIDI from an audio-to-notes tool. Output: a `key.Key` object (tonic, mode)
  with a correlation coefficient and ranked alternatives.
- License: BSD-3-Clause, "Copyright (c) 2006-2026 Michael Scott Asato Cuthbert" "Redistribution and use in source and
  binary forms, with or without modification, are permitted provided that the following conditions are met:"
  (https://raw.githubusercontent.com/cuthbertLab/music21/master/LICENSE, read 2026-11-10).

## Guitar open-string tuning and capo position from audio: what exists

- Hulme et al. (DLfM 2024, per search results; author list and venue not read from the paper), code
  https://github.com/edhulme/guitar-tuning-classification (HEAD 2024-04-25, commit
  4a608b7). README (read 2026-11-10): audio "generated by sending guitar tablature data to a sample-based guitar
  plugin"; "the 5-class chromagram system"; evaluation scripts `eval_synthetic_songs.py` and `eval_authentic_songs.py`;
  "pip install tensorflow matplotlib scikit-learn seaborn"; test sets, models and the training set are on Google Drive.
  The tuning class names are not listed in the README. No license file found at
  https://github.com/edhulme/guitar-tuning-classification (top-level files of HEAD: README.md and code only,
  2026-11-10). The paper PDF on orca.cardiff.ac.uk returned HTTP 403 to the fetch tool and the talk slides on iaml.info
  returned 404, so the reported accuracies (97.5 % for 2 classes and 73.9 % for 5 classes, per a web search summary)
  are UNVERIFIED.
- University of Rochester ECE 477 student report, 2023, "Guitar Tuning Detection" (McCormack Chew), PDF
  https://hajim.rochester.edu/ece/sites/zduan/teaching/ece477/projects/2023/DeclanParker_McCormackChew_FinalReport.pdf
  (text extracted with pdftotext, 2026-11-10): "This paper presents a method for classifying seven different guitar
  tunings based solely on audio input." "feature embeddings are extracted using an L3 model. The method then utilizes
  support vector machines"; "Our complete dataset includes 260 ten second" clips (96 of them from YouTube); one model
  over "Drop D, Drop C, E Standard, and FMaj9" "achieved 83.6% accuracy on the test set"; "the overall accuracy of the
  combined models is 74.2%". No code URL found in the text.
- University of Rochester ECE 477 project, 2019 (Lukas Dillingham, Varun Khatri), "Guitar Tuning Identification",
  listed in search results as working from MIDI transcriptions; not read today.
- Capo position from audio: no paper, dataset or code that estimates capo position from audio alone was found in two
  web searches on 2026-11-10. Related facts found: the NNLS Tuning plugin, Essentia TuningFrequency and librosa
  estimate_tuning measure the concert-pitch offset (cents or fractions of a semitone), not open-string tuning or capo;
  the PRIOR.md brief records that the earlier post's "Tabber" tool reported "capo 7 at 0.34 confidence (a coin-flip
  with capo 3 at 0.33)" (PRIOR.md lines 81 and 120). Capo detection from video is in the video-hands-fretboard lane.

## Hosted services in this category (short; full terms in the hosted-apis and apps-survey lanes)

- Music.AI (Moises), Klangio, Replicate-hosted All-In-One and chord models: covered in
  `lanes/hosted-apis/survey.md` (items 1, 2, 7 of its tool list). Not repeated here.
- Spotify Web API audio features / audio analysis (key, mode, tempo, time signature, beats, bars): web search results
  on 2026-11-10 (Spotify community forum threads and Digital Music News) report that from 2024-11-27 new apps cannot
  call these endpoints and apps with a quota extension approved before that date keep access. Spotify's own
  announcement was not read today (UNVERIFIED).
- GetSongBPM API (https://getsongbpm.com/api): tempo and key looked up by song title, not computed from uploaded audio;
  a search result summary quotes its docs as requiring a link back ("a link back to GetSongBPM.com is REQUIRED"). The
  page itself was not read today (UNVERIFIED).
- Cyanite, Tunebat, Chordify, Chord ai, Capo (Mac/iOS app with "automatic music analysis"): named in search results
  only; not read today. The apps-survey lane covers the consumer apps.

## Handoff facts

Each line: what one tool outputs, what the next accepts, and the source for each half (all read 2026-11-10). Lines
marked "documented chain" are pairs one of the two tools' own documentation describes.

1. Demucs `htdemucs` stems are what All-In-One analyses: All-In-One's `src/allin1/demix.py` runs
   "sys.executable, '-m', 'demucs.separate'" with "'--name', 'htdemucs'" before its model (documented chain; source in
   the clone of https://github.com/mir-aidj/all-in-one at commit 18e7890).
2. Spleeter stems are what Beat Transformer analyses: "./preprocessing/demixing.py, where we call Spleeter to demix each
   piece" (https://raw.githubusercontent.com/zhaojw1998/Beat-Transformer/main/README.md) (documented chain).
3. NNLS Chroma outputs a 24-dim bass+treble chromagram ("Chromagram and Bass Chromagram",
   https://raw.githubusercontent.com/c4dm/nnls-chroma/master/README), which autochord feeds to its Bi-LSTM-CRF ("runs
   the NNLS-Chroma VAMP plugin to extract chroma features from the audio, and feeds it to a Bi-LSTM-CRF model",
   https://raw.githubusercontent.com/cjbayron/autochord/main/README.md) (documented chain).
4. The `vamp` Python host takes decoded audio as a NumPy array from `librosa.load` and returns plugin features such as
   Chordino's chord estimate ("data, rate = librosa.load("example.wav")", "vamp.collect(data, rate,
   "nnls-chroma:nnls-chroma")", https://raw.githubusercontent.com/c4dm/vampy-host/master/README.rst).
5. Beat This! outputs beat times and downbeat times in seconds, and a `.beats` TSV ("a time in seconds, a tab, and a
   beat number (1 = downbeat)", https://raw.githubusercontent.com/CPJKU/beat_this/main/beat_this/utils.py), which
   Sonic Visualiser imports ("e.g., for importing into Sonic Visualizer",
   https://raw.githubusercontent.com/CPJKU/beat_this/main/README.md).
6. Beat This! frame activations can be decoded by madmom's DBN instead of its own peak picking ("If you want to use
   the DBN for postprocessing, add `--dbn`. The DBN parameters are the default ones from madmom.", Beat This! README).
   BeatNet's offline mode does the same with its own CRNN ("we added madmom's DBN beat/downbeat inference model for the
   offline usages", https://raw.githubusercontent.com/mjhydri/BeatNet/main/README.md).
7. All-In-One outputs `beats` and `downbeats` (seconds) and `beat_positions` (1, 2, 3, 4, ...) in JSON, which its own
   `allin1.sonify(result)` turns into audio that "will mix metronome clicks for beats and downbeats"
   (https://raw.githubusercontent.com/mir-aidj/all-in-one/main/README.md): a click track aligned to the analysed song.
8. User constraint "meter" and "tempo range" into madmom: `DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4],
   min_bpm=..., max_bpm=...)` (`madmom/features/downbeats.py` at commit 27f032e).
9. User constraint "tempo" into librosa: `beat_track(..., bpm=...)` ("If provided, ``start_bpm`` will be ignored",
   `librosa/beat.py` at commit 6c9fe7c); into Essentia: `RhythmExtractor2013(minTempo=..., maxTempo=...)`
   (https://essentia.upf.edu/reference/std_RhythmExtractor2013.html).
10. Essentia `TuningFrequency` outputs "tuningFrequency ( real ) - the tuning frequency [Hz]", which Essentia
    `KeyExtractor` accepts as its "tuningFrequency" parameter ("Tuning frequency can be estimated in advance using
    TuningFrequency algorithm", https://essentia.upf.edu/reference/std_KeyExtractor.html) (documented chain).
11. Essentia HPCP frames are the input of Essentia `ChordsDetection` ("pcp ( vector_vector_real ) - the pitch class
    profile from which to detect the chord"; "The algorithm assumes that the sequence of the input HPCP frames has been
    computed with framesize = 2*hopsize", https://essentia.upf.edu/reference/std_ChordsDetection.html).
12. User constraint "allowed chords" into lv-chordia / the ISMIR 2019 model: the `chord_dict` argument ("submission",
    "ismir2017", "full") or edited `data/*_chord_list.txt` files tell "the HMM which chord dictionary to use for
    decoding" (https://raw.githubusercontent.com/music-x-lab/ISMIR2019-Large-Vocabulary-Chord-Recognition/master/README.MD);
    into Chordino: a user `chord.dict` file and "boost likelihood of the N (no chord) label" (NNLS Chroma README).
13. Symbolic MIDI into chords: chord-extractor converts MIDI to audio with timidity and then runs Chordino
    ("(OPTIONAL) `sudo apt-get install timidity` - If wanting to extract chords from MIDIs (timidity converts midi to
    wav files)", https://raw.githubusercontent.com/ohollo/chord-extractor/master/README.md) (documented chain).
14. Notes or MIDI from an audio-to-notes tool into a key estimate: music21 reads `.mid` / `.midi` files
    (`registerInputExtensions = ('mid', 'midi')` in `music21/converter/subConverters.py` at commit 8bfcfc4) and a
    Stream's `analyze('key')` returns a `key.Key` with `correlationCoefficient` and `alternateInterpretations`
    (`music21/analysis/discrete.py`).
15. BTC writes `.lab` lines `start end label` and MIDI (test.py line 80 and README,
    https://raw.githubusercontent.com/jayg996/BTC-ISMIR19/master/README.md); autochord also writes `.lab` files that
    "follow the MIREX chord label format" and its JavaScript app loads a LAB file next to the song for display
    (autochord README). Omnizart chord writes MIDI plus CSV `chord,start,end` (`omnizart/chord/inference.py`).
16. Chord labels into guitar chord diagrams: ChordMini maps recognised chords to fingerings "from the official
    @tombatossals/chords-db database" (https://raw.githubusercontent.com/ptnghia-j/ChordMiniApp/main/README.md)
    (documented chain inside one app).
17. TempoCNN (Essentia) takes audio at 11025 Hz ("the input audio signal sampled at 11025 Hz"), produced by
    `MonoLoader(filename=..., sampleRate=11025, resampleQuality=4)` (https://essentia.upf.edu/models.html); Beat This!
    and BeatNet resample to 22050 Hz themselves (sources in their sections); RhythmExtractor2013 "requires the sample
    rate of the input signal to be 44100 Hz".
18. Tempo in the browser: realtime-bpm-analyzer takes a Web Audio `AudioContext` source (realtime) or decoded PCM
    (`analyzeChannelData(channelData, 44100)` in Node) and emits tempo candidates (`data.bpm[0].tempo`)
    (https://raw.githubusercontent.com/dlepaux/realtime-bpm-analyzer/main/readme.md); the browser-audio-sync lane
    covers the metronome side.
