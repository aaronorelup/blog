# The Riley et al. guitar models on the three songs, with their raw rolls

Job `riley-rolls` of the NOTES session, 2026-11-27, 03:28 to 03:56 UTC. Brief: `../../sessions/NOTES.md`. This is
groundwork for N-E1 (candidates and vote weights) and N-E4 (it needs the models' frame outputs). Only numbers are here.
The keys and the players' tabs stay out of the repo.

## In short

- **The third checkpoint wins on two songs of three.** `gaps-paper` (Hugging Face's later GAPS upload, 12,200
  iterations) scores onset F1 **0.954** on capo, **0.822** on tuning and **0.8955** on standard. The best step-2 tool
  scored 0.920, 0.830 and 0.892. The gain comes from precision: it invents 42 notes on capo where fl invents 102, and
  45 on standard where fl invents 104. Its recall is no better than fl's or gaps's. [Checker: on standard it is
  worse than fl's. gaps-paper finds 587 key notes there and fl finds 630, so recall is 0.865 against 0.928, the same
  as gaps. Its +0.004 over fl on standard is 59 fewer invented notes minus 43 fewer found. On capo it finds exactly
  what fl finds (781).]
- **fl and gaps reproduce step 2.** Every note count is equal, and every onset agrees to 0.007 ms. F1 is equal to 6
  decimals in five of six runs. The sixth (tuning, fl) is 0.797639 here against 0.795953 recorded. That is one more
  match, and it comes from step 2 scoring a MIDI file whose times are floored to 1/768 s ticks (details below).
- **Keep the default thresholds.** A sweep from the saved rolls (onset 0.10 to 0.60, frame 0.1 and 0.2), choosing
  only by leave-one-song-out or on the GuitarSet dev set, never beats the default on the mean for fl or gaps-paper.
  For gaps, LOSO gains 0.006. The nylon song wants a lower onset threshold than the steel songs, and the frame
  threshold does not change onsets at all. [Checker: the lower threshold holds for fl and gaps-paper. gaps's curve on
  the nylon song is flat (0.809 to 0.832 from 0.10 to 0.60) and peaks at 0.45.]
- **Handoff for LOOP:** `/home/user/gtv/notes/<S>/riley-<ckpt>/notes.csv` for the three songs and three checkpoints,
  default thresholds, with `support` (how many of the three checkpoints agree) and `conf` (the onset roll value).

## What was run

The tool is `/home/user/notes/methods/riley/riley_post.py` (its README and "Checker fixes" section say what it is and
how it was checked). It runs the Riley et al. models through the package's own audio path, network and decoder, and
it saves four rolls per file (onset, offset, frame and velocity; 88 pitches; 100 frames a second) beside the notes.

| checkpoint | file | what it is |
|---|---|---|
| fl | `guitar-fl.pth` | ICASSP 2024: Kong et al.'s piano model fine-tuned on the Francois Leduc jazz-guitar set (step 2's n-03) |
| gaps | `guitar-gaps.pth` | ISMIR 2024: fine-tuned on GAPS classical guitar, 5,000 iterations (step 2's n-02) |
| gaps-paper | `guitar-gaps-paper-version-12200_iterations.pth` | the later GAPS upload, 12,200 iterations. GuitarSet dev24 F1 0.915 (fl 0.896, gaps 0.866). Whether it saw GuitarSet in training is not stated anywhere |

One command per file, through `gtr-run` (one 2-core slot, `--threads 2`), default thresholds (onset 0.3, offset 0.3,
frame 0.1):

```
gtr-run --lane notes --tool riley-<ckpt> --label "riley-rolls <ckpt> <S> <whole|seg30>" --input <wav> -- \
  /home/user/notes/envs/riley/bin/python -I riley_post.py <wav> --checkpoint <ckpt> --out <prefix> --threads 2
```

Inputs: `/home/user/gtv/songs/<S>/<S>.mono.wav` (whole song: capo 227.9 s, tuning 187.4 s, standard 177.0 s) and
`<S>.seg30.mono.wav` (30.0 s). Outputs: `/home/user/notes/runs/<S>/riley-<ckpt>/<S>.{npz,notes.csv}` and
`.../seg30/<S>.seg30.{npz,notes.csv}`. Scripts: `/home/user/notes/runs/riley-rolls/bin/` (`run_one.sh`, `run_all.sh`).

**Wall clock per run** (gtr-run's `wall_s`, which includes Python start-up and model loading; run id after it). The box
was shared: both slots were busy for most runs, and the load average was 3.9 to 5.1 at the start of all but the first
two (1.65; ledger `load1_at_start`). The three checkpoints are the same network, so the spread between them is load,
not model.

| song (audio length) | fl | gaps | gaps-paper |
|---|---|---|---|
| capo (227.9 s) | 155.2 s r1331 | 139.8 s r1333 | 169.9 s r1336 |
| tuning (187.4 s) | 138.7 s r1330 | 110.9 s r1334 | 168.8 s r1338 |
| standard (177.0 s) | 119.6 s r1332 | 107.8 s r1335 | 101.8 s r1342 |
| capo segment (30 s) | 19.3 s r1339 | 19.3 s r1343 | 20.4 s r1346 |
| tuning segment (30 s) | 20.0 s r1340 | 25.3 s r1344 | 21.1 s r1347 |
| standard segment (30 s) | 23.9 s r1341 | 21.9 s r1345 | 17.9 s r1349 |

riley_post's own timing (model and decoder, without start-up) was 0.54 to 0.87 s per second of audio for whole songs
(`runs_clean.tsv`); the checker measured 0.39 to 0.52 on a quieter box. Step 2 took 102 to 156 s for
the same songs (r0788 to r0847). The `.npz` rolls take about 1.3 MB per 10 s of audio.

## Check: fl and gaps against step 2 (n-03 and n-02)

Step 2 ran the same two checkpoint files (same sha256) with `lanes/guitar-tab/scripts/run_hfmt_guitar.py`. That script
used PyPI's `piano_transcription_inference` 0.0.6 in `venv-torch`, which has the same torch, librosa, numpy and soxr
versions as the riley venv. It scored the `.mid` it wrote. Script: `bin/check_step2.py`; output:
`/home/user/notes/runs/riley-rolls/checks/step2/step2_check.json` (gtr-eval JSON per row beside it).

| song | checkpoint (step 2) | notes here / step 2 | largest onset difference | F1 here | F1 of step 2's float CSV | F1 recorded (step 2's `.mid`) |
|---|---|---|---|---|---|---|
| capo | fl (n-03) | 883 / 883 | 0.001 ms | 0.919906 | 0.919906 | 0.919906 (e2052) |
| capo | gaps (n-02) | 898 / 898 | 0.000 ms | 0.918856 | 0.918856 | 0.918856 (e1987) |
| tuning | fl (n-03) | 558 / 558 | 0.002 ms | **0.797639** | 0.797639 | 0.795953 (e2066) |
| tuning | gaps (n-02) | 618 / 618 | 0.007 ms | 0.829856 | 0.829856 | 0.829856 (e2062) |
| standard | fl (n-03) | 734 / 734 | 0.001 ms | 0.891720 | 0.891720 | 0.891720 (e2532) |
| standard | gaps (n-02) | 657 / 657 | 0.004 ms | 0.878743 | 0.878743 | 0.878743 (e2531) |

Notes are paired per pitch in onset order. The pitches and the counts per pitch are equal in all six runs. All onsets
but one per run are exactly equal in the two CSVs; that one differs by 1 to 7 microseconds (float noise; none in capo
gaps). [Checker: "the two CSVs" are ours and step 2's float CSV, `<S>.guitar-<x>.notes.csv`. The brief names step 2's
`notes.csv`. That file is breakdown.py's copy of the `.mid` that step 2 scored. It has the same notes, but its onsets
are up to 1.30 ms earlier (the tick floor), in all six runs.]

- **The one F1 difference (tuning, fl, +0.0017) is the MIDI tick.** Step 2 scored the `.mid`, whose writer floors every
  time to 1/768 s (1.302 ms). Our CSV and step 2's own float CSV both give 0.797639. On this song fl's onsets sit
  about 30 ms early, so several notes are near the 50 ms edge. Flooring moved three notes from 49.1 to 49.9 ms early
  to 50.3 to 50.7 ms early, so they no longer match. It moved two notes from 50.2 and 50.4 ms late to 50.0 and 49.8 ms
  late, so they now match. The net is one match: 473 found here against 472.
- **Offsets.** Our CSV clips an offset that runs past the end of the audio to the audio's end (the checker's fix). This
  touched 4 notes (capo, fl), 5 (standard, fl) and 5 (standard, gaps). Step 2's files have the same notes running up to
  2.9 s past the end. The scorer ignores offsets, so F1 does not change.
