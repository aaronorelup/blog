# Audit of the held-out key `closer` (*Closer*, Gareth Evans, E A D G A D + capo 1)

Audited 2026-11-27 by lane H's audit agent. This agent built neither the key, nor the check, nor the repair. Nothing in
`/home/user/gtv/truth/closer/` or `/home/user/gtv/songs/closer/` was changed.

- **Key audited:** `closer.truth.json`, SHA-256 `4c91534f5c5c...` (1,149 notes), the repaired key that `closer.md`
  describes in [Repairs](closer.md#repairs). A snapshot of it is in the work folder (`out/closer.truth.audited.json`).
- **Work folder** (not in git): `/home/user/gtv/work/heldout-closer/audit/` (`bin/`, `logs/`, `out/`, `frames/`,
  `PROGRESS.md`). Every number below comes from a file named next to it.
- **Heavy runs** (`gtr-run`, lane notes-heldout, 2 cores each): r1485 (render), r1487 (time 0; r1486 stopped on a JSON
  type and was run again), r1488 (tuning and capo), r1489-r1491 (random notes; v3 is the one reported), r1494 (the
  check's rule).

**No note transcriber was run at any step of this audit.** The evidence is:
- onset envelopes and peak picking on the raw recording;
- a FluidSynth rendering of the key;
- STFT energy at each note's own partials, at its key time;
- CQT pictures, frames of the video, and my eyes.

## Verdict

| item | result |
|---|---|
| 1. Files exist and match the schema (`gtr-eval check-truth`) | **PASS** |
| 2. The WAV's time 0 and the key's time 0 agree | **PASS** |
| 3. Tuning and capo | **PASS** |
| 4. 40 random notes heard at their partials | **PASS** |
| 5. No note transcriber's output was used | **PASS** |
| 6. The record states counts the files reproduce | **FAIL** (one number; everything else reproduces) |
| 7. Rights note and credit line present | **PASS** |
| 8. Nothing private in the repo record | **PASS** |

**The key is fit for scoring.** One fix is needed, in the record only:
- `closer.md` line 271 (section "The key", Counts, first build) says "The 99 `tab` notes are spread over 58 bars".
- The files give **45 bars**.
- Two doubts at the 50 ms edge are listed under item 4. Neither changes a fact the scoring relies on.

## 1. Files and schema: PASS

- **`gtr-eval check-truth`** (0.12.1): **11,895 checks, 0 mismatches**, on the installed file and on the snapshot
  (`out/check_truth_installed.json`, `out/check_truth.json`). Notes 1,149 (melody 622, bass 346, chord 181), 384
  beats, 96 downbeats, 187 chords, 243 taps.
- **Schema against `capo.truth.json`**, my own script (`bin/schema_audit.py`, `out/schema_audit.json`): all checks
  pass.
  - The same top-level keys and types, the same `source` keys, and every `derivation` key of capo's.
  - Every note has capo's 8 note keys. The extra keys are `harmonic` (222), `legato` (44) and `unison` (7);
    `check-truth` ignores them.
  - Pitch = `tuning_midi[6 - string]` + capo + fret holds for 1,149 of 1,149 notes, and for all 7 `unison` entries.
  - Notes are sorted and inside the audio. They last 0.100-2.000 s.
  - No duplicate (onset, pitch), and no overlap on a string.
  - `conf` counts equal `derivation.conf_counts` (1,074 / 74 / 1).
  - Beats rise strictly and the downbeats are every 4th beat. The chords cover 0-246.301 s with no gap.
    `scored_range` is [0, 246.30102], `audio` is `closer.wav`, 44,100 Hz, 2 channels.
- **Side files** scored against the JSON (`--no-ledger`, `out/side_*.json`):

  | file | result |
  |---|---|
  | `closer.notes.csv` | onset and onset+offset F1 1.0 |
  | `closer.mid` | onset F1 1.0, onset+offset 0.949 |
  | `closer.tab.txt` (`tab --ignore-time`) | 1,148 of 1,149 same string and fret: the bar 11 unison, as the record says |
  | `closer.notes.csv` as a tab | 1,149 of 1,149 |
  | `beats.txt`, `chords.lab`, `closer.conf-levels.csv` | equal the JSON row by row |
  | `closer.tab.txt` note heads | 1,156 = 1,149 + the 7 unison second notes |

- **Audio and video** (`ffprobe`). The SHA-256 prefixes equal the record's.

  | file | what it is |
  |---|---|
  | `closer.wav` | PCM s16le, 44.1 kHz, stereo, 10,861,875 samples = 246.301 s |
  | `closer.mono.wav` | the same length; equal to the mean of the stereo channels within 1 LSB |
  | `closer.mp4` | H.264 1280x400, 12,316 frames, 50 fps; Opus audio |
  | `closer.full.mp4` | H.264 1280x720, otherwise the same |

  - The tags of both mp4s carry only encoder and handler names: no title, no URL, no description.
  - Frames of `closer.mp4` at 0, 60, 123, 200 and 246.2 s show only the guitar and the hands: no tab strip, no logo
    banner, no title or end card (`frames/mp4_contact.png`). `closer.full.mp4` shows the tab strip (same sheet).

## 2. Time 0: PASS

The key was rendered with FluidSynth (`tools/bin/notes2wav.py`, steel, program 25, on the key's own timeline, r1485).
The same onset envelope (log-mel flux, hop 128 = 2.9 ms) and the same peak picker were run on the rendering and on
`closer.wav` (`bin/timezero.py`, r1487, `out/timezero_p25.json`).

| measure | result |
|---|---|
| whole-song cross-correlation of the two envelopes | recording **23.6 ms before** the rendering (correlation 0.63) |
| FluidSynth's own attack: rendering detections minus key onsets | median **+20.3 ms** (IQR +17.5..+20.4) |
| so the recording against the key's clock | **-3.3 ms** |
| per onset group (750 groups): nearest recording detection minus key onset | median **-2.9 ms** (one hop), IQR -5.8..-2.9, p10-p90 -8.7..0.0; 98.9 % within 50 ms and 97.1 % within 30 ms of the 715 with a detection within 100 ms |
| the same per quarter of the song | -2.9 / -2.9 / -2.9 / -2.9 ms |
| the cross-correlation in 23 windows of 20 s | -25.4 to -22.4 ms (median -23.6, IQR -24.0..-23.0); drift -0.7 ms per 100 s |
| a shift scan, -150 to +150 ms | the best shift is **0 ms** (91.7 % of groups have a recording onset within 25 ms) |
| recording minus rendering, per group | MAD 2.9 ms; 11 of 575 more than 30 ms from the median, 7 more than 50 ms |

The groups that are off (`logs/tz_outliers.log`):
- **7 more than 50 ms from the median:**
  - In two, the rendering's detection paired with a neighbouring event (17.36 and 127.38 s).
  - In five, the recording's nearest detection is 52-87 ms before the key time (47.53, 100.95, 183.33, 192.48 and
    212.66 s). At four of them the notes' own partials step at the key time (item 4, extra notes), so the early
    detection is another event. The fifth, 100.95 s, is a `tab` note at a slap: present, with no fresh attack.
- **4 between 30 and 50 ms**, among them the spread chord of bar 7 pos 0 and the bar 92 slide, which the record already
  lists.

**The WAV and the video** (`bin/wav_offset.py`, `out/wav_offset.json`):
- `closer.wav` sample 0 = **13.992494 s of `audio.wav`**, the same at 1, 60, 120, 180 and 240 s (correlation
  0.9988-0.9998). That is the record's value.
- The audio of `closer.mp4` and of `closer.full.mp4`, decoded to 44.1 kHz, equals `closer.wav` at offset 0
  (correlation 1.000 at 1, 120 and 240 s). It has the same length, 246.30102 s.
- Frame 6,000 of `closer.full.mp4` matches `video.mkv` at 133.987 s = 13.987 + 0.02 × 6,000 (mean grey-level
  difference 0.66, against 2.2 or more for the neighbouring frames). That is the record's frame mapping.

## 3. Tuning and capo: PASS

- **Stated:** the title card of `video.mkv` (frame at 12.2 s, `frames/mkv_title.png`) reads "Tuning: EADGAD" and
  "Capo on 1st fret". The key has `tuning_midi` 40 45 50 55 57 62 and `capo` 1.
- **Seen:** at 109 s of `closer.mp4` (`frames/capo_zoom_109.png`) the wooden capo sits right behind the first fret
  wire, with the nut at the picture's edge. Counting from it, the first single inlay is at fret 3 and the double inlay
  at fret 5.
- **Heard, at the key's own note times** (`bin/tuning_capo.py`, r1488, `out/tuning_capo.json`). For each note I
  measured the power added at partials 1-6 of its pitch, against the pitch each other reading gives for the same
  string and fret. An alternative is compared only when its pitch class is not sounding in the key.

  | the key's reading against | key pitch louder |
  |---|---|
  | capo 0 (every pitch -1) | **97.5 %** (1,044 of 1,071) |
  | capo 2 (+1) | **96.5 %** (1,053 of 1,091) |
  | standard tuning on strings 1-2 (B E: +2) | **96.4 %** (268 of 278; s1 74/74, s2 194/204) |
  | D A D G A D (string 6 -2) | 70.9 % at 4,096 points. String 6 is too low for that window: with 16,384 points (`bin/s6_test.py`) **88.4 %** (107 of 121; open F2 against D#2 33 of 40) |

- **Cents** (`out/tuning_capo.json`): the 876 level-S notes give a median of **-2.3 cents** (IQR -5.2..+0.5),
  measured at the peak of partials 1-4.
  - Per string: s6 -8.4, s2 -5.4, s3 -1.8, s5 -1.9, s4 -0.2, s1 +1.2.
  - Open strings -4.3, harmonics -3.2, fretted notes -0.8.
  - The key's `tuning_offset_cents` is -2 and the check's -2.5: these agree.

## 4. 40 random notes: PASS

- **The draw:** seed 4127, 40 notes (`bin/notes40.py` v3, r1491, `out/notes40.json`, picture `frames/notes40.png`).
  This is a different seed from the repair's second pass. The sample holds 37 `tab+audio` notes (S 31, C 5, L 1) and 3
  `tab` notes, all level N.
- **Own partials:** partials 1-8 of each note, leaving out any within 40 cents of a partial of another key note that
  sounds within 60 ms.
- **Measures:**
  - the rise of those partials at the onset (1,024-point STFT);
  - an attack time: the largest 20 ms step of their level, 512-point STFT;
  - a margin: power after the onset at its free partials, against the louder free neighbour semitone.

**Every pitch is present at its time.**
- 38 of 40 meet "rise ≥ 3 dB and margin ≥ 0 dB" (35 `tab+audio`, 3 `tab`).
- The other two are `tab+audio`, level S:
  - #664 (146.971 s, F3 s4 f2): its own partials rise 11.9 dB, margin -0.9 dB;
  - #1034 (218.059 s, G#4 harmonic s3): rise 20.5 dB, margin 0.0 dB.

  In both the neighbour's bins catch leakage. The partial traces (`frames/ptrace_664_1034_506.png`) and the CQT show
  the pitch starting at the key time.
- The `tab+audio` rises at the onset are 3.6 to 33.9 dB.

**Timing.**
- 35 notes have a clear step (≥ 3 dB). Their median attack is -14.1 ms (the window's bias), p10-p90 -20 to +1 ms.
- Two lie further out, and both are on time:
  - #379 (88.218 s, G#3 open s3): it starts on a string slap, and its pitch is there from the slap
    (`frames/ptrace_fine_379_790_1020.png`).
  - #790 (175.363 s, a pull-off target): the (target - origin) contrast steps at -13.6 ms (`bin/legato_trace.py`,
    `logs/legato_790.log`).
- No random note with a clear attack is more than 50 ms from it. #1020 (a harmonic on a slap, no 3 dB step) starts
  at its slap in the traces. #540 (`tab`) has no clear attack.

**The `tab` notes.**
- My rule is weaker than the check's level S: like the check's level C, it is not pitch-specific.
- All three `tab` notes in the sample pass it (#847 and #946; #540 only just). So these `tab` notes may be heard.
- That errs on the safe side for heard-only recall and is not a fault.

**The repair's judgement calls on the check's Problem 4** (`out/p4kept.json`, `bin/partial_steps.py`,
`logs/partial_steps.log`, `frames/ptrace_fine_p4kept.png`). For the 10 notes the repair kept:
- **On their attack**, as the repair says:
  - #85 and #86 (19.737 s), #521 (118.190) and #1089 (230.365) step at the key time.
  - #310 (71.100 s, C#3 with a thump 58 ms later): partials 2 and 5-8 step +5 to +14 dB at the key time and not at
    the thump.
  - #126 (30.105 s): partials 2-8 step +5 to +16 dB at the key time, before its slap.
- **#824** (182.700 s, C4, `tab`) has no clear attack anywhere: `tab` fits.
- **#1091** (230.719 s, G#4 s1 5, the bar 92 slide): only its partial 7 is free of other notes, and it steps 3.7 dB.
  That neither confirms nor contradicts the record's account of a slide into the pitch, so it stays as the record
  leaves it.
- **Doubt, not a fault:** the two harmonics at thumps, #331 (76.220 s, A#4 `<12>` s2) and #750 (167.149 s).
  - Partials 2, 6 and 8 step at the key time (+10.7 / +12.9 / +6.4 dB and +8.4 / +4.2 / +19.5 dB). That is the
    thump, with the note or not.
  - The fundamental and partials 5 and 7 step 45-50 ms later (+4.3 / +13.8 / +9.0 dB and +5.1 / +17.5 / +17.1 dB).
  - The record's account ("step in partials 3-6 within 10 ms before the key time") is only half of it. Either reading
    is inside the 50 ms tolerance, at its edge.
  - Suggested: list both under "What remains uncertain after the repair", beside the bar 2 and 93 harmonics.

**Extra notes** (the time-0 outliers; same script): #230 and #826 (A#3 s2 0 at 53.168 and 183.333 s), #866 and #867,
#1012 and #1013, and #205 are heard at their time. #431 (`tab`, at a slap) is present with no fresh attack, as `tab`
says.

## 5. No note transcriber: PASS

- **Names:** every script, log, JSON, Markdown and text file in `/home/user/gtv/work/heldout-closer/` (outside
  `audit/`) was searched for any tool name. The names were Basic Pitch, Transkun, Riley / guitar-fl / guitar-gaps,
  YourMT3 / MT3, Noise2Fret, the kit's `notes_guitar`, Onsets and Frames, piano_transcription, CREPE, pYIN, Omnizart
  and TabCNN, with any spelling. **0 hits.**
- **Imports:** across the 91 Python scripts (builder, readers, check, repair) the imports are:
  - `numpy`, `scipy`, `librosa`, `soundfile`, `PIL` and `matplotlib`, plus standard-library modules;
  - `pretty_midi` and `mido`, for writing MIDI (the side file and the tuning check's FluidSynth input);
  - the research's `gtr_common` writers;
  - the agents' own modules (`feat`, `events`, `cfeat`, `parse_read`).
- **Subprocesses:** the scripts call only `ffmpeg`, `ffprobe` and `fluidsynth`; the shell scripts run `gtr-eval`,
  `gtr-run` and Python.
- **Inputs:** the scripts read only `songs/closer/`, `truth/closer/`, the work folder, the restored venvs and the
  research's `inputs/scripts/`.
- **MIDI files:** the 40 `.mid` files in the folder are FluidSynth inputs for the tuning check (`checks/p06`, `p21`) and
  the key's own side files.
- **The `gtr-run` ledger** (`/home/user/gtr/ledger/runs.jsonl`, 1,493 runs):
  - 22 runs mention closer, and none is a transcriber.
  - Only one run has the closer audio as an input (r1326, the check's comb scan).
  - The other 69 transcriber runs of 2026-11-27 are lane N's, on the capo, tuning and standard songs and the dev24
    clips.
  - The 70th, r1320 (the kit's guitar-fl, lane blind-kit), was a smoke test on `capo.mono.wav`.
- **One loose end, not a fault:** `check/bin/__pycache__/cfeat.cpython-310.pyc` shows that one check script ran under
  a Python 3.10 interpreter. `venv-bp` is the only 3.10 one here. Its imports are clean, so Basic Pitch was not
  called.
- **The repair's copies of the check's scripts** differ from the originals only in input and output: a JSON float
  type, skipping the null sets, and output paths. The rule is unchanged.

## 6. Counts in the record: FAIL (one number)

Recomputed from the files (`bin/counts_audit.py` → `out/counts_audit.json`; first build = `orig/closer.truth.json`,
SHA-256 `bbfc78d24489...`).

**Wrong:**
- `closer.md` line 271: "The 99 `tab` notes are spread over 58 bars". The files give **45 bars**, three ways:
  - the key's downbeats;
  - `check1.json`'s `bar` field;
  - the builder's own `key/out/truth_build_detail.json`.

  The list of bars with 3 or more (6, 13, 14, 16, 22, 26, 36, 45, 46, 48, 68, 92) is right.
- Fix: change "58" to "45". Also point `closer.md`'s line 7 and its last line ("the audit is still to come", "Still to
  come: an audit") at this record.

**Nit:** in Problem 4, "with its beat (beat 3 of bar 45)" is beat index 179, at pos 3.0, which is the bar's 4th beat.
The tab positions count from 0. Say "the beat at pos 3.0" so the reader does not count from 1.

**Reproduced exactly, Repairs:**
- **Notes and `conf`:**
  - 1,156 → 1,149 notes; `conf` 1,074 / 74 / 1 (was 1,056 / 99 / 1).
  - 100 `conf` changes:
    - 61 `tab` → `tab+audio` (S 16, L 5, C 40);
    - 39 `tab+audio` → `tab` (34 no attack, 3 absent, 2 weak).
  - The check disagreed with the first build on 105 notes (`check1.json`).
- **Levels:** `closer.conf-levels.csv` gives S 876, L 35, C 164, N 74 (68 / 4 / 2); S + L = 911. The level
  matches `conf` on every row.
- **The check's rule, run again:** the copied scripts (`bin/recheck_copy.sh`, r1494, `out/rc_audit.verdict.json`) give
  the key's `conf` on all 1,149 notes, with the same levels.
- **Unison:**
  - 7 kept notes, all `tab+audio` (S 3, C 3, L 1): s3 0 for the six G#3 and s4 0 for the bar 11 D#3, each with its
    `unison` string.
  - The previous note on the dropped string ends 10 ms before the dropped attack in the six s4 cases. In the bar 11
    case on s5, an earlier attack on that string ends it.
- **Re-timed notes:** 8 notes moved by 34.8-63.8 ms, at exactly the record's before and after times.
  - Besides the moved notes themselves, only the 8 let-ring offsets before them changed (6 for Problem 3, 2 before
    the bar 45 X chord).
  - Pitch, string, fret and voice are unchanged for every matched note.
  - One beat moved (113.5107 → 113.4759 s).
  - The downbeats, the 243 taps, the 187 chords, key, tempo, tuning and cents are unchanged.
- **`closer-repairs.csv`:** 122 rows (retime 8, unison 7, unison-kept 7, conf 100), with the same `conf` and level
  splits.
- **Levels of the moved notes:** as in the record's table (bars 1, 54, 94, 95 S; 25, 74 C; #492 and #493 S).
- **Timing rows of the self-check table:** recomputed from the check's own SuperFlux and HFC onset lists
  (`bin/timing_repro.py`, `logs/timing_repro.log`).
  - Repaired key: 706 plucked groups, SuperFlux 0.992 / 0.984, HFC 0.989 / 0.936, 3 suspects (15.97, 34.19,
    230.72 s).
  - First build: 713 groups, 0.989 / 0.975, 0.980 / 0.930, 8 suspects.
- **The builder's `validate.py`** (copied, output path changed; `logs/validate_repro.log`): 0.945 → **0.949**, early 0,
  late 4.
- **`check-truth` of the first build:** 11,965 checks, 0 mismatches.

**Reproduced, first build ("The key"):**
- Notes: 1,156 (melody 622, bass 346, chord 188); 222 harmonics; 44 legato (h 5, p 39).
- Beats and form: 384 beats, 96 downbeats, tempo 94.83, Ab major. Bar lengths 2.415-2.665 s (median 2.525); bar 13
  2.415 s, bar 15 2.566 s.
- Chords: 187 segments, with D#:maj 53, F:min 39, C#:maj 35, G#:maj 29, A#:min 13 and N 2.
- Taps: 243 (117 / 104 / 14 / 8).
- Range: first note 0.546 s, last onset 242.649 s.
- The added D#3 at 171.880 s (s4 0, `audio`).
- The readers: `read-A.json` and `read-B.json` agree on **1,377 of 1,377** note heads (bar, position, string, fret, X,
  harmonic); 767 and 763 events.
- Files: SHA-256 prefixes of the four media files, and of `video.mkv` (63,347,413 bytes, MD5 `15aaea79e8fc...`).

## 7. Rights note and credit line: PASS

- **`closer.md`, "Source and credit" and "Rights note":**
  - the source: the archive.org item and file;
  - the licence as stated: none; the mirror's `license: None`; the YouTube original under the standard licence;
  - that it is a major-label composition;
  - the tab's terms: free when the video was made, now sold at two shops; no account made, nothing bought; no reuse
    terms for the tab images;
  - the credit line, and when it must be shown.
- **The key JSON:** `source.license` and `source.attribution` carry the same licence and credit line, in the same form
  as `capo.truth.json`.
- **Open item, not part of this item:** `closer.md` lines 46-48 say the key builder would check the GuitarSet, GAPS,
  Leduc and GOAT track lists. Neither "The key" nor "Repairs" reports that check. The argument given there (a 2016
  YouTube pop cover) makes a leak unlikely, but the check is still owed.

## 8. Nothing private in the repo record: PASS

- **The never-publish scan** of EMBED.md 2.4 (`scripts/check/never-publish.mjs` against `src/data/never-publish.json`)
  finds **0 hits** in `closer.md`, `closer-check.md`, `closer-repairs.csv`, `closer-check-conf.csv` and
  `closer.conf-levels.csv`. This record was scanned the same way after writing.
- **Links and hosts:** the only URL in the two records is the public archive.org item. A search for signed-link
  parameters, private hosts, session links, key names and personal paths finds nothing. The searches covered
  signed-URL parameters (the AWS signature, expiry and token query fields), the project's hosting and storage domains,
  session links and key-tool names. The only file paths are the research box's `/home/user/gtv/` and `/home/user/gtr/`
  folders.
- **The CSVs** are kept out of git: `notes/.gitignore` has `heldout/*.csv` and `heldout/*.json`.
- **The record is committed:** the committed `closer.md` (14705f01) equals the working copy.
