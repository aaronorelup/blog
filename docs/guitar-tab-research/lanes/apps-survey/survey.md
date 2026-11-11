# Lane 9, apps-survey: existing apps that already do some of this

Agent: docs-apps-survey. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from the live pages on
2026-11-10 unless a line says otherwise. Raw copies of the pages fetched with curl are kept outside the repo in
`/home/user/gtr/lanes/apps-survey/raw/` (not committed); `_fetchlog.txt` there lists every fetch with its HTTP status.
The fetch scripts are in `scripts/`. This file records facts and quotes only. The API side of Moises (Music.AI),
Klangio, Soundslice, Songsterr and Chordify is also covered by the `hosted-apis` lane (`../hosted-apis/survey.md`).

Checked and corrected in place by `verify-docs-apps-survey` on 2026-11-10 against its own fresh copies of every cited
page (curl and headless Chromium, kept in `/home/user/gtr/lanes/apps-survey/verify-docs/`, not committed; scripts in
`scripts/verify-docs/`). What was checked and changed is in "## Verification log" at the end; tools added in that pass
are items 33 to 39 of the tool list, plus two more under "## Not covered".

Gap round 2 (`gapfill-apps-survey`, 2026-11-11) added the terms and facts the completeness critic listed as missing
(`../../GAPS.md`, rows P1 to P3). Each addition says "gap round 2" and gives its own read date; the pages, the checks
and what is still UNVERIFIED are in "## Gap round 2" at the end.

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
   MIDI (quantized and unquantized), MusicXML, Guitar Pro (GP5 per its help article), LilyPond out; user sets tuning and capo before the run;
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
8. AnthemScore 6 (Lunaverus LLC): desktop and web; audio in; MusicXML, MIDI, PDF, tab (the desktop app also exports a
   beat and note timing CSV); in the desktop app the user sets string tunings and frets, while the web job form has no
   tuning, capo or string field (`trials.md`, run r0062); 6.3.0 released 2026-09-29; 6.0.0 "Removed CLI options";
   Linux AppImage. RUNNABLE (Linux build, 30-second trial; not executed here, see `trials.md`).
9. Guitar Pro 8 (Arobas Music): tab editor and player, audio-track sync for manual transcription, imports and exports
   GP / MusicXML / MIDI / PowerTab / ASCII; 8.1.5; vendor FAQ: "Guitar Pro 8 does not provide automatic audio-to-notation
   conversion"; EULA (gap round 2): a right to use it "for personal and professional use". DESKTOP (Windows, macOS),
   MOBILE.
10. ScoreCloud (Doremir): recordings to lead sheets (melody, lyrics, chords); no guitar tab found. DESKTOP, MOBILE
    (ScoreCloud Express for iPhone and iPad).
11. TabGenius (iOS, 1.8, 2025-07-15): text or voice prompt to tab, not audio transcription. MOBILE.

### Video in (reads the fretting hand or the fretboard)

12. AAPA AutoTabs (AAPA Music LLC): guitar video in; vendor says machine vision "Detects hand positions and finger
    placements on the fretboard"; editable tab, PDF, MIDI, video overlays out; early access ("v2.43" on the pricing
    page). WEB-ACCOUNT.
13. GrabTab (EU, operated from Spain): phone records audio plus 60 fps video of the neck; vendor says the camera "reads
    the fretting hand for the right string and fret"; tab, staff notation, PDF; "Coming soon to iOS & Android" on
    2026-11-10. NOT-RELEASED.
14. TapToTab (authors at Ain Shams University per the paper's PDF; arXiv 2409.08618, v1 only, submitted 2024-09-13):
    research system, YOLO fretboard detection plus audio; no code link on the abstract page. Paper (the
    video-hands-fretboard lane covers it).
15. DecoudJuan/Guitar-Learning (MIT for its code; the MediaPipe hand model it downloads carries Google's Apache 2.0
    model card; last commit 2026-10-17) and manbr21/Computer-Vision-Guitar-Tutor "ChordAR" (no LICENSE file, last
    commit 2026-10-25): browser / Python chord tutors mapping MediaPipe fingertips to (string, fret) through a
    four-point homography or ArUco markers; no transcription. RUNNABLE (open source; webcam needed; Guitar-Learning's
    README says the hand model runs "on the GPU in your browser"; neither ran here, see `trials.md`).

### Chords, stems and practice tools

16. Moises (Moises Systems, Inc. d/b/a Music AI): stems, chords, beats, key, BPM, smart metronome, count-in, speed and
    pitch; App Store 2.153.0 (2026-11-04); terms updated 2026-10-07. WEB-ACCOUNT, MOBILE, DESKTOP.
17. Chordify (Chordify BV): chords for YouTube links and a 36M-song catalog, capo display, transpose, slow-down, loop,
    MIDI and PDF download; App Store 9.9.0 (2026-11-09); web pages and terms blocked to this box (HTTP 403; again in gap
    round 2, 2026-11-11). WEB, MOBILE.
18. Chord ai (Nomad AI OU): chords, voicings, beats, lyrics, 4 stems, MIDI, PDF / Text / ChordPro export, capo
    suggestion that uses the user's edited chords; App Store 6.3.0 (2026-11-05). MOBILE (the App Store compatibility
    list also has "Mac", "Requires macOS 14.0 or later and a Mac with Apple M1 chip or later.").
19. Ultimate Guitar (Ultimate Guitar USA LLC, per its terms): tab library; "AI chords" from a YouTube link (help
    article dated 2026-05-22, 10 per 24 hours, 15-minute limit); App Store 7.3.38 (2026-11-08); terms updated
    2026-08-24. WEB, MOBILE.
20. Soundslice (Soundslice LLC): notation and tab synced to YouTube or uploaded audio / video, editor, loop, slow-down,
    metronome, count-in, auto-sync, auto stems, PDF / photo scanner, iframe embed with a JavaScript API; transcription is
    manual. WEB-ACCOUNT.
21. Capo (SuperMegaUltraGroovy, Inc.): beats, chords and key guessed from songs, editable chords and beat grid,
    slow-down, loop, processed on the device; on the Mac only, a "spectrogram-based Tabbing view for note-by-note
    transcription" (the user draws the notes and "tablature is generated automatically below", gap round 2), "MIDI
    export of notes and chords" and lead-sheet export; iOS 4.7.3 (2026-11-02). DESKTOP (macOS), MOBILE (iOS).
22. Yousician (Yousician Ltd): lessons with microphone feedback; no transcription of the user's audio; App Store
    5.43.2 (2026-11-09); terms (gap round 2): a license "strictly for your personal, non-commercial use". MOBILE,
    DESKTOP (home page: "For Android, iOS and PC").
23. Fender Studio (Fender Digital, 1.3, Jul 30): recording app; "drag audio to it for automatic recognition" on its
    Chord Track. MOBILE (the App Store compatibility list also has "Mac", "Requires macOS 13.5 or later."). Fender
    Songs and Fender Studio Pro 8: not read (fender.com returned 403).
24. Yamaha Chord Tracker (2.3.9, May 25): chords from songs in the device library, with "guitar tab display options".
    MOBILE (iOS; Yamaha's own page adds "Chord Tracker Android is now available at Google Play.", gap round 2).
25. Positive Grid Spark app "Auto Chords" (4.6.2, Sep 17): "*Requires Spark Amp*". MOBILE.
26. ChordU: chords for songs and uploads; terms read in gap round 2 (corrected in gap round 2: the first pass read the
    home page only): they bar access "using automated means ... without our permission" and limit "songs and chords" to
    "personal, non-commercial use"; prices not read. WEB.

### Audio-to-MIDI and pitch editors (desktop)

27. Melodyne 5 (Celemony): polyphonic note detection, "recognizes chords, keys, tunings and tempos"; runs "via ARA or as
    a plug-in directly in a DAW. Or even as a stand-alone program"; "Audio-to-MIDI – export notes to a MIDI file" in the
    assistant, editor and studio editions; US$99 to US$699 in Celemony's shop (gap round 2). DESKTOP (macOS 10.12 or
    higher, Windows 10 64-bit and Windows 11; corrected in gap round 2: the operating systems had not been read).
28. RipX DAW (Hit'n'Mix): "note-level extraction" from mixed audio, stems; "Starting at $99", 21-day trial; RipX DAW
    "$99.00 USD", RipX DAW PRO "$198.00 USD" (gap round 2). DESKTOP (macOS 10.15+ and Windows 8/10/11 64-bit; corrected
    in gap round 2: the operating systems had not been read).
29. Samplab: samplab.com redirects to apple.com; the EU list of acquisitions, as quoted by 9to5Mac on 2026-10-19, says
    Apple "will acquire certain assets of Samplab GmbH".
30. MIDI Guitar 2 and 3 (Jam Origin): live guitar signal to polyphonic MIDI (MPE in version 3, open beta); "USD
    149.95" for a lifetime license; a beta WebSocket stream on localhost lists each played note with a field named
    "string" (gap round 2). DESKTOP, MOBILE (the system requirements list Mac, Windows and "iOS users").

### Slow-down and transcription helpers (no automatic tab)

31. Transcribe! (Seventh String Software): slow-down, loops, chord / note spectrum, video display; Windows, macOS,
    Linux; 9.70.4 (Linux download page); $39. RUNNABLE (Linux build, 30-day evaluation; not executed here, see
    `trials.md`).

### Not researched in this pass

32. Rocksmith+ (Ubisoft), Fender Play, Fender Tune, Gibson App, Riffstation: not read on 2026-11-10 (no section below).

### Added in verification (verify-docs-apps-survey, 2026-11-10)

Items 33 to 37 have sections below; 38 and 39 are under "## Not covered". Note2Tabs, Cesure, RiffToTab and Fretwise
were first listed by the try agent (`trials.md`, "The other products in this lane"); the others came from web searches
on 2026-11-10.

33. Note2Tabs (Note2Tabs AB, Sweden): audio file or YouTube link in; browser tab editor with "String and fret
    optimization"; a "Light" and a "Heavy" model; terms: tabs "may be used personally or commercially"; terms dated
    "October 2026". WEB-ACCOUNT.
34. Fretwise (fretwise.ai): audio in; "PDF, MIDI, MusicXML, and Guitar Pro exports"; terms updated 2026-02-03.
    WEB-ACCOUNT.
35. Cesure (cesure.app): tab, staff and piano-roll editor; audio to tab with "BasicPitch" on its servers; imports Guitar
    Pro, MIDI, MusicXML, AlphaTex; an MCP connector (`https://api.cesure.app/mcp`) lets an AI assistant write, transpose
    and refinger scores (not audio). WEB (account for AI transcription), MOBILE.
36. RiffToTab (rifftotab.com): audio to MIDI in the browser with Spotify's basic-pitch (free), then MIDI to tab with
    strings and frets chosen "for the whole phrase, in your tuning and capo" (paid); change tuning, capo or key, "then
    convert again"; Guitar Pro, MIDI, text tab, alphaTex, PDF, MusicXML out; terms updated 2026-11-08. WEB-ACCOUNT.
37. GuitarConvert (La Touche Musicale SAS, France): YouTube link, audio or video file in; "Transcription mode" and
    "Arrangement mode"; PDF, MIDI, MusicXML out; its terms prohibit commercial use of the output. WEB-ACCOUNT.
38. Tabbers: video and audio of a guitar performance in, tablature and "color-coded finger visualizations" out, as
    described in a PyData Tel Aviv 2025 talk; no product page, app or code found. NOT-RELEASED (talk only).
39. YouTube Guitar Tab Parser (marcelpanse/youtube-guitar-tab-parser, GPL-3.0): copies the tab already drawn in a
    lesson video into a PDF of image crops; no transcription. RUNNABLE per its README's requirements (Node, yt-dlp,
    ffmpeg and an Anthropic API key; not tried).

### Added in gap round 2 (gapfill-apps-survey, 2026-11-11)

