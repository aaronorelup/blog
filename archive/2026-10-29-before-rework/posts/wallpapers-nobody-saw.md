---
id: "AO-027"
title: "My agents built 16 wallpapers overnight, and none of them ever saw one run"
summary: "In September a team of Opus agents built 16 animated wallpapers of my characters. Wallpaper Engine crashed at the third one, and they built the other thirteen anyway. So this week I started my own wallpaper app, and rule one is that Claude can see everything it makes."
date: 2026-09-29
status: "in-progress"
tags: ["claude-code", "agents", "comfyui", "wallpaper-engine", "lessons"]
series: ["agent-runs"]
preview:
  verdict: "If it can't see, it guesses"
  takeaway: "An agent that can't see its output builds whatever passes the one check it can run. Here that check was \"did it crash\"."
  points:
    - "The notes said \"never applied\" thirteen times in a row, written by careful agents. Nothing in the plan made anyone stop."
    - "Two crash causes: an old texture-file version, and a particle setting of the wrong type that broke 9 of 16 scenes."
    - "The new app's desktop frame matched Claude's render exactly, max pixel difference 0. One demo's rain is still invisible."
  image: "/media/previews/wallpapers-nobody-saw.webp"
  alt: "Jefrie climbing a steel cage dome in a storm, her tail curled along the bars: the preview of one September wallpaper"
---

On 17 September a chain of Opus 5 agents spent eight and a half hours building 16 animated
Wallpaper Engine scenes of Jefrie and BloodTailor for me. Not one agent ever saw a wallpaper
running. Wallpaper Engine crashed while the third scene was being applied, and the next
thirteen were built, "done", against a program that was sitting on its crash dialog the whole
time.

**An agent that can't see its output isn't building the thing you asked for. It's building
something that passes whatever check it can run.** Here, the only check was "did it crash".
So this week I started building my own wallpaper app, and the first line of its design doc is
that Claude must be able to see everything it makes.

## What I asked for

I had four Jefrie images from Nano Banana, and I'd just got SAM (a segmentation model that
cuts things out of a picture) working in ComfyUI. At 4:10 in the morning I asked for four
scenes per image, each built by its own Opus 5 sub-agent, with a "housekeeper" agent after
each one to tidy up and write down what worked. I told it the run was exploratory, "there are
no wrong answers", and that each scene should take 20 to 40 minutes.

These are the four images, as Wallpaper Engine shows them in its list. The previews are the
only part of the run I can show you as it was: the motion is what never got checked.

<ao-compare cols="4" aspect="16/9">
  <figure><img src="/media/wallpapers-nobody-saw/sept-climbing.webp" alt="Jefrie climbing a steel cage dome in a storm" loading="lazy"><figcaption><b>Climbing</b><span class="ao-meta">4 scenes · Nano Banana, outpainted with oneObsession</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/sept-dancing.webp" alt="Jefrie mid-spin with her scythe and flail over barbed wire" loading="lazy"><figcaption><b>Dancing</b><span class="ao-meta">4 scenes</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/sept-reading.webp" alt="Jefrie curled in her tail, reading a book in grey ruins" loading="lazy"><figcaption><b>Reading</b><span class="ao-meta">4 scenes</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/sept-bloodtailor.webp" alt="Jefrie and BloodTailor walking through ruins in the rain" loading="lazy"><figcaption><b>With BloodTailor</b><span class="ao-meta">4 scenes</span></figcaption></figure>
</ao-compare>

The agents were inventive. One made the cage a bell: a lightning bolt every 8.6 seconds sends
a shock ring across the bars that reaches her grip 1.02 seconds later. One hung 16 soul-wisps over
the reading scene's ruins and made them a 16-band music visualiser. One gave Jefrie a blink by having Flux.1 Fill
repaint her glowing eye slits dark and flashing that patch for 95 ms. Every one of these was
described, measured and logged in a shared notes file that grew to 400 KB.

None of it had been looked at.

## The night, from the files

