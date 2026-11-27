# The five note tools on the GuitarSet dev set (dev24)

Job `dev-tools` of the NOTES session, 2026-11-27, 03:56 to 04:15 UTC. Brief: `../../sessions/NOTES.md`. This is
groundwork for N-E1: a weighted vote needs each tool's reliability, measured on files that are not the three test
songs. Only numbers are here. The keys and the players' tabs stay out of the repo.

## In short

- **gaps-paper is the best single tool on dev24**: mean onset F1 **0.915** (pooled 0.914). fl is 0.896, gaps 0.866,
  Transkun 0.771, Basic Pitch 0.744. gaps-paper is best on 18 of the 24 files.
- **No vote beats gaps-paper alone here.** The 2-of-3 vote of fl, gaps-paper and Transkun scores 0.910. The 3-of-5
  vote of all five scores 0.905. The 2-of-3 vote of fl, gaps and Transkun scores 0.897, level with fl (0.896). On the
  three songs the same 2-of-3 vote gained about 0.03 on the steel-string songs. It does not gain on dev24.
- **Transkun is much weaker on GuitarSet than on the three songs**: 0.771 here, 0.785 to 0.896 there. It misses high
  notes. Recall is 0.522 for MIDI 64 and up, and 0.465 on string 1. Timing does not explain it: F1 at 100 ms is only
  0.782. Octaves do not explain it: pitch-class F1 is 0.775. Fast lines do not explain it either: its recall is about
  0.70 whatever the gap to the previous note on the string.
- **What a weighted vote can use.** A note that only gaps-paper has is right 54 % of the time. A note that only fl,
  gaps, Transkun or Basic Pitch has is right 2 % to 15 % of the time. Notes that 4 or 5 tools share are right 92 % and
  96 % of the time.
- **Union recall.** At least one of the five finds 2732 of the 2860 truth notes (0.955). The best tool alone finds
  2615 (0.914).

## The dev set and the scorer

The dev set is `/home/user/notes/dev/README.md`: 24 GuitarSet clips of up to 30 s, 2860 truth notes, 653.9 s of audio,
six players, 12 comp and 12 solo takes, standard tuning, no capo. GuitarSet is not solo fingerstyle (the README says
so). Use it to tune and to catch regressions, and keep the three songs for the real numbers.

Scoring of record: `/home/user/notes/tools/score_notes.py --batch <folder> --strict --per-string --json <file>`, in
the venv `/home/user/notes/venv`. A note is found when an estimate has its onset within 50 ms and its pitch within
50 cents, one to one (mir_eval), offsets ignored, each file over its crop window. The eval files are
`/home/user/notes/dev/runs/dev-tools/scores/<name>.json`, one per tool or vote. "Mean F1" is the mean over the 24
files. "Pooled F1" is the F1 of the counts summed over all files. GuitarSet's truth onsets sit 3 to 5 ms after the
attack (README, "Checker fixes"), so a perfect detector would show a median onset error of about -3 to -5 ms.

## What was run

| tool | where its notes are | how they were made |
|---|---|---|
| fl | `dev/runs/riley-fl/<id>.notes.csv` | earlier run (riley_post.py, `guitar-fl.pth`, default thresholds), not rerun |
| gaps | `dev/runs/riley-gaps/<id>.notes.csv` | earlier run, `guitar-gaps.pth`, not rerun |
| gaps-paper | `methods/riley/checker/gaps-paper/<id>.notes.csv` | earlier run, `guitar-gaps-paper-version-12200_iterations.pth`, not rerun |
| Transkun | `dev/runs/transkun/<id>.notes.csv` (and `<id>.transkun.mid`) | new here: Transkun 2.0.1, the step-2 install |
| Basic Pitch | `dev/runs/basic-pitch/<id>.notes.csv` (and `<id>_basic_pitch.mid`, `.csv`) | new here: Basic Pitch 0.4.0, tflite, the step-2 install |

