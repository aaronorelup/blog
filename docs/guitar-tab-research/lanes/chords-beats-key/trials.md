# Lane 2, chords-beats-key: trials

Agent: try-chords-beats-key. Date: 2026-11-10 (`date -u +%F`). Box: 4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU,
shared with about 20 other agents. Inputs: `/home/user/gtr/inputs/` as described in its `INPUTS.md` (clip ids S2n, S2s,
S3, S4, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2, R2full). This file states what went in, what came out,
how long it took and what the scorer computed. It does not rank tools.

How to read the numbers:

- `rNNNN` is a line of the run ledger `/home/user/gtr/ledger/runs.jsonl` written by `gtr-run` (exact command, input
  SHA-256, cores, wall-clock, CPU time, peak RSS of the largest single process, exit code, load average at start).
  A run "on 2 cores" waited for a slot and was pinned to 2 cores. A run marked `--nolock` took no slot and was not
  pinned; it ran while other agents' jobs were running (the ledger's `load1_at_start` is given), so its times include
  contention.
- Several clips were often run inside one `gtr-run` call by `scripts/batch_run.py`, which times each clip's child
  process separately (time.perf_counter wall-clock; CPU time and peak RSS from `os.wait4`) and writes one JSON line per
  job to a batch log. Those per-clip numbers are quoted with the batch's run id. Stage times inside a tool (model
  load, feature extraction, inference) were measured inside the lane's own wrapper scripts with time.perf_counter and
  saved as `timings*.json` next to the outputs.
- `eNNNN` is a scoring run of `gtr-eval` 0.11.1 (`/home/user/gtr/eval/ledger/evals.jsonl`; `gtr-eval ledger --id
  eNNNN --full` prints the full result with the input SHA-256 and every option). Definitions (from the gtr-eval
  README): beat F = `mir_eval.beat.f_measure` with a 70 ms window; CMLt / AMLt = `mir_eval.beat.continuity` with 17.5 %
  phase and period tolerance (AMLt also accepts double, half and off-beat variants); downbeats are scored the same way
  against the truth downbeats; tempo "within 4 %" = |est - truth| / truth <= 0.04; chord `root` / `majmin` / `sevenths`
  / `mirex` = the `mir_eval.chord` comparisons of that name, weighted by duration over the truth's time span, with
  unreadable estimated labels scored as `N`; key weighted score = `mir_eval.key.weighted_score` (1 same key, 0.5 a
  fifth above, 0.3 relative, 0.2 parallel, 0 otherwise); tuning difference = estimated cents - truth cents.
- All scoring runs of this lane are in `/home/user/gtr/lanes/chords-beats-key/out/scores/scores.jsonl` (one line per
  run, with the eval id; written by `scripts/score_all.py`; over 300 KB, so not in git). `scripts/split_scores.py` copies
  the newest line per (tool, variant, clip, subcommand) into `samples/scores/scores_<tool>.jsonl`;
  `scripts/summarize_scores.py` prints tables from the master file.
- Truth facts used below (from the truth files): S3 and S7flat30: 96 BPM, G major, 32 beats, 8 downbeats, first beat
  at 2.5 s after a silent count-in bar, chords G:maj E:min A:min7 D:7 G:maj E:min C:maj D:7 G:maj (Harte, with `N`
  over the count-in); S7flat30 is S3 rendered 30 cents flat. S4: 116 BPM, D major, 68 beats, 17 downbeats (one
  silent bar, then a side-stick count-in bar). S2n, S2s, S6taps: 112 BPM, G major, 48 beats, harmony labels G:maj
  C:maj D:maj; S5capo2: the same in A major (capo 2); S5dropd: G major in Drop D. R1a: 107 BPM, Ab minor; R1b: 90 BPM,
  C# major; R1c: 119 BPM, G major (GuitarSet annotations). R2 / R2full: no truth.

Scripts are in `scripts/`; small outputs are in `samples/<tool>/`; full outputs are in
`/home/user/gtr/lanes/chords-beats-key/out/<tool>/<clip>/` (not in git).

## aubio 0.4.9 (Ubuntu packages aubio-tools / python3-aubio 0.4.9-4.4build1)

- What: C library and command-line tools for onsets, pitch, beats and tempo (https://aubio.org). Already installed on
  the box from Ubuntu 24.04 packages `aubio-tools`, `libaubio5`, `python3-aubio`, all 0.4.9-4.4build1 (`dpkg -l`).
- Install: nothing installed. The Python front end `/usr/bin/aubio` starts with `#!/usr/bin/python3`, which is Python
  3.13 on this box, and fails with `ModuleNotFoundError: No module named 'aubio._aubio'` (the Debian module is built for
  Python 3.12). Calling it as `/usr/bin/python3.12 /usr/bin/aubio ...` works. The C tool `aubiotrack` works as is.
- Run: `scripts/aubio_run.py` on 13 clips (S3 S4 S7flat30 S2n S2s S5capo2 S5dropd S6taps R1a R1b R1c R2 R2full), each
  clip's `<id>.wav` (44.1 kHz stereo 16-bit), default settings (buffer 1024, hop 512, the file's own sample rate):
  `python3.12 /usr/bin/aubio tempo <wav>`, `python3.12 /usr/bin/aubio beat <wav>`, `aubiotrack -i <wav>`. Run r0200,
  `--nolock` (single-threaded C tools; load average 13.99 at start): 20.8 s wall for all 13 clips and all three
  commands, 9.2 s CPU, 64.2 MB peak RSS. Per command (from `out/aubio/timings.json`): S3 (24 s of audio) tempo 0.80 s,
  beat 0.58 s, aubiotrack 0.22 s; R2full (228.5 s) tempo 1.56 s, beat 1.60 s, aubiotrack 0.87 s.
- Output format: `aubio tempo` prints one line, `<bpm> bpm` (e.g. `121.24 bpm`), no confidence. `aubio beat` and
  `aubiotrack` print one beat time per line in seconds (`-T samples|ms|seconds` changes the unit; `aubio beat`'s lines
  end with a tab character in a test print, stripped in the saved files). No downbeats, no bar position. The two beat
  commands gave the same number of beats on every clip, with times differing by at most 8 microseconds (print
  precision).
