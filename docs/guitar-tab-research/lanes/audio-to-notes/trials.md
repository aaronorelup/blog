# Lane audio-to-notes: trials

Agent: `try-audio-to-notes`, 2026-11-10 (UTC). Every tool below was installed and run on the shared box (4 vCPU Intel
Xeon 2.10 GHz, 15 GiB RAM, no GPU) unless the section says NOT RUN HERE. Inputs are the shared clips in
`/home/user/gtr/inputs/` (manifest: `docs/guitar-tab-research/inputs/INPUTS.md`).

How to read the numbers:

- **Timing.** Heavy work ran through `gtr-run`, which pins the job to one slot of 2 CPU cores and writes the exact
  command, input SHA-256, wall-clock, CPU time, peak memory and exit code to `/home/user/gtr/ledger/runs.jsonl`.
  Several tools were run in one `gtr-run` batch to cut the time spent queueing for a slot; inside a batch each tool
  ran under GNU `time` (wall, user CPU, system CPU, peak RSS per tool; copies in `samples/_timing/time-<tool>.txt`)
  and each script measured per-clip seconds with `time.perf_counter` (audio reading included, model loading
  excluded unless stated). Figures from a slot run are "on 2 cores", and the run id given is the batch's. Some small
  runs used `gtr-run --nolock` (logged, but no slot and no pinning, so other jobs shared the CPU); they are marked
  `--nolock` where they appear. Other lanes' jobs ran on the other slot, and unpinned jobs anywhere, at the same
  time, so wall-clock figures carry that load.
- **Scores** come from `gtr-eval` (gtr-eval 0.11.1 for every eval id in this file; the eval id `eNNNN` is given with each number; the definitions are in
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
- Every venv was deleted after its tool's runs (the shared-disk notice); each one's `uv pip freeze` is saved in the
  tool's `samples/` folder, so the installs can be rebuilt with the commands given.

## Summary: what ran here, and what each tool writes

| tool (version) | ran here | runs | output (fields, units) |
|---|---|---|---|
| Spotify Basic Pitch (0.4.0) | yes, TFLite and ONNX backends, Python API and CLI | r0234, r0243, r0249, r0264, r0319, r0349 | MIDI (one track, pitch bends), note-events CSV `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend...`, `.npz` posteriors |
| SwiftF0 (0.3.0) | yes | r0321, r0131 | f0 every 16 ms (Hz, confidence); notes from `segment_notes` (start, end, fitted Hz) |
| librosa `pyin` (librosa 1.0.0) | yes | r0321 | f0 every 23.2 ms (Hz or NaN), voiced flag, voiced probability; no notes |
| FCPE (torchfcpe 0.0.4) | yes | r0321 | f0 every 10 ms (Hz, 0 = unvoiced); no confidence, no notes |
| PESTO (pesto-pitch 2.0.1) | yes | r0321 | f0 every 10 ms (Hz), voicing confidence; no notes |
| torchcrepe (0.0.24), tiny and full | yes | r0321, r0287 | f0 every 10 ms (Hz), periodicity; no notes |
| aubio (0.4.9 CLI) | yes | r0130 | `aubiopitch`: time, Hz per 5.8 ms hop; `aubionotes`: MIDI pitch, onset, offset |
| Essentia (2.1b6.dev1389): Melodia + PitchContourSegmentation, PitchYinProbabilistic, PitchCREPE tiny/full, MultiPitchKlapuri, MultiPitchMelodia | yes | r0321, r0341, r0345, r0346 | f0 per 2.9 ms (Melodia) / 5.8 ms / 10 ms; notes (onset, duration, MIDI) from PitchContourSegmentation; multi-pitch lists per 2.9 ms frame |
| Transkun (2.0.1), piano-trained | yes | r0216 | MIDI (program 0, velocities, CC64 sustain pedal; CC67 soft pedal in the R1a, R1b, R1c files) |
| ByteDance piano transcription (0.0.6), piano-trained | yes, S2n and R1c only | r0401 | MIDI (program 0, velocities, CC64 pedal) |
| RMVPE through `rmvpe-onnx` (0.2.3, ONNX Runtime), gap round 1 | yes | r0516, r0517 | f0 every 10 ms (Hz), confidence 0 to 1, 360-bin activation; no notes |
| Onsets and Frames, Magenta MAESTRO checkpoint (`magenta` 2.1.4), piano-trained, gap round 1 | yes, S1, S2n, R1c, S4 guitar stem | r0545 | MIDI (program 0, velocities, no pedal, no pitch bends) |
| CREPE Notes (`crepe-notes` 0.2.0, with madmom 0.17.dev0), gap round 2 | yes, `--f0` from torchcrepe on S1, R1b, S4lead | r0616 | MIDI (program 0, velocities, tempo 120); estimated tuning offset printed |

Not run here (reasons and evidence under "Tools not run here", steps in `for-aaron.md`): CREPE (TensorFlow
package), MELODIA Vamp plugin, pYIN Vamp plugin, Timbre-Trap, MT3, YourMT3+, MR-MT3,
hFT-Transformer, Omnizart, NeuralNote, Sheet Sage, MuScriptor, PENN, CREPE Notes and the other survey additions
listed there. (corrected in gap round 2: CREPE Notes ran, item A3 under "Gap round 2".) (corrected in gap round 1: RMVPE and Onsets and Frames ran, see "Gap round 1", and the round's verifier
took them out of this list; CREPE, MT3 with its PyTorch port mt3-pytorch, MR-MT3, YourMT3+ on the box's CPU and
Omnizart still did not run, and their entries now give the reason as it is after that round: the session's permission
system for code from cloned repositories or local folders (MR-MT3 and YourMT3+ were not attempted after its refusals),
github.com answering 403, and a source build that failed.)

## The monophonic f0 trackers: shared facts

- Clips: S1 (single melody), S2n and S2s (two voices: to record what a monophonic tracker returns on polyphony), S4
  (band mix) and S4lead (the lead stem alone), R1b (real GuitarSet solo take), R2 and R3a (no truth: output kept).
  Input file: the clip's `<id>.mono.wav` ((L+R)/2, 44.1 kHz, 16-bit), S4lead the stereo stem read as mono.
- f0 scoring reference: the truth melody voice on a 10 ms grid (S4 and S4lead: the lead line; R1b: `--voice lead`).
  RPA and RCA ignore the tool's voicing decision; voicing recall, false alarm and overall accuracy use it (frames
  written as 0 Hz are unvoiced; for tools that write a pitch in every frame, the threshold used is stated).
- One batch, run **r0321** (2 cores; inputs: the 8 files above with their SHA-256 in the ledger; whole batch: wall
  2,694.58 s, CPU 2,001.4 s, peak RSS 1,947.2 MB, exit 0, 42.1 s waiting for a slot), ran SwiftF0,
  librosa pYIN, FCPE, PESTO, torchcrepe tiny and full, and the Essentia algorithms one after another
  (`scripts/batch_f0.sh`, `scripts/run_f0.py`, `scripts/run_essentia.py`). Per-tool wall / CPU / peak RSS below are
  from GNU time inside that batch (peak RSS in MiB = GNU time's KiB / 1024, the unit gtr-run's "MB" also uses).
- Picture of what six of them return on two-voice S2n (frames as written, SwiftF0 at confidence >= 0.5, torchcrepe
  full at periodicity >= 0.21), drawn over the truth melody and bass: `samples/f0-compare/S2n-f0-tracks.png`
  (`scripts/plot_f0_s2n.py`).
