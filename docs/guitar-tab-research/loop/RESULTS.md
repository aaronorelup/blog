# LOOP: results

The record of the LOOP session (`../sessions/LOOP.md`), 2026-11-27. DIRECTION.md asked for an app that turns a solo
fingerstyle video into the tab as it was played, treated as a constraints problem (the tuning, the capo, which frets the
hand can reach, the notes), with Opus using the hand tracker and checking it himself, a tuning finder that works the way a
person would, and a loop that writes one bar at a time and learns as it goes. Chords and song analysis are left out.

Every number here is in `results.json` beside this file, with the gtr-eval output it comes from and its eval id in the
ledger (`G/loop/ledger/evals.jsonl`); `results.json` is built by `make_results.py` (here; run from `G/loop/work/`), which types in no number.
The hand tool's own record is `HAND.md`, the tuning finder's `TUNING.md`, the plain solver's ladder `LADDER.md`, the loop's
design `LOOP-DESIGN.md`, the held-out set `HELDOUT-PREP.md` and `HELDOUT-BLIND.md`. G = `/home/user/gtv`.

**The main number**: the share of the answer key's notes that the attempt has on the same string and fret (frets counted
from each side's capo), onset within 50 ms, same pitch (`gtr-eval tab`, 0.12.1). **Heard**: the same over the key notes
the recording itself shows (conf not "tab"). Songs: capo = *Steal My Girl* (Gareth Evans, standard, capo 3, 815 key notes),
standard = *Imagine* (Gareth Evans, 679), nylon = *A soft collision of breath* (Evan Handyside, D G C F A C, 628).

## In short

1. **The hand's reach is a strong constraint, and Opus can check it.** The window (fretting-hand tips on a neck model set
   from a few named fret wires, margin 1, checked by a second blind Opus run) covers 0.995 / 1.000 / 0.998 of the fretted
   key notes and cuts the possible places per note from 3.46 / 3.62 / 3.24 to 1.53 / 1.45 / 1.24 (`HAND.md`). In the loop
   it is worth **+0.076** on the capo song (L2 0.859 against L4, the same loop with the hand off, 0.783) and +0.044 on
   standard (0.875 against 0.831); on the nylon song, played in open position, +0.003.
2. **The tuning is found the way a person finds it**, capo given: 18 of 18 open strings on the three songs, by both Opus
   conditions (`TUNING.md`; AO-082's best on the nylon song was 5 of 6), and **18 of 18 on the three held-out
   recordings**, two of them in tunings the finder was never tried on (E A D G A D, open G). A wrong tuning is costly: on
   the nylon song the plain solver falls from 0.801 to 0.619 (`LADDER.md`).
3. **Opus places notes better than a plain solver in every cell**, on the same inputs: the loop by +0.031 / +0.021 /
   +0.035, the whole-song session by +0.119 / +0.024 / +0.029 on the three songs and +0.087 / +0.119 / +0.026 on the
   held-out ones (September, Closer, Boats; on Boats the gain is notes kept, not places).
4. **One whole-song session beats bar by bar, at a fifth of the cost.** W2 (one Opus session, the loop's inputs for the
   whole song, 90 minutes allowed): 0.947 / 0.878 / 0.830 against the loop's 0.859 / 0.875 / 0.836; $8 to $11 and 28 to
   37 minutes a song against $30 to $55 and 2 to 3.5 hours of writer time. On standard and nylon the two are inside
   AO-082's run-to-run spread (0.011 to 0.037); on the capo song W2 is 0.088 ahead. The app runs the whole-song session.
5. **The loop does not learn as it goes.** Emptying the carried state before every bar (E6, capo song, the first 38
   bars) cost nothing: 0.843 against L2's 0.824 on the same 414 key notes. The per-bar score has no slope (-0.004 to
   +0.001 a bar on every run), and the capo song's last third is easier with the hand off too (L4 0.844 against 0.788 and
   0.716), so its rise (0.840 / 0.838 / 0.898) is the music. By the brief's rule, bar by bar is chunking, not learning.
6. **With the right notes, placing them is nearly solved.** Given the key's notes (an ASSISTED ceiling), the loop placed
   all 628 of the nylon song's notes right (L1, 1.000; the plain solver 0.967). What is left is the notes themselves and
   one kind of place error (below).
