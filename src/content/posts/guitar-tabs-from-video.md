---
id: "AO-078"
title: "Turning my guitar videos into tabs with AI"
summary: "My Grok bot turned ten videos of me playing guitar into tabs and played them back as audio. Claude Opus 5.5 is trying the same ten blind, and again with a tab skill Claude Code built."
date: 2026-11-09
topic: "agents"
project: []
draft: true        # until Aaron says it's good, in his own words
# OPUS: the card covers Grok Bot only. Rewrite verdict, takeaway and points once both Opus 5.5 runs are in.
preview:
  verdict: "Rough notes, no rhythm"
  takeaway: "Played back, my Grok bot's tabs matched the key of 5 of 8 recordings but kept almost none of my rhythm."
  points:
    - "Two of the ten videos got only a header and no tab, so there was nothing to play."
    - "By their mix of notes, 4 of 8 playbacks were closest to their own song out of all ten recordings."
    - "Both Claude Opus 5.5 runs, blind and with the Tabber skill, are unfinished. Only Grok Bot's results are in."
  image: "/media/previews/guitar-tabs-from-video.webp"
  alt: "A hand fretting a chord on an acoustic guitar, filmed close up"
---

I wanted to see if AI could turn videos of me playing guitar into tabs. Tabs are guitar music
written as fret numbers on six lines, one per string. My Grok bot went first and played its tabs
back as audio. **They matched the recording's key for 5 of 8 videos but kept almost none of my
rhythm.** Two of the first ten videos got no tab at all.

Claude Opus 5.5 is trying the same ten twice, once blind and once with Tabber, a tab skill Claude
Code built. Neither run is finished, so their slots below say pending.

## Three tries

- **Grok Bot drafted tabs and played them back.** Grok Bot is my AI assistant. I call it Gages,
  and it's part of [my setup](/now/2026-11-08/). It went through all 103 videos in my guitar
  album, and this post covers the first ten. It took the notes from the sound and used the
  picture mostly to look for a capo, a clamp across the strings that raises every note. It
  assumed standard tuning (the usual E A D G B E) for all ten, and I know at least one of those
  guesses is wrong. Its tabs have no rhythm, so it played them back on a simple synthetic string
  at one steady pace. For most videos that's half the speed I played. For 001 and 002 it wrote a
  header and no tab, so there was nothing to play.
- **Claude Opus 5.5 tried it blind.** I gave Claude Code the ten videos and nothing else. No
  titles, no guitar or transcription skills, none of Grok Bot's work. It's running Opus 5.5 at max
  reasoning effort, and it has to work out its own tab and turn that into its own MP3. Pending.
- **Then Opus 5.5 again, with Tabber.** Claude Code built Tabber, a reusable skill that turns a
  video or an audio file into tab. A skill is a folder of instructions and scripts Claude Code
  picks up when a task needs it. A second Opus 5.5 run is doing the same ten songs with it.
  Pending.

<!-- TABBER:about (optional): a line or two on how Tabber works, once its run is in. -->

## How close each one got

One rough check for now. A script measured how much of each of the 12 notes is in a playback and
compared that mix with all ten real recordings. The table shows where the right recording ranked.
1st means the playback was closest to its own song. Picking at random gets 1st one time in ten.

<!-- OPUS-BLIND:table and OPUS-TABBER:table: fill the two Opus columns with the same ranking. -->

| Video | Grok Bot | Opus 5.5, blind | Opus 5.5 with Tabber |
|---|---|---|---|
| 001 | no tab | pending | pending |
| 002 | no tab | pending | pending |
| 003 | 5th | pending | pending |
| 004 | 1st | pending | pending |
| 005 | 4th | pending | pending |
| 006 | 2nd | pending | pending |
| 007 | 2nd | pending | pending |
| 008 | 1st | pending | pending |
| 009 | 1st | pending | pending |
| 010 | 1st | pending | pending |

Grok Bot's playbacks came out closest to their own song for 4 of 8. The script also guessed every
key, and Grok Bot's matched the recording for 5 of 8. The three misses were next-door keys that
share all or all but one of their notes.

It's a loose test. Most of these songs sit in the same few keys, and the real recordings have
singing and talking in them. It hears notes only, so it says nothing about rhythm. It can't catch
a wrong tuning either. Grok Bot put the notes it heard onto standard-tuning frets, and its player
turned them straight back into the same notes.

## The ten videos

### 001

13 seconds and mostly dark. Grok Bot's draft is a header with no tab, so there was nothing to
play.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-001.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:13</span></figcaption></figure>
<figure><figcaption><b>Grok Bot</b><span class="ao-meta">no tab, so nothing to play</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song01:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song01:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 001 (pending)</summary>

