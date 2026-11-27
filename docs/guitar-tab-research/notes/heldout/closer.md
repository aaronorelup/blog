# Held-out slot `closer`: *Closer* (The Chainsmokers), Gareth Evans, E A D G A D + capo 1

Lane H of the NOTES session, 2026-11-27. The first part of this record covers **fetch and prepare** (task steps 1-4):
the files, the cut, the time base, the tuning and capo checks, the rights note and the credit line. **The key** (the
two readings of the tab compared and merged, notes timed to the recording, `conf`, the builder's own checks) is in
[The key](#the-key) below; the independent check and the audit by an agent that did not build it are still to come.
Work folder (not in git): `/home/user/gtv/work/heldout-closer/` (`PROGRESS.md`, `bin/`, `logs/`, `frames/`, `checks/`,
`tabfix/`; the readers' `read-A*`/`read-B*`; the key builder's `key/`). Every number below comes from a file named next
to it. **No note transcriber was run on this recording, in any step**: the prepare checks and the key use only the raw
audio (onset strength, STFT and CQT, chroma, energy at a note's partials at a known time), FluidSynth renders of the
tab or the key, the playback cursor and the picture.

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

## The key

Built 2026-11-27 by lane H's key builder. Truth: `/home/user/gtv/truth/closer/closer.truth.json` (SHA-256
`bbfc78d24489...`), in the schema of AO-082's `capo.truth.json`. Scripts, logs and outputs:
`/home/user/gtv/work/heldout-closer/key/` (`bin/`, `logs/`, `out/`, `frames/`; progress in the work folder's
`PROGRESS.md`). AO-082's capo scripts were the model (`truth-capo/bin/compare_readers.py`, `cursor_track.py`,
`bar_fit.py`, `align_dp.py`, `build_truth.py`, `tuning.py`; `truth-fix-capo/bin/feat.py`, `retime4.py`), copied and
changed, never edited in place.

### Files

| file (`/home/user/gtv/truth/closer/`) | what |
|---|---|
| `closer.truth.json` | the key; `closer.wav` is a symlink next to it (as for `capo`) |
| `closer.notes.csv`, `.beats.txt`, `.chords.lab`, `.mid`, `.tab.txt` | side files, written by the same build (`key/bin/build_truth.py out/aligned.json -2 out/departures.json`) |
| `closer.tab-merged.json` | the merged reading: reader A's bars plus a `merge` block (SHA-256 `93c5922cb68c...`) |
| `read-A.json`, `read-B.json` | the two readings, copied from the work folder (their notes: `read-A.md`, `read-B.md` there) |

No GP5 was written (not asked for this slot). Two optional note keys go beyond `capo.truth.json`'s notes (`check-truth`
ignores extra keys): `"harmonic": "natural"` on the 222 `<12>` notes and `"legato": "h"` / `"p"` on the 44 hammer-on and
pull-off targets.

### Tuning and capo

