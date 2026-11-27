# N-E7: the frozen methods on three songs they never saw

Run 2026-11-27 07:10-07:25 UTC by the NOTES session itself (no agents: the weekly limit was at 85 %). The rules were
frozen in `../frozen-rules.json` and committed (3b18c251) before any held-out score existed; the frozen code's SHA-256
was checked again before the run (0 mismatches). Each method was scored once, with gtr-eval 0.12.1 (onset F1 at 50 ms
and 50 cents, offsets ignored; eval ids e3544-e3598 in the gtr-eval ledger). Not checked by a second agent, for the
same budget reason; every number reproduces with `score.py` from the files named below.

## The songs

| slug | player, piece | guitar, tuning, capo | key notes (heard) | bars |
|---|---|---|---|---|
| closer | Gareth Evans, *Closer* | steel, E A D G A D, capo 1 | 1,149 (1,075) | 96 |
| september | Evan Handyside, *Wake Me Up When September Ends* | nylon, D G D G B D, capo 2 | 417 (379) | 48 |
| boats | Pete Lumb (a new player), *Three Little Boats* | nylon, standard, no capo | 232 (224) | 32 |

The keys were built from the players' tabs and timed to the recordings with no note transcriber at any step, checked,
repaired and audited by different agents (`../heldout/`). They stay out of git.

## Onset F1

| method (frozen) | closer | september | boats | mean | the three development songs (mean) |
|---|---|---|---|---|---|
| **vote5+filters, the frozen primary** (3-of-5 vote of fl, gaps, gaps-paper, Transkun, Basic Pitch; range and strings filters) | **0.8917** | 0.9627 | 0.9374 | **0.9306** | 0.9024 |
| fusion+filters (mean of the three Riley rolls, threshold 0.275) | 0.8893 | **0.9713** | **0.9425** | **0.9343** | 0.9005 |
| vote3+filters (2-of-3 of fl, gaps-paper, Transkun) | 0.8860 | 0.9639 | 0.9322 | 0.9274 | 0.8968 |
| gate+filters (gaps-paper on steel, gaps on nylon) | 0.8812 | 0.9653 | 0.9396 | 0.9287 | 0.8932 |
| gaps-paper alone, the best single tool | 0.8812 | 0.9626 | 0.9420 | 0.9286 | 0.8903 |
| gaps alone | 0.8368 | 0.9653 | 0.9396 | 0.9139 | 0.8758 |
| fl alone | 0.8598 | 0.9594 | 0.8967 | 0.9053 | 0.8697 |
| Transkun (+filters) | 0.8200 | 0.8721 | 0.8577 | 0.8499 | |
| Basic Pitch with range (+filters) | 0.7429 | 0.7069 | 0.6623 | 0.7040 | |
| ORACLE: per-bar pick of the five tools (bars from the key) | 0.8959 | 0.9761 | 0.9283 | 0.9334 | |
| ORACLE: key notes found by at least one of the five | 0.9469 | 0.9880 | 0.9828 | | |

Precision / recall / heard-only recall, and edits left (missed + invented):

| | closer | september | boats |
|---|---|---|---|
| vote5+filters | 0.898 / 0.885 / 0.903; 247 | 0.966 / 0.959 / 0.987; 31 | 0.939 / 0.935 / 0.946; 29 |
| fusion+filters | 0.877 / 0.902 / 0.922; 258 | 0.969 / 0.974 / 0.995; 24 | 0.968 / 0.918 / 0.929; 26 |
| gaps-paper | 0.866 / 0.897 / 0.913; 278 | 0.968 / 0.957 / 0.984; 31 | 0.977 / 0.910 / 0.920; 26 |

## What it says

- **The frozen primary holds, barely.** The 3-of-5 vote beats the best single tool on the held-out mean by 0.002
  (0.9306 against 0.9286): +0.0105 on closer, +0.0001 on september, -0.0046 on boats. On the development songs the gain
  was 0.012. The brief's rule (drop a stage that helped the three songs and lowers the held-out mean) keeps it, but it
  is not a clear win: the gain lives on the steel songs, where several tools disagree, and fades on clean nylon.
- **Roll fusion is the best row held out** (0.9343, +0.006 over gaps-paper, and above it on all three songs). It was
  frozen as a row, not as the primary, so naming it the winner now would be choosing after seeing the scores. What can be
  said: both frozen combinations beat every single tool on the held-out mean, and fusion did so on every song.
- **The filters cost nothing again** (0 found notes lost on any method) and help only the tools that write impossible
  notes (gaps on closer +0.004, Basic Pitch on september +0.004).
- **The per-bar pick is worth little here:** the oracle over the five tools (0.9334) is no better than fusion, and on
  boats it is below gaps-paper alone. Most of the room is in single notes: at least one tool finds 0.947 / 0.988 /
  0.983 of the key notes, against 0.885 to 0.974 recall for the methods.
- **Closer is the hard one** (E A D G A D with harmonics and slaps): every method is 0.03 to 0.08 below its nylon scores.

## Files

`/home/user/notes/runs/e7/` (outside git): `bin/run_tools.sh`, `bin/methods.py` (frozen, SHA-256 in
`frozen-rules.json`), `bin/score.py`, `<slug>/<tool>/` (tool outputs, Riley rolls), `<slug>/methods/*.csv`,
`<slug>/oracle/`, `scores.json`. Tool runs through gtr-run: r1562 onwards (lane notes-e7); closer's last three tools
re-ran after a box restart at 07:08 UTC.