- **The tuning song's mono WAV has a new sha256 but the same samples.** The ledger has `tuning.mono.wav` as
  `7627a54d...` and `tuning.seg30.mono.wav` as `1a1f3552...`. The restored files differ only in a 34-byte header (an
  ffmpeg LIST tag). Step 2 made them with `ffmpeg -i tuning.wav -ac 1 -fflags +bitexact`, and remaking them that way
  gives the ledger's hashes. The sample data is byte-identical (checked with Python's `wave` module). The capo and
  standard WAVs match the ledger byte for byte. Each segment WAV is an exact crop of its whole-song WAV at the
  segment's start (capo 12.76 s, tuning 25.0 s, standard 0.0 s; zero difference at zero sample offset).

## Scores at the default thresholds

Scored the step-2 way (`bin/score_one.py`): `gtr-eval notes --chroma --no-ledger --pretty` (0.12.1; onset within 50 ms,
pitch within 50 cents, offsets ignored) gives `score_notes.json`, the eval file of record. `breakdown.py` gives the
string groups and heard-only recall; its `n_matched` is asserted equal to gtr-eval's. `bin/taps.py` (the same counting
as `taps_invented.py`, which writes into step 2's folders, so it was copied rather than run) gives invented notes within
50 ms of a slap or thump in the key. It reproduces step 2's counts for n-02 and n-03 on capo and standard exactly.
[Checker: that holds when it reads step 2's own `labels.json`. From this job's runs it gives the same counts except
standard gaps: 62 of 70 here against step 2's 61 of 70. The extra one is an invented MIDI 108 note at 75.499 s,
49.3 ms before a slap. Step 2's tick-floored time put it 50.6 ms away.]
Eval files: `/home/user/notes/runs/<S>/riley-<ckpt>/score/{whole,seg30,seg30crop}/score_notes.json`, with
`summary.json`, `breakdown.json`, `labels.json`, `invented_vs_taps.json` and `score.sh` (the exact commands) beside them.

Heard-only recall counts only key notes whose `conf` is not `tab` (heard in the recording). Strings 6-4 and 3-1 are
the key's string numbers. Median onset error is the estimate's time minus the key's, over matched notes (negative =
early). Key notes: capo 815, tuning 628, standard 679.

