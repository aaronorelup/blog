# Session brief: getting the notes that were played

Written 2026-11-27 for the Opus 5.5 session NOTES (session_01UUo1x31YLxTbeZLXqSR5T3), which starts after Aaron's
go-ahead with UltraCode on. Read first: `../DIRECTION.md` (binding: it wins over this brief), this file, `LOOP.md` (the
other session, "Opus writes the tab, bar by bar, under constraints"), `../WORKBENCH.md` (the restore of the AO-082 box),
then in `../video/`: `results/step-02-notes.md`, `BLIND-RESULTS.md`, `PRODUCTION.md` (2, 6, 6.10), `EMBED.md` and
`STATE.md` (skim), and the AO-082 post (`src/content/posts/guitar-tab-tools.md` on `main`; its notes chapter is
`/home/user/gtv/production/chapters/ch04-notes/`). Paths under `/home/user/gtv/` and `/home/user/gtr/` are the AO-082
box's working files, restored as WORKBENCH.md says.

## 1. The question, and what would count as an answer

Aaron's goal (DIRECTION.md, item 1): better ways to get the notes actually played in a video of solo fingerstyle
guitar, capo and tuning given, so the app can run several methods, let the user pick the best one for each stretch and
correct what is off. With the notes right and the tuning known, almost everything else can be done well; the notes are
also the "which notes were played" constraint that LOOP's tab writer needs.

His question, "Can we do a diffusion method like AO-087?", as this brief reads it (the session states its own reading
plainly, and why). AO-087 holds two things that start wide and settle. Fable's model gives every possible next note a
probability, and its pad "opens as all the notes at once and thins out as the model makes up its mind". Gages's
orchestra "never sees the notes, only the sound of the target tune": it starts as noise and learns a volume per note by
gradient descent on the gap between its sound and the tune's. The first is the picture of a decision narrowing, the
second the mechanism that narrows it for a recording: analysis by synthesis. Read literally, he asks for diffusion
transcription, a model that starts from noise and denoises into the notes, conditioned on the audio (DiffRoll and its
successors; E2). Read by intent, he asks for any method that starts with every note the guitar could sound at each
moment and removes, round by round, what the recording, capo, tuning and hand do not support, so the app can show the
candidates still standing and the user can stop it and correct it (E4, "the haze"). Both are tested: the literal models
exist but are trained on piano or other guitars and were built for a graphics card; the intent reading runs here and
can use every constraint the app knows.

