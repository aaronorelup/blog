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

## Summary: what ran here, and what each tool writes

| tool (version) | ran here | runs | output (fields, units) |
|---|---|---|---|
| Spotify Basic Pitch (0.4.0) | yes, TFLite and ONNX backends, Python API and CLI | r0234, r0243, r0249, r0264, r0319 | MIDI (one track, pitch bends), note-events CSV `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend...`, `.npz` posteriors |
| SwiftF0 (0.3.0) | yes | r0321, r0131 | f0 every 16 ms (Hz, confidence); notes from `segment_notes` (start, end, fitted Hz) |
| librosa `pyin` (librosa 1.0.0) | yes | r0321 | f0 every 23.2 ms (Hz or NaN), voiced flag, voiced probability; no notes |
| FCPE (torchfcpe 0.0.4) | yes | r0321 | f0 every 10 ms (Hz, 0 = unvoiced); no confidence, no notes |
| PESTO (pesto-pitch 2.0.1) | yes | r0321 | f0 every 10 ms (Hz), voicing confidence; no notes |
| torchcrepe (0.0.24), tiny and full | yes | r0321, r0287 | f0 every 10 ms (Hz), periodicity; no notes |
| aubio (0.4.9 CLI) | yes | r0130 | `aubiopitch`: time, Hz per 5.8 ms hop; `aubionotes`: MIDI pitch, onset, offset |
| Essentia (2.1b6.dev1389): Melodia + PitchContourSegmentation, PitchYinProbabilistic, PitchCREPE tiny/full | yes | r0321, r0341 | f0 per 2.9 ms (Melodia) / 5.8 ms / 10 ms; notes (onset, duration, MIDI) from PitchContourSegmentation |
| Transkun (2.0.1), piano-trained | yes | r0216 | MIDI (program 0, velocities, CC64 pedal) |

Not run here (reasons and evidence under "Tools not run here", steps in `for-aaron.md`): CREPE (TensorFlow
package), RMVPE, MELODIA Vamp plugin, pYIN Vamp plugin, Timbre-Trap, MT3, YourMT3+, MR-MT3, Onsets and Frames,
hFT-Transformer, Omnizart, NeuralNote, Sheet Sage, MuScriptor, CREPE Notes and the other survey additions listed
there.

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
  bytes). Package directory 840 KB.
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
  and note-off with velocity, sustain pedal as CC64 events (24 in S2n.mid), no pitch bends. First notes of S2n
  (start, end, pitch, velocity): `2.144-2.194 55 97`, `2.145-2.659 43 85`, `2.146-3.773 67 89`,
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
  ("ModuleNotFoundError: No module named 'pkg_resources'"); setuptools 80.10.2 (`<81`) fixes it, with a
  deprecation warning that pkg_resources "is slated for removal as early as 2025-11-30". (2) uv resolved numpy 2.2.6,
  and tflite-runtime 2.14.0 then fails to load the model ("AttributeError: _ARRAY_API not found", then "ValueError:
  File .../nmp.tflite cannot be loaded into either TensorFlow, CoreML, TFLite or ONNX"); `numpy<2` (1.26.4) fixes
  it. The CLI runs r0032, r0033, r0035, r0037, r0038, r0039, r0040 and r0065 (exit code 1, about 3 s each) are
  these failures. The TensorFlow backend (Python >= 3.11) was not installed: the `tensorflow` 2.15.0 cp311 Linux
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
    256 hop); S1 gives 2565 frames. The S1 `.npz` is 4.5 MB.
  - First S2n notes from the MIDI (start, end, pitch, velocity): `0.000-0.150 24 49` (inside the silent count-in
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
(e0535; the S4 bass part goes below E2); S5dropd bass recall 48/48 -> 44/48 (e0544; the four D2 notes, 73.4 Hz,
lie below the limit); S1, R1a and R1b gave the same scores (e0524, e0516, e0519). Note counts, default -> limited:
S2n, S2s, S3, S4lead, S5capo2, S7flat30 and R1c one fewer each, S6taps 196 -> 194, S4guitar 386 -> 390, R2 (no
truth) 334 -> 268, R3a unchanged at 105 (all scores in `samples/basic-pitch/guitar-range/scores_notes.json`).

Pictures: `samples/basic-pitch/S2n-pianoroll.png`, `S4-pianoroll.png`, `R1c-pianoroll.png`. MIDI for other lanes:
`/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/<clip>.mid` (links to `tflite-default/<clip>.mid`; also
`tflite-guitar-range/`, `onnx-default/`). R3b and R3c (the real fingerstyle videos added to the inputs at 21:29 UTC,
no truth) were run the same way in run **r0264** (`--nolock`): 129 and 87 notes, in `tflite-default-R3bc/`.

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
  `full` 1803; S1 none. A follow-up run **r0287** (`--nolock`, 2 threads, `scripts/run_torchcrepe_decoders.py`) ran
  `tiny` on R1b and S2n with each decoder and nothing else changed; scored without a threshold:

| decoder | R1b RPA | R1b RCA | eval id | S2n RPA | S2n RCA | eval id | frames >= 1500 Hz (R1b / S2n, of 2934 / 2936) |
|---|---|---|---|---|---|---|---|
| viterbi (default) | 0.442 | 0.454 | e0969 | 0.069 | 0.231 | e0972 | 1657 / 2560 |
| weighted_argmax | 0.848 | 0.852 | e0975 | 0.505 | 0.682 | e0978 | 10 / 200 |
| argmax | 0.848 | 0.851 | e0980 | 0.506 | 0.683 | e0982 | 10 / 200 |

  Seconds per clip in r0287: R1b 32.2 (viterbi), 27.3 (weighted_argmax), 21.4 (argmax); S2n 18.4, 18.5, 17.4.

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
  (S1 at 0.000 s: 679.279 Hz, confidence 0.0690); scored without a threshold.
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
build): UNVERIFIED.

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

