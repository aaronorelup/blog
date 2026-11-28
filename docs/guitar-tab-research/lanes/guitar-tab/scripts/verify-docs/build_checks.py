#!/usr/bin/env python3
"""List of quotes from survey.md (copied as written there) and the saved source each must appear in."""
import json

R = "/home/user/gtr/lanes/guitar-tab/verify/raw"
GH = R + "/gh/"
CC = R + "/cc/"
Z = R + "/zenodo/"
HF = R + "/hf/"
PY = R + "/pypi/"
W = R + "/web/"
AX = R + "/arxiv/"
H = AX + "html/"

C = []


def c(i, kind, src, q):
    C.append({"id": i, "kind": kind, "src": src, "quote": q})


# ---- Shared CC texts
nc_def = "NonCommercial means not primarily intended for or directed towards commercial advantage or monetary compensation."
c("cc-bync-def", "lic", CC + "by-nc.html", nc_def)
c("cc-bync-2a1", "lic", CC + "by-nc.html", "reproduce and Share the Licensed Material, in whole or in part, for NonCommercial purposes only; and produce, reproduce, and Share Adapted Material for NonCommercial purposes only.")
c("cc-byncsa-def", "lic", CC + "by-nc-sa.html", nc_def)
c("cc-byncsa-2a1", "lic", CC + "by-nc-sa.html", "reproduce and Share the Licensed Material, in whole or in part, for NonCommercial purposes only; and produce, reproduce, and Share Adapted Material for NonCommercial purposes only.")
c("cc-byncnd-def", "lic", CC + "by-nc-nd.html", nc_def)
c("cc-byncnd-2a1", "lic", CC + "by-nc-nd.html", "reproduce and Share the Licensed Material, in whole or in part, for NonCommercial purposes only; and produce and reproduce, but not Share, Adapted Material for NonCommercial purposes only.")
c("cc-by-2a1end", "lic", CC + "by.html", "produce, reproduce, and Share Adapted Material.")

# ---- TabCNN
tc = GH + "andywiggins_tab-cnn__README.md"
c("tabcnn-py27", "doc", tc, "This project was made to be run with Python 2.7.")
c("tabcnn-run", "doc", tc, "Run the following line to train and test the TabCNN model:")
c("tabcnn-run2", "doc", tc, "python model/TabCNN.py")
c("tabcnn-prep", "doc", tc, "bash data/Bash_TabDataReprGen.sh")
c("tabcnn-weights", "doc", tc, "a folder for each fold of data will be created, containing the individual model's weights and predictions.")
c("tabcnn-zip", "doc", tc, "https://zenodo.org/record/1422265/files/GuitarSet_audio_and_annotation.zip")
src_tc = [GH + "andywiggins_tab-cnn__data_TabDataReprGen.py", GH + "andywiggins_tab-cnn__model_TabCNN.py"]
for k in ["self.sr_downs = 22050", "n_bins = 192", "bins_per_octave = 24", "hop_length = 512", "con_win_size = 9",
          "self.num_classes = 21", "self.num_strings = 6", "self.highest_fret = 19",
          "self.num_classes = self.highest_fret + 2 # for open/closed", "self.string_midi_pitches = [40,45,50,55,59,64]"]:
    c("tabcnn-code:" + k[:20], "code", src_tc, k)

# ---- amt-tools
at = GH + "cwitkowitz_amt-tools__README.md"
c("amt-what", "doc", at, "Implements a customizable machine learning pipeline for AMT in PyTorch")
c("amt-wip", "doc", at, "The framework is a work-in-progress.")
c("amt-pip", "doc", at, "pip install amt-tools")
c("amt-pyreq", "code", GH + "cwitkowitz_amt-tools__setup.py", "python_requires='>=3.8'")
c("amt-lic-setup", "lic", GH + "cwitkowitz_amt-tools__setup.py", "license='MIT'")
c("amt-tuning-doc", "code", GH + "cwitkowitz_amt-tools__amt_tools_tools_instrument.py", "list of str ... Name of lowest note playable on each degree of freedom")
c("amt-frets-doc", "code", GH + "cwitkowitz_amt-tools__amt_tools_tools_instrument.py", "Number of frets on guitar (or at least the number used)")
c("amt-gp", "code", GH + "cwitkowitz_amt-tools__amt_tools_tools_instrument.py", "GuitarProfile(")
c("amt-def-tuning", "code", GH + "cwitkowitz_amt-tools__amt_tools_tools_constants.py", "DEFAULT_GUITAR_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']")
c("amt-def-frets", "code", GH + "cwitkowitz_amt-tools__amt_tools_tools_constants.py", "DEFAULT_GUITAR_NUM_FRETS = 19")
c("amt-lic", "lic", GH + "cwitkowitz_amt-tools__LICENSE.txt", 'MIT License ... Copyright (c) 2023 Frank Cwitkowitz ... Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software')

# ---- inhibition
ih = GH + "cwitkowitz_guitar-transcription-with-inhibition__README.md"
for q in ["Acquire annotations in JAMS format from GuitarPro data using PyGuitarPro",
          "Create a matrix of inhibition weights from a collection of tablature (e.g., DadaGP)",
          "Implement the proposed tablature output layer formulation with inhibition",
          "Perform six-fold cross-validation experiments on GuitarSet",
          "from guitar_transcription_inhibition.models import LogisticTablatureEstimator",
          "LogisticTablatureEstimator(dim_in=<dim_in>, profile=<profile>, matrix_path=<matrix_path>, lmbda=<lmbda>)",
          "an instance of `torch.nn.Module`",
          "python guitar_transcription_inhibition/gpro/process_guitarpro.py",
          "A Data-Driven Methodology for Considering Feasibility and Pairwise Likelihood in Deep Learning Based Guitar Tablature Transcription Systems"]:
    c("inh:" + q[:24], "doc", ih, q)
