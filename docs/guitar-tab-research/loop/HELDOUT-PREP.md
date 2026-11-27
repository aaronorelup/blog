# Held-out songs made ready (E7 inputs), and LOOP's audit of their keys

By the ho-prep agent of LOOP, 2026-11-27 05:08-06:00 UTC. G = `/home/user/gtv`. Work notes: `G/work/ho-prep/PROGRESS.md`;
every run's command, wall and CPU time and output SHA-256: `G/heldout/<S>/runs.jsonl`; inputs listed in
`G/heldout/<S>/README.md`. No loop, finder or E1 run was made, and no note model's output was compared with a key.

## The two songs

| slot | key (NOTES) | capo given | strings | video | sound | key audit |
|---|---|---|---|---|---|---|
| closer | Gareth Evans, Closer, E A D G A D, 1,149 notes | 1 | steel | 1280x400, 50 fps, 246.32 s, 12,316 frames | 246.30 s | PASS |
| september | Evan Handyside, Wake Me Up When September Ends (Jonathan's Version), open G, 417 notes | 2 | nylon | 1920x1080, 29.97 fps, 153.53 s, 4,601 frames | 153.53 s | PASS (weak frame check) |

- **Restore.** Closer was in place (orchestrator, 05:10). September came from R2 `workbench/guitar-tab-app/heldout/september/`
  at 05:12: 16 files, every one matching its `MANIFEST.sha256` (closer: 44 of 44). In `G/songs/september/` and
  `G/truth/september/`.
- **The blind video** `G/heldout/<S>/video.mp4` is a plain copy of NOTES' cropped `<S>.mp4`. Looked at: 8 frames spread
  over each, and frames through the first and last 15 s. Closer: no tab, chord name, title, logo or end card (the tab
  strip and banner are cropped off; the title and end cards cut). September: NOTES' black box over the title in frames
  0-74 (0 to 2.47 s), clean from frame 75, no end card. Container tags neutral. The video's sound and the WAV line up
  to the sample (cross-correlation, lag 0).
- **Sound**: `audio.wav` = copy of `<S>.wav` (44.1 kHz stereo); `audio.mono.wav` by `ffmpeg -ac 1` as the kit's
  `prepare.sh` does (within 1 LSB of NOTES' own mono file).

## Notes, beats, hands (one 2-core gtr-run slot at a time)

The one note rule frozen for E7 is gaps-paper: `guitar-gaps-paper-version-12200_iterations.pth` from
huggingface.co/xavriley/midi-transcription-models, SHA-256
94a7c936ec9fde83686d29007dc256274384e832739cadece39e92cee3b69a7e (equal to the hub's LFS id), added to
`G/tools/models/SHA256SUMS`, run by the kit's loader with the default thresholds (`notes_guitar.sh --model gaps-paper`,
a new choice; checkpoint iteration 12200, 0 missing and 0 unexpected keys). Each `notes.csv` is the model's MIDI read
with gtr-eval's reader, the way the dev songs' `n-0x/notes.csv` were made (tested: byte-identical on capo n-01 and n-04).

| run | closer: notes, wall s (CPU s), gtr-run | september: notes, wall s (CPU s), gtr-run |
|---|---|---|
| gaps-paper (base) | 1,191, 736.6 (610.8), r1352 [box under load] | 412, 96.9 (167.1), r1360 |
| guitar-gaps | 1,155, 238.7 (325.1), r1353 | 418, 91.5 (164.9), r1361 |
| guitar-fl | 1,233, 254.0 (339.4), r1354 | 421, 97.1 (167.2), r1362 |
| Transkun 2.0.1 (stereo, as n-04) | 1,112, 183.1 (306.4), r1355 | 405, 114.6 (198.1), r1363 |
| Basic Pitch, plain (as n-01) | 1,417, 32.0 (37.9), r1356 | 633, 11.1 (13.7), r1364 |
| Basic Pitch, range | 1,412, 14.7 (22.3), r1357 | 633, 9.5 (13.9), r1365 (same file as plain) |
| Beat This! (`kit/beats.sh`) | 391 beats, 19.2 (21.9), r1358 | 197 beats, 9.0 (15.2), r1366 |
| MediaPipe 1.2.2 hands (as w-01) | 12,316 frames, 333.3 (350.2), r1368 | 4,601 frames, 181.2 (214.4), r1367 |

SHA-256 of gaps-paper's notes: closer dbba46bd810321b01cd9491105a9d712304ebe948c13ad27f866681b0897210c, september
75e8d03ac652bd8fdc0371421158be609b76a4f0b5b6df87b319f4d246716771 (the others in `runs.jsonl`).
- **YourMT3+** was a remote Space: not run. So the held-out alternatives are four models, not five.
- **Basic Pitch's frequency range**: the dev songs' hint range came from the true tuning and capo (lowest open string
  -0.5 semitone to the highest + 20 frets), which a held-out run may not use. Here it comes from the capo and the
  tuning finder's search bounds only (string 6 five semitones below E2, string 1 two above E4): 63.5-1244.5 Hz (closer),
  67.3-1318.5 Hz (september). Note that the loop's dev runs used plain Basic Pitch (n-01) as `bp`, not the hint run,
  so `prep.py` takes the plain one by default; the range run is on disk as `basic-pitch-range`.
- **MediaPipe** failed at first (r1359): this box lacked `libGLESv2.so.2`; `apt-get install libgles2` (1.7.0-1build1)
  fixed it. Two hands in 0.969 (closer) and 0.999 (september) of frames.

## prep.py for held-out songs

New options (`G/loop/tools/loop/prep.py`; the old file kept at `G/work/ho-prep/prep.py.orig`): `--notes-dir <dir>`
(a folder of `<model>/notes.csv`), `--base` (default gaps-paper), `--alts` (default
basic-pitch,guitar-gaps,guitar-fl,transkun, labelled bp, gaps, fl, tk as on the dev songs), `--base-label` (none by
default, as chain-2 on the steel dev songs), `--base-filter hand|none` (default hand when a hand window is given: the
base notes pass through `hand_filter.py`'s own functions with the run's tuning and capo; removed notes go to the
driver side, `<run>/base_removed.csv`), `--audio`, `--video`, `--beats`, `--strings steel|nylon`. `run.json` records
every input file with its SHA-256. Without these options a run is prepared exactly as before. Proof (scratch runs,
blind folders deleted after): the old and new prep with the same arguments, and the new prep fed the dev songs' own
files through `--notes-dir` (chain-2 as the base, n-01..n-05 as the alternatives), wrote identical `candidates.csv`,
`units.json`, `similar.json`, `config.json`, `beats.txt`, sound and `state.json` on capo and on the nylon slot (with
`--base-label gstem --strings nylon`); with the hand on, all 12 blind files were identical but `anchors.json` and
`track.json`, which differ only by the blind folder's own path; the filter path removed the same 112 notes as the
`hand_filter.py` command (Basic Pitch as a test base on capo). A held-out prep of each song (hand off, a dummy tuning)
ran and passed the blind check: closer 87 units, 1,867 candidates; september 44 units, 712.

`blindcheck.py` now also reads `G/heldout/blind-names.json` (titles, artists, players, sources of the held-out songs;
masked in every sandbox) and checks the held-out slot ids as slot names in held-out runs only (prep and driver pass
them); a dev run is checked as before: old and new code gave identical hits on all 46 existing blind folders. The
held-out input files themselves: 0 hits.

## LOOP's audit of the keys

Both PASS (`G/heldout/<S>/key-audit.md`; the key-derived pictures in `G/truth/<S>/key-audit/`).
- gtr-eval check-truth: pitch = tuning + capo + fret everywhere; the one mismatch on each is the audio file not lying
  next to the key (it is in `G/songs/<S>/`).
- Tuning and capo match the player's own statements (Closer's title card: EADGAD, capo 1st fret; September's post:
  D G D G B D, capo 2nd fret). Against the sound, string by string (15 heard notes a string on a constant-Q slice, the
  string retuned -2..+2 semitones): the key's tuning is best on all 12 strings (pass share 0.87 to 1.00 against at most
  0.87 / 0.40 for the next best). Open strings heard: every string that has open notes in the key.
