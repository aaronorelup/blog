# Results: what each tool did on the three recordings

The document the AO-082 film's script is written from. Every number comes from a `result.json` under
`/home/user/gtv/experiments/<S>/<exp>/` (one row per result in [`results.json`](results.json)) or from the step
record named in its section (`results/step-*.md`), as they stand after audits A and B (`results/audit-*.md`; their
fixes are in). Paths are under `/home/user/gtv/experiments/` unless they start with `songs/`, `truth/` or `work/`
(`/home/user/gtv/`). Opus 5.5's blind attempts (the last chapter) are not in this document.

| S | recording | tuning, capo | truth notes (in the 30 s segment) | segment, s |
|---|---|---|---|---|
| capo | *Steal My Girl*, fingerstyle, Gareth Evans | standard, capo 3, +2 cents | 815 (102) | 12.76-42.76 |
| tuning | *A soft collision of breath*, Evan Handyside, nylon | D2 G2 C3 F3 A3 C4, -9 cents | 628 (106) | 25.0-55.0 |
| standard | *Imagine*, fingerstyle, Gareth Evans | standard, no capo, +6 cents | 679 (125) | 0.0-30.0 |

Times are seconds of `songs/<S>/<S>.wav` (= the cropped `<S>.mp4`). Notes match with onsets within 50 ms and pitch
within 50 cents; F1 is onset F1. "Hint" = the true tuning and capo (or tempo) given to the tool; "(seg)" = run on
the segment only. Wall times: 2 cores of the shared 4-core box, no graphics card, unless marked.

## Step 1. Separation (sep-*)

**Tried.** Seven separators, each scored by Basic Pitch's notes on the stem against the truth. The recordings are
solo guitar, so the "A" separators also ran on the research's synthesized band clip S4 (38.7 s, true stems). No
separator takes a hint. Record: `results/step-01-separation.md` (sep-04: `results/step-gpu.md`).

| technique | band clip S4: F1 (SI-SDR) | capo F1 | tuning F1 | standard F1 | wall, capo |
|---|---|---|---|---|---|
| sep-00 none (Basic Pitch on the mix) | 0.600 | 0.689 | 0.626 | 0.664 | (Basic Pitch 17.1 s) |
| sep-01 Demucs htdemucs_6s, guitar | 0.660 (1.75 dB) | 0.700 | 0.630 | 0.661 | 184.6 s |
| sep-03 htdemucs_6s guitar fine-tune | 0.735 (6.10 dB) | 0.689 | 0.627 | 0.664 | 147.0 s |
| sep-06 ElevenLabs six_stems_v1 (API) | **0.772 (13.70 dB)** | 0.689 | (seg) 0.661 | (seg) 0.732 | 30.6 s, 6268 credits, $1.379 |
| sep-02 Demucs 4 stems, other (B) | - | 0.698 | 0.627 | 0.658 | 187.25 s |
| sep-07 librosa HPSS, harmonic (B) | - | **0.783** | 0.625 | **0.685** | 211.7 s |
| sep-04 BS-RoFormer-SW (seg), stem vs mix | - | 0.657 vs 0.650 | 0.656 vs 0.653 | 0.743 vs 0.741 | 265.4 s for 30 s |
| sep-05 Mel-Band RoFormer (seg) (B), vs mix | - | 0.652 vs 0.674 | 0.645 vs 0.659 | 0.763 vs 0.745 | 198.5 s for 30 s |

- **Failed or not run.** ElevenLabs on the whole tuning and standard songs was refused by the research's spend guard
  (`spent 1.6133 + worst case 0.9369 > cap 2.0`); it ran on their segments. sep-04 ran on the box CPU because the
  RunPod pod was refused by the permission system; a whole song would take 22-33 min. Its stem changed little
  (F1 +0.002 to +0.007, the same notes found): the other five stems hold at most 0.0001 of the energy.
- **Side facts.** ElevenLabs' MP3 stems start 25.06 ms late (unshifted, its S4 SI-SDR reads -26.18 dB; every stem
  used is shifted back). On capo every drums stem catches the thumb slaps (-27.41 to -26.07 dBFS).
- **Worth showing.**
  1. HPSS on capo 65-85 s: 79 matched of 105 written, against the mix's 80 of 157 (82 truth notes). Play
     `capo/sep-07/stems/percussive.flac` (the slaps), `harmonic.flac`, then `capo/sep-07/render.wav` against
     `capo/sep-00/render.wav`.
  2. ElevenLabs on the band clip, S4 15-35 s: 190 of 256 against the mix's 155 of 293. Play `/home/user/gtr/inputs/S4/S4.wav`, then
     `S4/sep-06/stems/guitar.flac`; A/B with `S4/sep-03/stems/guitar.flac` (181 of 242).

## Step 2. Sound to notes (n-*)

**Tried.** Five transcribers on the whole songs, Basic Pitch also with a frequency range from the tuning and capo,
and MiMo v2.6 Flash asked for the notes as JSON on the segment. Offsets ignored. Record: `results/step-02-notes.md`.

| technique | capo F1 (found / invented) | tuning F1 | standard F1 | segment F1 capo / tuning / standard | wall |
|---|---|---|---|---|---|
| n-01 Basic Pitch 0.4.0 | 0.689 (782 / 674) | 0.626 | 0.663 | 0.674 / 0.659 / 0.745 | 11.0-14.6 s |
| n-01-hint + frequency range | 0.709 (782 / 610) | 0.627 | 0.664 | 0.689 / 0.659 / 0.747 | 11.5-15.2 s |
| n-02 guitar-gaps.pth (Riley et al.) | 0.919 (787 / 111) | **0.830** | 0.879 | 0.922 / 0.807 / 0.992 | 105-144 s |
| n-03 guitar-fl.pth (Riley et al.) | **0.920** (781 / 102) | 0.796 | **0.892** | 0.941 / 0.783 / 0.988 | 102-156 s |
| n-04 Transkun, a piano model (B) | 0.896 (736 / 92) | 0.785 | 0.866 | 0.848 / 0.760 / 0.976 | 160-185 s |
| n-05 YourMT3+ (public CPU Space) | 0.803 (733 / 277) | 0.731 | 0.774 | 0.777 / 0.678 / 0.924 | 252-341 s remote |
| n-08 MiMo v2.6 Flash (seg) (B) | - | - | - | 0.000 / 0.000 / 0.026 | 33-78 s, under $0.0015 |
| n-08-hint + tuning and capo in the prompt | - | - | - | 0.010 / 0.012 / 0.000 | 41-71 s, under $0.0009 |