c("inh-setup", "code", GH + "cwitkowitz_guitar-transcription-with-inhibition__setup.py", "install_requires=['amt_tools', 'pyguitarpro']")
c("inh-ver", "code", GH + "cwitkowitz_guitar-transcription-with-inhibition__setup.py", "version='0.1.0'")
c("inh-lic", "lic", GH + "cwitkowitz_guitar-transcription-with-inhibition__LICENSE.txt", "MIT License ... Copyright (c) 2022 Frank Cwitkowitz")

# ---- FretNet
fn = GH + "cwitkowitz_guitar-transcription-continuous__README.md"
for q in ["Implement the FretNet model and obtain continuous-valued multi-pitch estimates",
          "Compute note and continuous-valued multi-pitch metrics at the string-level",
          "FretNet: Continuous-Valued Pitch Contour Streaming for Polyphonic Guitar Tablature Transcription"]:
    c("fn:" + q[:24], "doc", fn, q)
c("fn-setup", "code", GH + "cwitkowitz_guitar-transcription-continuous__setup.py", "install_requires=['amt_tools', 'muda']")
c("fn-ver", "code", GH + "cwitkowitz_guitar-transcription-continuous__setup.py", "version='0.0.2'")
c("fn-req", "code", GH + "cwitkowitz_guitar-transcription-continuous__requirements.txt", "git+https://github.com/cwitkowitz/guitar-transcription-with-inhibition@main")
fi = GH + "cwitkowitz_guitar-transcription-continuous__examples_inference.py"
for q in ["model-2000.pt", "sample_rate = 22050", "hop_length = 512", "harmonics=[0.5, 1, 2, 3, 4, 5]", "n_bins=144",
          "bins_per_octave=36", "run_offline(features, model, estimator)", "stacked_notes_to_frets", "StackedPitchListTablatureWrapper",
          "fmin=librosa.note_to_hz('E2')"]:
    c("fn-inf:" + q[:20], "code", fi, q)
c("fn-cmp", "code", GH + "cwitkowitz_guitar-transcription-continuous__examples_comparison.py", "GuitarProfile(num_frets=19)")
c("fn-lic", "lic", GH + "cwitkowitz_guitar-transcription-continuous__LICENSE.txt", "MIT License ... Copyright (c) 2023 Frank Cwitkowitz")

# ---- SynthTab
st = GH + "yongyizang_SynthTab__README.md"
c("st-abs", "doc", AX + "abs_2309.09085.txt", "We procure SynthTab, a dataset derived from DadaGP ... The proposed synthesis pipeline produces audio which faithfully adheres to the original fingerings and a subset of techniques specified in the tablature")
c("st-demo", "doc", st, "`demo_embedding` is where we put our benchmark pre-trained models, with a simple demo script for training and running evaluation.")
c("st-clean", "doc", GH + "yongyizang_SynthTab__demo_embedding_README.md", "The code is still being cleaned up. You would probably need to change directories paths and datasets in the code to make it work")
c("st-gt", "doc", [st, GH + "yongyizang_SynthTab__demo_data_Demo_Data.md"], "This is the ground truth tablature")
c("st-yin", "doc", [st, GH + "yongyizang_SynthTab__demo_data_Demo_Data.md"], "We used the YIN algorithm for this")
c("st-44k", "doc", [st, GH + "yongyizang_SynthTab__demo_data_Demo_Data.md"], "the original dataset is rendered at 44100 Hz")
c("st-2tb", "doc", [st, GH + "yongyizang_SynthTab__demo_data_Demo_Data.md"], "Total file size is close to and less than 2 TB.")
c("st-bug", "doc", st, "When two same-pitched notes are played on the same string in sequence with no gap in between ... the commericial VST we used would sometimes ignore the second note.")
c("st-bug-ac", "doc", st, "8994/11132 (80.8%) of the songs are affected")
c("st-bug-el", "doc", st, "32179/38838 (82.9%) of the songs are affected")
c("st-lic-readme", "lic", st, "SynthTab is released with CC BY-NC 4.0 license (learn more about it [here](https://creativecommons.org/licenses/by-nc/4.0/deed.en)).")
c("st-lic-file1", "lic", GH + "yongyizang_SynthTab__LICENSE", "Creative Commons Attribution 4.0 International")
c("st-lic-file2", "lic", GH + "yongyizang_SynthTab__LICENSE", "Attribution 4.0 International Public License")
c("st-box", "doc", st, "https://rochester.app.box.com/v/SynthTab-Full")

# ---- Riley / hf_midi_transcription
hfr = HF + "xavriley_mtm.README.md"
c("hf-code", "doc", hfr, "Code: https://github.com/xavriley/hf_midi_transcription/")
c("hf-p1", "doc", hfr, "Paper (guitar 1): https://arxiv.org/pdf/2402.15258")
c("hf-p2", "doc", hfr, "Paper (guitar 2): https://arxiv.org/abs/2408.08653")
c("hf-lic-card", "lic", hfr, "license: mit")
hm = GH + "xavriley_hf_midi_transcription__README.md"
hp = GH + "xavriley_hf_midi_transcription__pyproject.toml"
hi = GH + "xavriley_hf_midi_transcription__instruments.json"
c("hm-pyver", "code", hp, 'version = "0.1.1"')
c("hm-pyreq", "code", hp, 'requires-python = ">=3.9"')
c("hm-fork", "code", hp, "git+https://github.com/xavriley/piano_transcription_inference.git")
c("hm-lic-class", "lic", hp, "License :: OSI Approved :: MIT License")
c("hm-inst1", "code", hi, '"checkpoint_file": "guitar-gaps.pth"')
c("hm-inst2", "code", hi, "Guitar transcription model (default: GAPS)")
c("hm-inst3", "code", hi, "Guitar transcription model trained on Francois Leduc dataset")
c("hm-inst4", "code", hi, '"guitar-fl.pth"')
for q in ["midi_transcription guitar_solo.wav output.mid --instrument guitar", "pip install hf-midi-transcription",
          "Input: Audio files (WAV, MP3, etc.)", "Output: MIDI files", "Sample Rate: 16 kHz",
          "Architecture: Convolutional Recurrent Neural Network (CRNN) with onset/offset/frame/velocity regression",
          "This code transcribes solo, monophonic audio from multiple instruments to MIDI", "License: MIT",
          'MidiTranscriptionModel.from_pretrained("xavriley/midi-transcription-models", instrument="guitar")',
          'model.transcribe("in.wav", "out.mid")', 'transcribe_audio_array(audio, "output.mid")', "sr=16000",
          "If you need to separate instruments from a mix first please check out UVR or MVSep.com",
          "--batch-size", "--checkpoint", "--model-id"]:
    c("hm:" + q[:24], "lic" if q == "License: MIT" else "doc", hm, q)
