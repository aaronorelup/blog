---
id: "AO-038"
title: "Claude paints in oil on a simulator, one stroke at a time"
summary: "Claude painted on alice's oil paint simulator, where every mark is a brush stroke and there's no undo. Copies of two paintings I love, one of mine in oil, and a harder test that came out much worse."
date: 2026-10-05
topic: "art"
project: ["oil-paint", "characters"]
preview:
  verdict: "Worked, mistakes and all"
  takeaway: "Driving a simulated brush instead of making pixels, Claude worked like a painter, charting its colors first and painting over mistakes it couldn't undo."
  points:
    - "Before painting it mixed 287 tube colors and about 1,200 more, measuring each one off the canvas."
    - "Three paintings stacked on one canvas came out much worse. In mostly red and orange pictures, the figures dissolved."
    - "The first three paintings together took about 25 minutes of CPU and about 2% of my weekly Claude usage."
  image: "/media/previews/claude-paints-in-oil.webp"
  alt: "Claude's oil painting of a pink-haired girl with red strawberry spots in her hair, an orange sun and a small red crab behind her"
---

<img class="fill" src="/media/oil-paintings/strawberry-girl.webp" alt="An oil painting of a pink-haired girl with red strawberry spots in her hair, lying back on a pastel beach with an orange sun, yellow sand, turquoise water and a small red crab">

I had Claude paint three oil paintings on Claude Paint, alice's simulator of wet oil paint.
Every mark is a simulated brush stroke, the paint comes from fourteen tubes of historical
pigment, and there's no undo. Two are copies of paintings I saw at the Museum of Russian Art.
The third, up top, is my own 2018 digital painting redone in oil.

**It worked, mistakes and all.** Claude went about it like a painter, and when it got something
wrong it painted over it, since there's no other fix. A harder test, three paintings stacked on
one canvas, came out much worse.

- **It painted a color chart first.** 287 tube mixes and about 1,200 more, each measured off the
  canvas.
- **It couldn't match my turquoise.** Its historical tubes have no phthalo, the modern pigment
  painters use for that blue-green.
- **The first three took about 2% of my weekly Claude usage.** They ran about 25 minutes on my
  laptop's processor.

## What Claude Paint is

