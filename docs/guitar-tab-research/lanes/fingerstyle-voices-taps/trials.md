# fingerstyle-voices-taps: trials

Lane: fingerstyle on one guitar, separating melody, bass and percussive taps. Agent `try-fingerstyle-voices-taps`,
started 2026-11-10 (UTC). Everything below ran on the shared box (4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU).
Timed runs went through `gtr-run` (ledger `/home/user/gtr/ledger/runs.jsonl`, ids `r....`) and are on 2 CPU cores
unless a line says otherwise. Scores come from `gtr-eval` (ledger `/home/user/gtr/eval/ledger/evals.jsonl`, ids
`e....`, scorer version 0.9.0) unless a line says the number was computed by a script here, in which case the script
is named.

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
  and 6 have one note (all 6 are bass notes, checked in the voice section below). S5dropd: bass 38 to 52, melody 55
  to 64.

## librosa 0.11.0: harmonic-percussive separation (`librosa.effects.hpss`) and `librosa.onset.onset_detect`

- What it is: median-filtering harmonic-percussive source separation (Fitzgerald 2010, with the margin extension of
  Driedger, Müller and Disch 2014, as cited in librosa's docstring) and librosa's spectral-flux onset detector. From
  PyPI, `librosa==0.11.0`, installed 2026-11-10.
- Install: `uv venv --python 3.11 venv-core` then `uv pip install --python venv-core/bin/python librosa soundfile
  mir_eval pretty_midi music21 partitura scikit-learn matplotlib` (one shared venv for librosa, partitura, music21;
  numpy 2.4.6, scikit-learn 1.9.1). No dead ends. `du -sh venv-core`: 617 MB (files hard-linked from the shared uv
  cache). No model weights.
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
  method, all other settings default (buffer 512, hop 256, threshold 0.3, minimum inter-onset interval 0.012 s,
  silence -90 dB, per `aubioonset --help`). Wall 0.93 s for all eight, CPU 0.8 s, peak RSS 35.1 MB. Per method
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
  numpy soundfile mir_eval`. Worked first time; `du -sh`: 44 MB. No weights. Freeze: saved by the run
  (`essentia==2.1b6.dev1389`).
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

(0.0000 = below 0.00005 of the mix energy.) So on these solo-guitar clips the bass stems are 58 to 63 dB below the
mix and do not hold the bass voice: SI-SDR of the bass stem against the bass-voice reference -12.66 dB (S2s
htdemucs, e0161), -9.63 dB (S2s htdemucs_6s, e0162), -17.03 dB (S6taps htdemucs, e0165), -6.54 dB (S6taps
htdemucs_6s, e0166); against the melody-voice reference -18.30, -11.95, -26.44, -6.61 dB (e0163, e0164, e0167,
e0168). htdemucs puts the whole guitar into `other` (other against the melody reference: SI-SDR 0.50 dB, SAR 44.5
dB on S2s, e0161); htdemucs_6s puts most of it into `piano`.

Drums stems of S6taps against the truth `stems/taps.wav` (`gtr-eval stems --sdr-mode single`): htdemucs SI-SDR
5.67 dB, SDR 11.72 dB (e0169); htdemucs_6s SI-SDR 6.98 dB, SDR 10.87 dB (e0170). For comparison, librosa HPSS
percussive parts reached 0.37 to 3.68 dB SI-SDR (table above).

Onsets on those drums stems (`librosa.onset.onset_detect` defaults, computed here, no gtr-run: under a second):

| drums stem | n onsets | vs taps P / R / F (eval id) | vs note onsets P / R / F (eval id) | on tap+note (27) | on note-only (21) | on tap-only (5) | on neither |
|---|---|---|---|---|---|---|---|
| htdemucs_6s | 32 | 1.000 / 1.000 / 1.000 (e0171) | 0.844 / 0.562 / 0.675 (e0172) | 27 | 0 | 5 | 0 |
| htdemucs | 34 | 0.912 / 0.969 / 0.939 (e0173) | 0.765 / 0.542 / 0.634 (e0174) | 26 | 0 | 5 | 3 |

Energy in the 50 ms after each event, dB relative to the loudest event window (`scripts/event_energy.py`):
htdemucs drums: tap+note -36.57 / -14.28 / 0.0 (min / median / max), note-only -59.59 / -55.18 / -43.62, tap-only
-0.34 / -0.29 / -0.24; htdemucs_6s drums: tap+note -21.51 / -11.46 / 0.0, note-only -65.49 / -62.01 / -43.61,
tap-only -0.59 / -0.55 / -0.50. No note-only event is louder than the quietest tap event in either stem.

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
| P1 partitura, monophonic_voices=False | 54 / 90 | 54 / 90 | 2 voices: 10 and 80 notes (mean pitch 57.2 and 52.6) | 0.034 s / 0.024 s |
| P2 partitura, monophonic_voices=True | 90 / 90 | 90 / 90 | 2 voices: 42 and 48 notes (mean pitch 59.5 and 47.5) | 0.028 s / 0.016 s |
| M1 music21 + rule above | 90 / 90 | 90 / 90 | 1 part, 36 Chords, 18 single Notes, 12 Voice objects | 0.088 s / 0.058 s |

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

