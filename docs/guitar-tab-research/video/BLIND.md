# The last chapter's test: Opus 5.5 writes each tab from the video alone, with and without a toolkit

Agent `kit-picker`, 2026-11-25. Picks the toolkit from what was measured ([RESULTS.md](RESULTS.md), whose numbers come
from `/home/user/gtv/experiments/<S>/<exp>/result.json`), builds it, builds the bare arm, makes the blind inputs and
fixes the protocol. Nothing here was run on the three recordings except the blind-input checks; every tool was tested
on the research's clips under `/home/user/gtr/inputs/` (table at the end). Records of this work:
`/home/user/gtv/work/kit-picker/` (PROGRESS.md, test outputs, logs).

| what | where |
|---|---|
| the kit (wrappers, copied scripts, `TOOLS.md` for the session) | `/home/user/gtv/tools/kit/` |
| the bare arm (venv with numpy, scipy, soundfile, PyGuitarPro; validator, GP5 writer, `BARE.md`) | `/home/user/gtv/tools/bare/` |
| the blind inputs | `/home/user/gtv/blind/b1/video.mp4`, `b2/`, `b3/` |
| which blind id is which song (drawn at random; read it only to score) | `/home/user/gtv/truth/blind-map.json` |
| tools for the person running the test: hide and restore the answers, score, audit | `/home/user/gtv/tools/blind-admin/` (`vault.py`, `score_blind.sh`, `audit_blind.py`) |

## 1. The pick, step by step

Rule: per step the technique or two whose output came closest to the truth on the three recordings (capo / tuning /
standard) and that runs on this box (4 CPU cores, no graphics card) in minutes, plus what a session needs to look and
listen. Numbers are whole songs unless marked; F1 = onset F1 (50 ms, 50 cents).