c("hm-device", "code", [hm, GH + "xavriley_hf_midi_transcription__hf_midi_transcription_cli.py"], "auto")
hmm = GH + "xavriley_hf_midi_transcription__hf_midi_transcription_model.py"
c("hm-onset", "code", hmm, "onset_threshold")
c("hm-offset", "code", hmm, "offset_threshold")
c("hm-seg", "code", hmm, "segment_samples=10 * sample_rate")
lz = Z + "10984521.json"
c("leduc-terms", "lic", lz, "For copyright reasons this dataset is made available by request only, for use in research projects. We are unable to distribute the original scores but these may be purchased from François Leduc at https://www.francoisleduconlinelibrary.com/ You will need to obtain permission separately from the original copyright holder (François Leduc) to use these in non-research applications.")
c("leduc-newer", "lic", lz, "a newer version of this dataset is now freely available at https://huggingface.co/datasets/xavriley/FrancoisLeducGuitarDataset")
c("leduc-hf-lic", "lic", HF + "leduc.README.md", "license: mit")
c("hrgt-gp", "doc", W + "hrgt_project.html", "The GuitarPro files are commercially available from his website")
c("riley-abs1", "doc", AX + "abs_2402.15258.txt", "The resulting model obtains state-of-the-art transcription results on GuitarSet in a zero-shot context")
c("riley-abs2", "doc", AX + "abs_2408.08653.txt", "containing 14 hours of freely available audio-score aligned pairs, recorded in diverse conditions by over 200 performers")

# ---- Guitab
gr = GH + "DanieleMorotti_guitab__README.md"
gp = GH + "DanieleMorotti_guitab__pyproject.toml"
gc = GH + "DanieleMorotti_guitab__CHANGELOG.md"
c("gt-ver", "code", gp, 'version = "1.2.0"')
c("gt-pyreq", "code", gp, 'requires-python = ">=3.11"')
c("gt-lic-pyp", "lic", gp, 'license = "MIT"')
c("gt-ch1", "doc", gc, "## 1.0.0 — 2026-10-23")
c("gt-ch1b", "doc", gc, "First public release")
c("gt-ch2", "doc", gc, "## 1.2.0 — 2026-10-31")
for q in ["Guitab turns a recording of a solo guitar into a tab you can open in Guitar Pro, TuxGuitar, MuseScore or any online gp5 player. It is made for **steel-string fingerstyle** playing",
          "On clean recordings about 85% of the notes come out right, with the correct string and fret ... Treat the result as *a first draft to correct by ear*",
          "guitab --audio my_song.mp3 --out_dir out/my_song",
          "Every command takes `--device auto|cuda|mps|cpu`.",
          "guitab-app",
          "The models run with ONNX Runtime Web (WebGPU when the browser has it, else WebAssembly) ... It gives the same .gp5 as the Python pipeline, **byte for byte**",
          "A 2:23 song takes about 16 s",
          "A 4-minute song takes well under a minute and 1–2 GB of GPU memory",
          "at 22.05 kHz mono",
          "`out/my_song/my_song.gp5` ... plus `my_song.tokens.txt` with the same tab as text tokens",
          "for every frame and string, the fret (21 classes: silent or frets 0–19) and the onset probability",
          "notes stay on strings that can play them, frets are written relative to the capo, and the .gp5 has the capo set",
          "Re-finger towards first position with a Viterbi optimiser",
          "A fixed tempo instead of following the detected beats",
          "is trained on public datasets only",
          "428 selected fingerstyle songs (about 21 h",
          "Custom dataset (not distributed): real fingerstyle recordings with their tabs aligned to the audio",
          "from the dataset's YouTube links",
          "Real fingerstyle recordings (19 held-out songs of the custom dataset)",
          "the research started from Audio2Tab",
          "in an alphaTab viewer with playback ... metronome, count-in, loop",
          "the beats come from the Beat This! activation together with the model's own onset probabilities",
          "on a grid that follows the beats of the recording",
          "wav, flac, ogg, mp3, aiff",
          "a recording of a solo guitar",
          "960", "--grid", "--onset", "--orphan", "--music_lm", "--chords", "--params", "--fingering", "--capo", "Chordonomicon"]:
    c("gt:" + q[:24], "doc", gr, q)
