---
id: "AO-025"
title: "Training a LoRA so my AI image model can draw my character"
summary: "An image model invented my character Jefrie by accident and could never draw her again. Why prompting didn't fix it, how I trained a LoRA on my laptop, and where it still misses."
date: 2026-09-28
status: "shipped"
tags: ["comfyui", "lora", "stable-diffusion", "characters", "claude-code"]
series: ["characters"]
topic: "art"
project: ["characters"]
preview:
  verdict: "Worked: 27 of 30"
  takeaway: "After under an hour of training on my 8 GB laptop, the model drew Jefrie in 27 of 30 test prompts, where 998 renders of prompt tuning never got her once."
  points:
    - "Caption only what changes (pose, angle, setting) and her mask, grin, tail and cape soak into one trigger word."
    - "The first run did four images in 19 hours because a leftover settings file put it on the CPU. A guard now kills that."
    - "Misses: her day job (one training picture showed it), sleeping and a close crouch. It won't work on my other model."
  image: "/media/previews/jefrie-lora.webp"
  alt: "A LoRA render of Jefrie standing on a path through a sunny flower field: half mask, red cape, grey armour and a scaly tail"
---

My character Jefrie was born by accident in oneObsession, an anime image model I run on my
laptop, and it could never draw her again. Nearly a thousand renders of prompting didn't fix it,
so I trained a LoRA, a small add-on file that teaches a model one new thing. After under an hour
of training on my 8 GB laptop, **27 of 30 test prompts come back as her**.

She's a small masked girl with a scythe and a tail that's supposed to weigh more than she does.

- **Prompting got pieces of her, never all of her.** 998 renders got her mask and colors right,
  never her ears, eyes or tail.
- **Caption only what changes.** Her fixed features soak into the made-up word that calls her up,
  so her huge tail shows up unasked.
- **Check the trainer is on the graphics card.** My first run sat on the CPU for 19 hours.
- **Three of 30 missed.** Her day job, sleeping and a close crouch.

## She was supposed to be BloodTailor

I was trying to draw BloodTailor, my gamertag character since I was fourteen, a man in an iron
mask with a huge grin and barbed wire around his forearms. oneObsession kept drawing him as a
girl.

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

I liked one of those girls so much I chased her through hundreds of images until this one
came out on 8 September.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-lora/origin-01231.webp" alt="The original Jefrie render: a small masked girl with a huge coiled tail and a blood scythe on a stormy battlefield" loading="lazy">
    <figcaption><b>The render that became Jefrie</b><span class="ao-meta">oneObsession · 8 Sep · ComfyUI_01231 · 75-tag prompt, 30 steps, cfg 5</span></figcaption>
  </figure>
</ao-compare>

That's Jefrie, and I couldn't make another one. Her prompt was mostly BloodTailor's with a few
tags for a little girl with a snake tail, so every run was a gamble.

No size word ever made her tail bigger. The only phrase that worked was "coiled densely
around". Her original prompt used it for BloodTailor's barbed-wire forearms, and the model
gave it to her tail.

<details><summary>The prompt that made her</summary>

- 75 tags, 30 steps, cfg 5 (how closely the model sticks to the prompt), on 8 September.
- Most of the tags describe BloodTailor, like "iron mask covering his entire upper face" and
  "plain white button-down shirt".
- The three that made her are on the end: `1girl`, `(little girl:1.45)` and `snake tail`. The
  number makes a tag count for more.
- The tail phrase came from `(thick rusted barbed wire coiled densely around forearms:1.5)`.
- Size words did nothing for the tail. "Huge", "giant", "massive" and stacked weights all failed.
- The overnight test later counted the real tokens (the chunks a model reads) in every prompt,
  because SDXL, the family oneObsession belongs to, stops listening after 75.

</details>

## Where she lived instead

For three weeks she lived in Nano Banana Pro, Google's image model, with that render as the
reference. Her design got finished there, and Seedream 5, another image model, made her
reference sheet from it. Everything since, like [putting her in 3D](/ledger/jefrie-in-3d/) and
[a fighting game](/ledger/storm-bell-fighter/), was built on those pictures, and so was the LoRA.

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

## 998 renders of prompting, no LoRA

Claude ran an overnight test for me on 10 September. It made 998 renders, changing one feature
at a time and scoring each against the original. The half mask, the gray world with red as the
only color and a two-handed grip all became reliable. But the ears came out as cat ears, devil
horns or bows, the eyes were ordinary anime eyes and the tail was thin or missing. Features that
worked alone fought each other when combined.

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

None of the 998 is her.

## Training the LoRA on my laptop

You train a LoRA by showing a model captioned pictures over and over until a made-up trigger
word, `jefr1e` for me, means her.

I marked the 48 pictures in my library that looked like her. Claude added single views from her
reference sheets and nine frames from a turntable video (a clip circling around her), then
captioned all 65. The captions describe only what changes, like the pose, the angle and the
setting, so the mask, grin, tail and cape soak into the trigger word.

My first run sat on the CPU, the laptop's slow main chip, for 19 hours and got through four
images. A leftover settings file from a broken install put it there. Claude fixed it and added a
guard that kills any CPU run. The real run took **56.6 minutes** on my 8 GB graphics card.

<details><summary>The training run, in numbers</summary>

- 65 images: the 48 I picked, single views cut from her reference sheets, and nine turntable frames.
- The trainer was kohya's, a popular free one, on the laptop's RTX 4070 with 8 GB.
- 1,480 steps in 56.6 minutes. The file is 85 MB and the trigger word is `jefr1e`.

</details>

## What it draws now

I tested it on 30 prompts, mostly things she'd never been drawn doing.

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

The tail is huge in every one, and the prompt never mentions a tail.

## The three misses

Her day job at a fast-food counter came out as a generic red-haired cashier, because only one
training picture showed it. Sleeping lost the mask and grew a fluffy tail, and one close crouch
let the mask slip. It also doesn't carry over to Pony, another anime model I use. That needs
its own run.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-lora/lora-dayjob-miss.webp" alt="A miss: the day-job prompt drew a generic red-haired cashier" loading="lazy">
    <figcaption><b>A miss: her day job</b><span class="ao-meta">one training image wasn't enough</span></figcaption>
  </figure>
</ao-compare>

The fix is five or six pictures of her at work and a few relaxed poses, then another run.
