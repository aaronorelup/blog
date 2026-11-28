# PRIOR: what the earlier post already found

The post shows five videos.

Brief of `src/content/posts/guitar-tabs-from-video.md` (AO-078, "Turning my guitar videos into tabs with AI",
3,180 lines). `L123` = line 123 of that file. Everything here is what the post says, quoted or in its own terms.
Lines marked **(repo check)** were checked in the repo, not read in the post.

- Frontmatter: `date: 2026-11-09`, `draft: false` (L5-8). `topic: "agents"` (L6).
- The post ends: "*Claude drafted this post from the three passes' files and a script's comparison of each playback
  with the recordings.*" (L3179-3180)
- **Notes page (repo check, 2026-11-24):** none. `src/content/notes/` on `main` holds 12 files; none is
  `guitar-tabs-from-video.md`.

## 1. Setup

**Input.** "five videos from my guitar album" (L21-22), numbered 001, 002, 003, 004 and 009. Grok Bot "went through
all 103 videos in the album" (L30). The blind pass got "the videos and nothing else. No titles" (L35-36); its files
name the sources `song01.mp4`, `song02.mp4`, `song03.mp4`, `song04.mp4` and `song09.mp4` (L107, L243, L450, L1169,
L2121). What the passes say each video is:

| Video | Length (L) | Material, as the passes describe it |
|---|---|---|
| 001 | 0:13 (L73) | filmed "in the dark looking down the neck" (L160); muted strums (blind, L105) or a "near-silent clip: soft fretting-hand taps / finger exercise (not a song)" (Tabber pass, L158) |
| 002 | 0:05 (L209) | "5-second fingerpicked fragment in D (drop D tuning)" (L287); "only ~3 s of playing" (L253); "Video is mirrored" (L290) |
| 003 | 1:56 (L335) | "fingerpicked instrumental in E minor" (L448), steel-string with "soundhole pickup" (L451), rubato (L455-456) |
| 004 | 2:39 (L1065) | "The camera only shows the ceiling, so this one is all sound" (L1062); ukulele (blind, L1167) or guitar "triads on the top three strings" (Tabber pass, L1642) |
| 009 | 4:51 (L1994) | "open-D fingerstyle ballad with vocals" (blind, L2119) or "strummed sing-along in D major" (Tabber pass, L2577); "One continuous performance - no stops" (L2580-2581) |

Grok Bot's headers give the durations in seconds (L90 ... L2009); their sum, computed here, is 584.17 s (9:44).

**The three passes** (L27-44):