c("gt-lic-readme", "lic", gr, "The datasets keep their own licences: GuitarSet CC BY 4.0, GAPS CC BY-NC-SA 4.0, SynthTab CC BY-NC 4.0. The models are trained on them and inherit their non-commercial terms, so the published weights are **CC BY-NC-SA 4.0**, for research and personal use. The beat tracker shared on Hugging Face is a converted copy of Beat This! and keeps its MIT licence.")
c("gt-lic-file", "lic", GH + "DanieleMorotti_guitab__LICENSE", "MIT License ... Copyright (c) 2026 Daniele Morotti")
gh_ = HF + "danmor_guitab.README.md"
c("gt-card-yaml", "lic", gh_, "license: cc-by-nc-sa-4.0")
c("gt-card-lic", "lic", gh_, "The weights are released under **CC BY-NC-SA 4.0** (non-commercial), because they are trained on GAPS (CC BY-NC-SA 4.0) and SynthTab (CC BY-NC 4.0).")
c("gt-card-num", "doc", gh_, "*These numbers come from a personal project, not a benchmark study* ... the GuitarSet protocol is the project's own, so they are not directly comparable with published results.")
c("gt-guitar-doc", "code", GH + "DanieleMorotti_guitab__guitab_guitar.py", '"""Guitar constants shared by the whole pipeline (standard tuning)."""')
c("gt-guitar-open", "code", GH + "DanieleMorotti_guitab__guitab_guitar.py", "OPEN_PITCH = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}")
c("gt-gaps-dl", "code", GH + "DanieleMorotti_guitab__scripts_gaps_download.py", "YouTube")

# ---- TART
c("tart-v2", "doc", AX + "abs_2609.11904.txt", "(1) an audio-to-MIDI transcription model, (2) an expressive technique classifier, (3) an audio-conditioned T5 encoder-decoder for string-fret assignment, and (4) an automated tablature generator.")
c("tart-v1", "doc", AX + "abs_2510.02597.txt", "(1) Audio-to-MIDI pitch conversion through a piano transcription model adapted to guitar datasets; (2) MLP-based expressive technique classification; (3) Transformer-based string and fret assignment; and (4) LSTM-based tablature generation.")
c("tart-num", "doc", AX + "abs_2609.11904.txt", "We evaluate TART in a zero-shot setting on GuitarSet, EGDB, and two augmented benchmarks, Noisy GuitarSet and Noisy EGDB. Averaged across these four benchmarks, TART achieves 81.35% audio-to-MIDI F50 (+6.67 points over the best prior baseline), 71.8% string-fret Tab F1 (+8.5 points over the best prior baseline), and 54.08% end-to-end Tab F1.")

# ---- Noise2Fret
nr = GH + "RiccardoVib_Noise2Fret__README.md"
c("n2f-second", "doc", nr, "_Noise2Fret: Event-Based Audio-To-Tab Guitar Transcription_ (on review)")
c("n2f-cap", "doc", nr, "a 1D convolutional U-Net ... Audio, spectral features, and timestep are injected as conditioning signals ... The final denoised embedding is projected back to per-string class logits over F fret states, yielding the predicted tablature tensor (T x S x F).")
c("n2f-abs", "doc", AX + "abs_2608.30854.txt", "we introduce five auxiliary losses encoding Pitch-Class Distance, Positional Distance, Circle-of-Fifths Distance, String Similarity, and Hand-Span Feasibility")
c("n2f-abs2", "doc", AX + "abs_2608.30854.txt", "Experiments on GuitarSet and GOAT datasets")
c("n2f-lic", "lic", GH + "RiccardoVib_Noise2Fret__LICENSE", "MIT License ... Copyright (c) 2026 Riccardo")
c("n2f-html-link", "doc", H + "2608.30854v1.html", "github.com/RiccardoVib/Noise2Fret")

# ---- Audio2Tab
ar = GH + "JackJamesLoth_Audio2Tab__README.md"
for q in ["Given an audio file of up to 30 seconds, Audio2Tab transcribes the audio and outputs a .gp5 file containing a tablature transcription ... Paper is currently submitted for publication at ICASSP 2027.",
          "python src/train.py --manifest_csv DATA_CSV.csv --token_list_path token_list.json --output_dir OUTPUT_DIR --model_name_or_path openai/whisper-small --num_train_epochs 4",
          "infer.py --checkpoint_path CHECKPOINT_DIR --audio_path example_audio.wav --output_dir OUTPUT_DIR --tokenizer_dir TOKENIZER_DIR --feature_extractor_dir FEATURE_EXTRACTOR_DIR",
          "src/python infer.py",
          "Currently the model is limited to up to 30 seconds of audio.",
          "## Checkpoints", "We will host a checkpoint here soon!", "goat.csv", "synthtab.csv"]:
    c("a2t:" + q[:24], "doc", ar, q)

# ---- nylon-amt
ny = GH + "d-f_nylon-amt__README.md"
for q in ["This project makes use of hierarchical frequency time transformers in order to transcribe classical guitar audio into sheet music and guitar tabulature. The original implementation of this model can be found at https://github.com/sony/hFT-Transformer/",
          "First, a model is trained to transcribe solo piano recital pieces using the MAESTRO dataset",
          "Alphatab will be used for tab visualization",
          "It is clear that more than 0.2% of the dataset needs to be used for training.",
          "MAESTRO dataset performance"]:
    c("ny:" + q[:24], "doc", ny, q)

