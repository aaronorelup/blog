# Held-out slot `september`: *Wake Me Up When September Ends (Jonathan's Version)*, Evan Handyside

Lane H of the NOTES session, 2026-11-27. Two parts: **fetch and prepare** (the files, the cut, the time base, the
tuning and capo checks, the rights note and the credit line; written first, kept below as it was) and **the key**
(two readings of the tab compared, every note timed to the recording, `conf`, self-checks: from "Method" on). Work
folder (not in git): `/home/user/gtv/work/heldout-september/` (`PROGRESS.md`; fetch: `bin/`, `logs/`, `frames/`, `tab/`;
readings: `read-A*`, `read-B*`; key: `key/bin/`, `key/out/`, `key/check/`, `key/logs/`). Every number below comes from a
file named next to it. **No note transcriber was run on this recording, in either part**: the key was built, timed and
checked with onset strength (spectral flux), CQT and STFT energy at the notes' partials, chroma, FluidSynth renderings
of the key itself and the picture, so that it can score exactly those tools.

**Status:** key built (2026-11-27), `gtr-eval check-truth` 4325 checks, 0 mismatches. Not yet audited by an agent that
did not build it (NOTES.md section 5 asks for that audit before the key is used).

## Source and credit

- *Wake Me Up When September Ends* (Green Day, 2005), solo fingerstyle arrangement "Jonathan's Version", arranged,
  played and tabbed by **Evan Handyside** (Intellimusica, "Uncommon ideas for the practicing guitarist"). Nylon-string
  cutaway guitar, open G tuning, capo 2.
