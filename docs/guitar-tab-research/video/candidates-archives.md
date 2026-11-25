# Song candidates from open archives and open-licensed video (scout `song-scout-archives`)

Stage-1 scout, 2026-11-25 (about 00:00 to 01:20 UTC). Lane: Wikimedia Commons, archive.org, Vimeo, PeerTube and other
open video hosts, Creative Commons uploads, and free public-domain tab editions (Mutopia, classtab.org, free-scores)
paired with a performance of the same edition. Heavy files are under `/home/user/gtv/candidates/archives/` (not in
git). Every fact below was read or measured from this box on 2026-11-25 unless a source date is given.

## What answers from this box (and what was refused)

| Source | Result |
|---|---|
| archive.org (search, metadata, downloads) | Answers, fast (a 70 MB file in a few seconds). The main source of this record. |
| web.archive.org (Wayback Machine) | Every connection reset by the agent proxy (`ws_closed_mid_exchange`, 5 tries, curl exit 35). Only `archive.org/wayback/available` answers. Not worked around. |
| Wikimedia Commons API | Answers between bouts of HTTP 429 (`retry-after` 1 to 600 s; the egress IP is shared). Searches were run one request at a time, honouring `retry-after`. |
| upload.wikimedia.org (Commons media files) | **HTTP 429 with `retry-after: 600` from 00:03 to 01:17 UTC** (originals and transcodes), tried about once every 10 minutes. One HEAD request answered 200 at 01:05:39, but the download that followed got 429 again (curl waited out the retry-after twice). The two Culture Vannin videos below could not be downloaded; `_bin/commons_wait_fetch.sh` (see "Files") can be run again by a later stage. |
| YouTube | Refused: `yt-dlp` 2026.11.23 read the metadata of a Culture Vannin video (1080p, 135 s), then "HTTP Error 403: Forbidden" on the media (one try). Not worked around. |
| Vimeo search | A request for Vimeo's anonymous viewer token (the way to search Vimeo without an account) was **refused by this box's permission system** ("Unauthorized Access"). Not repeated. Single Vimeo videos still answer through `player.vimeo.com` (see the creators scout), but no Vimeo candidate with a tab was found by web search. |
| PeerTube (SepiaSearch and instance APIs) | Answers; videos are directly downloadable. Nothing usable found (see "Looked at"). |
| Mutopia, classtab.org, free-scores.com, culturevannin.im, manxmusic.com, goliathguitartutorials.com, paidtabs.com | Answer. |

## Summary

| Slot | Candidate | Performer / tab maker | Source of the video | Video | Tab | Downloaded |
|---|---|---|---|---|---|---|
| (a) capo | **Stitches** (Shawn Mendes), tab video | Gareth Evans (both) | archive.org mirror of his YouTube channel | 1920x1080, 25 fps, 4:08 (tab runs 0:18 to 3:43) | Guitar Pro tab on screen (banner + tab strip fill the bottom 49% of the frame), standard + capo 1; GP + PDF sold | video yes (tab is in the video) |
| (a) capo | **Steal My Girl** (One Direction), tab video | Gareth Evans (both) | same | 1920x1080, 25 fps, 4:14 (tab 0:18 to 4:06) | same kind, standard + capo 3 | yes |
| (b) tuning | **Closer** (The Chainsmokers), tab video | Gareth Evans (both) | same | 1280x720, 50 fps, 4:41 (tab 0:14 to 4:16) | same kind, **E A D G A D** + capo 1 | yes |
| (b) tuning | **Can't Feel My Face** (The Weeknd), tab video | Gareth Evans (both) | same | 1280x720, 50 fps, 3:47 (tab 0:10 to 3:46) | same kind, drop D (D A D G B E), no capo | yes |
| (c) neither | **The Sea Invocation** (Manx trad.), lesson | Pete Lumb (plays and arranged) / Culture Vannin | Wikimedia Commons, CC BY 3.0 | 1920x1080, 12:19 lesson | Sibelius PDF, notation + TAB with rhythm, standard, no capo | tab yes, **video no** (429) |
| (c) neither | **Three Little Boats** (Manx trad.), lesson | Pete Lumb plays; arranged by James Franklin / Culture Vannin | Wikimedia Commons, CC BY 3.0 | 1920x1080, 4:53 lesson | PDF (text layer), notation + TAB with rhythm, standard, no capo | tab yes, **video no** (429) |
| (c) neither | **Imagine** (John Lennon), tab video | Gareth Evans (both) | archive.org mirror | 1920x1080, 50 fps, 3:40 (tab 0:21 to 3:17) | same kind as above, standard, no capo | yes |
| (c) neither, alt | **Human** (Rag'n'Bone Man), tab video + cover video | Gareth Evans (both) | archive.org mirror | 1920x1080; tab video audio is about 70 cents flat (see below) | same kind, standard, no capo | yes |