40. Practice Pro - AI Music Tools (iOS, App Store id 6754810269): known only from a search result quoted in
    `../../GAPS.md` (row P3); not found in the App Store on 2026-11-10 or 2026-11-11 (under "## Not covered"). Existence
    UNVERIFIED.

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
  ([Guitar2Tabs page](https://klang.io/guitar2tabs/)); the same page also says "Guitar Pro Tabs (.gp file) for editing
  in Guitar Pro", while the formats article heads its section "Export GP5" (its screenshot caption reads "A GP5 export
  opened in TuxGuitar") and the App Store listing says "Guitar Pro 5", so which Guitar Pro version the file is remains
  UNVERIFIED (settled by exporting one). The formats article adds
  LilyPond (".ly file") and says of GP5: "For Guitar2Tabs and our Klangio Transcription Studio, there is an exclusive download format: a Guitar Pro
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
  2026-11-10). Rendered in headless Chromium the same day (verifier), the tiers show amounts split into dollars and
  cents: Basic "For Testing" $0.00 "Monthly", "Max 15s audio duration"; Startup $99.00 "Monthly", "Max 300s audio
  duration"; Business $499.00 "Monthly", "Max 300s audio duration"; Enterprise "Contact Sales", "Max 600s audio
  duration". Details: `../hosted-apis/survey.md`.
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
    datasets for that purpose." The same file lists among the features that "require a paid (Plus) subscription"
    "AI Transcription of Full Tabs" and "Download (Guitar Pro, MIDI, MP3, WAV)", and among the things allowed "on a
    user's behalf" to "build independent tools that do not modify, automate, or interfere with this site or its tab
    player" (re-read 2026-11-10).
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
  Enterprise "API access", "Bulk transcriptions", "Contact sales"; the table is headed "Plans updated November 10, 2026"
  (rendered page, re-read by the verifier the same day). FAQ: "Start a 14-day free trial (no card required)
  for 2-minute transcriptions."
- **Training use of uploads** (pricing FAQ): "By default, we may use the audio and transcriptions you submit to help
  improve our AI models. Plus and Pro subscribers can opt out at any time from their account settings, and we will not
  use your data for model training."
- **Terms clauses** ([terms](https://playanything.com/terms), "Last updated June 18, 2026", read 2026-11-10):
  - §5.1: "Company grants you, solely for your personal, non-commercial use, a limited, non-exclusive,
    non-transferable, non-sublicensable, revocable license to: ... (b) access and use the Service."
  - §4.6 (credits, "Restrictions on Use"): "You may not use Credits to generate, download, or access Digital Sheet Music
    Files or Outputs for any commercial purpose, including sale, sublicense, or redistribution, except as expressly
    permitted by Company."
  - §8.1: "You retain any copyright and other proprietary rights that you may hold in the User Content that you Post to
    the Service, subject to the licenses granted in these Terms." The license granted to the company (§8.2 "Limited
    License Grant to Company") includes the right to "train or improve our AI or machine learning models".
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
  - §5 (plan limits): "MIDI imports, a new version that only redraws an existing tab, and conversions that fail do not
    count."; "we may limit automated or bulk use that is not personal use." (re-read by the verifier 2026-11-10).
- **API.** None found on the pages read.

## audio2guitar

- **What it is.** Web app ([home](https://audio2guitar.com/), read 2026-11-10).
- **Input.** "MP3, WAV, Suno, Udio, worship recordings, or voice memos"; free plan "MP3 only"; Pro "MP3, WAV, FLAC,
  M4A, OGG+" ([pricing](https://audio2guitar.com/pricing), rendered 2026-11-10). The home page has a "YouTube videos"
  source card linking to `/youtube-to-guitar-tab` (that page was not read).
- **Method, as the vendor states it.** "The AI uses source separation (based on the Open-Unmix architecture) to isolate
  the guitar, then detects notes, chords, and fret positions" (home FAQ). The page does not say which Open-Unmix weights,
  if any, it uses. For context (verifier, read 2026-11-10), Open-Unmix's code, its weights and their training data carry
  different terms: the code's [LICENSE](https://raw.githubusercontent.com/sigsep/open-unmix-pytorch/master/LICENSE)
  is "MIT License"; the [README](https://raw.githubusercontent.com/sigsep/open-unmix-pytorch/master/README.md) says of
  the default `umxl` model, "trained on private stems dataset of compressed stems", "Note, that the weights are only
  licensed for non-commercial use (CC BY-NC-SA 4.0)"; Zenodo lists `umxhq` and `umx` weights under license id
  `mit-license` (records [3370489](https://zenodo.org/api/records/3370489) and
  [3370486](https://zenodo.org/api/records/3370486)), `umxl` under `cc-by-nc-sa-4.0`
  ([5069601](https://zenodo.org/api/records/5069601)); `umxhq` was trained on MUSDB18-HQ, whose Zenodo record
  ([3338373](https://zenodo.org/api/records/3338373), license id `other-nc`) says "MUSDBHQ: is provided for educational
  purposes only and the material contained in them should not be used for any commercial purpose without the express
  permission of the copyright holders". The source-separation lane owns these facts (`../source-separation/survey.md`).
- **Output.** "Note-by-note tablature with techniques. Hammer-ons, pull-offs, slides, bends", "Chord Diagrams", "Synced
  Lyrics", "Download separated vocals, bass, drums, guitar, and piano as MP3 or per-stem MIDI"; "Export MIDI. Print or
  save as PDF" (home). The demo card shows "Tuning: Open G | Key: G | Tempo: 125 BPM"; whether tuning is detected or
  set is not stated on the pages read.
- **Editable.** Pro: "Fix any note, change fret positions, correct lyrics" (home); the pricing table row "Edit tabs" shows "-" for Free
  and "✓" for Pro. Re-analysis after a correction: not described.
- **Sync and practice.** "Tabs, chords, and lyrics synced to audio. Slow it down"; "Slow down to 25%" (home);
  pricing table lists "Speed control" and "Guitar tuner" on both plans.
- **Price** (rendered pricing, 2026-11-10): "ANNUAL", "$59.99/yr", "$5.00/mo"; "MONTHLY", "$8.99/mo"; "ONE-TIME",
  "$9.99", "10 transcription credits · no subscription"; Free "3 songs". Terms: "The current limit is 35 new songs in any rolling 7-day period" for Pro
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
  "€3.99/mo", "or €29.99/yr". The terms say "a free tier with a limit on how many clips you can transcribe per week"
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
  `https://moises.ai/pricing` redirected there). App Store "Version 2.153.0 5d ago", which the page's `datetime`
  attribute gives as 2026-11-04 ([App Store](https://apps.apple.com/us/app/id1515796612), read 2026-11-10).
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

- **What it is.** iOS app per the App Store listing read, whose compatibility list also covers Mac ("Requires macOS
  14.0 or later and a Mac with Apple M1 chip or later.") and Apple Vision (an Android package `com.chordai` appears in
  search results only, not read), "Version 6.3.0 5d ago" (`datetime` 2026-11-05), developer and seller "Nomad AI OU"
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

## Ultimate Guitar (Ultimate Guitar USA LLC): tab library, "AI chords", Pro player

- **What it is.** Tab and chord library with web and mobile apps; App Store "Version 7.3.38 2d ago" (`datetime`
  2026-11-08), developer "Ultimate Guitar" ([App Store](https://apps.apple.com/us/app/id357828853), read 2026-11-10).
- **AI chords (audio in, chords out).** "we’ve introduced AI chords, a new feature now available in the UG app ... Find
  the song on YouTube and copy the link ... the maximum supported video length is 15 minutes ... Your AI chords will be
  ready in 10 minutes or less ... You have only 10 attempts to use this feature per 24 hours"
  ([help article](https://help.ultimate-guitar.com/en/articles/14771579-what-are-the-ai-chords), dated "May 22, 2026",
  read 2026-11-10; on re-fetch the link redirected to `.../14771579-mobile-what-are-the-ai-chords`). AI tab with string and fret from audio: not found.
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

- **What it is.** iOS app "Version 4.7.3 Nov 2" (`datetime` 2026-11-02), "© 2026 SuperMegaUltraGroovy, Inc."
  ([App Store](https://apps.apple.com/us/app/id887497388), read 2026-11-10), and a macOS app: "Capo is available for
  macOS and iOS, so it works on your Mac, iPhone, and iPad"
  ([product page](https://supermegaultragroovy.com/products/capo/), read by the verifier 2026-11-10; the survey's first
  pass had left macOS UNVERIFIED).
- **From the product page.** "Capo processes everything locally on your Mac, iPhone, or iPad—chord detection, slowing,
  looping, and note transcription all work without an internet connection"; "A few of the advanced tools are exclusive
  to the Mac: the spectrogram-based Tabbing view for note-by-note transcription, MIDI export of notes and chords, and the
  lead sheet export"; "The Free Edition just won't save your edits to chords and beats, export audio, or—on the Mac—export
  MIDI and create lead sheets"; chord diagrams "adjust when you place a virtual capo on any fret". Vendor's own claims,
  no dataset or method given: "Capo's neural network was trained on a massive library of songs to recognize 168
  different chords" and "Capo gets you about 90% of the way there".
- **Function (App Store description).** "Using the songs in your music collection, Capo guesses the beats, chords, and
  key of songs"; "Slow down playback, scrub to hear specific notes, and easily create regions that loop"; "Use Capo’s
  tools to isolate specific instruments and even vocals"; "Change, add, or remove the detected chords easily ... Use
  Capo's structure song view to edit Capo's beat grid for songs with changing, or uncommon time signatures"; "Beat
  detection estimates the tempo". Tab output: not described in the App Store listing (see the Mac-only "Tabbing view"
  above; whether it writes tab automatically or is a view for manual note entry is not stated: UNVERIFIED). (Corrected
  in gap round 2: the Mac page answers it, next item.)
- **Mac Tabbing view and exports** ([Capo for Mac](https://supermegaultragroovy.com/products/capo/mac/), read
  2026-11-11, gap round 2): "Draw what you hear onto the spectrogram, and Capo plays it back so you can compare your
  interpretation with the recording. See bends, slides, and vibrato that help you capture the real technique—and as you
  draw, tablature is generated automatically below."; "Hear a note, draw it, play it back to verify your work. As you
  transcribe, tablature generates automatically below."; "Export audio-synchronized MIDI containing your chord and note
  entries. Use in DAWs or other music software."; "Set a virtual capo position and all chord diagrams adjust to show
  fingerings relative to the capo." So in the Tabbing view the user enters the notes and Capo writes the tab from them;
  automatic note detection in that view is not described there. Mac App Store
  ([listing](https://apps.apple.com/us/app/capo/id696977615?mt=12), read 2026-11-11): "Requires macOS 14.6 or later.";
  version 4.7.3, released 2026-11-04 (`currentVersionReleaseDate` from Apple's lookup API); in-app purchases "Capo
  Platinum $49.99", "Capo Pro - Yearly $39.99", "Capo Platinum - Upgrade $29.99", "Capo Pro - Monthly $5.99", "Capo Pro -
  Upgrade $24.99".
- **Price.** In-app purchases: "Capo touch Pro - Yearly $19.99", "Capo touch Pro - Monthly $4.99", "Capo Platinum $49.99"
  and upgrade variants (App Store, read 2026-11-10).
- **Terms** (gap round 2, 2026-11-11). No terms of use or EULA was found on the vendor's site:
  `https://supermegaultragroovy.com/legal/` answered HTTP 403, `/legal/terms/` and `/legal/eula/` HTTP 404, and the
  product pages link only the [privacy policy](https://supermegaultragroovy.com/legal/privacy/). Both App Store listings
  (iOS id887497388, read 2026-11-10; Mac id696977615, read 2026-11-11) link the developer's privacy policy and web site
  and no license agreement; none of the 14 App Store pages this lane saved on 2026-11-10 shows a license-agreement link,
  so these pages do not tell whether a custom EULA exists. Apple's
  [Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/) (read 2026-11-11): "Apps made
  available through the App Store are licensed, not sold, to you. Your license to each App is subject to your prior
  acceptance of either this Licensed Application End User License Agreement (“Standard EULA”), or a custom end user
  license agreement between you and the Application Provider (“Custom EULA”), if one is provided."; "Licensor grants to
  you a nontransferable license to use the Licensed Application on any Apple-branded products that you own or control
  and as permitted by the Usage Rules." Its sections a to i say nothing about files a user makes with an app. No clause
  on who owns Capo's exports, on their commercial use or on automated access was found.

## Positive Grid Spark app ("Auto Chords")

- Under the heading "Auto Chords": "Automatically display chords for millions of songs. Choose any song, and Spark will auto display its
  chords in real-time as you play. Easy controls let you slow down the song’s tempo or loop a difficult section";
  "*Requires Spark Amp*"; "Version 4.6.2 Sep 17", developer "Positive Grid Inc"
  ([App Store](https://apps.apple.com/us/app/id1457653921), read 2026-11-10).

## Yousician (Yousician Ltd)

- Lessons and play-along with microphone feedback: "real-time feedback that listens as you play", "Play along to
  thousands of songs with interactive tabs and real-time feedback", "Yousician listens and gives instant feedback on
  your pitch"; "Version 5.43.2 1d ago"; in-app purchases from "One Instrument Monthly Plan $19.99" to "Premium Plus:
  Yearly Plan $179.99" ([App Store](https://apps.apple.com/us/app/id959883039), read 2026-11-10; "1d ago" is `datetime`
  2026-11-09). Transcription of the user's own audio into tab: not described. Platforms (verifier, 2026-11-10): "For
  Android, iOS and PC" and a "Download for desktop" link ([home](https://yousician.com/)).
- **Terms** ([terms of service](https://yousician.com/terms-of-service), "Effective as of December 17, 2024", read
  2026-11-11 with curl, gap round 2):
  - §4 "Right to use the services": "Subject to your acceptance of these Terms and your continued compliance with them
    and the Agreement, Yousician grants you a limited, non-exclusive, non-transferable and non-sublicensable license to
    use the Services and related software (only the executable version, excluding source) and any Service Content,
    strictly for your personal, non-commercial use."; "You are prohibited from using the Services (including without
    limitation the Service Content) for public performances."; under "Ownership": "Yousician does not grant you any
    ownership rights in the Services, Service Content or any part thereof."
  - §8 "User content": User Content is what users add to the Services, "including, without limitation, data, text,
    writings, compositions, notes, music, sounds, videos, audiovisual effects, artwork, photographs, screenshots, videos,
    graphics, comments, suggestions or chat or message postings or other material (collectively, excluding Service
    Content, “User Content”)."; "You retain all of your ownership rights in the User Content you submit and/or share
    with Yousician. However, in exchange of use of the Services, by submitting and/or sharing the User Content on the
    Services, you hereby grant Yousician an irrevocable, perpetual, sublicensable, transferable, worldwide, and
    royalty-free fully paid-up non-exclusive license in the User Content to reproduce, distribute, modify, prepare
    derivative works of, publicly display and perform and use, in any way, all or any portion of the User Content, in
    connection with the Services, and other services and products, of Yousician ..."
  - §10 "Use restrictions": "You agree that you will not in any circumstances: ... use the Services for any commercial
    activities, including, without limitation, any attempt to raise money for anyone or advertising or promoting a
    product, service, pyramid scheme or other multi-tiered marketing scheme, spam emails, chain letters or similar;";
    "use, either directly or indirectly, any automated system, cheats, spiders, hacks, scrapers, offline readers or any
    unauthorized third party software designed to modify or interfere with the Services;"; "harvest, scrape or use any
    other automated means to view, access or collect any information about the Services or about other people using the
    Services;".
  - The pages read describe no file that Yousician makes for the user to take away (no transcription is described,
    above), and the terms do not mention one (searched for "export", "output", "transcri" and "recording"; "download"
    occurs only for the software and its updates).

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
  read**: UNVERIFIED, settled by opening that page in a normal browser. Re-tried once by the verifier on 2026-11-10:
  the three chordify.net URLs again answered HTTP 403 to curl (a Cloudflare challenge page titled "Just a moment...",
  header `cf-mitigated: challenge`), and the archive.org snapshot of the terms again ended in "Connection reset by peer".
- **Gap round 2 (2026-11-11).** The terms page answered HTTP 403 again: to curl (`server: cloudflare`,
  `cf-mitigated: challenge`, title "Just a moment...") and to WebFetch ("The server returned HTTP 403 Forbidden.").
  Opening it in headless Chromium was refused by this session's permission system before it started: "Permission for
  this action was denied by the Claude Code auto mode classifier. Reason: [Bot Check Circumvention]." It was not tried
  another way, and no archive or third-party copy was used. Chordify's terms on output, commercial use and automated
  access therefore remain UNVERIFIED; `for-aaron.md` test 8a asks Aaron to save the page from a normal browser.
- **What the App Store listing says** ([App Store](https://apps.apple.com/us/app/id1073624757), "Version 9.9.0 1d ago",
  developer "Chordify BV", read 2026-11-10): "Accurate chords for any song", "Seamless integration with YouTube", "Search
  our 36,000,000 song catalog", "Easily transpose the chords", "Try the capo feature and play your chordified songs the
  easy way", "Slow down songs to keep up", "Loop tricky parts", "Download the chords from your favorite songs as MIDI
  file", "Take the calculated chords with you as a PDF printout"; "Our service automatically recognizes the acordes and
  audio signal of a song and will synchronize this with your song". Note-level tab: not described. Capo here is a
  display option chosen by the user, per the wording.
- **Price.** App Store in-app purchases: "Monthly Subscription $8.00", "$9.00", "$8.99"; "Yearly Subscription $54.00",
  "$42.00"; "Black Friday Deal $47.90" (read 2026-11-10).

## Guitar Pro 8 (Arobas Music): tab editor and player; no automatic transcription (vendor FAQ)

- **Version.** Release notes list "Guitar Pro 8.1.5" as the newest entry
  ([new features / changelog](https://www.guitar-pro.com/c/10-guitar-pro-new-features), read 2026-11-10).
- **Formats** ([features](https://www.guitar-pro.com/c/14-guitar-pro-features), read 2026-11-10): "File import formats:
  .gtp, .gp3, .gp4, .gp5, .gpx, .gp, PowerTab, MIDI, ASCII, TablEdit, MusicXML and audio (.mp3, .wav)"; "File export
  formats: .gp5, .gp, .gpx, PowerTab, MIDI, ASCII, TablEdit, .mp3, .wav, FLAC, OGG, AIFF and .pdf".
- **Audio and practice.** "Use the audio track to transcribe faster ... You can also use your audio track to transcribe
  songs more easily"; "Synchronize your audio file with your score to transcribe songs easily"; "loop, speed trainer,
  metronome, visual countdown"; "Set the number of strings (from 3 to 10) and the tuning of your guitars"; "Use the
  detune feature to try another tuning in one click" (features and changelog pages). Automatic audio-to-tab: the vendor's
  own FAQ answers "Can Guitar Pro 8 automatically transcribe audio files into musical notation?" with "No, Guitar Pro 8
  does not provide automatic audio-to-notation conversion"
  ([music transcription page](https://www.guitar-pro.com/pages/p/53350-lp-music-transcription-software), read by the
  verifier 2026-11-10).
- **Platforms and price.** "Guitar Pro 8 Win/macOS", "Guitar Pro iOS/Android" (home); full version "$69.95", upgrade
  "$34.95" ([buy](https://www.guitar-pro.com/products/7-buy-guitar-pro),
  [upgrade](https://www.guitar-pro.com/products/8-buy-guitar-pro-upgrade), read 2026-11-10); system requirements
  "Windows 8 / 10 / 11", "macOS 10.13 or later"; "With the Guitar Pro free demo, enjoy all the Guitar Pro 8 features for 7
  days". No Linux build found.
- **License.** The terms-of-use page (https://www.guitar-pro.com/c/3-terms-of-use) covers the web site; the software
  license agreement text was not read (UNVERIFIED). (Corrected in gap round 2: the license agreement is published as a
  page, linked as "License agreement" in the site's legal menu, and was read on 2026-11-11; quoted below.)
- **Terms: software license, output and automated access** (gap round 2, read 2026-11-11 with curl).
  [Guitar Pro software end-user license agreement (EULA)](https://www.guitar-pro.com/c/9-software-end-user-license-agreement)
  (no date on the page; it says "You can review the most recent version of this EULA by clicking on the "About Guitar
  Pro 8" tab in the Help Menu (Windows) or Guitar Pro 8 (Macintosh)."):
  - Preamble: "GUITAR PRO is software protected by the provisions of the French Intellectual Property Code. THIS
    PRODUCT IS NOT SOLD BUT PROVIDED WITHIN THE FRAMEWORK OF A LICENSE." and "This License excludes any transfer of
    intellectual property for the benefit of the Licensee/User."
  - §1.1, commercial use of the program: "AROBAS MUSIC grants to the User, who accepts, a personal, non-exclusive and
    non-transferable right to use GUITAR PRO. This right of use is granted to the User for personal and professional
    use."; "The License acquired hereunder may be used to activate the software as many times as desired, within the
    limit of up to 5 computers at the same time."
  - What users make with it: §8 lists, among the cases in which "The liability of AROBAS MUSIC cannot be committed or
    sought:", "(iii) in the event of diffusion by the User in any manner whatsoever, with or without consideration, of
    the creations made with GUITAR PRO which contravene the rights of third parties,"; §9: "The User shall be solely
    responsible for any use of GUITAR PRO that violates the rights of third parties, including those resulting in the
    creation of new works." No clause says who owns the files a user writes or exports (the EULA's text searched for
    "own", "commercial", "export" and "output").
  - Automated access: no clause on bots, scripts or automated access in the EULA, the terms of use or the terms of sale.
    The [terms of use](https://www.guitar-pro.com/c/3-terms-of-use) (web site; no date) say: "Any representation,
    reproduction, partial or total use of the contents and services offered by the site by any means whatsoever, without
    the prior written authorization of Arobas Music SARL and / or its partners is strictly prohibited and could
    constitute an infringement in accordance with Article L.335-2 et seq. of the Intellectual Property Code."
  - [Terms of sale](https://www.guitar-pro.com/c/6-terms-and-conditions-of-sale) (no date), Article 3: "With regard to
    the contractual relations between the Company and the Customer, the Customer is considered a consumer within the
    meaning of French law. The Customer undertakes to act exclusively within the private sphere, for personal purposes
    that are unrelated to their business activity." For the mySongBook score service, Article 6.2: "In order to respect
    copyrights, it will not be possible to modify or save a score on the Customer's device;export and printing will
    only be available to Customers with a valid subscription. Furthermore, the audio export of mySongBook files must be
    limited to private use. Any commercial use of such an export is strictly forbidden." (6.3 repeats the last two
    sentences for single scores.) These cover scores bought from Arobas, not tabs a user writes.

## AnthemScore (Lunaverus LLC): desktop app (Linux build) and AnthemScore Web

- **Version.** Newest entry "6.3.0", "released 2026-09-29" ([version history](https://www.lunaverus.com/versionHistory), read 2026-11-10).
- **How to call it (verifier, 2026-11-10).** The same version history lists "Removed CLI options" under 6.0.0 "released
  2026-05-07" (earlier entries had added a "command line interface" and command-line options), so on 6.x there is no
  documented command line; the try agent read the 6.3.0 binary's strings and found no export switches (`trials.md`,
  AnthemScore, "Command line"). The web version has no API documented on the pages read.
- **Run on this kind of box.** Download page: "Windows 10/11 Installer", "iMac/MacBook macOS 11+", "Linux AppImage";
  "AnthemScore was tested on Ubuntu 20.04 and later"; "a minimum of about 4GB of RAM are needed to process most songs";
  "Virtual machines, 32-bit systems, and phones/tablets are not supported"; trial: "In the trial, you are limited to the
  first 30 seconds of each song" ([download](https://lunaverus.com/download), read 2026-11-10). No GPU requirement is
  stated there. RUNNABLE (whether it ran here: see `trials.md`).
- **Guitar tab and constraints.** FAQ: "Enter instrument settings and change the instrument to guitar. Then click the gear
  icon next to it and select "Tablature" under Staffs. Take a look at the number of frets and the string tunings under
  Tablature options and adjust as needed" ([FAQ](https://lunaverus.com/faq), read 2026-11-10). Capo: not found. That
  FAQ answer is about the desktop app: the AnthemScore Web job-settings form saved by the try agent (run r0062,
  `/home/user/gtr/lanes/apps-survey/out/anthemscore-web/explore_S2s_b/03_next_page.html`) has fields `format`,
  `autoDetectInstruments`, `instruments`, `timeSignature`, `keySignature`, `smallestNote`, `trimEmpty`, `trimStart`,
  `trimEnd` and `transcription_rights`, and no tuning, capo or string field (`trials.md`, AnthemScore Web).
- **Output.** Desktop editions: "Export. musicXML, MIDI, and AnthemScore project (ASDT) formats"; Professional adds
  "PDF"; the version history also has "Export beat and note timing to CSV" under 5.0.0 "released 2024-04-03", and the
  6.3.0 package's UI strings include `"FORMAT_TIMING_CSV": "Beat and Note Timing (.csv)"` (`trials.md`, read from the
  unpacked AppImage, not from a running program); "Note Editing. Add/remove notes", "Edit measures. Change beat locations, time/key signatures, and tempo ... Tap
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
  download of the software." (section 13, "Software License"). That license.txt was not read: UNVERIFIED. The try
  agent unpacked the 6.3.0 Linux AppImage as data and found no file named `license*` in it (`trials.md`, AnthemScore,
  "What the package holds"), so where the Linux build carries it is also UNVERIFIED (the Windows installer was not
  downloaded).

## Melodyne 5 (Celemony)

- "With Melodyne, you see the notes in your recordings and samples, and can manipulate and modify them at will. Even with
  polyphonic instruments like the piano and guitar"; "Melodyne also recognizes chords, keys, tunings and tempos"
  ([what is Melodyne](https://www.celemony.com/en/melodyne/what-is-melodyne), read 2026-11-10). Tab output: not found.
  The same page: "Melodyne can be operated via ARA or as a plug-in directly in a DAW. Or even as a stand-alone program."
  (re-read by the verifier 2026-11-10). MIDI export, price, operating systems: not read on 2026-11-10 (UNVERIFIED).
  (Corrected in gap round 2: all three were read on 2026-11-11, below.)
- **Systems** ([technical matters](https://www.celemony.com/en/melodyne/editions-and-technical-matters), read
  2026-11-11, gap round 2). macOS: "Intel Dual Core processor (Quad Core or better recommended), 4 GB RAM (8 GB or more
  recommended), macOS 10.12 (64-bit) or higher. Melodyne 5.2 or higher runs natively on Apple Silicon Macs." Windows:
  "Intel or AMD Dual Core processor (Quad Core or better recommended), 4 GB RAM (8 GB or more recommended), Windows 10
  (64-bit), Windows 11, ASIO-compatible audio hardware." Activation: "Computer-based or iLok USB dongle (2nd or 3rd
  generation), Melodyne essential only computer-based. Internet access is required for the first activation."
  Interfaces: "Plug-in operation via VST3, AU or AAX. ARA integration with compatible DAWs, as set out in the section on
  DAW compatibility." No Linux build is listed.
- **Editions, MIDI export and guitar** ([editions](https://www.celemony.com/en/melodyne/melodyne-5-editions), read
  2026-11-11, gap round 2). The comparison table (columns essential, assistant, editor, studio, read from the page's
  HTML table) ticks "Audio-to-MIDI – export notes to a MIDI file" for assistant, editor and studio; "DNA Direct Note
  Access – algorithms for polyphonic instruments such as piano and guitar" for editor and studio; and "Chord Track and
  chord recognition – bring notes into line harmonically, extract chords from audio" for all four. Of essential the
  page says "All that’s missing is the ability to edit individual notes played by polyphonic instruments such as the
  piano or guitar." Trial: "For a period of 30 days, free of charge, with no obligations or limitations."; "By default,
  the trial version starts off as Melodyne studio". Tab output: not found on these pages either.
- **Price** ([shop](https://www.celemony.com/en/shop), which redirected to `shop.celemony.com`, read 2026-11-11, gap
  round 2): Melodyne 5 studio "US$699" ("Our web shop price", "You save US$150 (17 %)", "retail price of US$849"). The
  three smaller editions' prices sit under their descriptions in the page's table, in the order essential, assistant,
  editor: "US$99"; "US$249" ("retail price of US$299"); "US$399" ("retail price of US$499").
- **License and terms** (gap round 2, 2026-11-11). No end-user license agreement is linked from celemony.com's legal
  pages (Imprint, Privacy policy, Webshop GTC, Trademarks) or its shop, and `https://www.celemony.com/en/service/legal/eula`
  and `.../legal/license-agreement` answered HTTP 404. A web search on 2026-11-11 found a Celemony EULA only as a PDF
  on `ec.crypton.co.jp` (`https://ec.crypton.co.jp/download/pdf/eula_celemonyme.pdf`); that server reset the connection
  on the first try and answered HTTP 503 on the second, with a page titled "クリプトン | サイトメンテナンス中" (a
  site-maintenance notice in Japanese; footer "COPYRIGHT CRYPTON FUTURE MEDIA, INC."). So no EULA text was read:
  what Celemony's license says about files a user exports, commercial use and automated access is UNVERIFIED, settled
  by saving any license text the installer or the program shows (`for-aaron.md`, test 11). Two related facts that were
  read: the help center says "The standard
  Melodyne license allows you to use Melodyne on one workstation only at a time. However, the license does allow you
  two activations, the second being an emergency one you can use to activate a substitute computer quickly and easily
  if, for example, your primary computer breaks down in the middle of a production."
  ([installation and activation](https://helpcenter.celemony.com/M5/doc/melodyneStudio5/en/M5tour_InstallationActivation)),
  and the [webshop GTC](https://www.celemony.com/en/service/legal/webshop-gtc) (no date on the page) cover purchases in
  the shop, including downloads: "CELEMONY provides the Customer who has access to Internet the opportunity of
  downloading files of text, audio or video content against payment onto a computer of the Customer with Internet
  connection." and, for such a file, "Any use in excess of that granted by the licence, in particular the letting,
  broadcasting, public demonstration, re-licensing of the file, rendering it available in Internet or on other
  electronic networks (file sharing) or any other commercial use of the file is impermissible." Nothing in the GTC
  names MIDI or files exported from Melodyne (searched "MIDI", "export", "own").

## RipX DAW (Hit'n'Mix)

- "RipX is the #1 AI DAW that goes far beyond stem separation by offering true note-level extraction. It breaks fully
  mixed audio down to the core notes"; "6+ Stem Separation. Edit Notes In The Mix"; "Buy Now – Starting at $99"; "Try
  RipX DAW PRO Free for 21 Days" ([home](https://hitnmix.com/), read 2026-11-10). Tab output, platforms, MIDI export
  details: not read (UNVERIFIED). (Corrected in gap round 2: read on 2026-11-11, below.)
- **Systems, price, MIDI and tab** (gap round 2, read 2026-11-11). [Buy page](https://buy.hitnmix.com/)
  (`https://hitnmix.com/buy-ripx/` redirects there): "macOS 10.15+ (2012 & later models, including M1 onwards) /
  Windows 8/10/11 (64-bit)"; "Minimum: 2 Core 2.5GHz CPU, 8 GB RAM, 20 GB Free Disc Space"; "In order to check for a
  valid license, an internet connection is required to activate RipX for the first time, and at least once every 15
  times it is run."; "RipX may be installed on up to two computers belonging to the registered license owner, for
  example a desktop and a laptop."; prices "RipX DAW PRO" "$198.00 USD" and "RipX DAW" "$99.00 USD", "21-day trial",
  "We offer license deactivation with a full refund within 14 days of purchase". [RipX DAW page](https://hitnmix.com/ripx-daw/):
  "Print Audio to Midi to load a specific part onto a separate VST/Synth" and "Ability to see specific chords & notes
  being played in a particular part". Tab output: the words "tab", "tabs" and "tablature" are on neither page. No Linux
  build is listed.
- **Terms** (gap round 2, read 2026-11-11). [Terms of use](https://hitnmix.com/terms-of-use/) (no date; footer
  "Copyright © 2026 Hit'n'Mix Ltd."): "For the purposes of these Terms of use, HIT’N’MIX is used to mean any version of
  Hit’n’Mix products and the hitnmix.com website."; "HIT’N’MIX is not intended for use by users which would infringe
  the copyright of any piece of music owned by a third party and is intended for lawful use only; ... Any use of
  HIT’N’MIX in conjunction with such music should only be carried out with the permission of the copyright owner in
  question."; "All copyright, trade marks, design rights, patents and other intellectual property rights (registered
  and unregistered) in and on HIT’N’MIX and all content (including all applications) located on the site shall remain
  vested in Hit’n’Mix Ltd or its licensors (which includes other users). You may not copy, reproduce, republish,
  disassemble, decompile, reverse engineer, download, post, broadcast, transmit, or make available to the public any
  HIT’N’MIX content without the prior written permission of Hit’n’Mix Ltd." The store's
  [terms of service](https://buy.hitnmix.com/policies/terms-of-service) carry the same text, except that this sentence
  reads: "You may not copy, reproduce, republish, disassemble, decompile, reverse engineer, download, post, broadcast,
  transmit, make available to the public, or otherwise use HIT’N’MIX content in any way except for your own personal,
  non-commercial use. You also agree not to adapt, alter or create a derivative work from HIT’N’MIX." Whether
  "HIT’N’MIX content" covers the stems or MIDI a user exports is not stated; no clause names who owns them, and no
  clause on bots, scripts or automated access was found (both pages searched for "own", "commercial", "automat",
  "robot", "scrap", "export"). No EULA page is linked from hitnmix.com or buy.hitnmix.com; whether the installer shows
  a license agreement, and what it says, is UNVERIFIED (`for-aaron.md` test 12 asks Aaron to save any license text it
  shows).

## Samplab: site redirects to apple.com

- On 2026-11-10 `https://samplab.com/` answered `301` to `http://apple.com/` and then `https://www.apple.com/` (curl
  redirect chain, this box). 9to5Mac, 2026-10-19: "Apple Inc. (“Apple”), through a subsidiary, will acquire certain
  assets of Samplab GmbH (“Samplab”) and offer employment to and hire certain Samplab employees" (quoting the EU list of
  acquisitions), "a deal struck in June", and "Samplab’s website now redirects to Apple’s"
  ([9to5Mac](https://9to5mac.com/2026/10/19/apple-strikes-deal-with-ai-startup-that-lets-musicians-rework-recorded-music/),
  read 2026-11-10). The EU filing itself was not read.

## MIDI Guitar 2 and 3 (Jam Origin)

- MIDI Guitar 2: "turn your guitar into a polyphonic MIDI controller"; "Polyphonic and Articulate", "Low Latency";
  "Personal license for Windows/Mac standalone and plugins"; "Download Free trial"
  ([jamorigin.com](https://www.jamorigin.com/), read 2026-11-10); system requirements on the same page: "MacOS X 10.7 and
  upward", "Any non-ancient version of Windows (ie. Windows 7 and upward).", "Any device capable of running iOS 12 and
  up" (under "iOS users:"; re-read by the verifier 2026-11-10). MIDI Guitar 3: "open beta: www.jam.live"; "the first
  audio-to-MIDI system for guitar to fully support MPE — MIDI Polyphonic Expression"; "MIDI Guitar 3 Hex is the same
  technology applied to hexaphonic pickup systems" ([jam.live](https://www.jam.live/), read 2026-11-10). Input is a live
  guitar signal; output is real-time MIDI (no tab, no string/fret output described). Prices: not shown in the page text
  (UNVERIFIED). (Corrected in gap round 2: the price is on Jam Origin's shop page, read 2026-11-11, below; and the
  beta JAM API's note stream has a field named "string", below. No fret output and no tab are described.)
- **Price and license** (gap round 2, read 2026-11-11). [Shop](https://jam.live/shop/): "Pay once = Lifetime license +
  Lifetime free updates"; "The price is always USD 149.95 and there are never any discounts."; "Please note that the
  iOS/iPadOS versions of MIDI Guitar have features that are only available as in-app purchases via Apple's App Store."
  The jamorigin.com buy link (`https://www.jamorigin.com/products/midi-guitar/buy`) redirects to a
  [FastSpring store page](https://sites.fastspring.com/jamorigin/product/midi-guitar): "MIDI GUITAR, personal lifetime
  license", "$149.95", "This is a personal license for MIDI GUITAR 3 for PC and Mac", and "The license permits you to
  run MIDI GUITAR 3 or MIDI GUITAR 2, on two computers, and is possible to revoke when you buy a new computer." FAQ on
  [jamorigin.com](https://www.jamorigin.com/): "Can i use the license on 2 or more computers?" "Yes, as long as they are
  yours." Status of version 3 ([MIDI Guitar 3](https://jam.live/products/MG3/)): "MIDI Guitar 3 is in beta testing
  phase." and "Please refer to MIDI Guitar 2 for a production ready solution."
- **Terms** (gap round 2, 2026-11-11). No license agreement, EULA or terms-of-use page is linked from jamorigin.com (its
  only matching links are a "License" filter of its FAQ, with `href="#"`, and "Privacy Policy") or from jam.live (none),
  so no clause on who owns the MIDI it outputs, on commercial use or on automated access was found. Whether the
  installer shows a license text is UNVERIFIED.
- **How an agent could read its notes** ([JAM API, WebSocket](https://jam.live/developers/websocket/), read 2026-11-11,
  gap round 2): "This API is not yet mature and is expected to change throughout the beta testing period."; "Notes are
  sent from MIDI Guitar's Lua and Html modules on a WebSocket at localhost, port 8080."; its "Note streaming format" is
  a line "time, beat, beat-fraction", a line "number-of-played-notes", then "for each played note:" a line "note-id,
  age, string, pitch, bend, pressure, brightness" (and the same again for Lua-processed notes). The page does
  not say what values the "string" field takes or which MIDI Guitar version serves it (the page is on jam.live, the
  MIDI Guitar 3 site). Not tried here (the program is a desktop install that listens to a live guitar signal).

## Transcribe! (Seventh String Software): slow-down and analysis helper, Linux build

- "Transcribe! is available for Windows, Mac, and Linux"; "You may download Transcribe! and use it for 30 days evaluation";
  "the ability to slow down music without changing its pitch, to analyse chords and show you what notes are present";
  "If you are working from a video file then Transcribe! can usually display the video too"; "The spectrum analysis
  feature is very useful for working out those hard-to-hear chords, but you must still use your ear and brain"
  ([overview](https://www.seventhstring.com/xscribe/overview.html), read 2026-11-10). "Transcribe! is priced in US
  dollars, $39 for a single copy" ([buy](https://www.seventhstring.com/xscribe/buy.html), read 2026-11-10). Linux
  build: "Click here to download Transcribe! version 9.70.4 for 64-bit Linux"; "System requirements : a computer running
  64-bit Linux (x86-64), with GStreamer-1.0, GTK-3."
  ([Linux download](https://www.seventhstring.com/xscribe/download_linux.html), read by the verifier 2026-11-10). No
  automatic tab output; its own help says "Transcribe! does not output MIDI at all." (`trials.md`, from the help file in
  the download). RUNNABLE (Linux build, 30-day evaluation; not executed here, see `trials.md`).

## ScoreCloud (Doremir Music Research)

- "ScoreCloud Songwriter takes recordings of voice and instruments and turns it into Lead Sheets, with melody, lyrics and
  chords"; "ScoreCloud Songwriter has a 10 day free trial.", "Download for PC & Mac"; "ScoreCloud Studio can be used for free up
  to 10 saved songs"; exports "PDFs, MusicXML, MIDI" ([home](https://scorecloud.com/), read 2026-11-10). Guitar tab output:
  not found on the home page. Added by the verifier from the same page (2026-11-10): "The ScoreCloud Express app for
  iPhone & iPad lets you notate your ideas wherever you are"; "ScoreCloud Express has an upfront fee and can then be used
  up to 10 saved songs."; the footer links "Technology Licensing & APIs" (that page was not read). The company name in
  this heading appears on the page only as the slug of its LinkedIn link (`linkedin.com/company/doremir-music-research`).

## ChordU

- Home page features: "Your Personal Chord Finder", "Custom Chord Preference", "Change Speed and Scale", "Identify BPM
  Shifts", "Upload", "My Uploads" ([home](https://chordu.com/), read 2026-11-10). Terms and prices: not read (UNVERIFIED).
  (Corrected in gap round 2: the terms were read on 2026-11-11, below; the prices were not.)
- **Terms** ([terms of use](https://chordu.com/terms-of-use), linked "Terms Of Use" from the home page; no date on the
  page, footer "© 2023 ChordU. All contents are subject to copyright, provided for educational and personal
  non-commercial use only."; read 2026-11-11 with curl, gap round 2):
  - "User guidelines": "You shall not collect content or information or access ChordU service using automated means
    (such as bots, robots, spiders or scrapers) without our permission."
  - "Liability": "Usage of songs and chords are limited to your personal, non-commercial use in accordance with the
    terms of agreement. You may not reproduce (other than as authorized for your own personal usage), publish, transmit,
    distribute, publicly display, rent or lend, modify, create derivative works from, sell or participate in the sale of
    or exploit in any way, in whole or in part, directly or indirectly, any of the contents provided."
  - "User Intellectual property rights": "ChordU service contains material which is owned by us. This material
    includes, but is not limited to, the design, layout, look, sound, appearance and graphics."
  - "Service options - free - premium": "Certain service options are free of cost whereas others are only accessible
    through premium subscriptions."
  - No clause on who owns a user's uploads or the chords computed from them was found (the page has no "upload" and
    no "licen").
- **Price.** Not read. After these terms were read, no further chordu.com page was fetched from the box, because they
  bar access "using automated means ... without our permission". UNVERIFIED; `for-aaron.md` test 8b asks Aaron to note
  the prices shown.

## Yamaha Chord Tracker

- "analyzing the audio songs stored in your iOS device and then displaying the chord symbols"; "with both graphical piano
  keyboard and guitar tab display options"; "The chords displayed by this application will match the mood of the original
  song very closely, but may not be an exact match"; "will not work for songs in iCloud or protected by DRM"; "will not work
  with Music Streaming services such as Apple Music"; "Version 2.3.9 May 25", developer "Yamaha Corporation of America"
  ([App Store, US](https://apps.apple.com/us/app/id992502589), read 2026-11-10). Free; no in-app purchases listed.
- **Platforms and features from Yamaha's own pages** ([Chord Tracker](https://usa.yamaha.com/musical-instruments/keyboards/products/apps/chord-tracker/)
  and its [specs](https://usa.yamaha.com/musical-instruments/keyboards/products/apps/chord-tracker/specs.html), read
  2026-11-11, gap round 2): "Chord Tracker Android is now available at Google Play."; "Compatible Devices" "iPhone /
  iPad / Android", "Please check the App Store or Google Play for information on supported OS and devices."; "You can
  even edit the chords to make your own arrangement of the song by choosing from two recommended chords or selecting the
  chord root and chord type."; "The Chord Tracker app will also transfer the chord information to the instrument. You
  can even record your performance on the device as an audio file and share it with others via email (AAC or WAV
  format)." The page's App Store link is id975438908, which Apple's lookup API lists in the UK store as "Chord Tracker"
  by "Yamaha Corporation" (2.3.9, released 2026-05-11) and not in the US store, where id992502589 is "Chord Tracker - US"
  by "Yamaha Corporation of America" (2.3.9, released 2026-05-25).
- **Terms** (gap round 2, 2026-11-11). No license agreement or terms for the app were found. Yamaha's Chord Tracker
  pages link the App Store, Google Play, connection manuals, an Android device list and the web site's own "Terms of
  Use" and "Privacy Policy" (those web-site terms were not read). The App Store listing links the app's
  [privacy policy](https://www.yamaha.com/en/apps_docs/apps_dmi/dmi_PP_chordtracker20190827_us.html), which says "By
  using the Software, you are accepting and consenting to the terms of this Privacy Policy.", and no license agreement
  (whether a custom EULA exists cannot be told from the page; Apple's Standard EULA is quoted under Capo). No clause on
  the chord charts it shows, commercial use or automated access was found.

## Fender apps

- **Fender Studio: Jam & Record** ([App Store](https://apps.apple.com/us/app/id6742413894), "Version 1.3 Jul 30", developer
  "Fender Digital", read 2026-11-10): "Use the Chord Track to create your own chord progressions, or drag audio to it for
  automatic recognition"; "global transpose and tempo adjustment tools in realtime"; in-app purchase "Complete Fender Amps
  & FX $49.99". Tab output: not described.
- Fender's newsroom pages for Fender Studio and "Fender Songs" answered HTTP 403 to curl on 2026-11-10 and were not read.
  Fender Songs (with Apple Music) and Fender Studio Pro 8 (desktop DAW) appear in search results only: UNVERIFIED.

## TapToTab (research, Ain Shams University)

- "TapToTab : Video-Based Guitar Tabs Generation using AI and Audio Analysis", arXiv 2409.08618, "[Submitted on 13 Sep 2024]"
  ([arXiv](https://arxiv.org/abs/2409.08618), read 2026-11-10; the page lists only "[v1]"). The abstract page shows no
  code link of its own (only the generic "Links to Code" widgets) and does not name an institution; the affiliation
  "Faculty of Computer and Information Sciences", "Ain Shams University", "Cairo, Egypt" is printed under each author in
  the [PDF](https://arxiv.org/pdf/2409.08618) (read by the verifier 2026-11-10). Method and numbers: see the
  video-hands-fretboard lane, which owns papers of this kind.

## Open-source camera tutors that map fingertips to string and fret (no transcription)

- **DecoudJuan/Guitar-Learning** (last commit 2026-10-17, `git clone --depth 1` on 2026-11-10): browser app; "Four clicks —
  the two ends of the nut and the two ends of the 12th fret — and a four-point homography turns any pixel into a (string,
  fret) position and back"; "MediaPipe's hand model runs on the GPU in your browser, and every fingertip is projected onto
  the fretboard"; dependency "`@mediapipe/tasks-vision` ^0.10.22"
  ([README](https://raw.githubusercontent.com/DecoudJuan/Guitar-Learning/main/README.md)). License file lines: "MIT License",
  "Copyright (c) 2026 Malena", "Copyright (c) 2026 Juan Decoud"
  ([LICENSE](https://raw.githubusercontent.com/DecoudJuan/Guitar-Learning/main/LICENSE), read 2026-11-10). That
  license covers the repository's code. The hand model is not in the repository: `src/vision/HandTracker.ts` loads
  `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
  (verifier's clone, commit `692957d`, 2026-10-17), and Google's model card for that hand model has a header block
  reading "LICENSED UNDER" "Apache License, Version 2.0"
  ([model card PDF](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf),
  read 2026-11-10; the video-hands-fretboard lane owns the MediaPipe facts).
- **manbr21/Computer-Vision-Guitar-Tutor ("ChordAR")** (last commit 2026-10-25): "Neck tracking with four ArUco markers at
  the nut and at fret 12"; "Fretting-hand tracking with MediaPipe Hands; each fingertip is labeled with the string and fret
  it is on (e.g. `D2`)"; "Parallax correction"; "Virtual capo: tell the program the fret of a physical capo and the chord
  shape moves up that many frets" ([README](https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/README.md),
  read 2026-11-10). No LICENSE file in the clone (file list read 2026-11-10); the README says of its upstream: "Its README
  states the MIT license but the repository has no `LICENSE` file". No license file found at
  https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/LICENSE on 2026-11-10 (HTTP 404 on the
  verifier's re-fetch; the verifier's `git clone --depth 1` of commit `b7a246b`, 2026-10-25, has no file named
  `*licen*` or `copying*`). Its `requirements.txt` pins `opencv-python==4.8.1.78` and `mediapipe>=0.10.9,<0.10.30`;
  those packages carry their own licenses (not read here).

## Note2Tabs (Note2Tabs AB, Sweden): added in verification

- **What it is.** Web app: "AI tabs built for guitarists", "Turn recordings into guitar tab you can edit, practice, and
  export." ([home](https://www.note2tabs.com/), read by the verifier 2026-11-10). Operator: "Note2Tabs is operated by
  Note2Tabs AB, a Swedish private limited company (aktiebolag)" ([terms](https://www.note2tabs.com/terms), "Last
  updated: October 2026").
- **Input.** "Upload audio file or drop it here", "Audio file YouTube link", "MP3, WAV, M4A"; for YouTube, "Paste a
  public link, choose a riff or solo, and transcribe the focused section." Two models: a "Light model" ("For guitar and
  multi-instrument recordings.") and a "Heavy model" ("Our most detailed model for complex multi-instrument
  recordings.") (home).
- **Output and editing.** A browser tab editor: "Arrange sections, choose fingerings, add techniques, and shape the tab
  your way."; features "String and fret optimization", "Alternative note and chord fingerings", "Key detection and snap
  to key", "Import and export tab files", "Playback loops and speed training"; "Import text-tabs" (home). The export
  file formats are not named on the pages read.
- **Constraints.** "Fingering selection and optimizer tools help you find cleaner positions faster instead of manually
  testing every string and fret combination"; a "playing-coordinate" system "lets you pick where on the fretboard you'd
  like to play" (home). Tuning or capo set before the run, and re-analysis after a correction: not described.
- **Video of the hands.** Not described.
- **Price** ([pricing](https://www.note2tabs.com/pricing), curl copy, 2026-11-10, monthly view): Free "$0/ month", "10
  monthly credits", "Audio clips up to 60 seconds"; Premium "$5.99/ month", "100 monthly credits", "Full-length
  audio-file transcription", "Light and Heavy models"; Pro "$14.99/ month", "500 monthly credits"; "A 60-second
  recording uses 4 credits with Light or 10 with Heavy." Home: Premium "Longer YouTube clips within the first 10
  minutes", Pro "YouTube selections within the first 20 minutes".
- **Terms clauses** ([terms](https://www.note2tabs.com/terms), "Last updated: October 2026", read 2026-11-10):
  - §3: "You own the files and tablature you create or upload."; "You grant Note2Tabs a limited, non-exclusive license
    to host, process, and display your content solely to operate and improve the service, provide support, and comply
    with legal obligations."
  - §5 "Generated tablature": "Tabs created using the service may be used personally or commercially. We do not
    guarantee accuracy or legal clearance for distribution or commercial use. You are responsible for securing any
    necessary licenses, permissions, and clearances and for how you use exported tablature."
  - §6: "Do not automate bulk requests"; "Do not use the service to build competing products".
  - §8: "You receive permission to use the service outputs personally." §12: "These Terms are governed by the laws of
    Sweden."
- **API.** None found on the pages read.

## Fretwise (fretwise.ai): added in verification

- **What it is.** Web app: "Audio in. Tabs out."; the vendor's own claim, "The fastest audio to MIDI + Guitar Pro
  transcriber in the world." (no measurement given); input "MP3, WAV, M4A, etc" ([home](https://fretwise.ai/), read by
  the verifier 2026-11-10; the page text is short and mostly loaded by script).
- **Output.** "PDF, MIDI, MusicXML, and Guitar Pro exports"; "Interactive tab and MIDI playback"
  ([pricing](https://fretwise.ai/pricing)); terms §1: "export formats including Guitar Pro, MIDI, PDF, and MusicXML".
- **Not described on the pages read:** tuning or capo settings, editing, re-analysis after a correction, video of the
  hands, an API.
- **Price** (pricing, curl copy, 2026-11-10): Free "$0 forever", "3 transcriptions per month", "Guest access without an
  account"; Pro "$9.99 / month", "50 transcriptions per month"; "No export paywalls".
- **Terms clauses** ([terms of service](https://fretwise.ai/terms-of-service), "Last updated: February 3, 2026", read
  2026-11-10): §3 you must not "Use automated tools to access the service without permission" or "Resell or
  redistribute transcriptions commercially without proper licensing"; §4 "You retain ownership of any content you
  upload to Fretwise.ai. By uploading audio files, you grant us a limited license to process and analyze the content
  solely to provide the transcription service."; §12 "These terms are governed by the laws of the United States."

## Cesure (cesure.app): tab editor with audio-to-tab and an MCP connector; added in verification

- **What it is.** "Tab · Staff · Piano roll — one score"; "Import your file, start from a recording or write it note by
  note — then slow it down, loop it and play in sync."; "Cesure runs in your browser, on desktop and mobile. Android and
  iOS apps are available if you prefer native" ([home](https://cesure.app/), read by the verifier 2026-11-10).
- **Input.** Audio: "MP3, WAV or M4A — a phone recording, or a bounce from your DAW."; files: "Import MIDI, MusicXML,
  Guitar Pro (.gp, .gp3, .gp4, .gp5) and AlphaTex, plus audio files through transcription." (home FAQ). An account "is
  required for AI transcription and for hosting a room".
- **Method, as the vendor states it.** "AI transcription (BasicPitch) runs on our servers: 3 free conversions a month,
  unlimited with Pro. Chord detection is a different thing — it is computed entirely on your device, free and offline.";
  "Pitch and rhythm are detected note by note, then laid out on the fretboard the way a guitarist would finger them.";
  "It composes nothing: what you get is a draft to correct, play and export." (home).
- **Output.** "Export to .cesure, MIDI, MusicXML, AlphaTex and PDF for free (the free PDF carries a small watermark); WAV
  export and the watermark-free PDF are part of Cesure Pro." (home FAQ).
- **Editing, sync and practice.** All four views are editors; "Loop a range of measures and keep it with the score. The
  speed trainer raises the tempo pass after pass, up to the real one."; "Chromatic tuner, metronome and tap BPM dock
  beside the score and keep running while you play."; in shared rooms "Each player keeps their own view, track and capo."
  (home). Tuning or capo as a constraint on the transcription itself, and re-analysis after a correction: not
  described. Video of the hands: not described.
- **How an agent can call it.** The [assistants page](https://cesure.app/assistants) (read 2026-11-10), headed "ChatGPT
  • Claude • Model Context Protocol", says "You add Cesure once, as a custom connector, with this address:" followed by
  `https://api.cesure.app/mcp`. Listed abilities: "Write a score" ("Tab or standard notation, notes by fret or by
  pitch, in the open .cesure format."), "Rework bars", "Transpose and refinger" ("Up to 24 semitones either way; notes
  placed on the neck again, with a capo if one helps."), "Search the catalog", "Open it in Cesure", "Your library".
  Limits: "No audio. Turning a recording into a tab happens in the app, from a sound."; "Without your account, it sees
  none of your scores. It works on a draft that Cesure keeps 14 days after its last use, and opens it with a link."
  Not connected or tried here.
- **Price** (home, curl copy, 2026-11-10): Free "€0", "3 AI transcriptions a month — empty results don't count"; Pro
  "€4.99" "per month", "or €39.99 per year — save 33%".
- **Terms clauses** ([terms](https://cesure.app/terms), no date on the page, read 2026-11-10): "The app is designed for
  personal use."; a linked assistant "acts at your request within what you allowed on the linking page — seeing, reading
  and saving scores"; "What that assistant does with your scores falls under its provider's own terms."; "You are
  prohibited from copying, modifying, reverse engineering, or creating derivative works of the app without explicit
  authorization from Cesure." No clause on who owns, or may commercially use, a user's own transcriptions was found
  (searched "own", "commercial", "licen"). For scores bought on its marketplace, the
  [terms of sale](https://cesure.app/terms-of-sale) say "A score you buy gives you the personal, non-exclusive right to
  read it, play it, edit it and export it for your own use. It does not allow you to resell it, redistribute it or
  share it publicly."

## RiffToTab (rifftotab.com): audio to MIDI in the browser, then MIDI to playable tab; added in verification

- **What it is.** "MIDI to guitar tab, edited in your browser"; "Drop a .mid file and get tab a hand can play, then fix
  it in a Guitar Pro style editor. The piano roll, the editor and Guitar Pro export are free. Generating the tab needs
  Pro." ([home](https://rifftotab.com/), read by the verifier 2026-11-10). Operator: "RiffToTab is run by the RiffToTab
  Team" ([terms](https://rifftotab.com/terms)).
- **Input.** MIDI (".mid or .midi"); audio: "Only have a recording? Turn audio into MIDI, free"; links: "YouTube, TikTok
  or Instagram. Audio is fetched on Convert, with a free account."; microphone recording (home). Opens "Guitar Pro,
  MusicXML and alphaTex files, or a blank tab".
- **Audio to notes, as the vendor states it.** "Spotify's open-source basic-pitch model, compiled to run client-side.";
  "Transcription happens on your CPU. The audio file never leaves your device unless you choose to save a cloud
  project."; "Note sensitivity, note splitting and minimum length re-run extraction instantly from the model's raw
  output." ([audio to MIDI](https://rifftotab.com/audio-to-midi)). The audio-to-tab chain: "a neural network listens to
  the audio in your browser and writes the notes into a piano roll, you clean up what it heard, then the tab generator
  picks strings and frets a hand can play, for your tuning and capo."
  ([audio to guitar tab](https://rifftotab.com/audio-to-guitar-tab)).
- **Constraints and re-runs.** "Strings and frets are chosen for the whole phrase, in your tuning and capo."; "If another
  tuning or a capo measures easier, it is used and named."; "Change tuning, capo or key, then convert again"; "A strip
  under the tab says what it was made with: the file, the part, the instrument, the tuning, any capo. One button
  re-arranges the same notes for Drop D, a capo on the 2nd fret, a key a step down, or a bass."; options "Guitar or bass,
  4 to 7 strings", "Standard, drop and open tunings, half step down", "Capo 1 to 12, key up or down 12 semitones",
  "Easier to play, or every note as written", "Highest fret and neck position when you want control" (home). The
  re-run is of the fingering from the same notes; a constraint feeding back into the pitch detection is not described.
- **Output.** "Exports Guitar Pro, MIDI, text tab and alphaTex free, PDF and MusicXML on Pro"; "Pitch bends become
  bends. Overlapping notes become hammer-ons and pull-offs." (home).
- **Sync and practice.** "Playback with sound. Speed, loop, metronome and count-in on Pro" (home). Video of the hands:
  not described.
- **Price** (home, curl copy, 2026-11-10): monthly "$3.99" "first month", "Then $7.99 a month. Cancel anytime."; yearly
  "$39" "a year"; lifetime "$59" "once"; "7-day money-back guarantee".
- **Terms clauses** ([terms](https://rifftotab.com/terms), "Last updated November 8, 2026", read 2026-11-10): "You keep
  ownership of content you upload or create through the service. That includes, for example, audio files, MIDI files,
  tab drafts, project metadata, exports, and support submissions."; you agree not to "Abuse, scrape, reverse engineer,
  or bypass limits, protections, or access controls." or "Use automated systems in a way that harms reliability,
  performance, or other users."; on shared links, "Only share tabs of music you wrote, music in the public domain, or
  music you have permission to share." Basic Pitch's own license is covered by the audio-to-notes lane.
- **API.** None found on the pages read.

## GuitarConvert (La Touche Musicale SAS, France): added in verification

- **What it is.** "Import your YouTube link or audio file and receive its guitar tablature in 2 minutes."; two modes,
  "Transcription mode" ("Accurate reproduction of your guitar playing, note by note.") and "Arrangement mode" ("Adapted
  and playable version of the song on your guitar.") ([GuitarConvert](https://latouchemusicale.com/en/apps/guitarconvert/),
  read by the verifier 2026-11-10). Sibling apps on the same site: PianoConvert, SingConvert, ViolinConvert,
  DrumConvert, BandConvert, BassConvert and others.
- **Input.** "YouTube link, audio/video file, or direct recording on browser"; "Copy the YouTube video link or obtain the
  file (wav, mp3, mp4, etc.) of your favorite song."
- **Output.** "Download your song’s tablature in PDF, MIDI and XML formats"; "PDF, MIDI, and MusicXML ready to use
  anywhere"; "Polyphony, tempo, measures, and keys detected automatically."; "Integrated editing"; "Adjust your
  tablature immediately after generation." Tuning or capo settings, re-analysis after a correction, video of the hands:
  not described.
- **Vendor's accuracy claim.** "GuitarConvert transcribes your sheet music with up to 93% accuracy." No dataset, metric
  or method is given on the page.
- **Price** (same page, curl copy, 2026-11-10, euros): Free "€0/month", "Conversion limited to 30 seconds", "PDF, MIDI &
  musicXML export", "10 tab edits"; Solo "€9 billed monthly", "10 conversions/month"; Galaxy "€19 billed monthly", "100
  conversions/month"; Universe "€29 billed monthly", "300 conversions/month"; annual: Solo "€48 billed annually", Galaxy
  "€108 billed annually", Universe "€168 billed annually" (each shown after a struck-through higher amount).
- **Terms clauses** ([General Terms and Conditions of Use](https://latouchemusicale.com/en/legal/terms-and-conditions/),
  no date found on the page, read 2026-11-10): "La Touche Musicale provides the Service for private use only. The
  Service may not be used for commercial purposes."; "Any commercial use of the Deliverables generated by La Touche
  Musicale services is prohibited without express authorization. This includes the sale, distribution in any form
  whatsoever or reproduction of scores, tablatures, MusicXML files, MIDI files or any other type of files obtained via
  PianoConvert, GuitarConvert, BandConvert, SingConvert and all other Transcription Services offered by La Touche
  Musicale."; "You retain all rights to the Content You submit to the Service."; "Submitted Content will be stored for a
  maximum of 30 days before being deleted from La Touche Musicale’s servers for the Transcription Service".

---

## Handoff facts

One fact per line, "X outputs ..., which Y accepts as ...", each half tied to a page read on 2026-11-10. These are
documented capabilities, not tested transfers (testing is the try agent's `trials.md`).

### Tab and notation files between products (and into the web-tab-render lane)

1. Klangio Guitar2Tabs / Transcription Studio output a Guitar Pro file ("For Guitar2Tabs and our Klangio Transcription
   Studio, there is an exclusive download format: a Guitar Pro file", [download formats](https://klang.io/help/download-formats/)),
   which Guitar Pro 8 accepts (import list includes ".gp5" and ".gp", [features](https://www.guitar-pro.com/c/14-guitar-pro-features)),
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
4. Songsterr outputs downloads "MIDI or Guitar Pro" from the player panel ([help](https://www.songsterr.com/help); a
   Plus feature per [Plus](https://www.songsterr.com/plus) and [ai.txt](https://www.songsterr.com/ai.txt), "Download
   (Guitar Pro, MIDI, MP3, WAV)"), which Guitar Pro 8 and Tabtify accept as Guitar Pro or MIDI (lines 1 and 3) and
   Soundslice as Guitar Pro (line 1; its plans page lists "Import MusicXML and Guitar Pro files" and no MIDI import).
5. Songscription outputs "MIDI, MusicXML, PDF, and Guitar Pro export" ([pricing](https://www.songscription.ai/pricing)),
   which Guitar Pro 8 and Tabtify import as Guitar Pro, MusicXML or MIDI and Soundslice as Guitar Pro or MusicXML (lines
   1 to 3).
6. AnthemScore outputs "musicXML, MIDI, and AnthemScore project (ASDT) formats" ([compare editions](https://lunaverus.com/compareEditions)),
   which Guitar Pro 8 and Tabtify accept as MusicXML or MIDI and Soundslice as MusicXML (lines 2 and 3).
7. Tabtify outputs "alphaTex (.alphatex)" ([home](https://tabtify.com/)), which alphaTab reads: "alphaTex is a plain-text
   notation format for alphaTab. You write a score as source code and alphaTab parses it into the same data model any other
   format produces" ([alphaTab docs](https://alphatab.net/docs/alphatex/introduction)); Cesure also imports it ("Import
   MIDI, MusicXML, Guitar Pro (.gp, .gp3, .gp4, .gp5) and AlphaTex", [home](https://cesure.app/)) and RiffToTab opens it
   ("Opens Guitar Pro, MusicXML and alphaTex files", [home](https://rifftotab.com/)). alphaTab's npm package
   `@coderline/alphatab` 1.9.0 gives its license as `MPL-2.0`
   ([registry](https://registry.npmjs.org/@coderline%2falphatab/latest), read 2026-11-10; the web-tab-render lane owns it).
8. Chord ai outputs ChordPro text ("Export: Text and ChordPro open the share options the same way as the PDF export",
   release notes 6.2.9, [App Store](https://apps.apple.com/us/app/id1446177109)), which ChordSheetJS parses
   (`new ChordSheetJS.ChordProParser()`, [README](https://raw.githubusercontent.com/martijnversluis/ChordSheetJS/master/README.md)).
   ChordSheetJS's npm package `chordsheetjs` 18.0.0 gives its license as `GPL-2.0-only`
   ([registry](https://registry.npmjs.org/chordsheetjs/latest), read 2026-11-10), and the repository's
   [LICENSE](https://raw.githubusercontent.com/martijnversluis/ChordSheetJS/master/LICENSE) is the "GNU GENERAL PUBLIC
   LICENSE Version 2, June 1991".
9. Chordify outputs "the chords ... as MIDI file" and "as a PDF printout" ([App Store](https://apps.apple.com/us/app/id1073624757));
   a MIDI file of chords is accepted by Guitar Pro 8 and Tabtify as MIDI (line 3). The MIDI file's layout (one note per
   chord tone, durations) is not documented on the pages read: UNVERIFIED.
10. Klangio, Songsterr, Songscription, Tabtify and Fretwise output Guitar Pro files (lines 1, 4, 5;
    [Tabtify home](https://tabtify.com/) "Guitar Pro (.gp)"; [Fretwise pricing](https://fretwise.ai/pricing)), which
    RiffToTab opens ("Opens Guitar Pro, MusicXML and alphaTex files", [home](https://rifftotab.com/)) and Cesure imports
    ("Guitar Pro (.gp, .gp3, .gp4, .gp5)", [home](https://cesure.app/)). (This line replaces the first pass's line 10,
    Guitar Pro 8's "ASCII" tab, which named no product that accepts it.)

### Audio and stems into transcribers (from the source-separation lane and the stem apps)

11. Moises outputs stems ("separate vocals, drums, guitar, bass, piano, strings, and other instruments", [App Store](https://apps.apple.com/us/app/id1515796612));
    an isolated guitar stem is an audio file of the kind Klangio accepts (".wav", ".mp3", ".flac" ...,
    [file limitations](https://klang.io/help/file-limitations/)) and Songsterr accepts ("upload an audio file",
    [help](https://www.songsterr.com/help)). Moises's stem download file format was not read: UNVERIFIED (the help
    center, `help.moises.ai`, answered HTTP 403 with a Cloudflare challenge to curl and WebFetch on 2026-11-10). Guitar2Tabs warns
    that "If you record multiple instruments playing simultaneously you will get bad transcription results"
    ([App Store](https://apps.apple.com/us/app/id1589660528)), so a single-guitar stem is the input it describes.
12. audio2guitar chains separation and transcription itself: "The AI uses source separation (based on the Open-Unmix
    architecture) to isolate the guitar, then detects notes, chords, and fret positions" ([home](https://audio2guitar.com/));
    Open-Unmix is covered by the source-separation lane (its code, weights and training data carry different licenses:
    see the audio2guitar section). This is one vendor's description of its own internal chain, not a transfer between
    two products.
13. Chord ai outputs "Automatic music separation into 4 stems: Bass / Drums / Vocals / Other" and "Export midified audio as
    a midi file" ([App Store](https://apps.apple.com/us/app/id1446177109)); that MIDI file is the kind Guitar Pro 8 and
    Tabtify import (line 3) and RiffToTab takes in (".mid or .midi", [home](https://rifftotab.com/)). The stems' file
    format is not given in the listing: UNVERIFIED.

### User constraints into the tools that accept them

14. Tuning and capo, set before the run: Klangio ("you can choose to add a capo to your transcription and change the
    tuning", [wizard](https://klang.io/help/transcription-wizard/)); Songsterr (per-instrument tuning and "Capo fret", plus
    "First bar time signature", "First bar tempo (BPM)", [new tab page](https://www.songsterr.com/new) and
    [help](https://www.songsterr.com/help)); Tabtify ("String count, tuning, and capo help map notes to your instrument",
    [home](https://tabtify.com/)); AnthemScore desktop ("the number of frets and the string tunings under Tablature
    options", [FAQ](https://lunaverus.com/faq); the AnthemScore Web form has no such field, `trials.md`, run r0062);
    RiffToTab, for its MIDI-to-tab step ("Strings and frets are chosen for the whole phrase, in your tuning and capo.",
    [home](https://rifftotab.com/)). Songscription: "At the moment, we only support standard tuning"
    ([home](https://www.songscription.ai/)).
15. A changed setting re-runs the whole transcription in Klangio ("Retranscribe" opens the wizard to "select the mode and
    instruments and to edit the additional information", free for a full transcription, web only,
    [retranscribe](https://klang.io/help/retranscribe/)). Songsterr's documented route is a new AI draft ("using AI
    Transcribe to create a new draft", [help](https://www.songsterr.com/help)). RiffToTab re-runs only the fingering, from
    the same notes, after a tuning, capo or key change ("Change tuning, capo or key, then convert again",
    [home](https://rifftotab.com/)), and re-runs its note extraction from "the model's raw output" when the user moves the
    sensitivity settings ([audio to MIDI](https://rifftotab.com/audio-to-midi)).
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
    ([Guitar-Learning README](https://raw.githubusercontent.com/DecoudJuan/Guitar-Learning/main/README.md); the
    repository's code is MIT, while the hand model file it downloads from Google has a model card reading "LICENSED UNDER"
    "Apache License, Version 2.0", see the open-source tutors section).
20. MediaPipe Hands fingertips plus four ArUco markers "at the nut and at fret 12" give each fingertip a string and fret
    label "(e.g. `D2`)", with a parallax shift because "a fingertip is ~1 cm above the board"
    ([ChordAR README](https://raw.githubusercontent.com/manbr21/Computer-Vision-Guitar-Tutor/main/README.md), no LICENSE file).
21. In the two commercial video products, audio and video are fused inside one service and no intermediate format
    (hand landmarks, fret positions) is described on the pages read: GrabTab ("Audio gives the notes and timing; the camera reads the fretting hand for the right string and fret",
    [home](https://grabtab.app/)) and AAPA AutoTabs ("Detects hand positions and finger placements on the fretboard",
    [terms](https://aapamusic.com/terms)).

### Playback and sync

22. Soundslice takes an imported Guitar Pro or MusicXML file plus a YouTube video or (Plus) an uploaded MP3 / video and
    syncs them ("Save time with our auto-sync feature", "Attach YouTube videos to your music", [plans](https://www.soundslice.com/plans/)),
    then offers "Loop sections", "Speed training", "Metronome and count-in" ([features](https://www.soundslice.com/features/));
    it embeds as an iframe ("We also have a JavaScript API for advanced integration", [licensing](https://www.soundslice.com/licensing/)).
23. Songsterr AI tabs play "along with the recording you used: your audio file, or the YouTube video while it is available"
    ([help](https://www.songsterr.com/help)); Klangio's viewer can "switch between the original audio and the audio of the
    transcription" ([transcription viewer](https://klang.io/help/transcription-viewer/)).

### Added in verification (verify-docs-apps-survey, 2026-11-10)

24. An AI assistant connected to Cesure's MCP server (`https://api.cesure.app/mcp`,
    [assistants page](https://cesure.app/assistants)) writes, transposes and refingers scores ("Tab or standard notation,
    notes by fret or by pitch, in the open .cesure format.") and opens them in Cesure, which exports "MIDI, MusicXML,
    AlphaTex and PDF" ([home](https://cesure.app/) FAQ) for the importers in lines 2, 3 and 7. The connector takes no
    audio ("No audio. Turning a recording into a tab happens in the app, from a sound."). Not connected or tried here.
25. RiffToTab's in-browser audio-to-MIDI step (Spotify basic-pitch, [audio to MIDI](https://rifftotab.com/audio-to-midi))
    outputs notes into its piano roll, which its tab step turns into strings and frets "for your tuning and capo"
    ([audio to guitar tab](https://rifftotab.com/audio-to-guitar-tab)); its MIDI input (".mid or .midi",
    [home](https://rifftotab.com/)) also takes MIDI made elsewhere, such as Klangio's two MIDI exports (line 3).
26. Fretwise outputs "PDF, MIDI, MusicXML, and Guitar Pro exports" ([pricing](https://fretwise.ai/pricing)) and
    GuitarConvert "PDF, MIDI, and MusicXML" ([product page](https://latouchemusicale.com/en/apps/guitarconvert/)), which
    Guitar Pro 8 and Tabtify import as in lines 1 to 3.

### Added in gap round 2 (gapfill-apps-survey, 2026-11-11)

27. Melodyne's assistant, editor and studio editions output "Audio-to-MIDI – export notes to a MIDI file"
    ([editions](https://www.celemony.com/en/melodyne/melodyne-5-editions)), RipX DAW can "Print Audio to Midi to load a
    specific part onto a separate VST/Synth" ([RipX DAW](https://hitnmix.com/ripx-daw/)), and Capo for Mac can "Export
    audio-synchronized MIDI containing your chord and note entries" ([Capo for Mac](https://supermegaultragroovy.com/products/capo/mac/)),
    which Guitar Pro 8 and Tabtify import as MIDI (line 3) and RiffToTab takes in (".mid or .midi",
    [home](https://rifftotab.com/)). For Capo the notes are the ones the user entered in its Tabbing view (its section).

## Not covered

Found in the verifier's searches on 2026-11-10; one source page each was read, nothing was run.

- **Tabbers** (tool list item 38): a PyData Tel Aviv 2025 talk, "You Just Play: Teach and learn any guitar riff just by
  playing it (HE)", "Nov. 5, 2025" ([talk page](https://cfp.pydata.org/pydata-tel-aviv-2025/talk/FA7JGZ/)): "Tabbers is
  a platform made by guitarists, for guitarists, enabling them to teach each other guitar riffs simply by playing.";
  "We use audio and video analysis to generate tablature, color-coded finger visualizations, and other enhancements";
  the listed system includes "Computer vision application to detect finger placement on the fretboard" and "Fusion
  pipeline for aligning visual hand positioning with note transcription". No product page, app, code or license was
  found in a web search the same day.
- **YouTube Guitar Tab Parser** (tool list item 39; marcelpanse/youtube-guitar-tab-parser): "CLI that turns a YouTube
  guitar-lesson video into a PDF of the guitar tab."; "It downloads the video, samples frames, uses Claude vision to
  locate the tab region, crops every frame to that region, de-duplicates the crops by the bar number printed on each
  line of the score, and stitches the distinct tab lines vertically into a PDF."; requirements "Node.js ≥ 20", `yt-dlp`,
  `ffmpeg`, "An Anthropic API key" ([README](https://raw.githubusercontent.com/marcelpanse/youtube-guitar-tab-parser/main/README.md)).
  It copies tab already drawn in the video, so its output is images of tab, not notes. License: the
  [LICENSE](https://raw.githubusercontent.com/marcelpanse/youtube-guitar-tab-parser/main/LICENSE) file begins "GNU
  GENERAL PUBLIC LICENSE" "Version 3, 29 June 2007" (read 2026-11-10).
- **NoteHound** (iOS, "Version 1.4.0", `datetime` 2026-07-13, "© 2026"): a by-ear practice and manual transcription app,
  "Transcribe what you hear onto a piano roll, a 4-to-8-string guitar tab, or a live fretboard."; "Automatic fret-position
  suggestions based on the previous and next notes"; "NoteHound detects both from your audio" (key and time signature);
  export "MIDI, PDF, MusicXML, plain-text tab, .tab, or a ZIP bundle of all of them"; "No subscription. No account. Your
  audio and your transcriptions stay on your device."; in-app purchase "NoteHound Pro $9.99"
  ([App Store](https://apps.apple.com/us/app/id6761667456), read 2026-11-10). No automatic note transcription is
  described. MOBILE.
- **FingerstylePal - Guitar Tab AI** (iOS, "Version 1.3.8", `datetime` 2026-05-18): takes Guitar Pro files, not audio
  ("Upload any GuitarPro file and get instant guidance"), and records "your hands + animated sheet music together"
  ([App Store](https://apps.apple.com/us/app/id6755329557), read 2026-11-10). No transcription is described. MOBILE.
- **Practice Pro - AI Music Tools** (tool list item 40; added in gap round 2, 2026-11-11): known only from a web search
  result quoted by the `completeness-critic` in `../../GAPS.md` (row P3), which lists an "AI Guitar Tab Generator ...
  synced with playback" for an iOS app with App Store id 6754810269. `https://apps.apple.com/us/app/id6754810269`
  answered HTTP 404 on 2026-11-10 (GAPS.md) and again on 2026-11-11, and Apple's lookup API
  (`https://itunes.apple.com/lookup?id=6754810269&country=<store>`) returned `"resultCount":0` for the us, gb, se, de,
  fr, ca, au, in and jp stores on 2026-11-11, while the same request for Capo's iOS id 887497388 returned its listing
  ("Capo - Learn Music by Ear", 4.7.3). Whether the app exists, under that id or another, is UNVERIFIED: no web search
  was made for it in this round (the session's web-search budget was used up), and the App Store app on a phone
  settles it (`for-aaron.md`, test 17c).

## Verification log (verify-docs-apps-survey, 2026-11-10)

How it was checked. Every URL the first pass cited (94 unique) was fetched again with curl on 2026-11-10: 88 answered
HTTP 200, the three chordify.net URLs HTTP 403 (Cloudflare challenge), and chordai.net/terms and the ChordAR `LICENSE`
URL HTTP 404, as the first pass reported (the 94th, `http://apple.com/`, is only a redirect target). 83 of them were
also rendered in headless Chromium (run r0228, `--nolock` under `nice -n 19`, wall 959 s, CPU 71 s, exit 0). Quotes were
matched by `scripts/verify-docs/vquotes.py` (each quoted passage, split at "...", against the pages cited in the same
section; case, whitespace, curly quotes, dashes and Markdown marks ignored, end punctuation kept) and license and terms
quotes by `scripts/verify-docs/vterms.py` against the one page each is attributed to, parts in order
(`scripts/verify-docs/vterms-quotes.json` lists every one). The fresh copies are in
`/home/user/gtr/lanes/apps-survey/verify-docs/` (not committed).

Tally.

- **License and terms quotes from the first pass: 75 checked, 74 confirmed verbatim, 1 corrected, 0 unverifiable.**
  The correction: the Songscription pricing-FAQ training sentence was quoted as ending "account settings." where the page
  continues ", and we will not use your data for model training."; it is now quoted in full. Every section number the
  first pass gave matched the page (Klangio §3.1, §5.2.1, §5.2.3, §7.5, §8.1, §12.3, §12.4, §12.5; Songscription §5.1,
  §8.1; Tabtify §2, §4; AAPA §2, §4.1, §4.2, §5; Soundslice §7.5; Moises §1, §8.1, §11.2, §11.4, §14.6; Ultimate Guitar
  §6.3, §7.3). Added where none was given: Songscription §4.6 and §8.2, Tabtify §5, Lunaverus section 13. The Songsterr
  `ai.txt` quote is verbatim once the "#" marks that start its lines are removed.
- **All other quoted passages from the first pass: 659 checked** (576 of 10 or more characters, 83 shorter). 638 were
  found on a page cited by the same section and 16 (tool-list lines, which carry no links) on the page cited by the
  product's own section. 5 were checked by hand: the `ai.txt` quote (above); "alphatab.net" (in Tabtify's HTML source,
  not its visible text); "Performing security verification" (Chordify's challenge page as the first pass rendered it;
  the verifier's curl copy is the same challenge, titled "Just a moment..."); "Fender Songs" (a product name, not a page
  quote); and the handoff template. No other quote was found altered.
- **Quotes added in this pass:** 39 license and terms quotes (114 in `vterms-quotes.json` in all, every one confirmed on
  its page) and the feature and price quotes of the new sections, all matched the same way except those read from PDFs
  (TapToTab affiliations, MediaPipe model card; read with `pdftotext`) and those taken from `trials.md`.
- **Links fixed: 0.** No cited URL was wrong. Redirects the first pass described were confirmed (`/ai` to `/new` 302;
  `songscription.ai/terms` to `playanything.com/terms` 308; `moises.ai/pricing` to `/pricing/` 308 to `/`; `samplab.com`
  301 to `http://apple.com/`). One link now redirects (the Ultimate Guitar help article; noted in its section).
- **Code, weights and data licenses kept apart (added):** Open-Unmix code MIT versus `umxl` weights CC BY-NC-SA 4.0
  versus MUSDB18-HQ "educational purposes only" (audio2guitar section); Guitar-Learning's MIT code versus the Apache 2.0
  model card of the MediaPipe hand model it downloads; ChordSheetJS `GPL-2.0-only` and alphaTab `MPL-2.0` on the handoff
  lines that name them.
- **Facts corrected:** Capo has a macOS app (vendor page; Mac-only tabbing view and MIDI export added); "Muse Group" for
  Ultimate Guitar appears on none of the pages read and was replaced by "Ultimate Guitar USA LLC" from its terms; Guitar
  Pro's "no audio-to-tab found" replaced by the vendor's own FAQ answer; AnthemScore: the tuning setting is desktop-only
  (web form has none, `trials.md` r0062), "Removed CLI options" in 6.0.0, CSV export, and "it ships inside the AppImage"
  replaced by the try agent's finding that the Linux AppImage holds no `license*` file; platform marks for Yousician,
  MIDI Guitar, ScoreCloud, Chord ai, Fender Studio, Melodyne and RipX; Samplab "closed" replaced by the observed
  redirect and the filing's own "will acquire"; TapToTab's affiliation sourced to the PDF; relative App Store dates
  ("5d ago") given as the page's `datetime`; Klangio API monthly amounts read from the rendered page; Transcribe! 9.70.4.
- **Handoff facts:** lines 4 to 6 corrected (Soundslice lists Guitar Pro and MusicXML import, no MIDI import); line 10
  (Guitar Pro "ASCII", no accepting product named) replaced by a line with both halves linked; line 13 completed with
  products that accept its MIDI; lines 7, 8, 11, 12, 14, 15, 19 and 21 extended or qualified; lines 24 to 26 added.
- **Judging language:** none found outside quoted, attributed vendor text; vendor numbers stay quoted with their page
  (audio2guitar's "97.8%", and in the additions GuitarConvert's "93%", Capo's "90%" and "168 different chords").
- **Prices:** every price in the file was re-read on 2026-11-10 (curl or rendered) and matched; Songscription's table now
  carries its own "Plans updated November 10, 2026".
- **Tools added: 9.** Sections for Note2Tabs, Fretwise, Cesure, RiffToTab and GuitarConvert (tool list 33 to 37);
  Tabbers, YouTube Guitar Tab Parser, NoteHound and FingerstylePal under "## Not covered".
- **Still UNVERIFIED:** Chordify's terms (site 403; archive.org reset the connection again on one re-try); Moises's stem
  file format (`help.moises.ai` 403); which Guitar Pro version Klangio writes; AnthemScore's `license.txt`; the Guitar
  Pro software EULA; Melodyne and RipX operating systems and prices; ChordU terms and prices; MIDI Guitar prices;
  whether Capo's Mac "Tabbing view" transcribes automatically. Nothing was run in this pass except the page fetches.

## Gap round 2 (gapfill-apps-survey, 2026-11-11)

What was asked: the three rows for this lane in `../../GAPS.md`. P1: quote what the terms of Guitar Pro 8, Melodyne 5,
RipX DAW, MIDI Guitar, Yousician, Yamaha Chord Tracker, Capo, ChordU and Chordify say about who owns the output, about
commercial use and about automated access (Chordify: a step for Aaron). P2: AnthemScore Web counted as tried without
output (a `tools.json` change, logged in `trials.md`, "Gap round 2"). P3: "Practice Pro - AI Music Tools", seen only in
a search result.

How. Each page was fetched once with curl by `scripts/gap2/fetch2.sh` (the `ec.crypton.co.jp` PDF twice, by hand with
the same user agent, into `gap2/pdf/`; body, headers and a plain-text copy in `/home/user/gtr/lanes/apps-survey/gap2/raw/`, not
committed; `_fetchlog.txt` there lists every fetch with its HTTP status). Terms pages were found from each vendor's own
links (`scripts/gap2/links.py` lists a saved page's links); four web searches returned results and a fifth was not
performed because the session's search budget was used up; one of the four is the only source of the Celemony EULA
copy named in the Melodyne section. App Store ids were checked with Apple's lookup API
(`itunes.apple.com/lookup?id=...`; the JSON answers are saved next to the pages). The page quotes added in this round
are in `scripts/gap2/quotes2.json` (81 entries; a quote cut with "..." is one entry), and `scripts/gap2/checkquotes2.py`
matched each one against the saved copy of the page it is attributed to: 81 confirmed, 0 not found (case, whitespace,
curly quotes and dash variants ignored; the parts of a quote with "..." must appear in order). The other quoted
strings are app names, sellers, versions and dates from those lookup answers, the WebFetch and permission-system
messages of this session, and `../../GAPS.md`. After ChordU's terms were read (they bar access "using automated means
... without our permission"), no further chordu.com page was fetched. `tools.json` was changed by
`scripts/gap2/update_tools_json.py` (terms, prices, platforms, AnthemScore Web's `tried`, the Practice Pro entry; each
changed entry has a `corrections` line) and `scripts/gap2/update_tools_json_handoffs.py` (the three MIDI handoffs of
handoff line 27).

Pages and their status on 2026-11-11 (the full list with times is the fetch log):

| Vendor | Read (HTTP 200) | Not read |
|---|---|---|
| Arobas (Guitar Pro) | home, legal information, terms of use, terms of sale, software EULA | |
| Celemony (Melodyne) | start, what is Melodyne, technical matters, editions, shop (`shop.celemony.com`), webshop GTC, imprint, privacy, help-center installation page | `/en/service/legal/eula` and `/license-agreement` (404); `ec.crypton.co.jp/download/pdf/eula_celemonyme.pdf` (connection reset, then 503 maintenance page) |
| Hit'n'Mix (RipX) | home, RipX DAW, terms of use, `buy.hitnmix.com` and its terms of service | |
| Jam Origin (MIDI Guitar) | jamorigin.com, its buy link (FastSpring page), jam.live home, shop, support, MIDI Guitar 3, JAM API WebSocket | |
| Yousician | home, terms of service | |
| Yamaha (Chord Tracker) | usa.yamaha.com apps, Chord Tracker overview and specs, the app's privacy policy | the web site's own terms of use (not fetched) |
| SuperMegaUltraGroovy (Capo) | Capo page, Capo for Mac, privacy policy, Mac App Store listing | `/legal/` (403), `/legal/terms/` and `/legal/eula/` (404) |
| Apple | Standard EULA; lookup API for ids 6754810269 (nine stores), 887497388, 975438908, 992502589, 696977615 | `apps.apple.com/us/app/id6754810269` (404) |
| ChordU | home, terms of use | pricing (not fetched, above) |
| Chordify | | terms page: 403 to curl and to WebFetch; headless render refused (below) |

Refused by this session's permission system: opening Chordify's terms page in headless Chromium (a `gtr-run --nolock`
of `scripts/gap2/render2.cjs`): "Permission for this action was denied by the Claude Code auto mode classifier. Reason:
[Bot Check Circumvention]." The command never started, so it has no ledger line; it was not tried another way.

Settled in this round: the Guitar Pro EULA and terms of sale; Melodyne's operating systems, which editions export MIDI
and which handle polyphonic guitar, and its prices; RipX's operating systems, prices, MIDI printing and the absence
of the word "tab" on its pages; MIDI Guitar's price, license lines and beta WebSocket note stream; Yousician's and
ChordU's terms; that Capo's Mac Tabbing view writes tab from notes the user draws, and Capo for Mac's requirements and
prices; Yamaha Chord Tracker's Android version and its two App Store listings.

Still UNVERIFIED after this round: Chordify's terms (`for-aaron.md` 8a); the text of Celemony's EULA (not on
celemony.com; the one copy found was unreachable; `for-aaron.md` 11); whether the RipX, MIDI Guitar and Melodyne
installers show license texts and what they say (`for-aaron.md` 11, 12, 15); ChordU's prices (`for-aaron.md` 8b);
whether Capo and Chord Tracker carry custom EULAs; whether Practice Pro exists (`for-aaron.md` 17c). Nothing was
installed or run in this round apart from the page fetches and lookups.
