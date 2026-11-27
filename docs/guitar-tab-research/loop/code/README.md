# The LOOP session's code, frozen for the held-out runs (E7)

A copy of `/home/user/gtv/loop/tools/` as it was when the held-out runs started (2026-11-27), so the held-out numbers
can be traced to the exact code, prompts and thresholds that made them. `SHA256SUMS` lists every file. Nothing here was
changed after the freeze; the commit that added this folder is named in `../STATE.md`.

| folder | what |
|---|---|
| `handreach/` | the hand-reach tool (L-E1): neck model, tracker, window, overlay, the one hand filter, its manual `TOOLS-HAND.md` |
| `tuning/` | the tuning finder's evidence tools (L-E2) and its manual `TOOLS-TUNING.md` |
| `solver/` | the plain string-and-fret solver (L-E3) and the ladder scripts |
| `loop/` | the bar-by-bar loop (L-E4): prep, pack, driver, validation, audit, scoring, the whole-song session `w2.py`, and the writers' prompts `WRITER.md`, `REVISER.md`, `TUNER.md`, `W2.md` |
| top | `blind_run.sh` (one blind Opus call, six tools only), `sandbox_run.sh` and `net_filter.py` (the sandbox: no answers, no network but the model API), `precommit_scan.sh` |

Paths inside are those of the cloud box (`/home/user/gtv`); the answer keys and recordings are not in this repository.
