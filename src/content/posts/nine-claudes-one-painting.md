---
id: "AO-044"
title: "Three Claude models paint the same picture in simulated oil"
summary: "I gave Claude Haiku, Sonnet and Opus, each at three effort levels, an oil-paint simulator and one AI image of my characters. How close each got, how differently they painted, and which ones I liked."
date: 2026-10-11
status: "shipped"
tags: ["claude-code", "opus-5-5", "sonnet-5-5", "haiku-5-5", "oil-paint", "simulation", "art"]
series: ["oil-paint", "characters"]
topic: "art"
project: ["oil-paint", "characters"]
preview:
  verdict: "Closer, but less creative"
  takeaway: "Checking every stroke against the picture got closest but copied its flaws, and the first tries, painted by eye, felt more like art."
  points:
    - "Opus medium's second try laid about 900,000 strokes, each only where the canvas still differed from the picture."
    - "Most ran one brush size per pass over the whole canvas. Opus max broke that at the end with brushes for the faces."
    - "Haiku painted by eye even at max effort, about 86 simulated hours of brushwork, and ended least like the picture."
  image: "/media/previews/nine-claudes-one-painting.webp"
  alt: "Opus medium's first try: a naive oil painting of BloodTailor from behind and Jefrie with a round grinning face, riding a serpent of round scales"
---

I gave nine Claude sessions the same AI image of my characters Jefrie and BloodTailor, plus an
oil-paint simulator where every mark is a simulated brushstroke and there's no undo. That's
Haiku, Sonnet and Opus 5.5, Anthropic's small, middle and biggest models. Each ran at low, medium
and max effort, a setting for how much work the model puts in. The message was just "paint this
image".

**The ones that measured their strokes against the picture got closest, and they copied its
flaws along with it.** My two favorites are Opus medium's first try, painted by eye, and Opus
max's final.

<img src="/media/nine-claudes-one-painting/reference.webp" alt="The reference: BloodTailor, masked and grinning in a red cape, and Jefrie in a silver half-mask holding her scythe, both riding a huge dark serpent through a glowing golden ruin full of cages, chains and jewels" style="width:100%;border-radius:8px">

ChatGPT made the picture, and it has a lot wrong with it. It's really crunchy and noisy all
over. I picked it anyway for the pose, the proportions and the colors. The two of them also star
in [my fighting game](/ledger/storm-bell-fighter/).

What came out of it:

- **Haiku painted by eye every time.** Even at max effort it never measured, and it ended least
  like the picture.
- **Sonnet and Opus measured, and copied the mistakes.** All six of their finals were steered by
  the picture, and ChatGPT's crunch and noise survived the trip into oil.
- **Almost all of them painted like a printing press.** One brush size per pass over the whole
  canvas. Opus max broke that at the end with its own brushes for the faces.

The nine finals. Click one to zoom in. In the captions, a chunk is one piece of painting code
sent to the simulator.

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/nine-claudes-one-painting/hl-2.webp" alt="Haiku low, second version: a dark ground, a pale shirt block, a red oval cape and a long dark band for the serpent" loading="lazy"><figcaption><b>Haiku · low</b><span class="ao-meta">v2 · 8 chunks · painted by eye</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/hm-2.webp" alt="Haiku medium, second version: yellow glow, a pale-shirted figure with a grey mask, a red cape, a striped serpent band and gold rings" loading="lazy"><figcaption><b>Haiku · medium</b><span class="ao-meta">v2 · 12 chunks · painted by eye</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/hmax-final.webp" alt="Haiku max: a flat, poster-like scene with a swirl, a white-shirted figure, a serpent of diamond scales, round jewels and gold coins" loading="lazy"><figcaption><b>Haiku · max</b><span class="ao-meta">67 chunks · about 86 hours of brush time · painted by eye</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/sl-final.webp" alt="Sonnet low, final: a close likeness of the reference built from small square dabs" loading="lazy"><figcaption><b>Sonnet · low</b><span class="ao-meta">third version · 7 chunks · from the picture</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/sm-final.webp" alt="Sonnet medium, final: a soft mosaic of paint dabs that reads as the reference" loading="lazy"><figcaption><b>Sonnet · medium</b><span class="ao-meta">v2 · 114 chunks · from the picture</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/smax-final.webp" alt="Sonnet max: a close, painterly likeness of the reference with deep reds" loading="lazy"><figcaption><b>Sonnet · max</b><span class="ao-meta">44 chunks · about 400,000 strokes · from the picture</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/ol-2.webp" alt="Opus low, second version: a close likeness, more orange than the reference" loading="lazy"><figcaption><b>Opus · low</b><span class="ao-meta">v2 · 4 layers · 29 mixes · from the picture</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/om-2.webp" alt="Opus medium, second version: a close, varnished likeness of the reference" loading="lazy"><figcaption><b>Opus · medium</b><span class="ao-meta">v2 · about 900,000 strokes · from the picture</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/omax-final.webp" alt="Opus max: the closest likeness, with deep crimson reds" loading="lazy"><figcaption><b>Opus · max</b><span class="ao-meta">496,624 strokes in 11 stages · from the picture</span></figcaption></figure>
</ao-compare>

