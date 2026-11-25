# The three songs of the AO-082 film

Selector, stage 1, 2026-11-25. Picked from the three scout records (`candidates-datasets.md`,
`candidates-creators.md`, `candidates-archives.md`) after checking the finalists on the box. The same facts in
machine form: `songs.json`. Heavy files: `/home/user/gtv/songs/<slot>/` (video, `audio.wav` 44.1 kHz stereo, tab)
and `/home/user/gtv/candidates/`. Check scripts and their outputs: `/home/user/gtv/candidates/_selector/`
(`bin/`, `checks/`, `PROGRESS.md`).

## The picks

| Slot | Recording | Player | Tuning, capo | Video | Truth | Tab vs recording (bars 1-8 or verse x2) |
|---|---|---|---|---|---|---|
| capo | *Steal My Girl* (One Direction), his solo arrangement | Gareth Evans | standard, **capo 3** | 1920x1080, 25 fps, 4:14 | his Guitar Pro tab on screen, rhythm + cursor | chroma 0.845 as tab, 0.395 without the capo |
| tuning | *A soft collision of breath* (his own piece, Dec 2025) | Evan Handyside | **D G C F A C**, no capo | 2304x1296, 30 fps, 3:07 | his handwritten tab, order only, no rhythm | DTW chroma 0.810 as tab, 0.683 read in standard tuning |
| standard | *Imagine* (John Lennon), his solo arrangement | Gareth Evans | standard, no capo | 1920x1080, 50 fps, 3:40 | his Guitar Pro tab on screen, rhythm + cursor | chroma 0.867 as tab, 0.40-0.43 at +-1 semitone or capo 2 |

Backups: capo, *Stitches* (Gareth Evans, capo 1); tuning, *Closer* (Gareth Evans, E A D G A D + capo 1);
standard, Scarlatti *Sonata K. 1* (Ana Vidovic, GAPS truth).

**What was traded.** Two players, not three. Gareth Evans fills two slots because his "tabs played on screen"
videos are the only full performances on the box that carry the performer's own tab **with rhythm**, a cursor that
times every bar, and his own fingering, on a steady 1080p close-up with the capo and nut in frame. The only
downloadable third player with a rhythm truth, Ana Vidovic (Scarlatti K. 1, GAPS), comes as a 720p, 0.48 Mb/s
multi-camera edit with editorial fingering; she is the standard-slot backup. The tuning slot goes to Evan Handyside
although his tab has no rhythm: it is the only candidate in a really altered tuning without a capo on top, it is an
unknown original (no model can know it), and it adds a second player, a nylon-string guitar and a different camera.
The cost is that stage 2 must time his notes from the audio (the order of notes is fixed by the tab, so this is an
alignment, not a transcription). Both Gareth picks are covers of very famous major-label songs (notable, see rights).

Searched and dropped by this selector: Commons (the two CC BY Manx lessons by Pete Lumb still answer HTTP 429 at
01:31 and 01:41 UTC; `commons_wait_fetch.sh` keeps trying), archive.org titles and performers of every non-train GAPS
piece (the searches found copies only of Ana Vidovic's K. 1 and K. 213; K. 213 is a GAPS train piece), Odysee (video refused, see the
creators record).

## How the checks were run (all three picks)

- **Files whole**: `ffprobe` on every video (codec, size, frame rate, length, audio stream) and on each `audio.wav`.
- **Frames looked at**: 6 to 12 frames across each video (the scouts' contact sheets and the selector's frames in
  `_selector/frames/`), plus full-resolution frames to measure the crop rectangles.
- **Tab read**: the on-screen tabs were split into pages (`_selector/bin/tab_pages.py`: the page turns when the
  yellow bar highlight jumps back to the left) and saved as `tab_pages/page_NN.png` with start and end times
  (`pages.json`) and stacked as `tab.png`. Bars 1-8 of each were read off the pages by eye, string and fret.
- **Synth vs recording** (`_selector/bin/synth_check.py`): the notes of the first 25 s are synthesized with
  FluidSynth (FluidR3_GM, steel or nylon guitar). For the Gareth videos each note's onset is the moment the blue
  playback cursor reaches the note's x position on the page, so tab and recording line up without guessing; a global
  lag within +-0.46 s is allowed. Score: the mean frame-by-frame cosine of CQT chroma (librosa 0.11, hop 23 ms), and
  per bar. The same notes are scored again under wrong readings (no capo, +-1 semitone, standard tuning) as the
  baseline a wrong tab would get. For the handwritten tab (no rhythm) the synth is evenly spaced and aligned with a
  subsequence DTW, best of three speeds, for every reading alike.
