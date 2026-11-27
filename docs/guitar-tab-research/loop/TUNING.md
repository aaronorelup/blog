# TUNING: finding the tuning, capo given (the record of E2)

E2 of `../sessions/LOOP.md`: can the loop find the six open strings the way a person does (open strings seen and
heard, one clear chord shape, the notes against the hand's reach, the fingers where tunings tie), capo given (3 / 0 /
0)? E2's record, checked: every answer was scored again by an agent that made none. G = `/home/user/gtv`. Every number
is in `tuning.json` with its file; the tools and runs in detail: `E2-TUNING.md`, `e2-blind-runs.json`.

The keys' tunings: the capo song and the standard song E2 A2 D3 G3 B3 E4, the nylon song D2 G2 C3 F3 A3 C4.

**In short.** Both Opus conditions named all 18 strings of the three songs. AO-082's best showing on the nylon song
was 5 of 6. The code finder with the finger rule named 16 or 17 of 18 (13 or 17 on E1's published windows); without
it, 18 of 18, but on the steel songs only through its tie-break, not from evidence. By the plan's rule, "tuning found"
becomes the app's default, found by the Opus "everything" step. One run each, Opus on E1's development windows: the
held-out set has to confirm it.

## How it was scored

- `gtr-eval tuning` (0.12.1, ledger `G/loop/ledger/evals.jsonl`) with the capo given and t-01's librosa offset in
  cents (reused, not re-measured), plus my own count of open strings right of 6. Script `G/work/e2-record/rescore.py`,
  output `G/loop/e2/rescore/rescore.json`.
- The answers were read back from their own files: each blind run's `tuning.json` (its SHA-256 matched the one recorded
  in `e2-blind-runs.json`), and each code row from its source (`G/experiments/<S>/t-02/result.json`, the conflicts runs'
  `base.json` / `support.json`).
- **45 answers were scored again (6 blind, 39 code). 0 differ** from what the runs recorded: answer, open strings
  right, `tuning_equal`, cents, minutes, output tokens, cost, frames looked at, tool calls. Rescored ids: e1284 to e1289
  (blind) and 39 ids from e1290 to e1345 (code; other lanes' ids are mixed in between). All are listed in `tuning.json`.
- `conflicts.py` was run again on the same windows, base notes, with the finger tie-break (gtr-run r1347 / r1348 /
  r1349: 18.2 / 23.6 / 9.4 s on 2 cores). In every stretch it gave the same first place, the same tie size, the same
  rank for the key and the same finger winner as the recorded run.
- Hand windows: E1's development windows at margin 1, 30 rows a second (`G/loop/e1/<S>/dev/final_m1_f30/`, nylon
  `final2_m1_f30/`), used by every run below. E1 published `G/loop/hand/` at 04:20 UTC, after the blind runs: the code
  rows were run again on it (section "On E1's published windows"). The SHA-256s of both are in `tuning.json`.

## The table, per song

Wrong strings are in bold with the key's note after them. "Right" is open strings right of 6. Cents are |t-01 minus
key| (t-01 said +3.0 / +3.0 / -10.0 cents). Time: for code, wall seconds; for Opus, minutes. Cost: list price of
Opus tokens. (c) is `conflicts.py`: every tuning from 5 semitones below to 2 above standard, scored by notes with no
place in the hand window and by chords that cannot go on separate strings. "+ fingers" is `fingers.py`'s tie-break
among the tunings that tie. All four (c) rows of a song come from one call that covers all three stretches.

**Capo song** (capo 3):

| condition | s6 | s5 | s4 | s3 | s2 | s1 | right | cents | time | frames | cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sound only (AO-082 t-02) | **D#2** (E2) | A2 | D3 | G3 | B3 | E4 | 5 | 1 | 0.1 s | 0 | 0 |
| (c) alone, first 60 s | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 1 | 18 s | 0 | 0 |
| (c) alone, whole song | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 1 | 18 s | 0 | 0 |
| (c) + fingers, first 60 s | E2 | A2 | D3 | G3 | B3 | **C4** (E4) | 5 | 1 | 18 s | 0 | 0 |
| (c) + fingers, whole song | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 1 | 18 s | 0 | 0 |
| Opus chord shape (b) | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 1 | 12.9 min | 16 | $3.22 |
| Opus everything | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 1 | 12.3 min | 14 | $3.10 |

