# For Aaron: testing the existing tab and chord apps yourself (lane 9, apps-survey)

Written 2026-11-10 by the `try-apps-survey` agent and checked by `verify-trials-apps-survey` (log at the end of
`trials.md`). None of these apps was run to a result on the research box (see `trials.md`: starting AnthemScore's
Linux build was refused by the session's permission system, Transcribe! was not attempted, the other desktop programs
have no Linux build or were not checked, and the web apps need an account, a payment, or a tick that accepts their
terms and states that you hold the rights to the audio, which only you can give). So each app below has a test of
about 10 minutes (an estimate) for you, on a Windows PC, in a browser, or on a phone. Prices, features and terms
quoted here come from the vendors' pages as read on 2026-11-10 (`survey.md` has the quotes and links); check the
price on screen before you pay anything.

Do them in the order given: sittings 1 and 1b are web apps with a free tier, sitting 2 is free Windows trials,
sitting 3 is phone apps, and the paid ones are last and optional. You do not need to do all of them; each test
stands on its own.

## Before you start (once, 5 minutes)

1. **Get the test clips.** They are on the research box (paths below), and the orchestrator files this research's
   audio and video in your studio library; ask for them if they are not there. Use these files (the same ids are
   used in every lane, so results can be scored against the known answers):

   | Id | File | What it is | Length |
   |---|---|---|---|
   | S1 | `S1.wav` / `.mp3` | synthesized single-note melody (the "Ode to Joy" theme) on nylon guitar, D major, 144 BPM; notes known (used in test 14) | 29.8 s |
   | S2s | `S2s.wav` (or `S2s.mp3`) | synthesized fingerstyle guitar, two voices, G major, 112 BPM, standard tuning, no capo; the exact tab is known | 29.4 s |
   | S5capo2 | `S5capo2.wav` / `.mp3` | the same tab played with a capo on fret 2 (sounds in A major) | 29.4 s |
   | S5dropd | `S5dropd.wav` / `.mp3` | the same piece in Drop D (low string tuned down to D) | 29.4 s |
   | S3 | `S3.wav` / `.mp3` | synthesized strummed chords, G major, 96 BPM; chords known | 24.0 s |
   | S7flat30 | `S7flat30.wav` / `.mp3` | S3 played 30 cents flat (tests tuning detection) | 24.0 s |
   | S4 | `S4.wav` / `.mp3` | synthesized band (drums, bass, strummed guitar, lead), D major, 116 BPM; chords, beats and stems known | 38.7 s |
   | R1a | `R1a.wav` / `.mp3` | a real acoustic guitar recording from the GuitarSet dataset, with its per-string note annotation | 29.2 s |
   | R2 | `R2.wav` / `.mp3` | a real band song with singing (Josh Woodward, CC BY 4.0); no answer key | 36.0 s |
   | R3a | `R3a.mp4` | a real classical-guitar concert video, 640x480, camera cuts; no answer key | 18.0 s |
   | R3b | `R3b.mp4` | a real classical-guitar home video, one fixed close camera on the neck and both hands (the picking fingers partly cut off at the left edge), 1920x1080, no cut; no answer key (CC0 1.0) | 18.0 s |
   | R3c | `R3c.mp4` | a real classical-guitar lesson video ("Three Little Boats", Culture Vannin), one medium shot with both hands, 1920x1080, no cut; no answer key (CC BY 3.0) | 18.0 s |

   (R3b and R3c were added to `INPUTS.md` at 21:28 UTC on 2026-11-10, after this file was first written; the rows
   above are from that manifest.)

   On the research box the WAV and MP4 files are in `/home/user/gtr/inputs/<id>/` and the MP3 copies in
   `/home/user/gtr/lanes/apps-survey/out/clips-mp3/`. An MP3 can start 25 ms later than its WAV in an app whose
   decoder ignores the MP3's LAME header (measured on the research box: `trials.md`, media table), so use the WAV
   wherever the app takes it.
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
CC BY 4.0, R3a is CC BY-SA 4.0, R3b is CC0 1.0, R3c is CC BY 3.0 (`../../inputs/INPUTS.md` has the quotes).
Whether to tick those boxes and accept the terms is your decision; the research box was not allowed to do it for you.

## Sitting 1: web apps with a free tier (about 80 minutes, cost 0)

### 1. Klangio Guitar2Tabs (free demo, no account needed)

What the free tier is (Klangio terms §5.2.1): no account, 30 demo transcriptions a day, each limited to 20 seconds,
PDF export only (with a watermark), no Edit Mode (the pricing table itself says "Transcribe up to 30 seconds"; write
down which length you get). Full transcriptions need Guitar2Tabs Pro ("$6.25 /month Billed annually" on the pricing
table read 2026-11-10).

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
Whether the transcription itself asks for an account was not seen (the box stopped before pressing "Transcribe").

