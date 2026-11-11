# web-tab-render: trials

Lane agent `try-web-tab-render`, 2026-11-10 (UTC). What was installed and run on the shared box (4 vCPU Xeon 2.10 GHz,
15 GiB RAM, no GPU), on the shared inputs in `/home/user/gtr/inputs/`, and what came out.

Conventions used in this file:

- **Run ids** (`rNNNN`) are lines in `/home/user/gtr/ledger/runs.jsonl` written by `gtr-run`. Runs marked
  "2 cores" were pinned to one 2-core slot. Runs marked **"--nolock"** were logged by `gtr-run --nolock`: not pinned and
  not given a slot, so they ran while up to two pinned jobs of other lanes used the CPUs; their times are for
  reference only. Most `--nolock` runs took under 3 s of wall time; the longer ones are r0317 (49.18 s), r0328
  (11.78 s), the LilyPond runs (3.41 to 7.22 s), the webmscore runs r0288 to r0291 (2.72 to 4.41 s), r0254 (4.94 s),
  r0134 (4.62 s) and r0244 (3.98 s). Slot waits the ledger recorded for this lane's pinned runs at the time: r0026
  118.2 s, r0058 71.7 s, r0128 490.6 s. (Corrected by the verifier, 2026-11-10; the earlier text said the `--nolock`
  runs were all under 3 s.)
- **Eval ids** (`eNNNN`) are lines in `/home/user/gtr/eval/ledger/evals.jsonl` written by `gtr-eval` (version 0.11.1 in
  every result cited here);
  `gtr-eval ledger --id eNNNN --full` prints the whole result with the definitions of every number.
  `tab` numbers: matched = truth and estimate notes with onsets within 50 ms and the same MIDI pitch (mir_eval
  `match_notes`, onset tolerance 0.05 s, pitch tolerance 50 cents); "same string and fret" = matched pairs with the same
  string and fret / matched pairs. `notes` numbers: mir_eval transcription onset-only and onset+offset F1 with the same
  tolerances (offset: 20 percent of the note length or 50 ms).
- **String numbers**: the truth files, Guitar Pro, alphaTex, VexTab, MusicXML and ASCII tab count string 1 = the
  highest string. alphaTab's data model counts the other way (see alphaTab below).
- Test pages are served from `127.0.0.1:8765` by `scripts/serve.cjs`; every page and driver script is in `scripts/`.
  Browser: the box's pre-installed Playwright 1.63.0 with its headless Chromium (`/opt/node-tools/node_modules/playwright`,
  browsers in `/opt/pw-browsers`; `chromium.launch()` with the single argument
  `--autoplay-policy=no-user-gesture-required` in `shot.cjs`, the player driver and the transposition export, and with
  no options in the edit, abcjs-editor and abcjs read-back drivers). Node 22.23.4.
- **Page timings.** "From the driver's start" (`ms_to_ready` in the page logs written by `scripts/shot.cjs`) runs from
  before `chromium.launch()` to the page's ready flag, so it includes starting Chromium. "In the page" times are
  `performance.now()` differences inside the page. (Verifier: the earlier text called the first kind "from page load".)
