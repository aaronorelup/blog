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
