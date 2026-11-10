# web-tab-render: trials

Lane agent `try-web-tab-render`, 2026-11-10 (UTC). What was installed and run on the shared box (4 vCPU Xeon 2.10 GHz,
15 GiB RAM, no GPU), on the shared inputs in `/home/user/gtr/inputs/`, and what came out.

Conventions used in this file:

- **Run ids** (`rNNNN`) are lines in `/home/user/gtr/ledger/runs.jsonl` written by `gtr-run`. Runs marked
  "2 cores" were pinned to one 2-core slot. Runs marked **"--nolock"** were logged by `gtr-run --nolock`: not pinned and
  not given a slot, so they ran while up to two pinned jobs of other lanes used the CPUs; their times are for
  reference only. Light runs (under 3 s) used `--nolock` because the slot queue was 2 to 8 minutes long at the time.
- **Eval ids** (`eNNNN`) are lines in `/home/user/gtr/eval/ledger/evals.jsonl` written by `gtr-eval` 0.8.x;
  `gtr-eval ledger --id eNNNN --full` prints the whole result with the definitions of every number.
  `tab` numbers: matched = truth and estimate notes with onsets within 50 ms and the same MIDI pitch (mir_eval
  `match_notes`, onset tolerance 0.05 s, pitch tolerance 50 cents); "same string and fret" = matched pairs with the same
  string and fret / matched pairs. `notes` numbers: mir_eval transcription onset-only and onset+offset F1 with the same
  tolerances (offset: 20 percent of the note length or 50 ms).
- **String numbers**: the truth files, Guitar Pro, alphaTex, VexTab, MusicXML and ASCII tab count string 1 = the
  highest string. alphaTab's data model counts the other way (see alphaTab below).
- Test pages are served from `127.0.0.1:8765` by `scripts/serve.cjs`; every page and driver script is in `scripts/`.
  Browser: the box's pre-installed Playwright 1.63.0 with its headless Chromium (`/opt/node-tools/node_modules/playwright`,
  browsers in `/opt/pw-browsers`, `chromium.launch()` with no options except
  `--autoplay-policy=no-user-gesture-required` for the player runs). Node 22.23.4.
- npm packages were installed into `/home/user/gtr/lanes/web-tab-render/web/` with one command (14 s, 76 packages,
  189 MB of `node_modules` in total): `npm install --no-audit --no-fund @coderline/alphatab@1.9.0 vexflow@5.0.0
  vextab@4.0.5 opensheetmusicdisplay@2.3.0 abcjs@6.7.2 verovio@6.4.1 svguitar@2.10.1 vexchords@1.2.0
  chordsheetjs@18.0.0 tonal@6.5.1` (the versions were the `latest` tags on registry.npmjs.org on 2026-11-10;
  `npm ls` output: `samples/npm-ls.txt`).

## alphaTab 1.9.0 (npm `@coderline/alphatab`)

- **What it is:** a TypeScript library (also built for .NET and Android) that imports Guitar Pro, MusicXML, CapXML and
  alphaTex, renders standard notation and tablature (SVG or canvas), and plays the score with its own SoundFont
  synthesizer (alphaSynth). Package https://www.npmjs.com/package/@coderline/alphatab, version 1.9.0 (npm metadata
  `time.modified` 2026-11-09T06:15:16Z), installed 2026-11-10. The intro page https://alphatab.net/docs/introduction
  (read 2026-11-10) says: "alphaTab is an SDK for rendering and playing interactive music notation." and "alphaTab is
  not a ready-made component you drop onto a page. It gives you the pieces to build the score view your application
  needs — the toolbar, the track selector, the transport controls, and the layout around the sheet are yours to
  design."
- **License as shipped in the package:** `package.json` `"license": "MPL-2.0"`; the package's `LICENSE` file begins
  "alphaTab is licensed under MPL-2.0." (read from `node_modules/@coderline/alphatab/LICENSE`, 2026-11-10). The
  bundled SoundFont folder `dist/soundfont/` (Sonivox, `sonivox.sf2` 1,351,896 bytes and `sonivox.sf3` 977,208 bytes)
  and font folder `dist/font/` (Bravura, with `Bravura-OFL.txt`) carry their own license files; their clauses are in the
  docs agent's survey.
- **Install:** the npm command above. Package size on disk 14 MB; `dist/alphaTab.min.js` (UMD) 1,208,042 bytes,
  `dist/alphaTab.core.min.mjs` 1,205,548 bytes, worker and worklet entry files about 1.4 KB each. No model weights.

### Run 1: Node.js without a DOM, reading and writing the score model

