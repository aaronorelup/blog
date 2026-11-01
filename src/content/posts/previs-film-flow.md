---
id: "AO-054"
title: "My short AI film workflow, built around a rough 3D mock-up"
summary: "I turned two Higgsfield tutorials into one repeatable way to make short AI films of my characters. The steps, how I check what the video model copied, and what I've changed since September."
date: 2026-10-16
status: "shipped"
tags: ["previs", "blender", "minimax-h3", "ai-video", "workflow", "claude-code"]
series: ["characters"]
topic: "video"
project: ["characters"]
preview:
  verdict: "3D mock-up steers the shots"
  takeaway: "A rough gray 3D mock-up made in Blender steers the AI video model's camera and staging almost exactly, and drawing it in red over the result shows how closely."
  points:
    - "My time per film is about 25 minutes of decisions, or 1.5 to 2 hours if I paint references and edit the 3D file."
    - "On my 8 GB laptop, two reference images per clip took about 10 minutes. Four overflowed and took over an hour."
    - "How hard the mock-up pulls barely mattered between 0.85 and 0.55, so 0.55 is the default now."
  image: "/media/previews/previs-film-flow.webp"
  loop: "/media/previews/previs-film-flow.mp4"
  alt: "Side by side: a grey Blender previs of Jefrie's tail-launched jump on the left, the finished MiniMax-H3 shot on the right"
---

I make short AI films of my characters the same way every time now, and I kept losing track of
the steps. Every character, prop and place gets a painted reference sheet first. The shots that
are easier to act out than to describe get a rough gray 3D mock-up in Blender, a free 3D program.
That mock-up is called a previs, short for previsualization, and the AI video model gets it as a
guide.

**Then Claude draws the mock-up's edges in red over the finished shot, and you can see in a
second that the model followed its camera and staging almost exactly.**

<figure>
  <video src="/media/previs-film-flow/hollows-red-outline.mp4" controls preload="metadata" poster="/media/previs-film-flow/s10-red-outline.webp"></video>
  <figcaption>The whole first film. Shots 4, 6 and 10 had a previs, so they carry red outlines. The rest went straight to video.</figcaption>
</figure>

In September I gave Claude two tutorials from Higgsfield, a site that runs AI video models in the
cloud, and told it to do everything in them with my characters. Out came "The Hollows at the
Storm Bell", my characters Jefrie and BloodTailor fighting mud monsters. It's also in
[my post on twelve days of AI films](/ledger/every-ai-film-so-far/).

## The steps

- **Reference sheets first, all painted in one style.** A sheet is a page of pictures of one
  character, prop or place. The video copies the look of its references far more than any style
  words in the prompt.
- **The storyboard splits in two.** Shots quicker to animate than to describe get a previs of
  plain gray shapes. The rest go straight to video.
- **The previs goes to the video model with the sheets.** The model is MiniMax-H3, H3 for short,
  and each shot gets a five-part prompt.
- **Every previs shot gets checked.** Claude makes a red-outline video and a side-by-side for
  each one automatically, and those are what I review.

My part is about 25 minutes of decisions per film. Painting over the references and tweaking the
Blender file makes it 1.5 to 2 hours, and those two steps are where a film gets most of its
quality. The rest runs without me. Claude queues the renders and wakes itself up when they finish.

The [flowchart](/tools/previs-film-flow/) shows every step, mine and Claude's, with my time on
each.

<details><summary>The five-part prompt and the two tutorials</summary>

- Every shot's prompt has five blocks. The scene and style, what each reference is, what
  happens and when, what has to stay locked, and animation principles.
- The first tutorial was Higgsfield's animator's breakdown of a short film made with Blender and
  AI. I keep its 21 steps in a table, with whether we already did each one and how well Claude or
  I could do it.
- The second was five 30-second experiments. A one-take, a dialogue scene, viral camera moves, an
  ad in what the tutorial called "hypermotion" and a car commercial. Every one was mocked up in
  Blender before any video was made.
- The whole workflow is also a Claude skill, a set of instructions Claude loads when I type
  `/previs-film`. One settings file per film picks where it renders. On my laptop, on H3 through
  Higgsfield, or on Seedance 2.5, another video model.

</details>

## How closely the video follows the mock-up

In shot 10, the still on the first video, the red chain line runs straight into the giant
monster's shoulder and the red circle sits on its head, right where the Blender file put them. That's the blocking, where everything stands and
moves. Everything else, the paint, the mud, Jefrie's tail, came from the sheets.

<figure>
  <video src="/media/previs-film-flow/s04-side-by-side.mp4" controls muted loop preload="metadata"></video>
  <figcaption>Shot 4. Jefrie crouches, slams her tail, arcs over three monsters and skids to a landing. The Blender previs on the left, the finished H3 shot on the right.</figcaption>
</figure>

## What I've changed since September

**How hard the mock-up pulls barely matters.** H3 has a setting for how strongly the previs
steers it. A test on October 12th ran one shot at 0.85, 0.70 and 0.55, and all three came out
almost the same. They all followed the camera and none leaked gray blocks, so 0.55 is the default
now. What decides whether mistakes in the previs end up on screen is what goes in. That means a
painted first frame for the clip, a blurred grayscale previs and animation that's good to begin
with. [A bad previs](/ledger/a-bad-previs/) gets copied, bad motion and all.

**Two reference images per clip, not four, on my 8 GB laptop.** With two, a clip took about ten
minutes. With four, it filled the graphics card's memory, spilled into the laptop's regular
memory and crawled for over an hour. Now a shot with more characters gets their sheets side by
side in one image.

**My laptop first.** The first film ran on Higgsfield's cloud and cost about 192 of their paid
credits, when I'd wanted it made on my own machine. Now Claude renders on my laptop by default and
asks before it spends a credit.

**Sharing the GPU.** Several Claude sessions share my one GPU. A five-clip render once held it
for 1 hour 44 minutes while two others waited. Now a session books it one clip at a time, and any
clip past 15 minutes gets canceled.