- `tuning_midi` 40 45 50 55 57 62 (E A D G A D), `capo` 1: as stated five ways and checked four ways above (step 3).
  Sounding pitch = `tuning_midi[6 - string]` + 1 + fret; a `<12>` natural harmonic has fret 12, the octave of the capoed
  open string (A#4 on string 2, G#4 on string 3).
- `tuning_offset_cents` **-2** (`key/bin/tuning.py`, AO-082's `tuning.py` with harmonics left out; `key/logs/tuning.log`):
  the spectral peak of the harmonic nearest 650 Hz, 60 ms after the onset, of 628 confirmed notes: median -2.1 cents
  (IQR -5.6 to -0.2); per string -0.1 to -7.9 (string 6 the flattest); open strings -3.9, fretted notes -1.4, the
  222 harmonics -3.3. `librosa.estimate_tuning` on the whole file gives +2.2 (+1.0 at its default resolution in step 3).
  A few cents either way do not matter at the scorer's 50-cent tolerance.

### Method

1. **The two readings, compared** (`key/bin/compare_readers.py` -> `key/out/compare.json`, `key/logs/compare.log`).
   Reader A: 767 events, reader B: 763; the 4 extra are the `(cl)` snaps drawn over rests in bars 5, 9, 37 and 41
   (A keeps them as events with no notes, B in `rests`). **1377 of 1377 note heads agree** on bar, position, string,
   fret, X and harmonic (AO-082's capo song: 997 of 1007); 1365 agree on every field, durations, slides and hammer/pull
   targets included. The 12 that differ are conventions, not notes: the tie flag on the hammered s3 4 at bar 27/59/75
   pos 3.5 (A on the note, B on the event), and where the two P marks of bars 28/60/76 sit. Settled from the tab: the
   clean page 7 (`key/frames/p07_b27_28.png`) shows P over pos 0 (arc from the tied `(4)` to s3 0) and over pos 0.5 (arc
   from the tied `(9)` to s4 5); the targets are the same in both readings. Both readers raised the same doubts; the
   recording settles the one that can be heard (bars 13 and 15, Departures). The merged file is reader A plus a `merge`
   block.
2. **Bar times from the cursor** (`key/bin/cursor_track.py`, all 13,973 frames of `video.mkv` decoded from 0 so frame k
   is at 0.007 + 0.02 k s, gtr-run r1323; `key/bin/bar_fit.py` -> `key/out/bar_starts.json`). Page turns = the blue
   cursor jumping back (24 pages; frames where two cursors blend at a page turn dropped); a bar starts on the first frame
   where the cursor passes its bar line (reader A's x positions). The cursor runs at a constant 2.5163 s per bar
   (95.38 bpm, t(bar 1) = 14.384 s of `video.mkv`); the residuals (within +-75 ms) are its redraw steps (it moves every
   3-4 frames). The cursor holds bars 13 and 15 a full 4 beats.
3. **The cursor is not locked to the playing** (as on *Steal My Girl*). The lag that best fits each page's tab events to
   the audio (`key/bin/page_lag.py`: the mean pitch rise of the plucked notes plus the onset envelope, lags -0.6 to
   +1.6 s) grows steadily from +0.14 s on page 1 to +0.99 s on page 24: **the playing runs 0.4 % slower than the
   cursor**, lag(t) = 0.0634 + 0.00399 t s, 23 of 24 pages within 80 ms of that line (page 12, bars 45-48, is ambiguous:
   best +0.16, second +0.47, line +0.53). An onset-envelope-only fit locks onto 8th-note shifts (0.316 s), as AO-082
   found. Cursor + line = the seed.
4. **Event alignment** (`key/bin/align_dp.py`, -> `key/out/aligned_dp_L10.json`): AO-082's monotonic DP over the 767
   events, each within +-0.25 s of its seed, node score = the mean rise of its plucked pitches (46 ms STFT harmonic
   salience, harmonics 1-6, +12..+46 ms against -52..-23 ms, which peaks on an attack) + 4 x the onset envelope;
   hammer/pull-only events weigh the envelope 1, percussion-only events use the envelope alone; tempo penalty
   10 log(gap / written gap)^2. AO-082's penalty of 40 held the bridge's 16th figures on the written grid (this player
   does not keep the written 16ths there).
5. **Every note and tap on its own attack** (`key/bin/refine.py` -> `key/out/aligned.json`). This is where AO-082's first
   capo build went 32-119 ms early, so the choice was made on attacks, not on a rise that is already high before them:
   - an event's attack = the onset-envelope peak (+-90 ms, cut at the midpoints to its neighbours) that maximises the
     mean `rise_to` of its plucked pitches (salience at 0..+12 ms minus its maximum at -52..-23 ms) + 2 x the envelope:
     657 events; 42 events whose pitches rise less than 1 dB anywhere (re-struck ringing notes) take the largest
     envelope peak within +-35 ms, or within the whole window when the event carries an X slap or a thump (the slap is
     then its attack: bar 36 pos 3.0 moved 64 ms earlier onto its slap). Two rejected tries: the DP's 46 ms rise and
     a 23 ms-window rise both picked small bumps 35-90 ms before an attack (21 and 10 events found early), and a
     pitch-flux contrast was noise;
   - 13 chord notes are struck apart from the rest of their event and get their own attack (rise_to >= 6 dB there and
     >= 4 dB more than at the event's attack): the bass 52 ms before the upper notes at bar 5 pos 0, and one note
     29-64 ms after the rest of its chord (strings 2-3 in bars 1, 2, 25, 43, 54, 74, 93-95; strings 5-6 in bars 16, 34
     and 87);
   - the 43 hammer/pull-only events: the steepest rise of (target - origin) salience within +-40 ms;
   - taps: X slaps (117) = the largest envelope peak within 50 ms of the event; (o) wrist thumps (104) = the peak with
     the largest low-band (21-108 Hz) rise of at least 6 dB (96; else the event's attack, 8): 86 thumps coincide with
     their notes, 5 come 25 ms or more before them (bars 33, 85, 89, 91: a body hit 52-64 ms before the bass and the
     harmonic) and 13 after them (bar 14: the chord at 33.199 s, the thump at 33.263 s); (lh) 14 and (cl) 8 = the
     largest envelope peak within 60 ms.
6. **Truth fields** (`key/bin/build_truth.py`, after AO-082's `build_truth.py`): pitch = tuning + capo + fret; X notes
   are taps (`string-slap`), not notes; tie continuations are not notes. Offsets: let ring to the next attack on the same
   string (pitched or X) - 10 ms, at most 2.0 s (**estimates**). Voice by AO-082's rule (highest of strings 1-3, or of a
   T event, = melody; lowest of strings 4-6 = bass; others chord). Beats: the 384 quarter-note positions, interpolated
   between event attacks; downbeats = beat 1 of the 96 bars. Chords derived from the notes per half bar (no chord names
   in the tab); key by Krumhansl-Kessler. `conf`: `tab+audio` = the note's pitch or its octave rises at least 3 dB at
   the onset (the larger of `rise` and `rise_to`); `tab` = not confirmed that way; `audio` = heard, not in the tab
   (one note, `key/out/departures.json`, see Departures).

### Counts

- **The whole performance**: `scored_range` [0, 246.301] s, bars 1-96, first note 0.546 s, last onset 242.649 s
  (bar 96 pos 3.5; the final chord rings to about 245 s).
- **1156 notes**: melody 622, bass 346, chord 188; 222 `<12>` harmonics; 44 hammer/pull targets (h 5, p 39).
  `conf`: **1056 tab+audio, 99 tab, 1 audio**. The 99 `tab` notes are spread over 58 bars; the bars with 3 or more
  are 6, 13, 14, 16, 22, 26, 36, 45, 46, 48, 68 and 92, mostly the same pitch struck again while it rings (s4 5 = G#3 at
  pos 3.0 under an X slap, 11 of 14; the repeated 16th dyad s2 10 + s4 9 of bars 46 and 48; the G#3 16ths of bars 13-16
  on two strings).
- 384 beats, 96 downbeats, tempo 94.83 bpm, 4/4, key Ab major (second: Eb major). Bar lengths 2.415-2.665 s
  (median 2.525).
- 187 chord segments (D#:maj 53, F:min 39, C#:maj 35, G#:maj 29, A#:min 13, others 16, N 2).
- **243 taps**: 117 string-slap, 104 thump, 14 fretboard-tap (lh), 8 snap (cl).
- `gtr-eval check-truth`: **11,965 checks, 0 mismatches** (`key/out/check_truth.json`).
- Side files scored against the JSON (`--no-ledger`, `key/out/eval/side_*.json`): `notes.csv` onset and onset+offset
  F1 1.0; `.mid` onset 1.0 (onset+offset 0.946: same-pitch notes overlapping on different strings, as in AO-082);
  `.tab.txt` 1156/1156 same string and fret; `beats.txt` beats 1.0, downbeats 1.0 (`--downbeat-col 2`); `chords.lab`
  root, majmin, sevenths 1.0.

### Departures from the tab

The recording follows the 96 written-out bars in order, with no repeat or cut, and the readers agree on every note.
**One note was added, none dropped**; the other departures are timing, not pitch:

- **Added, `conf` `audio`: a D#3 (MIDI 51) at 171.880 s, bar 68 pos 3.5** (the last half beat of Chorus 2). The tab ends
  bar 68 with a quarter-note X chord at pos 3.0 and draws nothing after it (`key/frames/p17_b68.png`); the recording has
  an attack there (envelope peak 0.57) where the D#3 salience rises 9.2 dB and a D#3 band sounds until the next
  downbeat (`key/frames/look_b68end.png`). Written as string 4 open (s4 was fretted at 5 since pos 2.5; releasing it
  sounds the open D#3); string 5 fret 5 gives the same pitch, so the string is a guess. The same bar end elsewhere (bars
  36 and 92) has no such note.

- **Bars 13 and 15 are written 3.5 beats long** (both readers) **but played as full 4/4 bars**: bar 13 lasts 2.415 s and
  bar 15 2.566 s (median bar 2.525 s); nothing is played in the last half beat (the X chord rings), as the Guitar Pro
  cursor also does. The key has 4 beats in each.
- **The written rhythm is loose in the bridges** (bars 13-16, 45-48): e.g. in bar 14 the pos-0.25 note comes 0.28 s
  after the downbeat (a written 16th is 0.158 s). The key follows the attacks, not the grid.
- **Notes of one written event struck apart** (13 notes, Method 5), and thumps before or after their notes (18).
- **An audible slide** from s1 7 down to s1 5 about 0.12 s before the written s1 5 in bars 64, 68 and 88 (a short
  glide through A4 in the CQT; the tab writes two plucked notes). Not added as a note.

How departures were looked for, without a transcriber: (a) the onset detections more than 50 ms from every note and
tap, each profiled by its envelope, low-band rise and the pitches whose salience rises there: before the addition 78,
of which the bar 68 D#3 was the one clear low note; after it 75 (`key/logs/unmatched_final.log`): 32 weak with no
rise, 19 high squeaks or clicks (MIDI 83-88, e.g. 123.95 s in bar 49 before the slide-in), 15 body thumps, 9 with a
pitch below MIDI 80 rising 10 dB or more: the three bar 64/68/88 slides above (G#4, envelope 0.35-0.39), four weak
attacks (envelope 0.38-0.49) where only high pitches rise (MIDI 69-77, squeak range), and two broadband hits (222.69 s,
the body hit 58 ms before bar 89's notes; 229.38 s, where MIDI 73-85 all rise together); none is a new note. (b) A
scan of every attack for rising pitches the key does not explain (`key/bin/unexplained.py`) was too noisy to use:
slaps and thumps raise the salience of every pitch;
(c) the per-bar chroma of the key's rendering against the recording (Checks): no bar where a shifted rendering fits
better, and the lowest bars are the sparse percussive ones (bar 49, the lowest with 51, checked by eye: every written
note at its place).

### Checks

| check | result | file (`key/`) |
|---|---|---|
| onset detector (librosa `onset_detect`, mel flux, hop 256, default peak picking) on `closer.wav` vs the key's onset groups | note groups with a plucked note: **0.948 within 50 ms** (713); hammer/pull-only 0.837 (43, no attack to detect); tap-only 0.909 (55); taps 0.967; median detection minus key -5.8 ms; per 10 s 0.78 (30-40 s: soft G#3 16ths) to 1.00. The groups with no detection within 50 ms are mostly soft notes whose pitch rises at the key time (`rise_to` up to 12.6 dB, under the detector's threshold) and thumps inside a ringing chord | `logs/validate_truth2.log`, `out/validate_truth2.json` |
| early fault (AO-082 capo): an envelope peak 30-160 ms later, >= 1.8 x the envelope at the key time, with >= 2 dB gain of the note's pitch | **0** (the first refinement had 21, the 23 ms-rise version 10) | same |
| late check: a peak 25-80 ms earlier, >= 1.5 x, with a >= 3 dB rise of the pitch | 4: bar 7 pos 0 (a 0.93 peak 41 ms before the chord, where the bass starts; inside 50 ms), bar 7 pos 0.5 (41 ms), bar 91 pos 0 (the body hit 58 ms before bass + harmonic, by design), bar 92 pos 0.5 (35 ms) | same |
| FluidSynth renders of the key (FluidR3_GM, program 25 steel and 24 nylon, `tools/bin/notes2wav.py`), the same onset detector on render and recording | the detector finds 86.9 % (steel) / 99.6 % (nylon) of the key's 756 onset times in the render, median +23 / +17 ms (FluidSynth's attack); where both detect, recording minus render -23.2 ms median, IQR -29.0..-23.2 / -23.2..-17.4; **bias removed, 7 of 631 / 7 of 711 more than 30 ms apart, 1 / 0 more than 50 ms** (the one: 10.61 s, bar 5's upper notes 52 ms after its bass) | `logs/synth_check_p25.log`, `_p24.log` (renders deleted after the check; `tools/bin/notes2wav.py <truth> <wav> --program 25 --duration 246.301` remakes them) |
| the same renders, CQT chroma | frame cosine 0.796 (steel) / 0.770 (nylon); bar-mean cosine **0.882** / 0.862, against 0.558 / 0.533 with every pitch a semitone down (capo 0) and 0.596 / 0.563 a semitone up (capo 2); **no bar where either shift fits better**; lowest bars 51 (0.66), 49 (0.69), 41, 9 (sparse, percussive) | `out/synth_check_p25.json`, `_p24.json` |
| per-note pitch at the partials (8192-point FFT from onset + 30 ms, harmonics 1-8 within +-30 cents, against the louder free neighbour semitone) | own pitch >= 3 dB above its neighbours for **86 %** of the 1156 notes (median +10.6 dB): harmonics 100 %, strings 1-3 95-97 %, string 4 85 %, string 5 90 %, string 6 26 % (a semitone is 5 Hz at F2 and the body resonance sits there). 23 notes have a neighbour louder; listed in the log, e.g. s4 4 = G3 at bar 38 and bar 42 pos 3.5 (G#3 louder: G#3's 3rd partial is D#3's 4th and D#4's 2nd, both in the chord) and 4 of the bar-46 16ths s2 10 (G#4) | `logs/pitch_check.log`, `out/pitch_check.json` |
| 20 random notes (seed 2026), CQT slices and rises | all 20 rise 2.5-24.2 dB at the onset (`rise_to`), pitch margin +1.1 to +28.3 dB; by eye each starts at its line (3 `<12>` harmonics, 3 pull-off targets, strings 2, 3, 4 and 6) | `frames/handcheck_spec.png`, `out/handcheck.json` |
| alignment stability | DP window +-0.35 s or penalty 20: **0 of the 1155 tab-note onsets change**; penalty 40 (AO-082's): 4 notes in bars 13-14 by up to 174 ms. Kept: at 31.556 s G#3 rises 6.4 dB, at the penalty-40 alternative 32.055 s it does not (an A#3 is damped there) | `logs/stability.log` |
| hand position in the picture | not used: at 720p the strings cannot be told apart at the hands' scale (`frames/b14_frames.png`) | |

### What remains uncertain

- **Offsets** are a let-ring rule, not measured: score onsets; onset+offset only as a hint.
- **99 `tab` notes** have no 3 dB rise at their onset, mostly re-struck ringing pitches (see Counts). Whether every one
  of them is struck cannot be told from the sound; the 16th dyads of bars 46 and 48 are the least sure.
- **Same-pitch 16ths on two strings** (G#3 = s3 0 = s4 5, bars 13-16): their order follows the tab; the pitch cannot
  say which string sounded.
- **Within-event timing**: 13 notes and 18 thumps were split from their event by rule; a few chords (bar 7 pos 0) start
  with the bass about 40 ms before the rest and were left together (inside 50 ms).
- **The added D#3 of bar 68**: its pitch and time are heard; its string (4 open or 5 fret 5) is not.
- **The 23 notes** whose free neighbour semitone is louder at the partials (Checks) are kept as the tab writes them; most
  are explained by shared partials, not checked further.
- **Voices, chords and key are derived** by rule, not given by the tab. **Taps**: kinds follow the legend; `lh` and `cl`
  times are envelope peaks near the written position.
- **Not done here**: the independent check by an agent that did not build the key, and its audit.