- **Where notes go wrong.** On capo 240 of Basic Pitch's 674 invented notes start within 50 ms of a slap or thump,
  and 71 lie below G2, the lowest note a capo-3 guitar can sound. The tuning song's low strings are every tool's weak
  side (recall on strings 6-4: 0.627 Basic Pitch to 0.802 n-02), and its onsets come 21-30 ms early (median).
- **Failed or not run.** n-08-hint failed once on capo and standard (proxy error after 301 s; the retry is the
  result). n-06, n-07, n-09 (C) not run. YourMT3+ also returns piano and drums; on its guitar tracks alone it scores
  0.827 / 0.732 / 0.780.
- **Hint.** The range removed invented notes on capo (674 -> 610; below G2 71 -> 8) and found the same 782; on tuning and
  standard F1 moved by 0.002 and 0.0004. MiMo with the hint found 1, 1, 0 segment notes (without: 0, 0, 4). Audit: n-08 was re-run
  with the audio named `clip.wav` (old runs in `<S>/n-08/named-file/`).
- **Worth showing** (truth `truth/<S>/<S>.notes.csv` against the tool's `notes.csv`, coloured from `labels.json`;
  play the tool's `render.wav`, then the recording):
  1. Basic Pitch without and with the hint, capo 60-80 s: with it 81 found, 2 missed, 52 invented
     (`capo/n-01/render.wav`, `capo/n-01-hint/render.wav`); without, at 184-204 s: 81 / 3 / 83.
  2. guitar-gaps on tuning 111-131 s: 52 / 21 / 24, two of the missed notes doubtful in the truth check.
  3. MiMo on standard 10-30 s: 3 found, 77 missed, 116 invented (`standard/n-08/render.wav`).

## Step 3. Melody, bass and taps (v-*)

**Tried.** Splitting Basic Pitch's notes into melody and bass by a pitch threshold (v-01) or partitura's voice
estimator (v-02); taps as onsets of the HPSS percussive part (v-03) or of Demucs' drums stem (v-04). The truth's
voices are made by a rule (highest note on strings 1-3 = melody, lowest on 4-6 = bass) that a threshold resembles.
Truth taps: capo 258, standard 211, tuning none. Record: `results/step-03-voices-taps.md`.

| technique | capo | tuning | standard | wall |
|---|---|---|---|---|
| v-01 threshold at G3: labels right, of matched notes | 0.946 | 0.894 | 1.000 | 8.5-13.0 s |
| v-01-hint threshold at the true open 3rd string | **0.956** | **1.000** | 1.000 | 8.0-12.1 s |
| v-02 partitura estimate_voices | 0.260 | 0.170 | 0.484 | (same run) |
| v-03 taps, HPSS onsets: F / P / R | 0.442 / 0.284 / 1.000 | not scored | **0.581** / 0.412 / 0.986 | 107-144 s |
| v-04 taps, Demucs drums onsets: F / P / R | **0.820** / 0.963 / 0.713 | not scored | 0.479 / 0.932 / 0.322 | 103-117 s |

- **Failed or not run.** Nothing failed; v-05 and v-06 (C) not run. Partitura returned 7, 7 and 8 voices; mapped
  without the truth it calls 2, 1 and 1 notes melody.
- **Hint.** At the real open third string (F3 = 53) the tuning song's 38 melody notes called bass become 0.
- **Taps.** HPSS hears every tap and marks every attack; the drums stem is precise but finds 0.144 of standard's
  thumps. Most capo taps land with a note (199 of 258), so dropping onsets that carry a note loses them.
- **Worth showing.**
  1. Tuning 40-60 s: at 55, 35 of 42 labels right; at the hinted 53, 42 of 42. Show `tuning/v-01/voices.csv` and
     `tuning/v-01-hint/voices.csv`; play `tuning/v-01/render.bass.wav`, `render.melody.wav`.
  2. Taps, capo 60-80 s: v-03 hits all 32 with 89 onsets (`capo/v-03/clicks_60-80.wav` against
     `clicks_truth_60-80.wav`); standard 100-120 s: v-04 finds 4 of 29 with 5 onsets
     (`standard/v-04/clicks_100-120.wav`).

## Step 4. Chords, beat, bars, tempo, key (c-*)

**Tried.** Beat This! and madmom (also with the true tempo +-10 % and 4/4), three chord recognisers, and MiMo v2.6
Flash asked for chords, tempo and key on the segment (twice, and once with the tuning and capo). All name sounding
chords, as the truth does. Record: `results/step-04-chords-beat.md`.

| technique | beats F capo / tuning / standard | downbeats F | tempo, BPM (truth 76.56 / 65.73 / 76.14) | chords majmin | key (truth Bb / Dm / C) | wall |
|---|---|---|---|---|---|---|
| c-01 Beat This! | **0.998** / 0.050 / **0.989** | **0.986** / 0.117 / 0.964 | 77 / 72 / 76 | - | - | 9.4-15.4 s |
| c-02 madmom | 0.993 / 0.035 / 0.973 | 0.664 / 0.000 / 0.982 | 77 / 65 / 76 | **0.710** / **0.680** / 0.851 | Bb / F / C | 125-158 s |
| c-02-hint madmom + tempo, 4/4 | 0.993 / 0.015 / 0.973 | **0.993** / 0.020 / 0.982 | 77 / 66 / 76 | - | - | 52-74 s |
| c-03 Chordino | - | - | - | 0.585 / 0.669 / 0.779 | - | 7.9-10.7 s |
| c-04 lv-chordia | - | - | - | 0.676 / 0.554 / **0.864** | - | 29-65 s |
| c-06 MiMo (seg) (B); same request again | - | - | 80 / 65 / 90; 96 / 75 / 80 | 0.480 / 0.105 / 0.564; 0.805 / 0.384 / 0.570 | Bb / Am / C; Bb / F / C | 9.5-11.9 s |
| c-06-hint + tuning, capo (seg) | - | - | 60 / 76 / 72 | 0.207 / 0.485 / 0.497 | Bb / Dm / F | 8.6-51.2 s |

- **Tuning song.** Every tracker gets the pulse (madmom 65-66 BPM) but each beat falls 0.195-0.199 s (median) after
  the truth's, whose beats were placed by rule on a tab with no rhythm; shifted by that, beat F is 0.77-0.86.
- **Failed or not run.** All-In-One (c-05) was not installed (a second torch and a NATTEN build); c-07, c-08 (C) not
  run. The gateway reported `audio_tokens: 0` for every MiMo call, yet it named capo's and standard's keys right.
- **Hint.** madmom's downbeats ran at double tempo on capo (145 bar starts for 72); with the hint, 72 (F 0.664 ->
  0.993). MiMo with the hint got the tuning song's key (D minor) but lost capo's chords and standard's key.
