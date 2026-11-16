"""Gap round 2: update this lane's tools.json for the round's six items.

Usage: python3 -I gap2_tools_json.py [item ...]     (items 1 to 6; default: every item implemented below)

Idempotent: every change sets a field to a fixed value or replaces an entry by name, so running it again gives the same
file. Writes tools.json with ensure_ascii=False and indent=0 (one value per line, no indentation): with indent=2 the file
was 322,292 bytes before this round, over the 300 KB limit for files in this folder, and with indent=1 it reached
299,310 bytes after items 1 and 2. Only whitespace changes (json.loads gives the same object).
"""
import json
import sys

LANE = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key"
TJ = LANE + "/tools.json"

REFUSED = ("the kind of step this box's permission system refused three times in this lane (\"Reason: [Code from "
           "External]\": the madmom git build and the BTC run in the first round, the libKeyFinder CMake build in gap "
           "round 1)")


def find(d, name):
    for t in d["tools"]:
        if t["name"] == name:
            return t
    raise KeyError(name)


def item1(d):
    t = find(d, "STONE (Deezer; key signature and mode)")
    t["tried"] = False
    t["tried_how"] = None
    t["for_aaron"] = True
    t["not_run_reason"] = (
        "Not attempted (gap round 2, 2026-11-12). No Deezer STONE package on PyPI (deezer-stone HTTP 404; PyPI 'stone' "
        "3.5.5 is Dropbox's unrelated interface description language); installs from its cloned repository with Poetry "
        "or its Dockerfile, " + REFUSED + ". Its pyproject.toml pins python 3.10.*, torch 2.0.0, torchaudio 2.0.1, "
        "torchvision 0.15.1 and tensorflow 2.12.*: the torch 2.0.0+cpu cp310 wheel is 195,412,802 bytes and PyPI's "
        "tensorflow 2.12.1 cp310 x86_64 wheel 585,912,145 bytes, over the 200 MB per download the disk notice allowed. "
        "Steps for Aaron: for-aaron.md section 10 (Docker; both checkpoints on S3, S4, R1a, R1b, R1c, R2; "
        "scripts/stone_npz_labels.py turns class numbers into labels).")
    t["outputs"] = [
        "README: \"The command will generate a `/results/ckpt_name/results.npz` file with results saved in the same "
        "directory as audios.\"",
        "inference.py (main, 0c5f72d, read 2026-11-12): values.npz in <audio folder>/results/<checkpoint file name "
        "without .pt>/ (lines 170, 217-220), one entry per audio file keyed by its absolute path, holding "
        "torch.mean(yh, dim=0).argmax() over the file's segments (line 156): one class number per file",
        "README 'Mapping' section: semitone_ks.pt classes 0-11 to key signatures written as a major key and its relative "
        "minor (\"0: 'Bb Major/G minor'\"); the 24-class checkpoint's classes 0-23 to keys (\"0: 'B minor'\" ... \"23: "
        "'C# Major'\")",
    ]
    t["inputs"] = [
        "audio: Python 3.10 with Poetry; poetry run python -m inference /checkpoint/path /audio/path -e mp3 -tt ks "
        "(README); inference.py reads every *.<extension> file in the folder (line 210), resamples to the checkpoint's "
        "rate, mono mix, peak-normalised; device = \"cpu\" (line 167)",
    ]
    t["version"] = ("HEAD 2025-10-24 (commit 0c5f72d; same HEAD on 2026-11-12); pyproject.toml name stone version "
                    "0.1.0; paper https://arxiv.org/abs/2407.07408; checkpoints ckpt/semisupervised_ks_mode.pt "
                    "(764,986 bytes) and ckpt/semitone_ks.pt (1,307,770 bytes)")

    t = find(d, "key-cnn")
    t["tried"] = False
    t["tried_how"] = None
    t["for_aaron"] = True
    t["not_run_reason"] = (
        "Not attempted (gap round 2, 2026-11-12). No PyPI project (keycnn and key-cnn HTTP 404); installs from its "
        "cloned repository with setup.py install (README: \"Clone this repo and run ``setup.py install`` using Python "
        "3.6\"), " + REFUSED + ". setup.py pins tensorflow==1.15.2 (PyPI wheels for Python 3.5 to 3.7 only), "
        "numpy==1.16.0 and librosa==0.6.2. Steps for Aaron: for-aaron.md section 11 (Python 3.7 on Windows; deepspec "
        "and deepsquare on S3, S4, R1a, R1b, R1c, R2).")
    t["outputs"] = [
        "a global key, plain or in MIREX or JAMS format",
        "bin/key (read 2026-11-12): --mirex writes \"tonic<TAB>mode\"; --jams writes a JAMS file with namespace "
        "key_mode; otherwise the tonic, followed by \"m\" for minor; -d <dir> -e <ext> writes one file per input",
    ]
    t["constraints_accepted"] = [
        "models: key -m deepsquare, deepspec, winterreise; --jams",
        "keycnn/classifier.py aliases: deepspec -> deepspec_k16 (3,659,832 bytes), deepsquare -> deepsquare_k8 "
        "(3,712,064 bytes), shallowspec -> shallowspec_k4",
    ]

    t = find(d, "BeatNet+")
    t["tried"] = False
    t["tried_how"] = None
    t["for_aaron"] = True
    t["not_run_reason"] = (
        "Not attempted (gap round 2, 2026-11-12). No PyPI project (BeatNetPlus, beatnet-plus, beatnetplus HTTP 404); "
        "installs from its cloned repository with pip install -e ., " + REFUSED + ". Steps for Aaron: for-aaron.md "
        "section 12 (WSL, Python 3.9, madmom 0.16.1; scripts/beatnetplus_run.py runs generic_weights.pt and "
        "af_non_percussive_weights.pt online and offline on S3, S4, R1a, R1b, R1c, R2; written here, not run).")
    t["constraints_accepted"] = [
        "modes: online (particle filtering), offline (DBN), realtime, streaming (microphone)",
        "weights: generic_weights.pt, generic_main_weights.pt, af_non_percussive_weights.pt (non-percussive music, "
        "ambient, classical); 3,072,825, 3,072,890 and 3,073,019 bytes",
        "install: git clone, pip install -e . with numpy, librosa, madmom, torch, scipy, tensorboard, pyyaml, matplotlib",
        "src/BeatNetPlus/inference.py (bb90eb0): BeatNetPlusInference(weights, mode='online', inference_model='PF', "
        "plot=[], device='cpu', dim_in=288, num_cells=150, num_layers=4); offline DBN = madmom "
        "DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=50, observation_lambda=16); audio loaded at 22050 Hz",
    ]