- **Notes per bar**: tab notes (or events) per bar against onsets found in the recording (librosa onset detection).

---

## capo: *Steal My Girl*, Gareth Evans (pick)

- **Title**: Steal My Girl (One Direction, 2014), solo fingerstyle arrangement by Gareth Evans.
- **Performer / arranger / tab maker**: Gareth Evans, fingerstyle guitarist and teacher in Wales (goliathguitartutorials.com).
- **Source page**: https://archive.org/details/gareth-evans_202101 ("Gareth Evans Youtube Channel", an archive of his
  YouTube channel, collections mirrortube and social-media-video), file
  `20160401_Steal My Girl - One Direction _ Free Guitar Tabs_-I0KV5KLC7c_[1920x1080].mkv` (YouTube -I0KV5KLC7c,
  2016-04-01).
- **Licence / terms as stated**: none in the archive item; the YouTube original carries the standard YouTube licence.
- **Credit line**: "Steal My Girl (One Direction), fingerstyle arrangement, tab and performance by Gareth Evans
  (goliathguitartutorials.com). Video from his YouTube channel, via the Internet Archive."
- **Video**: H.264 1920x1080, 25 fps, 253.78 s, Opus 48 kHz stereo, 2.2 Mb/s. Title card to 18 s, music 18.0 to
  246.3 s, end card after.
- **Camera**: one static close-up from the soundhole to the nut, one take: picking hand at the soundhole, fretting
  hand, **capo on fret 3** and the nut at the right edge, all through. Steel-string acoustic.
- **Tuning / capo**: standard E2 A2 D3 G3 B3 E4 (MIDI 40 45 50 55 59 64), capo 3. Printed on tab page 1 ("Capo.
  fret 3, let ring throughout") and in the video description.
- **Tab**: his Guitar Pro tab, drawn on screen in a white strip (rows 651 to 1080, 1920x429 px) with rhythm stems,
  bar numbers, P/H, X (thumb slap), o (wrist thump), a page counter (n/20) and a blue cursor plus yellow bar highlight
  that follow the playing. **72 bars on 19 pages** from 18.0 to 246.3 s (bar 72 ends with the final double bar on page
  19/20). Fret digits are 25 to 30 px tall: every one is legible. About 76 bpm, 4/4. No tab file is free: Guitar Pro
  + PDF are sold on PaidTabs for $7.99. Files: `/home/user/gtv/songs/capo/tab_pages/` and `tab.png`.
- **Match** (bars 1-8, 80 pitched notes, recording 18.3 to 43.2 s): frame chroma cosine **0.845** as tab (lag
  0.09 s) against 0.395 without the capo, 0.424 a semitone up, 0.457 a semitone down; per bar 0.83 to 0.98, mean
  **0.902** against 0.463 without the capo. Notes per bar, tab against onsets in the audio: 11/11, 11/10, 11/11,
  11/11, then 9 notes + 2 slaps against 11, 11, 11, 13. The archive scout's own check of bars 1-4: 0.882 against
  0.401. Verdict: the tab is this performance, capo 3 confirmed.
- **Crop for tools and the blind run**: x 0, y 0, w 1920, h 556 (size 1920x556): both hands whole, the fretboard, the
  capo and the nut. Rows 556 to 651 are a logo banner (Elixir, Subscribe, patreon), 651 to 1080 the tab. Also cut
  0 to 18 s and 246.3 s to the end (cards).
- **Best segment**: **30.75 to 60.75 s** (bars 5 to about 13): the intro figure with thumb slaps, then verse 1, whose
  melody climbs to frets 7 to 9 above the capo, so the hand moves away from the capo; bass on strings 5 and 6,
  pull-offs. Bars 5-8 are already read and timed (`_selector/checks/capo/as_tab.mid`, t = 0 at 17.98 s of the video).
- **How well known**: very famous pop single; the arrangement and its fingering are his.
- **Rights, notable**: a cover of a major-label composition (One Direction); the video is a third-party mirror with
  no licence; his tabs are now sold.

## tuning: *A soft collision of breath*, Evan Handyside (pick)

- **Title**: A soft collision of breath, an original by Evan Handyside (tab dated 12/26/25).
- **Performer / composer / tab maker**: Evan Handyside (Intellimusica, "Uncommon ideas for the practicing guitarist").
- **Source page**: https://www.intellimusica.com/a-soft-collision-of-breath/ (category "Free TABs"); video
  https://vimeo.com/1149455966 ("A soft collision of breath \ Original by Evan Handyside | Fingerstyle Guitar",
  downloaded through player.vimeo.com).
