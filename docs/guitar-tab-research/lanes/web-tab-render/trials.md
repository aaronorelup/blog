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
  `npm ls` output of that install: `samples/npm-ls.txt`). Later additions: `npm install webmscore@1.2.1
  guitarpro-parser@2.0.0` and `npm install --no-save esbuild@0.25.12` (esbuild was removed again by the next install
  after its one use); `node_modules` is 215 MB at the end.

## alphaTab 1.9.0 (npm `@coderline/alphatab`)

- **What it is:** a TypeScript library (also built for .NET and Android) that imports Guitar Pro, MusicXML, CapXML and
  alphaTex, renders standard notation and tablature (SVG or canvas), and plays the score with its own SoundFont
  synthesizer (alphaSynth). Package https://www.npmjs.com/package/@coderline/alphatab, version 1.9.0 (published to npm
  2026-10-31), installed 2026-11-10. The intro page https://alphatab.net/docs/introduction
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
  bar 0 in the model, one track "Guitar", MIDI program 24, one staff with `showTablature` true and
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
  "♩ = 112" (alphaTex); a dynamic "f" under bar 1. For the three .gp5 files no title and no tuning name were drawn (the
  S5capo2.gp5 render shows "Capo. fret 2" above bar 1); for the alphaTex files the title, the subtitle, "Guitar Standard
  Tuning" and (S5capo2) "Capo. fret 2" were drawn. In the
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

### Run 4b: metronome, count-in, playback speed and transposition (functional check)

- Run r0317 (--nolock: not pinned to a slot, unlike r0128, while other lanes' jobs ran; 49.18 s wall for both configurations, one browser
  each), same driver, results `samples/alphatab/S2n_metro_countin.summary.json` and `S2n_transp2_speed2.summary.json`.
- **`api.metronomeVolume = 1`, `api.countInVolume = 1`:** 56 metronome events instead of 52: four extra at ticks 0,
  960, 1920, 2880 (120.5, 658.2, 1188.0, 1728.0 ms after `play()`), then the song's own tick 0 again at 2288.0 ms. The
  first `playerPositionChanged` came 2,287.9 ms after `play()` (142.4 ms without count-in in r0128), and
  `playerFinished` at 30,138.5 ms. With one count-in bar (2,142.9 ms at 112 BPM) added to the nominal times: note-ons
  median +135.0 ms (n = 90, min +125.3, max +140.0); metronome spacing median 537.7 ms (nominal 535.7).
- **`api.playbackSpeed = 2.0` with `api.changeTrackTranspositionPitch(tracks, 2)`:** `playerFinished` came 14,053.7 ms
  after `play()` (27,994.4 ms at speed 1.0). In that run `midiEventsPlayed` reported 44 note-ons (type 128), 42
  note-offs and 27 metronome events, against 90, 88 and 52 at speed 1.0, and the first five metronome events still
  came 530 to 540 ms apart. The note-on `noteKey` values were the untransposed ones (43, 55, 50, 55, 43, 62, the same
  as at speed 1.0). UNVERIFIED: whether the transposition changed the live sound (the event keys did not change and
  the live audio cannot be captured here) and why fewer events were reported at speed 2.0.
