# The film for AO-082: orchestrator's state

Aaron's ask (2026-11-24): a film of about 30 minutes (up to 60) for the top of the post. Three real recordings
with video and known tablature (capo, unusual tuning, neither). Every technique from the post applied to them
and compared with the truth. Tabs are always played, not only shown. At the end Opus 5.5 tries each tab blind,
with the chosen tools and without. Then it goes at the top of the post, live. Everything is pre-approved.
Budget rule: helpers run on Opus 5.5 or Sonnet, never Fable. The orchestrator keeps its own turns few.

Heavy files: `/home/user/gtv/` on the cloud box. Records: this folder.

## Stages

1. Scout (workflow `gtv-scout`, run wf_1c0ec56a-082): three song scouts and a selector write `SONGS.md` and
   `songs.json`. Three more scouts write `PRODUCTION.md`, `EXPERIMENTS.md` with `experiments.json`, and `EMBED.md`.
2. Truth and toolkit: a timed, checked ground truth per song. The tools installed (box, and a rented GPU if planned).
3. Experiments: each step's techniques run on the three songs, scored, with the pictures and sound the film needs.
4. Blind attempts: Opus 5.5, per song, with the toolkit and without. Scored and rendered.
5. Script, voice, chapters, render, checks.
6. Publish: media push, the post's top, landing, studio library, pull request note.

## Log

- 2026-11-24 22:20 UTC: stage 1 launched.
- 2026-11-25 00:04 UTC: the container restarted. Five of seven stage 1 agents had finished (production, tools,
  embed, and the dataset and creator song scouts). Stage 1 resumed: the archive scout and the selector.
  Findings so far: YouTube refuses downloads from this box, so songs must come from hosts that answer (Vimeo,
  archives, dataset hosts). HyperFrames renders 1080p30 at about 1.15 s per second here. Narrator candidate chosen.
- 2026-11-25 01:27 UTC: the container restarted again (it does so about every 80 minutes). From here every agent
  keeps a PROGRESS.md in `/home/user/gtv/work/<agent>/` and continues from it after a restart.
- 2026-11-25 01:50 UTC: stage 1 finished. Picks (`SONGS.md`, `songs.json`): capo = "Steal My Girl", arranged and
  played by Gareth Evans (standard tuning, capo 3, his Guitar Pro tab on screen with rhythm). Tuning = "A soft
  collision of breath", composed and played by Evan Handyside (D G C F A C, handwritten tab with no rhythm).
  Standard = "Imagine", arranged and played by Gareth Evans (tab on screen with rhythm). Two players, not three.
  Rights to flag at the end: two covers of major-label songs taken from a third-party mirror, tabs that are now
  sold, and a tab file that sits behind the composer's paywall plugin.
- 2026-11-25 01:55 UTC: stages 2 and 3 launched as one workflow (`gtv-lab`): per song two independent readers of
  the tab, a truth builder, an independent checker and a repair pass. Two toolkit installers. Then one agent per
  step of the job in three waves plus a rented GPU lane, two auditors, a results editor and the picker of the
  blind test's toolkit.
- 2026-11-25 04:10 UTC: answer keys built for all three songs. The independent checker failed two of them on
  timing (capo: notes 50 to 100 ms early in 24 runs, beats early; standard: one bar and three rolled chords) and
  one on pitch (tuning: the bass of 12 verse bars is E2, not D2, plus about 55 notes nothing plays). Repair passes
  and re-checks are running. Freed 4.7 GB of package cache nobody linked to. The orchestrator moved from Fable 5.2
  to Opus 5.5 (Aaron's switch, Fable's weekly limit reached).
- Next: stage 3 runs in three side-by-side lanes (`workflows/gtv-lanes.js`, lanes m, b, c), because one workflow
  runs only two agents at a time on this box. Then stage 4 to 6 (`workflows/gtv-film.js`, one part per run). The
  blind test runs with nothing else on the box and a file-access watch on the answer folders
  (`workflows/guard-watch.py`), and its transcripts are audited afterwards.

## 2026-11-25 05:27 UTC

