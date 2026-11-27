# Held-out slot `september`: *Wake Me Up When September Ends (Jonathan's Version)*, Evan Handyside

Lane H of the NOTES session, 2026-11-27. Two parts: **fetch and prepare** (the files, the cut, the time base, the
tuning and capo checks, the rights note and the credit line; written first, kept below as it was) and **the key**
(two readings of the tab compared, every note timed to the recording, `conf`, self-checks: from "Method" on). Work
folder (not in git): `/home/user/gtv/work/heldout-september/` (`PROGRESS.md`; fetch: `bin/`, `logs/`, `frames/`, `tab/`;
readings: `read-A*`, `read-B*`; key: `key/bin/`, `key/out/`, `key/check/`, `key/logs/`). Every number below comes from a
file named next to it. **No note transcriber was run on this recording, in either part**: the key was built, timed and
checked with onset strength (spectral flux), CQT and STFT energy at the notes' partials, chroma, FluidSynth renderings
of the key itself and the picture, so that it can score exactly those tools. **Repaired the same day** after the
independent check (`september-check.md`): see **Repairs** at the end. The numbers in this record are those of the
repaired key unless they say "before"; the first build is kept in the work folder's `orig/`.

**Status:** key built, independently checked (`september-check.md`: not passed, five notes on a click and 35 `conf`
changes) and repaired, all on 2026-11-27 (**Repairs**). `gtr-eval check-truth`: 4325 checks, 0 mismatches before and
after the repair. The repair was re-checked by its own second pass (40 notes by eye, the check's scripts run again on
the repaired key). Whether another agent re-checks the repair is the orchestrator's call.

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
| `september.notes.csv`, `.beats.txt`, `.chords.lab`, `.mid`, `.tab.txt` | side files written from the key (the `.tab.txt` is a reading aid: one two-character cell = a sixth of a beat, so an eighth = 3 cells; before the repair its header said "one column") |
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
     23.0 dB in the 30 ms window from 100.42 s and 36.1 dB in the one from 100.44 s, `key/bin/slices.py`; the repair
     moved it back to 100.4785: the 100.42 level was the dip of a finger landing on the ringing string). Intro: the
     A2 of the third group is the peak at 3.727 s, not the louder click at 3.605 s (A2's fundamental is -0.9 dB in
     3.60-3.63 s, 38.2 dB in 3.73-3.76 s); the intro of the second round starts at 86.233 s, not at the click at
     85.972 s.
   - Chords (15 four-note chords and 6 dyads in all; the repair re-timed the F#4 of the four chorus D chords and one
     E4, see Repairs): the lowest note on the event's peak (moved to a peak where its
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
   left out of the research for now, DIRECTION.md); no taps (the tab marks none). The repair added two `string-slap`
   taps for muted strums (**Repairs**).

## Counts

- **417 notes**: melody 254, bass 131, chord 32; **conf: tab+audio 377, tab 38, audio 2** (before the repair 351, 64,
  2). 26 legato or slide targets (23 `tab+audio`; 22 before). Whole piece scored: `scored_range` [0, 153.5295] s, first
  onset 0.308 s, last 151.412 s. **2 taps** (`string-slap`, 120.239 and 132.812 s; none before).
