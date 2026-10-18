---
id: "AO-058"
title: "Paper Jefrie: a six-second loop Claude animated in Python and rendered in Blender"
summary: "Claude built my character out of folded paper, animated her with springs and a chain instead of keyframes, and rendered a six-second loop in Blender in about two hours. The first review failed it on four counts; here are all six passes, and the 6 cm float a second reviewer caught that the builder couldn't see."
date: 2026-10-18
status: "shipped"
tags: ["claude-code", "opus-5-5", "blender", "animation", "agents", "characters"]
series: ["characters"]
preview:
  verdict: "Physics did the acting"
  takeaway: "Springs and a chain made the weight. Most of the craft was in reviewing: a second agent caught a 6 cm float the builder's eye had missed."
  points:
    - "One 1,869-line Python file builds and animates everything; 250 s of GPU rendering for 144 frames."
    - "Reviewer 1 failed pass 1 on weight, spin and cut, skid, and readability. Pass 6 got every line PASS."
    - "A check run on every solve found the scythe's haft passing through her head. She now slides her grip."
  image: "/media/previews/paper-jefrie.webp"
  loop: "/media/previews/paper-jefrie.mp4"
  alt: "Papercraft Jefrie standing on a sheet of paper with her spiked tail and red scythe, just before the tail lifts her"
---

Claude made a six-second loop of Jefrie, my scythe-carrying character, as a folded-paper figure
on a desk. Every piece of her was built by a Python script, every move came from a small physics
simulation, and Blender rendered it on my laptop in about two hours of wall clock, start to finish.

**Nothing in it is keyframed by hand: a spring swings the scythe and a weighted chain moves the
tail, and those two make her look light.** What took the time was review. The first critic failed
it on four lines, and the fixes that mattered most came from a second reviewer and from checks
that measured instead of looked.

<ao-frames fps="24" marks="24:Hang|54:Yank|66:Cut|84:Skid|131:Thump">
<video controls muted loop playsinline preload="metadata" poster="/media/paper-jefrie/paper_jefrie.webp" src="/media/paper-jefrie/paper_jefrie.mp4"></video>
<figcaption><b>Paper Jefrie, final (v3)</b><span class="ao-meta">16 Oct · Opus 5.5 in Claude Code, Blender 5.2 Cycles · 72 poses on twos, 144 frames at 24 fps · 720p web copy of the 1080² render</span></figcaption>
</ao-frames>

The tail lifts her off the paper like a marionette, she hangs limp, the tail flings her, the
scythe drags her through a full turn and cuts a paper crane, she lands and skids until the tail
plants, and then she settles and the tail tip thumps once before the loop starts again. That
order is her movement canon almost word for word: she's light, and the heavy tail and the heavy
scythe move her, not the other way round.

## Where it came from

