# E2-TUNING: the tuning finder's evidence tools and the code-only conditions (L-E2)

E2 of `../sessions/LOOP.md`, the parts that need no Opus. The capo is given everywhere (3 / 0 / 0). G = `/home/user/gtv`.
Every score below is `gtr-eval tuning` (0.12.1, ledger `G/loop/ledger/evals.jsonl`) with the capo given and t-01's
librosa offset in cents, plus an own count of open strings right of 6; all rows, with their eval ids and source files,
are in `e2-tuning-scores.json`. The keys' tunings: capo song and standard song E2 A2 D3 G3 B3 E4, nylon song
D2 G2 C3 F3 A3 C4.

Inputs: chain-2's notes (onset, offset, pitch only: its string and fret columns were made with the true tuning and are
never read) and E1's development windows at margin 1, 30 rows a second (lane E1 had not published `G/loop/hand/` when
this ran):

| song | window | hand_window.csv sha256 | tips.jsonl sha256 |
|---|---|---|---|
| capo | `G/loop/e1/capo/dev/final_m1_f30/` | 607ab0cdfb10eb02... | 0ee954b794c5cdf8... |
| standard | `G/loop/e1/standard/dev/final_m1_f30/` | 9e398c6895afa689... | 2c7f6fcd94ad2f64... |
| nylon | `G/loop/e1/tuning/dev/final2_m1_f30/` | 9e57bb85d2a94b1c... | 51506e61bfda4759... |

(full hashes in `G/loop/e2/score/dev/<song>/window.sha256`)

## The tools (`G/loop/tools/tuning/`)

- **`conflicts.py`** (step c). Every tuning with each string from 5 semitones below to 2 above a centre the caller gives
  (here standard; 8^6 = 262,144, only strictly rising ones kept) is scored over a stretch by its conflicts: a note no
  string can sound open or at a fret inside the window at its onset (`singles`, vectorised over all tunings), and an
  onset group (onsets within 35 ms) whose placeable notes cannot go on different strings (`groups`, Hall's rule, for
  the 5,000 tunings with fewest singles). Ranked by total, then by fewest strings moved from the centre, then by the
  smallest sum of moves: within a tie that order is a prior, not evidence. Reports the top 20, the tie size, the
  margin, the values each string takes among the tied, a `--check` tuning's rank, and with `--tips` the finger rule's
  tie-break. Whole song, three stretches: under a second without the finger rule.
- **`fingers.py`** (the finger rule). For two tunings, a note counts when they need different places for it. At the
  frames within 0.05 s of its onset: a fingertip is near a place when it is within 0.25 fret of the fret's space and
  within half a string spacing of the string's line (lines spread evenly, 8% of the board's width outside the outer
  strings). One tuning can play it open, the other needs a finger: no tip at any of the other's places favours the open
  one, a tip at a place only the other has favours the other. Both need a finger: a tip inside the fret space of a
  place only one has favours it. Verdict: twice the other's count and a lead of 3, else undecided. `--strings T` asks
  each string's question (T against T with one string moved -2, -1, +1, +2). The rule was changed twice before any
  count of a result was seen, and is fixed since: (1) strict fret space in the both-need case, after one debug listing
  showed two neighbouring frets both "near" a tip close to a wire; (2) partly shared places (the nylon C4: open string 1
  or string 2 fret 3, against string 2 fret 3 only) count by absence; the first version skipped them, so the brief's
  C4 question could not be asked.
- The tie-break in `conflicts.py --tips`: the first-ranked tied tuning is challenged by every other tied tuning in rank
  order and loses its place when the finger rule's verdict favours the challenger; a second pass counts the tied
  tunings the winner beats, the undecided and those that still beat it.
- For the blind packs: `spectro.py` (a stretch on a pitch axis with the notes as boxes), `render.py` (chosen notes with
  FluidSynth, optionally beside the recording), `frames.py` (frames, zoomed), and E1's `overlay.py` with `neck.py`;
  `TOOLS-TUNING.md` explains them and writes no tuning (conflicts.py takes its centre as an argument).

## Where the key ranks under (c), and what ties

Chain-2's notes, the dev windows. "Tied" = tunings with the same (lowest) total; the key had total 0 in every stretch.

| song | stretch | notes | groups | tied with the best | key's rank | among the tied, per string |
|---|---|---|---|---|---|---|
| capo | first 60 s | 200 | 4 | 2,748 | 1 (tied) | too many to list |
| capo | whole | 882 | 107 | 76 | 1 (tied) | s6 D#2/E2/F2, s5 G#2/A2, s4 C3/C#3/D3, s3 F3/F#3/G3, s2 A3/B3, s1 C4/C#4/D4/D#4/E4 |
| standard | first 60 s | 248 | 57 | 1,480 | 1 (tied) | too many to list |
| standard | whole | 734 | 174 | 82 | 1 (tied) | s6 E2, s5 G#2/A2, s4 C3/C#3/D3, s3 F3/G3, s2 G#3/A3/A#3/B3, s1 C4/C#4/D4/D#4/E4 |
| nylon | first 60 s | 214 | 9 | 156 | 1 (tied) | s6 B1-D2, s5 E2-G2, s4 A2-C3, s3 D3-F3, s2 G3-A3, s1 B3/C4 |
| nylon | whole | 611 | 28 | 64 | 1 (tied) | each string the key's or one semitone lower (2^6 = 64) |