- Output excerpt: S3 beats 2.514558, 2.872381, 3.140204, 3.443379, 3.746553, ... (40 beats; truth: 32 beats starting
  2.5, 3.125, 3.75). Tempo: S3 121.24, S4 117.09, S2n 115.35, R1a 105.59, R1b 155.34, R1c 113.92, R2 147.87, R2full
  144.61 BPM (R2/R2full: no truth; the artist's page lists 72 bpm, per INPUTS.md). R2full: 539 beats.
- Constraint inputs: buffer size `-B`, hop size `-H`, sample rate `-r`; `aubiotrack` also takes onset method `-O`,
  onset threshold `-t`, minimum inter-onset interval `-M`, silence threshold `-s`. No tempo range, tempo hint or meter
  option in either beat command's help.
- Scores (gtr-eval 0.11.1; `aubio beat` and `aubiotrack` scored identically, aubiotrack shown):

| clip | beat F (70 ms) | P | R | CMLt | AMLt | est / truth beats | eval | tempo est | within 4 % | eval |
|---|---|---|---|---|---|---|---|---|---|---|
| S3 | 0.889 | 0.800 | 1.000 | 0.650 | 0.650 | 40 / 32 | e0494 | 121.24 | no (ratio 1.263) | e0496 |
| S7flat30 | 0.812 | 0.757 | 0.875 | 0.649 | 0.649 | 37 / 32 | e0506 | 108.76 | no (1.133) | e0508 |
| S4 | 0.935 | 0.915 | 0.956 | 0.901 | 0.901 | 71 / 68 | e0500 | 117.09 | yes (1.009) | e0503 |
| S2n | 0.949 | 0.922 | 0.979 | 0.882 | 0.882 | 51 / 48 | e0513 | 115.35 | yes (1.030) | e0515 |
| S2s | 0.940 | 0.904 | 0.979 | 0.865 | 0.865 | 52 / 48 | e0520 | 115.35 | yes (1.030) | e0523 |
| S5capo2 | 0.940 | 0.904 | 0.979 | 0.865 | 0.865 | 52 / 48 | e0529 | 115.33 | yes (1.030) | e0531 |
| S5dropd | 0.949 | 0.922 | 0.979 | 0.882 | 0.882 | 51 / 48 | e0536 | 115.35 | yes (1.030) | e0538 |
| S6taps | 0.940 | 0.904 | 0.979 | 0.865 | 0.865 | 52 / 48 | e0543 | 115.38 | yes (1.030) | e0545 |
| R1a | 0.440 | 0.468 | 0.415 | 0.358 | 0.442 | 47 / 53 | e0549 | 105.59 | yes (0.987) | e0550 |
| R1b | 0.239 | 0.200 | 0.295 | 0.046 | 0.138 | 65 / 44 | e0552 | 155.34 | no (1.726, closest factor 2) | e0553 |
| R1c | 0.038 | 0.041 | 0.036 | 0.000 | 0.745 | 49 / 56 | e0555 | 113.92 | no (0.957) | e0556 |

- Samples: `samples/aubio/` (S3, S4, R1b, R2 beat and tempo files, per-command timings).

## Chordino and NNLS Chroma / Tuning (Vamp plugins) via chord-extractor 0.1.3 and vamp 1.1.0

- What: Matthias Mauch's Vamp plugin library `nnls-chroma` (plugins `nnls-chroma:chordino`, `nnls-chroma:nnls-chroma`,
  `nnls-chroma:tuning`), called from Python through the `vamp` host module. Route that worked here: the PyPI package
  `chord-extractor` 0.1.3 (uploaded 2025-08-14, requires Python >=3.8,<3.12), which ships a compiled
  `chord_extractor/_lib/nnls-chroma.so` (1,215,403 bytes, sha256 022f18b7...c7d99) and sets `VAMP_PATH` to it. Not
  available as an Ubuntu 24.04 package (`apt-cache search vamp` lists only the SDK, example plugins and rubberband-vamp;
  no sonic-annotator package).
- Install (venv-chordext, Python 3.11): `uv pip install numpy setuptools wheel`, then
  `uv pip install --no-build-isolation chord-extractor==0.1.3`, which builds the `vamp` 1.1.0 sdist (a C extension;
  its setup.py needs numpy present). Run r0198 (`--nolock`, a single small compile): 46.3 s wall including downloads,
  17.8 s CPU. A first attempt in a slot queue (`gtr-run` without `--nolock`) was stopped by a 580 s shell timeout while
  still waiting for a slot. chord-extractor imports `pkg_resources`, which setuptools 84 no longer has: `uv pip install
  "setuptools<81"` (80.10.2) fixed `ModuleNotFoundError`. `vamp.list_plugins()` then returned
  `['nnls-chroma:chordino', 'nnls-chroma:nnls-chroma', 'nnls-chroma:tuning']`. Freeze:
  `samples/chordino/venv-chordext.freeze.txt` (librosa 0.11.0 came in as a dependency).
- Runs: `scripts/chordino_run.py` (three calls per clip: `Chordino()` with chord-extractor's defaults useNNLS=1,
  rollon=1, tuningmode=0 global, whitening=1, s=0.7, boostn=0.1; the same with tuningmode=1 local; and
  `vamp.collect(data, rate, 'nnls-chroma:tuning')`). Audio is loaded by chord-extractor with `librosa.load(file)`
  (22050 Hz mono). 13 clips in one call of `scripts/batch_run.py`, run r0215 (`--nolock`, single-threaded plugin; load
  average 14.29 at start): 97.5 s wall in total, 60.5 s CPU, 389 MB peak RSS. Per clip (all three calls, from
  `samples/chordino/batchC_timings.jsonl`): S3 25.9 s (the first job; its first Chordino call took 14.99 s, the
  local-tuning call on the same file 0.48 s), other 24 to 39 s clips 3.3 to 6.4 s, R2full 16.6 s (Chordino default
  6.37 s, local tuning 5.40 s, tuning plugin 1.38 s).
- Output format: `Chordino.extract()` returns a list of `ChordChange(chord, timestamp)`: a label and a start time in
  seconds, no end times and no confidence. Labels are Chordino's own short names (`G`, `Em`, `Am7`, `D7`, `C#m`,
  `Abmaj7`, `Bbm7b5/Ab`, `F#6`, `Bdim`, `Ebm7b5`, `Bb7/D`, `N`), i.e. majors, minors, sevenths, sixths, diminished,
  half-diminished and slash chords. Every start time in the 491 segments written for this lane is a multiple of 2048/22050 s (0.0929 s; e.g. 0.372,
  0.464, 4.923). Every clip's list started with `N` at 0.372 s and ended with an `N` change 0.28 to 0.37 s after the
  end of the file (S3: 24.335 s for a 24.000 s file). The lane script writes `.lab` files (each change lasts until the
  next one, the last until the end of the file); segments that start at or after the end of the file are dropped
  (`scripts/fix_chordino_labs.py` applied that rule to the r0215 outputs, written before the rule was added). The
  tuning plugin returns one item at time 0 with label `<Hz> Hz` (rounded to 0.1 Hz) and the unrounded value in
  `values`, e.g. S7flat30 `431.9 Hz` / 431.8629.
- Output excerpts. S3 (truth G E:min A:min7 D:7 G E:min C D:7 G): `0.372 N, 0.464 G, 4.923 Em, 7.523 Am7, 9.938 D7,
  12.446 G, 14.954 Em, 17.461 C, 19.226 D7, 19.876 G`. S7flat30 (S3 rendered 30 cents flat), global tuning: the same
  label sequence and change times except one: Am7 starts at 7.430 s instead of 7.523 s (one frame earlier). R1a (truth key
  Ab minor): `C# F# B E Bbm7 Eb Abm7 C# F# B E Bb7`. R2 (no truth): `F# Ebm Bmaj7 F# Bb7 Ebm B Bb7 Eb F7 F#6 C# Ab Bb
  Bdim`. R2full: 73 segments, 20 distinct labels (including `N`).
- Default (global) versus local tuning mode: identical `.lab` files for S3; for R1b the local-tuning run split the
  first C# segment and added `Bbm7b5/Ab` at 2.694 to 7.895 s (scores below).
- Constraint inputs a re-run can take (chord-extractor `Chordino(...)` arguments, passed as plugin parameters):
  `use_nnls`, `roll_on`, `tuning_mode` (global or local), `spectral_whitening`, `spectral_shape`,
  `boost_n_likelihood`, and any other plugin parameter by its Vamp identifier. No key, capo or tuning-frequency input;
  the plugin estimates tuning itself.
- Scores, chords (gtr-eval 0.11.1):