All paths are under `/home/user/notes/`. The two new tools ran on the 24 clips `dev/clips/<id>.wav`, one clip per
`gtr-run` call, on one 2-core slot each. Script: `/home/user/notes/dev/runs/dev-tools/bin/run_tools.sh`.

```
gtr-run --lane notes --tool dev-transkun --label "dev-tools transkun dev24 <id>" --input <clip> -- \
  /home/user/gtv/tools/venv-torch/bin/transkun <clip> <id>.transkun.mid --device cpu
gtr-run --lane notes --tool dev-basic-pitch --label "dev-tools basic-pitch dev24 <id>" --input <clip> -- \
  /home/user/gtv/tools/venv-bp/bin/basic-pitch <outdir> <clip> --save-midi --save-note-events \
  --model-serialization tflite --minimum-frequency 79.9 --maximum-frequency 1046.5
```

- **Transkun** is the same command as step 2's n-04 (`experiments/capo/n-04/cmd.sh`).
- **Basic Pitch** has the same range as step 2's n-01-hint on the standard song: 79.9 to 1046.5 Hz. That is E2 to C6
  (MIDI 40 to 84), from the open low E string to fret 20 of string 1.
- **MIDI to notes.** Step 2 scored each tool's MIDI with gtr-eval's own reader (n-04's `score.sh`, then
  `breakdown.py`, which writes `notes.csv` from that reader). `bin/mid2notes.py` does the same: gtr-eval 0.12.1's
  reader (pretty_midi, every non-drum instrument pooled, pitch bends ignored). It writes the scorer's CSV with velocity
  and empty string, fret and conf.
- **Side check.** Basic Pitch's own float note-event CSV, scored the same way, gives mean 0.745 and pooled 0.728. It
  finds 2 more notes than the MIDI (2259 against 2257). The MIDI is the number of record
  (`dev-tools/checks/bp-float.json`).

**Runs** (run ids and wall seconds per clip: `dev-tools/runs_transkun.tsv`, `runs_basic-pitch.tsv`). Every run exited
0. The box was shared with other agents: the load average at the start of a run was 2.3 to 5.2, median 3.6.

| tool | run ids | wall per clip, min / median / max | wall, all 24 | audio |
|---|---|---|---|---|
| Transkun | r1434 to r1474 (24 runs) | 25.5 / 31.2 / 38.4 s | 750 s | 653.9 s |
| Basic Pitch | r1424 to r1449 (24 runs) | 2.5 / 3.5 / 5.3 s | 83 s | 653.9 s |

Wall time includes start-up and model loading. Transkun took about 1.15 s per second of audio here, on 2 cores.

## What each tool saw in training

| tool | training data | dev24 held out? |
|---|---|---|
| fl | Kong's piano model fine-tuned on the Francois Leduc jazz-guitar set | yes |
| gaps | the same network fine-tuned on GAPS classical guitar | yes |
| gaps-paper | the later GAPS upload (12,200 iterations); its training data is not stated anywhere | unknown |
| Transkun | a piano model | yes |
| Basic Pitch | several sets. Its package ships a GuitarSet loader with a random track split (`basic_pitch/data/datasets/guitarset.py`) | probably not |

gaps-paper beats fl by -0.001 on player 00 and by +0.010 to +0.031 on the other five players. Four files a player is
too few to say whether that is a sign of GuitarSet in its training.

## The five tools

| tool | mean F1 | pooled F1 | pooled P | pooled R | found | missed | invented | mean F1 at 100 ms | mean of file median onset errors | comp mean F1 | solo mean F1 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fl | 0.896 | 0.893 | 0.891 | 0.896 | 2562 | 298 | 313 | 0.909 | -1.5 ms | 0.890 | 0.902 |
| gaps | 0.866 | 0.857 | 0.874 | 0.840 | 2403 | 457 | 346 | 0.878 | -8.2 ms | 0.844 | 0.888 |
| **gaps-paper** | **0.915** | **0.914** | **0.913** | **0.914** | 2615 | 245 | 250 | 0.921 | -0.8 ms | 0.908 | 0.921 |
| Transkun | 0.771 | 0.788 | 0.877 | 0.715 | 2045 | 815 | 288 | 0.782 | -17.1 ms | 0.826 | 0.716 |
| Basic Pitch | 0.744 | 0.727 | 0.674 | 0.789 | 2257 | 603 | 1092 | 0.764 | -6.6 ms | 0.677 | 0.811 |

