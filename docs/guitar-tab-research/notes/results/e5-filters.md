# N-E5: what the guitar cannot play

Written 2026-11-27 by the N-E5 helper of the NOTES session (branch `research/guitar-notes`). Brief:
`../../sessions/NOTES.md`, section 4, E5. Work folder: `/home/user/notes/runs/e5/` (`PROGRESS.md`, `bin/`, `out/`,
`logs/`). Numbers: `/home/user/notes/runs/e5/e5.json`. Code: `/home/user/notes/runs/e5/bin/filters.py` (importable, also
a command line). Only numbers are here. The keys and the players' tabs stay out of the repo. No model was run: every
filter works on note lists that part 1 and N-E1 made.

## In short

- **No filter becomes a default by the brief's rule.** The rule asks a filter to remove 20 % of the vote's invented
  notes for under 1 % of its found notes. On the 2-of-3 vote of fl, gaps-paper and Transkun, every filter alone and
  every combination removes **0 of its 159 invented notes** (38 / 84 / 37 on capo / tuning / standard) and 0 found
  notes. LOOP's hand window removes none. Only the oracle combination (the key's own frets as the hand window) removes
  one, on the nylon song: 0.6 % of 159 (1.2 % of that song's 84).
- **Why: the vote invents only notes the guitar can play, where and when they sit.** All 159 lie between MIDI 43 and
  65. Each has 2 to 5 places on the neck (frets up to 20). Each has at least one place inside LOOP's window and inside the oracle
  window. The vote never has more than 5 notes attacked within 60 ms (3 on capo, 2 on the nylon song). What they
  are: 49 sit within 50 ms of a slap, 51 are an octave or an overtone of a key note that is sounding, 1 is an octave
  below a key note, 58 are other playable wrong notes. A guitar model rarely writes an impossible note, and the vote
  drops the few it does.
- **The filters never removed a real note.** Over six inputs and three songs (11,087 found notes), range, strings
  (the brief's reading), LOOP's hand window, the oracle window and every combination lost **0 found notes**. On
  GuitarSet dev24 the same: 0. (The stricter strings reading below lost 1.)
  The filters are free, and they help the single tools that write impossible notes:

  | input | onset F1 change, range + strings (capo / tuning / standard) | range + hand + strings, LOOP's window |
  |---|---|---|
  | guitar-gaps | +0.0114 / 0.0000 / +0.0113 | +0.0114 / 0.0000 / +0.0127 |
  | Transkun | +0.0033 / +0.0013 / +0.0020 | +0.0033 / +0.0026 / +0.0020 |
  | Basic Pitch (no hint) | +0.0242 / +0.0018 / +0.0019 | +0.0381 / +0.0149 / +0.0148 |
  | gaps-paper, fl | +0.0006 and +0.0005 on capo (one note each), 0 elsewhere | the same |
  | the vote | 0 / 0 / 0 | 0 / 0 / 0 |

- **The top limit removed 37 notes, none real.** guitar-gaps writes 29 notes at MIDI 108, the top of its 88-key roll;
  28 of them are within 50 ms of a slap. Transkun wrote 2 and Basic Pitch 6, all an octave or an overtone of a
  sounding note. No real note sits near the limit: the keys' highest notes are MIDI 67 / 62 / 67 against limits of
  84 / 80 / 84, and the 62,476 notes of all 360 GuitarSet takes reach MIDI 81. What the limit would remove that is
  real: natural harmonics high on the neck's short end. Which ones depends on the song (corrected by the checker, see
  "Checker"): with standard tuning and no capo, the 5th-fret harmonic and below on string 1, the 4th and below on
  string 2, about the 3rd on string 3; with capo 3, already the 7th-fret harmonic above the capo on string 1 (MIDI 86),
  the 5th on string 2 and the 4th on string 3; on the nylon song, the 5th-fret harmonic on strings 1 and 2. None is in
  these recordings.
- **The strings filter is nearly inert.** The brief's reading (a note holds its string until the next attack there,
  so only near-simultaneous notes can clash) removed 9 notes in all three songs, all Basic Pitch, all invented. A
  stricter reading that takes the estimates' offsets at face value removes real notes: with no release it costs the
  vote 17 found notes on the nylon song. Fitted, it falls back to the brief's reading.
- **LOOP's hand window works like the oracle window.** LOOP's published window and filter, run unchanged, remove the
  same notes as the oracle window from gaps-paper, fl, Transkun and the vote, 1 more from gaps and 9 more from Basic
  Pitch, and no found note. On the guitar models they remove the same notes as the range, plus 2 gaps notes on
  standard. On the vote they remove nothing. LOOP's HAND.md found the same for chain-2's notes.
