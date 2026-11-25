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

## 2026-11-25 16:47 UTC

- The kit-extender built all seven missing components (tab stack, timeline, grid, chain map, and extensions to
  clipoverlay, pianoroll and barchart), each checked and test-rendered (`/home/user/gtv/work/kit-extender/PROGRESS.md`;
  formats in PRODUCTION.md 6.4). Its finding: alphaTab's clock and gtr-eval's reading of a GP5 with a tempo on every
  beat drift apart by up to 0.3 s, so builders place marks from `stack_data.py strip --notes`.
- Part chapters launched in three lanes: A wf_90c13fe7-558 (ch00, 03, 06, 09, 12, 15), B wf_16b3a406-098 (ch01, 04,
  07, 10, 13, 16), C wf_0cbb4c63-4e1 (ch02, 05, 08, 11, 14, 17). Each chapter: build, independent review, fix and
  re-review. Renders one at a time under the lock. Check-in at 19:30 UTC.

## 2026-11-25 19:45 UTC

- Check-in. The three chapter lanes are still running. All 18 chapters are built and reviewed once. 15 have had a fix
  round. Every review so far found something; ch03 and ch04 say they pass their own QC after the fix.
- Disk was down to 301 MB free. Freed 3.7 GB, all of it re-creatable or no longer needed:
  - the finished experiments' model caches (torch hub and Hugging Face, 1.9 GB, list in
    `/home/user/gtv/work/deleted-caches-1935.txt`);
  - 9 stale HyperFrames frame-cache folders;
  - the experiments' other note renders (`render.*.wav`, `click.wav`, the chord and click renders; 50 files, 1.4 GB,
    list in `/home/user/gtv/work/deleted-render-wavs-2.txt`).
  Now 4.0 GB free.
- Problem found: build and fix agents that ended their turn while their render waited for the lock had the render
  killed. ch02 has no current chapter.mp4. New part `polish` in `gtv-film.js`: renders are started detached and waited
  for in the foreground; it fixes what the re-review left open, then a closing check marks problems BLOCKING or NIT,
  with one more fix round for anything BLOCKING.
- Polish run P1 (wf_368d80d9-86e, args in `/home/user/gtv/work/polish-P1-args.json`): ch02, ch05, ch08. ch08 has one
  factual fix: LilyPond's time with the tuning and capo given is 3.3 to 3.7 s, not 3.3 to 8.8 s. Its line is voiced
  again.
- Next: polish the other chapters as their lanes finish, then part finish.

## 2026-11-25 19:55 UTC

- Lane C (ch02, 05, 08, 11, 14, 17) finished: none passed the re-review outright. ch02, 05 and 08 are in polish P1.
  ch11, 14 and 17 wait for the kit fix (their items: `/home/user/gtv/work/polish-pending-laneC.json`).
- Two film-wide findings, decided in PRODUCTION.md 6.10: the mono narration plays 3 dB louder in the stereo mix than
  its -17 LUFS level suggests (rule now: each line 1.5 to 3 dB over the windows, measured in chapter.mp4), and
  `tabstrip.cjs` shot the last tile of long strips about 10 px off (23 of 47 strips).
- Part kitfix running (wf_0bbaa7e8-d14): fix the tool, shoot the strips again outside the chapters, write
  `/home/user/gtv/work/seamfix/AFFECTED.md`, then an independent check. Later polish runs use `wide: true` (6.10 and
  AFFECTED.md in every fix and check). P1's chapters get a levels and seams check before the join.

## 2026-11-25 20:15 UTC

- Lane B (ch01, 04, 07, 10, 13, 16) finished; none passed outright. Its open items are in
  `/home/user/gtv/work/polish-pending-laneB.json`. ch10 and ch13 had no render of their fixes; their fix agents' renders
  died in the lock queue.
