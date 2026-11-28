# gtr-eval 0.12.0: fix notes

Two defects of gtr-eval 0.11.1, found by lane agents and confirmed in the code by a critic (rows X1 and X2 of the
"scripts (gtr-eval)" table in `../GAPS.md`), are fixed in gtr-eval 0.12.0 (2026-11-11). No metric definition changed.
Source: `/home/user/gtr/eval/` (copy in `gtr-eval/` next to this file, README changelog entry 0.12.0). Every scoring run
is in `/home/user/gtr/eval/ledger/evals.jsonl`; no line of it was changed or removed, and the re-scorings below were
appended as new evals.

## 1. What changed

| | 0.11.1 | 0.12.0 |
|---|---|---|
| `tab`, ASCII tab: where the capo comes from | the first non-staff line where one of three patterns matched anywhere in the line, title lines included | only a capo line: a line whose first word is "capo" or whose first words are "no capo" (spaces and `# / % * - [ ( > \|` in front ignored), or a line with a "Capo:" or "Capo =" field anywhere; the value is read at that statement. Lines before it that mention a capo are quoted in `processing` |
| `f0`: reading a row | the time was appended before the frequency cell was parsed, so an empty or unreadable cell left the time, frequency and confidence arrays with different lengths, and the run stopped with `IndexError` | every cell of a row is read before the row is kept; an empty frequency cell is 0 Hz (unvoiced); an empty confidence cell is no confidence; a row with a readable time whose frequency cell is missing, or whose frequency or confidence cell is text that is not a number, is left out and counted in `processing` |

Code: `capo_statements()` and the capo loop of `_load_ascii_tab()`, and the row loop of `cmd_f0()` in `gtr_eval.py`.
The new `processing` lines appear only when such a line or cell exists, so every other result is identical apart from
`gtr_eval_version` (section 5).

