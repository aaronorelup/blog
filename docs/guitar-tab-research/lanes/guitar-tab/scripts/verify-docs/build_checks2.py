#!/usr/bin/env python3
"""Quotes the verifier added to survey.md, each with the saved source it must appear in."""
import json

R = "/home/user/gtr/lanes/guitar-tab/verify/raw"
GH = R + "/gh/"
HF = R + "/hf/"
Z = R + "/zenodo/"
W = R + "/web/"
H = R + "/arxiv/html/"
C = []


def c(i, kind, src, q):
    C.append({"id": i, "kind": kind, "src": src, "quote": q})


c("z114-desc", "lic", Z + "11406378.json", 'The weights for the best performing model (TabCNN trained with "GuitarProFX") in the paper are also provided.')
c("dafx-amt", "doc", H + "2405.14679v3.html", "The GTT model we train is TabCNN, using the implementation in AMT tools")
c("dafx-gpfx", "doc", H + "2405.14679v3.html", "comprises 360 randomly-chosen solo performance tracks from DadaGP")
c("dafx-t2", "doc", H + "2405.14679v3.html", "TabCNN performance on EGSet12")
cs = HF + "card_cstr_tabcnn-onnx.md"
c("cstr-lic", "lic", cs, "license: cc-by-4.0")
c("cstr-van", "lic", cs, "Vanilla: trained here on **GuitarSet** (CC BY 4.0). Attribution to GuitarSet required.")
c("cstr-gpfx", "lic", cs, "GuitarProFX: weights from **Zenodo 11406378** (`best_TabCNN_tablature_trancription_model`, CC BY 4.0), the DAFx-24 GuitarProFX model")
c("cstr-in", "doc", cs, "**Input** `input : float32[N, 192, 9, 1]`")
c("cstr-out", "doc", cs, "**Output** `output : float32[N, 6, 21]` — per string, a **LogSoftmax** over 21 classes; **class 0 = closed**, class k = fret k−1.")
c("cstr-f1", "doc", cs, "`tabcnn.onnx`: held-out GuitarSet tab F1 0.745 (paper 0.748)")
c("cstr-eg", "doc", cs, "EGSet12 (12-track, frame-level tab F1) = 0.59 micro / 0.55 macro")
c("gguf-lic", "lic", HF + "card_cstr_tabcnn-GGUF.md", "license: cc-by-4.0")
c("gguf-emis", "doc", HF + "card_cstr_tabcnn-GGUF.md", "**These are emission SCORES, not a decided tablature.** Turning them into a playable fingering needs a constrained decoder (one note per string, fret range, capo, hand span).")
c("hm-lic2", "lic", GH + "xavriley_hf_midi_transcription__README.md", "This project is licensed under the MIT License - see the LICENSE file for details.")
c("ptiv-fork", "lic", GH + "xavriley_piano_transcription_inference__setup.py", "License :: OSI Approved :: MIT License")
c("gt-bt-card", "lic", HF + "danmor_guitab.README.md", "are converted copies of [Beat This!](https://github.com/CPJKU/beat_this) (Foscarin et al., ISMIR 2024) and keep its MIT licence, in `LICENSE-beat-this.txt`")
c("bt-file", "lic", HF + "danmor_LICENSE-beat-this.txt", "MIT License ... Copyright (c) 2024 Institute of Computational Perception, JKU Linz, Austria")
c("bt-readme", "lic", GH + "CPJKU_beat_this__README.md", "The code and the published model weights are released under the [MIT license](LICENSE). Note that some of the training files are fully copyrighted or under limited Creative Commons licenses, and it is up to the user to assess whether this may impact their use case.")
c("gt-chord", "doc", GH + "DanieleMorotti_guitab__README.md", "The chord model (about 70 min on a laptop CPU) needs [Chordonomicon](https://huggingface.co/datasets/ailsntua/Chordonomicon) in `data/chordonomicon/` and, for its real training and evaluation songs, the custom dataset and EGDB.")
c("gt-egdb", "doc", GH + "DanieleMorotti_guitab__README.md", "EGDB electric guitar test (25 clips, clean DI, never seen in training)")
c("chordo-lic", "lic", HF + "chordonomicon.README.md", "license: cc-by-nc-4.0")
g5 = GH + "DanieleMorotti_guitab__guitab_gp5.py"
c("gp5-tok", "doc", g5, 'Tokens: the song name, header tokens (downtune:, tempo:, start), then per beat its content - "note:s<string>:f<fret>" (optionally followed by "nfx:tie") or "rest" - and one "wait:<ticks>" giving the beat\'s duration (960 ticks per quarter), optionally preceded by "chord:<name>" (a chord name shown above the beat); "new_measure" closes a measure and "end" the song.')
c("gp5-std", "doc", g5, "One standard-tuned 6-string track, capo optional.")
c("whisper", "lic", HF + "whisper-small.README.md", "license: apache-2.0")
c("a2t-n2f", "doc", GH + "JackJamesLoth_Audio2Tab__README.md", "supplies **reference onset locations and the true tempo**")
c("ny-sony", "lic", GH + "d-f_nylon-amt__hftt_code_LICENSE", "MIT License ... Copyright (c) 2023 Sony Group Corporation")
c("tt-cli", "code", GH + "natecdr_tuttut__tuttut_midi_tabs_cli.py", "Tab(source.stem, Tuning(), midi, output_dir = args.output_dir)")
c("tutts-licfile", "lic", GH + "madisonrickert_tutts__LICENSE", "MIT License ... Copyright (c) 2026 Madison Rickert ... tutts is a TypeScript port of tuttut (https://github.com/natecdr/tuttut), Copyright (c) 2023 Nathan Candre, distributed under the MIT License.")
c("tutts-core", "lic", GH + "madisonrickert_tutts__packages_core_LICENSE", "MIT License ... Copyright (c) 2026 Madison Rickert")
c("tabsynth-demo", "doc", R + "/sdist/x/tabsynth-1.0.6/README.md", "The package includes a demo CLI:")
m2 = H + "2408.05024v1.html"
c("m2t-ft", "doc", m2, "The second phase of training is a finetuning on precisely annotated guitar performances from the training splits of Riley et al. [ 12 ] and GuitarSet [ 18 ]")
c("m2t-61", "doc", m2, "We use the training splits from Riley et al. [ 12 ] , with 61 pieces in the training set, 8 in the validation set, and 9 in the test set")
c("m2t-cap", "doc", m2, "Summary of quantitative analysis, showing maximum, mean and median “stretch” of chords in the tablature, defined as the maximum fret distance between any two notes in the chord. We also report the percent agreement with the ground truth note-string assignment. All metrics are averaged over the entire withheld test set.")
c("leduc-card", "doc", HF + "leduc.README.md", "Used to train a state-of-the-art (at the time) audio-to-MIDI transcription model for guitar in the paper above")
gt = GH + "MusicGuitarTab_GuitarTab__README.md"
c("gtab-run", "doc", gt, "Run on a single audio or MIDI file and get ASCII tablature + MIDI output")
c("gtab-sup", "doc", gt, "Supports `.mid`, `.mp3`, `.wav`, `.flac`, `.ogg`, `.m4a`.")
c("gtab-ofmt", "doc", gt, "for output token format")
c("gtab-480", "doc", gt, "wait: duration in ticks (480 ticks = quarter note)")
c("gtab-demo", "doc", gt, '--input "Demo/my_song.mp3"')
c("m2td-conda", "doc", GH + "maximoskp_midi2tab_Deconvolutions__README.md", "conda env create -f guitar_tab.yml")
bo = H + "2407.09052v1.html"
c("bont-cplex", "doc", bo, "is then processed through the IBM ILOG CPLEX Optimization Studio software, v20.1.0 ( https://www.ibm.com/products/ilog-cplex-optimization-studio , last accessed: 2024/03/07), in which we implemented our optimal fingering problem as a static and compact Mathematical Programming formulation.")
c("bont-tabasco", "doc", bo, "to which part of the authors belong")
c("dg-960a", "code", GH + "dada-bots_dadaGP__dadagp.py", "since the first measure start on beat 1 (960 ticks)")
c("dg-960b", "code", GH + "dada-bots_dadaGP__dadagp.py", "1-indexed quarter notes i guess")
er = GH + "ErenReyhanlioglu_Guitar-Transcription__README.md"
for q in ['Code for "Automatic Guitar Tablature Transcription using Dual Representation Feature Fusion and Instrument Informed Multi-Task Learning".',
          "The paper is currently under review at IEEE Access.",
          "The HCQT stacks six CQT planes (harmonics 0.5, 1, 2, 3, 4, 5; 36 bins per octave over four octaves from E2, 144 bins per plane)",
          "The Mel-spectrogram (256 bands, 2048-point FFT)",
          "Audio is resampled to 22.05 kHz with a hop of 512 samples, and the model sees a 19-frame context window centred on the target frame (about 209 ms on each side).",
          "The tablature head is a two-layer MLP with a 256-unit hidden layer (dropout 0.5), projecting to a 6x21 output covering six strings and 21 fret states (frets 0 to 19, plus silence).",
          "Training on CPU works but is impractical at full scale.",
          "They load into `src/models/cnn_mtl.py` with `configs/cnn_mtl_config.yaml`",
          "MIT. See [LICENSE](LICENSE).",
          "Experiments use [GuitarSet](https://guitarset.weebly.com/) (annotations version 1.1.0)",
          "CPU: median of 5 runs with six threads. Feature extraction is excluded",
          "Instrument tuning/fret-range profile",
          "| HCQT + Mel | Casc. MT† | **0.794** ±0.021 | **0.763** ±0.063 | **0.776** ±0.034 | **0.943** ±0.025 |",
          "| Cascaded MT† | 6.65 | 1331 | 0.0051 | 0.615 | 0.776 | 0.943 |"]:
    c("mtl:" + q[:22], "doc", er, q)
