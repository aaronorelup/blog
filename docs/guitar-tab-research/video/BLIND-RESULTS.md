# The blind test, scored: Opus 5.5 writes each tab from the video, with the kit and without tools

Agent `blind-scorer-r2`, 2026-11-25. Scores both rounds of [BLIND.md](BLIND.md) and sets them beside the six chains of
[step 9](results/step-09-tabs-and-chains.md). **Round 2 is the result.** Its ids (`/home/user/gtv/truth/blind-map.json`,
"round2", read only to score): **c1 = capo, c2 = tuning, c3 = standard**. Round 1 (b1 = standard, b2 = tuning, b3 = capo)
ran the same videos, prompt, model, effort, time and kit. It stays here as a second run, marked *task list visible*: the
harness had attached the orchestrator's task list to each round-1 attempt's context 13 to 18 times, and its entries named
the performers and the answer keys "capo", "tuning" and "standard", so a round-1 attempt could know that the test held a
capo song and a tuning song ([results/audit-blind.md](results/audit-blind.md)). In round 2 the list was empty. Arms: the
kit arm (folder `tools`) and the bare arm (`bare`). Every number is in `/home/user/gtv/blind/results.json` (both rounds, a
`round` field on every attempt row, a flat `rows` list, `rounds_compared`), read from the gtr-eval 0.12.1 outputs in
`/home/user/gtv/blind/<id>/<arm>/score/` (round 2: eval ids e3385-e3519; round 1: e3226-e3360) or from a file named in
the line. Scripts: `/home/user/gtv/work/blind-scorer-r2/bin/` (round 1's scripts copied, only paths and ids changed; plus
`merge_rounds.py`, `tables2.py`, `details.py`, `clicks.sh`). Log: `/home/user/gtv/work/blind-scorer-r2/PROGRESS.md`.

## How the answers were scored

- **The protocol** (`tools/blind-admin/score_blind.sh`, BLIND.md section 4): `answer.json` checked by `validate_answer.py`
  and scored for tab, notes, beats, chords, tempo, key and tuning (`score/summary.json`).
- **The chains' commands.** The seven gtr-eval calls step 9 ran on every chain, on the handed-in `answer.gp5` read back
  and moved by its time 0: `score/score.sh` writes `score_tab.json` (main), `score_tab_order`, `score_tab_list` (on
  `answer.json`), `score_notes`, `score_beats`, `score_chords`, `score_tuning`. Round 2's `score.sh` files were made by
  round 1's generator; each differs from round 1's for the same song only in paths and in what it reads from the answer
  (time 0, capo, tuning). Every `answer.gp5` of both rounds is the kit writer's output for its `answer.json` (12 of 12).
- **Main number**, as in step 9: same string and fret, as a share of all truth notes, in the finished GP5 (onset within
  50 ms and the same pitch; frets counted from each side's capo). The tab list (`answer.json`) is in brackets. Whole
  songs; chain-4 covers only its 30 s.
- The readings of [truth-doubts.md](results/truth-doubts.md) apply: the tuning song's beat phase is judgement (its beats
  are also scored after moving them by their median offset); cents differences under 3 on the standard song are not
  graded; chords are compared as majmin, so sevenths do not count.

## The attempts: handed in, time used

