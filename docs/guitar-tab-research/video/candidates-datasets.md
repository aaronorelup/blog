# Candidate recordings from research datasets

Scout `song-scout-datasets`, stage 1 of the AO-082 film, 2026-11-24. Source kind searched: research datasets and
papers that ship video with a note-level or tablature annotation (Zenodo, Hugging Face, DataCite, arXiv, university
pages). Heavy files are on the cloud box under `/home/user/gtv/candidates/` (paths at the end of each section).

## Bottom line

| Slot | Best from datasets | Truth on the box | Video on the box |
|---|---|---|---|
| (a) capo | No dataset holds a whole capo performance with video. Fallback: GuiFiR test segments, 40 to 60 s each, capo 1 to 6 | yes (per-note string/fret labels + on-screen tab) | yes, the segments only |
| (b) unusual tuning | GAPS: *Choro de Saudade* (D G D G B E), *Lachrimae Pavan* (lute tuning, 3rd string F#), *Caazapá* (D G D G B E) | yes (MusicXML TAB, aligned MIDI, Guitar Pro 6, PDF, performance audio) | **no**: YouTube only, refused |
| (c) neither | GAPS: *Gebeth* (Mertz), *Velha Seresta* (Reis), *El Viaje* (Piazzolla), *Gallardas* (Sanz) | yes (same set) | **no**: YouTube only, refused |

**YouTube refused this box.** On 2026-11-24 at about 23:13 UTC a format listing for one GAPS video worked. At
about 23:28 UTC eight 360p preview downloads (yt-dlp 2026.11.23, no cookies) failed: two with "Sign in to confirm
you're not a bot", six with "HTTP Error 403: Forbidden" on the video data. Per the brief, nothing was tried to get
around it: no cookies, no mirror front-ends, no retries. yt-dlp had already saved the page metadata of seven of
those videos (formats, length, upload date), which is quoted below. After the refusal only static thumbnail
images were read from `i.ytimg.com` (to judge framing, and `maxresdefault.jpg` present or absent as a sign of an
HD upload); no video or page was requested again. archive.org has no copy of any of the 400 GAPS videos (its
`youtube-<id>` items, all checked), and archive.org and web searches for the performers found no other host.

So the GAPS pieces below are ready on every count except the picture. If a later stage can fetch YouTube from
another machine, they are the strongest truth found anywhere in this search.

---

## What GAPS is, and the catches that apply to every GAPS candidate

- **Dataset.** GAPS, Guitar-Aligned Performance Scores (Riley, Guo, Edwards, Dixon, ISMIR 2024, arXiv 2408.08653).
  Hugging Face `xavriley/GAPS` v1.1 (last modified 2025-09-18), 401 pieces. Per piece: `musicxml/<id>.xml`, a
  Soundslice MusicXML export with a notation part (P1) and a **TAB part (P2) giving string and fret on every note**,
  tuning in `<staff-details>`; `midi/<id>.mid`, the score aligned note by note to the performance; `syncpoints/`;
  `audio/<id>.wav`, the YouTube soundtrack (48 kHz, 16-bit stereo). Videos are YouTube links in
  `gaps_metadata_with_splits.csv` only.
- **Where the tab comes from.** Every score is a classclef.com edition (the metadata `subtitle` says
  "www.classclef.com"). classclef offers each one free as Guitar Pro 6 (`.gpx`), tab PDF, MIDI and source PDF, and
  its page embeds the matching performance as "Guitar Demo" (checked on the *Gebeth* page: it embeds the same
  YouTube id as GAPS). Those four files are downloaded for each candidate.
- **Fingering is editorial.** The string/fret choices are the classclef editor's, not read from the performer's
  hands, except where the performer made the score (*Gallardas*, arranged by Edson Lopes; Maria Linnemann's own
  pieces). Pitches and timing are tied to the performance by the GAPS alignment, which was checked here (next
  section). Where the player uses a different string, the film can only show it from the video.
- **Repeats.** The MIDI follows the performance (repeats played out); the MusicXML is the written score. Where the
  MIDI has more notes than the tab (for example *Velha Seresta*, 861 against 440) that is the repeats.
- **Training leak.** `guitar-gaps.pth` (the HRGT model in the post) and Guitab E15 to E25 were trained on GAPS.
  Guitab's README reports scores on the GAPS test split, which suggests that split was held out (not verified).
  270 pieces are `train`, 30 `test`, 101 in no split. **Every pick below is `test` or in no split.** Avoid `train`
  pieces or those two tools score on music they may have heard.
- **Exporter bug.** In *Lachrimae Pavan* the TAB part's `<staff-tuning line="4">` reads F with `<tuning-alter>-1`
  (F flat); the notes imply F#3. Any loader must take F#3 for string 3. (The exporter also writes `tuning-alter`
  after `tuning-octave`, against the schema.)
