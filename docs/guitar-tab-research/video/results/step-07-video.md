# Step 7. Hands, fretboard and capo from the video (w-*)

Agent `exp-video`, 2026-11-25. Inputs: the cropped `<S>.mp4` of each song (`/home/user/gtv/songs/<S>/`), the truth
`<S>.truth.json` and `<S>.video.json` (`/home/user/gtv/truth/<S>/`). Every number below is in a `result.json` or a
score file under `/home/user/gtv/experiments/<S>/<exp>/`; work scripts and the run log are in
`/home/user/gtv/work/exp-video/` (`bin/`, `PROGRESS.md`). Timed runs went through `gtr-run` (2-core slots; run ids
`rNNNN` below). Video time = recording time in all three songs (`av_offset_s` 0).

| id | priority | ran on | scope |
|---|---|---|---|
| w-01 MediaPipe Hand Landmarker 1.2.2 | A | capo, tuning, standard | whole piece |
| w-02 overlay video (landmarks + grid + cells) | A | capo, tuning, standard | one 20 s stretch each |
| w-03 RTMPose hand (rtmlib 0.0.16) | B | capo, tuning, standard | seg30 (165-185 ms per frame) |
| w-04 fret grid: hand-set quad, OpenCV LSD/Hough, 12-TET fit | A | capo, standard; **failed on tuning** | 3 frames per shot + every 1 s |
| w-05 fingertip -> (string, fret) cell, scored | A | capo, standard; **not possible on tuning** | whole piece |
| w-06 SAM 2.1 tiny neck mask -> quad | B | capo, tuning, standard | one frame each |
| w-07 CoTracker3 (RunPod) | B | not run: no pod in this job | - |
| w-08 WiLoR, w-09 Roboflow | C | not run (C) | - |

No hint input: none of the w-* tools takes a tuning, capo, tempo or range, so there are no `-hint` runs.
The capo box asked for in the overlays has no source: no w-* tool detects a capo, and the step-5 capo detectors
give none for these songs (`capo/t-06/result.json`: skipped, pod refused and SAM 3 gated). `overlay.json` carries
`"capo_box": null` with that reason.

## Definitions (how "lost" is counted; no truth exists for hand landmarks)

- **Hand lost** (`bin/hand_loss.py`, per video frame): no hand labelled "Left" (the fretting hand, video not
  mirrored), or the "Left" hand is not the right-most hand (the nut is at the right in all three videos), or none of
  its tips 8/12/16/20 lies inside the neck quad of `<S>.video.json` grown by 25 % of the neck width on each side.
  For label-less RTMPose: the right-most hand, lost if none or off the neck. For standard the quads are the truth's
  76 tracked poses (repaired file of 06:05); capo and tuning have one static quad each.
- **Neck lost** (`bin/neck_track.py` + `bin/neck_summary.py`, one frame per second): with the shot's static
  hand-set quad, neither Hough nor LSD fret clusters give a 12-TET fit (as in `handoff_fingertip_to_cell.py`) with
  RMS <= 8 px in the 1200x130 rectified neck.
- **Cells** (`tools/bin/score_video_cells.py`): for every truth note with fret > 0, the fretting hand at the onset
  frame; hit = a fingertip cell equals (string, fret + capo) counted from the nut; within1 = same string, fret +-1.

## Table 1. Hand tracking: fretting hand lost (share of frames)

| technique | capo | tuning | standard |
|---|---|---|---|
| w-01 MediaPipe, whole piece | 185/5698 = 0.0325 | 698/5621 = 0.1242 | 79/8851 = 0.0089 |
| - of which no "Left" hand | 133 | 182 | 79 |
| - of which "Left" label on the picking hand | 23 | 0 | 0 |
| - of which tips outside the neck quad | 30 | 516 | 0 |
| - longest lost run | 0.64 s | 10.17 s | 0.28 s |
| w-03 RTMPose (right-most hand), seg30 | 146/750 = 0.1947 | 158/900 = 0.1756 | 0/1500 = 0 |
| w-01 MediaPipe, same seg30 window, same right-most rule | 2/750 = 0.0027 | 31/900 = 0.0344 | 0/1500 = 0 |
| w-03 frames with more than 2 hands | 0.0613 | 0.0567 | 0.0027 |

