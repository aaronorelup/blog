---
id: "AO-055"
title: "I rented a 48 GB cloud GPU for my video model expecting 10 to 30 times my laptop. It does 4 to 5"
summary: "On the first night, an L40S on Runpod rendered MiniMax-H3 clips only 1.2 to 1.9 times faster than my 8 GB laptop, because it was missing the laptop's own speed settings. Tuned, it reached 3.3 to 5 times, and a music video's whole render list cost $2.44."
date: 2026-10-17
status: "shipped"
tags: ["claude-code", "comfyui", "minimax-h3", "ai-video", "runpod", "lessons"]
preview:
  verdict: "4-5x, not 30x"
  takeaway: "The first cloud run lost to my laptop's settings, not its hardware. Copying the laptop's attention kernel and flags took the same GPU from 1.5x to 4.5x."
  points:
    - "Untuned L40S: 76.4 s for a clip the laptop does in 95-142 s. Tuned: 29.1 s."
    - "The first clip of the night waited 780.8 s for weights off network storage; prefetching cut that load to about 3 min."
    - "One pod, 2 h 8 min: 37 video clips, 8 chain segments, 22 images, 2 upscales, $2.44."
---

A rented 48 GB L40S renders my video model 4 to 5 times faster than my 8 GB laptop, not the 10
to 30 times I expected. On the first night it managed 1.2 to 1.9 times, and the gap between
those two numbers was nothing about the cloud: the pod was missing the speed settings my laptop
has had for weeks.

All of this happened on the evening of 16 October, between 5 pm and just past midnight, across
several Claude Code sessions (Opus 5.5) and five pods on Runpod. Total GPU spend for the two tests and one real
job: $5.41, plus $7 a month for the storage that holds the models.

## Why rent one at all

Everything I make with MiniMax-H3, the video model behind most of my recent films, runs on an
RTX 4070 laptop with 8 GB of video memory. It works because ComfyUI pages the 44 GB of model
files through system memory in chunks. It is slow: a 5-second clip at 1344×768 takes five to
six minutes, and a song-length film is hours of a laptop I can't use for anything else.
([Twelve days of that](/ledger/every-ai-film-so-far/) is its own post.)

So on the 16th I had Claude set up Runpod from Runpod's own agent-setup guide, then gave the
next session a cap: "create the L40S Secure pod ($1.09/hr) and run the benchmark, $2.50 cap."
Four minutes into the first pod I stopped it and asked for something I would keep: "We are
trying to create the system we will use on going throughout this month." It became a 100 GB
network volume holding the exact model files my laptop uses, checked hash for hash against
Hugging Face, so every later pod mounts them instead of downloading 44 GB again.

## The first night: barely faster

The benchmark used the same graphs, the same start frame, the same prompts and the same
quantized files as the laptop. The first clip took 780.8 seconds, 13 minutes, because the
weights streamed off network storage at 60 to 100 MB a second. At 7:01 pm I asked: "Why is it
taking so long? It shouldn't take this long." A minute later: "Is that how it's gunna be every
time?"

Once warm it wasn't, but it wasn't much better either.

<ao-bars max="374" unit="s">
<table>
<thead><tr><th>Job</th><th>Laptop 4070, 8 GB (slow end)</th><th>L40S, first night</th><th>L40S, tuned</th></tr></thead>
<tbody>
<tr><td>Clip, 736×416, 124 frames</td><td>142</td><td>76.4</td><td>29.1</td></tr>
<tr><td>Clip, 1344×768, 124 frames</td><td>346</td><td>211.8</td><td>76.8</td></tr>
<tr><td>6 s chain continuation, 736×416</td><td>374</td><td>301.1</td><td>74.0</td></tr>
</tbody>
</table>
<figcaption><b>Seconds per job, MiniMax-H3, same graphs and files on both machines</b><span class="ao-meta">Laptop ranges: 95-142, 313-346, 309-374 s (the bars show the slow end). Pod: exec seconds from the benchmark logs, 16 Oct (first night) and the tuning session that followed. The first night's second continuation took 252.1 s; the tuned continuation ran with SageAttention 1, the others with 2.</span></figcaption>
</ao-bars>

At 7:25 pm I wrote the line this post is about: "I was expecting it to be 10-30x faster. I have
a 4070 with 8gb of vram, and there is a 5090 on there with 32 gb vram. So I was expecting huge
gains in efficiency. Figure it out. I need this working."

## What was missing