fl, gaps and gaps-paper give the same values as their earlier dev24 runs (0.896, 0.866, 0.915 in
`/home/user/notes/methods/riley/checker/README.md`).

Pooled recall per truth string (1 = high E), from the same eval files:

| tool | string 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| fl | 0.933 | 0.909 | 0.888 | 0.866 | 0.915 | 0.899 |
| gaps | 0.916 | 0.866 | 0.876 | 0.826 | 0.797 | 0.708 |
| gaps-paper | 0.949 | 0.928 | 0.923 | 0.882 | 0.915 | 0.906 |
| Transkun | 0.465 | 0.602 | 0.706 | 0.810 | 0.844 | 0.794 |
| Basic Pitch | 0.838 | 0.769 | 0.816 | 0.775 | 0.808 | 0.704 |

### Per file (onset F1 at 50 ms; best single tool in bold)

| file | truth notes | fl | gaps | gaps-paper | Transkun | Basic Pitch | 2-of-3 fl, gaps, Transkun | 2-of-3 fl, gaps-paper, Transkun | 3-of-5 |
|---|---|---|---|---|---|---|---|---|---|
| 00_BN3-119-G_comp | 161 | **0.895** | 0.874 | 0.882 | 0.837 | 0.799 | 0.901 | 0.904 | 0.900 |
| 00_Jazz3-137-Eb_solo | 63 | 0.913 | **0.935** | 0.912 | 0.783 | 0.686 | 0.935 | 0.928 | 0.943 |
| 00_Rock1-90-C#_solo | 177 | 0.914 | 0.888 | **0.929** | 0.823 | 0.782 | 0.905 | 0.929 | 0.925 |
| 00_SS3-84-Bb_comp | 128 | **0.855** | 0.832 | 0.852 | 0.739 | 0.679 | 0.867 | 0.857 | 0.868 |
| 01_BN2-131-B_solo | 105 | **0.986** | 0.957 | 0.972 | 0.737 | 0.886 | 0.986 | 0.981 | 0.981 |
| 01_Funk3-98-A_solo | 144 | 0.887 | 0.841 | **0.900** | 0.804 | 0.856 | 0.884 | 0.896 | 0.899 |
| 01_Jazz1-200-B_comp | 120 | 0.902 | 0.832 | **0.915** | 0.796 | 0.747 | 0.866 | 0.909 | 0.883 |
| 01_Rock3-148-C_comp | 202 | 0.725 | 0.687 | **0.837** | 0.776 | 0.670 | 0.838 | 0.835 | 0.839 |
| 02_BN3-154-E_solo | 79 | 0.876 | 0.896 | **0.899** | 0.446 | 0.833 | 0.886 | 0.876 | 0.898 |
| 02_Funk2-108-Eb_comp | 224 | 0.875 | 0.723 | **0.905** | 0.705 | 0.700 | 0.795 | 0.881 | 0.833 |
| 02_Jazz1-130-D_solo | 110 | 0.932 | 0.923 | **0.946** | 0.796 | 0.737 | 0.927 | 0.932 | 0.936 |
| 02_SS1-68-E_comp | 85 | 0.820 | 0.793 | **0.836** | 0.811 | 0.484 | 0.821 | 0.821 | 0.821 |
| 03_BN2-166-Ab_comp | 200 | **0.940** | 0.872 | 0.937 | 0.856 | 0.703 | 0.905 | 0.945 | 0.899 |
| 03_Jazz2-110-Bb_comp | 119 | 0.971 | 0.917 | **0.988** | 0.858 | 0.733 | 0.966 | 0.983 | 0.975 |
| 03_Rock3-117-Bb_solo | 87 | 0.884 | 0.874 | **0.943** | 0.662 | 0.786 | 0.889 | 0.914 | 0.914 |
| 03_SS1-100-C#_solo | 111 | 0.894 | 0.885 | **0.937** | 0.781 | 0.833 | 0.917 | 0.931 | 0.917 |
| 04_Funk1-97-C_comp | 99 | 0.876 | 0.810 | **0.902** | 0.856 | 0.762 | 0.869 | 0.891 | 0.872 |
| 04_Jazz3-150-C_solo | 88 | 0.880 | 0.841 | **0.914** | 0.644 | 0.780 | 0.867 | 0.885 | 0.877 |
| 04_Rock2-85-F_comp | 84 | 0.919 | 0.919 | **0.946** | 0.849 | 0.524 | 0.918 | 0.935 | 0.929 |
| 04_SS3-98-C_solo | 97 | 0.929 | 0.915 | **0.934** | 0.755 | 0.897 | 0.933 | 0.933 | 0.944 |
| 05_BN1-147-Gb_comp | 96 | **0.959** | 0.939 | 0.953 | 0.884 | 0.771 | 0.954 | 0.959 | 0.959 |
| 05_Funk1-114-Ab_solo | 60 | 0.817 | 0.793 | **0.846** | 0.646 | 0.759 | 0.831 | 0.840 | 0.838 |
| 05_Rock2-142-D_solo | 86 | 0.908 | 0.907 | **0.920** | 0.718 | 0.901 | 0.930 | 0.920 | 0.925 |
| 05_SS2-88-F_comp | 135 | 0.940 | 0.932 | **0.944** | 0.940 | 0.556 | 0.944 | 0.959 | 0.951 |

