# Held-out songs: the app's own Opus steps, blind (E7 inputs)

By the ho-blind agent of LOOP, 2026-11-27 06:03-07:15 UTC. G = `/home/user/gtv`. Work notes: `G/work/ho-blind/PROGRESS.md`;
every run's minutes, tokens, cost, frames looked at, decisions and audits: `G/heldout/blind-runs.json` (copy beside this
file: `heldout-blind-runs.json`). Nothing here was scored: the hand windows and the finder's answers meet the keys later.

## Frozen first

Before the first held-out blind run (06:04:40) every file these steps run or copy was hashed: G/loop/tools (hand-reach
tool, tuning tools, sandbox), the dev prompts copied, the reused e1-blind and E2 scripts (64 files,
`G/heldout/freeze-ho-blind.json`, written 06:03:48; blog HEAD 01756b12). Rechecked after the last run: no file changed.

## The procedure (the dev songs', copied)

- **Hand anchors, then hand check** (E1, `HAND.md`): the dev `hand-a-anchors` and `hand-a-check` PROMPT.txt word for word,
  the capo filled in (closer 1, september 2); in each folder copies of the video, the stored MediaPipe landmarks as
  `hands.jsonl` and TOOLS-HAND.md. Between them, `neck_track.py` (gtr-run) and `hand_window.py` (margins 0, 1, 2; 30 rows
  a second) on the anchors; after the check, its corrections applied (`apply_corr.py`, unchanged) and the window remade.
  One difference from the dev songs: the onsets the check looks at come from the base notes, gaps-paper (E7's note rule),
  where the dev songs used chain-2's.
- **Tuning finder, "everything"** (E2, `TUNING.md`): the dev `tun-c-all` PROMPT.txt word for word, the capo filled in; the
  pack built as `make_packs.py` built the dev packs: the video, gaps-paper's notes (onset, offset, pitch), the held-out
  window and tips after the check, the neck model (keyframes' wires only), the seven tools and TOOLS-TUNING.md.
- **Base notes**: `hand_filter.py` (unchanged) on gaps-paper's notes with the finder's tuning, the capo and the window.
- Blind labels ho-hand-a / ho-tun-a (closer) and ho-hand-b / ho-tun-b (september); the map lives outside every blind folder.
  Every run in `sandbox_run.sh` + `blind_run.sh` (network closed but model requests, answers absent), Opus 5.5 at max
  effort, folders of copies with neutral names. Each folder passed `blindcheck.py` with the held-out names and slot ids
  and a grep for the songs' titles, players and tuning names before its run (the finder folders' only hits are the dev
  slot word "capo" as code in `conflicts.py` and `fingers.py`, the same files the dev finder runs had).

## The runs

| run | song | what | minutes | output tokens | cost (list) | frames looked at | result |
|---|---|---|---|---|---|---|---|
| ho-hand-a-anchors | closer | anchors | 33.5 | 126,672 | $9.35 | 73 | 20 keyframes, 11 shots (takes cut together; the tracker saw no cuts), steel |
| ho-hand-a-check | closer | check | 10.7 | 63,021 | $3.25 | 17 | 873 decisions: 25 accept, 848 window; no new keyframe |
| ho-tun-a | closer | finder | 17.2 | 98,638 | $4.38 | 21 | 40,45,50,55,57,62 |
| ho-hand-b-anchors | september | anchors | 29.9 | 98,483 | $6.21 | 46 | 11 keyframes, 2 shots (a title shot with a black box, then one wide shot), nylon |
| ho-hand-b-check | september | check | 11.8 | 69,678 | $3.37 | 24 | 28 decisions: 21 accept, 7 window; no new keyframe |
| ho-tun-b | september | finder | 10.4 | 60,276 | $2.62 | 13 | 38,43,50,55,59,62 |
| all six | | | 113.5 | 516,768 | $29.18 | 194 | closer $16.98, september $12.20 |

- **Closer's check** found the window inflated by the picking hand: its tips over the board (mostly frets 8 to 22) counted as taps in 4,099 of
  7,390 rows (tool alone: mean width 10.88 frets). It saw no tap in about 50 frames across every shot, so it set every
  such row to the fretting hand's own part (725 decisions logged as a rule, as TOOLS-HAND.md allows), and 16 stretches
  where the landmarks jumped to the picking hand from the overlays. After the check: width 5.89, lost 0.0081 of rows.
  Whether a real tap was cut is for scoring to show.
- **September's check** corrected 7 onsets (a blurred hand, a pinky landmark below the board, detector dropouts).
  After the check: width 4.73, lost 0.0046.
- **Tracks**: closer r1370 (218.8 s wall, 250.2 CPU s; null 0.003; self-check median 0.017 of a gap), september r1369
  (214.8 s, 246.8 s; null 0; 0.028). Neither check changed a keyframe, so neither was tracked again.
- **Base notes** after the hand filter: closer 1,191 -> 1,169 (22 removed, 12 onsets in lost rows); september 412 -> 412
  (0 removed, 2 in lost rows). `G/heldout/<S>/notes/gaps-paper-hf/` (notes.csv, removed.csv, filter.json with SHA-256s).

## Audits

Every transcript twice: the dev audits (`audit_run.py` for the hand runs, E2's `audit.py` for the finders) and a second,
independent one (`G/work/ho-blind/audit2.py`). All six clean: no tool outside the limit, no answer-bearing or foreign
place, no network, git, install or search command. The only paths outside a run's folder were its own session
scratchpad in the sandbox's private /tmp and the system python3 on its own files (as on the dev runs). The sandbox's
network logs show only model requests allowed; the CLI's settings, telemetry and logging requests were refused, as
before. No run mentions a held-out title, artist or player in its own words; the finders name tunings, which is their answer.

## Files

`G/heldout/<S>/hand/` (hand_window.csv, tips.jsonl, anchors.json, track.json, corrections.json, corrections_m1.txt,
corrections_applied.json, README.txt), `G/heldout/<S>/finder.json`, `G/heldout/<S>/notes/gaps-paper-hf/`,
`G/heldout/<S>/e1/` (the tool-alone and after-check windows at margins 0-2), `G/heldout/blind-map.json`,
`G/heldout/blind-runs.json`. hand_window.csv SHA-256: closer b1afe34a073791942ca960a57a6c5f09b5a30a52397d2cb41028f62dd9c3e95b,
september 7fc6b962614ea45cc56df971859e9e04473f40922294f7dcc3b74d638abadf99. tuning.json SHA-256: closer
bda8d96f18d1e4304535c2842b7006240a09cac6f4e7aadc1665f024cd7f8581, september
4040bf94f0c7044d15c9dac4a91c079fcb159057c3d2923463f24abdba677bb5.
