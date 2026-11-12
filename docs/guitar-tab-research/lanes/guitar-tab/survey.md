# Lane 4, guitar-tab: survey of guitar transcription with string and fret assignment

Agent: docs-guitar-tab. Started 2026-11-10 (date from `date -u +%F`). This file records facts and quotes read
from primary sources on 2026-11-10 unless a line says otherwise. It does not rank or recommend anything.
Raw copies of the pages and files read with curl and git are kept outside the repo in
`/home/user/gtr/lanes/guitar-tab/raw/` and `/home/user/gtr/lanes/guitar-tab/repos/` (not committed).

Checked and corrected in place by verify-docs-guitar-tab on 2026-11-10: every quoted licence or terms clause was
re-fetched and compared, versions and dates were re-read from the repositories and package indexes, and tools missing
from the first pass were added. The verifier's own copies are in `/home/user/gtr/lanes/guitar-tab/verify/raw/`
(pages, API records, licence files) and `/home/user/gtr/lanes/guitar-tab/verify/repos/` (blob-less clones). What
changed is listed in "Verification log" at the end of this file.

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
2. TabCNN (Wiggins and Kim, ISMIR 2019), github.com/andywiggins/tab-cnn , last commit 2019-06-27; Python 2.7; no weights
   in that repository; no license file. Train-from-GuitarSet only. Section "TabCNN". TabCNN weights published by others:
   item 44.
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
   2026-10-14), code MIT; weights on Zenodo 23361924 (record licence `cc-by-4.0`), linked from the sub-README
   `Noise2Fret_Aux_Losses/README.md`. Section "Noise2Fret".
10. Audio2Tab (Jackson Loth), Whisper-small fine-tuned to .gp5, up to 30 s, github.com/JackJamesLoth/Audio2Tab (last
    commit 2026-10-22); "We will host a checkpoint here soon!"; no license file. Section "Audio2Tab".
11. GuitarTab (Hsu et al., arXiv 2607.26440), MIDI to tab with an audio path through Basic Pitch,
    github.com/MusicGuitarTab/GuitarTab (last commit 2026-05-27); no weights; no license file. Section "GuitarTab".
12. gtrsnipe (Scott VR), MIDI / ABC / VexTab / ASCII tab converter with a Viterbi fretboard mapper and an audio path
    (Demucs, pYIN), github.com/scottvr/gtrsnipe v0.8.3 (last commit 2026-11-10); PolyForm Noncommercial 1.0.0 plus a paid
    commercial licence. RUNNABLE. Section "gtrsnipe".
13. nylon-amt (github.com/d-f/nylon-amt , last commit 2025-02-10), hFT-Transformer experiment; no weights; no license
    file at the repository root; `hftt_code/LICENSE` is Sony's MIT licence for the vendored hFT-Transformer code.
    Section "nylon-amt".
14. Papers found with guitar notes but no released model: Velocity Prediction in Automatic Guitar Transcription (arXiv
    2606.24912), Tone-informed Transformer / EGDB-PG (arXiv 2504.07406), real-tone augmentation (arXiv 2405.14679),
    procedural fingerpicking data (arXiv 2508.07987, linked repo empty), strumming directions (arXiv 2508.07973).
    Section "Audio-visual guitar transcription ... research".
15. Fretiq (arXiv 2607.18303), browser string classification for monophonic electric guitar. NO-CODE-FOUND. Research
    section.

### Notes or MIDI to string and fret