Tuning's 516 off-quad frames are where the guitar has moved off the one static quad (the truth check measured the nut
about 100 px lower at 50 s and 125.5 s than the quad); its 178 frames with no hand are the first 2.4 s and the last
3.7 s (183.7-187.37 s), outside the playing. Sources: `<S>/w-01/hand_loss.json`, `<S>/w-03/hand_loss_rtm.json`,
`<S>/w-03/hand_loss_mediapipe_same_window.json`.

## Table 2. Fret grid (w-04): neck lost with a static hand-set quad

| measure | capo | tuning | standard |
|---|---|---|---|
| quads (from `<S>.video.json`, set by hand) | 1 (nut corners off-frame, extrapolated) | 1 (set at 33.0 s) | 3 poses (0-50, 50-100, 100-177 s) |
| frames tried for the grid (quad frame and +-4 s) | 3 | 3 | 9 |
| 12-TET fits found (of 2 detectors x frames) | 3 (all Hough) | **0** | 8 (5 Hough, 3 LSD); pose A none |
| lowest fit RMS | 4.5 px (frame 165) | - | 7.38 px (B), 4.49 px (C) |
| 1-s samples with any LSD fit / Hough fit | 2 / 214 of 228 | 0 / 0 of 188 | 69 / 129 of 178 |
| **neck lost** (no fit with RMS <= 8 px) | 174/228 = 0.7632 | 188/188 = 1.0 | 147/178 = 0.8258 |
| longest lost run | 19 s | 188 s | 40 s |
| fret number the fit puts at mid-board (u = 600) | 8 (50x), 9 (4x) | - | 8 (8x), 9 (23x) |

- **LSD, the research's detector, finds fewer than 6 fret clusters on almost every frame**: the strings cut each fret
  wire into pieces shorter than the 40 % of neck width a "fret-like" segment needs. Hough (maxLineGap 5) bridges the
  cuts on capo and standard; that is the fallback used.
- **Tuning (nylon guitar): 0 fret-like segments** from either detector on all 188 samples and the 3 grid frames;
  tried once more on frame 990 with 800x116 rectification and with CLAHE contrast: still 0. Status failed.
- The 12-TET numbering is not stable: capo's three grid frames give k0 = 6, 8 and 11 (with 2 clusters dropped);
  standard's fits all sit at k0 = 13-14, the top of the script's search range.
- Standard against the truth's neck track (`standard.neck_track.json`, every 5th frame): the static 3-pose quad's
  worst corner is more than 25 px (about one string lane at the nut) from the tracked outline in 1236/1771 samples
  (0.6979), more than 50 px in 138; median 29.8 px (`standard/w-04/track/static_vs_truth_track.json`).

Runs: grid r0829 capo, r0852 tuning, r0857/r0873/r0874 standard (2-4 s each); tracking r0827 (41.5 s), r0837
(99.6 s), r0840 (38.1 s). Sources: `<S>/w-04/track/neck_summary.json`, `<S>/w-04/shot*/opencv_lines_<S>.json`,
`<S>/w-05/{lsd,hough}/handoff_*.json`.

## Table 3. Fingertip cells against the truth (w-05, chain w-01 + w-04)