- Answer keys: capo and tuning pass the second check (capo: 128 onsets re-timed; tuning: 12 bass notes corrected
  to E2, unplayed notes removed). Standard still has three open problems after its first repair (two notes heard
  as E3 not G3, six played notes missing, the pose-A neck outline drifting after about 40 s).
- Stage 3 started in four lanes of `workflows/gtv-lanes.js`: m (separation, notes, string and fret, voices, then
  sound plus picture, chains, audits, results), b (chords and beat, tuning and capo, rented GPU), c (video, hosted
  services) and t (a second repair and a third check of the standard answer key). Lane m waits for b, c and t, then
  rescores every standard experiment against the repaired key before the chains.

## 2026-11-25 06:51 UTC

- Lane c (video, hosted) finished. The GPU lane ran on the box's CPU: the permission system refused creating a
  RunPod pod, and it was not retried another way. SAM 3 skipped (no GPU, no Hugging Face token).
- Standard answer key: the second repair fixed the second check's problems; the third check found three smaller
  ones (one unplayed C3 at 6.886 s, 16 string slaps 55-70 ms late, the neck outline missing quick jolts for 5.5 % of
  fretted notes). A last repair round with a focused check runs as lane t3; lane m's rescore waits for it.

## 2026-11-25 08:24 UTC

- Standard answer key passes its fourth check (third repair round: one unplayed C3 removed, 16 slaps re-timed,
  video scored against a per-frame neck outline). All three keys are final.
- Lanes b, c, t and t3 finished. Lane m finished separation, notes, voices, string and fret, and sound plus picture,
  rescored 30 standard experiments against the final key (no ranking or conclusion changed), and is in the chains;
  then audits, results and the blind kit.
- Disk fell to 2.4 GB at 07:36; the string-and-fret agent cut its render.wav files to mono 22.05 kHz and I cleared
  the npm and node caches (3.1 GB free now). PRODUCTION.md now says to render every listening window again from the
  notes. After the blind test the experiment venvs can go to make room for the film render.

## 2026-11-25 09:40 UTC

- Chains done (step-09 record). Best finished tab per song, share of all truth notes with the same string and fret:
  capo 0.940, tuning 0.914, standard 0.918. The blind tuning-and-capo step loses the most; a per-beat tempo GP5 writer
  was needed to keep notes on time.
- Both audits failed and their fix agents run. One finding matters for stage 4: hosted runs sent audio named after
  the slot (capo / tuning / standard), and one frame sheet showed a video end card with a site name. Before the blind
  test: check that each blind video holds only the playing (no end card, no title) and that no file the sessions can
  see carries a slot name.

## 2026-11-25 10:45 UTC

- Stage 3 finished: RESULTS.md and results.json written after both audits were fixed; BLIND.md and the kit
  (`/home/user/gtv/tools/kit/`, `/home/user/gtv/tools/bare/`) built; blind videos made (mapping only in the truth
  folder).
- Before the blind test: removed hints about the test recordings from the kit's TOOLS.md, checked the blind videos by
  eye (playing only), aligned the blind prompt with the kit (key format, NOTES.md, what the tools arm may run) and
  changed the order to two waves of three so that both arms of one video never run at once (BLIND.md section 7).
- Disk: removed three tool environments the kit does not use (msst, ultra, uvr), the CoTracker model, the four backup
  recordings and 39 orphaned uv cache archives (1.2 GB); 3.9 GB free.
- Stage 4 starts now: file-access watch, then `gtv-film.js` part blind, lanes x and y, nothing else running.

## 2026-11-25 11:58 UTC

- Blind test done: six attempts (three songs, with and without the kit), 10:39-11:57 UTC. Every attempt handed in a
  valid answer well inside its 90 minutes (by their own account 28 to 40) and stopped by its own choice. Said before scoring: capo song, both arms
  standard tuning with capo 3; standard song, both arms standard with no capo; tuning song, the kit arm D G C F A D
  (five of six strings as the key has them), the bare arm D G D G C D.
- The access watch logged no read of any answer file; its only entries are the run ledger (gtr-run numbering runs)
  and three listings of the records folder at the orchestrator's own turn ends (`/home/user/gtv/guard/NOTE.md`).
