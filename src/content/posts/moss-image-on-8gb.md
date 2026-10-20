---
id: "AO-060"
title: "A new image model went onto my 8 GB laptop overnight. Its long pictures hold up to 8:1, not 12:1"
summary: "I asked for MOSS-Image, a model released days earlier, to be installed next to Qwen-Image 2.1 while several other agents were busy on the same laptop. One Claude agent did it in two sittings, kept everything else working, and measured it: 30 to 39 seconds a picture, or about 7 with a speed LoRA, drawn boxes obeyed, and a panorama idea of mine that works at 8:1 and falls apart past it."
date: 2026-10-20
status: "shipped"
tags: ["claude-code", "opus-5-5", "comfyui", "agents", "prompting", "workflow"]
preview:
  verdict: "Installed, and 8:1 is the limit"
  takeaway: "One agent added MOSS-Image beside Qwen without breaking Qwen, H3 or the music model. Long strips hold at 8:1; at 12:1 the street starts repeating."
  points:
    - "Plain 1024² pictures took 30 to 39 s warm. The 8-step speed LoRA took 6.4 to 7.6 s and slipped one glyph on a sign."
    - "Five drawn boxes landed where they were drawn, and six names in a character grid were spelled right, first try."
    - "A 4096×512 strip, upscaled and redrawn in ten tiles to 8192×1024, took about 3 minutes and peaked at 7.9 GB."
  image: "/media/previews/moss-image-on-8gb.webp"
  loop: "/media/previews/moss-image-on-8gb.mp4"
  alt: "A slow pan along a painted street at dusk: a lantern-lit market with a crowd under its awnings"
---

At 22:46 on 19 October, in the middle of a session where agents were building the next episode
of my series, I asked for one more thing: get MOSS-Image SFT, an image model that had just come
out, running in my ComfyUI next to Qwen-Image 2.1.

**One Claude agent (Opus 5.5) did it by 00:21, in two sittings around the other agents' GPU
work, and the update it needed broke nothing that was already installed.** Its measurements are
below: a plain picture takes 30 to 39 seconds, about 7 with a speed LoRA, drawn layout boxes
are obeyed, and the long-picture idea I had for it works at 8:1 and fails past that.

This is one night's test, three prompts and two seeds. Nothing here puts MOSS against Qwen on
the same prompt; that test hasn't been run.

## What I asked for

My request, in my words: "It looks like you can generate images in crazy aspect ratios so you
can do things like ask it to make a really long image, and then cut that image into smaller
images and upscale and denoise them again with another model and then stitch them back together
and finally have a video of it scrolling down or across it at full screen size."

I also told it the model might need a ComfyUI update, "so pick when you ask this to happen
carefully". Several other agents were working on the same laptop and sharing its one 8 GB GPU.
A few minutes later I
added a speed LoRA I'd seen, an 8-step DMD distillation by lodestones, and asked for both to be
tested on the same prompts.

## How it went in

The agent split the job so it wouldn't touch the running ComfyUI.

- **First sitting, 22:47 to 22:57, no GPU.** It looked up what ComfyUI needed for the model, found that the
  release then current (0.42.1) lacked one fix it depends on, wrote
  an install plan, and downloaded 14.19 GB in about five minutes: the 5B model in int8
  (5.41 GB), a quantised Qwen3.5-9B text encoder (7.34 GB), a small FLUX.2 VAE (0.25 GB) and the
  LoRA (1.19 GB). The download took the C: drive to 24.1 GiB free, under my own 30 GB rule;
  another agent cleared space before the next step.
- **Second sitting, 23:33 to 00:21, with a 41-minute GPU reservation.** It tagged the current
  ComfyUI for rollback, ran a smoke test, updated from 0.37.0 to the development branch, and ran
  the smoke test again: Qwen-Image 2.1 gave a pixel-identical picture, and the video model
  (MiniMax-H3), the segmenter (SAM 3.1) and the music model (YuE2) all ran at the same speed.
  Then it built five workflows and the test renders shown here.

The agent made 141 requests and moved 38.4 million tokens, nearly all of them re-reading its own
context. MOSS is Apache-2.0, which Qwen-Image 2.1 is not, so its pictures could be used
commercially; this site sells nothing, but it's why I'd keep it even if Qwen stays better.

## Plain against the speed LoRA

Same prompt, same seed, 1024×1024. Plain is 25 steps; the LoRA version is 8 steps at strength
0.7. The seconds are from ComfyUI with the model already loaded.

