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
- All scores of this lane are in `samples/scores/scores.jsonl` (one line per scoring run, with the eval id), produced
  by `scripts/score_all.py`; `scripts/summarize_scores.py` prints the tables below from that file.
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