- **Wrong tuning.** The nylon song read as standard tuning: the low limit (E2) drops every one of the key's 37 D2
  notes. The vote loses 30 found notes (-0.0305), gaps-paper 35 (-0.0347). The strings filter changes nothing. Read as
  D G C F A D (both blind arms' answer), nothing changes against the right tuning: same low limit, and the top limit
  82 instead of 80 removes the same notes. A wrong tuning shows in these filters only through the low limit, and only
  when the guess puts the lowest string above the real one.
- **Time.** Under 40 ms a song for any filter, on one core.

## What was run

**Inputs.** Six note lists per song, all made before E5. A conf for each note is needed by the strings filter
("the weakest goes").

| id | tool | note list | conf |
|---|---|---|---|
| gaps-paper | guitar-gaps-paper (Riley et al., 12,200 iterations) | `/home/user/notes/runs/<S>/riley-gaps-paper/<S>.notes.csv` | its conf column |
| fl | guitar-fl | `.../riley-fl/` | its conf column |
| gaps | guitar-gaps | `.../riley-gaps/` | its conf column |
| transkun | Transkun 2.0.1 (step 2's n-04, as E0 rescored it) | `/home/user/notes/runs/e0/rescore/<S>/n-04/bd/notes.csv` | the MIDI velocity / 127 from `n-04/<S>.transkun.mid` (every note matched within 2 ms) |
| bp | Basic Pitch 0.4.0, no range hint (n-01) | `/home/user/notes/runs/e0/rescore/<S>/n-01/bd/notes.csv` | the velocity / 127 from its `<S>_basic_pitch.csv` (every note matched) |
| vote | 2-of-3 vote of fl, gaps-paper, Transkun, median onset | rebuilt with N-E1's clustering (`bin/e5lib.py make_vote`); equal note for note to N-E1's `vote-fl-gp-tk-median-loso` on all three songs | support = tools in the cluster (2 or 3), conf = the mean conf of its members |

Before any filter the six score as before: 0.9536 / 0.8217 / 0.8955 (gaps-paper), 0.9199 / 0.7976 / 0.8917 (fl),
0.9189 / 0.8299 / 0.8787 (gaps), 0.8959 / 0.7849 / 0.8659 (Transkun), 0.6887 / 0.6257 / 0.6632 (Basic Pitch),
0.9572 / 0.8123 / 0.9209 (vote).

**The filters** (`bin/filters.py`; every one takes the tuning and the capo as given).

- **Range.** A note below the lowest open string with the capo (MIDI 43 / 38 / 40) or above fret 20 of string 1,
  counted from the nut (MIDI 84 / 80 / 84), is dropped. The capo adds no frets, so fret 20 is counted from the nut.
- **Strings.** Notes sounding at once must fit on distinct strings of the tuning. A place is a string and a fret from
  the capo's fret up to fret 20 (the capo raises every string's lowest fret). A note holds its string until the next
  attack on that string or its offset. So a later attack never clashes with a note that is only ringing: it ends it.
  What cannot happen is two notes on one string whose onsets are less than a gap apart while the first still sounds.
  A small search per group of such notes: notes go in strongest first (support, then conf), and a note is dropped when
  it cannot be placed together with the stronger notes already kept. So the weakest note of a set that does not fit
  goes. A note no string can play is left to the range filter.
- **Hand reach.** LOOP's format: `hand_window.csv` with t, lo, hi, conf, lost at 30 rows a second, frets counted from
  the capo, open strings always allowed; lost rows or an empty lo give no constraint; the row nearest the note's onset
  is used. A note that no open string and no fretted place inside lo..hi can play is dropped. Two windows:
  - **LOOP's**, published on `research/guitar-tab-loop` (commit db507bf2, "after Opus's check, margin 1, 30 rows a
    second", LOOP's default) at `docs/guitar-tab-research/loop/hand/<S>/`. The three files and `hand_filter.py` match
    the SHA-256 in LOOP's `hand.json`. I ran LOOP's `hand_filter.main` unchanged (imported, called with its own
    arguments). My own reader in `filters.py` gives the same kept notes on all 18 song and input pairs.
  - **ASSISTED, an ORACLE** (it reads the key, never to be frozen): per bar of the key's downbeats, the key's fretted
    frets give lo = lowest fret - 1 (at least 1) and hi = highest fret + 1; open strings always allowed. A row takes the
    union of the bars within 50 ms of it, so a note estimated within the scoring tolerance of a bar line is judged by
    both bars. No bar here lacks a fretted note. Written in LOOP's format to `out/hand_asst/<S>/hand_window.csv` and run
    through LOOP's code, like LOOP's window.
- **Combinations.** range + strings; range, then the hand, then strings with each note's places limited to the hand
  window ("all three"), with LOOP's window and with the oracle window.

**Fitting.** The strings filter has one number, the gap that counts as "at once". The stricter variant has a second,
the release (below). Both were fitted on dev24 and by leave-one-song-out (LOSO: fit on two songs, score the third). The
song numbers below use the LOSO gap: 0.06 s for capo and tuning, 0.02 s for standard. The range limits come from the
brief. The hand window's margin (1 fret) comes from the brief and from LOOP.

**Scoring.** gtr-eval 0.12.1 `notes --no-ledger`: onset F1 at 50 ms and 50 cents, offsets ignored, one to one.
Matching in process (N-E1's `e1lib`, a copy of gtr-eval's) for the tables. Then every filtered list, whole song and
30 s segment, was re-scored with the gtr-eval CLI: **504 scores, 0 differences** above 1e-6 (gtr-run **r1557**, 238.7 s
wall on 2 cores; `out/cli_check.json`). Segment keys: E0's cuts made with `crop_truth.py` (capo from 12.76 s, tuning
25.0 s, standard 0.0 s). "Found lost" = found notes before minus after, re-matched. "Invented removed" = invented
before minus after. Slaps: invented within 50 ms of a key `taps` event, as `taps_invented.py` counts them.