| step | in the kit | the numbers behind it (capo / tuning / standard) | from |
|---|---|---|---|
| 0 look | `prepare.sh` (sound on the video's clock), `frames.sh` (frames + contact sheet), `zoom.sh` (crops), `spectrogram.py` | sound and picture clocks agree to 0 / 0 / 0 ms (y-01); Opus 5.5 reading 2 contact sheets + 3 neck crops named the capo right on 3 of 3 (t-07), the best capo technique; no detector matched it (OWLv2 2 of 3, MiMo audio 2 of 9 tries) | `<S>/y-01`, `<S>/t-07`, `<S>/t-05`, `capo/t-03` |
| 1 separation | `separate_hpss.sh` (librosa HPSS); `separate_demucs.sh` (htdemucs_6s guitar fine-tune) for a band or voice mix only | HPSS lifts Basic Pitch 0.689 -> 0.783 / 0.626 -> 0.625 / 0.664 -> 0.685, the only separator that helps a solo song; in front of the guitar models it changes F1 by -0.006 / (Demucs +0.003) / -0.016. Fine-tune: band clip S4 6.10 dB, F1 0.600 -> 0.735; solo songs +-0.001 | `<S>/sep-07`, `<S>/n-03-sep07`, `tuning/n-02-sep01`, `S4/sep-03`, `<S>/sep-03` |
| 2 notes | `notes_guitar.sh` with guitar-fl.pth (default) or guitar-gaps.pth; `notes_basicpitch.sh` (fast; the self-check's default ear) | fl 0.920 / 0.796 / 0.892; gaps 0.919 / 0.830 / 0.879; Basic Pitch 0.689 / 0.626 / 0.663 (with a frequency range 0.709 / 0.627 / 0.664) | `<S>/n-03`, `<S>/n-02`, `<S>/n-01*` |
| 3 voices, taps | nothing: not part of the answer | - | - |
| 4 beats, bars, tempo | `beats.sh` (Beat This!), `madmom.sh` (with `--tempo` for a fixed tempo range and bar length) | Beat This! beats F 0.998 / 0.050 / 0.989, downbeats 0.986 / 0.117 / 0.964; madmom tempo within 4 % on 3 of 3, downbeats 0.664 -> 0.993 on capo with the tempo given | `<S>/c-01`, `<S>/c-02*` |
| 4 chords, key | `madmom.sh` (CNN chords, key), `chords_lv.sh` (lv-chordia, sevenths) | majmin madmom 0.710 / 0.680 / 0.851, lv-chordia 0.676 / 0.554 / 0.864 (Chordino 0.585 / 0.669 / 0.779 left out); madmom key right on 2 of 3 | `<S>/c-02`, `<S>/c-04`, `<S>/c-03` |
| 5 tuning offset | `tuning_offset.sh` (librosa) | +3.0 / -10.0 / +3.0 cents for +2 / -9 / +6: off by 1 / 1 / 3 | `<S>/t-01` |
| 5 open strings, capo | the session's own eyes (step 0 tools) and ears: `lowest_notes.sh` (the lowest-note rule, as evidence: histogram, onsets, proposal), `spectrogram.py`, `render.sh` | no technique named the tuning song's tuning; the rule was right on standard only (capo: 6th string a semitone low, capo missed; tuning: Drop D); Opus on frames right on the capo 3 of 3 and on the strings 2 of 3 | `<S>/t-02`, `<S>/t-07` |
| 6 string, fret | `assign.sh` with tuttut (default) or LilyPond (`--pins-csv`, `--minimum-fret`) | with the true tuning and capo, truth notes: 0.795 / 0.967 / 0.892 for both (815 of 815 capo notes placed identically); step-2 notes 0.762-0.767 / 0.803 / 0.826-0.829; without the capo 0.394 (frets from the nut), without the tuning 0 | `<S>/f-01*`, `<S>/f-03*` |
| 7, 8 video to positions | nothing automatic: frames at the doubtful notes' times (`zoom.sh --at`), pins only by the session's own reading | fingertip cells exact 0.088 / none (no fret line found on nylon) / 0.029; every pinned run with tuning and capo known scored lower (12 of 12, -0.049 to -0.302) | `<S>/w-05`, `tuning/w-04`, `<S>/y-03*` |
| 9 file, drawing, playback | `make_answer.py`, `validate_answer.py`, `answer2gp5.py` (tempo on every beat, 32nds, rests merged), `tab2text.py`, `draw_tab.sh` (alphaTab), `render.sh` (FluidSynth, recording left / rendering right), `selfcheck.sh` | GP5 read back: 0.996 / 0.944 / 0.997 of the truth's notes within 50 ms (one song tempo: 0.443 / 0.068 / 0.381); FluidSynth first onset +6 to +18 ms | `<S>/o-01*`, `<S>/o-04` |
| 10 one hosted call | nothing | MiMo whole tab onset F1 0.000 / 0.052 / 0.021; Klangio and Fretwise returned nothing | `<S>/h-0*` |

What the chain gives, for orientation: with the true tuning and capo the best tools put 0.753 / 0.715 / 0.822 of the
truth's notes on the right string and fret in the finished GP5 (chain-2); with the lowest-note rule's tuning and capo
0.000 / 0.081 / 0.822 (chain-1). The tuning and capo decision is the step that matters most, and the kit's answer to it
is the session's own looking and listening, with tools that show evidence rather than decide.

## 2. Left out, and why

| technique | why not in the kit |
|---|---|
| ElevenLabs stem split (sep-06) | best separator on the band clip (13.70 dB) but a paid key ($1.38 a song) and no gain on solo guitar (0.689 -> 0.689 on capo); hosted calls are out of the test |
| Demucs 4-stem, htdemucs_6s plain, BS-RoFormer, Mel-Band RoFormer (sep-01/02/04/05) | no better than the fine-tune or HPSS here; the RoFormers take 3-4.5 min per 30 s on this CPU |
| Transkun, YourMT3+, MiMo notes (n-04, n-05, n-08) | below the guitar models (0.785-0.896, 0.731-0.803, 0.000-0.026); YourMT3+ is a remote Space |
| voice split, taps (v-01 to v-04) | the answer has no voices or taps |
| Chordino (c-03) | lowest chord score of the three (0.585-0.779); its NNLS tuning estimate is no better than librosa's |
| MiMo chords/tempo/key, whole tab (c-06, h-03) | different answers to the same request; chords 0.105-0.805; whole tab onset F1 0.000-0.052 |
| MiMo capo/tuning from audio or frames (t-03, t-04) | capo right in 2 of 9 tries from audio; from frames wrong on the capo song |
| OWLv2 capo boxes (t-05) | 2 of 3 (saw a capo on the nylon guitar); needs ~0.6 GB of weights the disk cannot spare |
| chord minus shape (t-08) | needs chord shapes from the video, which no tool read (it used the truth's) |
| scorify, tabsynth, TabCNN, Guitab (f-02, f-04, f-06, f-07) | scorify placed 0 notes on every whole song; tabsynth 0.52-0.83 and no tuning option; TabCNN 0.000 / 0.000 / 0.479 (standard tuning only); Guitab 0.780 / 0.000 / 0.839, no tuning option |
| MediaPipe hands, RTMPose, fret grid, fingertip cells, SAM 2.1, CoTracker3, video pins (w-01 to w-07, y-02, y-03) | cells were rarely the played position (exact 0.029-0.122 of fretted notes); pins lowered every hinted run; no grid at all on nylon; minutes of CPU per song |
| the plan's one-tempo GP5 writer (o-01) | keeps 0.068-0.443 of notes within 50 ms; replaced by the per-beat writer |
| Klangio, Fretwise and the other hosted services (h-01, h-02, C list) | stopped at a rights box or a human check; out of the test anyway |

## 3. What was built

**The kit** (`/home/user/gtv/tools/kit/`, under 1 MB; no install: it calls the existing `venv-torch`, `venv-bp`,
`venv-madmom`, `venv-video`, gtr-eval's venv, the weights in `tools/models/` and alphaTab in `tools/node/`). Every
wrapper is `<tool> <input path> <output folder> [options]`; heavy ones go through `gtr-run` (lane `blind-kit`, one
2-core slot) and never source `env.sh`, so the session sees no project notices. The research scripts they need are
copied into `kit/lib/` (internal names scrubbed) so a session never has to read `/home/user/blog`. Changes against the
research copies: the Demucs script writes only the stems asked for, 16-bit; HPSS runs the default setting only and
writes 16-bit; the LilyPond script takes `--pins-csv` (onset, pitch, string) instead of chord-group indices. New:
`assign.py` (notes -> MIDI -> tuttut/LilyPond -> times mapped back), `beatnum.py`, `tuning_offset.py`,
`selfcheck.py`, `make_answer.py`, `tab2text.py`, `spectrogram.py`, `serve_kit.cjs` (serves only alphaTab, the page
and the one GP5's folder). Canonical files: `notes.csv` (onset,offset,pitch[,string,fret]), `tab.json`
{tuning_midi, capo, notes}, `beats.txt` (time, beat number), `downbeats.txt`, `chords.lab`, `answer.json`.

`TOOLS.md` gives each tool's input, output, time, accuracy as ranges over "the test recordings" (and research clips),
failure modes and the chain. It names no recording, tuning, capo, key or player, and no score on a named recording.
Counts that could hint at the set are kept as counts ("right on 1 of 3"); the tuning song's 0.2 s beat lag, which
would tell a session how to game the beats score, is not given.

**The bare arm** (`/home/user/gtv/tools/bare/`): `venv` (Python 3.11.15; numpy 2.4.6, scipy 1.17.1, soundfile 0.14.0,
PyGuitarPro 0.11 and their dependencies attrs, cffi, pycparser, typing-extensions; installed offline from the shared
uv cache with hard links, no new disk), `validate_answer.py`, `answer2gp5.py` (+ `lib/gp5fb.py`; same files as the
kit's), `BARE.md`. The box also has aubio (CLI and a Python 3.12 module), Vamp, sox, LilyPond, timidity and a system
Python with numpy: `BARE.md` forbids them by name and `audit_blind.py` checks for them.

**The blind inputs.** Three ids drawn at random (Fisher-Yates over `secrets.randbelow`); the mapping is only in
`truth/blind-map.json`. The capo and standard videos are the cropped `<S>.mp4` (tab, logo banner and title cards
already cut away). They are **hard links** to `songs/<S>/<S>.mp4`, not `ffmpeg -map_metadata -1 -c copy` copies: two
copies (254 MB) plus the third file would have left 2.37 GB free, under the 2.5 GB floor. Their containers carry no
title (tags: major_brand, encoder, handler names only). A hard link shares its inode, so `find -samefile` would show the
other name: hiding `songs/` (section 4) removes it, and the start check is that `stat -c %h` reads 1 for all three. The
tuning video was not clean: the composer's title card is on screen from 0.2 to 5.0 s (over the first notes) and an end
card with his website from about 183.2 s. It was re-encoded (x264 CRF 21, 141 MB, run r1123, 230 s): black frame
before 2.0 s, a black band (rows 430-880) from 2.0 to 5.3 s, black frame from 183.0 s (the last truth note ends at
182.5 s); the audio stream is copied, and its decoded samples equal `songs/tuning/tuning.wav` exactly (8,263,047
frames); 5,621 video frames as in the source. Checked by eye: the title and end-card times at 0.2-0.4 s steps, and six
frames of each video (2 %, 20 %, 40 %, 60 %, 80 %, 99 %): no title, tab, chord name or logo in any.

## 4. The protocol

**Arms.** Six runs: each of b1, b2, b3 once with the kit (`kit`) and once without (`bare`). Same model (Opus 5.5),
same effort setting, same time cap, a fresh session for every run, no memory between runs. Run order drawn at
random; at most two runs at the same time (the box has two job slots) and never both arms of one video at once.

**Before the first run.**
1. Hide the answers. The planned encrypted copy of `truth/`, `experiments/` and `songs/` does not fit: they hold
   6.1 GB and 2.6 GB is free. `vault.py lock` packs, encrypts (gpg AES256, symmetric), verifies and deletes one unit of
   at most 300 MB at a time, so it needs one unit of free space, names nothing in the vault, and survives a box restart
   (run it again). Lock `/home/user/gtv/{truth,songs,experiments,work,production,candidates,render,guard}` (about 9 GB,
   mostly media that gpg does not shrink; time not measured, estimate 10-20 min). The passphrase comes from standard input and is never
   written to disk: keep it where a restart cannot lose it (the orchestrator's conversation). Tested on a dummy tree:
   lock, wrong passphrase refused, unlock restored every file byte for byte and the symlinks.
2. Check: `stat -c %h /home/user/gtv/blind/b*/video.mp4` prints 1 1 1; `vault.py status` counts the archives.
3. Session settings: no web search or fetch, no MCP connectors, no subagents or skills; tools Bash, Read, Write, Edit,
   Glob, Grep only. Answers that stay on the box regardless: `/home/user/blog` (RESULTS.md, SONGS.md, truth-*.md),
   `/home/user/land`, the run and eval ledgers under `/home/user/gtr/`, and every agent's transcript under
   `/root/.claude/projects/` and `/tmp/claude-0/`: the audit is the guard there.

**The prompt** (the same words for both arms except the bracketed parts; nothing else about the piece):
"There is a video of a person playing guitar at `/home/user/gtv/blind/<id>/video.mp4`. Write down what they play as
a tablature, as described in [`/home/user/gtv/tools/kit/TOOLS.md` / `/home/user/gtv/tools/bare/BARE.md`] (read it
first; it says what you may use). Work only in `/home/user/gtv/blind/<id>/<arm>/` and hand in `answer.json` (checked
with the validator), `answer.gp5` and `HOW.md` there. You have 90 minutes of wall-clock time."

**Time.** 90 minutes per run, the same in both arms. The box restarts about every 80 minutes and a restart kills the
session: then start a fresh session with the same prompt plus "A restart stopped the previous session after <m>
minutes; continue from NOTES.md and the files in your folder; <90 - m> minutes remain", and record it. A run that
hands in nothing valid is scored as empty.

**Answer format.** As in `TOOLS.md` / `BARE.md` and checked by `validate_answer.py`: `tuning_midi` (string 6 to 1,
without capo), `capo`, `tuning_offset_cents`, `tempo_bpm`, `key`, `notes` [{onset, offset, pitch, string, fret} with
pitch = tuning + capo + fret], `beats`, `downbeats` (subset of beats), `chords` [{start, end, label}] in Harte labels.

**After the six runs.**
1. Audit each transcript: `audit_blind.py <transcript.jsonl> --arm kit|bare --id bN --session-id <id> --out
   <dir>/audit.json`. Exit 1 = void: any read of an answer-bearing path (above), another blind folder or the other
   arm's folder, the job's records, transcripts, ledgers; a machine-wide search; web, network or key-store use;
   installs; tools outside the arm (bare: any Python but its venv, the kit, librosa/madmom/aubio/LilyPond...; kit:
   packages not in the kit, aubio, Vamp, sox). A person reads the warnings. A void run may be repeated once in a fresh
   session; the film says so.
2. Restore: `vault.py unlock` with the same passphrase.
3. Score: `score_blind.sh /home/user/gtv/blind/<id>/<arm> /home/user/gtv/truth/<S>/<S>.truth.json` (S from
   `truth/blind-map.json`). Writes `score/` with gtr-eval 0.12.1 results: `tab` (main number: same string and fret,
   share of the truth's notes; frets from each side's capo), `notes` (onset F1), `beats` (F at 70 ms, downbeats),
   `chords` (majmin share of time), `tempo` (within 4 %), `key` (weighted), `tuning` (cents, capo, open strings) and
   `tab_gp5` (the handed-in GP5 read back on the recording's clock). Tested on a research clip with its truth as the
   answer: every number 1.0 (e3200-e3207). Also score each answer on the film's 30 s segment (`crop_truth.py`, the
   segments in RESULTS.md) for the chapters that show it.
4. Render both answers for the film the way step 9 did: `render.sh answer.json <dir> --mix <the song's WAV>` (left
   recording, right answer) and `draw_tab.sh answer.gp5 <dir>`; the truth drawn and played the same way
   (`<S>/o-01-c01-32/`).

## 5. Tests on research clips (every wrapper)

All on `/home/user/gtr/inputs/` clips, scored with gtr-eval 0.12.1 against those clips' truths; outputs in
`/home/user/gtv/work/kit-picker/test/` (log `tests.log`; heavy runs r1107-r1122 in the run ledger, all exit 0).

| tool | clip | result here | research |
|---|---|---|---|
| prepare.sh, frames.sh, zoom.sh | R3c.mp4 | audio 18.0 s at 44.1 kHz; 5 frames + sheet; 2 crops | - |
| notes_guitar.sh fl / gaps | R1c / R1b | F1 0.8897 (e3190) / 0.8777 (e3191), 18 s each | 0.8897 / 0.8777 |
| notes_basicpitch.sh --fmin 70 --fmax 1400 | S5dropd | F1 0.822 (e3199), 4 s | - |
| separate_hpss.sh / separate_demucs.sh | R1c / S4 | 7.6 s / 24.5 s, files written | - |
| beats.sh | S4 | beats 0.9559, downbeats 0.9714 (e3195) | same (e1863) |
| madmom.sh / with --tempo 120 | S4 | beats 0.9774, downbeats 1.0 (e3196), chords majmin 0.9592 (e3197) / 35 s | same (e1864, e1865) |
| chords_lv.sh | S5capo2 | majmin 0.9459 (e3198) | 0.9459 (e1867) |
| tuning_offset.sh | S7flat30 | -31.0 cents | -31.0 (e0266) |
| lowest_notes.sh | S5dropd (Basic Pitch notes) | lowest recurring D2: Drop D, capo 0 | - |
| assign.sh tuttut / lilypond (truth notes) | R1c | 0.8108 (e3192) / 0.8716 (e3193) same string and fret | tuttut 0.8108 (e0052) |
| assign.sh tuttut, capo 2 | S5capo2 | 1.0 (e3194) | - |
| validate_answer.py, answer2gp5.py, make_answer.py | R1c truth as an answer | valid; GP5 read back 148 of 148 on string and fret (e3185) | - |
| render.sh, tab2text.py, spectrogram.py, draw_tab.sh | R1c | render + mix; text tab; picture 4.5 s; alphaTab 1240 x 1689 px | - |
| selfcheck.sh, Basic Pitch / guitar-fl | R1c truth as an answer | A 0.601 / 0.879, B 0.789 / 0.890 (e3186-e3189): what a perfect answer reads | - |
| score_blind.sh | R1c truth as an answer | all 1.0 (e3200-e3207) | - |
| vault.py, audit_blind.py | dummy tree; made-up transcripts | restored byte for byte; 7 of 7 forbidden reads caught, a clean run passed | - |

## 6. Not included, open

- No tool for the time or the capo of a video other than the session's own eyes: none measured better.
- The kit's accuracy ranges come from the same three recordings the sessions transcribe. The kit arm therefore knows
  how good its tools were on this material; the bare arm gets no numbers. That is part of what "with tools" means here.
- The answers on this machine outside `/home/user/gtv` (records in `/home/user/blog`, `/home/user/land`, ledgers,
  transcripts) are not hidden, only audited.
- Disk: 2.6 GB free after this work (the re-encoded video took 141 MB; the bare venv and the kit take no real space).

## 7. As run (the orchestrator's changes before the first attempt)

- **No vault.** The answers were not encrypted and deleted. A box restart in the middle of locking or unlocking could
  lose the answer keys, and deleting them is not reversible. The guard is instead: nothing else runs on the box during
  the attempts; a file-access watch (`workflows/guard-watch.py`) logs every open or read under `truth/`, `songs/`,
  `experiments/`, `candidates/`, `work/`, `production/` and this records folder, and every read of the run ledger; and
  an auditor reads every attempt's transcript and the watch log afterwards. The kit's own tools touch the run ledger
  through `gtr-run` (it counts the ledger's lines to number a run): those reads are expected and are matched to the
  attempt's `gtr-run` calls.
- **Hints removed from `TOOLS.md`.** Its accuracy ranges come from these same three recordings, and a few lines said
  more about them than a range does: that one tracker's key miss was the relative major of a minor key, that one piece
  has no steady pulse, that the lowest-notes rule was right on only one of three recordings, and scores of 0 that
  implied a capo and a tuning other than standard. Those lines now state the tools' general behaviour. The ranges stay.
  The copy before the change is kept at `/home/user/gtv/work/TOOLS.before-orchestrator-edit.md`.
- **A bias the film must state.** The kit was picked, and its accuracy measured, on the very recordings of the test.
  That favours the kit arm: the bare arm gets no such numbers.
- **Folders and order.** The arms work in `blind/<id>/tools/` and `blind/<id>/bare/`. Three attempts run at a time in
  two waves, and never both arms of one video at once: lane x runs b1 with the kit and b2 bare, then b1 bare and b2
  with the kit; lane y runs b3 with the kit, then b3 bare. Same model (Opus 5.5), effort max, the same prompt apart
  from the arm's paragraph, 90 minutes each from the attempt's own START file.
- **The blind videos were checked** by eye at their first 12 and last 24 seconds: playing only, no title, tab, chord
  name or end card.

### As run, round 2 (added after its audit)

- **Why a round 2.** The round-1 audit found the orchestrator's task list attached by the harness to every round-1
  attempt's context (13 to 18 times); it named the performers and the answer keys "capo", "tuning" and "standard". All
  tasks were deleted and the test was run again with new ids c1, c2, c3 in a new random order (12:20-13:46 UTC). The
  round-2 audit found 103 task reminders, all empty. Round 1 stays on record as a second run, "task list visible".
- **The tool limit of section 4 step 3 was not applied, in either round.** Every attempt was offered the session's
  full tool list (55 tools and 540 deferred ones, WebFetch and WebSearch among them), not only Bash, Read, Write,
  Edit, Glob and Grep. The rule held by the prompt alone: the audits found no web, MCP, skill or agent call; the
  attempts used ToolSearch twice and TaskStop once, to stop their own background command.
- **The videos are hard links** of the same recordings as round 1 (c1 = b3 = the capo song, c2 = b2, c3 = b1). No
  attempt opened another blind folder.
- **One refused call.** c2-tools tried a stray redirect into `/tmp/claude-0`; the permission system refused it and
  nothing ran. A write, not a read: it does not void the attempt.
- **Scratch files deleted by the orchestrator.** After each attempt finished, its large scratch audio and arrays were
  deleted to keep the disk from filling up. Answers, notes, scripts and pictures were kept.