**Standard song** (capo 0):

| condition | s6 | s5 | s4 | s3 | s2 | s1 | right | cents | time | frames | cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sound only (AO-082 t-02) | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 3 | 0.1 s | 0 | 0 |
| (c) alone, first 60 s | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 3 | 24 s | 0 | 0 |
| (c) alone, whole song | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 3 | 24 s | 0 | 0 |
| (c) + fingers, first 60 s | E2 | A2 | D3 | G3 | B3 | **C4** (E4) | 5 | 3 | 24 s | 0 | 0 |
| (c) + fingers, whole song | E2 | A2 | D3 | G3 | B3 | **C4** (E4) | 5 | 3 | 24 s | 0 | 0 |
| Opus chord shape (b) | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 3 | 11.4 min | 16 | $2.81 |
| Opus everything | E2 | A2 | D3 | G3 | B3 | E4 | 6 | 3 | 10.2 min | 13 | $2.48 |

**Nylon song** (capo 0):

| condition | s6 | s5 | s4 | s3 | s2 | s1 | right | cents | time | frames | cost |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sound only (AO-082 t-02) | D2 | **A2** (G2) | **D3** (C3) | **G3** (F3) | **B3** (A3) | **E4** (C4) | 1 | 1 | 0.1 s | 0 | 0 |
| (c) alone, first 60 s | D2 | G2 | C3 | F3 | A3 | C4 | 6 | 1 | 9 s | 0 | 0 |
| (c) alone, whole song | D2 | G2 | C3 | F3 | A3 | C4 | 6 | 1 | 9 s | 0 | 0 |
| (c) + fingers, first 60 s | D2 | G2 | C3 | F3 | A3 | C4 | 6 | 1 | 9 s | 0 | 0 |
| (c) + fingers, whole song | D2 | G2 | C3 | F3 | A3 | C4 | 6 | 1 | 9 s | 0 | 0 |
| Opus chord shape (b) | D2 | G2 | C3 | F3 | A3 | C4 | 6 | 1 | 14.6 min | 16 | $3.51 |
| Opus everything | D2 | G2 | C3 | F3 | A3 | C4 | 6 | 1 | 13.4 min | 17 | $3.35 |

Strings right out of 18: sound only 12; (c) alone 18 at 60 s and 18 over the whole song; (c) + fingers 16 at 60 s and
17 over the whole song; Opus chord shape 18; Opus everything 18. AO-082 on the nylon song: Opus on frames said standard
(0 of 6), and both round-2 blind arms said D G C F A D (5 of 6).

How to read the code rows:
- **(c) alone is right only through its tie-break.** 2,748 / 1,480 / 156 tunings tie at 0 conflicts over 60 s, 76 /
  82 / 64 over the whole song. The tie-break takes the fewest strings moved from standard: on the steel songs the
  key, but not as evidence. On the nylon song all 64 tied are the key or it with strings a semitone lower: it takes the
  higher.
- **The finger rule is evidence, with known faults.** It makes the nylon answer earned (the key beats 61 of the 63
  others it ties with). On the steel songs it costs a 1st string in 3 of 4 rows: at the standard song's C4 onsets the
  fingertip landmark lies 0.61 to 1.38 string spacings off string 2 (`E2-TUNING.md`).
- The +support-notes rows and the 30 s rows are in `tuning.json` only. They are not conditions: extra notes from the
  note models turn the capo song to 0 of 6.
- "Frames 0": the code reads E1's tracked fingertips, not images (the tracking is E1's cost).
- Opus: six runs, 74.8 minutes, $18.47 at list price ($9.54 shape, $8.94 everything), $2.48 to $3.51 a recording a run
  (the brief guessed $3 to $8). Each prompt said "The guitar may not be in standard tuning" and named no song or tuning.

## On E1's published windows (code rows only)

`G/work/e2-record/rerun_pub.sh`: the builder's `run_conflicts.sh`, `run_fingers.sh` and `score_conditions.py` on
`G/loop/hand/<S>/` (nylon `hand_window.csv` SHA-256 744051af..., as its README states), gtr-run r1351, 138 s for all
of it. Builder-script ids e1509 to e1547, my re-score e1548 to e1586, 0 differ. The packs were not rebuilt, and the
Opus runs were not repeated.

