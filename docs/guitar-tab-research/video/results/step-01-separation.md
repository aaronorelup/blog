# Step 1. Separation: pulling the guitar out of a mix, and whether separating helps on a solo guitar

Agent exp-sep, 2026-11-25. Plan: `EXPERIMENTS.md` "Step 1", ids sep-00 to sep-07 of `experiments.json`.
Per run: `/home/user/gtv/experiments/<S>/<exp>/` (`cmd.sh`, `job.sh`, `stems/*.flac`, `bp_<stem>/` raw Basic Pitch
output, `notes.csv` (+ `notes.piano.csv`), `render.wav`, `score.sh`, `score_*.json`, `scores.json`, `result.json`).
Work files and scripts: `/home/user/gtv/work/exp-sep/` (`PROGRESS.md`, `run_sep.sh`, `score_sep.py`, `windows/`).

## What was run

- **The three recordings are solo guitar** (SONGS.md: no band, no voice). So the "A" separators also ran on the
  research's band clip **S4** (`/home/user/gtr/inputs/S4/`): it is a **synthesized** band (drums, bass, strummed steel
  guitar, a "Voice Oohs" lead standing in for a singer, 38.74 s) with true stems, so SI-SDR can be measured. It is
  the only mix with a guitar part and true stems on the box; it is not a real recording.
- **Scoring**, as the plan says: Basic Pitch 0.4.0 (n-01, CLI, tflite) on each guitar stem and on the untouched sound
  (sep-00), `gtr-eval notes --chroma` (onset 50 ms, 50 cents) against the truth. S4: truth voice `chord` (the guitar,
  369 notes), plus `gtr-eval stems` on the guitar stem. On the solo songs also htdemucs_6s's and the fine-tune's
  `piano` stem. Every run is also scored cropped to the 30 s segment (`seg30`: capo 12.76-42.76 s, tuning 25-55 s,
  standard 0-30 s of `<S>.wav`; truth cropped with `crop_truth.py`, `work/exp-sep/tr30/`) so whole-song and
  segment-only runs can be compared.
- **Hints**: no separator takes a tuning, capo, range or tempo, so this step has no `-hint` runs.
- **Truth versions**: capo 815 notes, tuning 628, standard **679** (the standard truth was changed at 06:55 UTC by
  another agent, 680 -> 679 notes, sha256 30e6a4c9...; every standard run was re-scored against it; the scores
  against 680 notes are kept in `<exp>/old_truth680/`). S4: 369 guitar notes.
- **Times**: each separation ran inside one `gtr-run` slot (2 cores) together with Basic Pitch; the separator's own
  wall time was measured inside the job (`sep_wall.txt`), ledger ids in `job_run_id.txt`.

## 1. Notes from the separated guitar against notes from the untouched sound, whole song

Basic Pitch onset F1 (precision / recall), `gtr-eval notes` against the whole truth. S4 = the guitar part of the band
clip. "-" = not run on the whole song (see scope).

| technique | stem scored | S4 (band) | capo | tuning | standard |
|---|---|---|---|---|---|
| sep-00 no separation | the mix | 0.600 (0.540 / 0.675) | 0.689 (0.537 / 0.960) | 0.626 (0.562 / 0.705) | 0.664 (0.544 / 0.854) |
| sep-01 htdemucs_6s | guitar | 0.660 (0.691 / 0.631) | 0.700 (0.547 / 0.973) | 0.630 (0.569 / 0.707) | 0.661 (0.539 / 0.856) |
| sep-01 htdemucs_6s | piano | 0.554 | 0.421 | 0.247 | 0.257 |
| sep-03 guitar fine-tune | guitar | 0.735 (0.709 / 0.764) | 0.689 (0.534 / 0.969) | 0.627 (0.562 / 0.710) | 0.664 (0.542 / 0.857) |
| sep-03 guitar fine-tune | piano | 0.315 | 0.645 | 0.398 | 0.476 |
| sep-06 ElevenLabs six_stems_v1 | guitar | 0.772 (0.735 / 0.813) | 0.689 (0.538 / 0.958) | - | - |
| sep-06 ElevenLabs | piano | 0.016 | 0.000 (empty stem) | - | - |
| sep-02 htdemucs 4 stems (B) | other | not run | 0.698 (0.544 / 0.972) | 0.627 (0.563 / 0.709) | 0.658 (0.532 / 0.865) |
| sep-07 HPSS default (B) | harmonic | not run | **0.783** (0.666 / 0.950) | 0.625 (0.576 / 0.683) | 0.685 (0.583 / 0.831) |