Runs: fit gtr-run **r1554** (10.2 s; r1551 to r1553 were earlier grids, superseded), filters **r1555** (5.6 s, all
conditions and the wrong-tuning row), CLI re-score **r1557**.

## 1. Fitting the strings filter

**The gap.** On dev24 the filter removes the same 2 notes (fl, both invented) at every gap from 0.01 to 0.12 s: dev24
cannot choose. Applied to the dev24 key itself, with every onset moved by a random 15 ms (5 seeds), it drops no key
note up to 0.03 s, 0.2 at 0.04 to 0.05 s, 0.4 at 0.06 s and 2.0 at 0.08 s. The shortest same-string re-attack in
the dev24 key is 0.076 s (69 of 2,742 re-attacks are under 0.1 s). A longer gap would be a limit on re-attacking a
string, which real playing breaks, not "at once". So the gap is fitted below 0.076 s.

| gap (s) | dev24: removed (found lost) | dev24 F1 change, mean of six inputs | dev24 key, onsets moved 15 ms: key notes dropped (mean of 5 seeds, of 2,860) | songs: removed (found lost), capo / tuning / standard |
|---|---|---|---|---|
| 0.01 | 2 (0) | +0.00003 | 0.0 | 3 (0) / 0 (0) / 2 (0) |
| 0.02 | 2 (0) | +0.00003 | 0.0 | 5 (0) / 0 (0) / 4 (0) |
| 0.03 | 2 (0) | +0.00003 | 0.0 | 5 (0) / 0 (0) / 7 (0) |
| 0.04 | 2 (0) | +0.00003 | 0.2 | 5 (0) / 0 (0) / 9 (0) |
| 0.05 | 2 (0) | +0.00003 | 0.2 | 5 (0) / 0 (0) / 10 (0) |
| 0.06 | 2 (0) | +0.00003 | 0.4 | 5 (0) / 0 (0) / 11 (0) |
| 0.08 (above the cap) | 2 (0) | +0.00003 | 2.0 | 5 (0) / 0 (0) / 13 (0) |
| 0.1 (above the cap) | 2 (0) | +0.00003 | 3.2 | 7 (0) / 0 (0) / 14 (0) |
| 0.3 (above the cap) | 23 (7) | +0.00006 | 22.6 | 15 (0) / 0 (0) / 22 (0) |

Up to 0.15 s every note removed on the songs is a Basic Pitch note (at 0.2 and 0.3 s also 1 and 2 fl notes). Picks
(ties go to the gap that removes the fewest notes): dev24 0.01 (all tied); LOSO capo 0.06, tuning 0.06, standard
0.02; frozen for later stages (the three songs pooled, within the cap) **0.06 s**, `DEFAULT_GAP` in `filters.py`.
With any of these gaps nothing changes for the five other inputs. On the vote nothing changes at any gap up to 0.3 s.

**The stricter variant: offsets at face value.** Here a note holds its string until its own offset minus a release,
and a later attack cannot take it. The estimates' offsets are long (let-ring decay), and the player ends notes by
re-plucking. So with no release this drops real notes:

| release (s) | dev24: removed (found lost) | dev24 F1 change | songs: removed (found lost), capo / tuning / standard | the vote on the nylon song: removed (found lost) |
|---|---|---|---|---|
| 0.0 | 45 (22) | -0.00027 | 32 (7) / 83 (77) / 84 (37) | 18 (17) |
| 0.05 | 20 (10) | -0.00013 | 22 (6) / 52 (47) / 50 (17) | 8 (7) |
| 0.1 | 16 (9) | -0.00015 | 18 (6) / 29 (25) / 40 (12) | 2 (1) |
| 0.2 | 10 (6) | -0.00011 | 11 (5) / 10 (8) / 27 (7) | 0 (0) |
| 0.5 | 4 (2) | -0.00002 | 7 (2) / 1 (0) / 14 (5) | 0 (0) |
| 1.0 | 2 (0) | +0.00003 | 5 (0) / 1 (0) / 9 (1) | 0 (0) |
| 2.0 | 2 (0) | +0.00003 | 5 (0) / 0 (0) / 8 (1) | 0 (0) |

dev24 picks 2.0 s and LOSO picks 1.0 s in every fold, where it is almost the brief's reading. It is reported as a row
below and not used further. (The onset gap of this variant was held at 0.03 s.)

## 2. Each filter alone and combined

