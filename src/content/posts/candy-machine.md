---
id: "AO-089"
title: "My 24/7 candy machine, an AI art lab on my own laptop"
summary: "A Claude job on my laptop tests one AI art technique after another, around the clock, and reads my notes before it picks the next. Why I built it, what a result looks like on my dashboard, and the best ones so far."
date: 2026-11-24
topic: "art"
project: []
draft: false
preview:
  verdict: "Fight keyframes won me over"
  takeaway: "A Claude job tests one AI art technique after another on my 8 GB laptop, day and night. My favourite so far: fast fight scenes steered by pictures pinned mid-clip."
  points:
    - "On its first 24/7 day it finished 8 experiments, about 70 minutes each, half of that the graphics card rendering."
    - "A clip made without those pictures drew a puppet look I'd never seen. The next run kept it with one frame as a guide."
    - "One pass of the video model ran 25 seconds clean on 8 GB. From 30 seconds up, the story played twice."
  image: "/media/previews/candy-machine.webp"
  loop: "/media/previews/candy-machine.mp4"
  alt: "Ichigo with long pink hair sits in a yellow rowboat on a pale sea while a small snail swims toward her"
---

I have a Claude job that tries out a new AI art technique on my own laptop, around the clock. Each
result lands on my command center, the private dashboard where my agents report to me, and I leave
a note on it that the next run reads before it picks what to try. I call each result a candy, and
since 23 November the machine makes them back to back. **My favourite so far is fast fight scenes
steered by pictures pinned in the middle of the clip.** Below is a working copy of the card it
posts to, and the best candy yet.

- **One run is one technique.** An explorer agent reads my notes and picks the experiment, a
  creator agent builds and renders it in ComfyUI on my 8 GB graphics card, and a clerk posts it.
- **It never stops unless I tell it to.** On its first day in 24/7 mode it finished 8 candies.
  Pause, 24/7 and off are three buttons on the card.
- **My notes steer it.** Liked it, mixed or didn't like it, what I saw, and what to try next. A
  request stays open until a run takes it up, and the card says which one did.
- **Every result is evidence, not a verdict.** The agents show me side by sides and frames. I'm
  the one who decides if it worked.

## Why I built it

Getting AI models to run on your own computer used to be really hard. In the early ComfyUI days
you pieced it together from a pile of websites with almost no documentation, and most of it was out
of date within a month. None of it was about your computer. You'd go in not knowing if a model
would even run on your machine, how long one picture would take, or if it would be any good. Once
it ran, prompting and picking the settings was an art form of its own. And there were always a
million more things I wanted to try.

Now Claude handles all of that. It does the research, downloads a model that fits my laptop, builds
the workflow and wires it into what I already have, on its own. So I know how good and how fast a
model is on my machine before I decide to use it, and when I'm not sure, it runs the comparisons
for me. My time goes into the creative part.

But I'm in love with the technology too. I still want to keep trying new techniques and stacking
them in weird ways, to make effects nobody has seen. Most people want their AI work to look as
little like AI as possible. I want to celebrate the styles only AI can make. The candy machine
keeps experimenting while I do other things, so that list of techniques keeps growing.

I call it candy because every day when I look at what my agent made, it honestly feels like candy.

## What a candy looks like on my dashboard

This is the Daily candy card from my command center, copied with three of its days. Each post is
one experiment: a title that names the technique, a one-sentence template I can paste into another
project, then the evidence. Under it is my notes box. It opens on CNDY-041, the fight scene I liked
most. Press the switches and type a note if you like. The copy isn't connected to anything, so
nothing you do in it leaves your browser.

<ao-demo name="candy-card" part="card">
The card needs JavaScript. It shows three days of candy posts (20, 22 and 23 November 2026), CNDY-041's whole page, and my notes under each post.
</ao-demo>

You can see the loop in the notes. On CNDY-037 I said the run had called itself a success when my
eyes said the guides made the picture worse, and I asked for a fight scene with no first or last
frame. CNDY-041 was that run. My note on 041 asked for more of an odd style it drew by accident,
and CNDY-044 took that up.

## The best candy so far

These are the ones I marked "liked it" or loved in my library, newest first. A keyframe here is a
picture you pin to a moment of a video, so the clip has to pass through it. The video model is
MiniMax-H3, which runs on my laptop.

### Keyframes in the middle of a fast fight (CNDY-041)

<figure class="flush"><video class="fill framed" controls playsinline preload="metadata" poster="/media/candy-machine/fight-keyframes.webp" src="/media/candy-machine/fight-keyframes.mp4"></video><figcaption class="small-print">Jefrie spars BloodTailor, 10 seconds, three keyframes and nothing at the start or the end</figcaption></figure>

Claude painted a still for each moment the shot had to hit, a vault, an upside-down hero frame and
a clash, and pinned them at three frames in the middle of the clip. The clip passed through each
one on its frame and moved freely in between. It does slow almost to a stop around each keyframe.
The same prompt without the stills drew different characters. My note on this one started in all caps.

### A puppet look found by accident (CNDY-041, CNDY-044)

