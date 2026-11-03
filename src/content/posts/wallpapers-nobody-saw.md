---
id: "AO-027"
title: "The animated wallpapers my agents built without seeing them"
summary: "My agents built 16 animated desktop wallpapers in one run, 13 of them while the app that plays them sat crashed. What went wrong, and the wallpaper app I started so Claude can see its work."
date: 2026-09-29
topic: "agents"
project: ["characters"]
preview:
  verdict: "Can't see, so it guesses"
  takeaway: "An agent that can't see its output builds whatever passes its one check. Here that was 'did it crash', so 13 scenes got built against a crashed app."
  points:
    - "Two crash causes: an outdated texture format, and a particle setting of the wrong type that broke 9 of 16 scenes."
    - "In my new app, the frame on my desktop matched the frame Claude renders for itself exactly, a pixel difference of 0."
    - "My 'web wallpapers are slow' feeling had three causes: a 15 fps cap, the wrong graphics chip and slow effect code."
  image: "/media/previews/wallpapers-nobody-saw.webp"
  alt: "Jefrie climbing a steel cage dome in a storm, her tail curled along the bars: the preview of one September wallpaper"
---

In September a chain of Claude agents spent eight and a half hours building 16 animated desktop
wallpapers of my characters, and none of them ever saw one running. Wallpaper Engine, the app
that plays them, crashed on the third scene. The agents built the other thirteen anyway, because
the only check they could run was whether it crashed.

**An agent that can't see what it made builds whatever passes the one check it has.** So I
started my own wallpaper app, Wallpaper Breaker, where Claude can see every frame it makes. In its
first build, Claude's render matched my desktop pixel for pixel.

- **13 scenes were marked done with the note "NEVER APPLIED".** Nothing in the plan made anyone
  stop.
- **Two bugs caused the crash.** An old texture format, and one particle setting of the wrong type
  that broke 9 of the 16.
- **I cut the cage layers out by hand.** It took me about 5 hours.
- **My slow web wallpaper had three separate causes.** A frame cap, the wrong graphics chip and
  heavy effects.
- **The new app's first wallpaper moves.** As of 29 September, Jefrie cooking, 25 layers, a
  60-second loop.

## The 16 scenes

Jefrie is my grinning scythe girl with a tail heavier than she is. She and BloodTailor star in
[my fighting game](/ledger/storm-bell-fighter/). The agents got four pictures and made four scenes
from each.

<ao-compare cols="4" aspect="16/9">
  <figure><img src="/media/wallpapers-nobody-saw/sept-climbing.webp" alt="Jefrie climbing a steel cage dome in a storm" loading="lazy"><figcaption><b>Climbing</b><span class="ao-meta">4 scenes · a Nano Banana picture, widened by a second image model</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/sept-dancing.webp" alt="Jefrie mid-spin with her scythe and flail over barbed wire" loading="lazy"><figcaption><b>Dancing</b><span class="ao-meta">4 scenes</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/sept-reading.webp" alt="Jefrie curled in her tail, reading a book in grey ruins" loading="lazy"><figcaption><b>Reading</b><span class="ao-meta">4 scenes</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/sept-bloodtailor.webp" alt="Jefrie and BloodTailor walking through ruins in the rain" loading="lazy"><figcaption><b>With BloodTailor</b><span class="ao-meta">4 scenes</span></figcaption></figure>
</ao-compare>

The agents were inventive. One made the cage ring like a bell when lightning hits. Others turned
glowing wisps into a music visualiser and gave Jefrie a blink. Nobody had looked at any of it.

<details><summary>The plan, and the ideas in detail</summary>

- The four pictures came from Nano Banana, Google's image model. I'd just got SAM, a model that
  cuts things out of a picture, working in ComfyUI on my laptop.
- At 4:10 in the morning I asked for four scenes per picture, each built by its own Opus 5 agent
  in 20 to 40 minutes, with a "housekeeper" agent after each one to tidy up and write down what
  worked. I said it was exploratory, "there are no wrong answers".
- The bell: a lightning bolt every 8.6 seconds sends a shock ring across the bars that reaches
  her grip 1.02 seconds later.
