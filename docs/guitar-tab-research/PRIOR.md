# PRIOR: what the earlier post already found

Brief of `src/content/posts/guitar-tabs-from-video.md` (AO-078, "Turning my guitar videos into tabs with AI",
6,427 lines), read 2026-11-10 by `prior-brief`. `L123` = line 123 of that file. Everything here is what the post
says, quoted or in its own terms. Lines marked **(repo check)** were checked in the repo, not read in the post.

- Frontmatter: `date: 2026-11-09`, `draft: false`, `unlisted: true` with the comment "Aaron asked for it at its URL
  only: noindex, in no list, feed, card or /stats" (L5-9). `topic: "agents"` (L6).
- The post ends: "*Claude drafted this post from the three passes' files and a script's comparison of each playback
  with the recordings.*" (L6426-6427)
- **Notes page (repo check):** none. `src/content/notes/` holds 11 files; none is `guitar-tabs-from-video.md`, and
  a search of the repo for `guitar-tabs-from-video`, run before this file existed, found only the post,
  `src/data/media-manifest.json` and `PLAN.md`.

## 1. Setup

**Input.** "the first ten videos of my guitar album" (L22-23), numbered 001-010. Grok Bot "went through all 103
videos in the album" (L31). The blind pass got "the ten videos and nothing else. No titles" (L36-37); its files name
the sources `song01.mp4` ... `song10.mp4` (e.g. L115). What the passes say each video is:

| Video | Length (L) | Material, as the passes describe it |
|---|---|---|
| 001 | 0:13 (L81) | filmed "in the dark looking down the neck", "~20-25 dB quieter than in the other clips" (L168-169); muted strums (blind, L113) or "soft fretting-hand taps / finger exercise (not a song)" (Tabber pass, L166) |
| 002 | 0:05 (L217) | "5-second fingerpicked fragment in D (drop D tuning)" (L295); "only ~3 s of playing" (L261); "Video is mirrored" (L298) |
| 003 | 1:56 (L343) | "fingerpicked instrumental in E minor" (L456), steel-string with "soundhole pickup" (L459), rubato (L463-464) |
| 004 | 2:39 (L1073) | "The camera only shows the ceiling, so this one is all sound" (L1070); ukulele (blind, L1175) or guitar "triads on the top three strings" (Tabber pass, L1650) |
| 005 | 3:27 (L2002) | "outdoor duo": one plays, "the other sings"; they "stop at ~1:36, discuss and start a second take at ~1:49" (L2498-2502) |
| 006 | 2:11 (L2913) | "same duo and guitar as song05"; take ends ~1:35, discussion, restart ~2:00 (L3289-3291) |
| 007 | 0:40 (L3545) | same duo; "an abandoned take" (L3649); talking and laughing; "the camera falls over at ~0:38" (L3667-3668); "Video is mirrored (front camera)" (L3786) |
| 008 | 3:03 (L3873) | fingerstyle instrumental, "Audio only has the guitar (no voice)" (L4007); a 1:24-1:30 break (L4477) |
| 009 | 4:51 (L4774) | ballad, "the player sings throughout", "One continuous performance - no stops" (L5359-5361) |
| 010 | 1:03 (L5964) | "nylon-string classical guitar, no vocals; capo clearly visible" (L6292-6293) |

Grok Bot's headers give the durations in seconds (L98 ... L5979); their sum, computed here, is 1,208.87 s (20:09).

**The three passes** (L28-45):

