---
id: "AO-055"
title: "How much a rented cloud GPU speeds up my AI videos"
summary: "I rented a big graphics card online to render my AI video clips. How much faster it really was than my 8 GB laptop, what made the difference, and what an hour of video costs."
date: 2026-10-17
topic: "video"
project: []
preview:
  verdict: "4-5x faster, not 30x"
  takeaway: "A rented 48 GB card made my AI video clips 4 to 5 times faster than my laptop, once it had two speed settings my laptop already used."
  points:
    - "The first night it was only 1.2 to 1.9 times faster. It was running my laptop's 8 GB workarounds without its speed-ups."
    - "A music video's whole render list, 37 clips, 22 images and more, took 2 hours 8 minutes on one rented card for $2.44."
    - "The first clip waited 13 minutes for the model files to load off network storage. Preloading them cut that to about 3."
  image: "/media/previews/renting-a-gpu.webp"
  alt: "The music video's poster: a lit brass lantern on the ground at night beside a pocket watch, with the lyric But you will return, won't you, my love?"
---

I rented a graphics card online to see how much faster it would make my AI videos. **It's 4 to
5 times faster than my laptop.** I was expecting 10 to 30 times.

Most of [my recent films](/ledger/every-ai-film-so-far/) are made with an AI video
model called MiniMax-H3, on my laptop's 8 GB graphics card (an RTX 4070). It's slow. A 5-second
clip takes 5 or 6 minutes, and a whole song is hours where I can't use my laptop. So I had Claude
rent a 48 GB Nvidia L40S for $1.09 an hour from Runpod, a site that rents out graphics cards, and
run the exact same jobs on it.

## The first night it was barely faster

The rented card was only 1.2 to 1.9 times faster. I told Claude, "I was expecting it
to be 10-30x faster... Figure it out. I need this working."

It found the problem within the hour. My laptop runs two speed settings the rented card didn't
have. One is SageAttention, a faster way to do one of the model's heaviest math steps. The other
is the `--fast` switch in ComfyUI, the app I run the model in. The card was also still doing the
workarounds that squeeze the model into 8 GB. Once Claude fixed all that, the card went from about
1.5x to 4.5x.

<ao-bars max="374" unit="s">
<table>
<thead><tr><th>Job</th><th>Laptop 4070, 8 GB (slow end)</th><th>L40S, first night</th><th>L40S, tuned</th></tr></thead>
<tbody>
<tr><td>Clip, 736×416, 124 frames</td><td>142</td><td>76.4</td><td>29.1</td></tr>
<tr><td>Clip, 1344×768, 124 frames</td><td>346</td><td>211.8</td><td>76.8</td></tr>
<tr><td>6 s chain continuation, 736×416</td><td>374</td><td>301.1</td><td>74.0</td></tr>
</tbody>
</table>
<figcaption><b>Seconds per job, same workflows and model files on both machines</b><span class="ao-meta">A chain continuation is a 6-second clip that picks up where the last one stopped. The laptop's times ranged 95-142, 313-346 and 309-374 seconds, and the bars show the slow end. The rented card's times are from the benchmark logs on 16 October and the tuning session after it. The first night's second continuation took 252 seconds. The tuned continuation ran with SageAttention 1, the other tuned jobs with version 2.</span></figcaption>
</ao-bars>

## What I took away

- **More memory doesn't make the card faster.** It just means the model doesn't have to be
  squeezed in, and the squeezing was costing me less than I thought.
- **Copy your local speed settings to the cloud first.** That was the whole difference.
- **Keep the 44 GB of model files on the cloud's own storage.** Mine sit on a Runpod drive every
  rented card plugs into, for $7 a month. The first clip still waited 13 minutes for them to load,
  until Claude had them load in parallel at start-up. Now it's about 3.
- **Upscaling isn't worth renting for.** Making a render bigger and sharper took 9 seconds there
  and 10 to 12 on my laptop.
- **The card with the big number lost.** I asked for a 5090, a 32 GB gaming card, because the
  number was big. Its rendering steps were the fastest, but it sat idle for 40 to 54 seconds
  after every clip, so the L40S beat it overall. Nobody knows why yet.

## What an hour of video costs

Then I asked Claude, "how much will it cost me in the future per 1 hour of video generated?" It
worked it out from the tuned timings:

<ao-calc>
<ul>
<li data-var="mins" data-min="1" data-max="60" data-step="1" data-value="10" data-unit="min">Finished video</li>
<li data-var="takes" data-min="1" data-max="5" data-step="0.5" data-value="2" data-unit="×">Takes per clip I keep</li>
<li data-var="big" data-options="736×416:0|1344×768:1" data-value="1344×768">Clip size</li>
</ul>
<ol>
<li data-f="mins / 60 * (7 + 12 * big) * takes" data-unit="GPU-hours" data-digits="1">Tuned L40S</li>
<li data-f="mins / 60 * (7 + 12 * big) * takes * 1.09" data-prefix="$" data-digits="2">At $1.09 an hour</li>
<li data-f="mins / 60 * (18 + 43 * big) * takes" data-unit="hours" data-digits="1">Laptop, fastest measured</li>
<li data-f="mins / 60 * (27 + 40 * big) * takes" data-unit="hours" data-digits="1">Laptop, slowest measured</li>
</ol>
<figcaption><b>Plain clips, a new prompt each, no idle time</b><span class="ao-meta">One hour of finished video takes the tuned L40S about 7 GPU-hours at 736×416 and about 19 at 1344×768. The laptop takes 18 to 27 and 61 to 67 hours. Not counted: about 8 minutes and 15 cents to start each rented card. Example: 10 minutes at 1344×768 with 2 takes is 6.3 GPU-hours and $6.90 on the rented card, or 20 to 22 hours on the laptop.</span></figcaption>
</ao-calc>

