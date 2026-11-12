# For Aaron: what is left for you to run

This file is everything in the guitar tablature research that the research box (a cloud machine with 4 CPU
cores, 15 GiB of memory, no GPU, no sound card, a small shared disk, no accounts and a permission system that
refuses some steps) could not do, written as tests you can run yourself. It merges the ten lanes' `for-aaron.md`
lists, every "NOT RUN HERE" entry in their `trials.md` files that you could run and that had no steps yet, and the
"Access needs" lines of their `survey.md` files. Merged on 2026-11-12, after every lane's gap rounds were finished
and checked.

**What is in it.** 120 tests, T01 to T120, covering 139 tools (distinct tools, models, services and apps named in
the Tool column of the checklist at the end, split at " + "; the three tasks T116 to T118, the measuring page of T120
and repeated names are not counted; a tool that is on two lanes' lists has one test that names both lanes). 63 more
tools were not run and have nothing you can run (no code, no weights, a placeholder, a closed product, a demo page in
error, no audio input): they are listed with the reason in "Not run, and nothing you can run", next to 12 tools whose
reason you could change but for which too little was recorded to write steps, and 14 apps the apps-survey lane did not
test with the shared clips. The research is facts only: no test here is ranked above another, and none of them has to
be done.

**How the sections are ordered.** Section 1: web apps, public demos and notebooks (no install). Section 2: accounts
and API keys that an agent can then use for you. Section 3: runs on your laptop (the GPU ones, and the installs the
box's permission system refused), with commands for Windows PowerShell. Section 4: desktop and phone apps, free or
with a trial. Section 5: your own videos and recordings. Section 6: the browser measuring page. Section 7: the steps
the box's permission system refused, and what you can do about each. Then the access needs the surveys list, the
tools with nothing to run, the ten lane lists, and a checklist table of every test.

**The order of the tests inside a section** is the same everywhere: first the tests whose cost is 0 (free, a free
tier or a free trial) or was not read, by stated time (the lane's estimate or the tool's own docs), shortest first,
with the tests that have no stated time after them; then the paid ones. In Section 2 the paid ones are ordered by the
cost of the first request (as stated, or worked out from the stated price), then the ones priced per token, then
prepaid minimums, then subscriptions. Ties keep the order of the lane table at the end (source-separation,
audio-to-notes, chords-beats-key, guitar-tab, fingerstyle-voices-taps, video-hands-fretboard, web-tab-render,
browser-audio-sync, hosted-apis, apps-survey) and, within a lane, the order of its `for-aaron.md`; a test that is on
two lanes' lists takes the place of the first. This order says nothing about which tests are worth doing.

**How to read a test.** Each heading names the test id, the tool and the lane (and the item number in that lane's
`for-aaron.md`), so a result can be traced back. "(written for this file)" marks steps that no lane wrote: they come
from the lane's `survey.md` or `trials.md` quotes of the tool's own docs, were not tried anywhere, and were not
checked by a lane verifier. UNVERIFIED marks a fact nobody could check; the line says what would settle it. Prices
are the vendors' prices on the date given, which change. Long steps (over about 40 lines in the lane file) are given
in short form here, with a link to the full steps.

## The test clips

The 26 clip files are in your studio library: project `blog-posts`, run `20261110-225132-vm-7d3107`, items #70897
to #70922, filed as reference. They are the 17 test clips, plus the true stems of S4 and S6taps and the audio of the
three videos. Make one folder on your laptop, `C:\gtr\clips`, and put all 26 files in it; the commands in this file
use that folder. Always refer to a clip by its id and file name. What each clip is, its known notes, strings, frets,
beats and chords, and every license quote: [inputs/INPUTS.md](inputs/INPUTS.md); the small truth files (`.json`,
`.mid`, `.csv`, `.lab`, `.tab.txt`, `.gp5`) are in this folder's [inputs/](inputs/) in the repository.

| Id | File in the library | What it is | Truth | Used for |
|---|---|---|---|---|
| S1 | `S1.wav` | synthesized single-note melody ("Ode to Joy"), nylon guitar, D major, 144 BPM, 29.8 s | 62 notes, beats | melody and pitch trackers, note transcribers |
| S2n | `S2n.wav` | synthesized fingerstyle, thumb bass plus melody, nylon, G major, 112 BPM, standard tuning, no capo, 29.4 s | 90 notes with voice, string and fret; beats; chords | audio to tab, voice separation, notes |
| S2s | `S2s.wav` | the same notes on steel-string guitar | as S2n | the tab apps (steel-string), tap tests without taps |
| S3 | `S3.wav` | synthesized strummed chords, steel, G major, 96 BPM, 24.0 s | 182 notes, beats, 10 chord segments | chords, beats, key |
| S4 | `S4.wav` | synthesized band: drums, bass, strummed guitar, a "Voice Oohs" lead standing in for a singer; D major, 116 BPM, 38.7 s | 661 notes, beats, chords, the four true stems | separation, chords, beats, multi-instrument notes |
| S4 stems | `S4_stem_bass.wav`, `S4_stem_drums.wav`, `S4_stem_guitar.wav`, `S4_stem_lead.wav` | each S4 part alone, sample-aligned with `S4.wav` | ground truth for separation | scoring stems; the lead stem as a melody input |
| S5capo2 | `S5capo2.wav` | the S2 tab played with a capo on fret 2 (sounds in A major) | same strings and frets as S2n, capo 2 | capo detection and capo settings |
| S5dropd | `S5dropd.wav` | the S2 piece in Drop D (low string D2) | 90 notes, tuning D2 A2 D3 G3 B3 E4 | tuning detection and tuning settings |
| S6taps | `S6taps.wav` | S2s plus General MIDI percussion standing in for body taps | 90 notes, 32 taps (24 "slap", 8 "thump") | tap detection |
| S6taps stems | `S6taps_stem_guitar.wav`, `S6taps_stem_taps.wav` | the guitar alone, the taps alone | ground truth for tap separation | tap tools on the taps alone |
| S7flat30 | `S7flat30.wav` | S3 rendered 30 cents flat | tuning offset -30 cents | tuning-offset detection |
| R1a | `R1a.wav` | real guitar, GuitarSet player 02, singer-songwriter comping, 107 BPM, 29.2 s (CC BY 4.0) | GuitarSet's per-string notes, beats, chords | real-recording notes, tab, chords |
| R1b | `R1b.wav` | real guitar, GuitarSet player 04, rock solo, 90 BPM, 29.3 s | as R1a | single-note solo |
| R1c | `R1c.wav` | real guitar, GuitarSet player 00, bossa nova comping, 119 BPM, 28.2 s | as R1a | thumb bass under chords |
| R2 | `R2.wav` | real band song with singing (Josh Woodward, CC BY 4.0), 36 s excerpt | none | real full mix |
| R2full | `R2full.wav` | the whole song, 228.5 s | none | whole-song runs and timings |
| R3a | `R3a.mp4`, `R3a.wav` | real classical-guitar concert video, 640x480, camera cuts, 18 s (CC BY-SA 4.0) | none | video tools |
| R3b | `R3b.mp4`, `R3b.wav` | real classical-guitar home video, one fixed close camera, picking fingers partly cut off at the left edge, 1920x1080, 18 s (CC0 1.0) | none | video tools |
| R3c | `R3c.mp4`, `R3c.wav` | real classical-guitar lesson ("Three Little Boats", Culture Vannin), one medium shot with both hands, 1920x1080, 18 s (CC BY 3.0) | none | video tools |

Files some tests use that are not in the library:

- **In the repository** (this folder; open the file on GitHub and use "Download raw file"): the Guitar Pro 5 truth
  files `inputs/S2n/S2n.gp5`, `inputs/S5capo2/S5capo2.gp5`, `inputs/S5dropd/S5dropd.gp5`; the truth tabs
  `inputs/<id>/<id>.tab.txt`; the truth MIDI `inputs/<id>/<id>.mid`; the one-track MIDI files of the guitar-tab lane,
  `lanes/guitar-tab/samples/lane-inputs/<id>.merged.mid`; the Guitar Pro 7 file alphaTab wrote,
  `lanes/web-tab-render/samples/alphatab/S2n.export.gp`; `lanes/web-tab-render/samples/musicxml-from-truth/S2n.truth.musicxml`;
  and the lane scripts and inputs each test names.
- **MP3 copies** (apps that take MP3 only, and phones): `ffmpeg -i C:\gtr\clips\S2s.wav -codec:a libmp3lame -b:a 192k
  C:\gtr\clips\S2s.mp3`, the same for each clip (the apps-survey lane's `scripts/make_mp3_copies.sh`, 192 kbit/s).
  The apps-survey lane measured that an MP3 can start 25 ms later than its WAV in an app whose decoder ignores the
  MP3's LAME header, so a test uses the WAV wherever the app takes it.
- **15-second excerpts** (Klangio's free API tier takes at most 15 s): `ffmpeg -i C:\gtr\clips\S2n.wav -t 15.0 -c:a
  pcm_s16le C:\gtr\clips\S2n_0-15s.wav`, the same for S3 and S4 (the hosted-apis lane's `scripts/gap2/ffmpeg_excerpts.sh`).
- **ffmpeg on Windows**: ffmpeg.org's download page lists "Windows builds from gyan.dev" and "Windows builds by BtbN"
  (read 2026-11-12).
- **R3a_cu**, the video lane's 10 s close shot of the same concert as R3a (CC BY-SA 4.0): download
  `crescendo313_2014_09_04_0.mp4` (listed as "h.264", 175,074,292 bytes) from
  https://archive.org/details/scm-422828-crescendo313-drh-meredithconn and cut it with the lane's command (run r0015):
  `ffmpeg -ss 682 -i crescendo313_2014_09_04_0.mp4 -t 10 -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac
  -b:a 192k -movflags +faststart R3a_cu.mp4` (that is 11:22 to 11:32 of the concert). The video tests' three stills
  are screenshots of R3a_cu at 11:27 (frame 150 of the excerpt) and of R3a at 0:03 (medium shot) and 0:10 (wide
  shot).

**Rights.** The S clips were made for this research (public-domain melodies, arrangements written for it, an
MIT-licensed SoundFont); R1a to R1c are GuitarSet (CC BY 4.0), R2 is CC BY 4.0, R3a CC BY-SA 4.0, R3b CC0 1.0, R3c CC BY
3.0. Several services ask you to state that you hold the rights to an upload and to accept their terms. Whether to
tick those boxes is your decision; the research box was not allowed to do it for you.

## Sending results back

One folder per test, named by its test id (`T07`, `T64` ...), holding exactly the files that test lists, plus a
file `notes.txt` with one line per run in this form (the apps-survey lane's form):

```
tool + version | plan or cost (free / trial / paid, what you paid) | clip id | settings changed from default |
minutes from start to result | key, tempo, tuning, capo as the tool shows them | files saved | anything odd
```

Keep each tool's output files as the tool wrote them (do not convert them). Where a test names no file, name each
export `<tool>_<clip>.<ext>` and each screenshot `<tool>_<clip>.png` (the apps-survey lane's convention), and keep
every format the plan offers. Where a test asks for a screenshot,
Win+Shift+S is enough; where it asks for a time, a phone stopwatch is enough, or PowerShell's `Measure-Command`.

What the scoring agent does with each kind of file (from the apps-survey lane's scoring table and the gtr-eval README;
each score is quoted with its `e....` id). `gtr-eval` reads no PDF and no image: a value read off a PDF or a screenshot
(chords, tempo, key, capo, tuning, cents) goes into `notes.txt` and is typed in by the agent, which says so.

| What comes back | Scored with |
|---|---|
| MIDI, MusicXML, or a CSV or JSON note list | `gtr-eval notes --truth <id> --est <file>`. Exports that start bar 1 at 0 s are early by the S clips' silent count-in bar (4 beats: 2.143 s for the S2 family at 112 BPM, 2.5 s for S3 and S7flat30 at 96 BPM, 1.667 s for S1 at 144 BPM): `--time-shift` with that value, both numbers reported. A run fed an MP3 can be 25 ms late (the apps-survey lane's measurement). |
| Guitar Pro 3, 4 or 5, MusicXML with string and fret, ASCII tab, or CSV/JSON with string and fret | `gtr-eval tab --truth <id> --est <file>`. A `.gp` or `.gpx` file (Guitar Pro 6 to 8) is refused; it is first saved as `.gp5` in Guitar Pro or TuxGuitar, and that step is stated next to the score. |
| stems (audio files) of S4 or S6taps | `gtr-eval stems --truth S4 --est-dir <folder> --map guitar=<file> ...` |
| beat, onset or tap times (one per line, CSV or JSON) | `gtr-eval beats` (with `--downbeats-est` for downbeats) or `gtr-eval onsets --truth S6taps --field taps` (or `--field notes`) |
| chords (`.lab`, `time label` lines, JSON) | `gtr-eval chords --truth <id> --est <file>` |
| a pitch track (time and frequency columns) | `gtr-eval f0 --truth <id> --est <file>` |
| one tempo, key, capo, tuning or cents value | `gtr-eval tempo --est-bpm`, `key --est-key`, `tuning --est-capo`, `--est-tuning-midi` or `--est-cents` |
Zip the test folders and give the zip to the next research session: an agent files audio and video in your studio
library (none of it goes into git) and scores each file against the clip's truth with `gtr-eval`
([scripts/gtr-eval/README.md](scripts/gtr-eval/README.md)), the same way as the runs on the box. For the tests in
Section 2 you send nothing back: you store a key and tell an agent, and the agent runs the request and saves the
answers, scores and costs.

## Three things only you can decide

1. **Code from cloned repositories and downloaded programs.** The box's permission system refused 33 steps
   that would have installed or run code from cloned repositories or downloaded programs ("[Code from External]":
   BTC, MT3, ADTOF, LarsNet, gtrsnipe, the AnthemScore AppImage and others; Section 7 lists every one with its test).
   The tests here let you run them yourself. If you would rather an agent ran them, that needs a permission rule
   from you.
2. **Consent boxes and terms.** AnthemScore Web stops at a box confirming you own the rights to the upload; the box
   was refused permission to tick it ("[Consent Given For The User]"). The same holds for every web app's terms, for
   the gated Hugging Face models (SAM Audio, SAM 3, MuScriptor, AudioEstimate), for the MANO hand model's license
   (HaMeR, WiLoR, Hamba) and for pages behind a bot check (Chordify's terms, xAI's and OpenAI's terms pages: "[Bot
   Check Circumvention]").
3. **Keys and credit.** The Gemini key answered HTTP 402 (no credit), the Vercel AI Gateway key is on the free tier,
   and there was no Hugging Face token, fal key or Klangio key in the key store (the hosted-apis lane's checks of
   2026-11-10 and 2026-11-11, key names only); the hosted separation and transcription services each need an account.
   Section 2 has the first request for each.

## Section 1. Web apps, public demos and notebooks (no install)

Each needs only a browser (Chrome or Edge where a step says so). "Time" is the lane's estimate or the vendor's stated
figure; "cost" is what the vendor's page showed on the date given. Colab notebooks need a Google account.

### T01 · Chordify: save its terms and privacy pages (apps-survey 8a)

Link https://chordify.net/pages/terms-and-conditions/ · account: not seen whether the page needs one · cost: 0 ·
time: about 3 minutes (lane's estimate) · clips: none.

The research box got HTTP 403 (a Cloudflare check) from this page on 2026-11-10 and 2026-11-11, to curl and to
WebFetch, and opening it in a headless browser was refused by the permission system ("[Bot Check Circumvention]"),
so nothing in the research says what Chordify's terms allow.

1. In your normal browser open the terms page and save it as PDF (Ctrl+P, "Save as PDF") as `chordify-terms.pdf`.
   Write the date or version shown on the page in `notes.txt`.
2. Save https://chordify.net/pages/privacy-policy/ the same way as `chordify-privacy.pdf` (the App Store listing
   links both pages).

Send back: the two PDFs. An agent then quotes what they say about who owns the chords, MIDI and PDF files Chordify
makes, about commercial use and about automated access.

### T02 · Basic Pitch web demo (browser-audio-sync 2; also on audio-to-notes' list)

Link https://basicpitch.io (redirected to https://basicpitch.spotify.com/ from the box, HTTP 200 on 2026-11-10; the
npm README of `@spotify/basic-pitch` 1.0.1 calls it "our snappy demo website"; its interface was not seen from the
box) · account: none seen · cost: 0 · time: about 5 minutes (lane's estimate) · clips: S1 (`S1.wav`), S2n (`S2n.wav`).

The box ran the same library headless (audio-to-notes and browser lanes); this is the vendor's own page.

1. Open the page in Chrome and drop in `S1.wav`, then `S2n.wav`, one at a time, with the default settings.
2. Note roughly how long each took from drop to result, and download the MIDI file for each if the page offers one.

Send back: `S1_basicpitchio.mid`, `S2n_basicpitchio.mid`, the times, a screenshot of the settings panel (or of the
page, if it shows no settings). They are scored with `gtr-eval notes` like the box's runs.

### T03 · demucs-rs: source separation in the browser on WebGPU (source-separation 6, browser-audio-sync 3)

Link https://nikhilunni.github.io/demucs-rs/ (HTTP 200 from the box on 2026-11-10; not opened in a browser by any
agent) · account: none seen · cost: 0 · time: about 10 minutes (browser lane's estimate) · needs: a GPU and a browser
with WebGPU (the README's prerequisites: "A GPU with Metal (macOS), Vulkan (Linux/Windows), or WebGPU (browser)
support"; it runs "entirely **in the browser** via WebAssembly + WebGPU") · clips: S4 (`S4.wav`), R2full (`R2full.wav`).

The box has no GPU, and headless Chromium found no WebGPU adapter there. A 6-stem htdemucs model did run on the box's
WebAssembly path in gap round 2 (StemSplit's ONNX export in ONNX Runtime Web: 29.09 s for a 10 s cut of S4 with 2
threads and graph optimizations off); its WebGPU path was not tried.

1. Open the page in Chrome. Load `S4.wav`, choose the standard 4-stem model if asked, run it, and time it from start
   to finished stems.
2. If the page offers the 6-stem model (the README lists "6-Stem (adds guitar & piano)"; `htdemucs_6s`), run `S4.wav`
   again with it. Then run `R2full.wav` (the whole song).
3. Download the stems.

Send back: the stem WAV files, the time of each run, the model names as the page shows them, a screenshot, and a
screenshot of `chrome://gpu` (top section). The S4 stems are scored against the true stems with `gtr-eval stems`.

### T04 · muzart: can a note be changed and saved in this browser tab editor? (web-tab-render 2)

Link https://thegedge.github.io/muzart/ (the README's demo address; HTTP 200 from the box) · account: none seen ·
cost: 0 (MIT-licensed open source) · time: about 10 minutes (lane's estimate) · file: `inputs/S2n/S2n.gp5`.

The box cloned muzart but its permission system refused the repository's `pnpm install` ("Code from External"), so
it was never built or opened.

1. Open the page in Chrome or Edge. If it has an open or import button, open `S2n.gp5`; if not, use the demo song.
2. Click the first note of the first bar and try to change its fret number (type a number; try the arrow keys).
3. Look for a save, export or download option and use it if there is one.

Send back: a screenshot before and after the change, the name of every button or key that worked, and any file it
saved.

### T05 · MediaPipe Studio hand landmarker on your GPU (browser-audio-sync 4; video-hands-fretboard ran MediaPipe on the CPU)

Link https://mediapipe-studio.webapps.google.com/demo/hand_landmarker (from the box it redirected to Google's sign-in
page on 2026-11-10, so it may ask for a Google account; its controls were not seen) · cost: 0 · time: about 10
minutes (lane's estimate) · clips: R3b (`R3b.mp4`), R3a (`R3a.mp4`).

On the box MediaPipe's GPU delegate ran only on the SwiftShader software renderer: 3,481 ms per frame on average
over 60 frames of R3a (run r0314). On the box's CPU (video lane) MediaPipe found the fretting hand in 445 of 450 R3b
frames and the picking hand in none (its fingers are cut off at the left edge).

1. Open the demo in Chrome. If it offers a choice of delegate, pick GPU.
2. If it takes a video or image file, use `R3b.mp4`, then `R3a.mp4`.
3. Note the frames per second or milliseconds per frame it shows, and whether both hands are found.

Send back: screenshots with the landmarks drawn and the speed figures, and the delegate shown. If the demo only takes
the webcam, say so; a screenshot of it tracking your hands on a guitar in front of the webcam also works.

### T06 · Klangio Guitar2Tabs web app, and Klangio Transcription Studio (apps-survey 1; hosted-apis 4's no-key route; Transcription Studio: apps-survey `tools.json`, written for this file)

Link https://klang.io/guitar2tabs/ · account: none for the free tier · cost: 0 (free tier); Guitar2Tabs Pro "$6.25
/month Billed annually" (pricing table, read 2026-11-10; on 2026-11-12 the box's web fetch could not read the table,
which the page draws with a script, and https://klang.io/pricing/ answered 404) · time: about 10 minutes (lane's
estimate) · clips: S2s (`S2s.wav`), S5capo2 (`S5capo2.wav`), S5dropd (`S5dropd.wav`), R1a (`R1a.wav`), R2 (`R2.wav`),
and the 15 s excerpt `S2n_0-15s.wav`.

Klangio's terms §5.2.1 describe the free tier: no account, 30 demo transcriptions a day, each limited to 20 seconds,
PDF export only (with a watermark), no Edit Mode. The pricing table says "Transcribe up to 30 seconds"; write down
which length you get.

1. Upload `S2s.wav`. In the Transcription Wizard choose guitar; at "Choose the tuning and capo" leave standard tuning
   and no capo, or let Klangio apply the settings itself (the wizard offers both). Start it.
2. When the tab appears: screenshot, then download the PDF.
3. `S5capo2.wav` twice: first with the default settings (note the capo and key it shows), then with the capo set to 2.
4. `S5dropd.wav` twice: first default, then with the tuning set to Drop D.
5. Once each with `R1a.wav` and `R2.wav` (defaults).
6. Upload `S2n_0-15s.wav` and download whatever the plan offers (Guitar Pro, MIDI, MusicXML or PDF), with a
   screenshot of the tab (the hosted-apis lane's comparison point for the Klangio API, T44).
7. Optional and paid (Guitar2Tabs Pro): the full length of each clip, plus MIDI, MusicXML and Guitar Pro export and
   "Retranscribe" with new settings; re-run steps 1 to 5 at full length and download MIDI and Guitar Pro.

Send back: 8 PDFs (or the formats offered) and 8 screenshots, `notes.txt` (time per run, what it showed for capo and
tuning on the S5 runs).

Part B, Klangio Transcription Studio (optional; written for this file: no lane wrote steps; the apps-survey
`tools.json` marks it for you, its reason for not running it being the consent the box could not give). Link
https://klang.io/transcription-studio/ · the page (read 2026-11-12): "preview your transcription for free. No account
required."; its FAQ lists "piano, organ, synthesizer, acoustic and distorted guitar, bass, ukulele, drums, vocals,
strings, woodwinds and brass" and the outputs "PDF sheet music, quantized or unquantized MIDI, MusicXML, LilyPond and
Guitar Pro files" · the free preview's length is not stated on that page; Klangio's file-limitations article says "a
demo transcription will only transcribe the first 20 seconds" (apps-survey `survey.md`, read 2026-11-10) · paid:
Klangio Ultimate "$12.50 /month Billed annually", "250 transcriptions/month", with Transcription Studio Pro (pricing
table, read 2026-11-10) · clip: S4 (`S4.wav`, a band mix with known stems and notes).

1. Upload `S4.wav`; in the wizard pick the instruments it offers for guitar, bass, drums and voice, and keep the
   other settings at their defaults.
2. Screenshot the result and download what the free preview offers (MIDI, MusicXML or Guitar Pro if offered).

Send back: the downloads named `klangiostudio_S4.<ext>`, the screenshot, a `notes.txt` line (length it transcribed,
plan).

### T07 · AnthemScore Web (apps-survey 2)

Link https://www.lunaverus.com/transcribe/audio-to-guitar-tab · account: none was needed to upload (whether the
transcription itself asks for one was not seen) · cost: 0 on the free plan ("30 second transcriptions"); Plus "$8.33
/ month", "$99.90 billed annually", or a free account's "14 day trial of full length songs" (read 2026-11-10) · time:
about 10 minutes (lane's estimate) · clips: S2s, R1a, R2, S5dropd (WAV).

The box got as far as the settings page (screenshot `lanes/apps-survey/samples/anthemscore-web/job_settings_S2s.webp`)
and was refused permission to tick the rights box. PDF, MIDI and MusicXML downloads are listed for the paid Plus and
Pro plans.

1. Choose `S2s.wav`. The upload starts by itself and the settings page opens ("Transcribing up to 30 seconds").
2. Leave "tablature" selected and "Instruments: Guitar". Open "Advanced Options" only to screenshot it (on the box:
   "Time", "Key", "Shortest allowed note", and "Trim empty measures at the start and end" ticked); leave the defaults.
3. Tick "I confirm that I own or have obtained all necessary rights to transcribe this audio." if you agree, then
   press "Transcribe". Time it.
4. On the result: screenshot the whole page, including any tempo, key and chord line at the top. Open the Download
   menu and screenshot it; download whatever is not locked.
5. Repeat with `R1a.wav`, `R2.wav` (36 s: check that the Start and End boxes under "Trim" read 0:00.0 and 0:30.0 or
   less, and write down what they read) and `S5dropd.wav`. The form has no tuning or capo field, so no second run.

Send back: screenshots, any downloads, `notes.txt`.

### T08 · Songsterr AI (apps-survey 3)

Link https://www.songsterr.com/new · account: it emails you when the tab is ready, so expect to give an email
address · cost: 0 for "a free 20-second preview"; "Full-length transcription is included in Songsterr Plus" (App
Store in-app price "$9.99"; the site shows no amount without signing in; read 2026-11-10) · time: about 10 minutes
(lane's estimate) plus the wait; Songsterr's help: "A tab is usually ready in 5–15 minutes, and we email you when
it's done" · clips: S2s, S5capo2, S5dropd.

1. Upload `S2s.wav`. Leave "First bar time signature", "Pickup bar duration", "First bar tempo (BPM)" and "Triplet
   feel" on "Auto". For the instruments pick only a guitar row (a "Fingerstyle" row is offered) with "Standard
   6-string (E A D G B E)" and capo 0. Start it and note the time.
2. When the email arrives, open the tab and screenshot it. If "Download tab" (MIDI or Guitar Pro) works on the free
   preview, download both.
3. Run `S5capo2.wav` with "Capo fret" 2, and `S5dropd.wav` with a Drop D tuning, the same way. (Its help says to set
   tuning and capo "in Show settings before you start"; detecting them from the audio is not described.)

Send back: screenshots, downloads, `notes.txt` with the minutes until each email came.

### T09 · Songscription (apps-survey 4)

Link https://www.songscription.ai · account: sign up if it asks · cost: 0 for "The first 30 seconds of each song"
(read 2026-11-10) · time: about 10 minutes (lane's estimate) · clips: S2s, S5dropd, R1a.

Its home page: "At the moment, we only support standard tuning". Its pricing FAQ: "By default, we may use the audio
and transcriptions you submit to help improve our AI models" (Plus and Pro can opt out).

1. Upload `S2s.wav`, ask for guitar tab. Screenshot the result; export Guitar Pro and PDF if the free plan allows.
2. Repeat with `S5dropd.wav` (a tuning it says it does not support) and `R1a.wav`.

Send back: exports, screenshots, `notes.txt`.

### T10 · audio2guitar (apps-survey 5)

Link https://audio2guitar.com · account: sign up if it asks · cost: 0 for "3 songs", MP3 only (read 2026-11-10) ·
time: about 10 minutes (lane's estimate) · clips: R1a, S2s, S5dropd as MP3 (`R1a.mp3`, `S2s.mp3`, `S5dropd.mp3`).

The vendor states "Our pipeline achieves 97.8% string assignment accuracy on the GuitarSet benchmark" (the vendor's
claim). R1a is a GuitarSet recording, so its string and fret output on R1a can be scored against GuitarSet's own
annotation.

1. Upload `R1a.mp3`. Screenshot the tab and the header line (the demo shows "Tuning", "Key" and "Tempo"); export MIDI
   and the PDF if the free plan allows.
2. Use the other two free songs on `S2s.mp3` and `S5dropd.mp3` (note the tuning it reports for S5dropd).

Send back: exports, screenshots, `notes.txt`.

### T11 · AAPA AutoTabs: tab from a video (apps-survey 6)

Link https://aapamusic.com · account: sign up if it asks · cost: 0 (free tier; the vendor calls AutoTabs "early
access") · time: about 10 minutes (lane's estimate) · clips: R3a (`R3a.mp4`), R3b (`R3b.mp4`), R3c (`R3c.mp4`).

Of the apps the research found, the only one open on 2026-11-10 that says it uses the hands in a video to write tab
(the vendor: "AutoTabs listens to the audio and uses machine vision to analyze the guitarist's hands and
fretboard"). Its terms §4.2 make sharing your video for training opt-in; leave it off unless you want it.

1. Open AutoTabs and upload `R3a.mp4`, then `R3b.mp4` and `R3c.mp4` (R3b and R3c show the fretting hand and the whole
   fretboard in one continuous shot; R3a has camera cuts).
2. Screenshot the draft tab and any video overlay; export PDF and MIDI.
3. If it has a capo or tuning setting, note it but leave it on default.

Send back: exports, screenshots, `notes.txt` (time, and whether the result mentions what it saw in the video).

### T12 · Moises web app: stems, chords, tempo, key (apps-survey 7)

Link https://moises.ai · account: sign in if it asks · cost: 0 on the free tier ("a limited number of uploads each
month", read 2026-11-10) · time: about 10 minutes (lane's estimate) · clips: S4, R2, S7flat30.

Moises shows stems, chords, BPM and key; it does not describe note-level tab with string and fret. (Its developer
platform, Music.AI, is T52.)

1. Upload `S4.wav`. Ask for the stem split that includes a guitar stem; open the chord view.
2. Screenshot the chord view and the BPM and key it shows; download the guitar stem and anything else the free tier
   allows (chords as a file if offered).
3. Repeat with `R2.wav` and `S7flat30.wav` (note the key and whether anything mentions the tuning being off).

Send back: screenshots, stems (audio goes to the studio library, not git), `notes.txt`.

### T13 · Chordify (apps-survey 8)

Link https://chordify.net · account: sign in if it asks · cost: whether uploading your own file needs Premium is
UNVERIFIED (Chordify's pages could not be read from the box); if the upload asks you to pay, write down the price
and skip · time: about 10 minutes (lane's estimate) · clips: S3, S7flat30, R2.

Its App Store listing mentions MIDI and PDF downloads of the chords and a capo display option.

1. Upload `S3.wav`. Screenshot the chord timeline; download MIDI or PDF if offered.
2. Repeat with `S7flat30.wav` and `R2.wav`.

Send back: screenshots, downloads, `notes.txt` (and the terms PDF from T01 if you did not do T01 separately).

### T14 · ChordU (apps-survey 8b)

Link https://chordu.com/ (its home page lists "Upload" and "My Uploads") · account: write down whether it needed one
· cost: prices not read (the research box fetched no more of its pages once it read the terms) · time: about 10
minutes (lane's estimate) · clips: S3, R2.

Its terms (read 2026-11-11): "Usage of songs and chords are limited to your personal, non-commercial use" and "You
shall not collect content or information or access ChordU service using automated means (such as bots, robots,
spiders or scrapers) without our permission."

1. If it lets you upload without paying: upload `S3.wav` and `R2.wav`, screenshot the chords and the BPM it shows.
2. Screenshot its "Go Premium" page with the prices it shows.

Send back: screenshots, `notes.txt`.

### T15 · Note2Tabs (apps-survey 20)

Link https://www.note2tabs.com · account: "Start free" · cost: "Free" "$0/ month" with "10 monthly credits"; paid
"$5.99/ month" and "$14.99/ month"; free "Audio clips up to 60 seconds"; "A 60-second recording uses 4 credits with
Light or 10 with Heavy." (re-read 2026-11-10) · time: about 10 minutes (lane's estimate) · clips: S2s, R1a, S5dropd.

Its terms (quoted in the apps-survey `survey.md`) say "Do not automate bulk requests".

1. Upload `S2s.wav`; screenshot the tab; export whatever the free plan allows.
2. Repeat with `R1a.wav` and `S5dropd.wav` (note the tuning it shows).

Send back: exports, screenshots, `notes.txt`.

### T16 · Cesure (apps-survey 21)

Link https://cesure.app · account: "is required for AI transcription and for hosting a room" (its FAQ) · cost: free
tier, "3 AI transcriptions a month — empty results don't count"; Pro "€4.99 per month" or "€39.99 per year — save 33%"
(home page, re-read 2026-11-12; on 2026-11-10 the page read "3 free conversions a month, unlimited with Pro") · time:
about 10 minutes (lane's estimate) · clips: `S2s.mp3`, `R1a.mp3`, `S3.mp3`, `S7flat30.mp3`.

Its home page: "AI transcription (BasicPitch) runs on our servers ... Chord detection is a different thing — it is
computed entirely on your device, free and offline" (read 2026-11-10); "Export to .cesure, MIDI, MusicXML, AlphaTex and
PDF for free (the free PDF carries a small watermark)" (read 2026-11-12).

1. Sign up, "Drop in an MP3": `S2s.mp3`, then `R1a.mp3` (2 of the 3 free conversions). Export MIDI and MusicXML;
   screenshot the tab.
2. Open the chord grid (the free on-device part) on `S3.mp3` and `S7flat30.mp3`; screenshot.

Send back: exports, screenshots, `notes.txt`.

### T17 · RiffToTab (apps-survey 22)

Link https://rifftotab.com · account: not stated · cost: audio to MIDI free; "Generating the tab is Pro": "$3.99"
for the first month, "Then $7.99 a month", or "$39" a year, or "$59" once ("Lifetime") (re-read 2026-11-10) · time:
about 10 minutes (lane's estimate) · clips: `S2s.wav`, and the truth MIDI `inputs/S2s/S2s.mid` from the repository.

Its home page: "Strings and frets are chosen for the whole phrase. If another tuning or a capo measures easier, it is
used and named."; "Change tuning, capo or key, then convert again"; "One button re-arranges the same notes for Drop D,
a capo on the 2nd fret, a key a step down".

1. Free part: "Turn audio into MIDI, free" with `S2s.wav`; export the MIDI.
2. Pro part (only if you choose to pay): drop the truth MIDI `S2s.mid` (so only the fingering is tested); export
   Guitar Pro. Then use "Change tuning, capo or key" for capo 2 and for Drop D and export each; write down what tuning
   and capo its strip says it used.

Send back: exports, screenshots, `notes.txt`.

### T18 · Fretwise (apps-survey 23)

Link https://fretwise.ai ("Audio in. Tabs out.") · account: "Guest access without an account" · cost: free "3
transcriptions per month", "No export paywalls" (re-read 2026-11-10) · time: about 10 minutes (lane's estimate) ·
clips: S2s, R1a, S5dropd.

1. Upload `S2s.wav`, then `R1a.wav` and `S5dropd.wav` (the 3 free transcriptions).
2. Export MIDI, MusicXML and Guitar Pro for each; screenshot the tab; note what tuning it shows for S5dropd.

Send back: exports, screenshots, `notes.txt`.

### T19 · GuitarConvert (La Touche Musicale) (apps-survey 24)

Link https://latouchemusicale.com/en/apps/guitarconvert/ · account: sign up if it asks · cost: free plan
"Conversion limited to 30 seconds", "PDF, MIDI & musicXML export" (re-read 2026-11-10) · time: about 10 minutes
(lane's estimate); the vendor: "receive its guitar tablature in 2 minutes" · clips: S2s, R1a.

Its terms (quoted in the apps-survey `survey.md`): "The Service may not be used for commercial purposes."

1. Upload `S2s.wav` in "Transcription mode"; export MIDI and MusicXML; screenshot the tab.
2. Repeat with `R1a.wav`. Optional: `S2s.wav` again in "Arrangement mode".

Send back: exports, screenshots, `notes.txt`.

### T20 · Guitar Learning: webcam chord-shape checker (apps-survey 19)

Link https://guitar-learning-ten.vercel.app (MIT-licensed open source) · account: none seen · cost: 0 · time: about
10 minutes (lane's estimate) · needs: your guitar and a webcam · clips: none.

A practice app, not a transcriber: it tracks your fretting hand on a live webcam and checks chord shapes. The box's
permission system refused its `npm ci`, so it was not run. Its README quotes the authors' own measurement of the
automatic neck detector: "measured against seven webcam frames of a real guitar in a real room, it returns nothing on
all seven".

1. Open the site in Chrome, allow the camera, and do its calibration: four clicks on the two ends of the nut and the
   two ends of the 12th fret.
2. Play an E minor and a C chord as its lessons ask. Screenshot the overlay when it says a finger is wrong and when
   it accepts the chord.

Send back: screenshots, `notes.txt` (did the strings and frets it drew line up with your real neck; did it lose the
neck when you moved).

### T21 · SAM Audio (Meta): text-prompted separation (source-separation 1; hosted-apis 3)

Links: Meta's demo https://aidemos.meta.com/segment-anything/editor/segment-audio (not opened by any agent; the link
is from the survey) · account: if the demo needs a Meta login or does not take uploads, use the other routes ·
cost: 0 · time: not stated · clips: S4, R2, R3a (`R3a.wav`).

Not run on the box: the weights are gated (`gated: manual` for all three repositories: a Hugging Face account and a
request that Meta approves) and the smallest model repository is 5.1 GB. The Hugging Face Space
`lpeterl/sam-audio-webui` refused the box's anonymous call with the ZeroGPU quota error.

1. Open the demo in Chrome. Upload `S4.wav`, type the prompt `acoustic guitar`, run, download the result. Repeat with
   `R2.wav` (prompt `guitar`; which guitars R2 contains is not known) and `R3a.wav` (prompt `guitar`).
2. Space route, run by an agent: once you have stored a Hugging Face token (T43), an agent runs
   `lpeterl/sam-audio-webui` on `S4.wav` with the prompt "acoustic guitar".
3. Local route (only if the demo is not usable; GPU): create a Hugging Face account, open
   https://huggingface.co/facebook/sam-audio-small and press the button to request access; wait for the approval
   email. Then follow the "Setup" and "Usage" sections of https://github.com/facebookresearch/sam-audio (it asks for
   Python 3.11 or newer, `pip install .` in the cloned repository, and `hf auth login` with an access token before the
   checkpoints download), in a Python 3.11 environment with CUDA PyTorch (Section 3's setup). Whether
   `sam-audio-small` fits in your GPU's memory is UNVERIFIED: note it if it runs out of memory.

Send back: the output files and the exact prompts (and, for step 3, the console text and the time per file).

### T22 · AudioSep: text-queried separation (source-separation 2)

Link https://huggingface.co/spaces/Audio-AGI/AudioSep (on 2026-11-10 the Hugging Face API reported its runtime stage
as `RUNTIME_ERROR`, so the page may show an error; still `RUNTIME_ERROR` on 2026-11-12) · account: not stated · cost:
0 · time: not stated · clips: S4, R3a, S6taps, R2.

Not run on the box: its two checkpoints are 1.26 GB and 2.35 GB, which would have left less free disk than the round
had to keep, and the route runs a cloned repository's code.

1. Upload `S4.wav`, enter the text `acoustic guitar`, run, download the output. Then `R3a.wav` with `classical
   guitar`, and `S6taps.wav` with `guitar` and again with `knocking`. Then `S4.wav` and `R2.wav` with each of `bass`,
   `drums` and `singing`.
2. The code writes one mono file at 32 kHz (per the survey); say if the output is something else.
3. Local route if the Space shows an error (GPU; the README's "Setup" and "Inference" sections,
   https://github.com/Audio-AGI/AudioSep): in a Miniconda prompt, `git clone https://github.com/Audio-AGI/AudioSep.git`,
   `cd AudioSep`, `conda env create -f environment.yml`, `conda activate AudioSep`. Download
   `audiosep_base_4M_steps.ckpt` and `music_speech_audioset_epoch_15_esc_89.98.pt` from
   https://huggingface.co/spaces/Audio-AGI/AudioSep/tree/main/checkpoint into the repository's `checkpoint/` folder.
   Then run the README's Python example (`build_audiosep(config_yaml='config/audiosep_base.yaml',
   checkpoint_path='checkpoint/audiosep_base_4M_steps.ckpt', device=device)`, then the separation call) once per file
   and prompt from step 1. The README calls `inference(model, audio_file, text, output_file, device)`, but
   `pipeline.py` (head 944583f) names that function `separate_audio(model, audio_file, text, output_file, device)`,
   so use `from pipeline import build_audiosep, separate_audio`.

Send back: the files, the prompts, and (local route) the time per file.

### T23 · YourMT3+: multi-instrument transcription in its web demo (audio-to-notes 1; hosted-apis ran its CPU Space)

Link https://huggingface.co/spaces/mimbres/YourMT3 (runs on ZeroGPU hardware, `zero-a10g`; the box saw no price) ·
account: sign in to Hugging Face; the box's anonymous call was refused: "You have exceeded your ZeroGPU quota (90s
requested vs. 79s left). ... Authenticate with a Hugging Face token for more quota" · cost: 0 · time: not stated ·
clips: S4, S2n, R1c, R2.

The hosted-apis lane transcribed S2n and R1c through the CPU copy of the Space, `mimbres/YourMT3-cpu` (runs r0164 and
r0245), so this test is the GPU model on more clips.

1. Sign in at https://huggingface.co and open the Space. Its page prints the model name (on 2026-11-10 its `app.py`
   set `model_name = 'YPTF.MoE+Multi (noPS)'`).
2. In the `Upload audio` tab load `S4.wav` and press `Transcribe`. Wait for the MIDI player, click the `Download MIDI`
   link above it, and save the file as `S4.yourmt3.mid`.
3. Repeat with `S2n.wav`, `R1c.wav` and `R2.wav`.
4. If the quota runs out: the Space's page links a Colab notebook ("For acadmic reproduction purpose, we strongly
   recommend to use [Colab Demo](https://colab.research.google.com/drive/1AgOVEBfZknDkjmSRA7leoa81a2vrnhBG?usp=sharing)
   with multiple checkpoints.", as written in its `app.py`); no agent opened it.
5. Optional, a CPU timing on your laptop (a job for a coding agent on the laptop): clone the CPU Space
   (`git clone https://huggingface.co/spaces/mimbres/YourMT3-cpu`, with Git LFS for the checkpoints; its default
   checkpoint is 561,544,628 bytes), install its `requirements.txt` plus `gradio==4.39.0`, start `python app.py`,
   transcribe `S2n.wav` and `R1c.wav` in the page it opens, and note the seconds per clip and the CPU name. That this
   works on Windows is UNVERIFIED; the ZeroGPU Space's own `app.py` calls `model.to("cuda")`, so use the CPU Space.

Send back: the four `.mid` files, a screenshot of the page with the model name, the time each took (and, for step 5,
the two `.mid` files, the times and the CPU name).

### T24 · MT3 (Google Magenta) in its official Colab notebook (audio-to-notes 2)

Link https://colab.research.google.com/github/magenta/mt3/blob/main/mt3/colab/music_transcription_with_transformers.ipynb
(linked from MT3's README; the notebook says it "sends basic usage data to Google Analytics") · account: Google ·
cost: whether a GPU runtime is offered on your Colab tier is UNVERIFIED · time: the notebook says "it may take a few
minutes depending on the length of the audio" · clips: S4, S2n, R1c.

Not run on the box: the notebook's install of the cloned `magenta/mt3` repository was refused by the permission
system ("[Code from External]"), and so was running the PyTorch port `kunato/mt3-pytorch` (T69).

1. Open the notebook and follow its own instruction: "Make sure to use a GPU runtime, click: Runtime >> Change Runtime
   Type >> GPU".
2. Run the cells from the top: `Setup Environment`, `Imports and Definitions`, then `Load Model` with `MODEL` set to
   `mt3` ("choose either `ismir2021` for piano transcription or `mt3` for multi-instrument transcription").
3. Run `Upload Audio` and choose `S4.wav`; run `Transcribe Audio`; run `Download MIDI Transcription`, which downloads
   `transcribed.mid`. Rename it `S4.mt3.mid`.
4. Repeat step 3 for `S2n.wav` and `R1c.wav`. If time allows, run `Load Model` again with `ismir2021` and transcribe
   `S2n.wav` once more (`S2n.mt3-ismir2021.mid`).

Send back: the `.mid` files, a screenshot of the `Load Model` cell, and how long `Transcribe Audio` took per clip.

### T25 · MuScriptor (Kyutai and Mirelo): its hosted page (audio-to-notes 11; hosted-apis 3)

Link https://muscriptor.kyutai.org (named in MuScriptor's README; not opened by any agent; the page needs JavaScript)
· account: not seen · cost: not seen · time: not stated · clips: S4, S2n, R1c.

Not run on the box: the weights are gated on Hugging Face (`MuScriptor/muscriptor-small`: `gated: auto`, sign-in and
acceptance; card license `cc-by-nc-4.0`), and the Space `hugging-apps/muscriptor-music-transcription` refused the box's
anonymous call with the ZeroGPU quota error. NeuralNote v2 (T110) runs MuScriptor models inside a desktop app.

1. If the page is open: upload `S4.wav`, `S2n.wav` and `R1c.wav`.
2. Download the MIDI (and MusicXML or tab PDF, if offered) and screenshot the settings.
3. Space route, run by an agent: with a Hugging Face token stored (T43), an agent runs
   `hugging-apps/muscriptor-music-transcription` on `S2n.wav` with the instrument `acoustic_guitar`.

Send back: the MIDI (and other exports), the settings screenshot.

### T26 · Beat Transformer in its Colab notebook (chords-beats-key 8)

Link https://colab.research.google.com/drive/1IdrpMO1AivWmy-Bm8ktmMy14ED9jllux (the README: "To quickly test our
model with your own music, welcome to our Google Colab") · account: Google · cost: not stated by the lane (Colab's
own tiers apply; as in T24, whether a GPU runtime is offered on yours is UNVERIFIED) · time: not stated · clips: S4,
R1a, R2.

Not run on the box: it is repository code that first separates stems with Spleeter, and running repository code was
refused there.

1. Open the notebook, upload `S4.wav`, `R1a.wav` and `R2.wav`, and run all cells.

Send back: the beat and downbeat times it prints or saves, and a screenshot of the last cell.

### T27 · Guitab: audio to Guitar Pro 5 with strings and frets (guitar-tab 1)

Link (browser version) https://danielemorotti.github.io/guitab/ · account: none seen · cost: 0 (code MIT; weights CC
BY-NC-SA 4.0, non-commercial, per its README and model card) · time: the README says a 4-minute song "takes well
under a minute and 1–2 GB of GPU memory" (Python version) · clips: S2s, S5capo2, R1a, R1b, R1c, S3 (browser);
S2n, S5dropd as well (installed version).

Not run on the box: installing it from its repository was refused by the permission system. The page's HTML was
fetched but not run. The README says the browser version gives "the same .gp5 as the Python pipeline, **byte for
byte**" at 22.05 kHz, and "Audio at other sample rates is resampled by the browser instead of librosa, so its results
are close but not identical"; the shared clips are 44.1 kHz. The page's controls (from its HTML): an Upload button, a
Capo stepper (0 to 12, "Capo 0 = no capo") and a Transcribe button.

Option A, the browser version:

1. Upload `S2s.wav`, leave every setting at its default (Capo 0), press Transcribe. Save the `.gp5`; time it.
2. `S5capo2.wav` twice: once with Capo 0 and once with the Capo stepper at 2.
3. `R1a.wav`, `R1b.wav`, `R1c.wav` and `S3.wav`, defaults.

Option B, installed (PowerShell; Section 3's setup; the README: "Every command takes `--device auto|cuda|mps|cpu`.
The default, `auto`, uses an NVIDIA GPU if present, else the Apple GPU, else the CPU."):

1. `cd C:\gtr`, `git clone https://github.com/DanieleMorotti/guitab`, `cd guitab`
2. `uv venv .venv --python 3.11`
3. `uv pip install --python .venv\Scripts\python.exe -r requirements.txt`, then
   `uv pip install --python .venv\Scripts\python.exe -e . --no-deps`
4. `.venv\Scripts\python.exe -c "import torch; print(torch.cuda.is_available())"` must print `True` to use the GPU; if
   it prints `False`, install the CUDA build of torch as pytorch.org describes and repeat.
5. `.venv\Scripts\guitab --audio C:\gtr\clips\S2s.wav --out_dir out\S2s` (the first run downloads the weights).
6. Capo: `.venv\Scripts\guitab --audio C:\gtr\clips\S5capo2.wav --out_dir out\S5capo2_nocapo` and
   `.venv\Scripts\guitab --audio C:\gtr\clips\S5capo2.wav --out_dir out\S5capo2_capo2 --capo 2`.
7. The other clips with defaults: S2n, S3, S5dropd, R1a, R1b, R1c. Guitab has no tuning option (none in the README's
   option list; `guitab/guitar.py` begins "Guitar constants shared by the whole pipeline (standard tuning)."), so
   S5dropd shows what happens to the low D notes.

Send back: every `.gp5` and `.tokens.txt` file (keep the folder names), the time per clip, and a screenshot of the
settings if you used the browser version.

### T28 · ADTOF (original Keras version) in its Colab notebook (fingerstyle-voices-taps 2)

Link: the Colab notebook linked in the README of https://github.com/MZehren/ADTOF ("The easiest way to test the
trained model is our Colab Notebook") · account: Google · cost: 0 · license CC BY-NC-SA 4.0 per the README · time: not
stated · clips: S6taps, the taps stem (`S6taps_stem_taps.wav`), S2s, R3a (`R3a.wav`).

Not run on the box: the install from its repository was refused by the permission system ("[Code from External]").
The PyTorch port of the same model family is T84.

1. Open the notebook. Upload `S6taps.wav`, `S6taps_stem_taps.wav`, `S2s.wav` and `R3a.wav` with the folder icon on
   the left.
2. Follow the notebook's cells, pointing its audio path at each file in turn.
3. Local alternative (what was refused on the box; not tried anywhere): Python 3.10, `git clone
   https://github.com/MZehren/ADTOF`, `cd ADTOF`, `py -3.10 -m venv venv`, `.\venv\Scripts\Activate.ps1`,
   `pip install "tensorflow==2.15.1"`, then `pip install .` (the README's line; `setup.py` asks for
   `tensorflow>=2.13.0` and installs madmom and tapcorrect from GitHub). Then in `python`, the two cells of
   `bin/drumTranscriptor.ipynb`: `from adtof.model.model import Model`,
   `model, hparams = Model.modelFactory(modelName="Frame_RNN", scenario="adtofAll", fold=0)`,
   `model.predictFolder(r"C:\gtr\adtof_in\*.wav", r"C:\gtr\adtof_out", **hparams)`, where the folder
   `C:\gtr\adtof_in` holds copies of `S6taps.wav`, `S6taps_stem_taps.wav` and `S2s.wav` (the lane's call passes a
   `*.wav` pattern in the same way). Send back the `.mid` files in `C:\gtr\adtof_out`.

Send back: the MIDI or text file each run writes (download from the folder pane), and a screenshot of the last cell's
output.

### T29 · drumsep: 4-stem drum separation, in its Colab notebook (fingerstyle-voices-taps 10)

Link: the "drumsep Notebook" (Google Colab) linked from https://github.com/inagoy/drumsep · account: Google · cost: not
stated by the lane (Colab's own tiers apply) · time: not stated · clips: the taps stem (`S6taps_stem_taps.wav`);
optionally the source-separation lane's
htdemucs_6s drums stem of S6taps (`htdemucs_6s\S6taps\drums.wav`, if the orchestrator gives it to you, renamed
`S6taps_htdemucs6s_drums.wav`).

Not run on the box: its checkpoint `49469ca8.th` (167,400,043 bytes) was downloaded and a Demucs 4.1.0 environment
built, but running `demucs --repo model -o <out> -n 49469ca8 <file>` was refused by the permission system. Its four
stems are named `bombo`, `redoblante`, `platillos`, `toms` inside the checkpoint.

1. Open the notebook, upload the file(s), run the cells, download the four WAVs of each.
2. Command-line route if the notebook fails (not tried anywhere): the README's scripts are written "With Linux"; they
   only do this, which can be typed in PowerShell (Section 3's setup): `py -3.11 -m venv drumsep-venv`,
   `.\drumsep-venv\Scripts\Activate.ps1`, `pip install demucs`, put the file from
   https://drive.google.com/uc?id=1-Dm666ScPkg8Gt2-lK3Ua0xOudWHZBGC (`49469ca8.th`) into a folder `model`, then
   `demucs --repo model -o drumsep_out -n 49469ca8 <file>` for each input.

Send back: the four WAVs per input (`bombo` = kick, `redoblante` = snare, `platillos` = cymbals, `toms`) and a
screenshot. The orchestrator measures which stem holds the side-stick "slap" and the bass-drum "thump" times of
`S6taps.truth.json`.

### T30 · Onsets and Frames, drums checkpoint (E-GMD), in Magenta's Colab notebook (fingerstyle-voices-taps 12; audio-to-notes ran the piano checkpoint)

Link: the "Onsets and Frames Colab Notebook" "for both piano and drum transcription models", linked from
https://github.com/magenta/magenta/tree/main/magenta/models/onsets_frames_transcription · account: Google · cost: 0 ·
time: not stated · clips: S6taps, the taps stem, S2s.

Not run on the box: it needs the Magenta package (repository "currently inactive (archived, read only)"), whose last
PyPI release, 2.1.4 of 2022-08-01, pins `tensorflow==2.9.1`. The audio-to-notes lane ran Magenta's MAESTRO piano
checkpoint in gap round 1 (run r0545).

1. Open the notebook and choose the drums model (the README's drums checkpoint is `e-gmd_checkpoint.zip`, 25,658,703
   bytes; its command uses `--config="drums"`).
2. Run it on `S6taps.wav`, `S6taps_stem_taps.wav` and `S2s.wav`.

Send back: the MIDI files and a screenshot of the cell output; if the environment setup fails in Colab, the error
(the package is from 2022).

### T31 · Klangio Drum2Notes: drum notes from the taps (fingerstyle-voices-taps survey; written for this file)

Link https://klang.io/drum2notes/ · account: Klangio's terms §5.2.1 describe a free tier "without creating a user
account" (demo transcriptions, non-commercial; up to 30 demo transcriptions a day, each limited to 20 seconds, PDF
export only, re-read 2026-11-12) · cost: 0 for demo transcriptions; the Drum2Notes page (read 2026-11-12): "You can do
as many Demo Transcriptions with Drum2Notes as you like, which are completely for free!" and "Try our transcription
service for free with demo transcriptions of the first 20 seconds of your recording" (the page and the terms' 30 a
day differ; write down what you get); paid prices not read (the pricing pages answered 404 on 2026-11-10, and
https://klang.io/pricing/ again on 2026-11-12) · time: not stated · clips: `S6taps_stem_taps.wav`, `S6taps.wav`.

Listed in the fingerstyle lane's survey as a service and not run there (no reason recorded beyond that). Its page:
"Record, Upload or use a YouTube Link of Music to turn the Drums into Sheet Music, MIDI and MusicXML within seconds."
and "Polyphonic - Detects and writes down snare, toms, bass drum and different cymbals, even when played
simultaneously." (read 2026-11-10).

1. Upload `S6taps_stem_taps.wav`, then `S6taps.wav`, with the default settings.
2. Screenshot each result and download what the free tier offers (PDF, MIDI or MusicXML).

Send back: the downloads, screenshots, `notes.txt` (the length it transcribed, the plan). The kick and snare lines can
be scored against the "thump" and "slap" taps of `S6taps.truth.json`.

### T32 · WiLoR: hand detector and 3D hand mesh, in its Hugging Face demo (video-hands-fretboard 1)

Link https://huggingface.co/spaces/rolpotamias/WiLoR ("RUNNING" on "zero-a10g" on 2026-11-10) · account: optional;
Hugging Face's ZeroGPU page (read 2026-11-10) lists a daily GPU quota of 2 minutes with "Low" queue priority without
signing in and 5 minutes with "Medium" priority for a free account · cost: 0 · time: not stated · inputs: the three
stills (R3a_cu at 11:27, R3a at 0:03 and 0:10; see "The test clips").

Not run on the box: the mesh needs the MANO hand model (a registered account), and loading the detector checkpoint
was refused by the permission system. License: the WiLoR models are CC BY-NC-ND 4.0, and MANO is for "non-commercial
scientific research, non-commercial education, or non-commercial artistic projects" only.

1. Upload the R3a_cu still as "Input image". Leave "Detection Confidence Threshold" at its default, 0.3, and press
   "Submit".
2. Repeat with the two R3a stills.

Send back: the "Reconstructions" image and the "Hands Detected" text for each still, and the seconds each took.

### T33 · SAM 3: text-prompted segmentation and tracking, in a demo Space (video-hands-fretboard 3)

Link https://huggingface.co/spaces/merve/SAM3-video-segmentation ("RUNNING" on "zero-a10g" on 2026-11-10; the ZeroGPU
quotas of T32 apply) · cost: 0 · time: not stated · clip: R3a_cu (`R3a_cu.mp4`).

Not run on the box: `facebook/sam3` is gated with manual approval (unauthenticated downloads answered HTTP 401).

1. In the "Text Prompting" tab upload `R3a_cu.mp4` under "Upload video". Type `guitar neck` in "Text Prompt(s)",
   press "Apply Text Prompt(s)", then "Propagate across video", then "Render MP4 for smooth playback", and download
   the "Rendered Playback" video.
2. Press "Reset Prompts" and repeat with `fretboard`, `hand` and `capo` (there is no capo in this clip; note whether
   `capo` returned anything).
3. Only if the model files themselves are wanted: signed in to Hugging Face, open https://huggingface.co/facebook/sam3
   and request access (manual approval).

Send back: the four rendered videos, and the time from "Apply" to the rendered video for each prompt.

### T34 · Grounding DINO and OWLv2 demo pages (video-hands-fretboard 4; optional now)

Links https://huggingface.co/spaces/merve/Grounding_DINO_demo and https://huggingface.co/spaces/merve/owlv2 (both
"RUNNING" on "cpu-basic" on 2026-11-10) · account: none · cost: 0 · time: not stated · inputs: the three stills.

Both models ran on the box itself in gap round 2 (OWLv2 run r0639, Grounding DINO tiny run r0648, with scores), so
this is optional. The one thing the box could not do is call the Grounding DINO demo page (`Unknown protocol: ws`).

1. Grounding DINO: upload the R3a_cu still. "Detection Prompt": `guitar neck . fretboard . headstock . capo . hand .`
   Leave "Box Threshold" and "Text Threshold" at their defaults (0.25 and 0.25 on 2026-11-10). Repeat with the two R3a
   stills.
2. Optional: OWLv2 with the same stills, `text_queries` = `guitar neck, fretboard, headstock, capo, hand` and
   `score_threshold` 0.1 (its default); this demo shows labels on the boxes but returns no scores.

Send back: screenshots of each result with the boxes (and any scores the page shows), and the thresholds used.

### T35 · TAPIR / BootsTAPIR point tracking in Google Colab (video-hands-fretboard 6)

Link: the "Standard PyTorch TAPIR" Colab (`colabs/torch_tapir_demo.ipynb`) linked from
https://github.com/google-deepmind/tapnet (README section "Colab Demo": "You can also upload your own video and try
point tracking with TAPIR.") · account: Google · cost: not stated by the lane (Colab's own tiers apply; the lane
says to pick a GPU runtime "if Colab offers one") · time: not stated · clip: `R3a_cu.mp4`.

Not run on the box: the BootsTAPIR and TAPNext checkpoints were over its 200 MB download limit, and running the tapnet
code with the original TAPIR checkpoint was refused by the permission system.

1. Open the notebook; pick a GPU runtime if Colab offers one. It downloads the BootsTAPIR checkpoint
   (`bootstap/bootstapir_checkpoint_v2.pt`) and loads its own example video in "Load an Exemplar Video"
   (`media.read_video("tapnet/examplar_videos/horsejump-high.mp4")`). Upload `R3a_cu.mp4` to the session's files,
   change that path to it, and run the cells in order.
2. In "Select Any Points at Any Frame", click the nut, two frets away from the hand, and the knuckle of the index
   finger, then run "Predict Point Tracks for the Selected Points" (that cell's frame slider is set for the 50-frame
   example video: `max:49`).
3. If you have time, do the same with the "BootsTAPNext PyTorch" Colab.

Send back: the output video with the tracks, and the time the tracking cell took.

### T36 · Roboflow Universe guitar-neck and fret models (video-hands-fretboard 7)

Links: https://universe.roboflow.com/code-and-chords/guitar-necks-detector-ogacd and
https://universe.roboflow.com/code-and-chords/guitar-frets-segmenter (more project names in the video lane's
`survey.md`) · account: a Roboflow account (pages answered the box with a "Just a moment..." challenge, and the API
asked for a key) · cost: "$0 Free Tier" with "10 credits included a month"; Core "$39per month" (video survey, read
2026-11-10) · time: not stated · inputs: the three stills.

1. Make an account on https://roboflow.com and sign in.
2. Open each project page. Before using one, screenshot the license shown on the project page.
3. If the page has a "Try this model" or "Deploy" tab with an upload box, upload the three stills.
4. Optional, for an agent: an API key from the account, stored as `ROBOFLOW_API_KEY` (a name proposed here; the
   box's calls to `api.roboflow.com` and `detect.roboflow.com` answered 401 without one).

Send back: the license screenshots, the result screenshots, and the JSON if the page offers it.

### T37 · Soundslice: tab display, player, sync and export (web-tab-render 3; hosted-apis 12)

Link https://www.soundslice.com/ · account: needed (note which plan it puts you on and the price it shows) · cost:
as shown on sign-up (not read by the lanes); the data API: "API keys are only available to paying Soundslice
customers — either in the Teacher or Licensing plans" and uploading notation through the API is "only available by
special permission" · time: not stated · files: `inputs/S2n/S2n.gp5`, `inputs/S5capo2/S5capo2.gp5`,
`lanes/web-tab-render/samples/musicxml-from-truth/S2n.truth.musicxml`, `inputs/S2n/S2n.tab.txt`, `S2n.wav`.

The apps-survey lane found no automatic audio-to-notes feature in Soundslice (transcription in it is done by hand),
and its acceptable use policy bars automated use.

1. Make an account. Create a new slice and upload `S2n.gp5`; if it asks for MusicXML instead, upload
   `S2n.truth.musicxml`.
2. Check that a TAB staff shows the same numbers as `S2n.tab.txt` (open it in Notepad), and press play.
3. Try `S5capo2.gp5` the same way and look for "capo" on the page.
4. Attach the audio `S2n.wav` to the S2n slice, sync it, and note how long the sync took (hosted-apis 12).
5. Look for an export or download option (MusicXML, Guitar Pro, PDF, MIDI) and use the ones that exist.

Send back: screenshots of the tab, the synced player and the export menu; any exported files; the plan name and
price shown; the sync time.

### T38 · Flat.io: import, tab, edit, export, and an API token (web-tab-render 4; hosted-apis 12)

Link https://flat.io/ · account: needed (note the plan and price shown) · cost: as shown on sign-up (not read) ·
time: not stated · files: `S2n.truth.musicxml`, `inputs/S2n/S2n.gp5`, `inputs/S2n/S2n.tab.txt`.

1. Make an account. Import `S2n.truth.musicxml`, then also try importing `S2n.gp5`.
2. Check whether a TAB staff appears with the same numbers as `S2n.tab.txt`.
3. Change one note in the tab (the first note of the first bar), then export as MusicXML.
4. For an agent (hosted-apis 12): the API's auth is "Personal Access Tokens or OAuth2"; create a personal access
   token in the account and store it as `FLAT_TOKEN`. The agent's first request imports `S2n.gp5` with
   `POST https://api.flat.io/v2/scores` (`ScoreCreationFileImport`; the spec lists `.gp5` under "Also supported
   (converted to MusicXML on import, some notation details may be lost)"), then exports it as MusicXML:

   ```bash
   FLAT_TOKEN=$(python3 ~/.claude/bin/getkey.py FLAT_TOKEN)
   # import_S2n.json: a ScoreCreationFileImport body built from the spec ("Binary payloads may be Base64 with
   # dataEncoding"); its full field list was not quoted by the lane (UNVERIFIED until the agent reads the spec)
   curl -sS -X POST https://api.flat.io/v2/scores -H "Authorization: Bearer $FLAT_TOKEN" \
     -H "Content-Type: application/json" -d @import_S2n.json
   ```

   (Whether the token goes in an `Authorization: Bearer` header is UNVERIFIED in the lane's quotes.)

Send back: screenshots, the exported MusicXML, and which of the two imports worked.

### T39 · Listening check of alphaTab's player (web-tab-render 7)

Link https://alphatab.net/playground (alphaTab's own test page, linked from https://alphatab.net/docs/introduction;
the live page was not opened from the box; the steps follow the playground's source at commit ec751a23 of 2026-11-08,
which has open-file and drop-file handlers and "Count-in" and "Metronome" buttons) · account: none · cost: 0 · needs:
speakers · time: not stated · file: `inputs/S2n/S2n.gp5`.

The box measured when alphaTab's playback events fired, but it has no sound card, so nobody has heard it.

1. Open the page in Chrome and load `S2n.gp5` (drag it onto the page, or use its open button).
2. Press play with the metronome on, then with the count-in on.

Send back: a short note saying whether the notes, the metronome clicks and the moving cursor stay together by ear,
and, if you can, a phone video of the screen with sound (about 20 seconds).

### T40 · xAI's and OpenAI's API terms: save the pages (hosted-apis 14; the OpenAI page is from the hosted-apis gap round 2 notes)

Links https://x.ai/legal/terms-of-service-enterprise (and the Data Processing Addendum linked from https://x.ai/legal)
and https://openai.com/policies/services-agreement/ · account: none expected · cost: 0 · time: not stated · clips:
none.

The speech-to-text calls (runs r0105, r0306) went to xAI's API with the xAI key, but the xAI terms page answered HTTP
403 ("Sorry, you have been blocked") to the box and to the web-fetch tool on 2026-11-11; OpenAI's Services Agreement
answered 403 with "Enable JavaScript and cookies to continue"; a later status check of both was refused by the
permission system ("[Bot Check Circumvention]"). So no clause from either is quoted anywhere.

1. In your browser open each page and save it as a PDF (print to PDF) or copy its whole text into a `.txt` file.

Send back: the saved files and the date you saved them. An agent then quotes the clauses on who owns API outputs,
whether inputs and outputs are used for training, and retention, into the hosted-apis `survey.md`.

### T41 · Tabtify Pro (apps-survey, "Optional and paid"; paid)

Link https://tabtify.com/ · account: needed · cost: Pro "$15/month" or
"$99/year"; its free plan is the editor only ("AI conversion is not included") (read 2026-11-10) · time: about 10
minutes (lane's estimate) · clips: S2s, S5capo2, S5dropd.

1. With Pro: upload `S2s.wav`, set "Acoustic Guitar 6-string", run it.
2. Then `S5capo2.wav` with capo 2 and `S5dropd.wav` with Drop D in its settings.
3. Export MIDI, Guitar Pro (`.gp`) and MusicXML for each.

Send back: exports, screenshots, `notes.txt`. (`gtr-eval` reads Guitar Pro 3 to 5 only: a `.gp` file is opened in
Guitar Pro or TuxGuitar and saved as `.gp5` first, and that step is stated next to the score.)

## Section 2. Accounts and API keys an agent can then use for you

For each: make the account, create the key, and store it in your key store the `/save-api-key` way under the name
given, so an agent reads it at run time with `python3 ~/.claude/bin/getkey.py NAME` and never prints it. Then tell an
agent the line under "Tell an agent". The first request below is what the agent sends; `$NAME` is the variable the key
is read into, never a key written out. Nothing was signed up for during the research, and no request below has been
sent unless the line says so. Only the synthesized clips (S1 to S7) and the freely licensed R2 and R3 clips go to a
service. T55 and T56 use keys already in your key store (`GEMINI_API_KEY`, `VERCEL_AI_GATEWAY_API_KEY`); the other
names below are the hosted-apis lane's proposals, or this file's where a test says so.

### T42 · AudioEstimate: read the access conditions and decide (chords-beats-key 13)

Where: https://huggingface.co/DionTimmer/audioestimate-1.0, signed in to Hugging Face · free · time: not stated.

Not run on the box: the model's files sit behind a manual access request ("You need to agree to share your Hugging
Face information to access this model"), and no public inference code was found (no PyPI project, no public GitHub
repository under the names tried). The card says the model "is used by the AudioEstimate Python package and Electron
desktop app".

1. Read the access conditions. Request access only if you accept them; the gate is "manual", so the author approves
   each request.
2. If access is granted, download the four small files `README.md`, `config.yaml`, `metrics.json` and `VERSION.md`
   (`model.pt` is 37,738,542 bytes and is not needed yet), and look for a link to the AudioEstimate Python package or
   desktop app.

Send back: the conditions text (copy or screenshot), whether access was granted, the four files and any link found.
With those the lane can tell whether `model.pt` can be run on S3, S4, R1a, R1b, R1c and R2 and under what license.

### T43 · Hugging Face: a free access token (hosted-apis 3)

Where: sign in at https://huggingface.co (free account), open https://huggingface.co/settings/tokens and create a
token named `research-spaces` · free · store as `HF_TOKEN` · which token type or account plan the ZeroGPU quota needs
is UNVERIFIED (the error text says only "Authenticate with a Hugging Face token for more quota").

Two public demo pages that run on shared GPUs ("ZeroGPU") refused the box without a token ("You have exceeded your
ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota"): the MuScriptor transcription page and the
SAM Audio separation page; in the verifier's re-runs the YourMT3 ZeroGPU page refused too.

Tell an agent: "HF_TOKEN is stored; run the ZeroGPU Spaces from the hosted-apis lane." First requests (Gradio client,
the lane's `scripts/hf_space_call.py`, which calls without a token today; how the token is passed is for the agent to
read in the gradio_client docs, UNVERIFIED here): `hugging-apps/muscriptor-music-transcription` on S2n with the
instrument `acoustic_guitar` (T25), `lpeterl/sam-audio-webui` on S4 with the prompt "acoustic guitar" (T21), and
`teamup-tech/Transkun` on S2n. Send back: nothing.

The same account is the one that asks for access to the gated models: `facebook/sam-audio-small` (T21),
`facebook/sam3` (T33), `MuScriptor/muscriptor-small` (T25) and `DionTimmer/audioestimate-1.0` (T42). Each gate shows
its own conditions; accepting them is your decision.

### T44 · Klangio API: guitar transcription to Guitar Pro, MIDI, MusicXML; chords (hosted-apis 4)

Where: register at https://auth.klang.io/register, then copy the key from https://api-dashboard.klang.io; the API
page says access is by an application form ("Apply now"), so the key may come only after Klangio accepts it · free
tier (https://klang.io/api/, read 2026-11-10): Basic "$ 0" monthly, "50 requests included", "Max 15s audio duration",
"1 request per minute" · store as `KLANGIO_API_KEY`.

The docs also say "For a testing account a demo transcription is created by default." and "Use as little output
formats as possible. Multiple formats may inflict additional quota costs for a transcription job.", so the first call
below (four formats) may cost more than one request of quota, and on a testing account may return a demo
transcription; the agent writes down which.

Tell an agent: "KLANGIO_API_KEY is stored; run the hosted-apis Klangio requests on the 15 s excerpts." First requests
(one per minute; `outputs` sent as repeated form fields is UNVERIFIED for this API until the first call):

```bash
KLANGIO_API_KEY=$(python3 ~/.claude/bin/getkey.py KLANGIO_API_KEY)
curl -sS -X POST "https://api.klang.io/transcription?model=guitar&title=S2n" \
  -H "kl-api-key: $KLANGIO_API_KEY" \
  -F "file=@S2n_0-15s.wav" -F "outputs=gp5" -F "outputs=midi" -F "outputs=mxml" -F "outputs=json"
# -> {"job_id": ...}; then poll, then fetch each format
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" https://api.klang.io/job/<job_id>/status
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.gp5  https://api.klang.io/job/<job_id>/gp5
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.mid  https://api.klang.io/job/<job_id>/midi
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.xml  https://api.klang.io/job/<job_id>/xml
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.json https://api.klang.io/job/<job_id>/json
# chords (extended: key, chords, strums) of the first 15 s of S3
curl -sS -X POST "https://api.klang.io/chord-recognition-extended?vocabulary=full" \
  -H "kl-api-key: $KLANGIO_API_KEY" -F "file=@S3_0-15s.wav"
```

The agent scores notes and string/fret against S2n's truth (first 15 s) and chords against S3's. Whether the `json`
output holds string and fret per note is not documented (UNVERIFIED until this call). The web app without a key is
T06. Send back: nothing.

### T45 · AudioShake: guitar stem (hosted-apis 7)

Where: sign up at https://dashboard.audioshake.ai/auth/sign-up/ (the quickstart's link); the quickstart: "You'll get
10 free credits to start building immediately." · price: credits are "charged per minute of source audio, per target
model" and "Duration is always rounded up to the nearest minute" (billing page), so S4 (39 s) with the `guitar` model
(1.0 credit per minute) costs 1 credit (read 2026-11-10) · store as `AUDIOSHAKE_API_KEY`.

Tell an agent: "AUDIOSHAKE_API_KEY is stored; run the hosted-apis AudioShake task on S4." First request (quickstart
https://developer.audioshake.ai/quickstart.md; a local file is uploaded first with the docs' "Upload File" endpoint,
whose exact form the lane did not quote, and the task refers to its `assetId`):

```bash
AUDIOSHAKE_API_KEY=$(python3 ~/.claude/bin/getkey.py AUDIOSHAKE_API_KEY)
# 1) upload S4.wav with the "Upload File" endpoint of the docs -> assetId
curl -sS -X POST https://api.audioshake.ai/tasks -H "x-api-key: $AUDIOSHAKE_API_KEY" -H "Content-Type: application/json" \
  -d '{"assetId": "<assetId>", "targets": [{"model": "guitar", "formats": ["wav"]}]}'
curl -sS -H "x-api-key: $AUDIOSHAKE_API_KEY" https://api.audioshake.ai/tasks/<task-id>   # output links expire after one hour
```

Or the official client and CLI, `pip install audioshake` (per the quickstart). Send back: nothing (the agent keeps the
guitar stem WAV and scores it against `S4_stem_guitar.wav`).

### T46 · MVSEP: guitar separation models (hosted-apis 9)

Where: register at https://mvsep.com and copy the API token · free tier: registered free accounts get API access
"Limited" (plans table); the lowest-priced credit pack in that table is $3 for 60 credits (read 2026-11-10) · store as
`MVSEP_API_TOKEN`.

Tell an agent: "MVSEP_API_TOKEN is stored; run the hosted-apis MVSEP guitar separation on S4." First request
(https://mvsep.com/full_api; `sep_type` is the `render_id` from https://mvsep.com/api/app/algorithms, where "MVSep
Guitar (guitar, other)" has render_id 31 and its `add_opt1` lists model versions such as "3": "MelRoformer (2024.06,
SDR: 7.02)", an author-reported figure; `is_demo` is left out: "should the separation be published to demo page,
defaults to false"):

```bash
MVSEP_API_TOKEN=$(python3 ~/.claude/bin/getkey.py MVSEP_API_TOKEN)
curl -sS -X POST https://mvsep.com/api/separation/create -F "api_token=$MVSEP_API_TOKEN" \
  -F "audiofile=@S4.wav" -F "sep_type=31" -F "add_opt1=3" -F "output_format=1"     # -> data.hash
curl -sS "https://mvsep.com/api/separation/get?hash=<hash>"                         # until status done; download files
```

Send back: nothing (the agent keeps the guitar and other WAVs).

### T47 · Hooktheory Trends API: chord-progression statistics (hosted-apis 12)

Where: an account at https://www.hooktheory.com · free (no price was listed by the lane) · store the username and
password as `HOOKTHEORY_USER` and `HOOKTHEORY_PASSWORD`. The token comes from `POST
https://api.hooktheory.com/v1/users/auth` with them and "expires about an hour after it is issued"; the API "limits
requests to 10 every 10 seconds". Its terms ("Last updated October, 2026") bar using the TheoryTab database "to train,
fine-tune, or evaluate models" except as expressly authorized.

Tell an agent: "Hooktheory credentials are stored; run the hosted-apis Trends request." First request (the chords that
most often follow I-V):

```bash
# after POST https://api.hooktheory.com/v1/users/auth with the username and password -> activkey
curl -sS -H "Authorization: Bearer <activkey>" "https://api.hooktheory.com/v1/trends/nodes?cp=1,5"
```

Send back: nothing (the agent saves the JSON).

### T48 · StemSplit API: six stems with a guitar stem (hosted-apis, verifier's row in "NOT RUN HERE"; written for this file)

Where: an account at https://stemsplit.io (where the key is created was not read: UNVERIFIED; its docs show keys with
an `sk_live_` prefix) · free: "5 free minutes on signup"; credit packs from 10 minutes for "$2.00" to 300 minutes for
"$30.00" (https://stemsplit.io/pricing, read 2026-11-10); the launch post: "The API uses the same credit system as the
web app — no separate API pricing, no subscription required." · store as `STEMSPLIT_API_KEY` (a name proposed here).

Its llms.txt (read 2026-11-12): base URL `https://stemsplit.io/api/v1`; "All API requests require Bearer token
authentication"; `POST /upload` ("Get presigned upload URL"), `POST /jobs` ("Create stem separation job"), `GET
/jobs/:id` ("Get job status and download URLs"); output type `SIX_STEMS` ("Vocals, drums, bass, guitar, piano, other");
quality `BEST` ("Highest quality, required for 6-stem separation (~60s per minute)"). The launch post says the API runs
the "same HTDemucs FT model" as the web app (the vendor's statement; which model gives the six-stem output is
UNVERIFIED). Its terms: the URL feature is "PROVIDED SOLELY FOR PROCESSING CONTENT THAT YOU HAVE THE LEGAL RIGHT TO
USE."

Tell an agent: "STEMSPLIT_API_KEY is stored; run a SIX_STEMS job on S4." First request: the body fields of `/upload`
and `/jobs` were not quoted by any lane (UNVERIFIED), so the agent reads the API reference
(https://stemsplit.io/developers/reference) first; the requests have this shape:

```bash
STEMSPLIT_API_KEY=$(python3 ~/.claude/bin/getkey.py STEMSPLIT_API_KEY)
curl -sS -X POST https://stemsplit.io/api/v1/upload -H "Authorization: Bearer $STEMSPLIT_API_KEY"   # -> presigned upload URL
# PUT S4.wav to that URL, then POST /api/v1/jobs with the uploaded file, output type SIX_STEMS, quality BEST
curl -sS -H "Authorization: Bearer $STEMSPLIT_API_KEY" https://stemsplit.io/api/v1/jobs/<id>        # status and download URLs
```

Send back: nothing.

### T49 · Replicate: hosted Demucs, All-In-One structure analysis, chord detection (hosted-apis 10)

Where: sign in at https://replicate.com, create a token at https://replicate.com/account/api-tokens · price: hardware
by the second (pricing page: "Nvidia T4 GPU gpu-t4 $0.000225/sec $0.81/hr"); per run, from the model pages
(re-read 2026-11-12): `ryan5453/demucs` "costs approximately $0.0049 to run on Replicate, or 204 runs per $1" ($0.0050
on 2026-11-10), the all-in-one analyzer "approximately $0.059" ($0.062 on 2026-11-10), the chord model "approximately
$0.022" · store as `REPLICATE_API_TOKEN`.

The current `ryan5453/demucs` version serves `htdemucs` only: four stems, no guitar stem.

Tell an agent: "REPLICATE_API_TOKEN is stored; run the three hosted-apis Replicate models." First request (HTTP API
docs: "Files should be passed as HTTP URLs or data URLs."):

```bash
REPLICATE_API_TOKEN=$(python3 ~/.claude/bin/getkey.py REPLICATE_API_TOKEN)
python3 - <<'EOF' > body.json
import base64, json
print(json.dumps({"input": {"audio": "data:audio/wav;base64," + base64.b64encode(open("S4.wav", "rb").read()).decode(), "format": "wav"}}))
EOF
curl -sS -X POST -H "Prefer: wait" -H "Authorization: Bearer $REPLICATE_API_TOKEN" -H "Content-Type: application/json" \
  --data-binary @body.json https://api.replicate.com/v1/models/ryan5453/demucs/predictions
```

Then `sakemin/all-in-one-music-structure-analyzer` on S4 and `triadmusic/chord-detection-cnn-lstm` on S3 (their input
fields: the agent reads each model's `/llms.txt` first). Send back: nothing (the agent keeps the outputs and the
"predict time" each prediction reports).

### T50 · MusicGPT API: audio to MIDI (hosted-apis, verifier's row in "NOT RUN HERE"; written for this file)

Where: a MusicGPT account (where the key is created was not read: UNVERIFIED) · price (read 2026-11-11), "Audio to
MIDI": "$0.014 + $0.01/min" Pay as You Go ("Base Cost: One-time charge per request", "+/min: Additional cost per minute
(60s increments)"), lower on the Plus and Pro plans; the hosted-apis lane's arithmetic for the 38.7 s S4: 0.024 USD ·
store as `MUSICGPT_API_KEY` (a name proposed here).

Its endpoint page (OpenAPI "Musicgpt API" 1.0.0, read 2026-11-10 and again 2026-11-12):
`POST https://api.musicgpt.com/api/public/v1/audio_to_midi`, a multipart form with `audio_url` ("supported format:
YouTube URL") or `audio_file`, `sonify_midi` and `save_note_events` (both default true), `webhook_url`; "This request
is handled asynchronously"; the security scheme is an API key in the `Authorization` header (its code sample sends
`{"Authorization": "<API_KEY>"}`, with no "Bearer"). No instrument, tuning or key field. "Max input audio length: 8
minutes." (the pricing page; the endpoint page states no length). The model behind it is not named (UNVERIFIED). Terms (Terms of Service, "Effective date: 01 Jan 2025";
whether they govern the API is UNVERIFIED): § 3.1 "By using the Service, you grant MusicGPT a royalty-free,
non-exclusive, and perpetual license to use, showcase, and distribute generated music for improving the Service,
marketing, and training purposes."

Tell an agent: "MUSICGPT_API_KEY is stored; send S2n to MusicGPT's audio_to_midi." First request:

```bash
MUSICGPT_API_KEY=$(python3 ~/.claude/bin/getkey.py MUSICGPT_API_KEY)
curl -sS -X POST https://api.musicgpt.com/api/public/v1/audio_to_midi -H "Authorization: $MUSICGPT_API_KEY" \
  -F "audio_file=@S2n.wav" -F "sonify_midi=false" -F "save_note_events=true"   # -> success, task_id, conversion_id
```

How the result is fetched by `conversion_id` was not quoted by the lane (UNVERIFIED). Send back: nothing.

### T51 · fal.ai: hosted Demucs with a guitar stem, and Mureka Music Transcription (hosted-apis 11 and 15)

Where: sign up at https://fal.ai, add a little credit, create a key in the dashboard · price on the model pages:
`fal-ai/demucs` "$0.0007 per seconds"; Mureka "$0.20" per song, so the two Mureka calls below cost 0.40 USD (read
2026-11-10 and 2026-11-11) · store as `FAL_KEY`.

`fal-ai/demucs` takes a URL, not an upload: `audio_url` (required), `model` (default `"htdemucs_6s"`), `stems`,
`output_format` (default `"mp3"`); whether a `data:` URL is accepted there is UNVERIFIED. Mureka's endpoint turns a
song into a ZIP that "can include MusicXML, PDF sheet music, and timestamped lyrics"; its `audio_url` takes a data
URI, and both S4 (38.741 s) and R2 (36.000 s) are inside its limits ("between 10 seconds and 10 minutes and no larger
than 100 MB").

Tell an agent: "FAL_KEY is stored; run the hosted-apis fal.ai Demucs and Mureka requests." First requests:

```bash
FAL_KEY=$(python3 ~/.claude/bin/getkey.py FAL_KEY)
curl -sS -X POST https://fal.run/fal-ai/demucs -H "Authorization: Key $FAL_KEY" -H "Content-Type: application/json" \
  -d '{"audio_url": "<URL of S4.wav>", "model": "htdemucs_6s", "output_format": "wav"}'
for c in S4 R2; do
python3 - "$c" <<'PY' > body_$c.json
import base64, json, sys
c = sys.argv[1]
b = base64.b64encode(open(f"{c}.wav", "rb").read()).decode()
print(json.dumps({"audio_url": "data:audio/wav;base64," + b, "title": c}))
PY
curl -sS -X POST https://fal.run/mureka/api/song/transcribe -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" --data-binary @body_$c.json -o result_$c.json   # -> {"zip_url": "..."}
done
```

The agent keeps the six stems, both ZIPs, the time of each call and the charge in the fal dashboard; it scores S4's
MusicXML with `gtr-eval notes` and compares R2's timestamped lyrics with the two speech-to-text transcripts in the
hosted-apis `trials.md`. Send back: nothing.

### T52 · Music.AI (Moises' developer platform): chords, beats, guitar stems (hosted-apis 5)

Where: create an account at https://music.ai, open the dashboard, create an API key · UNVERIFIED whether an individual
account can still get a key (a third-party README quoted in the survey says "MUSIC.ai no longer provide individual API
key, only business plan"; the pricing page read the same day lists a pay-as-you-go plan); if the dashboard offers no
key, send back a screenshot of what it shows · price (https://music.ai/pricing/, read 2026-11-10): "Pay as you go $0"
with per-module prices, among them "Transcription - Chords $0.04 / min", "Transcription - Beats $0.03 / min" and "Stem
separation - Guitar stems (Acoustic guitar, Electric guitar) $0.1 / min"; about 0.11 USD for S4 if billed by the exact
duration; the FAQ: "Pay-as-you-go and Professional members must purchase credits up front" · store as
`MUSICAI_API_KEY`.

In the dashboard, build one workflow from the modules **Chords**, **Beats** and **Guitar Stems** (input: one audio
URL) and note its slug, for example `guitar-research`, and the name of its input (the API reference: `params` "must
match the workflow's input schema"; its job examples use `inputUrl`, the module pages `inputFileUrl`). Its terms: free
"Evaluation Access" output is for "internal testing and evaluation".

Tell an agent: "MUSICAI_API_KEY is stored; the workflow slug is <slug>; run it on S4." First request (whether a
"Bearer " prefix is needed is UNVERIFIED):

```bash
MUSICAI_API_KEY=$(python3 ~/.claude/bin/getkey.py MUSICAI_API_KEY)
curl -sS -H "Authorization: $MUSICAI_API_KEY" https://api.music.ai/v1/upload      # -> uploadUrl, downloadUrl
curl -sS -X PUT -H "Content-Type: audio/wav" --data-binary @S4.wav "<uploadUrl>"
curl -sS -X POST https://api.music.ai/v1/job -H "Authorization: $MUSICAI_API_KEY" -H "Content-Type: application/json" \
  -d '{"name": "S4 guitar research", "workflow": "<your workflow slug>", "params": {"inputUrl": "<downloadUrl>"}}'
curl -sS -H "Authorization: $MUSICAI_API_KEY" https://api.music.ai/v1/job/<job id>   # until status SUCCEEDED
```

Send back: the workflow slug, or the screenshot if no key was offered.

### T53 · OpenAI audio in Chat Completions, `gpt-audio-1.5` (hosted-apis, verifier's row in "NOT RUN HERE"; written for this file)

Where: an OpenAI API account (where the key is created was not read: UNVERIFIED) · price (model page and pricing page,
read 2026-11-11): "Audio tokens" per 1M input "$32.00", output "$64.00"; "Text tokens" input "$2.50", output "$10.00";
audio tokens per second are not stated on those pages (UNVERIFIED: one call's `usage` would settle it) · store as
`OPENAI_API_KEY` (the name the API reference's examples use).

Modalities (model page): Text and Audio "Input and output", Image and Video "Not supported". Input formats
(`input_audio.format`): "Currently supports "wav" and "mp3"." Terms: the Services Agreement could not be read (T40);
the data page (docs, not the contract): "As of March 1, 2023, data sent to the OpenAI API is not used to train or
improve OpenAI models (unless you explicitly opt in to share data with us)."

Tell an agent: "OPENAI_API_KEY is stored; send the hosted-apis chord, note and capo prompts to gpt-audio-1.5." First
request (the Chat Completions reference, read 2026-11-12: `POST https://api.openai.com/v1/chat/completions`, header
`Authorization: Bearer $OPENAI_API_KEY`, a content part `{"type": "input_audio", "input_audio": {"data": <base64>,
"format": "wav"}}`; output modalities default to `["text"]`); the prompts are the lane's `scripts/prompts/`:

```bash
OPENAI_API_KEY=$(python3 ~/.claude/bin/getkey.py OPENAI_API_KEY)
# body.json: {"model": "gpt-audio-1.5", "messages": [{"role": "user", "content": [
#   {"type": "text", "text": "<the lane's chord prompt>"},
#   {"type": "input_audio", "input_audio": {"data": "<base64 of S3.wav>", "format": "wav"}}]}]}
curl -sS https://api.openai.com/v1/chat/completions -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" --data-binary @body.json
```

Send back: nothing.

### T54 · Alibaba Cloud Model Studio, Qwen-Omni (hosted-apis, verifier's row in "NOT RUN HERE"; written for this file)

Where: an Alibaba Cloud Model Studio account (where the key is created was not read: UNVERIFIED) · price
("Alibaba Cloud Model Studio:Model inference pricing", "Last Updated:Nov 07, 2026", read 2026-11-11), per million
tokens, Singapore, "International": `qwen3.8-omni-flash` input "$0.15", output "$0.47"; `qwen3.5-omni-plus` input
"$11" (audio), free quota "1 million tokens" ("The Qwen3.5-Omni and Qwen3-Omni series offer a free quota only in
Singapore."); audio is billed at "Audio duration (seconds) * 7" tokens for Qwen3.8-Omni-Flash (the Qwen-Omni page
below, re-read 2026-11-12; the lane's arithmetic: about 271 audio tokens for S4) · store as `DASHSCOPE_API_KEY` (a
name proposed here).

Inputs (https://help.aliyun.com/en/model-studio/qwen-omni, read 2026-11-10): `qwen3.8-omni-flash` takes "Text, images,
audio, video" and outputs "Text"; audio goes in as an OpenAI-style `{"type": "input_audio", "input_audio": {"data":
<URL>}}` part, video as `video_url`; Base64 audio "must be smaller than 10 MB". Terms (Product Terms of Service, "Last
Updated:Oct 19, 2026", § 4.48.1 e): "Model Studio does not claim ownership of any Intellectual Property Rights in the
Output." and "Alibaba Cloud will not use your Member Content to develop or improve the models on Model Studio, unless
you separately provide your consent."

Tell an agent: "DASHSCOPE_API_KEY is stored; send the hosted-apis prompts to qwen3.8-omni-flash." First request: no
lane read the endpoint address (UNVERIFIED), so the agent reads the Qwen-Omni page above for it first and then sends
the lane's chord prompt with S3 as an `input_audio` part. Send back: nothing.

### T55 · Google Gemini API: top up the existing key's prepaid credit (hosted-apis 1)

Where: https://aistudio.google.com/billing, signed in with the Google account the key belongs to · cost: the minimum
purchase, 5 USD (the billing page: "To purchase credits, go to the AI Studio Billing page and select **Buy credits**.
The minimum purchase is $5."; its FAQ adds that the dialog shows the minimum "required for your region and tier
level") · key already stored as `GEMINI_API_KEY`.

The key works (it lists models and counts tokens) but every generation request returned HTTP 402 "Your prepayment
credits are depleted" (run r0013; again at the verifier's re-check, r0300).

1. Click **Buy credits** and buy the minimum. Do not turn on auto-reload.
2. When the purchase shows as done, tell an agent: "Gemini credits are topped up; run the hosted-apis Gemini trials."
   The agent runs `scripts/gemini_trial.py` for `gemini-4-carbon` and `gemini-3.5-flash-lite` on S3 and S4 (chords,
   tempo, key), S2n (notes), R3a (capo, frets, tuning) and S5capo2 (capo): 10 calls, capped at 2 USD by the script.
   The output side decides the cost: at most 24,576 output tokens per call, i.e. at most 0.25 USD per Carbon call and
   0.06 USD per Flash-Lite call at the prices read on 2026-11-10; the pricing page lists Carbon at "$2.00 through
   November 30, 2026. $4.00 starting December 1, 2026." (input) and "$10.00 through November 30, 2026. $20.00 starting
   December 1, 2026." (output), so a Carbon call from December 2026 costs up to about twice that.

Send back: nothing. (For the agent: rebuild the environment with `uv venv --python 3.11 <dir>` and `uv pip install -r
samples/venv-apis.freeze.txt`; the prompts are in `scripts/prompts/`, the scoring helper is `scripts/score_answer.sh`.)

### T56 · Vercel AI Gateway: paid credits (hosted-apis 2; optional)

Where: in your Vercel dashboard, the **AI Gateway** section in the sidebar; click the button in the upper right that
shows your AI Gateway Credits balance, pick the amount, then **Continue to Payment** and **Confirm and Pay** (the steps
on https://vercel.com/docs/ai-gateway/pricing, "Top up your AI Gateway Credits") · cost: the amount you pick; the
pricing page: "Once you purchase credits, your account transitions to the paid tier and the monthly free credit no
longer applies." · key already stored as `VERCEL_AI_GATEWAY_API_KEY`.

The gateway key is on the free tier, which refused every Google model with HTTP 403 "Free tier users do not have
access to this model" (runs r0022, r0023). UNVERIFIED: the gateway's own model list (read 2026-11-10) gives both Google
models the input modalities `text`, `image`, `pdf`, `video`, without `audio`, so whether the gateway passes a WAV to
them is not known until the first call; the direct Gemini route (T55) takes WAV and MP4.

Tell an agent: "Vercel AI Gateway now has paid credits; re-run the hosted-apis gateway trials with
google/gemini-4-carbon and google/gemini-3.5-flash-lite." (The same `scripts/gateway_trial.py` as the free-tier runs.)
Send back: nothing.

### T57 · Fadr: stems plus MIDI per stem, chords, key, tempo (hosted-apis 8)

Where: a Fadr account with a Fadr Plus subscription ("Usage of the Fadr API requires a Fadr Plus subscription, which
costs $10/mo or $100/yr.", read 2026-11-10); create the key in the account · store as `FADR_API_KEY`.

Tell an agent: "FADR_API_KEY is stored; run the hosted-apis Fadr flow on S4." The flow (https://fadr.com/docs/api,
pages dated 2023; header `Authorization: Bearer $FADR_API_KEY`): `POST https://api.fadr.com/assets/upload2` (a
presigned upload URL) -> `PUT` the file -> `POST /assets` -> `POST /assets/analyze/stem` -> poll the task until it is
done (the endpoint list has `GET /tasks/:_id`; the tutorial waits 5 s between `POST /tasks/query` calls) ->
`GET /assets/download/<id>/<type>` for each stem and MIDI file.

```bash
FADR_API_KEY=$(python3 ~/.claude/bin/getkey.py FADR_API_KEY)
curl -sS -X POST https://api.fadr.com/assets/upload2 -H "Authorization: Bearer $FADR_API_KEY" \
  -H "Content-Type: application/json" -d '<body from the docs>'   # the body fields were not quoted by the lane (UNVERIFIED)
```

By hand instead (no key; whether the web app's free use covers it was not read): in the Fadr web app
(https://fadr.com) upload `S4.wav`, export all stems and all MIDI, and send them back with the chord list, key and tempo
it shows (screenshot).

### T58 · LALAL.AI: guitar stems (hosted-apis 6)

Where: buy the Pro plan or a minute top-up pack at https://www.lalal.ai/pricing/ (its llms.txt: "API access is
available with the Pro plan or any minute top-up pack - no subscription required" and "API requests consume
Fast-queue minutes."), then copy the license key the API reads from the `X-License-Key` header (where the account
pages show it was not read: UNVERIFIED) · price (read 2026-11-10, USD as rendered for the box): Lite "$7.5 /mo", Pro
"$15/mo" ("$180 billed annually"); top-ups "Master with 750 minutes for $50" and up · store as `LALALAI_LICENSE_KEY`.

Tell an agent: "LALALAI_LICENSE_KEY is stored; run the hosted-apis LALAL.AI guitar split on S4." First request
(OpenAPI spec https://www.lalal.ai/api/v1/openapi.json; `stem` is one of `vocals`, `drum`, `piano`, `bass`, `guitar`,
`electric_guitar`, `acoustic_guitar`, `synthesizer`, `strings`, `wind`; "'guitar' is available only with andromeda";
`splitter` defaults to `auto`):

```bash
LALALAI_LICENSE_KEY=$(python3 ~/.claude/bin/getkey.py LALALAI_LICENSE_KEY)
curl -sS -X POST https://www.lalal.ai/api/v1/upload/ -H "X-License-Key: $LALALAI_LICENSE_KEY" \
  -H "Content-Type: application/octet-stream" -H "Content-Disposition: attachment; filename=S4.wav" \
  --data-binary @S4.wav                                   # -> {"id": <source id>, ...}
curl -sS -X POST https://www.lalal.ai/api/v1/split/stem_separator/ -H "X-License-Key: $LALALAI_LICENSE_KEY" \
  -H "Content-Type: application/json" -d '{"source_id": "<source id>", "presets": {"stem": "guitar"}}'
curl -sS -X POST https://www.lalal.ai/api/v1/check/ -H "X-License-Key: $LALALAI_LICENSE_KEY" \
  -H "Content-Type: application/json" -d '{"task_ids": ["<task id>"]}'   # then download the result URLs
```

Send back: nothing (the agent keeps the guitar stem and the "no guitar" remainder).

## Section 3. Runs on your laptop: tools that needed a GPU or more memory than the box has, and installs the box refused

The lanes wrote these steps for a Windows computer with an NVIDIA GPU (CUDA). Each test gives the tool's own stated
requirement where its docs give one; whether a model fits in your GPU's memory is not known unless the test says so.
"GPU: no" means the tool did not need one (it was blocked on the box by the permission system, a missing build or
the disk). Expected times are given only where the tool's docs give one; otherwise time each run.

**Setup once (PowerShell).**

1. Install Python 3.11 from https://www.python.org/downloads/windows/ and tick "Add python.exe to PATH" on the first
   screen; install Git for Windows from https://git-scm.com/download/win (all defaults).
2. Open PowerShell and make a work folder: `mkdir C:\gtr`, `cd C:\gtr`. The clips are in `C:\gtr\clips`.
3. `py -3.11 -m pip install uv` (several tests use `uv`).
4. Virtual environments: create with `py -3.11 -m venv <name>` and activate with `.\<name>\Scripts\Activate.ps1` (the
   PowerShell form in the Python docs; the lanes wrote `venv\Scripts\activate`, the Command Prompt form). If
   PowerShell refuses to run `Activate.ps1`, the Python docs give `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
   -Scope CurrentUser` (https://docs.python.org/3/library/venv.html, read 2026-11-12). An environment's Python can also
   be called directly (`.venv\Scripts\python.exe`), as the guitar-tab lane does.
5. PyTorch with CUDA: the command https://pytorch.org/get-started/locally/ shows for "Stable, Windows, Pip, Python,
   CUDA". Check it with `python -c "import torch; print(torch.cuda.is_available())"` (must print `True`).
6. A Command Prompt line `set NAME=value` is `$env:NAME = "value"` in PowerShell.
7. Timing: `Measure-Command { <command> }` and note `TotalSeconds`. For GPU runs, a screenshot of Task Manager >
   Performance > GPU while it runs ("Dedicated GPU memory").
8. Tests marked WSL run in Linux on Windows: in PowerShell opened as administrator, `wsl --install`, then restart
   (Microsoft's WSL install page, read 2026-11-12: it installs the Ubuntu distribution by default). Their commands are
   bash, typed in the Ubuntu window, as the lanes wrote them. Tests marked Docker need Docker Desktop for Windows
   (https://www.docker.com/products/docker-desktop/).

### T59 · BTC: chord recognition (chords-beats-key 2)

GPU: no (the lane's wrapper runs BTC on the CPU) · time: about 15 minutes plus install (lane's estimate) · models in
the repository: `test/btc_model.pt` 12,154,754 bytes, `test/btc_model_large_voca.pt` 12,229,576 bytes · license: MIT
(the README says the training audio came "from online music service providers") · clips: S3, S7flat30, S4, S2n, R1a,
R1b, R1c, R2, R2full.

Not run on the box: executing code from the cloned repository was refused. The lane's wrapper is ready:
`lanes/chords-beats-key/scripts/btc_run.py`.

1. `cd C:\gtr`, `git clone https://github.com/jayg996/BTC-ISMIR19`, `py -3.11 -m venv btc`, `.\btc\Scripts\Activate.ps1`
2. `pip install torch librosa==0.11.0 mir_eval pyyaml pretty_midi pandas soundfile` (on Windows the PyPI `torch` wheel
   is a CPU build: UNVERIFIED; a CUDA build comes from pytorch.org's selector).
3. Copy `btc_run.py` from this research's repository (`lanes/chords-beats-key/scripts/btc_run.py`, GitHub's
   "Download raw file") into `C:\gtr`, then:
   `foreach ($c in "S3","S7flat30","S4","S2n","R1a","R1b","R1c","R2","R2full") { python btc_run.py --audio clips\$c.wav --outdir out\$c --repo BTC-ISMIR19 }`

Send back: the whole `out` folder (per clip `chords_btc_majmin.lab`, `chords_btc_largevoca.lab`, `timings_btc.json`)
and the text printed in PowerShell.

### T60 · Banquet: "give me the stem that sounds like this clip" (source-separation 3)

GPU: the README's example runs on CUDA (`--use_cuda=true`); `train.py` also has a CPU branch (not tried) · models:
`ev-pre-aug.ckpt` 645,470,187 bytes (the one the README names for "If you are not sure"; Zenodo record 13694558,
license `cc-by-nc-sa-4.0`) plus the PaSST query model (341,546,630 bytes, downloaded by the code on first use) ·
memory: the README says its batch size 12 "usually fits on a RTX 4090" · clips: S3 as the query, S4 and R2 as the
mixtures.

Not run on the box: running the cloned repository's `train.py` was refused by the permission system. What the code
does with the query (read, not run): the query file is cut or repeated to 10 s, averaged to mono and reduced by PaSST
to one embedding; the output is one stem with the mixture's channels, length and sample rate.

1. `cd C:\gtr`, `git clone https://github.com/kwatcharasupat/query-bandit`, `cd query-bandit`, `py -3.11 -m venv venv`,
   `.\venv\Scripts\Activate.ps1`, CUDA PyTorch first, then
   `pip install pytorch_lightning torchmetrics torch_audiomentations omegaconf numpy pandas librosa scikit-learn tqdm fire hear21passt`
   (the README has no install section and the repository no requirements file; these are the packages the code
   imports; the versions the box resolved are in `lanes/source-separation/samples/banquet/uv-pip-freeze-not-run.txt`).
   If the first run stops with "TorchCodec is required for load_with_torchcodec" (or `save_with_torchcodec`),
   `pip install torchcodec` and run again.
2. Download `ev-pre-aug.ckpt` from https://zenodo.org/records/13694558 into the folder.
3. `$env:CONFIG_ROOT = "./config"`, then
   `python train.py inference_byoq --ckpt_path=ev-pre-aug.ckpt --input_path=C:\gtr\clips\S4.wav --output_path=out\S4_guitar.wav --query_path=C:\gtr\clips\S3.wav --batch_size=4 --use_cuda=true`
   (batch size 4 instead of the README's 12; smaller still on a GPU with less memory). If it stops with an error that
   names `DATA_ROOT`, run `$env:DATA_ROOT = "."` and start again, and say so.
4. The same with `--input_path=C:\gtr\clips\R2.wav`.

Send back: both outputs, the console text and the time.

### T61 · Big RoFormer models on a whole song, and two larger checkpoints (source-separation 4; trials "NOT RUN HERE: larger RoFormer checkpoints")

GPU: yes · models: about 700 MB (BS-RoFormer-SW), 640 MB (BS-RoFormer ep 317), 55 MB (htdemucs_6s), downloaded on the
first run of each; the two larger ones 913,106,900 and 1,007,816,988 bytes · clips: R2full, S4, R2.

On the box these ran only on 10 s pieces of S4 on 2 CPU cores: the 10 s took 110 s (BS-RoFormer-SW), 170 s
(BS-RoFormer) and 503 s (MDX23C) (runs r0489, r0498, r0496). Two larger checkpoints were not downloaded at all
(the disk notice).

1. `cd C:\gtr`, `py -3.11 -m venv sep`, `.\sep\Scripts\Activate.ps1`, CUDA PyTorch (setup step 5), then
   `pip install "audio-separator[gpu]"` (its `gpu` extra adds `onnxruntime-gpu`, per the package metadata).
2. `audio-separator -e` (`--env_info`): check that the printed environment mentions CUDA; screenshot it.
3. Run and time each (`--output_format WAV`, because the default output format is FLAC):
   `audio-separator -m BS-Roformer-SW.ckpt --output_format WAV C:\gtr\clips\R2full.wav`
   `audio-separator -m BS-Roformer-SW.ckpt --output_format WAV C:\gtr\clips\S4.wav`
   `audio-separator -m model_bs_roformer_ep_317_sdr_12.9755.ckpt --output_format WAV C:\gtr\clips\R2full.wav`
   `audio-separator -m htdemucs_6s.yaml --output_format WAV C:\gtr\clips\R2full.wav`
4. The two larger checkpoints (written for this file from the lane's trials and its saved catalogue,
   `lanes/source-separation/samples/audio-separator/model_catalogue_0.48.0.json`): the trials name a Mel-Band RoFormer
   "Kim" vocals checkpoint of 913,106,900 bytes and `model_mel_band_roformer_ep_3005` of 1,007,816,988 bytes; the
   catalogue lists `vocals_mel_band_roformer.ckpt` ("MelBand Roformer | Vocals by Kimberley Jensen") and
   `model_mel_band_roformer_ep_3005_sdr_11.4360.ckpt`. Run each on `C:\gtr\clips\R2.wav` the same way, and note the
   file size the download printed. (Settled on 2026-11-12 by an HTTP HEAD on the audio-separator `model-configs`
   release, the first place the package fetches from: `vocals_mel_band_roformer.ckpt` is 913,106,900 bytes and
   `model_mel_band_roformer_ep_3005_sdr_11.4360.ckpt` 1,007,816,988 bytes.)

Send back: all output files, the console text of each run (it prints its own "Load model duration" and "Separation
duration"), and the Task Manager GPU screenshot.

### T62 · `adityalakhani/htdemucs-6s-guitar-ft` with its own `inference.py` (source-separation 5)

GPU: optional (`--device cpu` forces the CPU) · model: `guitar_htdemucs_6s.pt` 329,654,071 bytes (card license
apache-2.0, trained on MoisesDB) · clips: S4, R2, S2s.

It ran on the box's CPU in gap round 2 (runs r0636 to r0644, scored e1831 to e1835) through a script with demucs
4.1.0; this adds the repository's own script with its pinned demucs 4.0.1, and a GPU timing.

1. From https://huggingface.co/adityalakhani/htdemucs-6s-guitar-ft/tree/main download `guitar_htdemucs_6s.pt`,
   `inference.py` and `requirements.txt` into `C:\gtr\htft`; `cd C:\gtr\htft`.
2. `py -3.11 -m venv venv`, `.\venv\Scripts\Activate.ps1`, CUDA PyTorch first, then `pip install -r requirements.txt`
   (it lists torch, torchaudio, `demucs==4.0.1`, soundfile and tqdm).
3. `python inference.py --input C:\gtr\clips\S4.wav --output S4_guitar.wav`, then the same with `R2.wav` and
   `S2s.wav` (it reads and writes with soundfile, uses the GPU when CUDA is available, and writes only the guitar stem;
   the model card shows these usage lines).

Send back: the three guitar stems, the exact commands, the console text and the time of each.

### T63 · MuS3D and ZeroSep: research separation systems (source-separation 7)

GPU: yes · MuS3D: checkpoint repository 19.2 GB (`DiT/ema.pth` alone is 18,180,101,963 bytes); its README says "The
DiT needs about 10 GB of free memory" and asks for Python 3.13 or newer and uv; its entry point is a bash script, so
it runs under WSL · ZeroSep runs diffusion models (defaults: model `cvssp/audioldm-s-full-v2`, 50 steps) · clips: R2,
S4.

- **MuS3D (WSL).** MuS3D "separates a music mixture without being told which sources it contains" (README). In the
  Ubuntu window, follow the "Installation" section of https://github.com/REMUS-Aalto/Mus3D (`uv sync`), download from
  https://huggingface.co/remus-aalto/MuS3D into `checkpoints/` the `BS-Locoformer_query`, `SEG_mixemb`, `SEG_resemb`
  and `classifiers` folders, then run `bash inference.sh R2.wav --separator bslocoformer` (the README: it decomposes
  one 10 s segment, centred by default; `--start <s>` picks another). Whether `inference.sh` asks for the 18.2 GB DiT
  file with `--separator bslocoformer` was not checked. Send back the output folder including `trace.txt`, and the
  time.
- **ZeroSep (PowerShell).** `git clone https://github.com/WikiChao/ZeroSep.git`, `cd ZeroSep`, optionally a Python 3.9
  environment (the README: `conda create -n zerosep python=3.9`), `pip install -r requirements.txt`, then `cd code` and
  `python separate.py --input C:\gtr\clips\S4.wav --target "acoustic guitar" --output_dir results`. Send back the
  `results` folder, the exact command and the time.

### T64 · Gaborformer: four stems (vocals, drums, bass, other) (source-separation 8)

GPU: yes (with a CPU option) · model: a 533 MB FP16 checkpoint downloaded on the first run (its SHA-256 is checked,
per `docs/usage.md`) · license: weights for non-commercial use only · requirement: "Python 3.10+ and PyTorch 2.4+"
(README) · clips: S4, R2, S6taps. It has no guitar stem.

Not run on the box: it has no PyPI package, and installing the cloned repository was refused.

1. `cd C:\gtr`, `git clone https://github.com/sevagh/gaborformer.git`, `cd gaborformer`, `py -3.11 -m venv venv`,
   `.\venv\Scripts\Activate.ps1`, CUDA PyTorch first, then `python -m pip install -e .`
2. `gaborformer C:\gtr\clips\S4.wav --out separated`, then `R2.wav` and `S6taps.wav` the same way. If it runs out of
   GPU memory add `--batch-size 1` ("Use `--batch-size 1` to reduce memory use"); if it stops with an error about bf16
   add `--precision fp16` ("for CUDA GPUs without BF16 support").
3. For a CPU figure: `gaborformer C:\gtr\clips\S4.wav --cpu --out separated-cpu`.

Send back: the `separated` folders (four float32 WAVs per clip), the exact commands, the console text, the time of
each run, and the Task Manager GPU screenshot.

### T65 · CREPE, the original TensorFlow package (audio-to-notes 4)

GPU: no · package: `crepe` 0.0.16 (a source archive only) and TensorFlow (the 2.15.0 Linux wheel for Python 3.11 is
475,258,658 bytes) · clips: S1, R1b.

Not run on the box: the build stopped with "No module named 'pkg_resources'", and with `setuptools<81` with "HTTP
Error 403: Forbidden" when its `setup.py` downloaded the weights from github.com; installing it with the weights put
in place by hand was refused. The same CREPE weights ran on the box through torchcrepe and Essentia.

1. `py -3.11 -m pip install crepe tensorflow` (crepe's `setup.py` downloads its five weight files from github.com
   during this install). If it stops with "No module named 'pkg_resources'": `py -3.11 -m pip install "setuptools<81"
   wheel`, then `py -3.11 -m pip install --no-build-isolation crepe` (this route was not tried: UNVERIFIED).
2. `cd C:\gtr\clips`; `py -3.11 -m crepe S1.wav --model-capacity tiny` and rename the `S1.f0.csv` it writes to
   `S1.crepe-tiny.f0.csv`; `py -3.11 -m crepe S1.wav --model-capacity full`, rename to `S1.crepe-full.f0.csv`; the same
   for `R1b.wav`. (The README's default step is 10 ms; `--viterbi` adds "Viterbi smoothing" and can be a third run.)
   Each run writes `<name>.f0.csv` with columns `time,frequency,confidence`.
3. If it stops with a TensorFlow or Keras error: `py -3.11 -m pip install "tensorflow<2.16"` and try again (which
   TensorFlow versions crepe 0.0.16 works with was not checked).

Send back: the four `.f0.csv` files, the output of `py -3.11 -m pip show crepe tensorflow`, any error text, the time
of each run.

### T66 · MELODIA Vamp plugin, Linux build under WSL (audio-to-notes 5)

GPU: no · license: the plug-in "is offered free of charge for non-commercial use only", behind a "DOWNLOAD FORM" ·
clips: S4, `S4_stem_lead.wav`, R2.

Not run on the box: the download page (https://www.upf.edu/web/mtg/melodia) answered HTTP 403 (a Cloudflare page).
The same algorithm ran on the box inside Essentia (`PredominantPitchMelodia`). Why the Linux build: the Windows build
needs the "Microsoft Visual C++ 2010 Redistributable Package (x86)" and installs into "C:\Program Files (x86)\Vamp
Plugins\", while Sonic Visualiser 5.2.1 is offered for 64-bit Windows only; whether that plugin loads in a 64-bit host
is UNVERIFIED.

1. In the Ubuntu window (WSL): `sudo apt install vamp-examples unzip` (the command-line host `vamp-simple-host`).
2. Fill in the MTG download form, download "MTG-MELODIA 1.0 (Linux 32/64-bit).zip", unzip it, and
   `sudo mkdir -p /usr/local/lib/vamp && sudo cp <the unzipped files> /usr/local/lib/vamp/`.
3. `vamp-simple-host -l` must list the MELODIA plugins. Copy `S4.wav`, `S4_stem_lead.wav` and `R2.wav` into the
   Ubuntu home folder.
4. Once per clip: `vamp-simple-host mtg-melodia:melodia S4.wav -o S4.melodia.txt` (the plugin key the MELODIA
   author's own `audio_to_midi_melodia.py` uses).

Send back: the three `.txt` files, the text of `vamp-simple-host -l`, any error text.

### T67 · Omnizart: music, vocal, chord and drum modes (audio-to-notes 7; chords-beats-key 7; fingerstyle-voices-taps 3)

GPU: no · requires TensorFlow (`tensorflow>=2.5.0` for Python below 3.14, PyPI metadata) and builds madmom and vamp
from source; the README warns "Currently, Omnizart is **incompatible for ARM-based MacOS** system" and says nothing
about Windows · checkpoints: `omnizart download-checkpoints` fetches ten files from the GitHub release
`checkpoints-20211001` (the chord one is 44,242,072 bytes) · clips: S2n, S4, R2 (music, vocal); S3, S4, S2n, R1a, R1b,
R1c, R2 (chord); S6taps, `S6taps_stem_taps.wav`, S2s, R3a (drum).

Not run on the box: an install of 0.5.0 stopped while building `vamp` ("No module named 'numpy'"), another while
building madmom, and the install of 0.6.3 and a chord-only install were refused by the permission system. Each lane
wrote its own route; full steps in the three lanes' `for-aaron.md` files (audio-to-notes 7, chords-beats-key 7,
fingerstyle-voices-taps 3).

1. **Music and vocal, Colab** (audio-to-notes): https://colab.research.google.com/github/Music-and-Culture-Technology-Lab/omnizart/blob/master/colab.ipynb.
   Its upload cell is titled `Upload MP3 File`, so convert the clips to MP3 first. Run `Environment Setup` (the
   notebook: "Don't restart the session when the pop up window ask you to! Just press cancel and continue."; it
   installs Python 3.8 with apt, which may not work on today's Colab: UNVERIFIED), upload `S2n.mp3`, run `Transcribe`
   with `mode` `music-piano` then `music-assemble`, `Download MIDI` after each; then `S4.mp3` (`music-assemble`) and
   `R2.mp3` (`vocal`). The notebook's mode list has no guitar entry.
2. **Chord, Docker** (chords-beats-key): `docker pull mctlab/omnizart:latest`, `docker run -it -v
   C:\gtr\clips:/clips mctlab/omnizart:latest bash`; inside, `omnizart download-checkpoints`, then `omnizart chord
   transcribe /clips/S3.wav` and the same for S4, S2n, R1a, R1b, R1c, R2 (whether the image already holds the
   checkpoints was not checked). Output: MIDI and CSV (fields `chord`, `start`, `end`).
3. **Drum, pip** (fingerstyle): a Python 3.10 or 3.11 environment, `pip install omnizart`, `omnizart
   download-checkpoints`. If the install stops while building madmom or vamp with "No module named 'numpy'" or "No
   module named 'Cython'": `pip install "numpy<2" "Cython<3" setuptools wheel`, then `pip install --no-build-isolation
   omnizart` (not tried anywhere; building needs "Microsoft C++ Build Tools"). Then `omnizart drum transcribe
   C:\gtr\clips\S6taps.wav -o S6taps_omnizart.mid`, and the same for `S6taps_stem_taps.wav`, `S2s.wav`, `R3a.wav`.
   The audio-to-notes lane's local commands for music and vocal are the same install, then `omnizart music transcribe
   S2n.wav`, `omnizart music transcribe S4.wav`, `omnizart vocal transcribe R2.wav`.

Send back: every `.mid` and `.csv` file (named with the mode), the run times, `pip show omnizart`, and if an install
fails, its last 30 lines (that is a result too).

### T68 · Sheet Sage: lead sheet (melody and chords) (audio-to-notes 8; WSL and Docker)

GPU: not for the default mode; its Jukebox mode needs "a GPU w/ at least 12GB memory and CUDA installed" · size: the
one-time setup downloads "a ~4GB Docker container" · license: its models are CC BY-NC-SA 3.0 (README) · clips: R2, S4.

Its README says "ensure you are running Linux and have Docker installed"; on Windows the nearest setup is WSL2 with
Ubuntu and Docker Desktop with the WSL2 backend (that Sheet Sage works that way is UNVERIFIED).

1. In the Ubuntu window: `ROOT=https://raw.githubusercontent.com/chrisdonahue/sheetsage/main; wget $ROOT/prepare.sh && wget $ROOT/sheetsage.sh && chmod +x *.sh && ./prepare.sh`
2. Copy `R2.wav` and `S4.wav` into the Ubuntu home folder; `./sheetsage.sh R2.wav` and
   `./sheetsage.sh --beats_per_minute_hint 116 S4.wav` (S4 is 116 BPM; the README gives the hint for a tempo detected
   at twice or half the real one).

Send back: the `output/<UUID>` folder of each run (README: "a PDF with the lead sheet (along with the corresponding
LilyPond file), and a MIDI file containing audio-aligned melody and harmony") and the time each took.

### T69 · Research code for a coding agent: Timbre-Trap, MR-MT3, mt3-pytorch, hFT-Transformer (audio-to-notes 10)

GPU: MR-MT3's `inference.py` calls `.cuda()` without a device check, so a CUDA GPU or a code change; hFT-Transformer's
README lists GPU machines · clips: S2n, S3, S4, R1c.

These need a programmer's setup (git, Python, the repositories' own scripts); the box's permission system refused
running code from cloned repositories.

- **Timbre-Trap** (the lane's one concrete job): its checkpoint `tt-orig.pt` is 11,353,410 bytes (from the Space
  `cwitkowitz/timbre-trap`, which was in RUNTIME_ERROR). Have a coding agent on the laptop run Timbre-Trap's
  `model.transcribe()` on `S2n.wav`, `S3.wav` and `R1c.wav` with the README's settings and save the multi-pitch frames
  as JSON in the layout of the lane's Essentia multi-pitch outputs (`{"times": [...], "freqs_hz": [[...], ...]}`). The
  lane's runner `lanes/audio-to-notes/scripts/run_timbretrap.py` follows the repository's `experiments/comparison.py`
  (threshold 0.5 after peak picking).
- **MR-MT3** (optional): clone https://github.com/gudgud96/MR-MT3, take `mt3.pth` or `slakh_f1_0.65.pth` from the
  Hugging Face repository `gudgud1014/MR-MT3`, run `InferenceHandler(...).inference(...)` from `inference.py` on
  `S2n.wav`, `S4.wav` and `R1c.wav`.
- **mt3-pytorch** (optional): clone https://github.com/kunato/mt3-pytorch (its `pretrained/mt3.pth` is a Git LFS file
  of 183,672,643 bytes) and run the README's `InferenceHandler('./pretrained').inference('<clip>.wav')` on the same
  clips; its `requirements.txt` pins `ddsp==3.3.4`, whose dependency `crepe` downloads weights from github.com at
  install time.
- **hFT-Transformer**: no steps; a piano model whose README lists GPU machines and whose checkpoints are CC BY-NC-SA
  4.0 (two other piano models, Transkun and ByteDance, ran on the box).

Send back: the JSON files (Timbre-Trap), the `.mid` files, the time per clip and the GPU or CPU used.

### T70 · PENN (FCNF0++ pitch tracker) (audio-to-notes 12)

GPU: no (the README: "--gpu GPU The index of the gpu to perform inference on. Defaults to CPU") · checkpoint
107,245,425 bytes (Hugging Face `maxrmorrison/fcnf0-plus-plus`, card license MIT), fetched on first use · clips: S1,
R1b, `S4_stem_lead.wav`.

Not run on the box: `import penn` failed because its decoder package torbi 1.4.1 ships compiled files only for torch
2.6 to 2.11, and the box had 2.15 ("Could not find any lib files matching version pt215cpu"; runs r0399, r0423). The
Windows wheel holds files for the same torch versions.

1. `py -3.11 -m pip install "torch<2.12" "torchaudio<2.12" penn`
2. `cd C:\gtr\clips`, `py -3.11 -m penn --files S1.wav R1b.wav S4_stem_lead.wav` (`--gpu 0` needs a CUDA build of
   torch; whether step 1 installs one on Windows is UNVERIFIED).

Send back: the files it writes next to each WAV (`S1-pitch.pt`, `S1-periodicity.pt` ..., PyTorch tensor files), the
output of `py -3.11 -m pip show penn torbi torch`, any error text, the time per file.

### T71 · Melody research code: Deep Salience, melodyExtraction_JDC, melodyExtraction_SSL (audio-to-notes 13; fingerstyle-voices-taps 11)

GPU: no (JDC and SSL run on the CPU without `-gpu`) · the weights are inside each repository · clips: S1, R1b,
`S4_stem_lead.wav`, R2 (melody); S2n, S2s, R1c (bass, multi-pitch).

Not run on the box: each runs only from its own cloned repository, and running the Deep Salience clone's script was
refused; Deep Salience's `replicate.yaml` pins Python 2.7.15, `tensorflow==1.12.0`, `keras==2.0.3`, `librosa==0.5.0`,
and the box has no Python 2.7.

- **Deep Salience, Docker** (the fingerstyle lane's route): `cd C:\gtr`, `git clone
  https://github.com/rabitt/ismir2017-deepsalience`, `docker run -it --rm -v C:\gtr:/work python:2.7 bash`. Inside:
  `pip install tensorflow==1.12.0 keras==2.0.3 librosa==0.5.0`, `mkdir -p /work/ds_out`,
  `cd /work/ismir2017-deepsalience/predict` (the script loads `weights/<task>.h5` relative to the current folder, and
  the weights are in `predict/weights/`), then:
  - fingerstyle lane: `python predict_on_audio.py /work/clips/S2n.wav bass /work/ds_out -f singlef0` and the same with
    `melody2`; both again for `/work/clips/S2s.wav`;
  - audio-to-notes lane: `python predict_on_audio.py /work/clips/S1.wav melody2 /work/ds_out -f singlef0` for S1,
    R1b, `S4_stem_lead.wav` and R2, and `python predict_on_audio.py /work/clips/S2n.wav multif0 /work/ds_out -f
    multif0` for S2n and R1c (tasks: "all, bass, melody1, melody2, melody3, multif0, pitch, vocal").
  (The audio-to-notes lane wrote the command from the repository root as `predict/predict_on_audio.py`; the
  fingerstyle lane's reading of where the weights load from is why this runs from `predict/`.)
- **melodyExtraction_JDC and _SSL** (a job for a coding agent, which may adjust versions but not the code and reports
  what it changed; whether these versions install on Windows today is UNVERIFIED): JDC: `git clone
  https://github.com/keums/melodyExtraction_JDC`; Python 3.6, Keras 2.2.2, librosa 0.6.2, madmom 0.16.1 and a
  TensorFlow backend (the repository names no TensorFlow version); `python melodyExtraction_JDC.py -p
  C:\gtr\clips\S1.wav -o out` and the same for R1b, `S4_stem_lead.wav`, R2. SSL: `git clone
  https://github.com/keums/melodyExtraction_SSL`; Python 3.7, Keras 2.3.0, librosa 0.7.0, madmom 0.16.1;
  `python melodyExtraction_NS.py -p C:\gtr\clips\S1.wav -o out` and the same three clips.

Send back: every output file (`<name>_<task>_singlef0.csv` or `_multif0.csv`; `pitch_<name>.txt` from JDC and SSL),
the install commands that worked, `pip freeze` of each environment, the time per clip, CPU or GPU, and any error lines.

### T72 · `mt3-infer` and `yourmt3`: MT3-family models from PyPI (audio-to-notes 14)

GPU: optional · both are third-party repackagings, not the model authors' releases: `mt3-infer` (MIT,
https://github.com/openmirlab/mt3-infer) and `yourmt3` (no license stated anywhere in the package; weights in the
Hugging Face repository `shethjenil/Audio2Midi_Models`) · clips: S2n, R1c, `S4_stem_guitar.wav`.

Not run on the box: both installed from PyPI, but running them was refused ("[Code from External]").

1. mt3-infer 0.2.0, in a new environment: `pip install mt3-infer==0.2.0`. Its default model (`mt3_pytorch`) downloads
   by cloning https://github.com/kunato/mt3-pytorch and running `git lfs pull`, so Git and Git LFS must be installed;
   the checkpoint is about 176 MB. Per clip: `mt3-infer transcribe C:\gtr\clips\S2n.wav -o S2n.mt3infer.mid --device cpu`
   (options `-m/--model`, `-d/--device auto|cuda|cpu`, `--no-download`). Optional second pass with `-m mr_mt3`.
2. yourmt3 0.1.4, in another new environment: `pip install yourmt3==0.1.4 huggingface_hub`, then a short script:
   `from huggingface_hub import hf_hub_download`, `from yourmt3 import YMT3`,
   `m = YMT3(hf_hub_download("shethjenil/Audio2Midi_Models", "YPTF+Single.pt"), "YPTF+Single")`, and per clip
   `m.predict(r"C:\gtr\clips\S2n.wav", output_path="S2n.yourmt3.mid")` (`YPTF+Single.pt`, 121,781,787 bytes, is the
   smallest of the six YourMT3 `.pt` files there). Which torch build pip picks on Windows is UNVERIFIED.

Send back: the `.mid` files, the time per clip and CPU or GPU, `pip freeze` of each environment, the list of files
under `.mt3_checkpoints` (mt3-infer), any error text.

### T73 · Piano and singing-voice transcribers the lane listed but did not try (audio-to-notes trials, "From the docs lane's survey, not run"; written for this file)

A job for a coding agent on the laptop. The audio-to-notes trials list Aria-AMT, Onsets and Velocities (piano
models), SOME, GAME and ROSVOT (singing-voice transcribers) as "None attempted, for time and disk"; VocalParse is not
in the trials: the lane's docs verifier (`verify-docs-audio-to-notes`) added it to `survey.md` (item 35) and
`tools.json`. All run from cloned repositories. The facts below are the lane's `survey.md` quotes of each
README; nothing was run. Clips: the piano models on S2n and R1c (where the two piano models that ran, Transkun and
ByteDance, were scored); the singing models on `S4_stem_lead.wav` (a "Voice Oohs" line with a known melody) and R2.

- **Aria-AMT** (https://github.com/EleutherAI/aria-amt; code Apache-2.0; "Requires Python 3.11"; `pip install -e .`
  from a clone): weights
  `https://huggingface.co/datasets/loubb/aria-midi/resolve/main/piano-medium-double-1.0.safetensors` (446,577,344
  bytes; the dataset card: `license: cc-by-nc-sa-4.0`); command `aria-amt transcribe medium-double
  <path-to-checkpoint> -load_path <path-to-audio> -save_dir <dir> -bs 1 -compile`; writes `<input stem>.mid`. Its
  `transcribe` function begins with `assert cuda_is_available(), "CUDA device not found"`, so it needs a CUDA GPU.
- **Onsets and Velocities** (https://github.com/andres-fr/iamusica_training; GPL-3.0): the pretrained model is in the
  repository (`assets/OnsetsAndVelocities_2023_03_04_09_53_53.289step=43500_f1=0.9675__0.9480.torch`, 12,722,905
  bytes); the lane quoted no inference command (UNVERIFIED: the agent reads the README).
- **SOME** (https://github.com/openvpi/SOME; MIT): `python infer.py --model CKPT_PATH --wav WAV_PATH` (saves a MIDI
  file); pretrained models from its releases page (not read). The README: "9x faster than real-time on an i5 12400
  CPU, and 300x on a 3080Ti GPU" (the authors' claim) and "SOME can produce non-integer MIDI values".
- **GAME** (https://github.com/openvpi/GAME; MIT; SOME's successor): `python infer.py extract [path-or-directory] -m
  [model-path] [--glob *.wav] [--output-formats mid,txt,csv]`; "tested under Python 3.12, PyTorch 2.8.0, CUDA 12.9";
  models from its releases or discussions (not read).
- **ROSVOT** (https://github.com/RickyL-2000/ROSVOT; code MIT; no license found for the weights): a conda environment
  with Python 3.9 and torch from the `cu118` index (README), the checkpoint from a Google Drive link ("Download the
  checkpoints.zip and unzip it under the project root"); "The checkpoint we provided was trained with Mandarin
  datasets."; the lane quoted no inference command (UNVERIFIED).
- **VocalParse** (https://github.com/pymaster17/VocalParse; code and weights Apache-2.0; `model.safetensors`
  4,076,867,480 bytes): `uv venv --python 3.10`, `uv pip install torch torchaudio --index-url
  https://download.pytorch.org/whl/cu124`, `uv pip install -e .` in a clone; `python -m vocalparse.demo --audio
  path/to/song.wav --checkpoint ./vocalparse-weights`. Input "Mono 16 kHz singing audio"; output a token string of
  lyrics, pitches, note values and BPM (no MIDI writer named); "Long audio segments (> 30s) should be pre-segmented
  before inference."; CPU inference is not described.

Send back: the outputs per tool and clip, the install commands that worked, the time per clip, CPU or GPU, and the
error text of any tool that did not run.

### T74 · S-KEY with Deezer's own PyTorch code (chords-beats-key 3; optional)

GPU: optional (`--device cuda`) · license: the README says "You may use the model weights only for non-commercial
research purposes" · clips: S3, S4, S2n, S5capo2, S5dropd, S7flat30, R1a, R1b, R1c, R2.

The same weights ran on the box through a community ONNX export (gap round 1), so the record has S-KEY keys for these
clips; this run shows whether Deezer's own code gives the same labels.

1. `cd C:\gtr`, `git clone https://github.com/deezer/skey`, `cd skey`, `pip install poetry`, `poetry install`
2. Per clip, the README's command: `poetry skey ..\clips\S3.wav --device cpu` (if poetry rejects it, `poetry run skey
   ...` is the usual form: UNVERIFIED).

Send back: the printed key for each clip (or the `prediction/predictions.csv` it writes when given a folder) and the
time of each run.

### T75 · All-In-One (allin1): a GPU timing (chords-beats-key 5; optional)

GPU: yes (PyTorch's CUDA build) · clips: S4, R1a, R1c, R2, R2full.

It ran on the box's CPU in gap round 1 (2 cores, R2full included), so this only adds a GPU time. Each run first
separates stems with Demucs, so the time includes separation.

1. Python 3.8 or newer (PyPI `allin1` 1.1.0) and CUDA PyTorch.
2. NATTEN, which the README says to "Build from source" on Windows: `pip install ninja`, `git clone
   https://github.com/SHI-Labs/NATTEN`, `cd NATTEN`, then `git checkout v0.17.4` (allin1 1.1.0 imports
   `natten1dqkrpb`, `natten1dav`, `natten2dqkrpb` and `natten2dav`, which NATTEN dropped in 0.17.5; 0.17.3 ran on the
   box; 0.17.4 did not import on Python 3.9 but should on 3.10 or newer: UNVERIFIED), then `make`. `make` is not part
   of Windows or of the setup above. Whether this builds on Windows with your PyTorch and CUDA was not checked
   (UNVERIFIED).
3. `pip install git+https://github.com/CPJKU/madmom`, then `pip install allin1` (both from the allin1 README).
4. `allin1 C:\gtr\clips\S4.wav -o out`, and the same for R1a, R1c, R2 and R2full.

Send back: the JSON files in `out` (keys `path`, `bpm`, `beats`, `downbeats`, `beat_positions`, `segments`) and how
long the R2full run took.

### T76 · tempo-cnn on Windows (chords-beats-key 6; optional)

GPU: no · it ran on the box in gap round 1 (eight tempo models and the meter model on ten clips) · clips: S3, S4, S2n,
S7flat30, R1a, R1b, R1c, R2, R2full.

1. Python 3.9, 3.10 or 3.11 (PyPI: `<3.12,>=3.9`): `pip install tempocnn` (it installs TensorFlow 2.17.0).
2. Per clip: `tempo -i C:\gtr\clips\S3.wav`.

Send back: the printed tempo per clip and the time each took.

### T77 · Guitar open-string tuning classifier (Hulme et al.) (chords-beats-key 9)

GPU: not stated · its evaluation code's five classes: DADGAD, Drop D, Open D, Open G and Standard · clips: S5dropd
(truth Drop D), S2n (truth Standard).

A new search in gap round 1 found no other open-string tuning or capo detector from audio with published weights or a
package, so this is the only candidate. It is research code; the README describes evaluation scripts and keeps models
and test sets on Google Drive.

1. Clone https://github.com/edhulme/guitar-tuning-classification, `pip install tensorflow matplotlib scikit-learn
   seaborn` (README), and download the models from the README's Google Drive link.
2. Run its classifier on the two clips. The README documents evaluation on its own test sets ("Run model evaluation on
   synthetic data", "on authentic data", with `eval_synthetic_songs.py` and `eval_authentic_songs.py`) and training,
   and gives no command for classifying a new audio file, so this step needs code that is not in the repository.

Send back: the predicted class for each clip, or the error message if it cannot take a new file.

### T78 · STONE (Deezer): key signature, and key and mode (chords-beats-key 10; Docker)

GPU: no (`inference.py` sets `device = "cpu"`, line 167) · checkpoints in the repository: `semisupervised_ks_mode.pt`
764,986 bytes, `semitone_ks.pt` 1,307,770 bytes · license: no LICENSE file and no license statement in the repository
· clips: S3, S4, R1a, R1b, R1c, R2 (truth keys: S3 G major, S4 D major, R1a Ab minor, R1b C# major, R1c G major; R2
none, the artist's page lists D# minor).

Not attempted on the box: it installs from its cloned repository, and its pinned tensorflow 2.12 download alone was
over the disk notice. Full steps: [lanes/chords-beats-key/for-aaron.md](lanes/chords-beats-key/for-aaron.md), section 10.
Short form (repository at commit 0c5f72d):

1. `git clone https://github.com/deezer/stone`, `cd stone`, `docker build . -t stone:latest` (the Dockerfile starts
   from `nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04` and runs `poetry install --no-root`).
2. Make a folder `clips` inside `stone` holding only the six clips (`inference.py` reads every `*.wav` in it).
3. `docker run -ti --gpus all -v ${PWD}:/workspace/ --entrypoint bash stone:latest` (the README writes `-v
   ./:/workspace/`; `${PWD}` is the usual PowerShell form: UNVERIFIED; `--gpus all` may be left out).
4. In the container, from `/workspace`: `time poetry run python -m inference ckpt/semisupervised_ks_mode.pt clips -e
   wav -tt ks_mode` and `time poetry run python -m inference ckpt/semitone_ks.pt clips -e wav -tt ks`. They write
   `clips/results/<ckpt_name>/values.npz` (the README says `results/<ckpt_name>/results.npz`; the code writes the
   former).
5. Copy the lane's `scripts/stone_npz_labels.py` into `stone` and run `poetry run python stone_npz_labels.py
   clips/results/semisupervised_ks_mode/values.npz ks_mode` and `... clips/results/semitone_ks/values.npz ks`.

Send back: both `values.npz` files, the two `.labels.tsv` files, the console output and the two `time` lines.

### T79 · key-cnn: global key (chords-beats-key 11)

GPU: no · models in the repository: `deepspec_k16` (default, 3,659,832 bytes), `deepsquare_k8` (3,712,064 bytes) ·
requirement: Python 3.7 is the newest Python with both the pinned TensorFlow 1.15.2 and numpy 1.16.0 wheels for
Windows (PyPI, read 2026-11-11 and 2026-11-12) · license: AGPL-3.0 for "Source code and models" · clips: S3, S4, R1a,
R1b, R1c, R2.

Not attempted on the box: it installs from its cloned repository (`setup.py install`, "using Python 3.6").

1. Install Python 3.7.9 from https://www.python.org/ftp/python/3.7.9/python-3.7.9-amd64.exe (HTTP 200 on 2026-11-11).
2. `cd C:\gtr`, `py -3.7 -m venv keycnn`, `.\keycnn\Scripts\Activate.ps1`, `git clone
   https://github.com/hendriks73/key-cnn.git`, `cd key-cnn`, `python setup.py install` (if it fails while fetching
   dependencies, `pip install .`: UNVERIFIED). If loading the model fails with an h5py error, `pip install "h5py<3"`
   (UNVERIFIED).
3. Copy the six clips into `key-cnn\clips` and make an empty `out` folder (`bin/key` does not create it). Then:
   `Measure-Command { python ..\keycnn\Scripts\key --mirex -d out -e .deepspec.txt -i clips\S3.wav clips\S4.wav clips\R1a.wav clips\R1b.wav clips\R1c.wav clips\R2.wav }`
   and the same with `-m deepsquare -e .deepsquare.txt` (`--mirex` prints "tonic<TAB>mode"; whether the installed
   script without a `.py` ending starts this way on Windows is UNVERIFIED).

Send back: the `out` folder (one file per clip and model), the console output and the two times.

### T80 · BeatNet+: beats and downbeats (chords-beats-key 12; WSL)

GPU: no (a CPU torch works; uv's `--torch-backend cpu`) · weights in the repository (`generic_weights.pt`,
`generic_main_weights.pt`, `af_non_percussive_weights.pt`, about 3.07 MB each) · license: no license file or statement
in the repository; its training data include MUSDB18 ("other-nc") and the RWC databases · clips: S3, S4, R1a, R1b,
R1c, R2.

Not attempted on the box: it installs from its cloned repository. The lane's run script `scripts/beatnetplus_run.py`
was written but never run. Full steps: [lanes/chords-beats-key/for-aaron.md](lanes/chords-beats-key/for-aaron.md),
section 12. Short form, in the Ubuntu window:

1. `sudo apt install git build-essential`, then install uv (https://docs.astral.sh/uv/).
2. `uv venv --python 3.9 bnp`, `source bnp/bin/activate`, `uv pip install "numpy==1.23.5" "scipy<1.11" mido "cython<3"
   "setuptools<81" wheel soundfile`, `uv pip install --no-build-isolation madmom==0.16.1`, `uv pip install torch
   "librosa==0.10.2.post1" matplotlib pyyaml tensorboard "numpy==1.23.5"`.
3. `git clone https://github.com/mjhydri/BeatNet-Plus.git`, `cd BeatNet-Plus`, `uv pip install --no-deps -e .`
4. Copy `beatnetplus_run.py` and the clips (`clips/`) into the clone; per clip `python beatnetplus_run.py --audio
   clips/S3.wav --outdir out/S3` (it runs two weight files, each online and offline, and writes beat and downbeat
   files and `timings_bnp.json`).

Send back: the whole `out` folder and the console output.

### T81 · mixedkey (Go module): key from mono PCM (chords-beats-key 14)

GPU: no · requirement: "Requires Go 1.24 or later." (README) · license: MIT · clips: S3, S4, S2n, S5capo2, S5dropd,
S7flat30, R1a, R1b, R1c, R2 (all 16-bit PCM WAV, which the program reads).

Not run on the box: the `go get` and `go build` were refused ("[Code from External]"). The lane's glue program
`lanes/chords-beats-key/scripts/gap2/mixedkey_run/main.go` passed a type check against a stub of mixedkey's
declarations, but was never built against mixedkey itself, so a first build may need a small fix (UNVERIFIED).

1. Install Go 1.24 or later from https://go.dev/dl/.
2. In an empty folder `C:\gtr\mixedkey_run` holding `main.go`: `go mod init mixedkeyrun`, `go get
   github.com/cabbagekobe/mixedkey@v0.1.0`, `go build -o mixedkey_run.exe .`
3. Copy the ten clips into a `clips` folder there and make an empty `out` folder, then:
   `Measure-Command { .\mixedkey_run.exe out clips\S3.wav clips\S4.wav clips\S2n.wav clips\S5capo2.wav clips\S5dropd.wav clips\S7flat30.wav clips\R1a.wav clips\R1b.wav clips\R1c.wav clips\R2.wav }`

Send back: the `out` folder (per clip `<clip>.mixedkey.json` and four `<clip>.key_mixedkey_<profile>.txt`), the
console output and the time; if the build fails, the error text.

### T82 · `hf_midi_transcription`: the authors' own command for the Riley et al. guitar models (guitar-tab 2)

GPU: yes for `--device cuda` · weights: https://huggingface.co/xavriley/midi-transcription-models (card license MIT) ·
output: notes only, no strings or frets · clips: S2n, S3, R1b, R1c.

The box ran both checkpoints through Kong's PyPI package and a few lines of its own (`guitar-fl.pth` on S2n and R1c;
`guitar-gaps.pth` on S2n, S3, R1b and R1c); installing the authors' package from its clone was refused. This gives
the authors' own pipeline (their fork of the inference package, batch size 8) for comparison.

1. `cd C:\gtr`, `git clone https://github.com/xavriley/hf_midi_transcription`, `cd hf_midi_transcription`,
   `uv venv .venv --python 3.11`, `uv pip install --python .venv\Scripts\python.exe -e .`
2. `.venv\Scripts\python.exe -c "import torch; print(torch.cuda.is_available())"` must print `True`; if not, install
   the CUDA build of torch as pytorch.org describes and repeat.
3. `.venv\Scripts\midi_transcription C:\gtr\clips\S2n.wav S2n_gaps.mid --instrument guitar --device cuda --verbose`,
   and the same for `S3.wav`, `R1b.wav`, `R1c.wav` (`guitar` uses `guitar-gaps.pth`, downloaded on first use). For the
   François Leduc model, download `guitar-fl.pth` from the Hugging Face page into the folder and add `--checkpoint
   guitar-fl.pth` to the S2n and R1c commands (outputs `S2n_fl.mid`, `R1c_fl.mid`).

Send back: the `.mid` files and the console text of each run (with `--verbose` the CLI prints a `Checkpoint:` line).

### T83 · gtrsnipe: MIDI to tab, with tuning, capo and a hand-corrected string (guitar-tab 4)

GPU: no · license (the docs lane, re-read 2026-11-11 at commit `a9be933`): PolyForm Noncommercial 1.0.0 plus a paid
commercial licence · files: the guitar-tab lane's one-track MIDI files `lanes/guitar-tab/samples/lane-inputs/<id>.merged.mid`.

Not run on the box: it is not on PyPI (HTTP 404 on 2026-11-11), and the install from its repository was refused
("[Code from External]").

1. `cd C:\gtr`, `git clone https://github.com/scottvr/gtrsnipe`, `cd gtrsnipe`, `uv venv .venv --python 3.11`,
   `uv pip install --python .venv\Scripts\python.exe -e .`; copy the `*.merged.mid` files next to it.
2. `.venv\Scripts\gtrsnipe -i S2n.merged.mid -o S2n.tab`, and the same for S3, R1a, R1b, R1c.
3. Drop D: `.venv\Scripts\gtrsnipe -i S5dropd.merged.mid -o S5dropd_std.tab` and
   `.venv\Scripts\gtrsnipe -i S5dropd.merged.mid -o S5dropd_dropD.tab --tuning-pitches D2,A2,D3,G3,B3,E4`.
4. Capo: `.venv\Scripts\gtrsnipe -i S5capo2.merged.mid -o S5capo2_nocapo.tab` and
   `.venv\Scripts\gtrsnipe -i S5capo2.merged.mid -o S5capo2_capo2.tab --capo 2` ("Specify a capo position. All fret
   numbers will be relative to the capo.").
5. `.venv\Scripts\gtrsnipe --help > help.txt`
6. A corrected string (README at `a9be933`: "**`--no-refinger`** never moves a note to another string", "**`--refinger`**
   always lets the mapper choose", and a `.tab` input keeps its own fingering by default): open `S2n.tab` in Notepad.
   The first chord after the empty count-in bar is G2 with G3 (2.143 s into the clip; the correct tab has G2 on the low
   E string at fret 3 and G3 on the G string open). Note where gtrsnipe put that G3, then move it to the D string at
   fret 5 (same pitch, one string lower): delete its digit on its line and write `5` on the D line in the same column,
   keeping every line the same length. Save as `S2n_pinned.tab`. (If gtrsnipe had already put it on the D string at
   fret 5, move it to the G string open, `0`, and say so.) Then:
   `.venv\Scripts\gtrsnipe -i S2n_pinned.tab -o S2n_pinned_kept.tab`,
   `.venv\Scripts\gtrsnipe -i S2n_pinned.tab -o S2n_pinned_norefinger.tab --no-refinger`,
   `.venv\Scripts\gtrsnipe -i S2n_pinned.tab -o S2n_pinned_refinger.tab --refinger`,
   `.venv\Scripts\gtrsnipe -i S2n_pinned.tab -o S2n_pinned.mid`. The files answer whether the moved note stays on the D
   string and whether the other 89 notes keep their strings and frets.

Send back: all `.tab` files (including `S2n_pinned.tab` and the three `S2n_pinned_*` outputs), `S2n_pinned.mid` and
`help.txt`.

### T84 · ADTOF-pytorch: drum transcription on the taps (fingerstyle-voices-taps 1)

GPU: yes as written (`--device cuda`; its CLI switches to the CPU when CUDA is missing, per the fingerstyle survey) ·
run time: none in its README · license: no license file; the weights are converted from ADTOF, whose README says "The
content of this repository is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
License" · clips: S6taps, `S6taps_stem_taps.wav`, S2s, R3a (`R3a.wav`).

Not run on the box: installing the cloned repository and running its source were refused.

1. `cd C:\gtr`, `git clone https://github.com/xavriley/ADTOF-pytorch`, `cd ADTOF-pytorch`, `py -3.11 -m venv venv`,
   `.\venv\Scripts\Activate.ps1`, CUDA PyTorch, then `pip install -e .` (the README's install line).
2. `adtof --audio C:\gtr\clips\S6taps.wav --out S6taps_mix.mid --device cuda`
   `adtof --audio C:\gtr\clips\S6taps_stem_taps.wav --out S6taps_tapsonly.mid --device cuda`
   `adtof --audio C:\gtr\clips\S2s.wav --out S2s_notaps.mid --device cuda`
   `adtof --audio C:\gtr\clips\R3a.wav --out R3a.mid --device cuda`

Send back: the four `.mid` files, a screenshot of the PowerShell window, the seconds of each run.

### T85 · Cluster and Separate (piano_svsep): voice and staff separation of a score (fingerstyle-voices-taps 4)

GPU: no · model in the repository: `pretrained_models/model.ckpt` 36,495,754 bytes · license: MIT · files: the
lane's `samples/voice-split/S2n_truth_merged_single_track.musicxml` and `S5dropd_truth_merged_single_track.musicxml`
(each holds a clip's 90 notes as one part, with music21's own voice numbers where music21 split overlapping notes,
made without the truth labels).

Not run on the box: installing the clone was refused.

1. `cd C:\gtr`, `git clone https://github.com/CPJKU/piano_svsep`, `cd piano_svsep`, `py -3.11 -m venv venv`,
   `.\venv\Scripts\Activate.ps1`.
2. Install PyTorch 2.8.0 (pytorch.org lists older versions under "Previous PyTorch Versions"; `setup.py` pins
   `torch==2.8.0` with `torch_geometric`, `torch-scatter`, `partitura==1.8.0` and `scikit-learn==1.6.0`, so any other
   torch would be replaced), then `pip install .`
3. Copy the two MusicXML files into the folder, then
   `python launch_scripts/predict.py --model_path pretrained_models/model.ckpt --score_path S2n_truth_merged_single_track.musicxml --save_path S2n_pred.mei`
   and the same with `S5dropd` in both file names.

Send back: `S2n_pred.mei`, `S5dropd_pred.mei` and a screenshot. The orchestrator scores them with
`scripts/gap1_score_svsep.py S2n_pred.mei S2n` (and `S5dropd`), the way partitura and music21 were counted.

### T86 · McLeod and Steedman voice separation (Java) (fingerstyle-voices-taps 5)

GPU: no · license: MIT (`License` file) · file: the lane's `samples/voice-split/S2n_truth_merged_single_track.mid`.

Not run on the box: the verifier's `make` of the cloned repository was refused.

1. Install a Java JDK (for example Temurin 21 from https://adoptium.net/).
2. These lines are for Git Bash (installed with Git for Windows), as the lane wrote them: `cd /c/gtr`, `git clone
   https://github.com/apmcleod/voice-splitting`, `cd voice-splitting`, `mkdir -p bin`, `javac -d bin -cp src
   src/*/*/*.java`, `javac -d bin -cp src src/*/*/*/*.java` (the repository's `Makefile` runs these).
3. Copy the MIDI file into `/c/gtr/voice-splitting` and run the README's quick-start command:
   `java -cp bin voicesplitting.voice.hmm.HmmVoiceSplittingModelTester -w voice S2n_truth_merged_single_track.mid`
   (it writes the voices as new MIDI files into the folder `voice`).

Send back: the files in `voice` and a screenshot.

### T87 · ADT_STR: drum transcription (fingerstyle-voices-taps 6)

GPU: optional (on a machine without CUDA its code picks the CPU: `select_inference_device()`, "Prefer CUDA, then Apple
MPS, else CPU.", read, not run) · checkpoint: Hugging Face `Pierfrancesco/adt-str`, folder `setting-tau-0.8`
(`model.safetensors` 289,134,056 bytes, plus `config.json` and `adt_config.yaml`) · install pins `torch==2.8.0` and
`torchaudio==2.8.0` · license: CC BY-SA 4.0 per its GitHub README · clips: S6taps, `S6taps_stem_taps.wav`, S2s, R3a.

Not run on the box: its README's install was refused.

1. `cd C:\gtr`, `git clone https://github.com/pier-maker92/ADT_STR`, `cd ADT_STR`, `pip install uv`,
   `uv venv .venv --python 3.12`, `uv pip install -r pyproject.toml`, `.\.venv\Scripts\Activate.ps1`
2. `python -c "from huggingface_hub import snapshot_download; snapshot_download('Pierfrancesco/adt-str', allow_patterns=['setting-tau-0.8/*'], local_dir=r'C:\gtr\adt-str-hf')"`
3. Per clip: `python inference --checkpoint C:\gtr\adt-str-hf\setting-tau-0.8 --input C:\gtr\clips\S6taps.wav --output_path outputs`
   (`inference` is a file in the repository, next to `inference.py`; the README says the checkpoint can be "a direct
   path to a checkpoint directory").

Send back: the MIDI files from `outputs` and a screenshot.

### T88 · Inverse Drum Machine: drum separation with a manual onset override (fingerstyle-voices-taps 7)

GPU: optional (the script picks CUDA when available) · model in the repository: `pretrained/idm-44-train-kits/` (a
2,544,694-byte checkpoint) · requirement: a Python 3.10+ environment and Poetry (README) · clip: S6taps.

Its README: "To override the transcription, you can pass a dictionary with the onsets to the `separate` function" (the
kind of user correction the planned app needs). Not run on the box: cloned-repository code.

1. `cd C:\gtr`, `git clone https://github.com/bernardo-torres/inverse-drum-machine`, `cd inverse-drum-machine`, install
   Poetry as https://python-poetry.org/docs/ describes, then `poetry install`.
2. Make `run_idm.py` in that folder with the README's two examples combined (the override is the `taps` list of
   `S6taps.truth.json`: `thump` as `KD`, `slap` as `SD`):

   ```python
   import torch
   from idm.inference import load_model, separate
   device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
   model, name = load_model('idm-44-train-kits', device, log_dir="pretrained")
   print(model.train_classes)
   audio = r"C:\gtr\clips\S6taps.wav"
   separate(audio, model, output_dir=r"C:\gtr\idm_out\as_is", masking='wiener', alpha=1.0)
   onsets = {
       'KD': [2.143, 6.161, 10.446, 10.714, 14.732, 19.018, 19.286, 23.304],
       'SD': [2.679, 3.75, 4.821, 5.893, 6.964, 8.036, 9.107, 10.179, 11.25, 12.321, 13.393, 14.464, 15.536,
              16.607, 17.679, 18.75, 19.821, 20.893, 21.964, 23.036, 24.107, 25.179, 26.25, 27.321],
   }
   separate(audio, model, output_dir=r"C:\gtr\idm_out\override", masking='wiener', alpha=1.0, onsets=onsets)
   ```

3. `poetry run python run_idm.py`

Send back: the stem WAVs in `C:\gtr\idm_out`, the printed class list and a screenshot.

### T89 · LarsNet: 5-stem drum separation (kick, snare, toms, hi-hat, cymbals) (fingerstyle-voices-taps 9)

GPU: optional (`-d cuda:0`; `-d` defaults to `cpu`) · checkpoints: 562 MB from the README's Google Drive link,
"licensed under CC BY-NC 4.0" · input: `S6taps_stem_taps.wav` (and, if the orchestrator gives it to you, the
source-separation lane's htdemucs_6s drums stem of S6taps).

Not run on the box: its dependencies installed, but running `separate.py` was refused.

1. `cd C:\gtr`, `git clone https://github.com/polimi-ispl/larsnet`, `cd larsnet`, `py -3.11 -m venv venv`,
   `.\venv\Scripts\Activate.ps1`, PyTorch with torchaudio (CUDA), then `pip install soundfile pyyaml tqdm` (the
   README lists no install command; its `requirements.txt` is a conda export for "platform: linux-64"; these are what
   the scripts import besides torch and torchaudio).
2. Download the checkpoints; the README: "unzip the folder and place it in the project directory".
3. Make `C:\gtr\larsnet_in` holding `S6taps_stem_taps.wav` (and the drums stem, renamed `S6taps_htdemucs6s_drums.wav`),
   then `python separate.py -i C:\gtr\larsnet_in -o C:\gtr\larsnet_out -d cuda:0`.

Send back: the folder `C:\gtr\larsnet_out` and a screenshot. The question it answers: does the side-stick "slap" land
in Snare and the bass-drum "thump" in Kick Drum.

### T90 · MidiBERT-Piano melody extraction: start with a check (fingerstyle-voices-taps 13)

GPU: no (`--cpu`) · requirement: Python 3.9 (issue #11: "Python 3.8 and 3.9 works fine for me") · files: the six MIDI
files in the lane's `samples/midibert/`.

Not run on the box: no checkpoint its published code can load. The README's Google Drive folder answers "Error 404
(Not Found)"; in issue #18 the owner re-uploaded two checkpoints in June 2026 whose input layer has six token fields
where the code has four, and wrote on 2026-10-12 "it appears the original model checkpoint has been lost". Full steps:
[lanes/fingerstyle-voices-taps/for-aaron.md](lanes/fingerstyle-voices-taps/for-aaron.md), section 13. Short form:

1. Open https://github.com/wazenmai/MIDI-BERT/issues/18 and read any comment after 12 October 2026. If none gives the
   code for the six-field checkpoints or a checkpoint for the published code, stop and send back "nothing new in issue
   18".
2. Otherwise: Python 3.9, `cd C:\gtr`, `git clone https://github.com/wazenmai/MIDI-BERT`, `cd MIDI-BERT`, `py -3.9 -m
   venv venv`, `.\venv\Scripts\Activate.ps1`, `pip install -r requirements.txt`, then `pip install "numpy<1.24"` (the
   code uses `np.int`; not tried anywhere). Put the melody checkpoint at
   `result\finetune\melody_default\model_best.ckpt` and the six `*_480tpb.mid` files in the folder.
3. `$env:PYTHONPATH = "."`, then
   `Get-ChildItem *_480tpb.mid | ForEach-Object { python melody_extraction/midibert/extract.py --input_path $_.Name --output_path ($_.BaseName + "_melody.mid") --ckpt result/finetune/melody_default/model_best.ckpt --cpu --bridge False }`

Send back: the six `*_melody.mid` files, a screenshot and the seconds; or the last 30 lines of the error. Optional, to
confirm the mismatch: the June 2026 `melody_model_best.ckpt` (1.34 GB, linked in the lane file) in step 2, and the
error text (one naming `in_linear.weight` or `word_emb.4` would confirm it).

### T91 · ADTLib: kick, snare and hi-hat onsets and a drum tab (fingerstyle-voices-taps 15; Docker)

GPU: no · requirement: its code imports `tensorflow.contrib` (TensorFlow 1.x only), whose last release (1.15.5) has
wheels only for Python 3.6 and 3.7, so it runs in a Python 3.7 container · clips: S6taps, `S6taps_stem_taps.wav`
(renamed `S6taps_taps.wav`), S2s. Nothing in this test was tried anywhere.

1. Copy the three files into `C:\gtr`. `docker run -it --rm -v C:\gtr:/work python:3.7 bash` (Docker Hub lists the
   `python:3.7` tag, last updated 2023-09-21).
2. Inside, one line at a time: `pip install "numpy==1.18.5" cython`, `pip install --no-build-isolation "madmom==0.16.1"`,
   `pip install "tensorflow==1.15.5" "h5py<=2.10.0"`, `pip install "ADTLib==2.1.2"`
3. `mkdir -p /work/adt_out`, `cd /work`, `ADT -od /work/adt_out S6taps.wav S6taps_taps.wav S2s.wav` (its usage page:
   "ADT [-h] [-od {None,dir}] [-o {yes,no}] [-ot {yes,no}] [I [I ...]]"; it writes onset times to a `.txt` file and a
   drum tab to a PDF).

Send back: everything in `C:\gtr\adt_out` (and any `.txt` or `.pdf` it wrote into `C:\gtr`), a screenshot and the
seconds; if an install line fails, its last 30 lines.

### T92 · Separate-and-Detect: five drum stems by latent diffusion, then onsets per stem (fingerstyle-voices-taps 16; WSL)

GPU: yes (its inference config asks for `accelerator: "gpu"`; how much GPU memory it needs is not stated in its
README) · size: one checkpoint and its two MusicLDM parts are about 6.4 GB · its environment files are conda files for
Linux with CUDA 11.6 builds of PyTorch · clips: S6taps, `S6taps_stem_taps.wav`, S2s. Nothing in this test was tried
anywhere.

Full steps (eight, with a manual patch and a config edit):
[lanes/fingerstyle-voices-taps/for-aaron.md](lanes/fingerstyle-voices-taps/for-aaron.md), section 16. Short form, in
the Ubuntu window: install Miniconda; `git clone https://github.com/ddman1101/Separate-and-detect`, `cd
Separate-and-detect`, `conda env create -f musicldm_env.yml`, `conda env create -f onset_detect.yml`; change line 23 of
the `onset_detect` environment's `madmom/processors.py` to `from collections.abc import MutableSequence`; `wget` the
three checkpoints (`msgld_obtb.ckpt` from Hugging Face, `vae-ckpt.ckpt` and `hifigan-ckpt.ckpt` from Zenodo record
10643148) into the repository folder; put the three clips in `test_data`; `sed -i "s#/PATH/TO/PROJECT#$PWD#g"
config/MSG-LD/integrated_musicldm_test_inference.yaml`; `conda activate musicldm_env`, `CUDA_VISIBLE_DEVICES=0 python
integrated_train.py --config config/MSG-LD/integrated_musicldm_test_inference.yaml --separate_only`; then `conda
activate onset_detect` and `python single_audio_onset_detection.py --input_audio <full path>/val_0/mix/<name>.wav
--output_dir ./transcription_results` for each file in `val_0/mix/`.

Send back: the `*_transcription.txt` files (lines `timestamp    drum_type`, types Kick, Snare, Toms, Hi_Hats,
Cymbals), the five stem WAVs of each input, the terminal output and the seconds each step took.

### T93 · HaMeR or Hamba: 3D hand mesh (video-hands-fretboard 2)

GPU: yes (HaMeR's README gives its install example for CUDA: "This is for CUDA 11.7, but you can adapt accordingly";
CPU use is not stated; Hamba's install is "for CUDA 11.7" too, plus mamba / VMamba builds) · account: the MANO hand
model needs a registered account at https://mano.is.tue.mpg.de; its license grants a "free of charge right" for
non-commercial research, education or artistic projects only ("Any other use, in particular any use for commercial
... purposes is prohibited") · inputs: the three stills and the 300 frames of R3a_cu.

The HaMeR web demo showed "BUILD_ERROR" on 2026-11-10.

1. Make an account on the MANO site (Sign Up), accept the license if you agree, and download the MANO models
   (`mano_v*_*.zip`); only `MANO_RIGHT.pkl` is needed.
2. Ask a coding agent on the laptop to install HaMeR from https://github.com/geopavlakos/hamer following its README,
   to put `MANO_RIGHT.pkl` in `_DATA/data/mano`, to put the three stills and R3a_cu's frames (`ffmpeg -i R3a_cu.mp4
   frames/%04d.png`) in one folder, and to run the README's demo command on it: `python demo.py --img_folder <folder>
   --out_folder demo_out --batch_size=48 --side_view --save_mesh --full_frame`.
3. Hamba (https://github.com/humansensinglab/Hamba; weights from a Google Drive link in its README; license CC BY-NC
   4.0) is the same procedure; its demo command is `python demo.py --checkpoint ckpts/hamba/checkpoints/hamba.ckpt
   --img_folder example_data --out_folder ./demo_out/example_data/ --full_frame` (with the folder of stills in place
   of `example_data`).

Send back: the `demo_out` folder and the run time per image.

### T94 · YOLO-World on your own machine (video-hands-fretboard 5; optional)

GPU: optional · first run downloads a 354 MB CLIP text model · YOLO-World v2 ran on the box in gap round 2 (run r0650),
so this is optional; its two public demo Spaces showed errors on 2026-11-10.

A coding agent on the laptop can run it with Ultralytics (`YOLO("yolov8s-worldv2.pt")`, `set_classes(["guitar",
"guitar neck", "fretboard", "headstock", "capo", "hand"])`) through the lane's script `scripts/run_openvocab.py
yoloworld <outdir> <weights dir>`. The script reads decoded frames from the box's paths (`LANE` and `CLIPS` in
`scripts/vhf_common.py`), so the agent decodes R3a and R3a_cu first (`ffmpeg -i <clip>.mp4 -vsync 0
<dir>/<prefix>_%04d.png`) and points those two settings at them. Send back: the `results.json` and the `frames/`
folder it writes.

### T95 · OpenPose, the full CMU program (video-hands-fretboard 8)

GPU: the installation doc's "Windows Portable Demo" section says "For maximum speed, you should use OpenPose in a
machine with a Nvidia GPU version" (re-read 2026-11-12); the CPU-only version's requirements: "Around 8GB of free RAM
memory." and "Highly recommended: a CPU with at least 8 cores." · models: about 500 Mb (its `Instructions.txt`) ·
license: OpenPose
is for non-commercial research use (commercial license through CMU) · clip: `R3a_cu.mp4`.

The box ran only OpenPose's hand model (a PyTorch port, with hand boxes taken from MediaPipe); the full program finds
the hands from its own body model.

1. Follow "Windows Portable Demo" in OpenPose's installation doc (`doc/installation/0_index.md`): update the NVIDIA
   driver, "Download the latest OpenPose version from the Releases section", then "Follow the `Instructions.txt` file
   inside the downloaded zip file to download the models required by OpenPose (about 500 Mb)".
2. In PowerShell, in the unzipped folder (flags from `doc/01_demo.md`):
   `bin\OpenPoseDemo.exe --video R3a_cu.mp4 --hand --write_json out\ --write_video out\R3a_cu_openpose.avi`

Send back: the `out\` folder (one JSON per frame), the output video, how long the run took (and any frame rate it
shows).

## Section 4. Desktop and phone apps, free or with a trial

None of these ran on the box (no Windows, macOS or phone; AnthemScore's Linux build was refused, Transcribe! was not
attempted). Prices, platforms and trial terms are as the vendors' pages showed them on the date given; check the price
on screen before paying anything. Where an installer or the program shows a license agreement, the apps-survey lane
asks for a copy of it, because several vendors link none on their web pages. For phone tests, copy the MP3s
(`S3.mp3`, `S5capo2.mp3`, `S5dropd.mp3`, `S7flat30.mp3`, `R2.mp3`, `S4.mp3`) to the phone first.

### T96 · Practice Pro - AI Music Tools: does it exist? (apps-survey 17c; phone)

Platform: iPhone or iPad (App Store) · cost: 0 · time: 2 minutes (lane's estimate).

A web search result (quoted in [GAPS.md](GAPS.md), row P3) describes an iOS app of this name with an "AI Guitar Tab
Generator ... synced with playback", App Store id 6754810269. From the box, `apps.apple.com/us/app/id6754810269`
answered HTTP 404 on 2026-11-10 and 2026-11-11, and Apple's lookup API found nothing under that id in nine stores.

1. Search the App Store for "Practice Pro AI Music Tools" and for "AI guitar tab generator".
2. If an app of that name is there: screenshot its listing (developer, version and date, price, the "In-App Purchases"
   list, any "License Agreement" link), tap "Developer Website" and "Privacy Policy" and screenshot them. Do not
   install it unless you want to.
3. If it is not there, write "not found" and the date in `notes.txt`.

Send back: the screenshots or the "not found" line.

### T97 · AnthemScore 6 desktop (apps-survey 9)

Platform: Windows 10/11 installer (also macOS and Linux) · cost: free trial ("Limited to first 30 seconds of each song
and 100 total transcriptions"; "By default the trial runs as the AnthemScore Professional edition"; "No account
creation needed, just download and run!") · time: about 10 minutes (lane's estimate) · clips: S2s, S5dropd, S5capo2,
R1a, R2.

On the box, unpacking its Linux AppImage was refused by the permission system. Its version history mentions fast note
finding on CUDA NVIDIA GPUs (4.2.0, 2019) and "Cuda 8.6 support for Windows" (4.12.0, 2021), and 6.3.0's program text
has a "Using Cuda" message; whether 6.3.0 uses the GPU on Windows is not known (the history says to look in the
"about" menu for the CUDA status). Whether the trial exports MIDI and MusicXML was not checked.

1. Download the Windows installer from https://www.lunaverus.com/download and install it. **Save the license text**:
   the site's terms say the license is "the "license.txt" file, which is included in every download of the software",
   but the box found no such file in the Linux build. Copy any license screen into `license.txt`, and look for a
   `license.txt` in the install folder.
2. Open `S2s.wav`. Set guitar tab as its FAQ describes: "Enter instrument settings and change the instrument to
   guitar. Then click the gear icon next to it and select "Tablature" under Staffs. Take a look at the number of frets
   and the string tunings under Tablature options and adjust as needed". Leave the rest default; time the
   transcription.
3. Export MIDI (`.mid`), MusicXML, and "Beat and Note Timing (.csv)". Screenshot the tab.
4. `S5dropd.wav`: before transcribing, set the strings to Drop D in the tablature options. Its documentation says
   "Strings should be set to the instrument's _written_, not _sounded_, pitches" ("With guitar and bass guitar, for
   example, this is an octave above the sounded pitch"), so the low string is written D3. Export as above.
5. `S5capo2.wav` with default settings (no capo setting was found in its documentation, FAQ or 6.3.0 program text),
   then `R1a.wav` and `R2.wav`; export each.

Send back: `license.txt`, all exports, screenshots, `notes.txt` with the time of each transcription and any CUDA
status shown.

### T98 · Transcribe! 9.70 (apps-survey 10)

Platform: Windows (also macOS, Linux) · cost: 30-day evaluation; "$39" to buy (read 2026-11-10) · time: about 10
minutes (lane's estimate) · clips: S3, S7flat30, S2s.

It does not write notes to a file ("Transcribe! does not output MIDI at all."), so this is mostly screenshots of its
on-screen guesses; chord guesses can be put into text blocks and saved to a text file (its help).

1. Download the Windows version from https://www.seventhstring.com/xscribe/download.html and install it.
2. Open `S3.wav`. View menu: turn on "Show Note Guesses" and "Show Chord Guesses"; Piano Roll menu: "Show Piano Roll".
   Wait for the piano roll to fill (a yellow band marks the parts not calculated yet).
3. Screenshot the piano roll for the whole clip, and the chord guess box at about 3, 9 and 15 seconds.
4. Optional, chord guesses as text: at each chord change, shift-click to see the chord guesses, right-click at the same
   point and pick the first chord offered (this inserts the chord name as a text block); then File > "Export Markers
   and Text Blocks" as `transcribe_S3_chords.txt`. Write in `notes.txt` whether the file has a time for each chord.
5. Open `S7flat30.wav`: out-of-tune note guesses show as red blobs; screenshot them. Then use the tuning adjustment (Fx
   window, Tuning page: octaves, semitones and cents) to centre the notes, and write down the cents setting, with its
   sign.
6. Open `S2s.wav` and screenshot the piano roll.

Send back: screenshots, `transcribe_S3_chords.txt` if made, `notes.txt` with the cents value for S7flat30.

### T99 · Melodyne 5 studio (apps-survey 11)

Platform: Windows or macOS ("Melodyne 5 studio for macOS" or "for Windows") · cost: 30-day trial (the trial page,
re-read 2026-11-12: "With the trial version, you can test the full range of functions of Melodyne for 30 days free of
charge with no obligation."; the lane's 2026-11-10 quote, "try it out for 30 days – free of charge and without
obligation", is not on that page now); "To register the trial version and each time the program is launched, an
Internet connection is necessary." and "The trial period can only be enjoyed once on each computer." · time:
about 10 minutes (lane's estimate) · clips: S2s, R1a, S7flat30.

Celemony says "Melodyne also recognizes chords, keys, tunings and tempos". The editions page lists "DNA Direct Note
Access – algorithms for polyphonic instruments such as piano and guitar" for editor and studio, and "Audio-to-MIDI –
export notes to a MIDI file" for assistant, editor and studio (where it sits in the menus was not read). "By default,
the trial version starts off as Melodyne studio". Whether the trial needs a Celemony account was not checked.

1. Get the trial from https://www.celemony.com/en/trial. **Save the license text** if the installer or the program
   (Help menu, "License" or "About") shows one: `melodyne-license.txt` or PDF (Celemony's site links none, and the one
   copy found on the web could not be reached on 2026-11-11).
2. Open `S2s.wav` in the standalone Melodyne; let it detect the notes with its polyphonic algorithm. Export MIDI if it
   offers it. Screenshot the note "blobs".
3. Repeat with `R1a.wav`.
4. Open `S7flat30.wav`: screenshot and write down the tuning (reference pitch or cents) and the key and tempo it shows.

Send back: any MIDI files, screenshots, `notes.txt` (time to detect, which algorithm it chose, the S7flat30 tuning),
the license text if shown.

### T100 · RipX DAW PRO (apps-survey 12)

Platform: "Windows 8/10/11 (64-bit)" or "macOS 10.15+"; "Minimum: 2 Core 2.5GHz CPU, 8 GB RAM, 20 GB Free Disc Space"
(buy page, read 2026-11-11) · cost: "Try RipX DAW PRO Free for 21 Days"; then RipX DAW "$99.00 USD", RipX DAW PRO
"$198.00 USD" (read 2026-11-11; on 2026-11-12 the buy page showed the box's region the prices in pounds, "£99.00 GBP"
and "£198.00 GBP", and the same "21-day trial") · time: about 10 minutes (lane's estimate) · clips: S4, R2, S2s.

Its page lists "Print Audio to Midi to load a specific part into a VST of your choice" and "Export separated stems
straight to WAVs".

1. Install the trial from https://hitnmix.com; if the installer shows a license agreement, copy it into
   `ripx-license.txt` (none is linked from its web pages). Open `S4.wav`, then `R2.wav`.
2. Let it separate and detect notes. Export the guitar layer's notes as MIDI ("Print Audio to Midi") and the stems as
   audio if the trial allows. Screenshot the note view.
3. Open `S2s.wav` and export its notes as MIDI.

Send back: MIDI files, screenshots, `notes.txt` (stems go to the studio library), `ripx-license.txt` if shown.

### T101 · ScoreCloud (apps-survey 14)

Platform: "Download for PC & Mac" · cost: Studio "can be used for free up to 10 saved songs"; Songwriter "10 day free
trial" (read 2026-11-10) · time: about 10 minutes (lane's estimate) · clips: `R2.mp3`, `S4.mp3`, `S1.wav`, `S2s.wav`.

The site: "ScoreCloud Songwriter takes recordings of voice and instruments and turns it into Lead Sheets, with melody,
lyrics and chords" ("Recording to lead sheet – MP3, YouTube, or live take"); Studio: "record single-instrument audio,
enter notes manually or play via MIDI keyboard"; exports "PDFs, MusicXML, MIDI". Whether Studio imports an audio file
was not checked; if it only records, play the clip from the laptop speakers into the microphone and say so.

1. Install from https://scorecloud.com. In Songwriter (trial) put in `R2.mp3`: screenshot the lead sheet (melody,
   lyrics, chords), export MusicXML and MIDI. Then `S4.mp3`.
2. In Studio put in `S1.wav`; export MusicXML and MIDI. If it offers guitar tab, try `S2s.wav` as well.

Send back: exports, screenshots, `notes.txt` (file import or microphone).

### T102 · MIDI Guitar 2 or 3 (Jam Origin) (apps-survey 15)

Platform: Windows, Mac, iOS ("standalone Windows/Mac ... There is also an app for iOS.") · needs: a DAW (skip this
test if you have none) · cost: MIDI Guitar 2 "Download Free trial ... No questions asked. No installation needed."; a
license is "USD 149.95" ("The price is always USD 149.95 and there are never any discounts.", read 2026-11-11); "MIDI
Guitar 3 is in beta testing phase." and "Please refer to MIDI Guitar 2 for a production ready solution." · time: about
10 minutes (lane's estimate) · clips: S2s, R1a.

It turns live guitar audio into MIDI as you play, so a recording has to be played through it.

1. Get the MIDI Guitar 2 trial from https://www.jamorigin.com (or MIDI Guitar 3 from www.jam.live if it is free to try;
   write down which).
2. In your DAW put `S2s.wav` on an audio track, insert MIDI Guitar as a plugin on that track, send its MIDI to a MIDI
   track, record while the clip plays, save the MIDI. Repeat with `R1a.wav`.
3. If the program shows a license text, copy it into `midiguitar-license.txt` (none is linked from either site).

Send back: 2 MIDI files, `notes.txt` (DAW used, plugin settings), the license text if shown.

### T103 · Chord ai (apps-survey 16; phone)

Platform: iOS (an Android version appears in search results only: UNVERIFIED) · cost: free; Pro "$10.99" a month or
"$69.99" a year in the App Store (read 2026-11-10) · time: about 10 minutes (lane's estimate) · clips: `S3.mp3`,
`S5capo2.mp3`, `S5dropd.mp3`, `R2.mp3`.

Its listing says it can suggest a capo ("Smart capo ... [Pro version]") and handles alternate tunings ("Drop D,
DADGAD, Open D/G/A/C etc. [Pro version]").

1. Install it; open `S3.mp3` from the phone's files. Screenshot the chord sheet; export PDF or ChordPro if offered.
2. Open `S5capo2.mp3` and `S5dropd.mp3`: screenshot what it says about capo and tuning (write down if those parts are
   Pro-only).
3. Open `R2.mp3`.

Send back: screenshots, exports, `notes.txt`.

### T104 · Yamaha Chord Tracker (apps-survey 17; phone)

Platform: iOS (Yamaha's page adds "Chord Tracker Android is now available at Google Play."; whether the Android version
also reads songs stored on the phone was not read) · cost: free · time: about 10 minutes (lane's estimate) · clips:
`S3.mp3`, `R2.mp3`.

The App Store listing: "analyzing the audio songs stored in your iOS device and then displaying the chord symbols",
"with both graphical piano keyboard and guitar tab display options"; it "will not work for songs in iCloud or protected
by DRM" or "with Music Streaming services such as Apple Music". On an iPhone the MP3s must be in the phone's own music
library, not in iCloud.

1. Add `S3.mp3` and `R2.mp3` to the phone's music library and open them in the app.
2. Screenshot the chord chart for each (once with the guitar display), and anything it shows for tempo and key.
3. If the app shows a license agreement (first start, settings or "About"), screenshot it. On Android, say that it was
   Android and whether it found the MP3s.

Send back: screenshots, `notes.txt`.

### T105 · Fender Studio: Jam & Record (apps-survey 17b; phone)

Platform: iOS (other platforms not checked) · cost: not read (write down what it cost, if anything) · time: about 10
minutes (lane's estimate) · clips: `S3.mp3`, `R2.mp3`.

Its App Store listing: "Use the Chord Track to create your own chord progressions, or drag audio to it for automatic
recognition". It does not describe tab output.

1. Start a project and drag `S3.mp3` onto the Chord Track. Screenshot the recognized chords; repeat with `R2.mp3`.

Send back: screenshots, `notes.txt`.

### T106 · Capo (SuperMegaUltraGroovy) (apps-survey 18; Mac, iPhone, iPad only)

Platform: "Capo is available for macOS and iOS" · cost: "The Free Edition just won't save your edits to chords and
beats, export audio, or—on the Mac—export MIDI and create lead sheets" · time: about 10 minutes (lane's estimate) ·
clips: `S3.mp3`, `R2.mp3`.

Its App Store listing describes chord, beat and key guesses, not tab. "MIDI export of notes and chords" is one of the
tools "exclusive to the Mac"; its Mac page says the Tabbing view writes tab from notes you draw on the spectrogram ("as
you draw, tablature is generated automatically below"), so the notes in its MIDI are the ones you entered. Its Terms of
Use Agreement is at https://supermegaultragroovy.com/legal/tou/ (clauses quoted in the apps-survey `survey.md`).

1. Only if you have one of those devices: open `S3.mp3` and `R2.mp3`, screenshot the detected chords and tempo.
2. On a Mac with a paid edition, export MIDI of `S3.mp3`.

Send back: screenshots, the MIDI if made.

### T107 · MuseScore Studio 4, and the FretPath plugin (web-tab-render 1; guitar-tab 5)

Platform: Windows (free; GPL-3.0) · cost: 0 · time: about 15 minutes for part A (web-tab-render lane's estimate) ·
files: `inputs/S2n/S2n.gp5`, `inputs/S5capo2/S5capo2.gp5`, `inputs/S5dropd/S5dropd.gp5`,
`lanes/web-tab-render/samples/alphatab/S2n.export.gp`, and the merged MIDI files
`lanes/guitar-tab/samples/lane-inputs/<id>.merged.mid`.

On the box, MuseScore 3.2.3 opened the `.gp5` files with a main score of plain notation and no TAB staff (a TAB staff
existed only in a part named "Guitar" inside the saved file) and refused the `.gp` file alphaTab wrote. musescore.org's
download page linked version 4.7.6 on 2026-11-10.

Part A, Guitar Pro files (web-tab-render):

1. Install MuseScore Studio from https://musescore.org/; note the version under Help > About.
2. File > Open `S2n.gp5`; screenshot the first page. If it shows parts (a part named "Guitar", for example), open each
   and screenshot its first page. The same for `S5capo2.gp5` and `S5dropd.gp5` (look for "Capo" and the tuning).
3. File > Open `S2n.export.gp` (Guitar Pro 7); note whether it opens or what the error says.
4. For each file that opened: File > Export, "MusicXML".

Part B, string assignment from MIDI with FretPath (guitar-tab; https://github.com/knoguchi/fretpath, GPL v3, for
MuseScore Studio 4.4 or later; steps from its README at commit `5e4fb42`):

1. Download the repository (GitHub's Code > Download ZIP), copy the folder to `Documents\MuseScore4\Plugins`, restart
   MuseScore, and enable the plugin in Home > Plugins.
2. Open `S2n.merged.mid`. In the Instruments panel (I) search "tablature" and add "Classical Guitar (tablature)" (the
   README: "The plugin treats the last staff as the TAB target").
3. Plugins > Composing/arranging tools > FretPath, keep "Write to TAB staff", press Run. Export MusicXML as
   `S2n_fretpath.musicxml`. Repeat for S3, R1a, R1b, R1c, S5capo2 and S5dropd; for S5dropd also set the TAB staff's
   strings to Drop D before Run (the README: alternate tunings "are read automatically from the instrument's string
   data") for a second file `S5dropd_fretpath_dropD.musicxml`.
4. A pinned string: the README says FretPath "respects existing finger-number and string-number annotations as hard
   constraints". In the S2n score, click the upper note of the first chord after the empty count-in bar (G3, above the
   low G), and in the Fingering palette double-click the circled string number 4 (if the palette shows only finger
   numbers, add the string numbers from its "more" list; these palette names are UNVERIFIED). Keep "Also write on
   notes with existing annotations" off, run FretPath again, export `S2n_fretpath_pinned.musicxml`, and screenshot the
   first bars of the TAB staff. The box compares the two exports note by note (the same case ran on the box with
   LilyPond's string mark, run r0155, and scorify's cost hook, run r0623: in both the pinned note moved and the other 89
   kept their strings and frets).

Send back: the screenshots, the exported `.musicxml` files, the MuseScore version, and any error text.

### T108 · HAYA-TAB: a desktop tab library with an alphaTab viewer (web-tab-render 8)

Platform: Windows `amd64` zip holding one file, `HAYA-TAB.exe` (also macOS and Linux builds) · cost: free (Apache 2.0)
· time: about 15 minutes (lane's estimate) · files: `S2n.gp5`, `S5capo2.gp5`, `S5dropd.gp5`, `S2n.export.gp`.

Its source (commit eb0466a of 2026-07-31) has a viewer and player built on alphaTab 1.8.1 and an edit dialog for the
title, artist and other library details, and no code that changes a note or saves a tab file. This checks the
released program (v3.1.8 was the newest on 2026-11-11).

1. Download the Windows zip from https://github.com/HAYASAKA7/HAYA-TAB/releases/latest, unzip it, start
   `HAYA-TAB.exe`; note the version.
2. Right-click empty library space and choose **Upload TAB**; add the four files.
3. Open each with **Open with Inner Viewer**; screenshot the first lines. Look for a TAB staff, "Capo" on the capo
   file and the tuning on the Drop D file; note any file that does not open, with the message.
4. In the S2n file, click the first note of bar 1, then right-click it. Note whether anything lets you change its fret
   or string, and whether there is a save or export command for the tab.
5. Press play once with the speed control at 50 % and note whether playback starts.

Send back: the version, the screenshots, which files opened, and the answers to steps 4 and 5.

### T109 · Sonic Visualiser with the Vamp Plugin Pack: QM key, bar and beat, tempo, Chordino; QM onset detector on the taps (chords-beats-key 1; fingerstyle-voices-taps 14)

Platform: Windows (64-bit installer) · cost: free (Sonic Visualiser is GPL v2 or later per its download page) · time:
about 20 minutes for part A and 15 for part B (the lanes' estimates) · clips: S3, S4, S7flat30, R1a, R1b, R2 (A);
S6taps, `S6taps_stem_taps.wav`, S2s (B).

The QM Vamp plugins could not be obtained on the box (their download site reset the connection; the Plugin Pack's
Linux AppImage holds them only inside its GUI installer, which was not run). Chordino and NNLS Chroma ran on the box
through Python; part A is a GUI check of them too.

1. Install Sonic Visualiser 5.2.1, "64-bit Windows installer", from https://www.sonicvisualiser.org/download.html (the
   page: "No plugins are included with Sonic Visualiser itself"), and the Vamp Plugin Pack Windows installer from
   https://www.vamp-plugins.org/pack.html ("Use this if you have 64-bit Windows and are using 64-bit Vamp host
   applications"), accepting the Queen Mary and Matthias Mauch plugin libraries.
2. Part A (chords-beats-key): open `S3.wav`. Installed Vamp plugins appear "in the Analysis section of the Transform
   menu" (reference manual 4.1). Run, each with default settings, the Queen Mary "Key Detector", "Bar and Beat Tracker"
   and "Tempo and Beat Tracker", and Chordino (its chord estimate output). How 5.2.1 labels these menu entries was not
   checked (UNVERIFIED). For each result layer: make it the current layer, File > Export Annotation Layer, a name
   ending in `.csv` ("The file type will be determined from the extension"), as `<clip>_<plugin>.csv`. Repeat for
   `S4.wav`, `S7flat30.wav`, `R1a.wav`, `R1b.wav`, `R2.wav`.
3. Part B (fingerstyle): open `S6taps.wav`; run the Queen Mary "Note Onset Detector", output "Note Onsets" (system
   identifier `vamp:qm-vamp-plugins:qm-onsetdetector`), with defaults ("Complex Domain"), then three more times
   changing only "Onset Detection Function Type": "Spectral Difference", "Phase Deviation", "Broadband Energy Rise".
   Export each layer as `S6taps_qm_<type>.csv` (complex, specdiff, phase, broadband). The same for
   `S6taps_stem_taps.wav` (`S6taps-tapsstem_qm_<type>.csv`) and `S2s.wav` (`S2s_qm_<type>.csv`).

Send back: all CSV files, one screenshot of S3 with all layers visible and one of S6taps with its four layers. The
orchestrator scores part B with `gtr-eval onsets --truth S6taps --est <times> --field taps` (and `--field notes`).

### T110 · NeuralNote: desktop app and plugin, with MuScriptor models (audio-to-notes 3)

Platform: Windows installer `NeuralNote_Installer_Windows_x64.exe` (the README: "It is not code signed, so Windows may
warn you before running it for the first time") · cost: free · models: v2 downloads MuScriptor models from within the
app on first use, "about 210 MB for `small`, 620 MB for `medium` and 2.7 GB for `large`"; "A GPU is strongly
recommended for the `medium` and `large` models" · time: not stated · clips: S2n, S4, R1c.

Its README describes no command-line use, so it did not run on the box.

1. Download the installer from https://github.com/DamRsn/NeuralNote/releases, install it, open the Standalone app.
   Download the `small` model when offered (and `medium` for a second run if you like). Note the device under Settings
   > Compute device (Auto, a GPU, or the CPU).
2. Drop `S2n.wav` on the window, select guitar (or `Automatic`) in the left panel, click `Transcribe`, then save the
   MIDI file. Note the model size used.
3. Repeat with `S4.wav` (`Automatic`) and `R1c.wav` (guitar).

Send back: the `.mid` files, a screenshot of the window after each transcription, the compute device, the time each
took.

### T111 · Tony: pYIN notes in a desktop app (audio-to-notes 6)

Platform: Windows ("a free, open-source application for Windows, Linux, and Mac") · cost: free · time: not stated ·
clips: S1, R1b, `S4_stem_lead.wav`.

Building the pYIN Vamp plugin on the box was refused by the permission system; Tony is the desktop app built on pYIN.

1. Install Tony for Windows from https://www.sonicvisualiser.org/tony/ and open `S1.wav` (it analyses the audio on
   opening and shows the pitch curve and the note blocks).
2. File > `Export Note Data...` (CSV), then File > `Export Pitch Track Data...` (CSV) (menu names from Tony's source,
   `main/MainWindow.cpp`).
3. Repeat with `R1b.wav` and `S4_stem_lead.wav`.

Send back: the note and pitch CSV files, the Tony version (About box), a screenshot of `S1.wav` in Tony.

### T112 · libKeyFinder through Mixxx, and keyfinder-cli under WSL (chords-beats-key 4)

Platform: Mixxx 2.5.6 for Windows ("There is no official paid or "pro" version of Mixxx"); the command-line route runs
under WSL · cost: free · time: not stated · clips: S3, S4, S2n, S5capo2, S5dropd, S7flat30, R1a, R1b, R1c, R2, R2full.

Mixxx's `2.5` branch source has `option(KEYFINDER "KeyFinder support" ON)` and a key analyzer plugin named "KeyFinder";
whether the Windows 2.5.6 installer was built with it was not checked (the Preferences screenshot shows it). Ubuntu's
own Mixxx 2.4.0 package was built without KeyFinder. On the box, the CMake build of libkeyfinder was refused.

1. Install Mixxx 2.5.6 from https://www.mixxx.org/download/. Open Options > Preferences > Key Detection; screenshot the
   available detectors.
2. Add the clips folder to the library, select the clips, run Analyze. Screenshot the library with the Key and BPM
   columns.
3. Command-line route, in the Ubuntu window (full steps:
   [lanes/chords-beats-key/for-aaron.md](lanes/chords-beats-key/for-aaron.md), section 4, steps 5 to 9):
   `sudo apt install cmake g++ libfftw3-dev pkg-config libavcodec-dev libavformat-dev libavutil-dev libswresample-dev`
   (the ffmpeg package list is UNVERIFIED); `git clone --branch 2.2.8 https://github.com/mixxxdj/libkeyfinder`, `cd
   libkeyfinder`, `cmake -DCMAKE_INSTALL_PREFIX=$HOME/kf -DBUILD_TESTING=OFF -S . -B build`, `cmake --build build
   --parallel 4`, `cmake --install build`; then `git clone https://github.com/EvanPurkhiser/keyfinder-cli`, `cd
   keyfinder-cli`, `cmake -DCMAKE_INSTALL_PREFIX=$HOME/kf -DCMAKE_PREFIX_PATH=$HOME/kf -S . -B build`, `cmake --build
   build`, `cmake --install build`; then per clip `time $HOME/kf/bin/keyfinder-cli S3.wav` (its README: "`A` is
   equivalent to A Major. Sharps are not used."; how a minor key is printed is UNVERIFIED).

Send back: the two screenshots, and the printed key and `time` line for each clip of step 3.

### T113 · TuxGuitar: its own window, string assignment from MIDI, capo and tuning (web-tab-render 5; guitar-tab 5)

Platform: Windows (https://www.tuxguitar.app/ or SourceForge) · cost: free (LGPL-2.1) · time: not stated · files:
`S2n.gp5` and the merged MIDI files.

On the box only TuxGuitar's file converters were used (its window was never opened). Its 1.5.6 language file names the
menus File > Import > Import MIDI, File > Export and Track > Properties; the menu names of the current version were not
checked, so if they differ, use its MIDI import, its track tuning and capo settings and its Guitar Pro 5 export.

1. Edit (web-tab-render): open `S2n.gp5`, click the first note of bar 1 and change its fret (type a number). File >
   Save As `.gp5`, then export MusicXML (and ASCII tab if offered). Note the version (Help > About).
2. String assignment (guitar-tab): File > Import > MIDI, `S2n.merged.mid`, default import settings (screenshot the
   dialog); File > Export > Guitar Pro 5 as `S2n_tuxguitar.gp5`. Repeat for S3, R1a, R1b, R1c, S5capo2 and S5dropd;
   for S5dropd also once with the track tuning set to Drop D (Track > Properties > Tuning) as
   `S5dropd_tuxguitar_dropD.gp5`, and for S5capo2 once with the capo at 2 as `S5capo2_tuxguitar_capo2.gp5`.

Send back: a screenshot of the edit, the saved and exported files, the import-dialog screenshot, the version.

### T114 · Guitar Pro 8 (web-tab-render 6; guitar-tab 5)

Platform: "Windows 8 / 10 / 11", "macOS 10.13 or later" · cost: "With the Guitar Pro free demo, enjoy all the Guitar
Pro 8 features for 7 days"; full version "$69.95" (apps-survey survey, read 2026-11-10) · time: not stated · files:
`S2n.export.gp`, `S2n.gp5`, `S5capo2.gp5`.

The apps-survey lane found no automatic audio-to-tab in Guitar Pro 8 (it imports an audio track to transcribe by hand).
The guitar-tab lane's MIDI-import comparison (the MIDI-to-Tab paper compared its model with Guitar Pro 8) has no steps
for Guitar Pro.

1. Open `S2n.export.gp` (written by alphaTab) and `S2n.gp5`; note whether each opens. Open `S5capo2.gp5` and
   screenshot how its capo on fret 2 is shown.
2. Export `S2n.gp5` as MusicXML.

Send back: screenshots, any error text, the exported MusicXML.

### T115 · Ableton Live, "Convert Drums to New MIDI Track", on the taps (fingerstyle-voices-taps survey; also the audio-to-notes lane's "Convert to MIDI" entry; written for this file; paid)

Platform: Windows or macOS · cost: only if you own Live Standard or Suite ("Audio to MIDI" is "Not included in Live 13
Intro", "Included in Live 13 Standard" and Suite, comparison page, re-read 2026-11-12); Live 12 Standard "Original
price USD 349", "now USD 279" on 2026-11-10 and 2026-11-12, an offer that runs "until the release of Live 13 in early
2027" (shop page, 2026-11-12); the shop page links "Try Live 12 for free" (the trial's terms were not read) · time:
not stated · clips: `S6taps_stem_taps.wav`, `S6taps.wav`; for the optional steps 3 and 4, S2n and S1.

The Live 12 manual (13.4): "This command extracts the rhythms from unpitched, percussive audio and places them into a
clip on a new MIDI track. The command also attempts to identify kick, snare and hihat sounds" and "works best with
unaccompanied drum breaks; if other instruments are present, their notes will be detected as well." The fingerstyle
lane listed it and did not run it (a commercial desktop program).

1. Put `S6taps_stem_taps.wav` on an audio track and run the "Convert Drums to New MIDI Track" command on its clip (the
   manual, re-read 2026-11-12: the convert commands are available when an audio clip is selected, "in either the
   Create menu or the clip's context menu"). Export or save the new MIDI clip as `S6taps_taps_ableton.mid`.
2. The same with `S6taps.wav` (`S6taps_ableton.mid`).
3. Optional (the audio-to-notes lane listed Ableton's "Convert to MIDI" without reading its docs): "Convert Harmony to
   New MIDI Track" ("This command identifies the pitches in a polyphonic audio recording and places them into a clip
   on a new MIDI track.") on `S2n.wav`, saved as `S2n_ableton_harmony.mid`.
4. Optional: "Convert Melody to New MIDI Track" (monophonic audio, per the same manual page) on `S1.wav`, saved as
   `S1_ableton_melody.mid`.

Send back: the MIDI files, the Live version and edition, a screenshot of each MIDI clip.

## Section 5. Your own videos and recordings

**What the shared set lacks.** No video shows a capo (S5capo2 is synthesized audio with no video, and the only capo
picture is the video lane's still C1, a capo on a guitar with no hands). No clip has percussive body taps from a real
guitar (S6taps is General MIDI percussion mixed in). No video has a known tab (R3a, R3b and R3c have no ground truth;
R3c's Commons page links a tab PDF on culturevannin.im that was not downloaded, whose license was not checked, and
which may or may not match what is played).

**The framing the video lane's results depended on** (all counts from MediaPipe Hand Landmarker on the box's CPU, no
ground truth):

- Both hands in one continuous shot: on R3c (1920x1080, camera in front of the seated player at about chest height,
  head to lap in frame, the whole fretboard from the nut to the sound hole in frame) MediaPipe found two hands in all
  450 frames, the fretting hand at the neck and the picking hand at the sound hole.
- A hand cut off by the frame edge: on R3b (close view, the picking fingers at the left edge of the picture) it found
  the fretting hand in 445 of 450 frames and the picking hand in none.
- Hand size in pixels: in R3a_cu (close shot) the fretting hand's 21 landmarks span about 123 x 145 px of the 640x480
  frame, against about 35 x 44 px in R3a's wide shot. In R3a's wide shot 215 detections had their box centres in one
  20-px cell where, on frame 300, the detection sits on white sheet music (by eye), not on a hand; in its medium shot
  two hands were found in 0.1787 of the frames.
- Camera cuts: R3a cuts between a medium and a wide shot (at 7.27 s and 14.65 s); the lane set one fixed crop box
  per shot by hand.
- The fret-to-number step: the box mapped fingertips to (string, fret) cells through four neck corners set by hand on
  one frame, a perspective rectification, OpenCV line detection and a 12-TET fret model. On R3b frame 225 that 12-TET
  fit and a count of the visible fret wires from the nut gave fret numbers one fret apart; the nut and the first fret
  wires were in frame there. Which reading is right needs a hand-labelled frame (T116).

### T116 · Label two frames by hand (video-hands-fretboard 9)

Cost: 0 · time: "a few minutes" (lane's estimate) · needs: a video player · clips: R3b (`R3b.mp4`), R3a_cu.

1. Open R3b and pause 9.0 s into the excerpt (frame 225 at 25 fps; 3:29 in the full archive.org video,
   `BrylieChristopherOxley-guitar-2018-10-06.mp4`).
2. For each fretting-hand finger that presses a string, write down: finger (index, middle, ring, pinky), string (1 =
   the thinnest), fret (1 = the first fret from the nut).
3. The same for R3a_cu at 5.0 s into the excerpt (frame 150; 11:27 in the concert video).

Send back: the two lists and a screenshot of each paused frame. The box's answers to compare with (`lanes/
video-hands-fretboard/trials.md`, "Worked handoff"): R3b index string 4 fret 3, middle string 5 fret 4, ring and pinky
string 2 fret 5 (12-TET fit), or one fret lower by the wire count; R3a_cu index string 4 fret 2, middle string 6 fret
4, ring string 4 fret 4, pinky string 2 fret 4.

### T117 · A real recording with body taps: two downloads, one listen, one decision (fingerstyle-voices-taps 8)

Cost: 0 (a free Freesound account) · time: not stated.

No clip in the shared set has real body taps. The box got one CC BY 3.0 recording from archive.org, now the
fingerstyle lane's input RT1 (Chris Smuck, "With A New Tuning, You Can Fly", 2007, keywords "Acoustic, Tapping,
Fingerstyle"), which nobody has listened to.

1. Freesound sound 674811, "guitar body kick" by leaving.february ("Sound when hitting acoustic guitar body with a
   thumb in 105bpm", 18.285 s, WAV 44.1 kHz 24-bit stereo, license "Creative Commons 0"):
   https://freesound.org/people/leaving.february/sounds/674811/ . The box got HTTP 403 from freesound.org and the
   download link needs a login. Log in, press Download, keep the WAV.
2. Wikimedia Commons "File:Erik Mongrain-AirTap.ogv" (180.2 s, 320x240, CC BY-SA 2.5; its description: "Erik Mongrain
   demonstrating the lap-tapping technique with his song AirTap!", which does not mention hits on the guitar body):
   https://commons.wikimedia.org/wiki/File:Erik_Mongrain-AirTap.ogv , "Download" on the right (the box got HTTP 429).
3. Listen to RT1 (the MP3 on https://archive.org/details/ChrisSmuckWithANewTuningYouCanFly , 3:53). Write down whether
   it has hits on the guitar body and, if it does, the times of a few (minutes:seconds) and what kind they are (thumb on
   the top, palm on the bridge, fingers on the side ...). For reference, the loudest peaks of the Demucs drums stems
   made from RT1 are at 0:31.8, 1:05.8, 1:08.4, 1:10.4 and 3:25.8 (htdemucs_6s) and 0:49.9 (htdemucs); what sound is
   there is not known.
4. One more candidate was not downloaded because its license is the Public Domain Mark 1.0, not CC0 or CC BY:
   https://archive.org/details/RacerSessions-DannyGodinez11082015 (a steel-string set whose description says
   "imaginative fingerstyle and percussive textures"). Whether to use it is your call; if yes, say which file and which
   minutes.

Send back: the two downloaded files, the RT1 list, and the Racer Sessions decision. With them the orchestrator can run
the fingerstyle lane's HPSS, onset and Demucs-drums steps.

### T118 · Record a capo clip pair (video-hands-fretboard 10)

Cost: 0 · needs: your guitar, a capo, a phone on a stand · time: not stated (two takes of about 20 seconds).

1. Phone on a stand in front of you at about chest height, landscape, 1080p at 25 or 30 fps. Frame it so the whole
   neck from the nut to the sound hole and both hands are in the picture (as in R3c). Do not move the phone between the
   takes.
2. Take 1: one simple fingerstyle pattern for about 20 seconds, no capo.
3. Clip the capo on behind fret 2. Take 2: the same pattern with the same chord shapes for about 20 seconds.
4. Optional (written for this file; no lane wrote it): if both takes play the S2 arrangement, whose tab is
   `inputs/S2n/S2n.tab.txt` (112 BPM, standard tuning), then S2n's truth is the intended tab of take 1 and S5capo2's
   truth (same strings and frets, capo 2) that of take 2; where you play something else, say which bars.

Send back: the two video files as the phone saved them, the capo's make or type, the fret you put it on (and, for step
4, which bars you played). An agent then runs on frames of both takes the video lane's round-2 settings
(`scripts/gap-round-2/run_openvocab_images.py` with `yoloe`, `owlv2`, `gdino` and `yoloworld`;
`scripts/gap-round-2/run_opencv_lines_image.py` with a hand-set quad; MediaPipe Hand Landmarker). A labelled
alternative exists but was not downloaded: the GuiFiR dataset's per-frame annotations include a capo position
(`frame_capo`); its `DATASET_TERMS.md`: "The dataset assets are provided for non-commercial research, education, and
reproducibility of the GuiFiR work."

### T119 · ChordAR: fingertip string and fret labels on a live webcam, with printed markers (apps-survey trials, NOT RUN HERE; written for this file)

Cost: 0 (printing) · needs: Python, a webcam, your guitar, four printed ArUco markers · license: its README says the
upstream project states the MIT license "but the repository has no `LICENSE` file", and none is in the fork either ·
time: not stated.

A webcam tutor, not a transcriber: its README (https://github.com/manbr21/Computer-Vision-Guitar-Tutor, read
2026-11-12): "each fingertip is labeled with the string and fret it is on (e.g. `D2`)", with a "Virtual capo: tell the
program the fret of a physical capo and the chord shape moves up that many frets". No shared clip has markers on the
guitar, so the apps-survey lane did not run it.

1. Install (README: "Python 3.9+ and a webcam"): `cd C:\gtr`, `git clone
   https://github.com/manbr21/Computer-Vision-Guitar-Tutor`, `cd Computer-Vision-Guitar-Tutor`, `py -3.11 -m venv
   venv`, `.\venv\Scripts\Activate.ps1`, `pip install -r requirements.txt` (the README: "MediaPipe is pinned below
   0.10.30: later releases removed the `mp.solutions` API used here").
2. Print `assets/arucos/print_sheet_standalone.html` at **100% scale** (each marker is 40 mm) and place the markers as
   the README says: "**0** and **1** at the nut (top and bottom edge of the neck), **3** and **2** at fret 12 (top and
   bottom)"; set the neck dimensions in its `config.py` as the README describes.
3. Run `python -m chordar` (`--camera 1` for a second camera). Play a few chord shapes; screenshot the fingertip labels.
   Its keys `]` and `[` move the virtual capo up and down a fret.

Send back: the screenshots, `notes.txt` (whether the labels matched the strings and frets you pressed).

## Section 6. The browser measuring page

### T120 · Metronome timing and one in-browser model, in your own Chrome (browser-audio-sync 1)

File: [lanes/browser-audio-sync/for-aaron/browser-timing-check.html](lanes/browser-audio-sync/for-aaron/browser-timing-check.html)
in the repository (download it with GitHub's "Download raw file") · cost: 0 · clips: none (it synthesizes the 62
notes of S1 itself) · time: the page says the metronome part takes "about 9 min" at 61 s per run ("about 2.5 min in
all" at 15 s per run); on the box the model parts took 139 s of inference (WebGL on SwiftShader, run r0271) and 3.70 s
of session creation plus 6.08 s of inference (ONNX on WebAssembly, run r0313).

It repeats the browser lane's metronome test (four ways of making a 120 BPM click, idle and with a busy page), Basic
Pitch in TensorFlow.js on WebGL (your GPU) and on the CPU, and the ONNX copy of Basic Pitch in ONNX Runtime Web on
WebAssembly and WebGPU. It uploads nothing ("Nothing is sent anywhere"); it loads Tone.js, Basic Pitch, TensorFlow.js
and ONNX Runtime Web (its WebAssembly file is about 29 MB) from the jsDelivr CDN and the 230 KB ONNX model from
raw.githubusercontent.com. It was tested only in headless Chromium with those files from a local cache, not over the
real CDN and not from a `file://` address.

1. Close other heavy programs (renders, games, video calls); on a laptop, plug in the charger.
2. Open the file in Chrome (right-click, "Open with", Google Chrome) and keep the tab in front the whole time.
3. Under "1. Metronome timing" choose "61 (as on the cloud box, about 9 min)", leave "audible" unticked, click "Run
   metronome test", and wait for "metronome test done" (eight rows).
4. Under "2. In-browser model: Basic Pitch" leave "also run the CPU backend (slower)" ticked, click "Run model test",
   wait for "model test done".
5. Under "3. The same model in ONNX Runtime Web: WebAssembly and WebGPU" click "Run ONNX test", wait for "ONNX test
   done".
6. Click "Copy to clipboard".

Send back: the whole copied text (JSON), the power setting (for example Balanced or Best performance), whether the
laptop ran on battery, and the Chrome version (`chrome://version`, first line). The numbers in the JSON: per metronome
run the clicks found, the mean and largest deviation from the ideal grid in ms, how many clicks were off the grid and
how many were scheduled late, the sample rate, `baseLatency`, `outputLatency` and the AudioContext's `playbackStats`;
per Basic Pitch run the backend, model load time, inference time, notes found and notes matched to the 62 known notes
(onset within 50 ms, same pitch); per ONNX run the execution provider, session creation time, inference time, the
WebAssembly thread count and the same note counts; the WebGL renderer string (on the box: "ANGLE (Google, Vulkan 1.3.0
(SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)") and whether WebGPU found an adapter. If the page stays
blank or shows an error about modules or CORS, send a screenshot of the page and of the Console (F12).

## Section 7. The steps the box's permission system refused, and what you can do about each

The box ran in an automatic permission mode. It refused three kinds of step: running or installing code from a cloned
repository or a downloaded program ("[Code from External]"), ticking a box that states rights or accepts terms on your
behalf ("[Consent Given For The User]"), and getting past a site's bot check ("[Bot Check Circumvention]"). Nothing
was worked around. A refused command never starts, so it leaves no ledger line; several refusals below are the
agent's own report (its lane file says so). What you can do for each: run the test named in the last column yourself,
or, for the code ones, give agents a permission rule so that a later session can run them on a box.

| # | Refused step | Lane | Refusal | What you can do |
|---|---|---|---|---|
| 1 | running Banquet's `train.py inference_byoq` from the clone | source-separation | Code from External | T60 |
| 2 | installing Gaborformer from the clone | source-separation | Code from External | T64 |
| 3 | running MSST's `inference.py` from the clone | source-separation | Code from External | nothing: the PyPI `msst` package ran instead |
| 4 | building the pYIN Vamp plugin | audio-to-notes | Code from External | T111 (Tony) |
| 5 | running Timbre-Trap's clone and loading its pickled checkpoint | audio-to-notes | Code from External | T69 |
| 6 | installing MT3 from its clone (`-e <clone>` with `jax[cpu]`) | audio-to-notes | Code from External | T24 (Colab) |
| 7 | running mt3-pytorch from its clone | audio-to-notes | Code from External | T69 |
| 8 | installing CREPE's source with the weights put in place | audio-to-notes | Code from External | T65 |
| 9 | running the Deep Salience clone's script | audio-to-notes | Code from External | T71 |
| 10 | running the `mt3-infer` CLI (installed from PyPI) | audio-to-notes | Code from External | T72 |
| 11 | running `yourmt3` (installed from PyPI) | audio-to-notes | Code from External | T72 |
| 12 | building madmom from its GitHub clone | chords-beats-key | Code from External | nothing: madmom 0.16.1 from PyPI was used |
| 13 | running BTC through `btc_run.py` | chords-beats-key | Code from External | T59 |
| 14 | the CMake build of libkeyfinder 2.2.8 | chords-beats-key | Code from External | T112 |
| 15 | a chord-only install of the Omnizart sdist (verifier) | chords-beats-key | Code from External | T67 |
| 16 | `go get` and `go build` of mixedkey with the lane's glue | chords-beats-key | Code from External | T81 |
| 17 | installing `hf_midi_transcription` from its clone | guitar-tab | Code from External | T82 |
| 18 | installing Guitab from its clone | guitar-tab | Code from External | T27 |
| 19 | installing gtrsnipe from its repository | guitar-tab | Code from External | T83 |
| 20 | installing ADTOF-pytorch's clone, and running its source (two refusals) | fingerstyle-voices-taps | Code from External | T84 |
| 21 | installing ADTOF (Keras) from its repository | fingerstyle-voices-taps | Code from External | T28 |
| 22 | installing Omnizart 0.6.3 with TensorFlow 2.15.1 | fingerstyle-voices-taps | Code from External | T67 |
| 23 | installing ADT_STR (`uv pip install -r pyproject.toml`) | fingerstyle-voices-taps | Code from External | T87 |
| 24 | running LarsNet's `separate.py` | fingerstyle-voices-taps | Code from External | T89 |
| 25 | running Demucs with drumsep's checkpoint | fingerstyle-voices-taps | Code from External | T29 |
| 26 | installing piano_svsep from its clone | fingerstyle-voices-taps | Code from External | T85 |
| 27 | `make` of the McLeod voice-splitting clone (verifier) | fingerstyle-voices-taps | Code from External | T86 |
| 28 | installing `dill` and unpickling WiLoR's `detector.pt` | video-hands-fretboard | Code from External | T32 (the demo) |
| 29 | a 4-frame TAPIR smoke test with the tapnet code (verifier) | video-hands-fretboard | Code from External | T35 (Colab) |
| 30 | `pnpm install` in the muzart clone | web-tab-render | Code from External | T04 (its web demo) |
| 31 | `AnthemScore-x86_64.AppImage --appimage-extract` | apps-survey | Code from External | T97 (the Windows trial) |
| 32 | `npm ci --ignore-scripts` in the Guitar-Learning clone | apps-survey | Code from External | T20 (its web app) |
| 33 | ticking AnthemScore Web's rights box and pressing Transcribe | apps-survey | Consent Given For The User | T07 |
| 34 | opening Chordify's terms page in headless Chromium | apps-survey | Bot Check Circumvention | T01 |
| 35 | the verifier's command fetching the Crypton PDF plus one status check of Chordify's terms page | apps-survey | Bot Check Circumvention | T01 (the Crypton PDF was then fetched alone) |
| 36 | the verifier's status request for xAI's terms pages and OpenAI's Services Agreement | hosted-apis | Bot Check Circumvention | T40 |

Counted by refusal: 33 "[Code from External]" (row 20 holds two), 1 "[Consent Given For The User]", 3 "[Bot Check
Circumvention]". The steps that were not attempted because of these refusals (STONE, key-cnn, BeatNet+, MR-MT3, the
YourMT3 local run, Noise2Fret, Beat Transformer, AudioSep's local route and others) have their own tests too.

## What the surveys list as access needs

The "Access needs" lines of the lanes' `survey.md` files, merged (each fact is quoted or cited in the survey named).

- **Accounts, gates and approvals.** Hugging Face login with manual approval: SAM Audio (T21), SAM 3 and SAM 3.1
  (T33), SAM 3D Body; Hugging Face sign-in and acceptance (`gated: auto`): MuScriptor (T25); manual request:
  AudioEstimate (T42). MANO site registration for HaMeR, WiLoR, Hamba and HaWoR (T93, T32; WiLoR-mini's Hugging Face
  repository hosts `MANO_RIGHT.pkl` itself, which the box did not use because of the MANO license's "No Distribution"
  clause). A Roboflow account or API key (T36; Free Tier $0 with "10 credits included a month", Core "$39per month",
  video survey). Ego-Exo4D: "Sign the Ego-Exo4D Licenses, this will take 2 days to be approved". A Colab runtime with
  a Google account as MT3's documented path (T24). vocsep_ijcai2023: "you will need an account to run the code"
  (WANDB). Klangio Drum2Notes for full transcriptions (T31). `@hidechae/eztab-mcp`: library access needs an
  `EZTAB_TOKEN` issued in the EZTab app (its repository was not public on 2026-11-10).
- **GPU, memory, operating system.** Sheet Sage's Jukebox mode: a GPU with at least 12 GB and CUDA (T68). MuS3D: "The
  DiT needs about 10 GB of free memory" (T63). SAM 3 / 3.1: "CUDA-compatible GPU with CUDA 12.6 or higher", "Python
  3.12 or higher", "PyTorch 2.7 or higher". HaMeR, WiLoR, Hamba: install examples for CUDA 11.7; HaWoR: "tested with
  PyTorch 1.13 and CUDA 11.7". EgoHand v1: "NVIDIA RTX 6000 Ada, L40, L20, or RTX PRO 6000 Blackwell", "32 GB" memory,
  "25 GB" storage. Sapiens2: "requires Python ≥3.12 and PyTorch ≥2.7" (CPU not stated). FAH: a CPU install is stated
  ("On CPU or Apple silicon, omit the CUDA PyTorch command"). OpenPose CPU-only build: "Around 8GB of free RAM memory."
  and "Highly recommended: a CPU with at least 8 cores." (T95). YOLOE-26 text prompts: the first `set_classes()`
  downloads `mobileclip2_b.ts` ("about 254 MB"). NeuralNote: a macOS or Windows desktop with a DAW or the Standalone
  app (T110). ipt~: "macOS 10.13 or later with an Apple Silicon processor ... **or** Windows 10/11 on an x64 CPU with
  AVX2" and "Max 8.6 or later / Max 9.0.3 or later"; the IPT Vamp plugin installs from its Releases page. Ableton Live
  Standard or Suite for "Convert Drums to New MIDI Track" (T115).
- **The browser.** WebGPU paths (ONNX Runtime Web's `webgpu` execution provider, Transformers.js `device: 'webgpu'`,
  demucs-rs, the `monteslu/htdemucs-web-onnx` and `musetric/beat-this-onnx` exports, LiteRT.js GPU) need a browser
  with a WebGPU adapter; browser-compat-data (read 2026-11-10) lists Chrome 144 (with "Linux (Intel Gen12+ GPUs
  only)"), Safari 26 and Firefox 141 on Windows (T03, T120). WebNN: Chrome 112 behind a flag only. Real output latency
  (`outputLatency`, `getOutputTimestamp()`) needs a real device with a sound card (T120).
- **Old software stacks.** ADTOF: "tested on macOS Ventura with **Python 3.10**" (T28); Deep Salience: Python 2.7.15,
  TensorFlow 1.12.0, Keras 2.0.3 (T71); Magenta Onsets and Frames: the archived Magenta package, PyPI 2.1.4 pinning
  `tensorflow == 2.9.1` (T30); piano_svsep: `torch==2.8.0`, `partitura==1.8.0` (T85); ADTLib: TensorFlow 1.x (T91).
- **Licenses and commercial agreements.** Essentia and essentia.js models: a proprietary license "upon request" from
  MTG-UPF (the MELODIA plug-in is "free of charge for non-commercial use only", T66). Superpowered: "there is no free
  license available that allows public release", and its pricing page says "Superpowered is sunsetting". Bungee Pro:
  contact through https://bungee.parabolaresearch.com/. Rubber Band: a commercial licence
  (https://breakfastquay.com/rubberband/license.html). OpenPose commercial use: a license through CMU FlintBox (price
  not readable). Ultralytics commercial use outside AGPL-3.0: an Enterprise license request (no price published).
- **Data by request or not public.** ADTOF datasets ("available upon request", "internal non-commercial use");
  GPercRep ("currently not public"); piano_svsep's `jpop` set ("not public"); Omnizart's "Pop" drum set (not
  downloadable per `datasets.py`); GOAT (Zenodo record 15690894, access "restricted", by request, "non-commercial
  only").
- **Training first.** The Bastas et al. guitar string separation ships no trained weights (its README's training
  commands pass `--cuda`); Stefani's playing-technique classifier needs its feature files and a retrain (its `.tflite`
  entries are dangling links).

## Not run, and nothing you can run

These tools appear in the lanes' trials or surveys, did not run, and have nothing anyone can run today: no code, no
trained weights, a placeholder, a closed product, a demo page in error, or no audio input. Each line gives the reason
as the lane recorded it.

| Tool | Lane(s) | Why there is nothing to run |
|---|---|---|
| BS-RoFormer / Mel-Band RoFormer (lucidrains implementation) | source-separation | code only, no weights |
| Moises-Light (unofficial implementation) | source-separation | architecture code; no weights named in the README |
| free-music-demixer (sevagh) | source-separation | its README: "An archived snapshot ... no longer maintained"; "Model weights are not included" |
| onsets-and-frames, PyTorch port (jongwook) | audio-to-notes | no pretrained checkpoint published (its README covers training your own) |
| MTANet | audio-to-notes | no trained weights published (`resume_checkpoint = None`; the README links only training data) |
| Harmonica; MIROS | audio-to-notes | no code or weights link in the papers |
| Self-supervised F0 and voicing (Bitra and Beigi) | audio-to-notes | no code or weights linked in the PDF or on the abstract page |
| Harmony Transformer v1 and v2 | chords-beats-key | training scripts only, no released weights |
| ACR_seq2seq | chords-beats-key | no checkpoints in the repository |
| ChordFormer; BMACE | chords-beats-key | no code found |
| ChordCoT | chords-beats-key | placeholder repository ("Updates will be pushed soon.") |
| BEAST | chords-beats-key | an evaluation script for preprocessed GTZAN data plus a Google Drive model; no inference command for new audio |
| ChordMini (ChordMiniApp) | chords-beats-key | the full app needs Firebase and Gemini keys; its hosted docs answered HTTP 402 |
| Rochester ECE 477 "Guitar Tuning Detection"; Chord Recognition with Deep Learning (Mackenzie); Jangdan as Downbeats | chords-beats-key | papers or reports with no code link |
| TabCNN (original code, Wiggins and Kim) | guitar-tab | no published weights (its README says to train on GuitarSet first) |
| guitar-transcription-with-inhibition; FretNet | guitar-tab | no published weights (FretNet's example loads a file nothing links to) |
| Noise2Fret; Guitar-Transcription-CNN-MTL | guitar-tab | weights are published, but inference runs only through training or evaluation scripts over dataset folders; nothing takes one audio file. The guitar-tab lane's question for the authors: "is there a way to run the published checkpoints on one WAV file and get the tablature out?" |
| Audio2Tab | guitar-tab | its "Checkpoints" section: "We will host a checkpoint here soon!" |
| GuitarTab (Hsu et al.); nylon-amt; midi2tab_Deconvolutions | guitar-tab | no published checkpoint |
| Fretting-Transformer; MIDI-to-Tab; From MIDI to Rich Tablatures; Fretiq; Taming the Shotgun; Chieppa et al.; Velocity Prediction in Automatic Guitar Transcription; Tone-informed Transformer / EGDB-PG | guitar-tab | no code found |
| TART | guitar-tab, fingerstyle-voices-taps | no code or weights link in either PDF |
| TapToTab | guitar-tab, video-hands-fretboard, apps-survey | no code, data or weights link |
| Paleari et al. (multimodal music transcription) | guitar-tab, video-hands-fretboard | paper only |
| Joint Transcription of Acoustic Guitar Strumming Directions and Chords | guitar-tab, fingerstyle-voices-taps | no code link |
| Procedural data generation for fingerpicking (Murgul and Heizmann) | guitar-tab, fingerstyle-voices-taps | the linked repository is empty |
| GuiFiR (models) | guitar-tab, video-hands-fretboard | the linked repository holds dataset-preparation scripts only (its dataset is in T118's note) |
| music21 `tablature` module | guitar-tab | not a string and fret assigner: `getFretNotesFromFigure()` is a stub |
| Martelloni, McPherson, Barthet (PercCNN, PercVAE, TablaCNN) | fingerstyle-voices-taps | no code, weights or data released |
| vocsep_ijcai2023 | fingerstyle-voices-taps | no pretrained weights in the repository; the code needs a WANDB account |
| STRUM; Hi-Drum; SpectroFusionNet; Noise-to-Notes; EngravingGNN; Riley and Dixon (drum stem separation for ADT) | fingerstyle-voices-taps | no code located (STRUM's link is a placeholder) |
| deep-guitar-separation (Bastas et al.) | fingerstyle-voices-taps | no trained weights; its README trains with `--cuda` |
| Goldstein and Moses, guitar transcription from silent video | video-hands-fretboard | the project's code page reads "Code will be available soon." |
| Bae, Kwon, Park (bass fingering); Burns and Wanderley | video-hands-fretboard | papers with no code link |
| You Just Play / Tabbers | video-hands-fretboard, apps-survey | a talk only; no product, app or code found |
| Samplab | apps-survey | samplab.com redirected to apple.com on 2026-11-10; 9to5Mac reported on 2026-10-19 that Apple is acquiring assets of Samplab GmbH |
| GrabTab | apps-survey | "Coming soon to iOS & Android" on 2026-11-10 |
| ExpressiveGuitar-TechniqueClassifier (Stefani) | fingerstyle-voices-taps | "the classifier takes pre-computed feature vectors, the feature extractor is not in the repository, and the trained models are not in the repository" (its four `.tflite` entries are links to paths on the author's machine) |
| Spotify Web API (audio features and audio analysis) | chords-beats-key, hosted-apis | "Closed to new Web API use cases from 2024-11-27" (chords-beats-key); "closed to new apps (survey, Spotify blog); not called" (hosted-apis) |
| Hugging Face Space `Hmjz100/MT3` | hosted-apis | stage `RUNTIME_ERROR` on 2026-11-10 ("Exit code: 1" with a numpy traceback), and again on 2026-11-12 (Hugging Face API); MT3 itself is T24 |
| xAI language models (grok-4.x, grok-build-0.1); DeepSeek API; Anthropic Claude Messages API | hosted-apis | no audio or video input: "no listed language model takes audio or video" (xAI, model list read with the key), "no audio or video input" (DeepSeek), "no audio or video content block in its reference" (Anthropic) |

Added by the 2026-11-12 check from the lanes' `tools.json` files (these entries are not in any `for-aaron.md`).

**Not run, and no test written: a reason you could change, but too little recorded for steps.** Each line is the
lane's `tools.json` reason; none of these was researched far enough to name a request, a setting or a price.

| Tool | Lane | Reason recorded | What it would take |
|---|---|---|---|
| Hugging Face Inference Providers (`router.huggingface.co`) | hosted-apis | "no call possible without a token": the chat-completions and `hf-inference/models/openai/whisper-large-v3` endpoints "answered HTTP 401 (HTML page) without a token" | the token of T43; no lane chose a model or a request for the clips |
| Amazon Nova | hosted-apis | "no AWS key in the key store; no listed Nova model takes general audio and returns text (Nova 2 Lite takes video)" | an AWS account and key |
| Mistral audio (Voxtral) | hosted-apis | "seen by verify-docs only; music understanding not described; not trialled" | a Mistral account and key |
| GetSongBPM API | hosted-apis, chords-beats-key | "the page answered HTTP 403 to this box on 2026-11-10; not researched" | reading the page in a browser |
| Cesure MCP server and connector (`api.cesure.app/mcp`) | hosted-apis, apps-survey | "no tools/call was sent (the gap round asked for a read-only probe)"; "Not connected or tried here." | a Cesure account (T16) |
| Roboflow hosted inference | hosted-apis | "page not read" (the documentation address redirected) | the Roboflow account of T36 |
| ZFTurbo's open-source 53-stem model (MSST release v1.0.21) | source-separation | "the release page itself returns 403 here, full asset list and any license note not read" | reading the release page in a browser |
| Ultimate Vocal Remover GUI (UVR5) | source-separation | "desktop app only (survey.md); no run in trials.md" | a Windows or macOS computer |
| mlx-audio-separator | source-separation | "Not runnable on this Linux box (MLX targets Apple Silicon)" | an Apple Silicon Mac |
| HOPformer (`Sid2697/HOPformer`) | video-hands-fretboard | gated ("You need to agree to share your contact information to access this model"); "not read; not run" | accepting the gate on Hugging Face |
| Sonic Annotator (command-line Vamp host) | chords-beats-key, fingerstyle-voices-taps | "Ubuntu 24.04 apt has no package for it; the survey agent's git clone of https://github.com/c4dm/sonic-annotator failed with an authentication prompt" (chords-beats-key); "no reason recorded" (fingerstyle-voices-taps) | a build for your computer (its download page was not read); T109 runs the same Vamp plugins in Sonic Visualiser |
| Power Tab Editor 2.0 (`powertab/powertabeditor`) | web-tab-render | "desktop program (C++/Qt); not tried (trials.md: "Power Tab Editor (desktop)" listed under not tried for lack of time)" | a desktop install; no lane wrote what to check |

**Not tested with the shared clips** (the apps-survey lane's reasons, from its `for-aaron.md` and `tools.json`):

| App | Reason recorded |
|---|---|
| Ultimate Guitar "AI chords" | its help article describes a YouTube link as the input; the shared clips are not on YouTube |
| Yousician | it listens to you playing along ("real-time feedback that listens as you play"); transcribing a recording you give it is not described |
| Positive Grid Spark "Auto Chords" | "*Requires Spark Amp*" |
| TabGenius | makes a tab from a typed or spoken idea, not from audio |
| YouTube Guitar Tab Parser | copies a tab already drawn in a YouTube lesson video into a PDF; it does not transcribe audio |
| NoteHound; FingerstylePal - Guitar Tab AI | mobile apps; no automatic transcription described |
| Rocksmith+; Fender Play; Fender Tune; Fender Songs; Gibson App; Riffstation; Fender Studio Pro 8 | not read by the lane, so whether they transcribe a given recording is UNVERIFIED |

Not run, no steps written, and nothing stopping the box itself (listed for the record; none needs you): the
web-tab-render survey's tools "not tried for lack of time" (osmd-audio-player, react-guitar, fretboard.js,
chords-db and react-chords, jTab, ApolloTab, score-parser, the `guitarpro` Rust crates, @musicbird/gpx-parser, It's
MyTabs, tab-editor, Guitar (1j01), tuitar, the ChordPro reference program, Verovio's Python and C++ builds); the
source-separation repackagings of models that ran (demucs-infer, bs-roformer-infer, melband-roformer-infer, PolUVR);
the browser lane's libraries "not reached in the time available" (its `tools.json`); MMPose itself (it needs a second,
older torch or an mmcv build; the same RTMPose, RTMW and DWPose models ran through rtmlib). One more has no route the
lane could state: pyace (Python 2.7 code whose import needs Keras even in its "simple" mode; its `requirements.txt` pins
`hmmlearn==0.2.5`, whose wheels are for Python 3.5 to 3.9 only).

The rest of the lanes' `tools.json` entries with `tried: false` (637 entries in all on 2026-11-12) are tools named in
this file under another name, or entries whose recorded reason is a survey line only: "Not covered", "not examined",
"Survey only", "not reached in the time available", "found by the verifier's completeness search", a paper or a
library named for context. A name match on 2026-11-12 left 158 such tools and 67 datasets and file formats whose
names do not appear here (by lane, tools / datasets and formats: source-separation 20 / 2, audio-to-notes 9 / 24,
chords-beats-key 12 / 8, guitar-tab 20 / 12, fingerstyle-voices-taps 7 / 7, video-hands-fretboard 15 / 5,
web-tab-render 23 / 6, browser-audio-sync 41 / 0, hosted-apis 8 / 2, apps-survey 3 / 1; a few of these are counted
because the file names them differently). None of their recorded reasons is an account, a key, a payment, a consent, a
GPU, a desktop or phone platform or a refusal by the box's permission system, except the ones in the two tables above
and three that the tests already cover: the clients `musicai-sdk` and `soundsliceapi` ("no Music.AI key", "no
Soundslice key": T52, T37) and the chords-beats-key lane's pointer to the Replicate-hosted All-In-One and chord models
(T49). Each lane's `tools.json` has the reason for every entry.

## The ten lane lists

Each lane's own list, as its `for-aaron.md` stands on 2026-11-12 (counted here: numbered entries in the file), the
number of entries its `tools.json` marks `for_aaron: true` (the count the earlier index of this file gave as "entries
with steps": 154 then, 159 on 2026-11-12, after the gap rounds), and the tests in this file that carry them.

| Step | Numbered entries | `for_aaron` in tools.json | File | Tests here |
|---|---|---|---|---|
| Splitting a song into instruments | 8 (11 tools) | 11 | [lanes/source-separation/for-aaron.md](lanes/source-separation/for-aaron.md) | T03, T21, T22, T60 to T64 |
| Turning sound into notes | 14 (item 9, RMVPE, says "Nothing to do": it ran in gap round 1) | 21 | [lanes/audio-to-notes/for-aaron.md](lanes/audio-to-notes/for-aaron.md) | T23 to T25, T65 to T73, T110, T111; and T02, T30, T115 (steps 3 and 4) |
| Chords, beat, key and tuning | 14, plus a "Nothing to run" list | 18 | [lanes/chords-beats-key/for-aaron.md](lanes/chords-beats-key/for-aaron.md) | T26, T42, T59, T67, T74 to T81, T109, T112 |
| Choosing the string and fret | 5, plus a "Nothing to run" list | 8 | [lanes/guitar-tab/for-aaron.md](lanes/guitar-tab/for-aaron.md) | T27, T82, T83, T107, T113, T114 |
| Melody, bass and taps from one guitar | 16 | 19 | [lanes/fingerstyle-voices-taps/for-aaron.md](lanes/fingerstyle-voices-taps/for-aaron.md) | T28 to T31, T67, T71, T84 to T92, T109, T115, T117 |
| Hands and the fretboard from video | 10 | 11 | [lanes/video-hands-fretboard/for-aaron.md](lanes/video-hands-fretboard/for-aaron.md) | T32 to T36, T93 to T95, T116, T118 |
| Tab rendering, editing and playback | 8 | 8 | [lanes/web-tab-render/for-aaron.md](lanes/web-tab-render/for-aaron.md) | T04, T37 to T39, T107, T108, T113, T114 |
| Metronome and sync in the browser | 4 | 14 | [lanes/browser-audio-sync/for-aaron.md](lanes/browser-audio-sync/for-aaron.md) and the measuring page [browser-timing-check.html](lanes/browser-audio-sync/for-aaron/browser-timing-check.html) | T02, T03, T05, T120 |
| Services an agent can call | 15 (section 13 says "Not for this lane") | 21 | [lanes/hosted-apis/for-aaron.md](lanes/hosted-apis/for-aaron.md) | T06, T21, T25, T37, T38, T40, T43 to T58 |
| Existing apps | 28 numbered headings (tests 1 to 24 with 8a, 8b, 17b and 17c), of which test 13, Samplab, is marked removed: 27 tests, plus 4 optional paid ones | 28 | [lanes/apps-survey/for-aaron.md](lanes/apps-survey/for-aaron.md) | T01, T06 to T20, T41, T96 to T106, T119 |

## Checklist of every test

In the order of this file. Needs: what the test needs beyond a browser and the clips. Time and cost as stated in the
test (prices with the dates given there).

| Test | Tool | Needs | Clip | Send back | Time | Cost |
|---|---|---|---|---|---|---|
| T01 | Chordify (terms pages) | browser | none | 2 PDFs | about 3 min | 0 |
| T02 | Basic Pitch web demo | browser | S1, S2n | 2 MIDI, times, screenshot | about 5 min | 0 |
| T03 | demucs-rs | browser with WebGPU, GPU | S4, R2full | stems, times, chrome://gpu screenshot | about 10 min | 0 |
| T04 | muzart | browser | S2n.gp5 | before/after screenshots, saved file | about 10 min | 0 |
| T05 | MediaPipe Studio hand landmarker | browser, maybe Google account | R3b, R3a | screenshots, speed, delegate | about 10 min | 0 |
| T06 | Klangio Guitar2Tabs + Klangio Transcription Studio | browser | S2s, S5capo2, S5dropd, R1a, R2, S2n_0-15s; S4 (part B) | PDFs (or exports), screenshots, notes | about 10 min | 0 (Pro $6.25/mo billed annually) |
| T07 | AnthemScore Web | browser, consent tick | S2s, R1a, R2, S5dropd | screenshots, downloads, notes | about 10 min | 0 (Plus $8.33/mo) |
| T08 | Songsterr AI | browser, email | S2s, S5capo2, S5dropd | screenshots, downloads, minutes to email | about 10 min + 5-15 min wait | 0 for 20 s preview |
| T09 | Songscription | browser, account if asked | S2s, S5dropd, R1a | exports, screenshots, notes | about 10 min | 0 (first 30 s) |
| T10 | audio2guitar | browser, account if asked | R1a, S2s, S5dropd (MP3) | exports, screenshots, notes | about 10 min | 0 (3 songs) |
| T11 | AAPA AutoTabs | browser, account if asked | R3a, R3b, R3c (MP4) | exports, screenshots, notes | about 10 min | 0 (free tier) |
| T12 | Moises | browser, account if asked | S4, R2, S7flat30 | screenshots, stems, notes | about 10 min | 0 (free tier) |
| T13 | Chordify | browser, account if asked | S3, S7flat30, R2 | screenshots, downloads, notes | about 10 min | 0, or Premium (not read) |
| T14 | ChordU | browser | S3, R2 | screenshots, prices page, notes | about 10 min | not read |
| T15 | Note2Tabs | browser, account | S2s, R1a, S5dropd | exports, screenshots, notes | about 10 min | 0 (10 credits/mo) |
| T16 | Cesure | browser, account | S2s, R1a, S3, S7flat30 (MP3) | exports, screenshots, notes | about 10 min | 0 (3 a month) |
| T17 | RiffToTab | browser | S2s, S2s.mid | MIDI, GP exports, screenshots | about 10 min | 0; tab step Pro $3.99 first month |
| T18 | Fretwise | browser | S2s, R1a, S5dropd | MIDI, MusicXML, GP, screenshots | about 10 min | 0 (3 a month) |
| T19 | GuitarConvert | browser, account if asked | S2s, R1a | MIDI, MusicXML, screenshots | about 10 min | 0 (30 s) |
| T20 | Guitar Learning | browser, webcam, guitar | none (live) | screenshots, notes | about 10 min | 0 |
| T21 | SAM Audio | browser; or HF token (agent); or GPU, install, HF approval | S4, R2, R3a | outputs, prompts | not stated | 0 |
| T22 | AudioSep | browser; or GPU, install | S4, R3a, S6taps, R2 | outputs, prompts, times | not stated | 0 |
| T23 | YourMT3+ | browser, HF sign-in | S4, S2n, R1c, R2 | 4 MIDI, screenshot, times | not stated | 0 |
| T24 | MT3 | Google account (Colab) | S4, S2n, R1c | MIDI, screenshot, times | not stated (notebook: 'a few minutes' per clip) | not checked (Colab tier) |
| T25 | MuScriptor | browser; or HF token (agent) | S4, S2n, R1c | MIDI, settings screenshot | not stated | not seen |
| T26 | Beat Transformer | Google account (Colab) | S4, R1a, R2 | beat and downbeat times, screenshot | not stated | not stated (Colab) |
| T27 | Guitab | browser; or GPU, install | S2s, S5capo2, R1a, R1b, R1c, S3 (+ S2n, S5dropd) | GP5 and tokens files, times | not stated (README: a 4-min song well under a minute on a GPU) | 0 |
| T28 | ADTOF (Keras) | Google account (Colab); or install | S6taps, taps stem, S2s, R3a | MIDI or text, screenshot | not stated | 0 |
| T29 | drumsep | Google account (Colab); or install | taps stem | 4 stems per input, screenshot | not stated | not stated (Colab) |
| T30 | Onsets and Frames | Google account (Colab) | S6taps, taps stem, S2s | MIDI, screenshot | not stated | 0 |
| T31 | Klangio Drum2Notes | browser | taps stem, S6taps | downloads, screenshots, notes | not stated | 0 (demo, first 20 s); paid not read |
| T32 | WiLoR | browser | 3 stills | images, 'Hands Detected', seconds | not stated | 0 |
| T33 | SAM 3 | browser | R3a_cu | 4 videos, times | not stated | 0 |
| T34 | Grounding DINO + OWLv2 | browser | 3 stills | screenshots, thresholds | not stated | 0 |
| T35 | TAPIR / BootsTAPIR / TAPNext | Google account (Colab) | R3a_cu | video with tracks, time | not stated | not stated (Colab) |
| T36 | Roboflow Universe guitar models | Roboflow account | 3 stills | license and result screenshots, JSON | not stated | 0 (Free Tier) |
| T37 | Soundslice | account | S2n.gp5, S5capo2.gp5, S2n.wav | screenshots, exports, plan, sync time | not stated | as shown on sign-up |
| T38 | Flat.io | account (token for agent) | S2n MusicXML, S2n.gp5 | screenshots, MusicXML | not stated | as shown on sign-up |
| T39 | alphaTab | browser, speakers | S2n.gp5 | note by ear, phone video | not stated | 0 |
| T40 | xAI API terms + OpenAI API terms | browser | none | saved pages, date | not stated | 0 |
| T41 | Tabtify | account, paid | S2s, S5capo2, S5dropd | exports, screenshots, notes | about 10 min | $15/mo or $99/yr |
| T42 | AudioEstimate | HF account, consent | none | conditions, 4 files if granted | not stated | 0 |
| T43 | Hugging Face token | account, key | (agent: S2n, S4) | nothing | not stated | 0 |
| T44 | Klangio API | account (application), key | (agent: 15 s excerpts) | nothing | not stated | 0 (Basic) |
| T45 | AudioShake | account, key | (agent: S4) | nothing | not stated | 0 (10 free credits) |
| T46 | MVSEP | account, key | (agent: S4) | nothing | not stated | 0 (Limited); $3 for 60 credits |
| T47 | Hooktheory API | account | none | nothing | not stated | 0 |
| T48 | StemSplit API | account, key | (agent: S4) | nothing | not stated | 0 (5 free minutes) |
| T49 | Replicate | account, key | (agent: S4, S3) | nothing | not stated | about $0.0049 to $0.059 a run |
| T50 | MusicGPT API | account, key | (agent: S2n) | nothing | not stated | $0.014 + $0.01/min |
| T51 | fal.ai Demucs + Mureka Music Transcription | account, key, credit | (agent: S4, R2) | nothing | not stated | $0.0007/s; Mureka $0.20 a song |
| T52 | Music.AI | account, key, credit | (agent: S4) | workflow slug or screenshot | not stated | about $0.11 for S4 |
| T53 | OpenAI gpt-audio-1.5 | account, key | (agent: S3 ...) | nothing | not stated | per token ($32/1M audio in) |
| T54 | Qwen-Omni | account, key | (agent: S3 ...) | nothing | not stated | per token |
| T55 | Gemini API | existing key, credit | (agent: S3, S4, S2n, R3a, S5capo2) | nothing | not stated | $5 minimum top-up |
| T56 | Vercel AI Gateway | existing key, credit | (agent) | nothing | not stated | amount you pick |
| T57 | Fadr | Fadr Plus, key | (agent: S4) | nothing (or web-app exports) | not stated | $10/mo or $100/yr |
| T58 | LALAL.AI | paid plan or pack, key | (agent: S4) | nothing | not stated | Pro $15/mo; packs from $50 |
| T59 | BTC | install | S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2, R2full | out folder, console | about 15 min + install | 0 |
| T60 | Banquet | GPU, install | S3 (query), S4, R2 | 2 outputs, console, time | not stated | 0 |
| T61 | python-audio-separator + BS-RoFormer-SW + BS-RoFormer + htdemucs_6s + Mel-Band RoFormer | GPU, install | R2full, S4, R2 | stems, console, GPU screenshot | not stated | 0 |
| T62 | htdemucs-6s-guitar-ft | install (GPU optional) | S4, R2, S2s | 3 guitar stems, console, times | not stated | 0 |
| T63 | MuS3D + ZeroSep | GPU, install, WSL | R2, S4 | outputs, trace.txt, times | not stated | 0 |
| T64 | Gaborformer | GPU, install | S4, R2, S6taps | stems, console, times, GPU screenshot | not stated | 0 |
| T65 | CREPE | install | S1, R1b | 4 f0 CSV, versions, times | not stated | 0 |
| T66 | MELODIA Vamp plugin | WSL, download form | S4, S4 lead stem, R2 | 3 txt, plugin list | not stated | 0 (non-commercial) |
| T67 | Omnizart | Google account (Colab), Docker, install | S2n, S4, R2, S3, R1a-c, S6taps, taps stem, S2s, R3a | MIDI, CSV, times, errors | not stated | 0 |
| T68 | Sheet Sage | WSL, Docker | R2, S4 | output folders, times | not stated | 0 |
| T69 | Timbre-Trap + MR-MT3 + mt3-pytorch + hFT-Transformer | coding agent, install, GPU for MR-MT3 | S2n, S3, S4, R1c | JSON, MIDI, times | not stated | 0 |
| T70 | PENN | install | S1, R1b, S4 lead stem | pitch files, versions, times | not stated | 0 |
| T71 | Deep Salience + melodyExtraction_JDC + melodyExtraction_SSL | Docker; coding agent, install | S1, R1b, S4 lead stem, R2, S2n, S2s, R1c | outputs, installs, times | not stated | 0 |
| T72 | mt3-infer + yourmt3 | install (GPU optional) | S2n, R1c, S4 guitar stem | MIDI, times, pip freeze | not stated | 0 |
| T73 | Aria-AMT + Onsets and Velocities + SOME + GAME + ROSVOT + VocalParse | coding agent, install, GPU for Aria-AMT | S2n, R1c, S4 lead stem, R2 | outputs, installs, times | not stated | 0 |
| T74 | S-KEY | install | 10 clips | keys, times | not stated | 0 |
| T75 | All-In-One (allin1) | GPU, install (NATTEN build) | S4, R1a, R1c, R2, R2full | JSON, R2full time | not stated | 0 |
| T76 | tempo-cnn | install | 9 clips | tempos, times | not stated | 0 |
| T77 | guitar tuning classifier (Hulme et al.) | install, code not in repository | S5dropd, S2n | classes or error | not stated | 0 |
| T78 | STONE | Docker | S3, S4, R1a, R1b, R1c, R2 | npz, labels, console, times | not stated | 0 |
| T79 | key-cnn | install (Python 3.7) | S3, S4, R1a, R1b, R1c, R2 | out folder, console, times | not stated | 0 |
| T80 | BeatNet+ | WSL, install | S3, S4, R1a, R1b, R1c, R2 | out folder, console | not stated | 0 |
| T81 | mixedkey | Go install | 10 clips | out folder, console, time | not stated | 0 |
| T82 | hf_midi_transcription | GPU, install | S2n, S3, R1b, R1c | MIDI, console | not stated | 0 |
| T83 | gtrsnipe | install | merged MIDI files | tab files, MIDI, help.txt | not stated | 0 (non-commercial license) |
| T84 | ADTOF-pytorch | GPU, install | S6taps, taps stem, S2s, R3a | 4 MIDI, screenshot, seconds | not stated | 0 |
| T85 | Cluster and Separate (piano_svsep) | install | 2 MusicXML (lane samples) | 2 MEI, screenshot | not stated | 0 |
| T86 | McLeod voice-splitting | Java, Git Bash | 1 MIDI (lane samples) | voice files, screenshot | not stated | 0 |
| T87 | ADT_STR | install (GPU optional) | S6taps, taps stem, S2s, R3a | MIDI, screenshot | not stated | 0 |
| T88 | Inverse Drum Machine | install (Poetry) | S6taps | stems, class list, screenshot | not stated | 0 |
| T89 | LarsNet | install (GPU optional) | taps stem | stems, screenshot | not stated | 0 |
| T90 | MidiBERT-Piano | a check first; install | 6 MIDI (lane samples) | 6 MIDI or 'nothing new' | not stated | 0 |
| T91 | ADTLib | Docker | S6taps, taps stem, S2s | onsets, PDF tab, seconds | not stated | 0 |
| T92 | Separate-and-Detect | GPU, WSL, install, 6.4 GB | S6taps, taps stem, S2s | transcriptions, stems, times | not stated | 0 |
| T93 | HaMeR + Hamba | GPU, MANO account, coding agent | 3 stills, R3a_cu frames | demo_out, time per image | not stated | 0 |
| T94 | YOLO-World | coding agent, install | R3a, R3a_cu frames | results.json, frames | not stated | 0 |
| T95 | OpenPose | GPU, download | R3a_cu | JSON, video, time | not stated | 0 (non-commercial) |
| T96 | Practice Pro - AI Music Tools | phone (iOS) | none | screenshots or 'not found' | 2 min | 0 |
| T97 | AnthemScore 6 desktop | install (trial) | S2s, S5dropd, S5capo2, R1a, R2 | license.txt, exports, notes | about 10 min | 0 (trial) |
| T98 | Transcribe! | install (trial) | S3, S7flat30, S2s | screenshots, chords text, cents | about 10 min | 0 (30 days); $39 |
| T99 | Melodyne 5 studio | install (trial), internet | S2s, R1a, S7flat30 | MIDI, screenshots, tuning | about 10 min | 0 (30 days) |
| T100 | RipX DAW PRO | install (trial) | S4, R2, S2s | MIDI, stems, screenshots | about 10 min | 0 (21 days); $198 |
| T101 | ScoreCloud | install | R2, S4 (MP3), S1, S2s | exports, screenshots | about 10 min | 0 (10 songs / 10-day trial) |
| T102 | MIDI Guitar 2 or 3 | install, DAW | S2s, R1a | 2 MIDI, notes | about 10 min | 0 (trial); $149.95 |
| T103 | Chord ai | phone (iOS) | S3, S5capo2, S5dropd, R2 (MP3) | screenshots, exports | about 10 min | 0; Pro $10.99/mo |
| T104 | Yamaha Chord Tracker | phone | S3, R2 (MP3) | screenshots | about 10 min | 0 |
| T105 | Fender Studio | phone (iOS) | S3, R2 (MP3) | screenshots | about 10 min | not read |
| T106 | Capo | Mac or iPhone/iPad | S3, R2 (MP3) | screenshots, MIDI (Mac, paid) | about 10 min | 0 (Free Edition) |
| T107 | MuseScore Studio 4 + FretPath | install | GP5 files, merged MIDI | screenshots, MusicXML, version | about 15 min (part A) | 0 |
| T108 | HAYA-TAB | download | GP5 files, S2n.export.gp | version, screenshots, answers | about 15 min | 0 |
| T109 | Sonic Visualiser + Vamp Plugin Pack (QM plugins, Chordino) | install | S3, S4, S7flat30, R1a, R1b, R2, S6taps, taps stem, S2s | CSV layers, 2 screenshots | about 20 + 15 min | 0 |
| T110 | NeuralNote | install | S2n, S4, R1c | MIDI, screenshots, device, times | not stated | 0 |
| T111 | Tony | install | S1, R1b, S4 lead stem | note and pitch CSV, version | not stated | 0 |
| T112 | Mixxx + libKeyFinder (keyfinder-cli) | install; WSL for the CLI | 11 clips | screenshots, keys, times | not stated | 0 |
| T113 | TuxGuitar | install | S2n.gp5, merged MIDI | screenshots, GP5, MusicXML | not stated | 0 |
| T114 | Guitar Pro 8 | install (7-day demo) | S2n.export.gp, S2n.gp5, S5capo2.gp5 | screenshots, MusicXML | not stated | 0 (demo); $69.95 |
| T115 | Ableton Live (Convert Drums to New MIDI Track; optional Convert Harmony and Melody) | owned Live Standard or Suite | taps stem, S6taps; S2n, S1 (optional) | 2 to 4 MIDI, version | not stated | paid (USD 279 offer) |
| T116 | hand-labelled frames | video player | R3b, R3a_cu | 2 lists, 2 screenshots | a few minutes | 0 |
| T117 | body-tap recordings (Freesound 674811, Erik Mongrain AirTap, RT1, Racer Sessions) | Freesound account | RT1 (archive.org) | 2 files, RT1 list, decision | not stated | 0 |
| T118 | capo clip pair | guitar, capo, phone on a stand | your own video | 2 videos, capo type and fret | not stated | 0 |
| T119 | ChordAR | install, webcam, printed markers | none (live) | screenshots, notes | not stated | 0 |
| T120 | browser-timing-check.html | Chrome | none | copied JSON, power setting, Chrome version | about 9 min + model parts | 0 |


## Verification log (verify-for-aaron, 2026-11-12)

An independent check of this file against the lane files, the live pages and `inputs/INPUTS.md`, made on 2026-11-12
after the file was assembled. Every change is listed; nothing was run on the box except HTTP requests and file reads.

**Checked against the lane files.** Every test (T01 to T120) was read next to its lane's `for-aaron.md` item, and the
"written for this file" tests next to the `survey.md`, `trials.md` and `tools.json` lines they cite (T31, T48, T50,
T53, T54, T60, T73, T115, T118, T119). All 196 web addresses in the tests were matched against the lane files: 192 are
in them; the other 4 (StemSplit's `/upload` and `/jobs` addresses, OpenAI's chat-completions address, the Python
`venv` page) were re-opened and match. The 15 relative links and the 28 repository paths resolve (lane script paths
are under `lanes/<lane>/scripts/`). Facts checked one by one against the lane files with no change needed include:
T05 and Section 5 (R3b: "5 / 445 / 0" frames with 0 / 1 / 2 hands, the one hand found is the fretting hand; R3a wide
shot: 215 detections in one 20-px cell; medium shot 0.1787), T20's README quote, T21's `lpeterl/sam-audio-webui`
refusal (r0162), T36's two HTTP 401 answers, T40's OpenAI "Enable JavaScript and cookies to continue", T47's
Hooktheory terms, T73's six tools (`survey.md` items 28, 29, 33, 35 and the SOME/GAME entry), T83's first chord (G2
on string 6 fret 3, G3 on string 3 open, at 2.143 s in `S2n.truth.json`), T88's 8 `KD` and 24 `SD` onset times (equal
to the `thump` and `slap` taps of `S6taps.truth.json`), T93's Hamba license and install line, the access-needs section
(16 quoted facts found in the lane files), and 10 of the 36 rows of Section 7 (rows 1, 2, 3, 12, 15, 28, 29, 30, 32,
35) in the lanes' `trials.md`.

**Clip ids and file names.** All 17 clip ids exist in `INPUTS.md`, and the clip table's durations, tempi, keys, note,
beat, chord and tap counts and licenses match it. The library names of the 26 files are the names in the studio
staging folder of the clips run (`S4_stem_bass.wav` ... `S6taps_stem_taps.wav`, `R3a.wav` ... for INPUTS.md's
`stems/<name>.wav` and the videos' audio). R3a_cu and RT1 are lane inputs (video lane `inputs.md`; fingerstyle lane
input from archive.org), not INPUTS.md clips, and the tests say so; the archive.org items were re-read through the
archive.org metadata API (licenses CC BY-SA 4.0, CC0 1.0, CC BY 3.0, Public Domain Mark 1.0; `crescendo313_2014_09_04_0.mp4`
175,074,292 bytes, "h.264").

**Prices and free-tier limits re-opened on 2026-11-12** (date read: 2026-11-12 for every line).

| Test | Page | Result |
|---|---|---|
| T06 | klang.io/guitar2tabs, klang.io/terms §5.2.1 | terms match (no account, 30 demo transcriptions a day, 20 s, PDF with watermark, no Edit Mode, non-commercial); the Pro price is drawn by a script and was not readable; klang.io/pricing answered 404. Noted in T06 |
| T06 part B | klang.io/transcription-studio | read for the new part B |
| T07 | lunaverus.com/transcribe/pricing | matches (Free "30 second transcriptions", Plus "$8.33 / month", "$99.90 billed annually", the 14-day trial sentence) |
| T08 | songsterr.com/help; App Store id399211291 | match (20-second preview, Plus, "5–15 minutes", settings sentence; "Songsterr Plus $9.99") |
| T09 | songscription.ai/pricing | matches |
| T10 | audio2guitar.com | "3 free songs" and the 97.8% sentence match; "MP3 only" is not on the home page now (the lane read it on 2026-11-10) |
| T11 | aapamusic.com/pricing | matches (Free $0, "AAPA is free to use..."); "early access" appears there with a beta promo |
| T12 | moises.ai | matches |
| T15 | note2tabs.com/pricing | matches |
| T16 | cesure.app | changed wording: "3 AI transcriptions a month — empty results don't count"; prices match. T16 updated |
| T17 | rifftotab.com | matches |
| T18 | fretwise.ai/pricing | matches |
| T19 | latouchemusicale.com GuitarConvert | matches |
| T31 | klang.io/drum2notes | quotes match; free-tier sentences added to T31 |
| T32, T33 | huggingface.co/docs/hub/spaces-zerogpu | matches (2 minutes "Low" unauthenticated, 5 minutes "Medium" free account) |
| T36 | roboflow.com/pricing | matches ("10 credits included a month"; Core "$39per month, billed monthly") |
| T41 | tabtify.com/pricing | matches |
| T44 | klang.io/api | matches |
| T45 | developer.audioshake.ai quickstart, faq, models | match (10 free credits; 1.0 credit per minute for `guitar`; the FAQ reads "Duration is rounded up to the nearest minute"; the billing page was not re-read) |
| T46 | mvsep.com/en/plans | matches |
| T47 | hooktheory.com/api/trends/docs | matches (no price stated; rate limit and token lifetime as quoted) |
| T48 | stemsplit.io/pricing, stemsplit.io/llms.txt | match |
| T49 | replicate.com/pricing and the three model pages | changed: demucs "$0.0049" (was $0.0050), all-in-one "$0.059" (was $0.062); T4 and the chord model match. T49 and its checklist row updated |
| T50 | docs.musicgpt.com pricing and audio_to_midi endpoint | match; "Max input audio length" is on the pricing page, so T50 now says so |
| T51 | fal.ai llms.txt of `fal-ai/demucs` and Mureka | match |
| T52 | music.ai/pricing | prices match; the FAQ sentence was not in the fetched text (FAQ linked only) |
| T53 | OpenAI pricing.md and the chat-completions reference | match |
| T54 | Alibaba model-pricing page and the Qwen-Omni page | match; the "* 7" audio formula is on the Qwen-Omni page (T54 now cites it); no Singapore endpoint address on either page (still UNVERIFIED) |
| T55 | aistudio.google.com/docs/billing and /docs/pricing | match |
| T56 | vercel.com/docs/ai-gateway/pricing | matches |
| T57 | fadr.com/docs/api | matches |
| T58 | lalal.ai/pricing | matches (shown with "$") |
| T97 | lunaverus.com/download and /compareEditions | match |
| T98 | seventhstring.com download and buy pages | match ("30 days evaluation"; "$39 for a single copy") |
| T99 | celemony.com/en/trial | changed wording of the 30-day sentence; T99 updated |
| T100 | buy.hitnmix.com | showed GBP to the box's region; trial, platforms and minimum system match. T100 notes it |
| T101 | scorecloud.com | matches |
| T102 | jam.live/shop and jam.live/products/MG3 | match |
| T103 | App Store id1446177109 | matches |
| T104 | App Store id992502589 | matches ("Free") |
| T106 | supermegaultragroovy.com/products/capo | matches |
| T107, T112, T109 | musescore.org (4.7.6), mixxx.org (2.5.6), sonicvisualiser.org (5.2.1) | match |
| T114 | guitar-pro.com buy page | "$69.95" matches; the home page now says "free for the first 7 days" |
| T115 | ableton.com shop, compare-editions, Live 12 manual | match; T115 gained the menu location, the offer's end ("until the release of Live 13 in early 2027") and the trial link |

Not re-readable from the box: Klangio's Pro price (script-drawn), Chordify and ChordU (no price stated in the tests),
Fender Studio (none stated).

**Other links opened on 2026-11-12** (a sample of 72 across the sections): the READMEs of 26 repositories through
raw.githubusercontent.com (BTC, Mus3D, Gaborformer, S-KEY, STONE, the tuning classifier, BeatNet+, gtrsnipe,
ADTOF-pytorch, piano_svsep, voice-splitting, ADT_STR, Inverse Drum Machine, LarsNet, Separate-and-Detect, HaMeR,
OpenPose's installation doc, FretPath, ChordAR, Guitab, hf_midi_transcription, ADTOF, drumsep, NeuralNote, ZeroSep,
Sheet Sage): all answered 200, and 59 quoted phrases were found in them (8 only after line breaks or link markup were
allowed for); 11 Hugging Face Spaces and 11 models through the Hugging Face API (stages and gates as stated:
AudioSep `RUNTIME_ERROR`, HaMeR `BUILD_ERROR`, the others `RUNNING`; `facebook/sam3`, `facebook/sam-audio-small` and
`DionTimmer/audioestimate-1.0` gated "manual", `MuScriptor/muscriptor-small` "auto"); 4 archive.org items; and 20
pages by status (the three Colab notebooks' sources, demucs-rs, muzart, Guitab's page, Guitar Learning, the alphaTab
playground, Tony, the Vamp Plugin Pack, TuxGuitar, Python 3.7.9's installer, Zenodo 13694558, the MANO site, the
Erik Mongrain file page, muscriptor.kyutai.org, basicpitch.io: 200; go.dev/dl: 405 to a HEAD request; github.com
releases and freesound.org: 403, as the lanes recorded for this box).

**Changes made.**
- T06: added part B, Klangio Transcription Studio (marked `for_aaron` in the apps-survey `tools.json` and missing from
  this file); noted that Klangio's Pro price could not be re-read. Checklist row updated.
- T16 (Cesure), T31 (Drum2Notes), T49 (Replicate), T99 (Melodyne), T100 (RipX), T115 (Ableton): prices or terms
  brought to what the pages showed on 2026-11-12 (above). T115 also covers the audio-to-notes lane's Ableton "Convert
  to MIDI" entry (optional steps 3 and 4, from the Live 12 manual); the lane table and checklist rows follow.
- T22: "account: none for the Space" had no source; now "not stated". Its step 2 now states what the code writes
  instead of what the output "should" be.
- T26, T29, T35: "cost: 0" for a Colab notebook had no lane source (the fingerstyle lane's "free Colab" covers T28 and
  T30 only); now "not stated by the lane", and the three checklist rows follow.
- T59: says where `btc_run.py` comes from (this research's repository).
- T61: the UNVERIFIED mapping of the 913 MB checkpoint is settled (HTTP HEAD on the audio-separator `model-configs`
  release: `vocals_mel_band_roformer.ckpt` 913,106,900 bytes; `model_mel_band_roformer_ep_3005_sdr_11.4360.ckpt`
  1,007,816,988 bytes).
- T73: VocalParse is not in the audio-to-notes trials; the lane's docs verifier added it to `survey.md`.
- T75: notes that `make` is not part of Windows or of the setup.
- T95: "the portable demo is the GPU build" had no source; replaced by the installation doc's own sentence.
- T104: no longer asks which Android phone you used (only that it was Android), so no device model comes back.
- T118: the optional step no longer says the takes "would" have a known tab; it says which truth is the intended tab.
- T50 and T54: source attributions corrected (pricing page; Qwen-Omni page).
- "Sending results back": added the file-naming rule and a table of what `gtr-eval` reads for each kind of returned
  file (from the apps-survey lane's scoring table and the gtr-eval README; every option named was found in the README).
- "Three things only you can decide", item 3: dated (the key-store checks were the hosted-apis lane's, 2026-11-10 and
  2026-11-11).
- "Not run, and nothing you can run": 4 rows (6 tools) added from the lanes' `tools.json`; a table of 12 tools whose
  reason you could change but with too little recorded for steps; the apps-survey lane's 14 apps not tested with the
  shared clips; a closing count of the remaining `tried: false` entries by lane.
- "The ten lane lists": the apps-survey count corrected (28 numbered headings, test 13 removed: 27 tests), and a column
  with each lane's `for_aaron` count from `tools.json` (159; the earlier index gave 154).
- Top paragraph: tools covered 139 (was 138, plus Klangio Transcription Studio; counted from the checklist, names
  split at " + ", T116 to T118 and the T120 page left out); "57 more tools" became 63, and the two new lists are named.

**Commands.** Section 3's PowerShell lines were read for the shell they run in: activation by `Activate.ps1`, `$env:`
for variables, quoted arguments wherever `<` or `[` occur, `foreach`, `Get-ChildItem | ForEach-Object` and
`Measure-Command` blocks, `${PWD}` for Docker; the WSL, Git Bash and Docker-container lines are marked as such.
Package names, versions and model files match the lane files and the READMEs above; PyPI's JSON API (2026-11-12)
knows 22 of the names the commands install (`audio-separator` 0.48.0, `tempocnn`, `allin1` 1.1.0, `mt3-infer` 0.2.0,
`yourmt3` 0.1.4, `penn`, `crepe` 0.0.16, `omnizart` 0.6.3, `ADTLib` 2.1.2, `hear21passt`, `torch-audiomentations`,
`pytorch-lightning`, `demucs`, `huggingface-hub`, `poetry`, `torchmetrics`, `omegaconf`, `fire`, `madmom` 0.16.1,
`torbi` 1.4.1, `uv`, `natten`), and answers 404 for `gtrsnipe` and `hf-midi-transcription`, which the tests install
from their repositories, as they say. The curl lines of Section 2 read each key into a variable with `getkey.py` and print
none. No key, token or private link is in the file (pattern search for key formats; no library address; the only
device model in the file is the "RTX 4090" of the Banquet README's own sentence, which is not your device).

**Words.** A search for ranking and advice words found them only inside quotations of vendors and READMEs ("easiest",
"recommended", "best", "should") and in factual uses ("must print `True`"); none was changed except T22's step 2.

**Counts.** 120 tests in sections of 41, 17, 37, 20, 4 and 1; 120 checklist rows; the checklist's tool, clip, time and
cost columns were compared row by row with the tests (rows T06, T31, T49 and T115 changed with their tests). Section
7: 36 rows, 37 refusals (33, 1, 3). File size after this log: under 300 KB.

**Still UNVERIFIED after this check** (each is marked where it stands): the request bodies of StemSplit, Flat.io and
Fadr; how MusicGPT returns a result; Qwen-Omni's endpoint address for Singapore; where the OpenAI, StemSplit, MusicGPT
and Qwen keys are created; the PowerShell forms of the lanes' Command Prompt lines (not run anywhere); Klangio's Pro
price on 2026-11-12; every "(written for this file)" step, which no one has run.
