# For Aaron: testing the existing tab and chord apps yourself (lane 9, apps-survey)

Written 2026-11-10 by the `try-apps-survey` agent. None of these apps could be run to a result on the research box
(see `trials.md`: the desktop programs could not be started there, and the web apps need an account, a payment, or a
tick that accepts their terms and states that you hold the rights to the audio, which only you can give). So each
app below has a test of about 10 minutes for you, on your Windows 11 laptop, in a browser, or on a phone. Prices,
features and terms quoted here come from the vendors' pages as read on 2026-11-10 (`survey.md` has the quotes and
links); check the price on screen before you pay anything.

Do them in the order given: sitting 1 is web apps that are free, sitting 2 is free Windows trials, sitting 3 is phone
apps, and the paid ones are last and optional. You do not need to do all of them; each test stands on its own.

## Before you start (once, 5 minutes)

1. **Get the test clips.** The orchestrator files the shared clips in your studio library with this research. Use
   these files (the same ids are used in every lane, so results can be scored against the known answers):

   | Id | File | What it is | Length |
   |---|---|---|---|
   | S2s | `S2s.wav` (or `S2s.mp3`) | synthesized fingerstyle guitar, two voices, G major, 112 BPM, standard tuning, no capo; the exact tab is known | 29.4 s |
   | S5capo2 | `S5capo2.wav` / `.mp3` | the same tab played with a capo on fret 2 (sounds in A major) | 29.4 s |
   | S5dropd | `S5dropd.wav` / `.mp3` | the same piece in Drop D (low string tuned down to D) | 29.4 s |
   | S3 | `S3.wav` / `.mp3` | synthesized strummed chords, G major, 96 BPM; chords known | 24.0 s |
   | S7flat30 | `S7flat30.wav` / `.mp3` | S3 played 30 cents flat (tests tuning detection) | 24.0 s |
   | S4 | `S4.wav` / `.mp3` | synthesized band (drums, bass, strummed guitar, lead), D major, 116 BPM; chords, beats and stems known | 38.7 s |
   | R1a | `R1a.wav` / `.mp3` | a real acoustic guitar recording from the GuitarSet dataset, with its per-string note annotation | 29.2 s |
   | R2 | `R2.wav` / `.mp3` | a real band song with singing (Josh Woodward, CC BY 4.0); no answer key | 36.0 s |
   | R3a | `R3a.mp4` | a real classical-guitar concert video, 640x480, camera cuts; no answer key | 18.0 s |
   | R3b, R3c | `R3b.mp4`, `R3c.mp4` | closer videos of the hands, if the inputs agent managed to add them (see `../../inputs/INPUTS.md`) | |

   On the research box the WAV and MP4 files are in `/home/user/gtr/inputs/<id>/` and the MP3 copies in
   `/home/user/gtr/lanes/apps-survey/out/clips-mp3/`. The MP3s are about 0.03 s longer than the WAVs (encoder
   padding), so use the WAV wherever the app takes it.
2. **Make a folder** `tab-app-tests` on the laptop with one subfolder per app (for example `tab-app-tests\klangio`).
3. **Do not give an app hints** (key, tempo, tuning, capo) unless the step says so. The first run of each clip shows
   what the app finds by itself; where a step says "second run", set the hint and run again.
4. **For every run, write one line in `notes.txt`** in that app's folder, in this form:

   ```
   app + version | plan (free / trial / paid, and what you paid) | clip id | settings changed from default |
   minutes from pressing the button to seeing the result | key, tempo, time signature, tuning, capo as the app shows them |
   files exported | anything odd (cut at 20 s, error message, wrong instrument ...)
   ```

5. **Save from every run:** each export the app allows on that plan (MIDI, MusicXML, Guitar Pro, PDF, CSV), named
   `<app>_<clip>.<ext>`, and one screenshot of the result screen (Win+Shift+S) named `<app>_<clip>.png`.
6. **Sending it back:** zip `tab-app-tests` and give the zip to the next research session (or put it in the studio
   library and say which run it is). A later agent scores the exports against the answer keys with `gtr-eval`.

