# Lane 9, apps-survey: trials

Agent: `try-apps-survey`. Started 2026-11-10 (UTC, from `date -u +%F`). This file records what was downloaded,
installed and run on the research box for the existing apps in this lane, and what came out. The products that could
not be run here are listed with the reason, and their steps are in `for-aaron.md` next to this file. The product
facts (prices, features, terms) are the `docs-apps-survey` agent's `survey.md`; this file only repeats what a trial
needed.

Box: 4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU, shared with about 20 agents. Big files of this lane are under
`/home/user/gtr/lanes/apps-survey/` (not in git). Run ids (`r....`) are lines of `/home/user/gtr/ledger/runs.jsonl`.

**Summary.** No product in this lane produced a transcription on the box, so there are no output files and no
`gtr-eval` scores here. Two products with a Linux build were downloaded and read without being executed (AnthemScore
6.3.0, Transcribe! 9.70.4); one web app was driven up to its consent step (AnthemScore Web, run r0062, input S2s);
one open-source camera app was cloned but not installed (Guitar Learning). Three steps were refused by this session's
permission system (table near the end). Each product that can take one of the shared clips has a test for Aaron in
`for-aaron.md`; the others are listed there with the reason. The lane's ledger runs are r0055 (failed at start,
script format) and r0062.

## AnthemScore 6.3.0 (Linux AppImage of 2026-09-30)