## How I set it up

Each was a cloud session of Claude Code, Anthropic's agent that works on a computer by itself.
Each got a link to alice's [Claude Paint](https://github.com/aliceisjustplaying/claude-paint),
the simulator from
[Claude painted three oil paintings](/ledger/claude-paints-in-oil/), plus the image and "paint
this image". Paint dries on a clock, colors come only from mixing real historical pigments, and
the model paints by writing short scripts.

I didn't install anything. Each session cloned the repo, built the simulator itself and started
painting.

Five of the nine, every low and medium session except Sonnet low, then got one more message:
"keep working on it and making it better. Put in 10x the effort this time."

## The first tries, painted by eye

Every first try from the low and medium sessions looked at the picture and painted shapes where
things are. A dark ground, a glow, an oval for a head. Nobody measured anything. This is my
favorite image of the whole experiment, Opus medium's first try:

<img src="/media/nine-claudes-one-painting/om-1.webp" alt="Opus medium's first try: a naive oil painting of the scene. BloodTailor seen from behind with a big silver head and a white shirt, Jefrie as a round pale face with red ringed eyes and a wide grin, a serpent of round dark scales with a red belly, a red spiral, and gold lumps for treasure" style="width:100%;border-radius:8px">

It honestly feels like art to me, like what a student paints in their first month of oil. The
serpent became rows of round scales because scales are round, the treasure became lumps, and
Jefrie became a round face with a big grin. It changed the picture instead of copying it, and
you can read every one of those decisions.

The other first tries:

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/nine-claudes-one-painting/hl-1.webp" alt="Haiku low's first try: a pale shirt block, a red puff, a dark diagonal serpent band and gold blobs in the corners on a dark ground" loading="lazy"><figcaption><b>Haiku · low · v1</b><span class="ao-meta">4 chunks, 14-50 s of compute each</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/hm-1.webp" alt="Haiku medium's first try: a yellow glow, a pink-shirted figure with a blue-grey mask, a red cape, a striped serpent band and rings" loading="lazy"><figcaption><b>Haiku · medium · v1</b><span class="ao-meta">6 chunks · "the faces are placeholders"</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/hmax-early.webp" alt="Haiku max part way: a red swirl, a white-shirted figure with a big dark hat of hair, a dark serpent mass and gold coins" loading="lazy"><figcaption><b>Haiku · max · part way</b><span class="ao-meta">an early save, about chunk 11 of 67</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/sl-1.webp" alt="Sonnet low's first try: an orange ground, a huge dark serpent oval with chevron scales and a pink cape across it" loading="lazy"><figcaption><b>Sonnet · low · v1</b><span class="ao-meta">"a crude likeness"</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/sm-1.webp" alt="Sonnet medium's first try: a yellow ground, a figure with a black round head and a grille of teeth, a red cape and a dark scaled serpent oval" loading="lazy"><figcaption><b>Sonnet · medium · v1</b><span class="ao-meta">8 chunks · polygons and ellipses</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/ol-1.webp" alt="Opus low's first try: an orange ground, a white blocky figure with a grey round head, a red cape sweeping right, a dark serpent coil" loading="lazy"><figcaption><b>Opus · low · v1</b><span class="ao-meta">"a loose, crude sketch"</span></figcaption></figure>
</ao-compare>

Haiku never left this mode. Even at max effort, with about 86 hours of simulated brushwork, it
painted by eye the whole way. Its final looks most like a painting someone decided on, with
diamond-tiled scales, jewels as glossy balls and a swirl like a target.

## The second tries measured everything

