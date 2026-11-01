---
id: "AO-037"
title: "Testing AI tools that rig and animate my 3D character"
summary: "I had Claude test three AI tools that give a 3D character its skeleton or its animations, against a rig it wrote by script. Where each one holds up, and where it breaks."
date: 2026-10-05
status: "shipped"
tags: ["claude-code", "comfyui", "blender", "3d", "rigging", "agents"]
series: ["characters"]
topic: "3d"
project: ["characters"]
preview:
  verdict: "The scripted rig still won"
  takeaway: "The AI tools did well on standard human figures, but my character's tail and cape broke the two rigging tools, so Claude's scripted rig stays in her game."
  points:
    - "AI body weights with the script's tail and cape came closest, worse on 1 of 50 checks at best, but never passed the bar."
    - "The animation tool's clips didn't loop and her feet floated in 4 of 5. Its newest version didn't change that."
    - "A checker agent found the first draft unfair to the AI tools, and every fix it forced went their way."
  image: "/media/previews/ai-rigging-vs-a-script.webp"
  alt: "Two grey clay renders of Jefrie with her tail lifted: our scripted rig lifts it smoothly on the left, UniRig's breaks into shards on the right"
---

I had Claude test three AI tools on Jefrie, my character with a tail heavier than she is, using
the 3,000-triangle model from [her mod for the game Megabonk](/ledger/modding-megabonk/).
SkinTokens and UniRig build a rig, the skeleton that lets a 3D model bend. UniMate animates a
skeleton from a sentence. **None of them beat the rig Claude had already written for her with
Blender scripts, so that one stays in her game.**