<ao-matrix cols="Plain · seed 101|8-step · seed 101|Plain · seed 202|8-step · seed 202" aspect="1/1">
<div data-row="Photo prose|a night kitchen, watermelon, hammer, steam, rain"><figure><img src="/media/moss-image-on-8gb/plain-photo-101.webp" alt="Night kitchen photo: a watermelon, a mug and a claw hammer on a wooden table under a pendant lamp" loading="lazy"><figcaption><b>30.3 s</b><span class="ao-meta">25 steps · CFG 2.5</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-photo-101.webp" alt="The same kitchen with the 8-step LoRA: flatter light, same objects" loading="lazy"><figcaption><b>6.9 s</b><span class="ao-meta">8 steps · CFG 1</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/plain-photo-202.webp" alt="Second seed of the kitchen: watermelon, mug and hammer under the lamp" loading="lazy"><figcaption><b>33.3 s</b><span class="ao-meta">25 steps · CFG 2.5</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-photo-202.webp" alt="Second seed with the 8-step LoRA" loading="lazy"><figcaption><b>7.0 s</b><span class="ao-meta">8 steps · CFG 1</span></figcaption></figure></div>
<div data-row="Anime tags|Danbooru-style tag list"><figure><img src="/media/moss-image-on-8gb/plain-anime-101.webp" alt="Anime girl in a yellow raincoat and red scarf with an umbrella on a neon street" loading="lazy"><figcaption><b>38.1 s</b><span class="ao-meta">25 steps · CFG 2.5</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-anime-101.webp" alt="The same tags with the 8-step LoRA" loading="lazy"><figcaption><b>7.2 s</b><span class="ao-meta">8 steps · CFG 1</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/plain-anime-202.webp" alt="Second seed: the girl in the raincoat under a yellow umbrella" loading="lazy"><figcaption><b>35.7 s</b><span class="ao-meta">25 steps · CFG 2.5</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-anime-202.webp" alt="Second seed with the 8-step LoRA" loading="lazy"><figcaption><b>7.3 s</b><span class="ao-meta">8 steps · CFG 1</span></figcaption></figure></div>
<div data-row="Sign text|“OPEN UNTIL THE LAST TRAIN”, “no reservations”"><figure><img src="/media/moss-image-on-8gb/plain-text-101.webp" alt="A wooden ramen-shop sign reading OPEN UNTIL THE LAST TRAIN, no reservations" loading="lazy"><figcaption><b>38.7 s</b><span class="ao-meta">both lines spelled right</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-text-101.webp" alt="The sign with the 8-step LoRA, both lines spelled right" loading="lazy"><figcaption><b>7.4 s</b><span class="ao-meta">both lines spelled right</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/plain-text-202.webp" alt="Second seed: a red sign reading OPEN UNTIL THE LAST TRAIN, no reservations" loading="lazy"><figcaption><b>38.9 s</b><span class="ao-meta">both lines spelled right</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-text-202.webp" alt="Second seed with the 8-step LoRA: a stray drawn figure beside the word THE" loading="lazy"><figcaption><b>7.6 s</b><span class="ao-meta">a stray glyph beside “THE”</span></figcaption></figure></div>
<figcaption><b>MOSS-Image SFT, plain and with the 8-step DMD LoRA</b><span class="ao-meta">20 Oct 2026 · laptop RTX 4070 8 GB · int8 model, peak 6.0 to 7.1 GB · warm times from ComfyUI; the first plain run after launch took 44.7 s</span></figcaption>
</ao-matrix>

The LoRA is about five times faster. The agent's note on the difference was a little flatter
light and less fine texture, and the one slip is in the last cell. It also ran the official
default (50 steps, CFG 3): 76.2 seconds, and it couldn't see a difference, so the workflow stays
at 25. With the LoRA set to strength 0 the picture came out hazy, which is how it checked the
LoRA was doing anything at all.

## Boxes and grids

MOSS takes a layout as well as a sentence: a JSON list of boxes, each with what goes in it, and
it draws each thing inside its box. The left side of each slider is the layout as drawn, the
right side what came back.

<ao-slider aspect="1/1" labels="The boxes|What came back">
<img src="/media/moss-image-on-8gb/layout-boxes.webp" alt="Five labelled boxes on a dark canvas: title text, a CRT TV, a cat on top of it, a fern, and a time slot">
<img src="/media/moss-image-on-8gb/layout.webp" alt="A cream retro poster: I LOVE MY EVENING TELEVISION, a CRT TV with a sleeping cat on top, a potted fern, TONIGHT 8:00 PM">
<figcaption><b>Five boxes, one poster, 40.8 s</b><span class="ao-meta">MOSS-Image SFT plain · 1024×1024 · the cat's box overlaps the TV's, and it sat on the TV</span></figcaption>
</ao-slider>