**Invented notes removed (share) / found notes lost**, the three songs pooled. The vote's row is the brief's rule.

| filter | vote | gaps-paper | fl | gaps | transkun | bp |
|---|---|---|---|---|---|---|
| invented / found before | 159 / 1881 | 166 / 1861 | 291 / 1884 | 282 / 1891 | 248 / 1766 | 1507 / 1804 |
| range, low limit only | 0 (0.0 %) / 0 | 1 (0.6 %) / 0 | 1 (0.3 %) / 0 | 9 (3.2 %) / 0 | 9 (3.6 %) / 0 | 71 (4.7 %) / 0 |
| range, top limit only | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 29 (10.3 %) / 0 | 2 (0.8 %) / 0 | 6 (0.4 %) / 0 |
| range | 0 (0.0 %) / 0 | 1 (0.6 %) / 0 | 1 (0.3 %) / 0 | 38 (13.5 %) / 0 | 11 (4.4 %) / 0 | 77 (5.1 %) / 0 |
| strings (gap by LOSO) | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 9 (0.6 %) / 0 |
| strings (frozen gap 0.06 s) | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 16 (1.1 %) / 0 |
| strings, offsets at face value (release by LOSO, 1.0 s) | 0 (0.0 %) / 0 | 0 (0.0 %) / 0 | 1 (0.3 %) / 0 | 0 (0.0 %) / 1 | 0 (0.0 %) / 0 | 13 (0.9 %) / 0 |
| hand, LOOP's window | 0 (0.0 %) / 0 | 1 (0.6 %) / 0 | 1 (0.3 %) / 0 | 40 (14.2 %) / 0 | 11 (4.4 %) / 0 | 177 (11.7 %) / 0 |
| hand, assisted window (ORACLE) | 0 (0.0 %) / 0 | 1 (0.6 %) / 0 | 1 (0.3 %) / 0 | 39 (13.8 %) / 0 | 11 (4.4 %) / 0 | 168 (11.1 %) / 0 |
| range + strings | 0 (0.0 %) / 0 | 1 (0.6 %) / 0 | 1 (0.3 %) / 0 | 38 (13.5 %) / 0 | 11 (4.4 %) / 0 | 86 (5.7 %) / 0 |
| range + hand + strings, LOOP's window | 0 (0.0 %) / 0 | 1 (0.6 %) / 0 | 1 (0.3 %) / 0 | 40 (14.2 %) / 0 | 13 (5.2 %) / 0 | 190 (12.6 %) / 0 |
| range + hand + strings, assisted window (ORACLE) | 1 (0.6 %) / 0 | 1 (0.6 %) / 0 | 1 (0.3 %) / 0 | 39 (13.8 %) / 0 | 13 (5.2 %) / 0 | 189 (12.5 %) / 0 |

No row reaches 20 % on any input; on the vote no row passes 0.6 %, pooled or on any one song. No heard note was lost
by any filter except the offsets-at-face-value row (1 gaps note on standard).

**Onset F1 after each filter, whole songs.** "none" is the input as it was.

**capo** (strings gap 0.06 s)

| input | none | range | strings | hand, LOOP's window | hand, assisted (ORACLE) | range + strings | all three, LOOP's window | all three, assisted (ORACLE) |
|---|---|---|---|---|---|---|---|---|
| vote | 0.9572 | 0.9572 | 0.9572 | 0.9572 | 0.9572 | 0.9572 | 0.9572 | 0.9572 |
| gaps-paper | 0.9536 | 0.9542 | 0.9536 | 0.9542 | 0.9542 | 0.9542 | 0.9542 | 0.9542 |
| fl | 0.9199 | 0.9204 | 0.9199 | 0.9204 | 0.9204 | 0.9204 | 0.9204 | 0.9204 |
| gaps | 0.9189 | 0.9303 | 0.9189 | 0.9303 | 0.9303 | 0.9303 | 0.9303 | 0.9303 |
| transkun | 0.8959 | 0.8992 | 0.8959 | 0.8992 | 0.8992 | 0.8992 | 0.8992 | 0.8992 |
| bp | 0.6887 | 0.7112 | 0.6902 | 0.7244 | 0.7231 | 0.7129 | 0.7268 | 0.7285 |

**tuning** (strings gap 0.06 s)

| input | none | range | strings | hand, LOOP's window | hand, assisted (ORACLE) | range + strings | all three, LOOP's window | all three, assisted (ORACLE) |
|---|---|---|---|---|---|---|---|---|
| vote | 0.8123 | 0.8123 | 0.8123 | 0.8123 | 0.8123 | 0.8123 | 0.8123 | 0.8130 |
| gaps-paper | 0.8217 | 0.8217 | 0.8217 | 0.8217 | 0.8217 | 0.8217 | 0.8217 | 0.8217 |
| fl | 0.7976 | 0.7976 | 0.7976 | 0.7976 | 0.7976 | 0.7976 | 0.7976 | 0.7976 |
| gaps | 0.8299 | 0.8299 | 0.8299 | 0.8299 | 0.8299 | 0.8299 | 0.8299 | 0.8299 |
| transkun | 0.7849 | 0.7862 | 0.7849 | 0.7862 | 0.7862 | 0.7862 | 0.7875 | 0.7875 |
| bp | 0.6257 | 0.6275 | 0.6257 | 0.6402 | 0.6406 | 0.6275 | 0.6406 | 0.6411 |

