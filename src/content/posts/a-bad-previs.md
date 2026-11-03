---
id: "AO-023"
title: "Guiding an AI video model with a rough Blender animation"
summary: "I gave an AI video model a rough Blender animation of my character to follow, and compared it with clips made with no guide. What the guide kept steady and what it made worse."
date: 2026-09-27
topic: "video"
project: ["characters"]
preview:
  verdict: "The guide made it worse"
  takeaway: "The video model copied my guide animation's movement as faithfully as its camera, so a badly animated guide made the motion worse than no guide at all."
  points:
    - "With the guide, the camera and the scene held together from shot to shot. The dome, towers and sandbags stayed put."
    - "Without it, the motion felt far better, but where Jefrie stood and which way her scythe swung were often unclear."
    - "Even a guide made of gray boxes and spheres dragged the motion down. Keep it simple enough that you can animate it well."
  image: "/media/previews/a-bad-previs.webp"
  loop: "/media/previews/a-bad-previs.mp4"
  alt: "Jefrie's marionette attack side by side: the no-previs take on the left, the previs take on the right"
---

I had Claude make a rough animation of my character Jefrie in Blender, a free 3D program, and gave
it to an AI video model to follow. That kind of guide is called a previs, short for
previsualization. It tells the model where the camera goes and how the character moves, and the
model copied both. **Mine had bad animation in it, so the video moved worse than clips I made with
no guide at all.** So if you make one, its movement has to be better than what the model would do
on its own. That means keeping it simple enough that you can actually animate it well.

- **The camera and the scene held together with the previs.** The training yard's dome, towers and sandbags
  stayed put from shot to shot.
- **The movement felt way better without it,** but where Jefrie was and which way her scythe swung
  were often unclear.
- **The model copied the previs beat for beat,** dangling legs included.
- **Even a previs of gray boxes and spheres made the movement worse.**

## Where the bad animation came from

Jefrie is my scythe girl with a tail that weighs more than she does. The video model is MiniMax-H3,
H3 for short, which I run on my laptop.

The clips made with the previs come from a Jefrie training montage at the end of [my post about a
30-second film of the Claude Code mascot](/ledger/clawd-growth-montage/). On September 23rd I gave Claude Opus 5.5 a task to animate
some of her attacks ([six days of putting her in 3D](/ledger/jefrie-in-3d/) has that story). It
completely failed. They were terrible animations. Then the Claude session making the montage put them all into the previs,
without knowing how terrible they were, and H3 did exactly what it was told.

## Side by side

Same moves with and without the previs. The no-previs side moves better, and the previs side
keeps the yard in place. On the left in each clip is a four-minute film of Jefrie
training, made on September 25th with the same model, set up the same way, and no previs. It's part of [my 13-minute
Jefrie film](/ledger/every-ai-film-so-far/). On the right is the montage, where every clip followed
the matching six seconds of the Blender animation. These aren't controlled tests. The prompts differ
and it's night against dawn. But the moves are the same, and the difference is hard to miss.

The tail launch, where her tail throws her into a jump:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/cmp-jump.jpg" src="/media/previs-lesson/cmp-jump.mp4" style="width:100%;border-radius:0"></video>

The marionette attack, where her tail lifts her like a puppet:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/cmp-marionette.jpg" src="/media/previs-lesson/cmp-marionette.mp4" style="width:100%;border-radius:0"></video>

The heavy spin attack:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/cmp-spin.jpg" src="/media/previs-lesson/cmp-spin.mp4" style="width:100%;border-radius:0"></video>

Here's a longer stretch of the no-previs film:

<video controls playsinline preload="metadata" poster="/media/previs-lesson/train-excerpt.jpg" src="/media/previs-lesson/train-excerpt.mp4" style="width:100%;border-radius:0"></video>

## How closely it follows

On the left is the Blender previs for the marionette shot. On the right is what H3 made from a
grayscale copy of it, so it would take the movement and not the colors:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/previs-vs-h3.jpg" src="/media/previs-lesson/previs-vs-h3.mp4" style="width:100%;border-radius:0"></video>

The tail, the dangling legs and the timing of every beat carry straight across. The more detailed
the previs is, the more the video model follows it.

## Simpler characters didn't fix it

My first thought was that the problem was using Jefrie's actual 3D model. If I did this again, I'd
tell Claude not to use it. I'd ask for a 3D rectangle for her instead, with maybe a basic scythe to
show how it swings and a basic tail to show how that moves.

Or maybe not even that. An earlier short of Jefrie and my other character BloodTailor fighting a
pack of monsters had a previs of just gray boxes and spheres. It ran on H3 through Higgsfield, a
site that runs AI video models in the cloud. Even that made the movement worse:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/hollows-s04.jpg" src="/media/previs-lesson/hollows-s04.mp4" style="width:100%;border-radius:0"></video>

The camera and the blocking (where everyone stands) came through there too, and so did the previs's
movement. The full [previs workflow](/ledger/previs-film-flow/) has its own post.