- npm packages were installed into `/home/user/gtr/lanes/web-tab-render/web/` with one command (`npm-install.log`:
  "added 76 packages in 14s"; 189 MB of `node_modules` then, the trial agent's figure, not re-measurable after the later
  installs): `npm install --no-audit --no-fund @coderline/alphatab@1.9.0 vexflow@5.0.0
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
  outputs were replaced. (Verifier: the script as saved is a later version than the one r0020 ran; it adds an
  `est_staff` field and picks the TAB staff of a 2-staff MusicXML import. Re-running it on S2n.gp5, r0364 (--nolock),
  gave the same 90 notes and byte-identical MIDI, `.gp` and alphaTex files.)
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
  track, 960 ticks per quarter, tempo 112, program 24, 90 notes, all with velocity 95, 90 pitch-bend events (all on
  channel 0), 9 control changes on each of channels 0 and 1 (18 in all), a program change to 24 on each of those two
  channels and two tempo events, both 112 (counts corrected by the verifier with mido; the earlier text said 9 control
  changes). gtr-eval `notes` on S2n: onset F1 1.0 and onset+offset F1 1.0, 90/90 matched, median onset
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
  (The first version's run has no run id or saved log. The verifier rebuilt a file in that style from the final one, a
  `.` line after the metadata and `\ts 4 4`, and alphaTab 1.9.0 gave exactly these two diagnostics, with codes 400 and
  301: r0366. Re-running the final file, r0365, gave no diagnostics and the same 90 notes.)
- gtr-eval `tab` of the parsed result: S2n 90/90 matched, 90/90 same string and fret (e0024); S5capo2 90/90, 90/90,
  capo 2 (e0026); S5dropd 90/90, 90/90 (e0028). gtr-eval `notes` of alphaTab's MIDI from that alphaTex: onset F1 1.0
  for all three (e0025, e0027, e0030).

### Run 3: rendering in headless Chromium

- Page `scripts/pages/alphatab.html` (UMD `alphaTab.js`, `core.fontDirectory` pointing at the bundled Bravura fonts,
  workers on, page layout, scale 1), driver `scripts/shot.cjs` (waits for `postRenderFinished`, full-page PNG).
- Runs (all --nolock): S2n.gp5 r0059, S5capo2.gp5 r0066, S5dropd.gp5 r0067, alphaTex from the S2n truth r0068 and
  alphaTex from the S5capo2 truth r0070: 703, 1,434, 1,140, 861 and 1,111 ms from the driver's start (Chromium launch
  included) to `postRenderFinished`; alphaTab's own `renderFinished` event came 247.8, 614.6, 411.0, 311.3 and
  419.6 ms after the page script started. No console errors in any of them. A first attempt, r0058 (2 cores, after
  71.7 s in the slot queue), exited 1; its log was overwritten by r0059, so its error is not on record. (Verifier: the
  earlier text called the first numbers "from page load to render finished". Re-run r0367, --nolock: no console errors,
  `renderFinished` at 268.2 ms, and a screenshot identical to r0059's except 121 pixels of the "alphaTab.net" text at
  the top right.)
- What was drawn (screenshots `samples/alphatab/*.webp`): a standard-notation staff above a six-line TAB staff, 13 bars
  in three systems at 1,200 px width; the bass voice drawn in grey in both staves; tempo mark "Moderate ♩ = 112" (gp5) or
  "♩ = 112" (alphaTex); a dynamic "f" under bar 1 (the first bar after the count-in; alphaTab's printed bar numbers start
  at 1 on the count-in bar). For the three .gp5 files no title and no tuning name were drawn (the
  S5capo2.gp5 render shows "Capo. fret 2" above the count-in bar at the start of the first system); for the alphaTex
  files the title, the subtitle, "Guitar Standard
  Tuning" and (S5capo2) "Capo. fret 2" were drawn. In both
  capo renders (from the .gp5 and from the alphaTex) the standard notation shows the sounding pitches (A major, written
  with sharps as accidentals and no key signature) while the TAB shows frets counted from the capo (the same numbers as
  S2n). (Verifier: the earlier text gave the alphaTex's missing key signature as the reason; the .gp5 render looks the
  same, and no reason was established.) In the
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
  offs; 2 fewer than the notes: the missing two are the note-offs of the last two notes, which fall on the end tick
  49,920; verifier), type 242 (metronome): 52 = 13 bars x 4 beats, reported although `metronomeVolume`
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
  (Verifier: recomputed from the raw `out/alphatab-player/S2n_plain.player.json` with a separate script,
  `scripts/verify-trials/player_check.py`: the same n, median, min, max and standard deviation for the note-ons, the
  metronome intervals and the position events; the 90 type-128 ticks equal the 90 truth onsets converted to ticks.)
  Verifier's re-run of r0128 without a slot, r0406 (--nolock, 45.74 s wall, 13.8 s CPU, peak RSS 952.3 MB, exit 0):
  the same event counts (90 note-ons, 88 note-offs, 52 metronome, 49 `playedBeatChanged`, 2,409
  `playerPositionChanged`), note-ons a median +99.6 ms after their nominal time (min +91.0, max +105.4, standard
  deviation 4.4 ms), position events +95.3 ms (median), metronome spacing median 530.3 ms, `playerFinished` 27,961.5 ms
  after `play()`, and an offline export byte-identical to r0128's WAV (240.4 ms of page time). So the offset of about
  +131 ms in r0128 is not a fixed constant of alphaTab on this box; it was about +100 ms in the re-run under different
  CPU conditions. A pinned re-run was queued for a 2-core slot for 27 minutes without getting one and was cancelled
  (see the verification log).
- **Offline export** (`api.exportAudio`, same run): 371.6 ms of page time for 2,457,088 float samples (1,228,544
  stereo frames = 27.858 s at 44.1 kHz, the score's length without the clips' 1.5 s tail). The first sample above
  1e-4 in absolute value is frame 94,464 = 2.14204 s; the truth's first onset is 2.142857 s = frame 94,500 (94,464 =
  1,476 x 64). Peak 0.371. WAV kept outside git (see "Media kept outside git"). (Verifier: frame count, first frame
  above 1e-4, peak, sample rate, 2 channels and 32-bit float re-read from the WAV with soundfile; all as stated.)

### Run 4b: metronome, count-in, playback speed and transposition (functional check)

- Run r0317 (--nolock: not pinned to a slot, unlike r0128, while other lanes' jobs ran; 49.18 s wall for both configurations, one browser
  each), same driver, results `samples/alphatab/S2n_metro_countin.summary.json` and `S2n_transp2_speed2.summary.json`.
- **`api.metronomeVolume = 1`, `api.countInVolume = 1`:** 56 metronome events instead of 52: four extra at ticks 0,
  960, 1920, 2880 (120.5, 658.2, 1188.0, 1728.0 ms after `play()`), then the song's own tick 0 again at 2288.0 ms. The
  first `playerPositionChanged` that is not a seek event came 2,287.9 ms after `play()` (142.4 ms without count-in in
  r0128), and
  `playerFinished` at 30,138.5 ms. With one count-in bar (2,142.9 ms at 112 BPM) added to the nominal times: note-ons
  median +135.0 ms (n = 90, min +125.3, max +140.0); metronome spacing median 537.7 ms (nominal 535.7).
- **`api.playbackSpeed = 2.0` with `api.changeTrackTranspositionPitch(tracks, 2)`:** `playerFinished` came 14,053.7 ms
  after `play()` (27,994.4 ms at speed 1.0). In that run `midiEventsPlayed` reported 44 note-ons (type 128), 42
  note-offs and 27 metronome events, against 90, 88 and 52 at speed 1.0, and the first five metronome events still
  came 530 to 540 ms apart. The note-on `noteKey` values were the untransposed ones (43, 55, 50, 55, 43, 62, the same
  as at speed 1.0). Timing of those events (verifier, from `out/alphatab-player/S2n_transp2_speed2.player.json`): the
  44 note-ons arrived a median +122.3 ms (min +113.4, max +170.4) after their nominal time at speed 1.0
  (tick/960 x 60/112 s), that is 1.19 to 7.09 s later than their nominal time at speed 2.0; the highest note-on tick
  reported was 24,960 of the song's 49,920, and the last event arrived 14,053 ms after `play()`, at `playerFinished`.
  `playedBeatChanged` (49 events, all the beats) followed the speed-2.0 times (median +152.0 ms against
  tick/960 x 60/112/2 s), and `playerPositionChanged` reached tick 49,920 at a `currentTime` of 13,928.6 ms. So in this
  run `midiEventsPlayed` was reported on the speed-1.0 timeline and stopped at `playerFinished`, which accounts for the
  lower counts. UNVERIFIED: whether the sound followed speed 2.0 and the transposition (the live audio cannot be
  captured here), and why alphaTab reports `midiEventsPlayed` on the speed-1.0 timeline.
- **Transposition in the offline export** (`scripts/alphatab_transpose_export.cjs`, r0328, --nolock, 11.78 s): the
  first 4 s of S2n.gp5 exported three ways and the strongest spectral peak between 150 and 260 Hz measured over
  2.16 to 2.60 s (the first melody note, G3 = 196.0 Hz, over the G2 bass) with `scripts/wav_peak_hz.py` (Hann window,
  FFT zero-padded to 2^18, parabolic interpolation): plain export 195.78 Hz (MIDI 54.98); after
  `api.changeTrackTranspositionPitch(tracks, 2)` with default export options 195.78 Hz (MIDI 54.98, unchanged); with
  `AudioExportOptions.trackTranspositionPitches = Map {0 => 2}` 219.75 Hz (MIDI 56.98, two semitones up). So the export
  applies its own `trackTranspositionPitches` option and did not pick up the player's track transposition. (Verifier:
  re-run r0369 wrote three WAVs byte-identical to r0328's; a separate measurement with a Blackman window and a 2^19 FFT
  without interpolation gave 195.73, 195.73 and 219.71 Hz.)

### Run 5: editing hooks (the npm package ships no editor UI)

- Checked: the alphaTab intro page quoted above, whose only "edit" is the documentation site's "Edit this page" footer
  link (verifier, page re-read 2026-11-10; the earlier text said the page contains no "edit"); in `dist/alphaTab.d.ts` the
  word "editor" appears 5 times, in comments such as "This method can be used in applications when individual notes
  need to be played for lesson or editor style purposes." (`playNote`) and "This property is purely informative for
  external use like in editors." No editor component or editing UI was found in the package.
- (Verifier, 2026-11-10, read from the alphaTab repository clone at commit ec751a23, 2026-11-08, not run:) the
  repository has a separate package `packages/ui`, named `@coderline/alphatab-ui`, which the alphatab.net playground
  imports (`PlayerView`, `TexEditorPane`, `SettingsPanel`, `TrackPanel` in `website/src/components/Playground/index.tsx`);
  its transport controls have "Count-in" and "Metronome" toggle buttons (`packages/ui/src/player/controls/transport.tsx`).
  `npm view @coderline/alphatab-ui` answered "404 Not Found" on 2026-11-10.
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
  no `noteMouseDown`. Not investigated further. (Verifier's re-run of r0134, r0368: the same single `beatMouseDown`,
  and the edited `.gp` and alphaTex files byte-identical to r0134's.)
- (Gap round 2: a string change in the data model, r0624, and alphaTex edited through `@coderline/alphatab-monaco`,
  r0614; section "Gap round 2".)

### Output and input format facts (for handoffs)

- In: the intro page says "Feed it a Guitar Pro, MusicXML, CapXML, or alphaTex file". Tried here: .gp5 (3 files),
  alphaTex (6 files), alphaTab's own .gp export, GP3/GP4 written by TuxGuitar and PyGuitarPro, and MusicXML. (The
  imports of the GP3/GP4 files and of MuseScore 3.2.3's MusicXML ran outside gtr-run, so they have no run id; outputs
  in `out/alphatab-import/`, scored e0799, e0802, e0805 and e0792.) The
  reference 2-staff MusicXML imports as one track with two staves (staff 0 notation without tuning, staff 1 TAB with
  tuning [64, 59, 55, 50, 45, 40] and, for S5capo2, `capo` 2): 90/90 same string and fret for S2n, S5capo2 and S5dropd
  (r0272, r0273, r0275; e0843, e0847, e0852), and for the tab-only reference file (r0276, e0855). A MusicXML part
  without `<staff-tuning>` (music21's) imports with no string or fret (r0278, e0908); so does MuseScore 3.2.3's
  MusicXML of S2n.gp5, which has no TAB staff (e0792). TuxGuitar's MusicXML imports with the tuning one octave high
  (r0277, e0860). (Verifier: re-run of r0273, r0370, gave a byte-identical estimate file.)
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
  1,062 ms from the driver's start to done, 274.7 ms inside the drawing code, 13 bars, 90 note positions drawn, SVG
  25,408 characters, no console errors. Screenshot `samples/vexflow/S2n_tabstave.webp`: six-line TAB staves with the fret
  numbers of both voices in their columns and a "TAB" clef at the start of each line; no standard notation (not
  requested), no stems, no title, no tempo. (Verifier's re-run r0371: the same counts and SVG length, and a
  pixel-identical screenshot.)
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
  with `artist.render()` into SVG. S2n r0109 (--nolock): 1,352 ms from the driver's start to done, 149.6 ms inside parse
  and render, 4 staves, SVG 70,499 characters; S5dropd (`tuning=dropd`) r0144: 730 ms, 148.7 ms. (Verifier: the generator
  re-run on the truth wrote a file byte-identical to `samples/vextab/S2n.vextab`; re-run r0372 gave the same SVG length
  and a pixel-identical screenshot.) Console line: "Running VexTab.Div:
  4.0.3-5-g3a5e00d master 3a5e00d858ae98934ba545f9bef5eb923e17e402". Screenshots `samples/vextab/*.webp`: standard
  notation with a G-major key signature above each TAB staff, 13 bars on 4 lines, both voices drawn with stems up in
  the notation staff, "vexflow.com" printed at the bottom.
- **Input it needed:** VexTab text (my generator); no Guitar Pro or MusicXML importer. `tabstave` options include
  `tuning` with values "standard, dropd, eb, E/5,B/4,G/4,D/4,A/3,E/3" (the package's `doc/tutorial.html`); the
  tutorial and source have no capo option (searched for "capo" in `doc/tutorial.html`, `src/vextab.ts`,
  `src/artist.ts`: no hits; the verifier searched all of `src/` too: no hits).
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
  shared cache; the venv was 264 MB by `du -sh` at verification time, mostly hard links into the shared uv cache;
  `samples/music21/uv-pip-freeze.txt`).
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
  the estimate; the truth tuning is assumed" (e0191, e0193); `notes` onset F1 1.0 (e0192, e0194). (Verifier: re-run
  r0373 wrote the same MusicXML apart from the generated part id and the encoding date.)
- Not tried here: music21's ABC, MEI or Humdrum paths for tab; music21 has no Guitar Pro reader (verifier:
  `converter.Converter().subConvertersList()` in 10.5.2 registers abc, braille, capella, clercqTemperley, humdrum,
  lilypond, mei, midi, musedata, musicxml, noteworthy, romantext, scala, text, tinynotation, vexflow and volpiano, and no
  Guitar Pro format).

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
  shows its title twice (work title and movement title) and "Music21" as the composer line. (Verifier's re-run of
  r0158, r0374: the same counts and SVG length, and a pixel-identical screenshot.)
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

  Peak RSS 175 to 218 MB per run. `getLog()` was empty in all runs. (Verifier's re-runs of r0165 and r0174, r0375 and
  r0376: the same page count, `tabGrp`, `tab.course` and staffDef counts, byte-identical MIDI files, and MEI exports
  whose length differs by a few bytes because of the generated `xml:id`s.) Screenshots (`samples/verovio/*.webp`, SVG inlined
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
  "This application failed to start because no Qt platform plugin could be initialized." (no run id in the trial;
  reproduced by the verifier, r0403, exit -6). Command form:
  `mscore3 -o <out.ext> <in>`, the output format chosen by the extension.
- **Runs on S2n.gp5** (all --nolock, exit 0, peak RSS about 80 MB, 147 MB for PNG): MusicXML r0120 (0.47 s, 29,404
  bytes), compressed MusicXML .mxl r0121 (0.48 s, 2,360 bytes), MIDI r0122 (0.26 s, 689 bytes), PDF r0123 (0.53 s,
  33,121 bytes), PNG r0124 (0.91 s, `S2n-1.png`, 2480x3508), MuseScore .mscx r0125 (0.47 s). Log lines: "convert
  </home/user/gtr/inputs/S2n/S2n.gp5>...", "measures 13 bars.size 13", "... success!".
- **What the import produced:** a main score with one standard-notation staff in treble clef (no "8" under it) and no
  TAB staff (`samples/musescore3/S2n_gp5_page1.webp`); the `-o` exports (MusicXML, PDF, PNG, MIDI) are of that main
  score. The two Guitar Pro voices are kept as voices 1 and 2 (43 and 49 `<note>` elements including rests). The saved
  .mscx (r0125) also holds a part (excerpt) named "Guitar" with a standard staff and a linked six-line TAB staff
  (`<StaffType group="tablature">`, `tab6StrCommon`), so each of the 90 notes is in the file three times (verifier; the
  earlier text said only "no TAB staff"; re-run r0378 wrote the same structure). The .mscx stores `<fret>` and
  `<string>` on each note (270 `<fret>` lines = 90 notes x 3 staves; string numbers counted from 0 = highest) and the
  staff's open strings 40 45 50 55 59 64, but the MusicXML export has no
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
- (Verifier's re-runs: r0377, S2n.gp5 to MusicXML, the same file apart from the encoding date; r0379, the same `.gp`
  refusal and exit 1; r0380, S5capo2 MIDI byte-identical to r0190's; r0381, the S5capo2 reference MusicXML round trip,
  the same file apart from the encoding date.)
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
  S2n auto r0197 (4.76 s wall, 2.25 s CPU = 2.15 s user + 0.10 s system, 82 MB); S1 auto r0201 (5.67 s); S5dropd auto r0202 (4.9 s); S5capo2 auto
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
  LilyPond-chosen note landed too. Missing notes (corrected by the verifier; the earlier text put both on the
  `--sequence` input): in R1c the `--sequence` input merged 3 notes into a note of the same pitch starting within
  50 ms (B3 annotated on strings 2 and 3 in the same group, three times), so LilyPond got 145 notes; in R1a the input
  had all 189 notes, and LilyPond left out one A#2 of an F2 + A#2 chord with "warning: No string for pitch #<Pitch ais,
  > (given frets (4 1))" (r0207; the verifier's re-run r0383 gives the same warning and the same 188 positions). With
  `--strings truth` (S2n), 90/90 same string and fret (e0412). (Verifier's re-run of r0197, r0382: the same 90 tab
  positions, a byte-identical `.midi` and a pixel-identical PNG.)
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
- **LilyPond export:** written for `\version "2.14.0"`; LilyPond 2.24.3 reports "wrong type for argument 1.
  Expecting string, found #<unspecified>" at lines 86, 89, 96 and 101 of the file (each after "Guile signaled an error"
  at line 36 or 59), still draws and writes a PNG, and ends with "fatal error: failed files" (r0230, exit 1; corrected by
  the verifier from "stops with ... at line 101"); after `convert-ly -e` it compiles (r0232,
  7.22 s) into a notation + TAB score of both voices (`samples/tuxguitar/S2n_tuxguitar_ly_after_convert-ly.webp`).
- (Verifier's re-run of r0222, r0384: all seven files written for S5capo2.gp5 and the model dump are byte-identical to
  r0222's. Independently of gtr-eval, the verifier read S2n.tg.gp5, S5capo2.tg.gp4, S5dropd.tg.gp3 and
  alphatabgp7.tg.gp5 with PyGuitarPro and its own tick-to-seconds code and matched them with mir_eval: 90/90 notes on
  the truth's string and fret in each, capo 2 and Drop D tuning read; `scripts/verify-trials/independent_metrics.txt`.)

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
- (Verifier's re-run of r0236, r0385: the GP5, GP4, GP3 and edited GP5 files are byte-identical to r0236's; the
  summary JSON differs only in timings and paths.)

## abcjs 6.7.2 (npm `abcjs`), guitar tablature

- **What it is:** a JavaScript ABC-notation renderer and player; since version 6 it can add a tablature staff under
  each staff. https://www.npmjs.com/package/abcjs 6.7.2 (published to npm 2026-10-16), `ABCJS.signature` "abcjs-basic
  v6.7.2". `LICENSE.md` begins "Copyright (c) 2009-2026 Paul Rosen and Gregory Dyke" followed by the MIT text
  ("Permission is hereby granted, free of charge, to any person obtaining a copy ..."). Package 6.3 MB;
  `dist/abcjs-basic-min.js` 511,968 bytes.
- **Input made for it:** ABC has no syntax for string or fret, so abcjs chooses them. `scripts/truth_to_abc.py`
  (stdlib) writes the truth notes as ABC (`L:1/16`, `Q:1/4=112`, `K:` from the truth key, `V:1` melody and `V:2` bass
  joined on one staff with `%%score (1 2)`). The typings (`types/index.d.ts`) give the render option
  `tablature: [{ instrument: 'guitar' | 'mandolin' | 'fiddle' | 'violin' | '', capo, label, tuning, highestNote }]`; the
  source `src/tablatures/abc_tablatures.js` sets the guitar `defaultTuning: ['E,', 'A,', 'D', 'G', 'B', 'e']`, which in
  ABC pitch is E3 A3 D4 G4 B4 E5: one octave above the sounding open strings (written guitar pitch).
- **Runs** (page `scripts/pages/abcjs.html`, `ABCJS.renderAbc(div, abc, {add_classes: true, staffwidth: 1150,
  tablature: [...]})`; read-back `scripts/abcjs_tab_readout.cjs` assigns each `text.abcjs-tab-number` in the SVG to
  the nearest of the six lines of its tab staff (largest distance found 0.33 px) and orders notes by line and x; the
  pseudo-onset it writes is (line x 100,000 + x in px) / 1,000 s. The page runs are all --nolock; the read-back JSON
  files were written by separate runs of `abcjs_tab_readout.cjs` outside gtr-run (21:39 UTC, no run id; verifier):
  - ABC at sounding pitch, default tuning, r0239 (render 67 ms in the page): the notation is drawn an octave low
    (ledger lines below the staff) and 42 of the 90 tab positions are drawn as "?" (`samples/abcjs/S2n.webp`).
  - ABC one octave up (`--written-octave`), default tuning, r0241 (render 141 ms in the page; 850 ms from the driver's
    start to done): 90 fret
    numbers on 4 tab staves, no "?"; gtr-eval `tab --ignore-time` (matched by note order, since the read-back has no
    times): 88/90 matched, 88/88 on the same string and fret as the truth (e0638) (`samples/abcjs/S2n_written.webp`).
  - S5capo2 one octave up with `capo: 2`, r0244: 90 numbers; read back with capo 2: 88/90 matched, 88/88 same string
    and fret, capo agreeing (e0655). S5dropd one octave up with `tuning: ['D,', 'A,', 'D', 'G', 'B', 'e']`, same run:
    88/90 matched, 88/88 same string and fret (e0659).
  - The 2 unmatched notes in each case (settled by the verifier; the earlier text left the cause UNVERIFIED): every
    read-back holds the same 90 (string, fret, pitch) triples as the truth. On the last tab line the notes are about
    43 px apart, so with the read-back's pseudo-onsets (x / 1,000 s) gtr-eval's default 50 ms chord window put two
    successive beats into one group of 4 notes and the next two into a group of 3; ordered by pitch inside the
    group, two notes fall out of the order-based matching. Scored again with `--chord-window 0.01`: 90/90 matched and
    90/90 on the truth's string and fret for S2n (e1332), S5capo2 with capo 2 (e1333) and S5dropd (e1334). So the two
    are an effect of the read-back's time scale with that window, not of abcjs's string choice.
  - (Verifier's re-run of r0241, r0386, with a new read-back: the same 90 positions, a byte-identical read-back JSON
    and a pixel-identical screenshot.)
- **Constraint inputs:** `tablature[].tuning` (any tuning, as ABC pitches), `tablature[].capo`, `highestNote`; per-note
  string choice is not in ABC.
- **Not tried:** abcjs's synth/playback (`ABCJS.synth`). Its editor helper `ABCJS.Editor` was tried, see "Editable
  tab in the browser" below. (Gap round 2: the `dragging` and `clickListener` options were tried too, r0598.)

## svguitar 2.10.1 and vexchords 1.2.0 (chord diagrams)

- **What they are:** two JavaScript libraries that draw chord-box diagrams as SVG. svguitar
  https://www.npmjs.com/package/svguitar 2.10.1 (published to npm 2026-10-17), `LICENSE` "Copyright 2017 Raphael
  Voellmy" with the MIT text ("Permission is hereby granted, free of charge, ..."), 2.7 MB. vexchords
  https://www.npmjs.com/package/vexchords 1.2.0 (published to npm 2019-03-31), `package.json` `"license": "MIT"`,
  1.3 MB. Both installed 2026-11-10 with the npm command at the top.
- **Input:** two shapes from the truth tabs, G (320003, as in S3) and Bm (x24432, as in S4). svguitar:
  `new svguitar.SVGuitarChord(el).configure({strings: 6, frets: 4, position, tuning}).chord({fingers: [[string,
  fret]...], barres: [{fromString, toString, fret}]}).draw()`, string 1 = highest, fret 0 = open, 'x' = muted, frets
  relative to `position`. vexchords: `draw(el, {chord: [[string, fret]...], position, barres}, {width, height})`,
  string 1 = highest.
- **Runs** (page `scripts/pages/chords.html`, all --nolock): svguitar r0253: both diagrams drawn (2 SVGs), with the
  dots on the strings and frets given and the Bm barre with a "2fr" position label. vexchords from the package's `dist/vexchords.js`: "TypeError: A[e]
  is not a constructor" inside svg.js `addTo` (r0253 with svguitar on the page, r0254 with an element instead of a
  selector, r0255 alone on the page). Loading its ES-module source directly fails because `index.js` imports
  `'./chordbox'` without an extension (404, r0256). Bundled from its source with esbuild 0.25.12 (`npm install
  --no-save esbuild@0.25.12`, then `esbuild node_modules/vexchords/index.js --bundle --format=iife
  --global-name=vexchordsESM`, 178,249 bytes; page `scripts/pages/vexchords_esm.html`) it draws both diagrams
  (r0259). Screenshot of both libraries: `samples/chords/svguitar_vexchords_G_Bm.webp` (the bottom row, labelled
  "ESM", is the esbuild bundle). The two 404s of r0256 are the two extensionless imports of `index.js`, `'./chordbox'`
  and `'./builder'` (verifier). (Verifier's re-runs r0388 and r0389: the same `A[e] is not a constructor` error from
  `dist/vexchords.js` with svguitar's 2 SVGs drawn, and the bundle drawing both diagrams with a pixel-identical
  screenshot.)

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
  (Verifier: the pitch-class sets recomputed from `S3.truth.json` with that rule match the nine rows; the C-chord notes
  ring until 19.05 s. Re-run r0390 wrote the same JSON apart from the timings.)

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
| GP5 -> alphaTab -> MIDI | 90/90 | - (MIDI has none) | yes | - | sounding pitches equal the truth's | e0007, e0011, e0017 |
| truth -> alphaTex (my writer) -> alphaTab | 90/90 | yes | yes | yes | yes | e0024, e0026, e0028 |
| alphaTab `.gp` -> MuseScore 3.2.3 | refused ("unknown file suffix <gp>") | - | - | - | - | r0178 |
| alphaTab `.gp` -> TuxGuitar 1.5.6 (gpx v7 reader) | 90/90 | yes | yes | yes | (capo 0 file) | e0477 |
| alphaTab `.gp` -> TuxGuitar -> GP5 / GP4 / GP3 | 90/90 each | yes | yes | yes | - | e0479, e0480, e0481 |
| GP5 -> MuseScore 3.2.3 -> MusicXML | 90 notes, no TAB staff (the exported main score; the `.mscx` also holds a part "Guitar" with a TAB staff, r0125) | no `<string>/<fret>` | - | - | - | e0141 |
| GP5 -> MuseScore 3.2.3 -> MIDI | 90/90 | - | yes | Drop D yes | capo: pitches 2 semitones low | e0145, e0378, e0374, e0376 |
| GP5 -> TuxGuitar -> GP5 / GP4 / GP3 | 90/90 | yes | yes | yes | yes | e0457 to e0459, e0464 to e0466, e0471 to e0473 |
| GP5 -> TuxGuitar -> MusicXML | 90 notes, pitches and staff tuning one octave high | 0 of the 16 pitch matches | - | octave high | dropped | e0460, e0467, e0474 |
| GP5 -> TuxGuitar -> ASCII tab | 90/90 (by order) | yes | no times in the format | letters only, no octave | no field | e0461, e0468, e0475 |
| GP5 -> TuxGuitar -> LilyPond -> LilyPond 2.24.3 | compiles only after `convert-ly -e` | not read back | - | - | - | r0230, r0232 |
| GP5 -> TuxGuitar -> MIDI | 90/90 | - | yes | - | sounding pitches equal the truth's | e0462, e0469, e0476 |
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
| truth -> ABC one octave up -> abcjs tab (strings chosen by abcjs) | 88/90 by order with the default 50 ms chord window; 90/90 with `--chord-window 0.01` | 88/88; 90/90 same as truth | - | option | option (`capo`) | e0638, e0655, e0659; e1332 to e1334 |
| truth notes -> LilyPond TabStaff (strings chosen by LilyPond) | all for the S clips; R1a 188/189 (one note left out by LilyPond), R1c 145/148 (3 merged by the `--sequence` input) | S clips 100 %; GuitarSet 47 to 88 % | - | `stringTunings` | no property | e0399, e0413 to e0418 |
| truth -> VexTab text -> VexTab | drawn | drawn | - | `tuning=` | no option | r0109, r0144 |
| GP5 / alphaTab `.gp` -> webmscore 1.2.1 -> MusicXML | 90 notes, no TAB staff | no `<string>/<fret>` | - | - | - | e0990, e0995, e1002 |
| GP5 / alphaTab `.gp` -> webmscore -> MIDI | 90/90 | - | yes | - | sounding pitches equal the truth's (S5capo2 too) | e0992, e0999, e1006 |
| reference 2-staff MusicXML -> webmscore -> MusicXML | 90/90 by pitch | 0/90 (TAB staff kept, positions changed) | yes | written octave high | - | e1009 |
| GP5 / TuxGuitar GP3 -> guitarpro-parser 2.0.0 | 90/90 | yes | yes | yes | yes | e1101, e1103, e1105, e1110 |
| alphaTab `.gp` -> guitarpro-parser | refused ("FretCount property without <Number>") | - | - | - | - | r0298 |

Readers and writers by format, as run here (r = read, w = write):

| format | alphaTab | MuseScore 3.2.3 | webmscore 1.2.1 | TuxGuitar 1.5.6 (plugins) | PyGuitarPro 0.11 | guitarpro-parser 2.0.0 | music21 10.5.2 | Verovio 6.4.1 | OSMD 2.3.0 | LilyPond 2.24.3 | abcjs 6.7.2 | gtr-eval |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GP3 / GP4 | r | not tried | not tried | r w | r w (one voice) | r (GP3) | - | - | - | - | - | r |
| GP5 | r | r | r | r w | r w | r | - | - | - | - | - | r |
| GP7 `.gp` (alphaTab's export) | r w | refused | r | r (gpx v7 reader) | - | refused | - | - | - | - | - | refused (its README) |
| MusicXML with TAB | r | r w | r w (positions changed) | w (octave high) | - | - | r w (writes no tuning/capo) | r | r | - | - | r |
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
  (Verifier's re-runs: r0392 without either workaround and r0393 with the navigator shim only exited 1 with the same
  two errors; r0394 with both wrote MusicXML and MIDI byte-identical to r0288's and files of the same sizes.)
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
  (Verifier's re-runs: r0395, S5capo2.gp5, a byte-identical output JSON; r0396, the same refusal of the `.gp`.)
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
  (`samples/abcjs/S2n.written.edited.abc`, `editor_edit_trial.json`, screenshot `editor_after_edit.webp`; in the
  screenshot the changed "2" is on the third tab line). The editing surface tried was the ABC text. (Verifier: the
  earlier text added "there is no click-on-the-tab editing in abcjs", which nothing here tested; the typings in
  `types/index.d.ts` declare the render options `clickListener`, `dragging` and `selectTypes` and a `ClickListenerDrag`
  with a `step` field. They were not tried, so whether a note can be changed by clicking or dragging it in the
  notation or the tab is UNVERIFIED. Re-run r0387 gave a byte-identical edited file and the same single changed
  number.) (corrected in gap round 2: tried, r0598, section "Gap round 2". A click on a note or a tab number hands the
  application the note's place in the ABC text, and in `ABCJS.Editor` selects that text in the textarea, where typing
  changes it; a drag or arrow key moves the drawing and reports a step, and nothing changes until application code
  rewrites the ABC.)
- **alphaTab, run (Run 5 above):** the npm package ships no editor UI (the repository's unpublished
  `@coderline/alphatab-ui`, used by the alphatab.net playground, was not run); a mouse click on a rendered note produced a `beatMouseDown`
  event (bar, voice, beat) once the player was ready; changing `Note.fret` in the model and calling `render()`
  redrew the tab, and the edit survived a GP7 export (r0132, r0134).
- **muzart (thegedge/muzart), NOT RUN HERE:** cloned (`git clone --depth 1`, commit 0e61e67300698a182680344cdf82ebf76d3451b1,
  2026-06-18; 3.2 MB; a pnpm monorepo with packages canvas, editor, layout, loaders (guitarpro.ts, musicxml.ts),
  notation, playback, render, testing; 678 packages in `pnpm-lock.yaml`; the editor is a Vite 8 + React 18 app). The
  next step, `pnpm install --frozen-lockfile` (which runs that repository's dependency install), was denied by this
  session's permission check ("Code from External"), so it was not built or opened. Its README gives a demo URL,
  https://thegedge.github.io/muzart/ (answers HTTP 200 from this box; not opened in the browser here). Steps for Aaron
  are in for-aaron.md. (Verifier: the clone's facts above re-checked: commit, size, packages, 678 entries in the
  lockfile's `packages:` section, `vite` ^8.0.16 and `react` ^18.3.1 in `packages/editor/package.json`, MIT license; the
  clone has no `node_modules`. The permission refusal is the trial agent's report; no log of it was saved.)
- **VexTab 4.0.5 editor mode (run by the verifier):** VexTab's `Div` (in `dist/main.prod.js`) renders every
  `div.vextab-auto`; with `editor="true"` it adds a textarea holding the VexTab text and re-renders 250 ms after a key
  is released (`src/div.ts`). Page `scripts/pages/vextab_editor.html` holds the S2n VexTab text
  (`samples/vextab/S2n.vextab`) in such a div; driver `scripts/verify-trials/vextab_editor_edit.cjs` reads the fret
  numbers VexFlow drew (text inside `g.vf-tabnote`), selects the first `:q 0/3` in the textarea, types `:q 2/3` with
  Playwright's keyboard, waits 1.2 s and reads them again. r0407 (--nolock, 2.83 s wall, exit 0): 90 numbers before and
  after; the first changed from 0 to 2 and no other changed; no editor error shown; the console printed the same
  "Running VexTab.Div: 4.0.3-5-g3a5e00d ..." line (`samples/vextab/editor_edit_trial_verifier.json`, screenshot
  `samples/vextab/editor_after_edit_verifier.webp`, where the "2" is on the third tab line and the notation shows A).
  As with abcjs, the editing surface is the text; clicking on the drawn tab was not tried. (Gap round 2: a string
  change typed the same way, r0625.)
- **Not tried for lack of time:** `@coderline/alphatab-monaco` (alphaTex editing in
  the Monaco editor), tab-editor (calesce, 2017), It's MyTabs (a viewer/player, needs Deno or Docker), Autostrum and
  Songshed (no license file per the survey), TuxGuitar's desktop GUI, Power Tab Editor (desktop). (corrected in gap
  round 2: `@coderline/alphatab-monaco` 1.9.0 with its language server was installed and run, r0604, r0614, r0618;
  section "Gap round 2". The others are still not tried.)

## Gap round 2

Agent `gapfill-web-tab-render`, 2026-11-11 (UTC). It closes the two gaps the completeness critic listed for this lane
(`GAPS.md`, rows W1 and W2): editing on the drawn tab (abcjs's click and drag options, and the alphaTab editor package
`@coderline/alphatab-monaco`), with a record of how each tool run in this lane lets a user change a string or a fret;
and HAYA-TAB (survey only, `survey.md` section "HAYA-TAB"). Conventions as at the top of this file: run ids from the
ledger, eval ids from gtr-eval 0.11.1, test pages served by `scripts/serve.cjs` on 127.0.0.1:8765, the box's
pre-installed Playwright 1.63.0 with its headless Chromium (`chromium.launch()` with no options in every driver below;
nothing was installed for the browser). Every run below took a 2-core slot. Free disk before the installs: 7.4 GB
(`df -h /`).

### abcjs 6.7.2: click, drag and keyboard gestures on the drawn notation and tab (W1)

- **What abcjs says the options do.** The "Selecting and Dragging" page (https://docs.abcjs.net/visual/dragging.html,
  read 2026-11-11): "turns on dragging. The user will be able to click on an element, (or use the tab key to go
  through the elements) and, if it is a draggable element, move it visually. When the user has finished moving the
  element, the click listener is called. The underlying music is not changed to reflect the user's action. The
  clickListener function should modify the ABC string and rerender if the user has made a change." and "step are the
  number of visual positions the note was dragged. A negative number means that the note was dragged flatter and
  positive means it was dragged sharper." The click-listener page (https://docs.abcjs.net/visual/click-listener.html,
  same date) gives the callback as `function clickListener(abcelem, tuneNumber, classes, analysis, drag,
  mouseEvent)`. In the installed source: `src/write/draw/selectables.js` makes notes and tab numbers clickable when
  `selectTypes` is not given (comment "by default, only notes and tab numbers can be clicked.") and marks both
  draggable; `src/write/interactive/selection.js` turns the vertical mouse distance into steps of `spacing.STEP`
  (30 x 93 / 720 = 3.875 px at scale 1) and gives arrow-key and Enter handlers only to elements whose `selectable`
  attribute is "true", which needs `selectTypes`; `src/edit/abc_editor.js` replaces the page's clickListener with the
  Editor's own `highlight()`, which selects the clicked element's ABC text in the textarea (`setSelection` in
  `abc_editarea.js` also focuses the textarea) and then calls the page's listener.
- **Pages and driver** (written for this round): `scripts/pages/abcjs_click_drag.html` (`ABCJS.renderAbc` with
  `dragging: true`, a `clickListener` and the same guitar `tablature` option as the earlier abcjs runs; `mode=listen`
  only records the listener's arguments; `mode=apply` does what the docs page asks of the application: when
  `drag.step` is not 0 on a note or tab number, my code moves the note letter in the ABC text between
  `abcelem.startChar` and `endChar` by -step diatonic steps, accidentals dropped so the key signature decides sharps,
  and renders again), `scripts/pages/abcjs_editor_click.html` (`ABCJS.Editor` with the tablature option and a
  recording clickListener; `dragging=1` optional), driver `scripts/abcjs_click_drag.cjs` (mouse moves and clicks at
  the centre of a note head or tab number in page coordinates; a drag is four mouse-move steps). Input: the S2n ABC
  at written pitch (`samples/abcjs/S2n.written.abc`), whose melody bar 1 is `G4 G4 d4 d4` (sounding G3 G3 D4 D4),
  drawn as tab 0, 0 on string 3 and 3, 3 on string 2.
- **Run:** r0598 (2 cores, 12.63 s wall for five fresh pages in one browser, CPU 1.6 s, peak RSS 141.6 MB, exit 0, no
  slot wait); result `samples/abcjs/gap2_click_drag.json`. Two unlogged dry runs of the same driver before it found
  two faults in my code, both fixed before r0598: the `startChar`..`endChar` text abcjs gives for the first note
  includes the spaces around it (" G4 "), which my first note-moving code did not accept; and in the Editor page the
  focused textarea scrolled the page, so the second click landed off the drawing (the driver now scrolls to the top
  before each click).

  | trial | gesture (melody, bar 1) | what the clickListener received | what changed |
  |---|---|---|---|
  | A listen | click the head of note 1 | `el_type` "note", text " G4 " (characters 125 to 129), `pitches` [{pitch 4, name "G"}], analysis line 0, measure 1, voice 0, `drag.step` 0 | nothing |
  | A listen | click the tab number of note 1 | `el_type` "tabNumber", the same characters 125 to 129, no `pitches`, `drag.step` 0 | nothing |
  | A listen | drag the head of note 1 up 3.875 px | "note", `drag.step` -1 | the head drawn 3.875 px higher (`transform="translate(0,-3.875)"`); the ABC text and all 90 tab numbers unchanged |
  | A listen | drag the head of note 2 down 3.875 px | "note", text "G4 ", `drag.step` +1 | drawn 3.875 px lower; nothing else |
  | A listen | drag the tab number of note 3 down by one tab-line spacing (11.63 px) | "tabNumber", text "d4 ", `drag.step` +3 | the "3" drawn 11.625 px lower, on the next line down; the ABC text and the tab numbers unchanged |
  | B apply | drag the head of note 1 up 3.875 px | step -1; the page rewrote " G4 " as " A4 " | redrawn: note 1 from 0 on string 3 to 2 on string 3 (A3) |
  | B apply | drag the head of note 2 down 3.875 px | step +1; "G4 " -> "F4 " (F sharp from `K:G`) | note 2 from 0 on string 3 to 4 on string 4 (F#3) |
  | B apply | drag the tab number of note 3 down one tab line | step +3; "d4 " -> "A4 " | note 3 from 3 on string 2 to 2 on string 3 (A3) |
  | C keyboard, `selectTypes: ['note']` | click the head of note 1, press ArrowUp, press Enter | click: step 0; Enter: step -1 (event "keyup"); " G4 " -> " A4 " | ArrowUp drew the head 3.875 px higher; after Enter, note 1 from 0 to 2 on string 3. Tab-number groups had no `selectable` attribute in this mode |
  | D Editor | click the tab number of note 1, type " A4 " | the Editor selected " G4 " (125 to 129) in the textarea and focused it | redrawn: note 1 from 0 to 2 on string 3 |
  | D Editor | click the tab number of note 2, type "F4 " | the Editor selected "G4 " (129 to 132) | note 2 from 0 on string 3 to 4 on string 4 |
  | E Editor, `dragging: true` | drag the head of note 1 up 3.875 px | the page's listener: "note", step -1; the Editor selected " G4 " | the textarea text and the tab numbers unchanged |

  Tab numbers were read as in `abcjs_tab_readout.cjs` (each `text.abcjs-tab-number` assigned to the nearest of its
  staff's six lines). No tab number other than those listed changed: after B, 3 of the 90; after D, 2 of the 90.
  gtr-eval `tab --ignore-time --chord-window 0.01` against the S2n truth: B 87/90 matched by pitch (the three moved
  notes have new pitches) and 87/87 on the truth's string and fret (e1763); D 88/90 and 88/88 (e1764). Edited ABC:
  `samples/abcjs/gap2_B_apply.edited.abc` (bar 1 `A4 F4 A4 d4`) and `gap2_D_editor.edited.abc` (bar 1 `A4 F4 d4 d4`);
  read-backs `gap2_B_apply.tab.json`, `gap2_D_editor.tab.json`; screenshots `gap2_A_listen_after_drags.webp` (the three
  moved elements), `gap2_B_apply_after_drags.webp`, `gap2_D_editor_after_edits.webp`.
- **Drag direction against the docs:** dragging up gave a negative step and dragging down a positive one, in the
  notation and in the tab; the docs page says "A negative number means that the note was dragged flatter". The page's
  apply code moved the pitch up for a negative step.
- **Two notes on one string.** After the F#3 edit (B and D), abcjs put the melody's "4" on string 4 at the same x
  position (beat 2 of bar 1) as the bass voice's open D, "0" on string 4: two simultaneous notes on one string, drawn
  on top of each other in `gap2_B_apply_after_drags.webp`. abcjs chose string 4 for the new pitch itself.
- **In short:** a click on a note or a tab number gives the application the note's place in the ABC text; a drag or an
  arrow key gives a step count in staff positions (a tab number is dragged in the same 3.875 px steps, not by
  strings); abcjs itself changes neither the ABC nor the tab. A change appears only when application code rewrites
  the ABC and renders again (here the page's `mode=apply`), or when the user types in the `ABCJS.Editor` textarea. The
  string follows from the pitch: no gesture or option tried here selects a string.
- **Input and output format facts:** in: ABC text and the `tablature` option; out: the redrawn SVG, the listener's
  `abcelem` (with `startChar`, `endChar`, `el_type`, and `pitches` for notes), and the ABC text the application keeps.

### @coderline/alphatab-monaco 1.9.0: alphaTex edited in Monaco, alphaTab redrawing (W1)

- **What it is, where from.** npm `@coderline/alphatab-monaco` 1.9.0 (published 2026-10-31T21:22:43Z; npm description "A
  Monaco editor integration for alphaTab providing coding assistance for alphaTex."), from the alphaTab monorepo's
  `packages/monaco`. Its README (in the package, and at
  https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/README.md, read 2026-11-11): "This is a
  Monaco Editor integration for writing alphaTex, providing coding assistance to code editors." (link markup dropped)
  with the features
  "Setup Monaco for the use with TextMate Grammars", "Setup Monaco with the basic alphaTex language (grammar and
  language configuration)." and "Setup Monaco to integrate with a alphaTab Language server running in a web worker.",
  and the warning "This package is still in a very experimental stage." It exports `addTextMateGrammarSupport`,
  `registerAlphaTexGrammar` and `registerGrammar` (main entry), `basicEditorLspIntegration` (`./lsp`) and a worker
  entry (`./worker`) that starts the language server of `@coderline/alphatab-language-server` 1.9.0. Nothing in it
  draws a score or connects the editor to alphaTab: redrawing after an edit is application code. License:
  `"license": "MPL-2.0"`; the package's `LICENSE` begins "alphaTab Monaco is licensed under MPL-2.0." (survey,
  alphaTab section).
- **Install** (2026-11-11, in its own folder so the earlier install stays as it was):
  `cd /home/user/gtr/lanes/web-tab-render/web-monaco && npm install --no-audit --no-fund --ignore-scripts
  @coderline/alphatab-monaco@1.9.0`, "added 14 packages in 9s" (none of the 14 declares an install script in its
  registry entry, so `--ignore-scripts` skipped nothing). 125 MB of `node_modules`: `monaco-editor` 0.57.0 105 MB,
  `@coderline` (alphatab 1.9.0, alphatab-monaco, alphatab-language-server) 15 MB, the rest under 5 MB; the tree is in
  `samples/alphatab-monaco/npm-ls-monaco.txt` (monaco-editor 0.57.0 with dompurify 3.4.15 and marked 14.0.0,
  vscode-textmate 9.3.2, vscode-oniguruma 2.0.1, vscode-languageserver 11.0.0, vscode-languageserver-protocol 3.18.5,
  vscode-jsonrpc 10.0.0, vscode-languageserver-types 3.18.5, vscode-languageserver-textdocument 1.0.16). The package's
  `dist/*.mjs` import CommonJS packages by bare name (`vscode-languageserver-protocol/browser` and others), which a
  browser cannot load without a bundler, so `npm install --no-audit --no-fund --no-save esbuild@0.25.12` (the esbuild
  version this lane used for vexchords; "added 2 packages in 1s") went into the same folder.
- **Build:** `scripts/build_alphatab_monaco.sh` (entry `scripts/alphatab_monaco_entry.mjs`), r0604 (2 cores, 1.25 s
  wall, CPU 1.7 s, peak RSS 384.6 MB, slot wait 15.6 s, exit 0, no esbuild warnings) wrote to
  `/home/user/gtr/lanes/web-tab-render/web/bundles/alphatab-monaco/`: `editor.js` 6,287,979 bytes and `editor.css`
  175,371 bytes (Monaco and the package; Monaco's ESM build imports 135 CSS files), `codicon-LTRFOK3N.ttf` 153,228
  bytes, `editor.worker.js` 307,296 bytes (Monaco's own worker) and `alphatex-lsp.worker.js` 1,599,875 bytes (the
  language server with alphaTab inside).
- **Page:** `scripts/pages/alphatab_monaco.html`, wired the way the alphatab.net playground's source wires the same
  package (`packages/ui/src/editor/monaco-env.ts`, `AlphaTexEditor.tsx` and `use-score-document.ts` at commit
  ec751a23, read 2026-11-11): `onig.wasm` from vscode-oniguruma, `registerAlphaTexGrammar(addTextMateGrammarSupport(
  wasm))`, a Monaco model in language `alphatex`, `basicEditorLspIntegration(editor, worker, {languageId: 'alphatex',
  diagnosticsDelay: 150, completionRange})` (the playground's `DIAGNOSTICS_DELAY_MS = 150` and its `typedTokenRange`),
  and under the editor alphaTab 1.9.0 (the lane's UMD build) drawing the editor's text with `api.tex(text)` 250 ms
  after the last change (the playground's `TEX_RENDER_DELAY_MS = 250`). The editor is 1,000 px tall, so all 52 lines
  of the input are on screen without scrolling.
- **Run:** driver `scripts/alphatab_monaco_edit.cjs`, r0614 (2 cores, 12.84 s wall, CPU 1.1 s, peak RSS 144.8 MB, slot
  wait 64.1 s, exit 0). Input: the S2n truth alphaTex (`samples/alphatab/S2n.truth.atex`, 864 bytes; melody bar 1 on
  line 11, `0.3.4 0.3.4 3.2.4 3.2.4 |`; bass bar 1 on line 25, `3.6.4 0.4.4 3.6.4 0.4.4 |`; notes are
  fret.string.duration with string 1 = highest). In the page: grammar registered 84.6 ms after the page script
  started, language server initialised in 327.6 ms, first score drawn at 656.0 ms; no diagnostics on the unedited
  text. Every edit was made with the mouse and the keyboard (Playwright `mouse.dblclick` at the screen position of a
  character, `keyboard.type` and `keyboard.press`); the page only reported positions and state. A double-click on a
  digit selected that digit alone.

  | step | gesture | line after | what alphaTab drew (string counted from the top, fret, sounding MIDI pitch) | diagnostics in the editor |
  |---|---|---|---|---|
  | 1 fret | double-click the "0" at line 11 column 1, type "2" | `2.3.4 0.3.4 3.2.4 3.2.4 \|` | note 1: string 3, fret 2, pitch 57 (was string 3, fret 0, 55) | none |
  | 2 string | double-click the "0" at column 7, type "5" | `2.3.4 5.3.4 3.2.4 3.2.4 \|` | note 2: string 3, fret 5, pitch 60 (an intermediate render) | none |
  | | double-click the "3" at column 9, type "4" | `2.3.4 5.4.4 3.2.4 3.2.4 \|` | note 2: string 4, fret 5, pitch 55 (the same G3, on the D string) | none |
  | 3 string 7 | double-click the "6" at line 25 column 3, type "7" | `3.7.4 0.4.4 3.6.4 0.4.4 \|` | not redrawn: alphaTab's error event "There are errors in the parsed alphaTex, check the diagnostics for details" (console: "Error AT208(25,3)->(25,4): Note string is out of range. Available range: 1-6"); the score of step 2 stayed on screen and in `api.score` | one marker from the language server: severity 8 (error), code "AT208", source "alphaTab", "Note string is out of range. Available range: 1-6", line 25, columns 3 to 4 (a red underline, `samples/alphatab-monaco/S2n.monaco_string7.webp`) |
  | | press Control+Z | `3.6.4 0.4.4 3.6.4 0.4.4 \|` | redrawn | none |
  | 4 capo | click after the end of line 6 (`\tuning (E4 B3 G3 D3 A2 E2)`), End, Enter, type "\ca" | new line 7 `\ca` | while "\ca" stood in the text the 250 ms redraw ran: alphaTab reported "Error AT204(7,1)->(7,4): Unrecognized metadata 'ca'." and kept the previous score | the suggestion list showed 12 rows, the first "\capo, Set the capo fret, Function" |
  | | Escape, type "po 2" | `\capo 2` | capo 2; notes 1 and 2 now pitch 59 and 57 (frets and strings unchanged, frets counted from the capo) | none |

- **Export and read-back.** After step 2 the page exported Guitar Pro 7 (`Gp7Exporter`, 4,691 bytes) and alphaTex
  (`AlphaTexExporter`, 2,072 characters); the editor's own text (864 bytes) differs from the input only on line 11.
  After step 4: `.gp` 4,700 bytes, alphaTex 2,084 characters, editor text 872 bytes (one line added). Read back under
  Node with `scripts/alphatab_node_model.cjs`, r0618 (2 cores, 0.77 s wall for the three files, slot wait 36.8 s,
  exit 0):

  | file | read back (melody bar 1, notes 1 and 2) | gtr-eval `tab` (onsets within 50 ms) |
  |---|---|---|
  | `.gp` after step 2 | string 3 fret 2 pitch 57 at 2.142857 s; string 4 fret 5 pitch 55 at 2.678571 s | against S2n: 89/90 matched (the A3 no longer matches the truth's G3), 88/89 on the truth's string and fret, string difference +1 for one note (e1780) |
  | editor text after step 2 (alphaTex) | the same | the same numbers (e1782) |
  | `.gp` after step 4 | capo 2, tuning [40, 45, 50, 55, 59, 64]; frets and strings as above | against S5capo2 (the same tab with a capo on fret 2): 89/90 matched, 88/89, capo 2 stated in the file and equal to the truth's (e1784) |

  Files in `samples/alphatab-monaco/`: both `.gp`, both editor texts, the alphaTex export of step 2, the two read-backs
  (`*.gp.est.json`), `alphatab_monaco_edit.json` (every state above) and three screenshots.
- **Two notes on one string, here too.** After step 2 the melody's G3 (fret 5 on string 4) and the bass voice's open D3
  (string 4) start together at 2.678571 s. The language server reported nothing, alphaTab drew the "5" over the bass's
  grey "0" on the same line (`S2n.monaco_edited.webp`), and the `.gp` export kept both notes on string 4.
- **Input and output format facts:** in: alphaTex text (fret.string.duration; `\capo`, `\tuning` and other metadata
  lines); out: what the application exports from alphaTab (here `.gp` and alphaTex); the editor's text is itself
  alphaTex.
- **Constraints accepted through the editor:** whatever alphaTex alphaTab accepts; typed here: a fret, a string and
  `\capo 2`. A string outside 1 to 6 was refused with AT208.
- **Failures:** none in r0614. Two unlogged dry runs fixed my page and driver: a call to Monaco's `revealPosition`
  before reading a character's screen position shifted the scroll position, so a click landed on line 3 (removed);
  and the wait after the string-7 edit ran into its 30 s timeout, because no new render comes when the alphaTex does
  not parse (the driver now also stops on alphaTab's error event).
- **After the run, disk freed and the run repeated.** The editor install's `node_modules` (135 MB with esbuild) was
  deleted except `vscode-oniguruma` (520 KB; the page loads its `onig.wasm`); the bundles (8.2 MB) stay in
  `web/bundles/alphatab-monaco/`, and the install command above rebuilds the rest. The same driver then ran again,
  r0663 (2 cores, 12.26 s wall, CPU 1.2 s, peak RSS 145.6 MB, slot wait 120.1 s, exit 0): the six exported and editor
  files were byte-identical to r0614's and every step gave the same notes and markers; the language server
  initialised in 180.0 ms and the first score was drawn at 448.9 ms (327.6 ms and 656.0 ms in r0614).

### Changing a string or a fret: what each tool run in this lane offers

For every tool that ran in this lane: can a user change a note's string or fret (a) through a built-in editing
interface, (b) only by changing the data and drawing or converting again, or (c) not at all. The run ids are the runs
that show it; those of this round are r0598, r0614, r0624, r0625 and r0626. Where the cell says "no
change-and-redraw run", the run shows that the positions are taken from the data given, and no run changed one.

| tool | fret | string | how, and the runs that show it |
|---|---|---|---|
| `@coderline/alphatab-monaco` 1.9.0 with alphaTab 1.9.0 | (a) | (a) | typed in the alphaTex text in Monaco, with completion and error markers from the language server; the redraw after an edit is application code (this page; the playground's source does the same) (r0614) |
| alphaTab 1.9.0 (`@coderline/alphatab`) | (b) | (b) | `Note.fret` (r0132), and `Note.string` with `Note.fret` (r0624), set in the data model, then `api.render()`; no editing UI in the package; a mouse click gave `beatMouseDown` only (r0134) |
| abcjs 6.7.2 | (a) through text; (b) through drag | (c) | text: the `ABCJS.Editor` textarea, typed after clicking the note or its tab number (r0312, r0598 D); drag and arrow keys: abcjs reports a step and changes nothing, the application rewrites the ABC (r0598 A to C); ABC has no string, abcjs picks it from the pitch (r0598: F#3 put on string 4) |
| VexTab 4.0.5 | (a) through text | (a) through text | editor-mode textarea: fret (r0407), string (r0625) |
| VexFlow 5.0.0 | (b) | (b) | the program gives every `TabNote` position (r0110); no change-and-redraw run |
| OpenSheetMusicDisplay 2.3.0 | (b) | (b) | draws the `<technical><string>`/`<fret>` of the MusicXML it is given (r0158); no editing API used; no change-and-redraw run |
| Verovio 6.4.1 | (b) | (b) | toolkit `edit()` with `set` on `tab.fret` and `tab.course` changed the MEI and the drawn fret text (r0626, e1827); or the input MEI or MusicXML (r0165); no UI |
| MuseScore 3.2.3, command line | (b) | (b) | the positions of a TAB MusicXML input were kept on output for S2n (r0179, e0367) and changed for the capo file (r0180, e0368); its desktop editor was not run (for-aaron.md item 1) |
| webmscore 1.2.1 | (c) | (c) | no editing in the package (survey's tool list: "Edits" no); a TAB MusicXML input came out with 0/90 of its positions kept (r0291, e1009) |
| LilyPond 2.24.3 | (b) | (b) | string numbers written in the `.ly` text (r0211, e0412); without them LilyPond chooses (r0197) |
| TuxGuitar 1.5.6, format plugins headless | (b) | (b) | the positions of the input file kept by its readers and writers (r0221); no change-and-rewrite run; its desktop editor was not run (for-aaron.md item 5) |
| PyGuitarPro 0.11 | (b) | (b) | string 3 fret 0 -> string 4 fret 5 in the data model, written as GP5 (r0236) |
| music21 10.5.2 | (b) | (b) | `StringIndication` and `FretIndication` set by the program (r0153); no change-and-rewrite run |
| guitarpro-parser 2.0.0 | (c) | (c) | reads only: no writer, no drawing (r0294) |
| svguitar 2.10.1, vexchords 1.2.0 | (b) | (b) | chord-box dots given as [string, fret] by the program (r0253, r0259); no change-and-redraw run |
| Tonal 6.5.1 | (c) | (c) | no string or fret in what it computes (r0251) |
| ChordSheetJS 18.0.0 | (c) | (c) | chord sheets: a `{capo}` directive and `transpose()`, no string or fret (r0251) |

### The three smaller runs behind that table

- **alphaTab 1.9.0, a string change in the data model:** `scripts/alphatab_model_string_edit.cjs` on `S2n.gp5` in
  `pages/alphatab.html`, r0624 (2 cores, 1.10 s wall, CPU 0.8 s, peak RSS 138.8 MB, exit 0): melody bar 1 note 2,
  `Note.string` 4 -> 3 and `Note.fret` 0 -> 5 (alphaTab counts strings from the lowest, so string 3 -> 4 counted from
  the top), then `api.render()`; `realValue` stayed 55; GP7 export 4,981 bytes
  (`samples/alphatab/gap2_S2n.string_edit.edited.gp`, `gap2_S2n.string_edit.json`, `.webp`). Read back under Node
  (r0627, 2 cores, 0.27 s wall together with the Verovio file below, exit 0): 90/90 matched, 89/90 on the truth's
  string and fret, string difference +1 for one note (e1826).
- **VexTab 4.0.5 editor mode, a string change:** `scripts/vextab_editor_string_edit.cjs` on the verifier's page
  `pages/vextab_editor.html`, r0625 (2 cores, 2.24 s wall, CPU 0.8 s, peak RSS 131.1 MB, exit 0): the second `:q 0/3`
  selected in the textarea (with `setSelectionRange`, as r0407 did) and `:q 5/4` typed with the keyboard; after the
  redraw, 90 fret numbers as before, one changed: "0" on string 3 -> "5" on string 4 (each number assigned to the
  nearest of its stave's six lines; none more than 4.5 px from its line); no editor error text
  (`samples/vextab/gap2_editor_string_edit.json`, `.webp`).
- **Verovio 6.4.1, `edit()` on MEI tablature:** the package's typings (`dist/types/verovio-toolkit.d.ts`) declare
  `edit(editorAction: EditorAction): boolean;` with the comment "Edit the MEI data.", and `EditorTypes.d.ts` lists the
  actions (among them `set` with `elementId`, `attribute` and `value`, `drag`, `undo`, `redo`).
  `scripts/verovio_edit_tab.cjs` on `samples/verovio/S2n.truth.mei`, r0626 (2 cores, 0.54 s wall, CPU 0.8 s, peak
  RSS 195.0 MB, exit 0): `set` note 1 `tab.fret` "2", note 2 `tab.course` "4", note 2 `tab.fret` "5" each returned
  true, and after each `getMEI()` held the new value; the fret text drawn by `renderToSVG(1)` became "2" for note 1,
  stayed "0" for note 2 after the course change and became "5" after its fret change (which line the note was drawn
  on was not measured); `editStatus()` gave canUndo true. One `undo` then restored all three values (canUndo false,
  canRedo true). The edited MEI (`samples/verovio/gap2_S2n_edit.edited.mei`), read with `scripts/mei_tab_to_json.py`
  (r0627): 89/90 matched, 88/89 on the truth's string and fret, string difference +1 for one note (e1827).

### HAYA-TAB (W2)

Not run here. It is a desktop program (Go with Wails v3 and a Vue 3 frontend) offered as builds on GitHub Releases,
which this box cannot list (github.com answers 403 from here); survey only (`survey.md`, section "HAYA-TAB"). Its source
at commit eb0466a (2026-07-31) uses alphaTab as the viewer (lockfile: 1.8.1); no file in `frontend/src` calls an
alphaTab exporter or sets a note's string or fret; its edit dialog edits library metadata (title, artist, album, type,
tag, country, language). Steps for Aaron: for-aaron.md item 8.

### Files of this round

Scripts: `scripts/abcjs_click_drag.cjs`, `scripts/pages/abcjs_click_drag.html`, `scripts/pages/abcjs_editor_click.html`,
`scripts/alphatab_monaco_entry.mjs`, `scripts/build_alphatab_monaco.sh`, `scripts/pages/alphatab_monaco.html`,
`scripts/alphatab_monaco_edit.cjs`, `scripts/alphatab_model_string_edit.cjs`, `scripts/vextab_editor_string_edit.cjs`,
`scripts/verovio_edit_tab.cjs`; for the record itself, `scripts/gap2_check_quotes.py` (every quote added in this round
against its saved source: 55 of 55 found, `samples/verify/gap2_quote_check.tsv`) and `scripts/gap2_update_tools_json.py`
(the same facts in `tools.json`, including a `string_fret_change` field per tool). Full outputs (PNG screenshots,
logs): `/home/user/gtr/lanes/web-tab-render/out/` `abcjs-click-drag/`, `alphatab-monaco/`, `alphatab-monaco-rerun/`,
`alphatab-edit/`, `vextab/`, `verovio/`. No audio or video was made in this round.

## Not run here

- **MuseScore Studio 4.x (AppImage):** not downloaded. The trial agent reports `df -h /` between 9.5 GB and 5.3 GB
  free on the shared disk during the trials. The shell setup file `/home/user/gtr/env.sh`, sourced before every
  command (not `gtr-run`, as the earlier text said), prints the orchestrator notice "start no new download or install
  over 200 MB unless your lane cannot finish without it" whenever less than 9,000 MB is free. The Ubuntu package
  MuseScore 3.2.3 and webmscore (MuseScore 3 engine) were run instead. Steps for Aaron: for-aaron.md item 1.
  Facts added by the verifier (2026-11-10): the x86_64 AppImage that musescore.org's download page links is
  `MuseScore-Studio-4.7.6.261022093-x86_64.AppImage`, 192,616,952 bytes (HTTP Content-Length of
  https://github.com/musescore/MuseScore/releases/download/v4.7.6/MuseScore-Studio-4.7.6.261022093-x86_64.AppImage,
  read with a HEAD request, nothing downloaded); this box has `/dev/fuse` but no `fusermount` and no libfuse library, so the
  AppImage would have to be unpacked (`--appimage-extract`; unpacked size not measured) or FUSE installed before it
  could run. The verifier did not download it either (4.9 to 5.9 GB free on the shared disk during the verification).
- **muzart** (browser tab editor): cloned but not installed; this session's permission check refused running the
  repository's `pnpm install` ("Code from External"; the trial agent's report, no saved log). for-aaron.md item 2.
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
  (corrected in gap round 2: `@coderline/alphatab-monaco` and the alphaTex language server were run, r0614; the rest
  of this list stands.)
- **HAYA-TAB** (desktop tab library with an alphaTab viewer; added in gap round 2): not run. A Wails v3 desktop program
  whose builds are on GitHub Releases, which this box cannot list (github.com answers 403); facts from its source are
  in "Gap round 2" and in the survey. for-aaron.md item 8.
- **Video inputs (R3a, R3b, R3c):** not used; this lane renders and converts tab files, it does not read audio or
  video.

## Media kept outside git

| file | size | duration | what it is |
|---|---|---|---|
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-player/S2n_plain.export.wav` | 9,828,396 bytes | 27.858 s | alphaTab 1.9.0 `api.exportAudio()` of `S2n.gp5` with its bundled Sonivox SoundFont: 44.1 kHz, 2 channels, 32-bit float, metronome off (run r0128). Reference playback of the ground-truth tab as alphaTab renders it. |
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.plain.wav` | 1,413,164 bytes | 4.005 s | first 4 s of the same export (r0328) |
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.changeTrackTranspositionPitch.wav` | 1,413,164 bytes | 4.005 s | same, after `changeTrackTranspositionPitch(tracks, 2)`; measured pitch unchanged (r0328) |
| `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.exportOption.wav` | 1,413,164 bytes | 4.005 s | same, exported with `trackTranspositionPitches` {0: 2}: two semitones up (r0328) |

No other audio or video was produced by this lane (the MIDI files are listed in the sections above; gap round 2 made
none). Screenshots are WebP under `samples/` (all under 300 KB; the full
PNGs are in `/home/user/gtr/lanes/web-tab-render/out/`).

The verifier's re-runs wrote more audio, also outside git: `/home/user/gtr/lanes/web-tab-render/verify-trials/rerun/alphatab-player-nolock/S2n_plain.export.wav`
(r0406, byte-identical to r0128's export) and three 4 s WAVs in
`/home/user/gtr/lanes/web-tab-render/verify-trials/rerun/alphatab-transpose/` (r0369, byte-identical to r0328's).

## Verification log (verify-trials-web-tab-render, 2026-11-10)

Independent check of this file and of `for-aaron.md` against the run ledger, the scoring ledger, the saved outputs
and re-runs. Every correction above is marked "verifier" in place. Scripts and tables of this check are in
`scripts/verify-trials/`; re-run outputs are in `/home/user/gtr/lanes/web-tab-render/verify-trials/rerun/`.

**What was checked**

- **Run ledger.** The 98 run ids cited before verification all exist in `/home/user/gtr/ledger/runs.jsonl` under lane
  `web-tab-render`; the trial agent's runs are 101 rows, r0017 to r0328 (not 93 as its closing summary said). Uncited
  rows were r0058 (exit 1), r0276 and r0293 (an earlier identical run of r0294); r0058 and r0276 are now cited. Every
  wall time, CPU time, peak RSS, core count and exit code quoted was compared with the ledger: one CPU figure was
  wrong (r0197) and the description of the `--nolock` runs ("under 3 s") was wrong; both fixed. Every run with a
  nonzero exit (r0058, r0178, r0206, r0230, r0279 to r0286, r0298) is described as a failure or refusal.
- **Scoring ledger.** The 103 eval ids cited all exist and all are gtr-eval 0.11.1 (the text said 0.8.x; fixed).
  Every number quoted was compared with the stored result. All 103 were re-run with the same arguments and
  `--no-ledger`: 103 results identical to the stored ones, no exit code changed
  (`scripts/verify-trials/reeval.py`, `reeval_results.tsv`).
- **Independent recomputation** without gtr-eval's code (`scripts/verify-trials/independent_metrics.py`, output in
  `independent_metrics.txt`): 27 comparisons for alphaTab, the reference MusicXML, music21, Verovio, MuseScore 3.2.3,
  LilyPond, TuxGuitar (its GP files read with PyGuitarPro and timed here), PyGuitarPro, webmscore, guitarpro-parser and
  abcjs, with `mir_eval.transcription` (onset 50 ms, pitch 50 cents); all agree with the quoted values. The player
  timing statistics were recomputed from the raw event log (`player_check.py`); the Tonal pitch-class sets from
  `S3.truth.json`; the transposition peaks with a different window and FFT size.
- **Files.** Every file named exists. 20 samples were byte-compared with their `out/` copies: all identical. MIDI
  files were read with mido, WAVs with soundfile, MusicXML/MEI/mscx with ElementTree or grep. Screenshots viewed:
  alphaTab (S5capo2, S5dropd, S2n alphaTex, S5capo2 alphaTex), VexFlow, VexTab, MuseScore 3.2.3, LilyPond, OSMD
  (S5capo2, music21), Verovio (MEI, 2-staff), abcjs (sounding pitch, editor), chord diagrams, webmscore.
- **Re-runs** (all `gtr-run --lane web-tab-render`, labels starting "verify", `--nolock` because about 15 jobs of
  other lanes were queued for the two slots): r0364 to r0390 and r0392 to r0396 (`scripts/verify-trials/rerun_batch.sh`,
  its output `rerun_batch_output.txt`), r0403, r0406, r0407; scored e1332 to e1334. Outcome per tool:
  alphaTab r0364 to r0370 and r0406 (same notes; byte-identical MIDI, `.gp`, alphaTex, edited files and WAVs; render
  identical except 121 pixels of the "alphaTab.net" text; player event counts the same, note-on offset +99.6 ms
  against +130.8 ms in r0128), VexFlow r0371, VexTab r0372, music21 r0373, OSMD r0374, Verovio r0375 and r0376,
  MuseScore 3.2.3 r0377 to r0381 and r0403, LilyPond r0382 and r0383, TuxGuitar r0384, PyGuitarPro r0385, abcjs r0386
  and r0387, svguitar/vexchords r0388 and r0389, Tonal/ChordSheetJS r0390, webmscore r0392 to r0394,
  guitarpro-parser r0395 and r0396: the same counts and outputs as the trial runs (byte-identical where the tool writes
  no ids or dates; the differences are named in each section). Expected failures failed the same way.
- **NOT RUN reasons.** MuseScore 4: the reason was sharpened with measured facts (AppImage size 192,616,952 bytes, no
  FUSE tools on the box) and the notice's source corrected (`env.sh`, not `gtr-run`). muzart: the clone facts were
  re-checked; the permission refusal has no saved log and is marked as the trial agent's report. Soundslice and
  Flat.io: the survey's table says "service; account needed". Survey tools "not tried for lack of time": all are
  marked RUNNABLE in the survey's table.
- **Format statements** were checked in the files themselves (MusicXML elements, MEI staffDefs and courses, mscx
  staves and parts, MIDI events, ASCII headers, JSON fields).
- **Judging language:** "correct dots", "sounding pitch correct" and "correct tab" replaced with the plain fact; no
  other judging words found.
- **Secrets, personal data, sizes:** no key, token, password or personal detail in the lane folder; no file over
  300 KB; no audio or video in this lane's folder under `docs/`.

**What was changed (besides the wording fixes above)**

- MuseScore 3.2.3: its `.mscx` holds a part "Guitar" with a TAB staff (the text said only "no TAB staff");
  for-aaron.md item 1 now asks to open the parts too.
- LilyPond: the R1a missing note was left out by LilyPond with a warning, not by the `--sequence` input.
- abcjs: the "2 unmatched notes" UNVERIFIED is settled (read-back time scale with the 50 ms chord window; 90/90 with
  `--chord-window 0.01`, e1332 to e1334); the unsupported "no click-on-the-tab editing in abcjs" became UNVERIFIED.
- alphaTab player at speed 2.0: the "why fewer events" UNVERIFIED is replaced by the measured timelines.
- alphaTab: MIDI control-change count, render timing definition, the "edit" on the intro page, the capo-render
  reason, the r0058 attempt, the `@coderline/alphatab-ui` facts.
- TuxGuitar's LilyPond export: error lines and the PNG written despite exit 1.
- VexTab editor mode run by the verifier (r0407); taken off the "not tried" list.
- for-aaron.md: the MuseScore 3.2.3 and webmscore facts, the MuseScore 4 reason, item 7's playground steps tied to the
  playground source.

**Still UNVERIFIED**

- A pinned (2-core slot) re-run of r0128 waited in the slot queue from 22:02 to 22:29 UTC (about 15 jobs of other lanes
  queued) and was cancelled without having run, so it has no ledger line; whether the +130.8 ms of r0128 repeats under
  a slot is not settled. The unpinned re-run r0406 is reported above.
- Whether alphaTab's live sound followed `playbackSpeed` 2.0 and `changeTrackTranspositionPitch` (no audio device).
- Whether abcjs's `dragging`/`clickListener` options can change a note from the notation or the tab (not tried).
  (corrected in gap round 2: settled by r0598. They change nothing by themselves: a drag reports a step to the
  clickListener and the application has to rewrite the ABC; e1763, e1764.)
- The muzart permission refusal (no saved log) and the trial agent's disk readings of 9.5 to 5.3 GB.
- The 189 MB `node_modules` size after the first npm install (overwritten by later installs).
- The live alphatab.net playground was not opened; for-aaron.md item 7 rests on the repository source at commit
  ec751a23.
