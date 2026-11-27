# N-E6: slaps and thumps

Written 2026-11-27 by the N-E6 helper of the NOTES session (branch `research/guitar-notes`). Brief:
`../../sessions/NOTES.md`, sections 2 to 4, E6. Work folder, with every script, note list, score and log:
`/home/user/notes/runs/e6/` (`PROGRESS.md`, `bin/`, `feat/`, `notes/`, `out/`, `logs/`). Numbers:
`/home/user/notes/runs/e6/e6.json`. Only numbers are here. The keys and the players' tabs stay out of the repo.
No model was run. The work uses part 1's note lists and rolls, step 2's detector outputs, and new audio features.

## In short

- **The slap stage is not a default stage.** Of 96 configurations (9 tests x 2 feature scalings x 2 ways of
  pooling, each fitted two ways, and 6 of the tests a third way), none reaches half of the slap oracle's gain on gaps-paper, on the 2-of-3 vote of
  fl, gaps-paper and Transkun (vote3), or on N-E1's frozen 3-of-5 vote (vote5). Even the best configuration for each
  list, picked by looking at the test songs, gets 0.41, 0.31 and 0.08 of that gain. The brief asks for 0.5.
- **The configuration chosen by the declared rule** (below) is a small rule: at a detected hit, drop a note when
  few of the five tools have it and the models' onset at its pitch is weak. It is fitted on the other steel song
  plus GuitarSet dev24. On the steel songs it gets 0.41 of the oracle's gain on gaps-paper, 0.11 on vote3 and -0.04
  on vote5. It loses nothing on the nylon song. Refitted without dev24 and run on dev24, it costs gaps-paper
  0.0015 and the votes 0.002 to 0.006.
- **What works is a vote, not a slap test.** On the single models fl, gaps and Transkun, "do the other tools have
  it" removes many invented notes and meets the brief's rule (fl 0.64, gaps 0.67 of the oracle's gain, Transkun
  more than all of it, because most of Transkun's invented notes are not at slaps). That is N-E1's vote by another
  route. The votes already did it, which is why nothing is left for the stage to do on them.
- **The slap notes in the votes look like played notes.** In vote5, 3 to 5 of the five tools share each invented
  slap note. Most of them (13 of 21 on capo, 17 of 29 on standard) repeat a pitch that is still ringing in the key:
  the slap re-triggers it.
- **The audio features do not transfer between the two steel songs.** The harmonic rise at the note's partials
  separates slap notes from played notes at the keys' taps with an area under the curve of 0.73 (capo) and 0.67
  (standard). Its scale differs between the songs. Fitted on capo alone, the logistic model on the audio and roll
  features drops 102 to 156 played notes per list on standard. Per-song scaling makes it safe but weak.
- **The detector is not the bottleneck.** Given the keys' own taps as the gate (an ORACLE), the best test still
  gets only 0.37 / 0.13 / 0.04 of the oracle's gain on gaps-paper / vote3 / vote5. A model fitted on the very song it
  is scored on (an ORACLE) gets 0.96 / 1.10 / 0.83 on capo but only 0.38 / 0.26 / 0.08 on standard: on standard the
  slap notes cannot be told from played ones with these features at all.
- **Detectors, against the keys' taps** (gtr-eval onsets, 50 ms): HPSS percussive onsets (v-03) find every slap but
  also nearly every note (precision 0.284 / 0.412 on capo / standard). Demucs drums onsets (v-04) are precise but miss
  most thumps on standard (recall 0.144 for thumps there). A merged list with a fitted confidence scores F 0.626 to 0.658
  on capo and 0.561 to 0.582 on standard. On the nylon song, which has no slaps, every detector fires on most plucks (759 to 1432 events).
- **Checker (see the Checker section):** every headline number re-scores exactly with an independent scorer, and a
  re-run fit matches. But gaps-paper's 0.41 and its "no loss on tuning" come from a scaling artifact in the
  event-relative features; with it removed the same rule gets 0.13 and loses 0.0016 on tuning. The verdict stands.
- **Handoff:** event lists at `/home/user/gtv/notes/<S>/slaps/events.csv` and the chosen configuration's note lists
  at `/home/user/gtv/notes/<S>/e6-<tool>/notes.csv`, each marked `default_stage: false` in its `source.json`.

## What was run

**Inputs.** The three songs: capo (steel, standard tuning, capo 3), tuning (nylon, D G C F A C at -9 cents, no capo),
standard (steel, standard tuning, no capo). The keys have 258 taps on capo (146 thumps, 96 string slaps, 16 body
slaps), 211 on standard (118 thumps, 93 string slaps) and none on tuning.

**Note lists** (whole songs; the 30 s numbers are crops, as in N-E1):