- **Rights, notable.** The three GAPS licence statements differ: Zenodo records 13962272 and 17152440 say
  CC BY-NC-SA 4.0; the Hugging Face card says `license: mit`; the project page (https://aim-qmul.github.io/GAPS/)
  says "The GAPS dataset contains copyright material ... GAPS (or data enabling the its reproduction) may not be
  sold, leased, published or distributed to any third party without written permission from the GAPS
  administrator." classclef.com says "Classclef is completely FREE" and shows no licence text. The videos are
  ordinary YouTube uploads (for the five whose metadata was saved, yt-dlp's `license` field is empty, i.e. the
  standard YouTube licence). Showing the tab
  and the footage on screen is publishing both, so this is worth a line in the credits or a note to Aaron.

## How each GAPS truth was checked against its performance

All on the performance audio from Hugging Face (the same soundtrack as the video), first 60 s after the first note.
Scripts: `/home/user/gtv/candidates/gaps/_scripts/` (numpy and mido).

1. **Tab is self-consistent**: written pitch equals open-string pitch + fret for every note of the TAB part (100%
   for all eleven pieces checked, *Lachrimae* once string 3 is read as F#3).
2. **MIDI comes from this tab**: pitch-multiset overlap of MIDI notes with tab notes.
3. **Pitch is in the audio**: for each MIDI note, harmonic energy at its pitch against the semitone above and
   below, 30 ms to 0.37 s after its onset, with the guitar's overall tuning swept over ±100 cents. Baseline: the
   same test with every MIDI pitch moved a semitone up or down (a wrong score scores near 0).
4. **Timing is right**: median rise of the note's harmonic energy across its MIDI onset (20 ms windows), and the
   same with the onset moved ±0.2 s (a right alignment peaks at 0; a wrong one stays near 1).

| Piece | Open strings 1 to 6 | Tab / MIDI / common | Tuning offset | Pitch hit (true) | Pitch hit (±1 semitone) | Onset rise at 0 / ±0.2 s |
|---|---|---|---|---|---|---|
| Choro de Saudade | E B G D G D | 744 / 731 / 625 | +20 c | **0.968** | 0.012 / 0.012 | **7.9** / 0.65, 0.91 |
| Lachrimae Pavan | E B F# D A E | 852 / 851 / 851 | **−60 c** | **0.914** | 0.025 / 0.046 | **4.7** / 0.78, 0.81 |
| Caazapá | E B G D G D | 959 / 1133 / 958 | +20 c | 0.725 | 0.09 / 0.09 | 1.0 / 0.92, 0.86 (weak) |
| Gebeth | E B G D A E | 967 / 887 / 887 | 0 | **0.993** | 0.0 | **27.1** / 0.74, 0.86 |
| Velha Seresta | E B G D A E | 440 / 861 / 440 | 0 | **0.986** | 0.009 | **10.1** / 0.64, 0.81 |
| El Viaje | E B G D A E | 474 / 474 / 474 | 0 | **0.951** | 0.033 | **7.7** / 0.76, 0.68 |
| Gallardas | E B G D A E | 446 / 446 / 446 | +10 c | 0.632 | 0.17 / 0.19 | 1.3 / 0.78, 0.86 (weak) |
| Quiet Waters | E B G D A E | 260 / 361 / 260 | 0 | **0.995** | 0.005 / 0.0 | **13.0** / 0.75, 0.75 |
| J'aime | E B G D A E | 329 / 462 / 329 | 0 | **0.96** | 0.01 | **8.4** / 0.8, 0.89 |
| Alba Nera | E B G D B E | 711 / 699 / 694 | −30 c | **0.97** | 0.018 / 0.012 | **4.2** / 0.9, 0.89 |
| Schindler's List | E B G D G C | 409 / 587 / 409 | −10 c | 0.537 | 0.15 / 0.21 | 1.1 / 0.84, 0.87 (weak) |

Reading it: bold rows are aligned note by note. *Caazapá*, *Gallardas* and *Schindler's List* have the right notes
but no clear onset peak, so their timing would need re-aligning (for example a DTW of the MIDI to the audio) before
note-level scoring. Per-piece output: `check2.json` and `lag.json` in each candidate folder.

---

## Slot (b): unusual tuning

### b1. Choro de Saudade (Agustín Barrios Mangoré): Judicaël Perroy — best for this slot

- **Performer / source page:** Judicaël Perroy, "Judicael Perroy plays Barrios Choro de Saudade (Jose Ramirez
  Antigua)", Guitar Salon International channel, https://www.youtube.com/watch?v=lrH2tdUBzpc (uploaded 2017-02-10,
  about 277,000 views when GAPS was built).