1. **Grok Bot**, Aaron's AI assistant (L30-31). "It took the notes from the sound, looked at the picture mostly for
   a capo ... and assumed standard tuning (E A D G B E) for all ten" (L31-33). "Its tabs have no rhythm, so it
   played them back at one steady pace, half my speed for most of them. For 001 and 002 it wrote only a header"
   (L34-35). Its file format: header (song confidence, duration, tuning, capo with "visual confidence", "Likely
   sounding key", "Provisional classification" and reason, main loop), then "IMPORTANT LIMITATIONS", a chord chart of
   "Approximate estimated changes in the first 90 seconds", "SOURCE-PITCH ASCII SKETCHES" of two 16-second excerpts,
   "TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)", "KEY/TUNING EVIDENCE" and "CONDITIONAL CHORD GRIPS" (L352-448).
   005 has a longer, different format with a main loop, a bass skeleton and a section map (L2011-2179).
2. **Opus 5.5, blind.** Claude Code given only the videos: "No titles, no guitar or transcription skills, none of
   Grok Bot's work. Running Opus 5.5 at max reasoning effort, it installed free audio tools to split the guitar from
   the singing, pick out the notes and find the beat, and it read the capo and my hand position off the video. Its
   tabs have timing, and its MP3s line up with the videos" (L36-40). Each file opens with a header (Instrument,
   Tuning with MIDI numbers, Capo, Key, Time, Tempo, Grid, "Pitch offset", Confidence; e.g. L115-124); most files
   then say how they were made and give a time-stamped chord list and chord shapes; tab lines are each anchored with
   "@ m:ss.ss" = "time in the video where the following tab line starts" (L136-137).
3. **Opus 5.5 with Tabber.** "Tabber is a skill Claude Code built. It turns a guitar video or audio file into a tab
   with its best guess at the tuning, capo and key. A second Opus 5.5 run used it on all ten, then checked its
   answers against the sound and the video and rebuilt every tab. It kept Tabber's tunings, took out notes Tabber
   had made from the guitar body's hum and from people talking, and moved fingerings to where the video shows my
   hand" (L41-45). Each file has a header (Source, Tuning, Capo, Key, Tempo / feel, Progression, Structure,
   Confidence, chord shapes), a "vs. Tabber" block saying what Tabber output and what was changed (e.g. L185-188),
   then tab lines under section labels in brackets, each line tagged with its video time and bar, e.g. "(0:00, bar 1)"
   (L790-791).

## 2. Tools, libraries and methods the post names

No version, model variant or setting is given for any named tool. No vision model or library is named for reading
the video, no synthesizer for the MP3 playback, and no tool for Grok Bot's transcript or capo frames.