16. tuttut (Nathan Candre), MIDI to tab by HMM + Viterbi, any tuning; PyPI 0.0.7 (2026-11-04), MIT. RUNNABLE.
17. tutts, TypeScript port of tuttut, npm 0.1.0 (2026-06-09), MIT (npm metadata and the repository's LICENSE file).
    RUNNABLE in Node or a browser.
18. tayuya (Vipul Sharma), PyPI 0.0.4 (2019-09-14), last commit 2019-10-13, MIT. RUNNABLE.
19. tabsynth, PyPI 1.0.6 (2026-01-06), DP / Viterbi over candidate fingerings, Hz-and-seconds input (Python API; the
    `tabsynth` command runs demos only), MIT classifier (no LICENSE file in the sdist). RUNNABLE.
20. gtrsnipe (see 12): its mapper is a MIDI-to-tab tool with tuning, capo and scoring options.
21. Fretting-Transformer (Hamberger et al., ICMC 2025, arXiv 2506.14223), T5 with `CAPO<#>` and `TUNING<#,#,#,#,#,#>`
    conditioning tokens. NO-CODE-FOUND.
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
41. Others: EGSet12 (`cc-by-4.0`; the same Zenodo record also holds TabCNN weights, item 44), GuitarDuets (`cc-by-4.0`),
    SCORE-SET (CC BY-NC-SA 4.0 LICENSE file), AnimeTAB (licence not found), guitar_style_dataset video + audio (Zenodo
    10075352 `cc-by-4.0`), Chordonomicon (HF card `cc-by-nc-4.0`; trains Guitab's chord model), the Synchronize Dual Hands
    motion data (`dataset/LICENSE` CC BY-NC-ND 4.0), the GuiFiR video dataset (non-commercial dataset terms).

### Audio-visual and fingering research (section "Audio-visual guitar transcription and fingering estimation research")

42. TapToTab (arXiv 2409.08618, 2024), GuiFiR (IEEE Access 2026; dataset-preparation repository found, no model code),
    Asmar et al. (2021, unverified), guitar technique video + audio dataset (Data in Brief 2023), Synchronize Dual Hands
    (SIGGRAPH Asia 2024), Guitar Chord Diagram Suggestion (SMC 2024; code found, item 47), Visual Guitar Tab Comparison
    (ISMIR 2023 LBD), Chieppa et al. (IEEE Access 2025), and the symbolic fingering papers above.

### Commercial products and services

43. Klangio Guitar2Tabs and API, Songscription, Note2Tabs, AnthemScore, Songsterr: pointers to the apps-survey and
    hosted-apis lanes only.

### Added by the verification pass (2026-11-10)

44. TabCNN weights published by others: (a) Zenodo 11406378 (the EGSet12 record, `cc-by-4.0`) holds
    `best_TabCNN_tablature_trancription_model` (3,345,122 bytes), TabCNN trained with amt-tools on GuitarSet plus the
    DadaGP-derived "GuitarProFX" set (Pedroza et al., DAFx 2024); (b) huggingface.co/cstr/tabcnn-onnx (card
    `license: cc-by-4.0`, created 2026-07-20) holds ONNX exports, one trained by the card's author on GuitarSet and one
    re-exported from (a). RUNNABLE (ONNX). Section "TabCNN weights published by others". (Gap round 2: (a) and both
    ONNX files ran on the box, `trials.md` "Gap round 2".)
45. Guitar-Transcription-CNN-MTL (M. Eren Reyhanlıoğlu), github.com/ErenReyhanlioglu/Guitar-Transcription (last commit
    2026-10-13), code MIT; weights MIT on huggingface.co/MehmetErenn0/guitar-transcription-cnn-mtl and in
    github.com/ErenReyhanlioglu/Guitar-Transcription-Weights; trained on GuitarSet only; paper "under review at IEEE
    Access". Training and evaluation scripts on GuitarSet features; no single-file transcription command in the README.
    Section "Guitar-Transcription-CNN-MTL".
46. scorify (Aron Homberg), npm 0.4.0 (2026-10-31), MIT; arranges a note list onto a fretted instrument with tunings,
    capos and four-finger assignment by DP or beam search; JavaScript, no runtime dependencies. RUNNABLE in Node or a
    browser. Section "scorify". (Gap round 2: run on the box in Node 22, `trials.md` "Gap round 2".)
47. Guitar Chord Diagram Suggestion code (d'Hooge et al., SMC 2024), github.com/adhooge/guitar-chord-diagram-suggestion
    (last commit 2025-07-13): code GPL v3, `DATA_LICENSE` ODbL, checkpoints in the repository, Hugging Face Space demo.
    Suggests a chord diagram (a fret per string) for a chord label, given the previous chord's diagram. Section "Guitar
    Chord Diagram Suggestion".

### Added in gap round 2 (2026-11-11)

48. "Tämja hagelbössan" / "Taming the Shotgun" (Ottosson and Ölund Danielsson, Lund University bachelor thesis
    LU-CS-EX 2026-17, in Swedish): Basic Pitch with its minimum note length lowered to 40 ms, rule-based filters tuned
    with Optuna on GuitarSet, then a Viterbi string-and-fret step. Open Access PDF; no code link; no licence stated.
    NO-CODE-FOUND. Section "Tämja hagelbössan / Taming the Shotgun".

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
- Pretrained weights: none in the repository (file list: README.md, data/*.py and .sh, data/spec_repr/id.csv,
  demos/*.mp4, model/*.py). The README says weights are produced by training: "a folder for each fold of data will be
  created, containing the individual model's weights and predictions." TabCNN weights trained by other people are
  published elsewhere: see "TabCNN weights published by others" below.
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
  `https://zenodo.org/record/1422265/files/GuitarSet_audio_and_annotation.zip?download=1`, which is GuitarSet version 1.0.1.
  The Zenodo API lists that version's license as `cc-by-nc-4.0` (see the GuitarSet section for both versions).
- Author-reported numbers: not transcribed here (the paper PDF, Zenodo 3527800, by Andrew Wiggins and Youngmoo Kim
  per the Zenodo creators field, was not read today).

## TabCNN weights published by others (added by verify-docs-guitar-tab, 2026-11-10)

- Zenodo 11406378 (https://zenodo.org/api/records/11406378 , read 2026-11-10; licence id `cc-by-4.0`, published
  2024-06-01), the record of the EGSet12 evaluation set, also holds a file `best_TabCNN_tablature_trancription_model`
  (3,345,122 bytes). Its description: "The weights for the best performing model (TabCNN trained with "GuitarProFX")
  in the paper are also provided." The paper is Pedroza, Abreu, Corey, Roman, "Leveraging Real Electric Guitar Tones
  and Effects to Improve Robustness in Guitar Tablature Transcription Modeling", DAFx 2024 (arXiv 2405.14679v3; HTML
  read 2026-11-10): "The GTT model we train is TabCNN, using the implementation in AMT tools", trained on GuitarSet plus
  the synthetic set GuitarProFX, which "comprises 360 randomly-chosen solo performance tracks from DadaGP", rendered with
  tones from EGFxSet and the authors' own recordings. Author-reported (arXiv 2405.14679v3, Table 2, "TabCNN performance
  on EGSet12"): tablature F1 0.585 ± 0.084 for "+ GuitarProFX" against 0.447 ± 0.071 for TabCNN trained on GuitarSet only.
  The `cstr/tabcnn-onnx` card (below) says "The GuitarProFX (`amt-tools`) model natively uses **class 20 = silence,
  class k = fret k**." The file itself was not opened here, and how it loads was not tested. (Gap round 2,
  2026-11-11: it was downloaded (md5 equal to the record's) and run; it is a whole pickled amt-tools `TabCNN` object
  saved at `model-2500`, it loads with `torch.load(weights_only=True)` and an allow-list of the amt-tools, torch,
  numpy and Python built-in names its pickle lists, and its runs and scores are in `trials.md`, "Gap round 2".)
- Training code for this model, read 2026-11-11: the project page https://robust-guitar-tabs.github.io/ links "Code"
  to https://github.com/robust-guitar-tabs/code (blob-less clone, last commit 2024-06-03, `f50309a`). Its README:
  "**AMT-Tools**: A customized version of the Cwitkowitz AMT-Tools code ... including our dataset loader, for training
  models and saving datasets." and "This repository includes 16 Guitar Pro examples. For a full dataset, request access
  from DadaGP". Licences in the tree: the root `LICENSE` begins "Creative Commons Legal Code / CC0 1.0 Universal";
  `AMT-Tools/LICENSE.txt` begins "MIT License / Copyright (c) 2023 Frank Cwitkowitz". The training script
  `AMT-Tools/examples/papers/guitarProFx.py` runs six folds of 2,500 iterations, each tested on one GuitarSet player;
  the Zenodo record does not say which fold the published file comes from (UNVERIFIED; this matters for clips cut
  from GuitarSet, see `trials.md`). (Verifier, 2026-11-11: the README lists the script as "`guitarProFx` for
  GuitarProFx training and GuitarSet validation", and the script takes its training tracks only from its own
  `GuitarProFx` data folder, five splits of 120 tracks per fold, whose contents the repository does not list; that
  GuitarSet players are in the training data comes from the paper's text, "The third one also follows the same
  cross-validation but adds all the synthetic GuitarProFX tracks to the training split.")
- Hugging Face https://huggingface.co/cstr/tabcnn-onnx (HF API: created 2026-07-20, last modified 2026-08-02; card read
  2026-11-10 at https://huggingface.co/cstr/tabcnn-onnx/raw/main/README.md): card YAML `license: cc-by-4.0`. Files
  `tabcnn.onnx`, `tabcnn-gpfx.onnx`, `tabcnn-cqt.bin`. The card says: "Vanilla: trained here on **GuitarSet** (CC BY
  4.0). Attribution to GuitarSet required." and "GuitarProFX: weights from **Zenodo 11406378**
  (`best_TabCNN_tablature_trancription_model`, CC BY 4.0), the DAFx-24 GuitarProFX model". Input and output, as the card
  states them: "**Input** `input : float32[N, 192, 9, 1]`"; "**Output** `output : float32[N, 6, 21]` — per string, a
  **LogSoftmax** over 21 classes; **class 0 = closed**, class k = fret k−1."; CQT at sr 22050, hop 512, 192 bins, 24 bins
  per octave. Card author's figures: "`tabcnn.onnx`: held-out GuitarSet tab F1 0.745 (paper 0.748)"; `tabcnn-gpfx.onnx`
  "EGSet12 (12-track, frame-level tab F1) = 0.59 micro / 0.55 macro". The export scripts are in
  https://github.com/CrispStrobe/onnx_runtime_dart (`tool/tabcnn/`; repository `LICENSE` MIT, last commit 2026-09-18).
  (Gap round 2, read 2026-11-11 from a sparse blob-less clone at `7bdf47d`: the `LICENSE` begins "MIT License /
  Copyright (c) 2024-2026 CrispStrobe"; `tool/tabcnn/README.md` gives the vanilla training command `EPOCHS=4
  VAL_GUITARIST=5 python train.py features/ tabcnn.onnx` and "Held-out (guitarist-5) **tablature F1 0.745** (paper
  0.748)", and says "Data: **GuitarSet, CC BY 4.0** (`zenodo.org/records/3371780`, `audio_mono-mic` + `annotation`).
  Derived weights redistributable **with attribution**." and "the GuitarProFX-augmented weights (DAFx-24) aren't
  public", the last of which the model card, modified later, no longer says. `train.py` trains on every GuitarSet
  player except `VAL_GUITARIST` (default 5).) (Dates checked by the verifier, 2026-11-11: that README file was last
  changed in commit `8adf1ae` (2026-07-20, 20:50 UTC, per a blob-less clone); the card's commit list
  (huggingface.co/api/models/cstr/tabcnn-onnx/commits/main) shows the first card at 20:52 UTC that day, the gpfx file
  added at 21:25 UTC, and the last change on 2026-08-02; the first card version (`24be4a2`) says the
  GuitarProFX-augmented variant "has no public weights".)
- Card facts on the front-end, read 2026-11-11 (the card calls it "the #1 correctness risk (differs by variant!)"):
  both files use "the same CQT geometry (sr 22050, hop 512, n_bins 192, bins_per_octave 24, fmin C1 = 32.703 Hz)";
  for `tabcnn-gpfx.onnx` "per-clip dB, then [0,1]" (`librosa.amplitude_to_db(C, ref=np.max)` then min-max), for
  `tabcnn.onnx` "RAW magnitude, no log/norm" after "(peak-normalize the *waveform* first: y = librosa.util.normalize(y))".
  Output contract: "**class 0 = string silent/closed**, **class k = fret k−1** (class 1 = open, class 20 = fret 19)" for
  both files; for gpfx "The export **remaps** that to the shared contract above ... with a `roll`". Both files were run
  in gap round 2 with ONNX Runtime 1.31.1 (`trials.md`, "Gap round 2"): `tabcnn-gpfx.onnx` with the card's front-end
  gave the same per-string frame output as the Zenodo file on all 9,830 frames of 8 clips.
- Hugging Face https://huggingface.co/cstr/tabcnn-GGUF (created 2026-07-20; card YAML `license: cc-by-4.0`): GGUF
  conversions (f32, f16, q8_0, q4_k). The card: "**These are emission SCORES, not a decided tablature.** Turning them
  into a playable fingering needs a constrained decoder (one note per string, fret range, capo, hand span)."
- Training data licences: GuitarSet v1.1.0 is `cc-by-4.0` and v1.0.1 is `cc-by-nc-4.0` (GuitarSet section; the cards do
  not say which version was used; for `tabcnn.onnx` the export repository's `tool/tabcnn/README.md`, quoted above,
  names `zenodo.org/records/3371780`, the v1.1.0 record, noted by the verifier 2026-11-11); DadaGP has no dataset licence text and is shared for research by request (DadaGP
  section); EGFxSet's licence was not read (UNVERIFIED).
- `trials.md` lists the original TabCNN code with "Weights published: no", which holds for that repository; the files
  above were published by other people and were not run there. (Corrected in gap round 2: the Zenodo file and both
  ONNX files were run on 8 clips on 2026-11-11, runs r0591, r0592, r0594, r0595, r0601; `trials.md`, "Gap round 2".)

## amt-tools

- What: "Implements a customizable machine learning pipeline for AMT in PyTorch" (README), by Frank Cwitkowitz.
  https://github.com/cwitkowitz/amt-tools , last commit 2023-07-30 (`7822dc2`). PyPI `amt-tools` 0.3.2, uploaded
  2023-07-30 (https://pypi.org/pypi/amt-tools/json, read 2026-11-10); first PyPI upload 2021-06-08. README: "The
  framework is a work-in-progress."
- How it is called: Python library, `pip install amt-tools` (README). `setup.py` `python_requires='>=3.8'`,
  `install_requires` includes torch, librosa, mir_eval, jams, mido, mirdata, sounddevice, pynput. It contains a
  TabCNN re-implementation (`amt_tools/models/tabcnn.py`), GuitarSet loader (`amt_tools/datasets/GuitarSet.py`),
  CQT / HCQT / VQT feature modules, `amt_tools.inference.run_offline`, and estimators that turn tablature arrays into
  notes and MIDI. `amt_tools/tools/io.py` has `write_stacked_notes_jams(stacked_notes, jams_path)` (per-string notes to
  a JAMS file) and `write_notes(pitches, intervals, path, places=3)` (text); no Guitar Pro or MusicXML writer is in the
  file tree (commit `7822dc2`).
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
  download. Whether one is published elsewhere: UNVERIFIED (the GitHub releases page returned 403 here; a web search
  and a Hugging Face model search for "fretnet" on 2026-11-10 found none; a check of the author's other pages would
  settle it).
- Constraints: through amt-tools' `GuitarProfile` (tuning list and fret count); `examples/comparison.py` builds
  `tools.GuitarProfile(num_frets=19)`.
- License (code): MIT, `LICENSE.txt` (commit `d481054`, read 2026-11-10): "MIT License ... Copyright (c) 2023 Frank
  Cwitkowitz", standard MIT grant.
- Training data: GuitarSet (six-fold cross-validation scripts).

## SynthTab (dataset plus pretrained TabCNN models)

- What: "SynthTab: Leveraging Synthesized Data for Guitar Tablature Transcription", Yongyi Zang, Yi Zhong, Frank
  Cwitkowitz, Zhiyao Duan, ICASSP 2024 (arXiv https://arxiv.org/abs/2309.09085 , comment "Accepted to ICASSP
  2024"). Repository https://github.com/yongyizang/SynthTab (cloned 2026-11-10; last commit 2024-12-05, `6136f79`);
  project site https://synthtab.dev/ (read 2026-11-10 by the verifier: it links the paper, code and downloads and has no
  licence statement). arXiv abstract: "We procure SynthTab, a dataset derived from DadaGP
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
- Run here: the try agent loaded `finetuned/GuitarSet.pt` with amt-tools 0.3.2 (not with SynthTab's own scripts) and ran
  it on 8 shared clips in run r0139; output format, timings and scores are in `trials.md`. The README does not say what
  `non_finetuned/` holds (UNVERIFIED, as `trials.md` also notes).

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
  `model.transcribe(<audio path>, <MIDI path>)` (README examples such as `model.transcribe("saxophone_recording.wav",
  "output.mid")`) or `model.transcribe_audio_array(audio, "output.mid")` with audio loaded at `sr=16000`. README: "pip install hf-midi-transcription" (Option 1), but https://pypi.org/pypi/hf-midi-transcription/json
  returned HTTP 404 on 2026-11-10, so only the source install (Option 2) was found to exist.
- Input / output (README "Model Details"): "Input: Audio files (WAV, MP3, etc.)"; "Output: MIDI files"; "Sample Rate:
  16 kHz"; "Architecture: Convolutional Recurrent Neural Network (CRNN) with onset/offset/frame/velocity regression".
  The README's first line says "This code transcribes solo, monophonic audio from multiple instruments to MIDI"
  (quoted as written). `model.py` exposes `onset_threshold`, `offset_threshold` (default 0.3) and uses
  `segment_samples=10 * sample_rate`.
- Constraints: instrument choice and thresholds only; no tuning, capo or string parameters (no string output).
- Licenses, read 2026-11-10:
  - Code: no LICENSE file in the repository tree (commit `96f6797`). README "Model Details": "**License:** MIT";
    README "## License": "This project is licensed under the MIT License - see the LICENSE file for details." (the
    LICENSE file it names is not in the tree); `pyproject.toml` classifier "License :: OSI Approved :: MIT License".
  - Dependency `piano-transcription-inference` (the fork github.com/xavriley/piano_transcription_inference , last commit
    2025-12-09): no LICENSE file in its tree; its `setup.py` has the classifier "License :: OSI Approved :: MIT License",
    as does the upstream package (PyPI `piano-transcription-inference` 0.0.6, classifier MIT; read 2026-11-10).
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
  2; CPU is an allowed `--device`). Dependencies (pyproject): torch>=2.4, numpy, librosa, soundfile, pyguitarpro>=0.9,
  onnxruntime, safetensors, and `beat-this @ git+https://github.com/CPJKU/beat_this@b95c8ab0...` (a pinned commit); the
  `train` extra adds scipy, pedalboard, pretty_midi, music21 and yt-dlp.
- Input: audio "at 22.05 kHz mono" (README Architecture 1). Output: "`out/my_song/my_song.gp5` ... plus
  `my_song.tokens.txt` with the same tab as text tokens"; "for every frame and string, the fret (21 classes: silent or
  frets 0–19) and the onset probability" (Architecture 5); notes quantised to a beat grid from Beat This! (960 ticks
  per quarter, `--grid 240` = 16ths default); optional chord names. The token text is described in `guitab/gp5.py`
  (commit `b2537dc`): "Tokens: the song name, header tokens (downtune:, tempo:, start), then per beat its content -
  "note:s<string>:f<fret>" (optionally followed by "nfx:tie") or "rest" - and one "wait:<ticks>" giving the beat's
  duration (960 ticks per quarter), optionally preceded by "chord:<name>" (a chord name shown above the beat);
  "new_measure" closes a measure and "end" the song." and "One standard-tuned 6-string track, capo optional."
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
  - Beat tracker files on the model card (`beat_this_small0_int8.onnx`, `beat_this_final0_int8.onnx`): the card says
    they "are converted copies of [Beat This!](https://github.com/CPJKU/beat_this) (Foscarin et al., ISMIR 2024) and keep
    its MIT licence, in `LICENSE-beat-this.txt`" (that file begins "MIT License / Copyright (c) 2024 Institute of
    Computational Perception, JKU Linz, Austria"). The Beat This! README, "License" section
    (https://raw.githubusercontent.com/CPJKU/beat_this/main/README.md , read 2026-11-10): "The code and the published
    model weights are released under the [MIT license](LICENSE). Note that some of the training files are fully
    copyrighted or under limited Creative Commons licenses, and it is up to the user to assess whether this may impact
    their use case."
  - Training data: E15 "is trained on public datasets only" (GuitarSet, GAPS, a SynthTab subset of "428 selected
    fingerstyle songs (about 21 h ...)"); E19, and through distillation E24 and E25 (the default), also used a
    "Custom dataset (not distributed): real fingerstyle recordings with their tabs aligned to the audio". The chord
    model: "The chord model (about 70 min on a laptop CPU) needs [Chordonomicon](https://huggingface.co/datasets/ailsntua/Chordonomicon)
    in `data/chordonomicon/` and, for its real training and evaluation songs, the custom dataset and EGDB." Chordonomicon's
    Hugging Face card YAML says `license: cc-by-nc-4.0` (https://huggingface.co/datasets/ailsntua/Chordonomicon/raw/main/README.md ,
    read 2026-11-10). GAPS audio is fetched by `scripts/gaps_download.py` "from the dataset's YouTube links".
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
- Pretrained weights: none in the repository itself (largest files are source files, `model.pdf`, `model.png`,
  `architecture.jpg`), and the top-level README names none, but `Noise2Fret_Aux_Losses/README.md` says: "Find the code
  located inside the "./src" folder, and the weights of pre-trained models in [Zenodo](https://zenodo.org/records/23361924)".
  Zenodo 23361924 ("Noise2Fret", creators Simionato and Bigo, published 2026-10-14, licence id `cc-by-4.0`, access open;
  API record read 2026-11-10 by the verifier): "The repository collects the checkpoints for the pre-trained models";
  files `CheckpointsGOAT.zip` (111,317,004 bytes) and `CheckpointsGuitarSet.zip` (111,488,115 bytes). The try agent's
  `trials.md` lists the same record (not run there). That sub-README: "To run inference only on an existing pre-trained
  model, set the "train_model" flag to False."
- License (code): `LICENSE`: "MIT License / Copyright (c) 2026 Riccardo" (read 2026-11-10 from commit `b65a7ec`).
- Training data (abstract): "Experiments on GuitarSet and GOAT datasets". GOAT is non-commercial and by request (see
  GOAT section); the GOAT checkpoints above are published under the record's `cc-by-4.0`. The sub-READMEs link GOAT as
  https://zenodo.org/records/17706552 , which is the GOAT paper PDF record, not the restricted dataset record 15690894.

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
  model `openai/whisper-small` carries `license: apache-2.0` in its model card YAML
  (https://huggingface.co/openai/whisper-small/raw/main/README.md , read 2026-11-10 by the verifier). The inference
  script is at `src/infer.py` in the tree. The README's evaluation section also describes `src/eval.py --protocol
  noise2fret`, which "supplies **reference onset locations and the true tempo**".

## nylon-amt

- What: https://github.com/d-f/nylon-amt (last commit 2025-02-10, `a3a678f`). README: "This project makes use of
  hierarchical frequency time transformers in order to transcribe classical guitar audio into sheet music and
  guitar tabulature. The original implementation of this model can be found at https://github.com/sony/hFT-Transformer/".
  "First, a model is trained to transcribe solo piano recital pieces using the MAESTRO dataset"; "Alphatab will be
  used for tab visualization" (future tense in the README).
- Author-reported (README "MAESTRO dataset performance"): Precision 0.01, Recall 0.95, F1 0.02, and "It is clear that
  more than 0.2% of the dataset needs to be used for training."
- Weights: none in the repository. License: no license file at the root of https://github.com/d-f/nylon-amt (tree
  of `a3a678f`, read 2026-11-10). The subfolder `hftt_code/` has its own `LICENSE`, which begins "MIT License /
  Copyright (c) 2023 Sony Group Corporation" (the vendored hFT-Transformer code); no licence file was found for the
  files outside `hftt_code/`.

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
- Re-checked 2026-11-11 (gap round 2): the repository was still at `a9be933`; `LICENSE.md` still begins "# PolyForm
  Noncommercial License 1.0.0" and contains the three clauses quoted above word for word, and `LICENSE-COMMERCIAL.md`
  still reads as quoted. `pyproject.toml`: version 0.8.3, core dependencies `MIDIFile`, `midiutil`, `mido>=1.3`,
  `numpy>=2.1`, extras `audio` (librosa, soundfile, scipy, noisereduce), `separation` (demucs), `play`
  (python-rtmidi), `synth` (pyfluidsynth), `all` (the four before) and `test` (pytest, pytest-cov) (extras list
  completed by the verifier from the same file, 2026-11-11). `https://pypi.org/pypi/gtrsnipe/json` and `https://pypi.org/simple/gtrsnipe/` answered HTTP 404, so
  it is still not a published package; an install from the repository was refused by the box's permission system
  (`trials.md`, "Gap round 2"). README on tab input: "A tab states where each note is played, and gtrsnipe keeps that."
  and "**`--no-refinger`** never moves a note to another string. `--transpose` slides each note along its string, and
  stops with the list of notes that can't."

## tuttut (MIDI to tab, HMM + Viterbi)

- What: "A package to convert MIDI files to string instrument tabs" (pyproject), by Nathan Candre.
  https://github.com/natecdr/tuttut (last commit 2026-11-04, `329f7cb`); PyPI `tuttut` 0.0.7 uploaded 2026-11-04,
  first upload 2024-01-22 (https://pypi.org/pypi/tuttut/json). `requires-python = ">=3.9"`; dependencies numpy,
  pretty_midi, eel. README: "It can handle any tuning for any number of strings, and will do the arrangement
  accordingly."
- How it is called: GUI `tuttut` (README: "On Linux, tkinter needs `sudo apt install python3-tk`"); CLI `tuttut-cli
  <source.mid> <output_dir>` (entry point `tuttut.midi_tabs_cli:main`), which takes no tuning or fret option: it calls
  `Tab(source.stem, Tuning(), midi, output_dir = args.output_dir)` and `tab.to_ascii()` only (`tuttut/midi_tabs_cli.py`;
  the try agent's `trials.md` reports the same); Python, as in `tuttut/GUI/generate.py`: `f =
  pretty_midi.PrettyMIDI(...)`, `tuning = Tuning(strings, nfrets=...)`, `tab = Tab(name, tuning, f, weights=weights,
  output_dir=...)`, then `tab.to_ascii()` (writes `<output_dir>/<name>.txt`). `generate.py` does not call `to_json()`;
  `Tab.to_json()` is defined in `tuttut/logic/tab.py` and writes `<output_dir>/<name>.json`.
- Input: a MIDI file read with pretty_midi. README: "The tool works best for single-channel, single-instrument MIDI
  files". Output: ASCII tab text, or the `self.tab` structure as JSON (measures with notes, strings and frets). The
  try agent's `trials.md` (runs r0027, r0048) gives the JSON layout it observed: `tuning`, then `measures` of `events`
  with `time`, `time_ticks`, `measure_timing` and `notes` holding `degree`, `octave`, `string` (0 = thinnest) and
  `fret`; no MIDI pitch number, velocity or duration; out-of-range notes are moved by octaves (`fix_oob_notes`).
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
  repository `git+https://github.com/madisonrickert/tutts.git` (directory `packages/core`; blob-less clone by the
  verifier, last commit 2026-06-09, `527ad0e`; the tree also has `packages/alphatab`). Description:
  "Renderer-neutral MIDI to guitar-tab fingering engine (TypeScript port of tuttut)."
- README (npm): "it frames fingering as a Hidden Markov Model (fretboard positions = hidden states, note onsets =
  observations) and uses Viterbi to pick the sequence that is easiest to play under a fret-height/span/string-change
  cost metric. The core is pure (zero runtime dependencies), ESM-only". Call:
  `generateTab({ notes: [{ midi: 64, startBeats: 0, durationBeats: 1 }, ...], tuning: Tuning.standardGuitar() })`,
  then `tab.toAscii()`, `tab.toLines()`, `tab.toSystems()`, or `tab.data` ("the renderer-neutral result"). Notes are
  "`{ midi, startBeats, durationBeats }` (C4 = 60, time in quarter-note beats)". Runs in a browser or Node (ESM).
  Options table (README): `tuning` "E.g. `Tuning.standardGuitar()`, `Tuning.ukulele()`, or `new Tuning(["D4", "A3", ...],
  nfrets)`"; `quantizeGrid` "Snap note onsets to the grid before chord grouping, so near-simultaneous notes merge into one
  chord"; `tempo` "Only used to emit an optional `seconds` field on each event". The try agent's `trials.md` (run r0205)
  records the `tab.data` JSON it got, with `string` (0 = thinnest), `fret`, `midi` and `durationBeats` per note, and
  (onset, pitch, string, fret) lists identical to tuttut 0.0.7's on the eight clips it compared.
- License: npm metadata `"license": "MIT"` for 0.1.0. The repository's `LICENSE` (commit `527ad0e`, read 2026-11-10)
  begins: "MIT License / Copyright (c) 2026 Madison Rickert / tutts is a TypeScript port of tuttut
  (https://github.com/natecdr/tuttut), Copyright (c) 2023 Nathan Candre, distributed under the MIT License."
  `packages/core/LICENSE` and `packages/alphatab/LICENSE` begin "MIT License / Copyright (c) 2026 Madison Rickert".

## tayuya

- What: "Python library to generate guitar tabs from MIDI files" (README), Vipul Sharma.
  https://github.com/vipul-sharma20/tayuya (last commit 2019-10-13, `793d6a4`); PyPI 0.0.4 uploaded 2019-09-14.
  `install_requires=["mido", "music21"]`.
- How it is called (README): `from tayuya import MIDIParser`; `mid = MIDIParser('sample.mid', track=0)`;
  `print(mid.render_tabs())`; `mid.get_tracks()`; `mid.notes_played()` ("[{'note': 'C#5', 'time': 18}, ..."); `mid.get_key()`.
  Output: ASCII tab text, or a list of "(note, string, fret)" tuples (`Tabs.generate_notes`).
- Algorithm, as the code documents it (`tayuya/tabs.py`): "Find best position (fret and string) for a note" nearest
  to the last fret played, preferring notes in the detected scale (`note_nearest_to_fret(fret, note, scale_notes)`).
  Tuning: a fixed note-to-string table (`constants.NOTE_TO_STRING`); no tuning or capo argument found. README
  limitations: "Works only for guitar solos. Implementation for determination and rendering of chords is not done yet."
  and "Works only for standard tuning (E A D G B E)"; its to-do list has "Add way to handle non standard tuning". The try
  agent's `trials.md` (run r0117) adds, from running it: the position table has no fret-0 entries, so no open string is
  ever written, and notes in octave 2 are looked up an octave up while the returned tuple keeps the original note name.
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
  Python 3.10. The console script `tabsynth` (entry point `tabsynth.cli:main`) is, in the README's words, "a demo CLI":
  `tabsynth help`, `tabsynth demo-notes`, `tabsynth demo-chords`, `tabsynth demo-mixed`; no file-input command is
  documented.
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
- Constraints (paper text, arXiv HTML): "The conditioned model contains a CAPO<#> and TUNING<#,#,#,#,#,#> token in
  the input to condition the model for more flexibility and control over the outputs."; "By removing the conditioning
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
- Fine-tuning data, in the paper's Section 4.2 (arXiv HTML, read 2026-11-10 by the verifier): "The second phase of
  training is a finetuning on precisely annotated guitar performances from the training splits of Riley et al. [ 12 ]
  and GuitarSet [ 18 ]", where [12] is "High resolution guitar transcription via domain adaptation" (ICASSP 2024), the
  paper whose data is the François Leduc dataset (Leduc HF card: "Used to train a state-of-the-art (at the time)
  audio-to-MIDI transcription model for guitar in the paper above"). Section 5.1: "We use the training splits from Riley
  et al. [ 12 ] , with 61 pieces in the training set, 8 in the validation set, and 9 in the test set".
- Author-reported: a user study ("15 guitarists"); Table 1, "Summary of quantitative analysis, showing maximum, mean
  and median “stretch” of chords in the tablature, defined as the maximum fret distance between any two notes in the
  chord. We also report the percent agreement with the ground truth note-string assignment. All metrics are averaged
  over the entire withheld test set." Columns Max Stretch / Mean Stretch / Median Stretch / % Agree: Ground Truth 6 /
  1.04 / 0 / –; Ours 12 / 1.84 / 1 / 73.58; MuseScore 10 / 1.19 / 1 / 62.51; Guitar Pro 8 12 / 0.78 / 0 / 62.27;
  TuxGuitar 18 / 2.03 / 1 / 55.42. The paper compares against "one commercially available and two open-source
  implementations of automatic tablature systems" (Guitar Pro 8, MuseScore, TuxGuitar).

## GuitarTab (explicit note-event tokenization, arXiv 2607.26440)

- What: "Explicit Note-Event Tokenization and Pitch-Validity Constrained Decoding for MIDI-to-Tablature
  Transcription", Ting-Kai Hsu, Wei-Chin Wang, Kai-Xi Hong, Yu-Hua Chen, arXiv 2607.26440v1 (2026-07-29). Abstract:
  "Our code will be released at:https://github.com/MusicGuitarTab/GuitarTab". That repository exists (cloned
  2026-11-10; last commit 2026-05-27, `4f0bf21`).
- Algorithm (abstract): note-event tokens plus TAB tokens in the decoder; "a pitch-validity constrained decoding
  strategy that masks pitch-invalid TAB candidates during generation". README "Codebase" tree: `model.py` under `src/`,
  with the comment "# FrettingTransformer (T5-small)".
- How it is called (README): `python train.py ...` (Hydra configs), `inference.py`, and `demo.py` ("# Single file:
  audio/MIDI → tab" in the tree): "Run on a single audio or MIDI file and get ASCII tablature + MIDI output", as
  `python demo.py --input "Demo/my_song.mp3" --checkpoint outputs/<exp_dir>/best_model.pt --max-bars 8 --output
  "Demo/my_song_tab.txt" --output-midi "Demo/my_song.mid"`; "Supports `.mid`, `.mp3`, `.wav`, `.flac`, `.ogg`, `.m4a`.";
  "Audio input requires: `pip install basic-pitch onnxruntime`". The README links `docs/OUTPUT_FORMAT.md` "for output
  token format"; that file is not in the tree of `4f0bf21`.
- Weights: none published; the README's checkpoints are the user's own training outputs (`outputs/` folder).
- License: no license file found at https://github.com/MusicGuitarTab/GuitarTab (tree of `4f0bf21`, read 2026-11-10).
- Training data (abstract): DadaGP and "Francois Leduc" (folder `10984521/`, the Zenodo id of the Leduc dataset).

## midi2tab_Deconvolutions (Kaliakatsos-Papakostas et al.)

- What: "A Machine Learning Approach for MIDI to Guitar Tablature Conversion", arXiv 2510.10619v1 (posted
  2025-10-12; comment "Proceedings of the 19th Sound and Music Computing Conference, June 5-12th, 2022"). Code:
  https://github.com/maximoskp/midi2tab_Deconvolutions (last commit 2022-02-08, `d4b0f3e`), README "Transcribing guitar
  tabs from MIDI input." The README lists `reset_files_structure.py`, `run_00_make_events.py`,
  `run_01_make_pianoroll_tab.py`, `run_01_make_random_pr_tab.py`, then `train_*.py` and `make_*.py`, and says "conda env
  create -f guitar_tab.yml"; in the tree the `train_*` and `make_*` scripts are under `flat_tab_in_CNN/`, and no
  `guitar_tab.yml` is present (20 files, read 2026-11-10). `flat_tab_in_CNN/gp_files/` holds five `.gp4` files.
- Constraints (abstract): "requires a basic assumption about how much fingers can stretch on a fretboard; only
  standard 6-string guitar tuning is examined."
- Weights: none found in the tree. License: no license file found (tree of `d4b0f3e`, read 2026-11-10).

## From MIDI to Rich Tablatures (Bontempi et al.)

- What: arXiv 2407.09052v1 (2024-07-12), Pierluigi Bontempi, Daniele Manerba, Alexandre D'Hooge, Sergio Canazza.
  Abstract: "The basic fingering is derived by solving a constrained and multi-attribute optimization problem, which
  derives the best position of the fretting hand, not just the finger used at each moment. Then, by analyzing
  statistical data from the mySongBook corpus, the most common clichés and biomechanical feasibility, articulations,
  and expressive techniques are introduced. Finally, the obtained output is converted into MusicXML format".
- How the authors ran it (arXiv HTML, Section 2.3): the melody is read with Mido into a dataframe, which "is then
  processed through the IBM ILOG CPLEX Optimization Studio software, v20.1.0 ( https://www.ibm.com/products/ilog-cplex-optimization-studio
  , last accessed: 2024/03/07), in which we implemented our optimal fingering problem as a static and compact
  Mathematical Programming formulation." CPLEX's licence terms were not read here (UNVERIFIED).
- Code: NO-CODE-FOUND. The arXiv HTML links https://github.com/mido/mido , the CPLEX product page, a Guitar Pro page and
  the TABASCO project page http://algomus.fr/tabasco/ ("to which part of the authors belong"), which links no code
  repository (read 2026-11-10).

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
- From the try agent's `trials.md` (runs r0145, r0151, r0155; LilyPond 2.24.3 from Ubuntu): the property documentation
  in `define-context-properties.scm` says "The tablature auto string-selecting mechanism selects the highest string
  with a fret at least `minimumFret`"; the choice is made one chord at a time; a note that fits no string is left out
  with "warning: No string for pitch ..." (not moved an octave); `maximumFretStretch` defaults to 4; `restrainOpenStrings`
  changed nothing unless `minimumFret` was above 0; a string mark (`g\4`) moved that one note and left the others as
  they were (r0155); the engraved output is PDF, PNG, SVG or PostScript, with no text, JSON or MusicXML tab export, so
  the trial read string and fret through a Scheme `tablatureFormat` hook.
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
  JavaScript file (`fingering_core.js`, 11,599 bytes at `5e4fb42`), whose header says "guitar fingering core (port of
  mscx2tab.py)" and "Pure JavaScript, loadable from MuseScore QML and from Node." (the author's statement; the file
  also contains the QML directive `.pragma library`; running it in Node was not tried, UNVERIFIED). It keeps
  `TUNING = [40, 45, 50, 55, 59, 64]` by default and `setTuning(arr, maxFret)` replaces it.
- License: `LICENSE` begins "GNU GENERAL PUBLIC LICENSE / Version 3, 29 June 2007" (commit `5e4fb42`, read
  2026-11-10); a `COPYRIGHT` file names the author and ends "- FretPath (GPL-3.0)".

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
- Token format, from the repository's example `examples/slapbass.gp3.tokens.txt`: one token per line, beginning
  `artist:unknown`, `downtune:0`, `tempo:120`, `start`, `new_measure`, then note tokens with an instrument prefix such as
  `bass:note:s2:f16`, effect tokens such as `nfx:slide:1`, and `wait:240`. Tick size, two sources that differ:
  `dadagp.py` starts its decoder clock at 960 with the comments "since the first measure start on beat 1 (960 ticks)"
  and "1-indexed quarter notes i guess"; the GuitarTab README's description of DadaGP tokens says "wait: duration in
  ticks (480 ticks = quarter note)". Not settled here (UNVERIFIED). Related formats: Guitab writes `.tokens.txt` with the same
  header tokens and `note:s<string>:f<fret>` without an instrument prefix, with the song name instead of an `artist:`
  token (Guitab section); GOAT has "a text-like token encoding"; the GuitarTab repo reads `.tokens.txt` with
  `src/dadagp_parser.py` (README tree comment "# .tokens.txt parser"). Whether `dadagp.py decode` reads Guitab's files
  was not tested.

## Guitar-Transcription-CNN-MTL (Reyhanlıoğlu; added by verify-docs-guitar-tab, 2026-11-10)

- What: README (https://github.com/ErenReyhanlioglu/Guitar-Transcription , blob-less clone 2026-11-10, last commit
  2026-10-13, `ec63f36`): "Code for "Automatic Guitar Tablature Transcription using Dual Representation Feature Fusion
  and Instrument Informed Multi-Task Learning"." and "The paper is currently under review at IEEE Access."
  `pyproject.toml`: name `guitar-transcription`, version 0.1.0, `requires-python = ">=3.12,<3.14"`.
- Input (README "Acoustic representation"): "The HCQT stacks six CQT planes (harmonics 0.5, 1, 2, 3, 4, 5; 36 bins per
  octave over four octaves from E2, 144 bins per plane)"; "The Mel-spectrogram (256 bands, 2048-point FFT)"; "Audio is
  resampled to 22.05 kHz with a hop of 512 samples, and the model sees a 19-frame context window centred on the target
  frame (about 209 ms on each side)." Output: "The tablature head is a two-layer MLP with a 256-unit hidden layer
  (dropout 0.5), projecting to a 6x21 output covering six strings and 21 fret states (frets 0 to 19, plus silence)."
  Auxiliary outputs: fret region (5 classes), string activity (6), pitch class (12), multi-pitch (49, MIDI 40-88).
- How it is called (README "Reproducing the results"): `extract_features.py --guitarset-root ... --output-dir ...` (in
  a separate Python 3.11 environment with amt-tools and guitar-transcription-continuous), `train.py --config
  configs/cnn_mtl_config.yaml ...`, `evaluate.py --experiment-path ... --data-root ...`. These run on GuitarSet feature
  files; no command for transcribing an arbitrary audio file is documented in the README. README: "Training on CPU works
  but is impractical at full scale."
- Weights: https://huggingface.co/MehmetErenn0/guitar-transcription-cnn-mtl (HF API: created 2026-07-27, last modified
  2026-10-12; card YAML `license: mit`): `cnn_mtl_20260929_191206/fold_<1-6>/model_best.pt` ("Model weights only
  (state_dict), use this for inference"), and the same files in https://github.com/ErenReyhanlioglu/Guitar-Transcription-Weights
  (whose `LICENSE` begins "MIT License / Copyright (c) 2026 M. Eren Reyhanlıoğlu"). The README: "They load into
  `src/models/cnn_mtl.py` with `configs/cnn_mtl_config.yaml`".
- License (code): `LICENSE` begins "MIT License / Copyright (c) 2026 M. Eren Reyhanlıoğlu"; README "## License": "MIT.
  See [LICENSE](LICENSE)."
- Training data: README: "Experiments use [GuitarSet](https://guitarset.weebly.com/) (annotations version 1.1.0)";
  GuitarSet v1.1.0 is `cc-by-4.0` on Zenodo (GuitarSet section).
- Author-reported (README Table 1, GuitarSet six-fold leave-one-player-out): tablature F1 0.776 ±0.034 and TDR 0.943
  ±0.025 for "HCQT + Mel | Casc. MT†"; README Table 6: CPU real-time factor 0.615 ("CPU: median of 5 runs with six
  threads. Feature extraction is excluded").
- Constraints: `src/utils/guitar_profile.py` ("Instrument tuning/fret-range profile", README tree); no capo or tuning
  option is described in the README.

## scorify (added by verify-docs-guitar-tab, 2026-11-10)

- What: npm `scorify` 0.4.0, published 2026-10-31 (https://registry.npmjs.org/scorify , read 2026-11-10), repository
  https://github.com/kyr0/scorify (blob-less clone, last commit 2026-10-31, `8f8c25c`). README: "Instrument-aware music
  arrangement, transposition, and fingering constraints for vanilla JavaScript. TypeScript source, browser-native ESM, no
  external runtime dependencies."
- How it is called (README "Arrange a score"): `createScore([...notes], { tempoMap, keyMap })` with notes such as `{ id,
  pitch: parsePitch("C4"), onset: q(0), duration: q(1), partId, voiceId, role }`, then `arrange(source, { instrument,
  mode, transform, player: { level, overrides }, adaptation })`; instruments such as `classicalGuitar({ capoFret: 2 })`
  or `createFrettedInstrument("custom", "My tuning", [...])`. README: "All pitches are **sounding** pitches." and "Time
  is a normalized `[numerator, denominator]` measured in quarter notes."
- Output (README "Modes and results"): "`success` includes output score, fingerings, separate source/realized harmony,
  edits, source mapping, difficulty components, model versions, effective profile, and search statistics." Other
  statuses: `infeasible`, `search-exhausted`, `invalid-input`, `unsupported`, `cancelled`.
- Constraints (README): "Configurable fretted strings, tunings, capos and geometry"; "Per-string configuration accepts
  `openPitch`, `capoFret`, `fretCount`, stable `id`, and tab `number`. Frets are absolute from the original nut;
  displayed relative fret = absolute fret − that string's capo."; player options include `allowBarre`,
  `maxBarreStrings`, `rightHand: 'pick' | 'strum'`; search: "exhaustive reference, exact dynamic programming, or bounded
  beam search".
- Inputs it does not read: README "First-release limitations": "... audio/MIDI/MusicXML import ... remain future work."
  A separate agent skill and CLI in the repository, `skills/score-import/`, "converts MusicXML, MXL, ABC and MIDI into
  scorify Score JSON" (README).
- License: npm metadata `"license": "MIT"`; `LICENSE` begins "MIT License / Copyright (c) 2026 Aron Homberg" (commit
  `8f8c25c`).
- Gap round 2 (read 2026-11-11 from the npm package 0.4.0, still the `latest` tag): `package.json` description
  "Instrument-aware arrangement, transposition, fingering constraints, and plucked-string synthesis."; the package's
  `LICENSE` begins "MIT License / Copyright (c) 2026 Aron Homberg"; `THIRD-PARTY-LICENSES.txt` lists 9 bundled
  `@tonaljs/*` modules, each "License: MIT". The note model has no string field; the README's cost hook ("A direct
  `scoring: { id, cost(frame, realization) }` hook must be pure, deterministic, finite and nonnegative. ... It cannot
  override hard validity or the musical-fidelity priority.") is the documented way to bias a note toward a string. Run on
  the box on 2026-11-11 (runs r0621, r0623, r0630, r0631, r0633, r0635, r0641; `trials.md`, "Gap round 2").
- Also in the 0.4.0 package (verifier, 2026-11-11, from its `package.json` exports and README; not tried): optional
  subpaths `pitch-detect`, `pitch-worklet` and `tuner`; README: "`scorify/tuner` listens too: `createPitchInput` feeds
  the microphone to a YIN pitch-detector AudioWorklet in real time, and `tuningTargets`/`nearestTarget` name the string
  being tuned and how many cents it is off". The `songs` subpath also declares a `suggestCapo` function (not read
  further).

## Guitar Chord Diagram Suggestion (d'Hooge et al.; added by verify-docs-guitar-tab, 2026-11-10)

- What: code for "Guitar Chord Diagram Suggestion for Western Popular Music", Alexandre d'Hooge, Louis Bigo, Ken
  Déguernel, Nicolas Martin, SMC 2024 (arXiv 2407.14260). The paper's arXiv HTML says: "The Python implementation is
  openly available, along with a demonstration website, at algomus.fr/code ." That page (https://algomus.fr/code , read
  2026-11-10) links https://github.com/adhooge/guitar-chord-diagram-suggestion (blob-less clone, last commit 2025-07-13,
  `98554b5`) and the Hugging Face Space https://huggingface.co/spaces/adhooge/guitar-chord-diagram-suggestion .
- How it is called (README): Python 3.10, `pip install -r requirements.txt` (pins torch 2.3.0, lightning 2.2.5 and a
  music21 fork); `python -m cds.train -n <name>`, `python -m cds.test -s <path/to/ckpt> -T`. Data rows are chord
  shapes per string such as `'3.2.0.0.3.3'` and `'x.x.0.2.3.0'` (README example).
- Weights: 34 `.ckpt` files in the tree, 16 under `data/DadaGP/` and `data/mySongBook/` and 18 under `logs/` (README:
  "We provide checkpoints of the models we trained for the paper (in the `logs/` folder)").
- Licences, README "### Licensing": "The code is released under a GPL-v3.0 license, refer to the `LICENSE` file for
  more details." and "The chord data is released under an ODbL license, refer to the `DATA_LICENSE` file for more
  details." `LICENSE` begins "GNU GENERAL PUBLIC LICENSE / Version 3, 29 June 2007"; `DATA_LICENSE` begins "## ODC Open
  Database License (ODbL)". The Space card YAML says `license: other`.
- Training data: DadaGP (research access by request, DadaGP section) and mySongBook (terms not read here).

## Tämja hagelbössan / Taming the Shotgun (Lund University bachelor thesis, 2026; added in gap round 2)

- What: Ross Ottosson and Ludvig Ölund Danielsson, "Tämja hagelbössan: En domänspecifik optimeringspipeline för
  generering av spelbar gitarrtabulatur", alternative title on the record "Taming the Shotgun: A domain-specific
  optimization pipeline for generating playable guitar tablature"; Lund University, Department of Computer Science,
  course EDAL01, type "M2 - Bachelor Degree", series LU-CS-EX, report number 2026-17, language Swedish, added to LUP
  2026-05-22. Record https://lup.lub.lu.se/student-papers/record/9226851 and PDF
  https://lup.lub.lu.se/student-papers/record/9226851/file/9226852.pdf (both read 2026-11-11; 35 pages, 2,458,481
  bytes, title page dated "18 maj 2026").
- Method, from the English abstract: "This study investigates how a general-purpose AMT model (Spotify’s Basic Pitch)
  can be adapted to automatically generate physically playable guitar tablature. This is done by lowering the model’s
  minimum note length threshold so that fast musical passages are successfully captured, albeit at the cost of massive
  over-detection of false ghost notes (a “shotgun” effect)." and "a domain-specific filtering pipeline was developed
  and optimized to eliminate unwanted noise based on the physical and acoustic properties of the guitar. The purified
  notes were subsequently processed using a statistical algorithm to calculate biomechanically ergonomic fingerings."
  Details from the Swedish body (sections 5.1 to 5.5; English renderings here, not quotes): Basic Pitch's minimum note
  length lowered from 127.7 ms to 40 ms, onset and frame thresholds searched; a high-pass filter (searched between 20
  and 82 Hz) before Basic Pitch; MIDI filters on velocity, short low "thump" notes, the pitch range MIDI 40 to 88, a
  merge of same-pitch notes less than 50 ms apart (switched off after the ablation showed it lowered F1 in every
  category), removal of notes 12, 19 or 24 semitones above a simultaneous note, polyphony limits (notes at most 1.5 s,
  background ringing cut after 0.4 s) and a minimum duration lowered in passages above 9 notes per second ("Shred
  filter"); the parameters were tuned with Optuna (precision and recall as objectives; 12 hours for the solo takes and
  12 hours for the comp takes); `htdemucs_6s` separates the guitar before all this for full mixes. Tab step (section
  5.4): notes starting within ±50 ms form a chord; every combination of positions with one note per string and at most
  4 frets between the highest and the lowest fret of the fingering is a state; Viterbi minimises a transition cost
  K = w_fret·ΔB + w_string·ΔS − p_open·N_open (hand movement along the frets and across the strings, open strings
  rewarded), whose weights were tuned with Optuna to maximise the share of notes on GuitarSet's annotated string.
  Section 3.1: six strings, 22 frets, standard tuning; no capo or tuning input is described.
- Data and evaluation: GuitarSet (all five genres, solo and comp takes), scored with mir_eval (onsets within ±50 ms,
  pitch within a quarter tone). Section 7.11: "Den data som användes för att generera de optimerade parametrarna
  användes också för att testa resultaten." (the data used to generate the optimised parameters was also used to test
  the results). Section 7.9: four songs by other artists (one of them a fingerstyle version) were run through the whole
  pipeline and judged by the authors by visual inspection and listening to the MIDI, and by looking at the tab's
  ergonomics, with no ground truth.
- Author-reported numbers (not checked here): Table 5, Basic Pitch with its default 128 ms against the 40 ms baseline:
  solo precision / recall / F1 0.647 / 0.705 / 0.671 against 0.493 / 0.760 / 0.594, comp 0.447 / 0.464 / 0.449 against
  0.374 / 0.528 / 0.433; Table 1, after the filters: F1 0.72 to 0.77 for solo and 0.37 to 0.53 for comp, per genre;
  Table 3, share of notes on the annotated string: solo 40.69 %, comp 76.34 %; Table 4, chord sequences with no playable
  fingering: comp 11.13 % on the 40 ms baseline and 0.88 % after filtering, solo 1.41 % and 0.01 %.
- Code and licence: no repository, code or data link in the PDF (its URLs are all in the reference list) and none on
  the record page; the record marks it "Open Access" (`info:eu-repo/semantics/openAccess` in the page metadata) and
  states no licence; the PDF states none. Not runnable: NO-CODE-FOUND.
- Relation to this lane's runs: the same handoff, Basic Pitch notes into a Viterbi string-and-fret step, ran here with
  Basic Pitch's default settings and no filtering (`trials.md`, "Handoff runs", r0240). The audio-to-notes lane is the
  one that runs Basic Pitch itself.

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
  E15 / E19 / E24 / E25 (with other data); the TabCNN in Zenodo 11406378 (with GuitarProFX) and `cstr/tabcnn-onnx`'s
  `tabcnn.onnx`; the CNN-MTL folds (annotations version 1.1.0 per its README); Noise2Fret's `CheckpointsGuitarSet.zip`.
  On the version (1.0.1 `cc-by-nc-4.0` or 1.1.0 `cc-by-4.0`): the CNN-MTL README says "annotations version 1.1.0"; the
  Guitab README and Noise2Fret's sub-READMEs link the 1.1.0 record (zenodo.org/records/3371780); TabCNN's README links
  the 1.0.1 file; the SynthTab README, the Zenodo 11406378 record and the `cstr` cards name no version. The shared test
  input R1 of this project is drawn from GuitarSet (PLAN.md).

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
  FX2 Plugin" (2024-07, `cc-by-4.0`); 19789500 "EGDB-PG" (2025-04, `cc-by-4.0`, two files: `EGDB_FLAC_bundle.zip` of
  135,406,622,188 bytes and `random_presets_json.rar`). The EGDB-PG project page
  (https://ss12f32v.github.io/Guitar-Transcription-with-Amplifier/ , read 2026-11-10) lists "Dataset-WAV(Upon Request)
  Dataset-FLAC(Zenodo)".
- Weights trained on it that are published: SynthTab `finetuned/EGDB.pt`, `non_finetuned/EGDB.pt`. Guitab's README uses
  EGDB as a test set ("EGDB electric guitar test (25 clips, clean DI, never seen in training)") and for its chord model:
  "for its real training and evaluation songs, the custom dataset and EGDB" (README section on training the chord
  model).

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

- Pedroza, Taheri, Abreu, Corey, Roman per the Zenodo creators field (arXiv 2501.03720 lists four authors: Pedroza,
  Abreu, Corey, Roman), ICASSP 2025. Zenodo 14963133 (2025-04-06), `cc-by-4.0`.
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
- Used by: Noise2Fret (checkpoints trained on GOAT published on Zenodo 23361924 under the record licence `cc-by-4.0`;
  Noise2Fret section) and Audio2Tab (no checkpoint published on 2026-11-10).

### François Leduc dataset (FLGD)

- See the Riley et al. section: Zenodo 10984521 (restricted, research by request, scores sold by François Leduc) and the
  HF card `license: mit`. Used by the HRGT model (`guitar-fl.pth`), Fretting-Transformer, MIDI-to-Tab (fine-tuned on
  "the training splits of Riley et al. [ 12 ] and GuitarSet [ 18 ]", Section 4.2, where [12] is the HRGT paper; the
  MIDI-to-Tab paper does not name Leduc itself) and the GuitarTab repo.

### Smaller or newer sets found

- EGSet12 (from arXiv 2405.14679, robust-guitar-tabs.github.io): Zenodo 11406378 (2024-06-01), `cc-by-4.0`, "twelve real
  & original solo electric guitar performances", files `01`–`12` as `.gp`, `.jams` and `.wav`, plus the TabCNN weights
  file `best_TabCNN_tablature_trancription_model` (see "TabCNN weights published by others").
- GuitarDuets (arXiv 2507.01172): Zenodo 12802440 (2024-07-23), `cc-by-4.0`, `GuitarDuets.zip` (3,534,777,196 bytes).
- SCORE-SET (arXiv 2507.18723): https://github.com/DjentleViBe/SCORE-SET (last commit 2025-12-31), README: "SCORE-SET [1]
  is a dataset composed of .gp5 [2] transcribed files, derived from the GiantMIDI [3] and MAESTRO [4] datasets."; `LICENSE`
  begins "Attribution-NonCommercial-ShareAlike 4.0 International".
- AnimeTAB (arXiv 2210.03027, 2022): the paper says "Our data and code have been made publicly available"; where, and
  under what licence, was not found in the arXiv HTML (UNVERIFIED).
- Rhythm Guitar Tablature Continuation data: Zenodo 21304818 ("Rhythm Guitar Tablature Continuation through Picking
  Pattern Generation", v1.0.0, 2026-07, creators D'Hooge, Déguernel, Bigo), `cc-by-nc-sa-4.0`, access "restricted"
  (Zenodo API record read 2026-11-10 by the verifier).
- Chordonomicon (Hugging Face dataset ailsntua/Chordonomicon, created 2024-10-29, one file `chordonomicon_v2.csv`): card
  YAML `license: cc-by-nc-4.0` (read 2026-11-10). Guitab's chord model is trained on it (Guitab section).
- Synchronize Dual Hands motion data (https://github.com/xupei0610/guitar , last commit 2025-07-29): the repository's
  `LICENSE` is "MIT License / Copyright (c) 2024 徐霈 (Pei Xu)", and `dataset/LICENSE` is the "Creative Commons
  Attribution-NonCommercial-NoDerivatives 4.0 International Public License" (both read 2026-11-10).
- GuiFiR video dataset (https://github.com/kmu-ee-ailab/guifir_dataset , last commit 2026-10-29): see the research table
  row; `DATASET_TERMS.md`: "The dataset assets are provided for non-commercial research, education, and reproducibility
  of the GuiFiR work."

### Which published weights were trained on which data (from the sections above)

| Published weights | Where | Weights licence as stated | Training data named by the authors |
|---|---|---|---|
| SynthTab `SynthTab-Pretrained.pt`, `finetuned/*.pt`, `non_finetuned/*.pt` | in the GitHub repo | repo LICENSE file CC BY 4.0; README says the dataset is CC BY-NC 4.0 | SynthTab (from DadaGP); fine-tunes on EGDB, GuitarSet, IDMT |
| Guitab E25 / E24 / E19, tab LM, chord model | huggingface.co/danmor/guitab | CC BY-NC-SA 4.0 (card); the two Beat This! ONNX files MIT (`LICENSE-beat-this.txt`) | GuitarSet, GAPS, SynthTab subset, a non-distributed custom set; chord model Chordonomicon (HF card `cc-by-nc-4.0`) plus the custom set and EGDB |
| `guitar-gaps.pth`, `guitar-fl.pth` | huggingface.co/xavriley/midi-transcription-models | MIT (card) | GAPS; François Leduc dataset |
| TabCNN + GuitarProFX (`best_TabCNN_tablature_trancription_model`) | Zenodo 11406378 | record `cc-by-4.0` | GuitarSet + GuitarProFX (360 DadaGP tracks rendered with EGFxSet and the authors' recorded tones) |
| `tabcnn.onnx`, `tabcnn-gpfx.onnx`; GGUF copies | huggingface.co/cstr/tabcnn-onnx , huggingface.co/cstr/tabcnn-GGUF | CC BY 4.0 (cards) | GuitarSet (vanilla, trained by the card's author; players 00 to 04 per the export repository's README and `train.py`, gap round 2); the Zenodo 11406378 model (gpfx) |
| CNN-MTL, six folds plus ablation runs | huggingface.co/MehmetErenn0/guitar-transcription-cnn-mtl ; github.com/ErenReyhanlioglu/Guitar-Transcription-Weights | MIT (card YAML and the weights repository's LICENSE) | GuitarSet (six-fold leave-one-player-out) |
| Chord diagram suggestion checkpoints (`.ckpt`) | github.com/adhooge/guitar-chord-diagram-suggestion | repository LICENSE GPL v3 (code); chord data ODbL (`DATA_LICENSE`); HF Space card `license: other` | DadaGP and mySongBook chord pairs |
| Noise2Fret `CheckpointsGOAT.zip`, `CheckpointsGuitarSet.zip` | Zenodo 23361924 | record `cc-by-4.0` | GOAT (`cc-by-nc-4.0`, restricted, "non-commercial only"); GuitarSet |
| Original TabCNN, inhibition, FretNet, Audio2Tab, GuitarTab, TART, MIDI-to-Tab, Fretting-Transformer | none found | n/a | GuitarSet (first three); GOAT + SynthTab + DadaGP; DadaGP + Leduc; GuitarSet / EGDB eval; DadaGP pre-training + Riley et al. (Leduc) and GuitarSet fine-tuning; DadaGP + GuitarToday + Leduc |

## Audio-visual guitar transcription and fingering estimation research, 2019 to 2026

Found through the arXiv API (queries listed under "Tool list"), Zenodo searches and web searches on 2026-11-10. arXiv
is well covered; other venues (IEEE Xplore, ACM, ISMIR proceedings) were searched only through web search, so this
list is not complete for them. "Code" means a repository link found in the paper or on its page.

### Video or video plus audio to tab, fingers or frets

| Year | Work | What goes in and out (as the authors describe it) | Code / data |
|---|---|---|---|
| 2024 | TapToTab, Ghaleb et al., arXiv 2409.08618 (2024-09-13) | "YOLO models for real-time fretboard detection, and Fourier Transform-based audio analysis for precise note identification" to make tabs "from video recordings" (abstract) | no code link found (the arXiv HTML was not available; abstract read via the arXiv API) |
| 2026 | GuiFiR: "GuiFiR: Weakly-Supervised Learning of Hand Pose Estimation for Guitar Finger Reading", An, Chung, Park, Lee, IEEE Access 2026, doi 10.1109/ACCESS.2026.3713562 (Kookmin University AI Lab) | dataset README: "GuiFiR jointly estimates the hand pose and the guitar fretboard pose, and is trained with weak supervision from sparse tablature instead of dense per-frame hand keypoint labels."; dataset of 10-second clips (900 train / 30 val / 100 test) with COCO-style JSONL annotations; clips come from YouTube links (`yt_link.csv`, downloaded with yt-dlp) | the lab home page https://ailab.kookmin.ac.kr/ (read 2026-11-10 via web fetch) links "Code" to https://github.com/kmu-ee-ailab/guifir_dataset (last commit 2026-10-29): dataset-preparation scripts and metadata only, no model code or weights in its tree. `LICENSE` MIT for the scripts: "This license applies only to the source code and documentation in this repository. Dataset assets are governed by DATASET_TERMS.md." `DATASET_TERMS.md`: "The dataset assets are provided for non-commercial research, education, and reproducibility of the GuiFiR work." and, under "You may not:", "Use the dataset assets for commercial products, services, or training pipelines without written permission from the dataset maintainers." |
| 2021 | Asmar, Séoud, Bilodeau, Polytechnique Montréal: a poster (https://publications.polymtl.ca/80726/) and a 2022 master's thesis (https://publications.polymtl.ca/10470/1/2022_MarkAsmar.pdf), both found by web search | UNVERIFIED (known only from search-result summaries: RGB-D video, semantic segmentation, hand pose estimation and optical flow) | UNVERIFIED: publications.polymtl.ca reset the connection on 2026-11-10 (curl exit 35, retried once by the verifier) |
| 2023 | "A multimodal dataset for electric guitar playing technique recognition", Data in Brief (PMC10698518) | "549 video samples in MP4 format, and their respective audio samples in WAV format, covering nine different electric guitar techniques"; recorded "using a smartphone device"; article licence "CC BY-NC-ND" | data: Zenodo 10075352 "magcil/guitar_style_dataset" v1.0.0 (2023-11-06), `cc-by-4.0`, 14,251,969,884 bytes |
| 2024 | "Synchronize Dual Hands for Physics-Based Dexterous Guitar Playing", Xu and Wang, SIGGRAPH Asia 2024, arXiv 2409.16629 | the reverse direction: tab in, simulated two-hand motion out ("accurately play diverse rhythms with complex chord pressing and string picking patterns based on the input guitar tabs"); includes motion-capture data | https://github.com/xupei0610/guitar (linked from https://pei-xu.github.io/guitar ; last commit 2025-07-29): `LICENSE` MIT (code); `dataset/LICENSE` CC BY-NC-ND 4.0 (both read 2026-11-10) |
| 2025 | "Joint Transcription of Acoustic Guitar Strumming Directions and Chords", Murgul, Schimper, Heizmann, ISMIR 2025, arXiv 2508.07973 | data collected with "an ESP32 smartwatch motion sensor"; the model uses "only microphone audio" | no code link in the arXiv HTML |
| 2008 (before the window, for context) | Paleari, Huet, Schutz, Slock (Eurecom), "A Multimodal Approach to Music Transcription", Workshop on Multimedia Information Retrieval at ICIP 2008 (PDF https://www.eurecom.fr/publication/2491/download/mm-palema-081012.pdf , read 2026-11-10 by the verifier) | abstract: "a system which tracks the position of the fretboard on a video stream, a system which automatically detects the position of the guitar on the first fret to initialize the first system, a system which detects the position of the hand on the guitar, and finally a system which fuses the visual and audio information to extract a tablature. Results show that this kind of multimodal approach can easily disambiguate 89% of notes in a deterministic way." | none found in the PDF |

### Fingering estimation and string assignment from notes (symbolic), and string identification from audio

| Year | Work | Method family (authors' words) | Code |
|---|---|---|---|
| 2022 (arXiv 2025) | Kaliakatsos-Papakostas et al., SMC 2022, arXiv 2510.10619 | "based on machine learning"; "only standard 6-string guitar tuning is examined" | https://github.com/maximoskp/midi2tab_Deconvolutions (section above) |
| 2023 | "Enumerating Left Hand Forms for Guitar Tablatures Using Non-Decreasing Finger Numbers", Gen Hori (Zenodo creators field), TENOR 2023 (Zenodo 8079340, paper PDF `cc-by-4.0`, record read 2026-11-10) | title only read | not checked |
| 2023 | Visual Guitar Tab Comparison, Heyen et al., ISMIR 2023 LBD, arXiv 2311.14726 | an interface to compare tab versions by "similarity, difficulty, and correctness" | https://github.com/visvar/visual-guitar-tab-comparison (last commit 2023-11-20; no LICENSE file in the tree) |
| 2024 | MIDI-to-Tab (Edwards et al.), arXiv 2408.05024 | masked-language-model Transformer (BART) | none found |
| 2024 | From MIDI to Rich Tablatures (Bontempi et al.), arXiv 2407.09052 | "constrained and multi-attribute optimization problem ... best position of the fretting hand" | none found |
| 2024 | Guitar Chord Diagram Suggestion (d'Hooge, Bigo, Déguernel, Martin), SMC 2024, arXiv 2407.14260 | suggests a chord diagram "taking into account the diagram of the previous chord", from DadaGP and mySongBook statistics; "improves the F1-score on this task by up to 27%" (abstract) | the arXiv HTML names algomus.fr/code, which links https://github.com/adhooge/guitar-chord-diagram-suggestion (GPL v3 code, ODbL data, checkpoints; section "Guitar Chord Diagram Suggestion") |
| 2025 | Chieppa, Brutti, Paiva, "Automatic Guitar Transcription With Deep Neural Networks", IEEE Access vol. 13, 2025, doi 10.1109/ACCESS.2025.3583646 (PDF https://rppaiva.dei.uc.pt/publications/Journals/Access_2025_Chieppa.pdf , read 2026-11-10 by the verifier) | abstract: "This article builds on a state-of-the-art note-level transcription model that uses a self-attention mechanism. The model incorporates beat-informed quantisation to accurately convert audio signals into tablature"; it adds "a new dataset designed to assess the robustness of the model in different scenarios". Article licence line: "This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 License." | no code or data URL found in the PDF text |
| 2026 | Guitar-Transcription-CNN-MTL (Reyhanlıoğlu), "under review at IEEE Access" (README) | HCQT + Mel input, auxiliary fret-region, string-activity, pitch-class and multi-pitch heads, 6x21 tablature output | https://github.com/ErenReyhanlioglu/Guitar-Transcription (MIT) and MIT weights (section "Guitar-Transcription-CNN-MTL") |
| 2025 | Fretting-Transformer, arXiv 2506.14223 | T5 encoder-decoder with CAPO and TUNING tokens | none found |
| 2026 | GuitarTab (Hsu et al.), arXiv 2607.26440 | note-event tokens plus "pitch-validity constrained decoding" | https://github.com/MusicGuitarTab/GuitarTab |
| 2026 | Noise2Fret (Simionato, Bigo), arXiv 2608.30854 | diffusion with "Hand-Span Feasibility" among five auxiliary losses (audio in) | https://github.com/RiccardoVib/Noise2Fret |
| 2026 | Fretiq (Garg), arXiv 2607.18303v2 | "browser-based string classification system using a 26-dimensional feature representation ... and 13 Mel-Frequency Cepstral Coefficients", monophonic electric guitar; "A recording-session-held-out evaluation yields 86.53 +/- 1.23 percent accuracy" (abstract, v2) | no code link found (the arXiv HTML returned HTTP 404 for 2607.18303v2 on 2026-11-10; abstract read via the arXiv API) |
| 2026 | TART v2 (Gupta et al.), arXiv 2609.11904 | "an audio-conditioned T5 encoder-decoder for string-fret assignment" | none found |

Other guitar transcription work found in the same queries, without string output or outside this lane's core:
"Velocity Prediction in Automatic Guitar Transcription" (Loth, Riley, Dixon, Benetos, EUSIPCO 2026, arXiv 2606.24912;
no code link in the arXiv HTML); "Towards Generalizability to Tone and Content Variations in the Transcription of
Amplifier Rendered Electric Guitar Audio" (Chen et al., arXiv 2504.07406; introduces EGDB-PG and a "Tone-informed
Transformer"; project page https://ss12f32v.github.io/Guitar-Transcription-with-Amplifier/ , read 2026-11-10 by the
verifier: it lists "Dataset-WAV(Upon Request) Dataset-FLAC(Zenodo)" and no code link was found on it); "Leveraging Real
Electric Guitar Tones and Effects ..." (Pedroza et al., DAFx 2024, arXiv 2405.14679; uses amt-tools; EGSet12 data and its
TabCNN weights, Zenodo 11406378, see "TabCNN weights published by others");
"Exploring Procedural Data Generation for Automatic Acoustic Guitar Fingerpicking Transcription" (Murgul, Heizmann,
AIMC 2025, arXiv 2508.07987), whose linked repository https://github.com/klangio/procedural-data-training was empty (no
commits) when cloned on 2026-11-10; "Transcribing Rhythmic Patterns of the Guitar Track in Polyphonic Music" (arXiv
2510.05756, not read beyond its title).

## Commercial products and services (pointers only)

- Apps that turn audio into guitar tab (Klangio Guitar2Tabs, Songscription, Note2Tabs, AnthemScore, Songsterr) are the
  apps-survey lane's; HTTP APIs (Klangio API, Music.AI) are the hosted-apis lane's (its survey.md, item 2 of its tool
  list, reads "Klangio API (Klangio GmbH): transcription to MusicXML / Guitar Pro 5 / MIDI / PDF"). This lane read none
  of their terms or prices and states none.
- Guitar Pro 8, MuseScore and TuxGuitar each assign strings automatically (see "MuseScore, TuxGuitar and Guitar Pro
  built-in string assignment" above).

## Handoff facts

One line per fact. Each half cites the page or file it was read from on 2026-11-10 (the sections above quote them).
None of these pairs was run by this agent; the try agent's `trials.md` records what was actually run.

1. hf_midi_transcription (Riley et al. guitar models) outputs a MIDI file ("Output: MIDI files", CRNN "with
   onset/offset/frame/velocity regression"; https://github.com/xavriley/hf_midi_transcription README), which tuttut
   accepts as a MIDI file read by `pretty_midi.PrettyMIDI(filepath.as_posix())` into `Tab(filepath.stem, tuning, f, ...)`
   (https://github.com/natecdr/tuttut `tuttut/GUI/generate.py`). tuttut's MIDI input was exercised on the shared truth
   MIDI files in runs r0027 and r0048 (`trials.md`); the hf_midi_transcription → tuttut pair itself was not run.
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
   playback ... metronome, count-in, loop" (Guitab README "Web app"). The `.tokens.txt` vocabulary (`guitab/gp5.py`
   docstring) shares DadaGP's header tokens (`downtune:`, `tempo:`, `start`, `new_measure`, `wait:`) but writes notes as
   `note:s<string>:f<fret>` without DadaGP's instrument prefix (DadaGP example: `bass:note:s2:f16`) and starts with the song
   name instead of `artist:` (DadaGP tooling section); whether DadaGP's decoder or the GuitarTab parser reads it was not
   tested (UNVERIFIED).
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
    which `tools.stacked_notes_to_frets(...)` turns into (string, fret) per note (FretNet `examples/inference.py`), and
    amt-tools' `write_stacked_notes_jams(stacked_notes, jams_path)` writes per-string notes to JAMS
    (`amt_tools/tools/io.py`); no file writer for Guitar Pro or MusicXML is part of those repositories (file trees read
    2026-11-10).
15. gtrsnipe writes `.vex` (VexTab), `.abc`, `.mid` and ASCII `.tab` ("Convert to and from .mid, .abc, .vex, and .tab
    files"; gtrsnipe README), so its output can go to a VexTab or abcjs renderer in the web-tab-render lane (renderer
    half not read here).
16. From MIDI to Rich Tablatures "converted into MusicXML format" (arXiv 2407.09052 abstract); music21 has a MusicXML
    reader and writer (`music21/musicxml/xmlToM21.py`, `music21/musicxml/m21ToXml.py` in its tree) and `FretNote` /
    `FretBoard` objects for string and fret (music21 `tablature.py`). No code was found for the paper.
17. User constraint "capo at fret N" is accepted by: Guitab `--capo N`; gtrsnipe `--capo` ("All fret numbers will be
    relative to the capo", README "Command-line options"); scorify (`classicalGuitar({ capoFret: 2 })`, per-string
    `capoFret`; README; gap round 2 ran it on S5capo2, run r0621, eval e1816, `trials.md`); Fretting-Transformer through a `CAPO<#>` token (paper; no code). Not accepted by: MIDI-to-Tab
    ("our system does not handle the use of capos"), tuttut and tabsynth (no capo parameter found; a capo can be given to
    tuttut only as a raised `Tuning`, which the try agent ran: run r0048, evals e0045 without and e0046 with the raised
    tuning, `trials.md`), LilyPond's automatic assignment (no capo setting found on the fretted-strings page).
18. User constraint "tuning" is accepted by: amt-tools `GuitarProfile(tuning=[...], num_frets=...)`; tuttut
    `Tuning(strings, nfrets)` (Python API only; `tuttut-cli` uses the default `Tuning()`); tutts `new Tuning([...],
    nfrets)` (README; run with Drop D in r0205, eval e0410, `trials.md`); gtrsnipe `--tuning`,
    `--tuning-pitches`; scorify (per-string `openPitch`, `createFrettedInstrument(...)`; gap round 2 ran Drop D through the preset option `classicalGuitar({ tuning: [...] })`, run r0621, eval e1818); LilyPond `stringTunings`; FretPath
    (read from the MuseScore instrument's string data); Fretting-Transformer `TUNING<#,#,#,#,#,#>` token (no code). Fixed to standard
    tuning in: TabCNN (`string_midi_pitches = [40,45,50,55,59,64]`), Guitab (`OPEN_PITCH` in `guitab/guitar.py`), MIDI-to-Tab
    ("an assumption of standard tuning"), tabsynth ("Standard tuning focus"; `trials.md`: no tuning reaches
    `events_to_tablature`), tayuya ("Works only for standard tuning (E A D G B E)"), midi2tab_Deconvolutions ("only
    standard 6-string guitar tuning is examined"), the SynthTab TabCNN checkpoints (profile `[40, 45, 50, 55, 59, 64]`,
    19 frets, `trials.md` run r0139).
19. User constraint "this note is on string S" is accepted by: LilyPond string-number indications (`c4\5`; the try
    agent pinned one G3 to string 4 in run r0155 and the other 89 notes of S2n stayed as they were, `trials.md`); FretPath
    ("respects existing finger-number and string-number annotations as hard constraints"); gtrsnipe `--no-refinger`
    keeps a tab input's strings ("never moves a note to another string") and `--single-string {1,2,3,4,5,6}` puts every
    note on one string ("Force all notes onto a single string (1-6, high e to low E)", README "Command-line options").
    No audio-to-tab model in this lane takes a fixed string as an input; Guitab's `--fingering model|auto|low` re-fingers
    its own output. (Gap round 2: scorify has no per-note string field; a `scoring` cost hook that penalises the other
    strings moved one note of S2n to string 4 and left the other 89 on their strings and frets, run r0623, eval e1830,
    `trials.md`.)
20. Hand landmarks or fretboard coordinates from the video-hands-fretboard lane: no tool in this lane's sections
    accepts them as input. Of the video-based systems found, TapToTab and Asmar et al. have no code found, and GuiFiR
    has a dataset-preparation repository (https://github.com/kmu-ee-ailab/guifir_dataset : clips, COCO-style JSONL
    annotations, non-commercial dataset terms) with no model code or weights in it (checked 2026-11-10).
21. Licence chain facts for a public web app: Guitab weights are CC BY-NC-SA 4.0 (model card), and its chord model is
    trained on Chordonomicon (HF card `cc-by-nc-4.0`); the Beat This! weights Guitab ships are MIT, with the Beat This!
    README's note that "some of the training files are fully copyrighted or under limited Creative Commons licenses";
    xavriley guitar weights are MIT on their card while GAPS (training data) carries CC BY-NC-SA 4.0 on Zenodo and a
    non-commercial-research condition on its project page; the TabCNN weights in Zenodo 11406378 and on
    huggingface.co/cstr/tabcnn-onnx are CC BY 4.0 (record and card), trained on GuitarSet and, for GuitarProFX, on DadaGP
    tracks (DadaGP: research access by request, no dataset licence text); the CNN-MTL weights are MIT, trained on
    GuitarSet 1.1.0 (`cc-by-4.0`); the Noise2Fret checkpoints on Zenodo 23361924 are `cc-by-4.0` (record), one set
    trained on GOAT (`cc-by-nc-4.0`, "non-commercial only"); gtrsnipe is PolyForm Noncommercial 1.0.0 with a paid
    commercial licence offered;
    tuttut, tutts, tayuya, tabsynth, scorify, amt-tools, inhibition, FretNet, DadaGP tooling and music21 are MIT or BSD;
    PyGuitarPro is LGPL-3.0-only; LilyPond, FretPath and the chord-diagram-suggestion code are GPL v3 (its chord data
    ODbL); Audio2Tab's base model whisper-small is `apache-2.0` on its card (each quoted in its section).
22. Tested handoff (added by the verifier from `trials.md`; ledger rows checked): Basic Pitch 0.4.0 MIDI from the
    audio-to-notes lane (run r0234 there) was given to tuttut, tutts, LilyPond, tabsynth and tayuya (run r0240; tayuya
    again in r0242). What the try agent recorded at that seam: tayuya counts Basic Pitch's velocity-0 `note_on` messages
    as notes (twice as many notes out until the glue rewrote them as `note_off`) and stopped with `UnboundLocalError` on
    files with notes above D6; LilyPond left out notes it could not place ("No string for pitch"); tuttut and tutts moved
    out-of-range notes by octaves and left out notes of chords they could not finger; tabsynth dropped notes with no
    candidate position without a message. Scores per clip are in `trials.md` ("Handoff runs").

## Not covered

Found while checking for missing tools on 2026-11-10 and not examined beyond what each line says. Lines marked "search
result only" were not opened.

- TPMNet, "Multi-task learning-based temporal pattern matching network for guitar tablature transcription" (Kim, Kim,
  Ahn; Neural Computing and Applications 2025 per the search result): https://paperswithcode2.com/paper/550457 . Search
  result only; no code link seen.
- "Note-level Automatic Guitar Transcription Using Attention Mechanism" (Kim et al., EUSIPCO 2022 per the search result;
  the model that Chieppa et al. 2025 replicate):
  https://www.aminer.cn/pub/63899cbb90e50fcafd682cd7/note-level-automatic-guitar-transcription-using-attention-mechanism .
  Search result only.
- `string-fingerings` (npm 2.0.0-2, 2026-03-09, `license` MIT, repository github.com/icalvo/StringTools): npm description
  "Utilities for calculating fingerings on string instruments". Not examined.
- `keyjockey` (npm 0.1.0, 2026-08-26, `license` MIT): "Read guitar tablature and convert notes: eight tunings, capo
  offsets, MIDI and frequency." (npm description; tab to notes, the reverse direction). Not examined.
- `@hidechae/eztab-mcp` (npm 0.5.2, 2026-10-25, `license` MIT): "MCP server for EZTab — lets an AI agent build and edit
  guitar/bass tablature." (npm description; editing, the web-tab-render lane's subject). Not examined.
- Hugging Face models found by a model search for "guitar-tab" (2026-11-10): `kk9293/guitar-tab-omr` (created 2026-05-23,
  optical recognition of tab images per its name), `guitar-tab-transformer/*` (2025), `vldsavelyev/guitar_tab_gpt2*`
  (2023). Not examined.
- CrispASR's `--tab` surface (https://github.com/CrispStrobe/CrispASR), named on the `cstr/tabcnn-GGUF` card as the user
  of those GGUF files. Not examined.
- polytab (https://github.com/vanajmoorthy/cs4099-polytab), described in a search result as a TensorFlow TabCNN project.
  Search result only.
- Algomus repositories linked from https://algomus.fr/code next to the chord-diagram code:
  https://gitlab.com/adhooge1/bend-prediction and https://gitlab.com/lbigo/rhythm-guitar-detection . Not examined.
- arXiv titles from the 2026-11-10 queries, read as titles only: 2510.21872 "GuitarFlow: Realistic Electric Guitar
  Synthesis From Tablatures via Flow Matching and Style Transfer" (tab to audio); 2610.36786 "Expressive Guitar Synthesis
  via Controllable Latent Flow Matching"; 2608.27522 "PolyMap: A 64-Channel Polyphonic Guitar Pickup System"; 2511.03337
  "audio2chart: End to End Audio Transcription into playable Guitar Hero charts" and 2605.12135 "STRUM: A Spectral
  Transcription and Rhythm Understanding Model for End-to-End Generation of Playable Rhythm-Ga[me ...]" (game charts, not
  tablature); 2510.19666 "A Graph Engine for Guitar Chord-Tone Soloing Education".

## Verification log (verify-docs-guitar-tab, 2026-11-10)

Method: every source named in this file was fetched again on 2026-11-10 (4 CC legal codes, 21 Zenodo API records, 11
Hugging Face API records and 11 cards, 16 PyPI JSON records, 5 npm records, 31 arXiv abstracts via the API, 22 arXiv
HTML pages, 2 PDFs, 17 web pages) and 38 GitHub repositories were cloned without blobs to read HEAD dates, file trees
and the named files. Quotes were compared by script (`scripts/verify-docs/quotecheck.py`; the check lists and their
results are in the same folder): whitespace-normalised
exact match first, then a match that ignores markdown, link markup, typographic quotes and case; every quote the script
could not match was read by hand. Copies: `/home/user/gtr/lanes/guitar-tab/verify/`.

Tally of the quotes that were in this file before the check (378 quote fragments):

| Kind | Checked | Confirmed (exact) | Confirmed (markup or whitespace only) | Confirmed on reading | Corrected | Unverifiable |
|---|---|---|---|---|---|---|
| Licence and terms clauses | 53 | 49 | 2 | 2 (an npm JSON field; a DadaGP paper sentence with a footnote marker inside) | 0 | 0 |
| Other quotes (READMEs, code, papers, pages) | 325 | 293 | 20 | 6 (line breaks, spacing, rST and HTML link markup, arXiv API typesetting) | 6 | 0 |

The six corrected quotes: Fretting-Transformer's tokens are `CAPO<#>` and `TUNING<#,#,#,#,#,#>` (the brackets had been
dropped, also in the tool list and handoffs 17 and 18); SCORE-SET's README sentence (reference markers had been
dropped); two GuitarTab tree entries written as paths the tree does not show; hf_midi_transcription's
`model.transcribe("in.wav", "out.mid")` (placeholder names presented as the README's); tuttut's `generate.py`, which does
not call `to_json()`. A seventh quote, from the hosted-apis lane's survey (Klangio output formats), had its list order
changed and was corrected. Quotes added by this check: 124, all compared by script against the saved sources (121
exact; 3 confirmed on reading: blockquote markers, a JSON field, an HTML attribute), plus the Fretting-Transformer
sentence, read in the arXiv HTML markup, and two PDF quotes (Paleari et al., Chieppa et al.) matched after joining
hyphenated line breaks.

Facts corrected (beyond quote wording): Noise2Fret weights are published (Zenodo 23361924, `cc-by-4.0`; the file said
none); TabCNN weights are published by others (Zenodo 11406378, `cc-by-4.0`; Hugging Face `cstr/tabcnn-onnx` and
`cstr/tabcnn-GGUF`, CC BY 4.0); nylon-amt has a licence file in `hftt_code/` (Sony, MIT); the Guitar Chord Diagram
Suggestion code exists (GPL v3, data ODbL; the file said no code link); GuiFiR has a dataset repository with MIT scripts
and non-commercial dataset terms (the file said no URL); MIDI-to-Tab's Table 1 columns and its fine-tuning data
(training splits of Riley et al. and GuitarSet) are now read, not UNVERIFIED; EGDB-PG has two files, not one; EGSet12's
record also holds `.wav` files and TabCNN weights; Guitab uses EGDB for its chord model's training and evaluation songs,
not only as a test set; Bontempi et al.'s arXiv HTML links more than Mido and the system runs on IBM ILOG CPLEX;
midi2tab_Deconvolutions has no `guitar_tab.yml` in its tree; the Paleari et al. 2008 row now rests on the paper, not a
search summary; Guitar-TECHS has five Zenodo creators but four arXiv authors; tuttut's CLI takes no tuning; tabsynth's
command runs demos only.

Licence facts that were missing and are now quoted with links: Chordonomicon `cc-by-nc-4.0` (Guitab's chord model);
Beat This! README on its weights and training files; whisper-small `apache-2.0` (was UNVERIFIED); tutts `LICENSE` (was
UNVERIFIED); Synchronize Dual Hands: code MIT, `dataset/LICENSE` CC BY-NC-ND 4.0 (was "not read"); GuiFiR
`DATASET_TERMS.md`; hf_midi_transcription's README pointing to a LICENSE file that is not in its tree, and its
`piano-transcription-inference` dependency (MIT classifier, no LICENSE file); synthtab.dev has no licence statement.

Versions and dates: 24 repository HEAD dates and hashes, 11 PyPI records, the npm record and 4 Hugging Face records in
the first pass all matched what is written; 21 Zenodo records matched in licence id and date (file lists corrected as
above). This file makes no "archived" claims, and GitHub's archived flag could not be read from this box (github.com
pages and api.github.com answer 403). Links corrected or added: 7 (TabCNN's GuitarSet link with its
`?download=1` suffix, the chord-diagram repository, the GuiFiR dataset repository, the Paleari PDF, the two Asmar et al.
pages, the Noise2Fret weights record). Pricing and API terms: this file states no prices and none were added; the terms
quoted (gtrsnipe's commercial addendum, GAPS, GOAT, GuiFiR) were re-read on 2026-11-10. Judging words: a search for
ranking and evaluative words found them only inside attributed quotes; author-reported numbers now name their paper or
page and table or section.

Tools added: 4 tool-list entries (44 to 47) with their own sections (TabCNN weights published by others;
Guitar-Transcription-CNN-MTL; scorify; Guitar Chord Diagram Suggestion), 2 research-table rows (Chieppa et al. 2025;
CNN-MTL), 3 dataset entries (Chordonomicon, the Synchronize Dual Hands data, the GuiFiR data), and 10 lines under "Not
covered". Agreement with `trials.md` (read at about 21:35 and again at 21:50 UTC on 2026-11-10; 642 lines at the
second read): the output formats it records for tuttut, tutts, tayuya, tabsynth, LilyPond and the SynthTab checkpoints
agree with this file; facts it found (tuttut's CLI, tutts' options, tayuya's missing open strings, LilyPond's dropped
notes and string marks, and the Noise2Fret weights record, which it listed but did not run) were added here, with run
ids where it ran a tool, and its tested Basic Pitch → MIDI-to-tab handoff became handoff fact 22. One difference, stated
in the TabCNN weights section: `trials.md` says TabCNN's original code has no published weights, which is true of that
repository, while TabCNN weights trained by others are published.

Still UNVERIFIED after this check: FretNet weights anywhere; TART code; EGFxSet's licence; what SynthTab's
`non_finetuned/` holds; the DadaGP tick size (decoder comment vs the GuitarTab README); whether FretPath's core runs in
Node; whether Guitar-TECHS zips hold video; where AnimeTAB's data is; the Asmar et al. work (publications.polymtl.ca
reset the connection again on 2026-11-10); whether DadaGP's decoder reads Guitab's tokens; CPLEX's terms.

## Gap round 2 additions (gapfill-guitar-tab, 2026-11-11)

Added or changed in this file on 2026-11-11, each marked "gap round 2" where it stands: the TabCNN-weights section
(training code and its licences, the export repository's licence and training split, the card's front-end, the runs);
the table of published weights and training data (the vanilla ONNX model's players); scorify (package licence and
bundled dependencies, the cost hook as the way to bias a note toward a string, the runs); gtrsnipe (licence files
re-read at `a9be933`, still not on PyPI, repository install refused); handoff fact 19 (scorify's cost hook); a new
section and tool-list line 48 for the Lund thesis "Tämja hagelbössan" / "Taming the Shotgun". Sources were read on
2026-11-11 and saved under `/home/user/gtr/lanes/guitar-tab/gap2/dl/` and `gap2/repos/` (blob-less clones). Quotes
were compared with those copies by script after whitespace and hyphenation were normalised: 34 quotes from the model
card, five READMEs (the export repository's `tool/tabcnn`, robust-guitar-tabs, scorify, gtrsnipe, FretPath), five
licence files, the arXiv HTML, scorify's `package.json` and gtrsnipe's `pyproject.toml`, all found (the `pyproject.toml`
comment spans two lines with a `#` marker between them), plus the four thesis quotes and six record-page fields, all
found. Not re-checked by a second agent yet. (Re-checked against the live sources by verify-gapfill-guitar-tab on
2026-11-11; what it checked and changed in this file is listed in `trials.md`, "Verification log
(verify-gapfill-guitar-tab, round 2, 2026-11-11)".)
