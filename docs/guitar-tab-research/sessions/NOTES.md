# Session brief: getting the notes that were played

Written 2026-11-27 for the Opus 5.5 session NOTES (session_01UUo1x31YLxTbeZLXqSR5T3), which starts after Aaron's
go-ahead with UltraCode on. Read first: `../DIRECTION.md` (binding), this file, `LOOP.md` (the other session's brief),
`../WORKBENCH.md`, then in `../video/`: `results/step-02-notes.md`, `BLIND-RESULTS.md`, `PRODUCTION.md` (2, 6, 6.10),
`EMBED.md`, `STATE.md`, and the AO-082 post (`src/content/posts/guitar-tab-tools.md` on `main`; its notes chapter:
`production/chapters/ch04-notes/`). `/home/user/gtv/` and `/home/user/gtr/` hold the AO-082 box's working files.

## 1. The question, and what would count as an answer

Aaron's goal (DIRECTION.md, item 1): better ways to get the notes actually played in a video of solo fingerstyle guitar,
capo and tuning given, so the app can run several methods, let the user pick the best one for each stretch and correct
what is off; the notes are also the "which notes were played" constraint LOOP's tab writer needs.

His question, "Can we do a diffusion method like AO-087?", as this brief reads it (the session states its own, and why).
In AO-087 two things start wide and settle: Fable's pad "opens as all the notes at once and thins out as the model makes
up its mind", and Gages's orchestra "never sees the notes, only the sound of the target tune", learning a volume per
note by gradient descent on the gap between its sound and the tune's: analysis by synthesis. Read literally, he asks for
diffusion transcription, a model that denoises from noise into the notes, conditioned on the audio (DiffRoll and
successors; E2). Read by intent, for any method that starts with every note the guitar could sound at each moment and
removes, round by round, what the recording, capo, tuning and hand do not support, so the app can show the candidates
standing and the user can stop and correct it (E4, "the haze"). Both are tested: the literal models were trained on
piano or other guitars, for a GPU; the intent reading runs here with every constraint the app knows.

An answer is: (1) a method or combination that beats the best single tool's onset F1 on the three recordings and on two
to four held-out ones, its rules frozen first; (2) the per-bar pick's gain over the best method (what the user's pick is
worth) and whether Opus 5.5 captures it blind; (3) a plain yes or no on diffusion: does a diffusion transcriber that
exists today run on this kind of box and help; (4) the methods the app should run, ranked, with times on 2 cores and the
corrections each leaves; (5) a post with a film. A measured "no" is an answer too.

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
  hint (674 to 610 invented); the guitar models 9 and 1: the range alone barely helps them.
- **The nylon song in D G C F A C**, every tool's weak side: recall on strings 6-4 0.627 (Basic Pitch) to 0.802 (gaps),
  chord-note recall 0.578-0.619, onsets 21-30 ms early (median), maybe the key's timing as much.
- **The keys' doubts.** Tab-only notes (unheard): capo 54, tuning 72, standard 96; 11 standard notes heard, not tabbed.
- **Opus 5.5 with the kit** (blind round 2, `/home/user/gtv/blind/c*/tools/score/summary.json`) merged both guitar
  models with Basic Pitch as a referee: onset F1 0.919 / 0.850 / 0.918 on `answer.json`'s notes list (GP5 read back:
  0.904 / 0.688 / 0.908, as LOOP quotes), level with the best model on capo and above it on the others. The bare arm's
  own spectral code (KL-NMF on two songs): 0.822 / 0.564 / 0.697 (notes list).

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

So most played notes are in some tool's output (no tool found 6, 66 and 23; 3, 27 and 12 of them tab-only): the work is
choosing and cleaning. A vote gains about 0.03 on the steel songs and loses 0.012 on the nylon one, which needs new
evidence. Dropping all notes at slaps loses 218 and 296 of guitar-fl's found notes: most slaps land with a note.

## 3. Fixed rules