| clip | mode | root | majmin | sevenths | mirex | seg | est / truth segments | eval |
|---|---|---|---|---|---|---|---|---|
| S3 | global | 0.878 | 0.878 | 0.878 | 0.878 | 0.878 | 10 / 10 | e0557 |
| S3 | local | 0.878 | 0.878 | 0.878 | 0.878 | 0.878 | 10 / 10 | e0558 |
| S7flat30 | global | 0.876 | 0.876 | 0.876 | 0.876 | 0.876 | 10 / 10 | e0571 |
| S7flat30 | local | 0.876 | 0.876 | 0.876 | 0.876 | 0.876 | 10 / 10 | e0575 |
| S4 | global | 0.886 | 0.886 | 0.886 | 0.890 | 0.928 | 18 / 18 | e0563 |
| S4 | local | 0.887 | 0.887 | 0.887 | 0.891 | 0.929 | 18 / 18 | e0567 |
| S2n | global | 0.768 | 0.768 | 0.768 | 0.768 | 0.796 | 19 / 22 | e0583 |
| S2s | global | 0.768 | 0.768 | 0.768 | 0.768 | 0.660 | 15 / 22 | e0591 |
| S5capo2 | global | 0.780 | 0.780 | 0.780 | 0.780 | 0.707 | 17 / 22 | e0598 |
| S5dropd | global | 0.795 | 0.795 | 0.795 | 0.795 | 0.859 | 21 / 22 | e0604 |
| S6taps | global | 0.768 | 0.768 | 0.768 | 0.768 | 0.660 | 15 / 22 | e0609 |
| R1a | global | 0.945 | 0.782 | 0.343 | 0.739 | 0.945 | 13 / 13 | e0613 |
| R1a | local | 0.949 | 0.786 | 0.347 | 0.742 | 0.949 | 13 / 13 | e0614 |
| R1b | global | 0.526 | 0.385 | 0.385 | 0.385 | 0.674 | 7 / 6 | e0616 |
| R1b | local | 0.348 | 0.208 | 0.208 | 0.208 | 0.600 | 9 / 6 | e0617 |
| R1c | global | 0.406 | 0.343 | 0.163 | 0.501 | 0.567 | 10 / 14 | e0619 |
| R1c | local | 0.413 | 0.349 | 0.163 | 0.501 | 0.567 | 10 / 14 | e0620 |

  (S2n, S2s, S5capo2, S5dropd and S6taps local-tuning runs gave the same numbers as global: e0585, e0594, e0600,
  e0606, e0610.) The R1 truth is GuitarSet's lead-sheet chord annotation (INPUTS.md), not the performed-chord file.
- Tuning plugin against the truth `tuning_offset_cents` (gtr-eval `tuning --est-a4-hz`, cents = 1200 log2(f / 440)):

| clip | estimated A4 (Hz) | estimated cents | truth cents | difference | eval |
|---|---|---|---|---|---|
| S3 | 439.958 | -0.167 | 0 | -0.167 | e0560 |
| S7flat30 | 431.863 | -32.316 | -30 | -2.316 | e0580 |
| S4 | 439.840 | -0.631 | 0 | -0.631 | e0568 |
| S2n | 440.159 | 0.626 | 0 | 0.626 | e0588 |
| S2s | 439.965 | -0.137 | 0 | -0.137 | e0596 |
| S5capo2 | 440.155 | 0.608 | 0 | 0.608 | e0602 |
| S5dropd | 440.116 | 0.455 | 0 | 0.455 | e0608 |
| S6taps | 439.973 | -0.108 | 0 | -0.108 | e0612 |
| R1a | 443.733 | 14.627 | 0 | 14.627 | e0615 |
| R1b | 441.928 | 7.570 | 0 | 7.570 | e0618 |
| R1c | 441.291 | 5.072 | 0 | 5.072 | e0621 |

  The R1 truth files carry `tuning_offset_cents` 0; INPUTS.md does not say where that value comes from or that the
  recordings were measured, so the R1 rows compare against a stated 0, not a measured offset. R2: 440.438 Hz
  (no truth); R2full: 440.729 Hz.
- Samples: `samples/chordino/` (labs for S3, S7flat30, S4, S2n, R1a, R1b, R2, R2full; R1b local-tuning lab; tuning
  JSON for S3, S7flat30, R1a; per-clip timings; venv freeze).

## madmom 0.16.1 (PyPI sdist of 2018-11-14) on Python 3.9

- What: audio signal processing library from JKU Linz / OFAI with RNN beat, downbeat and tempo processors, two chord
  recognisers (CNN features + CRF; deep chroma + CRF) and a CNN key recogniser. Model files ship inside the package
  (`madmom/models`, 23 MB installed).
- Install routes tried, in order:
  1. Build from a shallow clone of https://github.com/CPJKU/madmom (main at commit 27f032e8, 2024-08-25, version
     0.17.dev0, with the `madmom_models` submodule at 7e3dc1b). The `uv pip install --no-build-isolation <clone>`
     command was refused by this session's tool-permission policy (reason shown: "Code from External"), so the git
     route was not tested here and the clone was deleted.
  2. PyPI `madmom==0.16.1` on Python 3.11 (numpy 2.4.6, scipy 1.17.1, Cython 3.3.1): the Cython build succeeded
     (run r0025, 152.9 s wall on 2 cores, mostly dependency resolution), but `import madmom` failed, first with
     `ModuleNotFoundError: No module named 'pkg_resources'` (setuptools 84.2.1; fixed with `setuptools<81`), then with
     `ImportError: cannot import name 'MutableSequence' from 'collections'` (`madmom/processors.py` line 23). Freeze of
     that venv: `samples/madmom/venv-madmom-py311-failed-import.freeze.txt`.
  3. What worked: `uv venv --python 3.9 venv-madmom39`; `uv pip install "numpy==1.23.5" "scipy<1.11" mido "cython<3"
     "setuptools<81" wheel soundfile` (numpy 1.23.5, scipy 1.10.1, Cython 0.29.37, setuptools 80.10.2); then
     `uv pip install --no-build-isolation madmom==0.16.1` (run r0047, 36.9 s wall, 29.6 s CPU on 2 cores). Import prints
     a `pkg_resources` deprecation warning. Installed size 225 MB (venv). Freeze: `samples/madmom/venv-madmom39.freeze.txt`.
- Runs: `scripts/madmom_run.py --audio <id>.wav --outdir ...` runs, with default parameters except where named:
  `RNNBeatProcessor` -> `DBNBeatTrackingProcessor(fps=100)`; the same activations -> `TempoEstimationProcessor(fps=100)`
  (method 'comb'); `RNNDownBeatProcessor` -> `DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=100)`;
  `CNNChordFeatureProcessor` -> `CRFChordRecognitionProcessor`; `DeepChromaProcessor` ->
  `DeepChromaChordRecognitionProcessor`; `CNNKeyRecognitionProcessor` -> `key_prediction_to_label`. Input: the stereo
  44.1 kHz 16-bit `<id>.wav`, passed by path. One `gtr-run` per clip on 2 cores: S3 r0063 (20.9 s wall, 22.5 s CPU,
  212 MB peak RSS), S4 r0072 (35.1 s, 30.8 s, 316 MB), S7flat30 r0073 (19.5 s), S2n r0100 (29.3 s), S2s r0102 (26.5 s),
  S5capo2 r0140 (26.6 s). The other clips ran in batch run r0316 (2 cores, 420.1 s wall in total; per clip from
  `samples/madmom/batchA2_timings.jsonl`): S5dropd 53.5 s, S6taps 39.6 s, R1a 38.2 s, R1b 33.8 s, R1c 33.4 s, R2 31.2 s,
  R2full 190.2 s (146.9 s CPU, 1383.7 MB peak RSS). Stage times inside the script for S3 (24 s of audio) / R2full
  (228.5 s): beat activations 3.61 / 37.56 s, beat DBN 0.07 / 0.83 s, tempo 0.67 / 0.26 s, downbeat activations 3.41 /
  44.01 s, downbeat DBN 0.22 / 4.80 s, CNN chords 10.23 / 87.33 s, deep-chroma chords 0.06 / 0.70 s, key 2.21 /
  14.36 s.