**standard** (strings gap 0.02 s)

| input | none | range | strings | hand, LOOP's window | hand, assisted (ORACLE) | range + strings | all three, LOOP's window | all three, assisted (ORACLE) |
|---|---|---|---|---|---|---|---|---|
| vote | 0.9209 | 0.9209 | 0.9209 | 0.9209 | 0.9209 | 0.9209 | 0.9209 | 0.9209 |
| gaps-paper | 0.8955 | 0.8955 | 0.8955 | 0.8955 | 0.8955 | 0.8955 | 0.8955 | 0.8955 |
| fl | 0.8917 | 0.8917 | 0.8917 | 0.8917 | 0.8917 | 0.8917 | 0.8917 | 0.8917 |
| gaps | 0.8787 | 0.8901 | 0.8787 | 0.8914 | 0.8907 | 0.8901 | 0.8914 | 0.8907 |
| transkun | 0.8659 | 0.8679 | 0.8659 | 0.8679 | 0.8679 | 0.8679 | 0.8679 | 0.8679 |
| bp | 0.6632 | 0.6636 | 0.6648 | 0.6760 | 0.6736 | 0.6651 | 0.6780 | 0.6752 |

The oracle window's one vote note on tuning was matched to a key note that a second vote note of the same pitch also
reaches, so its removal loses no found note.

**30 s segments** (the whole-song output cropped, scored against the segment key):

| song | input | none | range | range + strings | hand, LOOP's window | all three, LOOP's window | all three, ORACLE |
|---|---|---|---|---|---|---|---|
| capo | vote | 0.9552 | 0.9552 | 0.9552 | 0.9552 | 0.9552 | 0.9552 |
| capo | gaps-paper | 0.9458 | 0.9458 | 0.9458 | 0.9458 | 0.9458 | 0.9458 |
| capo | gaps | 0.9224 | 0.9712 | 0.9712 | 0.9712 | 0.9712 | 0.9712 |
| capo | transkun | 0.8976 | 0.9109 | 0.9109 | 0.9109 | 0.9109 | 0.9109 |
| capo | bp | 0.6739 | 0.6915 | 0.6915 | 0.7045 | 0.7045 | 0.7045 |
| tuning | vote | 0.8155 | 0.8155 | 0.8155 | 0.8155 | 0.8155 | 0.8155 |
| tuning | transkun | 0.7905 | 0.7981 | 0.7981 | 0.7981 | 0.8019 | 0.8019 |
| tuning | bp | 0.6586 | 0.6586 | 0.6586 | 0.6721 | 0.6721 | 0.6721 |
| standard | vote | 0.9960 | 0.9960 | 0.9960 | 0.9960 | 0.9960 | 0.9960 |
| standard | bp | 0.7446 | 0.7469 | 0.7492 | 0.7857 | 0.7857 | 0.7832 |

The rows not shown (gaps-paper, fl and gaps on tuning and standard, fl on capo, Transkun on standard) do not change.

**GuitarSet dev24** (standard tuning, no capo; mean of the 24 per-clip F1): range removes 20 gaps notes (+0.0020),
4 Transkun notes (+0.0005) and 1 Basic Pitch note; strings at 0.06 s removes 2 fl notes (+0.0002). No found note is
lost, and gaps-paper and the vote do not change (`out/dev24.json`).

## 3. The range: what each limit removes

| song | input | low limit: removed | what they are | top limit: removed | what they are |
|---|---|---|---|---|---|
| capo | gaps-paper | 1 (MIDI 39) | at a slap | 0 | |
| capo | fl | 1 (41) | at a slap | 0 | |
| capo | gaps | 9 (all 41) | 1 at a slap, 8 other | 12 (all 108) | all at slaps |
| capo | transkun | 6 (34, 39) | 2 at slaps, 4 an octave below a key note | 0 | |
| capo | bp | 71 | 39 at slaps, 3 an octave below a key note, 29 other | 1 (89) | an overtone of a sounding note |
| tuning | transkun | 0 | | 2 (93, 96) | overtones of sounding notes |
| tuning | bp | 0 | | 4 (84) | overtones of sounding notes |
| standard | gaps | 0 | | 17 (all 108) | 16 at slaps, 1 other |
| standard | transkun | 3 (29, 31, 36) | 2 at slaps, 1 other | 0 | |
| standard | bp | 0 | | 1 (85) | an overtone of a sounding note |

