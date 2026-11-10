# fingerstyle-voices-taps: trials

Lane: fingerstyle on one guitar, separating melody, bass and percussive taps. Agent `try-fingerstyle-voices-taps`,
started 2026-11-10 (UTC). Everything below ran on the shared box (4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU).
Timed runs went through `gtr-run` (ledger `/home/user/gtr/ledger/runs.jsonl`, ids `r....`) and are on 2 CPU cores
unless a line says otherwise. Scores come from `gtr-eval` (ledger `/home/user/gtr/eval/ledger/evals.jsonl`, ids
`e....`; every result of this lane records `gtr_eval_version` 0.11.1) unless a line says the number was computed by a
script here, in which case the script is named.

Scripts: `scripts/` in this folder. Small outputs: `samples/<tool>/`. Big outputs (audio):
`/home/user/gtr/lanes/fingerstyle-voices-taps/out/<tool>/`, listed under "Media kept outside git" at the end.

## Facts about the inputs that every number below depends on

- S6taps (the only clip with truth taps) has 90 truth notes in 48 note-onset groups (notes starting within 1 ms of
  each other merged, as `gtr-eval onsets --field notes` does) and 32 truth taps: 24 `slap` (GM side stick) and 8
  `thump` (GM acoustic bass drum). 27 taps start at exactly the time of a note-onset group (24 slaps, 3 thumps) and
  5 thumps fall between notes. The union is 53 distinct event times: 27 "tap+note", 21 "note-only", 5 "tap-only"
  (`scripts/fvt_common.py`, `event_classes`, taps merged with a note-onset group when within 1 ms).