| condition | capo | standard | nylon |
|---|---|---|---|
| (c) alone, first 60 s | 6 (2,078 tied) | 6 (1,456 tied) | 6 (156 tied) |
| (c) alone, whole song | 6 (104 tied) | 6 (82 tied) | 6 (64 tied) |
| (c) + fingers, first 60 s | 4: s2 **A#3**, s1 **B3** | 3: s3 **D#3**, s2 **A3**, s1 **B3** | 6 |
| (c) + fingers, whole song | 5: s1 **C4** | 6 | 6 |

The finger rule: 13 of 18 over 60 s, 17 of 18 whole song (16 and 17 on the development windows). Its wrong strings
moved (the standard song's 1st string now right over the whole song, the capo song's now wrong). The nylon answer
holds: C4 beats D4 109 to 4 on string 1 (13 presences, 96 absences); D G C F A D still has 6 conflicts (rank 157).

## The nylon 1st string: settled, by sight and sound together

AO-082's two blind arms both put D4 there. Both Opus runs and the finger rule say C4, the key. Settled for these runs:
four kinds of evidence agree, and I checked the counts against the files myself:
- **Seen**, the everything run (`G/loop/e2/blind/tun-c-all/HOW.md`): "The G minor grip decided string 1 for me. In D
  standard (D G C F A D) this chord is an "Am shape" with three fingers and string 1 open (D4). Here a fourth finger is
  pressed at fret 2 on the treble edge exactly when D4 sounds. [...] With string 1 at D4 that finger would sound E4,
  which is never heard. With string 1 at C4 it is the D4." (`fingers.py` puts that tip at string 1 fret 2 at 31.82,
  32.26, 39.04, 39.48, 46.20 and 46.61 s.)
- **Heard**, the shape run (`G/loop/e2/blind/tun-c-shape/HOW.md`): "**Bb3 keeps ringing straight through the C4
  notes** [...] Within the hand window Bb3 can only come from string 2, fret 1. If C4 were string 2 fret 3, as it must
  be in D G C F A D, it would cut the Bb3 off. So C4 is on another string: the open first string."