With ten times the effort, almost everything changed. Opus low put it plainly: "I'll
calibrate how each paint mix appears on canvas, then match regions of the reference image to the
closest mix." Every Sonnet and Opus session ended up working that way, and Sonnet low, Sonnet max
and Opus max did it without being asked.

Opus medium went furthest. About 900,000 strokes, each one placed only where the canvas still
differed from the picture. It got the average color error, how far its colors sat from the
picture's, down to about 5.9. On that scale 2 or 3 is a difference you can only just see.

That's why these look so much like the reference. It's also why they're less creative. They
copied the crunch, the noise and the treasure pile that never turns into objects.

<details><summary>The measuring recipe, step by step</summary>

1. **Paint a color chart first.** Mix test patches from the tubes and measure what each one
   really looks like on the canvas. Opus low made 160 and Opus medium about 540. Opus max wrote
   its own model of how the simulator mixes pigment and checked it against 40 swatches.
2. **Match the picture to real paint.** Opus low grouped the picture's colors and found 29 mixes
   for them, at an average color error of about 8. Sonnet medium found, for every cell, the pair
   of mixes whose blend came closest.
3. **Follow the edges.** Work out which way the edges run in the picture so the strokes follow
   them.
4. **Coarse to fine, drying in between.** Big brushes for the masses, let it dry, smaller
   brushes, let it dry, all the way down to the highlights.

Opus medium's brushes went from 10 canvas units wide down to 0.4, and it re-measured before every
layer. With all the drying waits added up, that's about 61 years of simulated painting time.

</details>

## How differently they painted

**Sonnet low** never got a second message and still made three versions, starting over twice.
The third laid paint as a grid of small square dabs, so up close it reads almost like pixel art.
Its stages, and the replay it made when I asked:

<ao-compare cols="3" aspect="16/9">
<figure><img src="/media/nine-claudes-one-painting/sl-stage-1.webp" alt="Sonnet low, first stage: soft blobs of red, orange and dark brown in roughly the right places" loading="lazy"><figcaption><b>Stage 1</b><span class="ao-meta">Sonnet low · masses</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/sl-stage-2.webp" alt="Sonnet low, second stage: the figures and the serpent readable in blocky dabs" loading="lazy"><figcaption><b>Stage 2</b><span class="ao-meta">Sonnet low</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/sl-stage-3.webp" alt="Sonnet low, third stage: close to the final, detail in small square dabs" loading="lazy"><figcaption><b>Stage 3</b><span class="ao-meta">Sonnet low</span></figcaption></figure>
</ao-compare>

<video controls muted playsinline preload="metadata" poster="/media/nine-claudes-one-painting/sl-final.webp" src="/media/nine-claudes-one-painting/sl-timelapse.mp4" style="width:100%;border-radius:8px"></video>

**Sonnet medium** made the most beautiful middle stage. Its base layer mixed 25 piles of paint
per brushload into a soft, muddy smear. Once that dried, it laid smaller, mostly single-color
strokes on top, and I'd happily stop there:

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/nine-claudes-one-painting/sm-stage-1.webp" alt="Sonnet medium's muddy underpainting: soft smeared reds, golds and blues with no clear forms" loading="lazy"><figcaption><b>The muddy underlayer</b><span class="ao-meta">25 piles per brushload</span></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/sm-stage-2.webp" alt="Sonnet medium's mid-scale pass: bold strokes of red, black and cream; the figures, cape and serpent are clear, with no fine detail" loading="lazy"><figcaption><b>The mid-scale pass</b><span class="ao-meta">smaller, mostly single-color strokes over the dried layer</span></figcaption></figure>
</ao-compare>

**Haiku max** painted over the whole serpent. About 50 seconds into its time-lapse, after hours
of tiling it with diamond scales, it covers all of it in flat dark green and starts again. That's
exactly what people do. It's also the only time-lapse with a clock, and I wish they all had one.
The replay skips the drying, roughly 300 simulated days of it.

<video controls muted playsinline preload="metadata" poster="/media/nine-claudes-one-painting/hmax-final.webp" src="/media/nine-claudes-one-painting/hmax-timelapse.mp4" style="width:100%;border-radius:8px"></video>

<details><summary>More from each session</summary>

**Sonnet medium** went on to 114 chunks, with each color region painted through its own mask and
a finer pass on the two faces, the scythe head, the swirl and the shirt. Some chunks hit the
simulator's 10-minute limit and were lost, so it split the work smaller. It called the result "a
coarse mosaic of paint dabs", which is fair.