Best of this lane per slot: (a) **Steal My Girl** (capo 3: the largest offset, capo in frame, strongest check) or
Stitches; (b) **Closer** (the only tuning further from standard than drop D, though it also has a capo); (c) **The Sea
Invocation** if its video can be fetched later (different player, CC BY, obscure, arranger's own tab), otherwise
**Imagine**. Next to the creators scout's Evan Handyside videos (nylon string, his own handwritten tabs without
rhythm), a Gareth Evans tab video adds a different player, a steel-string guitar, a close-up camera and a tab with
rhythm and a cursor (bar timings come free), for whichever slot the selector leaves open.

The honest summary: open archives hold one strong source for this job, Gareth Evans' "tabs on screen" videos, which
are steady one-camera performances with the performer's own Guitar Pro tab scrolling in a strip below the hands. All
of them are covers of very well-known pop songs by one player on one camera set-up, so this lane can fill one slot
well, not three. The only open-licensed (CC BY) candidates, Culture Vannin's Manx lessons, are obscure trad tunes
with the arranger's own tab, but Commons would not serve the video files to this box.

---

## The Gareth Evans "tabs on screen" videos (archive.org)

Common facts for all Gareth Evans candidates:

- **Performer, arranger, tab maker:** Gareth Evans, a fingerstyle guitarist and teacher in Wales (channel
  "Gareth Evans", later handle GarethEvansYT; site goliathguitartutorials.com, "Goliath Guitar Tutorials").
- **What the video is:** for each arrangement he published a cover video (a multi-camera edit) and, a few weeks later,
  a "Free Guitar Tabs" / "Tabs Played on Screen" video: **one static close-up camera** on the guitar from the
  soundhole to the headstock (both hands, the capo and the nut in frame), a logo banner across the middle, and the
  Guitar Pro tab of the arrangement in a white strip at the bottom with a moving cursor and the current bar
  highlighted (4 bars per screen, bar numbers, rhythm stems, techniques: H, P, sl., T = tap, X = thumb slap,
  (o) = wrist thump, <12> = harmonic). He plays the arrangement at full speed along with it. The tab strip is the
  ground truth; it is drawn below the hands, not over them, and crops away cleanly (positions per video below).
- **Source page:** Internet Archive item `gareth-evans_202101`, "Gareth Evans Youtube Channel", "Archive of Gareth
  Evans Youtube channel" (3,842 files, 155 GB, added 2021-01-29, collections `mirrortube`, `social-media-video`).
  Each file is the yt-dlp download of the YouTube original; the YouTube id is in the file name.
- **Licence / terms as stated:** none in the archive item. The YouTube originals carry the standard YouTube licence.
- **Notable about rights:** (1) the archive item is a third-party mirror, not uploaded by the performer; (2) every
  song is a major-label composition (Shawn Mendes, One Direction, The Chainsmokers, The Weeknd, John Lennon,
  Rag'n'Bone Man); (3) the tabs were free when the videos were made, but today his printable tabs are sold: the
  lesson pages on goliathguitartutorials.com link "Buy printable tabs on MyMusicSheet / PaidTabs", and PaidTabs
  sells each one as **Guitar Pro + PDF for $7.99** (checked for "Human": "Delivery Files Guitar Pro, Adobe PDF",
  "Standard Tuning, 75 Bpm"). Buying the GP file would give a machine-readable truth for whichever song is chosen;
  that needs a person with a payment card. His covers of Human and Closer were also released on iTunes and Spotify.
- **How well known:** all are hit songs, so a model knows their keys and chord progressions; the fingerstyle
  arrangements (voicings, percussion, positions) are his own and not standard.
- **Credit line to show:** "<Song> (<artist>), fingerstyle arrangement, tab and performance by Gareth Evans
  (goliathguitartutorials.com). Video from his YouTube channel, via the Internet Archive."