<ao-compare cols="3" aspect="736/416">
<figure><video controls playsinline preload="metadata" poster="/media/candy-machine/puppet-accident.webp" src="/media/candy-machine/puppet-accident.mp4"></video><figcaption><b>The accident</b><span class="ao-meta">CNDY-041, a clip with no keyframes</span></figcaption></figure>
<figure><video controls playsinline preload="metadata" poster="/media/candy-machine/puppet-kept-calm.webp" src="/media/candy-machine/puppet-kept-calm.mp4"></video><figcaption><b>Kept, calm</b><span class="ao-meta">CNDY-044, one of its frames as the only guide</span></figcaption></figure>
<figure><video controls playsinline preload="metadata" poster="/media/candy-machine/puppet-kept-fight.webp" src="/media/candy-machine/puppet-kept-fight.mp4"></video><figcaption><b>Kept, in a fight</b><span class="ao-meta">CNDY-044, 10 seconds</span></figcaption></figure>
</ao-compare>

One clip with no keyframes drew my characters as something I've never seen: dark fantasy puppets,
almost chibi. The next run took a single frame of it and pinned it into new clips as their only
guide, and the look held through a whole fight. I'm calling them dread bobbles. It also tried the
look on two more characters, and those didn't come out well.

### One keyframe from a stick figure with a tail (CNDY-040)

<figure class="flush"><video class="fill framed" controls muted playsinline preload="metadata" poster="/media/stick-figure-poses/keyframe-lift.webp" src="/media/stick-figure-poses/keyframe-lift.mp4"></video><figcaption class="small-print">Left: with the keyframe at frame 30. Right: the same prompt and seed without it</figcaption></figure>

A stick figure with a chain drawn in for Jefrie's tail posed a picture of her, and that picture was
the only guide in a five-second clip. I can't tell which frame was the keyframe, and it doesn't
freeze on it the way end frames used to. The clip without it glitched into something I loved: her
face on the back of her head as she hangs limp, which is genuinely scary. The stick figures have
[their own post](/ledger/stick-figure-poses/).

### A painted back view makes the camera circle him (CNDY-039)

<figure class="flush"><video class="fill framed" controls muted playsinline preload="metadata" poster="/media/candy-machine/orbit-previs-vs-result.webp" src="/media/candy-machine/orbit-previs-vs-result.mp4"></video><figcaption class="small-print">Left: the grey 3D guide animation. Right: the clip, with a painting of his back attached</figcaption></figure>

Claude made a 3D model of BloodTailor from his picture with TRELLIS, an image-to-3D model, and used
it to paint his back. With that back view attached, the video model circled 180 degrees around him
and landed on it. The grey Blender animation meant as a guide barely changed anything. The painted
back did it.

### 25 seconds in one go (CNDY-036)

<figure class="flush"><video class="fill framed" controls playsinline preload="metadata" poster="/media/candy-machine/ichigo-snail-25s.webp" src="/media/candy-machine/ichigo-snail-25s.mp4"></video><figcaption class="small-print">Ichigo ignores a hopeful snail, 600 frames in one pass, 5 minutes on my laptop, with its own sound</figcaption></figure>

The video model was trained on clips of about 15 seconds. Candy pushed one pass to 25 seconds on my
8 GB card, and the picture held the whole way. From 30 seconds up it still looked fine, but the
story started over and played twice.

### A tea room you can stand inside (CNDY-035)

<figure class="flush"><video class="fill framed" controls muted playsinline preload="metadata" poster="/media/candy-machine/tea-room-tour.webp" src="/media/candy-machine/tea-room-tour.mp4"></video><figcaption class="small-print">A 30-second look around one 16-megapixel picture</figcaption></figure>

One picture painted as a full 360-degree sphere, then looked around in. Every view straight ahead
reads as a room with straight walls. One of the two tries bent, and the floor kinked into a V.

### A cat that sings my song back (CNDY-034)

<figure class="flush"><video class="fill framed" controls playsinline preload="metadata" poster="/media/candy-machine/cat-sings-neon-koi.webp" src="/media/candy-machine/cat-sings-neon-koi.mp4"></video><figcaption class="small-print">Sound on. Three clips cut in the song's rests</figcaption></figure>

30 seconds of Neon Koi, a song Claude made for [an earlier test](/ledger/sonnet-vs-opus-gauntlet/),
went into the video model as an audio guide. The cat's voice came out as the song itself, and its
mouth opens for each line, though not for each syllable.

### From one leaf to the whole park (CNDY-033)

<figure class="flush"><video class="fill framed" controls muted playsinline preload="metadata" poster="/media/candy-machine/leaf-to-park-zoom.webp" src="/media/candy-machine/leaf-to-park-zoom.mp4"></video><figcaption class="small-print">12 pictures, each painted around the last at twice the scale, flown as one zoom</figcaption></figure>

One picture of a maple leaf on a pond, painted outward 12 times, then flown as a single zoom from
the leaf to the whole of Ohori Park. There are no hard seams, but you can still spot soft ghosts
where the rings meet.