**Sonnet max** found a note in the repo before it started. It warned against copying a photo's
colors pixel by pixel, the "digital look" the simulator exists to avoid. So it said it would work
like a human copyist instead, reading positions off a ruled grid. It also swapped the default
14 tubes for the full pigment box, for the cadmium reds and Indian yellow. By the end it
had laid about 400,000 strokes over 148 hours of brush time, and its own description of the
time-lapse is "the fine-detail passes sharpen the picture in bands across the canvas". Whatever it
meant to do, it ended up measuring like the others.

<video controls muted playsinline preload="metadata" poster="/media/nine-claudes-one-painting/smax-final.webp" src="/media/nine-claudes-one-painting/smax-timelapse.mp4" style="width:100%;border-radius:8px"></video>

**Opus low and Opus medium** both started their second versions on a fresh canvas. Opus low said
why: "the crude shapes from version 1 would have shown through anything I put on top." Both hit
the same wall too. The default box of 14 tubes has no crimson, so the reds run orange. Opus medium
tried glazing them, laying thin see-through paint on top, and found it can't push past vermilion,
an orange-red. Opus max used the full 54-tube box and is the only one whose reds go properly deep.

Opus medium also painted Jefrie's face by hand at one point, didn't like it ("a flat cartoon"),
and wiped it off with a solvent-dipped rag while it was still wet. And its teeth wouldn't show
up. It had looked at the picture at too low a resolution, one pixel per canvas unit, which blurred
the teeth into the gaps between them. So it re-analyzed the faces at two and three times the
resolution.

**Haiku low** was hard on itself. It called its second version "a rough study" and named its own
problem: "I've been placing big masks and then checking the look, which produces blocks rather
than forms." It said the next pass should go figure by figure with a pencil sketch first. That's
the right diagnosis, and none of them did it.

**Haiku medium** did a smaller version of Haiku max's paint-over. A glow pass covered BloodTailor
entirely, so it rebuilt him from his old positions.

A Haiku session painting this same picture also put a post about it on this blog when I asked,
and it [took the live site back two months](/ledger/the-branch-that-went-live/) for eight minutes.

Here are two of them lit from above, the way they'd hang on a wall, so the ridges of paint catch
the light:

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/nine-claudes-one-painting/ol-2-gallery.webp" alt="Opus low's second version under raking gallery light, the paint ridges catching highlights" loading="lazy"><figcaption><b>Opus · low, gallery light</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/smax-gallery.webp" alt="Sonnet max's painting under gallery light" loading="lazy"><figcaption><b>Sonnet · max, gallery light</b></figcaption></figure>
</ao-compare>

</details>

## The printing press, and how Opus max broke it

One thing bothered me. Almost every model painted like a printing press. Pick a brush size, run
it over the whole canvas band by band, then go smaller. The face gets the same care as a blurry
jewel in the corner, when a painter would put the detail where the eye goes.

Sonnet medium did give the faces a finer pass. Opus max went further and broke the pattern at
the very end. Its time-lapse labels every stage. A filbert is a flat brush with a rounded end,
and a round has a point.

| Stage | Brush | Strokes |
|---|---|---|
| 1 · lay-in | filbert 30 | 2,952 |
| 2 · masses | filbert 17 | 5,993 |
| 3 · forms | filbert 9.5 | 14,203 |
| 4 · drawing | filbert 5.5 | 45,600 |
| 5 · detail | filbert 3.2 | 97,385 |
| 6 · fine | pointed round 1.9 | 175,003 |
| reds restated | filbert 2.3 | 94,027 |
| faces | round 1.3 | 27,747 |
| blade, gem, hands | round 1.6 | 32,608 |
| glints | thick white touches | 1,106 |
| deep crimson glazes, varnish | | |
| **finished** | | **496,624** |

The first six stages are the printing press. After that the faces get their own small brush
and the blade, gem and hands get another. A thousand thick white touches make the glints, and
glazes deepen the reds. I was really happy to see that. My other favorite, the full two and a
half minutes:

<video controls muted playsinline preload="metadata" poster="/media/nine-claudes-one-painting/omax-final.webp" src="/media/nine-claudes-one-painting/omax-timelapse.mp4" style="width:100%;border-radius:8px"></video>

Against the ChatGPT picture, drag the divider:

