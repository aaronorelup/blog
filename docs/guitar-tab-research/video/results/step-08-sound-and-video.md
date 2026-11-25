# Step 8. Sound and video together (y-*), on the three recordings

Agent `exp-av`, 2026-11-25. Every number below is in a `result.json` (result.py) or a file it lists, under
`/home/user/gtv/experiments/<S>/<exp>/`. Scripts: `/home/user/gtv/work/exp-av/bin/` (`y01.py`, `avlib.py`, `y02.py`,
`res_y02.py`, `mkgrid_tuning.py`, `pins.py`, `run_y03.sh`, `run_lilypond_tab_pins.py`, `diff.py`, `mkscores.py`);
run log and next steps: `/home/user/gtv/work/exp-av/PROGRESS.md`; all y-03 rows in one file:
`/home/user/gtv/work/exp-av/y03_table.txt`. Truth: the whole of each song (no `scored_range`, nothing cropped).

**Inputs, as asked.** Notes: the best step-2 technique per song by onset F1 (`step-02-notes.md`): capo n-03
guitar-fl (0.920), tuning n-02 guitar-gaps (0.830), standard n-03 (0.892 after the standard rescore of
2026-11-25, was 0.882; still the best). Hand positions: the best step-7 chain, w-05
(w-01 MediaPipe "Left" hand + w-04 Hough fret grid on the hand-set neck quad), looked up exactly as
`tools/bin/score_video_cells.py` does (`avlib.py` imports its grid and neck-motion code). Assigner: the best step-6
assigner, f-03 LilyPond (chain-hint 0.800 / 0.975 / 0.895 in `step-06-string-fret.md`).

**Two departures from step 7's outputs, both forced:**
- **tuning has no step-7 grid** (w-04 found no fret line). Fallback, used for every tuning row here: 12-TET frets on the
  hand-set quad of `tuning.video.json`, no fret detection: nut at the quad's nut edge, scale set so fret 19 falls at
  image x = 1200 on the quad's centre line (the truth maker's fret count in `frets_visible_note`); the quad's body end
  then lands at fret 13.48 (`tuning/y-02/grid_fallback/handoff_tuning_fallback.json`). It uses the truth maker's fret
  count, so tuning rows are not a tool-only chain.
- **standard is looked up with neck-motion compensation**: `score_video_cells.py` and `standard.neck_track.json` were
  both updated at 07:29, after step 7 scored w-05 (06:09). The track is a SIFT + RANSAC tracker seeded by one hand-set
  outline. Re-scoring w-05 on standard with it: exact 16, within one fret 100 of 546 fretted truth notes (step 7 before its
  2026-11-25 rescore: 9 and 81 of 547; step 7 now shows the same 16 and 100) (`standard/y-02/score_cells_truth_tracked.json`).

| id | priority | ran on | scope | wall-clock per song |
|---|---|---|---|---|
| y-01 clock check | A | capo, tuning, standard | whole piece | 8.3 / 6.1 / 7.5 s (re-run timed, `y-01/run.log`) |
| y-02 onsets x fingertip cells, and y-02-hint | A | capo, tuning (fallback grid), standard | whole piece | 2.9 / 2.8 / 3.9 s (`y-02/run.log`) |
| y-03 video string pins + LilyPond, 8 variants | A | capo, tuning (fallback grid), standard | whole piece | 2.6-3.3 s per LilyPond run (gtr-run lane `film-av`, r10xx in `run.log`) |

There are no B or C entries in y-*. No y-* experiment has a model look at frames, so no helper agent was started.

## Table 1. y-01: do sound and picture share one clock?

| measure | capo | tuning | standard |
|---|---|---|---|
| ffprobe start_time, video / audio stream | 0.000000 / 0.000000 | 0.000000 / 0.000000 | 0.000000 / 0.000000 |
| `<S>.wav` vs the MP4's own audio: lag (peak normalised cross-correlation, first 60 s, 11025 Hz) | 0 ms (0.9999) | 0 ms (1.0) | 0 ms (1.0) |
| picture vs sound: picking-hand fingertip speed vs onset strength, correlation at lag 0 | 0.0136 | -0.0108 | -0.004 |
| same, best lag in +-0.5 s (correlation) | -120 ms (0.1051) | +333.3 ms (0.0677) | -100 ms (0.0599) |