The times below come from the scene folders, the crash dumps Wallpaper Engine wrote, and the
prompts I typed. Central time, 17 September.

<ao-timeline lanes="a:Me|s:Scene agents|w:Wallpaper Engine">
<ol>
<li data-lane="a"><time>04:10</time><p>I ask for 16 scenes, one Opus 5 agent each, a housekeeper after each.</p></li>
<li data-lane="s"><time>04:38</time><p>Scene 1 (climbing, "Storm Ascent") is finished.</p></li>
<li data-lane="w"><time>05:39</time><p>Crash dump. The process sits on <q>Wallpaper Engine has crashed … Access violation</q> at 0% CPU.</p></li>
<li data-lane="s"><time>06:02</time><p>Scene 3 is marked <q>done (built + installed; NOT verified on screen — it crashed WE)</q>.</p></li>
<li data-lane="s"><time>07:34 – 12:48</time><p>Scenes 4 to 16 are each marked <q>done (built + installed; NEVER APPLIED — WE still down)</q>.</p></li>
<li data-lane="w"><time>12:21 – 12:51</time><p>A probe script launches each scene, waits 14 seconds and checks for a new crash dump. 19 more dumps.</p></li>
<li data-lane="a"><time>12:23</time><p><q>I can't launch wallpaper engine. Looks like there is an error.</q></p></li>
<li data-lane="a"><time>12:41</time><p><q>the flail arc scene crashes everything when I try to load it … Are you unable to do it through computer use?</q></p></li>
</ol>
</ao-timeline>

The crash had two causes, found later. The script that wrote Wallpaper Engine's texture files
used an old container version (`TEXB0003` where the program wanted `TEXB0004`), and after that
was fixed, 9 of the 16 scenes still crashed on one particle setting written as the wrong type.
Wallpaper Engine's scene format isn't documented, so the agents copied it out of Workshop
wallpapers they had unpacked. Everything visual was a guess checked only for whether it loaded.

The agents weren't blind by choice, exactly. Two of them wrote in the notes that they had no
way to spawn an agent to judge images, and one that it had no screenshot tool either. One wrote, **"I haven't *looked* at this scene —
only confirmed it loads."** When I asked about computer use, the session chose the crash test
instead.

## What it looked like when I did look

That afternoon I went through the scenes by hand and dictated notes. Some of it was good. The
swings on the tail "really makes it feel like a living thing", the lightning lit only the
background, and I loved the cage vibrating to music. But the
effects were unnamed ("I had 9 different swings and I had to check them individually"), the
strengths were turned down too far to see, and the sky effects bent the cage, because the cage
had never been cut out of the sky.

So that night I cut it out myself. This is the climbing scene's background: the one the
agent shipped on the left, the one I made on the right. Drag the line.

<ao-slider aspect="16/9" labels="Agent's clean plate|My sky">
<img src="/media/wallpapers-nobody-saw/claude-plate.webp" alt="The agent's background plate: the cage is still in the sky, with a dark smudge and red spatter where Jefrie was">
<img src="/media/wallpapers-nobody-saw/aaron-sky.webp" alt="Aaron's background: storm sky only, no cage">
<figcaption><b>Climbing, background layer</b><span class="ao-meta">left: Flux.1 Fill, 17 Sep, agent · right: Flux.1 Fill in ComfyUI plus hand masks in GIMP, 18 Sep, me</span></figcaption>
</ao-slider>

And the layers the cage needed, which the September scenes didn't have: the bars in front of
her, the bars behind her, and Jefrie on her own.

<ao-compare cols="3" aspect="16/9">
  <figure><img src="/media/wallpapers-nobody-saw/aaron-cage-front.webp" alt="The front half of the cage dome, isolated" loading="lazy"><figcaption><b>Front bars</b><span class="ao-meta">hand mask, GIMP</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/aaron-cage-back.webp" alt="The back half of the cage dome, isolated" loading="lazy"><figcaption><b>Back bars</b><span class="ao-meta">hand mask, GIMP</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/aaron-jefrie.webp" alt="Jefrie over the sky with the cage removed; gaps show where bars crossed in front of her" loading="lazy"><figcaption><b>Jefrie over the sky</b><span class="ao-meta">gaps are where front bars crossed her</span></figcaption></figure>
