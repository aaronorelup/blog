---
id: "AO-053"
title: "Three music videos for one song, and I'm not happy with any of them"
summary: "Between 26 September and 4 October Claude made three music videos for BLACKWATER's \"Still on Shift\": one rendered inside the game, one repainted by an AI video model, and a full four-minute film with 97 shots. Each fixed the last one's craft problems. None of them gives off the feeling the song is supposed to have, and the reason is upstream of every pipeline."
date: 2026-10-16
status: "in-progress"
tags: ["claude-code", "ai-video", "music-video", "minimax-h3", "lessons"]
series: ["blackwater"]
preview:
  verdict: "Failing at the concept"
  takeaway: "Each version fixed the last one's craft and kept the same idea: show what each lyric line says. That idea is why all three feel lame."
  points:
    - "v3 was the full song: 97 shots, 89 keyframes, 73 video clips and 6.68 GPU-hours, with every cut on the beat."
    - "Its brief said \"one idea per lyric line\". It did exactly that: a bell on \"time\", a counter reading 0200 on \"Two hundred\"."
    - "All three are watchable in the post. None is the finished video; the next one starts from a feeling, not a shot list."
  image: "/media/previews/still-on-shift-concept.webp"
  alt: "A drowned hand holding a tally counter that reads 0200, from the third version"
---

"Still on Shift" is the jukebox song from [BLACKWATER](/ledger/blackwater-weekend/), my cave-diving
zombie game. It's about a 1960s drilling crew that drowned in 1968 and never clocked off, sung back
at the diver who comes down to count them. I like the song a lot. I've now had Claude make three
music videos for it in eight days, and I don't like any of them. They're lame, and I wouldn't put
any of them out as the finished video.

This post is the honest status: what each version was, what each one fixed, and why I think they
all fail at the same place.

<figure>
  <img src="/media/still-on-shift-concept/three-versions.webp" alt="Eight evenly spaced frames from each of the three versions: v1 rendered in the game engine, v2 repainted game previs, v3 photoreal keyframes animated with an AI video model" loading="lazy">
  <figcaption>Eight evenly spaced frames from each version. Every one looks better than the row above it.</figcaption>
</figure>

## Three versions, three pipelines

**v1** was [rendered inside the game itself](/ledger/still-on-shift-music-video/). No AI video
model: Claude wrote a director script that ran in Godot and staged 35 shots with the game's own
caves, crew and sounds. 2:45, about 49 GPU-minutes. Zombies swam into the lens, the camera shook,
and the lyric captions made it feel like an ad.

<iframe src="/media/still-on-shift/?embed" title="BLACKWATER — Still on Shift, v1" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

[Watch it full screen](/media/still-on-shift/).

**v2** used the game as a previs and had MiniMax-H3, the video model on my laptop, repaint it as
photoreal footage. It had to be restarted twice: once because every cut landed three or four seconds
late, and once because the look drifted back to game graphics. It was a big step up from v1, but it
was low resolution, it kept repeating one composition, and the diver changed between shots. The
best shot was the one with no previs at all, which told us the previs was holding everything else
back. That story is in [my roundup of every AI film so far](/ledger/every-ai-film-so-far/).

<iframe src="/media/still-on-shift-v2/?embed" title="BLACKWATER — Still on Shift, v2" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

[Watch it full screen](/media/still-on-shift-v2/).

**v3** started over from the song and the lore instead of the game. I wrote the brief myself: start
from the lyrics, collect real reference photos from 1960s mines and navy diving, show me reference
sheets, a look bible, a measured beat grid and a shot list before any long render, and plan with
one idea per lyric line. Claude did all of it. 3:56, 97 shots with every cut on the measured beat,
89 Qwen-Image keyframes, 73 H3 clips at 1344×768, and 6.68 GPU-hours over a night of 30-minute turns
on a shared GPU queue. The words were written into the world on ledgers, stencils and a wrist slate
instead of captions. It reviewed every clip, wrote down what was wrong, and fixed it: a silt shot
cut from two takes, a sinking photograph redone in code, a counter tracked frame by frame so it
could roll from 0200 to 0300 on the right word.

<iframe src="/media/still-on-shift-v3/?embed" title="BLACKWATER — Still on Shift, v3" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

[Watch it full screen](/media/still-on-shift-v3/). Sound on for all three.

By any checklist v3 is the best of the three. It still doesn't work.

## What's actually wrong

The video shows the lyrics. It doesn't feel like the song.

<figure>
  <img src="/media/still-on-shift-concept/literal.webp" alt="Four frames from v3, each captioned with the lyric it illustrates: a bell for 'the water's keeping time', a counter reading 0200 for 'Two hundred by the tally', a 300 FT tag for 'Three hundred by the line', a counter reading 0300 for 'three hundred'" loading="lazy">
  <figcaption>v3, line by line. Every image is correct, and that's the problem.</figcaption>
</figure>

"The water's keeping time" gets a bell. "Two hundred by the tally" gets a counter that reads 0200.
"Three hundred by the line" gets a brass tag that says 300 FT. It's a slideshow of the nouns in the
song, landed perfectly on the beat. You watch it the way you'd read a lyric sheet, one line after
another, and nothing builds.

That one's on me as much as on Claude. "One idea per lyric line" was in my brief. So was "words
inside the world". It took both literally and did them very well. Every session after that went
into craft: resolution, beat sync, getting rid of debris and stray fish, timing a bell strike to a
syllable. Those are real problems and they're solved now. But none of them is the problem.

Looking at the three rows together, each version swapped the pipeline and kept the concept. v1 put
the lyrics on screen as captions. v2 put them on screen as staged game scenes. v3 put them on screen
as photoreal objects. The idea underneath never changed: here is what this line is about. Nobody,
me included, ever wrote down what someone should feel at 1:25, or at the bridge, or when the roster
cuts off mid-name. Without that, a better pipeline just illustrates the lyrics more expensively.

## Where it stands

The experiment is a failure for now. All three are up there so you can see how they fail, but
none of them is the music video. The pipeline is genuinely good now, and I'll reuse almost all of it:

- the beat grid and word timings measured from the song,
- reference sheets so faces and places stay the same between shots,
- the habit of reviewing every clip and writing down what's wrong.

What changes is the order. The next version starts with the concept and the feeling, written down
and agreed before anyone opens a shot list. Only after that does it get a pipeline. I don't know
yet what that concept is, which is the honest place to stop.