# ---- gtrsnipe
gs = GH + "scottvr_gtrsnipe__README.md"
for q in ["gtrsnipe is a guitar transcription tool. Its primary function is to create playable guitar tablature from a variety of sources. It now features a fledgling audio-to-tab pipeline that can take a mixed audio track, isolate the guitar part, and transcribe it into a tab.",
          "gtrsnipe -i input.mid -o out.tab",
          "Convert to and from .mid, .abc, .vex, and .tab files. (and more.)",
          "(.mid, .mp3, .wav, etc.)",
          "audio input: librosa pYIN bass pipeline",
          "demucs stem isolation (pulls torch)",
          "ranks them by how playable the tab is",
          "gtrsnipe chooses where to play each note on the fretboard by maximizing an additive playability score (fret span, hand movement, string switching, barre shapes, let-ring, and more)",
          "`viterbi` (default) — a dynamic-programming / Viterbi trellis search that finds the **globally optimal** fingering sequence for the whole passage",
          "`greedy` — the legacy per-chord choice",
          '--tuning-pitches "A1,E2,A2,D3,F#3,B3"',
          "never moves a note to another string",
          "gtrsnipe-play", "gtrsnipe-chords", "--analyze", "--solve-tuning", "DROP_D", "BARITONE_B", "--drop-low-string",
          "--num-strings", "--max-fret", "--capo", "--optimizer", "--fret-span-penalty", "--let-ring-bonus", "--refinger",
          "--no-refinger", "--single-string", "--transpose", "--prefer-open", ".gtrsnipe/"]:
    c("gs:" + q[:24], "doc", gs, q)
c("gs-ver", "code", GH + "scottvr_gtrsnipe__pyproject.toml", 'version = "0.8.3"')
c("gs-pyreq", "code", GH + "scottvr_gtrsnipe__pyproject.toml", 'requires-python = ">=3.10"')
gl = GH + "scottvr_gtrsnipe__LICENSE.md"
c("gs-lic1", "lic", gl, "# PolyForm Noncommercial License 1.0.0 ... The licensor grants you a copyright license for the software to do everything you might do with the software that would otherwise infringe the licensor's copyright in it for any permitted purpose.")
c("gs-lic2", "lic", gl, "Any noncommercial purpose is a permitted purpose.")
c("gs-lic3", "lic", gl, "Personal use for research, experiment, and testing for the benefit of public knowledge, personal study, private entertainment, hobby projects, amateur pursuits, or religious observance, without any anticipated commercial application, is use for a permitted purpose.")
c("gs-lic-com", "lic", GH + "scottvr_gtrsnipe__LICENSE-COMMERCIAL.md", "# Commercial License Addendum ... Commercial users, contact me at")
c("gs-lic-com2", "lic", GH + "scottvr_gtrsnipe__LICENSE-COMMERCIAL.md", "for a paid license.")

# ---- tuttut
tr = GH + "natecdr_tuttut__README.md"
tp = GH + "natecdr_tuttut__pyproject.toml"
c("tt-desc", "doc", tp, "A package to convert MIDI files to string instrument tabs")
c("tt-pyreq", "code", tp, 'requires-python = ">=3.9"')
c("tt-entry", "code", tp, "tuttut.midi_tabs_cli:main")
for q in ["It can handle any tuning for any number of strings, and will do the arrangement accordingly.",
          "On Linux, tkinter needs `sudo apt install python3-tk`",
          "The tool works best for single-channel, single-instrument MIDI files",
          "The sequence of notes and fingerings is modeled as a Hidden Markov Model (HMM), with the fingerings being the hidden states and the notes being the observed states ... we can make use of the Viterbi algorithm",
          "a difficulty metric",
          "The guitar fretboard is modeled as a complete graph",
          "Slides, Hammer-on, Pull-offs and other advanced techniques are not modeled."]:
    c("tt:" + q[:24], "doc", tr, q)
tg = GH + "natecdr_tuttut__tuttut_GUI_generate.py"
c("tt-gen1", "code", tg, "pretty_midi.PrettyMIDI(")
c("tt-gen2", "code", tg, "Tuning(")
c("tt-gen3", "code", tg, "Tab(")
c("tt-gen4", "code", tg, "to_ascii()")
c("tt-gen5", "code", tg, "to_json()")
c("tt-theory", "code", GH + "natecdr_tuttut__tuttut_logic_theory.py", "nfrets=20")
c("tt-weights", "code", GH + "natecdr_tuttut__tuttut_logic_tab.py", '"n_changed_strings"')
c("tt-lic", "lic", GH + "natecdr_tuttut__LICENSE", "MIT License ... Copyright (c) 2023 Nathan Candre")

# ---- tutts (npm)
nm = R + "/npm/tutts.json"
c("tutts-desc", "doc", nm, "Renderer-neutral MIDI to guitar-tab fingering engine (TypeScript port of tuttut).")
c("tutts-hmm", "doc", nm, "it frames fingering as a Hidden Markov Model (fretboard positions = hidden states, note onsets = observations) and uses Viterbi to pick the sequence that is easiest to play under a fret-height/span/string-change cost metric. The core is pure (zero runtime dependencies), ESM-only")
c("tutts-call", "doc", nm, "generateTab(")
c("tutts-std", "doc", nm, "Tuning.standardGuitar()")
c("tutts-data", "doc", nm, "the renderer-neutral result")
c("tutts-notes", "doc", nm, "`{ midi, startBeats, durationBeats }` (C4 = 60, time in quarter-note beats)")
c("tutts-adapter", "doc", nm, "a thin adapter")
c("tutts-lic", "lic", nm, '"license": "MIT"')
for q in ["toAscii", "toLines", "toSystems"]:
    c("tutts-" + q, "doc", nm, q)

# ---- tayuya
yr = GH + "vipul-sharma20_tayuya__README.md"
c("ty-what", "doc", yr, "Python library to generate guitar tabs from MIDI files")
for q in ["from tayuya import MIDIParser", "mid = MIDIParser('sample.mid', track=0)", "print(mid.render_tabs())",
          "mid.get_tracks()", "mid.notes_played()", "[{'note': 'C#5', 'time': 18}", "mid.get_key()"]:
    c("ty:" + q[:24], "doc", yr, q)