- PRODUCTION.md 6.10 now also covers voice edges (5 ms fade-in, 20 to 25 ms fade-out, no clicks) and the song under
  the voice (section 2.7's 0.22 to 0.3, never 0.12).
- Polish runs with `wide: true`, for the chapters without tab strips: P2 wf_943bbafb-7d3 (ch07, ch17) and P3
  wf_f653901e-6ea (ch04, ch14). Args are in `/home/user/gtv/work/polish-P2-args.json` and `polish-P3-args.json`.
- Waiting for the kit fix: ch01, 10, 11, 13 and 16, which use strips. Lane A (ch00, 03, 06, 09, 12, 15) is still
  running.

## 2026-11-25 20:30 UTC

- P1 finished: ch02, ch05 and ch08 pass, with minor items only.
- The kit fix found the real cause. alphaTab scrolls the page 10 px to the first bar, every tile carried that shift,
  and the browser dropped it for the last tile. It affected 46 of 53 strips; on 19 of them the join looks clean, but
  the marks in the last tile are still off.
  - The fix: `page.html` turns the scroll off, `tabstrip.cjs` checks the shift, and `kit/tools/strip_seams.py` checks
    any strip.
  - 43 strips outside the chapters were shot again in place; the old files are kept as `*.pre-seamfix`.
  - `/home/user/gtv/work/seamfix/AFFECTED.md`: the damage is on screen in ch08 (155-168 s), ch11 (scene 2) and ch15
    (scene 6). ch10, ch12 and ch16 only refresh files. ch00, ch01 and ch13 are not affected.
- Disk: dropped HyperFrames frame-cache folders older than 15 minutes and the old scouting venv (in the scratchpad).
  3.7 GB free.
- Polish runs, all with `wide: true`; args in `/home/user/gtv/work/polish-PN-args.json`:
  - P4 wf_b00f10ac-d69: ch10, ch11
  - P5 wf_fce67cf6-1ba: ch13, ch16
  - P6 wf_3e589e37-574: ch01, plus ch08's strip refresh and the film-wide checks
  - P7 wf_ecd31a48-179: the film-wide check for ch02 and ch05 (render only if a number is outside)
- Still running: P2 (ch07, ch17), P3 (ch04, ch14), lane A (fix-ch15, rereview-ch12), the kit-fix check. Lane A's
  chapters (ch00, 03, 06, 09, 12, 15) go into polish when it ends.

## 2026-11-25 20:50 UTC

- The kit fix passed its independent check: 305 joins and every last tile match a fresh reference shot, and the beat
  maps are unchanged.
- Lane A (ch00, 03, 06, 09, 12, 15) finished; none passed outright. Its items are in
  `/home/user/gtv/work/polish-pending-laneA.json`.
- New film-wide finding (PRODUCTION.md 6.10 (e)): `level.py` used plain gain and wrote 16-bit PCM, so the narration is
  clipped. 7,467 clipped samples over the 156 source lines; 11 chapters place clipped lines (up to 1,261 samples in
  ch06). Part voicefix (wf_367c205f-900): a true-peak limit in level.py, the 156 lines levelled again from their mp3s
  with the same length and timing, `/home/user/gtv/work/voicefix/AFFECTED.md`, then an independent check.
- Polish runs with the full rules (a) to (e):
  - P8 wf_989bb546-5ad: ch00, ch03
  - P9 wf_cd61cf73-af6: ch06, ch09
  - P10 wf_46a2426a-1e8: ch12, ch15
- Finished so far: ch17 and ch05 pass their polish check (P2, P7).
- Runs P2 to P7 started before rule (e). Their chapters that place clipped lines (ch02, 04, 07, 13, 14, 16) get one
  more short pass once voicefix is done.

## 2026-11-25 21:12 UTC

- Part voicefix done and checked:
  - `level.py` now limits true peak after the gain (numpy, 4x oversampled, zero latency, -1.0 dBTP, 24-bit).
  - 126 source lines re-made in place (same length, lag 0, loudness within 0.07 LU). The other 30 already had limited
    files from fix agents and stay.
  - Clipped samples in the sources: 7,462 before, 0 after. The checker found no pumping and no dulled consonants.
  - Corrections to the records are appended to `/home/user/gtv/work/voicefix/AFFECTED.md`.
- 13 chapters must refresh their placed narration: ch00, 01, 02, 04, 06, 07, 10, 11, 12, 13, 14, 15, 16. P8 to P10
  cover ch00, 06, 12 and 15 (rule (e) is in their prompts). The others get a refresh run when their current polish run
  ends: P11 wf_fd3f8bfc-99a (ch02) is running; ch01, 04, 07, 10, 11, 13, 14 and 16 are still to come.
- P7 finished: ch02 and ch05 pass the film-wide check.

## 2026-11-25 21:22 UTC

- P2 finished: ch07 and ch17 pass. ch17 is done. ch07 gets the narration refresh: P12 wf_95aabce1-663.
- Disk was at 2.6 GB free. I deleted stale frame-cache folders, dead files in four work folders, and three experiment
  venvs that nothing in the film uses (`venv-torch`, `venv-bp`, `venv-madmom`; package lists are kept next to them as
  `*.freeze.txt`, see `/home/user/gtv/work/deleted-venvs.txt`). 4.1 GB free.
- Refresh args are made with `scratchpad/refresh_args.py` (`polish-PN-args.json`).
- Chapters done (passed polish, nothing left to refresh): ch05 and ch17. Next to finish: ch08, when P6 passes it.

## 2026-11-25 21:30 UTC

- P3 finished: ch04 and ch14 pass. Their narration refresh is running as P13 (wf_617c730a-2e7).
- Placed narration measured now: ch02 and ch07 already re-copied (0 clipped, refresh runs P11 and P12 under way).
  Still clipped: ch04 176, ch13 176, ch14 551, ch16 391. ch01, ch10 and ch11 show 0 samples at full scale but carry
  flat tops at a lower level (AFFECTED.md), so they refresh too.

## 2026-11-25 21:36 UTC

- P5 finished: ch13 and ch16 pass. Their narration refresh is P14 (wf_3abb3a87-bf1).
- The chapters' own tab strips (ch10 pinned, ch12 key-gp5, ch16 key-flats) are shot again with the fixed tool (their
  strip.json has the "shot" key).
