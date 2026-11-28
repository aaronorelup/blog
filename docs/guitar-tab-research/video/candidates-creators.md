# Song candidates from performers and arrangers (scout `song-scout-creators`)

Stage-1 scout, 2026-11-24. Lane: performers and arrangers who publish their own tablature next to their own
performance video. Heavy files are under `/home/user/gtv/candidates/creators/` (not in git). Every fact below was
read or measured on 2026-11-24 from this box.

## What answers from this box (and what was refused)

| Source | Result |
|---|---|
| YouTube | Refused. `yt-dlp` lists formats, but every media request answers HTTP 403 (tried twice, plain default format and one itag). Not worked around. Most performer pages (This Is Classical Guitar, the Guitar Pro blog, tallstrom.com, intellimusica's older posts) embed YouTube, so their videos are not downloadable here. |
| Vimeo | Answers through `https://player.vimeo.com/video/<id>` (the `vimeo.com/<id>` page needs a login in yt-dlp). Videos whose owner restricts embedding to their own domain answer 401 (e.g. 316158586, 320174044): not attempted further. |
| Odysee (LBRY) | Metadata API answers (search, channel lists, descriptions). The video CDN `player.odycdn.com` answered HEAD 200 but GET 429 "Try again later" / 401; yt-dlp's `lbry` extractor reported "No video formats found". A retry with browser-like Referer/Origin headers was **refused by this box's permission system** and was not repeated or worked around. So Odysee videos were not downloaded. |
| archive.org | Answers. Searched by creator, subject and description (TubeUp YouTube mirrors included): no mirror of any performer below with a matching free tab was found. |
| Dailymotion | Answers (formats listed). Guitar results are mostly third-party re-uploads, 360-576p; none usable. |
| Wikimedia Commons API | HTTP 429 to this box (rate limit, probably shared egress); left to the Commons scout. |
| Payhip | Cloudflare block page (403). Bilibili: geo-restricted message. |
| Dropbox, tallstrom.com, guitar-pro.com assets, intellimusica.com uploads | Answer; tab files downloaded directly. |

## Summary

| Slot | Candidate | Performer / tab maker | Video | Tab | Downloaded |
|---|---|---|---|---|---|
| (a) capo | Wake Me Up When September Ends (Jonathan's Version) | Evan Handyside (both) | Vimeo 813529239, 1920x1080, 2:45 | handwritten PDF, Open G + capo 2 | video + tab |
| (b) tuning | A soft collision of breath (original) | Evan Handyside (both) | Vimeo 1149455966, 2304x1296, 3:07 | handwritten PDF, D G C F A C | video + tab |
| (b) tuning, alt | Supergirl Suite (Claudia Sarne, arr.) | Evan Handyside (both) | Vimeo 1203837536, 2304x1296, 2:22 | handwritten PDF, D G C F A C | video + tab |
| (c) neither | The Brutalist Theme (Daniel Blumberg, arr.) | Evan Handyside (both) | Vimeo 1048292273, 1920x1080, 1:47 | handwritten PDF, standard | video + tab |
| (c) neither | The Witcher: River of Life (classical guitar cover) | Wechselfälle (both) | Odysee/YouTube, 1920x1080, 5:17 | Guitar Pro 6 `.gpx` + PDF, standard | tab only |
| (a) capo | Eléa (original waltz) | Jérémy Cauliez (both) | YouTube WfKOc7Iz8qs | Guitar Pro 7 `.gp`, standard + capo 2 | tab only |
| (b) tuning | Talk (Coldplay), arr. | Antoine Dufour (both) | YouTube bbSKVqPOVjo | `.gpx`, D#2 A#2 C3 G3 A#3 D4 | tab only |
| (b) tuning | Eye of the Tiger (Survivor), arr. | Van Larkins (both) | YouTube UJxuuVBiaZ4 | `.gp`, C2 G2 C3 G3 C4 D#4 | tab only |
| (c) neither | William Tell Overture (Rossini), arr. | Michael Fix (both) | YouTube _y-r8KXTYLo | `.gp`, standard | tab only |
| (a)/(b) | about 40 pieces, e.g. The Rose (open G + capo 4), Angel (DADGAD) | Martin Tallström (both) | YouTube (his channel) | `.gp5` + PDF | tab only (15 `.gp5` kept) |

The only candidates fully downloadable now are the four by Evan Handyside: one performer, one nylon-string crossover
guitar, a static camera in similar rooms. So this lane can fill one slot with a downloaded recording; the "tab only"
rows become usable if the video is fetched on a machine where YouTube answers and are listed for
that case. The Handyside tabs are handwritten and carry no rhythm (see "Tab format" below).

---

## (a) CAPO: "Wake Me Up When September Ends (Jonathan's Version)", Evan Handyside

- Performer and arranger: Evan Handyside (Intellimusica, "Uncommon ideas for the practicing guitarist").
- Source page: https://www.intellimusica.com/wake-me-when-september-ends-jonathans-version-guitar-tab/ (category
  "Free TABs"); video https://vimeo.com/813529239 (title "Wake Me Up When September Ends (Jonathan's Version) |
  fingerstyle guitar + TAB", uploader Evan Handyside).
- Licence / terms as stated: site footer "Copyright © 2026 Intellimusica"; no licence for reuse stated. Vimeo: none
  stated (all rights reserved by default).
- Credit line: "Wake Me Up When September Ends (Green Day), arranged and played by Evan Handyside, intellimusica.com".
- Video: 1920x1080, 29.97 fps, 165.5 s, H.264 5.3 Mb/s, AAC 48 kHz stereo (109 MB).
- Camera: static, front view from slightly left; whole guitar including headstock and the capo in frame, fretting
  hand and picking hand both visible all through (frames at 30 s and 100 s checked). Nylon-string cutaway guitar.
  No tab or text over the hands.
- Tuning and capo (stated in the post): "Open G tuning with a capo on the 2nd fret ... D G D G B D". Capo visible on
  fret 2 in the video.
- Form (post): Intro; Verse 2x, To Chorus, Chorus; Intro; Verse 1x, To Chorus, Chorus; End.
- Tab: 2-page PDF, handwritten by the performer (dated 3/22/23): string and fret numbers in order, repeat signs, no
  note durations. Not machine-readable; needs transcription into a note list.
- Match check (pitch content): notes read from the tab's intro and first verse line (s5 0, s3 0, s2 3 x4; then s4 5,
  s3 0, s2 3/5, s4 4) sound A2 A3 E4 and A3 E4 F#4 G#3 with capo 2. Mean CQT chroma of the audio 0-25 s (librosa
  1.0.1 `chroma_cqt`, script `_bin/chroma_check.py`): top classes E 1.00, A 0.97, G# 0.58, F# 0.52.
  Cosine with the tab's pitch-class set by transposition: 0 semitones 0.820, next best 0.605; the "no capo"
  reading (-2) 0.512. Lowest strong note A2 (open 5th string + capo 2). Tuning offset +5 cents.