OUT = "/home/user/gtr/lanes/chords-beats-key/out"
LIVECHORD = "LiveChord beat refiner (livechord-beat-refiner)"


def put_tool(d, entry, after=None):
    """Replace the entry with the same name, or insert it (after the named entry, else at the end)."""
    names = [t["name"] for t in d["tools"]]
    if entry["name"] in names:
        d["tools"][names.index(entry["name"])] = entry
    elif after in names:
        d["tools"].insert(names.index(after) + 1, entry)
    else:
        d["tools"].append(entry)


def put_handoff(t, h):
    t["handoffs_out"] = [x for x in t["handoffs_out"] if x.get("to") != h["to"]] + [h]


def livechord_scores():
    rows = {}
    for line in open(OUT + "/scores/scores.jsonl"):
        r = json.loads(line)
        rows[(r["tool"], r["variant"], r["clip"], r["subcommand"])] = r
    res = {}
    for prior in ("beat_this_final0", "madmom_dbn_downbeat"):
        for c in ("S3", "S4", "R1a", "R1b", "R1c"):
            r = rows[("livechord", "refine(prior=%s)" % prior, c, "beats")]
            b, dn = r["metrics"]["beats"], r["metrics"]["downbeats"]
            res["%s %s" % (c, prior)] = {
                "beats_F": round(b["f_measure"], 3), "beats_CMLt": round(b["CMLt"], 3), "beats_AMLt": round(b["AMLt"], 3),
                "beats_est": b["n_est"], "beats_truth": b["n_truth"],
                "downbeat_F": round(dn["f_measure"], 3), "downbeat_CMLt": round(dn["CMLt"], 3),
                "downbeats_est": dn["n_est"], "downbeats_truth": dn["n_truth"], "eval": r["eval_id"],
                "gtr_eval": r["gtr_eval_version"]}
    return res