- **Video:** 1920×1080 at 24 fps, 5:07 (yt-dlp metadata saved before the refusal). Thumbnail: one static frontal
  medium shot, whole guitar and both hands in frame, GSI logo bottom right; no tab on screen.
- **Tuning / capo:** D G D G B E (6th to D, 5th to G; the classclef PDF heads it "Open G" with the two retuned
  strings), no capo.
- **Tab:** GAPS `072_nV1wc` MusicXML (TAB part, 744 notes, 59 bars) and aligned MIDI; classclef.com Guitar Pro 6,
  tab PDF, MIDI (editor not named). GAPS split: none. GAPS alignment score 0.96.
- **Match:** strong (table above). 625 of 731 performed notes are in the score: Perroy departs from the edition in
  places, which the film can point out.
- **How well known:** core classical-guitar repertoire; several user tabs on Ultimate Guitar. Medium risk that a
  model "knows" it, low for an exact fingering.
- **Rights:** a guitar dealer's promotional upload; standard YouTube licence. Credit: "Judicaël Perroy plays
  Barrios, Choro de Saudade. Video: Guitar Salon International. Tab: classclef.com, via the GAPS dataset (Riley et
  al., ISMIR 2024)."
- **Files:** `/home/user/gtv/candidates/gaps/choro-de-saudade/` (`072_nV1wc.xml`, `.mid`, `.json` syncpoints,
  `.wav` audio, `classclef/` GP6 + PDFs + MIDI, `source.json`, `youtube_info.json`, checks). **Video not
  downloaded (YouTube refused).**

### b2. Lachrimae Pavan (John Dowland): Nataly Makovskaya

- **Performer / source page:** Nataly Makovskaya, "John Dowland, Lachrimae Pavan, classical guitar Nataly
  Makovskaya", channel Roman Gurochkin, https://www.youtube.com/watch?v=wW4Ud2hSH-k (uploaded 2009-08-09).
- **Video:** listed at 1920×1080, 25 fps, 4:19 (metadata; a 2009 upload, so possibly upscaled: not verified).
  Thumbnail: plain white background, medium close shot, fretting hand and neck at top right; the picking hand is
  not visible in the thumbnail.
- **Tuning / capo:** lute tuning E A D F# B E (3rd string to F#), no capo. The guitar sounds about 60 cents flat of
  A440 throughout: pitch tools may land a semitone low. That is a fair real-world test, or a nuisance; say which.
- **Tab:** GAPS `251_jy1wc` (852 notes) + aligned MIDI; classclef "Trans: Selina Copley" GP6, PDF, MIDI. Split:
  none. GAPS score 0.96. Note the F-flat exporter bug above.
