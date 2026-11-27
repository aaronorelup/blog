# HAND-CHECK: an independent check of E1 (L-E1) before the loop builds on it

By e1-verify, 2026-11-27. I did not build E1. Every number below comes from my own scripts in `G/work/e1-verify/`
(`G` = `/home/user/gtv`), not from `score_e1.py`. Nothing published was changed. Songs read capo / nylon / standard (nylon
is slot `tuning`). **Verdict: every number holds; five small problems, none of which changes a number or the default.**

## 1. The default's numbers, recomputed (`check1.py` -> `check1.json`)

My definitions are LOOP.md's E1 text. Each fretted key note (fret 1 or more from the capo) is scored on the
`hand_window.csv` row nearest its onset (all within 0.017 s). A row is lost when `lost` = 1 or `lo` is blank. Places are
counted on frets 0-17, one per string, with open strings always allowed.

| song | fretted (heard) | lost | excluded | coverage, not lost / of all / heard | mean width | places per note, all key notes | one place |
|---|---|---|---|---|---|---|---|
| capo | 557 (519) | 0 | 3 | 0.9946 / 0.9946 / 0.9942 | 5.454 | 3.459 -> 1.533 (815 notes) | 0.096 -> 0.519 |
| nylon | 206 (181) | 2 | 0 | 1.0000 / 0.9903 / 1.0000 | 3.730 | 3.623 -> 1.449 (628) | 0.107 -> 0.584 |
| standard | 546 (484) | 1 | 1 | 0.9982 / 0.9963 / 0.9979 | 4.583 | 3.239 -> 1.236 (679) | 0.057 -> 0.772 |
| pooled | 1309 | 3 | 4 | 0.9969 / 0.9947 | 4.821 | 3.437 -> 1.413 (2122) | |

Every cell equals HAND.md's headline and `hand.json` (`<S>|checked|1|30`, `pooled`). The excluded notes are the same: capo
41.01 s (string 4, fret 9; window 2-8), 109.60 (4/9; 1-6) and 128.77 (2/5; 2-4); standard 49.46 (3/9; 1-8). **All
conditions:** `check4.py` recomputes all 84 in `G/loop/e1/rec/`. It finds 0 differences from `hand.json`, 0 between HAND.md's
big table and `hand.json`, the same 31 tool exclusions (HAND.md's list plus its 19 fret-2 notes), the same margin-2
exclusions (109.60; v0 also 125.08), and the same 10-vs-30 deltas (tracked 0.0036 coverage, 0.06 width; v0 0.0072).

## 2. Twelve key notes looked at (`pick12.py`, seed 20261127 + song index; images in `G/work/e1-verify/look/`)

Each image shows the published overlay, cropped round the neck and enlarged, above the bare frame. I counted the wires
myself. Capo: the capo's wire is wire 3; the inlays at 0, 2 (double), 4, 6, 9 (triple), 12 and 14 from the capo are nut
frets 3, 5, 7, 9, 12, 15 and 17. Standard has the same pattern. Nylon has no inlays: wire 0 is on the bone nut and wire 12
at the body join.

| song | onsets s | key string/fret (from capo) | windows | numbering right | covers the playing finger |
|---|---|---|---|---|---|
| capo | 15.54 / 107.14 / 125.69 / 223.87 | 3/2, 4/9, 2/5, 3/7 | 1-5, 6-11, 2-6, 6-11 | yes x4 | yes x4 |
| nylon | 31.33 / 104.37 / 159.80 / 172.82 | 3/2 (+4/2), 4/2, 6/2, 6/2 | 1-3, 1-4, 1-4, 1-3 | yes x4 | yes x4 |
| standard | 6.92 / 53.44 / 100.73 / 140.70 | 4/2 (+2/1), 3/4 (+4/2), 2/3, 3/2 | 1-4, 1-5, 1-4, 1-5 | yes x4 | yes x4 |

12 of 12 are numbered right and covered. On the steel songs the drawn wires lie on the real ones within a few pixels. On
nylon, zooms (`zoomnut_104.368.jpg`, `zoomnut_172.82.jpg`) show the nut and wire 1 drawn about 20 frame px (0.25 fret)
towards the headstock; from wire 3 on, the error is under 10 px (problem 5). At capo 128.77 s (`x_capo_128.77.jpg`) a finger
frets the treble strings at fret 5 under the check's 2-4, which confirms HAND.md's "one wrong correction by the check".

## 3. The blind runs

- **Prompts** (`G/loop/blind/hand-*.prompt.txt`, the same as each `PROMPT.txt`): no song, player, title or answer. The
  anchor runs get `video.mp4`, `hands.jsonl` and `TOOLS-HAND.md`; the checks also get anchors, track, window, tips and
  `onsets.csv`. The capo is given in each.
- **Inputs** (`cmp`): every video and landmark file is a byte-identical copy (1 link) of `songs/capo/capo.mp4`,
  `songs/standard/standard.mp4`, `blind/b2/video.mp4` (nylon, cards blacked out) or `experiments/<S>/w-01/<S>_full.jsonl`.
  The mp4s carry no title tags. `onsets.csv` is chain-2's onset times only (882 / 734 / 611, all equal to chain-2's
  `notes.csv`). `leakgrep.py` finds no title word and no truth, songs or experiments path; the only absolute paths are the
  manual's `PY` and `HR`. All six manuals equal the tool's `TOOLS-HAND.md`.