### Whole songs

| song | checkpoint | P | R | F1 | found | missed | invented | heard-only recall | strings 6-4 recall | strings 3-1 recall | invented at slaps | median onset error |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| capo | fl | 0.884 | 0.958 | 0.920 | 781 | 34 | 102 | 0.966 (735 of 761) | 0.926 | 0.977 | 59 of 102 | -19.3 ms |
| capo | gaps | 0.876 | 0.966 | 0.919 | 787 | 28 | 111 | 0.975 (742 of 761) | 0.973 | 0.961 | 64 of 111 | -18.1 ms |
| capo | **gaps-paper** | **0.949** | 0.958 | **0.954** | 781 | 34 | **42** | 0.966 (735 of 761) | 0.923 | 0.979 | 28 of 42 | -17.0 ms |
| tuning | fl | 0.848 | 0.753 | 0.798 | 473 | 155 | 85 | 0.813 (452 of 556) | 0.723 | 0.765 | no slaps | -29.6 ms |
| tuning | gaps | 0.837 | **0.823** | **0.830** | 517 | 111 | 101 | **0.865** (481 of 556) | 0.802 | 0.831 [Checker: was 0.832] | no slaps | -29.0 ms |
| tuning | **gaps-paper** | **0.862** | 0.785 | 0.822 | 493 | 135 | 79 | 0.835 (464 of 556) | 0.797 | 0.780 | no slaps | -29.6 ms |
| standard | fl | 0.858 | **0.928** | 0.892 | 630 | 49 | 104 | **0.954** (556 of 583) | 0.943 | 0.915 | 82 of 104 | +0.6 ms |
| standard | gaps | 0.893 | 0.865 | 0.879 | 587 | 92 | 70 | 0.901 (525 of 583) [Checker: was 0.900] | 0.911 | 0.825 | 62 of 70 | -0.1 ms |
| standard | **gaps-paper** | **0.929** | 0.865 | **0.8955** | 587 | 92 | **45** | 0.904 (527 of 583) | 0.904 | 0.830 | 44 of 45 | +1.1 ms |

Notes outside the guitar's range, among the invented ones:
- Below the lowest open string with the capo: fl 1, gaps 9, gaps-paper 1 on capo; none on the other songs.
- Above the 1st string's fret 20: only gaps, 12 on capo and 17 on standard, all at MIDI 108 (C8). This is the same
  artefact the checker found on GuitarSet. gaps-paper has none.

What the table says:

