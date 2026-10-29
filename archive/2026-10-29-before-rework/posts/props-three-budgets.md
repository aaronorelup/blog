---
id: "AO-059"
title: "A generated crate survives being cut from 700,000 triangles to 3,000, if Blender does the cutting"
summary: "Claude made a crate, a barrel and a lantern in 3D on my laptop and on Higgsfield, then cut the laptop ones down to 30,000, 3,000 and 300 triangles four different ways. The generator's own triangle setting wrecked them below 30,000. Reducing the full model in Blender held up at 3,000 on all three, and 300 broke in a way I liked."
date: 2026-10-19
status: "shipped"
tags: ["claude-code", "opus-5-5", "3d", "blender", "comfyui", "higgsfield", "gamedev"]
preview:
  verdict: "Cut it in Blender, not inside"
  takeaway: "Asking TRELLIS.2 itself for fewer triangles broke the props below 30,000. Reducing its full model in Blender kept all three intact at 3,000."
  points:
    - "TRELLIS.2's own setting at 3,000 left the barrel as a ring 9 cm tall. Blender's 3,000 barrel kept its shape."
    - "Higgsfield: 30 credits and about 4 minutes a prop, ~30k triangles. Laptop: 270 to 830 s each, 296k to 699k triangles."
    - "A dock of 29 props took 8,330 triangles at about 300 a prop and 92,927 at about 3,000, rendered side by side."
  image: "/media/previews/props-three-budgets.webp"
  alt: "Three renders of the same iron lantern: the full TRELLIS.2 model, TRELLIS.2's own 30,000-triangle version in shards, and Blender's 3,000-triangle version intact"
---

On 25 and 26 September I had Claude make three game props in 3D, a crate, a barrel and a
lantern, then cut them down to 30,000, 3,000 and 300 triangles to see what survives.

**Asking the generator for fewer triangles broke almost every model below 30,000. Letting it
make its full model of about 700,000 and reducing that in Blender kept all three intact at
3,000.** At 300 nothing held up, and I ended up liking that look anyway.

The props are the boring kind every game needs a hundred of, which is why I care about the
triangle count. A 700,000-triangle barrel is fine on a turntable and absurd on a dock with
twenty more beside it.

## Three props, one picture each

The agent made one reference picture per prop with Flux.2 Klein 4B on my laptop, five to eleven
seconds each. Both 3D pipelines got the same three pictures.

<ao-compare cols="3" aspect="1/1">
<figure><img src="/media/props-three-budgets/ref-crate.webp" alt="Reference picture: a weathered wooden crate with iron corners and stencilled text" loading="lazy"><figcaption><b>Crate</b><span class="ao-meta">25 Sep · Flux.2 Klein 4B · 10.7 s (first render, model loading)</span></figcaption></figure>
<figure><img src="/media/props-three-budgets/ref-barrel.webp" alt="Reference picture: an oak barrel with two iron hoops" loading="lazy"><figcaption><b>Barrel</b><span class="ao-meta">25 Sep · Flux.2 Klein 4B · 5.6 s</span></figcaption></figure>
<figure><img src="/media/props-three-budgets/ref-lantern.webp" alt="Reference picture: a black iron hurricane lantern with a glass chimney and wire guard" loading="lazy"><figcaption><b>Lantern</b><span class="ao-meta">25 Sep · Flux.2 Klein 4B · 5.7 s</span></figcaption></figure>
</ao-compare>

## My laptop against Higgsfield

My first request was a straight comparison: "compare our 3d models for basic assets vs higgs
field. Tell me how long the local one took to generate and how many credits the higgsfield took."

Locally the models came from TRELLIS.2 in ComfyUI on my 8 GB laptop GPU. On Higgsfield they came
from its Multi-Image to 3D, which charged 30 credits a model, 90 for the three, and its
transaction log agrees.

| Prop | Laptop, TRELLIS.2 | Higgsfield |
|---|---|---|
| Crate | 828.6 s · 699k triangles | 30 credits · 4 m 22 s · 26k triangles |
| Barrel | 268.6 s on the third try, 1,066.6 s across all three · 296k triangles | 30 credits · 4 m 08 s · 30k triangles |
| Lantern | 280.6 s · 674k triangles | 30 credits · 4 m 09 s · 30k triangles |