c("ty-setup", "code", GH + "vipul-sharma20_tayuya__setup.py", 'install_requires=["mido", "music21"]')
c("ty-tabs1", "code", GH + "vipul-sharma20_tayuya__tayuya_tabs.py", "Find best position (fret and string) for a note")
c("ty-tabs2", "code", GH + "vipul-sharma20_tayuya__tayuya_tabs.py", "note_nearest_to_fret(")
c("ty-tabs3", "code", GH + "vipul-sharma20_tayuya__tayuya_tabs.py", "generate_notes")
c("ty-const", "code", [GH + "vipul-sharma20_tayuya__tayuya_constants.py", GH + "vipul-sharma20_tayuya__tayuya_tabs.py"], "NOTE_TO_STRING")
c("ty-lic", "lic", GH + "vipul-sharma20_tayuya__LICENSE.md", "Copyright © 2019 Vipul Sharma ... Permission is hereby granted, free of charge, to any person obtaining")

# ---- LilyPond
lf = W + "lilypond_fretted.html"
c("ly-index", "doc", W + "lilypond_index.html", "LilyPond is free software and part of the GNU Project")
c("ly-index2", "doc", W + "lilypond_index.html", "a music engraving program")
c("ly-q1", "doc", lf, "By default pitches are assigned to the lowest playing position on the fretboard (first position). Open strings are automatically preferred. If you would like a certain pitch to be played on a specific string you can add a string number indication to the pitch name.")
c("ly-q2", "doc", lf, "The default value for minimumFret is 0. Even when minimumFret is set, open strings are used whenever possible. This behavior can be changed by setting restrainOpenStrings to #t.")
c("ly-q3", "doc", lf, "LilyPond tablature automatically calculates the fret for a note based on the string to which the note is assigned. In order to do this, the tuning of the strings must be specified. The tuning of the strings is given in the stringTunings property.")
c("ly-q4", "doc", lf, "The default string tuning is guitar-tuning , which is the standard EADGBE tuning. Some other predefined tunings are guitar-open-g-tuning")
c("ly-capo", "doc", lf, "a capo indication that can be placed on the fret diagram")
c("ly-lic", "lic", W + "lilypond_COPYING.txt", "GNU GENERAL PUBLIC LICENSE ... Version 3, 29 June 2007")

# ---- FretPath
fp = GH + "knoguchi_fretpath__README.md"
for q in ["Playable guitar fingering for MuseScore Studio 4.4+",
          "Computes playable guitar fingering - (string, fret, left-hand finger, position) for every note - using position-aware Viterbi dynamic programming, and writes a TAB staff and/or annotations.",
          "Unlike MuseScore's built-in conversion (StringData::convertPitch, a per-note greedy scan that picks the thinnest string with the lowest fret), this plugin optimizes the whole sequence",
          "respects existing finger-number and string-number annotations as hard constraints. Alternate tunings (drop D etc.) and fret counts are read automatically from the instrument's string data."]:
    c("fp:" + q[:24], "doc", fp, q)
c("fp-ms", "doc", W + "musescore_fretpath.html", "API compatibility")
c("fp-lic", "lic", GH + "knoguchi_fretpath__LICENSE", "GNU GENERAL PUBLIC LICENSE ... Version 3, 29 June 2007")

# ---- PyGuitarPro
pg = GH + "Perlence_PyGuitarPro__README.rst"
c("pg-what", "doc", pg, "PyGuitarPro is a package to read, write and manipulate GP3, GP4 and GP5 files. Initially PyGuitarPro is a Python port of AlphaTab which originally was a Haxe port of TuxGuitar.")
c("pg-imp", "doc", pg, "import guitarpro")
c("pg-parse", "doc", pg, "guitarpro.parse(")
c("pg-write", "doc", pg, "guitarpro.write(")
c("pg-docs", "doc", pg, "pyguitarpro.readthedocs.io")
c("pg-lic-pyp", "lic", GH + "Perlence_PyGuitarPro__pyproject.toml", 'license = "LGPL-3.0-only"')
c("pg-lic1", "lic", GH + "Perlence_PyGuitarPro__LICENSE", "GNU LESSER GENERAL PUBLIC LICENSE ... Version 3, 29 June 2007")
c("pg-lic2", "lic", GH + "Perlence_PyGuitarPro__LICENSE", "This version of the GNU Lesser General Public License incorporates the terms and conditions of version 3 of the GNU General Public License, supplemented by the additional permissions listed below.")

# ---- music21
mt = GH + "cuthbertLab_music21__music21_tablature.py"
for q in ["class FretNote", "class FretBoard", "class GuitarFretBoard", "class UkeleleFretBoard", "def getPitches",
          "requires a tuning to be set", "TODO: Chord from Figure", "Chord from FretBoard Object with tuning."]:
    c("m21:" + q[:24], "code", mt, q)
c("m21-lic1", "lic", GH + "cuthbertLab_music21__LICENSE", "Copyright (c) 2006-2026 Michael Scott Asato Cuthbert ... Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:")
c("m21-lic2", "lic", GH + "cuthbertLab_music21__README.md", "Music21 is Open-Source Software released under the BSD (3-clause) license.")