| Job | Pass | What the post says (quoted) | Lines |
|---|---|---|---|
| Source separation | blind | "audio transcribed with basic-pitch (after Demucs separation)"; "guitar separated from the singing (Demucs)"; "guitar isolated from the singer with Demucs"; "Demucs-separated guitar"; vocal sections taken "from the separated vocal track" | L470, L2201, L3055, L3669, L4936 |
| Notes | blind | basic-pitch, same lines; "Notes come from an automatic transcription snapped to the beat grid ... ghost notes were filtered" | L470, L2201, L3055, L3669, L4013-4014 |
| Notes | Grok | "model-detected onset pitches mapped to playable standard-tuning positions ... Each cell is 0.5 s ... Positions favor low frets and may differ from the hand in video"; for 005, "Basic Pitch note-event duration/amplitude profile" | L408-414, L2168 |
| Beats, bars | blind | "bars/beats from madmom"; "beats/bars from madmom"; "bar lines every two tracked beats" | L2202, L3056, L3669-3670 |
| Chords | blind | "chord shapes inferred from per-section pitch content and checked against the hand position in the video"; "chords from the bass note on each downbeat + pitch content" | L470-472, L2202 |
| Chords | Tabber pass | "HMM-smoothed labels"; "an HMM over G-major chords"; "HMM per beat with bass weighting"; "an HMM over bass + pitch classes"; "HMM-smoothed chord track over a small D-major vocabulary" | L2516, L2541, L3302-3303, L5378, L5405-5406 |
| Key | Grok | "automatic note-profile estimate"; "Profile correlations (not probabilities)" with r values; 005 also "Raw STFT chroma" and "Music-only harmonic CQT chroma"; "These r values are correlations, NOT probabilities or calibrated confidence" | L102, L436, L2167-2174 |
| Tuning offset | blind | a "Pitch offset" line in every file, e.g. "Pitch offset: +6 cents (guitar's measured detuning vs A440)" | L123, L259, L466, L1187, L2196, L3048, L3659, L4001, L4909, L6077 |
| Tuning offset | Tabber pass | cents in each Tuning line, e.g. "in tune (+3 cents)" | L749, L1656, L2503, L5362 |
| Open-string tuning | all | blind from the lowest and most frequent notes (L261, L1192-1195, L4915-4916); Tabber pass from the low note plus the fret register (L299-301); Grok: "Low-note support is not enough to identify every open string. Tuning left unresolved instead of falsely declaring standard, DADGAD, or an open tuning" with "Strong lower detected pitches" weights | L437-439 |
| Capo from video | Grok | "No capo visible in sampled frames"; "Clamp fret counted from nut in frame"; 005: "Ten frames checked at 3, 12, 25, 42, 62, 82, 105, 135, 165, and 195 seconds" | L237, L5982, L2157-2158 |
| Capo from video | Opus passes | "Capo is clearly visible behind the 3rd fret wire" (blind); "capo sits just behind the 3rd fret wire" (Tabber pass); "nut visible" | L6082, L6295, L261 |
| Capo from audio | Tabber | "capo 7 at 0.34 confidence (a coin-flip with capo 3 at 0.33)"; "capo confidence only 0.66" | L1684-1685, L780 |
| Hand and frets from video | blind | "fret positions calibrated from the inlay dots, 12th-fret double dot"; "Video confirms the hand shapes (index at rel. fret 2 / 3, ring at 4)" | L472, L6087 |
| Hand and frets from video | Tabber pass | "the fret inlays at 3/5/7/9/12/15/17 place the hand at frets 6-10"; "7th-position confirmed by video at 0:12, 0:26, 0:27"; "the fingers cannot be read at this resolution" | L751-752, L762-763, L5364 |
| String and fret choice | blind | "fingering chosen by a playability optimiser constrained to those shapes; then hand-corrected"; "corrected by hand (scripts/song07_finalize.py)" | L472-473, L3057, L3670-3671 |
| String and fret choice | Tabber pass | "elsewhere chosen by a hand-position optimiser" | L763 |
| Speech, lyrics | Tabber | whisper: "Tabber/whisper's 'Thank you.' is a hallucination"; "whisper's 'Thanks for watching' etc. are hallucinations"; "whisper only caught fragments" | L297-298, L746-747, L5360 |
| Talk, sections, triage | Tabber, Tabber pass | Tabber labels: "fragment (score 0.15)", "'keeper'", "rehearsal", "'false_start'"; "I kept its structure/talk detection"; "Section boundaries HIGH (loudness + talk detection)" | L186-187, L3815, L2538, L5401, L2540, L3303-3304 |
| Strums | Tabber pass | "a strum tab from the onsets"; "Strum rhythm MEDIUM (from onsets; directions inferred)" | L2541, L2517-2518 |
| Clean-up | blind | "F#2/G2 rumble in the recording is body resonance, not played notes, and was removed"; "octave ghosts and vocal residue removed; in the main loop the picking-pattern notes that occur in >= 6 of the 8 repetitions were filled in where the singing masked them" | L476-477, L3058-3059 |
| Clean-up | Tabber pass | resonance notes removed (L784, L1688); "removed weak sustain re-triggers" | L6325 |
| Playback | blind, Tabber pass | MP3s "played back in time with the video"; 004 "synthesized with a nylon-string tone"; the ukulele appendix is "NOT parsed by the synth"; "the MP3 renders them quietly and short" | L83, L1178, L1629, L182 |
| Playback | Grok | "played back at half speed" (L344 and others); 005 "its main loop played back at about my tempo, 0:32" | L34-35, L2003 |
| Comparison | post | "A script measured how much of each of the 12 notes is in each playback" (see section 4) | L49-50 |

Playback lengths (figcaptions, L81-84 ... L5964-5967): Grok Bot 1:06-1:07 for 003, 004 and 006-010, 0:32 for 005;
the Opus playbacks are 0 to 5 s longer than their video, except blind 009 (4:50 against 4:51).

## 3. What each pass reported, per video

"Tabber raw" = Tabber's own output as the Tabber pass quotes it in its "vs. Tabber" block. Grok Bot gives no tempo
except for 005. Line numbers are for the whole row unless given in a cell.

