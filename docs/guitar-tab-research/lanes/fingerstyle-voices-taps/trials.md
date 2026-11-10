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