</ao-compare>

In my words to Claude afterwards: "I went ahead and made the masks by hand and generated all
the occluded areas … It took me like 5 hours." The whole session, from the first upscale workflow to the
16 scenes, cost $373 at API list prices.

## Asking the question properly

On 27 September I asked Claude whether the problem was real and how bad it was, and told it I
wanted an answer I could trust without doing my own research. It sent three agents: one into
Wallpaper Engine's internals, one comparing Lively, Rainmeter and the rest, and one to audit
my old sessions. The audit is where most of the facts above come from.

It also measured something I had filed as "web wallpapers are slow". My earlier HTML
wallpaper had felt like 2 fps. Wallpaper Engine's own settings file said `"fps" : 15`, and
every daily backup of it since 14 September said the same. The browser it tested in fell back
to the Intel graphics even when the page asked for the RTX 4070. The effect code itself took
about 16 ms a frame on that chip, across three monitors. Three separate causes, none of them
"HTML is slow".

Its recommendation was to keep Wallpaper Engine and build web wallpapers Claude could open in
a browser and screenshot. I thought about it overnight and went further. What I actually
want is one folder per wallpaper where every cutout, mask and version is an ordinary file I can
open, compare and replace, and buttons on the wallpaper that run my own scripts. That
isn't how Wallpaper Engine works, so on 28 September I asked for a new app, and gave it a
working name: Wallpaper Breaker.

## What exists a day later

I said "go do it" at 6 pm. By 9 am the repo had about 80,000 lines of tracked code (around
22,000 of it tests): a .NET engine that puts web pages behind the desktop icons on all three
monitors, a WebGL player, and a render tool Claude uses to turn any moment of any wallpaper
into an image, a contact sheet or a clip. The build ran as a workflow of 96 Opus 5.5 agents,
and the whole session so far is about 2 billion tokens, most of them cache reads.

The check I care about is in its test notes: with Wallpaper Engine stopped and restored, the
engine played two demo wallpapers on the real desktop, and **the frame the engine drew at 1.5
seconds matched the render tool's frame exactly, a maximum pixel difference of 0.** What
Claude looks at and what I'd see are the same picture.

It isn't a clean win yet. One of those two demos has a rain effect nobody can see: the fixture
gives the rain's area in pixels where the effect expects fractions of the screen, so the rain
is spread over roughly 90,000 times the canvas. The integration agent found it and wrote down
the two-number fix, and the fix is waiting on my OK because the agent wasn't allowed to change
the shared file.

## The first real wallpaper

The pilot is Jefrie cooking in the ruins. This time the agents' job was only the assets, and
they made a review image for nearly every step. The source is a 1239×848 Nano Banana
picture. Qwen-Image 2.1 outpainted it to 16:9, and the new edges had to be aligned and colour
matched back to the original, because Qwen shrinks the picture by 1 to 3% and comes back a
little bluer.

<ao-compare cols="3" aspect="16/9">
  <figure><img src="/media/wallpapers-nobody-saw/pilot-source.webp" alt="The source: Jefrie stirring a pot over a fire inside the coil of her tail, ruins and rain behind" loading="lazy"><figcaption><b>Source</b><span class="ao-meta">Nano Banana · 1239×848</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/pilot-plate.webp" alt="The same scene extended to 16:9 at 3840×2160" loading="lazy"><figcaption><b>Plate</b><span class="ao-meta">Qwen-Image 2.1 outpaint, seed 5303 · 3840×2160</span></figcaption></figure>
  <figure><img src="/media/wallpapers-nobody-saw/pilot-clean-bg.webp" alt="The ruins with Jefrie, her tail, the pot and fire all removed" loading="lazy"><figcaption><b>Clean background</b><span class="ao-meta">Qwen-Image 2.1 edit, pasted only inside the mask · mask v5</span></figcaption></figure>
