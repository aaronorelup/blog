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
