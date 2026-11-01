---
id: "AO-018"
title: "Making a 3D model of my character with AI, two ways"
summary: "AI agents made my original character Jefrie in 3D about twenty times in six days, built shape by shape in Blender or generated from one picture. What each way got right and wrong."
date: 2026-09-25
status: "shipped"
tags: ["claude-code", "blender", "3d", "agents", "comfyui"]
series: ["characters"]
draft: false
topic: "3d"
project: ["characters"]
preview:
  verdict: "Each got one thing right"
  takeaway: "Agent-built models walked within a day but weren't very good, and the generated one looked like her from every side but couldn't bend until an agent rebuilt it."
  points:
    - "GPT-6 Astra's model looked better than Claude's, but only from one angle. In a same-prompt walk-off I picked Claude's."
    - "From one picture, TRELLIS.2 made a fused 685,000-triangle shell in 321 s. Making it able to bend took 1 h 46 min."
    - "Her rules, like a tail heavier than she is, came from correcting twenty versions. My first prompt was one line."
  image: "/media/previews/jefrie-in-3d.webp"
  alt: "Jefrie's rebuilt TRELLIS.2 model from the front and three-quarter view: half mask, red cape, black armour and a coiled scaly tail"
---

Over six days in September I had AI agents make Jefrie, my original character, as a 3D model
about twenty times, in two different ways. **Built shape by shape in Blender, she could walk
within a day but never looked very good. Generated from one picture by an open-source AI model,
she looked like herself from every side, but as one fused shell that couldn't bend until an agent
rebuilt it.**

Jefrie is a small girl in gunmetal armor with a half mask, a torn red cape, a scythe bigger than
she is, and a tail that weighs more than the rest of her. The agents worked in Blender, the free
3D program, through a plug-in that lets an AI drive it live. This is what they were aiming at.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/target-refsheet.webp" alt="Jefrie character reference sheet: front, side and back views, with the scythe" loading="lazy">
    <figcaption><b>The target: her character reference sheet</b><span class="ao-meta">Front, side and back, with the scythe · made with Seedream 5, an image model on Higgsfield · the reference for every version from 23 September on</span></figcaption>
  </figure>
</ao-compare>

## What each way got me

- **Building her by hand got her walking in a day.** She never looked very good, even when every
  measurement matched.
- **A second AI made a better-looking one, from one angle only.** That was OpenAI's GPT-6 Astra.
  In a same-prompt walk-off I picked Claude's.
- **The winner got five moves, with physics for the heavy parts.** She's feather-light, and her
  tail and scythe are heavy.
- **Generating her from one picture got her right from every side.** TRELLIS.2, a free
  image-to-3D model, did it in 321 seconds on my laptop, as one fused shell that couldn't bend.
- **An agent rebuilt that shell so it could bend.** It took 1 hour 46 minutes and left about a
  thirty-third of the faces, with a 29-bone skeleton.
- **Her rules came from my corrections.** My first prompt was one line.

## The last two versions, in 3D

These are the real models from that rebuild. Drag to turn them around.

<ao-model src="/media/jefrie-3d/jefrie-headmerge.glb" poster="/media/jefrie-3d/16-headmerge.webp" size="1.6 MB" label="Jefrie, TRELLIS.2 rescue with merged head, 28,486 triangles"><img src="/media/jefrie-3d/16-headmerge.webp" alt="Head-merge model"></ao-model>

<ao-model src="/media/jefrie-3d/jefrie-v2.glb" poster="/media/jefrie-3d/17-v2.webp" size="2.1 MB" label="Jefrie v2, 27,938 triangles"><img src="/media/jefrie-3d/17-v2.webp" alt="v2 model"></ao-model>

## Built by hand, she walked in a day but wasn't very good

On the 19th I typed *"You think you can 3d model this character?"* Claude, running the Opus 5
model, built her out of simple shapes like boxes and balls, and every fix I asked for was a new version.

By the next morning she had a rig, the skeleton that lets a model bend, and a walk. Each walk
below fixed what I'd said about the one before. *"Her knees bend the wrong way."* The tail
should be *"as thick as her body at the base."* Then *"your smile is weird, full of gums, and
upsidedown."*