- **Match:** strong once the −60 cent offset is allowed (table).
- **How well known:** Dowland's best-known pavan; many lute and guitar versions exist.
- **Rights:** third-party channel upload (not the performer's own channel). Credit: "Nataly Makovskaya plays
  Dowland, Lachrimae Pavan (video: Roman Gurochkin). Tab: classclef.com, transcribed by Selina Copley, via GAPS."
- **Files:** `/home/user/gtv/candidates/gaps/lachrimae-pavan/`. **Video not downloaded (YouTube refused).**

### b3. Caazapá (Barrios): Nut Chiangthong

- **Source page:** "Caazapa : Agustin barrios By Nut", channel san99k, https://www.youtube.com/watch?v=nnlbylV0L0I
  (uploaded 2009-08-05; description "Performed by Nut Chiangthong ... At Haven resort, Hua hin, Thailand").
- **Video:** listed at 1920×1080, 24 fps, 4:14 (metadata). Thumbnail: medium shot, beach backdrop, both hands
  visible.
- **Tuning / capo:** D G D G B E, no capo. **Tab:** GAPS `202_rk1wc` (959 notes) + MIDI; classclef GP6, PDF, MIDI.
  Split: none. GAPS score 0.98.
- **Match:** notes right, onset timing not confirmed (table): re-align before note-level scoring.
- **How well known:** a lesser Barrios piece. **Files:** `/home/user/gtv/candidates/gaps/caazapa/`. **Video not
  downloaded.**

### Also examined for (b), not recommended

- *Alba Nera* (Roland Dyens playing his own piece; 5th string to B; GAPS **test** split; truth excellent):
  https://www.youtube.com/watch?v=GTWLRZVQYWQ is **640×360** (metadata), below the 720p floor. Truth downloaded to
  `/home/user/gtv/candidates/gaps/alba-nera/` in case a better copy turns up.
- *Theme from Schindler's List* (Caleb Garfinkel; C G D G B E): **320×240**, weak timing alignment, famous tune.
  Truth in `/home/user/gtv/candidates/gaps/schindlers-list/`.
- *Mysterious Habitats* (Dušan Bogdanović, Adam Batstone; 6th to F; 1080p) and *Londón Carapé* (Barrios, Aleia
  Gonzalez Gulino; D G D G B E; 1080p, 1:54) are GAPS **train** pieces (leak), not downloaded. *A Fancy* (Dowland,
  Christoph Denoth; lute tuning) is train and 720p.
- The 78 drop-D pieces in GAPS were skipped: drop D is the weakest acceptable tuning and better options exist.

---

## Slot (c): standard tuning, no capo

### c1. Gebeth (Johann Kaspar Mertz, Bardenklänge op. 13): Massimo Agostinelli — best for this slot

- **Source page:** "Massimo Agostinelli plays Johann Kaspar Mertz: Gebeth (Preghiera) op.13", performer's own
  channel, https://www.youtube.com/watch?v=0eRvnuPGyN0. classclef's *Gebeth* page names this video as its demo.
- **Video:** 3:07 (audio length). HD thumbnail exists, so the upload is probably 720p or more; the exact
  resolution was not read (refused). Thumbnail: one static frontal medium shot against a curtain, the full neck and
  both hands in frame, no overlays.
- **Tuning / capo:** standard, none. **Tab:** GAPS `031_vpswc` (967 notes) + MIDI; classclef GP6, tab PDF, MIDI,
  source PDF. GAPS **test** split. GAPS score 0.99.
- **Match:** the best of all eleven (99.3% pitch hits, onset rise 27). 80 written notes are not in the MIDI
  (likely ornaments or a skipped repeat).
- **How well known:** obscure outside classical guitar. Good for the blind round.
- **Credit:** "Massimo Agostinelli plays Mertz, Gebeth. Tab: classclef.com, via GAPS."
- **Files:** `/home/user/gtv/candidates/gaps/gebeth/`. **Video not downloaded (YouTube refused).**

### c2. Velha Seresta (Dilermando Reis, arr. Renny Kuitert): Yoo Sik Ro

- **Source page:** "Yoo Sik Ro (노유식) plays "Velha Seresta" by Dilermando REIS", performer's own channel,
  https://www.youtube.com/watch?v=Y00dpXMX55c. **Video:** 4:10; HD thumbnail exists (resolution not read). The
  thumbnail is a stylised close-up of both hands with the title over it, so the film may cut between angles: not
  verified.
- **Tuning / capo:** standard, none. **Tab:** GAPS `111_hf1wc` (440 written notes, 861 performed with repeats) +
  MIDI; classclef "Arr. Renny Kuitert" GP6, PDF, MIDI. GAPS **test** split. Score 0.95.
- **Match:** strong (98.6% pitch hits, onset rise 10.1). **How well known:** Brazilian seresta repertoire; obscure
  internationally. **Files:** `/home/user/gtv/candidates/gaps/velha-seresta/`. **Video not downloaded.**

### c3. El Viaje (Astor Piazzolla, arr. Gary Ryan): Damien Kelly

- **Source page:** "El viaje (Astor Piazzolla arr. Gary Ryan) | Trinity College London Classical Guitar Grade 6",
  performer's own channel, https://www.youtube.com/watch?v=EGKKyAVJ27U. **Video:** 2:05; HD thumbnail exists.
  Thumbnail: home studio, medium shot; title text and a Trinity grade-6 book cover sit on the thumbnail (whether
  they appear in the video was not seen).
- **Tuning / capo:** standard, none. **Tab:** GAPS `294_BSswc` (474 notes, all performed) + MIDI; classclef GP6,
  PDF, MIDI, source PDF. GAPS **test**. Score 0.95. **Match:** strong.
- **Rights:** a copyright composition in a published exam arrangement (Trinity College London). **Files:**
  `/home/user/gtv/candidates/gaps/el-viaje/`. **Video not downloaded.**

### c4. Gallardas (Gaspar Sanz, arr. Edson Lopes): Edson Lopes

- **Source page:** "Gallardas (Gaspar Sanz)", performer's own channel, https://www.youtube.com/watch?v=MKWgzlIpBuY.
  **Video:** 2:25; HD thumbnail exists; studio medium shot.
- **Tab:** the **performer's own arrangement** (classclef "Arr: Edson Lopes"), so the fingering is likely his. GAPS
  `097_df1wc` (446 notes) + MIDI; classclef GP6, PDF, MIDI, source PDF. Split: none. Score 0.98.
- **Match:** notes right (63% hits against 17 to 19% for a wrong score), onset timing not confirmed: re-align.
- **How well known:** a standard Baroque guitar piece. **Files:** `/home/user/gtv/candidates/gaps/gallardas/`.
  **Video not downloaded.**

### Also examined for (c)

- *Quiet Waters* and *J'aime* (Maria Linnemann playing her own pieces; GAPS **test**; truth excellent; obscure):
  no HD thumbnail for either, so probably below 720p. Truth downloaded to
  `/home/user/gtv/candidates/gaps/quiet-waters/` and `/home/user/gtv/candidates/gaps/jaime/`.
- 62 standard-tuning GAPS pieces with alignment score ≥ 0.95 and length 1:30 to 5:00 are listed with performer,
  split and YouTube id in `/home/user/gtv/candidates/datasets/_meta/gaps_standard_shortlist.txt`.

---

## Slot (a): capo — only short segments exist in datasets

No dataset found holds a whole capo performance with downloadable video. GAPS has no capo in any of its 404 scores
(the three "capo" mentions in its video descriptions are gear lists). The only capo footage with a real truth is the
**GuiFiR** test set (An, Chung, Park, Lee, "GuiFiR: Weakly-Supervised Learning of Hand Pose Estimation for Guitar
Finger Reading", IEEE Access 2026; https://github.com/kmu-ee-ailab/guifir_dataset).

- **What was downloaded.** From the dataset's Google Drive archive (`GuiFiR.tar`, id
  `1Ri42XQnpwWQzjNLOPgZCR2XCx9YGrqxc`, 769,433,600 bytes, streamed; only these clips kept), the 46 test clips of
  the nine capo songs filmed at 1080p or 4K. Each song's 4 to 6 clips of 10 s follow on without a cut (the frame
  difference across each join equals the difference inside a clip), so they were joined losslessly into one
  segment per song.