- Script `scripts/alphatab_node_model.cjs` (plain `require('@coderline/alphatab')` under Node 22, no browser, no
  jsdom). It loads a file with `alphaTab.importer.ScoreLoader.loadScoreFromBytes()` (alphaTex text through
  `AlphaTexImporter` so its diagnostics can be recorded), walks `score.tracks[].staves[].bars[].voices[].beats[].notes[]`,
  computes each note's onset from `bar.masterBar.start + beat.playbackStart` (MIDI ticks, 960 per quarter) and the
  tempo automations, writes the MIDI that alphaTab's own `MidiFileGenerator` produces (`MidiFile.toBinary()`),
  exports the score with `exporter.Gp7Exporter` (.gp) and `exporter.AlphaTexExporter` (alphaTex), and re-imports both.
- Runs: S2n.gp5 r0020 (2 cores, wall 0.30 s, CPU 0.2 s, peak RSS 83.1 MB, exit 0); S5capo2.gp5 r0026 (2 cores, wall
  0.22 s); S5dropd.gp5 r0030 (2 cores, wall 0.31 s). Inside the script, for S2n (r0020, the script's own cumulative
  timer): import done at 12.2 ms, MIDI at 24.3 ms, GP7 export and re-import at 103.0 ms, alphaTex export and re-import at
  119.7 ms. Earlier runs r0017 and r0018 on S2n had a bug in my tick-to-seconds code (all onsets came out 0); their
  outputs were replaced.
- **What a program can read** from the model (S2n.gp5, `samples/alphatab/S2n.model.json`): title, artist, tempo 112
  with tempo label "Moderate", 13 master bars in 4/4 (bar 0 = the silent count-in bar), two tempo automations of 112 on
  bar 0 (both present in the file), one track "Guitar", MIDI program 24, one staff with `showTablature` true and
  `showStandardNotation` true, `tuning` [64, 59, 55, 50, 45, 40] (top tab line first), tuning name "Guitar Standard
  Tuning", `capo` 0, `transpositionPitch` 0, `displayTranspositionPitch` -12, 2 voices per bar, 92 beats of which 2 are
  rests, 90 notes. Per note: `string`, `fret`, `realValue` (sounding MIDI pitch), tie and dead-note flags, and the beat's
  tick position and duration. S5capo2.gp5 reads back with `capo` 2; S5dropd.gp5 with `tuning` [64, 59, 55, 50, 45, 38]
  and tuning name "Guitar Dropped D Tuning".
- **String numbering:** alphaTab's `Note.string` documentation (in `dist/alphaTab.d.ts`) says "1 is the lowest string
  on the guitar and the bottom line on the tablature." The truth files and Guitar Pro use 1 = highest string; the
  script converts with `string = number_of_strings - note.string + 1`. alphaTex text uses 1 = highest string (the
  exported alphaTex writes the open G3 of bar 1 as `0.3.4`, fret.string.duration).
