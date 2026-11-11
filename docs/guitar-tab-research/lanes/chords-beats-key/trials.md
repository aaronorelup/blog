# Lane 2, chords-beats-key: trials

Agent: try-chords-beats-key. Date: 2026-11-10 (`date -u +%F`). Box: 4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU,
shared with about 20 other agents. Inputs: `/home/user/gtr/inputs/` as described in its `INPUTS.md` (clip ids S2n, S2s,
S3, S4, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2, R2full; R3a, R3b, R3c in one extra section). This file states what went in, what came out,
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

What ran here (sections below, in this order), with the runs that hold the timings:

| tool | version | what it gave | runs |
|---|---|---|---|
| aubio | 0.4.9 (Ubuntu) | beats, tempo | r0200, R3 clips r0348 (`--nolock`) |
| Chordino / NNLS Chroma / NNLS Tuning | chord-extractor 0.1.3 + vamp 1.1.0 | chords, tuning (Hz) | r0198 install, r0215, R3 clips r0347 (`--nolock`) |
| madmom | 0.16.1 (PyPI) on Python 3.9 | beats, downbeats, tempo, chords (2 recognisers), key | r0047 install; r0063 r0072 r0073 r0100 r0102 r0140 r0316 (2 cores) |
| librosa | 1.0.0 | beats, tempo, tuning; plus a lane-written chroma + Krumhansl-Kessler key baseline | r0069 r0074 r0081 r0091-r0094 r0096 r0104 (2 cores), r0267, R3 clips r0347 (`--nolock`) |
| Essentia | essentia-tensorflow 2.1b6.dev1389 | beats, tempo (RhythmExtractor2013, TempoCNN), key (5 profiles), tuning, chords | r0088 r0097 r0148 (2 cores), r0267 r0324, R3 clips r0347 (`--nolock`) |
| music21 | 10.5.2 | key from MIDI (truth MIDI and the audio-to-notes lane's Basic Pitch MIDI) | r0237 (`--nolock`) |
| autochord | 0.1.4 | chords | r0337 (2 cores) |
| CREMA | 0.2.0 | chords (JAMS, with confidence) | r0337 (2 cores) |
| DeepRhythm | 0.0.13 | tempo with confidence | r0351 (`--nolock`, 1 thread) |
| BeatNet | 1.1.3 | beats, downbeats (offline DBN, online particle filter) | r0335 install, r0361 (`--nolock`, 1 thread) |
| Beat This! | beat-this 1.1.0 | beats, downbeats (final0, small0) | r0397 (`--nolock`, 1 thread) |
| lv-chordia | 1.1.0 | chords (large vocabulary) | r0398 (`--nolock`, 1 thread) |

Not run here, with reasons: BTC, madmom from GitHub, libKeyFinder, S-KEY, All-In-One, tempo-cnn, Omnizart, Beat
Transformer, Harmony Transformer, ACR_seq2seq, ChordMini, QM Vamp plugins, the Hulme et al. tuning classifier, BEAST,
and the browser libraries (section "Not run here"; steps for Aaron in `for-aaron.md`). The last four tools in the table
ran with `--nolock` on one thread because both CPU slots were held by other lanes' jobs: two video-hands-fretboard jobs
whose commands started at 22:01:23 and 22:01:24 UTC after waiting in the slot queue since 21:12 and 21:31 UTC (start times
of the jobs' child processes, read with `ps` by the verifier at about 22:27 UTC, when `/proc/locks` showed the two jobs
holding `cpu1.lock` and `cpu0.lock`; they were still running then and so were not yet in the ledger). At the starts of
r0351 to r0398 (22:07:23 to 22:14:36 UTC) they had held the slots for 6 to 13 minutes. Times of these four runs are
single-thread times under load, not 2-core slot times.

Virtual environments: all of this lane's venvs were deleted at the end of its work to free disk space, as the
orchestrator's disk notice asked; each tool's `uv pip freeze` is kept in `samples/<tool>/`, and the install commands
in each section recreate them (the wheels stay in the shared uv cache). Model files are kept in
`/home/user/gtr/lanes/chords-beats-key/models/` (TempoCNN, DeepRhythm, autochord).

Inputs: every audio tool was given the clips' 44.1 kHz 16-bit WAV files by path (stereo for the S, R2 and R3 clips, mono
for R1), including R2full (228.5 s); no tool rejected a file. Each tool's own loading and resampling is named in its
section.

## aubio 0.4.9 (Ubuntu packages aubio-tools / python3-aubio 0.4.9-4.4build1)

- What: C library and command-line tools for onsets, pitch, beats and tempo (https://aubio.org). Already installed on
  the box from Ubuntu 24.04 packages `aubio-tools`, `libaubio5`, `python3-aubio`, all 0.4.9-4.4build1 (`dpkg -l`).
- Install: nothing installed. The Python front end `/usr/bin/aubio` starts with `#!/usr/bin/python3`, which is Python
  3.13 on this box, and fails with `ModuleNotFoundError: No module named 'aubio._aubio'` (the Debian module is built for
  Python 3.12). Calling it as `/usr/bin/python3.12 /usr/bin/aubio ...` works. The C tool `aubiotrack` works as is.
- Run: `scripts/aubio_run.py` on 13 clips (S3 S4 S7flat30 S2n S2s S5capo2 S5dropd S6taps R1a R1b R1c R2 R2full), each
  clip's `<id>.wav` (44.1 kHz 16-bit; stereo, mono for R1), default settings (buffer 1024, hop 512, the file's own sample rate):
  `python3.12 /usr/bin/aubio tempo <wav>`, `python3.12 /usr/bin/aubio beat <wav>`, `aubiotrack -i <wav>`. Run r0200,
  `--nolock` (light C tools; load average 13.99 at start): 20.8 s wall for all 13 clips and all three
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
- Verifier re-run: r0425 (the r0200 command on the same 13 clips, `--nolock`, into `verify-trials/reruns/aubio/`): all 39
  output files byte-identical to the trial's (tempo, `aubio beat`, `aubiotrack`).

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
  (22050 Hz mono). 13 clips in one call of `scripts/batch_run.py`, run r0215 (`--nolock`; load
  average 14.29 at start): 97.5 s wall in total, 60.5 s CPU, 389 MB peak RSS. Per clip (all three calls, from
  `samples/chordino/batchC_timings.jsonl`): S3 25.9 s (the first job; its first Chordino call took 14.99 s, the
  local-tuning call on the same file 0.48 s), other 24 to 39 s clips 3.3 to 6.4 s, R2full 16.6 s (Chordino default
  6.37 s, local tuning 5.40 s, tuning plugin 1.38 s).