Three days later I had Claude run a second round on four characters, to see when the tools are
worth using. **They do well on the standard human figures they were trained on. Her tail and cape
caused most of the rigging mistakes.**

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/ai-rigging-vs-a-script/tail-lift-knee-up.webp" alt="Five grey clay renders of Jefrie side by side in two test poses. Top row, tail lifted: ours and SkinTokens on our skeleton lift a smooth tail; SkinTokens' own rig leaves the tail on the floor; UniRig's tail breaks into shards, and on a welded mesh folds into a crumpled sheet. Bottom row, left knee raised: only SkinTokens' own rig drags the tail into the raised leg." loading="lazy">
    <figcaption><b>Five rigs, two poses: tail lifted, and left knee up</b><span class="ao-meta">Left to right: ours (Claude's script), SkinTokens on our skeleton, SkinTokens' own rig, UniRig as exported, UniRig on a copy with its seams joined · same model, same poses, rendered in Blender · click to enlarge</span></figcaption>
  </figure>
</ao-compare>

## What came out of it

- **The tail and cape broke the two rigging tools.** They were 84.5% of the points that moved wrong
  in SkinTokens' own rig. Cutting off the tail removed 92 to 93% of UniRig's.
- **On plain human figures they're good.** SkinTokens matched an artist's rig on X Bot, a stock
  character from Adobe's Mixamo library.
- **The best mix came close but didn't pass.** That was SkinTokens' body weights with the script's
  tail and cape.
- **The animation clips don't fit a game.** UniMate's clips didn't loop, and her feet never
  touched the floor in 4 of 5.
- **A checker agent caught Claude being unfair to the AI tools.** Every fix it forced went their way.

## The three tools

A rig is bones plus skin weights, which say how much each bone pulls on each point of the model.
Get the weights wrong and her cape follows her leg.

- **SkinTokens** is a small chatbot-style language model trained to write out a skeleton and its
  weights instead of words. It can build the whole rig or only weight a skeleton you
  give it ([paper](https://arxiv.org/abs/2602.04805), [code](https://github.com/VAST-AI-Research/SkinTokens)).
- **UniRig** is the same team's earlier tool. It makes a skeleton of any shape, plus the weights
  ([paper](https://arxiv.org/abs/2504.12451), [code](https://github.com/VAST-AI-Research/UniRig)).
- **UniMate** animates a rigged skeleton from a sentence, two seconds at a time
  ([paper](https://arxiv.org/abs/2609.05415), [code](https://github.com/Friedrich-M/UniMate)). Since
  1 October the trained model is for non-commercial use only, so it's fine for my free mod and not
  for anything sold.

All three run inside ComfyUI, the app I run my AI image and video models in.

Up against them was Claude's rig, "ours" in the pictures. A few Blender scripts place her bones,
weight her tail by how far along it each point sits, and check every animation against the game's
rules. That took about three and a half hours of agent work. Getting her into 3D at all took
[six days](/ledger/jefrie-in-3d/) in September.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/ai-rigging-vs-a-script/input-mesh-v2.webp" alt="Jefrie's 3,000-triangle game model, textured, in a T-pose from front, side, back and the other side: a pale mask with dark eye holes, red leather ear points, a red cape, black coiled sleeves, and a huge spiked tail lying straight behind her on the ground" loading="lazy">
    <figcaption><b>The model every tool got</b><span class="ao-meta">The 3,000 triangles from her game build, one small 256-pixel texture, tail straight behind her, no rig</span></figcaption>
  </figure>
</ao-compare>

## When I'd use which

| What you've got | What I'd do |
|---|---|
| **A plain human figure,** limbs apart, nothing hanging off it | SkinTokens' own rig, then rename the fingers. It got 21 of 30 wrong on the X Bot |
| **A skeleton you already have** | SkinTokens on the weights only, with its clean-up step (`use_postprocess`) off. The ComfyUI add-on turns it on, and on Jefrie that made her pelvis, chest and forearms follow the joint below them |
| **A low-detail game model** | Give SkinTokens a denser copy (12,000 triangles) and copy the weights back. A better body, no help for the cape |
| **A model you want UniRig to rig** | Rig a copy with the tail cut off. Then even out the weights along the seams, where the model's surface is cut open for its texture. That took her cracks to zero in about a second. The two fixes were only measured one at a time |
| **A body to animate with UniMate** | Give it the body only, with no tail or cape bones. Use its exact training sentences and make three takes of each clip. On a Mixamo skeleton, use its Mixamo-only model and shift the clip's height by a fixed amount. Non-commercial only |
| **A tail and a cape, like Jefrie** | AI body weights with a scripted tail and cape. It's what I'd try first on a new character |

## Her tail and cape caused most of the rigging mistakes

On Claude's skeleton, SkinTokens weighted her body about as well as the script but tied part of her
cape to her legs. Left to build its own rig, it gave her a standard human skeleton with no tail, so
703 points of her tail went to her left thigh. Raise that knee and the tail comes with it.

UniRig was the only tool that tried tail and cape bones, and her model tore apart. A game model is
cut open along seams so its painted skin can lie flat, and every point on a seam is stored more
than once. UniRig weighted each copy on its own, so the edges pulled apart.

The second round backed this up with 17 experiments on Jefrie, the X Bot, an adult diver and
[BloodTailor](/ledger/storm-bell-fighter/), another of my characters. Each was re-checked by a
verifier agent, a second Claude whose only job is checking the first one's work.

## The best mix: AI body, scripted tail and cape

SkinTokens' body weights on Claude's skeleton, with the script's tail and cape, were worse than the
script on 1 of 50 checks across her five game moves and better on 2. That was its best run, and
runs vary. Through ComfyUI the same settings came out worse on 2 and better on 2. None of the 39
weight sets passed the bar set before the test. It's still the first thing I'd try on a new
character.

## The animation tool's clips don't loop

UniMate got the script's rig and one sentence for each of her five game moves. A looping game
animation has to end exactly where it starts, and the script's do. UniMate's didn't, and in four of
the five her feet never touched the floor.

<ao-compare cols="1">
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/ai-rigging-vs-a-script/run-2x2.webp" src="/media/ai-rigging-vs-a-script/run-2x2.mp4"></video>
    <figcaption><b>Run: ours, then UniMate three ways</b><span class="ao-meta">"An object runs in place." · ours, UniMate, UniMate with the tail locked to our motion, UniMate on the SkinTokens rig · 2 seconds, same camera · our run plays three times</span></figcaption>
  </figure>
</ao-compare>

The jump starts with her feet 71 cm in the air, on a model 95 cm tall. From frame 27 her tail is
under the floor while her boots stay above it. In her design the tail rears up and slams down to launch her. UniMate's
prompts all have to start with "An object", so there's no way to ask for that.

<ao-frames fps="24" marks="0:Starts in the air|27:Tail under the floor|38:Tail lowest">
<video controls muted playsinline preload="metadata" poster="/media/ai-rigging-vs-a-script/sbs-jump.webp" src="/media/ai-rigging-vs-a-script/sbs-jump.mp4"></video>
<figcaption><b>Jump: ours against UniMate, one frame at a time</b><span class="ao-meta">"An object jumps up in place and lands." · ours lasts 0.625 s, then holds its last frame · from frame 27 the floor cuts through UniMate's tail while her boots stay above it</span></figcaption>
</ao-frames>

Claude tried three fixes and none made the clips fit a game. Locking the tail to the script's
motion kept it out of her legs in the run, but in the idle it sat under the floor in all 60 frames.
Filling in frames between the end and the start cut the run's gap from 6.6 cm to 4.0. FootLock, a
foot-pinning tool, did nothing, because it only pins feet already near the floor and an in-place run
has none. UniMate's newest version, out 5 October, gave about the same motion on her, just faster,
and 2 of 6 jumps still ended in the air.

The tail caused only one of UniMate's six failures and half of another. The rest was Claude's recipe
and the model's own limits. On a Mixamo skeleton, the kind it was trained on, its Mixamo-only model
made believable runs and jumps.

## A second ComfyUI, so my real one stayed untouched

Installing these tools into my main ComfyUI would have changed its Python setup, so Claude built a
second copy in its own folder. It came to 11.99 GB, and my real one's package list didn't change by
a single byte. Installing took about an hour and a half of agent time. The first round of tests used
20 minutes of my laptop's GPU and cost nothing. The install steps, the gotchas and both test tables
are in [the full making-of notes](/ledger/ai-rigging-vs-a-script/notes/).

<details><summary>A security note on SkinTokens' helper server</summary>

On 5 October, SkinTokens' own helper server took connections from any network, not only from the
computer it ran on, and it loaded whatever it was sent. That's a known way for someone else to run
code on your computer. Two fixes that keep it to your own computer were still waiting on GitHub
that day. The wrapper Claude used,
[SkinTokens-NoBlender](https://github.com/stevelittlefish/ComfyUI-SkinTokens-NoBlender), leaves
that server out.

</details>

## The checker agent's fixes all went the AI tools' way

A verifier agent sent back the first draft of the 5 October report, and fixing it turned up more
problems. Every correction made the AI tools look better. Claude had bent UniRig's tail only 75
degrees against the script's 105. UniRig's renders looked blocky only because of how its file
stores shading. A complaint about SkinTokens' elbows wasn't backed by the numbers, and the whole
install had been charged to SkinTokens. It's one run, but I'll watch for that tilt whenever an
agent grades its own work against someone else's.

One bias is still in the tests. The body areas used to measure stray movement came from the
script's rig, which gives it a home advantage.

<details><summary>What the 5 October report got wrong</summary>

The second round, on 8 October, corrected the first report in seven places.

- **It said to weld (join the seams of) the mesh before UniRig.** The welded copy gave a worse body
  in 3 of 3 runs. That copy was also saved in a different file format with different shading, so
  welding itself isn't proven to be the cause. Feed it as exported, then fix the seams.
- **It said UniRig's free-form template was a first guess at where extra bone chains go.** In 7 of 7
  runs, none ran along the tail.
- **It said to use UniMate with the tail locked to sketch an idle.** She crouches, and the tail
  sits under the floor in 60 of 60 frames.
- **It said UniMate's official preparation for new rigs wasn't out.** It came out on 5 October and
  didn't change her result.
- **It said the tail and the cape are where these tools break.** That's only true for the two
  rigging tools, and part of SkinTokens' body error was one setting.
- **It couldn't say why FootLock found nothing.** That's by design. It only pins feet already near
  the floor, and an in-place run has none.
- **It hadn't tried UniMate's humanoid checkpoint.** It's tried now.

</details>

<details><summary>Every rig in every pose</summary>

Seven test poses on every rig: arms down, right arm up, left knee up, a spine twist, a bent elbow
and two tail lifts. The first two columns show the weights as colours.

<ao-compare cols="1">
  <figure class="wide">
    <img src="/media/ai-rigging-vs-a-script/same-poses-grid.webp" alt="A grid of clay renders in eight rows and nine columns. Seven rows are rigs, each shown as weight colours from the front and back and then in seven test poses; the eighth row, for UniRig's humanoid template, is empty because it failed" loading="lazy">
    <figcaption><b>The whole grid: every rig in every pose</b><span class="ao-meta">Rows: ours, SkinTokens on our skeleton (two bone orders), SkinTokens' own rig (two naming modes), UniRig as exported, UniRig welded, UniRig's human template (it failed) · click to enlarge</span></figcaption>
  </figure>
</ao-compare>

</details>

<details><summary>All five clips measured, and idle, fall and grind side by side</summary>

Heights are in centimetres on her 95 cm working scale. The loop gap is how far the last frame lands
from the first.

| Clip | Ours: loop gap | UniMate: loop gap | UniMate: lowest foot | UniMate: lowest tail |
|---|---|---|---|---|
| **Run** | 0 | 6.6 cm | 2.5 cm up, never touches | 11 cm up at the lowest, through her legs in 12.5% of frames |
| **Idle** | 0 (the full 3 s loop) | 8.2 cm | 2.3 cm under | 2.9 cm under |
| **Jump** | not a loop | 53 cm | 6.7 cm up at the lowest, 9 cm at the end | 17 cm under the floor from 1.1 s on |
| **Fall** | 0 | 99 cm | 11 cm up at the lowest, 14 cm at the end | 18 cm under |
| **Grind** | 0 | 14 cm | 4.3 cm up | 10 cm under, in 29 of 48 frames |

- The idle's 2 to 3 cm under the floor is noise. Passing our own run through UniMate's encoder and
  back, with no generation at all, already moves her feet from 0.3 cm to 3.8 cm under.
- The idle also turns her 29 degrees. Megabonk turns the character itself, so a clip shouldn't.
- Our grind floats too. In her game build she rides her scythe along the rail, which was Claude's
  idea of a grind and isn't part of her canon. The scythe bone was taken out for these tests, so
  her feet hover where the scythe would be.

<ao-compare cols="1">
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/ai-rigging-vs-a-script/idle-2x2.webp" src="/media/ai-rigging-vs-a-script/idle-2x2.mp4"></video>
    <figcaption><b>Idle: ours, UniMate, UniMate with the tail locked, UniMate on the SkinTokens rig</b><span class="ao-meta">"An object stands in place, breathing and swaying gently." · our idle curls the tail to her side, the one clip where I allowed that</span></figcaption>
  </figure>
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/ai-rigging-vs-a-script/sbs-fall.webp" src="/media/ai-rigging-vs-a-script/sbs-fall.mp4"></video>
    <figcaption><b>Fall: ours (a 1 s airborne loop) against UniMate (a fall from height and a landing)</b><span class="ao-meta">"An object falls through the air with its arms raised."</span></figcaption>
  </figure>
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/ai-rigging-vs-a-script/sbs-grind.webp" src="/media/ai-rigging-vs-a-script/sbs-grind.mp4"></video>
    <figcaption><b>Grind: ours against UniMate</b><span class="ao-meta">"An object crouches low in place with its arms spread out for balance." · ours is missing the scythe she rides in her game build</span></figcaption>
  </figure>
</ao-compare>

</details>
