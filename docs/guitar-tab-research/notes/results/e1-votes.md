# N-E1: several methods, one pick per bar, and fusing the guitar models' rolls

Written 2026-11-27 by the N-E1 helper of the NOTES session (branch `research/guitar-notes`). Brief:
`../../sessions/NOTES.md`, sections 2 to 4. Work folder, with every script, note list, score and log:
`/home/user/notes/runs/e1/` (`PROGRESS.md`, `bin/`, `out/`, `fusion/`, `logs/`). Numbers: `/home/user/notes/runs/e1/e1.json`.
Only numbers are here. The keys and the players' tabs stay out of the repo. No model was run: every method works
from the note lists and rolls that part 1 made.

## In short

- **The best method is a plain vote, and it gains about 0.01 over the best single model.** The 4-of-7 vote of
  every candidate scores onset F1 0.956 / 0.831 / 0.922 (capo / tuning / standard), mean **0.903**, with k chosen
  on the other two songs (k = 4 every time). The 3-of-5 vote of fl, gaps, gaps-paper, Transkun and Basic Pitch
  scores 0.957 / 0.826 / 0.925, mean **0.902**. k = 3 is chosen by GuitarSet dev24 and by every leave-one-song-out
  (LOSO) fold. gaps-paper alone scores 0.954 / 0.822 / 0.8955, mean 0.890. The best single tool per song (gaps-paper,
  gaps, gaps-paper, itself a choice made by looking) has mean 0.893.
- **The top ten methods are within 0.003 of each other.** Votes, weighted votes and the dev24-fitted roll fusion all
  land between 0.900 and 0.903. Three songs cannot rank them. The two top votes gain +0.002 to +0.003 over gaps-paper on capo,
  +0.004 to +0.010 on tuning and +0.027 to +0.029 on standard: nearly all of it is on the standard song.
- **Weights, anchors, per-register thresholds and per-bar agreement add nothing over the plain vote.** Weighted votes
  0.894 to 0.902; the gaps-paper anchor rule 0.899; the key-free per-bar pick 0.890 to 0.899. Per-register
  thresholds lower roll fusion (0.895 against 0.897).
- **Roll fusion is the best method on the nylon song.** The mean of the three models' rolls, decoded by the
  package's own decoder at one threshold fitted on dev24 (0.275), scores 0.847 on tuning, +0.017 over gaps and
  +0.013 over the best vote on that song (0.834). But it keeps fl's and gaps's slap notes on capo (0.9385, 74 invented), so its mean is
  0.9005. Fitted by LOSO instead it is 0.897.
- **On GuitarSet dev24 nothing beats gaps-paper alone** (0.915, or 0.918 at onset threshold 0.45). The frozen 3-of-5
  vote scores 0.905 there. Every rule fitted on dev24 that can fall back to gaps-paper alone does so: the anchor rule
  keeps it unchanged, and the weighted roll mean picks gaps-paper's roll alone at 0.45. The vote's gain shows only on
  the three songs.
- **The per-bar oracle is 0.022 above the frozen vote.** Picking the best tool in each bar while looking at the key
  gives 0.969 / 0.866 / 0.937 (mean 0.924) over all seven candidates. The frozen vote captures 30 % of that oracle's gain
  over the best single tool (21 % capo, -12 % tuning, 70 % standard). The gap is 0.012 on each steel song and 0.041 on
  the nylon song. By the brief's rule (within 0.01) the vote is not yet good enough to make picks a side feature.
- **The note-level oracle is 0.973.** Keeping exactly the right candidates from all seven lists leaves 6, 71 and 22
  notes missing. So most of the remaining room is in single notes inside bars, not in whole-bar picks.
- **Why the steel and nylon songs differ** (step 0). On capo and standard, 53 % and 63 % of gaps-paper's misses
  have a strong onset in another model's roll (bucket A): the vote's job. On the nylon song, 42 of gaps's 111 misses
  (38 %) have no evidence in any of the three rolls (bucket C), and 55 of its 101 invented notes are an octave or a
  twelfth of a key note that is sounding (42 above it, where a partial sits, and 13 an octave below; checker).
  Choosing among the models cannot fix those.
- **What I would freeze:** the 3-of-5 vote, median onset, k = 3. It is 0.0007 below the 4-of-7 vote on the mean,
  uses only tools that run on this box (no public Space, no separation step), and its k does not move between dev24
  and any LOSO fold. Roll fusion (mean, 0.275) is the second app method, because it is the one that helps the nylon
  song.
- **Handoff for LOOP:** the top three by mean LOSO F1, at `/home/user/gtv/notes/<S>/e1-<method>/notes.csv` (below).

## What was run