| Vid | Pass | Tuning | Capo | Key | Tempo, time | Its own confidence notes and failure modes | Lines |
|---|---|---|---|---|---|---|---|
| 001 | Grok | "unresolved; E A D G B E assumed" | "unresolved (tab assumes 0)"; "Neck obscured, cropped, dark, or not shown" | "unresolved" | - | "fragment"; "Under 20 seconds; insufficient completed performance; header-only" | L100-104 |
| 001 | blind | "not determinable (all strings are fret-hand muted); standard ... assumed" | 0 | "none - no pitched notes sound" | 171, swung 8ths, 4/4 | rhythm "medium-high", swing "~1.7:1"; "the spectrum after each hit shows only the guitar body resonances (~90 Hz and ~200 Hz) and no string pitches" | L117-124 |
| 001 | Tabber pass | "Assumed standard"; "The weak tones sit between semitones (~+40 cents), so every pitch below may be one fret off" | none | "none / undetermined" | "about 3-4 taps per second (written as 16ths at q = ~120)" | "LOW"; whisper's output "is noise" (L169) | L170-178 |
| 001 | Tabber raw | standard | 0 | "'G minor'" | - | "'G minor' and the chart 'Ab5 - G5' are artefacts of 8 faint detections"; "fragment (score 0.15)" | L185-187 |
| 002 | Grok | assumed standard | 0, visual confidence medium | "D major?" moderate | - | "fragment", header-only | L236-240 |
| 002 | blind | drop D, MIDI 38 45 50 55 59 64 | 0 | D major | 154, 4/4 | overall medium; drop D "high: sustained D2 below standard low E"; "The weak D3 ... is most likely the octave partial of the open low D" | L253-266 |
| 002 | Tabber pass | drop D, +3 cents | none | D major | "free, roughly q = 150" | tuning "MEDIUM-HIGH (drop D, video + register)", notes "MEDIUM (only 3 s ...)" | L299-309 |
| 002 | Tabber raw | "drop D but with only 0.40 confidence (open D 0.39 close behind)" | 0 | D major | - | A3 and D4 on strings other than the hand positions in the video; "'lyrics: Thank you.'" | L318-322 |
| 003 | Grok | assumed standard | 0, visual high | "G major?" moderate; "G major r=0.754, E minor r=0.531" (L436) | - | "fragment/partial"; "some detected notes may be sung pitches or harmonics" (L370-371) | L360-371 |
| 003 | blind | standard, +6 cents | 0 | E minor | "~110 (rubato: drifts roughly 85-125 BPM; anchors follow the video)", 4/4 | "overall MEDIUM-LOW"; "F#2/G2 rumble ... is body resonance" (L476-477) | L460-477 |
| 003 | Tabber pass | standard, +3 cents | none | E minor | q = ~123, 4/4 | tuning/capo/key "HIGH", chords "MEDIUM-HIGH", notes "MEDIUM"; Tabber's F#2/G2 = "the guitar body's air resonance (~94 Hz)" (L778) | L749-778 |
| 003 | Tabber raw | standard | 0, "capo confidence only 0.66" | "'G major'" | - | "the body resonance at ~94 Hz became F#2/G2 bass notes", so C sections were labelled "'Gsus2'/'G'" and B7 "'D#dim'/'D/F#'" | L780-784 |
| 004 | Grok | assumed standard | "unresolved"; neck not shown | "G major?" moderate; r=0.862 (L1155) | - | "keeper candidate"; "Strong lower detected pitches:" left empty (L1156) | L1090-1094 |
| 004 | blind | "Standard guitar E A D G B E" to write a "re-entrant (high-G) ukulele", "uke GCEA, slightly sharp", +9 cents | 5 = "our guitar mapping" | G major | 113, "12/8 feel" | "No note below C4 (262 Hz) sounds anywhere in the 158 s recording"; "a guitar would sound bass notes"; "the actual fingering is inferred from pitches, not seen" | L1178-1201 |
| 004 | Tabber pass | standard "(assumed; only the G, B and e strings are played ...)", ~+12 cents | none; "Alternative: capo 7 ... (Tabber's guess, 0.34)" | G major | q = ~108, 4/4, "loose/rubato" | capo "LOW-MEDIUM (audio only; capo 7 equally possible)"; "constant resonances at ~159 Hz and ~175 Hz (not notes)" (L1653-1654) | L1655-1672 |
| 004 | Tabber raw | standard | "capo 7 at 0.34 confidence (a coin-flip with capo 3 at 0.33)" | "'G major'" | - | chart "mixes capo-relative shapes with resonance artefacts (~159-179 Hz hum read as D#3/E3/F3) and misses the bridge's Cm6" | L1684-1688 |
| 005 | Grok | standard, "WORKING ASSUMPTION, moderate confidence" | "NONE visible / fret 0 — high confidence across ten inspected frames" | G major, moderate; Basic Pitch G major r=0.903, raw STFT chroma D major r=0.835 (L2168-2170) | "roughly 130 bpm; alternatively ... 65 bpm" (L2077) | "Singing, outdoor noise, and overlapping harmonics contaminate automatic guitar-note extraction" (L2034-2035); "transcribed anyway because the latest instruction specifically requested this clip" (L2039-2040) | L2022-2040 |
| 005 | blind | standard, -5 cents | 0 | G major | ~132 (intro ~110), 4/4 | overall "MEDIUM"; "'x' on the low E string = percussive thumb slap"; "Vocals are not transcribed" | L2190-2211 |
| 005 | Tabber pass | standard, -3 cents | none | G major | q = ~132 in 8ths, "felt as a 66-bpm ballad" | chords "MEDIUM-LOW (two voices sing over the guitar; HMM-smoothed labels ...)"; the discussion "is marked and left silent" (L2542) | L2503-2518 |
| 005 | Tabber raw | standard | 0 | G major | - | "correctly flagged the take as a rehearsal (talking mid-take)"; chart "(A#, D#maj7, Esus4, F#m, C#5 ...: vocals and talk leak into the notes)" | L2537-2539 |
| 006 | Grok | assumed standard | 0, visual high | "G major?" moderate; r=0.947 (L3018) | - | "keeper candidate"; automatic transcript clues (L3009-3015) | L2932-2936 |
| 006 | blind | standard, -1 cent | 0 | G major | 133, "~66 BPM if felt in half-time", 4/4 | overall "MEDIUM"; "octave ghosts and vocal residue removed" (L3058); "talking 1:35-1:44" (L3088) | L3042-3059 |
| 006 | Tabber pass | standard, -4 cents | none | G major "with an E-minor intro" | q = ~132 in 8ths | chords "MEDIUM-LOW (singer over the guitar ...)"; sections "HIGH (loudness + talk detection)" | L3292-3304 |
| 006 | Tabber raw | standard | 0 | G major | - | "'rehearsal' triage"; odd chords "from vocal leakage"; "its tab keeps notes from the talking section" | L3324-3327 |
| 007 | Grok | assumed standard | 0, visual high | "G major?" low; G major r=0.820, E minor r=0.789 (L3629) | - | "fragment/partial"; "No stable loop established" | L3564-3569 |
| 007 | blind | standard, -2 cents | 0 | "G major / E minor" | ~120, "slows while they chat", 4/4 | overall "MEDIUM-LOW"; "Vocals (singing/talking) are not transcribed" | L3653-3668 |
| 007 | Tabber pass | standard, "within ~4 cents" | none | E minor | q = ~92, 4/4 | chords "MEDIUM (loose playing, talking over the guitar)" | L3787-3797 |
| 007 | Tabber raw | standard | 0 | E minor | - | "called this clip a 'keeper'"; "its tab includes the talking/laughing as notes"; "junk chords (Gsus2, D#dim, E)" | L3814-3817 |
| 008 | Grok | assumed standard | 0, visual medium | "G major?" low; G major r=0.856, E minor r=0.808 (L3971) | - | "keeper candidate"; transcript clue "Buh!" at 180-181 s (L3967-3968) | L3890-3894 |
| 008 | blind | standard, +6 cents | 0; "a capo is parked on its HEADSTOCK, not on the neck" (L4008-4009) | G major | 125, 4/4 | chord roots "MEDIUM (~75-80% of bars)"; "two different steel-string acoustics: cutaway in 0:00-1:24, dreadnought in 1:31-3:03" (L3994) | L3995-4004 |
| 008 | Tabber pass | standard, +3 cents | none | E minor | q = ~123, 4/4 | one "dreadnought with a clip-on tuner"; "Two people share the guitar in the first part" (L4475-4477); chord names "MEDIUM" | L4479-4491 |
| 008 | Tabber raw | standard | 0 | "'G major'" | - | "keeper"; "it ran straight through the 1:24-1:30 break (notes from handling noise)"; "missed that there are two segments" | L4504-4507 |
| 009 | Grok | assumed standard | 0, visual high | "A major?" low; A major r=0.754, F# minor 0.706, D major 0.704 (L4875) | - | "keeper candidate"; "Song confidence: medium-high (shared chorus with explicitly named 093 ...)" (L4785), a link that "does not establish external authorship" (L4880-4882) | L4785-4795 |
| 009 | blind | open D: D A D F# A D, MIDI 38 45 50 54 57 62, +7 cents | 0 | D major | ~140 in 8ths, "feels like a slow ~70 BPM ballad" | notes "low-medium (transcribed from a mix with vocals; rubato)"; open D because "the most frequent notes are exactly the open strings A2 D3 F#3 A3 D4 (+D2)" (L4915) | L4903-4919 |
| 009 | Tabber pass | standard, +8 cents | none | D major | q = ~140 in 8ths | voicings "LOW-MEDIUM ... the video is too small to read fingers"; "the voice sits in the guitar's range" | L5362-5381 |
| 009 | Tabber raw | standard | 0 | D major | - | triage "'false_start'"; "40+ chord names ... because the vocal melody leaks into the notes"; tab "not playable as a strum part" | L5401-5405 |
| 010 | Grok | assumed standard | 3, "Clamp fret counted from nut in frame" | "G minor?" moderate; r=0.877 (L6047) | - | "fragment/partial"; shapes "Em?" / "Gmaj7?" sounding "Gm?" / "Bbmaj7?" (L6002-6003) | L5981-5986 |
| 010 | blind | standard, +3 cents | 3, "clearly visible behind the 3rd fret wire" | G minor | 120, rubato, ritardando from ~0:46 | "overall medium-high"; "Video confirms the hand shapes" (L6087) | L6071-6087 |
| 010 | Tabber pass | standard, "within ~3 cents" | 3rd fret, seen in the video | G minor | q = ~120, "can equally be felt as a slow 60" | HIGH for tuning, capo, key and chords; MEDIUM for picking order and rhythm | L6294-6309 |
| 010 | Tabber raw | standard | 3 | G minor | "62-bpm grid" | note detections "clean on this solo nylon guitar"; "Tabber's 62-bpm grid put chord changes mid-bar"; last chord "'A5'" | L6320-6326 |