On 26 September I saw [Kevin Ngo's post](https://x.com/kevin_t_ngo/status/2102761406315839798):
a GIF of simple paper characters on a desk, captioned as "animated in Python and rendered in
Blender" by Opus 5.5. He hasn't said what he prompted or how many tries it took. I asked Claude
to research whether others were doing the same and then write a prompt for trying it on Jefrie.

The prompt planned a cloud session that installs Blender from scratch. On 16 October I told it
to "follow the prompt" and do it here instead, so it ran on my laptop, where Blender 5.2 was
already installed and the GPU could render.

One thing changed straight away. The prompt said flat cut-paper pieces seen from above. Before
building, the agent went through Kevin's clip frame by frame and found something else: 3D
folded-paper box figures, filmed from a low three-quarter angle, in a 3.44-second loop. So Jefrie
became boxes and folded card, and her world, the iron-bar dome she lives at, became a pencil
sketch on the sheet behind her.

## One file, two places

`paper_jefrie.py` is 1,869 lines and does everything. Run under plain Python, it solves the
motion and draws a stick-figure sheet in about 10 seconds, so the choreography could be fixed
without opening Blender. Run inside Blender, it builds every mesh, material, light and key from
nothing and renders.

<ao-compare cols="2" aspect="3/2">
<figure><img src="/media/paper-jefrie/motion-01.webp" alt="A grid of 24 stick-figure poses of Jefrie, her scythe and tail, every quarter second" loading="lazy"><figcaption><b>Motion sheet 1</b><span class="ao-meta">16 Oct · plain Python, no Blender · framing too tight, the scythe flails in the hang</span></figcaption></figure>
<figure><img src="/media/paper-jefrie/motion-10.webp" alt="The same grid of 24 stick-figure poses later in the build: the tail arches over her and plants behind her" loading="lazy"><figcaption><b>Motion sheet 10</b><span class="ao-meta">16 Oct · 11 sheets in all · the tail now rises out of her back and plants</span></figcaption></figure>
</ao-compare>

The scythe is a damped spring chasing the pose her hands give it, so it lags, overshoots and
keeps swinging after she stops. This is the heart of it, from the script:

```python
w0 = 2 * math.pi * freq; k = w0 * w0; c = 2 * zeta * w0
self.V += (k * (Gt - self.G) - c * self.V) * dt
self.G += self.V * dt
e = mat_rotvec(Rt_ @ self.R.T)
self.W += (k * e - c * self.W) * dt
self.R = rotvec_mat(self.W * dt) @ self.R
```

The tail is a 14-point chain with gravity, collision with the paper and a target shape for each
phase of the move (rest, arch, coil, fling, drag, plant). Gravity is turned down to 55 cm/s²,
which the script calls "puppet gravity": a 9 cm figure falling at real gravity looks like a toy,
so it falls the way a person would. The crane's flight is solved backwards from the cut: the
script finds the pose where the blade is furthest to her front-right and flies the crane in to
arrive exactly there.

## Six passes

Each review pass was 24 stills, one every quarter second. The first went to a reviewer agent
told to act as an animation director, with Jefrie's canon to check against. In 12.5 minutes it
passed three things (the marionette hoist, the loop seam, her being fully covered), called four
weak and failed four: weight, the spin and cut, the skid and plant, and readability at GIF size.
The rest tail floated, the smear looked like a boat, the tail tip looked like a dragon's head,
and an ear dot read as a third eye. It called the marionette arch the best image and said to
protect it.

<ao-slider aspect="3/2" labels="Pass 1|Pass 6">
<img src="/media/paper-jefrie/pass-01.webp" alt="Contact sheet of pass 1: 24 frames of the loop, with the camera drifting and a grey tail floating off the paper">
<img src="/media/paper-jefrie/pass-06.webp" alt="Contact sheet of pass 6: the same 24 moments, a locked camera, the tail on the paper and red speed streaks on the swing">
<figcaption><b>Pass 1 against pass 6, same 24 moments</b><span class="ao-meta">16 Oct · 540 px, 48 samples, about 1 s a frame on the laptop GPU · pass 1 went to reviewer 1, pass 6 got reviewer 2's go</span></figcaption>
</ao-slider>

The second reviewer took 20 minutes on pass 3 and measured spacing from its own copy of the
solver. It said the tail tip that was supposed to be planted on the paper during the hang
floated about 5 cm above it. The builder measured it at **5.7 to 6.2 cm**, more than half her
height, and wrote in the build log that perspective had fooled it. The fix was to make the last few points of the chain stop
moving while the tail is planted, fading the pin in and out, so the tip now sits at 0.35 to 0.44
cm.

<figure><img src="/media/paper-jefrie/same-frame-every-pass.webp" alt="Six crops of the same hang frame across six passes; in the first five the tail tip hangs in the air, in the last it touches the paper" loading="lazy"><figcaption><b>Frame 25 at every pass</b><span class="ao-meta">the same moment of the hang, pass 1 to the final render</span></figcaption></figure>

An automated check added in the same pass found another problem nobody had flagged: in the hang
and the settle, the scythe's haft went through her head. The fix was a grip slide. When she
hangs limp, her hand slides down the haft to the ring at the end. After that, the checks ran on
every solve and reported 0 clips in 72 poses and her hand on the haft in every one. The second
reviewer's last round, 7 minutes on pass 6, passed every line.

<ao-slider aspect="1/1" labels="Clay and ink|Final">
<img src="/media/paper-jefrie/clay-f025.webp" alt="The hang frame in plain white clay with black ink outlines: the tail arches over her and the pencil-sketched dome sits behind">
<img src="/media/paper-jefrie/final-f025.webp" alt="The same hang frame in the final colour render: grey card, red blade and red tail underside">
<figcaption><b>The hang, frame 25</b><span class="ao-meta">clay pass with Freestyle ink lines, 3.3 s to render · final, 1080², 128 samples</span></figcaption>
</ao-slider>

## What it cost in time

| | Main loop | Grease Basket |
|---|---|---|
| Poses | 72, on twos (144 frames) | 60 (120 frames) |
| Final render | 250.0 s, 3.47 s a frame | 174.7 s, 2.91 s a frame |
| GIF at 720 px | 8.39 MB | 5.39 MB |
| MP4 1080p / 720p | 1.69 MB / 0.51 MB | 0.69 MB / 0.16 MB |

The whole build ran on the evening of 16 October, from 21:44 to 23:41, two reviewer agents included. The laptop's GPU is shared
between sessions through a queue, so rendering went in 25 short reservations, about 26 minutes of
GPU time. The first one waited 19 minutes behind another session's render.

With time left, it made a second loop on the same rig: Jefrie at her day job as a fast-food
cashier, head propped on one hand, with two breaths, a sigh, a slow blink and one tail slam. The
script reuses the first one wholesale. The polo and visor are the agent's design, not mine.

<video controls muted loop playsinline preload="metadata" poster="/media/paper-jefrie/grease_basket.webp" src="/media/paper-jefrie/grease_basket.mp4" style="width:100%;max-width:540px;border-radius:8px"></video>

## After

I said "This is good" the next day, and asked for the method to become a skill: very thin,
only what it needed to know to make another one. It's now a short page with the template
script, the commands and render times, the review loop, and the lessons that cost extra passes.

I've tried putting Jefrie in 3D before, with [six days of models](/ledger/jefrie-in-3d/) and
[AI rigging that lost to a script](/ledger/ai-rigging-vs-a-script/). This is the first time she
moved the way I describe her, and it came from the plainest tools in the set: springs, a chain
and numbers someone bothered to measure. **The fixes that mattered most came from measuring,
not looking.**
