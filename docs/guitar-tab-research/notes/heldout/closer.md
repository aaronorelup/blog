# Held-out slot `closer`: *Closer* (The Chainsmokers), Gareth Evans, E A D G A D + capo 1

Lane H of the NOTES session, 2026-11-27. This record covers **fetch and prepare only** (task steps 1-4): the files,
the cut, the time base, the tuning and capo checks, the rights note and the credit line. The key (two readings of the
tab, notes timed to the recording, `conf`, the independent check) is later work and will be added below. Work folder
(not in git): `/home/user/gtv/work/heldout-closer/` (`PROGRESS.md`, `bin/`, `logs/`, `frames/`, `checks/`,
`tabfix/`). Every number below comes from a file named next to it. No note transcriber was run on this recording in
this step: the checks use only the raw audio (onset strength, CQT, chroma), FluidSynth renders of the tab, the
playback cursor and the picture.

## Source and credit

- *Closer* (The Chainsmokers feat. Halsey, 2016), solo fingerstyle arrangement, tab and performance by **Gareth
  Evans** (goliathguitartutorials.com, "Goliath Guitar Tutorials"). Steel-string acoustic (his description: Fylde
  Falstaff, Elixir strings, a wooden capo), E A D G A D tuning, capo on fret 1.
- Video: his YouTube upload "Closer - The Chainsmokers | Free Guitar Tabs" (YouTube id pU-Xcvnn2w8, 2016-11-17),
  via the Internet Archive item `gareth-evans_202101` ("Gareth Evans Youtube Channel", an archive of his channel,
  collections mirrortube and social-media-video): https://archive.org/details/gareth-evans_202101 , file
  `20161117_Closer - The Chainsmokers _ Free Guitar Tabs_pU-Xcvnn2w8_[1280x720].mkv` (with its `.description` and
  `.info.json`). The archive scout found it (`../../video/candidates-archives.md`, section b1); it was the `tuning`
  slot's backup in AO-082 (`../../video/SONGS.md`).
- The tab is his Guitar Pro tab drawn on screen under the hands, with rhythm, bar numbers, a moving blue cursor and a
  yellow bar highlight. Tempo 95 (written).
- **Credit line:** "Closer (The Chainsmokers), fingerstyle arrangement, tab and performance by Gareth Evans
  (goliathguitartutorials.com). Video from his YouTube channel, via the Internet Archive."

## Rights note

- **Licence as stated: none.** The archive item states no licence and is a third-party mirror, not his own upload;
  the mirror's `info.json` has `license: None`. The YouTube original carries the standard YouTube licence.
- **The composition is a major-label hit** (The Chainsmokers, 2016); the arrangement, its voicings, harmonics,
  tapping and percussion are his. A model may know the song's key and chords, not this arrangement.
- **The tab's terms.** When the video was made the tab was free ("Download the Free Tabs and watch Guitar lesson (100%
  Free)" in the description). Today the lesson page (goliathguitartutorials.com/lessons/closer) shows "Tuning EADGAD,
  Capo 1st fret", "Expert", asks for a free account to watch the lesson, and links two shops for printable tabs:
  MyMusicSheet and PaidTabs (PaidTabs: Guitar Pro + PDF, $7.99, "E A D G A D, Capo 1st fret, 95 Bpm"). No account
  was made and nothing was bought: **the key will be read off the video's own tab strip**, as AO-082 did for *Steal My
  Girl* and *Imagine*. No reuse terms are stated anywhere for the tab images.
- Same standing as the AO-082 picks by the same player (`../../video/SONGS.md`, "Rights in one paragraph"): fine for
  research and for scoring; before the film or the post shows his tab or his video, the credit line goes with it, and a
  word with him settles anything more.
- **Training-set check (not done in this step):** GuitarSet and GOAT are recordings made for those datasets and GAPS
  and the Leduc set are classical repertoire, so a 2016 YouTube pop-cover video is unlikely to be in any of them; the
  key builder checks their track lists.

## Files

All under `/home/user/gtv/songs/closer/` (not in git). SHA-256 prefixes from `sha256sum`.