The tuning session found it within the hour. My laptop starts ComfyUI with SageAttention (a
faster attention kernel) and `--fast`. The pod ran plain PyTorch attention, no `--fast`, and the
graphs still carried the chunking nodes that exist only to squeeze the model into 8 GB. **The
48 GB card was running the 8 GB card's workarounds without the 8 GB card's speedups.**

The fix, in the order it was tried:

- SageAttention built for the L40S (435 seconds of compiling), `--fast` and the Triton backend.
  SageAttention 1 got the 1344×768 clip to 87.5 s; version 2 got it to 76.8 s.
- Graphs rebuilt without the 8 GB chunking nodes.
- The 44 GB of model files read into memory in parallel at boot, at 232 to 260 MB a second,
  which cut the first load from 13 minutes to about 3.
- `--highvram`, which keeps everything on the card, ran out of memory on 48 GB. It stays off.

I asked for the 5090 too. It had the fastest sampler measured, 7.75 seconds a step at 1344×768
against the L40S's 12.5, but after every clip its GPU sat at 0% for 40 to 54 seconds doing
something on the CPU, so its totals lost to the L40S. That stall is still not explained.

The 4 to 5 times is probably close to the ceiling. The session's estimate is that an L40S has
about four times the tensor throughput of a laptop 4070; the 10 to 30 times I had in my head
would take H100-class cards, which nobody has tried yet. **The extra memory doesn't make the
card faster. It removes the paging, and the paging was costing less than I assumed.**

## What an hour of video costs

My next question was the one that decides whether this is useful: "how much will it cost me in
the future per 1 hour of video generated?" The session worked it out from the tuned timings,
including the 7 to 20 seconds each new prompt spends on text encoding. Turn the dials:

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
<figcaption><b>Plain clips, a new prompt each, no idle time</b><span class="ao-meta">Per hour of finished video: tuned L40S ~7 GPU-hours at 736×416, ~19 at 1344×768; laptop 18-27 and 61-67 hours (session notes, 17 Oct). Not counted: ~8 min and ~$0.15 to boot each pod. Example: 10 min at 1344×768, 2 takes = 6.3 GPU-hours, $6.90; the laptop, 20 to 22 hours.</span></figcaption>
</ao-calc>

Latent-stitched chains, where each 6-second segment continues the last one's motion, cost
more: about $16 per hour of video at 736×416 as measured, and an estimated $44 at 1344×768,
which wasn't measured.

## The first real job

Then the cloud got real work instead of benchmark clips. Another session was making a new cut
of my music video for "Moonlight at the Waterline," on the laptop, and I told the Runpod
session to take its renders: "if he can generate everything that he needs in under $10, then
let him generate everything he needs." The music-video session sent shot lists as JSON; the
Runpod session rendered them, copied each file to the exact path asked for, and replied with
seconds and peak memory per item. Retakes came back within minutes.

One L40S, 2 hours 8 minutes, 9:57 pm to just past midnight: 37 video clips at 1344×768 (7 of
them retakes), 8 chain segments, 22 Qwen-Image 2.1 images and 2 upscales, for $2.44. A clip
cost about 0.75 to 0.8 seconds of L40S per frame, roughly a quarter of the laptop's. One
mistake cost real minutes: images and video took turns on the same pod, the two models didn't
fit in its memory cap together, and each switch back to video spent about four minutes
reloading. The rule now is one model family at a time per pod.

Upscaling was the one job not worth renting for: 9.0 seconds on the L40S against 10 to 12 on
the laptop.

## The part I hadn't asked about

While the job ran I asked something that sounded like a small question: agents will render on
Runpod from several sessions at once, so will they fight over pods? The session that took it
found three collisions that would have hit the first time two agents rendered together:

- The connector that points my ComfyUI tools at a pod changes a setting shared by every
  session on the laptop. One agent connecting would have sent everyone's renders, local ones
  included, to its pod.
- Every pod wrote to the same folders on the shared volume, and the clean-up script deleted
  everything in the output folder, including another agent's clips. Runpod's own docs say
  writing to one volume from several pods at once can corrupt it.
- My laptop's GPU queue was reserving the laptop for commands that ran on a pod.

Now each agent gets its own pod, named after its session, writing to its own folder, and a
guard refuses to stop or terminate a pod another session owns. I also set a rule that night: "we
always clean up after ourselves when we are done so we should never leave the images/videos in
the runpod storage." The volume keeps models and scripts, nothing else.

I asked for a 5090 because the number on the card was big. What the night actually taught was
duller: the speed was in two flags my laptop already had, and the risk was in agents sharing
things nobody had thought of as shared.