**Inputs.** The three songs: capo (steel, standard tuning, capo 3), tuning (nylon, D G C F A C at -9 cents, no capo),
standard (steel, standard tuning, no capo). Every method runs on the whole song. A 30 s number is the whole-song
output cropped to the segment (capo from 12.76 s, tuning 25.0 s, standard 0.0 s) and scored against the segment key
cut by `crop_truth.py`. (Part 1's Transkun segment numbers came from a run on the 30 s WAV; here every tool is a crop.)

**Candidates** (step 1). Seven note lists per song, all made earlier:

| id | tool | note list | onset F1 capo / tuning / standard | wall per song, 2 cores |
|---|---|---|---|---|
| fl | guitar-fl (Riley et al.) | `/home/user/notes/runs/<S>/riley-fl/<S>.notes.csv` | 0.920 / 0.798 / 0.892 | 120-155 s |
| gaps | guitar-gaps | `.../riley-gaps/` | 0.919 / 0.830 / 0.879 | 108-140 s |
| gaps-paper | guitar-gaps-paper (12,200 iterations) | `.../riley-gaps-paper/` | 0.954 / 0.822 / 0.8955 | 102-170 s |
| transkun | Transkun 2.0.1 | step 2's n-04, as E0 rescored it (`/home/user/notes/runs/e0/rescore/<S>/n-04/bd/notes.csv`) | 0.896 / 0.785 / 0.866 | 160-185 s |
| bp | Basic Pitch 0.4.0 with the range hint | n-01-hint, same place | 0.709 / 0.627 / 0.664 | 11-15 s |
| ymt3 | YourMT3+ guitar tracks | n-05g, same place | 0.827 / 0.732 / 0.780 | 252-341 s (a public CPU Space, not this box) |
| sep | separation first | n-03-sep07 (fl after HPSS) on capo and standard, n-02-sep01 (gaps after Demucs) on tuning | 0.914 / 0.833 / 0.876 | 262-346 s (separator + model) |

The rolls (100 frames a second, 88 keys from MIDI 21, trimmed to `n_valid_frames`) are part 1's
`/home/user/notes/runs/<S>/riley-<fl|gaps|gaps-paper>/<S>.npz`. Noise2Fret (E2) was left out: its best F1 is 0.601 /
0.383 / 0.394, and E2 found that as a voter it adds at most 0.005 on any song.

On dev24 (24 GuitarSet clips, `/home/user/notes/dev/`) five of the seven exist: fl, gaps, gaps-paper, Transkun and
Basic Pitch, with the rolls of the three guitar models. YourMT3+ and the separation runs have no dev24 runs, so a
method that uses them is fitted by LOSO only.

**Scoring.** The scorer of record is gtr-eval 0.12.1, `notes --no-ledger` (onset within 50 ms, pitch within 50 cents,
offsets ignored, one to one). Fitting used an in-process copy of its matching (`bin/e1lib.py`, mir_eval
`match_notes` with the same settings). Every whole-song and segment F1 in this record was then re-scored with the
gtr-eval CLI: 435 scores, gtr-run **r1521** (313 s on 2 cores), and all 435 equal the in-process value to 1e-6
(`out/cli_check.json`, eval files in `out/cli/`). With `--no-ledger` there are no eval ids. Dev24 is scored as part 1
did: the mean of the 24 per-clip F1 values, each over its crop window. It was scored with the same in-process matching, not
`score_notes.py`; it reproduces part 1's dev24 values (gaps-paper 0.9146, the 3-of-5 vote 0.905).

**Fitting rule.** Every threshold, weight or choice is fitted one of two ways, and both are reported:
- **dev24**: the setting with the best mean F1 over the 24 dev clips;
- **LOSO**: for each song, the setting with the best mean F1 over the other two songs.

Ties go to the plainest setting (the first in the grid; for roll fusion, the threshold nearest the package default
0.30). Anything that looks at the song's own key is an **ORACLE** and is labelled so.

**Runs** (all through `gtr-run --lane notes`, 2 cores each):

| run | what | wall |
|---|---|---|
| r1493 | votes, weighted votes and anchor rules: every setting on the songs and dev24 (`bin/fit.py`) | 41 s |
| r1497, r1498, r1511 | roll fusion: fuse and decode 17 variants x 11 or 21 thresholds x 27 files (`bin/fuse_decode.py`) | 227, 177, 685 s |
| r1512 | roll fusion picker timing (`bin/fuse_time.py`) | 13 s |
| r1523 | roll fusion without the gaps shift (a check) | 45 s |
| r1521 | the gtr-eval CLI on every method, whole songs and segments (`bin/score_cli.py`) | 313 s |

The step 0 diagnosis (`bin/diag.py`), the fusion scoring (`bin/fuse_score.py`) and the collection of every method
and measure (`bin/collect.py`) each took under 5 s and ran outside gtr-run.

## Step 0: where the best single tool goes wrong

The best single tool is gaps-paper on capo and standard and gaps on tuning. For each key note it misses, I took the
largest `reg_onset_output` value at the note's MIDI pitch within 50 ms of the key onset, in each of the fl, gaps and
gaps-paper rolls (`bin/diag.py`; `out/diag.json`). The buckets:
- **A**: 0.3 or more in some roll. The evidence was there, and the decoding or the choice of model lost it.
- **B**: 0.1 to 0.3 at best. Within reach of a lower threshold or of fusion.
- **C**: under 0.1 in all three rolls. No guitar-model evidence.

Tags: the key's string group; tab-only (key `conf` = `tab`) or heard; within 80 ms of a key slap or thump; in a
rolled chord (a key note on an adjacent string 10 to 80 ms away); and whether any of the seven candidate lists has a
note of that pitch within 50 ms.

### Misses

| song (tool) | misses | bucket | n | strings 6-4 | strings 3-1 | tab-only | near a slap | rolled chord | in some candidate list | roll at 0.3+ in fl / gaps / gaps-paper |
|---|---|---|---|---|---|---|---|---|---|---|
| capo (gaps-paper) | 34 | A | 18 | 15 | 3 | 0 | 5 | 0 | 18 | 4 / 16 / 0 |
| | | B | 8 | 2 | 6 | 2 | 4 | 0 | 6 | |
| | | C | 8 | 6 | 2 | 6 | 4 | 0 | 4 | |
| tuning (gaps) | 111 | A | 38 | 12 | 26 | 15 | no slaps | 6 | 25 | 23 / 18 / 27 |
| | | B | 31 | 5 | 26 | 16 | | 7 | 9 | |
| | | C | 42 | 18 | 24 | 5 | | 16 | 15 | |
| standard (gaps-paper) | 92 | A | 58 | 17 | 41 | 16 | 38 | 7 | 56 | 56 / 30 / 4 |
| | | B | 14 | 4 | 10 | 9 | 12 | 1 | 9 | |
| | | C | 20 | 9 | 11 | 11 | 15 | 4 | 6 | |

What it says:
- **On the steel songs most misses are A, and another model has them.** On capo, 15 of the 18 A misses are on the
  bass strings, and gaps's roll holds 16 of them (gaps finds bass notes that gaps-paper drops). On standard, fl's roll
  holds 56 of the 58, and 38 of the 58 sit within 80 ms of a slap. Every A miss but two is in some candidate's note
  list. This is what a vote or a per-bar pick can win back.
- **On the nylon song C is the largest bucket** (42 of 111, and 37 of those 42 are heard, not tab-only). 16 of the 42
  are in a rolled chord. No model put an onset there, so no choice among the models brings them back. B adds 31, and
  26 of them are on the treble strings.
- **13 of tuning's 38 A misses are in no candidate list.** For 18 of the 38, gaps's own roll is at 0.3 or more within
  50 ms. On this song every model is about 30 ms early, so a decoded onset can land just past 50 ms. This matches
  E0's 33 "timing question" notes.
- **Tab-only notes** are a large part of B and C (capo 8 of 16, tuning 21 of 73, standard 20 of 34): some of these
  may not be in the recording at all.

### Invented notes

Exclusive categories, in this order: out of range (below the lowest open string with the capo, or above the 1st
string's fret 20); at a slap (within 50 ms of a key slap or thump, the `taps_invented.py` rule); an octave or a twelfth
of a sounding key note (invented pitch minus key pitch = +12, -12, +19 or +24, for a key note whose onset is at most 50 ms after it and
whose let-ring offset is after it); other. "Lone" = no other candidate list has that pitch within 50 ms.

| song (tool) | invented | out of range | at a slap | octave or twelfth | other | lone |
|---|---|---|---|---|---|---|
| capo (gaps-paper) | 42 | 1 | 27 | 0 | 14 | 4 |
| tuning (gaps) | 101 | 0 | no slaps | 55 | 46 | 6 |
| standard (gaps-paper) | 45 | 0 | 44 | 0 | 1 | 2 |

- **Almost no invented note is lone** (12 of 188). Other tools invent the same notes, so a vote can only remove the
  ones that fewer than k tools share. On the steel songs they are slap notes (E6's subject). On the nylon song more
  than half are an octave or a twelfth from a note that is ringing (E4's and E5's subject): 42 of the 55 sit above
  it, at a partial; 13 are an octave below it, which is not a partial (checker).
- The range alone removes 1 of the 188.

## Step 2: the methods

### Every method, ranked by mean F1 over the three songs

Each number is the song's F1 at the setting chosen without that song (fit column). `seg30` is the mean over the three
30 s segments. "Edits left" = missed + invented over the three songs. "Gain share" = (method - best single tool per
song) / (per-bar oracle over all seven - best single tool per song), on the means. The dev24 column is the macro mean
F1 over the 24 dev clips at the dev24-chosen setting. The rank is the row's place among the 58 non-oracle rows of the full list
(66 rows with the oracles, `out/main_table.md`); rows that were the same method fitted two ways are merged here.

| rank | method | fit | capo | tuning | standard | mean | seg30 mean | edits left | gain share | dev24 |
|---|---|---|---|---|---|---|---|---|---|---|
| ORACLE | note level, all seven: keep exactly the right candidates | oracle | 0.9963 | 0.9401 | 0.9835 | **0.9733** | 0.9800 | 99 | 2.58 | |
| ORACLE | per bar over {4-of-7 vote, gaps-paper, fl, gaps, Transkun} | oracle | 0.9705 | 0.8621 | 0.9447 | **0.9258** | | | | |
| ORACLE | per bar over all seven | oracle | 0.9687 | 0.8663 | 0.9373 | **0.9241** | 0.9400 | 297 | 1.00 | |
| ORACLE | per bar over {3-of-5 vote, gaps-paper, fl, gaps, Transkun} | oracle | 0.9699 | 0.8604 | 0.9405 | **0.9236** | | | | |
| ORACLE | per bar over fl, gaps, gaps-paper, Transkun | oracle | 0.9657 | 0.8595 | 0.9316 | **0.9189** | 0.9348 | 317 | 0.83 | |
| ORACLE | per bar over fl, gaps, gaps-paper | oracle | 0.9644 | 0.8560 | 0.9203 | **0.9136** | 0.9306 | 340 | 0.66 | |
| 1 | 4-of-7 vote, all seven, onset of the most reliable member | LOSO (k 4, 4, 4) | 0.9559 | 0.8313 | 0.9222 | **0.9031** | 0.9275 | 380 | 0.32 | |
| 2 | 3-of-5 vote of fl, gaps, gaps-paper, Transkun, Basic Pitch, median onset | LOSO (k 3, 3, 3) and dev24 (k 3) | 0.9567 | 0.8256 | 0.9249 | **0.9024** | 0.9291 | 377 | 0.30 | 0.9053 |
| 4 | weighted vote, all seven, precision weights and threshold by LOSO | LOSO | 0.9505 | 0.8265 | 0.9291 | **0.9020** | 0.9218 | 387 | 0.29 | |
| 5 | 3-of-5 vote, onset of the most reliable member | LOSO and dev24 | 0.9567 | 0.8239 | 0.9249 | **0.9019** | 0.9291 | 379 | 0.29 | 0.9041 |
| 7 | weighted vote, all seven, naive-Bayes weights by LOSO | LOSO | 0.9547 | 0.8342 | 0.9165 | **0.9018** | 0.9275 | 388 | 0.28 | |
| 8 | roll fusion: mean of the three rolls, per-register thresholds (half-shrunk), dev24 | dev24 | 0.9391 | 0.8470 | 0.9159 | **0.9006** | 0.9231 | 404 | 0.25 | |
| 10 | weighted vote of the five, precision weights from dev24, threshold by LOSO | dev24 + LOSO | 0.9539 | 0.8246 | 0.9231 | **0.9005** | 0.9285 | 386 | 0.24 | |
| 11 | roll fusion: mean, one threshold (0.275) by dev24 | dev24 | 0.9385 | 0.8470 | 0.9160 | **0.9005** | 0.9231 | 405 | 0.24 | 0.9098 |
| 12 | 4-of-7 vote, median onset | LOSO (k 4, 5, 4) | 0.9559 | 0.8227 | 0.9222 | **0.9003** | 0.9279 | 383 | 0.23 | |
| 14 | anchor: gaps-paper, drop and add from the other four | LOSO | 0.9534 | 0.8313 | 0.9131 | **0.8993** | 0.9236 | 399 | 0.20 | |
| 16 | 2-of-3 vote of fl, gaps, gaps-paper | LOSO and dev24 | 0.9472 | 0.8340 | 0.9158 | **0.8990** | 0.9219 | 400 | 0.19 | 0.9049 |
| 19 | weighted vote of the five, precision weights and threshold from dev24 | dev24 | 0.9491 | 0.8299 | 0.9180 | **0.8990** | 0.9272 | 408 | 0.19 | 0.9056 |
| 20 | weighted vote of the five, naive-Bayes weights and threshold from dev24 | dev24 | 0.9530 | 0.8322 | 0.9113 | **0.8988** | 0.9260 | 394 | 0.19 | 0.9103 |
| 21 | per-bar pick without the key, all seven | none | 0.9544 | 0.8264 | 0.9158 | **0.8988** | 0.9242 | 395 | 0.19 | |
| 22 | per-bar pick without the key, fl, gaps, gaps-paper, Transkun | none | 0.9554 | 0.8321 | 0.9087 | **0.8987** | 0.9279 | 397 | 0.18 | |
| 29 | per-bar pick without the key, the five | none | 0.9542 | 0.8219 | 0.9184 | **0.8982** | 0.9282 | 393 | 0.17 | |
| 34 | roll fusion: mean, one threshold by LOSO | LOSO | 0.9385 | 0.8374 | 0.9155 | **0.8971** | 0.9238 | 409 | 0.13 | |
| 36 | 2-of-3 vote of fl, gaps-paper, Transkun | LOSO and dev24 | 0.9572 | 0.8123 | 0.9209 | **0.8968** | 0.9222 | 400 | 0.12 | 0.9102 |
| 39 | 2-of-4 / 3-of-4 vote of fl, gaps, gaps-paper, Transkun | LOSO (k 2, 3, 2) | 0.9491 | 0.8174 | 0.9186 | **0.8950** | 0.9321 | 409 | 0.07 | |
| 44 | string-type gate: gaps-paper on steel, gaps on nylon | needs one more user input | 0.9536 | 0.8299 | 0.8955 | **0.8930** | 0.9164 | 425 | 0.00 | |
| 48 | per-bar pick without the key, fl, gaps, gaps-paper | none | 0.9588 | 0.8163 | 0.8962 | **0.8904** | 0.9242 | 419 | -0.08 | |
| 49 | gaps-paper alone | none | 0.9536 | 0.8217 | 0.8955 | **0.8903** | 0.9184 | 427 | -0.09 | 0.9146 |
| 57 | roll fusion: max of the three rolls, one threshold by LOSO | LOSO | 0.9335 | 0.8239 | 0.9032 | **0.8869** | 0.9125 | 452 | -0.20 | |
| 60 | gaps alone | none | 0.9189 | 0.8299 | 0.8787 | **0.8758** | 0.9072 | 513 | -0.55 | |
| 63 | fl alone | none | 0.9199 | 0.7976 | 0.8917 | **0.8698** | 0.9040 | 529 | -0.75 | |

The difference between neighbouring rows is often a single LOSO choice. Example: the 4-of-7 vote with the median
onset (rank 12) and with the reliable onset (rank 1) score the same at every song for k = 4. They differ only because the
LOSO fold for the tuning song picks k = 5 for the median rule: on capo and standard, k = 5 beats k = 4 by 0.0003.

### a. Oracles (they look at the key)

- **Per-bar pick.** Bars are the key's downbeats (72, 49 and 56 bars). In each bar the oracle takes the candidate with
  the most found minus invented notes (each candidate matched on its own over the whole song; ties to the more reliable
  tool). Then the picked notes are scored again. Over fl, gaps and gaps-paper: 0.964 / 0.856 / 0.920. Adding
  Transkun: 0.966 / 0.860 / 0.932. All seven: 0.969 / 0.866 / 0.937.
- **The app's oracle** (the user picks per bar among the frozen vote, gaps-paper, fl, gaps and Transkun): 0.970 /
  0.860 / 0.941, mean 0.924. It keeps the vote in 52 of 72 bars on capo, 19 of 49 on tuning and 38 of 56 on standard.
  So a perfect picker would change 20, 30 and 18 bars.
- **Note-level oracle.** Every cluster of the seven lists (the vote's clustering with k = 1) whose note matches a key
  note is kept, nothing else: 0.996 / 0.940 / 0.984. It leaves 6, 71 and 22 key notes missing (no candidate has them)
  and invents nothing. Over the three guitar models only: 0.990 / 0.918 / 0.969.

### b. k-of-n votes

The rule is the brief's (E0's code, `bin/e1lib.py` `cluster`): per MIDI pitch, the notes of every tool in the set
sorted by onset; a cluster starts at the first note not yet in one and takes every later note of that pitch within
50 ms of that first onset; it is kept when at least k different tools have a note in it. The kept note's onset is
either the **median** of the members' onsets (offset likewise) or the onset of the member from the **most reliable**
tool (order from dev24 F1: gaps-paper, fl, gaps, then the separation run, Transkun, YourMT3+, Basic Pitch).

Per setting (these are not results: a k chosen from this table for the song it is scored on is tuned on its test):

| set | k | onset | capo | tuning | standard | mean | dev24 |
|---|---|---|---|---|---|---|---|
| fl, gaps-paper, Transkun | 2 | median | 0.9572 | 0.8123 | 0.9209 | 0.8968 | 0.9102 |
| fl, gaps-paper, Transkun | 2 | reliable | 0.9572 | 0.8157 | 0.9194 | 0.8974 | 0.9097 |
| fl, gaps, gaps-paper | 2 | median | 0.9472 | 0.8340 | 0.9158 | 0.8990 | 0.9049 |
| fl, gaps, gaps-paper | 3 | median | 0.9583 | 0.7918 | 0.8931 | 0.8811 | 0.8838 |
| fl, gaps, gaps-paper, Transkun | 2 | median | 0.9491 | 0.8292 | 0.9186 | 0.8990 | 0.9051 |
| the five | 2 | median | 0.9305 | 0.8308 | 0.8999 | 0.8871 | 0.9039 |
| the five | 3 | median | 0.9567 | 0.8256 | 0.9249 | **0.9024** | **0.9053** |
| the five | 3 | reliable | 0.9567 | 0.8239 | 0.9249 | 0.9019 | 0.9041 |
| the five | 4 | median | 0.9579 | 0.8035 | 0.9017 | 0.8877 | 0.8816 |
| all seven | 3 | median | 0.9393 | 0.8387 | 0.9141 | 0.8973 | |
| all seven | 4 | median | 0.9559 | 0.8313 | 0.9222 | **0.9031** | |
| all seven | 4 | reliable | 0.9559 | 0.8313 | 0.9222 | **0.9031** | |
| all seven | 5 | median | 0.9593 | 0.8227 | 0.9194 | 0.9005 | |
| all seven | 5 | reliable | 0.9593 | 0.8210 | 0.9178 | 0.8994 | |

Every k for every set and both onset rules is in `out/tables.md`.

- **The onset rule hardly matters.** At the chosen k, median and reliable onsets differ by at most 0.0034 on any song
  (fl, gaps-paper, Transkun on tuning), usually by 0 to 0.002. On dev24 the median is ahead for three of the four sets that run there.
- **The vote's gain is on the standard song.** The 3-of-5 vote finds 23 more key notes there than gaps-paper (610
  against 587) and invents 15 fewer (30 against 45). On capo: +4 found, -1 invented. On tuning, against gaps: -27
  found, -32 invented, F1 -0.004.
- **On dev24 the 3-of-5 vote (0.905) is below gaps-paper alone (0.915)**, as part 1's dev-tools job found.

### c. Reliability-weighted votes

The same clusters, scored per cluster and kept when the score reaches a threshold. Weights are per tool and per pitch
range of the cluster (MIDI below 52, 52 to 63, 64 and up). Two schemes:
- **precision weights**: w = logit of the tool's precision in that range (Laplace-smoothed); score = sum over the
  tools present.
- **naive Bayes**: per tool and range, log of P(present | right cluster) / P(present | wrong cluster) when present
  and the same for absent, plus the log prior odds of a right cluster in that range.

Weights fitted on dev24 (the five tools; the 24 clips pooled) or on the two LOSO songs (all seven possible). The
threshold was fitted on dev24 or by LOSO.

| set | weights | weights from | threshold from | capo | tuning | standard | mean | dev24 |
|---|---|---|---|---|---|---|---|---|
| the five | precision | dev24 | dev24 (3.75) | 0.9491 | 0.8299 | 0.9180 | 0.8990 | 0.9056 |
| the five | precision | dev24 | LOSO | 0.9539 | 0.8246 | 0.9231 | 0.9005 | |
| the five | precision | LOSO | LOSO | 0.9427 | 0.8218 | 0.9273 | 0.8972 | |
| the five | naive Bayes | dev24 | dev24 (-0.75) | 0.9530 | 0.8322 | 0.9113 | 0.8988 | 0.9103 |
| the five | naive Bayes | dev24 | LOSO | 0.9493 | 0.8164 | 0.9151 | 0.8936 | |
| the five | naive Bayes | LOSO | LOSO | 0.9487 | 0.8276 | 0.9192 | 0.8985 | |
| all seven | precision | LOSO | LOSO | 0.9505 | 0.8265 | 0.9291 | **0.9020** | |
| all seven | naive Bayes | LOSO | LOSO | 0.9547 | 0.8342 | 0.9165 | 0.9018 | |

- No weighted vote beats the plain 3-of-5 (0.9024) or 4-of-7 (0.9031) vote. The best weighted vote on dev24 (naive
  Bayes, 0.910) is still below gaps-paper alone there (0.915).
- The weights agree with dev24's reliability table. gaps-paper gets the largest weight at MIDI 64 and up (precision
  logit about 3.2 to 4.9). Basic Pitch gets a negative weight below MIDI 52 and at 64 and up. The fitted weights per
  fold are in `e1.json` (`params`).

### d. Anchor rule

Keep gaps-paper's notes. Drop one that no other tool in the set supports when its onset-roll value (`conf`, the
`reg_onset_output` at its peak) is below t. Add a note gaps-paper lacks when at least k of the others have it (its
onset is the median of those members, or the most reliable one: the two rules gave identical F1 here). Grid: t in
{0, 0.35, ..., 0.9, 1.01}, k in {never, n, ..., 1}.

