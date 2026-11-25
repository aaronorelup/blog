# Step 4: chords, beat, bars, tempo, key (exp-chords, 2026-11-25)

Techniques c-01 to c-06 of `../experiments.json` on the three recordings. Every number below is copied from the
`result.json` of its folder, `/home/user/gtv/experiments/<S>/<exp>/` (scores exactly as `gtr-eval` 0.12.1 printed
them; `score.sh` holds the commands, `eval_*.json` the full output, eval ids in `result.json`). Truth:
`/home/user/gtv/truth/<S>/<S>.truth.json`, scored over the whole `scored_range` (the full file on all three songs).
MiMo runs on the 30 s segment are scored against the segment truth (`crop_truth.py`: capo t0 12.76 s, standard t0 0.0 s;
tuning: the truth folder's `tuning.seg30.truth.json`, t0 25.0 s), copies in `/home/user/gtv/work/exp-chords/tr30/`.
Audio: `songs/<S>/<S>.wav`; for tuning `truth/tuning/tuning.wav` (the songs folder has no `tuning.wav`).

## Runs: scope, wall time on 2 cores (gtr-run id)

| exp | tool | scope | capo | tuning | standard |
|---|---|---|---|---|---|
| c-01 | Beat This! 1.1.0, final0 | whole song | 13.59 s (r0813) | 9.37 s (r0865) | 15.41 s (r0858) |
| c-02 | madmom 0.16.1: DBN beats, DBN downbeats [3,4], tempo comb, CNN + deep-chroma chords, CNN key | whole song | 157.76 s (r0825) | 125.56 s (r0866) | 125.32 s (r0861) |
| c-02-hint | madmom DBN beats + downbeats with min/max BPM = true tempo +-10 %, beats_per_bar [4] | whole song | 74.17 s (r0845) | 56.1 s (r0867) | 51.59 s (r0862) |
| c-03 | Chordino + NNLS Tuning (chord-extractor 0.1.3) | whole song | 10.66 s (r0849) | 8.16 s (r0869) | 7.86 s (r0863) |
| c-04 | lv-chordia 1.1.0 (submission and ismir2017 dictionaries) | whole song | 64.88 s (r0854) | 31.11 s (r0870) | 29.03 s (r0864) |
| c-05 | All-In-One 1.1.0 | not run | skipped | skipped | skipped |
| c-06 | MiMo v2.6 Flash (Vercel AI Gateway), chords + tempo + key | 30 s segment, mono | 8.3 s (r0783) | 14.97 s (r0786) | 12.68 s (r0785) |
| c-06 repeat | the identical request sent again (`c-06/repeat2/`) | 30 s segment | r0885 | r0892 | r0889 |
| c-06-hint | c-06 prompt plus one sentence: true tuning and capo, 4/4, "give sounding names" (no tempo, no key) | 30 s segment | 35.94 s (r0888) | 51.15 s (r0893) | 8.57 s (r0890) |

Hints: Beat This, Chordino, lv-chordia and madmom's chord and key recognisers take no tuning, capo, tempo or range
argument, so they have no -hint run. madmom's DBN trackers take a tempo range and a meter (c-02-hint). The chord
tools all name sounding chords; the truth chords are sounding chords too (capo 3 song in Bb, tuning song a whole step
below the tab's shape names), so no capo or tuning transposition enters the chord scores.

Canonical files per folder: `beats.txt` (c-01: `time<TAB>beat number` from its downbeats; c-02: madmom's DBN beat
tracker, one time per line; its `downbeats.txt` is the downbeat tracker's own grid with beat numbers), `chords.lab`
(c-02 CNN, c-03 Chordino default, c-04 submission dictionary, c-06 recording timeline with `chords.seg30.lab` beside),
`click.wav` for every beat tracker (2 kHz on beat 1, 1 kHz on the other beats, mixed over the recording; c-02 and
c-02-hint clicks are built from `downbeats.txt`), `render.wav` for every chord timeline (bass note plus chord tones,
FluidSynth program 24, via `notes2wav.py`; labels read with gtr-eval's own `normalize_chord`).
For comparison: truth clicks `/home/user/gtv/work/exp-chords/clicks/<S>.truth.click.wav` and truth chords played
`/home/user/gtv/work/exp-chords/render/<S>.truth.chords.wav`.

## Scores

**Beats: F-measure (70 ms) / CMLt / AMLt (gtr-eval beats)**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-01 Beat This | 0.998 / 0.997 / 0.997 | 0.050 / 0.194 / 0.194 | 0.989 / 0.987 / 0.987 |
| c-02 madmom | 0.993 / 0.986 / 0.986 | 0.035 / 0.158 / 0.158 | 0.973 / 1.000 / 1.000 |
| c-02-hint madmom + tempo/meter hint | 0.993 / 0.986 / 0.986 | 0.015 / 0.176 / 0.176 | 0.973 / 1.000 / 1.000 |

**Beats matched / truth beats; median offset of matched (s)**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-01 Beat This | 288/288 / -0.011 | 10/193 / 0.029 | 221/224 / -0.009 |
| c-02 madmom | 288/288 / -0.014 | 7/193 / -0.014 | 218/224 / -0.014 |
| c-02-hint madmom + tempo/meter hint | 288/288 / -0.014 | 3/193 / 0.064 | 218/224 / -0.014 |

**Downbeats: F-measure / CMLt (c-01: its own downbeats; c-02: beat-1 rows of the DBN downbeat tracker)**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-01 Beat This | 0.986 / 0.959 | 0.117 / 0.907 | 0.964 / 1.000 |
| c-02 madmom | 0.664 / 0.000 | 0.000 / 0.633 | 0.982 / 1.000 |
| c-02-hint madmom + tempo/meter hint | 0.993 / 0.986 | 0.020 / 1.000 | 0.982 / 1.000 |

**madmom downbeat tracker beat grid: F / CMLt / AMLt / matched**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-02 madmom | 0.664 / 0.000 / 0.991 / 288/288 | 0.070 / 0.192 / 0.192 / 13/193 | 0.982 / 1.000 / 1.000 / 220/224 |
| c-02-hint madmom + hint | 0.997 / 0.993 / 0.993 / 288/288 | 0.005 / 0.254 / 0.254 / 1/193 | 0.982 / 1.000 / 1.000 / 220/224 |

**Tuning song phase check: median offset to nearest truth beat (s); beats F / downbeats F after moving by it**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-01 Beat This | - / - / - | 0.195 / 0.832 / 0.544 | - / - / - |
| c-02 madmom | - / - / - | 0.197 / 0.773 / 0.442 | - / - / - |
| c-02-hint madmom + tempo/meter hint | - / - / - | 0.199 / 0.864 / 0.653 | - / - / - |

**Tempo: estimate (BPM) / relative deviation / within 4 % (truth capo 76.56, tuning 65.73, standard 76.14)**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-01 Beat This | 77.000 / 0.006 / True | 72.000 / 0.095 / False | 76.000 / -0.002 / True |
| c-02 madmom | 77.000 / 0.006 / True | 65.000 / -0.011 / True | 76.000 / -0.002 / True |
| c-02-hint madmom + tempo/meter hint | 77.000 / 0.006 / True | 66.000 / 0.004 / True | 76.000 / -0.002 / True |
| c-06 MiMo (seg30) | 96.000 / 0.254 / False | 76.000 / 0.156 / False | 55.000 / -0.278 / False |
| c-06-hint MiMo + hint (seg30) | 60.000 / -0.216 / False | 76.000 / 0.156 / False | 72.000 / -0.054 / False |
| c-06 MiMo, identical request repeated (seg30) | 79.000 / 0.032 / True | 75.000 / 0.141 / False | 80.000 / 0.051 / False |

**madmom TempoEstimationProcessor (comb): BPM / rel. dev. / within 4 %**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-02 madmom | 76.923 / 0.005 / True | 65.934 / 0.003 / True | 75.949 / -0.003 / True |

**Chords: root / majmin / sevenths share of time (gtr-eval chords)**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-02 madmom CNN | 0.710 / 0.710 / 0.710 | 0.722 / 0.680 / 0.680 | 0.877 / 0.851 / 0.851 |
| c-03 Chordino | 0.630 / 0.585 / 0.177 | 0.688 / 0.669 / 0.176 | 0.839 / 0.779 / 0.443 |
| c-04 lv-chordia | 0.676 / 0.676 / 0.568 | 0.580 / 0.554 / 0.392 | 0.892 / 0.864 / 0.753 |
| c-06 MiMo (seg30) | 0.422 / 0.422 / 0.422 | 0.317 / 0.122 / 0.000 | 0.709 / 0.709 / 0.308 |
| c-06-hint MiMo + hint (seg30) | 0.207 / 0.207 / 0.207 | 0.506 / 0.485 / 0.485 | 0.497 / 0.497 / 0.000 |

**Chords, second output of the same tool: root / majmin / sevenths**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-02 madmom deep-chroma (chords_dc) | 0.546 / 0.546 / 0.546 | 0.457 / 0.409 / 0.409 | 0.820 / 0.787 / 0.787 |


| technique | capo | tuning | standard |
|---|---|---|---|
| c-03 Chordino local tuning | 0.627 / 0.583 / 0.177 | 0.686 / 0.667 / 0.175 | 0.838 / 0.778 / 0.442 |


| technique | capo | tuning | standard |
|---|---|---|---|
| c-04 lv-chordia ismir2017 dictionary | 0.678 / 0.678 / 0.570 | 0.603 / 0.579 / 0.417 | 0.892 / 0.864 / 0.753 |


| technique | capo | tuning | standard |
|---|---|---|---|
| c-06 MiMo, identical request repeated | 0.403 / 0.403 / 0.403 | 0.316 / 0.261 / 0.261 | 0.723 / 0.723 / 0.723 |

**Key: estimate / weighted score (truth capo Bb major, tuning D minor, standard C major)**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-02 madmom CNN key | Bb major / 1.000 | F major / 0.300 | C major / 1.000 |
| c-06 MiMo (seg30) | Bb major / 1.000 | A minor / 0.500 | C major / 1.000 |
| c-06 MiMo, identical request repeated | Bb major / 1.000 | G minor / 0.000 | C major / 1.000 |
| c-06-hint MiMo + hint | Bb major / 1.000 | D minor / 1.000 | F major / 0.000 |

**Tuning offset: NNLS Tuning estimate (cents) / difference to truth (truth capo +2, tuning -9, standard +6)**

| technique | capo | tuning | standard |
|---|---|---|---|
| c-03 Chordino NNLS Tuning | 0.4 / -1.6 | -9.1 / -0.1 | 3.9 / -2.1 |

Notes on reading these:
- Tempo for c-01, c-02, c-02-hint is the span rule round(60 x (n - 1) / (last - first beat)) on the tool's beats.
- madmom's downbeat tracker without a hint ran at double tempo on capo: 580 beats for the truth's 288, 145 bar starts
  for 72 (`experiments/capo/c-02/downbeats.txt`); every truth bar start is among them (72 of 72 matched), so F 0.664
  and CMLt 0. With the hint: 290 beats and downbeat F 0.993. On standard the hint changed nothing (same numbers).
- tuning: madmom's tempo is within 4 % (span 65 and 66, comb 65.93; truth 65.73), Beat This's span tempo 72 is 9.5 %
  off; all three sit about 0.2 s after every truth beat; moved by that median the beats match (F 0.77-0.86). The truth's beats on this
  song are inferred from a tab with no rhythm (truth-tuning.md); evidence in
  `/home/user/gtv/work/exp-chords/TRUTH-DOUBTS.md`. The unshifted F there measures this phase, not missing beats.
- sevenths: the capo and standard truths label no sevenths (chords derived from the notes, maj/min templates), so a
  tool that names Cmaj7 or Ebmaj7 loses those seconds under `sevenths` only. The tuning truth has `C:maj(11)` and `F:5`,
  which `majmin` and `sevenths` leave out of the weighting.
- MiMo: the identical request gave capo majmin 0.422 then 0.403, tuning 0.122 then 0.261, standard 0.709 then 0.723, and
  a different key on tuning (A minor, then G minor). With the hint the tuning key became D minor (= truth) and the
  standard key F major (truth C major).

## What failed or did not run
- c-05 All-In-One: not run. `tools/INSTALLED.md` lists no venv-allin1; its install is a second torch (2.5.1) plus a
  NATTEN source build and this job's rule is to install nothing big. `result.json` status `skipped` on all three songs.
- c-07 Essentia and c-08 BTC: priority C, not run.
- No tool failed and nothing was refused. The gateway reported `audio_tokens: 0` in its usage line (`run.log`) for all 9 MiMo
  call; the answers name the right key on capo and standard, so the audio reached the model, but the token count does
  not show it.

## For the film
One stretch per technique (times on the recording's timeline, seconds). Counts in a stretch come from
`/home/user/gtv/work/exp-chords/analysis/windows.json` (20 s windows; chords: mir_eval majmin share; beats: hits within
70 ms) and `analysis/beat_offsets.txt`; the whole-song numbers are in the tables above.

| exp | song, stretch | what it shows | show / play | settled by |
|---|---|---|---|---|
| c-01 Beat This | tuning 25-45 | the right pulse rate, every click about 0.2 s after the truth beat (median +0.203 s in the stretch, 1 of 22 truth beats within 70 ms; 27 tool beats); on capo and standard it matches 288/288 and 221/224 beats | `experiments/tuning/c-01/click.wav` against `work/exp-chords/clicks/tuning.truth.click.wav`; ticks from `c-01/beats.txt` and `truth/tuning/tuning.beats.txt` | the ear: the truth beats of this song are inferred (TRUTH-DOUBTS.md); on capo/standard the number |
| c-02 madmom | capo 12.76-32.76 | downbeat tracker draws 13 bar lines where the truth has 7 (double tempo), all 7 true ones among them; CNN chords majmin 0.796 in this stretch (whole song 0.710), key Bb major right | `experiments/capo/c-02/click.wav` (2 kHz = its bar starts) and bar lines from `c-02/downbeats.txt`; chord timeline `c-02/chords.lab`, played `c-02/render.wav` | the number (downbeat F 0.664) |
| c-02-hint madmom + tempo and 4/4 | capo 12.76-32.76 | same stretch, 7 bar lines on the 7 truth bar starts | `experiments/capo/c-02-hint/click.wav`, `c-02-hint/downbeats.txt` | the number (downbeat F 0.993) |
| c-03 Chordino | capo 39-59 | majmin 0.499 in the stretch (window range 0.19-0.97; whole song 0.585); its labels (this song: Ebmaj7, Bbaug, D7/F#, Bb6) against the truth's maj/min | `experiments/capo/c-03/chords.lab`, played `c-03/render.wav` against `work/exp-chords/render/capo.truth.chords.wav` | the number; the truth chords on capo are derived from the notes, so the labels themselves are for the ear |
| c-04 lv-chordia | tuning 79-99 | majmin 0.493 in the stretch (window range 0.17-0.99; whole song 0.554) | `experiments/tuning/c-04/chords.lab`, played `c-04/render.wav` against `work/exp-chords/render/tuning.truth.chords.wav` | the number |
| c-06 MiMo | tuning 29-49 (inside its segment) | majmin 0.17 in the stretch without the hint, 0.488 with it (c-06-hint); key A minor / G minor on two identical requests, D minor with the hint | `experiments/tuning/c-06/chords.lab`, `c-06/repeat2/chords.lab`, `c-06-hint/chords.lab`; played `c-06/render.wav`, `c-06-hint/render.wav` | the number |
| c-06-hint | as c-06 | as c-06 | as c-06 | the number |
| c-03 tuning readout | tuning, whole song | NNLS Tuning -9.1 cents against the truth's -9 (capo 0.4 vs 2, standard 3.9 vs 6) | number only | the number |