**Rights and terms.** Several apps ask you to confirm that you own or have the rights to the audio and to accept
their terms before they transcribe. The clips are ours or freely licensed: S-clips were made for this research
(public-domain melodies, arrangements written for it, MIT-licensed SoundFont), R1a is GuitarSet (CC BY 4.0), R2 is
CC BY 4.0, R3a is CC BY-SA 4.0 (`../../inputs/INPUTS.md` has the quotes). Whether to tick those boxes and accept the
terms is your decision; the research box was not allowed to do it for you.

## Sitting 1: web apps with a free tier (about 80 minutes, cost 0)

### 1. Klangio Guitar2Tabs (free demo, no account needed)

What the free tier is (Klangio terms §5.2.1): no account, 30 demo transcriptions a day, each limited to 20 seconds,
PDF export only (with a watermark), no Edit Mode. Full transcriptions need Guitar2Tabs Pro ("$6.25 /month Billed
annually" on the pricing table read 2026-11-10).

1. Open https://klang.io/guitar2tabs/ and start a transcription by uploading `S2s.wav`.
2. The Transcription Wizard opens. Choose guitar. At the step "Choose the tuning and capo", leave standard tuning and
   no capo, or let Klangio apply the settings itself (the wizard offers both). Start it.
3. When the tab appears: screenshot, then download the PDF.
4. Repeat with `S5capo2.wav` twice: first with the default settings (note what capo and key it shows), then with capo
   set to 2 in the wizard.
5. Repeat with `S5dropd.wav` twice: first default, then with the tuning set to Drop D.
6. Repeat once each with `R1a.wav` and `R2.wav` (defaults).

Send back: 7 PDFs and 7 screenshots, `notes.txt` (time per run, what it showed for capo and tuning on the S5 runs).

### 2. AnthemScore Web (free plan, 30 seconds; no account was needed to upload)

The research box got as far as the settings page (screenshot in `samples/anthemscore-web/job_settings_S2s.webp`).
Free plan: "30 second transcriptions"; PDF, MIDI and musicXML download are listed for the paid Plus and Pro plans.

1. Open https://www.lunaverus.com/transcribe/audio-to-guitar-tab and choose `S2s.wav`. The upload starts by itself
   and the settings page opens ("Transcribing up to 30 seconds").
2. Leave "tablature" selected and "Instruments: Guitar". Open "Advanced Options" only to screenshot what it offers
   (time signature, key signature, smallest note); leave them on their defaults.
3. Tick "I confirm that I own or have obtained all necessary rights to transcribe this audio." if you agree, then
   press "Transcribe". Time it.
4. On the result: screenshot the whole page, including any tempo, key and chord line at the top. Open the Download
   menu and screenshot it (to see which formats the free plan allows); download whatever is not locked.
5. Repeat with `R1a.wav`, `R2.wav` (it keeps the first 30 s) and `S5dropd.wav`. The web form has no tuning or capo
   field, so no second run.

Send back: screenshots, any downloads, `notes.txt`.

### 3. Songsterr AI (free 20-second preview; you will probably need to sign in, since it emails you when done)

Songsterr's help: "You can start with a free 20-second preview. Full-length transcription is included in Songsterr
Plus"; "A tab is usually ready in 5–15 minutes, and we email you when it's done". Its settings page lets you set the
tuning and a "Capo fret" for each instrument before the run.

1. Open https://www.songsterr.com/new and upload `S2s.wav`.
2. In the settings, leave "First bar time signature", "Pickup bar duration", "First bar tempo (BPM)" and "Triplet
   feel" on "Auto". For the instruments, pick only a guitar row (a "Fingerstyle" row is offered) with "Standard
   6-string (E A D G B E)" and capo 0. Start it, note the time.
3. When the email arrives, open the tab: screenshot. If "Download tab" (MIDI or Guitar Pro) works on the free
   preview, download both.
4. Run `S5capo2.wav` with "Capo fret" 2, and `S5dropd.wav` with a Drop D tuning, the same way. (Songsterr does not
   claim to detect capo or tuning; it uses what you set.)

Send back: screenshots, downloads, `notes.txt` with the minutes until the email came.

### 4. Songscription (free: "The first 30 seconds of each song"; account)

The home page says "At the moment, we only support standard tuning". Its pricing FAQ says "By default, we may use the
audio and transcriptions you submit to help improve our AI models" (Plus and Pro can opt out).

1. Open https://www.songscription.ai, sign up, upload `S2s.wav`, ask for guitar tab.
2. Screenshot the result; export Guitar Pro and PDF if the free plan allows.
3. Repeat with `S5dropd.wav` (to see what it does with a tuning it says it does not support) and `R1a.wav`.

Send back: exports, screenshots, `notes.txt`.

### 5. audio2guitar (free: 3 songs, MP3 only; account)

The vendor states: "Our pipeline achieves 97.8% string assignment accuracy on the GuitarSet benchmark". R1a is a
GuitarSet recording, so its string and fret output on R1a can be scored against GuitarSet's own annotation.

1. Open https://audio2guitar.com, sign up, upload `R1a.mp3` (the free plan takes MP3 only).
2. Screenshot the tab and the header line (the demo shows "Tuning", "Key" and "Tempo"); export MIDI and the PDF if
   the free plan allows.
3. Use the other two free songs on `S2s.mp3` and `S5dropd.mp3` (note the tuning it reports for S5dropd).

Send back: exports, screenshots, `notes.txt`.

### 6. AAPA AutoTabs (video in; free tier; account) — the only released app found that reads the hands from video

The vendor: "AutoTabs listens to the audio and uses machine vision to analyze the guitarist's hands and fretboard".
Its terms §4.2 make sharing your video for training opt-in; leave it off unless you want it.

1. Open https://aapamusic.com, sign up, open AutoTabs and upload `R3a.mp4` (and `R3b.mp4` / `R3c.mp4` if the inputs
   agent added them; they show the hands closer).