- Output format: `Chordino.extract()` returns a list of `ChordChange(chord, timestamp)`: a label and a start time in
  seconds, no end times and no confidence. Labels are Chordino's own short names (`G`, `Em`, `Am7`, `D7`, `C#m`,
  `Abmaj7`, `Bbm7b5/Ab`, `F#6`, `Bdim`, `Ebm7b5`, `Bb7/D`, `N`), i.e. majors, minors, sevenths, sixths, diminished,
  half-diminished and slash chords. Every start time in the 491 segments written for the 13 clips (244 in the default-mode
  `.lab` files, 247 in the local-tuning ones) is a multiple of 2048/22050 s (0.0929 s; e.g. 0.372, 0.464, 4.923). Each of
  the 13 clips' lists started with `N` at 0.372 s and ended with an `N` change 0.28 to 0.36 s after the end of the file
  (S3: 24.335 s for a 24.000 s file; verifier's check of the raw default-mode lists, run r0474: 0.279 to 0.364 s). The
  lane script writes `.lab` files (each change lasts until the next one, the last until the end of the file); segments
  that start at or after the end of the file are dropped
  (`scripts/fix_chordino_labs.py` applied that rule to the r0215 outputs, written before the rule was added). The
  tuning plugin returns one item at time 0 with label `<Hz> Hz` (rounded to 0.1 Hz) and the unrounded value in
  `values`, e.g. S7flat30 `431.9 Hz` / 431.8629.
- Output excerpts. S3 (truth G E:min A:min7 D:7 G E:min C D:7 G): `0.372 N, 0.464 G, 4.923 Em, 7.523 Am7, 9.938 D7,
  12.446 G, 14.954 Em, 17.461 C, 19.226 D7, 19.876 G`. S7flat30 (S3 rendered 30 cents flat), global tuning: the same
  label sequence and change times except one: Am7 starts at 7.430 s instead of 7.523 s (one 2048-sample hop earlier).
  R1a (truth key
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
- Verifier re-run: r0436, `chordino_run.py` on S3, S7flat30 and R1b in a venv rebuilt offline from the saved freeze
  (`--nolock`, one thread): both `.lab` files and `nnls_tuning.json` byte-identical to the trial's for all three clips.
  The first job (S3) took 19.8 s and the next two 2.9 and 3.0 s. Run r0468 (S3 only): 3.3 s with the numba cache files
  that the first job had written into the venv (46 `.nbi`/`.nbc` files), 17.9 s after deleting them; so most of the
  first job's extra time is numba compiling librosa's functions once per venv.

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
  `DeepChromaChordRecognitionProcessor`; `CNNKeyRecognitionProcessor` -> `key_prediction_to_label`. Input: the 44.1 kHz
  16-bit `<id>.wav` (stereo; mono for R1), passed by path. One `gtr-run` per clip on 2 cores: S3 r0063 (20.9 s wall, 22.5 s CPU,
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
- Verifier re-run: r0442, `madmom_run.py` on S3 (r0063) and S2n (r0100) in venv-madmom39 rebuilt offline from the saved
  freeze (`--nolock`, one thread; 21.5 s and 31.1 s): all seven output files of each clip (beats, downbeats, tempo, both
  chord `.lab` files, key, key probabilities) byte-identical to the trial's. The S2n downbeat offsets against the truth are
  0.536 to 0.544 s, one beat at 112 BPM (0.536 s), for all 12 bar starts.

## librosa 1.0.0 (beat_track, feature.tempo, estimate_tuning) and a chroma + Krumhansl-Kessler key baseline written for this lane

- What: librosa 1.0.0 from PyPI (uploaded 2026-08-11, requires Python >= 3.12). librosa has no key estimator; the
  key numbers below come from a baseline written in `scripts/librosa_run.py` (mean of `librosa.feature.chroma_cqt` over
  the whole file, Pearson correlation with the 24 rotations of the Krumhansl-Kessler major and minor profiles; the key
  with the highest correlation is the output). It is labelled "lane-written baseline" wherever it appears.
- Install: `uv venv --python 3.12 venv-librosa`; `uv pip install librosa==1.0.0 soundfile music21` (music21 10.5.2 for
  the symbolic key section below). 628 MB. Freeze: `samples/librosa/venv-librosa.freeze.txt`.
- Runs: `scripts/librosa_run.py`: `librosa.load(path, sr=22050, mono=True)`, `librosa.beat.beat_track(y=y, sr=sr,
  units='time')` (defaults hop 512, start_bpm 120, tightness 100, trim True), `librosa.feature.tempo(y=y, sr=sr)`,
  `librosa.estimate_tuning(y=y, sr=sr)` (defaults n_fft 2048, resolution 0.01), and the key baseline. One `gtr-run` per
  clip on 2 cores for S3 r0069 (16.05 s wall, 12.6 s CPU, 343 MB; inside it beat_track took 12.2 s), S4 r0074 (3.78 s),
  S7flat30 r0081 (3.42 s), S2n r0091 (3.12 s), S2s r0092 (3.69 s), S5capo2 r0093 (3.34 s), S5dropd r0094 (3.49 s),
  S6taps r0096 (3.60 s), R1a r0104 (3.70 s). The trial agent did not isolate the cause of the first run's extra time.
  The verifier measured it in a venv rebuilt from the same freeze (run r0468, one thread, `--nolock`): `librosa_run.py` on
  S3 took 3.1 s with the 32 numba cache files (`.nbi`/`.nbc`, all inside librosa) that an earlier run had written into the
  venv, and 11.5 s after deleting them (the run wrote the 32 files again); so the first run in a fresh venv includes
  numba compiling librosa's functions. R1b, R1c, R2 and R2full ran in batch run r0267 (`--nolock`, load average 16.62 at start;
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
- `pitch_tuning` was not run as a separate step: in librosa 1.0.0, `estimate_tuning` runs `piptrack` and returns
  `pitch_tuning(pitch[(mag >= threshold) & pitch_mask], resolution, bins_per_octave)`, with the threshold the median
  magnitude of the bins that have a pitch (`librosa/core/pitch.py` of the 1.0.0 wheel, read in the shared uv cache), so the tuning
  numbers below are `pitch_tuning` applied to `piptrack` peaks.
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
- Verifier re-run: r0438, `librosa_run.py` on S3 (r0069), S7flat30 (r0081) and R1b (r0267) in venv-librosa rebuilt
  offline from the saved freeze (`--nolock`, one thread; 16.1 s, 2.7 s, 2.8 s): all five output files of each clip (beats,
  tempo, tuning, key baseline text and JSON) byte-identical to the trial's.

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
  of the track being 30 BPM and the last one the probability of being 286 BPM", dataset name "Extended Ballroom, LMDTempo
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
  Abm, C#, F#, Ebm, B, F#`; S3's output with the same settings is `Am, G, Em, Am, D, G, Em, C, D, G`. Over the bars
  where S3's output has G, Em, Am, D, C, the S7flat30 output has F#, Ebm, Abm, C#, B (roots one semitone lower), except
  a `B` segment from 8.13 to 10.17 s where S3's has Am, and S3's 0.3 s `D` at 19.88 s has no counterpart (S7flat30's
  last `F#` starts at 19.97 s). Both begin with `Am` over the silent count-in. At 432.45 Hz the S7flat30 output is
  `Am, G, Em, Am, C, Am, D, G, Em, C, G`.
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
- Verifier re-run: r0437, `essentia_run.py` on S3 (r0088), S7flat30 (r0148 / r0267) and R1a (r0267), and the 432.45 Hz call
  on S7flat30 (r0324), in venv-essentia rebuilt offline from the saved freeze (`--nolock`, one thread): all 50 output files
  (rhythm, beats, five key profiles, tuning, TonalExtractor chords, both TempoCNN models, the 432.45 Hz key and chord
  files) byte-identical to the trial's. The parameter defaults listed under "Constraint inputs" are the ones the rebuilt
  build prints (`paramValue`).

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
  13.2 s wall in total, 4.3 s CPU, 70 MB peak RSS (parse plus five analyses: 0.29 to 1.14 s per MIDI file, import 0.89 s, in
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
- Verifier re-run: r0439, the r0237 command (11 clips, both sources, five methods) with music21 10.5.2 in the rebuilt
  venv-librosa, reading the same Basic Pitch files (written 21:34 to 21:36 UTC by the audio-to-notes lane's r0234, before
  r0237): all 132 output files byte-identical to the trial's. `analysisClassFromMethodName` in that build maps `key` to
  `AardenEssen`, `key.krumhansl` to `KrumhanslSchmuckler`, `key.simple` to `SimpleWeights`, `key.bellman` to
  `BellmanBudge`, `key.temperley` to `TemperleyKostkaPayne`. The truth MIDI `S7flat30.mid` has the same 182 note-on
  events as `S3.mid` plus one pitch-wheel message (value -1229).

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
  gdown from `https://drive.google.com/uc?id=1XBn7FyYjF8Ff6EuC7PjwwPzFBLRXGP7n` (a curl test of that URL got HTTP 303,
  and of the same file id on drive.usercontent.google.com HTTP 200; the gdown download completed). autochord's bundled `nnls-chroma.so` has the same SHA-256 (022f18b7...c7d99)
  as the one inside chord-extractor.
- Runs: `scripts/autochord_run.py` (`autochord.recognize(path, lab_fn=...)`) and `scripts/crema_run.py`
  (`crema.analyze.analyze(filename=path)`), 9 clips each, in batch run r0337 (2 cores; 194.4 s wall in total, 188.8 s
  CPU, 1068 MB peak RSS; per job in `samples/crema/batchG_timings.jsonl`). autochord: S3 25.9 s (import and model load
  7.8 s, recognize 16.2 s), the other 24 to 39 s clips 10.5 to 11.6 s, R2full 15.7 s (recognize 6.8 s), 951 to 1068 MB peak
  RSS per job. CREMA: S3 14.4 s (analyze 10.4 s), the other clips 7.1 to 8.0 s, R2full 8.5 s (analyze 4.5 s), 696 to
  760 MB peak RSS. The first job of each tool was the slowest; the cause was not isolated for these two tools. Both load
  audio with librosa 0.10.2.post1 (autochord with `librosa.load`, CREMA through pumpp), and the verifier's re-run (r0452)
  wrote 56 numba cache files, all inside librosa, into the rebuilt venv-tf: the mechanism measured for librosa and Chordino
  in run r0468; the share of the first-job time it accounts for here was not measured.
- Output formats. autochord: a list of `(start, end, label)` tuples and a tab-separated `.lab` file with unrounded
  float times (e.g. `2.2291156462585033	4.96907029478458	G:maj`); labels `<root>:maj`, `<root>:min`, `N`, roots
  spelled with flats (`Gb:maj`, `Eb:min`, `Db:maj`); the chroma step is 2048 samples at 44.1 kHz (`_STEP_SIZE` in the
  package source); no confidence. The last segment can end after the end of the file (R2: 36.037 s for a 36.000 s
  clip). CREMA: a JAMS annotation in namespace `chord` with `time`, `duration`, `value` and `confidence` per segment;
  the lane script writes a `.lab`; labels seen include `A:min7`, `C:maj/3`, `B:maj7`, `A#:7`, `D:dim7`, `G#:dim7`,
  `D#:min/5`, `N` (sevenths, diminished sevenths and inversions); segment confidences 0.21 to 0.97 over the 9 clips.
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
- Verifier re-run: r0452, `autochord_run.py` and `crema_run.py` on S3 and S7flat30 in a venv-tf rebuilt offline from the
  saved freeze except jax 0.4.30 and jaxlib 0.4.30, which were no longer in the shared uv cache (the runs completed
  without them; `--nolock`, one thread; autochord 52.4 s and 17.0 s, CREMA 21.6 s and 8.3 s): the autochord `.lab`
  files and the CREMA `.lab` and `.jams` files byte-identical to the trial's. Independent recomputation with mir_eval
  0.8.2 gives CREMA S3 sevenths 0.8305, as gtr-eval stores it (e1290); the table rounds it to 0.831.

## Extra: the light tools on the real fingerstyle video audio R3a, R3b, R3c (no truth)

R3b and R3c were added to the inputs during this lane's work (`READY-VIDEO`, 21:29 UTC). Their audio (`<id>.wav`, 18 s
each; INPUTS.md: R3a a concert recording, R3b a home recording, R3c a lesson's "Slow play-through" of the traditional
Manx tune 'Three Little Boats') went through the same scripts as above with default settings: Essentia, librosa and
Chordino in batch run r0347 (`--nolock`, 2.8 to 4.7 s per tool per clip), aubio in run r0348 (`--nolock`, 1.95 s for
all three). There is no truth, so nothing is scored; the outputs are listed for the handoff record.

| clip | aubio tempo | librosa beat_track tempo / feature.tempo | Essentia multifeature BPM (confidence) | TempoCNN k16 / k4 | Essentia keys bgate / krumhansl / temperley / edma / shaath | librosa KK baseline key | tuning cents librosa / Essentia; NNLS Hz | Chordino labels |
|---|---|---|---|---|---|---|---|---|
| R3a | 133.22 | 129.20 / 129.20 | 129.34 (3.11) | 129 / 129 | C# min / E maj / E maj / C# min / E maj | Ab minor | +6 / +7; 440.7 | Amaj7 E Ab A6 B Abaug A6 Abdim Aaug Fdim F#m E |
| R3b | 150.84 | 172.27 / 117.45 | 172.27 (2.39) | 170 / 87 | A min / A maj / A min / A min / A min | A major | +9 / +1; 440.9 | Amaj7 Am7 B7/D# Bbmaj7 A |
| R3c | 125.73 | 129.20 / 129.20 | 137.54 (2.26) | 139 / 139 | A min / A min / C maj / A min / A min | A minor | 0 / +1; 439.5 | A Em A F6 Cmaj7 A G Am Dm C |

On R3b, librosa's `beat_track` tempo (172.27) and `feature.tempo` (117.45) differ; on every other clip of this lane they
were equal. Samples: `samples/r3/`.

## DeepRhythm 0.0.13 (PyPI): one global tempo with a confidence

- What: "a convolutional neural network designed for rapid, precise tempo prediction for modern music" (README quoted
  in survey.md). Weights `deeprhythm-0.7.pth`, 5,443,228 bytes, sha256 c7cc8cc0...b3d9c4.
- Install (venv-deeprhythm, Python 3.11): `uv pip install deeprhythm==0.0.13 "torch==2.15.0" "torchaudio==2.11.1"
  "librosa==0.11.0" soundfile` (torch and torchaudio are the versions already in the shared cache; nnaudio 0.3.3 came
  as a dependency). The package downloads its weights on first use from
  `https://github.com/bleugreen/deeprhythm/raw/main/deeprhythm-0.7.pth` (`model_url` plus the file name in
  `deeprhythm/utils.py`). The trial agent's curl test of the copy under `weights/` on github.com
  (`.../raw/main/weights/deeprhythm-0.7.pth`) got HTTP 403 through this box's proxy (github.com pages are refused by the
  proxy); the package's own URL was not requested. The same file was fetched from
  `https://raw.githubusercontent.com/bleugreen/deeprhythm/main/deeprhythm-0.7.pth` (HTTP 200; the copy under
  `weights/` in the repository has the same SHA-256) into
  `/home/user/gtr/lanes/chords-beats-key/models/deeprhythm_home/.local/share/deeprhythm/`, and `scripts/deeprhythm_run.py`
  points HOME there, because the package looks in `~/.local/share/deeprhythm/`. Freeze:
  `samples/deeprhythm/venv-deeprhythm.freeze.txt`.
- Run: `DeepRhythmPredictor(device="cpu", quiet=True).predict(path, include_confidence=True)` on 10 clips, batch run
  r0351. Both CPU slots were held by other lanes' jobs at the time (the two video-hands-fretboard jobs described at the
  top, which had held them since 22:01:23 and 22:01:24 UTC, about 6 minutes before this run started), so this ran with
  `--nolock` and one thread (`OMP_NUM_THREADS=1`, `MKL_NUM_THREADS=1`, `OPENBLAS_NUM_THREADS=1` in the ledger line;
  `torch.get_num_threads()` reported 1; load average 11.28 at start): 78.8 s wall in total, 60.8 s CPU, 773 MB peak RSS.
  Per clip (`samples/deeprhythm/batchE_timings.jsonl`): S3 26.7 s (the first job: import 6.1 s, predict 18.8 s), the
  other 24 to 39 s clips 4.8 to 6.6 s, R2full 7.8 s (predict 4.3 s).
- Output format: one BPM value (whole numbers in these runs) and one confidence (the mean softmax probability of the
  chosen class over the 8-second clips the package cuts the audio into, per `predictor.py`). No beat times.
- Outputs: S3 95 (confidence 0.648), S7flat30 95 (0.612), S4 116 (0.788), S2n 112 (0.731), S2s 112, R1a 107 (0.967),
  R1b 89 (0.457), R1c 120 (0.467), R2 143 (0.537), R2full 143 (0.619).
- Constraint inputs: none in `predict()` besides `include_confidence`; the batch CLI takes a device and a confidence
  flag (survey.md).
- Scores (gtr-eval 0.11.1, tempo): every clip within 4 % of the truth: S3 0.990 (e1336), S7flat30 0.990 (e1338), S4
  1.000 (e1337), S2n 1.000 (e1339), S2s 1.000 (e1340), R1a 1.000 (e1341), R1b 0.989 (e1342), R1c 1.008 (e1343) (ratio
  estimate / truth).
- Samples: `samples/deeprhythm/` (JSON per clip, timings, freeze).
- Verifier re-run: r0445, `deeprhythm_run.py` on S3 and R1b in venv-deeprhythm rebuilt offline from the saved freeze,
  with the same weights file (`--nolock`, one thread; 37.0 s and 6.6 s): `deeprhythm.json` (BPM and confidence) and
  `tempo_deeprhythm.txt` byte-identical to the trial's for both clips. In the installed `predictor.py` the confidence is
  the largest value of the per-class softmax probabilities averaged over the 8-second clips.

## BeatNet 1.1.3 (PyPI, wheel and sdist both uploaded 2023-11-28): beats and downbeats, offline (DBN) and online (particle filter)

- What: "BeatNet: Real-time and Offline Joint Music Beat, Downbeat, Tempo, and Meter Tracking System" (README title,
  quoted in survey.md): a CRNN gives beat and downbeat activations, then madmom's DBN (offline) or a particle filter
  (causal, "online") picks the beats. The install used the PyPI wheel (`BeatNet-1.1.3`, `py3-none-any`; the install log
  shows a download and no build). The installed package contains the weights `models/model_1_weights.pt`,
  `model_2_weights.pt`, `model_3_weights.pt` (1,612,179 bytes each; the README labels them "Pre-trained weights
  (GTZAN)", "(Ballroom)", "(Rock Corpus)" per survey.md, and the comments in BeatNet.py say "GTZAN out trained
  model", "Ballroom out trained model", "Rock_corpus out trained model"; which data each was trained on was not
  checked further) and `model-1.pt` to `model-3.pt` (1,614,574 bytes each). Model 1 was used.
- Install (venv-beatnet, Python 3.11): BeatNet imports madmom and pyaudio at module level, and its metadata pins
  `numba==0.54.1`. Steps that worked: `flock /home/user/gtr/locks/apt.lock apt-get install -y portaudio19-dev` (for
  the PyAudio build); `uv pip install "torch==2.15.0" "numpy==1.23.5" "scipy<1.12" mido "cython<3" "setuptools<81"
  wheel "librosa==0.10.2.post1" matplotlib soundfile` (scipy 1.11.4, numba 0.68.1); `uv pip install
  --no-build-isolation madmom==0.16.1 pyaudio` (run r0335, `--nolock`, 4.2 s; pyaudio 0.2.14); then a one-line edit of
  the installed madmom so it imports on Python 3.11 (`madmom/processors.py` line 23, `from collections import
  MutableSequence` changed to `from collections.abc import MutableSequence`; diff in
  `samples/beatnet/madmom_processors_py_patch.diff`; survey.md records that BeatNet's README lists source fixes for
  madmom 0.16.1 on Python >= 3.10); then `uv pip install --no-deps BeatNet==1.1.3` (so the numba pin is not applied).
  With numpy 1.23.5 the `np.float`-style aliases madmom 0.16.1 uses still exist. Freeze:
  `samples/beatnet/venv-beatnet.freeze.txt`.
- Run: `scripts/beatnet_run.py`: `BeatNet(1, mode='offline', inference_model='DBN', plot=[], thread=False,
  device='cpu').process(path)` and `BeatNet(1, mode='online', inference_model='PF', ...).process(path)`, numpy seed 0
  before each (the particle filter draws random numbers). 11 clips, batch run r0361. Both CPU slots were held by other
  lanes' long jobs, so this ran with `--nolock` and one thread (`OMP_NUM_THREADS=1` and friends; torch reported 1
  thread; load average 12.98 at start): 170.7 s wall in total, 128.1 s CPU, 802 MB peak RSS. Per clip
  (`samples/beatnet/batchI_timings.jsonl`): S3 27.6 s (the first job; offline 19.9 s, online 3.9 s), the other 24 to
  39 s clips 6.2 to 11.0 s (offline 1.35 to 1.78 s, online 2.2 to 6.8 s), R2full 68.4 s (offline 5.6 s, online 57.4 s).