The barrel ran out of GPU memory twice at the default settings, and lowering one remesh setting
from 768 to 512 fixed it. The three Higgsfield jobs ran at the same time, so that whole set took
about four and a half minutes; on the laptop they queue one at a time.

Here they are in the same preview render.

<ao-blind aspect="1/1">
<div data-row="Crate">
<figure><img src="/media/props-three-budgets/local-crate.webp" alt="A wooden crate model, front three-quarter view" loading="lazy"><figcaption><b>Laptop · TRELLIS.2</b><span class="ao-meta">828.6 s of GPU · 699k triangles</span></figcaption></figure>
<figure><img src="/media/props-three-budgets/higgs-crate.webp" alt="A wooden crate model, front three-quarter view" loading="lazy"><figcaption><b>Higgsfield</b><span class="ao-meta">30 credits · 4 m 22 s · 26k triangles</span></figcaption></figure>
</div>
<div data-row="Barrel">
<figure><img src="/media/props-three-budgets/local-barrel.webp" alt="An oak barrel model, front view" loading="lazy"><figcaption><b>Laptop · TRELLIS.2</b><span class="ao-meta">268.6 s of GPU (third try) · 296k triangles</span></figcaption></figure>
<figure><img src="/media/props-three-budgets/higgs-barrel.webp" alt="An oak barrel model, front view" loading="lazy"><figcaption><b>Higgsfield</b><span class="ao-meta">30 credits · 4 m 08 s · 30k triangles</span></figcaption></figure>
</div>
<div data-row="Lantern">
<figure><img src="/media/props-three-budgets/local-lantern.webp" alt="An iron lantern model, front view" loading="lazy"><figcaption><b>Laptop · TRELLIS.2</b><span class="ao-meta">280.6 s of GPU · 674k triangles</span></figcaption></figure>
<figure><img src="/media/props-three-budgets/higgs-lantern.webp" alt="An iron lantern model, front view" loading="lazy"><figcaption><b>Higgsfield</b><span class="ao-meta">30 credits · 4 m 09 s · 30k triangles</span></figcaption></figure>
</div>
<figcaption><b>The same three references, two pipelines</b><span class="ao-meta">25 Sep · Opus 5.5 in Claude Code drove both · preview renders from the agent's run, at web size · each model framed as its pipeline scaled it</span></figcaption>
</ao-blind>

The difference that mattered for a game wasn't in the pictures. Higgsfield's models arrive at
about 30,000 triangles, ready for an engine. The laptop's arrive at 300,000 to 700,000 and need
cutting down. So I asked whether there was "a consistent and easy way to reduce the number of
triangles".

## The easy way was the wrong way

The agent said yes: the TRELLIS.2 workflow has a triangle target built in, node 186, set to
700,000 by default. Set it to 30,000, it said, and the detail moves into the textures. It also
said it hadn't tested low numbers. I asked it to test 30,000, 3,000 and 300 that way, and to
try reducing the finished models in Blender as well, so I could compare.

It had to wait two hours first: two other sessions had the GPU. When its turn came it joined
the queue and sent the session ahead of it a note. One of that session's jobs had slipped onto
its time, and at that session's request it interrupted just that job. Its runs went long, so it
extended by 40 minutes and apologised to the session waiting next. It held the GPU for 1 h 13 m.

The result reversed its own advice, and it said so in its first line: "The test shows my
earlier advice was wrong."

Each grid below is one prop. Rows are the four routes, columns the target, and every cell says
how many triangles it really ended with. The Clay button swaps every cell for a flat grey render
where the facets show, and it switches all three grids at once.