- **Checked against the truth with gtr-eval `tab`** (the note list the script read from alphaTab's model, with the
  model's tuning and capo):

  | input | read by alphaTab | after .gp (GP7) export and re-import | after alphaTex export and re-import |
  |---|---|---|---|
  | S2n.gp5 | 90/90 matched, 90/90 same string and fret (e0004) | 90/90, 90/90 (e0005) | 90/90, 90/90 (e0006) |
  | S5capo2.gp5 | 90/90, 90/90, capo 2 read (e0008) | 90/90, 90/90, capo 2 (e0009) | 90/90, 90/90, capo 2 (e0010) |
  | S5dropd.gp5 | 90/90, 90/90, tuning [38,45,50,55,59,64] read (e0012) | 90/90, 90/90 (e0015) | 90/90, 90/90 (e0016) |

  gtr-eval reports `tuning_differs: false` and `capo_differs: false` in all nine. (gtr-eval itself cannot open a .gp
  file: its README says PyGuitarPro cannot read Guitar Pro 6/7/8 files. The .gp column is alphaTab reading its own
  export; other readers of that file are in the format matrix below.)
- **MIDI written by alphaTab** (`samples/alphatab/S2n.alphatab.mid`, 1,255 bytes): Standard MIDI File format 0, one
  track, 960 ticks per quarter, tempo 112, program 24, 90 notes, the first notes with velocity 95, 90 pitch-bend events
  and 9 control changes. gtr-eval `notes` on S2n: onset F1 1.0 and onset+offset F1 1.0, 90/90 matched, median onset
  difference -0.008 ms (e0007); S5capo2 and S5dropd the same (e0011, e0017).
- **alphaTex exported by alphaTab** (`samples/alphatab/S2n.export.atex`, 2,244 characters): starts with `\artist`,
  `\wordsandmusic`, `\title`, then `\track ("Guitar" "Guitar") { color "#FF0000" volume 13 balance 8 instrument
  acousticguitarnylon }`, `\staff { score tabs }`, `\tuning (E4 B3 G3 D3 A2 E2) { hide label "Guitar Standard Tuning" }`,
  then one `\voice` block per voice with notes as `fret.string.duration`. The capo file exports `\capo 2`; the Drop D
  file `\tuning (E4 B3 G3 D3 A2 D2)`.

### Run 2: alphaTex written from the truth JSON

- Script `scripts/truth_to_alphatex.py` (stdlib only, written for this trial) turns `<id>.truth.json` into alphaTex:
  one track, `\staff {score tabs}`, `\tuning` from the truth, `\capo` when the truth has one, one `\voice` per truth voice
  (melody, bass), onsets on a 16th-note grid, `fret.string` notes, chords in parentheses, rests for gaps. Output for
  S2n: 864 bytes, 13 bars (`samples/alphatab/S2n.truth.atex`; also S5capo2 and S5dropd).
- Parsed by alphaTab under Node: r0043 (S2n), r0045 (S5capo2), r0046 (S5dropd), all --nolock, wall 0.39 to 0.54 s.
  A first version with a `.` line after the metadata and `\ts 4 4` without parentheses parsed, with two parser
  diagnostics: "The dots separating score metadata, score contents and the sync points can be removed." (severity 0)
  and "Metadata arguments should be wrapped into parenthesis." (severity 1); the final version gives no diagnostics.
- gtr-eval `tab` of the parsed result: S2n 90/90 matched, 90/90 same string and fret (e0024); S5capo2 90/90, 90/90,
  capo 2 (e0026); S5dropd 90/90, 90/90 (e0028). gtr-eval `notes` of alphaTab's MIDI from that alphaTex: onset F1 1.0
  for all three (e0025, e0027, e0030).

### Run 3: rendering in headless Chromium

- Page `scripts/pages/alphatab.html` (UMD `alphaTab.js`, `core.fontDirectory` pointing at the bundled Bravura fonts,
  workers on, page layout, scale 1), driver `scripts/shot.cjs` (waits for `postRenderFinished`, full-page PNG).
- Runs (all --nolock): S2n.gp5 r0059 (703 ms from page load to render finished); S5capo2.gp5 r0066 (1,434 ms);
  S5dropd.gp5 r0067 (1,140 ms); alphaTex from the S2n truth r0068 (861 ms); alphaTex from the S5capo2 truth r0070
  (1,111 ms). No console errors in any of them.
- What was drawn (screenshots `samples/alphatab/*.webp`): a standard-notation staff above a six-line TAB staff, 13 bars
  in three systems at 1,200 px width; the bass voice drawn in grey in both staves; tempo mark "Moderate ♩ = 112" (gp5) or
  "♩ = 112" (alphaTex); a dynamic "f" under bar 1. For the three .gp5 files no title and no tuning name were drawn; for
  the alphaTex files the title, the subtitle, "Guitar Standard Tuning" and (S5capo2) "Capo. fret 2" were drawn. In the
  capo render the standard notation shows the sounding pitches (A major, with sharps as accidentals because the
  alphaTex sets no key signature) while the TAB shows frets counted from the capo (the same numbers as S2n). In the
  Drop D render the two bass notes moved by the tuning show as 5 and 0 on the lowest line. Every render has a small
  "alphaTab.net" text at the top right.

### Run 4: the player (alphaSynth) in headless Chromium, and offline audio export

- Driver `scripts/alphatab_player.cjs`: loads the page with `player.enablePlayer: true`, `playerMode:
  EnabledSynthesizer` and the bundled `sonivox.sf2`; waits for `playerReady`; sets `api.midiEventsPlayedFilter =
  [128, 144, 242]`; calls `api.play()`; records every event with the page time at which its handler ran; after
  `playerFinished` it calls `api.exportAudio()` with 44.1 kHz and writes the rendered samples to a WAV.
  Analysis: `scripts/analyze_player_log.py`. Results: `samples/alphatab/S2n_plain.summary.json` and
  `S2n_plain.events.csv` (one row per event).
- Run r0128 (2 cores, waited 490.6 s for a slot; wall 53.81 s including browser start, 28 s of playback and the export;
  CPU 14.9 s; peak RSS 737.8 MB; exit 0). Input S2n.gp5. Headless Chromium had `AudioContext` and `AudioWorkletNode`;
  playback ran (no audio device was attached; nothing was listened to).
- **Events emitted** during one play-through (count): `playerPositionChanged` 2,409; `playedBeatChanged` 49;
  `activeBeatsChanged` 49; `midiEventsPlayed` events of type 128: 90 (one per note: the note-ons), type 144: 88 (note
  offs; 2 fewer than the notes), type 242 (metronome): 52 = 13 bars x 4 beats, reported although `metronomeVolume`
  was 0; `playerStateChanged` 5; `playerFinished` 1, 27,994 ms after `play()`. alphaTab's `dist/alphaTab.d.ts` declares
  `NoteOn = 128` and `NoteOff = 144` with the comment "Aligned with Midi 1.0" (in the MIDI 1.0 status bytes, 0x80 = 128
  is note off and 0x90 = 144 is note on); the counts above show type 128 arriving once per note.
  `playedBeatChanged` gives the Beat object (bar, voice, tick, notes with string, fret, pitch); `activeBeatsChanged`
  gives all beats sounding at that moment across voices; `playerPositionChanged` gives currentTime (ms),
  endTime 27,857.14 ms, currentTick, endTick 49,920.
- **Timing against the truth** (definition: event page time minus the page time of `api.play()`, minus the nominal song
  time of the event's tick = tick/960 x 60/112 s; the GP5 file's tick 0 is the clip's sample 0, so the nominal time of
  each note-on equals its truth onset): note-on events (type 128, n = 90): median +130.8 ms, min +121.9, max +139.1,
  standard deviation 4.7 ms. `playedBeatChanged` (n = 49): median +154.9 ms, min +29.2 (the rest beat at tick 0),
  max +167.3. `playerPositionChanged` (n = 2,400 between `play()` and `playerFinished`, seek events left out): wall time
  since `play()` minus the reported `currentTime`: median +126.5 ms, min +120.9, max +176.2, standard deviation 3.6 ms.
  Metronome event spacing (n = 51 intervals, nominal 535.7 ms): median 530.4, min 524.4, max 551.9 ms. These are page
  event times under a 2-core slot on a shared box without an audio device, not measured audio output latency.
- **Offline export** (`api.exportAudio`, same run): 371.6 ms of page time for 2,457,088 float samples (1,228,544
  stereo frames = 27.858 s at 44.1 kHz, the score's length without the clips' 1.5 s tail). The first sample above
  1e-4 in absolute value is frame 94,464 = 2.14204 s; the truth's first onset is 2.142857 s = frame 94,500 (94,464 =
  1,476 x 64). Peak 0.371. WAV kept outside git (see "Media kept outside git").