# ---- DadaGP
dr = GH + "dada-bots_dadaGP__README.md"
c("dg-enc", "doc", dr, "an encoder/decoder (v1.1) that converts gp3, gp4, gp5 files to/from this token format.")
c("dg-cmd1", "doc", dr, "python dadagp.py encode input.gp3 output.txt [artist_name]")
c("dg-cmd2", "doc", dr, "python dadagp.py decode input.txt output.gp5")
c("dg-req", "doc", dr, "PyGuitarPro 0.6 *(it ONLY works with 0.6")
c("dg-notes", "doc", dr, "rare combinations of instruments and tunings may not be supported; banjo is not supported; instrument-change events are not supported")
c("dg-lic", "lic", GH + "dada-bots_dadaGP__LICENSE", "MIT License ... Copyright (c) 2020 Dadabots")
c("dg-size", "doc", dr, "a dataset of 26,181 GuitarPro songs in 739 genres, converted to a token sequence format")
c("dg-access", "lic", dr, "*Please contact Dadabots or Pedro Sarmento via email or twitter ... to request access to the dataset for research purposes.*")
c("dg-paper-ug", "doc", H + "2107.14653v1.html", "the tablature site Ultimate Guitar")
c("dg-paper-200k", "doc", H + "2107.14653v1.html", "over 200,000 user-submitted GuitarPro files, containing notations of commercial music")
c("dg-paper-s7", "lic", H + "2107.14653v1.html", "we allow researchers to access DadaGP from a Zenodo repository, on application by request.")
c("dg-paper-eth", "doc", H + "2107.14653v1.html", "Is it wrong to train machine learning models on copyrighted music? ... What about commercial use?")

# ---- GuitarSet
c("gs-desc", "doc", Z + "3371780.json", "time-aligned annotations of pitch contours, string and fret positions, chords, beats, downbeats, and playing style")
c("gset-readme", "doc", GH + "marl_GuitarSet__README.md", "GuitarSet can be downloaded [here](https://zenodo.org/record/3371780).")
c("gset-notes", "doc", Z + "3371780.json", "Changes from version 1.0.1: - Added Key Annotation in each jams file - Removed impossible notes (negative frets)")
c("gset-lic-gh", "lic", GH + "marl_GuitarSet__LICENSE", "MIT License ... Copyright (c) 2018 Music and Audio Research Laboratory - NYU")

# ---- IDMT
c("idmt-1", "doc", Z + "7544110.json", "Seven different guitars in standard tuning were used ... The recordings are provided in one channel RIFF WAVE format with 44100 Hz sample rate.")
c("idmt-2", "doc", Z + "7544110.json", "The parameter annotations for the first and second subset are stored in XML format.")

# ---- EGDB
c("egdb-demo", "doc", W + "egdb_demo.html", "EGDB, that contains transcriptions of the electric guitar performance of 240 tablatures rendered with different tones")

# ---- GAPS
c("gaps-z1", "doc", Z + "13962272.json", "Links to YouTube URLs for audio and video are provided in the accompanying metadata file")
c("gaps-z2", "lic", Z + "17152440.json", "a newer version of this dataset is now available at https://huggingface.co/datasets/xavriley/GAPS which includes audio")
c("gaps-page", "lic", W + "gaps_project.html", "The GAPS dataset contains copyright material and is shared with researchers under the following conditions: GAPS may only be used by the individual signing below and by members of the research group or organisation of this individual. This permission is not transferable. GAPS may be used only for non-commercial research purposes. GAPS (or data enabling the its reproduction) may not be sold, leased, published or distributed to any third party without written permission from the GAPS administrator.")
c("gaps-hf-lic", "lic", HF + "gaps.README.md", "license: mit")

# ---- Guitar-TECHS
c("techs-page", "lic", W + "guitar-techs.html", "All data is freely available for download and use through a personalized Zenodo repository: All data is licensed under a Creative Commons Attribution 4.0 License (CC BY 4.0).")
c("techs-desc", "doc", Z + "14963133.json", "multi-perspective audio signals (direct input, amplifier microphone, egocentric/exocentric stereo microphones) and synchronized MIDI annotations per string")

# ---- GOAT
c("goat-readme", "lic", GH + "JackJamesLoth_GOAT-Dataset__README.md", "If you would like access to this dataset, please request access on the [Zenodo](https://zenodo.org/records/15690894) page.")
c("goat-abs", "doc", AX + "abs_2509.22655.txt", "5.9 hours of unique high-quality direct input audio recordings of electric guitars ... we provide a starting 29.5 hours of audio. Each recording is annotated using guitar tablatures ... the Guitar Pro format ... and a text-like token encoding.")
c("goat-z", "lic", Z + "15690894.json", "If you are interested in using this dataset, please contact us and include a short description of what you plan to use the dataset for. PLEASE READ BEFORE SUBMITTING A REQUEST: this dataset is non-commercial only, so I unfortunately cannot grant requests for any kind of commercial use case, even internal testing. I am sorry for the trouble. Open source and research projects are fine!")

# ---- smaller sets
c("egset12", "doc", Z + "11406378.json", "twelve real & original solo electric guitar performances")
c("scoreset", "doc", GH + "DjentleViBe_SCORE-SET__README.md", ".gp5 transcribed files, derived from the GiantMIDI and MAESTRO datasets")
c("scoreset-lic", "lic", GH + "DjentleViBe_SCORE-SET__LICENSE", "Attribution-NonCommercial-ShareAlike 4.0 International")
c("animetab", "doc", H + "2210.03027v1.html", "Our data and code have been made publicly available")