<ao-matrix cols="Target 30,000|Target 3,000|Target 300" views="Textured|Clay">
<div data-row="Full model|TRELLIS.2 at its default; every row starts here"><figure><img src="/media/props-three-budgets/barrel-original-tex.webp" alt="Oak barrel, 296,166 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-original-clay.webp" alt="Oak barrel, 296,166 triangles, grey clay render" loading="lazy"><figcaption><b>296,166 tris</b><span class="ao-meta">the starting point</span></figcaption></figure><figure class="none">—</figure><figure class="none">—</figure></div>
<div data-row="TRELLIS.2 reduces it|its own triangle setting, GPU"><figure><img src="/media/props-three-budgets/barrel-t30000_native-tex.webp" alt="Oak barrel, 29,820 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t30000_native-clay.webp" alt="Oak barrel, 29,820 triangles, grey clay render" loading="lazy"><figcaption><b>29,820 tris</b><span class="ao-meta">360 s GPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-t3000_native-tex.webp" alt="Oak barrel, 2,833 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t3000_native-clay.webp" alt="Oak barrel, 2,833 triangles, grey clay render" loading="lazy"><figcaption><b>2,833 tris</b><span class="ao-meta">246 s GPU · a ring 9 cm tall is all that is left</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-t300_native-tex.webp" alt="Oak barrel, 249 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t300_native-clay.webp" alt="Oak barrel, 249 triangles, grey clay render" loading="lazy"><figcaption><b>249 tris</b><span class="ao-meta">133 s GPU · a sliver</span></figcaption></figure></div>
<div data-row="Blender reduces the full model|voxel rebuild, collapse, re-bake"><figure><img src="/media/props-three-budgets/barrel-orig_dec30k-tex.webp" alt="Oak barrel, 30,000 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-orig_dec30k-clay.webp" alt="Oak barrel, 30,000 triangles, grey clay render" loading="lazy"><figcaption><b>30,000 tris</b><span class="ao-meta">108 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-orig_dec3k-tex.webp" alt="Oak barrel, 3,000 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-orig_dec3k-clay.webp" alt="Oak barrel, 3,000 triangles, grey clay render" loading="lazy"><figcaption><b>3,000 tris</b><span class="ao-meta">119 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-orig_dec300-tex.webp" alt="Oak barrel, 300 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-orig_dec300-clay.webp" alt="Oak barrel, 300 triangles, grey clay render" loading="lazy"><figcaption><b>300 tris</b><span class="ao-meta">120 s CPU</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2’s 30k|same recipe"><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/barrel-t30k_dec3k-tex.webp" alt="Oak barrel, 3,000 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t30k_dec3k-clay.webp" alt="Oak barrel, 3,000 triangles, grey clay render" loading="lazy"><figcaption><b>3,000 tris</b><span class="ao-meta">91 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-t30k_dec300-tex.webp" alt="Oak barrel, 300 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t30k_dec300-clay.webp" alt="Oak barrel, 300 triangles, grey clay render" loading="lazy"><figcaption><b>300 tris</b><span class="ao-meta">122 s CPU</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2’s 3k|collapse and re-bake"><figure class="none">not run</figure><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/barrel-t3k_dec300-tex.webp" alt="Oak barrel, 2,789 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t3k_dec300-clay.webp" alt="Oak barrel, 2,789 triangles, grey clay render" loading="lazy"><figcaption><b>2,789 tris</b><span class="ao-meta">25 s CPU · stopped at 2,789</span></figcaption></figure></div>
<figcaption><b>Oak barrel: four routes to 30,000, 3,000 and 300 triangles</b><span class="ao-meta">25–26 Sep · Opus 5.5 in Claude Code, TRELLIS.2 in ComfyUI, Blender 5.2 · each cell: the triangles it actually ended with, and its time · renders from the agent’s report, at web size</span></figcaption>
</ao-matrix>