- **Truth.** `frame_tab` per annotated frame, at note onsets (about two a second): fret per string, **index 0 =
  string 1 (high E) to index 5 = string 6, frets counted from the capo, 20 = string not played**, plus
  `frame_capo`, hand and fretboard boxes, and for the test split fingertip and fretboard-corner keypoints in
  640×360 space. String order was settled by matching *Someone You Loved* clip 5 to its on-screen tab (the C bar
  at about 3.7 s, "A3, D2, then B1 with G0", is labelled `[20,20,20,20,3,20]`, `[20,20,20,2,20,20]`,
  `[20,1,0,20,20,20]`). The videos also carry the arranger's own synced tab on screen.
- **On screen.** A synced tab strip fills the bottom third (crop to the top ~65% for any blind run); several carry
  "Tuning / Capo" text top right over the background; the two nylon segments also have a right-hand "Up next /
  Fingering" panel near the headstock. Hands and fretboard are close, steady and unobstructed.
- **Not available.** The full songs: the archive's `metadata/yt_link.csv` is a placeholder
  (`TODO_SOURCE_ID,TODO_YOUTUBE_URL`), and the originals are YouTube fingerstyle-tutorial uploads. One carries a
  "Kenneth Acoustic" signature (*Ylang Ylang*); four others share its layout.
- **Rights, notable.** `DATASET_TERMS.md`: "provided for non-commercial research, education, and reproducibility
  of the GuiFiR work"; under "You may not": "Redistribute, mirror, sublicense, sell, or commercially exploit the
  dataset assets"; "The source videos referenced by GuiFiR may be owned by third parties." Most songs are
  major-label pop. Showing these in a public film needs a decision.