- **What it is:** desktop audio-to-notation program by Lunaverus LLC (https://www.lunaverus.com) for Windows, macOS and
  Linux, with guitar, bass guitar and ukulele tablature among its output options. The download page links "see what's
  new in 6.3.0"; the version history's newest entry is 6.3.0, "released 2026-09-29"
  (https://www.lunaverus.com/versionHistory, read 2026-11-10). The version in this section's title comes from those
  pages and the AppImage's date; no version string was found in the binary, so it is not confirmed from the file.
- **Download:** `https://www.lunaverus.com/download/linuxAppimage` answered HTTP 302 to
  `https://sfo2.digitaloceanspaces.com/lunaverus/static/resources/installers/AnthemScore-x86_64.AppImage`
  (`content-length: 216013304`, `last-modified: Wed, 30 Sep 2026 18:51:55 GMT`). Downloaded 2026-11-10 in 10.3 s,
  216,013,304 bytes, sha256 `3e6b7758423c6b46e8b71dffa16f8b1cf09d295757c4d93227012c5fc257af9d`, kept in
  `/home/user/gtr/lanes/apps-survey/dl/anthemscore/`. No account or key was needed to download it. The download
  page says: "No account creation needed, just download and run! The software runs in trial mode until you enter an
  activation key. In the trial, you are limited to the first 30 seconds of each song. By default the trial runs as
  the AnthemScore Professional edition, but you can switch between Lite and Professional by selecting Tools >
  Editions." (https://www.lunaverus.com/download, read 2026-11-10)
- **Install attempt:** `AnthemScore-x86_64.AppImage --appimage-extract` was refused before it ran, by this session's
  permission system: "Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code
  from External]." The AppImage was then unpacked as data, without running any of its code:
  `apt-get install -y squashfs-tools` (Ubuntu package 1:4.6.1-1build1), the squashfs start found at byte 944632 (end
  of the ELF runtime's section headers, magic `hsqs`), then
  `unsquashfs -q -o 944632 -d squashfs-root AnthemScore-x86_64.AppImage`: 4,626 inodes, 500 MB on disk.
- **What the package holds** (read from the files, not from a running program): the main binary `AnthemScore`
  (36,492,544 bytes, ELF x86-64), Qt 6 libraries including Qt WebEngine, `libonnxruntime.so.1.17.1`, FFmpeg
  libraries, `libfluidlite`, the SoundFont `AS_resources/FluidR3Mono_GM.sf3` (14,563,174 bytes), a sheet-music viewer
  in `AS_resources/viewer/` that includes `opensheetmusicdisplay.min.js`, and UI text in `languages/*.json`. No
  separate `.onnx` model file is in the package; ONNX node names (for example `/m/frontend/stem/activation/Erf`)
  appear inside the main binary. No file named `license*` is in the extracted tree (`find . -iname 'license*'`
  printed nothing), although the site's Terms of Service, section 13, say the license is "the "license.txt" file,
  which is included in every download of the software" (quoted in full below).
- **Constraint and output options, from `languages/English.json`** (UI strings, not tried): instruments include
  `"INSTRUMENT_GUITAR": "Guitar"`, `"INSTRUMENT_BASS_GUITAR": "Bass Guitar"`, soprano and concert ukulele;
  `"TABLATURE": "Tablature"`, `"TABLATURE_OPTIONS": "Tablature options"`, `"STRINGS": "Strings"`; MIDI options
  `"MIDI_AUTO_TEMPOS": "Auto-detected tempo map"`, `"MIDI_ANNOTATED_TEMPOS": "User annotated tempos"`,
  `"MIDI_CONSTANT_TEMPO": "Constant tempo"`; export formats `"FORMAT_MIDI": "MIDI (.mid)"` and
  `"FORMAT_TIMING_CSV": "Beat and Note Timing (.csv)"`; `"AUTO_INSTRUMENT_DETECTION": "Auto instrument detection"`;
  the trial notice `"TRIAL_LIMITATION": "The trial is limited to 30 seconds. Purchase an activation key to see the
  full song."` and `"TRIAL_SAVE_WARNING": "You have the AnthemScore trial. You can save this project, but to open it
  again you must purchase AnthemScore."`. The license check needs the network:
  `"LICENSE_FILE_MISSING": "The license file is missing. Please check your internet connection. ..."`. The vendor's
  documentation page (https://www.lunaverus.com/documentation, read 2026-11-10) says of tablature: "You can also
  define the number of strings and frets and the string tunings if you want to create tablature." and "Strings should
  be set to the instrument's _written_, not _sounded_, pitches." A capo setting is not mentioned there.
- **Command line:** the version history (https://www.lunaverus.com/versionHistory, read 2026-11-10; each entry is a
  version number, "released <date>" and a list) has, under 1.1.1 "released 2016-04-22", "Added command line
  interface"; under 3.3.2 "released 2018-04-23", "Conversion of ASDT files to XML, MIDI, and CSV from the command
  line"; under 4.14.0 "released 2021-11-16", "Command line option to skip finding notes"; under 5.1.0 "released
  2024-10-09", "Added command line option to set smallest allowed note"; and under **6.0.0 "released 2026-05-07",
  "Removed CLI options"**. The current documentation page does not describe a command line. In the 6.3.0 binary the
  only strings next to its Qt command-line parser are `AnthemScore command line`, `source`, `Source file (mp3, wav,
  asdt, etc.)`, `Creating window` and `Command line arguments: filename=`; no export option names were found there.
  These strings and the 6.0.0 note point to a single file argument that is opened in the program's window, with no
  export switches; that was not checked by running it, so an unattended export on 6.x is UNVERIFIED.
- **GPU:** the version history has, under 4.2.0 "released 2019-01-31", "Very fast note finding for Cuda capable
  Nvidia GPUs on Windows and Linux (cuda status in 'about' menu)". In the 6.3.0 Linux package,
  `ls lib | grep -iE 'onnx|torch|cuda|tensor|ort'` listed `libonnxruntime.so` and `libonnxruntime.so.1.17.1` and no
  CUDA library (its only "cuda" match was `libicudata.so.73`). Whether 6.x uses a GPU on Windows is not stated on the
  pages read.
- **NOT RUN HERE.** Executing the AppImage (or the unpacked binary) is the step this session's permission system
  refused ("[Code from External]", above), so no clip went in and nothing came out: no run id, no timing, no scores.
  Other facts that bear on a run on this box, from the download page: "Virtual machines, 32-bit systems, and
  phones/tablets are not supported." and "AnthemScore was tested on Ubuntu 20.04 and later. It does not require root
  to run on Ubuntu, but it seems that the license functionality may not work properly without root on some other
  distros." The trial's 30-second limit would cover all of S2s (29.357 s), R1a (29.159 s) and the first 30 of R2's
  36 s. Steps for Aaron's laptop: `for-aaron.md`, AnthemScore.
- **Terms, quoted** (https://www.lunaverus.com/tos, fetched with curl 2026-11-10; the page shows no date):
  - Section 2: "Permission is granted to temporarily download one copy of the materials (information or software) on
    Lunaverus LLC's web site. This is the grant of a license, not a transfer of title, and under this license you may
    not: modify or copy the materials, except as allowed by the software license; use the materials for any public
    display (commercial or non-commercial); remove any copyright or other proprietary notations from the materials;
    or transfer the materials to another person or "mirror" the materials on any other server."
  - Section 3: "You retain all ownership rights to any audio files, musical works, or other content ("User Content")
    that you upload, submit, or process through the Service."
  - Section 10: "For desktop software, refunds are available for unused activation keys only. There are no refunds
    for used activation keys or software upgrades. Please use the free trial to evaluate the software before making a
    purchase."
  - Section 13: "Before using the AnthemScore desktop software, you must agree to the terms in the "license.txt"
    file, which is included in every download of the software. By using the software you are agreeing to these
    terms."
  - Not read: the `license.txt` itself (not found in the Linux AppImage; the Windows installer was not downloaded).
- **Disk:** the AppImage (216,013,304 bytes) is kept; the 500 MB unpacked tree was deleted once the facts above were
  written down (the binary's `strings` output and `languages/English.json` are kept next to it in
  `/home/user/gtr/lanes/apps-survey/anthemscore/`).

## Transcribe! 9.70.4 (Seventh String Software, Linux x86-64 build)

- **What it is:** a closed-source desktop program for slowing down, looping and studying recordings, with on-screen
  note and chord guesses; Windows, macOS and Linux (https://www.seventhstring.com/xscribe/download.html, read
  2026-11-10). Price on the buy page: "Transcribe! is priced in US dollars, $39 for a single copy (plus any local
  taxes)." (https://www.seventhstring.com/xscribe/buy.html, read 2026-11-10)
- **Download:** `https://www.seventhstring.com/xscribe/downlo/xscsetup-9.70.4.tar.gz` (linked from
  https://www.seventhstring.com/xscribe/download_linux.html, "Current Version (built on Xubuntu 20.04)", "System
  requirements : a computer running 64-bit Linux (x86-64), with GStreamer-1.0, GTK-3."). 4,365,589 bytes,
  `Last-Modified: Sun, 18 Oct 2026 15:27:24 GMT`; its sha256
  `626c57dea5306eeb8131ed83b92cea56d96ad5cbcec40629de4845f2cc3836cd` equals the one printed on the download page.
  Unpacked with `tar -xzf` (11 MB): `transcribe` (ELF x86-64 executable), `xschelp.htb` (the help, a zip of HTML
  pages), `install-linux.sh`, `readme_gtk.html`, two GStreamer plugins, icons. Kept in
  `/home/user/gtr/lanes/apps-survey/dl/transcribe/`.
- **NOT RUN HERE.** It is a GTK desktop program; its scripting runs its menu commands, and none of those writes note
  or chord guesses to a file (below). Running a downloaded vendor binary is the step this session's permission system
  refused for AnthemScore ("[Code from External]", above), so it was not started. Only its files and help pages were
  read. Steps for Aaron: `for-aaron.md`, Transcribe!.
- **What it outputs, from its own help** (`xschelp.htb`, unzipped and read 2026-11-10):
  - No notes as data: "Transcribe! does not output MIDI at all." (`midi.htm`)
  - Note and chord guesses are shown on screen only: "Note guesses are displayed as green (in tune) and red (out of
    tune) blobs on the piano keyboard. Chord guesses are displayed by name at the top right of the area where the
    spectrum graph is." (`guess.htm`); "The Piano Roll display is optional and it shows Transcribe!'s guesses about
    what notes are being played, in the style of a piano roll" and "These note guesses are derived from a straight
    mono mix of the sound." (`pianoroll_menu.htm`)
  - What it writes to disk: processed sound or video (`FileExportSound`, `FileExportVideo` commands) and markers and
    text blocks (`MarkersAndTextBlocksExport`) (`cmnddoc_files.htm`, `cmnddoc_markers.htm`).
  - Guitar positions: "When you right-click the piano keyboard, a little window pops up telling you which strings at
    which fret would play the note. This initially defaults to standard six string guitar, but this is where you can
    specify other string instruments, the number of strings and tuning." Capo: "If you sometimes use a capo on a
    guitar, then this page is probably not the place to deal with it. Instead, treat guitar-with-capo as a
    transposing instrument." (`prefs_frets.htm`)
  - Scripting: commands can be put in a UTF-8 text file with the extension `.xscscpt`, and "Simply opening this file
    in Transcribe! will cause the commands to be carried out." (`automation.htm`). The documented command names
    found with `export` in them are `FileExportSound`, `FileExportSoundNamed`, `FileExportSoundNamedRR`,
    `FileExportSoundSplit`, `FileExportVideo`, `FileExportVideoNamed`, `FileExportVideoSplit` and
    `MarkersAndTextBlocksExport`; none exports note or chord guesses.
- **License, quoted** (`license.htm` inside the download, read 2026-11-10): "When Transcribe! is installed for the
  first time on a computer which it has not been installed on before, you will normally find that it will run for 30
  days without requiring a "license key". If you want to use it beyond the 30 day evaluation period you must buy a
  license to use Transcribe! (the license described here)." and "You may not modify, decompile, reverse engineer,
  disassemble, or create derivative works of the Transcribe! software or any part of it." Nothing in it addresses the
  user's own transcriptions or exported files.

## AnthemScore Web (lunaverus.com/transcribe, free plan, as served 2026-11-10)

- **What it is:** Lunaverus's browser version of AnthemScore. Pricing page (https://www.lunaverus.com/transcribe/pricing,
  read 2026-11-10): "Free $0 30 second transcriptions"; "Plus ... $8.33 / month $99.90 billed annually 30 songs a month
  Up to 6 minutes per song PDF, MIDI, and musicXML download"; "Pro $24.99 / month $299.90 billed annually 100 songs a
  month Up to 10 minutes per song PDF, MIDI, and musicXML download Free use of the AnthemScore desktop app while
  subscribed"; and "A free account can start a 14 day trial of full length songs at any time from the AnthemScore Web
  home page. ... Outside the trial, free transcriptions are limited to 30 second clips."
- **Terms read before scripting:** the Terms of Service (https://www.lunaverus.com/tos, quoted under AnthemScore
  above) and the Privacy Policy (https://www.lunaverus.com/privacy) were read on 2026-11-10; neither has a clause
  about automated or scripted access. The Privacy Policy says: "When you use our web-based transcription services, we
  collect and store the content you submit, including audio files, video files, text, and other media ("User
  Content"). We also store the transcripts, file settings, user actions and modifications, and output generated by
  our system from this content."
- **What was run:** `scripts/anthemscore_web_explore.cjs` in headless Chromium (Playwright 1.63.0 on the box), run
  r0062 (`--nolock`, wall 10.51 s, the time of the browser script on this box; the first attempt r0055 failed at once
  because Node treated the file as an ES module). Input: S2s (`S2s.wav`, 5,178,644 bytes). No account, no sign-in.
  What happened, from the script's log and the page's network log (`responses.log`):
  - Choosing the file on https://www.lunaverus.com/transcribe/audio-to-guitar-tab started the upload by itself:
    `GET /transcribe/getJobCode?size=5178644` (200), then `POST /transcribe/uploaded/<job code>` (200), then the
    browser was sent to `/transcribe/jobSettings/<job code>`. Between the first two, the page's own script sends the
    file with a `PUT` to the signed `upload_url` that `getJobCode` returns (read in the page source; the log kept only
    lunaverus.com URLs, so the `PUT` itself is not in it). The settings page then showed the clip's waveform and
    length, so the file reached Lunaverus.
  - The job settings page (screenshot `samples/anthemscore-web/job_settings_S2s.webp`) shows "Transcribing up to 30
    seconds", a title field (filled with "S2S"), a trim control ("Whole song, 0:29", start 0:00.0, end 0:29.3), a
    switch "sheet music / tablature" (tablature selected on this page), "Instruments: Guitar", "Advanced Options",
    a required checkbox "I confirm that I own or have obtained all necessary rights to transcribe this audio.*", the
    line "By continuing, you agree to our Terms of Service and Privacy Policy." and a "Transcribe" button.
  - Form fields on that page (from its HTML): `format` = `sheetMusic` | `tablature`; `autoDetectInstruments`
    (checkbox); `instruments` (29 checkboxes: piano, guitar, bass_guitar, soprano_ukulele, harp, strings, woodwinds,
    brass and percussion; guitar ticked); `timeSignature` = auto, 4/4, 3/4, 2/4, 6/8; `keySignature` = auto or -7 to 7
    (number of sharps or flats); `smallestNote` = 4, 8, 16, 32 (default), 64; `trimEmpty` (checked); `trimStart`,
    `trimEnd`; `transcription_rights` (required). There is no tuning, capo or string field on the web form.
  - The explore script pressed the first submit control it found 3 s after choosing the file; by then the browser was
    already on the settings page, so it pressed "Transcribe" with the rights box unticked. The browser's form check
    stopped it ("Please check this box if you want to proceed." in the screenshot) and no transcription started.
- **NOT RUN to a result.** A second script (`scripts/anthemscore_web_run.cjs`) ticks the rights box and presses
  Transcribe. This session's permission system refused to start it: "Permission for this action was denied by the
  Claude Code auto mode classifier. Reason: [Consent Given For The User]." Ticking that box states rights and accepts
  the Terms and Privacy Policy on Aaron's behalf, so it was not done another way. No transcription, no output, no
  scores. Steps for Aaron: `for-aaron.md`, AnthemScore Web.

## Guitar Learning (DecoudJuan/Guitar-Learning, commit 692957d, 2026-10-17)

- **What it is:** an MIT-licensed browser app (TypeScript, Vite, `@mediapipe/tasks-vision`) that tracks the fretting
  hand on a live camera and checks chord shapes; it makes no transcription and outputs no tab. README:
  "You need a guitar, a webcam, and four clicks on the corners of your fretboard." and "Four clicks — the two ends of
  the nut and the two ends of the 12th fret — and a four-point homography turns any pixel into a (string, fret)
  position and back." Live at https://guitar-learning-ten.vercel.app (per the README). LICENSE: "MIT License /
  Copyright (c) 2026 Malena / Copyright (c) 2026 Juan Decoud".
- **Source:** `git clone --depth 1 https://github.com/DecoudJuan/Guitar-Learning` on 2026-11-10, commit
  `692957d1a6775634ae7575cef1f580e15b9dac24` (2026-10-17), 960 KB, kept in
  `/home/user/gtr/lanes/apps-survey/clones/Guitar-Learning/`.
- **The part that runs without a camera** (read in the code, not run): `npm run neck-check -- photo.png` bundles
  `scripts/neck-check.mjs` with esbuild and runs the automatic neck detector (`src/vision/NeckDetector.ts`,
  `detectInGrey`, working width 480 px) on one still. Input: an 8-bit PNG only ("PNG only, 8-bit, decoded here so
  the repo stays at one dependency"). Output: text lines, either `DETECTOR RETURNED NULL` or `confidence <x>, far
  pair called fret <n>` followed by the pixel corners of the nut side and the far side. The hand model is MediaPipe's
  `hand_landmarker.task` (float16) fetched from storage.googleapis.com, with `delegate: "GPU"` and `numHands` 2 by
  default (`src/vision/HandTracker.ts`).
- **The authors' own measurement**, quoted from the README: "measured against seven webcam frames of a real guitar
  in a real room, it returns nothing on all seven", and from `BITACORA.md` (Spanish): "Con todo lo anterior, las
  siete fotos dan **null**".
- **NOT RUN HERE.** The plan was neck-check on stills from R3a. `npm ci --ignore-scripts` in the clone was refused
  by this session's permission system: "Permission for this action was denied by the Claude Code auto mode
  classifier. Reason: [Code from External]." Nothing was installed or run. The live app needs a camera and four
  manual clicks, so it is in `for-aaron.md` as an optional test.

## ChordAR (manbr21/Computer-Vision-Guitar-Tutor)

- **What it is:** a Python webcam tutor, per its README "a fork of Chordially / Computer-Vision-Guitar-Tutor (ArUco
  markers + MediaPipe Hands)", that labels each fingertip with a string and fret and scores eight chord shapes; no
  transcription. It has a "Virtual capo: tell the program the fret of a physical capo and the chord shape moves up
  that many frets". Only the README was read
  (https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/README.md, 2026-11-10); the repository
  was not cloned.
- **NOT RUN HERE.** Its README requires printed markers on the instrument: "Place the markers (IDs as drawn on the
  sheet): **0** and **1** at the nut (top and bottom edge of the neck), **3** and **2** at fret 12 (top and bottom)."
  No shared clip (R3a) has markers on the guitar. Installing it was not attempted after the refusal above. License:
  its README says of the upstream project it forked, "Its README states the MIT license but the repository has no
  `LICENSE` file"; `survey.md` reports no LICENSE file in the fork either (checked by the docs agent 2026-11-10).

## The other products in this lane: not run here

None of these was started on the box. "Web service" means that using it means accepting its terms (and usually
stating rights to the upload) on Aaron's behalf, which this session's permission system refused for AnthemScore Web
("[Consent Given For The User]", above), so no other web app's upload was attempted. Terms clauses on automated use
are quoted in `survey.md`. The test for each is in `for-aaron.md` (number in the last column).

| Product | Kind (from `survey.md`) | Why not run here | for-aaron |
|---|---|---|---|
| Klangio Guitar2Tabs, Transcription Studio | web, iOS, Android | web service (free demo without an account, 20 s, PDF only) | 1 |
| Songsterr AI | web, mobile | web service; full length is Songsterr Plus | 3 |
| Songscription | web | web service | 4 |
| Tabtify | web | AI conversion is paid ("AI conversion is not included" in Free) | optional |
| audio2guitar | web | web service; terms: not to "Use automation, scripts, bots, or other tools to submit songs in bulk" | 5 |
| AAPA AutoTabs (reads hands from video) | web | web service; terms: not to "Use automated tools to scrape or extract data" | 6 |
| Moises | web, desktop, mobile | web service; terms §14.6 bar use "through the use of any engine, software, tool, agent ..." other than its own | 7 |
| Chordify | web, mobile | its site answered this box HTTP 403 | 8 |
| ChordU | web | terms not read | 8b |
| AnthemScore 6 desktop | Windows, macOS, Linux | refused to execute ("[Code from External]"); see its section | 9 |
| Transcribe! | Windows, macOS, Linux | GUI only, no note output; not executed (see its section) | 10 |
| Melodyne 5 | desktop (no Linux build found by the docs lane) | desktop install | 11 |
| RipX DAW | desktop (no Linux build found by the docs lane) | desktop install | 12 |
| Samplab | closed (site redirects to apple.com) | nothing to run | 13 |
| ScoreCloud | "Download for PC & Mac" | desktop install | 14 |
| MIDI Guitar 2 / 3 | Windows, Mac, iOS; live audio in | desktop install, real time | 15 |
| Chord ai | iOS, Android | phone app | 16 |
| Yamaha Chord Tracker | phone app (App Store listing read) | phone app | 17 |
| Fender Studio | phone app (App Store listing read) | phone app | 17b |
| Capo | macOS, iOS | Apple devices only | 18 |
| Guitar Learning | browser app with live camera | `npm ci` refused ("[Code from External]"); see its section | 19 |
| ChordAR | Python, webcam, printed ArUco markers | no shared clip has markers; see its section | none |
| Ultimate Guitar "AI chords" | mobile app, YouTube link in | input is a YouTube link | none |
| Soundslice | web | no automatic transcription found; acceptable use policy bars automated use | none |
| Guitar Pro 8 | Windows, macOS | no automatic audio-to-tab found | none |
| Yousician, Rocksmith+ | apps that grade live playing | no transcription of a given recording (Rocksmith+ not checked in detail) | none |
| Positive Grid Spark "Auto Chords" | phone app (App Store listing read) | "*Requires Spark Amp*" | none |
| TabGenius | phone app (App Store listing read) | text or voice prompt to tab, not audio | none |
| GrabTab | announced phone app | "Coming soon to iOS & Android" | none |
| TapToTab | research paper (arXiv 2409.08618) | no code link found by the docs lane | none |
| Note2Tabs (https://www.note2tabs.com) | web; found by this agent's web search 2026-11-10, home page only | web service | 20 |
| Cesure (https://cesure.app) | web; same; "AI transcription (BasicPitch) runs on our servers" | web service with an account | 21 |
| RiffToTab (https://rifftotab.com) | web; same; MIDI to tab is Pro, audio to MIDI free | web service; tab step paid | 22 |
| Fretwise (https://fretwise.ai) | web; same; page text is mostly loaded by script | web service with sign-in | 23 |

## Permission refusals met in this lane (for the orchestrator)

| Step | Refusal text | Effect |
|---|---|---|
| `AnthemScore-x86_64.AppImage --appimage-extract` | "denied by the Claude Code auto mode classifier. Reason: [Code from External]" | AnthemScore desktop not run; files read with `unsquashfs` instead |
| `node scripts/anthemscore_web_run.cjs ...` (ticks the rights box, presses Transcribe) | "denied by the Claude Code auto mode classifier. Reason: [Consent Given For The User]" | no AnthemScore Web transcription; no other web service tried |
| `npm ci --ignore-scripts` in the Guitar-Learning clone | "denied by the Claude Code auto mode classifier. Reason: [Code from External]" | Guitar Learning's neck-check not run |

If Aaron allows running AnthemScore's own Linux build on the box, two facts above apply: 6.0.0 "Removed CLI options",
so a run needs its window driven (for example under a virtual display), and the trial fetches a license over the
network.

## Media kept outside git

| File | Size | Duration | What it is |
|---|---|---|---|
| `/home/user/gtr/lanes/apps-survey/out/clips-mp3/S1.mp3` | 717,889 B | 29.884 s | MP3 copy of S1 for apps or phones that need MP3 (`scripts/make_mp3_copies.sh`, libmp3lame 192 kbit/s) |
| `.../clips-mp3/S2s.mp3` | 705,977 B | 29.388 s | MP3 copy of S2s |
| `.../clips-mp3/S3.mp3` | 577,454 B | 24.033 s | MP3 copy of S3 |
| `.../clips-mp3/S4.mp3` | 931,675 B | 38.792 s | MP3 copy of S4 (mix) |
| `.../clips-mp3/S5capo2.mp3` | 705,977 B | 29.388 s | MP3 copy of S5capo2 |
| `.../clips-mp3/S5dropd.mp3` | 705,977 B | 29.388 s | MP3 copy of S5dropd |
| `.../clips-mp3/S6taps.mp3` | 705,977 B | 29.388 s | MP3 copy of S6taps |
| `.../clips-mp3/S7flat30.mp3` | 577,454 B | 24.033 s | MP3 copy of S7flat30 |
| `.../clips-mp3/R1a.mp3` | 701,588 B | 29.205 s | MP3 copy of R1a (GuitarSet, CC BY 4.0; credit as in `INPUTS.md`) |
| `.../clips-mp3/R2.mp3` | 865,846 B | 36.049 s | MP3 copy of R2 (Josh Woodward, CC BY 4.0; credit as in `INPUTS.md`) |

Durations are ffprobe's; each MP3 is about 0.03 s longer than its WAV (encoder padding). No tool in this lane
produced audio or video. Also outside git, not media: the AnthemScore AppImage (216,013,304 B) and the Transcribe!
tarball (4,365,589 B) in `/home/user/gtr/lanes/apps-survey/dl/`, the AnthemScore Web screenshots and logs in
`/home/user/gtr/lanes/apps-survey/out/anthemscore-web/explore_S2s_b/`, and the Guitar-Learning clone in
`/home/user/gtr/lanes/apps-survey/clones/`.