<ao-matrix cols="Target 30,000|Target 3,000|Target 300" views="Textured|Clay">
<div data-row="Full model|TRELLIS.2 at its default; every row starts here"><figure><img src="/media/props-three-budgets/crate-original-tex.webp" alt="Wooden crate, 699,260 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-original-clay.webp" alt="Wooden crate, 699,260 triangles, grey clay render" loading="lazy"><figcaption><b>699,260 tris</b><span class="ao-meta">the starting point</span></figcaption></figure><figure class="none">—</figure><figure class="none">—</figure></div>
<div data-row="TRELLIS.2 reduces it|its own triangle setting, GPU"><figure><img src="/media/props-three-budgets/crate-t30000_native-tex.webp" alt="Wooden crate, 29,721 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t30000_native-clay.webp" alt="Wooden crate, 29,721 triangles, grey clay render" loading="lazy"><figcaption><b>29,721 tris</b><span class="ao-meta">770 s GPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-t3000_native-tex.webp" alt="Wooden crate, 2,426 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t3000_native-clay.webp" alt="Wooden crate, 2,426 triangles, grey clay render" loading="lazy"><figcaption><b>2,426 tris</b><span class="ao-meta">778 s GPU · walls folded into shards</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-t300_native-tex.webp" alt="Wooden crate, 207 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t300_native-clay.webp" alt="Wooden crate, 207 triangles, grey clay render" loading="lazy"><figcaption><b>207 tris</b><span class="ao-meta">489 s GPU · one folded sheet</span></figcaption></figure></div>
<div data-row="Blender reduces the full model|voxel rebuild, collapse, re-bake"><figure><img src="/media/props-three-budgets/crate-orig_dec30k-tex.webp" alt="Wooden crate, 29,982 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-orig_dec30k-clay.webp" alt="Wooden crate, 29,982 triangles, grey clay render" loading="lazy"><figcaption><b>29,982 tris</b><span class="ao-meta">85 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-orig_dec3k-tex.webp" alt="Wooden crate, 2,982 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-orig_dec3k-clay.webp" alt="Wooden crate, 2,982 triangles, grey clay render" loading="lazy"><figcaption><b>2,982 tris</b><span class="ao-meta">89 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-orig_dec300-tex.webp" alt="Wooden crate, 934 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-orig_dec300-clay.webp" alt="Wooden crate, 934 triangles, grey clay render" loading="lazy"><figcaption><b>934 tris</b><span class="ao-meta">91 s CPU · stopped at 934</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2’s 30k|same recipe"><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/crate-t30k_dec3k-tex.webp" alt="Wooden crate, 3,549 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t30k_dec3k-clay.webp" alt="Wooden crate, 3,549 triangles, grey clay render" loading="lazy"><figcaption><b>3,549 tris</b><span class="ao-meta">84 s CPU · stopped at 3,549</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-t30k_dec300-tex.webp" alt="Wooden crate, 3,549 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t30k_dec300-clay.webp" alt="Wooden crate, 3,549 triangles, grey clay render" loading="lazy"><figcaption><b>3,549 tris</b><span class="ao-meta">68 s CPU · stopped at 3,549</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2’s 3k|collapse and re-bake"><figure class="none">not run</figure><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/crate-t3k_dec300-tex.webp" alt="Wooden crate, 2,284 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t3k_dec300-clay.webp" alt="Wooden crate, 2,284 triangles, grey clay render" loading="lazy"><figcaption><b>2,284 tris</b><span class="ao-meta">26 s CPU · stopped at 2,284</span></figcaption></figure></div>
<figcaption><b>Wooden crate: four routes to 30,000, 3,000 and 300 triangles</b><span class="ao-meta">25–26 Sep · Opus 5.5 in Claude Code, TRELLIS.2 in ComfyUI, Blender 5.2 · each cell: the triangles it actually ended with, and its time · renders from the agent’s report, at web size</span></figcaption>
</ao-matrix>

