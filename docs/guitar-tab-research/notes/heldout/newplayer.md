# Held-out slot `newplayer` (H = `boats`): *Three Little Boats* (Manx trad.), Pete Lumb, standard tuning, no capo

Lane H of the NOTES session, 2026-11-27. This record covers **fetch and prepare only** (task steps 1-4): the files,
the cut, the time base, the tuning and capo checks, the rights note and the credit line. The key (two readings of the
tab, notes timed to the recording, `conf`, the independent check) is later work and will be added below. The slot's
slug is **`boats`**: files `/home/user/gtv/songs/boats/boats.*`, key to `/home/user/gtv/truth/boats/`. Work folder (not
in git): `/home/user/gtv/work/heldout-newplayer/` (`PROGRESS.md`, `bin/`, `logs/`, `frames/`, `checks/`, `tab/`). Every
number below comes from a file named next to it. No note transcriber was run on this recording in this step: the
checks use only the raw audio (onset strength, CQT, chroma) and the picture.

**A new player.** Pete Lumb, the presenter and teacher of Culture Vannin's guitar lessons, playing a nylon-string
classical guitar, is neither Gareth Evans nor Evan Handyside. It is the only held-out song under an open licence (the video is CC BY). The tab is the
lesson's own sheet (notation and TAB with rhythm), arranged by James Franklin, not by the player; the lesson teaches
from it.

**Not unseen.** 18 s of this recording (the slow play-through, video 222-240 s, here `boats` 8.0-26.0 s) were AO-082's
research clip **R3c** (`../../inputs/R3c/R3c.truth.json`, no key). Basic Pitch (r0264), MediaPipe and RTMPose hands
and chain D ran on it, and a frame of it is in the AO-082 post. No key was ever made for it, so no tool or rule was
tuned on its notes. Anyone scoring on `boats` should still keep this overlap in mind.

## Source and credit

- *Three Little Boats*, traditional Manx tune, arranged for guitar by **James Franklin**, played and presented by
  **Pete Lumb**, in "Manx Guitar Lesson: Three Little Boats", produced by **Culture Vannin** (the Manx Heritage
  Foundation) in 2019, one of its series of 19 Manx guitar lessons. Classical guitar, nylon strings, played with the
  fingers; standard tuning, no capo.
- Video: Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm
  ("A guitar tutorial of how to play the traditional Manx tune, 'Three Little Boats' ... This film is presented by Pete
  Lumb. It is produced by Culture Vannin, in order to promote and support Manx music. This film was produced by
  Culture Vannin in 2019."). It was copied from Culture Vannin's YouTube upload (id If24Iy2uKRg) with video2commons.
  The file used is **Commons' own VP9 1080p transcode** of it, the same file as AO-082's R3c source. The uploaded
  original (AV1, 35,745,997 bytes) answered HTTP 429 with `retry-after: 600` at every try (01:29 and 01:39 UTC) and
  was not obtained.
- Tab: `Three Little Boats - Guitar - J Franklin.pdf`, linked from the Commons description ("Tab available here") and
  from Culture Vannin's "Manx guitar lessons" page (culturevannin.im, Watch & Listen, Videos, "Manx guitar lessons":
  "All sheet music (including tab) is free to download via the links below each video"). One A4 page, 2019 (Acrobat
  Distiller, text layer present): "Three Little Boats, Manx trad, arr. James Franklin", "Lively", 6/8, A minor,
  chord names, notation and TAB with rhythm and left-hand fingering, "CI" barre marks, footer "Culture Vannin &
  individual composers © 2019". No login and no purchase were needed.
- **Credit line:** "Three Little Boats (Manx traditional), arranged by James Franklin, played by Pete Lumb. From
  'Manx Guitar Lesson: Three Little Boats' (2019) by Culture Vannin, via Wikimedia Commons, CC BY 3.0."

## Rights note

- **Video: CC BY.** The Commons file page carries `{{YouTube CC-BY|Culture Vannin}}`, shown as "Creative Commons
  Attribution 3.0" (`LicenseShortName` "CC BY 3.0", `Attribution` "Culture Vannin"; AO-082 quoted it as "This file is
  licensed under the Creative Commons Attribution 3.0 Unported license. Attribution: Culture Vannin"). Its licence
  review (2026-10-19) notes "licence=CC-BY 4.0", released by the creator on YouTube. Either way the terms are the
  same for our use: attribution to Culture Vannin, changes marked (our cut and the boxes are changes).