- Output format: `process()` returns an array of rows (time in seconds, position). Times are on a 20 ms grid (fps 50).
  Offline (madmom DBN): position = beat number in the bar, 1 = downbeat; BeatNet constructs
  `DBNDownBeatTrackingProcessor(beats_per_bar=[2, 3, 4], fps=50)` (BeatNet.py line 69). Online (particle filter):
  position 1 = downbeat, 2 = other beat (`particle_filtering_cascade.py`, lines 285 and 289). The lane script writes the
  raw rows and separate beat and downbeat files. No tempo or meter field is returned.
- Output excerpts: S3 offline `0.340 4, 0.980 1, 1.580 2, 2.220 3, 2.840 4, 3.440 1, ...` (38 rows; the first rows fall
  in the silent count-in bar); S3 online `2.520 1, 3.460 2, 5.000 1, 5.320 2, 5.640 2, ...` (30 rows). S2n offline: the
  positions alternate 1, 2, 1, 2 (two beats per bar; 27 downbeats against 12 in the truth). R2 (no truth): offline 43
  beats (median inter-beat interval = 71.43 BPM), online 46 (75.0 BPM). R2full: offline 308 rows, 77 downbeats, positions
  1 to 4; online 299 rows, 85 downbeats.
- Constraint inputs: the constructor takes `model` (1 to 3), `mode` ('stream' from the microphone, 'realtime',
  'online', 'offline'), `inference_model` ('PF' or 'DBN'), `plot`, `thread`, `device`. No tempo range or meter
  argument; the meters [2, 3, 4] for the DBN are fixed in the code.
