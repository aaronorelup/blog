---
id: "AO-058"
title: "A papercraft animation of my character, made with code"
summary: "I had Claude make a six-second loop of Jefrie, my scythe-carrying character, as a folded-paper puppet, with no hand animation at all. How it works, and what six rounds of review caught."
date: 2026-10-18
status: "shipped"
tags: ["claude-code", "opus-5-5", "blender", "animation", "agents", "characters"]
series: ["characters"]
topic: "3d"
project: ["characters"]
preview:
  verdict: "Worked on the sixth pass"
  takeaway: "A spring on the scythe and a weighted chain on the tail make her look light, with nothing animated by hand. The fixes that mattered came from measuring, not looking."
  points:
    - "A second reviewer agent caught the tail tip floating about 6 cm off the paper. The agent that built the loop missed it."
    - "An automated check found the scythe handle passing through her head. Now her hand slides down it when she hangs."
    - "The whole build took about two hours on my laptop, reviews included. The final render of 144 frames took 250 seconds."
  image: "/media/previews/paper-jefrie.webp"
  loop: "/media/previews/paper-jefrie.mp4"
  alt: "Papercraft Jefrie standing on a sheet of paper with her spiked tail and red scythe, just before the tail lifts her"
---

I had Claude make a six-second loop of Jefrie, my scythe-carrying character, as a folded-paper
puppet on a desk. One Python script builds her and works out every move, and Blender, the free 3D
program, renders it. Nothing is animated by hand. **A spring swings the scythe and a weighted chain
moves the tail, and that's what makes her look light.** It took about two hours, most of it
review, and **the fixes that mattered came from agents measuring things, not looking at them.**

<ao-frames fps="24" marks="24:Hang|54:Yank|66:Cut|84:Skid|131:Thump">
<video controls muted loop playsinline preload="metadata" poster="/media/paper-jefrie/paper_jefrie.webp" src="/media/paper-jefrie/paper_jefrie.mp4"></video>
<figcaption><b>Paper Jefrie, the final loop</b><span class="ao-meta">16 Oct · Claude Code with Opus 5.5, rendered in Blender 5.2 · 144 frames at 24 a second, a new pose every second frame · a 720p web copy of the square full-size render</span></figcaption>
</ao-frames>

The tail lifts her like a puppet on strings and flings her. The scythe drags her through a full
turn to cut a paper crane, then she skids and settles. The way I describe her, she's light, and
her heavy tail and scythe move her. I'd tried her in 3D before with
[six days of models](/ledger/jefrie-in-3d/) and
[AI rigging tools that lost to a script](/ledger/ai-rigging-vs-a-script/). This is the first time
she moved like that.

## What came out of it

- **The first review failed it on four counts.** Weight, the spin and cut, the skid, and how clear
  it is as a small GIF.
- **A second reviewer caught the tail tip floating about 6 cm off the paper.** The builder agent had
  missed it by eye.
- **An automated check caught the scythe handle going through her head.**
- **The sixth review passed it on every count.** Then the method became a skill, a short how-to
  page an agent loads before a job.

## Where the idea came from