| measure | capo (capo 3) | tuning | standard |
|---|---|---|---|
| grid used | Hough, frame 165, RMS 4.5 px | none (w-04 failed) | Hough, frames 2750 (B) and 5585 (C); pose A none |
| fretted truth notes | 557 | 206 | 546 |
| notes with no grid | 0 | all | 148 (pose A, 0-50 s) |
| **exact (string and fret)** | 49 = **0.088** | not scored | 16 = **0.0293** |
| **same string, fret +-1** | 222 = **0.3986** | not scored | 100 = **0.1832** |
| fret right, any string | 270 | - | 118 |
| fret +-1, any string | 464 | - | 322 |
| labelled fingertips: with a cell / exact | 3 of 5 / 0 | - | 12 of 12 / 0 |
| labelled fingertips: fret error (cells - truth) | +1 (3x) | - | +1 (3x), +2 (6x), +3 (3x) |
| labelled fingertips: string error | 0 (2x), -1 (1x) | - | 0 (6x), -1 (1x), +1 (4x), +2 (1x) |
Standard rescored against the repaired answer key on 2026-11-25; changes: 547 -> 546 fretted notes, no grid 149 -> 148, exact 9 (0.0165) -> 16 (0.0293), same string +-1 fret 81 (0.1481) -> 100 (0.1832), fret right any string 121 -> 118, fret +-1 any string 310 -> 322, labelled fingertips with a cell 11 -> 12 (fret error +2: 5x -> 6x; string error exact 4 -> 6); mostly from the scorer now carrying each fingertip along the truth's per-frame neck outline (400 lookups compensated). Capo stays far ahead.

Standard is scored against the repaired truth (`standard.truth.json`, third repair round, 546 fretted notes; rescored
2026-11-25 with `score_video_cells.py`'s per-frame neck outline `standard.neck_track.json`, 400 lookups compensated;
earlier scores: 9 / 81 of 542 on the first file, 9 / 81 of 547 on the second); the shots for scoring are the 3 poses w-04 ran on
(`standard/w-05/standard.video.3poses.json`), labelled frames from the repaired file. Sources:
`<S>/w-05/score_cells.json`, `<S>/w-05/score.sh`.

**w-03 on capo seg30 (12.76-42.76 s), same grid**: 80 fretted notes; RTMPose cells exact 7, within1 20;
MediaPipe with the same right-most-hand rule exact 5, within1 12 (`capo/w-03/cells_rtm.json`,
`capo/w-03/cells_mediapipe_same_window.json`). Tuning and standard seg30 have no grid (no cell score).

## Table 4. The three 20 s overlay stretches (w-02)

| | capo 12.76-32.76 s | tuning 25.0-45.0 s | standard 107.0-127.0 s |
|---|---|---|---|
| frames | 500 | 600 | 1000 |
| frames with no fretting hand | 1 | 0 | 0 |
| hand lost (Table 1 rule) | 5 (1 no label, 4 label on picking hand) | 0 | 0 |
| neck lost, 1-s samples | 13/20 | 20/20 | 16/20 |
| fretted truth notes in the stretch | 50 | 26 | 67 |
| cells exact / within1 | 2 / 3 | - (no grid) | 0 / 14 |
| fret right, any string | 28 | - | 17 |
| render | r0886, 21.5 s | r0887, 29.6 s (half size) | r0895, 29.1 s |

Each `overlay.mp4` has the recording's sound; `overlay.json` follows PRODUCTION.md 6.4 `clipoverlay.overlay`
(`frames[i]` = 42 normalised numbers of the fretting hand or null) plus `grid` (fret lines 0-19 and the 7 string-lane
edges in frame pixels), `cells` (per frame, tip -> [string, fret from nut]) and `capo_box: null`. Sources:
`<S>/w-02/score.log`, `hand_loss_window.json`, `neck_window.json`, `cells_window.json`.

## What failed, was refused or was not run

- **w-04 / w-05 tuning: failed** - no fret line found (above). Nothing to score.
- **w-04 LSD everywhere**: < 6 clusters (2 of 228 capo samples fit); the Hough fallback was used and is recorded.
- **w-04 standard pose A (0-50 s)**: no fit on frames 250, 450, 650 with either detector; its 148 fretted notes
  count as misses in w-05.
- **w-06**: ran, but through Hugging Face, not Ultralytics (github.com 403); no grid on its quads (below).
- **w-07 CoTracker3**: RunPod only; no pod in this job (EXPERIMENTS.md "RunPod plan": planned only). Not run.
- **w-08, w-09**: priority C, not run.
- **No subagent tool in this session**: no step-7 technique needed a model to look at frames (capo reading by
  Opus is t-07, step 5), so nothing was lost, but none could have been delegated.