| song (round 2 id) | arm | `answer.json` valid (also with the video's times) | `answer.gp5` = writer's output | HOW.md | notes (in the GP5) | minutes: START to `answer.json` (to last hand-in file) | round 1: notes (GP5), minutes |
|---|---|---|---|---|---|---|---|
| standard (c3) | kit | yes (yes) | yes | yes | 695 (695) | 32.5 (32.6) | 705 (705), 28.1 |
| standard (c3) | bare | yes (yes) | yes | yes | 815 (808) | 38.9 (39.3) | 1024 (1014), 36.3 |
| tuning (c2) | kit | yes (yes) | yes | yes | 631 (624) | 33.1 (33.5) | 624 (624), 25.7 |
| tuning (c2) | bare | yes (yes) | yes | yes | 646 (637) | 42.8 (42.9) | 591 (586), 39.0 |
| capo (c1) | kit | yes (yes) | yes | yes | 921 (921) | 40.3 (40.3) | 941 (940), 34.2 |
| capo (c1) | bare | yes (yes) | yes | yes | 939 (939) | 41.1 (41.7) | 1022 (1022), 39.5 |

All twelve finished well inside the 90-minute cap. In round 2 the kit arm took 32.5-40.3 minutes and the bare arm
38.9-42.8; every round-2 attempt took longer than its round-1 twin (by 1.6 to 7.4 minutes). The writer drops a note when
two land on one string at one grid step (round 2: 7, 7 and 9 notes).

## Per song: round 2's two arms, the six chains and the key, then round 1

Columns: the answer's tuning and capo (strings that differ from the key's in bold); whether they equal the key's; the
main number (GP5, list in brackets); same string and fret as a share of the matched notes, and the share of truth notes
matched at all; the counts behind them (truth notes right / matched but on another string or fret / missed; answer notes
matching no truth note); the file's note onset F1 (50 ms, 50 cents); beat F and downbeat F (70 ms); chord names, majmin
share of time. The chains (step 9): chain-1 the best tool at each step, blind; chain-2 the same with the key's tuning
and capo given; chain-3 blind, with the best tuning answer that hears or sees (Opus 5.5 on frames, or the sound rule)
and video tips for positions; chain-4 one hosted service (30 s only); chain-5 the key's own notes through the best
string chooser; chain-6 chain-2's tab with the key's string and fret given for every matched note. The key row is its
own tab through the same writer, the ceiling this writer allows. The last two rows are round 1, marked *task list
visible*: its attempts had the orchestrator's task list, which named the three answer keys, in their context.

**standard (c3), 679 truth notes; key: standard tuning, capo 0, C major, 76.14 BPM, +6 cents**

| | tuning, capo | equal | main | of matched / matched | right / wrong / missed / invented | note F1 | beat F / downbeat F | majmin |
|---|---|---|---|---|---|---|---|---|
| **kit arm** | standard, 0 | yes, yes | **0.865** (0.875) | 0.941 / 0.919 | 587 / 37 / 55 / 71 | 0.908 | 0.987 / 0.973 | 0.914 |
| **bare arm** | standard, 0 | yes, yes | **0.705** (0.710) | 0.928 / 0.760 | 479 / 37 / 163 / 292 | 0.694 | 0.969 / 0.938 | 0.777 |
| chain-1 (= chain-2) | standard, 0 | yes, yes | 0.822 (0.829) | 0.896 / 0.918 | 558 / 65 / 56 / 111 | 0.882 | 0.984 / 0.973 | 0.863 |
| chain-3 | standard, 0 | yes, yes | 0.719 (0.729) | 0.795 / 0.904 | 488 / 126 / 65 / 111 | 0.875 | 0.984 / 0.973 | 0.863 |
| chain-4 (30 s) | standard, 0 | yes, yes | 0.016 (0.016) | 1.000 / 0.016 | 2 / 0 / 123 / 64 | 0.021 | 0.229 / 0.074 | 0.530 |
| chain-5 | standard, 0 | yes, yes | 0.890 (0.892) | 0.892 / 0.997 | 604 / 73 / 2 / 2 | 0.997 | 0.984 / 0.973 | 0.863 |
| chain-6 | standard, 0 | yes, yes | 0.918 (0.928) | 1.000 / 0.918 | 623 / 0 / 56 / 111 | 0.882 | 0.984 / 0.973 | 0.863 |
| key through the writer | standard, 0 | - | 0.997 (1.000) | 1.000 / 0.997 | 677 / 0 / 2 / 2 | 0.997 | - | - |
| kit arm, round 1 (b1), task list visible | standard, 0 | yes, yes | 0.828 (0.835) | 0.902 / 0.918 | 562 / 61 / 56 / 82 | 0.900 | 0.987 / 0.973 | 0.919 |
| bare arm, round 1 (b1), task list visible | standard, 0 | yes, yes | 0.694 (0.705) | 0.911 / 0.761 | 471 / 46 / 162 / 497 | 0.611 | 0.973 / 0.956 | 0.802 |

