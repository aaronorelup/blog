---
id: "AO-025"
title: "The model that invented Jefrie couldn't draw her again, until I trained a LoRA"
summary: "Jefrie came out of oneObsession by accident while I was trying to draw BloodTailor. Nearly a thousand tuned prompts later it still couldn't draw her twice. One hour of LoRA training on my laptop fixed it: 27 of 30 test images are her."
date: 2026-09-28
status: "shipped"
tags: ["comfyui", "lora", "stable-diffusion", "characters", "claude-code"]
series: ["characters"]
preview:
  verdict: "Worked: 27 of 30"
  takeaway: "Caption the training pictures with only what changes, and the LoRA soaks the rest into one trigger word: her huge tail shows up without being asked for."
  points:
    - "65 images (48 I picked, plus sheet views and nine turntable frames), 1,480 steps, 56.6 minutes on an 8 GB laptop GPU."
    - "The first run did four images in 19 hours: a config from a broken install had it on the CPU. A guard now stops that."
    - "Misses: her day job (one training image showed it), sleeping, a close crouch. Next run: more day-job and relaxed poses."
  image: "/media/previews/jefrie-lora.webp"
  alt: "A LoRA render of Jefrie standing on a path through a sunny flower field: half mask, red cape, grey armour and a scaly tail"
---

Jefrie was born in a model that could never draw her again. She came out of oneObsession, an
Illustrious anime checkpoint I run locally, on 8 September. For three weeks after that, the
only way to get a new picture of her was to hand that one render to Nano Banana Pro as a
reference. Today I trained a LoRA on my laptop, and oneObsession draws her on demand: 27 of
30 test prompts came back as her, including angles and scenes she has never been drawn in.

Here's how she got lost, and how she came back.

## She was supposed to be BloodTailor

I was trying to generate BloodTailor, my gamertag
character since I was fourteen: a smooth iron mask, an impossibly wide grin, a red cloak and
barbed wire around his forearms. oneObsession kept drawing him as a girl.

<ao-compare cols="4" aspect="1/1">
  <figure>
    <img src="/media/jefrie-lora/origin-01199.webp" alt="oneObsession render meant to be BloodTailor, drawn as a masked girl" loading="lazy">
    <figcaption><b>Meant to be BloodTailor</b><span class="ao-meta">oneObsession · ComfyUI_01199</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-lora/origin-01222.webp" alt="Another BloodTailor attempt drawn as a girl" loading="lazy">
    <figcaption><b>Also a girl</b><span class="ao-meta">ComfyUI_01222</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-lora/origin-01223.webp" alt="A third BloodTailor attempt drawn as a girl" loading="lazy">
    <figcaption><b>Following the idea</b><span class="ao-meta">ComfyUI_01223</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-lora/origin-01224.webp" alt="A fourth attempt, closer to the girl who became Jefrie" loading="lazy">
    <figcaption><b>Getting closer</b><span class="ao-meta">ComfyUI_01224</span></figcaption>
  </figure>
</ao-compare>

One of those accidents was a girl I really liked, so I stopped fighting it and started chasing
her. I generated hundreds of images, tuning the prompt toward what I was seeing in my head,
until this one came out:

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-lora/origin-01231.webp" alt="The original Jefrie render: a small masked girl with a huge coiled tail and a blood scythe on a stormy battlefield" loading="lazy">
    <figcaption><b>The render that became Jefrie</b><span class="ao-meta">oneObsession · 8 Sep · ComfyUI_01231 · 75-tag prompt, 30 steps, cfg 5</span></figcaption>
  </figure>
</ao-compare>

That's Jefrie. And I couldn't make another one.

The prompt that made her is still BloodTailor's prompt: 75 tags, most of it describing *him*
("iron mask covering his entire upper face", "plain white button-down shirt"). She only exists
because of a few tags stapled onto the end: `1girl`, `(little girl:1.45)`, `snake tail`. Every
run was a gamble.

The tail was the worst of it, and the tail was what I cared about most. It's supposed to weigh
more than she does. No size adjective ever made it bigger. "Huge", "giant", "massive", stacked
weights: nothing. The only thing that worked was the phrase **"coiled densely around"**, and it
dragged other things into the picture that I didn't want. Reading the metadata back for this
post, I noticed the phrase in her original prompt isn't even about her tail. It's left over
from BloodTailor's forearms: `(thick rusted barbed wire coiled densely around forearms:1.5)`.
The model heard "coiled densely" and gave it to the tail.

## So she moved to Nano Banana

From then on she lived in Nano Banana Pro, with that render as the reference image. That's
where her design got finished: the half mask, the torn leather ear points, the scythe with the
eye in it, the reference sheets. Everything since, including [putting her in
3D](/ledger/jefrie-in-3d/) and [a fighting game](/ledger/storm-bell-fighter/), was built on
those references, not on the model she was born in.

<ao-compare cols="2" aspect="16/10">
  <figure>
    <img src="/media/jefrie-lora/nbp-canon-plate.webp" alt="Jefrie's canon image, redrawn in Nano Banana Pro from the original render" loading="lazy">
    <figcaption><b>Her canon image</b><span class="ao-meta">Nano Banana Pro, from the original render</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-lora/nbp-refsheet.webp" alt="Jefrie reference sheet: front, side and close-up" loading="lazy">
    <figcaption><b>Her reference sheet</b><span class="ao-meta">Seedream 5 on Higgsfield</span></figcaption>
  </figure>
</ao-compare>

## A thousand prompts without a LoRA

I did try to get her back into oneObsession the hard way. On the night of 10 September Claude
ran an overnight experiment for me: 14 rounds, 998 renders, testing one feature at a time
(mask, ears, eyes, palette, weapon, background) and scoring against the original. It measured
real token counts, because SDXL quietly stops listening after 75.