<!-- OPUS-BLIND:song01:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 001 (pending)</summary>

<!-- OPUS-TABBER:song01:tab -->
Pending.

</details>

### 002

5 seconds. Same as 001, a header with no tab and nothing to play.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-002.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:05</span></figcaption></figure>
<figure><figcaption><b>Grok Bot</b><span class="ao-meta">no tab, so nothing to play</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song02:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song02:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 002 (pending)</summary>

<!-- OPUS-BLIND:song02:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 002 (pending)</summary>

<!-- OPUS-TABBER:song02:tab -->
Pending.

</details>

### 003

1:56, filmed close on my hands. Grok Bot called it a partial take.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-003.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">1:56</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-003.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song03:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song03:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 003 (pending)</summary>

<!-- OPUS-BLIND:song03:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 003 (pending)</summary>

<!-- OPUS-TABBER:song03:tab -->
Pending.

</details>

### 004

2:39, and the camera only shows a wall, so this one is all sound. Grok Bot called it a likely
full take.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-004.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">2:39</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-004.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:06</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song04:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song04:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 004 (pending)</summary>

<!-- OPUS-BLIND:song04:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 004 (pending)</summary>

<!-- OPUS-TABBER:song04:tab -->
Pending.

</details>

### 005

3:27, with a long stretch of talking in the middle. Grok Bot did this one first and in the most
detail. Its playback is the four-chord loop it found, repeated at about my tempo.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-005.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">3:27</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-005.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its main loop played back at about my tempo, 0:32</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song05:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song05:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 005 (pending)</summary>

<!-- OPUS-BLIND:song05:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 005 (pending)</summary>

<!-- OPUS-TABBER:song05:tab -->
Pending.

</details>

### 006

2:11. Grok Bot called it a likely full take.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-006.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">2:11</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-006.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song06:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song06:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 006 (pending)</summary>

<!-- OPUS-BLIND:song06:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 006 (pending)</summary>

<!-- OPUS-TABBER:song06:tab -->
Pending.

</details>

### 007

40 seconds. Grok Bot's two tabbed stretches nearly overlap, so its playback is mostly the same
16 seconds twice.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-007.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">0:40</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-007.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:06</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song07:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song07:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 007 (pending)</summary>

<!-- OPUS-BLIND:song07:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 007 (pending)</summary>

<!-- OPUS-TABBER:song07:tab -->
Pending.

</details>

### 008

3:03. Grok Bot called it a likely full take.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-008.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">3:03</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-008.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song08:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song08:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 008 (pending)</summary>

<!-- OPUS-BLIND:song08:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 008 (pending)</summary>

<!-- OPUS-TABBER:song08:tab -->
Pending.

</details>

### 009

4:51, the longest. Grok Bot thinks it's the same song as a later video named "Very scary 2",
because the chorus words in its automatic transcripts match. That isn't confirmed by ear.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-009.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">4:51</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-009.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song09:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song09:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 009 (pending)</summary>

<!-- OPUS-BLIND:song09:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 009 (pending)</summary>

<!-- OPUS-TABBER:song09:tab -->
Pending.

</details>

### 010

1:03, with a capo. Grok Bot counted it at fret 3 from the picture, and its playback raises every
note to match.

<ao-compare cols="2" aspect="16/9">
<figure><video src="/media/guitar-tabs-from-video/song-010.mp4" controls preload="metadata" playsinline></video><figcaption><b>The real video</b><span class="ao-meta">1:03</span></figcaption></figure>
<figure><audio class="fill" src="/media/guitar-tabs-from-video/grokbot-010.mp3" controls preload="none"></audio><figcaption><b>Grok Bot</b><span class="ao-meta">its tab played back at half speed, 1:07</span></figcaption></figure>
<figure><!-- OPUS-BLIND:song10:audio --><figcaption><b>Opus 5.5, blind</b><span class="ao-meta">pending</span></figcaption></figure>
<figure><!-- OPUS-TABBER:song10:audio --><figcaption><b>Opus 5.5 with Tabber</b><span class="ao-meta">pending</span></figcaption></figure>
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

<details><summary>Opus 5.5's blind tab for 010 (pending)</summary>

<!-- OPUS-BLIND:song10:tab -->
Pending.

</details>

<details><summary>Opus 5.5's tab with Tabber for 010 (pending)</summary>

<!-- OPUS-TABBER:song10:tab -->
Pending.

</details>

*Claude drafted this post from Grok Bot's files and a script's comparison of each playback with
the recordings.*
