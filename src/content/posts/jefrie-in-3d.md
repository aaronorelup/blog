---
id: "AO-018"
title: "Six days of trying to put my character in 3D, every attempt side by side"
summary: "Claude hand-built her in Blender, GPT-6 Astra hand-built her on the same brief, and TRELLIS.2 generated her before an agent rebuilt the mesh. The real renders, walk cycles and two models you can turn around, in the order they were made, labelled with facts and no scores."
date: 2026-09-25
status: "in-progress"
tags: ["claude-code", "blender", "3d", "agents", "comfyui"]
series: ["characters"]
draft: false
---

Between 19 and 25 September two agents built Jefrie, my original character, as a 3D model about
twenty times, by two methods. Each approach failed somewhere different. The hand-built models
could walk but, in my words at the time, weren't very good; the best-looking hand-built one held
up from one camera angle only; and the generated mesh looked like her from every side but was a
fused 685,000-triangle shell that couldn't be rigged as it was, until an agent rebuilt it.

Everything below is the real output, in the order it was made, labelled with the date, the
agent and how long the turn ran. I've left the judging to you.

This is what all of them were aiming at. Jefrie is a small girl in gunmetal armour with a half
mask, a tattered red cape, a scythe bigger than she is, and a tail that weighs more than the
rest of her.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/target-refsheet.webp" alt="Jefrie character reference sheet: front, side and back views, with the scythe" loading="lazy">
    <figcaption><b>The target: her character reference sheet</b><span class="ao-meta">Seedream 5 on Higgsfield · the reference for every attempt from 23 Sep on</span></figcaption>
  </figure>
</ao-compare>

## Method one: an agent builds her by hand in Blender

On the evening of the 19th I checked that the Blender MCP server worked, then typed: *"You
think you can 3d model this character?"* Claude Code (Opus 5) built her out of primitives
through the live Blender session. I kept asking for fixes, and every fix was a new version.

<ao-compare cols="3" aspect="16/10">
  <figure>
    <img src="/media/jefrie-3d/01-blockout.webp" alt="First blockout of Jefrie in Blender" loading="lazy">
    <figcaption><b>1. Blockout</b><span class="ao-meta">19 Sep 19:23 · Opus 5 · two turns, 9 and 14 min</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/02-poses.webp" alt="Four poses of the blockout" loading="lazy">
    <figcaption><b>2. Four poses</b><span class="ao-meta">20 Sep 00:52 · Opus 5 · "also her tail is upside down"</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/03-measured.webp" alt="Measured rebuild matched to the original image's camera" loading="lazy">
    <figcaption><b>3. Measured rebuild</b><span class="ao-meta">20 Sep 01:40 · Opus 5 subagent, 47 min · 1,180 objects</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/04-lowpoly.webp" alt="Low-poly version" loading="lazy">
    <figcaption><b>4. Low-poly</b><span class="ao-meta">20 Sep 10:33 · Opus 5 · 7 min</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/05-v3-head.webp" alt="Close-up of the reworked head with the grin" loading="lazy">
    <figcaption><b>5. Face rework</b><span class="ao-meta">20 Sep 11:24 · Opus 5 · 10 min</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/06-v4.webp" alt="Version 4 hero render" loading="lazy">
    <figcaption><b>6. v4 hero shot</b><span class="ao-meta">20 Sep 11:40 · Fable 5.1 · 15 min · 932 objects</span></figcaption>
  </figure>
</ao-compare>

Version 3 had the most measurement behind it. A subagent got a reference pack another session had
made from the original image: 41 guidance maps, pose keypoints, and a camera it could solve. It
placed everything by un-projecting measured pixels, so the horizon lands at 730.2 px against a
measured 730, and all 14 pose joints reproject exactly. Its own notes list what was still
wrong, starting with *"This is a stylised blockout, not a sculpt."* **Every measured number
matched, and the result was still a blockout.**

The same morning I asked for a walk. Each walk below came from one prompt, and each prompt was
my correction of the one before: *"Her knees bend the wrong way,"* the tail should be *"as thick
as her body at the base,"* and then the face, *"your smile is weird, full of gums, and
upsidedown."*

