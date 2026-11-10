# Lane 9, apps-survey: existing apps that already do some of this

Agent: docs-apps-survey. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from the live pages on
2026-11-10 unless a line says otherwise. Raw copies of the pages fetched with curl are kept outside the repo in
`/home/user/gtr/lanes/apps-survey/raw/` (not committed); `_fetchlog.txt` there lists every fetch with its HTTP status.
The fetch scripts are in `scripts/`. This file records facts and quotes only. The API side of Moises (Music.AI),
Klangio, Soundslice, Songsterr and Chordify is also covered by the `hosted-apis` lane (`../hosted-apis/survey.md`).

Marks used in the tool list:

- `RUNNABLE`: a build exists that can run on the CPU-only Linux research box (a Linux desktop build with a trial, or a
  web page usable in headless Chromium without paying). Whether it actually ran is the try agent's `trials.md`.
- `WEB-ACCOUNT`: a browser app that needs a sign-up (free tier or paid).
- `DESKTOP`: Windows and/or macOS install only (no Linux build found).
- `MOBILE`: iOS and/or Android app only.
- `NOT-RELEASED`: announced, with no public build found on 2026-11-10.

## Tool list

One line per product, re-checked against the vendor's own pages on 2026-11-10 (the sections below hold the quotes
and links; a line here is only a summary of its section). Dates are the newest version or update date seen on the
vendor page or store listing that day.

### Audio (or a link) in, tab or notation out

1. Klangio Guitar2Tabs (Klangio GmbH, Germany): audio, .mp4, YouTube / Instagram / TikTok link or microphone in; PDF,
   MIDI (quantized and unquantized), MusicXML, Guitar Pro 5, LilyPond out; user sets tuning and capo before the run;
   "Retranscribe" re-runs with new settings. Web, iOS (App Store 1.8.1, Oct 6), Android, VST3. WEB-ACCOUNT, MOBILE.
2. Klangio Transcription Studio (same company): several instruments in one pass, same exports. WEB-ACCOUNT, MOBILE.
3. Klangio sibling apps (Piano2Notes, Sing2Notes, Drum2Notes, Violin2Notes, Wind2Notes, Scan2Notes, Melody Scanner).
4. Songsterr AI (Guitar Tabs LLC): YouTube link or audio upload in; multi-track tab (guitar, bass, drums, vocals,
   keys...) with techniques, opens in the Songsterr editor, downloads as Guitar Pro or MIDI; user sets tuning, capo,
   time signature, first-bar tempo. App Store 10.5.0, Oct 26. WEB-ACCOUNT, MOBILE.
5. Songscription (Songscription, Inc.): audio, video, YouTube / Instagram / TikTok link, microphone, sheet-music
   photo in; sheet music, MIDI, MusicXML, guitar and bass tab, Guitar Pro out; "only support standard tuning"; terms
   updated 2026-06-18. WEB-ACCOUNT.
6. Tabtify: audio, MIDI, YouTube / TikTok / Instagram / Pinterest link, recording in; editable tab (alphaTab-based
   page), Guitar Pro (.gp), MIDI, PDF, MusicXML, alphaTex out; user sets string count, tuning, capo; terms updated
   2026-10-26. WEB-ACCOUNT (editor free without AI).
7. audio2guitar: audio upload in; tab, chords, synced lyrics, stems, per-stem MIDI, PDF out; vendor states Open-Unmix-
   based separation and a "97.8%" GuitarSet string-assignment figure; terms updated 2026-08-14. WEB-ACCOUNT.
8. AnthemScore 6 (Lunaverus LLC): desktop and web; audio in; MusicXML, MIDI, PDF, tab; user sets string tunings and
   frets; 6.3.0 released 2026-09-29; Linux AppImage. RUNNABLE (Linux build, 30-second trial).
9. Guitar Pro 8 (Arobas Music): tab editor and player, audio-track sync for manual transcription, imports and exports
   GP / MusicXML / MIDI / PowerTab / ASCII; 8.1.5; no audio-to-tab found. DESKTOP (Windows, macOS), MOBILE.
10. ScoreCloud (Doremir): recordings to lead sheets (melody, lyrics, chords); no guitar tab found. DESKTOP.
11. TabGenius (iOS, 1.8, 2025-07-15): text or voice prompt to tab, not audio transcription. MOBILE.

### Video in (reads the fretting hand or the fretboard)

12. AAPA AutoTabs (AAPA Music LLC): guitar video in; vendor says machine vision "Detects hand positions and finger
    placements on the fretboard"; editable tab, PDF, MIDI, video overlays out; early access ("v2.43" on the pricing
    page). WEB-ACCOUNT.
13. GrabTab (EU, operated from Spain): phone records audio plus 60 fps video of the neck; vendor says the camera "reads
    the fretting hand for the right string and fret"; tab, staff notation, PDF; "Coming soon to iOS & Android" on
    2026-11-10. NOT-RELEASED.
14. TapToTab (Ain Shams University, arXiv 2409.08618, submitted 2024-09-13): research system, YOLO fretboard detection
    plus audio; no code link on the abstract page. Paper (the video-hands-fretboard lane covers it).
15. DecoudJuan/Guitar-Learning (MIT, last commit 2026-10-17) and manbr21/Computer-Vision-Guitar-Tutor "ChordAR" (no
    LICENSE file, last commit 2026-10-25): browser / Python chord tutors mapping MediaPipe fingertips to (string, fret)
    through a four-point homography or ArUco markers; no transcription. RUNNABLE (open source; webcam needed).

### Chords, stems and practice tools

16. Moises (Moises Systems, Inc. d/b/a Music AI): stems, chords, beats, key, BPM, smart metronome, count-in, speed and
    pitch; App Store 2.153.0; terms updated 2026-10-07. WEB-ACCOUNT, MOBILE, DESKTOP.
17. Chordify (Chordify BV): chords for YouTube links and a 36M-song catalog, capo display, transpose, slow-down, loop,
    MIDI and PDF download; App Store 9.9.0; web pages and terms blocked to this box (HTTP 403). WEB, MOBILE.
18. Chord ai (Nomad AI OU): chords, voicings, beats, lyrics, 4 stems, MIDI, PDF / Text / ChordPro export, capo
    suggestion that uses the user's edited chords; App Store 6.3.0. MOBILE.
19. Ultimate Guitar (Muse Group): tab library; "AI chords" from a YouTube link (help article dated 2026-05-22, 10 per
    24 hours, 15-minute limit); terms updated 2026-08-24. WEB, MOBILE.
20. Soundslice (Soundslice LLC): notation and tab synced to YouTube or uploaded audio / video, editor, loop, slow-down,
    metronome, count-in, auto-sync, auto stems, PDF / photo scanner, iframe embed with a JavaScript API; transcription is
    manual. WEB-ACCOUNT.
21. Capo (SuperMegaUltraGroovy, Inc.): beats, chords and key guessed from songs, editable chords and beat grid,
    slow-down, loop; 4.7.3, Nov 2. MOBILE (iOS), DESKTOP (macOS).
22. Yousician (Yousician Ltd): lessons with microphone feedback; no transcription of the user's audio. MOBILE, DESKTOP.
23. Fender Studio (Fender Digital, 1.3, Jul 30): recording app; "drag audio to it for automatic recognition" on its
    Chord Track. MOBILE. Fender Songs and Fender Studio Pro 8: not read (fender.com returned 403).
24. Yamaha Chord Tracker (2.3.9, May 25): chords from songs in the device library, with "guitar tab display options".
    MOBILE.
25. Positive Grid Spark app "Auto Chords" (4.6.2, Sep 17): "*Requires Spark Amp*". MOBILE.
26. ChordU: chords for songs and uploads (home page only read). WEB.

### Audio-to-MIDI and pitch editors (desktop)

27. Melodyne 5 (Celemony): polyphonic note detection, "recognizes chords, keys, tunings and tempos". DESKTOP.
28. RipX DAW (Hit'n'Mix): "note-level extraction" from mixed audio, stems; "Starting at $99", 21-day trial. DESKTOP.
29. Samplab: closed; samplab.com redirects to apple.com (Apple acquired certain assets, per the EU filing as reported
    by 9to5Mac on 2026-10-19).
30. MIDI Guitar 2 and 3 (Jam Origin): live guitar signal to polyphonic MIDI (MPE in version 3, open beta). DESKTOP.

### Slow-down and transcription helpers (no automatic tab)

31. Transcribe! (Seventh String Software): slow-down, loops, chord / note spectrum, video display; Windows, macOS,
    Linux; $39. RUNNABLE (Linux build, 30-day evaluation).

### Not researched in this pass

32. Rocksmith+ (Ubisoft), Fender Play, Fender Tune, Gibson App, Riffstation: not read on 2026-11-10 (no section below).

---

## Klangio: Guitar2Tabs, Transcription Studio and the sibling apps