def item2(d):
    entry = {
        "name": LIVECHORD,
        "kind": "research-model",
        "what": "Bidirectional Transformer that takes an audio file plus another tracker's beat and downbeat times and "
                "returns refined beat and downbeat times (PyPI summary: \"Bidirectional Transformer beat / downbeat / "
                "chord-boundary refiner — denoises beat_this, madmom, or librosa output using full audio context.\").",
        "url": "https://pypi.org/project/livechord-beat-refiner/",
        "version": "0.1.0 (PyPI wheel and sdist uploaded 2026-05-09); weights Hugging Face "
                   "livechord-music/livechord-beat-refiner revision faa1ce0f (created 2026-05-09, not gated), "
                   "model.safetensors 12,767,108 bytes; source application https://github.com/JJ110112/LiveChord "
                   "(HEAD ba989e5, 2026-09-06)",
        "tried": True,
        "tried_how": "local-cpu",
        "runs": [
            {"run_id": "r0726", "input_id": "S3 (package command line, Beat This! final0 prior)", "cores": 2,
             "wall_s": 40.23, "peak_mb": 585.8, "exit_code": 0,
             "output_files": ["samples/livechord/S3.cli_r0726_stdout.txt"],
             "metrics": {"cpu_s": 24.5, "slot_wait_s": 41.2,
                         "note": "first run in the new venv; printed applied: True, reason: ok, elapsed 26.195 s, 33 "
                                 "beats and 9 downbeats out; same counts and first 8 beats / 4 downbeats as the "
                                 "batch's S3 output"}},
            {"run_id": "r0727", "input_id": "S3,S4,R1a,R1b,R1c x priors Beat This! final0 and madmom downbeat tracker",
             "cores": 2, "wall_s": 37.8, "peak_mb": 478.0, "exit_code": 0,
             "output_files": ["samples/livechord/<clip>.livechord_<prior>.json",
                              "samples/livechord/batch_gap2_livechord_timings.jsonl",
                              "samples/scores/scores_livechord.jsonl"],
             "metrics": {"cpu_s": 41.1,
                         "per_job": "3.65 to 3.92 s wall (import 1.12 to 1.22 s, model load 0.031 to 0.057 s, "
                                    "refine() 1.69 to 1.89 s for 24.0 to 38.7 s of audio), 473.5 to 478.0 MB, torch 2 "
                                    "threads; every job applied: True",
                         "scores_gtr_eval_0.12.1": livechord_scores(),
                         "priors_rescored": "Beat This! final0 e1837 e1841 e1845 e1849 e1853, madmom downbeat tracker "
                                            "e1838 e1842 e1846 e1850 e1854 (gtr-eval 0.12.1; metrics identical to the "
                                            "first round's 0.11.1 evals of the same files)"}},
            {"run_id": "r0729", "input_id": "R2full (228.5 s, no truth), both priors", "cores": 2, "wall_s": 10.69,
             "peak_mb": 691.5, "exit_code": 0,
             "output_files": ["samples/livechord/R2full.livechord_<prior>.json"],
             "metrics": {"refine_s": {"beat_this_final0": 3.235, "madmom_dbn_downbeat": 3.492},
                         "beats_in_out": {"beat_this_final0": [266, 305], "madmom_dbn_downbeat": [265, 313]},
                         "downbeats_in_out": {"beat_this_final0": [71, 70], "madmom_dbn_downbeat": [67, 69]},
                         "median_inter_beat_interval_s": 0.8359}},
        ],
        "not_run_reason": None,
        "for_aaron": False,
        "callable_via": ["python", "cli"],
        "inputs": [
            "refine(audio_path, beats, downbeats): an audio file path (soundfile, librosa fallback; channels averaged; "
            "resampled to 22050 Hz; cut at 900 s) and the prior tracker's beat and downbeat times in seconds, each "
            "rasterised to the nearest 2048-sample frame",
            "command line: python -m livechord_beat_refiner.infer --audio <file> --beats <times> --downbeats <times> "
            "[--chord-json <file>] [--checkpoint <file>] [--threshold <x>]",
        ],
        "outputs": [
            "dict: refined_beats, refined_downbeats (lists of seconds, frame index / (22050 / 2048), rounded to 4 "
            "decimals), applied (False: input echoed back, never raises), reason, n_beats_in / n_beats_out, "
            "n_downbeats_in / n_downbeats_out, elapsed_sec; no tempo, meter, bar position or confidence; downbeats a "
            "subset of the beats in all 12 outputs here",
        ],
        "constraints_accepted": [
            "threshold (default 0.5), min_distance_beat (2 frames), min_distance_downbeat (4 frames), checkpoint_path",
            "no tempo range, meter or tempo hint argument",
        ],
        "license": {
            "code": {"spdx": "Apache-2.0",
                     "quote": "[Apache License 2.0](LICENSE) — code AND weights. The training data is not "
                              "redistributed; only the trained model artifact is released.",
                     "url": "https://huggingface.co/livechord-music/livechord-beat-refiner/raw/main/README.md"},
            "weights": {"name": "model.safetensors (Hugging Face livechord-music/livechord-beat-refiner)",
                        "quote": "[Apache License 2.0](LICENSE) — code AND weights.",
                        "url": "https://huggingface.co/livechord-music/livechord-beat-refiner"},
            "training_data": [
                {"name": "13,017 songs from a personal music library (not published)", "license": None,
                 "quote": "**Corpus**: 13,017 songs from a personal music library, predominantly East Asian pop, "
                          "Western pop / rock / R&B, jazz standards, and a smaller classical / folk tail.",
                 "url": "https://huggingface.co/livechord-music/livechord-beat-refiner/raw/main/README.md"},
            ],
            "service_terms": [],
        },
        "pricing": None,
        "handoffs_out": [
            {"to": "gtr-eval beats", "via_format": "one time per line (seconds), beats and downbeats files",
             "evidence": "scored here: e1839 e1840 e1843 e1844 e1847 e1848 e1851 e1852 e1855 e1856"},
        ],
        "unverified": [
            "the LiveChord application repository (JJ110112/LiveChord) is AGPL-3.0; the PyPI package and the weights "
            "are Apache-2.0 per the model card",
            "author measurements (model card): beat F1 0.920 / downbeat F1 0.936 on a 510-song gold subset and 0.881 / "
            "0.914 on the 7,389-song holdout, at +-93 ms, against filtered Beat This! final0 output as labels",
            "the first run in the venv (r0726) took 26.2 s inside refine() against 1.8 s in r0727; the cause was not "
            "isolated",
        ],
    }
    put_tool(d, entry)
    h = {"to": LIVECHORD, "via_format": "beat and downbeat times in seconds (two lists), plus the audio file",
         "evidence": "LiveChord README: \"Run any beat tracker (beat_this, madmom, librosa, ...) → beats / downbeats "
                     "lists\"; ran here with this tool's output as the prior (runs r0727, r0729; evals e1837 to e1856)"}
    put_handoff(find(d, "Beat This!"), h)
    put_handoff(find(d, "madmom"), h)