- Both arms: standard tuning, capo 0, C major, tempo 76.92 and 76.12. Cents +3 and +3.5, which is 3 and 2.5 below the
  key's +6; independent measurements put this guitar at +3.7 to +4.9 (truth-doubts.md).
- Kit arm: 37 notes on another string (35 that the key plays on string 3 put on string 2, 2 from string 2 on string 1),
  none on the right string at the wrong fret; 55 missed, 71 invented (precision 0.898, recall 0.919). It is above chain-1
  (0.822, tools from the same kit as a fixed chain) and below chain-5 (0.890) and chain-6 (0.918), which were each given
  part of the key.
- Bare arm: of the notes it found, 0.928 sit on the key's string and fret, but it found fewer and invented more (recall
  0.760, precision 0.639: 292 of its 808 written notes match no truth note, 163 truth notes missed). 37 on another string
  (30 from string 3 on string 2).
- Round 1 gave the same tuning, capo and key, and the same order (0.828 and 0.694); its bare arm invented 497 notes.

**tuning (c2), 628 truth notes; key: D2 G2 C3 F3 A3 C4, capo 0, D minor, 65.73 BPM, -9 cents**

| | tuning, capo | equal | main | of matched / matched | right / wrong / missed / invented | note F1 | beat F / downbeat F (moved: beat F) | majmin |
|---|---|---|---|---|---|---|---|---|
| **kit arm** | D2 G2 C3 F3 A3 **D4**, 0 | no, yes | **0.548** (0.659) | 0.798 / 0.686 | 344 / 87 / 197 / 193 | 0.688 | 0.010 / 0.040 (-0.180 s: 0.877) | 0.954 |
| **bare arm** | D2 G2 C3 F3 A3 **D4**, 0 | no, yes | **0.347** (0.398) | 0.690 / 0.503 | 218 / 98 / 312 / 321 | 0.500 | 0.005 / 0.020 (-0.200 s: 0.880) | 0.733 |
| chain-1 | D2 **A2 D3 G3 B3 E4**, 0 | no, yes | 0.081 (0.102) | 0.111 / 0.729 | 51 / 407 / 170 / 144 | 0.745 | 0.059 / 0.154 | 0.657 |
| chain-2 | D2 G2 C3 F3 A3 C4, 0 | yes, yes | 0.715 (0.801) | 0.970 / 0.737 | 449 / 14 / 165 / 144 | 0.750 | 0.059 / 0.154 (-0.193 s: 0.837) | 0.657 |
| chain-3 | D2 **A2 D3 G3 B3 E4**, 0 | no, yes | 0.081 (0.102) | 0.110 / 0.736 | 51 / 411 / 166 / 144 | 0.749 | 0.059 / 0.154 | 0.657 |
| chain-4 (30 s) | standard, 0 | no, yes | 0.000 (0.000) | 0.000 / 0.038 | 0 / 4 / 102 / 44 | 0.052 | 0.000 / 0.000 | 0.639 |
| chain-5 | D2 G2 C3 F3 A3 C4, 0 | yes, yes | 0.914 (0.967) | 0.968 / 0.944 | 574 / 19 / 35 / 34 | 0.945 | 0.059 / 0.154 | 0.657 |
| chain-6 | D2 G2 C3 F3 A3 C4, 0 | yes, yes | 0.732 (0.822) | 0.994 / 0.737 | 460 / 3 / 165 / 145 | 0.749 | 0.059 / 0.154 | 0.657 |
| key through the writer | D2 G2 C3 F3 A3 C4, 0 | - | 0.944 (1.000) | 1.000 / 0.944 | 593 / 0 / 35 / 35 | 0.944 | - | - |
| kit arm, round 1 (b2), task list visible | D2 G2 C3 F3 A3 **D4**, 0 | no, yes | 0.562 (0.634) | 0.778 / 0.723 | 353 / 101 / 174 / 170 | 0.725 | 0.005 / 0.020 (-0.189 s: 0.892) | 0.664 |
| bare arm, round 1 (b2), task list visible | D2 G2 **D3 G3 C4 D4**, 0 | no, yes | 0.159 (0.169) | 0.244 / 0.653 | 100 / 310 / 218 / 176 | 0.675 | 0.240 / 0.949 (-0.193 s: 0.716) | 0.351 |