- On every song the key is first only through the prior among the tied: on the steel songs the centre is the key, so
  (c)'s first place there is no evidence. What (c) does settle: the open strings it cannot lower or raise without a
  conflict. A string one semitone lower plays its open notes at fret 1, which a margin-1 window starting at fret 1
  always allows: the notes alone never separate "the key" from "one semitone lower" on a string played in first
  position.
- **The window separates D G C F A D from the nylon key**: 0 conflicts over the first 30 s (tied with the key among
  264), 2 group conflicts over the first 60 s, 6 over the whole song (A#3 with C4 at 43.07, 47.70, 91.86 s ...: both need
  string 2 in D G C F A D, and the window, frets 1 to 3 or 4, leaves no other place), rank 161. The brief's check (every
  key onset group fits D G C F A D within frets 0 to 5) used the key's notes and a 0-5 window; the tool's window is
  narrower.

## What the finger rule says on the ties

- **Nylon, string 1** (`fingers.py --a key --b D G C F A D`, whole song): 103 onsets favour the key, 1 D G C F A D,
  55 neutral. C4: 87 onsets with no fingertip at string 2 fret 3 (the key plays it open), 55 with a tip there (a place
  both tunings have: neutral). D4: 16 onsets with a tip at string 1 fret 2 (the key's place), 1 without.
- **Tie-break over the whole song**: nylon, the key wins and beats 61 of the 63 other tied tunings (2 undecided);
  capo, the key stays and beats 62 of 75 (13 undecided); standard, the key loses its 1st string to C4 (34 onsets for C4
  against 10): at 32 C4 onsets (string 2 fret 1 in the key) the nearest tip is inside fret 1's space but 0.61 to 1.38
  string spacings (median 0.79) off string 2's line, so "no tip at string 2 fret 1" is read 32 times and favours the
  tuning that plays C4 open on string 1.
- **Per string** (`--strings key`, whole song): capo: strings 6, 5, 4 and 2 favour the key on all 16 moves; string 3
  undecided on all 4 moves (40:22, 36:26, 19:23, 48:40); string 1 has 0 or 1 counted notes. Standard: the key on 10
  moves, undecided on 12, string 3 moved to F#3 (20:43) and G#3 (10:40) wins: the wrong side. Nylon: the key on 17
  moves, 7 undecided, none wrong. Files: `G/loop/e2/score/dev/<song>/fingers_strings_{all,60}.txt`.

## The code-only conditions, scored

Open strings right of 6 (gtr-eval `tuning_equal` agrees: 6 of 6 = true).

| condition | capo | standard | nylon |
|---|---|---|---|
| sound only: t-02 lowest-note rule, as recorded | 5 (D#2 A2 D3 G3 B3 E4) | 6 | 1 (D2 A2 D3 G3 B3 E4) |
| (c) first 60 s | 6 | 6 | 6 |
| (c) whole song | 6 | 6 | 6 |
| (c) + finger rule, first 60 s | 5 (s1 C4) | 5 (s1 C4) | 6 |
| (c) + finger rule, whole song | 6 | 5 (s1 C4) | 6 |
| (c) first 30 s | 6 | 6 | 5 (s1 E4: no 1st-string note yet) |
| (c) + finger rule, first 30 s | 4 (G#2, F#3) | 5 (s1 C4) | 6 |

The (c) rows are 6 of 6 on the steel songs because the prior picks the centre among thousands of tied tunings; on the
nylon song (c) alone is right from 60 s on because every one of its 64 tied tunings is the key or a semitone lower,
and the prior picks the higher. The finger rule is what makes the nylon answer evidence (the key beats 61 of 63 tied
and wins the string 1 question 103 to 1); on the steel songs it costs a 1st string in 3 of 4 rows over 60 s and more.
Cents (t-01, reused): 1.0 / 3.0 / 1.0 off.

Extra rows (in the JSON): adding notes heard by 2 or more of the five note models (72 / 50 / 59 notes) leaves the
standard and nylon answers as above but turns the capo song to D2 A2 D3 G3 B3 E4 over 60 s and D2 E2 A2 D3 G3 B3 over
the whole song (0 of 6): notes below the capo's lowest open pitch, which a note model invents, are conflicts for every
right tuning. Base notes only is the condition.

## Blind packs (for the Opus conditions)

`G/loop/e2/packs/tun-a` (capo song), `tun-b` (standard song), `tun-c` (nylon song; video from the blind folder), the map
in `G/loop/e2/blind-map.json`, manifests with every file's SHA-256 beside the packs. Each: `video.mp4` (a copy),
`notes.csv` (chain-2's onset, offset, pitch), `hand/hand_window.csv`, `hand/tips.jsonl`, `neck/anchors.json` and
`neck/track.json` (paths and notes stripped), `tools/` (7 scripts) and `TOOLS-TUNING.md`: 14 files, no links, scanned
for every key tuning, note-name sequences, song words and box paths (clean). Every tool ran once inside
`sandbox_run.sh` on a copy of `tun-c` (truth, songs, experiments and the records were empty there), log
`G/loop/e2/sbx/pack-copy-test.log`; the overlay from the pack's files is byte-identical to E1's.

## Limits

- The windows are E1's development windows, not the published ones; the code-only rows are re-run when they land
  (`G/work/e2-builder/rerun_published.sh`: the conflicts, finger and scoring runs and the packs, on `G/loop/hand/`).
- The finger rule's constants were set before scoring and not fitted; its two changes are listed above. Its known
  weaknesses on these songs: the landmark at a fretting fingertip can lie about one string spacing off its string
  (standard's C4: 0.61 to 1.38 spacings), and on string 3 of the steel songs it leans to a string a semitone lower
  (cause not checked).
- Steps (a) and (b) need Opus (frames) and are not here.

## Blind runs: Opus finds the tuning, capo given (2026-11-27, 03:43 to 04:12 UTC)

Six headless Opus 5.5 runs (effort max), each in its own folder of copies made from the song's pack and run inside
`sandbox_run.sh` (the file sandbox; the network-closed one was not used, see STATE's 03:28 caveat). Condition
**shape** (b): frames, the overlay, a spectrogram and the notes only (no `conflicts.py`, `fingers.py` or `render.py`
in the folder or its TOOLS doc), prompt "from one clear chord shape ... Check it on a second shape". Condition **all**:
the whole pack, prompt (1) open strings seen and heard, (2) chord shapes, (3) `conflicts.py`, (4) `fingers.py`. Both
had 40 minutes. The three songs ran side by side, shape first. Windows: E1's development windows at margin 1 (not yet
published), named with their SHA-256 in `e2-blind-runs.json`. Scored after each run with `gtr-eval tuning`.

| song | condition | answer (string 6 to 1) | right of 6 | minutes | output tokens | list cost | frames looked at | audit |
|---|---|---|---|---|---|---|---|---|
| capo (tun-a, capo 3) | shape | E2 A2 D3 G3 B3 E4 | 6 | 12.9 | 77,975 | $3.22 | 16 | clean |
| capo (tun-a, capo 3) | all | E2 A2 D3 G3 B3 E4 | 6 | 12.3 | 72,497 | $3.10 | 14 | clean |
| standard (tun-b) | shape | E2 A2 D3 G3 B3 E4 | 6 | 11.4 | 68,288 | $2.81 | 16 | clean |
| standard (tun-b) | all | E2 A2 D3 G3 B3 E4 | 6 | 10.2 | 58,785 | $2.48 | 13 | clean |
| nylon (tun-c) | shape | D2 G2 C3 F3 A3 C4 | 6 | 14.6 | 86,871 | $3.51 | 16 | clean |
| nylon (tun-c) | all | D2 G2 C3 F3 A3 C4 | 6 | 13.4 | 74,281 | $3.35 | 17 | clean |

36 of 36 strings right; ledger ids e1268 to e1270 (shape) and e1281 to e1283 (all). AO-082's results on the nylon
song were Drop D (lowest-note rule), standard (Opus on frames) and D G C F A D (both blind arms). Here the nylon's
string 1 came from a G minor shape: the shape run read a fingertip at fret 2 on the string-1 edge while D4 sounded
(62 - 2 = 60), then C4 three times with every finger at frets 1 and 2; the all run added C4 starting with Bb3 six
times. "Frames looked at" counts Read calls on images (sheets of several frames and spectrograms included).

Audit (an own script over every tool call, `G/work/e2-blind/audit.py`, plus a check of every absolute path in every
tool input): no tool outside the six, no path outside the folder and the named Python, no network, git, install or
machine search. Every run kept frames and lists in its own Claude Code scratchpad under `/tmp`, which inside the
sandbox is a private, empty tmpfs (a note, not a breach). The shape runs also read `notes.csv`, the window and the
fingertips with their own Python one-liners, and the nylon shape run checked a few candidate tunings against the window
in its own code once: a home-made form of step (c), so that run is not a pure "chord shape only" measure. No run was
void, none hit the 60-minute watchdog. One run each: no repeat spread yet.