def set_unverified(t, drop, add):
    """Remove the listed items (exact text) and append the new ones once."""
    t["unverified"] = [u for u in t["unverified"] if u not in drop]
    for a in add:
        if a not in t["unverified"]:
            t["unverified"].append(a)


ISO = {"name": "Isophonics reference annotations (Beatles, Queen, Zweieck); no license or copyright statement on the "
               "page (survey.md, BTC)", "license": None, "quote": None,
       "url": "https://isophonics.net/content/reference-annotations"}
BILLBOARD = {"name": "McGill Billboard annotations", "license": "CC0 (annotations; audio not distributed)",
             "quote": "To the extent possible under law, the DDMAL has waived all copyright and related or neighbouring "
                      "rights to the McGill Billboard annotations.",
             "url": "https://ddmal.ca/research/The_McGill_Billboard_Project_(Chord_Analysis_Dataset)/"}
GIANTSTEPS = {"name": "GiantSteps Key / MTG Key / Tempo datasets; no license statement in the READMEs "
                      "(giantsteps-key-dataset 6bcd492, giantsteps-tempo-dataset d51ab24, read 2026-11-12); audio are "
                      "beatport.com previews fetched by a script", "license": None,
              "quote": "The audio files (604 files, size ~850Mb) can be downloaded from http://www.beatport.com/",
              "url": "https://github.com/GiantSteps/giantsteps-key-dataset"}