### Run 5: editing hooks (alphaTab ships no editor UI)

- Checked: the alphaTab intro page quoted above, which contains neither "edit" nor "editor"; in `dist/alphaTab.d.ts` the
  word "editor" appears 5 times, in comments such as "This method can be used in applications when individual notes
  need to be played for lesson or editor style purposes." (`playNote`) and "This property is purely informative for
  external use like in editors." No editor component or editing UI was found in the package.
- Driver `scripts/alphatab_edit.cjs`: renders S2n.gp5 with `core.includeNoteBounds`, clicks with the mouse at the centre
  of the note-head bounds that `api.boundsLookup.findBeat()` returns for the first melody note of bar 1, then sets that
  note's `fret` from 0 to 2 in the data model, calls `api.render()`, and exports `Gp7Exporter` and `AlphaTexExporter`
  output from the page.
- r0132 (--nolock, player off): the click produced no `noteMouseDown` event; the model edit changed the note to fret 2,
  `realValue` 57 (was 55), re-rendered, and the exported .gp (4,983 bytes) re-imported under Node shows string 3, fret
  2, pitch 57 at 2.142857 s (`out/alphatab-edit/S2n.edited.est.json`). Screenshot after the edit:
  `samples/alphatab/S2n_edited_bar1_fret2.webp`.
- r0133 (--nolock, player on, click before `playerReady`): no mouse event. r0134 (--nolock, player on, click after
  `playerReady`, `beatMouseDown` also logged): one `beatMouseDown` event for bar 1, voice 1 (the bass voice), beat 0;
  no `noteMouseDown`. Not investigated further.

### Output and input format facts (for handoffs)

- In: the intro page says "Feed it a Guitar Pro, MusicXML, CapXML, or alphaTex file". Tried here: .gp5 (3 files),
  alphaTex (6 files), alphaTab's own .gp export, and MusicXML (see the format matrix).
- Out: Guitar Pro 7 `.gp` (`exporter.Gp7Exporter`), alphaTex text (`exporter.AlphaTexExporter`), SMF MIDI
  (`midi.MidiFileGenerator` + `MidiFile.toBinary()`), rendered SVG/canvas in the page, PCM float audio
  (`api.exportAudio`). No MusicXML or MEI exporter in `exporter` (it lists `AlphaTexExporter`, `Gp7Exporter`,
  `ScoreExporter`).
- Constraint fields a human-in-the-loop re-run would set (in the model or as alphaTex): `Staff.capo`,
  `Staff.stringTuning` / `\tuning`, `\capo`, `Note.string` and `Note.fret`, `Staff.transpositionPitch` and
  `displayTranspositionPitch`, `api.changeTrackTranspositionPitch()`, `api.playbackSpeed`, `api.metronomeVolume`,
  `api.countInVolume`, `api.playbackRange`, `api.isLooping`.

## VexFlow 5.0.0 (npm `vexflow`), TabStave and TabNote

- **What it is:** a JavaScript library that draws music notation and tablature from code (no file importer).
  https://www.npmjs.com/package/vexflow, version 5.0.0 (npm `time.modified` 2025-03-05), installed 2026-11-10.
  License file in the package begins "VexFlow - A JavaScript library for rendering music notation." and continues with
  the MIT text "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
  associated documentation files ..." (`node_modules/vexflow/LICENSE`, read 2026-11-10). Package 22 MB on disk;
  `build/cjs/vexflow.js` (UMD with the music fonts) 1,128,380 bytes.
