---
id: "AO-087"
title: "Three AI experiments: a training run, a lesson and a TV film"
summary: "My Grok Bot agent found the most interesting things people are making with Fable 5.2 and Opus 5.5, then tested three of them: music made by a real training run, a lesson that checks its own physics, and a TV film."
date: 2026-11-21
topic: "video"
project: []
draft: false
preview:
  verdict: "All three worked"
  takeaway: "A real training run makes listenable music, a lesson can refuse to open until its physics pass, and a film can break because its data breaks. No AI model calls."
  points:
    - "Pushed past its limit at 20:00, the music got cleaner for about four minutes before it fell apart."
    - "Two of the lesson's first six self-tests could never fail. A deliberately broken version caught that."
    - "2,142 film frames rendered in 128 seconds in a browser, on a computer with no graphics card."
  image: "/media/previews/three-ai-experiments.webp"
  loop: "/media/previews/three-ai-experiments.mp4"
  alt: "An old TV in a dark wallpapered room showing a painted landscape, a floor lamp and a wall clock beside it"
---

I asked Gages, my Grok Bot agent, to go find the most interesting things people are making with
Claude's newest models, Fable 5.2 and Opus 5.5, read through my blog for ideas, then actually try
the best ones and write them up. It picked three and built all of them in one sitting on its own
cloud computer. **All three worked, and none of them needed an AI model to run.** Gages wrote
the code itself, so no Claude, Opus or Fable was used and there was no bill.

- **A training run you can hear.** A tiny orchestra learns a tune from noise by real gradient
  descent, the same math that trains AI models. At 20:00 of a 30-minute programme, the way
  [my AI TV series](/courses/i-love-my-evening-television/) breaks at twenty minutes, it gets
  pushed past its limit. It sounded best right before it fell apart.
- **A lesson that has to prove itself.** An orbit lesson set on the Moon runs seven physics checks
  in your browser and stays locked until they pass. A deliberately broken copy showed two of the
  first checks could never fail.
- **The Quiet Hour.** An 89-second film of an old TV in a dark room, where everything on screen
  is driven by the training run's numbers. It breaks because the data breaks, not because a
  script says so.

## Where the ideas came from

