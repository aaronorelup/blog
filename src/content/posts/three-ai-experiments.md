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
- **The same training run by Claude Fable 5.2, with a model that learns.** A small network learns
  609 old fiddle tunes and improvises while it trains. It gets 56% of the next notes right on
  tunes it never saw, bends for six and a half minutes after 20:00, then falls apart at 26:32.
  Your browser can redo the whole run and check it.
- **A lesson that has to prove itself.** An orbit lesson set on the Moon runs seven physics checks
  in your browser and stays locked until they pass. A deliberately broken copy showed two of the
  first checks could never fail.
- **The same lesson by Claude Opus 5.5, playable right here.** Nine checks run before you can
  throw, five broken engines show each one can fail, and it found Gages's landing distances about
  a kilometre long.
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

## A training run you can hear: Gages's version

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

## A training run you can hear: Fable 5.2's version

Gages's orchestra can only ever play its one tune. So I gave the same idea to Claude Fable 5.2 and
asked for a model that learns music, plays some it was never shown, and still breaks at 20:00 for
a real reason. **It did all three.** Its player is a small neural network that learns from 609 old
fiddle tunes in jig time to bet on the next note. On 68 tunes it never saw, it gets 56% of the
next notes right. At 20:00 its step size goes past what it can take. It bends for six and a half
minutes, then falls apart at 26:32.

<ao-listen ref="alone">
<figure data-id="programme"><audio controls preload="none" src="/media/three-ai-experiments/fable-training-run.mp3"></audio><img src="/media/three-ai-experiments/fable-training-run-strip.webp" alt="A strip of the model's bets over the programme: an even haze of every note at the start, clear bands on the notes of one key by the middle, a red line at 20:00, thinning bands after it and only scattered single dots at the end, while the error line under it shoots up" loading="lazy"><figcaption><b>The programme</b><span class="ao-meta">at 20:00 the step size is set to its limit, then climbs 2% a note</span></figcaption></figure>
<figure data-id="alone"><audio controls preload="none" src="/media/three-ai-experiments/fable-training-run-left-alone.mp3"></audio><img src="/media/three-ai-experiments/fable-training-run-left-alone-strip.webp" alt="The same strip with nothing changed at 20:00: the bands carry on in a regular pattern to the end and the error line stays flat" loading="lazy"><figcaption><b>Left alone</b><span class="ao-meta">the same model and the same data, and the step size never changes</span></figcaption></figure>
<figure data-id="x3"><audio controls preload="none" src="/media/three-ai-experiments/fable-training-run-held-3x.mp3"></audio><img src="/media/three-ai-experiments/fable-training-run-held-3x-strip.webp" alt="The same strip with the step size held at three times the limit: a short spike in the error line right at 20:00, then the bands and the line settle again a little higher" loading="lazy"><figcaption><b>Held at 3 times the limit</b><span class="ao-meta">worse than guessing for 6 notes at 20:00, then it heals itself</span></figcaption></figure>
<figure data-id="x10"><audio controls preload="none" src="/media/three-ai-experiments/fable-training-run-held-10x.mp3"></audio><img src="/media/three-ai-experiments/fable-training-run-held-10x-strip.webp" alt="The same strip with the step size held at ten times the limit: the bands turn into scattered single dots right at 20:00 and the error line jumps to the top and stays there" loading="lazy"><figcaption><b>Held at 10 times the limit</b><span class="ao-meta">gone one step after 20:00</span></figcaption></figure>
<figcaption><b>Four endings of one training run, 30:00 in 90 seconds</b><span class="ao-meta">top: the model's bets on each note (blue) and the note it picked (orange) · bottom: its error on tunes it never saw · red line: 20:00 · the first 60 seconds are the same in all four, so jump to 20:00 and switch</span></figcaption>
</ao-listen>

Or train it yourself. This page redoes the whole run in your browser in about a minute, plays it
while it trains, and lets you choose what happens at 20:00.

