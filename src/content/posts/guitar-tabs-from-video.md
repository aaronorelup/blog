---
id: "AO-078"
title: "Turning my guitar videos into tabs with AI"
summary: "My Grok bot and Claude Opus 5.5, once blind and once with a tab-making skill, each turned ten videos of me playing guitar into tabs and audio. What each one heard, and where they agree."
date: 2026-11-09
topic: "agents"
project: []
draft: true        # until Aaron says it's good, in his own words
preview:
  verdict: "Opus + Tabber came closest"
  takeaway: "Played back, the tabs Opus 5.5 made with the Tabber skill came closest to the right recording in 6 of 9 videos. Blind Opus did it in 3, my Grok bot in 4 of 8."
  points:
    - "All three agree on tuning and capo for six videos, but split on 002's and 009's tuning and on whether 004 is a ukulele."
    - "Grok Bot's tabs had no rhythm and two had no notes. Both Opus passes wrote timed tabs for all ten."
    - "Nobody has checked any of these tabs against the real songs by ear."
  image: "/media/previews/guitar-tabs-from-video.webp"
  alt: "A hand fretting a chord on an acoustic guitar, filmed close up"
---

I wanted to see if AI could turn videos of me playing guitar into tabs. Tabs are guitar music
written as fret numbers on six lines, one per string. Three passes tried the first ten videos of
my guitar album: my Grok bot, Claude Opus 5.5 working blind, and Opus 5.5 again with Tabber, a
tab-making skill Claude Code built. **Played back, the tabs Opus made with Tabber came closest to
the right recording most often, in 6 of 9 videos.** Nobody has checked any of them against the
songs by ear yet.

## Three tries

- **Grok Bot sketched the notes.** Grok Bot is my AI assistant. I call it Gages, and it's part of
  [my setup](/now/2026-11-08/). It went through all 103 videos in the album. It took the notes from
  the sound, looked at the picture mostly for a capo (a clamp across the strings that raises every
  note) and assumed standard tuning (E A D G B E) for all ten. I know at least one of those tuning
  guesses is wrong. Its tabs have no rhythm, so it played them back at one steady pace, half my
  speed for most of them. For 001 and 002 it wrote only a header.
- **Blind Opus 5.5 built its own toolkit.** I gave Claude Code the ten videos and nothing else. No
  titles, no guitar or transcription skills, none of Grok Bot's work. Running Opus 5.5 at max
  reasoning effort, it installed free audio tools to split the guitar from the singing, pick out
  the notes and find the beat, and it read the capo and my hand position off the video. Its tabs
  have timing, and its MP3s line up with the videos.
- **Opus 5.5 with Tabber checked a tool's work.** Tabber is a skill Claude Code built. It turns a
  guitar video or audio file into a tab with its best guess at the tuning, capo and key. A second
  Opus 5.5 run used it on all ten, then checked its answers against the sound and the video and
  rebuilt every tab. It kept Tabber's tunings, took out notes Tabber had made from the guitar
  body's hum and from people talking, and moved fingerings to where the video shows my hand.

## How close each one got

One rough check. A script measured how much of each of the 12 notes is in each playback and
compared that mix with all ten real recordings. The table shows where the right recording ranked.
1st means the playback was closest to its own song. Picking at random gets 1st one time in ten.

| Video | Grok Bot | Opus 5.5, blind | Opus 5.5 with Tabber |
|---|---|---|---|
| 001 | no tab | skipped | skipped |
| 002 | no tab | 1st | 1st |
| 003 | 5th | 1st | 6th |
| 004 | 1st | 1st | 1st |
| 005 | 4th | 3rd | 1st |
| 006 | 2nd | 4th | 2nd |
| 007 | 2nd | 2nd | 2nd |
| 008 | 1st | 2nd | 1st |
| 009 | 1st | 5th | 1st |
| 010 | 1st | 9th | 1st |
| **Own song 1st** | **4 of 8** | **3 of 9** | **6 of 9** |

001 is skipped. It's muted or nearly silent, so there's no real mix of notes to compare.

It's a loose test. Most of these songs sit in the same few keys, the real recordings have singing
and talking in them, and it only hears notes, not rhythm, strings or tuning. Blind Opus's 9th on
010 is a quirk of that. Its notes match the other two passes, but its playback leans hard on the
low G, so it looks like one of the G major songs.

## The ten videos

### 001

Nobody found a key in these 13 dark seconds. Grok Bot wrote only a header, blind Opus heard muted strums and wrote just the rhythm, and Opus with Tabber heard soft finger taps.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-001.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:13</span></figcaption></figure>
<figure><figcaption><b>Grok Bot</b><span class="ao-meta">no tab, so nothing to play</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-001.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 0:13</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-001.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 0:16</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's draft for 001, a header and no tab</summary>

The whole file. There's no tab in it.

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20200908_231854.mp4
Source: videos/2026-08-14_001.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 13.24 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: unresolved (tab assumes 0); visual confidence unresolved. Neck obscured, cropped, dark, or not shown
Likely sounding key: unresolved (low confidence; automatic note-profile estimate)
Provisional classification: fragment
Reason: Under 20 seconds; insufficient completed performance; header-only.
Main loop, chord SHAPES relative to capo assumption: No stable loop established
```

</details>

<details><summary>Blind Opus 5.5's tab for 001</summary>

```text
Song 01 - muted (dead-string) swing strumming groove (title unknown)
====================================================================
Source: song01.mp4
Instrument: steel
Tuning: not determinable (all strings are fret-hand muted); standard E A D G B E assumed  [MIDI 40 45 50 55 59 64]
Capo: 0 (none seen in the dark video; irrelevant here because the strings are muted)
Key: none - no pitched notes sound (percussive muted strums only)
Time: 4/4
Tempo: 171 (swung 8ths: the off-beat strum falls on the 3rd triplet)
Grid: 12   (one tab column = 1/12 note)
Pitch offset: +0 cents (guitar's measured detuning vs A440)
Confidence: rhythm medium-high (onsets are clear; swing ratio ~1.7:1 written as triplets); tuning/capo/key/chords: not determinable from the audio - every strum is fret-hand muted, the spectrum after each hit shows only the guitar body resonances (~90 Hz and ~200 Hz) and no string pitches.

What is played: a percussive 'chucking' groove - the fretting hand lies loosely across the strings near
the nut (seen in the video) so nothing rings; only the strumming rhythm carries information.
Two-bar pattern (counting 1 & 2 & 3 & 4 &, swung):
   bar A:  1   2 & 3 & 4 &      (D  D U D U D U)
   bar B:    &   & 3 & 4        (  U   U D U D )   <- the 3& is missing in the 2nd bar of the clip
Accents fall on beat 2 (and 4) of bar A.  Down-strums are drawn on all 6 strings, up-strums on the top 4.
The D/U line under each staff shows the strum direction.  The take is only ~10 s long (0:01.6-0:11.9).

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

@ 0:01.57
 
e|x--x-xx-xx-x|--x--xx--x--|x--x-xx-xx-x|--x--xx-xx--|
B|x--x-xx-xx-x|--x--xx--x--|x--x-xx-xx-x|--x--xx-xx--|
G|x--x-xx-xx-x|--x--xx--x--|x--x-xx-xx-x|--x--xx-xx--|
D|x--x-xx-xx-x|--x--xx--x--|x--x-xx-xx-x|--x--xx-xx--|
A|x--x--x--x--|------x--x--|x--x--x--x--|------x--x--|
E|x--x--x--x--|------x--x--|x--x--x--x--|------x--x--|
  D  D UD UD U   U  UD  D   D  D UD UD U   U  UD UD

@ 0:07.18
 
e|x--x-xx-xx-x|--x--xx-xx--|x--x-xx-xx-x|-----x------|
B|x--x-xx-xx-x|--x--xx-xx--|x--x-xx-xx-x|-----x------|
G|x--x-xx-xx-x|--x--xx-xx--|x--x-xx-xx-x|-----x------|
D|x--x-xx-xx-x|--x--xx-xx--|x--x-xx-xx-x|-----x------|
A|x--x--x--x--|------x--x--|x--x--x--x--|------------|
E|x--x--x--x--|------x--x--|x--x--x--x--|------------|
  D  D UD UD U   U  UD UD   D  D UD UD U      U
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 001</summary>

```text
====================================================================================================
 song01 - 13-second near-silent clip: soft fretting-hand taps / finger exercise (not a song)
====================================================================================================
 Source        : song01.mp4 (0:13), filmed in the dark looking down the neck; the guitar is ~20-25
                 dB quieter than in the other clips. No vocals (whisper's 'I'mo, R.' is noise).
 Tuning        : Assumed standard E A D G B E (nothing in the audio contradicts it; too quiet to
                 verify). The weak tones sit between semitones (~+40 cents), so every pitch below
                 may be one fret off.
 Capo          : none (headstock, nut and first frets visible, no capo)
 Key           : none / undetermined - chromatic finger work around F-G-G#, no chords
 Tempo / feel  : free; about 3-4 taps per second (written as 16ths at q = ~120)
 Progression   : none (single tapped notes, no chords)
 Structure     : ~11 s of quiet taps, then the camera turns away.
 Confidence    : LOW. The onsets are percussive and broadband (fret/finger noise) with only faint
                 pitch; the tab shows the strongest pitch per tap mapped onto frets 1-4 of the low E
                 string and the open/1st-fret G string, where the hand is in the video.
----------------------------------------------------------------------------------------------------
 Very soft taps (hammer-ons from nowhere) - the MP3 renders them quietly and short.
 16 slots per 2-second bar.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: standard / capo 0 (fine), but 'G minor' and the chart 'Ab5 - G5' are
                 artefacts of 8 faint detections; it rightly labelled the clip a fragment (score
                 0.15). My version keeps only the stronger taps, places them where the hand is, and
                 marks everything low-confidence.
====================================================================================================


[Whole clip (0:01-0:12): soft taps, frets 1-4 on the low E string + open/1st fret G string]  (pitches uncertain: +/- 1 fret)
    (0:01, bar 1)
e|--------------------------------|--------------------------------|--------------------------------|
B|--------------------------------|--------------------------------|--------------------------------|
G|------------------------1---0---|----1-----1---------------0-----|--1-------------0-------1-------|
D|--------------------------------|--------------------------------|--------------------------------|
A|--------------------------------|--------------------------------|--------------------------------|
E|--3-----4---4-4---4-4-----------|----------------3-----3---------|2---1-----1-------------------3-|

    (0:07, bar 4)
e|--------------------------------|--------------------------------|--------------------------------|
B|--------------------------------|--------------------------------|--------------------------------|
G|--0-------1-------1-----1-------|1---0-1---1---------1-0---1---1-|--------------------------------|
D|--------------------------------|--------------------------------|--------0-----------------------|
A|--------------------------------|--------------------------------|--------------------------------|
E|--------------3-----------------|----------------4---------------|--------------------------------|
```

</details>

### 002

Both Opus passes heard drop D tuning (the low string tuned down to D) and D major. Grok Bot's header guessed D major too, but it assumed standard tuning and has no tab under it.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-002.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:05</span></figcaption></figure>
<figure><figcaption><b>Grok Bot</b><span class="ao-meta">no tab, so nothing to play</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-002.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 0:09</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-002.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 0:08</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's draft for 002, a header and no tab</summary>

The whole file. There's no tab in it.

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20200825_073413.mp4
Source: videos/2026-08-14_002.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 5.11 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: 0; visual confidence medium. No capo visible in sampled frames
Likely sounding key: D major? (moderate confidence; automatic note-profile estimate)
Provisional classification: fragment
Reason: Under 20 seconds; insufficient completed performance; header-only.
Main loop, chord SHAPES relative to capo assumption: No stable loop established
```

</details>

<details><summary>Blind Opus 5.5's tab for 002</summary>

```text
Song 02 - short drop-D fingerstyle phrase, D -> G (title unknown)
=================================================================
Source: song02.mp4
Instrument: steel
Tuning: Drop D: D A D G B E (low to high)  [MIDI 38 45 50 55 59 64]
Capo: 0 (none)
Key: D major (I -> IV: D -> G)
Time: 4/4
Tempo: 154
Grid: 16   (one tab column = 1/16 note)
Pitch offset: +0 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Confidence: overall medium. Tuning (drop D) high: sustained D2 below standard low E. Capo none: high (nut visible). Key/chords D -> G: high. Exact voicings/fingering: medium (hand position seen at frets 5-7 then 3-5). Rhythm: medium (clip has only ~3 s of playing, meter assumed 4/4 at ~154 BPM).

Notes: the clip is 5.1 s long; the guitar is silent for the first 2 s and the phrase is cut
off at the end of the video.  Melody on the high e string: A(5) Bb(6) B(7) A(5) over an open-D/A drone,
then a D(add9) shape (D bass on the A string) and a G chord in drop-D (5-5-5-4-3).  The weak D3 heard at 0:02.07 is most likely
the octave partial of the open low D, so the 5th string is shown open (open A2 is clearly heard at 0:02.75).

Chord progression (time in video -> chord)
  0:02.06 Dsus2  |  0:03.05 Dadd9  |  0:03.62 G

Chord shapes used (lowest -> highest string, x = not played):
  Dsus2: 0 0 7 7 5 5   Dadd9: x 5 4 x 5 5   G: 5 5 5 4 3 x

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

@ 0:02.07
  Dsus2               Dadd9        G
e|5---6h7p5-------5---5-----------|--------------------------------|
B|------------5---5-5-5-----------|------------3-------------------|
G|7-------------------------7-7---|------------4-----------4-------|
D|7-------7-----7-----4-------4---|--------5-----------------------|
A|--------------0-0---5---------5-|------------5-------5---5-------|
D|0-------------------------------|5-------5---5-------------------|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 002</summary>

```text
====================================================================================================
 song02 - 5-second fingerpicked fragment in D (drop D tuning)
====================================================================================================
 Source        : song02.mp4 (0:05); steel-string acoustic, fingerpicked, no vocals (Tabber/whisper's
                 'Thank you.' is a hallucination). Video is mirrored (headstock on the left).
 Tuning        : DROP D: D A D G B E (low to high). Evidence: a sustained low D2 (below standard E2)
                 and the A-B-A-E melody is played at frets 5-7 on the top strings, which only fits
                 drop D (open D/DADGAD would need frets 7-9 there). Recording is in tune with A440
                 (+3 cents).
 Capo          : none (no capo on the neck in the video)
 Key           : D major
 Tempo / feel  : free, roughly q = 150 (16th = 0.1 s)
 Progression   : | D5  D/A  D/F# | G  G/D |  (only ~3 seconds of music)
 Structure     : Fragment / false start; the clip ends mid-phrase.
 Confidence    : Tuning MEDIUM-HIGH (drop D, video + register), capo HIGH, key HIGH, notes MEDIUM
                 (only 3 s; the G-chord voicing 5-x-0-4-3-x is my reading of the hand position).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   D5           0 x x 2 3 5              D A D A
   D/A + D/F#   x 0 x 4 5 5 / x 5 4 x 3 x
   G            5 x 0 4 3 x              G D B D
----------------------------------------------------------------------------------------------------
 Tab strings are labelled for drop D: e B G D A D. 16 slots per bar (16th notes).
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber chose drop D but with only 0.40 confidence (open D 0.39 close behind) -
                 correct; capo 0 correct; key D major correct. Its tab put the A3 on the D string
                 7th fret and the G-chord D4 on the G string 7th fret; I moved them to the G string
                 2nd fret and B string 3rd fret to match the hand positions in the video. Its
                 'lyrics: Thank you.' are a whisper hallucination.
====================================================================================================


[Fragment (whole clip)]
                        D5         D5            D/A           D/F# G                           G/D    (0:00, bar 1)
e|--------------------------------|5-----7-5---5---5---5-----------|--------------------------------|
B|--------------------------------|3-----------5---5---5-------3---|----------3---------------------|
G|--------------------------------|2-------------------------------|----------4-----------4---------|
D|--------------------------------|--------------------4-------4---|----------0-------0---0---------|
A|--------------------------------|--------------0-----5-------5---|--------------------------------|
D|----------------------0---------|0-------------------------------|5-----5---5---------------------|
```

</details>

### 003

All three heard standard tuning and no capo. Both Opus passes call it E minor and Grok Bot G major, two keys with the same notes.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-003.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">1:56</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-003.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-003.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 1:58</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-003.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 2:00</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 003</summary>

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20200916_175731.mp4
Source: videos/2026-08-14_003.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 116.17 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: 0; visual confidence high. No capo visible in sampled frames
Likely sounding key: G major? (moderate confidence; automatic note-profile estimate)
Provisional classification: fragment/partial
Reason: Short/partial take; a complete song was not established. This is provisional, not a claim of aimless playing.
Main loop, chord SHAPES relative to capo assumption: Em? -> Esus4?

IMPORTANT LIMITATIONS
This is a machine-assisted first-draft pitch/harmony sketch, NOT a verified
note-for-note tablature or proof of the original tuning/fingering. All chord
labels/finger positions are provisional (?). Source contains voice/noise;
some detected notes may be sung pitches or harmonics. A key estimate is NOT
a tuning diagnosis. Do not retune to a guessed alternate tuning.
If capo is unresolved, this file assumes fret 0 for its draft positions.
If tuning differs from standard, string/fret placement must be revised.

CHORD CHART / MAIN HARMONIC MATERIAL
Most repeated estimated pattern: Em? -> Esus4?
Common estimated sounding sonorities (time-weighted, NOT a progression): Em?, Dsus4?, Am7?, Csus2?, Eb?, G?, Bsus4?, Esus4?

Approximate estimated changes in the first 90 seconds:
     2.2–   6.0 s: Em? shape / Em? sounding
     6.0–   9.8 s: Dsus4? shape / Dsus4? sounding
     9.8–  11.2 s: D? shape / D? sounding
    11.2–  12.8 s: Gsus2? shape / Gsus2? sounding
    12.8–  18.8 s: Am7? shape / Am7? sounding
    21.0–  24.8 s: G? shape / G? sounding
    26.2–  28.5 s: Eb? shape / Eb? sounding
    28.5–  30.8 s: F? shape / F? sounding
    30.8–  41.2 s: Dsus4? shape / Dsus4? sounding
    41.2–  45.0 s: Em? shape / Em? sounding
    45.0–  48.0 s: Eb? shape / Eb? sounding
    48.0–  50.2 s: Gsus2? shape / Gsus2? sounding
    50.2–  54.8 s: Am7? shape / Am7? sounding
    54.8–  58.5 s: Em? shape / Em? sounding
    58.5–  60.8 s: Eb? shape / Eb? sounding
    60.8–  62.2 s: A7? shape / A7? sounding
    62.2–  64.5 s: Csus2? shape / Csus2? sounding
    64.5–  66.0 s: Dsus4? shape / Dsus4? sounding
    66.8–  68.2 s: C? shape / C? sounding
    68.2–  72.8 s: Em? shape / Em? sounding
    72.8–  77.2 s: Bsus4? shape / Bsus4? sounding
    77.2–  82.5 s: Em? shape / Em? sounding
    82.5–  84.0 s: Esus4? shape / Esus4? sounding
    84.0–  87.0 s: Cmaj7? shape / Cmaj7? sounding
    87.0–  89.2 s: Em? shape / Em? sounding
    89.2–  90.8 s: Esus4? shape / Esus4? sounding

SOURCE-PITCH ASCII SKETCHES — ALL STRING ASSIGNMENTS UNCERTAIN (?)
These show actual model-detected onset pitches mapped to playable standard-
tuning positions; not a generic invented fingerpicking pattern. Each cell
is 0.5 s; simultaneous/repeated fast notes are reduced. Dashes are not proof
of silence. Positions favor low frets and may differ from the hand in video.
Fret numbers are relative to the capo assumption. Rhythm/voice separation
and fast ornaments are unresolved; use these only as play-along prompts.

Excerpt 10.0–26.0 s (?)
e |-2-------3-3-----3---------3-3-3---3----------------------------|
B |-----------------------------------8----------------------------|
G |-2-----2-2-2-2-----2-------0-2-2-2-2-0-------0-0-0---0-0-0------|
D |-----------5-------------------5---7-5--------------------------|
A |-----------3---3---------3-----3-----5--------------------------|
E |-------3-3------------------------------------------------------|

Excerpt 50.1–66.1 s (?)
e |-3-3-3-3---3-3-3-3-------------3-2-----3---2-3---------3-3---3-3|
B |---------------------0-----0-----------------8---3-----------8--|
G |-2---2-2---2---2-2---4-0-------0-0---2-----2-2---2-------0---0-2|
D |-----7---------5-5---------------1-----1---1-7-----------7-----5|
A |-3--10-3---3---3-----------------------------7---3---3-3--------|
E |-----8-------------------------------0--------------------------|

TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)
Do not rely on these as accurate lyrics or authorship evidence.

KEY/TUNING EVIDENCE
Profile correlations (not probabilities): G major r=0.754, E minor r=0.531, G minor r=0.518
Strong lower detected pitches: G3 (17.1), C3 (8.0), D♯3 (3.0), E2 (1.7), E3 (1.5), G2 (1.0), F♯3 (0.5), D3 (0.5)
Low-note support is not enough to identify every open string. Tuning left
unresolved instead of falsely declaring standard, DADGAD, or an open tuning.

CONDITIONAL CHORD GRIPS — STANDARD-TUNING ARRANGEMENT OPTIONS (?)
Low E to high e; all numbers relative to the stated capo assumption.
These are suggested playable grips, NOT observed source fingering.
Em? : 0 2 2 0 0 0
Esus4? : x 7 9 9 10 7
Dsus4? : x x 0 2 3 3
Am7? : x 0 2 0 1 0
If the actual tuning differs, these grips are not the original arrangement.
```

</details>

<details><summary>Blind Opus 5.5's tab for 003</summary>

```text
Song 03 - fingerpicked instrumental in E minor (title unknown)
==============================================================
Source: song03.mp4
Instrument: steel (steel-string acoustic, soundhole pickup; fingerpicked)
Tuning: Standard E A D G B E  [MIDI 40 45 50 55 59 64]
Capo: 0 (none)
Key: E minor (relative G major); i - V7 - (D/F#) - VI(C) movement
Time: 4/4 (free/rubato performance: bar lines follow tracked beats and are approximate)
Tempo: ~110 (rubato: drifts roughly 85-125 BPM; anchors follow the video)
Grid: 16   (one tab column = 1/16 note)
Pitch offset: +6 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Confidence: overall MEDIUM-LOW. Tuning: medium-high (standard). Capo: high (none). Key: high (E minor). Chord shapes: medium. Rhythm/bar placement: low-medium. Individual notes: low-medium.

How this was made: audio transcribed with basic-pitch (after Demucs separation), chord shapes
inferred from per-section pitch content and checked against the hand position in the video
(fret positions calibrated from the inlay dots, 12th-fret double dot); fingering chosen by a
playability optimiser constrained to those shapes; then hand-corrected.
Style: fingerpicked arpeggios, mostly 16th-note motion; most shapes sit at frets 6-12 with the
open G (and often open B / low E) strings ringing as drones - this is why G and A are heard
almost everywhere. Lowest note is the open low E (E2), so no capo. F#2/G2 rumble in the
recording is body resonance, not played notes, and was removed.
Uncertain: exact string choice for some melody notes (B-string 7-10 vs high-e 2-5 region is
resolved towards the video's hand position), which bass notes are struck on which beat, and
the metre (the performance speeds up and slows down freely, ~85-125 BPM).

Chord progression (time in video -> chord)
  0:02.50 Em  |  0:06.40 B7  |  0:09.50 D/F#  |  0:11.90 C6/9  |  0:19.00 G  |  0:21.00 Em
  0:25.90 B7  |  0:29.30 C6/9  |  0:41.40 G  |  0:42.40 Em  |  0:45.00 B7  |  0:48.40 C6/9
  0:52.50 C6  |  0:55.30 Em  |  0:58.40 B7  |  1:01.40 Em11  |  1:02.50 C6/9  |  1:05.00 C6
  1:07.40 G(add11)  |  1:10.00 Am9  |  1:12.40 Em  |  1:17.80 G(add11)  |  1:20.00 Am9  |  1:22.40 Em
  1:24.80 Cmaj9  |  1:28.90 Em  |  1:32.40 C6/9  |  1:34.70 G(add11)  |  1:37.40 Em11  |  1:39.90 B7sus4
  1:42.40 Em11  |  1:45.40 G(add11)  |  1:47.90 Em11  |  1:50.40 Em  |  1:53.40 Em11  |  1:54.00 C6/9
  Sections (approx.): A 0:02-1:05  Em - B7 - (D/F#) - C6/9, four times round (C6 = open-G version of C6/9)
                      B 1:05-1:37  C6 - G(add11) [12th position] - Am9 - Em - G(add11) - Am9 - Em - Cmaj9 - Em - C6/9
                      C 1:35-1:56  G(add11) - Em11 - B7sus4 - Em11 - G(add11) - Em11 - Em - C6/9 (ends on C6/9)
  Sounding chords: Em, B7 (no root, b13 = open G), D/F#, C6/9(no 3rd), G(add11), Am9, Cmaj9, Em11, B7sus4.
  Shape notes: '7/0' = this string alternates between fret 7 and open within the pattern.

Chord shapes used (lowest -> highest string, x = not played):
  Em: 0 7 9 0 8/7/10 7/5   B7: x 6 7 0 7/8 5   D/F#: x 9 7 7 7 x   C6/9: 8 x 7 7/0 8 7   G: x x 0 0 0 x   C6: 8 x 7 0 8 7   Em11: x 7 7 7/0 8 7   G(add11): x 10 10 0/12 8/12 7/10   Am9: x 0 7 0 8 7   Cmaj9: 8 x 9 7/0 8 x   B7sus4: 7 9 9 x 7 0

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

@ 0:02.44
  Em                                                         B7
e|----------------7---------------|------------------5-------------|
B|--------10--------------10------|10--------------7-----------7---|
G|------------0---------0-0-------|0---0-0-0-----------------------|
D|----------------9-------9-------|9-------9-------------------7---|
A|------9-9-----------------------|--------7-7-------------------6-|
E|------0-0---------------7-0-----|--------------------------------|

@ 0:06.79
                                           D/F#
e|----------------5---------------|--5-----------------------------|
B|----------------------7---------|7-----7-------7---7-------------|
G|--------0-------0-----0-0-------|0-----0-----------7-------------|
D|--------7-------7-----7-7-------|7-----7-----------7-------------|
A|--------6---------------6-------|6-------------------------------|
E|--------------------------------|--------------------------------|

@ 0:11.22
            C6/9
e|--------------------------------|----------------7---------------|
B|----------------8-----8---------|------------8---8---8-----------|
G|--------0-7-----7-----7-7-------|0-------0-----------7-----------|
D|----------7-----7---0-7-7-------|7-------7-----7-----7-----------|
A|9---------------10------10------|--------------------------------|
E|----------8-------------8-------|--------8-8---8---8-------------|

@ 0:15.57
                                                       G
e|----------------7---------------|--------------------------------|
B|----------------8-------8-------|--------8-----8-8-8-0-----------|
G|--------------0-7-------------0-|0-------7-----0-----0-0-0-------|
D|------7-------7-5-------7-----7-|7-------7-----7-7-7-0---0-------|
A|--------------------------------|--------10----------------------|
E|------------8-------------------|8-------------------------------|

@ 0:19.85
                  Em
e|--------------------------7-----|7-------------------------------|
B|--------------------------10----|10----1010----------------------|
G|----------------0---------0-----|0-----0-0-------0-----0-0-0-0-0-|
D|----------------9---------9-----|--------9-------------9-9-------|
A|--------------------------------|----------9---------------------|
E|------------------------0-------|0---------0-------0-------------|

@ 0:24.42
                        B7
e|--0---0-------------------------|------------------5-------------|
B|------------------------7-------|7-------7-------7-----8-7-------|
G|--------------------------------|0-----0---------0-----0---------|
D|------------------------7-------|7-----7-7-------------7-7-------|
A|------------------------6-------|6-----6-6-------------6-6-------|
E|0-------------------------------|--------------------------------|

@ 0:28.78
          C6/9
e|------------------7-----7-------|7---------------------7-------7-|
B|----------------8-------8-----8-|--------8-----8-8---8-8-----8---|
G|--------------------------------|--7-----7-----------------7-----|
D|7-------7-------7-------7-----7-|7-------7-----7-7---7-----7-7---|
A|6-------------------------------|--------------------------------|
E|----------------8---------------|8---------------8---------8-8---|

@ 0:33.02
 
e|----7---------------------------|--------7-----------------------|
B|--------------------------------|------8-8---8-------------------|
G|----7-------------------7-------|------7-------7-----------------|
D|------------------------7-------|----0-7-------7-7---------------|
A|--------------------------------|--------------------------------|
E|------------------------8-------|--------------8-8-----------8-8-|

@ 0:37.02
 
e|----------------7-------------7-|----------------7---------7-----|
B|------------8---8-----------8---|--------8-----8-----------8-----|
G|0-------7---0-----------0---7---|--------7-----7-7---------7-----|
D|----7---------------------7-5---|--------7---0-7-7---------7-----|
A|--------------------------------|--------------1010--------------|
E|--------------------------------|--------------108---------8-----|

@ 0:40.75
            G               Em
e|--------------------------------|------------7-------------------|
B|8-8-----0-----------------------|8---------8-10--------108-------|
G|7-----------------------------0-|--0-----0---------0---------0---|
D|7-------0-----------------------|----------9-------9-----9---9---|
A|--------------------------------|9---------9-------------9-------|
E|------------------------0-------|0-------0-0---7---------0-------|

@ 0:44.67
        B7                                               C6/9
e|0---------5-----5---------5-----|--------------------------------|
B|--------7-------------7-7-------|------8-7---------7-------------|
G|----------------0-----0---------|0-----0-----0-------------------|
D|9-----------------------7-------|------7-7---------7-------------|
A|------6-6-------------6-6-------|------6-------------------------|
E|--------------------------------|--------------------------------|

@ 0:49.03
                                                       C6
e|7-------7-----------------7-----|7-------------------------------|
B|8-------8-----8-8-------8-------|------------8-------8-----------|
G|0-------------7-7-------7-----0-|7---7-0---0-7-----------0-------|
D|--7-----------7-7-------7-----7-|7---7-----7-7-----------7-------|
A|----------------10------10------|10--10------10------------------|
E|--8-------------8---------------|8---8-----8-------------8-------|

@ 0:53.28
                                Em
e|7-------7-----------------------|--------------5-----------------|
B|8---------------8-----8-----0---|--10----7-------------7---8-----|
G|0-------0-------0---------------|--0-----------0---------0-0-0---|
D|--------7-------7-----7---------|9-9-----9---------------9-------|
A|--------------------------------|9-------------7-----------------|
E|8-------8-------8---------------|--0-------0---0-----------------|

@ 0:58.36
  B7                               Em11        C6/9
e|----5---------------------------|----7---------------------------|
B|--7---------8-------8---7-----8-|8-------------------------------|
G|0-0-----0---0-----------------7-|------------7-------0---0-------|
D|--7---------7-----------7-----7-|7-------7---7-------------------|
A|6-6---------6-----------6-----7-|7-----------10------------------|
E|--------0-----------------------|------------8-------8---8---8---|

@ 1:04.36
          C6                         G(add11)
e|--------7-------7---------------|7-----7-----10--10--------------|
B|--------8---8---8---------------|--8---8-----12--------12----8-8-|
G|0-------0-------0---------------|------------12--12--1212----0---|
D|7-------7-------7---------------|10----------------------0-------|
A|--------------------------------|------------10----------------0-|
E|----8---------------------------|--------------------------------|

@ 1:09.95
  Am9                         Em
e|------7-7---------7-------5-----|5---------------0-------0-----5-|
B|----8-8-8-----8---8-------0-----|7-----10----------------10----7-|
G|----------------------0---0-----|------0---------0-------0-------|
D|--------7-----------------------|9---9-9---9---9-9-9---9-9-------|
A|--------------0-----------------|----------------------------7---|
E|----------------------------7---|------------------------7-------|

@ 1:15.48
                                G(add11)                       Am9
e|0---0---------0-5-------7-----7-|----7-10--7-----7---------------|
B|--7-10----7---7-7-------------8-|--8-8-----8---8-8-------8-----8-|
G|----0-------0---9-------0-----0-|--------------------------------|
D|--9-9---------------------------|------10--------100-----7-------|
A|----------------7---------------|----10--------------------------|
E|--7-----------7-----------------|----------------8---------------|

@ 1:20.33
                                Em
e|7---7---------------------------|--------------------------------|
B|8-8-8-----8---8-8-------101010--|--10101010----------10--------8-|
G|----------0---------0-0---11----|--11----0-----------------------|
D|----7-----------7---------9-----|--9---9-9-------9---------------|
A|--------------------------10----|------------------------------9-|
E|--------------------------------|--------0-----------------------|

@ 1:24.60
      Cmaj9
e|--------------------------------|--------------------------------|
B|--------------8---------------8-|8-------8-----------------------|
G|--0-----7-----7-0-------7-------|--------7-----------------------|
D|--9-----9-----9-9-------9-----9-|--------------------------------|
A|--------10----10----------------|--------------------------------|
E|8---------------8---------------|--------------------------------|

@ 1:28.54
        Em
e|--------5-----------------------|0-----7-------------------------|
B|--------7-----1010------------10|--------8-----------------------|
G|0-------------------------------|------------------------0-------|
D|--------9-----9-9-------9-------|------------------------7-------|
A|--------------------------------|--------------------------------|
E|0-----------0-------------------|------------------------8-------|

@ 1:32.39
  C6/9                                   G(add11)
e|--------------------------------|7---------------7---------------|
B|8---8---------8-----8-----------|--------8-----8-8-------8-----8-|
G|0-----0-0-----0-------0---------|0---------0-----0---------------|
D|7-----7-7-----7-----7-7-------10|10--------------10------10----10|
A|--------------------------------|--------------------------------|
E|--------8-----8-----8-----------|--------------------------------|

@ 1:36.16
                        Em11
e|----------7-7---------------7---|----7-----7-7-----------5-------|
B|8---------8-8-------8-------8---|----8-----8-8-------------------|
G|------------7-------------0-----|----0-----0-----0---0-0-0-------|
D|10--0-----------------------7---|--------------------------------|
A|------------------------------7-|------7---------------------0---|
E|--------------------------------|--------------------------------|

@ 1:39.85
  B7sus4                                       Em11
e|5-------0---------------0-------|----7-------------------7-------|
B|7-----7-0-------7-----7---------|----7-----------8-------8-----8-|
G|--------------------------------|--------------------------------|
D|9-------------------------------|------------------7-------------|
A|--------------------------------|----------------7-------7-----7-|
E|7---------------7---------------|--------------------------------|

@ 1:43.50
                                       G(add11)
e|--------------------------------|10----------10----7-----7-----7-|
B|8-------8-----8-8---------8-----|12--------1212----------8-----8-|
G|--------------------------------|12----12----120-----------------|
D|7-------------7-7---------------|----------10--------------------|
A|7-------7-0---------------------|--------------------------------|
E|--------------------------------|--------------------------------|

@ 1:47.54
      Em11                             Em
e|7-----7---7-7-----------7---0---|------------0-----------0-----7-|
B|8-----8---8-8-----8---8-8-----10|10----10--1010----10--10--10--8-|
G|----------0-----------0---0-0-0-|11----0-----0-------------------|
D|7-----7-0---7-------------------|0-----9---9-9---------9-9-9-0---|
A|------------7-----7-------------|--------------------------------|
E|--------------------------------|------------7-------------------|

@ 1:52.64
            Em11    C6/9
e|--------------------------------|
B|----------------8-----------8---|
G|--------0---7---0---------------|
D|----7---7---7---7-----------7---|
A|7---7-------10------------------|
E|--------8---8---8---------------|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 003</summary>

```text
====================================================================================================
 song03 - instrumental fingerstyle piece in E minor, played around the 7th position (no capo)
====================================================================================================
 Source        : song03.mp4 (1:56), steel-string acoustic, fingerpicked, no singing (whisper's
                 'Thanks for watching' etc. are hallucinations). Camera shows frets ~2-17; hand
                 mostly at frets 6-10.
 Tuning        : Standard E A D G B E; in tune (+3 cents). Open low E (82.4 Hz) is used as the bass
                 of the Em sections, so no capo and no lowered 6th string.
 Capo          : none (the open low E sounds as E2; the fret inlays at 3/5/7/9/12/15/17 place the
                 hand at frets 6-10, which matches the 7th-position voicings below)
 Key           : E minor
 Tempo / feel  : 4/4, q = ~123, steady fingerpicking (16th-note grid; bars ~1.95 s)
 Progression   : Main loop: | Em(add9) | Em(add9) | C6/9 | C6/9 |  with B7(b13) turnarounds back to
                 Em;
                 intro: | Em(add9)  G | D/A  B7(b13) | Em(add9)  Am7 | D/A | C6/9 x4 |;
                 middle: C6/9 - G - Cmaj7 - Em7 - Dsus4 - Am7 - G - Bm7 - B7(b13) - Em; ends on Am7.
 Structure     : Intro (bars 1-6) - C vamp (7-10) - Em (11-14) - B7 (15) - C vamp (16-22) - Em
                 (23-25) - C vamp (26-29) - Em (30-33) - development (34-50) - closing (51-60).
 Confidence    : Tuning/capo HIGH. Key HIGH. Chords MEDIUM-HIGH (automatic labels checked against
                 the bass and the video). Fingering MEDIUM (7th-position confirmed by video at 0:12,
                 0:26, 0:27; elsewhere chosen by a hand-position optimiser). Note detail MEDIUM
                 (fast arpeggios; some inner notes may be missing or extra).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   Em(add9)     0 7 9 0 0 x  (+B7/8/10)  E B F# G B + melody F#-G-A on the B string, B on e7
   C6/9         8 x 7 7 8 x  (+open G)   C A D G
   B7(b13)      x 6 7 0 7 x              D# A G F#  (V7 of E minor)
   B7           7 6 7 8 7 x
   Bm7          7 x 7 7 7 x
   D/A          x 0 0 7 7 x              A D D F#
   Dsus4        x x 0 7 8 x              D D G
   Am7          x 0 7 5 8 x              A A C G
   Em11         0 7 7 7 8 x              E E A D G
----------------------------------------------------------------------------------------------------
 Frets 7-10 with open strings ringing; let everything ring. 16 slots per bar (16th notes).
 Low notes F#2/G2 reported by Tabber are the guitar body's air resonance (~94 Hz), not played.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: standard tuning and capo 0 right (capo confidence only 0.66). Key 'G major'
                 -> really E minor (B7 cadences, Em tonic). Its biggest error: the body resonance at
                 ~94 Hz became F#2/G2 bass notes, so it labelled the C sections 'Gsus2'/'G' and the
                 B7 'D#dim'/'D/F#'; and its fingering jumps between open position and the 7th-10th
                 frets inside one chord. I removed the resonance notes, relabelled the harmony
                 (Em(add9) / C6/9 / B7(b13) / Bm7 / D / Am7) and re-fingered everything in the 7th
                 position the video shows.
====================================================================================================


[Intro and A section (Em - D - B7 - Em - Am7 - D)]
  Em(add9)                                         Em11                    Em(add9)    (0:00, bar 1)
e|------------------------------------------------|---------------------------------------------7--|
B|------------------------------------------------|------------------------------10-------------0--|
G|------------------------------------------------|------------------------------0-----------------|
D|------------------------------------------------|------------------------------9-----------------|
A|------------------------------------------------|---------------------------9--------------------|
E|------------------------------------------------|---------------------------0--------------------|

  Em(add9)                G                        D/A                     B7b13    (0:03, bar 3)
e|------------------------5-----------------------|---5--------------------------------------------|
B|---------0--10----------8-----------0--8--------|---7--------------------7-----------------------|
G|------0-----------------0-----0-----0-----------|------------------------------------------0-----|
D|---------0--------------9--------0--------------|------------------------7-----------------7-----|
A|---------7-----------------------------7--------|------------------------6-----------------6-----|
E|---------7--0-----------------------7-----------|------------------------------------------------|

  Em(add9)                Am7                      D/A    (0:07, bar 5)
e|---------5--------------------------------------|---------------------7--------------------------|
B|---------8--------7-----------------7--10----7--|------------------7-----------------------------|
G|---------0--------0-----------------0-----------|0--------------------7--------------------------|
D|------------------7-----7-----------7-----------|7--------------------7--------------------------|
A|------------------------6-----------6-----------|------------------------------------------9-----|
E|------------------------------------------------|------------------------------------------------|


[C6/9 vamp (8-x-7-7-8-x with the open G ringing)]
  C6/9                                             C6/9    (0:11, bar 7)
e|------------------------------------7-----------|---------------------------7--------------------|
B|---------8-----------8--------8-----------------|---------------8-----------8--------------------|
G|---------7--0-----------7-----7-----0-----------|0-----------0--------------------7--------------|
D|------------7-----------7-----0--7--------------|7-----------7-----------7--------7--------------|
A|------------------------10----10----------------|------------------------------------------------|
E|------------8-----------------------8-----------|8-----------8-----------8--------8--------------|

  C6/9                                             C6/9    (0:15, bar 9)
e|---------------------------------7--------------|------------------------------------------------|
B|---------------------------------8-----------8--|------------8-----------8--------8-----8-----0--|
G|---------------------------0--7-----------------|---------0--7-----------7--------------------0--|
D|---------------7--------------7--------------7--|---------7--------------7--------7-----7--------|
A|------------------------------------------------|------------10----------10----------------------|
E|------------------------8-----------------------|------------8-----------------8-----8-----------|

  G                       Em11    (0:19, bar 11)
e|------------------------------------------------|
B|------------------------------------------------|
G|---0--------------------------------------------|
D|0--0--------------------------------------------|
A|0-----------------------------------------------|
E|------------------------------------------------|


[Em section -> B7(b13)]
  Em(add9)                                         Em(add9)    (0:21, bar 12)
e|---------------------7-----------7--------------|------------------------------------------------|
B|---8--------------0--10----------10-0-----10-0--|------------10-------0--------------0-----------|
G|---0-----------------0-----------0--------0-----|------------0--------0-----0-----0--------------|
D|---9--------------------------------------------|------------------------------------------------|
A|------------------------------------------------|9-----------------------------------7-----------|
E|---------------0--0--------------0--------------|0--------------------------------------0--------|

  Em(add9)                B7                       B7b13                   Dsus4    (0:24, bar 14)
e|0-----------------------------------------------|------------------------------------------------|
B|---------------------------------7-----------7--|------7--7--10-------7--10-------8--7-----------|
G|---------------------------------------------0--|------0-----------------0--------0--------------|
D|---------------------------------7-----------7--|------7--------------------------7--------------|
A|---------------------------------6-----------6--|------6--------------------------6--------------|
E|---------------------------------7--------------|------------------------------------------------|

  Asus2                   C6/9    (0:28, bar 16)
e|---------------------------------7-----------7--|
B|---------------------------------8-----------8--|
G|---------------------------------------------7--|
D|---7--------------------------7--------------7--|
A|------------------------------------------------|
E|------------------------------8--8--------------|


[C6/9 vamp]
  C6/9                                             C6/9    (0:30, bar 17)
e|---------7--------------------------------------|7--------7--------------------------------------|
B|------8-----------------8--------8--------8-----|---------8-----------8--------------------------|
G|------------------------7--------7--------------|------7--------------7--------------------------|
D|------7--7--------------7-----0--7--------7-----|------7-----------------------------------------|
A|---------9--------------------------------------|------------------------------------------------|
E|---------8-----------------------8--8-----------|---------8--------------------------------------|

  C6/9                                             C6/9    (0:34, bar 19)
e|------------------------------7-----7-----------|---------------------------------------------7--|
B|---------8--------------------8-----------8-----|---------------------------------------8--8-----|
G|---------7--------------------7-----------7-----|---------------------0-----------7-----0--------|
D|---------7--------------------7-----------7-----|---------------------------7--------------------|
A|------------------------------------------------|------------------------------------------------|
E|---------8-----------------------------------8--|------------------8-----------------------------|

  C6/9                    Dsus4                    C6/9                    Dsus4    (0:38, bar 21)
e|---------------7--------------------------7-----|------------------------------------------------|
B|---------------8--------------8--------8--------|---------8--------8-----------0-----------------|
G|---------0--7-----------------7--------7--------|------------------7-----------------------------|
D|---------7--------------------7-----0--7--------|---------7--------7-----------0-----------------|
A|---------------------------------------10-------|------------------------------------------------|
E|------8--------8--------------------------8-----|---------8--------------------------------------|


[Em section]
  Em(add9)                                         Em(add9)    (0:41, bar 23)
e|------------------------------------------------|------------------0-----------------------------|
B|------0--10-------8--------------0--------0--8--|------8--0--------------------10----------10----|
G|------------0--------0-----0-----------------0--|------0-----------------8-----11----------0-----|
D|------------------9-----------------------------|------9-----------------------------------------|
A|------9-----------9--------------9--------------|------------------------6-----------------------|
E|------0-----------0--------------0--------------|------0--------------------0--7-----------------|

  Em(add9)                B7b13                    G                       C6/9    (0:45, bar 25)
e|------------------------------------------------|------------------------------7-----------7-----|
B|---7-----------------8-----------8--7-----------|---7--------------------------8-----------8-----|
G|---0-----------------0--------------------0-----|---7--------------------------0-----------------|
D|---------7-----------------------7--7-----------|---7--------------------------7-----------------|
A|---------6-----------------------6--------------|---------------------------7--------------------|
E|---------7--0--------------7--------------------|------------------------------------------------|


[C6/9 vamp]
  C6/9                                             C6/9    (0:49, bar 27)
e|------------------------------7-----------------|------------------------------7-----------------|
B|---8--------------8-----------8--8--------8--8--|---------8-----8--------------8-----------8-----|
G|---7--0-----------7--------0--7-----7-----0--7--|---------------0--------------0-----------0-----|
D|---7--7-----------7--------7--------7-----7--7--|------------------7-----------------------7-----|
A|------------------10----------------10----------|------------------------------------------------|
E|------8-----------------------8-----------8-----|---------------8-----------8--------------8-----|

  C6/9                    Em(add9)    (0:54, bar 29)
e|------7-----------------------------------------|
B|------8-----------8-----------0-----0-----10----|
G|------0--------------------0-----------0--------|
D|---------7--------7-----------------------------|
A|------------------------------------9-----------|
E|------8-----------------------------12----0-----|


[Em section]
  Em(add9)                                         Em(add9)    (0:55, bar 30)
e|------------------------------------------------|------------------------------------------------|
B|------7-----------0--10----------------0-----8--|------------8--------10-------------------8-----|
G|------------------0-----------------------0-----|---0--------0-----------------0-----------0-----|
D|------9-----------------------------------------|---------------------------------------7--------|
A|------------------------------------------------|------------6-----------------------------6-----|
E|---------0--------0-----------------------------|------------------------------0-----------------|

  Am7                     Em11                     Em7                     C6/9    (0:59, bar 32)
e|------------------------------------------------|------------------------------------------------|
B|---------8--------7--------------8--------------|---------------8--------------------------8-----|
G|---------------------------------7--------------|---------------7-----------------0--------0-----|
D|------------------7--------------7--------------|------7--------7-----------------------7--------|
A|------------------6--------------7--------------|------------------------------------------------|
E|---------0--------0-----------------------------|---------------8--------------8--------8--------|


[Development: C - G - Em7 - Dsus4 - Am7 - G - Bm7 - B7(b13)]
  C6/9                                             G                       Cmaj7    (1:03, bar 34)
e|---------7-----------------7-----------------7--|------------------------------7-----------------|
B|---------8-----------------8--------8--------8--|------------------------------8--------8--------|
G|---------0-----------------0-----------------0--|------------------------------------------------|
D|---------7-----------------7-----------------7--|------------------------------10----------------|
A|------------------------------------------------|------------------------------------------------|
E|8-----------------------------------------------|------------------------------------------------|

  Em7                     Dsus4                    Am7                     G    (1:07, bar 36)
e|---7-----------10----------7--------------------|---------------7--7--------------7--------7-----|
B|---8-----------8--------8--8-----------8--------|------8--------8--------------8--------8--------|
G|------------------------------------------------|------------------------------------------------|
D|---------------------------------0--------------|------------------7-----------------------------|
A|---7-----------------------------------------0--|------------------7--------------7--------------|
E|---------------------------8-----------------12-|---------------------------------5--------------|

  G                       Bm7                      B7b13                   Em11    (1:11, bar 38)
e|---0--------------------------------------------|---------------0--------------0-----------0-----|
B|---------10-7--0-----------10----0-----10-------|---0--------10-0-----------0--10-------10-------|
G|0--------------0-----------11----------0--------|---------------0--------------0--------11-------|
D|------------0--------------9-----------9--------|------------9-----------------------------------|
A|------------------------------------------------|---------------------------------------7--------|
E|---------------7--------------------------------|------------------------------7-----------------|


[Em, then C / G / Asus2 / Em11 / Dsus4 / Bm7 interplay]
  Em(add9)                                         Cmaj7                   G    (1:15, bar 40)
e|---0-----------------0-----0--------------7-----|---------------7-----------7-----------7--------|
B|0--10----------10----7--10----------------8-----|------8-----8--8-----------8--------8-----------|
G|---0-----------11-------------------------0-----|---------------0--------------------------------|
D|------------------------------------------10----|------------------------------------10-10-0-----|
A|---7--------7-----------7-----------------------|------------------------------------------------|
E|7-----------------------7-----------------------|8--------------------------------------8--------|

  C6/9                    G                        G                       Asus2    (1:19, bar 42)
e|---7--------------7--------7--------------------|7--------0--------------------------------------|
B|---8-----------8--------8--------------8-----8--|------8-----10-7--10-------7--10----10-0--------|
G|------------------------------------------------|------0-----0--0--------------------11-0--------|
D|------7--------------------7--------------------|7-----------9--9--------------9-----9-----------|
A|---7--------------------------------------------|---------------------------------------7--------|
E|------------------------------------------------|------------------------------------7--0--------|

  Em11                    C6/9                     Cmaj7    (1:23, bar 44)
e|------------------------------------------------|------------------------------------------------|
B|---0-----10-------------8--------------8-----8--|0-----------0--------8--------------8-----------|
G|---------------------------------------7-----7--|0-----------7--------------------------7--------|
D|---------------------------------------9-----9--|---------------------9--------------0-----------|
A|---------------------------------------10----10-|------------------------------------------------|
E|---------------------------8--------------------|8-----------------------------------------------|

  Dsus4                   Em(add9)                 Em11                    Asus2    (1:27, bar 46)
e|------------------------------------------------|------------------------------7-----------------|
B|---------------------------7--------10-------10-|------------0--------10-------------8-----------|
G|---------------------------0--------11----------|------------------------------------------------|
D|---------------------------9--------9--------9--|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|---------------------------0--------------------|------------------------------------------------|

  G                       C6/9                     C6/9    (1:31, bar 48)
e|------------------------------------------------|------------------9--------7-----------10-------|
B|---------------8-----------8-----8--------------|8--------8-----------------8--------8--------8--|
G|---------------0-----------0-----0--------------|0-----------0--------------0-----------0--------|
D|---------------7-----------7-----7--------------|7--------7--------------10-------------------10-|
A|---------------------------------7--7-----------|------------------------------------------------|
E|---------------8--------------------8-----------|8--------8--------------------------------------|

  Cmaj7                   G    (1:35, bar 50)
e|7-----------10-------7-----------7--7-----------|
B|---------8--------8--------------8--------------|
G|0-----------------0-----------------7-----------|
D|10-------10-------10-------0--------7-----------|
A|------------------------------------7-----------|
E|8-----------------------------------------------|


[Closing: Em7 - Am7 - Bm7 - Em - Am7 - G - Em - Dsus4 - B7(b13) - Am7 - C6/9 - Am7]
  Em7                     Em(add9)                 Am7                     Bm7    (1:37, bar 51)
e|------------7-----------7--------7--7-----------|------------------------0--0--------------------|
B|8-----------8-----------8--------8--------8-----|---10----------10-------10-0-----------7--------|
G|---------0--------------0--------0--------0-----|0--------------11-------0-----------------------|
D|------------7-----------------------------------|---------------9-----------------------9--------|
A|---------------7--------------------------------|---------0--------------7-----------------------|
E|------------------------------------------------|---------------7-----------------------7--------|

  Bm7                                              Em(add9)                Am7    (1:41, bar 53)
e|---0--------------7-----------------7--------7--|---------7--------------------------------------|
B|7-----------------7-----------------8--------8--|------8--------------8--------8-----------------|
G|------------------------------------------------|------------------------------------------------|
D|------------------------------------7-----------|------------7-----------------7--7--------------|
A|------------------------------------7--------7--|------7--7-----------7--------------------------|
E|7-----------------------------------------------|------------------------------------------------|

  G                       Em7                      G    (1:45, bar 55)
e|---7-----------------7--7-----------7-----------|---------7--7-----------7-----7-----7-----------|
B|---8--------8--------7--8-----------7--------8--|---------8--------------8--------8--------------|
G|------------------------11----------------------|------------------------------------------------|
D|---------------------10-------------------------|------------7-----------7--0--------7-----------|
A|---7--------------------------------------------|---------------7-----------------7--------------|
E|------------------------------------------------|------------------------------------------------|

  Em(add9)                Dsus4                    B7b13                   Bm7    (1:49, bar 57)
e|------7--7--------------------------------------|0--------------------------------7--------------|
B|8--8-----8-----------10-7-----------10----10----|---------10-------10-0-----10----8--------------|
G|------0-----0--------0--------------------------|0-----------------------------------------------|
D|------------------------0-----------9-----9-----|------------------9-----------0--------------7--|
A|7-----------------------------------------------|---------------------------------------7-----7--|
E|------------------------------------------------|------------------------------------------------|

  Am7                     C6/9                     Am7    (1:53, bar 59)
e|------------------------------------------------|------------------------------------------------|
B|---------------------8--------------------8--8--|------------------------------------------------|
G|------0--------7-----0--------------------------|------------------------------------------------|
D|------7--------7--------7--------------------7--|------------------------------------------------|
A|---------------10-------------------------------|------------------------------------------------|
E|------8--------8--------8-----------------------|------------------------------------------------|
```

</details>

### 004

The camera only shows the ceiling, so this one is all sound. All three hear G major, but blind Opus thinks it's a ukulele and Opus with Tabber hears guitar chords on the top three strings.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-004.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">2:39</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-004.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:06</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-004.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 2:39</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-004.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 2:42</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 004</summary>

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20201227_014306.mp4
Source: videos/2026-08-14_004.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 158.73 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: unresolved (tab assumes 0); visual confidence unresolved. Neck obscured, cropped, dark, or not shown
Likely sounding key: G major? (moderate confidence; automatic note-profile estimate)
Provisional classification: keeper candidate
Reason: Long, substantially continuous musical material without a detected explicit restart. Completion/intent remains PROVISIONAL; it needs listening review.
Main loop, chord SHAPES relative to capo assumption: G? -> C? -> G?

IMPORTANT LIMITATIONS
This is a machine-assisted first-draft pitch/harmony sketch, NOT a verified
note-for-note tablature or proof of the original tuning/fingering. All chord
labels/finger positions are provisional (?). Source contains voice/noise;
some detected notes may be sung pitches or harmonics. A key estimate is NOT
a tuning diagnosis. Do not retune to a guessed alternate tuning.
If capo is unresolved, this file assumes fret 0 for its draft positions.
If tuning differs from standard, string/fret placement must be revised.

CHORD CHART / MAIN HARMONIC MATERIAL
Most repeated estimated pattern: G? -> C? -> G?
Common estimated sounding sonorities (time-weighted, NOT a progression): G?, C?, Cm?, Cmaj7?, Em?, E?, Esus4?, Fm?

Approximate estimated changes in the first 90 seconds:
     1.5–  15.0 s: G? shape / G? sounding
    15.0–  22.5 s: C? shape / C? sounding
    22.5–  28.5 s: G? shape / G? sounding
    28.5–  36.0 s: Cmaj7? shape / Cmaj7? sounding
    36.0–  42.8 s: G? shape / G? sounding
    43.5–  47.2 s: C? shape / C? sounding
    47.2–  55.5 s: G? shape / G? sounding
    55.5–  60.0 s: C? shape / C? sounding
    60.0–  61.5 s: Em? shape / Em? sounding
    61.5–  63.0 s: C? shape / C? sounding
    64.5–  67.5 s: G? shape / G? sounding
    67.5–  72.0 s: C? shape / C? sounding
    72.0–  76.5 s: G? shape / G? sounding
    76.5–  85.5 s: Cm? shape / Cm? sounding
    85.5–  90.8 s: C? shape / C? sounding

SOURCE-PITCH ASCII SKETCHES — ALL STRING ASSIGNMENTS UNCERTAIN (?)
These show actual model-detected onset pitches mapped to playable standard-
tuning positions; not a generic invented fingerpicking pattern. Each cell
is 0.5 s; simultaneous/repeated fast notes are reduced. Dashes are not proof
of silence. Positions favor low frets and may differ from the hand in video.
Fret numbers are relative to the capo assumption. Rhythm/voice separation
and fast ornaments are unresolved; use these only as play-along prompts.

Excerpt 10.0–26.0 s (?)
e |-3-3-3-3-3-3-3-3-3---3-3-3-3---3-3-3-3-3-3-3-----3-3-3-3-3-3-3-3|
B |-3-3-3---8---3-3-3-3-1-8-1-1---8-1---1---1-------1-3---8---3-3-8|
G |---------7--12-----5-----------------------------------7--------|
D |----------------------------------------------------------------|
A |----------------------------------------------------------------|
E |----------------------------------------------------------------|

Excerpt 71.4–87.4 s (?)
e |-3---3---3-3-3-3-----------3---3---3---------3-----3---------3--|
B |-1-3-----3---3-----3-1-1---1-1-1-1-1---1-4---4-4---4---4---1----|
G |-------------7---------------------------8----------------------|
D |----------------------------------------------------------------|
A |----------------------------------------------------------------|
E |----------------------------------------------------------------|

TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)
Do not rely on these as accurate lyrics or authorship evidence.

KEY/TUNING EVIDENCE
Profile correlations (not probabilities): G major r=0.862, C major r=0.650, C minor r=0.550
Strong lower detected pitches: 
Low-note support is not enough to identify every open string. Tuning left
unresolved instead of falsely declaring standard, DADGAD, or an open tuning.

CONDITIONAL CHORD GRIPS — STANDARD-TUNING ARRANGEMENT OPTIONS (?)
Low E to high e; all numbers relative to the stated capo assumption.
These are suggested playable grips, NOT observed source fingering.
G? : 3 2 0 0 0 3
C? : x 3 2 0 1 0
Cm? : x 3 5 5 4 3
Cmaj7? : x 3 5 4 5 3
If the actual tuning differs, these grips are not the original arrangement.
```

</details>

<details><summary>Blind Opus 5.5's tab for 004</summary>

```text
Song 04 - ukulele fingerpicking piece in G (G / Cmaj7 vamp with a Cm6-E7 bridge), title unknown
===============================================================================================
Source: song04.mp4  (the video shows only the ceiling - this transcription is from the audio alone)
Instrument: nylon   (the recording is a ukulele - see 'Instrument' notes below; synthesized with a nylon-string tone)
Tuning: Standard guitar E A D G B E  [MIDI 40 45 50 55 59 64]
Capo: 5  (all fret numbers are relative to the capo; with capo 5 the G-B-e strings sound C4-E4-A4 = the ukulele's C-E-A strings)
Key: G major (I = G, IV = C/Cmaj7, borrowed iv = Cm6, V/vi = E7); piece ends on Cmaj7
Time: 12/8 feel (4 dotted-quarter beats x 3 triplet-8ths); bars restart at every chord change, so a few
      bars are shorter/longer where the player holds a chord for fewer/more beats (free performance)
Tempo: 113   (quarter = dotted-quarter pulse of 3 columns; the picking pulse is a steady ~5.6 notes/s,
      each tab line is anchored to the video time so small tempo drifts are absorbed)
Grid: 12   (one tab column = one 8th-note triplet = one picked note of the continuous pattern)
Pitch offset: +9 cents (instrument's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Confidence: overall MEDIUM-LOW. Instrument = re-entrant (high-G) ukulele: high. Tuning (uke GCEA, slightly sharp): high. Capo: n/a on uke / capo 5 is our guitar mapping. Key: high. Chords: medium-high (vamp high, bridge chord names medium). Note-level picking pattern: low-medium. Rhythm/bar lines: low (free tempo).

Instrument notes:
  * No note below C4 (262 Hz) sounds anywhere in the 158 s recording; the lowest note of every chord
    is C4/D4/Eb4/E4 and G4 is re-struck constantly.  The G chord is voiced D4-G4-B4 (uke 0232), the C
    chord C4-G4-B4 (uke 0032) and the bridge has Eb4-G4-A4 (uke 0330), D4-E4-G#4-B4 (uke E7 1202):
    exactly the shapes of a standard re-entrant G4-C4-E4-A4 ukulele; a guitar would sound bass notes.
  * This GUITAR tab reproduces the same pitches: capo 5 makes the G, B and high-e strings sound C4, E4
    and A4, so ukulele frets on the C-E-A strings are the SAME frets on the guitar's G-B-e strings.
    The ukulele's re-entrant G4 string has no equivalent: its G4 is played on the B string, fret 3.
    The two lowest strings are never used, the D string only for three bridge notes (C4/D4 at
    1:28-1:32).  A ukulele chord sheet is given at the end.
  * The video only shows the ceiling, so the actual fingering is inferred from pitches, not seen.

Chord progression (time in video -> chord; SOUNDING chord names, uke shape in brackets)
  0:01.99 G  |  0:14.97 Cmaj7  |  0:22.79 G  |  0:28.58 Cmaj7  |  0:35.32 C  |  0:37.50 G
  0:42.81 C6  |  0:50.54 G  |  0:55.33 C6  |  1:01.77 C  |  1:03.84 G  |  1:07.31 Cmaj7
  1:12.23 G  |  1:16.81 Cmaj7  |  1:21.51 Cm6  |  1:25.89 Am  |  1:26.30 A7sus4  |  1:28.56 Cmaj7
  1:31.02 E7  |  1:33.30 Cm6  |  1:35.00 Am  |  1:35.53 A7sus4  |  1:37.80 Cmaj7  |  1:42.49 Cm6
  1:46.60 G  |  1:51.42 G  |  1:55.56 Cmaj7  |  2:01.55 G  |  2:05.53 Cmaj7  |  2:09.99 G
  2:16.55 Cmaj7  |  2:23.82 G  |  2:29.15 Cmaj7
  Form (bars of 12/8): Intro G 6 | A: G ~3 | Cmaj7 ~4 | G ~3 | C6 ~3 | G ~2 | C6 ~3-4 | G ~2 | Cmaj7 2 |
        G 2 | Cmaj7 2 | Bridge: Cm6 2 | A7sus4 1 | Cmaj7 1 | E7 1 | Cm6 (Am) 1 | A7sus4 1 | Cmaj7 2 |
        Cm6 2 | G melody 2 + fermata | A': G 2 | Cmaj7 3 | G 2 | Cmaj7 2 | G 3 | Cmaj7 3 | G 2-3 | Cmaj7 to end

Chord shapes used (guitar, capo 5, low E -> high e, x = not played)   [ukulele G C E A shape]
  G: x x x 2 3 2 [0232]   Cmaj7: x x x 0 3 2 [0032]   C6: x x x 0 0 0 [0000]   C: x x x 0 0 3 [0003]   Cm6: x x x 3 3 0 [0330]   A7sus4: x x x 4 5 5 [0455]   E7: x x x 2 0 2 [1202]   Am: x x x 0 0 0 [2000]

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret relative to the capo, x = muted/dead string hit, h/p = hammer-on/pull-off,
  / \ = slide.  "@ m:ss.ss" = time in the video where the following tab line starts.
  Chord names above the staff mark the harmony (repeated at the start of every line).
  Fingerpicked: let all notes ring (campanella style); the steady G4 (B string, 3rd fret) is the
  ukulele's re-entrant G string drone.

[Intro (G)]
@ 0:01.97
  G
e|----------------2-----2-|2-----2-2-2-2-----2-2-2-|
B|------------3-------3---|--3---3-3-3---3-3---3-3-|
G|2-----------------------|----2-2---------2-------|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:06.59
  G
e|2-------2---------------|--------2---2-2-----2-2-|
B|--3-3-------3-----------|------3-3-3-3---3-3-3-3-|
G|----2-------------------|--2---------------2-2-2-|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:11.03
  G
e|2-----2-2-2-----2---2-2-|----2---2-2-----2-----2-|
B|3-3-3-3-----3-3---3---3-|3-3-3-3-3---3-----3-----|
G|----2-2-2---2-2-2-2-2---|--2-2---2-----2-2---2---|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

[Part A - G / Cmaj7 (C6) vamp]
@ 0:15.03
  Cmaj7
e|----2---2-2-------2-----|--2-2---------2---2-2-2-|
B|3-----3-----3---3---3---|3-----3---3---3-----3---|
G|0-0-----------0-0---0-0-|--0---0-----0-0-----0---|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:19.20
  Cmaj7
e|----------2-----2-----2-|----2---------|
B|3-----3-----3-----3-----|3-----3-----3-|
G|--0---0-----0-0---------|--------0-0---|
D|------------------------|--------------|
A|------------------------|--------------|
E|------------------------|--------------|
  (bar lengths in this line, in triplet 8ths: 12 + 7)

@ 0:22.82
  G
e|--2---2-------2---2---2-|----2-2---2-2-------2-2-|
B|3---3-----3-3-3-----3---|3-3-3-3---3-3-3---3-3---|
G|2-2-2-------2-2---------|--2-2-2---------2-2-2---|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:26.96
  G                    Cmaj7
e|--2-2-2-2---2-----2-|2---2-------2-2-------2-|
B|3---3---3-----3---3-|3-3---3---3-----3---3---|
G|2---------2-----2---|0-0---0-0-0-----0-0-0---|
D|--------------------|------------------------|
A|--------------------|------------------------|
E|--------------------|------------------------|
  (bar lengths in this line, in triplet 8ths: 10 + 12)

@ 0:31.00
  Cmaj7
e|2-------2-2-2-2---2-----|2-----2---2-2-----------|
B|--3---3---3---3-3-3-3---|3-3-3---3---------------|
G|----0-0-0-0-0-0-0-0-0---|0-0-0---0---0-----------|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:35.33
  C
e|--2---3-----5-----------|
B|3-----------------------|
G|4-----------------------|
D|------------------------|
A|------------------------|
E|------------------------|

@ 0:37.51
  G
e|----2-5-------2-5-------|2-------2-------2-------|
B|--3-3---3-3-3-3---3---3-|--3-3-3-3-3---3-----3---|
G|2---------2-2-2-2---2-2-|2-2-2-2-2-2-2-2-2-2-2-2-|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:41.55
  G                C6
e|----2-5---5---2-|----0-2-------0-2-----2-|
B|--3-----3-7-3-3-|0-0---------3---3---3-5-|
G|--2-2-----7-2---|--------0-0-0-----0-0---|
D|----------------|------------------------|
A|----------------|------------------------|
E|----------------|------------------------|
  (bar lengths in this line, in triplet 8ths: 8 + 12)

@ 0:44.98
  C6
e|--2-------2---0-2---0---|----2---0-2-------------|
B|3---3---3---3-----3-----|3-----3-----3-----------|
G|0-0-0---0-0-0---0-0-0---|0-----------------------|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:49.29
  C6               G
e|------5---2-----|--5-2-5-----5-------2-5-|
B|------3-------3-|3-3---3---3-7-3-3-3-3-3-|
G|----------------|2-------2-2-7---2-2-2-2-|
D|----------------|------------------------|
A|----------------|------------------------|
E|----------------|------------------------|
  (bar lengths in this line, in triplet 8ths: 8 + 12)

@ 0:52.77
  G
e|----2-----2-5---------2-|----2---|
B|3-3-3---3-----3-3---3-3-|--3-3---|
G|2-2-2-2-2-2---2-2-2-2-2-|2-------|
D|------------------------|--------|
A|------------------------|--------|
E|------------------------|--------|
  (bar lengths in this line, in triplet 8ths: 12 + 4)

@ 0:55.34
  C6
e|--0-2-------0-------0---|0-2-0---------0-2---0-2-|
B|0-----3---3-3-3---3---3-|------7---7-------3-----|
G|0-0---0-0-0-0-0-0-0-0-0-|0---0---7---7-----0-0-0-|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 0:59.35
  C6                         C
e|--0-2-----2---2---2-------|3-----3---------------|
B|3-----3-----3-3-------3---|3-----3-3---0-3-------|
G|0-------------------------|--------0-------------|
D|--------------------------|----------------------|
A|--------------------------|----------------------|
E|--------------------------|----------------------|
  (bar lengths in this line, in triplet 8ths: 13 + 11)

@ 1:03.85
  G
e|------------------2-----|--2-----2-----2-|
B|3---3---------3-3-3-----|----3---3-----3-|
G|----2-----2---2---2---2-|2---2---2-----2-|
D|------------------------|----------------|
A|------------------------|----------------|
E|------------------------|----------------|
  (bar lengths in this line, in triplet 8ths: 12 + 8)

@ 1:07.26
  Cmaj7
e|----------------2-------|
B|0---3-3---------3-----3-|
G|----0-0---------0-----0-|
D|------------------------|
A|------------------------|
E|------------------------|

@ 1:09.55
  Cmaj7
e|----2-----2-----2-------------|
B|------------------3-----3-----|
G|0---0---0---0-----0-0-0-0-0---|
D|------------------------------|
A|------------------------------|
E|------------------------------|
  (bar lengths in this line, in triplet 8ths: 15)

@ 1:12.25
  G
e|--2---------2-----5-----|2-----------------2-----|
B|3-3-----3---3-3-----3-3-|3-----------------3-----|
G|2-2-----2---2-2-----2---|2-----------------2-----|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 1:16.83
  Cmaj7
e|------------------------|----------2---2-----2-------|
B|------------3-----3-----|--3-----------3-----3-------|
G|0-0-----0---0---0-0-----|--0---0-0-0---0-----0-------|
D|------------------------|----------------------------|
A|------------------------|----------------------------|
E|------------------------|----------------------------|
  (bar lengths in this line, in triplet 8ths: 12 + 14)

[Bridge - Cm6, A7sus4, E7, Am]
@ 1:21.48
  Cm6
e|0-------------0---------|----0-----------------0-|
B|3-------------3-------3-|----3-------------------|
G|3-3-----------3-----3-3-|----3-----------3-3-----|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 1:25.91
  Am  A7sus4
e|------5-----------0---------|
B|0---5-3-----------3---3-3---|
G|0-0-4-------------4-----4---|
D|----------------------------|
A|----------------------------|
E|----------------------------|
  (bar lengths in this line, in triplet 8ths: 14)

@ 1:28.54
  Cmaj7
e|----2-------2---2-----------|
B|--3-3-------3---3-----3-----|
G|0-4-0-------0-0-0-----0-0-0-|
D|--5-------------------------|
A|----------------------------|
E|----------------------------|
  (bar lengths in this line, in triplet 8ths: 14)

@ 1:31.02
  E7                       Cm6
e|--------2---2-----------|0-0---------------|
B|4-4-----0---4-----4-----|--3---------3-----|
G|4-2---------4-----4-----|3-3-----3---3-----|
D|7-----------------7-----|------------------|
A|------------------------|------------------|
E|------------------------|------------------|
  (bar lengths in this line, in triplet 8ths: 12 + 9)

@ 1:35.02
  Am    A7sus4
e|0-------5---------------------|
B|0-----3-3-----3---3---3-------|
G|0-----4-4---------4-----4-----|
D|------------------------------|
A|------------------------------|
E|------------------------------|
  (bar lengths in this line, in triplet 8ths: 15)

@ 1:37.78
  Cmaj7
e|--------------2---------|----2-----------------------|
B|3-3-----3---3-------3-3-|--3-3-----3---3-----3---3---|
G|0-0-----0---0-----0-0-0-|--0-0---------0-------0-0---|
D|------------------------|----------------------------|
A|------------------------|----------------------------|
E|------------------------|----------------------------|
  (bar lengths in this line, in triplet 8ths: 12 + 14)

@ 1:42.45
  Cm6
e|----0-------0-----0-----|--------------------|
B|------------3---3-------|--3---3-------3-----|
G|--0-3-----------3-----3-|3-3---3-------------|
D|------------------------|--------------------|
A|------------------------|--------------------|
E|------------------------|--------------------|
  (bar lengths in this line, in triplet 8ths: 12 + 10)

@ 1:46.62
  G
e|--0---0-----2-2-------|
B|3-------3-------------|
G|----------------------|
D|----------------------|
A|----------------------|
E|----------------------|
  (bar lengths in this line, in triplet 8ths: 11)

[Part A' - G / Cmaj7 vamp, ends on Cmaj7]
(fermata: the music stops for about 2.7 s before this line)
@ 1:51.44
  G
e|2---------2-2---------2-|2---------------2-2---2-|
B|----------------3-3-----|----------3-3-----3---3-|
G|------------------2---2-|------------2---2-2-----|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 1:55.58
  Cmaj7
e|----------2-----------2-|----------------2-------|
B|------3---------3-------|------------------3-----|
G|0---------0-------0-----|----------------------0-|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 1:59.89
  Cmaj7              G
e|------------------|----------2-2---2-----2-|
B|------------------|------3---------3-------|
G|------------------|2-----------------2-----|
D|------------------|------------------------|
A|------------------|------------------------|
E|------------------|------------------------|
  (bar lengths in this line, in triplet 8ths: 9 + 12)

@ 2:03.62
  G                    Cmaj7
e|2-------------2-----|2-------2---2-2---------|
B|--------3-3-----3---|3-----------------3-----|
G|----------2---2-2---|0-0-----0---0-0-----0---|
D|--------------------|------------------------|
A|--------------------|------------------------|
E|--------------------|------------------------|
  (bar lengths in this line, in triplet 8ths: 10 + 12)

@ 2:07.63
  Cmaj7
e|2-2-----2---2-------2-----|
B|--------------3---------3-|
G|0-0---------------0-0-----|
D|--------------------------|
A|--------------------------|
E|--------------------------|
  (bar lengths in this line, in triplet 8ths: 13)

@ 2:10.00
  G
e|--2---2-2-----2---2---2-|2-2-2---2-2-2-2-2---2---|
B|3---3-3---3-----3-3-3-3-|3---3-3-3---------3---3-|
G|2-2-2-------2-2-------2-|2-2-2-2-2-2-------------|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 2:14.52
  G
e|--2---2---2---2---------|
B|----3---3---3-------3---|
G|2-2-2-------2-----------|
D|------------------------|
A|------------------------|
E|------------------------|

@ 2:16.57
  Cmaj7
e|--2-2-2-------2---2-----|2-2---2-------------2---|
B|--------3-3-3---3---3---|3-3-3-3---3-3-3---3---3-|
G|0---------0-0-0-0-0-0---|0-----------0-0---0-0-0-|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 2:20.86
  Cmaj7
e|------2-----2---2-2-2-2-|2-----2---|
B|--------3-----3-----3---|--3-----3-|
G|0---0-0-0-0-0-0-0-------|----0-0-0-|
D|------------------------|----------|
A|------------------------|----------|
E|------------------------|----------|
  (bar lengths in this line, in triplet 8ths: 12 + 5)

@ 2:23.84
  G
e|--2---2-----2-2-2-----2-|2-2-2-2-------2-2-2-2---|
B|3---3---3---3-3-3---3---|----3-3-3---3---3-3---3-|
G|2-2---2---2-2-----------|----------2-------------|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 2:27.89
  G              Cmaj7
e|2---------2---|----2-----2-2-2-------2-|
B|--3-----3---3-|--3---3-------3-3-3-3---|
G|--2-2---2-----|0---0-0-----------0-0---|
D|--------------|------------------------|
A|--------------|------------------------|
E|--------------|------------------------|
  (bar lengths in this line, in triplet 8ths: 7 + 12)

@ 2:31.41
  Cmaj7
e|--2---2-2-----2---2-2---|--2---2-----------------|
B|3---3-----3-----3-----3-|----3---3---------------|
G|----0-------0---0-----0-|0-0-0---0---------------|
D|------------------------|------------------------|
A|------------------------|------------------------|
E|------------------------|------------------------|

@ 2:35.89
  Cmaj7
e|------------|
B|------------|
G|0-----------|
D|------------|
A|------------|
E|------------|
  (bar lengths in this line, in triplet 8ths: 6)

Appendix - ukulele chord shapes (standard re-entrant tuning G4 C4 E4 A4; NOT parsed by the synth)
  string:  G C E A
  G        0 2 3 2
  Cmaj7    0 0 3 2
  C6       0 0 0 0
  C        0 0 0 3
  Cm6      0 3 3 0
  A7sus4   0 4 5 5
  E7       1 2 0 2
  Am       2 0 0 0
  On the ukulele the tab above maps 1:1: guitar G/B/e strings = ukulele C/E/A strings (same
  frets); every G4 written on the guitar B string at fret 3 can be taken on the open
  ukulele G string instead (that is the re-entrant drone heard throughout).
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 004</summary>

```text
====================================================================================================
 song04 - G / Cmaj7 fingerpicked triads on the top three strings, with a Cm6 bridge (audio only)
====================================================================================================
 Source        : song04.mp4 (2:39). The camera only shows the ceiling, so everything below comes
                 from the audio. No vocals (whisper's 'lyrics' are hallucinations). The phone seems
                 to rest on/near the guitar: constant resonances at ~159 Hz and ~175 Hz (not notes).
 Tuning        : Standard E A D G B E (assumed; only the G, B and e strings are played, so the lower
                 strings cannot be checked). Reference pitch ~+12 cents.
 Capo          : None, playing at frets 5-10 on the G/B/e strings (sounding range C4-E5).
                 Alternative: capo 7 with C-shape (x x x 0 1 0) and Fmaj7-shape fragments gives the
                 same pitches (Tabber's guess, 0.34). I prefer no capo because the Cmaj7 voicing is
                 exactly C4-G4-B4 (no E4), i.e. one finger moving 7 -> 5 on the G string; with capo
                 7 that note would need the D string.
 Key           : G major (with a borrowed C minor iv in the bridge)
 Tempo / feel  : 4/4, q = ~108 but loose/rubato; arpeggiated 8ths/16ths on three strings
 Progression   : Verse: | G | G | G | Cmaj7 | Cmaj7 | Cmaj7 |  (G = x x x 7 8 7, Cmaj7 = x x x 5 8
                 7)
                 Bridge: | Cm6 | Cm6 | Cmaj7 | Cmaj7  E7 | Cm6 | Am7  G | Cmaj7 | Cmaj7 | Cm6 | Cm6
                 | Am7  G | Cmaj7 |  then the verse loop returns and the take ends on Cmaj7.
 Structure     : Verse loop bars 1-37 (G/Cmaj7 blocks of ~3 bars, one D passing chord at bar 17),
                 bridge bars 38-49, verse loop bars 50-72.
 Confidence    : Key/chords HIGH in the verses, MEDIUM in the bridge (notes are sparse there).
                 Tuning MEDIUM (assumed standard). Capo/position LOW-MEDIUM (audio only; capo 7
                 equally possible). Rhythm MEDIUM-LOW (loose timing quantised to 16ths).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   G            x x x 7 8 7              D G B
   Cmaj7        x x x 5 8 7              C G B
   Cm6          x x x 8 8 5 / x x x 5 4 5 Eb G A (+C)
   Am7          x x x 5 8 5              C G A (+E)
   E7           x x x 9 9 7              E G# B (+D)
   Em7          x x x 9 8 10             E G D
----------------------------------------------------------------------------------------------------
 Only the three highest strings are used. 16 slots per bar (16th notes); timing is approximate.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: tuning standard OK; key 'G major' right; capo 7 at 0.34 confidence (a coin-
                 flip with capo 3 at 0.33) - I keep the same pitches but write them without capo.
                 Its chord chart (C / F5 / Fmaj7 / G# / Ddim...) mixes capo-relative shapes with
                 resonance artefacts (~159-179 Hz hum read as D#3/E3/F3) and misses the bridge's Cm6
                 colour. I removed the resonance notes and relabelled the harmony (G, Cmaj7, Cm6,
                 Am7, E7).
====================================================================================================


[Verse A: G <-> Cmaj7 (top-three-string arpeggios)]
                          G                        G    (0:00, bar 1)
e|------------------------------------------------|------------------------------7-----------7--7--|
B|---------------------------------------8--------|---------------------8--------------8-----------|
G|------------------------------------------------|7-----------------------------------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                G    (0:04, bar 3)
e|------------7-----7-----------------7-----------|7-----------------7-----------------------------|
B|---8--------8--8-----------8-----------8--------|------8-----------------8-----------------------|
G|------7-----7-----------------7-----------------|---------7--------------------------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                G    (0:08, bar 5)
e|---------------7--------7-----------7--7--------|7--------7-----7-----------7-----7--------------|
B|------------8--------8--------8-----------8-----|---8--------8--------8--------8--------8--------|
G|------7-----------------------------7-----------|------7-----------------7--------7--------7-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                       Cmaj7                    Cmaj7    (0:13, bar 7)
e|7-----7--7-----------7-----------7--------7-----|---7-----------------7--------7-----7-----------|
B|8-----------8-----------8-----------8--------8--|---------8--------8-----8--------8--------8-----|
G|------7--------7-----------7--------5--5--------|------------5--------------5--------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cmaj7    (0:17, bar 9)
e|------------7-----7-----7--------------------7--|7--------------7--------------7-----------7-----|
B|---8--------8--------8--------8-----------8-----|------8-----------8--------------8-----------8--|
G|------5-----5--------5-----------5--------------|---------5--------------------------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                G    (0:22, bar 11)
e|------------------7--------7--------7--------7--|------7-----------7--7-----7--------------7-----|
B|---------8--------8--8--------8--8--------------|8--------8--------8--------8-----8--------8--8--|
G|---5--------7--------7-----------7--------------|---------------7--7--------------------7-----7--|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                Cmaj7    (0:26, bar 13)
e|7-----7--------7-----7-----------7--------7-----|---------7--------7--------7--7-----------------|
B|---8--------8-----8--------8--------8--------8--|------8-----8--------8--------------8--------8--|
G|---7--------7-----------------7--------7-----5--|5--------------5-----5--------------5--5-----5--|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cmaj7    (0:30, bar 15)
e|7--------------7-----7-----------7-----------7--|------7-----------7--------7-----7--------------|
B|------------8-----8--------8--------8--------8--|8--------8-----------8--------------------------|
G|------------5--------------5-----------5--------|------5-----5-----------------------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                   D                        G    (0:34, bar 17)
e|------------7-----8--------------10-------------|------------------7--10-------------7-----------|
B|------8--5--------------------------------------|------------8-----------8--------8--------8-----|
G|------------------5-----------------------------|---------7-----------------7--------7--------7--|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                G    (0:39, bar 19)
e|10-7--------------7-----------10----7--10-------|------7--10----7--10----7--10-0-----7-----5-----|
B|8--------8-----8--------8--------8-----8--------|---8--------8--------8--------------------------|
G|7-----7-----7-----7--------7-----------7-----7--|---------------------7-----9-----------5--5-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cmaj7    (0:43, bar 21)
e|---5--7--------------5--7--------7--------7-----|---7-----5--7--------5--------------7-----5-----|
B|8--------8--------8--------8--------8--------8--|------8--------8-----------8-----------8--------|
G|------------5-----5--------5--5-----------------|5-----5--------5-----------5--------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                       Cmaj7                    G    (0:47, bar 23)
e|7-----------------------------------------10----|7--------------10-7--10----------7--10----------|
B|---8--------------------------------------8-----|------8-----------------8--------8-----8--------|
G|------------------------------------------------|---------7-----------------7--------------7-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                G                       Cmaj7    (0:52, bar 25)
e|---7--10----------7--10----------10-------------|7-----------7-----0-----5--7-----------------5--|
B|8-----8--8-----8--------8-----------8--------8--|------8-----------------------8-----------8-----|
G|---7-----7-----7-----7-----------------7-----7--|---7--------------5-----------5-----5-----5-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                   Cm6                      Cmaj7    (0:56, bar 27)
e|7-----------5--------5--7-----5--7--------7--5--|---7--5-----7-----5-----7-----------7-----------|
B|---8-----8--------8-----------------8--------8--|------8--------8-----------8--------------8-----|
G|---5--5-----------5-----------5-----------------|------5--------------------------5--------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            G    (1:00, bar 29)
e|7-----7-----------8-----------8-----------0-----|------------------------------------------7-----|
B|------------8-----8-----------8-----8-----8-----|------------8-----8-----------------8-----8-----|
G|---------------------------------5--5-----------|------------7-----7-----------7-----7-----7-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                Cmaj7    (1:05, bar 31)
e|------7-----------7-----------7--0-----------5--|---------------7-----------------------7--------|
B|------------8-----8-----------8-----------8-----|------------------8-----------8-----------------|
G|------7-----------7-----------7-----5-----5-----|------------------5--------5-----5--------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            G    (1:10, bar 33)
e|------7-----------7--------------9-----------7--|------------------10----------10-10-------------|
B|------------------8--------8--------------8--8--|------------------8--------------8-----8-----8--|
G|------------------5--------5--5--5-----7-----7--|------------------7--------7-----------7-----7--|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                Cmaj7    (1:14, bar 35)
e|------------------------------7-----------5-----|------------------------------------------------|
B|---8-----------------------8-----------------8--|---------8-----8-----------8-----------8--------|
G|---7-----------------------7-----------5-----5--|---------------5--------5--------------5--------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7    (1:19, bar 37)
e|---------7-----7-----------7-----------5--------|
B|---------8-----8-----------8-----------8--------|
G|---5-----------5--------5--------------8--------|
D|------------------------------------------------|
A|------------------------------------------------|
E|------------------------------------------------|


[Bridge: Cm6 - Cmaj7 - E7 - Cm6 - Am7 G - Cmaj7 - Cm6 - Am7 G]
  Cm6                                              Cm6    (1:21, bar 38)
e|---------------5--------------------------5-----|---------------------------------5-----0--------|
B|---------------8-----------8-----------8--------|------------------------------------------------|
G|---------------8-----------8-----------8--------|------------------8-----------------5-----5-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cmaj7    (1:26, bar 40)
e|10-10-------------------0--5-----------0--------|---5--7--------------7-----7-----------7--------|
B|10-8--------------------8--------------8--------|---8--8--------------8-----8-----------8--------|
G|9-----------------------------------------------|5-----5-----------5--------5-----------5--------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                   E7                       Cm6    (1:30, bar 42)
e|---0--7-----------7-----7--------------0--------|---5-----------------------------------5--------|
B|---9-----------------------9-----------9--------|8-----8-----------8--------8-----------5--------|
G|5--7-----------------------9-----------7--9-----|---8--------------8--------8-----------5--------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Am7                     G                        Cmaj7    (1:35, bar 44)
e|0-----10----------10-------0-----------0--------|---------------------------7--------------7-----|
B|8-----8-----------8--------8-----8--------------|8-----8-----------8-----8-----------8-----8-----|
G|------9-----------------------------------------|5-----5-----------5-----5--------5--------5-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cm6    (1:40, bar 46)
e|---7--------------7-----------------------------|---5-----5--------------5-----------------------|
B|8-----8-----------8--------8--------------8-----|------------------------8--------8--------------|
G|5-----5-----------5--------5--------------5-----|---5-----8--------------8--------8--------------|
D|------------------------------------------------|---------7--------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cm6                                              Am7                     G    (1:44, bar 48)
e|------------------------------------------------|5--------5-----------7--5-----------------------|
B|------8-----8-----------------8-----------8-----|------------8-----------------------------------|
G|8-----------8-----------------------------------|------------------------------------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|


[Verse A again: G <-> Cmaj7, ends on Cmaj7]
  Cmaj7                                            G    (1:49, bar 50)
e|------------------------------------------------|7-----------------7-----------------------7-----|
B|------------------------------------------------|------------------------------8-----------------|
G|------------5-----------------------------------|------7-----------------------------7-----7-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                Cmaj7    (1:53, bar 52)
e|------------------------------7-----------7-----|------------------7-----------------------7-----|
B|------------------8-----------------8-----------|---------8--------------------8-----------------|
G|---------------------7--------7--------------5--|------------------------------------5-----------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                   G                        Cmaj7    (1:57, bar 54)
e|------------------------------7-----------------|------------------------------------------------|
B|------------------8--------------8--------------|---------------------------------------------8--|
G|------------------------------------------5-----|---------------------------------7--------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                G    (2:02, bar 56)
e|------7-----------------------7-----------------|---------------7-----------7-----------------7--|
B|------------------8-----------------------------|---8-----8-----------8--------------------------|
G|---------------------7--------------------------|---------7--------7-----------5--5--------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cmaj7    (2:06, bar 58)
e|---7-----7--------------------7--------------7--|------7--------------7-----------------7--------|
B|------------------8-----------------------------|---------8--------------------8--------------8--|
G|---------------------5-----------5--------------|------------------5--------------7-----7-----7--|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                G    (2:10, bar 60)
e|7-----7-----------7-----7-----------7-----7-----|------7--7-----------7--------7--------7-----7--|
B|---------8-----------8--------8--------8--------|8--------8-----8--------8--------8--------8-----|
G|---------------7-----------------7--------7-----|---7-----7--------------------------7-----7-----|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                Cmaj7    (2:15, bar 62)
e|---------------7--------------------7-----------|------7--7--------7-----------7-----7-----7-----|
B|---8--------8--------------8--------------------|8-----8--------8--------8--------8-----8--------|
G|------------7--------------------5--------------|---5-----------5-----------5--------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cmaj7    (2:19, bar 64)
e|---------7--------------7--------------------7--|------------7-----7-----------7-----7-----------|
B|---8--------8--------8--------8-----------8-----|---8-----------8-----------8-----------8--------|
G|------5-----5-----------------5--------------5--|---------5-----------------------------------5--|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                   G                        G    (2:23, bar 66)
e|7-----------7-----7--------7-----7-----7--------|------7--------7--------7-----7--------7--------|
B|---8-----------8-----8--------8-----8--------8--|---8--------8-----8--------8--------8--------8--|
G|---5--7-----7-----------7-----------7-----------|---------------------7--------------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  G                                                Cmaj7    (2:27, bar 68)
e|7-----------------------7--------------7--------|7-----7-----7-----------7-----------7-----7-----|
B|------8-----------8--------8--------8--------8--|------------8-----8-----8-----8--------8--------|
G|------7--7--------------------5--------------5--|------------------5-----5-----------------------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7                                            Cmaj7    (2:32, bar 70)
e|------------7-----7-----7-----------7-----------|7-----------------------------------------------|
B|---8-----------8-----------8--------------8-----|------------------------------------------------|
G|------5--------------------------5--------------|------------------------------------5-----------|
D|------------------------------------------------|------------------------------------------------|
A|------------------------------------------------|------------------------------------------------|
E|------------------------------------------------|------------------------------------------------|

  Cmaj7    (2:36, bar 72)
e|------------------------------------------------|
B|------------------------------------------------|
G|------------------------------------------------|
D|------------------------------------------------|
A|------------------------------------------------|
E|------------------------------------------------|
```

</details>

### 005

All three agree on standard tuning, no capo and G major. Grok Bot and blind Opus found the same four-chord loop, and Opus with Tabber charted it differently.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-005.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">3:27</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-005.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its main loop played back at about my tempo, 0:32</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-005.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 3:29</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-005.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 3:31</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 005</summary>

```text
UNIDENTIFIED (POSSIBLY ORIGINAL) — FIRST-DRAFT GUITAR REDUCTION
===========================================================
Song identification: Unidentified (possibly original); no verified title.
Identification confidence: low. Discussion about changing the song suggests
songwriting, but does not prove authorship. Approximate lyric clue:
"it makes me oh so thirsty" (automatic recognition; wording uncertain).
Source filename: 2026-08-14_005.mp4
Album date label: 2026-08-14 (album metadata; not independently verified
as the original recording date).
Duration: 207.28 seconds / 3:27.28
Instrument: six-string steel-string acoustic guitar, with a separate singer.
Tuning, low to high: E A D G B E — WORKING ASSUMPTION, moderate confidence.
Capo: NONE visible / fret 0 — high confidence across ten inspected frames.
Likely key: G major — moderate confidence; D-centered modal reading is
not completely excluded. Do not confuse key with tuning.

STATUS / HOW TO USE THIS TAB
---------------------------
This is a playable, simplified accompaniment draft, NOT a note-for-note
transcription or a confirmed record of Aaron's exact fingerings.
Bass changes and the four-chord loop are more reliable than extensions,
string assignment, and the picking pattern. All proposed voicings and the
picking order below are marked '?' because those details need play-along
verification. Singing, outdoor noise, and overlapping harmonics contaminate
automatic guitar-note extraction. Do not treat vocal pitches as guitar lead.

This video is NOT one uninterrupted finished song: there is spoken discussion
around 83–108 s and later discussion about changing/lengthening the song.
It was transcribed anyway because the latest instruction specifically
requested this clip. Guitar continues under portions of the conversation.

All frets below are relative to the capo (there is no capo).
x = omit/mute string. 0 = open. ? = uncertain reconstruction.
Horizontal spacing in the reduction is illustrative, not exact notation.

CHORD CHART — HARMONIC REDUCTION
-------------------------------
The recurring loop is best reduced as:

    | Em7? | Cadd9? | G(6)? | D(add9)/F#? |  repeat

Equivalent starting point:

    | G | D/F# | Em | C |  repeat

This is the familiar I - V/7 - vi - IV family in G major.
The F# is a bass note under the D-family chord, not an F# major chord.
Upper extensions vary / are uncertain; plain Em, C, G, D/F# are a safer
starting point than insisting on every extension below.

Representative observed bass-change times (approximate; not bar lines):
  25.5 s  C bass     -> C-family chord
  27.3 s  G bass     -> G-family chord
  29.3 s  F# bass    -> D/F#-family chord
  31.0 s  E3 heard   -> Em-family chord (low E fundamental not consistently
                        recovered; some detected E3 can be its octave)
  32.9 s  C bass     -> C-family chord
  34.8 s  G bass     -> G-family chord
  36.6 s  F# bass    -> D/F#-family chord
  38.4 s  E3 heard   -> Em-family chord
  40.2 s  C bass     -> C-family chord
  42.0 s  G bass     -> G-family chord
  43.9 s  F# bass    -> D/F#-family chord
  45.6 s  E3 heard   -> Em-family chord

Approximately 1.8–1.9 s per chord in this stretch. If counted as four beats
per chord, roughly 130 bpm; alternatively count half-time around 65 bpm.
Meter/count is provisional, not automatically established.

SECTIONS / PLAY-ALONG MAP
------------------------
  0–8 s:     setup / lightly articulated opening; do not force a fixed tab.
  8–25 s:    introduction / entry. Chord changes less certain here (?);
             use the four-chord vocabulary above, checking against playback.
  25–83 s:   clearest repeated accompaniment; use the main loop below.
  83–108 s:  discussion / rehearsal continuation, not a new song section.
  108–166 s: resumed sung material; substantially the same harmonic loop.
  166–200 s: discussion and continued guitar fragments; don't interpret
             every detected note as a composed ending.
  ~198–202 s: G-bass sonority / ringing tail; final voicing uncertain (?).

PROPOSED VOICINGS — LOW E TO HIGH e
----------------------------------
These are playable reductions consistent with many detected pitches, not
visually proven exact shapes. Leave out any extension that disagrees with
the video. In particular the high open e and B-string D need verification.

  Em7?          0 2 2 0 3 0
  Cadd9?        x 3 2 0 3 0
  G6?           3 2 0 0 3 0
  Dadd9/F#?     2 x 0 2 3 0

      Em7?       Cadd9?      G6?        Dadd9/F#?
e |---0-----------0-----------0-----------0--------|
B |---3-----------3-----------3-----------3--------|
G |---0-----------0-----------0-----------2--------|
D |---2-----------2-----------0-----------0--------|
A |---2-----------3-----------2-----------x--------|
E |---0-----------x-----------3-----------2--------|

If the open high e sounds wrong, try omitting that string before choosing
a different tuning. The recorded upper voice is not cleanly isolated.

MAIN LOOP — SIMPLIFIED FINGERPICKING REDUCTION (?)
-------------------------------------------------
Use the recorded chord-change times as anchors. This is an even eight-attack
practice pattern through the inferred chords, not a claim that each of these
attacks occurs exactly this way in the recording. Let common upper notes ring.

      Em7?                  Cadd9?
e |------------0----------|------------0----------|
B |---------3-----3-------|---------3-----3-------|
G |------0-----------0----|------0-----------0----|
D |---2-----------------2-|---2-----------------2-|
A |----------------------|-3---------------------|
E |-0--------------------|-----------------------|

      G6?                   Dadd9/F#?
e |------------0----------|------------0----------|
B |---------3-----3-------|---------3-----3-------|
G |------0-----------0----|------2-----------2----|
D |---0-----------------0-|---0-----------------0-|
A |----------------------|-----------------------|
E |-3--------------------|-2---------------------|

Repeat this loop for the main sung material; picking accents, missed notes,
and speech-interrupted fragments are intentionally not expanded into false
precision. Where an exact passage is unclear, use '?' rather than inventing
a lick. No separate guitar solo was established from the mixed recording.

BASS SKELETON — MOST RELIABLE PART OF THE REDUCTION
-------------------------------------------------
Start here to test the harmonic reading before trying the fuller shapes.
The string choices assume standard tuning; E-bass octave is inferred.

      G           D/F#        Em          C
e |------------------------------------------------|
B |------------------------------------------------|
G |------------------------------------------------|
D |------------------------------------------------|
A |-------------------------------------3----------|
E |---3-----------2-----------0--------------------|
      then repeat; actual articulation and durations vary.

CONFIDENCE / EVIDENCE
---------------------
Capo: high confidence none. Ten frames checked at 3, 12, 25, 42, 62,
82, 105, 135, 165, and 195 seconds; no clamp spans the fretboard.
Tuning: moderate-confidence standard-tuning working assumption; familiar
open-position shapes and sounding F#2/G2/C3/E3 support it. A six-string
open-string tuning test was not recorded or isolated, so alternate tuning
cannot honestly be ruled out.
Harmony: moderate confidence for Em–C–G–D/F# root cycle.
Exact voicings/picking/rhythm: low confidence; reconstructed and marked '?'.
Song title: unidentified; lyric searches produced no supported match.

Key checks:
- Basic Pitch note-event duration/amplitude profile: G major r=0.903,
  D major r=0.785, E minor r=0.652.
- Raw STFT chroma: D major r=0.835, G major r=0.777.
- Music-only harmonic CQT chroma: D major r=0.727, G major r=0.629.
- Prominent transcribed C-natural versus almost absent C# plus the
  Em–C–G–D/F# harmonic cycle favor G major despite the chroma ambiguity.
These r values are correlations, NOT probabilities or calibrated confidence.

The files notes/2026-08-14_005.json and 005_chord_evidence.txt preserve
machine-detected notes and pitch evidence for later refinement. Do not
mistake those mixed vocal/guitar note events for clean guitar MIDI.
```

</details>

<details><summary>Blind Opus 5.5's tab for 005</summary>

```text
Song 05 - fingerpicked Em7 - C - G - D/F# loop (title unknown; outdoor duet, a second person sings)
===================================================================================================
Source: song05.mp4
Instrument: steel
Tuning: Standard E A D G B E  [MIDI 40 45 50 55 59 64]
Capo: 0 (none)
Key: G major (loop vi - IV - I - V6: Em7 - C - G - D/F#)
Time: 4/4
Tempo: ~132 (intro ~110, settles at 130-133; slows down in the outro)
Grid: 8   (one tab column = 1/8 note)
Pitch offset: -5 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Style: fingerpicking, 8th-note pattern (thumb + fingers), open position; occasional thumb slap
Confidence: overall MEDIUM.  tuning HIGH, capo HIGH (none), key HIGH, chord progression HIGH (main loop) / MEDIUM (intro, outro), tempo & meter MEDIUM-HIGH, exact voicings & picking notes MEDIUM-LOW

How this was made: guitar separated from the singing (Demucs), notes transcribed (basic-pitch),
bars/beats from madmom; chords from the bass note on each downbeat + pitch content; the video
shows open-position shapes near the nut, no capo, thumb wrapped over the neck (F# bass of D/F#).
Loop bars (0:23.6-1:32.8 and 1:47.6-2:50.5) are written as the per-chord 8th-note pattern that
the player repeats (measured over ~18 bars per chord) plus detected variations that fit the shape;
intro, break and outro are note-by-note transcriptions and less certain.
Voicings as heard: Em7 - thumb mostly on the D string (E3), B-string 3 and high-e 3/0 on top;
C - x-3-0-2-1-0 (open D, A on the G string: C6/9 colour); G - 6th-string 3 with an open-G to
fret-2 hammer-on (0h2), B-string 3 and open B at the end of the bar; D/F# - thumb on 6th-string 2.
'x' on the low E string = percussive thumb slap (mostly beat 3 of the Em7 bar).
Vocals are not transcribed.

Chord progression (time in video -> chord)
  0:06.97 Em7  |  0:09.75 Dsus2  |  0:11.37 G  |  0:15.32 Em7  |  0:16.00 G  |  0:17.51 Dsus2
  0:19.53 G  |  0:23.63 Em7  |  0:25.53 C  |  0:27.32 G  |  0:29.19 D/F#  |  0:31.05 Em7
  0:32.91 C  |  0:34.76 G  |  0:36.56 D/F#  |  0:38.37 Em7  |  0:40.23 C  |  0:42.03 G
  0:43.82 D/F#  |  0:45.64 Em7  |  0:47.45 C  |  0:49.26 G  |  0:51.10 D/F#  |  0:52.95 Em7
  0:54.82 C  |  0:56.64 G  |  0:58.46 D/F#  |  1:00.25 Em7  |  1:02.07 C  |  1:03.87 G
  1:05.67 D/F#  |  1:07.49 Em7  |  1:09.31 C  |  1:11.09 G  |  1:12.94 D/F#  |  1:14.82 Em7
  1:16.63 C  |  1:18.40 G  |  1:20.26 D/F#  |  1:22.09 Em7  |  1:23.94 C  |  1:25.67 G
  1:27.45 D/F#  |  1:29.21 Em7  |  1:30.98 C  |  1:32.77 G  |  1:39.98 Em7  |  1:41.94 G
  1:43.86 N.C.  |  1:47.56 Em7  |  1:49.38 C  |  1:51.16 G  |  1:52.97 D/F#  |  1:54.82 Em7
  1:56.68 C  |  1:58.46 G  |  2:00.49 D/F#  |  2:02.31 Em7  |  2:04.15 C  |  2:05.97 G
  2:07.77 D/F#  |  2:09.52 Em7  |  2:11.30 C  |  2:13.10 G  |  2:14.97 D/F#  |  2:16.67 Em7
  2:18.46 C  |  2:20.27 G  |  2:22.04 D/F#  |  2:23.81 Em7  |  2:25.70 C  |  2:27.53 G
  2:29.38 D/F#  |  2:31.25 Em7  |  2:33.08 C  |  2:34.84 G  |  2:36.67 D/F#  |  2:38.48 Em7
  2:40.30 C  |  2:42.08 G  |  2:43.91 D/F#  |  2:45.66 Em7  |  2:47.69 C  |  2:48.88 G
  2:50.50 Asus4(add9)  |  2:52.25 G  |  2:55.20 Em7  |  2:57.20 C  |  2:57.60 C6/9  |  3:00.57 Dsus2
  3:04.70 G  |  3:06.78 Em7  |  3:08.86 C  |  3:10.40 G  |  3:12.90 D/F#  |  3:14.98 Em7
  3:17.12 C  |  3:18.90 G  |  3:23.44 Em7

Sections:
  Intro  0:07-0:23  | Em7 . Dsus2 | G | G | Em7 . G | Dsus2 | G | G |
  Loop A 0:23-1:33  | Em7 | C | G | D/F# |  x9, then | Em7 | C | G -> break
  Break  1:33-1:47  G held / sparse picking (Em7 strum at 1:40, G at 1:42), playing stops briefly
  Loop B 1:47-2:50  | Em7 | C | G | D/F# |  x8, then | Em7 | C |
  Outro  2:49-3:25  (slowing down) | G | Asus4(add9) | G | Em7 | Em7 . C . C6/9 | C6/9 | Dsus2 |
                    | Dsus2 | G | Em7 | C . G | G | D/F# | Em7 | C | G | G | Em7 |

Chord shapes used (lowest -> highest string, x = not played):
  Em7: 0 2 2 0 3 3   Dsus2: x x 0 2 3 0   G: 3 x 0 2 3 0   C: x 3 0 2 1 0   D/F#: 2 x 0 2 0 x   Asus4(add9): x 0 0 2 0 0   C6/9: x 3 0 2 3 0

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

@ 0:06.97
  Em7                  Dsus2        G                              Em7
e|--0-0-0---0---0-|------0---------|------0-------0-|------0-------0-|
B|------3---3---3-|3-----3---------|----------------|------0---0-0-0-|
G|0---------0---0-|----2-2---2-----|--0-------------|----------2---0-|
D|----2-2---2-----|----0-----0---0-|--------------0-|----0---------2-|
A|----------------|3-------------0-|--0-------------|----0-----------|
E|----------------|0---------------|3---------------|3---3-3---------|

@ 0:15.49
      G            Dsus2            G
e|--------------0-|------0---------|------0---0---0-|------0---------|
B|----3-3-3---3---|--3-------------|--------------0-|------0---0-----|
G|----0-0---0-0-0-|2-----2---------|--0-2-----------|----2-2---------|
D|2-------0---0-0-|0-0-0-0---0---0-|------0---------|--------2-0-----|
A|0---0---0-0-----|----0-------0-0-|----------------|----------0-----|
E|0---3---3-3-3---|----------------|3---------------|3-----------3---|

@ 0:23.63
  Em7              C                G                D/F#
e|3---3---------0-|--------0-------|----------------|----------------|
B|--3---3-3-3-----|1---1-3-----1---|----3---------0-|----------------|
G|----0-0-0-0-----|------2---2-----|0-2---2-2-2-----|------2---2-0-0-|
D|2-------2---2-2-|--------0-------|------0-0-0-----|--------0-------|
A|----------------|3---3-------3---|----------------|----------------|
E|--------x-------|----------------|3---3-------3---|2---2-------2---|

@ 0:31.05
  Em7              C                G                D/F#
e|----3---------0-|--------0-------|--0-------------|----------------|
B|3-3---3---3-----|1---1-------1---|----3---3-----0-|--------------0-|
G|0-0-0-0-0-0-----|------2---2-----|0-2---2---2-----|------2-2-2---0-|
D|2-------2---2-2-|--------0-0-----|------0-0-----0-|--------0-0-----|
A|----------------|3---3-------3---|----------------|----------------|
E|--------x-------|----------------|3-3---------3---|2---2-2-----2---|

@ 0:38.37
  Em7              C                G                D/F#
e|----3---------0-|--------0-------|--------0-------|----------------|
B|--3---3-3-3-----|1---1-------1---|----3---------0-|----------------|
G|0---0---0-------|------2---2-----|0-2---2-2-2-2---|--2---2---2---0-|
D|2-------2---2-2-|------0-0-------|0---0-0-0-------|--------0-0-----|
A|----------------|3---3-------3---|----------------|----------------|
E|0-------x-------|----------------|3---3-------3---|2-2-2-2-----2---|

@ 0:45.64
  Em7              C                G                D/F#
e|----0---------3-|----0-0-0-------|----------------|----------------|
B|--3---3---3---3-|1---1-3-3-3-1---|----0---------3-|--------0-------|
G|------0-0-----0-|------2---2-----|0-2---2-2-2-0-0-|------2---2---0-|
D|2---2---2---2-2-|--------0-------|0-----0-0-------|--------0-------|
A|----------------|3---3-------3---|----------------|----------------|
E|--0-----x-------|--------x-------|3-----------3---|2-2-2-----2-2---|

@ 0:52.95
  Em7              C                G                D/F#
e|--0-3-0-0-0-3-0-|--------0-------|--------0-------|----------------|
B|3-3-3-3-3-3---3-|1---1-------1---|----0---0-3---0-|----------------|
G|--------0---0-0-|------2-2-2-2---|0-2---2---2-----|------2-2-2---0-|
D|2-2-----2---2-2-|--------0-------|------0-0-------|--------0-------|
A|----------------|3---3-3-----3---|----------------|----------------|
E|--------x-------|----------------|3-----3-----3---|2-2-2-2-----2---|

@ 1:00.25
  Em7              C                G                D/F#
e|----0---------3-|----0---0-------|----------------|----------------|
B|--3---3---3---3-|1---1-3-3---1---|----3---------0-|----------------|
G|--------0-0---0-|------2---0-2---|0-2---2-2-2-0-0-|------2---2---0-|
D|2---2-2-2-2-2-2-|--------0-------|------0-0-----0-|--------0-------|
A|----------------|3---3-------3---|----------------|----------------|
E|0-------x-------|----------------|3---3-------3---|2-2-2-2---2-2---|

@ 1:07.49
  Em7              C                G                D/F#
e|----3---------0-|--------0-------|----------------|----------------|
B|--3---3-3-3-----|1---1-------1---|----3---------0-|----0---0---0---|
G|0-------0-0-----|------2-2-2-----|2-2---2-2-2-----|------2-2-2---0-|
D|2-------2---2-2-|--------0-0-----|0-----0-0-0-----|--0-----0-------|
A|----------------|3---3-------3---|----------------|----------------|
E|--------x-------|--------x-------|3-----------3---|2---2-2-----2---|

@ 1:14.82
  Em7              C                G                D/F#
e|----3-----3---0-|--------0---0---|----------------|----------------|
B|--3---3-3-3---3-|1---1-------1---|----3---------0-|------0---------|
G|0---0-0-0-0-----|------2-2-2-----|0-2---2-2-2-----|------2---2---0-|
D|2-------2---2-2-|------0-0-0-0-0-|--0---0-0-0-----|------0-0-0-----|
A|----------------|3---3-------3---|----------------|----------------|
E|0-------x-------|----------------|3-------x---3---|2---2-------2---|

@ 1:22.09
  Em7              C                G                D/F#
e|----3---------0-|--------0-------|----------------|----------------|
B|--3---3-3-3-----|1---1-3-3---1---|----0---------3-|3-----0---------|
G|------0-0-0-----|------2---2-----|0-2---2---2-----|------2-2-2-0-0-|
D|2-2-----2-2-2-2-|--------0-------|------0-0-0-----|0-------0-------|
A|----------------|3---3-------3---|----------------|----------------|
E|0-------x-------|----------------|3-----3-----3---|2-2-2-------2---|

@ 1:29.21
  Em7              C                G
e|----3-0-------0-|0-------0-------|----------------|----------------|
B|--3-3-3-3-3-3-3-|1---1-------1---|----------------|----------------|
G|--------0-0-0---|------2-2-2-0---|0-----0-----0---|0-0-------------|
D|2-2---2-2-2-2-2-|--------0-------|----------------|----------------|
A|----------------|3-3-3-------3-3-|----------------|----------------|
E|--0-------x-----|----------------|3-3---3---------|--3-------------|

@ 1:36.37
                                    Em7              G
e|----------------|----------------|3---------------|3---------------|
B|----3-----------|----------------|3---------------|3---------------|
G|----0-------0---|----------------|0---------------|0---------------|
D|----------------|----------------|2---------------|----------------|
A|----------------|----------------|2---------------|----------------|
E|----3-----------|----------------|0---------------|3-------------3-|

@ 1:43.86
  N.C.                              Em7              C
e|----------------|----------------|----3---------0-|--------0-------|
B|----------------|--3-------------|--3---3---3-----|1---1-----3-1---|
G|----------------|----------------|--0-----0-------|------2-2-2-----|
D|----------------|2---------------|2-------2---2-2-|--------0-------|
A|----------------|----------------|----------------|3---3-------3---|
E|----------------|----------------|----------------|----------------|

@ 1:51.16
  G                D/F#             Em7              C
e|--0-------------|----------------|----3---------0-|--------0-------|
B|----3---------0-|----------------|--3---3---3-----|1---1-------1---|
G|0-2---2---2-----|------2---2---0-|0-------0-0-----|------2---2-----|
D|--0---0-0-------|--------0-------|2-2-2---2---2-2-|------0-0-0-0---|
A|----------------|----------------|----------------|3---3-------3---|
E|3-3-------3-3---|2-2-2-2-----2---|----------------|----------------|

@ 1:58.46
  G                D/F#             Em7              C
e|----------------|----------------|----0-----0---0-|--------0-------|
B|----3-----3---0-|----------------|--3---3-3-3-0---|1---1-3-----1---|
G|0-2---2-2-2-2-2-|2-----2---2---0-|--------0-----0-|------2---2-----|
D|----0-0-0-----0-|0-------0-----0-|2-------2---2-2-|--------0-0-----|
A|----------------|----------------|----------------|3---3-------3---|
E|3---3-------3---|2-2-2-2-----2---|--------x-------|----------------|

@ 2:05.97
  G                D/F#             Em7              C
e|----0-------0---|----------------|----0---------0-|--------0-------|
B|----3-3-------0-|----------------|0-3---3---3-----|1-3-1-------1-3-|
G|0-2---2---2-----|------2---2---0-|--------0-----0-|------2-2-2-----|
D|0-----0-0-------|--------0-0-----|2-2-----2---2-2-|--------0-------|
A|----------------|----------------|----------------|3---3-3-----3---|
E|3-----3-----3---|2-2-2-2-----2---|--------x-------|----------------|

@ 2:13.10
  G                D/F#             Em7              C
e|0---------------|----------------|----0---------0-|--------0-0-----|
B|----3---3-----0-|------0---------|0-3---3---3-----|1---1-------1---|
G|0-2-2-2---2-----|------2---2---0-|----0---0-------|------2---2-----|
D|----0-0-0-------|------0-0-------|2-2-2---2---2-2-|--------0-------|
A|----------------|----------------|----------------|3---3-----3-3---|
E|3-----3---3-3---|2---2-2-----2---|----0-----------|----------------|

@ 2:20.27
  G                D/F#             Em7              C
e|----0---0-------|----------------|----0---------0-|--------0-------|
B|0---3---------0-|----------------|0-3---3---3-----|1---1-------1---|
G|0-2---0-0-0---2-|------2---2---0-|--------0-0-----|------2---0-----|
D|------0-0-0-----|--------0-------|2-2-2---2-2-2-2-|--------0-------|
A|----------------|----------------|----------------|3---3-------3---|
E|3-----3-----3---|2---2-2---2-2---|--------x-------|--------x-------|

@ 2:27.53
  G                D/F#             Em7              C
e|----------------|----------------|3---3---------0-|--------0-------|
B|----3-0-0-----0-|--------0-------|--3---3-3-3-----|1---1-------1---|
G|0-2-2-2---2---2-|------2-2-2---0-|--------0-------|------2---2-----|
D|----0-0-0-0---0-|------0-0-0-----|2---2---2---2-2-|------0-0-0-----|
A|----------------|----------------|----------------|3---3-------3---|
E|3-----------3---|2---2-------2---|--------x-------|----------------|

@ 2:34.84
  G                D/F#             Em7              C
e|--------0-------|----------------|3---3---------0-|--------0-------|
B|----3---------0-|------0---------|--3---3---3-----|1---1-------1---|
G|2-2---2---2-----|------2-2-2---0-|----0---0-------|------2---2-----|
D|0-0---0-0-0-----|------0-0-0---0-|2-2-----2---2-2-|------0-0-0---0-|
A|----------------|----------------|----------------|3---3-------3---|
E|3---3-------3---|2---2-2-----2---|--------x-------|----------------|

@ 2:42.08
  G                D/F#             Em7              C
e|----------------|----------------|----3-0-------0-|0-------0-------|
B|----3---3-----0-|------0-------0-|--3---3---3-3---|1---1-3-----1---|
G|0-2---2-2-2-----|------2-2-2---0-|--------0-------|------2---2---0-|
D|------0-0-------|------0-0-----0-|2-------2-2-2-2-|--------0---0-0-|
A|----------------|----------------|----------------|3-3-3-------3---|
E|3---3-3-----3-3-|2-2-2-2-----2---|----0-------0---|----------------|

@ 2:48.88
  G                Asus4(add9)      G                        Em7
e|----------------|--0-------------|0---------------|--------3---3---|
B|----------------|0---------------|0---------------|----------3---3-|
G|2---------------|2---------------|2---------------|----------------|
D|----------------|0---------------|0---------------|--------2-------|
A|----------------|0---------------|----------------|----------------|
E|--------3---3---|------------3---|3---------------|----------------|

@ 2:56.33
        C   C6/9                    Dsus2
e|--3---0---------|--0---------0---|0-0-------------|0---------------|
B|--3-------------|--3-----------3-|----------------|3---------------|
G|0---------2-----|2---------------|----------------|2---------------|
D|2---0-2---0-----|0-------------0-|--0---0---0---0-|0---------------|
A|--------3-3---0-|3-0-------------|----------------|0-------0-------|
E|x---------------|----------------|----------------|----------------|

@ 3:04.70
  G                Em7              C           G
e|----------------|3---3---------0-|----------------|----------------|
B|--3-------------|------3---3-----|----------------|--------------0-|
G|----------------|----------------|----------2-----|------2---2-----|
D|--0-------------|2---2---2---0-2-|--------0-------|0---------0-----|
A|----------------|----------------|3---0---0---3---|----------------|
E|--3-------------|----------------|------------3---|3-----------3---|

@ 3:12.98
  D/F#             Em7              C             G
e|----------------|----0---0-0---0-|----------------|----------------|
B|--------0-----0-|------3-3-3-3-3-|----0-1-----3---|----------------|
G|------2---------|--------0-------|------2---0---0-|----------------|
D|----------------|2-------2-------|----------0-----|----------------|
A|----------------|----------------|3---------------|----------------|
E|2---2-------2---|--------3-------|--------------3-|--3---3-3-3-3---|

@ 3:21.30
                   Em7
e|----------------|--3-------------|
B|----------------|------3---------|
G|----------------|0---0-0---------|
D|----------------|2---2-----------|
A|----------------|----------------|
E|----------------|3-------------0-|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 005</summary>

```text
====================================================================================================
 song05 - outdoor duo, strummed pop ballad in G major (two takes with a discussion in between)
====================================================================================================
 Source        : song05.mp4 (3:27). One person strums an acoustic-electric guitar, the other sings
                 (vocals not transcribed). They stop at ~1:36, discuss and start a second take at
                 ~1:49.
 Tuning        : Standard E A D G B E; in tune (-3 cents)
 Capo          : none (fretting hand at the nut in the video; G/Em7/Cadd9 sound in open position)
 Key           : G major (relative E minor)
 Tempo / feel  : 4/4, q = ~132 counted in 8ths (felt as a 66-bpm ballad with 16th-note strumming)
 Progression   : Verse: | G  Em7 | C/G  Em7 | Cadd9  C/G | Am7/G | G/F#  D/F# | G | Em7  Cadd9 | Am7
                 Dsus4 |
                 Chorus: | G/F#  D/F# | G/F#  Em7  C/G | Cadd9 | C/G  G  Dsus4 | G/F# | G/F#  Em7 |
                 Cadd9 | Am7/G  G |
                 (anchored voicings: ring + pinky stay on B and e strings, 3rd fret, through G,
                 G/F#, Em7, Cadd9, Dsus4 - the bass walks G - F# - E - C - D)
 Structure     : Take 1: intro 0:00 - verse 0:22 - chorus 0:44-1:36; discussion 1:36-1:49 (one empty
                 bar); take 2 from 1:49: verse/chorus material to the end.
 Confidence    : Key HIGH, capo/tuning HIGH. Chords MEDIUM-LOW (two voices sing over the guitar;
                 HMM-smoothed labels; the anchored voicings are confirmed by sustained D4+G4 in the
                 audio). Exact bar placement of changes MEDIUM-LOW. Strum rhythm MEDIUM (from
                 onsets; directions inferred).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   G            3 2 0 0 3 3
   G/F#         2 x 0 0 3 3              thumb F#
   Em7          0 2 2 0 3 3
   Cadd9        x 3 2 0 3 3
   Dsus4        x x 0 2 3 3
   D/F#         2 x 0 2 3 2
   Am7          x 0 2 0 1 0
   Am7/G        3 0 2 0 1 0
   C/G          3 3 2 0 3 3
   G/B          x 2 0 0 3 3
   Bm7          x 2 0 2 0 2
   B7           x 2 1 2 0 2
----------------------------------------------------------------------------------------------------
 Strum tab: one column per strum (D = down, U = up) on an 8th-note grid at q~132.
 Down-strums hit all strings shown, up-strums the top 3-4 strings.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: standard / capo 0 / G major all right, and it correctly flagged the take as
                 a rehearsal (talking mid-take). But its chart is unusable (A#, D#maj7, Esus4, F#m,
                 C#5 ...: vocals and talk leak into the notes), and it missed the anchored-voicing
                 pattern and the G-F#-E bass walk. I kept its structure/talk detection and rebuilt
                 the chords with an HMM over G-major chords plus a strum tab from the onsets; the
                 discussion is marked and left silent.
====================================================================================================


[Take 1 - intro (noodle, then Em7 count-in)]
          G/B             D        B7      G       Am7/G            Am7/G   D       Cadd9   Em7    (0:00, bar 1)
e|------------3---3-------2---2---|2---2---3---3---0---0---0-------|------------2---3---3---3---3---|
B|------------3---3-------3---3---|0---0---3---3---1---1---1-------|------------3---3---3---3---3---|
G|------------0---0-------2---2---|2---2---0---0---0---0---0-------|------------2---0---0---0---0---|
D|------------0---0-------0---0---|1---1---0---0---2---2---2-------|------------0---2---2---2---2---|
A|----------------2---------------|2-------2-------0-------0-------|----------------3-------2-------|
E|--------------------------------|--------3-------3-------3-------|------------------------0-------|
              U   D       D   U    D   U   D   U   D   U   D                    U   D   U   D   U

  Em7     Dsus4   Bm7     Dsus4    C/G             G/F#    Em7      C/G     Em7             Dsus4    (0:05, bar 4)
e|3---3---3-------2---2-------3---|3---3---3-------3---3---3---3---|3---3-------3---3-------3-------|
B|3---3---3-------0---0-------3---|3---3---3-------3---3---3---3---|3---3-------3---3-------3-------|
G|0---0---2-------2---2-------2---|0---0---0-------0---0---0---0---|0---0-------0---0-------2-------|
D|2---2---0-------0---0-------0---|2---2---2-------0---0---2---2---|2---2-------2---2-------0-------|
A|2---------------2---------------|3-------3---------------2-------|3---------------2---------------|
E|0-------------------------------|3-------3-------2-------0-------|3---------------0---------------|
  D   U   D       D   U       U    D   U   D       D   U   D   U    D   U       U   D       D

  Cadd9   D       G                C/G     Em7             G        G       Em7    (0:10, bar 7)
e|3-------2---2---3---3-----------|3---3---------------3---3-------|3-----------------------3-------|
B|3-------3---3---3---3-----------|3---3---------------3---3-------|3-----------------------3-------|
G|0-------2---2---0---0-----------|0---0---------------0---0-------|0-----------------------0-------|
D|2-------0---0---0---0-----------|2---2---------------2---0-------|0-----------------------2-------|
A|3---------------2---------------|3-----------------------2-------|2-----------------------2-------|
E|----------------3---------------|3-----------------------3-------|3-----------------------0-------|
  D       D   U   D   U            D   U               U   D        D                       D

  G                       Dsus4    Dsus4           Am7     G    (0:15, bar 10)
e|3-------3---3---3-------3---3---|3---3---3-------0---0---3---3---|
B|3-------3---3---3-------3---3---|3---3---3-------1---1---3---3---|
G|0-------0---0---0-------2---2---|2---2---2-------0---0---0---0---|
D|0-------0---0---0-------0---0---|0---0---0-------2---2---0---0---|
A|2-------2-------2---------------|----------------0-------2-------|
E|3-------3-------3---------------|------------------------3-------|
  D       D   U   D       D   U    D   U   D       D   U   D   U


[Verse: G - C/G - Am7/G - G/F# - D/F# (G bass held under C and Am7)]
  G               Dsus4            G               Em7     G        C/G     Em7     G    (0:19, bar 12)
e|3-----------3-------------------|3---------------3---3---3---3---|3-------3---3---3---3---3---3---|
B|3-----------3-------------------|3---------------3---3---3---3---|3-------3---3---3---3---3---3---|
G|0-----------0-------------------|0---------------0---0---0---0---|0-------0---0---0---0---0---0---|
D|0-----------0-------------------|0---------------2---2---0---0---|2-------2---2---0---0---0---0---|
A|2-------------------------------|2---------------2-------2-------|3-------2-------2-------2-------|
E|3-------------------------------|3---------------0-------3-------|3-------0-------3-------3-------|
  D           U                    D               D   U   D   U    D       D   U   D   U   D   U

  Cadd9           C/G              Am7/G                            G/F#            D/F#    Bm7    (0:25, bar 15)
e|3---3---3---3---3---3---3---3---|0---0---0---0---0---0---0---0---|3---3---3---3---2---2---2---2---|
B|3---3---3---3---3---3---3---3---|1---1---1---1---1---1---1---1---|3---3---3---3---3---3---0---0---|
G|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---2---2---2---2---|
D|2---2---2---2---2---2---2---2---|2---2---2---2---2---2---2---2---|0---0---0---0---0---0---0---0---|
A|3-------3-------3-------3-------|0-------0-------0-------0-------|------------------------2-------|
E|----------------3-------3-------|3-------3-------3-------3-------|2-------2-------2---------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U

  G                                Em7     Cadd9   Am7              Am7     Am7/G   Dsus4    (0:30, bar 18)
e|3-------3---3---3---3---3---3---|3---3---3---3---0---0---0---0---|0---0---0---0---3---3---3---3---|
B|3-------3---3---3---3---3---3---|3---3---3---3---1---1---1---1---|1---1---1---1---3---3---3---3---|
G|0-------0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---2---2---2---2---|
D|0-------0---0---0---0---0---0---|2---2---2---2---2---2---2---2---|2---2---2---2---0---0---0---0---|
A|2-------2-------2-------2-------|2-------3-------0-------0-------|0-------0-----------------------|
E|3-------3-------3-------3-------|0-------------------------------|--------3-----------------------|
  D       D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U

  D/F#                             G/F#    Em7     C/G              C/G     Cadd9   Am7    (0:36, bar 21)
e|2---2---2---2---2---2---2---2---|3---3---3---3---3---3---3---3---|3---3---3-------0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3-------1---1---1---1---|
G|2---2---2---2---2---2---2---2---|0---0---0---0---0---0---0---0---|0---0---0-------0---0---0---0---|
D|0---0---0---0---0---0---0---0---|0---0---2---2---2---2---2---2---|2---2---2-------2---2---2---2---|
A|--------------------------------|--------2-------3-------3-------|3-------3-------0-------0-------|
E|2-------2-------2-------2-------|2-------0-------3-------3-------|3-------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D       D   U   D   U

  Am7/G    (0:41, bar 24)
e|0-------0---0---0---0---0---0---|
B|1-------1---1---1---1---1---1---|
G|0-------0---0---0---0---0---0---|
D|2-------2---2---2---2---2---2---|
A|0-------0-------0-------0-------|
E|3-------3-------3-------3-------|
  D       D   U   D   U   D   U


[Chorus: G/F# - Em7 - C/G - Cadd9 - Dsus4 - G (bass walks G - F# - E - C)]
  G/F#            D/F#             G/F#    Em7     C/G              Cadd9    (0:43, bar 25)
e|3---3---3-------2---2---2---2---|3---3---3---3---3---3---3---3---|3---3---3-----------3---3---3---|
B|3---3---3-------3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3-----------3---3---3---|
G|0---0---0-------2---2---2---2---|0---0---0---0---0---0---0---0---|0---0---0-----------0---0---0---|
D|0---0---0-------0---0---0---0---|0---0---2---2---2---2---2---2---|2---2---2-----------2---2---2---|
A|--------------------------------|--------2-------3-------3-------|3-------3---------------3-------|
E|2-------2-------2-------2-------|2-------0-------3-------3-------|--------------------------------|
  D   U   D       D   U   D   U    D   U   D   U   D   U   D   U    D   U   D           U   D   U

  C/G     G               Dsus4    G/F#                             G/F#    Em7    (0:49, bar 28)
e|3-------3-------3---3---3---3---|3---3---3-------3-----------3---|3-------3---3---3---3---3---3---|
B|3-------3-------3---3---3---3---|3---3---3-------3-----------3---|3-------3---3---3---3---3---3---|
G|0-------0-------0---0---2---2---|0---0---0-------0-----------0---|0-------0---0---0---0---0---0---|
D|2-------0-------0---0---0---0---|0---0---0-------0-----------0---|0-------2---2---2---2---2---2---|
A|3-------2-------2---------------|--------------------------------|--------2-------2-------2-------|
E|3-------3-------3---------------|2-------2-------2---------------|2-------0-------0-------0-------|
  D       D       D   U   D   U    D   U   D       D           U    D       D   U   D   U   D   U

  Cadd9                            Am7/G   G               Am7      G/F#            D/F#    (0:54, bar 31)
e|3---3---3-------3---3---3---3---|0---0---3-------3---3---0---0---|----3---3-------2---2---2---2---|
B|3---3---3-------3---3---3---3---|1---1---3-------3---3---1---1---|----3---3-------3---3---3---3---|
G|0---0---0-------0---0---0---0---|0---0---0-------0---0---0---0---|----0---0-------2---2---2---2---|
D|2---2---2-------2---2---2---2---|2---2---0-------0---0---2---2---|----0---0-------0---0---0---0---|
A|3-------3-------3-------3-------|0-------2-------2-------0-------|--------------------------------|
E|--------------------------------|3-------3-------3---------------|--------2-------2-------2-------|
  D   U   D       D   U   D   U    D   U   D       D   U   D   U        U   D       D   U   D   U

  G/F#    Em7             C/G      Cadd9                   C/G      Am7/G   G               Am7/G    (1:00, bar 34)
e|3---3---3---3---3---3---3---3---|3---3---3-----------3---3---3---|0---0---3---3---3---3---0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3-----------3---3---3---|1---1---3---3---3---3---1---1---|
G|0---0---0---0---0---0---0---0---|0---0---0-----------0---0---0---|0---0---0---0---0---0---0---0---|
D|0---0---2---2---2---2---2---2---|2---2---2-----------2---2---2---|2---2---0---0---0---0---2---2---|
A|--------2-------2-------3-------|3-------3---------------3-------|0-------2-------2-------0-------|
E|2-------0-------0-------3-------|------------------------3-------|3-------3-------3-------3-------|
  D   U   D   U   D   U   D   U    D   U   D           U   D   U    D   U   D   U   D   U   D   U

  G/F#                             G/F#    Em7     G       C/G      Em7     Cadd9           Dsus4    (1:05, bar 37)
e|3---3---3-------3-----------3---|--------3-----------3---3---3---|3---3---3-------3---3---3---3---|
B|3---3---3-------3-----------3---|--------3-----------3---3---3---|3---3---3-------3---3---3---3---|
G|0---0---0-------0-----------0---|--------0-----------0---0---0---|0---0---0-------0---0---2---2---|
D|0---0---0-------0-----------0---|--------2-----------0---2---2---|2---2---2-------2---2---0---0---|
A|--------------------------------|--------2---------------3-------|2-------3-------3---------------|
E|2-------2-------2---------------|--------0---------------3-------|0-------------------------------|
  D   U   D       D           U            D           U   D   U    D   U   D       D   U   D   U

  Dsus4   G       D/F#             D/F#                             G/F#    Em7     G       Em7    (1:10, bar 40)
e|3---3---3---3---2---2---2---2---|2---2---2---2---2---2---2---2---|3---3---3---3-------3---3---3---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3---3-------3---3---3---|
G|2---2---0---0---2---2---2---2---|2---2---2---2---2---2---2---2---|0---0---0---0-------0---0---0---|
D|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|0---0---2---2-------0---2---2---|
A|--------2-----------------------|--------------------------------|--------2---------------2-------|
E|--------3-------2-------2-------|2-------2-------2-------2-------|2-------0---------------0-------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D   U       U   D   U

  Cadd9                            C/G             Dsus4            G/F#    (1:16, bar 43)
e|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
G|0---0---0---0---0---0---0---0---|0---0---0---0---2---2---2---2---|0---0---0---0---0---0---0---0---|
D|2---2---2---2---2---2---2---2---|2---2---2---2---0---0---0---0---|0---0---0---0---0---0---0---0---|
A|3-------3-------3-------3-------|3-------3-----------------------|--------------------------------|
E|--------------------------------|3-------3-----------------------|2-------2-------2-------2-------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U

  G/F#    Em7     G       C/G      Em7     Cadd9                    G                       D    (1:22, bar 46)
e|3---3---3---3-------3---3---3---|3---3---3-------3---3---3---3---|3-------3---3---3---3---2---2---|
B|3---3---3---3-------3---3---3---|3---3---3-------3---3---3---3---|3-------3---3---3---3---3---3---|
G|0---0---0---0-------0---0---0---|0---0---0-------0---0---0---0---|0-------0---0---0---0---2---2---|
D|0---0---2---2-------0---2---2---|2---2---2-------2---2---2---2---|0-------0---0---0---0---0---0---|
A|--------2---------------3-------|2-------3-------3-------3-------|2-------2-------2---------------|
E|2-------0---------------3-------|0-------------------------------|3-------3-------3---------------|
  D   U   D   U       U   D   U    D   U   D       D   U   D   U    D       D   U   D   U   D   U

  D/F#                    G        G       Em7     C/G              Cadd9    (1:27, bar 49)
e|2---2---2-------2---2---3---3---|3---3---3---3---3---3---3---3---|3---3---3-----------3---3---3---|
B|3---3---3-------3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3-----------3---3---3---|
G|2---2---2-------2---2---0---0---|0---0---0---0---0---0---0---0---|0---0---0-----------0---0---0---|
D|0---0---0-------0---0---0---0---|0---0---2---2---2---2---2---2---|2---2---2-----------2---2---2---|
A|------------------------2-------|2-------2-------3-------3-------|3-------3---------------3-------|
E|2-------2-------2-------3-------|3-------0-------3-------3-------|--------------------------------|
  D   U   D       D   U   D   U    D   U   D   U   D   U   D   U    D   U   D           U   D   U

  G                       Am7/G    G    (1:33, bar 52)
e|----3---3---3-----------0-------|3---3---------------------------|
B|----3---3---3-----------1-------|3---3---------------------------|
G|----0---0---0-----------0-------|0---0---------------------------|
D|----0---0---0-----------2-------|0---0---------------------------|
A|--------2---------------0-------|2-------------------------------|
E|--------3---------------3-------|3-------------------------------|
      U   D   U           D        D   U


[Talking: 'do it better... do another take' (1:36-1:49) - no playing]
    (1:36, bar 54)
e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--------------------------------|
E|--------------------------------|


[Take 2: verse -> chorus x2 -> outro]
                          G        Cadd9                            Am7/G   G    (1:47, bar 55)
e|------------------------3---3---|3---3---3-------3---3---3---3---|0---0---3---3-------3---3---3---|
B|------------------------3---3---|3---3---3-------3---3---3---3---|1---1---3---3-------3---3---3---|
G|------------------------0---0---|0---0---0-------0---0---0---0---|0---0---0---0-------0---0---0---|
D|------------------------0---0---|2---2---2-------2---2---2---2---|2---2---0---0-------0---0---0---|
A|------------------------2-------|3-------3-------3-------3-------|0-------2---------------2-------|
E|------------------------3-------|--------------------------------|3-------3---------------3-------|
                          D   U    D   U   D       D   U   D   U    D   U   D   U       U   D   U

  G/F#            D/F#             D/F#    Em7     G                Cadd9                   D    (1:53, bar 58)
e|3---3---3-------2---2-----------|2-------3---3---3-------3---3---|3---3---3-------3---3---2---2---|
B|3---3---3-------3---3-----------|3-------3---3---3-------3---3---|3---3---3-------3---3---3---3---|
G|0---0---0-------2---2-----------|2-------0---0---0-------0---0---|0---0---0-------0---0---2---2---|
D|0---0---0-------0---0-----------|0-------2---2---0-------0---0---|2---2---2-------2---2---0---0---|
A|--------------------------------|--------2-------2-------2-------|3-------3-------3---------------|
E|2-------2-------2---------------|2-------0-------3-------3-------|--------------------------------|
  D   U   D       D   U            D       D   U   D       D   U    D   U   D       D   U   D   U

  C/G             Dsus4            Bm7     D/F#                     D/F#    Em7             C/G    (1:58, bar 61)
e|3---3---3---3---3---3---3---3---|2---2---2---2-------------------|2-------3---3---3---3---3---3---|
B|3---3---3---3---3---3---3---3---|0---0---3---3-------------------|3-------3---3---3---3---3---3---|
G|0---0---0---0---2---2---2---2---|2---2---2---2-------------------|2-------0---0---0---0---0---0---|
D|2---2---2---2---0---0---0---0---|0---0---0---0-------------------|0-------2---2---2---2---2---2---|
A|3-------3-----------------------|2-------------------------------|--------2-------2-------3-------|
E|3-------3-----------------------|--------2-----------------------|2-------0-------0-------3-------|
  D   U   D   U   D   U   D   U    D   U   D   U                    D       D   U   D   U   D   U

  Cadd9                   Dsus4    Dsus4   C/G             Dsus4    G/F#            D/F#    (2:04, bar 64)
e|3---3---3-------3---3---3---3---|3-------3---3---3---3---3---3---|3---3---3-------2---2-----------|
B|3---3---3-------3---3---3---3---|3-------3---3---3---3---3---3---|3---3---3-------3---3-----------|
G|0---0---0-------0---0---2---2---|2-------0---0---0---0---2---2---|0---0---0-------2---2-----------|
D|2---2---2-------2---2---0---0---|0-------2---2---2---2---0---0---|0---0---0-------0---0-----------|
A|3-------3-------3---------------|--------3-------3---------------|--------------------------------|
E|--------------------------------|--------3-------3---------------|2-------2-------2---------------|
  D   U   D       D   U   D   U    D       D   U   D   U   D   U    D   U   D       D   U

  D/F#    Em7             C/G      Em7     Cadd9           Am7      Am7/G           G    (2:09, bar 67)
e|2-------3---3---3-------3---3---|3---3---3-------3---3---0---0---|0---0---0---0---3---3---3---3---|
B|3-------3---3---3-------3---3---|3---3---3-------3---3---1---1---|1---1---1---1---3---3---3---3---|
G|2-------0---0---0-------0---0---|0---0---0-------0---0---0---0---|0---0---0---0---0---0---0---0---|
D|0-------2---2---2-------2---2---|2---2---2-------2---2---2---2---|2---2---2---2---0---0---0---0---|
A|--------2-------2-------3-------|2-------3-------3-------0-------|0-------0-------2-------2-------|
E|2-------0-------0-------3-------|0-------------------------------|3-------3-------3-------3-------|
  D       D   U   D       D   U    D   U   D       D   U   D   U    D   U   D   U   D   U   D   U

  G/F#            D/F#             D/F#    Em7             G/F#     Dsus4   Cadd9    (2:15, bar 70)
e|3---3---3-------2---2---2---2---|2---2---3---3---3---3---3---3---|3---3---3---------------3---3---|
B|3---3---3-------3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3---------------3---3---|
G|0---0---0-------2---2---2---2---|2---2---0---0---0---0---0---0---|2---2---0---------------0---0---|
D|0---0---0-------0---0---0---0---|0---0---2---2---2---2---0---0---|0---0---2---------------2---2---|
A|--------------------------------|--------2-------2---------------|--------3---------------3-------|
E|2-------2-------2-------2-------|2-------0-------0-------2-------|--------------------------------|
  D   U   D       D   U   D   U    D   U   D   U   D   U   D   U    D   U   D               D   U

  C/G                     Dsus4    Bm7     D/F#                     D/F#    Dsus4   Em7     C/G    (2:20, bar 73)
e|--------3---3---3---3---3---3---|2---2---2---2---2---2---2---2---|2-------3---3---3---3---3---3---|
B|--------3---3---3---3---3---3---|0---0---3---3---3---3---3---3---|3-------3---3---3---3---3---3---|
G|--------0---0---0---0---2---2---|2---2---2---2---2---2---2---2---|2-------2---2---0---0---0---0---|
D|--------2---2---2---2---0---0---|0---0---0---0---0---0---0---0---|0-------0---0---2---2---2---2---|
A|--------3-------3---------------|2-------------------------------|----------------2-------3-------|
E|--------3-------3---------------|--------2-------2-------2-------|2---------------0-------3-------|
          D   U   D   U   D   U    D   U   D   U   D   U   D   U    D       D   U   D   U   D   U

  C/G     Cadd9                    G                       Cadd9    G/F#            D/F#    (2:25, bar 76)
e|3---3---3-------3-------3---3---|3-------3-------3---3---3---3---|3---3---3-----------2---2---2---|
B|3---3---3-------3-------3---3---|3-------3-------3---3---3---3---|3---3---3-----------3---3---3---|
G|0---0---0-------0-------0---0---|0-------0-------0---0---0---0---|0---0---0-----------2---2---2---|
D|2---2---2-------2-------2---2---|0-------0-------0---0---2---2---|0---0---0-----------0---0---0---|
A|3-------3-------3-------3-------|2-------2-------2-------3-------|--------------------------------|
E|3-------------------------------|3-------3-------3---------------|2-------2---------------2-------|
  D   U   D       D       D   U    D       D       D   U   D   U    D   U   D           U   D   U

  G/F#    Em7     G                C/G             Cadd9            C/G     G               Dsus4    (2:31, bar 79)
e|3-------------------3---3---3---|3---3---3-------3---3---3---3---|3-------3---3---3---3---3---3---|
B|3-------------------3---3---3---|3---3---3-------3---3---3---3---|3-------3---3---3---3---3---3---|
G|0-------------------0---0---0---|0---0---0-------0---0---0---0---|0-------0---0---0---0---2---2---|
D|0-------------------0---0---0---|2---2---2-------2---2---2---2---|2-------0---0---0---0---0---0---|
A|------------------------2-------|3-------3-------3-------3-------|3-------2-------2---------------|
E|2-----------------------3-------|3-------3-----------------------|3-------3-------3---------------|
  D                   U   D   U    D   U   D       D   U   D   U    D       D   U   D   U   D   U

  G/F#    D/F#                     D/F#    Em7     G       Em7      Cadd9    (2:37, bar 82)
e|3---3---2-------2---2---2---2---|2-------3---3---3---3---3---3---|3---3---3-------3---3---3---3---|
B|3---3---3-------3---3---3---3---|3-------3---3---3---3---3---3---|3---3---3-------3---3---3---3---|
G|0---0---2-------2---2---2---2---|2-------0---0---0---0---0---0---|0---0---0-------0---0---0---0---|
D|0---0---0-------0---0---0---0---|0-------2---2---0---0---2---2---|2---2---2-------2---2---2---2---|
A|--------------------------------|--------2-------2-------2-------|3-------3-------3-------3-------|
E|2-------2-------2-------2-------|2-------0-------3-------0-------|--------------------------------|
  D   U   D       D   U   D   U    D       D   U   D   U   D   U    D   U   D       D   U   D   U

  C/G     G                        G/F#                             G/F#    Em7    (2:42, bar 85)
e|3---3---3-------3---3---3---3---|3---3---3-------3---3---3-------|3---3---3---3-------3-----------|
B|3---3---3-------3---3---3---3---|3---3---3-------3---3---3-------|3---3---3---3-------3-----------|
G|0---0---0-------0---0---0---0---|0---0---0-------0---0---0-------|0---0---0---0-------0-----------|
D|2---2---0-------0---0---0---0---|0---0---0-------0---0---0-------|0---0---2---2-------2-----------|
A|3-------2-------2-------2-------|--------------------------------|--------2-----------------------|
E|3-------3-------3-------3-------|2-------2-------2-------2-------|2-------0-----------------------|
  D   U   D       D   U   D   U    D   U   D       D   U   D        D   U   D   U       U

  G       Dsus4   Cadd9            Dsus4           G                G    (2:47, bar 88)
e|3---3---3-------3---3---3-------|3---3---3---3---3-------3-------|3-------3-------3---3---3---3---|
B|3---3---3-------3---3---3-------|3---3---3---3---3-------3-------|3-------3-------3---3---3---3---|
G|0---0---2-------0---0---0-------|2---2---2---2---0-------0-------|0-------0-------0---0---0---0---|
D|0---0---0-------2---2---2-------|0---0---0---0---0-------0-------|0-------0-------0---0---0---0---|
A|2---------------3-------3-------|----------------2-------2-------|2-------2-------2-------2-------|
E|3-------------------------------|----------------3-------3-------|3-------3-------3-------3-------|
  D   U   D       D   U   D        D   U   D   U   D       D        D       D       D   U   D   U

  G       B7              Am7/G    D/F#    D       Em7              G               Dsus4   Cadd9    (2:53, bar 91)
e|3-------2---2---2---2---0---0---|2---2---2---------------3-------|3---3---3---3---3-------3---3---|
B|3-------0---0---0---0---1---1---|3---3---3---------------3-------|3---3---3---3---3-------3---3---|
G|0-------2---2---2---2---0---0---|2---2---2---------------0-------|0---0---0---0---2-------0---0---|
D|0-------1---1---1---1---2---2---|0---0---0---------------2-------|0---0---0---0---0-------2---2---|
A|2-------2-------2-------0-------|------------------------2-------|2-------2---------------3-------|
E|3-----------------------3-------|2-----------------------0-------|3-------3-----------------------|
  D       D   U   D   U   D   U    D   U   D               D        D   U   D   U   D       D   U

  Cadd9                            D                                G/B     Cadd9   G/B     Am7    (2:58, bar 94)
e|3---3-------3---3---3---3---3---|2---2---2-----------2---2---2---|3-------3---3---3---3---0-------|
B|3---3-------3---3---3---3---3---|3---3---3-----------3---3---3---|3-------3---3---3---3---1-------|
G|0---0-------0---0---0---0---0---|2---2---2-----------2---2---2---|0-------0---0---0---0---0-------|
D|2---2-------2---2---2---2---2---|0---0---0-----------0---0---0---|0-------2---2---0---0---2-------|
A|3---------------3-------3-------|--------------------------------|2-------3-------2-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U       U   D   U   D   U    D   U   D           U   D   U    D       D   U   D   U   D

  D                       G        G               Cadd9   Am7      Em7     C/G             Dsus4    (3:03, bar 97)
e|----2---2-------2---2-------3---|3---3---3---3-------3---0-------|3---------------3---3---3---3---|
B|----3---3-------3---3-------3---|3---3---3---3-------3---1-------|3---------------3---3---3---3---|
G|----2---2-------2---2-------0---|0---0---0---0-------0---0-------|0---------------0---0---2---2---|
D|----0---0-------0---0-------0---|0---0---0---0-------2---2-------|2---------------2---2---0---0---|
A|--------------------------------|2-------2---------------0-------|2---------------3---------------|
E|--------------------------------|3-------3-----------------------|0---------------3---------------|
      U   D       D   U       U    D   U   D   U       U   D        D               D   U   D   U

  Cadd9                            Cadd9   G               Am7      Dsus4   G/F#    (3:09, bar 100)
e|3---3---3-------3---3---3---3---|3---3---3-----------------------|3---3---3---3---3-------3---3---|
B|3---3---3-------3---3---3---3---|3---3---3-----------------------|3---3---3---3---3-------3---3---|
G|0---0---0-------0---0---0---0---|0---0---0-----------------------|2---2---0---0---0-------0---0---|
D|2---2---2-------2---2---2---2---|2---2---0-----------------------|0---0---0---0---0-------0---0---|
A|3-------3-------3-------3-------|3-------2-----------------------|--------------------------------|
E|--------------------------------|--------3-----------------------|--------2-------2-------2-------|
  D   U   D       D   U   D   U    D   U   D                        D   U   D   U   D       D   U

  D/F#            Em7              C/G                     Cadd9    Cadd9           Dsus4   G    (3:14, bar 103)
e|2-------2---2---3-----------3---|3---3---3---3-------3---3-------|3-------3---3---3-------3---3---|
B|3-------3---3---3-----------3---|3---3---3---3-------3---3-------|3-------3---3---3-------3---3---|
G|2-------2---2---0-----------0---|0---0---0---0-------0---0-------|0-------0---0---2-------0---0---|
D|0-------0---0---2-----------2---|2---2---2---2-------2---2-------|2-------2---2---0-------0---0---|
A|----------------2---------------|3-------3---------------3-------|3-------3---------------2-------|
E|2-------2-------0---------------|3-------3-----------------------|------------------------3-------|
  D       D   U   D           U    D   U   D   U       U   D        D       D   U   D       D   U

  G                                G       Am7/G   Dsus4            Em7     C/G    (3:20, bar 106)
e|----3-------------------3---3---|------------------------3-------|--------3-------3---3---3-------|
B|----3-------------------3---3---|------------------------3-------|--------3-------3---3---3-------|
G|----0-------------------0---0---|------------------------2-------|--------0-------0---0---0-------|
D|----0-------------------0---0---|------------------------0-------|--------2-------2---2---2-------|
A|------------------------2-------|--------------------------------|--------3-------3-------3-------|
E|------------------------3-------|--------------------------------|--------3-------3-------3-------|
      U                   D   U                            D                D       D   U   D

  B7      D/F#    (3:25, bar 109)
e|2-----------2---2---------------|
B|0-----------3---3---------------|
G|2-----------2---2---------------|
D|1-----------0---0---------------|
A|2-------------------------------|
E|----------------2---------------|
  D           U   D
```

</details>

### 006

All three agree on standard tuning, no capo and G major.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-006.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">2:11</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-006.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-006.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 2:14</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-006.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 2:15</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 006</summary>

<!-- REVIEW before publishing: this file's automatic transcript names a person. -->

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20210210_164830.mp4
Source: videos/2026-08-14_006.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 131.42 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: 0; visual confidence high. No capo visible in sampled frames
Likely sounding key: G major? (moderate confidence; automatic note-profile estimate)
Provisional classification: keeper candidate
Reason: Long, substantially continuous musical material without a detected explicit restart. Completion/intent remains PROVISIONAL; it needs listening review.
Main loop, chord SHAPES relative to capo assumption: G? -> Csus2?

IMPORTANT LIMITATIONS
This is a machine-assisted first-draft pitch/harmony sketch, NOT a verified
note-for-note tablature or proof of the original tuning/fingering. All chord
labels/finger positions are provisional (?). Source contains voice/noise;
some detected notes may be sung pitches or harmonics. A key estimate is NOT
a tuning diagnosis. Do not retune to a guessed alternate tuning.
If capo is unresolved, this file assumes fret 0 for its draft positions.
If tuning differs from standard, string/fret placement must be revised.

CHORD CHART / MAIN HARMONIC MATERIAL
Most repeated estimated pattern: G? -> Csus2?
Common estimated sounding sonorities (time-weighted, NOT a progression): G?, Em?, Gsus2?, Csus2?, Dsus2?, C?, Em7?, F#sus4?

Approximate estimated changes in the first 90 seconds:
     9.8–  12.0 s: C? shape / C? sounding
    12.0–  14.2 s: Em? shape / Em? sounding
    15.0–  16.5 s: F#m? shape / F#m? sounding
    16.5–  25.5 s: Em? shape / Em? sounding
    25.5–  27.0 s: Em7? shape / Em7? sounding
    27.0–  28.5 s: Am? shape / Am? sounding
    28.5–  30.8 s: Gsus2? shape / Gsus2? sounding
    31.5–  33.8 s: G? shape / G? sounding
    33.8–  35.2 s: Csus2? shape / Csus2? sounding
    36.0–  38.2 s: Dsus4? shape / Dsus4? sounding
    39.0–  44.2 s: G? shape / G? sounding
    45.0–  46.5 s: F#sus4? shape / F#sus4? sounding
    46.5–  48.0 s: Em7? shape / Em7? sounding
    48.0–  49.5 s: C? shape / C? sounding
    49.5–  52.5 s: G? shape / G? sounding
    52.5–  54.0 s: F#sus4? shape / F#sus4? sounding
    54.0–  56.2 s: Gm? shape / Gm? sounding
    56.2–  57.8 s: C? shape / C? sounding
    57.8–  59.2 s: Gsus2? shape / Gsus2? sounding
    59.2–  60.8 s: F#sus4? shape / F#sus4? sounding
    61.5–  63.0 s: Em7? shape / Em7? sounding
    63.8–  66.0 s: Gsus2? shape / Gsus2? sounding
    66.0–  67.5 s: F#m? shape / F#m? sounding
    67.5–  71.2 s: Csus2? shape / Csus2? sounding
    71.2–  73.5 s: Gsus2? shape / Gsus2? sounding
    74.2–  75.8 s: Esus2? shape / Esus2? sounding
    76.5–  78.0 s: Csus2? shape / Csus2? sounding
    78.0–  81.0 s: Gsus2? shape / Gsus2? sounding
    82.5–  84.0 s: Em? shape / Em? sounding
    84.0–  85.5 s: Cmaj7? shape / Cmaj7? sounding
    85.5–  88.5 s: G? shape / G? sounding

SOURCE-PITCH ASCII SKETCHES — ALL STRING ASSIGNMENTS UNCERTAIN (?)
These show actual model-detected onset pitches mapped to playable standard-
tuning positions; not a generic invented fingerpicking pattern. Each cell
is 0.5 s; simultaneous/repeated fast notes are reduced. Dashes are not proof
of silence. Positions favor low frets and may differ from the hand in video.
Fret numbers are relative to the capo assumption. Rhythm/voice separation
and fast ornaments are unresolved; use these only as play-along prompts.

Excerpt 10.0–26.0 s (?)
e |-----------------------------0---0-----0---------0-----0---0-3-3|
B |---0---0-----0-------------0-3---------0-0---0---0-------0-0---3|
G |-0-------------0-------0---------0-----0-0-0-0-----------0-0----|
D |-------------------------------------2-2-2-----------------5----|
A |-----3-------0-------0---------------3--------------------------|
E |-------------3-------2--------------12-------3-------3----------|

Excerpt 57.7–73.7 s (?)
e |-------------------0-------------------------3------------------|
B |---0-3-----------3-3---3---------3-----------3-3-----------3---0|
G |-2-4-4-----------7-------2-----2---2---------0---------------2-2|
D |-------------2---5-2-------------------0-------2-----0----------|
A |-----------------------3---------------5---------3---5----------|
E |-------2-2-2---------------3-------2-2-------------------3---3-2|

TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)
Do not rely on these as accurate lyrics or authorship evidence.
  0.0 s: When I feel blue, A, what's up?
  3.0 s: So girl, Emma, that's Emma Dobran.
  6.0 s: Aaron on the strings.
  11.0 s: That was really tough.
  13.0 s: Yeah.

KEY/TUNING EVIDENCE
Profile correlations (not probabilities): G major r=0.947, E minor r=0.747, D major r=0.694
Strong lower detected pitches: G3 (12.9), G2 (7.0), D3 (6.9), C3 (5.5), F♯2 (5.0), E3 (4.1), A2 (1.6), E2 (1.4)
Low-note support is not enough to identify every open string. Tuning left
unresolved instead of falsely declaring standard, DADGAD, or an open tuning.

CONDITIONAL CHORD GRIPS — STANDARD-TUNING ARRANGEMENT OPTIONS (?)
Low E to high e; all numbers relative to the stated capo assumption.
These are suggested playable grips, NOT observed source fingering.
G? : 3 2 0 0 0 3
Csus2? : x 3 5 5 3 3
Em? : 0 2 2 0 0 0
Gsus2? : x 10 12 12 10 10
If the actual tuning differs, these grips are not the original arrangement.
```

</details>

<details><summary>Blind Opus 5.5's tab for 006</summary>

```text
Song 06 - fingerpicked ballad in G: G | G/F# | Em7 | Cadd9 (title unknown)
==========================================================================
Source: song06.mp4
Instrument: steel
Tuning: Standard E A D G B E  [MIDI 40 45 50 55 59 64]
Capo: 0 (none)
Key: G major (relative E minor); intro uses Cmaj7, F#m7, A7sus4 colours; later section vi-IV-V (Em7-C-D)
Time: 4/4
Tempo: 133 (quarter = fingerpicked 8th-note pulse; ~66 BPM if felt in half-time); slows to ~110-120 after 1:44
Grid: 16   (one tab column = 1/16 note)
Pitch offset: -1 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Style: fingerpicked (thumb on bass strings, fingers on G/B/e), open position, hammer-on ornaments (G 0h2, B 1h3)
Confidence: overall MEDIUM.  Tuning HIGH (standard, -1 cent; open shapes in video) | Capo HIGH (none, nut
  visible) | Key HIGH (G major) | Main-loop chords HIGH (G/F# vs D/F# medium) | Intro & 2nd-part chords
  MEDIUM-LOW | Meter/tempo MEDIUM (8th-note pulse ~133 BPM; may be felt as 66) | Note-for-note tab LOW-MEDIUM

How this was made: guitar isolated from the singer with Demucs, notes transcribed with basic-pitch,
beats/bars from madmom, chords checked against pitch content and the video (open position, no capo,
thumb fretting the F# bass).  String/fret choice by a playability optimiser with the chord shapes below.
Clean-up: octave ghosts and vocal residue removed; in the main loop the picking-pattern notes that occur
in >= 6 of the 8 repetitions were filled in where the singing masked them.  Treat single notes as approximate.

Basic loop pattern (illustration only - 8th notes, one chord per bar; not part of the timed tab):
     G                 G/F#              Em7               Cadd9
  e :- - - - - - - - : - - - - - - - - : 3 - - - - - - 0 : - - - - 0 - - - :
  B :- - 0 - - - - 0 : - - - - 0 - - - : - 3 - 3 - 3 - - : 1 - - - - - 1 - :
  G :0 2 - 2 - 2 - - : - - - 2 - 0 - - : - - 0 - - - - - : - - 0 2 - 0 - - :
  D :- - - - 0 - - - : - - - - - - 0 - : 2 - - - 2 - 2 - : - - - - - - - - :
  A :- - - - - - - - : - - - - - - - - : - - - - - - - - : 3 - 3 - 3 - - - :
  E :3 - - - - - 3 - : 2 - 2 - - - - - : - - - - - - - - : - - - - - - - 3 :
     (thumb: G2 / F#2 / E3 / C3 on the beats; G-string 0h2 and B-string 1h3 hammer-ons are frequent)

Chord progression (time in video -> chord)
  0:08.72 G6  |  0:11.04 Cmaj7  |  0:13.00 G6  |  0:15.36 F#m7  |  0:16.20 Em  |  0:17.26 A7sus4
  0:19.21 C/E  |  0:19.69 Em  |  0:21.19 G6  |  0:25.27 Em7  |  0:27.15 Cadd9  |  0:28.98 G
  0:30.83 G/F#  |  0:32.61 Em7  |  0:34.46 Cadd9  |  0:36.25 G  |  0:38.10 G/F#  |  0:39.84 Em7
  0:41.64 Cadd9  |  0:43.40 G  |  0:45.16 G/F#  |  0:46.88 Em7  |  0:48.68 Cadd9  |  0:50.48 G
  0:52.20 G/F#  |  0:53.91 Em7  |  0:55.72 Cadd9  |  0:57.59 G  |  0:59.35 G/F#  |  1:01.07 Em7
  1:02.88 Cadd9  |  1:04.66 G  |  1:06.48 G/F#  |  1:08.27 Em7  |  1:10.08 Cadd9  |  1:11.87 G
  1:13.67 G/F#  |  1:15.41 Em7  |  1:17.22 Cadd9  |  1:19.02 G  |  1:20.78 G/F#  |  1:22.55 Em7
  1:24.34 Cadd9  |  1:26.15 G  |  1:29.71 Em7  |  1:31.45 Cadd9  |  1:33.23 G  |  1:35.50 N.C.
  1:44.66 Em7  |  1:46.44 C  |  1:47.15 D  |  1:51.49 Em7  |  1:53.38 C  |  1:53.86 D
  1:55.83 C  |  1:56.06 D  |  1:59.58 Em7  |  2:01.11 A7sus4  |  2:01.88 Em7  |  2:03.03 G
  2:04.40 Cadd9  |  2:05.42 D  |  2:06.44 C  |  2:09.42 Em7

By section:
  Intro/verse 1 (0:06-0:28): G6 | Cmaj7 | G6 | F#m7 Em | A7sus4 | C/E Em | G6 | G6 | Em7 | Cadd9
  Main loop     (0:29-1:26): | G | G/F# | Em7 | Cadd9 |  x8   (I - I/7 - vi7 - IVadd9, descending bass G-F#-E-C)
  Ending        (1:26-1:35): | G | G | Em7 | Cadd9 | G (ring)
  [pause / talking 1:35-1:44]
  Second part   (1:44-2:11): Em7 | C D | D | Em7 | C D | C D | Em7 | A7sus4 Em7 | G | Cadd9 D | C | Em7   (vi
    - IV - V)

Chord shapes used (lowest -> highest string, x = not played):
  G6: 3 x 2 0 0 0   Cmaj7: x 3 2 0 0 0   F#m7: 2 0 2 2 2 0   Em: 0 2 2 0 0 0   A7sus4: x 0 2 0 3 0   C/E: 0 3
    2 0 1 0   Em7: 0 2 2 0 3 3   Cadd9: x 3 0 0 1 0   G: 3 2 0 0 0 3   G/F#: 2 x 0 0 0 3   C: x 3 2 0 1 0   D:
    x x 0 2 3 2

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

[Intro / verse 1  (singing enters ~0:11)]
@ 0:06.40
                                   G6                               Cmaj7                            G6
e|--------------------------------|0-------------0-------0---0---0-|--------------0-----0-----------|------------0-------------------|
B|--------------------------------|------------------------------0-|------0-------0-----0-------0---|----0-0---0-----0-----0---------|
G|--------------------------------|0-------0-----0-----0-------0---|----0-----0---------0-----------|0-----0---0-------------0-------|
D|----------------------2-----2---|--2-----2-----2-----2---------2-|--------2-----------2-------2---|----2-2---2-----2-------2-------|
A|--------------------------------|--------------------------------|3-------3-----------------------|------0-----------------0-------|
E|0-------------------------------|3-----------------3-----------0-|------------------------------0-|3-----3-----3-------3-----------|

@ 0:15.36
  F#m7          Em                 A7sus4                           C/E     Em                       G6
e|------------0---------------0---|0-------0-----0-----------------|----0---0-----------------------|------------0-------0-----------|
B|--------------0-------0---------|3---------------------------0---|------------0---------------0---|--------------0-----------------|
G|------------------0-----0-------|--------0-----0---------0-----0-|--------0---0-------0---0---0---|--------------------0-----------|
D|2-------2-----------2-------2---|2---------0---------2---2---2---|--------2-----------2-------2---|--------------2---------2-------|
A|0-------------0-----------------|0-------0-----------0-----------|3-------------------------------|--------------------------------|
E|2---------2---------------------|--0-----3---------3-----------0-|--------0---0-------0---------0-|3-----3-----------------------3-|

@ 0:23.24
                                   Em7                              Cadd9
e|--0---------0-----------0-------|3-------3---------3---------0---|--------------------------0-----|
B|------------0-------0-------0---|----3---3---3---3---3-------3---|--------------------------------|
G|0-----------0-------0---0-------|----------------0---0-------0---|--------0---2-------2-----------|
D|------2-----2-------2-------2---|2-----------------------2-0-----|------0-------------------------|
A|--------------------------------|--------------------------------|3-------3---------------3-------|
E|--------3-------------3---------|--0-------------3---------------|--------------------------------|

[Main loop  G | G/F# | Em7 | Cadd9  (8 times, with vocals)]
@ 0:28.98
  G                                G/F#                             Em7                              Cadd9
e|--------------------------------|--------------------------------|--------3-------------------0---|----------------0---------------|
B|--3-----------------3-------0---|----------------0---------------|----3-------3---3---3-----------|3-------------------------------|
G|0-----------2-------------------|--------------------0-----------|0-------0-----0---------------0-|------0-----2-------2-----------|
D|----0-----------0---------------|------------------0-------------|2---------------2-------2-0-2---|------------0-------2-----------|
A|----------------------------2---|--------------------------------|--------------------------------|3-------3---------------3-------|
E|3-------3---------------3-------|2-------2-----------------------|----------------3---------------|--------------------------------|

@ 0:36.25
  G                                G/F#                             Em7                              Cadd9
e|--------------------------------|--------------------------------|--------3-------------------0---|----------------0---------------|
B|--------3-----------3-------0---|------------0-----3-------------|----3-------3-------3-----------|3-----------3-------------------|
G|0---2-------2-------2-----------|--------------------0-----------|--------------0-----0-----------|--------------------------------|
D|------------------0-0-----------|------------------0-------------|2---------------2-------2---2---|----------------0---------------|
A|--------------------------------|--------------------------------|--------------------------------|3-------------------------------|
E|3-----------------------3-------|2-------2-------------3---------|0-------------3-----------------|--------------------------------|

@ 0:43.40
  G                                G/F#                             Em7                              Cadd9
e|--------------------------------|--------------------------------|--------0-------------------0---|--------------------------------|
B|--------0-------0---0-3-----0---|----------------0---------------|0---3-------3-------3-----------|1-3---------1-------------------|
G|0-----------2-------------------|--------------------0-----------|------------0---------------0---|------------2---2---0-----------|
D|0-----------0---------0-----0---|--------------------------------|2---2-----------2-------2-0-2---|--------------------------------|
A|--------------------------------|--------------------------------|--------------------------------|3---------------------3---------|
E|3-----------------------------2-|--------2-----------------------|0-------------3-----------------|--------------------------------|

@ 0:50.48
  G                                G/F#                             Em7                              Cadd9
e|--------------------------------|--------------------------------|--------3-------------------0---|--------------------------------|
B|--------0-------0---------0-----|--------------------------------|----3-------3-------3-------3---|1-------------------------------|
G|0-----------2-------2-------0---|--------------------------------|0-------0-----0-----------------|0-------0-----------------------|
D|----------------0---------------|------------------0-------------|2---------------2-------2-0-2---|----------------2---------------|
A|--------------------------------|--------------------------------|--------------------------------|3-------3-------3---3-----3-----|
E|3-----------------------------3-|2---------2---------2-----------|--------------------------------|------------------------------3-|

@ 0:57.59
  G                                G/F#                             Em7                              Cadd9
e|--------------------------------|--------------------------------|--3-----3-------------------0---|--------------------------------|
B|----0-------0-------0-------0---|------------------------0-------|----3-------3---3---3-----------|1-----------3---3-------1-------|
G|2-----------2-------------------|--------------------------------|----------0-----------------0---|--------0-----------2-----------|
D|--------------------------------|--------------------------------|2-----------------------2---2---|------------------0-------------|
A|--------------------------------|--------------------------------|--------------------------------|3-------3-----------------------|
E|--------------------------------|2-------2-----------2-----------|------------3-------------------|--------------------------------|

@ 1:04.66
  G                                G/F#                             Em7                              Cadd9
e|----------------0---------------|--------------------------------|------------------3---------0---|------------------0-------------|
B|0-------0-----------0-3-------3-|------------0---0---------------|----3---3---3-------3-----------|3-----------------------1-------|
G|0-----------2-------------------|--------------------0-----------|0---0-----0-----0---------------|0-------0-----------------------|
D|------------0---------0---------|----------------------0---------|2-----------------------2-0-2---|----------0-----0---0-----------|
A|--------------------------------|--------------------------------|--------------------------------|3-------3-------3-------3-------|
E|3-------------------------------|2-------2-----------------3-----|------------3-------------3-----|--------------------------------|

@ 1:11.87
  G                                G/F#                             Em7                              Cadd9
e|--------------------------------|--------------------------------|--------0-------------------0---|--------------------------------|
B|--------------------------------|------------0---------------0---|----3-------3-------3-----------|1-------------------------------|
G|0-----------2-------2-------2---|--------------------2-----------|------------0---------0---------|----0-------2-------0-----------|
D|----0---0---0-------------------|--------------------------------|2-----2-------2-----2---2-------|--------------------------------|
A|--------------------------------|--------------------------------|--------------------------------|3---------------3---------------|
E|3-----------------------3-------|2-------2---------------2-------|------0-------------------------|--------------------------------|

@ 1:19.02
  G                                G/F#                             Em7                              Cadd9
e|--------------------------------|--------------------------------|------------0-------3-------0---|----------------------0---------|
B|--------0-----------------------|--------------------------------|----3---3---3-------5-------0---|1-------3---3-------3-------3---|
G|0-----------2-------0-2-----0---|0-----------0-------------------|--------------------------------|--------------------0-----------|
D|--------------------------------|------------------0-------------|2-----------2-----------2-------|----------------------------0---|
A|--------------------------------|--------------------------------|--------------------------------|3-------------------------------|
E|3-------------------------------|2-------2-----------------------|----0---------------------------|--------------3---------------3-|

[Ending of the first take  G | G | Em7 | Cadd9 | G (let ring)]
@ 1:26.15
  G                                                                 Em7                              Cadd9
e|--------------------------------|--------------------------------|----------------------------0---|--------------------------------|
B|--------0-------0---------------|3-------0---------0-------------|--------0-------0---0-3---------|--------------------------------|
G|------------2-----0-------------|0-----------2-----0-------------|0---2-------2-------------------|------------2-------0-------0---|
D|--------------------------------|--------------------------------|2---------2-----2---------------|--------------------------------|
A|--------------------------------|--------------------------------|--------------------------------|3-------------------------------|
E|----------------------------3---|--------------------------------|--------------------------------|----------------------------3---|

@ 1:33.23
  G
e|3-------------------------------|
B|0-------------------------------|
G|0-------------------------------|
D|0-------------------------------|
A|2-------------------------------|
E|3-------------------------------|

[Pause - talking, no guitar (1:35-1:44)]
@ 1:34.98
          N.C.
e|--------------------------------|--------------------------------|--------------------------------|--------------------------------|
B|--------------------------------|--------------------------------|--------------------------------|--------------------------------|
G|--------------------------------|--------------------------------|--------------------------------|--------------------------------|
D|--------------------------------|--------------------------------|--------------------------------|--------------------------------|
A|--------------------------------|--------------------------------|--------------------------------|--------------------------------|
E|--------------------------------|--------------------------------|--------------------------------|--------------------------------|

@ 1:42.82
 
e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--------------------------------|
E|--------------------------------|

[Second part - slower, free time (Em7 - C - D ...)]
@ 1:44.67
  Em7                              C           D
    Em7
e|3-------3-------------------0---|--------------------------------|--------------------------------|------------------------3-------|
B|------3-----3-------3-------3---|--------1---------------------3-|--------------3-----------------|----------------------------3---|
G|------------0---0---0-------0---|------------2-----------------2-|----2-------2-------------------|--------------------------------|
D|2---------------2-------2---2-0-|--------------------0-------0---|--0---------0-------------------|------------------------2-------|
A|--------------------------------|3-----3-------0-----------------|--------------0-----------------|--------------------------------|
E|--------------3-------3---------|--------------------------------|--------------------------------|--------------------------------|

@ 1:51.97
                          C        D                             C    D
                            Em7
e|3-------------------0-----------|--------------------------------|------------------0-------------|--------------------------------|
B|------3-----3-------------------|--------------------------------|----------------3---------------|----------------------------3---|
G|----------0---------------------|2---------2---------------------|----------------2---------------|--------------------------0---0-|
D|----------------2---2-----------|0---------0---------0-----------|0-------0-------0---------------|--------------------------2-----|
A|------------------------3-------|------0-----0-----------0-------|----------0-------0-------------|--------------------------------|
E|--------------------------------|--------------------------------|--------------------------------|--------------------------------|

@ 1:59.98
                  A7sus4    Em7                G                    Cadd9           D                C
e|--------------------------------|3-----------3---3-----0---------|0-------0-----------------------|0-------------------------------|
B|------3---------3---------------|------------3---3-------------3-|--------------------------------|3-------------------------------|
G|----------------0---------0-----|------------0---0-----0-------0-|------------------------------2-|--------------------------------|
D|----------------2---------2-----|----2-----------------2-------0-|------0-----------------------0-|----------------------------0---|
A|----------------0---------------|--------------------------------|3-----3-------------------------|----------------3-------3---3---|
E|--3-------3-------0-------------|--0---------3-----3-------------|--------------------------------|----------------3-----------0---|

@ 2:08.53
              Em7
e|--------0-----0---0-------------|
B|----1-----------3---------------|
G|------------0---0---------------|
D|--------------------------2-----|
A|--------------------------------|
E|----0---0-----3-----------------|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 006</summary>

```text
====================================================================================================
 song06 - outdoor duo, strummed song in G major / E minor (one take, discussion, short restart)
====================================================================================================
 Source        : song06.mp4 (2:11), same duo and guitar as song05: one strums, the other sings
                 (vocals not transcribed). The take ends at ~1:35, they discuss the arrangement,
                 then restart at ~2:00.
 Tuning        : Standard E A D G B E; in tune (-4 cents)
 Capo          : none (hand at the nut in the video, open-position voicings)
 Key           : G major, with an E-minor intro (B7 -> Em7)
 Tempo / feel  : 4/4, q = ~132 counted in 8ths (66-bpm feel with 16th strumming)
 Progression   : Intro: | G/B  Cadd9 | Am7/G  D | B7  Em7 | Em7  G/B | Em7  C/G | Dsus4  Em7 | Cadd9
                 Em7 | Am7  D/F# | B7  Am7  Em7 |
                 Song: | G | G  Em7  C/G | Em7  G | Dsus4  Cadd9 | Am7/G  G | G/F#  Dsus4 | C/G  G |
                 Cadd9  Am7 | Am7/G  Dsus4 | G/F#  G |  (same anchored voicings as song05)
 Structure     : Intro 0:00-0:21 - song 0:21-1:35 - discussion 1:35-2:00 (one empty bar) - restart
                 2:00-2:11.
 Confidence    : Key HIGH, tuning/capo HIGH. Chords MEDIUM-LOW (singer over the guitar; HMM per beat
                 with bass weighting). Strum rhythm MEDIUM. Section boundaries HIGH (loudness + talk
                 detection).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   G            3 2 0 0 3 3
   G/F#         2 x 0 0 3 3              thumb on F#
   G/B          x 2 0 0 3 3
   Em7          0 2 2 0 3 3
   Cadd9        x 3 2 0 3 3
   C/G          3 3 2 0 3 3
   Dsus4        x x 0 2 3 3
   D/F#         2 x 0 2 3 2
   D            x x 0 2 3 2
   Am7          x 0 2 0 1 0
   Am7/G        3 0 2 0 1 0
   B7           x 2 1 2 0 2
   Bm7          x 2 0 2 0 2
----------------------------------------------------------------------------------------------------
 Strum tab: one column per strum (D = down, U = up) on an 8th-note grid at q~132.
 Down-strums hit all strings shown, up-strums the top 3-4 strings. Chords may change on any beat.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: standard / capo 0 / G major right and the 'rehearsal' triage is fair (there
                 is a discussion). Its chart has wrong/odd chords (Cmaj7, D#5, Gadd9, F#sus4, Asus4
                 ...) from vocal leakage, it misses the B7 -> Em7 intro and the G-F#-E bass walk,
                 and its tab keeps notes from the talking section. I rebuilt the chords per beat
                 (HMM with bass weighting), wrote a strum tab, and left the discussion empty.
====================================================================================================


[Intro (minor feel): Em7 - B7 - Em7 - Cadd9 - Am7 - D/F#]
  G/B     Cadd9                    Am7/G                   D        D       B7      Em7     B7    (0:00, bar 1)
e|3---3---3---3-----------3---3---|0---0---0-------0---0---2-------|2-------2---2---3---3---2-------|
B|3---3---3---3-----------3---3---|1---1---1-------1---1---3-------|3-------0---0---3---3---0-------|
G|0---0---0---0-----------0---0---|0---0---0-------0---0---2-------|2-------2---2---0---0---2-------|
D|0---0---2---2-----------2---2---|2---2---2-------2---2---0-------|0-------1---1---2---2---1-------|
A|2-------3---------------3-------|0-------0-------0---------------|--------2-------2-------2-------|
E|--------------------------------|3-------3-------3---------------|----------------0---------------|
  D   U   D   U           D   U    D   U   D       D   U   D        D       D   U   D   U   D

  B7      Em7             G/B      Em7             C/G     Em7      Dsus4   C/G     Em7    (0:05, bar 4)
e|2-----------3-----------3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
B|0-----------3-----------3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
G|2-----------0-----------0---0---|0---0---0---0---0---0---0---0---|2---2---0---0---0---0---0---0---|
D|1-----------2-----------0---0---|2---2---2---2---2---2---2---2---|0---0---2---2---2---2---2---2---|
A|2-----------------------2-------|2-------2-------3-------2-------|--------3-------2-------2-------|
E|--------------------------------|0-------0-------3-------0-------|--------3-------0-------0-------|
  D           U           D   U    D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U

  Cadd9           Em7              Em7     Am7/G                    Am7             D/F#    (0:11, bar 7)
e|3---3---3---3---3---3---3---3---|3---3---0-------0---0---0---0---|0---0---0-------2---2---2---2---|
B|3---3---3---3---3---3---3---3---|3---3---1-------1---1---1---1---|1---1---1-------3---3---3---3---|
G|0---0---0---0---0---0---0---0---|0---0---0-------0---0---0---0---|0---0---0-------2---2---2---2---|
D|2---2---2---2---2---2---2---2---|2---2---2-------2---2---2---2---|2---2---2-------0---0---0---0---|
A|3-------3-------2-------2-------|2-------0-------0-------0-------|0-------0-----------------------|
E|----------------0-------0-------|0-------3-------3-------3-------|----------------2-------2-------|
  D   U   D   U   D   U   D   U    D   U   D       D   U   D   U    D   U   D       D   U   D   U

  D/F#    B7      Am7     Em7      C/G     Am7     Em7              Em7    (0:16, bar 10)
e|2---2---2---2---0---0---3-------|3---3---0---0---3-------3-------|3-------3-------3---3---3---3---|
B|3---3---0---0---1---1---3-------|3---3---1---1---3-------3-------|3-------3-------3---3---3---3---|
G|2---2---2---2---0---0---0-------|0---0---0---0---0-------0-------|0-------0-------0---0---0---0---|
D|0---0---1---1---2---2---2-------|2---2---2---2---2-------2-------|2-------2-------2---2---2---2---|
A|--------2-------0-------2-------|3-------0-------2-------2-------|2-------2-------2-------2-------|
E|2-----------------------0-------|3---------------0-------0-------|0-------0-------0-------0-------|
  D   U   D   U   D   U   D        D   U   D   U   D       D        D       D       D   U   D   U


[Song: G - Em7 - C/G - Dsus4 - Cadd9 - Am7/G - G - G/F# (bass walks G - F# - E)]
  G                                G               Em7     C/G      C/G     Em7     G    (0:21, bar 13)
e|3-----------3-----------3-------|3-----------3---3-------3---3---|3-------3---3---3---3---3---3---|
B|3-----------3-----------3-------|3-----------3---3-------3---3---|3-------3---3---3---3---3---3---|
G|0-----------0-----------0-------|0-----------0---0-------0---0---|0-------0---0---0---0---0---0---|
D|0-----------0-----------0-------|0-----------0---2-------2---2---|2-------2---2---0---0---0---0---|
A|2-----------------------2-------|2---------------2-------3-------|3-------2-------2-------2-------|
E|3-----------------------3-------|3---------------0-------3-------|3-------0-------3-------3-------|
  D           U           D        D           U   D       D   U    D       D   U   D   U   D   U

  Dsus4   Cadd9                    Am7/G   G                        G/F#                    Dsus4    (0:26, bar 16)
e|3---3---3---3---3---3---3---3---|0-------3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
B|3---3---3---3---3---3---3---3---|1-------3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
G|2---2---0---0---0---0---0---0---|0-------0---0---0---0---0---0---|0---0---0---0---0---0---2---2---|
D|0---0---2---2---2---2---2---2---|2-------0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|
A|--------3-------3-------3-------|0-------2-------2-------2-------|--------------------------------|
E|--------------------------------|3-------3-------3-------3-------|2-------2-------2---------------|
  D   U   D   U   D   U   D   U    D       D   U   D   U   D   U    D   U   D   U   D   U   D   U

  Dsus4   C/G     G                Cadd9           Am7              Am7/G           Dsus4    (0:32, bar 19)
e|3---3---3---3---3---3---3---3---|3---3---3-------0---0---0---0---|0---0---0---0---3---3---3---3---|
B|3---3---3---3---3---3---3---3---|3---3---3-------1---1---1---1---|1---1---1---1---3---3---3---3---|
G|2---2---0---0---0---0---0---0---|0---0---0-------0---0---0---0---|0---0---0---0---2---2---2---2---|
D|0---0---2---2---0---0---0---0---|2---2---2-------2---2---2---2---|2---2---2---2---0---0---0---0---|
A|--------3-------2-------2-------|3-------3-------0-------0-------|0-------0-----------------------|
E|--------3-------3-------3-------|--------------------------------|3-------3-----------------------|
  D   U   D   U   D   U   D   U    D   U   D       D   U   D   U    D   U   D   U   D   U   D   U

  G/F#                    G        G       C/G                      Em7     Cadd9           Dsus4    (0:37, bar 22)
e|3---3---3---3---3---3---3---3---|3-------3---3---3---3---3---3---|3---3---3---3-------3---3-------|
B|3---3---3---3---3---3---3---3---|3-------3---3---3---3---3---3---|3---3---3---3-------3---3-------|
G|0---0---0---0---0---0---0---0---|0-------0---0---0---0---0---0---|0---0---0---0-------0---2-------|
D|0---0---0---0---0---0---0---0---|0-------2---2---2---2---2---2---|2---2---2---2-------2---0-------|
A|------------------------2-------|2-------3-------3-------3-------|2-------3-----------------------|
E|2-------2-------2-------3-------|3-------3-------3-------3-------|0-------------------------------|
  D   U   D   U   D   U   D   U    D       D   U   D   U   D   U    D   U   D   U       U   D

  G                       Am7      G/F#                    Em7      Em7                     C/G    (0:43, bar 25)
e|--------3---3---3---3---0---0---|3---3---3-------3---3-------3---|--------3---3---3---3---3---3---|
B|--------3---3---3---3---1---1---|3---3---3-------3---3-------3---|--------3---3---3---3---3---3---|
G|--------0---0---0---0---0---0---|0---0---0-------0---0-------0---|--------0---0---0---0---0---0---|
D|--------0---0---0---0---2---2---|0---0---0-------0---0-------2---|--------2---2---2---2---2---2---|
A|--------2-------2-------0-------|--------------------------------|--------2-------2-------3-------|
E|--------3-------3---------------|2-------2-------2---------------|--------0-------0-------3-------|
          D   U   D   U   D   U    D   U   D       D   U       U            D   U   D   U   D   U

  Cadd9                            G                       Dsus4    G/F#    (0:48, bar 28)
e|3---3---3-------3---3---3---3---|--------3---3---3---3---3---3---|3---3---3-------3-----------3---|
B|3---3---3-------3---3---3---3---|--------3---3---3---3---3---3---|3---3---3-------3-----------3---|
G|0---0---0-------0---0---0---0---|--------0---0---0---0---2---2---|0---0---0-------0-----------0---|
D|2---2---2-------2---2---2---2---|--------0---0---0---0---0---0---|0---0---0-------0-----------0---|
A|3-------3-------3-------3-------|--------2-------2---------------|--------------------------------|
E|--------------------------------|--------3-------3---------------|2-------2-------2---------------|
  D   U   D       D   U   D   U            D   U   D   U   D   U    D   U   D       D           U

  G/F#    Em7     C/G              Dsus4   Cadd9                    C/G     Am7/G           Bm7    (0:53, bar 31)
e|3-------3---3---3---3---3---3---|3---3---3---3---3-------3---3---|3---3---0---0---0---0---2---2---|
B|3-------3---3---3---3---3---3---|3---3---3---3---3-------3---3---|3---3---1---1---1---1---0---0---|
G|0-------0---0---0---0---0---0---|2---2---0---0---0-------0---0---|0---0---0---0---0---0---2---2---|
D|0-------2---2---2---2---2---2---|0---0---2---2---2-------2---2---|2---2---2---2---2---2---0---0---|
A|--------2-------3-------3-------|--------3-------3-------3-------|3-------0-------0-------2-------|
E|2-------0-------3-------3-------|--------------------------------|3-------3-------3---------------|
  D       D   U   D   U   D   U    D   U   D   U   D       D   U    D   U   D   U   D   U   D   U

  Bm7     G/F#                     G/F#    Em7     G       Em7      Cadd9                   D/F#    (0:59, bar 34)
e|2---2---3-------3-----------3---|3-------3---3-------3---3---3---|3---3---3-------3---3---2---2---|
B|0---0---3-------3-----------3---|3-------3---3-------3---3---3---|3---3---3-------3---3---3---3---|
G|2---2---0-------0-----------0---|0-------0---0-------0---0---0---|0---0---0-------0---0---2---2---|
D|0---0---0-------0-----------0---|0-------2---2-------0---2---2---|2---2---2-------2---2---0---0---|
A|2-------------------------------|--------2---------------2-------|3-------3-------3---------------|
E|--------2-------2---------------|2-------0---------------0-------|------------------------2-------|
  D   U   D       D           U    D       D   U       U   D   U    D   U   D       D   U   D   U

  Am7/G   G               Am7      D/F#                    Dsus4    Em7             G    (1:04, bar 37)
e|0---0---3---3---3---3---0---0---|2---2---2-------2---2---3---3---|3-------3---3---3---3---3---3---|
B|1---1---3---3---3---3---1---1---|3---3---3-------3---3---3---3---|3-------3---3---3---3---3---3---|
G|0---0---0---0---0---0---0---0---|2---2---2-------2---2---2---2---|0-------0---0---0---0---0---0---|
D|2---2---0---0---0---0---2---2---|0---0---0-------0---0---0---0---|2-------2---2---0---0---0---0---|
A|0-------2-------2-------0-------|--------------------------------|2-------2-------2-------2-------|
E|3-------3-------3---------------|2-------2-------2---------------|0-------0-------3-------3-------|
  D   U   D   U   D   U   D   U    D   U   D       D   U   D   U    D       D   U   D   U   D   U

  Cadd9           Am7     D        C/G     G               Dsus4    D/F#                    G/F#    (1:09, bar 40)
e|3---3---3---3---0---0---2---2---|3---3---3---3---3---3---3---3---|2---2---2-------2-----------3---|
B|3---3---3---3---1---1---3---3---|3---3---3---3---3---3---3---3---|3---3---3-------3-----------3---|
G|0---0---0---0---0---0---2---2---|0---0---0---0---0---0---2---2---|2---2---2-------2-----------0---|
D|2---2---2---2---2---2---0---0---|2---2---0---0---0---0---0---0---|0---0---0-------0-----------0---|
A|3-------3-------0---------------|3-------2-------2---------------|--------------------------------|
E|--------------------------------|3-------3-------3---------------|2-------2-------2---------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D       D           U

  G/F#    Em7             C/G      C/G     Cadd9   Am7     Cadd9    G    (1:15, bar 43)
e|3---3---3---3---3---3---3---3---|3---3---3---3---0---0---3---3---|--------3---3---3---3-------3---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---1---1---3---3---|--------3---3---3---3-------3---|
G|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|--------0---0---0---0-------0---|
D|0---0---2---2---2---2---2---2---|2---2---2---2---2---2---2---2---|--------0---0---0---0-------0---|
A|--------2-------2-------3-------|3-------3-------0-------3-------|--------2-------2---------------|
E|2-------0-------0-------3-------|3-------------------------------|--------3-------3---------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U            D   U   D   U       U

  G/F#                    Dsus4    Dsus4   Em7                      Cadd9                   Dsus4    (1:20, bar 46)
e|3---3---3-------3---3---3---3---|--------3-----------3---3---3---|----3---3-------3---3---3---3---|
B|3---3---3-------3---3---3---3---|--------3-----------3---3---3---|----3---3-------3---3---3---3---|
G|0---0---0-------0---0---2---2---|--------0-----------0---0---0---|----0---0-------0---0---2---2---|
D|0---0---0-------0---0---0---0---|--------2-----------2---2---2---|----2---2-------2---2---0---0---|
A|--------------------------------|--------2---------------2-------|--------3-------3---------------|
E|2-------2-------2---------------|--------0---------------0-------|--------------------------------|
  D   U   D       D   U   D   U            D           U   D   U        U   D       D   U   D   U

  C/G     G                        G                                Em7    (1:26, bar 49)
e|----3---3-------3---3---3---3---|--------3-----------3---3---3---|3-------3-------3---3---3---3---|
B|----3---3-------3---3---3---3---|--------3-----------3---3---3---|3-------3-------3---3---3---3---|
G|----0---0-------0---0---0---0---|--------0-----------0---0---0---|0-------0-------0---0---0---0---|
D|----2---0-------0---0---0---0---|--------0-----------0---0---0---|2-------2-------2---2---2---2---|
A|--------2-------2-------2-------|--------2---------------2-------|2-------2-------2-------2-------|
E|--------3-------3-------3-------|--------3---------------3-------|0-------0-------0-------0-------|
      U   D       D   U   D   U            D           U   D   U    D       D       D   U   D   U

  Cadd9                            G    (1:31, bar 52)
e|----3---3-----------3---3---3---|----3-----------3---------------|
B|----3---3-----------3---3---3---|----3-----------3---------------|
G|----0---0-----------0---0---0---|----0-----------0---------------|
D|----2---2-----------2---2---2---|----0-----------0---------------|
A|--------3---------------3-------|----------------2---------------|
E|--------------------------------|----------------3---------------|
      U   D           U   D   U        U           D


[Discussion 1:35-2:00 ('do the chorus two times at the very beginning...'); a few strummed fragments under the talk - not transcribed]
  G    (1:35, bar 54)
e|----3---------------------------|
B|----3---------------------------|
G|----0---------------------------|
D|----0---------------------------|
A|--------------------------------|
E|--------------------------------|
      U


[Restart (2:00-2:11): G - Em7 - Am7/G - C/G - Cadd9 - Dsus4 (cut off)]
                                                           G        G               Em7    (1:36, bar 55)
e|--------------------------------|------------------------3-------|----------------3---3---3---3---|
B|--------------------------------|------------------------3-------|----------------3---3---3---3---|
G|--------------------------------|------------------------0-------|----------------0---0---0---0---|
D|--------------------------------|------------------------0-------|----------------2---2---2---2---|
A|--------------------------------|------------------------2-------|----------------2-------2-------|
E|--------------------------------|------------------------3-------|----------------0-------0-------|
                                                           D                        D   U   D   U

  Am7/G   Am7     G                C/G             Cadd9   Dsus4    Cadd9   Dsus4    (2:02, bar 58)
e|0---0-----------3---3---3-------|3-------3---3---3---3---3---3---|3---3-------3---3-------3---3---|
B|1---1-----------3---3---3-------|3-------3---3---3---3---3---3---|3---3-------3---3-------3---3---|
G|0---0-----------0---0---0-------|0-------0---0---0---0---2---2---|0---0-------2---2-------2---2---|
D|2---2-----------0---0---0-------|2-------2---2---2---2---0---0---|2---2-------0---0-------0---0---|
A|0---------------2-------2-------|3-------3-------3---------------|3-------------------------------|
E|3---------------3-------3-------|3-------3-----------------------|--------------------------------|
  D   U           D   U   D        D       D   U   D   U   D   U    D   U       U   D       D   U

  Cadd9   Am7     Em7              Em7     C/G    (2:08, bar 61)
e|3---3---0---0---3---3---3---3---|3---3---3---3---3---3-----------|
B|3---3---1---1---3---3---3---3---|3---3---3---3---3---3-----------|
G|0---0---0---0---0---0---0---0---|0---0---0---0---0---0-----------|
D|2---2---2---2---2---2---2---2---|2---2---2---2---2---2-----------|
A|3-------0-------2-------2-------|2-------3-------3---------------|
E|----------------0-------0-------|0-------3-------3---------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U
```

</details>

### 007

All three agree on standard tuning and no capo. The key comes out G major or E minor, which share the same notes.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-007.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:40</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-007.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:06</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-007.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 0:42</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-007.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 0:45</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 007</summary>

<!-- REVIEW before publishing: this file's automatic transcript names a person. -->

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20210210_165109.mp4
Source: videos/2026-08-14_007.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 39.80 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: 0; visual confidence high. No capo visible in sampled frames
Likely sounding key: G major? (low confidence; automatic note-profile estimate)
Provisional classification: fragment/partial
Reason: Short/partial take; a complete song was not established. This is provisional, not a claim of aimless playing.
Main loop, chord SHAPES relative to capo assumption: No stable loop established

IMPORTANT LIMITATIONS
This is a machine-assisted first-draft pitch/harmony sketch, NOT a verified
note-for-note tablature or proof of the original tuning/fingering. All chord
labels/finger positions are provisional (?). Source contains voice/noise;
some detected notes may be sung pitches or harmonics. A key estimate is NOT
a tuning diagnosis. Do not retune to a guessed alternate tuning.
If capo is unresolved, this file assumes fret 0 for its draft positions.
If tuning differs from standard, string/fret placement must be revised.

CHORD CHART / MAIN HARMONIC MATERIAL
Most repeated estimated pattern: No stable loop established
Common estimated sounding sonorities (time-weighted, NOT a progression): Em?, G?, Gsus2?, C?, Abm?, E?, F#m?, Esus2?

Approximate estimated changes in the first 90 seconds:
     6.0–   7.5 s: Abm? shape / Abm? sounding
     9.0–  10.5 s: Gsus2? shape / Gsus2? sounding
    10.5–  18.0 s: Em? shape / Em? sounding
    18.0–  19.5 s: Gsus2? shape / Gsus2? sounding
    19.5–  21.8 s: C? shape / C? sounding
    21.8–  27.8 s: G? shape / G? sounding
    32.2–  33.8 s: C? shape / C? sounding
    34.5–  36.0 s: Gsus2? shape / Gsus2? sounding
    36.0–  37.5 s: F#m? shape / F#m? sounding
    37.5–  39.8 s: E? shape / E? sounding

SOURCE-PITCH ASCII SKETCHES — ALL STRING ASSIGNMENTS UNCERTAIN (?)
These show actual model-detected onset pitches mapped to playable standard-
tuning positions; not a generic invented fingerpicking pattern. Each cell
is 0.5 s; simultaneous/repeated fast notes are reduced. Dashes are not proof
of silence. Positions favor low frets and may differ from the hand in video.
Fret numbers are relative to the capo assumption. Rhythm/voice separation
and fast ornaments are unresolved; use these only as play-along prompts.

Excerpt 10.0–26.0 s (?)
e |-----------------------------------3-------0---------------0----|
B |-------0---------------------0-----3-----------------------0----|
G |-------4-------0-------------0---0-0---0-0-0-3------------------|
D |---2---2-----------2-------2-5---------2-----5------------------|
A |-0----10---------------------7-0-------3------------------------|
E |-------0-----0-3-------3-----------------------3---------3------|

Excerpt 11.9–27.9 s (?)
e |---------------------------3-------0-----------------0----------|
B |---------------------0-----3-------------------------0----------|
G |-------0-------------0---0-0---0-0-0-3---------------------0----|
D |-----------2-------2-5-2-------2-----5-----------------------0--|
A |-----------------------0-------3--------------------------------|
E |-----0-3---------3---------------------3---------3--------------|

TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)
Do not rely on these as accurate lyrics or authorship evidence.
  0.0 s: ok
  2.0 s: ok
  3.0 s: No
  4.0 s: Is your god Emma Dobran?
  8.0 s: What was that that?

KEY/TUNING EVIDENCE
Profile correlations (not probabilities): G major r=0.820, E minor r=0.789, G minor r=0.517
Strong lower detected pitches: G3 (3.7), G2 (3.0), E3 (1.2), E2 (1.0), C3 (0.7), A2 (0.6), D3 (0.6), F♯2 (0.5)
Low-note support is not enough to identify every open string. Tuning left
unresolved instead of falsely declaring standard, DADGAD, or an open tuning.

CONDITIONAL CHORD GRIPS — STANDARD-TUNING ARRANGEMENT OPTIONS (?)
Low E to high e; all numbers relative to the stated capo assumption.
These are suggested playable grips, NOT observed source fingering.
Em? : 0 2 2 0 0 0
G? : 3 2 0 0 0 3
Gsus2? : x 10 12 12 10 10
C? : x 3 2 0 1 0
If the actual tuning differs, these grips are not the original arrangement.
```

</details>

<details><summary>Blind Opus 5.5's tab for 007</summary>

```text
Song 07 - fingerpicked intro + G-C-D-G fragment, an abandoned take (title unknown)
==================================================================================
Source: song07.mp4
Instrument: steel
Tuning: Standard E A D G B E  [MIDI 40 45 50 55 59 64]
Capo: 0 (none)
Key: G major / E minor (same chord colours as the intro of song 06)
Time: 4/4
Tempo: ~120 (loose; slows while they chat - every tab line is anchored to the video)
Grid: 8   (one tab column = 1/8 note)
Pitch offset: -2 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Confidence: overall MEDIUM-LOW. Tuning HIGH (standard, -2 cents; open shapes, nut and headstock visible) | Capo HIGH (none) | Key MEDIUM-HIGH (G major / E minor) | Chords MEDIUM (bass motion clear, names inferred from the open-string sonority) | Rhythm LOW-MEDIUM (loose tempo, chatting) | Note-level LOW-MEDIUM

What is played: the same outdoor duo as songs 05/06 (cutaway steel-string, open position, no capo).
After a single Em7 test strum (0:06.8) the guitarist fingerpicks an intro over ringing open G/B/e
strings while the thumb walks the bass E - A - E/C - G - E - G - A - C - G; the chord colours (A7sus4,
C/E -> Em, G6) are the same as the intro of song 06, so this looks like an earlier, abandoned take
of that song.  They break off laughing at 0:25 (no guitar 0:25-0:31), play G - C - D - G - D/F#, and
the camera falls over at ~0:38.  Vocals (singing/talking) are not transcribed.
How: Demucs-separated guitar -> basic-pitch notes -> 8th-note grid (bar lines every two tracked
beats, which fall exactly on the chord changes of the ending) -> playability optimiser with the shapes
below; false-start strum and two fingerings at 0:34.6 corrected by hand (scripts/song07_finalize.py).

Chord progression (time in video -> chord)
  0:06.80 Em7  |  0:08.60 N.C.  |  0:09.57 Em  |  0:10.10 A7sus4  |  0:11.30 C/E  |  0:12.65 Em
  0:13.85 G6  |  0:15.00 Em  |  0:15.75 G6  |  0:17.85 A7sus4  |  0:19.80 C  |  0:21.70 G6
  0:25.80 N.C.  |  0:30.79 G  |  0:32.67 C  |  0:33.60 Dsus2  |  0:34.61 G6/9  |  0:36.50 D/F#
  0:37.85 N.C.
  By section:  false start  Em7 (one strum)
               intro        | Em  A7sus4 | C/E  Em | G6  Em | G6 | A7sus4 | C | G6 | G6 |
               (talking 0:25-0:31)
               ending       | G | C  Dsus2 | G6/9 | D/F# |  (stops)

Chord shapes used (lowest -> highest string, x = not played):
  Em7: 0 2 2 0 3 0   Em: 0 2 2 0 0 0   A7sus4: x 0 2 0 3 0   C/E: 0 3 2 0 1 0   G6: 3 x 2 0 0 0   C: x 3 2 0 1 0   G: 3 2 0 0 3 3   Dsus2: x x 0 2 3 0   G6/9: 3 x 0 2 3 0   D/F#: 2 x 0 2 0 0

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

[False start - one Em7 strum]
@ 0:05.49
            Em7            N.C.
e|----------0-----|----------------|
B|----------3-----|----------------|
G|----------0-----|--0-------------|
D|----------2-----|--2-------------|
A|----------2-----|----------------|
E|----------0-----|----------------|

[Intro pattern (open-string colours, bass moves E-A-E/C-G-E-G-A-C-G)]
@ 0:09.57
  Em  A7sus4    C/E        Em
e|0-----0-0---0---|0-------0-------|
B|------3---------|0-0-----0---0---|
G|0-----0-0---0---|--------0-----0-|
D|2-2---2-2---2---|2-2---------2-2-|
A|------0-0-------|--3-------------|
E|----3-3-3-----0-|0-0-----0---0-0-|

@ 0:13.65
    G6      Em     G6
e|----0-----------|----------------|
B|0---------------|--------------0-|
G|--0-----0-----0-|------------0-0-|
D|2---2-2-2---2---|2-----------2-2-|
A|----------------|----------------|
E|3-3-----3-0---0-|3-3-----0-------|

@ 0:17.71
    A7sus4         C
e|--------3-------|0-------0-------|
B|--------3-------|--1-------------|
G|0-------0-----0-|0-0---0-0---0-0-|
D|2-2---------2---|2-2---------2-2-|
A|--0---------0---|--3---------3---|
E|--0---0-3-----3-|--3-3-----------|

@ 0:21.65
  G6
e|--------0-------|0-----------0---|
B|----0---0-------|0---------0-0---|
G|--0---------0---|----------------|
D|------------2-2-|2-2---------2-2-|
A|----------------|----------------|
E|--3-----3-------|----3-3---3-3---|

[Talking / laughing - no guitar (0:25-0:31)]
@ 0:25.40
      N.C.
e|----------------|----------------|
B|0---------------|----------------|
G|----------------|----------------|
D|2---------------|----------------|
A|----------------|----------------|
E|3---------------|----------------|

@ 0:29.02
 
e|----------------|
B|----------------|
G|----------------|
D|----------------|
A|----------------|
E|----------------|

[G - C - D - G - D/F# (then the camera falls, 0:38)]
@ 0:30.79
  G                C       Dsus2
e|3-----3-3---3-3-|0-------0---0-0-|
B|3-------3-----3-|--------3---3-3-|
G|0-------------0-|0-------2---2-2-|
D|----------------|--2-2-2-----0-0-|
A|----------------|3-3---3-0---0---|
E|3-----3-3---3---|3-3---0---------|

@ 0:34.61
  G6/9             D/F#        N.C.
e|--0-----------0-|--------0-------|
B|3-------3-------|----0---0-------|
G|--------2-----2-|--------2-------|
D|0-----0-0-------|----0-----------|
A|0-----0-------0-|0---------------|
E|--3---3-3-------|2-2---2---------|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 007</summary>

```text
====================================================================================================
 song07 - short informal fingerpicking sketch in E minor / G (outdoor duo clip)
====================================================================================================
 Source        : song07.mp4 (0:40); guitarist sits next to a friend; talking/laughing at 0:00-0:10
                 and 0:26-0:30, camera falls over at the end. Video is mirrored (front camera).
 Tuning        : Standard E A D G B E; recording within ~4 cents of A440
 Capo          : none (video: fretting hand right at the nut, no capo on the neck)
 Key           : E minor (relative G major)
 Tempo / feel  : 4/4, q = ~92; fingerpicked, thumb on the bass strings, fingers on G/B/e
 Progression   : Part 1: | Am7  Em | Em  Em/G Em | C/G  Em  Em/G | Em7  C | Cadd9  C | Em/G ... |
                 Part 2: | G | C  Asus4 | Dsus2  G | D/F#  Asus2 | Em |
 Structure     : Two playing stretches separated by laughter; not a finished performance (a
                 noodle/sketch).
 Confidence    : Tuning HIGH, capo HIGH (video). Key MEDIUM-HIGH. Chords MEDIUM (loose playing,
                 talking over the guitar). Note-level detail LOW-MEDIUM: rhythm is loose and
                 quantised to 16ths.
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   Em           0 2 2 0 0 0
   Em/G         3 2 2 0 0 0
   Em7          0 2 2 0 3 3
   Am7          x 0 2 0 1 0
   C / C/G      x 3 2 0 1 0 / 3 3 2 0 1 0
   Cadd9        x 3 2 0 3 0
   G            3 x 0 0 3 3
   Dsus2        x x 0 2 3 0
   D/F#         2 x 0 2 3 x
   Asus4/Asus2  x 0 2 2 3 0 / x 0 2 2 0 0
----------------------------------------------------------------------------------------------------
 All notes in first position (open strings + frets 1-4), as seen in the video.
 Time stamp and bar number at the start of every line; 16 slots per 4/4 bar.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: standard / capo 0 / E minor - all correct. But it called this clip a
                 'keeper' (it is a sketch with talking and laughing) and its tab includes the
                 talking/laughing as notes (0:00-0:10, 0:26-0:30); its chart starts with junk chords
                 (Gsus2, D#dim, E). I removed those stretches, re-gridded at q=92, kept every note
                 in first position and relabelled chords (Am7, Em/G, C/G, Cadd9, Dsus2, D/F#).
====================================================================================================


[Part 1 (0:10-0:26): Em fingerpicking, thumb alternates E / G / A / C bass]  (0:00-0:10 talking, 'Okay', a few stray notes - not transcribed)
  Am7             Em                               Em/G    Em       C/G             Em      Em/G    (0:10, bar 1)
e|--------------------------------|0-------------------------------|--------------------------------|
B|----1---------0---0-------------|0---0-------0-------------------|----------------0---------0-3---|
G|----0-----0-------0-------------|--2-----1---0-----------------0-|--0---1---------0---1-0-----0---|
D|----2-------2-------2-----------|------2-------------2---2-------|2---2-----------2-----2---2-----|
A|0-----0---------0---3-----------|--------------------------------|--------------------------------|
E|----3---------0---0-0-----------|0-----0-------3---------3-------|--------3-------3-----------3---|

  Em7                     C        Cadd9   C               Em/G     Em/G    (0:17, bar 4)
e|----------3---------0-----------|--0---------------------0-------|----0---------------0-----------|
B|------3---3---------------------|--3---------0-----------0-------|0-----0-----1-----0-0-----0-----|
G|------0---0-------0-0---------0-|--0---0-----------------------0-|------0-------------1-0---0-----|
D|------2-------2-----2-----------|--2---2---------------4-------2-|----2-------2-------2-----2-----|
A|0---------------0-0---3---------|--------------------------------|--------------------------------|
E|0-----0---3-------3---------3---|------------3-3---3-----3-------|3-----3---3-------3-------------|

  Em/G                             Em/G    (0:25, bar 7)
e|--------------------------------|--------------------------------|
B|--3-----------------------------|------------------------------3-|
G|--------------------------------|--------------------------------|
D|--------------------------------|--------------------------------|
A|--------------------------------|--------------------------------|
E|--------------------------------|--------------------------------|


[Part 2 (0:31-0:40): G - C - Asus4 - Dsus2 - G - D/F# - Em]  (0:26-0:30 laughing, guitar stops)
  G                       C        Asus4   Dsus2   G                D/F#            Asus2   Em    (0:30, bar 9)
e|------------3-----3---0---------|--0-------0---------------------|--------------0-----------------|
B|----------3-----------3---------|--3-----3-----------------------|--------------0-----------------|
G|0---------------------0---------|--2-------2-------------2-------|--------------2-----------------|
D|--------1---4-------1---0-----2-|--------0-0-----0---0-----------|----0---------------------------|
A|------------------------3-----3-|--0-----------0-----------------|----0---------------------------|
E|3---------3-----------3-------0-|----------------3---3---3-------|----2-----2---------------------|

  Em    (0:38, bar 12)
e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--------------------------------|
E|0-----0-------------------------|
```

</details>

### 008

All three hear standard tuning, no capo and G major or E minor again. The two Opus passes don't even agree on how many guitars are in it.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-008.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">3:03</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-008.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-008.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 3:05</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-008.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 3:06</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 008</summary>

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20210422_201409.mp4
Source: videos/2026-08-14_008.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 182.97 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: 0; visual confidence medium. No capo visible in sampled frames
Likely sounding key: G major? (low confidence; automatic note-profile estimate)
Provisional classification: keeper candidate
Reason: Long, substantially continuous musical material without a detected explicit restart. Completion/intent remains PROVISIONAL; it needs listening review.
Main loop, chord SHAPES relative to capo assumption: Asus2? -> Em? -> G?

IMPORTANT LIMITATIONS
This is a machine-assisted first-draft pitch/harmony sketch, NOT a verified
note-for-note tablature or proof of the original tuning/fingering. All chord
labels/finger positions are provisional (?). Source contains voice/noise;
some detected notes may be sung pitches or harmonics. A key estimate is NOT
a tuning diagnosis. Do not retune to a guessed alternate tuning.
If capo is unresolved, this file assumes fret 0 for its draft positions.
If tuning differs from standard, string/fret placement must be revised.

CHORD CHART / MAIN HARMONIC MATERIAL
Most repeated estimated pattern: Asus2? -> Em? -> G?
Common estimated sounding sonorities (time-weighted, NOT a progression): Em?, G?, Asus2?, Dsus4?, C?, Csus2?, Am?, Cmaj7?

Approximate estimated changes in the first 90 seconds:
     6.8–   8.2 s: C? shape / C? sounding
     9.8–  11.2 s: Em? shape / Em? sounding
    12.0–  15.8 s: G? shape / G? sounding
    15.8–  18.0 s: Asus2? shape / Asus2? sounding
    18.0–  19.5 s: Em? shape / Em? sounding
    19.5–  21.8 s: G? shape / G? sounding
    21.8–  23.2 s: Csus2? shape / Csus2? sounding
    23.2–  24.8 s: Em? shape / Em? sounding
    24.8–  30.0 s: G? shape / G? sounding
    30.0–  31.5 s: Csus2? shape / Csus2? sounding
    32.2–  33.8 s: Asus2? shape / Asus2? sounding
    33.8–  36.8 s: Em? shape / Em? sounding
    36.8–  39.0 s: G? shape / G? sounding
    39.0–  40.5 s: Em? shape / Em? sounding
    40.5–  42.0 s: Am? shape / Am? sounding
    42.0–  48.0 s: Em? shape / Em? sounding
    48.0–  49.5 s: Asus2? shape / Asus2? sounding
    49.5–  53.2 s: Em? shape / Em? sounding
    53.2–  54.8 s: Dsus4? shape / Dsus4? sounding
    54.8–  56.2 s: Em? shape / Em? sounding
    56.2–  57.8 s: Asus2? shape / Asus2? sounding
    57.8–  64.5 s: Em? shape / Em? sounding
    65.2–  69.0 s: G? shape / G? sounding
    71.2–  72.8 s: Em? shape / Em? sounding
    72.8–  74.2 s: Csus2? shape / Csus2? sounding
    74.2–  75.8 s: C? shape / C? sounding
    75.8–  78.8 s: G? shape / G? sounding
    78.8–  80.2 s: C? shape / C? sounding
    80.2–  83.2 s: Dsus4? shape / Dsus4? sounding

SOURCE-PITCH ASCII SKETCHES — ALL STRING ASSIGNMENTS UNCERTAIN (?)
These show actual model-detected onset pitches mapped to playable standard-
tuning positions; not a generic invented fingerpicking pattern. Each cell
is 0.5 s; simultaneous/repeated fast notes are reduced. Dashes are not proof
of silence. Positions favor low frets and may differ from the hand in video.
Fret numbers are relative to the capo assumption. Rhythm/voice separation
and fast ornaments are unresolved; use these only as play-along prompts.

Excerpt 10.0–26.0 s (?)
e |-------------0-----0-0-0-----------0-----------------0-0-0-0----|
B |-------0---0-1-----0-0-5-0-0-1-----0-0-0---0-0-------0-----0-0--|
G |-0---0-2---0-0---0-0-4-------4-0---0-0-4-0-0-0-0-0-0-0-----4---0|
D |---2-5-0-------0-5---0-------------2-2-7-------0-----9-------0-0|
A |---2---------0-----------0---0---2-2----------12-3-------0------|
E |---------3------------------------------------------------------|

Excerpt 83.5–99.5 s (?)
e |-------------------------------------0-0------------------------|
B |-0---------------------------------0-0---0-0-0---0-----0-0-1----|
G |-----------------------------------0-------4---0---0-0---0-0---0|
D |-------------------------------------------0-----2-5-0-0-----0-5|
A |---------------------------------0---0---0-------2---5-----0----|
E |---------------------------------8-------------0-7--------------|

TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)
Do not rely on these as accurate lyrics or authorship evidence.
  180.0 s: Buh!
  181.0 s: Buh!

KEY/TUNING EVIDENCE
Profile correlations (not probabilities): G major r=0.856, E minor r=0.808, B minor r=0.635
Strong lower detected pitches: G3 (50.9), D3 (24.6), A2 (14.4), E3 (11.2), C3 (7.7), B2 (5.5), E2 (3.5), G2 (2.8)
Low-note support is not enough to identify every open string. Tuning left
unresolved instead of falsely declaring standard, DADGAD, or an open tuning.

CONDITIONAL CHORD GRIPS — STANDARD-TUNING ARRANGEMENT OPTIONS (?)
Low E to high e; all numbers relative to the stated capo assumption.
These are suggested playable grips, NOT observed source fingering.
Asus2? : x 0 2 2 0 0
Em? : 0 2 2 0 0 0
G? : 3 2 0 0 0 3
Dsus4? : x x 0 2 3 3
If the actual tuning differs, these grips are not the original arrangement.
```

</details>

<details><summary>Blind Opus 5.5's tab for 008</summary>

```text
Song 08 - open-string fingerstyle instrumental in G major (title unknown)
=========================================================================
Source: song08.mp4
Instrument: steel (two different steel-string acoustics: cutaway in 0:00-1:24, dreadnought in 1:31-3:03)
Tuning: Standard E A D G B E  [MIDI 40 45 50 55 59 64]
Capo: 0 (none)
Key: G major (loop IV - ii - vi - I = C - Am - Em - G, played with open-string drones)
Time: 4/4
Tempo: 125
Grid: 16   (one tab column = 1/16 note)
Pitch offset: +6 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Style: fingerpicked 8th-note arpeggios (thumb on the bass strings, open B/e strings ringing as a drone, small hammer-on melodies on the B string)
Confidence: overall MEDIUM-LOW for the note-level tab. Tuning HIGH, capo HIGH (none), key HIGH, tempo/metre HIGH, chord roots MEDIUM (~75-80% of bars), exact voicings/inner notes LOW-MEDIUM

Notes on how this was made / what is uncertain:
  * Audio only has the guitar (no voice).  Two different guitars are filmed: a
    cutaway steel-string (0:00-1:24, a capo is parked on its HEADSTOCK, not on the
    neck) and a dreadnought with a clip-on tuner (1:31-3:03).  Both halves use the
    same open-position chords and the same feel (probably two takes of one piece).
  * Fretting hand stays in frets 0-4 in both halves; open low E (E2) sounds, so
    the tuning is standard (measured +6 cents sharp of A440).
  * Notes come from an automatic transcription snapped to the beat grid and
    fingered in open position; ghost notes were filtered.  Treat individual inner
    notes / ornaments as approximate; chord roots and the bass line are more solid.
  * Chord names describe what sounds: the 'Am11' bars are x00000 (A bass under
    the open D G B E strings) with a B-string 0-1-3 (B-C-D) hammer-on figure;
    'Cmaj7' bars keep the B and e strings open.

Chord progression (time in video -> chord)
  0:00.57 N.C.  |  0:06.39 Am7  |  0:08.30 Am11  |  0:10.27 Em  |  0:12.22 G  |  0:14.31 Cmaj7
  0:16.23 Am11  |  0:18.16 Em  |  0:20.05 G  |  0:22.12 Cmaj7  |  0:24.09 Am11  |  0:25.97 D
  0:27.62 Cmaj7  |  0:29.18 Em  |  0:32.67 Am11  |  0:34.49 Em  |  0:36.42 G  |  0:38.53 Cmaj7
  0:40.53 Am11  |  0:42.51 Em  |  0:44.44 G  |  0:46.53 Cmaj7  |  0:48.48 Am11  |  0:50.39 Em
  0:52.32 G  |  0:54.39 Cmaj7  |  0:56.33 Am11  |  0:58.22 Em  |  1:00.06 Cmaj7  |  1:01.81 Em
  1:03.70 Am11  |  1:05.46 G/D  |  1:11.08 Cmaj7  |  1:13.00 G/D  |  1:14.92 Cmaj7  |  1:16.94 G/D
  1:18.82 Cmaj7  |  1:20.57 G/D  |  1:22.32 Am11  |  1:26.10 N.C.  |  1:31.65 Am7  |  1:33.54 Am11
  1:35.44 Em  |  1:37.34 G  |  1:39.43 Cmaj7  |  1:41.39 Am11  |  1:43.31 Em  |  1:45.24 G
  1:47.26 Cmaj7/G  |  1:49.20 Am11  |  1:51.50 G  |  1:52.49 G/F#  |  1:53.43 G/D  |  1:55.30 Em
  1:57.20 Am11  |  1:59.15 Em  |  2:01.05 G  |  2:03.07 Cmaj7  |  2:05.04 Am11  |  2:07.01 G/D
  2:08.97 G/B  |  2:10.97 Em  |  2:13.02 Am11  |  2:15.07 Em  |  2:17.16 G/D  |  2:21.34 C/E
  2:23.09 Cmaj7  |  2:24.85 Am11  |  2:26.49 Em  |  2:28.19 Am11  |  2:31.89 Em  |  2:33.81 G/B
  2:35.81 Am11  |  2:39.73 Em  |  2:41.58 Cmaj7  |  2:43.45 Am11  |  2:45.55 G/D  |  2:47.70 Am11
  2:49.58 Em  |  2:51.47 G  |  2:53.43 Cmaj7  |  2:55.38 Am11  |  2:57.33 Em  |  2:59.19 G

Structure (both halves):
  Intro      | Am7 | Am11 | Em | G |
  Main loop  | Cmaj7 | Am11 | Em | G |   (IV - ii - vi - I in G), repeated with
             small variations, e.g. | D | Cmaj7 | Em | Em | at 0:26 and the
             walking bass | G | G  G/F# | G/D | Em | at 1:49
  Outro (1st take, 1:05-1:24): sparse | G/D | Cmaj7 | G/D | Cmaj7 | ... | Am11 |
  2nd take ends on G (3:01)

Chord shapes used (lowest -> highest string, x = not played):
  Am7: x 0 2 0 1 0   Am11: x 0 0 0 0 0   Em: 0 2 2 0 0 0   G: 3 2 0 0 0 3   Cmaj7: x 3 2 0 0 0   D: x x 0 2 3 2   G/D: x x 0 0 0 3   Cmaj7/G: 3 3 2 0 0 0   G/F#: 2 x 0 0 0 3   G/B: x 2 0 0 0 3   C/E: 0 3 2 0 1 0

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

@ 0:06.39
  Am7                              Am11
e|------------0-------0-------0---|0---------0---------------------|
B|--------------0-----------------|----0-------1---1---1---3-------|
G|2-------0-----------------------|----------------------------0---|
D|--------------------------------|--------------------------------|
A|0---3---------------------------|0-0-----------------------------|
E|----0---------------------------|--------------------------------|

@ 0:10.27
  Em                               G
e|--------0---0-------------------|----------------0---------------|
B|--------------------3-------0---|0-------0-------1---0---0-------|
G|0---0-------0---0---2-----------|--------0-----0-0---------2-0---|
D|2---2---2---2-------0-----------|0-------------------0---0-------|
A|----2-2-2-----------------------|----------------0---------------|
E|0---0---------------------------|3-------------------------------|

@ 0:14.31
  Cmaj7                            Am11
e|--------0---0---0---0-------0---|0---0-----------0---------------|
B|--------0---0---0---------------|----0-------0---0---1---3-------|
G|0---0---0-------0---0-----------|------------------------4---0---|
D|0---------------0---------------|0-------------------------------|
A|3-----------------0-------------|0---------------0---------------|
E|--------------------------------|--------------------------------|

@ 0:18.16
  Em                               G
e|--------0-----------------------|----------------0---------------|
B|----0---0---0---0---0---0---0---|0-------0-------1---0-----3-----|
G|--------0---0-------0---2-------|0-------0-------0---------2-0---|
D|2---2---2-------2---------------|0-0-------------------0-0-------|
A|----2---2---2---2-------0-------|----------------0---------------|
E|0-------------------------------|3---3---------------------------|

@ 0:22.12
  Cmaj7                            Am11
e|----------------0---0-------0---|0---------0---------------------|
B|----------------0---0---0-------|--------0---0-------0---1-------|
G|0-----------0---0---0---0-------|----------------------------0---|
D|--------------------------------|--------------------0-----------|
A|3-------------------------------|0-------------------------------|
E|--------------------------------|--------------------------------|

@ 0:25.97
  D                                Cmaj7
e|--------------------------------|0-----------------------0-------|
B|------------0-------0-------0---|0-----------------0---------0---|
G|0-------------0-----0-------0---|0-------0-----------2---2---0---|
D|0---0---4---------------4-------|2-------0-----------------------|
A|--------------------------------|3-------------------------------|
E|--------------------------------|--------------------------------|

@ 0:29.18
  Em
e|--0---------------------0-------|0-----------0---0---0-------0---|
B|--------0-----------0---3-------|3-----------0---0---------------|
G|0-------------------------------|2-----0-0---0---0---------------|
D|2-2-0---0---0-------0-----------|0---------------2---------------|
A|------------0---3---3-----------|0-0-3---------------------------|
E|------------0-------------------|0-------------------------------|

@ 0:32.67
  Am11                             Em
e|--------0-----------------------|----0---0-------0-----------0---|
B|--------0---0---0---0-1-0-------|----0-----------0---0-------0---|
G|0-------------------------0-0---|0-----------0---0---0---2-------|
D|--------------------------------|2-------2-------------0---------|
A|0---0---------------------------|----2---2-----------------------|
E|--------------------------------|0-------------------------------|

@ 0:36.42
  G                                Cmaj7
e|----------------0-0-------------|--------0---0---0---0-------0---|
B|0-------0---3---1---0-----------|--------0---0-------------------|
G|0-------0-0-----0---------2-0---|0---0-----------0---------------|
D|0---0-------0-------0---0-------|--------------------------------|
A|------------------0-------------|3-----------------------0-------|
E|3-------------------------------|--------------------------------|

@ 0:40.53
  Am11                             Em
e|----0-----------0---------------|--------0---0---------------0---|
B|----0---1-----------1---0-------|----------------0-----------0---|
G|----------------------------0---|----0-------0---0---0---2-------|
D|----------------0---------------|2-------2---2---2---0-----------|
A|0-------0-----------------------|----2---------------------------|
E|--------------------------------|0-------------------------------|

@ 0:44.44
  G                                Cmaj7
e|----------------0---------------|--------0---0---0---0-------0---|
B|0---0-----------1---0---0---0---|0-------0---0---0---------------|
G|----0-------0---------------0---|0---0---------------------------|
D|--------------------0-----------|--------2-----------------------|
A|----------------0---------------|3---------------0---------------|
E|3-----------0-------------------|--0-----------------------------|

@ 0:48.48
  Am11                             Em
e|0-------------------------------|--------0-0-0---------------0---|
B|----0-------0---0---0---1-------|----0---0-------------------0---|
G|----------------------------0---|0-----------0---0---0---2-------|
D|--------------------------------|2-------2---2---------0---------|
A|0-------------------------------|----2---2-----------------------|
E|--------------------------------|0-------------------------------|

@ 0:52.32
  G                                Cmaj7
e|----------------0---------------|--------0-----------0---0---0---|
B|------0---------1---------------|--------0---0---0---0-----------|
G|------0-------0-0-------2---0---|0---0-------0---0---0-------0---|
D|0-------------------0-----------|0-------------------0-----------|
A|0---------------0---------------|3-------------------------------|
E|--3-----------------------------|--------------------------------|

@ 0:56.33
  Am11                             Em
e|0---0---------------------------|--------0-----------0---------0-|
B|----0-------0---0---0---1-------|----0-----------0---0---0---0---|
G|----0-----------------------0---|------------0---0---0-------0---|
D|0-----0---------0-------------0-|2---2-2-2-------2---2-------2---|
A|0-------------------------------|----2-2-------------------------|
E|--------------------------------|0-------------------------------|

@ 1:00.06
  Cmaj7                            Em
e|----------------0---------------|0---0---0---0-----------0-0-----|
B|--------0-------0---------------|0---0---0---0---------------0---|
G|----------------0-------0-------|0---0---0-------0-----------0---|
D|----------------2---------------|2-2-2---2-----2-2-------0-------|
A|3-------------------------------|--------------------------------|
E|--------------------------------|----------------0---------------|

@ 1:03.70
  Am11                             G/D
e|----0-------0-------0---0-------|--------------------------------|
B|0-----------------------0-------|0-------0---1-0-----------------|
G|0-------------------------------|----------------0---------------|
D|--------------------------------|0-------------------------------|
A|--------------------0-----------|--------------------------------|
E|--------------------------------|--------------------------------|

@ 1:07.27
 
e|--------------------0-------0---|--------------------------------|
B|----3-----------0---0-----------|------------------0---------0---|
G|0-----------0---0---0-------0---|----0---------------------------|
D|0---0---4-------------0-2---2---|----0-------0---0---------------|
A|----------------------------3---|--------------------------------|
E|----------------------------0---|----------------------------3---|

@ 1:11.08
  Cmaj7                            G/D
e|------------0---0---------------|--------------------------------|
B|----------------0---------------|0-------3-------0---------------|
G|--------0---0---0-------0-------|0-------------0-----------------|
D|----2-------2---2-------2-------|0-------0-----------------------|
A|3-----------------------3-------|----------------3-----------3---|
E|--------------------------------|--------------------------------|

@ 1:14.92
  Cmaj7                            G/D
e|--------0-----------------------|--------------------------------|
B|--------0-----------------------|------------------0-------------|
G|--------0-------0---------------|--------------------------------|
D|2-------2-------0-------0-------|------------0---0---------------|
A|3-------3-----------------------|--------------------------------|
E|--------------------------------|--------------------------------|

@ 1:18.82
  Cmaj7                            G/D
e|------------------------0-------|--------------------------------|
B|--------------------------------|--------3---------------0-------|
G|--------------------------------|0-------------------------------|
D|------------------------2-------|0-------0-----------------------|
A|----3---------------------------|------------------------2-3-2---|
E|--------------------------------|--------------------------------|

@ 1:22.32
  Am11
e|--------0-----------------------|--------------------------------|
B|----------------------0-0-------|--------------------------------|
G|--------------------------------|--------------------------------|
D|0-------0-----------------------|--------------------------------|
A|0-0-----0-----------------------|------------------------0-------|
E|--------0-----------------------|--------------------------------|

@ 1:26.10
  N.C.
e|--------------------------------|--------------------------------|
B|--------------------------------|--------------------------------|
G|--------------------------------|--------------------------------|
D|--------------------------------|--------------------------------|
A|--------------------------------|--------------------------------|
E|--------------------------------|--------------------------------|

@ 1:29.84
                                   Am7
e|--------------------------------|------------3-------0-------0---|
B|--------------------------------|------------0---0---------------|
G|--------------------------------|--------0-----------------------|
D|--------------------------------|--------------------------------|
A|--------------------------------|0---3-----------0---------------|
E|--------------------------------|--------------------------------|

@ 1:33.54
  Am11                             Em
e|--------------------------------|--------------------------------|
B|----0-------0---0---0---1-0-----|0---0---0-0-0---0---3-------0---|
G|----------------------------0---|0---0-------0---0---0---2-------|
D|------------0---0---0-----------|--------2---2---2---0---0-------|
A|0-------------------------------|----2---2-2---------0---------0-|
E|--------------------------------|0-------------------------------|

@ 1:37.34
  G                                Cmaj7
e|--------------------------------|--------0-------3-----------0---|
B|0-----0---------1---0-----------|--------0---0-------------------|
G|----0---0-----0-0-------2---0---|0---0-------0-------------------|
D|0-------------------0-----------|--------------------------------|
A|0---------------0---------------|3-------3-------0-----------0---|
E|3---3-------------------------3-|--------------------------------|

@ 1:41.39
  Am11                             Em
e|----0---------------------------|--------------------------------|
B|----0-------1---1---1---3-------|0---0-------0---0---0-------0---|
G|----------------------------0---|------------0-------0---2-------|
D|------------------0-0-------0---|--------2-----------------------|
A|0---0-----0---------------------|----2-2-------2-------0---------|
E|--------------------------------|0-------------------------------|

@ 1:45.24
  G                                Cmaj7/G
e|--------------------------------|3-----------------------3---3---|
B|0-------------0-1---0-----------|------------0---0---0---0---0---|
G|----0---------0-0-------2---0---|----0-----0-0---0---0---0-0-0---|
D|0-------------------------------|----------------------------0---|
A|0---------------0---------------|3-----------------------------0-|
E|3---3---0-----------------------|3-----0-------------------------|

@ 1:49.20
  Am11                             G               G/F#
e|3-------3-------------0---------|--------------------2-----------|
B|0-------0-------0-0-0-----------|----------------0---0---0---0---|
G|--------0-------0---0---0-------|------------0-----------0-------|
D|----0-------0-------------------|0---0---4-4-----4---4-------2---|
A|0---0---------------------------|0---------------------------3---|
E|3-----------------------------3-|--3-----------------------------|

@ 1:53.43
  G/D                              Em
e|--------------------------------|------------0-------0-------0---|
B|----------------0---0---0-------|0-------0---0---0---------------|
G|----0-----------0---0---0---0---|--------0---0-------------------|
D|----0-------0---0---0---0---0---|--------------------------------|
A|--------------------------------|0---3-----------0---0-----0-----|
E|--------------------------------|0-------------------------------|

@ 1:57.20
  Am11                             Em
e|--------------------------------|--------------------------------|
B|------0-----1---1---1-----------|0---0-------0---0-----------0---|
G|----------------------------0---|--------0---0---0---0---2-------|
D|--------------------0-----------|0---0---2---2-------------------|
A|0---0-------0-------------------|2---2---2---2---------0---------|
E|------------------------------3-|3-0-----------------------------|

@ 2:01.05
  G                                Cmaj7
e|--------------------------------|------------0-------------------|
B|----0-----------1---0-----------|------------0---0---0---0-0-----|
G|----0-----------0-------2---0---|0---0-----------0---0---0---0---|
D|--------------------0---0-------|--------------------------------|
A|----------------0---------------|3---------------------------0---|
E|3---3---------------------------|------0-------------------------|

@ 2:05.04
  Am11                             G/D
e|------------0---0---------------|----------------------3-----0---|
B|--------0---0---0---0---0-------|------------0---0---0---0---0---|
G|2-----------------------0---0---|0---------------0-------0---0---|
D|----0---------------0---0-------|0---0---4---4-------4---------2-|
A|0---0-------0-------------------|----------------------------2---|
E|--------------------------------|--------------------------------|

@ 2:08.97
  G/B                              Em
e|------0-------------------------|--------------------------------|
B|--0---0-----0-------0-------0---|0-----------0---0---0-----------|
G|--0---0-----0-------0-----------|------------0---0---0-----------|
D|------2-----2-------2-------0---|0---0-4-4-----------0-----------|
A|------2-3---3-------3-----------|--------------2-----------------|
E|------------0---------0---------|--0-----------------------------|

@ 2:13.02
  Am11                             Em
e|--------0-3---------------------|--------0-------------------2---|
B|--------0-----------0-----------|0-------0-----------------------|
G|--------0-----------0-----------|------------------------------0-|
D|--------------------0-----------|2---------------0---0-4-4---4---|
A|--0---0-------------2-----------|2---------------------------5---|
E|--------0-----------0-----------|0-----------------------------3-|

@ 2:17.16
  G/D
e|------------3-----3-----3-------|0---------------------------0---|
B|0---0---0---0---------0---------|0-----------0-------------------|
G|0---0---0-------------0-----0---|0---0---0-----------------------|
D|0---0-------0---------0-----0---|0---0---0-----------------------|
A|------------3-------------------|----3---------------------------|
E|--------------------------------|----0---------------------------|

@ 2:21.34
  C/E                              Cmaj7
e|0-------------------------------|------0---------3---------------|
B|0---0---------------------------|----0-------0---0-------0-------|
G|--0---------0-----------0-------|------0-------0-0-------0---0---|
D|2---------2-0-------------------|----------------0---------------|
A|3-3---------------------3-------|----3-----------3-------------0-|
E|--0-----------------------0-----|--------------------------------|

@ 2:24.85
  Am11                             Em
e|--------0-----------------------|--------0-----------------------|
B|--------0-----------------------|--------0-----------------------|
G|2-------------------------------|--------0-----------------------|
D|--------------------------------|--------2-----------------------|
A|0-0-3-----------0---------------|--------3-----------------------|
E|------0-------------------------|--------0-----------------------|

@ 2:28.19
  Am11
e|--------------------------------|----0-------0-------------------|
B|--------1-----------1-------0---|0-------------------0-------1---|
G|----------------------0-0-------|--------------------------------|
D|--------------------------------|0---------------0---------------|
A|0---0-----------0---3-----------|--0---------0-0-0---------------|
E|--------------------------------|--------------------------------|

@ 2:31.89
  Em                               G/B
e|------------3-------------------|----3---------------------------|
B|1---1---3-------0-------0-------|------------0---------0---------|
G|------------0---------------0---|0---0---2-------------0---------|
D|--------------------2---2-------|2---0---------------------------|
A|--------------------2---2---2---|--------------------------------|
E|----------------0-------0-------|----------------3-----3---------|

@ 2:35.81
  Am11
e|------------------------0---0---|----0-------0-------0-----------|
B|1---0-------------------0---0---|0-------------------0-------0---|
G|0-------2---0-------------------|--------------------------------|
D|------------0-------------------|--------------------------------|
A|0---------------3---------------|----0---------0-0---0-----------|
E|--------------------------------|--------------------------------|

@ 2:39.73
  Em                               Cmaj7
e|------------3-------3-------3---|----3-------0-------3-----------|
B|0---0---1-------0---------------|----0---0---0-------0-----------|
G|------------0-------0-------0---|0---0---2-----------0-----------|
D|----------------2-------2-------|----0---------------------------|
A|--------------------3---3-------|--------------------------------|
E|----------------0---------------|----------------3---------------|

@ 2:43.45
  Am11                             G/D
e|------------3-----------0-------|--------------0-------0-----0---|
B|1---0-----------------------0---|------0-0-------0-0-------------|
G|0-------2---0-------0-----------|----0-------0-------------------|
D|--------------------0-----------|------0-------------------------|
A|0-0-------------3---------------|----0---3-------------0---------|
E|--------------------------------|--------------------------------|

@ 2:47.70
  Am11                             Em
e|----0-----------------------3---|------------3-------------------|
B|----0-----0-0---1---1---3-------|0---0---0---0---------------0---|
G|----------------------------0---|--------0---0---0---0---2-------|
D|--------------------------------|--------2-----------------------|
A|0-----------0-------------------|----2---2-------2---------------|
E|--------------------------------|0-------------------------------|

@ 2:51.47
  G                                Cmaj7
e|----3---------------------------|3-----------3-----------0---0---|
B|----0-----------1---0-------3---|------------0---0-----0---------|
G|----0-----------2-------2---0---|----0---0-------0-----------0---|
D|0-----------------------0---0---|--------------------0-----------|
A|----------------0---------------|3-----------------------------0-|
E|3---3---------------------------|--------------------------------|

@ 2:55.38
  Am11                             Em
e|----0-----------------------3---|------------3-------------------|
B|----0-------1---0-----3-0---0---|0---0---0-------0-----------0---|
G|------------------------0---0---|------------0-------0---2-------|
D|--------------------------------|--------2-------2---------------|
A|0-------------------------------|----2---2---2---2---------------|
E|--------------------------------|0-------------------------------|

@ 2:59.19
  G
e|--------------------------------|
B|----------------0-------0-------|
G|----------------2---0---0---0---|
D|--------0-------0-------0---0---|
A|--------0-------0---0---0---0-0-|
E|3-------------------------------|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 008</summary>

```text
====================================================================================================
 song08 - open-position fingerstyle improvisation in E minor (two segments)
====================================================================================================
 Source        : song08.mp4 (3:03), steel-string dreadnought with a clip-on tuner, fingerpicked, no
                 singing (all whisper 'lyrics' are hallucinations). Two people share the guitar in
                 the first part; at 1:24-1:30 they rearrange and the second part is filmed looking
                 up the neck.
 Tuning        : Standard E A D G B E; in tune (+3 cents)
 Capo          : none (open strings sound at standard pitch; the second half shows the hand at frets
                 0-3, no capo)
 Key           : E minor (relative G major)
 Tempo / feel  : 4/4, q = ~123, steady 8th/16th fingerpicking
 Progression   : Built from Em(7) - Am(7)/Asus2 - G - Cadd9/Cmaj7, with Bm7 and Dsus4 - G/D as
                 passing chords; typical phrase: | Em7 | G | Cadd9  Em7 | Am7  Asus2 | Em | G |
                 Cadd9  Cmaj7 | Am7  Bm7 | Dsus4  G/D | Cmaj7 | Em7 |
 Structure     : Free, through-composed fingerpicking over those chords (no fixed loop): part 1 =
                 bars 1-40, break = bar 41, part 2 = bars 42-88.
 Confidence    : Tuning/capo HIGH, key HIGH, chord names MEDIUM (automatic labels; Asus2 vs Am and
                 Cadd9 vs Cmaj7 differ by one note), notes/fingering MEDIUM (open position as in the
                 video; dense picking quantised to 16ths).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   Em / Em7     0 2 2 0 0 0 / 0 2 2 0 3 0
   Am / Am7     x 0 2 2 1 0 / x 0 2 0 1 0
   Asus2        x 0 2 2 0 0
   G / G/B / G/D 3 2 0 0 0 3 / x 2 0 0 0 3 / x x 0 0 0 3
   Cadd9 / Cmaj7 x 3 2 0 3 0 / x 3 2 0 0 0
   Dsus4        x x 0 2 3 3
   Bm7          x 2 0 2 0 2
----------------------------------------------------------------------------------------------------
 Open-position fingerpicking; let notes ring. 16 slots per bar (16th notes).
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: standard / capo 0 / keeper all right; key 'G major' is the relative of the
                 E minor the piece actually centres on. Its tab is usable but noisy: it ran straight
                 through the 1:24-1:30 break (notes from handling noise), chart labels flicker
                 (Gadd9/A, Gm, A#m7, C#5...), and it missed that there are two segments. I removed
                 the break, the pre-roll and weak re-triggers, relabelled the harmony with open-
                 position chords, and re-fingered in open position.
====================================================================================================


[Part 1 (0:06-1:24)]
                  Em               Asus2           Am               Em7    (0:05, bar 1)
e|--------------------0-------0---|----0-0-------------------------|--------0-------------------5---|
B|--------------------------------|------------0-------1---1---1---|3-------------------------------|
G|----------------0-----0---------|--------------------------------|----0---0---0-------0---0---2---|
D|--------------------------------|--------------------------------|------2-----2---2---2-------0---|
A|------------3-------------------|--------0-----------------------|------------2---2---------------|
E|--------------------------------|--------------------------------|--------0---0-------------------|

  G                                Cadd9           Em7              Am7             Asus2    (0:11, bar 4)
e|----------------------0---------|----------------0---0---0---0---|--0---0-----0---------0---------|
B|----0---0-------0-------1-0-----|----------------0---0---0-------|----------0-------0---0---1-----|
G|--------------0---------0-------|--3-0---0---0---0-------0---0---|--0-----------------------------|
D|------0---------------------0---|------------------------0-------|--------0-----------------------|
A|------------------------0-------|--------3-----------------------|--------0-------------0---------|
E|--------3-----------------------|--------------------------------|--------------------------------|

  Em                               G                                Cadd9           Cmaj7    (0:17, bar 7)
e|--------------------------------|------------------------0-------|----------------------0---0-----|
B|3---------0---0---0---0-------0-|--0---0-------0-------1---0---0-|----------1-----------0---0---0-|
G|4-0-----------0---0-------0---2-|------0-------0-------0---------|2---0-0-----------0---0---0---0-|
D|------2---2---2---2---2---------|------0---------------------4---|----------------------2---------|
A|----------2---2-------2---------|------------------------0---5---|--------3-----------------------|
E|------0-------------------------|--------3-----------------------|--------------------------------|

  Am7             Bm7              Dsus4           G/D              Cmaj7    (0:23, bar 10)
e|--0---0---------0---------------|--------------------------------|--0-----------------------------|
B|--------------0---0-------0---3-|------------------0---0-------0-|----------------0-----0---0-----|
G|------------------------------5-|--0---0-----------0---0-------0-|--0-------0-------2---2---0-----|
D|--------------------------0-----|------0---4---4-----------4-----|--2-------0-------------------2-|
A|------0-------------------------|----------5---------------5-----|--3-----------------------------|
E|--------------------------------|--------------------------------|--------------------------------|

  Em7                              Cmaj7           Am7              Asus2           Em    (0:29, bar 13)
e|------------0---0-----0---------|--0---0---0-----0-------------0-|--------------------------------|
B|------------0---3-----3---------|--0---0-----------------------0-|--0---0---0-0-------------------|
G|----------------------2-------0-|--0---0---------------0---------|------------5---0---0-----------|
D|0-0---0-----0---------0---------|--2---2-------------------------|--------------------2-------2---|
A|------0-3---3-----------0-3-----|----------------------0---0-----|------------------------2---2---|
E|------0-------------------------|--------------------------------|----------------------0---------|

  Em              Em7              G               Cadd9            Cmaj7           Asus2    (0:35, bar 16)
e|------0-----5---0---------------|----0-------------------------0-|0-----0-0-------0-------0-------|
B|------0-0-------0---0-------0---|3-----1---0-------------------0-|0-----------------------0---1---|
G|--0---0---0-2-------0-------0---|0---0-0-------3-2-0-0-----0-----|----0---------------------------|
D|--------------------0---2-------|0---------0---------------------|--------------------------------|
A|------------------------5-------|------0---------------3---------|----------------------0-----0---|
E|----------------------3---------|--------------------------------|--------------------------------|

  Am              Em               Em              G                Em7             Em    (0:41, bar 19)
e|----0---------------------------|----0-----------0---------------|----0-----------------------0---|
B|--------1---2-------------------|0---0-----------0---0---0-------|----1---0---0---0---0-------0---|
G|------------4---0-------0-------|0---0---0---2-----------0-------|0---------------0---0---0-------|
D|----0-----------------------2---|2-------0-----------0-----------|--------0-------------------2---|
A|--------------------------2-----|--------------------------------|----0-----------------3---------|
E|--------------------0-----------|--------------------3-----------|--0-------------------0---------|

  Em              Asus2            Asus2           Em               Em              G    (0:47, bar 22)
e|----0---0-------0---0-----------|----------------------------0---|0-----------5-0-----------------|
B|0---0-------------------0-------|0---0---0---1-------------------|----------------0---------0-----|
G|--------------------------------|----------------0---------------|0---0---0---2-------------0-----|
D|2-------------------------------|--------------------2-------2---|2---2---------------0-----------|
A|------0-------------0-----------|------------------------2---2---|--------------------------------|
E|--------------------------------|--------------------0-----------|----------------------3---------|

  Dsus4                            Em7             Asus2            Bm7             Em    (0:53, bar 25)
e|----0-----------------------0---|--------0-0---0---0-----0-------|--------------------------------|
B|----1-----------3-----------0---|0---0---0-------------0-------0-|--0---0---1-----------------0---|
G|--0---------2---0---0---0-------|0---0---0-----0---------0-------|------------0---------------0---|
D|--------0-----------0-----------|--------0---------0-------------|----0-----------2---2---2-------|
A|----0---------------3-----------|--------------------0-----------|--------------------2-----------|
E|--------------------------------|--------------------------------|----------------0---------------|

  Em              G/B              Em                               Em    (0:59, bar 28)
e|--------------------------------|----------0-------0-------------|--0-----------0-----0-----0---0-|
B|0---0-0---0---------0-------0---|------------0-0-----0-----------|------0---0-------------------0-|
G|0---0-----0-----------------0---|----0-----0---0-----0-----0-----|--0-------0---------------------|
D|2---2-0---2---------------2-----|------------2-----2-----2-------|--0-----------------------------|
A|----------2---3-----------------|--------------3-----------------|--------------------------0-----|
E|--------------------------------|--------------------------0-----|--------------------------------|

  Asus2           G/D              G/D                              Em              Em7    (1:05, bar 31)
e|--------------------------------|----------------------0---------|--------------------------------|
B|------0-----0---1-0-------------|------------------0---0---------|--------------------0---------0-|
G|------------------0-------------|--0-----------0---0---0-------0-|------0-------------------------|
D|------0-------------------------|--0---0---4---------------2---2-|------0-------2---0-------------|
A|--------------------------------|------------------------------3-|--------------5-----------------|
E|--------------------------------|------------------------------0-|------------------------------3-|

  Cmaj7           Em               Cadd9                            C               Cmaj7    (1:10, bar 34)
e|------------------0-------------|--------------------------------|----------0---------------------|
B|------------------0-------0-----|--0-----------------------------|----------0---------------------|
G|----------0---0---0-------0-----|--0-----------------------------|----------0-------0-------------|
D|------2-------2---2-------2-----|--0-------0---------------------|--2---------------0-------0-----|
A|--3-----------------------3-----|------------------3-----------3-|--3-------3---------------------|
E|--------------------------------|--------------------------------|--------------------------------|

  G/D                              Cmaj7                            Em7             G/D    (1:16, bar 37)
e|--------------------------------|--------------------------------|--------------------------------|
B|--------------------------------|--------------------------------|------------------------0-------|
G|--------------------------------|--------------------------------|0-------------------------------|
D|----------------0-1-0-----------|--------------------------2-----|0---------0---------------------|
A|--------------------------------|----4---3-----------------------|------------------------2---2---|
E|--------------------------------|--------------------------------|--------------------------------|

  Asus4    (1:22, bar 40)
e|--------0-----------------------|
B|------------------------0-------|
G|--------------------------------|
D|0-------0-----------------------|
A|0-0-----0-----------------------|
E|--------0-----------------------|


[Break (1:24-1:30): the players rearrange, guitar is moved - no playing]
    (1:24, bar 41)
e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--------------------------------|
E|--------------------------------|


[Part 2 (1:30-3:03): same material, camera now looks up the neck (hand at frets 0-3)]
  G/D             Am               Em              Asus2            Bm7             Em    (1:30, bar 42)
e|----------------------------3---|----0-------0-------0-----------|--------------------------------|
B|----------------------------0---|0-------------------0-------0---|0---0---1-0-----0---0-------0---|
G|----------------------0-0-------|--------------------------------|------------0---0-----0-----0---|
D|--------------------------------|----------------------------0---|0---0-------------------2---2---|
A|----------------0---3-----------|0---------------0---------------|----------------2---2---2-------|
E|------------------0-------------|--------------------------------|----------------0---------------|

  Em7             G                G                                Am7    (1:36, bar 45)
e|--------------------------------|--------------3---------3-------|3---0-------0-------0-----------|
B|------------0---0---0-----------|1---0-------------------5---0---|--------------------0-------1---|
G|0---0---2-----------0-----------|0-------2-3---0-0---0---4---0---|----------------0---0-----------|
D|2---0---0-------0---------------|----0---------------------------|--------------------------------|
A|----0-----------0-------------0-|0---------------3-------3-------|0-----------0---0---0-----------|
E|----------------3---3-----------|--------------3-5---------------|--------------------------------|

  Am              Em7              Em              G                Em    (1:42, bar 48)
e|--------------------------------|0-------------------------------|--------------------------------|
B|1---1---3-------0---0-------0---|0-----------0---0-------------1-|----0---------------------0---0-|
G|------------0---------------0---|----0-2-------------0---------0-|--------2-3-0-------0-----0---0-|
D|------------------------2-------|--------------0-----------------|--------------------------------|
A|--------------------2-2-------2-|----------------0-------------0-|----------------3---------------|
E|----------------0---------------|----------------3---3-----------|----------------3---------------|

  Em              G                G/D             G                G               G/B    (1:48, bar 51)
e|--------3-------3---------------|--------0-----------------------|--------------------------------|
B|----0---0---0---0-----0---------|----0---------------------------|------0---0---0---0-------------|
G|----0---0---------------0-------|0---0-------0-------------0-----|--0-----------0-----------0-----|
D|----------0---------0-------0---|------------------------0-----4-|--------4---0-----2-------0-----|
A|--------------0-0---0-----------|--------0-------------2---------|------------2-------3-----------|
E|--------------3-----------------|--------------------3-5-3-------|--------------------------------|

  G               G/D              Em7             Asus2            Asus2           G    (1:54, bar 54)
e|--------------------------------|--0-------------0---------------|--------------------------------|
B|------0---0---0-------0-------0-|--0---0---------------------0---|--1---1---1---3-------0---------|
G|------0---0---0---0-----------0-|--------------------------------|------------------0-----------0-|
D|--0---0---0---0---0-------------|--------------------------------|----------0-----------0---0---2-|
A|--------------------------3-----|------0---0-----0-----0-----0---|--0-------------------2---2---2-|
E|------3---------------0---------|--------------------------------|--------------------3-5-0-------|

  Em              G                G               Dsus4            Cmaj7           G    (1:59, bar 57)
e|--------------------------------|--------------------------------|--0-----------------------------|
B|------------------0-------0-----|------1---0---------------------|--0---0-------0---------------0-|
G|--0-----0-----2-----------0-----|------0-------2-3-0---0---0-----|------0---0---0---0-------------|
D|--2-----0-----------------------|----------0---0-----------------|--------------------------0-----|
A|--2---------0-------------------|----0-0---------------3---------|------------------0---0---0-----|
E|----------------------3---3-----|--------------------3-----------|--------------------------------|

  Asus2           G/B              G/D             G/B              Em    (2:05, bar 60)
e|--0---0-------------------------|------------------0-------------|--------------------------------|
B|--0---0---0---0-----------------|0-----0---0---0---0-----0-------|----0-------0-------------0-----|
G|--------------0---0---0---------|------0-------0---0-----0-------|----0-------0-----------0-------|
D|----------0---0-------0---0-4-0-|4---------4---------2-------2---|----2-------2-------0---------4-|
A|--0-----------0-----------------|------2---5-------2-----2---2---|3---3-------3-----------------5-|
E|--------------------------------|------5-------------------------|--------------------------0-----|

  Em7             G/B              Em                               Em              Bm    (2:11, bar 63)
e|--------------------------------|--0-----------------------------|----0---------------------------|
B|----0-----0-0-----0-------------|--0-----------------------------|----0---------------------------|
G|----0---0-------0---1-----------|--0-------------0---------------|----------------------------0-4-|
D|--------------4-----------------|----------------0-----------2---|--------------0---0---4---4-0---|
A|------2-------5-------1-----0---|0---------------2-----------2---|--------------------------5-----|
E|--------------------------------|----------------0-----------0---|--------------------------------|

  G               Cmaj7            Em7                              Em              Em7    (2:17, bar 66)
e|--------3---------------------0-|--------------------------0-----|--0-----------------------------|
B|0---0---0---------0-----------0-|--0-----0-----------------------|0-------------------------------|
G|--0-0-------------0-----0---0---|0---0---------------------------|0-----------0-------0-----------|
D|0-------0---------------0-----0-|--0-0---------------------------|2-------2---0-------------------|
A|--------3-----------------------|--------------------------------|3-3-------------------3---------|
E|--------------------------------|--0-----------------------------|--------------------------------|

  Cmaj7           Em7              Am7             Em               Em              Am7    (2:23, bar 69)
e|0---------0-3-------------3-----|--0-----------------------------|--------------------------------|
B|0-----0-----0-------0-----------|----0---------------------------|------------------------1-------|
G|0---------0-------0-----0-----0-|----------------------------0---|--------------------------------|
D|----------0---------------------|--------------------------------|--------------------------------|
A|3-----------3-------------0---3-|----------------------------0---|----------------0---0---------0-|
E|--------------------------------|----------------------------0---|--------------------------------|

  Am              Am7              Asus4           Asus2            Em7             Em    (2:29, bar 72)
e|------------------0-------0-----|--------------------------------|--------------------------------|
B|--1-------0-----0---------------|----0-------1-1---1-----3-------|--------------------------0-----|
G|------0-------------------------|----------------------------0---|------------0-0---0---2---------|
D|----------------0---------------|--------------------------------|----2-2-------2---0-------------|
A|--3-------------0---------0---0-|--------------------------------|----2-------2---------0---------|
E|--------------------------------|--------------------------------|0-----0-----------------------3-|

  G                                Dsus4           Cmaj7            Asus2    (2:34, bar 75)
e|--------------------------------|--------0---0-------0-----0-----|--0-----------------------------|
B|----0-----------1-0-------------|--------0---0---0---------------|--0-------0---0---0---1-------0-|
G|----0---------0-------2-----0---|--------------------------------|--------------------------0-----|
D|--------------------------0-----|--------------------------------|--------------------------------|
A|--------------0-----------------|3---------------------------0-0-|--0-----------------------------|
E|----3---------------------------|--------------------------------|------------------------------0-|

  Em                               G               Am7              Cadd9           Em7    (2:40, bar 78)
e|----------------------0---------|------------------------3-------|----0---3---------------------0-|
B|------0-------0---0---0---------|0---------1---0-----------------|----0---0---------0---0-------0-|
G|--0-------0-----0-2---2---------|0---------0-------2-3---0-------|0-----------------0-------0-----|
D|------2---------0---------------|--------------------------------|0-----------------0-------------|
A|--3---3-------------------------|--------0-0---------------3-----|------------------0---3---------|
E|--------------------------3-----|--------------------------------|--------------------------------|

  G               Asus2            Asus2           Cadd9            Em              Asus2    (2:46, bar 81)
e|--0---0-----0---------0---------|--------------------------------|--------------------------------|
B|--0-----------------0-------0---|--1---1---3-------0-----------0-|--------------0-------0---------|
G|--------------------------------|--------------0-----------0---0-|--0---0---2-----------0---------|
D|--------------------------------|------------------------2-------|--------------------------------|
A|------0---------0-----------0---|----------------------2---------|--2---0-------------------------|
E|--------------------------------|----------------0---------------|------------------3---3---------|

  G               Dsus4            Cmaj7           Am7              Asus2           G    (2:52, bar 84)
e|------------------3-------3-----|------5---0---0-------0---------|--------------------------------|
B|--1---0-----------------------0-|--0-----0-----------0---------1-|--1---3-0---0-----0-------------|
G|0---------2-3-0-------0---------|--0-----------0-----------------|--------0-----0-------------0---|
D|--------0-----0-----------------|------0-------------------------|------------------------2-------|
A|0-----------------3-------------|----------------0---------------|----------------------2-2-----2-|
E|--------------------------------|--------------------------------|------------------0-------------|

  Em              Asus2            G               Dsus4    (2:58, bar 87)
e|--------------------------------|--------------------------------|
B|------------0-------------------|0-----0-------------------------|
G|----0---2-----------------------|----0-0-------------------------|
D|2-------------------------0-----|0-----0-0-----------------------|
A|0-------------------------------|0---0-0---0---------------------|
E|----------------3---------------|--------------------------------|
```

</details>

### 009

Both Opus passes hear D major, but blind Opus says open D tuning (D A D F# A D) and Opus with Tabber says standard. Grok Bot guessed A major in standard tuning.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-009.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">4:51</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-009.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-009.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 4:50</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-009.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 4:54</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 009</summary>

```text
Very Scary? — likely same original as item 093
======================================================================
Song confidence: medium-high (shared chorus with explicitly named 093; exact preferred title unconfirmed)
Original filename: 20210525_112343.mp4
Source: videos/2026-08-14_009.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 290.92 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: 0; visual confidence high. No capo visible in sampled frames
Likely sounding key: A major? (low confidence; automatic note-profile estimate)
Provisional classification: keeper candidate
Reason: Long, substantially continuous musical material without a detected explicit restart. Completion/intent remains PROVISIONAL; it needs listening review.
Main loop, chord SHAPES relative to capo assumption: D? -> Asus4?

IMPORTANT LIMITATIONS
This is a machine-assisted first-draft pitch/harmony sketch, NOT a verified
note-for-note tablature or proof of the original tuning/fingering. All chord
labels/finger positions are provisional (?). Source contains voice/noise;
some detected notes may be sung pitches or harmonics. A key estimate is NOT
a tuning diagnosis. Do not retune to a guessed alternate tuning.
If capo is unresolved, this file assumes fret 0 for its draft positions.
If tuning differs from standard, string/fret placement must be revised.

CHORD CHART / MAIN HARMONIC MATERIAL
Most repeated estimated pattern: D? -> Asus4?
Common estimated sounding sonorities (time-weighted, NOT a progression): D?, Bm?, Asus4?, B?, Esus2?, Bsus4?, E?, Esus4?

Approximate estimated changes in the first 90 seconds:
     1.5–   6.8 s: D? shape / D? sounding
     8.2–  10.5 s: Dsus4? shape / Dsus4? sounding
    10.5–  12.0 s: F#m7? shape / F#m7? sounding
    12.8–  15.0 s: C7? shape / C7? sounding
    15.0–  19.5 s: Esus4? shape / Esus4? sounding
    19.5–  21.8 s: D? shape / D? sounding
    22.5–  24.8 s: Asus4? shape / Asus4? sounding
    24.8–  26.2 s: Bm? shape / Bm? sounding
    27.0–  28.5 s: D? shape / D? sounding
    29.2–  31.5 s: Asus4? shape / Asus4? sounding
    31.5–  33.8 s: Bm? shape / Bm? sounding
    33.8–  35.2 s: D? shape / D? sounding
    36.0–  38.2 s: Asus4? shape / Asus4? sounding
    40.5–  42.0 s: F#m? shape / F#m? sounding
    42.0–  44.2 s: Asus4? shape / Asus4? sounding
    44.2–  47.2 s: Bm? shape / Bm? sounding
    47.2–  60.0 s: D? shape / D? sounding
    60.0–  61.5 s: F#7? shape / F#7? sounding
    61.5–  63.0 s: Bm? shape / Bm? sounding
    63.0–  64.5 s: D? shape / D? sounding
    65.2–  66.8 s: Esus2? shape / Esus2? sounding
    66.8–  68.2 s: Am? shape / Am? sounding
    68.2–  73.5 s: D? shape / D? sounding
    75.0–  77.2 s: Bm? shape / Bm? sounding
    77.2–  78.8 s: Csus2? shape / Csus2? sounding
    78.8–  81.8 s: Esus2? shape / Esus2? sounding
    81.8–  83.2 s: C? shape / C? sounding
    83.2–  87.0 s: D? shape / D? sounding
    87.8–  90.8 s: Bsus4? shape / Bsus4? sounding

SOURCE-PITCH ASCII SKETCHES — ALL STRING ASSIGNMENTS UNCERTAIN (?)
These show actual model-detected onset pitches mapped to playable standard-
tuning positions; not a generic invented fingerpicking pattern. Each cell
is 0.5 s; simultaneous/repeated fast notes are reduced. Dashes are not proof
of silence. Positions favor low frets and may differ from the hand in video.
Fret numbers are relative to the capo assumption. Rhythm/voice separation
and fast ornaments are unresolved; use these only as play-along prompts.

Excerpt 10.0–26.0 s (?)
e |---0---0-0-----------0---0-------0-------------0-0---0-0-0-0----|
B |---------------------0---7-0---------------------------------0--|
G |---2---2-----3-----3---2-----2-----2-------2-2------------------|
D |---4---------------------------------------7-4-4---------0-4-4--|
A |-------------------------------------------9---------0-0-0-0-9--|
E |-------------------------------------------------------5-----7--|

Excerpt 137.5–153.5 s (?)
e |-3---0-----0---------0-------------------------------0-3---0----|
B |---2---3-1-------3---------1---1---------0-----------1---0-3-0--|
G |-------------------1---------------2-----------------2---6------|
D |-4---------4-4-----4---4-3---------4-2---4-4---0-0-4-0-4---4---4|
A |---1-----2-2-9---3-----9-------0-0-0-5---0-0-0-5-9-----1-------2|
E |---------------------------------5------10-------5--------------|

TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)
Do not rely on these as accurate lyrics or authorship evidence.
  30.0 s: So you know who we are, feel like you're going to be looking back
  37.0 s: So under what we love for, always tear your glass
  44.0 s: We're not really nice
  54.0 s: And all you're right here
  58.0 s: You have a little thing that's very scary, huh?

KEY/TUNING EVIDENCE
Profile correlations (not probabilities): A major r=0.754, F# minor r=0.706, D major r=0.704
Strong lower detected pitches: F♯3 (55.9), D3 (26.8), A2 (26.6), B2 (8.5), A♯2 (6.6), G3 (4.4), C3 (3.6), F3 (2.6)
Low-note support is not enough to identify every open string. Tuning left
unresolved instead of falsely declaring standard, DADGAD, or an open tuning.

SONG-ID REFERENCE
Local evidence: item 093 original filename Very scary 2.mp4 and its matching recorded chorus.
Both recordings repeat the right-here / very-scary / make-me-feel-this-way / leave-me-here chorus. This associates the recordings; it does not establish external authorship.

CONDITIONAL CHORD GRIPS — STANDARD-TUNING ARRANGEMENT OPTIONS (?)
Low E to high e; all numbers relative to the stated capo assumption.
These are suggested playable grips, NOT observed source fingering.
D? : x x 0 2 3 2
Asus4? : x 0 2 2 3 0
Bm? : x 2 4 4 3 2
B? : x 2 4 4 4 2
If the actual tuning differs, these grips are not the original arrangement.
```

</details>

<details><summary>Blind Opus 5.5's tab for 009</summary>

```text
Song 09 - open-D fingerstyle ballad with vocals (title unknown)
===============================================================
Source: song09.mp4
Instrument: steel
Tuning: Open D: D A D F# A D (low to high)  [MIDI 38 45 50 54 57 62]
Capo: 0 (none)
Key: D major (Mixolydian/borrowed colour: Gm = iv, Eb = bII in the outro)
Time: 4/4
Tempo: ~140 counted in 8ths (feels like a slow ~70 BPM ballad); intro 0:02-0:20 rubato (~75)
Grid: 8   (one tab column = 1/8 note)
Pitch offset: +7 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Confidence: overall MEDIUM. Tuning (open D) high; capo (none) high; key (D) high; chord progression medium-high; picking pattern / exact notes low-medium (transcribed from a mix with vocals; rubato).

Style: fingerpicked open-D ballad; thumb alternates mostly between the open 5th (A) and 4th (D) strings,
  fingers pick the open F#/A/D strings and add melody on the top string (fret 2 = E, 4 = F#, 5 = G, 7 = A).
Why open D: the most frequent notes are exactly the open strings A2 D3 F#3 A3 D4 (+D2); F#3 is as common
  as D3/A3 while F#4 is rare; E2/E3 are absent and G3/B3 are weak (no open G or B string ringing).
  Chord shapes seen/heard: G = 5x05x0 (6th string fret 5 over open D strings), Gm = 3rd string moves 5 -> 4,
  B7 = x21000 near the nut, E = barre 2, Eb = barre 1.  No capo is visible (nut clear in the video).
Vocals are sung over this part; the tab is the guitar only.

Chord progression (time in video -> chord)
  0:02.10 D  |  0:07.90 G5  |  0:09.20 D  |  0:12.40 Gm6  |  0:14.60 D  |  0:31.56 Bm
  0:32.80 D  |  0:38.27 Bm  |  0:39.40 D  |  0:44.70 Bm  |  0:46.35 D  |  1:00.00 Bm
  1:03.40 D  |  1:04.80 Bm  |  1:06.90 D  |  1:14.70 Bm  |  1:19.50 D  |  1:27.50 Bm
  1:29.20 G  |  1:30.60 Gm  |  1:32.30 D  |  1:50.00 Bm  |  1:51.20 G  |  1:52.50 D
  2:02.70 Bm  |  2:04.40 G  |  2:05.20 D  |  2:18.10 F#7/A#  |  2:18.90 Bm  |  2:20.90 D7/C
  2:22.20 D  |  2:45.10 Bm  |  2:48.00 D  |  2:49.30 D7/C  |  2:50.50 D  |  2:53.00 Bm7
  2:54.00 B7  |  2:55.00 E  |  2:56.40 G  |  2:58.00 Gm  |  2:59.70 D  |  3:20.30 G
  3:22.20 D  |  3:28.20 Bm/F#  |  3:29.20 Gm  |  3:30.10 D  |  3:32.70 Bm  |  3:34.20 D
  3:43.60 Bm  |  3:46.00 D  |  3:58.00 Bm  |  3:59.20 D  |  4:00.50 G  |  4:01.80 D7/C
  4:03.10 D  |  4:05.70 Bm7  |  4:06.90 B7  |  4:07.60 E  |  4:09.50 G  |  4:11.50 Gm
  4:13.10 D  |  4:20.70 D7/C  |  4:21.70 D  |  4:24.40 Bm7  |  4:26.00 B7  |  4:26.80 E
  4:28.40 G  |  4:30.00 Gm  |  4:33.20 G  |  4:34.00 D  |  4:35.00 G  |  4:36.30 Eb
  4:39.30 D

Form (vocal sections from the separated vocal track; one bar = 4 counts at ~140 = ~1.7 s):
  Intro 0:01-0:21 (rubato)            D (Dadd9 picking) - G5 - D - Gm6 - D
  Vocal 1  0:21-0:51                  D ... (short Bm at 0:31, 0:38, 0:44) ... D
  Interlude 0:51-0:59                 D
  Vocal 2  0:59-1:17                  Bm - D - Bm - D ... Bm (1:14) - D
  Instrumental 1:17-1:41              D ... Bm - G - Gm - D
  Vocal 3  1:41-2:19                  D ... Bm - G - D ... Bm - G - D ... F#7/A# - Bm - D7/C - D
  Vocal 4  2:33-3:00                  D ... Bm - D - D7/C - D - Bm7 - B7 - E - G - Gm - D
  Instrumental 3:00-3:38              D ... G - D ... Bm/F# - Gm - D - Bm - D
  Vocal 5  3:38-4:28                  D ... Bm - D - G - D7/C - D - Bm7 - B7 - E - G - Gm - D ... D7/C - D
  Outro 4:24-4:51                     Bm7 - B7 - E - G - Gm - G - D - G - Eb - D

Chord shapes (open D; lowest string -> highest string; x = not played):
  D       0 0 0 0 0 0   (top-string melody: fret 2 = E, 4 = F#, 5 = G, 7 = A; 5th string 2/3 = passing B/C bass)
  Bm      x 2 0 0 2 0      Bm7    x 2 0 0 0 0      Bm/F#  4 x 0 x 2 x
  G       5 x 0 5 x 0      Gm     5 x 0 4 x 0      Gm6    5 x 0 4 x 2      G5   5 x 0 x x 0
  B7      x 2 1 0 0 x      E      x x 2 2 2 2 (barre 2)      Eb   1 1 1 1 1 1 (barre 1)
  F#7/A#  x 1 x 0 1 2      D7/C   x 3 0 0 0 0
  (open strings are allowed to ring through most shapes - that drone is the sound of the tuning)

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

[Intro (rubato)]
@ 0:01.39
           D
d |----------2-----|2---0-----7-----|----------------|--2-4---7-------|
A |--------0-------|0---0-----7-----|----------------|0-------7-0-----|
F#|------0-----0---|0---------8-----|----------------|0---0-------5---|
D |----------------|----0-----0-----|------------0---|----------------|
A |----------------|----------------|----------------|--0-------0-----|
D |--------0-------|------------5---|5---------------|----------------|

@ 0:07.68
     G5             D                                 Gm6
d |7---------------|------------0---|--2-----2---0---|2---------------|
A |----------------|----------------|------------0---|0---------------|
F#|----------------|----------------|0---0---0-------|0-------4-------|
D |--0---0---0-----|----------------|----0-------0---|--0---5---------|
A |----------------|----------------|--0-----0-------|----------------|
D |----5---5-------|----------------|0-----------0---|--5-------------|

@ 0:14.20
       D
d |----------2-----|4---2-----------|----2-----------|----------2-----|
A |--------2---0---|----0---2---0---|----0---0-------|--------0-0-0---|
F#|------4---------|----------------|--------------0-|--------0-0-0---|
D |----------------|----------------|--0-------------|----------0-0---|
A |----------------|----------------|----------------|----------0-0---|
D |--------------0-|----0---------5-|----------------|----------------|

[Vocal section 1]
@ 0:21.51
  
d |2-----2---2---2-|0-------2-------|------9---7---2-|------2---------|
A |0---------5-----|----------------|2-----0-0---0---|----------------|
F#|0-0---0-0-------|--------------0-|0---------------|------0-0-0-0---|
D |----------0---0-|------0---0-0---|----------0-----|------0-0-0-----|
A |0-----0---------|0---0-0---0-0---|2-2-2---0---0-0-|------0---0-0---|
D |--0-------------|----------------|----------------|----------------|

@ 0:28.28
                                     Bm          D
d |------2-2-0---0-|------2-2-2-----|----------------|----------------|
A |----------------|------5-5-------|----2---------2-|2-----0-0-0-0---|
F#|----------------|----------------|----------------|------------0-0-|
D |----------------|------0-0-------|------0-0-0-0---|----------0-0---|
A |----------------|0---0-0---------|2---2-------0-2-|--2-------0---0-|
D |----------------|----------------|----------------|----------------|

@ 0:34.88
                                     Bm          D
d |2-----2-2-0-----|----0-2-2-2-----|------9-------7-|------0-0-----2-|
A |----------------|------5---------|2-2---0-0-0---7-|--0---7-7-------|
F#|0-----0---------|--------------0-|----------0-----|------0-0-0-0---|
D |0---------0-----|------0-0-------|----------0-----|0---5-0---0-----|
A |0-------0-0---0-|0---0-----0-----|2---2---------0-|------------0-0-|
D |----------------|----------------|----------------|----------------|

@ 0:41.42
                                     Bm               D
d |------2-2-2---2-|0-------2-------|------0---2-2---|----------------|
A |----------------|----------------|----2-----5-0-2-|------0-0-0-0---|
F#|--0-------------|--------------0-|--0-------------|--------------0-|
D |--0-------0-----|------0-0-0---0-|--0---0---------|----------------|
A |----------------|0---0-0---0-0---|2---2-2-----0---|2-------1---0---|
D |----0-----------|----------------|----------------|----------------|

@ 0:48.04
  
d |----2-2-------2-|----------------|
A |0---0-0-0---0---|0-0-0---0---0---|
F#|--0-----0-0---0-|----0-0-0-0-----|
D |----------------|----0---0-0---0-|
A |1-------0-------|0-0-----0-----0-|
D |0---------------|----------------|

[Interlude]
@ 0:51.52
  
d |2-----2---------|2---------------|----------------|----------------|
A |0---0-0-0---0---|--0-0-0-0-0-----|--------0-0-2---|----0-0---0-----|
F#|--------0-0-----|----0-0-0-0-0-0-|0-------0-----0-|0-----0-0-0-1---|
D |--------0-0-----|--------0-0-0-0-|0---------0---0-|----------0---0-|
A |0-------0-------|--------0-0-0-0-|0-------------0-|----0---------0-|
D |----------------|--0-------------|0-------------0-|----------------|

[Vocal section 2]
@ 0:58.74
               Bm                                D            Bm
d |------0-2-----5-|--4---2-----2-0-|--------2-------|7-------------2-|
A |0-0-0-0-0-------|----------------|----------------|----------------|
F#|0-0---0-0-----0-|--------------0-|----0-----0-0---|0---------0-0---|
D |0-0-------------|----------0-----|----0---0-------|------------0---|
A |0-0-----0-------|1---------------|2---0-2-----0---|--3-3-----------|
D |----------------|----------------|----------------|----------------|

@ 1:05.62
               D
d |----2---2-------|0-------2-------|------------0---|----------------|
A |--------------3-|3---3-3-3-3---0-|----0-0-0-0-0---|--------0-------|
F#|----------------|------------0-0-|0-------------0-|------1-0-0-1---|
D |--------0-0---0-|----0---0-0-0-0-|0-0-----0-0---0-|----0---0-0---0-|
A |------------0---|----0---0-0-0-0-|0-2-----------0-|----0-0-1-0---0-|
D |----------------|5---------------|----------------|----------------|

@ 1:12.58
                        Bm
d |------0-2-2---5-|----4-2-2-2-0-4-|----2---2-----7-|
A |0---0---0-------|----------------|------2-0-------|
F#|0-------0-------|----------------|--0-0-0-0-0-0-0-|
D |0---------------|----------0-----|----0---0---0-0-|
A |0-0-----0-------|1---------------|2-2-0-2---------|
D |----------------|----------------|------------8---|

[Instrumental]
@ 1:17.54
                        D
d |------5-------2-|----2---2-------|----4---4-2---4-|2---2---2-2-----|
A |----------------|----------------|----7---------7-|0---------0-0-0-|
F#|------0---0-----|0-----0-0-------|------0---------|1-----1---0-0-0-|
D |----------------|----0-----0-----|5-----5-----5-0-|0---------0---0-|
A |--3-3-3---------|------0-----0---|--------------0-|----------0-0---|
D |----------------|----------------|----------------|----------------|

@ 1:24.01
                                     Bm               G           Gm
d |--------------4-|----------------|2-----------0-2-|--------0-2---0-|
A |--------0-0---0-|0---0-----0-----|------2-2-2-----|----------5-----|
F#|--------0-0---0-|----------------|------0---------|------5-5-5---4-|
D |0---0-----------|--------0-0---0-|----------------|----------------|
A |----------------|3-------0-3-----|2---2-----------|----------------|
D |----------------|----------------|----------------|----------------|

@ 1:30.96
               D
d |----0---------2-|----2---2-------|--------2-------|--------------2-|
A |--------------0-|0---0---0---0-0-|0-------0---0-0-|0-----0-0---0-0-|
F#|----4-4-4-4---0-|------0-0-0-----|----0---0-----0-|0-------0-0-----|
D |--------0-0-----|----0---0-0-----|--------0-------|0---------0-----|
A |----------0-----|--------0-------|--------0-------|--------0-------|
D |5---------------|0---0-------0-0-|------------0---|0-----------0---|

@ 1:37.92
  
d |------2-2-------|------2-2-----2-|
A |--0-0---0---0---|----------------|
F#|----0---0-0-0-0-|----0-0-0-------|
D |----------0-0---|----------0-----|
A |----------0-0---|0---------0---0-|
D |--0-------------|----------------|

[Vocal section 3]
@ 1:41.36
  
d |----2---2-2---4-|------9-------2-|------2-2---2-2-|----------2---2-|
A |----------------|------0-0-------|------5---------|----------------|
F#|----------------|0-----5---------|----1-0-0-0-0---|----------------|
D |------0---0-0-0-|----------------|--------0-0-0---|0-------0-0-----|
A |0---0-0---------|2---2---------0-|--0-------0---0-|--------0-----0-|
D |----------------|----------------|----------------|0---------------|

@ 1:47.90
                        Bm           G           D
d |----------------|--2---2---------|--------------2-|------2---2---2-|
A |----------------|------4---0-0-2-|2-----0-0-0-0-0-|0---0-----5-----|
F#|--------------0-|----------------|------------0-0-|0-----0---------|
D |------0-0-------|----------0-----|------0---0-----|--------0-0-----|
A |0---0-0---0-----|2---2---2---0-2-|----2-1-1---0-0-|----------------|
D |----------------|----------------|5---5-----------|----0-----------|

@ 1:54.53
  
d |0-------0-------|------9---7---2-|------2-------2-|--------2-0---2-|
A |--------7-------|------0-7-0-----|------5---------|----------------|
F#|----------------|----------------|----1-0-0-0-0-0-|----------------|
D |------0---0-0---|------0-----0---|------0-----0---|----------0-----|
A |0---0-0---0-0---|2-2-2-----------|----------0-0-0-|----------------|
D |----------------|----------------|----------------|--0-------------|

@ 2:01.09
                    Bm               G       D
d |--------2-------|------2-4-2-----|----------------|----2-2-2-------|
A |----------------|2---------0---2-|----------------|0---0-0-0-------|
F#|----------------|----------------|5-------------0-|----0---0-0---0-|
D |0-----0-0-0-0---|----0-0---0---0-|--------0-------|----------0---0-|
A |0---0-0---0---0-|2---2-----------|--2-----0-0-0---|--------0-------|
D |----------------|----------------|5---5-----------|0---------------|

@ 2:07.72
  
d |----0---2-------|7-------------2-|----------------|----------------|
A |0-0-0-0-0-0-0-7-|7---0-0-0---0---|0-----0-0-------|------0-0-0-0---|
F#|----0-0---0-----|----------0-----|----0-0-0-0-0-0-|0-----------5-0-|
D |----0-----0-0---|----------0-----|----0-----0---0-|0-------0-0---0-|
A |--0-------------|----------------|--------0-0-0-0-|0-0-----0-----0-|
D |----------------|----------------|----------------|----------------|

@ 2:14.53
                                     F#7/A#  Bm
d |----------------|--------2-2---5-|------2-2-2---4-|
A |--------0-------|0-0-------------|----------------|
F#|1---0-0-----1---|0-------0---0-0-|----------0-----|
D |0---0-0---0---0-|0---------------|----------0-----|
A |----0-0-0-------|0-0-----0-------|1---------------|
D |----------------|----------------|----------------|

[Interlude]
@ 2:19.65
               D7/C         D
d |----2---------7-|----------2---2-|----2---2-4-----|--------2-------|
A |--------0-------|----------------|----------7-----|--------3-3---0-|
F#|----0-0-0-0-0---|--------0-0-0---|--------------6-|------1-------0-|
D |----0-----------|--------0-------|----0-----0---0-|5---0-----0-0-0-|
A |2---0-2-2-------|----3-----------|----------------|----0-0---0-0-0-|
D |--------7-------|----------------|----------------|--5---5---------|

@ 2:26.29
  
d |--------2---2---|----------------|------0-2---5-5-|--4---2-2-2-0-4-|
A |------0-0-0-----|--------0-------|----0---0-------|----------5-----|
F#|0-------------0-|--------0---0---|0-------------0-|--0-------------|
D |--------0-0---0-|----0-----0-0-0-|0-0-----0-------|----------0-----|
A |0-2-----------0-|----0-0---------|0-0-0---0-------|1---------------|
D |----------------|----------------|----------------|----------------|

[Vocal section 4 (ends with the B7-E-G-Gm turnaround)]
@ 2:33.03
  
d |----2-2---------|------0-----4-2-|----2---2-2-2---|----2---4-2-----|
A |------2-0-------|----------------|------------4---|--------7-------|
F#|--0-0---0-0-0---|--------0-0-0---|0-----0-0-0-----|1---------1---0-|
D |--------0-----0-|0-------0-----0-|----------0---0-|----0-5-0-0-0---|
A |2-----2---------|3---3-----------|------0---------|------0-------0-|
D |----------------|----------------|----------------|--------8-------|

@ 2:39.55
                                                          Bm
d |----------------|----------------|------0-2-2-----|------2---2-----|
A |----0---0-0---0-|0---0-----------|--0-0-----------|----------------|
F#|0-------------0-|0-------0-----0-|0---0---0-----0-|0-------0-0-----|
D |0-0-----0-0---0-|5-----0---0---0-|--0-----0-------|--------------0-|
A |0-------0-----0-|--0-0-----------|0-0-------0-----|1---1-----------|
D |----------------|----------------|----------------|----------------|

@ 2:46.31
                    D           D7/C         D
d |----------------|------5-5-4---2-|----------------|----------4---4-|
A |----------------|0---------------|----------0-----|0-----0-0-0-----|
F#|----------------|----------------|--------0-0-----|0-0---0---0-----|
D |--------0-----0-|----------------|--------0-------|----------------|
A |2---0-2---2-----|----------------|3---3---0-------|1---------------|
D |----------------|--5-------------|----------------|----------------|

@ 2:52.98
   Bm7       B7       E           G              Gm           D
d |--------------4-|----2-2-1-----2-|----------0---0-|--------2-------|
A |--0-----0-0-0-0-|------2-2-2---2-|----------------|----------1-----|
F#|--------0-0---0-|------3---2-----|------5-5-5-5-4-|------4-4-----0-|
D |--------0-------|1---------------|--0---0---0-----|----0-----0-0---|
A |2---2-------2---|----------------|----------------|----0-0-1-0-0-0-|
D |----------------|----------------|5---5-------5---|5---------------|

[Instrumental break]
@ 3:00.67
  
d |----2-----------|2-----2-2-----2-|2-----2-------2-|--------2-------|
A |----0---0---0---|--0-0-0-------0-|0---0-0-0-----0-|0---0---0-------|
F#|----0---0-0---0-|----0-0-0-0-----|--------0-0---0-|----0-0-0-------|
D |0---------0-----|----------0-----|----------0-----|----0---0-----0-|
A |----0-----------|------0---------|------0-0-----0-|----------0---0-|
D |----------------|----------------|----------------|----------------|

@ 3:08.00
  
d |----2-----0---9-|--7---------0---|----2-3---0---2-|----2-----------|
A |--0-0-0-2-------|------7-------0-|--0-0-2-2-------|----0-4---2-0---|
F#|0-----4-0-------|----------------|0-----4---------|--0---------0---|
D |----0-----------|--------0-------|0---3-0---------|--------0-0-----|
A |0-0-0-1---------|--------0-----0-|0-----1---------|--------------0-|
D |--------4-------|5---------------|--------4-----5-|----------------|

@ 3:15.35
                                                 G                D
d |----2-3---0---9-|--7-------------|----2-3---0-----|----------------|
A |--0-0-2---------|------7---------|--0-0-2---------|----------0-----|
F#|0-----4---------|--0---------0---|0-----4-0-----5-|----------------|
D |0---0-----------|--------0---0---|0-------------5-|----------------|
A |0---------------|--------------0-|0---------------|----------------|
D |--------4-------|5---------------|--------4-----5-|----------------|

@ 3:22.67
                                                      Bm/F#   Gm
d |------------4-0-|0---7-4---7---2-|2---4-2-----7-7-|------------0---|
A |----------------|----------------|----------------|----0-2---------|
F#|--------0---0---|--------------0-|----------------|--------------4-|
D |--0---0-0---0---|----0-----------|----------------|------0---0---0-|
A |--0-----1-0-0-0-|1-1-----2-------|1-1-------------|----------------|
D |----------------|----------------|--------5-------|4---------------|

@ 3:30.11
   D                Bm          D
d |--------7-0---7-|8---7---------2-|0---7---7-5---2-|2-4-2-----------|
A |----0-0-------0-|----------------|----0-----------|2-----0---------|
F#|----0---0-------|----0---0---0---|0---0-----0-----|------0---------|
D |------0-0-------|----------------|----0-----------|--------0-------|
A |----0---0-1-1---|----------------|----------------|------0---------|
D |4---------------|9-9-------------|5-------4---4---|----------------|

[Vocal section 5]
@ 3:38.20
                                                      Bm
d |----------------|----------------|------0-2-2---5-|------2-2-0-0-4-|
A |--0---0-0-0-----|0-------0---0---|----0---0-------|----------------|
F#|0-------0-----0-|----0-1-0---1-0-|0-------0-----0-|--0-------------|
D |0-0---2---0---0-|------0-0-0---0-|0---------------|----------0-----|
A |0-------------0-|----0-0-0-------|0---0---0-------|1---------------|
D |----------------|----------------|----------------|----------------|

@ 3:45.14
           D
d |----2---2-------|--------------2-|----4---2-4-----|----------------|
A |------2-0-------|----------------|----7-----7---3-|3---3-3-3-------|
F#|----0-----0-0---|----------0-----|0-----0---------|------1-------0-|
D |----0---0-0-----|----------------|----0-----0---0-|----0---0---0-0-|
A |2-----2-----0---|3---3-3---------|--------0-------|----0---0-0-0-0-|
D |----------------|----------------|----------------|5---------------|

@ 3:51.91
                                                              Bm
d |--------------2-|----------------|----------2---4-|------2-2-2---0-|
A |----------0-2-0-|0---------0-----|----0---0-------|----------------|
F#|0-----------3-0-|0-----1-0---1---|0-------0-------|0-----0-0-0-----|
D |0-------0-----0-|----0-----0---0-|0---------------|--------------0-|
A |0-------------0-|----0-----------|0-0-----0-0-----|1-1-1-1---------|
D |----------------|----------------|----------------|----------------|

@ 3:58.80
       D            G           D7/C         D
d |----------------|------5---4-7-2-|--------2-------|2-----------5---|
A |----------------|--0-----------0-|--------0-0-0-0-|0-----0-0-0-----|
F#|----------------|----------------|--------0-0-0-0-|------0-0-------|
D |--0-0---0-------|--0-5-----------|--------0-0---0-|--------0-0-----|
A |2---0-2-2-2-0---|----------------|3---3---0---0---|1---------------|
D |----------------|--5-------------|7---------------|----------------|

@ 4:05.69
   Bm7       B7     E                G                Gm          D
d |--------------4-|7---2---2-----2-|------2-------0-|----------------|
A |----------0-0-0-|------2---2-2---|------5---------|----------------|
F#|--------0-----0-|----------2-----|------5-5-5---4-|----4-4-4-4---0-|
D |--------0-0-----|----------------|--0-------0-----|5---0-0-0---0-0-|
A |2-2-2-----------|6-------3---1---|----------------|----0-0-1-0-0-0-|
D |----------------|----------------|----------------|5---------------|

@ 4:13.60
  
d |------0---2-3-4-|------2-2-2-----|----------------|------5-5-4---2-|
A |----0---0-------|----------------|2---0-----------|0---0-----0---0-|
F#|0-------0-------|------0-0-------|----------------|----------------|
D |0-------0-------|----0-0-------0-|----------------|--0-5-----0-----|
A |0-0-0---0-------|1-1-1-----------|2-----2---2-----|----------0---0-|
D |----------------|----------------|----------------|--5-5-----------|

@ 4:20.71
   D7/C    D                         Bm7         B7     E
d |----2-----------|2---------5---4-|--------------4-|--4-2---------2-|
A |--------0-0---0-|0---------9---0-|--0-----0-------|------2-2-------|
F#|--------0-0-----|0-0-0-0-0-------|----------------|0-----0---2-----|
D |----------0-----|------0-0-0-----|----------------|1-------1-------|
A |3---3---0---3---|1---------------|2---2-----2-0---|------2-2---0-0-|
D |7---------0-----|----------------|----------------|----------------|

[Outro (G - Gm - D - G - Eb - D)]
@ 4:28.43
   G           Gm                 G    D     G     Eb               D
d |----------------|--------2-------|----------------|----------------|
A |----------------|--------5-------|----------------|----------------|
F#|------5-5-5---4-|----4-4-4-4---0-|5-------5-5-5-1-|1-------1---1-0-|
D |------0-0---5-0-|------0---0---0-|0-------5-5-0---|--1-----1-1-----|
A |0---0-----------|1---0-0---0-0-0-|--------5-5---1-|1-------1-1-1-0-|
D |5---5-------5---|5-------------0-|----------------|--------------8-|

@ 4:39.57
  
d |----------------|----------------|----------------|----------------|
A |----------------|0---0-----------|----------------|----------------|
F#|0---0---0-------|0---------------|----------------|0-----------0---|
D |0---------------|0---------0-----|--------0---0---|--------------0-|
A |0-------0-------|0-------0-0-0---|0-----0-0-------|0-------0---0---|
D |----------------|----------------|----------------|----------------|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 009</summary>

```text
====================================================================================================
 song09 - strummed sing-along in D major (guitarist sings), no capo, drone voicings
====================================================================================================
 Source        : song09.mp4 (4:51); steel-string acoustic, strummed, the player sings throughout
                 (lyrics are not reproduced here; whisper only caught fragments). One continuous
                 performance - no stops.
 Tuning        : Standard E A D G B E; in tune (+8 cents)
 Capo          : none (nut and first frets visible, no capo). The hand moves between roughly frets 2
                 and 9 with the thumb over the neck; the fingers cannot be read at this resolution,
                 so the voicings below are inferred from the sounding notes (open A/D bass, A3-D4 +
                 open high E on top).
 Key           : D major
 Tempo / feel  : 4/4, q = ~140 counted in 8ths (feels like a 70-bpm ballad with 16th strums);
                 constant D-U strumming
 Progression   : Intro: | Dadd9 | Gadd9  Dadd9 | D/A  D/F# | Gadd9 | Dadd9 | Em7  E | E | Asus4 |
                 Verse: | Asus4 | Bmadd11  D/A | Dadd9 | Asus4 | Dadd9  Bmadd11 | ...  (A - Bm - D
                 over an open-A / open-D pedal)
                 Chorus: | D/A  F#7 | Dadd9  Bmadd11 | Dadd9 | F#7 | D/F#  Bmadd11 | Dadd9 |
                 (F#7 -> Bm is the V/vi move; the open high e rings through almost everything)
 Structure     : Intro 0:00 - verse 0:19 - chorus 1:00 - verse 2 / bridge 1:20 - chorus x2 2:11 -
                 interlude 2:51 - last choruses 3:22 - outro 4:25 (section labels in the tab).
 Confidence    : Key HIGH. Chord functions MEDIUM (the voice sits in the guitar's range; chords come
                 from an HMM over bass + pitch classes). Bar-by-bar chord choice MEDIUM-LOW.
                 Voicings LOW-MEDIUM (inferred from the sounding notes: the open high e (E4) and
                 A3/D4 ring through most chords; the video is too small to read fingers). Strum
                 rhythm MEDIUM (taken from the recording's onsets).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   Dadd9        x 5 4 2 3 0              D F# A D E
   D/F#         2 x 4 2 3 0              thumb on F#
   D/A          x 0 4 2 3 0              open A bass
   A/C#         x 4 2 2 2 0
   Asus4        x 0 0 2 3 0              A D A D E
   A            x 0 2 2 2 0
   Bmadd11      x 2 4 4 3 0              B F# B D E
   Gadd9        3 x 0 2 3 0              G D A D E
   G            3 2 0 0 3 3
   F#7          2 x 4 3 2 0              F# F# A# C# E
   Em7          0 2 2 0 3 0
   E            0 2 2 1 0 0
   F#m          2 4 4 2 2 2
----------------------------------------------------------------------------------------------------
 Strum tab: each column is one strum (D = down, U = up) on an 8th-note grid at q~140;
 down-strums hit all strings shown, up-strums the top 3-4 strings. Chord changes can fall on any beat.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber: standard / capo 0 / D major correct. Triage 'false_start' is wrong: the
                 'opening phrase returns' it saw at 1:21 and 2:33 are just repeated sections of a
                 complete take. Its chart flickers through 40+ chord names (A#maj7, Gm, F#dim,
                 G#m...) because the vocal melody leaks into the notes, and its note-by-note tab is
                 not playable as a strum part. I replaced it with an HMM-smoothed chord track over a
                 small D-major vocabulary and a strum tab driven by the onsets.
====================================================================================================


[Intro: Dadd9 - Gadd9 - D/F# - Em7 - E - Asus4]
                          Dadd9    F#7                              Dadd9    (0:00, bar 1)
e|------------------------0---0---|0-------------------------------|0---0---0-------0-------0-------|
B|------------------------3---3---|2-------------------------------|3---3---3-------3-------3-------|
G|------------------------2---2---|3-------------------------------|2---2---2-------2-------2-------|
D|------------------------4---4---|4-------------------------------|4---4---4-------4-------4-------|
A|------------------------5-------|--------------------------------|5-------5-------5-------5-------|
E|--------------------------------|2-------------------------------|--------------------------------|
                          D   U    D                                D   U   D       D       D

  Gadd9                   Dadd9    Dadd9   D/A     D/F#             D/F#    Gadd9    (0:03, bar 4)
e|0---0-------0-------------------|--------0---0---0-------0-------|0-------0---0-------0---0-------|
B|3---3-------3-------------------|--------3---3---3-------3-------|3-------3---3-------3---3-------|
G|2---2-------2-------------------|--------2---2---2-------2-------|2-------2---2-------2---2-------|
D|0---0-------0-------------------|--------4---4---4-------4-------|4-------0---0-------0---0-------|
A|--------------------------------|--------0-----------------------|--------------------------------|
E|3-------------------------------|----------------2-------2-------|2-------3---------------3-------|
  D   U       U                            D   U   D       D        D       D   U       U   D

  Gadd9   Dadd9                    Dadd9                            Em7             E    (0:09, bar 7)
e|0-------------------------------|0---0---0-------0-------0-------|0---0-------0---0---------------|
B|3-------------------------------|3---3---3-------3-------3-------|3---3-------3---0---------------|
G|2-------------------------------|2---2---2-------2-------2-------|0---0-------0---1---------------|
D|0-------------------------------|4---4---4-------4-------4-------|2---2-------2---2---------------|
A|--------------------------------|5-------5-------5-------5-------|2---------------2---------------|
E|3-------------------------------|--------------------------------|0---------------0---------------|
  D                                D   U   D       D       D        D   U       U   D

  E                                Dadd9           E       Asus4    Asus4    (0:14, bar 10)
e|----------------------------0---|0-----------0-------0-----------|0---------------0-------0-------|
B|----------------------------0---|3-----------3-------0-----------|3---------------3-------3-------|
G|----------------------------1---|2-----------2-------1-----------|2---------------2-------2-------|
D|----------------------------2---|4-----------4-------2-----------|0---------------0-------0-------|
A|--------------------------------|5-------------------------------|0---------------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
                              U    D           U       U            D               D       D


[Verse: Asus4 / D/A - Bmadd11 - Dadd9 (I - V - vi feel over an A/D pedal)]
  D/F#                    D/A      D/A     Dadd9                    Asus4    (0:19, bar 13)
e|0-----------------------0---0---|0-------0-----------0---0---0---|----0---0-------0---0---0---0---|
B|3-----------------------3---3---|3-------3-----------3---3---3---|----3---3-------3---3---3---3---|
G|2-----------------------2---2---|2-------2-----------2---2---2---|----2---2-------2---2---2---2---|
D|4-----------------------4---4---|4-------4-----------4---4---4---|----0---0-------0---0---0---0---|
A|------------------------0-------|0-------5---------------5-------|--------0-------0-------0-------|
E|2-------------------------------|--------------------------------|--------------------------------|
  D                       D   U    D       D           U   D   U        U   D       D   U   D   U

  Asus4   Bmadd11         D/A      D/A                              D/A                     Dadd9    (0:24, bar 16)
e|0---0---0---0---0---0---0---0---|0---0---0---0-------0---0---0---|0---0---0---0---0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3-------3---3---3---|3---3---3---3---3---3---3---3---|
G|2---2---4---4---4---4---2---2---|2---2---2---2-------2---2---2---|2---2---2---2---2---2---2---2---|
D|0---0---4---4---4---4---4---4---|4---4---4---4-------4---4---4---|4---4---4---4---4---4---4---4---|
A|0-------2-------2-------0-------|0-------0---------------0-------|0-------0-------0-------5-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U       U   D   U    D   U   D   U   D   U   D   U

  Asus4                            Dadd9   Bmadd11                  Bmadd11         D/A    (0:29, bar 19)
e|0---0---0-------0---0---0---0---|0---0---0-------0---0---0---0---|0---0---0-------0---0---0---0---|
B|3---3---3-------3---3---3---3---|3---3---3-------3---3---3---3---|3---3---3-------3---3---3---3---|
G|2---2---2-------2---2---2---2---|2---2---4-------4---4---4---4---|4---4---4-------2---2---2---2---|
D|0---0---0-------0---0---0---0---|4---4---4-------4---4---4---4---|4---4---4-------4---4---4---4---|
A|0-------0-------0-------0-------|5-------2-------2-------2-------|2-------2-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D       D   U   D   U    D   U   D       D   U   D   U    D   U   D       D   U   D   U

  D/A                     Dadd9    Asus4                            Dadd9   Bmadd11         Asus4    (0:34, bar 22)
e|0---0---0---0-------0---0---0---|0---0---0-------0---0---0---0---|0---0---0-------0---0---0---0---|
B|3---3---3---3-------3---3---3---|3---3---3-------3---3---3---3---|3---3---3-------3---3---3---3---|
G|2---2---2---2-------2---2---2---|2---2---2-------2---2---2---2---|2---2---4-------4---4---2---2---|
D|4---4---4---4-------4---4---4---|0---0---0-------0---0---0---0---|4---4---4-------4---4---0---0---|
A|0-------0---------------5-------|0-------0-------0-------0-------|5-------2-------2-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U       U   D   U    D   U   D       D   U   D   U    D   U   D       D   U   D   U

  Asus4   E       A/C#    D/A      D/A             Dadd9            Asus4    (0:39, bar 25)
e|0---0---0---0---0---0---0---0---|0---0---0---0-------0---0---0---|0---0---0-------0---0---0---0---|
B|3---3---0---0---2---2---3---3---|3---3---3---3-------3---3---3---|3---3---3-------3---3---3---3---|
G|2---2---1---1---2---2---2---2---|2---2---2---2-------2---2---2---|2---2---2-------2---2---2---2---|
D|0---0---2---2---2---2---4---4---|4---4---4---4-------4---4---4---|0---0---0-------0---0---0---0---|
A|0-------2-------4-------0-------|0-------0---------------5-------|0-------0-------0-------0-------|
E|--------0-----------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U       U   D   U    D   U   D       D   U   D   U

  D/A     Bmadd11                  Bmadd11         D/A              D/A    (0:44, bar 28)
e|0---0---0---0---0---0---0---0---|0---0-----------0-------0---0---|0---0---0-------0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3-----------3-------3---3---|3---3---3-------3---3---3---3---|
G|2---2---4---4---4---4---4---4---|4---4-----------2-------2---2---|2---2---2-------2---2---2---2---|
D|4---4---4---4---4---4---4---4---|4---4-----------4-------4---4---|4---4---4-------4---4---4---4---|
A|0-------2-------2-------2-------|2---------------0-------0-------|0-------0-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U           D       D   U    D   U   D       D   U   D   U

  D/A                              D/A                              D/A    (0:49, bar 31)
e|0---0---0---0---0---0---0---0---|0---0---0-------0---0---0---0---|0---0---0---0---0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3-------3---3---3---3---|3---3---3---3---3---3---3---3---|
G|2---2---2---2---2---2---2---2---|2---2---2-------2---2---2---2---|2---2---2---2---2---2---2---2---|
D|4---4---4---4---4---4---4---4---|4---4---4-------4---4---4---4---|4---4---4---4---4---4---4---4---|
A|0-------0-------0-------0-------|0-------0-------0-------0-------|0-------0-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D       D   U   D   U    D   U   D   U   D   U   D   U

  Dadd9                            D/A                     Dadd9    Dadd9   D/A    (0:54, bar 34)
e|0---0---0---0---0-----------0---|0-------0---0-------0---0---0---|0---0---0---0---0---0---0---0---|
B|3---3---3---3---3-----------3---|3-------3---3-------3---3---3---|3---3---3---3---3---3---3---3---|
G|2---2---2---2---2-----------2---|2-------2---2-------2---2---2---|2---2---2---2---2---2---2---2---|
D|4---4---4---4---4-----------4---|4-------4---4-------4---4---4---|4---4---4---4---4---4---4---4---|
A|5-------5-------5---------------|0-------0---------------5-------|5-------0-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D           U    D       D   U       U   D   U    D   U   D   U   D   U   D   U


[Chorus: D/A - F#7 - Bmadd11 - Dadd9 - D/F#]
  D/A             F#7              Dadd9   Bmadd11         D/A      Dadd9    (0:59, bar 37)
e|0---0---0---0---0-----------0---|0---0---0---0---0-------0---0---|0---0---0---0---0---0-------0---|
B|3---3---3---3---2-----------2---|3---3---3---3---3-------3---3---|3---3---3---3---3---3-------3---|
G|2---2---2---2---3-----------3---|2---2---4---4---4-------2---2---|2---2---2---2---2---2-------2---|
D|4---4---4---4---4-----------4---|4---4---4---4---4-------4---4---|4---4---4---4---4---4-------4---|
A|0-------0-----------------------|5-------2-------2-------0-------|5-------5-------5---------------|
E|----------------2---------------|--------------------------------|--------------------------------|
  D   U   D   U   D           U    D   U   D   U   D       D   U    D   U   D   U   D   U       U

  F#7                              D/A     G               D/A      D/A    (1:05, bar 40)
e|0---0---0---0---0-------0---0---|0---0---3---3---3-------0---0---|0---0---0---0---0---0---0---0---|
B|2---2---2---2---2-------2---2---|3---3---3---3---3-------3---3---|3---3---3---3---3---3---3---3---|
G|3---3---3---3---3-------3---3---|2---2---0---0---0-------2---2---|2---2---2---2---2---2---2---2---|
D|4---4---4---4---4-------4---4---|4---4---0---0---0-------4---4---|4---4---4---4---4---4---4---4---|
A|--------------------------------|0-------2-------2-------0-------|0-------0-------0-------0-------|
E|2-------2-------2-------2-------|--------3-------3---------------|--------------------------------|
  D   U   D   U   D       D   U    D   U   D   U   D       D   U    D   U   D   U   D   U   D   U

  D/A                              D/A                              D/A     F#7    (1:10, bar 43)
e|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0---0---|0---0-------0---0---0-------0---|
B|3---3---3---3---3-------3---3---|3---3---3---3---3---3---3---3---|3---3-------2---2---2-------2---|
G|2---2---2---2---2-------2---2---|2---2---2---2---2---2---2---2---|2---2-------3---3---3-------3---|
D|4---4---4---4---4-------4---4---|4---4---4---4---4---4---4---4---|4---4-------4---4---4-------4---|
A|0-------0-------0-------0-------|0-------0-------0-------0-------|0-------------------------------|
E|--------------------------------|--------------------------------|----------------2---------------|
  D   U   D   U   D       D   U    D   U   D   U   D   U   D   U    D   U       U   D   U       U

  D/F#    Bmadd11                  Dadd9                            Dadd9   D/F#            Dadd9    (1:15, bar 46)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3-------3---3---|
G|2---2---4---4---4---4---4---4---|2---2---2---2---2---2---2---2---|2---2---2---2---2-------2---2---|
D|4---4---4---4---4---4---4---4---|4---4---4---4---4---4---4---4---|4---4---4---4---4-------4---4---|
A|--------2-------2-------2-------|5-------5-------5-------5-------|5-----------------------5-------|
E|2-------------------------------|--------------------------------|--------2-------2---------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D   U   D       D   U


[Verse 2 / bridge: Dadd9 - Em7 - Bmadd11 - Asus4 ...]
  Dadd9           D/F#             Em7                              D/A             Dadd9    (1:20, bar 49)
e|0---0---0---0---0-------0---0---|0---0---0---0---0-------0---0---|0---0---0---0---0-------0-------|
B|3---3---3---3---3-------3---3---|3---3---3---3---3-------3---3---|3---3---3---3---3-------3-------|
G|2---2---2---2---2-------2---2---|0---0---0---0---0-------0---0---|2---2---2---2---2-------2-------|
D|4---4---4---4---4-------4---4---|2---2---2---2---2-------2---2---|4---4---4---4---4-------4-------|
A|5-------5-----------------------|2-------2-------2-------2-------|0-------0-------5-------5-------|
E|----------------2-------2-------|0-------0-------0-------0-------|--------------------------------|
  D   U   D   U   D       D   U    D   U   D   U   D       D   U    D   U   D   U   D       D

  D/A                              D/A     Bmadd11                  Bmadd11 Em7    (1:25, bar 52)
e|0---0-------0---0-------0---0---|0---0-----------0-------0---0---|0---0---0-----------------------|
B|3---3-------3---3-------3---3---|3---3-----------3-------3---3---|3---3---3-----------------------|
G|2---2-------2---2-------2---2---|2---2-----------4-------4---4---|4---4---0-----------------------|
D|4---4-------4---4-------4---4---|4---4-----------4-------4---4---|4---4---2-----------------------|
A|0---------------0-------0-------|0---------------2-------2-------|2-------2-----------------------|
E|--------------------------------|--------------------------------|--------0-----------------------|
  D   U       U   D       D   U    D   U           D       D   U    D   U   D

  Em7                              Asus4   Dadd9                    D/A                     D/F#    (1:30, bar 55)
e|0---0-------0-----------0-------|0---0---0---0-----------0---0---|0---0---0---0---0-------0---0---|
B|3---3-------3-----------3-------|3---3---3---3-----------3---3---|3---3---3---3---3-------3---3---|
G|0---0-------0-----------0-------|2---2---2---2-----------2---2---|2---2---2---2---2-------2---2---|
D|2---2-------2-----------2-------|0---0---4---4-----------4---4---|4---4---4---4---4-------4---4---|
A|2-----------------------2-------|0-------5---------------5-------|0-------0-------0---------------|
E|0-----------------------0-------|--------------------------------|------------------------2-------|
  D   U       U           D        D   U   D   U           D   U    D   U   D   U   D       D   U

  Dadd9                            Dadd9                   D/F#     D/A    (1:35, bar 58)
e|0-------0---0---0-------0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|
B|3-------3---3---3-------3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
G|2-------2---2---2-------2---2---|2---2---2---2---2---2---2---2---|2---2---2---2---2---2---2---2---|
D|4-------4---4---4-------4---4---|4---4---4---4---4---4---4---4---|4---4---4---4---4---4---4---4---|
A|5-------5-------5-------5-------|5-------5-------5---------------|0-------0-------0-------0-------|
E|--------------------------------|------------------------2-------|--------------------------------|
  D       D   U   D       D   U    D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U

  Asus4                            Asus4   Dadd9   Bmadd11          Asus4                   Dadd9    (1:41, bar 61)
e|0---0-------0---0-------0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0---0---|
B|3---3-------3---3-------3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3-------3---3---|
G|2---2-------2---2-------2---2---|2---2---2---2---4---4---4---4---|2---2---2---2---2-------2---2---|
D|0---0-------0---0-------0---0---|0---0---4---4---4---4---4---4---|0---0---0---0---0-------4---4---|
A|0---------------0-------0-------|0-------5-------2-------2-------|0-------0-------0-------5-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U       U   D       D   U    D   U   D   U   D   U   D   U    D   U   D   U   D       D   U

  Dadd9                            Dadd9   Asus4                    Asus4   Dadd9   Bmadd11    (1:45, bar 64)
e|0---0---0---0---0---0---0---0---|0---0-------0---0---0---0---0---|0---0---0---0---0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3-------3---3---3---3---3---|3---3---3---3---3---3---3---3---|
G|2---2---2---2---2---2---2---2---|2---2-------2---2---2---2---2---|2---2---2---2---4---4---4---4---|
D|4---4---4---4---4---4---4---4---|4---4-------0---0---0---0---0---|0---0---4---4---4---4---4---4---|
A|5-------5-------5-------5-------|5---------------0-------0-------|0-------5-------2-------2-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U       U   D   U   D   U    D   U   D   U   D   U   D   U

  Bmadd11                 Gadd9    D/A                              A/C#    Asus4    (1:50, bar 67)
e|0---0---0---0---0-------0---0---|0---0---0---0---0---0-------0---|0---0---0---0---0-------0---0---|
B|3---3---3---3---3-------3---3---|3---3---3---3---3---3-------3---|2---2---3---3---3-------3---3---|
G|4---4---4---4---4-------2---2---|2---2---2---2---2---2-------2---|2---2---2---2---2-------2---2---|
D|4---4---4---4---4-------0---0---|4---4---4---4---4---4-------4---|2---2---0---0---0-------0---0---|
A|2-------2-------2---------------|0-------0-------0---------------|4-------0-------0-------0-------|
E|------------------------3-------|--------------------------------|--------------------------------|
  D   U   D   U   D       D   U    D   U   D   U   D   U       U    D   U   D   U   D       D   U

  Asus4           Bmadd11          Asus4                   A/C#     D/A                     Dadd9    (1:55, bar 70)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3-------2---2---|3---3---3---3---3---3---3---3---|
G|2---2---2---2---4---4---4---4---|2---2---2---2---2-------2---2---|2---2---2---2---2---2---2---2---|
D|0---0---0---0---4---4---4---4---|0---0---0---0---0-------2---2---|4---4---4---4---4---4---4---4---|
A|0-------0-------2-------2-------|0-------0-------0-------4-------|0-------0-------0-------5-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D       D   U    D   U   D   U   D   U   D   U

  Dadd9   Asus4                    Asus4   Dadd9   Bmadd11          A/C#    Bmadd11 G    (2:00, bar 73)
e|0---0-------0---0---0---0---0---|0---0---0---0---0-------0---0---|0---0---0---0---3-------3---3---|
B|3---3-------3---3---3---3---3---|3---3---3---3---3-------3---3---|2---2---3---3---3-------3---3---|
G|2---2-------2---2---2---2---2---|2---2---2---2---4-------4---4---|2---2---4---4---0-------0---0---|
D|4---4-------0---0---0---0---0---|0---0---4---4---4-------4---4---|2---2---4---4---0-------0---0---|
A|5---------------0-------0-------|0-------5-------2-------2-------|4-------2-------2-------2-------|
E|--------------------------------|--------------------------------|----------------3-------3-------|
  D   U       U   D   U   D   U    D   U   D   U   D       D   U    D   U   D   U   D       D   U

  D/A                              D/A                              Dadd9    (2:05, bar 76)
e|0---0---0---0---0-------0---0---|0---0---0---0---0-------0---0---|0---0---0---0---0-------0---0---|
B|3---3---3---3---3-------3---3---|3---3---3---3---3-------3---3---|3---3---3---3---3-------3---3---|
G|2---2---2---2---2-------2---2---|2---2---2---2---2-------2---2---|2---2---2---2---2-------2---2---|
D|4---4---4---4---4-------4---4---|4---4---4---4---4-------4---4---|4---4---4---4---4-------4---4---|
A|0-------0-------0-------0-------|0-------0-------0-------0-------|5-------5-------5-------5-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D       D   U    D   U   D   U   D       D   U    D   U   D   U   D       D   U


[Chorus x2: D/A - F#7 - Bmadd11 - D/F# - Dadd9]
  Dadd9                            D/A                              D/A    (2:10, bar 79)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|3---3---3---3---3-------3---3---|
G|2---2---2---2---2---2---2---2---|2---2---2---2---2---2---2---2---|2---2---2---2---2-------2---2---|
D|4---4---4---4---4---4---4---4---|4---4---4---4---4---4---4---4---|4---4---4---4---4-------4---4---|
A|5-------5-------5-------5-------|0-------0-------0-------0-------|0-------0-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D   U   D       D   U

  D/A                              F#7                              Dadd9   Bmadd11         D/A    (2:16, bar 82)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0---0---|
B|3---3---3---3---3---3---3---3---|2---2---2---2---2---2---2---2---|3---3---3---3---3-------3---3---|
G|2---2---2---2---2---2---2---2---|3---3---3---3---3---3---3---3---|2---2---4---4---4-------2---2---|
D|4---4---4---4---4---4---4---4---|4---4---4---4---4---4---4---4---|4---4---4---4---4-------4---4---|
A|0-------0-------0-------0-------|--------------------------------|5-------2-------2-------0-------|
E|--------------------------------|2-------2-------2-------2-------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U   D   U   D       D   U

  D/A     D/F#                     D/F#                             Dadd9           Gadd9    (2:21, bar 85)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0-------|0---0---0---0---0-------0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3-------3-------|3---3---3---3---3-------3---3---|
G|2---2---2---2---2---2---2---2---|2---2---2---2---2-------2-------|2---2---2---2---2-------2---2---|
D|4---4---4---4---4---4---4---4---|4---4---4---4---4-------4-------|4---4---4---4---0-------0---0---|
A|0-------------------------------|--------------------------------|5-------5-----------------------|
E|--------2-------2-------2-------|2-------2-------2-------2-------|----------------3-------3-------|
  D   U   D   U   D   U   D   U    D   U   D   U   D       D        D   U   D   U   D       D   U

  D/A                              D/A                              D/A    (2:26, bar 88)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3-------3---3---|3---3---3---3---3---3---3---3---|
G|2---2---2---2---2---2---2---2---|2---2---2---2---2-------2---2---|2---2---2---2---2---2---2---2---|
D|4---4---4---4---4---4---4---4---|4---4---4---4---4-------4---4---|4---4---4---4---4---4---4---4---|
A|0-------0-------0-------0-------|0-------0-------0-------0-------|0-------0-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D       D   U    D   U   D   U   D   U   D   U

  D/A     F#7                      D/F#            Bmadd11          Dadd9    (2:31, bar 91)
e|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0---0---|
B|3---3---2---2---2-------2---2---|3---3---3---3---3---3---3---3---|3---3---3---3---3-------3---3---|
G|2---2---3---3---3-------3---3---|2---2---2---2---4---4---4---4---|2---2---2---2---2-------2---2---|
D|4---4---4---4---4-------4---4---|4---4---4---4---4---4---4---4---|4---4---4---4---4-------4---4---|
A|0-------------------------------|----------------2-------2-------|5-------5-------5-------5-------|
E|--------2-------2-------2-------|2-------2-----------------------|--------------------------------|
  D   U   D   U   D       D   U    D   U   D   U   D   U   D   U    D   U   D   U   D       D   U

  Dadd9                            Dadd9   Em7             D/A      D/A    (2:36, bar 94)
e|0---0---0---0---0-------0---0---|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0---0---|
B|3---3---3---3---3-------3---3---|3---3---3---3---3-------3---3---|3---3---3---3---3---3---3---3---|
G|2---2---2---2---2-------2---2---|2---2---0---0---0-------2---2---|2---2---2---2---2---2---2---2---|
D|4---4---4---4---4-------4---4---|4---4---2---2---2-------4---4---|4---4---4---4---4---4---4---4---|
A|5-------5-------5-------5-------|5-------2-------2-------0-------|0-------0-------0-------0-------|
E|--------------------------------|--------0-------0---------------|--------------------------------|
  D   U   D   U   D       D   U    D   U   D   U   D       D   U    D   U   D   U   D   U   D   U

  D/A                              D/A                              D/A     F#7    (2:41, bar 97)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|0---0-----------0---0---0---0---|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|3---3-----------2---2---2---2---|
G|2---2---2---2---2---2---2---2---|2---2---2---2---2---2---2---2---|2---2-----------3---3---3---3---|
D|4---4---4---4---4---4---4---4---|4---4---4---4---4---4---4---4---|4---4-----------4---4---4---4---|
A|0-------0-------0-------0-------|0-------0-------0-------0-------|0-------------------------------|
E|--------------------------------|--------------------------------|----------------2-------2-------|
  D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U    D   U           D   U   D   U

  F#7     Bmadd11                  Bmadd11 Dadd9   Gadd9    (2:46, bar 100)
e|0---0---0---0---0---0---0---0---|0---0---0-------0---0---0---0---|
B|2---2---3---3---3---3---3---3---|3---3---3-------3---3---3---3---|
G|3---3---4---4---4---4---4---4---|4---4---2-------2---2---2---2---|
D|4---4---4---4---4---4---4---4---|4---4---4-------0---0---0---0---|
A|--------2-------2-------2-------|2-------5-----------------------|
E|2-------------------------------|----------------3-------3-------|
  D   U   D   U   D   U   D   U    D   U   D       D   U   D   U


[Interlude: Bmadd11 - E - Em7 - G - Asus4, then D/A pedal]
  E                                D/A                     Dadd9    Dadd9   Bmadd11    (2:49, bar 102)
e|0---0-------0---0-------0-------|0---0-----------0---0-------0---|0---0-------0---0---0---0-------|
B|0---0-------0---0-------0-------|3---3-----------3---3-------3---|3---3-------3---3---3---3-------|
G|1---1-------1---1-------1-------|2---2-----------2---2-------2---|2---2-------4---4---4---4-------|
D|2---2-------2---2-------2-------|4---4-----------4---4-------4---|4---4-------4---4---4---4-------|
A|2---------------2-------2-------|0---------------0---------------|5---------------2-------2-------|
E|0---------------0-------0-------|--------------------------------|--------------------------------|
  D   U       U   D       D        D   U           D   U       U    D   U       U   D   U   D

  Bmadd11         E                E               Em7              Em7     G    (2:54, bar 105)
e|0---0---0---0-------0-----------|0---0---0---0---0---0-------0---|0---0---3-----------------------|
B|3---3---3---3-------0-----------|0---0---0---0---3---3-------3---|3---3---3-----------------------|
G|4---4---4---4-------1-----------|1---1---1---1---0---0-------0---|0---0---0-----------------------|
D|4---4---4---4-------2-----------|2---2---2---2---2---2-------2---|2---2---0-----------------------|
A|2-------2-----------------------|2-------2-------2---------------|2-------2-----------------------|
E|--------------------------------|0-------0-------0---------------|0-------3-----------------------|
  D   U   D   U       U            D   U   D   U   D   U       U    D   U   D

  Asus4                   D/A      D/A                              D/A    (2:59, bar 108)
e|0-------0---0-------0---0---0---|0-----------0---0---0---0-------|0---0---0---0---0---0---0---0---|
B|3-------3---3-------3---3---3---|3-----------3---3---3---3-------|3---3---3---3---3---3---3---3---|
G|2-------2---2-------2---2---2---|2-----------2---2---2---2-------|2---2---2---2---2---2---2---2---|
D|0-------0---0-------0---4---4---|4-----------4---4---4---4-------|4---4---4---4---4---4---4---4---|
A|0-------0---------------0-------|0---------------0-------0-------|0-------0-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D       D   U       U   D   U    D           U   D   U   D        D   U   D   U   D   U   D   U

  D/A                              D/A     D/F#            Dadd9    D/A                     D/F#    (3:04, bar 111)
e|0---0---0-------0---0---0---0---|0---0---0-------0---0---0-------|----0---0---0---0---0---0---0---|
B|3---3---3-------3---3---3---3---|3---3---3-------3---3---3-------|----3---3---3---3---3---3---3---|
G|2---2---2-------2---2---2---2---|2---2---2-------2---2---2-------|----2---2---2---2---2---2---2---|
D|4---4---4-------4---4---4---4---|4---4---4-------4---4---4-------|----4---4---4---4---4---4---4---|
A|0-------0-------0-------0-------|0-----------------------5-------|--------0-------0---------------|
E|--------------------------------|--------2-------2---------------|------------------------2-------|
  D   U   D       D   U   D   U    D   U   D       D   U   D            U   D   U   D   U   D   U

  D/F#    Gadd9           Asus4    Asus4                   D/F#     D/F#    Gadd9           D/A    (3:10, bar 114)
e|0---0---0-----------0---0-------|0---0---0---0---0---0---0---0---|0-------0-------0---0---0---0---|
B|3---3---3-----------3---3-------|3---3---3---3---3---3---3---3---|3-------3-------3---3---3---3---|
G|2---2---2-----------2---2-------|2---2---2---2---2---2---2---2---|2-------2-------2---2---2---2---|
D|4---4---0-----------0---0-------|0---0---0---0---0---0---4---4---|4-------0-------0---0---4---4---|
A|------------------------0-------|0-------0-------0---------------|------------------------0-------|
E|2-------3-----------------------|------------------------2-------|2-------3-------3---------------|
  D   U   D           U   D        D   U   D   U   D   U   D   U    D       D       D   U   D   U

  D/A                              D/F#    Bmadd11 Gadd9            Dadd9   D/A    (3:15, bar 117)
e|0---0-------0-------0---0---0---|0---0-------0---0-----------0---|0-------0-------0---0---0---0---|
B|3---3-------3-------3---3---3---|3---3-------3---3-----------3---|3-------3-------3---3---3---3---|
G|2---2-------2-------2---2---2---|2---2-------4---2-----------2---|2-------2-------2---2---2---2---|
D|4---4-------4-------4---4---4---|4---4-------4---0-----------0---|4-------4-------4---4---4---4---|
A|0-----------------------0-------|--------------------------------|5-------0-------0-------0-------|
E|--------------------------------|2---------------3---------------|--------------------------------|
  D   U       U       U   D   U    D   U       U   D           U    D       D       D   U   D   U

  D/F#            G    (3:20, bar 120)
e|0---0---0-------3---------------|
B|3---3---3-------3---------------|
G|2---2---2-------0---------------|
D|4---4---4-------0---------------|
A|----------------2---------------|
E|2-------2-------3---------------|
  D   U   D       D


[Last choruses: G - Asus4 - F#7 - Bmadd11 - D/F# ...]
  G       Asus4                    Asus4   D/A                      D/A     Bmadd11 F#7    (3:22, bar 121)
e|------------------------0-------|--------0---0---0---0---0-------|0-------0-----------0---0-------|
B|------------------------3-------|--------3---3---3---3---3-------|3-------3-----------2---2-------|
G|------------------------2-------|--------2---2---2---2---2-------|2-------4-----------3---3-------|
D|------------------------0-------|--------4---4---4---4---4-------|4-------4-----------4---4-------|
A|------------------------0-------|--------0-------0-------0-------|0-------2-----------------------|
E|--------------------------------|--------------------------------|------------------------2-------|
                          D                D   U   D   U   D        D       D           U   D

  F#7     Gadd9   Asus4   D/F#     Dadd9                   D/F#     D/F#    D/A             F#7    (3:27, bar 124)
e|0---0---0---------------0-------|0---------------0---------------|0---0---0---0---0-------0-------|
B|2---2---3---------------3-------|3---------------3---------------|3---3---3---3---3-------2-------|
G|3---3---2---------------2-------|2---------------2---------------|2---2---2---2---2-------3-------|
D|4---4---0---------------4-------|4---------------4---------------|4---4---4---4---4-------4-------|
A|--------------------------------|5---------------5---------------|--------0-------0---------------|
E|2-------3---------------2-------|--------------------------------|2-----------------------2-------|
  D   U   D               D        D               D                D   U   D   U   D       D

  Asus4   Bmadd11         D/F#     D/F#            Gadd9   Dadd9    D/F#            E       D/A    (3:33, bar 127)
e|0-------0-----------0-------0---|----------------0-------0-------|0---0---0---0---0-------0---0---|
B|3-------3-----------3-------3---|----------------3-------3-------|3---3---3---3---0-------3---3---|
G|2-------4-----------4-------2---|----------------2-------2-------|2---2---2---2---1-------2---2---|
D|0-------4-----------4-------4---|----------------0-------4-------|4---4---4---4---2-------4---4---|
A|0-------2-----------------------|------------------------5-------|----------------2-------0-------|
E|--------------------------------|----------------3---------------|2-------2-------0---------------|
  D       D           U       U                    D       D        D   U   D   U   D       D   U

  D/A                              D/A                              D/A    (3:38, bar 130)
e|0---------------0---0---0---0---|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0---0---|
B|3---------------3---3---3---3---|3---3---3---3---3-------3---3---|3---3---3---3---3---3---3---3---|
G|2---------------2---2---2---2---|2---2---2---2---2-------2---2---|2---2---2---2---2---2---2---2---|
D|4---------------4---4---4---4---|4---4---4---4---4-------4---4---|4---4---4---4---4---4---4---4---|
A|0---------------0-------0-------|0-------0-------0-------0-------|0-------0-------0-------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D               D   U   D   U    D   U   D   U   D       D   U    D   U   D   U   D   U   D   U

  D/A     F#7                      D/F#            Bmadd11          Dadd9    (3:43, bar 133)
e|0-------0---0---0---0-------0---|0---0---0---0---0---0---0---0---|0---0---0---0---0---0---0---0---|
B|3-------2---2---2---2-------2---|3---3---3---3---3---3---3---3---|3---3---3---3---3---3---3---3---|
G|2-------3---3---3---3-------3---|2---2---2---2---4---4---4---4---|2---2---2---2---2---2---2---2---|
D|4-------4---4---4---4-------4---|4---4---4---4---4---4---4---4---|4---4---4---4---4---4---4---4---|
A|0-------------------------------|----------------2-------2-------|5-------5-------5-------5-------|
E|--------2-------2---------------|2-------2-----------------------|--------------------------------|
  D       D   U   D   U       U    D   U   D   U   D   U   D   U    D   U   D   U   D   U   D   U

  Dadd9                            Dadd9           Gadd9   Asus4    Asus4           Dadd9    (3:48, bar 136)
e|0---0---0---0---0-------0---0---|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0-------|
B|3---3---3---3---3-------3---3---|3---3---3---3---3-------3---3---|3---3---3---3---3---3---3-------|
G|2---2---2---2---2-------2---2---|2---2---2---2---2-------2---2---|2---2---2---2---2---2---2-------|
D|4---4---4---4---4-------4---4---|4---4---4---4---0-------0---0---|0---0---0---0---4---4---4-------|
A|5-------5-------5-------5-------|5-------5---------------0-------|0-------0-------5-------5-------|
E|--------------------------------|----------------3---------------|--------------------------------|
  D   U   D   U   D       D   U    D   U   D   U   D       D   U    D   U   D   U   D   U   D

  Dadd9   D/A             Gadd9    Dadd9           D/A              D/A             F#7    (3:54, bar 139)
e|0---0---0---0---0-------0---0---|0---0---0---0---0---0---0---0---|0---0---0-------0---0---0---0---|
B|3---3---3---3---3-------3---3---|3---3---3---3---3---3---3---3---|3---3---3-------2---2---2---2---|
G|2---2---2---2---2-------2---2---|2---2---2---2---2---2---2---2---|2---2---2-------3---3---3---3---|
D|4---4---4---4---4-------0---0---|4---4---4---4---4---4---4---4---|4---4---4-------4---4---4---4---|
A|5-------0-------0---------------|5-------5-------0-------0-------|0-------0-----------------------|
E|------------------------3-------|--------------------------------|----------------2-------2-------|
  D   U   D   U   D       D   U    D   U   D   U   D   U   D   U    D   U   D       D   U   D   U

  F#7     Bmadd11                  Bmadd11 Asus4   G                D/F#                    D/A    (3:59, bar 142)
e|0---0---0---0---0---0---0---0---|0---0---0-------3-----------3---|0---0---0---0---0-------0-------|
B|2---2---3---3---3---3---3---3---|3---3---3-------3-----------3---|3---3---3---3---3-------3-------|
G|3---3---4---4---4---4---4---4---|4---4---2-------0-----------0---|2---2---2---2---2-------2-------|
D|4---4---4---4---4---4---4---4---|4---4---0-------0-----------0---|4---4---4---4---4-------4-------|
A|--------2-------2-------2-------|2-------0-------2---------------|------------------------0-------|
E|2-------------------------------|----------------3---------------|2-------2-------2---------------|
  D   U   D   U   D   U   D   U    D   U   D       D           U    D   U   D   U   D       D

  D/A                              Dadd9   Bmadd11                  Dadd9    (4:04, bar 145)
e|0---0---0---0---0---0---0---0---|0---0---0---0---0-------0-------|0---0---0-----------0-----------|
B|3---3---3---3---3---3---3---3---|3---3---3---3---3-------3-------|3---3---3-----------3-----------|
G|2---2---2---2---2---2---2---2---|2---2---4---4---4-------4-------|2---2---2-----------2-----------|
D|4---4---4---4---4---4---4---4---|4---4---4---4---4-------4-------|4---4---4-----------4-----------|
A|0-------0-------0-------0-------|5-------2-------2-------2-------|5-------5-----------------------|
E|--------------------------------|--------------------------------|--------------------------------|
  D   U   D   U   D   U   D   U    D   U   D   U   D       D        D   U   D           U

  E                       Em7      Em7                     Gadd9    Asus4                   D/A    (4:09, bar 148)
e|0---0---0---0---0---0-----------|0---0---------------0-----------|0-------0---0---0---0---0---0---|
B|0---0---0---0---0---0-----------|3---3---------------3-----------|3-------3---3---3---3---3---3---|
G|1---1---1---1---1---1-----------|0---0---------------0-----------|2-------2---2---2---2---2---2---|
D|2---2---2---2---2---2-----------|2---2---------------2-----------|0-------0---0---0---0---4---4---|
A|2-------2-------2---------------|2-------------------------------|0-------0-------0-------0-------|
E|0-------0-------0---------------|0-------------------------------|--------------------------------|
  D   U   D   U   D   U            D   U               U            D       D   U   D   U   D   U

  D/A                     F#7      F#7     Dadd9                    Bmadd11    (4:15, bar 151)
e|0---0---0---0---0---0-----------|0---0---0---0---0---0---0---0---|0-----------0---0---0---0-------|
B|3---3---3---3---3---3-----------|2---2---3---3---3---3---3---3---|3-----------3---3---3---3-------|
G|2---2---2---2---2---2-----------|3---3---2---2---2---2---2---2---|4-----------4---4---4---4-------|
D|4---4---4---4---4---4-----------|4---4---4---4---4---4---4---4---|4-----------4---4---4---4-------|
A|0-------0-------0---------------|--------5-------5-------5-------|2---------------2-------2-------|
E|--------------------------------|2-------------------------------|--------------------------------|
  D   U   D   U   D   U            D   U   D   U   D   U   D   U    D           U   D   U   D

  Gadd9                   D/A      D/A    (4:20, bar 154)
e|0---0---0-------0---0---0-------|0---0-----------0-------0---0---|
B|3---3---3-------3---3---3-------|3---3-----------3-------3---3---|
G|2---2---2-------2---2---2-------|2---2-----------2-------2---2---|
D|0---0---0-------0---0---4-------|4---4-----------4-------4---4---|
A|------------------------0-------|0---------------0-------0-------|
E|3-------3-------3---------------|--------------------------------|
  D   U   D       D   U   D        D   U           D       D   U


[Outro: E - Bmadd11 - Em7 - G - F#7, ends on D/A]
  D/A     F#7                      E       Bmadd11                  Bmadd11 Asus4   D/F#    E    (4:23, bar 156)
e|0-------0---0---0-------0---0---|0---0---0---------------0-------|0---0---0-----------0---0-------|
B|3-------2---2---2-------2---2---|0---0---3---------------3-------|3---3---3-----------3---0-------|
G|2-------3---3---3-------3---3---|1---1---4---------------4-------|4---4---2-----------2---1-------|
D|4-------4---4---4-------4---4---|2---2---4---------------4-------|4---4---0-----------4---2-------|
A|0-------------------------------|2-------2---------------2-------|2-------0---------------2-------|
E|--------2-------2-------2-------|0-------------------------------|------------------------0-------|
  D       D   U   D       D   U    D   U   D               D        D   U   D           U   D

  Bmadd11         A       Em7      Em7     Bmadd11         G        G               Asus4    (4:28, bar 159)
e|0---0-------0---0---0-----------|--------0-----------0-----------|3-------------------0-------0---|
B|3---3-------3---2---2-----------|--------3-----------3-----------|3-------------------3-------3---|
G|4---4-------4---2---2-----------|--------4-----------4-----------|0-------------------2-------2---|
D|4---4-------4---2---2-----------|--------4-----------4-----------|0-------------------0-------0---|
A|2---------------0---------------|--------2-----------------------|2-------------------------------|
E|--------------------------------|--------------------------------|3-------------------------------|
  D   U       U   D   U                    D           U            D                   U       U

  Asus4                   Dadd9    Dadd9                   G        G       F#7    (4:33, bar 162)
e|0-------0-------0-------0-------|0-----------------------3-------|3---3-------0-------0-----------|
B|3-------3-------3-------3-------|3-----------------------3-------|3---3-------2-------2-----------|
G|2-------2-------2-------2-------|2-----------------------0-------|0---0-------3-------3-----------|
D|0-------0-------0-------4-------|4-----------------------0-------|0---0-------4-------4-----------|
A|0-------0-------0-------5-------|5-----------------------2-------|2-------------------------------|
E|--------------------------------|------------------------3-------|3-------------------------------|
  D       D       D       D        D                       D        D   U       U       U

  F#7                              D/A                              D/A    (4:38, bar 165)
e|0---------------0-------0-------|0---0---0---0---------------0---|0---0---0-----------0-------0---|
B|2---------------2-------2-------|3---3---3---3---------------3---|3---3---3-----------3-------3---|
G|3---------------3-------3-------|2---2---2---2---------------2---|2---2---2-----------2-------2---|
D|4---------------4-------4-------|4---4---4---4---------------4---|4---4---4-----------4-------4---|
A|--------------------------------|0-------0-----------------------|0-------0-----------------------|
E|2---------------2-------2-------|--------------------------------|--------------------------------|
  D               D       D        D   U   D   U               U    D   U   D           U       U

  D/A                              D/A                              D/A     Dadd9           D/A    (4:43, bar 168)
e|0-------0-------0---0---0-------|--------0-------------------0---|0-------0---------------0-------|
B|3-------3-------3---3---3-------|--------3-------------------3---|3-------3---------------3-------|
G|2-------2-------2---2---2-------|--------2-------------------2---|2-------2---------------2-------|
D|4-------4-------4---4---4-------|--------4-------------------4---|4-------4---------------4-------|
A|0-------0-------0-------0-------|--------0-----------------------|0-------5---------------0-------|
E|--------------------------------|--------------------------------|--------------------------------|
  D       D       D   U   D                D                   U    D       D               D

  D/A    (4:48, bar 171)
e|--------0---0-------------------|
B|--------3---3-------------------|
G|--------2---2-------------------|
D|--------4---4-------------------|
A|--------0-----------------------|
E|--------------------------------|
          D   U
```

</details>

### 010

All three agree, capo included: standard tuning, a capo on fret 3 and G minor.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-010.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">1:03</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-010.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-blind-010.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">its tab played back in time with the video, 1:05</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/opus-tabber-010.mp3" controls preload="none"></audio><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">its tab played back in time with the video, 1:06</span></figcaption></figure>
</ao-compare>

<details><summary>Grok Bot's tab for 010</summary>

```text
Unidentified (possibly original)
======================================================================
Song confidence: unidentified
Original filename: 20210614_220806.mp4
Source: videos/2026-08-14_010.mp4
Album label date: 2026-08-14 (not necessarily recording date)
Duration: 63.23 s
Instrument: guitar-family acoustic where visible; source not established if neck is off camera.
Tuning low to high: unresolved; E A D G B E assumed
Capo: 3; visual confidence high. Clamp fret counted from nut in frame
Likely sounding key: G minor? (moderate confidence; automatic note-profile estimate)
Provisional classification: fragment/partial
Reason: Short/partial take; a complete song was not established. This is provisional, not a claim of aimless playing.
Main loop, chord SHAPES relative to capo assumption: Em? -> Gmaj7?

IMPORTANT LIMITATIONS
This is a machine-assisted first-draft pitch/harmony sketch, NOT a verified
note-for-note tablature or proof of the original tuning/fingering. All chord
labels/finger positions are provisional (?). Source contains voice/noise;
some detected notes may be sung pitches or harmonics. A key estimate is NOT
a tuning diagnosis. Do not retune to a guessed alternate tuning.
If capo is unresolved, this file assumes fret 0 for its draft positions.
If tuning differs from standard, string/fret placement must be revised.

CHORD CHART / MAIN HARMONIC MATERIAL
Most repeated estimated pattern: Em? -> Gmaj7?
Common estimated sounding sonorities (time-weighted, NOT a progression): Gm?, Bbmaj7?, Gm7?, Csus2?, Dmaj7?, Fsus4?, C#?, C#maj7?

Approximate estimated changes in the first 90 seconds:
     0.8–   5.2 s: Em? shape / Gm? sounding
     5.2–   7.5 s: Gmaj7? shape / Bbmaj7? sounding
     8.2–  13.5 s: Em? shape / Gm? sounding
    13.5–  15.8 s: Gmaj7? shape / Bbmaj7? sounding
    16.5–  23.2 s: Em? shape / Gm? sounding
    23.2–  25.5 s: Gmaj7? shape / Bbmaj7? sounding
    26.2–  30.8 s: Em? shape / Gm? sounding
    30.8–  33.0 s: Gmaj7? shape / Bbmaj7? sounding
    33.8–  38.2 s: Em? shape / Gm? sounding
    39.0–  40.5 s: Gmaj7? shape / Bbmaj7? sounding
    41.2–  45.8 s: Em7? shape / Gm7? sounding
    45.8–  48.8 s: Gmaj7? shape / Bbmaj7? sounding
    48.8–  51.0 s: Dsus4? shape / Fsus4? sounding
    51.0–  55.5 s: Em? shape / Gm? sounding
    57.0–  59.2 s: Em? shape / Gm? sounding
    60.0–  63.0 s: Asus2? shape / Csus2? sounding

SOURCE-PITCH ASCII SKETCHES — ALL STRING ASSIGNMENTS UNCERTAIN (?)
These show actual model-detected onset pitches mapped to playable standard-
tuning positions; not a generic invented fingerpicking pattern. Each cell
is 0.5 s; simultaneous/repeated fast notes are reduced. Dashes are not proof
of silence. Positions favor low frets and may differ from the hand in video.
Fret numbers are relative to the capo assumption. Rhythm/voice separation
and fast ornaments are unresolved; use these only as play-along prompts.

Excerpt 10.0–26.0 s (?)
e |-0--------------------------------------------------------------|
B |-------------0---0-----0-----------------------------0-0--------|
G |---------0---------------3-0-----0---0---0---0---0-------------3|
D |-----4-------4-----4---4-7---------------------------4---4---4-7|
A |----------------------------------------------------------------|
E |-0-0-----0-3---3-3-3-3-----0---0-0-0-----0-----0---3-3---3-3----|

Excerpt 23.6–39.6 s (?)
e |----------------------------------------------------------------|
B |-0-------------------3---------0-----------------3-----0-------0|
G |---------3-0-0---0---------------------3-0-----0-----0-4--------|
D |---4---4-7---4-------4---4---4---4---4---7-4---------------4----|
A |----------------------------------------------------------------|
E |---3-3-----0---------------3-3---3-3-----0-----0---------3-2-3-3|

TRANSCRIPT CLUES (AUTOMATIC / UNVERIFIED)
Do not rely on these as accurate lyrics or authorship evidence.

KEY/TUNING EVIDENCE
Profile correlations (not probabilities): G minor r=0.877, Bb major r=0.727, D minor r=0.437
Strong lower detected pitches: G2 (10.6), A♯2 (4.5), D3 (1.3), C3 (1.2), A2 (0.1)
Low-note support is not enough to identify every open string. Tuning left
unresolved instead of falsely declaring standard, DADGAD, or an open tuning.

CONDITIONAL CHORD GRIPS — STANDARD-TUNING ARRANGEMENT OPTIONS (?)
Low E to high e; all numbers relative to the stated capo assumption.
These are suggested playable grips, NOT observed source fingering.
Em? : 0 2 2 0 0 0
Gmaj7? : x 10 12 11 12 10
Em7? : 0 2 0 0 0 0
Asus2? : x 0 2 2 0 0
If the actual tuning differs, these grips are not the original arrangement.
```

</details>

<details><summary>Blind Opus 5.5's tab for 010</summary>

```text
Song 10 - nylon-string fingerstyle vamp, Gm9 <-> Bbmaj7 (title unknown)
=======================================================================
Source: song10.mp4
Instrument: nylon (classical / nylon-string guitar, fingerpicked)
Tuning: Standard E A D G B E  [MIDI 40 45 50 55 59 64]
Capo: 3  (all fret numbers are relative to the capo)
Key: G minor (Dorian-flavoured vamp i - III; relative major Bb); capo-relative shapes are in E minor
Time: 4/4
Tempo: 120 (rubato; free-time ritardando outro from ~0:46)
Grid: 16   (one tab column = 1/16 note)
Pitch offset: +3 cents (guitar's measured detuning vs A440)
Chars per step: 2   (each grid step is 2 characters wide)
Confidence: overall medium-high | tuning high | capo 3 high (visible) | key high | chords high (outro chords medium) | rhythm medium (rubato, 16th grid) | note-level medium

Notes:
  * Capo is clearly visible behind the 3rd fret wire; fret numbers below are capo-relative,
    so the shapes are Em9 (0 2 4 0 3 0) and Gmaj7 (3 x 4 0 0 x) but they SOUND as Gm9 and Bbmaj7.
  * Fingerpicked with the thumb on the 6th string (G2 on beat 1, the '&' of 2 and the '&' of 3),
    the fingers playing D-string 4 -> open G -> B-string 3 (A3 -> Bb3 -> F4) as a quick figure.
  * Every 2nd Bbmaj7 bar ends with a walk-down on the G string (3 - 2 - 0 = Db - C - Bb sounding)
    leading back to Gm9.  Video confirms the hand shapes (index at rel. fret 2 / 3, ring at 4).
  * The ending (from 0:45.7) is played in free time and closes on F6/9/C -> F/C (sounding).
  * Uncertain: some inner/doubled notes (e.g. whether D4 is the open B string or G-string 4),
    exact 16th placement in rubato passages, and the precise voicing of the final chords.

Chord progression (time in video -> chord; names are capo-relative shapes)
  0:00.83 Em9  |  0:04.83 Gmaj7  |  0:08.85 Em9  |  0:12.91 Gmaj7  |  0:16.77 Em9  |  0:22.70 Gmaj7
  0:26.49 Em9  |  0:30.35 Gmaj7  |  0:34.10 Em9  |  0:37.81 Gmaj7  |  0:41.61 Em9  |  0:45.70 Gmaj7
  0:51.17 Em9  |  0:59.61 Gmaj7  |  1:00.64 D6/9/A  |  1:01.54 D/A
  Sounding chords (concert pitch): Em9 shape = Gm9, Gmaj7 shape = Bbmaj7,
  D6/9/A shape = F6/9/C, D/A shape = F/C.
  Form (bars): |Gm9 Gm9|Bbmaj7 Bbmaj7| x2, |Gm9 Gm9 Gm9|Bbmaj7 Bbmaj7|, |Gm9 Gm9|Bbmaj7 Bbmaj7| x3,
  outro (free time): Bbmaj7 (walk-down) - Gm9 ... - Bbmaj7 - F6/9/C - F/C.

Chord shapes used (lowest -> highest string, x = not played):
  Em9: 0 2 4 0 3 0   Gmaj7: 3 x 4 0 0 x   D6/9/A: x 0 4 4 3 0   D/A: x 0 4 x 3 x

Notation: one column = one grid step (see Grid / Chars per step); '|' = bar line.
  Numbers = fret (relative to the capo if one is used), x = muted/dead string hit,
  h = hammer-on, p = pull-off, / \ = slide.  "@ m:ss.ss" = time in the video where the
  following tab line starts.  Chord names above the staff mark where the harmony changes.

[Main fingerpicked vamp (2 bars per line)]
@ 0:00.83
  Em9
e|--------------------------------|--------------------------------|
B|--------3---------------3-------|--------3-----------------------|
G|------0-------------------------|------0-------------0-----------|
D|----4---------------------------|----4---------------------------|
A|--------------------------------|--------------------------------|
E|0-----------0-------0-----------|0-----------0-----------0-------|

@ 0:04.83
  Gmaj7
e|--------------------------------|--------------------------------|
B|0-------------------0-----------|--------------------------------|
G|--------------------------------|--------------------3---2---0---|
D|------------4---------------4---|4-------------------------------|
A|--------------------------------|--------------------------------|
E|3-------3---------------3-------|3-------------------------------|

@ 0:08.85
  Em9
e|------------------------0-------|--------------------------------|
B|--------3-----------------------|--------3---------3-------------|
G|0-------0-----------------------|--------0---------------0-------|
D|----4---------------------------|------4-------------------------|
A|--------------------------------|--------------------------------|
E|0-------------------0-----------|0-------------------0-----------|

@ 0:12.91
  Gmaj7
e|--------------------------------|----------------0---------------|
B|--------0-----------0-----------|----------------0---------------|
G|--------------------------------|--------------------3---2---0---|
D|--------4---------4---------4---|------------4-------------------|
A|--------------------------------|--------------------------------|
E|3-----------3-----------3-------|3-------3-----------------------|

@ 0:16.77
  Em9
e|--------------------------------|--------------------------------|
B|----------3-------3-------------|--------3-----------------------|
G|0-------------------0-----------|------0-----------------0-------|
D|--------------------------------|----4---------------------------|
A|--------------------------------|----2---------------------------|
E|0-------------0---------0-------|0-----------0-------0-----------|

@ 0:20.78
                                   Gmaj7
e|--------------------------------|--------------------------------|
B|--------------------------------|--------0-----------0-----------|
G|------0-----------------0-------|------0-------------------------|
D|----4---------------------------|--------4-------------------4---|
A|--------------------------------|--------------------------------|
E|0-----------0-------0-----------|3-----------3-----------3-------|

@ 0:24.63
                                   Em9
e|--------------------------------|--------------------------------|
B|------------0-------------------|--------3---------3-----3-------|
G|--------------------3---2---0---|--------0-------0-------0-------|
D|------------4-------------------|------4-------------------------|
A|--------------------------------|------2-------------------2-----|
E|3-------3-----------------------|0-----------0-------0-----------|

@ 0:28.48
                                   Gmaj7
e|--------------------------------|--------------------------------|
B|--------3-----------------------|----------------0---0-----------|
G|------0-----0-------------------|--------------------------------|
D|----4-----4-------------4-------|------------4---------------4---|
A|--------------------------------|--------------------------------|
E|0-------------------0-----------|3-------3---------------3-------|

@ 0:32.23
                                   Em9
e|--------------------------------|--------------------------------|
B|------------3-------------------|----------------------------3---|
G|------------4-------3---2---0---|--------------0-----0-------0---|
D|------------4-------------------|--------4-----------4-----------|
A|--------------------------------|--------------------------------|
E|3-------------------------------|0-----------------------0-------|

@ 0:35.95
                                   Gmaj7
e|--------------------------------|--------------------------------|
B|--------0-----------0-------0---|------------------0-----0-------|
G|------------0---0---0-----------|--------------------------------|
D|--------------------------------|--------4-----------------------|
A|--------------------------------|--------------------------------|
E|0-------------------------------|3-----------2-------3-------3---|

@ 0:39.71
                                   Em9
e|--------------------------------|--------------------------------|
B|------------0---0---------------|--------3---------------3-------|
G|--------------------3---2---0---|0-------0-------------------0---|
D|4-----------4-------------------|------4-----------------4-------|
A|------------------------------2-|--------------------------------|
E|--------3-----------------------|0-------------------0-----------|

@ 0:43.61
 
e|--------------------------------|
B|--------3-----3-----------------|
G|0-----0-----------------0-------|
D|----4---------------------------|
A|2-------------------------------|
E|0-------------------0-----------|

[Outro - free time (ritardando). One bar per line; bars of 24 columns are
 longer (6/4-length) bars so the written note values keep the ~120 BPM pulse]
@ 0:45.70
  Gmaj7
e|--------------------------------|
B|--------------------------0-----|
G|--------------------------------|
D|--------4-----------4-----------|
A|--------------------------------|
E|3---------3-----3-----3---------|

@ 0:48.10
  Gmaj7
e|------------------------------------------------|
B|------------------------------------------0-----|
G|----------2-------------3-2---------2-----0-----|
D|----4-------------------------------------------|
A|------------------------------------------------|
E|3-----------------------------------------------|

@ 0:51.17
  Em9
e|--------------------------------|
B|--------------------------------|
G|0-------------------------------|
D|--------------------------------|
A|------------2-------------------|
E|--------------------------0-----|

@ 0:53.14
  Em9
e|--------------------------------|
B|0---------3-------------3-------|
G|------0-------------------0-----|
D|--4-----------------------------|
A|2-------------------------------|
E|0-------------------------------|

@ 0:54.67
  Em9
e|------------------------------------------------|
B|0-----------0-------0-------0-------------------|
G|0---------------------0-------------------------|
D|------------------4-----------------------------|
A|--------------------2---------------------------|
E|0-------------------0---------------------------|

@ 0:57.68
  Em9
e|--------------------------------|
B|------3-------------------------|
G|----0-----------------0---------|
D|--4-----------------4-----------|
A|--2-----------------2-----------|
E|0-----------------0-------------|

@ 0:59.61
  Gmaj7           D6/9/A        D/A
e|------0-------------0---------------------------|
B|----0-------------3---------------3-------------|
G|0-----------------4-----------------------------|
D|--4-------------4---------------4---------------|
A|----------------0-------------0-----------------|
E|3-----------------------------------------------|
```

</details>

<details><summary>Opus 5.5's tab with Tabber for 010</summary>

```text
====================================================================================================
 song10 - fingerstyle Gm9 / Bbmaj7 vamp on nylon-string guitar (capo 3)
====================================================================================================
 Source        : song10.mp4 (1:03), nylon-string classical guitar, no vocals; capo clearly visible
                 in the video
 Tuning        : Standard E A D G B E (low to high); recording is within ~3 cents of A440 (in tune)
 Capo          : 3rd fret (seen in the video: capo sits just behind the 3rd fret wire). All frets
                 are relative to the capo; chord names in the tab are the SHAPES, sounding chords in
                 [brackets].
 Key           : G minor (sounding) = E minor shapes with capo 3
 Tempo / feel  : 4/4, q = ~120 (rubato, very free; it can equally be felt as a slow 60).
                 Fingerpicked: bass on 1, 2+, 3+ with a quick A-Bb-F roll on '1 e +'. One bar = 16
                 slots (16th notes).
 Progression   : | Gm9 | Gm9 | Bbmaj7 | Bbmaj7 |  repeated (shapes | Em9 | Em9 | Gmaj7 | Gmaj7 |);
                 the Bbmaj7 bars end with a chromatic G-string fill 3-2-0 (sounds Db-C-Bb). Ends on
                 C6/9 (A-shape).
 Structure     : bars 1-24 vamp (one 3-bar Gm9 stretch at bars 9-11, bass walk A->Bb at bar 20);
                 bars 25-27 melodic fill; bars 28-32 Gm9 and a final Bbmaj7 -> C6/9.
 Confidence    : HIGH for tuning, capo (video), key and chords (bass + all chord tones agree).
                 MEDIUM for the exact picking order and rhythm (rubato, fast rolls quantised to
                 16ths).
----------------------------------------------------------------------------------------------------
 Chord shapes used (frets relative to the capo, if any; strings 6 5 4 3 2 1 = low E ... high e):
   Em9          0 2 4 0 3 0              sounds Gm9 (B string alternates 0 and 3)
   Gmaj7        3 x 4 0 0 x              sounds Bbmaj7
   A6sus2       x 0 4 x 0 0              sounds C6/9 (no 3rd) - final chord
   fill         G string 3-2-0           sounds Db-C-Bb (chromatic walk-down)
----------------------------------------------------------------------------------------------------
 Each line shows the time in the video and the bar number. '-' = rest/ring; notes ring until the
 same string is played again. Rhythm grid: 16 slots per 4/4 bar.
----------------------------------------------------------------------------------------------------
 vs. Tabber    : Tabber got tuning (standard), capo 3, key (G minor) and the Em/Gmaj7 shape loop
                 right - its best result of the ten. Kept its note detections (they are clean on
                 this solo nylon guitar), but re-gridded them to the 2-second bars the music
                 actually uses (Tabber's 62-bpm grid put chord changes mid-bar), forced every note
                 onto the real chord shapes (e.g. D string 4th fret instead of scattered positions),
                 named the shapes Em9 / Gmaj7 / A6sus2, removed weak sustain re-triggers, and fixed
                 the last chord (Tabber: 'A5').
====================================================================================================


[Intro / vamp  (Em9 shape = Gm9, Gmaj7 shape = Bbmaj7)]
  Em9 [Gm9]                        Em9 [Gm9]                        Gmaj7 [Bbmaj7]    (0:00, bar 1)
e|--------------------------------|--------------------------------|--------------------------------|
B|--------3---------------3-------|--------3-----------------------|0-------------------0-----------|
G|------0-0-----------------------|------0-------------0-----------|0-------------------------------|
D|----4---------------------------|----4---------------------------|------------4---------------4---|
A|--------------------------------|--------------------------------|--------------------------------|
E|0-----------0-------0-----------|0-----------0-----------0-------|3-------3---------------3-------|

  Gmaj7 [Bbmaj7]                   Em9 [Gm9]                        Em9 [Gm9]    (0:06, bar 4)
e|--------------------------------|------------------------0-------|--------------------------------|
B|--------------------------------|--------3-----------------------|--------3-----------------------|
G|------------------3---2---0-----|0-------0-----------------------|------0-----------------0---0---|
D|4-------------------------------|------4-------------------------|----4---------------------------|
A|--------------------------------|--------------------------------|--------------------------------|
E|3-------------------------------|0-------------------0-----------|0-------------------0-----------|

  Gmaj7 [Bbmaj7]                   Gmaj7 [Bbmaj7]                   Em9 [Gm9]    (0:12, bar 7)
e|--------------------------------|--------------0-----------------|--------------------------------|
B|--------0---------0-------------|------------0-0-----------------|--------3-----------------------|
G|----------------------0---------|------------------3---2---0---0-|--------------------0-----------|
D|--------4-----------------4-----|----------4---------------------|--------------------------------|
A|--------------------------------|--------------------------------|--------------------------------|
E|3-----------3---------3-------3-|------3-----------------------0-|------------0---------0-------0-|

  Em9 [Gm9]                        Em9 [Gm9]                        Gmaj7 [Bbmaj7]    (0:18, bar 10)
e|--------------------------------|--------------------------------|--------------------------------|
B|------3-------------------------|--------------------------------|------0-----------0-------------|
G|----0-0---------------0---------|------0---------------0---------|----0---------------------------|
D|----4---------------------------|----4---------------------------|------4-------------------4-----|
A|----2---------------------------|--------------------------------|--------------------------------|
E|----------0-------0-----------0-|----------0-------0-----------3-|--------3-3-----------3-------3-|

  Gmaj7 [Bbmaj7]                   Em9 [Gm9]                        Em9 [Gm9]    (0:24, bar 13)
e|--------------------------------|--------------------------------|--------------------------------|
B|----------0---------------------|------3---------------3---------|------3-------------------------|
G|------------------3---2---0-----|------0-------0-------0---------|----0---0-----------------------|
D|----------4---------------------|----4---------------------------|--4---4---------------4---------|
A|--------------------------------|----2---------------------------|--------------------------------|
E|------3-----------------------0-|----------0-------0-----------0-|------------------0-----------3-|

  Gmaj7 [Bbmaj7]                   Gmaj7 [Bbmaj7]                   Em9 [Gm9]    (0:30, bar 16)
e|--------------------------------|--------0-----------------------|--------------------------------|
B|--------------0---0-------------|----------0---------------------|------------------------3-------|
G|--------------------------------|--------------3---3---2---0-----|----------0-------0-----0-------|
D|----------4-------------4-------|----------4---------------------|------4-------------------------|
A|--------------------------------|--------------------------------|--------------------------------|
E|------3-------------3---------3-|----------------------------0---|--------------------0-------0---|

  Em9 [Gm9]                        Gmaj7 [Bbmaj7]                   Gmaj7 [Bbmaj7]    (0:36, bar 19)
e|--------------------------------|--------------------------------|--------------------------------|
B|----0-------------0-----0-------|--------------------0-----------|--------0---0-------------------|
G|--------0-----0-0---------------|--------------------------------|------------------3-2-0-0---0---|
D|--------------------------------|------4-4-------------------4---|--------4-----------------------|
A|--------------------------------|--------------------------------|----------------------------2---|
E|----------------------------3---|--------2-------3-------3-------|----3-----------------------0---|

  Em9 [Gm9]                        Em9 [Gm9]                        Em9 [Gm9]    (0:41, bar 22)
e|--------------------------------|--------------------------------|--------------------------------|
B|------3---------------3---------|------3-----3-------------------|--------------------------------|
G|------0-------------------0-----|----0-------------------0-0-----|--------------------------------|
D|--4-----------------4-----------|--4-----------------------------|----------4-------------4-------|
A|--------------------------------|--------------------------------|--------------------------------|
E|----------------0-----------0---|--------------------0-----------|3-----------3-------3-------3---|


[Fill (bars 25-27): melody on the G string, back to Gm9 via D in the bass]
  Gmaj7 [Bbmaj7]                   Gmaj7 [Bbmaj7]                   Em9 [Gm9]    (0:47, bar 25)
e|--------------------------------|--------------------------------|--------------------------------|
B|0-------------------------------|--------------------0-----------|--------------------------------|
G|--------------------2-----------|2-3-2---------2---2-0-----0-----|--------------------------------|
D|------------4-------------------|--------------------------------|----------------------------4---|
A|--------------------------------|--------------------------------|------2---------------------2---|
E|--------3-----------------------|--------------------------------|----------------------0---0-----|


[Outro]
  Em9 [Gm9]                        Em9 [Gm9]                        Em9 [Gm9]    (0:53, bar 28)
e|--------------------------------|--------------------------------|--------------------------------|
B|--3-0---------3-----------------|----0---------------------------|--------3-----------------------|
G|0---------------0---0-----------|----------0---------------------|------0-----------------0-------|
D|--------------------------------|------4-------------------------|----4-----------------4---------|
A|--------------------------------|------2-------------------------|----2-----------------2---------|
E|------------------0-------------|------0-------------------------|--0-------------------0---------|

  Gmaj7 [Bbmaj7]  A6sus2 [C6/9]    A6sus2 [C6/9]    (0:59, bar 31)
e|--------0---------------0-------|--------------------------------|
B|------0---------------0---------|------0-------------------------|
G|----0---------------------------|--------------------------------|
D|----4---------------4-----------|----4---------------------------|
A|--------------------0-----------|--0-----------------------------|
E|--3-----------------------------|--------------------------------|
```

</details>

*Claude drafted this post from the three passes' files and a script's comparison of each playback
with the recordings.*
