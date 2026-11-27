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