<ao-compare cols="3" aspect="4/3" sync>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk1.webp" src="/media/jefrie-3d/v-walk1.mp4"></video>
    <figcaption><b>First walk</b><span class="ao-meta">Opus 5</span></figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk2.webp" src="/media/jefrie-3d/v-walk2.mp4"></video>
    <figcaption><b>Second walk: knees fixed, heavier tail</b><span class="ao-meta">Opus 5</span></figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk3.webp" src="/media/jefrie-3d/v-walk3.mp4"></video>
    <figcaption><b>Third walk: new face and hair</b><span class="ao-meta">Opus 5</span></figcaption>
  </figure>
</ao-compare>

One version was placed part by part from measurements of the original picture, and every
number matched. Its own notes still called it a blockout, meaning a rough first pass, not a sculpt.

## A second AI looked better, from one angle

On the 21st I told Claude *"You're not very good at this"* and had it set up GPT-6 Astra in
OpenAI's Codex app on the same brief. Astra built its version in about fifteen
minutes. My reaction was *"It does look far better than yours, but it only looks good from one
angle. it should look good from every angle."*

On the 23rd I made it a contest. One prompt asked Claude to build her from the new reference
sheet, rig her and animate a walk with the scythe, and said *"Have astra also do the same and I
will compare who is best."*

<ao-compare cols="1" sync>
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk-compare.webp" src="/media/jefrie-3d/v-walk-compare.mp4"></video>
    <figcaption><b>Claude on the left, Astra on the right</b><span class="ao-meta">Same prompt, same files · built and rigged in Blender · 4-second loop</span></figcaption>
  </figure>
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk-compare-side.webp" src="/media/jefrie-3d/v-walk-compare-side.mp4"></video>
    <figcaption><b>The same two walks from the side</b><span class="ao-meta">Claude left, Astra right</span></figcaption>
  </figure>
</ao-compare>

I picked Claude's (*"I like yours best"*) and asked for more moves. The rule is that she's
feather-light and her tail and scythe are heavy, so Claude gave the tail and the scythe their own
physics. The scythe is a spring that overshoots and wobbles before it settles, and the tail is a chain of 11 points with
gravity and friction.

<ao-compare cols="1">
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-actions.webp" src="/media/jefrie-3d/v-actions.mp4"></video>
    <figcaption><b>Run, tail jump, skid stop, spin attack, marionette attack</b><span class="ao-meta">Opus 5.5 · the tail and the scythe move by physics</span></figcaption>
  </figure>
</ao-compare>

## Generated from one picture, she looked right but couldn't bend

On the 24th I asked the opposite question. Are there open-source models that turn one picture
into 3D on my laptop's 8 GB graphics card? Claude found two, TRELLIS.2 and Pixal3D, set them up
in ComfyUI, the app I run my AI image models in, and gave each the front view of the sheet.

TRELLIS.2 took 321 seconds and Pixal3D 258. The TRELLIS.2 one looked like her from every side, as
one fused shell. A 3D model's surface is made of tiny flat pieces, and this one was 685,000
triangles melted together. It couldn't be rigged as it was.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/12-trellis2.webp" alt="TRELLIS.2 output from four angles" loading="lazy">
    <figcaption><b>TRELLIS.2, from one picture</b><span class="ao-meta">321 s on my RTX 4070 laptop · 685,000 triangles</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/13-pixal3d.webp" alt="Pixal3D output from four angles" loading="lazy">
    <figcaption><b>Pixal3D, same picture</b><span class="ao-meta">258 s · 696,000 triangles</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/14-trellis2-wire.webp" alt="Wireframe close-ups of the TRELLIS.2 mesh" loading="lazy">
    <figcaption><b>What the TRELLIS.2 model looks like underneath</b><span class="ao-meta">All triangles, one fused shell</span></figcaption>
  </figure>
</ao-compare>

## Rebuilding the generated shell so it could bend

Then I asked *"Do you think you can rescue the trellis generation?"* I wanted at least ten times
fewer triangles, a surface clean enough to rig, and new textures. Claude, on Opus 5.5, took an
hour and 46 minutes. It came back with 20,600 quads, which are four-sided faces that bend cleanly.
It also made new textures and a 29-bone skeleton.