- **What it is.** Web, iOS and Android transcription apps by Klangio GmbH, Karlsruhe, Germany. The terms list the
  single-instrument apps, "Transcription Studio – enables multi-instrument transcription by analyzing multiple
  instrument tracks within a single audio file", "Transcription Plugin – a VST3 plugin", "API Access" and "Bulk
  Transcription" ([terms](https://klang.io/terms/), read 2026-11-10). The help center lists the apps as
  "Piano2Notes", "Guitar2Tabs: Transcribe Electric, Acoustic and Bass-Guitars", "Sing2Notes", "Drum2Notes",
  "Wind2Notes", "Violin2Notes", "Klangio Transcription Studio: Transcribe Multiple Instruments all in one go", plus
  Scan2Notes (sheet-music scanning) and Melody Scanner ([wizard article](https://klang.io/help/transcription-wizard/),
  "Updated on July 16, 2026", read 2026-11-10).
- **Input.** "Upload an audio file, paste in a YouTube link, or record your music directly with the app"
  ([Guitar2Tabs page](https://klang.io/guitar2tabs/), read 2026-11-10). Accepted uploads: ".wav", ".mp3", ".mpeg",
  ".aiff", ".ogg", ".flac", ".midi", ".mid", ".m4a" and variants; "You can also upload videos encoded in the “.mp4”
  format, use a YouTube Link for a transcription, or record your instrument directly", and Instagram Reels links.
  Limits: "You can upload files that are up to 15 minutes long and have a size of up to 100 MB", "If you want to use
  the recording option, your song is limited to 5 minutes", "a demo transcription will only transcribe the first 20
  seconds" ([file limitations](https://klang.io/help/file-limitations/), "Updated on June 24, 2026", read 2026-11-10).
  Transcription Studio: "Upload an audio or video file, paste a YouTube, Instagram or TikTok link, or record your music directly" ([Studio page](https://klang.io/transcription-studio/), read 2026-11-10).
- **Output.** "PDF (guitar sheet music or bass tab), MIDI (quantized/unquantized), MusicXML and GuitarPro"
  ([Guitar2Tabs page](https://klang.io/guitar2tabs/)); the formats article adds LilyPond (".ly file") and says of
  GP5: "For Guitar2Tabs and our Klangio Transcription Studio, there is an exclusive download format: a Guitar Pro
  file ... They can be opened with the Guitar Pro Editor or TuxGuitar." It also says "Unquantized MIDI exports
  preserve the original transcription and do not include edits made in the Sheet Viewer; edits are included only in
  quantized MIDI exports" and that the MusicXML file "is not adaptive to changes in tempo of the original audio and
  instead is using the nominal tempo that was detected in the audio file"
  ([download formats](https://klang.io/help/download-formats/), "Updated on September 28, 2026", read 2026-11-10).
  No per-note confidence or JSON output is described on the app pages read; the API is covered in `../hosted-apis/`.
- **Editable inside the product.** Yes, with a full (paid) transcription: "In the top left corner of the screen, you
  can enter the Edit Mode, to modify your sheet. To access the features, you need to upgrade to a full transcription"
  ([transcription viewer](https://klang.io/help/transcription-viewer/), "Updated on October 1, 2026", read 2026-11-10).
- **Capo and tuning: set by the user before the run.** "Guitar2Tabs & Klangio Transcription Studio: Choose the
  tuning and capo. ... If you are transcribing a guitar as a solo instrument, you can choose to add a capo to your
  transcription and change the tuning." Step 4 offers "additional information to your transcription, which can
  improve the quality of the notes" or "let Klangio apply the settings for you"
  ([wizard](https://klang.io/help/transcription-wizard/)). Automatic capo or tuning detection: not described on the
  pages read.
- **Correction triggers re-analysis.** A whole-song re-run with new settings exists: "After clicking on the
  “Retranscribe” button, the Transcription Wizard will pop up, which allows you to select the mode and instruments and
  to edit the additional information for the transcription"; "retranscribing a full transcription is completely free
  and does not use another ticket"; "currently, retranscribing is only available in the Klangio web apps"
  ([retranscribe](https://klang.io/help/retranscribe/), "Updated on June 29, 2026", read 2026-11-10). A single note
  edit re-running the analysis around it: not described.
- **Sync and practice.** "you can adjust the volume of the playback, change the speed and switch between the original
  audio and the audio of the transcription" ([transcription viewer](https://klang.io/help/transcription-viewer/)).
  Looping, metronome or count-in: not described on the pages read.
- **Video of the hands.** Not described; video files and links are accepted as sound sources (above).
- **Platforms.** Web; "the Klangio Apps for iOS and Android"; "the Klangio Transcription Plugin (VST3)"; MuseHub
  ([terms](https://klang.io/terms/) §3.1).
- **Price (read 2026-11-10 from the rendered pricing table on https://klang.io/guitar2tabs/ , US dollars as shown to
  this box).** Free: "Demo transcriptions", "Transcribe up to 30 seconds", "Download as PDF". Guitar2Tabs Pro:
  "$14.99" struck through, "$6.25 /month Billed annually", "50 transcriptions/month", "Transcribe songs up to 15
  minutes long", "Download PDF, MIDI, Guitar Pro & MusicXML". Klangio Ultimate: "$29.99" struck through, "$12.50
  /month Billed annually", "250 transcriptions/month", Transcription Studio Pro and the DAW plugin included; banner
  "60% DISCOUNT"; "14-day money-back guarantee". Sources conflict on the demo length: the pricing table says "30
  seconds"; the same page's text, the file-limitations article and the terms say 20 seconds.
  App Store (Guitar2Tabs iOS, "Version 1.8.1 Oct 6", read 2026-11-10) in-app purchases: "Pro Monthly $9.99", "Pro Yearly
  $99.99", "Klangio Universe Monthly $24.99", "Klangio Universe Subscription $149.99", "Single Ticket $2.99", "3 Tickets
  Package $4.99", "10 Tickets Package $9.99", "50 Tickets Package $24.99" ([App Store](https://apps.apple.com/us/app/id1589660528)).
- **API or embed.** The terms list "API endpoints that allow integration into external systems for automated or
  large-scale transcription workflows (https://klang.io/api)" and say "API access and Bulk Transcription are not
  included in the subscription plans; they are offered exclusively as separate business services subject to separate
  terms and require separate registration" ([terms](https://klang.io/terms/) §3.1, §5.2.3). The API page shows request
  tiers as list items: "50 requests included", "1 request per minute"; "500 requests included", "$0.20 each other
  request"; "3000 requests included", "$0.17 each other request"; "Enterprise", "10,000 requests included", "$0.10 each
  other request"
  but the monthly amounts did not appear in the page text fetched with curl ([api](https://klang.io/api/), read
  2026-11-10). Details: `../hosted-apis/survey.md`.
- **Terms: output ownership and commercial use** ([General Terms of Use](https://klang.io/terms/), read 2026-11-10;
  the page carries no version date, footer "Copyright © 2026 Klangio GmbH"):
  - §5.2.1: "The Free Tier allows users to access Klangio Services without creating a user account and without
    incurring any costs. It is intended exclusively for non-commercial use ... (a) the number of Demo Transcriptions is
    limited to 30 per day, (b) the duration of each transcription is limited to 20 seconds, (c) export is restricted to
    sheet music in PDF format, which includes a watermark, (d) the Edit Mode is not available, (e) transcriptions
    remain available for a period of 30 days."
  - §12.4: "The use of Klangio Services and Apps is intended exclusively for private, non-commercial purposes, subject
    to the exception described below. Commercial use is permitted exclusively for original musical compositions
    created by the user, provided that the output is based on full transcriptions rather than a demo transcription
    (see § 5.2.1)."
  - §12.5: "Transcriptions may only be used by you in accordance with applicable laws, in particular copyright laws.
    They must not be used to train music transcription AI systems or similar technologies."
  - §12.3: "You are solely responsible for the use of the transcripts, which we only provide to you on the basis of
    your uploads. You undertake not to infringe the rights of third parties by using the transcriptions."
  - §8.1 on uploads: "We do not use the content uploaded by you to train our AI models or for any other purposes
    beyond the provision of the Klangio Services in accordance with these Terms of Use."
  - §7.5: "You are not entitled to make the Software available to third parties for use, whether in return for
    payment or free of charge, to sublet it or otherwise transfer rights of use to third parties, unless we have given
    our express prior written consent."
  - The terms do not contain a sentence assigning ownership of the transcription to either party (searched for "own",
    "right", "licen" on 2026-11-10; §7.1 is about "the Software", §13 about Klangio's own IP).
- **Published accuracy claims.** "With state-of-the-art technology, your transcriptions have unparalleled accuracy"
  and "Our AI tab generator is highly accurate, especially when the audio quality is good"
  ([Guitar2Tabs page](https://klang.io/guitar2tabs/)). No benchmark number with a dataset was found on the pages read.

## Songsterr (tab library, player, editor and "Songsterr AI")

- **What it is.** Web tab player and editor with iOS and Android apps, run by "Guitar Tabs LLC"
  ([terms](https://www.songsterr.com/terms), "Last Modified: June 10, 2026", read 2026-11-10). App Store listing:
  "Version 10.5.0 Oct 26" ([App Store](https://apps.apple.com/us/app/id399211291), read 2026-11-10).
- **Input.** "Paste a YouTube link or upload an audio file, and Songsterr AI turns the song into an interactive tab in
  minutes" ([help](https://www.songsterr.com/help), read 2026-11-10). The AI page (`/ai`, which redirected to
  https://www.songsterr.com/new on 2026-11-10) shows "YouTube link or upload an audio file".
- **Settings before the run (user-set constraints).** The `/new` page shows "First bar time signature", "Pickup bar
  duration", "First bar tempo (BPM)", "Triplet feel", each set to "Auto" by default, and per-instrument rows
  ("Rhythm guitar", "Lead guitar", "Bass", "Drums", "Piano", "Vocals", "Fingerstyle" ...) each with a tuning such as
  "Standard 6-string (E A D G B E)" and a "Capo fret" field (read 2026-11-10). Help: "Guitars with 6, 7 or 8 strings
  and basses with 4, 5 or 6 strings, in popular or custom tunings, with or without a capo. Set them in Show settings
  before you start." Capo or tuning detection from the audio: not described.
- **Output.** "It writes separate tracks for rhythm and lead guitar, bass, drums and vocals, plus piano, keys and synth,
  strings and winds. The tab plays along with the recording you used: your audio file, or the YouTube video while it is
  available"; "Songsterr AI writes playing techniques into the tab, including bends, vibrato, slides and palm mutes"
  ([help](https://www.songsterr.com/help)). Downloads: "On the website, expand the player panel and choose Download tab,
  then MIDI or Guitar Pro" (help); Plus lists "Download ... in MIDI, Guitar Pro, MP3, and WAV formats"
  ([Plus](https://www.songsterr.com/plus), read 2026-11-10).
- **Editable.** "Yes. The tab opens in the Songsterr Editor: fix any note, add parts, then submit it for publication when
  it's ready" (help). Re-analysis after a correction: the help says "You can improve existing tabs by editing them in the
  Songsterr Tab Editor or by using AI Transcribe to create a new draft"; a correction feeding back into the AI is not
  described.
- **Time.** "A tab is usually ready in 5–15 minutes, and we email you when it's done" (help).
- **Sync and practice (Plus).** "Pause-Free Sync with Original Audio", "Playback Speed ... without changing pitch",
  "Loop", "Solo & Mute", "Pitch Shift ... to match your guitar tuning" ([Plus](https://www.songsterr.com/plus)).
- **Video of the hands.** Not described.
- **Price.** "You can start with a free 20-second preview. Full-length transcription is included in Songsterr Plus"
  (help); Plus includes "AI Transcription of Full Tabs ... Transcribe 50 complete tabs per month" ([Plus](https://www.songsterr.com/plus)).
  The Plus page shows no amount without signing in (page rendered in headless Chromium, 2026-11-10). App Store
  in-app purchase list: "Songsterr Plus $9.99", plus several "Legacy Subscription $4.99" entries
  ([App Store](https://apps.apple.com/us/app/id399211291), read 2026-11-10); the billing period is not shown there.
- **API.** No developer API documented on the pages read; see `../hosted-apis/survey.md`. Songsterr publishes an
  agent policy at https://www.songsterr.com/ai.txt ("Last updated: 2026-11-09", read 2026-11-10).
- **Terms clauses** ([terms](https://www.songsterr.com/terms), "Last Modified: June 10, 2026", read 2026-11-10):
  - User content: "You retain any and all of your rights to any Content you submit, post or display on or through the
    Service and you are responsible for protecting those rights. ... by posting Content using the Service you grant us
    the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on
    and through the Service."
  - Site content: "Content found on or through this Service are the property of Guitartabs LLC or used with
    permission. You may not distribute, modify, transmit, reuse, download, repost, copy, or use said Content, whether
    in whole or in part, for commercial purposes or for personal gain, without express advance written permission from
    us."
  - Automated access: "You may not use, and may not instruct, enable, or permit any automated tool, script, browser
    extension, or AI agent to use, any means to circumvent, disable, or bypass paid (Plus) features ... Independent
    tools that do not modify, automate, or interfere with the Service or its tab player are not restricted by this
    section."
  - [ai.txt](https://www.songsterr.com/ai.txt) (a plain-text file whose lines start with "#", omitted here): "AI model training: NOT permitted. Do not use Songsterr content (tabs,
    notation, song metadata, lyrics, audio, API responses) to train, fine-tune or evaluate AI models, or to build
    datasets for that purpose."
  - The terms do not say who owns a tab produced by Songsterr AI from a user's upload (searched 2026-11-10 for "AI",
    "transcri", "own").

## Songscription (Songscription, Inc.)

- **What it is.** Web app, "a music transcription platform that uses artificial intelligence to convert audio
  recordings into sheet music, MIDI files, guitar tabs, and MusicXML" ([home](https://www.songscription.ai/), read
  2026-11-10). Its terms link (https://www.songscription.ai/terms) redirected to https://playanything.com/terms on
  2026-11-10; the terms name "Songscription, Inc." and say "The Service includes the Songscription web application and
  the AnythingPiano mobile application" ("Last updated June 18, 2026").
- **Input.** "A recording, a YouTube, Instagram or TikTok link, your microphone, or a photo or PDF of printed music";
  "Audio, video, PDF, photos, MusicXML or MIDI" (home).
- **Output.** "Sheet music and MIDI from any of them. Tabs for guitar and bass from a recording or a link"; guitar tabs
  "Export as a PDF or Guitar Pro file" (home); plans list "MIDI, MusicXML, PDF, and Guitar Pro export"
  ([pricing](https://www.songscription.ai/pricing), read 2026-11-10).
- **Tuning and capo.** "We’re able to detect the notes from your acoustic guitar audio and notate them as guitar tabs
  ... At the moment, we only support standard tuning" (home). Capo: not described.
- **Editable, corrections.** "Change any note, ask Annie to edit it, hear it back"; "Annie works inside the editor.
  Tell her what you want in plain words, and she edits the score. Then keep the change or undo it" (home, pricing).
  Re-running the transcription with a user constraint: not described.
- **Sync and practice.** "Playback the tabs to hear the transcription"; for sheet music "Speed it up or slow it down"
  (home). Looping, metronome: not described on the pages read.
- **Video of the hands.** Not described (video files are accepted as input).
- **Price** (rendered [pricing](https://www.songscription.ai/pricing), 2026-11-10, yearly view): Free "$0", "The first
  30 seconds of each song, free"; Plus "$8.33 /month", "$99.90 billed yearly", "60 minutes of transcription a month",
  "Songs up to 15 minutes long"; Pro "$24.99 /month", "$299.90 billed yearly", "300 minutes of transcription a month";
  Enterprise "API access", "Bulk transcriptions", "Contact sales". FAQ: "Start a 14-day free trial (no card required)
  for 2-minute transcriptions."
- **Training use of uploads** (pricing FAQ): "By default, we may use the audio and transcriptions you submit to help
  improve our AI models. Plus and Pro subscribers can opt out at any time from their account settings."
- **Terms clauses** ([terms](https://playanything.com/terms), "Last updated June 18, 2026", read 2026-11-10):
  - §5.1: "Company grants you, solely for your personal, non-commercial use, a limited, non-exclusive,
    non-transferable, non-sublicensable, revocable license to: ... (b) access and use the Service."
  - Credits: "You may not use Credits to generate, download, or access Digital Sheet Music Files or Outputs for any
    commercial purpose, including sale, sublicense, or redistribution, except as expressly permitted by Company."
  - §8.1: "You retain any copyright and other proprietary rights that you may hold in the User Content that you Post to
    the Service, subject to the licenses granted in these Terms." The license granted to the company includes the right
    to "train or improve our AI or machine learning models".
  - "Output" is defined as what the AI produces ("transcribe audio files into sheet music and various digital formats
    (e.g., MIDI) (“Output”)"); "Transcription" is defined as notation "created by a user within the App, as distinct from
    Output generated automatically by the Service’s AI". No clause assigning ownership of Output was found (searched
    2026-11-10).
- **Press.** TechCrunch, 2025-06-30: https://techcrunch.com/2025/06/30/songscription-launches-an-ai-powered-shazam-for-sheet-music
  (URL from search results; the article itself was not read).

## Tabtify

- **What it is.** Browser tab editor with AI conversion ([home](https://tabtify.com/), read 2026-11-10). The page's HTML
  references alphaTab ("alphatab.net"), the open-source tab renderer covered by the web-tab-render lane.
- **Input.** "Turn audio, MIDI, or a public media link into guitar, bass, or ukulele tab"; "Audio, public media links
  (YouTube, TikTok, Instagram, Pinterest), live recording, and MIDI upload paths"; "Sources can be up to 15 minutes long"
  (home). Also "PDF or photo pages read into tabs" ([pricing](https://tabtify.com/pricing)).
- **User-set constraints.** "Describe the instruments you hear and indicate whether someone is singing. Adjust the
  instrument setup if needed"; "Instrument setup, with tuning and capo under Settings"; "String count, tuning, and capo
  help map notes to your instrument"; instrument profiles "Acoustic Guitar 6-string", "Electric Guitar 6 & 7-string",
  "Bass 4, 5 & 6-string", "Ukulele G C E A" (home). Detection of capo or tuning: not described.
- **Output.** "MIDI (.mid)", "Guitar Pro (.gp)", "alphaTex (.alphatex)", "PDF (.pdf)", "MusicXML (.musicxml)"; "Guitar
  Pro (a .gp file for Guitar Pro 7 and 8, not the older .gp5)"; opens "GP3, GP4, GP5, GPX, and GP, plus MusicXML files
  including XML and MXL" (home).
- **Editable.** "Fix notes, timing, measures, and fret choices"; terms mention "a new version that only redraws an
  existing tab" as a separate action that does not count against limits ([terms](https://tabtify.com/terms)).
- **Sync and practice.** "Play back, loop bars, match the source"; "playback, media sync, guitar neck visualization"
  (home). Metronome, count-in, slow-down: not described on the pages read.
- **Video of the hands.** Not described.
- **Price** (rendered [pricing](https://tabtify.com/pricing), 2026-11-10): Free "$0", "The tab editor with playback,
  every export, and up to 3 saved tabs. AI conversion is not included." Pro "$15/month" or "$99/year" ("$8.2/month"),
  "100 AI conversions a month", "10 PDF or photo pages a month", "Up to 15 min per song". Max "$25/month" or
  "$129/year", "Unlimited AI conversions*", "*Fair use: 300 AI conversions per 30 days. MIDI doesn't count." "7-day
  money-back".
- **Terms clauses** ([terms](https://tabtify.com/terms), "Last updated: October 26, 2026", read 2026-11-10):
  - §2: "Tabtify grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service
    for personal, non-commercial purposes. You may not modify, copy, distribute, transmit, display, perform, reproduce,
    publish, license, create derivative works from, transfer, or sell any information or services obtained from the
    Service without prior written consent from Tabtify. This does not limit what you do with tabs of your own original
    music: those are yours to use however you like."
  - §4: "Your uploads stay private to your account unless you choose to publish a tab, and we do not use them to train
    AI models. ... You are responsible for how you use the resulting tabs".
- **API.** None found on the pages read.

## audio2guitar

- **What it is.** Web app ([home](https://audio2guitar.com/), read 2026-11-10).
- **Input.** "MP3, WAV, Suno, Udio, worship recordings, or voice memos"; free plan "MP3 only"; Pro "MP3, WAV, FLAC,
  M4A, OGG+" ([pricing](https://audio2guitar.com/pricing), rendered 2026-11-10). The home page has a "YouTube videos"
  source card linking to `/youtube-to-guitar-tab` (that page was not read).
- **Method, as the vendor states it.** "The AI uses source separation (based on the Open-Unmix architecture) to isolate
  the guitar, then detects notes, chords, and fret positions" (home FAQ).
- **Output.** "Note-by-note tablature with techniques. Hammer-ons, pull-offs, slides, bends", "Chord Diagrams", "Synced
  Lyrics", "Download separated vocals, bass, drums, guitar, and piano as MP3 or per-stem MIDI"; "Export MIDI. Print or
  save as PDF" (home). The demo card shows "Tuning: Open G | Key: G | Tempo: 125 BPM"; whether tuning is detected or
  set is not stated on the pages read.
- **Editable.** Pro: "Fix any note, change fret positions, correct lyrics" (home); the pricing table row "Edit tabs" shows "-" for Free
  and "✓" for Pro. Re-analysis after a correction: not described.
- **Sync and practice.** "Tabs, chords, and lyrics synced to audio. Slow it down"; "Slow down to 25%" (home);
  pricing table lists "Speed control" and "Guitar tuner" on both plans.
- **Price** (rendered pricing, 2026-11-10): "ANNUAL $59.99/yr $5.00/mo", "MONTHLY $8.99/mo", "ONE-TIME $9.99 10
  transcription credits"; Free "3 songs". Terms: "The current limit is 35 new songs in any rolling 7-day period" for Pro
  ([terms](https://audio2guitar.com/terms), "Last updated: August 14, 2026").
- **Published accuracy claim (vendor's own).** "Our pipeline achieves 97.8% string assignment accuracy on the GuitarSet
  benchmark, a standard dataset from the Center for Computer Research in Music and Acoustics (CCRMA) at Stanford" (home
  FAQ). No method, split or paper is given on the page.
- **Terms clauses** ([terms](https://audio2guitar.com/terms), read 2026-11-10): "You retain all rights to audio files
  you upload. We do not claim ownership of your content."; "Generated transcriptions are derived from your uploaded
  audio and are provided for personal, educational use."; you agree not to "Use automation, scripts, bots, or other
  tools to submit songs in bulk", "Operate a commercial transcription service using audio2guitar", "Resell or
  redistribute transcription results at scale without permission".

## AAPA AutoTabs (AAPA Music LLC): video in, reads the fretboard

- **What it is.** Web app "Alex's Audio Production Assistant" by AAPA Music LLC; the rendered pricing page showed
  "v2.43" and "We're still in early access, so things might break" ([pricing](https://aapamusic.com/pricing), rendered
  2026-11-10); the curl copy of the home page showed "v2.38" ([home](https://aapamusic.com/), read 2026-11-10).
- **Input.** "Upload a guitar video"; "Guitar video", "Fretboard performance", "Practice clip" (home).
- **Video of the hands: yes, as the vendor describes it.** "AutoTabs listens to the audio and uses machine vision to
  analyze the guitarist's hands and fretboard"; "By analyzing fretboard positions and hand movement directly from video,
  machine vision helps improve transcription accuracy beyond audio-only approaches" (home). Terms §2: the service
  "Analyzes video recordings of guitar performances using machine vision", "Detects hand positions and finger
  placements on the fretboard", "Generates guitar tablature based on detected notes and timing", "Provides audio
  analysis including tempo, key, and chord detection" ([terms](https://aapamusic.com/terms), "Last updated: January 14,
  2025", read 2026-11-10). No model, method or accuracy figure is published on these pages.
- **Output.** "Editable tabs", "PDF", "MIDI", "Video overlays" (home). Other tools on the site menu: "Key Detection",
  "Beat Detection", "Lyrics Transcription", "Audio Splitter (Stems)", "Video + Audio Sync".
- **Editable.** "Review the draft, fix what needs fixing, and export when it is ready" (home). Capo, tuning settings
  and re-analysis after a correction: not described on the pages read.
- **Price** (rendered pricing, 2026-11-10): Free "$0" ("Includes the base request limit"); Pro "$5 /month"; Unlimited
  "$10 /month"; "AAPA is free to use. There are no paywalled features. Paid tiers are for higher usage limits only.";
  "Beta promo: use BETA at checkout for 80% off".
- **Terms clauses** ([terms](https://aapamusic.com/terms), read 2026-11-10): §4.1 "You retain ownership of videos you
  upload. By uploading content, you grant us a limited license to process it for tab generation. This license
  terminates when you delete your content." §4.2 "If you opt-in to share your video for ML training, you grant us a
  non-exclusive, royalty-free, perpetual license to use the video for improving our detection algorithms." §5 you agree
  NOT to "Resell or redistribute generated tabs commercially without permission" and "Use automated tools to scrape or
  extract data".

## GrabTab: phone camera on the neck plus audio (not released on 2026-11-10)

- **Status.** "Coming soon to iOS & Android"; "GrabTab is launching soon" ([home](https://grabtab.app/), read
  2026-11-10). Footer "© 2026 GrabTab. Made in the EU."; terms: "governed by the laws of Spain, where GrabTab is
  operated" ([terms](https://grabtab.app/terms/), "Last updated: 2 June 2026", read 2026-11-10).
- **Method, as the vendor describes it.** "GrabTab splits your clip into audio and frames. Audio gives the notes and
  timing; the camera reads the fretting hand for the right string and fret"; "A fingering algorithm picks the most
  playable position"; two modes, "Audio only" ("fret positions are GrabTab's best guess from a playability algorithm")
  and "Audio + camera" ("GrabTab watches the fretting hand, so the string and fret it writes down are the ones you
  actually played"); "records crisp 60fps video" (home). Privacy policy: "Note detection (pitch and timing) and
  hand/fret tracking run on self-hosted models on our server"; "AI Tab Cleanup and the AI Practice Coach are optional
  features ... the text of your tab (not the audio or video) is sent to our AI provider, Anthropic"
  ([privacy](https://grabtab.app/privacy/), read 2026-11-10).
- **Input.** Recording in the app; FAQ "Can I transcribe a YouTube video?", answer "Not at launch."; Pro "import your own videos" (home).
- **Output.** "Tab + standard notation, PDF export"; Pro "Synced original-video-over-tab playback" (home).
- **Corrections.** "View it in-app, edit notes that look wrong" (home). Privacy: "when you correct a tab and tap Submit
  correction ... stores that clip's audio together with your corrected tab so we can improve the model later". A
  correction re-running the analysis: not described.
- **Price as announced** (home): Free "€0", "3 transcriptions per day", "10-second clips", "No video upload"; Pro
  "€3.99/mo or €29.99/yr". The terms say "a free tier with a limit on how many clips you can transcribe per week"
  (per-day on the home page, per-week in the terms: sources differ).
- **Terms clauses** ([terms](https://grabtab.app/terms/)): "You keep ownership of every recording you make. By using the
  service you grant GrabTab a limited licence to process your recording as needed to generate, store, and show
  transcriptions back to you." No clause on commercial use of the tab was found. You agree not to "attempt to disrupt,
  overload, reverse-engineer, or abuse the transcription pipeline or the API".

## Soundslice (Soundslice LLC): synced notation player and editor; transcription is manual

- **What it is.** "Soundslice is a sheet music editor with built-in support for synced audio. Import a YouTube video
  or MP3, and we’ll give you very fine-grained ways to dig in. Make precise loops, slow down without changing pitch,
  and navigate to exact moments. As you figure out notes, enter them in our editor"
  ([transcribe page](https://www.soundslice.com/transcribe/), read 2026-11-10). No automatic audio-to-notes feature
  is described on the pages read; the automatic features listed are the "Sheet music scanner" ("Turn PDFs and photos into
  interactive sheet music"), "Auto-generate stems for vocals, drums and bass" and "Save time with our auto-sync feature"
  ([home](https://www.soundslice.com/), [plans](https://www.soundslice.com/plans/), read 2026-11-10).
- **Input.** YouTube videos (free plan: "With a free account, you can use Soundslice to transcribe YouTube videos");
  "With a paid account (the “Plus” plan), you can transcribe MP3 files and video files you’ve uploaded"
  ([transcribe page](https://www.soundslice.com/transcribe/)); "Import MusicXML and Guitar Pro files", "Import
  PDFs/photos", "Attach Mux/Vimeo/Wistia videos", "Attach multitrack stems" ([plans](https://www.soundslice.com/plans/)).
- **Output.** "Export your created slices as PDF (for printing)", "... as MusicXML", "... as MIDI" (plans table;
  which plans tick each row is shown by icons that did not survive text extraction).
- **Tuning.** "Use custom tab tunings" (plans table). Capo: not found on the pages read.
- **Sync and practice.** "Loop sections by dragging over music", "Slow down audio without changing pitch", "Use speed
  training", "Metronome and count-in", "Flip videos ... If you’re left handed" ([features](https://www.soundslice.com/features/),
  [plans](https://www.soundslice.com/plans/)). The player syncs notation to "real human performances — MP3s or videos".
- **Video of the hands.** Video is shown in sync with the notation; it is not analysed (no such feature found).
- **Price** ([plans](https://www.soundslice.com/plans/), read 2026-11-10): Free "$0"; Plus "$5" per month or "$50" per
  year; Teacher "$20" per month or "$200" per year; Licensing "$100" "per month for 200 users", "Each additional user is 50
  cents/month", which adds "Embed Soundslice in your site/app".
- **API or embed.** "you simply copy and paste our embed code into your site. It’s a simple <iframe> ... We also have a
  JavaScript API for advanced integration" ([licensing](https://www.soundslice.com/licensing/), read 2026-11-10). Data
  API: https://www.soundslice.com/help/data-api/ (covered in `../hosted-apis/survey.md`).
- **Terms clauses** ([terms](https://www.soundslice.com/terms/), footer "© 2026 Soundslice LLC", no date on the page,
  read 2026-11-10): §7.5 "You retain any intellectual property rights in the content you upload or post to the Service.
  You hereby grant Soundslice a worldwide, non-exclusive, royalty-free license (with the right to sublicense) to use,
  copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such Content in any and all media or
  distribution methods (now known or later developed)." [Acceptable use policy](https://www.soundslice.com/terms/aup/)
  (read 2026-11-10): you may not "Attempt to access or search or scrape or download content from Soundslice, or
  otherwise use Soundslice through any engine, software, tool, agent, device or mechanism (including automated scripts,
  spiders, robots, crawlers, data mining tools or the like) other than the software and/or search agents provided by
  Soundslice" and may not "Use Soundslice for any commercial purpose or the benefit of any third party, except as
  otherwise explicitly permitted for you by Soundslice or in any manner not permitted by the Terms".

## Moises (Moises Systems, Inc. d/b/a Music AI)

- **What it is.** Stem separation and practice app on web, desktop, iOS and Android: "Moises offers a web app that
  runs directly in your browser, as well as applications for Desktop, iPhone, iPad, and Android"; tools "such as Stem
  Separation, Chord Finder, Speed Changer, Lyric Transcription" ([home](https://moises.ai/), rendered 2026-11-10;
  `https://moises.ai/pricing` redirected there). App Store "Version 2.153.0 5d ago" ([App Store](https://apps.apple.com/us/app/id1515796612), read 2026-11-10).
- **Input.** "Upload a song and play along in seconds"; "Separate vocals, drums, bass, guitar, keys, and more from any
  audio file" (home). YouTube-link import: not described on the pages read.
- **Output and analysis (App Store description).** "AI Audio Separation of Stems: Easily separate vocals, drums,
  guitar, bass, piano, strings, and other instruments"; "Separate into 27 stem types" (home); "Smart Metronome: Instantly
  generate click tracks that are in sync to the beat of any song"; "AI Chord Detection: Follow along to the bars and beats
  of the song and play along with instantly synced guitar tabs and chords. Featured beginner, intermediate and advanced
  chord detection"; "Audio Speed Changer ... Moises automatically detects and displays the BPM"; "Pitch Changer ...
  Shift the pitch to meet your vocal range or instrument tuning"; "AI Key Detection: Detect and change the song key and
  instantly transpose chords to all 12 keys"; "Count in: Set the "count in" period that precedes the playback". Note-level
  tab transcription with string and fret: not described. Chord editing or re-analysis: not described on the pages read.
- **Video of the hands.** Not analysed; "Video Recording ... Film your performances" is a recording feature (home).
- **Price.** "Moises offers a free tier that provides a limited number of uploads each month ... Log in to see our full
  pricing and features table" (home). App Store in-app purchases: "Moises Premium - Monthly $5.99", "Moises Premium -
  Yearly $39.99", "Moises Pro - Monthly $29.99" (read 2026-11-10).
- **API.** The developer platform is Music.AI; see `../hosted-apis/survey.md`.
- **Terms clauses** ([terms](https://moises.ai/terms/), "Last Updated: October 7, 2026", read 2026-11-10):
  - §1 (definition): "Output includes any new or modified audio or text, stems, transcriptions, analyses, projects
    (whether final or in progress), and other generated or edited results."
  - §8.1: "Moises grants you, solely for your personal use, a limited, non-exclusive, non-transferable, non-
    sublicensable, revocable license to ... (b) access and use the Website and Platform ... For clarity, this
    personal-use limitation does not prohibit you from using or distributing Output commercially, subject to Section 11.2
    (Ownership and Limitations), any applicable feature-specific restrictions in these Terms, and any third-party
    rights."
  - §11.2: "You ... retain(s) all rights, title, and interest in and to the User Content ... Furthermore, to the extent
    allowed in your jurisdiction you ... retain(s) all rights, title, and interest in and to your Output you generate
    using the Platform."
  - §11.4: "WE DO NOT USE YOUR USER CONTENT OR OUTPUT TO TRAIN AI MODELS WITHOUT YOUR PERMISSION."
  - §14.6: you may not "access, search, or otherwise use any portion of the Service through the use of any engine,
    software, tool, agent, device, or mechanism (including spiders, robots, crawlers, and data mining tools) other than
    the software or search agents provided by Moises or Third-Party Agents connected through functionality expressly
    provided by Moises under Section 12.4 (AI Agent)".

## Chord ai (Nomad AI OU): chords, beats, voicings, capo suggestion

- **What it is.** iOS / Android app, "Version 6.3.0 5d ago", developer and seller "Nomad AI OU"
  ([App Store](https://apps.apple.com/us/app/id1446177109), read 2026-11-10; https://chordai.net/terms returned 404).
- **Input.** "You can select any song by browsing your audio files, SoundCloud or YouTube ... Or you can use your device
  microphone to get the chords in real-time of any song playing around you or from your own playing" (App Store).
- **Output.** Chords ("major, minor, augmented, diminished, 7th, M7th, sus2 and sus4"; more in Pro), "Slash Chord
  Recognition ... [Pro version]", "Voicing & Position recognition ... which notes should be played, including their
  octaves, and which positions match best with the song [Pro version]", lyrics, "beat tracking algorithms to display
  chords organised into bars and beats", "Automatic music separation into 4 stems: Bass / Drums / Vocals / Other",
  "MIDIFY ... Export midified audio as a midi file", "Export transcriptions as PDF files"; release notes for 6.2.9 ("Oct 27"):
  "Export: Text and ChordPro open the share options the same way as the PDF export" (App Store).
- **Capo and tuning.** "Smart capo: you can also let Chord ai tell you preferred capo for either easiness of play of song
  matching [Pro version]"; "Alternate tunings for guitar / ukulele / banjo / mandolin such as Drop D, DADGAD, Open
  D/G/A/C etc. [Pro version]". Release notes 6.2.8: "Capo: Easiness finds the capo with the easiest shapes, using your
  edited chords"; 6.2.9: "Chord edits: "Apply edit to all" keeps working after you change the capo or pitch" (App Store,
  version history). So user chord edits feed the capo search, per these notes.
- **Sync and practice.** "Speed change", "Pitch shift", "Loop" (App Store).
- **Video of the hands.** Not described.
- **Price.** App Store in-app purchases: "Chord ai Pro: Monthly $10.99", "Chord ai Pro: Yearly $69.99", family plans
  "$14.99" monthly and "$99.99" yearly (read 2026-11-10).
- **Terms.** The listing links "Terms of use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" (Apple's
  standard EULA); no product-specific clause on output ownership was found.

## Ultimate Guitar (Muse Group): tab library, "AI chords", Pro player

- **What it is.** Tab and chord library with web and mobile apps; App Store "Version 7.3.38 2d ago", developer
  "Ultimate Guitar" ([App Store](https://apps.apple.com/us/app/id357828853), read 2026-11-10).
- **AI chords (audio in, chords out).** "we’ve introduced AI chords, a new feature now available in the UG app ... Find
  the song on YouTube and copy the link ... the maximum supported video length is 15 minutes ... Your AI chords will be
  ready in 10 minutes or less ... You have only 10 attempts to use this feature per 24 hours"
  ([help article](https://help.ultimate-guitar.com/en/articles/14771579-what-are-the-ai-chords), dated "May 22, 2026",
  read 2026-11-10). AI tab with string and fret from audio: not found.
- **Editing and practice (App Store description).** "Create ‘Personal’ tabs to edit chords, lyrics or change tabs to suit
  your needs", "Use interactive tabs to play songs note by note, at your own pace", "Hit the right tempo with metronome",
  "Share, print, and export your fave songs".
- **Price.** App Store in-app purchases include "Ultimate Guitar Pro $39.99", "Ultimate Guitar Pro $9.99", "UG Pro+ (1
  Year) $39.99", "UG Pro+ (1 Month) $9.99" and sale variants (read 2026-11-10).
- **Terms clauses** ([terms](https://www.ultimate-guitar.com/about/tos.htm), "Last updated August 24, 2026", read
  2026-11-10): §6.3 "Except as expressly stated in Section 7 (“User Generated Content”), the Content available through the
  Service is the property of Ultimate Guitar or its Content Providers and is protected by copyright and other
  intellectual property laws. Content received through the Service may be accessed for your personal, non-commercial use
  only." §7.3 "The license you grant to Ultimate Guitar is non-exclusive (meaning you are free to license your User
  Generated Content to anyone else in addition to Ultimate Guitar)". No clause specific to AI-generated chords was found.

## Capo (SuperMegaUltraGroovy, Inc.)

- **What it is.** iOS / macOS app, "Version 4.7.3 Nov 2", "© 2026 SuperMegaUltraGroovy, Inc."
  ([App Store](https://apps.apple.com/us/app/id887497388), read 2026-11-10).
- **Function (App Store description).** "Using the songs in your music collection, Capo guesses the beats, chords, and
  key of songs"; "Slow down playback, scrub to hear specific notes, and easily create regions that loop"; "Use Capo’s
  tools to isolate specific instruments and even vocals"; "Change, add, or remove the detected chords easily ... Use
  Capo's structure song view to edit Capo's beat grid for songs with changing, or uncommon time signatures"; "Beat
  detection estimates the tempo". Tab output: not described in the listing.
- **Price.** In-app purchases: "Capo touch Pro - Yearly $19.99", "Capo touch Pro - Monthly $4.99", "Capo Platinum $49.99"
  and upgrade variants (App Store, read 2026-11-10).

## Positive Grid Spark app ("Auto Chords")

- Under the heading "Auto Chords": "Automatically display chords for millions of songs. Choose any song, and Spark will auto display its
  chords in real-time as you play. Easy controls let you slow down the song’s tempo or loop a difficult section";
  "*Requires Spark Amp*"; "Version 4.6.2 Sep 17", developer "Positive Grid Inc"
  ([App Store](https://apps.apple.com/us/app/id1457653921), read 2026-11-10).

## Yousician (Yousician Ltd)

- Lessons and play-along with microphone feedback: "real-time feedback that listens as you play", "Play along to
  thousands of songs with interactive tabs and real-time feedback", "Yousician listens and gives instant feedback on
  your pitch"; "Version 5.43.2 1d ago"; in-app purchases from "One Instrument Monthly Plan $19.99" to "Premium Plus:
  Yearly Plan $179.99" ([App Store](https://apps.apple.com/us/app/id959883039), read 2026-11-10). Transcription of the
  user's own audio into tab: not described.

## TabGenius (James Harrison Burt): text or voice prompt to tab, not audio transcription

- "simply type or speak your idea, and our advanced AI converts your input into clear, accurate guitar tabs"; "Speak your
  riff, chord progression, or melody, and watch as the app transcribes your words"; "Enjoy five free generations";
  "Version 1.8 07/15/2025"; in-app purchases "TabGenius+ $3.99", "TabGenius+ $29.99", "TabGenius Pro+ $7.99", "TabGenius
  Pro+ $49.99" ([App Store](https://apps.apple.com/us/app/id6742207048), read 2026-11-10).

## Chordify (Chordify BV)

- **Access note.** https://chordify.net, https://chordify.net/premium and the terms page answered HTTP 403 with a
  Cloudflare "Performing security verification" page to curl, WebFetch and headless Chromium on 2026-11-10; the
  Internet Archive copy (snapshot 2026-09-28 listed by archive.org's availability API) could not be fetched
  (connection reset). The Chordify terms ("https://chordify.net/pages/terms-and-conditions/") were therefore **not
  read**: UNVERIFIED, settled by opening that page in a normal browser.
- **What the App Store listing says** ([App Store](https://apps.apple.com/us/app/id1073624757), "Version 9.9.0 1d ago",
  developer "Chordify BV", read 2026-11-10): "Accurate chords for any song", "Seamless integration with YouTube", "Search
  our 36,000,000 song catalog", "Easily transpose the chords", "Try the capo feature and play your chordified songs the
  easy way", "Slow down songs to keep up", "Loop tricky parts", "Download the chords from your favorite songs as MIDI
  file", "Take the calculated chords with you as a PDF printout"; "Our service automatically recognizes the acordes and
  audio signal of a song and will synchronize this with your song". Note-level tab: not described. Capo here is a
  display option chosen by the user, per the wording.
- **Price.** App Store in-app purchases: "Monthly Subscription $8.00", "$9.00", "$8.99"; "Yearly Subscription $54.00",
  "$42.00"; "Black Friday Deal $47.90" (read 2026-11-10).

## Guitar Pro 8 (Arobas Music): tab editor and player; no automatic transcription found

- **Version.** Release notes list "Guitar Pro 8.1.5" as the newest entry
  ([new features / changelog](https://www.guitar-pro.com/c/10-guitar-pro-new-features), read 2026-11-10).
- **Formats** ([features](https://www.guitar-pro.com/c/14-guitar-pro-features), read 2026-11-10): "File import formats:
  .gtp, .gp3, .gp4, .gp5, .gpx, .gp, PowerTab, MIDI, ASCII, TablEdit, MusicXML and audio (.mp3, .wav)"; "File export
  formats: .gp5, .gp, .gpx, PowerTab, MIDI, ASCII, TablEdit, .mp3, .wav, FLAC, OGG, AIFF and .pdf".
- **Audio and practice.** "Use the audio track to transcribe faster ... You can also use your audio track to transcribe
  songs more easily"; "Synchronize your audio file with your score to transcribe songs easily"; "loop, speed trainer,
  metronome, visual countdown"; "Set the number of strings (from 3 to 10) and the tuning of your guitars"; "Use the
  detune feature to try another tuning in one click" (features and changelog pages). Automatic audio-to-tab: not found.
- **Platforms and price.** "Guitar Pro 8 Win/macOS", "Guitar Pro iOS/Android" (home); full version "$69.95", upgrade
  "$34.95" ([buy](https://www.guitar-pro.com/products/7-buy-guitar-pro),
  [upgrade](https://www.guitar-pro.com/products/8-buy-guitar-pro-upgrade), read 2026-11-10); system requirements
  "Windows 8 / 10 / 11", "macOS 10.13 or later"; "With the Guitar Pro free demo, enjoy all the Guitar Pro 8 features for 7
  days". No Linux build found.
- **License.** The terms-of-use page (https://www.guitar-pro.com/c/3-terms-of-use) covers the web site; the software
  license agreement text was not read (UNVERIFIED).

## AnthemScore (Lunaverus LLC): desktop app (Linux build) and AnthemScore Web

- **Version.** Newest entry "6.3.0", "released 2026-09-29" ([version history](https://www.lunaverus.com/versionHistory), read 2026-11-10).
- **Run on this kind of box.** Download page: "Windows 10/11 Installer", "iMac/MacBook macOS 11+", "Linux AppImage";
  "AnthemScore was tested on Ubuntu 20.04 and later"; "a minimum of about 4GB of RAM are needed to process most songs";
  "Virtual machines, 32-bit systems, and phones/tablets are not supported"; trial: "In the trial, you are limited to the
  first 30 seconds of each song" ([download](https://lunaverus.com/download), read 2026-11-10). No GPU requirement is
  stated there. RUNNABLE (whether it ran here: see `trials.md`).
- **Guitar tab and constraints.** FAQ: "Enter instrument settings and change the instrument to guitar. Then click the gear
  icon next to it and select "Tablature" under Staffs. Take a look at the number of frets and the string tunings under
  Tablature options and adjust as needed" ([FAQ](https://lunaverus.com/faq), read 2026-11-10). Capo: not found.
- **Output.** Desktop editions: "Export. musicXML, MIDI, and AnthemScore project (ASDT) formats"; Professional adds
  "PDF"; "Note Editing. Add/remove notes", "Edit measures. Change beat locations, time/key signatures, and tempo ... Tap
  downbeats while listening" ([compare editions](https://lunaverus.com/compareEditions), read 2026-11-10). Web version:
  "Tablature you can read and play along with in your browser", "Playback with the original recording, plus section
  looping", "Fix any note in the browser, then download PDF, MusicXML or MIDI"; upload types listed MP3, WAV, M4A, FLAC, OGG, MP4, MID, or
  "Record from microphone" ([audio to guitar tab](https://lunaverus.com/transcribe/audio-to-guitar-tab), read 2026-11-10).
- **Price.** Desktop: "AnthemScore 6 Lite ... $29", "Professional ... $39", "Studio ... $99" (one-time, Lite and
  Professional with one year of updates) (compare editions). Web: "$8.33 / month", "$99.90 billed annually", "30 songs a
  month", "Up to 6 minutes per song"; "$24.99 / month", "$299.90 billed annually", "100 songs a month", "Up to 10 minutes per
  song", "Free use of the AnthemScore desktop app while subscribed" ([web pricing](https://lunaverus.com/transcribe/pricing)).
- **Training data (author's own description, 2016).** "To train the network, I created a dataset of 2.5 million training
  examples from 3,000 MIDI files spanning several different genres of music ... A MIDI-to-WAV utility created the actual
  audio data" ([CNN article, Jun 2016](https://lunaverus.com/cnn), read 2026-11-10). Whether the 6.x models use the same
  data: not stated.
- **Terms** ([terms](https://lunaverus.com/tos), read 2026-11-10): "You retain all ownership rights to any audio files,
  musical works, or other content ("User Content") that you upload, submit, or process through the Service. However, by
  uploading User Content, you grant Lunaverus a limited, non-exclusive, royalty-free license to copy, process, store, and
  modify the User Content solely for the purpose of providing the transcription services to you."; "Before using the
  AnthemScore desktop software, you must agree to the terms in the "license.txt" file, which is included in every
  download of the software." That license.txt was not read (UNVERIFIED; it ships inside the AppImage).

## Melodyne 5 (Celemony)

- "With Melodyne, you see the notes in your recordings and samples, and can manipulate and modify them at will. Even with
  polyphonic instruments like the piano and guitar"; "Melodyne also recognizes chords, keys, tunings and tempos"
  ([what is Melodyne](https://www.celemony.com/en/melodyne/what-is-melodyne), read 2026-11-10). Tab output: not found.
  MIDI export, price, platforms: not read on 2026-11-10 (UNVERIFIED).

## RipX DAW (Hit'n'Mix)

- "RipX is the #1 AI DAW that goes far beyond stem separation by offering true note-level extraction. It breaks fully
  mixed audio down to the core notes"; "6+ Stem Separation. Edit Notes In The Mix"; "Buy Now – Starting at $99"; "Try
  RipX DAW PRO Free for 21 Days" ([home](https://hitnmix.com/), read 2026-11-10). Tab output, platforms, MIDI export
  details: not read (UNVERIFIED).

## Samplab: closed

- On 2026-11-10 `https://samplab.com/` answered `301` to `http://apple.com/` and then `https://www.apple.com/` (curl
  redirect chain, this box). 9to5Mac, 2026-10-19: "Apple Inc. (“Apple”), through a subsidiary, will acquire certain
  assets of Samplab GmbH (“Samplab”) and offer employment to and hire certain Samplab employees" (quoting the EU list of
  acquisitions), "a deal struck in June", and "Samplab’s website now redirects to Apple’s"
  ([9to5Mac](https://9to5mac.com/2026/10/19/apple-strikes-deal-with-ai-startup-that-lets-musicians-rework-recorded-music/),
  read 2026-11-10). The EU filing itself was not read.

## MIDI Guitar 2 and 3 (Jam Origin)

- MIDI Guitar 2: "turn your guitar into a polyphonic MIDI controller"; "Polyphonic and Articulate", "Low Latency";
  "Personal license for Windows/Mac standalone and plugins"; "Download Free trial"
  ([jamorigin.com](https://www.jamorigin.com/), read 2026-11-10). MIDI Guitar 3: "open beta: www.jam.live"; "the first
  audio-to-MIDI system for guitar to fully support MPE — MIDI Polyphonic Expression"; "MIDI Guitar 3 Hex is the same
  technology applied to hexaphonic pickup systems" ([jam.live](https://www.jam.live/), read 2026-11-10). Input is a live
  guitar signal; output is real-time MIDI (no tab, no string/fret output described). Prices: not shown in the page text
  (UNVERIFIED).

## Transcribe! (Seventh String Software): slow-down and analysis helper, Linux build

- "Transcribe! is available for Windows, Mac, and Linux"; "You may download Transcribe! and use it for 30 days evaluation";
  "the ability to slow down music without changing its pitch, to analyse chords and show you what notes are present";
  "If you are working from a video file then Transcribe! can usually display the video too"; "The spectrum analysis
  feature is very useful for working out those hard-to-hear chords, but you must still use your ear and brain"
  ([overview](https://www.seventhstring.com/xscribe/overview.html), read 2026-11-10). "Transcribe! is priced in US
  dollars, $39 for a single copy" ([buy](https://www.seventhstring.com/xscribe/buy.html), read 2026-11-10). No automatic
  tab output. RUNNABLE (Linux build, 30-day evaluation).

## ScoreCloud (Doremir Music Research)

- "ScoreCloud Songwriter takes recordings of voice and instruments and turns it into Lead Sheets, with melody, lyrics and
  chords"; "ScoreCloud Songwriter has a 10 day free trial. Download for PC & Mac"; "ScoreCloud Studio can be used for free up
  to 10 saved songs"; exports "PDFs, MusicXML, MIDI" ([home](https://scorecloud.com/), read 2026-11-10). Guitar tab output:
  not found on the home page.

## ChordU

- Home page features: "Your Personal Chord Finder", "Custom Chord Preference", "Change Speed and Scale", "Identify BPM
  Shifts", "Upload", "My Uploads" ([home](https://chordu.com/), read 2026-11-10). Terms and prices: not read (UNVERIFIED).

## Yamaha Chord Tracker

- "analyzing the audio songs stored in your iOS device and then displaying the chord symbols"; "with both graphical piano
  keyboard and guitar tab display options"; "The chords displayed by this application will match the mood of the original
  song very closely, but may not be an exact match"; "will not work for songs in iCloud or protected by DRM"; "will not work
  with Music Streaming services such as Apple Music"; "Version 2.3.9 May 25", developer "Yamaha Corporation of America"
  ([App Store, US](https://apps.apple.com/us/app/id992502589), read 2026-11-10). Free; no in-app purchases listed.

## Fender apps

- **Fender Studio: Jam & Record** ([App Store](https://apps.apple.com/us/app/id6742413894), "Version 1.3 Jul 30", developer
  "Fender Digital", read 2026-11-10): "Use the Chord Track to create your own chord progressions, or drag audio to it for
  automatic recognition"; "global transpose and tempo adjustment tools in realtime"; in-app purchase "Complete Fender Amps
  & FX $49.99". Tab output: not described.
- Fender's newsroom pages for Fender Studio and "Fender Songs" answered HTTP 403 to curl on 2026-11-10 and were not read.
  Fender Songs (with Apple Music) and Fender Studio Pro 8 (desktop DAW) appear in search results only: UNVERIFIED.

## TapToTab (research, Ain Shams University)

- "TapToTab : Video-Based Guitar Tabs Generation using AI and Audio Analysis", arXiv 2409.08618, "[Submitted on 13 Sep 2024]"
  ([arXiv](https://arxiv.org/abs/2409.08618), read 2026-11-10). The abstract page shows no code link of its own (only the
  generic "Links to Code" widgets). Method and numbers: see the video-hands-fretboard lane, which owns papers of this kind.

## Open-source camera tutors that map fingertips to string and fret (no transcription)

- **DecoudJuan/Guitar-Learning** (last commit 2026-10-17, `git clone --depth 1` on 2026-11-10): browser app; "Four clicks —
  the two ends of the nut and the two ends of the 12th fret — and a four-point homography turns any pixel into a (string,
  fret) position and back"; "MediaPipe's hand model runs on the GPU in your browser, and every fingertip is projected onto
  the fretboard"; dependency "`@mediapipe/tasks-vision` ^0.10.22"
  ([README](https://raw.githubusercontent.com/DecoudJuan/Guitar-Learning/main/README.md)). License file lines: "MIT License",
  "Copyright (c) 2026 Malena", "Copyright (c) 2026 Juan Decoud"
  ([LICENSE](https://raw.githubusercontent.com/DecoudJuan/Guitar-Learning/main/LICENSE), read 2026-11-10).
- **manbr21/Computer-Vision-Guitar-Tutor ("ChordAR")** (last commit 2026-10-25): "Neck tracking with four ArUco markers at
  the nut and at fret 12"; "Fretting-hand tracking with MediaPipe Hands; each fingertip is labeled with the string and fret
  it is on (e.g. `D2`)"; "Parallax correction"; "Virtual capo: tell the program the fret of a physical capo and the chord
  shape moves up that many frets" ([README](https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/README.md),
  read 2026-11-10). No LICENSE file in the clone (file list read 2026-11-10); the README says of its upstream: "Its README
  states the MIT license but the repository has no `LICENSE` file". No license file found at
  https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/LICENSE on 2026-11-10.

---

## Handoff facts

One fact per line, "X outputs ..., which Y accepts as ...", each half tied to a page read on 2026-11-10. These are
documented capabilities, not tested transfers (testing is the try agent's `trials.md`).

### Tab and notation files between products (and into the web-tab-render lane)

1. Klangio Guitar2Tabs / Transcription Studio output a Guitar Pro file ("For Guitar2Tabs and our Klangio Transcription
   Studio, there is an exclusive download format: a Guitar Pro file", [download formats](https://klang.io/help/download-formats/)),
   which Guitar Pro 8 accepts (import list includes ".gp5", [features](https://www.guitar-pro.com/c/14-guitar-pro-features)),
   which Tabtify opens ("GP3, GP4, GP5, GPX, and GP", [home](https://tabtify.com/)), and which Soundslice imports ("Import
   MusicXML and Guitar Pro files", [plans](https://www.soundslice.com/plans/)); Klangio itself says it "can be opened with
   the Guitar Pro Editor or TuxGuitar".
2. Klangio outputs MusicXML that "is using the nominal tempo that was detected in the audio file"
   ([download formats](https://klang.io/help/download-formats/)), which Guitar Pro 8 imports ("MusicXML",
   [features](https://www.guitar-pro.com/c/14-guitar-pro-features)), Tabtify opens ("MusicXML files including XML and MXL",
   [home](https://tabtify.com/)) and Soundslice imports ([plans](https://www.soundslice.com/plans/)).
3. Klangio outputs two MIDI files: "Unquantized MIDI exports preserve the original transcription and do not include edits
   made in the Sheet Viewer; edits are included only in quantized MIDI exports" ([download formats](https://klang.io/help/download-formats/)),
   which Tabtify accepts as conversion input ("You can also upload MIDI, which already contains note and instrument data",
   [home](https://tabtify.com/); "MIDI imports ... do not count" toward plan limits, [terms](https://tabtify.com/terms)) and
   Guitar Pro 8 imports as "MIDI" ([features](https://www.guitar-pro.com/c/14-guitar-pro-features)).
4. Songsterr outputs downloads "MIDI or Guitar Pro" from the player panel ([help](https://www.songsterr.com/help);
   Plus-only per [Plus](https://www.songsterr.com/plus)), which Guitar Pro 8, Tabtify and Soundslice accept as in lines 1 and 3.
5. Songscription outputs "MIDI, MusicXML, PDF, and Guitar Pro export" ([pricing](https://www.songscription.ai/pricing)),
   which the same importers accept (lines 1 to 3).
6. AnthemScore outputs "musicXML, MIDI, and AnthemScore project (ASDT) formats" ([compare editions](https://lunaverus.com/compareEditions)),
   which Guitar Pro 8, Tabtify and Soundslice accept as MusicXML or MIDI (lines 2 and 3).
7. Tabtify outputs "alphaTex (.alphatex)" ([home](https://tabtify.com/)), which alphaTab reads: "alphaTex is a plain-text
   notation format for alphaTab. You write a score as source code and alphaTab parses it into the same data model any other
   format produces" ([alphaTab docs](https://alphatab.net/docs/alphatex/introduction)).
8. Chord ai outputs ChordPro text ("Export: Text and ChordPro open the share options the same way as the PDF export",
   release notes 6.2.9, [App Store](https://apps.apple.com/us/app/id1446177109)), which ChordSheetJS parses
   (`new ChordSheetJS.ChordProParser()`, [README](https://raw.githubusercontent.com/martijnversluis/ChordSheetJS/master/README.md)).
9. Chordify outputs "the chords ... as MIDI file" and "as a PDF printout" ([App Store](https://apps.apple.com/us/app/id1073624757));
   a MIDI file of chords is accepted by Guitar Pro 8 and Tabtify as MIDI (line 3). The MIDI file's layout (one note per
   chord tone, durations) is not documented on the pages read: UNVERIFIED.
10. Guitar Pro 8 exports and imports "ASCII" tab ([features](https://www.guitar-pro.com/c/14-guitar-pro-features)), the
    plain-text tab format.

### Audio and stems into transcribers (from the source-separation lane and the stem apps)

11. Moises outputs stems ("separate vocals, drums, guitar, bass, piano, strings, and other instruments", [App Store](https://apps.apple.com/us/app/id1515796612));
    an isolated guitar stem is an audio file of the kind Klangio accepts (".wav", ".mp3", ".flac" ...,
    [file limitations](https://klang.io/help/file-limitations/)) and Songsterr accepts ("upload an audio file",
    [help](https://www.songsterr.com/help)). Moises's stem download file format was not read: UNVERIFIED. Guitar2Tabs warns
    that "If you record multiple instruments playing simultaneously you will get bad transcription results"
    ([App Store](https://apps.apple.com/us/app/id1589660528)), so a single-guitar stem is the input it describes.
12. audio2guitar chains separation and transcription itself: "The AI uses source separation (based on the Open-Unmix
    architecture) to isolate the guitar, then detects notes, chords, and fret positions" ([home](https://audio2guitar.com/));
    Open-Unmix is covered by the source-separation lane.
13. Chord ai outputs "Automatic music separation into 4 stems: Bass / Drums / Vocals / Other" and "Export midified audio as
    a midi file" ([App Store](https://apps.apple.com/us/app/id1446177109)).

### User constraints into the tools that accept them

14. Tuning and capo, set before the run: Klangio ("you can choose to add a capo to your transcription and change the
    tuning", [wizard](https://klang.io/help/transcription-wizard/)); Songsterr (per-instrument tuning and "Capo fret", plus
    "First bar time signature", "First bar tempo (BPM)", [new tab page](https://www.songsterr.com/new) and
    [help](https://www.songsterr.com/help)); Tabtify ("String count, tuning, and capo help map notes to your instrument",
    [home](https://tabtify.com/)); AnthemScore ("the number of frets and the string tunings under Tablature options",
    [FAQ](https://lunaverus.com/faq)). Songscription: "At the moment, we only support standard tuning"
    ([home](https://www.songscription.ai/)).
15. A changed setting re-runs the whole transcription in Klangio ("Retranscribe" opens the wizard to "select the mode and
    instruments and to edit the additional information", free for a full transcription, web only,
    [retranscribe](https://klang.io/help/retranscribe/)). Songsterr's documented route is a new AI draft ("using AI
    Transcribe to create a new draft", [help](https://www.songsterr.com/help)).
16. A user's chord edits feed Chord ai's capo search ("Capo: Easiness finds the capo with the easiest shapes, using your
    edited chords", release notes 6.2.8, [App Store](https://apps.apple.com/us/app/id1446177109)).
17. A user's corrected tab plus the clip go to GrabTab's training set only when the user taps "Submit correction"
    ([privacy](https://grabtab.app/privacy/)); this is training data, not a re-run of the analysis.
18. A capo position as a constraint on finger targets: ChordAR "Virtual capo: tell the program the fret of a physical capo
    and the chord shape moves up that many frets" ([README](https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/README.md)).

### Hand landmarks into fretboard coordinates (from the video-hands-fretboard lane)

19. MediaPipe hand landmarks (the `@mediapipe/tasks-vision` hand model) go into a four-point homography from manual clicks
    on "the two ends of the nut and the two ends of the 12th fret", which "turns any pixel into a (string, fret) position and
    back", with the neck tracked between frames "by normalised cross-correlation" and "the homography re-fitted by consensus"
    ([Guitar-Learning README](https://raw.githubusercontent.com/DecoudJuan/Guitar-Learning/main/README.md), MIT).
20. MediaPipe Hands fingertips plus four ArUco markers "at the nut and at fret 12" give each fingertip a string and fret
    label "(e.g. `D2`)", with a parallax shift because "a fingertip is ~1 cm above the board"
    ([ChordAR README](https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/README.md), no LICENSE file).
21. In the two commercial video products, audio and video are fused inside one service and no intermediate format is
    exposed: GrabTab ("Audio gives the notes and timing; the camera reads the fretting hand for the right string and fret",
    [home](https://grabtab.app/)) and AAPA AutoTabs ("Detects hand positions and finger placements on the fretboard",
    [terms](https://aapamusic.com/terms)).

### Playback and sync

22. Soundslice takes an imported Guitar Pro or MusicXML file plus a YouTube video or (Plus) an uploaded MP3 / video and
    syncs them ("Save time with our auto-sync feature", "Attach YouTube videos to your music", [plans](https://www.soundslice.com/plans/)),
    then offers "Loop sections", "Speed training", "Metronome and count-in" ([features](https://www.soundslice.com/features/));
    it embeds as an iframe "with a JavaScript API" ([licensing](https://www.soundslice.com/licensing/)).
23. Songsterr AI tabs play "along with the recording you used: your audio file, or the YouTube video while it is available"
    ([help](https://www.songsterr.com/help)); Klangio's viewer can "switch between the original audio and the audio of the
    transcription" ([transcription viewer](https://klang.io/help/transcription-viewer/)).
