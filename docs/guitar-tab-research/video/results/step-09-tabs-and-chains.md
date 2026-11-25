# Step 9. Tab file, drawing, playback, and finished tabs from chains of tools

Agent `exp-chains`, 2026-11-25. Experiments `o-01` to `o-04` of `../experiments.json`, and the chains `chain-1` to
`chain-6`, on the songs `capo`, `tuning`, `standard`. Every number is read from `/home/user/gtv/experiments/<S>/<exp>/`
(`scores.json`, copied into `result.json` by `result.py`; gtr-eval 0.12.1 outputs `score_*.json` beside it, eval ids in
`result.json`) or from a file named in the line. Scripts: `/home/user/gtv/work/exp-chains/bin/` (`gp5fb.py`, `chains.py`,
`h03tab.py`, `truthstring.py`, `stretch.py`, `tables.py`, `o02.sh`, `o03.sh`, `o03v.sh`, `o03_clicks.py`, `sepnotes.sh`,
`res_o234.py`, `res_extra.py`), page `pages/o03.html`. Truth: whole songs (each `scored_range` is the whole file);
chain-4 against the truth cropped to its 30 s segment (`crop_truth.py`, `work/exp-chains/tr30/`).

**How a finished tab is scored.** A chain's tab list (notes with string and fret on the recording's timeline,
`tab.json`, `notes.csv`) is written to `tab.gp5` with the song's best beat tracker (bars, tempo) and chord tool (chord
names), then read back with gtr-eval's Guitar Pro reader, moved by the file's time 0 (`gp_time_zero_s`,
`tab.gp5.readback.json`) and matched to the truth as `gtr-eval tab` matches (onset within 50 ms, same pitch). **Main
score: same string and fret, as a share of all truth notes** (`same_string_and_fret_fraction_of_truth`, `score_tab.json`).
Beside it: the tab list before the file (`score_tab_list.json`) and the file matched by note order with times ignored
(`score_tab_order.json`). Frets count from each side's capo, so a tab without the capo the player used scores 0 by
construction. `render.wav` = the GP5 as written, played by FluidSynth on the recording's timeline (mono 22.05 kHz);
`strip.NN.png` + `strip.json` + `strip.mid` = the production tab strip (alphaTab 1.9.0, scale 3).

## What ran

| exp | what | scope | wall time per song (capo / tuning / standard) |
|---|---|---|---|
| o-01 | the plan's command: research glue `tab_beats_to_gp5.py`, one song tempo (`--tempo span`); truth tab, truth beats, downbeats, chords | whole | build incl. strip and render 9.7 / 5.6 / 7.6 s |
| o-01-perbeat, o-01-c01, o-01-c01-32 (B) | `gp5fb.py` (glue copy): a tempo on every beat, integer BPM chosen with error feedback so the file's beat times stay on the tracked beats; truth beats (perbeat) or Beat This beats (c01, the chains' input); c01-32: 32nd-note grid, rests merged | whole | 5.7-8.8 s |
| o-02 | alphaTab full score (notation + tab), lazy loading off (`tools/bin/shot.cjs`, `alphatab_chains.html`), of o-01 and o-01-c01 | whole | 2.1 / 2.0 / 1.9 s |
| o-03 | alphaTab `exportAudio`, metronome only and guitar with metronome (`pages/o03.html` via `drive.mjs`), of o-01-perbeat; o-03-span (B): the same of o-01 | whole | 4.9 / 4.1 / 4.0 s |
| o-04 | FluidSynth 2.3.4 + FluidR3_GM through `notes2wav.py`: every `render.wav` of this step | whole | in the builds above |
| chain-1 to chain-6 | below | whole; chain-4 its 30 s segment | 2.4-12.2 s per build (`runtime_s`) |
| n-03-sep07, n-02-sep01 | step-1 check for the chains: the song's best separator in front of its best notes tool | whole | 134.7 / 112.5 / 117.3 s (gtr-run r1081, r1083, r1088; 2 cores) |
| o-05 | MuseScore (C) | not run | - |

## Step 9 techniques

**o-01: the truth's own tab written to GP5 and read back. Same string and fret of all truth notes, 50 ms on the recording's timeline (order-matched in brackets); share of notes over 50 ms off the grid**