| file | what |
|---|---|
| `video.mkv` | the download, 63,347,413 bytes, MD5 `15aaea79e8fc...` = the archive's MD5 (SHA-256 `98ecf9028e71...`). VP9 1280x720, 50 fps (video pts 0.007 + 0.02 k), 280.581 s; Opus 48 kHz stereo (pre-skip 312 samples, first packet pts -0.007). Metadata carries the YouTube title, URL and description |
| `video.description`, `video.info.json` | the archive's copies of the YouTube description and the yt-dlp metadata (as downloaded) |
| `audio.wav` | the whole audio of `video.mkv`, 44.1 kHz 16-bit stereo (the reference for the time base, as AO-082's `audio.wav`) |
| `tab_pages/page_01.png` ... `page_24.png`, `tab_pages/pages.json`, `tab.png` | **the tab source**: the on-screen tab strip (rows 467-720, 1280x253), one frame per screen of 4 bars, 96 bars on 24 screens, with the screen times (video.mkv time, +-0.25 s); `tab.png` = the 24 screens stacked |
| `closer.mp4` | what the tools and any blind run get: the cut below, **cropped to 1280x400 from the top** (logo banner from row 403 and tab strip from row 467 gone; nothing else is laid over the picture), x264 crf 16 (preset medium, GOP 100 = 2 s, yuv420p), Opus audio copied, metadata stripped. 12,316 frames, 246.32 s (SHA-256 `5097044ee274...`). gtr-run r1316 |
| `closer.full.mp4` | the same cut, uncropped 1280x720 (banner and tab strip visible) (`c1a1ddcdc207...`) |
| `closer.wav`, `closer.mono.wav` | from `closer.mp4`: 44.1 kHz 16-bit, stereo and mono, 10,861,875 samples = 246.301 s (`e27a77e34928...`, `7657f0d99184...`) |

Scripts (`/home/user/gtv/work/heldout-closer/bin/`): `encode.sh` (the cut), `tab_pages.py` (the AO-082 selector's,
copied), `synth_check.py` (the selector's), `chroma_match.py` and `cursor_track.py` (the archive scout's), and new
`rms.py`, `fine_rms.py`, `rows.py`, `staff_lines.py`, `frame_match.py`, `xcorr_offset.py`, `pitch_profile.py`,
`string_test.py`.

## The cut (step 2)

One static close-up from the soundhole to the nut, one take: no scene change above 0.08 between 14.0 and 260.3 s
(`logs/scenes.txt`); the guitar itself shifts about 10-15 px around 200-210 s (the player moves it; no cut). No
talking, no lesson part, no caption over the hands; a logo banner (Elixir, Subscribe, Free Tabs & Lesson, patreon,
Extras) sits across rows 403-466 all through and the tab strip below it. Contact sheets `frames/sheet_5s.jpg`
(original), `frames/closer_mp4_sheet.jpg` (the cropped cut).

- **Title card** (black, "Closer - The Chainsmokers, Fingerstyle Solo Guitar, Arranged and Tabbed by Gareth Evans",
  the legend, tuning and capo) to the frame at 12.587 s; hard cut to the playing shot on the frame at 12.607 s
  (`logs/yavg_start.txt`, `frames/start_12.jpg`). The audio is digital silence until 13.25 s, room noise at about
  -60 dBFS after, **first pluck at 14.51 s** of `audio.wav` (`bin/fine_rms.py`); the cursor and highlight appear at
  14.4 s.
- **End card** (black with the GoliathGuitar logo and outro music): hard cut on the frame at **260.307 s**
  (`logs/yavg_end.txt`, `frames/end_255.jpg`). Last attack about 256.0 s (the final strum of bar 96), ringing down
  to -64 dBFS by 259.5 s; the performance audio ends at 260.355 s of `audio.wav` (digital silence 260.36-260.38 s),
  the end card's music starts at 260.39 s.
- **Played range = the whole performance:** `ffmpeg -ss 14.0 -t 246.30 -i video.mkv` (`bin/encode.sh`): 0.5 s of
  room noise before the first pluck, all 96 bars, the full ring-out, and nothing of the end card (the cut's last frame
  is the last frame of the playing shot, its audio ends 0.1 s before the end card's).

**Time base** (`bin/xcorr_offset.py`, `logs/timebase.log`; `bin/frame_match.py`):
- **`closer.wav` sample 0 = 13.992494 s of `audio.wav`** (sample-exact cross-correlation of 5 s pieces at 1, 100,
  200 and 240 s of the cut: the same value at all four, correlation 0.9994-0.9998). `audio.wav` sample 0 is the first
  decoded sample of `video.mkv` (its pts after the Opus pre-skip, about 0.000 s), so `t_closer = t_audio.wav -
  13.9925` and, to within 1 ms, `t_closer = t_video.mkv - 13.9925`. AO-082's `capo.wav` has the same kind of offset
  (17.9925 s for `-ss 18.0`).
- **Video:** `closer.mp4` frame 0 and frame 1 both show `video.mkv`'s frame at 14.007 s (the encoder doubled the first
  frame); frame n (n >= 1) = `video.mkv` frame 13.987 + 0.02 n s, checked at frames 1, 2, 50, 6000 and 12315 (mean
  grey-level difference 0.13-0.23 against more than 0.5 for the neighbours). Last frame (12315) = 260.287 s, the last
  frame before the end card. So the picture at time t of `closer.mp4` was filmed at `video.mkv` 13.987 + t while the
  sound at t is 13.9925 + t: an audio-video offset of 5.5 ms (a quarter of a frame), recorded as 0.
- First onset of `closer.wav` (librosa onset detection on the raw audio): 0.546 s; last: 241.998 s
  (`logs/tuning_offset.log`).

## Tuning and capo (step 3)

**E A D G A D, capo on fret 1**: `tuning_midi` 40 45 50 55 57 62 (string 6 to 1), `capo` 1, sounding open strings F2
A#2 D#3 G#3 A#3 D#4. Tuning offset about **+1 cent** (`librosa.estimate_tuning` on `closer.mono.wav`, +1.0 in each
minute; `logs/tuning_offset.log`). Confirmed four ways:

