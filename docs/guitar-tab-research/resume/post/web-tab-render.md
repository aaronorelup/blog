<!-- RUNDOWN -->
- **My agents listed 80 tools, formats and sound banks for showing, editing and playing a tab, and 18 ran on the cloud box.** Of the six that read my synthesized test piece's tab file, alphaTab, guitarpro-parser, PyGuitarPro and TuxGuitar kept all 90 notes on the known string and fret.

<!-- SECTION -->
## Showing, editing and playing a tab in the browser

The app's tab screen would draw the tab, play it and let you fix a wrong string or fret. My agents listed 80 entries for it, and 18 ran on the cloud box, fed known tabs instead of audio. In abcjs and VexTab, typing over one note's text changed that one fret number and none of the other 89.

<ao-compare cols="2" aspect="4/3">
<figure><img src="/media/guitar-tab-tools/web-tab-render-abcjs-sounding-pitch.webp" alt="Music drawn by abcjs under a title: three rows of four bars, low notes hanging on ledger lines below the staff, and under each row a tab staff where many of the fret numbers are question marks."><figcaption><b>abcjs 6.7.2, ABC at sounding pitch</b><span class="ao-meta">S2n's known notes written in ABC, a text notation for tunes, at the pitch they sound. 42 of the 90 tab positions came out as question marks. First 12 of 13 bars.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-abcjs-written-pitch.webp" alt="The same music drawn by abcjs from ABC one octave higher: three rows of four bars with the notes sitting on the staff, and a fret number at every position on the tab staff below each row."><figcaption><b>abcjs 6.7.2, ABC an octave up</b><span class="ao-meta">The same notes written an octave higher, the way guitar music is notated. All 90 tab positions came out as fret numbers. First 12 of 13 bars.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-alphatab-s2n.webp" alt="Guitar music drawn by alphaTab: 13 bars in three rows, each a notation staff above a six-line tab staff with fret numbers, the bass notes in grey, a tempo mark of 112 at the top left and a small alphaTab.net mark at the top right."><figcaption><b>alphaTab 1.9.0</b><span class="ao-meta"><code>S2n.gp5</code>, the known tab as a Guitar Pro file, drawn in Chrome running with no window. Notation over tab, all 13 bars.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-alphatab-monaco-edit.webp" alt="A code editor full of alphaTex, numbered lines of numbers such as 3.2.4, with line 11 reading 2.3.4 5.4.4 3.2.4 3.2.4. Below it, alphaTab's drawing of the first 6 bars, notation over a six-line tab staff, with a 2 and a 5 in the first bar of music and a small alphaTab.net mark at the top right."><figcaption><b>@coderline/alphatab-monaco 1.9.0</b><span class="ao-meta">S2n's known tab as alphaTex, alphaTab's text format, in the Monaco code editor, after a new fret and a new string were typed on line 11. Below, the first 6 of the 13 bars as alphaTab redrew them. The new 5 is drawn over the bass's 0 on the same string.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-musescore3-s2n.webp" alt="The first page MuseScore 3.2.3 made from the same Guitar Pro file: a title, then 13 bars of standard notation on one staff in two rows, and no tab staff."><figcaption><b>MuseScore 3.2.3</b><span class="ao-meta">The same <code>S2n.gp5</code> opened from the command line. Page 1 has no tab staff, the six lines with fret numbers. The saved file also holds a part named Guitar, the music for one instrument on its own, and that part has a tab staff.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Every tool here got files made from the known answers, never audio, so each count is against a known tab (guitar music written as fret numbers on six lines). Mostly that was S2n, a 29-second fingerstyle clip I synthesized so every note is known. S5capo2 is the same piece with a capo (a clamp across the strings that raises every note) on fret 2. S5dropd is the same piece in Drop D, with the low string tuned down to D and the bass re-fingered. A note is matched when it starts within 50 ms of a known note with the same pitch. "Shared" means the run wasn't pinned to 2 of the box's 4 cores, so it ran while up to two timed jobs of other lanes used the processor. Wall time is start to finish on the clock. Peak memory is the most memory the run used at once, from my agents' log of every run. Everything ran on the box, at no cost beyond the cloud session.