- Scoring and the transcript audit run now (`gtv-film.js` part score).

## 2026-11-25 12:25 UTC

- Round 1 scored (BLIND-RESULTS.md) and audited (results/audit-blind.md): all six attempts valid by their tool calls
  and the access log. But the harness had attached the orchestrator's task list to every attempt's context 13 to 18
  times; its entries named the performers and the answer keys "capo", "tuning" and "standard". No attempt wrote
  those names, yet knowing that the test holds a capo song and a tuning song is a hint.
- So the blind test runs again as round 2, with the task list emptied (all tasks deleted; this file is the only
  tracker from now on), new ids c1, c2, c3 in a new random order (mapping in the truth folder only), and the same
  videos, prompt, model, effort, time and kit. Round 1 stays on record as a second run, marked "task list visible".
- Disk: deleted round 1's intermediate audio, arrays and raw frames (1.8 GB; answers, notes, scores and film files
  kept); 3.4 GB free.

## 2026-11-25 13:50 UTC

- Blind round 2 done: six attempts, 12:20-13:46 UTC, each stopped by its own choice in about 33 to 41 of its 90
  minutes. The task reminders in every attempt's context were empty this time (itemCount 0).
- Said before scoring: c3 both arms standard tuning, no capo, C major, about 77 BPM; c1 both arms standard tuning with
  capo 3, B-flat major; c2 both arms D standard (D G C F A D, about -10 cents), no capo.
- Access watch stopped 13:47 (`/home/user/gtv/guard/access-r2.log`): no read of any answer file; the ledger reads of
  gtr-run and three listings of the records folder by the orchestrator's own harness (12:21 turn end; 13:25 and 13:34
  around the orchestrator's context compaction). No attempt's tool call names a watched path.
- Disk: each finished attempt's large scratch audio and arrays deleted by the orchestrator (answers, notes, scripts and
  pictures kept); 3.0 GB free.
- Scoring and the transcript audit of round 2 run now (`gtv-film.js` part score2, run wf_d1c32948-4e0).

## 2026-11-25 14:10 UTC

- Round 2 scored and audited (run wf_d1c32948-4e0). All six attempts valid; no attachment leaked. Main score (same
  string and fret, share of truth notes, in the GP5), kit arm / bare arm: standard 0.865 / 0.705; tuning 0.548 / 0.347
  (both arms named D G C F A D, the key's first string is C4); capo 0.930 / 0.816. Round 1 (task list visible): 0.828 /
  0.694, 0.562 / 0.159, 0.907 / 0.805. Best chain per song: 0.918, 0.914, 0.940. The kit arm beat the bare arm on every
  song in both rounds.
- The auditor corrected the guard note: the 13:25 folder walks came from the permission classifier's context for
  c2-tools' one refused call, not from the orchestrator's compaction (NOTE.md, BLIND.md section 7).
- The protocol's tool limit (section 4 step 3) was never applied; the attempts used none of the extra tools beyond
  ToolSearch and TaskStop. Written into BLIND.md section 7 and to be said in the film.
- Next: stage 5, part script (`gtv-film.js`).

## 2026-11-25 16:55 UTC

- Stage 5, part script (run wf_106dfdd6-045): the script is written (`/home/user/gtv/production/SCRIPT.md`, title "From
  a guitar video to a finished tab", 18 chapters ch00-ch17, 156 lines, 4,883 words, 83 listening windows, estimate
  about 44 minutes). The fact check and the viewer read raised 38 problems; script-fix fixed 37 and part of the 38th
  (length). Voiced: all 156 lines, 35.1 minutes of narration, 19,477 ElevenLabs credits (14,046 -> 33,523 on the
  counter). The kit-extender is building the seven missing scene components (KIT-NEEDS.md).
- Disk: the experiments' `render.wav` files (201, 3.1 GB) were deleted; PRODUCTION.md already forbade them in the film
  and now says they are gone (list in `/home/user/gtv/work/deleted-render-wavs.txt`). 5.3 GB free.
- Next: part chapters in three lanes once the kit-extender is done.