1. **Stated** in five places: the description ("Tuning: EADGAD", "Capo on 1st fret"); the title card's legend
   (frame at 12.0-12.4 s); the tab itself ("Capo. fret 1" over bar 1, `tab_pages/page_01.png`); the lesson page
   ("Tuning EADGAD", "Capo 1st fret"); the PaidTabs listing ("E A D G A D, Capo 1st fret and 95 Bpm").
2. **Chroma at all 12 shifts**, two screens with fretted notes, read off the tab by eye (string, fret, x position;
   `checks/spec_p06.json`, `checks/spec_p21.json`):
   - The archive scout's method (`bin/chroma_match.py`, mean CQT chroma of the window against the tab's pitch classes):
     bars 21-24 (65.0-75.0 s of `video.mkv`, 47 notes) **shift 0 0.874**, -1 0.282, +1 0.320, next best 0.741 (+5).
     Bars 81-84 (216.5-226.75 s, 72 notes): shift 0 0.742, best 0.810 at +5 (`checks/chroma_match.txt`): pitch-class
     counts alone do not settle this screen, as the scout found for bars 1-4 (0.737 against 0.754 at -5).
   - The AO-082 selector's method (`bin/synth_check.py`: the tab notes timed by the blue cursor, rendered with
     FluidSynth steel guitar, frame-by-frame chroma cosine, best lag within +-0.46 s), the stated tuning against no
     capo, capo 2, standard tuning with capo 1, D A D G A D with capo 1 and all 11 other shifts
     (`checks/p06/result.json`, `checks/p21/result.json`; gtr-run r1313, r1315):

     | reading | bars 21-24 frame / bar-mean cosine | bars 81-84 frame / bar-mean cosine |
     |---|---|---|
     | **E A D G A D, capo 1 (as stated)** | **0.836 / 0.941** | **0.780 / 0.891** |
     | same, no capo (= shift -1) | 0.353 / 0.444 | 0.412 / 0.515 |
     | same, capo 2 (= shift +1) | 0.418 / 0.497 | 0.417 / 0.517 |
     | standard tuning, capo 1 | 0.690 / 0.786 | 0.783 / 0.896 |
     | D A D G A D, capo 1 | 0.836 / 0.941 (no string 6 on this screen) | 0.520 / 0.679 |
     | best other shift | 0.695 / 0.879 (+5) | 0.547 / 0.683 (+5) |

     The capo (1, not 0 or 2) is clear on both screens; string 6 at E (not D) on bars 81-84; strings 1 and 2 (A D, not
     B E) on bars 21-24. Bars 81-84 cannot tell E A D G A D from standard because every open-B-string note there is
     masked by a C4 (string 4 fret 9) that rings at the same time. Best lag: +0.05 s on bars 21-24, -0.21 s on bars
     81-84: the cursor is not locked to the playing (as on *Steal My Girl*), so for the key it can only seed the
     alignment.