- Both arms named D2 G2 C3 F3 A3 D4 ("D standard"): five strings right and the 1st string a whole step high, D4 for C4,
  as round 1's kit arm did. Capo 0, cents -10 against -9, tempo 65.7 and 66.45 are right; key D minor (kit) and F major
  (bare, the relative major). The key's C4 is not among the doubts: the tab's tuning is D G C F A C, and its check heard
  C4, not D4, at the notes the tab puts on the open 1st string ([truth-tuning-check.md](truth-tuning-check.md)).
- All 87 of the kit arm's wrong-position notes are notes the key plays on the 1st string: 75 moved to string 2, 12 on
  string 1 two frets lower. The bare arm: 96 of its 98 the same way (85 and 11), 2 from string 2 on string 3.
- So both arms lost more on finding the notes than on the tuning: the kit arm missed 197 and invented 193 (recall 0.686,
  precision 0.691); the bare arm missed 312 and invented 321 (0.503, 0.496), and found 12 % of the bass notes (it kept a
  bass note only when a long spectrum showed a new peak, to reject the body's boom near 99 Hz).
- Writing the file cost the kit arm 0.111 (list 0.659, GP5 0.548) and the bare arm 0.051: 10.8 % and 10.1 % of their
  notes land more than 50 ms off the 32nd grid, because the piece has no steady pulse. The key's own tab loses 0.056 so.
- Against the chains: both arms sit between the blind chains (0.081: the lowest-note rule said Drop D) and chain-2 (0.715,
  given the key's tuning). Chords: the kit arm's majmin 0.954 is the highest of any answer on this song (chains 0.657).
- Beats (judgement, truth-doubts.md): the key puts beat 1 on the bass of each opening roll. Both round-2 arms put it
  later in the roll (kit: mid-roll; bare: where the roll lands): downbeats a median +0.129 s (kit) and +0.144 s (bare)
  after the key's, other beats +0.197 and +0.210 s (the chains: +0.144 / +0.206). Moved by their median offset, the beat
  grids score 0.877 (kit), 0.880 (bare), 0.837 (chains). Round 1's bare arm had put its bar lines on the bass, as the key
  does (downbeat F 0.949).

**capo (c1), 815 truth notes; key: standard tuning, capo 3, B-flat major, 76.56 BPM, +2 cents**

| | tuning, capo | equal | main | of matched / matched | right / wrong / missed / invented | note F1 | beat F / downbeat F | majmin |
|---|---|---|---|---|---|---|---|---|
| **kit arm** | standard, 3 | yes, yes | **0.930** (0.945) | 0.966 / 0.963 | 758 / 27 / 30 / 136 | 0.904 | 0.998 / 0.993 | 0.706 |
| **bare arm** | standard, 3 | yes, yes | **0.816** (0.861) | 0.977 / 0.836 | 665 / 16 / 134 / 258 | 0.777 | 0.990 / 0.979 | 0.680 |
| chain-1 | **D#2 A2 D3 G3 B3 E4**, 0 | no, no | 0.000 (0.000) | 0.000 / 0.940 | 0 / 766 / 49 / 117 | 0.902 | 0.995 / 0.986 | 0.716 |
| chain-2 | standard, 3 | yes, yes | 0.753 (0.767) | 0.802 / 0.940 | 614 / 152 / 49 / 116 | 0.903 | 0.995 / 0.986 | 0.716 |
| chain-3 | standard, 3 | yes, yes | 0.712 (0.719) | 0.758 / 0.939 | 580 / 185 / 50 / 116 | 0.902 | 0.995 / 0.986 | 0.716 |
| chain-4 (30 s) | standard, 3 | yes, yes | 0.010 (0.010) | 1.000 / 0.010 | 1 / 0 / 101 / 72 | 0.011 | 0.195 / 0.095 | 0.281 |
| chain-5 | standard, 3 | yes, yes | 0.791 (0.795) | 0.794 / 0.996 | 645 / 167 / 3 / 3 | 0.996 | 1.000 / 0.993 | 0.706 |
| chain-6 | standard, 3 | yes, yes | 0.940 (0.958) | 1.000 / 0.940 | 766 / 0 / 49 / 113 | 0.904 | 0.995 / 0.986 | 0.716 |
| key through the writer | standard, 3 | - | 0.996 (1.000) | 1.000 / 0.996 | 812 / 0 / 3 / 3 | 0.996 | - | - |
| kit arm, round 1 (b3), task list visible | standard, 3 | yes, yes | 0.907 (0.937) | 0.958 / 0.946 | 739 / 32 / 44 / 169 | 0.879 | 0.998 / 0.993 | 0.704 |
| bare arm, round 1 (b3), task list visible | standard, 3 | yes, yes | 0.805 (0.823) | 0.929 / 0.866 | 656 / 50 / 109 / 316 | 0.769 | 0.993 / 0.986 | 0.720 |

- Both arms: capo 3 (each read it from the inlays and fret wires in frames), standard tuning, B-flat major, tempo 76.92
  and 76.61, cents +3 and +1. The kit arm's lowest-note tool proposed capo 6; it overruled the rule from the picture
  (HOW.md).
- Kit arm: 0.930 is above every chain except chain-6 (0.940), including chain-5 (0.791, the key's own notes through the
  best string chooser). 0.966 of its matched notes sit right. 27 on another string (19 that the key plays on string 2,
  6 from string 3, 2 from string 6), 30 missed, 136 invented (precision 0.852, recall 0.963).
- Bare arm: 0.977 of the notes it found sit right, the highest share here after chain-6 and the key, but it missed 134
  (chord notes recall 0.700) and invented 258 (precision 0.725). Writing the file cost it 0.045 (list 0.861, GP5 0.816).
- Round 1: the same tuning, capo and key; 0.907 and 0.805.

**Across the three songs (round 2).** The kit arm beat the bare arm on every song's main number: by 0.159 (standard),
0.201 (tuning) and 0.114 (capo); in round 1 by 0.134, 0.403 and 0.102. The gap comes from finding the notes (note F1
0.908 / 0.688 / 0.904 against 0.694 / 0.500 / 0.777, with fewer invented notes). Once a note was found, both arms put it
on the right string and fret about equally often (of matched: 0.941 / 0.798 / 0.966 against 0.928 / 0.690 / 0.977). Both
arms named capo and tempo right on all three songs, and the key on all but one (bare, tuning song: F major for D minor).
Neither found the tuning song's 1st string. Chords (majmin): 0.914 / 0.954 / 0.706 (kit), 0.777 / 0.733 / 0.680 (bare),
chains 0.863 / 0.657 / 0.716.

## Two runs of each arm: where the rounds agree and where they differ

| song, arm | tuning, capo: round 2 / round 1 | main: round 2 / round 1 (difference) | note F1: round 2 / round 1 | minutes: round 2 / round 1 |
|---|---|---|---|---|
| standard, kit | standard, 0 / the same | 0.865 / 0.828 (+0.037) | 0.908 / 0.900 | 32.5 / 28.1 |
| standard, bare | standard, 0 / the same | 0.705 / 0.694 (+0.012) | 0.694 / 0.611 | 38.9 / 36.3 |
| tuning, kit | D G C F A D, 0 / the same | 0.548 / 0.562 (-0.014) | 0.688 / 0.725 | 33.1 / 25.7 |
| tuning, bare | D G C F A D, 0 / D G D G C D, 0 | 0.347 / 0.159 (+0.188) | 0.500 / 0.675 | 42.8 / 39.0 |
| capo, kit | standard, 3 / the same | 0.930 / 0.907 (+0.023) | 0.904 / 0.879 | 40.3 / 34.2 |
| capo, bare | standard, 3 / the same | 0.816 / 0.805 (+0.011) | 0.777 / 0.769 | 41.1 / 39.5 |

- **Agree:** capo on all six pairs, tuning on five of six (identical answers, including the kit arm's D4 1st string on the
  tuning song), key on five of six, and the order: the kit arm above the bare arm on every song in both rounds.
- **Differ:** where the tuning answer held, one arm's two runs differ by 0.011 to 0.037 on the main number. The tuning
  song's bare arm changed its tuning (2 of 6 strings right in round 1, 5 of 6 in round 2) and its main number by 0.188,
  while its note F1 fell by 0.176 (it missed 94 more notes and invented 145 more). Note F1 moved by up to 0.083
  elsewhere (standard, bare: 0.611 to 0.694, from 205 fewer invented notes). The tuning song's kit arm named its chords
  far better in round 2 (majmin 0.954 against 0.664). Round 2 took longer on all six (1.6 to 7.4 minutes) and scored
  higher on five of six main numbers.
- With one run of each, these differences cannot be split between the task list and the ordinary variation of one
  attempt.

## The film's 30 s segment (RESULTS.md's segments; chain-4 was scored on these)

| song, segment | truth notes | kit: handed-in GP5 (right / wrong / missed / invented) | kit: crop route | bare: handed-in GP5 | bare: crop route | round 1: kit, bare | chain-4 |
|---|---|---|---|---|---|---|---|
| standard 0-30 s | 125 | 0.952 (119 / 6 / 0 / 3) | 0.944 | 0.888 (111 / 6 / 8 / 7) | 0.888 | 0.952, 0.888 | 0.016 |
| tuning 25-55 s | 106 | 0.547 (58 / 18 / 30 / 36) | 0.557 | 0.368 (39 / 21 / 46 / 60) | 0.368 | 0.566, 0.160 | 0.000 |
| capo 12.76-42.76 s | 102 | 0.971 (99 / 0 / 3 / 18) | 0.971 | 0.922 (94 / 0 / 8 / 37) | 0.922 | 0.951, 0.863 | 0.010 |

"Handed-in GP5" = the whole-song match of `answer.gp5` (`film/labels.json`), counted over the truth notes inside the
segment. "Crop route" = BLIND.md's way: `crop_truth.py` on `answer.json`, written again with `answer2gp5.py`, then the
chain commands against the segment truth chain-4 was scored on (`score/seg30/`). Round 1's columns are its handed-in GP5.

## What each round-2 attempt did (from its HOW.md; each said it did not recognise the piece)

- **standard, kit**: compared the two guitar models (606 notes agree) and judged the rest by its own onset-rise score
  and a Basic Pitch vote; left out the body's ~94 Hz resonance. LilyPond and tuttut agreed on open position; its own
  hand tracker found 12 moments away from the nut, read on zoomed frames and pinned. Repeats compared note by note
  (+11). Beat This! and madmom agreed. *Judgement:* capo 0 from the nut; a G2-F#2-F2 bass approach added from frames.
- **standard, bare**: its own spectral-flux onsets and harmonic-sum pitch picking, re-pluck detection, filters for weak,
  non-diatonic and harmonic notes; the ~93 Hz body burst treated as no note. Strings by cost from a hand position measured
  on the video; its own beat tracker. *Judgement:* 76 BPM rather than 152; C major; walk-up B3 on the open B string.
- **tuning, kit**: merged both guitar models with Basic Pitch as referee; hand edits with a reason each (filled the 4-note
  rolls, removed collisions and doubles); consensus across repeats. tuttut with pins. *Judgement:* D standard from the
  open-chord shapes and the end chord, against the lowest-note rule's Drop D; 4/4 at 65.7 rather than 5/4 (its least sure
  call); beat 1 mid-roll; key D minor over madmom's F major.
- **tuning, bare**: its own spectrogram, KL-NMF and onset detector; bass notes kept only with a new peak in a long
  spectrum; checked its own chain on a FluidSynth render. Strings by Viterbi, notes above fret 4 dropped (the video shows
  first position). *Judgement:* D standard from Bb2+D3+F3 ringing together, E2+G2 under C/E and fingers in frames;
  downbeat where each roll lands; key F major.
- **capo, kit**: merged both guitar models plus notes Basic Pitch also heard; added 6 C4 that complete the tapped figure
  (by pattern) and 16 open G2 pull-offs after the taps (from narrow-band spectra; its counts). Its own skin-colour hand
  detector, neck contact sheets and ~20 zooms gave hand windows for its own Viterbi string assigner. *Judgement:* capo 3
  from the inlay pattern (the lowest-note rule said capo 6); low thumps are percussion; tap bars named Bb, not Gm.
- **capo, bare**: its own KL-NMF with noise templates for the slaps, onset detector and recall passes (notes recurring in
  similar bars, per-pitch rises, weak in-key melody); strings by dynamic programming with positions read on zoomed frames
  (tap bars, thumb-over bars, the phrase-end fill). *Judgement:* capo 3 from fret wires and inlays; slaps left out; 77
  rather than 154 BPM; B-flat rather than E-flat major.

Round 1's six are summarised in `/home/user/gtv/work/blind-scorer/PROGRESS.md` (step 3).

## For the film (round 2)

Paths are under `/home/user/gtv/`. Each round-2 answer has its own folder `blind/<id>/<arm>/film/` (c1 capo, c2 tuning,
c3 standard), made by the same scripts as round 1's:
- `strip.NN.png`, `strip.json`, `strip.mid`: the production tab strip of `answer.gp5` (tabstrip.cjs, scale 3). Fret glyphs
  sit within 0.9 px of the beat map (`align_tiles.py`: capo -0.7 / -0.7, tuning -0.9 / -0.8, standard +0.2 / -0.4 px). The
  strip shows a capo but no tuning, so write the tuning beside it (PRODUCTION.md 6.4).
- `render.wav`: the GP5 played by FluidSynth (FluidR3_GM, program 25 for capo and standard, 24 for tuning, as the key's
  `experiments/<S>/o-01-c01-32/render.wav`), on the recording's clock, mono 22.05 kHz. Every note rendered (6 of 6 logs).
- `labels.json` and `answer_gp5_notes.csv`: every note labelled right / wrong position / missed / invented.
- The best and worst 20 s (`stretch_*.json`, `roll_*.json`/`.mid` from `pianoroll_data.py`) and the stretch below
  (`stretch_diff.json`, `roll_diff.json`). A strip's beat x is in file time, which is recording time minus
  `gp_time_zero_s`: standard -0.2 (kit), -0.214 (bare), -0.2 (key); tuning -0.008, 0.1, 0.1; capo 0.34, 0.3275, 0.34.
- Tuning song only: `clicks.wav` (2 kHz on beat 1, 1 kHz on the others, over the recording, 44.1 kHz stereo) from
  `beats_numbered.txt`, made as round 1's (checked: the recipe re-makes both of round 1's files byte for byte).