A second TRELLIS.2 run on a close-up of her head was merged on top. My words were *"Amazing work so far. I like where this is going."* After midnight I asked
for the cape, both kinds of ears and a tail with a natural resting shape, and got the second version.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/15-retopo-wire.webp" alt="Retopologised low-poly mesh in wireframe" loading="lazy">
    <figcaption><b>The rebuild: 20,600 quads</b><span class="ao-meta">Opus 5.5 · 1 h 46 min</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/16-headmerge.webp" alt="Low-poly body with the detailed head merged on" loading="lazy">
    <figcaption><b>The detailed head merged on</b><span class="ao-meta">A second TRELLIS.2 run, from a close-up of her head</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/17-v2.webp" alt="v2 with a straight tapering tail, repaired cape and ears" loading="lazy">
    <figcaption><b>Second version: new tail, cape and ears</b><span class="ao-meta">Opus 5.5 · about 28,000 triangles</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/18-v2-rig.webp" alt="v2 rig pose test" loading="lazy">
    <figcaption><b>The second version's skeleton, posed</b><span class="ao-meta">An automatic 29-bone rig</span></figcaption>
  </figure>
</ao-compare>

## Her rules came from correcting twenty versions

The heavy tail, the knees, the face and the scythe blade all started as me typing what was wrong
with the last render. None of it was in my first prompt, which was one line. For the blade I
asked a third Claude session to *"map the shape of the blade directly by stamping the picture of
the blade into 3d,"* and told it *"Amazing, much better, We will use this method much more in the
future."*

These models were then the starting point for her in
[my fighting game](/ledger/storm-bell-fighter/). Later she was the test subject for
[AI rigging tools](/ledger/ai-rigging-vs-a-script/) and a folded-paper puppet in
[Paper Jefrie](/ledger/paper-jefrie/).

<details><summary>Every version, in order</summary>

The hand-built versions from the first two days, then Astra's two passes. Its second pass worked
from eight camera angles.

<ao-compare cols="3" aspect="16/10">
  <figure>
    <img src="/media/jefrie-3d/01-blockout.webp" alt="First blockout of Jefrie in Blender" loading="lazy">
    <figcaption><b>1. First blockout</b><span class="ao-meta">Opus 5 · 19 September</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/02-poses.webp" alt="Four poses of the blockout" loading="lazy">
    <figcaption><b>2. Four poses</b><span class="ao-meta">Opus 5 · "also her tail is upside down"</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/03-measured.webp" alt="Measured rebuild matched to the original image's camera" loading="lazy">
    <figcaption><b>3. The measured rebuild</b><span class="ao-meta">A helper agent on Opus 5 · placed from measurements of the picture</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/04-lowpoly.webp" alt="Low-poly version" loading="lazy">
    <figcaption><b>4. Low-poly</b><span class="ao-meta">Opus 5</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/05-v3-head.webp" alt="Close-up of the reworked head with the grin" loading="lazy">
    <figcaption><b>5. Face rework</b><span class="ao-meta">Opus 5</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/06-v4.webp" alt="Version 4 hero render" loading="lazy">
    <figcaption><b>6. Version 4</b><span class="ao-meta">Fable 5.1 · 20 September</span></figcaption>
  </figure>
</ao-compare>

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/07-astra.webp" alt="GPT-6 Astra's Jefrie from the matched camera" loading="lazy">
    <figcaption><b>7. Astra's first pass, from the camera it matched</b><span class="ao-meta">GPT-6 Astra in Codex, high reasoning · about 15 minutes · 21 September</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/08-astra-orbit.webp" alt="Eight-angle orbit of Astra v1 above and v2 below" loading="lazy">
    <figcaption><b>8. The same model from eight angles, first pass above, second below</b><span class="ao-meta">GPT-6 Astra</span></figcaption>
  </figure>
</ao-compare>

On the evening of the 23rd a third Claude session modeled her from scratch against a turntable
video, a clip of her spinning in place, and spent the night refining one part at a time. That's
where the blade stamping came from. This is its model from before the stamping started.

<ao-compare cols="2" aspect="3/5">
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-turntable.webp" src="/media/jefrie-3d/v-turntable.mp4"></video>
    <figcaption><b>9. Modeled from a turntable video</b><span class="ao-meta">Opus 5.5 · 23 September · before the blade stamping started</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/11-walk-claude-front.webp" alt="Claude's walk-off model from the front" loading="lazy">
    <figcaption><b>For comparison: the walk-off model, front</b><span class="ao-meta">Opus 5.5 · 23 September</span></figcaption>
  </figure>
</ao-compare>

</details>