- **Capo given in every run** (DIRECTION.md, item 5), **and the tuning** (the key's) except E5's wrong-tuning row.
- **The target is the notes as played**: onset and pitch; offsets reported, not ranked (a let-ring rule in the keys).
  Where the player's tab and the recording differ, the recording wins, as in AO-082's repairs. String and fret are
  LOOP's subject. Left out: chord names, key, song analysis. Bars are only windows: the keys' downbeats on the three
  songs, Beat This! downbeats on held-out songs and in anything blind, 4 s windows where there is no steady pulse.
- **Scored** with gtr-eval 0.12.1 (`/home/user/gtr/bin/gtr-eval notes`) as in AO-082: onset F1 at 50 ms and 50 cents
  with precision, recall, found, missed, invented; per bar; heard-only recall (truth `conf` not `tab`); invented at
  slaps, recall by string group (`work/exp-notes/bin/taps_invented.py`, `breakdown.py`); whole songs and 30 s segments
  (`crop_truth.py`). Each number in a `result.json` (`tools/bin/result.py`) with eval ids, heavy runs through `gtr-run`,
  fits leave-one-song-out. **Heard:** FluidSynth (`FluidR3_GM`, program 25 steel, 24 nylon, 48 kHz stereo, the
  recording's clock), key first, then the method, same bars; where the key is in doubt, the ear judges.
- **Blind AI attempts**: every Opus run whose output is scored against a key (E3, any Opus pass that writes or picks
  notes), scored by an agent that made none. No task tools in the session (AO-082's round 1 harness put the key-naming
  task list in every attempt). Tools limited by the harness: a custom agent definition allowing only Bash, Read, Write,
  Edit, Glob and Grep, named at checkpoint 1, used after Aaron's yes, proved on a dummy run. A fresh session per
  attempt, inputs copied, never hard-linked (audit R2.6). The file-access watch (`../video/workflows/guard-watch.py`,
  roots extended) covers, in `/home/user/gtv/`, `truth` (held-out keys too), `songs`, `experiments`, `candidates`,
  `work`, `production`, `blind` (AO-082's 12 answers), `notes`, `loop`, `heldout` (other runs' near-answers) and the
  records (`/home/user/blog`, `/home/user/land`), minus the attempt's own folder. A vault (`vault.py`) only for keys
  already in R2 with their SHA-256 (BLIND.md 7: a restart mid-lock could lose them), else the watch alone.
  `audit_blind.py` reads each transcript and the access log; a void attempt is repeated once, and the film says so.
- **Privacy, public repo.** Nothing from AO-078's removed videos; never Aaron's own guitar videos as test material. Keys
  only through `python3 ~/.claude/bin/getkey.py NAME` in a script, never printed or written. Before each commit:
  EMBED.md 2.4's never-publish scan, a `grep -lF` for the command-center host (the script reads it from
  `servers.command-center.url` in `~/agent-kit/connections/servers.json`) and
  `grep -lE 'X-Amz-Signatur[e]|r2\.cloudflarestorage\.com'`; nothing from the work files WORKBENCH.md marks private.

## 4. The experiments

Only E8 needs a graphics card; E0 to E7 run on this box's CPU. Ids carry the session's letter in messages, STATE.md and
commits: N-E0 to N-E8 here, L-E1 to L-E8 in LOOP. Diffusion transcribers found on 2026-11-27:

| model | what it is | numbers | here |
|---|---|---|---|
| Noise2Fret (Simionato and Bigo, ISMIR 2026, arXiv 2608.30854, github.com/RiccardoVib/Noise2Fret, code MIT) | diffusion over string and fret per event, conditioned on STFT features and raw audio, onsets as anchors from spectral flux; trained on GuitarSet and GOAT (electric) | about 15 M parameters, 341 M FLOPs a pass; GuitarSet pitch F 0.856, tab F 0.845 (TabCNN 0.820, 0.717) | real-time factor 0.67 on an RTX 3090; weights CC BY 4.0 on Zenodo 23361924, named in `Noise2Fret_Aux_Losses/README.md`: `CheckpointsGuitarSet.zip`, `CheckpointsGOAT.zip`, about 111 MB each; inference only through its training scripts with `train_model=False` over prepared dataset folders (`../lanes/guitar-tab/survey.md`, "Noise2Fret") |
| D3RM (Kim, Kwon, Nam, ICASSP 2025, github.com/hanshounsu/d3rm) | discrete diffusion refining a piano roll from an acoustic model | 2.0 M parameters, 100 steps; MAESTRO onset F1 97.57 against its baseline's 96.45 | piano only, trained 7 days on one RTX 4090 |
| DiffRoll (Cheuk et al., ICASSP 2023, github.com/sony/DiffRoll, MIT, weights Zenodo 7246522) | Gaussian noise to a piano roll, conditioned on the spectrogram | 86.8 M parameters | piano; its script reads only MAPS or MAESTRO |
| Noise-to-Notes (Yeung et al., arXiv 2509.21739) | diffusion drum transcription | | a slap detector for E6, if weights are out |

- **E0. The restore, and where the notes go wrong.** Rescore every step-2 run (n-01 to n-05, n-03-sep07, n-02-sep01),
  redo section 2's first look through the ledger, and score each tool with a `--time-shift` on the tuning song to split
  timing from content. Under 30 minutes. A rescore off its recorded value (capo n-03 0.920, e2052): stop. A shift
  lifting every tool there by 0.02 or more sends that key's early onsets to an ear check and, if the recording agrees, a
  recorded re-timing (LOOP told) before E1 fits; else those numbers name the shift's gain.
- **E1. Several methods, one pick per bar.** Candidates: fl, gaps, Transkun, Basic Pitch with the range, YourMT3+ guitar
  tracks, the separation-first runs, E2's models once they run. Pickers: the per-bar and note-level oracles (the best a
  careful user can pick), k-of-n votes, votes weighted by each tool's reliability per pitch range, later by places in
  LOOP's window (a new song's notes have no string: string group is for scoring only), a per-bar pick by agreement or
  among the vote, fl, gaps and Transkun, and E3's Opus pick. Measure: onset F1, edits left per bar, the oracle's gain
  captured. Seconds per picker, a day of agent work. A vote within 0.01 of the per-bar oracle on held-out songs makes it
  the default, picks only where methods disagree; a large gap makes picking the app's main interaction.