<ao-compare cols="3" aspect="4/3" sync>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk1.webp" src="/media/jefrie-3d/v-walk1.mp4"></video>
    <figcaption><b>Walk v1</b><span class="ao-meta">20 Sep 10:42 · Opus 5 · 8 min</span></figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk2.webp" src="/media/jefrie-3d/v-walk2.mp4"></video>
    <figcaption><b>Walk v2: knees, heavier tail</b><span class="ao-meta">20 Sep 11:05 · Opus 5 · 11 min</span></figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk3.webp" src="/media/jefrie-3d/v-walk3.mp4"></video>
    <figcaption><b>Walk v3: face and hair</b><span class="ao-meta">20 Sep 11:24 · Opus 5 · 10 min</span></figcaption>
  </figure>
</ao-compare>

The three walks play together: start any one of them.

## A second agent, on the same brief

On the 21st I told Claude, *"You're not very good at this,"* and asked whether it could drive
GPT-6 Astra through the Codex app instead. I installed it, and Claude set Astra up with the
same Blender MCP server, a read-only shell, and the same reference, and Astra built its version
in the live Blender session in about fifteen minutes.

My verdict, when I saw it: *"It does look far better than yours, but it only looks good from
one angle. it should look good from every angle."* Astra's second pass worked from
eight camera angles. Both passes are in the orbit strip below: the top row is before, the
bottom row after.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/07-astra.webp" alt="GPT-6 Astra's Jefrie from the matched camera" loading="lazy">
    <figcaption><b>7. Astra v1, from the matched camera</b><span class="ao-meta">21 Sep 17:50 · GPT-6 Astra (Codex, high reasoning) · about 15 min</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/08-astra-orbit.webp" alt="Eight-angle orbit of Astra v1 above and v2 below" loading="lazy">
    <figcaption><b>8. The same model from eight angles, v1 above, v2 below</b><span class="ao-meta">21 Sep 18:33 and 18:47 · GPT-6 Astra</span></figcaption>
  </figure>
</ao-compare>

On the 23rd I made it a straight contest. One prompt, to both: build her from the new
reference sheet, rig her, and animate a walk with the scythe, *"Make sure the tail acts like a
tail and her cape acts like a cape. Have astra also do the same and I will compare who is
best."* Claude (Opus 5.5) and Astra ran at the same time, from the same files, and finished
within about ten minutes of each other.

<ao-compare cols="1" sync>
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk-compare.webp" src="/media/jefrie-3d/v-walk-compare.mp4"></video>
    <figcaption><b>Claude on the left, Astra on the right</b><span class="ao-meta">23 Sep · same prompt, same files · Blender MCP, rigged, 4-second loop</span></figcaption>
  </figure>
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-walk-compare-side.webp" src="/media/jefrie-3d/v-walk-compare-side.mp4"></video>
    <figcaption><b>The same two walks from the side</b><span class="ao-meta">Claude left, Astra right</span></figcaption>
  </figure>
</ao-compare>

I picked Claude's (*"I like yours best"*) and asked for more moves, with the rule that
defines how she moves: the girl is feather-light, and the tail and scythe are heavy. It built a
small physics pass for it, the scythe as an under-damped spring and the tail as an 11-point
chain with gravity and friction, and rendered five actions in 26 minutes.

<ao-compare cols="1">
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-actions.webp" src="/media/jefrie-3d/v-actions.mp4"></video>
    <figcaption><b>Run, tail jump, skid stop, spin attack, marionette attack</b><span class="ao-meta">23 Sep 18:39 · Opus 5.5 · 26 min</span></figcaption>
  </figure>
</ao-compare>

That same evening a third session (Opus 5.5) modelled her again from scratch, this time against
a turntable video of her, and spent the night refining parts one at a time. The step I wanted to
keep came from a question: I asked it to *"map the shape of the blade directly by stamping the picture of the blade
into 3d,"* and my reply to the result was *"Amazing, much better, We will use this method much
more in the future."* The turntable it was working from is an H3 video, which I don't publish,
so here is only the Blender model it built by 19:13, before the stamping started.

<ao-compare cols="2" aspect="3/5">
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/jefrie-3d/v-turntable.webp" src="/media/jefrie-3d/v-turntable.mp4"></video>
    <figcaption><b>9. Modelled from a turntable</b><span class="ao-meta">23 Sep 19:13 · Opus 5.5 · 32 min for this pass</span></figcaption>
  </figure>
  <figure>
    <img src="/media/jefrie-3d/11-walk-claude-front.webp" alt="Claude's walk-off model from the front" loading="lazy">
    <figcaption><b>For comparison: the walk-off model, front</b><span class="ao-meta">23 Sep 17:42 · Opus 5.5</span></figcaption>
  </figure>