- 20 random key notes a song on a constant-Q slice at the onset: all 35 "tab+audio" notes sound; of 5 "tab" notes
  (not heard by NOTES' checker) 2 show their pitch without a new attack and 3 do not sound, as flagged.
- 10 random notes a song on video frames: Closer 10 of 10 consistent (fingers at the fret and string; four 12th-fret
  harmonics touched over the 13th physical wire, three of them tapped by the picking hand; one picking-hand tap).
  September: no contradiction, but the wide shot resolves only about one fret and cannot show whether an open string
  is left free (6 of the 10 were open strings).
- Notes per conf: closer 1,074 tab+audio, 74 tab, 1 audio; september 377, 38, 2.

## Boats, the third held-out song (ho-boats, 2026-11-27 07:07-08:05 UTC)

Made ready the same way as Closer and September, with the same scripts (ho-prep's `bin/` and ho-blind's scripts, or
copies changed only in song, label and log folder), then put through the same blind hand and finder steps as
`HELDOUT-BLIND.md` describes. Work notes: `G/work/ho-boats/PROGRESS.md`. Nothing here was scored.

| slot | key (NOTES) | capo given | strings | video | sound | key audit |
|---|---|---|---|---|---|---|
| boats | Culture Vannin's Three Little Boats (Manx traditional, arranged by James Franklin), played by Pete Lumb, standard tuning, 232 notes | 0 | nylon | 1920x1080, 25 fps, 67.08 s, 1,677 frames | 67.09 s | PASS |

- **Restore.** From R2 `workbench/guitar-tab-app/heldout/boats/` at 07:10: 21 files, every one matching
  `MANIFEST.sha256` (c873e8a4...), boats.truth.json 5bdcbfad3ea92a54ae3d0a80cb73e3790ecdf4f7d48f6da9c5ec1ead2f2b9b26. In
  `G/songs/boats/` and `G/truth/boats/`.
- **The blind video.** `video.webm` is the whole 4:53 lesson; the key covers NOTES' excerpt of it (213.96 to 281.04 s:
  a slow play-through, then a full-speed performance). `G/heldout/boats/video.mp4` is a plain copy of NOTES' cut
  `boats.mp4` (SHA-256 248ce0ff...), which already carries NOTES' black boxes over the two section captions (frames
  0-182 and 1115-1298) and the end logo (frames 1619-1676). Compared frame by frame with NOTES' unboxed cut: the boxes
  cover every frame where a caption or the logo shows, and the fade frames on either side, looked at full size, show
  nothing. Looked at: 8 frames spread over the video and one a second through the first and last 15 s: no tab, chord
  name, title or logo; the music stand shows only the back of the sheets, illegible. Container tags neutral. The video's
  sound and the WAV line up to the sample (lag 0 at 5, 30 and 55 s).