| answer | best 20 s: right / truth notes | worst 20 s: right / truth notes (wrong, missed, invented) |
|---|---|---|
| standard kit | 1-21 s: 84 / 86 | 105-125 s: 65 / 83 (6, 12, 7) |
| standard bare | 7-27 s: 72 / 80 | 139-159 s: 35 / 72 (4, 33, 61) |
| tuning kit | 62-82 s: 47 / 70 | 97-117 s: 31 / 72 (11, 30, 32) |
| tuning bare | 73-93 s: 35 / 70 | 111-131 s: 17 / 73 (15, 41, 32) |
| capo kit | 6-26 s: 65 / 65 | 112-132 s: 52 / 60 (4, 4, 10) |
| capo bare | 8-28 s: 65 / 65 | 147-167 s: 52 / 72 (1, 19, 21) |

**Where the two arms differ most** (the 20 s window with the most truth notes that only one arm has right;
`blind/<id>/film_diff.json`):

- **standard, 140-160 s.** 74 truth notes: 30 are right only in the kit arm's tab, 2 only in the bare arm's, 35 in both,
  7 in neither. Kit: 65 right, 2 wrong, 7 missed, 14 invented. Bare: 37, 4, 33, 60. *Show* the key's strip
  (`experiments/standard/o-01-c01-32/strip.*`) above `blind/c3/tools/film/strip.*` and `blind/c3/bare/film/strip.*`, and
  the two `roll_diff.json`. *Play* `songs/standard/standard.wav` at 140-160 s, then the key's `render.wav` and both arms'
  `film/render.wav` over the same seconds. *The key settles* positions and counts. *For the ear:* what 60 extra and 33
  missing notes in 20 s sound like beside the recording.