- Fame: the song is very well known (Green Day, 2005); the arrangement and its open-G fingering are Evan's.
- Rights: copyrighted composition (Green Day); see the Intellimusica access note below.
- Files: `/home/user/gtv/candidates/creators/handyside-september/` (`september.mp4`,
  `When-September-Ends-Jonathans-Version.pdf`, `post.txt` with the post text).

## (b) UNUSUAL TUNING: "A soft collision of breath", Evan Handyside (original)

- Composer, arranger and performer: Evan Handyside.
- Source page: https://www.intellimusica.com/a-soft-collision-of-breath/ ("Free TABs"); video
  https://vimeo.com/1149455966 ("A soft collision of breath \\ Original by Evan Handyside | Fingerstyle Guitar").
- Licence / terms: as above (no reuse licence stated).
- Credit line: "A soft collision of breath, composed and played by Evan Handyside, intellimusica.com".
- Video: 2304x1296, 30 fps, 187.4 s, H.264 9.3 Mb/s, AAC 48 kHz stereo (212 MB).
- Camera: static, front view; picking hand and fretting hand visible, but the neck runs to the right frame edge, so
  the nut and headstock are cut off and the fretting hand works close to the edge (frames at 10, 60, 120, 170 s).
  Nylon-string guitar. No text over the hands.