The post's one-line summaries: L78, L214, L340, L1070, L1999, L2910, L3542, L3870, L4771, L5961. Its preview sums
them up: "All three agree on tuning and capo for six videos, but split on 002's and 009's tuning and on whether 004
is a ukulele" (L14), and for 008: "The two Opus passes don't even agree on how many guitars are in it" (L3870).

## 4. The comparison, "How close each one got" (L47-72)

- Method, whole text: "One rough check. A script measured how much of each of the 12 notes is in each playback and
  compared that mix with all ten real recordings. The table shows where the right recording ranked. 1st means the
  playback was closest to its own song. Picking at random gets 1st one time in ten." (L49-51)
- Rank of the right recording (L53-65): Grok Bot 001 "no tab", 002 "no tab", 003 5th, 004 1st, 005 4th, 006 2nd,
  007 2nd, 008 1st, 009 1st, 010 1st = "4 of 8". Blind: 001 "skipped", 002-010 = 1st, 1st, 1st, 3rd, 4th, 2nd, 2nd,
  5th, 9th = "3 of 9". With Tabber: 001 "skipped", 002-010 = 1st, 6th, 1st, 1st, 2nd, 2nd, 1st, 1st, 1st = "6 of 9".
- "001 is skipped. It's muted or nearly silent, so there's no real mix of notes to compare." (L67)
- Limits as stated: "It's a loose test. Most of these songs sit in the same few keys, the real recordings have
  singing and talking in them, and it only hears notes, not rhythm, strings or tuning. Blind Opus's 9th on 010 is a
  quirk of that. Its notes match the other two passes, but its playback leans hard on the low G, so it looks like
  one of the G major songs." (L69-72)