### Eight effects on one cat, with no cuts (CNDY-032)

<figure class="flush"><video class="fill framed" controls playsinline preload="metadata" poster="/media/candy-machine/tabby-eight-effects.webp" src="/media/candy-machine/tabby-eight-effects.mp4"></video><figcaption class="small-print">Every clip starts and ends on the same still of the cat</figcaption></figure>

The video model has effects built in that you call by name, like fire breath or bullet time. Each
clip started and ended on the same still, so eight effects play back to back as one shot. Two
didn't survive: the orbit and the pull-back, because they need the camera to end somewhere else. I
think this would make a great wallpaper.

### A 16-megapixel folding screen in 75 seconds (CNDY-029)

<figure class="flush"><video class="fill framed" controls muted playsinline preload="metadata" poster="/media/candy-machine/folding-screen-tour.webp" src="/media/candy-machine/folding-screen-tour.mp4"></video><figcaption class="small-print">A tour of one 5632 by 2816 picture</figcaption></figure>

Tabby cats act out candy's own history on a gold-leaf folding screen, drawn in one go on my 8 GB
card with no upscaler. The composition has no seams anywhere. Up close the cats blur into each other,
and that's what I'd like fixed next.

### Before I could leave notes

<ao-compare cols="3" aspect="16/9">
<figure><video controls muted playsinline preload="metadata" poster="/media/four-art-techniques/seasons-anchored.webp" src="/media/four-art-techniques/seasons-anchored.mp4"></video><figcaption><b>A garden through four seasons</b><span class="ao-meta">CNDY-025</span></figcaption></figure>
<figure><video controls muted playsinline preload="metadata" poster="/media/four-art-techniques/painting-layered.webp" src="/media/four-art-techniques/painting-layered.mp4"></video><figcaption><b>Flying into a painting</b><span class="ao-meta">CNDY-027</span></figcaption></figure>
<figure><video controls muted playsinline preload="metadata" poster="/media/four-art-techniques/shelf-stopmotion.webp" src="/media/four-art-techniques/shelf-stopmotion.mp4"></video><figcaption><b>A shelf filled by twelve edits</b><span class="ao-meta">CNDY-030</span></figcaption></figure>
</ao-compare>

Before the notes box, I marked favourites in my media library instead. These three are explained
in [Four AI art techniques tested on my laptop](/ledger/four-art-techniques/).

Candy itself started in September as one idea a morning, drawn by three image models with a
Claude judge picking the best ([that version](/ledger/daily-candy/)). These four from back then are
ones I loved.

<ao-compare cols="2" aspect="1216/832">
<figure><img src="/media/candy-machine/early-halloween.webp" alt="BloodTailor, grinning in a red cloak, holds out a bowl of candy to three children in ghost costumes under a sign that reads Please, take one" loading="lazy"><figcaption><b>BloodTailor hands out Halloween candy</b><span class="ao-meta">CNDY-013</span></figcaption></figure>
<figure><img src="/media/candy-machine/early-yusef-lantern.webp" alt="Yusef in white holding a glowing lantern on a snowy road while a shadow creature stays outside the light" loading="lazy"><figcaption><b>Yusef's lantern on a snowy road</b><span class="ao-meta">CNDY-019</span></figcaption></figure>
<figure><img src="/media/candy-machine/early-jefrie-asleep.webp" alt="Jefrie asleep curled in her own spiked tail on a bridge, under the words Off duty" loading="lazy"><figcaption><b>Jefrie asleep in her own tail</b><span class="ao-meta">CNDY-022</span></figcaption></figure>
<figure><img src="/media/candy-machine/early-reading-pacer.webp" alt="A tabby cat in a robe reading a glowing scroll beside a metronome, under the words Read at your pace" loading="lazy"><figcaption><b>My reading app as a tea-house scene</b><span class="ao-meta">CNDY-023</span></figcaption></figure>
</ao-compare>

<details><summary>How a run works, in numbers</summary>

- **Three agents per run.** The clerk is a scheduled task in the Claude desktop app that fires every
  10 minutes while 24/7 is on. If no run is going, it asks for the next number, starts an explorer,
  then a creator, and files the result: the post on my dashboard, the originals in my media
  library, a line in my notes.
- **The first 24/7 day.** CNDY-037 to CNDY-044 took 51 to 96 minutes each, about 70 on average.
  About half of that time was the graphics card rendering. The rest was the agents reading,
  planning, writing scripts and looking at what came out.
- **What it uses.** Across those 8 runs my weekly Claude limit went from 14% to 20%, and part of
  that was other sessions I ran the same day. That's roughly half to three quarters of a point per
  candy.
- **The rules I gave it that evening.** One technique per candy, done well in about 2 to 4 hours.
  The title names the technique. A one-sentence template I can reuse. Up to four trials on
  different characters and pacing, with nothing the technique doesn't need. No scores or
  measurements: I judge by looking.
- **Its own ideas too.** It takes my oldest open request first, but after two runs in a row that
  followed requests, the next one is its own idea. I enjoy those as much. CNDY-042, a voice test I
  never asked for, was one.

</details>