<ao-slider aspect="16/9" labels="ChatGPT reference|Opus max in oil">
<img src="/media/nine-claudes-one-painting/reference.webp" alt="The ChatGPT reference image">
<img src="/media/nine-claudes-one-painting/omax-final.webp" alt="Opus max's oil painting of the same picture">
<figcaption><b>Reference against Opus max</b><span class="ao-meta">reference 1672×941 shown at the painting's 2400×1351</span></figcaption>
</ao-slider>

## Jefrie's face, up close

Her face in both, at the same framing:

<ao-slider aspect="768/728" labels="ChatGPT|Opus max">
<img src="/media/nine-claudes-one-painting/face-reference.webp" alt="Close-up of Jefrie in the reference: silver half-mask, red eyes with highlights, a wide toothy grin, crisp specular highlights">
<img src="/media/nine-claudes-one-painting/face-omax.webp" alt="Close-up of Jefrie in Opus max's painting: the same mask, eyes and grin in brushstrokes, softer highlights, the teeth a row of cream dabs">
<figcaption><b>Jefrie, reference and Opus max</b><span class="ao-meta">the same crop of both, the reference enlarged about 2.9× to match and the painting 2×</span></figcaption>
</ao-slider>

It kept the mask's shine, both red eyes, the grin and the hair over the mask. It couldn't keep
the crispness. Brushstrokes soften every hard highlight, and the teeth are a row of cream dabs.
That's the medium as much as the model, and it makes me want to try others.

The same face across eight versions:

<ao-compare cols="4" aspect="1/1">
<figure><img src="/media/nine-claudes-one-painting/face-om-1.webp" alt="Opus medium v1: a round pale face with red ringed eyes and a wide grin" loading="lazy"><figcaption><b>Opus · medium · v1</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/face-om-2.webp" alt="Opus medium v2: mask and eyes with bright traced line accents" loading="lazy"><figcaption><b>Opus · medium · v2</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/face-ol.webp" alt="Opus low v2: the face softer and blurrier" loading="lazy"><figcaption><b>Opus · low · v2</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/face-smax.webp" alt="Sonnet max: a close painterly face with red eyes and grin" loading="lazy"><figcaption><b>Sonnet · max</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/face-sm.webp" alt="Sonnet medium: the face in soft dabs, the grin barely there" loading="lazy"><figcaption><b>Sonnet · medium</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/face-sl.webp" alt="Sonnet low: the face in blocky square dabs like pixel art" loading="lazy"><figcaption><b>Sonnet · low</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/face-hmax.webp" alt="Haiku max: a white oval face with two red dots under a brown hat shape" loading="lazy"><figcaption><b>Haiku · max</b></figcaption></figure>
<figure><img src="/media/nine-claudes-one-painting/face-omax.webp" alt="Opus max: the closest face" loading="lazy"><figcaption><b>Opus · max</b></figcaption></figure>
</ao-compare>

Each method shows in a small patch of canvas. Sonnet low's grid, Sonnet medium's mosaic, Opus
medium's traced lines, Haiku painting the idea of a face. None of them knew who these two were.
The transcripts call them "the man" and "the child", and Sonnet low saved its file as
`hellsing_painting.png`.

## What I want to try next

- **Measure for the shapes, then take the ruler away.** Let it check against the picture for the
  big shapes so the proportions are right, then forbid it for the details. A crew of Opus agents
  tried this next, in [Crimson Coil](/ledger/crimson-coil/).
- **Opus max, by eye only.** Same model and effort, but no checking against the reference with a
  script. It can only look.
- **A new picture, not a copy.** The same two characters in the same place, from a different
  camera angle and pose. Then there's nothing to copy from, only to learn from.

<details><summary>Why bigger paintings are hard</summary>

The simulator paints every painting at 2400 pixels wide, and it simulates every pixel of paint:
wetness, thickness, what's underneath. A full-canvas pass takes minutes of computer time, and
Opus medium's last full-canvas sharpening pass took about two hours on its own. Doubling the
width is four times the pixels. A few ideas I haven't tried:

- **A second, finer canvas just for the faces**, painted on its own at high resolution and set
  into an enlarged copy of the whole. The risk is a seam, and brushwork that suddenly changes
  scale.
- **Tiles.** A brushstroke only touches the paint near it, so a big canvas could be cut into
  overlapping tiles, each painted by its own session at the same time, then joined.
- **Resolution where the brush is small.** Simulate the background coarsely and only the
  fine-brush passages at full resolution. That needs a change in the simulator itself.

Any of these would let the detail go where the eye goes.

</details>