- **Transposition in the offline export** (`scripts/alphatab_transpose_export.cjs`, r0328, --nolock, 11.78 s): the
  first 4 s of S2n.gp5 exported three ways and the strongest spectral peak between 150 and 260 Hz measured over
  2.16 to 2.60 s (the first melody note, G3 = 196.0 Hz, over the G2 bass) with `scripts/wav_peak_hz.py` (Hann window,
  FFT zero-padded to 2^18, parabolic interpolation): plain export 195.78 Hz (MIDI 54.98); after
  `api.changeTrackTranspositionPitch(tracks, 2)` with default export options 195.78 Hz (MIDI 54.98, unchanged); with
  `AudioExportOptions.trackTranspositionPitches = Map {0 => 2}` 219.75 Hz (MIDI 56.98, two semitones up). So the export
  applies its own `trackTranspositionPitches` option and did not pick up the player's track transposition.

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
  alphaTex (6 files), alphaTab's own .gp export, GP3/GP4 written by TuxGuitar and PyGuitarPro, and MusicXML. The
  reference 2-staff MusicXML imports as one track with two staves (staff 0 notation without tuning, staff 1 TAB with
  tuning [64, 59, 55, 50, 45, 40] and, for S5capo2, `capo` 2): 90/90 same string and fret for S2n, S5capo2 and S5dropd
  (r0272, r0273, r0275; e0843, e0847, e0852). A MusicXML part without `<staff-tuning>` (music21's) imports with no
  string or fret (r0278, e0908). TuxGuitar's MusicXML imports with the tuning one octave high (r0277, e0860).
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
  https://www.npmjs.com/package/vexflow, version 5.0.0 (published to npm 2025-03-05), installed 2026-11-10.
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
  https://www.npmjs.com/package/vextab, version 4.0.5 (published to npm 2026-01-18), depends on `vexflow ^5.0.0`.
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
  2.3.0 (published to npm 2026-11-07), installed 2026-11-10. `LICENSE` in the package: "Copyright 2019 PhonicScore"
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
  6.4.1 (published to npm 2026-11-03), toolkit `getVersion()` "6.4.1-fbe8f46"; `package.json` `"license":
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
  music21 tab-only file (no `<staff-tuning>`, r0181): MuseScore logs "Error at line 30 col 47: no instrument found for part
  'P46460cd2c026ec98574ca5d84327784b'" and still writes a file whose six `<staff-tuning>` are all C-1 (MIDI 0); same
  string and fret 4/90 (e0369).
- **Constraint inputs:** none for string, fret, capo or tuning on the command line. `mscore3 --help` lists among
  others `-o/--export-to`, `-r/--image-resolution`, `-S/--style <style>`, `-p/--plugin <name>` ("Execute named
  plugin"), `-j/--job <file>` ("Process a conversion job") and `-M/--midi-operations <file>`; only `-o` was used.

## LilyPond 2.24.3 (Ubuntu package `lilypond`), TabStaff

- **What it is:** a text-based music engraver; `\new TabStaff` draws tablature and, when a note carries no string
  number, LilyPond picks the string itself. Ubuntu 24.04 package `lilypond` 2.24.3-1build3 (Installed-Size 15,141 KB
  plus `lilypond-data` and `lilypond-fonts`), installed 2026-11-10 with the apt command in the MuseScore section;
  `lilypond --version`: "GNU LilyPond 2.24.3 (running Guile 2.2)". License: not quoted here (see the survey).
- **Input made for it:** `scripts/truth_to_lilypond.py` (stdlib) writes a `.ly` with a `treble_8` Staff and a
  TabStaff sharing the same music, absolute pitches (c' = MIDI 60), `\tempo`, `stringTunings = \stringTuning <...>`
  from the truth tuning, one voice per truth voice. `--strings auto` writes no string numbers; `--strings truth`
  writes the truth string after each note (`g4\3`; a first version wrote `g\34`, which LilyPond read as string 34 and
  stopped with "In procedure list-ref: Argument 2 out of range: 33", r0206). LilyPond's TabStaff has no capo setting;
  for S5capo2 the tuning was raised by 2 semitones (`--capo-as-tuning`) so frets count from the capo. `--sequence`
  (for the GuitarSet clips, whose notes are not on a beat grid) writes every group of notes starting within 50 ms as
  one 8th-note chord in order. A Scheme callback on `TabNoteHead.after-line-breaking` prints the moment, MIDI pitch,
  staff position and fret text of every tab note head to the log; `scripts/lilypond_log_to_json.py` turns those lines
  into gtr-eval JSON (string = (5 - staff position) / 2 + 1).
- **Runs** (`lilypond --png -dresolution=100 -o <out> <in>.ly`; all --nolock; each also writes a `.midi`):
  S2n auto r0197 (4.76 s wall, 2.15 s CPU, 82 MB); S1 auto r0201 (5.67 s); S5dropd auto r0202 (4.9 s); S5capo2 auto
  with raised tuning r0204 (4.95 s); S2n truth strings r0211 (3.41 s); R1a, R1b, R1c auto sequence r0207 (6.92 s),
  r0208 (4.71 s), r0209 (5.24 s). Log: "Success: compilation successfully completed".
- **LilyPond's automatic string choice compared with the truth** (gtr-eval `tab`):

  | clip | notes (truth / LilyPond) | same string and fret / matched | string difference (LilyPond - truth): count | eval |
  |---|---|---|---|---|
  | S2n | 90 / 90 | 90/90 | 0: 90 | e0399 |
  | S1 | 62 / 62 | 62/62 | 0: 62 | e0413 |
  | S5dropd (Drop D tuning given) | 90 / 90 | 90/90 | 0: 90 | e0414 |
  | S5capo2 (tuning raised by the capo) | 90 / 90 | 90/90 | 0: 90 | e0415 |
  | R1a GuitarSet comp, `--ignore-time` | 189 / 188 | 104/188 = 0.553 | -2: 20, -1: 64, 0: 104 | e0416 |
  | R1b GuitarSet solo, `--ignore-time` | 70 / 70 | 33/70 = 0.471 | -1: 37, 0: 33 | e0417 |
  | R1c GuitarSet comp, `--ignore-time` | 148 / 145 | 127/145 = 0.876 | -1: 18, 0: 127 | e0418 |

  A negative difference means LilyPond put the note on a higher-pitched string (lower string number) than the
  annotation. The synthesized S arrangements were written in the lowest positions, which is where every
  LilyPond-chosen note landed too. For R1 the `--sequence` input drops a note when two notes of the same pitch start
  within 50 ms (1 note in R1a, 3 in R1c). With `--strings truth` (S2n), 90/90 same string and fret (e0412).
- **MIDI:** LilyPond's `.midi` holds both staves, so every note twice: S2n 180 notes, onset precision 0.5 and recall
  1.0 (e0400).
- **Pictures:** `samples/lilypond/S2n_auto.webp` (treble-8 staff above a TAB staff, both voices, common-time sign)
  and `R1b_auto_seq.webp`; `.ly` inputs and the read-back JSON are in `samples/lilypond/`.
- **Constraint inputs:** `stringTunings` (any tuning, used here), explicit string numbers per note (`\N`, used
  here), and three context properties defined in the installed `scm/lily/define-context-properties.scm` (not tried
  here): `minimumFret` ("The tablature auto string-selecting mechanism selects the highest string with a fret at least
  `minimumFret`."), `maximumFretStretch` and `restrainOpenStrings`. In that file the only "capo" is the "da capo" of
  repeat marks; the raised-tuning workaround above was used for the capo.

## TuxGuitar 1.5.6 (Ubuntu package `tuxguitar`), format plugins called headless

- **What it is:** a desktop tablature editor (Java, SWT GUI) with plugins that read and write tab formats. Ubuntu
  24.04 package `tuxguitar` 1.5.6+dfsg1-8build3 (Installed-Size 11,282 KB), installed with the apt command in the
  MuseScore section; Java: OpenJDK 21.0.12.1 (already on the box, with `javac`).
- **No command-line converter:** `/usr/bin/tuxguitar` only starts the GUI main class
  `org.herac.tuxguitar.app.TGMainSingleton`; the converter plugin `tuxguitar-converter.jar` is part of the GUI. The GUI
  was not started. Instead `scripts/tuxguitar/TGConvert.java` (written for this trial, compiled with `javac -cp
  "/usr/share/tuxguitar/lib/*:/usr/share/tuxguitar/plugins/*"`) calls the plugins' reader and writer classes
  directly with `-Djava.awt.headless=true`: readers `GP5InputStream`/`GP4InputStream`/`GP3InputStream`, `gpx.v6.
  GPXInputStream` (.gpx), `gpx.v7.GPXInputStream` (.gp), `MidiSongReader`; writers `GP5OutputStream`,
  `GP4OutputStream`, `GP3OutputStream`, `MusicXMLSongWriter`, `ASCIISongWriter`, `LilypondSongWriter`,
  `MidiSongWriter`, each through a `TGSongReaderHandle`/`TGSongWriterHandle` with a `TGFactory` and an empty
  `TGSongStreamContext`. The plugin folder also holds PowerTab (`tuxguitar-ptb.jar`) and TablEdit (`tuxguitar-tef.jar`)
  readers, PDF, SVG and image exporters (not tried).
- **Runs** (all --nolock, exit 0): S2n.gp5 r0221 (0.91 s wall, 0.5 s CPU, 65.9 MB; GP5 read 73 ms), S5capo2.gp5 r0222
  (0.50 s), S5dropd.gp5 r0223 (0.54 s), alphaTab's GP7 `.gp` export of S2n r0224 (0.72 s; `.gp` read 330 ms). Every
  writer ran for every input (S2n: GP5 2,583 bytes, GP4 1,705, GP3 1,660, MusicXML 47,431, ASCII 1,874, LilyPond
  3,125, MIDI 920).
- **What survived** (gtr-eval `tab`, `notes` for MIDI; same results for the alphaTab `.gp` input as for S2n.gp5):

  | output | S2n | S5capo2 | S5dropd | alphaTab .gp of S2n |
  |---|---|---|---|---|
  | TuxGuitar's song model (my JSON dump: string, fret, `TGTrack.getOffset()` as capo, `TGString` values as tuning) | 90/90 same string+fret (e0456) | 90/90, capo 2 (e0463) | 90/90, tuning 38... (e0470) | 90/90 (e0477) |
  | GP5 written by TuxGuitar | 90/90 (e0457) | 90/90, capo 2 (e0464) | 90/90 (e0471) | 90/90 (e0479) |
  | GP4 | 90/90 (e0458) | 90/90, capo 2 (e0465) | 90/90 (e0472) | 90/90 (e0480) |
  | GP3 | 90/90 (e0459) | 90/90, capo 2 (e0466) | 90/90 (e0473) | 90/90 (e0481) |
  | ASCII tab (`--ignore-time`, matched by note order) | 90/90 (e0461) | 90/90 (e0468; see the note on the capo below) | 90/90 (e0475) | 90/90 (e0484) |
  | MusicXML | 16/90 matched by pitch, 0 same string+fret (e0460) | 0/90 matched (e0467) | 16/90, 0 (e0474) | 16/90, 0 (e0482) |
  | MIDI | onset F1 1.0 (e0462) | 1.0 (e0469) | 1.0 (e0476) | 1.0 (e0485) |

- **MusicXML facts:** one staff with a G clef (no TAB clef, no `<staves>`), all 91 `<voice>` elements are voice 1
  (the two Guitar Pro voices merged), each note has `<technical>` `<fret>` and `<string>`, `<staff-tuning>` lines
  written one octave above the open strings (E3 A3 ... for E2 A2 ...) and `<pitch>` one octave above the sounding
  pitch (G4 for the open G string), with no `<clef-octave-change>` and no `<transpose>`. gtr-eval takes `<pitch>` as
  sounding, so most notes do not match. No capo element in the S5capo2 file.
- **ASCII tab facts:** a header ("Title:", "Artist:", "Album:", "Author:", "Track 1: Guitar"), then six lines per
  system labelled with single letters (`E|`, `B|`, `G|`, `D|`, `A|`, `E|`; `D|` for the Drop D low string), no octave
  numbers, no timing other than column position (`samples/tuxguitar/*.ascii.txt`). The export has no capo or tuning
  field. gtr-eval e0468 reports the S5capo2 capo as "stated in the estimate file"; its `processing` says "ASCII tab:
  capo 2 read from the line 'Title: S2 with a capo on fret 2'", i.e. gtr-eval's ASCII capo rule matched the song
  title, not a capo field (a gtr-eval behaviour, reported to the orchestrator).
- **LilyPond export:** written for `\version "2.14.0"`; LilyPond 2.24.3 stops with "wrong type for argument 1.
  Expecting string, found #<unspecified>" at line 101 (r0230, exit 1); after `convert-ly -e` it compiles (r0232,
  7.22 s) into a notation + TAB score of both voices (`samples/tuxguitar/S2n_tuxguitar_ly_after_convert-ly.webp`).

## PyGuitarPro 0.11 (PyPI `pyguitarpro`)

- **What it is:** a Python library that reads and writes Guitar Pro 3, 4 and 5 files. https://pypi.org/project/pyguitarpro/
  0.11, installed 2026-11-10 in the same venv as music21 (`samples/music21/uv-pip-freeze.txt`); it is also what
  gtr-eval uses to read .gp3/.gp4/.gp5. License not checked here (see the survey).
- **Run:** `scripts/pyguitarpro_trial.py`, r0236 (--nolock, 0.61 s wall, 23 MB). Read S2n.gp5 in 0.011 s: title,
  artist, tempo 112, 13 measure headers, one track "Guitar", strings [(1, 64), (2, 59), (3, 55), (4, 50), (5, 45),
  (6, 40)] (string 1 = highest), `offset` (the capo) 0, instrument 24, 2 voices per measure, 90 notes with `string`,
  `value` (fret), `velocity` (95 for the first notes) and the beat's `start` tick (first note at tick 4800 in
  PyGuitarPro's counting, which starts at 960).
- **Writing:** GP5 2,522 bytes, re-read 90 notes, gtr-eval 90/90 same string and fret (e0574). GP4 1,450 bytes and
  GP3 1,407 bytes: re-read 42 notes (the first voice only; the second voice is not in the output), gtr-eval 42/90
  matched, all 42 on the same string and fret (e0578, e0581). (TuxGuitar's GP4 and GP3 writers kept all 90 notes of
  the same input, see above.)
- **An edit as a human-in-the-loop correction would make it:** in a second copy the first melody note of bar 1 was
  moved from string 3 fret 0 to string 4 fret 5, `track.offset` (capo) set to 1 and string 6 set to 38 (Drop D), then
  written as GP5 (`samples/pyguitarpro/S2n.pgp.edited.gp5`). PyGuitarPro re-reads string 4 fret 5, capo 1 and tuning
  [64, 59, 55, 50, 45, 38]; alphaTab 1.9.0 under Node reads the same file as tuning [38, 45, 50, 55, 59, 64], capo 1
  and the moved note as string 4, fret 5, sounding pitch 56.
- **Output format facts:** Guitar Pro binary; capo is `Track.offset`; tuning is `Track.strings[i].value` (MIDI);
  `Note.string` 1 = highest string; `Note.value` = fret.

## abcjs 6.7.2 (npm `abcjs`), guitar tablature

- **What it is:** a JavaScript ABC-notation renderer and player; since version 6 it can add a tablature staff under
  each staff. https://www.npmjs.com/package/abcjs 6.7.2 (published to npm 2026-10-16), `ABCJS.signature` "abcjs-basic
  v6.7.2". `LICENSE.md` begins "Copyright (c) 2009-2026 Paul Rosen and Gregory Dyke" followed by the MIT text
  ("Permission is hereby granted, free of charge, to any person obtaining a copy ..."). Package 6.3 MB;
  `dist/abcjs-basic-min.js` 511,968 bytes.
- **Input made for it:** ABC has no syntax for string or fret, so abcjs chooses them. `scripts/truth_to_abc.py`
  (stdlib) writes the truth notes as ABC (`L:1/16`, `Q:1/4=112`, `K:` from the truth key, `V:1` melody and `V:2` bass
  joined on one staff with `%%score (1 2)`). The typings (`types/index.d.ts`) give the render option
  `tablature: [{ instrument: 'guitar' | 'mandolin' | 'fiddle' | 'violin', capo, label, tuning, highestNote }]`; the
  source `src/tablatures/abc_tablatures.js` sets the guitar `defaultTuning: ['E,', 'A,', 'D', 'G', 'B', 'e']`, which in
  ABC pitch is E3 A3 D4 G4 B4 E5: one octave above the sounding open strings (written guitar pitch).
- **Runs** (page `scripts/pages/abcjs.html`, `ABCJS.renderAbc(div, abc, {add_classes: true, staffwidth: 1150,
  tablature: [...]})`; read-back `scripts/abcjs_tab_readout.cjs` assigns each `text.abcjs-tab-number` in the SVG to
  the nearest of the six lines of its tab staff (largest distance found 0.33 px) and orders notes by line and x; all
  --nolock):
  - ABC at sounding pitch, default tuning, r0239 (render 67 ms in the page): the notation is drawn an octave low
    (ledger lines below the staff) and 42 of the 90 tab positions are drawn as "?" (`samples/abcjs/S2n.webp`).
  - ABC one octave up (`--written-octave`), default tuning, r0241 (render 141 ms; 850 ms page load to done): 90 fret
    numbers on 4 tab staves, no "?"; gtr-eval `tab --ignore-time` (matched by note order, since the read-back has no
    times): 88/90 matched, 88/88 on the same string and fret as the truth (e0638) (`samples/abcjs/S2n_written.webp`).
  - S5capo2 one octave up with `capo: 2`, r0244: 90 numbers; read back with capo 2: 88/90 matched, 88/88 same string
    and fret, capo agreeing (e0655). S5dropd one octave up with `tuning: ['D,', 'A,', 'D', 'G', 'B', 'e']`, same run:
    88/90 matched, 88/88 same string and fret (e0659).
  - The 2 unmatched notes in each case were not investigated (the order-based matching depends on my pseudo-onsets
    from x positions); UNVERIFIED whether abcjs or the read-back causes them.
- **Constraint inputs:** `tablature[].tuning` (any tuning, as ABC pitches), `tablature[].capo`, `highestNote`; per-note
  string choice is not in ABC.
- **Not tried:** abcjs's synth/playback (`ABCJS.synth`). Its editor helper `ABCJS.Editor` was tried, see "Editable
  tab in the browser" below.

## svguitar 2.10.1 and vexchords 1.2.0 (chord diagrams)

- **What they are:** two JavaScript libraries that draw chord-box diagrams as SVG. svguitar
  https://www.npmjs.com/package/svguitar 2.10.1 (published to npm 2026-10-17), `LICENSE` "Copyright 2017 Raphael
  Voellmy" with the MIT text ("Permission is hereby granted, free of charge, ..."), 2.7 MB. vexchords
  https://www.npmjs.com/package/vexchords 1.2.0 (published to npm 2019-03-31), `package.json` `"license": "MIT"`,
  1.3 MB. Both installed 2026-11-10 with the npm command at the top.
- **Input:** the two shapes the S3/S4 truth tabs use, G (320003) and Bm (x24432). svguitar:
  `new svguitar.SVGuitarChord(el).configure({strings: 6, frets: 4, position, tuning}).chord({fingers: [[string,
  fret]...], barres: [{fromString, toString, fret}]}).draw()`, string 1 = highest, fret 0 = open, 'x' = muted, frets
  relative to `position`. vexchords: `draw(el, {chord: [[string, fret]...], position, barres}, {width, height})`,
  string 1 = highest.
- **Runs** (page `scripts/pages/chords.html`, all --nolock): svguitar r0253: both diagrams drawn (2 SVGs), correct
  dots, the Bm barre with a "2fr" position label. vexchords from the package's `dist/vexchords.js`: "TypeError: A[e]
  is not a constructor" inside svg.js `addTo` (r0253 with svguitar on the page, r0254 with an element instead of a
  selector, r0255 alone on the page). Loading its ES-module source directly fails because `index.js` imports
  `'./chordbox'` without an extension (404, r0256). Bundled from its source with esbuild 0.25.12 (`npm install
  --no-save esbuild@0.25.12`, then `esbuild node_modules/vexchords/index.js --bundle --format=iife
  --global-name=vexchordsESM`, 178,249 bytes; page `scripts/pages/vexchords_esm.html`) it draws both diagrams
  (r0259). Screenshot of both libraries: `samples/chords/svguitar_vexchords_G_Bm.webp` (the bottom row, labelled
  "ESM", is the esbuild bundle).

## Tonal 6.5.1 (npm `tonal`)

- **What it is:** a JavaScript music-theory library (notes, intervals, chords, keys, scales). https://www.npmjs.com/package/tonal
  6.5.1 (published to npm 2026-10-14); `LICENSE` "The MIT License (MIT)" / "Copyright (c) 2015 danigb". 304 KB
  plus the `@tonaljs/*` packages (1.7 MB).
- **Run:** `scripts/tonal_chordsheet_trial.mjs` under Node, r0251 (--nolock, 1.24 s with ChordSheetJS below). For each
  non-N chord segment of `S3.truth.json`, the pitch classes of every truth note sounding at any time inside the segment
  (onset < segment end and offset > segment start), the lowest note first, were passed to `Chord.detect()`; 1.4 ms for
  9 segments. The first name returned had the truth label's root and quality in 8 of 9 segments ("G:maj" -> "GM",
  "E:min" -> "Em", "A:min7" -> "Am7", "D:7" -> "D7", "C:maj" -> "CM" ...). The ninth, "D:7" at 18.75 to 20.0 s, got
  "C69#11" because the C-chord notes still sounding at 18.75 s were included by that selection rule (pitch classes C E G
  F# A D). Other calls recorded: `Chord.get("Bm").notes` ["B", "D", "F#"], `Key.majorKey("G").chords` ["Gmaj7", "Am7",
  "Bm7", "Cmaj7", "D7", "Em7", "F#m7b5"], `Note.transpose("E2", "3M")` "G#2" (`samples/chords/tonal_chordsheetjs_S3.json`).

## ChordSheetJS 18.0.0 (npm `chordsheetjs`)

- **What it is:** a JavaScript library that parses and formats chord sheets (ChordPro, chords-over-words, UltimateGuitar
  style) and transposes them. https://www.npmjs.com/package/chordsheetjs 18.0.0 (published to npm 2026-09-24);
  `package.json` `"license": "GPL-2.0-only"`, `LICENSE` begins "GNU GENERAL PUBLIC LICENSE Version 2, June 1991".
  37 MB on disk (with its dependencies counted in that folder).
- **Run:** same script and run (r0251). A ChordPro sheet written from the S3 truth labels (`samples/chords/S3.chordpro`:
  `{title:}`, `{key: G}`, `{tempo: 96}`, `{capo: 0}`, `[G]la [Em]la [Am]la [D7]la ...`; "A:min7" was written as
  "Am" by my converter) was parsed with `ChordProParser`; the song exposed title, key "G", tempo "96", capo "0" and the
  chords G Em Am D7 G Em C D7 G; `TextFormatter` gave chords over the syllables; `HtmlDivFormatter` gave 919
  characters of HTML (`samples/chords/S3.chordsheet.html`); `song.transpose(2)` then `ChordProFormatter` gave `{key:
  A}` and `[A]la [F#m]la [Bm]la [E7]la [A]la [F#m]la [D]la [E7]la [A]la`. `ChordsOverWordsParser` on "G C D" over
  "Twinkle twinkle little star" gave `[G]Twinkle[C] twinkle [D]little star`.
- **Constraint inputs:** ChordPro directives `{capo}`, `{key}`, `{tempo}`; `transpose(n)`.

## Format matrix (measured by converting)

What each tool read and wrote in these trials, and what survived each hop, checked with gtr-eval against the clip's
truth (S2n, and S5capo2 for the capo, S5dropd for the tuning). "s/f" = string and fret of every matched note equal to
the truth; "timing" = onsets within 50 ms; "-" = not carried by the format or not checked. Every row was run here;
formats not in a row were not tested.

| hop | notes kept | s/f | timing | tuning | capo | evidence |
|---|---|---|---|---|---|---|
| GP5 -> alphaTab model | 90/90 | yes | yes | yes (Drop D) | yes | e0004, e0008, e0012 |
| GP5 -> alphaTab -> GP7 `.gp` -> alphaTab | 90/90 | yes | yes | yes | yes | e0005, e0009, e0015 |
| GP5 -> alphaTab -> alphaTex -> alphaTab | 90/90 | yes | yes | yes | yes | e0006, e0010, e0016 |
| GP5 -> alphaTab -> MIDI | 90/90 | - (MIDI has none) | yes | - | sounding pitch correct | e0007, e0011, e0017 |
| truth -> alphaTex (my writer) -> alphaTab | 90/90 | yes | yes | yes | yes | e0024, e0026, e0028 |
| alphaTab `.gp` -> MuseScore 3.2.3 | refused ("unknown file suffix <gp>") | - | - | - | - | r0178 |
| alphaTab `.gp` -> TuxGuitar 1.5.6 (gpx v7 reader) | 90/90 | yes | yes | yes | (capo 0 file) | e0477 |
| alphaTab `.gp` -> TuxGuitar -> GP5 / GP4 / GP3 | 90/90 each | yes | yes | yes | - | e0479, e0480, e0481 |
| GP5 -> MuseScore 3.2.3 -> MusicXML | 90 notes, no TAB staff | no `<string>/<fret>` | - | - | - | e0141 |
| GP5 -> MuseScore 3.2.3 -> MIDI | 90/90 | - | yes | Drop D yes | capo: pitches 2 semitones low | e0145, e0378, e0374, e0376 |
| GP5 -> TuxGuitar -> GP5 / GP4 / GP3 | 90/90 | yes | yes | yes | yes | e0457 to e0459, e0464 to e0466, e0471 to e0473 |
| GP5 -> TuxGuitar -> MusicXML | 90 notes, pitches and staff tuning one octave high | 0 of the 16 pitch matches | - | octave high | dropped | e0460, e0467, e0474 |
| GP5 -> TuxGuitar -> ASCII tab | 90/90 (by order) | yes | no times in the format | letters only, no octave | no field | e0461, e0468, e0475 |
| GP5 -> TuxGuitar -> LilyPond -> LilyPond 2.24.3 | compiles only after `convert-ly -e` | not read back | - | - | - | r0230, r0232 |
| GP5 -> TuxGuitar -> MIDI | 90/90 | - | yes | - | sounding pitch correct | e0462, e0469, e0476 |
| TuxGuitar GP3 / GP4 -> alphaTab | 90/90 | yes | yes | yes | - | e0799, e0802 |
| TuxGuitar MusicXML -> alphaTab | 90 notes, tuning read [52..76] | 0 of 7 pitch matches | - | octave high | - | e0860 |
| GP5 -> PyGuitarPro -> GP5 | 90/90 | yes | yes | yes | - | e0574 |
| GP5 -> PyGuitarPro -> GP4 / GP3 | 42/90 (second voice not written) | yes for the 42 | yes | yes | - | e0578, e0581 |
| PyGuitarPro GP3 -> alphaTab | 42/90 | yes for the 42 | yes | yes | - | e0805 |
| truth -> MusicXML 2 staves (my writer) -> gtr-eval | 90/90 | yes | yes | yes (`<staff-tuning>`) | yes (`<capo>`) | e0195, e0196, e0197 |
| ... that MusicXML -> alphaTab | 90/90 (one track, notation staff + TAB staff) | yes | yes | yes | yes | e0843, e0847, e0852 |
| ... that MusicXML -> OSMD | 90 notes with string/fret drawn on a TAB staff | drawn | - | - | not drawn | r0158, r0159 |
| ... that MusicXML -> Verovio -> MEI | 90/90 | yes | yes | yes (`<course>`) | dropped | e0363, e0365, e0366 |
| ... that MusicXML -> MuseScore 3.2.3 -> MusicXML | 90/90 | yes; with a capo: 0/90 (frets re-counted from the nut, 36 notes moved a string) | yes | yes | dropped | e0367, e0368 |
| truth -> music21 -> MusicXML (no `<staff-tuning>`, no `<capo>`) | 90/90 | yes | yes | not written | not written | e0191, e0193 |
| ... -> OSMD | TAB staff drawn | drawn | - | - | - | r0161 |
| ... -> MuseScore 3.2.3 -> MusicXML | 90 notes, staff tuning written as C-1 x 6 | 4/90 | yes | lost | - | e0369 |
| ... -> alphaTab | 90 notes on one staff with `showTablature` false and no tuning: no string/fret | lost (0 of 90 with a position) | yes | - | - | r0278, e0908 |
| truth -> MEI tab (my writer) -> Verovio -> MEI | 90/90 | yes | yes | yes | no MEI capo used | e0361, e0362 |
| truth -> ABC one octave up -> abcjs tab (strings chosen by abcjs) | 88/90 by order | 88/88 same as truth | - | option | option (`capo`) | e0638, e0655, e0659 |
| truth notes -> LilyPond TabStaff (strings chosen by LilyPond) | all | S clips 100 %; GuitarSet 47 to 88 % | - | `stringTunings` | no property | e0399, e0413 to e0418 |
| truth -> VexTab text -> VexTab | drawn | drawn | - | `tuning=` | no option | r0109, r0144 |
| GP5 / alphaTab `.gp` -> webmscore 1.2.1 -> MusicXML | 90 notes, no TAB staff | no `<string>/<fret>` | - | - | - | e0990, e0995, e1002 |
| GP5 / alphaTab `.gp` -> webmscore -> MIDI | 90/90 | - | yes | - | sounding pitch correct (S5capo2 too) | e0992, e0999, e1006 |
| reference 2-staff MusicXML -> webmscore -> MusicXML | 90/90 by pitch | 0/90 (TAB staff kept, positions changed) | yes | written octave high | - | e1009 |
| GP5 / TuxGuitar GP3 -> guitarpro-parser 2.0.0 | 90/90 | yes | yes | yes | yes | e1101, e1103, e1105, e1110 |
| alphaTab `.gp` -> guitarpro-parser | refused ("FretCount property without <Number>") | - | - | - | - | r0298 |

Readers and writers by format, as run here (r = read, w = write):

| format | alphaTab | MuseScore 3.2.3 | webmscore 1.2.1 | TuxGuitar 1.5.6 (plugins) | PyGuitarPro 0.11 | guitarpro-parser 2.0.0 | music21 10.5.2 | Verovio 6.4.1 | OSMD 2.3.0 | LilyPond 2.24.3 | abcjs 6.7.2 | gtr-eval |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GP3 / GP4 | r | not tried | not tried | r w | r w (one voice) | r (GP3) | - | - | - | - | - | r |
| GP5 | r | r | r | r w | r w | r | - | - | - | - | - | r |
| GP7 `.gp` (alphaTab's export) | r w | refused | r | r (gpx v7 reader) | - | refused | - | - | - | - | - | refused (its README) |
| MusicXML with TAB | r | r w | r w (positions changed) | w (octave high) | - | - | w (no tuning/capo) | r | r | - | - | r |
| MEI tab | - | - | - | - | - | - | - | r w | - | - | - | - (my reader) |
| MIDI | w | w | w | w | - | - | - | w | - | w | - | r |
| alphaTex | r w | - | - | - | - | - | - | - | - | - | - | - |
| ASCII tab | - | - | - | w | - | - | - | - | - | - | - | r |
| ABC | - | - | - | - | - | - | not tried | not tried | - | - | r | - |
| LilyPond `.ly` | - | - | - | w (2.14 syntax) | - | - | - | - | - | r | - | - |

## webmscore 1.2.1 (npm `webmscore`, MuseScore 3 engine in WebAssembly)

- **What it is:** MuseScore's engine compiled to WebAssembly for browsers and Node (load a score, save MusicXML, MIDI,
  SVG, PNG, PDF, audio). https://www.npmjs.com/package/webmscore 1.2.1 (published to npm
  2023-01-24); `package.json` `"license": "GPL"`; its CHANGELOG records "Merge [upstream v3.6.0]
  ... into webmscore". Package 24 MB (`webmscore.lib.wasm` 9,248,386 bytes, `webmscore.lib.data` 4,099,973 bytes).
  Installed 2026-11-10 with `npm install webmscore@1.2.1 guitarpro-parser@2.0.0`. Its `schemas.ts` lists the input
  formats `'mscz' | 'mscx' | 'mxl' | 'musicxml' | 'xml' | 'midi' | 'kar' | ... | 'gtp' | 'gp3' | 'gp4' | 'gp5' |
  'gpx' | 'gp' | 'ptb'`.
- **Two failures under Node 22.23.4, and the workarounds used** (`scripts/webmscore_trial.cjs`): (1) loading the
  package's Node entry stops with "TypeError: Cannot set property navigator of #<Object> which has only a getter"
  (r0279 to r0282); defining a writable `globalThis.navigator` before `require` gets past it (`--shim-navigator`);
  (2) then "TypeError: Failed to parse URL from .../webmscore.lib.wasm" from Node's built-in `fetch` (r0283 to r0286);
  deleting `globalThis.fetch` before loading lets it read the file (`--no-fetch`). With both, all four runs worked.
- **Runs** (all --nolock, exit 0, peak RSS 217 to 243 MB; WASM ready in 1.09 to 1.77 s, load 102 to 274 ms):
  S2n.gp5 r0288 (4.0 s wall: MusicXML 29,601 bytes, MIDI 687, SVG page 1 137,991, PNG page 1 252,255 in 1,632 ms, PDF
  22,048, .mscz 20,373); S5capo2.gp5 r0289; alphaTab's `.gp` export r0290 (read, unlike MuseScore 3.2.3); the
  reference 2-staff MusicXML r0291. Metadata for S2n: 13 measures, duration 28 (s), one part "Guitar" with
  `instrumentId` "guitar-steel", program 24.
- **What survived:** Guitar Pro in -> MusicXML out has no TAB staff and no `<string>`/`<fret>` (gtr-eval refuses all
  three: e0990, e0995, e1002), as with MuseScore 3.2.3. MIDI from S2n.gp5, S5capo2.gp5 and the `.gp`: onset F1 1.0
  with every pitch matching, including the capo file (e0992, e0999, e1006; MuseScore 3.2.3's MIDI of S5capo2 was 2
  semitones low). The reference 2-staff MusicXML in -> MusicXML out keeps a TAB staff with 90 `<string>` marks but
  writes `<staff-tuning>` one octave high ([52, 57, 62, 67, 71, 76]); pitches match 90/90 and 0/90 keep the truth
  string and fret (string differences +1: 10, +2: 40, +3: 26, 0: 14; e1009). The PNG of that file shows the TAB
  numbers changed (`samples/webmscore/ref2staff_mxl_p1.webp`); MuseScore 3.2.3 kept the same file's positions (e0367).

## guitarpro-parser 2.0.0 (npm `guitarpro-parser`), added from the survey's list

- **What it is:** a TypeScript parser for Guitar Pro files that also computes playback order and note times. Its README
  says it "Reads `.gp` (Guitar Pro 7 and 8), `.gpx` (Guitar Pro 6), `.gp5`, `.gp4` and `.gp3`" and "Computes note times
  in milliseconds, including tempo changes, grace notes, triplet feel and ties". https://www.npmjs.com/package/guitarpro-parser
  2.0.0 (published to npm 2026-11-08); `LICENSE` "Apache License Version 2.0, January 2004". Installed 2026-11-10.
- **Run:** `scripts/gpparser_trial.mjs` (`parseGuitarPro(bytes)`, `buildTimeline(song)`, `scheduleTrack(song,
  track, timeline)` -> entries with `note`, `beat`, `playedBar`, `masterBar`, `voice`, `beatIndex`, `startMs`,
  `endMs`); all --nolock. S2n.gp5 r0294 (parse 21.6 ms), S5capo2.gp5 r0295, S5dropd.gp5 r0297, TuxGuitar's GP3 of
  S2n r0299: 90 scheduled notes each; gtr-eval `tab` 90/90 matched and 90/90 same string and fret, with tuning and
  capo read (e1101, e1103, e1105, e1110).
- **alphaTab's GP7 export** (r0298): refused with "GuitarProError: Cannot read this Guitar Pro 7+ (.gp) file (track
  1): staff 1 of track 0 has a FretCount property without <Number>." (TuxGuitar and webmscore read the same file.)
- **Output format facts:** track fields `index, name, shortName, program, lyrics, kind, tuning, capo, partialCapo,
  fretCount, bars`; `tuning` lists MIDI numbers highest string first ([64, 59, 55, 50, 45, 40]); a note has `string`
  counted from 0 = highest string (the open G3 of bar 1 has `string` 2), `fret`, `midi` (sounding pitch), `tie`,
  `dynamic`, `ghost`, `accent`, `staccato`, `dead`, `palmMute`, `letRing`, `tapped`, `leftHandTapped`, `hopoToNext`,
  `slides`, `harmonic`, `bend`, `vibrato`, `trill` (`samples/guitarpro-parser/S2n_gp5.parse_log.json`).

## Editable tab in the browser: what was tried

- **abcjs `ABCJS.Editor` (text editor helper), run:** page `scripts/pages/abcjs_editor.html` (a textarea holding the
  S2n ABC at written pitch, `new ABCJS.Editor('abc', {canvas_id, abcjsParams: {tablature: [...]}})`); driver
  `scripts/abcjs_editor_edit.cjs` selects the first melody note `G4` in the textarea and types `A4` with
  Playwright's keyboard, as a user would. r0312 (--nolock, 2.88 s): the score and tab re-rendered; the first tab number
  changed from 0 to 2 (G string, open to fret 2) and no other of the 90 numbers changed; the edited text is the export
  (`samples/abcjs/S2n.written.edited.abc`, `editor_edit_trial.json`, screenshot `editor_after_edit.webp`). The editing
  surface is ABC text; there is no click-on-the-tab editing in abcjs.
- **alphaTab, run (Run 5 above):** no editor UI ships; a mouse click on a rendered note produced a `beatMouseDown`
  event (bar, voice, beat) once the player was ready; changing `Note.fret` in the model and calling `render()`
  redrew the tab, and the edit survived a GP7 export (r0132, r0134).
- **muzart (thegedge/muzart), NOT RUN HERE:** cloned (`git clone --depth 1`, commit 0e61e67300698a182680344cdf82ebf76d3451b1,
  2026-06-18; 3.2 MB; a pnpm monorepo with packages canvas, editor, layout, loaders (guitarpro.ts, musicxml.ts),
  notation, playback, render, testing; 678 packages in `pnpm-lock.yaml`; the editor is a Vite 8 + React 18 app). The
  next step, `pnpm install --frozen-lockfile` (which runs that repository's dependency install), was denied by this
  session's permission check ("Code from External"), so it was not built or opened. Its README gives a demo URL,
  https://thegedge.github.io/muzart/ (answers HTTP 200 from this box; not opened in the browser here). Steps for Aaron
  are in for-aaron.md.
- **Not tried for lack of time:** VexTab's `editor="true"` div mode, `@coderline/alphatab-monaco` (alphaTex editing in
  the Monaco editor), tab-editor (calesce, 2017), It's MyTabs (a viewer/player, needs Deno or Docker), Autostrum and
  Songshed (no license file per the survey), TuxGuitar's desktop GUI, Power Tab Editor (desktop).

## Not run here

- **MuseScore Studio 4.x (AppImage):** not downloaded. During the trials `df -h /` showed between 9.5 GB and 5.3 GB
  free on the shared disk, and `gtr-run` printed an orchestrator notice with every call: "start no new download or
  install over 200 MB unless your lane cannot finish without it"; the Ubuntu package MuseScore 3.2.3 and webmscore
  (MuseScore 3 engine) were run instead. Steps for Aaron: for-aaron.md item 1.
- **muzart** (browser tab editor): cloned but not installed; this session's permission check refused running the
  repository's `pnpm install` ("Code from External"). for-aaron.md item 2.
- **Soundslice, Flat.io:** hosted services that need an account (survey: "service; account needed"). for-aaron.md
  items 3 and 4.
- **TuxGuitar's desktop window, Guitar Pro 8:** a GUI program and a paid program; only TuxGuitar's file plugins were run.
  for-aaron.md items 5 and 6.
- **Listening:** the box has no sound device; alphaTab's player was measured by its events and by its offline audio
  export, never heard. for-aaron.md item 7.
- **Survey tools not tried for lack of time** (all marked RUNNABLE in the survey's list): osmd-audio-player,
  react-guitar, fretboard.js, chords-db / react-chords, jTab, abc2svg, `@coderline/alphatab-monaco` and the alphaTex
  language server, ApolloTab, score-parser, the `guitarpro` Rust crates, @musicbird/gpx-parser, It's MyTabs,
  tab-editor (calesce), Guitar (1j01), tuitar, the ChordPro reference program (Perl), Verovio's Python and C++ builds.
- **Video inputs (R3a, R3b, R3c):** not used; this lane renders and converts tab files, it does not read audio or
  video.

## Media kept outside git

| file | size | duration | what it is |
|---|---|---|---|
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-player/S2n_plain.export.wav` | 9,828,396 bytes | 27.858 s | alphaTab 1.9.0 `api.exportAudio()` of `S2n.gp5` with its bundled Sonivox SoundFont: 44.1 kHz, 2 channels, 32-bit float, metronome off (run r0128). Reference playback of the correct tab as alphaTab renders it. |
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.plain.wav` | 1,413,164 bytes | 4.005 s | first 4 s of the same export (r0328) |
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.changeTrackTranspositionPitch.wav` | 1,413,164 bytes | 4.005 s | same, after `changeTrackTranspositionPitch(tracks, 2)`; measured pitch unchanged (r0328) |
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.exportOption.wav` | 1,413,164 bytes | 4.005 s | same, exported with `trackTranspositionPitches` {0: 2}: two semitones up (r0328) |

No other audio or video was produced by this lane (the MIDI files are listed in the sections above). Screenshots are WebP under `samples/` (all under 300 KB; the full
PNGs are in `/home/user/gtr/lanes/web-tab-render/out/`).