Source: `<S>/y-01/av_sync.json`. The WAV and the MP4 audio are the same samples. The picture-to-sound test did not
work: no lag gives a correlation above 0.11, so this step establishes no picture lag either way; every later row
assumes the files' own clock (video time = audio time, `av_offset_s` 0 in each `video.json`).

## Table 2. y-02: each estimated note at its onset frame (`<S>/y-02/<S>.join.json`)

Pitch checks: does the note's pitch equal an open string, or open string + fret of a fingertip cell (fret counted from
the nut, above the capo)? "No hint" uses standard tuning and capo 0 (what the research's chain D assumed); "hint" uses
the truth's tuning and capo. Cell vs truth: estimated notes matched to truth notes (mir_eval, 50 ms, 50 cents); for
matched truth notes with fret > 0, does a fingertip cell equal (string, fret + capo).

| measure | capo | tuning | standard |
|---|---|---|---|
| estimated notes (onsets) | 883 | 618 | 734 |
| with a grid / with a fingertip cell | 883 / 851 | 618 / 527 | 534 / 530 (no grid in pose A, 0-50 s) |
| pitch = a fingertip cell, no hint / hint | 86 / 86 | 50 / 46 | 62 / 62 |
| same with every cell's fret minus 1, no hint / hint | 232 / 217 | 37 / 13 | 99 / 99 |
| pitch = an open string, no hint / hint | 13 / 422 | 79 / 386 | 161 / 161 |
| open string or fingertip cell, no hint / hint (of notes with a cell) | 99 / 452 (of 851) | 129 / 408 (of 527) | 199 / 199 (of 530) |
| matched truth notes with fret > 0 | 526 | 147 | 506 |
| a fingertip cell = the truth position: exact | 52 = **0.0989** | 18 = **0.1224** | 17 = **0.0336** |
| same string, fret within 1 | 217 = **0.4125** | 31 = **0.2109** | 95 = **0.1877** |
| capo from video + sound, no hint (gtr-eval tuning, eval id) | 3: right (e2436) | 1: wrong, truth 0 (e2438) | 3: wrong, truth 0 (e2440) |
| capo from video + sound, true tuning given | 3: right (e2437) | 0: right (e2439) | 3: wrong (e2441) |

The capo estimate is y02.py's own rule (docstring): the capo k for which most notes are an open string at k or a
fingertip cell above k. Its counts per k are in `join.json` (`capo_from_video_and_sound`). On capo the fret-minus-1
count (232) is larger than the plain one (86): the step-7 grid numbers frets one too high on this guitar.
For reference, all fretted truth notes against the same lookup: capo 49 / 222 of 557 (step 7, unchanged), standard
16 / 100 of 546 (tracked, above), tuning with the fallback grid 32 / 50 of 206, labelled fingertips 5 of 5 with fret
error 0 and string error -2 (2x), 0 (2x), +1 (1x) (`tuning/y-02/grid_fallback/score_cells_truth.json`).

## Table 3. y-03: string and fret, sound alone vs sound + video

Each run gives LilyPond the same notes twice: without pins (`base/`, identical note for note to step 6's f-03 run of
the same input, checked on four pairs) and with a string pin per note from `pins.py`. Rule **full** (the plan's rule):
pin the fretted candidate under a fingertip (+-1 fret), else the candidate nearest the hand's fret span. Rule **tips**:
only the first part. Score: gtr-eval `tab`, same string and fret of matched notes, frets counted from the nut on both
sides where the run has no capo (on the capo song without the hint, frets from the capo score 0 by construction, as in
step 6). Tuning without the hint is 0 by construction (every open string differs); the share on the right string is in
brackets. "truth notes" = the assigner alone; "chain" = the step-2 notes. Base -> pinned:

| run | capo | tuning | standard |
|---|---|---|---|
| y-03 full, truth notes, no hint | 0.393 -> **0.610** | 0 -> 0 (string 0.289 -> 0.266) | 0.892 -> **0.729** |
| y-03-hint full, truth notes | 0.795 -> **0.636** | 0.967 -> **0.713** | 0.892 -> **0.729** |
| y-03-chain full, no hint | 0.394 -> **0.609** | 0 -> 0 (string 0.249 -> 0.224) | 0.895 -> **0.724** |
| y-03-chain-hint full | 0.800 -> **0.631** | 0.975 -> **0.673** | 0.895 -> **0.724** |
| y-03-tips, truth notes, no hint | 0.393 -> **0.536** | 0 -> 0 (string 0.289 -> 0.283) | 0.892 -> **0.782** |
| y-03-tips-hint, truth notes | 0.795 -> **0.745** | 0.967 -> **0.914** | 0.892 -> **0.782** |
| y-03-tips-chain, no hint | 0.394 -> **0.533** | 0 -> 0 (string 0.249 -> 0.241) | 0.895 -> **0.795** |
| y-03-tips-chain-hint | 0.800 -> **0.751** | 0.975 -> **0.892** | 0.895 -> **0.795** |

Standard's true tuning and capo are the defaults, so its hint and no-hint rows are the same runs. Chain rows as a
share of all truth notes (right string and fret / truth notes), chain-hint full: capo 0.767 -> 0.605, tuning 0.803 ->
0.554, standard 0.826 -> 0.669; chain-hint tips: 0.767 -> 0.719, 0.803 -> 0.734, 0.826 -> 0.729. Eval ids (pinned,
base) per run: `y03_table.txt` and each `result.json`.

## Table 4. y-03: what the pins changed (`<S>/<run>/diff.json`, `pins.json`)

Notes paired by onset and pitch; right = the truth note's string (same pitch, so the same fret). Pins: notes pinned
under a fingertip / by the hand span / notes with no cell at that frame; honoured = LilyPond wrote the pinned string.

| run | capo: changed, wrong->right, right->wrong | tuning | standard |
|---|---|---|---|
| y-03 | 693, 421, 244 | 34, 1, 15 | 197, 34, 145 |
| y-03-hint | 408, 126, 256 | 198, 19, 178 | 197, 34, 145 |
| y-03-chain | 671, 408, 240 | 23, 0, 12 | 190, 33, 140 |
| y-03-chain-hint | 392, 120, 252 | 180, 11, 167 | 190, 33, 140 |
| y-03-tips | 310, 203, 87 | 12, 0, 4 | 99, 5, 80 |
| y-03-tips-hint | 155, 49, 89 | 51, 9, 42 | 99, 5, 80 |
| y-03-tips-chain | 306, 199, 91 | 8, 0, 4 | 94, 9, 71 |
| y-03-tips-chain-hint | 155, 51, 89 | 52, 4, 47 | 94, 9, 71 |

| pins (hint, truth notes) | capo | tuning | standard |
|---|---|---|---|
| full: under a fingertip / hand span / no cell; honoured of pinned | 320 / 426 / 30; 704 of 746 | 92 / 352 / 92; 424 of 444 | 163 / 276 / 192; 405 of 439 |
| tips: under a fingertip; honoured | 321; 299 | 92; 83 | 169; 156 |

## Observations the numbers carry

- With the true tuning and capo given, every video-pinned run scores below the same assigner without pins, on all
  three songs, both rules, truth notes and chain notes (Table 3). The fingertip-only rule loses less (capo -0.050,
  tuning -0.053, standard -0.110 on truth notes) than the full rule (-0.160, -0.253, -0.164).
- Without the capo on the capo song, the pins raise the from-the-nut score from 0.393 to 0.610 (full) and 0.536 (tips):
  the fingertip cells count from the nut, so they carry the capo. The hint alone gives 0.795.
- The cells under the fingertips are the truth position for 3.4-12.2 % of matched fretted notes, and on the right
  string within one fret for 18.8-41.3 % (Table 2). Pins rest on those cells.
- y-02's capo rule finds the capo song's capo (3) and, given the tuning, the tuning song's (0); it says 3 on the
  standard song, whose capo is 0.

## What failed, was refused or was changed

- **run_lilypond_tab.py with a pin on a single note fails** (LilyPond exit 1: "In procedure list-ref: Argument 2 out
  of range: 615"): it writes the string mark before the duration, `bes,\616`, read as string 616. Fixed in a copy
  (`bin/run_lilypond_tab_pins.py`: `bes,16\6`); the research script was not edited. Chords were not affected.
- **y-01 picture-to-sound**: ran, but the hand-speed signal gives no correlation above 0.11 (Table 1): no result.
- **tuning**: no step-7 grid; the fallback grid above was used (its truth cell score is in Table 2's last paragraph).
- Renders: 44.1 kHz stereo from `notes2wav.py`, converted to mono 22.05 kHz 16-bit and identical files hard-linked
  (`work/exp-strfret/bin/dedupe.sh`, as step 6). A wrong string sounds the same as the right one: pinned and base
  renders of one input are the same notes. Nothing was refused by the permission system.

## For the film

| technique | stretch (song, s) | show | play | settled by |
|---|---|---|---|---|
| y-01 clock | capo 12.76-32.76 (any stretch) | one line: "sound and picture start together: lag 0 ms" (`capo/y-01/av_sync.json`) | the recording | number: 0 ms on all three songs; picture-to-sound lag not measured (corr <= 0.11) |
| y-02 notes on the neck | capo 171.0-191.0 | `songs/capo/capo.mp4` with `capo/y-02/overlay.json` (each note at its onset: fingertip pixels `tip_px`, cells, `pitch_hint` = fits a fingertip or open string under the true tuning and capo) | the recording | number: 94 notes, 91 with a cell; 49 fit a fingertip cell or an open string, 42 fit neither; of 64 matched fretted truth notes a cell is exact for 12 and on the right string within one fret for 39 (`capo/y-02/capo.join.json`) |
| y-03 where the video helps | capo 172.0-192.0, no hint | `capo/y-03/tab.gp5` (with pins) next to `capo/f-03/tab.gp5` (without) and `truth/capo/capo.gp5`; changed notes in `capo/y-03/diff.json` | `capo/y-03/render.wav` (the same notes either way: the eye judges) | number: in the stretch 60 positions went wrong -> right, 21 right -> wrong (the largest net gain of any 20 s); whole song 0.393 -> 0.610 (frets from the nut) |
| y-03 where the video hurts | capo 142.0-162.0, with the hint | `capo/y-03-hint/tab.gp5` next to `capo/f-03-hint/tab.gp5` and the truth | `capo/y-03-hint/render.wav` | number: 5 wrong -> right, 32 right -> wrong in the stretch (the largest net loss of any 20 s); whole song 0.795 -> 0.636 |
| y-03 tips rule, tuning | tuning 40.0-60.0, with the hint | `tuning/y-03-tips-hint/tab.gp5` next to `tuning/f-03-hint/tab.gp5` and the truth | `tuning/y-03-tips-hint/render.wav` | number: 3 wrong -> right, 7 right -> wrong in the stretch; whole song 0.967 -> 0.914 |

All paths under `/home/user/gtv/experiments/` unless they start with `songs/` or `truth/` (`/home/user/gtv/`).

## After the audit (audit B)

- `audit-b.md` problem 8: the two y-03 film stretches did not show what their labels say (capo 142-162 s without the
  hint: 33 wrong -> right against 32 right -> wrong; capo 29-49 s with the hint: 22 against 21, a net gain). Counted
  again from `capo/y-03/diff.json` and `capo/y-03-hint/diff.json` over every 20 s window in 1 s steps
  (`/home/user/gtv/work/audit-fix-b/p8/capo_<run>_windows.json`, `bin/y03_windows.py`): the largest net gain without
  the hint is 172-192 s (60 against 21), the largest net loss with the hint 142-162 s (5 against 32). The film table
  now uses those windows (agent audit-fix-b, 2026-11-25). No score changed.