7. **On new recordings the method held on two of three and fell on one.** The frozen method's whole-song session:
   Boats 0.935, September 0.823, Closer 0.698 (mean 0.819; the three songs' mean 0.885). Closer is more than 0.10 below,
   so by the brief's rule the method was fitted to the songs it was built on, and the post says so. Boats sets no place
   problem at all (every matched note is in the right place, for the plain solver too), so placing was tested on two of
   the three. The notes are found well on all of them (onset F1 0.956 to 0.968 and 0.894 on Closer); where places drop,
   almost all of the drop is one error: an open string written where the player fretted the same pitch.

## The three songs

| run | capo | standard | nylon |
|---|---|---|---|
| plain solver, same inputs (E3 cell) | 0.828 / 0.837 | 0.854 / 0.880 | 0.801 / 0.842 |
| L4: the loop, hand window off | 0.783 / 0.786 | 0.831 / 0.863 | 0.833 / 0.876 |
| **L2: the loop, bar by bar** | **0.859 / 0.863** | **0.875 / 0.916** | **0.836 / 0.876** |
| **W2: one whole-song session** | **0.947 / 0.955** | **0.878 / 0.914** | **0.830 / 0.874** |
| L1: the loop with the key's notes (A) | | | 1.000 / 1.000 |

Each cell: main / heard. (A) = ASSISTED, a ceiling. The solver row is the loop's own packs' solver proposal, the same
notes, tuning, capo and window (`span_solver_tab.json`; on nylon the L4 run has none, the L2 row is used). L3 (the tuning
found) was not run on the three songs: the finder's tuning equals the given one on all of them, so L3's inputs are L2's.

| run | of matched | matched | onset F1 | right / wrong place / missed / invented | writer minutes | list cost | eval |
|---|---|---|---|---|---|---|---|
| L2 capo | 0.872 | 0.985 | 0.918 | 700 / 103 / 12 / 132 | 209.5 | $54.64 | e1705 |
| L2 standard | 0.941 | 0.929 | 0.901 | 590 / 37 / 52 / 95 | 150.5 | $37.41 | e1633 |
| L2 nylon | 0.983 | 0.850 | 0.845 | 525 / 9 / 94 / 102 | 121.7 | $30.46 | e1613 |
| L4 capo | 0.795 | 0.985 | 0.933 | 638 / 165 / 12 / 103 | 188.5 | $46.95 | e1643 |
| L4 standard | 0.891 | 0.932 | 0.909 | 560 / 69 / 50 / 85 | 146.2 | $35.20 | e1623 |
| L4 nylon | 0.983 | 0.847 | 0.841 | 523 / 9 / 96 / 105 | 130.0 | $32.18 | e1605 |
| W2 capo | 0.972 | | 0.929 | | 36.6 | $10.85 | e1661 |
| W2 standard | 0.940 | | 0.914 | | 34.6 | $8.86 | e1664 |
| W2 nylon | 0.974 | | 0.845 | | 27.9 | $8.20 | e1667 |
| L1 nylon (A) | 1.000 | 1.000 | 1.000 | 628 / 0 / 0 / 0 | 86.3 | $23.15 | e1597 |

Writer minutes and costs are the blind calls' own (list prices, `units_log.jsonl`; revisits included: capo's 22 revisits
cost $8.60). Counts for W2 are in `results.json`.

### What the loop's decisions did (L2, from `changes.csv`)

- **Keeping a note only another note model heard** was mostly wrong: capo 16 right against 52 invented, standard 7
  against 16, nylon 23 against 17.
- **Dropping a note** was mostly right: capo 24 invented notes dropped and no played note, standard 33 against 7, nylon
  10 against 6.
- **Moving a note to another place** was a coin toss on capo (13 wrong to right, 14 right to wrong), and helped on
  standard (13 to 0) and nylon (4 to 0).
- **Revisits** (the loop going back to an earlier bar, by habit or asked): capo 8 wrong to right, 1 invented note; the
  standard song had 2 revisits, the nylon song none.

### Faster later?

Minutes and output tokens a bar, first / middle / last third: capo 2.49 / 2.41 / 2.57 min (14.3k / 14.5k / 15.1k
tokens), standard 2.32 / 2.74 / 2.75 (13.6k / 15.9k / 16.6k), nylon 2.47 / 2.37 / 2.03 (14.2k / 13.6k / 11.7k). Only the
nylon song got cheaper; its score did not move with it (0.845 / 0.833 / 0.828).

