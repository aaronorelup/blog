---
id: "AO-060"
title: "Trying a brand-new AI image model on my 8 GB laptop"
summary: "A Claude agent installed MOSS-Image, an AI image model released days earlier, beside my other models without breaking them. How fast it is, whether it follows a drawn layout, and how wide a panorama it can make."
date: 2026-10-20
topic: "art"
project: []
preview:
  verdict: "Works on 8 GB, 8:1 max"
  takeaway: "One agent added MOSS-Image to my 8 GB laptop without breaking my other models. A picture takes 30 to 39 seconds, and panoramas hold up at 8:1 but repeat at 12:1."
  points:
    - "An 8-step speed add-on (a LoRA) cut a picture to about 7 seconds, with flatter light and one stray mark on a sign."
    - "It followed drawn layout boxes, including six characters in a 3x2 grid with all six names spelled right."
    - "The agent did the downloads with no GPU, then used a 41-minute GPU slot and proved my old models still worked the same."
  image: "/media/previews/moss-image-on-8gb.webp"
  loop: "/media/previews/moss-image-on-8gb.mp4"
  alt: "A slow pan along a painted street at dusk: a lantern-lit market with a crowd under its awnings"
---

I asked Claude to put MOSS-Image, an AI image model that had just come out, on my laptop. Other
agents were on the same laptop that night, making [Episode 3](/ledger/context-window/) of
[my AI-made TV series](/courses/i-love-my-evening-television/). **One agent fit it in around
them, and nothing I already had broke.** With a speed add-on it's fast enough to draft with on an
8 GB graphics card. It follows boxes you draw, and its panoramas work up to 8 times wider than
tall. It was one night and three prompts, and I haven't put it up against my main image model yet.

- **A picture takes 30 to 39 seconds, or about 7 with a speed add-on.** That's a LoRA, a small
  file that changes how a model draws. The light gets flatter and one sign got a stray mark.
- **It draws things inside the boxes you give it.** Six characters in a 3 by 2 grid came back
  with all six names spelled right.
- **Long pictures hold up at 8:1.** A street 8 times wider than tall showed no seams. At 12:1 the
  shops repeat.
- **The agent did the downloads first, without touching the graphics card.** Then it waited for a
  41-minute gap on the card and proved my old models still worked the same. That split is the
  part I'd copy.

## Plain against the speed add-on

Each row is a prompt and each pair of columns a seed, the random number a picture starts from.
Plain mode draws in 25 passes, called steps, and the add-on in 8.

<ao-matrix cols="Plain · seed 101|8-step · seed 101|Plain · seed 202|8-step · seed 202" aspect="1/1">
<div data-row="Photo prose|a night kitchen, watermelon, hammer, steam, rain"><figure><img src="/media/moss-image-on-8gb/plain-photo-101.webp" alt="Night kitchen photo: a watermelon, a mug and a claw hammer on a wooden table under a pendant lamp" loading="lazy"><figcaption><b>30.3 s</b><span class="ao-meta">25 steps</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-photo-101.webp" alt="The same kitchen with the 8-step LoRA: flatter light, same objects" loading="lazy"><figcaption><b>6.9 s</b><span class="ao-meta">8 steps</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/plain-photo-202.webp" alt="Second seed of the kitchen: watermelon, mug and hammer under the lamp" loading="lazy"><figcaption><b>33.3 s</b><span class="ao-meta">25 steps</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-photo-202.webp" alt="Second seed with the 8-step LoRA" loading="lazy"><figcaption><b>7.0 s</b><span class="ao-meta">8 steps</span></figcaption></figure></div>
<div data-row="Anime tags|Danbooru-style tag list"><figure><img src="/media/moss-image-on-8gb/plain-anime-101.webp" alt="Anime girl in a yellow raincoat and red scarf with an umbrella on a neon street" loading="lazy"><figcaption><b>38.1 s</b><span class="ao-meta">25 steps</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-anime-101.webp" alt="The same tags with the 8-step LoRA" loading="lazy"><figcaption><b>7.2 s</b><span class="ao-meta">8 steps</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/plain-anime-202.webp" alt="Second seed: the girl in the raincoat under a yellow umbrella" loading="lazy"><figcaption><b>35.7 s</b><span class="ao-meta">25 steps</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-anime-202.webp" alt="Second seed with the 8-step LoRA" loading="lazy"><figcaption><b>7.3 s</b><span class="ao-meta">8 steps</span></figcaption></figure></div>
<div data-row="Sign text|“OPEN UNTIL THE LAST TRAIN”, “no reservations”"><figure><img src="/media/moss-image-on-8gb/plain-text-101.webp" alt="A wooden ramen-shop sign reading OPEN UNTIL THE LAST TRAIN, no reservations" loading="lazy"><figcaption><b>38.7 s</b><span class="ao-meta">both lines spelled right</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-text-101.webp" alt="The sign with the 8-step LoRA, both lines spelled right" loading="lazy"><figcaption><b>7.4 s</b><span class="ao-meta">both lines spelled right</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/plain-text-202.webp" alt="Second seed: a red sign reading OPEN UNTIL THE LAST TRAIN, no reservations" loading="lazy"><figcaption><b>38.9 s</b><span class="ao-meta">both lines spelled right</span></figcaption></figure><figure><img src="/media/moss-image-on-8gb/dmd-text-202.webp" alt="Second seed with the 8-step LoRA: a stray drawn figure beside the word THE" loading="lazy"><figcaption><b>7.6 s</b><span class="ao-meta">a stray mark beside "THE"</span></figcaption></figure></div>
<figcaption><b>MOSS-Image, plain and with the 8-step add-on</b><span class="ao-meta">20 Oct 2026 · my laptop's RTX 4070, 8 GB · 1024×1024 · times with the model already loaded, and the first run after launch took 44.7 s · peak memory 6.0 to 7.1 GB · the official default of 50 steps took 76.2 s and looked no better · with the add-on turned down to zero the picture came out hazy, so the add-on really is doing the work</span></figcaption>
</ao-matrix>