- Output formats (as written by the lane script from the processors' numpy arrays): beats, one time per line in
  seconds on a 10 ms grid (fps 100); downbeat tracker, rows of `time<TAB>position in bar` (1 = downbeat); tempo, rows of
  `bpm<TAB>strength` strongest first (S3: 95.238 0.326, 48.000 0.173, 193.548 0.156); chords, `start<TAB>end<TAB>label`
  segments on a 0.1 s grid with Harte labels from 25 classes (`G:maj`, `E:min`, ... , `N`); key, one label such as
  `G major` plus a probability for each of 24 keys (`key_probs.json`). No confidence per beat or per chord.
- Output excerpts: S3 beats 0.630, 1.270, 1.910, 2.520, 3.160, ... (37 beats; the first three fall in the silent
  count-in bar before the truth's first beat at 2.5 s). S3 downbeat tracker: 29 rows starting `2.510 1`, `3.140 2`,
  8 bar starts. S3 CNN chords: `N 0-2.6, G:maj 2.6-5.3, E:min 5.3-7.6, A:min 7.6-10.3, D:maj 10.3-12.5, G:maj, E:min,
  C:maj, D:maj, G:maj, N 21.1-22.7, G:maj`. S2n downbeat tracker: `2.140 4`, `2.680 1`, `3.220 2`, ... (truth: beat 1 at
  2.142857), i.e. every bar start one beat late. S2n key probabilities, top three: D major 0.384, E minor 0.306, G major
  0.158. R2 (no truth): tempo 72.289 (strength 0.434), 142.857, 48.000; key F# major; deep-chroma chords `F#:maj D#:min
  B:maj F#:maj A#:maj F#:maj B:maj A#:maj ...`. R2full: 275 beats, 67 bar starts, tempo 72.289, key D# minor, 90 CNN
  and 77 deep-chroma chord segments. (INPUTS.md quotes the artist's page for R2: "Key: D# Minor, Tempo: 72 bpm";
  not checked.)
- Constraint inputs a re-run can take (constructor arguments in the 0.16.1 source): `DBNBeatTrackingProcessor(min_bpm,
  max_bpm, num_tempi, transition_lambda, observation_lambda, correct, threshold, fps)`,
  `DBNDownBeatTrackingProcessor(beats_per_bar, min_bpm, max_bpm, ...)` (meter as a list of allowed beats per bar),
  `TempoEstimationProcessor(method, min_bpm, max_bpm, act_smooth, hist_smooth, fps)`, `DeepChromaProcessor(fmin=65,
  fmax=2100, unique_filters=True, models=None)`. The chord and key processors take no key, tuning or capo input.
- Scores (gtr-eval 0.11.1):

| clip | beats F / CMLt / AMLt (RNN+DBN) | est / truth beats | eval | downbeat tracker: beats F, downbeat F, downbeat CMLt | est / truth downbeats | eval |
|---|---|---|---|---|---|---|
| S3 | 0.870 / 0.838 / 0.838 | 37 / 32 | e0208 | 0.951, 1.000, 1.000 | 8 / 8 | e0210 |
| S7flat30 | 0.914 / 0.842 / 0.842 | 38 / 32 | e0258 | 0.951, 1.000, 1.000 | 8 / 8 | e0259 |
| S4 | 0.958 / 0.919 / 0.919 | 74 / 68 | e0239 | 0.977, 1.000, 1.000 | 17 / 17 | e0240 |
| S2n | 0.932 / 0.873 / 0.873 | 55 / 48 | e0275 | 1.000, 0.000, 0.000 | 12 / 12 | e0276 |
| S2s | 0.932 / 0.873 / 0.873 | 55 / 48 | e0286 | 1.000, 0.000, 0.000 | 12 / 12 | e0287 |
| S5capo2 | 0.932 / 0.873 / 0.873 | 55 / 48 | e0300 | 1.000, 0.000, 0.000 | 12 / 12 | e0302 |
| S5dropd | 0.932 / 0.873 / 0.873 | 55 / 48 | e1004 | 1.000, 0.000, 0.000 | 12 / 12 | e1007 |
| S6taps | 0.932 / 0.873 / 0.873 | 55 / 48 | e1058 | 1.000, 1.000, 1.000 | 12 / 12 | e1059 |
| R1a | 0.662 / 0.000 / 0.990 | 104 / 53 | e1085 | 0.000, 0.000, 0.000 (beats AMLt 1.000) | 13 / 14 | e1086 |
| R1b | 0.876 / 0.933 / 0.933 | 45 / 44 | e1120 | 0.818, 0.000, 0.000 | 11 / 11 | e1121 |
| R1c | 0.000 / 0.000 / 0.982 | 56 / 56 | e1157 | 0.180, 0.148, 0.929 | 13 / 14 | e1158 |

| clip | tempo (top) | within 4 % | eval | CNN chords root / majmin / sevenths | segs | eval | deep-chroma chords root / majmin / sevenths | segs | eval | key | weighted | eval |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S3 | 95.238 | yes | e0212 | 0.856 / 0.856 / 0.640 | 12 | e0214 | 0.919 / 0.919 / 0.710 | 10 | e0216 | G major | 1.0 | e0218 |
| S7flat30 | 95.238 | yes | e0260 | 0.877 / 0.877 / 0.702 | 9 | e0261 | 0.915 / 0.915 / 0.702 | 10 | e0262 | G major | 1.0 | e0263 |
| S4 | 115.385 | yes | e0241 | 0.959 / 0.959 / 0.915 | 18 | e0242 | 0.937 / 0.937 / 0.890 | 18 | e0243 | D major | 1.0 | e0245 |
| S2n | 111.111 | yes | e0278 | 0.870 / 0.870 / 0.870 | 21 | e0279 | 0.878 / 0.878 / 0.878 | 23 | e0280 | D major | 0.5 | e0281 |
| S2s | 111.111 | yes | e0288 | 0.694 / 0.694 / 0.694 | 10 | e0289 | 0.678 / 0.678 / 0.678 | 10 | e0290 | G major | 1.0 | e0291 |
| S5capo2 | 111.111 | yes | e0304 | 0.721 / 0.721 / 0.721 | 11 | e0306 | 0.857 / 0.857 / 0.857 | 23 | e0309 | E major | 0.5 | e0311 |
| S5dropd | 111.111 | yes | e1010 | 0.812 / 0.812 / 0.812 | 17 | e1013 | 0.878 / 0.878 / 0.878 | 23 | e1015 | G major | 1.0 | e1017 |
| S6taps | 111.111 | yes | e1060 | 0.691 / 0.691 / 0.691 | 10 | e1061 | 0.674 / 0.674 / 0.674 | 10 | e1062 | G major | 1.0 | e1063 |
| R1a | 107.143 | yes | e1087 | 0.957 / 0.771 / 0.510 | 13 | e1089 | 0.954 / 0.764 / 0.506 | 13 | e1091 | F# major | 0.0 | e1093 |
| R1b | 181.818 | no (2.020, factor 2) | e1122 | 0.083 / 0.083 / 0.083 | 13 | e1123 | 0.149 / 0.149 / 0.149 | 8 | e1125 | F# major | 0.0 | e1126 |
| R1c | 120.000 | yes | e1159 | 0.598 / 0.598 / 0.598 | 13 | e1160 | 0.556 / 0.556 / 0.556 | 12 | e1161 | G major | 1.0 | e1162 |

  Truth segment counts: S3, S7flat30 10; S4 18; S2-family 22; R1a 13, R1b 6, R1c 14. S7flat30 versus S3 (same notes,
  30 cents flat): the same tempo and key; chord scores differ by 0.004 to 0.062 (largest: CNN sevenths 0.640 vs 0.702).
- Samples: `samples/madmom/` (all outputs for S3, S2n, R1b, R2; R2full timings; batch timings; freezes).

## librosa 1.0.0 (beat_track, feature.tempo, estimate_tuning) and a chroma + Krumhansl-Kessler key baseline written for this lane

- What: librosa 1.0.0 from PyPI (uploaded 2026-08-11, requires Python >= 3.12). librosa has no key estimator; the
  key numbers below come from a baseline written in `scripts/librosa_run.py` (mean of `librosa.feature.chroma_cqt` over
  the whole file, Pearson correlation with the 24 rotations of the Krumhansl-Kessler major and minor profiles, highest
  wins). It is labelled "lane-written baseline" wherever it appears.
- Install: `uv venv --python 3.12 venv-librosa`; `uv pip install librosa==1.0.0 soundfile music21` (music21 10.5.2 for
  the symbolic key section below). 628 MB. Freeze: `samples/librosa/venv-librosa.freeze.txt`.
- Runs: `scripts/librosa_run.py`: `librosa.load(path, sr=22050, mono=True)`, `librosa.beat.beat_track(y=y, sr=sr,
  units='time')` (defaults hop 512, start_bpm 120, tightness 100, trim True), `librosa.feature.tempo(y=y, sr=sr)`,
  `librosa.estimate_tuning(y=y, sr=sr)` (defaults n_fft 2048, resolution 0.01), and the key baseline. One `gtr-run` per
  clip on 2 cores for S3 r0069 (16.05 s wall, 12.6 s CPU, 343 MB; inside it beat_track took 12.2 s), S4 r0074 (3.78 s),
  S7flat30 r0081 (3.42 s), S2n r0091 (3.12 s), S2s r0092 (3.69 s), S5capo2 r0093 (3.34 s), S5dropd r0094 (3.49 s),
  S6taps r0096 (3.60 s), R1a r0104 (3.70 s). Whether the extra time of the first run is librosa's numba compilation was
  not isolated (UNVERIFIED). R1b, R1c, R2 and R2full ran in batch run r0267 (`--nolock`, load average 16.62 at start;
  per clip from `samples/librosa/batchF_timings.jsonl`): R1b 11.9 s, R1c 10.4 s, R2 11.0 s, R2full 23.1 s wall (7.6 s
  CPU, 625 MB peak RSS); these include contention with other agents' jobs.
- Output format: `beat_track(..., units='time')` returns a tempo (numpy array of one value) and beat times in seconds;
  `feature.tempo` returns one value per channel (one here); `estimate_tuning` returns a fraction of a semitone in
  [-0.5, 0.5) with resolution 0.01, i.e. whole cents. No downbeats, no confidence. The lane script writes beats.txt (one
  time per line), tempo.txt, tuning.json, key_baseline.txt / .json (all 24 correlations).
- Output excerpts: S3 beats 2.531, 3.181, 3.808, 4.435, 5.062, ... (29 beats; truth 32). Tempo S3 95.703, R1b 95.703,
  R2 and R2full 143.555. Tuning (cents): S3 +1, S7flat30 -31, R1a +13, R2 +1, R2full +13. Key baseline: R2 and R2full
  Eb minor (the artist's page, quoted in INPUTS.md, says D# minor). S7flat30 top three correlations: G major 0.831,
  B minor 0.735, E minor 0.722.
- Constraint inputs: `beat_track(bpm=...)` (fixes the tempo; "If provided, start_bpm will be ignored", per the
  docstring quoted in survey.md), `start_bpm`, `tightness`, `prior`; `chroma_cqt(tuning=...)` takes a tuning offset (the
  baseline left it None, so librosa estimates it); `estimate_tuning(resolution, bins_per_octave)`.
- Scores (gtr-eval 0.11.1):

| clip | beats F / CMLt / AMLt | est / truth beats | eval | tempo | within 4 % | eval | key baseline (lane-written) | weighted | eval | tuning cents (truth) | eval |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S3 | 0.820 / 0.906 / 0.906 | 29 / 32 | e0219 | 95.703 | yes | e0221 | G major | 1.0 | e0779 | +1 (0) | e0223 |
| S7flat30 | 0.787 / 0.906 / 0.906 | 29 / 32 | e0264 | 95.703 | yes | e0265 | G major | 1.0 | e0859 | -31 (-30) | e0266 |
| S4 | 0.977 / 0.956 / 0.956 | 65 / 68 | e0247 | 117.454 | yes | e0248 | D major | 1.0 | e0813 | +1 (0) | e0249 |
| S2n | 0.968 / 0.938 / 0.938 | 45 / 48 | e0282 | 112.347 | yes | e0283 | G major | 1.0 | e0284 | +2 (0) | e0285 |
| S2s | 0.989 / 0.979 / 0.979 | 47 / 48 | e0294 | 112.347 | yes | e0296 | G major | 1.0 | e0940 | -1 (0) | e0298 |
| S5capo2 | 0.968 / 0.938 / 0.938 | 45 / 48 | e0313 | 112.347 | yes | e0315 | A major | 1.0 | e0317 | +2 (0) | e0319 |
| S5dropd | 0.968 / 0.938 / 0.938 | 45 / 48 | e0321 | 112.347 | yes | e0322 | G major | 1.0 | e0325 | +2 (0) | e0327 |
| S6taps | 0.979 / 0.958 / 0.958 | 46 / 48 | e0330 | 112.347 | yes | e0332 | G major | 1.0 | e0334 | -1 (0) | e0336 |
| R1a | 0.933 / 0.981 / 0.981 | 52 / 53 | e0338 | 107.666 | yes | e0340 | Ab minor | 1.0 | e0342 | +13 (0) | e0344 |
| R1b | 0.584 / 0.600 / 0.600 | 45 / 44 | e1127 | 95.703 | no (1.063) | e1128 | C# minor | 0.2 | e1129 | +5 (0) | e1130 |
| R1c | 0.074 / 0.036 / 0.836 | 52 / 56 | e1163 | 117.454 | yes | e1164 | G major | 1.0 | e1165 | +3 (0) | e1166 |

- Samples: `samples/librosa/` (S3, S7flat30, R1b, R2, R2full outputs; batch timings; freeze).

## Essentia 2.1-beta6-dev (PyPI essentia-tensorflow 2.1b6.dev1389, Python 3.11 wheel)

- What: the MTG (UPF) C++ library with Python bindings. Algorithms run here: `RhythmExtractor2013` (methods
  multifeature and degara), `KeyExtractor` (profiles bgate (default), krumhansl, temperley, edma, shaath),
  `TuningFrequencyExtractor`, `TonalExtractor` (its `chords_progression`, HPCP-based major/minor triads), and
  `TempoCNN` with two model files.
- Install: the newest dev wheels (2.1b6.dev1438, 2026-05-19) exist only for cp314; the newest wheels for Python 3.9 to
  3.13 are 2.1b6.dev1389 (2025-07-24) (PyPI JSON, read 2026-11-10). `uv venv --python 3.11 venv-essentia`;
  `uv pip install "essentia-tensorflow==2.1b6.dev1389"` (pulls numpy 2.4.6, pyyaml, six; the wheel bundles its own
  TensorFlow libraries; importing it prints CUDA-library warnings and then runs on CPU). 677 MB. Model files, from
  https://essentia.upf.edu/models/tempo/tempocnn/: `deeptemp-k16-3.pb` (1,320,120 bytes, sha256 21c32833...e3b3) and
  `deeptemp-k4-3.pb` (147,561 bytes, sha256 66f36ee5...daa) with their `.json` metadata (the k16 metadata: input
  "sample_rate": 11025, output "a softmax distribution of length 256 where the first index represents the probability
  of the track being 30 BPM and the last one the probability of being 286 BPM", trained on "Extended Ballroom, LMDTempo
  and MTGTempo"). Freeze: `samples/essentia/venv-essentia.freeze.txt`.
- Runs: `scripts/essentia_run.py` (audio from `MonoLoader(filename, sampleRate=44100)`; TempoCNN from
  `MonoLoader(sampleRate=11025)`; chords from `TonalExtractor(frameSize=4096, hopSize=2048, tuningFrequency=440)`).
  On 2 cores, one `gtr-run` per clip: S3 r0088 (2.35 s wall, 2.4 s CPU, 274 MB), S4 r0097 (3.17 s), S7flat30 r0148
  (2.65 s; its outputs were later overwritten by the identical command in r0267). The other 11 clips ran in batch run
  r0267 (`--nolock`, load average 16.62 at start): 4.9 to 8.8 s per 24 to 39 s clip, R2full 25.8 s (9.2 s CPU, 394 MB).
  Stage times inside the script for R2full: import 2.3 s, RhythmExtractor2013 multifeature 8.11 s, degara 2.00 s,
  tuning 0.25 s, each KeyExtractor 0.30 to 0.51 s, TonalExtractor 2.73 s, loading at 11025 Hz 5.23 s, TempoCNN k16
  1.57 s, k4 1.06 s.
- Tuning as a constraint (batch run r0324, `--nolock`, 2.4 s per clip): the same KeyExtractor and TonalExtractor calls
  with `tuningFrequency=432.45` (440 Hz lowered by 30 cents) on S7flat30 and S3.
- Output formats: RhythmExtractor2013 returns bpm (float), ticks (beat times in seconds), confidence (multifeature
  only; 0.0 for degara), BPM estimates and intervals; KeyExtractor returns key (e.g. `G`, `F#`, `Eb`), scale (`major` /
  `minor`) and strength; TuningFrequencyExtractor returns one running estimate in Hz per 2048-sample hop (the lane
  script reports the last frame and cents = 1200 log2(f / 440)); TonalExtractor's `chords_progression` is one label per
  2048-sample hop (46.4 ms at 44.1 kHz) from 24 major/minor triads written `G`, `Em`, `F#`, `Ebm` (no `N` label; the
  silent count-in of S3 was labelled `Am`); TempoCNN returns a global BPM (whole numbers in these runs) and local tempi
  with their probabilities (S3: 3 local values, R2full: 37). No downbeats.
- Output excerpts: S3 multifeature ticks 0.615, 1.242, 1.881, 2.519, ... (37). R2 (no truth): multifeature 143.76 BPM
  (confidence 1.93), TempoCNN k16 72.0 and k4 72.0; keys bgate/krumhansl/temperley F# major, edma/shaath Eb minor;
  TonalExtractor key B major, 43 chord segments. R2full: multifeature 143.68 BPM (confidence 1.33), TempoCNN k16 72.0,
  k4 144.0 (its first local tempi 73, 72, 71, 73, 73, 73, 73, 72); keys bgate/krumhansl/edma/shaath Eb minor, temperley
  F# major; 227 chord segments.
- S7flat30 at tuningFrequency 440 (default): TonalExtractor chords `Am 0-1.58, G 1.58-1.63, F# 1.63-4.88, Ebm, Abm, B,
  Abm, C#, F#, Ebm, B, F#`, i.e. one semitone below S3's labels; at 432.45 Hz: `Am, G, Em, Am, C, Am, D, G, Em, C, G`.
  KeyExtractor gave G major with all five profiles at both settings (its parameter `averageDetuningCorrection` is True
  by default).
- Constraint inputs: `RhythmExtractor2013(minTempo=40, maxTempo=208, method)`; `KeyExtractor(profileType,
  tuningFrequency=440, pcpThreshold, hpcpSize, minFrequency=25, maxFrequency=3500, averageDetuningCorrection=True, ...)`;
  `TonalExtractor(frameSize, hopSize, tuningFrequency)`; `ChordsDetection(windowSize=2 s, hopSize)` (not called
  separately here). Values listed are the defaults printed by the installed build.
- Scores (gtr-eval 0.11.1). Beats and tempo:

| clip | multifeature beats F / CMLt / AMLt | eval | degara beats F | eval | multifeature BPM | eval | degara BPM | eval | TempoCNN k16 / k4 BPM | eval k16 / k4 |
|---|---|---|---|---|---|---|---|---|---|---|
| S3 | 0.870 / 0.838 / 0.838 | e0225 | 0.899 | e0227 | 95.557 | e0230 | 95.571 | e0231 | 96 / 96 | e0233 / e0235 |
| S7flat30 | 0.899 / 0.865 / 0.865 | e0267 | 0.899 | e0268 | 95.571 | e0269 | 95.571 | e0270 | 96 / 96 | e0271 / e0272 |
| S4 | 0.944 / 0.919 / 0.919 | e0250 | 0.958 | e0251 | 115.605 | e0252 | 115.784 | e0253 | 116 / 116 | e0254 / e0255 |
| S2n | 0.941 / 0.889 / 0.889 | e0768 | 0.941 | e0771 | 111.807 | e0773 | 111.896 | e0890 | 111 / 112 | e0892 / e0895 |
| S2s | 0.941 / 0.889 / 0.889 | e0941 | 0.941 | e0942 | 111.844 | e0943 | 111.851 | e0944 | 111 / 112 | e0945 / e0946 |
| S5capo2 | 0.941 / 0.889 / 0.889 | e0963 | 0.941 | e0964 | 112.031 | e0966 | 111.896 | e0967 | 111 / 112 | e0968 / e0970 |
| S5dropd | 0.941 / 0.889 / 0.889 | e1019 | 0.941 | e1020 | 111.807 | e1022 | 111.896 | e1024 | 111 / 112 | e1026 / e1029 |
| S6taps | 0.941 / 0.889 / 0.889 | e1064 | 0.941 | e1065 | 111.761 | e1066 | 111.851 | e1067 | 112 / 112 | e1068 / e1069 |
| R1a | 0.981 / 0.962 / 0.962 | e1094 | 0.981 | e1095 | 106.992 | e1096 | 106.888 | e1097 | 108 / 108 | e1098 / e1099 |
| R1b | 0.565 / 0.000 / 0.793 | e1131 | 0.565 | e1132 | 178.206 (x1.98) | e1133 | 178.206 | e1134 | 92 / 90 | e1135 / e1136 |
| R1c | 0.054 / 0.054 / 0.891 | e1167 | 0.036 | e1168 | 117.309 | e1169 | 118.288 | e1170 | 120 / 120 | e1171 / e1172 |

  All BPM values are within 4 % of the truth except R1b's RhythmExtractor2013 values (ratio 1.980, closest factor 2).

  Key, chords and tuning:

| clip | KeyExtractor bgate / krumhansl / temperley / edma / shaath | evals (same order) | TonalExtractor chords root / majmin / sevenths | segs | eval | tuning cents (truth) | eval |
|---|---|---|---|---|---|---|---|
| S3 | G maj (all five) | e0761 e0782 e0784 e0787 e0790 | 0.782 / 0.782 / 0.618 | 10 | e0237 | +2 (0) | e0238 |
| S3 at 432.45 Hz | G maj (all five) | e1207 to e1211 | 0.780 / 0.780 / 0.620 | | e1212 | | |
| S7flat30 | G maj (all five) | e0766 e0864 e0867 e0870 e0872 | 0.000 / 0.000 / 0.000 | 12 | e0273 | -31 (-30) | e0274 |
| S7flat30 at 432.45 Hz | G maj (all five) | e1213 to e1217 | 0.675 / 0.675 / 0.594 | | e1218 | | |
| S4 | D maj (all five) | e0817 e0820 e0822 e0826 e0829 | 0.743 / 0.725 / 0.686 | 33 | e0256 | +1 (0) | e0257 |
| S2n | G maj (all five) | e0898 e0900 e0902 e0904 e0907 | 0.669 / 0.669 / 0.669 | 23 | e0911 | -6 (0) | e0914 |
| S2s | G maj (all five) | e0947 e0948 e0949 e0951 e0952 | 0.734 / 0.688 / 0.688 | 34 | e0953 | 0 (0) | e0954 |
| S5capo2 | A maj (all five) | e0973 e0976 e0977 e0979 e0981 | 0.571 / 0.569 / 0.569 | 29 | e0983 | -6 (0) | e0984 |
| S5dropd | G maj (all five) | e1031 e1033 e1035 e1037 e1039 | 0.668 / 0.668 / 0.668 | 24 | e1041 | -3 (0) | e1043 |
| S6taps | G maj (all five) | e1070 to e1074 | 0.735 / 0.672 / 0.672 | 33 | e1075 | +1 (0) | e1076 |
| R1a (truth Ab min) | F# maj / F# maj / F# maj / C# maj / F# maj | e1100 e1102 e1104 e1106 e1107 (all 0.0) | 0.669 / 0.450 / 0.238 | 35 | e1109 | +50 (0) | e1111 |
| R1b (truth C# maj) | C# min / C# maj / C# min / C# min / C# maj | e1137 e1139 e1140 e1141 e1142 (0.2 / 1.0 / 0.2 / 0.2 / 1.0) | 0.393 / 0.209 / 0.209 | 66 | e1144 | -9 (0) | e1146 |
| R1c | G maj (all five) | e1173 to e1177 | 0.252 / 0.252 / 0.252 | 25 | e1178 | +4 (0) | e1179 |

  Every "G maj (all five)" / "D maj" / "A maj" row has weighted score 1.0 for each profile. Essentia's reference page
  gives TuningFrequency's range as "between -35 to 65 cents" (quoted in survey.md); R1a's +50 is the value the
  extractor's last frame reported.
- Samples: `samples/essentia/` (S3, S7flat30, R1a, R2, R2full outputs, the 432.45 Hz runs, batch timings, freeze).

## music21 10.5.2: key analysis on symbolic notes (truth MIDI, and Basic Pitch MIDI from the audio-to-notes lane)

- What: music21 10.5.2 (PyPI, installed in venv-librosa). Its `Stream.analyze(<method>)` key finders work on notes,
  not audio. Methods run: `key` (music21's default; in 10.5.2 it maps to the AardenEssen class, checked with
  `analysisClassFromMethodName('key')`), `key.krumhansl` (Krumhansl-Schmuckler), `key.simple`, `key.bellman`,
  `key.temperley`.
- Inputs (a tested handoff): for each clip, (a) the inputs builder's MIDI `<id>.mid` (the exact notes; pitch bends are
  not read, so S7flat30's MIDI gives the same notes as S3's), and (b) the audio-to-notes lane's Basic Pitch output
  `/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/onnx-default/<id>.mid` (Basic Pitch 0.4.0 `predict()`, ONNX
  model, default settings, that lane's run r0234). Both read with `music21.converter.parse(path)`; parts with a
  percussion instrument or MIDI channel 10 removed (S4's drum part).
- Run: `scripts/music21_key_run.py` on 11 clips x 2 sources x 5 methods, run r0237 (`--nolock`, load average 17.09):
  13.2 s wall in total, 4.3 s CPU, 70 MB peak RSS (parse plus five analyses: 0.1 to 1.6 s per MIDI file, in
  `samples/music21/timings.json`).
- Output format: a `music21.key.Key` with tonic, mode, `correlationCoefficient` and `alternateInterpretations` (the
  other 23 keys with their coefficients). The script writes one `key_<source>_<method>.txt` per result and
  `m21_<source>.json` with the top four alternates.
- Results (gtr-eval key, weighted score in brackets; the eval ids are in `samples/scores/scores_music21.jsonl`):

| clip (truth) | source | key (AardenEssen) | key.krumhansl | key.simple | key.bellman | key.temperley |
|---|---|---|---|---|---|---|
| S3 (G major) | truth MIDI | E minor (0.3) | E minor (0.3) | E minor (0.3) | C major (0) | E minor (0.3) |
| S3 | Basic Pitch | E minor (0.3) | G major (1) | G major (1) | C major (0) | G major (1) |
| S7flat30 (G major) | truth MIDI | E minor (0.3) | E minor (0.3) | E minor (0.3) | C major (0) | E minor (0.3) |
| S7flat30 | Basic Pitch | G major (1) | G major (1) | G major (1) | G major (1) | G major (1) |
| S4 (D major) | both | D major (1) | D major (1) | D major (1) | D major (1) | D major (1) |
| S2n (G major) | both | G major (1) | G major (1) | G major (1) | G major (1) | G major (1) |
| S2s (G major) | truth MIDI | G major (1) | G major (1) | G major (1) | G major (1) | G major (1) |
| S2s | Basic Pitch | C major (0) | G major (1) | G major (1) | G major (1) | G major (1) |
| S5capo2 (A major) | both | A major (1) | A major (1) | A major (1) | A major (1) | A major (1) |
| S5dropd (G major) | both | G major (1) | G major (1) | G major (1) | G major (1) | G major (1) |
| S6taps (G major) | truth MIDI | G major (1) | G major (1) | G major (1) | G major (1) | G major (1) |
| S6taps | Basic Pitch | C major (0) | G major (1) | G major (1) | G major (1) | G major (1) |
| R1a (Ab minor) | both | F# major (0) | B major (0.3) | B major (0.3) | B major (0.3) | B major (0.3) |
| R1b (C# major) | truth MIDI | C# minor (0.2) | C# minor (0.2) | C# minor (0.2) | C# minor (0.2) | C# minor (0.2) |
| R1b | Basic Pitch | F# major (0) | C# minor (0.2) | C# minor (0.2) | F# major (0) | C# minor (0.2) |
| R1c (G major) | both | G major (1) | G major (1) | G major (1) | G major (1) | G major (1) |

- Constraint inputs: the method name (key profile weighting); a stream can be restricted to a time range or part
  before analysis. No tuning input (symbolic).
- Samples: `samples/music21/` (results JSON for S3, R1a, R1b from both sources; timings).

## autochord 0.1.4 (PyPI) and CREMA 0.2.0 (PyPI), sharing one TensorFlow 2.12.1 venv

- What: autochord, "a Python library for automatic chord recognition (using TensorFlow)" that runs the NNLS Chroma Vamp
  plugin and a Bi-LSTM-CRF model, 25 classes (survey.md quotes its README); CREMA, Brian McFee's chord model package
  (convolutional and recurrent estimators), whose `crema.analyze.analyze()` returns a JAMS document.
- Install (venv-tf, Python 3.11, 1.9 GB as a standalone venv; the TensorFlow files are hard links to the box's shared
  uv cache): `uv pip install "tensorflow-cpu==2.12.1" "keras==2.12.0" "numpy<1.24" "librosa==0.10.2.post1" jams pumpp
  mir_eval scikit-learn h5py six soundfile "setuptools<81"` (tensorflow-cpu 2.12.1 was already in the shared cache,
  installed by the source-separation lane; the orchestrator's disk notice asked lanes not to add another TensorFlow
  version), then `uv pip install --no-deps crema==0.2.0 autochord==0.1.4 gdown lazycats` (both packages' metadata ask
  for the `tensorflow` package, not `tensorflow-cpu`), then `vamp==1.1.0` with requests, beautifulsoup4, filelock, tqdm
  (run r0320, `--nolock`). Freeze: `samples/crema/venv-tf.freeze.txt`. The first attempt to install everything in one
  command timed out after 400 s of downloads (shared network); the same command then completed in the background.
- autochord setup: on import it copies its bundled `nnls-chroma.so` into the first Vamp plugin directory and downloads
  its model from Google Drive into `~/.autochord`. HOME and VAMP_PATH were pointed at
  `/home/user/gtr/lanes/chords-beats-key/models/autochord_home/` so both stay in the lane folder. The first import
  downloaded `chroma-seq-bilstm-crf-v1` (a Keras SavedModel; the folder is 7.2 MB together with the plugin copy) through
  gdown from `https://drive.google.com/uc?id=1XBn7FyYjF8Ff6EuC7PjwwPzFBLRXGP7n`, which answered (HTTP 303 to
  drive.usercontent.google.com, then 200). autochord's bundled `nnls-chroma.so` has the same SHA-256 (022f18b7...c7d99)
  as the one inside chord-extractor.
- Runs: `scripts/autochord_run.py` (`autochord.recognize(path, lab_fn=...)`) and `scripts/crema_run.py`
  (`crema.analyze.analyze(filename=path)`), 9 clips each, in batch run r0337 (2 cores; 194.4 s wall in total, 188.8 s
  CPU, 1068 MB peak RSS; per job in `samples/crema/batchG_timings.jsonl`). autochord: S3 25.9 s (import and model load
  7.8 s, recognize 16.2 s), the other 24 to 39 s clips 10.5 to 11.6 s, R2full 15.7 s (recognize 6.8 s), 951 to 1068 MB peak
  RSS per job. CREMA: S3 14.4 s (analyze 10.4 s), the other clips 7.1 to 8.0 s, R2full 8.5 s (analyze 4.5 s), 696 to
  760 MB peak RSS. The first job of each tool was the slowest; the cause was not isolated.
- Output formats. autochord: a list of `(start, end, label)` tuples and a tab-separated `.lab` file with unrounded
  float times (e.g. `2.2291156462585033	4.96907029478458	G:maj`); labels `<root>:maj`, `<root>:min`, `N`, roots
  spelled with flats (`Gb:maj`, `Eb:min`, `Db:maj`); the chroma step is 2048 samples at 44.1 kHz (`_STEP_SIZE` in the
  package source); no confidence. The last segment can end after the end of the file (R2: 36.037 s for a 36.000 s
  clip). CREMA: a JAMS annotation in namespace `chord` with `time`, `duration`, `value` and `confidence` per segment;
  the lane script writes a `.lab`; labels seen include `A:min7`, `C:maj/3`, `B:maj7`, `A#:7`, `D:dim7`, `G#:dim7`,
  `D#:min/5`, `N` (sevenths, diminished sevenths and inversions); segment confidences 0.28 to 0.96 in these runs.
- Output excerpts. S3 (truth N G E:min A:min7 D:7 G E:min C D:7 G): autochord `N 0-2.23, G:maj 2.23-4.97, E:min
  4.97-7.34, ...` (11 segments, labels A:min C:maj D:maj E:min G:maj N); CREMA `N 0-2.32, G:maj, E:min, A:min7, D:maj,
  G:maj, E:min, C:maj/3, G:maj` (9 segments). R2 (no truth): autochord `Gb:maj Eb:min B:maj Gb:maj Bb:maj Eb:min B:maj
  Bb:maj`, then `N` from 18.85 to 23.78 s, `Gb:maj`, and `N` from 24.61 s to the end (36.04 s); CREMA 14 segments.
  R2full: autochord 95 segments (11 labels including N), CREMA 67 segments (16 labels).
- Constraint inputs: none exposed by `autochord.recognize(audio_fn, lab_fn)` or `crema.analyze.analyze(filename, y,
  sr)` (no key, tuning or vocabulary argument).
- Scores (gtr-eval 0.11.1, chords):

| clip | autochord root / majmin / sevenths / mirex | segs | eval | CREMA root / majmin / sevenths / mirex | segs | eval |
|---|---|---|---|---|---|---|
| S3 | 0.923 / 0.923 / 0.700 / 0.923 | 11 | e1283 | 0.931 / 0.931 / 0.831 / 0.931 | 9 | e1290 |
| S7flat30 | 0.921 / 0.921 / 0.698 / 0.921 | 11 | e1285 | 0.931 / 0.931 / 0.828 / 0.931 | 9 | e1292 |
| S4 | 0.891 / 0.891 / 0.845 / 0.891 | 19 | e1284 | 0.980 / 0.980 / 0.930 / 0.980 | 18 | e1291 |
| S2n | 0.684 / 0.684 / 0.684 / 0.684 | 16 | e1286 | 0.654 / 0.654 / 0.654 / 0.654 | 7 | e1293 |
| R1a | 0.902 / 0.733 / 0.491 / 0.621 | 14 | e1287 | 0.943 / 0.696 / 0.523 / 0.589 | 12 | e1294 |
| R1b | 0.004 / 0.000 / 0.000 / 0.000 | 8 | e1288 | 0.406 / 0.406 / 0.000 / 0.406 | 6 | e1295 |
| R1c | 0.609 / 0.609 / 0.609 / 0.609 | 13 | e1289 | 0.594 / 0.534 / 0.334 / 0.534 | 12 | e1296 |

- Samples: `samples/autochord/` and `samples/crema/` (labs for S3, S7flat30, R1a, R2, R2full; S3 JAMS; timings;
  freeze).

## Open-string tuning and capo: what the outputs above show for S5dropd and S5capo2

The task asked only for what existing tools give that bears on tuning and capo; no tool run here outputs a capo
position or an open-string tuning.

- Lowest detected pitch, from the audio-to-notes lane's Basic Pitch 0.4.0 ONNX MIDI (that lane's run r0234), counted
  with `scripts/lowest_pitch_basicpitch.py` (mido, note-on events outside channel 10): S5dropd lowest five pitches 24,
  38, 38, 38, 38, with 4 notes at MIDI 38 (D2); the truth MIDI has exactly 4 notes at 38 and none lower. S2n: 24, then
  43 (G2) upward; S5capo2: 24, then 45 (A2) upward. Each of the three Basic Pitch files contains one note at MIDI 24 (C1)
  that is not in the truth. Standard tuning's lowest open string is E2 (MIDI 40).
- Key estimates on S5capo2 (truth A major, capo 2 on a G-major arrangement): A major from the librosa baseline (e0317),
  all five Essentia profiles (e0973 e0976 e0977 e0979 e0981), music21 on both note sources; E major from madmom (weighted 0.5,
  e0311). On S5dropd (truth G major): G major from every key tool run here (madmom e1017, librosa baseline e0325,
  Essentia e1031 e1033 e1035 e1037 e1039, music21).
- Tuning-offset estimators on S5dropd and S5capo2 (truth 0 cents): librosa +2 / +2, Essentia -3 / -6, NNLS Tuning
  +0.455 / +0.608 cents.

## Not run here

| tool | what stopped it (evidence) |
|---|---|
| BTC (jayg996/BTC-ISMIR19, commit 2682317) | Distributed only as a GitHub repository (no PyPI package; survey.md). The clone (with `test/btc_model.pt` 12,154,754 bytes and `test/btc_model_large_voca.pt` 12,229,576 bytes) and a venv (torch 2.15.0+cpu, librosa 0.11.0, mir_eval 0.8.2, pandas 3.1.1, pyyaml; freeze in `samples/btc/`) were made and `scripts/btc_run.py` was written (the repository's test.py loop with `np.float`/`np.int` aliases and `torch.load(weights_only=False)`), but the `gtr-run` call that would execute it was refused by this session's tool-permission policy ("Code from External"). The clone and venv were deleted. |
| madmom from GitHub main (0.17.dev0, 27f032e) | Build from the clone refused by the same policy; PyPI 0.16.1 was used instead (madmom section). |
| libKeyFinder + keyfinder-cli | Not in Ubuntu 24.04 apt (`apt-cache search keyfinder` returned nothing); the build route is a CMake build of cloned repositories, the kind of step this session's policy refused twice (madmom, BTC); not attempted. PyPI `keyfinder` 1.1.0 is a binding that needs libkeyfinder installed (survey.md). |
| S-KEY (deezer/skey) | Installs from its repository with poetry (survey.md); PyPI `skey` 0.2 is an unrelated project with no files (PyPI JSON read 2026-11-10); not attempted for the same reason. |
| All-In-One (allin1 1.1.0) | Its README requires NATTEN built on Linux and madmom from GitHub ("pip install git+https://github.com/CPJKU/madmom", quoted in survey.md); the madmom git route was refused here; not attempted. Each run would also include a Demucs htdemucs separation (survey.md). |
| tempo-cnn (tempocnn 0.0.8) | PyPI metadata requires `tensorflow==2.17.0`; the only TensorFlow wheel in the shared cache was tensorflow-cpu 2.12.1 and the orchestrator's disk notice (4.7 to 7.9 GB free on the shared disk during this run, per the notices and `df -h`) asked lanes not to install a second TensorFlow version. Not installed. Essentia's TempoCNN algorithm with the deeptemp models ran (Essentia section); their metadata cites Schreiber and Müller, SMC 2019. |
| Omnizart chord (0.6.3) | sdist only; requires tensorflow>=2.5, tf-keras, madmom>=0.16.1, pyfluidsynth, sherpa-onnx, vamp (PyPI metadata). Not attempted within this lane's time. |
| Beat Transformer | Repository code that first separates stems with Spleeter (survey.md); repository-code execution was refused here twice; not attempted. |
| Harmony Transformer v1 / v2 | Training scripts only, no released weights (survey.md); nothing to run. |
| ACR_seq2seq | No checkpoints in the repository (survey.md); nothing to run. |
| ChordMini (ChordMiniApp) | The full app needs Firebase and Gemini keys (survey.md); not run. |
| QM Vamp plugins (key detector, bar-and-beat tracker) | Binaries come from the Vamp plugin download page or a source build of a cloned repository; neither is a package-manager route; not attempted. |
| Guitar tuning classifier (Hulme et al., edhulme/guitar-tuning-classification) | Repository code with TensorFlow models on Google Drive (survey.md); not attempted (repository code). |
| BEAST | Evaluation script plus a Google Drive model (survey.md); not attempted. |
| realtime-bpm-analyzer, web-audio-beat-detector, essentia.js | Browser libraries; in-browser analysis belongs to the browser-audio-sync lane; not run here. |