<ao-game src="/labs/training-run/" poster="/media/three-ai-experiments/fable-training-run-lab-poster.webp" size="about 130 KB" label="A training run you can hear, trained in your browser" aspect="1/1" note="Press Play inside it, with the sound on. It trains for about a minute while it plays. Then pick another push at 20:00."><a href="/labs/training-run/"><img src="/media/three-ai-experiments/fable-training-run-lab-poster.webp" alt="The training page after a run: the model's bets across the whole programme with a red line at 20:00, the error line shooting up near the end, and controls for the step size at 20:00" loading="lazy"></a></ao-game>

- **Every sound is the model at that moment.** At each note it gives every possible next note a
  probability, picks one, then trains some more. The pick is plucked on a music box, harder the
  surer it was. Under it a soft pad plays every note at once, each as loud as its probability. So
  it opens as all the notes at once and thins out as the model makes up its mind.
- **You can hear it learn.** By 04:27 it beats a table that only counts which note usually follows
  which. By 06:36, 95% of its bets are in the key of D. By 08:49 it gets every second note right
  on tunes it never saw. Between 10:00 and 20:00 it plays one note out of 136 outside the key.
  Nobody told it what a key is.
- **"Music it was never shown" holds up two ways.** The 68 test tunes were kept out of training,
  and a near copy of another tune couldn't be picked as one. It gets 56% of their next notes
  right, where that table gets 27% and guessing gets 3%. And what it improvises is its own. The
  longest run it shares with any training tune is 8 notes. A typical real tune it never saw
  shares 11.
- **The break is measured, not staged.** At 20:00 the script measures how sharply the error
  curves, which sets the biggest step the model can take and stay stable. That limit was 0.98,
  and the step size (the learning rate) had been 0.30. It's set to the limit and then climbs 2%
  a note. Four steps later the error on unseen tunes is up 15%. Nothing else changes. "Left
  alone" is the same model on the same data.
- **It bent before it broke.** Gages's mixer is one smooth bowl, so past its limit it can only
  blow up. A network can move. By 25:00 this one had cut its own sharpness in half, which doubles
  its own limit, and it kept playing in key while it got worse. At 6.4 times the old limit it ran
  out of room. By 27:22 its error was 30 times worse than guessing. It's still in D, it's 100%
  sure of nearly every note, and it's right one time in ten.
- **Pushed all at once, it ends differently.** Held at 3 times the limit, it's worse than guessing
  for 6 notes and then heals itself. Held at 10 times, it's gone after one step. Both are clips
  above.
- **Your browser can redo the run and check it.** The page above trains the same model from the
  same starting point and compares every number with the published run. In Chrome all 6,144
  training steps and all 432 notes came out identical, digit for digit, so you don't have to take
  the numbers on trust. It was only checked in Chrome. If your browser disagrees, the page shows
  the first number that differs.
- **What's real and what's designed.** Real: every note, how hard it's plucked, the pad, the
  error, the limit and the collapse. Fable didn't place one of them. Designed: the music-box
  sound, the tempo, how the training steps are spread over the clock, and the choice to push at
  20:00 by 2% a note.
- **Next to Gages's.** His has 608 volume knobs, one tune and 190 training steps. This one has
  47,840 weights, 609 tunes and 6,144 steps. His got cleaner for four minutes before it blew up.
  This one got worse within four steps and took six and a half minutes to go.
- **Fable can't hear.** It checked the sound by drawing it and measuring how loud it was. Nobody
  had listened to it when this went up.

<figure><img src="/media/three-ai-experiments/fable-training-run-chart.webp" alt="Three charts on one programme clock with a red line at 20:00. Top: the model's bets start as an even haze over every note, settle onto the notes of D major, and end as scattered single dots. Middle: the error falls from 3.47 to 1.36 by 20:00, wobbles upward, then jumps past 100 after 26:32 while a grey line for the run left alone stays flat. Bottom: the step size against its own limit creeps from 0.05 to 0.3 times, jumps to 1 at 20:00 and keeps climbing" loading="lazy"><figcaption><b>The whole run on the programme clock</b><span class="ao-meta">top: what it believes and what it plays · middle: its error on tunes it trains on and on tunes it never sees · bottom: its step size against its own limit, measured again at every note</span></figcaption></figure>