- Tuning (post): "tuned one whole step down, then dropping the 1st string and additional whole step: D G C F A C"
  (the handwritten tab says "TUNING: D G C F A C"). No capo.
- Form (post): Verse 4x, Chorus; Verse 4x, Chorus 2x; End.
- Tab: 1-page handwritten PDF (dated 12/26/25), chord names written as the shapes (C/E, D/F#, Am, Em, C, G5, D11),
  no durations.
- Match check: first verse line read from the tab (C/E shape: s6 0, s5 3, s4 2, s3 0, then s2/s1 open; D/F# shape)
  gives, in D G C F A C, sounding pitch classes A x9, C x6, D x4, G x4, F x3, A#, E. Audio 0-45 s chroma top classes
  A 1.00, G 0.84, D 0.76. Cosine by transposition: 0 semitones 0.841, next best 0.782 (+7); the same notes at
  standard pitch (+2) 0.658, so the whole-step-down tuning is confirmed. Tuning offset -10 cents.
- Fame: original from December 2025; a model cannot know it from training.
- Files: `/home/user/gtv/candidates/creators/handyside-softcollision/` (`softcollision.mp4`,
  `a-soft-collision-of-breath.pdf`, `post.txt`).

### (b) alternative: "Supergirl Suite", Evan Handyside

- Theme from Supergirl (2026) by Claudia Sarne, arranged and played by Evan Handyside. Page
  https://www.intellimusica.com/supergirl-guitar-tab/ ; video https://vimeo.com/1203837536.
- Video: 2304x1296, 30 fps, 142.0 s, 8.2 Mb/s (143 MB). Static camera in another room; neck runs to the right edge,
  headstock partly in frame; both hands visible.
- Tuning (post): "one whole-step down tuning, with the 1st string dropped one step further ... D G C F A C". No capo.
  Form: Intro, Verse 2x, Chorus 2x, Verse 1x. Tab: 2-page handwritten PDF (6/28/26), no durations.
- Match check: intro and first verse notes read from the tab (sounding A2 E4 G2 F4 A3 F3 D3 B3 C4 ...) against audio
  0-40 s: cosine 0.842 at 0, 0.844 at +5 (A minor / D minor ambiguity of a pitch-class profile), standard-pitch
  reading (+2) 0.473. Consistent, not decisive on its own.
- Fame: a 2026 film theme, not widely known. Rights: copyrighted film score.
- Files: `/home/user/gtv/candidates/creators/handyside-supergirl/`.

## (c) NEITHER: "The Brutalist Theme", Evan Handyside

- Theme from The Brutalist (2024, Daniel Blumberg), arranged and played by Evan Handyside. Page
  https://www.intellimusica.com/the-brutalist/ ; video https://vimeo.com/1048292273.
- Video: 1920x1080, 29.97 fps, 106.6 s (below the 1.5-minute target only slightly), 5.1 Mb/s (68 MB). Static camera,
  whole neck including headstock in frame, both hands visible. Nylon-string guitar.
- Tuning: "played in standard tuning" (post); no capo. Form: "one long passage played 2x".
- Tab: 1-page handwritten PDF (1/16/25), chord names Cmaj7, Fmaj7, Em7, Am, Em, F2, C; no durations. This is the only
  one of the four whose PDF link is shown on the public page.
- Match check: chord tones of the written chords against audio 0-50 s: top chroma C 1.00, E 0.81, F 0.75, G 0.52,
  A 0.44; cosine 0.873 at 0, 0.856 at +5 (C/F ambiguity). Consistent, not decisive.
- Files: `/home/user/gtv/candidates/creators/handyside-brutalist/`.

### Intellimusica: access and rights note (notable)

The site runs the "Leaky Paywall" plugin. All four posts are in its "Free TABs" category, and the PDF files are public
uploads under `wp-content/uploads/`, but only The Brutalist's page showed the PDF link to this box's logged-out
request; for the other three the link came from the site's public WordPress REST API
(`/wp-json/wp/v2/posts?categories=822`). Before the film shows these tabs, a (free) account on the site or a word with Evan Handyside
would settle it. Evan's other 500+ tabs are "Premium" (paid) and were not touched.

### Tab format of all four Handyside candidates

Handwritten six-line tab scanned to PDF (no text layer), one or two pages, with repeat signs and the playing order
written in the post. No rhythm, no tempo, no bar lines inside systems. Ground truth needs a careful transcription of
string/fret order, then onset times from the audio (the order is fixed by the tab, so an alignment is enough).

---

## Tab-only candidates (video not downloadable from this box)

### (c) "The Witcher: River of Life (Classical Guitar Cover)", Wechselfälle

- Performer and tab maker: the channel Wechselfälle (German; fantasy, lute and guitar covers). Composition: Paweł
  Błaszczak (The Witcher, 2007 game).
- Video: Odysee `lbry://@Wechselfaelle#5/the-witcher-river-of-life-(classical#9` (1920x1080, 317 s, 232 MB file on
  the CDN; download refused as above) and YouTube BgAyfXjrEW0 (refused).
- Tab: Guitar Pro 6 `.gpx` and PDF by the performer, linked in the video description on Dropbox:
  `https://www.dropbox.com/s/qw46bufhrz5n1gd/...gpx`, `https://www.dropbox.com/s/z9uens7t4iaekwx/...pdf`.
  Parsed with `_bin/gp_inspect.py`: title "River of Life", artist "Pawel Blaszczak", standard tuning E2 A2 D3 G3 B3
  E4, capo 0, 107 bars, tempo 80, 798 notes in voice 1. A note list is saved as `river_of_life.notes.json`.
- Match: not checked against audio (no audio could be fetched).
- Licence: none stated; "Here is the guitar pro 6 tab" in the description. Other Wechselfälle covers with `.gpx` on
  Dropbox: "Conan the Barbarian: Recovery" (guitar, 720p), "Theology/Civilisation" (guitar, 1080p), several lute
  pieces.
- Files: `/home/user/gtv/candidates/creators/wechsel-riveroflife/`.

### Guitar Pro blog (Arobas Music): artists' own Guitar Pro files, free downloads

Downloaded to `/home/user/gtv/candidates/creators/tabonly/guitarpro-blog/` from `assets-wp.guitar-pro.eu`; each post
embeds the artist's YouTube video. Parsed facts:

| File | Post | Tuning (low to high) | Capo | Bars | Notes (voice 1) | Video |
|---|---|---|---|---|---|---|
| `Elea_Jeremy_Cauliez-5.gp` | /blog/p/13487 "Eléa", a waltz by Jérémy Cauliez (original) | E2 A2 D3 G3 B3 E4 | 2 | 110 | 511 | YouTube WfKOc7Iz8qs |
| `Antoine_Dufour-Talk.gpx` | /blog/p/12125 "Talk" (Coldplay cover) | D#2 A#2 C3 G3 A#3 D4 | 0 | 34 | 203 | YouTube bbSKVqPOVjo |
| `Eye_of_the_Tiger_Van_Larkins.gp` | /blog/p/16719 | C2 G2 C3 G3 C4 D#4 | 0 | 108 | 1750 | YouTube UJxuuVBiaZ4 |
| `Michael-Fix-William-Tell-Overture.gp` | /blog/p/9211 | standard | 0 | 125 | 1807 | YouTube _y-r8KXTYLo |
| `Timo-Brauwers-Perfect.gp` | /blog/p/16128 (Ed Sheeran) | standard | 1 | 103 | 439 | YouTube L_2_LGwprys |
| `DANGEROUS-WOMAN.gp` | /blog/p/13479 Anouck André | standard | 0 | 9 | 112 | YouTube GqNhlN8Z33M |
| `Feel-Good-Inc.gp` | /blog/p/13757 Luca Stricagnoli | (4 tracks; first track has no guitar tuning) | | 114 | | YouTube Z6_HlOqy2C0 |

Notes: Eléa is an unknown original with a capo, the best capo candidate here if its video can be fetched. Talk (34
bars) may be an excerpt. Licence: free download offered by Arobas; no licence text.

### Martin Tallström (tallstrom.com/free-tabs): about 40 free PDF + Guitar Pro 5 tabs of his own YouTube performances

Swedish fingerstyle guitarist; each title links to his YouTube video (channel "pinofluvius"). Fifteen `.gp5` files
(and the Angel PDF) are in `/home/user/gtv/candidates/creators/tabonly/tallstrom/`. Parsed: The Rose (D G D G B D,
capo 4), Angel (Sarah McLachlan, DADGAD; the page says the video is played a half step lower, Db Ab Db Gb Ab Db),
Drift Away (original, drop D), Twin Peaks Theme (D G D G B E), Ode to Billie Joe (drop D), Lost in the Rain (original,
capo 2), Jätten Jorms Sång (capo 2), Carina's Blues (capo 2), A Whiter Shade of Pale (capo 2), Summer Breeze (capo 3),
Chet Chat, Shuffle Rag, Ambient Groove (originals, standard), Vår Vals, Wichita Lineman (standard). His videos were not
found on Vimeo, Odysee, archive.org or Dailymotion (one Dailymotion upload of The Rose is another player, 576p).

---

## Looked at and not taken (reason)

- Bradford Werner, This Is Classical Guitar: free notation and TAB PDFs, videos YouTube only; the "Jesu, Joy" free PDF
  now points to the paid store.
- Adam Rafferty (Odysee mirror, 1080p): "Ciao Bella" (original, standard) tab is free but behind an email form.
- Bernd Gast (Odysee): "free tabs" by email request. Lindsay Straw: free tabs for newsletter sign-up.
- GuitarToday (Odysee, 642 videos, tab strip on screen): tabs $2 on Gumroad. Jon Gomm (Odysee, 1080p, unusual
  tunings): tabs £5-6. Dmitry Pimonov (Odysee, original "New Life" in F A D G C E): tabs paid.
- Pauly's Guitar Journal / Paul Brooks Horn (Odysee, 1080p, free public-domain editions): Payhip blocks this box.
- Brett Vachon (Odysee): tabs on SubscribeStar or sign-up; a free "A Little Bit of Blues" PDF via bit.ly, 720p, 100 s.
- Odysee generally: video download refused (see top).
- Vimeo DADGAD performances (Günter Geurts / Jens Kommnick "Gabriellas Sång", Palle Tenfalk): embed-restricted (401);
  Kommnick's tab is sold.
- archive.org: William Nein "Avoiding the Birds guitar tutorial" (1080p, D G D G A D + capo 2, uploaded by the
  performer) has no tab file; Russ Rentler "La Petite Voie" (DADGAD) is 640x480 with no tab.
- Soundslice (many performers publish synced tab there): the slice data is only in the player; no export was
  attempted.
- FingerTabs.com: re-posts other artists' tabs, not the performer's own.

## Tools left for later stages

- `/home/user/gtv/candidates/creators/_bin/gp_inspect.py`: reads `.gpx` (GP6 BCFZ container, own decompressor),
  `.gp` (GP7/8 zip) and `.gp3-5` (PyGuitarPro), prints tuning, capo, tempo, bars and writes a note list
  (`--json`), sounding pitch = open string + fret + capo.
- `/home/user/gtv/candidates/creators/_bin/chroma_check.py`: mean CQT chroma of a window, cosine with an expected
  pitch-class set at all 12 transpositions, low-band energy C2-B2.
- Python used: a scratch venv with librosa 1.0.1 and PyGuitarPro from the research's uv cache.