def item3(d):
    t = find(d, "madmom")
    t["license"]["training_data"] = [
        {"name": "RNNBeatProcessor (beats/2015/beats_blstm_[1-8].pkl): cited paper's training set, 88 Ballroom "
                 "excerpts (ISMIR 2004 tempo contest), 26 MIREX 2006 beat-tracking training and bonus files, 6 pieces "
                 "of Bello's set (120 files, 28.5 minutes); quote with two footnote marks dropped", "license": None,
         "quote": "The used training set consists of 88 audio excerpts taken from the ISMIR 2004 tempo induction "
                  "contest (also known as the \"Ballroom set\") with lengths of 10 seconds each, the 26 training and "
                  "bonus files from the MIREX 2006 beat tracking contest with lengths of 30 seconds, and 6 musical "
                  "pieces of the set introduced by Bello in [8] with lengths from 3 to 15 seconds.",
         "url": "https://www.dafx.de/paper-archive/2011/Papers/31_e.pdf"},
        {"name": "RNNDownBeatProcessor (downbeats/2016/downbeats_blstm_[1-8].pkl): Ballroom, Beatles, Hainsworth, "
                 "HJDB, RWC Popular, Robbie Williams, Rock, Carnatic, Cretan, Turkish (GTZAN, Klapuri, SMC test only)",
         "license": None,
         "quote": "We train the network on the datasets described in Section 3.1 — except the ones marked with an "
                  "asterisk (*) which are used for testing only — with 8-fold cross validation based on a random "
                  "splits.",
         "url": "https://archives.ismir.net/ismir2016/paper/000186.pdf"},
        {"name": "CNNChordFeatureProcessor + CRF (chords/2016/chords_cnnfeat.pkl, chords_cnncrf.pkl): Isophonics "
                 "(180 Beatles, 19 Queen, 18 Zweieck songs), RWC Popular (100), Robbie Williams (65)", "license": None,
         "quote": "We evaluate the proposed system using 8-fold cross-validation on a compound dataset that comprises "
                  "the following subsets:",
         "url": "https://arxiv.org/abs/1612.05082"},
        {"name": "DeepChromaProcessor + CRF (chroma/2016/chroma_dnn.pkl, chords/2016/chords_dccrf.pkl): Beatles, "
                 "Queen, Zweieck, RWC pop, Robbie Williams, 383 songs", "license": None,
         "quote": "The datasets total 383 songs or approx. 21 hours and 39 minutes of music. We perform 8-fold cross "
                  "validation with random splits.",
         "url": "https://arxiv.org/abs/1612.05065"},
        {"name": "CNNKeyRecognitionProcessor (key/2018/key_cnn.pkl): GiantSteps MTG Key (1077 pieces), McGill "
                 "Billboard (742 songs, 625 with key annotations), 1504 classical pieces from the authors' internal "
                 "database", "license": None,
         "quote": "Since we are interested in how well the models generalise across different genres, we use datasets "
                  "that encompass three distinct musical styles.",
         "url": "https://arxiv.org/abs/1808.05340"},
        {"name": "training set of the key CNN (second-hand, per the S-KEY paper)", "license": None,
         "quote": "trained on a varied corpus (electronic dance music, pop/rock, and classical music)",
         "url": "https://arxiv.org/html/2501.12907v2"},
        ISO, BILLBOARD, GIANTSTEPS,
    ]
    set_unverified(t, ["training data of the shipped models not stated in the code or license files read (UNVERIFIED; "
                       "the papers cited in the docstrings would settle it)"],
                   ["training data: from the papers the 0.16.1 docstrings cite (gap round 2, survey.md madmom); whether "
                    "each shipped file is the exact model of its paper is not stated (the DAFx 2011 beat paper trains "
                    "five networks, madmom 0.16.1 loads eight files from beats/2015/)",
                    "terms of RWC (page did not connect), Ballroom (HTTP 403), Hainsworth, HJDB, Robbie Williams, Rock, "
                    "Carnatic, Cretan, Turkish not read"])

    t = find(d, "CREMA (convolutional and recurrent estimators for music analysis)")
    t["outputs"] = [
        "JAMS document (JSON), namespace 'chord', with time, duration, value and confidence per segment; labels seen "
        "include A:min7, C:maj/3, B:maj7, A#:7, D:dim7, G#:dim7, D#:min/5, N",
        "vocabulary: 170 chord_tag classes (pumpp vocab \"3567s\": 12 roots x 14 qualities min, maj, dim, aug, min6, "
        "maj6, min7, minmaj7, maj7, 7, dim7, hdim7, sus2, sus4, plus N and X; model.h5 chord_tag layer 170 softmax "
        "units); docs: \"predicts chords out of an effective vocabulary of 602 classes\" with inversion (bass) tracking",
    ]
    t["license"]["training_data"] = [
        {"name": "Humphrey and Bello's 1217 tracks (Isophonics, Billboard, RWC Pop, MARL); the released model's "
                 "training index lists 973 track ids and its test index 244", "license": None,
         "quote": "For evaluation, we used the dataset provided by Humphrey and Bello [11], which includes 1217 tracks "
                  "from the Isophonics, Billboard, RWC Pop, and MARL collections.",
         "url": "https://archives.ismir.net/ismir2017/paper/000077.pdf"},
        ISO, BILLBOARD,
    ]
    set_unverified(t, ["vocabulary size not determined (model resources sit behind the symlink crema/models/chord, not "
                       "read)",
                       "weights ship inside the package; no separate weights license found; training data not read"],
                   ["weights ship inside the package; no separate weights license found",
                    "RWC Pop terms UNVERIFIED (page did not connect); MARL (uspop2002) annotation terms not found"])

    t = find(d, "lv-chordia / ISMIR 2019 large-vocabulary chord model (Chord-CNN-LSTM)")
    t["license"]["training_data"] = [
        {"name": "1217 songs from Isophonics, Billboard and MARL (Humphrey and Bello), 5-fold cross-validation",
         "license": None,
         "quote": "We use 1217 songs from Isophonics, Billboard and MARL collections collected by Humphrey and Bello "
                  "[11, 20] to form the dataset.",
         "url": "https://archives.ismir.net/ismir2019/paper/000078.pdf"},
        ISO, BILLBOARD,
    ]
    set_unverified(t, ["training data: the paper's dataset description and its license were not read (UNVERIFIED)"],
                   ["whether the five weight files (_s0 to _s4) are the paper's five cross-validation folds is not "
                    "stated in the files read"])

    t = find(d, "DeepRhythm")
    t["license"]["training_data"] = [
        {"name": "giantsteps, ballroom, slakh2100 and a small subset of fma, relabelled by majority vote of other "
                 "tempo estimators (author's project page, 2024-07-19)", "license": None,
         "quote": "For training data, I used giantsteps, ballroom, slakh2100, and a small subset of fma.",
         "url": "https://bleu.green/deeprhythm"},
        {"name": "Slakh2100 (Zenodo record 4599666; license id cc-by-4.0 in the Zenodo API)", "license": "CC BY 4.0",
         "quote": None, "url": "https://zenodo.org/api/records/4599666"},
        {"name": "Free Music Archive (FMA)", "license": "metadata CC BY 4.0; audio under each artist's license",
         "quote": "We do not hold the copyright on the audio and distribute it under the license chosen by the artist.",
         "url": "https://raw.githubusercontent.com/mdeff/fma/master/README.md"},
        GIANTSTEPS,
    ]
    set_unverified(t, ["training data not stated in the README (UNVERIFIED)"],
                   ["training data stated on the author's project page, not in the repository; which weights file "
                    "(0.5 or 0.7) it describes is not stated; Ballroom terms UNVERIFIED (contest page HTTP 403)"])