The add-on is about five times faster, with a little flatter light and less fine texture. Its one slip is
the stray figure beside THE in the last cell.

## It follows a drawn layout

MOSS can also take a list of boxes, each saying what goes in it. The left of each slider is the
layout and the right is what came back.

<ao-slider aspect="1/1" labels="The boxes|What came back">
<img src="/media/moss-image-on-8gb/layout-boxes.webp" alt="Five labelled boxes on a dark canvas: title text, a CRT TV, a cat on top of it, a fern, and a time slot">
<img src="/media/moss-image-on-8gb/layout.webp" alt="A cream retro poster: I LOVE MY EVENING TELEVISION, a CRT TV with a sleeping cat on top, a potted fern, TONIGHT 8:00 PM">
<figcaption><b>Five boxes, one poster, 40.8 s</b><span class="ao-meta">plain mode · 1024×1024 · the cat's box overlaps the TV's, and the cat sat on the TV</span></figcaption>
</ao-slider>

<ao-slider aspect="3/2" labels="The boxes|What came back">
<img src="/media/moss-image-on-8gb/grid-boxes.webp" alt="A three by two grid of boxes, each with a character description and a name caption box">
<img src="/media/moss-image-on-8gb/grid.webp" alt="Six characters in one style: a mail carrier, a lighthouse keeper, a radio robot, a magician, a night nurse and an astronaut, each named underneath">
<figcaption><b>A 3×2 character grid, 65.9 s</b><span class="ao-meta">plain mode · 1536×1024 · six names spelled right, first try</span></figcaption>
</ao-slider>

The grid is the one I'd use most. It's a character lineup sheet in one render. The agent's note
says the trick was describing each character only inside its own box.

## One street, 8 times wider than tall

My idea was one really long picture, cut into pieces, enlarged and redrawn, then stitched back
and scrolled across at full screen. The prompt listed one street left to right, from a night
market past a tram stop, a bookshop and a canal bridge to a hillside. MOSS drew it 4096 by 512
pixels. The agent doubled its size, had MOSS lightly redraw ten overlapping squares and blended
them back. Drag along it or press Glide.

<ao-pan height="380" views="Finished, 8192×1024|Raw strip, 4096×512" stops="0.27:Market|0.4:Tram|0.55:Bookshop|0.72:Canal bridge|0.91:Tram stop">
<img src="/media/moss-image-on-8gb/pano-refined.webp" alt="A painted street at dusk, 8:1: a lantern-lit market with a crowd, a tram, a lit bookshop, a canal bridge under a crescent moon, and a tram shelter where a girl in a yellow raincoat waits">
<img src="/media/moss-image-on-8gb/pano-raw.webp" alt="The same street as the raw 4096 by 512 strip, before upscaling and tile refinement">
<figcaption><b>One street, 8:1, about 3 minutes</b><span class="ao-meta">plain mode, seed 21 · the strip took 82 to 86 s and the whole job 170 to 217 s · enlarged with an upscaler model, 4x-UltraSharp · ten overlapping squares lightly redrawn with the 8-step add-on and blended at soft edges · peak memory 7.9 GB, the most of any job on this laptop</span></figcaption>
</ao-pan>