1. **Grok Bot**, Aaron's AI assistant (L29-30). "It took the notes from the sound, looked at the picture mostly for
   a capo ... and assumed standard tuning (E A D G B E) for all five" (L30-32). "Its tabs have no rhythm, so it played
   them back at one steady pace, half my speed. For 001 and 002 it wrote only a header" (L33-34). Its file format:
   header (song confidence, duration, tuning, capo with "visual confidence", "Likely sounding key", "Provisional
   classification" and reason, main loop), then "IMPORTANT LIMITATIONS", a chord chart of "Approximate estimated
   changes in the first 90 seconds", "SOURCE-PITCH ASCII SKETCHES" of two 16-second excerpts, "TRANSCRIPT CLUES
   (AUTOMATIC / UNVERIFIED)", "KEY/TUNING EVIDENCE" and "CONDITIONAL CHORD GRIPS" (L344-440). 009's file also has a
   "SONG-ID REFERENCE" section (L2100-2102).
2. **Opus 5.5, blind.** Claude Code given only the videos: "No titles, no guitar or transcription skills, none of
   Grok Bot's work. Running Opus 5.5 at max reasoning effort, it installed free audio tools to split the guitar from
   the singing, pick out the notes and find the beat, and it read the capo and my hand position off the video. Its
   tabs have timing, and its MP3s line up with the videos" (L35-39). Each file opens with a header (Instrument,
   Tuning with MIDI numbers, Capo, Key, Time, Tempo, Grid, "Pitch offset", Confidence; e.g. L107-116); most files
   then describe the playing (003's says "How this was made", L462-465) and give a time-stamped chord list and chord
   shapes; tab lines are each anchored with "@ m:ss.ss" = "time in the video where the following tab line starts"
   (L128-129).
3. **Opus 5.5 with Tabber.** "Tabber is a skill Claude Code built. It turns a guitar video or audio file into a tab
   with its best guess at the tuning, capo and key. A second Opus 5.5 run used it on all five, then checked its
   answers against the sound and the video and rebuilt every tab. It kept Tabber's tunings, took out notes Tabber
   had made from the guitar body's hum, and moved fingerings to where the video shows my hand" (L40-44). Each file
   has a header (Source, Tuning, Capo, Key, Tempo / feel, Progression, Structure, Confidence, chord shapes), a "vs.
   Tabber" block saying what Tabber output and what was changed (e.g. L177-180), then tab lines under section labels
   in brackets, each line tagged with its video time and bar, e.g. "(0:00, bar 1)" (L782-783).

## 2. Tools, libraries and methods the post names

No version, model variant or setting is given for any named tool. No vision model or library is named for reading
the video, no synthesizer for the MP3 playback, and no tool for Grok Bot's transcript or capo frames.

| Job | Pass | What the post says (quoted) | Lines |
|---|---|---|---|
| Source separation | blind | "audio transcribed with basic-pitch (after Demucs separation)"; vocal sections taken "from the separated vocal track" | L462, L2156 |
| Notes | blind | basic-pitch, same line | L462 |
| Notes | Grok | "model-detected onset pitches mapped to playable standard-tuning positions ... Each cell is 0.5 s ... Positions favor low frets and may differ from the hand in video" | L401-404 |
| Beats, bars | blind | "bar lines follow tracked beats and are approximate" (003) | L455 |
| Chords | blind | "chord shapes inferred from per-section pitch content and checked against the hand position in the video" | L462-464 |
| Chords | Tabber pass | "an HMM over bass + pitch classes"; "HMM-smoothed chord track over a small D-major vocabulary" | L2598, L2625-2626 |
| Key | Grok | "automatic note-profile estimate"; "Profile correlations (not probabilities)" with r values | L94, L428 |
| Tuning offset | blind | a "Pitch offset" line in every file, e.g. "Pitch offset: +6 cents (guitar's measured detuning vs A440)" | L115, L251, L458, L1179, L2129 |
| Tuning offset | Tabber pass | cents in each Tuning line, e.g. "in tune (+3 cents)" | L741, L1648, L2582 |
| Open-string tuning | all | blind from the lowest and most frequent notes (L253, L1184-1187, L2135-2136); Tabber pass from the low note plus the fret register (L291-293); Grok: "Low-note support is not enough to identify every open string. Tuning left unresolved instead of falsely declaring standard, DADGAD, or an open tuning" with "Strong lower detected pitches" weights | L429-431 |
| Capo from video | Grok | "No capo visible in sampled frames" | L229, L353, L2012 |
| Capo from video | Opus passes | "Capo none: high (nut visible)" (blind, 002); "No capo is visible (nut clear in the video)" (blind, 009); "headstock, nut and first frets visible, no capo" (Tabber pass, 001); "nut and first frets visible, no capo" (Tabber pass, 009) | L253, L2138, L165, L2583 |
| Capo from audio | Tabber | "capo 7 at 0.34 confidence (a coin-flip with capo 3 at 0.33)"; "capo confidence only 0.66" | L1676-1677, L772 |
| Hand and frets from video | blind | "fret positions calibrated from the inlay dots, 12th-fret double dot" | L464 |
| Hand and frets from video | Tabber pass | "the fret inlays at 3/5/7/9/12/15/17 place the hand at frets 6-10"; "7th-position confirmed by video at 0:12, 0:26, 0:27"; "the fingers cannot be read at this resolution" | L743-744, L754-755, L2584 |
| String and fret choice | blind | "fingering chosen by a playability optimiser constrained to those shapes; then hand-corrected" | L464-465 |
| String and fret choice | Tabber pass | "elsewhere chosen by a hand-position optimiser" | L755 |
| Speech, lyrics | Tabber | whisper: "Tabber/whisper's 'Thank you.' is a hallucination"; "whisper's 'Thanks for watching' etc. are hallucinations"; "whisper only caught fragments" | L289-290, L738-739, L2580 |
| Triage | Tabber | Tabber labels: "fragment (score 0.15)", "'false_start'" | L178-179, L2621 |
| Strums | Tabber pass | "a strum tab driven by the onsets"; "Strum rhythm MEDIUM (taken from the recording's onsets)" | L2626, L2600-2601 |
| Clean-up | blind | "F#2/G2 rumble in the recording is body resonance, not played notes, and was removed" | L468-469 |
| Clean-up | Tabber pass | resonance notes removed | L776, L1680 |
| Playback | blind, Tabber pass | MP3s "played back in time with the video"; 004 "synthesized with a nylon-string tone"; the ukulele appendix is "NOT parsed by the synth"; "the MP3 renders them quietly and short" | L75, L1170, L1621, L174 |
| Playback | Grok | "played back at half speed" (L336 and others); "it played them back at one steady pace, half my speed" | L33-34 |
| Comparison | post | "A script measured how much of each of the 12 notes is in each playback" (see section 4) | L48 |

Playback lengths (figcaptions, L73-76 ... L1994-1997): Grok Bot 1:06-1:07 for 003, 004 and 009; the Opus playbacks
are 0 to 4 s longer than their video, except blind 009 (4:50 against 4:51).

## 3. What each pass reported, per video

"Tabber raw" = Tabber's own output as the Tabber pass quotes it in its "vs. Tabber" block. Grok Bot gives no tempo.
Line numbers are for the whole row unless given in a cell.

| Vid | Pass | Tuning | Capo | Key | Tempo, time | Its own confidence notes and failure modes | Lines |
|---|---|---|---|---|---|---|---|
| 001 | Grok | "unresolved; E A D G B E assumed" | "unresolved (tab assumes 0)"; "Neck obscured, cropped, dark, or not shown" | "unresolved" | - | "fragment"; "Under 20 seconds; insufficient completed performance; header-only" | L92-96 |
| 001 | blind | "not determinable (all strings are fret-hand muted); standard ... assumed" | 0 | "none - no pitched notes sound" | 171, swung 8ths, 4/4 | rhythm "medium-high", swing "~1.7:1"; "the spectrum after each hit shows only the guitar body resonances (~90 Hz and ~200 Hz) and no string pitches" | L109-116 |
| 001 | Tabber pass | "Assumed standard"; "The weak tones sit between semitones (~+40 cents), so every pitch below may be one fret off" | none | "none / undetermined" | "about 3-4 taps per second (written as 16ths at q = ~120)" | "LOW"; whisper's output "is noise" (L161) | L162-170 |
| 001 | Tabber raw | standard | 0 | "'G minor'" | - | "'G minor' and the chart 'Ab5 - G5' are artefacts of 8 faint detections"; "fragment (score 0.15)" | L177-179 |
| 002 | Grok | assumed standard | 0, visual confidence medium | "D major?" moderate | - | "fragment", header-only | L228-232 |
| 002 | blind | drop D, MIDI 38 45 50 55 59 64 | 0 | D major | 154, 4/4 | overall medium; drop D "high: sustained D2 below standard low E"; "The weak D3 ... is most likely the octave partial of the open low D" | L245-258 |
| 002 | Tabber pass | drop D, +3 cents | none | D major | "free, roughly q = 150" | tuning "MEDIUM-HIGH (drop D, video + register)", notes "MEDIUM (only 3 s ...)" | L291-301 |
| 002 | Tabber raw | "drop D but with only 0.40 confidence (open D 0.39 close behind)" | 0 | D major | - | A3 and D4 on strings other than the hand positions in the video; "'lyrics: Thank you.'" | L310-314 |
| 003 | Grok | assumed standard | 0, visual high | "G major?" moderate; "G major r=0.754, E minor r=0.531" (L428) | - | "fragment/partial"; "some detected notes may be sung pitches or harmonics" (L362-363) | L352-363 |
| 003 | blind | standard, +6 cents | 0 | E minor | "~110 (rubato: drifts roughly 85-125 BPM; anchors follow the video)", 4/4 | "overall MEDIUM-LOW"; "F#2/G2 rumble ... is body resonance" (L468-469) | L452-469 |
| 003 | Tabber pass | standard, +3 cents | none | E minor | q = ~123, 4/4 | tuning/capo/key "HIGH", chords "MEDIUM-HIGH", notes "MEDIUM"; Tabber's F#2/G2 = "the guitar body's air resonance (~94 Hz)" (L770) | L741-770 |
| 003 | Tabber raw | standard | 0, "capo confidence only 0.66" | "'G major'" | - | "the body resonance at ~94 Hz became F#2/G2 bass notes", so C sections were labelled "'Gsus2'/'G'" and B7 "'D#dim'/'D/F#'" | L772-776 |
| 004 | Grok | assumed standard | "unresolved"; neck not shown | "G major?" moderate; r=0.862 (L1147) | - | "keeper candidate"; "Strong lower detected pitches:" left empty (L1148) | L1082-1086 |
| 004 | blind | "Standard guitar E A D G B E" to write a "re-entrant (high-G) ukulele", "uke GCEA, slightly sharp", +9 cents | 5 = "our guitar mapping" | G major | 113, "12/8 feel" | "No note below C4 (262 Hz) sounds anywhere in the 158 s recording"; "a guitar would sound bass notes"; "the actual fingering is inferred from pitches, not seen" | L1170-1193 |
| 004 | Tabber pass | standard "(assumed; only the G, B and e strings are played ...)", ~+12 cents | none; "Alternative: capo 7 ... (Tabber's guess, 0.34)" | G major | q = ~108, 4/4, "loose/rubato" | capo "LOW-MEDIUM (audio only; capo 7 equally possible)"; "constant resonances at ~159 Hz and ~175 Hz (not notes)" (L1645-1646) | L1647-1664 |
| 004 | Tabber raw | standard | "capo 7 at 0.34 confidence (a coin-flip with capo 3 at 0.33)" | "'G major'" | - | chart "mixes capo-relative shapes with resonance artefacts (~159-179 Hz hum read as D#3/E3/F3) and misses the bridge's Cm6" | L1676-1680 |
| 009 | Grok | assumed standard | 0, visual high | "A major?" low; A major r=0.754, F# minor 0.706, D major 0.704 (L2095) | - | "keeper candidate"; "Song confidence: medium-high (shared chorus with explicitly named 093 ...)" (L2005), a link that "does not establish external authorship" (L2100-2102) | L2005-2015 |
| 009 | blind | open D: D A D F# A D, MIDI 38 45 50 54 57 62, +7 cents | 0 | D major | ~140 in 8ths, "feels like a slow ~70 BPM ballad" | notes "low-medium (transcribed from a mix with vocals; rubato)"; open D because "the most frequent notes are exactly the open strings A2 D3 F#3 A3 D4 (+D2)" (L2135) | L2123-2139 |
| 009 | Tabber pass | standard, +8 cents | none | D major | q = ~140 in 8ths | voicings "LOW-MEDIUM ... the video is too small to read fingers"; "the voice sits in the guitar's range" | L2582-2601 |
| 009 | Tabber raw | standard | 0 | D major | - | triage "'false_start'"; "40+ chord names ... because the vocal melody leaks into the notes"; tab "not playable as a strum part" | L2621-2625 |

The post's one-line summaries: L70, L206, L332, L1062, L1991. Its preview sums them up: "All three agree on tuning
and capo only for 003. They split on 002's and 009's tuning and on whether 004 is a ukulele." (L13)

## 4. The comparison, "How close each one got" (L46-64)

- Method, whole text: "One rough check. A script measured how much of each of the 12 notes is in each playback and
  compared that mix with all five real recordings. The table shows where the right recording ranked. 1st means the
  playback was closest to its own song. Picking at random gets 1st one time in five." (L48-50)
- Rank of the right recording (L52-59): Grok Bot 001 "no tab", 002 "no tab", 003 2nd, 004 1st, 009 1st = "2 of 3".
  Blind: 001 "skipped", 002, 003, 004, 009 = 1st, 1st, 1st, 3rd = "3 of 4". With Tabber: 001 "skipped", 002, 003,
  004, 009 = 1st, 2nd, 1st, 1st = "3 of 4".
- **(repo check)** `prior/rank_five.py` computes this table. It loads each file with librosa (22050 Hz, mono),
  takes `librosa.feature.chroma_cqt` averaged over time with each frame weighted by its loudness
  (`librosa.feature.rms`), and compares two such profiles by cosine similarity. A playback's rank is where its own
  recording falls when the recordings are sorted by that similarity. The recordings are not separated first. Its
  closeness values, from `prior/rank_five.json` (each playback against each recording, highest first, the playback's
  own recording in bold; 001 and Grok Bot's 002 have none, "skipped" or "no tab" as in the table):

| Video | Pass | Rank | Closeness |
|---|---|---|---|
| 002 | Opus 5.5, blind | 1 | **002 0.8726**, 003 0.8363, 004 0.7721, 001 0.7568, 009 0.6525 |
| 002 | Opus 5.5 with Tabber | 1 | **002 0.8529**, 009 0.7145, 003 0.7097, 004 0.7058, 001 0.6471 |
| 003 | Grok Bot | 2 | 004 0.9125, **003 0.8936**, 002 0.8661, 009 0.8169, 001 0.7808 |
| 003 | Opus 5.5, blind | 1 | **003 0.9094**, 002 0.8336, 004 0.8282, 001 0.8173, 009 0.6846 |
| 003 | Opus 5.5 with Tabber | 2 | 004 0.9212, **003 0.8985**, 002 0.8483, 009 0.8339, 001 0.7871 |
| 004 | Grok Bot | 1 | **004 0.8606**, 003 0.7893, 002 0.773, 001 0.695, 009 0.5644 |
| 004 | Opus 5.5, blind | 1 | **004 0.9661**, 003 0.8629, 001 0.785, 002 0.7797, 009 0.7154 |
| 004 | Opus 5.5 with Tabber | 1 | **004 0.9378**, 003 0.796, 002 0.7713, 001 0.6936, 009 0.6695 |
| 009 | Grok Bot | 1 | **009 0.9791**, 003 0.862, 002 0.8466, 001 0.8188, 004 0.7136 |
| 009 | Opus 5.5, blind | 3 | 002 0.9413, 003 0.9139, **009 0.8799**, 001 0.8458, 004 0.7567 |
| 009 | Opus 5.5 with Tabber | 1 | **009 0.937**, 002 0.869, 003 0.8335, 001 0.7729, 004 0.6662 |

- "001 is skipped. It's muted or nearly silent, so there's no real mix of notes to compare." (L61)
- Limits as stated: "It's a loose test. Most of these songs sit in the same few keys, and one of the real recordings
  has singing in it. The check only hears notes, not rhythm, strings or tuning." (L63-64)
- The post does not name the script, how the 12-note mix is computed, the distance used, or whether the recordings
  were separated first (`prior/rank_five.py`, above, does). Grok Bot's playbacks are at half speed (L33-34), so the
  compared playbacks differ in length and tempo.
- The frontmatter preview turns this into `verdict: "Opus closest, 3 of 4"` and a takeaway naming the 3 of 4 and
  2 of 3 counts (L10-11).

## 5. What the post says nobody has verified

- "Nobody has checked any of them against the songs by ear yet." (L24-25; also the preview point, L15)
- Grok Bot's tunings: "I know at least one of those tuning guesses is wrong." (L32-33) The post does not say which.
- The passes disagree, and the post does not settle it, on: 002's tuning, 009's tuning (open D or standard) and
  whether 004 is a ukulele (L13, L1991, L1062); G major or E minor for 003 (L332).
- Grok Bot's own files: "NOT a verified note-for-note tablature or proof of the original tuning/fingering" (L360-361);
  "Completion/intent remains PROVISIONAL; it needs listening review" (L1086); transcript clues are "AUTOMATIC /
  UNVERIFIED" (L424).
- Blind pass: 004's fingering "is inferred from pitches, not seen" (L1193); "Uncertain:" notes in 003 (L470-472).
- Tabber pass: 004 tuning "assumed" and capo "7 equally possible" (L1647, L1663-1664); 001 "every pitch below may be
  one fret off" (L163-164); 009 voicings "inferred from the sounding notes" (L2585).

## 6. Conventions a new post could follow

- One `<ao-*>` component only: `<ao-compare cols="2" aspect="16/9">`, 5 times, one per video. Each holds four
  `<figure>`s: the real video, then Grok Bot, blind Opus and Opus with Tabber. Every figure has a `<figcaption>` with
  `<b>` (who) and `<span class="ao-meta">` (what it is and its length). A pass with no tab gets a figure holding only
  a figcaption (L74, L210). Counts: 5 `<video>`, 13 `<audio class="fill">`, 15 `<details>`, 15 fenced `text` blocks.
- Video: `controls preload="metadata" playsinline`. Audio: `class="fill" ... controls preload="none"`.
- Every tab is a `<details><summary>` with a fenced `text` block inside, one per pass per video, summary text of the
  form "Blind Opus 5.5's tab for 001" or "Grok Bot's draft for 001, a header and no tab".
- Media URLs are `/media/guitar-tabs-from-video/song-00N.mp4`, `grokbot-00N.mp3`, `opus-blind-00N.mp3`,
  `opus-tabber-00N.mp3`. **(repo check)** `public/media/guitar-tabs-from-video/` is not in git;
  `src/data/media-manifest.json` lists 18 of these paths with bytes and etag (5 MP4, 24,193,647 bytes; 13 MP3,
  25,650,755 bytes). The preview image `public/media/previews/guitar-tabs-from-video.webp` is in git.

Exact markup, L72-74:

````html
<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-001.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:13</span></figcaption></figure>
<figure><figcaption><b>Grok Bot</b><span class="ao-meta">no tab, so nothing to play</span></figcaption></figure>
````

L336:

````html
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-003.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
````

L102-104 and L150-152 (tab lines between them omitted here):

````markdown
<details><summary>Blind Opus 5.5's tab for 001</summary>

```text
```

</details>
````

## 7. Runtime, cost and hardware

- The only statements: the blind pass ran "Opus 5.5 at max reasoning effort" and "installed free audio tools"
  (L36-37); Grok Bot "went through all 103 videos in the album" (L30).
- The post gives no run times, no costs, no token counts and no hardware for any pass.