- **Tuning and capo** are stated in each video's description ("The guitar is tuned to Standard Tuning, Capo on the
  1st fret", ...), in the tab itself ("Capo. fret 3"), and on his site's lesson data (table at the end).
- **How the match was checked (same method for each):** `_bin/cursor_track.py` follows the yellow highlight and the
  blue cursor to find when the four bars of one screen are played; the frets of those bars were read off the frame
  by eye; `_bin/chroma_match.py` compares the mean CQT chroma of that audio window (librosa 0.11.0) with the pitch
  classes of the tab notes (sounding pitch = open string + fret + capo), at all 12 transpositions. A right capo gives
  the best score at shift 0; the same shapes without the capo would score best at shift minus the capo fret.

### (a1) CAPO: "Stitches" (Shawn Mendes), standard tuning, capo 1, 1080p

- Video: `20160311_Stitches - Shawn Mendes _ Free Guitar Tabs_7fp3qaKFSBc_[1920x1080].mkv` (YouTube id
  7fp3qaKFSBc, 2016-03-11). VP9 1920x1080, 25 fps, 247.6 s, Opus 48 kHz stereo, 63 MB. Title card until 0:18, tab
  plays 0:18 to 3:43, end card after.
- Camera: static close-up, soundhole to headstock; picking hand at the soundhole, fretting hand and **capo on fret 1
  clearly visible** next to the nut; steel-string acoustic. One take, no cuts (contact sheet). Clean video area:
  rows 0 to 556 of 1080 (top 51%); logo banner rows 556 to 651; tab strip rows 651 to 1080.
- Tab: Gareth's Guitar Pro tab, drawn on screen (32 screens of 4 bars, rhythm included). Description: "The guitar is
  tuned to Standard Tuning - Capo on the 1st fret". Machine-readable version: PaidTabs GP + PDF, $7.99.
- Match: bars 25 to 28 (screen 7, 57.0 to 63.3 s; 31 notes: F#2 G#3 A#3 C4 G#2 F4 D#4 C#4 A#2 ... as sounding with
  capo 1). Audio chroma top classes G#, A#, F#, C, D#, F, C# = exactly the seven classes of the tab. Cosine at shift 0
  **0.804**; without the capo (shift -1) 0.481; next best 0.773 (shift -2, a fourth-related profile). Tuning offset
  +6 cents. Capo 1 confirmed. Hands: frames at 1:00 and 3:21 show the fretting hand in the low positions the tab
  gives at those bars (frets 0 to 4 above the capo), so the picture is the same take as the tab and sound.
- Also on the archive: the cover video `20160227_Stitches - Solo Fingerstyle Guitar Version_uzHe3lEchEI` (1080p,
  224 s, multi-camera edit, Fylde Falstaff guitar per its description) and a 23-minute lesson. Not downloaded.
- Files: `/home/user/gtv/candidates/archives/ge-stitches/` (`stitches_tabvideo.mkv`, contact sheet
  `stitches_tabvideo_sheet.jpg`).

### (a2) CAPO: "Steal My Girl" (One Direction), standard tuning, capo 3, 1080p

- Video: `20160401_Steal My Girl - One Direction _ Free Guitar Tabs_-I0KV5KLC7c_[1920x1080].mkv` (2016-04-01).
  H.264 1920x1080, 25 fps, 253.8 s, Opus 48 kHz, 71 MB. Tab plays 0:18 to 4:06.
- Camera: same set-up as Stitches (static close-up, capo on fret 3 visible); clean video rows 0 to 556, tab strip
  651 to 1080. The tab's first screen reads "Intro, Capo. fret 3, let ring throughout".