- **Sound**: `audio.wav` = copy of `boats.wav` (44.1 kHz stereo); `audio.mono.wav` by `ffmpeg -ac 1` (within 1 LSB of
  NOTES' own mono file).
- **Note models, beats, hands** (gtr-run, one slot at a time; ho-prep's `run_inputs.sh`, its copy changed only in the
  landmark call, which now runs the way Closer's rerun r1368 did):

| run | notes / rows | wall s (CPU s) | gtr-run |
|---|---|---|---|
| gaps-paper (base; checkpoint iteration 12200, 0 missing and 0 unexpected keys) | 216 | 70.1 (93.0) | r1371 |
| guitar-gaps | 215 | 59.0 (85.1) | r1372 |
| guitar-fl | 252 | 54.2 (82.1) | r1373 |
| Transkun 2.0.1 (stereo) | 288 | 58.7 (101.5) | r1374 |
| Basic Pitch, plain | 375 | 6.9 (8.2) | r1375 |
| Basic Pitch, range (60.0-1174.7 Hz from capo 0 and the finder's bounds) | 375 (same file as plain) | 5.7 (8.1) | r1376 |
| Beat This! (`kit/beats.sh`) | 78 beats | 5.4 (8.7) | r1377 |
| MediaPipe 1.2.2 hands | 1,677 frames (two hands in 0.849) | 68.5 (71.6) | r1378 |

  SHA-256 of gaps-paper's notes: 71f1f09ad01687f661094e1be745169d86b92e18e34f5c50fcdf2d2b52817512. YourMT3+ not run, as
  for the others. A blind check of copies of every input file: 0 hits. A held-out prep of the song (hand off, a dummy
  tuning, nylon) passed the blind check (24 units, 460 candidates); its blind folder was deleted.
- **Blind names**: `G/heldout/blind-names.json` now also holds the slot id boats and 13 names (titles, source files,
  the publisher, the arranger, the player, the source host, the video id).

**LOOP's audit of the key: PASS** (`G/heldout/boats/key-audit.md`; the key-derived pictures in `G/truth/boats/key-audit/`).
- gtr-eval check-truth: pitch = tuning + capo + fret everywhere (2,449 checks; the one mismatch is the audio file not
  lying next to the key).
- Tuning and capo: the arranger's tab and the lesson page name none (standard, no capo); the video shows no capo at the
  nut. Against the sound, string by string (15 heard notes a string, the string retuned -2..+2 semitones): the key's
  tuning is best on all six strings (pass share 0.87 to 1.00 against at most 0.53). Open strings heard on every string
  (s6 by its octave: this recording has little energy under about 100 Hz).
- 20 random key notes on a constant-Q slice: all 17 "tab+audio" notes sound (four low bass notes 30-51 dB under the
  loudest bin, but their fundamentals rise 4-8 dB and their octaves 9-21 dB at the onset); the 3 "audio" notes (quiet
  left-hand sounds the key added) show their pitch rising 5-7 dB as the string's previous pitch falls. Of all 12 "audio"
  notes, 9 rise; 3 show only the previous pitch stopping.
- 10 random notes on video frames: no contradiction; the key never goes past fret 3 and the hand stays in first position
  at the nut, fingers on the named strings to about one fret; open strings cannot be seen to ring free.
- Notes per conf: 212 tab+audio, 8 tab, 12 audio.

**The blind steps** (labels ho-hand-c and ho-tun-c; map in `G/heldout/blind-map.json`; every run in `sandbox_run.sh` +
`blind_run.sh`, network closed but model requests, Opus 5.5 at max effort, PROMPT.txt inside the folder, copies with
neutral names; each folder passed `blindcheck.py --slots closer,september,boats` and a grep for the names before its run:
0 hits but, in the finder folder, the same 13 'capo' code tokens the dev finder folders had; the hand prompts are the dev
ones with capo 0, the finder prompt is the dev one word for word, its capo being 0 already). The freeze of every tool and
prompt (`G/heldout/freeze-ho-blind.json`, 64 files) was rechecked before the first run and after the last: no file changed.

| run | what | minutes | output tokens | cost (list) | frames looked at | result |
|---|---|---|---|---|---|---|
| ho-hand-c-anchors | anchors | 19.6 | 99,982 | $5.57 | 40 | 11 keyframes, 5 shots; a 2-s close-up of the body (54.68-56.68 s) left without a model on purpose; nylon |
| ho-hand-c-check | check | 8.4 | 49,317 | $2.49 | 17 | 76 decisions: 29 accept, 47 window; no new keyframe |
| ho-tun-c | finder | 9.4 | 51,626 | $2.34 | 9 | 40,45,50,55,59,64 (not scored here) |
| boats | | 37.4 | 200,925 | $10.40 | 66 | all nine held-out runs: 150.9 min, $39.58 |

- **Track** (tool alone) r1379: 87.1 s wall, 102.3 CPU s; null 0.030 (the close-up); self-check median 0.008 of a gap;
  cuts found at 45.6, 49.6, 54.8, 56.8 s. Window at margin 1 before the check: lost 0.031 of rows, mean width 5.62 frets.
- **The check** found, as on Closer, picking-hand tips over the soundhole counted as taps (up to "wire 23" on a 19-fret
  board), plus frames next to the cuts where the model was carried across; it set those stretches to the fretting
  hand's own frets (1-3) and kept the close-up lost. After: lost 0.030, mean width 3.92. Published to
  `G/heldout/boats/hand/` (hand_window.csv SHA-256 dffb0a73ec80a8a2a00829bd9de1d7762bb5f094df5918ff10194c7b061eb2e9).
- **Finder**: `G/heldout/boats/finder.json` (tuning.json SHA-256
  dabcab087b67cb8018dcf2b6419a86177decebe2ee3472f590393299ad4579d9). **Base notes** after the hand filter with it:
  216 -> 216 (0 removed, 10 onsets in lost rows), `G/heldout/boats/notes/gaps-paper-hf/`.
- **Audits**: the dev audits and ho-blind's independent second audit, all three clean (paths outside the folders only
  the runs' own task output or scratchpad in the sandbox's private /tmp and the system python3 on their own files).
  Rows added to `G/heldout/blind-runs.json`. A fix there: ho-blind's `record.py` read none of the held-out names (it
  kept only plain strings, and the names file holds [kind, name] pairs), so its "names mentioned" counts scanned
  nothing; rescanned with all 32 names, none of the nine transcripts names a held-out title, artist or player.