c("mtl-lic", "lic", GH + "ErenReyhanlioglu_Guitar-Transcription__LICENSE", "MIT License ... Copyright (c) 2026 M. Eren Reyhanlıoğlu")
c("mtl-wlic", "lic", GH + "ErenReyhanlioglu_Guitar-Transcription-Weights__LICENSE", "MIT License ... Copyright (c) 2026 M. Eren Reyhanlıoğlu")
c("mtl-card-lic", "lic", HF + "card_MehmetErenn0_guitar-transcription-cnn-mtl.md", "license: mit")
c("mtl-card-w", "doc", HF + "card_MehmetErenn0_guitar-transcription-cnn-mtl.md", "Model weights only (state_dict), use this for inference")
sc = R + "/npm/scorify_README.md"
for q in ["Instrument-aware music arrangement, transposition, and fingering constraints for vanilla JavaScript. TypeScript source, browser-native ESM, no external runtime dependencies.",
          "All pitches are **sounding** pitches.",
          "Time is a normalized `[numerator, denominator]` measured in quarter notes.",
          "`success` includes output score, fingerings, separate source/realized harmony, edits, source mapping, difficulty components, model versions, effective profile, and search statistics.",
          "Configurable fretted strings, tunings, capos and geometry",
          "Per-string configuration accepts `openPitch`, `capoFret`, `fretCount`, stable `id`, and tab `number`. Frets are absolute from the original nut; displayed relative fret = absolute fret − that string's capo.",
          "exhaustive reference, exact dynamic programming, or bounded beam search",
          "audio/MIDI/MusicXML import",
          "remain future work",
          "converts MusicXML, MXL, ABC and MIDI into scorify Score JSON",
          "classicalGuitar({ capoFret: 2 })",
          'createFrettedInstrument("custom", "My tuning", ['
          ]:
    c("sc:" + q[:22], "doc", sc, q)
