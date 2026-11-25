# The blind test, scored: Opus 5.5 writes each tab from the video, with the kit and without tools

Agent `blind-scorer`, 2026-11-25. Scores the six attempts of [BLIND.md](BLIND.md) and sets them beside the six chains of
[step 9](results/step-09-tabs-and-chains.md). Blind ids (`/home/user/gtv/truth/blind-map.json`, read only to score):
**b1 = standard, b2 = tuning, b3 = capo**. Arms: the kit arm (folder `tools`) and the bare arm (`bare`). Every number is in
`/home/user/gtv/blind/results.json`, read from the gtr-eval 0.12.1 outputs in `/home/user/gtv/blind/<id>/<arm>/score/`
(eval ids e3226-e3360) or from a file named in the line. Scripts: `/home/user/gtv/work/blind-scorer/bin/` (`score_one.sh`,
`build_scores.py`, `extra.py`, `seg30.sh`, `seg30_collect.py`, `film_one.py`, `film_diff.py`, `film_collect.py`,
`align_tiles.py`); log of the work: `/home/user/gtv/work/blind-scorer/PROGRESS.md`.

## How the answers were scored

- **The protocol** (`tools/blind-admin/score_blind.sh`, BLIND.md section 4): `answer.json` checked by `validate_answer.py`
  and scored for tab, notes, beats, chords, tempo, key and tuning (`score/summary.json`).