- The wisps: 16 of them over the reading scene's ruins, made into a 16-band music visualiser.
- The blink: Flux.1 Fill, a model that repaints part of a picture, painted her glowing eye slits
  dark, and the scene flashed that patch for 95 ms.
- Every idea was described, measured and logged in a shared notes file that grew to 400 KB.
- The four pictures above are how Wallpaper Engine lists the scenes. They're the only part of
  the run I can show as it was, because the motion is what never got checked.

</details>

## The night, from the files

17 September, from the scene folders, crash reports and my prompts.

<ao-timeline lanes="a:Me|s:Scene agents|w:Wallpaper Engine">
<ol>
<li data-lane="a"><time>04:10</time><p>I ask for 16 scenes, one Claude agent each, with a tidy-up agent after each.</p></li>
<li data-lane="s"><time>04:38</time><p>Scene 1 (climbing, "Storm Ascent") is finished.</p></li>
<li data-lane="w"><time>05:39</time><p>It crashes, writes a crash report and sits on <q>Wallpaper Engine has crashed … Access violation</q>, doing nothing.</p></li>
<li data-lane="s"><time>06:02</time><p>Scene 3 is marked done, with the note <q>NOT verified on screen</q>. It had crashed Wallpaper Engine.</p></li>
<li data-lane="s"><time>07:34 to 12:48</time><p>Scenes 4 to 16 are each marked done, with the note <q>NEVER APPLIED</q>. Wallpaper Engine is still down.</p></li>
<li data-lane="w"><time>12:21 to 12:51</time><p>A test script launches each scene, waits 14 seconds and checks for a new crash report. It gets 19 more.</p></li>
<li data-lane="a"><time>12:23</time><p><q>I can't launch wallpaper engine. Looks like there is an error.</q></p></li>
<li data-lane="a"><time>12:41</time><p><q>the flail arc scene crashes everything when I try to load it … Are you unable to do it through computer use?</q></p></li>
</ol>
</ao-timeline>