<ao-matrix cols="Target 30,000|Target 3,000|Target 300" views="Textured|Clay">
<div data-row="Full model|TRELLIS.2 at its default; every row starts here"><figure><img src="/media/props-three-budgets/lantern-original-tex.webp" alt="Iron lantern, 673,777 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-original-clay.webp" alt="Iron lantern, 673,777 triangles, grey clay render" loading="lazy"><figcaption><b>673,777 tris</b><span class="ao-meta">the starting point</span></figcaption></figure><figure class="none">—</figure><figure class="none">—</figure></div>
<div data-row="TRELLIS.2 reduces it|its own triangle setting, GPU"><figure><img src="/media/props-three-budgets/lantern-t30000_native-tex.webp" alt="Iron lantern, 26,910 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t30000_native-clay.webp" alt="Iron lantern, 26,910 triangles, grey clay render" loading="lazy"><figcaption><b>26,910 tris</b><span class="ao-meta">410 s GPU · shrank to 0.79 of its height</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-t3000_native-tex.webp" alt="Iron lantern, 2,549 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t3000_native-clay.webp" alt="Iron lantern, 2,549 triangles, grey clay render" loading="lazy"><figcaption><b>2,549 tris</b><span class="ao-meta">327 s GPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-t300_native-tex.webp" alt="Iron lantern, 184 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t300_native-clay.webp" alt="Iron lantern, 184 triangles, grey clay render" loading="lazy"><figcaption><b>184 tris</b><span class="ao-meta">703 s GPU</span></figcaption></figure></div>
<div data-row="Blender reduces the full model|voxel rebuild, collapse, re-bake"><figure><img src="/media/props-three-budgets/lantern-orig_dec30k-tex.webp" alt="Iron lantern, 29,984 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-orig_dec30k-clay.webp" alt="Iron lantern, 29,984 triangles, grey clay render" loading="lazy"><figcaption><b>29,984 tris</b><span class="ao-meta">54 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-orig_dec3k-tex.webp" alt="Iron lantern, 2,984 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-orig_dec3k-clay.webp" alt="Iron lantern, 2,984 triangles, grey clay render" loading="lazy"><figcaption><b>2,984 tris</b><span class="ao-meta">63 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-orig_dec300-tex.webp" alt="Iron lantern, 742 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-orig_dec300-clay.webp" alt="Iron lantern, 742 triangles, grey clay render" loading="lazy"><figcaption><b>742 tris</b><span class="ao-meta">57 s CPU · stopped at 742</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2’s 30k|same recipe"><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/lantern-t30k_dec3k-tex.webp" alt="Iron lantern, 6,696 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t30k_dec3k-clay.webp" alt="Iron lantern, 6,696 triangles, grey clay render" loading="lazy"><figcaption><b>6,696 tris</b><span class="ao-meta">23 s CPU · stopped at 6,696</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-t30k_dec300-tex.webp" alt="Iron lantern, 6,696 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t30k_dec300-clay.webp" alt="Iron lantern, 6,696 triangles, grey clay render" loading="lazy"><figcaption><b>6,696 tris</b><span class="ao-meta">23 s CPU · stopped at 6,696</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2’s 3k|collapse and re-bake"><figure class="none">not run</figure><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/lantern-t3k_dec300-tex.webp" alt="Iron lantern, 2,443 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t3k_dec300-clay.webp" alt="Iron lantern, 2,443 triangles, grey clay render" loading="lazy"><figcaption><b>2,443 tris</b><span class="ao-meta">20 s CPU · stopped at 2,443</span></figcaption></figure></div>
<figcaption><b>Iron lantern: four routes to 30,000, 3,000 and 300 triangles</b><span class="ao-meta">25–26 Sep · Opus 5.5 in Claude Code, TRELLIS.2 in ComfyUI, Blender 5.2 · each cell: the triangles it actually ended with, and its time · renders from the agent’s report, at web size</span></figcaption>
</ao-matrix>

**TRELLIS.2's own setting was fine at 30,000 for the crate and the barrel and broke everything
else, including the lantern at 30,000. Blender, starting from the full model, held up at 30,000
and 3,000 on all three, in 54 to 119 seconds on the CPU with no GPU at all.** Asking TRELLIS.2
for fewer triangles didn't save time either: those runs took 133 to 778 seconds, about what a
full run takes.

Blender needed a trick to get there. Its plain reduce stalled at about 160,000 on these models,
because TRELLIS.2's meshes come out with roughly 17,000 broken edges. The script rebuilds each
model as a clean closed shell first (a voxel remesh), then reduces it, then bakes the textures
back on from the original. It still stalls on thin walls like the crate's planks, and on models
that are already low: starting from TRELLIS.2's 3,000 versions got nowhere, and kept their
damage.

## 300 triangles, in a scene

Nothing reached 300 cleanly. The barrel got there but came out faceted; the crate stopped at 934 and
the lantern at 742. I wrote down my rule, generate and cut to 3,000 for lamps, barrels and
crates, and then asked anyway: "300 triangles clearly breaks it, but I'm curious what it would
look like to have a full game where the minor assets are generated at 30k and decimated to 300
triangles. could you make one 3d scene to test out this idea."