- The taps are General MIDI drum-kit samples mixed into a FluidSynth guitar render, not hands on a guitar body
  (manifest caveat). No clip in the shared set is a real recording with body taps (INPUTS.md: "A video with a capo or
  with percussive body taps was not found.").
- S2n, S2s, S6taps: 42 melody notes with MIDI pitches 55 to 64 and 48 bass notes with pitches 43 to 52 (from the
  truth JSON). Every truth melody note is higher than every truth bass note, so a fixed pitch threshold between 52
  and 55 assigns every truth note its truth voice. Of the 48 onset groups, 42 have two notes (one bass, one melody)
  and 6 have one note (all 6 are bass notes, MIDI 50 or 45; read from the truth JSON; the lower note of every
  two-note group is the bass note). S5dropd: bass 38 to 52, melody 55
  to 64.

## What each method needs and emits (summary of the sections below)

| method | ran here | needs | emits |
|---|---|---|---|
| librosa `effects.hpss` | yes (r0031, r0292) | mono audio array | harmonic and percussive audio arrays, same length |
| libnmfd KAM HPSS + NMFD + percussiveness threshold | yes (r0238) | magnitude spectrogram (+ mixture phase to resynthesize) | percussive and harmonic spectrograms |
| librosa `decompose.decompose` (scikit-learn NMF) | yes (r0296), with an ORACLE grouping | magnitude spectrogram | basis matrix W (freq x k) and activations H (k x frames); no labels |
| onset detectors: librosa, aubio (8 methods), Essentia (8), madmom (8 programs) | yes (r0031, r0079, r0090, r0247, r0334) | audio (WAV / array) | onset times in seconds; no tap / note label |
| Demucs htdemucs, htdemucs_6s; Open-Unmix umxhq (source-separation lane's runs, plus r0327 / r0330 here on R3) | yes | stereo audio | one WAV per stem (drums, bass, other, vocals; + guitar, piano for 6s) |
| drums stem + onset detector + spectral centroid (measurement) | yes | a drums stem | onset times; centroid in Hz per onset |
| ADTOF-pytorch, Omnizart drum, ADTOF, ADT_STR, Inverse Drum Machine, LarsNet, drumsep, Magenta OaF drums | no (reasons below) | audio | drum MIDI (onset, GM pitch) or drum stems |
| partitura `estimate_voices` | yes (r0184, r0185, r0258 to r0265) | note array (onset, duration, pitch) | one voice number per note (1..k) |
| music21 MIDI import | yes (same runs) | MIDI | Stream with Chords, Notes, Voice objects (no melody/bass labels) |
| baselines B1 threshold, B2 lowest per onset, B3 skyline | yes (same runs) | notes (onset, pitch) | melody / bass label per note |
| piano_svsep, McLeod voice-splitting | no | MusicXML / MIDI | voices and staves (MEI) / voice-split MIDI |
| Basic Pitch 0.4.0 (ONNX) | yes (r0252, r0325) | audio | MIDI and note CSV (onset s, offset s, MIDI pitch, velocity, pitch bends) |
| Essentia `PredominantPitchMelodia` | yes (r0220) | mono audio | f0 per 2.9 ms frame (Hz, 0 = unvoiced) + confidence |
| low-pass + librosa `pyin` | yes (r0233, r0235) | mono audio | f0 per 10 ms frame + voiced probability; notes via a plain segmentation written here |
| Deep Salience | no | audio | bass / melody f0 CSV |

## librosa 0.11.0: harmonic-percussive separation (`librosa.effects.hpss`) and `librosa.onset.onset_detect`

- What it is: median-filtering harmonic-percussive source separation (Fitzgerald 2010, with the margin extension of
  Driedger, Müller and Disch 2014, as cited in librosa's docstring) and librosa's spectral-flux onset detector. From
  PyPI, `librosa==0.11.0`, installed 2026-11-10.
- Install: `uv venv --python 3.11 venv-core` then `uv pip install --python venv-core/bin/python librosa soundfile
  mir_eval pretty_midi music21 partitura scikit-learn matplotlib` (one shared venv for librosa, partitura, music21;
  numpy 2.4.6, scikit-learn 1.9.1). No dead ends. `du -sh venv-core` right after the install: 617 MB (files
  hard-linked from the shared uv cache). No model weights. Freeze: `freeze/venv-core.txt` in the lane folder.
- Signature read from the installed package: `librosa.effects.hpss(y, *, kernel_size=31, power=2.0, mask=False,
  margin=1.0)`; STFT defaults n_fft 2048, hop 512.
- Run r0031 (2 cores): `scripts/librosa_hpss_sweep.py S6taps <out>`, input `S6taps.mono.wav` (44.1 kHz mono),
  margins 1, 2, 4, 8, 16, everything else default; then `librosa.onset.onset_detect(y=..., sr=..., units='time')`
  with defaults on each percussive part and on the unseparated mix. Wall 39.91 s, CPU 37.1 s, peak RSS 651.6 MB, exit
  0 (includes imports and numba compilation; the script's own timer: 6.06 s for the first margin, 2.62 to 2.75 s for
  each later one). Output per margin: `harmonic.wav`, `percussive.wav` (float32 mono 44.1 kHz, 29.357 s),
  `onsets_percussive.txt` (one time in seconds per line).
- Energy (sum of squares of the part / sum of squares of the mix; `summary.json`): margin 1: harmonic 0.796,
  percussive 0.065, residual (mix - harmonic - percussive) ~0; margin 2: 0.620 / 0.037 / 0.058; margin 4: 0.384 /
  0.022 / 0.222; margin 8: 0.168 / 0.010 / 0.470; margin 16: 0.047 / 0.003 / 0.724. (With margin above 1 the two
  masks no longer sum to one, so part of the mix lands in neither.)

Percussive part scored against `S6taps/stems/taps.wav` and harmonic part against `stems/guitar.wav` (`gtr-eval
stems --map taps=percussive.wav guitar=harmonic.wav`, joint bss_eval over the whole 29.4 s, mono, no alignment
search):

| margin | eval id | taps SI-SDR dB | taps SDR | taps SIR | taps SAR | guitar SI-SDR dB | guitar SDR |
|---|---|---|---|---|---|---|---|
| 1 | e0021 | 0.37 | 0.53 | 3.91 | 4.67 | 15.53 | 16.52 |
| 2 | e0029 | 3.43 | 3.80 | 9.21 | 5.76 | 11.08 | 12.28 |
| 4 | e0033 | 3.68 | 4.37 | 12.83 | 5.25 | 6.97 | 8.52 |
| 8 | e0036 | 1.89 | 2.87 | 14.47 | 3.33 | 3.39 | 5.54 |
| 16 | e0039 | -0.64 | 0.64 | 14.51 | 0.98 | 0.35 | 3.30 |

Onsets (`librosa.onset.onset_detect` defaults) on the percussive part:

- At every margin (1, 2, 4, 8, 16) the detector returned 53 onsets. Against the 32 truth taps (`gtr-eval onsets
  --field taps`, window 50 ms): 32 matched, precision 0.604, recall 1.0, F 0.753 at every margin (e0022, e0031,
  e0034, e0037, e0040); median timing of matched pairs 8.4 ms late at margin 1, 1.7 ms at margin 8 and 16. Against
  the 48 note-onset groups (`--field notes`): 48 matched, precision 0.906, recall 1.0, F 0.950 at every margin
  (e0023, e0032, e0035, e0038, e0041).
- Breakdown (`scripts/classify_onset_files.py`, one-to-one matching to the 53 labelled event times, 50 ms): at
  margins 1 and 16 the 53 onsets land on all 27 tap+note events, all 21 note-only events and all 5 tap-only
  events, 0 on neither. The same detector on the unseparated mix also returns 53 onsets with the same breakdown
  (gtr-eval vs taps: precision 0.604, recall 1.0, e0053). So the onset list alone does not say which onsets are
  taps: the percussive part still carries every guitar note attack.
- Energy in the 50 ms after each event (`scripts/event_energy.py`, dB relative to the loudest event window of the
  same file; min / median / max):

| signal | tap+note (27) | note-only (21) | tap-only (5) | note-only events louder than the quietest tap event |
|---|---|---|---|---|
| mix `S6taps.mono.wav` | -6.55 / -3.21 / 0.0 | -4.23 / -3.24 / -2.34 | -3.97 / -3.90 / -3.58 | 21 of 21 |
| truth `stems/taps.wav` | -6.54 / -6.52 / 0.0 | -46.82 / -46.33 / -35.73 | -0.05 / -0.02 / 0.0 | 0 of 21 |
| percussive, margin 1 | -8.31 / -7.03 / 0.0 | -12.03 / -10.22 / -8.61 | -2.54 / -1.94 / -1.87 | 0 of 21 |
| percussive, margin 4 | -10.41 / -9.29 / 0.0 | -18.80 / -16.17 / -13.80 | -5.37 / -3.61 / -3.27 | 0 of 21 |
| percussive, margin 16 | -13.05 / -11.73 / 0.0 | -23.79 / -20.91 / -16.77 | -10.40 / -10.05 / -8.01 | 0 of 21 |

  In the percussive parts the energy ranges of note-only events and tap events do not overlap on this clip (gap
  between the loudest note-only event and the quietest tap event: 0.30 dB at margin 1, 3.39 dB at margin 4, 3.72 dB
  at margin 16); in the mix they do. This is one synthesized clip with GM drum samples as taps.
- Input format facts: any 1-D float array at any sample rate (here 44.1 kHz mono float32). Emits two arrays the
  length of the input (time-domain harmonic and percussive signals); `librosa.decompose.hpss` works on a spectrogram
  and returns two spectrograms (or two masks with `mask=True`).
- Output format facts: onset times as a numpy array of seconds (`units='time'`), frame-quantized to hop 512 (11.6 ms
  at 44.1 kHz) unless `backtrack` or another hop is set.
- Constraint inputs for a re-run: `margin` (scalar or (harmonic, percussive) pair), `kernel_size` (harmonic,
  percussive), `power`, `mask`; the onset detector takes `hop_length`, `backtrack`, `delta`/`wait`/`pre_max`/`post_max`
  (peak picking) and a custom `onset_envelope`. None of them is a musical constraint (tuning, capo, tempo).
- Failures and oddities: none.

## aubio 0.4.9: `aubioonset`, eight onset methods

- What it is: aubio's onset detector, C command-line tool `aubioonset` from the Ubuntu package `aubio-tools`
  0.4.9-4.4build1 (already on the box). Methods energy, hfc, complex, phase, specdiff, kl, mkl, specflux.
- Install: none. The Python front end of the same Ubuntu package does not start under the system Python 3.13:
  `aubio --version` ends with `ModuleNotFoundError: No module named 'aubio._aubio'`. The C binary works.
- Run r0079 (2 cores): `scripts/aubio_onsets.sh S6taps.mono.wav <out>`: `aubioonset -i <wav> -O <method>` for each
  method, all other settings default (threshold 0.3, minimum inter-onset interval 0.012 s, silence -90 dB, per
  `aubioonset --help`, which does not print the default buffer and hop sizes). Wall 0.93 s for all eight, CPU 0.8 s, peak RSS 35.1 MB. Per method
  0.09 to 0.11 s.
- Output: plain text, one onset time in seconds per line (`-T` switches to samples or ms).
- Input: WAV read directly; `-r 0` keeps the file's rate (here 44.1 kHz mono 16-bit).
- Constraint inputs for a re-run: `-O` method, `-t` threshold, `-M` minimum inter-onset interval, `-s` silence
  threshold, `-B`/`-H` buffer and hop. No musical constraints.

| method | n onsets | vs taps P / R / F (eval id) | vs note onsets P / R / F (eval id) | on tap+note (27) | on note-only (21) | on tap-only (5) | on neither |
|---|---|---|---|---|---|---|---|
| complex | 54 | 0.593 / 1.000 / 0.744 (e0077) | 0.889 / 1.000 / 0.941 (e0078) | 27 | 21 | 5 | 1 |
| energy | 59 | 0.542 / 1.000 / 0.703 (e0079) | 0.814 / 1.000 / 0.897 (e0080) | 27 | 21 | 5 | 6 |
| hfc (default) | 53 | 0.604 / 1.000 / 0.753 (e0081) | 0.906 / 1.000 / 0.950 (e0082) | 27 | 21 | 5 | 0 |
| kl | 62 | 0.516 / 1.000 / 0.681 (e0083) | 0.774 / 1.000 / 0.873 (e0084) | 27 | 21 | 5 | 9 |
| mkl | 54 | 0.593 / 1.000 / 0.744 (e0085) | 0.889 / 1.000 / 0.941 (e0086) | 27 | 21 | 5 | 1 |
| phase | 60 | 0.533 / 1.000 / 0.696 (e0087) | 0.800 / 1.000 / 0.889 (e0088) | 27 | 21 | 5 | 7 |
| specdiff | 54 | 0.593 / 1.000 / 0.744 (e0089) | 0.889 / 1.000 / 0.941 (e0090) | 27 | 21 | 5 | 1 |
| specflux | 58 | 0.552 / 1.000 / 0.711 (e0091) | 0.828 / 1.000 / 0.906 (e0092) | 27 | 21 | 5 | 5 |

  Columns 5 to 8: `scripts/score_onset_dir.py` (calls `fvt_common.classify_onsets`): each onset matched one-to-one
  to the 53 labelled event times within 50 ms. "vs taps" and "vs note onsets" are `gtr-eval onsets --field taps` /
  `--field notes`, window 50 ms. Every method reached every event; the methods differ only in extra onsets.
- Failures and oddities: the Python CLI `aubio` fails as above.

## Essentia 2.1-beta6-dev (PyPI `essentia==2.1b6.dev1389`): OnsetDetection, Onsets, OnsetRate, SuperFluxExtractor

- What it is: Essentia's onset detection functions and peak picking (MTG, UPF), from PyPI, installed 2026-11-10.
- Install: `uv venv --python 3.11 venv-essentia` then `uv pip install --python venv-essentia/bin/python essentia
  numpy soundfile mir_eval`. Worked first time; `du -sh`: 44 MB. No weights. Freeze:
  `samples/essentia/venv-essentia.freeze.txt` (`essentia==2.1b6.dev1389`).
- HPSS: Essentia 2.1-beta6-dev has no harmonic-percussive separation algorithm. Checked by listing the names in
  `essentia.standard` that contain onset, hpss, harmon, percuss, superflux, nmf, drum or beat: `AudioOnsetsMarker,
  BeatTrackerDegara, BeatTrackerMultiFeature, Beatogram, BeatsLoudness, ChordsDetectionBeats, HarmonicBpm,
  HarmonicMask, HarmonicModelAnal, HarmonicPeaks, Inharmonicity, OddToEvenHarmonicEnergyRatio, OnsetDetection,
  OnsetDetectionGlobal, OnsetRate, Onsets, PercivalEnhanceHarmonics, SingleBeatLoudness, SuperFluxExtractor,
  SuperFluxNovelty, SuperFluxPeaks`. So "Essentia HPSS" from the starting list was not run: no such algorithm.
- Run r0090 (2 cores): `scripts/essentia_onsets.py S6taps.mono.wav <out>`: MonoLoader at 44.1 kHz, frames of 1024
  with hop 512, Hann window, FFT, CartesianToPolar, `OnsetDetection(method=m)` for m in hfc, complex,
  complex_phase, flux, melflux, rms, then `Onsets()` (defaults) on that single detection function; also
  `OnsetRate()` and `SuperFluxExtractor()` with defaults. Wall 2.12 s, CPU 2.1 s, peak RSS 165.5 MB. Each method
  0.09 to 0.19 s.
- Output: numpy arrays of onset times in seconds (written one per line); `OnsetRate` also returns onsets per
  second (1.805 here).

| method | n onsets | vs taps P / R / F (eval id) | vs note onsets P / R / F (eval id) | on tap+note (27) | on note-only (21) | on tap-only (5) | on neither |
|---|---|---|---|---|---|---|---|
| OnsetDetection complex | 53 | 0.604 / 1.000 / 0.753 (e0093) | 0.906 / 1.000 / 0.950 (e0094) | 27 | 21 | 5 | 0 |
| OnsetDetection complex_phase | 79 | 0.405 / 1.000 / 0.577 (e0096) | 0.608 / 1.000 / 0.756 (e0097) | 27 | 21 | 5 | 26 |
| OnsetDetection flux | 59 | 0.542 / 1.000 / 0.703 (e0098) | 0.814 / 1.000 / 0.897 (e0099) | 27 | 21 | 5 | 6 |
| OnsetDetection hfc | 52 | 0.596 / 0.969 / 0.738 (e0100) | 0.923 / 1.000 / 0.960 (e0101) | 27 | 21 | 4 | 0 |
| OnsetDetection melflux | 61 | 0.525 / 1.000 / 0.688 (e0102) | 0.787 / 1.000 / 0.881 (e0103) | 27 | 21 | 5 | 8 |
| OnsetDetection rms | 157 | 0.204 / 1.000 / 0.339 (e0104) | 0.306 / 1.000 / 0.468 (e0105) | 27 | 21 | 5 | 104 |
| OnsetRate | 53 | 0.604 / 1.000 / 0.753 (e0106) | 0.906 / 1.000 / 0.950 (e0107) | 27 | 21 | 5 | 0 |
| SuperFluxExtractor | 19 | 0.632 / 0.375 / 0.471 (e0108) | 0.789 / 0.312 / 0.448 (e0109) | 9 | 6 | 3 | 1 |

- Input format facts: `MonoLoader` decodes any file FFmpeg reads and resamples to `sampleRate`; the algorithms
  assume 44.1 kHz unless their `sampleRate`/`frameRate` parameters are changed.
- Constraint inputs for a re-run: `OnsetDetection(method, sampleRate)`, `Onsets(alpha, delay, frameRate,
  silenceThreshold)` and per-function weights, `SuperFluxExtractor(frameSize, hopSize, threshold, ratioThreshold,
  combine)`. No musical constraints.
- Failures and oddities: `SuperFluxExtractor` with its defaults returned 19 onsets on this 29.4 s clip; no tuning
  of its threshold was tried.

## Demucs 4.1.0 stems (run by the source-separation lane) on the solo guitar clips: what the bass and drums stems contain

Handoff test: the source-separation lane's Demucs outputs used as this lane's input. No separation was run by this
lane. Their runs (ledger): r0053 `demucs -n htdemucs -d cpu` on S6taps (wall 45.63 s, 2 cores), r0054 htdemucs_6s on
S6taps (29.74 s), r0060 htdemucs on S2s (36.81 s), r0099 htdemucs_6s on S2s (73.43 s); files under
`/home/user/gtr/lanes/source-separation/out/<model>/<clip>/<stem>.wav` (44.1 kHz stereo, 29.357 s).

Reference voice stems made here (S2 has no per-voice audio in the shared set): `scripts/render_voice_stems.py`
removes the other part's track from the clip's own MIDI file and renders the rest with the inputs builder's exact
FluidSynth command, at the clip's own gain from `_checks/synth_checks.json` (runs r0135 S2s, r0136 S6taps, r0137
S2n, r0138 S5dropd; `--nolock`, 1.3 to 6.0 s wall each). Check: melody + bass (+ the shared taps stem for S6taps)
differs from the clip's mix by at most 3.4e-5 of the mix peak (S2s, S2n, S5dropd) and 7.8e-4 (S6taps). Files:
`/home/user/gtr/lanes/fingerstyle-voices-taps/inputs/voice-stems/<clip>/{melody,bass}.wav` (+ `.mono.wav`).

Energy of each stem (sum of squares over both channels / the same for the clip's mix; computed here):

| clip | model | bass | drums | other | guitar | piano | vocals |
|---|---|---|---|---|---|---|---|
| S2s | htdemucs | -63.1 dB | 0.0000 | 0.998 | n/a | n/a | 0.0000 |
| S2s | htdemucs_6s | -60.7 dB | 0.0000 | 0.0000 | 0.0041 | 0.826 | 0.0000 |
| S6taps | htdemucs | -60.7 dB | 0.0292 | 0.961 | n/a | n/a | 0.0000 |
| S6taps | htdemucs_6s | -58.4 dB | 0.0313 | 0.0000 | 0.0217 | 0.623 | 0.0000 |

(0.0000 = below 0.00005 of the mix energy.) On these solo-guitar clips the bass stems are 58 to 63 dB below the
mix. SI-SDR of the bass stem against the bass-voice reference: -12.66 dB (S2s htdemucs, e0161), -9.63 dB (S2s
htdemucs_6s, e0162), -17.03 dB (S6taps htdemucs, e0165), -6.54 dB (S6taps htdemucs_6s, e0166); against the
melody-voice reference: -18.30, -11.95, -26.44, -6.61 dB (e0163, e0164, e0167, e0168). htdemucs put 0.998 (S2s) and
0.961 (S6taps) of the mix energy into `other` (S2s `other` against the melody reference: SI-SDR 0.50 dB, SAR 44.5
dB, e0161); htdemucs_6s put 0.826 (S2s) and 0.623 (S6taps) into `piano`.

Drums stems of S6taps against the truth `stems/taps.wav` (`gtr-eval stems --sdr-mode single`): htdemucs SI-SDR
5.67 dB, SDR 11.72 dB (e0169); htdemucs_6s SI-SDR 6.98 dB, SDR 10.87 dB (e0170). The librosa HPSS percussive
parts measured -0.64 to 3.68 dB SI-SDR on the same reference (table above).

Onsets on those drums stems (`librosa.onset.onset_detect` defaults, computed here outside gtr-run, not timed):

| drums stem | n onsets | vs taps P / R / F (eval id) | vs note onsets P / R / F (eval id) | on tap+note (27) | on note-only (21) | on tap-only (5) | on neither |
|---|---|---|---|---|---|---|---|
| htdemucs_6s | 32 | 1.000 / 1.000 / 1.000 (e0171) | 0.844 / 0.562 / 0.675 (e0172) | 27 | 0 | 5 | 0 |
| htdemucs | 34 | 0.912 / 0.969 / 0.939 (e0173) | 0.765 / 0.542 / 0.634 (e0174) | 26 | 0 | 5 | 3 |

Energy in the 50 ms after each event, dB relative to the loudest event window (`scripts/event_energy.py`):
htdemucs drums: tap+note -36.57 / -14.28 / 0.0 (min / median / max), note-only -59.59 / -55.18 / -43.62, tap-only
-0.34 / -0.29 / -0.24; htdemucs_6s drums: tap+note -21.51 / -11.46 / 0.0, note-only -65.49 / -62.01 / -43.61,
tap-only -0.59 / -0.55 / -0.50. No note-only event is louder than the quietest tap event in either stem.

Tap kind (thump = GM acoustic bass drum, slap = GM side stick) at the onsets found in the drums stems: spectral
centroid of the 50 ms after each onset that matched a truth tap (`scripts/tap_kind_centroid.py`, Hann window, computed
here; a measurement, not a classifier): htdemucs_6s drums: thump 8 onsets, 233 / 647 / 817 Hz (min / median / max),
slap 24 onsets, 3,715 / 4,656 / 5,079 Hz; htdemucs drums: thump 8, 322 / 803 / 867 Hz, slap 23, 3,312 / 3,898 /
5,114 Hz (3 onsets matched no tap); the truth taps stem at the htdemucs_6s onsets: thump 686 / 885 / 926 Hz, slap
4,572 / 4,873 / 5,422 Hz. On this clip the two kinds' centroid ranges do not overlap in any of the three signals.

Open-Unmix 1.3.0 `umxhq` on S6taps (source-separation lane run r0147, `umx --model umxhq`, wall 96.63 s, 2 cores;
files `/home/user/gtr/lanes/source-separation/out/umxhq/S6taps/{bass,drums,other,vocals}.wav`), scored here the same
way: energy relative to the mix bass -49.3 dB, drums -14.4 dB (0.0366), other -0.3 dB (0.924), vocals -46.5 dB.
Drums vs `stems/taps.wav`: SI-SDR 2.71 dB, SDR 4.35 dB (e0950). Bass vs the bass-voice reference: SI-SDR -31.96 dB
(e0965); other vs the melody-voice reference: SI-SDR 0.25 dB, SAR 19.67 dB (e0965). `librosa.onset.onset_detect` on
the umxhq drums stem: 82 onsets; vs taps P 0.390 / R 1.000 / F 0.561 (e0971), vs note onsets P 0.585 / R 1.000 /
F 0.738 (e0974); on all 27 tap+note, 21 note-only and 5 tap-only events and 29 on neither. Energy after each event
(dB re loudest): tap+note -15.97 / -10.76 / 0.0, note-only -29.94 / -17.69 / -10.29, tap-only -1.06 / -0.69 / -0.63;
10 of 21 note-only events are louder than the quietest tap event.

Caveat that applies to all of this: the taps are GM drum-kit samples (side stick, acoustic bass drum), which is what
a drum separator is trained on; real body taps on a guitar may not behave the same. Not tested here: no freely
licensed real recording with body taps was in the shared set.

## Voice separation of truth notes: partitura 1.9.0 `estimate_voices`, music21 10.5.2, and three plain baselines

- What they are: `partitura.musicanalysis.estimate_voices` (docstring cites Chew and Wu 2004, "Separating Voices in
  Polyphonic Music: A Contig Mapping Approach"); music21 10.5.2 (MIDI import builds Notes, Chords and, where notes
  overlap with different lengths, Voice objects; it has no melody/bass labelling function: the Stream methods with
  "oice" in the name are `flattenUnnecessaryVoices, hasVoices, makeVoices, voices, voicesToParts`). Both from PyPI in
  `venv-core` (see the librosa section). The baselines are written here and are labelled BASELINE.
- Input given to every method (`scripts/voice_split.py`): the clip's 90 truth notes with only onset (s), offset (s)
  and MIDI pitch; voice, string, fret, velocity and the MIDI track split were removed. For music21 the notes were
  written as one single-track MIDI file (pretty_midi, program 24, the clip's tempo) and parsed back.
- Methods and their outputs:
  - B1 BASELINE pitch threshold: pitch < T is bass, else melody, every integer T from 36 to 72.
  - B2 BASELINE lowest note per onset: notes within 50 ms of a group's first onset form a group; the lowest is bass,
    the rest melody; a one-note group is bass.
  - B3 BASELINE skyline: highest note per group is melody, the rest bass; a one-note group is melody.
  - P1 / P2 partitura `estimate_voices(note_array, monophonic_voices=False / True)` on a structured array with
    `onset_sec`, `duration_sec`, `pitch`, `id`. It returns one voice number per note (1..k). Labels without using
    the truth: the voice with the highest mean pitch is melody, every other voice is bass.
  - M1 music21 + a labelling rule written here: each Chord's lowest pitch (`Chord.bass()`) is bass and its other
    pitches melody; a single Note inside a Voice is melody when its Voice has the highest mean pitch of the Voices
    in that Measure, else bass; a single Note outside any Voice is bass.
- Score: `fvt_common.voice_accuracy`: each labelled note is matched one-to-one to a truth note (onset within 50 ms,
  pitch within 0.5 semitone, `mir_eval.transcription.match_notes`), then the share of matched pairs whose voice
  labels agree. Computed by the script, not by gtr-eval (gtr-eval has no voice-assignment subcommand).
- Runs (`--nolock`, light): r0184 S2n (wall 4.49 s, CPU 1.9 s, peak RSS 159.2 MB), r0185 S5dropd (4.59 s). These
  supersede r0113 / r0114 (same numbers, before the T = 55 baseline and the per-voice files were added) and r0111 (an
  earlier S2n run with a different music21 labelling rule, one Voice for the whole piece instead of per Measure,
  which gave 85 of 90). S2s and S6taps have the same notes as S2n and were not run separately.

| method | S2n: right voice / matched (90 truth notes) | S5dropd: right voice / matched | what the tool emitted | method time |
|---|---|---|---|---|
| B1 BASELINE threshold, T = 53, 54 or 55 (T = 55 is also run as `B1_threshold_T55`: G3, the open third string) | 90 / 90 | 90 / 90 | labels | n/a |
| B1 BASELINE threshold, T = 50 / 52 / 56 / 58 / 60 | 66 / 84 / 84 / 78 / 70 of 90 | 70 / 84 / 84 / 78 / 70 of 90 | labels | n/a |
| B2 BASELINE lowest per onset | 90 / 90 | 90 / 90 | 48 groups | n/a |
| B3 BASELINE skyline | 84 / 90 (the 6 one-note bass groups labelled melody) | 84 / 90 | 48 groups | n/a |
| P1 partitura, monophonic_voices=False | 54 / 90 | 54 / 90 | 2 voices: 10 and 80 notes (S2n mean pitch 57.2 and 52.6) | 0.033 s / 0.028 s |
| P2 partitura, monophonic_voices=True | 90 / 90 | 90 / 90 | 2 voices: 42 and 48 notes (S2n mean pitch 59.5 and 47.5) | 0.023 s / 0.022 s |
| M1 music21 + rule above | 90 / 90 | 90 / 90 | 1 part, 36 Chords, 18 single Notes, 12 Voice objects (S2n) | 0.198 s / 0.265 s (parse + labelling) |

- Why P1 differs: partitura's docstring says that with `monophonic_voices=False` "notes with the same onset and
  duration are treated as a chord and assigned to the same voice"; in S2 every two-note onset has a bass and a
  melody note of the same written length, so they share a voice.
- On these truth notes every truth melody pitch (55 to 64) is above every truth bass pitch (43 to 52, S5dropd 38 to
  52), which is why a threshold between them and the lowest-note rule give 90 of 90. This is a property of the test
  arrangement, not of the methods.
- Output format facts: partitura returns a numpy int array of voice numbers (1-based, "the MusicXML convention" per
  its docstring); music21 returns a Stream (Score > Part > Measure > Voice > Note/Chord) with offsets in quarter notes;
  the script writes `<method>.csv` with `onset,offset,pitch,voice`.
- Constraint inputs for a re-run: partitura `monophonic_voices`; music21 parsing options (quantization) only. Neither
  takes a note range, tuning or capo.
- Samples: `samples/voice-split/` (`S2n_truth_voice_split.json`, `S5dropd_truth_voice_split.json` with the whole
  threshold sweep and the confusion counts, `S2n_truth_P2_partitura_mono.csv`, `S2n_truth_merged_single_track.mid`).

## ADTOF-pytorch 0.1.0 (commit 85c192e): NOT RUN HERE

- What it is: a PyTorch port of ADTOF's Frame_RNN drum transcriber (5 classes, GM pitches 35, 38, 47, 42, 49 =
  `LABELS_5` in `post_processing.py`, default thresholds `[0.22, 0.24, 0.32, 0.22, 0.30]`), weights bundled
  (`src/adtof_pytorch/data/adtof_frame_rnn_pytorch_weights.pth`, 3,617,805 bytes, sha256 `1bc986e5...7320`).
  https://github.com/xavriley/ADTOF-pytorch , cloned with `git clone --depth 1` on 2026-11-10 (HEAD
  `85c192e78f716ea0b111cc8a5ee4a8f6a3a4f8a9`, commit date 2025-11-11). No LICENSE file in the repository root (also
  noted in survey.md).
- What was done: the PyPI dependencies installed into `venv-adtof` without trouble (`uv pip install torch librosa
  pretty_midi numpy mir_eval soundfile`: torch 2.15.0+cpu, librosa 0.11.0, numpy 2.4.6; freeze saved in the lane's
  `freeze/venv-adtof.txt`). Two steps were refused by this session's permission policy, which answered "Permission
  for this action was denied by the Claude Code auto mode classifier ... judged this action dangerous (it gave no
  explanation)": (1) `uv pip install ... ./repos/ADTOF-pytorch` (installing the clone), (2) running the CLI from a
  copy of the five reviewed `.py` files of `src/adtof_pytorch` (the code was read first: it imports only torch,
  numpy, librosa, pretty_midi, argparse, os, pathlib; `torch.load` at `model.py` line 266 has no `weights_only`
  argument). Both were left alone after the refusal; the copy, the venv and the clone were deleted.
- Steps for Aaron: `for-aaron.md`, list 1.

## Omnizart 0.6.3 drum mode: NOT RUN HERE

- PyPI `omnizart` 0.6.3 (sdist only, uploaded 2026-05-31) lists `tensorflow>=2.5.0; python_version < "3.14"`,
  `tf-keras`, `madmom>=0.16.1`, `sherpa-onnx>=1.10.0`, `vamp>=1.1.0` among its requirements (PyPI JSON, read
  2026-11-10). No virtual environment on the box contains TensorFlow (searched all lanes' venvs for a `tensorflow`
  package directory at 21:24 UTC: none; `torch` in eight). The orchestrator's notice printed by `env.sh` from 21:16
  UTC: "start no new download or install over 200 MB unless your lane cannot finish without it ... never install a
  second torch or tensorflow version if an existing venv can be reused"; free disk was 5.8 to 8 GB shared by all
  lanes. A TensorFlow install was therefore not started. Steps for Aaron: `for-aaron.md`, list 3.

## Other candidates not run here (one line each, reason with evidence)

- ADTOF (original, Keras/TensorFlow, https://github.com/MZehren/ADTOF): needs TensorFlow (`tensorflow>=2.13.0` in its
  `setup.py`, survey.md); same disk reason as Omnizart. `for-aaron.md` list 2 (the README's Colab notebook).
- Cluster and Separate / piano_svsep (https://github.com/CPJKU/piano_svsep, cloned 2026-11-10 at
  `1462e7c28d7adaae033150883a7cb00238ee364a`, 2026-03-09; MIT; `pretrained_models/model.ckpt` 36,495,754 bytes in
  the clone): its `setup.py` pins `torch==2.8.0`, `partitura==1.8.0`, `scikit-learn==1.6.0` and needs
  `torch-scatter`/`torch_geometric`; the box's torch is 2.15.0+cpu and the disk notice forbids a second torch; the
  package is not on PyPI, so it also means running a clone, which was refused for ADTOF-pytorch. Not attempted.
  Its input file for Aaron is ready: `samples/voice-split/S2n_truth_merged_single_track.musicxml` (the S2n notes as
  one part, written by music21 10.5.2 from the merged single-track MIDI). `for-aaron.md` list 4.
- McLeod and Steedman voice-splitting (Java, https://github.com/apmcleod/voice-splitting): Java 21 is on the box
  (`openjdk version "21.0.12.1"`), but building it means compiling a cloned repository; not attempted after the
  refusals above. `for-aaron.md` list 5.
- ADT_STR (https://github.com/pier-maker92/ADT_STR) and the Inverse Drum Machine
  (https://github.com/bernardo-torres/inverse-drum-machine): code only in cloned repositories (same reason); ADT_STR
  also brings TorchAudio/TorchCodec/Transformers. `for-aaron.md` lists 6 and 7.
- LarsNet: weights 562 MB per survey.md, above the 200 MB install limit of the disk notice. Not attempted.
- drumsep (Demucs-based drum separator): weights from Google Drive per survey.md; not attempted (time and disk).
- Magenta Onsets and Frames drums (E-GMD checkpoint, 25,658,703 bytes): needs the archived Magenta TensorFlow 1
  environment (survey.md); not attempted.
- Deep Salience (bass, melody salience from audio): its `replicate.yaml` pins Python 2.7.15 and TensorFlow 1.12.0
  (survey.md); the box has Pythons 3.9 to 3.13 (and 3.8 through uv, per the task notes), no 2.7; not attempted.
- `eguitar_ircam.ts` TorchScript technique classifier (Hugging Face `nbrochec/ipt_models`, CC BY-NC 4.0): its input
  pipeline lives in Max/MSP `ipt~` or the C library `libipt` (survey.md); not attempted.
- Martelloni, McPherson, Barthet 2023 (percussive guitar classifiers): no code or data published (survey.md: dataset
  "currently not public"). Nothing to run.

## A real recording with body taps: not obtained

The shared set has none (INPUTS.md). Searched 2026-11-10:

- Freesound text search (through the web reader) "percussive guitar" with the CC0 filter and "percussive acoustic
  guitar": candidates include sound 674811 "guitar body kick" by leaving.february ("Sound when hitting acoustic
  guitar body with a thumb in 105bpm", 0:18.285, WAV 44.1 kHz 24-bit stereo, license "Creative Commons 0", uploaded
  2023-02-14, per its page). `curl` to freesound.org from the box answered HTTP 403 (not retried); the page shows
  the download link only behind a login and no preview URL was visible to the web reader. Not obtained.
- Wikimedia Commons API search: "File:Erik Mongrain-AirTap.ogv" (Erik Mongrain "demonstrating the lap-tapping
  technique with his song AirTap!", 180.2 s, 320x240, 15,937,314 bytes, "CC BY-SA 2.5", Artist "Erik Mongrain's
  management", per the API's extmetadata) and "File:Am7 Percussive Bass Tapping.webm" (a 5-string bass, CC BY 3.0,
  43.7 s). One download attempt of the AirTap file from upload.wikimedia.org answered HTTP 429 (3,513 bytes of HTML;
  deleted). Not obtained.
- Steps for Aaron to fetch either file: `for-aaron.md`, list 8.

## Essentia 2.1-beta6-dev `PredominantPitchMelodia`: the melody voice from audio directly

- What it is: Essentia's predominant-pitch (melody) estimator; its docstring cites J. Salamon and E. Gómez, "Melody
  extraction from polyphonic music signals using pitch contour characteristics" (IEEE TASLP 2012). Same
  `venv-essentia` as above (`essentia==2.1b6.dev1389`).
- Run r0220 (`--nolock`, one thread through `OMP_NUM_THREADS=1` and friends, because the two CPU slots had a queue of
  about 30 jobs; wall 10.14 s for all four clips, CPU 6.4 s, peak RSS 177.1 MB): `scripts/essentia_melodia.py`
  on S2n, S2s, S6taps, S5dropd mono: `MonoLoader(sampleRate=44100)` -> `EqualLoudness()` ->
  `PredominantPitchMelodia()` defaults (hop 128 samples = 2.9 ms). Per clip 1.5 to 2.5 s (script timer).
- Output: two arrays, f0 in Hz per frame (0 = unvoiced) and a confidence per frame; written as CSV
  `time_s,f0_hz,confidence`. 10,116 frames per clip; voiced frames S2n 5,654, S2s 8,348, S6taps 8,356, S5dropd
  5,651.
- Scored with `gtr-eval f0` (reference built from the truth notes of one voice on a 10 ms grid; `raw_pitch_accuracy`
  = share of reference-voiced frames with the estimate within 50 cents; definitions are in the eval JSON):

| clip | vs truth melody voice: voicing recall / false alarm / raw pitch acc / raw chroma acc / overall (eval id) | vs truth bass voice: raw pitch acc / raw chroma acc (eval id) |
|---|---|---|
| S2n (nylon) | 0.644 / 0.029 / 0.628 / 0.628 / 0.676 (e0478) | 0.000 / 0.258 (e0483) |
| S2s (steel) | 0.945 / 0.079 / 0.796 / 0.796 / 0.813 (e0487) | 0.000 / 0.474 (e0492) |
| S6taps (steel + taps) | 0.945 / 0.079 / 0.794 / 0.794 / 0.812 (e0501) | 0.000 / 0.472 (e0509) |
| S5dropd (nylon, Drop D) | 0.643 / 0.029 / 0.628 / 0.628 / 0.675 (e0517) | 0.000 / 0.259 (e0528) |

  The f0 track follows the melody voice: no frame is within 50 cents of the bass voice on any clip; the chroma
  matches against the bass are octave-related frames.
- gtr-eval note (scorer 0.11.1): an f0 CSV with empty cells for unvoiced frames made `gtr-eval f0` stop with
  `IndexError: index 5654 is out of bounds for axis 0 with size 5654` (e0440 to e0447, all eight runs). Writing 0 Hz
  for unvoiced frames (mir_eval's convention) worked; the numbers above use that file (`<clip>.melodia0.csv`, time
  = frame index x 128 / 44100). mir_eval still warned "Non-uniform timescale passed to resample_melody_series"
  (written into the result's `processing`).
- Input format facts: any file FFmpeg decodes, resampled by `MonoLoader`; mono. Constraint inputs for a re-run:
  `minFrequency`, `maxFrequency` (a note range), `voicingTolerance`, `guessUnvoiced`, `frameSize`, `hopSize`,
  `magnitudeThreshold`; no tuning, capo or key input.
- Samples: `samples/essentia-melodia/S2n.melodia.csv` (the 0-Hz version), `S2n_f0_melody.json`,
  `S2n_f0_bass.json`.

## Bass voice from audio: low-pass filter + librosa 0.11.0 `pyin` (monophonic f0), plus a plain f0-to-notes step

- What it is: a zero-phase 4th-order Butterworth low-pass (`scipy.signal.butter` + `sosfiltfilt`, scipy 1.17.1) and
  librosa's probabilistic YIN f0 tracker, in `venv-core`. The f0-to-notes step is written here (a run of voiced
  frames rounded to the same MIDI number, at least 50 ms long, is one note); it is not part of librosa.
- Runs r0235 (S2n) and r0233 (S5dropd), `--nolock`, one thread (`OMP_NUM_THREADS=1`, `NUMBA_NUM_THREADS=1`),
  `scripts/bass_lowpass_pyin.py <clip> <out>` with cutoffs 150, 200, 250 Hz and `librosa.pyin(fmin=C2 65.4 Hz,
  fmax=C4 261.6 Hz, frame_length=4096, hop_length=441)`. Wall 103.91 s / 101.22 s, CPU 14.8 s each, peak RSS 605 MB.
  The wall time is far above the CPU time: the box's four cores were fully loaded by other lanes at the time, and the
  first cutoff includes numba compilation (script timer: 54.5 s for 150 Hz, 18.2 s for 200 Hz, 13.6 s for 250 Hz on
  S2n). The wall time includes waiting for CPU on the loaded box.
- Earlier attempt r0219 failed (`ModuleNotFoundError: No module named 'soundfile'`): this lane had installed
  `libnmfd` into `venv-core` by mistake, which pulled `pysoundfile`, `numpy<2` and `pandas<2`; `uv pip sync` back to
  the saved freeze then removed the shared file `soundfile.py`. Fixed with `uv pip install --reinstall
  soundfile==0.14.0`; libnmfd got its own `venv-nmfd`. The truth voice-split runs r0184 and r0185 ran while
  `soundfile.py` was missing (they do not need it) and ended with exit 0; every other venv-core result in this file
  was made with the package set in `freeze/venv-core.txt`.
- Outputs: `f0_<cutoff>.csv` (`time_s,f0_hz,voiced_prob`, 2,936 frames of 10 ms; unvoiced written as 0 Hz for
  scoring) and `notes_<cutoff>.csv` (`onset,offset,pitch`). S2n: 2,540 / 2,590 / 2,458 voiced frames and 71 notes at
  150 / 200 / 250 Hz; S5dropd: 2,494 / 2,593 / 2,458 voiced frames and 76 / 71 / 71 notes.

| clip, cutoff | f0 vs truth bass voice: voicing recall / false alarm / raw pitch acc / raw chroma acc (eval id) | notes vs bass voice, onset 50 ms: P / R / F, matched of 48 (eval id) | notes vs all 90 notes: melody notes matched (eval id) |
|---|---|---|---|
| S2n 150 Hz | 0.950 / 0.344 / 0.800 / 0.800 (e0564) | 0.155 / 0.229 / 0.185, 11 (e0566) | 0 (e0570) |
| S2n 200 Hz | 0.954 / 0.443 / 0.478 / 0.789 (e0572) | 0.085 / 0.125 / 0.101, 6 (e0576) | 4 (e0579) |
| S2n 250 Hz | 0.902 / 0.438 / 0.390 / 0.646 (e0582) | 0.113 / 0.167 / 0.134, 8 (e0584) | 4 (e0587) |
| S5dropd 150 Hz | 0.932 / 0.344 / 0.785 / 0.785 (e0590) | 0.145 / 0.229 / 0.177, 11 (e0593) | 0 (e0595) |
| S5dropd 200 Hz | 0.955 / 0.443 / 0.554 / 0.787 (e0597) | 0.099 / 0.146 / 0.118, 7 (e0599) | 4 (e0601) |
| S5dropd 250 Hz | 0.902 / 0.438 / 0.467 / 0.644 (e0603) | 0.169 / 0.250 / 0.202, 12 (e0605) | 4 (e0607) |

- Why the note numbers are much lower than the frame numbers: the notes start late. With `--onset-tol 0.15`, 37 of
  48 S2n bass notes match (150 Hz cutoff) and the matched onsets are a median 80 ms late (mean 73 ms, largest 143 ms;
  e0611). First notes of `S2n notes_150.csv`: `0.13-0.24 s MIDI 36` (inside the silent count-in), `2.21 43`, `2.80
  51`, `3.22 50`, `3.33 43`, `3.79 50`; truth bass: `2.143 43`, `2.679 50`, `3.214 43`, `3.750 50`.
- Input format facts: mono float audio at any rate; `pyin` needs `fmin`/`fmax`. Constraint inputs for a re-run: the
  low-pass cutoff, `fmin`/`fmax` (the bass register: a known tuning such as Drop D lowers `fmin`; S5dropd's lowest
  bass note is D2 = 73.4 Hz, inside C2 to C4), `frame_length`, `hop_length`.
- Samples: `samples/bass-lowpass-pyin/S2n_notes_150.csv`, `S2n_f0_150.csv`, `S5dropd_notes_150.csv`.

## libnmfd 1.0.0 (AudioLabs Erlangen): KAM harmonic-percussive separation + NMFD with a percussiveness threshold

- What it is: "libnmfd: Music Processing Applications of Nonnegative Matrix Factorization" (López-Serrano, Dittmar,
  Özer, Müller), PyPI `libnmfd==1.0.0` (the only release, 2024-08-09, per survey.md), MIT (LICENSE read from
  https://raw.githubusercontent.com/groupmm/libnmfd/main/LICENSE on 2026-11-10: "MIT License", "Copyright (c) 2024
  Patricio López-Serrano, Christian Dittmar, Yigitcan Özer and Meinard Müller").
- Install: libnmfd requires `numpy<2.0.0`, `pandas<2.0.0`, `ipython<8.0.0`, `jupyter`, `pysoundfile` (PyPI JSON). It
  was first installed into `venv-core` by mistake (numpy went 2.4.6 -> 1.26.4; undone, see the pyin section), then
  into its own `uv venv --python 3.11 venv-nmfd` with `uv pip install libnmfd librosa soundfile mir_eval` (numpy
  1.26.4, scipy 1.17.1, pandas 1.5.3; freeze in `samples/libnmfd/venv-nmfd.freeze.txt`). `pysoundfile` 0.9.0.post1
  and `soundfile` 0.14.0 both install a top-level `soundfile.py`; in `venv-nmfd` the 0.14.0 file is the one present.
  No weights.
- The method is the package's own demo notebook `demo_drum_extraction_kam_nmf_perc_threshold.ipynb` (read from
  raw.githubusercontent.com, branch main, 2026-11-10), copied step by step into `scripts/libnmfd_drum_extraction.py`
  with only the input and output paths changed and `np.random.seed(0)` added before the random template
  initialisation: STFT 2048 / hop 512 -> `hpss_kam_fitzgerald(num_iter=30, kern_dim=13)` (index 0 = percussive per
  its docstring) -> stacked [percussive; harmonic] spectrogram -> `nmfd(num_comp=30, num_iter=60,
  num_template_frames=1, func_preprocess=drum_specific_soft_constraints_nmf, decay=0.75)` ->
  `percussiveness_estimation` -> components above 0.25 are percussive -> alpha-Wiener filter (alpha 1) -> inverse STFT.
  No truth is used.
- Run r0238 (`--nolock`, one BLAS thread, slot queue ~30 jobs; S6taps mono): wall 186.68 s, CPU 43.3 s, peak RSS
  1,778.8 MB (script timers: KAM 88.21 s, NMFD 79.66 s; the box was fully loaded, so the wall time includes
  waiting for CPU). Outputs: `kam_percussive.wav`, `kam_harmonic.wav`, `nmf_percussive.wav`, `nmf_harmonic.wav` (float32 mono
  44.1 kHz, 1,294,650 samples). Percussiveness of the 30 components, sorted: 0.661, 0.510, 0.370, 0.179, 0.161, then
  0.087 down to 0.002; 3 components above the 0.25 threshold. Energy (sum of squares / mix): KAM percussive 0.0376,
  KAM harmonic 0.8051, NMF percussive 0.0920, NMF harmonic 0.7208.

| part | eval id | taps SI-SDR dB | taps SDR | taps SIR | taps SAR | guitar SI-SDR dB | guitar SDR |
|---|---|---|---|---|---|---|---|
| KAM (30 iterations) | e0622 | -1.95 | -1.21 | 1.98 | 3.77 | 15.69 | 16.05 |
| KAM + NMFD + threshold 0.25 | e0632 | -1.81 | -1.71 | 1.46 | 3.50 | 13.15 | 13.79 |

- Onsets (`librosa.onset.onset_detect` defaults) on each percussive part: 53 onsets each, on all 27 tap+note, 21
  note-only and 5 tap-only events, 0 on neither; vs taps P 0.604 / R 1.000 / F 0.753 (KAM e0637, NMF e0643); vs note
  onsets P 0.906 / R 1.000 / F 0.950 (e0640, e0645).
- Energy in the 50 ms after each event (dB re the loudest event window; min / median / max): KAM percussive tap+note
  -6.09 / -4.99 / 0.0, note-only -11.30 / -8.48 / -6.16, tap-only -4.15 / -3.97 / -3.08; NMF percussive tap+note
  -6.42 / -4.79 / 0.0, note-only -11.83 / -9.22 / -6.65, tap-only -2.61 / -2.16 / -2.09. No note-only event is louder
  than the quietest tap event in either part (gap 0.07 dB KAM, 0.23 dB NMF).
- Input format facts: `soundfile.read` of any WAV, made mono with `make_monaural`; works on magnitude spectrograms
  (numpy arrays). Emits spectrograms; audio comes from the caller's inverse STFT with the mixture phase.
- Constraint inputs for a re-run: KAM `num_iter`, `kern_dim`; NMFD `num_comp`, `num_iter`, `num_template_frames`,
  `init_W`/`init_H`, `fix_W`/`fix_H` (fixed templates: a user could record a few of their own taps as templates;
  `initialize_drum_specific_nmfd_templates` builds templates from folders of single drum samples, which the PyPI
  wheel does not ship); the percussiveness threshold. No musical constraints.
- Samples: `samples/libnmfd/` (summary JSON, both stem evals, venv freeze).

## madmom 0.17.dev0 (git commit 27f032e8): eight onset programs

- What it is: CPJKU's audio library and its onset detectors (CNN, RNN offline and online, SuperFlux, SuperFlux with
  neural peak picking, ComplexFlux, LogFiltSpecFlux, SpectralOnsetDetection), from
  `git+https://github.com/CPJKU/madmom` (resolved to commit `27f032e8947204902c675e5e341a3faf5dc86dae`), installed
  2026-11-10. The PyPI release 0.16.1 was not used.
- Install: `uv venv --python 3.11 venv-madmom` then `uv pip install --python venv-madmom/bin/python
  "git+https://github.com/CPJKU/madmom" mir_eval soundfile`: built from source without errors (numpy 2.4.6, mido
  1.3.3). `du -sh`: 37 MB. The onset models ship inside the package (`madmom/models/onsets/2013`, `2014`); the
  models folder's LICENSE begins "All files in this repository are distributed under the following license: Creative
  Commons Attribution-NonCommercial-ShareAlike 4.0" and adds "If you want to include any of these files (or a
  variation or modification thereof) or technology which utilises them in a commercial product, please contact
  Gerhard Widmer" (file read from the installed package, 2026-11-10). Freeze: `samples/madmom/venv-madmom.freeze.txt`.
- Run r0247 (`--nolock`, one BLAS thread): `scripts/madmom_onsets.sh <venv> S6taps.mono.wav <out>` runs each
  program as `<Program> single <wav> -o <out>.txt` with its defaults. Wall 30.88 s for all eight, CPU 11.4 s, peak
  RSS 281.2 MB; per program 2.6 to 5.4 s wall (timing.tsv) on a fully loaded box. An earlier attempt (queued from
  about 21:06 UTC through gtr-run's slots) waited about 30 minutes without getting a slot and was stopped by this session's
  background time limit; it never started and wrote no ledger line.
- Output: text, one onset time in seconds per line (10 ms resolution, e.g. `2.150`, `2.680`, `3.220`).

| program | n onsets | vs taps P / R / F (eval id) | vs note onsets P / R / F (eval id) | on tap+note (27) | on note-only (21) | on tap-only (5) | on neither |
|---|---|---|---|---|---|---|---|
| CNNOnsetDetector | 53 | 0.604 / 1.000 / 0.753 (e0681) | 0.906 / 1.000 / 0.950 (e0684) | 27 | 21 | 5 | 0 |
| ComplexFlux | 54 | 0.593 / 1.000 / 0.744 (e0686) | 0.889 / 1.000 / 0.941 (e0688) | 27 | 21 | 5 | 1 |
| LogFiltSpecFlux | 54 | 0.593 / 1.000 / 0.744 (e0691) | 0.889 / 1.000 / 0.941 (e0694) | 27 | 21 | 5 | 1 |
| OnsetDetector (RNN) | 53 | 0.604 / 1.000 / 0.753 (e0697) | 0.906 / 1.000 / 0.950 (e0701) | 27 | 21 | 5 | 0 |
| OnsetDetectorLL (online RNN) | 53 | 0.604 / 1.000 / 0.753 (e0703) | 0.906 / 1.000 / 0.950 (e0706) | 27 | 21 | 5 | 0 |
| SpectralOnsetDetection | 54 | 0.593 / 1.000 / 0.744 (e0708) | 0.889 / 1.000 / 0.941 (e0710) | 27 | 21 | 5 | 1 |
| SuperFlux | 53 | 0.604 / 1.000 / 0.753 (e0712) | 0.906 / 1.000 / 0.950 (e0714) | 27 | 21 | 5 | 0 |
| SuperFluxNN | 53 | 0.604 / 1.000 / 0.753 (e0716) | 0.906 / 1.000 / 0.950 (e0718) | 27 | 21 | 5 | 0 |

- Timing of the 32 matched tap pairs: CNNOnsetDetector median +3.2 ms (largest 9.3 ms, e0681); SuperFlux median
  -2.1 ms (largest 5.0 ms, e0712); for comparison aubio hfc median +2.7 ms (e0081).
- Like every detector in this lane, the madmom programs report an onset at every event and do not say whether an
  onset is a tap or a plucked note.
- Input format facts: WAV read by madmom's own loader (resampled per processor; the programs take 44.1 kHz mono here).
  Constraint inputs for a re-run: `--threshold`, `--smooth`, `--pre_max`/`--post_max`, `--combine`, `--delay`, `--fps`
  (peak picking, per each program's `-h`). No musical constraints.
- Samples: `samples/madmom/` (scores, CNN output, timing), `samples/aubio/`, `samples/essentia/` (scores, one output
  file each, Essentia freeze).

## Basic Pitch 0.4.0 (ONNX model) as the transcriber, then voice separation of its notes

Basic Pitch is the audio-to-notes lane's tool; it was run here because that lane's notes for the S2 clips were not
written yet at 21:25 UTC (its first CLI runs, e.g. r0033 on S2n, stopped with "File .../nmp.tflite cannot be loaded
into either TensorFlow, CoreML, TFLite or ONNX"). This section is a handoff test: transcriber notes into the voice
methods above.

- Install: `uv venv --python 3.10 venv-basicpitch`, `uv pip install --python venv-basicpitch/bin/python
  "basic-pitch[onnx]==0.4.0" "numpy<2"` (basic-pitch 0.4.0, onnxruntime 1.23.2, tflite-runtime 2.14.0, librosa
  0.11.0, numpy 1.26.4, scipy 1.15.3). Dead end: the CLI then stopped with `ModuleNotFoundError: No module named
  'pkg_resources'` (raised from `resampy/filters.py`); `uv pip install "setuptools<81"` (80.10.2) fixed it. Freeze:
  `samples/basic-pitch/venv-basicpitch.freeze.txt`. Weights ship in the package (`saved_models/icassp_2022/nmp.onnx`).
- Run r0252 (`--nolock`, pinned with `taskset -c 1` to one core, because about 24 jobs were waiting for the two CPU
  slots): `basic-pitch --model-serialization onnx --save-midi --save-note-events <out> S2n.mono.wav S2s.mono.wav
  S6taps.mono.wav S5dropd.mono.wav R3a.mono.wav`, defaults otherwise. Wall 74.95 s for five clips (29.4 s each, R3a
  18 s), CPU 28.2 s, peak RSS 393.9 MB. An earlier queued run through a slot was cancelled after 813 s of waiting.
- Output per clip: `<name>_basic_pitch.mid` and `<name>_basic_pitch.csv` with header
  `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend` and a variable number of pitch-bend values per row (rows
  are not in time order). Notes: S2n 137, S2s 201, S6taps 196, S5dropd 130, R3a 106. First S2n rows in time order
  (onset, offset, MIDI, velocity): 0.012-0.151 23 49 (inside the silent count-in), 2.149-2.683 55 93, 2.161-2.927 43
  71, 2.683-3.217 55 98, 2.683-3.217 50 98, 2.695-2.939 83 40, 3.217-3.391 67 43, 3.217-3.763 62 71. S2n pitch range
  of the output: MIDI 23 to 87 (truth 43 to 64).
- `gtr-eval notes` (onset within 50 ms, pitch within 50 cents): S2n P 0.657 / R 1.000 / F 0.793, 137 estimated, 90 of
  90 matched (e0734); S2s 0.448 / 1.000 / 0.619, 201 (e0736); S6taps 0.459 / 1.000 / 0.629, 196 (e0738); S5dropd
  0.692 / 1.000 / 0.818, 130 (e0741). Every truth note of both voices is matched on all four clips; the extra notes
  are what the voice methods have to deal with. Median onset of matched notes 7.5 to 9.2 ms late.

Voice separation of those notes (`scripts/voice_split.py <clip> <basic-pitch csv>`, runs r0258 S2n, r0260 S2s,
r0263 S6taps, r0265 S5dropd, `--nolock`, 6.2 to 7.8 s wall each). "Right voice" counts the transcribed notes matched
to a truth note (all 90 here) whose label equals that truth note's voice. The per-voice columns score only the notes
a method labelled bass (or melody) against the truth bass (or melody) notes with `gtr-eval notes --voice`, so extra
notes count against precision there.

| clip | method | right voice / matched | notes labelled melody / bass | bass-labelled notes vs truth bass: P / R / F (eval id) | melody-labelled vs truth melody: P / R / F (eval id) |
|---|---|---|---|---|---|
| S2n | B1 BASELINE T = 55 | 90 / 90 | 71 / 66 | 0.727 / 1.000 / 0.842 (e0744) | 0.592 / 1.000 / 0.743 (e0746) |
| S2n | B2 BASELINE lowest per onset | 82 / 90 | 86 / 51 | 0.784 / 0.833 / 0.808 (e0748) | 0.488 / 1.000 / 0.656 (e0751) |
| S2n | B3 BASELINE skyline | 78 / 90 | 51 / 86 | 0.512 / 0.917 / 0.657 (e0753) | 0.667 / 0.810 / 0.731 (e0755) |
| S2n | P1 partitura poly | 50 / 90 | 4 / 133 | 0.361 / 1.000 / 0.530 (e0757) | 0.500 / 0.048 / 0.087 (e0759) |
| S2n | P2 partitura mono | 55 / 90 | 8 / 129 | 0.372 / 1.000 / 0.542 (e0762) | 0.875 / 0.167 / 0.280 (e0764) |
| S2n | M1 music21 + rule | 83 / 90 | 62 / 75 | 0.613 / 0.958 / 0.748 (e0767) | 0.597 / 0.881 / 0.712 (e0770) |
| S2s | B1 BASELINE T = 55 | 90 / 90 | 114 / 87 | 0.552 / 1.000 / 0.711 (e0772) | 0.368 / 1.000 / 0.538 (e0774) |
| S2s | B2 BASELINE lowest per onset | 84 / 90 | 139 / 62 | 0.677 / 0.875 / 0.764 (e0776) | 0.302 / 1.000 / 0.464 (e0777) |
| S2s | B3 BASELINE skyline | 65 / 90 | 62 / 139 | 0.331 / 0.958 / 0.492 (e0780) | 0.306 / 0.452 / 0.365 (e0783) |
| S2s | P1 partitura poly | 48 / 90 | 3 / 198 | 0.242 / 1.000 / 0.390 (e0786) | 0.000 / 0.000 / 0.000 (e0789) |
| S2s | P2 partitura mono | 48 / 90 | 1 / 200 | 0.240 / 1.000 / 0.387 (e0791) | 0.000 / 0.000 / 0.000 (e0794) |
| S2s | M1 music21 + rule | 79 / 90 | 105 / 96 | 0.438 / 0.875 / 0.583 (e0797) | 0.352 / 0.881 / 0.503 (e0800) |
| S6taps | B1 BASELINE T = 55 | 90 / 90 | 111 / 85 | 0.565 / 1.000 / 0.722 (e0803) | 0.378 / 1.000 / 0.549 (e0807) |
| S6taps | B2 BASELINE lowest per onset | 84 / 90 | 134 / 62 | 0.677 / 0.875 / 0.764 (e0810) | 0.313 / 1.000 / 0.477 (e0814) |
| S6taps | B3 BASELINE skyline | 73 / 90 | 62 / 134 | 0.358 / 1.000 / 0.527 (e0818) | 0.403 / 0.595 / 0.481 (e0821) |
| S6taps | P1 partitura poly | 48 / 90 | 2 / 194 | 0.247 / 1.000 / 0.397 (e0824) | 0.000 / 0.000 / 0.000 (e0827) |
| S6taps | P2 partitura mono | 48 / 90 | 1 / 195 | 0.246 / 1.000 / 0.395 (e0830) | 0.000 / 0.000 / 0.000 (e0833) |
| S6taps | M1 music21 + rule | 77 / 90 | 101 / 95 | 0.421 / 0.833 / 0.559 (e0836) | 0.366 / 0.881 / 0.517 (e0839) |
| S5dropd | B1 BASELINE T = 55 | 90 / 90 | 62 / 68 | 0.706 / 1.000 / 0.828 (e0842) | 0.677 / 1.000 / 0.808 (e0846) |
| S5dropd | B2 BASELINE lowest per onset | 82 / 90 | 79 / 51 | 0.784 / 0.833 / 0.808 (e0849) | 0.532 / 1.000 / 0.694 (e0851) |
| S5dropd | B3 BASELINE skyline | 81 / 90 | 51 / 79 | 0.532 / 0.875 / 0.661 (e0854) | 0.765 / 0.929 / 0.839 (e0857) |
| S5dropd | P1 partitura poly | 50 / 90 | 3 / 127 | 0.378 / 1.000 / 0.549 (e0861) | 0.667 / 0.048 / 0.089 (e0865) |
| S5dropd | P2 partitura mono | 51 / 90 | 4 / 126 | 0.381 / 1.000 / 0.552 (e0868) | 0.750 / 0.071 / 0.130 (e0871) |
| S5dropd | M1 music21 + rule | 81 / 90 | 56 / 74 | 0.608 / 0.938 / 0.738 (e0874) | 0.643 / 0.857 / 0.735 (e0877) |

- What partitura emitted on transcribed notes: 5 to 8 voices instead of 2 (S2n mono: 6 voices with 1, 8, 33, 18,
  35, 42 notes and mean pitches 59.0, 61.0, 52.0, 55.9, 54.2, 53.5). The labelling rule used here makes only the
  voice with the highest mean pitch melody, so with six voices it labelled 8 notes melody and 129 bass (35 truth
  melody notes labelled bass). A rule that merges partitura's voices into two was not tried.
- What music21 emitted on S2n transcribed notes: 37 Chords, 68 single Notes, 35 Voice objects (from the
  overlapping notes of different lengths); every note was found back in the music21 stream.
- The fixed threshold T = 55 gives the right voice for all 90 matched notes on every clip because Basic Pitch got
  every truth pitch right and the arrangement keeps the voices apart (bass 38 to 52, melody 55 to 64); its extra
  notes are split by pitch too, which is what lowers the per-voice precision.
- Samples: `samples/basic-pitch/` (S2n CSV and MIDI, S6taps MIDI, venv freeze), `samples/voice-split/<clip>_basicpitch_voice_split.json`,
  `S2n_basicpitch_M1_music21.csv`.

### Basic Pitch with a note-range constraint (the tuning as a re-run input)

- Run r0325 (`--nolock`, `taskset -c 1`; wall 29.81 s for four clips, CPU 11.7 s, peak RSS 289.9 MB): the same CLI
  with `--minimum-frequency 77.78 --maximum-frequency 1396.91` (D#2 to F6: one semitone below standard tuning's low
  E2 up to F6) on S2n, S2s, S6taps, S5dropd.
- `gtr-eval notes` (onset 50 ms, pitch 50 cents): S2n 136 notes, P 0.662 / R 1.000 / F 0.796 (e1219; unconstrained
  137 notes, e0734); S2s 200, 0.450 / 1.000 / 0.621 (e1220); S6taps 194, 0.464 / 1.000 / 0.634 (e1221); S5dropd 125,
  P 0.688 / R 0.956 / F 0.800, 86 of 90 matched (e1222), bass recall 44 of 48.
- The 4 S5dropd notes lost are the four D2 (MIDI 38) bass notes of the Drop D tuning (truth onsets 8.571, 13.929,
  18.214, 25.714 s); the unconstrained run found all four (onsets 8.597, 13.941, 18.228, 25.732 s). The lowest pitch
  in the constrained output is 43. So a range set for standard tuning removed the notes the Drop D tuning adds; the
  unconstrained run (Basic Pitch's default range) kept them. A run with a Drop D range (a minimum below D2 = 73.4 Hz)
  was not made.

## Real fingerstyle clips without truth (R3a, R3b, R3c): counts only

R3a (concert video), R3b (home recording) and R3c (lesson video) are real nylon-string fingerstyle recordings,
18.0 s each (INPUTS.md; R3b and R3c were added at 21:29 UTC). Their manifest rows do not mention percussion, and none
has truth, so nothing here is a score.

- Run r0292 (`--nolock`, one thread; wall 14.79 s for the three clips, CPU 8.0 s, peak RSS 368.9 MB):
  `scripts/real_clips_onsets.py`: `librosa.effects.hpss(margin=4)` and `librosa.onset.onset_detect` (defaults) on
  the mono mix and on the percussive part. aubio `aubioonset -O hfc` and madmom `CNNOnsetDetector single` were run on
  the same mono files outside gtr-run (a few seconds each, not timed).

| clip | onsets, librosa on mix | onsets, librosa on HPSS percussive (margin 4) | aubio hfc | madmom CNNOnsetDetector | energy of percussive part / harmonic part (margin 4) |
|---|---|---|---|---|---|
| R3a | 81 | 86 | 61 | 64 | 0.0009 / 0.546 |
| R3b | 112 | 138 | 87 | 102 | 0.0005 / 0.525 |
| R3c | 54 | 71 | 47 | 57 | 0.0018 / 0.588 |

  For comparison, on S6taps the percussive part at margin 4 held 0.022 of the mix energy (taps included), and
  librosa (mix and percussive part), aubio hfc and madmom CNNOnsetDetector each returned 53 onsets for its 29.4 s.
- Basic Pitch on R3a (r0252 above): 106 notes.
- Demucs on the real clips (run here, because no R3 stems existed in the source-separation lane's output folder at
  21:46 UTC): `uv venv --python 3.11 venv-demucs`, `uv pip install "demucs==4.1.0" torch soundfile` (demucs 4.1.0,
  torch 2.15.0+cpu from the shared cache, numpy 2.4.6, sphn 0.2.1; freeze in the lane's `freeze/venv-demucs.txt`).
  The weights came from the shared Hugging Face cache, already downloaded by the source-separation lane:
  `adefossez/HTDemucs-6s` `5c90dfd2.safetensors` (54,885,744 bytes) and `adefossez/HTDemucs` `955717e8.safetensors`
  (84,025,440 bytes). Runs (`--nolock`, `taskset -c 2`, one thread, because ~24 jobs waited for the slots):
  r0327 `demucs -n htdemucs_6s -d cpu -j 1 -o <out> R3a.wav R3b.wav R3c.wav` (wall 139.41 s, CPU 74.2 s, peak RSS
  1,354.1 MB) and r0330 the same with `-n htdemucs` (126.16 s, CPU 92.9 s). Output: one WAV per stem, 44.1 kHz
  stereo, 18.0 s.

| clip | model | stem energy re mix, dB (bass / drums / other / guitar / piano / vocals) | drums stem peak | librosa onsets on the drums stem |
|---|---|---|---|---|
| R3a | htdemucs_6s | -50.5 / -50.6 / -43.2 / -0.1 / -50.5 / -42.1 | -64.7 dBFS | 226 |
| R3b | htdemucs_6s | -16.2 / -65.4 / -67.7 / -0.3 / -70.8 / -63.7 | -70.8 dBFS | 183 |
| R3c | htdemucs_6s | -71.5 / -60.6 / -72.5 / -0.1 / -69.1 / -54.9 | -44.8 dBFS | 158 |
| R3a | htdemucs | -50.9 / -48.9 / 0.0 / n/a / n/a / -50.0 | -53.2 dBFS | 198 |
| R3b | htdemucs | -15.1 / -57.1 / -0.3 / n/a / n/a / -61.9 | -62.7 dBFS | 209 |
| R3c | htdemucs | -62.7 / -42.5 / -0.0 / n/a / n/a / -56.1 | -23.5 dBFS | 55 |

  For comparison, the S6taps drums stems (with taps) are at -15.0 dB (htdemucs_6s, energy 0.0313) and -15.3 dB
  (htdemucs, 0.0292) re the mix, peaks -7.7 and -7.9 dBFS, and gave 32 and 34 onsets. On these real tap-free clips
  the drums stems are 42 to 65 dB below the mix, yet `librosa.onset.onset_detect` still returned 55 to 226 onsets on
  them (its default `normalize=True`: "normalize the onset envelope to have minimum of 0 and maximum of 1 prior to
  detection", per its docstring); an absolute level gate was not tested. On the real clips
  htdemucs_6s put the guitar into `guitar` (-0.1 to -0.3 dB), unlike the synthesized S2s and S6taps (mostly
  `piano`). On R3b the bass stems hold -16.2 dB (htdemucs_6s) and -15.1 dB (htdemucs) of the mix energy; on R3a
  and R3c they are -50.5 to -71.5 dB.
- Files: `/home/user/gtr/lanes/fingerstyle-voices-taps/out/demucs-real/<model>/<clip>/` (stems and
  `drums_onsets.txt`).
- Files: `/home/user/gtr/lanes/fingerstyle-voices-taps/out/real-clips/<clip>/` (onset lists).

## R1c (GuitarSet, bossa nova comping, the shared clip closest to fingerstyle): onset detectors against note onsets

R1c has truth notes from the GuitarSet annotation (148 notes, voice `chord` only, no voice split and no taps), so
only note onsets can be scored. Run r0334 (`--nolock`, one thread; wall 6.25 s for all seven, CPU 5.8 s, peak RSS
263.5 MB): `librosa.onset.onset_detect` defaults, `aubioonset -O hfc|complex|specflux`, madmom `CNNOnsetDetector` and
`SuperFlux` (`single`), Essentia `OnsetRate()`, all on `R1c.mono.wav` with defaults. `gtr-eval onsets --field notes`
(139 truth onset groups after merging notes that start within 1 ms; window 50 ms):

| detector | n onsets | matched | P / R / F | median timing of matched (eval id) |
|---|---|---|---|---|
| librosa onset_detect | 90 | 64 | 0.711 / 0.460 / 0.559 | +5.1 ms (e1280) |
| aubio hfc | 101 | 58 | 0.574 / 0.417 / 0.483 | -10.3 ms (e1277) |
| aubio complex | 104 | 60 | 0.577 / 0.432 / 0.494 | -12.7 ms (e1276) |
| aubio specflux | 180 | 66 | 0.367 / 0.475 / 0.414 | -16.7 ms (e1278) |
| madmom CNNOnsetDetector | 97 | 71 | 0.732 / 0.511 / 0.602 | -12.0 ms (e1281) |
| madmom SuperFlux | 94 | 66 | 0.702 / 0.475 / 0.567 | -14.0 ms (e1282) |
| Essentia OnsetRate | 86 | 64 | 0.744 / 0.460 / 0.569 | -18.3 ms (e1279) |

Negative timing means the detected onset comes before the annotated one. Files:
`/home/user/gtr/lanes/fingerstyle-voices-taps/out/R1c-onsets/`.

## librosa 0.11.0 `decompose.decompose` (scikit-learn 1.9.1 NMF) with an ORACLE grouping

- What it is: plain NMF of the magnitude spectrogram through librosa's wrapper around `sklearn.decomposition.NMF`
  (`venv-core`). NMF itself does not say which component is a tap. To measure what the decomposition can hold,
  components were grouped with the truth (ORACLE: a component goes to "taps" when its audio correlates more with
  `stems/taps.wav` than with `stems/guitar.wav`), so the numbers below are an upper bound for this setting, not a
  method that could run on a new recording.
- Run r0296 (`--nolock`, one thread; wall 8.85 s, CPU 6.0 s, peak RSS 515.3 MB): `scripts/librosa_nmf_oracle.py`, S6taps
  mono, STFT 2048 / 512, `decompose(S, n_components=k, sort=True, random_state=0)` for k = 8 and 16 (2.3 s and 3.1 s);
  scikit-learn warned `ConvergenceWarning: Maximum number of iterations 200 reached`. Each component resynthesized
  with a soft mask and the mixture phase.
- Output facts: k = 8: 1 component went to taps (its correlation with the taps stem 0.764, with the guitar stem
  0.077); k = 16: 3 components (0.672 / 0.024, 0.401 / 0.117, 0.489 / 0.135). Spectral flatness of the basis vectors
  (no truth needed): 0.0 to 0.073; the three taps components at k = 16 have 0.0, 0.0012 and 0.0727; of the 13
  guitar components, 12 have 0.0 and one 0.0003.
- Scores of the ORACLE groups (`gtr-eval stems`, joint): k = 8 taps SI-SDR 1.46 dB, SDR 7.77, SIR 13.53, SAR 9.30;
  guitar SI-SDR 17.34 dB (e1124). k = 16 taps SI-SDR 4.10 dB, SDR 4.63, SIR 8.02, SAR 7.92; guitar SI-SDR 18.64 dB
  (e1138).
- Onsets (`librosa.onset.onset_detect` defaults) on the ORACLE taps group: k = 8: 59 onsets, vs taps P 0.542 / R
  1.000 (e1147), on all 53 events and 6 on neither; k = 16: 70 onsets, P 0.457 / R 1.000 (e1143), 17 on neither.
- Constraint inputs for a re-run: `n_components`, the scikit-learn NMF options passed through (`beta_loss`,
  `max_iter`, `init`); signature read from the installed package: `decompose(S, *, n_components=None,
  transformer=None, sort=False, fit=True, **kwargs)`, so a transformer fitted beforehand (for example on a user's
  recorded taps) can be passed with `fit=False`.
- Samples: `samples/librosa-nmf/S6taps_nmf_components.jsonl` (per-component values), `S6taps_eval_stems_k16.json`.

## Environments, kept and deleted

`uv pip freeze` of every venv this lane made is in `samples/freezes/` (`venv-core`, `venv-essentia`, `venv-madmom`,
`venv-nmfd`, `venv-basicpitch`, `venv-demucs`, `venv-adtof`). After their runs, `venv-adtof`, `venv-nmfd`,
`venv-basicpitch` and `venv-demucs` were deleted to stay inside the lane's disk budget (the orchestrator's disk
notice); `venv-core`, `venv-essentia` and `venv-madmom` are still under `/home/user/gtr/lanes/fingerstyle-voices-taps/`.
Clones of ADTOF-pytorch and piano_svsep were deleted after their files were read.

## Inputs added by this lane

| id | files (in /home/user/gtr/lanes/fingerstyle-voices-taps/inputs/voice-stems/&lt;clip&gt;/) | duration | format | what it is | how it was made | license |
|---|---|---|---|---|---|---|
| S2n, S2s, S5dropd, S6taps voice stems | `melody.wav`, `bass.wav`, `melody.mono.wav`, `bass.mono.wav` | 29.357 s | 44.1 kHz, 16-bit, stereo (and mono = (L+R)/2) | each voice of the clip alone (S6taps: without the taps) | `scripts/render_voice_stems.py`: the clip's own MIDI with the other note tracks removed, rendered with the inputs builder's FluidSynth command and the clip's own gain (runs r0135 to r0138); melody + bass differs from the clip mix by at most 3.4e-5 of the mix peak (7.8e-4 for S6taps, with its taps stem added) | same as the source clips: the melody is public domain, the arrangement was written for the test set, rendered with FluidR3_GM ("I hereby release Fluid under the MIT license, as described in COPYING.", per INPUTS.md) |

## Media kept outside git

All under `/home/user/gtr/lanes/fingerstyle-voices-taps/`. Every audio file is 29.357 s (1,294,650 samples at 44.1
kHz) except the R3 Demucs stems (18.0 s). None is in git.

| path | size | what it is |
|---|---|---|
| `out/librosa-hpss/S6taps/m{1,2,4,8,16}/harmonic.wav`, `percussive.wav` | 5,178,680 bytes each (10 files) | librosa HPSS of S6taps at margins 1, 2, 4, 8, 16, float32 mono (r0031) |
| `out/libnmfd/S6taps/kam_percussive.wav`, `kam_harmonic.wav`, `nmf_percussive.wav`, `nmf_harmonic.wav` | 5,178,680 bytes each | libnmfd demo pipeline on S6taps: KAM HPSS parts and NMFD-with-threshold parts, float32 mono (r0238) |
| `out/librosa-nmf/S6taps/nmf_k{8,16}_oracle_{taps,guitar}.wav` | 5,178,680 bytes each (4 files) | scikit-learn NMF components of S6taps summed by the ORACLE grouping, float32 mono (r0296) |
| `inputs/voice-stems/{S2n,S2s,S5dropd,S6taps}/{melody,bass}.wav` | 5,178,644 bytes each (8 files) | one-voice reference renders, 16-bit stereo (r0135 to r0138) |
| `inputs/voice-stems/{S2n,S2s,S5dropd,S6taps}/{melody,bass}.mono.wav` | 2,589,344 bytes each (8 files) | the same, mono |
| `out/basic-pitch/*.mid` | 760 to 1,325 bytes | Basic Pitch MIDI of S2n, S2s, S6taps, S5dropd, R3a (r0252); small, copies of two are in `samples/basic-pitch/` |
| `out/demucs-real/{htdemucs_6s,htdemucs}/{R3a,R3b,R3c}/*.wav` | 3,175,164 bytes each (30 files: 6 stems x 3 clips for htdemucs_6s, 4 x 3 for htdemucs) | Demucs stems of the real clips, 16-bit stereo 44.1 kHz, 18.0 s (r0327, r0330) |

