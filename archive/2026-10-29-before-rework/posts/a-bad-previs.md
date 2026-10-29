---
id: "AO-023"
title: "The video model follows your previs, bad animation included"
summary: "A Blender previs gives a video model the camera and the character's movement, and it copies both. Mine kept the camera and the space consistent, and made the movement worse than no previs at all, because the animation in it was bad. If you make one, its movement has to be better than what the model would do on its own."
date: 2026-09-27
status: "shipped"
tags: ["previs", "blender", "minimax-h3", "ai-video", "lessons"]
series: ["characters"]
preview:
  verdict: "The previs made it worse"
  takeaway: "A video model copies the motion in a Blender guide animation (a previs) as faithfully as its camera, bad animation included."
  points:
    - "Mine held attacks Opus 5.5 had failed to animate. MiniMax-H3 kept every beat of them, down to the dangling legs."
    - "Without a previs the motion felt far better, but where Jefrie stood and which way her scythe swung were often unclear."
    - "Even a previs of grey boxes and spheres dragged the motion down. Keep it simple enough that you can animate it well."
  image: "/media/previews/a-bad-previs.webp"
  loop: "/media/previews/a-bad-previs.mp4"
  alt: "Jefrie's marionette attack side by side: the no-previs take on the left, the previs take on the right"
---

A previs hands the video model two things: where the camera goes, and how the character moves.
It follows both. So if the movement in your previs is worse than what the model would have done
on its own, you've made the film worse, and that's what happened here.

This is the Jefrie montage from [yesterday's post](/ledger/clawd-growth-montage/). The Blender
animation it was built on came from September 23rd, when I gave Opus 5.5 a task to animate some of
Jefrie's attacks. It completely failed. They were terrible animations. Then the session making
the montage put them all together into the previs, without knowing how terrible they were, and
MiniMax-H3 did exactly what it was told.

## Side by side

On the left in each clip is a four-minute training film I made on the 25th with the same model,
the same latent-chaining setup and no previs at all. On the right is the montage, where every clip
got the matching six seconds of the Blender animation as a motion reference. These aren't
controlled tests: different prompts, night against dawn, a different pass over the same moves.
But the moves are the same ones, and the difference is hard to miss.

The tail launch:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/cmp-jump.jpg" src="/media/previs-lesson/cmp-jump.mp4" style="width:100%;border-radius:0"></video>

The marionette attack, where her tail lifts her like a puppet:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/cmp-marionette.jpg" src="/media/previs-lesson/cmp-marionette.mp4" style="width:100%;border-radius:0"></video>

The heavy spin:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/cmp-spin.jpg" src="/media/previs-lesson/cmp-spin.mp4" style="width:100%;border-radius:0"></video>

With the previs, the camera movement follows the previs and the 3D geometry of the scene stays
consistent. The dome, the towers and the sandbags stay where they are from shot to shot.

Without it, Jefrie's location in 3D space is often unclear, and so is the weapon's movement. You
can't always tell where she is relative to anything, or which way the scythe is travelling.

But the feel of the movements as a whole is way better without the previs.

Here's a longer stretch of the no-previs film, so you can see it move for more than six seconds:

<video controls playsinline preload="metadata" poster="/media/previs-lesson/train-excerpt.jpg" src="/media/previs-lesson/train-excerpt.mp4" style="width:100%;border-radius:0"></video>

## How closely it follows

On the left is the Blender previs for the marionette shot. On the right is what H3 made from it, from a greyscale copy of that same clip:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/previs-vs-h3.jpg" src="/media/previs-lesson/previs-vs-h3.mp4" style="width:100%;border-radius:0"></video>

The tail, the dangling legs and the timing of every beat carry straight across. The more detailed
the previs is, the more the video model follows it.

## It isn't only the character model

My first thought was that the problem was using Jefrie's actual 3D model. If I did this again, I'd
tell Claude not to use it. Instead I'd ask for a 3D rectangle for her, with maybe the most basic
version of her weapon to show how it's supposed to swing, and maybe a basic tail to show how that's
supposed to move.

Or maybe not even that. For an earlier short, BloodTailor and Jefrie against a pack of monsters at the Storm Bell, I
used a previs with much more basic characters, grey boxes and spheres, generated on H3 through
Higgsfield. Even that caused the movement to be worse:

<video controls muted loop playsinline preload="metadata" poster="/media/previs-lesson/hollows-s04.jpg" src="/media/previs-lesson/hollows-s04.mp4" style="width:100%;border-radius:0"></video>

The camera and the blocking came through there too, and so did the previs's movement.

## The lesson

The previs gives the movement of the character and the camera. So if you make one, you'd better
make the movement of the character and the camera better than it would be if you had just
generated the video on its own.

That means making it simple enough that you can actually do a good job of it. The model will
follow whatever you give it, including the parts you got wrong.