- **tuning, 56-76 s.** 71 truth notes: 27 right only in the kit arm's tab, 7 only in the bare arm's, 17 in both, 20 in
  neither. Kit: 44 right, 7 wrong (notes the key plays on the 1st string, put on string 2), 20 missed, 17 invented. Bare:
  24, 8 (the same kind), 39, 33. Both arms wrote D G C F A D: write it beside their strips and D G C F A C beside the
  key's. Here the arms differ in the notes they found, not in the tuning. A note on the wrong string at the right pitch
  sounds right: the renders hide the 1st-string error from the ear, and the key shows it to the eye. *For the ear:* the
  beat phase, which truth-doubts.md leaves to judgement. Play `blind/c2/tools/film/clicks.wav` and
  `blind/c2/bare/film/clicks.wav` beside the key's `work/exp-chords/clicks/tuning.truth.click.wav`.
- **capo, 169-189 s.** 90 truth notes: 18 right only in the kit arm's tab, 3 only in the bare arm's, 65 in both, 4 in
  neither. Kit: 83 right, 3 wrong (notes the key plays on string 2, put on string 3), 4 missed, 6 invented. Bare: 68, 5
  (4 from string 2 on string 1, 1 from string 3 on string 2), 17, 15. Show and play these the same way:
  `experiments/capo/o-01-c01-32/`, then `blind/c1/<arm>/film/`. *The key settles* positions and counts. *For the ear:*
  the bare arm's 17 missing notes.