- The post does not name the script, how the 12-note mix is computed, the distance used, or whether the recordings
  were separated first. Grok Bot's playbacks are at half speed for most videos (L34-35), so the compared playbacks
  differ in length and tempo.
- The frontmatter preview turns this into `verdict: "Opus + Tabber came closest"` and a takeaway naming the
  6 of 9, 3 and 4 of 8 counts (L11-12).

## 5. What the post says nobody has verified

- "Nobody has checked any of them against the songs by ear yet." (L25-26; also the preview point, L16)
- Grok Bot's tunings: "I know at least one of those tuning guesses is wrong." (L33-34) The post does not say which.
- The passes disagree, and the post does not settle it, on: 002's tuning, 009's tuning (open D or standard) and
  whether 004 is a ukulele (L14, L4771, L1070); how many guitars are in 008 (L3870); G major or E minor for 003,
  007 and 008 (L340, L3542, L3870).
- Grok Bot's own files: "NOT a verified note-for-note tablature or proof of the original tuning/fingering" (L368-369);
  "Completion/intent remains PROVISIONAL; it needs listening review" (L1094); transcript clues are "AUTOMATIC /
  UNVERIFIED" (L432); "A six-string open-string tuning test was not recorded or isolated, so alternate tuning cannot
  honestly be ruled out" (L2160-2162); "Song title: unidentified; lyric searches produced no supported match" (L2165).