2. Screenshot the draft tab and any video overlay; export PDF and MIDI.
3. If it has a capo or tuning setting, note it but leave it on default.

Send back: exports, screenshots, `notes.txt` (time, and whether the result mentions what it saw in the video).

### 7. Moises (free tier: "a limited number of uploads each month"; account)

Moises shows stems, chords, BPM and key; it does not describe note-level tab with string and fret.

1. Open https://moises.ai (web app), sign in, upload `S4.wav` (synthesized band with known chords, beats and stems).
2. Ask for the stem split that includes a guitar stem; open the chord view.
3. Screenshot the chord view and the BPM and key it shows; download the guitar stem and anything else the free tier
   allows (chords as a file if offered).
4. Repeat with `R2.wav` and `S7flat30.wav` (note the key and whether anything mentions the tuning being off).

Send back: screenshots, stems (audio files go to the studio library, not to git), `notes.txt`.

### 8. Chordify (account; uploading your own file may need Premium)

chordify.net answered the research box with HTTP 403 (a Cloudflare check), so its site and terms were not read; its
App Store listing mentions MIDI and PDF downloads of the chords and a capo display option, and third-party pages say
uploading your own file is a Premium feature (not checked). If the upload button asks you to pay, write down the
price shown and skip. While you are on the site, save its terms page as PDF (the research box could not read it).

1. Open https://chordify.net, sign in, upload `S3.wav`.
2. Screenshot the chord timeline; download MIDI or PDF if offered.
3. Repeat with `S7flat30.wav` and `R2.wav`.

Send back: screenshots, downloads, the terms PDF, `notes.txt`.

### 8b. ChordU (optional; its home page lists "Upload" and "My Uploads")

ChordU's terms and prices were not read. If it lets you upload without paying: upload `S3.wav` and `R2.wav`,
screenshot the chords and the BPM it shows, and write down whether it needed an account.

## Sitting 2: free Windows trials on the laptop (about 70 minutes, cost 0)

### 9. AnthemScore 6 desktop (trial: "Limited to first 30 seconds of each song and 100 total transcriptions")

The download page: "No account creation needed, just download and run!" and "By default the trial runs as the
AnthemScore Professional edition"; the Professional edition lists "PDF, MIDI, musicXML, and ASDT export". Whether the
trial lets you export MIDI and musicXML was not checked. AnthemScore's 2019 notes mention fast note finding on CUDA
Nvidia GPUs; whether 6.3.0 uses your RTX 4070 is not known, so note it if the program says.