- **One arm, two runs** (if the film shows how much one attempt varies): the tuning song's bare arm, same model, prompt,
  kit and time, named D G C F A D in round 2 and D G D G C D in round 1. In 56-76 s: round 2 24 right, 8 wrong, 39
  missed, 33 invented; round 1 14, 31, 26, 14 (`/home/user/gtv/work/blind-scorer-r2/details.json`). Strips:
  `blind/c2/bare/film/` and `blind/b2/bare/film/` (round 1's time 0: -0.08).

On every song the key settles tuning, capo, positions, and missed and invented counts. Left to the viewer: how a tab's
mistakes sound (a wrong position at the right pitch cannot be heard), the tuning song's beat phase, the standard song's
cents (the key's +6 is uncertain by about 2) and sevenths in chord names.

## Limits, and what was not done

- Round 2's audit ([results/audit-blind.md](results/audit-blind.md), section "Round 2") found all six attempts valid and
  no attachment or reminder leaking: one call was refused (a stray write; nothing ran), and `ps aux` showed two kit-arm
  attempts each other's command lines (R2.4, not voiding). Two setup problems were not the attempts' doing (R2.6): the
  blind videos are hard links of the recordings again, and BLIND.md's short tool list was applied in neither round. Round
  1's audit found its six attempts valid; its task-list problem is described at the top.
- Two runs per arm, one of them with the task list visible: they show the size of the variation, not its spread.
- The kit was chosen, and its accuracy measured, on these same recordings (BLIND.md section 7). That favours the kit arm.
- Not made: BLIND.md 4.4's `render.sh --mix` and `draw_tab.sh` copies, as in round 1 (the production strip and a
  FluidSynth render on the recording's clock instead). Nothing was refused.
- Disk (df -BM): 3063 MB free at the start; this work's files take about 120 MB. Round 1's two tuning-song click
  tracks (66 MB, superseded for the film by round 2's) were deleted after each was re-made byte for byte from its kept
  beat list; `results.json` gives the command that makes them again. 2998 MB free at the end.