- Blind pass: 004's fingering "is inferred from pitches, not seen" (L1201); "Uncertain:" notes in 003 (L478-480) and
  010 (L6089-6090).
- Tabber pass: 004 tuning "assumed" and capo "7 equally possible" (L1655, L1671-1672); 001 "every pitch below may be
  one fret off" (L171-172); 009 voicings "inferred from the sounding notes" (L5365).
- Two HTML comments inside Grok Bot's 006 and 007 blocks read "REVIEW before publishing: this file's automatic
  transcript names a person." (L2921, L3553)

## 6. Conventions a new post could follow

- One `<ao-*>` component only: `<ao-compare cols="2" aspect="16/9">`, 10 times, one per video. Each holds four
  `<figure>`s: the real video, then Grok Bot, blind Opus and Opus with Tabber. Every figure has a `<figcaption>` with
  `<b>` (who) and `<span class="ao-meta">` (what it is and its length). A pass with no tab gets a figure holding only
  a figcaption (L82, L218). Counts: 10 `<video>`, 28 `<audio class="fill">`, 30 `<details>`, 30 fenced `text` blocks.
- Video: `controls preload="metadata" playsinline`. Audio: `class="fill" ... controls preload="none"`.
- Every tab is a `<details><summary>` with a fenced `text` block inside, one per pass per video, summary text of the
  form "Blind Opus 5.5's tab for 001" or "Grok Bot's draft for 001, a header and no tab".
- Media URLs are `/media/guitar-tabs-from-video/song-00N.mp4`, `grokbot-00N.mp3`, `opus-blind-00N.mp3`,
  `opus-tabber-00N.mp3`. **(repo check)** `public/media/guitar-tabs-from-video/` is not in git;
  `src/data/media-manifest.json` lists 38 of these paths with bytes and etag (10 MP4, 56,699,104 bytes; 28 MP3,
  54,933,643 bytes). The preview image `public/media/previews/guitar-tabs-from-video.webp` is in git.

Exact markup, L80-82:

````html
<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-001.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:13</span></figcaption></figure>
<figure><figcaption><b>Grok Bot</b><span class="ao-meta">no tab, so nothing to play</span></figcaption></figure>
````

L344:

````html
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-003.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
````

L110-112 and L158-160 (tab lines between them omitted here):

````markdown
<details><summary>Blind Opus 5.5's tab for 001</summary>

```text
```

</details>
````

## 7. Runtime, cost and hardware

- The only statements: the blind pass ran "Opus 5.5 at max reasoning effort" and "installed free audio tools"
  (L37-38); Grok Bot "went through all 103 videos in the album" (L31).
- The post gives no run times, no costs, no token counts and no hardware for any pass.