- **Also.** Chordino's NNLS Tuning reads -9.1 cents on tuning (truth -9), 0.4 on capo (+2), 3.9 on standard (+6).
- **Worth showing** (counts: `work/exp-chords/analysis/windows.json`):
  1. madmom on capo 12.76-32.76 s: 13 bar lines for the truth's 7, then 7 on 7 with the hint (`capo/c-02/click.wav`,
     `capo/c-02-hint/click.wav`).
  2. Beat This! on tuning 25-45 s: every click about 0.2 s late (`tuning/c-01/click.wav` against
     `work/exp-chords/clicks/tuning.truth.click.wav`).
  3. MiMo's chords on tuning 29-49 s: majmin 0.146, 0.488 with the hint (`tuning/c-06/render.wav`,
     `tuning/c-06-hint/render.wav`, truth `work/exp-chords/render/tuning.truth.chords.wav`).

## Step 5. Tuning and capo (t-*)

**Tried.** Tuning offset (librosa), open strings and capo from the lowest recurring notes, MiMo v2.6 Flash from the
audio (three tries per question) and from 30 frames, OWLv2 boxes for "capo", Opus 5.5 looking at contact sheets and
neck crops, and capo as sounding chord minus fingered shape. Record: `results/step-05-tuning-capo.md`.

