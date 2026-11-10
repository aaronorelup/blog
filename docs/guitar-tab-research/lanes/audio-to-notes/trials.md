# Lane audio-to-notes: trials

Agent: `try-audio-to-notes`, 2026-11-10 (UTC). Every tool below was installed and run on the shared box (4 vCPU Intel
Xeon 2.10 GHz, 15 GiB RAM, no GPU) unless the section says NOT RUN HERE. Inputs are the shared clips in
`/home/user/gtr/inputs/` (manifest: `docs/guitar-tab-research/inputs/INPUTS.md`).

How to read the numbers:

- **Timing.** Heavy work ran through `gtr-run`, which pins the job to one slot of 2 CPU cores and writes the exact
  command, input SHA-256, wall-clock, CPU time, peak memory and exit code to `/home/user/gtr/ledger/runs.jsonl`.
  Several tools were run in one `gtr-run` batch to cut the time spent queueing for a slot; inside a batch each tool
  ran under GNU `time` (wall, user CPU, system CPU, peak RSS per tool, in `logs/time-<tool>.txt`) and each script
  measured per-clip seconds with `time.perf_counter` (model loading excluded unless stated). So "on 2 cores" applies
  to every figure, and the run id given is the batch's. Other lanes' jobs ran on the other slot at the same time.