## Reliability by pitch range (the table a weighted vote needs)

Pooled over the 24 files. Recall is counted by the truth note's pitch. Precision is counted by the estimated note's
pitch. Matching is the scorer's own, so the counts add up to the scorer's totals (`bin/collect.py` asserts this). The
ranges are MIDI below 52 (below E3), 52 to 63 (E3 to D#4), and 64 and up (E4 and up). Made by `bin/analyze.py`; file
`dev-tools/ranges.json` (with per-file counts).

| tool | below 52: P | below 52: R | 52-63: P | 52-63: R | 64 and up: P | 64 and up: R | strings 6-4: R | strings 3-1: R |
|---|---|---|---|---|---|---|---|---|
| fl | 0.853 | 0.902 | 0.885 | 0.876 | 0.929 | 0.924 | 0.887 | 0.903 |
| gaps | 0.893 | 0.734 | 0.865 | 0.855 | 0.878 | 0.890 | 0.794 | 0.880 |
| gaps-paper | 0.905 | 0.898 | **0.904** | **0.900** | **0.932** | **0.948** | **0.897** | **0.930** |
| Transkun | 0.895 | 0.819 | 0.879 | 0.788 | 0.851 | 0.522 | 0.817 | 0.626 |
| Basic Pitch | 0.598 | 0.745 | 0.659 | 0.802 | 0.765 | 0.799 | 0.770 | 0.806 |

Counts behind it (truth notes / found / estimated notes / invented):

| tool | below 52 | 52-63 | 64 and up |
|---|---|---|---|
| fl | 591 / 533 / 625 / 92 | 1416 / 1241 / 1402 / 161 | 853 / 788 / 848 / 60 |
| gaps | 591 / 434 / 486 / 52 | 1416 / 1210 / 1399 / 189 | 853 / 759 / 864 / 105 |
| gaps-paper | 591 / 531 / 587 / 56 | 1416 / 1275 / 1410 / 135 | 853 / 809 / 868 / 59 |
| Transkun | 591 / 484 / 541 / 57 | 1416 / 1116 / 1269 / 153 | 853 / 445 / 523 / 78 |
| Basic Pitch | 591 / 440 / 736 / 296 | 1416 / 1135 / 1721 / 586 | 853 / 682 / 892 / 210 |

What it says:

- **gaps** is precise on low notes (0.893) but misses a quarter of them (recall 0.734; string 6 recall 0.708).
- **Transkun** is precise in every range (0.85 to 0.90), but it writes few high notes: 523 at MIDI 64 and up, against
  853 in the truth. Below E4 its notes are right about as often as fl's (0.88 to 0.90, fl 0.85 to 0.89). Above E4 it misses about half the notes.
- **Basic Pitch** invents a quarter to two fifths of its notes, depending on the range (precision 0.60 to 0.77).
- **Transkun's high misses** (side check, `bin/gap_check.py`, `dev-tools/gap_check.json`): its recall is 0.69, 0.69 and
  0.72 for notes less than 125 ms, 125 to 250 ms, and 250 ms or more after the previous note on the same string. The
  other tools lose 16 to 26 points of recall on the shortest gaps, against their recall at 250 ms or more. So Transkun's loss is not about fast lines. I did not find the
  cause.

## How often a note is right, by how many tools have it

Every cluster of all five tools' notes (the vote rule below with k = 1), matched to the truth one to one with the
scorer's matching. File `dev-tools/support.json`, which also has the split by pitch range.

| tools that have the note | clusters | match a truth note | precision |
|---|---|---|---|
| 1 of 5 | 1384 | 94 | 0.068 |
| 2 of 5 | 266 | 131 | 0.492 |
| 3 of 5 | 258 | 186 | 0.721 |
| 4 of 5 | 691 | 635 | 0.919 |
| 5 of 5 | 1743 | 1681 | 0.964 |

The most common support sets:

| tools that have the note | clusters | precision |
|---|---|---|
| all five | 1743 | 0.964 |
| Basic Pitch alone | 952 | 0.021 |
| all but Transkun | 408 | 0.956 |
| all but Basic Pitch | 207 | 0.874 |
| gaps alone | 142 | 0.028 |
| Transkun alone | 135 | 0.118 |
| fl and gaps-paper | 98 | 0.643 |
| fl, gaps and gaps-paper | 96 | 0.812 |
| gaps-paper alone | 80 | 0.537 |
| fl alone | 75 | 0.147 |
| fl, gaps-paper and Transkun | 50 | 0.780 |
| all but gaps | 46 | 0.935 |
| Basic Pitch, fl and gaps-paper | 46 | 0.717 |
| Basic Pitch and Transkun | 30 | 0.533 |
| gaps and gaps-paper | 25 | 0.320 |
| Basic Pitch and fl | 19 | 0.158 |

By pitch range, a 2-of-5 note is right 0.566 (below 52), 0.472 (52 to 63) and 0.444 (64 and up) of the time. A
1-of-5 note is right 0.056 to 0.073 of the time in every range.

## Votes, for reference

The vote rule is the brief's, and E0's code (`/home/user/notes/runs/e0/bin/firstlook.py`). The voting tools' notes are
pooled per MIDI pitch and sorted by onset. A cluster starts at the first note not yet in a cluster. It takes every later
note of that pitch within 50 ms of that first onset. It is kept when at least k different tools have a note in it.
The kept note's onset and offset are the medians of the members. The votes' notes are in
`dev-tools/votes/<name>/<id>.notes.csv`, scored with the batch scorer like the tools.

| method | clusters / kept | mean F1 | pooled F1 | pooled P | pooled R | found | missed | invented | comp | solo |
|---|---|---|---|---|---|---|---|---|---|---|
| gaps-paper alone (best single tool) | | **0.915** | **0.914** | 0.913 | 0.914 | 2615 | 245 | 250 | 0.908 | 0.921 |
| fl alone | | 0.896 | 0.893 | 0.891 | 0.896 | 2562 | 298 | 313 | 0.890 | 0.902 |
| 2-of-3 vote: fl, gaps, Transkun | 3285 / 2684 | 0.897 | 0.894 | 0.923 | 0.866 | 2478 | 382 | 206 | 0.887 | 0.908 |
| 2-of-3 vote: fl, gaps-paper, Transkun | 3224 / 2796 | 0.910 | 0.910 | 0.921 | 0.900 | 2574 | 286 | 222 | 0.907 | 0.914 |
| 3-of-5 vote: all five | 4342 / 2692 | 0.905 | 0.902 | **0.931** | 0.876 | 2505 | 355 | 187 | 0.894 | 0.916 |
| 1-of-5: every cluster kept | 4342 / 4342 | 0.768 | 0.757 | 0.628 | 0.953 | 2727 | 133 | 1615 | 0.725 | 0.810 |

| union recall: truth notes found by at least one tool's own matching | found | recall | missed by all |
|---|---|---|---|
| all five | 2732 of 2860 | 0.9552 | 128 |
| fl, gaps-paper, Transkun | 2701 | 0.9444 | 159 |
| fl, gaps, gaps-paper, Transkun | 2712 | 0.9483 | 148 |
| fl, gaps, gaps-paper | 2679 | 0.9367 | 181 |
| fl, gaps, Transkun | 2661 | 0.9304 | 199 |
| gaps-paper alone | 2615 | 0.9143 | 245 |

What it says:

- **The votes are more precise than any tool** (0.921 to 0.931 against 0.913), but they lose more recall than they
  gain in precision. So they end below gaps-paper alone.
- **Against the three songs.** There, the 2-of-3 vote of fl, gaps and Transkun scored 0.953, 0.818 and 0.925, against
  0.920, 0.830 and 0.892 for the best single tool. On dev24 it adds only 0.001 to fl, and gaps-paper is 0.018 above it.
  Transkun is the weak voter here (0.771). On the songs it was 0.785 to 0.896.
- **The 1-of-5 pool** finds 2727 notes, 5 fewer than the union (2732). Clustering and median onsets move a few notes
  out of the 50 ms window.
- **Room for a better rule.** gaps-paper alone finds 2615. The union finds 2732. A rule that keeps gaps-paper's notes
  (its lone notes are right 54 % of the time) and adds only well-supported notes from the others is the obvious next
  candidate for N-E1. Dev24 should fit it, and the three songs should test it.

## Files

- JSON with every number above: `/home/user/notes/dev/runs/dev-tools.json`. It has the per-file values for every tool
  and vote, by-player and by-take means, the range, support and union tables, run ids and wall times.
- Work folder: `/home/user/notes/dev/runs/dev-tools/`. It holds `PROGRESS.md`, `bin/` (`run_tools.sh`,
  `mid2notes.py`, `analyze.py`, `score_all.sh`, `collect.py`, `gap_check.py`), `scores/` (the eval files), `votes/`,
  `ranges.json`, `support.json`, `union.json`, `gap_check.json`, `tables.md`, `runs_*.tsv`, `logs/` and `checks/`.
- New tool outputs: `/home/user/notes/dev/runs/transkun/` and `/home/user/notes/dev/runs/basic-pitch/`.

To rebuild the numbers (about 10 s, no model run):
`/home/user/notes/venv/bin/python -I bin/analyze.py && bash bin/score_all.sh && /home/user/notes/venv/bin/python -I bin/collect.py`,
run in the work folder.

## What is uncertain

- **gaps-paper's training data is not stated.** If it saw GuitarSet, its lead here is too high. Basic Pitch's training
  code includes GuitarSet, so its dev24 score is probably optimistic too, and it is still the lowest.
- **Dev24 is not fingerstyle.** Its comp takes are accompaniment and its solos are mostly single lines. A ranking or a
  weight that holds here may not hold on the three songs, as the 2-of-3 vote shows.
- **One run each, on a shared box.** Wall times vary with load (load average 2.3 to 5.2 at run start). Transkun's
  times are 25 to 38 s a clip.
- **Why Transkun misses GuitarSet's high notes** is not known. It is not timing, octaves or fast lines (see above).
  Its weight in a vote should come from this table, not from its scores on the three songs.
- **The per-range and support tables are pooled.** Big files weigh more. The per-file counts are in `ranges.json`.