<ao-slider aspect="3/2" labels="The boxes|What came back">
<img src="/media/moss-image-on-8gb/grid-boxes.webp" alt="A three by two grid of boxes, each with a character description and a name caption box">
<img src="/media/moss-image-on-8gb/grid.webp" alt="Six characters in one style: a mail carrier, a lighthouse keeper, a radio robot, a magician, a night nurse and an astronaut, each named underneath">
<figcaption><b>A 3×2 character grid, 65.9 s</b><span class="ao-meta">MOSS-Image SFT plain · 1536×1024 · six names spelled right · each character described in its own box, not the overall caption</span></figcaption>
</ao-slider>

That second one is the part I'd use most. Six different characters in one consistent style, one
per cell, named correctly, is a lineup sheet in a single render, and the agent's note says the
trick was describing each character only inside its own box.

## The long picture

Here is my idea, built. The prompt asked for one street read left to right: night market, tram
stop with a girl in a yellow raincoat, bookshop, canal bridge, hillside under the first stars.
The model drew it as one 4096×512 strip, which was upscaled to 8192×1024, cut into ten
overlapping 1024×1024 tiles, each redrawn lightly with the speed LoRA, and stitched back with
feathered edges. Drag it, or press Glide.

It is one street with no visible seams. It is not quite the street I asked for: this seed put the
girl's tram stop at the far right end, after the bridge, and the hillside is houses rather than
open ground. The two test strips further down kept the order.

<ao-pan height="380" views="Finished, 8192×1024|Raw strip, 4096×512" stops="0.27:Market|0.4:Tram|0.55:Bookshop|0.72:Canal bridge|0.91:Tram stop">
<img src="/media/moss-image-on-8gb/pano-refined.webp" alt="A painted street at dusk, 8:1: a lantern-lit market with a crowd, a tram, a lit bookshop, a canal bridge under a crescent moon, and a tram shelter where a girl in a yellow raincoat waits">
<img src="/media/moss-image-on-8gb/pano-raw.webp" alt="The same street as the raw 4096 by 512 strip, before upscaling and tile refinement">
<figcaption><b>One street, 8:1, about 3 minutes</b><span class="ao-meta">MOSS-Image SFT plain, seed 21, 82 to 86 s for the strip · 4x-UltraSharp upscale · ten tiles re-denoised at 0.35 with the 8-step LoRA · 170 to 217 s in all · peak 7.9 GB, the most of any workflow on this laptop</span></figcaption>
</ao-pan>

The scroll video I asked for is a script that pans across the finished picture with ffmpeg on
the CPU: 30 seconds of 1080p in about 30 seconds. This copy is cut down to 720p.

<video controls muted loop playsinline preload="metadata" poster="/media/moss-image-on-8gb/scroll-poster.webp" src="/media/moss-image-on-8gb/scroll.mp4"></video>

Then it tried to go longer, and this is where it stops working. **At 12:1 the street starts
repeating the same storefronts, and at 4.7 megapixels it goes muddy.** Switch between the strips
below; the frame stays at the same point of the street.

<ao-pan height="300" views="8:1 · 4096×512|8:1 · scaled RoPE|12:1 · 6144×512|8:1 · 6144×768" stops="0.42:Tram stop|0.78:Canal bridge">
<img src="/media/moss-image-on-8gb/strip-4096.webp" alt="The 4096 by 512 strip without position scaling: market, tram stop, bookshop, bridge, hillside">
<img src="/media/moss-image-on-8gb/strip-4096-rope2.webp" alt="The 4096 by 512 strip with ScaleROPE x2: the same five places, a little more continuous">
<img src="/media/moss-image-on-8gb/strip-6144x512.webp" alt="The 6144 by 512 strip: rows of near-identical bookshop fronts repeat along the street">
<img src="/media/moss-image-on-8gb/strip-6144x768.webp" alt="The 6144 by 768 strip, shown here scaled to 4096 wide: a flat, murky row of repeated facades">
<figcaption><b>Four raw strips, same prompt and seed</b><span class="ao-meta">MOSS-Image SFT plain, 25 steps · 82.4 s, 86.3 s, 128.2 s, 252.8 s (7.45 GB) · the last is scaled to 4096×512 for this page</span></figcaption>
</ao-pan>

The agent's rule from this, now in my ComfyUI notes: stay near 8:1 and about 2 megapixels, write
the prompt as a left-to-right list of places, and for anything longer stitch several 8:1 strips
instead of asking for one long one.

## What's still open

Whether MOSS replaces Qwen-Image 2.1 is the question I started with, and this night doesn't answer
it. What it shows is narrower: the model fits on an 8 GB card beside everything else, the speed
LoRA makes it cheap enough to draft with, and boxes give me a kind of control I didn't have.
By morning the agents building the episode had already used it for dozens of stills.

**The thing worth copying is the split, not the model.** The agent did everything that didn't
need the GPU first, waited for a gap, and proved the old models still worked before calling the
new one installed. That's why I could ask for it in the middle of someone else's render night.