"An overtone of a sounding note" here means 12, 19, 24, 28, 31, 34 or 36 semitones above a key note sounding at the
onset (from its onset to 50 ms after its let-ring offset); it is a loose label. Every removed note was invented. **Real
notes the top limit removes: none here.** The keys' highest notes are MIDI 67 / 62 / 67; all of GuitarSet's 62,476
notes are at MIDI 81 or below. Natural harmonics are real notes above fret 20's pitch. In standard tuning with no
capo, on string 1 the harmonics at the 5th fret (two octaves up, open + 24), the 4th (open + 28) and the 3rd (open +
31) are above the limit, on string 2 those at the 4th fret and below, on string 3 those at about the 3rd fret and
below. The capo makes it worse, because it raises the open strings but not the limit: with capo 3 (limit 84) the
harmonic at the 7th fret above the capo on string 1 (67 + 19 = 86), the 5th above the capo on string 2 (62 + 24 = 86)
and the 4th on string 3 (58 + 28 = 86) are all removed. On the nylon song (limit 80) the 5th-fret harmonics of
strings 1 and 2 (84, 81) are removed. (This paragraph was corrected by the checker.) A player who uses them would lose
them to this filter; none of the three recordings does. The low limit removed nothing real because nothing is played below the lowest open string.

**guitar-gaps marks slaps as MIDI 108.** Its 29 notes at MIDI 108 (C8, the top key of the piano roll it was trained
on), 28 of them within 50 ms of a slap, are the largest single thing the range removes. That is why gaps gains
+0.011 on capo and standard and +0.049 on the capo segment.

## 4. The strings filter

With the right tuning, the brief's reading removed 9 notes in all (Basic Pitch: 5 on capo, 4 on standard), every one
invented: 6 at slaps, 2 an octave below a key note, 1 other. The pitches are 40, 43 and 46: low notes that only
string 6 can play (MIDI 43 to 47 with the capo on fret 3, 40 to 44 without), each clashing within the gap with a
stronger note that needs the same string. It removed nothing from the guitar models or the vote on any song. The vote
never has more than 5 notes attacked within 60 ms (2 on the nylon song, whose chords are rolled), so 6 strings are
never short. Applied to the three keys themselves, at every gap and release in section 1, it drops no key note.

Inside "all three", where each note may use only its places inside the hand window, the strings step removes more:
2 Transkun notes on the nylon song (MIDI 53, invented) and 1 to 7 Basic Pitch notes a song with LOOP's window (1 to 16
with the oracle window). On the vote it removes nothing with LOOP's window; with the oracle window it removes the one
vote note of section 2.

## 5. The hand window, LOOP's and the oracle