To reach 300 the agent switched tools to QuadriFlow, which rebuilds a mesh at a count you ask
for: crate 260, barrel 286, lantern 332, textures baked on again. It keeps only the largest
piece, so the lantern lost its handle and frame. Then it built a dusk dock with 11 crates, 11
barrels and 7 lanterns, and rendered it twice with the same layout, lights and cameras, once
with each set of props.

<ao-slider aspect="16/9" labels="300 triangles a prop|3,000 triangles a prop">
<img src="/media/props-three-budgets/scene-p300-game.webp" alt="The dock scene at a third-person game camera, every prop at about 300 triangles">
<img src="/media/props-three-budgets/scene-p3k-game.webp" alt="The same dock scene and camera, every prop at about 3,000 triangles">
<figcaption><b>The game camera</b><span class="ao-meta">26 Sep · Blender, the agent's scene script · props: 8,330 triangles in all (left) against 92,927 (right) · the white column is in both</span></figcaption>
</ao-slider>

<ao-slider aspect="16/9" labels="300 triangles a prop|3,000 triangles a prop">
<img src="/media/props-three-budgets/scene-p300-close.webp" alt="A close-up of crates, barrels and a lantern on the dock at about 300 triangles a prop">
<img src="/media/props-three-budgets/scene-p3k-close.webp" alt="The same close-up at about 3,000 triangles a prop">
<figcaption><b>The close-up</b><span class="ao-meta">26 Sep · same scene, lights and camera · 300 set: QuadriFlow from TRELLIS.2's 30k models · 3k set: crate 3,549, barrel 3,000, lantern 2,984</span></figcaption>
</ao-slider>

<ao-slider aspect="16/9" labels="300, clay|3,000, clay">
<img src="/media/props-three-budgets/scene-p300-clay_close.webp" alt="The close-up in grey clay, props at about 300 triangles">
<img src="/media/props-three-budgets/scene-p3k-clay_close.webp" alt="The close-up in grey clay, props at about 3,000 triangles">
<figcaption><b>The close-up without textures</b><span class="ao-meta">26 Sep · the same two renders in flat grey, where the facets show</span></figcaption>
</ao-slider>

The first renders had the 3,000 scene much darker, which had nothing to do with triangles: its
lanterns were closed shells and trapped their own lights. The agent made the shells cast no
shadow in both sets before comparing.

Both crates are here to turn over. They are re-exports of the agent's files with smaller
textures, so they load quickly.

<ao-model src="/media/props-three-budgets/crate-3k.glb" poster="/media/props-three-budgets/crate-orig_dec3k-tex.webp" size="0.6 MB" label="The crate at 2,982 triangles"><img src="/media/props-three-budgets/crate-orig_dec3k-tex.webp" alt="The crate reduced in Blender to 2,982 triangles"></ao-model>

<ao-model src="/media/props-three-budgets/crate-300.glb" poster="/media/props-three-budgets/crate-qf300-tex.webp" size="0.4 MB" label="The crate at 260 triangles"><img src="/media/props-three-budgets/crate-qf300-tex.webp" alt="The crate rebuilt by QuadriFlow at 260 triangles"></ao-model>

My verdict, as I typed it: "I find the decimated to 300 charming as it's own esthetic, but the
3k ones are clearly better."

## What I kept

The rule went into my notes in one place: generate with TRELLIS.2 at its default, reduce in
Blender to 3,000 and re-bake. The agent added one correction to the rule as I'd first said it.
I'd said generate at 30k; for thin, wiry props like the lantern that route shredded, so those
start from the full model. The 300-triangle look is written down as an open idea with no
decision on it yet. Engines can swap a 300 copy in for a 3,000 one at a distance, and both come
from the same model.

The whole thing ran in one Claude Code session with Opus 5.5 over two evenings, $21.50 at API
list prices, plus 90 Higgsfield credits. It made 36 models and 110 renders, which is where every
picture here comes from.

**The setting built for cutting triangles was the one that broke the models.** What worked was
the long way round: make everything, then take it away somewhere that can see the whole shape
first.