- Video: Vimeo 813529239, "Wake Me Up When September Ends (Jonathan's Version) | fingerstyle guitar + TAB", uploader
  Evan Handyside, fetched through `player.vimeo.com` (the box's only Vimeo route; `vimeo.com/<id>` needs a login).
- Post and tab: intellimusica.com, post "Wake Me Up When September Ends (Jonathan's Version) | fingerstyle guitar +
  TAB" (WordPress post 21311, published 2023-03-31, category "Free TABs"); the tab is a 2-page handwritten PDF,
  `When-September-Ends-Jonathans-Version.pdf`, dated 3/22/23 on both pages.
- **Credit line:** "Wake Me Up When September Ends (Green Day), arranged and played by Evan Handyside,
  intellimusica.com".

## Rights note

- **Licence as stated: none.** The site footer reads "Copyright © 2026 Intellimusica"; neither the post nor the PDF
  states reuse terms (the PDF carries only the Intellimusica header). The post asks readers to "Feel free to share this
  post far and wide": an invitation to share the post, not a licence for the recording or the tab. Vimeo shows no
  licence (all rights reserved by default); the player config has the video hidden from vimeo.com and embeddable
  anywhere (`privacy` "disable", `embed_permission` "public"; work folder `dl/vimeo_meta.json`, signed links dropped).
- **The composition is Green Day's** (a major-label song); the arrangement and its open-G fingering are Evan's. The
  post says this recording was also released as a single on the streaming services.
- **Tab access (the creators scout's Intellimusica note, still true today).** The site runs the Leaky Paywall plugin:
  the logged-out page shows only the Vimeo embed and "Subscribe to read the full story". The post text, the tuning
  sentence and the PDF link came from the site's public WordPress REST API (`/wp-json/wp/v2/posts?slug=...`), and the
  PDF itself is a public upload under `wp-content/uploads/` (HTTP 200 without a login). No account was made and
  nothing was bought. Before the film or the post shows this tab, a free account on the site or a word with Evan
  Handyside settles it (as for the `tuning` slot, `../../video/SONGS.md`).
- **Care in public use.** The post is a personal memorial for a former student of the player, after whom the
  arrangement is named. Any public use should keep to the music and the credit line and not retell the post.
- **Training-set check (not done in this step):** GuitarSet was recorded for that dataset (2018), so it cannot hold
  this 2023 video; whether GAPS, GOAT or the Leduc set hold it is left to the key builder's check.

## Files

| file | what |
|---|---|
| `/home/user/gtv/songs/september/video.mp4` | the download: the Vimeo HLS 1080p video rendition and its one audio rendition ("Original"), joined by stream copy (no re-encode; `bin/hls_fetch.py`, no yt-dlp on the box). H.264 1920x1080, 29.97 fps (30000/1001), 165.532 s, 4961 frames; AAC 48 kHz stereo, 165.547 s; both streams start at 0 |
| `When-September-Ends-Jonathans-Version.pdf` | the tab as downloaded (806,343 bytes, 2 pages, scanned, no text layer); pages at 300 dpi in the work folder `tab/page-1.png`, `tab/page-2.png` |
| `post.json`, `post.txt`, `page.logged-out.html` | the post from the REST API (whole), its musical part as text, and the page as a logged-out visitor sees it |
| `september.mp4` | what the tools and any blind run get: the cut below, full frame 1920x1080, **a black box (x 200, y 428, w 1636, h 240) over the title on the cut's first 75 frames**, x264 crf 16 (preset medium, GOP 50, yuv420p), AAC audio copied, metadata stripped |
| `september.full.mp4` | the same cut, no box (the title shows on its first 75 frames) |
| `september.wav`, `september.mono.wav` | from `september.mp4`: 44.1 kHz 16-bit, stereo and mono |
| `/home/user/gtv/truth/september/september.truth.json` | **the key** (schema of `capo.truth.json`), `september.wav` linked next to it |
| `september.notes.csv`, `.beats.txt`, `.chords.lab`, `.mid`, `.tab.txt` | side files written from the key (the `.tab.txt` is a reading aid: one column = a sixth of a beat) |
| `september.tab-merged.json` | the merged reading of the tab (reader format plus a `merge` block) |

**The cut (step 2).** One static camera, one take; no talking, no lesson part, no caption during the playing
(`logs/framediff.txt`: no cut after 5.1 s; contact sheets `frames/sheet1.jpg`, `frames/every_sheet.jpg`).
- **Title:** the picture fades in from black over 0-3.0 s; the title "Wake Me Up When September Ends / Jonathan's
  Version" (white text, x 212-1822, y 440-655) is laid over the playing until frame 149 (4.971 s) and is gone on frame
  150 (5.005 s) (`frames/cut5.jpg`). The music starts under it: the first pluck is at **2.81 s** (onset strength;
  the audio before 2.75 s is room noise at about -50 dBFS, `bin/envelope.py`). A crop cannot remove the title without
  the guitar, so `september.mp4` covers it with a black box for those frames instead of losing the first six notes.
- **End card:** the last pluck is at about 153.9 s and rings out to about -51 dBFS by 155.5 s; the fade to the card
  ("Guitar TAB and blog: intellimusica.com") starts on frame 4676 (156.0225 s) (`logs/env_end.txt`).
- **Played range kept:** frames 75 to 4675 of `video.mp4`, **2.5025 s to 156.0225 s** (153.520 s, 4601 frames): the
  whole performance, 0.31 s of silence before the first pluck and the ring-out of the last notes.
- **Time base:** `september.wav` sample 0 = **2.502494 s** of the `video.mp4` audio: cross-correlation of 3 s
  windows at 5, 70 and 140 s of the cut gives the same lag in all three (110,360 samples at 44.1 kHz, normalised peak
  0.9998-0.9999; `bin/xcorr.py`, `logs/xcorr.txt`). `september.mp4` frame 0 = `video.mp4` frame 75 (2.5025 s), its
  last frame (4600) = frame 4675: mean abs difference 0.22 and 0.26 against 1.7-5.3 for the neighbouring frames
  (`logs/cut_check.txt`). So **time t in the cut = t + 2.5025 s in `video.mp4`** (to within one sample). Audio
  153.5295 s (6,770,651 samples at 44.1 kHz), video 153.5200 s (4601 frames). The source's A/V offset is not measured
  (both streams start at 0): recorded as 0. The box: in `september.mp4` frames 0-74 the box is black and none of the
  44,675 title pixels is left near-white (43,750-44,592 of them are in `september.full.mp4`); frame 75 is clean.
  Encode: `bin/encode.sh`, gtr-run r1317 (2 cores, 1116 s wall).

## Tuning and capo (step 3)

**Open G, D2 G2 D3 G3 B3 D4 (`tuning_midi` 38 43 50 55 59 62), capo on fret 2.** Confirmed four ways:
1. **Stated** in the post: "This piece is played in an Open G tuning with a capo on the 2nd fret ... (from low to
   high): D G D G B D." The handwritten tab itself names no tuning and no capo (both pages looked at).
2. **Chroma at all 12 shifts** (`bin/tuning_check.py`, `logs/tuning_check_2.7-28.json`; librosa CQT chroma, mean over
   2.7-28 s of `video.mp4`, against the pitch classes of the 69 notes of the intro and one verse pass read off page 1
   for this check only): cosine **0.854 as stated**; the other 11 shifts 0.296-0.652 (open G without the capo 0.497,
   capo 1 0.393, capo 3 0.341); the same frets in standard tuning without a capo 0.654. Standard tuning **with** capo 2
   scores 0.870: chroma cannot tell the two, because only 14 of the 69 notes are on the strings the two tunings
   differ on (1, 5, 6), and under the wrong reading those notes (B2, E3, F#4, G#4) still belong to the passage's A
   major. Check 3 settles it.
3. **The open 5th string sounds A2** (`logs/open_strings2.txt`; CQT 36 bins per octave, 60-350 ms after each of the
   intro's four open-5th-string plucks): A2 at +13.7 to +19.6 dB against G2 at -0.2 to -8.6 dB and B2 at -14.5 to
   -21.2 dB. Open G + capo 2 predicts A2; standard + capo 2 would give B2, open G without a capo G2. The intro's other
   two notes are A3 (open 3rd string) and E4 (2nd string, fret 3), the loudest of their candidates every time.
4. **A frame shows the capo on fret 2** (`frames/capo_t30.png`, 2x crop of x 1300-1920, y 520-820 at 30.0 s of
   `video.mp4`): the capo bar sits just behind the second fret wire from the nut, one fret wire between it and the nut;
   the nut and the headstock are in frame all through.

`tuning_offset_cents` **+5**: `librosa.estimate_tuning` over the cut, +5.0 c (four 30 s windows +5 to +6 c,
`logs/tuning_offset.txt`). The creators scout measured +5 c too.
In the key: `tuning_midi` [38, 43, 50, 55, 59, 62], `capo` 2, `tuning_offset_cents` +5; every note's pitch = open
string + capo + fret (`check-truth` checks it for all 417 notes).

## Method (the key)

Scripts in `key/bin/` of the work folder; `key/bin/run_all.sh` runs everything from the merged reading to the last
check again (71 s). Python: the research's `venv-torch` (librosa 0.11), used only for onset strength, CQT and STFT.

1. **The two readings** (`read-A.json`, `read-B.json`; each reader worked from the PDF's own 300 dpi scans, without
   the other's files, audio or video). Compared note by note (`key/bin/merge.py`): **188 of 188 notes agree** (164
   events, 13 "bars" = the tab's lines, page 1 line 5 split at its bar line; same events in the same order), the same
   marks on the same 7 origin events (arcs read h / p by the fret direction; one slide), event x positions within 18
   px. Nothing to settle. The readers' doubts, settled from the tab and then the sound: the three string-2 digits that
   might be 2s (bar 8 ev 11, bar 10 ev 14, bar 13 ev 8) are 3s, the same terminal dot as the clear 3s
   (`key/out/doubts.png`), and at all five places they are played E4 rises 10.9-17.6 dB with a sharp jump while D#4
   (fret 2) does not beat it; the slanted line in page 2 line 4 is a slide, heard as a glide (Departures). Merged
   reading: `september.tab-merged.json`.
2. **Form as played** = the post's: Intro; Verse 2x (pass 1 bars 2-6, pass 2 bars 2-5, the TO CHORUS arrow taken from
   the bar line after bar 5, as both readers read it); To Chorus; Chorus; Intro; Verse 1x (bars 2-5); To Chorus;
   Chorus; End: **364 events, 415 tab notes** (`key/out/form.txt`, `key/bin/events.py`). Seen first in the loudest bass
   pitch per 0.5 s (`key/bin/lowmap.py`: A2 blocks at the intros, bars 5-6 and the end; F#2 at the chorus openings),
   then in the alignment: each section's notes sit on its own plucks (sections start at 0.308, 7.117, 32.856, 54.904,
   57.951, 86.233, 92.921, 114.416, 117.493, 145.850 s). Unlike the `tuning` slot, no section was added or left out.
3. **Rhythm reading** (the tab has none; `key/bin/positions.py`): each tab line is two 4/4 measures of eighth notes in
   the song's 3+3+2 grouping (bars 5, 6, 7 and 12 one measure); hammer, pull and slide targets sit between eighths; in
   bar 12 the 5-7-5 ornament fits inside the first eighth (measured). Checked against the timed notes per measure: no
   event is more than 0.3 eighth off its measure's straight-line fit except the opening chords of chorus bars 8 and 10
   (rolled 0.30-0.37 eighth ahead of the beat). Used only as the DP's tempo model and for the beats.
4. **Event alignment** (`key/bin/align4.py`, global DP, no search window): each event is matched to a peak of the
   1 kHz+ spectral flux (pluck transients, 5.8 ms grid), or skipped. Match score = peak strength + pitch evidence, where
   pitch evidence = 0.5 x the CQT rise of the note (36 bins per octave, fundamental or harmonics 2-4) less 0.7 x the
   rise of a pitch 12, 19 or 24 semitones below it among the neighbouring notes (an A2 pluck raises A3 and E4 as its
   harmonics, and the intro is A2 A3 E4) + 0.5 x the jump of its fundamental in a 23 ms STFT (sharp in time). Costs:
   unexplained flux peaks between matched events, skipped events (cheap only for hammer, pull and slide targets), and
   a Huber penalty on log(gap / (eighths x 0.40 s)). Result: 348 of 364 events on a flux peak, the 16 skipped all
   legato or slide targets. A first try with a chroma-DTW prior and no sub-harmonic penalty (`key/bin/align.py`) put
   intro notes on each other's harmonics and was dropped.
5. **Per note** (`key/bin/refine.py`):
   - Attack checks both ways, because of the early fault of AO-082's first capo build (onsets 32-119 ms before the
     attack). The recording has many small finger-contact clicks 50-150 ms before a pluck (88 of the detector's 133
     unexplained detections, Checks), and a pluck's 1 kHz+ peak can trail the note's own start. A peak 12-163 ms later
     with the note's own fundamental jump (>= 3 dB above, 1.8 x the strength; or >= 5 dB when the matched peak shows
     none) takes the note; so does a peak 12-80 ms earlier whose jump is >= 4 dB and CQT rise >= 3 dB above. Moved:
     126.717 -> 126.798 s (A3: only E6/D#5 rise at the first peak), 100.478 -> 100.426 s (A3: its partial level is
     23.0 dB in the 30 ms window from 100.42 s and 36.1 dB in the one from 100.44 s, `key/bin/slices.py`). Intro: the
     A2 of the third group is the peak at 3.727 s, not the louder click at 3.605 s (A2's fundamental is -0.9 dB in
     3.60-3.63 s, 38.2 dB in 3.73-3.76 s); the intro of the second round starts at 86.233 s, not at the click at
     85.972 s.
   - Chords (15 four-note chords and 6 dyads in all): the lowest note on the event's peak (moved to a peak where its
     evidence is >= 5 dB higher: 3 chords, 70.803 -> 70.612, 73.886 -> 73.781, 107.909 -> 107.996 s); the others in
     string order 6 -> 1 on successive flux peaks up to 400 ms later (the chords are rolled upward, one peak per
     string), chosen by a DP on 0.25 x CQT rise + 0.75 x the jump of the fundamental's power in a 46 ms STFT (each
     less a lower chord note's share where the note is its harmonic), the same peak for two notes costing as a pinch.
     AO-082 `tuning`'s half-rise rule was tried and dropped here: where the string was still ringing it found no rise
     and left whole chords on the bass (`key/out/refined6.json`).
   - Hammer-ons, pull-offs and slides (26 notes, `legato` "h" 14, "p" 8, "slide" 4): the steepest rise of
     (target - origin) harmonic salience in a 46 ms STFT between the origin + 30 ms and the next pluck, then the flux
     peak within -30..+60 ms where the target's own fundamental jumps (the 46 ms measure runs 30-45 ms early against
     those peaks). The ornaments are fast: in the C#4-E4-C#4 figures the hammer comes 29-93 ms after the pluck and the
     pull-off 87-290 ms after the hammer; the other hammer-ons 58-157 ms after their pluck.