- **Composition:** traditional, public domain. **Arrangement:** James Franklin's, "Culture Vannin & individual
  composers © 2019".
- **Tab's terms:** free download, no licence stated on the PDF or the page. The CC licence covers the video file, not
  the PDF. Fine for research and for scoring. If the film or the post shows the tab sheet itself, the credit line
  goes with it, and a word with Culture Vannin settles anything more.
- **Training-set check (not done in this step):** GuitarSet (2018) and GOAT are recordings made for those datasets,
  and GAPS and the Leduc set are classical repertoire. A 2019 Manx lesson video is unlikely to be in any of them. The
  key builder checks their track lists.

## Files

All under `/home/user/gtv/songs/boats/` (not in git). SHA-256 prefixes from `sha256sum` (`logs/files.tsv`).

| file | what |
|---|---|
| `video.webm` | the download as served: Commons' `...webm.1080p.vp9.webm` transcode, 51,075,480 bytes (MD5 = the server's ETag `cd425c76b459...`; SHA-256 `80c2bbb27387...`). VP9 1920x1080, 25 fps (container pts 0.04 k), 292.84 s; Opus 48 kHz stereo (pre-skip 312, first packet pts -0.006) |
| `commons_api_info.json`, `commons_file_description.wikitext` | the Commons API record (file info, licence metadata, derivatives) and the file page's wikitext, as downloaded |
| `audio.wav` | the whole audio of `video.webm`, 44.1 kHz 16-bit stereo (the reference for the time base) |
| `tab_source/Three Little Boats - Guitar - J Franklin.pdf` | **the tab source** as downloaded (107,066 bytes, `428fb4ca4065...`), with `tab_source/culturevannin_manx-guitar-lessons-606045.html` (the page that links it). `tab.png` = the page at 200 dpi; 300 dpi crops of the four systems in the work folder's `tab/` |
| `boats.mp4` | what the tools and any blind run get: the cut below, full frame 1920x1080, **black boxes over the two section captions and over the end card's logo while it cross-fades in** (see the cut), x264 crf 16 (preset medium, GOP 50 = 2 s, yuv420p), Opus audio copied, metadata stripped. 1677 frames, 67.08 s (`248ce0ffb778...`). gtr-run r1319 |
| `boats.full.mp4` | the same cut, no boxes (captions and logo visible) (`a61caf0239a3...`) |
| `boats.wav`, `boats.mono.wav` | from `boats.mp4`: 44.1 kHz 16-bit, stereo and mono, 2,958,846 samples = 67.094 s (`3d9bace14afa...`, `7cd121a4dedd...`) |

Scripts (`/home/user/gtv/work/heldout-newplayer/bin/`): `commons_fetch.sh` (one request at a time, honouring
Retry-After), `encode.sh` (the cut), `sheet.py`, `spec_png.py`, `bass_png.py`, `framediff.py`, `strip.py` (looking),
`xcorr_offset.py` and `frame_match.py` (copied from the `closer` lane), `tuning_check.py` (the archive scout's chroma
match plus a bass-register profile), `pitch_at.py`, `bass_onsets.py`, `partials_rise.py` (per-pitch energy checks).

## The cut (step 2)