- Scores (gtr-eval 0.11.1):

| clip | offline beats F / CMLt / AMLt | downbeat F / CMLt | est / truth downbeats | eval | online beats F / CMLt / AMLt | downbeat F / CMLt | est / truth downbeats | eval |
|---|---|---|---|---|---|---|---|---|
| S3 | 0.000 / 0.000 / 0.789 | 0.000 / 0.000 | 10 / 8 | e1346 | 0.161 / 0.000 / 0.581 | 0.267 / 0.250 | 7 / 8 | e1347 |
| S7flat30 | 0.000 / 0.000 / 0.789 | 0.000 / 0.000 | 13 / 8 | e1350 | 0.164 / 0.000 / 0.581 | 0.133 / 0.000 | 7 / 8 | e1351 |
| S4 | 0.951 / 0.907 / 0.907 | 0.944 / 0.895 | 19 / 17 | e1348 | 0.962 / 0.912 / 0.912 | 0.970 / 0.824 | 16 / 17 | e1349 |
| S2n | 0.941 / 0.889 / 0.889 | 0.000 / 0.000 | 27 / 12 | e1352 | 0.833 / 0.542 / 0.542 | 0.087 / 0.000 | 11 / 12 | e1353 |
| S2s | 0.941 / 0.889 / 0.889 | 0.000 / 0.000 | 14 / 12 | e1354 | 0.874 / 0.667 / 0.667 | 0.286 / 0.083 | 9 / 12 | e1355 |
| S6taps | 0.941 / 0.889 / 0.889 | 0.000 / 0.000 | 13 / 12 | e1356 | 0.860 / 0.625 / 0.625 | 0.105 / 0.000 | 7 / 12 | e1357 |
| R1a | 0.577 / 0.547 / 0.547 | 0.593 / 0.571 | 13 / 14 | e1358 | 0.374 / 0.132 / 0.231 | 0.462 / 0.286 | 12 / 14 | e1359 |
| R1b | 0.607 / 0.756 / 0.756 | 0.154 / 0.000 | 15 / 11 | e1360 | 0.253 / 0.091 / 0.114 | 0.000 / 0.000 | 11 / 11 | e1361 |
| R1c | 0.000 / 0.000 / 0.982 | 0.000 / 1.000 | 14 / 14 | e1362 | 0.098 / 0.036 / 0.582 | 0.071 / 0.429 | 14 / 14 | e1363 |

  Beat counts (estimated / truth): offline S3 38 / 32, S4 75 / 68, S2n 54 / 48, R1a 51 / 53, R1b 45 / 44, R1c 56 / 56;
  online S3 30 / 32, S4 65 / 68, S2n 36 / 48, R1a 38 / 53, R1b 35 / 44, R1c 46 / 56.
- Samples: `samples/beatnet/` (raw rows for S3, S4, S2n, R1a, R2; timings; freeze; the madmom diff).
- Verifier re-run: r0455, `beatnet_run.py --model 1` on S3 and S4 in venv-beatnet rebuilt offline from the saved freeze
  with the same one-line madmom edit (`--nolock`, one thread; 27.7 s and 8.6 s): all six output files of each clip (raw
  rows, beats and downbeats, offline and online) byte-identical to the trial's, the online particle filter included
  (numpy seed 0).

## Beat This! (beat-this 1.1.0 from PyPI): beats and downbeats

- What: the CPJKU beat and downbeat tracker (PyPI `beat-this` 1.1.0, uploaded 2026-04-14). Checkpoints are fetched by
  name from `https://cloud.cp.jku.at/public.php/dav/files/7ik4RrBKTS273gp/<name>.ckpt` (`CHECKPOINT_URL` in
  `beat_this/inference.py`) into the torch hub cache: `final0` (81,058,141 bytes, sha256 8c328b45...8331; already in the
  box's shared torch cache when this lane first loaded it) and `small0` (8,451,101 bytes, sha256 6074be2c...7d47b,
  downloaded by this lane).
- Install (venv-beatthis, Python 3.11, 885 MB as a standalone venv): `uv pip install beat-this==1.1.0 soundfile`
  (torch 2.15.0+cpu, torchaudio 2.11.1+cpu, einops 0.8.2, rotary-embedding-torch 0.9.2, soxr 1.1.0, numpy 2.4.6).
  No other step. Freeze: `samples/beat_this/venv-beatthis.freeze.txt`.
- Run: `scripts/beatthis_run.py`: `beat_this.inference.File2Beats(checkpoint_path=<final0|small0>, device="cpu",
  float16=False, dbn=False)(path)`, i.e. the default "minimal" post-processing (peak picking; the `dbn=True` option
  needs madmom and was not used). Batch run r0397: final0 on 11 clips, small0 on 7. Both CPU slots were held by other
  lanes' long jobs, so this ran with `--nolock` and one thread (torch reported 1 thread; load average 14.09 at start):
  109.8 s wall in total, 103.8 s CPU, 625 MB peak RSS. Per clip (`samples/beat_this/batchB2_timings.jsonl`): final0
  4.1 to 6.8 s for the 24 to 39 s clips (S3: import 2.1 s, model load 0.36 s, inference 2.25 s), R2full 22.1 s
  (inference 20.3 s); small0 3.0 to 5.4 s, R2full 15.0 s.