<details><summary>The numbers, by the programme clock</summary>

| Programme clock | Training steps so far | Step size vs the limit at 20:00 | Step size vs the limit right then | Error on unseen tunes | Next notes right |
|---|---|---|---|---|---|
| 00:00 | 0 | 0.31x | 0.05x | 3.47 | 0% |
| 02:34 | 13 | 0.31x | 0.10x | 2.62 | 31% |
| 04:27 | 66 | 0.31x | 0.16x | 2.00 | 40% |
| 08:49 | 514 | 0.31x | 0.16x | 1.56 | 50% |
| 15:00 | 2,531 | 0.31x | 0.20x | 1.45 | 53% |
| 19:56 | 5,938 | 0.31x | 0.29x | 1.37 | 56% |
| 20:00 | 6,000 | 1.00x | 1.00x | 1.36 | 56% |
| 20:17 | 6,004 | 1.08x | 1.25x | 1.56 | 51% |
| 22:34 | 6,037 | 2.08x | 2.49x | 2.20 | 43% |
| 25:00 | 6,072 | 4.16x | 2.22x | 2.34 | 41% |
| 26:15 | 6,090 | 5.94x | 3.20x | 2.38 | 39% |
| 26:32 | 6,094 | 6.43x | 5.08x | 3.55 | 28% |
| 27:22 | 6,106 | 8.16x | 16x | 103 | 9% |
| 29:56 | 6,143 | 17x | not measurable | 325 | 14% |

The error is the usual training score (cross-entropy), and 3.47 is what guessing among the 32
choices scores. A "note" here is one eighth-note slot, which holds a pitch, a hold of the last
pitch or a rest. The limit is 2 divided by the sharpness, the steepest curve of the error. Before
20:00 nobody touches the step size, and the model walks toward its own limit anyway, from 0.05 to
0.29 times it, because its sharpness grows as it learns. At 25:00 the two limit columns disagree
because the model had flattened itself out. Every note is in
[one file](/media/three-ai-experiments/fable-training-run-notes.csv) and all 6,144 training steps
are in [another](/media/three-ai-experiments/fable-training-run-steps.csv).

</details>

<details><summary>Other pushes, other random seeds, and what each input is worth</summary>

From the same 20:00 state, with the step size held at one level until 30:00:

| Held at | Worst error | Notes worse than guessing, out of 144 | Error at the end |
|---|---|---|---|
| 0.31x (left alone) | 1.37 | 0 | 1.36 |
| 0.8x | 1.44 | 0 | 1.39 |
| 1x | 1.56 | 0 | 1.42 |
| 1.5x | 2.53 | 0 | 1.48 |
| 2x | 4.02 | 2 | 1.53 |
| 3x | 6.67 | 6 | 1.58 |
| 4x | 32 | 77 | 2.83 |
| 5x | 72 | 142 | 8.39 |
| 10x | 243 | 143 | 67 |

There's no cliff at exactly 1x. The damage grows smoothly, it heals up to 3x, and from 5x it never
comes back. Climbing slowly it lasted until 6.4x, because it had time to flatten out on the way.

Six reruns of the whole programme with different random numbers fell apart at 25:46, 26:03, 26:19,
26:19, 26:32 and 26:40, so the time isn't placed. All six stayed in key before 20:00, with at most
one stray note in 144.

Without its memory of what it played 4 and 8 bars ago it gets 46% of next notes right, not 56%.
Without the beat and bar counter, 53%. With one bar of context in place of two it gets 57%, so
that part was over-built.

The tunes come from four collections printed between about 1780 and 1903: O'Neill's Music of
Ireland, Aird's Airs, Ryan's Mammoth Collection and two small folk books. 1,246 of their tunes are
in 6/8. 677 were left after keeping the major-key ones that fit an eighth-note grid, moving them
all to D and dropping repeats.

</details>

<details><summary>How it was made, and how to make your own</summary>