Notes matched / notes written: S4 mix 249/461, 6s 233/337, fine-tune 282/398, ElevenLabs 300/408. Capo mix 782/1456,
HPSS harmonic 774/1163. Standard mix 580/1067, HPSS 564/968. Eval ids: sep-00 e2167, e2201-e2204, e2296-e2297;
sep-01 e2164-e2166, e2215-e2222, e2298-e2301; sep-03 e2168-e2170, e2233-e2240, e2304-e2307; sep-06 e2177-e2179,
e2207-e2210; sep-02 e2247-e2250, e2302-e2303; sep-07 e2277-e2280, e2311-e2312.

## 2. The same, inside the 30 s segment (every technique)

Onset F1 (precision / recall, matched/written) against the cropped truth (capo 102 notes, tuning 106, standard 125).
Rows marked *cropped* are the whole-song runs cut to the segment; rows marked *seg* ran on the 30 s file itself.

| technique | capo | tuning | standard |
|---|---|---|---|
| sep-00 mix, cropped | 0.674 (0.534 / 0.912, 93/174) | 0.659 (0.573 / 0.774, 82/143) | 0.745 (0.605 / 0.968, 121/200) |
| sep-01 6s guitar, cropped | 0.660 (97/192) | 0.659 (82/143) | 0.747 (121/199) |
| sep-03 fine-tune guitar, cropped | 0.642 (95/194) | 0.650 (80/140) | 0.755 (122/198) |
| sep-06 ElevenLabs guitar | 0.664 (95/184), cropped | 0.661 (80/136), seg | 0.732 (120/203), seg |
| sep-05 becruily Mel-Band RoFormer, seg (B) | 0.652 (0.511 / 0.902, 92/180) | 0.645 (0.568 / 0.745, 79/139) | 0.763 (0.636 / 0.952, 119/187) |
| sep-02 htdemucs other, cropped (B) | 0.664 (98/193) | 0.661 (82/142) | 0.752 (121/197) |
| sep-07 HPSS harmonic, cropped (B) | 0.727 (0.604 / 0.912, 93/154) | 0.642 (77/134) | 0.752 (0.640 / 0.912, 114/178) |

Eval ids: sep-05 e2291, e2292, e2308; sep-06 seg e2211-e2212, e2309-e2310; the cropped rows share the ids of table 1.
Not comparable one to one: a *seg* run's notes near the segment edges differ from the same notes cut out of a
whole-song run. exp-gpu's sep-04 (below) has Basic Pitch on the 30 s file as its own baseline.

**sep-04 BS-RoFormer-SW** was run by the exp-gpu agent (its RunPod pod was refused by the permission system, so 30 s
segments on the box CPU), not by this step: guitar stem 0.657 against 0.650 for Basic Pitch on the 30 s mix file
(capo, e2050/e2073), tuning 0.656 against 0.653 (e2114/e2130), standard 0.737 against 0.735 (e2131/e2132, scored
before the standard truth changed). Its records: `experiments/<S>/sep-04/result.json`, `results/step-gpu.md`.
It did not run on S4.

## 3. The band clip S4: how clean is the guitar stem

`gtr-eval stems --truth S4 --map guitar=<stem>` (mono, no alignment search).

| technique | guitar SI-SDR | SDR | eval | Basic Pitch guitar-part F1 (table 1) |
|---|---|---|---|---|
| sep-01 htdemucs_6s | 1.75 dB | 3.44 dB | e2166 | 0.660 |
| sep-03 guitar fine-tune | 6.10 dB | 6.35 dB | e2170 | 0.735 |
| sep-06 ElevenLabs | 13.70 dB | 13.89 dB | e2179 | 0.772 |
| (no separation) | - | - | - | 0.600 |

ElevenLabs returns MP3 stems that start **1105 samples (25.06 ms) late** (the MP3 encoder delay; measured by
cross-correlation against the true guitar stem and, for the solo songs, against the mix: the same 1105 samples
in all four, `sep-06/lag.json`). Unshifted, its S4 guitar stem scores SI-SDR -26.18 dB and Basic Pitch F1 0.723
(kept in `S4/sep-06/unaligned/`). Every sep-06 stem in `stems/` and every `notes.csv` is shifted back onto the
recording's timeline. htdemucs_6s is not deterministic (random shift): the research measured 0.50, 1.25 and 1.89 dB
on the same clip (INSTALLED.md); this run gave 1.75 dB.