- **Counted.** Bb3 and C4 start together 6 times (43.07, 47.70, 91.86, 105.90, 106.32, 120.80 s; I counted them in
  chain-2's notes, onsets within 35 ms). Over the whole song `conflicts.py` gives D G C F A D 6 conflicts (rank 161)
  and the answer 0 (`G/loop/e2/score/dev/tuning/check_dgcfad.txt`). The finger rule: C4 beats D4 103 to 1 (16
  presences at string 1 fret 2, 87 absences at string 2 fret 3), with 55 neutral (`fingers_s1_all.txt`). Nothing above
  D4 is heard in 611 notes, and C4 is the most common note (142).
- **The doubt, in the everything run's words:** "Most of the 103 finger votes are absences. [...] They rest on the
  little finger's landmark, which is often 1-2 string spacings off. [...] I trust the evidence that does not depend
  on that landmark: the Bb3+C4 groups and overlaps (heard), the four-finger G minor grip with a finger on string 1
  fret 2 for D4 (seen), and no note above D4 in 3 minutes. Sight and sound agree here, so I changed string 1 from the
  D-standard assumption to C4. Confidence: medium-high." The shape run gave it 0.7, its least certain string: "the
  little finger sits right next to the second fret wire (f 1.8-1.98), so "fret 2 on string 1" versus "fret 3 on
  string 2" depends on a fraction of a fret."
- Not yet known: how much a repeat varies (one run per condition).

## The plan's rule: "tuning found" becomes the default

LOOP.md E2, "Changes the plan": 6 of 6 everywhere makes "tuning found" the app's default; any wrong string means the
app asks the person for the tuning first.
- **The Opus "everything" finder: 6 / 6 / 6, 18 of 18. The rule says "tuning found" is the default.** The chord-shape
  run got 6 / 6 / 6 as well.
- The code finder alone does not pass: with the finger rule, 5 / 5 / 6 over 60 s and 6 / 5 / 6 over the whole song
  (4 / 3 / 6 and 5 / 6 / 6 on the published windows); without it, 6 / 6 / 6 only through the tie-break. So the default
  holds only with the Opus step in it: 10 to 13 minutes and $2.48 to $3.35 a recording at list price.
- What the verdict stands on: three songs, two in standard tuning, one run each, Opus on development windows. E7's
  held-out recordings bring tunings the finder was never tried on, and it has to hold there. The app should still show
  each string's evidence and confidence, so a person can correct a single string.

## What L3 starts from (`G/loop/e2/finder-answer.json`)

For each song, the **everything run's answer**: capo `tun-a-all` E2 A2 D3 G3 B3 E4; standard `tun-b-all` E2 A2 D3 G3
B3 E4; nylon `tun-c-all` D2 G2 C3 F3 A3 C4. Each comes with its per-string evidence and confidence, copied from the
run's `tuning.json`, whose SHA-256 is named in `from`. It is not the code path's answer: Opus did no worse anywhere,
and the code finger rule loses a steel song's string 1 on either set of windows. The file holds the finder's answers
only, with no scores. Step (d), changing a string in the loop only when sight and sound keep disagreeing, is measured
in L3 itself: every later change of a string, right or wrong, is E2's last measure.

## For the film

The moments where the tuning is found best, in order of value. The runs' frames were made in the sandbox's private
`/tmp` and are gone, so make them again from these times with the pack's `frames.py`, `overlay.py` and `spectro.py`.
- **Nylon, 31.2 to 33.4 s, the 1st string (the moment to show).** The G minor grip. In the overlay (string lines and
  fret wires on the frame), the little finger sits on the 1st string at fret 2 as D4 sounds (31.82, 32.26 s). Then the
  hand holds still at frets 1-2 while C4 sounds three times (32.52, 32.92, 33.31 s), so the open 1st string is C4, a
  tone below D standard's. The frames the runs used: the shape run's zoom at 31.5 and 32.0 s, the everything run's
  overlay at 31.5, 31.85 and 47.75 s. The same grip comes back at 90.33, 91.5, 119.35 and 120.85 s.
- **Nylon, 126.5 to 130 s, the spectrogram.** The Bb3 line runs on under each new C4 (127.61, 128.02 s): two strings,
  so C4 is not string 2 fret 3. The shape run's spectrograms at 31.8 to 34.6 s and 97.4 to 100.6 s show the same.
- **Nylon, 43.08 s.** Bb3 and C4 are struck together with the hand at frets 1-4. Put the conflict count beside it:
  D G C F A D 6, the answer 0.
- **Capo song, 124.1 s.** C3 is heard while the hand is at frets 10-14 (window 7-15 from the capo). Nothing in reach
  makes it, so string 5 rings open: C3 with capo 3 is A2. Overlay at 124.12 s, spectrogram 122.5 to 126 s.
- **Capo song, 81.8 s.** F3 is heard, with the hand at frets 1-4 and no finger on string 4: string 4 is open, D3 below
  the capo. Overlay at 81.83 s.
- **Standard song, 111.1 s.** A plain C shape (x32010) with nothing on string 1 while E4 sounds (also 174.32 s).
- **Standard song, 93.6 to 94.5 s.** E2 rings under a triad at frets 4-7, and nothing touches string 6.
- The contrast worth one line: the code finger rule gets a steel song's 1st string wrong in 3 of 4 rows on either set
  of windows, because a fingertip landmark drawn a string off reads as "no finger there". Opus, reading the frames (the
  C shape at 111.1 s), kept E4.

## Limits

- One run per song and condition, so there is no spread yet. Three songs only, and only one of them not in standard
  tuning.
- The Opus runs used E1's development windows. The published ones came after them, and only the code rows were run
  again on those. The packs in `G/loop/e2/packs/` still hold the development windows: `G/work/e2-builder/make_packs.py`
  rebuilds them on `G/loop/hand/` before any new blind run.
- The blind runs used the file sandbox (answers hidden), not the network-closed one (STATE's 03:28 caveat). My audit
  of every tool call: only the six tools; no path outside the folder, the named Python and the run's own `/tmp`
  scratchpad; no network, git or install command (its only flags: Python and awk text read as paths, `p//12-1`).
- The nylon shape run tested a few tunings against the window in its own code, a home-made step (c), so it is not a
  pure "chord shape only" measure (`E2-TUNING.md`).
- Cents are t-01's (librosa) and were not re-measured: 1 / 3 / 1 cents off.
- Files on the box: `G/loop/e2/rescore/{rescore.json,pub/rescore.json}`, `G/loop/e2/finder-answer.json`,
  `G/loop/e2/blind/<label>/{tuning.json,HOW.md}`, `G/work/e2-record/{rescore.py,make_records.py,rerun_*.sh}`.