[Claude Paint](https://github.com/aliceisjustplaying/claude-paint) is alice's physics simulator of
oil paint ([stillwet.art](https://stillwet.art)). Bristles carry paint, wet paint smears and
dries, and you only get the colors you can mix from the tubes. Claude sends a chunk of code that
paints one area, looks at the canvas, then decides what's next, so every painting is a log you
can replay. It came second when I had
[Claude pick something impressive from X](/ledger/opus-55-on-x-alone/) to try.

That makes it different from an image generator, which predicts pixels with no brush behind
them, and from drawing with code, where shapes come out perfect and a mistake costs nothing.

The painter was Opus 5.5, Anthropic's biggest Claude model. Getting alice's Mac simulator running
on my Windows laptop took it about 20 minutes. I've used it since for
[nine Claudes painting one picture](/ledger/nine-claudes-one-painting/) and for
[Crimson Coil](/ledger/crimson-coil/), Episode 1 of
[my AI TV series](/courses/i-love-my-evening-television/).

## The three paintings

Two of my favorite paintings are ones I saw at the Museum of Russian Art, a boy reading at a
spring window and a Soviet courtroom. I asked for master studies, faithful copies the way painters
learn. These are Claude's, not the originals.

<img class="fill" src="/media/oil-paintings/spring-study.webp" alt="Oil study: a boy in dark navy kneels on a red stool reading at a table by a bright window, with budding branches in a jar, a tall cactus and patterned curtains, and a hazy city with a TV tower outside">

<img class="fill" src="/media/oil-paintings/court-study.webp" alt="Oil study: a courtroom waiting room, a man in a dark suit on a wooden bench looking aside, a woman in a dark coat leading a small child, onlookers behind">

And mine, which I asked it to redo in oil "with a little more detail than what it is now."

<ao-compare cols="2" aspect="4/3">
<figure><img class="fill soft" src="/media/oil-paintings/strawberry-2018-original.webp" alt="My 2018 digital painting"><figcaption><b>My 2018 original</b><span class="ao-meta">digital painting</span></figcaption></figure>
<figure><img class="fill soft" src="/media/oil-paintings/strawberry-girl.webp" alt="Claude's oil version"><figcaption><b>Claude's oil version</b><span class="ao-meta">simulated oil on simulated linen</span></figcaption></figure>
</ao-compare>

She kept her face. That heavy-lidded, completely unimpressed look is the whole character.

<details><summary>How it painted, step by step</summary>

**The color chart.** Before anything else it painted 287 tube mixes, plus about 1,200 more aimed
at the colors it couldn't hit, and measured each one off the canvas. That's how it knew a pastel
pink was vermilion, an old red, and lead white with a touch of pale smalt, an old blue.

<img class="fill" src="/media/oil-paintings/calibration-chart.webp" alt="A grid of a few hundred oil paint swatches: every tube alone, mixed with white, and mixed in pairs">

**Squaring up and the block-ins.** For the copies it squared up each reference into color zones,
the way copyists rule a grid over a print. It blocked in all three paintings first, meaning it
laid down the big shapes and colors roughly, then refined them one at a time. Finer passes, then
dark accents like the twigs, the crane and the cactus ribs, then light accents and glazes, the
thin see-through coats painters build up. It painted the faces, eyes and hair strands by hand.

<img class="fill" src="/media/oil-paintings/blockins.webp" alt="The three block-ins side by side: the beach girl, the boy at the window, the courtroom">

**My painting, pass by pass.** Its first block-in was scribbles on bare canvas, strokes with gaps
the way a real hand leaves them. It went over everything again with fuller brushes. Its first
eyelids and eyebrows were hairlines too faint to see, painted with a pointed brush at light
pressure, so it painted them again blunt and fully loaded.

<img class="fill" src="/media/oil-paintings/strawberry-passages.webp" alt="Three stages: sparse scribbled block-in, covered masses, then the face and crab restated">

**The face up close.** At full resolution you can see the brush marks and the lid lines. The
water behind her is the nearest green-blue those old pigments can make.

<img class="fill" src="/media/oil-paintings/strawberry-face-crop.webp" alt="Close-up of the face at full resolution: brush marks, lid lines, blue irises">

</details>

## The mistakes it painted over

No undo means every fix is more paint.

In the spring painting it looked for the boy's legs by picking out the dark areas, and caught the
dark green wall too. That left a navy rectangle in the middle. It let the paint set and repainted
the whole region from the reference.

<img class="fill" src="/media/oil-paintings/spring-mistake-repair.webp" loading="lazy" alt="Left: a navy block painted over the wall by mistake. Right: the same area repainted, the kneeling boy back against the green wall">

In the courtroom it decided the wall was "too yellow" without checking the numbers, and dragged a
thin cool gray over it. The original wall really is warm. The gray also chalked over the lit
faces, so it painted that back out too.

## The time-lapses

Replaying the log repaints the picture, so time-lapses come free, a frame every 45 seconds of
painting time. The same log could steer a robot arm.

<video class="fill" controls muted playsinline preload="metadata" poster="/media/oil-paintings/strawberry-girl.webp" src="/media/oil-paintings/strawberry-timelapse.mp4"></video>

<details><summary>The spring window and courtroom time-lapses</summary>

You can see the mistakes go in and get painted out: the navy block in the spring study, the
chalky wall in the courtroom.

<video class="fill" controls muted playsinline preload="metadata" poster="/media/oil-paintings/spring-study.webp" src="/media/oil-paintings/spring-timelapse.mp4"></video>

<video class="fill" controls muted playsinline preload="metadata" poster="/media/oil-paintings/court-study.webp" src="/media/oil-paintings/court-timelapse.mp4"></video>

</details>

## Three paintings on one canvas

The harder test came out much worse. Claude painted three pictures of my characters Jefrie and
BloodTailor, each from an image ChatGPT made, one over the other on the same canvas. It saved each
painting before the next one buried it. Only in the top one, a campfire scene, can you make out
the figures.

<video class="fill" controls muted playsinline preload="metadata" poster="/media/oil-paintings/stack-3-twilight-feast.webp" src="/media/oil-paintings/stack-timelapse.mp4"></video>

That's all 54 chunks replayed from one log. Here's each painting as it was saved.

<ao-compare cols="3" aspect="16/9">
<figure><img class="fill soft" src="/media/oil-paintings/stack-1-crimson-scythe.webp" alt="Layer one: Jefrie lunging with her scythe in front of BloodTailor's blood vortex, muddy and hard to read"><figcaption><b>Layer one</b><span class="ao-meta">Jefrie and her scythe, muddy</span></figcaption></figure>
<figure><img class="fill soft" src="/media/oil-paintings/stack-2-crimson-warden.webp" alt="Layer two: a low-angle BloodTailor in a cathedral of chains, Jefrie's tail arcing over him"><figcaption><b>Layer two</b><span class="ao-meta">BloodTailor among chains</span></figcaption></figure>
<figure><img class="fill soft" src="/media/oil-paintings/stack-3-twilight-feast.webp" alt="Layer three: BloodTailor and Jefrie at a campfire under the iron dome at dusk"><figcaption><b>Layer three</b><span class="ao-meta">the campfire, the only clear one</span></figcaption></figure>
</ao-compare>

They came out worse because of how Claude plans a copy. It splits each picture into zones of
color before painting. On the museum paintings the zones followed the forms, a navy boy against a
green wall. These images are almost all red, orange or near-black, so the zones cut across the figures and
they dissolved.

The next try would be a painter's plan for a busy picture. Decide how light or dark each area is,
draw the figures as shapes by hand, then color inside them. I hit my weekly Claude usage limit
before it got to try that.

<details><summary>What I asked for, and what else went wrong</summary>

- **Buried layers can show through.** In the simulator a buried painting survives as ridges in
  the surface and shows through wherever the new paint is thin, like an old painting turning up
  under a new one in an X-ray.
- **I asked it to fix the ChatGPT images' mistakes.** They had a crunchy, noisy texture, Jefrie's
  scythe was wrong, and her tail floated behind her instead of growing out of her. It read my
  notes on both characters first, gave her a single scythe blade with the red eye at its base and a bare
  handle, and joined her tail at her lower back.
- **It copied the crunch.** Its first pass reproduced that ChatGPT texture faithfully, as noise.
- **Smoothing the reference made it worse.** The figures turned into blobs.

</details>