The most-liked Fable 5.2 post this month is
[a symphony shaped like a training run](https://x.com/imjustnewatai/status/2120383964686729410)
(9,667 likes). The orchestra starts as noise and learns the key, rhythm and tune. One of the
[Opus 5.5 Build Day demos](https://claude.rich/demos) is a chess engine that runs a self-test
before it lets you touch the board. And most of Fable's films are web pages rendered one frame at
a time, like [Riley Brown's *The Edge*](https://repoquarry.dev/blog/riley-brown-the-edge-claude-fable-5-2-blender).
Each one lined up with something I already do: the twenty-minute break in my series,
[checking every chess board in Touch Move](/ledger/touch-move/), and
[my interactive lessons](/courses/the-hidden-curriculum/).

## A training run you can hear

From the clip alone you can't tell if the "learning" is a real optimiser or a composed piece that
sounds like one. So this version can't be faked. The orchestra is 37 pitched voices plus one
noise voice, each with a volume knob per note. It never sees the notes, only the sound of the
target tune. Every bar you hear is the orchestra playing its current knobs. 30 minutes of
programme is squeezed into 89 seconds.

<figure><audio controls preload="none" src="/media/three-ai-experiments/training-run.mp3"></audio><img src="/media/three-ai-experiments/training-run-spectrogram.webp" alt="Spectrogram of the 89-second piece with a red dashed line at 20:00. Below it the error falls slowly, dips after 20:00, then shoots up after 25:00 while the share of sound on the right notes collapses" loading="lazy"><figcaption><b>The whole training run, 30:00 in 89 seconds</b><span class="ao-meta">top: the sound · bottom: the error (yellow) and the share of sound on the right notes (blue)</span></figcaption></figure>

- **It does start as noise and learn.** By 11:36 the loudest voice on every note is right, but
  only 14% of the sound is on the right notes. The rest of the programme is the noise fading out.
- **The break is the best part, and nobody planned it.** At 20:00 the learning rate (how big a
  step it takes each time) ramps to 2.4 times the most it can take and stay stable. Bigger steps
  finish the slow parts first, so the tune is perfect at 23:13. Meanwhile one direction flips
  every step and grows almost 4 times bigger each time. You can't hear it until 26:00, and by
  27:05 only 4% of the sound is the tune.
- **It took two tries.** The first version learned the whole tune in 2 steps, so there was nothing
  to hear. Slowing it down 15 times fixed that.
- **One part of the original claim isn't here.** The Fable piece "plays music it was never
  shown". This one can't. Every knob belongs to one note of one tune.

<details><summary>The numbers, bar by bar</summary>

| Programme clock | Steps so far | Step size vs limit | Sound on the right notes |
|---|---|---|---|
| 00:00 | 1 | 0.03x | 2% |
| 10:38 | 16 | 0.03x | 10% |
| 15:29 | 58 | 0.03x | 45% |
| 19:21 | 160 | 0.03x | 85% |
| 21:17 | 166 | 0.50x | 91% |
| 23:13 | 172 | 2.40x | 100% |
| 26:07 | 181 | 2.40x | 45% |
| 27:05 | 184 | 2.40x | 4% |

The training itself is 0.08 seconds of computer time. The error went up about a million billion
times between 24:00 and the end.

</details>

<details><summary>How it was made, and how to make your own</summary>

- **Who made it:** Gages, my Grok Bot agent, in one session. No Anthropic models: no Claude, Opus or Fable calls, UltraCode off, no reasoning level set.
- **My prompt** (said out loud, condensed): "Search the web for cool, novel things people are doing with Opus 5.5, Fable 5.2 and other recent models. Look at my blog posts, images included, for ideas to extend. Pick the strongest, actually try them, and write blog posts about the results. Drafts only."
- **Recipe:** pick a short tune and render it to audio. Give a bank of pitched voices plus one noise voice a volume per note. Run plain gradient descent (numpy) on the gap between their sound spectrum and the tune's. Play the current volumes after every few steps and join the bars into one file. To make it break, raise the step size past 2 divided by the loss's steepest curvature and hold it there.
- **To try it on your own content:** swap in any melody you like. Python, numpy and ffmpeg are all it needs, and it runs in under a second.

</details>

## A lesson that has to prove itself

The lesson puts you on the Moon, like Noor in [Earthlight](/ledger/earthlight/). Throw a ball
sideways. Faster and it lands farther away, and at one speed it never lands. Before the slider
works, the page tests its own simulator: energy stays the same over 10 orbits, orbits take as
long as Kepler's formula says, just over escape speed never comes back, and the same code gets
the real Moon's month right. All seven pass in about a tenth of a second.

<div class="gallery-280">
<figure><img src="/media/three-ai-experiments/lesson-open.webp" alt="The lesson open: seven green checks on the left and a ball orbiting just above the Moon on the right" loading="lazy"><figcaption><b>The real simulator</b><span class="ao-meta">7 of 7 checks pass · open</span></figcaption></figure>
<figure><img src="/media/three-ai-experiments/lesson-locked.webp" alt="The same lesson with the broken simulator: six red checks and the gate locked" loading="lazy"><figcaption><b>A deliberately broken copy</b><span class="ao-meta">6 of 7 fail · stays locked</span></figcaption></figure>
</div>

- **The checks needed checking.** Gages loaded a copy with a worse simulator, one that leaks
  energy into every orbit. Two of the first six checks still passed. One used the textbook
  formula instead of the simulator, so it could never fail. Its replacement couldn't fail either,
  because it counted the launch point as the closest the ball came back. Both are fixed. Without
  the broken copy, three green ticks would have shipped that could never turn red.
- **It can't catch what nobody wrote down.** The checks test the code against its own model, not
  the real world. A throw near escape speed climbs past 100 Moon radii, way past where Earth
  would pull it away, and every check is happy with that.
- **The lesson itself is a cliff, not a curve.** Thrown from 1 km up, 1.20 km/s lands 61 km away
  and 1.67 km/s lands 559 km away. At 1.68 km/s it never lands.

<details><summary>How it was made, and how to make your own</summary>

- **Who made it:** Gages, my Grok Bot agent, in one session. No Anthropic models: no Claude, Opus or Fable calls, UltraCode off, no reasoning level set.
- **My prompt** (said out loud, condensed): "Search the web for cool, novel things people are doing with Opus 5.5, Fable 5.2 and other recent models. Look at my blog posts, images included, for ideas to extend. Pick the strongest, actually try them, and write blog posts about the results. Drafts only."
- **Recipe:** one HTML file, no libraries. A small orbit simulator (velocity Verlet, a step method that keeps orbits stable) plus seven checks that run in the browser on page load. The controls stay disabled until every check passes. Headless Chrome (Puppeteer) loads it twice, once with a deliberately broken simulator, to confirm the checks turn red.
- **To try it on your own content:** for any interactive lesson, write down the facts it must get right, test the simulation against them before the learner can touch it, and ship a broken twin to prove each test can fail.

</details>

## The Quiet Hour

An old TV in a dark living room, built in Three.js (a library for 3D in a web page). The
programme on it, *THE QUIET HOUR*, is a painted landscape whose brushwork sharpens as the
orchestra learns. The static on screen is the orchestra's noise voice. After 20:00 the lamp turns
red, the sun stretches and the clock runs backwards as the step size climbs. When the error
explodes, the picture tears and the sun becomes an eye. The soundtrack is the training run.

<figure><video controls playsinline preload="metadata" poster="/media/three-ai-experiments/the-quiet-hour-poster.webp" src="/media/three-ai-experiments/the-quiet-hour.mp4"></video><figcaption><b>The Quiet Hour</b><span class="ao-meta">89 s · Three.js, rendered a frame at a time in a browser · sound on</span></figcaption></figure>

- **No graphics card needed.** A browser with no screen rendered 2,142 frames in 128 seconds,
  about 60 ms a frame, and never crashed.
  [My Fable cloud computers kept going down](/ledger/a-week-with-fable-5-2/) whenever agents
  opened a 3D page. I'd guess drawing one frame when asked is gentler than a live animation, but
  that wasn't tested.
- **The data wrote a better structure than a script would.** In the first cut nothing happened
  between 20:00 and 26:00, because the error was still falling. So the slow things follow the
  step size, which changes at 20:00, and the violent things follow the error, which explodes at
  26:00. You feel something's wrong six minutes before you see it.
- **It's a small scene.** The TV is boxes, the painting is three hills, and there's no story. It
  shows the idea, not an episode.

<figure><img src="/media/three-ai-experiments/the-quiet-hour-stills.webp" alt="Nine stills: the title card, the TV getting closer as the painted hills sharpen, the room slowly turning red after 20:00, and a last frame of a tilted red TV showing static and an eye" loading="lazy"><figcaption><b>Nine moments from the film</b><span class="ao-meta">left to right, top to bottom, from 0:02 to 1:27</span></figcaption></figure>

<details><summary>How it was made, and how to make your own</summary>

- **Who made it:** Gages, my Grok Bot agent, in one session. No Anthropic models: no Claude, Opus or Fable calls, UltraCode off, no reasoning level set.
- **My prompt** (said out loud, condensed): "Search the web for cool, novel things people are doing with Opus 5.5, Fable 5.2 and other recent models. Look at my blog posts, images included, for ideas to extend. Pick the strongest, actually try them, and write blog posts about the results. Drafts only."
- **Recipe:** a Three.js scene in one page that exposes a `renderFrame(t)` function instead of an animation loop. Every value on screen is read from the training run's log for that moment. Puppeteer drives headless Chrome with software WebGL, calls it once per frame at 24 fps and saves each frame, and ffmpeg joins the frames with the training-run audio.
- **To try it on your own content:** drive the scene from any log you have, like a game's score, an agent's token count or a week of weather, so what happens on screen is caused by real data.

</details>

<details><summary>What it all cost</summary>

| | Training run | Lesson | The Quiet Hour |
|---|---|---|---|
| AI model calls | none | none | none |
| Computer time | 0.08 s | about 0.1 s per check run | 128 s render, 6 s encode |
| Tries | 2 | 3 | 2 |

Gages wrote all of it with plain Python, one HTML file and Three.js. The research, the three
builds and the first drafts took about 20 minutes.

</details>

*Gages, my Grok Bot agent, found the ideas, built the three experiments and drafted this post.*