- **Licence / terms as stated**: site footer "Copyright (c) 2026 Intellimusica"; no reuse licence. Vimeo: none
  stated (all rights reserved by default).
- **Credit line**: "A soft collision of breath, composed and played by Evan Handyside, intellimusica.com".
- **Video**: H.264 2304x1296, 30 fps, 187.37 s, AAC 48 kHz stereo, 9.5 Mb/s. Music from about 1.5 s.
- **Camera**: one static front view, medium shot. Both hands visible all through; the neck runs to the right frame
  edge, so the nut and headstock are out of frame and low positions sit near the edge. Nylon-string cutaway
  crossover guitar. Nothing drawn on the picture.
- **Tuning / capo**: **D2 G2 C3 F3 A3 C4** (MIDI 38 43 48 53 57 60): a whole step down, with the 1st string dropped
  a further whole step ("TUNING: D G C F A C" on the tab; the post says the same). No capo. Every string differs from
  standard.
- **Tab**: a one-page handwritten six-line tab scanned to PDF (no text layer), by the composer. Verse pattern (played
  4x: 20 events per pass, 2 chords + 18 single notes), chorus ("II x", four systems: Am-Em, Am-C, Am-Em, G5-D11
  shapes), end chord; form in the post: Verse 4x, Chorus; Verse 4x, Chorus 2x; End. **No rhythm, no bar lines inside
  the systems**: the truth needs the notes typed in order and their onsets aligned to the audio. Count read off the
  page: verse 20 events (26 notes), chorus 80 events (104 notes: four systems of 20), end 1 chord (4 notes). Unrolled
  by the form: 401 events, 524 notes. At the 0.45 s per event the DTW preferred, 401 events take 180 s, against about
  181 s of music: the form in the post fits the recording (verse block about 1.5-37.5 s, chorus 1 about 37.5-73.5 s,
  verse block about 73.5-109.5 s, chorus 2x about 109.5-181.5 s, end chord about 182 s; estimates). Files:
  `/home/user/gtv/songs/tuning/tab.pdf`, `post.txt`.
- **Match** (verse x2, 40 events, recording 1 to 41 s, subsequence DTW): mean chroma cosine **0.810** as tab
  against **0.683** for the same frets in standard tuning (what a tool that assumes standard tuning would write),
  0.641 a semitone up, 0.662 a semitone down. The extra drop of string 1 (C4 rather than D4) cannot be told by chroma
  (0.810 against 0.808); the composer states it in both the tab and the post. The creators scout's check: 0.841
  against 0.658 at standard pitch. Onsets: the detector finds many more onsets (130 in 40 s) than tab events, so
  counting per bar is not meaningful without the alignment.
- **Crop**: none needed; full frame 2304x1296.
- **Best segment**: **25 to 55 s**, an estimate (a verse pass lasts about 9 s, the first chorus starts near 37.5 s):
  the last verse passes into the first chorus, so both chord families and all six strings. Stage 2 should confirm it once the truth is aligned.
- **How well known**: unknown, composed in December 2025.
- **Rights, notable**: his own composition, nothing third-party. The tab sits in the site's "Free TABs" category
  behind a paywall plugin and its link came from the site's public WordPress API, not from the page; a free account
  on the site, or a word with Evan Handyside, settles it before the tab is shown.

## standard: *Imagine*, Gareth Evans (pick)

- **Title**: Imagine (John Lennon, 1971), solo fingerstyle arrangement by Gareth Evans.
- **Performer / arranger / tab maker**: Gareth Evans.
- **Source page**: https://archive.org/details/gareth-evans_202101, file
  `20161014_Imagine - John Lennon _ Free Guitar Tabs_wEtU5g9RNwQ_[1920x1080].mkv` (YouTube wEtU5g9RNwQ, 2016-10-14).