The capo rule on example lines (from the selftest and the inputs' own `<id>.tab.txt` files):

- Same value in both versions: "Capo: 2nd fret", "Capo 2", "[Capo 2nd fret]", "// Capo at fret 5", "No capo",
  "Capo: none", "capo=3", "Key: G   Capo: 2", "Tuning (string 6 to 1, without capo): E2 A2 D3 G3 B3 E4   Capo: fret 2
  (fret numbers below are counted from the capo)".
- Read by 0.11.1, not read by 0.12.0: "Title: S2 with a capo on fret 2", "Synthesized: the S2 tab played with a capo on
  fret 2 (...)", "Tuning: E2 A2 D3 G3 B3 E4, no capo.", "Tuning: Standard, capo 2nd fret", "Played with capo 2". A file
  without a capo line is scored with the truth's capo and the output says it was assumed; `--est-capo` sets it.
- Effect inside the selftest: the inputs builder's R1a, R1b and R1c tab files state the capo only as "Tuning: E2 A2 D3
  G3 B3 E4, no capo.", so their sidecar checks now run with the truth's capo (0) assumed instead of read; the checks
  pass as before. The S1 to S7 tab files are read from their "Capo: none" or "Capo: fret 2" field as before.

## 2. Self-tests

New checks in `gtr_eval_selftest.py` (part 1, so plain `gtr-eval selftest` runs them). "0.11.1" below is the 0.11.1
scorer run with the new test file:

| check | what it writes | 0.11.1 | 0.12.0 |
|---|---|---|---|
| `f0.empty_frequency_cells_unvoiced` | fixture f0 with `<t>,,0.0` in the 161 unvoiced frames; must score exactly like the same file with 0 in those cells | FAIL: raised IndexError: index 640 is out of bounds for axis 0 with size 640 | PASS: same five numbers as the 0 file, overall accuracy 1.0 |
| `f0.empty_confidence_and_text_cell` | every confidence cell empty, plus a row `8.5000,n/a,0.9` | FAIL: raised IndexError: index 801 is out of bounds for axis 0 with size 801 | PASS: overall accuracy 1.0, 801 rows used, both counted in `processing` |
| `tab.ascii_capo_in_title_not_read` | TuxGuitar-style header "Title: FX1 with a capo on fret 2", no capo line; truth capo 2 | FAIL: capo 2 "stated in the estimate file" | PASS: capo 2 "not stated in the estimate; the truth capo is assumed" |
| `tab.ascii_capo_line_after_title` | "Title: FX1, capo 5 version", then "[Capo 2nd fret]"; truth capo 2 | FAIL: capo 5, same string and fret 0.0 | PASS: capo 2 from the capo line, 1.0 |
| `tab.ascii_capo_field_in_tuning_line` | the inputs builder's form "Tuning (...): E2 ...   Capo: fret 2 (...)" (guard: must keep working) | PASS | PASS |

Full runs, both on the inputs as they are on 2026-11-11:

| run | 0.11.1 | 0.12.0 |
|---|---|---|
| `gtr-eval selftest` (part 1) | 119 PASS (part 1 of the run below) | 124 PASS, 0 FAIL, 0 N/A |
| `gtr-eval selftest --all-inputs` | 354 PASS, 0 FAIL, 52 N/A | 359 PASS, 0 FAIL, 52 N/A |

Every check that passed on 0.11.1 passes on 0.12.0; the 5 more are the new checks; no check changed result. The stored
2026-11-10 `selftest.txt` (350 PASS, 40 N/A) predates inputs R3b and R3c. `selftest.txt` and `selftest.json` now hold
the 0.12.0 `--all-inputs` run.

## 3. Re-scored evals

Logged in the ledger with gtr-eval 0.12.0 and `agent_hint` "fix-gtr-eval": the old eval's arguments and working
directory (`/home/user/blog`), without `--out` (e0440 to e0447 had written their result JSON into the
fingerstyle-voices-taps lane's `out/essentia-melodia/` folder; this re-scoring wrote nothing there, the results are in
the ledger).

| old id (0.11.1) | arguments | old result | new id (0.12.0) | new result |
|---|---|---|---|---|
| e0468 | `tab --truth S5capo2 --est /home/user/gtr/lanes/web-tab-render/out/tuxguitar/S5capo2.tg.ascii.txt` | exit 0; est capo 2, "stated in the estimate file" (`processing`: "ASCII tab: capo 2 read from the line 'Title: S2 with a capo on fret 2'"); 90 of 90 matched by order, same string and fret 1.0 | e1771 | exit 0; est capo 2, "not stated in the estimate; the truth capo is assumed" (`processing` quotes line 1 as not a capo line); 90 of 90 matched, same string and fret 1.0. Only `tuning_and_capo.est.capo_source` and `processing` differ |

`f0` (estimate `/home/user/gtr/lanes/fingerstyle-voices-taps/out/essentia-melodia/<clip>.melodia.csv`, Essentia
Melodia, header `time_s,f0_hz,confidence`; old result for all eight: exit 3, "IndexError: index N is out of bounds for
axis 0 with size N", N = the clip's number of rows with a frequency):

| old id | clip, `--voice` | old error index | new id | voicing recall | voicing false alarm | raw pitch accuracy | raw chroma accuracy | overall accuracy |
|---|---|---|---|---|---|---|---|---|
| e0440 | S2n, melody | 5654 | e1772 | 0.644524 | 0.029484 | 0.628707 | 0.628707 | 0.67609 |
| e0441 | S2n, bass | 5654 | e1773 | 0.644471 | 0.038741 | 0.0 | 0.258819 | 0.135218 |
| e0442 | S2s, melody | 8348 | e1774 | 0.945038 | 0.078624 | 0.795571 | 0.795571 | 0.813011 |
| e0443 | S2s, bass | 8348 | e1775 | 0.944907 | 0.09201 | 0.0 | 0.473642 | 0.127725 |
| e0444 | S6taps, melody | 8356 | e1776 | 0.945038 | 0.078624 | 0.79399 | 0.79399 | 0.811649 |
| e0445 | S6taps, bass | 8356 | e1777 | 0.944907 | 0.09201 | 0.0 | 0.472057 | 0.127725 |
| e0446 | S5dropd, melody | 5651 | e1778 | 0.643337 | 0.029484 | 0.627916 | 0.627916 | 0.675409 |
| e0447 | S5dropd, bass | 5651 | e1779 | 0.643282 | 0.038741 | 0.0 | 0.259612 | 0.135218 |

- The four files have 10,116 rows each; empty frequency cells: S2n 4,462, S2s 1,768, S6taps 1,760, S5dropd 4,465
  (`processing` of each new eval counts them). The files were last modified 2026-11-10 21:33:00 to 21:33:05 UTC, before
  e0440 ran (21:33:11), so they are the files the failed runs read (a failed result records no hash; the new results
  record the SHA-256).
- e1772 to e1779 have exactly the metrics and counts of e0448 to e0455, the lane's first runs on `<clip>.melodia0.csv`,
  its copy with 0 written in the empty cells. Each of those copies was larger than the `.melodia.csv` by exactly its
  number of empty cells in bytes (S2n 202,474 = 198,012 + 4,462) and had the same first and last time and median hop.
- The lane's `trials.md` table cites e0478, e0483, e0487, e0492, e0501, e0509, e0517 and e0528, which score a later
  `<clip>.melodia0.csv` with times written to 6 decimals (frame index x 128 / 44100) instead of 4. For S2s and S6taps
  those numbers equal the new evals; for S2n and S5dropd they differ by at most 0.0004 (overall accuracy 0.675749 in
  e0478, 0.67609 in e1772), from the time rounding in the estimate files, not from gtr-eval.

## 4. Other earlier evals whose stored result would change

None.

- ASCII tab: the ledger holds 4 `tab` evals of ASCII-tab estimates, all TuxGuitar exports: e0461 (S2n), e0468
  (S5capo2), e0475 (S5dropd), e0484 (S2n, `alphatabgp7.tg.ascii.txt`). Only e0468's file contains the word capo at
  all. Beyond the ledger: of the 149 `.txt`, `.tab` and `.asc` files under `/home/user/gtr/lanes/` (virtual
  environments left out) that gtr-eval's ASCII-tab detector accepts, two mention a capo: the e0468 file and its
  byte-identical copy `web-tab-render/verify-trials/rerun/tuxguitar/S5capo2.tg.ascii.txt`, which no ledger eval scored.
- `f0`: of the 149 `f0` evals (all 0.11.1), only e0440 to e0447 have estimate rows with an empty or unreadable cell
  (only empty frequency cells; no empty confidence cell, no text cell). 0.11.1 stopped on any such row, so no
  successful `f0` eval can contain one.

## 5. Results of untouched inputs are identical

Method (`/home/user/gtr/eval/checks/0.12.0/rescore_compare.py`): of the 1,770 earlier evals in the ledger (e0001 to
e1770, all gtr-eval 0.11.1), 264 were selected: every `f0` eval (149), every `tab` eval of an ASCII-tab estimate (4),
every other failed eval (6, all `tab`), and an even spread over the ledger of every other subcommand (105: `notes` 14,
`tab` 14, `beats` 12, `chords` 12, `onsets` 12, `key` 10, `tempo` 10, `tuning` 8, `tab-frames` 8, and 5 `stems` evals
among those that took at most 5 s). An eval is compared only if every input file whose SHA-256 its stored result
records (truth, estimate, stem files) still has that hash. Each was run through the installed launcher
(`/home/user/gtr/bin/gtr-eval`, 0.12.0) with the stored arguments minus `--out`, plus `--no-ledger`, in the stored
working directory, one at a time at nice 19 (2026-11-11 00:28 to 00:33 UTC). A result counts as identical when the exit
code is the same and the whole result JSON is equal after removing `gtr_eval_version` from both. Output, one line per
eval: `/home/user/gtr/eval/checks/0.12.0/compare.jsonl`.

| subcommand | identical | differ | not compared |
|---|---|---|---|
| `f0` | 133 | 8: e0440 to e0447 (section 3) | 8: e0448 to e0455, whose `<clip>.melodia0.csv` the lane rewrote with 6-decimal times after those runs |
| `tab` | 23 | 1: e0468 (only `processing` and `tuning_and_capo` differ) | 0 |
| `notes` | 14 | 0 | 0 |
| `beats` | 12 | 0 | 0 |
| `chords` | 12 | 0 | 0 |
| `onsets` | 12 | 0 | 0 |
| `key` | 10 | 0 | 0 |
| `tempo` | 10 | 0 | 0 |
| `tuning` | 8 | 0 | 0 |
| `tab-frames` | 8 | 0 | 0 |
| `stems` | 5 | 0 | 0 |
| total | 247 | 9 | 8 |

The 247 identical evals (exit code 0 for 238; exit code 1, the same error message, for e0141, e0328, e0990, e0995,
e1002, e1108, e1193, e1194, e1195). They include the eight evals the fingerstyle-voices-taps lane cites for Essentia
Melodia (e0478, e0483, e0487, e0492, e0501, e0509, e0517, e0528) and the other three ASCII-tab evals (e0461, e0475,
e0484):

- `beats` (12): e0160, e0258, e0300, e0506, e0547, e0936, e1064, e1157, e1346, e1357, e1368, e1489
- `chords` (12): e0014, e0243, e0306, e0585, e0613, e0929, e1089, e1189, e1284, e1293, e1383, e1490
- `f0` (133): e0112 to e0115, e0117 to e0118, e0120 to e0123, e0126, e0128, e0130, e0132, e0134, e0136, e0138, e0140, e0143, e0146 to e0150, e0292 to e0293, e0295, e0297, e0299, e0301, e0331, e0333, e0335, e0337, e0339, e0341, e0478, e0483, e0487, e0492, e0501, e0509, e0517, e0528, e0564, e0572, e0582, e0590, e0597, e0603, e0745, e0747, e0749 to e0750, e0752, e0754, e0756, e0758, e0760, e0763, e0765, e0769, e0938, e0969, e0972, e0975, e0978, e0980, e0982, e0994, e0997, e1000, e1003, e1005, e1008, e1011, e1014, e1016, e1018, e1021, e1023, e1025, e1027 to e1028, e1030, e1032, e1034, e1192 to e1195, e1200 to e1202, e1204 to e1206, e1226 to e1229, e1297 to e1314, e1402 to e1407, e1478 to e1485
- `key` (10): e0020, e0626, e0793, e0864, e0931, e0981, e1055, e1112, e1162, e1214
- `notes` (14): e0007, e0209, e0326, e0378, e0502, e0546, e0599, e0738, e0786, e0828, e0874, e1048, e1320, e1570
- `onsets` (12): e0022, e0040, e0081, e0089, e0098, e0106, e0427, e0645, e0701, e0718, e0974, e1279
- `stems` (5): e0167, e1433, e1536, e1548, e1560
- `tab` (23): e0001, e0048, e0141, e0177, e0201, e0328, e0382, e0411, e0461, e0470, e0475, e0484, e0658, e0700, e0732, e0863, e0990, e0995, e1002, e1108, e1344, e1462, e1511
- `tab-frames` (8): e0207, e0224, e0244, e0897, e0918, e1723, e1735, e1747
- `tempo` (10): e0019, e0271, e0553, e1022, e1159, e1338, e1621, e1641, e1661, e1681
- `tuning` (8): e0069, e0266, e0336, e0424, e0596, e0621, e1111, e1252

## 6. Files

- `/home/user/gtr/eval/gtr_eval.py`: 0.11.1 to 0.12.0 (the two fixes, version and date).
- `/home/user/gtr/eval/gtr_eval_selftest.py`: the five checks of section 2.
- `/home/user/gtr/eval/README.md`: `f0` input, ASCII tab capo rule, selftest list, changelog entry 0.12.0.
- `/home/user/gtr/eval/selftest.txt`, `selftest.json`: the 0.12.0 `--all-inputs` run.
- `/home/user/gtr/eval/sync_docs.sh`: now also copies `README.md`, which it did not before (the two README copies were
  identical before this change).
- `/home/user/gtr/eval/fixtures/FX1/`: rewritten by every selftest run as before; the samples are unchanged, the WAV
  hashes change because libsndfile writes a time stamp into the PEAK chunk.
- `/home/user/gtr/eval/checks/0.12.0/`: the scripts and outputs behind sections 3 to 5 (`scan_f0.py` and
  `scan_f0.json`, `rescore_logged.py` and `rescore_logged.json`, `rescore_compare.py` and `compare.jsonl`).
- Ledger: 9 lines appended (e1771 to e1779). Copies under `gtr-eval/` here: written by `sync_docs.sh`.

## Verification (verify-gtr-eval-fix, 2026-11-11)

An independent check of the fix and of this file. Scripts, inputs and outputs: `/home/user/gtr/eval/checks/verify-0.12.0/`.
Result: both fixes do what sections 1 and 2 say and nothing else, every number and id in sections 2 to 5 checks out, and
the ledger lost and changed no line. One gap in the `f0` fix was found: a tab-separated file whose empty cells end the
row. It is fixed in gtr-eval 0.12.1 (last part below). Every eval I ran used `--no-ledger`, with `GTR_EVAL_LEDGER` set to
a file that must stay absent, and it stayed absent.

**The code change.** The 0.11.1 source is in git, at blog commit 45298df (`scripts/gtr-eval/gtr_eval.py`, SHA-256
`4c30f2e4ebe91216d6cc1104bc7a3855b140e99d6b91bcdf0ef8984b80a3d910`), byte-identical to fix-gtr-eval's own saved copy.
A `diff` against 0.12.0 shows four changes: the version and date, the capo reader (`CAPO_LINE_START_RE`, `CAPO_FIELD_RE`, `CAPO_WORD_RE`, `capo_statements()` and the capo loop of
`_load_ascii_tab()`), and the row loop of `cmd_f0()`. Nothing else changed. Only `tab` reads ASCII tab
(`load_est_notes(..., want_tab=True)`) and only `f0` runs that row loop, so no other subcommand can give a different
result. The selftest diff holds exactly the five checks of section 2, and `sync_docs.sh` gained `README.md`.

**My own inputs** (`own_inputs.py`; files in `own_inputs/`; results in `own_inputs.json`). Each was scored by the
installed version, by 0.12.0 and by 0.11.1.

- `f0`. Truth S2s, `--voice melody` and `--voice bass`. One estimate on a 256/44100 s hop, with 15-cent, 80-cent and
  octave errors, false alarms and some empty confidence cells. It was written 21 ways: with and without a header; with
  empty frequency cells or with zeros; zeros with every confidence cell filled; tab-separated; with `n/a` and `?` cells;
  with a row that has no frequency cell; with a second header line; with a MIDI column; and with `--conf-threshold 0.5`.
  I computed the expected numbers from the truth JSON with `mir_eval.melody` directly, without gtr-eval's code.
  - 0.12.0 matched them (5 numbers to 6 decimals, and the row counts) in 17 of 21 cases.
  - 0.11.1 stopped with `IndexError` (exit 3) on every file with an empty cell, including empty confidence cells. On
    the file with zeros and every confidence cell filled it gave the same numbers as 0.12.0.
  - The four other cases are tab-separated files whose empty cells end the row: `0.0000\t\t`, or `0.0000\t` in a
    two-column file, which is what pandas writes for NaN. `read_lines()` strips each line, tabs included, so 0.12.0
    read those rows as having no frequency cell and left them out. On S2s melody it kept 4,395 of 5,058 rows and
    mir_eval interpolated across the gaps: voicing false alarm 0.997543 and overall accuracy 0.677452, where the same
    values written with commas give 0.100737 and 0.800068.
  - The installed 0.12.1 gives the computed numbers in 21 of 21 cases.
- `tab`. An ASCII tab written from the S5capo2 truth (capo 2) under 14 different headers. I worked out the expected capo
  by the README rule, and the matched count with my own longest-common-subsequence code. All 42 runs came out as
  expected; 0.12.1 and 0.12.0 agree on every one. The defect shows on 0.11.1:
  - "Title: My song with a capo on fret 5" with no capo line gives capo 5 "stated", 19 of 90 matched, same string and
    fret 0.0. 0.12.0 gives capo 2 assumed, 90 of 90 matched, 1.0.
  - "Title: S5 (capo 7 version)" before "[Capo 2nd fret]" gives capo 7 (0.12.0: 2).
  - "Played with a capo on the 3rd fret in the video." gives 3 (0.12.0: assumed).
  - All three versions give the same result for "Capo 2", "# capo: 2", "Key: A   Capo: 4", "No capo", a capo line
    after the staff, a "Capo:" field after "without capo", and `--est-capo`.
  - Besides "Tuning: standard, capo 2" (section 1), 0.12.0 also no longer reads "Capo2" written without a space. It
    still reads a "Capo:" field inside a title: "Title: Song (Capo: 3)" gives 3, as on 0.11.1. Both follow the
    documented rule.
- One older edge case behaves the same in all three versions and is now written in the README. In a file without a
  header, a first row with a text cell is taken as the header line, so that row is lost without a `processing` count.

**Re-scoring with 0.12.0** (`rescore_sample.py`; `rescore_sample_0120.jsonl`; 00:51 to 00:56 UTC). My own selection of
166 earlier evals:

- the 9 evals section 3 lists as changed, the 8 it lists as not comparable, and the other 9 failed evals;
- a seeded random sample of every subcommand, 12 each (20 for `f0`), taken where possible from evals that fix-gtr-eval
  had not re-scored.

Results:

- 147 identical: the whole result JSON apart from `gtr_eval_version`, and the same exit code. They cover all 11
  subcommands in the ledger, and 118 of them were not in fix-gtr-eval's set.
- 9 differ, exactly e0440 to e0447 and e0468. Each new result equals its re-scoring (e1771 to e1779) apart from the
  version. For e0468 only `processing` and `tuning_and_capo.est.capo_source` differ.
- 10 could not be compared. For e0448 to e0455 the lane rewrote the `melodia0.csv` files at 21:34:11 to 21:34:59. For
  e1315 and e1593 (`stems`) the stem files have since been deleted.

**Sections 3 and 4, claim by claim** (`claims_check.py`; `claims_check.json`; my own parsing with Python's `csv`
module).

- The eight rows of the `f0` table equal the ledger.
- e1772 to e1779 have the same metrics and counts as e0448 to e0455.
- Each zero-filled copy is larger by exactly its number of empty cells: 4,462, 1,768, 1,760 and 4,465 bytes. Each file
  has 10,116 rows.
- The four `.melodia.csv` files were last written at 21:33:00 to 21:33:05, before e0440, and still have the hash that
  the new evals record.
- The lane's cited evals differ from the new ones by at most 0.000397 (S2n and S5dropd) and not at all (S2s and S6taps).
- The ASCII-tab evals are e0461, e0468, e0475 and e0484 (plus e1771). Only e0468's file mentions a capo, and none of the
  six failed `tab` evals had an ASCII-tab estimate.
- The lanes now hold 167 files that gtr-eval's ASCII-tab detector accepts; the guitar-tab lane wrote 18 of them after
  00:22. Still only the e0468 file and its copy mention a capo.
- Among the 149 `f0` evals of 0.11.1, only e0440 to e0447 have empty cells. None has a text cell or a missing cell.

**Ledger** (`ledger_check.py`; `ledger_check.json`).

- At 00:42 UTC: 1,835 lines. Every id equals its line number, time stamps never go back, and every line has the compact
  form that `append_ledger` writes.
- e0001 to e1770 are 0.11.1. The last, e1770, ran at 00:24:36, four seconds before 0.12.0 was installed.
- e1771 to e1835 are 0.12.0, starting with fix-gtr-eval's e1771 at 00:26:53.
- SHA-256 of the first 1,600 lines (4,188,077 bytes): `a035c360673fb3003e659d04563decd2c37adf6c5d0c94d881ccf6d4d877f65e`.
  Of the first 1,770 lines (4,538,214 bytes): `101cf3303b3589086a40106cb0de845ce7cda90c3388574798508c95a99f0958`. Both
  were unchanged at 01:06, when the ledger had 1,836 lines.
- No hash was recorded before the fix, so I compared old lines with three copies of ledger lines that other agents of
  this session wrote on 2026-11-10, before the fix. They are in the session scratchpad: `v/rerun_evals.json` (22:08),
  `cited_evals.json` (22:39) and `evals_dump.txt` (23:17). Together they cover 279 ids from e0018 to e1345, and every
  one equals the current line.
- e1771 to e1779 carry the old argv without `--out`, the same working directory and `agent_hint` fix-gtr-eval.

**Self-tests** (`selftest/`).

- 0.12.0: `selftest` gives 124 PASS, 0 FAIL, 0 N/A; `--all-inputs` gives 359 / 0 / 52.
- 0.11.1 with its own tests: `--all-inputs` gives 354 / 0 / 52, with 119 PASS in part 1. Compared check by check with
  0.12.0, the 406 shared checks give the same results; 0.12.0 adds the 5 new ones.
- 0.11.1 with the 0.12.0 tests: 120 PASS, 4 FAIL, 0 N/A. The four failures are exactly those of section 2.

**gtr-eval 0.12.1** was installed at 2026-11-11 00:57:51 UTC; its README changelog entry describes it.

- `f0` now reads its table with `read_table(path, keep_trailing_tabs=True)`. A line that contains a tab and no space
  keeps the tabs at its end, so its empty trailing cells stay cells. Every other subcommand reads tables exactly as
  before.
- New selftest check `f0.empty_cells_at_row_end_tab_separated`. It writes a three-column file with a header and a
  two-column file without one that starts with `0.2000\t`, and both must score like the file with 0 written. On 0.12.0
  it fails: voicing false alarm 0.993789, 640 of 801 rows.
- 0.12.1 `selftest`: 125 / 0 / 0. `--all-inputs`: 360 / 0 / 52, the same results as 0.12.0 check by check plus the new
  check. `selftest.txt` and `selftest.json` now hold this run; the 0.12.0 ones are kept in
  `/home/user/gtr/eval/checks/verify-0.12.0/installed_0120/`.
- Every `f0` estimate in the ledger is comma-separated (all 157 `f0` evals up to e1835), so no stored result changes.
  Re-scored with 0.12.1 and `--no-ledger` (`rescore_0121.py`; `rescore_0121.jsonl`; 183 evals): every comparable `f0`
  eval (141) and every ASCII-tab eval gave exactly the stored result, together with 3 sampled evals of every other
  subcommand: 174 identical. For e0440 to e0447 and e0468 the stored result is the 0.12.0 re-scoring. The 9 left were
  not comparable: e0448 to e0455, and e1317 (a deleted stem file).
- The first 0.12.1 eval in the ledger is a lane's e1836 (`stems`).
- After `sync_docs.sh`, the five files in `gtr-eval/` next to this file and the launcher are byte-identical to the
  installed ones (`cmp`). The script also copied `../gtr-run` again; its content is unchanged.

**For GAPS.md** (not edited here): rows X1 and X2 are fixed in 0.12.0, with the follow-up in 0.12.1. e1771 is the
re-scoring of e0468, which the web-tab-render lane cites.