It found real things. The half mask, the grey world with red as the only colour, and a
two-handed grip on the scythe all became reliable. But the ears were always catgirl ears,
devil horns or bows. The eyes were ordinary anime eyes. The tail was a thin devil's tail or
missing. And the features that worked alone fought each other when they were combined.

<ao-compare cols="4" aspect="3/2">
  <figure><img src="/media/jefrie-lora/nolora-horns.webp" alt="No-LoRA attempt: devil horns instead of ear points" loading="lazy"><figcaption><b>Devil horns for ears</b><span class="ao-meta">round 2</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/nolora-bows.webp" alt="No-LoRA attempt: red bows on her head" loading="lazy"><figcaption><b>Bows for ears</b><span class="ao-meta">round 4</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/nolora-eyes.webp" alt="No-LoRA attempt: no mask, ordinary anime face" loading="lazy"><figcaption><b>Mask gone, anime eyes</b><span class="ao-meta">round 14</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/nolora-mask.webp" alt="No-LoRA attempt: partial mask, thin devil tail" loading="lazy"><figcaption><b>Thin devil tail</b><span class="ao-meta">round 7</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/nolora-holistic.webp" alt="No-LoRA attempt: all-red costume with a dragon tail" loading="lazy"><figcaption><b>Tail, but all red</b><span class="ao-meta">round 1</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/nolora-combo.webp" alt="No-LoRA attempt: combined best tags, red costume" loading="lazy"><figcaption><b>Best tags combined</b><span class="ao-meta">round 12</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/nolora-grip.webp" alt="No-LoRA attempt: two-handed scythe grip" loading="lazy"><figcaption><b>The grip worked</b><span class="ao-meta">round 9</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/nolora-amusement.webp" alt="No-LoRA attempt: amusement park poster style" loading="lazy"><figcaption><b>Nice, not her</b><span class="ao-meta">round 13</span></figcaption></figure>
</ao-compare>

Nearly a thousand renders, and none of them is her.

## The LoRA

A LoRA is a small add-on file, 85 MB here, that teaches a model one new thing. You show it
captioned pictures over and over until a made-up trigger word (mine is `jefr1e`) means *her*.

I went through my library in digiKam and colour-labelled every picture I felt looked like
her: 48 of them. Claude cut the reference sheets into single views, pulled nine angles out of a
turntable video, and captioned all 65 images. The captions describe only what changes (the
pose, the angle, the setting), so the mask, grin, tail and cape get soaked into the trigger
word. Then kohya's trainer ran on my laptop's RTX 4070 with 8 GB: 1,480 steps, **56.6
minutes**.

The first attempt sat for 19 hours and got through four images. The trainer had been quietly
running on the CPU the whole time, because of a config file written during a broken first
install. Claude found the line in the log that said so, fixed it, and added a guard that
kills any run that lands on the CPU.

Then I gave it 30 prompts, most of them things she'd never been drawn doing:

<ao-compare cols="3" aspect="1/1">
  <figure><img src="/media/jefrie-lora/lora-back.webp" alt="LoRA: Jefrie from behind, cape and tail" loading="lazy"><figcaption><b>From behind</b><span class="ao-meta">jefr1e · 27.5 s</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-fight-rain.webp" alt="LoRA: Jefrie fighting in the rain" loading="lazy"><figcaption><b>Fight in the rain</b><span class="ao-meta">jefr1e</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-portrait.webp" alt="LoRA: close-up portrait of Jefrie's grin" loading="lazy"><figcaption><b>Portrait</b><span class="ao-meta">jefr1e</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-climbing.webp" alt="LoRA: Jefrie climbing iron bars in a storm" loading="lazy"><figcaption><b>Climbing the cage</b><span class="ao-meta">jefr1e</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-dancing.webp" alt="LoRA: Jefrie dancing under the moon" loading="lazy"><figcaption><b>Dancing</b><span class="ao-meta">jefr1e</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-sharpening.webp" alt="LoRA: Jefrie by a campfire with her scythe" loading="lazy"><figcaption><b>By the fire</b><span class="ao-meta">jefr1e</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-reading.webp" alt="LoRA: Jefrie reading by candlelight" loading="lazy"><figcaption><b>Reading</b><span class="ao-meta">jefr1e</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-street-rain.webp" alt="LoRA: Jefrie walking a rainy lantern-lit street" loading="lazy"><figcaption><b>Rainy street</b><span class="ao-meta">jefr1e</span></figcaption></figure>
  <figure><img src="/media/jefrie-lora/lora-flower-field.webp" alt="LoRA: Jefrie standing in a sunny flower field" loading="lazy"><figcaption><b>A flower field</b><span class="ao-meta">nothing like her training</span></figcaption></figure>
</ao-compare>

The tail is huge in every one of them, and the prompt never mentions a tail.

Three of the 30 missed. My Grease Basket day job came out as a generic red-haired cashier,
because only one training image showed it. Sleeping lost the mask and grew a fluffy tail. One
close crouch let the mask slip. It also doesn't carry over to Pony, the other model I use;
that would take its own run.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-lora/lora-dayjob-miss.webp" alt="A miss: the day-job prompt drew a generic red-haired cashier" loading="lazy">
    <figcaption><b>A miss: her day job</b><span class="ao-meta">one training image wasn't enough</span></figcaption>
  </figure>
</ao-compare>

Those misses are a shopping list, not a wall: five or six day-job pictures, a few relaxed
poses, then train again.

What gets me is how backwards the whole thing was. oneObsession invented her by accident, and
a thousand careful prompts couldn't get her back. What finally worked was Nano Banana and the
reference images drawn from that one lucky render, fed back into the model she came from.