## Tools not run here

Each entry: what it is, why it did not run on this box, with the evidence. Steps for Aaron are in `for-aaron.md`.
Context for several entries: from about 21:05 UTC the orchestrator's disk notice, printed by the box's tools, said:
"start no new download or install over 200 MB unless your lane cannot finish without it" (free disk was then 7 to
8 GB for about 20 agents, and fell below 5 GB later).

### CREPE (`marl/crepe`, PyPI `crepe` 0.0.16) - NOT RUN HERE

- The original Keras/TensorFlow package. Its README (https://raw.githubusercontent.com/marl/crepe/master/README.md,
  read 2026-11-10) installs it with `pip install --upgrade tensorflow` then `pip install crepe`. The `tensorflow`
  2.15.0 cp311 Linux wheel is 475,258,658 bytes on PyPI: over the 200 MB limit, so it was not installed. The same
  CREPE weights did run here through torchcrepe (PyTorch conversion) and Essentia's `crepe-*-1.pb` (TensorFlow
  graphs inside the Essentia wheel), above. The Basic Pitch TensorFlow backend was skipped for the same reason.

### RMVPE - NOT RUN HERE

- The research repo (`Dream-High/RMVPE`) has no PyPI package; the PyPI wrapper `rmvpe-onnx` 0.2.3 (14,520-byte
  wheel, MIT) downloads `rmvpe.onnx` from the Hugging Face repo `lj1995/VoiceConversionWebUI`, where that file is
  361,688,443 bytes (`rmvpe.pt` is 181,184,272 bytes but needs the RVC project's model code). Over the 200 MB
  limit; not installed.

### MELODIA Vamp plugin (MTG) - NOT RUN HERE

- https://www.upf.edu/web/mtg/melodia answered HTTP 403 to this box (curl and WebFetch, 2026-11-10); per the task
  rules a 403 from a host is not retried. The Wayback Machine lists a 2026-10-31 copy of that page, but fetching it
  failed ("ws_closed_mid_exchange", the proxy tunnel closed). The docs lane reports the plugin is behind a download
  form. The algorithm itself (Salamon and Gomez's melody extraction) ran here as Essentia's
  `PredominantPitchMelodia`, above. A Vamp host is on the box (`vamp-simple-host`, from the Ubuntu
  `vamp-examples` 2.10.0-4build1 package; the SDK headers and libraries from `vamp-plugin-sdk` 2.10.0).

### pYIN Vamp plugin (`c4dm/pyin`, its `notes` output) - NOT RUN HERE

- Cloned at commit 1d68cac9 (2020-02-06). Building it (`make -f Makefile.linux64 pyin.so` against the installed
  Vamp SDK) was refused by this session's permission settings ("Code from External"), so the plugin and its note
  tracker did not run. librosa's pYIN (frames only) ran above. Tony (the desktop app built on pYIN) is in
  `for-aaron.md`.

### Timbre-Trap (`sony/timbre-trap`, commit 7afe7e9, 2024-05-05) - NOT RUN HERE

- Not on PyPI (`setup.py` has `install_requires=[]`; the README installs it with `pip install -e`). The repository
  was cloned, its runtime dependencies were installed from PyPI (`cqt_pytorch` 0.0.5, torch 2.15.0+cpu, librosa
  0.11.0, mir_eval 0.8.2; freeze in `samples/timbre-trap/`), and the paper's weights `tt-orig.pt` (11,353,410 bytes,
  sha256 1c3bafd3...4cb9fe3) were downloaded from the Space `cwitkowitz/timbre-trap` (the Space itself was in
  RUNTIME_ERROR per the Hugging Face API). Running the cloned code and loading the pickled checkpoint
  (`torch.load(..., weights_only=False)`) was refused by this session's permission settings ("Code from External").
  The clone, the weights and the venv were deleted afterwards. The lane's runner `scripts/run_timbretrap.py` is kept
  (it follows the repo's `experiments/comparison.py`: threshold 0.5 after peak picking, multi-pitch frames).

### MT3 (Magenta, `magenta/mt3`) - NOT RUN HERE

- JAX/T5X code with checkpoints in Google Cloud Storage; the README's route for transcribing your own audio is a
  Colab notebook. No official Hugging Face Space; the community Space `akhaliq/MT3` reported `RUNTIME_ERROR`
  (Hugging Face API, 2026-11-10). A local CPU install (jax, t5x, seqio, tensorflow-text, note-seq) was not attempted
  because of the 200 MB limit.

### YourMT3+ - NOT RUN HERE (Space quota) and not run locally (disk)

- The author's Space `mimbres/YourMT3` (Gradio 4.39.0, hardware `zero-a10g`, stage RUNNING, git sha 5e66c1ea,
  last modified 2025-01-31, card license apache-2.0; read from https://huggingface.co/api/spaces/mimbres/YourMT3 on
  2026-11-10). Its API (gradio_client 2.7.2, `view_api`) has `/process_audio(audio_filepath) -> html` (and YouTube
  endpoints). Its `app.py` sets `model_name = 'YPTF.MoE+Multi (noPS)'`, checkpoint
  `mc13_256_g4_all_v7_mt3f_sqr_rms_moe_wf4_n8k2_silu_rope_rp_b36_nops@last.ckpt`, and returns the MIDI embedded in
  an HTML player. One call with S2n.wav (`scripts/run_yourmt3_space.py`, 1.81 s round trip) returned:
  "You have exceeded your ZeroGPU quota (90s requested vs. 79s left). Try again in 6:54:35. Authenticate with a
  Hugging Face token for more quota" (record: `samples/yourmt3-space/space_calls.json`, API listing
  `samples/yourmt3-space/view_api.txt`). No Hugging Face token exists in Aaron's key store (the key list has no HF
  entry). Locally the Space repo's checkpoints are 361 to 759 MB each (the default one 561,544,628 bytes), over the
  200 MB limit.