It started with [Kevin Ngo's post](https://x.com/kevin_t_ngo/status/2102761406315839798) on X.
It's a GIF of paper characters on a desk, "animated in Python and rendered in Blender" by Opus 5.5,
a Claude model. The prompt I had Claude write asked for flat cut-paper pieces. Then Claude studied
his clip frame by frame and saw folded paper boxes, so Jefrie became boxes and folded card.

## One script, two jobs

`paper_jefrie.py` is one file of 1,869 lines. Run on its own, it works out the motion and draws
stick figures in about 10 seconds, so Claude could fix the moves without opening Blender. Inside
Blender it builds everything from nothing and renders.

<ao-compare cols="2" aspect="3/2">
<figure><img src="/media/paper-jefrie/motion-01.webp" alt="A grid of 24 stick-figure poses of Jefrie, her scythe and tail, every quarter second" loading="lazy"><figcaption><b>Stick-figure sheet 1</b><span class="ao-meta">16 Oct · plain Python, no Blender · framed too tight, and the scythe flails in the hang</span></figcaption></figure>
<figure><img src="/media/paper-jefrie/motion-10.webp" alt="The same grid of 24 stick-figure poses later in the build: the tail arches over her and plants behind her" loading="lazy"><figcaption><b>Stick-figure sheet 10</b><span class="ao-meta">16 Oct · 11 sheets in all · the tail now rises out of her back and plants</span></figcaption></figure>
</ao-compare>

The scythe follows her hands on a spring, so it lags, overshoots and keeps swinging after she
stops. The tail is a chain of 14 weighted points. Gravity is turned way down, because a 9 cm figure
falling at real gravity looks like a toy.

<details><summary>The spring code, the tail and the crane</summary>

This is the heart of the scythe, from the script:

```python
w0 = 2 * math.pi * freq; k = w0 * w0; c = 2 * zeta * w0
self.V += (k * (Gt - self.G) - c * self.V) * dt
self.G += self.V * dt
e = mat_rotvec(Rt_ @ self.R.T)
self.W += (k * e - c * self.W) * dt
self.R = rotvec_mat(self.W * dt) @ self.R
```

- The tail's 14 points can't pass through the paper, and it has a target shape for each part of
  the move: rest, arch, coil, fling, drag, plant.
- Gravity is 55 cm/s², which the script calls "puppet gravity", so she falls the way a person
  would.
- The crane's flight is worked out backwards from the cut. The script finds the pose where the
  blade is furthest to her front right and flies the crane in to arrive exactly there.
- Her home, an iron-bar dome, is a pencil sketch on the sheet behind her.

</details>

## Six rounds of review

There were six review passes, each a sheet of 24 stills, one every quarter second. The first
reviewer agent played an animation director and checked the loop against how I describe Jefrie.
It passed three things, called four weak and failed four.

<ao-slider aspect="3/2" labels="Pass 1|Pass 6">
<img src="/media/paper-jefrie/pass-01.webp" alt="Contact sheet of pass 1: 24 frames of the loop, with the camera drifting and a grey tail floating off the paper">
<img src="/media/paper-jefrie/pass-06.webp" alt="Contact sheet of pass 6: the same 24 moments, a locked camera, the tail on the paper and red speed streaks on the swing">
<figcaption><b>Pass 1 against pass 6, the same 24 moments</b><span class="ao-meta">16 Oct · quick low-quality stills, about 1 second each on my laptop · pass 1 went to the first reviewer, pass 6 got the second reviewer's go</span></figcaption>
</ao-slider>

<details><summary>What the first reviewer said</summary>

- It took 12.5 minutes.
- Passed three things, among them the puppet-on-strings lift and the seam where the loop starts
  again.
- Failed: weight, the spin and cut, the skid and plant, and reading it at GIF size.
- The tail floated when it should have rested. The smear (the stretched shape that shows a fast
  swing) looked like a boat. The tail tip looked like a dragon's head, and a dot for her ear read
  as a third eye.
- It called the arch of the lift the best image in the loop and said to protect it.

</details>

### The tail tip was floating

The second reviewer ran its own copy of the motion math on pass 3. The tail tip, which should sit
on the paper during the hang, floated about 5 cm up. The builder measured **5.7 to 6.2 cm**, more
than half her height, and wrote that the camera angle had fooled it. Pinning the end of the chain
brought the tip down to under half a centimetre.

<figure><img src="/media/paper-jefrie/same-frame-every-pass.webp" alt="Six crops of the same hang frame across six passes; in the first five the tail tip hangs in the air, in the last it touches the paper" loading="lazy"><figcaption><b>Frame 25 at every pass</b><span class="ao-meta">the same moment of the hang, pass 1 to the final render · the tail tip is in the air until the last one</span></figcaption></figure>

### The scythe went through her head

An automated check added in the same round found something nobody had flagged. In the hang and
the settle, the scythe's handle went through her head. Now when she hangs limp, her hand slides
down the handle to its end. After that the check found nothing passing through her in any of the
72 poses, and the second reviewer passed round 6 on every count.

<ao-slider aspect="1/1" labels="Clay and ink|Final">
<img src="/media/paper-jefrie/clay-f025.webp" alt="The hang frame in plain white clay with black ink outlines: the tail arches over her and the pencil-sketched dome sits behind">
<img src="/media/paper-jefrie/final-f025.webp" alt="The same hang frame in the final colour render: grey card, red blade and red tail underside">
<figcaption><b>The hang, frame 25</b><span class="ao-meta">a plain white clay version with ink outlines, 3.3 seconds to render · the final color render at full size</span></figcaption>
</ao-slider>

## A second loop on the same puppet

With time left, Claude reused the script for a second loop. Jefrie's at her day job as a fast-food
cashier, head on one hand. She breathes, sighs, blinks and slams her tail once. The polo and visor
are the agent's design, not mine.

<video controls muted loop playsinline preload="metadata" poster="/media/paper-jefrie/grease_basket.webp" src="/media/paper-jefrie/grease_basket.mp4" style="width:100%;max-width:540px;border-radius:8px"></video>

<details><summary>Render times and file sizes</summary>

The whole build ran on the evening of 16 October, from 21:44 to 23:41, two reviewer agents
included.

| | Main loop | Fast-food loop |
|---|---|---|
| Poses | 72, each held two frames (144 frames) | 60 (120 frames) |
| Final render | 250.0 s, 3.47 s a frame | 174.7 s, 2.91 s a frame |
| GIF at 720 px | 8.39 MB | 5.39 MB |
| MP4 1080p / 720p | 1.69 MB / 0.51 MB | 0.69 MB / 0.16 MB |

My laptop's graphics card is shared between sessions through a queue, so rendering went in 25
short reservations, about 26 minutes of GPU time. The first one waited 19 minutes behind another
session's render.

</details>

## It's a skill now

I said "This is good" the next day and asked for a skill with only what an agent needs to make
another one. It has the template script, the commands, the review loop and the lessons that cost
extra passes.