| Segment (folder) | Guitar | Capo | Tuning | Video | Length | Notes |
|---|---|---|---|---|---|---|
| `Tangled` | nylon | 5 | standard (overlay) | 3840×2160, 30 fps | 60 s | notation + tab panel bottom half; title suggests a song from Disney's *Tangled* (famous) |
| `PrincessKaguya` | nylon | 3 | standard (overlay) | 3840×2160, 30 fps | 60 s | same layout as Tangled; title suggests the Ghibli film's song |
| `SurfTheme` | steel, cutaway | 2 | not shown | 3840×2160, 29.97 fps | 60 s | dark notation + tab strip; title unknown |
| `TakeMeHomeCountryRoads` | steel | 2 | standard (overlay) | 1920×1080, 23.98 fps | 60 s | very famous |
| `SomeoneYouLoved` | steel | 1 | not shown | 1920×1080, 23.98 fps | 60 s | very famous |
| `DeathBed` | steel (Taylor) | 1 | **6th to F** (overlay "FADGBE") | 1920×1080, 23.98 fps | 40 s | capo **and** an altered tuning; title suggests Powfu's "Death Bed", a viral hit |
| `JustTheWayYouAre` | steel | 5 | standard (overlay) | 1920×1080, 23.98 fps | 40 s | very famous |
| `Nandemonaiya` | steel | 6 | standard (overlay) | 1920×1080, 23.98 fps | 40 s | famous in Japan |
| `YlangYlang` | steel | 1 | standard (overlay) | 1920×1080, 23.98 fps | 40 s | "Kenneth Acoustic" signature |

Audio in all: MP3, 44.1 kHz stereo, 128 kb/s (thin for audio tools). Each folder holds `<song>_segment.mp4`,
`<song>_guifir_test_labels.jsonl`, `<song>_clip_map.json` (clip start times inside the segment) and `list.txt`.
Path: `/home/user/gtv/candidates/guifir/<song>/`; contact sheet `/home/user/gtv/candidates/guifir/guifir_sheet.jpg`.
Best of them for a capo experiment: *Tangled* (nylon, 4K, capo 5, both hands clear) and *DeathBed* (steel, capo
plus an altered 6th string), with *TakeMeHomeCountryRoads* if fame is acceptable.

---

## Datasets checked that cannot fill a slot

| Dataset / paper | Why not |
|---|---|
| GuitarSet (Zenodo 3371780), IDMT-SMT-Guitar, EGDB, EGSet12 (Zenodo 11406378: 12 pieces, 32 s average) | audio only |
| Guitar-TECHS (Zenodo 14963133) | the record says the ego/exo video device's audio only is included |
| GOAT (Zenodo 15690894) | restricted access, DI audio + Guitar Pro, no video |
| François Leduc Guitar Dataset (HF) | commercial jazz recordings + MIDI, no video |
| AnimeTAB, DadaGP, SCORE-SET, TabOMR | tabs or tab images only |
| magcil guitar_style_dataset (Zenodo 10075352) | 549 short technique clips, not pieces |
| Multimodal Electric Guitar Data (Zenodo 6470236) | basic actions and free improvisation, no score |
| Long-Form Guitar Ideation Session (Zenodo 21327750) | improvised; MIDI is Melodyne output, no string/fret |
| Jazz guitar mocap pilot (Zenodo 21360544) | one 31 s take, no score |
| Goldstein and Moses 2018 | silent GoPro clips filmed from a camera mounted on the guitar |
| GigaHands | ukulele only |
| Ego-Exo4D (music includes guitar) | licence approval takes days; no note-level annotation |
| Synchronize Dual Hands (xupei0610/guitar) | motion-capture of techniques, no performance video |
| TapToTab, Bae et al. (bass), Asmar et al. | data not released |
| Kaggle "Guitar Transcription Dataset" | frames only, and Kaggle needs a login |

Searches run: Hugging Face dataset search (guitar, tab, tablature, fingerstyle, fretboard, capo, acoustic guitar),
Zenodo (guitar with video, tablature, fingerstyle, multimodal, fingering, capo, motion capture, scordatura, open
tuning, recital), DataCite (all repositories), the arXiv API, and web search.

## Files

- GAPS candidates: `/home/user/gtv/candidates/gaps/<piece>/` (about 420 MB, mostly the WAVs); full GAPS metadata
  and the tuning/capo scan of all 404 scores in `/home/user/gtv/candidates/gaps/`; thumbnails and contact sheets in
  `/home/user/gtv/candidates/gaps/_thumbs/`.
- GuiFiR segments: `/home/user/gtv/candidates/guifir/` (about 170 MB). GuiFiR annotations (val and test) and split
  list: `/home/user/gtv/candidates/datasets/_meta/guifir/tar/GuiFiR/`.