- **Who made it:** Claude Fable 5.2 on effort max, UltraCode off, in one Claude Code session with no helper agents. It built and ran the experiment, made the sound and the pictures, wrote this section and published it.
- **My prompt** (condensed): "Make a piece where a real optimisation run is audible. Every moment you hear is the model's actual current state, not a composed imitation. The programme is 30:00 compressed to about 90 seconds, and it breaks at 20:00 because something real in the training goes wrong, like the learning rate pushed past its stability limit. Gages's version couldn't play music it was never shown, and it was a mixer, not a model. Close those gaps, keep the break real and auditable, and say plainly what is real and what is designed."
- **What broke on the way:** the first tune filter threw out 893 of 1,246 tunes because it misread pickup notes. A bug in a test script made the model look stuck on one note when it wasn't. The first plan for 20:00 was one jump to 3 times the limit, and the model just healed, so the push became a climb. In a test where the playback caught up with the training, the browser page stopped and started at every bar, until it was made to wait for four bars at a time.
- **Time and cost:** about an hour and three quarters from the brief to the last push. The run, the sound and this section went up after an hour and a quarter, and the page you can play took the rest. The run is 6,144 training steps. They take about 25 seconds on one processor core, and the whole run takes about a minute in a browser with the scoring and the sound. Measuring the sharpness at all 432 notes takes 7 minutes. The session can't see its own token count, so there's no cost figure.
- **Recipe:** get melodies as notes (music21, a Python library, reads ABC, MIDI and MusicXML files). Put them on a grid of eighth notes, move them all to one key and hold some out. Train a small next-note network with plain gradient descent. At every note, save its probabilities and the note it picks. To break it, measure the sharpness, set the learning rate to 2 divided by it, and keep raising it. Then play the picks as plucks and the probabilities as a pad.
- **To try it on your own content:** swap in any folder of tunes in one time signature, like hymns, game music or your own songs. The trainer, the synth and the page are about 1,300 lines of plain JavaScript with no libraries, and every file is linked at the bottom of the page you can play above, with the scripts that turn a folder of tunes into its data. ffmpeg makes the MP3s.

</details>

## A lesson that has to prove itself: Gages's version

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

## A lesson that has to prove itself: Opus 5.5's version

Gages's lesson is only screenshots, and it never says where the ball lands. So I gave the same
idea to Claude Opus 5.5 and asked for one you can play right here. **It works on a phone too, and
each of its nine checks is shown failing against a deliberately broken engine.** It also found
that Gages's landing distances are each about a kilometre too long.

<ao-game src="/labs/moon-orbit/" poster="/media/three-ai-experiments/opus-orbit-lesson-poster.webp" size="about 30 KB" label="The Moon orbit lesson by Claude Opus 5.5" aspect="1/1" note="Tap a digit to pick the step, then minus and plus. Keys: arrows change the speed, space throws."><a href="/labs/moon-orbit/"><img src="/media/three-ai-experiments/opus-orbit-lesson-poster.webp" alt="The orbit lesson: its physics checks all passed on the left, a ball circling just above the Moon on the right, the speed set to 1.6800 km/s" loading="lazy"></a></ao-game>

- **The hook holds, to within a kilometre.** From 1 km up, 1.67 km/s lands 558.0 km away and
  1.68 km/s never lands, because orbit speed there is 1.6794 km/s. 558.0 came out the same three
  ways, from the exact orbit formula in 40-digit math, a separate simulator in Python and the lesson.
  Gages's 61, 186 and 559 km are each about 1 km long. Its simulator stopped at the first whole
  second underground, and none of its seven checks looked at a landing.
- **Every check can fail, and that's tested, not assumed.** Opus made five broken copies of the
  engine with one mistake each: the textbook Euler step, a flat Moon, gravity that never weakens
  with height, landing one step late, and a typo in the Moon's mass. Every check fails on at least
  one of them. One of Gages's seven checks (just under escape speed comes back) never failed.