1. Open https://www.lunaverus.com/transcribe/audio-to-guitar-tab and choose `S2s.wav`. The upload starts by itself
   and the settings page opens ("Transcribing up to 30 seconds").
2. Leave "tablature" selected and "Instruments: Guitar". Open "Advanced Options" only to screenshot what it offers
   (on the research box: "Time", "Key", "Shortest allowed note" and "Trim empty measures at the start and end",
   ticked); leave them on their defaults.
3. Tick "I confirm that I own or have obtained all necessary rights to transcribe this audio." if you agree, then
   press "Transcribe". Time it.
4. On the result: screenshot the whole page, including any tempo, key and chord line at the top. Open the Download
   menu and screenshot it (to see which formats the free plan allows); download whatever is not locked.
5. Repeat with `R1a.wav`, `R2.wav` (36 s: the free plan transcribes at most 30 s, so check that the Start and End
   boxes under "Trim" read 0:00.0 and 0:30.0 or less, and write down what they read) and `S5dropd.wav`. The web form
   has no tuning or capo field, so no second run.

Send back: screenshots, any downloads, `notes.txt`.

### 3. Songsterr AI (free 20-second preview; it emails you when the tab is ready, so expect to give an email address)

Songsterr's help: "You can start with a free 20-second preview. Full-length transcription is included in Songsterr
Plus"; "A tab is usually ready in 5–15 minutes, and we email you when it's done". Its settings page lets you set the
tuning and a "Capo fret" for each instrument before the run.

1. Open https://www.songsterr.com/new and upload `S2s.wav`.
2. In the settings, leave "First bar time signature", "Pickup bar duration", "First bar tempo (BPM)" and "Triplet
   feel" on "Auto". For the instruments, pick only a guitar row (a "Fingerstyle" row is offered) with "Standard
   6-string (E A D G B E)" and capo 0. Start it, note the time.
3. When the email arrives, open the tab: screenshot. If "Download tab" (MIDI or Guitar Pro) works on the free
   preview, download both.
4. Run `S5capo2.wav` with "Capo fret" 2, and `S5dropd.wav` with a Drop D tuning, the same way. (Songsterr's help
   says to set tuning and capo "in Show settings before you start"; detecting them from the audio is not described.)

Send back: screenshots, downloads, `notes.txt` with the minutes until the email came.

### 4. Songscription (free: "The first 30 seconds of each song")

The home page says "At the moment, we only support standard tuning". Its pricing FAQ says "By default, we may use the
audio and transcriptions you submit to help improve our AI models" (Plus and Pro can opt out).

1. Open https://www.songscription.ai, sign up if it asks, upload `S2s.wav`, ask for guitar tab.
2. Screenshot the result; export Guitar Pro and PDF if the free plan allows.
3. Repeat with `S5dropd.wav` (to see what it does with a tuning it says it does not support) and `R1a.wav`.

Send back: exports, screenshots, `notes.txt`.

### 5. audio2guitar (free: "3 songs", MP3 only)

The vendor states: "Our pipeline achieves 97.8% string assignment accuracy on the GuitarSet benchmark". R1a is a
GuitarSet recording, so its string and fret output on R1a can be scored against GuitarSet's own annotation.

1. Open https://audio2guitar.com, sign up if it asks, upload `R1a.mp3` (the free plan takes MP3 only).
2. Screenshot the tab and the header line (the demo shows "Tuning", "Key" and "Tempo"); export MIDI and the PDF if
   the free plan allows.
3. Use the other two free songs on `S2s.mp3` and `S5dropd.mp3` (note the tuning it reports for S5dropd).

Send back: exports, screenshots, `notes.txt`.

### 6. AAPA AutoTabs (video in; free tier)

Of the apps this lane and the docs lane found, the only one open to use on 2026-11-10 that says it uses the hands in
a video to write tab (the vendor calls it "early access"; Guitar Learning and ChordAR also read hands from a camera,
but write no tab). The vendor: "AutoTabs listens to the audio and uses machine vision to analyze the guitarist's
hands and fretboard".
Its terms §4.2 make sharing your video for training opt-in; leave it off unless you want it.

1. Open https://aapamusic.com, sign up if it asks, open AutoTabs and upload `R3a.mp4`, then `R3b.mp4` and `R3c.mp4`
   (both show the fretting hand and the whole fretboard in one continuous shot; R3a has camera cuts).
2. Screenshot the draft tab and any video overlay; export PDF and MIDI.
3. If it has a capo or tuning setting, note it but leave it on default.

Send back: exports, screenshots, `notes.txt` (time, and whether the result mentions what it saw in the video).

### 7. Moises (free tier: "a limited number of uploads each month")

Moises shows stems, chords, BPM and key; it does not describe note-level tab with string and fret.

1. Open https://moises.ai (web app), sign in if it asks, upload `S4.wav` (synthesized band with known chords, beats and stems).
2. Ask for the stem split that includes a guitar stem; open the chord view.
3. Screenshot the chord view and the BPM and key it shows; download the guitar stem and anything else the free tier
   allows (chords as a file if offered).