# ---- research table quotes
c("taptotab", "doc", AX + "abs_2409.08618.txt", "YOLO models for real-time fretboard detection, and Fourier Transform-based audio analysis for precise note identification")
c("taptotab2", "doc", AX + "abs_2409.08618.txt", "from video recordings")
c("dib-1", "doc", W + "pmc10698518.html", "549 video samples in MP4 format, and their respective audio samples in WAV format, covering nine different electric guitar techniques")
c("dib-2", "doc", W + "pmc10698518.html", "using a smartphone device")
c("dib-lic", "lic", W + "pmc10698518.html", "CC BY-NC-ND")
c("sdh", "doc", AX + "abs_2409.16629.txt", "accurately play diverse rhythms with complex chord pressing and string picking patterns based on the input guitar tabs")
c("strum1", "doc", [AX + "abs_2508.07973.txt", H + "2508.07973v1.html"], "an ESP32 smartwatch motion sensor")
c("strum2", "doc", [AX + "abs_2508.07973.txt", H + "2508.07973v1.html"], "only microphone audio")
c("kp-ml", "doc", AX + "abs_2510.10619.txt", "based on machine learning")
c("kp-tuning", "doc", AX + "abs_2510.10619.txt", "requires a basic assumption about how much fingers can stretch on a fretboard; only standard 6-string guitar tuning is examined.")
c("vgtc", "doc", AX + "abs_2311.14726.txt", "similarity, difficulty, and correctness")
c("gcds1", "doc", AX + "abs_2407.14260.txt", "taking into account the diagram of the previous chord")
c("gcds2", "doc", AX + "abs_2407.14260.txt", "improves the F1-score on this task by up to 27%")
c("fretiq1", "doc", AX + "abs_2607.18303.txt", "browser-based string classification system using a 26-dimensional feature representation ... and 13 Mel-Frequency Cepstral Coefficients")
c("fretiq2", "doc", AX + "abs_2607.18303.txt", "A recording-session-held-out evaluation yields 86.53 +/- 1.23 percent accuracy")
c("ttt-tone", "doc", AX + "abs_2504.07406.txt", "Tone-informed Transformer")

# ---- Fretting-Transformer
ft = H + "2506.14223v1.html"
c("ft-abs", "doc", AX + "abs_2506.14223.txt", "an encoderdecoder model that utilizes a T5 transformer architecture to automate the transcription of MIDI sequences into guitar tablature ... framing the task as a symbolic translation problem")
c("ft-capo", "doc", ft, "The conditioned model contains a CAPO# and TUNING#,#,#,#,#,# token in the input to condition the model for more flexibility and control over the outputs.")
c("ft-primer", "doc", ft, "By removing the conditioning tokens from the primer, it is also possible to let the model suggest a suitable tuning and capo option")
c("ft-capo7", "doc", ft, "from capo zero to capo seven")
c("ft-data", "doc", AX + "abs_2506.14223.txt", "DadaGP, GuitarToday, and Leduc")
c("ft-gtoday", "doc", ft, "Sourced from the 'GuitarToday' Patreon account")
c("ft-claim", "doc", AX + "abs_2506.14223.txt", "the Fretting-Transformer surpasses baseline methods like A* and commercial applications like Guitar Pro.")

# ---- MIDI-to-Tab
mtt = H + "2408.05024v1.html"
c("m2t-abs", "doc", AX + "abs_2408.05024.txt", "We train an encoder-decoder Transformer model in a masked language modeling paradigm to assign notes to strings. The model is first pre-trained on DadaGP ... and then fine-tuned on a curated set of professionally transcribed guitar performances.")
c("m2t-bart", "doc", mtt, "a Transformer with a bi-directional auto-encoder and a left-to-right decoder, based on the BART model architecture")
c("m2t-beam", "doc", mtt, "a custom beam search inference")
c("m2t-std", "doc", mtt, "Since we only predict string values, our fret predictions are always derived from the note-string assignment and an assumption of standard tuning. Similarly, our system does not handle the use of capos.")
c("m2t-15", "doc", mtt, "15 guitarists")
c("m2t-base", "doc", mtt, "one commercially available and two open-source implementations of automatic tablature systems")
c("m2t-gp8", "doc", mtt, "Guitar Pro 8 ... includes an algorithm to automatically produce tablature from score or MIDI. MuseScore ... is an open-source score editor with a similar functionality for generating tablature.")

# ---- GuitarTab
gtb = GH + "MusicGuitarTab_GuitarTab__README.md"
c("gtab-abs", "doc", AX + "abs_2607.26440.txt", "Our code will be released at:https://github.com/MusicGuitarTab/GuitarTab")
c("gtab-abs2", "doc", AX + "abs_2607.26440.txt", "a pitch-validity constrained decoding strategy that masks pitch-invalid TAB candidates during generation")
c("gtab-model", "doc", gtb, "src/model.py")
c("gtab-ft", "doc", gtb, "FrettingTransformer (T5-small)")
c("gtab-demo1", "doc", gtb, "Single file: audio/MIDI → tab")
c("gtab-demo2", "doc", gtb, "Run on a single audio or MIDI file and get ASCII tablature + MIDI output")
c("gtab-ckpt", "doc", gtb, "outputs/<exp_dir>/best_model.pt")
c("gtab-bp", "doc", gtb, "Audio input requires: `pip install basic-pitch onnxruntime`")
c("gtab-parser", "doc", gtb, "src/dadagp_parser.py")
c("gtab-parser2", "doc", gtb, ".tokens.txt parser")
c("gtab-leduc", "doc", AX + "abs_2607.26440.txt", "Francois Leduc")
c("gtab-10984521", "doc", gtb, "10984521")

# ---- Bontempi
c("bont-abs", "doc", AX + "abs_2407.09052.txt", "The basic fingering is derived by solving a constrained and multi-attribute optimization problem, which derives the best position of the fretting hand, not just the finger used at each moment. Then, by analyzing statistical data from the mySongBook corpus, the most common clichés and biomechanical feasibility, articulations, and expressive techniques are introduced. Finally, the obtained output is converted into MusicXML format")

# ---- midi2tab README
c("m2td-readme", "doc", GH + "maximoskp_midi2tab_Deconvolutions__README.md", "Transcribing guitar tabs from MIDI input")

# ---- visual tab comparison + guitar (Pei Xu)
c("pxu-link", "doc", W + "peixu_guitar.html", "github.com/xupei0610/guitar")

json.dump(C, open("/home/user/gtr/lanes/guitar-tab/verify/checks.json", "w"), indent=1, ensure_ascii=False)
print(len(C), "checks;", sum(1 for x in C if x["kind"] == "lic"), "license/terms")