- Output format: two numpy arrays of times in seconds (beats; downbeats, which were a subset of the beat times in all 18 outputs here), on a
  20 ms grid (the model's 50 frames per second, Postprocessor `fps=50`); no bar position, tempo or confidence. The
  lane script writes `<ckpt>_beats.txt`, `<ckpt>_downbeats.txt` and `<ckpt>.json`.
- Input: the 44.1 kHz WAV by path (stereo; mono for R1); the package loads it with torchaudio (soundfile fallback) and resamples
  it to 22050 Hz with soxr (`beat_this/preprocessing.py`; `inference.py` line 275). R2full (228.5 s) was accepted.
- Output excerpts: S3 final0 beats 0.640, 1.280, 1.900, 2.520, 3.160, ... (32 beats; the first three fall in the silent
  count-in bar), downbeats 0.640, 2.520, 5.020, ... (9). S2n final0 downbeats 2.140, 2.680, 3.760, 4.300, 5.900, 6.440,
  ... (26 against 12 in the truth). R2 (no truth): 43 beats (median inter-beat interval = 71.43 BPM), 11 downbeats, with
  both checkpoints; R2full: 266 beats, 71 (final0) and 70 (small0) downbeats.
- Constraint inputs: `File2Beats(checkpoint_path, device, float16, dbn)`; no tempo range, meter or tempo hint
  argument.
- Scores (gtr-eval 0.11.1):

| clip | ckpt | beats F / CMLt / AMLt | est / truth beats | downbeat F / CMLt | est / truth downbeats | eval |
|---|---|---|---|---|---|---|
| S3 | final0 | 0.906 / 0.906 / 0.906 | 32 / 32 | 0.941 / 0.889 | 9 / 8 | e1364 |
| S3 | small0 | 0.954 / 0.939 / 0.939 | 33 / 32 | 0.941 / 0.889 | 9 / 8 | e1365 |
| S7flat30 | final0 | 0.906 / 0.906 / 0.906 | 32 / 32 | 0.941 / 0.889 | 9 / 8 | e1368 |
| S4 | final0 | 0.956 / 0.956 / 0.956 | 68 / 68 | 0.971 / 0.944 | 18 / 17 | e1366 |
| S4 | small0 | 0.971 / 0.944 / 0.944 | 72 / 68 | 0.971 / 0.944 | 18 / 17 | e1367 |
| S2n | final0 | 0.941 / 0.889 / 0.889 | 54 / 48 | 0.421 / 0.000 | 26 / 12 | e1369 |
| S2n | small0 | 0.529 / 0.042 / 0.256 | 39 / 48 | 0.529 / 0.091 | 22 / 12 | e1370 |
| S2s | final0 | 0.950 / 0.906 / 0.906 | 53 / 48 | 0.828 / 0.588 | 17 / 12 | e1371 |
| S6taps | final0 | 0.941 / 0.889 / 0.889 | 54 / 48 | 0.960 / 0.923 | 13 / 12 | e1372 |
| R1a | final0 | 0.990 / 0.981 / 0.981 | 52 / 53 | 0.963 / 0.929 | 13 / 14 | e1373 |
| R1a | small0 | 0.990 / 0.981 / 0.981 | 52 / 53 | 0.963 / 0.929 | 13 / 14 | e1374 |
| R1b | final0 | 0.644 / 0.705 / 0.705 | 43 / 44 | 0.438 / 0.143 | 21 / 11 | e1375 |
| R1c | final0 | 1.000 / 1.000 / 1.000 | 56 / 56 | 1.000 / 1.000 | 14 / 14 | e1376 |
| R1c | small0 | 0.991 / 0.982 / 0.982 | 57 / 56 | 0.903 / 0.706 | 17 / 14 | e1377 |

- Samples: `samples/beat_this/` (final0 JSON for S3, S4, S2n, R1a, R1b, R2; small0 for S3; timings; freeze).
- Verifier re-run: r0446, `beatthis_run.py` with final0 on S3 and S2n and small0 on S3 in venv-beatthis rebuilt offline
  from the saved freeze, same cached checkpoints (sizes and SHA-256 as above; `--nolock`, one thread; 8.5 s, 6.0 s,
  4.3 s): beats, downbeats and JSON byte-identical to the trial's for all three runs.

## lv-chordia 1.1.0 (PyPI): the ISMIR 2019 large-vocabulary chord model (Chord-CNN-LSTM)

- What: an inference-only PyPI package (uploaded 2026-07-11) of the music-x-lab model "Large-Vocabulary Chord
  Transcription via Chord Structure Decomposition" (survey.md): a CQT front end, an ensemble of 5 networks and HMM
  decoding against a chord dictionary. The weights ship in the wheel and install to
  `<venv>/share/lv-chordia/cache_data/`: five files `joint_chord_net_ismir_naive_v1.0_reweight(0.0,10.0)_s0.best.sdict`
  to `_s4` (5,746,175 to 5,746,227 bytes each, 28 MB together). Dictionaries in `lv_chordia/data/`: `submission`
  (26 entries, e.g. `C:maj`, `C:min7`, `C:maj/3`, `C:sus4(b7)`, `C:13`, `C:min9`, `N`), `ismir2017` (15 entries: maj, min,
  dim, aug, min6, maj6, min7, minmaj7, maj7, 7, dim7, hdim7, sus2, sus4, N), `extended` (26), `full` (382); each entry
  is written on root C.
- Install (venv-lvchordia, Python 3.11): `uv pip install lv-chordia==1.1.0 "torch==2.15.0"` (librosa 0.11.0, h5py
  3.16.0, pydub 0.25.1, numpy 2.4.6 came with it). The first attempt was cut off by a 300 s shell timeout while
  downloading the 25.9 MiB wheel over the shared network; the same command then completed in the background. No other
  step. Freeze: `samples/lv_chordia/venv-lvchordia.freeze.txt`.
- Run: `scripts/lvchordia_run.py`: `lv_chordia.chord_recognition.chord_recognition(path, chord_dict_name=<dict>)` for
  `submission` (the package default) and `ismir2017`, 9 clips, batch run r0398. Both CPU slots were held by other lanes'
  long jobs, so this ran with `--nolock` and one thread (torch reported 1 thread; load average 7.21 at start): 177.9 s
  wall in total, 156.2 s CPU, 1084 MB peak RSS. Per clip (`samples/lv_chordia/batchD_timings.jsonl`): S3 30.3 s (the
  first job; `submission` 25.1 s, `ismir2017` 2.1 s on the same file), the other 24 to 39 s clips 9.2 to 13.0 s, R2full
  68.4 s (`submission` 34.0 s, `ismir2017` 31.9 s).
- Output format: a list of `{"start_time", "end_time", "chord"}` with times rounded to 0.01 s by the package and Harte
  labels with flat spellings (`Bb:7`, `Eb:min`, `Ab:min`) and inversions (`B:maj/3`, `Bb:maj/b7`, `D:maj/2`); no
  confidence. Labels seen across the 9 clips with `submission`: maj, min, 7, maj7, min7, dim, inversions /3, /b7, /2,
  and `N`.
- Output excerpts: S3 (both dictionaries) `N 0-2.48, G:maj 2.48-5.02, E:min 5.02-7.52, A:min7 7.52-10.03, D:7
  10.03-12.54, G:maj, E:min, C:maj, D:7, G:maj 20.04-24.01`, the truth's label sequence. S7flat30: `N, G:maj, E:min,
  A:min, D:7, G:maj, E:min, C:maj, D:maj, G:maj, N 21.85-24.01`. R1b (a single-note solo take): one segment, `N`
  from 0 to 29.35 s. R1a: `N C#:maj F#:maj B:maj E:maj Bb:min Eb:maj Ab:min C#:maj F#:maj B:maj E:maj Bb:maj`. R2 (no
  truth): `N F#:maj Eb:min B:maj F#:maj Bb:7 B:maj Bb:7 Eb:min F:7 F#:maj C#:maj Ab:min Bb:7 B:maj`. R2full: 72
  segments (`submission`), 70 (`ismir2017`).
- Constraint inputs: `chord_dict_name` (`submission`, `ismir2017`, `full`; the dictionary files are plain text and
  restrict what the HMM can output). Audio paths may also be http(s) or ftp URLs (`audio_utils.py`). No key, tuning or
  capo argument.
- Scores (gtr-eval 0.11.1, chords):

| clip | dict | root | majmin | sevenths | mirex | seg | est / truth segments | eval |
|---|---|---|---|---|---|---|---|---|
| S3 | submission | 0.965 | 0.965 | 0.965 | 0.965 | 0.965 | 10 / 10 | e1379 |
| S3 | ismir2017 | 0.965 | 0.965 | 0.965 | 0.965 | 0.965 | 10 / 10 | e1378 |
| S7flat30 | submission | 0.878 | 0.878 | 0.746 | 0.878 | 0.893 | 11 / 10 | e1383 |
| S7flat30 | ismir2017 | 0.878 | 0.878 | 0.746 | 0.878 | 0.893 | 11 / 10 | e1382 |
| S4 | submission | 0.990 | 0.990 | 0.990 | 0.990 | 0.990 | 18 / 18 | e1381 |
| S4 | ismir2017 | 0.990 | 0.990 | 0.990 | 0.990 | 0.990 | 18 / 18 | e1380 |
| S2n | submission | 0.952 | 0.952 | 0.952 | 0.952 | 0.952 | 23 / 22 | e1385 |
| S2n | ismir2017 | 0.952 | 0.952 | 0.952 | 0.952 | 0.952 | 23 / 22 | e1384 |
| R1a | submission | 0.971 | 0.785 | 0.524 | 0.664 | 0.971 | 13 / 13 | e1387 |
| R1a | ismir2017 | 0.971 | 0.785 | 0.524 | 0.664 | 0.971 | 13 / 13 | e1386 |
| R1b | submission | 0.000 | 0.000 | 0.000 | 0.000 | 0.364 | 1 / 6 | e1389 |
| R1b | ismir2017 | 0.000 | 0.000 | 0.000 | 0.000 | 0.364 | 1 / 6 | e1388 |
| R1c | submission | 0.694 | 0.694 | 0.623 | 0.694 | 0.771 | 15 / 14 | e1391 |
| R1c | ismir2017 | 0.746 | 0.746 | 0.645 | 0.746 | 0.788 | 15 / 14 | e1390 |

- Samples: `samples/lv_chordia/` (JSON for S3, S7flat30, S4, S2n, R1a, R1b, R2, R2full; timings; freeze).
- Verifier re-run: r0449, `lvchordia_run.py` on S3 and S7flat30 in venv-lvchordia rebuilt offline from the saved freeze
  (`--nolock`, one thread; 44.0 s and 13.8 s): the JSON and `.lab` files for both dictionaries byte-identical to the
  trial's for both clips.

## Gap round 1

Agent: gapfill-chords-beats-key. Date: 2026-11-10 to 2026-11-11 (`date -u +%F`), from about 23:15 UTC. Task: run the
tools the first round recorded as not run (for lack of disk or time, or not attempted) on the same clips with the same
scoring, preferring published packages (PyPI wheels, apt) over code from cloned repositories, and record what still
cannot run. Same conventions as above: `rNNNN` run ids, `eNNNN` gtr-eval 0.11.1 ids (scored with `scripts/score_all.py`,
so they are also in `out/scores/scores.jsonl` and `samples/scores/`), scripts in `scripts/`, small outputs in
`samples/<tool>/`, full outputs in `/home/user/gtr/lanes/chords-beats-key/out/<tool>/<clip>/`. Each tool's venv and the
weights it downloaded were deleted when the tool was done; its `uv pip freeze` is in `samples/<tool>/`. The shared disk
had 9.5 GB free at the start; the orchestrator's DISK LOW notice (below 9,000 MB free) printed from about 23:32 UTC on,
with 6.3 to 9.0 GB free while this round ran.

### All-In-One 1.1.0 (PyPI `allin1`): beats, downbeats, tempo and song sections, after a Demucs separation

- What: Taejun Kim and Juhan Nam's structure analyzer (survey.md, All-In-One), PyPI `allin1` 1.1.0 (the wheel
  `allin1-1.1.0-py3-none-any.whl`, sha256 90edc464...f800e). Each call first runs Demucs `htdemucs` on the input in a
  subprocess (`allin1/demix.py`), then madmom spectrograms of the four stems, then an ensemble of 8 networks
  (`harmonix-all`, the default model) whose beat and downbeat activations go through madmom's
  `DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4])`.