| | capo | tuning | standard |
|---|---|---|---|
| o-01 | 0.443 (1.000); - | 0.068 (0.981); - | 0.381 (1.000); - |
| o-01-perbeat | 0.990 (1.000); 0.010 | 0.670 (0.981); 0.325 | 0.951 (1.000); 0.049 |
| o-01-c01 | 0.985 (1.000); 0.017 | 0.726 (0.965); 0.268 | 0.963 (1.000); 0.035 |
| o-01-c01-32 | 0.996 (1.000); 0.000 | 0.944 (0.987); 0.052 | 0.997 (1.000); 0.002 |

The plan's command writes every truth note with its string and fret. Matched by note order: 1.000 / 0.981 / 1.000 (on
tuning 616 of 628: one tempo puts notes played apart into one beat, which the order match sorts by pitch). One song tempo
cannot follow a player: read back on the recording, 0.443 / 0.068 / 0.381 of the truth's own notes are within 50 ms. A
tempo on every beat, chosen with error feedback, gives 0.990 / 0.670 / 0.951 on the truth's beats and 0.985 / 0.726 /
0.963 on Beat This's; the 16th-note grid then leaves 1.7 % / 26.8 % / 3.5 % of notes more than 50 ms from their
place (the tuning song's tab has no rhythm and is played freely). On a 32nd grid with rests merged (o-01-c01-32):
0.996 / 0.944 / 0.997, with 0 % / 5.25 % / 0.15 % over 50 ms. The merge changes durations only (same scores as the
unmerged 32nd file, `work/exp-chains/o01test/*.c01.div8*`); unmerged, every empty 32nd is drawn as a rest. The file's own
beat times against the truth beats, F: 0.552 / 0.052 / 0.429 for o-01, 1.000 / 0.995 / 0.996 for o-01-perbeat.

**o-02 alphaTab drawing.** Both files of each song rendered completely (`postRenderFinished`): 72 / 50 / 57 master
bars (o-01; 73 / 55 / 57 for o-01-c01), page height at 1240 px width 8244 / 5141 / 5671 px, 2.1 / 2.0 / 1.9 s. Chord
names are drawn with empty diagrams (the GP5 has no fingerings); a file with a tempo on every beat shows a tempo mark
over most beats (`capo/o-02/capo.o-01-c01.png`). Bar 72 of 72 checked by eye on `capo/o-02/capo.o-01.png`.

**o-03 alphaTab playback with metronome** (offline `exportAudio`; clicks = onsets in the metronome-only render + the
file's time 0; `o-03/scores.json`, `o-03-span/scores.json`)

| | capo | tuning | standard |
|---|---|---|---|
| tempo on every beat (o-01-perbeat): click minus the file's own beat time, median / largest | +50.6 / 109.3 ms | +26.8 / 44.1 ms | +12.7 / 112.9 ms |
| the same file: clicks against the truth beats, F (70 ms) | 0.753 | 0.995 | 0.857 |
| one song tempo (o-01, o-03-span): click minus the file's own beat time, median / largest | +1.2 / 2.6 ms | +1.2 / 2.6 ms | +0.3 / 0.8 ms |
| the same file: clicks against the truth beats, F | 0.563 | 0.052 | 0.433 |

alphaTab plays a one-tempo file on its own beat grid within 2.6 ms; with a tempo change at most beats its clicks fall up
to 113 ms off the file's beat times. The research's real-time part of chain E (playing in an AudioContext) was not run.
alphaTab's export samples exceed full scale: 11.7-13.7 % of samples are clipped in the 16-bit files (`clicks.log`).

**o-04 FluidSynth.** Every `render.wav` of this step (chains, o-01*) is the GP5 as written, played from the file by
`notes2wav.py` and moved by the file's time 0. First-onset check on o-01-perbeat: +7.7 / +17.6 / +58.5 ms
(`work/exp-chains/logs/first_onset_<S>.log`); standard's first note (0.448 s, 50 ms before the first beat) is written
on that beat (0.498 s), so the check (20 ms) fails there because of the 16th grid, not the renderer.

## The chains: which technique at which step, and why

| step | capo | tuning | standard | why (score in the step record) |
|---|---|---|---|---|
| 1 separation | none | sep-01 htdemucs_6s guitar stem | none | step 1 ranked with Basic Pitch; re-checked with each song's notes tool: on the separated sound 0.914 / 0.833 / 0.876 against 0.920 / 0.830 / 0.892 on the mix (`n-03-sep07`, `n-02-sep01`) |
| 2 notes | n-03 guitar-fl | n-02 guitar-gaps | n-03 guitar-fl | onset F1 0.920 / 0.830 / 0.892 (step-02) |
| 4 beats, bars, tempo | c-01 Beat This | c-01 | c-01 | best beat F of the blind trackers, 0.998 / 0.050 / 0.989 (step-04; tuning: every tracker about 0.2 s after the key, `truth-doubts.md`) |
| 4 chord names | c-02 madmom CNN | c-02 | c-04 lv-chordia | majmin 0.710 / 0.680 / 0.864 (step-04) |
| 5 tuning, capo: chain-1 | t-02: D#2 A2 D3 G3 B3 E4, capo 0 | t-02: Drop D, capo 0 | t-02: standard, capo 0 | the only blind sound-only technique with one repeatable answer for both; t-03's three tries disagreed on every song (capo song: capo 3, none, capo 1) (step-05) |
| 5 tuning, capo: chain-3 | t-07 Opus 5.5 on frames: standard, capo 3 | t-02 (t-07 said standard: 0 of 6 strings right) | standard, capo 0 (t-02 and t-07 agree) | the best blind answer that hears or sees (step-05) |
| 6 string, fret | f-03 LilyPond | f-01 tuttut | f-01 tuttut | step-2 notes, true tuning, share of all truth notes: 0.767 vs 0.762; tie at 0.803, tuttut matched more without the hint (494 vs 482); 0.829 vs 0.826 (step-06) |
| 8 sound + video (chain-3) | y-03 rule tips | tips | tips | with the tuning known, tips 0.751 / 0.892 / 0.795 against full 0.631 / 0.673 / 0.724 (step-08) |
| 9 the file | `gp5fb.py`: tempo on every beat, 32nds, rests merged | same | same | o-01-c01-32: 0.996 / 0.944 / 0.997 (above) |
| 10 one hosted call (chain-4) | h-03 MiMo v2.6 Flash | same | same | the only step-10 service that returned a tab (h-01 stopped at a rights box, h-02 at a human check; step-10) |

chain-2 = chain-1's notes with the true tuning and capo given to the chooser (the hint run; no step-9 tool takes a hint). chain-5 = the truth's notes into the
row-6 chooser with the true tuning and capo (step 6's f-03-hint / f-01-hint). chain-6 = chain-2's tab with every note
that matches a truth note (50 ms, same pitch) given the truth's string and fret (`truthstring.json`). Steps 3 (voices,
taps) and 7 (hands) are not separate links: the file holds one voice and no taps, and step 7's cells enter chain-3
through y-03. standard: chain-1 = chain-2 (t-02 named the true tuning and capo).

## Scores of the six chains (rows: chains; chain-4 on its 30 s segment)

**Main: same string and fret, share of all truth notes: the finished tab (GP5 read back, 50 ms); the tab list before the file in brackets**

| | capo | tuning | standard |
|---|---|---|---|
| chain-1 | 0.000 (0.000) | 0.081 (0.102) | 0.822 (0.829) |
| chain-2 | 0.753 (0.767) | 0.715 (0.801) | 0.822 (0.829) |
| chain-3 | 0.712 (0.719) | 0.081 (0.102) | 0.719 (0.729) |
| chain-4 | 0.010 (0.010) | 0.000 (0.000) | 0.016 (0.016) |
| chain-5 | 0.791 (0.795) | 0.914 (0.967) | 0.890 (0.892) |
| chain-6 | 0.940 (0.958) | 0.732 (0.822) | 0.918 (0.928) |

**Same string and fret of the matched notes (GP5); frets counted from the nut in brackets; truth notes matched at all after the slash**

| | capo | tuning | standard |
|---|---|---|---|
| chain-1 | 0.000 (0.390) / 0.940 | 0.111 (0.111) / 0.729 | 0.896 (0.896) / 0.918 |
| chain-2 | 0.802 (0.802) / 0.940 | 0.970 (0.970) / 0.737 | 0.896 (0.896) / 0.918 |
| chain-3 | 0.758 (0.758) / 0.939 | 0.110 (0.110) / 0.736 | 0.795 (0.795) / 0.904 |
| chain-4 | 1.000 (1.000) / 0.010 | 0.000 (0.000) / 0.038 | 1.000 (1.000) / 0.016 |
| chain-5 | 0.794 (0.794) / 0.996 | 0.968 (0.968) / 0.944 | 0.892 (0.892) / 0.997 |
| chain-6 | 1.000 (1.000) / 0.940 | 0.994 (0.994) / 0.737 | 1.000 (1.000) / 0.918 |

**The file's notes onset F1 (50 ms, 50 cents) / beats F / downbeats F (70 ms) / chord names majmin share of time**

| | capo | tuning | standard |
|---|---|---|---|
| chain-1 | 0.902 / 0.995 / 0.986 / 0.716 | 0.745 / 0.059 / 0.154 / 0.657 | 0.882 / 0.984 / 0.973 / 0.863 |
| chain-2 | 0.903 / 0.995 / 0.986 / 0.716 | 0.750 / 0.059 / 0.154 / 0.657 | 0.882 / 0.984 / 0.973 / 0.863 |
| chain-3 | 0.902 / 0.995 / 0.986 / 0.716 | 0.749 / 0.059 / 0.154 / 0.657 | 0.875 / 0.984 / 0.973 / 0.863 |
| chain-4 | 0.011 / 0.195 / 0.095 / 0.281 | 0.052 / 0.000 / 0.000 / 0.639 | 0.021 / 0.229 / 0.074 / 0.530 |
| chain-5 | 0.996 / 1.000 / 0.993 / 0.706 | 0.945 / 0.059 / 0.154 / 0.657 | 0.997 / 0.984 / 0.973 / 0.863 |
| chain-6 | 0.904 / 0.995 / 0.986 / 0.716 | 0.749 / 0.059 / 0.154 / 0.657 | 0.882 / 0.984 / 0.973 / 0.863 |

## Which step loses the most

**Loss per step: 1 - score, or the drop between two chains (tab list / finished tab)**

| step | capo | tuning | standard |
|---|---|---|---|
| tuning and capo from t-02 instead of the truth (chain-2 minus chain-1) | 0.767 / 0.753 | 0.699 / 0.634 | 0.000 / 0.000 |
| notes from the best tool, all else true (1 minus chain-6) | 0.042 / 0.060 | 0.178 / 0.268 | 0.072 / 0.082 |
| string and fret from the best chooser, all else true (1 minus chain-5) | 0.205 / 0.209 | 0.033 / 0.086 | 0.108 / 0.110 |
| video string pins added (chain-2 minus chain-3; tuning: chain-1 minus chain-3, both Drop D) | 0.048 / 0.042 | 0.000 / 0.000 | 0.100 / 0.103 |
| writing the file, truth tab in (1 minus o-01-c01-32; plan writer o-01 in brackets) | 0 / 0.004 (0.557) | 0 / 0.056 (0.932) | 0 / 0.003 (0.619) |

Read with the tables: where the blind tuning and capo answer is wrong, it decides the score (capo: t-02 left out the
capo, chain-1 0.000; tuning: t-02 said Drop D, 0.081). With the true tuning and capo, the string and fret choice loses
most on capo (0.209) and standard (0.110), the note step most on tuning (0.178 in the list, 0.268 in the file; the
truth's own notes lose 0.056 to the same file writer, o-01-c01-32). The video
pins lower the score on capo (-0.042) and standard (-0.103) and leave tuning's at 0.081. The one-call service
(chain-4) matches 1 of 102, 4 of 106 and 2 of 125 truth notes in its 30 s.

## The six chains against the truth, per song

**capo: the six chains against the truth (815 truth notes; chain-4: 102 in its 30 s)**

| chain | main (list, order) | right / wrong position / missed / invented (file, 50 ms) | tuning (MIDI), capo in the file | tuning, capo right |
|---|---|---|---|---|
| chain-1 | 0.000 (0.000, 0.000) | 0 / 766 / 49 / 117 | 39,45,50,55,59,64, 0 | no, no |
| chain-2 | 0.753 (0.767, 0.767) | 614 / 152 / 49 / 116 | 40,45,50,55,59,64, 3 | yes, yes |
| chain-3 | 0.712 (0.719, 0.721) | 580 / 185 / 50 / 116 | 40,45,50,55,59,64, 3 | yes, yes |
| chain-4 | 0.010 (0.010, 0.098) | 1 / 0 / 101 / 72 | 40,45,50,55,59,64, 3 | yes, yes |
| chain-5 | 0.791 (0.795, 0.795) | 645 / 167 / 3 / 3 | 40,45,50,55,59,64, 3 | yes, yes |
| chain-6 | 0.940 (0.958, 0.955) | 766 / 0 / 49 / 113 | 40,45,50,55,59,64, 3 | yes, yes |

**tuning: the six chains against the truth (628 truth notes; chain-4: 106 in its 30 s)**

| chain | main (list, order) | right / wrong position / missed / invented (file, 50 ms) | tuning (MIDI), capo in the file | tuning, capo right |
|---|---|---|---|---|
| chain-1 | 0.081 (0.102, 0.105) | 51 / 407 / 170 / 144 | 38,45,50,55,59,64, 0 | no, yes |
| chain-2 | 0.715 (0.801, 0.838) | 449 / 14 / 165 / 144 | 38,43,48,53,57,60, 0 | yes, yes |
| chain-3 | 0.081 (0.102, 0.105) | 51 / 411 / 166 / 144 | 38,45,50,55,59,64, 0 | no, yes |
| chain-4 | 0.000 (0.000, 0.000) | 0 / 4 / 102 / 44 | 40,45,50,55,59,64, 0 | no, yes |
| chain-5 | 0.914 (0.967, 0.955) | 574 / 19 / 35 / 34 | 38,43,48,53,57,60, 0 | yes, yes |
| chain-6 | 0.732 (0.822, 0.861) | 460 / 3 / 165 / 145 | 38,43,48,53,57,60, 0 | yes, yes |

**standard: the six chains against the truth (679 truth notes; chain-4: 125 in its 30 s)**

| chain | main (list, order) | right / wrong position / missed / invented (file, 50 ms) | tuning (MIDI), capo in the file | tuning, capo right |
|---|---|---|---|---|
| chain-1 | 0.822 (0.829, 0.841) | 558 / 65 / 56 / 111 | 40,45,50,55,59,64, 0 | yes, yes |
| chain-2 | 0.822 (0.829, 0.841) | 558 / 65 / 56 / 111 | 40,45,50,55,59,64, 0 | yes, yes |
| chain-3 | 0.719 (0.729, 0.741) | 488 / 126 / 65 / 111 | 40,45,50,55,59,64, 0 | yes, yes |
| chain-4 | 0.016 (0.016, 0.296) | 2 / 0 / 123 / 64 | 40,45,50,55,59,64, 0 | yes, yes |
| chain-5 | 0.890 (0.892, 0.892) | 604 / 73 / 2 / 2 | 40,45,50,55,59,64, 0 | yes, yes |
| chain-6 | 0.918 (0.928, 0.938) | 623 / 0 / 56 / 111 | 40,45,50,55,59,64, 0 | yes, yes |

## What failed, was changed, or was not run

- **The glue's chord placement** raised `KeyError: 288` when a chord change fell on the grid point that closes the last
  bar (capo and tuning o-01-c01, first build); `gp5fb.py` moves such a change to the last step of the last bar.
- **Grid.** The chains were first built on 16ths (tuning on the mix notes); after o-01-c01-32 scored best they were
  rebuilt on 32nds with rests merged. First-build scores: `<S>/chain-N/scores_div16.json` (its files were replaced);
  chain-2 then: 0.756 / 0.640 / 0.813.
- **o-03**: `exportAudio` only (offline). Clipped samples in the 16-bit renders (above). The o-03-span guitar renders
  were deleted for disk; its metronome renders are kept.
- **chain-4** (h-03 run 2): the pitch returned disagrees with its string and fret for 73 of 73 / 0 of 49 / 0 of 66 notes
  (`chain-4/h03tab.json`; scored as string and fret, as returned). No beat times came back: the file uses its own grid at
  85 / 50 / 132 BPM, 4/4, from the segment start. It said capo 3 / 0 / 0, standard tuning on all three.
- **chain-3 on tuning** looks fingertips up on step 8's fallback fret grid, which uses the answer key's fret count
  (`step-08-sound-and-video.md`), so that row is not tool-only.
- **tuning, step 1**: the separated stem won by 0.003 onset F1 (0.833 vs 0.830) but found fewer truth notes (recall
  0.822 vs 0.823); chain-2's tab list from it scores 0.801, against 0.803 for the same chooser on the mix notes
  (step 6's f-01-chain-hint).
- Not run: o-05 (C). Nothing was refused by the permission system. No helper agent was started: no experiment of this
  step has a model look at pictures. Renders are mono 22.05 kHz (disk); free disk 2.9 GB at the end.
- Answer keys: nothing found wrong. One note on the tuning song's beat phase: `work/exp-chains/TRUTH-DOUBTS.md`.

## For the film

Paths under `/home/user/gtv/experiments/`. Every file named `render.wav` is on the recording's timeline (play the same
seconds of `songs/<S>/<S>.wav` beside it); `strip.NN.png` with `strip.json` (the x of every beat, in the file's own
time = recording time minus `gp_time_zero_s`) draws the same tab. The truth's own tab drawn and played the same way:
`<S>/o-01-c01-32/strip.*` and `render.wav`. Windows and counts: `stretch*.json` in each folder (truth notes in the window
right / on another string or fret / missed; tool notes invented).

- **o-01, the file writer.** capo 206-226 s. The plan's one-tempo file has 1 of 67 truth notes within 50 ms there, the
  tempo-on-every-beat 32nd file 65 (`capo/o-01/stretch_worst.json`, `capo/o-01-c01-32/stretch_at206.json`). Show
  `capo/o-01/strip.*` against `capo/o-01-c01-32/strip.*` (same notes, same frets); play both `render.wav` over the
  recording. Settled by the truth; the drift is also heard.
- **o-02, alphaTab's drawing.** `capo/o-02/capo.o-01-c01.png`, top 560 px (bars 1-4): chord names over empty diagrams,
  a tempo mark over most beats; `capo.o-01.png` has one. For the eye; no number.
- **o-03, alphaTab's playback.** capo 39-59 s: the per-beat file's clicks are 106.1 ms from the truth beats on average
  there (49.1 ms median over the song) (`capo/o-03/film_window.json`); a one-tempo file's clicks sit within 2.6 ms of
  its own beats (`capo/o-03-span/scores.json`). Play `capo/o-03/capo_guitar_and_metronome.wav` (file time; starts at
  0.3455 s of the recording). Settled by the truth; also heard.
- **o-04, FluidSynth.** Every `render.wav`; the plainest: `capo/chain-2/render.wav` 79-99 s against the recording. For the ear.
- **chain-1.** capo 79-99 s: 0 of 77 truth notes right, 71 on another position (no capo; t-02's 6th string D#2), 6
  missed, 11 invented (`capo/chain-1/stretch_at79.json`). Its notes are nearly chain-2's (onset F1 0.902 vs
  0.903) and sound at the same pitches, so its `render.wav` is for the ear to compare with chain-2's; the frets are
  for the eye, settled by the truth (0.000; from the nut 0.390 of matched notes).
- **chain-2.** capo 79-99 s: 44 right, 27 on another string or fret, 6 missed, 11 invented
  (`capo/chain-2/stretch_at79.json`); show it under the truth's strip (`capo/o-01-c01-32/strip.*`). Settled by the truth.
- **chain-3.** capo 88-108 s: against chain-2 the video pins move 10 truth notes onto their position and 9 off it
  (whole song 51 and 85; standard 9 and 79) (`capo/chain-3/pindiff_chain-2.json`, `standard/chain-3/pindiff_chain-2.json`).
  Show both strips with step 7's hand overlay. Settled by the truth.
- **chain-4.** tuning 26-46 s: 3 of 74 truth notes found, all 3 on another string or fret, 28 notes invented; the file
  says standard tuning, capo 0 (`tuning/chain-4/stretch.json`, `h03tab.json`). Play its `render.wav` over the recording. Settled by the truth; heard.
- **chain-5.** capo 95-115 s: the truth's own notes, 36 placed right and 36 on another string or fret
  (`capo/chain-5/stretch.json`). Played, a pitch on another string sounds the same: for the eye; the count is settled by the truth.
- **chain-6.** tuning 96-116 s: all 50 notes found sit on the truth's string and fret; 24 truth notes missed, 28 notes
  invented (`tuning/chain-6/stretch.json`). Settled by the truth; the gaps are heard.

## After the audit (audit B)

- Agent audit-fix-b, 2026-11-25. Problem 9: the o-01 sentence now says what its brackets measure (the GP5s hold every
  truth note with its string and fret; tuning's 12 order misses sit in beats holding notes played apart: `work/audit-fix-b/p9/`).
  Problem 5: chain-4 was rebuilt from h-03's blind run 2 (step 10); run 1's build is in `<S>/chain-4/run1-slotname/`.