The lesson (contact sheets `frames/sheet_a.jpg`, `frames/sheet_b.jpg`; cuts `logs/scenes.txt`; spectrograms
`checks/spec_*.png`). Times are `video.webm` container times:
- **0-~10 s** title cards (a "Manx Guitar Lesson with Pete Lumb" sheet and the tune's sheet), with guitar music under
  them that runs on under a wide shot of him playing (~10-28 s) and then under his voice (from ~28 s). That music is
  another full-speed take (cross-correlation with the cut's full-speed pass only 0.2-0.4, `logs/intro_match.txt`).
  Excluded: titles and voice over it.
- **~28-214 s** the lesson: talking, demonstrations of phrases, captions ("Lesson"), close-ups of each hand.
- **"Slow play-through"** (caption): one medium shot from 213.96 s; first pluck 214.43 s; last attacks about 254.1 s,
  then the last chord rings; small noises at 255.6-256.9 s; quiet (-57 to -70 dBFS) to 258.6 s. No talking.
- **"Full-speed performance"** (caption): first pluck 258.65 s, last attacks 277.0-277.2 s, ring-out; a multi-camera
  edit. From 277.9 s the picture fades towards the end card, and **the Culture Vannin logo cross-fades in over the
  player from about 278.9 s**. The end card (dark, logo, "Presented by Pete Lumb", the web address) is full from the
  frame at **281.04 s**; the audio is cut to digital silence at 281.12 s and the end card is silent.
- **Played range = both play-throughs, whole:** container 213.96 s (the first frame of the slow play-through's shot)
  to 281.04 s exclusive (the first end-card frame): `ffmpeg -ss 213.966 -t 67.08 -i video.webm` (ffmpeg's clock for
  this file is container + 0.006 s, because its audio starts at -0.006). The 2.9 s between the passes is kept (no
  speech in it). In `boats` time: slow pass 0.47-~41.5 s, full-speed pass 44.69-67.08 s.
- **Shots in the cut** (`boats` time): 0-45.48 medium shot from the front (head to lap, neck rising to the upper right
  with the nut and headstock in frame, both hands, a music stand along the bottom edge); 45.48-49.44 close-up of the
  fretting hand and headstock; 49.44-54.68 medium; 54.68-56.72 picking-hand close-up; 56.72-58.68 medium; 58.68-67.08
  wide (whole player, a second guitar and an amplifier at the left), fading from 63.9 s.
- **Why boxes, not a crop.** The captions sit at the lower left (x 182-870, y 888-955, with draw-on lines), right next
  to the picking hand's forearm, and the logo comes in over the guitar body in the middle of the wide shot. A crop
  that removes them would remove the hands in some shots, so `boats.mp4` covers them with black boxes, only while they
  show (as the `september` slot did for its title), checked frame by frame (`frames/cap1_in.jpg`, `cap1_out.jpg`,
  `cap2_in.jpg`, `cap2_out.jpg`, `endlogo.jpg`, result `frames/newplayer_mp4_check.jpg`):
  - "Slow play-through": box x 172, y 878, w 708, h 88 on frames 0-182 (0-7.28 s; the caption's lines show from
    214.00 to 221.24 s of the video);
  - "Full-speed performance": the same box on frames 1115-1298 (44.60-51.92 s; lines from 258.68 to 265.88 s);
  - end logo: box x 690, y 470, w 540, h 280 from frame 1619 (64.76 s) to the end (the logo is first faintly visible at
    279.00 s = 65.04 s and spans x 716-1205, y 500-719 by 281.0 s). This hides the picking hand only after the last
    attack (63.25 s), during the ring-out.

**Time base** (`bin/xcorr_offset.py`, `logs/timebase.log`; `bin/frame_match.py`, `logs/frame_match.log`):
- **`boats.wav` sample 0 = 213.959501 s of `audio.wav`** (sample 9,435,614; sample-exact cross-correlation of 5 s
  pieces at 1, 20, 45 and 60 s of the cut: the same value at all four, correlation 0.99999-1.00000). `audio.wav`
  sample 0 is the first decoded sample of `video.webm` (after the Opus pre-skip, container time about 0.000 s), so
  `t_boats = t_audio.wav - 213.9595 = t_video.webm - 213.96` to within 1 ms.
- **Video:** `boats.mp4` frame n = `video.webm` frame at 213.96 + 0.04 n s, checked at frames 0, 1, 500, 1200 and 1676
  (mean grey-level difference 0.05-0.15 against 0.40-5.29 for the neighbours). Picture and sound start together: an
  audio-video offset of 0.5 ms, recorded as 0.
- First onset of `boats.wav` (librosa onset detection on the raw audio): 0.488 s; last attack 63.251 s; later onsets at
  64.98, 65.06, 65.13 and 66.00 s are small noises in the ring-out, and those at 41.66, 42.06, 42.50 and 42.89 s are
  small noises after the slow pass (`logs/onsets_overview.txt`): the key builder decides by ear and spectrogram
  whether any is a note. The first 50 ms of `boats.wav` hold the tail of an editor's fade (-52 dBFS, below -75 dBFS by
  0.1 s); 0.1-0.45 s is silence at about -81 dBFS.
- Both passes look like one pass each of the 16 bars and the pickup (bar length about 2.45 s and 1.16 s; the last
  chord's A2 at 38.68 s and about 62.4 s); not counted bar by bar here.

## Tuning and capo (step 3)

**Standard tuning, no capo**: `tuning_midi` 40 45 50 55 59 64, `capo` 0. Tuning offset **0 cents**
(`librosa.estimate_tuning` on `boats.mono.wav`: +0.0 for the whole file, for the slow pass and for the full-speed
pass; `logs/tuning_offset.log`). Confirmed four ways:

1. **Stated by the tab.** The sheet prints no tuning and no capo, but its notation over the TAB fixes every open
   string: s5 open under a written A3 (sounds A2), s6 open under a written E3 in the Em bars (sounds E2), s4 fret 2 =
   E3, s3 fret 2 = A3, s2 open = B3, s1 open = E4. No capo mark. The archive scout found no capo or altered tuning in
   any of the series' 20 arrangements (`../../video/candidates-archives.md`).
2. **Chroma at all 12 shifts** (`bin/tuning_check.py`, the archive scout's method: mean CQT chroma of the window
   against the pitch classes of the tab's 110 notes, read off the sheet for this check only,
   `checks/tab_notes_for_check.txt`; `logs/tuning_check.txt`):
   - slow pass (0.4-42.0 s): **shift 0 0.925**, -1 0.504, +1 0.402, +2 0.586, next best 0.815 (-5);
   - full-speed pass (44.6-63.6 s): **shift 0 0.899**, -1 0.553, +1 0.432, +2 0.599, next best 0.809 (-5).
   A capo on fret 1 or 2 would be shift +1 or +2.
3. **Per-note pitch at known times** (`bin/pitch_at.py`, `logs/pitch_at_slow.txt`; CQT level 80-300 ms after the
   attack, at the expected pitch and at the pitches one and two semitones away): in the slow pass the open fifth string
   sounds **A2**, 20.4 to 23.7 dB louder than G#2, A#2 or B2 at 1.031, 2.576 and 8.032 s (capo 1 would give A#2,
   capo 2 B2). E3 (s4 fret 2, the pickup) +13.6 dB, A3 (s3 fret 2) +10.1 dB, B2 (s5 fret 2, bar 4) +21.5 dB over
   their neighbours. Three other picks landed on attacks of other notes (the times were picked by eye) and are not
   counted. **The sixth string** cannot be checked by its fundamental: this recording carries little below about
   95 Hz (bass profile E2 -39 dB, F2 -35 dB, against A2 -7 dB, `logs/tuning_check.txt`). Instead, G#4, the fifth
   partial of E2, stands 6 dB or more over G4 and A4 only in four short spans: 10.59-11.05 s, 37.64-37.94 s,
   49.09-49.37 s and 62.11-62.39 s. Those are bars 4 and 15 of each pass, exactly where the tab has an open E2
   (`logs/gsharp.txt`). With drop D that partial would be F#4. A partial-rise test at single E2 attacks
   (`bin/partials_rise.py`) was inconclusive and is not used.
4. **A frame shows no capo**: at 259.84 s of `video.webm` (`boats` 45.88 s, the fretting-hand close-up) the nut, the
   first fret wires and the strings between them are clear, with nothing across the neck
   (`frames/nut_full_259.84.png`, zoom `frames/nut_zoom_259.84.png`). R3c's record says the same ("No capo").

## Notes for the key builder

- 16 bars of 6/8 plus a one-quaver pickup, no repeat signs; two voices (melody and bass) with ties, a grace note
  (bar 5), slurs (bars 7, 9, 11-15), the "CI" half-barre at fret 1 (bars 2, 6, 10, 14). The PDF's text layer holds
  the fret digits with coordinates (`pdftotext -bbox`), as the archive scout found.
- Two passes: the slow pass (about 49 dotted crotchets a minute) and the full-speed pass (about 104). Both are the
  same arrangement and both go in the key.
- Possible departures to look for by ear: the bass of bar 2 beat 2 sounds to carry a B2 next to the written G2 in the
  slow pass (`checks/bass_slow_0-12.png`, 4.9-6.2 s), and short sounds in the gap and the ring-out (above). These are
  only things to look at; this step decided nothing about the notes.
- No cursor and no on-screen tab: bar times come from the audio (onset strength, CQT) and the picture.