6. **conf**: `tab+audio` when, at the note's onset, its CQT rise less the sub-harmonic share is >= 3 dB **and** its
   fundamental jumps sharply (23 ms or 46 ms STFT, >= 2 dB); legato and slide targets also with a rise >= 3 dB and a
   target-minus-origin salience jump >= 10 dB. Calibrated (`key/check/calib2.json`): 0.846 of the onsets pass, the
   same pitch 0.2 s away 0.056 (away from any onset) to 0.071. The first rule (rise or jump >= 3 dB) passed 0.20-0.23
   at those control times and was dropped. `tab` = in the tab, not confirmed that way; `audio` = heard, not in the tab.
7. **The rest of the fields** (`key/bin/build.py`, the capo build's rules where they apply): offsets let ring to the
   next onset on the same string - 10 ms, at most where the note's CQT band falls 25 dB under its peak, at most 6 s
   (estimates); voice by string (highest note on strings 1-3 melody, lowest on 4-6 bass, others chord); beats from the
   rhythm reading (beat k = eighth 2k, interpolated between plucked notes, exact on a note); downbeats = beat 1 of each
   measure; chords derived from the notes per half bar and key by Krumhansl-Kessler (the capo rules; chord naming is
   left out of the research for now, DIRECTION.md); no taps (the tab marks none, none heard).

## Counts

- **417 notes**: melody 254, bass 131, chord 32; **conf: tab+audio 351, tab 64, audio 2**. 26 legato or slide targets
  (22 `tab+audio`). Whole piece scored: `scored_range` [0, 153.5295] s, first onset 0.308 s, last 151.412 s.
- **192 beats, 48 downbeats** (48 measures of 4/4), tempo **77.71 bpm** (median beat 0.772 s, IQR 0.743-0.820, rubato
  0.586-1.056 s); 62 chord segments (A:maj 19, E:maj 16, F#:min 10, D:maj 7, D:min 3, G#:min 2, G#:maj 1, N 4); key
  **A major** (second A minor).
- The 64 `tab` notes: 37 re-pluck a pitch that sounds in one of the three events before (A3 on s3 0 after A3 on s4 5,
  F#3 after the chord's F#3), 16 other single notes on strings 3-6, most with a clear CQT rise (up to 24 dB) but no
  sharp fundamental jump (a short STFT is too coarse for low notes), 7 chord notes, 4 legato targets. By string: s4
  29, s3 27, s2 6, s5 1, s6 1. Every `tab` note still sits on a flux peak (plucked notes) or a legato measure.

## Departures from the tab

- **Notes heard but not written (`audio`, 2):** at the last event of bar 12 (s1 fret 7, B4), in both choruses (84.695 s
  and 144.312 s), **G#4 (s2 fret 7) is plucked with the B4**: G#4 is the loudest new partial there, +17.6 and +19.9 dB
  over the 150 ms before, with its harmonics G#5 (+17.4, +34.9 dB) and D#6 (+18.2 dB); B4 rises +14.2 and +24.8 dB
  (B5 +25.2, +35.6 dB) (`key/bin/newpartials.py`). The string and fret are those of the G#4 two events earlier, which
  the hand still holds. Added to that event, voice `chord`.
- **The slanted line (page 2, line 4, bar 11) is a slide and is played as one** in both choruses: no new pluck at the
  7s, the D3 and F#4 lines glide up to E3 and G#4 within 80.25-80.38 s and 139.75-140.00 s (`key/out/zoom_slide1.png`).
  The 7s are `legato` "slide" notes at the arrival.
- **Form:** as the post gives it (Method 2); the arrow is taken on the second verse pass, as read.
- **No written note is played as a different pitch** as far as these checks reach: at every onset the written pitch
  was compared with the pitches 1 and 2 semitones away (`key/bin/departures.py`, 0 flags), and the strong onsets that
  carry no key note were searched for a pitched note (`key/bin/extras.py`, `key/bin/newscan.py`): finger clicks
  before plucks, a soft burst at 120.227 s (E3, E4, G#4 partials 15-20 dB below the notes around it), none a note.

## Checks

| check | result | file (work folder) |
|---|---|---|
| `gtr-eval check-truth` 0.12.1 | **4325 checks, 0 mismatches** | `key/logs/checktruth.json` |
| side files against the JSON (`gtr-eval`, `--no-ledger`) | `notes.csv` onset and onset+offset F1 1.0; `.mid` onset 1.0, onset+offset 0.954 (same pitch on two strings, A3 on s4 5 and s3 0, overlaps in one MIDI channel, as in AO-082); `beats.txt` beats and downbeats F 1.0; `.tab.txt` `tab --ignore-time` 410 of 417 matched by order, 1.0 same string and fret | `key/logs/side_*.json` |
| key rendered with FluidSynth (`notes2wav.py`, FluidR3_GM) against the recording, chroma cosine | nylon (program 24) **0.817** over 0.3-152 s, per 10 s 0.747-0.869; the same rendering one measure (3.09 s) late 0.524. Steel (25) 0.874, shifted 0.615 | `key/check/render_nylon.json`, `render_steel.json` |
| onsets: the AO-082 checker's onset detector (librosa mel flux, `truth-check-capo/bin/timing.py` parameters) on the recording | **0.975 of the 402 key onset events have a detection within 50 ms** (per 10 s 0.93-1.00); detection minus key median -11.6 ms (p10-p90 -17.4 to -5.8: the key marks the 1 kHz+ transient peak, the mel detector the earlier low-band rise); missed: 0.308 s (first note, its A2 rises from 0.27 s: thumb stroke), 58.932 s (A3, a ringing re-pluck) and 7 legato or slide targets. 0.749 of the 526 detections are near a key onset: of the other 133, 88 lie 50-150 ms before a pluck (finger contact) and 15 just after one | `key/check/render_nylon.json`, `key/check/detector_extra.json` |
| the same detector on the rendering against the recording | F 0.836 (P 0.970, R 0.734); rendering later by a median 34.8 ms = the FluidSynth nylon sample's own 23.2 ms from note-on to its detected onset + the 11.6 ms above | same |
| early or late onsets (the capo fault) | key onset events with no detection within 30 ms but one 30-150 ms later: **1** (a pull-off, 104.171 s); 30-150 ms earlier: 4 (the first note and 3 legato or slide targets). Against 1 kHz+ peaks >= 0.15: 4 plucked notes 35-58 ms before a stronger peak where their own pitch evidence is weaker (kept) | `key/check/earlycheck.json` |
| per-note energy at the partials (the conf test) and its calibration | Method 6 | `key/check/calib2.json` |
| ten notes by hand (the middle of each tenth of the note list: CQT tile around the onset and the video frame) | 8 of 10 show their pitch's line starting at the onset (rise 9.8-21.0 dB, a sharp jump at 7); #145 (A3, 58.932 s, `tab`) is a ringing open string struck again (rise 3.7 dB, no jump); #312 (F#3 in the rolled chord at 117.493 s, `tab`): the F#3 line starts with the F#2 bass, 87 ms earlier, so it is either struck with the bass or only F#2's harmonic. The fretting hand is near the capo for the fret 0-3 notes and in the middle of the neck for the fret-7 notes (abs. fret 9); strings not resolvable at this size | `key/check/tencheck.jpg`, `tencheck.json` |

No transcription model was run against this key (the lane rule: the key will score them).

## What remains uncertain

- **Chord notes above the lowest** (51 notes in the 21 chords and dyads): their order and pitch are sure, their onsets
  come from the one-peak-per-string roll model and are likely within about 0.1 s; a few may be pinched with the bass
  instead (e.g. #312 above).
- **Legato and slide targets** (26): timed from salience changes and moved onto nearby flux peaks; the ornaments are
  fast (a hammer 29-157 ms after its pluck), so a target's onset may be off by up to about 50 ms. Slide targets mark
  the arrival of the pitch.
- **The 64 `tab` notes**: re-plucks of ringing pitches and low notes without a sharp jump; their onsets are flux peaks
  chosen with the tab's order, not proven plucks of that pitch.
- **The onset convention**: the key marks the 1 kHz+ transient peak; the broadband attack starts a median 11.6 ms
  earlier and by 40-50 ms on a few thumb strokes (the first note). Models trained on GuitarSet mark about 20-30 ms
  earlier than such keys (AO-082).
- **Beats, measures, tempo** are the builder's reading (the tab has no rhythm); the chords and the key are derived.
- **Offsets** are a rule, not measured: use onset metrics.
- **No video truth file** was written (not asked for this slot); the frames show one static shot with the nut and
  headstock in view.
- **Not yet audited** by an agent that did not build the key (NOTES.md section 5).
- **Training sets**: not checked against the sets' file lists. GuitarSet (2018) cannot hold this 2023 recording; a
  Vimeo-only pop arrangement is unlikely to be in GAPS (classical scores), GOAT or the Leduc set, but that is not
  proven.