## E6: what the carried state is worth

The capo song, units 0 to 37 (onsets before 118.77 s, 414 key notes, 391 heard), three runs cut to the same span and
scored with gtr-eval (`G/loop/score/e6-span/`):

| run | main | heard | right / wrong place / missed / invented | eval |
|---|---|---|---|---|
| L2 (state carried) | 0.824 | 0.824 | 341 / 69 / 4 / 65 | e1711, e1712 |
| **E6 (state emptied before every unit)** | **0.843** | **0.847** | 349 / 59 / 6 / 42 | e1715, e1716 |
| L4 (hand off) | 0.734 | 0.732 | 304 / 106 / 4 / 61 | e1713, e1714 |

E6 stopped at 38 of 73 units to save the weekly limit (39 writes and 8 revisits; $28.97 on units 0 to 37 against L2's
$29.94). The brief's second E6 arm (revisits off) and the repeat runs for the spread (E5) were not run, for the same
reason.

## The held-out recordings (E7)

Frozen at commit `497b3524` before the first held-out run (`code/` holds the snapshot and its SHA-256 sums). The keys were
built and checked by the NOTES session, audited here before any run, and are kept private (R2), never in this repo. Each
run: the capo given, everything else found: the tuning by the finder (blind Opus), the window by the hand tool (blind
anchors and a blind check), gaps-paper's notes after the hand filter.

| recording | tuning found (capo given) | W2 main / heard | of matched | onset F1 | plain solver | minutes, list cost |
|---|---|---|---|---|---|---|
| September (open G, capo 2) | 6 of 6 (D G D G B D) | 0.823 / 0.839 | 0.839 | 0.968 | 0.736 | 25.7, $6.09 |
| Closer (E A D G A D, capo 1) | 6 of 6 (E A D G A D) | 0.698 / 0.715 | 0.768 | 0.894 | 0.579 | 35.9, $6.85 |
| Three Little Boats (standard, a third player) | 6 of 6 (E A D G B E) | 0.935 / 0.942 | 1.000 | 0.956 | 0.909 | 23.0, $7.71 |

Evals: tunings e1717 to e1719; W2 tab e1670 (September), e1673 (Closer), e2140 (Boats; heard e2141, notes e2142, solver
e2143). On Boats every error of both W2 and the solver is a missed or invented note (W2 217 right, 0 wrong place, 15
missed, 5 invented): the tune sits in first position, where each pitch has one sensible place.

**The error that is left** (`STATE.md` 08:00): an open string where the player fretted the same pitch, inside the window.
September: 56 of its 66 wrong places are the key's string 2 fret 3 written as the open 1st string. Closer: 243 wrong
places, led by s4 f5 written as open s3 (53), s4 f7 as open s2 (32), s6 f10 as open s4 (31). The capo song's tap passages
were the same error in the loop runs. The hand window cannot tell these apart, because open strings are always allowed.
An exploratory rule that moves such a note to a fretted place when a fingertip sits there (`G/loop/work/fingers_place.py`,
made after the held-out results, so not a result) helped September (0.823 -> 0.883) and hurt the nylon song (0.830 ->
0.783), whose open strings really ring: MediaPipe's fingertips are about a string off. The fingers are the next
constraint to get right.

## What the app should do

- **Ask the person for the capo, nothing else.** The tuning finder named every string on six recordings.
- **Run one whole-song Opus session** with the notes (gaps-paper's, after the hand filter), the hand window, the tuning
  and the plain solver's proposal: the best score and the cheapest. Bar by bar adds cost and no learning.
- **Keep the hand window as a hard rule** for fretted notes; it is where Opus's gain on the capo song comes from.
- **Next: the fingers.** A finger-to-string reading good enough to tell an open string from the same pitch fretted.

## Cost

The loop's blind calls, at list prices (`units_log.jsonl`, `w2_summary.json`): L1, L2, L4 and E6 $289.07 (eight runs;
the first calls of the five paused runs $1.25 more), W2 $27.91 on the three songs and $20.65 held out,
three dry runs $7.65, the held-out prep's blind runs $39.58 (`HELDOUT-BLIND.md`). The whole session's agents are measured with the
`agent-metrics` skill at the end. The session's weekly Claude limit read 0.88 at 07:51 UTC; it resets 2026-12-02.