### MR-MT3 (`gudgud96/MR-MT3`) - NOT RUN HERE

- Its README installs `transformers==4.18.0`, `t5==0.9.3`, `note-seq==0.0.3`, `ddsp`, `tensorflow==2.11`,
  `tensorflow-text==2.11`, `tensorflow_probability==0.19.0`, `pytorch_lightning` and more
  (https://raw.githubusercontent.com/gudgud96/MR-MT3/main/README.md, read 2026-11-10): TensorFlow, over the 200 MB
  limit.

### Onsets and Frames (Magenta) and hFT-Transformer (Sony) - NOT RUN HERE

- Onsets and Frames lives in `magenta/magenta` (archived, per the docs lane) and runs on TensorFlow; not attempted
  (disk). hFT-Transformer (`sony/hFT-Transformer`): its README lists GPU machines for
  corpus generation and evaluation, and its MAESTRO checkpoint (`checkpoint.zip`, 20,540,269 bytes, GitHub release
  `ismir2023`) is used through the repository's own evaluation scripts; running cloned repository code was refused
  in this session (see Timbre-Trap), and the task asked for one or two piano-trained models, which Transkun and the
  ByteDance model cover. Its README: "the checkpoints are distributed under CC BY-NC-SA 4.0".

### Omnizart 0.6.3 - NOT RUN HERE

- PyPI `omnizart` 0.6.3 (uploaded 2026-05-31) requires `tensorflow>=2.5.0` (Python < 3.14), `tf-keras`, `madmom`,
  `sherpa-onnx`, `vamp` and others (PyPI metadata). The TensorFlow requirement alone is over the 200 MB limit, so the
  one install attempt the task allowed was not made.

### NeuralNote - NOT RUN HERE

- A desktop plugin and standalone app (VST3/AU/Standalone, installers for macOS and Windows, Linux by building from
  source; README read 2026-11-10). v2 transcribes with MuScriptor GGUF models it downloads at first start (about 210
  MB `small`, 620 MB `medium`, 2.7 GB `large`). No command line; building from source is a C++ build (refused here
  for pYIN already).

### Sheet Sage - NOT RUN HERE

- README: "ensure you are running Linux and have Docker installed", a one-time setup that downloads "a ~4GB Docker
  container"; the Jukebox mode needs "a GPU w/ at least 12GB memory". The box has no Docker and about 5 GB of free
  shared disk.

### From the docs lane's survey (`survey.md`, "Tool list"), not run

- PENN 1.0.0: queued, see its section (if present) below.
- MuScriptor 0.4.0 (Kyutai and Mirelo): the Hugging Face model `MuScriptor/muscriptor-small` is gated (`gated:
  auto`, license `cc-by-nc-4.0` on its card) and its `model.safetensors` is 411,888,600 bytes; no token here, and
  over the 200 MB limit. (`DamRsn/muscriptor-gguf` is not gated but needs the C++ `muscriptor.cpp`.)
- CREPE Notes (`crepe-notes` 0.2.0): depends on madmom, whose only PyPI file is the 0.16.1 source archive (no wheel),
  so installing it means compiling it; not attempted.
- Deep Salience, melodyExtraction_JDC / SSL: Keras/TensorFlow (disk). Aria-AMT, Onsets and Velocities: piano models
  (two piano models ran). SOME / GAME, ROSVOT: singing-voice transcribers; mt3-pytorch, MTANet: no license file per
  the survey. None attempted, for time and disk.

## Outputs for other lanes (on the box, outside git)

All under `/home/user/gtr/lanes/audio-to-notes/out/`:

- MIDI, one file per clip: `basic-pitch/<clip>.mid` (TFLite defaults; links into `basic-pitch/tflite-default/`, plus
  `R3b.mid` and `R3c.mid`), `basic-pitch/tflite-guitar-range/`, `basic-pitch/onnx-default/`,
  `basic-pitch/handoff-htdemucs6s/` (on the separation lane's stems), `transkun/<clip>.mid`. For tools that only
  write note lists, `swiftf0/<clip>.mid`, `aubio/<clip>.mid` and `essentia-melodia/<clip>.mid` were written by
  `scripts/notes_csv_to_midi.py` (a lane conversion: one track, program 24, velocity 80, 120 BPM, 480 ticks per
  quarter; the notes' times and pitches unchanged).
- Note lists (CSV, `onset_s,offset_s,pitch_midi[,...]`, or Basic Pitch's own layout): `<tool>/.../<clip>.notes.csv`.
- f0 tracks (CSV `time_s,frequency_hz[,confidence]`): `<tool>/f0/<clip>.f0.csv` for swiftf0, pyin, fcpe, pesto,
  torchcrepe-tiny, torchcrepe-full, essentia-melodia, essentia-pyin, essentia-crepe-tiny, essentia-crepe-full, and
  `aubio/<clip>.f0.csv`.
- Clips without truth (output kept only): R2, R3a (f0 tools, aubio, Basic Pitch), R3b, R3c (Basic Pitch).
- Basic Pitch raw model outputs: `basic-pitch/*/<clip>.model_output.npz` (keys `note`, `onset`, `contour`).

## Media kept outside git

No tool in this lane wrote audio or video (Basic Pitch's `--sonify-midi` was not used). One audio file was made as a
lane input: `/home/user/gtr/lanes/audio-to-notes/inputs/S7flat30.plus30c.wav` (4,233,644 bytes, 24.000 s, 44.1 kHz
stereo 16-bit): the shared clip S7flat30 shifted up 30 cents with `sox ... pitch 30`, for the tuning-correction test
in the Basic Pitch section. It is derived from the synthesized clip S7flat30 (license and attribution as for
S7flat30 in the inputs manifest).