- **Licence / terms as stated**: none in the archive item; YouTube standard licence on the original.
- **Credit line**: "Imagine (John Lennon), fingerstyle arrangement, tab and performance by Gareth Evans
  (goliathguitartutorials.com). Video from his YouTube channel, via the Internet Archive."
- **Video**: VP9 1920x1080, 50 fps, 220.16 s, Opus 48 kHz stereo, 3.4 Mb/s. Elixir card to 21 s, music 21.0 to
  198.0 s, end card (with the title) after.
- **Camera**: one static close-up from the soundhole to the nut, both hands; a different session from the capo pick
  (another shirt and backdrop, same player and camera style). The "GoliathGuitar tutorials.com" logo sits top right
  over the black background.
- **Tuning / capo**: standard, no capo (his lesson data: "Tuning Standard, Capo No capo").
- **Tab**: his Guitar Pro tab on screen, strip rows 743 to 1080 (1920x337 px), digits about 22 to 25 px tall,
  readable; rhythm, H/P, wrist thumps, cursor and bar highlight. **56 bars on 14 pages**, 21.0 to 198.0 s (final
  double bar at bar 56); about 75 bpm, 4/4. GP + PDF sold on PaidTabs. Files: `/home/user/gtv/songs/standard/tab_pages/`, `tab.png`.
- **Match** (bars 1-8, 124 notes in 73 events, recording 21.6 to 46.9 s): frame chroma cosine **0.867** as tab
  (lag -0.02 s) against 0.404 with a capo 2 reading, 0.429 a semitone up, 0.410 down; per bar 0.90 to 0.97, mean
  **0.939** against 0.456. Events per bar, tab against onsets: 8/5, 9/7, 8/4, 9/7 (the soft let-ring intro is
  under-detected), 11/10, 9/10, 10/8, 9/10. The archive scout's check of bars 1-4: 0.852 against 0.427 and 0.415.
- **Crop**: x 0, y 0, w 1920, h 648 (size 1920x648), plus a black box over the logo at x 1425, y 0, w 495, h 205
  (logo pixels in rows 17 to 199, columns 1432 to 1885). Both hands and the fretboard to the nut stay whole; the
  thumb can touch the box's lower left corner. Rows 648 to 743 are a logo banner, 743 to 1080 the tab. Cut 0 to 21 s
  and 198 s to the end.
- **Best segment**: **21.0 to 51.0 s** (bars 1-9): the intro (C, Cmaj7 and F/C arpeggios with the A-A#-B hammer-on
  line) and verse 1 (melody on string 3 with pull-offs), strings 2 to 5, no percussion yet. Bars 1-8 are already
  read and timed (`_selector/checks/standard/as_tab.mid`, t = 0 at 21.30 s).
- **How well known**: one of the best-known songs there is; a model knows its chords (C, Cmaj7, F). The voicings
  and fingering are his.
- **Rights, notable**: a cover of a major-label composition (John Lennon); third-party mirror; tabs now sold.

---

## Backups

### capo backup: *Stitches* (Shawn Mendes), Gareth Evans

Same archive item, file `20160311_Stitches - Shawn Mendes _ Free Guitar Tabs_7fp3qaKFSBc_[1920x1080].mkv`
(YouTube 7fp3qaKFSBc, 2016-03-11); VP9 1920x1080, 25 fps, 247.58 s, Opus 48 kHz (ffprobe here). Same camera
set-up, **capo 1** visible, standard tuning; his Guitar Pro tab on screen (32 pages of 4 bars, music 0:18 to 3:43).
Crop x 0, y 0, w 1920, h 556. Match (archive scout, bars 25-28): 0.804 at capo 1 against 0.481 without. Very famous
(2015); major-label composition; mirror. Credit: "Stitches (Shawn Mendes), fingerstyle arrangement, tab and
performance by Gareth Evans (goliathguitartutorials.com). Video via the Internet Archive." File:
`/home/user/gtv/candidates/archives/ge-stitches/stitches_tabvideo.mkv`. Why backup: same truth kind as the pick,
smaller capo offset. Segment: 57 to 87 s (starts at the bars the scout checked).

### tuning backup: *Closer* (The Chainsmokers), Gareth Evans

