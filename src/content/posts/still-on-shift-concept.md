---
id: "AO-053"
title: "Three tries at an AI music video for my game's song"
summary: "Claude made three music videos for \"Still on Shift\", the song from my cave-diving zombie game, each made a better way than the last. What each one fixed, and why all three miss the song's feeling."
date: 2026-10-16
status: "in-progress"
tags: ["claude-code", "ai-video", "music-video", "minimax-h3", "lessons"]
series: ["blackwater"]
topic: "video"
project: ["blackwater"]
preview:
  verdict: "Right craft, wrong concept"
  takeaway: "Each version fixed the last one's craft but kept the same idea, showing what each lyric line says. That idea is why all three feel lame."
  points:
    - "The third had 97 shots cut on the beat, 89 AI keyframe images, 73 AI video clips and 6.68 GPU-hours of rendering."
    - "My brief asked for one idea per lyric line, so \"keeping time\" got a bell and \"Two hundred\" a counter reading 0200."
    - "The next one starts from a written feeling and concept, then reuses the beat grid, reference sheets and clip reviews."
  image: "/media/previews/still-on-shift-concept.webp"
  alt: "A drowned hand holding a tally counter that reads 0200, from the third version"
---

In eight days I had Claude make three music videos for "Still on Shift", the jukebox song from
[BLACKWATER](/ledger/blackwater-weekend/), my cave-diving zombie game, and I don't like any of
them. Each one fixed the craft problems of the last, but all three just show what each lyric line
says, and none of them feels like the song. Part of that's on me, because "one idea per lyric
line" was in my brief.

The song is about a 1960s drilling crew that drowned in 1968 and never clocked off. They sing it
back at the diver who comes down to count them. I like it a lot. The videos are lame.

<figure>
  <img src="/media/still-on-shift-concept/three-versions.webp" alt="Eight evenly spaced frames from each of the three versions: v1 rendered in the game engine, v2 repainted game previs, v3 photoreal keyframes animated with an AI video model" loading="lazy">
  <figcaption>Eight evenly spaced frames from each version, v1 on top. Each row looks better than the one above it.</figcaption>
</figure>

- **v1 was filmed inside the game**, with no AI video.
- **v2 had an AI model repaint the game footage.** Better, but low resolution and repetitive.
- **v3 started over from the song.** The best made of the three, with 97 shots cut on the beat.
- **The next one starts from a written-down feeling.**

## The first one, filmed inside the game

For [v1](/ledger/still-on-shift-music-video/), Claude wrote a program that stages and films every
shot inside my rebuild of the game in Godot, a free game engine. It's 35 shots
with the game's own caves, crew and sounds, 2:45 long. Zombies swam into the lens, the camera
shook, and the lyric captions made it feel like an ad.

<iframe src="/media/still-on-shift/?embed" title="BLACKWATER, Still on Shift, v1" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

[Watch it full screen](/media/still-on-shift/).

## The second one, game footage repainted by AI

v2 had MiniMax-H3, the AI video model on my laptop, repaint the game footage to look like real
film. A big step up, but low resolution, the same framing over and over, and a diver who changed
between shots. Its best shot had no game footage under it at all, which told us the
footage was holding the rest back. More in [my roundup of every AI film so far](/ledger/every-ai-film-so-far/).

<iframe src="/media/still-on-shift-v2/?embed" title="BLACKWATER, Still on Shift, v2" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

[Watch it full screen](/media/still-on-shift-v2/).

<details><summary>Why v2 was restarted twice</summary>

Once because every cut landed three or four seconds late, and once because the look drifted back
to game graphics.

</details>

## The third one, the full song from scratch

v3 started over from the song and the lore, with a brief I wrote myself. It's 3:56, with 97 shots
and every cut on a beat measured from the song. Claude made 89 still pictures with Qwen-Image, an
AI image model, and had H3 animate them into 73 clips. That took 6.68 hours of graphics-card time.
There are no captions. The words are written on ledgers, stencils and a diver's wrist slate.
Claude reviewed every clip and fixed what was wrong.

<iframe src="/media/still-on-shift-v3/?embed" title="BLACKWATER, Still on Shift, v3" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

[Watch it full screen](/media/still-on-shift-v3/). Sound on for all three.

<details><summary>My brief for v3, and the details</summary>

- **Start from the lyrics**, not the game.
- **Collect real reference photos** from 1960s mines and navy diving.
- **Before any long render, show me** reference sheets (pictures that pin down each face and
  place), a look bible (one guide to the colors, light and style), a beat grid with every beat and
  word timed from the song, and a shot list.
- **Plan one idea per lyric line**, and put the words inside the world.
- **The clips** are 1344 by 768. They rendered over one night, in 30-minute turns on the graphics
  card my agents share.
- **Some of the fixes:** a silt shot cut together from two takes, a sinking photograph redone in
  code, and a counter tracked frame by frame so it rolls from 0200 to 0300 on the right word.

</details>

## What's wrong with all three

They show the lyrics and don't feel like the song.

<figure>
  <img src="/media/still-on-shift-concept/literal.webp" alt="Four frames from v3, each captioned with the lyric it illustrates: a bell for 'the water's keeping time', a counter reading 0200 for 'Two hundred by the tally', a 300 FT tag for 'Three hundred by the line', a counter reading 0300 for 'three hundred'" loading="lazy">
  <figcaption>v3, line by line. Each picture is exactly what its line says.</figcaption>
</figure>

"The water's keeping time" gets a bell. "Two hundred by the tally" gets a counter reading 0200.
"Three hundred by the line" gets a tag that says 300 FT. It's a slideshow of the nouns in the song,
landed on the beat, and nothing builds.

That's on me as much as on Claude. "One idea per lyric line" and "words inside the world" were
both in my brief, and Claude took both literally and did them very well. Every session after that
went into craft, like beat sync, getting rid of stray fish and timing a bell strike to a syllable.
Those are solved now, but they weren't the main problem.

Each version changed how it was made and kept the same idea. v1 put the lyrics on screen as
captions, v2 as game scenes and v3 as real-looking objects. Nobody, me included, ever wrote down
what someone should feel at 1:25, or at the bridge, or when the roster cuts off mid-name. Without that, a better way of making it just illustrates the lyrics more
expensively.

## What I'm keeping for the next one

None of the three is the music video, so as of 16 October the experiment is a failure. I'll still reuse
almost all the tools:

- **The beat grid and word timings** measured from the song.
- **Reference sheets**, so faces and places stay the same between shots.
- **Reviewing every clip** and writing down what's wrong.

What changes is the order. The next one starts with the concept and the feeling, written down and
agreed before anyone opens a shot list. I don't know yet what that concept is.