| others | fit | capo | tuning | standard | mean | chosen (t, k) |
|---|---|---|---|---|---|---|
| fl, gaps, Transkun, Basic Pitch | LOSO | 0.9534 | 0.8313 | 0.9131 | 0.8993 | (0.9, 3), (0.9, 3), (0.5, 3) |
| fl, gaps, Transkun, Basic Pitch | dev24 | 0.9536 | 0.8217 | 0.8955 | 0.8903 | (0, never): gaps-paper unchanged; dev24 0.9146 |
| the four + YourMT3+ + separation run | LOSO | 0.9502 | 0.8307 | 0.9119 | 0.8976 | (0.9, 4), (0.9, 5), (0.35, 5) |
| fl, gaps | LOSO | 0.9479 | 0.8317 | 0.9158 | 0.8984 | (0.8, 2), (0.7, 2), (0.8, 2) |
| fl, gaps | dev24 | 0.9576 | 0.8202 | 0.8986 | 0.8921 | (0.45, never): dev24 0.9146 |

- LOSO likes "add when 3 of the 4 others agree, drop an unsupported gaps-paper note below 0.9". That is close to a
  vote with gaps-paper given a veto, and it scores 0.003 below the plain 3-of-5 vote.
- dev24 again chooses to leave gaps-paper alone.