- Tab: Gareth's Guitar Pro tab on screen; description: "tuned to standard tuning, The capo is on the 3rd fret".
- Match: bars 1 to 4 (17.4 to 30.4 s; melody C4-B3-A3-G3 shapes over G and C bass shapes, sounding D#4 D4 C4 A#3
  over A#2 / D#3 with capo 3). Cosine at shift 0 **0.882**; the same shapes without capo (shift -3) 0.401; next best
  0.546. Tuning offset +3 cents. Capo 3 confirmed.
- Files: `/home/user/gtv/candidates/archives/ge-stealmygirl/stealmygirl_tabvideo.mkv` (+ `_sheet.jpg`).

### (b1) UNUSUAL TUNING: "Closer" (The Chainsmokers), E A D G A D + capo 1, 720p

- Video: `20161117_Closer - The Chainsmokers _ Free Guitar Tabs_pU-Xcvnn2w8_[1280x720].mkv` (2016-11-17). VP9
  1280x720, 50 fps, 280.6 s, Opus 48 kHz, 63 MB. Tab plays 0:14 to 4:16. 720p is the best the archive holds.
- Camera: static close-up, soundhole to nut, capo on fret 1 visible; clean video rows 0 to 404 of 720 (56%); tab
  strip rows 467 to 720.
- Tuning and capo: description "Tuning: EADGAD - Capo on 1st fret"; the site's lesson data: "Tuning EADGAD, Capo 1st
  fret", rated "Expert" ("wrist thump with tapping through the song", "over half the notes are above open
  position"). The second string is tuned down a whole step (B to A); the slot asks for an unusual tuning, and this
  one also has a capo.
- Tab: Gareth's Guitar Pro tab on screen, tempo 95, with natural harmonics at the 12th fret, tapping, wrist thumps.
- Match: bars 1 to 4 (14.4 to 24.4 s): harmonics on strings 2 and 3 over fretted bass on strings 4 and 5. Read in
  E A D G A D with capo 1 the notes give cosine **0.737** at shift 0 (without capo, shift -1: 0.286); the same frets
  read in standard tuning give 0.593. The audio has no C among its top seven classes while A# is 0.72: the open
  second string sounds A# (A + capo), not C (B + capo). Best score overall 0.754 at shift -5 (a fourth-related
  profile), so pitch classes alone do not settle it; the harmonic test does. Tuning offset -3 cents.
- Files: `/home/user/gtv/candidates/archives/ge-closer/closer_tabvideo.mkv` (+ `_sheet.jpg`).

### (b2) UNUSUAL TUNING (weakest kind): "Can't Feel My Face" (The Weeknd), drop D, no capo, 720p

- Video: `20151007_Can't Feel My Face _ The Weeknd _ Guitar Tabs_x-xPJR5Q9Os_[1280x720].mkv` (2015-10-07). VP9
  1280x720, 50 fps, 227.5 s, 54 MB. Tab plays 0:10 to 3:46.
- Camera: static, this time framing the whole neck **including the headstock and tuners**; clean rows 0 to 353 of
  720 (49%), tab strip 418 to 720. Lots of two-hand tapping high on the neck (the picking hand crosses over the
  fretboard), which makes it a hard video case.
- Tuning: description "tuned to DADGBE"; site data "DADGBE", no capo.
- Match: energy below standard tuning's lowest note: CQT energy at D2 is 0.33 of the maximum in 9.5 to 60 s (0.00 in
  the standard-tuned Imagine video), so the sixth string is down to D. Bars 10 to 13 read power-chord bass on
  strings 6 and 5 (frets 5, 3, 7: G2/D3, F2/C3, A2/E3 in drop D).
- Files: `/home/user/gtv/candidates/archives/ge-cantfeel/cantfeel_tabvideo.mkv` (+ `_sheet.jpg`).

### (c3) NEITHER: "Imagine" (John Lennon), standard, no capo, 1080p

- Video: `20161014_Imagine - John Lennon _ Free Guitar Tabs_wEtU5g9RNwQ_[1920x1080].mkv` (2016-10-14). VP9
  1920x1080, 50 fps, 220.2 s, 94 MB. Tab plays 0:21 to 3:17.
- Camera: static close-up, soundhole to nut, both hands; a "GoliathGuitar tutorials.com" logo sits over the top right
  corner (the headstock end) all through. Clean rows 0 to 648 of 1080 (60%); tab strip 743 to 1080.