3. **Per-note pitch at known times** (`bin/string_test.py`, `checks/string_test.txt`; CQT level 40-240 ms after each
   cursor time, at the pitch each tuning gives): the open second string in bars 21-24 is **A#3 (A + capo), louder
   than C4 (B + capo) at 16 of 16 notes, median +31.6 dB**; in bars 81-84 the first string at fret 5 is G#4 (D + capo
   + 5) and not A#4 at 4 of 5 notes (+6 to +25 dB; the fifth and the fret-7 and fret-9 notes are masked by the ringing
   C4/C5). In bars 1-4 (12th-fret harmonics on strings 1-3), the window's pitch spectrum has A#4 at -18.4 dB against
   C5 at -29.1 dB (`bin/pitch_profile.py`).
4. **Frames**: at 230.0 s of `video.mkv` (216.0 s of the cut) the fretting hand is off the low frets and the wooden
   capo sits right behind the first fret wire with the bone nut at the picture's right edge (`frames/full_230.png`,
   zoom `frames/nut_zoom_230.png`). The inlays count the same way: a single dot two fret spaces below the capo's wire
   (fret 3), a double dot at fret 5, single dots at 7 and 9, a triple at 12 (`frames/cmp_200_210_150_230.png`,
   `frames/full_20.png`). Not mirrored: string 6 is the top edge of the neck, the nut is on the right.

## The tab (for the key builder)

- 96 bars in 4/4, 4 bars per screen, 24 screens (`tab_pages/pages.json`; screen times in `video.mkv` time, subtract
  13.9925 for the cut). Sections as labelled on the tab: Intro bar 1 (cut ~0.5 s), Verse 1 bar 5 (~10.5 s), Bridge 1
  bar 13 (~30.8 s), Chorus 1 bar 21 (~51.0 s), Verse 2 bar 37 (~91.3 s), Bridge 2 bar 45 (~111.5 s), Chorus 2 bar 53
  (~131.8 s), Chorus 3 bar 69 (~172.3 s), Outro bar 93 (~232.8 s). No repeat signs seen; the bars are written out.
- Marks (legend from the title card and the description): H hammer-on, P pull-off, T tapping, S slap, (o) wrist
  thump, XX percussive thumb slap, (lh) left-hand percussion on the fretboard, (cl) finger snap, <12> natural
  harmonic, (15) artificial pinch harmonic; also ties, slides, a rasgueado/arpeggio wave before some chords (bars 17,
  19, 32, 36) and notes in brackets such as "(4)", "(9)" (ghost or tied notes, bars 28, 60, 76). Fret numbers are
  above the capo, so sounding pitch = `tuning_midi` + 1 + fret, and a <12> harmonic sounds an octave above the
  string's capoed open note.
- **Splitting note:** `tab_pages.py` split the screen of bars 73-76 (196.25-206.5 s) into four pieces because of its
  dense marks; they were merged by hand and the later screens renumbered (the automatic output is kept in the work
  folder's `tabfix/`). All 96 bar numbers were checked in order on `tab.png`. The page frame for a screen is taken
  from the middle of its span, so the yellow highlight covers one bar of each image; a reader who needs a clean bar
  takes another frame of the same screen.
- Fret digits are about 12-14 px tall at 720p (half the size of the 1080p *Steal My Girl* strip): legible, but read
  them at 2x zoom.

## What remains (the key)

Two independent readings of the 96 bars, the merge, notes timed to `closer.wav` (cursor-seeded alignment on the raw
audio), `conf` per note, `gtr-eval check-truth`, the independent check by ear and spectrogram, and an audit by an agent
that did not build the key. Truth goes to `/home/user/gtv/truth/closer/closer.truth.json` in the schema of
`capo.truth.json`.