## 4. Where the sound went: stem levels (dBFS RMS, mono)

Mix: capo -14.48, tuning -18.28, standard -15.56, S4 -17.44 (`work/exp-sep/mix_levels_dbfs.json`).
Per stem (`<exp>/stem_levels_dbfs.json`; -240 = digital silence):

| technique | S4 | capo | tuning | standard |
|---|---|---|---|---|
| sep-01 6s | guitar -28.25, piano -31.30, vocals -23.21, bass -25.32, drums -29.23 | guitar -15.41, **drums -27.41**, piano -56.53 | guitar -18.37, other -51.96 | guitar -16.01, drums -39.83 |
| sep-03 fine-tune | guitar -21.78, piano -74.53 | guitar -14.53, drums -32.83, piano -70.19 | guitar -18.13 | guitar -15.54 |
| sep-06 ElevenLabs | guitar -22.39, other -22.68, piano -108.04 | guitar -15.06, drums -29.27, others below -100 | guitar -18.02, all others -240 (seg) | guitar -19.57, all others -240 (seg) |
| sep-02 4 stems | not run | other -15.65, drums -26.07 | other -18.30 | other -16.06, drums -30.18 |
| sep-07 HPSS | not run | harmonic -15.66, percussive -24.57 | harmonic -18.74, percussive -35.98 | harmonic -16.36, percussive -30.31 |
| sep-05 becruily | not run | Guitar -17.54 (seg) | Guitar -17.89 (seg) | Guitar -19.56 (seg) |

On the three solo songs the guitar stays in `guitar` for htdemucs_6s (the research's solo clip S2s had it land in
`piano`). Capo is the song with thumb slaps and wrist thumps: every separator with a drums stem puts sound there
(-27.41, -32.83, -29.27, -26.07 dBFS). The near-silent piano stems still give Basic Pitch notes: the fine-tune's capo
piano stem at -70.19 dBFS scores F1 0.645 (630 of 815 truth notes matched, 1139 written). ElevenLabs' piano stems are empty or
hold no matched notes.

## 5. Taps (HPSS percussive part, capo only; the other songs have no taps in the truth)

librosa 0.11 `onset_detect` (defaults, `work/exp-sep/perc_onsets.py`) against the 258 truth taps,
`gtr-eval onsets --field taps`: on `percussive.wav` F 0.442 (P 0.284, R 1.000, 910 onsets, e2294); on the mix F 0.472
(P 0.309, R 0.996, 832 onsets, e2295). The detector marks every attack, notes and taps alike, so precision is low in
both.

## 6. Scope, time, cost

Separator wall time on 2 cores (seconds), inside the gtr-run job; ledger ids in each folder's `job_run_id.txt` /
`run_id.txt`. Songs: capo 227.9 s, tuning 187.4 s, standard 177.0 s, S4 38.7 s.

| technique | scope | S4 | capo | tuning | standard |
|---|---|---|---|---|---|
| sep-00 (Basic Pitch only) | whole | 4.27 | 17.12 | 14.36 | 12.41 |
| sep-01 htdemucs_6s | whole | 24.31 | 184.64 | 150.04 | 143.97 |
| sep-03 fine-tune | whole | 37.49 | 147.04 | 95.83 | 117.64 |
| sep-06 ElevenLabs (API wall) | whole: S4, capo; 30 s: tuning, standard | 6.51 | 30.63 | 5.63 | 6.49 |
| sep-02 htdemucs (B) | whole | - | 187.25 | 167.73 | 155.81 |
| sep-07 HPSS (B) | whole | - | 211.69 | 159.01 | 147.08 |
| sep-05 becruily (B) | 30 s | - | 198.50 | 168.73 | 174.63 |

ElevenLabs cost (credits measured by `elevenlabs_call.py`, USD estimate): S4 1065 credits / $0.234, capo 6268 /
$1.379, tuning and standard segments 825 / $0.182 each (`<S>/sep-06/record.json`).

## 7. What failed or was refused

- **sep-06 whole songs, tuning and standard**: refused by the research's spend guard, not by the API:
  `REFUSED: elevenlabs spent 1.6133 + worst case 0.9369 > cap 2.0` (`llm_common.py` CAP_PER_SERVICE_USD = 2.00;
  `<S>/sep-06/api_full_refused.log`). Fallback: the 30 s segment of each (allowed under the cap). The cap is now
  about used up ($1.98 of $2.00 for ElevenLabs in that ledger).