- **E2. Diffusion transcribers, the literal reading** (CPU). Each released model on the three 30 s segments, then whole
  songs; Noise2Fret's Zenodo checkpoints through its training script (`train_model=False`, a dataset folder made from
  the audio), also with the vote's onsets as anchors. Measure: onset F1 alone and as a voter in E1, and time (an
  afternoon of installs; stop at 30 minutes per 30 s on 2 cores; a candidate must run a whole song within 30 minutes).
  0.88 or more on capo and standard joins the candidates, +0.01 to the vote stays in the app; if none runs or helps, the
  post says so and E4 answers his question. AO-082's permission system refused running cloned research code ("[Code from
  External]"): a refusal is recorded, never worked around, and a refused repo's code is never copied or re-typed into a
  loader. Ask Aaron, with a test card for his laptop as `../FOR_AARON.md` gave for Noise2Fret.
- **E3. Can Opus 5.5 pick by ear?** Opus hears no audio file as sound here; AO-082's attempts listened through
  constant-Q pictures (`tools/kit/spectrogram.py`), renders and numbers. Per window it gets the recording's picture over
  each candidate's render, each candidate's residual (E4) and where they disagree, picks one and may add or remove
  notes, with a reason each. Arms: pictures; pictures and residuals. Blind as in section 3; a fresh session per song and
  arm (30 to 60 minutes), and one song and arm twice for the spread (an arm's note F1 moved 0.008 to 0.175 between
  AO-082's rounds). Measure: F1 of the picks, the share of the oracle's gain over the vote. Half the gain or more, and
  more than that spread, makes "Opus picks" an app method; else the user picks.
- **E4. Every possible note, then fewer: the intent reading.** Start, at every candidate onset (the tools' and
  spectral-flux onsets), with every pitch the tuning and capo allow (about 40 to 45), weighted by the tools' votes and
  saved frame posteriors (AO-082 kept only notes). Each round: synthesize the weighted notes (a decaying harmonic
  template per pitch, from FluidSynth, then fitted to confident isolated notes of the recording), compare on a log
  constant-Q spectrogram, update the weights (KL-NMF, or gradient descent as Gages did), drop weights under a threshold,
  add a note where the residual shows harmonic energy at an onset; repeat until nothing changes. Conditions: from every
  note, and from E1's vote (refinement only); FluidSynth or learned templates; with and without E5. Calibrate first
  (`selfcheck.sh` read 0.601 to 0.890 for a perfect answer): the key's notes must leave less residual than every tool's
  on 90 % of bars. Measure: F1 per round, notes added and removed and how many were right, the residual as a picker for
  E1 and E3. Minutes of CPU a song, two to three days of agent work. Expect the full haze to lose to the vote (the bare
  arm: 0.822 / 0.564 / 0.697); +0.01 on held-out songs, none lower, makes refinement the last note stage. The film draws
  and plays every round as AO-087's pad did, each candidate as loud as its weight.
- **E5. What the guitar cannot play.** Filters: the range (nothing below the lowest open string with the capo or above
  the 1st string's fret 20); the strings (notes sounding at once must fit on distinct strings of the tuning, each
  holding its string until the next attack there; the weakest of a set that does not fit goes); the hand's reach
  (DIRECTION.md, item 3: a fretted note no reachable fret can play is dropped or weighted down), only by LOOP's filter,
  unchanged (`hand_filter.py`, `<S>/hand_window.csv` in `docs/guitar-tab-research/loop/hand/` on
  `research/guitar-tab-loop`). Assisted row, a ceiling never frozen: LOOP's perfect window (each bar's key frets plus or
  minus 1, plus open strings). Only the published, Opus-checked `hand_window.csv` is frozen, by SHA-256; a held-out song
  without one runs unfiltered, and the post says so. Wrong-tuning row: the tuning song read in standard and in D G C F A
  D (both blind arms' answer). Measure: invented notes removed against found notes lost. Seconds, a day of agent work.
  Removing 20 % of the vote's invented notes for under 1 % of its found notes makes a filter a default.
- **E6. Slaps and thumps.** Detectors: HPSS percussive onsets (v-03, capo and standard: recall 1.000 and 0.986,
  precision 0.284 and 0.412), Demucs drums onsets (v-04: precision 0.963 and 0.932, recall 0.713 and 0.322),
  Noise-to-Notes if out. For a note on a hit, a pitched-or-not test: energy at its partials 60-200 ms after the hit
  against before, its decay, and whether Transkun has it (14 of its 92 invented capo notes sit at slaps). Outputs: the
  notes without slap notes, and the events scored against the keys' taps (`gtr-eval onsets`). Measure: F1, the share of
  the oracle's gain (fl 0.920 to 0.953 capo, 0.892 to 0.947 standard), found notes lost; v-03 107-144 s, Demucs 103-117
  s a song. Half the oracle's gain, no loss on tuning: a default stage.
- **E7. Songs the methods never saw.** Every choice from E1 to E6 goes into `frozen-rules.json` (files by SHA-256),
  committed before any held-out score exists; then every method and the pipeline run on each held-out song (about 20 CPU
  minutes, plus each E2 model's measured whole-song time, 30 at most). A stage that helps the three songs and lowers the
  held-out mean is dropped. The post's main numbers come from here.
- **E8 (graphics card, only with Aaron's yes).** Asked for, as LOOP.md's "A graphics card" says, only if an E2 model
  runs here within 0.03 of guitar-fl's onset F1 on the 30 s segments, or adds to the vote; if pods are refused again, a
  test card for his RTX 4070 laptop (`../FOR_AARON.md`). Fine-tune Noise2Fret's GuitarSet checkpoint or a D3RM-style
  refiner on GuitarSet (CC BY 4.0) with capo and tuning shifts, or adapt the best model to each song on its own vote;
  frozen and scored as E7, it joins the app if it beats guitar-fl's held-out mean or adds 0.01 to the vote there.

## 5. Test material

The three: `/home/user/gtv/songs/<S>/<S>.wav` and `/home/user/gtv/truth/<S>/<S>.truth.json` (credits in the AO-082 post,
rights notes in `../video/SONGS.md`). Held out: two to four solo fingerstyle videos with the player's own tab, prepared
as AO-082 did (`SONGS.md`, `truth-<S>.md`, `truth-<S>-check.md`). Scouted leads (`../video/candidates-*.md`):
- Gareth Evans's tab videos on the Internet Archive mirror (the tab's cursor gives the timing): Stitches (capo 1),
  Closer (E A D G A D, capo 1), Can't Feel My Face (drop D), Human (audio about 70 cents flat).
- Evan Handyside on Vimeo (`player.vimeo.com`), handwritten tabs with no rhythm: Wake Me Up When September Ends (open G,
  capo 2), Supergirl Suite (D G C F A C), The Brutalist Theme (standard).
- New players: Culture Vannin's Manx lessons with Pete Lumb (Wikimedia Commons, CC BY 3.0; Commons answered 429 in
  AO-082); a GAPS test-split recording (research-only; guitar-gaps trained on its train split); YouTube-only leads with
  free tabs (Martin Tallström's GP5 files, Antoine Dufour, Van Larkins, Jérémy Cauliez), if Aaron fetches the videos.

Pick at least two in other tunings (open G and E A D G A D among them, for LOOP's tuning finder) and a new player if one
can be found; prefer obscure pieces no tested model trained on (GuitarSet, GAPS train, the Leduc set, GOAT). Per song: a
credit line and a rights note (source, licence or "none stated", the tab's terms); title and end cards cut; two
independent reads of the tab; notes timed to the recording; an independent check by ear and spectrogram setting each
note's `conf` (`tab`, `tab+audio`, `audio`), repaired until it passes (AO-082: one to three rounds, 6.5 hours for three
side by side); `gtr-eval check-truth`; an audit by an agent that did not build the key. This session builds the keys for
both sessions (LOOP.md agrees and audits each key it uses; confirm it in the first hour with one message and a STATE.md
line). One place per held-out song: video and audio in `songs/<S>/`, key in `truth/<S>/`, work in `heldout/<S>/` (all
watched); between boxes only through R2 (`workbench/guitar-tab-app/heldout/`), SHA-256 lines in both STATE.md files,
never the public repo: the players' tabs are sold or paywalled (`SONGS.md`); AO-082 kept its keys out of git too.

## 6. The film and the post

It shows the question in Aaron's words; every note list heard (key first, then the method, same bars); the per-bar pick
as stacked rows; the haze thinning, drawn and played; slaps before and after; the held-out songs as the result; doubtful
places left to the viewer's ear. About 30 minutes, longer if earned: opening (2 min), recordings and keys (3), where
AO-082 left the notes (3), the haze (5), one pick per bar and Opus picking blind (5), what the guitar cannot play (3),
slaps (3), new songs (4), what the app runs and the user fixes (2), credits. Reuse `/home/user/gtv/production/kit/` by
PRODUCTION.md (6.10's fixed faults above all) and the same narrator unless Aaron says otherwise, checking the ElevenLabs
balance first. The post: `npm run new-post "Title"` in the worktree `/home/user/land` on a branch from `origin/main`
(EMBED.md 3.1); `/home/user/blog` stays on the research branch (a checkout of main there removes the records and the
lane scripts 129 `cmd.sh` files call). The film at its top by EMBED.md, `draft: true`; Aaron sees it through the studio
library and the text as a private page; `media:push` and landing wait for his OK in his own words.

## 7. How to run it

- **Lanes.** One workflow runs about 2 agents here; run two or three side by side, as `../video/workflows/gtv-lanes.js`
  did: lane N (E0 to E6), lane H (held-out keys, from the first hour), later lane F (script, voice, chapters). Heavy
  jobs through `gtr-run` (two 2-core slots); renders one at a time under `/home/user/gtv/production/render.lock`,
  started detached and waited for in the foreground (a render still waiting when its agent's turn ends is killed).
- **Restarts and disk.** The box restarted about every 80 minutes: each agent keeps a PROGRESS.md and resumes from it.
  Keep 3 GB free (`df -h /`; `janitor.sh`, delete superseded renders and finished venvs).
- **Checkpoints for Aaron.** (1) First hour: the agent definition (used after his yes), a pod or not, the held-out picks
  and rights notes, videos to fetch, this reading of his question. (2) Before E7: the frozen rules and first numbers on
  one page. (3) The script, before voicing. (4) The film and the draft post.
- **Budget.** Half of AO-082's film run ($1,390 to $1,620, list prices): 120 to 150 agents, $700 to $900; with LOOP's
  $1,200 to $2,400, $1,900 to $3,300 on one weekly limit. Both report spend at each checkpoint (`agent-metrics`) and ask
  Aaron at half a week. Helpers Opus 5.5 or Sonnet, never Fable; outside: narration, and a pod after a yes.
- **Handoff to LOOP.** Notes as `/home/user/gtv/notes/<S>/<method>/notes.csv`, columns
  `onset, offset, pitch, support, conf` (the method is the folder), slap events as `events.csv`, held-out keys as
  section 5 says, all through R2 with SHA-256 lines in both STATE.md files; STATE.md names the frozen pipeline by
  SHA-256. LOOP takes them as a new rung, never silently. LOOP's hand files: E5.
- **Records.** Branch `research/guitar-notes` from `origin/research/guitar-tab-tools` (or the session's designated
  branch), folder `docs/guitar-tab-research/notes/`: STATE.md (the log), RESULTS.md, `results/`, `experiments.json`,
  `frozen-rules.json`, held-out records; heavy files to R2 beside WORKBENCH.md's prefix. Plain commits with the two
  attribution lines, `git pull --rebase` first, never force.

## 8. The first hour after the go-ahead

1. Read DIRECTION.md, this brief, LOOP.md and WORKBENCH.md; no task tools (STATE.md is the tracker). Restore as
   WORKBENCH.md says, or check this box's restore (`restore.sh --eval` gives 0.874816 and 0.864507; its last `cmp` says
   "differ" only over the Python version); rebuild gtr-eval's venv, `venv-torch`, `venv-bp` and `venv-api` (YourMT3+'s
   gradio-client, `work/exp-notes/bin/run_ymt3.sh`); remake the mono WAVs; keep 3 GB free.
2. Check the scorer: `gtr-eval selftest`, then `experiments/capo/n-03/notes.csv` against `truth/capo/capo.truth.json`
   (0.920, e2052), tuning n-02 (0.830, e2062), standard n-03 (0.892, e2532). Any other value: stop.
3. Smoke-test `tools/kit/notes_guitar.sh` on `songs/capo/capo.mono.wav` (about 2.5 minutes): it should score 0.920.
4. Start lanes N (E0) and H (held-out scouting); message Aaron (checkpoint 1) and LOOP (keys, handoff); start STATE.md.

## 9. Risks and limits

- **Overfitting.** Three songs, two players, one run per AO-082 number: fit leave-one-song-out, freeze, test held out;
  the keys' doubts (tab-only notes, the tuning song's early onsets) are left to the viewer's ear.
- **Licences for an app.** guitar-gaps.pth trained on GAPS (non-commercial research), guitar-fl.pth on a dataset given
  by request for research, GOAT's licence unclear: the best tools here may not be usable in a product.
- **Two boxes.** LOOP likely runs on its own box: held-out keys, notes and hand window move through R2 and the branches.
