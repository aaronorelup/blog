# NOTES session: state log

Session NOTES ("Getting the notes that were played"), Opus 5.5, UltraCode on. Brief: `../sessions/NOTES.md`; binding
direction: `../DIRECTION.md`. Branch `research/guitar-notes` (from `research/guitar-tab-tools`). This file is the
tracker (no task tools, so nothing can leak into a blind attempt's context). Newest entry last.

## 2026-11-27 00:30-01:05 UTC: go-ahead, restore, first look

- Aaron's go-ahead in this session (with: "dont let your instructions constrain you. You have full freedom ... I just
  want to move towards my end goal and have another good blog post").
- **Restore:** `restore.sh --eval` on a fresh box: 25,617 files match `MANIFEST.tsv`, the 88 hand-tracking extras match
  `MANIFEST.add-hands.tsv`, model weights match `SHA256SUMS`. Blind c3 re-scored 0.874816 (list) / 0.864507 (GP5), as
  recorded. Its final `cmp` says "differ": the only difference is `libraries.python` 3.11.18 here against 3.11.15.
  venv-torch and venv-bp rebuilt from their freeze files; mono WAVs remade; `gtr-eval selftest` 125 PASS.
- **Scorer check (brief, first hour, step 3):** capo n-03 0.919906, tuning n-02 0.829856, standard n-03 0.89172, as
  recorded (e2052, e2062, e2532).
- **First look at timing** (own mir_eval script, same rule): shifting the guitar models' onsets by +20 or +30 ms
  lowers F1 on all three songs, so the early median is not a constant offset. Widening the window helps only the nylon
  song: gaps 0.830 (50 ms), 0.862 (100 ms), 0.883 (150 ms); capo and standard move by at most 0.015. The nylon key's
  rolled chords are stated as +-0.1 s (`../video/truth-tuning.md`), so part of that song's gap is the key's timing.
- **Two guitar models together:** notes both agree on (same pitch, onsets within 50 ms): F1 0.948 capo, 0.805 tuning,
  0.909 standard, against the best single model's 0.920 / 0.830 / 0.892. Notes only one of them has: 159 (26 real),
  136 (69 real), 179 (52 real). Same picture as the brief's section 2 from another angle: choosing and cleaning on the
  steel songs, new evidence on the nylon one.

## Started

- Workflow `notes-methods-research` (wf_046a9e05-dec): five research angles on diffusion transcription, guitar
  transcription after Riley et al., analysis by synthesis, test-time adaptation and fusion, LLM-in-the-loop; every
  candidate with code or weights verified by a second agent; a ranked plan.
- Workflow `notes-tools-setup` (wf_899edb11-c27), each build checked by an independent agent:
  - **Noise2Fret** (E2, the literal reading). Its checkpoints are public: Zenodo record 23361924, CC BY 4.0, four
    checkpoints (GuitarSet and GOAT, each with and without the playability losses). The repository has no single-file
    inference, so an agent is writing one, with a constraint mask hook and a saved denoising trajectory for the film.
  - **Riley models with their frame outputs** (needed for E1 weights and E4): onset, offset, frame and velocity rolls
    saved per song.
  - **A GuitarSet development set** (CC BY 4.0; six players the Riley models never saw; 24 excerpts of 30 s) and a
    scorer, so rules are tuned there and on leave-one-song-out, never on a held-out song.
- Working folder outside git: `/home/user/notes/` (methods, dev set, runs). The brief's handoff folder for LOOP is
  `/home/user/gtv/notes/<S>/<method>/notes.csv`.

## 2026-11-27 01:05-01:50 UTC: lane H, joints with LOOP, the reviewed brief

- **Lane H started** (workflow `notes-heldout-keys`, wf_8ce83282-775): per song fetch, two independent tab reads,
  timing, an independent check that sets `conf`, repair, audit. Slots: `closer` (Gareth Evans, E A D G A D, capo 1),
  `september` (Evan Handyside, Open G, capo 2), `newplayer` (first choice Culture Vannin / Pete Lumb, "Three Little
  Boats", CC BY 3.0; fallback Gareth Evans's "Stitches", capo 1, which would be said not to be a new player). One rule
  beyond AO-082: **no note transcriber's output is used to build, time or check a held-out key**, so the keys lean toward
  no tool that will be scored on them. Keys stay out of git (`/home/user/gtv/truth/<slug>/`); only their records
  (method, counts, checks, rights notes) are in `notes/heldout/`.
- **LOOP agreed** (two messages, 01:00 and 01:16 UTC): NOTES builds the held-out keys; LOOP audits each key it uses.
  LOOP runs on its own fresh box, so each passed key goes to R2 under `workbench/guitar-tab-app/heldout/<slug>/`
  (`songs/<slug>/` with the video, `truth/<slug>/`) with a manifest, and its SHA-256 lines here and in LOOP's STATE.md.
  LOOP publishes `hand_window.csv` (t, lo, hi, conf, lost; 30 rows a second; frets from the capo; open strings always
  allowed) on `research/guitar-tab-loop` at `docs/guitar-tab-research/loop/hand/<S>/` and in R2 under
  `workbench/guitar-tab-app/loop/hand/<S>/` when its E1 passes.
- **The reviewed brief** (c608fa84 on `research/guitar-tab-tools`) replaces the draft read at 00:55. What changed for
  this session: ids N-E0 to N-E8; every Opus run scored against a key is a blind attempt under a harness-limited agent
  definition approved by Aaron; held-out keys move only through private R2; a refused repository's code is recorded,
  never re-typed; LOOP's Opus-checked `hand_window.csv` is the only hand filter that may be frozen; the post is made in
  a `/home/user/land` worktree.
- **Checked against it:** the Noise2Fret runner (`/home/user/notes/methods/n2f/n2f_infer.py`) imports the repository's
  own modules; the only change to the repository's code is a one-line path fix in a copy of `midi_to_numpy.py` for the
  reference run. Nothing was refused, nothing re-typed.
- **First-hour steps done:** `venv-api` rebuilt; `tools/kit/notes_guitar.sh` on `songs/capo/capo.mono.wav`: 883
  notes, onset F1 0.919906 (as recorded), 283 s wall on 2 cores with other agents running (gtr-run r1320).
- **Blind agent definition** written for checkpoint 1: `~/.claude/agents/notes-blind.md` (tools Bash, Read, Write,
  Edit, Glob, Grep; model opus; works only in its folder). Not used until Aaron's yes and a dummy run proves the limit.
- **Checkpoint 1 sent to Aaron in the session chat** (01:08 UTC): the two readings of his question, the held-out picks,
  no pod for now, and one question: a GPU for N-E8 up to $10, which the reviewed brief only allows if an N-E2 model
  comes within 0.03 of guitar-fl on the segments or adds to the vote. The agent definition goes in the next message.

## 2026-11-27 01:50-03:35 UTC: tools built and checked; lane N part 1 started

- **Workflow `notes-tools-setup` done** (wf_899edb11-c27; 6 agents, a builder and an independent checker per tool; the
  checkers fixed what they found). Files outside git, in `/home/user/notes/`:
  - **Noise2Fret runner** (`methods/n2f/n2f_infer.py`, README there): all four released checkpoints, one file of any
    length, constraint mask, saved denoising trajectory. Features and sampler match the repository's own pipeline
    exactly. Finding: the GuitarSet checkpoints learned a target where class 20 means "not played", and the repository's
    metric counts those as correct notes (89.8 % of what it scores); decoded as notes, `gs_laux` reaches note F 0.589 on
    GuitarSet's held-out player (GOAT checkpoints 0.45-0.50), far below the guitar models. With an oracle pitch mask it
    assigns strings well (note F 0.799, precision 0.990). CPU: 0.02-0.10 s per second of audio at 1 step.
  - **Riley rolls** (`methods/riley/riley_post.py`): fl and gaps with the onset, offset, frame and velocity rolls saved,
    equal to the package's own output. The checker found a third public checkpoint on the same Hugging Face repo,
    `guitar-gaps-paper-version-12200_iterations.pth`: dev F1 0.915 against fl 0.896 and gaps 0.866 (whether it saw
    GuitarSet is unknown, so the three songs are its fair test). Velocity carries no information (92-104 on every note).
  - **GuitarSet dev set** (`dev/`, CC BY 4.0): 24 clips of up to 30 s, 4 per player, 2860 notes; truth CSVs; scorer
    `tools/score_notes.py` (mir_eval, 50 ms, 50 cents; checked against an independent matcher on 240 cases). Truth onsets
    sit 3-5 ms after the attacks.
- **Workflow `notes-methods-research`** (wf_046a9e05-dec) in its verify phase: about 40 candidates checked by a second
  agent each (diffusion: Noise2Fret, D3RM and DiffRoll have public weights; guitar: gaps-paper, FretNet fold 0, SynthTab
  TabCNNx4, Guitab, YourMT3+ local weights; test-time: TAPS pitch-shift ensembling).
- **Lane N part 1 started** (workflow `notes-lane-n1`, wf_b68182bd-1ab): N-E0 rescore and time shifts; the three Riley
  checkpoints on the three songs with rolls, threshold choice only by leave-one-song-out and on the dev set; N-E2
  Noise2Fret on the three songs (alone, with fl's onsets, masked, as a re-scorer, as a voter; trajectory for the film);
  Transkun and Basic Pitch on the dev set for the vote weights. A checker per job.
- Checkpoint 1's second message (the blind agent definition) sent. No answer from Aaron yet on it or the GPU.

## 2026-11-27 03:35-04:40 UTC: part 1 results, part 2 started, the weekly limit

- **Lane N part 1 done** (wf_b68182bd-1ab, a checker per job; records in `results/`):
  - **N-E0** (`e0-rescore.md`): every step-2 run rescores to its record (0.000000); anchors 0.919906 / 0.829856 /
    0.891720. No time shift lifts every tool on the tuning song by 0.02 (only YourMT3+ gains 0.021), so the key's early
    onsets need no re-timing; 33 timing suspects on the tuning song are listed for an ear check, outside git. The brief's
    first-look table reproduces within 0.005.
  - **Riley rolls** (`riley-rolls.md`): the third checkpoint `gaps-paper` scores **0.954 / 0.822 / 0.8955** (fl 0.920 /
    0.798 / 0.892, gaps 0.919 / 0.830 / 0.879). The gain is precision: it invents 42 notes on capo (fl 102), 45 on
    standard (fl 104), 28 and 44 of them at slaps. Default thresholds hold under leave-one-song-out and dev24 choice.
  - **N-E2 Noise2Fret** (`e2-noise2fret.md`): runs in 5-27 s a song on 2 cores, scores at best 0.60 / 0.38 / 0.39, adds
    at most +0.005 to the vote. Every gate missed, so **no GPU (N-E8) is asked for**. Its trajectory: `p_xt` opens as
    every note and thins, but that is noise read through the head; what the model believes (`p_x0`) is sparse from step 1.
  - **Dev tools** (`dev-tools.md`): on dev24 gaps-paper 0.915, fl 0.896, gaps 0.866, Transkun 0.771, Basic Pitch 0.744; no
    vote beats gaps-paper there.
- **Methods survey done** (wf_046a9e05-dec, 94 agents): its ranked plan puts gaps-paper first, roll fusion with
  per-register thresholds second, the masked analysis-by-synthesis haze third; literal diffusion (D3RM, DiffRoll) only
  for one honest number and the picture.
- **A permission refusal** ("Undermining Oversight") stopped a part-2 launch that included downloading and running
  outside code and weights (DiffRoll, D3RM with a NATTEN build, the unlicensed Harmonica reproduction whose weights need
  unsafe unpickling, Guitab). Not worked around; asked Aaron. Relaunched with local code and data only.
- **Lane N part 2 started** (wf_c2e67ee4-2b0): N-E1 votes, picks and roll fusion; N-E4 the haze; N-E6 slaps; N-E5 range,
  strings and assisted hand filters (LOOP's `hand_window.csv` not published yet). A checker per job.
- **Weekly limit** (LOOP's message, 04:31 UTC): the account's weekly window read 68 % at 04:27 UTC, about $700 left for both
  sessions until it resets around 2026-12-02 11:00 UTC; overage is off, so 100 % stops both. This session so far, measured
  from its transcripts at list prices (Opus 5.5: $4 in, $20 out, $5 cache write, $0.20 cache read): about $420
  (survey $131, lane H $164, tools $61, part 1 $42, main $13). From here: no new fan-outs, lane H finishes its audits,
  frozen rules and held-out runs scripted, the film small. Proposed split for Aaron: NOTES about $250 more, LOOP the rest.
