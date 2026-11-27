# Held-out slot `september`: *Wake Me Up When September Ends (Jonathan's Version)*, Evan Handyside

Lane H of the NOTES session, 2026-11-27. This record covers **fetch and prepare only** (task steps 1-4): the files,
the cut, the time base, the tuning and capo checks, the rights note and the credit line. The key (two readings of the
tab, notes timed to the recording, `conf`, the independent check) is later work and will be added below. Work folder
(not in git): `/home/user/gtv/work/heldout-september/` (`PROGRESS.md`, `bin/`, `logs/`, `frames/`, `tab/`). Every
number below comes from a file named next to it. No note transcriber was run on this recording in this step: the
checks use only the raw audio (onset strength, CQT, chroma) and the picture.

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
  anywhere (`privacy` "disable", `embed_permission` "public").
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
| `/home/user/gtv/songs/september/video.mp4` | the download: the Vimeo HLS 1080p video rendition and its one audio rendition ("Original"), joined by stream copy (no re-encode). H.264 1920x1080, 29.97 fps (30000/1001), 165.532 s, 4961 frames; AAC 48 kHz stereo, 165.547 s; both streams start at 0 |
| `When-September-Ends-Jonathans-Version.pdf` | the tab as downloaded (806,343 bytes, 2 pages, scanned, no text layer); pages at 300 dpi in the work folder `tab/page-1.png`, `tab/page-2.png` |
| `post.json`, `post.txt`, `page.logged-out.html` | the post from the REST API (whole), its musical part as text, and the page as a logged-out visitor sees it |
| `september.mp4` | what the tools and any blind run get: the cut below, full frame 1920x1080, **a black box (x 200, y 428, w 1636, h 240) over the title on the cut's first 75 frames**, x264 crf 16 (preset medium, GOP 50, yuv420p), AAC audio copied, metadata stripped |
| `september.full.mp4` | the same cut, no box (the title shows on its first 75 frames) |
| `september.wav`, `september.mono.wav` | from `september.mp4`: 44.1 kHz 16-bit, stereo and mono |

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
- **Time base:** TIMEBASE_LINE

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

## Notes for the key builder

- The tab has **no rhythm and no bar lines inside most systems**: the order of notes is fixed, the onsets must come
  from the recording (as `../../video/truth-tuning.md` did), without any note transcriber (lane rule).
- Form in the post: Intro; Verse 2x, To Chorus, Chorus; Intro; Verse 1x, To Chorus, Chorus; End. The `tuning` slot's
  recording added a pass the post did not list; check the form against the recording before unrolling.
- Marks seen on the page: slurs (3-5 and 0-3-0 on string 2, 0-2 on string 1), repeat signs, a "To Chorus" arrow from
  the middle of the verse's last system, and a slanted line in page 2, system 4 (a bar line or a slide: for the two
  readers to settle).
- The intro is heard as written: four groups of open 5th string, open 3rd string, 2nd string fret 3 (A2 A3 E4), plucks
  at 2.81, 3.24, 3.59 / 3.91, 4.43, 4.81 / 6.10, 6.63, 7.01 / 7.30, 7.86, 8.24 s of `video.mp4` (a pause of about
  1.3 s after the second group).
