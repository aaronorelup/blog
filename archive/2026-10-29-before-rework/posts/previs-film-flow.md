---
id: "AO-054"
title: "The previs workflow, written down where I'll actually find it again"
summary: "Two Higgsfield tutorials turned into one repeatable way to make a short film on my laptop: sheets first, a grey Blender previs for the hard shots, a five-block prompt, then a red-outline check of how closely the video followed. Here is the flow, the ways to look at it, and what changed since September."
date: 2026-10-16
status: "shipped"
tags: ["previs", "blender", "minimax-h3", "ai-video", "workflow", "claude-code"]
series: ["characters"]
preview:
  verdict: "The red lines prove it"
  takeaway: "A grey Blender previs steers MiniMax-H3's blocking and camera almost exactly, and drawing it as red outlines over the result shows you how much."
  points:
    - "My time per film: about 25 minutes deciding, or 1.5 to 2 hours if I paint the references and touch the Blender file."
    - "On an 8 GB laptop: two reference images per clip ran at 10 minutes; four spilled out of VRAM and took over an hour."
    - "Previs strength from 0.85 down to 0.55 changed almost nothing, so 0.55 is now the default."
  image: "/media/previews/previs-film-flow.webp"
  loop: "/media/previews/previs-film-flow.mp4"
  alt: "Side by side: a grey Blender previs of Jefrie's tail-launched jump on the left, the finished MiniMax-H3 shot on the right"
---

In September I gave Claude two of Higgsfield's own tutorials and told it to do everything in them with my characters.
The first was their animator's breakdown of a short film made with Blender and AI. The second was a set of five
30-second experiments: a one-take, a dialogue scene, viral camera moves, a hypermotion ad and a car commercial, every
one blocked in Blender before any video was generated. What came out was "The Hollows at the Storm Bell", which I
wrote about in [every AI film so far](/ledger/every-ai-film-so-far/), and a way of working that I keep wanting to
reuse and keep losing track of. This post is me writing it down.

## What the workflow is

Sheets first: every character, recurring prop, effect and location gets a reference sheet before any video, and every
sheet gets painted over into one style, because the video copies the look of its references far more than it follows
the style sentence. Then a storyboard split into two piles: shots that are quicker to animate than to describe get a
grey-box Blender previs, the rest go straight to video. The previs is passed to MiniMax-H3 as a video reference next to
the sheets, with a prompt in five blocks: scene and style, what each reference is, timed beats, locks, animation
principles. Then you check every shot against its previs.

The check is the part I like most. Claude draws the edges of the grey previs in red over the finished shot:

<figure>
  <video src="/media/previs-film-flow/hollows-red-outline.mp4" controls preload="metadata" poster="/media/previs-film-flow/s10-red-outline.webp"></video>
  <figcaption>The whole film. Shots 4, 6 and 10 had a previs, so they carry red outlines; the rest were text to video.</figcaption>
</figure>

In shot 10 the red chain line runs straight into the giant's shoulder and the red circle sits on its head, exactly
where the Blender file put them. That's the blocking. Everything you can see, the paint, the mud, Jefrie's tail, came
from the sheets. There's a side-by-side version too:

<figure>
  <video src="/media/previs-film-flow/s04-side-by-side.mp4" controls muted loop preload="metadata"></video>
  <figcaption>Shot 4: crouch, tail slam, arc over three monsters, skid landing. Previs on the left, MiniMax-H3 on the right.</figcaption>
</figure>

## Ways to look at it

The same workflow lives in five places now, each for a different moment:

- **The flowchart** ([open it](/tools/previs-film-flow/)). Two lanes: what I do and what Claude and the GPU do, with my
  time on each step and the two steps where my own hands matter most marked. This is the one to read before starting.
- **The process table**, in my Documents folder: the 21 steps from the first tutorial, whether we already did each one,
  and how well Claude or I could do it.
- **The red-outline and side-by-side videos**, made automatically for every previs shot. This is how I review.
- **The `previs-film` skill.** Typing `/previs-film` loads the whole procedure, and one config file per film renders
  on my laptop, on Higgsfield's H3, or on Seedance 2.5.
- **The skills page in my notes**, which says what the skill is for, so I can find it when I've forgotten its name.

## What changed since September

**The previs strength knob.** H3's reference mode has a setting for how hard the previs video pulls. A test on
October 12th ran the same shot at 0.85, 0.70 and 0.55 and found almost no difference: all three followed the camera,
none leaked grey blocks. Turning it down cost nothing, so 0.55 is the default now. What actually decides whether
previs mistakes end up on screen is the inputs, not the knob: a painted first frame, a blurred greyscale previs, and
animation that's good to begin with. [A bad previs](/ledger/a-bad-previs/) gets copied, bad motion and all.

**Two references per clip, on 8 GB.** Clips with two reference images and a previs ran at about ten minutes each.
With four, the same clip filled the card to 7.9 of 8.2 GB, spilled into system memory and crawled for over an hour
while the GPU drew 36 watts. More characters in a shot now means their sheets go side by side in one image.

**Local first.** The first film went to Higgsfield's cloud and cost about 192 credits when I'd wanted it made on my
own machine. The skill now defaults to local and asks before spending a credit.

**Sharing the GPU.** Several Claude sessions now take turns on one GPU. A five-clip render that grabbed it in one
turn once held it for an hour and 44 minutes while two other sessions waited. Now it's one turn per clip, and a
watchdog cancels any clip that runs past 15 minutes.

The thing I keep relearning is that the expensive part of AI video is not the generation. It's knowing afterwards what
the model actually did with what you gave it. The red lines answer that in about a second.
