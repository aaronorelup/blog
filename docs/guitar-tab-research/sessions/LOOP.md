# LOOP: Opus writes the tab, bar by bar, under constraints

The brief for the Opus 5.5 session that does this work after Aaron's go-ahead (UltraCode on), written 2026-11-27 from the
AO-082 records. Read `../DIRECTION.md` first: it is binding, and it wins wherever this brief differs. Then this file and
`../WORKBENCH.md` (how a fresh box gets AO-082's working files back). NOTES (`NOTES.md` here) finds better notes; this
session turns notes into the tab and owns the hand-reach tool and the tuning finder. Numbers read capo / nylon / standard
(nylon is slot `tuning` in paths). `G` = `/home/user/gtv`; `V` = the film's records, `docs/guitar-tab-research/video/`.

## 1. The question, and what would count as an answer

Aaron assumes Opus 5.5 can write guitar tab on its own and treats the job as a constraints problem: the tuning, the capo,
where the fretting hand is and which notes were played make the result the tab of what was played, the way it was played.
Opus should work like a person, one bar at a time, each bar's lessons improving the bars before it and making the next ones
more accurate and faster. The capo is always given. How close does this get to the tab as played, and how much does each
constraint buy ("the better the constraints, the better the result")? Answered when these exist, scored and heard:
1. A constraint ladder per recording: the score at each rung (capo only, then the tuning, the hand window, the true notes),
   for a plain solver and for the Opus loop, beside AO-082's chains and blind arms.
2. Bar by bar against whole song on the same inputs, with minutes, tokens and the spread of repeated runs.
3. The tuning finder's answer string by string with its evidence (the nylon 1st string settled or not), and the hand-reach
   tool's coverage of the played frets and how far it narrows each note's possible places.
4. All of it, frozen, on 2 to 4 held-out recordings; and a plain finding for the app: what to ask the person for, where Opus
   beats a solver given the same constraints, what still fails.

## 2. Where we start: what AO-082 measured

From `V/RESULTS.md`, `V/BLIND.md`, `V/BLIND-RESULTS.md`, `V/results/step-0*.md` and the files under `G/experiments/<S>/`.
- **The blind test** (round 2: Opus 5.5 at max effort, whole song, capo not given). Main score (same string and fret as the
  key, share of all key notes, in the GP5): kit arm 0.930 / 0.548 / 0.865, bare arm 0.816 / 0.347 / 0.705, the gap mostly
  from finding notes (onset F1, GP5: 0.904 / 0.688 / 0.908 against 0.777 / 0.500 / 0.694; NOTES quotes the notes list, 0.919
  / 0.850 / 0.918). An attempt took 32.5 to 42.8 of its 90 minutes and $13 to $19 at list prices.
- **Places.** The kit arm put 0.966 / 0.798 / 0.941 of the notes it found on the key's string and fret; the best chooser
  given the key's own notes, tuning and capo (chain-5: tuttut or LilyPond) gets 0.794 / 0.968 / 0.892. All six round-2
  attempts read the hand's place from the video with their own rough trackers, sheets or zooms, as a window of frets.
- **Notes.** Onset F1: guitar-fl 0.920 / 0.796 / 0.892, guitar-gaps 0.919 / 0.830 / 0.879. Chains: measured notes, true
  tuning and capo 0.753 / 0.715 / 0.822 (chain-2: per song the best note tool by the key, guitar-fl on capo and standard,
  guitar-gaps on nylon's htdemucs_6s stem, step-09; notes in `G/experiments/<S>/chain-2/notes.csv`); the key's notes 0.791 /
  0.914 / 0.890 (chain-5); the lowest-note rule's tuning and capo 0.000 / 0.081 / 0.822 (chain-1).
- **Hands, applied wrong** (`V/results/step-07-video.md`, `step-08-sound-and-video.md`, the film's ch09). MediaPipe lost the
  fretting hand in 0.0325 / 0.1242 / 0.0089 of frames (landmarks for every frame: `G/experiments/<S>/w-01/`). The fret grid
  found no fret line on nylon and numbered the capo song's frets one too high. Fingertip cells were the played place for
  0.088 / none / 0.029 of fretted notes, and string pins from them lowered all 12 runs that had the tuning and capo (by
  0.049 to 0.302). The film asked the video for the exact place; DIRECTION asks it for the reach.
- **A perfect window** (computed for this brief from the keys: each bar's frets in the key, one either side, plus open
  strings, frets 0 to 17) cuts the possible places per note from 3.46 / 3.62 / 3.24 to 1.59 / 1.32 / 1.35 and raises the
  notes with one possible place from 0.10 / 0.11 / 0.06 to 0.53 / 0.68 / 0.66. Only 0.78 / 1.00 / 0.79 of the 72 / 49 / 57
  bars (standard: 56 and a one-note pickup) stay within 4 frets: the window must follow the hand inside a bar.
- **The nylon tuning.** No tool named D G C F A C (lowest-note rule: Drop D; Opus on frames: standard). Both round-2 arms
  said D G C F A D, and all 87 of the kit arm's wrong-place notes are notes the key plays on the 1st string. Computed from
  the key for this brief: all 481 onset groups fit D G C F A D within frets 0 to 5, so chord checks at onsets cannot tell
  the two apart (standard tuning fails on 55 groups, Drop D on 37). The fingers can: the key plays the open 1st string (C4)
  114 times, where D G C F A D needs a finger at string 2 fret 3, and D4 18 times at string 1 fret 2, where it needs none.

## 3. Fixed rules

- **The capo is given from the start** in every run: the key's (3 / 0 / 0), or the held-out player's own tab's.
- **The target is the tab as played**: notes, strings, frets and times. Quantizing comes later, so the **main number is the
  tab list on the recording's clock**: same string and fret as the key, onset within 50 ms, same pitch, frets from each
  side's capo, as a share of all key notes (gtr-eval `tab` on `answer.json`), and over heard key notes alone (conf not
  `tab`). Beside it: the GP5 read back (AO-082's main number), of matched, matched, right / wrong place / missed / invented,
  onset F1 (50 ms, 50 cents), open strings right of 6, cents, minutes and tokens. Taps and slaps are not tab notes here.
- **Left out:** chords, key and song analysis: not computed, not scored, one line in the film. The answer is AO-082's
  `answer.json` (`G/tools/kit/validate_answer.py`) with fixed placeholders for `key` and `chords`, never scored.
- **Scored** with gtr-eval 0.12.1 against `G/truth/<S>/<S>.truth.json` by `G/tools/blind-admin/score_blind.sh` and the chain
  commands (pattern: `G/blind/c3/tools/score/score.sh`), run by an agent that made no attempt. Every number names its file
  and eval id. The keys' doubts apply (`V/results/truth-doubts.md`).
- **Heard** through FluidSynth, FluidR3_GM, program 24 for nylon and 25 for steel, on the recording's clock; in the film the
  answer key first, then the attempt, the same bars. Opus cannot hear: it compares a note model's reading of its render with
  the recording, and looks at spectrograms. A wrong string at the right pitch sounds the same, so places are judged on
  frames. The kit's `selfcheck.sh` reads 0.60 to 0.89 even for a perfect answer (`V/BLIND.md` section 5): it ranks drafts.
- **Every Opus run whose output is scored against a key is a blind attempt**: each tab writer, L-E1's check of windows and
  fret numbers (scored against the keys' frets and neck outlines), L-E2's steps on frames and ringing strings (against the
  keys' tunings); the agent that scores it made none. AO-082's lessons (`V/BLIND.md` 7, `V/results/audit-blind.md`): the
  harness put the task list, naming the keys, into every round-1 attempt, so no task tools in this session, the list checked
  empty first; the tool limit was never applied (55 tools and 540 deferred), so a custom agent type listing only Bash, Read,
  Write, Edit, Glob and Grep, passed as `agentType` to `agent()`, a configuration change named at checkpoint 1 and used
  after Aaron's yes, proved on a dummy run. No web, MCP, skills or helper agents; its own folder and given inputs only,
  copied, never hard-linked (R2.6; the true-notes rung gets onset, offset and pitch, no string or fret); neutral file names;
  videos checked by eye for titles, tabs, end cards. The file-access watch (`V/workflows/guard-watch.py`, roots extended)
  covers, in `G/`, `truth` (held-out keys too), `songs`, `experiments`, `candidates`, `work`, `production`, `blind`
  (AO-082's 12 answers), `notes`, `loop` and `heldout` (other runs: an L1 tab from the key's notes nearly answers an L2 bar)
  and the records (`/home/user/blog`, `/home/user/land`), minus the attempt's own folder; `audit_blind.py` reads every
  transcript before scoring. A void run is repeated once, and the film says so; a void bar call voids its run from that bar
  on, restarted from the `state.json` saved before it. Max effort; each attempt says if it recognised the piece.
- **Privacy:** nothing from AO-078; never Aaron's own videos as test material; keys via
  `python3 ~/.claude/bin/getkey.py NAME` in a script, never printed; nothing from the work files WORKBENCH.md marks private.
  Before each commit: `V/EMBED.md` 2.4's never-publish scan, `grep -lF` for the command-center host
  (`servers.command-center.url` in `~/agent-kit/connections/servers.json`) and
  `grep -lE 'X-Amz-Signatur[e]|r2\.cloudflarestorage\.com'`.

## 4. The experiments

All on the box's CPU (4 vCPU, 15 GB, no graphics card). Ids carry the session's letter in messages, STATE.md and commits:
L-E1 to L-E8 here, N-E0 to N-E8 in NOTES. Costs are API list prices; Opus costs are estimates scaled from the round-2
attempts, so run L2 on one song first, measure it, and correct the plan before the other runs.
- **E1. The hand-reach tool** (owned here): for every frame, the frets the playing hands can reach. *Method.* The stored
  MediaPipe landmarks (a re-run: 187 to 279 s a song on 2 cores). A neck model per shot from anchors Opus sets on a keyframe
  (two fret wires it names from the inlays, or the capo and one fret wire: the capo song's nut is out of frame,
  `V/RESULTS.md` t-07), carried through the shot by feature matching and a homography; frets by 12-TET from those two lines,
  so no fret line need be detected (that failed on nylon). The window: the fingertips' frets, one fret either side, counted
  from the capo, open strings always allowed; the picking hand's tips count on the neck (the capo song's tap bars), and so
  does a thumb over it; a lost or unsure hand means no constraint. Output: `hand_window.csv` (t, lo, hi, conf, lost at 30
  fps; readers ignore extra columns), published in `docs/guitar-tab-research/loop/hand/` as `<S>/hand_window.csv`, beside
  `hand_filter.py`, the one hand filter (N-E5 and L-E3 call it unchanged), and an overlay command that draws the window and
  fret numbers on frames at given times. Opus checks the output itself, blind (section 3): at keyframes and flagged onsets
  it looks at the overlay and accepts or corrects the window and the numbering (the capo is the window's fret 0), each
  correction logged. The keys' neck outlines (`G/truth/<S>/<S>.video.json`) serve scoring and one row marked assisted, never
  the tool. *Conditions.* The tool alone and after Opus's check; margins of 0, 1 and 2 frets; 10 and 30 fps. *Measures*, on
  the fretted key notes at their onsets (557 / 206 / 546): coverage (the key's fret inside the window), exclusions (the
  key's place ruled out), mean width, possible places per note, lost share; through `hand_filter.py` on chain-2's notes,
  invented notes removed against real ones removed. *Time and cost.* A day of agent work, under 10 CPU minutes a song, $2 to
  $5 of Opus checks a song. *Changes the plan.* Coverage of 0.97 or more at a mean width of 5 frets or less makes the window
  a hard rule, 0.90 to 0.97 a soft cost; under 0.90 Opus sets that song's windows per passage, as the capo kit arm did.
- **E2. The tuning finder**, a measured step of its own, capo given. *Method*, a person's order, each step logging its
  evidence (Opus's steps blind, section 3): (a) open strings seen and heard: a heard note that no fretted place inside the
  window can make is an open string, and a string seen ringing with no finger on it gives its pitch; (b) one clear chord
  shape: Opus reads the fingers on a zoomed frame, the chord is heard, the open strings follow; (c) heard notes against
  notes the hand could play over the first 30 to 60 s: every tuning with each string from 5 semitones below to 2 above
  standard is scored by its conflicts (a note with no place in the window, two notes on one string); (d) assume the best:
  the loop changes a string only when what is seen and heard there keep disagreeing (a conflict count per string, its
  threshold fixed before the held-out runs). *Conditions.* Sound only (the lowest-note rule); (a), (b), (c) each alone; all
  together. *Measures.* Open strings right of 6, cents, minutes, frames looked at, and each later change in the loop, right
  or wrong. The nylon song is the hard case: its string 1 must come from the fingers at the C4 and D4 onsets (section 2).
  *Time and cost.* CPU seconds to minutes, $3 to $8 of Opus a recording. *Changes the plan.* 6 of 6 everywhere makes "tuning
  found" the app's default; any wrong string means the app asks the person for the tuning first.
- **E3. The constraint ladder with a plain solver** (no Opus). *Method.* A Viterbi over onset groups (one note per string at
  a time, hand movement, fret height, a cost or a rule for leaving the window), started from the capo kit arm's
  `G/blind/c1/tools/scripts/assign_dp.py` with E1's windows in place of its hand-set passages. *Conditions*, every
  combination: notes {the key's onsets and pitches, chain-2's, chain-2's after `hand_filter.py`} x tuning {given, E2's, a
  wrong one: D G C F A D on nylon (both blind arms'), on steel the lowest-note rule re-run knowing the capo, dropped where
  it is the true one} x hand {off, E1's tool, a perfect window from the key, a ceiling}: 27 cells a recording (18 without
  it), seconds each. *Measures.* The main number and its parts; chains 5, 2 and 1 as fixed points. *Changes the plan.* If
  the window adds under 0.01 on both steel songs with the tuning given, E4's hand-off rung runs on nylon only.
- **E4. The loop, bar by bar** (Opus), per recording. *Before bar 1.* The sound (`prepare.sh`); candidate notes (chain-2's,
  the other models' notes as alternatives with support counts, and NOTES' output as a new rung when it lands, never
  silently); bars from Beat This! (downbeat F 0.986 / 0.117 / 0.964; where unsure, 2 to 4 s windows cut at gaps between
  onsets; bars are units of work, never scored); E1's windows; the capo; the tuning, given or E2's. *Each bar* is one agent
  call with a fixed pack: the bar's times and sound; its candidate notes, each with the places that tuning, capo and window
  allow, and the conflicts; the neck at each onset with the window drawn (the agent runs and checks the overlay); a
  spectrogram with the candidates; earlier bars that sound alike, with their tabs; the carried state. It keeps, drops or
  adds notes (an added note needs an onset in the sound and a reachable place; dropping a note two models heard needs a
  reason), places each note inside the window (the solver proposes, Opus overrides with a reason), renders the bar, runs the
  self-check, and writes the bar's tab, a confidence and its lessons. *Carried forward* in `state.json`: the tuning with
  each string's evidence and conflict count; a shape book (a sounding pitch set and its place, with the bar and frame it was
  seen in); the hand's place per bar; each note model's habits on this recording (what it invents or misses, with counts);
  the player's habits (let-ring open strings, thumb over, taps); which bars repeat which. *Revisits* when a shape is seen
  for a pitch set placed otherwise earlier, when a string of the tuning changes (every bar is checked again), when a
  repeat's earlier copy was unsure, when a model habit found now applies to earlier bars, and every 8 bars over the unsure
  ones. Each change is logged and scored afterwards, wrong to right or right to wrong. A repeat of a finished bar starts
  from its tab and works only the differences: "faster" should show here. *Conditions*, whole songs: L1 the key's notes,
  tuning given, hand tool; L2 chain-2's notes, tuning given, hand tool (the main one: the person knows the tuning); L3 as L2
  with the tuning found; L4 as L2 with the hand off. *Measures.* The main number and its parts; the score per bar by bar
  index; minutes and tokens per bar by thirds of the song; revisions; tuning changes; window corrections. *Time and cost.* 2
  to 4 minutes a bar (two short bars a call), so 2 to 4.5 hours a song, serial by design; $20 to $60 a run; 12 runs, 4 at a
  time, about 9 hours. *Changes the plan.* If L2 beats the solver in the same cell by less than the repeat spread (E5), Opus
  adds little to placing notes: the loop then works on which notes and the tuning, and the solver places them.
- **E5. Bar by bar against whole song** (Opus). W2 gives one session L2's inputs for the whole song (notes, windows, overlay
  command, solver, renders) and 90 minutes, as AO-082's blind arms had, with the capo given; it is compared with L2. W2 on
  the three recordings, then L2 and W2 once more on the nylon and capo songs for the spread: 7 runs, $100 to $220 (a W2
  takes 35 to 45 minutes and $13 to $19). Measures as E4, plus wall time and tokens a song. If W2 matches L2 within the
  spread, the app runs the cheaper one; if L2 wins mostly in later bars, the carried state is why, and it stays.
- **E6. What the loop learns** (Opus, the capo song: 72 bars, many repeats). L2 with the carried state emptied before every
  bar, and L2 with revisits off, against L2 and E4's logs: the slope of the per-bar score, the revisions' direction, minutes
  per bar in the first and last thirds. 2 runs, $40 to $120. If emptying the state costs less than L2's spread in E5
  (AO-082's: 0.011 to 0.037), or than repeated E6 runs show, "bar by bar" is chunking, not learning, and the film says so.
- **E7. Held-out recordings** (Opus, frozen). The tool, the finder, the solver, the loop, every prompt and threshold, and
  one note rule for L2, L3 and W2 (one tool, or NOTES' frozen pipeline by SHA-256: chain-2's per-song pick needs the key)
  are frozen at one commit, named in STATE.md before the first held-out run. On each: L3 (the app's full path: capo given,
  all else found), W2 and the E3 ladder, L2 where the budget allows; 2 to 4 recordings, $70 to $550. A held-out main number
  more than 0.10 below the three songs' means the method was fitted to them, and the post says so.
- **A graphics card.** E1 to E7 need none. Optional E8, only if E1 fails on a held-out camera: denser neck tracking
  (CoTracker3 took 380 to 719 s a song on this CPU, and a 1 fps call was killed at 12.2 GB) or a 3D hand model (WiLoR, never
  run). AO-082's `create-pod` was refused by the permission system, so ask Aaron in the session's chat at a checkpoint, in
  one message: the GPU, today's price from the Runpod catalog (an RTX 4090 secure pod was $0.89 an hour on 2026-11-25), the
  hours, a spend cap, what runs there, and that the CPU plan stands without it. Only after his yes in his own words, make
  your own pod by the `runpod-render` skill's rules and delete it after; if refused again, do not retry.

## 5. Test material

- **The three recordings** (`V/SONGS.md`; keys in `G/truth/<S>/`, made as `V/truth-<S>.md` and `-check.md` say): *Steal My
  Girl*, Gareth Evans, standard with capo 3, 815 notes in 72 bars; *A soft collision of breath*, Evan Handyside, nylon in D
  G C F A C, 628 notes in 49 bars; *Imagine*, Gareth Evans, standard, 679 notes in 56 bars and a one-note pickup.
- **Held out: 2 to 4 solo fingerstyle videos with the player's own tab**, at least two in other tunings (open G and E A D G
  A D among them, new to the finder), and a third player if one can be found. The set is shared with NOTES, which builds the
  keys (`NOTES.md` section 5): settle that in the first hour (one message, a STATE.md line) so each key is built once; if
  NOTES is not running, build them here the same way. One path per held-out key, `G/truth/<S>/` (video and audio
  `G/songs/<S>/`, work `G/heldout/<S>/`, all watched); between boxes only through R2 (`workbench/guitar-tab-app/heldout/`),
  SHA-256 lines in both STATE.md files, never the public repo: the players' tabs are sold or paywalled (`V/SONGS.md`);
  AO-082 kept its keys out of git too. Leads: `NOTES.md` section 5 (YouTube refuses the box).
- **Prepared as AO-082 did** (`V/workflows/gtv-lab.js`): tab, titles and logos cropped away; two readers of the tab working
  apart; a key builder who times the tab to the recording and marks notes heard but not tabbed and tabbed but not heard; an
  independent checker; repairs until it passes (AO-082: one to three rounds, 6.5 hours). A credit line and a rights note
  each (`V/songs.json`), flagged to Aaron where notable (covers from mirrors, tabs now sold or paywalled). This session
  audits every key it uses; no attempt runs before its key passes.

## 6. The film and the post

- **What it shows:** every tab heard: the recording, the answer key, then the attempt, the same bars through the same
  program, at least 4 s of each alone. Where the key settles a thing (places, counts) the film says so; where it is in doubt
  (the nylon beat phase, the standard song's cents, notes from the tab alone, a held-out key's doubts) the viewer judges.
- **Likely chapters, about 30 minutes** (longer if earned): one bar written and heard; what changed since AO-082; the hand's
  reach, checked by Opus; the tuning found like a person; one bar at a time, with its state; the ladder, each rung heard;
  bar by bar or whole song; what the loop learned; new recordings; what the app should ask, what still fails; credits.
- **Production:** `G/production/kit/` by `V/PRODUCTION.md` sections 2, 5, 6 and 6.10's fixed faults (voice level, strip
  seams, voice-edge fades, the song under the voice, true-peak limiting); a KIT-NEEDS list first (a fret window on the neck,
  a per-bar curve); the ElevenLabs balance checked before voicing; listening windows rendered from the tab's notes, 48 kHz.
- **The post:** a new post (`npm run new-post "Title"` in the worktree `/home/user/land` from `origin/main`, as `V/EMBED.md`
  3.1 did, never an id by hand; `/home/user/blog` stays on the research branch: a checkout of main there removes the records
  and the lane scripts 129 `cmd.sh` files call), the film first in an `<ao-shots>` block by `V/EMBED.md`, a `credits` block
  (WRITING.md), a link to AO-082, and chain-2 named as the per-song best note tool on the three recordings. It stays
  `draft: true` until Aaron's OK in his own words: show him the film through the studio library (`studio push`, run id
  reported) and the text as a private page. `media:push` and landing (CLAUDE.md, EMBED.md 3.5) come after.

## 7. How to run it

- **Lanes.** A workflow runs about 2 agents at a time on this box, so lanes run as separate workflows side by side, as in
  AO-082 (`V/workflows/gtv-lanes.js` is the pattern; final messages of at most 12 lines). Lane T builds E1 to E3 and the
  loop driver, A runs E4, B runs E5 and E6, H works the held-out set with NOTES, F makes the film after checkpoint 3. The
  driver calls one agent per bar in order; songs run side by side. Helpers run on Opus or Sonnet, never Fable.
- **The box.** Heavy jobs via `gtr-run`'s two 2-core slots, one per agent. One render at a time under
  `G/production/render.lock`, started detached (`setsid nohup`, a pid file) and awaited in the foreground: AO-082 lost
  renders whose agent's turn ended first. At least 3 GB free, a frame-cache janitor (`G/work/janitor.sh`). The box restarted
  every ~80 minutes: agents keep `G/work/<agent>/PROGRESS.md`, the loop saves `state.json` and the tab each bar.
- **Checkpoints for Aaron**, each a short message in the session and a line under the command-center project guitar-tab-app:
  (1) after the first hour: the restore, the scorer check, the plan, the budget, the agent type, the GPU question; (2) after
  E1 to E3 and the first L2 run: coverage, the finder's strings, the ladder, a loop run's measured cost, the held-out picks
  with rights notes; (3) after E4 to E6: the results with renders (key first), and go or stop for the held-out runs and the
  film; (4) the held-out keys passed; (5) the script, before voicing; (6) the film and the draft.
- **Budget.** AO-082's film run took 250 agents and $1,390 to $1,620 at list prices; its first research sitting, about
  $2,000 of tokens, used about 90 % of a week's limit with one other session (`costs/COSTS.md`). Plan 150 to 200 agents and
  $1,200 to $2,400 (25 to 33 Opus runs: $450 to $1,600), plus narration credits; with NOTES' $700 to $900, $1,900 to $3,300
  on one weekly limit. Both report the spend at each checkpoint (`agent-metrics`) and ask Aaron at half a week.
- **Records.** Branch `research/guitar-tab-loop` from `origin/research/guitar-tab-tools` (or the designated one), folder
  `docs/guitar-tab-research/loop/`: `STATE.md` (sole tracker), `RESULTS.md` and `results.json`, `HAND.md`, `TUNING.md`,
  `LOOP-DESIGN.md`, `BLIND.md`, `HELDOUT.md`, the workflows. Heavy files in `G/loop/`, archived to R2 at each checkpoint
  (WORKBENCH.md). Plain commits, two attribution lines, `git pull --rebase` first, never force; a PR at the end.
- **With NOTES.** Never wait for it. Once L-E1 passes, publish `hand_window.csv` per recording, `hand_filter.py` and the
  finder's tunings, and tell NOTES. Read NOTES' notes on arrival (`G/notes/<S>/<method>/notes.csv`:
  `onset, offset, pitch, support, conf`, via R2), its SHA-256 recorded per run. One shared box would halve the CPU.

## 8. The first hour after the go-ahead

1. After reading DIRECTION.md, this brief, WORKBENCH.md and `V/BLIND.md` section 7, run `restore.sh --eval` (WORKBENCH.md);
   rebuild `venv-torch`, `venv-bp`, `venv-video` and `production/venv-mp` from their freeze files. Check `df -h /` (3 GB
   free), keys (815 / 628 / 679 notes), chain-2 notes, w-01 landmarks, `assign_dp.py`, weights against `SHA256SUMS`.
2. Check the scorer: `gtr-eval selftest`, WORKBENCH.md's check (the Imagine kit arm: 0.875 in the list, 0.865 in the GP5;
   compare the scores, not the bytes) and chain-5 on capo (0.795 and 0.791). If anything differs, stop and find out why.
3. Make the branch and `STATE.md`. Send NOTES one message on the held-out keys and the window's format.
4. Run E1 on the stored landmarks (coverage on the three keys before any tuning of the tool), the first E3 rows, one bar's
   pack for the capo song (and look at it), and the custom agent type with its dummy run. Then send checkpoint 1.

## 9. Risks and limits

- Three recordings, two players, fixed cameras; no strumming, electric guitar or band; one run per number unless repeated.
- The keys' doubts: notes from the tab alone (54 / 72 / 96), the nylon beat phase, the standard song's +6 cents (about 2
  either way); each held-out key has its own. Every design choice is tried on the three songs: only held-out numbers test.
  The perfect-window and true-notes rungs use the key: they are ceilings, never results.
- No graphics card, restarts, a 3 GB disk floor, 15 GB of memory, one render at a time; the nylon song's bars are windows of
  time (downbeat F 0.117). A refusal by the permission system is recorded, never worked around.
- The weekly limit can stop the work before the film: checkpoints 3 and 5 are where to cut scope.