- Install (venv-allin1, Python 3.9.25; numpy held at 1.23.5 by a constraints file in every step), commands as run:
  1. `uv pip install "numpy==1.23.5" "scipy<1.11" mido "cython<3" "setuptools<81" wheel soundfile cmake ninja
     "torch==2.5.1" "torchaudio==2.5.1"` (torch 2.5.1+cpu, torchaudio 2.5.1+cpu, scipy 1.10.1, Cython 0.29.37,
     cmake 4.4.4).
  2. `uv pip install --no-build-isolation madmom==0.16.1` (the PyPI sdist; uv reused the wheel it had built in this lane's
     r0047, same Python and numpy).
  3. NATTEN. The README's link (the NATTEN website) failed TLS on 2026-11-10 (expired certificate), and the CPU wheels on
     NATTEN's current index are all version 0.17.5, which no longer has the four functions allin1 imports (survey.md,
     All-In-One, "Gap round 1"). NATTEN was therefore built from its PyPI sdist, CPU only:
     `NATTEN_N_WORKERS=2 uv pip install --no-build-isolation natten==<version>` with the venv's `bin/` on PATH (for
     cmake); `setup.py` printed "Building NATTEN for CPU ONLY." (script `/home/user/gtr/lanes/chords-beats-key/logs/gap1/build_natten.sh`).
     0.17.4, run r0512 (2 cores; 224.85 s wall including a slow sdist download, 158.6 s CPU, 1303.1 MB peak RSS; exit 1):
     the build finished, but `import natten` failed on Python 3.9 with "TypeError: unsupported operand type(s) for |:
     'type' and '_GenericAlias'" (`natten/flops.py` line 82). 0.17.3, run r0518 (2 cores; 97.45 s wall, 158.6 s CPU,
     1302.9 MB; exit 0): `from natten.functional import natten1dav, natten1dqkrpb, natten2dav, natten2dqkrpb` worked.
  4. `uv pip install "demucs==4.0.1" "allin1==1.1.0"` (4 s; demucs 4.0.1 from its sdist, librosa 0.11.0,
     huggingface-hub 1.8.0, hydra-core 1.3.8, omegaconf 2.3.1, matplotlib 3.9.4, numba 0.60.0, openunmix 1.3.0).
  No file of allin1, madmom, NATTEN or Demucs was edited. The venv was 1.4 GB by `du` (hard links into the shared uv
  cache). Freeze: `samples/allin1/venv-allin1.freeze.txt`.
- Weights, fetched before the timed runs so that no run includes a download (`/home/user/gtr/lanes/chords-beats-key/logs/gap1/allin1_fetch_weights.log`):
  Demucs `htdemucs`, `955717e8-8726e21a.th`, 84,141,911 bytes, from dl.fbaipublicfiles.com via
  `demucs.pretrained.get_model('htdemucs')`; the eight `harmonix-fold*` files from Hugging Face `taejunkim/allinone`,
  1,400,571 bytes each (the HF hub printed "Warning: You are sending unauthenticated requests to the HF Hub"). SHA-256
  of all nine: `samples/allin1/weights_sha256.txt`. All were deleted after the runs.
- Runs: `scripts/allin1_run.py` calls the package's own functions in the order and with the defaults of
  `allin1.analyze()`: `demix([path], demix_dir, 'cpu')` (the subprocess `<python> -m demucs.separate --out <dir> --name
  htdemucs --device cpu <file>`), `extract_spectrograms(..., multiprocess=True)`, `load_pretrained_model('harmonix-all',
  'cpu')`, `run_inference(...)` under `torch.no_grad()`, `save_results(...)`; it times each stage
  (`time.perf_counter`; CPU seconds of the process and of its waited-for children) and then deletes the stems and
  spectrograms, as `analyze()` does with its default `keep_byproducts=False`. S3 ran alone first, run r0521 (2 cores;
  103.54 s wall, 126.7 s CPU, 1552.6 MB peak RSS); the other nine clips in batch run r0563 (2 cores; 1854.58 s wall in
  total, 2178.5 s CPU, 2038.5 MB peak RSS; `scripts/batch_run.py`, plan `scripts/plans/gap1_allin1_batch.json`). torch
  reported 2 threads. Every job's wall-clock includes the Demucs separation:

| clip | job wall s | htdemucs subprocess s (its CPU s) | spectrograms s | model load s | inference s (CPU s) | peak RSS MB | bpm | beats / downbeats | segments |
|---|---|---|---|---|---|---|---|---|---|
| S3 (24.0 s) | 103.507 | 31.425 (49.921) | 0.586 | 1.168 | 67.555 (72.156) | 1552.6 | 95 | 29 / 8 | 3 |
| S4 (38.7 s) | 155.221 | 43.201 (66.875) | 0.825 | 1.346 | 107.065 (111.049) | 1510.2 | 115 | 65 / 17 | 4 |
| S7flat30 (24.0 s) | 114.578 | 40.832 (56.207) | 0.508 | 1.349 | 68.969 (73.237) | 1484.2 | 95 | 29 / 8 | 3 |
| S2n (29.4 s) | 124.084 | 36.500 (58.405) | 0.663 | 1.563 | 82.549 (87.553) | 1507.8 | 111 | 47 / 12 | 3 |
| S5capo2 (29.4 s) | 125.681 | 38.619 (60.460) | 0.649 | 1.330 | 81.732 (86.319) | 1554.8 | 111 | 46 / 12 | 3 |
| S5dropd (29.4 s) | 129.930 | 41.503 (61.636) | 0.714 | 1.395 | 83.473 (88.006) | 1538.8 | 111 | 47 / 12 | 3 |
| R1a (29.2 s) | 122.792 | 36.127 (53.813) | 0.642 | 1.328 | 81.847 (86.304) | 1532.9 | 107 | 48 / 12 | 4 |
| R1b (29.3 s) | 138.223 | 51.086 (65.476) | 0.827 | 1.425 | 82.136 (86.623) | 1516.9 | 91 | 35 / 8 | 3 |
| R1c (28.2 s) | 166.226 | 62.594 (67.540) | 0.617 | 1.423 | 98.894 (99.464) | 1457.4 | 120 | 52 / 13 | 2 |
| R2full (228.5 s) | 777.783 | 186.930 (318.146) | 4.960 | 1.385 | 581.557 (603.523) | 2038.5 | 71 | 264 / 66 | 10 |

  (S3's row is r0521; the others are per-job lines of r0563, `samples/allin1/batch_gap1_timings.jsonl`; stage times
  from each clip's `timings.json`, copied to `samples/allin1/<clip>.timings.json`.) R2full, the whole song: 777.8 s,
  of which 186.9 s Demucs and 581.6 s the 8-network inference.
- The published command line, once: run r0576 (2 cores; 155.62 s wall, 181.3 s CPU, 1526.9 MB) ran
  `allin1 /home/user/gtr/inputs/S4/S4.wav -o <dir> -d cpu --demix-dir <dir>/demix --spec-dir <dir>/spec`. Its `S4.json`
  equals the wrapper's (r0563) in `bpm`, all 65 beats, 17 downbeats and the beat positions; one segment boundary differs,
  20.70 s (CLI) against 20.69 s (wrapper) (`samples/allin1/S4.cli_r0576.json`). Demucs 4.0.1's `--shifts` defaults to 1
  ("Number of random shifts for equivariant stabilization.", `demucs/separate.py`), and `apply_model` then shifts the
  input "by a random amount between 0 and 0.5 sec" (`demucs/apply.py`, `random.randint`); allin1 passes no shift or seed,
  so two runs on one file need not give identical stems.
- Output format: allin1's own `<name>.json` with `path`, `bpm` (an integer: the most frequent rounded value of 60 /
  inter-beat interval, `postprocessing/tempo.py`), `beats` and `downbeats` (seconds, written with 2 decimals, i.e. on the
  0.01 s grid of its 100 frames per second), `beat_positions` (1 to 4 here) and `segments` (`start`, `end`, `label`). No
  confidence values. The lane script also writes `beats.txt`, `downbeats.txt`, `beat_positions.txt` (time, position),
  `tempo.txt` and `segments.lab`. Segment labels seen: `start` and `intro` on the S and R1 clips (S3: `start` 0 to 2.50,
  `intro` 2.50 to 23.99, `start` 23.99 to 24.00; S4: `start`, then three `intro` segments); R2full: `start` 0.00 to 0.12,
  `verse`, `verse`, `chorus` (43.41 to 80.12), `verse`, `chorus`, `solo` (140.11 to 173.46), `chorus`, `chorus`, `outro`
  (220.07 to 228.49).