- **Scores** come from `gtr-eval` (scorer version and eval id `eNNNN` given with each number; the definitions are in
  `docs/guitar-tab-research/scripts/gtr-eval/README.md`). Notes: onset-only precision / recall / F1 with a 50 ms
  onset tolerance and 50 cents pitch tolerance (mir_eval.transcription), and the same with the offset condition
  (offset within max(20 % of the truth note's length, 50 ms)). f0: mir_eval.melody on a 10 ms grid against the truth
  melody voice: raw pitch accuracy (RPA, share of truth-voiced frames within 50 cents, the tool's voicing decision
  ignored), raw chroma accuracy (RCA, the same with octave errors forgiven), voicing recall, voicing false alarm and
  overall accuracy (these three depend on which frames the tool marks unvoiced). These are measurements on these
  clips, not a ranking.
- Lane scripts are in `scripts/` next to this file; small output samples in `samples/<tool>/`; full outputs in
  `/home/user/gtr/lanes/audio-to-notes/out/<tool>/` (MIDI for other lanes: `out/<tool>/.../<clip>.mid`).
- Clip ids used here beyond the manifest: `S4guitar` = `S4/stems/guitar.wav`, `S4lead` = `S4/stems/lead.wav`
  (scored against the S4 truth, voices `chord` and `melody`).

## The monophonic f0 trackers: shared facts

- Clips: S1 (single melody), S2n and S2s (two voices: to record what a monophonic tracker returns on polyphony), S4
  (band mix) and S4lead (the lead stem alone), R1b (real GuitarSet solo take), R2 and R3a (no truth: output kept).
  Input file: the clip's `<id>.mono.wav` ((L+R)/2, 44.1 kHz, 16-bit), S4lead the stereo stem read as mono.
- f0 scoring reference: the truth melody voice on a 10 ms grid (S4 and S4lead: the lead line; R1b: `--voice lead`).
  RPA and RCA ignore the tool's voicing decision; voicing recall, false alarm and overall accuracy use it (frames
  written as 0 Hz are unvoiced; for tools that write a pitch in every frame, the threshold used is stated).
- One batch, run **{{F0BATCH}}** (2 cores; inputs: the 8 files above with their SHA-256 in the ledger), ran SwiftF0,
  librosa pYIN, FCPE, PESTO, torchcrepe tiny and full, and the Essentia algorithms one after another
  (`scripts/batch_f0.sh`, `scripts/run_f0.py`, `scripts/run_essentia.py`). Per-tool wall / CPU / peak RSS below are
  from GNU time inside that batch.
- None of these packages turns frames into notes except SwiftF0 (`segment_notes`), aubio (`aubionotes`) and Essentia
  (`PitchContourSegmentation`). For the others an extra step is needed (group voiced frames into notes by pitch
  continuity, split at onsets or pitch jumps, drop short fragments); this lane did not add one.

## SwiftF0 0.3.0

- What: an ONNX f0 estimator (pitch and confidence every 256 samples at 16 kHz = 16 ms, range 46.875 to 2093.75 Hz)
  with its own note segmenter (`swift_f0.music.segment_notes`) and MIDI export. PyPI `swift-f0` 0.3.0 (uploaded
  2026-09-25); source https://github.com/lars76/swift-f0 (project URLs read from the PyPI JSON on 2026-11-10).
- Install (worked first time): `uv venv --python 3.12 venv-librosa && uv pip install librosa "swift-f0[full]"
  matplotlib mir_eval pretty_midi soundfile` -> swift-f0 0.3.0, onnxruntime 1.31.1, numpy 2.5.4, soxr 1.1.0,
  soundfile 0.14.0. The model is `swift_f0/model.onnx`, 135,090 bytes, inside the wheel (no separate download).
  The venv (shared with librosa 1.0.0) was 580 MB by `du`; it was deleted after the runs because of the shared-disk
  notice, its freeze is `samples/swiftf0/uv-pip-freeze-venv-librosa-py3.12.txt`.
- Run 1, defaults (`SwiftF0(threads=2).detect_file(path)`, then `segment_notes(result)` with pitch_hold_ms=80):
  batch {{F0BATCH}}; GNU time for the 8 clips: wall 4.39 s, user 5.02 s, sys 0.23 s, peak RSS 289 MB; per clip
  0.22 s (R3a, 18 s) to 0.80 s (S4lead, 38.7 s), model setup 0.12 s.
- Run 2, range limited to the guitar (`detect_file(path, fmin=82.4, fmax=1319.0)`), run **r0131** (`--nolock`:
  unpinned, ONNX Runtime with 2 threads; wall 4.64 s, CPU 5.3 s, peak RSS 281.6 MB), `scripts/run_swiftf0_range.py`.
- Output (f0): `<clip>.f0.csv` = `time_s,frequency_hz,confidence`; a frequency is written for every frame, also in
  silence (S1 at 0.000 s: 1454.563 Hz with confidence 0.0000); the tool's docstring: a frame is voiced when its
  confidence is at least 0.5, and frames whose audio peaks below 1e-3 get confidence 0. Scored with
  `--conf-threshold 0.5`. First voiced S1 rows: `1.6800,366.594,0.9582`, `1.6960,368.949,0.9873`.
- Output (notes): `Note(start, end, pitch_hz)` objects, where pitch_hz is the note's fitted pitch; written here as
  `onset_s,offset_s,pitch_midi,fitted_pitch_hz` (pitch_midi = nearest MIDI number). First S1 notes (truth starts
  with F#4 at 1.667 s and F#4 again at 2.083 s): `1.680-2.512 66 (369.994 Hz)`, `2.512-2.944 67 (391.769 Hz)`,
  `2.944-3.776 69`, `3.776-4.176 67`, `4.176-4.608 66`, `4.608-5.024 64`, `5.024-5.856 62`, `5.856-6.272 64`,
  `6.272-7.312 66`, `7.312-8.352 64`: repeated notes of the same pitch come out as one note (62 truth notes, 48
  estimated on S1).
- Note counts: S1 48, S2n 55, S2s 28, S4 8, S4lead 35, R1b 60, R2 47, R3a 33.

f0, default range (`--conf-threshold 0.5`):

| clip | RPA | RCA | voicing recall | voicing false alarm | overall accuracy | eval id |
|---|---|---|---|---|---|---|
| S1 | 0.961 | 0.961 | 1.000 | 0.253 | 0.935 | e0113 |
| S2n | 0.224 | 0.604 | 0.960 | 0.216 | 0.299 | e0114 |
| S2s | 0.214 | 0.560 | 0.558 | 0.115 | 0.271 | e0115 |
| S4 | 0.204 | 0.578 | 0.223 | 0.059 | 0.320 | e0117 |
| S4lead | 0.947 | 0.947 | 0.997 | 0.418 | 0.842 | e0118 |
| R1b | 0.853 | 0.863 | 0.937 | 0.213 | 0.809 | e0112 |

f0 with fmin 82.4 / fmax 1319 Hz (run r0131): S1, S2n and S4lead gave the same numbers as above (e0333, e0335,
e0341); S2s RPA 0.234 / RCA 0.583 (e0337); S4 RPA 0.227 / RCA 0.668 (e0339); R1b RPA 0.856 / RCA 0.866 (e0331).
The note lists from `segment_notes` had the same counts and the same note scores on all six scored clips
(e0343 to e0349).

Notes from `segment_notes` (default range), against all truth notes (S2n/S2s: melody and bass; S4: bass, guitar
chords and lead, drums left out):

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 48 | 0.958 | 0.742 | 0.836 | 0.582 | 0.022 | e0152 |
| S2n | 90 | 55 | 0.491 | 0.300 | 0.372 | 0.303 | 0.020 | e0153 |
| S2s | 90 | 28 | 0.321 | 0.100 | 0.153 | 0.085 | 0.016 | e0154 |
| S4 | 467 | 8 | 0.375 | 0.006 | 0.013 | 0.004 | 0.012 | e0155 |
| S4lead | 37 | 35 | 0.571 | 0.541 | 0.556 | 0.194 | 0.032 | e0156 |
| R1b | 70 | 60 | 0.833 | 0.714 | 0.769 | 0.662 | 0.009 | e0151 |

Against the melody voice only: S2n F1 0.186 (e0323), S2s F1 0.114 (e0326), S4 F1 0.000 (e0329).

- Input facts: `detect_file` reads with soundfile (WAV here; stereo is averaged), `detect(audio, sample_rate)`
  resamples to 16 kHz with soxr.
- Constraint inputs: `fmin`, `fmax` (clamped to the model's 46.875 to 2093.75 Hz); `segment_notes(pitch_hold_ms=)`.
  No tuning, key, tempo or instrument input.
- Samples: `samples/swiftf0/` (S1 f0 and notes, R1b notes, timings, scores; `guitar-range/` for run r0131).

## librosa 1.0.0 `librosa.pyin`

- What: probabilistic YIN in librosa, frame-wise f0 with a voiced flag and a voiced probability. PyPI `librosa`
  1.0.0 (uploaded 2026-08-11, `requires_python >=3.12`), https://github.com/librosa/librosa.
- Install: same venv as SwiftF0 (Python 3.12; on Python 3.10 and 3.11 uv resolved librosa 0.11.0 instead, in this
  lane's Basic Pitch and torch venvs). Freeze: `samples/pyin/uv-pip-freeze-venv-librosa-py3.12.txt`.
- Run: `y, sr = librosa.load(<mono wav>, sr=22050, mono=True)`; `f0, voiced_flag, voiced_prob = librosa.pyin(y,
  sr=22050, fmin=65.406 (C2), fmax=2093.005 (C7), frame_length=2048, hop_length=512)`; times from
  `librosa.times_like`. Hop 512 samples = 23.2 ms. Written: frequency 0 where `voiced_flag` is false, confidence =
  `voiced_prob`. Batch {{F0BATCH}}; GNU time: wall 31.75 s, user 20.54 s, sys 0.76 s, peak RSS 497 MB for the 8
  clips; S1 (the first clip in the process) took 13.18 s, the other clips 1.39 to 3.46 s.
- Output: per frame f0 in Hz (NaN when unvoiced), boolean voiced flag, voiced probability 0 to 1. First voiced S1
  frames: `1.6486,369.994,0.0101`, `1.6718,369.994,0.0477`, `1.6951,369.994,0.1765`.
- No note segmenter in librosa. (The pYIN Vamp plugin's note output is a separate program: see "pYIN Vamp plugin"
  below.)
- Constraint inputs (signature in `librosa/core/pitch.py` at tag 1.0.0, read 2026-11-10): `fmin`, `fmax`
  (keyword-only, required), `sr`, `frame_length`, `hop_length`, `n_thresholds`, `beta_parameters`,
  `boltzmann_parameter`, `resolution` (0.1 semitone), `max_transition_rate` (35.92 octaves per second),
  `switch_prob`, `no_trough_prob`, `fill_na`, `center`, `pad_mode`, `transition_min_prob`.

| clip | RPA | RCA | voicing recall | voicing false alarm | overall accuracy | eval id |
|---|---|---|---|---|---|---|
| S1 | 0.958 | 0.958 | 0.990 | 0.525 | 0.900 | e0121 |
| S2n | 0.046 | 0.432 | 0.754 | 0.337 | 0.131 | e0122 |
| S2s | 0.172 | 0.558 | 0.833 | 0.405 | 0.231 | e0123 |
| S4 | 0.000 | 0.344 | 0.838 | 0.532 | 0.132 | e0126 |
| S4lead | 0.960 | 0.960 | 0.995 | 0.574 | 0.810 | e0128 |
| R1b | 0.851 | 0.851 | 0.951 | 0.511 | 0.714 | e0120 |

## FCPE (torchfcpe 0.0.4)

- What: "Fast Context-based Pitch Estimation", a PyTorch f0 model with a bundled checkpoint. PyPI `torchfcpe` 0.0.4
  (uploaded 2024-03-06, MIT in the PyPI classifiers), https://github.com/CNChTu/FCPE.
- Install: `uv venv --python 3.11 venv-torchf0 && uv pip install torch torchaudio torchcrepe torchfcpe pesto-pitch
  matplotlib soundfile pretty_midi` (with `UV_TORCH_BACKEND=cpu`) -> torch 2.15.0+cpu, torchaudio 2.11.1+cpu,
  torchfcpe 0.0.4, einops 0.8.2, local-attention 1.11.2. Weights: `torchfcpe/assets/fcpe_c_v001.pt`, 43,363,260
  bytes, inside the wheel. Package directory 42 MB; the whole torch venv 1.4 GB by `du` (torch is 747 MB of it).
- Run: `spawn_bundled_infer_model(device="cpu").infer(x, sr=16000, decoder_mode="local_argmax", threshold=0.006,
  f0_min=80, f0_max=880, interp_uv=False)` on audio resampled to 16 kHz with torchaudio (the settings of the README
  example, https://raw.githubusercontent.com/CNChTu/FCPE/main/README.md, read 2026-11-10). Hop 10 ms.
  Batch {{F0BATCH}}; GNU time: wall 32.57 s, user 21.00 s, sys 2.05 s, peak RSS 652 MB; model setup 9.13 s, per
  clip 1.58 s (R3a) to 4.16 s (S2n).
- Output: a tensor (batch, frames, 1) of f0 in Hz, 0 where the model's voiced/unvoiced mask is set
  (`retur_uv=True` would also return the mask); no confidence. Written as `time_s,frequency_hz`.
- Constraint inputs: `f0_min`, `f0_max` (the docstring says "Use in post-processing"), `threshold`, `decoder_mode`.

| clip | RPA | RCA | voicing recall | voicing false alarm | overall accuracy | eval id |
|---|---|---|---|---|---|---|
| S1 | 0.990 | 0.990 | 1.000 | 0.319 | 0.953 | e0132 |
| S2n | 0.278 | 0.604 | 1.000 | 0.248 | 0.344 | e0134 |
| S2s | 0.539 | 0.737 | 1.000 | 0.474 | 0.537 | e0136 |
| S4 | 0.234 | 0.532 | 0.998 | 0.620 | 0.275 | e0138 |
| S4lead | 0.965 | 0.965 | 1.000 | 0.464 | 0.844 | e0140 |
| R1b | 0.890 | 0.890 | 0.992 | 0.493 | 0.745 | e0130 |

## PESTO (pesto-pitch 2.0.1)

- What: a small self-supervised pitch estimator (Sony CSL Paris). PyPI `pesto-pitch` 2.0.1 (uploaded 2025-02-18;
  classifier "GNU Lesser General Public License v3 (LGPLv3)"), https://github.com/SonyCSLParis/pesto.
- Install: in the same torch venv; dependencies torch, torchaudio, omegaconf 2.4.0, scipy. Weights inside the
  package: `pesto/weights/mir-1k_g7.ckpt` (534,664 bytes, the default `model_name`) and `mir-1k.ckpt` (123,538
  bytes). Package directory 840 KB.
- Run: `pesto.predict(torch.from_numpy(y), 44100, step_size=10.0)` (defaults: model "mir-1k_g7", reduction "alwa")
  on the 44.1 kHz mono file. Batch {{F0BATCH}}; GNU time: wall 49.59 s, user 37.58 s, sys 8.45 s, peak RSS 1,069
  MB; setup 4.38 s, per clip 2.23 s (R3a) to 7.40 s (S4lead).
- Output: `timesteps` (ms), `pitch` (Hz), `confidence`, `activations`; a pitch on every frame (S1 at 0.000 s: 343.484
  Hz with confidence 0.1009), no voiced/unvoiced decision. Its command line (`python -m pesto my_file.wav`, per the
  README at https://raw.githubusercontent.com/SonyCSLParis/pesto/master/README.md, read 2026-11-10) writes a CSV
  `time,frequency,confidence` by default and, with `-e`, an `.npz` ("Timesteps, pitch, confidence, and
  activations") or a `.png`. Scored without a confidence threshold, so voicing recall and false alarm are 1.000 by
  construction; RPA and RCA are the figures that do not depend on a threshold.
- Constraint inputs: `step_size`, `model_name`, `reduction`, `num_chunks`; no range or tuning input.

| clip | RPA | RCA | voicing recall | voicing false alarm | overall accuracy | eval id |
|---|---|---|---|---|---|---|
| S1 | 0.987 | 0.990 | 1.000 | 1.000 | 0.868 | e0146 |
| S2n | 0.607 | 0.819 | 1.000 | 1.000 | 0.522 | e0147 |
| S2s | 0.617 | 0.804 | 1.000 | 1.000 | 0.531 | e0148 |
| S4 | 0.157 | 0.580 | 1.000 | 1.000 | 0.113 | e0149 |
| S4lead | 0.972 | 0.972 | 1.000 | 1.000 | 0.697 | e0150 |
| R1b | 0.877 | 0.878 | 1.000 | 1.000 | 0.545 | e0143 |

## aubio 0.4.9 (`aubiopitch`, `aubionotes`)

- What: the C library's command-line tools, from the Ubuntu package `aubio-tools` 0.4.9-4.4build1 already on the
  box (with `libaubio5` and `python3-aubio` 0.4.9). The `aubio` Python entry point (`/usr/bin/aubio`) printed a
  traceback when called with `--version`; the two C programs worked.
- Runs: `aubiopitch -i <wav>` and `aubionotes -i <wav>`, defaults (help text: pitch method yinfft, tolerance 0.3,
  silence -90 dB; aubionotes onset method hfc, threshold 0.3, minimum inter-onset interval 0.012 s, release drop 10
  dB). Run **r0130** (`gtr-run --nolock`: unpinned, single-threaded; wall 4.23 s, CPU 2.9 s, peak RSS 35.2 MB for
  8 clips, both tools); per clip 0.14 to 0.30 s for aubiopitch, 0.19 to 0.42 s for aubionotes.
  `scripts/run_aubio.py`.
- Output (aubiopitch): text lines `time_s pitch_hz`, one per hop of 256 samples (5.805 ms at 44.1 kHz); 0 Hz where
  the frame is below the silence threshold; no confidence column. 5140 frames for S1.
- Output (aubionotes): text lines `midi_pitch onset_s offset_s` (pitch as a float such as `66.000000`), plus lines
  with a single time value (S1: `1.718277` before the first note and `29.837643` at the end; other clips have more
  of them). Only 3-field lines were taken as notes.
- Input facts: reads WAV via its own reader at the file's rate (`-r 0` default).
- Constraint inputs: `-p` pitch method, `-l` tolerance, `-s` silence, `-B`/`-H` buffer and hop, `-r` sample
  rate, `-u` unit; aubionotes also `-O` onset method, `-t` onset threshold, `-M` min inter-onset interval, `-d`
  release drop. No range, tuning or key input.

f0 (all frames above 0 Hz counted as voiced):

| clip | RPA | RCA | voicing recall | voicing false alarm | overall accuracy | eval id |
|---|---|---|---|---|---|---|
| S1 | 0.957 | 0.958 | 1.000 | 0.164 | 0.942 | e0293 |
| S2n | 0.491 | 0.734 | 1.000 | 0.201 | 0.534 | e0295 |
| S2s | 0.594 | 0.828 | 1.000 | 0.469 | 0.585 | e0297 |
| S4 | 0.080 | 0.527 | 1.000 | 0.654 | 0.155 | e0299 |
| S4lead | 0.924 | 0.926 | 0.999 | 0.311 | 0.858 | e0301 |
| R1b | 0.869 | 0.880 | 0.996 | 0.663 | 0.668 | e0292 |

Notes from `aubionotes`, default 50 ms onset tolerance, against all truth notes:

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 62 | 0.048 | 0.048 | 0.048 | 0.048 | 0.049 | e0305 |
| S2n | 90 | 43 | 0.000 | 0.000 | 0.000 | 0.000 | - | e0308 |
| S2s | 90 | 42 | 0.000 | 0.000 | 0.000 | 0.000 | - | e0310 |
| S4 | 467 | 80 | 0.287 | 0.049 | 0.084 | 0.044 | 0.043 | e0312 |
| S4lead | 37 | 36 | 0.028 | 0.027 | 0.027 | 0.000 | 0.050 | e0314 |
| R1b | 70 | 169 | 0.308 | 0.743 | 0.435 | 0.251 | 0.042 | e0303 |

The same files with a 100 ms onset tolerance (`--onset-tol 0.1`): the aubionotes onsets come a median 56 ms after
the truth onsets on S1 (all 61 matched pairs between 50 and 63 ms late, e0350), which the 50 ms window does not
accept:

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 62 | 0.984 | 0.984 | 0.984 | 0.274 | 0.056 | e0352 |
| S2n | 90 | 43 | 0.884 | 0.422 | 0.571 | 0.406 | 0.056 | e0353 |
| S2s | 90 | 42 | 0.952 | 0.444 | 0.606 | 0.470 | 0.058 | e0354 |
| S4 | 467 | 80 | 0.375 | 0.064 | 0.110 | 0.044 | 0.044 | e0355 |
| S4lead | 37 | 36 | 0.389 | 0.378 | 0.384 | 0.192 | 0.058 | e0356 |
| R1b | 70 | 169 | 0.325 | 0.786 | 0.460 | 0.268 | 0.041 | e0351 |

Against the melody voice only, 100 ms tolerance: S2n F1 0.706 (e0357), S2s F1 0.905 (e0358), S4 F1 0.000 (e0359).
Samples: `samples/aubio/` (S1 f0 and notes, raw S1 aubionotes output, R1b notes, timings, all score files).