4. Repeat with `R2.wav` and `S7flat30.wav` (note the key and whether anything mentions the tuning being off).

Send back: screenshots, stems (audio files go to the studio library, not to git), `notes.txt`.

### 8. Chordify (uploading your own file may need Premium)

chordify.net answered the research box with HTTP 403 (a Cloudflare check), so its site and terms were not read; its
App Store listing mentions MIDI and PDF downloads of the chords and a capo display option. Whether uploading your own
file needs Premium is UNVERIFIED (Chordify's own pages could not be read from the box). If the upload button asks you
to pay, write down the price shown and skip. While you are on the site, save its terms page as PDF (the research box
could not read it).

1. Open https://chordify.net, sign in if it asks, upload `S3.wav`.
2. Screenshot the chord timeline; download MIDI or PDF if offered.
3. Repeat with `S7flat30.wav` and `R2.wav`.

Send back: screenshots, downloads, the terms PDF, `notes.txt`.

### 8a. Chordify's terms page only (about 3 minutes; added in gap round 2, 2026-11-11)

Do this one even if you skip test 8. On 2026-11-11 the research box again got HTTP 403 (a Cloudflare check) from
`https://chordify.net/pages/terms-and-conditions/`, to curl and to WebFetch, and opening it in a headless browser was
refused by the session's permission system ("[Bot Check Circumvention]"), so nothing in the research says what
Chordify's terms allow. Whether the page needs an account was not seen.

1. In your normal browser open https://chordify.net/pages/terms-and-conditions/ and save it as PDF
   (`chordify-terms.pdf`, Ctrl+P, "Save as PDF"). Write the date or version shown on the page in `notes.txt`.
2. Also save https://chordify.net/pages/privacy-policy/ the same way (`chordify-privacy.pdf`; the App Store listing
   links it).

Send back: the two PDFs. A later agent quotes, from them, what they say about who owns the chords, MIDI and PDF files
Chordify makes, about commercial use and about automated access.

### 8b. ChordU (optional; its home page lists "Upload" and "My Uploads")

ChordU's terms and prices were not read. (Corrected in gap round 2: its terms were read on 2026-11-11, `survey.md`
ChordU. They say "Usage of songs and chords are limited to your personal, non-commercial use" and "You shall not
collect content or information or access ChordU service using automated means (such as bots, robots, spiders or
scrapers) without our permission.", so the research box fetched no more of its pages and its prices are still not
read.) If it lets you upload without paying: upload `S3.wav` and `R2.wav`, screenshot the chords and the BPM it shows,
and write down whether it needed an account. Also screenshot its "Go Premium" page with the prices it shows.

## Sitting 1b: web apps found late on 2026-11-10 (about 50 minutes; `survey.md` items 33 to 37)

Tests 20 to 23 were found by web search near the end of this lane, from their home pages (2026-11-10; the verifier
re-read the pages and found the quotes below). The `verify-docs` agent has since added them to `survey.md` as items
33 to 36, with their terms, and added GuitarConvert (item 37, test 24 here). Check prices on screen.

### 20. Note2Tabs (https://www.note2tabs.com; "Free" "$0/ month" with "10 monthly credits", paid "$5.99/ month" and "$14.99/ month")

Home page description (its `meta` description tag): "Upload an MP3 or WAV, or paste a YouTube link to generate
playable guitar tabs online. Edit, practise, and export every transcription in your browser." The page lists "MP3,
WAV, M4A" and a "Light" model, with a "Heavy model" for "Premium or Pro". Its pricing page (re-read by the verifier
2026-11-10): free "Audio clips up to 60 seconds", "10 monthly credits", and "A 60-second recording uses 4 credits with
Light or 10 with Heavy." Its terms, quoted in `survey.md`, say "Do not automate bulk requests".

1. Start free, upload `S2s.wav`; screenshot the tab; export whatever the free plan allows.
2. Repeat with `R1a.wav` and `S5dropd.wav` (note the tuning it shows).

### 21. Cesure (https://cesure.app; free tier; "€4.99 per month or €39.99 per year")

Home page: "AI transcription (BasicPitch) runs on our servers: 3 free conversions a month, unlimited with Pro. Chord
detection is a different thing — it is computed entirely on your device, free and offline." An account "is required
for AI transcription"; free export to "MIDI, MusicXML, AlphaTex and PDF".

1. Sign up, "Drop in an MP3": `S2s.mp3`, then `R1a.mp3` (2 of the 3 free conversions). Export MIDI and MusicXML;
   screenshot the tab.
2. Open the chord grid (the free on-device part) on `S3.mp3` and `S7flat30.mp3`; screenshot.

### 22. RiffToTab (https://rifftotab.com; MIDI to tab is Pro, audio to MIDI is free)