def item4(d):
    t = find(d, "pyace")
    t["what"] = ("Chord estimation from audio by Junqi Deng (2017 to 2021), a Python port of part of his MATLAB thesis "
                 "code; major and minor triads only (README).")
    t["version"] = "HEAD 2021-06-01 (commit 4321145); PyPI pyace 0.1.1, sdist only, uploaded 2017-09-01"
    t["callable_via"] = ["python", "cli"]
    t["inputs"] = [
        "README: pyace.simpleace(songpath, respath), pyace.deepace(songpath, respath, modelpath, acemode) (code "
        "signature deepace(songpath, respath, acemode, modelpath)); or \"python pyace.py [songpath] [acemode] "
        "[modelpath]\" with acemode simple, fcnn or rnn; audio loaded with librosa at 22050 Hz, mono",
    ]
    t["outputs"] = [
        "a text file at respath, one segment per line \"<start> <end> <label>\" separated by spaces, times in seconds "
        "rounded to 3 decimals on a 512 / 22050 s frame grid, labels as root names for major and \"<root>:min\" for minor "
        "(writeres in pyace.py; it writes a segment when the label changes and has no write after its loop, so the "
        "last segment is not written); simple mode: 24 major and minor triad labels, no no-chord class",
    ]
    t["constraints_accepted"] = [
        "acemode: simple (librosa chroma_cqt, hop 512, decoded by an hmmlearn GaussianHMM with hand-set triad "
        "templates, no trained weights) or fcnn / rnn (a Keras model file passed as modelpath)",
    ]
    t["not_run_reason"] = (
        "Not run (gap round 2, 2026-11-12: the task was one README read). RUNNABLE? not as installed from PyPI on "
        "Python 3: setup.py declares Python 2.7, pyace/__init__.py imports with \"from pyace import simpleace\" (a "
        "Python 2 implicit relative import; a synthetic copy of the layout failed under Python 3.13.18 with "
        "\"ImportError: cannot import name 'simpleace' from 'pyace'\", scripts/gap2/test_pyace_import_layout.py), and "
        "pyace.py imports keras at module level even for simple mode; requirements.txt pins hmmlearn==0.2.5 (PyPI "
        "wheels cp35 to cp39 only). The fcnn and rnn models are in a Dropbox zip (link answered HTTP 200 to a HEAD "
        "request, 57,054,721 bytes, not downloaded).")
    t["license"]["code"] = {
        "spdx": "BSD-3-style",
        "quote": "Copyright 2017 Junqi Deng Redistribution and use in source and binary forms, with or without "
                 "modification, are permitted provided that the following conditions are met:",
        "url": "https://raw.githubusercontent.com/tangkk/pyace/master/LICENSE"}
    t["license"]["weights"] = {
        "name": "fcnn / rnn Keras models (Dropbox models.zip)", "quote": None,
        "url": "https://www.dropbox.com/s/akyc2cxhdtgtm71/models.zip?dl=0"}
    t["unverified"] = [
        "README: \"This software is under BSD License. For commercial use of this software, please contact the "
        "author.\"; no license statement found for the Dropbox models",
        "the README's script route (python pyace.py from inside the source folder, with Keras installed) was not run; "
        "its imports resolve in a synthetic copy of the layout",
    ]