- **Run:** page `scripts/pages/vexflow.html` fetches `S2n.truth.json` and draws one `TabStave` per bar (4 per line),
  two `Voice`s (melody, bass) of `TabNote`s with `positions: [{str, fret}]` (string 1 = highest), `GhostNote`s for rests,
  `Formatter.joinVoices().format()`, SVG backend; `VexFlow.loadFonts('Bravura', 'Academico')` first. r0110 (--nolock):
  1,062 ms from page load to done, 275 ms inside the drawing code, 13 bars, 90 note positions drawn, SVG 25,408
  characters, no console errors. Screenshot `samples/vexflow/S2n_tabstave.webp`: six-line TAB staves with the fret
  numbers of both voices in their columns and a "TAB" clef at the start of each line; no standard notation (not
  requested), no stems, no title, no tempo.
- **Input it needed:** nothing but code: every note's string, fret and duration, and the bar layout, are supplied by
  the program. No importer for Guitar Pro, MusicXML or alphaTex; no playback.
- **Constraint inputs:** none (it draws what it is given). TabStave takes the number of lines; tuning is not part of
  TabNote (the program chooses string and fret).

## VexTab 4.0.5 (npm `vextab`)

- **What it is:** a text language for notation and tablature, parsed and drawn with VexFlow.
  https://www.npmjs.com/package/vextab, version 4.0.5 (npm `time.modified` 2026-01-18), depends on `vexflow ^5.0.0`.
  The package's `LICENSE` (read 2026-11-10 from `node_modules/vextab/LICENSE`) says: "VexTab is an open specification
  and the reference implementation (this repository) is open source. It is freely available complete and uncrippled for
  non-commercial use." and "If you would like to use this code on commercial websites, products, blogs, plugins, or
  tools, please get in touch with me. (I'm very reasonable.)"; `package.json` gives `"license": "LicenseRef-LICENSE"`.
  Package 44 MB on disk; `dist/main.prod.js` 1,231,476 bytes.
- **Run:** `scripts/truth_to_vextab.py` (stdlib, written for this trial) turns the truth JSON into VexTab: one
  `tabstave notation=true tablature=true tuning=standard|dropd key=G` per 4 bars, a `voice` per truth voice, notes as
  `:q 0/3` (duration, fret/string, string 1 = highest), chords `(3/6.0/3)`, rests `##` (`samples/vextab/S2n.vextab`,
  1,072 bytes). Page `scripts/pages/vextab.html` parses it with `new VexTab(new Artist(10, 10, 1200)).parse()` and draws
  with `artist.render()` into SVG. S2n r0109 (--nolock): 1,352 ms page load to done, 150 ms inside parse and render,
  4 staves, SVG 70,499 characters; S5dropd (`tuning=dropd`) r0144: 730 ms, 149 ms. Console line: "Running VexTab.Div:
  4.0.3-5-g3a5e00d master 3a5e00d858ae98934ba545f9bef5eb923e17e402". Screenshots `samples/vextab/*.webp`: standard
  notation with a G-major key signature above each TAB staff, 13 bars on 4 lines, both voices drawn with stems up in
  the notation staff, "vexflow.com" printed at the bottom.
- **Input it needed:** VexTab text (my generator); no Guitar Pro or MusicXML importer. `tabstave` options include
  `tuning` with values "standard, dropd, eb, E/5,B/4,G/4,D/4,A/3,E/3" (the package's `doc/tutorial.html`); the
  tutorial and source have no capo option (searched for "capo" in `doc/tutorial.html`, `src/vextab.ts`,
  `src/artist.ts`: no hits).
- **Oddities:** the source has a `player.ts` (an overlay player) but it was not tried.

## Reference MusicXML with a TAB staff, written from the truth (input made for this lane)

- `scripts/truth_to_musicxml.py` (stdlib, written for this trial) writes MusicXML 4.0 from a truth JSON: one part,
  `<staves>2</staves>`, staff 1 a G clef with `<clef-octave-change>-1</clef-octave-change>`, staff 2 a
  `<clef><sign>TAB</sign>` staff with `<staff-details>` holding `<staff-lines>6</staff-lines>`, six `<staff-tuning
  line="n">` (line 1 = lowest string) and `<capo>` when the truth has one; every note written on both staves, the TAB
  copy with `<technical><string>/<fret>`; `<pitch>` is the sounding pitch; `<sound tempo>`. `--tab-only` writes only
  the TAB staff. Files: `samples/musicxml-from-truth/` (S2n 35,537 bytes; S5capo2; S5dropd; S2n tab-only 22,056 bytes).
  `xmllint --noout` reports no errors (well-formedness only; not validated against the XSD).
- gtr-eval `tab` reads them back: S2n 90/90 matched, 90/90 same string and fret, tuning "stated in the estimate file"
  (e0195); S5capo2 the same with capo 2 "stated in the estimate file" (e0196); S5dropd the same with tuning
  [38,45,50,55,59,64] (e0197). gtr-eval counts the 90 staff-1 copies as `n_est_without_position`.
- These files are the "MusicXML with string and fret" input for the OSMD, Verovio and alphaTab-import trials below,
  and for the format matrix.

## music21 10.5.2 (PyPI `music21`)

- **What it is:** a Python toolkit for symbolic music (parsers and writers for MusicXML, MIDI, ABC, Humdrum, MEI
  import and others). https://pypi.org/project/music21/ 10.5.2, installed 2026-11-10 into
  `/home/user/gtr/lanes/web-tab-render/venv-py` (Python 3.11) with `uv pip install music21 pyguitarpro` (0.7 s from the
  shared cache; venv 248 MB, mostly hard links into the shared uv cache; `samples/music21/uv-pip-freeze.txt`).
- **Run:** `scripts/music21_truth_to_musicxml.py` builds a `stream.Score` from `S2n.truth.json`: one Part, a Measure per
  bar, one `stream.Voice` per truth voice, each note with `articulations.StringIndication(string)` and
  `articulations.FretIndication(fret)`, then `score.write('musicxml')` and `converter.parse()` of the result.
  r0153 (--nolock, wall 1.64 s, CPU 1.3 s, RSS 69.9 MB): treble-8vb clef version, 39,915 bytes, 90 notes written,
  90 read back with string and fret, write 0.063 s, read 0.025 s. r0154 (--nolock, wall 0.94 s): `--tab-only` version
  with `clef.TabClef()` and `layout.StaffLayout(staffLines=6)`: 40,024 bytes; the file has `<clef><sign>TAB</sign>
  <line>5</line></clef>` and `<staff-details print-object="yes"><staff-lines>6</staff-lines></staff-details>`.
- **Output format facts:** MusicXML 4.0 partwise (`<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0
  Partwise//EN"`), divisions 10080 per quarter, `<technical><string>` and `<fret>` on every note, voices 1 and 2 with
  `<backup>`. No `<staff-tuning>` and no `<capo>`: the exporter source (`music21/musicxml/m21ToXml.py`, the function
  that writes `<staff-details>`) ends with the comments "# TODO: staff-tuning", "# TODO: capo", "# TODO: staff-size".
- gtr-eval: `tab` 90/90 matched and 90/90 same string and fret for both files, with the tuning and capo "not stated in
  the estimate; the truth tuning is assumed" (e0191, e0193); `notes` onset F1 1.0 (e0192, e0194).
- Not tried here: music21's ABC, MEI or Humdrum paths for tab; music21 has no Guitar Pro reader (not in its
  converter list; not checked further).

## OpenSheetMusicDisplay 2.3.0 (npm `opensheetmusicdisplay`)

- **What it is:** a MusicXML renderer for the browser built on VexFlow. https://www.npmjs.com/package/opensheetmusicdisplay
  2.3.0 (npm `time.modified` 2026-11-07), installed 2026-11-10. `LICENSE` in the package: "Copyright 2019 PhonicScore"
  then "Redistribution and use in source and binary forms, with or without modification, are permitted provided that
  the following conditions are met:" (BSD 3-clause text; `package.json` says `BSD-3-Clause`). Package 17 MB;
  `build/opensheetmusicdisplay.min.js` is the UMD build used.
- **Runs:** page `scripts/pages/osmd.html` (`new OpenSheetMusicDisplay(div, {backend: 'svg', drawTitle: true})`,
  `load(xmlString)`, `render()`; then it counts notes and notes with `StringNumberTab`/`FretNumber` in OSMD's model).
  All --nolock:

  | input | run | load / total ms in page | staves OSMD built | notes | notes with string+fret |
  |---|---|---|---|---|---|
  | reference 2-staff MusicXML, S2n | r0158 | 80.5 / 205.5 | standard + tab | 180 | 90 |
  | reference 2-staff MusicXML, S5capo2 | r0159 | 77.8 / 195.1 | standard + tab | 180 | 90 |
  | reference tab-only MusicXML, S2n | r0160 | 66.3 / 146.7 | tab | 90 | 90 |
  | music21 tab-only MusicXML (no staff-tuning) | r0161 | 81.5 / 162.0 | tab | 90 | 90 |
  | MuseScore 3.2.3's MusicXML of S2n.gp5 | r0163 | 56.1 / 142.0 | standard | 90 | 0 |

  No console errors. Screenshots `samples/osmd/*.webp`: TAB staves are drawn with an italic "TAB" clef and the fret
  numbers of both voices; the 2-staff files are drawn as a braced notation + TAB system with both voices, stems split
  by voice in the notation staff, measure numbers from 0 (the files number the count-in bar 0). For S5capo2 the
  notation staff shows three sharps (the reference file's key) and no capo text is drawn anywhere. The music21 file
  shows its title twice (work title and movement title) and "Music21" as the composer line.
- **Input it needed:** MusicXML (also `.mxl`); a TAB staff is drawn when the part's clef is `TAB`; string and fret come
  from `<technical>`. The typings document `load(content)` as: "content is either the url of a file, or the root node
  of a MusicXML document, or the string content of a .xml/.mxl file, or a file blob." (`build/dist/src/
  OpenSheetMusicDisplay/OpenSheetMusicDisplay.d.ts`). Playback was not tried.

## Verovio 6.4.1 (npm `verovio`, WebAssembly)

- **What it is:** an engraving library for MEI (also reads MusicXML, Humdrum, ABC, Plaine & Easie and others) that
  writes SVG, MEI, MIDI and a timemap, compiled to WebAssembly for JavaScript. https://www.npmjs.com/package/verovio
  6.4.1 (npm `time.modified` 2026-11-03), toolkit `getVersion()` "6.4.1-fbe8f46"; `package.json` `"license":
  "LGPL-3.0-only"` (read 2026-11-10; the package ships no LICENSE file). Package 27 MB; `dist/verovio-module.mjs`
  7,400,749 bytes (the WASM module embedded), `verovio-module-hum.mjs` (with Humdrum) 12,992,427 bytes.
- **Input made for it:** `scripts/truth_to_mei.py` (stdlib) writes MEI 5 guitar tablature from the truth JSON following
  the MEI Guidelines v5 tablature chapter (https://music-encoding.org/guidelines/v5/content/tablature.html, read
  2026-11-10): `<staffDef lines="6" notationtype="tab.guitar">`, `<tuning>` with `<course n pname oct>`,
  `<tabGrp dur><tabDurSym/><note tab.course tab.fret/></tabGrp>`, rests as a `tabGrp` with only a `tabDurSym`, one
  `<layer>` per voice (`samples/verovio/S2n.truth.mei`, 8,573 bytes). The guidelines' standard-tuning example numbers
  the courses 1 = e4 to 6 = e2.
- **Runs** (`scripts/verovio_render.cjs`, plain Node, ESM import of `verovio/wasm` and `verovio/esm`; options
  pageWidth 2100, scale 40, adjustPageHeight; all --nolock):

  | input | run | WASM init / render ms | pages | what Verovio exported |
  |---|---|---|---|---|
  | MEI tab from the S2n truth | r0165 | 656 / 156 | 1 | MEI with 92 `tabGrp`, 90 `tab.course`; MIDI 782 bytes; timemap 50 entries |
  | reference 2-staff MusicXML, S2n | r0166 | 658 / 242 | 1 | MEI with 2 staffDefs, the second `notationtype="tab.guitar"` with 6 courses e2 a2 d3 g3 b3 e4, 90 `tab.course`; MIDI 1,553 bytes |
  | reference tab-only MusicXML, S2n | r0167 | 628 / 112 | 1 | MEI with 1 tab staffDef, 90 `tab.course` |
  | reference 2-staff MusicXML, S5capo2 | r0174 | 805 / 152 | 1 | MEI with the tab staff and tuning; the word "capo" appears only in the title |
  | MuseScore 3.2.3's MusicXML of S2n.gp5 (no TAB staff) | r0168 | 702 / 128 | 1 | MEI with 1 standard staffDef, no tab |

  Peak RSS 175 to 218 MB per run. `getLog()` was empty in all runs. Screenshots (`samples/verovio/*.webp`, SVG inlined
  in a page and captured in Chromium): the MEI tab renders as a six-line TAB staff with rhythm stems above (layer 1)
  and below (layer 2), a 4/4 sign and no "TAB" clef sign; the 2-staff MusicXML renders as a braced treble-8vb +
  TAB system with "TAB" clef, both voices, tab rhythm stems and the count-in bar's rests.
- **Checks with gtr-eval** (my `scripts/mei_tab_to_json.py` reads the MEI tab staff, its course tuning and the
  durations into the JSON gtr-eval reads, at 112 BPM; gtr-eval itself has no MEI reader): MEI written from the truth
  90/90 matched, 90/90 same string and fret (e0361); Verovio's own MEI export of it 90/90, 90/90 (e0362); Verovio's
  MEI export of the 2-staff MusicXML 90/90, 90/90 (e0363); of the tab-only MusicXML 90/90, 90/90 (e0364). S5capo2:
  the exported MEI has no capo, so read with capo 0 the pitches come out 2 semitones low and 0/90 match (e0365);
  read with `--capo 2` supplied by hand, 90/90 matched and 90/90 same string and fret (e0366). The notation staff of
  that export keeps the sounding pitches (A3 for the first melody note).
- **MIDI from Verovio:** from the MEI tab: 90 notes, onset F1 1.0, onset+offset F1 0.556 (e0307); from the 2-staff
  MusicXML: 180 notes (both staves are played), onset precision 0.5, recall 1.0 (e0324). Timemap entries carry
  `qstamp` (quarter notes), `tstamp` (ms; first notes at 2143 ms), `tempo` and the xml:ids of notes switched on and
  off.
- **Constraint inputs:** tuning through `<tuning>`/`<course>` (or `tuning.standard`); no capo element was used or
  produced here.

## MuseScore 3.2.3 command line (Ubuntu package `musescore3`)

- **What it is:** the MuseScore notation program; its executable converts files without a window with `-o`.
  Ubuntu 24.04 package `musescore3` 3.2.3+dfsg2-16build5 (Installed-Size 19,933 KB, plus `musescore3-common`),
  installed 2026-11-10 with `flock /home/user/gtr/locks/apt.lock apt-get install -y --no-install-recommends musescore3
  lilypond tuxguitar` (all three packages and their dependencies: 25 s; about 100 MB of downloads; the three were
  installed together). License: not quoted here (Debian package; see the docs agent's survey).
- **Run setting:** `QT_QPA_PLATFORM=offscreen` is required; without it: "qt.qpa.xcb: could not connect to display" and
  "This application failed to start because no Qt platform plugin could be initialized." Command form:
  `mscore3 -o <out.ext> <in>`, the output format chosen by the extension.
- **Runs on S2n.gp5** (all --nolock, exit 0, peak RSS about 80 MB, 147 MB for PNG): MusicXML r0120 (0.47 s, 29,404
  bytes), compressed MusicXML .mxl r0121 (0.48 s, 2,360 bytes), MIDI r0122 (0.26 s, 689 bytes), PDF r0123 (0.53 s,
  33,121 bytes), PNG r0124 (0.91 s, `S2n-1.png`, 2480x3508), MuseScore .mscx r0125 (0.47 s). Log lines: "convert
  </home/user/gtr/inputs/S2n/S2n.gp5>...", "measures 13 bars.size 13", "... success!".
- **What the import produced:** one standard-notation staff in treble clef (no "8" under it), no TAB staff
  (`samples/musescore3/S2n_gp5_page1.webp`); the two Guitar Pro voices are kept as voices 1 and 2 (43 and 49 `<note>`
  elements including rests). The .mscx stores `<fret>` and `<string>` on each note (270 `<fret>` lines; string numbers
  counted from 0 = highest) and the staff's open strings 40 45 50 55 59 64, but the MusicXML export has no
  `<technical><string>/<fret>`, no `<staff-tuning>` and no TAB clef: gtr-eval `tab` refuses it with "MusicXML has no
  part with <string>/<fret> technical marks" (e0141). MIDI: 90 notes, 480 ticks per quarter, velocity 80, gtr-eval
  `notes` onset F1 1.0 (e0145).
- **Capo and tuning from Guitar Pro 5:** S5capo2.gp5 (r0176 MusicXML, r0187 .mscx, r0190 MIDI): the capo becomes a
  staff text "Capo. fret 2"; the note pitches in the .mscx are 55, 55, 62 ... (the S2n pitches, not the sounding
  S5capo2 pitches 57, 57, 64); the MIDI matches 0/90 truth notes (e0374) and 90/90 when 2 semitones are added to every
  pitch (e0376). S5dropd.gp5 (r0177, r0188, r0191): the .mscx string tuning is 38 45 50 55 59 64 and the MIDI matches
  90/90 (e0378).
- **Guitar Pro 7 (.gp):** alphaTab's `.gp` export of S2n is refused (r0178, exit 1): "unknown file suffix <gp>" /
  "Cannot read file ... unknown type".
- **MusicXML with a TAB staff in, MusicXML out:** the reference 2-staff file (r0179, 1.12 s): output keeps the TAB
  clef, six `<staff-tuning>` and 90 notes with string and fret: 90/90 same string and fret (e0367). The S5capo2
  reference file (r0180): `<capo>` is not in the output; the pitches are kept (90/90 matched) but string and fret
  changed: 54 notes stay on their string with the fret 2 higher (counted from the nut), 36 notes moved to the next
  higher-pitched string (estimated string number - truth string number = -1); same string and fret 0/90 (e0368). The
  music21
  tab-only file (no `<staff-tuning>`, r0181): MuseScore logs "Error at line 30 col 47: no instrument found for part
  'P46460cd2c026ec98574ca5d84327784b'" and still writes a file whose six `<staff-tuning>` are all C-1 (MIDI 0); same
  string and fret 4/90 (e0369).
- **Constraint inputs:** none for string, fret, capo or tuning on the command line. `mscore3 --help` lists among
  others `-o/--export-to`, `-r/--image-resolution`, `-S/--style <style>`, `-p/--plugin <name>` ("Execute named
  plugin"), `-j/--job <file>` ("Process a conversion job") and `-M/--midi-operations <file>`; only `-o` was used.