- Tuning/capo: site data "Tuning Standard, Capo No capo", rated "Challenging (wrist thump all through)".
- Match: bars 1 to 4 (21.0 to 34.0 s; C, Cmaj7 and F/C shapes with the A-A#-B passing line, 58 notes). Cosine at shift
  0 **0.852**; shift -1 0.427, +1 0.415. Tuning offset +1 cent. Standard tuning without capo confirmed.
- Fame: one of the best-known songs there is; the arrangement is Gareth's.
- Files: `/home/user/gtv/candidates/archives/ge-imagine/imagine_tabvideo.mkv` (+ `_sheet.jpg`).

### (c4) NEITHER, alternative with a catch: "Human" (Rag'n'Bone Man), standard, no capo

- Tab video `20170515_Human - Rag'n'Bone Man _ Free Guitar Tabs_9TW4W9L0K9A_[1920x1080].mkv` (VP9 1080p,
  **23.976 fps**, 234.2 s, tab 0:10 to 3:36) and cover video `20170421_Human - Solo Fingerstyle Guitar
  Version_72yB-xyIcGI_[1920x1080].mkv` (H.264 1080p, 25 fps, 222.9 s, multi-camera edit with close-ups, some
  out-of-focus shots, an iTunes/Spotify end card; guitar: Faith Neptune Signature per its description).
- Catch, measured: the tab video's audio is about **70 cents flat** of the cover video (cross-correlation of the two
  pitch profiles at 1/3-semitone resolution peaks at +67 cents, 0.996, next +100 cents, 0.902; librosa's tuning
  estimate for the tab video is +27 cents, i.e. -73 cents from the next semitone, against +1 cent for the cover).
  That is what a 25 to 23.976 fps conform does (4.3% slower, -72.6 cents). The tab is right, the sound of that video
  is not at concert pitch. The cover video is at pitch: bars 1 to 4 of the tab (B minor riff on strings 4
  and 5, standard, no capo) score cosine 0.703 at shift 0 against its first 30 s, ±1 at 0.48.
- Files: `/home/user/gtv/candidates/archives/ge-human/` (`human_tabvideo.mkv`, `human_performance.mkv`, sheets).

---

## Culture Vannin's Manx guitar lessons (Wikimedia Commons, CC BY 3.0) — tab downloaded, video not

Culture Vannin (the Manx Heritage Foundation, Isle of Man) made "a series of video lessons for Manx music on guitar.
All sheet music (including tab) is free to download" (culturevannin.im, "Manx guitar lessons"). The videos are on its
YouTube channel under CC BY; two were copied to Wikimedia Commons by others. The 20 guitar arrangements on the page
(by James Franklin, Pete Lumb and F Woolley) were all downloaded and searched: none names a capo or an altered
tuning, so the series can only fill slot (c). Only these two have a downloadable copy (Commons); the rest are on
YouTube, which refuses this box.

### (c1) NEITHER: "The Sea Invocation", arranged and presented by Pete Lumb

- Source page: https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_The_Sea_Invocation.webm . Description:
  "A guitar tutorial of how to play the traditional Manx tune, 'The Sea Invocation'. Tab available here: [PDF]. This
  film is presented by Pete Lumb. It is produced by Culture Vannin, in order to promote and support Manx music."
- Licence as stated: CC BY 3.0 (author "Culture Vannin", the YouTube CC BY licence). The PDF says "Culture Vannin &
  individual composers © 2019" and gives no licence; it is offered as a free download. The tune is traditional.
- Credit line: "The Sea Invocation (Manx traditional), arranged and played by Pete Lumb. Video: Culture Vannin, CC BY
  3.0, via Wikimedia Commons."
- Video (from the Commons API): WebM 1920x1080, 739.2 s, 132.9 MB. It is a 12-minute **lesson**, so the full
  play-through inside it has still to be located; camera and framing **not seen** (download refused, see top).
- Tab: `The Sea Invocation - Guitar- Pete Lumb.pdf`, 2 pages, made with Sibelius 18.7 (PDF text layer present: about
  180 digit glyphs with coordinates, fret numbers among them, so string/fret/position can be parsed with
  `pdftotext -bbox`; rhythm is drawn as stems on the tab).
  4/4, G major. Tuning: not printed; the tab implies standard (bass G2 at string 6 fret 3, C3 at string 5 fret 3,
  E2 open, in G major); no capo marked.
- Match with the performance: **not checked** (no audio could be fetched). The arranger is the presenter, so the
  edition should be what he plays.