</ao-compare>

Then SAM 3.1 and a stack of other methods cut it into 25 layers, back to front: sky, far
ruins, ground, the flail, the back half of her tail, the scythe, the cape, her body, the pot,
the stirring arm, the spoon, the fire, the head, the ear points, the steam, the front half of
the tail, a foreground rock.

<ao-compare cols="1">
  <figure class="wide"><img src="/media/wallpapers-nobody-saw/pilot-layers.webp" alt="Contact sheet of every layer on magenta: sky, ruins, ground, chain, ball, tail shell, scythe, cape pieces, body, pot, arm, spoon, glove, fire, head, ear points, steam, front tail, rock" loading="lazy"><figcaption><b>The layers, each on magenta</b><span class="ao-meta">review sheet from round 2 · the agents' own check image</span></figcaption></figure>
</ao-compare>

The test for a stack like this is to put it back together and compare it to the plate. If
the layers are right, you can't tell them apart.

<ao-slider aspect="16/9" labels="Plate|25 layers recomposited">
<img src="/media/wallpapers-nobody-saw/pilot-plate.webp" alt="The plate">
<img src="/media/wallpapers-nobody-saw/pilot-recomposite.webp" alt="The 25 layers stacked back together">
<figcaption><b>Round 6 recomposite against the plate</b><span class="ao-meta">round 1 measured a mean error of 1.07 out of 255 (target ≤ 3)</span></figcaption>
</ao-slider>

And the difference between them, multiplied by eight so there's anything to see at all:

<ao-compare cols="1">
  <figure class="wide"><img src="/media/wallpapers-nobody-saw/pilot-error-x8.webp" alt="A nearly black image: faint outlines of the pot, chain, ball and rock edge" loading="lazy"><figcaption><b>Recomposite error × 8</b><span class="ao-meta">what's left lives at layer edges, where the clean background replaced rain spray and halos</span></figcaption></figure>
</ao-compare>

The pilot's file list has 2,206 entries, every one marked chosen, candidate or rejected, with
how it was made. There are 319 review images, and it is on its sixth round of fixes. It isn't a
wallpaper yet: nothing in it moves until the effects go on.

**Update, 7 October:** the effects went on. Claude made four moods from these layers, and this
is one of them, "Weight and Momentum", for one whole 60-second loop. Her stir, head, ears and
cape move every 6 seconds, the flail every 10, and a wet sheen runs round the tail coil. It comes
from the app's render tool, the one whose frame matched the engine's exactly, so these are the
frames the engine draws, not a recording of a screen.

<ao-compare cols="1" aspect="16/9">
  <figure><video controls muted loop playsinline preload="metadata" poster="/media/wallpapers-nobody-saw/pilot-v016.webp" src="/media/wallpapers-nobody-saw/pilot-v016.mp4"></video><figcaption><b>Jefrie cooking, v016 "Weight and Momentum"</b><span class="ao-meta">one 60 s loop at 30 fps · built 29 Sep by Claude after a critic pass · rendered 7 Oct with wb render clip at 1920×1080 from the 3840×2160 project · the GPU readout top right is blank because a render has no live data</span></figcaption></figure>
</ao-compare>

The rejected column is the useful part. Asking Qwen to "keep only the tail" redrew the tail
or broke it apart, three tries out of three. Asking SAM for "red spike" found the ear point.
oneObsession left hard seams outpainting a painterly image. In September, failures like these
shipped inside the scenes: a spear Flux invented behind Jefrie in the reading plate, a scythe
mask that erased the bar she was holding. Now they land in the rejected column, with a note on
why.

What I keep coming back to is how reasonable each September agent was. Each one read the
notes, did careful work and wrote honestly about what it hadn't checked. The notes said "never
applied" thirteen times in a row, and the plan had no step where anyone had to stop because of
it.