- **The chains' commands.** The same seven gtr-eval calls step 9 ran on every chain (`work/exp-chains/bin/chains.py`), on
  the handed-in `answer.gp5` read back and moved by its time 0 (`answer.gp5.readback.json`): `score/score.sh` writes
  `score_tab.json` (main), `score_tab_order`, `score_tab_list` (on `answer.json`), `score_notes`, `score_beats` (the file's
  beats), `score_chords` (the file's chord names), `score_tuning`. Each `answer.gp5` came from the kit's `answer2gp5.py`,
  whose `lib/gp5fb.py` is the chains' writer (the code is identical; only comments differ), with the chains' setting (a
  tempo on every beat, 32nds, rests merged). Re-run on each `answer.json`, it gave the same bytes (6 of 6).
- **Main number**, as in step 9: same string and fret, as a share of all truth notes, in the finished GP5 (onset within
  50 ms and the same pitch; frets counted from each side's capo). The tab list (`answer.json`) is in brackets. Whole songs;
  chain-4 covers only its 30 s.
- The readings of [truth-doubts.md](results/truth-doubts.md) apply. The tuning song's beats are also scored after moving
  them by their median offset. Cents differences under 3 on the standard song are not graded. Chords are compared as
  majmin, so sevenths do not count.

## The six attempts: handed in, time used

| song (id) | arm | `answer.json` valid (also with the video's times) | `answer.gp5` = writer's output | HOW.md | notes (in the GP5) | minutes: START to last write of `answer.json` (to last hand-in file) |
|---|---|---|---|---|---|---|
| standard (b1) | kit | yes (yes) | yes | yes | 705 (705) | 28.1 (28.2) |
| standard (b1) | bare | yes (yes) | yes | yes | 1024 (1014) | 36.3 (38.0) |
| tuning (b2) | kit | yes (yes) | yes | yes | 624 (624) | 25.7 (32.5) |
| tuning (b2) | bare | yes (yes) | yes | yes | 591 (586) | 39.0 (39.4) |
| capo (b3) | kit | yes (yes) | yes | yes | 941 (940) | 34.2 (34.7) |
| capo (b3) | bare | yes (yes) | yes | yes | 1022 (1022) | 39.5 (39.5) |

All six finished well inside the 90-minute cap. The kit arm took 25.7-34.2 minutes and the bare arm 36.3-39.5. The writer
drops a note when two land on one string at one grid step (10, 5 and 1 notes: `notes_dropped_same_string_same_16th`).
None was restarted: one transcript per attempt ([results/audit-blind.md](results/audit-blind.md) section 1).

## Per song: both arms, the six chains and the key

Columns: the answer's tuning and capo; whether they equal the key's; the main number (GP5, with the list in brackets);
same string and fret as a share of the matched notes, and the share of truth notes matched at all; the counts behind them
(truth notes right / matched but on another string or fret / missed; answer notes matching no truth note); the file's
note onset F1 (50 ms, 50 cents); the file's beat F and downbeat F (70 ms); chord names, majmin share of time. The key row
is its own tab run through the same writer (step 9's o-01-c01-32), the ceiling this writer allows.

**standard (b1), 679 truth notes**

| | tuning, capo | equal | main | of matched / matched | right / wrong / missed / invented | note F1 | beat F / downbeat F | majmin |
|---|---|---|---|---|---|---|---|---|
| **kit arm** | standard, 0 | yes, yes | **0.828** (0.835) | 0.902 / 0.918 | 562 / 61 / 56 / 82 | 0.900 | 0.987 / 0.973 | 0.919 |
| **bare arm** | standard, 0 | yes, yes | **0.694** (0.705) | 0.911 / 0.761 | 471 / 46 / 162 / 497 | 0.611 | 0.973 / 0.956 | 0.802 |
| chain-1 (= chain-2) | standard, 0 | yes, yes | 0.822 (0.829) | 0.896 / 0.918 | 558 / 65 / 56 / 111 | 0.882 | 0.984 / 0.973 | 0.863 |
| chain-3 | standard, 0 | yes, yes | 0.719 (0.729) | 0.795 / 0.904 | 488 / 126 / 65 / 111 | 0.875 | 0.984 / 0.973 | 0.863 |
| chain-4 (30 s) | standard, 0 | yes, yes | 0.016 (0.016) | 1.000 / 0.016 | 2 / 0 / 123 / 64 | 0.021 | 0.229 / 0.074 | 0.530 |
| chain-5 | standard, 0 | yes, yes | 0.890 (0.892) | 0.892 / 0.997 | 604 / 73 / 2 / 2 | 0.997 | 0.984 / 0.973 | 0.863 |
| chain-6 | standard, 0 | yes, yes | 0.918 (0.928) | 1.000 / 0.918 | 623 / 0 / 56 / 111 | 0.882 | 0.984 / 0.973 | 0.863 |
| key through the writer | standard, 0 | - | 0.997 (1.000) | 1.000 / 0.997 | 677 / 0 / 2 / 2 | 0.997 | - | - |

- Both arms: standard tuning, capo 0, key C major, and a tempo within 4 % (76.0 and 76.12 against 76.14). Cents: +3 and
  +2, which is 3 and 4 below the key's +6. Independent measurements put this guitar at +3.7 to +4.9 (truth-doubts.md),
  so the key's own figure is uncertain by about 2 cents.
- Kit arm: 61 notes on another string (43 that the key plays on string 3, 12 on string 2, 6 on string 4) and none on
  the right string at the wrong fret. 56 missed and 82 invented (precision 0.884, recall 0.918). Its tab is 0.006 above
  chain-1, which ran tools from the same kit as a fixed chain, and it invented 29 fewer notes.
- Bare arm: it found fewer notes and invented many more (recall 0.761, precision 0.510: 497 of its 1014 written notes
  match no truth note, and 162 truth notes are missed). Of the notes it did find, 0.911 sit on the key's string and fret,
  slightly more than the kit arm's 0.902. 46 are on another string (34 that the key plays on string 2).

**tuning (b2), 628 truth notes; key tuning D2 G2 C3 F3 A3 C4**

| | tuning, capo | equal | main | of matched / matched | right / wrong / missed / invented | note F1 | beat F / downbeat F (moved: beat F) | majmin |
|---|---|---|---|---|---|---|---|---|
| **kit arm** | D2 G2 C3 F3 A3 **D4**, 0 | no, yes | **0.562** (0.634) | 0.778 / 0.723 | 353 / 101 / 174 / 170 | 0.725 | 0.005 / 0.020 (-0.189 s: 0.892) | 0.664 |
| **bare arm** | D2 G2 **D3 G3 C4 D4**, 0 | no, yes | **0.159** (0.169) | 0.244 / 0.653 | 100 / 310 / 218 / 176 | 0.675 | 0.240 / 0.949 (-0.193 s: 0.716) | 0.351 |
| chain-1 | D2 A2 D3 G3 B3 E4 (Drop D), 0 | no, yes | 0.081 (0.102) | 0.111 / 0.729 | 51 / 407 / 170 / 144 | 0.745 | 0.059 / 0.154 | 0.657 |
| chain-2 | D2 G2 C3 F3 A3 C4, 0 | yes, yes | 0.715 (0.801) | 0.970 / 0.737 | 449 / 14 / 165 / 144 | 0.750 | 0.059 / 0.154 (-0.193 s: 0.837) | 0.657 |
| chain-3 | D2 A2 D3 G3 B3 E4 (Drop D), 0 | no, yes | 0.081 (0.102) | 0.110 / 0.736 | 51 / 411 / 166 / 144 | 0.749 | 0.059 / 0.154 | 0.657 |
| chain-4 (30 s) | standard, 0 | no, yes | 0.000 (0.000) | 0.000 / 0.038 | 0 / 4 / 102 / 44 | 0.052 | 0.000 / 0.000 | 0.639 |
| chain-5 | D2 G2 C3 F3 A3 C4, 0 | yes, yes | 0.914 (0.967) | 0.968 / 0.944 | 574 / 19 / 35 / 34 | 0.945 | 0.059 / 0.154 | 0.657 |
| chain-6 | D2 G2 C3 F3 A3 C4, 0 | yes, yes | 0.732 (0.822) | 0.994 / 0.737 | 460 / 3 / 165 / 145 | 0.749 | 0.059 / 0.154 | 0.657 |
| key through the writer | D2 G2 C3 F3 A3 C4, 0 | - | 0.944 (1.000) | 1.000 / 0.944 | 593 / 0 / 35 / 35 | 0.944 | - | - |

- Kit arm: five strings right and the 1st string a whole step high (D4 for C4). Capo 0, cents (-10 against -9), key
  D minor and tempo (65.93 against 65.73) are right. All 101 of its wrong-position notes are notes the key plays on the
  1st string: 90 were moved to string 2 and 11 sit on string 1 two frets lower. Writing the file cost 0.072 (list 0.634,
  GP5 0.562): 10.3 % of its notes land more than 50 ms off the 32nd grid, because the piece has no steady pulse. The
  key's own tab loses 0.056 the same way.
- Bare arm: strings 6 and 5 right, strings 4 to 1 two or three semitones high. All 310 of its wrong-position notes are on
  the key's strings 1-4 (239 on another string, 71 on the right string at another fret). It also had more misses
  (218) and fewer matches (note F1 0.675 against 0.725).
- Beats: where the key puts the beat on this song is a matter of judgement (truth-doubts.md). The bare arm put its bar
  lines on the bass of each opening roll, as the key does (downbeats a median +0.014 s from the key's, downbeat F 0.949),
  and its other beats a median 0.208 s later. The kit arm followed the trackers: downbeats +0.146 s, other beats +0.198 s
  (the chains: +0.144 / +0.206). Its HOW.md says that if bar starts sit on the bass note, its downbeats are about 150 ms
  late. Moved by its median offset, each beat grid scores 0.892 (kit), 0.716 (bare), 0.837 (chains).
- Against the chains: the kit arm's 0.562 sits between the blind chains (0.081: the lowest-note rule said Drop D) and
  chain-2 (0.715, which was given the key's tuning). Earlier in the research, Opus 5.5 looking at frames alone (t-07)
  named standard tuning here, 0 of 6 strings right (`results/step-05-tuning-capo.md`). In this attempt, with the kit and
  its own looking and listening, it named 5 of 6.

**capo (b3), 815 truth notes**

| | tuning, capo | equal | main | of matched / matched | right / wrong / missed / invented | note F1 | beat F / downbeat F | majmin |
|---|---|---|---|---|---|---|---|---|
| **kit arm** | standard, 3 | yes, yes | **0.907** (0.937) | 0.958 / 0.946 | 739 / 32 / 44 / 169 | 0.879 | 0.998 / 0.993 | 0.704 |
| **bare arm** | standard, 3 | yes, yes | **0.805** (0.823) | 0.929 / 0.866 | 656 / 50 / 109 / 316 | 0.769 | 0.993 / 0.986 | 0.720 |
| chain-1 | D#2 A2 D3 G3 B3 E4, 0 | no, no | 0.000 (0.000) | 0.000 / 0.940 | 0 / 766 / 49 / 117 | 0.902 | 0.995 / 0.986 | 0.716 |
| chain-2 | standard, 3 | yes, yes | 0.753 (0.767) | 0.802 / 0.940 | 614 / 152 / 49 / 116 | 0.903 | 0.995 / 0.986 | 0.716 |
| chain-3 | standard, 3 | yes, yes | 0.712 (0.719) | 0.758 / 0.939 | 580 / 185 / 50 / 116 | 0.902 | 0.995 / 0.986 | 0.716 |
| chain-4 (30 s) | standard, 3 | yes, yes | 0.010 (0.010) | 1.000 / 0.010 | 1 / 0 / 101 / 72 | 0.011 | 0.195 / 0.095 | 0.281 |
| chain-5 | standard, 3 | yes, yes | 0.791 (0.795) | 0.794 / 0.996 | 645 / 167 / 3 / 3 | 0.996 | 1.000 / 0.993 | 0.706 |
| chain-6 | standard, 3 | yes, yes | 0.940 (0.958) | 1.000 / 0.940 | 766 / 0 / 49 / 113 | 0.904 | 0.995 / 0.986 | 0.716 |
| key through the writer | standard, 3 | - | 0.996 (1.000) | 1.000 / 0.996 | 812 / 0 / 3 / 3 | 0.996 | - | - |

- Both arms: capo 3, standard tuning, key B-flat major, tempo 76.9 and 76.92 against 76.56, cents +3 and +1 against +2.
- Kit arm: 0.907 is above every chain except chain-6 (0.940, which was given the key's string and fret for every matched
  note). That includes chain-5 (0.791, the key's own notes through the best string chooser). 0.958 of its matched notes
  sit right, against the chooser's 0.794. Its own string chooser (tuttut) had put every note in first position; the
  attempt then read the hand from frames every 1-2 s and moved notes where it saw the hand elsewhere: the tapping
  passages, a fill at frets 10-12 counted from the nut, and a verse box at frets 5-8. 32 notes on another string (24
  that the key plays on string 2), 44 missed, 169 invented (precision 0.820, recall 0.946). Writing the file cost 0.031:
  26 truth notes the list matched are lost in the GP5, spread over the song.
- Bare arm: 0.805, also above chain-2 (0.753) and chain-5. 0.929 of its matched notes sit right, using its own video
  prior (a capo and skin tracker and a tapping detector). Recall 0.866, precision 0.691 (316 invented), 109 missed.

**Across the three songs.** The kit arm beat the bare arm on every song's main number: by 0.134 (standard), 0.403
(tuning) and 0.102 (capo). The gap comes from finding the notes (note F1 0.900 / 0.725 / 0.879 against 0.611 / 0.675 /
0.769, with far fewer invented notes) and, on the tuning song, from the tuning (5 of 6 strings against 2 of 6). Once
a note was found, both arms put it on the right string and fret about equally often (of matched: 0.902 / 0.778 / 0.958
against 0.911 / 0.244 / 0.929). Both arms named capo, key and tempo right on all three songs. Neither found the tuning
song's tuning in full. Chords (majmin): 0.919 / 0.664 / 0.704 (kit) against 0.802 / 0.351 / 0.720 (bare), with the chains
at 0.863 / 0.657 / 0.716.

## The film's 30 s segment (RESULTS.md's segments; chain-4 was scored on these)

| song, segment | truth notes | kit: handed-in GP5 (right / wrong / missed / invented) | kit: crop route | bare: handed-in GP5 | bare: crop route | chain-4 |
|---|---|---|---|---|---|---|
| standard 0-30 s | 125 | 0.952 (119 / 6 / 0 / 3) | 0.944 | 0.888 (111 / 4 / 10 / 20) | 0.888 | 0.016 |
| tuning 25-55 s | 106 | 0.566 (60 / 19 / 27 / 31) | 0.566 | 0.160 (17 / 57 / 32 / 36) | 0.160 | 0.000 |
| capo 12.76-42.76 s | 102 | 0.951 (97 / 0 / 5 / 19) | 0.922 | 0.863 (88 / 7 / 7 / 51) | 0.853 | 0.010 |

"Handed-in GP5" = the whole-song match of `answer.gp5` (`film/labels.json`), counted over the truth notes inside the
segment. "Crop route" = BLIND.md's way: `crop_truth.py` applied to `answer.json`, written again with `answer2gp5.py`,
then the chain commands run against the segment truth chain-4 was scored on (`score/seg30/`, eval ids e3319-e3360).
Writing a cut-out segment again changes its grid, which costs up to 3 notes (capo, kit arm).

## What each attempt did (from its HOW.md; each said it did not recognise the piece)

- **standard, kit**: merged both guitar models using its own onset-evidence score, added notes Basic Pitch also heard,
  and dropped low "notes" that were the body's ~93 Hz resonance. Strings by LilyPond with 12 pins from frames; Beat This!
  and madmom for beats; its own chord matcher. *Judgement:* capo 0 and standard tuning from inlays, nut and chord shapes
  plus the sound; a percussive break left without notes; three fills up the neck pinned from frames; chord labels by hand.
- **standard, bare**: its own onset detector (superflux) and pitch finder (KL-NMF with harmonic templates). Recall
  passes copied notes between repeated sections where the audio agreed (+47) and filled pattern slots (+7). Its own
  beat tracker; strings by a cost search. *Judgement:* tuning and capo from the nut and open shapes; 76 BPM rather than
  152; verse B3 on string 3 fret 4 from frames (32 notes); hand windows read by eye; 17 chord bars set by hand.
- **tuning, kit**: merged both guitar models and Basic Pitch with its own scripts. It voted across repeated sections
  (+5), filled the rolled chords' pattern (+16, by judgement) and removed 5. LilyPond with pins; madmom with a tempo hint.
  *Judgement:* tuning D2 G2 C3 F3 A3 D4 from the lowest notes, pitch counts and hand shapes. It kept the trackers'
  beat phase and wrote down the doubt; key D minor over madmom's F major.
- **tuning, bare**: its own harmonic KL-NMF with body-resonance and noise templates, onset rules and checking passes;
  strings by minimum cost. Its own beat tracker with downbeats on each roll's bass; chords by chroma templates and an
  HMM. *Judgement:* tuning D2 G2 D3 G3 C4 D4 from intonation and hand frames (it called the 1st string its least
  sure); bass = beat 1; key D minor.
- **capo, kit**: merged both guitar models (943 notes) and placed them in first position with tuttut. It then overrode
  string and fret from frames read every 1-2 s: four tapping passages, a fill at frets 10-12 six times, a verse box at
  frets 5-8. Beats from madmom; chords per half bar from the bass. *Judgement:* capo 3, found by counting frets from the
  body joint and the inlays; standard tuning; open G2 pull-offs added from Basic Pitch onsets; D4 on string 3 against
  the open 2nd string decided from four frames.
- **capo, bare**: its own KL-NMF and onset detector, with passes for ghost notes and misses, and notes that recur at
  the same place in the bar added back. Strings by dynamic programming with a video prior (its own capo and skin
  tracker and a tapping detector); its own 16th-note beat grid. *Judgement:* capo 3 from the inlays; standard tuning;
  4/4 at 77 BPM rather than 6/8 or 154; slaps left out; tapping fingering from a few frames; major and minor chords only.

## For the film

Paths are under `/home/user/gtv/`. Each answer has its own folder `blind/<id>/<arm>/film/` with:
- `strip.NN.png`, `strip.json` and `strip.mid`: the production tab strip of `answer.gp5` (tabstrip.cjs, scale 3). Fret
  glyphs sit within 1.1 px of the beat map (`align_tiles.py`: -0.4 / -0.4 / -0.8 / -1.1 / -0.7 / -0.6 px; the key's
  strips -0.3 / -0.9 / -0.7). The strip shows a capo but no tuning, so write the tuning beside it (PRODUCTION.md 6.4).
- `render.wav`: the GP5 played by FluidSynth (FluidR3_GM, program 25 for capo and standard, 24 for tuning, as the key's
  `experiments/<S>/o-01-c01-32/render.wav`), on the recording's clock, mono 22.05 kHz. Every note rendered.
- `labels.json` and `answer_gp5_notes.csv`: every note labelled right / wrong position / missed / invented.
- The best and worst 20 s for each answer (`stretch_*.json`, `roll_*.json`/`.mid` from `pianoroll_data.py`), and the
  stretch shown below (`stretch_diff.json`, `roll_diff.json`). A strip's beat x is in file time, which is recording time
  minus `gp_time_zero_s`: standard -0.2 (kit), -0.2682 (bare), -0.2 (key); tuning 0.06, -0.08, 0.1; capo 0.33, 0.334,
  0.34.

| answer | best 20 s: right / truth notes | worst 20 s: right / truth notes (wrong, missed, invented) |
|---|---|---|
| standard kit | 1-21 s: 84 / 86 | 156-176 s: 60 / 86 (12, 14, 13) |
| standard bare | 9-29 s: 76 / 81 | 92-112 s: 44 / 91 (8, 39, 82) |
| tuning kit | 66-86 s: 48 / 70 | 97-117 s: 31 / 72 (16, 25, 27) |
| tuning bare | 16-36 s: 15 / 72 | 84-104 s: 7 / 71 (33, 31, 32) |
| capo kit | 9-29 s: 66 / 66 | 157-177 s: 54 / 68 (8, 6, 9) |
| capo bare | 1-21 s: 66 / 66 | 163-183 s: 55 / 79 (10, 14, 22) |

**Where the two arms differ most** (the 20 s window with the most truth notes that only one arm has right;
`blind/<id>/film_diff.json`):

- **standard, 92-112 s.** 91 truth notes: 26 are right only in the kit arm's tab, 3 only in the bare arm's, 41 in both,
  21 in neither. Kit: 67 right, 12 wrong, 12 missed, 5 invented. Bare: 44, 8, 39, 82. *Show* the key's strip
  (`experiments/standard/o-01-c01-32/strip.*`) above `blind/b1/tools/film/strip.*` and `blind/b1/bare/film/strip.*`,
  and the two `roll_diff.json`. *Play* `songs/standard/standard.wav` at 92-112 s, then the key's `render.wav` and both
  arms' `film/render.wav` over the same seconds. *The key settles* positions and counts. *For the ear:* what 82 extra
  notes in 20 s sound like beside the recording.
- **tuning, 12-32 s.** 73 truth notes: 36 right only in the kit arm's tab, 4 only in the bare arm's, 10 in both, 23 in
  neither. Kit: 46 right, 10 wrong (all notes the key plays on the 1st string), 17 missed, 15 invented. Bare: 14, 40 (on
  the key's strings 1-4, from its tuning), 19, 21. *Show* the three strips, each with its tuning written beside it, and
  the rolls. *Play* the recording and the renders. A note on the wrong string but at the right pitch sounds right: the
  bare arm's render hides its tuning error from the ear, and the key settles it for the eye. *For the ear:* the beat
  phase, which truth-doubts.md leaves to judgement. Play `blind/b2/tools/film/clicks.wav` and
  `blind/b2/bare/film/clicks.wav` (2 kHz on beat 1, 1 kHz on the others, over the recording) beside the key's
  `work/exp-chords/clicks/tuning.truth.click.wav`.
- **capo, 173-193 s.** 95 truth notes: 19 right only in the kit arm's tab, 8 only in the bare arm's, 61 in both, 7 in
  neither. Kit: 80 right, 9 wrong (all notes the key plays on string 2), 6 missed, 12 invented. Bare: 69, 9 (also string
  2), 17, 30. Show and play these the same way: `experiments/capo/o-01-c01-32/`, then `blind/b3/<arm>/film/`. *The key
  settles* positions and counts. *For the ear:* the bare arm's 30 extra notes.

On every song the key settles tuning, capo, positions, and missed and invented counts. Left to the viewer: how a
tab's mistakes sound (a wrong position at the right pitch cannot be heard), the tuning song's beat phase, the standard
song's cents (the key's +6 is uncertain by about 2) and sevenths in the chord names.

## Limits, and what was not done

- The audit ([results/audit-blind.md](results/audit-blind.md)) found all six attempts valid. Its section 5 lists two
  problems the attempts did not cause, left for the orchestrator to weigh. The harness put the orchestrator's task list
  into every attempt's context, and that list names the performers and the slot names. Two blind videos are hard
  links of the originals.
- One attempt per arm and song: how much a second run of the same arm would differ is not measured.
- The kit was chosen, and its accuracy measured, on these same recordings (BLIND.md section 7). That favours the kit arm.
- Not made: BLIND.md 4.4's `render.sh --mix` and `draw_tab.sh` copies. The task asked for the production strip and a
  FluidSynth render on the recording's clock instead, which match how the chains were shown. Nothing was refused.
- Disk was at 1.7 GB free at the start, already under the 3 GB floor. This work added about 120 MB: renders, strips
  and the two click tracks.