| id | what | file |
|---|---|---|
| fl | guitar-fl (Riley et al.) | `/home/user/notes/runs/<S>/riley-fl/<S>.notes.csv` |
| gaps | guitar-gaps | `.../riley-gaps/` |
| gaps-paper | guitar-gaps-paper | `.../riley-gaps-paper/` |
| transkun | Transkun 2.0.1 (step 2's n-04, as E0 rescored it) | `/home/user/notes/runs/e0/rescore/<S>/n-04/bd/notes.csv` |
| vote3 | the brief's 2-of-3 vote of fl, gaps-paper, Transkun, median onset (N-E1's rule) | built by `bin/note_feats.py` |
| vote5 | N-E1's frozen 3-of-5 vote of fl, gaps, gaps-paper, Transkun, Basic Pitch (range hint), median onset | built by `bin/note_feats.py` |

Both votes reproduce N-E1's values: vote3 0.9572 / 0.8123 / 0.9209, vote5 0.9567 / 0.8256 / 0.9249 (capo / tuning /
standard). On dev24 every list reproduces part 1's mean F1 (gaps-paper 0.9146, vote3 0.9102, vote5 0.9053).

**The slap oracle** (ORACLE: it looks at the key). Remove exactly the list's invented notes that start within
50 ms of a key tap, the `taps_invented.py` rule. Its F1 is the target. "Share" below is (F1 after the stage - F1
before), summed over capo and standard, divided by the same sum for the oracle.

| list | capo before | capo oracle | standard before | standard oracle | invented at taps (capo / standard) |
|---|---|---|---|---|---|
| fl | 0.9199 | 0.9530 | 0.8917 | 0.9467 | 59 / 82 |
| gaps | 0.9189 | 0.9545 | 0.8787 | 0.9215 | 64 / 62 |
| gaps-paper | 0.9536 | 0.9702 | 0.8955 | 0.9266 | 28 / 44 |
| transkun | 0.8959 | 0.9036 | 0.8659 | 0.8776 | 14 / 17 |
| vote3 | 0.9572 | 0.9679 | 0.9209 | 0.9429 | 18 / 31 |
| vote5 | 0.9567 | 0.9691 | 0.9249 | 0.9457 | 21 / 29 |