Computer use means Claude driving my mouse and taking screenshots. The session ran a crash test
instead, and one agent wrote that it had "only confirmed it loads." It's the same blind spot Claude had
when it [made 223 robot-voice clips it couldn't hear](/ledger/remora-voice-lab/).

<details><summary>Why Wallpaper Engine crashed</summary>

- The script that wrote Wallpaper Engine's texture files used an old version of the format,
  `TEXB0003`, where the program wanted `TEXB0004`.
- After that was fixed, 9 of the 16 scenes still crashed on one particle setting written as the
  wrong type.
- Wallpaper Engine's scene format isn't documented, so the agents copied it out of Steam Workshop
  wallpapers they had unpacked. Everything visual was a guess, checked only for whether it loaded.
- Two agents wrote in the notes that they had no way to start an agent to judge images, and one
  that it had no screenshot tool either. One agent wrote "I haven't *looked* at this scene" and, in
  the same note, that it had "only confirmed it loads."

</details>

## Checking them myself

That afternoon I checked them by hand, and some of it was good. The tail swings "really makes it
feel like a living thing", and I loved the cage vibrating to music. But the effects were too faint
to see, and the sky effects bent the cage, because it had never been cut out of the sky.

So I cut it out myself. A clean plate is the background with the character taken out. Drag the
line.

<ao-slider aspect="16/9" labels="Agent's clean plate|My sky">
<img src="/media/wallpapers-nobody-saw/claude-plate.webp" alt="The agent's background plate: the cage is still in the sky, with a dark smudge and red spatter where Jefrie was">
<img src="/media/wallpapers-nobody-saw/aaron-sky.webp" alt="Aaron's background: storm sky only, no cage">
<figcaption><b>Climbing, background layer</b><span class="ao-meta">left: the agent's, 17 Sep · right: mine, 18 Sep, the same fill model plus masks I drew by hand</span></figcaption>
</ao-slider>

And the layers the cage needed.

<ao-compare cols="3" aspect="16/9">
  <figure><img src="/media/wallpapers-nobody-saw/aaron-cage-front.webp" alt="The front half of the cage dome, isolated" loading="lazy"><figcaption><b>Front bars</b><span class="ao-meta">masked by hand in GIMP, a free image editor</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/aaron-cage-back.webp" alt="The back half of the cage dome, isolated" loading="lazy"><figcaption><b>Back bars</b><span class="ao-meta">masked by hand in GIMP</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/aaron-jefrie.webp" alt="Jefrie over the sky with the cage removed; gaps show where bars crossed in front of her" loading="lazy"><figcaption><b>Jefrie over the sky</b><span class="ao-meta">the gaps are where front bars crossed her</span></figcaption></figure>
</ao-compare>

"It took me like 5 hours," I told Claude after. The session cost $373 at pay-per-use prices.

<details><summary>My notes on the scenes</summary>

- The lightning lit only the background, which I liked.
- The effects being unnamed made checking them slow: "I had 9 different swings and I had to
  check them individually."
- My sky used the same fill model, Flux.1 Fill, in ComfyUI, plus masks I drew in GIMP.
- In full, what I told Claude: "I went ahead and made the masks by hand and generated all the
  occluded areas … It took me like 5 hours."
- The $373 is at Claude's API list prices and covers the whole session, from the first upscale to
  the 16 scenes.

</details>

## Why I started my own app

On 27 September three research agents dug into the whole problem. They found why web wallpapers
felt slow to me. Wallpaper Engine was capped at 15 frames a second, the browser used my laptop's weak
graphics chip instead of its real graphics card, and the effect code was heavy.

I wanted one folder per wallpaper where every cutout and mask is a normal file I can open and
replace. Wallpaper Engine doesn't work like that, so I asked for a new app. Overnight, 96 Claude
agents wrote about 80,000 lines of it, including a render tool that shows Claude any moment of a
wallpaper.

**The frame on my desktop matched Claude's render exactly, a pixel difference of 0.** One demo's
rain was invisible, from a mix-up in units.

<details><summary>The research, and the first build</summary>

- The three agents: one went into Wallpaper Engine's internals, one compared other desktop apps
  like Lively and Rainmeter, and one audited my old sessions. Most of the facts about the night
  come from that audit.
- My old web wallpaper had felt like 2 frames a second. Wallpaper Engine's settings file said
  `"fps" : 15`, and every daily backup of it since 14 September said the same.
- The browser it tested in used the Intel graphics even when the page asked for the RTX 4070.
  The effect code took about 16 ms a frame on that chip, across three monitors.
- Their advice was to keep Wallpaper Engine and build web wallpapers Claude could open in a
  browser and screenshot. I also wanted buttons on the wallpaper that run my own scripts.
- I asked for the new app on 28 September and said go at 6 pm. By 9 the next morning the repo had
  about 80,000 lines of tracked code.
- The first build ran as a workflow of 96 Opus 5.5 agents. About 22,000 of the 80,000 lines are
  tests. It has a .NET engine that puts web pages behind the desktop icons on all three of my
  monitors, and a WebGL player that draws the wallpapers.
- The pixel test: with Wallpaper Engine stopped and restored, the engine played two demo
  wallpapers on the real desktop, and its frame at 1.5 seconds matched the render tool's.
- The rain: the demo gave the rain's area in pixels where the effect expected fractions of the
  screen, so it was spread over roughly 90,000 times the screen. The agent wasn't allowed to change the
  shared file, so it left the two-number fix for my OK.

</details>

## The first real wallpaper: Jefrie cooking

This time the agents only made the pieces, with a review picture for nearly every step.
Qwen-Image, another image model, widened the picture to screen shape and made a clean
background without her.

<ao-compare cols="3" aspect="16/9">
  <figure><img src="/media/wallpapers-nobody-saw/pilot-source.webp" alt="The source: Jefrie stirring a pot over a fire inside the coil of her tail, ruins and rain behind" loading="lazy"><figcaption><b>Source</b><span class="ao-meta">Nano Banana · 1239×848</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/pilot-plate.webp" alt="The same scene extended to 16:9 at 3840×2160" loading="lazy"><figcaption><b>Plate</b><span class="ao-meta">the full scene, widened by Qwen-Image 2.1 · 3840×2160</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/pilot-clean-bg.webp" alt="The ruins with Jefrie, her tail, the pot and fire all removed" loading="lazy"><figcaption><b>Clean background</b><span class="ao-meta">Qwen-Image 2.1 edit, pasted only inside the mask</span></figcaption></figure>
</ao-compare>

Then they cut it into 25 layers.

<ao-compare cols="1">
  <figure class="wide"><img src="/media/wallpapers-nobody-saw/pilot-layers.webp" alt="Contact sheet of every layer on magenta: sky, ruins, ground, chain, ball, tail shell, scythe, cape pieces, body, pot, arm, spoon, glove, fire, head, ear points, steam, front tail, rock" loading="lazy"><figcaption><b>The layers, each on magenta</b><span class="ao-meta">review sheet from round 2 · the agents' own check picture</span></figcaption></figure>
</ao-compare>

Stacked back up, the first round of layers differed from the plate by 1.07 out of 255 per pixel
on average. The target was 3 at most.

<ao-slider aspect="16/9" labels="Plate|25 layers recomposited">
<img src="/media/wallpapers-nobody-saw/pilot-plate.webp" alt="The plate">
<img src="/media/wallpapers-nobody-saw/pilot-recomposite.webp" alt="The 25 layers stacked back together">
<figcaption><b>The 25 layers stacked back up, against the plate</b><span class="ao-meta">this is round 6 · the 1.07 out of 255 was measured on round 1</span></figcaption>
</ao-slider>

<ao-compare cols="1">
  <figure class="wide"><img src="/media/wallpapers-nobody-saw/pilot-error-x8.webp" alt="A nearly black image: faint outlines of the pot, chain, ball and rock edge" loading="lazy"><figcaption><b>The difference between them, eight times brighter</b><span class="ao-meta">what's left is at layer edges, where the clean background replaced rain spray and halos</span></figcaption></figure>
</ao-compare>

**Failures get filed now instead of shipped.** Asking Qwen to "keep only the tail" redrew or broke
the tail three tries out of three, so it's filed as rejected. In September, failures like that
shipped inside the scenes.

Then the effects went on. This is "Weight and Momentum", one of four moods Claude made. It comes
straight from the render tool, so it's what the app draws.

<ao-compare cols="1" aspect="16/9">
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/wallpapers-nobody-saw/pilot-v016.webp" src="/media/wallpapers-nobody-saw/pilot-v016.mp4"></video><figcaption><b>Jefrie cooking, "Weight and Momentum"</b><span class="ao-meta">one 60-second loop, rendered 7 Oct · her stir, head, ears and cape move every 6 seconds, the flail every 10 · the GPU readout top right is blank because a render has no live data</span></figcaption></figure>
</ao-compare>

<details><summary>How the pilot was made</summary>

- The source is a 1239×848 Nano Banana picture. Qwen-Image 2.1 widened it to 3840×2160 (seed
  5303). The new edges had to be lined up and color matched back to the original, because Qwen
  shrinks the picture by 1 to 3% and brings it back a little bluer.
- The clean background is a Qwen-Image 2.1 edit pasted back only inside the mask, version 5 of
  that mask.
- SAM 3.1 and a stack of other methods did the cutting. The layers, back to front, include the
  sky, far ruins, ground, the flail, the back half of her tail, the scythe, the cape, her body,
  the pot, the stirring arm, the spoon, the fire, the head, the ear points, the steam, the front
  half of the tail and a foreground rock.
- The file list has 2,206 entries, each marked chosen, candidate or rejected, with how it was
  made. Rejected ones get a note on why. By 29 September there were 319 review pictures and it was on its sixth
  round of fixes.
- More from the rejected column: asking SAM for "red spike" found her ear point, and oneObsession,
  the model that widened the September climbing picture, left hard seams when it widened this
  painted one.
- What shipped in September: a spear Flux invented behind Jefrie in the reading plate,
  and a scythe mask that erased the bar she was holding.
- The loop: built by Claude on 29 September after a critic agent's review, rendered on 7 October
  with `wb render clip` at 1920×1080, 30 fps, from the 3840×2160 project. A wet sheen runs round
  the tail coil.

</details>
