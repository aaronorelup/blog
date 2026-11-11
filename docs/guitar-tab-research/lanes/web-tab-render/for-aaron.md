# web-tab-render: steps for Aaron

Things this lane could not run on the cloud box, written so they can be done on the Windows 11 laptop (or in the
product's own website) without programming. Each item says which files to use and what to send back. The files named
here are in the blog repo under `docs/guitar-tab-research/` (the `inputs/` folder holds the shared test files; this
lane's `samples/` folder holds the files the trials made). Nothing here needs the GPU.

Why these were not run here: MuseScore 4 was not downloaded: the shared disk was low (an orchestrator notice asked
lanes not to start downloads or installs over 200 MB), and its Linux AppImage (192.6 MB) would have had to be unpacked
to run on the box, which has no FUSE tools; muzart could not be installed because this session's permission
check refused running that repository's install step (the trial agent's report); Soundslice, Flat.io and Guitar Pro
need an account or a paid desktop program; the box has no sound card, so nothing could be listened to. HAYA-TAB (item
8, added in gap round 2 on 2026-11-11) is a desktop program whose builds are on GitHub Releases, which the box cannot
list.

## 1. MuseScore Studio 4 (free desktop program): does it make a TAB staff from Guitar Pro files?

On the box, MuseScore 3.2.3 opened the `.gp5` test files with a main score of plain notation and no TAB staff; a TAB
staff existed only in a part named "Guitar" inside the saved file, and its MusicXML and PDF exports were of the main
score. It refused the `.gp` (Guitar Pro 7) file that alphaTab wrote. webmscore (MuseScore 3's engine compiled to
WebAssembly; its changelog records a merge of MuseScore 3.6.0) read the `.gp` but made no TAB staff and no parts.
This checks the current MuseScore (musescore.org's download page linked version 4.7.6 on 2026-11-10).

1. Download MuseScore Studio from https://musescore.org/ and install it (free). Note the version shown under
   Help > About.
2. In MuseScore, File > Open: `inputs/S2n/S2n.gp5`. Take a screenshot of the first page. If MuseScore shows parts for
   the score (a part named "Guitar", for example), open each part too and take a screenshot of its first page.
3. Do the same for `inputs/S5capo2/S5capo2.gp5` (capo on fret 2) and `inputs/S5dropd/S5dropd.gp5` (Drop D tuning).
   Look for the word "Capo" and for the tuning shown at the start.
4. File > Open: `lanes/web-tab-render/samples/alphatab/S2n.export.gp` (the Guitar Pro 7 file alphaTab wrote). Note
   whether it opens or what the error says.
5. For each file that opened: File > Export, choose "MusicXML", save it.
6. Send back: the screenshots, the exported `.musicxml` files, the MuseScore version, and any error message text.
   (About 15 minutes; free.)

## 2. muzart (free, open-source tab editor in the browser): can a note be changed and saved?

1. Open https://thegedge.github.io/muzart/ in Chrome or Edge.
2. If it has an open or import button, open `inputs/S2n/S2n.gp5`. If not, use the demo song it shows.
3. Click the first note of the first bar and try to change its fret number (try typing a number, and the arrow keys).
4. Look for a save, export or download option and use it if there is one.
5. Send back: a screenshot before and after the change, the name of every button or key that worked, and any file it
   saved. (About 10 minutes; free.)

## 3. Soundslice (website, needs an account): tab display, player and export

1. Make an account at https://www.soundslice.com/ (note which plan it puts you on and the price it shows).
2. Create a new slice and upload `inputs/S2n/S2n.gp5`. If it asks for MusicXML instead, upload
   `lanes/web-tab-render/samples/musicxml-from-truth/S2n.truth.musicxml`.
3. Check that a TAB staff shows the same numbers as `inputs/S2n/S2n.tab.txt` (open that file in Notepad), and press play.
4. Try the capo file `inputs/S5capo2/S5capo2.gp5` the same way and look for "capo" on the page.
5. Look for an export or download option (MusicXML, Guitar Pro, PDF, MIDI) and use the ones that exist.
6. Send back: screenshots of the tab and of the export menu, any exported files, the plan name and price shown.

## 4. Flat.io (website, needs an account): import, tab and export

1. Make an account at https://flat.io/ (note the plan and price shown).
2. Import `lanes/web-tab-render/samples/musicxml-from-truth/S2n.truth.musicxml`, then also try importing
   `inputs/S2n/S2n.gp5`.
3. Check whether a TAB staff appears with the same numbers as `inputs/S2n/S2n.tab.txt`.
4. Change one note in the tab (the first note of the first bar), then export as MusicXML.
5. Send back: screenshots, the exported MusicXML, and which of the two imports worked.

## 5. TuxGuitar (free desktop program): its own window, not only its converters

On the box only TuxGuitar's file converters were used, from a small program; its window was never opened.

1. Download TuxGuitar for Windows from https://www.tuxguitar.app/ (or the TuxGuitar page on SourceForge) and install it.
2. Open `inputs/S2n/S2n.gp5`. Click the first note of bar 1 and change its fret (type a number).
3. File > Save As: save as `.gp5`, then File > Export as MusicXML, and as ASCII tab if offered.
4. Send back: a screenshot, the saved files, the TuxGuitar version from Help > About.

## 6. Guitar Pro 8 (paid desktop program, only if it is already installed)

1. Open `lanes/web-tab-render/samples/alphatab/S2n.export.gp` (written by alphaTab) and `inputs/S2n/S2n.gp5`.
2. Note whether each opens. Also open `inputs/S5capo2/S5capo2.gp5` and note how its capo on fret 2 is shown (a
   screenshot of the top of the first page is enough).
3. Export `S2n.gp5` as MusicXML.
4. Send back: screenshots, any error text, the exported MusicXML.

## 7. Listening check of alphaTab's player (needs speakers; free)

The box measured when alphaTab's playback events fired, but it has no sound card. This checks the sound itself.

1. Open https://alphatab.net/playground in Chrome (alphaTab's own test page; the box saw this address linked from
   https://alphatab.net/docs/introduction). The live page was not opened from the box; the steps below follow the
   playground's source in the alphaTab repository (commit ec751a23 of 2026-11-08), which has an open-file and a
   drop-file handler and "Count-in" and "Metronome" buttons in its player controls.
2. Load `inputs/S2n/S2n.gp5` into it (drag the file onto the page, or use its open button).
3. Press play with the metronome on, then with the count-in on (look for the "Metronome" and "Count-in" buttons).
4. Send back: a short note saying whether the notes, the metronome clicks and the moving cursor stay together by ear,
   and, if you can, a phone video of the screen with sound (about 20 seconds).

## 8. HAYA-TAB (free desktop tab library with an alphaTab viewer): what it shows, and whether a note can be changed

Added in gap round 2 (2026-11-11). Its source code (commit eb0466a of 2026-07-31) has a viewer and player built on
alphaTab 1.8.1 and an edit dialog for the title, artist and other library details, and no code that changes a note
or saves a tab file. This checks the released program.

1. Open https://github.com/HAYASAKA7/HAYA-TAB/releases/latest in a browser, download the Windows build and install it
   (free; Apache 2.0 license). Note the version number.
2. Right-click empty library space and choose **Upload TAB** (the README's words). Add `inputs/S2n/S2n.gp5`,
   `inputs/S5capo2/S5capo2.gp5`, `inputs/S5dropd/S5dropd.gp5` and `lanes/web-tab-render/samples/alphatab/S2n.export.gp`.
3. Open each one with **Open with Inner Viewer**. Take a screenshot of the first lines of each. Look for a TAB staff,
   for "Capo" on the capo file, and for the tuning on the Drop D file. Note any file that does not open, with the
   message.
4. In the S2n file, click the first note of bar 1, then right-click it. Note whether anything lets you change its fret
   or string, and whether there is a save or export command for the tab itself.
5. Press play once with the speed control at 50 % and note whether playback starts.
6. Send back: the version, the screenshots, which files opened, and the answers to steps 4 and 5. (About 15 minutes;
   free.)

---

Checked on 2026-11-10 by `verify-trials-web-tab-render` against the box's files and the alphaTab repository source;
what changed in this file is listed in `trials.md`, section "Verification log". Item 8 and the HAYA-TAB sentence of the
introduction were added by `gapfill-web-tab-render` on 2026-11-11 (`trials.md`, section "Gap round 2").