No seams show, but the order slipped. This seed put the tram stop at the far right, after the
bridge, and the hillside came out as houses.

The scroll video is a script panning across the finished picture with ffmpeg, a free video
tool. It made 30 seconds of 1080p in about 30 seconds without the graphics card. This copy is
720p.

<video controls muted loop playsinline preload="metadata" poster="/media/moss-image-on-8gb/scroll-poster.webp" src="/media/moss-image-on-8gb/scroll.mp4"></video>

## Where long pictures fall apart

**At 12:1 the street repeats the same shopfronts, and at 4.7 million pixels it goes muddy.** The
frame stays put when you switch strips.

<ao-pan height="300" views="8:1 · 4096×512|8:1 · scaled RoPE|12:1 · 6144×512|8:1 · 6144×768" stops="0.42:Tram stop|0.78:Canal bridge">
<img src="/media/moss-image-on-8gb/strip-4096.webp" alt="The 4096 by 512 strip without position scaling: market, tram stop, bookshop, bridge, hillside">
<img src="/media/moss-image-on-8gb/strip-4096-rope2.webp" alt="The 4096 by 512 strip with ScaleROPE x2: the same five places, a little more continuous">
<img src="/media/moss-image-on-8gb/strip-6144x512.webp" alt="The 6144 by 512 strip: rows of near-identical bookshop fronts repeat along the street">
<img src="/media/moss-image-on-8gb/strip-6144x768.webp" alt="The 6144 by 768 strip, shown here scaled to 4096 wide: a flat, murky row of repeated facades">
<figcaption><b>Four raw strips, same prompt and seed</b><span class="ao-meta">plain mode, 25 steps · 82.4 s, 86.3 s, 128.2 s and 252.8 s, the last peaking at 7.45 GB · scaled RoPE changes how the model counts positions across the picture so a long canvas reads as shorter, and it came out a little more continuous · the two 4096-wide strips kept the street in order · the last strip is shrunk to 4096×512 for this page</span></figcaption>
</ao-pan>

The agent's rule, now in my image notes, is to stay near 8:1 and 2 million pixels, list the
places left to right, and stitch 8:1 strips for anything longer.

## How it went in without breaking anything

MOSS needed an update to ComfyUI, the app my AI models run in, on a night the graphics card was
busy. I'd told the agent to "pick when you ask this to happen carefully." After the update my main
image model gave a pixel-identical picture, and my video, cut-out and music models ran at the same
speed.

<details><summary>The install, step by step</summary>

- **First sitting, about 10 minutes, no graphics card.** It looked up what ComfyUI needed and
  found that the newest release then (0.42.1) lacked one fix MOSS depends on. So the plan was to
  move to ComfyUI's development branch, its newest unreleased code.
- It downloaded 14.19 GB in about five minutes. The model itself was 5.41 GB, 5 billion
  parameters stored as 8-bit numbers (int8). The part that reads the prompt, a compressed
  Qwen3.5-9B text encoder, was 7.34 GB. A small FLUX.2 VAE, the part that turns the result into
  pixels, was 0.25 GB. The speed LoRA, an 8-step DMD distillation by lodestones, was 1.19 GB.
- That left the laptop's main drive at 24.1 GiB free, under my own 30 GB rule. Another agent
  cleared space before the next step.
- **Second sitting, 48 minutes, with a 41-minute booking on the graphics card.** It tagged the
  current ComfyUI so it could roll back, ran a smoke test (a short set of test renders), updated
  from 0.37.0 to the development branch, and ran the smoke test again.
- Qwen-Image 2.1 gave a pixel-identical picture. The video model (MiniMax-H3), the cut-out model
  (SAM 3.1) and the music model (YuE2) all ran at the same speed.
- Then it built five MOSS workflows, which are saved ComfyUI setups, and made every test picture
  on this page.
- **Settings.** Plain mode is 25 steps at CFG 2.5, where CFG is how strictly it follows the prompt.
  The add-on runs 8 steps at strength 0.7 and CFG 1. The official default is 50 steps at CFG 3.

</details>

## What's still open

Whether MOSS should replace Qwen-Image 2.1, the model that
[wins my daily picture test](/ledger/daily-candy/), is still open. MOSS's license (Apache-2.0)
allows commercial use and Qwen-Image 2.1's doesn't. This site sells nothing, but I'd keep MOSS for that even
if Qwen stays better.

By morning the Episode 3 agents had made dozens of stills with it. MOSS also made the 16,288-pixel
panorama that scrolls across the screen near the end of [the episode](/ledger/context-window/).