**abcjs 6.7.2** ([link](https://github.com/paulrosen/abcjs)). A JavaScript library that draws ABC, a text notation for tunes, as sheet music, and can add a tab line under it.

- In: the known notes of S2n, S5capo2 and S5dropd, written as ABC text by my agents' script `truth_to_abc.py`. ABC has no string or fret, so abcjs picks them.
- Command or settings: `ABCJS.renderAbc(div, abc, {add_classes: true, staffwidth: 1150, tablature: [...]})` in headless Chrome (a browser running with no window), with `capo: 2` for S5capo2 and `tuning: ['D,', 'A,', 'D', 'G', 'B', 'e']` for S5dropd. For editing, `new ABCJS.Editor('abc', {canvas_id, abcjsParams: {tablature: [...]}})` on a text box.
- Out: SVG, a drawing format for web pages, with notation and a tab line. With the ABC at the pitch the notes sound, 42 of the 90 tab positions were drawn as `?` (r0239). Written one octave up, all 90 were fret numbers. Read back from the SVG, all 90 had the known string and fret in S2n, in S5capo2 with capo 2 and in S5dropd (e1332, e1333, e1334). The first count of the S2n read-back gave 88 of 90 (e0638) because of how the read-back timed the notes, not because of the strings abcjs chose. Editing: typing `A4` over the first melody note `G4` in the text box changed the first tab number from 0 to 2, and the other 89 stayed the same (r0312). Clicking and dragging on the drawing were tried later, with `dragging: true` and a `clickListener` (r0598). A click on a note head or on its tab number passed the page that note's place in the ABC text. A drag moved only the drawing, in steps of 3.875 px, and passed the page a step count. Dragging a tab number down to the next line of the tab passed the page 3 of those steps. The ABC text and all 90 tab numbers stayed the same. With `selectTypes` set, ArrowUp and Enter on a clicked note head did the same as a drag up. abcjs's docs say `The underlying music is not changed to reflect the user's action. The clickListener function should modify the ABC string and rerender if the user has made a change.` When the page's own code rewrote the ABC from the steps of three drags, 3 of the 90 tab numbers changed. Read back and compared by note order, 87 of 90 matched, since the three moved notes have new pitches, and all 87 were on the known string and fret (e1763). In the `ABCJS.Editor` page, clicking a tab number selected that note's ABC in the text box, and typing over two notes changed 2 of the 90. Compared the same way, 88 of 90 matched, all 88 on the known string and fret (e1764). Dragging up gave a negative step, and the docs say `A negative number means that the note was dragged flatter`. Where an edit made an F sharp, abcjs put it on string 4, fret 4, where the bass's open D also starts at that moment, and drew the two numbers on top of each other.
- Time: shared, 2.2 s wall for the whole run with Chrome's start, 123.6 MB peak, and 141 ms for the drawing inside the page (r0241). The click and drag run, five fresh pages in one browser, took 12.63 s wall on 2 cores, 141.6 MB peak (r0598).
- Takes as a hint: `tablature[].tuning` (the open strings, played with no finger down, lowest first) and `tablature[].capo`. Its options also include `highestNote`, which wasn't tried. ABC has no way to say which string a note is on, and whether abcjs can be made to use a given string was not verified. In its 6.7.2 source, my agents found no input for a note's string: a single note goes on the highest-pitched string whose open pitch is at or below the note. For editing on the drawing it takes `dragging`, a `clickListener` and `selectTypes`.
- Hands off to: the edited ABC text is the saved file. My agents read the fret numbers back from the SVG's `text.abcjs-tab-number` elements to count them. Its player wasn't tried.

**alphaTab 1.9.0** ([link](https://github.com/CoderLine/alphaTab)). A library for web pages that reads Guitar Pro, MusicXML (a sheet-music file format) and its own text format alphaTex, draws notation and tab, and plays them with its own synthesizer.

- In: `S2n.gp5`, `S5capo2.gp5` and `S5dropd.gp5`, the known tabs as Guitar Pro 5 files (the format of the Guitar Pro tab program), written with PyGuitarPro when the clips were made. Also alphaTex and MusicXML with a tab staff that my agents wrote from the same known tabs, and files the other tools wrote.
- Command or settings: in Node.js (JavaScript outside a browser), `alphaTab.importer.ScoreLoader.loadScoreFromBytes()`, then `exporter.Gp7Exporter` and `exporter.AlphaTexExporter`, then both files opened again. In headless Chrome, the player with `player.enablePlayer: true`, `playerMode: EnabledSynthesizer` and the bundled `sonivox.sf2`, then `api.play()` and `api.exportAudio()`. Metronome click (a tick on every beat) and count-in (one bar of ticks before the song starts): `api.metronomeVolume = 1` and `api.countInVolume = 1`.
- Out:
  - Reading: 90 of 90 notes on the known string and fret in each of the three files, with capo 2 and the Drop D tuning read (e0004, e0008, e0012). Saved as a Guitar Pro 7 `.gp` file and opened again, 90 of 90 each (e0005, e0009, e0015). Saved as alphaTex and opened again, 90 of 90 each (e0006, e0010, e0016). alphaTex and MusicXML written from the known tabs, 90 of 90 each (e0024, e0026, e0028, e0843, e0847, e0852). Each note in its data has `string`, `fret` and `realValue` (the sounding pitch), and its string numbers run the other way from the files, with 1 the lowest string.
  - Drawing: notation above a six-line tab, 13 bars in three rows, no errors in the browser's log (r0059). For S5capo2 it printed `Capo. fret 2` above the first bar, the tab counted frets from the capo and the notation showed the sounding pitches (r0066). Every drawing of these 13-bar pieces has a small `alphaTab.net` mark at the top right.
  - MIDI, a list of notes with start times: 90 notes, all 90 matched (e0007).
  - Playing S2n (r0128): 90 note events, 52 metronome events (13 bars of 4 beats, sent even with the metronome's volume at 0), and `playerFinished` 27,994 ms after `play()`. Each note event came 121.9 to 139.1 ms after its place in the song, median 130.8 ms. These are event times in a browser with no sound card, not sound at a speaker. A rerun that wasn't pinned to 2 cores had a median of 99.6 ms (r0406). With the count-in and the metronome on, 4 extra metronome ticks came first, and alphaTab's first report of where it was in the song came 2,287.9 ms after `play()` (r0317). The exported audio file, a WAV, is 27.858 s long.
  - Transposing moves every note up or down by the same number of semitones, and one fret is one semitone. After `api.changeTrackTranspositionPitch(tracks, 2)` the first melody note of the exported audio still measured 195.78 Hz. With the export option `trackTranspositionPitches` set to 2 it measured 219.75 Hz, two semitones up (r0328). At `api.playbackSpeed = 2.0` the play-through ended 14,053.7 ms after `play()` (r0317). Whether the live sound followed `api.playbackSpeed = 2.0` and `api.changeTrackTranspositionPitch(tracks, 2)` wasn't checked, since the box has no sound card.
  - Editing: a mouse click on a drawn note gave one `beatMouseDown` event once the player was ready, and no `noteMouseDown` (r0134). Setting the first melody note's `fret` from 0 to 2 in its data and calling `api.render()` redrew the tab, and the saved `.gp` had that note on string 3, fret 2 (r0132). Setting the second melody note's `string` and `fret` the same way moved its G from string 3, fret 0 to string 4, fret 5, counted from the top, where the bass's open D also starts at that moment. alphaTab drew and saved both, with nothing in the browser's log. The saved `.gp` read back with 90 of 90 matched and 89 of 90 on the known string and fret (r0624, e1826). No editor screen was found in the package alphaTab puts on npm, the public store for JavaScript libraries. Its makers' separate alphaTex editor packages ran too (@coderline/alphatab-monaco, below).
  - The melody of the first bar after the file's silent count-in bar, from its alphaTex export, each note as fret, string and length:

  ```text
        |
          0.3.4
          0.3.4
          3.2.4
          3.2.4
        |
  ```

- Time: reading, saving and reopening S2n took 0.30 s wall on 2 cores, 83.1 MB peak (r0020). Drawing S2n, shared, took 703 ms from the start of the driver script to the finished drawing, Chrome's start included (r0059). Playing it through with the audio export took 53.81 s wall on 2 cores, 28 s of it playback, 737.8 MB peak (r0128). The string change took 1.10 s wall on 2 cores, 138.8 MB peak (r0624).
- Takes as a hint: capo (`Staff.capo`, or `\capo` in alphaTex), tuning and string count (`Staff.stringTuning`, `\tuning`), and each note's `string` and `fret`. In alphaTex, tempo is `\tempo` and the time signature (beats per bar) is `\ts`. The player takes `api.playbackSpeed`, `api.metronomeVolume`, `api.countInVolume` and `api.changeTrackTranspositionPitch()`. alphaTab also has `api.playbackRange`, `api.isLooping` and, in its docs, sync points to a recording (`FlatSyncPoint`). None of those three were tried.
- Hands off to: its `.gp` file opened in TuxGuitar with 90 of 90 (e0477) and in webmscore (r0290). MuseScore 3.2.3 refused it with `unknown file suffix <gp>` (r0178) and guitarpro-parser with `GuitarProError: Cannot read this Guitar Pro 7+ (.gp) file (track 1): staff 1 of track 0 has a FretCount property without <Number>.` (r0298). It has no exporter for MusicXML or for MEI, another sheet-music file format.

**ChordSheetJS 18.0.0** ([link](https://github.com/martijnversluis/ChordSheetJS)). A JavaScript library that reads and writes chord sheets, chord names over lyrics, and transposes them.

- In: a ChordPro sheet, a text format for chords over lyrics, written from the chord labels of S3, a synthesized strummed-chord clip (`S3.chordpro`).
- Command or settings: `ChordProParser`, `TextFormatter`, `HtmlDivFormatter`, `song.transpose(2)` then `ChordProFormatter`, and `ChordsOverWordsParser`.
- Out: it read the title, key `G`, tempo `96`, capo `0` and the 9 chords `G Em Am D7 G Em C D7 G` (my agents' converter had written the A minor 7 as `Am`). `HtmlDivFormatter` gave 919 characters of HTML. Transposed up 2 it gave `{key: A}` and this line:

  ```text
  [A]la [F#m]la [Bm]la [E7]la [A]la [F#m]la [D]la [E7]la [A]la
  ```

- Time: shared, 1.24 s wall for the run it shared with Tonal, 88.1 MB peak (r0251).
- Takes as a hint: ChordPro's `{capo}`, `{key}` and `{tempo}`, and `transpose(n)`.
- Hands off to: nothing was fed from it. ChordPro's makers say of a `{start_of_tab}` block, the format's section for guitar tab, `The lines will not be folded or changed.` No tab block was tried with ChordSheetJS.

**@coderline/alphatab-monaco 1.9.0 and @coderline/alphatab-language-server 1.9.0** ([link](https://github.com/CoderLine/alphaTab)). Two packages from the alphaTab project for typing alphaTex in Monaco, a code editor that runs in a web page. The language server is the helper behind the editor. It checks the text with alphaTab's own alphaTex reader, `AlphaTexImporter`, marks errors and suggests what to type. The Monaco package carries its own copy of the language server's code. The Monaco package's README says `This package is still in a very experimental stage.`

- In: S2n's known tab as alphaTex, `S2n.truth.atex` (864 bytes), which my agents wrote from the known answers. Every edit was made in the editor with the mouse and the keyboard, by a script.
- Command or settings: `npm install --no-audit --no-fund --ignore-scripts @coderline/alphatab-monaco@1.9.0` added 14 packages, 125 MB, 105 MB of it `monaco-editor` 0.57.0. esbuild 0.25.12 packed them into files a web page can load (r0604). The page wires the editor with `registerAlphaTexGrammar`, `addTextMateGrammarSupport` and `basicEditorLspIntegration` with `diagnosticsDelay: 150`, the way the source of the alphatab.net playground, alphaTab's own test page, does. Under the editor, alphaTab 1.9.0 draws the editor's text with `api.tex(text)` 250 ms after the last change. Nothing in the package draws music or connects the editor to alphaTab, so that redraw is the page's own code, as it is in the playground's.
- Out (r0614):
  - A fret: double-clicking the `0` of the first melody note on line 11 and typing `2` gave `2.3.4 0.3.4 3.2.4 3.2.4 |`, and alphaTab drew string 3, fret 2. alphaTex writes each note as fret, string and length, with string 1 the highest.
  - A string: on the second note, typing `5` over the fret and `4` over the string gave `2.3.4 5.4.4 3.2.4 3.2.4 |`. alphaTab drew the same G on string 4, fret 5, where the bass's open D also starts at that moment. The language server reported nothing, the `5` was drawn over the bass's grey `0`, and the saved `.gp` kept both notes on string 4.
  - String 7: typing `7` as a bass note's string got a red underline and the language server's message `Note string is out of range. Available range: 1-6`, code `AT208`. alphaTab didn't redraw and kept the drawing from before. Control+Z put the text back, and alphaTab redrew it.
  - A capo: typing `\ca` on a new line under the `\tuning` line opened a list of 12 suggestions, the first `\capo, Set the capo fret, Function`. While `\ca` stood in the text, alphaTab reported `Error AT204(7,1)->(7,4): Unrecognized metadata 'ca'.` and kept the previous drawing. Finished as `\capo 2`, the tab was drawn with capo 2, the same frets and strings, and the first two notes sounding at MIDI notes 59 and 57 instead of 57 and 55.
  - Saved by the page and read back under Node.js (r0618): after the string edit, the Guitar Pro 7 `.gp` (4,691 bytes) and the editor's own text each gave 89 of 90 matched, since the first note is now an A, not the known G, and 88 of those 89 on the known string and fret. The other one is the moved note (e1780, e1782). After the capo edit, the `.gp` checked against S5capo2 gave 89 of 90 matched and 88 of 89, with capo 2 in the file as in the known tab (e1784).
  - A rerun with the page served from the bundles, after every installed package but `vscode-oniguruma` was deleted, gave byte-identical files and the same notes and error markers at every step (r0663).
- Time: the bundles took 1.25 s wall on 2 cores, 384.6 MB peak, to build (r0604), and come to 8.2 MB, 6,287,979 bytes of it `editor.js`. The run with every edit took 12.84 s wall on 2 cores, 144.8 MB peak. In the page, the language server was ready in 327.6 ms and alphaTab's first drawing was done at 656.0 ms (r0614). Two reruns gave 180.0 and 448.9 ms (r0663) and 348.7 and 674.1 ms (r0678).
- Takes as a hint: whatever alphaTex alphaTab accepts, such as `\capo` and `\tuning` lines and each note's fret and string. A string outside 1 to 6 was refused with `AT208`.
- Hands off to: alphaTab, which drew the edited alphaTex and saved it as `.gp` and alphaTex (r0614, r0618). Whether the edits behave the same in the live alphatab.net playground wasn't checked.

**guitarpro-parser 2.0.0** ([link](https://github.com/emilienbev/guitarpro-parser)). A TypeScript library that reads Guitar Pro files and computes when each note plays, in milliseconds.

- In: `S2n.gp5`, `S5capo2.gp5`, `S5dropd.gp5`, TuxGuitar's GP3 of S2n, and alphaTab's `.gp` of S2n.
- Command or settings: `parseGuitarPro(bytes)`, `buildTimeline(song)` and `scheduleTrack(song, track, timeline)` in Node.js.
- Out: a note list with `string` (0 is the highest string), `fret`, `midi`, `startMs`, `endMs` and playing marks such as `palmMute` and `letRing`. Each of the four Guitar Pro 3 and 5 files gave 90 notes, all 90 on the known string and fret, with tuning and capo read (e1101, e1103, e1105, e1110). alphaTab's `.gp` was refused (r0298):

  ```text
  GuitarProError: Cannot read this Guitar Pro 7+ (.gp) file (track 1): staff 1 of track 0 has a FretCount property without <Number>.
  ```

- Time: shared, 0.15 s wall, 54.4 MB peak, with 21.6 ms for the parse itself (r0294).
- Takes as a hint: none.
- Hands off to: my agents wrote its notes to JSON for counting. No writer was named in the parts of its README my agents read, and whether it can write a file was not verified.

**LilyPond 2.24.3** ([link](https://lilypond.org/)). A program that turns a text file into printed music. Its `TabStaff` draws tab and picks the string for each note itself when the file doesn't say.

- In: the known notes, without strings, written as `.ly` text by `truth_to_lilypond.py`. The synthesized clips were S1 (a single-note melody), S2n, S5capo2 and S5dropd. The real ones were R1a, R1b and R1c, solo guitar recordings from the GuitarSet dataset, which marks the string of every note. TabStaff has no capo setting, so for S5capo2 the tuning was raised 2 semitones instead.
- Command or settings: `lilypond --png -dresolution=100 -o <out> <in>.ly`
- Out: PNG and MIDI. The strings LilyPond picked, against the known tab: S1 62 of 62 notes on the same string and fret (e0413), S2n 90 of 90 (e0399), S5capo2 90 of 90 (e0415), S5dropd 90 of 90 (e0414). For the three real clips, matched by note order: R1a 104 of 188 (e0416), R1b 33 of 70 (e0417), R1c 127 of 145 (e0418). The rest of the matched notes in those three sat on a higher-pitched string than the one GuitarSet marks, one string up (R1a 64, R1b 37, R1c 18) or two (R1a 20). In R1a LilyPond left out one of the 189 notes with `warning: No string for pitch #<Pitch ais, > (given frets (4 1))`, and in R1c my agents' input script had merged 3 of the 148. My string-and-fret agents ran the same LilyPond on the same notes with their own script and matched them by time: R1a 104 of 189, R1b 32 of 70, R1c 129 of 148 (e0182 to e0184). The MIDI holds every note twice, once per staff, so 180 notes for S2n (e0400).
- Time: S2n, shared, 4.76 s wall, 2.25 s CPU, 82 MB peak (r0197).
- Takes as a hint: `stringTunings` (any tuning), a string number on a note (for example `g4\3`), and `minimumFret`, `maximumFretStretch` and `restrainOpenStrings`, which weren't tried in this step. My string-and-fret agents tried `minimumFret`, `restrainOpenStrings` and a string number on one note (r0155). No capo setting for tab.
- Hands off to: my agents read the picked strings from its log into the tool they used to count notes against the known tab. It writes PDF, PNG, SVG and MIDI.

**MuseScore 3.2.3** ([link](https://github.com/musescore/MuseScore)). The open-source MuseScore notation program, run from its command line with no window. This is the Ubuntu package `musescore3`. The current MuseScore Studio 4.7.6 wasn't run.

- In: `S2n.gp5`, `S5capo2.gp5`, `S5dropd.gp5`, alphaTab's `.gp` of S2n, MusicXML with a tab staff written from the known tabs of S2n and S5capo2, and music21's tab-only MusicXML.
- Command or settings: `mscore3 -o <out.ext> <in>`, with `QT_QPA_PLATFORM=offscreen` set. Without that setting it stopped with `This application failed to start because no Qt platform plugin could be initialized.` (r0403).
- Out: from a Guitar Pro 5 file it made one notation staff and no tab staff, and that is what its exports hold. The saved `.mscx` file also holds a part named "Guitar" with a linked six-line tab staff. The MusicXML has no string, fret, tuning or tab clef, and my agents' counting tool refused it with `MusicXML has no part with <string>/<fret> technical marks` (e0141). The MIDI: 90 of 90 matched (e0145). From `S5capo2.gp5` the capo became the text `Capo. fret 2` and the MIDI came out 2 semitones low, 0 of 90 matched, and 90 of 90 with 2 semitones added (e0374, e0376). S5dropd's MIDI: 90 of 90 (e0378). alphaTab's `.gp`: refused with `unknown file suffix <gp>` (r0178). From MusicXML with a tab staff, it kept the tab staff, the tuning and all 90 strings and frets (e0367). From the S5capo2 MusicXML, the `<capo>` was gone and 0 of 90 notes kept the known string and fret. 54 stayed on their string, with the fret counted from the nut (the end of the neck where the strings start) instead of from the capo, so 2 higher. 36 moved to the next higher-pitched string (e0368). From music21's file, which has no tuning, it logged `no instrument found for part`, wrote all six tuning lines as `C-1` (MIDI note 0), and 4 of 90 notes kept their string and fret (e0369).
- Time: `S2n.gp5` to MusicXML, shared, 0.47 s wall, 79.3 MB peak (r0120).
- Takes as a hint: none for string, fret, capo or tuning on the command line.
- Hands off to: its MusicXML of `S2n.gp5` drew with no tab staff in OpenSheetMusicDisplay (r0163) and Verovio (r0168), and opened in alphaTab with no string or fret on any of its 90 notes (e0792).

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A Python toolkit that reads and writes music files.

- In: S2n's known tab, built into a music21 `stream.Score` by `music21_truth_to_musicxml.py`.
- Command or settings: each note with `articulations.StringIndication(string)` and `articulations.FretIndication(fret)`, then `score.write('musicxml')` and `converter.parse()`. The tab-only version used `clef.TabClef()` and `layout.StaffLayout(staffLines=6)`.
- Out: MusicXML 4.0 with `<string>` and `<fret>` on all 90 notes, read back with 90 of 90 on the known string and fret (e0191, e0193). The file has no `<staff-tuning>` and no `<capo>`, and the writer's source has the comments `# TODO: staff-tuning` and `# TODO: capo` at that spot.
- Time: shared, 1.64 s wall, 1.3 s CPU, 69.9 MB peak (r0153).
- Takes as a hint: string and fret on each note. It doesn't write tuning or capo.
- Hands off to: OpenSheetMusicDisplay drew its tab-only file with string and fret (r0161). alphaTab opened it with no string or fret (e0908). MuseScore 3.2.3 wrote its tuning as `C-1` (e0369, above).

**OpenSheetMusicDisplay 2.3.0** ([link](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay)). A library for web pages that draws MusicXML, built on VexFlow.

- In: MusicXML with a tab staff written from the known tabs of S2n (notation plus tab, and tab only) and S5capo2, music21's tab-only MusicXML, and MuseScore 3.2.3's MusicXML of `S2n.gp5`.
- Command or settings: `new OpenSheetMusicDisplay(div, {backend: 'svg', drawTitle: true})`, `load(xmlString)` and `render()` in headless Chrome.
- Out: SVG. S2n notation plus tab: both staves, 180 notes, 90 of them with string and fret on the tab staff (r0158). S5capo2: the same, with three sharps on the notation staff and no capo text anywhere (r0159). S2n tab only: 90 of 90 with string and fret (r0160). music21's file: 90 of 90 (r0161). MuseScore 3.2.3's file: notation only, 90 notes, 0 with string and fret (r0163). Bar numbers start at 0.
- Time: shared, 2.56 s wall, 123.5 MB peak, with 80.5 ms to load and 205.5 ms in all inside the page (r0158).
- Takes as a hint: none for string, fret, capo or tuning. It draws what the file says.
- Hands off to: drawing only. Its README says `OSMD on its own does not support playback`, and playback wasn't tried.

**PyGuitarPro 0.11** ([link](https://github.com/Perlence/PyGuitarPro)). A Python library that reads and writes Guitar Pro 3, 4 and 5 files.

- In: `S2n.gp5`.
- Command or settings: `guitarpro.parse` and `guitarpro.write` in `pyguitarpro_trial.py`.
- Out: tempo 112, tuning `[(1, 64), (2, 59), (3, 55), (4, 50), (5, 45), (6, 40)]` with string 1 the highest, capo (`offset`) 0, and 90 notes with `string` and `value` (the fret). Saved as GP5, 90 of 90 on the known string and fret (e0574). Saved as GP4 or GP3, 42 notes, only the first voice (the melody), with the bass voice missing (e0578, e0581). A test edit like a user's correction moved the first melody note to string 4, fret 5, set the capo to 1 and tuned the low string to D, and alphaTab opened the saved GP5 with those three changes.
- Time: shared, 0.61 s wall, 23.1 MB peak, with 0.011 s for the read (r0236).
- Takes as a hint: `Track.offset` (capo), `Track.strings` (tuning), `Note.string` and `Note.value` (fret).
- Hands off to: its GP3 opened in alphaTab with the same 42 of 90 (e0805). Its README names GP3, GP4 and GP5 only. No Guitar Pro 6 to 8 file was tried with it.

**svguitar 2.10.1** ([link](https://github.com/omnibrain/svguitar)). A JavaScript library that draws chord boxes, the small grids that show where the fingers go for a chord.

- In: two chord shapes from the known tabs, G from S3 and B minor from S4, a synthesized four-instrument band mix. Written as one fret number per string, lowest string first, with x for a muted string, they're 320003 and x24432.
- Command or settings: `new svguitar.SVGuitarChord(el).configure({strings: 6, frets: 4, position, tuning}).chord({fingers: [[string, fret]...], barres: [{fromString, toString, fret}]}).draw()`
- Out: 2 SVG chord boxes with the dots on the strings and frets given, and the B minor barre, one finger pressing across several strings, with a `2fr` position label (r0253).
- Time: shared, 2.83 s wall for a page with both chord libraries, 123.6 MB peak (r0253).
- Takes as a hint: `strings`, `frets`, `position` and `tuning`.
- Hands off to: drawing only.

**Tonal 6.5.1** ([link](https://github.com/tonaljs/tonal)). A JavaScript music-theory library for notes, intervals, chords and keys.

- In: for each of the 9 chord stretches in S3's known answer, the names of the notes sounding inside it, lowest first.
- Command or settings: `Chord.detect()`
- Out: the first name it returned had the known chord's root (the note the chord is named after) and type in 8 of 9 stretches, 1.4 ms for all 9. The other stretch, the D7 from 18.75 to 20.0 s, came back as `C69#11`. Notes of the C chord before it were still ringing, and the way my agents picked each stretch's notes took them in.
- Time: shared, 1.24 s wall for the run it shared with ChordSheetJS, 88.1 MB peak (r0251).
- Takes as a hint: none.
- Hands off to: nothing was fed from it.

**TuxGuitar 1.5.6** ([link](https://github.com/helge17/tuxguitar)). An open-source desktop tab editor and player written in Java. Only its file plugins ran here, called from a small Java program my agents wrote. Its window was never opened.

- In: `S2n.gp5`, `S5capo2.gp5`, `S5dropd.gp5` and alphaTab's `.gp` of S2n.
- Command or settings: `java -Djava.awt.headless=true` running `TGConvert.java`, which calls the plugins' readers and writers (`GP5InputStream`, `gpx.v7.GPXInputStream`, `GP5OutputStream`, `GP4OutputStream`, `GP3OutputStream`, `MusicXMLSongWriter`, `ASCIISongWriter`, `LilypondSongWriter`, `MidiSongWriter`).
- Out: from each file, GP5, GP4, GP3, MusicXML, ASCII tab (tab as plain text), LilyPond and MIDI. GP5, GP4 and GP3: 90 of 90 on the known string and fret, with capo and tuning (e0457 to e0459, e0464 to e0466, e0471 to e0473). ASCII tab: 90 of 90 by note order (e0461), with no capo or tuning field and the strings labelled by letter only. MusicXML: pitches and tuning one octave high, both voices merged into one, no capo element, and 16 of 90 notes matched by pitch with 0 of those 16 on the known string and fret (e0460). MIDI: 90 of 90 matched (e0462). The LilyPond file is written for LilyPond 2.14.0. LilyPond 2.24.3 reported errors on it, still wrote a PNG and ended with `fatal error: failed files` (r0230), and after `convert-ly -e` updated the file it compiled (r0232). alphaTab's `.gp` was read with 90 of 90 (e0477). The start of the ASCII tab:

  ```text
  E|--------|---------------------|-0----0--------------|---------------------|---------------------|
  B|--------|-----------3----3----|-----------3---------|-1----1----0----0----|---------------------|
  G|--------|-0----0--------------|---------------------|---------------------|-2----2----0---------|
  D|--------|------0---------0----|------2---------0----|------2---------0----|-0--------------0----|
  A|--------|---------------------|-3-------------------|-3-------------------|------0--------------|
  E|--------|-3---------3---------|-----------3---------|-----------3---------|-----------3---------|
  ```

- Time: S2n, shared, 0.91 s wall, 65.9 MB peak (r0221).
- Takes as a hint: none in the plugins, which take capo and tuning from the file. The desktop program's command line takes a file to open and `-h`, `-v`, `-i` and `-D<name>=<value>`, with no export option.
- Hands off to: its GP3 and GP4 opened in alphaTab with 90 of 90 (e0799, e0802) and its GP3 in guitarpro-parser with 90 of 90 (e1110). Its MusicXML opened in alphaTab with the tuning an octave high, 7 of 90 notes matched by pitch and 0 of those 7 on the known string and fret (e0860).

**Verovio 6.4.1** ([link](https://github.com/rism-digital/verovio)). A library that lays out sheet music from MEI, the Music Encoding Initiative's file format, which has a tablature module. It's compiled to WebAssembly, code that runs inside a browser or Node.js. It also reads MusicXML.

- In: MEI tab my agents wrote from S2n's known tab (`truth_to_mei.py`), MusicXML with a tab staff for S2n (notation plus tab, and tab only) and S5capo2, and MuseScore 3.2.3's MusicXML of `S2n.gp5`.
- Command or settings: `verovio/wasm` and `verovio/esm` in Node.js, with the options `pageWidth` 2100, `scale` 40 and `adjustPageHeight`. For editing, the toolkit's `edit()` with `set` actions on a note's `tab.fret` and `tab.course`, then `getMEI()` and `renderToSVG(1)`.
- Out: SVG, MEI, MIDI and a timemap, a list of when each note starts and stops in ms. The MEI tab my agents wrote read back with 90 of 90 on the known string and fret (e0361), and so did Verovio's MEI export of it (e0362). MusicXML with a tab staff converted to MEI: 90 of 90 (e0363, e0364). S5capo2: the capo didn't carry into the MEI. Read without it, all 90 pitches came out 2 semitones low and 0 of 90 matched (e0365). With the capo added by hand, 90 of 90 matched, all on the known string and fret (e0366). MIDI from the MEI tab: 90 notes, all 90 matched, and 50 of those 90 also ended within 20 percent of the known note's length or 50 ms of its end, whichever is larger (e0307). MIDI from the notation-plus-tab MusicXML: 180 notes, every note twice because both staves play (e0324). MuseScore 3.2.3's MusicXML came out with no tab staff (r0168). Editing the MEI tab (r0626): `set` changed note 1's `tab.fret` to 2, then note 2's `tab.course`, the string, to 4 and its `tab.fret` to 5. Each call returned true, `getMEI()` then held the new value, and the drawn fret numbers became 2 and 5. Which line the moved note was drawn on wasn't measured. One `undo` put all three back. The edited MEI read back with 89 of 90 matched and 88 of those 89 on the known string and fret, the other being the moved note (e1827). The edited MEI holds two notes starting together on string 4, the moved G and the bass's open D. `edit()` returned true for that change, and Verovio's own log wasn't read.
- Time: the MEI tab of S2n, shared, 1.85 s wall, 175.1 MB peak, with 656 ms to start the WebAssembly and 156 ms to draw (r0165). The edit run took 0.54 s wall on 2 cores, 195.0 MB peak (r0626).
- Takes as a hint: tuning (`<tuning>` with one `<course>` per string). MEI's tab chapter has no capo element. Through `edit()`, a note's `tab.fret` and `tab.course`.
- Hands off to: my agents read its MEI back for counting. The timemap carries `qstamp`, `tstamp` (ms) and the ids of the notes switched on and off, which the survey lists as position data for a playback cursor.

**vexchords 1.2.0** ([link](https://github.com/0xfe/vexchords)). A JavaScript library that draws chord boxes.

- In: the same G and B minor shapes as svguitar.
- Command or settings: `draw(el, {chord: [[string, fret]...], position, barres}, {width, height})`
- Out: the npm package's `dist/vexchords.js` stopped with `TypeError: A[e] is not a constructor` (r0253, r0254, r0255). Loading its source files directly stopped on two imports with no file extension (r0256). Bundled from its source with esbuild 0.25.12, it drew both chord boxes (r0259).
- Time: the bundled page, shared, 2.41 s wall, 123.8 MB peak (r0259).
- Takes as a hint: `numStrings`, `numFrets`, `position` and `barres`.
- Hands off to: drawing only.

**VexFlow 5.0.0** ([link](https://github.com/vexflow/vexflow)). A JavaScript library that draws notation and tab from code. It has no file reader.

- In: S2n's known tab as JSON, turned into drawing calls by a test page.
- Command or settings: one `TabStave` per bar, two `Voice`s of `TabNote`s with `positions: [{str, fret}]`, `Formatter.joinVoices().format()`, SVG output.
- Out: SVG with 13 bars and 90 fret numbers on six-line tab staves with a `TAB` clef. No notation, which wasn't asked for, and no stems, title or tempo (r0110).
- Time: shared, 2.05 s wall, 125.8 MB peak, with 274.7 ms inside the drawing code (r0110).
- Takes as a hint: the number of lines on a `TabStave`. The program gives every string and fret.
- Hands off to: OpenSheetMusicDisplay and VexTab draw with it.

**VexTab 4.0.5** ([link](https://github.com/0xfe/vextab)). A text language for notation and tab, drawn with VexFlow.

- In: S2n's and S5dropd's known tabs written as VexTab text by `truth_to_vextab.py`, 1,072 bytes for S2n.
- Command or settings: `new VexTab(new Artist(10, 10, 1200)).parse()` and `artist.render()`. For editing, a `div.vextab-auto` with `editor="true"`, which adds a text box. Going by its source (`src/div.ts`), it redraws 250 ms after a key is released.
- Out: SVG with notation and a G major key signature above each tab staff, 13 bars on 4 lines (r0109). S5dropd drew with `tuning=dropd` (r0144). Editing, run by the checking agent (r0407): typing `:q 2/3` over the first `:q 0/3` changed the first of the 90 drawn numbers from 0 to 2 and no other. Later, typing `:q 5/4` over the second `:q 0/3` moved that note from 0 on string 3 to 5 on string 4, the same pitch, and no other number changed (r0625). That `5` was drawn over the bass's `0` on string 4, which starts at the same moment, with no error text. The start of the S2n text:

  ```text
  options space=20 tab-stems=false
  tabstave notation=true tablature=true tuning=standard key=G time=4/4
  voice
  notes :w ## | :q 0/3 :q 0/3 :q 3/2 :q 3/2 | :q 0/1 :q 0/1 :h 3/2 | :q 1/2 :q 1/2 :q 0/2 :q 0/2 |
  ```

- Time: shared, 2.85 s wall, 126.2 MB peak, with 149.6 ms inside parse and draw (r0109). The string change took 2.24 s wall on 2 cores, 131.1 MB peak (r0625).
- Takes as a hint: `tuning=` with `standard`, `dropd`, `eb` or a list of notes. No capo option.
- Hands off to: drawing only. Its source has a player, `player.ts`, which wasn't tried.

**webmscore 1.2.1** ([link](https://github.com/LibreScore/webmscore)). MuseScore 3's engine compiled to WebAssembly, for web pages and Node.js.

- In: `S2n.gp5`, `S5capo2.gp5`, alphaTab's `.gp` of S2n, and the S2n MusicXML with notation and a tab staff.
- Command or settings: `webmscore_trial.cjs` with `--shim-navigator --no-fetch`. In Node.js 22.23.4 it first stopped with `TypeError: Cannot set property navigator of #<Object> which has only a getter` and then with `TypeError: Failed to parse URL from .../webmscore.lib.wasm`. Making `globalThis.navigator` writable and deleting `globalThis.fetch` before loading got past both.
- Out: MusicXML, MIDI, SVG, PNG, PDF and `.mscz`. From the Guitar Pro files the MusicXML had no tab staff and no string or fret, and the counting tool refused it (e0990, e0995, e1002). The MIDI: 90 of 90 matched, the capo file included (e0992, e0999, e1006). alphaTab's `.gp` opened (r0290). From the MusicXML with a tab staff, the tab staff stayed, the tuning was written an octave high, and 0 of 90 notes kept the known string and fret (e1009).
- Time: S2n, shared, 4.0 s wall, 218.7 MB peak (r0288).
- Takes as a hint: none for string, fret, capo or tuning. The methods of its package load, set excerpts, read metadata, save and synthesize, and none edits a note. Whether string and fret written in a MuseScore `.mscz` or `.mscx` file come through wasn't tried.
- Hands off to: MusicXML and MIDI, as above.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

The list has 80 entries: 65 programs, libraries and web services, 8 file formats and 7 data sets (6 sound banks and a chord-shape database). Besides the 18 above, here's each of the other 62, plus the parts of the tools above that didn't run, and why. Where my agents wrote steps for me to try it myself, the line gives the item number in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/web-tab-render).

- **abc2svg**: not tried for lack of time. Its npm package, version 1.22.1 from 2022, is marked deprecated with `Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.`, and the project lives on chiselapp.com. No steps.
- **abjad and python-ly** (Python tools that write LilyPond text): no trial recorded, they're only in the survey's list. No steps.
- **aibandtab**: seen in the npm search and not looked at further. No steps.
- **ApolloTab** (a Python Guitar Pro reader, drawer and player): not tried for lack of time. It needs Qt to draw. No steps.
- **ascii-tabs**: found in the checking agent's npm search, not run. No steps.
- **Autostrum** (a web tab player and editor): not tried for lack of time, and whether it runs on the box was not verified. No steps.
- **ChordPro reference program** (Perl): not tried for lack of time. No steps.
- **chords-db and react-chords** (a chord-shape database and React chord boxes): not tried for lack of time. No steps.
- **@coderline/alphaskia** (the engine alphaTab uses for PNG output outside a browser): named in alphaTab's docs, not tried. No steps.
- **@coderline/alphatab-react and @coderline/alphatab-ui** (React bindings, and the player and alphaTex editor of alphaTab's website): marked private and not on npm, where the registry answered 404. The alphatab-ui source was read, not run. Steps for me: item 7 has me use the alphatab.net playground, which imports alphatab-ui, for a listening check.
- **@danzw777/tab-score**: found in the checking agent's npm search, not run. No steps.
- **dart_gp_tab_reader, parsegp and PhilPotter/gp_parser**: named by a web search and not read, so not verified. No steps.
- **expo-alphatab**: found in the checking agent's npm search, not run. No steps.
- **File formats** (ABC, alphaTex, ASCII tab, ChordPro, Guitar Pro, MEI, MNX, MusicXML): formats, not programs, so there's nothing to run. All but MNX went through the tools above. No tool here used MNX, a new music format a W3C community group is developing, and whether it can hold tab was not checked. No steps.
- **Flat.io embed and API**: a hosted service that needs an account and an app ID. Steps for me: item 4.
- **fretboard.js**: not tried for lack of time. No steps.
- **@fretfall/player**: found in the checking agent's npm search, not run. No steps.
- **Guitar** (1j01/guitar, a web guitar that plays pasted tab): not tried for lack of time. No steps.
- **Guitar Pro 8**: a paid desktop program, not on the box. Steps for me: item 6.
- **guitar-pro-api**: seen in the npm search and not looked at further. No steps.
- **guitarpro** (Rust crates): not tried for lack of time. It needs the Rust toolchain. No steps.
- **HAYA-TAB** (a desktop program that keeps a library of tab files and shows and plays them with alphaTab 1.8.1): not run. My agents were asked only to describe it. The files of its release v3.1.8 can be downloaded from the box, but its Linux build is linked against the WebKitGTK 4.1, JavaScriptCoreGTK 4.1 and libsoup 3.0 libraries, which the box doesn't have. My agents didn't try installing them, running a virtual display or starting the program. In the `frontend/src` folder of its source, they found no code that sets a note's string or fret and no call to alphaTab's file exporters. Its edit dialog changes library details such as the title and artist. Steps for me: item 8.
- **@hidechae/eztab-mcp**: found in the checking agent's npm search, not run. Its repository wasn't public. No steps.
- **@holm/asciitabs-to-gp**: found in the checking agent's npm search, not run. No steps.
- **It's MyTabs** (a self-hosted tab viewer and player built on alphaTab): not tried for lack of time. It needs Deno or Docker. No steps.
- **iText 5.5.13.3** (the PDF library in TuxGuitar's PDF export): not run, since TuxGuitar's PDF export wasn't tried. No steps.
- **jTab**: not tried for lack of time. No steps.
- **keyjockey**: seen in the npm search and not looked at further. No steps.
- **Listening**: the box has no sound card, so none of the playback was heard. Steps for me: item 7, a listening check of alphaTab's player.
- **MuseScore Studio 4.7.6**: its 192,616,952-byte Linux AppImage, a program packed into one file, wasn't downloaded. A notice on the shared box asked lanes to `start no new download or install over 200 MB unless your lane cannot finish without it` while less than 9,000 MB was free, and the checking agent saw 4.9 to 5.9 GB free. The box also has no FUSE tools, which an AppImage needs to run without unpacking. So it would have had to be unpacked first, to a size my agents didn't measure, or FUSE installed. MuseScore 3.2.3 and webmscore ran instead. Steps for me: item 1.
- **@musicbird/gp-parser**: seen in the npm search and not looked at further. No steps.
- **@musicbird/gpx-parser**: not tried for lack of time. No steps.
- **muzart** (a browser tab editor): cloned, but this session's permission check refused its install step, `pnpm install --frozen-lockfile`, according to the trial agent. No log of that was saved, so the refusal is not verified. Steps for me: item 2, using its online demo.
- **osmd-audio-player**: not tried for lack of time. No steps.
- **Power Tab Editor 2.0**: a desktop program, not tried for lack of time. No steps.
- **react-guitar**: not tried for lack of time. No steps.
- **score-parser** (`@jbfullstack/score-parser`): not tried for lack of time. No steps.
- **SLiMTAB** (an Electron desktop tab editor): no trial recorded, it's only in the survey's list. No steps.
- **Songshed**: not tried for lack of time. No steps.
- **Sound banks** (files of recorded instrument samples a player uses to make sound): SONiVOX ran inside alphaTab's player (r0128). The MIDI.js sets that abcjs loads by default, FluidR3_GM (used to make the test clips), GeneralUser GS, MuseScore's MS Basic and TuxGuitar's Magic Sound Font weren't run on their own. No steps.
- **soundfont-player**: no trial in this step, where it's only in the survey's list. Version 0.12.0 ran in the section on metronome and sync (r0229). No steps.
- **Soundslice**: a hosted service that needs an account. Steps for me: item 3.
- **SuNett**: found in the checking agent's npm search, not run. No steps.
- **Tab Flow** (alphaTab inside the Obsidian notes app): no trial recorded, it's only in the survey's list. No steps.
- **tab-editor** (calesce): not tried for lack of time. No steps.
- **tabkit**: found in the checking agent's npm search, not run. No steps.
- **tonal-guitar**: seen in the npm search and not looked at further. No steps.
- **tuitar** (a tab editor in the terminal): not tried for lack of time. No steps.
- **tutts and tutts-alphatab**: found in the checking agent's npm search and not run in this step. tutts 0.1.0 ran in the section on choosing the string and fret (r0205). tutts-alphatab wasn't run. No steps.
- **TuxGuitar's desktop window**: never opened. `/usr/bin/tuxguitar` only starts the window, so only the file plugins ran (above). Its PDF, SVG and image exports and its Power Tab and TablEdit readers weren't tried either. Steps for me: item 5.
- **@ukegeeks/song-formatter**: seen in the npm search and not looked at further. No steps.
- **Verovio's Python and C++ builds**: not tried for lack of time. No steps.
- **vexflow-react-native-svg**: seen in the npm search and not looked at further. No steps.
- **vexflow_smoosic**: seen in the npm search and not looked at further. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

None of these tools uses a trained model, so the last two columns say none for all of them.

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| abcjs 6.7.2 | MIT | none | none |
| alphaTab 1.9.0 | MPL-2.0, section 3.2: `If You distribute Covered Software in Executable Form then: (a) such Covered Software must also be made available in Source Code Form, as described in Section 3.1, and You must inform recipients of the Executable Form how they can obtain a copy of such Source Code Form by reasonable means in a timely manner` ([LICENSE](https://raw.githubusercontent.com/CoderLine/alphaTab/develop/LICENSE)). On the mark, a music note followed by alphaTab.net, which every drawing of these 13-bar pieces shows, its license header says the attribution `in rendered scores must stay visible in the rendered output. Removing, hiding, covering or cropping it requires permission from the alphaTab maintainers: https://alphatab.net/docs/attribution` ([LICENSE.header](https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/alphatab/LICENSE.header)). A planned change: `A future release of alphaTab will move from MPL-2.0 to an open-source license with an attribution clause.` and, under that license, `Offering an app over a network counts as distribution. Changes you make to alphaTab's own files must be made available, also when they only run on your server or in your web app.` ([attribution page](https://alphatab.net/docs/attribution)). Its bundled SONiVOX sound bank is under the Apache License 2.0. | none | none |
| ChordSheetJS 18.0.0 | GPL-2.0-only. Its LICENSE begins `GNU GENERAL PUBLIC LICENSE Version 2, June 1991` ([repository](https://github.com/martijnversluis/ChordSheetJS)) | none | none |
| @coderline/alphatab-monaco 1.9.0 and @coderline/alphatab-language-server 1.9.0 | MPL-2.0. The two LICENSE files begin `alphaTab Monaco is licensed under MPL-2.0.` and `alphaTab Language Server is licensed under MPL-2.0.` ([the Monaco package's LICENSE](https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/LICENSE)). Of the 14 packages the install added, the registry license field is `MPL-2.0` for the three @coderline packages, `(MPL-2.0 OR Apache-2.0)` for dompurify and `MIT` for the other ten, `monaco-editor` among them. | none | none |
| guitarpro-parser 2.0.0 | Apache-2.0 | none | none |
| LilyPond 2.24.3 | GPL-3.0-or-later: `GNU LilyPond is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.` ([LICENSE](https://gitlab.com/lilypond/lilypond/-/raw/master/LICENSE), read from the current source, not from the 2.24.3 package) | none | none |
| MuseScore 3.2.3 | GPL-3.0: `you can redistribute it and/or modify it under the terms of the GNU General Public License version 3 as published by the Free Software Foundation.` (`LICENSE.txt` in the [current repository](https://github.com/musescore/MuseScore), not the 3.2.3 package) | none | none |
| music21 10.5.2 | BSD-3-Clause | none | none |
| OpenSheetMusicDisplay 2.3.0 | BSD-3-Clause | none | none |
| PyGuitarPro 0.11 | LGPL-3.0-only. Its LICENSE begins `GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007` ([repository](https://github.com/Perlence/PyGuitarPro)) | none | none |
| svguitar 2.10.1 | MIT | none | none |
| Tonal 6.5.1 | MIT | none | none |
| TuxGuitar 1.5.6 | LGPL-2.1: `TuxGuitar is released under the GNU Lesser General Public License.` ([README](https://github.com/helge17/tuxguitar), README of the current repository, not the 1.5.6 package). Its PDF export, not tried here, uses iText 5.5.13.3, whose Maven file names `GNU Affero General Public License v3` ([pom](https://repo1.maven.org/maven2/com/itextpdf/itextpdf/5.5.13.3/itextpdf-5.5.13.3.pom)). No license text was found for its bundled Magic Sound Font. | none | none |
| Verovio 6.4.1 | LGPL-3.0-only, section 4: `You may convey a Combined Work under terms of your choice that, taken together, effectively do not restrict modification of the portions of the Library contained in the Combined Work and reverse engineering for debugging such modifications, if you also do each of the following:` ([COPYING.LESSER](https://raw.githubusercontent.com/rism-digital/verovio/develop/COPYING.LESSER)) | none | none |
| vexchords 1.2.0 | MIT | none | none |
| VexFlow 5.0.0 | MIT | none | none |
| VexTab 4.0.5 | its own text, npm field `LicenseRef-LICENSE`: `It is freely available complete and uncrippled for non-commercial use.` and `If you would like to use this code on commercial websites, products, blogs, plugins, or tools, please get in touch with me. (I'm very reasonable.)` ([LICENSE](https://raw.githubusercontent.com/0xfe/vextab/master/LICENSE)) | none | none |
| webmscore 1.2.1 | GPL v3, npm field `GPL`: `you can redistribute it and/or modify it under the terms of the GNU General Public License version 3 as published by the Free Software Foundation.` (`LICENSE.GPL` in the [repository](https://github.com/LibreScore/webmscore)) | none | none |

Every clause with its source, for these and the tools that didn't run, is in `survey.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/web-tab-render).

</details>

<!-- IMAGES -->
1. Source `docs/guitar-tab-research/lanes/web-tab-render/samples/abcjs/S2n.webp` (1240x1197, run r0239). Written `public/media/guitar-tab-tools/web-tab-render-abcjs-sounding-pitch.webp`, 1240x926, 36,702 bytes, Pillow, cropped to the top 926 rows (rows 925 to 928 are blank, so the crop ends between the third and fourth rows of music).
   - Alt: Music drawn by abcjs under a title: three rows of four bars, low notes hanging on ledger lines below the staff, and under each row a tab staff where many of the fret numbers are question marks.
   - Caption: **abcjs 6.7.2, ABC at sounding pitch.** S2n's known notes written in ABC, a text notation for tunes, at the pitch they sound. 42 of the 90 tab positions came out as question marks. First 12 of 13 bars.
2. Source `docs/guitar-tab-research/lanes/web-tab-render/samples/abcjs/S2n_written.webp` (1240x1097, run r0241). Written `public/media/guitar-tab-tools/web-tab-render-abcjs-written-pitch.webp`, 1240x854, 34,450 bytes, Pillow, cropped to the top 854 rows (rows 844 to 864 are blank, between the third and fourth rows of music).
   - Alt: The same music drawn by abcjs from ABC one octave higher: three rows of four bars with the notes sitting on the staff, and a fret number at every position on the tab staff below each row.
   - Caption: **abcjs 6.7.2, ABC an octave up.** The same notes written an octave higher, the way guitar music is notated. All 90 tab positions came out as fret numbers. First 12 of 13 bars.
3. Source `docs/guitar-tab-research/lanes/web-tab-render/samples/alphatab/S2n_gp5.webp` (1240x900, run r0059). Written `public/media/guitar-tab-tools/web-tab-render-alphatab-s2n.webp`, 1240x900, 30,336 bytes, Pillow, re-encoded with no crop and no resize, so the "alphaTab.net" mark stays in the picture (alphaTab's LICENSE.header says it must stay visible and that cropping it needs the maintainers' permission).
   - Alt: Guitar music drawn by alphaTab: 13 bars in three rows, each a notation staff above a six-line tab staff with fret numbers, the bass notes in grey, a tempo mark of 112 at the top left and a small alphaTab.net mark at the top right.
   - Caption: **alphaTab 1.9.0.** `S2n.gp5`, the known tab as a Guitar Pro file, drawn in Chrome running with no window. Notation over tab, all 13 bars.
4. Source `docs/guitar-tab-research/lanes/web-tab-render/samples/alphatab-monaco/S2n.monaco_edited.webp` (1240x1824, run r0614, the state after step 2, the string edit). Written `public/media/guitar-tab-tools/web-tab-render-alphatab-monaco-edit.webp`, 1240x1360, 73,256 bytes, Pillow (quality 88, method 6, as for the others), cropped to the top 1360 rows (the last non-blank row is 1348, the rest of the page is blank). The "alphaTab.net" mark at the top right of the drawing (rows 1119 to 1128, columns 1097 to 1164) stays whole in the picture, as alphaTab's LICENSE.header asks. Added in the gap-round update: no earlier picture shows an editor or a redraw after an edit.
   - Alt: A code editor full of alphaTex, numbered lines of numbers such as 3.2.4, with line 11 reading 2.3.4 5.4.4 3.2.4 3.2.4. Below it, alphaTab's drawing of the first 6 bars, notation over a six-line tab staff, with a 2 and a 5 in the first bar of music and a small alphaTab.net mark at the top right.
   - Caption: **@coderline/alphatab-monaco 1.9.0.** S2n's known tab as alphaTex, alphaTab's text format, in the Monaco code editor, after a new fret and a new string were typed on line 11. Below, the first 6 of the 13 bars as alphaTab redrew them. The new 5 is drawn over the bass's 0 on the same string.
5. Source `docs/guitar-tab-research/lanes/web-tab-render/samples/musescore3/S2n_gp5_page1.webp` (1240x1754, RGBA with a transparent background, made from the PNG of run r0124). Written `public/media/guitar-tab-tools/web-tab-render-musescore3-s2n.webp`, 1240x930, 43,252 bytes, Pillow, flattened onto white so it reads in dark mode, cropped to the top 930 rows (the music ends at row 562, the rest of the page is blank).
   - Alt: The first page MuseScore 3.2.3 made from the same Guitar Pro file: a title, then 13 bars of standard notation on one staff in two rows, and no tab staff.
   - Caption: **MuseScore 3.2.3.** The same `S2n.gp5` opened from the command line. Page 1 has no tab staff, the six lines with fret numbers. The saved file also holds a part named Guitar, the music for one instrument on its own, and that part has a tab staff.

The script that made them: `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/make_web_tab_images.py`. Picture 4 (the gap-round update, 2026-11-12): `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/wtr-update/make_monaco_image.py`.

<!-- PENDING MEDIA -->
All four files exist (checked 2026-11-10 with ffprobe, and again on 2026-11-12 with the same sizes and durations). Gap round 2 made no audio or video (trials.md, "Files of this round"). All are WAV, 44.1 kHz, 2 channels, 32-bit float, so they need converting for the web. Listed in trials.md, "Media kept outside git".

1. `/home/user/gtr/lanes/web-tab-render/out/alphatab-player/S2n_plain.export.wav`: alphaTab 1.9.0's `api.exportAudio()` of S2n.gp5 with its bundled SONiVOX sound bank, click off (run r0128). The known S2n tab played back by alphaTab. 27.858 s, 9,828,396 bytes.
2. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.plain.wav`: the first 4 s of the same export (run r0328). 4.005 s, 1,413,164 bytes.
3. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.changeTrackTranspositionPitch.wav`: the same 4 s exported after `api.changeTrackTranspositionPitch(tracks, 2)`. Its first melody note measured 195.78 Hz, the same as file 2 (run r0328). 4.005 s, 1,413,164 bytes.
4. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.exportOption.wav`: the same 4 s exported with `trackTranspositionPitches` set to `{0: 2}`. Its first melody note measured 219.75 Hz, two semitones up (run r0328). 4.005 s, 1,413,164 bytes.

<!-- NUMBERS -->
Sources are in `docs/guitar-tab-research/lanes/web-tab-render/` unless the line says otherwise. Run ids are rows of `/home/user/gtr/ledger/runs.jsonl` (lane web-tab-render), eval ids rows of `/home/user/gtr/eval/ledger/evals.jsonl`. Every eval id below was re-read in the ledger for this fragment.

Counts of the whole lane
- 80 entries: tools.json as refreshed after gap round 2 (`updated` field ends "json-web-tab-render-round-2"), `tools` array has 80 items. It had 79 when this fragment was first written. Gap round 2 added HAYA-TAB.
- 18 ran: tools.json, 18 items with `"tried": true` (abcjs, alphaTab, ChordSheetJS, "@coderline/alphatab-monaco and @coderline/alphatab-language-server", guitarpro-parser, LilyPond, MuseScore Studio entry run as 3.2.3, music21, OpenSheetMusicDisplay, PyGuitarPro, svguitar, Tonal, TuxGuitar, Verovio, vexchords, VexFlow, VexTab, webmscore). Gap round 2 ran the Monaco entry (it was `"tried": false`, "not tried for lack of time").
- 65 programs, libraries and services, 8 file formats, 7 data sets: tools.json `kind` counts, library 47 + open-source 14 + commercial-app 3 + desktop app 1 (HAYA-TAB) = 65, file-format 8, dataset 7 (six SoundFont entries plus "chords-db and react-chords"). 65 + 8 + 7 = 80.
- No cost beyond the cloud session: ENVIRONMENT.md, "Cost".
- 2 of the box's 4 cores, "shared" runs ran while up to two timed jobs of other lanes used the processor: ENVIRONMENT.md "How runs were timed", trials.md conventions (`--nolock` runs "ran while up to two pinned jobs of other lanes used the CPUs"). The source's "their times are for reference only" is left out (it tells the reader how to weigh a number). Pinned 2-core runs cited: r0020, r0128 (ledger `locked: true`, `n_cores: 2`), and the gap-round-2 runs r0598, r0604, r0614, r0618, r0624, r0625, r0626, r0663 and the verifier's r0678 (all `locked: true`, `n_cores: 2`, exit 0 in the ledger, so each is given as "on 2 cores"). All other runs cited are `locked: false` in the ledger.
- Wall time as start to finish on the clock, peak memory as the most memory a run used at once, from the log of every run: ENVIRONMENT.md, "How runs were timed" (the ledger records "wall-clock seconds, CPU seconds, peak memory").
- Matched = onset within 50 ms and same pitch: trials.md conventions, eval definitions (`onset_tolerance=0.05`, `pitch_tolerance=50.0`).

Clips
- S2n 29-second, synthesized, 90 notes: INPUTS.md clip table (29.357 s, "90 notes, 48 beats, 22 chord segments").
- S5capo2 capo on fret 2, S5dropd low string to D (D2 A2 D3 G3 B3 E4): INPUTS.md clip table. S5dropd's bass re-fingered (G2 to string 6 fret 5, the D-chord root down an octave from D3 to D2), so its 90 notes are not S2n's: INPUTS.md clip table and "S5dropd is not the same note list as S2".
- One fret is one semitone, transposing as moving every note by the same number of semitones: INPUTS.md S5capo2 (capo on fret 2 "sounds 2 semitones higher").
- GuitarSet marks the string of every note: INPUTS.md "GuitarSet (R1)" (`string` = 6 - data_source of the JAMS note_midi annotation).
- S1 single-note melody, 62 notes: INPUTS.md clip table, e0413.
- S3 strummed chords, S4 four-instrument band mix: INPUTS.md clip table.
- R1a 189 notes, R1b 70, R1c 148, GuitarSet: INPUTS.md clip table, e0416 to e0418 `n_truth`.
- .gp5 files written with PyGuitarPro 0.11 when the inputs were built: INPUTS.md, "Guitar Pro 5".

Rundown and section intro
- alphaTab 90 of 90 reading the three .gp5 files: e0004, e0008, e0012. Through .gp and alphaTex: e0005, e0009, e0015, e0006, e0010, e0016 (trials.md, alphaTab Run 1 table).
- guitarpro-parser 90 of 90: e1101, e1103, e1105 (and TuxGuitar's GP3, e1110).
- TuxGuitar 90 of 90 from its song model: e0456, e0463, e0470.
- MuseScore 3.2.3 MusicXML with no string or fret: e0141 (exit 1), trials.md "MuseScore 3.2.3 command line". webmscore: e0990, e0995, e1002 (exit 1), trials.md "webmscore 1.2.1".
- alphaTab drew all three: r0059, r0066, r0067. Played S2n: r0128. The intro no longer says "its own two save formats" (the `.gp` is Guitar Pro 7's format, only alphaTex is alphaTab's own: trials.md Run 1) or "with and without a click".
- MuseScore 3.2.3 as an open-source sheet-music program, webmscore as MuseScore 3's engine for web pages: trials.md "MuseScore 3.2.3 command line" and "webmscore 1.2.1", tools.json (GPL-3.0).
- The intro named abcjs and VexTab first, then alphaTab, then MuseScore and webmscore (alphabetical by first name). In the gap-round update (2026-11-12) the two open parts were cut to the length caps: the rundown is the bold lead (23 words) plus one sentence on alphaTab, guitarpro-parser and TuxGuitar (22 words), and the intro is three sentences (59 words) ending on abcjs and VexTab. What they said before is still in the folded blocks: S2n, S5capo2 and S5dropd (with the capo gloss) and the tab gloss in the first block's intro, MusicXML's gloss in alphaTab's description, alphaTab's reading, drawing and playing in its entry, MuseScore 3.2.3's and webmscore's MusicXML with no string or fret in theirs, and the kinds of entries in the "didn't run" intro.
- Rundown's second sentence: alphaTab e0004, e0008, e0012, guitarpro-parser e1101, e1103, e1105, TuxGuitar e0456, e0463, e0470 (above). "my synthesized test piece's tab file" is S2n's `.gp5`, the known tab.
- Intro's counts: 80 entries and 18 ran (above). Its outcome: r0312 and r0407 (below).
- No sound card: trials.md Run 4 and "Not run here", "Listening".
- abcjs edit, one number changed, 89 the same: r0312, `samples/abcjs/editor_edit_trial.json` (`n_before` 90, `n_after` 90, `changed_positions` [0]).
- VexTab edit, one number changed: r0407, `samples/vextab/editor_edit_trial_verifier.json` (`n_before` 90, `n_after` 90, one entry in `changed`, 0 to 2).

Pictures
- abcjs 6.7.2, 42 of 90 positions as "?": trials.md abcjs, r0239. 90 fret numbers one octave up: r0241.
- 12 of 13 bars shown: counted in the cropped pictures (three rows of four bars). 13 bars: trials.md Run 3.
- alphaTab 1.9.0, 13 bars in three rows, tempo 112, grey bass voice, "alphaTab.net" mark: trials.md Run 1 ("tempo 112") and Run 3. Seen in the picture.
- MuseScore 3.2.3 page with no tab staff, part "Guitar" with a tab staff in the saved file: trials.md MuseScore section (r0124, r0125, verifier's correction). Picture: 13 bars in two rows, seen in the picture.

abcjs
- 6.7.2, link: tools.json. Calls, `capo: 2`, Drop D `tuning` array, `ABCJS.Editor` call: trials.md abcjs "Runs" and "Editable tab in the browser".
- 42 of 90 as `?` (written "question marks" in the caption, outside code): r0239. 90 of 90 read back on the known string and fret: e1332, e1333, e1334 (`--chord-window 0.01`). First count 88 of 90: e0638 (default 50 ms chord window). The verifier's explanation, "an effect of the read-back's time scale with that window, not of abcjs's string choice": trials.md abcjs, "settled by the verifier". Now one sentence, no two-sentence flip.
- `G4` replaced by `A4`, 0 to 2: r0312, editor_edit_trial.json. Clicking or dragging was "not tried" when this fragment was first written (trials.md, verifier, and "Still UNVERIFIED"). Gap round 2 tried it (r0598) and marked that item settled, so the sentence was replaced (sources in "Gap round 2 update" below).
- 2.2 s wall, 123.6 MB peak: ledger r0241. 141 ms in the page: trials.md abcjs.
- Hints: trials.md abcjs "Constraint inputs". The runs used `tuning` and `capo` only. `highestNote` is in the typings (`types/index.d.ts`, trials.md abcjs "Input made for it") and was not tried. Per-note string choice not verified: survey.md abcjs, tools.json `unverified`.
- `text.abcjs-tab-number`: trials.md abcjs. Player not tried: trials.md abcjs "Not tried".

alphaTab
- 1.9.0, link: tools.json. Calls, settings: trials.md Run 1, Run 4, Run 4b.
- 90 of 90 for alphaTex and MusicXML written from the truth: e0024, e0026, e0028 (trials.md Run 2), e0843, e0847, e0852 (trials.md "Output and input format facts").
- `string`, `fret`, `realValue`, string 1 = lowest: trials.md Run 1.
- No console errors r0059 (written "no errors in the browser's log"), `Capo. fret 2`, frets from the capo, sounding pitches r0066, "alphaTab.net" text: trials.md Run 3.
- Metronome "a tick on every beat", count-in "one bar of ticks before the song starts": survey.md "Handoff facts", alphaTab's count-in-and-metronome page ("Before the song starts, the count-in taps out one bar ... during playback, the metronome keeps clicking on every beat").
- MIDI 90 notes, all 90 matched: e0007 (`n_matched_onset_only` 90).
- 90 note events, 52 metronome events = 13 x 4 sent with `metronomeVolume` 0, `playerFinished` 27,994 ms: trials.md Run 4, r0128.
- 121.9 to 139.1 ms, median 130.8 ms: trials.md Run 4. Rerun median 99.6 ms: r0406, trials.md Run 4. Both kept because the trial and the rerun differ, and the verifier left the pinned repeat UNVERIFIED.
- r0406 was `--nolock`, not pinned to 2 cores: ledger, trials.md Run 4.
- 4 extra metronome ticks (four extra metronome events at ticks 0, 960, 1920, 2880), 2,287.9 ms to the first `playerPositionChanged` that is not a seek event (written "alphaTab's first report of where it was in the song"): r0317, trials.md Run 4b.
- WAV 27.858 s: trials.md Run 4 and "Media kept outside git", ffprobe 27.858141 s.
- 195.78 Hz unchanged, 219.75 Hz two semitones up: r0328, trials.md Run 4b.
- 14,053.7 ms at speed 2.0: r0317, trials.md Run 4b. Live sound at speed 2.0 and with `changeTrackTranspositionPitch` not checked (no audio device): trials.md "Still UNVERIFIED", tools.json alphaTab `unverified`. The exported audio's transposition was measured (r0328).
- One `beatMouseDown`, no `noteMouseDown` after a mouse click: r0134. String 3, fret 2 in the saved `.gp`: r0132. No editor UI in the npm package: trials.md Run 5.
- Excerpt: `samples/alphatab/S2n.export.atex`, lines 28 to 33, copied byte for byte. They are the first `\voice` block (line 18, the melody, voice 1 per INPUTS.md "Guitar Pro 5") for bar 1. Line 27, `r.1{dy f instrument acousticguitarnylon}`, is the silent count-in bar 0 (trials.md Run 1 and Run 3). The bass of the same bar is in the second `\voice` block (line 82).
- 0.30 s wall, 2 cores, 83.1 MB: r0020. 703 ms driver start to `postRenderFinished`: trials.md Run 3, r0059. 53.81 s, 2 cores, 28 s of playback, 737.8 MB: r0128, trials.md Run 4.
- Hints: trials.md "Output and input format facts", tools.json `constraints_accepted` (tempo `\tempo`, `\ts`, `FlatSyncPoint`). Tried: `api.playbackSpeed`, `api.metronomeVolume`, `api.countInVolume`, `api.changeTrackTranspositionPitch()` (r0317, r0328). Not in any run: `api.playbackRange`, `api.isLooping` (listed in trials.md "Constraint fields") and `FlatSyncPoint` (docs, survey.md "Handoff facts", "Not run here").
- `.gp` into TuxGuitar 90 of 90: e0477. Into webmscore: r0290. MuseScore 3.2.3 refusal text: r0178. guitarpro-parser refusal text: r0298. No MusicXML or MEI exporter: trials.md "Output and input format facts".
- npm explained as "the public store for JavaScript libraries" and MEI as "another sheet-music file format" at first use, terms only.

ChordSheetJS
- 18.0.0, link: tools.json. Calls, title, key G, tempo 96, capo 0, 9 chords, A minor 7 written as Am, 919 characters: trials.md ChordSheetJS, `samples/chords/tonal_chordsheetjs_S3.json`.
- Transposed line and `{key: A}`: tonal_chordsheetjs_S3.json `transposed_plus2`.
- 1.24 s wall, 88.1 MB: ledger r0251.
- Hints: trials.md ChordSheetJS "Constraint inputs". Quote `The lines will not be folded or changed.` and "a section of guitar TAB instructions": survey.md "ChordPro (format and reference program)", from https://www.chordpro.org/chordpro/directives-env_tab/. `samples/chords/S3.chordpro` has no tab block, so none was tried. "chord sheets, not tab: tab blocks are text" is in tools.json ChordSheetJS `unverified`, so it is no longer stated. Nothing was fed from ChordSheetJS: trials.md.

guitarpro-parser
- 2.0.0, link: tools.json. Calls, note fields: trials.md guitarpro-parser. `string` 0 = highest: trials.md and survey.md.
- e1101, e1103, e1105, e1110. Refusal text: r0298.
- 0.15 s wall, 54.4 MB: ledger r0294. Parse 21.6 ms: trials.md.
- No writer named in the README lines read: survey.md "Added after the first pass" ("Read only (no writer named in the README lines read)"), tools.json `unverified` ("read only: no writer named in the README lines read"), so stated as not verified. No hint fields: tools.json `constraints_accepted` is empty.

LilyPond
- 2.24.3: trials.md heading. Link: tools.json `url`. Command: trials.md LilyPond "Runs".
- 62 of 62 e0413, 90 of 90 e0399, e0415, e0414. R1a 104 of 188 e0416, R1b 33 of 70 e0417, R1c 127 of 145 e0418.
- One string up 64, 37, 18 and two strings up 20: e0416 to e0418 `string_difference_counts` (-1 and -2, string 1 = highest). "The rest of the matched notes": R1a 104 + 64 + 20 = 188, R1b 33 + 37 = 70, R1c 127 + 18 = 145.
- 189 notes and the warning, LilyPond left the note out: trials.md LilyPond (verifier's correction), r0207. 3 of 148 merged by the input script: same place.
- 180 MIDI notes: e0400.
- 4.76 s wall, 2.25 s CPU, 82 MB: trials.md LilyPond, ledger r0197 (82.0).
- Hints, `g4\3`: trials.md LilyPond "Input made for it" and "Constraint inputs".

MuseScore 3.2.3
- Ubuntu package `musescore3` 3.2.3: trials.md. 4.7.6: trials.md "Not run here", for-aaron.md item 1. Link: tools.json.
- Command, `QT_QPA_PLATFORM=offscreen`, Qt message: trials.md "Run setting", r0403.
- One notation staff, no tab staff, exports of that, `.mscx` part "Guitar" with a linked tab staff: trials.md (verifier), r0125.
- Refusal message: trials.md MuseScore, e0141. MIDI 90 of 90: e0145. Capo staff text: r0176. 0 of 90 and 90 of 90 with 2 semitones: e0374, e0376. Drop D 90 of 90: e0378. `.gp` refused: r0178.
- Tab MusicXML kept: e0367. Capo file 0 of 90, 54 and 36: e0368 (`string_difference_counts` 0: 54, -1: 36), trials.md "54 notes stay on their string with the fret 2 higher (counted from the nut)". music21 file log text, C-1 (MIDI 0), 4 of 90: r0181, e0369.
- 0.47 s wall, 79.3 MB: ledger r0120 (trials.md says about 80 MB).
- Into OSMD r0163, Verovio r0168, alphaTab e0792 (`n_est_without_position` 90).

music21
- 10.5.2, link: tools.json. Calls: trials.md music21 r0153, r0154.
- e0191, e0193. TODO comments: trials.md music21 "Output format facts".
- 1.64 s wall, 1.3 s CPU, 69.9 MB: trials.md, ledger r0153.
- OSMD r0161, alphaTab e0908, MuseScore e0369.

OpenSheetMusicDisplay
- 2.3.0, link: tools.json. Calls: trials.md OSMD.
- r0158 180 notes, 90 with string and fret. r0159 three sharps, no capo text. r0160, r0161 90 of 90. r0163 90 notes, 0 with string and fret. Bar numbers from 0: trials.md OSMD.
- 2.56 s wall, 123.5 MB: ledger r0158. 80.5 ms load, 205.5 ms total in the page: trials.md OSMD table.
- `OSMD on its own does not support playback`: survey.md OSMD, "Audio" (README image caption). Playback not tried: trials.md OSMD.

PyGuitarPro
- 0.11, link: tools.json. `guitarpro.parse` and `guitarpro.write`: survey.md PyGuitarPro "How a program calls it". Script name: ledger r0236 command.
- Tempo 112, tuning list, offset 0, 90 notes: trials.md PyGuitarPro. GP5 90 of 90: e0574. GP4 and GP3 42 notes: e0578, e0581. Voice 1 is the melody: INPUTS.md "Guitar Pro 5" ("melody in voice 1, bass in voice 2"), e0007 (42 melody notes).
- Edit and alphaTab's read of it: trials.md PyGuitarPro.
- 0.61 s wall, 23.1 MB: ledger r0236 (trials.md says 23 MB). 0.011 s read: trials.md.
- GP3 into alphaTab 42 of 90: e0805. README names GP3, GP4 and GP5 only: survey.md PyGuitarPro "Not supported". ".gpx and .gp (GP6-GP8) not supported per the README" is in tools.json PyGuitarPro `unverified`, so the fragment says only that no Guitar Pro 6 to 8 file was tried (trials.md: only `S2n.gp5` was read).

svguitar
- 2.10.1, link: tools.json. G 320003 from S3, Bm x24432 from S4, call, 'x' = muted: trials.md "svguitar 2.10.1 and vexchords 1.2.0". Lowest string first: INPUTS.md ("Bm is the x24432 barre"), survey.md "Handoff facts" (D7 = xx0212 "from the lowest string"). 2 SVGs, `2fr`: r0253.
- 2.83 s wall, 123.6 MB: ledger r0253.

Tonal
- 6.5.1, link: tools.json. 9 stretches, 8 of 9, D7 at 18.75 to 20.0 s as `C69#11`, 1.4 ms: trials.md Tonal, tonal_chordsheetjs_S3.json. That D7 is `tonal.rows[7]`, the eighth of nine in time order (the ninth is G, 20 to 24 s, `GM`), so the fragment says "the other stretch", not trials.md's "the ninth" (which means the one left over).
- 1.24 s wall, 88.1 MB: ledger r0251.

TuxGuitar
- 1.5.6 Ubuntu package, Java classes: trials.md TuxGuitar. `java -Djava.awt.headless=true`: the start of r0221's command in the ledger. Link: tools.json.
- GP files: e0457 to e0459, e0464 to e0466, e0471 to e0473. ASCII: e0461. MusicXML 16 of 90, 0: e0460. MIDI: e0462. `.gp` 90 of 90: e0477.
- LilyPond 2.14.0, `fatal error: failed files`, exit 1, PNG still written, `convert-ly -e`: trials.md TuxGuitar (verifier's correction), r0230, r0232.
- Excerpt: `samples/tuxguitar/S2n.tg.ascii.txt` lines 9 to 14, copied byte for byte.
- 0.91 s wall, 65.9 MB: ledger r0221.
- Command-line options: survey.md TuxGuitar (verifier), tools.json `constraints_accepted`.
- Into alphaTab e0799, e0802, into guitarpro-parser e1110. MusicXML into alphaTab 7 matched, 0: e0860.

Verovio
- 6.4.1, link: tools.json. Options `pageWidth` 2100, `scale` 40, `adjustPageHeight`: trials.md Verovio "Runs".
- e0361 90 of 90 counts the MEI my agents wrote from the truth (est `out/verovio/S2n.truth.mei.json`), e0362 90 of 90 counts Verovio's own MEI export of it (est `S2n_mei.export.mei.json`): evals.jsonl `argv`, trials.md Verovio "Checks with gtr-eval". e0363, e0364 90 of 90. e0365 0 of 90, e0366 90 of 90 matched and 90 of 90 same string and fret. e0307 90 matched, 50 with the end too (`n_matched_onset_offset` 50, tolerance from its definitions: max of 0.2 x the note's length and 0.05 s). e0324 180 notes. r0168 no tab staff.
- 1.85 s wall, 175.1 MB: ledger r0165. 656 ms and 156 ms: trials.md Verovio table.
- Timemap fields: trials.md Verovio "MIDI from Verovio". Cursor position data: survey.md "Handoff facts", "Rendering positions for cursor sync".

vexchords
- 1.2.0, link: tools.json. Error text r0253, r0254, r0255. Two extensionless imports r0256 (verifier). esbuild 0.25.12, r0259: trials.md.
- 2.41 s wall, 123.8 MB: ledger r0259. Hints: tools.json `constraints_accepted`.

VexFlow
- 5.0.0, link: tools.json. Calls, 13 bars, 90 positions, `TAB` clef: trials.md VexFlow, r0110. "no standard notation (not requested), no stems, no title, no tempo": the "not requested" reason belongs to the notation only.
- 2.05 s wall, 125.8 MB: ledger r0110. 274.7 ms: trials.md.

VexTab
- 4.0.5, link: tools.json. 1,072 bytes, `Artist(10, 10, 1200)`, 13 bars on 4 lines, G major key signature: trials.md VexTab, r0109. `tuning=dropd`: r0144. `editor="true"`, 250 ms, the edit: trials.md "Editable tab in the browser", r0407. The 250 ms is read from VexTab's source (`src/div.ts`), not measured, and is attributed to the source.
- Excerpt: `samples/vextab/S2n.vextab` lines 1 to 4, copied byte for byte.
- 2.85 s wall, 126.2 MB: ledger r0109. 149.6 ms: trials.md.
- Tuning values, no capo, `player.ts`: trials.md VexTab.

webmscore
- 1.2.1, link: tools.json. Node.js 22.23.4, both error texts, the two workarounds: trials.md webmscore (r0279 to r0286, r0288 to r0291). `--shim-navigator --no-fetch`: the end of r0288's command in the ledger.
- Outputs: trials.md r0288. e0990, e0995, e1002 refused. e0992, e0999, e1006 90 of 90. `.gp` read r0290. e1009 0 of 90, tuning an octave high.
- 4.0 s wall, 218.7 MB: ledger r0288.

What didn't run
- Each reason: tools.json `not_run_reason`, trials.md "Not run here".
- 62 entries not run: tools.json, 62 items with `"tried": false`. The list has 54 lines: 48 single entries, one line for the 8 formats, one for the 6 sound banks, and 4 lines for parts of tools that ran (Listening, MuseScore Studio 4.7.6 of the "MuseScore Studio (mscore CLI)" entry, TuxGuitar's desktop window, Verovio's Python and C++ builds). After gap round 2 the Monaco line is out and the HAYA-TAB line is in, so the counts stay 62, 54 and 48. Each of the 48 single-entry lines was matched to one `"tried": false` item.
- abc2svg not tried for lack of time: trials.md "Not run here" ("Survey tools not tried for lack of time (all marked RUNNABLE in the survey's list)"), checked in its verification log. Deprecation text, npm 1.22.1 of 2022-09-13, project on chiselapp.com: survey.md abc2svg and "Notes on the list".
- alphatab-react and alphatab-ui private, npm 404, playground built on alphatab-ui: survey.md alphaTab "Versions", trials.md Run 5 (verifier), for-aaron.md item 7.
- MuseScore Studio 4.7.6, 192,616,952 bytes, the notice text, 9,000 MB, 4.9 to 5.9 GB free, no FUSE tools, unpacked (`--appimage-extract`, "unpacked size not measured") or FUSE installed before it could run: trials.md "Not run here" (verifier's facts). The trial agent's own 9.5 to 5.3 GB reading is UNVERIFIED and not used.
- Guitar Pro 8: item 6 of for-aaron.md. Its heading's "only if it is already installed" is left out (it says what I would do).
- MNX, "a new specification ... under the working title of MNX" of the W3C Music Notation Community Group: survey.md "Not covered". Whether MNX holds tab: UNVERIFIED there, stated as not checked.
- muzart `pnpm install --frozen-lockfile`, refusal without a log: trials.md "Editable tab in the browser" and "Still UNVERIFIED".
- Steps for me, items 1 to 8: for-aaron.md (item 8, HAYA-TAB, added in gap round 2).
- iText 5.5.13.3: tools.json, survey.md TuxGuitar.
- SONiVOX in r0128: tools.json, trials.md Run 4.

Licenses
- abcjs MIT, alphaTab MPL-2.0, ChordSheetJS GPL-2.0-only, @coderline/alphatab-monaco and @coderline/alphatab-language-server MPL-2.0, guitarpro-parser Apache-2.0, LilyPond GPL-3.0-or-later, MuseScore GPL-3.0, music21 BSD-3-Clause, OSMD BSD-3-Clause, PyGuitarPro LGPL-3.0-only, svguitar MIT, Tonal MIT, TuxGuitar LGPL-2.1, Verovio LGPL-3.0-only, vexchords MIT, VexFlow MIT, VexTab `LicenseRef-LICENSE`, webmscore `GPL`: tools.json `license.code.spdx`, survey.md "Tool list".
- Every quoted clause and its URL: tools.json `license` fields and survey.md "LICENSE FACTS" of each tool. The MuseScore and webmscore quotes start directly after `free software;` in the same sentence, so no semicolon reaches the table.
- SONiVOX Apache 2.0: survey.md alphaTab (a3) and "SoundFonts used by the web players above".
- iText pom names `GNU Affero General Public License v3`: tools.json TuxGuitar `service_terms`, survey.md TuxGuitar.
- No license text for TuxGuitar's Magic Sound Font: survey.md (UNVERIFIED there, stated as "no license text was found").
- LilyPond, MuseScore and TuxGuitar texts read from the current sources, not the packages that ran: tools.json `unverified` for all three (TuxGuitar: "the 1.5.6 Ubuntu package license is not quoted in trials.md"), survey.md TuxGuitar ("README of https://github.com/helge17/tuxguitar, read through the 2026-11-10 clone").
- alphaTab mark "which every drawing of these 13-bar pieces shows": trials.md Run 3 ("Every render has a small "alphaTab.net" text at the top right"). Not every alphaTab drawing has it: the README says `Songs with up to 10 bars are rendered without it, unless more than 2 tracks are shown.` (survey.md alphaTab, LICENSE FACTS a2).
- No model files, no training data: tools.json, `weights` null and `training_data` empty for all 18.

Pictures and pending media
- Source sizes 1240x1197, 1240x1097, 1240x900, 1240x1754: read with Pillow. Output sizes 1240x926 (36,702 bytes), 1240x854 (34,450), 1240x900 (30,336), 1240x930 (43,252): the image script's output.
- Blank rows 925 to 928, 844 to 864, music ending at row 562: row scan of the source pictures.
- WAV durations 27.858 s and 4.005 s, sizes 9,828,396 and 1,413,164 bytes, 44.1 kHz, 2 channels, 32-bit float: ffprobe on 2026-11-10, trials.md "Media kept outside git".

Places where sources differ
- Peak memory: trials.md gives about 80 MB (MuseScore r0120) and 23 MB (PyGuitarPro r0236), the ledger 79.3 MB and 23.1 MB. The ledger's figures are used.
- Run times for browser runs: trials.md gives driver-start or in-page times (abcjs r0241 850 ms, VexFlow r0110 1,062 ms, VexTab r0109 1,352 ms), the ledger the whole run's wall time (2.2 s, 2.05 s, 2.85 s). The fragment gives the ledger wall time plus the in-page time, and for alphaTab r0059 the 703 ms with its definition.
- abcjs 88 of 90 (e0638) against 90 of 90 (e1332 to e1334): the verifier's settled result is used and the first count is stated.
- alphaTab note events +130.8 ms (r0128) against +99.6 ms (r0406): both given, as trials.md does.
- LilyPond R1a missing note, TuxGuitar's LilyPond export, MuseScore 3.2.3's tab part: the verifier's corrected text is used.
- abc2svg: tools.json `not_run_reason` gives the survey's "Not run here." with the npm deprecation, trials.md "Not run here" (checked by the verifier) gives "not tried for lack of time". The verified trials.md reason is used, and the deprecation is kept as a fact.
- Tonal: trials.md calls the D7 "the ninth" (the one left over). By time it is the eighth of nine (tonal_chordsheetjs_S3.json), so it is called "the other stretch".

Gap round 2 update (2026-11-12)
Sources: trials.md "Gap round 2" and "Verification log (verify-gapfill-web-tab-render, round 2, 2026-11-11)", the gap-round notes in trials.md's earlier sections, survey.md (alphaTab "The Monaco package and the language server", abcjs "Clicking and dragging", Verovio "Edits", "HAYA-TAB", "Gap round 2 log"), for-aaron.md item 8, and tools.json as refreshed after that check. Compared with tools.json at commit d2e9a17 (the state this fragment was first written from), only the Monaco entry, HAYA-TAB, abcjs, alphaTab, VexTab, Verovio and webmscore changed in more than the new `string_fret_change` field, and no other entry's `not_run_reason` or `license` changed. Every run id below was re-read in runs.jsonl and every eval id in evals.jsonl on 2026-11-12.

@coderline/alphatab-monaco and @coderline/alphatab-language-server
- 1.9.0 for both, link https://github.com/CoderLine/alphaTab: tools.json `version`, `url`. From the alphaTab project: trials.md (the package comes from the alphaTab monorepo's `packages/monaco`, and the language server's code from its `lsp` folder, verifier). Checks with `AlphaTexImporter`, marks errors, completion: trials.md Monaco section (verifier), tools.json `what`. README quote `This package is still in a very experimental stage.`: trials.md and survey.md.
- `S2n.truth.atex`, 864 bytes: trials.md r0614, ledger r0614 `inputs` (864 bytes). Written from the known answers: trials.md Run 2 ("alphaTex written from the truth JSON"). Mouse and keyboard, by a script (Playwright): trials.md r0614.
- Install command, "added 14 packages in 9s", 125 MB, `monaco-editor` 0.57.0 105 MB: trials.md "Install", tools.json r0604 `install`, repeated by the verifier (r0705). esbuild 0.25.12: trials.md "Install" and "Build".
- Wiring like the playground's source (commit ec751a23), `registerAlphaTexGrammar`, `addTextMateGrammarSupport`, `basicEditorLspIntegration`, `diagnosticsDelay: 150`, `api.tex(text)` 250 ms after the last change: trials.md "Page". "Nothing in it draws a score or connects the editor to alphaTab": trials.md, survey.md (the playground does the redraw "in its own code").
- The step table (line 11 before and after, string 3 fret 2, string 4 fret 5, line 25, the AT208 marker and text, the red underline, Control+Z, `\ca` on new line 7 under the `\tuning` line, 12 suggestions and the first one, the AT204 console text, `\capo 2`, pitches 57 and 55 then 59 and 57): trials.md r0614 table, `samples/alphatab-monaco/alphatab_monaco_edit.json` (matched cell by cell by the verifier). The table's pitches are "sounding MIDI pitch", written "MIDI notes". "the same G": "pitch 55 (the same G3, on the D string)". "an A, not the known G": "the A3 no longer matches the truth's G3". alphaTex as fret, string and length with string 1 the highest: trials.md r0614 input ("notes are fret.string.duration with string 1 = highest").
- Two notes on string 4 at 2.678571 s, nothing reported, the `5` over the grey `0`, both kept in the `.gp`: trials.md "Two notes on one string, here too", tools.json r0614 `two_notes_on_one_string`.
- `.gp` 4,691 bytes after step 2: trials.md "Export and read-back". e1780 and e1782: `n_matched` 89 of 90, `same_string_and_fret_count` 88, `string_difference_counts` {"0": 88, "+1": 1}. e1784 against S5capo2: 89, 88, est capo 2 "stated in the estimate file", truth capo 2. All three gtr-eval 0.12.0. Read back by r0618 (ledger, 2 cores, exit 0).
- r0663: the six files byte-identical, the same notes and markers, 180.0 ms and 448.9 ms: trials.md "After the run", ledger r0663 (2 cores, 12.26 s, exit 0). r0678: 348.7 ms and 674.1 ms: trials.md verification log, ledger r0678 (2 cores, exit 0).
- 1.25 s wall, 384.6 MB: ledger r0604. Bundles 8.2 MB, `editor.js` 6,287,979 bytes: trials.md "After the run" and "Build". 12.84 s wall, 144.8 MB: ledger r0614. 327.6 ms and 656.0 ms: trials.md r0614.
- Hints: tools.json `constraints_accepted` (`\capo` and `\tuning` lines, fret and string, AT208), trials.md "Constraints accepted through the editor". The live playground not checked: tools.json `unverified`, trials.md round-2 "Still UNVERIFIED".
- License row: MPL-2.0, both LICENSE first lines, the URL: tools.json `license`, survey.md alphaTab, the Monaco bullet's LICENSE FACTS. Registry license fields of the 14 installed packages (3 `MPL-2.0`, dompurify `(MPL-2.0 OR Apache-2.0)`, 10 `MIT`): trials.md "Install" (verifier).
- Picture 4: 6 of 13 bars counted in the picture (the count-in bar and the next five), 13 bars: trials.md Run 3. The `5` over the bass's `0`: trials.md (`S2n.monaco_edited.webp` named there). Last non-blank row 1348 and the mark's rows and columns: row scan of the source picture (make_monaco_image.py and a check on the written file).

abcjs
- r0598: 12.63 s wall, 2 cores, 141.6 MB peak, exit 0: ledger. Five fresh pages in one browser: trials.md.
- A click passes the note's place in the ABC text (`startChar`, `endChar`, `el_type` "note" or "tabNumber"), a drag moves the drawing in steps of 3.875 px (`spacing.STEP`, 30 x 93 / 720 at scale 1), a tab number in the same steps "not by strings", the ABC text and the 90 tab numbers unchanged after the drags in "listen" mode, ArrowUp and Enter with `selectTypes: ['note']` (trial C): trials.md "Gap round 2" abcjs table and "In short".
- The two docs quotes: trials.md and survey.md abcjs "Clicking and dragging" (https://docs.abcjs.net/visual/dragging.html).
- 3 of the 90 changed after B, 2 of the 90 after D: trials.md. e1763: `n_matched` 87 of 90, `same_string_and_fret_count` 87. e1764: 88 and 88. Both gtr-eval 0.11.1 with `--ignore-time --chord-window 0.01`.
- Dragging up gave a negative step: trials.md "Drag direction against the docs".
- F sharp on string 4, fret 4, with the bass's open D on string 4 at the same moment, drawn on top of each other: trials.md "Two notes on one string" (trials B and D, `gap2_B_apply_after_drags.webp`), survey.md abcjs "Clicking and dragging".
- The string rule of the 6.7.2 source: trials.md (verifier, `string-patterns.js`), tools.json abcjs `unverified`, survey.md "Gap round 2 log" ("no input for it was found there either"). Per-note string is still UNVERIFIED there, so "was not verified" stays and the source finding is added.
- `dragging`, `clickListener`, `selectTypes`: tools.json abcjs `constraints_accepted`.

alphaTab
- r0624: `Note.string` 4 to 3 and `Note.fret` 0 to 5 in alphaTab's own numbering, which is string 3 to 4 counted from the top, `realValue` stayed 55 (the same G): trials.md "The three smaller runs". Nothing in the browser's log: trials.md verifier ("alphaTab's console was empty"). e1826: `n_matched` 90 of 90, `same_string_and_fret_count` 89, read back by r0627. 1.10 s wall, 2 cores, 138.8 MB: trials.md, ledger r0624 (1.1 s).

VexTab
- r0625: the second `:q 0/3` typed over as `:q 5/4`, 90 numbers before and after, one changed, 0 on string 3 to 5 on string 4, no editor error text: trials.md. The `5` drawn over the `0`: trials.md verifier note (`samples/vextab/gap2_editor_string_edit.webp`). The same pitch: "the same move of the same note, G3 to string 4 fret 5" (trials.md verifier). 2.24 s wall, 2 cores, 131.1 MB: ledger r0625.

Verovio
- r0626: `edit()` with `set` on `tab.fret` and `tab.course`, each returned true, `getMEI()` held the new values, `renderToSVG(1)` frets 2 and 5, the line not measured, one `undo` restored all three: trials.md. e1827: `n_matched` 89 of 90, `same_string_and_fret_count` 88, read back by r0627. Two notes on string 4 in the edited MEI: trials.md verifier (read-back of r0627). The log not read: trials.md, tools.json `unverified`. 0.54 s wall, 2 cores, 195.0 MB: ledger r0626. The hint through `edit()`: tools.json `constraints_accepted`. `<course>` as the string: this fragment's existing Verovio hint line.

webmscore
- The methods of `src/index.js`, none edits a note, and a `.mscz` or `.mscx` input with string and fret not tried: trials.md string-or-fret table (verifier), tools.json webmscore `unverified`.

HAYA-TAB
- A desktop program for a library of tab files, alphaTab 1.8.1 as its viewer and player: survey.md "HAYA-TAB", tools.json `what`. Only asked to describe it: tools.json `not_run_reason` ("the gap asked for a survey line"). Release v3.1.8 files fetched from the box by their own URLs, the three libraries the Linux build is linked against and the box lacks, nothing attempted: trials.md HAYA-TAB (verifier), "Not run here", tools.json `not_run_reason`. No exporter call and no string or fret write in `frontend/src`, the edit dialog for title, artist and other library details: trials.md, survey.md. Item 8: for-aaron.md.

Where the gap-round sources differ
- gtr-eval version of e1780, e1782, e1784, e1826 and e1827: 0.12.0 in the ledger, where the round first said 0.11.1 (corrected by its verifier). The fragment gives no version.
- HAYA-TAB: the round's first reason (the box "cannot list" the releases) was replaced by its verifier's measured reason, which is the one used.
- After the last refresh tools.json has `peak_mb` null for r0618, r0627, r0678 and other reruns, while the ledger has values. The fragment gives peak memory only from the ledger, and none for those runs.

Checker's fixes to the gap-round update (2026-11-12)
- abcjs "compared by note order" for e1763 and e1764: both ran with `--ignore-time --chord-window 0.01`, and their `definitions.matching` reads "ORDER ONLY (--ignore-time) ... times are not compared", so the block intro's 50 ms onset rule doesn't apply to them (the same as LilyPond's real clips and TuxGuitar's ASCII tab, which already say "by note order").
- abcjs tab-number drag: trials.md "Gap round 2" table, trial A (dragged down one tab-line spacing, `drag.step` +3, "the "3" drawn 11.625 px lower, on the next line down"). The earlier wording "not from string to string" read as if the number stayed on its line.
- Monaco: the package "carries its own copy of the language server's code": trials.md Monaco section, verifier (`dist/worker.mjs` has the language server compiled in from the `lsp` folder and doesn't import `@coderline/alphatab-language-server`). `AlphaTexImporter` as alphaTab's alphaTex reader: the same note. esbuild "packed them into files a web page can load": trials.md "Install" (the package's files import CommonJS packages by bare name, "which a browser cannot load without a bundler"). The playground as "alphaTab's own test page": for-aaron.md item 7. "Saved by the page": the `.gp` and alphaTex were exported in the page during r0614 and only read back under Node in r0618 (trials.md "Export and read-back"). r0663 ran after `node_modules` was "deleted except `vscode-oniguruma`" (trials.md "After the run"), so "every installed package but `vscode-oniguruma`".
- VexTab "Later": r0625 is the gap round's run, not the checking agent's r0407.
- HAYA-TAB: "running a virtual display" because Xvfb is installed and wasn't started (trials.md verifier note, tools.json `not_run_reason` "it has libgtk-3 and Xvfb"). The source finding is the exact one, "no file in `frontend/src` calls an alphaTab exporter or sets a note's string or fret" (trials.md and survey.md "Does it edit tabs?"), instead of "saves a tab file".
- License row: the one URL in tools.json is the Monaco package's LICENSE, so the link now says so. The language server's LICENSE line was read in its 1.9.0 tarball (survey.md), with no URL given.
- Whole-post repair (2026-11-12). Rundown: six tools read `S2n.gp5` (In lines of alphaTab, guitarpro-parser, MuseScore 3.2.3, PyGuitarPro, TuxGuitar and webmscore). Four kept 90 of 90 on the known string and fret: alphaTab e0004, guitarpro-parser e1101, PyGuitarPro's saved GP5 e0574, TuxGuitar e0456 and its GP5 e0457. MuseScore 3.2.3 and webmscore are left unnamed ("Of the six"), with their results in their entries. Was "alphaTab, guitarpro-parser and TuxGuitar", which left PyGuitarPro out.
- Whole-post repair: LilyPond on R1 in the guitar-tab lane, `scripts/run_lilypond_tab.py`, matched by time (`ignore_time` false): e0182 104 of 189 truth notes, e0183 32 of 70, e0184 129 of 148 (`same_string_and_fret_count`). This lane's e0416 to e0418 are `--ignore-time` (note order).
- Whole-post repair: the guitar-tab lane tried `minimumFret` (e0185, e0187, e0188, e0190), `restrainOpenStrings` (e0186, e0189) and `g\4` on one note (r0155, `runs.jsonl` label "LilyPond: S2n with group 0 pitch 55 pinned to string 4"): guitar-tab fragment LilyPond entry.
- Whole-post repair: soundfont-player 0.12.0 ran in browser-audio-sync (r0229, `runs.jsonl` label "... smplr 1.2.0 (ESM build) and soundfont-player ..."), `handoffs.json` `soundfont-player` ran-here. tutts 0.1.0 ran in guitar-tab (r0205, r0240), `handoffs.json` `tutts` ("tutts and tutts-alphatab") ran-here. tutts-alphatab not run: this lane's `tools.json` reason.