Same archive item, file `20161117_Closer - The Chainsmokers _ Free Guitar Tabs_pU-Xcvnn2w8_[1280x720].mkv`; VP9
1280x720, 50 fps, 280.58 s (ffprobe here). Tuning **E2 A2 D3 G3 A3 D4** (MIDI 40 45 50 55 57 62) **plus capo 1**,
both stated in his description and lesson data; on-screen Guitar Pro tab with rhythm (tempo 95), harmonics,
tapping, wrist thumps; music 0:14 to 4:16. Crop x 0, y 0, w 1280, h 404. Match (archive scout, bars 1-4): 0.737 in
E A D G A D + capo 1, 0.286 without the capo, 0.593 read in standard tuning; a harmonic test confirms string 2 at A.
Very famous (2016); major-label composition; mirror. File: `/home/user/gtv/candidates/archives/ge-closer/closer_tabvideo.mkv`.
Why backup: a rhythm truth, if the pick's handwritten tab cannot be aligned. Costs: it also has a capo, it is 720p,
and it would make Gareth three of three. Second alternative: Evan Handyside's *Supergirl Suite* (same D G C F A C
tuning, handwritten tab, 2304x1296, 142 s, `/home/user/gtv/candidates/creators/handyside-supergirl/`). Segment:
14.4 to 44.4 s.

### standard backup: Scarlatti, *Sonata in D minor K. 1, L. 366*, Ana Vidovic

- **Source**: https://archive.org/details/ana-vidovic-plays-domenico-scarlatti-sonata-in-d-minor-k.-1-l.-366-siccas-guitars-1
  (uploaded 2020-10-26 by a third party), a copy of the Siccas Guitars YouTube video QYfnN_KamBc. No licence stated.
- **Video**: H.264 1280x720, 25 fps, 196.97 s, MP3 48 kHz, **0.48 Mb/s** (soft). A multi-camera edit: wide shots of
  her in a guitar shop and close-ups of both hands and the fretboard, with cuts. Letterboxed: picture x 0, y 82,
  w 1280, h 612; the bottom bar carries the Siccas Guitars and OhGuitar.com logos (cropped away by that rectangle).
- **Tuning / capo**: standard, none. Classical guitar.
- **Truth**: GAPS `139_FD1wc` (split: none, so not in the training data of guitar-gaps.pth or Guitab): MusicXML with a
  TAB part (658 notes with string and fret) and a MIDI aligned to this performance (1314 notes, repeats played).
  Fingering is the classclef.com editor's, not hers. Downloaded from Hugging Face to
  `/home/user/gtv/candidates/archive-gaps/vidovic-k1/` (`139_FD1wc.xml`, `.mid`, `.wav`).
- **Match** (the datasets scout's scripts, first 60 s): every tab note is in the MIDI (658/658); pitch present for
  0.882 of 484 MIDI notes with the guitar 30 cents flat, against 0.076 and 0.029 for a score a semitone off; onset
  rise 2.98 at the MIDI times against 1.95 and 0.99 when shifted (a peak, weaker than the best GAPS pieces). GAPS
  rates the alignment 0.66.
- **Credit**: "Ana Vidovic plays Domenico Scarlatti, Sonata in D minor K. 1 (video: Siccas Guitars, via the Internet
  Archive). Tab: classclef.com edition, via the GAPS dataset (Riley et al., ISMIR 2024)."
- **Rights**: public-domain composition; a dealer's promotional video mirrored by a third party; the three GAPS
  licence statements conflict (Zenodo CC BY-NC-SA 4.0, Hugging Face MIT, project page: no publishing without
  permission). Core classical repertoire: a model may know the notes, not this fingering.
- **Why backup and not the pick**: a third player with the best kind of truth, but no steady camera, 720p at a low
  bitrate, and editorial fingering. Segment: 16.7 to 46.7 s (the checked window starts at the first note, 16.7 s).

## Rights in one paragraph

Notable: both Gareth Evans picks (and both of his backups) are covers of major-label compositions (One Direction,
John Lennon, Shawn Mendes, The Chainsmokers), taken from a third-party Internet Archive mirror of his YouTube
channel with no licence, and his tabs are now sold. Evan Handyside's piece is his own composition; only the way the
tab PDF was reached (a paywalled site's public API) is worth a word with him. Nothing here is under an open licence;
the one open-licensed option (Culture Vannin, CC BY 3.0) could not be downloaded.