| technique | capo song (capo 3, standard) | tuning song (D G C F A C, no capo) | standard song | time, cost a song |
|---|---|---|---|---|
| t-01 librosa offset, cents | +3.0 (truth +2) | -10.0 (truth -9) | +3.0 (truth +6) | 0.5-0.6 s |
| t-02 lowest recurring note | wrong: 6th string a semitone low, capo missed | Drop D (5 strings wrong), capo right | right | under 1 s |
| t-02-hint on range-hinted notes | strings right, capo 2 | Drop D | right | under 1 s |
| t-03 MiMo audio, capo question (right of 3) | 0 | 1 | 1 | 57-62 s, under $0.0005 |
| t-03 MiMo audio, tuning question: strings / capo | 2 / 1 | 0 / 3 | 3 / 3 | (same) |
| t-04 MiMo, 30 frames (B) | fret 2 (wrong) | no capo (right) | no capo (right) | 26-55 s, $0.005-0.012 |
| t-05 OWLv2 "capo" | fret 3, by 0.6 px | a capo "seen" in 6 of 6 frames | absent (right) | 46-62 s |
| t-07 Opus 5.5 on frames | capo 3, standard: right | no capo right; standard tuning guessed | right | 37-68 s, $0.51-0.62 |
| t-08 chord minus shape (B, truth's shapes) | 3 (84 % of chord time) | 0 (61 %) | 0 (54 %) | under 1 s |

- **Failed or not run.** SAM 3 (t-06): pod refused, gated model, no Hugging Face token. Opus 5.5 was refused by the AI
  gateway on a free tier (HTTP 403), so three separate cloud sessions (curl and Read only, 0 web searches) each got one
  neutral letter's pictures. t-08 had no tool reading chord shapes from video, so it used the truth's: a perfect hand.
- **Hint.** Only t-02 takes one: it fixed capo's 6th string but read capo 2, and still said Drop D on tuning.
- **Audit.** t-03 re-run with the audio named `clip.wav` (old: `<S>/t-03/named-file/`); the first tuning t-07 look
  saw the video's end card with the creator's site name and was re-run without it, same answers.
- **Worth showing.**
  1. Opus 5.5, capo 50-70 s: `capo/t-07/pics/neck_00570.jpg`, capo 3 counted from the inlays with the nut out of frame;
     then tuning 40-60 s (`tuning/t-07/pics/neck_00468.jpg`), standard guessed. Its words: `look/session_answer.json`.
  2. The lowest-note rule, tuning 57-77 s: histogram `tuning/t-02/lowest.json` (D2 53, E2 25, F2 14, G2 59) against
     D G C F A C; `capo/t-02/render.wav` 129-149 s plays notes a capo-3 guitar cannot sound.
  3. MiMo, capo 12.76-32.76 s: one question, one audio, answers capo 1, cannot tell, capo 1 (`capo/t-03/summary.txt`).

## Step 6. String and fret (f-*)

**Tried.** Four assigners given the truth's own notes (strings removed), then the best step-2 notes ("-chain"), each
without and with the true tuning and capo ("-hint"); TabCNN and Guitab take the audio (Guitab matched by note order:
its GP5 runs on its own beat grid). Score: same string and fret as the truth, frets counted from the capo, share of
all truth notes. Record: `results/step-06-string-fret.md`.

| technique (input) | capo, hint | tuning, hint | standard | capo, no hint (frets from the nut, of matched) | wall |
|---|---|---|---|---|---|
| f-01 tuttut (truth notes) | **0.795** | **0.967** | **0.892** | 0.394 | 0.26-0.38 s |
| f-03 LilyPond (truth notes) | **0.795** | **0.967** | **0.892** | 0.393 | 3.3-8.8 s |
| f-02 scorify, 10 s windows (truth notes) | 0.679 | 0.852 | 0.591 | 0.654 | 4.6-16.3 s |
| f-04 tabsynth (B) (truth notes) | 0.521 | no tuning option | 0.829 | 0.405 | 0.24-0.35 s |
| f-01 / f-03 chain-hint (step-2 notes) | 0.762 / 0.767 | 0.803 / 0.803 | 0.829 / 0.826 | 0.396 / 0.394 | under 4 s |
| f-02 / f-04 chain-hint (step-2 notes) | 0.366 / 0.572 | 0.186 / - | 0.118 / 0.747 | 0.424 / 0.411 | under 15 s |
| f-06 TabCNN (audio; no tuning or capo option) | 0.000 | 0.000 | 0.479 | 0.615 | 22.6-30.9 s |
| f-07 Guitab (audio; capo stepper) | 0.780 | 0.000 | 0.839 | 0.759 | 139-175 s |

- **Failed or not run.** scorify placed 0 notes on every whole song (12 runs, `search-exhausted` or `infeasible`),
  also with larger search limits; its rows are 10 s windows arranged alone (placed: capo-hint 20 of 23 windows,
  tuning-hint 16 of 18, standard 12 of 18). tabsynth and Guitab have no tuning option. TabCNN wrote 2864, 1917 and
  1398 notes for 815, 628 and 679. By time, only 69, 24 and 11 of Guitab's notes match. C entries not run.
- **Hint.** The largest effect of any step: on capo (frets from the nut) tuttut 0.394 -> 0.795, LilyPond 0.393 ->
  0.795, scorify 0.654 -> 0.792, tabsynth 0.405 -> 0.521, Guitab 0.759 -> 0.832; on tuning 0 -> 0.967 (without the
  tuning every tool scores 0 there by construction; right string, any fret: 0.161-0.289).
- **Agreement.** With the hint, tuttut and LilyPond place 815 of 815 capo notes identically (626 of 628 tuning).
- **Worth showing.** A pitch on a wrong string sounds the same in a render: the eye judges. Show `tab.gp5` beside the
  truth `truth/<S>/<S>.gp5`, wrong cells from `labels_tab.json`.
  1. tuttut, tuning 49-64 s: with the hint 49 right, 7 on another string; without, 0 right (`tuning/f-01-hint/`, `tuning/f-01/`).
  2. TabCNN, standard 152-167 s: 33 right, 6 other string, 105 notes no truth note has, heard in `standard/f-06/render.wav`.
  3. Guitab, capo 92-107 s: with the capo 26 right, 26 other string, 31 unmatched (`capo/f-07-hint/tab.gp5`).

## Step 7. Hands, fretboard and capo from the video (w-*)

**Tried.** Hand landmarks (MediaPipe; RTMPose on the segment), a fret grid from a hand-set neck outline (OpenCV
lines, 12-TET fit), fingertip to (string, fret) cells scored on the truth's fretted notes, SAM 2.1 tiny for the neck,
and CoTracker3 to follow it. No hints. Records: `results/step-07-video.md`, `results/step-gpu.md` (CoTracker3).

| technique | capo | tuning | standard | wall |
|---|---|---|---|---|
| w-01 MediaPipe: fretting hand lost (a rule; no truth for landmarks), share of frames | 0.0325 | 0.1242 | **0.0089** | 187 / 269 / 279 s |
| w-03 RTMPose (B) (seg), vs MediaPipe same window | 0.1947 vs 0.0027 | 0.1756 vs 0.0344 | 0 vs 0 | 165-185 ms a frame |
| w-04 fret grid: neck lost (1 s samples) | 0.7632 | **1.0, failed** | 0.8258 | 2.15-6.98 s |
| w-05 cells: exact / right string, fret within 1 | **0.088** / 0.3986 | not possible | 0.0293 / 0.1832 | - |
| w-06 SAM 2.1 (B): worst corner off the outline; grid | 314.4 px; none | 428.1 px; none | 70.7 px; none | about 2 s a frame |
| w-07 CoTracker3 (B), CPU: outline error, median | 28.0 px | 142.8 px | 17.5 px (fixed 43.9) | 380 / 410 / 719 s |

- **Failed or not run.** On the nylon guitar neither detector found a fret line (0 segments on 188 samples), so no
  cells. The research's LSD detector found under 6 fret clusters on almost every frame (strings cut the wires); Hough
  was the fallback. Standard's first pose (0-50 s) got no grid; the 12-TET numbering puts capo's frets one too high
  (all 3 labelled capo fingertips read +1). SAM 2.1 ran through Hugging Face (Ultralytics' host answers 403). No tool
  detects a capo. CoTracker3 was planned for a rented GPU; the pod was refused, so it ran on the CPU (a 1 fps call
  was killed at 12.2 GB). WiLoR, Roboflow (C) not run.
- **Worth showing** (20 s overlays with the recording's sound, JSON as PRODUCTION.md 6.4 `clipoverlay`):
  1. `capo/w-02/overlay.mp4`, 12.76-32.76 s: the hand held in 495 of 500 frames; 2 of 50 cells exact, 28 on the right
     fret on some string; the grid one fret high around the capo (17.74 s).
  2. `standard/w-02/overlay.mp4`, 107-127 s: 0 of 67 exact, 14 within a fret; a grid fit in 4 of 20 seconds.
  3. `tuning/w-02/overlay.mp4`, 25-45 s: hands in all 600 frames, no grid; `tuning/w-07/overlay.mp4` 0-20 s: the
     tracked outline drifts 95 px off the neck.

## Step 8. Sound and video together (y-*)

**Tried.** A sound-picture clock check (y-01); every estimated note looked up at its onset frame against the
fingertip cells (y-02); LilyPond with a string pin per note from the video (y-03; "full" rule: fingertip cell, else
the hand's fret span; "tips": fingertip cells only), on truth and step-2 notes, without and with the tuning and capo.
The tuning song has no step-7 grid, so its rows use a grid scaled with the truth maker's fret count: not tool-only.
y-03 scores: same string and fret, of matched notes. Record: `results/step-08-sound-and-video.md`.

| technique | capo | tuning | standard | wall |
|---|---|---|---|---|
| y-01 WAV against the MP4's audio | 0 ms | 0 ms | 0 ms | 6-8 s |
| y-02 cell = truth position, of matched fretted notes: exact / within 1 | 0.0989 / 0.4125 | 0.1224 / 0.2109 | 0.0336 / 0.1877 | 3-4 s |
| y-02 capo from video + sound (truth 3 / 0 / 0) | 3 | 1 | 3 | |
| y-03 full pins, no hint (frets from the nut): base -> pinned | 0.393 -> **0.610** | 0 -> 0 | 0.892 -> 0.729 | 2.6-3.3 s |
| y-03-hint full pins, truth notes | 0.795 -> 0.636 | 0.967 -> 0.713 | 0.892 -> 0.729 | |
| y-03-tips-hint, truth notes | 0.795 -> 0.745 | 0.967 -> 0.914 | 0.892 -> 0.782 | |
| y-03-tips-chain-hint, step-2 notes | 0.800 -> 0.751 | 0.975 -> 0.892 | 0.895 -> 0.795 | |

- **What the numbers carry.** With the tuning and capo given, every pinned run scores below the assigner alone (12 of 12
  results, -0.049 to -0.302; on truth notes tips -0.050 to -0.110, full -0.160 to -0.253). Without the capo, pins lift capo from 0.393 to
  0.610, because cells count from the nut and so carry the capo; the hint alone gives 0.795.
- **Failed.** The picture-to-sound lag test found nothing (hand speed and onset strength never correlate above
  0.11), so later steps use the files' clock. LilyPond's tab script broke on a single pinned note (fixed in a copy).
- **Worth showing** (renders of one input sound the same pinned or not: the eye judges the tabs):
  1. Where the video helps, capo 172-192 s, no hint: 60 positions wrong -> right, 21 right -> wrong
     (`capo/y-03/tab.gp5` beside `capo/f-03/tab.gp5` and `truth/capo/capo.gp5`; `capo/y-03/diff.json`).
  2. Where it hurts, capo 142-162 s, with the hint: 5 wrong -> right, 32 right -> wrong (`capo/y-03-hint/tab.gp5`).
  3. Notes on the neck, capo 171-191 s: `songs/capo/capo.mp4` with `capo/y-02/overlay.json`; of 64 matched fretted
     notes a cell is exact for 12, within a fret on the right string for 39.

## Step 9. Tab file, drawing, playback (o-*)

**Tried.** The truth's own tab written to Guitar Pro 5 by the plan's command (one song tempo, o-01) and by a copy of
the glue with a tempo on every beat (o-01-perbeat: truth beats; o-01-c01: Beat This!'s beats; -32: on 32nds, rests
merged), read back on the recording's clock; alphaTab drawing (o-02) and metronome playback (o-03); FluidSynth (o-04).
Score: same string and fret within 50 ms, share of all truth notes. Record: `results/step-09-tabs-and-chains.md`.

| technique | capo | tuning | standard | wall |
|---|---|---|---|---|
| o-01 plan's writer, one tempo (by note order) | 0.443 (1.000) | 0.068 (0.981) | 0.381 (1.000) | 5.6-9.7 s |
| o-01-perbeat / o-01-c01 tempo on every beat | 0.990 / 0.985 | 0.670 / 0.726 | 0.951 / 0.963 | 5.7-8.8 s |
| o-01-c01-32 the same on 32nds | **0.996** | **0.944** | **0.997** | |
| o-03 alphaTab clicks vs truth beats, F: per-beat / one-tempo file | 0.753 / 0.563 | 0.995 / 0.052 | 0.857 / 0.433 | 4.0-4.9 s |

- **What the numbers carry.** One tempo keeps every note but cannot follow a player. alphaTab plays a one-tempo file
  within 2.6 ms of its own grid; with a tempo change at most beats its clicks fall up to 113 ms off. Its exported
  audio clips 11.7-13.7 % of samples.
- **Failed or not run.** The glue's chord placement raised `KeyError: 288` at the closing grid point (fixed in the
  copy). Real-time playback (the research's chain E) and MuseScore (C) not run. No hints apply.
- **Worth showing.**
  1. Capo 206-226 s: 1 of 67 truth notes within 50 ms in the one-tempo file, 65 in the per-beat 32nd file
     (`capo/o-01/strip.*` against `capo/o-01-c01-32/strip.*`; both `render.wav` over the recording: the drift is heard).
  2. Capo 39-59 s: the per-beat file's clicks 106.1 ms from the truth beats on average
     (`capo/o-03/capo_guitar_and_metronome.wav`, starts at 0.3455 s of the recording).

## Step 10. Hosted services, the whole job in one call (h-*)

**Tried.** The three "B" services on each segment: Klangio Guitar2Tabs and Fretwise in a headless browser, and MiMo
v2.6 Flash asked for the whole tab in one prompt (tuning, capo, key, tempo, chords, every note with string and
fret), without and with the true tuning and capo. Only the segment's sound left the box, as `clip.wav`. Record:
`results/step-10-hosted.md`.

| technique | capo (102 notes) | tuning (106) | standard (125) | wall, cost |
|---|---|---|---|---|
| h-01 Klangio Guitar2Tabs, free tier (B) | stopped at a rights box | - | - | 0 |
| h-02 Fretwise, guest (B) | HTTP 403 "Please verify that you are human" | not sent | not sent | 0 |
| h-03 MiMo one prompt: onset F1; string and fret, share of truth notes | 0.000; 0.000 | 0.052; 0.000 | 0.021; 0.016 | 50-92 s, $0.0007-0.0011 |
| h-03 its tuning, capo; chords majmin; key | right; 0.282; Eb (wrong) | standard (wrong); 0.638; Am | right; 0.530; C (right) | |
| h-03-hint: onset F1; string and fret by note order | 0.000; 0.000 | 0.023; 0.321 | 0.024; 0.112 | 50-103 s, $0.0007-0.0034 |

- **Failed or not run.** Klangio's last page asks the user to assure they hold the rights to the piece; the plan stops
  at any rights box, so nothing was uploaded. Fretwise took the upload and refused with a human check. The five "C"
  services: Klangio API (key after an application form), Songsterr AI (account, Plus), AnthemScore Web (a rights box
  the permission system refused to tick), AAPA AutoTabs (sign-up), Gemini API (balance 0, HTTP 402).
- **Hint.** Order-matched notes sit on the right string more often (tuning 34 of 34, against 0 of 30), but onset F1
  stays near 0; on capo the chords became G Em C D four times (truth Eb Bb Eb Cm).
- **Twice.** Re-sent after the audit under a neutral name (same 624 prompt tokens): the capo answer changed on every
  song (0 -> 3, 3 -> 0, 2 -> 0). Spend for both runs: USD 0.029765 in fourteen calls.
- **Worth showing.** Standard 0-15 s: `standard/h-03/render_mix.wav` (recording left, model right), one C chord for
  the whole segment. Tuning 35-45 s: `tuning/h-03-hint/render_mix.wav` then `tuning/h-03/render_mix.wav`. The stops:
  `capo/h-01/klangio_step5_rights_box.png`, `capo/h-02/api_transcribe_response.json` (third-party page: producer's call).

## The finished tabs: six chains per song

Each chain runs one technique per step and writes a GP5 (tempo on every beat from Beat This!, 32nds, chord names from
madmom or lv-chordia), read back and scored on the recording's clock: same string and fret, share of all truth notes
(the tab list before the file in brackets). Notes: n-03 (capo, standard), n-02 on the Demucs stem (tuning); strings:
LilyPond (capo), tuttut (tuning, standard). Record: `results/step-09-tabs-and-chains.md`.

| chain | tuning and capo from; what else is given | capo (815) | tuning (628) | standard (679) |
|---|---|---|---|---|
| chain-1 | blind: lowest-note rule (t-02) | 0.000 (0.000) | 0.081 (0.102) | **0.822** (0.829) |
| chain-2 | the true tuning and capo (the hint) | 0.753 (0.767) | 0.715 (0.801) | 0.822 (0.829) |
| chain-3 | blind: Opus 5.5 on frames (tuning song: t-02), plus video pins (tips) | **0.712** (0.719) | 0.081 (0.102) | 0.719 (0.729) |
| chain-4 | one hosted call, MiMo (30 s: 102 / 106 / 125 notes) | 0.010 (0.010) | 0.000 (0.000) | 0.016 (0.016) |
| chain-5 | the truth's notes, tuning and capo: the chooser alone | 0.791 (0.795) | 0.914 (0.967) | 0.890 (0.892) |
| chain-6 | chain-2 with matched notes given the truth's strings | 0.940 (0.958) | 0.732 (0.822) | 0.918 (0.928) |

Bold: best blind tab per song. Beats and chord names are the same in chains 1-3 and 6: beats F 0.995 / 0.059 /
0.984, majmin 0.716 / 0.657 / 0.863 (chain-5 on capo 1.000 and 0.706). Right / wrong position / missed / invented on capo: chain-1 0 / 766 /
49 / 117, chain-2 614 / 152 / 49 / 116, chain-5 645 / 167 / 3 / 3.

| loss per step (tab list / finished file) | capo | tuning | standard |
|---|---|---|---|
| tuning and capo from t-02 instead of the truth (chain-2 minus chain-1) | 0.767 / 0.753 | 0.699 / 0.634 | 0 / 0 |
| notes from the best tool, all else true (1 minus chain-6) | 0.042 / 0.060 | 0.178 / 0.268 | 0.072 / 0.082 |
| string and fret from the best chooser (1 minus chain-5) | 0.205 / 0.209 | 0.033 / 0.086 | 0.108 / 0.110 |
| video pins added (chain-2 minus chain-3; tuning chain-1 minus chain-3) | 0.048 / 0.042 | 0 / 0 | 0.100 / 0.103 |
| writing the file, truth tab in (1 minus o-01-c01-32; plan's writer) | 0 / 0.004 (0.557) | 0 / 0.056 (0.932) | 0 / 0.003 (0.619) |

- **Changed or not tool-only.** chain-4's pitches disagree with its own string and fret for 73 of 73 capo notes; no
  beat times came back (own grid at 85 / 50 / 132 BPM); rebuilt after the audit from h-03's blind run 2. chain-3 on
  tuning uses step 8's grid scaled with the answer key's fret count.
- **To show and play** (`render.wav` on the recording's clock; `strip.NN.png` + `strip.json` draw the tab; the truth
  drawn and played the same way: `<S>/o-01-c01-32/`):
  1. chain-1 against chain-2, capo 79-99 s: 0 of 77 notes right without the capo, 44 with it; both sound alike.
  2. chain-4, tuning 26-46 s: 3 of 74 truth notes found, all on another position, 28 invented (`tuning/chain-4/render.wav`).
  3. chain-6, tuning 96-116 s: all 50 notes found on the truth's position, 24 missed, 28 invented (gaps heard).

## What the truth settles

| statement (these three recordings) | the number | file (`<S>/<exp>/result.json`) |
|---|---|---|
| Separating a solo guitar from itself with a trained separator does not help its notes | Demucs (both models), its fine-tune and ElevenLabs move whole-song Basic Pitch F1 by 0.0112 or less (capo 0.689 -> 0.700 at most); on the band clip 0.600 -> 0.772 | `<S>/sep-0*`, `S4/sep-0*` |
| HPSS, with no model, is the one separation step that lifts a solo song | capo 0.689 -> 0.783 (precision 0.537 -> 0.666), standard 0.664 -> 0.685, tuning 0.626 -> 0.625 | `<S>/sep-07` |
| Guitar-trained transcribers beat the general ones on every song | best 0.920 / 0.830 / 0.892 against Basic Pitch 0.689 / 0.626 / 0.663 and YourMT3+ 0.803 / 0.731 / 0.774 | `<S>/n-0*` |
| A multimodal LLM does not write notes from audio | MiMo found 0, 0 and 4 of 102 / 106 / 125 segment notes; with the hint 1, 1, 0 | `<S>/n-08*` |
| Beat This! places the beats where the rhythm is known; madmom's downbeats need the tempo on capo | beats F 0.998, 0.989; downbeats 0.664 -> 0.993 with the hint | `<S>/c-01`, `<S>/c-02*` |
| Chord names are right 0.68-0.86 of the time at best | majmin 0.710 capo, 0.680 tuning (madmom), 0.864 standard (lv-chordia) | `<S>/c-02`, `standard/c-04` |
| No technique named the tuning song's tuning | lowest-note rule: Drop D (5 strings wrong); MiMo: Drop D or standard; Opus 5.5: standard | `tuning/t-02`, `t-03`, `t-07` |
| The capo was read reliably only from the picture | Opus 5.5 on frames right on 3 of 3 songs; MiMo from audio 1 of 6 answers on the capo song; lowest-note rule missed it | `<S>/t-07`, `capo/t-03`, `capo/t-02` |
| Given notes, tuning and capo, the string and fret choice is mostly right; without them it fails | tuttut = LilyPond 0.795 / 0.967 / 0.892; without the tuning 0 on tuning; without the capo 0.394 (frets from the nut) | `<S>/f-01*`, `<S>/f-03*` |
| Fingertip cells from the video are rarely the played position | exact 0.088 capo, 0.0293 standard; no fret line at all on the nylon guitar | `<S>/w-05`, `tuning/w-04` |
| Video string pins lower the score once tuning and capo are known | 12 of 12 hinted results lower (-0.049 to -0.302); without the capo they lift capo 0.393 -> 0.610 | `<S>/y-03*` |
| The tab file's tempo decides whether notes land in time | one tempo 0.443 / 0.068 / 0.381 of the truth's own notes within 50 ms; a tempo per beat on 32nds 0.996 / 0.944 / 0.997 | `<S>/o-01*` |
| A wrong blind capo or tuning answer sinks the finished tab | chain-1 0.000 capo, 0.081 tuning; with the true tuning and capo 0.753 / 0.715 | `<S>/chain-1`, `<S>/chain-2` |
| The one hosted service that answered gives no usable tab | chain-4: 1, 0 and 2 truth notes right in 30 s; Klangio and Fretwise returned nothing | `<S>/chain-4`, `<S>/h-0*` |

## What the viewer has to judge

| no number settles this | play or show |
|---|---|
| The tuning song's beat: the truth placed its beats by rule; every tracker hears the pulse 0.2 s later | `work/exp-chords/clicks/tuning.truth.click.wav` and `tuning/c-01/click.wav`, 25-45 s |
| Whether a separated stem sounds cleaner when its notes score the same | `standard/sep-05/stems/Guitar.flac` vs `songs/standard/standard.wav` 0-20 s; `capo/sep-04/ab_mix_then_stem_5s.wav` |
| Whether Basic Pitch's invented notes sound like the slaps they sit on (240 of 674 on capo) | `capo/n-01/render.wav` 184-204 s, then the recording |
| How a tab reads: a pitch on a wrong string sounds the same, so the eye judges | `tuning/f-01/tab.gp5` vs `tuning/f-01-hint/tab.gp5` 49-64 s; `capo/chain-1` vs `capo/chain-2` strips 79-99 s; `capo/o-02/capo.o-01-c01.png` |
| How close a near-zero score sounds | `standard/n-08/render.wav` 10-30 s; `standard/h-03/render_mix.wav` 0-15 s (one C chord throughout) |
| Whether the split-off bass sounds like a bass line | `tuning/v-01/render.bass.wav`, `tuning/v-01-hint/render.melody.wav` 40-60 s |
| The hand overlays (no truth for landmarks) | `capo/w-02/overlay.mp4`, `tuning/w-02/overlay.mp4`, `standard/w-07/overlay.mp4` 157-177 s |
| Chord colour: the truths label no sevenths; Chordino says Ebmaj7, Bbaug, D7/F# on capo 39-59 s | `capo/c-03/render.wav` vs `work/exp-chords/render/capo.truth.chords.wav` |
| Two answers to one request: MiMo's tuning-song key A minor, then F major | `tuning/c-06/chords.lab`, `tuning/c-06/repeat2/chords.lab` |

## Surprises

| result | against | here (numbers, file) |
|---|---|---|
| Demucs kept real guitars in its guitar stem | the post: htdemucs_6s put a lone synthesized guitar in its piano track, 2 of 2 runs | guitar stem -15.41 dBFS against piano -56.53 on capo; tuning -18.37, standard -16.01 in guitar (`<S>/sep-01/stem_levels_dbfs.json`) |
| MiMo did not hear the capo | the post: MiMo said fret 2 for a capo on 2 in 2 of 3 tries | capo song (capo 3): capo 1, "cannot tell", capo 1; from frames fret 2 (`capo/t-03/summary.txt`, `capo/t-04/answer.json`) |
| Fingerstyle chords are harder than the post's strummed clip | the post: seven recognisers right for 18.8-23.2 of 24 s (0.78-0.97) | best majmin 0.710 / 0.680 / 0.864; Chordino 0.585 / 0.669 / 0.779 (`<S>/c-0*`) |
| A tab file that keeps every note can lose the music | the post: four readers kept all 90 notes of a synthesized tab | the plan's writer keeps every note (order 1.000 / 0.981 / 1.000) but 0.443 / 0.068 / 0.381 land within 50 ms (`<S>/o-01`) |
| Basic Pitch writes far more notes on a real guitar | the post's 90-note synthesized clip: 87-137 notes back | 1456 notes for 815 (capo), 788 for 628, 1067 for 679; on capo 240 extras on slaps, 71 below G2, which led the lowest-note rule to a 6th string at D#2 (`<S>/n-01`, `capo/t-02/lowest.json`) |
| Seeing the fingers made the strings worse | expectation: the video should fix string choice | every hinted pinned run lower: capo 0.795 -> 0.636 / 0.745, tuning 0.967 -> 0.713 / 0.914, standard 0.892 -> 0.729 / 0.782 (full / tips; `<S>/y-03*-hint`) |
| A piano transcriber beat the multi-instrument one on guitar | expectation: a model with a guitar program does better | Transkun 0.896 / 0.785 / 0.866; YourMT3+ 0.803 / 0.731 / 0.774, guitar tracks alone 0.827 / 0.732 / 0.780 (`<S>/n-04`, `<S>/n-05`) |
| The same request twice gave different answers | expectation: one answer per input | MiMo chords on capo majmin 0.480 then 0.805; tuning key A minor then F major; whole-tab capo 0 then 3, 3 then 0, 2 then 0 (`<S>/c-06`, `<S>/h-03`) |
| A hint can hurt | expectation: more facts, better answers | MiMo chords with tuning and capo: capo 0.480 -> 0.207, standard key C -> F major; whole-tab chords on capo G Em C D (`<S>/c-06-hint`, `capo/h-03-hint`) |
| Opus 5.5 counted the capo from inlays, yet missed a nylon guitar's tuning | expectation: both hard from pictures | capo right on 3 of 3 with the nut out of frame; tuning guessed standard, all six strings wrong (`<S>/t-07/look/`) |

## For someone choosing tools to hand to an AI

Closest to the truth on these three recordings, by the numbers, and what it cost. Wall time per whole song on 2 CPU
cores unless marked; no run used a graphics card; "key" = an account key from the key store.

| step | closest to the truth here | next | cost of the closest |
|---|---|---|---|
| 1 separation | solo songs: HPSS lifts Basic Pitch on capo (0.689 -> 0.783) and standard (0.664 -> 0.685), not tuning; before the guitar models the best separator moved F1 by -0.006 / +0.003 / -0.016. Band clip: ElevenLabs 13.70 dB, F1 0.772 | Demucs fine-tune 6.10 dB, 0.735 (band clip) | HPSS 147-212 s, no model. ElevenLabs: key, 6268 credits ($1.379) for the 228 s capo song |
| 2 notes | guitar-fl 0.920 capo, 0.892 standard; guitar-gaps 0.830 tuning | Transkun 0.896 / 0.785 / 0.866 | 102-156 s, free weights |
| 3 voices, taps | threshold at the true open 3rd string 0.956 / 1.000 / 1.000 (needs the tuning, capo); taps: Demucs drums F 0.820 capo, 0.479 standard | HPSS taps F 0.442 / 0.581 | 8-12 s; Demucs 103-117 s |
| 4 beats, tempo | Beat This! F 0.998 / 0.989 (tuning unsettled); madmom tempo within 4 % on 3 of 3 | madmom downbeats need the tempo on capo | 9.4-15.4 s; madmom 125-158 s |
| 4 chords, key | madmom majmin 0.710 capo, 0.680 tuning; lv-chordia 0.864 standard; madmom's key right on 2 of 3 | Chordino 0.585 / 0.669 / 0.779 | 125-158 s (madmom), 29-65 s (lv-chordia) |
| 5 offset | librosa off by 1 / 1 / 3 cents | NNLS Tuning 1.6 / 0.1 / 2.1 | under 1 s |
| 5 capo | Opus 5.5 on 2 contact sheets + 3 neck crops: 3 of 3 | OWLv2 2 of 3 | a Claude cloud session per song, $0.51-0.62, 37-68 s (the gateway refused Opus on a free tier) |
| 5 open strings | Opus 5.5 and the lowest-note rule right on standard; Opus also on capo; none on tuning | MiMo strings 2 / 0 / 3 of 3 | as above |
| 6 string, fret | tuttut = LilyPond with tuning and capo: 0.795 / 0.967 / 0.892 (0.762-0.767 / 0.803 / 0.826-0.829 from step-2 notes) | Guitab from audio with capo: 0.780 / 0 / 0.839 | tuttut under 0.4 s, LilyPond 3.3-8.8 s; both need the tuning and capo |
| 7 video | MediaPipe: fretting hand lost in 0.9-12.4 % of frames; Hough grid on steel strings only (cells exact 0.088 / 0.029) | RTMPose lost 0.18-0.19 of two segments | 187-279 s |
| 8 sound + video | no pin rule beat the assigner alone once tuning and capo were known (truth notes, tips: -0.050 to -0.110) | full rule -0.160 to -0.253 | seconds |
| 9 file | tempo on every beat, 32nds (`gp5fb.py`): 0.996 / 0.944 / 0.997 | plan's writer 0.443 / 0.068 / 0.381 | 5.7-8.8 s |
| 10 one call | nothing usable: MiMo onset F1 0.000 / 0.052 / 0.021 | Klangio, Fretwise: no output | key, $0.0007-0.0011 per 30 s |
| whole job | best blind tab: capo 0.712 (chain-3), tuning 0.081, standard 0.822 (chain-1); with the true tuning and capo 0.753 / 0.715 / 0.822 | chain-4 (one call) 0.010 / 0 / 0.016 | a chain build 2.4-12.2 s after its tools |

## Limits

- **Three recordings, two players.** Two fingerstyle arrangements by Gareth Evans on steel strings, one original by
  Evan Handyside on nylon in D G C F A C; solo guitar, fixed close cameras, no voice or band (the only mix is the
  synthesized clip S4). Nothing here measures strumming, electric guitar, a moving camera or a second player. Each
  number is one run; no spread was measured except MiMo's repeats (which differed). htdemucs_6s is not deterministic.
- **How each truth was made** (`truth-<S>.md`, checks in `truth-<S>-check.md`, doubts in `results/truth-doubts.md`):
  capo from the player's on-screen tab, 72 bars read twice (997 of 1007 note heads agreed), aligned to the
  recording, repaired once (128 onsets re-timed): 815 notes, 761 confirmed in the audio, 54 from the tab alone (soft
  pull-offs, notes under slaps); the neck outline's nut corners are extrapolated. Tuning from the composer's
  handwritten tab with no rhythm, read twice (134 of 134 agreed): beats, tempo and metre are inferred by rule;
  repaired (12 bass notes E2 not D2; of about 55 notes nothing audibly plucks, 37 fixed or shown heard, 18 marked unconfirmed): 628
  notes, 556 confirmed, 72 from the tab; rolled chords within about 0.1 s; the key (D minor or F major) is a judgement;
  one hand-set neck outline for a moving guitar. Standard from the player's on-screen tab read twice (853 of 853),
  repaired three times and passed a fourth check: 679 notes, 572 confirmed, 96 from the tab, 11 heard but not in the
  tab; +6 cents uncertain by about 2; the neck tracked per frame. All three: offsets are a let-ring rule; voices,
  chords and key are derived by rule, with no sevenths. 30 standard results were rescored after the last repair; no
  ranking changed (`results/rescore-standard.md`).
- **30 s segment only:** sep-04, sep-05, sep-06 (tuning, standard), n-08, c-06, t-03, t-04, w-03, h-03, chain-4. A
  segment holds 102-125 notes; segment and whole-song scores are not comparable one to one.
- **Not scored against a truth:** hand landmarks, the tuning song's taps and beat phase, SAM masks beyond corners,
  cells on tracked outlines, alphaTab's drawing. **Assisted:** t-08 (the truth's shapes), step 8 and chain-3 on tuning
  (grid from the truth maker's fret count), chains 2, 5 and 6 (tuning, capo, notes or strings given).
- **Never ran:** the RunPod pod (refused by the permission system, not retried), so SAM 3 and whole-song BS-RoFormer
  (22-33 min a song on CPU); All-In-One (heavy install); Klangio (rights box), Fretwise (human check) and five "C"
  services (key, account, Plus, rights box, unpaid balance); every step's "C" entries; tabsynth and Guitab with a
  tuning (no option); grid and cells on the nylon guitar; scorify on whole songs (0 placed); real-time playback;
  ElevenLabs on the whole tuning and standard songs (spend cap).