</ao-compare>

## Method two: generate the mesh, then rescue it

On the 24th I asked the opposite question: are there open-source image-to-3D models that run
on my 8 GB laptop GPU in ComfyUI? Claude found two, TRELLIS.2 and Pixal3D, installed them, and
fed each the front panel of the reference sheet. TRELLIS.2 took 321 seconds and Pixal3D 258.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/12-trellis2.webp" alt="TRELLIS.2 output from four angles" loading="lazy">
    <figcaption><b>10. TRELLIS.2, one image in</b><span class="ao-meta">24 Sep 20:51 · 321 s on an RTX 4070 laptop · 685k triangles</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/13-pixal3d.webp" alt="Pixal3D output from four angles" loading="lazy">
    <figcaption><b>11. Pixal3D, same image</b><span class="ao-meta">24 Sep 20:45 · 258 s · 696k triangles</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/14-trellis2-wire.webp" alt="Wireframe close-ups of the TRELLIS.2 mesh" loading="lazy">
    <figcaption><b>What that looks like underneath</b><span class="ao-meta">TRELLIS.2 wireframe · all triangles, one fused mesh, 9.4k UV islands</span></figcaption>
  </figure>
</ao-compare>

Then the real prompt: *"Do you think you can rescue the trellis generation?"* I wanted at
least ten times fewer triangles, topology clean enough to rig, a new UV unwrap and new texture
maps. It took an hour and 46 minutes. The result was 20,600 quads, about one thirty-third of
the original, with baked colour, ORM and normal maps and a 29-bone rig. A second TRELLIS.2 run
on a close-up of her head was merged on top. After midnight I asked for the cape, both kinds of
ears, and a tail with a natural resting shape, and got v2.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/jefrie-3d/15-retopo-wire.webp" alt="Retopologised low-poly mesh in wireframe" loading="lazy">
    <figcaption><b>12. The rescue: 20.6k quads</b><span class="ao-meta">24 Sep 23:10 · Opus 5.5 · 1 h 46 min</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/16-headmerge.webp" alt="Low-poly body with the detailed head merged on" loading="lazy">
    <figcaption><b>13. Head merged on</b><span class="ao-meta">24 Sep 23:29 · head: TRELLIS.2, 426 s · 28,486 tris</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/17-v2.webp" alt="v2 with a straight tapering tail, repaired cape and ears" loading="lazy">
    <figcaption><b>14. v2: new tail, cape and ears</b><span class="ao-meta">25 Sep 00:29 · Opus 5.5 · 50 min · about 28k tris</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/jefrie-3d/18-v2-rig.webp" alt="v2 rig pose test" loading="lazy">
    <figcaption><b>v2 rig pose test</b><span class="ao-meta">25 Sep 00:29 · automatic 29-bone rig</span></figcaption>
  </figure>
</ao-compare>

My words when the rescue landed: *"Amazing work so far. I like where this is going."* These last
two you can turn around yourself. They're the actual meshes, with the textures cut to 1024
pixels so they load in a couple of seconds.

<ao-model src="/media/jefrie-3d/jefrie-headmerge.glb" poster="/media/jefrie-3d/16-headmerge.webp" size="1.6 MB" label="Jefrie, TRELLIS.2 rescue with merged head, 28,486 triangles"><img src="/media/jefrie-3d/16-headmerge.webp" alt="Head-merge model"></ao-model>

<ao-model src="/media/jefrie-3d/jefrie-v2.glb" poster="/media/jefrie-3d/17-v2.webp" size="2.1 MB" label="Jefrie v2, 27,938 triangles"><img src="/media/jefrie-3d/17-v2.webp" alt="v2 model"></ao-model>

## What I'd tell myself on the 19th

**Every approach got one thing right and something else wrong, and it was a different thing each
time.** Hand-building gave me a rig and a walk within a day, and a face I kept sending back. The
second agent gave me a picture I liked better, from one camera. The generator gave me her from
every side, as a shape that couldn't bend. The last version is the generator's shape with a
built tail, a new topology and a rig done to it afterwards.

The other thing is where the rules came from. The heavy tail, the blade stamp and the "circle
at the base" that stretches "like a cone" to the tip all started as me typing what was wrong
with the last render. None of them was in my first prompt, which was one line long. **The
specification for this character got written by correcting twenty versions of her.**