- **My transcript scan** (`scan_tx.py`, every tool call of the six runs and of the smoke test -> `scan_<label>.json`): only
  Bash, Read, Write and Edit were used. Calls 111 / 38 / 89 / 42 / 119 / 87 and images 49 / 14 / 32 / 16 / 32 / 28, as in
  HAND.md. There are 0 paths outside each run's folder, the hand tools, the video Python and its own `/tmp` scratchpad; 0
  network, git, install or search commands; 0 mentions of truth, songs, experiments, work, blog, `.claude` or chain-2. No run
  is void.
- **The watch** (`accesswin.py` -> `accesswin.out`): the log has no process ids. During the anchor window (02:58-03:29 UTC)
  and the check window (03:40-04:00), other lanes opened `G/songs` (3,392 / 11,792 lines), `G/truth` (1,315 / 172) and
  `G/experiments` (930 / 748). "Clean" therefore rests on the sandbox, which puts a tmpfs over every answer-bearing place, and
  on the transcripts (problem 2). Each run row's minutes, tokens, cache and cost match `run.meta.json` (problem 3 is the totals).

## 4. Records against files

- `loop/hand/<S>/hand_window.csv` is **byte-identical** to `G/loop/hand/<S>/` and to `G/loop/e1/rec/<S>/checked/m1_f30/`.
  The SHA-256 values equal `hand.json` `default.files`. `hand/hand_filter.py` equals the tool's copy. All files are under 300 KB.
- **The solver table:** 60 cells equal `hand.json`, and all 180 eval ids (e1309-e1508) are in `G/loop/ledger/evals.jsonl`
  with the same values.
- **The checks' effects:** capo lost 0.0162 -> 0, of all 0.9803 -> 0.9946; standard width 4.68 -> 4.58, 0.9945 -> 0.9963;
  nylon 9 of 5,620 rows changed. Capo's 13 lines are 3 false taps and 10 lost runs; the decisions are 106 / 53 / 59.
- **The assisted claims:** 8 / 15 / 25 exclusions, 14 of nylon's 15 above the window, capo's 4 new at 171.85-188.09 s, 24
  fret-2 notes (10 with dev).
- **The rest:** the film rows (`hand.json` `film`, five mp4s), "E3 used margin 1" (`LADDER.md`) and every script named
  exist as stated. HAND.md and `hand.json` hold no title word, no link and no `/root` path.

## PROBLEMS

1. **Hard-linked, unsandboxed blind folder** (`G/loop/blind/e1-smoke-n/`, e1-tracker's smoke test, not a condition).
   - What and evidence: `hands.jsonl` shares an inode with `G/experiments/tuning/w-01/tuning_full.jsonl` (2 links), and
     `video.mp4` with `G/blind/b2/` and `G/blind/c2/` (3 links). So `find -samefile` names the slot, against "copies, never
     ln". `run.meta.json` says `sandboxed: false`. Its transcript is clean (121 calls, 0 flags), and no E1 number uses it.
   - Fix: replace the links with copies, and add one line to HAND.md that the smoke test is not a condition.
2. **The watch is overstated** (HAND.md "The blind runs": "Audited by e1-blind (..., with the file-access watch)").
   - What and evidence: the watch has no process ids and cannot see inside the sandbox's tmpfs, so it neither sees nor clears
     a run. See `accesswin.out`, and e1-blind's `audit_hand-a-anchors.json` (5,793 answer-place lines in its window).
   - Fix: "clean by transcript audit inside the sandbox; the watch cannot attribute accesses".
3. **Totals are sums of rounded values** (HAND.md "all six" row: 133.0 min and $26.35).
   - Evidence and fix: `run.meta.json` gives 7,976 s and $26.336, so write 132.9 min and $26.34.
4. **"Places per note" names the wrong notes** (HAND.md headline, and the sentence before the big table).
   - What and evidence: the places are over ALL key notes, open ones included (815 / 628 / 679). Over the fretted notes
     the sentence names, they are 3.24 -> 1.35 / 3.20 -> 1.12 / 3.13 -> 1.13 (`check1.json`). `hand.json`'s definition is right.
   - Fix: "of all key notes".
5. **Nylon's near-nut wires are drawn about 0.25 fret towards the headstock** (`G/loop/hand/tuning/` anchors and track).
   - What and evidence: at 104.37 and 172.82 s the nut and wire 1 sit about 20 frame px past the real nut
     (`look/zoomnut_*.jpg`), so a tip just behind wire 1 can read fret 2. Margin 1 absorbs it; nylon has 0 exclusions even at
     margin 0.
   - Fix: none for the default. For margin 0 or new players, snap wire 0 to a visible nut; note it in HAND.md "What fails".