1. Download the Windows 10/11 installer from https://www.lunaverus.com/download and install it. **Copy the
   `license.txt` that comes with the download into your folder**: the research box could not find it in the Linux
   build, and the site's terms say it is the software license.
2. Open `S2s.wav`. Set guitar tab the way AnthemScore's FAQ describes it: "Enter instrument settings and change the
   instrument to guitar. Then click the gear icon next to it and select "Tablature" under Staffs. Take a look at the
   number of frets and the string tunings under Tablature options and adjust as needed". Leave the rest default.
   Time the transcription.
3. Export: MIDI (.mid), MusicXML, and "Beat and Note Timing (.csv)". Screenshot the tab.
4. Open `S5dropd.wav`, and before transcribing set the strings to Drop D in the tablature options. Its documentation
   says "Strings should be set to the instrument's _written_, not _sounded_, pitches" ("With guitar and bass guitar,
   for example, this is an octave above the sounded pitch"), so the low string is written D3. Export as above.
5. Open `S5capo2.wav` with default settings (there is no capo setting documented) and `R1a.wav` and `R2.wav`; export
   each.

Send back: `license.txt`, all exports, screenshots, `notes.txt` with the time of each transcription.

### 10. Transcribe! 9.70 (30-day evaluation; $39 to buy)

It does not write notes to a file ("Transcribe! does not output MIDI at all."), so this test is screenshots of its
on-screen guesses.

1. Download the Windows version from https://www.seventhstring.com/xscribe/download.html and install it.
2. Open `S3.wav`. On the View menu turn on "note guessing" and "chord guessing", and turn on the Piano Roll. Wait for
   the piano roll to fill (yellow means not computed yet).
3. Screenshot the piano roll for the whole clip, and the chord guess box at about 3, 9 and 15 seconds.
4. Open `S7flat30.wav` the same way. Its help says out-of-tune note guesses show as red blobs; screenshot them. Then
   use its tuning adjustment (Fx window, Tuning page) to centre the notes, and write down the number of cents it needed.
5. Open `S2s.wav` and screenshot the piano roll.

Send back: screenshots, `notes.txt` with the cents value for S7flat30.

### 11. Melodyne 5 studio (30-day trial: "try it out for 30 days – free of charge and without obligation")

Celemony says "Melodyne also recognizes chords, keys, tunings and tempos", so this test also asks what it says
about the tuning of `S7flat30.wav` (30 cents flat).

1. Get the trial from https://www.celemony.com (the trial page may ask for a Celemony account; not checked).
2. Open `S2s.wav` in the standalone Melodyne. Let it detect the notes with its polyphonic algorithm.
3. Export the detected notes as a MIDI file (the exact menu path was not checked). Screenshot the note "blobs".
4. Repeat with `R1a.wav`.
5. Open `S7flat30.wav`: screenshot and write down the tuning (reference pitch or cents) and the key and tempo it shows.

Send back: 2 MIDI files, screenshots, `notes.txt` (time to detect, which algorithm it chose, the S7flat30 tuning).

### 12. RipX DAW PRO (free for 21 days: "Try RipX DAW PRO Free for 21 Days")

1. Install the trial from https://hitnmix.com and open `S4.wav`, then `R2.wav`.
2. Let it separate and detect notes. Export the guitar layer's notes as MIDI and the stems as audio if the trial
   allows. Screenshot the note view.
3. Open `S2s.wav` and export its notes as MIDI.

Send back: MIDI files, screenshots, `notes.txt` (stems go to the studio library).

### 13. (removed) Samplab

samplab.com redirected to apple.com on 2026-11-10; 9to5Mac reported on 2026-10-19 that Apple is acquiring assets of
Samplab GmbH (`survey.md`). Nothing to test.

### 14. ScoreCloud (Studio: "can be used for free up to 10 saved songs"; Songwriter: "10 day free trial")

The site: "ScoreCloud Songwriter takes recordings of voice and instruments and turns it into Lead Sheets, with
melody, lyrics and chords", and Studio records "single-instrument audio" into notation; exports "PDFs, MusicXML,
MIDI". Whether either imports an audio file (rather than recording through the microphone) was not checked; if it
only records, play the clip from the laptop speakers into the microphone and say so in `notes.txt`.

1. Install from https://scorecloud.com. In Songwriter (trial), put in `R2.wav` (song with singing): screenshot the
   lead sheet (melody, lyrics, chords) and export MusicXML and MIDI. Then `S4.wav`.
2. In Studio, put in `S1.wav` (single-note melody with a known answer); export MusicXML and MIDI. If it offers guitar
   tab, try `S2s.wav` as well.

Send back: exports, screenshots, `notes.txt` (file import or microphone).

### 15. MIDI Guitar 3 (Jam Origin; free trial; real time only)

It turns live guitar audio into MIDI as you play, so a recording has to be played through it. Skip this one if you
have no DAW on the laptop.

1. Install the trial from https://www.jamorigin.com (MIDI Guitar 3 is an open beta at www.jam.live per that page).
2. In your DAW put `S2s.wav` on an audio track, insert MIDI Guitar as a plugin on that track, send its MIDI to a MIDI
   track, record while the clip plays, save the MIDI.
3. Repeat with `R1a.wav`.

Send back: 2 MIDI files, `notes.txt` (DAW used, plugin settings).

## Sitting 3: phone apps (about 30 minutes)

Copy the MP3s (`S3.mp3`, `S5capo2.mp3`, `S5dropd.mp3`, `S7flat30.mp3`, `R2.mp3`, `S4.mp3`) to the phone first.

### 16. Chord ai (iOS / Android; free, Pro is "$10.99" a month or "$69.99" a year in the App Store)

Its listing says it can suggest a capo ("Smart capo ... [Pro version]") and handles alternate tunings ("Drop D,
DADGAD, Open D/G/A/C etc. [Pro version]").

1. Install Chord ai; open `S3.mp3` from the phone's files.
2. Screenshot the chord sheet; export PDF or ChordPro if offered.
3. Open `S5capo2.mp3` and `S5dropd.mp3`: screenshot what it says about capo and tuning (if those parts are Pro-only,
   write that down).
4. Open `R2.mp3`.

Send back: screenshots, exports, `notes.txt`.

### 17. Yamaha Chord Tracker (free; reads songs stored on the phone)

The App Store listing: "analyzing the audio songs stored in your iOS device and then displaying the chord symbols",
"with both graphical piano keyboard and guitar tab display options", and it "will not work for songs in iCloud or
protected by DRM" or "with Music Streaming services such as Apple Music". So on an iPhone the MP3s must be copied
into the phone's own music library, not left in iCloud.

1. Install Chord Tracker, add `S3.mp3` and `R2.mp3` to the phone's music library, open them in the app.
2. Screenshot the chord chart for each (once with the guitar display), and anything it shows for tempo and key.

Send back: screenshots, `notes.txt`.

### 17b. Fender Studio: Jam & Record (iOS; other platforms not checked)

Its App Store listing: "Use the Chord Track to create your own chord progressions, or drag audio to it for automatic
recognition". It does not describe tab output.

1. Install Fender Studio, start a project, and drag `S3.mp3` onto the Chord Track (as the listing describes).
2. Screenshot the recognized chords; repeat with `R2.mp3`.

Send back: screenshots, `notes.txt` (what it cost, if anything).

### 18. Capo (Mac, iPhone, iPad only)

Only if you have one of those: open `S3.mp3` and `R2.mp3`, screenshot the detected chords and tempo. Its App Store
listing describes chord, beat and key guesses, not tab.

## Optional and paid (decide first; prices as read 2026-11-10)

- **Klangio Guitar2Tabs Pro** ("$6.25 /month Billed annually"): the full 29 s of each clip, plus MIDI, MusicXML and
  Guitar Pro export and "Retranscribe" with new settings. Re-run test 1 with full length and download MIDI and GP.
- **Songsterr Plus** (App Store in-app price "$9.99"; the site shows no amount without signing in): full-length AI
  tabs with MIDI and Guitar Pro download.
- **Tabtify Pro** ("$15/month" or "$99/year"): its free plan is the editor only ("AI conversion is not included").
  With Pro: upload `S2s.wav`, set "Acoustic Guitar 6-string", run it; then `S5capo2.wav` with capo 2 and
  `S5dropd.wav` with Drop D in its settings; export MIDI, Guitar Pro (.gp) and MusicXML.
- **AnthemScore Web Plus** ("$8.33 / month", "$99.90 billed annually") for full length and downloads, or a free
  account's "14 day trial of full length songs".

## Camera test (optional, your guitar and webcam, 10 minutes)

### 19. Guitar Learning (open source, MIT; https://guitar-learning-ten.vercel.app)

A practice app, not a transcriber: it tracks your fretting hand on a live webcam and checks chord shapes. The research
box could not install it.

1. Open the site in Chrome, allow the camera, and do its calibration: four clicks on the two ends of the nut and the
   two ends of the 12th fret.
2. Play an E minor and a C chord as its lessons ask. Screenshot the overlay when it says a finger is wrong and when
   it accepts the chord.

Send back: screenshots, `notes.txt` (did the strings and frets it drew line up with your real neck; did it lose the
neck when you moved).

## Not worth testing with the shared clips (and why)

- **Ultimate Guitar "AI chords"**: its help article describes a YouTube link as the input; the shared clips are not
  on YouTube.
- **Samplab**: the site redirects to apple.com (see test 13).
- **Soundslice**: no automatic audio-to-notes feature was found; transcription in it is done by hand.
- **Guitar Pro 8** ("With the Guitar Pro free demo, enjoy all the Guitar Pro 8 features for 7 days"): no automatic
  audio-to-tab feature was found; it imports an audio track to transcribe by hand. It is still a program that opens
  the `.gp` / `.gp5` files the other apps export (so is the free TuxGuitar), if you want to look at them.
- **Yousician**, **Rocksmith+**: they listen to you playing along; they do not transcribe a recording you give them
  (Rocksmith+ was not checked in detail).
- **Fender Play, Fender Tune, Fender Songs**: no transcription of your own audio was found for them (Fender Songs,
  2019 press, worked on songs from Apple Music; its current status was not checked). Fender Studio is test 17b.
- **Positive Grid Spark "Auto Chords"**: "*Requires Spark Amp*".
- **TabGenius**: makes a tab from a typed or spoken idea, not from audio.
- **GrabTab**: "Coming soon to iOS & Android" on 2026-11-10.

## For the agent that receives Aaron's zip: how each returned file can be scored

All with `/home/user/gtr/bin/gtr-eval` (README: `../../scripts/gtr-eval/README.md`); quote each `e....` id.

| What comes back | Subcommand | Notes |
|---|---|---|
| MIDI or MusicXML notes (any app) | `gtr-eval notes --truth <id> --est <file>` | Exports that start bar 1 at 0 s are early by the silent count-in bar of the S clips (4 beats: 2.143 s at 112 BPM for the S2 family, 2.5 s at 96 BPM for S3, see `INPUTS.md`); try `--time-shift` with that value and report both numbers. MP3-fed runs may carry about 0.03 s of encoder padding. |
| Guitar Pro 3/4/5 or MusicXML with string and fret | `gtr-eval tab --truth <id> --est <file>` | `.gp` (Guitar Pro 7/8, for example Tabtify's) is refused by PyGuitarPro: open it in Guitar Pro or TuxGuitar and save as `.gp5` first, and say so. |
| Chords read off a screenshot | type them into a `.lab` file (`start end label`), then `gtr-eval chords` | Typing from a screenshot is a manual step: state it next to the number. |
| Tempo or key shown on screen | `gtr-eval tempo --est-bpm <x>`, `gtr-eval key --est-key "<key>"` | |
| Tuning offset for S7flat30 (Transcribe!, Melodyne) | `gtr-eval tuning --truth S7flat30 --est-cents <x>` | |
| Capo or tuning an app reported for S5capo2 / S5dropd | `gtr-eval tuning --truth S5capo2 --est-capo <n>`; `--truth S5dropd --est-tuning-midi 38,45,50,55,59,64` (example) | Only for apps that detected it; Klangio, Songsterr, Tabtify and AnthemScore take capo or tuning as a setting. |
| Stems (Moises, RipX) on S4 | `gtr-eval stems --truth S4 --est-dir <dir> --map guitar=<file> ...` | |
| AnthemScore "Beat and Note Timing (.csv)" | `gtr-eval notes` (check its column names first) | Its column layout was not seen on the research box. |