- Mid-run, another agent repaired `standard.truth.json` and `standard.video.json` (06:05; 3 poses became 76
  tracked poses). w-04 had already run on the 3 poses; w-05 and the stretch scores were re-run on the repaired truth, and again on
  2026-11-25 after the third repair round (`rescore-standard.md`).

## w-06

Ran on all three songs, one frame each (r0922: 23.8 s for the three including model load; about 2 s per frame on
2 cores, against about 100 s per image in the research). Not the research's route: Ultralytics' `sam2.1_t.pt` is not
on the box and its host (github.com) answers 403 here, so the same model family was run as
`facebook/sam2.1-hiera-tiny` through transformers 5.22.2 (`bin/sam_quad.py`, venv-ultra). Prompts: 3 points on the
centre line of the hand-set quad at 30/50/70 % of its length.

| | capo f165 | tuning f990 | standard f450 (pose A) |
|---|---|---|---|
| mask area (px) | 209,760 | 153,897 | 230,429 |
| worst corner vs the hand-set quad | 314.4 px | 428.1 px | 70.8 px |
| worst corner vs the truth neck track | - | - | 70.8 px (the track equals the hand quad at 9.0 s) |
| 12-TET fit with the SAM quad (LSD / Hough) | none / none | none / none | none / none |

By eye on the three masks (`<S>/w-06/<S>_f*_sam_mask.webp`): on capo the mask covers the fretboard from the
soundhole and stops at the capo (the hand quad's nut end is extrapolated off-frame, hence 314 px); on tuning it
runs on past the fretboard over the soundhole; on standard it reaches past the nut and into the soundhole. The
min-area rectangle does not follow the neck's perspective, and fret detection on it finds 0-6 clusters
(`<S>/w-06/grid.log`, r0925-r0927).

## For the film

| technique | stretch (song, s) | show | play | settled by |
|---|---|---|---|---|
| w-01 MediaPipe | capo 12.76-32.76 | `capo/w-02/overlay.mp4` (green = fretting hand, magenta = picking hand) | its own sound | eye: the skeleton holds the hand in 495 of 500 frames; the 4 "Left on the picking hand" frames are in this stretch (`capo/w-02/hand_loss_window.json`). No truth for landmarks |
| w-02 overlay | tuning 25.0-45.0 | `tuning/w-02/overlay.mp4` | its own sound | eye: hands tracked in all 600 frames, but no grid at all (w-04 failed on this guitar) |
| w-03 RTMPose | capo 12.76-32.76 (seg30) | `capo/w-03/frames/*.webp` next to `capo/w-02/overlay.mp4` | - | number (rule-based, not truth): right-most hand lost 0.1947 of seg30 vs MediaPipe 0.0027; more than 2 hands in 0.0613 of frames |
| w-04 fret grid | capo 12.76-32.76 | `capo/w-02/overlay.mp4` (yellow fret numbers) | - | truth: the grid numbers every fret 1 too high: the capo, which the truth puts in fret space 3, sits between grid lines "3" and "4" (frame at 17.74 s, read by eye); all 3 labelled capo fingertips read +1 (`capo/w-05/score_cells.json`) |
| w-04 neck lost | standard 107.0-127.0 | `standard/w-02/overlay.mp4` | - | number: static quad gives a good fit in 4 of 20 seconds (`standard/w-02/neck_window.json`); whole song 0.6979 of samples > 25 px off the truth neck track |
| w-05 cells | standard 107.0-127.0 | `standard/w-02/overlay.mp4` ("s4 f3" labels) with the truth tab of the same bars | the stretch | truth: 0 of 67 fretted notes exact, 14 within one fret on the right string, 17 right fret on any string (`standard/w-02/cells_window.json`) |
| w-05 cells | capo 12.76-32.76 | `capo/w-02/overlay.mp4` | the stretch | truth: 2 of 50 exact, 28 of 50 right fret on any string: the strings are where it misses here |
| w-06 SAM | capo f165 (still) | `capo/w-06/capo_f0165_sam_mask.webp` | - | eye: the mask ends at the capo; number: no fret grid could be fitted on any song's SAM quad |

Nothing in this step is a tab or a note list, so there is no `render.wav`: the cells become notes only when joined
with audio onsets (y-02, step 8).