- **A typo passes every law of physics.** Type the Moon's gravity as 4092.8 instead of 4902.8 and
  the engine is still perfect physics, for a lighter Moon. Eight checks pass. Only the ninth catches
  it, because it compares the Moon with NASA's numbers, a gravity of 1.62 m/s² and the 113-minute
  lap of its Lunar Reconnaissance Orbiter 50 km up. That's the gap Gages pointed out above, and
  one check against the real world closes part of it.
- **The first engine wasn't exact enough.** Plain velocity Verlet, the step method Gages used, in
  half-second steps, put a 1.6791 km/s throw 861 m long. Opus switched to Yoshida's version, three
  Verlet steps of odd sizes with one of them backwards. It's within 11 cm for less work, and it's
  what you're playing.
- **It says what it leaves out.** This Moon is a smooth ball, but the real one has peaks almost
  11 km high, so a ball skimming 1 km up would hit one. It also leaves out the Moon's lumpy gravity,
  Earth past 60,000 km and the Moon turning. All of it is listed under the checks.

<details><summary>Every check against every broken engine</summary>

| Check | Real engine | Euler steps | Flat Moon | Same pull at every height | Lands a step late | Typo in the Moon |
|---|---|---|---|---|---|---|
| Lands where the exact math says | pass | fail | fail | fail | fail | pass |
| Orbit speed stays 1 km up | pass | fail | fail | fail | pass | pass |
| Comes back around on time | pass | fail | fail | fail | pass | pass |
| Energy doesn't leak | pass | fail | fail | fail | pass | pass |
| Equal areas in equal times | pass | fail | fail | pass | pass | pass |
| Bigger orbits take longer, by the right amount | pass | fail | fail | fail | pass | pass |
| Escape speed is a hard line | pass | fail | fail | fail | pass | pass |
| Runs backwards into your hand | pass | fail | pass | pass | pass | pass |
| It's the real Moon | pass | fail | fail | fail | fail | fail |
| **Checks failed** | **0 of 9** | **9** | **8** | **7** | **2** | **1** |

What the real engine measured: 1.67 km/s lands 557.98 km away, and the formula says 557.98. A lap
at orbit speed stays within a millimetre of 1 km up and takes 108.40 minutes, as Kepler says.
Energy holds to 1 part in 255 billion over ten laps. A ball dropped from 10 m falls at 1.62 m/s²,
and a lap 50 km up takes 113.0 minutes. All nine take 0.04 seconds of computing in Chrome, and
0.19 seconds with the processor slowed six times to act like a slow phone.

The lesson's "Break the engine" box makes this same table in your browser, from the same code.

</details>

<details><summary>How it was made, and how to make your own</summary>

- **Who made it:** Claude Opus 5.5 on its highest effort setting, UltraCode off, in one Claude Code session with no helper agents. It built the lesson, checked the numbers, wrote this section and published it.
- **My prompt** (condensed): "Build an interactive lesson about orbits on the Moon that you can play in the blog itself: throw a ball sideways, faster and faster, until it never lands. Before the controls work, run physics self-checks in the reader's browser and stay locked if any fail. Prove every check can fail with a deliberately broken twin. Verify the 559 km yourself. State the model's limits honestly."
- **What broke on the way:** the first engine (plain Verlet) was 861 m off near orbit speed. The typo copy first failed four checks for the wrong reason, because the test throws were sized for the real Moon and on a lighter Moon a 2 km/s throw nearly escapes. Testing in a headless browser caught a "NaN days" flight time and a camera that framed everything too low.
- **Time and cost:** about an hour from the brief to the push, with one engine thrown away. The session doesn't show its own token count from the inside, so there's no cost figure.
- **Recipe:** plain JavaScript files, no libraries: the engine, the exact formulas, the checks and the page. Each check flies the engine and compares it with something the engine didn't compute: an exact formula, a law that has to hold, or a published number. Then make one broken copy for each mistake you're worried about, and run every check on every copy. A check that no copy can fail gets fixed or cut.
- **To try it on your own content:** anything that calculates can do this, like a budget sheet, a recipe scaler or a game's damage numbers. Write down what it must get right, test it before anyone touches it, and keep the broken copies so the test can be run again.

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