- Running now:
  - P4 (ch10, ch11) and P6 (ch01, ch08) still in polish;
  - P8 (ch00, ch03), P9 (ch06, ch09) and P10 (ch12, ch15), lane A's polish;
  - refresh runs P11 (ch02), P12 (ch07), P13 (ch04, ch14) and P14 (ch13, ch16).
- Still to start: the refresh for ch01, ch10 and ch11 once P4 and P6 end.

## 2026-11-25 21:45 UTC (check-in)

- Done: ch05, ch08 and ch17 (passed polish, clean narration).
- P4: ch11 passed and is refreshing its narration in P15 (wf_6b734669-381). ch10's check marked its missing narration
  refresh BLOCKING, so its second round (polish2) does it.
- P6: ch08 passed with nothing open. ch01's check failed, and its second round is running.
- P8 to P10 (lane A) and refresh runs P11 to P14 are running.
- Disk: down to 2.5 GB with 14 renders queued. Trimmed the frame cache, and started a detached janitor
  (`/home/user/gtv/work/janitor.sh`, pid in `janitor.pid`, log `janitor.log`). Every 5 minutes it deletes frame-cache
  folders not touched for 45 minutes. 4.3 GB free.
- Film length now: 49:34 over the 18 chapters (current chapter.mp4 files).

## 2026-11-25 21:55 UTC

- P9 finished: ch06 and ch09 pass, and their placed narration has no clipped or flat-topped samples
  (`scratchpad/vocheck.py`). Done: ch05, ch06, ch08, ch09, ch17. Minor items left for the film check: ch06 has a
  3.3 s silence at 1:57; ch09's s5 finding text ends at y 921.

## 2026-11-25 22:00 UTC

- P10 finished: ch12 and ch15 pass, with clean narration. ch15's render now has the fixed strips. ch12's own strip
  is shot again. Done: ch05, ch06, ch08, ch09, ch12, ch15, ch17.

## 2026-11-25 22:15 UTC

- P12 finished: ch07 passes with clean narration. Done: ch05, 06, 07, 08, 09, 12, 15, 17.
- Part finish rewritten:
  - The join starts with a gate (every chapter current and passed) and frees disk (previews, frame cache).
  - It matches the chapters' narration loudness before joining (one gain per chapter).
  - Then three film checkers run in parallel: picture, sound, story. Each marks problems BLOCKING or NIT.