- **192 beats, 48 downbeats** (48 measures of 4/4), tempo **78.01 bpm** (median beat 0.769 s, IQR 0.749-0.813, rubato
  0.685-1.056 s; before the repair 77.71 bpm, median 0.772 s, shortest beat 0.586 s, because of the early downbeat at
  10.08 s); 62 chord segments (A:maj 19, E:maj 16, F#:min 10, D:maj 7, D:min 3, G#:min 2, G#:maj 1, N 4); key
  **A major** (second A minor).
- **The 38 `tab` notes** (after the repair; `conf` now comes from the independent check, see Repairs): by string s3 19,
  s4 15, s2 4; voice melody 23, bass 11, chord 4; 3 legato targets. Most re-pluck a pitch that is still ringing and show
  only a broadband bump; #13 (7.518 s) and #357 (131.106 s), both A3, show no attack at all and may not have been
  played (kept, as the check advised).
- Before the repair, the 64 `tab` notes: 37 re-pluck a pitch that sounds in one of the three events before (A3 on s3 0 after A3 on s4 5,
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
  before plucks, a soft burst at 120.227 s (E3, E4, G#4 partials 15-20 dB below the notes around it), none a note. The
  check named that burst as a muted strum, and the repair added it and a weaker one at 132.80 s as `string-slap` taps.
- **Timing (not a departure from the tab):** 14 onsets of the first build sat 43-158 ms before the note's own attack and
  were moved in the repair (Repairs). In the chorus D chord (bars 9 and 11) the player rolls D3, A3, F#4 and E4 one
  string at a time, the F#4 40-55 ms after the A3.

## Checks

| check | result | file (work folder) |
|---|---|---|
| `gtr-eval check-truth` 0.12.1 | **4325 checks, 0 mismatches** (before and after the repair) | `fix/logs/checktruth.json` (before: `key/logs/checktruth.json`) |
| side files against the JSON (`gtr-eval`, `--no-ledger`) | `notes.csv` onset and onset+offset F1 1.0; `.mid` onset 1.0, onset+offset 0.954 (same pitch on two strings, A3 on s4 5 and s3 0, overlaps in one MIDI channel, as in AO-082); `beats.txt` beats and downbeats F 1.0; `.tab.txt` `tab --ignore-time` 410 of 417 matched by order, 1.0 same string and fret. All the same after the repair | `fix/logs/side_*.json` (before: `key/logs/`) |
| key rendered with FluidSynth (`notes2wav.py`, FluidR3_GM) against the recording, chroma cosine | nylon (program 24) **0.818** over 0.3-152 s, per 10 s 0.747-0.867; the same rendering one measure (3.08 s) late 0.523. Steel (25) 0.875, shifted 0.615. Before the repair 0.817 / 0.524 and 0.874 / 0.615 | `fix/check/render_nylon.json`, `render_steel.json` |
| onsets: the AO-082 checker's onset detector (librosa mel flux, `truth-check-capo/bin/timing.py` parameters) on the recording | After the repair **0.970 of the 406 key onset events** (the four chorus F#4s are now events of their own) **have a detection within 50 ms**; it misses 40.196, 64.563 and 100.478 s, where its peak picking keeps the click or the A3 50-60 ms earlier and drops the pluck, which the check's SuperFlux finds (40.185, 64.554, 100.467 s). The check's SuperFlux: 0.978 of 406 within 50 ms, 0.968 within 30 ms (before 0.978 and 0.963 of 402; `fix/logs/sf_recall.txt`). Before the repair (the rest of this cell): 0.978 of the 402 events in the JSON (this record said 0.975) (per 10 s 0.93-1.00); detection minus key median -11.6 ms (p10-p90 -17.4 to -5.8: the key marks the 1 kHz+ transient peak, the mel detector the earlier low-band rise); missed: 0.308 s (first note, its A2 rises from 0.27 s: thumb stroke), 58.932 s (A3, a ringing re-pluck) and 7 legato or slide targets. 0.749 of the 526 detections are near a key onset: of the other 133, 88 lie 50-150 ms before a pluck (finger contact) and 15 just after one | `key/check/render_nylon.json`, `key/check/detector_extra.json` |
| the same detector on the rendering against the recording | F 0.836 (P 0.970, R 0.734); rendering later by a median 34.8 ms = the FluidSynth nylon sample's own 23.2 ms from note-on to its detected onset + the 11.6 ms above | same |
| early or late onsets (the capo fault) | **This check could not see the fault the independent check found** (problem 1 there): it asks whether a detector fires near the key onset, and the key sat on finger clicks, which are onsets too. What finds it is a test on the note's own pitch: the steepest rise of its unique partials (the check's `ponset.py`) puts 5 notes more than 35 ms after the key before the repair and 1 after (#292, explained in Repairs), with 0.937 -> 0.962 of the 289 notes with a clear rise within 30 ms. The detector-based check itself, after the repair: 1 event early (the pull-off at 104.171 s); 6 late (the first note, 3 legato targets, and 40.196 and 100.478 s as in the row above). Before: 1 early, 4 late | `fix/c1/out/ponset.json`, `fix/check/earlycheck.json` (before: `key/check/`) |
| per-note energy at the partials (the conf test) and its calibration | Method 6 (the builder's rule: 0.851 of the onsets pass after the repair, controls 0.061-0.077; before 0.846, 0.056-0.071). `conf` itself now comes from the independent check (Repairs) | `fix/check/calib2.json` |
| ten notes by hand (the middle of each tenth of the note list: CQT tile around the onset and the video frame) | 8 of 10 show their pitch's line starting at the onset (rise 9.8-21.0 dB, a sharp jump at 7); #145 (A3, 58.932 s, `tab`) is a ringing open string struck again (rise 3.7 dB, no jump); #312 (F#3 in the rolled chord at 117.493 s, `tab`): the F#3 line starts with the F#2 bass, 87 ms earlier, so it is either struck with the bass or only F#2's harmonic. The fretting hand is near the capo for the fret 0-3 notes and in the middle of the neck for the fret-7 notes (abs. fret 9); strings not resolvable at this size. None of the ten was moved; the same after the repair | `key/check/tencheck.jpg`, `tencheck.json`; `fix/check/` |

No transcription model was run against this key (the lane rule: the key will score them).

## What remains uncertain

- **Chord notes above the lowest** (51 notes in the 21 chords and dyads): their order and pitch are sure, their onsets
  come from the one-peak-per-string roll model and are likely within about 0.1 s; a few may be pinched with the bass
  instead (e.g. #312 above).
- **Legato and slide targets** (26): timed from salience changes and moved onto nearby flux peaks; the ornaments are
  fast (a hammer 29-157 ms after its pluck), so a target's onset may be off by up to about 50 ms. Slide targets mark
  the arrival of the pitch.
- **The 38 `tab` notes** (64 before the repair): re-plucks of ringing pitches with only a broadband bump; their onsets
  are flux peaks chosen with the tab's order, not proven plucks of that pitch. Two of them (#13 and #357, A3) show no
  attack at all.
- **Two weak `tab+audio` notes moved in the repair:** #150 (A3, 60.861 s) and #377 (E4, 136.776 s) are re-plucks of a
  ringing open string that pass the rules only just (Repairs).
- **Onsets within 25-40 ms of the convention:** 0.898 of the 383 plucked notes lie within 25 ms of their own-pitch
  estimate and 0.932 within 40 ms (`fix/logs/residual_repaired.txt`). The ones further off are re-plucks of ringing
  open strings, whose estimate is unreliable, and none shows a clearly better pitch rise at its estimate than at the key.
- **Non-note sounds that are not taps:** strong finger or hand clicks with no pitch at 25.61, 51.40, 73.29, 85.96 and
  145.64 s (SuperFlux 0.60-1.63, energy at about 0.8-1.5 kHz only, `fix/frames/iso_a.png`, `iso_b.png`), and about 75
  smaller clicks 50-150 ms before a pluck. A tool that reports a note at one of these is charged with an extra note.
- **The onset convention**: the key marks the 1 kHz+ transient peak; the broadband attack starts a median 11.6 ms
  earlier and by 40-50 ms on a few thumb strokes (the first note). Models trained on GuitarSet mark about 20-30 ms
  earlier than such keys (AO-082).
- **Beats, measures, tempo** are the builder's reading (the tab has no rhythm); the chords and the key are derived.
- **Offsets** are a rule, not measured: use onset metrics.
- **No video truth file** was written (not asked for this slot); the frames show one static shot with the nut and
  headstock in view.
- **Audited** by an agent that did not build the key (`september-check.md`), and repaired (Repairs). The repair has been
  re-checked only by its own second pass so far.
- **Training sets**: not checked against the sets' file lists. GuitarSet (2018) cannot hold this 2023 recording; a
  Vimeo-only pop arrangement is unlikely to be in GAPS (classical scores), GOAT or the Leduc set, but that is not
  proven.

## Repairs

Done 2026-11-27 by a lane H repair agent after the independent check (`september-check.md`, verdict "not passed yet").
Work folder `fix/` (`bin/`, `logs/`, `out/`, `frames/`, `c1/`; the first build's truth files in `orig/`, SHA-256
`892d95c0cdb0...`). Repaired `september.truth.json`: SHA-256 `8bba0443bdcb...` (`fix/logs/installed.sha256`); every
check below ran on that file.
- **Scripts.** `fix/bin/rebuild.sh` runs the repair from the builder's refined alignment (`key/out/refined12.json`) to
  the installed key: `moves.py`, then `build_fix.py` (the builder's `build.py` with the repair applied), then
  `check-truth`, the install and a diff against the first build (`fix/logs/diff_repair.txt`). `fix/bin/selfcheck.sh`
  runs the builder's self-checks again, and `fix/c1/run.sh` runs the independent check's scripts (copies) again.
- **Per-note file.** Every note the repair changed or looked at, before and after, with its decision and evidence:
  `fix/out/september-repairs.csv`, 60 rows. It stays out of git, as `notes/.gitignore` asks.
- **No note transcriber was used.** Times and pitches came from the recording only: the builder's 1 kHz+ flux, the
  check's SuperFlux peaks, STFT and CQT energy at each note's partials, and pictures.

**The key's onset convention, measured** (`fix/bin/conv.py`, on 249 clean notes whose own pitch rises at least 10 dB):
- The key marks the builder's 1 kHz+ flux peak.
- That is the check's SuperFlux peak + 8.7 ms (IQR 5.8-11.6).
- It is also the steepest rise of the note's unique partials + 17.0 ms (IQR 12.7-19.9). The unique partials are the
  harmonics clear of every other key pitch nearby, measured with a 2048-point STFT at frame centre, as in the check's
  `ponset.py`.
- A moved note goes to the mean of those two estimates. If the builder's 1 kHz+ peak list has a peak within 5 ms of
  that mean, the note goes to the peak instead (`fix/bin/moves.py`).

### The 14 moved notes

| # | note | before (s) | after (s) | shift ms | own-pitch steepest rise (s) | SuperFlux peak (s) | found by |
|---|---|---|---|---|---|---|---|
| 21 | G#3 s4 f4 | 10.0775 | 10.1888 | +111 | 10.1700 | 10.1820 | check, problem 1 |
| 31 | F#3 s4 f2 | 13.0844 | 13.2401 | +156 | 13.2249 | 13.2296 | check, problem 1 |
| 97 | F#3 s4 f2 | 40.1531 | 40.1958 | +43 | 40.1809 | 40.1850 | repair scan |
| 103 | E3 s4 f0 | 42.0049 | 42.0612 | +56 | 42.0425 | 42.0542 | repair scan |
| 136 | G#2 s6 f4 | 56.3664 | 56.4371 | +71 | 56.4183 | 56.4303 | check, problem 1 |
| 150 | A3 s3 f0 | 60.7028 | 60.8605 | +158 | 60.8417 | 60.8537 | check, problem 1 |
| 164 | F#4 s2 f5 | 64.5166 | 64.5633 | +47 | 64.5465 | 64.5544 | repair scan |
| 205 | F#4 s2 f5 | 77.0612 | 77.1135 | +52 | 77.0965 | 77.1048 | repair scan |
| 255 | G#3 s4 f4 | 95.8636 | 95.9660 | +102 | 95.9499 | 95.9565 | check, problem 1 |
| 269 | A3 s3 f0 | 100.4263 | 100.4785 | +52 | 100.4585 | 100.4669 | check, problem 3 (on the builder's 1 kHz+ peak, its original time) |
| 272 | F#3 s4 f2 | 101.1635 | 101.2083 | +45 | 101.1896 | 101.2013 | check, problem 3 |
| 335 | F#4 s2 f5 | 124.0062 | 124.0574 | +51 | 124.0365 | 124.0526 | repair scan |
| 376 | F#4 s2 f5 | 136.6320 | 136.6843 | +52 | 136.6636 | 136.6727 | repair scan (on the builder's 1 kHz+ peak) |
| 377 | E4 s1 f0 | 136.6843 | 136.7761 | +92 | 136.7610 | 136.7655 | repair scan |

- **Problem 1 of the check, five notes on a click: fixed** (#21, #31, #136, #150, #255).
  - In the pictures the note's line starts at the new time, and the old time holds only the click's high partials
    (`fix/frames/move_a.png`, `move_b.png`).
  - Own-pitch rise, the summed unique partials over -85..-40 ms against +5..+55 ms (`fix/bin/heard.py`), old time ->
    new time: #21 +6.3 -> +9.7 dB (h2 +15.5), #31 +1.1 -> +30.7, #136 +3.2 -> +12.5, #150 -0.4 -> +3.6 (h1 +11.6, h3
    +13.4), #255 +3.7 -> +6.0. This measure cannot separate times 30-50 ms apart; the table's steepest rise and
    SuperFlux columns place the notes.
  - The new times are 0-17 ms from the check's suggestions. For #31 (13.225) and #136 (56.42) the check used the
    half-rise + ~20 ms, and the repair used the measured convention.
- **Problem 3 of the check: #269 and #272 fixed, #292 kept.**
  - #269 goes back to the builder's first time, 100.4785. Its A3 dips at 100.42 (the finger lands on the ringing
    string) and rises at 100.45-100.47.
  - #292 (F4, 108.170 s) is plucked once, at 108.13-108.17. With a 2048 window its h4 rises 20 dB and its h1 24 dB
    there, and neither rises again at 108.27 (`fix/bin/harm.py`). The later rise in the check's unique partials is the
    E4 (#293, plucked at 108.27, a semitone away) leaking into the F4 h1 and h2 bands. The key's 108.170 is the
    1 kHz+ peak of that pluck, 9 ms after its estimate.
- **The same fault elsewhere: 7 more notes moved.** The check asked for a pitch-specific scan of every note.
  - Two scans flagged 38 notes, and the repair looked at all of them in pictures (`fix/frames/scan_*.png`):
    - `fix/bin/attack.py` takes the largest dB step of the note's unique partials within -80..+200 ms and compares it
      with the key's convention.
    - `fix/bin/scan_late.py` looks for a later rise of at least 6 dB, or of at least 10 dB at h1-h3, with a SuperFlux
      peak.
  - **The chorus D chord** (D3 A3 F#4 E4, chorus bars 9 and 11, four times) is rolled one string at a time. The
    builder's roll model put the A3 and the F#4 on one flux peak. The F#4 is in fact plucked 40-55 ms after the A3, on
    its own SuperFlux peak: #164, #205, #335, #376.
  - In the fourth chord the E4 was one peak early too (#377). After the repair the E4 follows the F#4 by 92 ms; in the
    other three chords the gap is 108-124 ms.
  - The check had verified the other rolled chords, not these.
  - **#97** (the same F#3 figure as #272, verse 2) and **#103** (E3, a downbeat) sat on a click 40-55 ms before the
    pluck. The same figures in the other verse passes are on their attack (within 25 ms), so these were single
    misplacements. The chorus F#4 was wrong in both choruses.
- **Flagged and not moved: 24 notes.**
  - Leakage, 3 notes: a pitch a semitone or a tone away leaks into the note's band in a 46 ms window. For #180 and
    #310 it is the F#2 chord's F#3 leaking into E3 h1; an 8192 window shows E3 h1 flat there while F#3 rises 28-31 dB.
    For #153 it is the G#3 #152 leaking into A3.
  - Beating, 7 notes: a ringing open string with no step anywhere near (#22, #85, #88, #200, #296, #330, #371).
  - Legato targets, 6 notes, flagged by the step measure, which does not fit them: the check's `legato.py` puts #46,
    #109, #280 and #91 within 5 ms and #110 within 13 ms; #217 is a slide whose key marks the arrival, mid-glide by the
    step measure.
  - 26-38 ms from the convention by the step measure, 8 notes: #7, #16, #114, #161, #253, #319, #345, #368. By the
    `moves.py` estimate, #345 and #368 lie within 25 ms. For the other six the own pitch rises about the same at the
    key and at the estimate (within 1.5 dB; `fix/logs/residual_repaired.txt`). #368 sits on a strong attack
    (SuperFlux 0.53). #319 sits 26 ms before the SuperFlux peak and rises 12 dB at both times. Both are drawn in
    `fix/frames/scan_e.png`.

**Fields that follow the moves** (`fix/logs/diff_repair.txt`):
- **Offsets.** 14 notes' offsets changed (the rule measures from the attack). #31 was a 20 ms note ending at 13.1044
  and now ends at 14.1341.
- **Beats and downbeats.** 7 of 192 beats and 4 of 48 downbeats moved with their notes: 10.0775, 13.0844, 42.0049 and
  95.8636 s, now 10.1888, 13.2401, 42.0612 and 95.9660 s.
- **Chords.** The chord segments starting on those downbeats moved with them. The labels did not change: 62 segments.
- **Tempo** is now 78.01 bpm (77.71 before). The key is still A major.

### Problem 2, `conf`: set from the check, the moved notes re-checked

- Every note's `conf` now comes from the check's `conf_check` (`check1.json`). That moves 30 notes up to `tab+audio`
  and 5 down to `tab` (#253, #310, #327, #355, #357).
- The 14 moved notes were re-checked at their new time. A note counts as heard when its unique partials rise at least
  6 dB together, or one of h1-h3 rises at least 10 dB. All 14 are heard.
- That changes one more note against the check: **#150 A3 is `tab+audio`**, where the check kept it `tab` (+8 dB at its
  unique partials).
  - At 60.8605, A3 h1 rises 11.6 dB and h3 13.4 dB from the damped level and stays up.
  - The check's own two calibrated rules (null pass 0.029) both pass there when its scripts are run on the repaired key.
  - The bump at the old time, 60.69, is the click's h6 and h8 only.
  - It is still the weakest of the moved notes, with #377.
- **Counts: 377 `tab+audio`, 38 `tab`, 2 `audio`** (before 351 / 64 / 2; the check's 376 / 39 / 2).

### Problem 4, the muted strums: two `string-slap` taps

- **120.239 s** (SuperFlux 1.36 at 120.227): open-string partials rise 15-28 dB and die within about 60 ms.
- **132.812 s** (SuperFlux 0.61 at 132.804): the same, weaker.
- Each tap sits at the builder's 1 kHz+ peak (`fix/bin/tapcheck.py`, `fix/frames/taps.png`). The video frames do not
  settle the stroke at this size.
- **Clicks that are not taps.** The strong isolated clicks at 25.61, 51.40, 73.29, 85.96 and 145.64 s carry no pitch
  (energy at about 0.8-1.5 kHz only, no line after them). They are named under What remains uncertain and are not taps:
  a finger or hand sound is not a stroke.

### Problem 5, small: fixed

- The `.tab.txt` header now says what a column is: one two-character cell = a sixth of a beat (an eighth = 3 cells = 6
  characters, a bar = 24 cells).
  - The check counted characters, so it read the old "one column = a sixth of a beat" as wrong. For a two-character
    cell it was right, but it was unclear.
- The early-placement line of Checks now names the fault that check cannot see.

### Checks after the repair

| check | after (before) | file |
|---|---|---|
| `gtr-eval check-truth` 0.12.1 | 4325 checks, 0 mismatches, 2 taps (the same, 0 taps) | `fix/logs/checktruth.json` |
| side files rewritten and scored against the JSON | `notes.csv` 1.0 / 1.0; `.mid` onset 1.0, onset+offset 0.954; `beats.txt` F 1.0; `.tab.txt` 410 of 417 matched, 1.0 same string and fret (all as before) | `fix/logs/side_*.json` |
| the check's schema script (copy) | every key present, 0 duplicates, 0 same-string overlaps, pitch formula 417/417; notes under 30 ms: #26 and #108 only (#31 fixed); taps sorted, inside the audio | `fix/c1/out/schema.json` |
| the check's pitch-specific onsets (`ponset.py`, copy) | 0.962 of the 289 notes with a clear rise (>= 6 dB) within 30 ms of the key (0.937 of 287); notes whose pitch starts more than 35 ms after the key: 1, #292, explained above (5) | `fix/c1/out/ponset.json`, `fix/logs/c1_rerun_compare.txt` |
| the check's two `conf` rules (copies of `pernote4.py`, `peaks.py`, `verdicts.py` with its look decisions) | both rules pass for 0.818 of the notes (0.813). The verdicts differ from the key's `conf` only at #150 (above), because the check's look decision for it was made at the old time | `fix/c1/out/check1_rerun.json` |
| the check's SuperFlux against the key events | 0.978 of 406 events within 50 ms, 0.968 within 30 ms (0.978 and 0.963 of 402) | `fix/logs/sf_recall.txt` |
| own-pitch estimate (`moves.py` rule) for every plucked note | 0.898 of 383 within 25 ms of the key, 0.932 within 40 ms (0.872 and 0.909) | `fix/logs/residual_repaired.txt` |
| FluidSynth rendering against the recording, chroma | nylon 0.818, one measure late 0.523; steel 0.875 / 0.615 (0.817 / 0.524, 0.874 / 0.615) | `fix/check/render_*.json` |
| the builder's detector checks | mel detector 0.970 of 406 (0.978 of 402), with the three misses explained in Checks; early/late as in Checks | `fix/check/render_nylon.json`, `earlycheck.json` |

**Second pass, fresh eyes.** `fix/bin/pass2.py`, seed 20261127, took 30 random notes that were not moved and 10 of the
14 moved notes. For each, the repair looked at a CQT crop with the note's unique-partial, h1 and h2 level traces and
both detectors' peaks (`fix/frames/p2_0.png` to `p2_6.png`). Verdicts are in `fix/out/pass2_look.tsv`, numbers in
`fix/out/pass2.json`.
- **Random 30.** All 30 sit on the attack of their own pitch; for legato targets, the attack of the target pitch.
- **`conf` of the random 30.** All 30 match what the pictures show: 27 heard, and 3 `tab` with no rise (#28, #85,
  #310).
  - The numeric heard rule agrees on 29. #46 is a hammer target whose unique set is only h7; in the picture its h1
    rises 20 dB at the hammer.
- **The 10 moved.** All 10 are heard at their new time, with the line starting there. #150 and #377 are weak (above).
  #21 and #255 show the click's small G#3 bump 100 ms earlier and the pluck at the new time.