- Fame: obscure outside the Isle of Man. Good for the blind round.
- Prepared for the check: the first tab system parsed from the PDF text layer (`pdftotext -bbox`; strings 2 to 6
  at y = 276, 284, 291, 299, 306 pt) gives bars 1 to 4 as B3+E2, B2, A3, B3+D3, B3+B2, A3, B3+C3, B3, A3, G3+B2,
  F#3, G3+G2, B2, G3+C3, A2, A3, B3+E2, E3+B2, E3+C3, A2 (standard tuning), the same melody as the notation
  (B A B B A | B B A G F# | G G A | B E E). Run `_bin/chroma_match.py` on the play-through with these notes once the
  video is in.
- Files: `/home/user/gtv/candidates/archives/manx-sea-invocation/` (PDF; `commons_wait_fetch.sh` saves the video
  here).

### (c2) NEITHER: "Three Little Boats", arranged by James Franklin, played by Pete Lumb

- Source page: https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm (same
  wording: "This film is presented by Pete Lumb"). CC BY 3.0. WebM 1920x1080, 292.8 s, 35.7 MB. A lesson of under
  5 minutes, so the play-through is a part of it. Not downloaded (429).
- Tab: `Three Little Boats - Guitar - J Franklin.pdf`, 1 page (Acrobat Distiller, text layer present): "Three Little
  Boats, Manx trad, arr. James Franklin", "Lively", 6/8, A minor, chord names over the staff (Am F G Am Em ...),
  notation + TAB with rhythm and left-hand fingering, "CI" barre marks. Standard tuning (A minor shapes: open A2 on
  string 5, F with a first-fret barre), no capo.
- Credit line: "Three Little Boats (Manx traditional), arranged by James Franklin, played by Pete Lumb. Video:
  Culture Vannin, CC BY 3.0, via Wikimedia Commons."
- Fame: "one of the best-known and most-played tunes of all traditional Manx music" (manxmusic.com), unknown
  elsewhere.
- Files: `/home/user/gtv/candidates/archives/manx-three-little-boats/` (PDF).

---

## Looked at and not taken (reason)

- **Jamey Pittman** (archive.org TubeUp mirrors of his YouTube uploads, 720p): Tony Rice flatpicking solos with free
  PDF transcriptions on Google Drive, e.g. "I'm Not Sayin'" (capo 1, 616 s lesson). They are solo breaks of about
  a minute played **along with the record** (band and singer audible), not a solo piece.
- **Gareth Evans' 2010 to 2012 lessons** in the same archive item: Andy McKee pieces in open tunings
  ("All Laid Back And Stuff" CGDGAD, "When She Cries" CGDGBC, no capo), Nick Drake CGCFCE songs (360p): lessons
  in parts, no on-screen tab, and the tabs are other people's.
- **archive.org, low resolution:** Stefan Grossman's Skip James "Special Rider Blues" lesson with tab (640x480);
  Kevin Murphy's "Little Martha" (open tuning, 480p WMV, 2006); Russ Rentler "La Petite Voie" (DADGAD, 640x480, no
  tab); Alexandra Whittingham "Capricho Árabe" (drop D, 360p); Giuseppe Ficara, Dowland (240p); Li Jie VCD
  recitals (176p to 240p).
- **archive.org, no ground truth:** Frank Matthias "Musikalische Rumpelkammer" (1080p, twelve blues in twelve
  tunings incl. DADGAD, open D, Orkney; improvised, no tab); Jake Reichbart concert sets (720p, improvised requests).
- **archive.org, rights:** "Guitar Lesson Books & Videos" and similar items are uploads of commercial courses (Lick
  Library, Star Licks, Hot Licks...) without the publishers' permission; not used.