## 2026-11-25 22:25 UTC

- P6 finished: ch01 passes after its second round (narration rebuilt from the re-levelled sources; its stamp now
  counts Imagine's 11 heard-only notes, 1,900 heard). ch08 passes with nothing open. Done: ch01, 05, 06, 07, 08, 09,
  12, 15, 17.

## 2026-11-25 22:35 UTC

- P13 finished: ch04 and ch14 pass with clean narration. Done: ch01, 04, 05, 06, 07, 08, 09, 12, 14, 15, 17.

## 2026-11-25 22:45 UTC

- P14 finished: ch13 and ch16 pass with clean narration. Done: 13 of 18 (ch01, 04, 05, 06, 07, 08, 09, 12, 13, 14, 15,
  16, 17). Still running: ch00 and ch03 (P8), ch02 (P11), ch10 (P4 polish2), ch11 (P15).

## 2026-11-25 22:55 UTC

- P15 finished: ch11 passes, with its narration refreshed (no clipped samples; flat tops 1,016 to 4, one of them a
  documented turning point). ch03 passed its check in P8.
- Done: 15 of 18. Still running: ch00 (P8 polish2), ch02 (P11), ch10 (P4 polish2), each queued for a render.

## 2026-11-25 23:00 UTC

- P8 finished: ch03 passes. ch00 still has one BLOCKING regression after its second round: the tool tag is cut to
  'gp…' at 96.6-98.0 s, after the font went from 20 to 22 px. Third round running: P16 (wf_1d8520b7-6a1), that one
  problem only.
- Done: 15 of 18. Not yet: ch00 (P16), ch02 (P11), ch10 (P4, second round).

## 2026-11-25 23:10 UTC

- P4 finished: ch10 passes after its second round (narration rebuilt, 24-bit, no flat tops; 103.0 s). Its checker
  overwrote the placed vo-l01.wav by mistake, rebuilt it with build.py's steps and put it back. chapter.mp4 was
  rendered before that and is unchanged. Recorded in its qc/verify.md.
- Done: 16 of 18. Not yet: ch00 (P16), ch02 (P11).

## 2026-11-25 23:15 UTC

- P11 finished: ch02 passes with clean narration. Done: 17 of 18. Only ch00 is left (P16, its tool tag). Part
  finish starts when it passes.

## 2026-11-25 23:20 UTC

- P16 finished: ch00 passes; the tool tag reads in full at 22 px. **All 18 chapters pass.** My own gate on all 18:
  - no placed narration file has a clipped or flat-topped sample;
  - every chapter.mp4 matches its chapter.json length;
  - nothing in project/ is newer than the render;
  - every latest qc/verify.md says PASS or READY.
  Total 2,973.5 s (49:33).
- Part finish launched (wf_24e91e53-107, args {"part":"finish"}): the join with its gate, disk clearing and level
  matching, then the three film checkers.

## 2026-11-25 23:50 UTC (check-in)

- film-join finished: all 18 chapters passed its gate. The film is 2,975.0 s (49:35), 723 MB, -16.0 LUFS, -2.0 dBTP,
  LRA 5.0. Four chapters were gained -2.9 dB to match the narration level. Web files are made
  (`/home/user/gtv/render/web/`), and `/home/user/gtv/production/FILM.md` is written.
- Film checks so far:
  - picture: 1 BLOCKING. In ch10 at 29:45-29:55 a finding line sits in the caption band. 7 NITs.
  - sound: 1 BLOCKING. join.py's concat demuxer rounds each chapter's audio up to whole AAC frames, so the sound
    falls behind the picture at every join, +235 ms by the credits. 3 NITs.
  - story: still running.
- Part joinfix launched (wf_107b63f5-026): fix join.py (each chapter's audio trimmed or padded to its video length,
  per-chapter gains as an option) and prove 0 ±1 ms lag at every join.
- Next: chapter fixes (ch10 BLOCKING, plus the cheap NITs and whatever the story check finds), then part finish
  again, then publish.