- Output excerpts: S3 beats 2.51, 3.14, 3.76, ... (29; truth 32 from 2.5 s), downbeats 2.51, 5.02, 7.52, ... (8). S2n
  downbeats 2.14, 4.30, 6.43, 8.58, ... and S5capo2 2.14, 4.29, 6.43, 8.58, ... (12 each; truth 2.143, 4.286, 6.429,
  8.571, ...). R1a: the beats run at the truth tempo (median
  inter-beat interval 0.560 s against 0.561 s) with a median offset of -0.267 s from the nearest truth beat, -0.48 of a
  beat, i.e. on the off-beats; R1c the same with +0.223 s (+0.44 of its 0.504 s beat). R1b's first beat is at 5.42 s.
  R2full (no truth): bpm 71, median inter-beat interval 0.830 s (72.29 BPM), 264 beats, 66 bar starts, positions 1 to 4
  (the artist's page lists 72 bpm, per INPUTS.md).
- Input facts: the 44.1 kHz WAV by path (stereo; mono for R1); Demucs decodes it and returns four 44.1 kHz stereo stems;
  allin1 makes 12-band-per-octave log spectrograms at 100 frames per second (`spectrogram.py`, "fps=int(44100 / 441)").
  R2full (228.5 s) was accepted.
- Constraint inputs (`analyze()` signature in the 1.1.0 wheel): `model` (`harmonix-all` or one `harmonix-fold0` to
  `harmonix-fold7`), `device`, `include_activations`, `include_embeddings`, `demix_dir`, `spec_dir`,
  `keep_byproducts`, `overwrite`, `multiprocess`, `visualize`, `sonify`. No tempo range, meter or tempo hint; the DBN's
  `beats_per_bar=[3, 4]` is fixed in `postprocessing/metrical.py`.
- Scores (gtr-eval 0.11.1; beats and downbeats in one call, `--downbeats-est`):

| clip | beats F / CMLt / AMLt | est / truth beats | downbeat F / CMLt | est / truth downbeats | eval | bpm | within 4 % (ratio) | eval |
|---|---|---|---|---|---|---|---|---|
| S3 | 0.951 / 0.906 / 0.906 | 29 / 32 | 1.000 / 1.000 | 8 / 8 | e1509 | 95 | yes (0.990) | e1510 |
| S7flat30 | 0.951 / 0.906 / 0.906 | 29 / 32 | 1.000 / 1.000 | 8 / 8 | e1580 | 95 | yes (0.990) | e1581 |
| S4 | 0.977 / 0.956 / 0.956 | 65 / 68 | 1.000 / 1.000 | 17 / 17 | e1578 | 115 | yes (0.991) | e1579 |
| S2n | 0.989 / 0.979 / 0.979 | 47 / 48 | 1.000 / 1.000 | 12 / 12 | e1582 | 111 | yes (0.991) | e1583 |
| S5capo2 | 0.979 / 0.958 / 0.958 | 46 / 48 | 1.000 / 1.000 | 12 / 12 | e1584 | 111 | yes (0.991) | e1585 |
| S5dropd | 0.989 / 0.979 / 0.979 | 47 / 48 | 1.000 / 1.000 | 12 / 12 | e1586 | 111 | yes (0.991) | e1587 |
| R1a | 0.000 / 0.000 / 0.923 | 48 / 53 | 0.000 / 0.000 | 12 / 14 | e1588 | 107 | yes (1.000) | e1589 |
| R1b | 0.633 / 0.659 / 0.659 | 35 / 44 | 0.105 / 0.182 | 8 / 11 | e1590 | 91 | yes (1.011) | e1591 |
| R1c | 0.000 / 0.000 / 0.945 | 52 / 56 | 0.000 / 0.929 | 13 / 14 | e1614 | 120 | yes (1.008) | e1615 |

  Song sections have no truth in these clips and were not scored.
- Not run: `visualize` and `sonify` (they write images and audio). The stems were deleted with the run (allin1's
  default), so no audio was kept.
- Samples: `samples/allin1/` (JSON of S3, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c, R2full and the CLI's S4; per-clip
  timings; batch timings; weight hashes; freeze).

## S3 versus S7flat30 (the same notes rendered 30 cents flat): what changed

Collected from the sections above (same eval ids); S3 value / S7flat30 value.

| tool | tuning estimate on S7flat30 (truth -30 cents) | key S3 / S7flat30 | chord root S3 / S7flat30 | beat F S3 / S7flat30 | tempo S3 / S7flat30 |
|---|---|---|---|---|---|
| madmom | (none) | G major / G major | CNN 0.856 / 0.877; deep chroma 0.919 / 0.915 | 0.870 / 0.914 | 95.238 / 95.238 |
| librosa (+ lane-written key baseline) | -31 cents | G major / G major | (none) | 0.820 / 0.787 | 95.703 / 95.703 |
| Essentia | -31 cents | G major / G major (5 profiles, 440 Hz) | TonalExtractor at 440 Hz 0.782 / 0.000; at 432.45 Hz 0.780 / 0.675 | multifeature 0.870 / 0.899 | 95.557 / 95.571; TempoCNN 96 / 96 |
| Chordino / NNLS Tuning | 431.863 Hz = -32.316 cents | (none) | 0.878 / 0.876 | (none) | (none) |
| aubio | (none) | (none) | (none) | 0.889 / 0.812 | 121.24 / 108.76 |
| autochord | (none) | (none) | 0.923 / 0.921 | (none) | (none) |
| CREMA | (none) | (none) | 0.931 / 0.931 | (none) | (none) |
| lv-chordia (submission) | (none) | (none) | 0.965 / 0.878 | (none) | (none) |
| Beat This! final0 | (none) | (none) | (none) | 0.906 / 0.906 | (none) |
| BeatNet offline / online | (none) | (none) | (none) | 0.000 / 0.000; 0.161 / 0.164 | (none) |
| DeepRhythm | (none) | (none) | (none) | (none) | 95 / 95 |
| music21 on Basic Pitch MIDI (default / krumhansl / simple / bellman / temperley) | (none) | E min / G maj; G / G; G / G; C maj / G maj; G / G | (none) | (none) | (none) |

"(none)": the tool gives no such output. Truth for both clips: G major, 96 BPM.

## Open-string tuning and capo: what the outputs above show for S5dropd and S5capo2

The task asked only for what existing tools give that bears on tuning and capo; no tool run here outputs a capo
position or an open-string tuning.

- Lowest detected pitch, from the audio-to-notes lane's Basic Pitch 0.4.0 ONNX MIDI (that lane's run r0234), counted
  with `scripts/lowest_pitch_basicpitch.py` (mido, note-on events outside channel 10): S5dropd lowest five pitches 24,
  38, 38, 38, 38, with 4 notes at MIDI 38 (D2); the truth MIDI has exactly 4 notes at 38 and none lower. S2n: 24, then
  43 (G2) upward; S5capo2: 24, then 45 (A2) upward. Each of the three Basic Pitch files contains one note at MIDI 24 (C1)
  that is not in the truth. Standard tuning's lowest open string is E2 (MIDI 40). (Verifier: in the S5dropd Basic Pitch
  MIDI the four MIDI-38 notes start at 8.595, 13.941, 18.227 and 25.732 s, 12 to 24 ms after the four truth D2 onsets at
  8.571, 13.929, 18.214 and 25.714 s; its MIDI-24 note starts at 0 s.)
- Key estimates on S5capo2 (truth A major, capo 2 on a G-major arrangement): A major from the librosa baseline (e0317),
  all five Essentia profiles (e0973 e0976 e0977 e0979 e0981), music21 on both note sources; E major from madmom (weighted 0.5,
  e0311). On S5dropd (truth G major): G major from every key tool run here (madmom e1017, librosa baseline e0325,
  Essentia e1031 e1033 e1035 e1037 e1039, music21).
- Tuning-offset estimators on S5dropd and S5capo2 (truth 0 cents): librosa +2 / +2, Essentia -3 / -6, NNLS Tuning
  +0.455 / +0.608 cents.

## Not run here