- LOOP's window (`after Opus's check, margin 1`) and the oracle window remove the same notes from gaps-paper, fl,
  Transkun and the vote (none). On gaps LOOP's removes 40 and the oracle 39 (39 in both); on Basic Pitch 177 and 168
  (164 in both). Neither loses a found note.
- On gaps-paper, fl, gaps and Transkun, the hand removes what the range removes, plus 2 gaps notes on standard (MIDI
  69). Notes outside the range have no place inside any window, so the hand filter repeats the range.
- On Basic Pitch the hand removes 2.3 times what the range removes (177 against 77, every range note among them). Of
  the 177: 77 an octave or overtone of a sounding key note (MIDI 67 to 85, out of the hand's reach at that moment), 62
  at slaps, 5 an octave below a key note, 33 other.
- On the vote, nothing. The vote's 159 invented notes have 1.3 to 1.7 places inside LOOP's window on average, 94 of
  them exactly one, none zero (oracle: 1.3 to 1.9, none zero).
- Both windows drop no key note on any song (any place counts; `out/diag.json`).

## 6. Why the vote's invented notes survive

From `bin/diag.py` (`out/diag.json`), the vote's invented notes:

| song | invented | at a slap | an octave or overtone of a sounding key note | other | pitch range | places on the neck, mean (min) | places inside LOOP's window, mean (none) | most vote notes attacked within 60 ms of one |
|---|---|---|---|---|---|---|---|---|
| capo | 38 | 18 | 1 | 19 | 48-65 | 3.1 (2) | 1.66 (0) | 3 |
| tuning | 84 | 0 | 50 (49 above, 1 an octave below) | 34 | 43-62 | 4.3 (2) | 1.36 (0) | 2 |
| standard | 37 | 31 | 1 | 5 | 45-64 | 3.7 (2) | 1.32 (0) | 5 |

The vote's wrong notes are of a kind the guitar can sound: slap notes at playable pitches, octaves and twelfths of
ringing strings on the nylon song (E1 found the same for gaps), and plausible neighbours. Removing them needs evidence
from the sound (E6's slap test, E4's residual), not from the instrument.

## 7. The wrong-tuning row

The nylon song (right tuning D G C F A C, MIDI 38 43 48 53 57 60, no capo) read with a wrong tuning. Removed / found
lost / onset F1 change, whole song:

| reading | input | F1, right tuning | range | strings | range + strings |
|---|---|---|---|---|---|
| standard (40 45 50 55 59 64) | vote | 0.8123 | 30 / 30 / -0.0305 | 0 / 0 / 0.0000 | 30 / 30 / -0.0305 |
| standard | gaps-paper | 0.8217 | 36 / 35 / -0.0347 | 0 / 0 / 0.0000 | 36 / 35 / -0.0347 |
| standard | fl | 0.7976 | 30 / 30 / -0.0312 | 0 / 0 / 0.0000 | 30 / 30 / -0.0312 |
| standard | gaps | 0.8299 | 37 / 35 / -0.0325 | 0 / 0 / 0.0000 | 37 / 35 / -0.0325 |
| standard | transkun | 0.7849 | 30 / 27 / -0.0256 | 0 / 0 / 0.0000 | 30 / 27 / -0.0256 |
| standard | bp | 0.6257 | 53 / 25 / -0.0124 | 0 / 0 / 0.0000 | 53 / 25 / -0.0124 |
| D G C F A D (38 43 48 53 57 62) | vote | 0.8123 | 0 / 0 / 0.0000 | 0 / 0 / 0.0000 | 0 / 0 / 0.0000 |
| D G C F A D | gaps-paper, fl, gaps | | 0 / 0 / 0.0000 | 0 / 0 / 0.0000 | 0 / 0 / 0.0000 |
| D G C F A D | transkun | 0.7849 | 2 / 0 / +0.0013 | 0 / 0 / 0.0000 | 2 / 0 / +0.0013 |
| D G C F A D | bp | 0.6257 | 4 / 0 / +0.0018 | 0 / 0 / 0.0000 | 4 / 0 / +0.0018 |

- Read as standard tuning, the lowest note allowed is E2 (40), and the song's 37 key notes at D2 (38) are all outside
  it. Every model finds 25 to 35 of them, and the range throws them away. On the 30 s segment the vote drops from
  0.8155 to 0.7980 (-0.0175). The strings filter with this tuning drops no estimate and no key note.
- Read as D G C F A D, the low limit is the right one, and the top limit (82) removes the same Transkun and Basic Pitch
  notes as the right tuning's 80 does. The results equal the right tuning's.
- So these filters cannot tell a wrong tuning except when the guess raises the lowest string. Then they hurt: a filter
  run with the blind arms' standard-tuning guess would cost 0.03 F1 on this song. With the tuning given, as the brief
  rules, this does not arise.

## 8. Seconds per filter

In process, one core, per song and input, median (largest) over the 18 song and input pairs (`run.json`; the vote and
loading are not counted):

| filter | seconds a song |
|---|---|
| range | 0.0003 (0.0005) |
| strings | 0.0023 (0.0043) |
| strings, offsets at face value | 0.0022 (0.0201) |
| hand, LOOP's code (it reads its 5,300 to 6,800-row window file each call) | 0.013 (0.032) |
| hand, oracle window, LOOP's code | 0.011 (0.015) |
| range + strings | 0.0023 (0.0043) |
| all three, LOOP's window | 0.016 (0.037) |
| all three, oracle window | 0.014 (0.035) |

## What is uncertain

- **Three songs, few events.** Every change above is a handful of notes; the vote's zero is the one robust result.
  Held-out songs may hold real harmonics or very low notes; the range would then cost real notes.
- **The gap's fit is weak.** dev24 cannot choose it (all tied), and LOSO's choice rests only on Basic Pitch notes. The
  cap at 0.076 s is a physical argument from the dev24 key, not a score. For every guitar model and the vote, any gap
  from 0.01 to 0.12 s gives the same output.
- **The oracle window** is my reading of "each bar's key frets +-1": the ±50 ms union across bar lines is my
  choice, so estimates a little early at a bar line are not dropped. A strict per-bar window could remove some found
  notes; it was not run.
- **The "what they are" labels** for removed and invented notes (slap, overtone, octave) are window tests on the key,
  not ear checks.
- **"Real" means in the key.** A removed note counts as invented when no key note matches it. The keys' tab-only notes
  (54 / 72 / 96) are counted as real, and E0 listed timing suspects on the nylon song; none of the removed notes was
  checked by ear.

## Handoff for LOOP

`/home/user/gtv/notes/<S>/<method>/notes.csv` (onset, offset, pitch, support, conf) with `source.json` beside it:

| method | what | notes capo / tuning / standard | onset F1 |
|---|---|---|---|
| `e5-vote3-rs` | the 2-of-3 vote of fl, gaps-paper, Transkun, after range + strings (LOSO gap); identical to the vote, now with support and conf | 821 / 571 / 648 | 0.9572 / 0.8123 / 0.9209 |
| `e5-gaps-paper-rs` | gaps-paper after range + strings | 822 / 572 / 632 | 0.9542 / 0.8217 / 0.8955 |

## Files

- Code: `/home/user/notes/runs/e5/bin/filters.py` (the filters, importable; also a CLI), `e5lib.py` (inputs and conf),
  `fit.py` (the gap and release fits), `run_e5.py` (every condition and the wrong-tuning row), `score_cli.py` (the
  gtr-eval CLI check), `diag.py`, `dev24.py`, `collect.py`, `handoff.py`; `explore.py` was a first look, not of record.
- Numbers: `/home/user/notes/runs/e5/e5.json` (everything), `out/fit.json`, `out/run.json`, `out/cli_check.json`,
  `out/diag.json`, `out/dev24.json`.
- Note lists: `out/notes/<condition>/<S>.<input>.csv` and `.seg30.csv`; removed notes with the reason and what they
  were in `out/removed/`; the oracle windows `out/hand_asst/<S>/hand_window.csv`; LOOP's files as copied
  `loop_hand/`. Logs in `logs/`.

## Checker

Checked on 2026-11-27 by an independent checker of the NOTES session (work folder `/home/user/notes/runs/check-e5/`,
numbers `check.json`). The checker wrote its own loaders, its own range, strings and hand filters and its own scoring
(mir_eval `match_notes`, 50 ms, 50 cents, offsets ignored). It did not use E5's or E1's code.

**What holds.**

| check | how | result |
|---|---|---|
| inputs before any filter | own loaders, own scoring, 6 inputs x 3 songs | all 18 F1 equal the record; the vote has 159 invented and 1,881 found notes |
| E5's filtered note lists | every whole-song list in `out/notes/` (252), re-scored with own code | every F1 in the record's tables equal |
| range filter | own code, every input and song | the same notes kept as E5's, in every case |
| strings filter | own code, a stricter reading (onsets chained in groups, then string matching) | equal to E5's except 2 more Basic Pitch notes on standard, both invented; nothing changes on the vote or the guitar models |
| hand filter | own reader of LOOP's file, and own oracle window | the same removals as the record (gaps 40 / 39, Basic Pitch 177 / 168 pooled); 0 key notes dropped |
| wrong-tuning row | own code | every number in section 7 equal |
| 30 s segments | E5's segment lists, own scoring | equal (Basic Pitch capo range 0.69145, printed 0.6915) |
| gtr-eval CLI | 6 lists scored with the CLI by the checker | equal |
| dev24, range | own code, mean of 24 per-clip F1 | gaps 20 removed (+0.0020), Transkun 4 (+0.0005), Basic Pitch 1; 0 found lost |
| gaps at MIDI 108 | own count against the keys' taps | 29 notes, 28 within 50 ms of a slap |
| GuitarSet | all 360 annotation files | 62,476 notes, highest MIDI 80.98 |
| the gap fit | E5's `fit.py` run again into the checker's folder | `fit.json` identical (choices, dev24 and song grids, key checks) |
| the gap fit, own code | LOSO with the checker's stricter filter, same objective and tie rule | picks 0.05 / 0.05 / 0.02 s (E5: 0.06 / 0.06 / 0.02); the difference comes from the stricter filter, and no pick changes any guitar-model or vote output |
| run ids | gtr-run ledger | r1551 to r1555 and r1557 there, walls as stated |
| handoff | `/home/user/gtv/notes/<S>/e5-vote3-rs/` and `e5-gaps-paper-rs/` | columns onset, offset, pitch, support, conf, no empty values, `source.json` beside; F1 as in the handoff table |
| the repo | the record only; private never-publish list matched as text | numbers only; no key note lists, tab text, credentials or private hosts; 0 never-publish matches |

**The main result stands.** No filter removes any of the vote's 159 invented notes, except the oracle combination (1). No
filter alone or combined (brief's reading) loses a found note.

**Corrected or added.**

- **Natural harmonics.** The record listed only standard tuning's string 1 and string 2 cases. With the capo the limit
  bites much earlier: on the capo song the very common harmonic at the 7th fret above the capo on string 1 sounds MIDI
  86, above the limit of 84. The two paragraphs are corrected above. None of the three recordings uses harmonics, so no
  number changes.
- **Places on the neck.** The vote's invented notes have 2 to 5 places with frets up to 20, not 2 to 6. Corrected
  above.
- **Run r1556 failed** (gtr-eval, exit 1, 0.05 s). r1557 is the same job, re-run. The record did not mention it.
- **LOOP's commit.** db507bf2's commit message is "LOOP: E2 done, E1 published, ...". The phrase "after Opus's check,
  margin 1, 30 rows a second" is the name of LOOP's default window in LOOP's `HAND.md`, not the commit message. The
  files on the branch match E5's copies (SHA-256 checked again by the checker).
- **The "strings (frozen gap 0.06 s)" row** of section 2 uses a gap fitted on the three songs pooled, so it is in
  sample for these songs. The result of record is the LOSO row. The rows differ only for Basic Pitch.
- **The strict oracle window,** which the record lists as not run: the checker ran it (each bar's key frets +-1, no
  joining across bar lines). It drops 0 key notes and removes the same notes as the record's oracle window, except 1
  more Basic Pitch note on capo (invented). The vote: 0 removed.
- **LOOP's margin.** LOOP chose its default (margin 1) from coverage of the key notes on these same three songs
  (`HAND.md`). So "LOOP's window" is not fully out of sample here either. It removes nothing from the vote, so the
  conclusion does not change.