def replace_text(t, old, new):
    """Replace a substring in every string field of a tool entry; returns the number of fields changed."""
    n = 0

    def fix(x):
        nonlocal n
        if isinstance(x, dict):
            return {k: fix(v) for k, v in x.items()}
        if isinstance(x, list):
            return [fix(v) for v in x]
        if isinstance(x, str) and old in x:
            n += 1
            return x.replace(old, new)
        return x
    for k in list(t):
        t[k] = fix(t[k])
    return n


def item5(d):
    replace_text(find(d, "Essentia (KeyExtractor, TuningFrequency, RhythmExtractor2013, ChordsDetection, "
                         "ChordsDetectionBeats, TonalExtractor, PercivalBpmEstimator, TempoCNN)"),
                 "best matching major or minor triad (24 labels)",
                 "reference page: \"It finds the best matching major or minor triad and outputs the result as a string "
                 "(e.g. A#, Bm, G#m, C)\" (24 labels; https://essentia.upf.edu/reference/std_ChordsDetection.html)")
    replace_text(find(d, "ChordMini (ChordMiniApp)"),
                 "requires Python 3.10.x, Docker (recommended for the standalone Sheet Sage melody service), Firebase "
                 "account (free tier), Gemini API (free tier); optional keys for YouTube, Music.AI, Genius; spleeter only "
                 "for the Beat-Transformer path",
                 "README requirements: \"Python 3.10.x\", \"Docker (recommended for the standalone Sheet Sage melody "
                 "service)\", \"Firebase account (free tier)\", \"Gemini API (free tier)\"; optional keys for YouTube, "
                 "Music.AI, Genius; \"spleeter\" is \"only required by the current Beat-Transformer source-separation "
                 "path\"")
    replace_text(find(d, "STONE (Deezer; key signature and mode)"),
                 "two checkpoints under /ckpt: semisupervised_key_mode.pt (best Semi-TONE model for key signature and "
                 "mode estimation) and semitone_ks.pt (best STONE model for key signature estimation)",
                 "README (authors' wording): \"we provided two checkpoints under `/ckpt`. `semisupervised_key_mode.pt` is "
                 "the best Semi-TONE model for key signature and mode estimation. `semitone_ks.pt` is the best STONE "
                 "model for key signature estimation.\" (the file in ckpt/ is named semisupervised_ks_mode.pt)")