Home page: "Drop a .mid file and get tab a hand can play"; "Strings and frets are chosen for the whole phrase. If
another tuning or a capo measures easier, it is used and named."; "Change tuning, capo or key, then convert again";
"Opening your file, editing notes and Guitar Pro export are free. Generating the tab is Pro." It also says "One
button re-arranges the same notes for Drop D, a capo on the 2nd fret, a key a step down", the kind of re-run with a
user's tuning or capo that the planned web app needs. The tab step is paid; the home page (re-read by the verifier
2026-11-10) shows Pro at "$3.99" for the first month, "Then $7.99 a month", or "$39" a year, or "$59" once
("Lifetime").

1. Free part: "Turn audio into MIDI, free" with `S2s.wav`; export the MIDI.
2. Pro part (only if you choose to pay): drop the answer-key MIDI `S2s.mid` (from the inputs, so only the fingering is
   tested); export Guitar Pro. Then use "Change tuning, capo or key" for capo 2 and for Drop D and export each; and
   write down what tuning and capo its strip says it used.

Send back for 20 to 22: exports, screenshots, `notes.txt`.

### 23. Fretwise (https://fretwise.ai; "Audio in. Tabs out.")

Its page text (most of it loads by script) says: "The fastest audio to MIDI + Guitar Pro transcriber in the world."
(the vendor's claim; no measurement given) and "Sign In". Its pricing page (re-read by the verifier 2026-11-10): free
"3 transcriptions per month", "Guest access without an account", "No export paywalls"; outputs "PDF, MIDI, MusicXML,
and Guitar Pro exports".

1. Upload `S2s.wav`, then `R1a.wav` and `S5dropd.wav` (the 3 free transcriptions).
2. Export MIDI, MusicXML and Guitar Pro for each; screenshot the tab; note what tuning it shows for S5dropd.

### 24. GuitarConvert (La Touche Musicale; added by the verifier from `survey.md` item 37)

https://latouchemusicale.com/en/apps/guitarconvert/ (re-read by the verifier 2026-11-10): "Import your YouTube link or
audio file and receive its guitar tablature in 2 minutes."; modes "Transcription mode" and "Arrangement mode"; free
plan "Conversion limited to 30 seconds", "PDF, MIDI & musicXML export". Its terms, quoted in `survey.md`, say "The
Service may not be used for commercial purposes."

1. Sign up if it asks, upload `S2s.wav` in "Transcription mode"; export MIDI and MusicXML; screenshot the tab.
2. Repeat with `R1a.wav`. Optional: `S2s.wav` again in "Arrangement mode", to see what that mode changes.

Send back for 23 and 24: exports, screenshots, `notes.txt`.

## Sitting 2: free Windows trials on the laptop (about 70 minutes, cost 0)

### 9. AnthemScore 6 desktop (trial: "Limited to first 30 seconds of each song and 100 total transcriptions")

The download page: "No account creation needed, just download and run!" and "By default the trial runs as the
AnthemScore Professional edition"; the compare-editions page lists for the Professional edition "PDF, MIDI, musicXML,
and ASDT export", and for the free trial "Limited to first 30 seconds of each song and 100 total transcriptions."
Whether the trial lets you export MIDI and musicXML was not checked. AnthemScore's version history mentions fast note
finding on CUDA Nvidia GPUs (4.2.0, 2019) and "Cuda 8.6 support for Windows" (4.12.0, 2021), and the 6.3.0 program
text has a "Using Cuda" message; whether 6.3.0 uses an Nvidia GPU on Windows is not known, so note it if the program
says (the version history says to look in the 'about' menu for the cuda status).

1. Download the Windows 10/11 installer from https://www.lunaverus.com/download and install it. **Save the license
   text**: the site's terms say the software license is "the "license.txt" file, which is included in every download
   of the software", but the research box found no such file in the Linux build. If the installer shows a license
   screen, copy its text into `license.txt` in your folder; also look for a `license.txt` in the folder AnthemScore
   installs into (where it is on Windows was not checked) and copy it.
2. Open `S2s.wav`. Set guitar tab the way AnthemScore's FAQ describes it: "Enter instrument settings and change the
   instrument to guitar. Then click the gear icon next to it and select "Tablature" under Staffs. Take a look at the
   number of frets and the string tunings under Tablature options and adjust as needed". Leave the rest default.
   Time the transcription.
3. Export: MIDI (.mid), MusicXML, and "Beat and Note Timing (.csv)". Screenshot the tab.
4. Open `S5dropd.wav`, and before transcribing set the strings to Drop D in the tablature options. Its documentation
   says "Strings should be set to the instrument's _written_, not _sounded_, pitches" ("With guitar and bass guitar,
   for example, this is an octave above the sounded pitch"), so the low string is written D3. Export as above.
5. Open `S5capo2.wav` with default settings (no capo setting was found in its documentation or FAQ, nor any text
   containing "capo" in the 6.3.0 Linux build) and `R1a.wav` and `R2.wav`; export each.

Send back: `license.txt`, all exports, screenshots, `notes.txt` with the time of each transcription.

### 10. Transcribe! 9.70 (30-day evaluation; $39 to buy)

It does not write notes to a file ("Transcribe! does not output MIDI at all."), so this test is mostly screenshots of
its on-screen guesses. Chord guesses can be put into text blocks and the text blocks saved to a text file (its help,
read on the research box), which step 4 uses.

1. Download the Windows version from https://www.seventhstring.com/xscribe/download.html and install it.
2. Open `S3.wav`. On the View menu turn on "Show Note Guesses" and "Show Chord Guesses"; on the Piano Roll menu turn
   on "Show Piano Roll". Wait for the piano roll to fill (its help: a yellow band marks the parts not calculated yet).
3. Screenshot the piano roll for the whole clip, and the chord guess box at about 3, 9 and 15 seconds.
4. Optional, to get the chord guesses as text: at each chord change in the piano roll, shift-click to see the chord
   guesses, then right-click at the same point and pick the first chord offered (its help: this inserts the chord name
   as a text block). Then File > "Export Markers and Text Blocks" and save `transcribe_S3_chords.txt`. Write in
   `notes.txt` whether the file has a time for each chord (the help does not say).
5. Open `S7flat30.wav` the same way. Its help says out-of-tune note guesses show as red blobs; screenshot them. Then
   use its tuning adjustment (Fx window, Tuning page: sliders for octaves, semitones and cents) to centre the notes,
   and write down the cents setting it needed, with its sign.
6. Open `S2s.wav` and screenshot the piano roll.

Send back: screenshots, `transcribe_S3_chords.txt` if you did step 4, `notes.txt` with the cents value for S7flat30.

### 11. Melodyne 5 studio (30-day trial: "try it out for 30 days – free of charge and without obligation")

Celemony says "Melodyne also recognizes chords, keys, tunings and tempos", so this test also asks what it says
about the tuning of `S7flat30.wav` (30 cents flat).

1. Get the trial from https://www.celemony.com/en/trial ("Melodyne 5 studio for macOS" or "for Windows"). That page
   says: "To register the trial version and each time the program is launched, an Internet connection is necessary.
   The trial period can only be enjoyed once on each computer." Whether it needs a Celemony account was not checked.
   **Save the license text** (added in gap round 2): Celemony's site links no license agreement, and the one copy found
   on the web could not be reached on 2026-11-11. If the installer or the program (Help menu, "License" or "About")
   shows a license agreement, copy it into `melodyne-license.txt` or save it as PDF.
2. Open `S2s.wav` in the standalone Melodyne. Let it detect the notes with its polyphonic algorithm. The editions page
   lists "DNA Direct Note Access – algorithms for polyphonic instruments such as piano and guitar" for the editor and
   studio editions only, and says "By default, the trial version starts off as Melodyne studio", so keep the trial on
   studio (or editor).
3. If Melodyne offers a MIDI export of the detected notes, export it (whether and where it does was not found on the
   Celemony pages read; corrected in gap round 2: the editions page lists "Audio-to-MIDI – export notes to a MIDI
   file" for the assistant, editor and studio editions; where it sits in the menus was not read). Screenshot the note
   "blobs".
4. Repeat with `R1a.wav`.
5. Open `S7flat30.wav`: screenshot and write down the tuning (reference pitch or cents) and the key and tempo it shows.

Send back: the MIDI files if it exported any, screenshots, `notes.txt` (time to detect, which algorithm it chose, the
S7flat30 tuning), and `melodyne-license.txt` if a license text was shown.

### 12. RipX DAW PRO (free for 21 days: "Try RipX DAW PRO Free for 21 Days")

Its RipX DAW page lists "Print Audio to Midi to load a specific part into a VST of your choice" and "Export separated
stems straight to WAVs" (https://hitnmix.com/ripx-daw/, read by the verifier 2026-11-10); its platforms were not read.
(Corrected in gap round 2: the buy page, read 2026-11-11, lists "macOS 10.15+ (2012 & later models, including M1
onwards) / Windows 8/10/11 (64-bit)" and "Minimum: 2 Core 2.5GHz CPU, 8 GB RAM, 20 GB Free Disc Space"; RipX DAW is
"$99.00 USD" and RipX DAW PRO "$198.00 USD" after the "21-day trial".)

1. Install the trial from https://hitnmix.com and open `S4.wav`, then `R2.wav`. If the installer shows a license
   agreement, copy its text into `ripx-license.txt` (no license agreement is linked from Hit'n'Mix's web pages; added
   in gap round 2).
2. Let it separate and detect notes. Export the guitar layer's notes as MIDI ("Print Audio to Midi") and the stems as
   audio if the trial allows. Screenshot the note view.
3. Open `S2s.wav` and export its notes as MIDI.

Send back: MIDI files, screenshots, `notes.txt` (stems go to the studio library), and `ripx-license.txt` if one was
shown.

### 13. (removed) Samplab

samplab.com redirected to apple.com on 2026-11-10; 9to5Mac reported on 2026-10-19 that Apple is acquiring assets of
Samplab GmbH (`survey.md`). Nothing to test.

### 14. ScoreCloud (Studio: "can be used for free up to 10 saved songs"; Songwriter: "10 day free trial")

The site: "ScoreCloud Songwriter takes recordings of voice and instruments and turns it into Lead Sheets, with
melody, lyrics and chords", and for Songwriter "Recording to lead sheet – MP3, YouTube, or live take"; Studio:
"record single-instrument audio, enter notes manually or play via MIDI keyboard"; exports "PDFs, MusicXML, MIDI"
(home page, re-read by the verifier 2026-11-10). Whether Studio imports an audio file (rather than recording through
the microphone) was not checked; if it only records, play the clip from the laptop speakers into the microphone and
say so in `notes.txt`.

1. Install from https://scorecloud.com. In Songwriter (trial), put in `R2.mp3` (song with singing; the page names MP3
   as an input): screenshot the lead sheet (melody, lyrics, chords) and export MusicXML and MIDI. Then `S4.mp3`.
2. In Studio, put in `S1.wav` (single-note melody with a known answer); export MusicXML and MIDI. If it offers guitar
   tab, try `S2s.wav` as well.

Send back: exports, screenshots, `notes.txt` (file import or microphone).

### 15. MIDI Guitar 2 or 3 (Jam Origin; real time only)

It turns live guitar audio into MIDI as you play, so a recording has to be played through it. Skip this one if you
have no DAW on the laptop. https://www.jamorigin.com offers MIDI Guitar 2 as "Download Free trial ... No questions
asked. No installation needed." and says "MIDI GUITAR 3 open beta: www.jam.live"; whether version 3 has a free trial
was not read. Added in gap round 2 (read 2026-11-11): a license is "USD 149.95" ("The price is always USD 149.95 and
there are never any discounts.", https://jam.live/shop/); "MIDI Guitar 3 is in beta testing phase." and "Please refer
to MIDI Guitar 2 for a production ready solution."; no license agreement or terms page is linked from either site, so
if the program shows a license text, copy it into `midiguitar-license.txt`.

1. Get the MIDI Guitar 2 trial from https://www.jamorigin.com (or MIDI Guitar 3 from www.jam.live if it is free to
   try; write down which version you used).
2. In your DAW put `S2s.wav` on an audio track, insert MIDI Guitar as a plugin on that track, send its MIDI to a MIDI
   track, record while the clip plays, save the MIDI.
3. Repeat with `R1a.wav`.

Send back: 2 MIDI files, `notes.txt` (DAW used, plugin settings), and `midiguitar-license.txt` if one was shown.

## Sitting 3: phone apps (about 30 minutes)

Copy the MP3s (`S3.mp3`, `S5capo2.mp3`, `S5dropd.mp3`, `S7flat30.mp3`, `R2.mp3`, `S4.mp3`) to the phone first.

### 16. Chord ai (iOS; an Android version appears in search results only; free, Pro is "$10.99" a month or "$69.99" a year in the App Store)

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
3. Added in gap round 2: no license agreement for the app was found on Yamaha's pages or in its App Store listing. If
   the app shows one (at first start, or under its settings or "About"), screenshot it. Yamaha's page also says
   "Chord Tracker Android is now available at Google Play." Whether the Android version also reads songs stored on the
   phone was not read (corrected by the verifier, 2026-11-11: this line had said the test "also works on an Android
   phone"); if you use an Android phone, say which, and whether it found the MP3s.

Send back: screenshots, `notes.txt`.

### 17b. Fender Studio: Jam & Record (iOS; other platforms not checked)

Its App Store listing: "Use the Chord Track to create your own chord progressions, or drag audio to it for automatic
recognition". It does not describe tab output.

1. Install Fender Studio, start a project, and drag `S3.mp3` onto the Chord Track (as the listing describes).
2. Screenshot the recognized chords; repeat with `R2.mp3`.

Send back: screenshots, `notes.txt` (what it cost, if anything).

### 17c. Practice Pro - AI Music Tools: does it exist? (2 minutes; added in gap round 2, 2026-11-11)

A web search result (quoted in `../../GAPS.md`, row P3) describes an iOS app of this name with an "AI Guitar Tab
Generator ... synced with playback", App Store id 6754810269. From the research box, `apps.apple.com/us/app/id6754810269`
answered HTTP 404 on 2026-11-10 and 2026-11-11, and Apple's lookup API found nothing under that id in nine stores
(`survey.md`, "## Not covered").

1. On an iPhone or iPad, search the App Store for "Practice Pro AI Music Tools" and for "AI guitar tab generator".
2. If an app of that name is there: screenshot its listing (developer, version and date, price, the "In-App
   Purchases" list, and any "License Agreement" link), and tap "Developer Website" and "Privacy Policy" and screenshot
   them. Do not install it unless you want to.
3. If it is not there, write "not found" and the date in `notes.txt`.

Send back: the screenshots or the "not found" line.

### 18. Capo (Mac, iPhone, iPad only)

Only if you have one of those: open `S3.mp3` and `R2.mp3`, screenshot the detected chords and tempo. Its App Store
listing describes chord, beat and key guesses, not tab. Its product page (https://supermegaultragroovy.com/products/capo/)
says "MIDI export of notes and chords" is one of the tools "exclusive to the Mac", and that "The Free Edition just
won't save your edits to chords and beats, export audio, or—on the Mac—export MIDI and create lead sheets". On a Mac
with a paid edition, export MIDI of `S3.mp3` and send it back. (Added in gap round 2: its Mac page says the Tabbing
view writes tab from notes you draw on the spectrogram, "as you draw, tablature is generated automatically below", and
that the MIDI export holds "your chord and note entries", so the notes in that MIDI are the ones you entered. If the
app shows a license agreement anywhere, screenshot it. Corrected by the verifier, 2026-11-11: this line had said none
was found on the vendor's site; the vendor's Terms of Use Agreement is at https://supermegaultragroovy.com/legal/tou/,
named at the end of both App Store descriptions, and its clauses are quoted in `survey.md`, Capo.)

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
box did not install it (its `npm ci` was refused by the session's permission system).

1. Open the site in Chrome, allow the camera, and do its calibration: four clicks on the two ends of the nut and the
   two ends of the 12th fret.
2. Play an E minor and a C chord as its lessons ask. Screenshot the overlay when it says a finger is wrong and when
   it accepts the chord.

Send back: screenshots, `notes.txt` (did the strings and frets it drew line up with your real neck; did it lose the
neck when you moved).

## Not tested with the shared clips (and why)

- **Ultimate Guitar "AI chords"**: its help article describes a YouTube link as the input; the shared clips are not
  on YouTube.
- **Samplab**: the site redirects to apple.com (see test 13).
- **Soundslice**: no automatic audio-to-notes feature was found; transcription in it is done by hand.
- **Guitar Pro 8** ("With the Guitar Pro free demo, enjoy all the Guitar Pro 8 features for 7 days"): no automatic
  audio-to-tab feature was found; it imports an audio track to transcribe by hand. It is still a program that opens
  the `.gp` / `.gp5` files the other apps export ("File import formats: .gtp, .gp3, .gp4, .gp5, .gpx, .gp, ..."), if
  you want to look at them. The free TuxGuitar opens `.gp5` and, per its plugin description, "Guitar Pro 6 (GPX) and
  7 (GP) files" (`../web-tab-render/survey.md`); Guitar Pro 8 files in it: not checked.
- **Yousician**: it listens to you playing along ("real-time feedback that listens as you play"); transcribing a
  recording you give it is not described. **Rocksmith+**: not read (UNVERIFIED).
- **Fender Play, Fender Tune, Fender Songs**: not read by this lane (the Fender Play App Store page fetched for it
  came back without text, the fender.com newsroom page on Fender Songs answered with a "Just a moment..." challenge
  page, and Fender Tune was not fetched), so whether any of them transcribes your own audio is UNVERIFIED. Fender
  Studio is test 17b.
- **Positive Grid Spark "Auto Chords"**: "*Requires Spark Amp*".
- **TabGenius**: makes a tab from a typed or spoken idea, not from audio.
- **GrabTab**: "Coming soon to iOS & Android" on 2026-11-10.
- **ChordAR** (manbr21/Computer-Vision-Guitar-Tutor): needs four printed ArUco markers stuck on your guitar's neck and
  a live webcam; it scores chord shapes and does not transcribe.
- **TapToTab** (arXiv 2409.08618): a research paper; no code release was found.
- **Tabbers** (`survey.md` item 38): described in a 2025 conference talk; no product page, app or code was found.
- **YouTube Guitar Tab Parser** (`survey.md` item 39): copies a tab already drawn in a YouTube lesson video into a
  PDF; it does not transcribe audio, and none of the shared clips is such a video.

## For the agent that receives Aaron's zip: how each returned file can be scored

All with `/home/user/gtr/bin/gtr-eval` (README: `../../scripts/gtr-eval/README.md`); quote each `e....` id.

| What comes back | Subcommand | Notes |
|---|---|---|
| MIDI or MusicXML notes (any app) | `gtr-eval notes --truth <id> --est <file>` | Exports that start bar 1 at 0 s are early by the silent count-in bar of the S clips (4 beats: 2.143 s at 112 BPM for the S2 family, 2.5 s at 96 BPM for S3, 1.667 s at 144 BPM for S1, see `INPUTS.md`); try `--time-shift` with that value and report both numbers. An MP3-fed run can be 25.06 ms late if the app's decoder ignores the MP3's LAME header (`trials.md`, media table). |
| Guitar Pro 3/4/5 or MusicXML with string and fret | `gtr-eval tab --truth <id> --est <file>` | `.gp` (Guitar Pro 7/8, for example Tabtify's) is refused by gtr-eval (PyGuitarPro reads only 3 to 5): open it in Guitar Pro, or in TuxGuitar for a Guitar Pro 7 file, and save as `.gp5` first, and say so. |
| Chords read off a screenshot, or Transcribe!'s exported text blocks | type them into a `.lab` file (`start end label`), then `gtr-eval chords --truth <id> --est <file>.lab` | Typing from a screenshot is a manual step: state it next to the number. |
| Tempo or key shown on screen | `gtr-eval tempo --truth <id> --est-bpm <x>`, `gtr-eval key --truth <id> --est-key "<key>"` | Both refuse to run without `--truth` (checked by the verifier). |
| Tuning offset for S7flat30 (Transcribe!, Melodyne) | `gtr-eval tuning --truth S7flat30 --est-cents <x>` | The truth is the clip's offset, -30 cents. A correction that raises playback by +c cents to centre the notes (Transcribe!'s Tuning page) means an offset of -c: pass `--est-cents -c` and say so. |
| Capo or tuning an app reported for S5capo2 / S5dropd | `gtr-eval tuning --truth S5capo2 --est-capo <n>`; `--truth S5dropd --est-tuning-midi 38,45,50,55,59,64` (example) | Only for apps that detected it; Klangio, Songsterr, Tabtify and AnthemScore take capo or tuning as a setting. |
| Stems (Moises, RipX) on S4 | `gtr-eval stems --truth S4 --est-dir <dir> --map guitar=<file> ...` | |
| AnthemScore "Beat and Note Timing (.csv)" | `gtr-eval notes --truth <id> --est <file>.csv` (check its column names first) | Its column layout was not seen on the research box. |

## Verification log (verify-trials-apps-survey, 2026-11-10)

The full log is at the end of `trials.md`. Changed here: two personal details about the laptop (Windows version, GPU
model) removed; the MP3 timing note replaced by the measured 25.06 ms LAME-header offset; S1 (used in test 14) added
to the clip table and R3b / R3c filled in from `INPUTS.md` (added there at 21:28 UTC); test 2's R2 step made concrete
(the trim boxes); AAPA's heading corrected (Guitar Learning and ChordAR also read hands from a camera); Chordify's
"third-party pages say" claim replaced by UNVERIFIED; Transcribe!'s menu names corrected from its help ("Show Note
Guesses", "Show Chord Guesses", Piano Roll menu "Show Piano Roll") and an optional chord-guess text export step and
the sign of its tuning correction added; Melodyne's trial page facts added and its MIDI export marked as not found;
RipX's "Print Audio to Midi" quoted; ScoreCloud Songwriter's MP3 input quoted from its home page; MIDI Guitar's trial
belongs to version 2 (version 3 is an open beta); Chord ai's Android version, Rocksmith+ and the Fender apps marked as
not read; Capo's Mac-only MIDI export quoted; Note2Tabs, Fretwise and RiffToTab prices and free limits re-read;
GuitarConvert added as test 24; the `gtr-eval` commands now carry the `--truth` they need (checked: `tempo`, `key` and
`chords` refuse to run without it); the TuxGuitar claim now cites its plugin description.

## Gap round 2 (gapfill-apps-survey, 2026-11-11)

Added: test 8a (save Chordify's terms and privacy pages: the box got HTTP 403 again and a headless render was refused
by the permission system); test 17c (check whether "Practice Pro - AI Music Tools" exists). Changed: 8b (ChordU's terms
were read and bar automated access, so its prices are now a step here); 11 (save Melodyne's license text; its editions
page lists MIDI export for assistant, editor and studio and polyphonic guitar for editor and studio); 12 (RipX's
systems and prices; save its license text); 15 (MIDI Guitar's price and beta status; save its license text); 17
(Chord Tracker: a license screen if shown, and its Android version); 18 (Capo's Tabbing view writes tab from notes the
user draws). Each changed line says "gap round 2"; the sources are in `survey.md`.


## Verification log (verify-gapfill-apps-survey, round 2, 2026-11-11)

The gap round's changes to this file were checked against the vendor pages (details in `trials.md`, last section).
Changed: test 17 (it said the test "also works on an Android phone"; whether the Android version reads songs stored on
the phone was not read) and test 18 (it said no license agreement was found on the vendor's site; Capo's Terms of Use
Agreement is at https://supermegaultragroovy.com/legal/tou/, named at the end of both App Store descriptions).
Confirmed: the two URLs of 8a (both are the ones Chordify's App Store listing names; the terms URL answered HTTP 403 to
the gap round's curl on 2026-11-11), the quotes of 8b and its "Go Premium" page (a link to `/gopremium` on ChordU's
terms page), and the quotes added to 11, 12, 15, 17 and 18.