### e. Fusion of the guitar models' rolls

`reg_onset_output` and `frame_output` of fl, gaps and gaps-paper are combined frame by frame: by the **mean**, the
**max**, or a **weighted mean** (weights in quarters, 15 combinations, the single models among them). `reg_offset`
and velocity are always the plain mean. Before fusing, the gaps rolls are moved 0.75 frames (7.5 ms) later by linear
interpolation. That shift is fitted on dev24: the median onset error of matched notes is -1.5 ms for fl, -8.6 ms for
gaps and -0.75 ms for gaps-paper. The fused rolls are decoded by the package's own decoder (`riley_post.decode`,
RegressionPostProcessor from `piano_transcription_inference`, imported in the riley env), frame threshold 0.1, offset
threshold 0.3. **Range mask:** nothing below the lowest open string with the capo, nothing above the 1st string's fret
20 (capo 43 to 84, tuning 38 to 80, standard and dev24 40 to 84). The decoder works pitch by pitch, so masking the
rolls equals dropping those notes. A single-model "fusion" (gaps-paper's rolls alone, threshold 0.30, no range mask)
reproduces gaps-paper's F1 on all three songs exactly (0.953602, 0.821667, 0.8955).

One threshold for the fused roll (mean), per setting (`out/tables.md` has every threshold and the max):

| threshold | capo | tuning | standard | mean | dev24 |
|---|---|---|---|---|---|
| 0.225 | 0.9328 | 0.8455 | 0.9075 | 0.8953 | 0.9041 |
| 0.250 | 0.9383 | 0.8463 | 0.9115 | 0.8987 | 0.9068 |
| **0.275** (dev24's choice) | 0.9385 | **0.8470** | 0.9160 | 0.9005 | **0.9098** |
| 0.300 | 0.9411 | 0.8419 | 0.9190 | 0.9007 | 0.9086 |
| 0.325 | 0.9473 | 0.8380 | 0.9175 | 0.9009 | 0.9067 |
| 0.350 | 0.9494 | 0.8374 | 0.9155 | 0.9007 | 0.9051 |
| 0.400 | 0.9525 | 0.8336 | 0.9095 | 0.8985 | 0.9043 |
| 0.500 | 0.9557 | 0.8085 | 0.8876 | 0.8840 | 0.8952 |

The fitted methods:

| method | fit | chosen threshold(s) | capo | tuning | standard | mean |
|---|---|---|---|---|---|---|
| mean, one threshold | dev24 | 0.275 | 0.9385 | **0.8470** | 0.9160 | **0.9005** |
| mean, one threshold | LOSO | 0.275 / 0.35 / 0.35 | 0.9385 | 0.8374 | 0.9155 | 0.8971 |
| mean, per register, half-shrunk | dev24 | 0.275 below MIDI 64, 0.35 at 64 and up | 0.9391 | 0.8470 | 0.9159 | 0.9006 |
| mean, per register, half-shrunk | LOSO | capo 0.275 x 3; tuning 0.40 / 0.35 / 0.425; standard 0.30 / 0.375 / 0.425 | 0.9385 | 0.8351 | 0.9112 | 0.8949 |
| mean, per register, unshrunk | LOSO | | 0.9396 | 0.8321 | 0.9084 | 0.8933 |
| mean, no range mask | dev24 | 0.275 | 0.9379 | 0.8470 | 0.9133 | 0.8994 |
| max, one threshold | dev24 | 0.525 | 0.9335 | 0.8388 | 0.9032 | 0.8918 |
| max, one threshold | LOSO | 0.525 / 0.6 / 0.525 | 0.9335 | 0.8239 | 0.9032 | 0.8869 |
| max, no range mask | LOSO | | 0.9258 | 0.8239 | 0.8959 | 0.8819 |
| weighted mean, weights and threshold together | dev24 | gaps-paper alone, 0.45 | 0.9455 | 0.7972 | 0.8823 | 0.8750 |
| weighted mean, weights and threshold together | LOSO | fl-gaps-gp 2-2-0 at 0.35; 1-1-2 at 0.35; 0-1-3 at 0.30 | 0.9385 | 0.8332 | 0.8986 | 0.8901 |

Per-register thresholds: the global threshold first, then for each register (MIDI below 52, 52 to 63, 64 and up) the
threshold best on the fitting files with the other registers at the global one, shrunk halfway back (lambda 0.5,
fixed before looking) and snapped to the 0.025 grid.

- **The mean beats the max** by 0.009 to 0.010 on the mean. The max keeps every model's inventions.
- **The mean is the best method on the nylon song**: 0.847 against gaps's 0.830 and the best vote's 0.834. It finds
  523 key notes there against gaps's 517 and invents 84 against 101. But on capo it keeps fl's and gaps's slap notes:
  74 invented, 47 of them at slaps, against gaps-paper's 42 and 28. That costs 0.015 on capo.
- **LOSO picks a worse threshold than dev24** because the songs disagree: the nylon song wants 0.275 or lower, the
  steel songs 0.30 to 0.35. Part 1 saw the same for single models.
- **Per-register thresholds and weights are not worth fitting** on two songs or on dev24: they lower the LOSO score
  (0.895 and 0.890 against 0.897), and dev24 sends the weighted mean back to gaps-paper alone.
- **The range mask is worth +0.0002 to +0.001 for the mean and +0.005 for the max** (it removes gaps's MIDI 108 artefacts).
- **The gaps shift is worth little.** Without it (run r1523), the mean at 0.275 scores 0.9392 / 0.8430 / 0.9190 (dev24
  0.9090) against 0.9385 / 0.8470 / 0.9160 (dev24 0.9098) with it. `fusion/noshift/check.json` has 0.25 to 0.40.

### f. Per-bar pick without the key

Per bar (the key's downbeats are used only as bar lines), each tool's notes are compared with the vote of the other
tools in the set (k = a majority of the others: 2 of 2, 2 of 3, 3 of 4, 4 of 6). The tool with the highest onset F1
against that vote is picked; ties go to the more reliable tool. Nothing is fitted.

| tools | capo | tuning | standard | mean | seg30 mean |
|---|---|---|---|---|---|
| fl, gaps, gaps-paper | **0.9588** | 0.8163 | 0.8962 | 0.8904 | 0.9242 |
| fl, gaps, gaps-paper, Transkun | 0.9554 | 0.8321 | 0.9087 | 0.8987 | 0.9279 |
| the five | 0.9542 | 0.8219 | 0.9184 | 0.8982 | 0.9282 |
| all seven | 0.9544 | 0.8264 | 0.9158 | 0.8988 | 0.9242 |

It is the best non-oracle method on capo (fl, gaps, gaps-paper: 0.9588), and it is no better than the votes on the
mean. With four or more tools it captures 17 to 19 % of the per-bar oracle's gain; with the three guitar models, none.

### g. String-type gate

gaps-paper on steel strings and gaps on nylon: 0.9536 / 0.8299 / 0.8955, mean 0.8930. That is exactly the best single
tool per song. The rule was read off these three songs (gaps-paper's dev24 lead and gaps's lead on the one nylon
song), so it is not a fitted result. It also needs one more input from the user, the string type. It ranks 44th of the
58 non-oracle rows, below every vote.

## Step 3: the measures for the leaders

Whole songs. Picker seconds = the time to make the notes from the candidates' lists or rolls, on this box. Tools = the
wall seconds of the models it needs, run one after another on 2 cores (part 1 and step 2 timings).

| measure | song | gaps-paper alone | 3-of-5 vote (frozen) | 4-of-7 vote | weighted vote, all seven | roll fusion, mean, dev24 | per-bar oracle, all seven |
|---|---|---|---|---|---|---|---|
| F1 | capo | 0.9536 | 0.9567 | 0.9559 | 0.9505 | 0.9385 | 0.9687 |
| | tuning | 0.8217 (gaps 0.8299) | 0.8256 | 0.8313 | 0.8265 | 0.8470 | 0.8663 |
| | standard | 0.8955 | 0.9249 | 0.9222 | 0.9291 | 0.9160 | 0.9373 |
| P / R | capo | 0.949 / 0.958 | 0.950 / 0.963 | 0.942 / 0.971 | 0.936 / 0.966 | 0.914 / 0.964 | 0.968 / 0.969 |
| | tuning | 0.862 / 0.785 | 0.877 / 0.780 | 0.870 / 0.796 | 0.850 / 0.804 | 0.862 / 0.833 | 0.899 / 0.836 |
| | standard | 0.929 / 0.865 | 0.953 / 0.898 | 0.938 / 0.907 | 0.964 / 0.897 | 0.925 / 0.907 | 0.950 / 0.925 |
| missed + invented | capo | 34 + 42 | 30 + 41 | 24 + 49 | 28 + 54 | 29 + 74 | 25 + 26 |
| | tuning | 135 + 79 | 138 + 69 | 128 + 75 | 123 + 89 | 105 + 84 | 103 + 59 |
| | standard | 92 + 45 | 69 + 30 | 63 + 41 | 70 + 23 | 63 + 50 | 51 + 33 |
| edits, median per bar | capo / tuning / standard | 1 / 4 / 2.5 | 1 / 4 / 2 | 1 / 4 / 1 | 1 / 4 / 1.5 | 1 / 3 / 2 | 0 / 3 / 1 |
| heard-only recall | capo | 0.966 | 0.971 | 0.979 | 0.974 | 0.972 | 0.976 |
| | tuning | 0.835 | 0.836 | 0.845 | 0.854 | 0.874 | 0.876 |
| | standard | 0.904 | 0.935 | 0.940 | 0.935 | 0.938 | 0.952 |
| recall, strings 6-4 / 3-1 | capo | 0.923 / 0.979 | 0.940 / 0.977 | 0.950 / 0.983 | 0.943 / 0.979 | 0.943 / 0.977 | 0.940 / 0.987 |
| | tuning | 0.797 / 0.780 | 0.757 / 0.789 | 0.774 / 0.805 | 0.723 / 0.836 | 0.819 / 0.838 | 0.836 / 0.836 |
| | standard | 0.904 / 0.830 | 0.930 / 0.871 | 0.933 / 0.885 | 0.914 / 0.882 | 0.943 / 0.877 | 0.924 / 0.926 |
| invented at slaps | capo / standard | 28 / 44 | 21 / 29 | 25 / 39 | 26 / 22 | 47 / 43 | 15 / 29 |
| best tool's A misses won back | capo / tuning / standard | | 7 of 18 / 4 of 38 / 29 of 58 | 10 / 4 / 36 | 9 / 5 / 29 | 7 / 12 / 32 | 8 / 18 / 40 |
| 30 s segment F1 | capo / tuning / standard | 0.946 / 0.813 / 0.996 | 0.960 / 0.831 / 0.996 | 0.966 / 0.821 / 0.996 | 0.966 / 0.808 / 0.992 | 0.956 / 0.813 / 1.000 | 0.966 / 0.854 / 1.000 |
| gain share of the per-bar oracle | capo / tuning / standard | 0 / -0.22 / 0 | 0.21 / -0.12 / 0.70 | 0.15 / 0.04 / 0.64 | -0.21 / -0.09 / 0.80 | -1.00 / 0.47 / 0.49 | 1 / 1 / 1 |
| picker seconds per song | | 0 | 0.004-0.007 | 0.005-0.04 | 0.007-0.01 | 1.1-3.0 (r1512) | |
| tools' wall per song (2 cores) | capo / tuning / standard | 170 / 169 / 102 | 640 / 611 / 526 | 1327 / 1126 / 1044 | 1327 / 1126 / 1044 | 465 / 418 / 329 | |

On tuning the best single tool is gaps (0.8299), so its gain share is measured against gaps. The best tool's misses
that a method wins back are all bucket A: no non-oracle method wins back a single B or C miss. The per-bar oracle wins
back 1 B and 1 C on capo and 5 B and 1 C on standard.

## Step 4: the ranking, what to freeze, and what the gap means for the app

**Ranking by mean LOSO F1** (methods with nothing to fit count with their plain score): 4-of-7 vote, reliable onset
0.9031; 3-of-5 vote, median onset 0.9024; weighted vote of all seven, precision weights 0.9020; 3-of-5 vote, reliable
onset 0.9019; weighted vote of all seven, naive Bayes 0.9018. Then come 0.9003 to 0.8971 for other votes, the anchor,
the key-free per-bar picks and LOSO roll fusion. Among dev24-fitted methods the best are the 3-of-5 vote (0.9024) and
roll fusion with the mean (0.9005 to 0.9006).

**What I would freeze: the 3-of-5 vote of fl, gaps, gaps-paper, Transkun and Basic Pitch (range hint), median onset.**
- It is 0.0007 below the top, and that is no difference on three songs.
- Its k is the same in every fold and on dev24, so the choice is stable. The 4-of-7 vote's k moved for the median rule.
- It needs only tools that run on this box. YourMT3+ ran on a public Space, and the separation run adds a separator.
  The tools take about 530 to 640 s a song on 2 cores one after another, plus 0.01 s for the vote.
- Its weak side is the nylon song (0.826, below gaps's 0.830). There, roll fusion with the mean at 0.275 (0.847) is the
  method to offer next to it, since it is the only method that gains on that song.

A held-out song is the real test (E7). On dev24 the 3-of-5 vote scores 0.905, below gaps-paper's 0.915. So the
vote's gain could be specific to these songs, where Transkun and the other tools are stronger than on GuitarSet.

**The vote-to-oracle gap.** The per-bar oracle over all seven is 0.924, and the app's own per-bar oracle (the user picks
among the vote, gaps-paper, fl, gaps and Transkun) is also 0.924. The frozen vote is 0.902. Against the app's oracle
the gap is 0.021 on the mean: 0.013 on capo, 0.035 on tuning and 0.016 on standard. By the brief's rule that is more than 0.01, so picking per bar is
worth offering as a main interaction, and most of all on the nylon song. But two other numbers say where the work is:
- A perfect per-bar picker would change 20 of 72, 30 of 49 and 18 of 56 bars. Every bar but 7, 1 and 2 has some
  difference between the tools. So "pick only where methods disagree" does not narrow the bars at all with five tools.
  The app needs a better signal of which bars to show first.
- The note-level oracle is 0.973. Per-bar picks win back 0.02, and keeping the right single notes wins back 0.07.
  After the vote, the edits left are a median of 1 to 2 per bar on the steel songs and 4 on the nylon song. A
  note-by-note correction step (show the candidates the vote dropped, and the notes only one or two tools have) is
  worth more than bar picks.

## Handoff for LOOP

The top three non-oracle methods by mean LOSO F1, on each song, with the setting chosen without that song:

| method | folder | notes capo / tuning / standard |
|---|---|---|
| 4-of-7 vote, onset of the most reliable member | `/home/user/gtv/notes/<S>/e1-vote-all-reliable-loso/` | 840 / 575 / 657 |
| 3-of-5 vote, median onset (the one I would freeze) | `/home/user/gtv/notes/<S>/e1-vote-five-median-loso/` | 826 / 559 / 640 |
| weighted vote of all seven, precision weights by LOSO | `/home/user/gtv/notes/<S>/e1-wvote-all-prec-losoW/` | 841 / 594 / 632 |

Columns `onset,offset,pitch,support,conf`.
- `support` = how many of the seven candidate lists have a note of the same MIDI pitch within 50 ms (1 to 7).
- `conf` = the largest `reg_onset_output` of the fl, gaps and gaps-paper rolls at that pitch within 50 ms (a
  regression target, not a probability).

`source.json` beside each file gives the method, its setting for that song, the candidate files, the source CSV's
sha256 and the song's scores. The handoff files score the same as the method's notes (checked with the gtr-eval CLI on
capo, 3-of-5: 0.956734). Roll fusion (mean, dev24) is not in the handoff because it ranks 11th (its per-register variant ranks 8th). Its notes are in
`/home/user/notes/runs/e1/out/notes/fuse-mean-dev24/`, for LOOP to take if the nylon song needs it.

## What is uncertain

- **Three songs.** The top ten are within 0.003, and one LOSO fold has only two songs to choose from. The ranking among
  them is not meaningful. What holds across every method is: votes and fusion gain about 0.01 over gaps-paper, nearly
  all of it on the standard song; nothing that chooses among the models reaches the per-bar oracle; and the nylon song
  has the most misses that no model saw.
- **dev24 disagrees.** No vote, weight or anchor beats gaps-paper alone on GuitarSet. Whether the songs or GuitarSet
  is the better guide for a new fingerstyle recording is what E7's held-out songs will tell.
- **The keys.** Tab-only notes are 54, 72 and 96 of the key notes. They make up about half of the B and C misses on the
  steel songs. The tuning key may time some notes about 30 ms late (E0's 33 timing-question notes); 13 of the A misses
  there may be timing, not content. Heard-only recall is given for this reason.
- **The per-bar oracle's tie rule and bar lines** (the key's downbeats) are one reasonable choice. With Beat This!
  downbeats on a held-out song the bars will move.
- **YourMT3+** ran on a public CPU Space in step 2. A method that needs it (the 4-of-7 vote, the weighted vote of all
  seven) cannot run offline on this box today.
- **Licences** (brief, section 9): gaps and gaps-paper were trained on GAPS (non-commercial research), fl on a set
  given for research. Every method here leans on them.

## Files

| path | what |
|---|---|
| `/home/user/notes/runs/e1/e1.json` | every method's numbers per song (whole and seg30), settings, picker seconds, tool walls, the CLI check, the diagnosis summary |
| `/home/user/notes/runs/e1/out/main_table.md` | the full ranking (66 rows) |
| `/home/user/notes/runs/e1/out/tables.md` | every setting of the votes, the anchor's best settings, the fusion thresholds, the weighted means |
| `/home/user/notes/runs/e1/out/fit.json` | every setting's F1 on the songs and dev24, and every dev24 and LOSO choice (votes, weighted votes, anchors) |
| `/home/user/notes/runs/e1/fusion/scores.json`, `fusion/dec/`, `fusion/chosen/`, `fusion/noshift/` | roll fusion: every setting, the decoded notes per threshold, the chosen note lists, the no-shift check |
| `/home/user/notes/runs/e1/out/diag.json` | step 0: every missed and invented note's bucket and tags (it holds key note times and pitches, so it stays in the work folder) |
| `/home/user/notes/runs/e1/out/notes/<method>/<S>.csv`, `<S>.seg30.csv` | every method's notes |
| `/home/user/notes/runs/e1/out/cli/`, `out/cli_check.json` | the gtr-eval CLI files of record and the equality check |
| `/home/user/notes/runs/e1/out/disagree.json` | bars where the tools differ from the vote |
| `/home/user/notes/runs/e1/bin/` | every script: `e1lib.py`, `methods.py`, `diag.py`, `fit.py`, `fuse_decode.py`, `fuse_score.py`, `fuse_time.py`, `collect.py`, `score_cli.py`, `tables.py`, `handoff.py`, `disagree.py` |
| `/home/user/gtv/notes/<S>/e1-<method>/` | the handoff for LOOP |

## Checker

Checked on 2026-11-27 by an independent checker of the NOTES session. Work folder `/home/user/notes/runs/check-e1/`
(`PROGRESS.md`, `bin/`, `out/`; the record before these edits is in `backup/e1-votes.md.orig`). I wrote my own scorer
(`bin/ck.py`: mir_eval `match_notes`, onset 50 ms, 50 cents, offsets ignored, drums left out), my own clustering and
votes, my own per-bar oracle and my own roll fusion. I did not import `e1lib.py` or `methods.py`. Nothing was run
on a held-out song. Every check took seconds on this box, so none went through gtr-run.

**Verdict: the numbers stand.** The fits are LOSO or dev24 as stated, and the oracles are labelled. Five sentences
were wrong or unclear. I corrected them above, and they are listed at the end of this section.

### What I re-derived

| check | how | result |
|---|---|---|
| every method's F1, all 74 note folders, whole songs and seg30 | my scorer; my own crop of the whole-song notes; segment keys made again with `crop_truth.py` (they equal E0's) | the largest difference from `collect.json` is 5e-7 (F1, seg30 F1, heard-only recall) |
| the three handoff methods | gtr-eval CLI on `/home/user/gtv/notes/<S>/e1-*/notes.csv` | 0.9559 / 0.8313 / 0.9222; 0.9567 / 0.8256 / 0.9249; 0.9505 / 0.8265 / 0.9291, as in the record |
| k-of-n votes, both onset rules, all five sets | my own clustering; k re-fitted by LOSO and on dev24 | every chosen k and F1 is the same. 4-of-7 reliable: k 4, 4, 4, mean 0.9031. 3-of-5 median: k 3 in every fold and on dev24 (dev24 0.9053), mean 0.9024 |
| the weighted vote of all seven, precision weights | weights and threshold fitted again on the two other songs | thresholds 4.5 / 5.5 / 6.0, F1 0.9505 / 0.8265 / 0.9291, mean 0.9020 |
| roll fusion, mean | my own fusion (gaps moved 7.5 ms later with `np.interp`), the package's decoder at 0.275, range mask | 0.9385 / 0.8470 / 0.9160, the same note counts (860 / 607 / 666) |
| the fusion threshold | E1's decoded notes scored again | dev24 picks 0.275 (dev24 0.9098); the LOSO picks are 0.275 / 0.35 / 0.35, mean 0.8971 |
| single-model fusion and dev24 | the gaps-paper roll alone at 0.30 and 0.45 | it reproduces gaps-paper on the songs; dev24 0.9146 at 0.30 and 0.9177 at 0.45 |
| ORACLE per-bar picks and the note-level oracle | my own code | three tools 0.9136, four 0.9189, all seven 0.9241, note level 0.9733 |
| dev24 single tools | my scorer | gaps-paper 0.9146, fl 0.8957, gaps 0.866, Transkun 0.771, Basic Pitch 0.744 |
| step 3's P, R, missed + invented, heard-only recall, seg30 | my scorer, for the six leaders | every cell of the step-3 table matches |
| step 0's buckets and invented-note categories | my own code from the rolls | it matches when I use E1's frame window; see the first item below |
| the reliability order | YourMT3+, Basic Pitch and the separation run moved to other places in the order | the 4-of-7 reliable vote does not change (0.9031) |
| handoff files | columns, row counts, sha256 of the source, `support` and `conf` worked out again | columns `onset,offset,pitch,support,conf`; rows 840/575/657, 826/559/640 and 841/594/632; every sha256 matches; `support` matches everywhere; `conf` differs in 3 of 6,164 rows (the frame window) |
| run ids | `/home/user/gtr/ledger/runs.jsonl` | r1493, r1497, r1498, r1511, r1512, r1521 and r1523 are all there, lane notes, exit 0, with the wall times the record gives |
| this file | the repo's never-publish hashes, a scan for hosts, URLs, credentials and note rows | no hits. It holds numbers only: no key note list and no tab text |

### Corrections and caveats

- **Step 0's ±50 ms window is really up to ±55 ms.** E1 takes frames `round((t - 0.05) * 100)` to
  `round((t + 0.05) * 100)`, inclusive. With an exact ±50 ms window:
  - tuning is A 37, B 31, C 43 (record: 38 / 31 / 42), and its rolls at 0.3+ are fl 22, gaps 17, gaps-paper 24
    (record: 23 / 18 / 27);
  - standard is A 58, B 13, C 21 (record: 58 / 14 / 20);
  - capo is the same.

  No conclusion changes. The 3 handoff `conf` values come from the same window.
- **"Octave or twelfth" was described as partials.** E1's rule takes invented pitch minus key pitch = +12, -12, +19
  or +24. On the nylon song, 42 of the 55 sit above a ringing note, where a partial is. The other 13 are an octave
  below one, and a note below is not a partial of it. I corrected the rule and the two sentences that read the 55
  as partials.
- **Two rank references were wrong.** The single-threshold roll fusion (mean, dev24) ranks 11th, not 8th (8th is its
  per-register variant). The 4-of-7 vote with the median onset is rank 12, not "row 9". Both are fixed above.
- **The string-type gate's nylon arm is an oracle choice for the tuning song.** The rule "gaps on nylon" was read off
  the tuning song itself. Under LOSO the tuning fold has only steel songs, so it could not choose that rule. Its
  0.8299 on tuning, and so its mean of 0.8930, is not a fitted number. The record says the rule was read off the
  songs. Read that row as an oracle on tuning.
- **The ranking itself is chosen on these three keys.** Each method's F1 is fitted without the song it is scored
  on. But the frozen method was then picked among about 58 by those same scores. So 0.902 to 0.903 for the winner
  is optimistic, and E7's held-out songs are the real test. The record already says the top ten cannot be told
  apart.
- **The reliability order is partly from the songs.** YourMT3+ has no dev24 run, so its place in the order came from
  its song F1. Moving it, Basic Pitch or the separation run to other places changes nothing at k = 4. So that leak
  has no effect.

Checker files: `/home/user/notes/runs/check-e1/out/` (`rescore_all.json`, `refit_votes.json`,
`refit_wvote_all_prec.json`, `refit_fusion.json`, `oracles.json`, `diag_check.json`, `diag_check_roundwin.json`,
`handoff_check.json`, `fuse-mean-0.275.<S>.csv`).