- None of these packages turns frames into notes except SwiftF0 (`segment_notes`), aubio (`aubionotes`) and Essentia
  (`PitchContourSegmentation`). For the others an extra step is needed (group voiced frames into notes by pitch
  continuity, split at onsets or pitch jumps, drop short fragments). One such step was tested: Essentia's
  `PitchContourSegmentation` fed with the FCPE, PESTO, torchcrepe and Essentia CREPE contours (section "Handoff test
  inside the lane", after the Essentia section).

### Which voice the monophonic trackers follow on two-voice S2n and S2s

RPA against the truth melody voice (from the tool tables below) and against the truth bass voice (`gtr-eval f0
--voice bass`, same outputs; RPA ignores voicing, so no threshold matters):

| tool | S2n melody RPA | S2n bass RPA (eval id) | S2s melody RPA | S2s bass RPA (eval id) |
|---|---|---|---|---|
| SwiftF0 | 0.224 | 0.695 (e1297) | 0.214 | 0.536 (e1298) |
| librosa pyin | 0.046 | 0.502 (e1299) | 0.172 | 0.348 (e1300) |
| FCPE | 0.278 | 0.636 (e1301) | 0.539 | 0.297 (e1302) |
| PESTO | 0.607 | 0.380 (e1303) | 0.617 | 0.231 (e1304) |
| torchcrepe tiny (viterbi) | 0.069 | 0.016 (e1305) | 0.063 | 0.022 (e1306) |
| torchcrepe full (viterbi) | 0.142 | 0.123 (e1307) | 0.357 | 0.081 (e1308) |
| Essentia Melodia | 0.629 | 0.000 (e1309) | 0.796 | 0.000 (e1310) |
| Essentia CREPE tiny | 0.507 | 0.450 (e1311) | 0.477 | 0.312 (e1312) |
| aubio (aubiopitch) | 0.491 | 0.392 (e1313) | 0.594 | 0.321 (e1314) |

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
  batch r0321; GNU time for the 8 clips: wall 4.39 s, user 5.02 s, sys 0.23 s, peak RSS 282 MiB; per clip
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
  `6.272-7.312 66`, `7.312-8.352 64`: the two F#4 notes at the start came out as one note (1.680-2.512 s); S1 has 62
  truth notes and 48 estimated ones.
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
- Samples: `samples/swiftf0/` (S1 f0 and notes, R1b notes, timings, scores, `S1-notes-pianoroll.png`; `guitar-range/`
  for run r0131).

## librosa 1.0.0 `librosa.pyin`

- What: probabilistic YIN in librosa, frame-wise f0 with a voiced flag and a voiced probability. PyPI `librosa`
  1.0.0 (uploaded 2026-08-11, `requires_python >=3.12`), https://github.com/librosa/librosa.
- Install: same venv as SwiftF0 (Python 3.12; on Python 3.10 and 3.11 uv resolved librosa 0.11.0 instead, in this
  lane's Basic Pitch and torch venvs). Freeze: `samples/pyin/uv-pip-freeze-venv-librosa-py3.12.txt`.
- Run: `y, sr = librosa.load(<mono wav>, sr=22050, mono=True)`; `f0, voiced_flag, voiced_prob = librosa.pyin(y,
  sr=22050, fmin=65.406 (C2), fmax=2093.005 (C7), frame_length=2048, hop_length=512)`; times from
  `librosa.times_like`. Hop 512 samples = 23.2 ms. Written: frequency 0 where `voiced_flag` is false, confidence =
  `voiced_prob`. Batch r0321; GNU time: wall 31.75 s, user 20.54 s, sys 0.76 s, peak RSS 485 MiB for the 8
  clips; S1 (the first clip in the process) took 13.18 s, the other clips 1.39 to 3.46 s.
- Output: per frame f0 in Hz (NaN when unvoiced), boolean voiced flag, voiced probability 0 to 1. First voiced S1
  frames: `1.6486,369.994,0.0101`, `1.6718,369.994,0.0477`, `1.6951,369.994,0.1765`.
- No note segmenter in librosa. (The pYIN Vamp plugin's note output is a separate program: see "pYIN Vamp plugin"
  below.)
- Constraint inputs (signature in `librosa/core/pitch.py` at tag 1.0.0, read 2026-11-10): `fmin`, `fmax`
  (keyword-only, required), `sr`, `frame_length`, `hop_length`, `n_thresholds`, `beta_parameters`,
  `boltzmann_parameter`, `resolution` (default 0.1), `max_transition_rate` (default 35.92, "maximum pitch
  transition rate in octaves per second"),
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
  Batch r0321; GNU time: wall 32.57 s, user 21.00 s, sys 2.05 s, peak RSS 636 MiB; model setup 9.13 s, per
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
  bytes). Package directory 840 KB by `du` after first use (740 KB without the `__pycache__` written on import).
- Run: `pesto.predict(torch.from_numpy(y), 44100, step_size=10.0)` (defaults: model "mir-1k_g7", reduction "alwa")
  on the 44.1 kHz mono file. Batch r0321; GNU time: wall 49.59 s, user 37.58 s, sys 8.45 s, peak RSS 1,044
  MiB; setup 4.38 s, per clip 2.23 s (R3a) to 7.40 s (S4lead).
- Output: `timesteps` (ms: frame index times the hop in milliseconds), `pitch` (Hz with the default
  `convert_to_freq=True`, otherwise semitones), `confidence` (docstring: "confidence of whether frame is voiced or
  unvoiced in [0, 1]"), `activations`; a pitch on every frame (S1 at 0.000 s: 343.484 Hz with confidence 0.1009), no
  voiced/unvoiced decision and no threshold value in the docstring or README. Its command line (`python -m pesto my_file.wav`, per the
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
- Output (aubiopitch): text lines `time_s pitch_hz`, one per hop of 256 samples (5.805 ms at 44.1 kHz); 0 Hz in
  silent frames (S1's silent count-in reads `0.000000`); no confidence column. 5140 frames for S1.
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

The same files with a 100 ms onset tolerance (`--onset-tol 0.1`): on S1 the 61 matched aubionotes onsets come a
median 56.2 ms after the truth onsets (mean 56.1 ms, 95th percentile 60.8 ms, largest 62.8 ms; e0350), so most fall
outside the default 50 ms window:

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 62 | 0.984 | 0.984 | 0.984 | 0.274 | 0.056 | e0352 |
| S2n | 90 | 43 | 0.884 | 0.422 | 0.571 | 0.406 | 0.056 | e0353 |
| S2s | 90 | 42 | 0.952 | 0.444 | 0.606 | 0.470 | 0.058 | e0354 |
| S4 | 467 | 80 | 0.375 | 0.064 | 0.110 | 0.044 | 0.044 | e0355 |
| S4lead | 37 | 36 | 0.389 | 0.378 | 0.384 | 0.192 | 0.058 | e0356 |
| R1b | 70 | 169 | 0.325 | 0.786 | 0.460 | 0.268 | 0.041 | e0351 |

Against the melody voice only, 100 ms tolerance: S2n F1 0.706 (e0357), S2s F1 0.905 (e0358), S4 F1 0.000 (e0359).
Samples: `samples/aubio/` (S1 f0 and notes, raw S1 aubionotes output, R1b notes, timings, all score files,
`S1-notes-pianoroll.png` for the first 12 s).

## Transkun 2.0.1 (piano-trained, run on guitar)

- What: a piano transcription model (its bundled config names the module `transkun.ModelTransformer`; the package
  has a `CRF` module) that writes MIDI with note onsets, offsets, velocities and sustain pedal. **The bundled weights were trained on piano recordings**; here they were run
  on guitar. PyPI `transkun` 2.0.1 (uploaded 2024-09-28; MIT classifier), https://github.com/Yujia-Yan/Skipping-The-Frame-Level
  (homepage in the PyPI metadata).
- Install (worked first time): `uv venv --python 3.11 venv-piano && uv pip install torch torchaudio
  piano_transcription_inference transkun soundfile "setuptools<81"` -> transkun 2.0.1, torch 2.15.0+cpu, ncls,
  pydub, soxr, moduleconf, tensorboard, seaborn and others (freeze: `samples/transkun/uv-pip-freeze-venv-piano-py3.11.txt`).
  Weights: `transkun/pretrained/2.0.pt` (56,408,978 bytes) and `2.0.conf`, inside the wheel. Package directory 55 MB.
- Run: the package's CLI, `transkun <clip>.wav <clip>.mid --device cpu`, defaults (model config: fs 44100,
  segmentSizeInSecond 16, segmentHopSizeInSecond 8, hopSize 1024, n_mels 229, f_min 30, f_max 8000), one subprocess
  per clip (so the model is loaded for every clip), driven by `scripts/run_piano.py`. Clips S1, S2n, S3, R1a, R1b,
  R1c (stereo `<id>.wav`; R1 files are mono). Batch run **r0216** (2 cores; the batch also held the failed first
  ByteDance attempt, 34.5 s); GNU time for Transkun: wall 814.45 s, user 374.29 s, sys 108.10 s, peak RSS 1,490
  MiB. Per clip (subprocess, model load included): S1 83.7 s, S2n 144.2 s, S3 123.6 s, R1a 172.5 s, R1b 157.4 s,
  R1c 132.8 s.
- Input facts: audio read with pydub (`AudioSegment.from_file`, 16-bit scaling by 2**15), resampled with soxr to
  44.1 kHz when the file differs; WAV mono and stereo both accepted.
- Output: a MIDI file (960 ticks per quarter, tempo 120), one instrument, program 0 (Acoustic Grand Piano), note-on
  and note-off with velocity, sustain pedal as CC64 events (24 in S2n.mid), no pitch bends; the R1a, R1b and R1c
  files also hold CC67 (soft pedal) events, and R1b.mid has 2 CC67 events and no CC64 (counted by the verifier with
  pretty_midi). First notes of S2n (start, end, pitch, velocity): `2.144-2.194 55 97`, `2.145-2.659 43 85`, `2.146-3.773 67 89`,
  `2.679-3.218 55 98`, `2.680-3.216 50 81`, `3.215-3.751 43 72`, `3.217-3.681 62 89`, `3.752-4.284 50 85`,
  `3.753-3.794 62 86`, `4.289-4.865 64 99`. Note counts: S1 63, S2n 99, S3 171, R1a 134, R1b 52, R1c 119.
- Constraint inputs: `--weight`, `--conf`, `--device`, `--segmentHopSize`, `--segmentSize`. No pitch range, tuning,
  instrument or tempo input.

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 63 | 0.984 | 1.000 | 0.992 | 0.592 | 0.004 | e0437 |
| S2n | 90 | 99 | 0.889 | 0.978 | 0.931 | 0.741 | 0.002 | e0438 |
| S3 | 182 | 171 | 0.977 | 0.918 | 0.946 | 0.096 | -0.002 | e0439 |
| R1a | 189 | 134 | 0.836 | 0.593 | 0.693 | 0.260 | -0.013 | e0434 |
| R1b | 70 | 52 | 0.942 | 0.700 | 0.803 | 0.279 | -0.015 | e0435 |
| R1c | 148 | 119 | 0.933 | 0.750 | 0.831 | 0.390 | -0.019 | e0436 |

Recall by truth voice on S2n: bass 48/48, melody 40/42 (e0438). (MIDI estimates scored as written: all notes of the
file, pitch bends ignored by gtr-eval.) Pictures:
`samples/transkun/S2n-pianoroll.png`, `samples/transkun/R1c-pianoroll.png`. MIDI for other lanes:
`/home/user/gtr/lanes/audio-to-notes/out/transkun/<clip>.mid`.

## ByteDance piano transcription (`piano_transcription_inference` 0.0.6, piano-trained, run on guitar)

- What: the inference package for ByteDance's piano transcription model (repository
  `qiuqiangkong/piano_transcription_inference`, per the docs lane): notes with onsets, offsets and velocities, plus
  sustain pedal. **The weights were trained on piano**; here they were run on guitar. PyPI
  `piano-transcription-inference` 0.0.6 (uploaded 2025-01-26, MIT classifier). Weights:
  `CRNN_note_F1=0.9677_pedal_F1=0.9186.pth` from Zenodo record 4034264 (the URL is in the package's
  `inference.py`), 171,966,578 bytes, sha256 c3fa9730...07876141, downloaded with curl (the package itself would call
  `wget`); the docs lane quotes the weights' license.
- Install: in the same venv as Transkun (Python 3.11, torch 2.15.0+cpu, librosa 0.11.0, torchlibrosa 0.1.0; freeze
  `samples/bytedance/uv-pip-freeze-venv-piano-py3.11.txt`). Package directory 148 KB by `du` after first use (72 KB
  without the `__pycache__` written on import).
- Dead end: the package's own `load_audio()` fails with librosa 0.11: "AttributeError: No librosa.core attribute
  audio" (it calls `librosa.core.audio.util.buf_to_float`; reproduced by the verifier in run r0475). That stopped the
  first attempt (inside run r0216, 34.5 s, exit 1). `scripts/run_piano.py` now reads the audio with `librosa.load(path, sr=16000, mono=True)` and passes
  it to `PianoTranscription(model_type="Note_pedal", device="cpu", checkpoint_path=...).transcribe(audio, out.mid)`.
- Run: run **r0401**, `--nolock` (unpinned, torch set to 2 threads), S2n and R1c only: wall 159.3 s, CPU 151.2 s,
  peak RSS 998.8 MB; model setup 8.6 s; S2n 75.8 s, R1c 73.7 s. Why `--nolock`: the slot job queued for it
  (`scripts/batch2.sh`, its empty log `logs/batch2.log` created at 21:29 UTC) had not got a slot when this ran at
  22:18:47. From the ledger (each run's start plus wall time): cores 0-1 were held by other lanes' jobs without a break
  from 21:35:52 (r0274, r0316, r0331, r0337, r0408); cores 2-3 by this lane's own f0 batch r0321 until 21:52:44, then
  by other lanes' jobs (r0336 from 21:52:45, r0448 from 22:01:24 to 22:42:21).
- Output: MIDI (384 ticks per quarter, tempo 120), one instrument, program 0, note-on/off with velocity, sustain
  pedal as CC64 events (18 in S2n.mid; the package also reports 9 pedal events for S2n and 0 for R1c), no pitch
  bends. First S2n notes (start, end, pitch, velocity): `2.154-2.669 55 96`, `2.154-2.680 67 91`,
  `2.154-2.703 43 82`, `2.682-3.229 50 94`, `2.682-3.780 55 93`, `2.685-3.228 67 87`, `3.215-3.764 62 93`,
  `3.216-3.767 43 77`, `3.751-4.296 50 98`, `4.288-4.833 48 93`. 87 notes on each clip.
- Constraint inputs: `model_type`, `checkpoint_path`, `device`; none for pitch range, tuning or instrument.

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S2n | 90 | 87 | 0.908 | 0.878 | 0.893 | 0.836 | 0.002 | e1393 |
| R1c | 148 | 87 | 0.724 | 0.426 | 0.536 | 0.213 | -0.019 | e1392 |

Recall by voice on S2n: bass 48/48, melody 31/42 (e1393). Picture: `samples/bytedance/S2n-pianoroll.png`. MIDI:
`/home/user/gtr/lanes/audio-to-notes/out/bytedance/<clip>.mid`.

## Spotify Basic Pitch 0.4.0

- What: Spotify's small polyphonic note transcriber (model "ICASSP 2022", instrument-agnostic), audio in, MIDI / note
  events / raw model outputs out. PyPI `basic-pitch` 0.4.0 (uploaded 2024-08-16), https://github.com/spotify/basic-pitch;
  the package header reads "Copyright 2022 Spotify AB" and "Licensed under the Apache License, Version 2.0"
  (`basic_pitch/__init__.py`, read 2026-11-10).
- Which backend, on which Python (from the PyPI `requires_dist`, read 2026-11-10): `tensorflow<2.15.1,>=2.4.1` for
  Python >= 3.11 on Linux/Windows; `tflite-runtime` for Linux with Python < 3.11; `onnxruntime` for Windows with
  Python < 3.11; `coremltools` on macOS; extras `[onnx]`, `[coreml]`, `[tf]`. PyPI classifiers list Python 3.8 to
  3.11. The package picks "the first library available in [tensorflow, coreml, tensorflow-lite, onnx]" (CLI help)
  unless `--model-serialization` names one. The wheel ships all four forms of the model in
  `basic_pitch/saved_models/icassp_2022/`: `nmp/` (TF SavedModel), `nmp.mlpackage` (CoreML), `nmp.tflite`
  (204,448 bytes), `nmp.onnx` (230,444 bytes). Package directory 2.3 MB.
- Install that worked (Python 3.10): `uv venv --python 3.10 venv-basicpitch && uv pip install "basic-pitch[onnx]==0.4.0"
  matplotlib "setuptools<81" "numpy<2"` -> tflite-runtime 2.14.0, onnxruntime 1.23.2, librosa 0.11.0, numpy 1.26.4,
  scipy 1.15.3, resampy, pretty-midi, mir-eval (freeze: `samples/basic-pitch/uv-pip-freeze-venv-basicpitch-py3.10.txt`).
  Venv 603 MB by `du` (onnxruntime 49 MB, tflite_runtime 6.6 MB).
  Dead ends on the way, in order: (1) without setuptools the CLI stops at import: resampy imports `pkg_resources`
  ("ModuleNotFoundError: No module named 'pkg_resources'"; reproduced by the verifier in run r0476, raised from
  `resampy/filters.py`); setuptools 80.10.2 (`<81`) fixes it, with a
  deprecation warning that pkg_resources "is slated for removal as early as 2025-11-30". (2) uv resolved numpy 2.2.6,
  and tflite-runtime 2.14.0 then fails to load the model ("AttributeError: _ARRAY_API not found", then "ValueError:
  File .../nmp.tflite cannot be loaded into either TensorFlow, CoreML, TFLite or ONNX"); `numpy<2` (1.26.4) fixes
  it. The CLI runs r0032, r0033, r0035, r0037, r0038, r0039, r0040 and r0065 (`scripts/run_basic_pitch_cli.sh`, each
  with `--model-serialization tflite`; exit code 1, wall 2.96 to 4.47 s) are failures on the way: the saved logs of
  r0033 to r0065 (`out/basic-pitch/cli-tflite-default/<clip>/stdout.log`) end with dead end (2), "AttributeError:
  _ARRAY_API not found" then the ValueError above; r0032's log (S1) was overwritten by the later successful CLI run in
  r0234, so its error text is not on file. The TensorFlow backend (Python >= 3.11) was not installed: the `tensorflow` 2.15.0 cp311 Linux
  wheel is 475,258,658 bytes (PyPI), over the 200 MB per-install limit of the shared-disk notice. A resolution-only
  check (`uv pip install --dry-run "basic-pitch==0.4.0"` into empty venvs, Linux x86_64, uv 0.11.32): Python 3.11
  "Would install 65 packages" including `tensorflow==2.14.0`; Python 3.12 and 3.13: "No solution found when
  resolving dependencies", followed by uv's list of the `tensorflow` versions it considered.
- Runs (all in run **r0234**, 2 cores, `scripts/batch_basic_pitch.sh`, `scripts/run_basic_pitch_py.py`; GNU time per
  configuration):
  1. `basic_pitch.inference.predict(path, Model(nmp.tflite))` with the defaults (onset_threshold 0.5,
     frame_threshold 0.3, minimum_note_length 127.70 ms, no frequency limits, multiple_pitch_bends False,
     melodia_trick True) on all 16 clip files: wall 62.37 s, user 52.76 s, sys 2.27 s, peak RSS 393 MiB. Per clip
     (`predict()` only): S1 20.36 s (first call in the process), the others 0.87 s (R3a, 18 s) to 3.71 s (S4,
     38.7 s); model load 0.005 s.
  2. The same with `minimum_frequency=82.4, maximum_frequency=1319.0` (E2 to about E6, the guitar's range): wall
     44.01 s, user 37.32 s, sys 1.28 s, peak RSS 289 MiB.
  3. The same as 1 with `Model(nmp.onnx)` (ONNX Runtime 1.23.2): wall 88.12 s, user 40.19 s, sys 0.68 s, peak RSS
     315 MiB; per clip 2.72 to 6.50 s.
  4. The CLI, `basic-pitch --save-midi --save-model-outputs --save-note-events <outdir> S1.wav` (no
     `--model-serialization`; with TensorFlow and CoreML absent it loaded the TFLite file): wall 6.67 s, user 3.69 s,
     peak RSS 266 MiB. Its note list is identical to run 1's S1 list (64 notes).
  5. The CLI on the video file `R3a.mp4` (H.264 + AAC) directly: accepted; its log shows "PySoundFile failed.
     Trying audioread instead." and a librosa FutureWarning about the audioread loader; wall 6.56 s; 108 notes against 105 from `R3a.wav`, 96 (onset, pitch) pairs identical. (This step was added to the
     batch script after the batch was queued, so `R3a.mp4` is not among the run's `--input` hashes; its SHA-256 is
     in the inputs manifest.)
- ONNX against TFLite: the model outputs differ by at most 0.00014 (S1), 0.00026 (S4), 0.00056 (R2) (largest
  absolute difference over the note, onset and contour arrays); 13 of the 16 note lists are identical, S3 differs in
  4 notes (velocity by 1, or one offset by one frame), S6taps in 1 note (velocity), S7flat30 in 1 note (offset);
  the scores of those three are the same to 3 decimals (e0586, e0589, e0592).
- Output files (CLI names): `<stem>_basic_pitch.mid`, `<stem>_basic_pitch.csv`, `<stem>_basic_pitch.npz`
  (`--sonify-midi` adds a WAV).
  - MIDI: one instrument, program 4 (0-based General MIDI number), 220 ticks per quarter, tempo 120 (`--midi-tempo`),
    note-on/off with velocity, pitch-bend events (S1: 496, R1b: 1385, S4lead: 614, most synthesized clips 12 to
    13); `--multiple-pitch-bends` puts each pitch on its own instrument instead.
  - Note-events CSV: header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`; times in seconds, integer
    MIDI pitch, velocity 0 to 127 (`round(127 * amplitude)`), then a variable number of pitch-bend values on the
    same row (one per contour frame, in contour bins of 1/3 semitone, e.g. `1,1,1,...,-5,-5`). Rows are not in time
    order (the S1 file starts with the note at 27.509 s).
  - Model outputs (`.npz` / `predict()`'s first return value): `note` (frames x 88) and `onset` (frames x 88)
    posteriors for A0 to C8, `contour` (frames x 264, 3 bins per semitone); about 86 frames per second (22050 Hz /
    256 hop); S1 gives 2565 frames. The CLI's `S1_basic_pitch.npz` is 4,515,067 bytes; the lane's own copy of the
    same arrays (`np.savez_compressed`, `tflite-default/S1.model_output.npz`) is 3,721,808 bytes.
  - First S2n notes from the MIDI (start, end, pitch, velocity; ordered by start, then end): `0.000-0.150 24 49` (inside the silent count-in
    bar), `2.150-2.684 55 93`, `2.161-2.927 43 71`, `2.684-3.218 50 98`, `2.684-3.218 55 98`, `2.695-2.927 83 39`,
    `3.218-3.391 67 43`, `3.218-3.450 50 64`, `3.218-3.716 55 54`, `3.218-3.764 62 71`.
  - Note counts (defaults): S1 64, S2n 137, S2s 199, S3 197, S4 461, S4guitar 386, S4lead 39, S5capo2 139,
    S5dropd 130, S6taps 196, S7flat30 112, R1a 196, R1b 76, R1c 156, R2 334, R3a 105.
- Input facts: audio is loaded with `librosa.load(path, sr=22050, mono=True)` (`basic_pitch/inference.py`); WAV
  (mono and stereo, 16-bit) and an MP4 video file were accepted.
- Constraint inputs (CLI flags / `predict()` arguments): `--onset-threshold`, `--frame-threshold`,
  `--minimum-note-length` (ms), `--minimum-frequency` / `--maximum-frequency` (Hz), `--multiple-pitch-bends`,
  `--no-melodia` (melodia_trick), `--midi-tempo`, `--model-serialization`. No tuning, capo, key or instrument input.

Notes, defaults (TFLite), note-events CSV scored against all non-drum truth notes (S4guitar against the S4 `chord`
voice, S4lead against `melody`):

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 64 | 0.953 | 0.984 | 0.968 | 0.667 | 0.010 | e0490 |
| S2n | 90 | 137 | 0.657 | 1.000 | 0.793 | 0.537 | 0.008 | e0493 |
| S2s | 90 | 199 | 0.452 | 1.000 | 0.623 | 0.401 | 0.008 | e0495 |
| S3 | 182 | 197 | 0.761 | 0.824 | 0.792 | 0.633 | 0.009 | e0497 |
| S4 | 467 | 461 | 0.636 | 0.627 | 0.631 | 0.375 | 0.008 | e0499 |
| S4guitar | 369 | 386 | 0.782 | 0.818 | 0.800 | 0.604 | 0.008 | e0502 |
| S4lead | 37 | 39 | 0.692 | 0.730 | 0.711 | 0.184 | 0.029 | e0505 |
| S5capo2 | 90 | 139 | 0.647 | 1.000 | 0.786 | 0.568 | 0.008 | e0507 |
| S5dropd | 90 | 130 | 0.692 | 1.000 | 0.818 | 0.536 | 0.008 | e0510 |
| S6taps | 90 | 196 | 0.459 | 1.000 | 0.629 | 0.385 | 0.009 | e0512 |
| S7flat30 | 182 | 112 | 0.741 | 0.456 | 0.565 | 0.265 | 0.008 | e0514 |
| R1a | 189 | 196 | 0.699 | 0.725 | 0.712 | 0.499 | 0.002 | e0486 |
| R1b | 70 | 76 | 0.750 | 0.814 | 0.781 | 0.671 | -0.004 | e0488 |
| R1c | 148 | 156 | 0.769 | 0.811 | 0.789 | 0.500 | -0.008 | e0489 |

Recall by truth voice (defaults): S2n melody 42/42 and bass 48/48 (e0493); S4 melody 24/37, chord 243/369, bass
26/61 (e0499). S7flat30 (the S3 notes 30 cents flat) gave 112 notes against S3's 197.

With the range limited to 82.4 to 1319 Hz (run 2): S4 bass recall 26/61 -> 11/61 and S4 note count 461 -> 418
(e0535; 35 of the 61 S4 bass notes lie below E2, lowest MIDI 31); S5dropd bass recall 48/48 -> 44/48 (e0544; the four D2 notes, 73.4 Hz,
lie below the limit); S1, R1a and R1b gave the same scores (e0524, e0516, e0519). Note counts, default -> limited:
S2n, S2s, S3, S4lead, S5capo2, S7flat30 and R1c one fewer each, S6taps 196 -> 194, S4guitar 386 -> 390, R2 (no
truth) 334 -> 268, R3a unchanged at 105 (all scores in `samples/basic-pitch/guitar-range/scores_notes.json`).

Pictures: `samples/basic-pitch/S2n-pianoroll.png`, `S4-pianoroll.png`, `R1c-pianoroll.png`. MIDI for other lanes:
`/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/<clip>.mid` (links to `tflite-default/<clip>.mid`; also
`tflite-guitar-range/`, `onnx-default/`). R3b and R3c (the real fingerstyle videos added to the inputs between 20:52
and 21:35 UTC per the inputs manifest, no truth) were run the same way in run **r0264** (`--nolock`): 129 and 87 notes, in `tflite-default-R3bc/`.

A constraint re-run for a Drop D guitar: S5dropd with `minimum_frequency=73.4` (D2) and `maximum_frequency=1319.0`,
run **r0349** (`--nolock`, `scripts/run_basic_pitch_py.py`; the venv was rebuilt from the uv cache for this run, same
package versions): 129 notes, onset-only P 0.698, R 1.000, F1 0.822, bass 48/48 and melody 42/42 matched (e1335);
with the 82.4 Hz floor the bass had 44/48 (e0544), with no limits 48/48 (e0510).

### Tuning-correction re-run test (S7flat30)

S7flat30 is S3 rendered 30 cents flat. Basic Pitch found 112 notes on it against 197 on S3 (above). As a stand-in
for a user telling the app "the guitar is 30 cents flat", the audio was shifted up 30 cents before transcription:
`sox S7flat30.wav S7flat30.plus30c.wav pitch 30` (SoX 14.4.2; output 24.000 s, 44.1 kHz, 2 channels, 16-bit,
sha256 31f6f3a9...42c42eef; kept at `/home/user/gtr/lanes/audio-to-notes/inputs/S7flat30.plus30c.wav`, derived from
the shared clip S7flat30, whose license and attribution are in the inputs manifest). Basic Pitch 0.4.0, TFLite,
defaults, run **r0319** (`--nolock`; `predict()` 3.65 s): 265 notes; against the S7flat30 truth (nominal pitches),
onset-only P 0.525, R 0.764, F1 0.622, onset+offset F1 0.376 (e1203). For comparison: S7flat30 as is P 0.741 R 0.456
F1 0.565 (e0514); S3 (in tune) P 0.761 R 0.824 F1 0.792 (e0497). Basic Pitch itself has no tuning input; the shift
was done outside it.

### Handoff test: Basic Pitch on the source-separation lane's stems

Input: the stems that lane's run **r0021** (`demucs -n htdemucs_6s -d cpu` on S4.wav, demucs 4.1.0) and **r0054**
(the same on S6taps.wav) wrote to `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/<clip>/` (44.1 kHz stereo
WAV, one file per stem: bass, drums, guitar, other, piano, vocals). Basic Pitch 0.4.0, TFLite, defaults, run
**r0243** (`--nolock`, unpinned; per-file `predict()` 4.8 to 8.1 s). For comparison the true stems from the inputs
set (the S4 bass stem in run **r0249**, also `--nolock`). Each file scored against the one truth voice it should
contain (`--voice`), onset-only, 50 ms / 50 cents:

| part (truth voice, notes) | from the S4 mix | from the true stem | from the htdemucs_6s stem |
|---|---|---|---|
| strummed guitar (`chord`, 369) | P 0.540 R 0.675 F1 0.600 (461 est., e0682) | P 0.782 R 0.818 F1 0.800 (386, e0502) | `guitar.wav`: P 0.681 R 0.631 F1 0.655 (342, e0652) |
| lead line, Voice Oohs (`melody`, 37) | P 0.052 R 0.649 F1 0.096 (461, e0664) | P 0.692 R 0.730 F1 0.711 (39, e0505) | `vocals.wav`: P 0.151 R 0.297 F1 0.200 (73, e0654) |
| electric bass (`bass`, 61) | P 0.082 R 0.623 F1 0.146 (461, e0662) | P 0.375 R 0.885 F1 0.527 (144, e0679) | `bass.wav`: P 0.324 R 0.754 F1 0.453 (142, e0657) |

S6taps (fingerstyle plus GM percussion "taps"), all 90 guitar notes: from the mix F1 0.629 (196 est., e0512); from
the htdemucs_6s `guitar.wav` stem P 0.427 R 0.456 F1 0.441 (96 est., e0660); for reference S2s, the same notes
without the taps, F1 0.623 (e0495). Outputs: `/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/handoff-htdemucs6s/`.

## torchcrepe 0.0.24 (CREPE in PyTorch), models `tiny` and `full`

- What: a PyTorch port of the CREPE pitch tracker with the CREPE weights converted (`torchcrepe/assets/full.pth`
  88,991,291 bytes and `tiny.pth` 1,962,363 bytes, inside the wheel). PyPI `torchcrepe` 0.0.24 (uploaded
  2025-05-16; MIT classifier), https://github.com/maxrmorrison/torchcrepe.
- Install: in the torch venv (see FCPE); package directory 87 MB. Freeze:
  `samples/torchcrepe-tiny/uv-pip-freeze-venv-torchf0-py3.11.txt`.
- Run: audio resampled to 16 kHz with torchaudio, then `torchcrepe.predict(x, 16000, hop_length=160, fmin=50.0,
  fmax=2006.0, model=<tiny|full>, return_periodicity=True, batch_size=512, device="cpu")` (decoder: the default,
  `torchcrepe.decode.viterbi`); hop 10 ms. Batch r0321. GNU time, 8 clips: `tiny` wall 160.58 s, user 106.15
  s, sys 10.60 s, peak RSS 833 MiB, per clip 5.9 s (R3a) to 39.7 s (S1); `full` wall 1,786.71 s, user 1,279.82 s,
  sys 107.35 s, peak RSS 1,947 MiB, per clip 116.2 s (S2n) to 354.5 s (S4lead).
- Output: pitch in Hz for every frame (S1 at 0.000 s with `full`: 1993.125 Hz, periodicity 0.0023) and a periodicity
  0 to 1 (the probability at the decoded bin). The README's thresholding advice
  (https://raw.githubusercontent.com/maxrmorrison/torchcrepe/master/README.md, read 2026-11-10): "The filter and
  threshold parameters should be tuned to your data. For clean speech, a 10-20 millisecond window with a threshold of
  0.21 has worked." Scored here with `--conf-threshold 0.21` on the raw periodicity (no median filter).
- Constraint inputs: `fmin`, `fmax`, `model`, `decoder` (`viterbi`, `weighted_argmax`, `argmax`), `hop_length`,
  `pad`, `batch_size`; threshold helpers `torchcrepe.threshold.At`, `Hysteresis`, `Silence`, filters
  `torchcrepe.filter.median`, `mean`.

| clip | tiny RPA | tiny RCA | tiny overall acc. | eval id | full RPA | full RCA | full overall acc. | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 0.982 | 0.982 | 0.923 | e0747 | 0.986 | 0.986 | 0.925 | e0758 |
| S2n | 0.069 | 0.231 | 0.147 | e0749 | 0.142 | 0.311 | 0.211 | e0760 |
| S2s | 0.063 | 0.225 | 0.140 | e0750 | 0.357 | 0.484 | 0.378 | e0763 |
| S4 | 0.000 | 0.153 | 0.282 | e0752 | 0.000 | 0.201 | 0.247 | e0765 |
| S4lead | 0.940 | 0.940 | 0.796 | e0754 | 0.941 | 0.941 | 0.797 | e0769 |
| R1b | 0.444 | 0.456 | 0.589 | e0745 | 0.478 | 0.483 | 0.601 | e0756 |

(Voicing recall / false alarm at 0.21 are in `samples/torchcrepe-*/scores_f0.json`.)

- Oddity, measured: with the default Viterbi decoder, many truth-voiced frames came out at 1500 Hz or above with
  periodicity 0.0 (median over those frames): R1b `tiny` 890 of 1823 frames, `full` 838; S2n `tiny` 2307 of 2529,
  `full` 1803; S1 none (`scripts/diag_torchcrepe_high_frames.py`, output `samples/torchcrepe-tiny/diag_high_frames.txt`).
  A follow-up run **r0287** (`--nolock`, 2 threads, `scripts/run_torchcrepe_decoders.py`) ran
  `tiny` on R1b and S2n with each decoder and nothing else changed; scored without a threshold:

| decoder | R1b RPA | R1b RCA | eval id | S2n RPA | S2n RCA | eval id | frames >= 1500 Hz (R1b / S2n, of 2934 / 2936) |
|---|---|---|---|---|---|---|---|
| viterbi (default) | 0.442 | 0.454 | e0969 | 0.069 | 0.231 | e0972 | 1657 / 2560 |
| weighted_argmax | 0.848 | 0.852 | e0975 | 0.505 | 0.682 | e0978 | 10 / 200 |
| argmax | 0.848 | 0.851 | e0980 | 0.506 | 0.683 | e0982 | 10 / 200 |

  Seconds per clip in r0287: R1b 32.2 (viterbi), 27.3 (weighted_argmax), 21.4 (argmax); S2n 18.4, 18.5, 17.4.

  Run-to-run variation, measured by the verifier: torchcrepe adds random noise to every decoded pitch
  (`torchcrepe/convert.py`, `bins_to_cents()`: "Trade quantization error for noise", `dither()` draws from
  `scipy.stats.triang` over plus or minus `CENTS_PER_BIN`). The verifier's re-run of r0287 on R1b (run r0464, same
  script and settings, pinned to 2 cores) gave the same periodicity in every frame, a different frequency in 2,934 of
  2,934 frames (viterbi; median 8.1 cents, largest 34.9 cents apart), the same counts of frames at or above 1500 Hz
  (1657 / 10 / 10), and RPA 0.451 (viterbi, e1405), 0.851 (weighted_argmax, e1406), 0.845 (argmax, e1407) against
  0.442 / 0.848 / 0.848 above. A torchcrepe score in this file can therefore differ in the second or third decimal
  when the same run is repeated.

## Essentia 2.1b6.dev1389 (essentia-tensorflow wheel): PredominantPitchMelodia + PitchContourSegmentation, PitchYinProbabilistic, PitchCREPE

- What: the MTG Essentia C++ library's Python bindings. `essentia-tensorflow` 2.1b6.dev1389 is the newest release on
  PyPI (2026-11-10) with Linux x86_64 wheels for CPython 3.9 to 3.13; the newer 2.1b6.dev1438 (uploaded 2026-05-19)
  has a cp314 wheel only. `essentia.__version__` prints `2.1-beta6-dev`. https://github.com/MTG/essentia.
- Install: `uv venv --python 3.11 venv-essentia && uv pip install essentia-tensorflow soundfile` (the wheel was
  already in the shared uv cache from another lane); dependencies numpy, pyyaml, six. Venv 677 MB by `du`. Freeze:
  `samples/essentia-melodia/uv-pip-freeze-venv-essentia-py3.11.txt`. TensorFlow inside the wheel logs that
  `libcuda.so.1` is missing and runs on the CPU.
- CREPE models for `PitchCREPE`, from https://essentia.upf.edu/models/pitch/crepe/ : `crepe-full-1.pb` 88,995,142
  bytes (sha256 47de170e...4b7c92) and `crepe-tiny-1.pb` 1,966,085 bytes (sha256 f97ee054...6b873175), with their
  JSON metadata (`crepe-full-1.json`: "outputs a sigmoid with 360 dimensions corresponding to pitch values ranging
  from C1 (32.70Hz) to B7(1975.5Hz) divided with 20-cent steps", training data "RWC-synth, MDB-stem-synth",
  `release_date` 10/08/2021, input frames of 1024 samples at 16 kHz).
- Runs (all in batch r0321, `scripts/run_essentia.py`; audio via `MonoLoader(sampleRate=44100)`, or 16000 for
  CREPE):
  1. `melodia`: `EqualLoudness` -> `PredominantPitchMelodia()` defaults (frameSize 2048, hopSize 128 = 2.9 ms,
     minFrequency 80, maxFrequency 20000, guessUnvoiced false, voicing via pitch 0) -> f0 + `pitchConfidence`; then
     `PitchContourSegmentation(hopSize=128)` defaults (minDuration 0.1 s, pitchDistanceThreshold 60 cents,
     rmsThreshold -2 (a z-score), tuningFrequency 440 Hz) on (pitch, audio) -> notes (onset, duration, MIDI pitch). GNU time: wall
     38.90 s, user 12.72 s, peak RSS 250 MiB; per clip 1.8 to 5.8 s.
  2. `PitchYinProbabilistic()` defaults (frameSize 2048, hopSize 256, outputUnvoiced "negative", written as 0 Hz):
     wall 11.31 s, user 4.10 s, peak RSS 255 MiB.
  3. `PitchCREPE(graphFilename=crepe-tiny-1.pb, hopSize=10)`: wall 124.72 s, user 55.67 s, peak RSS 367 MiB; per
     clip 9.9 to 19.1 s.
  4. `PitchCREPE(graphFilename=crepe-full-1.pb, hopSize=10)` on S1, S4lead and R1b only (the script limits it to
     these three to save slot time): wall 453.93 s, user 316.95 s, sys 11.36 s, peak RSS 599 MiB; S1 168.8 s,
     S4lead 168.8 s, R1b 112.7 s. RPA / RCA: S1 0.990 / 0.990 (e1205), S4lead 0.968 / 0.968 (e1206), R1b 0.879 /
     0.880 (e1204), no threshold.
- Output facts: Melodia gives one pitch per 128-sample frame (Hz, 0 = unvoiced) and a confidence; S1 first voiced
  frame `1.6747,365.749,0.1026`. `PitchContourSegmentation` gives three arrays: onset (s), duration (s), MIDI note
  number (integer); first S1 notes `1.675-2.499 66`, `2.505-2.914 67`, `2.923-3.756 69`, `3.762-4.168 67`,
  `4.174-4.592 66`, `5.004-5.428 62`, `5.434-5.831 62`, `5.837-6.258 64`, `7.303-7.976 64`, `8.342-9.175 66`.
  PitchCREPE returns time (s), frequency (Hz), confidence and the 360-bin activation matrix, a pitch on every frame
  (S1 at 0.000 s: 679.279 Hz, confidence 0.0690 with `crepe-tiny-1.pb`; 647.243 Hz, 0.1034 with `crepe-full-1.pb`);
  scored without a threshold.
- Constraint inputs: Melodia `minFrequency`, `maxFrequency`, `voicingTolerance`, `guessUnvoiced`, `binResolution`,
  `referenceFrequency`; `PitchContourSegmentation` `tuningFrequency` (a tuning input, an integer in Hz, documented
  as "tuning reference frequency [Hz]"), `minDuration`, `pitchDistanceThreshold`; `Audio2Midi` (not run) has `transpositionAmount` and `tuningFrequency` in {432, 440}.

f0:

| clip | Melodia RPA | RCA | voicing recall | voicing FA | eval id | CREPE-tiny RPA | RCA | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 0.693 | 0.693 | 0.706 | 0.081 | e0997 | 0.982 | 0.983 | e1027 |
| S2n | 0.629 | 0.629 | 0.645 | 0.029 | e1000 | 0.507 | 0.683 | e1028 |
| S2s | 0.796 | 0.796 | 0.945 | 0.079 | e1003 | 0.477 | 0.671 | e1030 |
| S4 | 0.123 | 0.424 | 0.677 | 0.248 | e1005 | 0.156 | 0.598 | e1032 |
| S4lead | 0.558 | 0.558 | 0.601 | 0.142 | e1008 | 0.965 | 0.965 | e1034 |
| R1b | 0.723 | 0.733 | 0.864 | 0.610 | e0994 | 0.851 | 0.855 | e1025 |

Melodia writes 0 Hz on frames it judges unvoiced, and RPA counts those truth-voiced frames as misses, so its RPA is
bounded by its voicing recall.

Notes from `PitchContourSegmentation` (all truth notes; S2n/S2s/S4 also against the melody voice):

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 37 | 1.000 | 0.597 | 0.747 | 0.566 | 0.009 | e1038 |
| S2n | 90 | 32 | 0.969 | 0.344 | 0.508 | 0.082 | 0.011 | e1040 |
| S2n, melody voice | 42 | 32 | 0.969 | 0.738 | 0.838 | 0.135 | 0.011 | e1048 |
| S2s | 90 | 33 | 0.697 | 0.256 | 0.374 | 0.130 | 0.014 | e1042 |
| S2s, melody voice | 42 | 33 | 0.697 | 0.548 | 0.613 | 0.213 | 0.014 | e1050 |
| S4 | 467 | 58 | 0.483 | 0.060 | 0.107 | 0.027 | 0.021 | e1044 |
| S4, melody voice | 37 | 58 | 0.034 | 0.054 | 0.042 | 0.021 | 0.029 | e1052 |
| S4lead | 37 | 29 | 0.759 | 0.595 | 0.667 | 0.515 | 0.019 | e1046 |
| R1b | 70 | 106 | 0.453 | 0.686 | 0.545 | 0.455 | -0.010 | e1036 |

`PitchYinProbabilistic` (defaults) gave RPA 0.495 on S1 (e1014), 0.000 on S2n (e1016), 0.017 on S2s (e1018),
0.000 on S4 (e1021), 0.772 on S4lead (e1023), 0.023 on R1b (e1011). Its output frequencies sit on an
equal-tempered grid and do not match the input: on S1 the first voiced frames read 138.591 Hz where the truth is
F#4 (369.994 Hz). A pure-sine check (`scripts/check_essentia_pyin_sines.py`, 1 s at 44.1 kHz, defaults, output in
`samples/essentia-pyin/essentia-pyin-sines.txt`) gave median outputs of 103.826 Hz for a 110 Hz sine, 138.591 for
220, 146.832 for 369.99 and 293.665 for 440, while Essentia's plain `PitchYin` on the same signals read 109.89,
219.79, 369.64 and 439.59 Hz. Why was not established (a parameter this lane did not set, or the algorithm in this
build): UNVERIFIED. (corrected in gap round 2, item A6 under "Gap round 2": setting sampleRate, frameSize, hopSize,
lowRMSThreshold and outputUnvoiced explicitly gives the same outputs, run r0647; the grid comes from the algorithm's
pitch candidates, which its frame-level stage returns as whole MIDI numbers (`hz2midi` returns an `int` in Essentia's
source); why the chosen values lie below the sines' pitch is still UNVERIFIED.)

The verifier's re-run of the same step (run r0430, venv rebuilt offline from the saved freeze, same script, same
input files) reproduced the sine-check numbers exactly but not the clip outputs byte for byte: same frame counts,
different frequencies in 31 of 5,133 frames on S1 (for example 1.6951 s: 138.591 Hz in r0321, 146.832 Hz in r0430,
same confidence 0.9310), 19 of 5,051 on S2n, 4 of 5,047 on R1b, 0 of 6,667 on S4lead. Scored again: S1 RPA 0.494
(e1402; r0321's output 0.495, e1014), S2n 0.000 (e1403), R1b 0.023 (e1404). Every other Essentia output re-run by
the verifier (Melodia and its notes on 8 clips in r0429, MultiPitchKlapuri and MultiPitchMelodia on S2n in r0431,
PitchCREPE tiny on S1 in r0464) was byte-identical.

### Handoff test inside the lane: other trackers' f0 into Essentia's `PitchContourSegmentation`

The f0 CSVs of FCPE, PESTO, torchcrepe full (frames with periodicity below 0.21 set to 0 Hz) and Essentia CREPE tiny
(all 10 ms grids) were passed with the clip's mono audio to `PitchContourSegmentation(hopSize=441,
sampleRate=44100)` (441 samples = 10 ms; other parameters default), `scripts/run_contour_segmentation.py`, run
**r0341** (`--nolock`; 0.003 to 0.007 s of segmentation per clip). A first attempt, run r0338, stopped with
"ValueError: cannot convert float NaN to integer": for some segments the algorithm returned a NaN MIDI pitch (FCPE
on R1b: 7 notes, torchcrepe full on R1b: 5 notes); the rerun drops those notes and counts them. PESTO and Essentia
CREPE contours were passed with every frame voiced (neither tool marks unvoiced frames). Notes, onset-only:

| contour from | S1 P / R / F1 (est.) | eval id | S4lead P / R / F1 (est.) | eval id | R1b P / R / F1 (est.) | eval id |
|---|---|---|---|---|---|---|
| FCPE | 1.000 / 0.774 / 0.873 (48) | e1319 | 0.771 / 0.730 / 0.750 (35) | e1320 | 0.644 / 0.800 / 0.713 (87) | e1318 |
| PESTO | 0.758 / 0.758 / 0.758 (62) | e1322 | 0.780 / 0.865 / 0.821 (41) | e1323 | 0.254 / 0.614 / 0.360 (169) | e1321 |
| torchcrepe full, periodicity >= 0.21 | 0.979 / 0.758 / 0.855 (48) | e1325 | 0.829 / 0.784 / 0.806 (35) | e1326 | 0.711 / 0.386 / 0.500 (38) | e1324 |
| Essentia CREPE tiny | 0.662 / 0.694 / 0.677 (65) | e1329 | 0.705 / 0.838 / 0.765 (44) | e1330 | 0.265 / 0.629 / 0.373 (166) | e1327 |
| (Melodia, its own contour, above) | 1.000 / 0.597 / 0.747 (37) | e1038 | 0.759 / 0.595 / 0.667 (29) | e1046 | 0.453 / 0.686 / 0.545 (106) | e1036 |

Outputs: `/home/user/gtr/lanes/audio-to-notes/out/contour-segmentation/<tool>/<clip>.notes.csv`.

### Essentia multi-pitch: `MultiPitchKlapuri` and `MultiPitchMelodia`, and a frame-level comparison

- Runs: `EqualLoudness` -> `MultiPitchKlapuri()` or `MultiPitchMelodia()` with defaults (frameSize 2048, hopSize 128
  = 2.9 ms; Klapuri's defaults include minFrequency 80, maxFrequency 1760, numberHarmonics 10), on S2n, S2s, S3,
  S4guitar, R1a, R1c (`.mono.wav`; the S4 guitar stem read as mono). Run **r0345** for Klapuri (wall 51.38 s, CPU
  39.4 s, peak RSS 247.5 MB; per clip 6.8 to 12.0 s) and **r0346** for MultiPitchMelodia (wall 11.42 s, CPU 8.9 s,
  peak RSS 254.7 MB; per clip 1.1 to 2.9 s), both `--nolock` (single-threaded C++; moved out of the queued batch
  of PENN and ByteDance). `scripts/run_essentia.py`.
- Output: one list of frequencies (Hz) per 128-sample frame, no confidences, no notes; written here as JSON
  `{"times": [...], "freqs_hz": [[...], ...]}`. Klapuri returned at most 2 pitches in any frame of these clips and
  a pitch in every frame, also in the silent count-in (S3 at 0.000 s: 138.592 Hz). MultiPitchMelodia writes `[0.0]`
  for frames without a pitch and returned up to 4 pitches per frame (S3).
- Scoring: gtr-eval has no multi-pitch subcommand, so this lane computed `mir_eval.multipitch.evaluate` itself
  (`scripts/score_multipitch.py`, run with the gtr-eval venv's Python, mir_eval 0.8.2): reference = every truth
  note except drums (S4guitar: `chord` voice only) as frames on a 10 ms grid; estimate frames taken at the nearest
  time; mir_eval's default 50-cent tolerance. A self-check with the truth notes CSV as the estimate gives Precision
  = Recall = Accuracy = 1.0 on S2n. For comparison the note lists of Basic Pitch and Transkun were put on the same
  grid (a note sounds from onset to offset). Results (`samples/multipitch_scores.json`):

| clip | Klapuri P / R / Acc | MultiPitchMelodia P / R / Acc | Basic Pitch notes P / R / Acc | Transkun notes P / R / Acc |
|---|---|---|---|---|
| S2n | 0.722 / 0.803 / 0.613 | 0.942 / 0.481 / 0.467 | 0.688 / 0.969 / 0.673 | 0.908 / 0.838 / 0.773 |
| S2s | 0.637 / 0.724 / 0.513 | 0.785 / 0.453 / 0.403 | 0.437 / 0.968 / 0.431 | not run |
| S3 | 0.703 / 0.311 / 0.275 | 0.877 / 0.216 / 0.210 | 0.813 / 0.865 / 0.721 | 0.808 / 0.549 / 0.486 |
| S4guitar | 0.804 / 0.377 / 0.345 | 0.924 / 0.173 / 0.170 | 0.847 / 0.867 / 0.749 | not run |
| R1a | 0.590 / 0.406 / 0.317 | 0.593 / 0.176 / 0.157 | 0.817 / 0.803 / 0.681 | 0.886 / 0.481 / 0.453 |
| R1c | 0.516 / 0.403 / 0.293 | 0.761 / 0.300 / 0.274 | 0.829 / 0.850 / 0.724 | 0.825 / 0.721 / 0.625 |

ByteDance's notes on the same grid (run r0401, two clips only): S2n P 0.806 / R 0.860 / Acc 0.713, R1c P 0.789 /
R 0.528 / Acc 0.462. (P = mir_eval multipitch Precision, R = Recall, Acc = Accuracy, all over 10 ms frames; these
numbers have no gtr-eval id because gtr-eval does not compute them.)

## Tools not run here

Each entry: what it is, why it did not run on this box, with the evidence. Steps for Aaron are in `for-aaron.md`.
Context for several entries: from about 21:05 UTC the orchestrator's disk notice, printed by the box's tools, said:
"start no new download or install over 200 MB unless your lane cannot finish without it" (the notice prints when
less than 9,000 MB is free; this lane's logs record 7,755 MB and later 6,560 MB free, and the verifier saw 5,783 MB
at 22:44 UTC, for about 20 agents).

### CREPE (`marl/crepe`, PyPI `crepe` 0.0.16) - NOT RUN HERE

- The original Keras/TensorFlow package. Its README (https://raw.githubusercontent.com/marl/crepe/master/README.md,
  read 2026-11-10) installs it with `pip install --upgrade tensorflow` then `pip install crepe`. The `tensorflow`
  2.15.0 cp311 Linux wheel is 475,258,658 bytes on PyPI: over the 200 MB limit, so it was not installed. The same
  CREPE weights did run here through torchcrepe (PyTorch conversion) and Essentia's `crepe-*-1.pb` (TensorFlow
  graphs inside the Essentia wheel), above. The Basic Pitch TensorFlow backend was skipped for the same reason.
  (corrected in gap round 1: the disk limit no longer applied; the reasons CREPE still did not run are the next item.)
- Gap round 1 (23:17 to 23:30 UTC; record `samples/crepe/gap1-not-run.txt`). PyPI has only the source archive
  `crepe-0.0.16.tar.gz` (16,519 bytes), so installing means building it. (1) The PyPI route fails on this box (seen in
  `uv pip install --dry-run` resolutions on Python 3.9, 3.10 and 3.11, which build it): in uv's build environment
  `setup.py` line 6, `import pkg_resources`, stops with "ModuleNotFoundError: No module named
  'pkg_resources'" (newest setuptools); with the build constraint `setuptools<81` it prints "Downloading weight file
  model-tiny.h5.bz2 ..." and stops with "urllib.error.HTTPError: HTTP Error 403: Forbidden"
  (`samples/crepe/gap1-crepe-0.0.16-build-setuptools-lt-81-py310.log`). `setup.py` downloads the five weight files
  from `https://github.com/marl/crepe/raw/models/` unless `crepe/model-<capacity>.h5` is already in the source tree;
  that github.com URL answers HTTP 403 to this box, while the same file at
  `https://raw.githubusercontent.com/marl/crepe/models/model-tiny.h5.bz2` answers 200 (1,307,310 bytes). (2) The PyPI
  source with the five weight files put in place (fetched from raw.githubusercontent.com, `models` head bb29b8d9:
  `model-tiny.h5` 2,011,144 bytes and `model-full.h5` 89,038,936 bytes once decompressed), installed from that local
  folder together with `tensorflow==2.15.0` and `numpy<2` in a Python 3.11 venv, was refused by the session's
  permission system: "Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code
  from External]." Nothing of that command ran (no venv afterwards); the source tree and weights were deleted. So
  neither `tiny` nor `full` of the original package ran on S1 or R1b. Steps in `for-aaron.md` (section 4).

### RMVPE - ran in gap round 1 (was NOT RUN HERE)

- The research repo (`Dream-High/RMVPE`) has no PyPI package; the PyPI wrapper `rmvpe-onnx` 0.2.3 (14,520-byte
  wheel, MIT) downloads `rmvpe.onnx` from the Hugging Face repo `lj1995/VoiceConversionWebUI`, where that file is
  361,688,443 bytes (`rmvpe.pt` is 181,184,272 bytes but needs the RVC project's model code). Over the 200 MB
  limit; not installed. (corrected in gap round 1: with the disk limit lifted, `rmvpe-onnx` 0.2.3 and `rmvpe.onnx`
  ran on 8 clips in run r0516, plus its CLI in r0517; see "Gap round 1".)

### MELODIA Vamp plugin (MTG) - NOT RUN HERE

- https://www.upf.edu/web/mtg/melodia answered HTTP 403 to this box (curl and WebFetch, 2026-11-10); per the task
  rules a 403 from a host is not retried. The Wayback Machine lists a 2026-10-31 copy of that page, but fetching it
  failed ("ws_closed_mid_exchange", the proxy tunnel closed). The docs lane reports the plugin is behind a download
  form. The algorithm itself (Salamon and Gomez's melody extraction) ran here as Essentia's
  `PredominantPitchMelodia`, above. A Vamp host is on the box (`vamp-simple-host`, from the Ubuntu
  `vamp-examples` 2.10.0-4build1 package; the SDK headers and libraries from `vamp-plugin-sdk` 2.10.0).

### pYIN Vamp plugin (`c4dm/pyin`, its `notes` output) - NOT RUN HERE

- Cloned at commit 1d68cac9 (2020-02-06; still the repository's HEAD on 2026-11-10 per `git ls-remote`). Building it
  (`make -f Makefile.linux64 pyin.so` against the installed Vamp SDK) was refused by the trial session's permission
  settings ("Code from External"), so the plugin and its note tracker did not run. (The refusal is the trial agent's
  report; permission decisions leave no file on the box.) librosa's pYIN (frames only) ran above. Tony (the desktop app built on pYIN) is in
  `for-aaron.md`.

### Timbre-Trap (`sony/timbre-trap`, commit 7afe7e9, 2024-05-05) - NOT RUN HERE

- Not on PyPI (`setup.py` has `install_requires=[]`; the README installs it with `pip install -e`). The repository
  was cloned, its runtime dependencies were installed from PyPI (`cqt_pytorch` 0.0.5, torch 2.15.0+cpu, librosa
  0.11.0, mir_eval 0.8.2; freeze in `samples/timbre-trap/`), and the paper's weights `tt-orig.pt` (11,353,410 bytes,
  sha256 1c3bafd3...4cb9fe3) were downloaded from the Space `cwitkowitz/timbre-trap` (the Space itself was in
  RUNTIME_ERROR per the Hugging Face API; still RUNTIME_ERROR when the verifier read the API at about 22:40 UTC).
  Running the cloned code and loading the pickled checkpoint (`torch.load(..., weights_only=False)`) was refused by
  the trial session's permission settings ("Code from External"; the trial agent's report, no file on the box records
  it; `logs/install-ttrap.log` records the dependency install, exit 0).
  The clone, the weights and the venv were deleted afterwards. The lane's runner `scripts/run_timbretrap.py` is kept
  (it follows the repo's `experiments/comparison.py`: threshold 0.5 after peak picking, multi-pitch frames).

### MT3 (Magenta, `magenta/mt3`) - NOT RUN HERE

- JAX/T5X code (README: "uses the T5X framework"); the README's route for transcribing your own audio is a Colab
  notebook, whose setup cell copies the checkpoints from Google Cloud Storage (`gcloud storage -q cp --recursive
  gs://mt3/checkpoints .`). The README links no Hugging Face Space; the community Space `akhaliq/MT3` reported
  `RUNTIME_ERROR` (Hugging Face API, 2026-11-10). A local CPU install (jax, t5x, seqio, tensorflow-text, note-seq) was not attempted
  because of the 200 MB limit. (corrected in gap round 1: the disk limit no longer applied; the install was attempted
  and refused by the session's permission system, below.)
- Gap round 1 (`gapfill-audio-to-notes`, 2026-11-10, 23:14 to 23:23 UTC). The notebook's install route: `git clone
  --depth 1 --branch=main https://github.com/magenta/mt3` (commit 7ecf19d, 2026-10-27; the clone was allowed), then
  the notebook's install command with `jax[cpu]` in place of `jax[cuda12]` and without its `-f
  https://storage.googleapis.com/jax-releases/jax_cuda_releases.html` (no GPU here): `uv venv --python 3.11
  venv-mt3 && uv pip install --python venv-mt3/bin/python "jax[cpu]" nest-asyncio pyfluidsynth==1.3.0 -e <clone>`.
  Answer: "Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from
  External]." Nothing of that command ran (no venv and no log existed afterwards). The clone's `setup.py` would have
  installed `flax`, `note-seq`, `seqio` and `t5x` from their GitHub repositories (`@ git+https://github.com/...`) and
  `t5`, `tensorflow`, `tensorflow-datasets` from PyPI. Record: `samples/mt3/permission-refusal.txt`.
- The task's fallback, mt3-pytorch (`kunato/mt3-pytorch`, commit e203122, 2022-05-24): its checkpoint
  `pretrained/mt3.pth` is a Git LFS object of 183,672,643 bytes (sha256 b8a3807e...3745398f), fetched from
  media.githubusercontent.com with that sha256; the Hugging Face repo `gudgud1014/MR-MT3` holds a `mt3.pth` with the
  same size and LFS sha256 (Hugging Face API, 2026-11-10). Its `requirements.txt` (`transformers==4.18.0`, `torch`,
  `librosa==0.9.1`, `ddsp==3.3.4`, `t5==0.9.3`, `note-seq==0.0.3`, `pretty-midi==0.2.9`, `einops==0.4.1`) does not
  resolve on this box: `ddsp` 3.3.4 needs `crepe>=0.0.11`, and uv's build of the `crepe` 0.0.16 source archive
  stops with "ModuleNotFoundError: No module named 'pkg_resources'" (dry runs on Python 3.9, 3.10 and 3.11;
  `samples/mt3/gap1-mt3pytorch-dryrun-py310.log`) and, with the build constraint `setuptools<81`, with
  "urllib.error.HTTPError: HTTP Error 403: Forbidden" after "Downloading weight file model-tiny.h5.bz2 ..." (see
  "CREPE" in "Gap round 1"). Without ddsp the list resolves (dry run, Python 3.11: 169 packages, among them
  tensorflow 2.21.0, jax 0.10.2, tensorflow-text 2.21.1, torch 2.15.0+cpu, tokenizers 0.12.1). The inference code
  needs TensorFlow in any case (`contrib/spectrograms.py`: `from ddsp import spectral_ops`, `import tensorflow as
  tf`; `contrib/vocabularies.py`: `import t5.data`). The README's usage, `InferenceHandler('./pretrained')` then
  `.inference(<audio>)`, run from the clone through `scripts/run_mt3_pytorch.py` (device cpu) in a venv holding
  torch 2.15.0+cpu, was refused with the same answer ("[Code from External]"); nothing ran (no output folder was
  created). The venv, the checkpoint and the clones were deleted. (Added by the round's verifier: that venv held
  torch and its own dependencies only, `samples/mt3/uv-pip-freeze-venv-mt3pytorch-py3.11-unused.txt`; transformers,
  librosa, note-seq, t5, ddsp and TensorFlow, which `inference.py` and `contrib/` import, were not installed in it.)
- Which model variant: none ran. From the mt3-pytorch code (not from a run): the codec is built with
  `num_velocity_bins=1` and `NoteEncodingWithTiesSpec` on inputs of 256 frames, the settings of the MT3 notebook's
  `mt3` branch (its `ismir2021` branch uses 127 velocity bins, `NoteEncodingSpec` and 512 frames), and the MIDI file
  is written with `note_seq.sequence_proto_to_midi_file` (default path `./out/<audio file stem>.mid`). Its
  `pretrained/config.json` is a `T5ForConditionalGeneration` config (d_model 512, 8 encoder and 8 decoder layers, 6
  heads, d_ff 1024, vocab_size 1536; copy in `samples/mt3/`).
- Not used in place of the refused routes: the PyPI package `mt3-infer` 0.2.0 (2026-07-11), which vendors the
  mt3-pytorch, MR-MT3 and YourMT3 code (survey.md, section 36).

### YourMT3+ - NOT RUN HERE (Space quota) and not run locally (disk; in gap round 1: not attempted, see below)

- The author's Space `mimbres/YourMT3` (Gradio 4.39.0, hardware `zero-a10g`, stage RUNNING, git sha 5e66c1ea,
  last modified 2025-01-31, card license apache-2.0; read from https://huggingface.co/api/spaces/mimbres/YourMT3 on
  2026-11-10). Its API (gradio_client 2.7.2, `view_api`) has `/process_audio(audio_filepath) -> html` (and YouTube
  endpoints). Its `app.py` sets `model_name = 'YPTF.MoE+Multi (noPS)'`, checkpoint
  `mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b36_nops@last.ckpt`, and returns the MIDI embedded in
  an HTML player. One call with S2n.wav (`scripts/run_yourmt3_space.py`, 1.81 s round trip) returned:
  "You have exceeded your ZeroGPU quota (90s requested vs. 79s left). Try again in 6:54:35. Authenticate with a
  Hugging Face token for more quota" (record: `samples/yourmt3-space/space_calls.json`, API listing
  `samples/yourmt3-space/view_api.txt`). No Hugging Face token was available to this session. Locally the Space
  repo's checkpoints are 361 to 759 MB each (the default one 561,544,628 bytes), over the
  200 MB limit. (corrected in gap round 1: the disk limit no longer applied, and the default checkpoint fits this
  round's rule of keeping 4 GB free; the reason a local run did not happen is the next item.)
- Gap round 1, local CPU run: not attempted. The model code exists only inside the Space's git repository (no
  package from the authors), and running code from a cloned repository is the action the session's permission
  system refused twice in this round, minutes earlier ("[Code from External]": installing the MT3 clone, running the
  mt3-pytorch clone; `samples/mt3/permission-refusal.txt`), so no YourMT3 command was submitted; no local 2-core
  runtime is on record. Facts read for it (Hugging Face API and raw files, 2026-11-10): the ZeroGPU Space's `app.py`
  (5e66c1ea) loads the model with `load_model_checkpoint(args=args, device="cpu")` and then calls `model.to("cuda")`
  with `precision = '16'`; the CPU copy `mimbres/YourMT3-cpu` (bd69fbac, hardware `cpu-basic`, card `license:
  apache-2.0`) sets `precision = '16' if torch.cuda.is_available() else '32'`; both hold the same five checkpoints
  (361,050,039 to 758,957,292 bytes; the default `.../mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b36_nops/checkpoints/last.ckpt`
  561,544,628 bytes) and list `torch`, `torchaudio`, `lightning>=2.2.1`, `transformers` (`==4.45.1` in the ZeroGPU
  Space), `librosa`, `einops`, `mido`, `mir_eval` from GitHub, `yt-dlp` and `wandb` in `requirements.txt`. The
  hosted-apis lane's runs of `mimbres/YourMT3-cpu` on S2n and R1c (r0164 31.18 s, r0245 31.34 s, on the Space's
  `cpu-basic` hardware: round trips its script measured from sending the request to having the whole answer, upload
  and queueing included; the ledger walls of the two runs are 32.21 s and 33.78 s) are the timings on record for the
  CPU Space. Steps for a local run on Aaron's PC: `for-aaron.md`, section 1.

### MR-MT3 (`gudgud96/MR-MT3`) - NOT RUN HERE

- Its README installs `transformers==4.18.0`, `t5==0.9.3`, `note-seq==0.0.3`, `ddsp`, `tensorflow==2.11`,
  `tensorflow-text==2.11`, `tensorflow_probability==0.19.0`, `pytorch_lightning` and more
  (https://raw.githubusercontent.com/gudgud96/MR-MT3/master/README.md, read 2026-11-10; the `main` branch URL answers
  404): TensorFlow, over the 200 MB limit. (corrected in gap round 1: the disk limit no longer applied; the reason now
  is the next item.)
- Gap round 1: not attempted. MR-MT3 has no package; its inference (`inference.py`, `InferenceHandler`) runs from a
  clone of the repository, and running code from a cloned repository is the action the session's permission system
  refused twice in this round, minutes earlier ("[Code from External]": installing the MT3 clone, running the
  mt3-pytorch clone; `samples/mt3/permission-refusal.txt`), so no MR-MT3 command was submitted. As shipped,
  `inference.py` (826ea84) also calls `self.model.cuda()` without a device check (survey.md), so a CPU run would need
  a code change. Its pretrained checkpoints (Hugging Face `gudgud1014/MR-MT3`, revision 7bd24c3e, card license tag
  `mit`, file list read from the API on 2026-11-10): `mt3.pth` 183,672,643 bytes (the LFS sha256 of kunato's
  mt3-pytorch checkpoint), `slakh_f1_0.65.pth` and `commu_mt3.pt` 183,637,952 bytes each, and ten `.ckpt` files of
  582,509,233 to 582,536,411 bytes under `scratch/`, `continual/` and `stemmix/`. Steps in `for-aaron.md`.

### Onsets and Frames (Magenta) and hFT-Transformer (Sony) - NOT RUN HERE (Onsets and Frames: ran in gap round 1)

- Onsets and Frames lives in `magenta/magenta` (archived, per the docs lane) and runs on TensorFlow; not attempted
  (disk). (corrected in gap round 1: Onsets and Frames ran, Magenta's MAESTRO checkpoint with the `magenta` 2.1.4
  package's own transcribe script, run r0545, on S1, S2n, R1c and the S4 guitar stem; see "Gap round 1". The PyTorch
  port `jongwook/onsets-and-frames` publishes no checkpoint, so it was not run.) hFT-Transformer (`sony/hFT-Transformer`): not attempted. Its README's "Development Environment" lists a GPU
  (NVIDIA GeForce RTX 2080 Ti) for "corpus generation, evaluation" and an A100 for training, and its MAESTRO
  checkpoint (`checkpoint.zip`, 20,540,269 bytes, GitHub release `ismir2023`) is used through the repository's own
  scripts (`./evaluation/EXE-EVALUATION-MAESTRO.sh model_016_003.pkl test`); running cloned repository code had been
  refused in this session for Timbre-Trap. Two other piano-trained models (Transkun, ByteDance) ran above. Its
  README: "the checkpoints are distributed under CC BY-NC-SA 4.0".

### Omnizart 0.6.3 - NOT RUN HERE

- PyPI `omnizart` 0.6.3 (uploaded 2026-05-31) requires `tensorflow>=2.5.0` (Python < 3.14), `tf-keras`, `madmom`,
  `sherpa-onnx`, `vamp` and others (PyPI metadata, re-read by the verifier 2026-11-10). The TensorFlow requirement
  alone is over the 200 MB limit, so no install attempt was made. (corrected in gap round 1: one install attempt was
  made, next item.)
- Gap round 1: one attempt, with Omnizart's own pins. Omnizart 0.5.0 (2021-12-09) is the last release that pins
  TensorFlow (`tensorflow (==2.5.0)`, `requires_python >=3.6.1,<3.9`; 0.6.x has `tensorflow>=2.5.0` and Python
  `>=3.8`; PyPI JSON, read 2026-11-10). Command (23:30 UTC): `uv venv --python 3.8 venv-omnizart && uv pip install
  --python venv-omnizart/bin/python "omnizart==0.5.0"`. uv downloaded CPython 3.8.20 (19.9 MiB) and created the venv,
  "Resolved 91 packages in 13.00s" (among them tensorflow 2.5.0, spleeter 2.4.0, librosa 0.8.1, numpy 1.19.5,
  keras-nightly 2.5.0.dev2021032900), then started building ("Building ...") the three packages that have no wheel
  on PyPI for Linux and Python 3.8 (madmom 0.16.1 and wrapt 1.12.1: a source archive only; vamp 1.1.0: a source
  archive and two Python 2.7 wheels, macOS and Windows) and stopped after 17.0 s (exit 1): "Failed to build `vamp==1.1.0`" ... "File
  "<string>", line 3, in <module> ModuleNotFoundError: No module named 'numpy'", with uv's hint "`vamp` (v1.1.0) was
  included because `omnizart` (v0.5.0) depends on `vamp`" and "This error likely indicates that `vamp@1.1.0` depends
  on `numpy`, but doesn't declare it as a build dependency". Nothing was installed, so neither music nor vocal mode
  ran. Logs: `samples/omnizart/gap1-omnizart-0.5.0-py3.8-install.log` and `...-dryrun.log` (the resolved list). The
  venv and the CPython 3.8.20 that uv fetched were removed (`uv python uninstall 3.8.20`). No second attempt (for
  example with numpy preinstalled and `--no-build-isolation`) was made: the round allowed one.

### NeuralNote - NOT RUN HERE

- A desktop plugin and standalone app (VST3/AU/Standalone, installers for macOS and Windows, Linux by building from
  source; README read 2026-11-10). v2 transcribes with MuScriptor GGUF models downloaded from within the app the
  first time it is opened (README: "about 210 MB for `small`, 620 MB for `medium` and 2.7 GB for `large`"). The
  README describes no command-line use; building from source needs "A C++23 compiler" (README). Not attempted.

### Sheet Sage - NOT RUN HERE

- README: "ensure you are running Linux and have Docker installed", a one-time setup that downloads "a ~4GB Docker
  container"; the Jukebox mode needs "a GPU w/ at least 12GB memory". The box has no Docker and under 8 GB of free
  shared disk (5,783 MB at 22:44 UTC).

### From the docs lane's survey (`survey.md`, "Tool list"), not run

- PENN 1.0.0 (FCNF0++, `interactiveaudiolab/penn`) - NOT RUN HERE: installed (`uv pip install torch torchaudio penn
  soundfile` -> penn 1.0.0, torbi 1.4.1, torchutil 0.1.2, yapecs 0.5.0, torch 2.15.0+cpu; freeze in `samples/penn/`)
  and its checkpoint downloaded (`fcnf0++.pt`, 107,245,425 bytes, Hugging Face `maxrmorrison/fcnf0-plus-plus`, card
  license `mit`, sha256 28d89add...53d51d1b960), but `import penn` fails in run **r0399** (exit 1): its Viterbi
  dependency torbi 1.4.1 ships compiled libraries only for torch 2.6 to 2.11 (`_C.pt26cpu` ... `_C.pt211cu130` in the
  Linux wheel, CPU and CUDA builds; the Windows wheel has the same versions) and stops with "FileNotFoundError: Could
  not find any lib files matching version pt215cpu" (reproduced by the verifier in run r0423). Running it
  would need a second torch version (2.11) in its own venv, which the disk notice ruled out. Its run was first
  queued for a CPU slot in a batch with the ByteDance model; that queued job waited about 48 minutes without
  getting a slot and was cancelled (no ledger line, as it never started).
- MuScriptor 0.4.0 (Kyutai and Mirelo): the Hugging Face model `MuScriptor/muscriptor-small` is gated (`gated:
  auto`, license `cc-by-nc-4.0` on its card) and its `model.safetensors` is 411,888,600 bytes; no token here, and
  over the 200 MB limit. (`DamRsn/muscriptor-gguf` is not gated but needs the C++ `muscriptor.cpp`.)
- CREPE Notes (`crepe-notes` 0.2.0): depends on madmom, whose only PyPI file is the 0.16.1 source archive (no wheel),
  so installing it means compiling it; not attempted. (corrected in gap round 2: madmom was installed on this box by
  two other lanes, 0.16.1 from that archive in chords-beats-key and 0.17.dev0 from git in fingerstyle-voices-taps;
  CREPE Notes ran in gap round 2 with a copy of the latter, items A3 and A4 under "Gap round 2".)
- Deep Salience, melodyExtraction_JDC / SSL: Keras/TensorFlow (disk). Aria-AMT, Onsets and Velocities: piano models
  (two piano models ran). SOME / GAME, ROSVOT: singing-voice transcribers; mt3-pytorch, MTANet: no license file per
  the survey. None attempted, for time and disk. (corrected in gap round 1: mt3-pytorch was attempted as MT3's
  fallback, and running it from its clone was refused by the session's permission system; see the MT3 entry above.)
  (corrected in gap round 2: for Deep Salience, melodyExtraction_JDC / SSL and MTANet the reason is now specific,
  item A5 under "Gap round 2": each runs only from its cloned repository, running the Deep Salience clone was refused
  by the session's permission system, and MTANet publishes no weights.)

## Gap round 1

Agent: `gapfill-audio-to-notes`, 2026-11-10 from 23:13 UTC. The tools below had been recorded as NOT RUN HERE because
of the shared-disk notice (no download over 200 MB); at 23:13 UTC the shared disk had 11 GB free and the notice was
no longer printed (this round's rule: keep at least 4 GB free). Each tool was installed alone, run through `gtr-run`,
scored with gtr-eval 0.11.1, its `uv pip freeze` saved in its samples folder, and its venv and weights deleted
afterwards. Two tools ran (RMVPE, Onsets and Frames: the sections below). The items of the round that did not run are
corrected where they stand under "Tools not run here" (MT3 with mt3-pytorch, MR-MT3, YourMT3+ on the CPU, Omnizart,
CREPE), with the reason as it is now. The session's permission system refused three commands ("[Code from
External]"): two for MT3 (the notebook's install of the cloned repository, then running the mt3-pytorch clone) and
one for CREPE (installing its source with the weights put in place); the answers are recorded word for word in
`samples/mt3/permission-refusal.txt` and `samples/crepe/gap1-not-run.txt`. After the first two, no further command of
that kind (running code from a cloned repository) was submitted for MR-MT3 or YourMT3+, so those two were not
attempted.

### RMVPE through `rmvpe-onnx` 0.2.3 (ONNX Runtime, CPU)

- What: RMVPE, "A Robust Model for Vocal Pitch Estimation in Polyphonic Music" (survey.md section 5): a frame-wise
  f0 model for the singing voice, run here through the third-party PyPI wrapper `rmvpe-onnx` 0.2.3 (uploaded
  2026-04-11, license MIT, source https://github.com/NewComer00/rmvpe-onnx). Its README: "A simple wrapper around
  ONNX-related code in `rvc/lib/rmvpe.py @ 7e03261`" of the RVC project, "ONNX model from lj1995/VoiceConversionWebUI"
  (PyPI description, read 2026-11-10). Model file `rmvpe.onnx` from the Hugging Face repo
  `lj1995/VoiceConversionWebUI` (revision e6d0c1a1, card license tag `mit`): 361,688,443 bytes, sha256
  5370e71a...fa3660fd, the digest the package checks (`weights.py`, `_MODEL_SHA256`) and the repo's LFS oid. Which
  checkpoint the paper used: UNVERIFIED (survey.md section 5).
- Install (worked first time): `uv venv --python 3.11 venv-rmvpe && uv pip install "rmvpe-onnx[cli]==0.2.3"
  soundfile` -> rmvpe-onnx 0.2.3, onnxruntime 1.31.1, librosa 0.11.0, numpy 2.4.6, scipy 1.17.1, huggingface-hub
  2.4.0, plotly 7.1.0 (the `cli` extra), soundfile 0.14.0 (freeze: `samples/rmvpe/uv-pip-freeze-venv-rmvpe-py3.11.txt`).
  Venv 540 MB by `du`. The package's `ensure_model()` downloads with `hf_hub_download` into the Hugging Face cache
  and then copies the file into the package's `data/` folder, so it would keep two copies; here the file was
  fetched once with curl (14 s) and passed as `model_path`, and the package only checked its SHA-256.
- Run: `scripts/run_rmvpe.py`: `soundfile.read(<clip>)`, then `RMVPE(model_path=..., device="cpu").predict(audio,
  sr)`, raw outputs written as `time_s,frequency_hz,confidence` (no threshold). Clips: S1, S2n, S2s, S4 (the mix),
  R1b, R2, R3a (`<id>.mono.wav`) and S4lead (the stereo stem). Run **r0516** (2 cores; wall 34.68 s, CPU 54.9 s, peak
  RSS 1,198.7 MB, exit 0, 0.0 s waiting for a slot): model setup 1.38 s; `predict()` on S1 16.05 s (the first call
  in the process), on the other clips 1.13 s (R3a, 18 s) to 2.44 s (S4lead, 38.7 s); `samples/rmvpe/timings.json`.
- The package's CLI on `S1.wav`: `rmvpe-onnx predict S1.wav --model rmvpe.onnx --device cpu --csv S1.csv`, run
  **r0517** (`--nolock`, unpinned; wall 7.40 s, CPU 10.5 s, peak RSS 1,007.6 MB, exit 0). It printed "Threshold  :
  0.03", "Frames     : 2984", "Voiced     : 498  (16.7 %)", "F0 range   : 216.3 – 392.8 Hz" and "Time       : 2902.0
  ms"; its CSV (`samples/rmvpe/cli-S1.csv`) has the header `time,frequency,confidence` and 0 Hz in the frames below
  the threshold.
- Output facts (from `rmvpe_onnx/model.py` and the run): `predict()` returns `time` (s; hop 160 samples at 16 kHz =
  10 ms), `frequency` (Hz, a salience-weighted average of the 9 bins around the peak bin), `confidence` (the frame's
  largest value of the 360-bin sigmoid output, 0 to 1) and `activation` (frames x 360 bins of 20 cents). The bin
  centres run from 31.70 to 2005.50 Hz (`cents_mapping` = 20 x bin + 1997.38 cents above 10 Hz). A frequency is
  written for every frame, also in silence (S1 at 0.000 s: 567.215 Hz, confidence 0.000261); there is no voiced
  flag. The README: "The Python API returns raw outputs with no confidence thresholding applied. Use `confidence` to
  filter `frequency` yourself if needed", with `frequency[confidence < 0.03] = 0.0` as its example; the CLI help:
  "Frames below this confidence threshold (0.0–1.0) are zeroed out (default: 0.03)". ONNX graph: input `input`,
  float [1, 128, time] (log-mel, 128 bands from 30 to 8,000 Hz), output float [.., .., 360].
- Confidence on these clips, frames at >= 0.03 / >= 0.5 of all frames: S1 499 / 84 of 2,984 (largest 0.949); S2n
  912 / 21 of 2,936; S2s 515 / 0 of 2,936 (largest 0.193); S4 1,637 / 66 of 3,875; S4lead 3,008 / 2,047 of 3,875;
  R1b 2,135 / 1,655 of 2,934; R2 2,905 / 1,683 of 3,601; R3a 1,475 / 121 of 1,800. Median confidence of the frames
  inside the truth notes (`scripts/f0_conf_stats.py`, `samples/rmvpe/conf_stats.txt`): S1 0.0074 (90th percentile
  0.0512), S2n 0.0162, S2s 0.0116, S4 0.0326, S4lead 0.7241, R1b 0.8685. The same script's share of in-note frames
  within 50 cents equals the RPA below on all six clips.
- Constraint inputs: `model_path`, `device` (cpu, cuda, dml, rocm, coreml, tensorrt, openvino; default: the first
  available non-CPU provider, else cpu); the CLI also `--confidence-threshold`. No frequency-range, hop, tuning or
  key input (`MelSpectrogram` has `keyshift` and `speed` arguments; `predict()` does not pass them).
- Input facts: what soundfile reads (CLI help: "typically WAV"); multichannel audio is downmixed with
  `librosa.to_mono` and resampled to 16 kHz with `librosa.resample` inside `predict()`.

f0 against the truth melody voice (S4 and S4lead: the lead line; R1b `--voice lead`), voiced at confidence >= 0.03
(`--conf-threshold 0.03`); RPA and RCA do not depend on the threshold:

| clip | RPA | RCA | voicing recall | voicing false alarm | overall accuracy | eval id |
|---|---|---|---|---|---|---|
| S1 | 0.652 | 0.652 | 0.180 | 0.075 | 0.232 | e1478 |
| S2n | 0.416 | 0.546 | 0.347 | 0.084 | 0.315 | e1479 |
| S2s | 0.383 | 0.391 | 0.200 | 0.022 | 0.247 | e1480 |
| S4 (mix) | 0.129 | 0.541 | 0.515 | 0.186 | 0.297 | e1481 |
| S4lead | 0.959 | 0.959 | 0.992 | 0.227 | 0.905 | e1482 |
| R1b | 0.847 | 0.847 | 0.942 | 0.376 | 0.748 | e1483 |

Against the bass voice (RPA ignores voicing): S2n 0.196 (e1484), S2s 0.008 (e1485). R2 (real singing over a band)
and R3a have no truth: their f0 files are in `out/rmvpe/f0/` (`samples/rmvpe/R2.f0.csv`). Samples: `samples/rmvpe/`
(f0 of S1, S4 and R2, the CLI's S1 CSV, timings, `scores/`, `conf_stats.txt`).

### Onsets and Frames (Magenta), MAESTRO checkpoint, through `magenta` 2.1.4 (piano-trained, run on guitar)

- What: Google Magenta's Onsets and Frames transcription model (survey.md section 24) with its piano checkpoint.
  **The checkpoint was trained on piano recordings (MAESTRO)**; here it ran on guitar. The PyTorch port
  (`jongwook/onsets-and-frames`) publishes no checkpoint (its README covers training your own; a clone at 783ca08
  holds no weight file), so, as the round asked, Magenta's own checkpoint ran with Magenta's own transcribe script.
  Checkpoint `maestro_checkpoint.zip` from
  https://storage.googleapis.com/magentadata/models/onsets_frames_transcription/maestro_checkpoint.zip: 263,865,474
  bytes, Last-Modified 29 Jan 2019, MD5 equal to the storage `x-goog-hash`; inside, a TensorFlow 1 checkpoint under
  `train/` (`model.ckpt.data-00000-of-00001` 292,348,336 bytes) and no license or readme file.
- Install: `magenta` 2.1.4 (PyPI, 2022-08-01) pins tensorflow 2.9.1, numba 0.49.1, numpy 1.21.6 and librosa 0.7.2,
  whose wheels overlap on Python 3.7 and 3.8, so: `uv venv --python 3.8 venv-oaf && uv pip install --python
  venv-oaf/bin/python "magenta==2.1.4"`. uv fetched CPython 3.8.20, "Resolved 122 packages", built librosa 0.7.2,
  python-rtmidi 1.1.2, promise 2.3, mir-eval 0.7 and pretty-midi 0.2.9 from source and finished in 1 min 57.8 s
  (worked first time) -> magenta 2.1.4, tensorflow 2.9.1, tensorflow-probability 0.17.0, tf-slim 1.1.0, dm-sonnet
  2.0.0, note-seq 0.0.3, librosa 0.7.2, numba 0.49.1, numpy 1.21.6, scipy 1.7.3 (freeze:
  `samples/onsets-frames/uv-pip-freeze-venv-oaf-py3.8.txt`). Venv 2.0 GB by `du`. When this install started the
  shared disk had 8,996 MB free and the disk notice printed again; its exception ("unless your lane cannot finish
  without it") was taken, and the free space stayed above 6.5 GB. Afterwards the venv, the checkpoint and the CPython
  3.8.20 were removed, and so were the Python 3.8 wheels this install had put in the shared uv cache (about 2 GB:
  `uv cache clean` for the 13 packages only it had cached, and for the other packages only their 3.8 entries, which
  no venv linked any more).
- Run: the package's console script in the README's form, `onsets_frames_transcription_transcribe
  --model_dir=<checkpoint>/train S1.wav S2n.wav R1c.wav S4guitar.wav` (defaults: config `onsets_frames`, no
  `--hparams`), one process for the four files, under GNU time. The script writes `<input path>.midi` next to each
  input, so the inputs were symlinks in `out/onsets-frames/` to `S1.mono.wav`, `S2n.mono.wav`, `R1c.mono.wav` and
  `S4/stems/guitar.wav` (the shared inputs folder was not written to). Run **r0545** (2 cores, cores 2-3; wall 39.57
  s, CPU 42.2 s, peak RSS 1,151.0 MB, exit 0, 329.3 s waiting for a slot); GNU time: user 40.19 s, sys 1.96 s,
  maximum RSS 1,178,656 KiB. Per file, from the script's log ("Starting transcription for" to "Transcription written
  to", `scripts/oaf_log_times.py`, `samples/onsets-frames/run_facts.json`): S1 5.30 s, S2n 4.07 s, R1c 4.31 s, S4
  guitar stem 4.97 s; the log shows "Restoring parameters from .../model.ckpt" once per file. The first file started
  about 20 s after the run started (20.5 s counted from the ledger's start time, 23:41:16, which has whole seconds;
  TensorFlow import and estimator setup). TensorFlow logged that `libcudart.so.11.0`
  could not be loaded and ran on the CPU.
- Output: one MIDI file per input: type 1, 220 ticks per quarter, 2 tracks, tempo 120, one instrument, program 0, no
  control changes (no pedal), no pitch bends; velocities 67 to 76 (S1), 55 to 74 (S2n), 30 to 76 (R1c), 54 to 75 (S4
  guitar stem). Note counts: S1 65, S2n 91, R1c 173, S4 guitar stem 372. First S2n notes (start, end, pitch,
  velocity; ordered by start, then end): `2.143-2.368 62 70`, `2.143-2.657 55 73`, `2.143-2.752 43 69`, `2.657-3.264
  50 70`, `2.657-3.809 55 72`, `3.200-3.743 62 70`, `3.200-3.809 43 64`, `3.743-4.320 50 69`, `3.743-4.320 62 73`,
  `4.289-4.864 48 71`.
- Input facts: the WAV is read with scipy (`note_seq.audio_io.wav_data_to_samples`: "Audio will be converted to mono
  if necessary") and resampled to the model's sample rate; `--load_audio_with_librosa` is "required for 24-bit
  audio" (not used: the clips are 16-bit).
- Constraint inputs: `--model_dir`, `--checkpoint_path`, `--config` (`onsets_frames`, `drums`), `--hparams`,
  `--load_audio_with_librosa`, `--transcribed_file_suffix`. No pitch range, tuning, instrument or tempo input.

Notes against the truth (S4guitar: the S4 truth's `chord` voice, as for Basic Pitch):

| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|
| S1 | 62 | 65 | 0.954 | 1.000 | 0.976 | 0.898 | -0.014 | e1570 |
| S2n | 90 | 91 | 0.967 | 0.978 | 0.972 | 0.906 | -0.015 | e1571 |
| R1c | 148 | 173 | 0.607 | 0.709 | 0.654 | 0.287 | -0.034 | e1572 |
| S4guitar | 369 | 372 | 0.804 | 0.810 | 0.807 | 0.607 | -0.015 | e1573 |

Recall by voice on S2n: bass 48/48, melody 40/42 (e1571). On R1c the matched onsets come a median 33.7 ms before the
truth onsets (95th percentile of the absolute difference 47.1 ms, largest 48.6 ms); with a 100 ms onset tolerance
(`--onset-tol 0.1`) R1c gives 119 matched, P 0.688, R 0.804, F1 0.741, onset+offset F1 0.349 (e1574).

Frame-level multi-pitch with the lane's `scripts/score_multipitch.py` (as in the Essentia multi-pitch table: mir_eval
0.8.2 on a 10 ms grid, notes put on the grid; the script reads `.mid`, so it was given `.mid` links to the `.midi`
files; results in `samples/onsets-frames/scores/multipitch-*.json`, no gtr-eval id): S2n P 0.860 / R 1.000 / Acc
0.860; S4guitar 0.835 / 0.810 / 0.698; R1c 0.737 / 0.730 / 0.579.

Samples: `samples/onsets-frames/` (the four MIDI files, `scores/`, `run_facts.json`, the GNU time and ledger lines).
MIDI for other lanes: `/home/user/gtr/lanes/audio-to-notes/out/onsets-frames/<clip>.wav.midi` (and `<clip>.mid`
links).

### Gap round 1: self-check (not a separate verification)

At 23:50 UTC the agent compared the 13 eval ids cited in this round (e1478 to e1485, e1570 to e1574) with
`evals.jsonl`: every value in the tables and the text matches its stored result, all are gtr-eval 0.11.1 with exit
code 0. Run figures (r0516, r0517, r0545: wall, CPU = user + sys, peak RSS, cores, slot wait, input files) match
`runs.jsonl`. Every `samples/` and `scripts/` path named in this round exists. On the shared disk, 8.6 GB were free at
the end; the round's venvs, weights and the downloaded CPython 3.8.20 were removed, and so were the uv cache entries
that only its installs had added (about 2.0 GB from Onsets and Frames, 39 MB from RMVPE), except small ones: three
source-built archives of 10 MB in all (librosa 0.7.2, mir_eval 0.7, pretty_midi 0.2.9) and a 6 MB setuptools 75.3.4
archive from the Omnizart build attempt. No separate verifier has checked this round. (A separate check followed:
"Verification log (verify-gapfill-audio-to-notes, round 1, 2026-11-11)" at the end of this file.)

## Gap round 2

Agent: `gapfill-audio-to-notes` (second round), 2026-11-11 from 00:20 UTC. Items, in this order: the nine gaps the
completeness critic listed for this lane (`docs/guitar-tab-research/GAPS.md`, rows A1 to A9), then the two PyPI
packages that repackage MT3-family models (`mt3-infer`, `yourmt3`; survey.md sections 36 and 37). At the start the
shared disk had 7,247 MB free and the box's disk notice was printing (it prints below 9,000 MB: "start no new download
or install over 200 MB unless your lane cannot finish without it ... pick the smallest checkpoint a model offers");
this round's rule was to keep at least 4 GB free. Each item's result is below, under the item's id; corrections made
elsewhere in this file carry "(corrected in gap round 2: ...)". `tools.json` changes are made by
`scripts/gap2/update_tools_json.py`.

### A1. PENN: recorded as tried although no run produced output

- The ledger has two PENN runs, both `--nolock` and both failed: r0399 (wall 4.91 s, CPU 3.89 s, peak RSS 258.3 MB,
  exit 1) and the verifier's r0423 (wall 5.41 s, CPU 3.75 s, peak RSS 257.4 MB, exit 1), each stopping at `import
  penn` ("Could not find any lib files matching version pt215cpu"; see "From the docs lane's survey" above). This
  file already called PENN NOT RUN HERE; `tools.json` had `tried: true` and gave r0423's exit code as null. Changed
  in `tools.json`: `tried: false`, `tried_how: null`, a new field `attempt_status` ("attempted, no output"), r0423
  exit code 1, and the two runs' wall and peak memory from the ledger. A run needs torch 2.6 to 2.11 (torbi 1.4.1's
  compiled files); the steps are in `for-aaron.md`, section 12. No run was made in this round.

### A2. SoX: input preparation without a ledger id, license not quoted

- SoX made one lane input, `inputs/S7flat30.plus30c.wav` (the Basic Pitch tuning-correction test). It is input
  preparation, not a transcription trial; the 2026-11-10 command had no ledger line. In this round the same command
  ran through `gtr-run`: run **r0602** (`--nolock`, unpinned, light; wall 0.26 s, CPU 0.24 s, peak RSS 9.7 MB, exit
  0), `sox /home/user/gtr/inputs/S7flat30/S7flat30.wav S7flat30.plus30c.wav pitch 30` (input SHA-256 6caa284f...
  c208363c in the ledger). Its output (24.00 s, 2 channels, 44,100 Hz, 16-bit by `soxi`) is not byte-identical to
  the kept file: SHA-256 4f54aac7...ed91933b against 31f6f3a9...42c42eef; the two files differ by at most 2 in
  16-bit sample units, in 942,526 of 2,116,800 samples. Two further runs of the same command (not logged) also gave
  two different files, differing from each other by at most 2 units; two runs with SoX's `-R` gave byte-identical
  files; one run with `-D` differed from the kept file by at most 1 unit (`samples/sox/gap2-sox-determinism.txt`).
  SoX's man page (the `sox.1` source in the SoX repository,
  https://sourceforge.net/p/sox/code/ci/master/tree/sox.1?format=raw, read 2026-11-11): "by default, SoX
  automatically adds TPDF dither when the output bit-depth is less than 24 and any of the following are true", one
  of which is "an effect has increased effective bit-depth within the internal processing chain"; and for `-R`: "Run
  in `repeatable' mode. When this option is given, where applicable, SoX will embed a fixed time-stamp in the output
  file (e.g. AIFF) and will `seed' pseudo random number generators (e.g. dither) with a fixed number, thus ensuring
  that successive SoX invocations with the same inputs and the same parameters yield the same output." The r0602
  output is kept at `out/sox/S7flat30.plus30c.r0602.wav`; the Basic Pitch run r0319 read the 2026-11-10 file, which
  was not replaced.
- License (read 2026-11-11 from the SoX repository on SourceForge). `COPYING`
  (https://sourceforge.net/p/sox/code/ci/master/tree/COPYING?format=raw): "SoX source code is distributed under two
  main licenses. The two licenses are in the files LICENSE.GPL and LICENSE.LGPL." and "sox.c, and thus SoX-the user
  application, is distributed under the GPL, while the files that make up libsox are licensed under the less
  restrictive LGPL." `LICENSE.GPL` is the "GNU GENERAL PUBLIC LICENSE Version 2, June 1991" and `LICENSE.LGPL` the
  "GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999". `src/sox.c`
  (https://sourceforge.net/p/sox/code/ci/master/tree/src/sox.c?format=raw): "This program is free software; you can
  redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free
  Software Foundation; either version 2 of the License, or (at your option) any later version." `src/tempo.c`, which
  holds the `pitch` effect (https://sourceforge.net/p/sox/code/ci/master/tree/src/tempo.c?format=raw): "This library
  is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License
  as published by the Free Software Foundation; either version 2.1 of the License, or (at your option) any later
  version." The box's SoX is the Ubuntu package `sox` 14.4.2+git20190427-4build4 (`dpkg -l`).

### A3. CREPE Notes (`crepe-notes` 0.2.0) on this lane's torchcrepe f0 (ran)

- What: "Post-processing for the CREPE pitch tracker to turn f0 pitch estimates into discrete notes (MIDI)" (survey.md
  section 12): it reads a frame-wise f0 with a confidence, finds note boundaries where the confidence dips and the
  pitch changes, splits repeated notes at madmom `CNNOnsetProcessor` onsets, estimates a tuning offset, and writes one
  MIDI file. PyPI `crepe-notes` 0.2.0 (uploaded 2026-03-13; author Xavier Riley; license field "GNU General Public
  License v3.0 license"), wheel `crepe_notes-0.2.0-py2.py3-none-any.whl`, 24,637 bytes, SHA-256 ea448d8d...54d8789e12.
  It has no weights of its own; madmom's onset CNN (`madmom/models/onsets/2013/onsets_cnn.pkl` in the installed
  package, CC BY-NC-SA 4.0, item A4) is the only trained model it runs when given `--f0`.
- Install (Python 3.11, worked first time; log `samples/crepe-notes/logs/install-crepenotes.log`): a new venv with the
  fingerstyle-voices-taps lane's `venv-madmom` packages at the same versions (numpy 2.4.6, scipy 1.17.1, mido 1.3.3,
  soundfile 0.14.0 and five more, from the shared uv cache); that lane's built `madmom` 0.17.dev0 package directory
  and its `.dist-info` copied in with `cp -a` (36 MB; nothing of the other lane's venv was changed); then `uv pip
  install --no-deps crepe-notes==0.2.0`, and its other declared dependencies with numpy and scipy held: `uv pip install
  -c <numpy==2.4.6, scipy==1.17.1> "click>=8.0" "librosa>=0.10.0" pretty_midi tqdm matplotlib` (33 packages, all from
  the uv cache: librosa 0.11.0, numba 0.68.1, pretty-midi 0.2.11.post0, matplotlib 3.11.2, click 8.5.1, tqdm 4.70.1).
  matplotlib is not among the package's declared requirements (`Requires-Dist`: Click, librosa, numpy, scipy, madmom,
  pretty_midi, tqdm, and the tracker extras), but `crepe_notes/crepe_notes.py` line 6 is `import matplotlib.pyplot as
  plt`, so the CLI does not start without it. Venv 568 MB by `du` (mostly hard links into the uv cache), deleted after
  the runs; freeze `samples/crepe-notes/uv-pip-freeze-venv-crepenotes-py3.11.txt` (madmom appears there as `madmom @
  git+https://github.com/CPJKU/madmom@27f032e8...`, from the copied `direct_url.json`).
- Input preparation (`scripts/gap2/prep_crepenotes_inputs.py`): `--f0` is read with `np.genfromtxt(..., names=True)`
  and only the columns named `frequency` and `confidence` are used, 10 ms per row (`parse_f0`); this lane's
  torchcrepe files have the header `time_s,frequency_hz,confidence` (viterbi decoder, fmin 50, fmax 2006 Hz, 10 ms,
  periodicity as the confidence; torchcrepe section above). Three inputs per clip: `tcfull` (torchcrepe `full`, header
  renamed to `time,frequency,confidence`, values unchanged), `tctiny` (the same for `tiny`), `tcfullz` (`full` with the
  frequency set to 0 in frames whose periodicity is below 0.21, which is what CREPE Notes' own torchcrepe backend does:
  `pitch_np[periodicity_np < 0.21] = 0.0`; 199 of 2,984 S1 frames, 1,750 of 2,934 R1b frames, 546 of 3,875 S4lead
  frames). Audio: the file each f0 was computed from, symlinked as `<clip>.wav` into each configuration folder under
  `out/crepe-notes/` (S1 and R1b `<id>.mono.wav`, S4lead `S4/stems/lead.wav`).
- Run: `scripts/gap2/batch_crepenotes.sh`: per clip and configuration, `crepe_notes --f0 <clip>.f0in.csv --use-cwd
  --output-label <cfg> <clip>.wav` (all other options at their defaults: `--sensitivity 0.001`, `--min-duration
  0.03`, `--min-velocity 6`, onset splitting on, tuning offset estimated), under GNU time. Run **r0616** (2 cores,
  cores 2-3; wall 35.19 s, CPU 35.1 s, peak RSS 570.9 MB, exit 0, 50.9 s waiting for a slot; inputs: the three audio
  files and the six torchcrepe f0 files with their SHA-256 in the ledger). Per call (GNU time, 9 calls): wall 3.17 to
  4.44 s, peak RSS 423 to 571 MiB; each call loads the audio and runs madmom's onset CNN on it (the log prints "Running
  onset detection..."), so the f0 step itself was not timed here (torchcrepe's own times are in its section above).
- Output: one MIDI file per call, `<clip>.<cfg>.mid`: type 1, 220 ticks per quarter, 2 tracks, one instrument with
  program 0 ("Acoustic Grand Piano" in the code), tempo 120, velocities from the amplitude envelope (7 to 127 here),
  no pitch bends; nothing else is written with these options. The log prints the estimated tuning offset ("Tuning
  offset: 6.000000000000005 cents" on S1), which is subtracted before pitches are rounded. In the `tcfullz` outputs,
  frames set to 0 Hz became notes with MIDI pitch 0 (S1 1, R1b 51, S4lead 3; the code maps 0 Hz through `hz_to_midi`
  and `np.nan_to_num(..., neginf=0)`); in the `tcfull` and `tctiny` outputs, R1b has 48 and 52 notes at MIDI 90 or
  above (up to 95, about 1,975 Hz), from the frames at 1,500 Hz or above that the torchcrepe viterbi output holds on
  R1b (torchcrepe section above).

Scores (gtr-eval 0.11.1, notes, onset 50 ms / pitch 50 cents; S1 and R1b against all truth notes, S4lead against the
S4 truth's `melody` voice, as for the other tools here):

| clip | f0 input | printed tuning offset (cents) | est. notes | truth notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | tcfull | 6 | 62 | 62 | 0.984 | 0.984 | 0.984 | 0.984 | 0.009 | e1781 |
| S1 | tctiny | 6 | 62 | 62 | 1.000 | 1.000 | 1.000 | 1.000 | 0.009 | e1786 |
| S1 | tcfullz | 6 | 61 | 62 | 0.967 | 0.952 | 0.959 | 0.959 | 0.009 | e1789 |
| R1b | tcfull | 20 | 94 | 70 | 0.309 | 0.414 | 0.354 | 0.244 | -0.009 | e1783 |
| R1b | tctiny | 27 | 95 | 70 | 0.263 | 0.357 | 0.303 | 0.170 | -0.009 | e1787 |
| R1b | tcfullz | 6 | 97 | 70 | 0.289 | 0.400 | 0.335 | 0.251 | -0.009 | e1790 |
| S4lead | tcfull | 6 | 38 | 37 | 0.737 | 0.757 | 0.747 | 0.667 | 0.029 | e1785 |
| S4lead | tctiny | 4 | 38 | 37 | 0.868 | 0.892 | 0.880 | 0.773 | 0.031 | e1788 |
| S4lead | tcfullz | 6 | 40 | 37 | 0.675 | 0.730 | 0.701 | 0.623 | 0.029 | e1791 |

- Input facts: an audio path (read with librosa at its own sample rate for the amplitude envelope, and by madmom for
  onsets) plus, here, an f0 CSV with `frequency` and `confidence` columns at 10 ms per row; without `--f0` it runs
  the tracker named by `--pitch-tracker` (crepe, pesto, penn, torchcrepe; each an optional extra not installed here).
- Constraints accepted: `--tuning-offset` (cents), `--min-duration`, `--min-velocity`, `--sensitivity`,
  `--disable-splitting`, `--use-smoothing`; not changed in this run. No pitch range, capo or string input.
- Samples: `samples/crepe-notes/` (the nine MIDI files, `scores/`, `logs/` with each call's output and the install
  log, `facts.jsonl` from `scripts/gap2/crepenotes_facts.py`, the freeze). Full outputs and the f0 copies:
  `/home/user/gtr/lanes/audio-to-notes/out/crepe-notes/<cfg>/`.

### A4. madmom: described as not installable here; license id

- This lane wrote that madmom's only PyPI file is a source archive, so installing it "means compiling it", and did
  not attempt it. madmom is installed on this box by two other lanes: chords-beats-key built 0.16.1 from the PyPI
  source archive on Python 3.9 (`uv pip install --no-build-isolation madmom==0.16.1` with numpy 1.23.5 and Cython
  below 3, run r0047, 36.9 s wall on 2 cores; its `trials.md`, section "madmom 0.16.1"), and fingerstyle-voices-taps
  installed 0.17.dev0 from `git+https://github.com/CPJKU/madmom` (commit 27f032e8) on Python 3.11 (37 MB; its
  `trials.md`, section "madmom 0.17.dev0"). In this round, item A3 ran madmom 0.17.dev0 inside CREPE Notes from a
  copy of the fingerstyle lane's built package. The statements in "From the docs lane's survey" above and in
  `tools.json` now point to these installs.
- License id. madmom's `LICENSE` (https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE, read 2026-11-11) gives
  source code files a license with two numbered conditions, "1. Redistributions of source code must retain the above
  copyright notice, this list of conditions and the following disclaimer." and "2. Redistributions in binary form must
  reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.", and no third clause; that is the text of the SPDX
  identifier `BSD-2-Clause`. Data and model files: "All model and data files are distributed under the following
  license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0" (`CC-BY-NC-SA-4.0`). This lane's `tools.json` said
  `BSD` and now says `BSD-2-Clause` (chords-beats-key uses `BSD-2-Clause`; fingerstyle-voices-taps uses `BSD`, not
  changed here).

### A5. melodyExtraction_JDC, melodyExtraction_SSL, MTANet, Deep Salience: what each needs (NOT RUN HERE)

One shallow clone of each repository was read on 2026-11-11 (README, requirement files, imports, tracked weight files;
`samples/gap2-melody-extraction/not-run.txt` lists the files with their sizes and the heads). None of the four has a
package on PyPI from its authors; each runs from its own repository's scripts.

| repository (head) | framework and versions it names | weights in the repository | how it is run, output |
|---|---|---|---|
| `keums/melodyExtraction_JDC` (86e6d2b, 2019-12-27) | README "Dependencies": "Keras 2.2.2", "Librosa 0.6.2", "madmom 0.16.1", "Python 3.6+", hardware "2 GPU : GeForce GTX 1080ti"; no TensorFlow version named; the code imports `keras.utils.multi_gpu_model`, `keras.layers.advanced_activations` and reads `_keras_shape` | yes: `weights/ResNet_joint_add_L(CE_G).hdf5` 16,867,888 bytes, `weights/model.json` 5,376, two normalisation arrays of 127,304 bytes | `python melodyExtraction_JDC.py -p <audio> -o <dir>` (`-gpu` defaults to `None` in the code, "It will run with cpu if None"); writes `pitch_<file name>.txt`, time (10 ms) and Hz per line |
| `keums/melodyExtraction_SSL` (eb2525d, 2021-09-14) | README: "Keras 2.3.0", "Librosa 0.7.0", "madmom 0.16.1", "pysndfx 0.3.6 (for randAudioAugment)", "Python 3.7+", "1 GPU : GeForce GTX 1080ti"; no TensorFlow version named | yes: `weights/ResNet_NS.hdf5` 17,056,656 bytes and the same two arrays | `python melodyExtraction_NS.py -p <audio> -o <dir>`; the same `pitch_<file name>.txt` layout |
| `Annmixiu/MTANet` (2856a89, 2024-05-27) | PyTorch and PyTorch Lightning (imports in `main.py`); no requirements file, no versions | none: no checkpoint file is tracked, `config.py` has `resume_checkpoint = None` with a commented path `model_backup/TO-FTANet_adc_best.ckpt`, and the README links only the training datasets | `main.py` trains and tests; it imports `model.msnet`, `model.multi_dr`, `model.ftanet`, `model.mcdnn` and `model.danet`, while the repository holds `msnet.py`, `ftanet.py` and `mcdnn.py` under `model/control group model/` and no `multi_dr.py` or `danet.py` |
| `rabitt/ismir2017-deepsalience` (4b2ff44, 2019-11-22) | `replicate.yaml`: `python_version: 2.7.15`, `tensorflow==1.12.0`, `keras==2.0.3`, `librosa==0.5.0`, `mir_eval==0.4`, `pescador==1.0.0`, `joblib==0.11`, system `ffmpeg`; `requirements.txt`: `pescador>=1.0.0`, `keras>=2.0.3`, `librosa>=0.5.0`, `mir_eval>=0.4`, `medleydb>=1.2.9` | yes: seven `predict/weights/*.h5` (bass, melody1, melody2, melody3, multif0, pitch, vocal), 1,674,464 to 1,674,816 bytes each; the whole clone is 406 MB, mostly comparison outputs and figures | `python predict/predict_on_audio.py <audio> <task> <save_dir> [-f singlef0\|multif0\|salience]` (survey.md section 23) |

- Run attempt (one, the smallest): `predict/predict_on_audio.py --help` of the Deep Salience clone, in a bare Python
  3.11 venv, through `gtr-run --nolock`, about 00:36 UTC. The session's permission system refused the whole command:
  "Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]."
  Nothing of it ran (no venv, no folder, no ledger line afterwards). No venv on the box held TensorFlow or Keras (no
  `tensorflow` or `keras` package in any `venv*` folder one or two levels under `/home/user/gtr/lanes/`, checked at
  00:35 UTC), and the gap round 1 venv `venv-oaf` (TensorFlow 2.9.1) had been deleted; it
  was not rebuilt, because running any of these four needs code from its cloned repository, which was refused here.
- So: NOT RUN HERE. JDC, SSL and Deep Salience have weights in their repositories: steps in `for-aaron.md`, section
  13. MTANet publishes no weights, so there is nothing to run without training it; no steps. The clones were deleted
  after reading. The reasons in "From the docs lane's survey" above and in `tools.json` now say this.

### A6. Essentia `PitchYinProbabilistic`: the sine check with every parameter set (ran)

- Run **r0647** (`--nolock`, light; wall 10.57 s, CPU 10.5 s, peak RSS 153.1 MB, exit 0):
  `scripts/gap2/check_essentia_pyin_explicit.py` with the fingerstyle-voices-taps lane's `venv-essentia` (Python
  3.11, `essentia` 2.1b6.dev1389, the version of this lane's `essentia-tensorflow` wheel; run with `python -I`, nothing
  written into that venv). Same signals as the first check: 1 s of a 0.5-amplitude sine at 44.1 kHz, at 110, 220,
  369.99 and 440 Hz. Output: `samples/essentia-pyin/gap2-sines-explicit.txt`.
- The build's defaults, printed with `paramValue`: `PitchYinProbabilistic` frameSize 2048, hopSize 256,
  lowRMSThreshold 0.1, outputUnvoiced "negative", preciseTime false, sampleRate 44100; its HMM stage
  `PitchYinProbabilitiesHMM` minFrequency 61.735 Hz, numberBinsPerSemitone 5, selfTransition 0.99, yinTrust 0.5.
- With `sampleRate=44100, frameSize=2048, hopSize=256, lowRMSThreshold=0.1` set explicitly and `outputUnvoiced`
  "negative", "zero" or "abs", the outputs are those of the first check: median 103.826 Hz for the 110 Hz sine,
  138.591 for 220, 146.832 for 369.99, 293.665 for 440 (166 frames each, all above 0 Hz, so `outputUnvoiced` changes
  nothing here). With `preciseTime=true` (the reference page: "use non-standard precise YIN timing (slow)") the
  medians are 110.0, 110.0, 73.416 and 61.735 Hz. Every value is the frequency of a whole MIDI number (103.826 = MIDI
  44, 138.591 = 49, 146.832 = 50, 293.665 = 62, 73.416 = 38, 61.735 = 35).
- Where the grid comes from. The frame-level stage `PitchYinProbabilities` (same settings) returned its pitch
  candidates as whole MIDI numbers: for the 440 Hz sine, frame 83: 81, 69, 62, 57, 53, 50, 47, 45, 42, ... with
  probabilities 0.05 each for the first seven and 0.0557 for the eighth; for 110 Hz: 56, 44, 37, 32, 29 (0.20, 0.20,
  0.20, 0.2016, 0.04), where 110 Hz itself would be MIDI 45. Essentia's source at `master` (read 2026-11-11) converts
  each candidate with `Real pitchCents = hz2midi(_freq[iCandidate], 440.0);`
  (https://raw.githubusercontent.com/MTG/essentia/master/src/algorithms/tonal/pitchyinprobabilities.cpp, line 324),
  and `hz2midi` returns an integer: `inline int hz2midi(Real hz, Real tuningFrequency) { return 69 + (int)
  round(log2(hz / tuningFrequency) * 12); }`
  (https://raw.githubusercontent.com/MTG/essentia/master/src/essentia/essentiamath.h, line 750). The HMM stage then
  outputs, per frame, the candidate closest to its decoded state, `440. * pow(2, (pitchCandidates[iFrame][iPitch] -
  69) / 12)` (`pitchyinprobabilitieshmm.cpp`), so every output is a whole-MIDI frequency. Feeding the frame-level
  candidates to `PitchYinProbabilitiesHMM` with its defaults gave the same medians as the composite algorithm. That
  the dev1389 wheel was built from these same lines was not checked (the run shows the same behaviour).
- What stays UNVERIFIED: why the candidate set and its near-equal probabilities lead the HMM to a value below the
  sine's pitch (for 110 and 220 Hz the sine's own MIDI number is not among the frame's candidates), and why the clip
  outputs differed between r0321 and the verifier's r0430 in a few frames. The RPA figures e1011 to e1023 are
  measurements of this output as it is; they are not changed. (corrected in gap round 2 in the Essentia section
  above: the cause of the grid is no longer "UNVERIFIED".)

## Outputs for other lanes (on the box, outside git)

All under `/home/user/gtr/lanes/audio-to-notes/out/`:

- MIDI, one file per clip: `basic-pitch/<clip>.mid` (TFLite defaults; links into `basic-pitch/tflite-default/`, plus
  `R3b.mid` and `R3c.mid`), `basic-pitch/tflite-guitar-range/`, `basic-pitch/onnx-default/`,
  `basic-pitch/handoff-htdemucs6s/` (on the separation lane's stems), `transkun/<clip>.mid`. For tools that only
  write note lists, `swiftf0/<clip>.mid`, `aubio/<clip>.mid` and `essentia-melodia/<clip>.mid` were written by
  `scripts/notes_csv_to_midi.py` (a lane conversion: one track, program 24, velocity 80, 120 BPM, 480 ticks per
  quarter; pitches as in the CSV, aubio's float pitches rounded to integers; times rounded to the MIDI tick of
  1/960 s: the verifier found at most 0.52 ms between a CSV time and its MIDI time over the 24 files).
- Note lists (CSV, `onset_s,offset_s,pitch_midi[,...]`, or Basic Pitch's own layout): `<tool>/.../<clip>.notes.csv`.
- f0 tracks (CSV `time_s,frequency_hz[,confidence]`): `<tool>/f0/<clip>.f0.csv` for swiftf0, pyin, fcpe, pesto,
  torchcrepe-tiny, torchcrepe-full, essentia-melodia, essentia-pyin, essentia-crepe-tiny, essentia-crepe-full, and
  `aubio/<clip>.f0.csv`.
- Clips without truth (output kept only): R2, R3a (f0 tools, aubio, Basic Pitch), R3b, R3c (Basic Pitch).
- Basic Pitch raw model outputs: `basic-pitch/*/<clip>.model_output.npz` (keys `note`, `onset`, `contour`).
- Gap round 1: RMVPE f0 tracks `rmvpe/f0/<clip>.f0.csv` (`time_s,frequency_hz,confidence`, raw, 10 ms; S1, S2n, S2s,
  S4, S4lead, R1b, R2, R3a) and the CLI's `rmvpe/cli/S1.csv`; Onsets and Frames MIDI `onsets-frames/<clip>.wav.midi`
  (S1, S2n, R1c, S4guitar; `<clip>.mid` links to the same files). The `<clip>.wav` entries in `onsets-frames/` are
  symlinks to the shared inputs, not copies.
- Gap round 2: CREPE Notes MIDI `crepe-notes/<cfg>/<clip>.<cfg>.mid` (cfg `tcfull`, `tctiny`, `tcfullz`; clips S1,
  R1b, S4lead; the `<clip>.wav` entries there are symlinks to the shared inputs).

## Media kept outside git

No tool in this lane wrote audio or video (Basic Pitch's `--sonify-midi` was not used; in gap round 1 neither RMVPE nor
Onsets and Frames wrote audio, and `out/onsets-frames/<clip>.wav` are symlinks to the shared input files). One audio file was made as a
lane input: `/home/user/gtr/lanes/audio-to-notes/inputs/S7flat30.plus30c.wav` (4,233,644 bytes, 24.000 s, 44.1 kHz
stereo 16-bit): the shared clip S7flat30 shifted up 30 cents with `sox ... pitch 30`, for the tuning-correction test
in the Basic Pitch section. It is derived from the synthesized clip S7flat30 (license and attribution as for
S7flat30 in the inputs manifest). The verifier re-measured it: 4,233,644 bytes, SHA-256 31f6f3a9...42c42eef, 2
channels, 44,100 Hz, 16-bit, 24.00 s (`soxi`), SoX v14.4.2.

Gap round 2 added: `/home/user/gtr/lanes/audio-to-notes/out/sox/S7flat30.plus30c.r0602.wav` (4,233,644 bytes,
SHA-256 4f54aac7...ed91933b, 24.00 s, 44.1 kHz stereo 16-bit): the same SoX command logged as run r0602 (item A2 of
"Gap round 2"; it differs from the file above by SoX's dither). Derived from S7flat30, as above.

## Verification log (verify-trials-audio-to-notes, 2026-11-10)

Checked by `verify-trials-audio-to-notes`, 22:24 to 22:56 UTC. Scripts: `scripts/verify_trials/`; small
outputs: `samples/verify-trials/`; re-run outputs and rebuilt venvs on the box under
`/home/user/gtr/lanes/audio-to-notes/verify/` (venvs and downloaded weights deleted afterwards).

**What was checked, and the result**

- Ledgers. All 27 run ids and all 181 eval ids cited in this file exist; every cited eval is gtr-eval 0.11.1 with
  exit code 0. Every table row and every inline number with an eval id (P / R / F1, onset+offset F1, median onset
  difference, truth and estimate counts; RPA, RCA, voicing recall and false alarm, overall accuracy; recall by voice;
  timing statistics) was compared with the stored result of that id: all match. Run figures (wall, CPU, peak RSS,
  cores, slot wait, exit code, input hashes) match `runs.jsonl`; the per-tool GNU time figures match
  `samples/_timing/` (KiB / 1024 conversions recomputed), and the r0321 and r0234 batch walls equal the sums of their
  tools' GNU time walls to within 0.2 s.
- Re-scoring. All 181 cited evals were re-run with gtr-eval `--no-ledger` from their stored arguments: same estimate
  SHA-256 and a byte-identical result object in 181 of 181 (`samples/verify-trials/rescore_cited_evals.tsv`,
  `scripts/verify_trials/rescore_cited_evals.py`). The 168 eval references inside `samples/**/scores*.json` match the
  ledger.
- Independent recomputation in mir_eval 0.8.2 with the verifier's own code
  (`scripts/verify_trials/independent_mir_eval.py`, output `samples/verify-trials/independent_mir_eval.txt`), equal to
  the reported values at 3 decimals: onset-only F1 of Basic Pitch S1 0.968, Transkun S1 0.992, ByteDance S2n 0.893,
  aubionotes S1 0.048 (50 ms) and 0.984 (100 ms), SwiftF0 notes S1 0.836, Melodia + PitchContourSegmentation S1
  0.747, FCPE into PitchContourSegmentation S1 0.873, Basic Pitch on the htdemucs_6s bass stem 0.453; S1 RPA of
  SwiftF0 0.961, pyin 0.958, FCPE 0.990, PESTO 0.987, torchcrepe tiny 0.982 and full 0.986, Melodia 0.693,
  PitchYinProbabilistic 0.495, Essentia CREPE tiny 0.982 and full 0.990, aubiopitch 0.957; torchcrepe tiny R1b RPA
  0.442 (viterbi) and 0.848 (weighted_argmax); multi-pitch P / R / Acc of MultiPitchKlapuri S2n 0.722 / 0.803 /
  0.613 and R1c 0.516 / 0.403 / 0.293, MultiPitchMelodia S2n 0.942 / 0.481 / 0.467. The multi-pitch table matches
  `samples/multipitch_scores.json`; the lane's self-check (truth notes as the estimate) gives 1.0 on S2n.
- Output files. Every file and folder named in this file exists. Recounted from the files: note counts of Basic
  Pitch (16 clips in each of the three configurations, R3b / R3c, the handoff stems, the tuning test, Drop D), SwiftF0,
  aubio, Transkun and ByteDance; first-note lists; MIDI facts (ticks per quarter, tempo, program, pitch-bend and
  controller counts); CSV headers and first rows; `.npz` keys and shapes; the ONNX-versus-TFLite differences (13 of
  16 lists identical; S3 4 notes, S6taps 1, S7flat30 1; largest model-output differences 0.00014 / 0.00026 /
  0.00056); recall by voice; truth facts (35 of 61 S4 bass notes below E2, lowest MIDI 31; the four D2 notes of
  S5dropd); per-clip seconds in every `timings.json`; the torchcrepe frames at or above 1500 Hz; the multi-pitch frame
  facts; the contour-segmentation NaN counts (FCPE R1b 7, torchcrepe full R1b 5); the separation lane's stems still
  have the SHA-256 recorded in r0243. The 27 sample copies compared are byte-identical to the box outputs.
  PitchYinProbabilistic's outputs lie on the equal-tempered grid (within 0.012 cents on S1, R1b, S4lead).
- Re-runs from the recorded commands (venvs rebuilt with `uv pip install --offline` from the saved freezes, same
  scripts; comparison in `samples/verify-trials/rerun_compare.txt`, timings in `samples/verify-trials/rerun_timings.txt`):
  - **r0464** (gtr-run slot, cores 2-3; wall 244.24 s, CPU 249.4 s, peak RSS 1,447.9 MB, exit 0, 540.9 s waiting
    for a slot; `scripts/verify_trials/batch_verify.sh`): Basic Pitch TFLite S1 and S2n, librosa pyin S1, FCPE S1,
    PESTO S1, Essentia CREPE tiny S1, Transkun S1, ByteDance S2n (weights re-downloaded from Zenodo record 4034264:
    171,966,578 bytes, SHA-256 c3fa9730...07876141 as recorded): every output byte-identical to the trial's.
    torchcrepe tiny with its three decoders on R1b: different in every frame (random dither; see the torchcrepe
    section, e1405 to e1407).
  - `--nolock` (light, single-threaded or under 10 s): r0426 aubio on 8 clips, r0427 SwiftF0 on 8 clips, r0429
    Essentia Melodia + PitchContourSegmentation on 8 clips, r0431 MultiPitchKlapuri and MultiPitchMelodia on S2n,
    r0432 the contour-segmentation handoff: every output byte-identical. r0430 PitchYinProbabilistic on 8 clips: not
    identical (see the Essentia section, e1402 to e1404); its pure-sine check reproduced exactly.
  - Failures reproduced: r0423 `import penn` ("Could not find any lib files matching version pt215cpu"); r0475 the
    ByteDance package's `load_audio()` with librosa 0.11.0 ("AttributeError: No librosa.core attribute audio"); r0476
    the Basic Pitch CLI in a venv without setuptools ("ModuleNotFoundError: No module named 'pkg_resources'", raised
    from `resampy/filters.py`).
  - The same commands took different times under a different box load: Transkun S1 83.7 s in r0216, 40.6 s in
    r0464; ByteDance S2n 75.8 s in r0401 (unpinned), 27.8 s in r0464 (model setup 8.6 s and 20.1 s); Basic Pitch S1
    `predict()` 20.36 s and 29.33 s; Essentia CREPE tiny S1 14.38 s and 6.00 s; PESTO S1 5.87 s and 8.94 s; pyin S1
    13.18 s and 16.42 s; FCPE S1 3.53 s and 3.55 s.
- Not-run reasons, re-read at the live source on 2026-11-10: PyPI JSON (the `tensorflow` 2.15.0 cp311 Linux wheel
  475,258,658 bytes; basic-pitch, omnizart, crepe-notes, madmom (source archives only), rmvpe-onnx (14,520-byte
  wheel), essentia-tensorflow releases, penn, torbi); `uv pip install --dry-run "basic-pitch==0.4.0"` repeated
  (Python 3.11: "Would install 65 packages" with `tensorflow==2.14.0`; 3.12 and 3.13: "No solution found"); the
  Hugging Face API (YourMT3 Space facts and its five checkpoints, 361,050,039 to 758,957,292 bytes, the default
  561,544,628; `akhaliq/MT3` and `cwitkowitz/timbre-trap` in RUNTIME_ERROR; `tt-orig.pt` 11,353,410 bytes;
  `rmvpe.onnx` 361,688,443 and `rmvpe.pt` 181,184,272 bytes; `MuScriptor/muscriptor-small` gated `auto`,
  `cc-by-nc-4.0`, `model.safetensors` 411,888,600 bytes; `fcnf0++.pt` 107,245,425 bytes, `mit`); the READMEs of
  CREPE, MT3 (and its Colab notebook), MR-MT3, hFT-Transformer (and `checkpoint.zip`, Content-Length 20,540,269),
  Omnizart (and its Colab notebook), NeuralNote, Sheet Sage, PENN, rmvpe-onnx, torchcrepe, PESTO, FCPE and
  Timbre-Trap (and its `setup.py`); `git ls-remote` HEADs of `c4dm/pyin` (1d68cac9) and `sony/timbre-trap`
  (7afe7e9); the compiled-file lists of the torbi 1.4.1 Linux and Windows wheels; Tony's and Sonic Visualiser's
  source and download pages; the Vamp SDK's default Windows plugin path. The MTG MELODIA page was not requested again
  (a host that answered 403 is not retried); the trial agent's saved response is a Cloudflare "Just a moment..." page.

**What was changed in this file**

1. Transkun: its MIDI also holds CC67 (soft pedal) events in R1a, R1b and R1c (R1b: 2 CC67, no CC64); summary table
   and output facts.
2. ByteDance r0401: "both CPU slots had been held by other lanes' long jobs for over 40 minutes" replaced by the
   ledger timeline (cores 2-3 ran this lane's own r0321 until 21:52:44).
3. Basic Pitch: the failed CLI runs took 2.96 to 4.47 s (was "about 3 s"), all used `--model-serialization
   tflite`, and only the logs of r0033 to r0065 survive (dead end 2); the 4.5 MB `.npz` is the CLI's file (the lane's
   own copy is 3.7 MB); the order of the first-notes list is stated.
4. Essentia: the PitchCREPE first-frame example is the tiny model's (full added); PitchYinProbabilistic's
   run-to-run differences added; the other Essentia re-runs noted as byte-identical.
5. torchcrepe: its random dither and the re-run figures added.
6. PESTO and ByteDance package sizes: the `__pycache__` share stated.
7. Tools not run: the disk figures replaced by logged values ("fell below 5 GB later" had no support in the lane's
   logs); the pYIN and Timbre-Trap refusals marked as the trial agent's report; MT3's "No official Hugging Face Space"
   replaced by what its README and notebook show; the key-store sentence replaced by "No Hugging Face token was
   available to this session"; MR-MT3's README URL corrected (`main` answers 404, `master` holds the README quoted);
   hFT-Transformer: "running cloned repository code was refused" and "the task asked for one or two piano-trained
   models" removed (hFT was not attempted; the task text is not on file), README facts added; Omnizart: "the one
   install attempt the task allowed" removed; NeuralNote: "(refused here for pYIN already)" removed (no build was
   attempted); Sheet Sage's free-disk figure; the time R3b and R3c were added now follows the inputs manifest.
8. Converted MIDI files: times are rounded to the 1/960 s tick (largest difference 0.52 ms), not "unchanged".

**What was changed in `for-aaron.md`**

- The description of Aaron's laptop hardware removed (the rule on personal data); the steps now say "Aaron's Windows
  PC".
- YourMT3+: the Space's tab and button names, its `Download MIDI` link, and the Colab link the Space shows; the cost
  line limited to what was seen.
- MT3: steps rewritten from the notebook's own instructions (cell names, `MODEL` values `mt3` and `ismir2021`, GPU
  runtime, the Google Analytics note, the downloaded file name).
- NeuralNote: README quotes and the Compute device setting.
- MELODIA: the old steps put the Windows plugin into `C:\Program Files\Vamp Plugins` for Sonic Visualiser; the MTG
  page (docs lane's copy) lists an x86 Windows build for `C:\Program Files (x86)\Vamp Plugins\` and Sonic Visualiser
  5.2.1 is offered for 64-bit Windows only, so the steps now use the Linux build with `vamp-simple-host` under WSL2
  (command form and default search path checked on this box; plugin key from the MELODIA author's wrapper script).
- Tony: export menu names taken from Tony's source (was "or the closest item").
- Omnizart: the Colab's upload cell takes MP3 and its music modes are `music-piano`, `music-piano-v2` and
  `music-assemble` (the old step uploaded a WAV and chose a `music` mode the notebook does not list).
- Sheet Sage: the WSL2 route marked UNVERIFIED; the output folder's contents quoted from the README.
- RMVPE: commands taken from its README.
- PENN: CPU by default (README), the output file names (`-pitch.pt`, `-periodicity.pt`), the torbi Windows wheel's
  range.

**Still UNVERIFIED**

- Why Essentia's PitchYinProbabilistic returns grid frequencies and differs between runs.
- The two permission refusals (pYIN build, Timbre-Trap code) and the failed Wayback Machine fetch: the trial agent's
  report, with no file on the box recording them.
- That the queued `batch2.sh` job waited about 48 minutes and was cancelled: only its empty log (created 21:29 UTC)
  and the 22:18 start of r0399 and r0401 are on file.
- Every route in `for-aaron.md` that needs Windows, WSL2, Docker, Colab or a web demo: none could be tried here.
- No runnable tool on the lane's list was found skipped without a recorded reason, so the verifier added no tool run.

## Verification log (verify-gapfill-audio-to-notes, round 1, 2026-11-11)

Checked by `verify-gapfill-audio-to-notes` from 23:53 UTC on 2026-11-10 to about 00:20 UTC on 2026-11-11: the section
"Gap round 1", the round's edits elsewhere in this file, in `survey.md`, `for-aaron.md` and `tools.json`, and its new
files under `samples/` and `scripts/` (the round's whole change is the difference between git commits 58786f2 and
d8c595c). Scripts: `scripts/verify_gap1/`; small outputs: `samples/verify-gap1/`; re-run outputs on the box under
`/home/user/gtr/lanes/audio-to-notes/verify-gap1/`. The re-runs' venvs and model files, the CPython 3.8.20 that uv
fetched again, and the uv cache wheels that only these re-installs had added and no venv used (about 1.9 GB; a few
small source archives stay) were deleted afterwards.

**What was checked, and the result**

- Ledger. The round's three runs are in `runs.jsonl` with the commands, input files and SHA-256, cores, wall, CPU
  (user + sys), peak RSS, slot wait and exit code given above: r0516 (cores 0-1; wall 34.68 s, CPU 54.9 s, 1,198.7 MB,
  0.0 s wait, exit 0), r0517 (`--nolock`; 7.40 s, 10.5 s, 1,007.6 MB, exit 0), r0545 (cores 2-3; 39.57 s, 42.2 s,
  1,151.0 MB, 329.3 s wait, exit 0). r0545's GNU time lines (user 40.19 s, sys 1.96 s, 1,178,656 KiB) match
  `samples/onsets-frames/gnu-time-and-ledger-line.txt`. No other run of this lane started during the round (the
  refused and failed commands never reached `gtr-run`), and no failed run is described as a success.
- Scores. The 13 eval ids of the round (e1478 to e1485, e1570 to e1574) are gtr-eval 0.11.1 with exit code 0, and every
  number cited from them here and in `tools.json` matches the stored result. All 13 were re-scored with `gtr-eval
  --no-ledger` from their stored arguments: byte-identical result objects and the same estimate SHA-256 in 13 of 13
  (`samples/verify-gap1/rescore_gap1.tsv`). The verifier's own mir_eval 0.8.2 code (not gtr-eval) gives the same
  values at 3 decimals for the Onsets and Frames onset-only P / R / F1 on S1, R1c and S4guitar and the RMVPE RPA / RCA on
  S1, S4lead and R1b (`samples/verify-gap1/indep_mir_eval_gap1.txt`). The three multi-pitch results, recomputed with
  `scripts/score_multipitch.py`, are identical.
- Files. Every `samples/` and `scripts/` path the round names exists, and the sample copies (RMVPE: three f0 CSVs, the
  CLI CSV, `timings.json`, eight score files; Onsets and Frames: four MIDI files, eight score files) are byte-identical
  to the box outputs. Recounted from the files: the RMVPE frames and frames at confidence >= 0.03 and >= 0.5 on all
  eight clips, the largest confidences, S1's first frame (567.215 Hz, 0.000261), a frequency in every frame, the 10 ms
  hop (`samples/verify-gap1/recount_rmvpe.txt`); the median and 90th-percentile confidence inside the truth notes and
  the share within 50 cents (equal to the RPA on all six clips), with the verifier's own code
  (`samples/verify-gap1/indep_conf.txt`); the Onsets and Frames MIDI facts (type 1, 220 ticks per quarter, 2 tracks,
  tempo 120, program 0, no control changes or pitch bends), note counts, velocity ranges and the first ten S2n notes
  (`samples/verify-gap1/recount_oaf.txt`); the per-file seconds from the run log; the facts taken from the saved logs
  (Omnizart: "Resolved 91 packages in 13.00s", the three "Building" lines, real 16.979 s; Onsets and Frames install:
  CPython 3.8.20, 122 packages, real 1 min 57.826 s).
- Re-runs, each with its venv rebuilt from the round's saved `uv pip freeze` (the rebuilt freeze is identical) and its
  model file downloaded again with the recorded size and SHA-256 (comparison: `samples/verify-gap1/rerun_compare.txt`):
  - **r0579**, RMVPE, `scripts/run_rmvpe.py` on the same 8 clips (2 cores, cores 0-1; wall 25.42 s, CPU 44.6 s, peak
    RSS 1,199.2 MB, exit 0, 0.0 s wait): all eight f0 CSVs byte-identical to r0516's. `predict()` took 14.15 s on S1
    (the first call) and 0.54 to 1.19 s on the others (r0516: 16.05 s and 1.13 to 2.44 s).
  - **r0581**, the RMVPE CLI on `S1.wav` (`--nolock`, light; wall 6.02 s, exit 0): CSV byte-identical to r0517's; the
    printed summary identical except "Time" (1639.4 ms; r0517 2902.0 ms).
  - **r0583**, Onsets and Frames, the r0545 command on the same four inputs (2 cores, cores 0-1; wall 38.72 s, CPU
    42.6 s, peak RSS 1,154.2 MB, exit 0, 0.0 s wait): all four MIDI files byte-identical to r0545's; per file 5.23,
    3.31, 3.57 and 5.10 s (S1, S2n, R1c, S4guitar; r0545 5.30, 4.07, 4.31, 4.97 s); the first file started about 20 s
    after the run's start. Its venv install took 55.4 s this time (the round's took 1 min 57.8 s).
- Refusals. The round's three "[Code from External]" refusals are in the gap agent's own session transcript on the box,
  as the results of Bash calls at 23:15:09, 23:21:24 and 23:29:08 UTC carrying the commands the record gives; so are the
  checks after them (no `venv-mt3`, no `out/mt3-pytorch`, no `venv-crepe`), and the install logs those commands would
  have written do not exist. `samples/mt3/permission-refusal.txt` and `samples/crepe/gap1-not-run.txt` now say so. The
  Omnizart failure is in its saved log. MR-MT3 and YourMT3+ on the CPU have no refusal of their own: they were not
  attempted, as the record says.
- Sources, re-read at their URLs on 2026-11-10 (23:59 UTC) and 2026-11-11: the rmvpe-onnx LICENSE (three MIT notices;
  the quoted grant is verbatim) and PyPI description (quotes verbatim, with its Markdown links read as their text); the
  0.2.3 wheel's `model.py`, `cli.py` and `weights.py` (mel settings, cents mapping, the 9-bin average, confidence as the
  largest sigmoid output, device providers, `_MODEL_SHA256`, the CLI help); the card of `lj1995/VoiceConversionWebUI`
  (21 bytes, "license: mit") and its API (revision e6d0c1a1, `rmvpe.onnx` 361,688,443 bytes with the cited LFS sha256);
  the mt3-infer LICENSE (quotes verbatim; the same text as its PyPI `license` field apart from whitespace) and PyPI
  JSON (version, dates, requirements and every quoted phrase); the PyPI JSON of yourmt3, magenta, omnizart (0.5.0,
  0.6.3 and the release list), crepe, vamp 1.1.0, wrapt 1.12.1 and madmom 0.16.1; the Hugging Face API of
  `gudgud1014/MR-MT3`, `shethjenil/Audio2Midi_Models`, `mimbres/YourMT3` and `mimbres/YourMT3-cpu` (revisions, license
  tags, card data, file sizes; the same five checkpoints in both Spaces), both Spaces' `app.py` and `requirements.txt`;
  the MT3 notebook (its install cell, the `mt3` and `ismir2021` settings); kunato's `inference.py`,
  `contrib/spectrograms.py` and `contrib/vocabularies.py`; MR-MT3's `inference.py` (`self.model.cuda()` at line 183);
  the PyTorch port's README (quote verbatim) and its file list at 783ca08 (no `.pt`, `.pth`, `.ckpt` or `.bin`);
  crepe's source archive (`setup.py` line 6 and `base_url`, `core.py`'s `tensorflow.keras` model and `load_weights`);
  vamp's source archive (`setup.py` line 3 is `import numpy as np`; no `pyproject.toml`); the storage headers of
  `maestro_checkpoint.zip`; the `git ls-remote` heads of the seven repositories cited; crepe's github.com weight URL
  still answers 403 and the raw.githubusercontent.com one 200 (1,307,310 bytes). Code, weights and data licenses are
  kept apart in the round's text and in `tools.json`.
- Language, size, privacy: no judging words in the round's text outside quotations of vendors' own descriptions (one
  unquoted case in `tools.json`, changed below); no audio or video and no file over 300 KB in this folder (`tools.json`
  is 275,947 bytes after the changes below); no key, token or personal detail.
- Earlier record: the earlier verification logs in this file and in `survey.md` are byte-identical to their state
  before the round; headings changed only where the round marked RMVPE, YourMT3+ and Onsets and Frames; `for-aaron.md`
  keeps its headings.

**What was changed in this file**

1. Summary: RMVPE and Onsets and Frames taken out of the "Not run here" list (the round had left them in it, next to a
   note that they ran); MR-MT3 and YourMT3+ marked as not attempted.
2. "Gap round 1" intro: the three refusals named (two for MT3, one for CREPE; it read "Three of those refusals" after a
   list of five tools), and MR-MT3 and YourMT3+ stated as not attempted.
3. MT3: the notebook's install line also carries `-f .../jax_cuda_releases.html`, which the round left out; the
   mt3-pytorch venv held torch and its dependencies only (its saved freeze), not the libraries `inference.py` imports.
4. YourMT3+: the heading says "not attempted" (was "permission system"); r0164 31.18 s and r0245 31.34 s are the
   hosted-apis lane's script-measured round trips (ledger walls 32.21 s and 33.78 s), "the timings on record for the
   CPU Space" (was "the CPU timings on record").
5. Omnizart: vamp 1.1.0 has two Python 2.7 wheels on PyPI (macOS, Windows) besides its source archive, so "PyPI has only
   as source archives" became "no wheel on PyPI for Linux and Python 3.8"; "built" became "started building" (the log
   has three "Building" lines and the failure, no "Built" line).
6. Onsets and Frames: the 20.5 s to the first file counts from the ledger's whole-second start time; now "about 20 s"
   with that note.
7. The round's self-check paragraph points to this log.

**What was changed elsewhere**

- `survey.md`: section 1 (CREPE): setuptools removed `pkg_resources` in 82.0.0 by its changelog (quoted, read
  2026-11-11), not "81 and later", and `setup.py` imports it on line 6 (was "begins with"); section 36 (mt3-infer):
  all six extras listed, and its "Not run here" names the two refusals and the two tools not attempted (was "could not
  be run"); section 37 (yourmt3): the name is in the `author_email` field (`author` is empty); tool-list line 16
  (YourMT3+): "not attempted after ..."; the "Gap round 1 additions" index points to this log.
- `for-aaron.md`, section 9: the CLI's `--plot` also shows an interactive plot (its help text quoted).
- `tools.json` (`scripts/verify_gap1/fix_tools_json.py`; formatting kept, 98 entries): mt3-infer's `what` quotes the
  vendor's "Production-ready ..." instead of stating it, and its `not_run_reason` reads as in `survey.md`; yourmt3's
  weights entry no longer reads as if the repository held seven files; YourMT3+ `not_run_reason`: no package from the
  authors (the third-party packages were not used) and what the two timings are; RMVPE and rmvpe-onnx `outputs`: the
  `--plot` option; Onsets and Frames: a `startup_note`; the re-runs r0579 and r0581 (RMVPE, rmvpe-onnx) and r0583
  (Onsets and Frames) added to `runs`.
- `samples/mt3/permission-refusal.txt`, `samples/crepe/gap1-not-run.txt`: where the refusals are recorded on the box.

**Still UNVERIFIED**

- Whether MT3, mt3-pytorch, MR-MT3, YourMT3+ (local CPU), the original CREPE package and Omnizart would run on this box
  if code from cloned repositories or local folders were allowed: not tried (the round's rule 8). For mt3-pytorch the
  requirements also do not resolve here (ddsp needs crepe, whose build fails), so a permission change alone would not
  be enough.
- The uv cache figures in the round's self-check (about 2.0 GB and 39 MB removed): checked only against the commands
  and outputs in the agent's transcript, not against the cache as it was then.
- Which training run produced `rmvpe.onnx`; the licenses of the MAESTRO checkpoint and of the
  `shethjenil/Audio2Midi_Models` files (no statement found); whether that repository holds the YourMT3 authors'
  checkpoints (hashes not compared).