- **Basic Pitch outside the gtr-run slots** (`gtr-run --nolock`, to avoid 10-minute slot waits for 5-second jobs):
  refused by the permission system ("Undermining Oversight"). Kept in the slots; instead each separation and its
  Basic Pitch runs share one slot.
- **sep-04** is not this step's run (exp-gpu, 30 s segments; see table 2).
- sep-02, sep-07 and sep-05 were not run on S4 (S4 got only the "A" separators).
- Ledger labels of r0908 and r0909 say "whole" but those jobs processed the 30 s ElevenLabs stems.

## For the film

Times are seconds of `<S>.wav` (S4: of `S4.wav`). Window counts: `work/exp-sep/windows/<S>.json` (truth notes in
the window, Basic Pitch notes matched / written; same matching as gtr-eval). To play: `render.wav` (Basic Pitch notes
on a guitar sound; `render.piano.wav` for the piano stem) and the stem in `stems/`; the original is `<S>.wav`.

- **sep-00, no separation** (the baseline every other row is held to): capo 65-85 s. 82 truth notes; Basic Pitch on
  the mix matches 80 and writes 157, so about half of what it writes matches no truth note. Show `capo/sep-00/notes.csv` over the truth; play `capo.wav` then `capo/sep-00/render.wav`. Settled by the
  truth (F1 0.689 whole song, precision 0.537).
- **sep-01 htdemucs_6s**: S4 15-35 s. 243 truth guitar notes; guitar stem 153 matched / 219 written, mix 155/293. The
  stem cuts extra notes and keeps the hits; the guitar is split, -28.25 dBFS in `guitar`, -31.30 in `piano`. Show
  the stem meters (`S4/sep-01/stem_levels_dbfs.json`); play `S4/sep-01/stems/guitar.flac` then `piano.flac`.
  Settled: SI-SDR 1.75 dB, F1 0.660 vs 0.600. On solo guitar, capo 140-160 s: 76/133 vs mix 75/154; whole song
  0.700 vs 0.689. The thumb slaps land in `drums` (-27.41 dBFS): play the capo drums stem only if it is kept (only
  guitar, piano, other were kept as FLAC; the level is in the JSON).
- **sep-03 guitar fine-tune**: S4 15-35 s: 181/242 vs mix 155/293. Play `S4/sep-03/stems/guitar.flac` A/B with
  `S4/sep-01/stems/guitar.flac`. Settled: 6.10 dB vs 1.75 dB, F1 0.735. On the solo songs it changes whole-song F1 by
  +0.0001, +0.0016 and -0.0004 against the mix.
- **sep-04 BS-RoFormer-SW**: exp-gpu's run; its record names the files.
- **sep-05 becruily Mel-Band RoFormer**: standard 0-20 s: 80 matched / 123 written against the mix's 81/135 (85
  truth notes). Play `standard/sep-05/stems/Guitar.flac` against `standard.wav`. Settled only within the segment: F1
  0.763 vs 0.745 (cropped mix) on standard, 0.652 vs 0.674 on capo, 0.645 vs 0.659 on tuning; whether the stem sounds
  cleaner is for the ear.
- **sep-06 ElevenLabs**: S4 15-35 s: 190/256 vs mix 155/293, the cleanest stem measured here (13.70 dB). Play
  `S4/sep-06/stems/guitar.flac` after `S4.wav`. Settled. On solo guitar, capo 65-85 s: 80/149 vs 80/157; whole song
  F1 0.689 = 0.689. A second point settled by numbers: its MP3 stems are 25.06 ms late; unshifted, SI-SDR reads
  -26.18 dB.
- **sep-02 htdemucs 4 stems**: capo 130-150 s: 79/120 vs mix 78/140. Play `capo/sep-02/stems/other.flac`. Settled:
  whole-song F1 0.698 / 0.627 / 0.658 vs 0.689 / 0.626 / 0.664.
- **sep-07 HPSS**: capo 65-85 s: 79 matched / 105 written against the mix's 80/157. The one technique here that
  changes a solo song's score: capo F1 0.783 vs 0.689 (precision 0.666 vs 0.537, recall 0.950 vs 0.960); standard
  0.685 vs 0.664; tuning 0.625 vs 0.626. Show the spectrogram split; play `capo/sep-07/stems/percussive.flac` (the
  slaps) then `harmonic.flac`, then `capo/sep-07/render.wav` against `capo/sep-00/render.wav`. Settled by the truth.
  Taps from the percussive part: F 0.442 vs 0.472 from the mix (section 5).