- **gaps-paper cuts invented notes by more than half on the steel-string songs** and keeps recall. [Checker: it keeps
  fl's recall on capo only (781 found each). On standard its recall is gaps's, 0.865, against fl's 0.928.] On capo, 28 of its 42
  invented notes sit at slaps, against 59 of 102 for fl. On standard, 44 of its 45 do (fl: 82 of 104). So the notes it
  still invents there are nearly all slap notes, the subject of N-E6.
- **On the nylon song gaps is still best** (0.830 against 0.822), on recall: gaps finds 24 more notes. gaps-paper
  invents fewer notes (79 against 101). The tuning song's onsets are about 30 ms early for all three checkpoints, as in
  step 2. The capo song's are about 17 to 19 ms early, which the brief's summary did not mention. Standard's are within
  about 1 ms.
- **Strings 6-4 on the nylon song** are still the weak side: 0.72 (fl), 0.80 (gaps), 0.80 (gaps-paper). [Checker:
  weak next to the steel songs (0.90 to 0.97). Within the nylon song, gaps-paper's bass strings are not its weak side:
  0.797 on strings 6-4 against 0.780 on 3-1. fl has 0.723 against 0.765 and gaps 0.802 against 0.831.]

### The 30 s segments

Two ways, both against the segment key cut by `crop_truth.py` (`/home/user/notes/runs/riley-rolls/truth/`, identical
to step 2's `work/exp-notes/truth/` files):
- the model run on the segment WAV;
- the whole-song run cropped to the segment, as step 2's `seg30/` folders do (`breakdown.py --t0 --dur 30`).

The crop reproduces step 2's seg30 numbers for fl and gaps exactly: capo 0.941 and 0.922, tuning 0.783 and 0.807,
standard 0.988 and 0.992. Segment keys: capo 102 notes (37 slaps), tuning 106, standard 125 (no slaps in its first
30 s).

| song | checkpoint | segment run: F1 (P / R) | found / missed / invented | crop of the whole-song run: F1 (P / R) | found / missed / invented |
|---|---|---|---|---|---|
| capo | fl | 0.937 (0.932 / 0.941) | 96 / 6 / 7 | 0.941 (0.941 / 0.941) | 96 / 6 / 6 |
| capo | gaps | 0.909 (0.847 / 0.980) | 100 / 2 / 18 | 0.922 (0.863 / 0.990) | 101 / 1 / 16 |
| capo | gaps-paper | **0.946** (0.950 / 0.941) | 96 / 6 / 5 | **0.946** (0.950 / 0.941) | 96 / 6 / 5 |
| tuning | fl | 0.785 (0.796 / 0.774) | 82 / 24 / 21 | 0.783 (0.802 / 0.764) | 81 / 25 / 20 |
| tuning | gaps | **0.815** (0.800 / 0.830) | 88 / 18 / 22 | 0.807 (0.786 / 0.830) | 88 / 18 / 24 |
| tuning | gaps-paper | 0.813 (0.825 / 0.802) | 85 / 21 / 18 | **0.813** (0.825 / 0.802) | 85 / 21 / 18 |
| standard | fl | 0.988 (0.977 / 1.000) | 125 / 0 / 3 | 0.988 (0.977 / 1.000) | 125 / 0 / 3 |
| standard | gaps | 0.992 (1.000 / 0.984) | 123 / 2 / 0 | 0.992 (1.000 / 0.984) | 123 / 2 / 0 |
| standard | gaps-paper | **0.996** (1.000 / 0.992) | 124 / 1 / 0 | **0.996** (1.000 / 0.992) | 124 / 1 / 0 |

Running on the segment alone or cropping the whole-song run changes F1 by at most 0.013. The difference comes from the
10 s windows: at the segment's edges they see silence instead of the music around it. [Checker: on capo, the inside
of the segment differs too. Its segment starts at 12.76 s, off the whole run's 5 s window grid, so every window sees
different audio. The onset rolls differ by up to 0.06 (fl) and 0.15 (gaps-paper) between 2.5 and 27.5 s. On tuning
(25.0 s, on the grid) and standard (0 s), the inside agrees to 0.001 and only the edges differ (up to 0.24).] Heard-only recall, string groups,
slaps and onset errors for the segments are in `/home/user/notes/runs/<S>/riley-<ckpt>/score/{seg30,seg30crop}/summary.json`.
The standard segment is too easy to separate the models (0.988 to 0.996).

## Thresholds, from the saved rolls only

No model was run for this. Every setting was decoded from the `.npz` rolls with `riley_post.py`'s own `decode()`, the
function `riley_post.py --from-npz` calls (`bin/sweep_decode.py`). The grid: onset threshold 0.10 to 0.60 by 0.05,
frame threshold 0.1 and 0.2, offset threshold 0.3. It was decoded for the whole songs, the segment runs and the 24
GuitarSet dev clips (`/home/user/notes/dev/runs/riley-fl/`, `riley-gaps/`, and for gaps-paper the checker's
`/home/user/notes/methods/riley/checker/gaps-paper/`).

Songs were scored with gtr-eval's own `notes` function in-process (`gtr_eval.run_args`, `--no-ledger`). Dev24 was scored
with `/home/user/notes/tools/score_notes.py --batch`; the dev number is the macro mean F1 over the 24 files. Script:
`bin/sweep_score.py`. Decode and score ran as one `gtr-run` job, **r1392**, 428 s on 2 cores. Output:
`/home/user/notes/runs/riley-rolls/sweep/scores.json`.

Checks:
- At the default setting, the sweep's CSVs are byte-identical to the original runs' CSVs. That holds for all 90 files
  (3 checkpoints x 30 files).
- One in-process decode (capo, fl, onset 0.45, frame 0.2) is byte-identical to the CLI `--from-npz` output.
- The in-process scores equal the gtr-eval CLI's on all 18 default runs and on every chosen setting below
  (`sweep/chosen/`).

**The frame threshold does not change onset F1.** Frame 0.1 and 0.2 give the same onsets and pitches in all 990 decoded
file pairs; only the offsets differ. In this decoder a note starts at an onset peak, and the frame roll only decides
where it ends. So the tables show frame 0.1, and frame 0.2 has the same numbers (`scores.json` has both).

### Onset F1 per setting (whole songs, dev24, segment runs)

These are per-setting numbers, not results: a setting picked from this table for the song it is scored on is tuned on
its own test.

**fl**

| onset threshold | capo | tuning | standard | dev24 (macro) | capo segment | tuning segment | standard segment |
|---|---|---|---|---|---|---|---|
| 0.10 | 0.864 | 0.785 | 0.838 | 0.873 | 0.903 | 0.740 | 0.958 |
| 0.15 | 0.890 | 0.796 | 0.858 | 0.884 | 0.916 | 0.750 | 0.977 |
| 0.20 | 0.900 | 0.805 | 0.873 | 0.888 | 0.933 | 0.771 | 0.984 |
| 0.25 | 0.909 | 0.800 | 0.885 | 0.893 | 0.942 | 0.783 | 0.988 |
| 0.30 (default) | 0.920 | 0.798 | 0.892 | 0.896 | 0.937 | 0.785 | 0.988 |
| 0.35 | 0.929 | 0.795 | 0.898 | 0.897 | 0.945 | 0.772 | 0.984 |
| 0.40 | 0.934 | 0.785 | 0.901 | 0.898 | 0.955 | 0.763 | 0.984 |
| 0.45 | 0.938 | 0.751 | 0.902 | 0.899 | 0.955 | 0.745 | 0.984 |
| 0.50 | 0.939 | 0.722 | 0.906 | 0.898 | 0.954 | 0.707 | 0.984 |
| 0.55 | 0.940 | 0.661 | 0.905 | 0.894 | 0.954 | 0.659 | 0.988 |
| 0.60 | 0.939 | 0.584 | 0.899 | 0.890 | 0.933 | 0.568 | 0.992 |

**gaps**

| onset threshold | capo | tuning | standard | dev24 (macro) | capo segment | tuning segment | standard segment |
|---|---|---|---|---|---|---|---|
| 0.10 | 0.891 | 0.809 | 0.850 | 0.858 | 0.873 | 0.800 | 0.996 |
| 0.15 | 0.901 | 0.816 | 0.866 | 0.863 | 0.893 | 0.817 | 0.996 |
| 0.20 | 0.909 | 0.823 | 0.872 | 0.865 | 0.897 | 0.817 | 0.996 |
| 0.25 | 0.914 | 0.830 | 0.874 | 0.867 | 0.905 | 0.815 | 0.996 |
| 0.30 (default) | 0.919 | 0.830 | 0.879 | 0.866 | 0.909 | 0.815 | 0.992 |
| 0.35 | 0.924 | 0.828 | 0.881 | 0.866 | 0.917 | 0.806 | 0.988 |
| 0.40 | 0.930 | 0.830 | 0.877 | 0.866 | 0.922 | 0.810 | 0.984 |
| 0.45 | 0.932 | 0.832 | 0.878 | 0.864 | 0.925 | 0.808 | 0.984 |
| 0.50 | 0.934 | 0.831 | 0.879 | 0.862 | 0.915 | 0.802 | 0.984 |
| 0.55 | 0.936 | 0.828 | 0.866 | 0.860 | 0.915 | 0.800 | 0.984 |
| 0.60 | 0.938 | 0.820 | 0.857 | 0.855 | 0.924 | 0.798 | 0.984 |

**gaps-paper**

| onset threshold | capo | tuning | standard | dev24 (macro) | capo segment | tuning segment | standard segment |
|---|---|---|---|---|---|---|---|
| 0.10 | 0.905 | 0.831 | 0.880 | 0.898 | 0.869 | 0.807 | 1.000 |
| 0.15 | 0.926 | 0.831 | 0.885 | 0.904 | 0.906 | 0.817 | 1.000 |
| 0.20 | 0.943 | 0.828 | 0.887 | 0.909 | 0.937 | 0.817 | 1.000 |
| 0.25 | 0.950 | 0.822 | 0.891 | 0.912 | 0.946 | 0.825 | 0.996 |
| 0.30 (default) | 0.954 | 0.822 | 0.8955 | 0.915 | 0.946 | 0.813 | 0.996 |
| 0.35 | 0.953 | 0.815 | 0.893 | 0.914 | 0.946 | 0.813 | 0.992 |
| 0.40 | 0.954 | 0.809 | 0.888 | 0.914 | 0.941 | 0.813 | 0.988 |
| 0.45 | 0.945 | 0.797 | 0.882 | 0.918 | 0.930 | 0.806 | 0.988 |
| 0.50 | 0.941 | 0.781 | 0.871 | 0.915 | 0.929 | 0.808 | 0.988 |
| 0.55 | 0.939 | 0.754 | 0.849 | 0.911 | 0.923 | 0.788 | 0.988 |
| 0.60 | 0.931 | 0.728 | 0.829 | 0.908 | 0.922 | 0.773 | 0.988 |

### Choosing a setting without seeing the song it is scored on

There are two choosers, per checkpoint (`bin/select_settings.py`; `sweep/selection.json`):
- **Leave one song out (LOSO).** For each song, pick the setting with the best mean F1 on the other two songs, then
  report that song's F1 at the pick.
- **Dev24.** Pick the setting with the best GuitarSet dev24 macro F1, then report all three songs at it.

Ties go to the setting nearer the default. Frame 0.1 and 0.2 always tie (above), so every pick has frame 0.1. No two
onset thresholds tied, but the margins are thin: the runner-up is 0.0002 to 0.0026 behind the pick
(`selection.json`; for example fl's pick for the tuning song, 0.55, beats 0.50 by 0.0002 on capo and standard). The
numbers of record are the gtr-eval CLI files in
`/home/user/notes/runs/riley-rolls/sweep/chosen/<ckpt>/<setting>/<S>/{whole,seg30}/score_notes.json`
(`bin/score_chosen.py`).

| checkpoint | chooser | capo | tuning | standard | mean of the three |
|---|---|---|---|---|---|
| fl | default (0.30) | 0.920 | 0.798 | 0.892 | 0.870 |
| fl | LOSO (picks 0.35 / 0.55 / 0.35) | 0.929 | **0.661** | 0.898 | 0.829 |
| fl | dev24 (picks 0.45; dev 0.899 against 0.896 at default) | 0.938 | 0.751 | 0.902 | 0.864 |
| gaps | default (0.30) | 0.919 | 0.830 | 0.879 | 0.876 |
| gaps | LOSO (picks 0.50 / 0.50 / 0.50) | 0.934 | 0.831 | 0.879 | 0.881 |
| gaps | dev24 (picks 0.25; dev 0.867 against 0.866) | 0.914 | 0.830 | 0.874 | 0.873 |
| **gaps-paper** | **default (0.30)** | **0.954** | 0.822 | **0.8955** | **0.890** |
| gaps-paper | LOSO (picks 0.30 / 0.30 / 0.30, the default) | 0.954 | 0.822 | 0.8955 | 0.890 |
| gaps-paper | dev24 (picks 0.45; dev 0.918 against 0.915) | 0.945 | 0.797 | 0.882 | 0.875 |

The LOSO picks are listed in the order capo, tuning, standard. Choosing the checkpoint and the setting together by
LOSO picks gaps-paper at the default for every held-out song. Choosing both on dev24 picks gaps-paper at 0.45.

The segment runs at the same choices (capo, tuning, standard):
- fl LOSO: 0.945, 0.659, 0.984. fl dev24: 0.955, 0.745, 0.984.
- gaps LOSO: 0.915, 0.802, 0.984. gaps dev24: 0.905, 0.815, 0.996.
- gaps-paper, both choosers at the default: 0.946, 0.813, 0.996. gaps-paper dev24: 0.930, 0.806, 0.988.

At the chosen settings (whole songs; P, R, found / missed / invented; invented at slaps):
- fl LOSO: capo 0.905 / 0.955, 778 / 37 / 82, 51 at slaps; tuning 0.906 / 0.521, 327 / 301 / 34; standard
  0.873 / 0.923, 627 / 52 / 91, 73 at slaps.
- gaps LOSO (0.50): capo 0.913 / 0.956, 779 / 36 / 74, 47 at slaps; tuning 0.866 / 0.799, 502 / 126 / 78;
  standard 0.941 / 0.825, 560 / 119 / 35, 33 at slaps.
- gaps-paper dev24 (0.45): capo 0.967 / 0.925, 754 / 61 / 26, 15 at slaps; tuning 0.879 / 0.729, 458 / 170 / 63;
  standard 0.967 / 0.811, 551 / 128 / 19, 19 at slaps.

What this says:
- **Keep the default thresholds.** No chooser that does not see the test song beats the default on the mean for fl or
  gaps-paper. For gaps, LOSO gains 0.006 on the mean (+0.015 capo, +0.001 tuning, under +0.001 standard). That is too
  small to trust on three songs.
- **The nylon song wants a lower onset threshold than the steel songs and GuitarSet.** Raising it to 0.45 or more
  costs fl 0.047 to 0.214 and gaps-paper 0.025 to 0.094 there, while it helps fl on capo and standard. A
  threshold fitted on steel-string material therefore hurts the nylon song. fl's LOSO pick for the tuning song (0.55, from capo and standard) is the
  clearest case: 0.661 against 0.798. A global threshold is the wrong knob. A per-recording or per-note decision (N-E1's
  weights, N-E4's refinement) is the place for it.
- **dev24 is a poor guide here.** Its curve is flat (fl 0.888 to 0.899 between 0.20 and 0.55; gaps-paper 0.909 to
  0.918). For fl and gaps-paper it peaks at 0.45, which lowers the nylon song.
- **For scale only (not results):** the best setting for each song, chosen on that song itself, gives fl 0.940 / 0.805
  / 0.906, gaps 0.938 / 0.832 / 0.881 and gaps-paper 0.954 / 0.831 / 0.8955 (`selection.json`, `oracle_not_a_result`).
  For gaps-paper that is at most +0.009 over the default (tuning, at 0.10) [Checker: was +0.010; 0.8311 against 0.8217].

## Handoff for LOOP

`/home/user/gtv/notes/<S>/riley-<ckpt>/notes.csv` for S = capo, tuning, standard and ckpt = fl, gaps, gaps-paper. These
are the whole-song notes at the default thresholds, exactly the rows of `/home/user/notes/runs/<S>/riley-<ckpt>/<S>.notes.csv`.
Columns: `onset,offset,pitch,support,conf`.
- `support`: how many of fl, gaps and gaps-paper have a note of the same MIDI pitch with an onset within 50 ms. The
  note's own checkpoint counts, so support runs from 1 to 3.
- `conf`: the onset roll (`reg_onset_output`) at the note's onset peak frame. It is a regression target that peaks at 1
  on an onset, not a probability.

`source.json` beside each file gives the run id, the audio, the rolls file and the sha256 of the source CSV. Made by
`bin/handoff.py`.

How often a note is a real one, by support (labels from the whole-song scoring above; found = matched to a key note):

| song | checkpoint | support 1 | support 2 | support 3 |
|---|---|---|---|---|
| capo | fl | 2 of 57 | 10 of 36 | 769 of 790 |
| capo | gaps | 14 of 79 | 4 of 29 | 769 of 790 |
| capo | gaps-paper | 2 of 10 | 10 of 23 | 769 of 790 |
| tuning | fl | 8 of 27 | 24 of 40 | 441 of 491 |
| tuning | gaps | 16 of 46 | 57 of 81 | 444 of 491 |
| tuning | gaps-paper | 7 of 18 | 44 of 63 | 442 of 491 |
| standard | fl | 25 of 95 | 44 of 64 | 561 of 575 |
| standard | gaps | 2 of 39 | 28 of 43 | 557 of 575 |
| standard | gaps-paper | 2 of 12 | 25 of 45 | 560 of 575 |

A note all three checkpoints agree on is real 90 % of the time on the nylon song and 97 to 98 % on the steel songs. A
note only one checkpoint has is real 4 to 39 % of the time. This is a description of the three songs, not a tuned
rule: it is N-E1's job to turn it into one.

## What is uncertain

- **Whether gaps-paper saw any of these recordings, or GuitarSet.** Nothing says what it was trained on beyond GAPS.
  The three songs are not in GuitarSet, so its gain here is the fairer test of the two. Its gain over fl on GuitarSet
  dev24 was +0.019; here it is +0.034 (capo), +0.024 (tuning) and +0.004 (standard). It is still three songs and two
  players. The held-out songs (N-E7) are the real test.
- **Licences.** The GAPS data is for non-commercial research, so gaps and gaps-paper may not be usable in a product
  (brief, section 9).
- **One run each.** The model runs are deterministic: the checker found bit-identical rolls on re-runs, and fl and gaps
  reproduce step 2 here. The scores do not vary between runs. What varies is wall time with box load.
- **The keys.** Tab-only notes (capo 54, tuning 72, standard 96) count as misses when a model does not play them. The
  tuning key's onsets may be late, given that every model is 29 to 30 ms early there (brief, section 2). Heard-only
  recall is given for this reason.
- **The sweep's selection rule** (mean F1 of two songs, ties to the default) is one reasonable rule among several. With
  three songs, each LOSO choice rests on two songs.

## Files

| path | what |
|---|---|
| `/home/user/notes/runs/<S>/riley-<ckpt>/<S>.npz`, `<S>.notes.csv` | rolls and notes, whole song |
| `/home/user/notes/runs/<S>/riley-<ckpt>/seg30/<S>.seg30.npz`, `.notes.csv` | rolls and notes, segment run |
| `/home/user/notes/runs/<S>/riley-<ckpt>/score/{whole,seg30,seg30crop}/` | eval files (`score_notes.json`), breakdown, labels, slaps, `summary.json`, `score.sh` |
| `/home/user/notes/runs/riley-rolls/logs/runs_clean.tsv` | run id, wall and riley_post's own timing per run |
| `/home/user/notes/runs/riley-rolls/checks/step2/` | the step-2 comparison |
| `/home/user/notes/runs/riley-rolls/sweep/` | decoded CSVs per setting, `scores.json`, `selection.json`, `chosen/` |
| `/home/user/notes/runs/riley-rolls/bin/` | every script used here |
| `/home/user/gtv/notes/<S>/riley-<ckpt>/` | the handoff for LOOP |

## Checker

Written 2026-11-27 by an independent checker of this job. I did not trust the report. I re-derived the numbers with
my own code in `/home/user/notes/runs/check-rolls/bin/`. That means my own key and CSV loaders and my own 30 s crops
(`crop_truth.py` again; same sha256 as this job's segment keys). For matching I called
`mir_eval.transcription.match_notes` 0.8.2 directly: onset within 50 ms, pitch within 50 cents, offsets ignored, one
to one. A second matcher, scipy's `maximum_bipartite_matching` on my own hit matrix, had to give the same count every
time, and it did. Outputs are in `/home/user/notes/runs/check-rolls/out/`.

**Verdict.** The record holds. Every headline number re-derives exactly:
- F1 0.920 / 0.798 / 0.892 (fl), 0.919 / 0.830 / 0.879 (gaps) and 0.954 / 0.822 / 0.8955 (gaps-paper).
- The step-2 reproduction.
- The sweep, the LOSO and dev24 picks, and the handoff files.

I found one wrong claim (gaps-paper "keeps recall"), one count that differs from step 2 without a word, two rounding
errors and three statements that needed a qualifier. I fixed them in place, marked "[Checker ...]" above. No
conclusion changes: gaps-paper at the default thresholds is still the best single checkpoint on the mean, and the
defaults stay.

### What I checked

| check | how | result |
|---|---|---|
| The 18 runs exist and are the ledger's | `/home/user/gtr/ledger/runs.jsonl`: id, command, input sha256, wall, exit code; each `.npz`'s `meta_json` (checkpoint sha256, audio sha256, note count) | r1330 to r1336, r1338 to r1347 and r1349, all exit 0, 2 cores, `--threads 2`. Every wall second in the table equals the ledger's. The audio sha256 in each `.npz` equals the ledger input. The checkpoint sha256 values equal HF's pinned ones. r1337 and r1348 belong to other lanes. Sweep r1392, 428.46 s. Step 2's walls: r0788 to r0847, 102.1 to 155.8 s |
| Headline scores, 27 files (9 runs x whole, segment run, crop) | `cscore.py` + `score_defaults.py`; gtr-eval 0.12.1 `notes --no-ledger --pretty` on the same files (`geval_all.sh`, my own crop CSVs) | `n_matched` equal in 27 of 27. P, R and F1 agree to 5e-7 (gtr-eval prints 6 decimals). They are equal to this job's `score_notes.json` |
| Whole-song and segment tables, 177 cells | parsed from this file, compared with my values at the shown precision | 175 equal; two rounding errors, fixed (tuning gaps strings 3-1 0.831, standard gaps heard-only 0.901) |
| The breakdown files | this job's 27 `summary.json`: found, invented, heard-only hits, string-group recall, slaps, median onset error | 216 of 216 fields equal mine |
| fl and gaps against step 2 (n-03, n-02) | `check_step2.py`: counts per pitch and onset differences against step 2's float CSV, its `notes.csv` and its `.mid` (read with mido); each scored with my code; eval ids e2052, e1987, e2066, e2062, e2532, e2531 read in `/home/user/gtr/eval/ledger/evals.jsonl` | counts and pitches equal in all six. Onsets equal to 0.007 ms against the float CSV, 1.30 ms against `notes.csv` and the `.mid` (the tick floor). F1 equal to 6 decimals except tuning fl: 0.797639 here and from step 2's float CSV, 0.795953 from its `.mid` (mido read gives the recorded value). Near the edge: three early notes at -49.0 to -49.9 ms cross to -50.3 to -50.7 ms, two late ones at +50.2 and +50.4 ms come inside, as the record says. Same checkpoint files (sha256) and same torch, librosa, numpy and soxr versions in both venvs |
| The tuning WAV's hash | `ffmpeg -i tuning.wav -ac 1 -fflags +bitexact` into my folder; Python `wave` sample compare | gives the ledger's `7627a54d...`; samples identical to today's `tuning.mono.wav`. All three segment WAVs are exact sample crops at 12.76, 25.0 and 0.0 s |
| Slaps against step 2 | taps_invented's rule (a key tap within 50 ms) on my own labels, and on step 2's `labels.json` | capo fl 59, capo gaps 64, standard fl 82 equal step 2. Standard gaps is 62 of 70 here against 61 of 70 in step 2 (tick floor, one note). Added above |
| Sweep, every number | `sweep_check.py`, my own decode (the package's `RegressionPostProcessor` called directly, not riley_post's wrapper) and my scorer, 3 checkpoints x 30 files x 22 settings; dev24 against `dev/truth` with `devset.json`'s crop, macro mean; gtr-run **r1481**, 167.6 s on 2 cores | F1 equal to `scores.json` within 5e-7 on every song and segment. Found and estimate counts equal. Dev24 macro F1 equal exactly. All 231 cells of the three sweep tables above are equal |
| Frame 0.1 against 0.2 | the same sweep: onset and pitch arrays compared byte for byte | identical in 990 of 990 file pairs |
| riley_post's CLI path | `riley_post.py --from-npz` for 5 settings, compared with this job's sweep CSVs; and for the 9 chosen settings, scored with my code | byte-identical. P, R, found, missed, invented and slaps at the chosen settings are equal to the lines above |
| No setting chosen on its own song | read `select_settings.py`; my own LOSO and dev picks (`sweep_compare.py`) from my own sweep | the LOSO picks use only the two other songs. The dev picks use only dev24. My picks equal the record's in all 12 cases, and the joint picks too (gaps-paper at 0.30 by LOSO, 0.45 by dev24). Runner-up margins 0.00016 to 0.00262. The per-song best is labelled as not a result |
| Determinism | gtr-run **r1482** (18.2 s, 2 cores): gaps-paper on `capo.seg30.mono.wav` again | the four rolls and the CSV are bit-identical to r1346 |
| Handoff for LOOP | `check_handoff.py` on all nine `/home/user/gtv/notes/<S>/riley-<ckpt>/notes.csv` | header `onset,offset,pitch,support,conf` in all nine. Rows equal to the run CSVs. `support` recomputed (same pitch, onset within 50 ms, own checkpoint counts): 0 differences, range 1 to 3. `conf` equals the onset roll at the note's peak frame, a local maximum, for every note. `source.json` sha256 values match. The support table above is equal in all 27 cells |
| Public repo | this file: links, hosts, key-shaped strings, key note lists, tab text; the never-publish scan of `EMBED.md` 2.4 (the repo's own matcher and hashes) | numbers and local paths only; 0 never-publish hits (after my edits too) |

### What I changed

1. **gaps-paper's recall on standard.** The record said it "keeps recall". It keeps fl's recall on capo only. On
   standard it finds 587 key notes against fl's 630 (R 0.865 against 0.928). Its +0.004 there is fewer invented
   notes outweighing fewer found. The report's "with the same recall" is wrong for standard. Marked in "In short" and
   under the whole-song table.
2. **Standard gaps at slaps: 62 of 70, not step 2's 61 of 70.** The tick floor again: one note. Marked in the
   scoring paragraph.
3. **Two rounding errors in the whole-song table**: tuning gaps strings 3-1 0.8315 is 0.831, not 0.832. Standard gaps
   heard-only 525 of 583 = 0.9005 is 0.901, not 0.900. (Both came from rounding breakdown.py's 4-decimal value
   again.)
4. **Qualifiers**:
   - The equality of onsets is against step 2's float CSV, not the `notes.csv` the brief names. That file is the
     tick-floored `.mid`.
   - The nylon song wants a lower onset threshold for fl and gaps-paper, not for gaps.
   - gaps-paper's bass strings are not its weak side within the nylon song.
   - Inside the capo segment the segment run and the crop differ too: the window grid is offset.
   - gaps-paper's per-song best on tuning is +0.009 over the default, not +0.010.

Copy of this file as it was: `/home/user/notes/runs/check-rolls/backup/riley-rolls.md.orig` (sha256 `1e3bab0b...`).
Nothing else was changed. The runs, the scores, the sweep and the handoff files are as this job left them.

### Notes for the session

- **The MIDI tick matters at the 50 ms edge.** Step 2 scored floored `.mid` times. On a song where a model is about
  30 ms early, it moves F1 by 0.002 and slap counts by one. Compare float CSVs with float CSVs from now on.
- **gaps-paper is a precision gain on the steel songs, not a free one.** On standard it gives back fl's 43 extra found
  notes. A vote of fl and gaps-paper (N-E1) is where that recall could come back.