def item6(d):
    put_tool(d, {
        "name": "AudioEstimate (Hugging Face DionTimmer/audioestimate-1.0)",
        "kind": "research-model",
        "what": "Gated PyTorch checkpoint that estimates key in Camelot notation and BPM from audio (model card: "
                "\"AudioEstimate checkpoint for local music-library key and tempo estimation.\").",
        "url": "https://huggingface.co/DionTimmer/audioestimate-1.0",
        "version": "revision b1919117; created 2026-06-26, last modified 2026-06-28 (Hub API, read 2026-11-12); "
                   "model.pt 37,738,542 bytes, config.yaml, metrics.json, VERSION.md",
        "tried": False,
        "tried_how": None,
        "runs": [],
        "not_run_reason": "Gated: the files need an access request the author approves (Hub API gated \"manual\"; page: "
                          "\"You need to agree to share your Hugging Face information to access this model\"), a "
                          "consent step this lane does not take; no public inference code found (PyPI 404 for "
                          "audioestimate, audio-estimate, audio_estimate; no public GitHub repository under the names "
                          "tried). Steps for Aaron: for-aaron.md section 13.",
        "for_aaron": True,
        "callable_via": [],
        "inputs": ["audio (card); no public code to call it with"],
        "outputs": ["card: \"key branch: predicts 24 Camelot key classes\"; \"tempo branch: predicts BPM using "
                    "DeepRhythm-compatible HCQM tempo features\"; confidence values for both"],
        "constraints_accepted": ["card convention: BPM predictions below 90 doubled, raw BPM kept as metadata"],
        "license": {"code": None,
                    "weights": {"name": "model.pt (gated)", "quote": None,
                                "url": "https://huggingface.co/DionTimmer/audioestimate-1.0"},
                    "training_data": [],
                    "service_terms": [{"name": "Hugging Face gated-access conditions", "quote": None,
                                       "url": "https://huggingface.co/DionTimmer/audioestimate-1.0"}]},
        "pricing": None,
        "handoffs_out": [],
        "unverified": ["no license tag, no license field in the card data and no license text on the model page "
                       "(2026-11-12); the access conditions are behind a login and were not read",
                       "training data not named in the card (\"Accuracy depends on how close the target music library "
                       "is to the training distribution.\")",
                       "the \"AudioEstimate Python package and Electron desktop app\" the card names were not found"],
    })
    put_tool(d, {
        "name": "mixedkey (Go)",
        "kind": "open-source",
        "what": "Go library for musical key detection from mono PCM (README: \"Pure Go musical-key detection from mono "
                "PCM. Uses only the Go standard library — no cgo, no external DSP libraries, no bundled native "
                "binaries.\"); chroma plus correlation with 24 rotated key profiles; Camelot output.",
        "url": "https://github.com/cabbagekobe/mixedkey",
        "version": "v0.1.0, published 2026-07-20T04:24:13Z (proxy.golang.org), commit 723a590 (also HEAD of main on "
                   "2026-11-12); go.mod go 1.24",
        "tried": False,
        "tried_how": None,
        "runs": [],
        "not_run_reason": "Attempted 2026-11-12: the go get and go build of the module with the lane's glue "
                          "(scripts/gap2/mixedkey_run/main.go) were refused before they ran by the box's permission "
                          "system (\"Reason: [Code from External]\"); nothing was built, no run id. Go 1.24.7 is on the "
                          "box. Steps for Aaron: for-aaron.md section 14.",
        "for_aaron": True,
        "callable_via": ["go"],
        "inputs": ["mono []float64 in [-1, 1] and the sample rate (Detect, DetectWith, DetectCandidates, "
                   "DetectAllCandidates); it does not decode audio files; stereo mixed to mono by the caller"],
        "outputs": ["Key (tonic pitch class 0-11, Major or Minor), String and Camelot() give Camelot notation (\"8A\" A "
                    "minor, \"8B\" C major); Candidate lists with Support and Confidence; ErrTooShort, ErrNoKey"],
        "constraints_accepted": ["Options.Profile: Aarden-Essen (default), Krumhansl, Temperley, Bellman-Budge; no "
                                 "tuning, key-set or capo input"],
        "license": {"code": {"spdx": "MIT", "quote": "Permission is hereby granted, free of charge, to any person "
                             "obtaining a copy of this software and associated documentation files (the \"Software\"), "
                             "to deal in the Software without restriction, including without limitation the rights to "
                             "use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the "
                             "Software, and to permit persons to whom the Software is furnished to do so, subject to "
                             "the following conditions:",
                             "url": "https://raw.githubusercontent.com/cabbagekobe/mixedkey/"
                                    "723a590fd83334e4a4c1f52ae47c47fe2917497a/LICENSE"},
                    "weights": None, "training_data": [], "service_terms": []},
        "pricing": None,
        "handoffs_out": [],
        "unverified": ["author measurements in profiles.go comments (273-track rekordbox-labelled corpus, 85% "
                       "harmonically compatible agreement for the default profile) were not rerun",
                       "the lane's glue main.go was never compiled"],
    })


ITEMS = {1: item1, 2: item2, 3: item3, 4: item4, 5: item5, 6: item6}


def main():
    want = [int(a) for a in sys.argv[1:]] or sorted(ITEMS)
    raw = open(TJ, encoding="utf-8").read()
    d = json.loads(raw)
    for i in want:
        ITEMS[i](d)
    d["generated"] = "2026-11-12"
    out = json.dumps(d, indent=0, ensure_ascii=False)
    open(TJ, "w", encoding="utf-8").write(out)
    print("items", want, "->", TJ, len(out.encode("utf-8")), "bytes,", len(d["tools"]), "tools")


if __name__ == "__main__":
    main()