- **Wikimedia Commons** (about 15 searches in several languages; about 400 video files seen): "Bach Bourree in B
  minor BWV 1002" played by Mario Zedog (720p, 232 s, CC BY 3.0) and "Isaac Albeniz - Asturias - David Hernando"
  (720p, 346 s, CC BY-SA 4.0) are the only HD solo classical-guitar performances; neither comes with the
  performer's tab (classtab.org has editorial tabs of both pieces, whose fingering may differ), and both are behind
  the same 429. Others are trios (Tritonus Guitar Trio; tobydarling's Playford trios), effect-pedal demos, a
  10-string decacorde, theorbo, or 60 s clips.
- **PeerTube:** Brian Trinen (Celtic fingerstyle, 720p, CC BY-NC-ND; no tab of his found); Michel Bert (Cimarosa
  sonatas, public-domain dedication, 360p); Genna's Gentlefolk "Planxty Irwin" (multitracked, four guitars);
  tab-on-screen pop covers re-uploaded from YouTube by third parties.
- **Mutopia** "Spanish Fandango" (H. Worrall, "As published by J. Church & Co. 1882", piece "Open G tuning",
  LilyPond, public domain, Mutopia-2015/07/23-2036): no video of a performance of that edition found on any open
  host; the many YouTube performances play other versions.
- **culturevannin.im / manxmusic.com:** the other 18 Manx guitar arrangements are standard tuning with no capo and
  their lessons are YouTube-only.

## Gareth Evans: every tab video in the archive, with tuning and capo (for a different pick)

From the archive file list (resolution and frame rate read with ffprobe over HTTP) and the lesson data embedded in
goliathguitartutorials.com/library (259 lessons, read 2026-11-25). Most of the solo arrangements also have a
multi-camera cover video and multi-part lessons in the archive.

| Song | Tuning | Capo | Tab video | Date |
|---|---|---|---|---|
| Stitches | standard | 1 | 1080p25 | 2016-03-11 |
| Hello | standard | 1 | 720p50 | 2015-11-13 |
| Can You Feel the Love Tonight | standard | 1 | 1080p25 | 2015-10-27 |
| Thinking Out Loud | standard | 2 | 1080p25 | 2015-10-12 |
| Steal My Girl | standard | 3 | 1080p25 | 2016-04-01 |
| Jar of Hearts | standard | 3 | 720p50 | 2016-08-08 |
| Bad Liar | standard | 3 | 1080p23.976 | 2020-05-02 |
| Counting Stars | standard | 4 | 1080p23.976 | 2020-07-11 |
| Underwood Typewriter (Fionn Regan, accompaniment) | standard | 8 | 1080p60 | 2020-05-17 |
| Leading Me Now (Tallest Man on Earth, accompaniment) | D G D G B E | 2 | 1080p60 | 2020-06-30 |
| Closer | E A D G A D | 1 | 720p50 | 2016-11-17 |
| Love Yourself | D A D G B E | 2 | 1080p25 | 2016-02-19 |
| Flashlight | D A D G B E | 3 | 1080p25 | 2015-09-15 |
| Rise | D A D G B E | 4 | 1080p50 | 2016-08-25 |
| Faded | D A D G B E | 4 | 720p50 | 2016-12-29 |
| You Raise Me Up | D A D G B E | 1 | 1080p25 | 2017-12-22 |
| Dance Monkey | D A D G B E | 4 | 1080p23.976 | 2020-05-28 |
| Demons | D A D G B E | 1 | 1080p23.976 | 2020-08-07 |
| Can't Feel My Face | D A D G B E | none | 720p50 | 2015-10-07 |
| Imagine | standard | none | 1080p50 | 2016-10-14 |
| Human | standard | none | 1080p23.976 (audio ~70 cents flat) | 2017-05-15 |
| Old Town Road | standard | none | 1080p23.976 | 2020-04-26 |
| Yesterday | standard | none | 1080p60 (413 s, probably with a half-speed pass) | 2020-06-12 |

The 23.976 fps videos may share the Human video's slowdown; only Human was measured. His site data also lists
open-tuned solo arrangements without a tab video in the archive (e.g. "Sentiment", his own piece, D A D F# A D +
capo 3, cover at 720p; "The Scientist", D A D F# A D + capo 3).

## Files and tools

- `/home/user/gtv/candidates/archives/ge-*/`: the Gareth Evans videos and contact sheets (432 MB in all).
- `/home/user/gtv/candidates/archives/manx-*/`: the two Culture Vannin PDFs.
- `/home/user/gtv/candidates/archives/_bin/cursor_track.py`: prints, per sampled frame of a Gareth Evans tab video,
  the highlighted bar slot (0 to 3), the cursor position and a page signature; gives bar timings for free.
- `/home/user/gtv/candidates/archives/_bin/chroma_match.py`: cosine between an audio window's CQT chroma and the
  pitch classes of a list of sounding notes, at all transpositions.
- `/home/user/gtv/candidates/archives/_bin/fetch.sh`: resumable download with stall detection.
- `/home/user/gtv/candidates/archives/_bin/commons_wait_fetch.sh`: tries the two Commons videos once every 10
  minutes (6 rounds, honouring retry-after) and saves them into the `manx-*` folders. It ran from 00:45 to 01:17
  without success and was stopped when this scout finished; run it again from a later stage.
- Python for the checks: a scratch venv with librosa 0.11.0 and numpy 2.5, deleted afterwards to free disk
  (`uv venv venv --python 3.12 && uv pip install --python venv/bin/python librosa==0.11.0` recreates it).
