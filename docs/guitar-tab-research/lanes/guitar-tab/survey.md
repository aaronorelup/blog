# Lane 4, guitar-tab: survey of guitar transcription with string and fret assignment

Agent: docs-guitar-tab. Started 2026-11-10 (date from `date -u +%F`). This file records facts and quotes read
from primary sources on 2026-11-10 unless a line says otherwise. It does not rank or recommend anything.
Raw copies of the pages and files read with curl and git are kept outside the repo in
`/home/user/gtr/lanes/guitar-tab/raw/` and `/home/user/gtr/lanes/guitar-tab/repos/` (not committed).

Marks used in the tool list:

- `RUNNABLE`: looks runnable on the CPU-only Linux research box (Python or Node package, or a command-line
  program, with no GPU or account named as a requirement in its own docs). This is a reading of the docs, not a
  test: the try agent's `trials.md` says what actually ran.
- `NO-CODE-FOUND`: a paper with no code repository found on 2026-11-10 at the places named in its section.
- `DATASET`: a dataset, not a tool.
- "last commit" dates come from `git log -1 --format=%cI` on a `git clone --depth 1` of the default branch made
  on 2026-11-10. They are the date of the newest commit on that branch, nothing more.

## Tool list

Written first from web searches and an arXiv API query (`export.arxiv.org/api/query`, searches `guitar AND tablature`,
`guitar AND fingering`, `fretboard`, `ti:guitar` and others, sorted by date), then updated after the sections below
were written. Each line points to its section, and the section is what counts. RUNNABLE is a reading of the docs, not a
test (the try agent's `trials.md` says what ran).

### Audio to tablature (string and fret per note) or guitar notes

1. Guitab (Daniele Morotti), solo steel-string fingerstyle audio to .gp5; CLI, local web app, browser (ONNX Runtime
   Web). Code MIT, weights CC BY-NC-SA 4.0 on huggingface.co/danmor/guitab. v1.2.0, 2026-10-31 (first release
   2026-10-23). RUNNABLE (`--device cpu`). Section "Guitab".
2. TabCNN (Wiggins and Kim, ISMIR 2019), github.com/andywiggins/tab-cnn , last commit 2019-06-27; Python 2.7; no weights;
   no license file. Train-from-GuitarSet only. Section "TabCNN".
3. amt-tools (Cwitkowitz), PyPI 0.3.2 (2023-07-30), MIT; TabCNN re-implementation, `GuitarProfile(tuning, num_frets)`;
   no weights. RUNNABLE. Section "amt-tools".
4. guitar-transcription-with-inhibition (Cwitkowitz, Driedger, Duan; SMC 2022), last commit 2022-12-14, MIT; no
   weights named. RUNNABLE (training). Section of the same name.
5. FretNet (Cwitkowitz, Hirvonen, Klapuri; ICASSP 2023), github.com/cwitkowitz/guitar-transcription-continuous , last
   commit 2023-06-03, MIT; inference example expects a checkpoint that is not published in the repo. Section "FretNet".
6. SynthTab pretrained TabCNN / TabCNNx4 (Zang et al., ICASSP 2024), weights in github.com/yongyizang/SynthTab (last
   commit 2024-12-05); README says CC BY-NC 4.0, LICENSE file is CC BY 4.0. RUNNABLE ("code is still being cleaned
   up"). Section "SynthTab".
7. Riley et al. guitar note models (High Resolution Guitar Transcription, ICASSP 2024; GAPS model, ISMIR 2024) via
   github.com/xavriley/hf_midi_transcription (last commit 2026-01-27) and huggingface.co/xavriley/midi-transcription-models
   (card MIT). Notes only (no strings). RUNNABLE (`--device cpu`). Section "Riley et al. ...".
8. TART (Gupta et al.; arXiv 2510.02597 Oct 2025, arXiv 2609.11904 Sep 2026 "ISMIR 2026").
   NO-CODE-FOUND. Section "TART".
9. Noise2Fret (Simionato and Bigo, ISMIR 2026, arXiv 2608.30854), github.com/RiccardoVib/Noise2Fret (last commit
   2026-10-14), MIT; no weights. Section "Noise2Fret".
10. Audio2Tab (Jackson Loth), Whisper-small fine-tuned to .gp5, up to 30 s, github.com/JackJamesLoth/Audio2Tab (last
    commit 2026-10-22); "We will host a checkpoint here soon!"; no license file. Section "Audio2Tab".
11. GuitarTab (Hsu et al., arXiv 2607.26440), MIDI to tab with an audio path through Basic Pitch,
    github.com/MusicGuitarTab/GuitarTab (last commit 2026-05-27); no weights; no license file. Section "GuitarTab".
12. gtrsnipe (Scott VR), MIDI / ABC / VexTab / ASCII tab converter with a Viterbi fretboard mapper and an audio path
    (Demucs, pYIN), github.com/scottvr/gtrsnipe v0.8.3 (last commit 2026-11-10); PolyForm Noncommercial 1.0.0 plus a paid
    commercial licence. RUNNABLE. Section "gtrsnipe".
13. nylon-amt (github.com/d-f/nylon-amt , last commit 2025-02-10), hFT-Transformer experiment; no weights; no license
    file. Section "nylon-amt".
14. Papers found with guitar notes but no released model: Velocity Prediction in Automatic Guitar Transcription (arXiv
    2606.24912), Tone-informed Transformer / EGDB-PG (arXiv 2504.07406), real-tone augmentation (arXiv 2405.14679),
    procedural fingerpicking data (arXiv 2508.07987, linked repo empty), strumming directions (arXiv 2508.07973).
    Section "Audio-visual guitar transcription ... research".
15. Fretiq (arXiv 2607.18303), browser string classification for monophonic electric guitar. NO-CODE-FOUND. Research
    section.

### Notes or MIDI to string and fret

16. tuttut (Nathan Candre), MIDI to tab by HMM + Viterbi, any tuning; PyPI 0.0.7 (2026-11-04), MIT. RUNNABLE.
17. tutts, TypeScript port of tuttut, npm 0.1.0 (2026-06-09), MIT (npm metadata). RUNNABLE in Node or a browser.
18. tayuya (Vipul Sharma), PyPI 0.0.4 (2019-09-14), last commit 2019-10-13, MIT. RUNNABLE.
19. tabsynth, PyPI 1.0.6 (2026-01-06), DP / Viterbi over candidate fingerings, Hz-and-seconds input, MIT classifier (no
    LICENSE file in the sdist). RUNNABLE.
20. gtrsnipe (see 12): its mapper is a MIDI-to-tab tool with tuning, capo and scoring options.
21. Fretting-Transformer (Hamberger et al., ICMC 2025, arXiv 2506.14223), T5 with CAPO and TUNING tokens. NO-CODE-FOUND.
22. MIDI-to-Tab (Edwards, Riley, Sarmento, Dixon; ISMIR 2024, arXiv 2408.05024), BART masked LM; standard tuning, no
    capo. NO-CODE-FOUND.
23. GuitarTab (see 11): note-event tokens plus pitch-validity constrained decoding; re-implements a FrettingTransformer.
24. midi2tab_Deconvolutions (Kaliakatsos-Papakostas et al., SMC 2022; arXiv 2510.10619), github.com/maximoskp/midi2tab_Deconvolutions ,
    last commit 2022-02-08; no license file.
25. From MIDI to Rich Tablatures (Bontempi et al., arXiv 2407.09052), optimisation plus mySongBook statistics, MusicXML
    out. NO-CODE-FOUND.
26. LilyPond automatic tablature (`TabStaff`, `stringTunings`, `minimumFret`, `restrainOpenStrings`, string numbers).
    GPL v3. RUNNABLE (command line).
27. FretPath (MuseScore Studio 4.4+ plugin), position-aware Viterbi, string-number annotations as hard constraints,
    github.com/knoguchi/fretpath (last commit 2026-06-13), GPL v3. Desktop (MuseScore).
28. MuseScore, TuxGuitar, Guitar Pro 8 built-in string assignment (desktop apps; used as baselines by MIDI-to-Tab).

### Supporting libraries and formats

29. PyGuitarPro, GP3 / GP4 / GP5 read and write, PyPI 0.11 (2026-05-03), LGPL-3.0-only. RUNNABLE.
30. music21 `tablature` module (FretNote, FretBoard), PyPI 10.5.2 (2026-10-28), BSD-3-Clause. RUNNABLE.
31. DadaGP encoder / decoder (`dadagp.py`), last commit 2022-01-23, MIT; needs PyGuitarPro 0.6. RUNNABLE.

### Datasets (section "Datasets")

32. GuitarSet: v1.1.0 Zenodo 3371780 `cc-by-4.0`; v1.0.1 Zenodo 1422265 `cc-by-nc-4.0`.
33. IDMT-SMT-Guitar: Zenodo 7544110 `cc-by-nc-nd-4.0`.
34. EGDB: Google Drive, no licence statement found; derived EGDB BIAS FX2 (Zenodo 12674910) and EGDB-PG (Zenodo 19789500)
    `cc-by-4.0`.
35. DadaGP: research access by request; no dataset licence text found.
36. SynthTab: README CC BY-NC 4.0 vs LICENSE file CC BY 4.0.
37. GAPS: Zenodo `cc-by-nc-sa-4.0`; project page non-commercial research only; HF card `license: mit`.
38. Guitar-TECHS: Zenodo 14963133 `cc-by-4.0`.
39. GOAT: Zenodo 15690894 `cc-by-nc-4.0`, restricted, "non-commercial only".
40. François Leduc dataset: Zenodo 10984521 restricted, research by request; HF card `license: mit`.
41. Others: EGSet12 (`cc-by-4.0`), GuitarDuets (`cc-by-4.0`), SCORE-SET (CC BY-NC-SA 4.0 LICENSE file), AnimeTAB (licence not
    found), guitar_style_dataset video + audio (Zenodo 10075352 `cc-by-4.0`).

### Audio-visual and fingering research (section "Audio-visual guitar transcription and fingering estimation research")

42. TapToTab (arXiv 2409.08618, 2024), GuiFiR (IEEE Access 2026), Asmar et al. (2021, unverified), guitar technique
    video + audio dataset (Data in Brief 2023), Synchronize Dual Hands (SIGGRAPH Asia 2024), Guitar Chord Diagram
    Suggestion (SMC 2024), Visual Guitar Tab Comparison (ISMIR 2023 LBD), and the symbolic fingering papers above.

### Commercial products and services

43. Klangio Guitar2Tabs and API, Songscription, Note2Tabs, AnthemScore, Songsterr: pointers to the apps-survey and
    hosted-apis lanes only.

## Shared license texts (quoted once, referred to below)

These are the clauses of the standard licenses that recur in this lane. Each per-tool section names its license
and quotes its own license file; these are the license texts themselves.

- Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0), legal code, read 2026-11-10 at
  https://creativecommons.org/licenses/by-nc/4.0/legalcode.en : "NonCommercial means not primarily intended for or
  directed towards commercial advantage or monetary compensation." Section 2(a)(1): "reproduce and Share the
  Licensed Material, in whole or in part, for NonCommercial purposes only; and produce, reproduce, and Share
  Adapted Material for NonCommercial purposes only."
- CC BY-NC-SA 4.0, read 2026-11-10 at https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.en : the same
  "NonCommercial means ..." definition and the same Section 2(a)(1) wording as CC BY-NC 4.0 above.
- CC BY-NC-ND 4.0, read 2026-11-10 at https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.en : the same
  "NonCommercial means ..." definition; Section 2(a)(1): "reproduce and Share the Licensed Material, in whole or in
  part, for NonCommercial purposes only; and produce and reproduce, but not Share, Adapted Material for
  NonCommercial purposes only."
- CC BY 4.0, read 2026-11-10 at https://creativecommons.org/licenses/by/4.0/legalcode.en : Section 2(a)(1) ends
  "produce, reproduce, and Share Adapted Material." with no NonCommercial limit.
- Whether a trained model's weights are "Adapted Material" of its training data is not answered by any of these
  texts, and this file does not answer it. Where a model's authors state what they think, it is quoted in that
  model's section.

## TabCNN

- What: "Guitar Tablature Estimation with a Convolutional Neural Network", Andrew Wiggins and Youngmoo Kim, ISMIR
  2019. Repository https://github.com/andywiggins/tab-cnn (cloned 2026-11-10; last commit 2019-06-27, `305c1a1`).
  Paper PDF on Zenodo: https://zenodo.org/records/3527800 (Zenodo API lists `cc-by-4.0` for the paper PDF).
- No releases, no package. The README says: "This project was made to be run with Python 2.7." It lists numpy,
  scipy, pandas, jams, librosa, keras and tensorflow (README "0. Requirements").
- How it is called: train-and-test script only. README: "Run the following line to train and test the TabCNN
  model: `python model/TabCNN.py`", after "`bash data/Bash_TabDataReprGen.sh`" preprocesses GuitarSet.
- Pretrained weights: none in the repository (file list: README.md, data/*.py and .sh, demos/*.mp4, model/*.py).
  The README says weights are produced by training: "a folder for each fold of data will be created, containing the
  individual model's weights and predictions."
- Input (from `data/TabDataReprGen.py` and `model/TabCNN.py` at `305c1a1`): GuitarSet WAV resampled to 22050 Hz
  (`self.sr_downs = 22050`), CQT with `n_bins = 192`, `bins_per_octave = 24`, `hop_length = 512`; a 9-frame context
  window (`con_win_size = 9`); input shape `(192, 9, 1)` for CQT. Other features selectable with `spec_repr` "c",
  "m", "cm", "s" (README step 3).
- Output: per frame, 6 strings x 21 classes (`self.num_classes = 21`, `self.num_strings = 6`); the classes are
  "closed" (not played), open, and frets 1 to 19 (`self.highest_fret = 19`, `self.num_classes = self.highest_fret + 2
  # for open/closed`). Frame-level only; no note onsets, offsets or velocity in the output.
- Constraints: the tuning is fixed in code: `self.string_midi_pitches = [40,45,50,55,59,64]` (standard EADGBE). No
  capo, tuning or key argument.
- License: no license file found at https://github.com/andywiggins/tab-cnn (tree of commit `305c1a1`, read
  2026-11-10; `git ls-tree` shows only README.md, data/, demos/, model/).
- Training data: GuitarSet, downloaded from the link in the README,
  `https://zenodo.org/record/1422265/files/GuitarSet_audio_and_annotation.zip`, which is GuitarSet version 1.0.1.
  The Zenodo API lists that version's license as `cc-by-nc-4.0` (see the GuitarSet section for both versions).
- Author-reported numbers: not transcribed here (the paper PDF, Zenodo 3527800, by Andrew Wiggins and Youngmoo Kim
  per the Zenodo creators field, was not read today).

## amt-tools

- What: "Implements a customizable machine learning pipeline for AMT in PyTorch" (README), by Frank Cwitkowitz.
  https://github.com/cwitkowitz/amt-tools , last commit 2023-07-30 (`7822dc2`). PyPI `amt-tools` 0.3.2, uploaded
  2023-07-30 (https://pypi.org/pypi/amt-tools/json, read 2026-11-10); first PyPI upload 2021-06-08. README: "The
  framework is a work-in-progress."
- How it is called: Python library, `pip install amt-tools` (README). `setup.py` `python_requires='>=3.8'`,
  `install_requires` includes torch, librosa, mir_eval, jams, mido, mirdata, sounddevice, pynput. It contains a
  TabCNN re-implementation (`amt_tools/models/tabcnn.py`), GuitarSet loader (`amt_tools/datasets/GuitarSet.py`),
  CQT / HCQT / VQT feature modules, `amt_tools.inference.run_offline`, and estimators that turn tablature arrays into
  notes and MIDI.
- Guitar constraint hooks (`amt_tools/tools/instrument.py`): `GuitarProfile(tuning=None, num_frets=None)`, where
  `tuning` is a "list of str ... Name of lowest note playable on each degree of freedom" and `num_frets` is the
  "Number of frets on guitar (or at least the number used)". Defaults in `amt_tools/tools/constants.py`:
  `DEFAULT_GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']`, `DEFAULT_GUITAR_NUM_FRETS = 19`.
- Pretrained weights: none named in the README or in the package.
- License (code): MIT. `LICENSE.txt` at https://raw.githubusercontent.com/cwitkowitz/amt-tools/master/LICENSE.txt
  (read from the clone, commit `7822dc2`, 2026-11-10): "MIT License ... Copyright (c) 2023 Frank Cwitkowitz ...
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software".
  `setup.py`: `license='MIT'`.

## guitar-transcription-with-inhibition

- What: code for "A Data-Driven Methodology for Considering Feasibility and Pairwise Likelihood in Deep Learning
  Based Guitar Tablature Transcription Systems", Frank Cwitkowitz, Jonathan Driedger, Zhiyao Duan, SMC 2022
  (README "Cite"; arXiv https://arxiv.org/abs/2204.08094). https://github.com/cwitkowitz/guitar-transcription-with-inhibition ,
  last commit 2022-12-14 (`e611c1d`). `setup.py` version 0.1.0, `install_requires=['amt_tools', 'pyguitarpro']`.
  Not on PyPI (https://pypi.org/pypi/guitar-transcription-inhibition/json returned 404 on 2026-11-10).
- What it does (README): "Acquire annotations in JAMS format from GuitarPro data using PyGuitarPro"; "Create a matrix
  of inhibition weights from a collection of tablature (e.g., DadaGP)"; "Implement the proposed tablature output
  layer formulation with inhibition"; "Perform six-fold cross-validation experiments on GuitarSet".
- How it is called (README): `from guitar_transcription_inhibition.models import LogisticTablatureEstimator`,
  `LogisticTablatureEstimator(dim_in=<dim_in>, profile=<profile>, matrix_path=<matrix_path>, lmbda=<lmbda>)`, "an
  instance of `torch.nn.Module`". Guitar Pro to JAMS: `python guitar_transcription_inhibition/gpro/process_guitarpro.py`.
- Input / output: the same frame-level tablature formulation as amt-tools' TabCNN (strings x fret classes), with a
  `profile` (amt-tools `GuitarProfile`, so tuning and fret count are parameters).
- Pretrained weights: none named in the README. The GitHub releases page could not be checked: github.com web
  pages return HTTP 403 through this box's proxy (tested 2026-11-10 on the FretNet releases URL).
- License (code): MIT, `LICENSE.txt` (commit `e611c1d`, read 2026-11-10): "MIT License ... Copyright (c) 2022 Frank
  Cwitkowitz", with the standard MIT grant sentence quoted under amt-tools.
- Training data named in the README: GuitarSet (six-fold cross-validation) and DadaGP (inhibition matrix).

## FretNet (guitar-transcription-continuous)

- What: code for "FretNet: Continuous-Valued Pitch Contour Streaming for Polyphonic Guitar Tablature Transcription",
  Cwitkowitz, Hirvonen, Klapuri, ICASSP 2023 (README "Cite"; arXiv https://arxiv.org/abs/2212.03023).
  https://github.com/cwitkowitz/guitar-transcription-continuous , last commit 2023-06-03 (`d481054`). `setup.py`
  version 0.0.2, `install_requires=['amt_tools', 'muda']`; `requirements.txt` also pulls
  `git+https://github.com/cwitkowitz/guitar-transcription-with-inhibition@main`. Not on PyPI (404 on 2026-11-10).
- What it does (README): "Implement the FretNet model and obtain continuous-valued multi-pitch estimates";
  "Compute note and continuous-valued multi-pitch metrics at the string-level"; six-fold cross-validation on
  GuitarSet. The README's Usage section reads "#### TODO / TODO".
- How it is called: `examples/inference.py` loads a whole pickled model with `torch.load(model_path, ...)` from
  `~/Downloads/FretNet/models/fold-0/model-2000.pt`, computes an HCQT (`sample_rate = 22050`, `hop_length = 512`,
  `fmin=librosa.note_to_hz('E2')`, `harmonics=[0.5, 1, 2, 3, 4, 5]`, `n_bins=144`, `bins_per_octave=36`), runs
  `amt_tools.inference.run_offline(features, model, estimator)`, and reads `predictions[tools.KEY_NOTES]` ("stacked
  notes", per string), then `tools.stacked_notes_to_frets(...)`. It also produces per-string pitch lists
  (`StackedPitchListTablatureWrapper`), i.e. continuous pitch per string over time.
- Pretrained weights: the example expects a checkpoint file that is not in the repository; the README names no
  download. Whether one is published elsewhere: UNVERIFIED (the GitHub releases page returned 403 here; a check of
  the author's other pages would settle it).
- Constraints: through amt-tools' `GuitarProfile` (tuning list and fret count); `examples/comparison.py` builds
  `tools.GuitarProfile(num_frets=19)`.
- License (code): MIT, `LICENSE.txt` (commit `d481054`, read 2026-11-10): "MIT License ... Copyright (c) 2023 Frank
  Cwitkowitz", standard MIT grant.
- Training data: GuitarSet (six-fold cross-validation scripts).

## SynthTab (dataset plus pretrained TabCNN models)

- What: "SynthTab: Leveraging Synthesized Data for Guitar Tablature Transcription", Yongyi Zang, Yi Zhong, Frank
  Cwitkowitz, Zhiyao Duan, ICASSP 2024 (arXiv https://arxiv.org/abs/2309.09085 , comment "Accepted to ICASSP
  2024"). Repository https://github.com/yongyizang/SynthTab (cloned 2026-11-10; last commit 2024-12-05, `6136f79`);
  project site https://synthtab.dev/ (not read). arXiv abstract: "We procure SynthTab, a dataset derived from DadaGP
  ... The proposed synthesis pipeline produces audio which faithfully adheres to the original fingerings and a subset
  of techniques specified in the tablature".
- Pretrained weights: in the repository, under `demo_embedding/pretrained_models/`: `SynthTab-Pretrained.pt`
  (52,573,995 bytes), `finetuned/{EGDB,GuitarSet,IDMT}.pt` and `non_finetuned/{EGDB,GuitarSet,IDMT}.pt`. README:
  "`demo_embedding` is where we put our benchmark pre-trained models, with a simple demo script for training and
  running evaluation." `demo_embedding/README.md`: "The code is still being cleaned up. You would probably need to
  change directories paths and datasets in the code to make it work".
- How it is called: Python scripts (`demo_embedding/evaluate.py`, `exp_finetuning.py`,
  `exp_training_from_scratch.py`, `tabcnn.py`); `requirements.txt` lists torch, torchaudio, pyguitarpro, dawdreamer,
  `amt-tools>=0.3.1`, pedalboard and the two Cwitkowitz repositories above. The models are TabCNN / "TabCNNx4"
  (README), so output is the amt-tools frame-level tablature (6 strings x fret classes).
- Data format (README and `demo_data/Demo_Data.md`): per song `ground_truth.jams` ("This is the ground truth
  tablature"), audio per guitar and microphone (MP3 for train, FLAC for validation), per-string f0 as `*.pkl` ("We
  used the YIN algorithm for this"); "the original dataset is rendered at 44100 Hz"; "Total file size is close to
  and less than 2 TB." Hosted at UR Box (https://rochester.app.box.com/v/SynthTab-Full) and Baidu Netdisk.
- Known defect (README "Known Bugs"): "When two same-pitched notes are played on the same string in sequence with no
  gap in between ... the commericial VST we used would sometimes ignore the second note." Acoustic: "8994/11132
  (80.8%) of the songs are affected"; electric: "32179/38838 (82.9%) of the songs are affected".
- LICENSE, two sources that differ (both read 2026-11-10):
  - README.md: "SynthTab is released with CC BY-NC 4.0 license (learn more about it
    [here](https://creativecommons.org/licenses/by-nc/4.0/deed.en))."
    (https://raw.githubusercontent.com/yongyizang/SynthTab/main/README.md)
  - LICENSE file (18,022 bytes) begins: "Creative Commons Attribution 4.0 International" and contains "Attribution
    4.0 International Public License" (the CC BY 4.0 text, no NonCommercial clause).
    (https://raw.githubusercontent.com/yongyizang/SynthTab/main/LICENSE)
- Training data of the released weights: SynthTab (rendered from DadaGP tablature with commercial guitar plugins,
  per the abstract) and, for the fine-tuned files, EGDB, GuitarSet and IDMT-SMT-Guitar (file names). See those
  dataset sections for their licenses.
- Author-reported measurements: the README shows `Performance.png` (an image; its numbers were not transcribed here).

## Riley et al. guitar transcription models (High Resolution Guitar Transcription; GAPS benchmark model) via hf_midi_transcription

- What: two papers by Xavier Riley, Drew Edwards, Simon Dixon (and Zixun Guo for GAPS), Queen Mary University of
  London: "High Resolution Guitar Transcription via Domain Adaptation", ICASSP 2024 (arXiv
  https://arxiv.org/abs/2402.15258 ; project page https://xavriley.github.io/HighResolutionGuitarTranscription/), and
  "GAPS: A Large and Diverse Classical Guitar Dataset and Benchmark Transcription Model", ISMIR 2024 (arXiv
  https://arxiv.org/abs/2408.08653 ; https://aim-qmul.github.io/GAPS/). Both output notes (pitch, onset, offset,
  velocity), not strings or frets.
- Code and weights: the Hugging Face model repo https://huggingface.co/xavriley/midi-transcription-models (created
  2025-09-13, last modified 2026-08-22 per the HF API) links "Code: https://github.com/xavriley/hf_midi_transcription/",
  "Paper (guitar 1): https://arxiv.org/pdf/2402.15258", "Paper (guitar 2): https://arxiv.org/abs/2408.08653". Files
  include `guitar-fl.pth`, `guitar-gaps.pth`, `guitar-gaps-paper-version-12200_iterations.pth`,
  `guitar_kroma.safetensors`. Code repo https://github.com/xavriley/hf_midi_transcription : last commit 2026-01-27
  (`96f6797`), `pyproject.toml` name `hf-midi-transcription` version 0.1.1, `requires-python = ">=3.9"`, depends on
  torch, librosa, huggingface-hub and a fork `piano-transcription-inference @
  git+https://github.com/xavriley/piano_transcription_inference.git`.
- `instruments.json` maps `"guitar"` to `"checkpoint_file": "guitar-gaps.pth"` ("Guitar transcription model
  (default: GAPS)"), `"guitar_fl"` to `"guitar-fl.pth"` ("Guitar transcription model trained on Francois Leduc
  dataset") and `"guitar_gaps"` to `guitar-gaps.pth`.
- How it is called (README): CLI `midi_transcription guitar_solo.wav output.mid --instrument guitar` with
  `--device {auto,cpu,cuda}`, `--batch-size N`, `--checkpoint PATH`, `--model-id ID`; Python
  `MidiTranscriptionModel.from_pretrained("xavriley/midi-transcription-models", instrument="guitar")` then
  `model.transcribe("in.wav", "out.mid")` or `model.transcribe_audio_array(audio, "output.mid")` with audio loaded
  at `sr=16000`. README: "pip install hf-midi-transcription" (Option 1), but https://pypi.org/pypi/hf-midi-transcription/json
  returned HTTP 404 on 2026-11-10, so only the source install (Option 2) was found to exist.
- Input / output (README "Model Details"): "Input: Audio files (WAV, MP3, etc.)"; "Output: MIDI files"; "Sample Rate:
  16 kHz"; "Architecture: Convolutional Recurrent Neural Network (CRNN) with onset/offset/frame/velocity regression".
  The README's first line says "This code transcribes solo, monophonic audio from multiple instruments to MIDI"
  (quoted as written). `model.py` exposes `onset_threshold`, `offset_threshold` (default 0.3) and uses
  `segment_samples=10 * sample_rate`.
- Constraints: instrument choice and thresholds only; no tuning, capo or string parameters (no string output).
- Licenses, read 2026-11-10:
  - Code: no LICENSE file in the repository tree (commit `96f6797`). README "Model Details": "License: MIT";
    `pyproject.toml` classifier "License :: OSI Approved :: MIT License".
  - Weights: model card YAML `license: mit` (https://huggingface.co/xavriley/midi-transcription-models/raw/main/README.md).
  - Training data of `guitar-gaps.pth`: GAPS (see the GAPS dataset section: Zenodo license `cc-by-nc-sa-4.0`, the
    project page's "GAPS may be used only for non-commercial research purposes", and an HF dataset card saying
    `license: mit`). Training data of `guitar-fl.pth`: the François Leduc dataset. Its Zenodo record
    (https://zenodo.org/api/records/10984521, access "restricted", no license field) says: "For copyright reasons this
    dataset is made available by request only, for use in research projects. We are unable to distribute the
    original scores but these may be purchased from François Leduc at https://www.francoisleduconlinelibrary.com/
    You will need to obtain permission separately from the original copyright holder (François Leduc) to use these
    in non-research applications." The same record says "a newer version of this dataset is now freely available at
    https://huggingface.co/datasets/xavriley/FrancoisLeducGuitarDataset", whose card YAML says `license: mit`
    (HF API: created 2025-09-18, `gated: False`). The project page says: "The GuitarPro files are commercially
    available from his website".
- Author-reported (arXiv abstracts): 2402.15258: "The resulting model obtains state-of-the-art transcription results
  on GuitarSet in a zero-shot context"; 2408.08653: GAPS "containing 14 hours of freely available audio-score aligned
  pairs, recorded in diverse conditions by over 200 performers". (The per-metric tables were not transcribed here.)

## Guitab

- What: "Guitar audio → Guitar Pro tab" by Daniele Morotti. Repository https://github.com/DanieleMorotti/guitab
  (cloned 2026-11-10; last commit 2026-10-31, `b2537dc`), `pyproject.toml` version 1.2.0, `requires-python =
  ">=3.11"`. CHANGELOG: "## 1.0.0 — 2026-10-23 First public release", "## 1.2.0 — 2026-10-31". Weights:
  https://huggingface.co/danmor/guitab (HF API: created 2026-10-22, last modified 2026-10-31). Browser version:
  https://danielemorotti.github.io/guitab/ (not opened here). Name collision: the PyPI package named `guitab`
  (v1.0.0, 2022-01-13, home page https://github.com/bielsnohr/guitab, "BSD (3-clause)") is a different project;
  Guitab is installed from its repository.
- README: "Guitab turns a recording of a solo guitar into a tab you can open in Guitar Pro, TuxGuitar, MuseScore or
  any online gp5 player. It is made for **steel-string fingerstyle** playing". "On clean recordings about 85% of the
  notes come out right, with the correct string and fret ... Treat the result as *a first draft to correct by ear*".
- How it is called: CLI `guitab --audio my_song.mp3 --out_dir out/my_song` (wav, flac, ogg, mp3, aiff; other
  formats and video through ffmpeg). "Every command takes `--device auto|cuda|mps|cpu`." Local web app
  `guitab-app`. Browser version: "The models run with ONNX Runtime Web (WebGPU when the browser has it, else
  WebAssembly) ... It gives the same .gp5 as the Python pipeline, **byte for byte**"; "A 2:23 song takes about 16 s"
  (browser, author's figure). Python: modules `guitab.inference`, `guitab.pipeline` (not documented as an API in
  the README).
- What the docs say it needs: "A 4-minute song takes well under a minute and 1–2 GB of GPU memory" (README section
  2; CPU is an allowed `--device`). Dependencies: torch>=2.4, librosa, pyguitarpro, onnxruntime, safetensors,
  `beat-this` from git (pyproject).
- Input: audio "at 22.05 kHz mono" (README Architecture 1). Output: "`out/my_song/my_song.gp5` ... plus
  `my_song.tokens.txt` with the same tab as text tokens"; "for every frame and string, the fret (21 classes: silent or
  frets 0–19) and the onset probability" (Architecture 5); notes quantised to a beat grid from Beat This! (960 ticks
  per quarter, `--grid 240` = 16ths default); optional chord names.
- Constraints and settings (README option table): `--capo N` ("notes stay on strings that can play them, frets are
  written relative to the capo, and the .gp5 has the capo set"), `--fingering model|auto|low` ("`low` Re-finger towards
  first position with a Viterbi optimiser"), `--onset 0.4` threshold, `--orphan`, `--tempo 90` ("A fixed tempo
  instead of following the detected beats"), `--grid`, `--music_lm`, `--chords`, `--params JSON`. Tuning: no option;
  `guitab/guitar.py` begins `"""Guitar constants shared by the whole pipeline (standard tuning)."""` and sets
  `OPEN_PITCH = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}`.
- Licenses, read 2026-11-10:
  - Code: MIT. `LICENSE`: "MIT License / Copyright (c) 2026 Daniele Morotti" (standard MIT grant);
    `pyproject.toml` `license = "MIT"`.
  - Weights: README "Licence and credits": "The datasets keep their own licences: GuitarSet CC BY 4.0, GAPS CC
    BY-NC-SA 4.0, SynthTab CC BY-NC 4.0. The models are trained on them and inherit their non-commercial terms, so
    the published weights are **CC BY-NC-SA 4.0**, for research and personal use. The beat tracker shared on Hugging
    Face is a converted copy of Beat This! and keeps its MIT licence." Model card YAML `license: cc-by-nc-sa-4.0`
    and "The weights are released under **CC BY-NC-SA 4.0** (non-commercial), because they are trained on GAPS (CC
    BY-NC-SA 4.0) and SynthTab (CC BY-NC 4.0)." (https://huggingface.co/danmor/guitab/raw/main/README.md)
  - Training data: E15 "is trained on public datasets only" (GuitarSet, GAPS, a SynthTab subset of "428 selected
    fingerstyle songs (about 21 h ...)"); E19, and through distillation E24 and E25 (the default), also used a
    "Custom dataset (not distributed): real fingerstyle recordings with their tabs aligned to the audio". The chord
    model uses Chordonomicon. GAPS audio is fetched by `scripts/gaps_download.py` "from the dataset's YouTube links".
- Author-reported measurements (README "Results", onset ±50 ms, string + fret F1 / pitch F1): GuitarSet test (player
  05) E25 0.838 / 0.861; GAPS test pitch F1 E25 0.830; EGDB test clean DI E25 0.721 / 0.849; "Real fingerstyle
  recordings (19 held-out songs of the custom dataset)" E25 0.612. The model card adds: "*These numbers come from a
  personal project, not a benchmark study* ... the GuitarSet protocol is the project's own, so they are not directly
  comparable with published results."

## TART (Technique-Aware audio-to-tablature)

- What: two arXiv papers by Akshaj Gupta, Gopala Anumanchipalli and others (affiliation not read here): "TART: A
  Comprehensive Tool for Technique-Aware Audio-to-Tab Guitar Transcription", arXiv 2510.02597v1, 2025-10-02, and
  "TART: A Modular Tool for Technique-Aware Audio-to-Tablature Guitar Transcription", arXiv 2609.11904v1, 2026-09-10,
  comment "ISMIR 2026" (arXiv API, read 2026-11-10).
- Pipeline (2609.11904 abstract): "(1) an audio-to-MIDI transcription model, (2) an expressive technique classifier,
  (3) an audio-conditioned T5 encoder-decoder for string-fret assignment, and (4) an automated tablature generator."
  The 2025 version: "(1) Audio-to-MIDI pitch conversion through a piano transcription model adapted to guitar
  datasets; (2) MLP-based expressive technique classification; (3) Transformer-based string and fret assignment; and
  (4) LSTM-based tablature generation."
- Code and weights: NO-CODE-FOUND. The arXiv HTML of both versions (https://arxiv.org/html/2609.11904v1 ,
  https://arxiv.org/html/2510.02597v1) contains no repository link other than arXiv's own; no model was found on
  Hugging Face by this search. A search of the authors' pages would settle it (UNVERIFIED).
- License: none to quote (no code found).
- Author-reported (2609.11904 abstract): "We evaluate TART in a zero-shot setting on GuitarSet, EGDB, and two
  augmented benchmarks, Noisy GuitarSet and Noisy EGDB. Averaged across these four benchmarks, TART achieves 81.35%
  audio-to-MIDI F50 (+6.67 points over the best prior baseline), 71.8% string-fret Tab F1 (+8.5 points over the best
  prior baseline), and 54.08% end-to-end Tab F1."

## Noise2Fret (playability-aware diffusion audio-to-tab)

- What: "Playability-Aware Audio-to-Tablature Guitar Transcription via Diffusion Models", Riccardo Simionato and
  Louis Bigo, arXiv 2608.30854v1, 2026-08-31, comment "Accepted for ISMIR 2026". Code linked from the arXiv HTML:
  https://github.com/RiccardoVib/Noise2Fret (cloned 2026-11-10; last commit 2026-10-14, `b65a7ec`). The README says
  the repository also holds a second paper, "_Noise2Fret: Event-Based Audio-To-Tab Guitar Transcription_ (on review)".
- Model (README figure caption): "a 1D convolutional U-Net ... Audio, spectral features, and timestep are injected as
  conditioning signals ... The final denoised embedding is projected back to per-string class logits over F fret
  states, yielding the predicted tablature tensor (T x S x F)." Abstract: "we introduce five auxiliary losses encoding
  Pitch-Class Distance, Positional Distance, Circle-of-Fifths Distance, String Similarity, and Hand-Span Feasibility".
- How it is called: Python training scripts (`Noise2Fret_Aux_Losses/src/diffusion_training_GS.py`,
  `Noise2Fret_and_Onsets/src/trainings.py`); no CLI or inference entry point is described in the README.
- Pretrained weights: none in the repository (largest files are source files, `model.pdf`, `model.png`,
  `architecture.jpg`); the README names none.
- License (code): `LICENSE`: "MIT License / Copyright (c) 2026 Riccardo" (read 2026-11-10 from commit `b65a7ec`).
- Training data (abstract): "Experiments on GuitarSet and GOAT datasets". GOAT is non-commercial and by request (see
  GOAT section).

## Audio2Tab (Loth)

- What: "Audio2Tab: End-to-End Automatic Guitar Tablature Transcription", Jackson Loth (GOAT first author).
  https://github.com/JackJamesLoth/Audio2Tab (cloned 2026-11-10; last commit 2026-10-22, `47b0f1e`). README: "Given
  an audio file of up to 30 seconds, Audio2Tab transcribes the audio and outputs a .gp5 file containing a tablature
  transcription ... Paper is currently submitted for publication at ICASSP 2027." A preprint PDF is in the repo
  (`audio2tab-preprint.pdf`, not read here). Guitab's README says "the research started from Audio2Tab".
- How it is called (README): training `python src/train.py --manifest_csv DATA_CSV.csv --token_list_path
  token_list.json --output_dir OUTPUT_DIR --model_name_or_path openai/whisper-small --num_train_epochs 4`; inference
  `python infer.py --checkpoint_path CHECKPOINT_DIR --audio_path example_audio.wav --output_dir OUTPUT_DIR
  --tokenizer_dir TOKENIZER_DIR --feature_extractor_dir FEATURE_EXTRACTOR_DIR` (written in the README as `src/python
  infer.py`). "Currently the model is limited to up to 30 seconds of audio."
- Pretrained weights: README "## Checkpoints / We will host a checkpoint here soon!" (none published on 2026-11-10).
- License: no license file found at https://github.com/JackJamesLoth/Audio2Tab (tree of `47b0f1e`, read 2026-11-10).
- Training data named: GOAT, SynthTab, DadaGP (`goat.csv`, `synthtab.csv`, README "Data Preparation"). The base
  model `openai/whisper-small` has its own license (not read here; UNVERIFIED).

## nylon-amt

- What: https://github.com/d-f/nylon-amt (last commit 2025-02-10, `a3a678f`). README: "This project makes use of
  hierarchical frequency time transformers in order to transcribe classical guitar audio into sheet music and
  guitar tabulature. The original implementation of this model can be found at https://github.com/sony/hFT-Transformer/".
  "First, a model is trained to transcribe solo piano recital pieces using the MAESTRO dataset"; "Alphatab will be
  used for tab visualization" (future tense in the README).
- Author-reported (README "MAESTRO dataset performance"): Precision 0.01, Recall 0.95, F1 0.02, and "It is clear that
  more than 0.2% of the dataset needs to be used for training."
- Weights: none in the repository. License: no license file found at https://github.com/d-f/nylon-amt (tree of
  `a3a678f`, read 2026-11-10).

## gtrsnipe

- What: "gtrsnipe is a guitar transcription tool. Its primary function is to create playable guitar tablature from a
  variety of sources. It now features a fledgling audio-to-tab pipeline that can take a mixed audio track, isolate
  the guitar part, and transcribe it into a tab." By Scott VR. https://github.com/scottvr/gtrsnipe (last commit
  2026-11-10, `a9be933`), `pyproject.toml` version 0.8.3, `requires-python = ">=3.10"`. Not on PyPI (404).
- How it is called: CLI `gtrsnipe -i input.mid -o out.tab` (repeatable `-o`; "Convert to and from .mid, .abc, .vex,
  and .tab files. (and more.)"); `-i` accepts "(.mid, .mp3, .wav, etc.)". Extras: `pip install -e '.[audio]'` ("audio
  input: librosa pYIN bass pipeline"), `'.[separation]'` ("demucs stem isolation (pulls torch)"). Also `gtrsnipe-play`,
  `gtrsnipe-chords`, `--analyze` ("ranks them by how playable the tab is"), `--solve-tuning`.
- Algorithm, as the author describes it ("Fretboard optimizer"): "gtrsnipe chooses where to play each note on the
  fretboard by maximizing an additive playability score (fret span, hand movement, string switching, barre shapes,
  let-ring, and more)"; "`viterbi` (default) — a dynamic-programming / Viterbi trellis search that finds the
  **globally optimal** fingering sequence for the whole passage"; "`greedy` — the legacy per-chord choice".
- User-settable constraints (README): `--tuning` (named tunings, e.g. `DROP_D`, `BARITONE_B`), `--tuning-pitches
  "A1,E2,A2,D3,F#3,B3"`, `--drop-low-string`, `--num-strings`, `--max-fret`, `--capo`, `--optimizer`, scoring weights
  such as `--fret-span-penalty` and `--let-ring-bonus` (negative values invert them), `--refinger` / `--no-refinger`,
  `--single-string`, `--transpose`, `--prefer-open`, saved profiles in `.gtrsnipe/`.
- License, read 2026-11-10 (commit `a9be933`):
  - `LICENSE.md`: "# PolyForm Noncommercial License 1.0.0 ... The licensor grants you a copyright license for the
    software to do everything you might do with the software that would otherwise infringe the licensor's copyright
    in it for any permitted purpose." and "Any noncommercial purpose is a permitted purpose." and "Personal use for
    research, experiment, and testing for the benefit of public knowledge, personal study, private entertainment,
    hobby projects, amateur pursuits, or religious observance, without any anticipated commercial application, is use
    for a permitted purpose."
  - `LICENSE-COMMERCIAL.md`: "# Commercial License Addendum / Commercial users, contact me at [the author's email
    address, omitted here] for a paid license."

## tuttut (MIDI to tab, HMM + Viterbi)

- What: "A package to convert MIDI files to string instrument tabs" (pyproject), by Nathan Candre.
  https://github.com/natecdr/tuttut (last commit 2026-11-04, `329f7cb`); PyPI `tuttut` 0.0.7 uploaded 2026-11-04,
  first upload 2024-01-22 (https://pypi.org/pypi/tuttut/json). `requires-python = ">=3.9"`; dependencies numpy,
  pretty_midi, eel. README: "It can handle any tuning for any number of strings, and will do the arrangement
  accordingly."
- How it is called: GUI `tuttut` (README: "On Linux, tkinter needs `sudo apt install python3-tk`"); CLI `tuttut-cli`
  (entry point `tuttut.midi_tabs_cli:main`); Python, as in `tuttut/GUI/generate.py`: `f = pretty_midi.PrettyMIDI(path)`,
  `tuning = Tuning(strings, nfrets=...)`, `tab = Tab(name, tuning, f, weights=weights, output_dir=...)`, then
  `tab.to_ascii()` (writes `<name>.txt`) or `tab.to_json()` (writes `<name>.json`).
- Input: a MIDI file read with pretty_midi. README: "The tool works best for single-channel, single-instrument MIDI
  files". Output: ASCII tab text, or the `self.tab` structure as JSON (measures with notes, strings and frets).
- Algorithm family, as the author describes it (README "How it works"): "The sequence of notes and fingerings is
  modeled as a Hidden Markov Model (HMM), with the fingerings being the hidden states and the notes being the
  observed states ... we can make use of the Viterbi algorithm"; transition probabilities come from "a difficulty
  metric"; "The guitar fretboard is modeled as a complete graph".
- User-settable constraints: `Tuning(strings=standard_tuning, nfrets=20)` with any list of string pitches (e.g. a
  capo can be expressed only as a raised tuning; no capo argument was found in `theory.py`); difficulty weights
  `{"b":1, "height":1, "length":1, "n_changed_strings":1}` (defaults in `tab.py`). README "Limitations": "Slides,
  Hammer-on, Pull-offs and other advanced techniques are not modeled."
- License: `LICENSE` (commit `329f7cb`, read 2026-11-10): "MIT License / Copyright (c) 2023 Nathan Candre", standard
  MIT grant; PyPI classifier "License :: OSI Approved :: MIT License".

## tutts (TypeScript port of tuttut)

- What: npm package `tutts` 0.1.0, published 2026-06-09 (https://registry.npmjs.org/tutts , read 2026-11-10),
  repository `git+https://github.com/madisonrickert/tutts.git` (directory `packages/core`; not cloned). Description:
  "Renderer-neutral MIDI to guitar-tab fingering engine (TypeScript port of tuttut)."
- README (npm): "it frames fingering as a Hidden Markov Model (fretboard positions = hidden states, note onsets =
  observations) and uses Viterbi to pick the sequence that is easiest to play under a fret-height/span/string-change
  cost metric. The core is pure (zero runtime dependencies), ESM-only". Call:
  `generateTab({ notes: [{ midi: 64, startBeats: 0, durationBeats: 1 }, ...], tuning: Tuning.standardGuitar() })`,
  then `tab.toAscii()`, `tab.toLines()`, `tab.toSystems()`, or `tab.data` ("the renderer-neutral result"). Notes are
  "`{ midi, startBeats, durationBeats }` (C4 = 60, time in quarter-note beats)". Runs in a browser or Node (ESM).
- License: npm metadata `"license": "MIT"` for 0.1.0 (the repository's LICENSE file was not read: UNVERIFIED).

## tayuya

- What: "Python library to generate guitar tabs from MIDI files" (README), Vipul Sharma.
  https://github.com/vipul-sharma20/tayuya (last commit 2019-10-13, `793d6a4`); PyPI 0.0.4 uploaded 2019-09-14.
  `install_requires=["mido", "music21"]`.
- How it is called (README): `from tayuya import MIDIParser`; `mid = MIDIParser('sample.mid', track=0)`;
  `print(mid.render_tabs())`; `mid.get_tracks()`; `mid.notes_played()` ("[{'note': 'C#5', 'time': 18}, ..."); `mid.get_key()`.
  Output: ASCII tab text, or a list of "(note, string, fret)" tuples (`Tabs.generate_notes`).
- Algorithm, as the code documents it (`tayuya/tabs.py`): "Find best position (fret and string) for a note" nearest
  to the last fret played, preferring notes in the detected scale (`note_nearest_to_fret(fret, note, scale_notes)`).
  Tuning: a fixed note-to-string table (`constants.NOTE_TO_STRING`); no tuning or capo argument found.
- License: `LICENSE.md` (read 2026-11-10): "Copyright © 2019 Vipul Sharma / Permission is hereby granted, free of
  charge, to any person obtaining ..." (MIT text); PyPI classifier MIT.

## tabsynth

- What: PyPI `tabsynth` 1.0.6, uploaded 2026-01-06, first upload 2026-01-05 (https://pypi.org/pypi/tabsynth/json).
  Summary: "Convert musical events to playable guitar tablature via DP optimization". No repository or home page in
  the PyPI metadata; the pypi.org project page returned a JavaScript "Client Challenge" page to curl, so the README
  was read from the sdist `tabsynth-1.0.6.tar.gz` (downloaded, not run). The README says "Current version: 0.1.0".
- How it is called (README): `from tabsynth import NoteEvent, ChordEvent, events_to_tablature`;
  `events_to_tablature(events, output_format="ascii" | "json" | "compact", templates=None, max_fret=15,
  tolerance_cents=50.0)`; `TabSynthPipeline(max_fret=12, tolerance_cents=50.0).process(events, output_format="json")`.
  Input events are in Hz and seconds: `NoteEvent(pitch_hz: float, start: float, duration: float, confidence: float =
  1.0)`, `ChordEvent(pitches_hz: list[float], ...)`. JSON output fields: `index`, `start`, `duration`, `kind`,
  `strings`, `frets`, `mean_fret`, `min_fret`, `max_fret`, `requires_barre`, `chord_id`. No dependencies beyond
  Python 3.10.
- Algorithm, as described: "Candidate Generation (multiple fingerings per event) → Cost Calculation (hand position,
  stretch, barre difficulty) → DP Optimization (Viterbi algorithm)"; a chord-template library (`ChordTemplate`).
- Constraints: `max_fret`, `tolerance_cents`, custom `ChordTemplate`s. README "Limitations": "**Standard tuning
  focus**: Primary support for EADGBE tuning"; "**No timing quantization**".
- License: PyPI / `pyproject.toml` classifier "License :: OSI Approved :: MIT License"; README "MIT License - see
  LICENSE file for details." The sdist contains no LICENSE file (file list of `tabsynth-1.0.6.tar.gz`, 2026-11-10).

## Fretting-Transformer

- What: "Fretting-Transformer: Encoder-Decoder Model for MIDI to Tablature Transcription", Anna Hamberger, Sebastian
  Murgul, Jochen Schmidt, Michael Heizmann, arXiv 2506.14223v1 (2025-06-17), comment "Accepted to the 50th
  International Computer Music Conference (ICMC), 2025".
- Algorithm family (abstract): "an encoderdecoder model that utilizes a T5 transformer architecture to automate the
  transcription of MIDI sequences into guitar tablature ... framing the task as a symbolic translation problem".
- Constraints (paper text, arXiv HTML): "The conditioned model contains a CAPO# and TUNING#,#,#,#,#,# token in the
  input to condition the model for more flexibility and control over the outputs."; "By removing the conditioning
  tokens from the primer, it is also possible to let the model suggest a suitable tuning and capo option" (said of
  the GPT2 variant). Capo training data was augmented "from capo zero to capo seven".
- Training data (abstract): "DadaGP, GuitarToday, and Leduc". GuitarToday is described in the paper as "Sourced from
  the 'GuitarToday' Patreon account". (Dataset terms: see the DadaGP and Leduc entries.)
- Code and weights: NO-CODE-FOUND (no repository link in the arXiv HTML, https://arxiv.org/html/2506.14223v1 , read
  2026-11-10). The 2026 paper arXiv 2607.26440 (next sections) re-implements a "FrettingTransformer (T5-small)" in
  its own repository.
- Author-reported (abstract): "the Fretting-Transformer surpasses baseline methods like A* and commercial
  applications like Guitar Pro."

## MIDI-to-Tab (Edwards, Riley, Sarmento, Dixon)

- What: "MIDI-to-Tab: Guitar Tablature Inference via Masked Language Modeling", arXiv 2408.05024v1 (2024-08-09),
  comment "Reviewed pre-print accepted for publication at ISMIR 2024"; ISMIR proceedings PDF on Zenodo
  (https://zenodo.org/records/14877333 , license field `cc-by-4.0` for the paper).
- Algorithm family (abstract): "We train an encoder-decoder Transformer model in a masked language modeling paradigm
  to assign notes to strings. The model is first pre-trained on DadaGP ... and then fine-tuned on a curated set of
  professionally transcribed guitar performances." Paper text: "a Transformer with a bi-directional auto-encoder and a
  left-to-right decoder, based on the BART model architecture" and "a custom beam search inference".
- Constraints, in the authors' words (arXiv HTML): "Since we only predict string values, our fret predictions are
  always derived from the note-string assignment and an assumption of standard tuning. Similarly, our system does not
  handle the use of capos."
- Code and weights: NO-CODE-FOUND (no repository link in https://arxiv.org/html/2408.05024v1 , read 2026-11-10).
- Author-reported: a user study ("15 guitarists"); the paper's comparison table lists, per system, a column the
  extracted text shows as "Ours 12 1.84 1 73.58 / MuseScore 10 1.19 1 62.51 / Guitar Pro 8 12 0.78 0 62.27 /
  TuxGuitar 18 2.03 1 55.42" (column headers not captured by this extraction: UNVERIFIED which metric each column is).
  The paper compares against "one commercially available and two open-source implementations of automatic tablature
  systems" (Guitar Pro 8, MuseScore, TuxGuitar).

## GuitarTab (explicit note-event tokenization, arXiv 2607.26440)

- What: "Explicit Note-Event Tokenization and Pitch-Validity Constrained Decoding for MIDI-to-Tablature
  Transcription", Ting-Kai Hsu, Wei-Chin Wang, Kai-Xi Hong, Yu-Hua Chen, arXiv 2607.26440v1 (2026-07-29). Abstract:
  "Our code will be released at:https://github.com/MusicGuitarTab/GuitarTab". That repository exists (cloned
  2026-11-10; last commit 2026-05-27, `4f0bf21`).
- Algorithm (abstract): note-event tokens plus TAB tokens in the decoder; "a pitch-validity constrained decoding
  strategy that masks pitch-invalid TAB candidates during generation". README tree: `src/model.py  #
  FrettingTransformer (T5-small)`.
- How it is called (README): `python train.py ...` (Hydra configs), `inference.py`, and `demo.py` "Single file:
  audio/MIDI → tab", "Run on a single audio or MIDI file and get ASCII tablature + MIDI output", with `--checkpoint
  outputs/<exp_dir>/best_model.pt`; "Audio input requires: `pip install basic-pitch onnxruntime`".
- Weights: none published; the README's checkpoints are the user's own training outputs (`outputs/` folder).
- License: no license file found at https://github.com/MusicGuitarTab/GuitarTab (tree of `4f0bf21`, read 2026-11-10).
- Training data (abstract): DadaGP and "Francois Leduc" (folder `10984521/`, the Zenodo id of the Leduc dataset).

## midi2tab_Deconvolutions (Kaliakatsos-Papakostas et al.)

- What: "A Machine Learning Approach for MIDI to Guitar Tablature Conversion", arXiv 2510.10619v1 (posted
  2025-10-12; comment "Proceedings of the 19th Sound and Music Computing Conference, June 5-12th, 2022"). Code:
  https://github.com/maximoskp/midi2tab_Deconvolutions (last commit 2022-02-08, `d4b0f3e`), README "Transcribing guitar
  tabs from MIDI input", scripts `run_00_make_events.py`, `run_01_make_pianoroll_tab.py`, `train_*.py`, conda env file.
- Constraints (abstract): "requires a basic assumption about how much fingers can stretch on a fretboard; only
  standard 6-string guitar tuning is examined."
- Weights: none found in the tree. License: no license file found (tree of `d4b0f3e`, read 2026-11-10).

## From MIDI to Rich Tablatures (Bontempi et al.)

- What: arXiv 2407.09052v1 (2024-07-12), Pierluigi Bontempi, Daniele Manerba, Alexandre D'Hooge, Sergio Canazza.
  Abstract: "The basic fingering is derived by solving a constrained and multi-attribute optimization problem, which
  derives the best position of the fretting hand, not just the finger used at each moment. Then, by analyzing
  statistical data from the mySongBook corpus, the most common clichés and biomechanical feasibility, articulations,
  and expressive techniques are introduced. Finally, the obtained output is converted into MusicXML format".
- Code: NO-CODE-FOUND (the arXiv HTML links only https://github.com/mido/mido ).

## LilyPond automatic tablature

- What: LilyPond, "a music engraving program ... LilyPond is free software and part of the GNU Project"
  (https://lilypond.org/index.html , read 2026-11-10). Command-line program (`lilypond file.ly` writes PDF / SVG /
  PNG / MIDI). Not a learning system: string choice is rule-based.
- String and fret assignment, quoted from the Notation Reference 2.24, "Common notation for fretted strings"
  (https://lilypond.org/doc/v2.24/Documentation/notation/common-notation-for-fretted-strings , read 2026-11-10):
  "By default pitches are assigned to the lowest playing position on the fretboard (first position). Open strings
  are automatically preferred. If you would like a certain pitch to be played on a specific string you can add a
  string number indication to the pitch name." ... "The default value for minimumFret is 0. Even when minimumFret is
  set, open strings are used whenever possible. This behavior can be changed by setting restrainOpenStrings to #t."
  "LilyPond tablature automatically calculates the fret for a note based on the string to which the note is
  assigned. In order to do this, the tuning of the strings must be specified. The tuning of the strings is given in
  the stringTunings property." "The default string tuning is guitar-tuning , which is the standard EADGBE tuning.
  Some other predefined tunings are guitar-open-g-tuning ...".
- User-settable constraints: per-note string numbers (`c4\5`), `\set TabStaff.minimumFret = #5`, `\set
  TabStaff.restrainOpenStrings = ##t`, `stringTunings` (predefined or custom). Capo: the same page mentions a capo only
  for fret-diagram markups ("a capo indication that can be placed on the fret diagram"); no capo setting for the
  automatic string assignment was found on that page.
- License: the repository's COPYING (https://gitlab.com/lilypond/lilypond/-/raw/master/COPYING , read 2026-11-10)
  begins "GNU GENERAL PUBLIC LICENSE / Version 3, 29 June 2007". Using LilyPond as a separate program to render a
  file is a different situation from linking it into a program; this file does not interpret the GPL.

## FretPath (MuseScore plugin)

- What: "Playable guitar fingering for MuseScore Studio 4.4+" (README), https://github.com/knoguchi/fretpath (last
  commit 2026-06-13, `5e4fb42`), listed at https://musescore.org/en/project/fretpath ("API compatibility 4.x").
  Files: `FretPath.qml`, `fingering_core.js`.
- Algorithm, in the author's words (README): "Computes playable guitar fingering - (string, fret, left-hand finger,
  position) for every note - using position-aware Viterbi dynamic programming, and writes a TAB staff and/or
  annotations." "Unlike MuseScore's built-in conversion (StringData::convertPitch, a per-note greedy scan that picks
  the thinnest string with the lowest fret), this plugin optimizes the whole sequence".
- Constraints (README): "respects existing finger-number and string-number annotations as hard constraints.
  Alternate tunings (drop D etc.) and fret counts are read automatically from the instrument's string data."
- How it is called: inside the MuseScore Studio desktop application (a plugin), not a standalone CLI. The core is a
  JavaScript file (`fingering_core.js`); whether it runs outside MuseScore was not checked (UNVERIFIED).
- License: `LICENSE` begins "GNU GENERAL PUBLIC LICENSE / Version 3, 29 June 2007" (commit `5e4fb42`, read
  2026-11-10).

## MuseScore, TuxGuitar and Guitar Pro built-in string assignment

- These desktop programs assign strings and frets when notes go onto a tablature staff or when MIDI is imported.
  The renderers themselves are the web-tab-render lane's subject. Facts found in this lane's sources:
  - FretPath's README describes MuseScore's built-in method as "StringData::convertPitch, a per-note greedy scan that
    picks the thinnest string with the lowest fret".
  - The MIDI-to-Tab paper (arXiv 2408.05024) used "Guitar Pro 8", "MuseScore" and "TuxGuitar" as baselines: "Guitar Pro
    8 ... includes an algorithm to automatically produce tablature from score or MIDI. MuseScore ... is an open-source
    score editor with a similar functionality for generating tablature."

## PyGuitarPro

- What: "PyGuitarPro is a package to read, write and manipulate GP3, GP4 and GP5 files. Initially PyGuitarPro is a
  Python port of AlphaTab which originally was a Haxe port of TuxGuitar." (README.rst). https://github.com/Perlence/PyGuitarPro
  (last commit 2026-11-10, `624f23c`); PyPI `pyguitarpro` 0.11 uploaded 2026-05-03, `requires-python >= 3.10`.
- How it is called (README): `import guitarpro`; `curl = guitarpro.parse('... .gp5')`; `guitarpro.write(curl, '...
  .gp5')`. Docs: https://pyguitarpro.readthedocs.io/ . Formats: GP3, GP4, GP5 only (not GPX / GP 6-8), per the README.
- Used by: Guitab (writes .gp5), the inhibition repo (GuitarPro to JAMS), SynthTab (`gp_to_JAMS`), DadaGP (pinned
  `PyGuitarPro==0.6`).
- License: `pyproject.toml` `license = "LGPL-3.0-only"`; `LICENSE` begins "GNU LESSER GENERAL PUBLIC LICENSE / Version
  3, 29 June 2007" and "This version of the GNU Lesser General Public License incorporates the terms and conditions of
  version 3 of the GNU General Public License, supplemented by the additional permissions listed below." (read
  2026-11-10 from commit `624f23c`).

## music21 (tablature module)

- What: MIT's music21 toolkit, https://github.com/cuthbertLab/music21 (last commit 2026-11-08); PyPI `music21` 10.5.2
  uploaded 2026-10-28, `requires-python >= 3.11`, `license_expression` "BSD-3-Clause".
- Guitar-relevant API (`music21/tablature.py` at HEAD): classes `FretNote`, `FretBoard`, `GuitarFretBoard`,
  `UkeleleFretBoard`; `FretBoard.getPitches()` turns (string, fret) into pitches and "requires a tuning to be set".
  The module docstring has "TODO: Chord from Figure / Chord from FretBoard Object with tuning." No function that
  assigns strings and frets to given pitches was found in `tablature.py`.
- License: `LICENSE` begins "Copyright (c) 2006-2026 Michael Scott Asato Cuthbert / Redistribution and use in source
  and binary forms, with or without modification, are permitted provided that the following conditions are met:"
  (BSD 3-clause); README: "Music21 is Open-Source Software released under the BSD (3-clause) license."

## DadaGP tooling (encoder / decoder)

- What: https://github.com/dada-bots/dadaGP (last commit 2022-01-23, `dc0f203`). README: "an encoder/decoder (v1.1)
  that converts gp3, gp4, gp5 files to/from this token format."
- How it is called (README): `python dadagp.py encode input.gp3 output.txt [artist_name]`; `python dadagp.py decode
  input.txt output.gp5`. Requirement: "PyGuitarPro 0.6 *(it ONLY works with 0.6 ...)*". Notes: "rare combinations of
  instruments and tunings may not be supported; banjo is not supported; instrument-change events are not supported".
- License (code): `LICENSE`: "MIT License / Copyright (c) 2020 Dadabots" (read 2026-11-10).
- The token format is read by Guitab (`.tokens.txt` output "with the same tab as text tokens"), GOAT ("a text-like
  token encoding") and the GuitarTab repo (`src/dadagp_parser.py  # .tokens.txt parser`).

## Datasets

All licence ids below are the `metadata.license.id` field of the Zenodo API record (https://zenodo.org/api/records/<id>),
read 2026-11-10, unless another source is named. Zenodo shows that id as the record's licence.

### GuitarSet

- Xi, Bittner, Pauwels, Ye, Bello, ISMIR 2018; NYU MARL and Queen Mary. "time-aligned annotations of pitch contours,
  string and fret positions, chords, beats, downbeats, and playing style" (Zenodo description), recorded with a
  hexaphonic pickup; JAMS annotation files. Repository https://github.com/marl/GuitarSet , README: "GuitarSet can be
  downloaded [here](https://zenodo.org/record/3371780)."
- Licences, two versions that differ:
  - Version 1.1.0, Zenodo 3371780 (published 2019-08-20): `cc-by-4.0`. Notes: "Changes from version 1.0.1: - Added Key
    Annotation in each jams file - Removed impossible notes (negative frets) ...".
  - Version 1.0.1, Zenodo 1422265 (published 2018-09-20): `cc-by-nc-4.0`. This is the file TabCNN's README links to.
  - The GitHub repository's `LICENSE` (code) is "MIT License / Copyright (c) 2018 Music and Audio Research Laboratory - NYU"
    (https://raw.githubusercontent.com/marl/GuitarSet/master/LICENSE).
- Weights trained on it that are published: SynthTab `finetuned/GuitarSet.pt` and `non_finetuned/GuitarSet.pt`; Guitab
  E15 / E19 / E24 / E25 (with other data). The shared test input R1 of this project is drawn from GuitarSet
  (PLAN.md).

### IDMT-SMT-Guitar

- Fraunhofer IDMT. Zenodo 7544110, "IDMT-SMT-Guitar Dataset", v1.0.0, published 2023-01-17, file
  `IDMT-SMT-GUITAR_V2.zip` (1,329,918,978 bytes). Licence `cc-by-nc-nd-4.0`. Description: "Seven different guitars in
  standard tuning were used ... The recordings are provided in one channel RIFF WAVE format with 44100 Hz sample
  rate." "The parameter annotations for the first and second subset are stored in XML format."
- Weights trained on it that are published: SynthTab `finetuned/IDMT.pt`, `non_finetuned/IDMT.pt`.

### EGDB (electric guitar)

- Chen et al., "Towards Automatic Transcription of Polyphonic Electric Guitar Music: A new Dataset and A Multi-loss
  Transformer Model" (arXiv 2202.09907, ICASSP 2022). Demo page https://ss12f32v.github.io/Guitar-Transcription/ :
  "EGDB, that contains transcriptions of the electric guitar performance of 240 tablatures rendered with different
  tones"; the dataset is a Google Drive folder linked from that page. Repository https://github.com/ss12f32v/Guitar-Transcription
  (last commit 2023-04-26) holds only the demo page (`_config.yml`, `assets`, `index.md`, a sample folder).
- Licence: no licence statement found on https://ss12f32v.github.io/Guitar-Transcription/ and no LICENSE file in
  https://github.com/ss12f32v/Guitar-Transcription (both read 2026-11-10).
- Derived releases on Zenodo with their own licence ids: 12674910 "EGDB Dataset Rendered with the Positive Grid BIAS
  FX2 Plugin" (2024-07, `cc-by-4.0`); 19789500 "EGDB-PG" (2025-04, `cc-by-4.0`, one file of 135,406,622,188 bytes).
- Weights trained on it that are published: SynthTab `finetuned/EGDB.pt`, `non_finetuned/EGDB.pt`. Guitab uses EGDB
  only as a test set and for its chord model's evaluation songs (README).

### DadaGP

- Sarmento et al., ISMIR 2021 (arXiv 2107.14653). README: "a dataset of 26,181 GuitarPro songs in 739 genres, converted to
  a token sequence format". Paper: compiled from GuitarPro files online; it names "the tablature site Ultimate Guitar"
  as hosting "over 200,000 user-submitted GuitarPro files, containing notations of commercial music".
- Access, verbatim: README: "*Please contact Dadabots or Pedro Sarmento via email or twitter ... to request access to the
  dataset for research purposes.*" Paper section 7: "we allow researchers to access DadaGP from a Zenodo repository, on
  application by request." The paper PDF on Zenodo (5624597) is `cc-by-4.0`; no dataset licence text was found in the
  README or paper. The paper's "Ethical Considerations" asks: "Is it wrong to train machine learning models on
  copyrighted music? ... What about commercial use?"
- Used to train (per the papers): SynthTab (rendered from DadaGP), MIDI-to-Tab (pre-training), Fretting-Transformer,
  the GuitarTab repo, the inhibition matrix of guitar-transcription-with-inhibition, Audio2Tab.

### SynthTab

- See the SynthTab section above: README "CC BY-NC 4.0", repository LICENSE file CC BY 4.0. Derived from DadaGP.

### GAPS (Guitar-Aligned Performance Scores)

- Riley, Guo, Edwards, Dixon, ISMIR 2024. "14 hours of freely available audio-score aligned pairs, recorded in diverse
  conditions by over 200 performers" (arXiv abstract). Zenodo records: 13962272 (2024-10-21, `gaps_v1_no_audio.zip`,
  "Links to YouTube URLs for audio and video are provided in the accompanying metadata file") and 17152440, both
  `cc-by-nc-sa-4.0`. 17152440 adds: "a newer version of this dataset is now available at
  https://huggingface.co/datasets/xavriley/GAPS which includes audio".
- Three licence statements that differ (all read 2026-11-10):
  - Zenodo 13962272 and 17152440: `cc-by-nc-sa-4.0`.
  - Project page https://aim-qmul.github.io/GAPS/ , section "License": "The GAPS dataset contains copyright material and
    is shared with researchers under the following conditions: GAPS may only be used by the individual signing below and
    by members of the research group or organisation of this individual. This permission is not transferable. GAPS may
    be used only for non-commercial research purposes. GAPS (or data enabling the its reproduction) may not be sold,
    leased, published or distributed to any third party without written permission from the GAPS administrator."
  - Hugging Face dataset card https://huggingface.co/datasets/xavriley/GAPS/raw/main/README.md : YAML `license: mit`
    (HF API: `gated: False`, created 2025-09-09).
- Weights trained on it that are published: `xavriley/midi-transcription-models` `guitar-gaps.pth` (card `license: mit`);
  Guitab E15 / E19 / E24 / E25 (card `license: cc-by-nc-sa-4.0`).

### Guitar-TECHS

- Pedroza, Taheri, Abreu, Corey, Roman, ICASSP 2025 (arXiv 2501.03720). Zenodo 14963133 (2025-04-06), `cc-by-4.0`.
  Project page https://guitar-techs.github.io : "All data is freely available for download and use through a
  personalized Zenodo repository: All data is licensed under a Creative Commons Attribution 4.0 License (CC BY 4.0)."
- Content (Zenodo description): "multi-perspective audio signals (direct input, amplifier microphone,
  egocentric/exocentric stereo microphones) and synchronized MIDI annotations per string". The description lists audio
  perspectives only. The Zenodo file list is nine zips (`P1_chords.zip`, `P1_scales.zip`, `P1_singlenotes.zip`,
  `P1_techniques.zip`, `P2_chords.zip`, `P2_scales.zip`, `P2_singlenotes.zip`, `P2_techniques.zip`, `P3_music.zip`);
  their contents were not opened, so whether any video is inside is UNVERIFIED.
- Weights trained on it that are published: none found in this lane's sources.

### GOAT (Guitar On Audio and Tablatures)

- Loth, Sarmento, Sarkar, Guo, Barthet, Sandler, ISMIR 2025 (arXiv 2509.22655). Repository
  https://github.com/JackJamesLoth/GOAT-Dataset (last commit 2025-09-30): "If you would like access to this dataset,
  please request access on the [Zenodo](https://zenodo.org/records/15690894) page." Abstract: "5.9 hours of unique
  high-quality direct input audio recordings of electric guitars ... we provide a starting 29.5 hours of audio. Each
  recording is annotated using guitar tablatures ... the Guitar Pro format ... and a text-like token encoding."
- Licence and access: Zenodo 15690894: `cc-by-nc-4.0`, access "restricted". Its description: "If you are interested in
  using this dataset, please contact us and include a short description of what you plan to use the dataset for. PLEASE
  READ BEFORE SUBMITTING A REQUEST: this dataset is non-commercial only, so I unfortunately cannot grant requests for any
  kind of commercial use case, even internal testing. I am sorry for the trouble. Open source and research projects are
  fine!" (Zenodo 17706552 and 17811453 are the ISMIR paper PDF, `cc-by-4.0`.)
- Used by: Noise2Fret, Audio2Tab (no weights published by either).

### François Leduc dataset (FLGD)

- See the Riley et al. section: Zenodo 10984521 (restricted, research by request, scores sold by François Leduc) and the
  HF card `license: mit`. Used by the HRGT model (`guitar-fl.pth`), Fretting-Transformer, MIDI-to-Tab (fine-tuning on
  "professionally transcribed guitar performances", per its abstract; that the set is Leduc's is UNVERIFIED here) and
  the GuitarTab repo.

### Smaller or newer sets found

- EGSet12 (from arXiv 2405.14679, robust-guitar-tabs.github.io): Zenodo 11406378 (2024-06-01), `cc-by-4.0`, "twelve real
  & original solo electric guitar performances", files `.gp` and `.jams`.
- GuitarDuets (arXiv 2507.01172): Zenodo 12802440 (2024-07-23), `cc-by-4.0`, `GuitarDuets.zip` (3,534,777,196 bytes).
- SCORE-SET (arXiv 2507.18723): https://github.com/DjentleViBe/SCORE-SET (last commit 2025-12-31), ".gp5 transcribed files,
  derived from the GiantMIDI and MAESTRO datasets"; `LICENSE` begins "Attribution-NonCommercial-ShareAlike 4.0
  International".
- AnimeTAB (arXiv 2210.03027, 2022): the paper says "Our data and code have been made publicly available"; where, and
  under what licence, was not found in the arXiv HTML (UNVERIFIED).
- Rhythm Guitar Tablature Continuation data: Zenodo 21304818 (2026-07), `cc-by-nc-sa-4.0`, access "restricted" (seen in a
  Zenodo search result only).

### Which published weights were trained on which data (from the sections above)

| Published weights | Where | Weights licence as stated | Training data named by the authors |
|---|---|---|---|
| SynthTab `SynthTab-Pretrained.pt`, `finetuned/*.pt`, `non_finetuned/*.pt` | in the GitHub repo | repo LICENSE file CC BY 4.0; README says the dataset is CC BY-NC 4.0 | SynthTab (from DadaGP); fine-tunes on EGDB, GuitarSet, IDMT |
| Guitab E25 / E24 / E19, tab LM, chord model | huggingface.co/danmor/guitab | CC BY-NC-SA 4.0 | GuitarSet, GAPS, SynthTab subset, a non-distributed custom set; chord model Chordonomicon |
| `guitar-gaps.pth`, `guitar-fl.pth` | huggingface.co/xavriley/midi-transcription-models | MIT (card) | GAPS; François Leduc dataset |
| TabCNN, inhibition, FretNet, Noise2Fret, Audio2Tab, GuitarTab, TART, MIDI-to-Tab, Fretting-Transformer | none found | n/a | GuitarSet (first three); GuitarSet + GOAT; GOAT + SynthTab + DadaGP; DadaGP + Leduc; GuitarSet / EGDB eval; DadaGP + fine-tune set; DadaGP + GuitarToday + Leduc |

## Audio-visual guitar transcription and fingering estimation research, 2019 to 2026

Found through the arXiv API (queries listed under "Tool list"), Zenodo searches and web searches on 2026-11-10. arXiv
is well covered; other venues (IEEE Xplore, ACM, ISMIR proceedings) were searched only through web search, so this
list is not complete for them. "Code" means a repository link found in the paper or on its page.

### Video or video plus audio to tab, fingers or frets

| Year | Work | What goes in and out (as the authors describe it) | Code / data |
|---|---|---|---|
| 2024 | TapToTab, Ghaleb et al., arXiv 2409.08618 (2024-09-13) | "YOLO models for real-time fretboard detection, and Fourier Transform-based audio analysis for precise note identification" to make tabs "from video recordings" (abstract) | no code link found (the arXiv HTML was not available; abstract read via the arXiv API) |
| 2026 | GuiFiR, An, Chung, Park, Lee, IEEE Access 2026 (Kookmin University AI lab) | "a weakly-supervised framework that jointly estimates hand and guitar fretboard pose" (lab page TL;DR, read via web fetch; the page could not be fetched with curl: connection reset) | lab page says "The GuiFiR dataset resources are publicly available" with no URL; lab GitHub https://github.com/kmu-ee-ailab (no GuiFiR repository linked) |
| 2021 | Asmar, Séoud, Bilodeau, Polytechnique Montréal (poster; a 2022 master's thesis per the search summary) | RGB-D video with semantic segmentation, hand pose estimation and optical flow, no audio (search-result summary only) | UNVERIFIED: publications.polymtl.ca returned connection reset / HTTP 503 on 2026-11-10 |
| 2023 | "A multimodal dataset for electric guitar playing technique recognition", Data in Brief (PMC10698518) | "549 video samples in MP4 format, and their respective audio samples in WAV format, covering nine different electric guitar techniques"; recorded "using a smartphone device"; article licence "CC BY-NC-ND" | data: Zenodo 10075352 "magcil/guitar_style_dataset" v1.0.0 (2023-11-06), `cc-by-4.0`, 14,251,969,884 bytes |
| 2024 | "Synchronize Dual Hands for Physics-Based Dexterous Guitar Playing", Xu and Wang, SIGGRAPH Asia 2024, arXiv 2409.16629 | the reverse direction: tab in, simulated two-hand motion out ("accurately play diverse rhythms with complex chord pressing and string picking patterns based on the input guitar tabs"); includes motion-capture data | https://github.com/xupei0610/guitar (linked from https://pei-xu.github.io/guitar ; licence not read) |
| 2025 | "Joint Transcription of Acoustic Guitar Strumming Directions and Chords", Murgul, Schimper, Heizmann, ISMIR 2025, arXiv 2508.07973 | data collected with "an ESP32 smartwatch motion sensor"; the model uses "only microphone audio" | no code link in the arXiv HTML |
| 2008 (before the window, for context) | Paleari, Huet et al., EURECOM, ICIP 2008 "A multimodal approach to music transcription" (web-search summary only; the paper was not read) | webcam fretboard and hand tracking fused with audio; the search summary quotes "89% of notes" disambiguated | not checked |

### Fingering estimation and string assignment from notes (symbolic), and string identification from audio

| Year | Work | Method family (authors' words) | Code |
|---|---|---|---|
| 2022 (arXiv 2025) | Kaliakatsos-Papakostas et al., SMC 2022, arXiv 2510.10619 | "based on machine learning"; "only standard 6-string guitar tuning is examined" | https://github.com/maximoskp/midi2tab_Deconvolutions (section above) |
| 2023 | "Enumerating Left Hand Forms for Guitar Tablatures Using Non-Decreasing Finger Numbers", TENOR 2023 (Zenodo 8079340, paper PDF `cc-by-4.0`) | title only read (Zenodo search result) | not checked |
| 2023 | Visual Guitar Tab Comparison, Heyen et al., ISMIR 2023 LBD, arXiv 2311.14726 | an interface to compare tab versions by "similarity, difficulty, and correctness" | https://github.com/visvar/visual-guitar-tab-comparison (last commit 2023-11-20; no LICENSE file in the tree) |
| 2024 | MIDI-to-Tab (Edwards et al.), arXiv 2408.05024 | masked-language-model Transformer (BART) | none found |
| 2024 | From MIDI to Rich Tablatures (Bontempi et al.), arXiv 2407.09052 | "constrained and multi-attribute optimization problem ... best position of the fretting hand" | none found |
| 2024 | Guitar Chord Diagram Suggestion (d'Hooge, Bigo, Déguernel, Martin), SMC 2024, arXiv 2407.14260 | suggests a chord diagram "taking into account the diagram of the previous chord", from DadaGP and mySongBook statistics; "improves the F1-score on this task by up to 27%" | no code link in the arXiv HTML |
| 2025 | Fretting-Transformer, arXiv 2506.14223 | T5 encoder-decoder with CAPO and TUNING tokens | none found |
| 2026 | GuitarTab (Hsu et al.), arXiv 2607.26440 | note-event tokens plus "pitch-validity constrained decoding" | https://github.com/MusicGuitarTab/GuitarTab |
| 2026 | Noise2Fret (Simionato, Bigo), arXiv 2608.30854 | diffusion with "Hand-Span Feasibility" among five auxiliary losses (audio in) | https://github.com/RiccardoVib/Noise2Fret |
| 2026 | Fretiq (Garg), arXiv 2607.18303v2 | "browser-based string classification system using a 26-dimensional feature representation ... and 13 Mel-Frequency Cepstral Coefficients", monophonic electric guitar; "A recording-session-held-out evaluation yields 86.53 +/- 1.23 percent accuracy" | no code link found (the arXiv HTML was not available) |
| 2026 | TART v2 (Gupta et al.), arXiv 2609.11904 | "an audio-conditioned T5 encoder-decoder for string-fret assignment" | none found |

Other guitar transcription work found in the same queries, without string output or outside this lane's core:
"Velocity Prediction in Automatic Guitar Transcription" (Loth, Riley, Dixon, Benetos, EUSIPCO 2026, arXiv 2606.24912;
no code link in the arXiv HTML); "Towards Generalizability to Tone and Content Variations in the Transcription of
Amplifier Rendered Electric Guitar Audio" (Chen et al., arXiv 2504.07406; introduces EGDB-PG and a "Tone-informed
Transformer"; project page https://ss12f32v.github.io/Guitar-Transcription-with-Amplifier/ , not read); "Leveraging Real
Electric Guitar Tones and Effects ..." (Pedroza et al., arXiv 2405.14679; uses amt-tools; EGSet12 data, Zenodo 11406378);
"Exploring Procedural Data Generation for Automatic Acoustic Guitar Fingerpicking Transcription" (Murgul, Heizmann,
AIMC 2025, arXiv 2508.07987), whose linked repository https://github.com/klangio/procedural-data-training was empty (no
commits) when cloned on 2026-11-10; "Transcribing Rhythmic Patterns of the Guitar Track in Polyphonic Music" (arXiv
2510.05756, not read beyond its title).

## Commercial products and services (pointers only)

- Apps that turn audio into guitar tab (Klangio Guitar2Tabs, Songscription, Note2Tabs, AnthemScore, Songsterr) are the
  apps-survey lane's; HTTP APIs (Klangio API, Music.AI) are the hosted-apis lane's (its survey lists "Klangio API ...
  transcription to MIDI / MusicXML / Guitar Pro 5 / PDF"). This lane read none of their terms or prices and states none.
- Guitar Pro 8, MuseScore and TuxGuitar each assign strings automatically (see "MuseScore, TuxGuitar and Guitar Pro
  built-in string assignment" above).

## Handoff facts

One line per fact. Each half cites the page or file it was read from on 2026-11-10 (the sections above quote them).
None of these pairs was run by this agent; the try agent's `trials.md` records what was actually run.

1. hf_midi_transcription (Riley et al. guitar models) outputs a MIDI file ("Output: MIDI files", CRNN "with
   onset/offset/frame/velocity regression"; https://github.com/xavriley/hf_midi_transcription README), which tuttut
   accepts as a MIDI file read by `pretty_midi.PrettyMIDI(path)` into `Tab(name, tuning, midi, ...)`
   (https://github.com/natecdr/tuttut `tuttut/GUI/generate.py`).
2. The same MIDI file is accepted by gtrsnipe as `gtrsnipe -i input.mid -o out.tab` with `--tuning`, `--tuning-pitches`
   and `--capo` (https://github.com/scottvr/gtrsnipe README "Command-line options").
3. A multi-track MIDI file is accepted by tayuya one track at a time: `MIDIParser('sample.mid', track=0)`, with
   `get_tracks()` listing track names (https://github.com/vipul-sharma20/tayuya README).
4. A note list with MIDI numbers and times in quarter-note beats (`{ midi, startBeats, durationBeats }`) is the input
   of tutts `generateTab`, whose `tab.data` is "the renderer-neutral result" meant for "a thin adapter" to a tab
   renderer (https://registry.npmjs.org/tutts README).
5. A note list in Hz and seconds (`NoteEvent(pitch_hz, start, duration, confidence)`) is the input of tabsynth
   `events_to_tablature`, which outputs ASCII, compact text or JSON with `strings`, `frets`, `start`, `duration` per event
   (tabsynth 1.0.6 sdist README). A transcriber that gives MIDI note numbers needs a MIDI-to-Hz conversion first (the
   tabsynth API takes Hz only).
6. The GuitarTab repo (arXiv 2607.26440) accepts audio by running Basic Pitch first: "Audio input requires: `pip install
   basic-pitch onnxruntime`"; `demo.py` "Single file: audio/MIDI → tab" outputs "ASCII tablature + MIDI output"
   (https://github.com/MusicGuitarTab/GuitarTab README). It needs a checkpoint the user trains.
7. Guitab outputs `<name>.gp5` (Guitar Pro 5, notes on strings and frets, quantised to a beat grid, optional capo and
   chord names) plus `<name>.tokens.txt` (https://github.com/DanieleMorotti/guitab README section 2), which PyGuitarPro
   reads with `guitarpro.parse(...)` ("read, write and manipulate GP3, GP4 and GP5 files";
   https://github.com/Perlence/PyGuitarPro README) and which Guitab's own local app shows "in an alphaTab viewer with
   playback ... metronome, count-in, loop" (Guitab README "Web app"). Whether `.tokens.txt` is the DadaGP token format:
   UNVERIFIED (the README says only "the same tab as text tokens").
8. Guitab accepts a separated guitar stem as an ordinary audio file (`--audio` takes "wav, flac, ogg, mp3, aiff", others
   through ffmpeg; Guitab README), so a guitar stem from the source-separation lane is a valid input; the README says it
   is made for "a recording of a solo guitar".
9. hf_midi_transcription's README says "If you need to separate instruments from a mix first please check out UVR or
   MVSep.com" (source-separation lane tools) and loads audio at 16 kHz (`librosa.load(..., sr=16000)` in the README
   example).
10. Guitab's beat grid comes from Beat This! (chords-beats-key lane): "the beats come from the Beat This! activation
    together with the model's own onset probabilities", and `--tempo 90` replaces them with "A fixed tempo" (Guitab
    README); the .gp5 is laid out "on a grid that follows the beats of the recording" (README introduction), and
    Guitab's alphaTab viewer offers "metronome, count-in, loop" on it (README "Web app").
11. DadaGP's `dadagp.py encode input.gp3 output.txt` turns GP3/4/5 into token text and `decode` turns it back into .gp5
    (https://github.com/dada-bots/dadaGP README), and the GuitarTab repo reads that token text with
    `src/dadagp_parser.py  # .tokens.txt parser` (GuitarTab README).
12. Guitar Pro files become JAMS string-and-fret annotations with PyGuitarPro in two repos: the inhibition repo
    ("Acquire annotations in JAMS format from GuitarPro data using PyGuitarPro") and SynthTab (`gp_to_JAMS/`), and
    SynthTab's `JAMS_to_MIDI/` writes "MIDI files (per-string)" (SynthTab README "Structure").
13. GuitarSet ships JAMS files with "string and fret positions" (Zenodo 3371780 description), which amt-tools reads
    through `amt_tools/datasets/GuitarSet.py` for TabCNN-style training (amt-tools repository tree).
14. amt-tools-based models (TabCNN re-implementation, inhibition layer, FretNet) output per-string "stacked notes",
    which `tools.stacked_notes_to_frets(...)` turns into (string, fret) per note (FretNet `examples/inference.py`); no
    file writer for Guitar Pro or MusicXML is part of those repositories (file trees read 2026-11-10).
15. gtrsnipe writes `.vex` (VexTab), `.abc`, `.mid` and ASCII `.tab` ("Convert to and from .mid, .abc, .vex, and .tab
    files"; gtrsnipe README), so its output can go to a VexTab or abcjs renderer in the web-tab-render lane (renderer
    half not read here).
16. From MIDI to Rich Tablatures "converted into MusicXML format" (arXiv 2407.09052 abstract); music21 reads MusicXML
    and has `FretNote` / `FretBoard` objects for string and fret (music21 `tablature.py`). No code was found for the
    paper.
17. User constraint "capo at fret N" is accepted by: Guitab `--capo N`; gtrsnipe `--capo`; Fretting-Transformer through
    a `CAPO#` token (paper; no code). Not accepted by: MIDI-to-Tab ("our system does not handle the use of capos"),
    tuttut and tabsynth (no capo parameter found; a capo can be given to tuttut only as a raised `Tuning`), LilyPond's
    automatic assignment (no capo setting found on the fretted-strings page).
18. User constraint "tuning" is accepted by: amt-tools `GuitarProfile(tuning=[...], num_frets=...)`; tuttut
    `Tuning(strings, nfrets)`; gtrsnipe `--tuning`, `--tuning-pitches`; LilyPond `stringTunings`; FretPath (read from
    the MuseScore instrument's string data); Fretting-Transformer `TUNING#,#,#,#,#,#` token (no code). Fixed to standard
    tuning in: TabCNN (`string_midi_pitches = [40,45,50,55,59,64]`), Guitab (`OPEN_PITCH` in `guitab/guitar.py`), MIDI-to-Tab
    ("an assumption of standard tuning"), tabsynth ("Standard tuning focus"), midi2tab_Deconvolutions ("only standard
    6-string guitar tuning is examined").
19. User constraint "this note is on string S" is accepted by: LilyPond string-number indications (`c4\5`); FretPath
    ("respects existing finger-number and string-number annotations as hard constraints"); gtrsnipe `--no-refinger`
    keeps a tab's strings ("never moves a note to another string"). No audio-to-tab model in this lane takes a fixed
    string as an input; Guitab's `--fingering model|auto|low` re-fingers its own output.
20. Hand landmarks or fretboard coordinates from the video-hands-fretboard lane: no tool in this lane's sections
    accepts them as input. The video-based systems found (TapToTab, GuiFiR, Asmar et al.) have no released code that
    was found on 2026-11-10.
21. Licence chain facts for a public web app: Guitab weights are CC BY-NC-SA 4.0 (model card); xavriley guitar weights
    are MIT on their card while GAPS (training data) carries CC BY-NC-SA 4.0 on Zenodo and a non-commercial-research
    condition on its project page; gtrsnipe is PolyForm Noncommercial 1.0.0 with a paid commercial licence offered;
    tuttut, tutts, tayuya, tabsynth, amt-tools, inhibition, FretNet, DadaGP tooling and music21 are MIT or BSD; PyGuitarPro
    is LGPL-3.0-only; LilyPond and FretPath are GPL v3 (each quoted in its section).