Chained clips, where each one picks up the last one's motion, cost more, about $16 per hour of
video at 736×416, and an estimated $44 at 1344×768, which nobody has measured.

## The first real job, a music video for $2.44

Another Claude session was making a new cut of my music video for "Moonlight at the Waterline",
the love song from my game [BLACKWATER](https://play.aaronorelup.com). I told the rented card's
session to take its renders: "if he can generate everything that he needs in under $10, then let
him generate everything he needs." Retakes came back in minutes.

That was 37 clips (7 of them retakes), 8 chained segments, 22 images and 2 upscales, in 2 hours 8
minutes of rented time, for $2.44. Each frame took about a quarter of my laptop's time. Here's the
result:

<video controls playsinline preload="metadata" poster="/media/moonlight-v4/poster.webp" src="/media/moonlight-v4/moonlight_v4_720.mp4" style="width:100%;border-radius:8px"></video>

One mistake cost time. Images and video took turns on the card, the two models didn't fit in its
memory together, and every switch back to video spent about four minutes reloading. Now a card
runs one kind of model at a time. How the video was made is in
[five music videos for one song](/ledger/moonlight-five-times/).

## Several agents sharing rented cards

Several of my AI agents (Claude sessions) will rent cards at once, so I asked if they'd collide.
They would have, in three ways. Now each agent gets its own card and folder, and nobody can shut
down a card they didn't start. I also set a rule: "we always clean up after
ourselves when we are done so we should never leave the images/videos in the runpod storage." The
shared drive keeps only models and scripts.

<details><summary>The three ways agents would have collided</summary>

- **One agent connecting would have moved everyone.** Pointing my ComfyUI tools at a card
  changes a setting every session on my laptop shares. So every render, local ones too, would
  have gone to that one agent's card.
- **The clean-up would have deleted other agents' clips.** Every card wrote to the same shared
  folders, and the clean-up script empties the output folder. Runpod's own docs also say several
  cards writing to one drive at once can corrupt it.
- **My laptop's GPU queue was booking the laptop for cloud jobs.** The queue is how my agents take
  turns on my laptop's card, and it was reserving it for commands that ran on a rented one.

</details>

<details><summary>How the storage was set up</summary>

- I had Claude set up Runpod from Runpod's own guide for agents. Then I gave the next session a
  cap for its first pod, Runpod's word for a rented machine: "create the L40S Secure pod ($1.09/hr) and run
  the benchmark, $2.50 cap."
- Four minutes into the first rented card I stopped it and asked for something I'd keep: "We are
  trying to create the system we will use on going throughout this month."
- That became a 100 GB network volume, a drive any rented card can mount, holding the exact model
  files my laptop uses. Claude checked every file against the originals on Hugging Face, where the
  models are published. Later cards mount the drive instead of downloading the 44 GB again.
- The first benchmark clip took 13 minutes because the model files came off that drive at 60 to
  100 MB a second. I asked: "Is that how it's gunna be every time?" Once the files were loaded it
  wasn't.

</details>

<details><summary>The tuning and the rest of the numbers</summary>

- SageAttention built for the L40S (435 seconds of compiling), plus `--fast` and the Triton
  backend. Version 1 got the big clip to 87.5 seconds, version 2 to 76.8.
- The ComfyUI workflows rebuilt without the chunking steps that only exist to squeeze the model
  into 8 GB.
- The model files loaded into memory in parallel at start-up, at 232 to 260 MB a second. That cut
  the first load from 13 minutes to about 3.
- `--highvram` (keep everything on the card) ran out of memory even on 48 GB, so it stays off.
- The 5090 did a step at 1344×768 in 7.75 seconds against the L40S's 12.5. After every clip its
  GPU sat at 0% for 40 to 54 seconds doing something on the processor.
- Claude's estimate: an L40S has about four times the raw speed of a laptop 4070, so 4 to 5 times
  is probably close to the ceiling. 10 to 30 times would need H100-class cards, the big data
  center ones, which I haven't tried.
- A new prompt adds 7 to 20 seconds of text encoding, the model reading the prompt. The calculator
  counts it.
- On the music video job a clip took about 0.75 to 0.8 seconds of L40S time per frame. The 2
  hours 8 minutes is how long the job ran on the card, start to finish. The music video post
  counts about an hour and 41 minutes of actual GPU work.
- The 8 chained segments are one four-clip chain plus its retakes. The 22 images are 20
  paintings and 2 keyframes, the starting pictures. The music video post counts them that way.
- Spent on two tests and one real job: $5.41, plus $7 a month for the storage that holds the models.

</details>