| tool | what stopped it (evidence) |
|---|---|
| BTC (jayg996/BTC-ISMIR19, commit 2682317) | Distributed only as a GitHub repository (no PyPI package; survey.md). The clone (with `test/btc_model.pt` 12,154,754 bytes and `test/btc_model_large_voca.pt` 12,229,576 bytes) and a venv (torch 2.15.0+cpu, librosa 0.11.0, mir_eval 0.8.2, pandas 3.1.1, pyyaml; freeze in `samples/btc/`) were made and `scripts/btc_run.py` was written (the repository's test.py loop with `np.float`/`np.int` aliases and `torch.load(weights_only=False)`), but the `gtr-run` call that would execute it was refused by this session's tool-permission policy (the trial agent's transcript shows "Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]"). The clone and venv were deleted. |
| madmom from GitHub main (0.17.dev0, 27f032e) | Build from the clone refused by the same policy; PyPI 0.16.1 was used instead (madmom section). |
| libKeyFinder + keyfinder-cli | Not in Ubuntu 24.04 apt (`apt-cache search keyfinder` returned nothing); the build route is a CMake build of cloned repositories, the kind of step this session's policy refused twice (madmom, BTC); not attempted. PyPI `keyfinder` 1.1.0 is a binding that needs libkeyfinder installed (survey.md). |
| S-KEY (deezer/skey) | Installs from its repository with poetry (survey.md); PyPI `skey` 0.2 has the home page http://github.com/dleonik/skey and no release files (PyPI JSON read 2026-11-10); not attempted for the same reason. |
| All-In-One (allin1 1.1.0) | (corrected in gap round 1: it ran here, see "Gap round 1"; madmom 0.16.1 from PyPI on Python 3.9 and NATTEN 0.17.3 built from its PyPI sdist replaced the README's GitHub madmom and NATTEN website.) First-round reason: its README (raw.githubusercontent.com/mir-aidj/all-in-one/main/README.md, read 2026-11-10) says "Install NATTEN (Required for Linux and Windows; macOS will auto-install)" (Linux: "Download from NATTEN website"; Windows: "Build from source") and installs madmom from GitHub ("pip install git+https://github.com/CPJKU/madmom  # install the latest madmom directly from GitHub"); the madmom git route was refused here; not attempted. Each run would also include a Demucs htdemucs separation (survey.md). |
| tempo-cnn (tempocnn 0.0.8) | PyPI metadata requires `tensorflow==2.17.0`; the only TensorFlow wheel in the shared cache was tensorflow-cpu 2.12.1 and the orchestrator's disk notice (4.7 to 7.9 GB free on the shared disk during this run, per the notices and `df -h`) asked lanes not to install a second TensorFlow version. Not installed. Essentia's TempoCNN algorithm with the deeptemp models ran (Essentia section); their metadata cites Schreiber and Müller, SMC 2019. |
| Omnizart chord (0.6.3) | sdist only; requires tensorflow>=2.5, tf-keras, madmom>=0.16.1, pyfluidsynth, sherpa-onnx, vamp (PyPI metadata). Not attempted by the trial agent (time). The verifier then tried a chord-only install (the sdist with `--no-deps` on the cached tensorflow-cpu 2.12.1, plus only the chord checkpoint file, 44,242,072 bytes, from the GitHub release `checkpoints-20211001` that `omnizart download-checkpoints` reads); the shell command was refused before it ran: "Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]". Nothing was installed. The sdist's `setup.py` itself runs `uv pip install` / `pip install` for Cython, numpy, madmom, vamp, pyaudio and pyfluidsynth when they are missing (read in the sdist, sha256 66b96cd3...45c1). |
| Beat Transformer | Repository code that first separates stems with Spleeter (survey.md); repository-code execution was refused here twice; not attempted. |
| Harmony Transformer v1 / v2 | Training scripts only, no released weights (survey.md); nothing to run. |
| ACR_seq2seq | No checkpoints in the repository (survey.md); nothing to run. |
| ChordMini (ChordMiniApp) | The full app needs Firebase and Gemini keys (survey.md); not run. |
| QM Vamp plugins (Key Detector, Bar and Beat Tracker, Tempo and Beat Tracker) | Binaries come from the Vamp plugin download page or a source build of a cloned repository; neither is a package-manager route; not attempted. Not in Ubuntu 24.04 apt (`apt-cache search vamp`, re-checked by the verifier). The download page's link for them, https://code.soundsoftware.ac.uk/projects/qm-vamp-plugins/files, gave "Connection reset by peer" to the verifier's curl on 2026-11-10; after the Omnizart refusal above the verifier did not try a downloaded binary or a source build. |
| Guitar tuning classifier (Hulme et al., edhulme/guitar-tuning-classification) | Repository code with TensorFlow models on Google Drive (survey.md); not attempted (repository code). |
| BEAST | Evaluation script plus a Google Drive model (survey.md); not attempted. |
| realtime-bpm-analyzer, web-audio-beat-detector, essentia.js | Browser libraries; in-browser analysis belongs to the browser-audio-sync lane; not run here. |

## Media kept outside git

None. No tool run in this lane writes audio or video (allin1's sonification, which would, was not run). All outputs
are text, JSON, `.lab` and `.jams` files under `/home/user/gtr/lanes/chords-beats-key/out/`.

## Verification log (verify-trials-chords-beats-key, 2026-11-10)

Checked by an independent agent against the run ledger, the gtr-eval ledger, the saved outputs, re-runs and the sources.
The verifier's scripts and re-run plans are in `scripts/verify/` (`omnizart_install.sh` is the install that was refused
and never ran); its outputs and logs are under `/home/user/gtr/lanes/chords-beats-key/verify-trials/` (not in git). The
rebuilt venvs were deleted after the re-runs; their freezes are in `verify-trials/freezes/`.

What was checked, and the result:

- Run ledger: all 36 runs of this lane cited above (r0025 to r0398) exist in `/home/user/gtr/ledger/runs.jsonl` with exit
  code 0. Every wall-clock, CPU, peak-RSS, core and load figure quoted matches its ledger line; the per-clip times quoted
  from batch runs match `logs/batch*.jsonl` (copied to `samples/<tool>/batch*_timings.jsonl`) and the stage times match the
  `timings*.json` files. The two "Code from External" refusals (madmom git build, BTC run) and the 580 s / 400 s / 300 s
  shell timeouts are in the trial agent's session transcript. The time the slot holders had been running when the
  one-thread runs started was wrong in the text (corrected; see "What was changed").
- Scores: all 509 gtr-eval 0.11.1 scorings (e0208 to e1391) were re-run in-process with `--no-ledger` from their stored
  argv and working directory (run r0411, `scripts/verify/rerun_evals.py`): 509 of 509 results identical to the stored
  ones; every ledger exit code 0; every line of `out/scores/scores.jsonl` equals its ledger result; every estimate file is
  unchanged since it was scored (SHA-256); the 315 estimates passed as values (BPM, key, cents, A4 Hz) equal the values in
  the output files they were read from. `scripts/verify/check_columns.py` compared 1131 numbers in the score tables
  column by column with the eval results: 0 mismatches (a mutation test of the checker flagged every changed cell). Every
  eval id in a table row belongs to that row's clip and tool. The music21 table (110 results) and the DeepRhythm ratios
  match their evals. `samples/scores/scores_<tool>.jsonl` hold the newest line for each of the 509 keys.
- Independent recomputation with mir_eval 0.8.2 (`scripts/verify/independent_mir_eval.py`, own file readers and label
  conversion, no gtr-eval code): 17 values over the 12 tools (aubio S3 beat F; Chordino S3 root/majmin/sevenths; madmom
  S3 deep-chroma chords, S3 and S2n downbeat F; librosa S3 beat F and R1b key weight; Essentia S7flat30 TonalExtractor at
  440 Hz and 432.45 Hz; music21 S3 key weight; autochord and CREMA S3 chords; DeepRhythm R1b ratio; BeatNet S4 offline
  beat and downbeat F; Beat This! R1c beat and downbeat F; lv-chordia S3 and S7flat30 chords) all equal the stored values.
- Re-runs (venvs rebuilt offline from the saved freezes and the shared uv cache; `--nolock` and one thread because the
  CPU slots were queued; outputs in `verify-trials/reruns/`): aubio r0425 (13 clips), Chordino r0436 (S3, S7flat30, R1b),
  Essentia r0437 (S3, S7flat30, R1a, S7flat30 at 432.45 Hz), librosa r0438 (S3, S7flat30, R1b), music21 r0439 (11 clips),
  madmom r0442 (S3, S2n), DeepRhythm r0445 (S3, R1b), Beat This! r0446 (final0 S3 and S2n, small0 S3), lv-chordia r0449
  (S3, S7flat30), autochord and CREMA r0452 (S3, S7flat30), BeatNet r0455 (S3, S4). Every output file of every re-run is
  byte-identical to the trial's (39 aubio, 9 Chordino, 50 Essentia, 15 librosa, 132 music21, 14 madmom, 4 DeepRhythm,
  9 Beat This!, 8 lv-chordia, 2 autochord, 4 CREMA, 12 BeatNet files). The rebuilt venvs' freezes equal the saved ones,
  except venv-tf without jax 0.4.30 and jaxlib 0.4.30, which were no longer in the cache. Extra runs: r0468 (numba
  first-job test for librosa and Chordino) and r0474 (raw Chordino change lists on the 13 clips).
- Output and sample files: every file named in the sections exists; counts, label lists, excerpts, tempo and key values,
  timings and formats were recounted from the files (for example 491 Chordino segments, all starting on the 2048/22050 s
  grid; madmom R2full 275 beats and 67 bar starts; Beat This! downbeats a subset of the beats in 18 of 18 outputs, all on
  a 20 ms grid; BeatNet and lv-chordia excerpts; the R3 table). The lane's docs folder holds no file over 300 KB, no audio
  or video, no key or token; `out/` holds only `.txt`, `.json`, `.lab`, `.jams` and `.jsonl` files.
- "Not run here" reasons: the BTC and madmom-git refusals are in the transcript; `apt-cache search keyfinder` and
  `apt-cache search vamp` re-run (no libKeyFinder, no QM plugins, no sonic-annotator); PyPI JSON re-read for skey (0.2,
  no files), tempocnn (0.0.8, `tensorflow==2.17.0`, `<3.12,>=3.9`), omnizart (0.6.3 sdist only), allin1 (1.1.0); the
  shared uv cache holds no TensorFlow wheel other than tensorflow-cpu 2.12.1 (only metadata for `tensorflow` 2.14.0 to
  2.15.0); the allin1 README was re-read and its wording corrected here. Harmony Transformer, ACR_seq2seq, ChordMini,
  BEAST and the Hulme classifier rows rest on survey.md (checked by verify-docs-chords-beats-key), not re-checked here.
- Judging language: none found apart from "highest wins" in the librosa key-baseline description (reworded).

What was changed in this file:

- The note on the four one-thread runs (top of the file and DeepRhythm): it said the slot-holding jobs "had been running
  for 36 to 60 minutes" / "one for over 50 minutes". The two video-hands-fretboard jobs had queued since 21:12 and 21:31
  UTC but held the slots only from 22:01:23 and 22:01:24 UTC, 6 to 13 minutes before r0351 to r0398 started.
- Chordino: the end-of-file `N` lag is 0.28 to 0.36 s (was 0.37; r0474 measured 0.279 to 0.364 s); the 491 segments are
  244 default-mode plus 247 local-tuning ones; "one frame" now says one 2048-sample hop. Re-run note added.
- librosa: the UNVERIFIED cause of the slow first run replaced by the r0468 measurement (3.1 s with librosa's numba
  cache, 11.5 s without; Chordino 3.3 s and 17.9 s); key-baseline wording.
- Essentia: the TempoCNN metadata field is quoted as the dataset name ("trained on" removed); the S7flat30 at 440 Hz
  chord comparison with S3 is now written segment by segment (one `B` segment and one missing short `D` were hidden by
  "one semitone below S3's labels").
- autochord and CREMA: numba observation added to the first-job note; jax note on the rebuilt venv.
- DeepRhythm: the HTTP 403 was for the github.com URL under `weights/`, not the package's own URL, which was not
  requested; slot note corrected.
- BeatNet: the install used the PyPI wheel (no build in the log), so "PyPI sdist" became "PyPI, wheel and sdist both
  uploaded 2023-11-28" and the weights are described as in the installed package.
- Open-string section: onset times of Basic Pitch's four MIDI-38 notes against the truth added.
- "Not run here": allin1 README quoted exactly (it says "Download from NATTEN website" for Linux, not a build); Omnizart
  row records the verifier's refused install attempt; QM row records the unreachable download site; BTC row quotes
  the refusal message.
- A "Verifier re-run" line was added to each tool section.

Still UNVERIFIED after this check:

- The venv sizes quoted (225 MB, 628 MB, 677 MB, 1.9 GB, 885 MB) were measured by the trial agent before it deleted the
  venvs (a `du` listing in its transcript); the verifier's rebuilt venvs were measured in one combined `du` call, which
  counts shared hard links once, so they are not comparable.
- Whether the first Chordino install attempt (`timeout 580 gtr-run ...`, exit 124, no ledger line) was still waiting for
  a slot when it was stopped; the transcript shows only the timeout.
- Why the first job of autochord, CREMA, DeepRhythm, BeatNet and lv-chordia was the slowest (numba cache files were
  written in each rebuilt venv, but the time share was measured only for librosa and Chordino).
- The UNVERIFIED items in `for-aaron.md` (see its own log).

Verifier's runs: r0411, r0425, r0436, r0437, r0438, r0439, r0442, r0445, r0446, r0449, r0452, r0455, r0468, r0474.