**Scoring.** The scorer of record is gtr-eval 0.12.1 `notes --no-ledger` (onset within 50 ms, pitch within 50
cents, offsets ignored, one to one) and `onsets --field taps --no-ledger` for the detectors. Fitting used an
in-process copy of its matching (N-E1's `e1lib.py`, copied to `bin/`). The base, oracle and handed-off lists were
then scored again with the gtr-eval CLI, whole songs and 30 s segments. With `--no-ledger` there are
no eval ids. All 72 CLI scores equal the in-process values (r1550). Dev24 is the mean of the 24 per-clip F1 values, each over its crop window, as part 1 scored it.

**Runs** (`gtr-run --lane notes`):

| run | what | wall | cores |
|---|---|---|---|
| r1536, r1537, r1538 | audio features of capo, tuning, standard (`bin/feat_audio.py`) | 67, 54, 52 s | `--nolock`, about 1 min CPU each |
| r1543 | dev24: v-03-style hits and audio features of the 24 clips (`bin/feat_dev.py`) | 276 s | 2 |
| r1545 | the fits, steel and loso3 schemes, 9 tests x 2 scalings x 2 poolings (`bin/fit.py`) | 201 s | 2 |
| r1546 | the fits, steeldev scheme, 6 tests x 2 x 2 | 175 s | 2 |
| r1547 | the ORACLE tap-gate diagnostic, steel scheme, 5 tests x 2 x 2 | 33 s | 2 |
| r1548 | the chosen configuration and the support-only rule applied, lists written, dev24 check (`bin/apply.py`) | 36 s | 2 |
| r1550 | the gtr-eval CLI on 72 lists, whole and 30 s (`bin/score_cli.py`) | 122 s | 2 |

The audio features ran per song without a slot because both slots were held by other lanes' long jobs and each
song took about a minute of CPU. One exploratory model run (about 6 minutes of CPU, robust scaling on the old
feature set, a scratch script) ran outside gtr-run by mistake; it fed no number in this record. The events step
(`bin/events.py`, 12 s), the per-note features (`bin/note_feats.py`, 3 s a song) and the tables took under 15 s each.

## Step 1: the detectors against the keys' taps

The detector outputs are step 2's, reused: v-03 = librosa onsets of the HPSS percussive part
(`/home/user/gtv/experiments/<S>/v-03/taps.txt`), v-04 = librosa onsets of the Demucs htdemucs_6s drums stem
(`.../v-04/taps.txt`). Their WAVs were not kept, so I did not re-run them.

The merged list takes every v-04 event and every v-03 event with no v-04 event within 50 ms. Each event gets a
confidence: a logistic model on the event's percussive flux, full-spectrum flux, low/high percussive balance,
percussive share and which detectors fired (`bin/events.py`). It is fitted on the other steel song (tuning: on both),
so it never sees the song it scores. The cut is 0.5, or the threshold with the best tap F on the training song.

| detector | capo F | P | R | events | standard F | P | R | events |
|---|---|---|---|---|---|---|---|---|
| v-03 HPSS | 0.442 | 0.284 | 1.000 | 910 | 0.581 | 0.412 | 0.986 | 505 |
| v-04 Demucs | **0.820** | 0.963 | 0.713 | 191 | 0.479 | 0.932 | 0.322 | 73 |
| union | 0.440 | 0.282 | 1.000 | 915 | 0.578 | 0.409 | 0.986 | 509 |
| merged, conf > 0.5 | 0.658 | 0.517 | 0.907 | 453 | 0.561 | 0.733 | 0.455 | 131 |
| merged, conf > fitted cut (0.45 / 0.35) | 0.626 | 0.477 | 0.911 | 493 | **0.582** | 0.630 | 0.540 | 181 |

Recall by kind (step 2's files for v-03 and v-04; `out/events_by_kind.txt` for the merged list at the fitted cut):

| | capo thumps | capo string slaps | capo body slaps | standard thumps | standard string slaps |
|---|---|---|---|---|---|
| v-03 | 1.000 | 1.000 | 1.000 | 0.975 | 1.000 |
| v-04 | 0.603 | 0.833 | 1.000 | 0.144 | 0.548 |
| merged, fitted cut | 0.842 | 1.000 | 1.000 | 0.517 | 0.570 |

- **No detector is good on both songs.** v-04 is the best on capo and the worst on standard, where its drums stem
  misses 101 of 118 thumps. The merged list is second on capo and level with v-03 on standard.
- **v-03 is a note onset detector.** It fires within 50 ms of 820 of gaps-paper's 823 capo notes. As a gate it
  selects nothing: the per-note test has to do all of the work.
- **On the nylon song every detector fires on the plucks**: v-03 759 events, v-04 1184, the merged list 1432, of
  which 1162 pass conf 0.5. The key has no taps there, so every one is false. A slap stage keyed on hits alone would
  have to be switched off for nylon.

## Step 2: what the slap notes look like

For each note of each list I computed (`bin/note_feats.py`, `bin/prep.py`): the harmonic power at its first six
partials after the onset (60-200 ms) against before (-120 to -20 ms), on an HPSS harmonic part (n_fft 4096, 10 ms
hop); the same on the full spectrogram and on the fundamental alone; the power on the partials against between
them ("pitched"); the decay from 20-80 ms to 150-300 ms; the Riley rolls' onset and frame values at its pitch
(fl, gaps, gaps-paper: largest and mean onset within 50 ms, frame value before and after); how many of fl, gaps,
gaps-paper, Transkun and Basic Pitch have the pitch within 50 ms (support, 1 to 5); the percussive flux at the
onset; the note's length; how many notes start with it; whether the same pitch started in the last second; and,
for four of these, the value minus the largest among the notes starting within 50 ms. Numbers: `out/step2.json`.

**What the invented notes at taps are** (pitch against the key notes sounding at that moment):

| list | invented at taps (capo / standard) | the same pitch is ringing | an octave or twelfth of a ringing note | another pitch |
|---|---|---|---|---|
| fl | 59 / 82 | 34 / 55 | 3 / 12 | 22 / 15 |
| gaps-paper | 28 / 44 | 19 / 19 | 3 / 17 | 6 / 8 |
| vote3 | 18 / 31 | 10 / 21 | 2 / 2 | 6 / 8 |
| vote5 | 21 / 29 | 13 / 17 | 2 / 5 | 6 / 7 |

Most are re-triggers: the slap or thump shakes a string that is already sounding and every model reads a new
onset. In vote5 each of them is shared by 3 to 5 of the five tools (capo: 9 by three, 6 by four, 6 by all five;
standard: 14, 12, 3). For fl the support test catches most of them (40 of 59 capo slap notes have support 2 or less, against 1 of
781 played notes), which is why it works as a filter on fl.

**How well each feature separates invented from played notes at the keys' taps** (area under the ROC curve, gaps-
paper, vote3 and vote5 pooled; 0.5 = no use; a value below 0.5 means a high value marks an invented note):

| feature | capo | standard |
|---|---|---|
| rolls' mean onset at the pitch | **0.858** | **0.842** |
| support (tools that have it) | 0.824 | 0.854 |
| rolls' frame rise (after - before) | 0.809 | 0.791 |
| rolls' frame value after | 0.792 | 0.832 |
| harmonic rise at the partials | 0.729 | 0.672 |
| rise at the fundamental | 0.721 | 0.694 |
| pitched (on against between the partials) | 0.691 | 0.644 |
| percussive flux at the onset | 0.146 | 0.373 |
| rolls' frame value before | 0.298 | 0.375 |

Medians, same notes:

| feature | capo: invented at taps | played at taps | played elsewhere | standard: invented at taps | played at taps | played elsewhere |
|---|---|---|---|---|---|---|
| harmonic rise (dB) | 2.9 | 8.4 | 12.1 | 7.8 | 13.2 | 8.7 |
| pitched (dB) | 7.8 | 15.6 | 17.0 | 6.3 | 11.2 | 9.6 |
| rolls' mean onset | 0.49 | 0.80 | 0.83 | 0.43 | 0.72 | 0.82 |
| rolls' frame before | 0.51 | 0.22 | 0.06 | 0.28 | 0.04 | 0.36 |

- **The audio evidence moves between the songs.** A slap note on standard has a harmonic rise of 7.8 dB, almost
  that of a played note anywhere on standard (8.7 dB). On capo it is 2.9 dB. A threshold that is right on one song is
  wrong on the other.
- **The rolls are steadier** (onset 0.43-0.49 for slap notes, 0.72-0.83 for played ones on both songs), but they
  are the same models whose notes we are judging, so they can only remove what most models doubt.

## Step 3: the tests

A note is tested only when it starts within 50 ms of a detected hit. The gate is v-03 or v-04, chosen by the fit.
The tests (`bin/fit.py`) came in two rounds. The first fits (steel scheme, raw features) showed that thresholds
fitted on one song did not carry to the other; I then added the robust scaling, the event-relative features, the
core feature set and the dev24 scheme. Every configuration of both rounds is reported.

| test | what drops a tested note |
|---|---|
| sup | support of s or fewer tools (s fitted) |
| rule1 | one feature beyond one threshold (feature, side and threshold fitted), support among the features |
| rule1-nosup | the same without support |
| rule2 | support of s or fewer and one feature beyond a threshold |
| tree2, tree2-nosup | a depth-2 decision tree (at least 20 notes a leaf), then a probability threshold (Checker: tree2-nosup is in `fit.py` but was not run in any of the 96 configurations) |
| lr-audio, lr-nosup, lr-all, lr-core, lr-core-sup | logistic regression (L2, C = 1) on the audio features; audio and rolls; everything; 9 core features; core and support (Checker: lr-audio was not run either; the 9 tests run are sup, rule1, rule1-nosup, rule2, tree2, lr-nosup, lr-all, lr-core, lr-core-sup) |

Each test in two feature scalings: raw, and robust-scaled within each list (median and interquartile range of the
song's own estimated notes; no key, nothing from other songs). Each in two poolings: one model for all six lists, or
one per list. Each fitted two ways, and 6 of the 9 tests (sup, rule1-nosup, rule2, tree2, lr-all, lr-core-sup) a
third way (FITTING RULE):

| scheme | capo from | standard from | tuning from |
|---|---|---|---|
| steel | standard | capo | capo + standard |
| loso3 | standard + tuning | capo + tuning | capo + standard |
| steeldev | standard + dev24 | capo + dev24 | capo + standard + dev24 |

The label is "invented". Probability thresholds are chosen on out-of-fold probabilities (5 time blocks per training
song, by clip for dev24), then the model is refitted on all the training notes. Rule thresholds are chosen on the
training songs directly. The objective is the mean F1 of the lists after the drop. Ties go to dropping fewer notes.

**Selection rule** (declared after seeing the steel and loso3 tables and the first steeldev rows, before the rest
of steeldev and the tap-gate runs): among
the configurations that do not look at the key, the one with the highest mean share over gaps-paper, vote3 and
vote5, with no tuning loss on any of those three. It is `steeldev/rule2@rs/per-list`. Picking one of 96 rows on the
test songs flatters it; E7 is the real test.

### Every configuration, by the share of the oracle's gain

Full table: `out/tables.md` (96 rows, plus 20 tap-gate rows). "Meets" = share 0.5 or more over the steel songs and no
loss on tuning, for that list.

| list | configurations that meet the rule (of 96) | best share of any configuration | its tuning change |
|---|---|---|---|
| fl | 19 | 0.64 (steeldev rule2, rs, per list) | +0.0037 |
| gaps | 25 | 0.76 (loso3 lr-all, rs, pooled) | +0.0104 |
| gaps-paper | **0** | 0.41 (steeldev rule2, rs, per list) | +0.0038 |
| transkun | 83 | 1.83 (steeldev tree2, rs, per list) | +0.0124 |
| vote3 | **0** | 0.31 (loso3 sup, raw, pooled) | +0.0018 |
| vote5 | **0** | 0.08 (steeldev lr-core-sup, rs, pooled) | +0.0002 |

Selected rows: the best of each scheme by the mean share over gaps-paper, vote3 and vote5 (with and without a
tuning loss), the support rule alone, and a typical one-song audio model:

| configuration | fl | gaps | gaps-paper | transkun | vote3 | vote5 |
|---|---|---|---|---|---|---|
| steeldev rule2, rs, per list (**chosen**) | 0.64 | 0.67 | 0.41 | 1.81 | 0.11 | -0.04 |
| steeldev sup, pooled (support alone; loso3 sup is the same, the best of loso3) | 0.64 | 0.66 | 0.35, tuning -0.0076 | 1.79 | 0.31 | 0.00 |
| steeldev lr-core-sup, rs, pooled (best of steeldev) | 0.55 | 0.68, tuning -0.0044 | 0.40, tuning -0.0058 | 1.53 | 0.30 | 0.08 |
| loso3 rule2, rs, per list (best of loso3 with no tuning loss) | 0.11 | 0.73 | 0.20 | 1.78 | 0.11 | -0.00 |
| steel rule1-nosup, rs, pooled (best of steel) | 0.25 | 0.38 | 0.17 | 1.62 | 0.13 | -0.07 |
| steel lr-nosup, raw, pooled | -0.70 | -0.60 | -1.72 | -2.85 | -2.89 | -3.17 |

- **Training on one steel song is the worst.** The last row is typical of the audio models in the steel scheme:
  fitted on capo, lr-nosup drops 102 to 156 played notes per list on standard.
- **Adding dev24 or the nylon song to the training makes the tests careful.** Probably because both have many
  played notes that the models doubt, so a fit there does not learn to drop on doubt alone. The tests then drop only
  the clearest cases.
- **The fitted rules choose the other tools and the rolls, nearly never the audio.** Over all 576 rule fits
  (rule1, rule1-nosup and rule2, every scheme, scaling, pooling, fold and list), an audio feature was chosen 34 times. The chosen
  configuration's rules are all "support of 2 to 4 or fewer and a weak roll onset" (`on_max`, `on_mean`,
  `fr_rise`, or the roll onset against the other notes of the moment).

### Two ORACLE diagnostics: is it the detector or the test?

| diagnostic (looks at the key) | gaps-paper | vote3 | vote5 |
|---|---|---|---|
| gate = the keys' own taps, best of 20 configurations (steel scheme) | 0.37 | 0.13 | 0.04 |
| logistic regression on every feature, robust-scaled, fitted on the song it scores: capo | 0.96 | 1.10 | 0.83 |
| the same: standard | 0.38 | 0.26 | 0.08 |

A perfect detector would not save the stage: the test is the weak part. On capo the features do separate the slap
notes when the model has seen that song. On standard they do not, even then.

## Step 4: the chosen configuration on the six lists

`steeldev/rule2@rs/per-list`: at a v-03 hit (v-04 for vote5), drop a note when at most s of the five tools have it
and a roll-onset feature (robust-scaled within the list) is below a threshold. Fitted per list on the other steel
song plus dev24 (tuning: both steel songs plus dev24). Matched again in process; the CLI values are in the next table.

| song | list | F1 before | after | slap oracle | invented removed (at taps / elsewhere) | found notes lost | share of oracle's gain |
|---|---|---|---|---|---|---|---|
| capo | fl | 0.9199 | 0.9467 | 0.9530 | 48 (40 / 8) | 0 | 0.81 |
| capo | gaps | 0.9189 | 0.9519 | 0.9545 | 77 (55 / 22) | 16 | 0.93 |
| capo | gaps-paper | 0.9536 | 0.9630 | 0.9702 | 17 (13 / 4) | 1 | 0.56 |
| capo | transkun | 0.8959 | 0.9182 | 0.9036 | 47 (4 / 43) | 6 | 2.90 |
| capo | vote3 | 0.9572 | 0.9607 | 0.9679 | 6 (3 / 3) | 0 | 0.33 |
| capo | vote5 | 0.9567 | 0.9564 | 0.9691 | 7 (7 / 0) | 7 | -0.03 |
| standard | fl | 0.8917 | 0.9216 | 0.9467 | 61 (51 / 10) | 13 | 0.54 |
| standard | gaps | 0.8787 | 0.8984 | 0.9215 | 44 (40 / 4) | 12 | 0.46 |
| standard | gaps-paper | 0.8955 | 0.9057 | 0.9266 | 22 (22 / 0) | 6 | 0.33 |
| standard | transkun | 0.8659 | 0.8786 | 0.8776 | 21 (10 / 11) | 2 | 1.09 |
| standard | vote3 | 0.9209 | 0.9209 | 0.9429 | 0 | 0 | 0.00 |
| standard | vote5 | 0.9249 | 0.9240 | 0.9457 | 1 (1 / 0) | 2 | -0.04 |
| tuning | fl | 0.7976 | 0.8014 | no slaps | 12 (- / 12) | 5 | |
| tuning | gaps | 0.8299 | 0.8366 | | 17 (- / 17) | 5 | |
| tuning | gaps-paper | 0.8217 | 0.8255 | | 7 (- / 7) | 1 | |
| tuning | transkun | 0.7849 | 0.7939 | | 32 (- / 32) | 12 | |
| tuning | vote3 | 0.8123 | 0.8138 | | 8 (- / 8) | 4 | |
| tuning | vote5 | 0.8256 | 0.8263 | | 1 (- / 1) | 0 | |

Over the two steel songs: fl 0.64, gaps 0.67, gaps-paper 0.41, Transkun 1.81, vote3 0.11, vote5 -0.04 of the
oracle's gain. No loss on the nylon song for any list: it removes 1 to 32 invented notes there and loses 0 to 12
found ones.

**Dev24** (the 24 GuitarSet clips, no slaps; the rule refitted on capo + standard only, so dev24 is unseen):

| list | before | after | notes removed | invented removed | found lost | clips lower |
|---|---|---|---|---|---|---|
| fl | 0.8957 | 0.9022 | 174 | 112 | 62 | 4 |
| gaps | 0.8660 | 0.8856 | 177 | 155 | 22 | 4 |
| gaps-paper | 0.9146 | 0.9131 | 65 | 31 | 34 | 11 |
| transkun | 0.7710 | 0.7870 | 163 | 139 | 24 | 1 |
| vote3 | 0.9102 | 0.9042 | 105 | 33 | 72 | 10 |
| vote5 | 0.9053 | 0.9033 | 39 | 17 | 22 | 11 |

On the lists that matter (gaps-paper and the votes) the stage costs 0.0015 to 0.006 on dev24.

**The support rule alone** (`steeldev/sup@raw/pooled`: at a v-03 hit, drop a note that at most 2 of the five tools
have) is the plainest test. It gets 0.35 on gaps-paper, 0.31 on vote3 and nothing on vote5 (a 3-of-5 vote has no
such notes). It loses on the nylon song: gaps-paper 0.8217 to 0.8141 (18 found notes lost), gaps 0.8299 to 0.8233.
On dev24 it costs gaps-paper 0.0102 and vote3 0.0060.

### CLI check and 30 s segments

All 72 lists (base, chosen, support only, oracle; six lists; three songs) were scored again with the gtr-eval CLI,
whole songs and 30 s segments (the whole-song list cropped to the segment, against the segment key cut by
`crop_truth.py`: capo from 12.76 s, tuning 25.0 s, standard 0.0 s). Every whole-song and segment F1 equals the
in-process value to 1e-5 (gtr-run r1550; `out/cli.json`, eval files in `out/cli/`).

| song | list | before, whole / 30 s | chosen | support only | slap oracle |
|---|---|---|---|---|---|
| capo | fl | 0.9199 / 0.9412 | 0.9467 / 0.9505 | 0.9467 / 0.9505 | 0.9530 / 0.9552 |
| capo | gaps | 0.9189 / 0.9224 | 0.9519 / 0.9552 | 0.9469 / 0.9604 | 0.9545 / 0.9439 |
| capo | gaps-paper | 0.9536 / 0.9458 | 0.9630 / 0.9600 | 0.9600 / 0.9552 | 0.9702 / 0.9552 |
| capo | transkun | 0.8959 / 0.8976 | 0.9182 / 0.9082 | 0.9182 / 0.9082 | 0.9036 / 0.9020 |
| capo | vote3 | 0.9572 / 0.9552 | 0.9607 / 0.9552 | 0.9607 / 0.9552 | 0.9679 / 0.9600 |
| capo | vote5 | 0.9567 / 0.9604 | 0.9564 / 0.9548 | 0.9567 / 0.9604 | 0.9691 / 0.9652 |
| standard | fl | 0.8917 / 0.9881 | 0.9216 / 0.9960 | 0.9216 / 1.0000 | 0.9467 / 0.9881 |
| standard | gaps | 0.8787 / 0.9919 | 0.8984 / 0.9919 | 0.9022 / 0.9919 | 0.9215 / 0.9919 |
| standard | gaps-paper | 0.8955 / 0.9960 | 0.9057 / 0.9960 | 0.9058 / 0.9960 | 0.9266 / 0.9960 |
| standard | transkun | 0.8659 / 0.9760 | 0.8786 / 0.9839 | 0.8782 / 0.9879 | 0.8776 / 0.9760 |
| standard | vote3 | 0.9209 / 0.9960 | 0.9209 / 0.9960 | 0.9275 / 0.9960 | 0.9429 / 0.9960 |
| standard | vote5 | 0.9249 / 0.9960 | 0.9240 / 0.9960 | 0.9249 / 0.9960 | 0.9457 / 0.9960 |
| tuning | fl | 0.7976 / 0.7826 | 0.8014 / 0.7980 | 0.8003 / 0.8060 | no slaps |
| tuning | gaps | 0.8299 / 0.8073 | 0.8366 / 0.8131 | 0.8233 / 0.8269 | |
| tuning | gaps-paper | 0.8217 / 0.8134 | 0.8255 / 0.8173 | 0.8141 / 0.8293 | |
| tuning | transkun | 0.7849 / 0.7905 | 0.7939 / 0.7961 | 0.7904 / 0.7980 | |
| tuning | vote3 | 0.8123 / 0.8155 | 0.8138 / 0.8155 | 0.8142 / 0.8155 | |
| tuning | vote5 | 0.8256 / 0.8309 | 0.8263 / 0.8309 | 0.8256 / 0.8309 | |

The standard segment (0 to 30 s) has no slaps: the key's first tap there is at 37.3 s. So the film's standard
segment cannot show this stage. On the capo segment the chosen stage beats the slap oracle on gaps and Transkun,
because it also removes invented notes that are not at slaps.

## Is it a default stage?

**No.** The brief's rule is half the oracle's gain and no loss on the nylon song. The chosen configuration loses
nothing on the nylon song, but reaches 0.41 of the gain on gaps-paper, 0.11 on vote3 and -0.04 on vote5. No other
configuration reaches 0.5 on any of these three lists either. It does pass the rule on fl, gaps and Transkun alone,
but those lists are not the pipeline, and on them it acts as a vote. The pipeline's own vote (N-E1) already removes
what this stage can find.

What would be needed, from what step 2 and the diagnostics show: evidence the models do not already share. The slap
notes are mostly ringing strings re-triggered by the hit, with real harmonic energy at their pitch. A test would have
to tell "this string was plucked" from "this string was shaken", for example from the attack's shape at each partial
over the first 20-40 ms, or a model trained on slaps (Noise-to-Notes, if its weights come out). The 10 ms features
here do not.

## Checker

Independent check, 2026-11-27, by the N-E6 checker of the NOTES session. Work folder
`/home/user/notes/runs/check-e6/` (`PROGRESS.md`, `bin/`, `rescore.json`, `refit_*.json`). My own scorer: mir_eval
`match_notes` / `precision_recall_f1_overlap`, onset 50 ms, 50 cents, offsets ignored, on the truth JSON directly
(not gtr-eval, not `e1lib`). My own slap oracle: drop each list note that my matching leaves unmatched and that starts
within 50 ms of a key tap.

**What holds.**

| check | how | result |
|---|---|---|
| F1 of the base, slap-oracle, chosen and support-only lists, 6 lists x 3 songs, whole songs | my scorer on E6's lists and on the handoff `notes.csv` | all 72 equal the record to 4 decimals; handoff = `notes/rule2@rs-per-list-steeldev` |
| shares of the oracle's gain, chosen | same | fl 0.64, gaps 0.67, gaps-paper 0.41, Transkun 1.81, vote3 0.11, vote5 -0.04; no tuning loss on any list |
| support rule alone | same | gaps-paper 0.35 (tuning -0.0076), vote3 0.31, vote5 0.00 |
| detectors vs key taps | `mir_eval.onset.f_measure`, 50 ms, on step 2's `taps.txt` and the handoff `events.csv` (conf > 0.5) | v-03 0.442 / 0.581, v-04 0.820 / 0.479, merged 0.658 / 0.561 (capo / standard); tuning 759 / 1184 / 1432 events; all as recorded |
| one fit re-run | my own re-implementation of rule2 (grid over gate, s, feature, side, percentile thresholds; mean training F1; ties to fewer drops) on E6's feature files, song labels re-derived with mir_eval | gaps-paper and vote3, capo and standard folds: the same rule, threshold, training F1 and drops as `fit_steeldev.json` (gtr-run r1558, 4.8 s, 2 cores) |
| fitting rule | read `fit.py`, `prep.py`, `note_feats.py` | every fold leaves the test song out (steel, loso3, steeldev); `key_tap` is only in the ORACLE gate, never a feature; the robust scaling uses the list's own notes |
| counts | my scorer and E6's feature files | 96 configurations; meets-the-rule counts 19 / 25 / 0 / 83 / 0 / 0; best shares per list; the selection rule picks `steeldev/rule2@rs/per-list`; AUCs (0.729 / 0.672 harmonic rise, 0.858 / 0.842 roll onset); invented at taps; fl's 40 of 59 vs 1 of 781; v-03 at 820 of 823 gaps-paper capo notes; 218 / 296 found notes at taps |
| oracles labelled | read the record | the slap oracle, the tap gate and the self-fit are all marked ORACLE; the per-list best rows are marked as picked on the test songs |
| runs | `/home/user/gtr/ledger/runs.jsonl` | r1536-r1538, r1543, r1545-r1548, r1550 are there, lane notes, exit 0, walls as recorded; r1536-r1538 used 51-67 CPU s each with no slot |
| repo | the never-publish hash check on this file; a search for hosts, keys and note rows | numbers and paths only; no hits |
| handoff | read every file | `slaps/events.csv` (time, kind, conf, detector) and `e6-<tool>/notes.csv` (onset, offset, pitch, support, conf) for all 3 songs x 6 lists, each with `source.json` (`default_stage: false`, fitted without its song); `dropped.csv` has no key columns |

**What I corrected or add.**

1. **The test list.** The table in Step 3 named 11 tests. Only 9 were run: `tree2-nosup` and `lr-audio` are in `fit.py`
   but in none of the 96 configurations. I marked the two rows.
2. **A scaling artifact in the chosen rule.** The robust scaling divides each feature by its interquartile range,
   with a floor of 1e-6. The four "minus the strongest note of the moment" features (`*_ev`) are 0 for 88-90 % of
   gaps-paper's and vote3's notes on capo, on tuning and on 30 of 48 dev24 clip-lists, so their range there is 0 and they are multiplied by a
   million. On standard (more notes at once) the range is 0.02-0.04. A threshold such as gaps-paper's
   `on_mean_ev < -9.76` therefore means "not the strongest onset of its moment" on capo, and "0.27 below it" on
   standard. Two of the chosen rule's results come from this:
   - vote3 on standard removes nothing because its rule, fitted on capo + dev24 (`on_mean_ev < -129251`), cannot fire
     on a song whose range is not 0;
   - gaps-paper's 0.41 uses `on_mean_ev` on capo and `fr_rise_ev` on standard.

   Refitted the same way with the `*_ev` features left unscaled (my own refit, gtr-run r1559, 22 s, 2 cores; a
   checker test, not one of the 96):

   | list | share, as recorded | share, `*_ev` unscaled | tuning change, unscaled |
   |---|---|---|---|
   | fl | 0.64 | 0.64 | +0.0037 |
   | gaps | 0.67 | 0.67 | +0.0067 |
   | gaps-paper | 0.41 | **0.13** | **-0.0016** |
   | Transkun | 1.81 | 1.81 | +0.0090 |
   | vote3 | 0.11 | 0.13 | +0.0015 |
   | vote5 | -0.04 | -0.04 | +0.0007 |

   So gaps-paper's 0.41, and its "no loss on tuning", rest on the artifact. The verdict does not change: the stage is
   **not** a default stage, by a wider margin. The frozen E7 fit for gaps-paper (`on_mean_ev < -10.95`, robust-scaled)
   has the same problem: on a held-out song its meaning depends on whether that song's range is 0. If LOOP or E7 uses
   it, it should first leave the `*_ev` features unscaled (or drop them) and refit.
3. **Counting.** In Step 4, "invented removed" is the dropped notes that were unmatched before, and "found notes lost"
   is the fall in matched notes. They need not add to the notes dropped: on tuning, fl drops 18 notes, 6 of them
   matched, and loses 5 found notes (one key note is matched again by another note).
4. **Minor.** The note feature `rel_pitch` (only in the logistic models, not in the chosen rule) uses the song's
   tuning and capo from the key file. This is the song's set-up, which part 1's range hint also uses, not its notes.
5. **Handoff note.** I added a `checker_note` field with point 2 to each `/home/user/gtv/notes/<S>/e6-<tool>/source.json`
   (originals kept in `/home/user/notes/runs/check-e6/backup/`). The note lists are unchanged.
6. **Unchanged caveat.** The chosen row was picked from 96 on the test songs; the record says so. I did not re-run
   the other 95 with the scaling fixed, so their shares may also move; the verdict needs none of them to.

## Handoff for LOOP

| path | what |
|---|---|
| `/home/user/gtv/notes/<S>/slaps/events.csv` | time, kind (`hit`), conf (P of a key tap within 50 ms, fitted on the other steel song), detector (v-03, v-04, v-03+v-04); `source.json` gives the suggested cut and the scores |
| `/home/user/gtv/notes/<S>/e6-<tool>/notes.csv` | onset, offset, pitch, support (tools of five that have the pitch within 50 ms), conf (largest roll onset of fl, gaps, gaps-paper within 50 ms), for tool = fl, gaps, gaps-paper, transkun, vote3, vote5, after the chosen configuration, fitted without the song |
| `/home/user/gtv/notes/<S>/e6-<tool>/dropped.csv` | the notes it removed, with P(invented) (1 for a rule). Nothing from the key: the found / at-a-tap labels are only in the work folder (`notes/<tag>/<S>/<list>.dropped.csv`) |

Each `source.json` says `default_stage: false`. The frozen fit for E7 (trained on capo, standard and dev24) is in
`e6.json` under `apply`.

## What is uncertain

- **Two steel songs.** Every fit learns from one or two songs, and the two disagree. The shares above could move a
  lot on a third steel song. The selection of one row from 96 on these songs flatters the chosen row.
- **The detectors were not re-run.** Their WAVs were not kept, so the event confidence uses my own percussive
  features at the step-2 times, not the stems.
- **Tab-only key notes.** Some of the notes counted as found or missed at slaps are tab-only in the key (capo 54,
  standard 96 tab-only notes overall). A slap note that the player did sound but the tab left out counts as invented.
- **The harmonic features use a 310 ms median filter** (HPSS kernel 31 at 10 ms). A shorter kernel or a finer hop
  might separate pluck from shake better; I did not try it.
- **The quick F1 used for fitting** assumes a dropped note's label does not change. Every number reported was matched
  again, and the handed-off lists were scored with the CLI.