An answer is: (1) a method or combination that beats the best single note tool's onset F1 on the three recordings and
on two to four held-out ones, its rules frozen before any held-out score exists; (2) the per-bar pick's gain over the
best method (what the user's pick is worth) and whether Opus 5.5 captures it blind; (3) a plain yes or no on diffusion:
does a diffusion transcriber that exists today run on this kind of box and help; (4) the methods the app should run,
ranked, with times on 2 cores and the corrections each leaves; (5) a post with a film. A measured "no" is an answer too.

## 2. Where we start

AO-082 step 2 (`../video/results/step-02-notes.md`; outputs in `/home/user/gtv/experiments/<S>/n-*/`: `notes.csv`,
`labels.json` with each note hit, missed or invented, `invented_vs_taps.json`, `breakdown.json`). Onset F1, whole songs,
50 ms and 50 cents, offsets ignored; wall per song on 2 of 4 cores. MiMo (0.000 / 0.000 / 0.026, 30 s only) is out.
Separating first helped only Basic Pitch (HPSS, capo 0.689 to 0.783); it moved the guitar models by -0.016 to +0.003.

| tool | capo | tuning | standard | wall |
|---|---|---|---|---|
| n-03 guitar-fl.pth (Riley et al., piano model fine-tuned on guitar) | **0.920** | 0.796 | **0.892** | 102-156 s |
| n-02 guitar-gaps.pth (Riley et al.) | 0.919 | **0.830** | 0.879 | 105-144 s |
| n-04 Transkun 2.0.1 (a piano model) | 0.896 | 0.785 | 0.866 | 160-185 s |
| n-05 YourMT3+ (public CPU Space; guitar tracks alone) | 0.803 (0.827) | 0.731 (0.732) | 0.774 (0.780) | 252-341 s |
| n-01 Basic Pitch 0.4.0 (with the range from tuning and capo) | 0.689 (0.709) | 0.626 (0.627) | 0.663 (0.664) | 11-15 s |

- **Slaps and thumps** (capo 258 events, standard 211, tuning none). Invented notes within 50 ms of one: guitar-fl 59 of
  102 (capo) and 82 of 104 (standard), guitar-gaps 64 of 111 and 61 of 70, Basic Pitch 240 of 674 (capo).
- **Notes the guitar cannot sound.** Basic Pitch invented 71 below G2 (the lowest note with capo 3), 8 with the range
  hint (invented 674 to 610); the guitar models invented 9 and 1 there: the range alone barely helps them.
- **The nylon song in D G C F A C**, every tool's weak side: recall on strings 6-4 from 0.627 (Basic Pitch) to 0.802
  (gaps), chord-note recall 0.578-0.619, every tool's onsets 21-30 ms early (median), maybe the key's timing as much.
- **The keys' doubts.** Tab-only notes, not confirmed in the audio: capo 54, tuning 72, standard 96; 11 standard notes
  heard but not in the tab (`../video/results/truth-doubts.md`).
- **Opus 5.5 with the kit** (blind round 2, `/home/user/gtv/blind/c*/tools/score/summary.json`) merged both guitar
  models with Basic Pitch as a referee: onset F1 0.919 / 0.850 / 0.918, level with the best model on capo and above it
  on the others. The bare arm's own spectral code (KL-NMF on two songs): 0.822 / 0.564 / 0.697.

A first look while writing this brief: bars from the keys' downbeats (72, 49, 56); per-bar picks from the step-2
`labels.json` (per bar, the tool with the most found minus invented); votes scored with gtr-eval 0.12.1 `--no-ledger`
(notes of one MIDI pitch within 50 ms of a cluster's first onset, kept when k tools have one). Scratch: E0 redoes them.

| on the three recordings | capo | tuning | standard | edits left (missed + invented) |
|---|---|---|---|---|
| best single tool (fl, gaps, fl) | 0.920 | 0.830 | 0.892 | 136 / 212 / 153 |
| per-bar pick of fl or gaps | 0.943 | 0.848 | 0.906 | 95 / 186 / 127 |
| per-bar pick of the five tools n-01 to n-05 | 0.949 | 0.857 | 0.929 | 85 / 174 / 95 |
| 2-of-3 vote of gaps, fl, Transkun (3-of-5: 0.951 / 0.834 / 0.918) | 0.953 | 0.818 | 0.925 | 78 / 220 / 100 |
| truth notes found by at least one of the five (of fl or gaps) | 0.993 (0.978) | 0.895 (0.842) | 0.966 (0.938) | |
| fl with every invented note at a slap removed (an oracle) | 0.953 | no slaps | 0.947 | |

So most played notes are already in some tool's output (no tool found 6, 66 and 23, of which 3, 27 and 12 are
tab-only): the work is choosing and cleaning. A plain vote gains about 0.03 on the steel-string songs and loses 0.012 on
the nylon one, where new evidence is needed. Dropping every note at a slap loses 218 (capo) and 296 (standard) of
guitar-fl's found notes: most slaps land with a note.

## 3. Fixed rules

- **The capo is given from the start in every experiment** (DIRECTION.md, item 5), and so is the tuning (strings and
  cents from the key), except in E5's marked wrong-tuning row.
- **The target is the notes as played**: onset and pitch; offsets reported, not ranked (a let-ring rule in the keys).
  Where the player's tab and the recording differ, the recording wins, as in AO-082's repairs. String and fret are
  LOOP's subject. Left out: chord names, key, song analysis. Bars are only windows: the keys' downbeats on the three
  songs, Beat This! downbeats on held-out songs and in anything blind, 4 s windows where there is no steady pulse.
- **Scored** with gtr-eval 0.12.1 (`/home/user/gtr/bin/gtr-eval notes`) as in AO-082: onset F1 at 50 ms and 50 cents,
  one-to-one, with precision, recall, found, missed, invented; per bar; heard-only recall (truth `conf` not `tab`);
  invented at slaps, recall by string group (`/home/user/gtv/work/exp-notes/bin/taps_invented.py`, `breakdown.py`);
  whole songs and the film's 30 s segments (`crop_truth.py`). Each number in a `result.json` (`tools/bin/result.py`)
  with its eval ids, heavy runs through `gtr-run`, fits leave-one-song-out. **Heard:** FluidSynth renders (`FluidR3_GM`,
  program 25 steel, 24 nylon, 48 kHz stereo, on the recording's clock), the key first, then the method over the same
  bars (PRODUCTION.md 2.7); where the key is in doubt, the viewer judges by ear.
- **Blind AI attempts** (E3, any Opus pass that writes notes): keys hidden (`../video/workflows/guard-watch.py` over
  BLIND.md 7's folders, or `tools/blind-admin/vault.py` if the disk allows); no task tools in the whole session (AO-082
  round 1's harness attached the orchestrator's task list, which named the keys, to every attempt); a tool limit set by
  the harness, not the prompt (AO-082 offered the full tool list): an agent definition or command line that allows only
  Bash, Read, Write, Edit, Glob and Grep, checked in the first turn; a fresh session per attempt; `audit_blind.py` on
  each transcript, plus the access log. A void attempt is repeated once, and the film says so.
- **Privacy, public repo.** Nothing from AO-078's removed videos anywhere; never Aaron's own guitar videos as test
  material. Keys only through `python3 ~/.claude/bin/getkey.py NAME` inside a script, never printed or written. No
  private link, command-center host name or never-publish name in a commit (EMBED.md 2.4's scan before each commit).

## 4. The experiments

Only E8 needs a graphics card; E0 to E7 run on this box's CPU with no outside spend. RunPod pod creation was refused by
the permission system in AO-082. To ask, one message names the job, the GPU and its hourly price from a live catalog
read (an RTX 4090 secure pod was $0.89 an hour on 2026-11-25), the hours, a cap, and that the session deletes its own
pod after (`runpod-render` skill rules). His yes in his own words is the approval to try; if the permission system still
refuses, record it and give him a test card for his laptop's RTX 4070 (8 GB), as in `../FOR_AARON.md`. Diffusion
transcribers found on 2026-11-27, for E2:

| model | what it is | numbers | here |
|---|---|---|---|
| Noise2Fret (Simionato and Bigo, ISMIR 2026, arXiv 2608.30854, github.com/RiccardoVib/Noise2Fret, MIT) | diffusion over string and fret per event, conditioned on STFT features and raw audio, onsets as anchors from spectral flux; trained on GuitarSet and GOAT (electric) | about 15 M parameters, 341 M FLOPs a pass; GuitarSet pitch F 0.856, tab F 0.845 (TabCNN 0.820, 0.717) | real-time factor 0.67 on an RTX 3090; the paper says its models are released, the README named none |
| D3RM (Kim, Kwon, Nam, ICASSP 2025, github.com/hanshounsu/d3rm) | discrete diffusion refining a piano roll from an acoustic model | 2.0 M parameters, 100 steps; MAESTRO onset F1 97.57 against its baseline's 96.45 | piano only, trained 7 days on one RTX 4090 |
| DiffRoll (Cheuk et al., ICASSP 2023, github.com/sony/DiffRoll, MIT, weights Zenodo 7246522) | Gaussian noise to a piano roll, conditioned on the spectrogram | 86.8 M parameters | piano; its script reads only MAPS or MAESTRO |
| Noise-to-Notes (Yeung et al., arXiv 2509.21739) | diffusion drum transcription | | a slap detector for E6, if weights are out |

- **E0. The restore, and where the notes go wrong.** Rescore every step-2 run (n-01 to n-05, n-03-sep07, n-02-sep01),
  redo section 2's first look through the ledger, and score each tool with a `--time-shift` on the tuning song to
  split timing from content. Under 30 minutes. A rescore off its recorded value (capo n-03 0.920, e2052): stop.
- **E1. Several methods, one pick per bar.** Candidates: fl, gaps, Transkun, Basic Pitch with the range, YourMT3+
  guitar tracks, the separation-first runs, E2's models once they run. Pickers: the per-bar and note-level oracles (the
  best a careful user can pick), k-of-n votes, votes weighted by each tool's reliability per pitch range and string
  group, a per-bar pick by agreement or among the vote, fl, gaps and Transkun, and E3's Opus pick. Measure: onset F1,
  edits left per bar, the oracle's gain captured. Seconds per picker, a day of agent work. A vote within 0.01 of the
  per-bar oracle on held-out songs makes it the default, picks only where methods disagree; a large gap makes picking
  the app's main interaction.
- **E2. Diffusion transcribers, the literal reading** (CPU; training them would need a GPU). Each released model runs on
  the three 30 s segments, then whole songs; Noise2Fret also with the vote's onsets as its anchors. Measure: onset F1
  alone and as a voter in E1, and time per song (an afternoon of installs; stop at 30 minutes per 30 s on 2 cores). A
  model at 0.88 or more on capo and standard joins the candidates, one that adds 0.01 to the vote stays in the app; if
  none runs or helps, the post says so and E4 answers his question. AO-082's permission system refused cloned research
  code ("[Code from External]"), and the Riley models ran through a PyPI package and the agents' own loader: do the
  same (read the code as data, write a small loader, run it with `python -I`), and ask Aaron if a step is refused.
- **E3. Can Opus 5.5 pick by ear?** Opus hears no audio file as sound here; AO-082's attempts listened through
  constant-Q pictures (`tools/kit/spectrogram.py`), renders and numbers. Per window it gets the recording's picture
  over each candidate's render, each candidate's residual (E4) and where they disagree, picks one and may add or remove
  notes, with a reason each. Arms: pictures; pictures and residuals. Blind as in section 3. Measure: F1 of the picks,
  the share of the oracle's gain over the vote; a fresh session per song and arm, 30 to 60 minutes each (AO-082's
  whole-tab attempts took 32 to 43). Half the gain or more makes "Opus picks" an app method; less, and the user picks.
- **E4. Every possible note, then fewer: the intent reading.** Start, at every candidate onset (the tools' and
  spectral-flux onsets), with every pitch the tuning and capo allow (about 40 to 45), weighted by the tools' votes and
  frame posteriors (save the models' frame outputs; AO-082 kept only notes). Each round: synthesize the weighted notes
  (a decaying harmonic template per pitch, from FluidSynth, then fitted to confident isolated notes of the recording),
  compare on a log constant-Q spectrogram, update the weights (KL-NMF multiplicative updates, or gradient descent as
  Gages did), drop weights under a threshold, add a note where the residual shows harmonic energy at an onset, until
  nothing changes. Conditions: from every note, and from E1's vote (refinement only); FluidSynth or learned templates;
  with and without E5. Calibrate first: the kit's `selfcheck.sh` read 0.601 to 0.879 for a perfect answer (BLIND.md 5),
  so the key's notes must leave less residual than every tool's on 90 % of bars. Measure: F1 per round (a curve), notes
  added and removed and how many were right, the residual as a picker for E1 and E3. Minutes of CPU a song, two to three
  days of agent work. Expect the full haze to lose to the vote (the bare arm: 0.822 / 0.564 / 0.697): refinement is the
  realistic use, and +0.01 on held-out songs with none lower makes it the last note stage. Keep every round's weights:
  the film draws and plays them as AO-087's pad did, each candidate as loud as its weight.
- **E5. What the guitar cannot play.** Filters: the range (nothing below the lowest open string with the capo or above
  the 1st string's fret 20); the strings (notes sounding at once must fit on distinct strings of the tuning, each
  holding its string until the next attack there; the weakest of a set that does not fit goes); LOOP's hand reach
  window (`hand_window.csv`: t, lo, hi, conf, lost; frets from the capo, open strings always allowed; DIRECTION.md, item
  3): a fretted note no reachable fret can play is dropped or weighted down; until it exists, the key's own frets plus
  one either side (marked assisted). Wrong-tuning row: the tuning song read with standard tuning and with D G C F A D
  (both blind arms' answer). Measure: invented notes removed against found notes lost. Seconds, a day of agent work.
  Removing 20 % of the vote's invented notes for under 1 % of its found notes makes a filter a default.
- **E6. Slaps and thumps.** Detectors: HPSS percussive onsets (v-03, capo and standard: recall 1.000 and 0.986,
  precision 0.284 and 0.412), Demucs drums onsets (v-04: precision 0.963 and 0.932, recall 0.713 and 0.322),
  Noise-to-Notes if out. For a note on a hit, a pitched-or-not test: energy at its partials 60-200 ms after the hit
  against before, its decay, and whether Transkun has it (14 of its 92 invented capo notes sit at slaps). Outputs: the
  notes without slap notes, and the events scored against the keys' taps (`gtr-eval onsets`). Measure: F1, the share of
  the oracle's gain (fl 0.920 to 0.953 capo, 0.892 to 0.947 standard), found notes lost; HPSS 147-212 s, Demucs 103-117
  s a song. Half the oracle's gain, no loss on tuning: a default stage.
- **E7. Songs the methods never saw.** Every choice from E1 to E6 goes into `frozen-rules.json`, committed before any
  held-out score exists; then every method and the pipeline run on each held-out song (about 20 CPU minutes a song). A
  stage that helps the three songs and lowers the held-out mean is dropped. The post's main numbers come from here.
- **E8 (graphics card, only with Aaron's yes).** Fine-tune Noise2Fret or a D3RM-style refiner on GuitarSet (CC BY
  4.0) with capo and tuning shifts, or adapt the best model to each song on its own vote; scored as E7.

## 5. Test material

The three: `/home/user/gtv/songs/<S>/<S>.wav` and `/home/user/gtv/truth/<S>/<S>.truth.json` (credits in the AO-082 post,
rights notes in `../video/SONGS.md`). Held out: two to four solo fingerstyle videos with the player's own tab, prepared
as AO-082 did (`SONGS.md`, `truth-<S>.md`, `truth-<S>-check.md`). Scouted leads (`../video/candidates-*.md`):
- Gareth Evans's tab videos on the Internet Archive mirror: Stitches (capo 1), Closer (E A D G A D, capo 1), Can't Feel
  My Face (drop D), Human (audio about 70 cents flat); the tab scrolls with a cursor, so timing comes free.
- Evan Handyside on Vimeo (through `player.vimeo.com`): Wake Me Up When September Ends (open G, capo 2), Supergirl Suite
  (D G C F A C), The Brutalist Theme (standard); handwritten tabs with no rhythm.
- New players: Culture Vannin's Manx lessons with Pete Lumb (Wikimedia Commons, CC BY 3.0; Commons answered 429 in
  AO-082); a GAPS test-split recording (research-only; guitar-gaps trained on its train split); YouTube-only leads with
  free tabs (Martin Tallström's GP5 files, Antoine Dufour, Van Larkins, Jérémy Cauliez), if Aaron fetches the videos.

Pick at least two in other tunings, open G (Wake Me Up When September Ends) and E A D G A D (Closer) among them, for
LOOP's tuning finder, and a new player if one can be found; prefer obscure pieces, and check that no tested model
trained on them (GuitarSet, GAPS train, the Leduc set, GOAT). Per song: a credit line and a rights note (source, licence
or "none stated", the tab's terms); title and end cards cut; two independent reads of the tab; notes timed to the
recording; an independent check by ear and spectrogram that sets each note's `conf` (`tab`, `tab+audio`, `audio`),
repair and check again (AO-082's keys took one to three repair rounds, about 6.5 hours for three side by side);
`gtr-eval check-truth`; an audit by an agent that did not build the key. This session builds the keys for both sessions
(LOOP.md agrees, and audits each key it uses): confirm it in the first hour with one message and a line in STATE.md.

## 6. The film and the post

It shows the question in Aaron's words; every note list heard, key first, then the method, same bars; the per-bar pick
as stacked rows with the picked bar lit; the haze thinning, drawn and played; slaps before and after; the held-out songs
as the result; where the key is in doubt, the recording, for the viewer to judge. About 30 minutes to start, longer only
if the findings earn it: opening (2 min); the recordings and keys (3); where AO-082 left the notes (3); every possible
note, then fewer (5); several methods, one pick per bar, Opus picking blind (5); what the guitar cannot play (3); slaps
and thumps (3); songs the methods never saw (4); what the app should run and the user fixes (2); credits. Reuse
`/home/user/gtv/production/kit/` (HyperFrames 0.9.91) by PRODUCTION.md, 6.10's fixed faults above all, and the same
narrator unless Aaron says otherwise (check the ElevenLabs balance; AO-082's film used 21,873 credits). The post: `npm
run new-post "Title"` on a branch from `origin/main`, the film at its top by EMBED.md with the new slug, `draft: true`.
Aaron sees the film through the studio library and the text as a private page; `media:push` and landing wait for his OK
in his own words.

## 7. How to run it

- **Lanes.** One workflow runs about 2 agents at a time here, so run two or three side by side, as
  `../video/workflows/gtv-lanes.js` did: lane N (E0 to E6), lane H (held-out keys, from the first hour), later lane F
  (script, voice, chapters). Heavy jobs through `gtr-run`: two 2-core slots, at most two timed jobs at once.
- **Renders** one at a time under `/home/user/gtv/production/render.lock`, started detached and waited for in the
  foreground: agents that ended their turn while their render waited for the lock had it killed (ch02, ch10, ch13).
- **Restarts and disk.** The AO-082 box restarted about every 80 minutes: each agent keeps a PROGRESS.md and resumes
  from it. Keep 3 GB free (`df -h /`): delete superseded renders, idle frame caches (`janitor.sh`), finished venvs.
- **Checkpoints for Aaron.** (1) The first-hour message: a pod or not, the held-out picks and rights notes, videos to
  fetch, this reading of his question. (2) Before E7: the frozen rules and first numbers on one page. (3) The script,
  before voicing. (4) The finished film and the draft post.
- **Budget.** AO-082's film run: 250 agents, 15.7 M output tokens, $1,390 to $1,620 at API list prices. Plan about half
  (120 to 150 agents, $700 to $900) on Aaron's subscription, whose weekly limit is the real cap. Helpers on Opus 5.5 or
  Sonnet, never Fable. Outside: narration credits, and a pod only after a yes.
- **Handoff to LOOP.** Each method's and the pipeline's notes as `/home/user/gtv/notes/<S>/<method>/notes.csv` (onset,
  offset, pitch, then `support` and `conf`), the slap events as `events.csv`, the held-out keys in `truth/` form, and a
  STATE.md line naming the frozen pipeline; LOOP takes them as a new rung, never silently.
- **Records.** Branch `research/guitar-notes` from `origin/research/guitar-tab-tools` (or the session's designated
  branch), folder `docs/guitar-tab-research/notes/`: STATE.md (the orchestrator's log), RESULTS.md, `results/`,
  `experiments.json`, `frozen-rules.json`, the held-out records. Heavy files go to R2 under a new prefix beside
  WORKBENCH.md's, with its wrapper and a manifest, at each checkpoint. Plain commits with the two attribution lines,
  `git pull --rebase` before each push, never force.

## 8. The first hour after the go-ahead

1. Read DIRECTION.md, this brief, LOOP.md and WORKBENCH.md. Use no task tools: STATE.md is the tracker.
2. Restore: `restore.sh --eval` as WORKBENCH.md says (it checks every file and re-scores blind c3 at 0.865); rebuild
   gtr-eval's venv, `venv-torch` and `venv-bp`, and remake the mono WAVs (its last sections); keep 3 GB free.
3. Check the scorer: `gtr-eval selftest`, then `experiments/capo/n-03/notes.csv` against `truth/capo/capo.truth.json`
   (0.920, e2052), tuning n-02 (0.830, e2062), standard n-03 (0.892, e2532). Any other value: stop.
4. Smoke-test `tools/kit/notes_guitar.sh` on `songs/capo/capo.mono.wav` (about 2.5 minutes): its notes should score
   0.920 again. R1c, the kit's own test clip, is in the studio library, not the workbench.
5. Start lane N on E0 and lane H on the held-out scouting; send Aaron the first-hour message; message LOOP about the
   held-out keys and the handoff files. Write STATE.md's first entry.

## 9. Risks and limits

- **Three songs, two players**: anything tuned on them overfits (fit leave-one-song-out, freeze, test held out); each
  AO-082 number is one run, and Opus attempts vary (the tuning song's bare arm moved 0.188 between rounds). The keys
  have doubts too (tab-only notes, the tuning song's early onsets): the film lets the viewer hear those places.
- **Licences for an app.** guitar-gaps.pth trained on GAPS (non-commercial research), guitar-fl.pth on a dataset given
  by request for research, GOAT's licence unclear: the best tools here may not be usable in a product.
- **Permission system, CPU, ears.** Cloned research code and pod creation were refused in AO-082 (own loaders, early
  questions); diffusion models may be too slow here or too far from their training data (measure on 30 s first); Opus
  hears through pictures and numbers, and FluidSynth is not the player's guitar (calibrate on the key).
- **Two sessions.** LOOP runs at the same time, likely on its own box; the joints are the held-out keys, the notes
  handoff and the hand reach window. YouTube refuses downloads from the box, Vimeo answers only through its player.