c("sc-lic", "lic", R + "/npm/scorify.json", "MIT")
c("sc-licfile", "lic", GH + "kyr0_scorify__package.json", '"license": "MIT"')
cd = GH + "adhooge_guitar-chord-diagram-suggestion__README.md"
c("cds-code", "lic", cd, "The code is released under a GPL-v3.0 license, refer to the `LICENSE` file for more details.")
c("cds-data", "lic", cd, "The chord data is released under an ODbL license, refer to the `DATA_LICENSE` file for more details.")
c("cds-ckpt", "doc", cd, "We provide checkpoints of the models we trained for the paper")
c("cds-train", "doc", cd, "python -m cds.train -n <a name for the trained model>")
c("cds-test", "doc", cd, "python -m cds.test -s <path/to/ckpt> -T")
c("cds-shape", "doc", cd, "'3.2.0.0.3.3'")
c("cds-lic", "lic", GH + "adhooge_guitar-chord-diagram-suggestion__LICENSE", "GNU GENERAL PUBLIC LICENSE ... Version 3, 29 June 2007")
c("cds-dlic", "lic", GH + "adhooge_guitar-chord-diagram-suggestion__DATA_LICENSE", "## ODC Open Database License (ODbL)")
c("cds-space", "lic", HF + "space_gcds.README.md", "license: other")
c("cds-paper", "doc", H + "2407.14260v1.html", "The Python implementation is openly available, along with a demonstration website, at algomus.fr/code .")
c("cds-algomus", "doc", W + "algomus_fr_code.html", "github.com/adhooge/guitar-chord-diagram-suggestion")
c("egdbpg", "doc", W + "egdb_amp.html", "Dataset-WAV(Upon Request) Dataset-FLAC(Zenodo)")
c("rgtc", "doc", Z + "21304818.json", "Rhythm Guitar Tablature Continuation through Picking Pattern Generation")
c("pxu-lic", "lic", GH + "xupei0610_guitar__LICENSE", "MIT License ... Copyright (c) 2024 徐霈 (Pei Xu)")
c("pxu-dlic", "lic", GH + "xupei0610_guitar__dataset_LICENSE", "Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International Public License")
gf = GH + "kmu-ee-ailab_guifir_dataset__"
c("gf-readme", "doc", gf + "README.md", "GuiFiR jointly estimates the hand pose and the guitar fretboard pose, and is trained with weak supervision from sparse tablature instead of dense per-frame hand keypoint labels.")
c("gf-lic", "lic", gf + "LICENSE", "This license applies only to the source code and documentation in this repository. Dataset assets are governed by DATASET_TERMS.md.")
c("gf-terms1", "lic", gf + "DATASET_TERMS.md", "The dataset assets are provided for non-commercial research, education, and reproducibility of the GuiFiR work.")
c("gf-terms2", "lic", gf + "DATASET_TERMS.md", "Use the dataset assets for commercial products, services, or training pipelines without written permission from the dataset maintainers.")
c("gf-doi", "doc", gf + "README.md", "10.1109/ACCESS.2026.3713562")
c("hosted", "doc", "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/survey.md", "Klangio API (Klangio GmbH): transcription to MusicXML / Guitar Pro 5 / MIDI / PDF")
c("gs-capo", "doc", GH + "scottvr_gtrsnipe__README.md", "All fret numbers will be relative to the capo.")
c("gs-single", "doc", GH + "scottvr_gtrsnipe__README.md", "Force all notes onto a single string (1-6, high e to low E)")
c("fp-copy", "lic", R + "/gh/knoguchi_fretpath__COPYRIGHT", "- FretPath (GPL-3.0)")
json.dump(C, open("/home/user/gtr/lanes/guitar-tab/verify/checks2.json", "w"), indent=1, ensure_ascii=False)
print(len(C), "checks;", sum(1 for x in C if x["kind"] == "lic"), "license/terms")
