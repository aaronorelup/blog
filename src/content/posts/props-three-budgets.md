---
id: "AO-059"
title: "Making AI-generated 3D props light enough for a game"
summary: "Claude made three 3D game props on my laptop and on Higgsfield, an AI service, then cut the laptop ones to 30,000, 3,000 and 300 triangles four ways. Which way kept them intact, and what 300 looks like in a scene."
date: 2026-10-19
topic: "3d"
project: []
preview:
  verdict: "Blender's cut held at 3,000"
  takeaway: "Asking the 3D generator itself for fewer triangles broke the props below 30,000. Cutting its full model down in Blender kept all three intact at 3,000."
  points:
    - "At 3,000 the generator's own setting left the barrel as a ring 9 cm tall, and it broke the lantern even at 30,000."
    - "Higgsfield made each prop in about 4 minutes for 30 credits, near 30,000 triangles. My laptop took 4.5 to 14 minutes."
    - "Nothing reached 300 cleanly. A dock of 29 props at about 300 each looked charming, but the 3,000 set was clearly better."
  image: "/media/previews/props-three-budgets.webp"
  alt: "Three renders of the same iron lantern: the full TRELLIS.2 model, TRELLIS.2's own 30,000-triangle version in shards, and Blender's 3,000-triangle version intact"
---

I had Claude make a crate, a barrel and a lantern in 3D as game props, then cut them down to
30,000, 3,000 and 300 triangles to see what survives. A 3D model's surface is made of flat
triangles, and the fewer it has, the cheaper it is for a game to draw. **Asking the AI generator
itself for fewer triangles broke almost everything below 30,000. Letting it make its full model
and cutting that down in Blender, the free 3D app, kept all three intact at 3,000,** in a minute
or two each. At 300 nothing held up cleanly.

For scale, the generator on my laptop makes models with 300,000 to 700,000 triangles. The
characters in Megabonk, a game [I modded](/ledger/modding-megabonk/), have 864 to 4,434 each.

- **Higgsfield is quicker and game-ready.** The paid AI service made each prop in about 4
  minutes for 30 credits, near 30,000 triangles. My laptop took 4.5 to 14 minutes.
- **The generator's own triangle setting wrecks the models.** At 3,000 the barrel came out as a
  ring 9 cm tall. The lantern broke even at 30,000.
- **Blender's cut holds at 30,000 and 3,000** on all three props, in 54 to 119 seconds each,
  no graphics card needed.
- **A dock full of 300-triangle props looks charming. At 3,000 it's clearly better.**

## Three props, one picture each

Claude made one picture per prop with Flux.2 Klein 4B, an image model on my laptop. The laptop
and Higgsfield both made their 3D models from the same three pictures.

<ao-compare cols="3" aspect="1/1">
<figure><img src="/media/props-three-budgets/ref-crate.webp" alt="Reference picture: a weathered wooden crate with iron corners and stencilled text" loading="lazy"><figcaption><b>Crate</b><span class="ao-meta">25 Sep · Flux.2 Klein 4B · 10.7 s (first render, model loading)</span></figcaption></figure>
<figure><img src="/media/props-three-budgets/ref-barrel.webp" alt="Reference picture: an oak barrel with two iron hoops" loading="lazy"><figcaption><b>Barrel</b><span class="ao-meta">25 Sep · Flux.2 Klein 4B · 5.6 s</span></figcaption></figure>
<figure><img src="/media/props-three-budgets/ref-lantern.webp" alt="Reference picture: a black iron hurricane lantern with a glass chimney and wire guard" loading="lazy"><figcaption><b>Lantern</b><span class="ao-meta">25 Sep · Flux.2 Klein 4B · 5.7 s</span></figcaption></figure>
</ao-compare>

## My laptop against Higgsfield

Higgsfield was quicker, and its models came out ready for a game. On the laptop the models
came from TRELLIS.2, an open AI model that turns a picture into a textured 3D model. It's the
same one I used to [put my character Jefrie in 3D](/ledger/jefrie-in-3d/). Higgsfield used its
Multi-Image to 3D tool.

| Prop | My laptop (TRELLIS.2) | Higgsfield |
|---|---|---|
| Crate | 13 m 49 s · 699k triangles | 30 credits · 4 m 22 s · 26k triangles |
| Barrel | 4 m 29 s on the third try · 296k triangles | 30 credits · 4 m 08 s · 30k triangles |
| Lantern | 4 m 41 s · 674k triangles | 30 credits · 4 m 09 s · 30k triangles |

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

Mine needed cutting down, so I asked Claude for "a consistent and easy way to reduce the number
of triangles".

## Four ways to cut a model down

Only Blender, cutting the full model, kept all three props whole at 3,000. Claude first suggested the triangle setting built into TRELLIS.2, which defaults to
700,000. It said it hadn't tested low numbers, so I had it try 30,000, 3,000 and 300 that way
and also cut the models in Blender. Its report opened with "The test shows my earlier advice was
wrong." The lantern shows the problem best. The Clay button shows the bare shapes in gray.

<ao-matrix cols="Target 30,000|Target 3,000|Target 300" views="Textured|Clay">
<div data-row="Full model|TRELLIS.2 at its default, where every row starts"><figure><img src="/media/props-three-budgets/lantern-original-tex.webp" alt="Iron lantern, 673,777 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-original-clay.webp" alt="Iron lantern, 673,777 triangles, grey clay render" loading="lazy"><figcaption><b>673,777 tris</b><span class="ao-meta">the starting point</span></figcaption></figure><figure class="none">-</figure><figure class="none">-</figure></div>
<div data-row="TRELLIS.2 reduces it|its own triangle setting, GPU"><figure><img src="/media/props-three-budgets/lantern-t30000_native-tex.webp" alt="Iron lantern, 26,910 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t30000_native-clay.webp" alt="Iron lantern, 26,910 triangles, grey clay render" loading="lazy"><figcaption><b>26,910 tris</b><span class="ao-meta">410 s GPU · shrank to 0.79 of its height</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-t3000_native-tex.webp" alt="Iron lantern, 2,549 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t3000_native-clay.webp" alt="Iron lantern, 2,549 triangles, grey clay render" loading="lazy"><figcaption><b>2,549 tris</b><span class="ao-meta">327 s GPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-t300_native-tex.webp" alt="Iron lantern, 184 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t300_native-clay.webp" alt="Iron lantern, 184 triangles, grey clay render" loading="lazy"><figcaption><b>184 tris</b><span class="ao-meta">703 s GPU</span></figcaption></figure></div>
<div data-row="Blender reduces the full model|voxel rebuild, collapse, re-bake"><figure><img src="/media/props-three-budgets/lantern-orig_dec30k-tex.webp" alt="Iron lantern, 29,984 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-orig_dec30k-clay.webp" alt="Iron lantern, 29,984 triangles, grey clay render" loading="lazy"><figcaption><b>29,984 tris</b><span class="ao-meta">54 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-orig_dec3k-tex.webp" alt="Iron lantern, 2,984 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-orig_dec3k-clay.webp" alt="Iron lantern, 2,984 triangles, grey clay render" loading="lazy"><figcaption><b>2,984 tris</b><span class="ao-meta">63 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-orig_dec300-tex.webp" alt="Iron lantern, 742 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-orig_dec300-clay.webp" alt="Iron lantern, 742 triangles, grey clay render" loading="lazy"><figcaption><b>742 tris</b><span class="ao-meta">57 s CPU · stopped at 742</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2's 30k|same recipe"><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/lantern-t30k_dec3k-tex.webp" alt="Iron lantern, 6,696 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t30k_dec3k-clay.webp" alt="Iron lantern, 6,696 triangles, grey clay render" loading="lazy"><figcaption><b>6,696 tris</b><span class="ao-meta">23 s CPU · stopped at 6,696</span></figcaption></figure><figure><img src="/media/props-three-budgets/lantern-t30k_dec300-tex.webp" alt="Iron lantern, 6,696 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t30k_dec300-clay.webp" alt="Iron lantern, 6,696 triangles, grey clay render" loading="lazy"><figcaption><b>6,696 tris</b><span class="ao-meta">23 s CPU · stopped at 6,696</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2's 3k|collapse and re-bake"><figure class="none">not run</figure><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/lantern-t3k_dec300-tex.webp" alt="Iron lantern, 2,443 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/lantern-t3k_dec300-clay.webp" alt="Iron lantern, 2,443 triangles, grey clay render" loading="lazy"><figcaption><b>2,443 tris</b><span class="ao-meta">20 s CPU · stopped at 2,443</span></figcaption></figure></div>
<figcaption><b>Iron lantern: four routes to 30,000, 3,000 and 300 triangles</b><span class="ao-meta">25-26 Sep · Opus 5.5 in Claude Code, TRELLIS.2 in ComfyUI, Blender 5.2 · each cell: the triangles it actually ended with, and its time · renders from the agent's report, at web size</span></figcaption>
</ao-matrix>

The generator's setting only held at 30,000, for the crate and the barrel. It didn't save time
either. Those runs took 133 to 778 seconds, about as long as a full run.

Blender's plain reduce stalled at about 160,000. So Claude's script first rebuilds each model as
a clean closed shell. Then it cuts it down and re-bakes the textures, which paints the original's
surface back onto the new shape. It still stalls on thin walls like the crate's planks.

<details><summary>The other two props: the barrel and the crate</summary>

<ao-matrix cols="Target 30,000|Target 3,000|Target 300" views="Textured|Clay">
<div data-row="Full model|TRELLIS.2 at its default, where every row starts"><figure><img src="/media/props-three-budgets/barrel-original-tex.webp" alt="Oak barrel, 296,166 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-original-clay.webp" alt="Oak barrel, 296,166 triangles, grey clay render" loading="lazy"><figcaption><b>296,166 tris</b><span class="ao-meta">the starting point</span></figcaption></figure><figure class="none">-</figure><figure class="none">-</figure></div>
<div data-row="TRELLIS.2 reduces it|its own triangle setting, GPU"><figure><img src="/media/props-three-budgets/barrel-t30000_native-tex.webp" alt="Oak barrel, 29,820 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t30000_native-clay.webp" alt="Oak barrel, 29,820 triangles, grey clay render" loading="lazy"><figcaption><b>29,820 tris</b><span class="ao-meta">360 s GPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-t3000_native-tex.webp" alt="Oak barrel, 2,833 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t3000_native-clay.webp" alt="Oak barrel, 2,833 triangles, grey clay render" loading="lazy"><figcaption><b>2,833 tris</b><span class="ao-meta">246 s GPU · a ring 9 cm tall is all that is left</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-t300_native-tex.webp" alt="Oak barrel, 249 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t300_native-clay.webp" alt="Oak barrel, 249 triangles, grey clay render" loading="lazy"><figcaption><b>249 tris</b><span class="ao-meta">133 s GPU · a sliver</span></figcaption></figure></div>
<div data-row="Blender reduces the full model|voxel rebuild, collapse, re-bake"><figure><img src="/media/props-three-budgets/barrel-orig_dec30k-tex.webp" alt="Oak barrel, 30,000 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-orig_dec30k-clay.webp" alt="Oak barrel, 30,000 triangles, grey clay render" loading="lazy"><figcaption><b>30,000 tris</b><span class="ao-meta">108 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-orig_dec3k-tex.webp" alt="Oak barrel, 3,000 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-orig_dec3k-clay.webp" alt="Oak barrel, 3,000 triangles, grey clay render" loading="lazy"><figcaption><b>3,000 tris</b><span class="ao-meta">119 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-orig_dec300-tex.webp" alt="Oak barrel, 300 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-orig_dec300-clay.webp" alt="Oak barrel, 300 triangles, grey clay render" loading="lazy"><figcaption><b>300 tris</b><span class="ao-meta">120 s CPU</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2's 30k|same recipe"><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/barrel-t30k_dec3k-tex.webp" alt="Oak barrel, 3,000 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t30k_dec3k-clay.webp" alt="Oak barrel, 3,000 triangles, grey clay render" loading="lazy"><figcaption><b>3,000 tris</b><span class="ao-meta">91 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/barrel-t30k_dec300-tex.webp" alt="Oak barrel, 300 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t30k_dec300-clay.webp" alt="Oak barrel, 300 triangles, grey clay render" loading="lazy"><figcaption><b>300 tris</b><span class="ao-meta">122 s CPU</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2's 3k|collapse and re-bake"><figure class="none">not run</figure><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/barrel-t3k_dec300-tex.webp" alt="Oak barrel, 2,789 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/barrel-t3k_dec300-clay.webp" alt="Oak barrel, 2,789 triangles, grey clay render" loading="lazy"><figcaption><b>2,789 tris</b><span class="ao-meta">25 s CPU · stopped at 2,789</span></figcaption></figure></div>
<figcaption><b>Oak barrel: four routes to 30,000, 3,000 and 300 triangles</b><span class="ao-meta">25-26 Sep · Opus 5.5 in Claude Code, TRELLIS.2 in ComfyUI, Blender 5.2 · each cell: the triangles it actually ended with, and its time · renders from the agent's report, at web size</span></figcaption>
</ao-matrix>

<ao-matrix cols="Target 30,000|Target 3,000|Target 300" views="Textured|Clay">
<div data-row="Full model|TRELLIS.2 at its default, where every row starts"><figure><img src="/media/props-three-budgets/crate-original-tex.webp" alt="Wooden crate, 699,260 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-original-clay.webp" alt="Wooden crate, 699,260 triangles, grey clay render" loading="lazy"><figcaption><b>699,260 tris</b><span class="ao-meta">the starting point</span></figcaption></figure><figure class="none">-</figure><figure class="none">-</figure></div>
<div data-row="TRELLIS.2 reduces it|its own triangle setting, GPU"><figure><img src="/media/props-three-budgets/crate-t30000_native-tex.webp" alt="Wooden crate, 29,721 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t30000_native-clay.webp" alt="Wooden crate, 29,721 triangles, grey clay render" loading="lazy"><figcaption><b>29,721 tris</b><span class="ao-meta">770 s GPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-t3000_native-tex.webp" alt="Wooden crate, 2,426 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t3000_native-clay.webp" alt="Wooden crate, 2,426 triangles, grey clay render" loading="lazy"><figcaption><b>2,426 tris</b><span class="ao-meta">778 s GPU · walls folded into shards</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-t300_native-tex.webp" alt="Wooden crate, 207 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t300_native-clay.webp" alt="Wooden crate, 207 triangles, grey clay render" loading="lazy"><figcaption><b>207 tris</b><span class="ao-meta">489 s GPU · one folded sheet</span></figcaption></figure></div>
<div data-row="Blender reduces the full model|voxel rebuild, collapse, re-bake"><figure><img src="/media/props-three-budgets/crate-orig_dec30k-tex.webp" alt="Wooden crate, 29,982 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-orig_dec30k-clay.webp" alt="Wooden crate, 29,982 triangles, grey clay render" loading="lazy"><figcaption><b>29,982 tris</b><span class="ao-meta">85 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-orig_dec3k-tex.webp" alt="Wooden crate, 2,982 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-orig_dec3k-clay.webp" alt="Wooden crate, 2,982 triangles, grey clay render" loading="lazy"><figcaption><b>2,982 tris</b><span class="ao-meta">89 s CPU</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-orig_dec300-tex.webp" alt="Wooden crate, 934 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-orig_dec300-clay.webp" alt="Wooden crate, 934 triangles, grey clay render" loading="lazy"><figcaption><b>934 tris</b><span class="ao-meta">91 s CPU · stopped at 934</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2's 30k|same recipe"><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/crate-t30k_dec3k-tex.webp" alt="Wooden crate, 3,549 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t30k_dec3k-clay.webp" alt="Wooden crate, 3,549 triangles, grey clay render" loading="lazy"><figcaption><b>3,549 tris</b><span class="ao-meta">84 s CPU · stopped at 3,549</span></figcaption></figure><figure><img src="/media/props-three-budgets/crate-t30k_dec300-tex.webp" alt="Wooden crate, 3,549 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t30k_dec300-clay.webp" alt="Wooden crate, 3,549 triangles, grey clay render" loading="lazy"><figcaption><b>3,549 tris</b><span class="ao-meta">68 s CPU · stopped at 3,549</span></figcaption></figure></div>
<div data-row="Blender reduces TRELLIS.2's 3k|collapse and re-bake"><figure class="none">not run</figure><figure class="none">not run</figure><figure><img src="/media/props-three-budgets/crate-t3k_dec300-tex.webp" alt="Wooden crate, 2,284 triangles, textured" loading="lazy"><img src="/media/props-three-budgets/crate-t3k_dec300-clay.webp" alt="Wooden crate, 2,284 triangles, grey clay render" loading="lazy"><figcaption><b>2,284 tris</b><span class="ao-meta">26 s CPU · stopped at 2,284</span></figcaption></figure></div>
<figcaption><b>Wooden crate: four routes to 30,000, 3,000 and 300 triangles</b><span class="ao-meta">25-26 Sep · Opus 5.5 in Claude Code, TRELLIS.2 in ComfyUI, Blender 5.2 · each cell: the triangles it actually ended with, and its time · renders from the agent's report, at web size</span></figcaption>
</ao-matrix>

</details>

## 300 triangles, in a scene

Blender's cut never reached 300 cleanly. The crate stopped at 934 and the lantern at 742. I
asked anyway: "I'm curious what it would look like to have a full game where the minor assets
are generated at 30k and decimated to 300 triangles. could you make one 3d scene to test out
this idea."

Claude switched to QuadriFlow, a Blender tool that rebuilds a model at the count you ask for.
It got 260 to 332 triangles. QuadriFlow keeps only the biggest piece, so the lantern lost its
handle. Then Claude built a dock at dusk with 29 props and rendered it twice, once with each set.

<ao-slider aspect="16/9" labels="300 triangles a prop|3,000 triangles a prop">
<img src="/media/props-three-budgets/scene-p300-game.webp" alt="The dock scene at a third-person game camera, every prop at about 300 triangles">
<img src="/media/props-three-budgets/scene-p3k-game.webp" alt="The same dock scene and camera, every prop at about 3,000 triangles">
<figcaption><b>The game camera</b><span class="ao-meta">26 Sep · Blender, the agent's scene script · props: 8,330 triangles in all (left) against 92,927 (right) · the white column is in both</span></figcaption>
</ao-slider>

<ao-slider aspect="16/9" labels="300 triangles a prop|3,000 triangles a prop">
<img src="/media/props-three-budgets/scene-p300-close.webp" alt="A close-up of crates, barrels and a lantern on the dock at about 300 triangles a prop">
<img src="/media/props-three-budgets/scene-p3k-close.webp" alt="The same close-up at about 3,000 triangles a prop">
<figcaption><b>The close-up</b><span class="ao-meta">26 Sep · same scene, lights and camera · 300 set: QuadriFlow from TRELLIS.2's 30k models · 3k set: crate 3,549 (cut from TRELLIS.2's 30k version), barrel 3,000, lantern 2,984</span></figcaption>
</ao-slider>

<ao-slider aspect="16/9" labels="300, clay|3,000, clay">
<img src="/media/props-three-budgets/scene-p300-clay_close.webp" alt="The close-up in grey clay, props at about 300 triangles">
<img src="/media/props-three-budgets/scene-p3k-clay_close.webp" alt="The close-up in grey clay, props at about 3,000 triangles">
<figcaption><b>The close-up without textures</b><span class="ao-meta">26 Sep · the same two renders in flat grey, where the facets show</span></figcaption>
</ao-slider>

Both crates are here to turn over.

<ao-model src="/media/props-three-budgets/crate-3k.glb" poster="/media/props-three-budgets/crate-orig_dec3k-tex.webp" size="0.6 MB" label="The crate at 2,982 triangles"><img src="/media/props-three-budgets/crate-orig_dec3k-tex.webp" alt="The crate reduced in Blender to 2,982 triangles"></ao-model>

<ao-model src="/media/props-three-budgets/crate-300.glb" poster="/media/props-three-budgets/crate-qf300-tex.webp" size="0.4 MB" label="The crate at 260 triangles"><img src="/media/props-three-budgets/crate-qf300-tex.webp" alt="The crate rebuilt by QuadriFlow at 260 triangles"></ao-model>

My verdict, as I typed it: "I find the decimated to 300 charming as it's own esthetic, but the
3k ones are clearly better."

## What I kept

The rule in my notes is to let TRELLIS.2 make its full model, then cut it in Blender to 3,000.
Starting from its 30,000 version shredded thin, wiry props like the lantern.

The 300 look is an open idea. A game could swap in the 300 copy when a prop is far away.

<details><summary>How the run went</summary>

- **The bill.** One Claude Code session with Opus 5.5 over two evenings, 25 and 26 September:
  $21.50 at Claude's API list prices, which is what it would cost paying per use, plus 90
  Higgsfield credits. It made 36 models and 110 renders, which is where every picture here
  comes from.
- **Claude waited two hours for the graphics card.** My agents take turns on my laptop's
  graphics card through a booking queue, and two other sessions had it. Claude joined the queue
  and left a note for the session ahead of it. One of that session's jobs slipped into Claude's
  slot, and at that session's request Claude stopped just that job. Its own runs went long, so it
  extended its booking by 40 minutes and apologized to the session waiting next. It held the card
  for 1 h 13 m.
- **Higgsfield ran all three jobs at once,** so its whole set took about four and a half
  minutes. On the laptop they go one at a time.
- **The barrel ran out of graphics memory twice** at the default settings. Lowering one remesh
  setting from 768 to 512 fixed it on the third try. All three tries together took 17 m 47 s.
- **What the TRELLIS.2 setting was meant to do.** At 30,000, Claude said, the detail would move
  into the textures.
- **Why Blender needed the rebuild.** TRELLIS.2's models come out with about 17,000 broken edges.
  Starting Blender's cut from TRELLIS.2's own 3,000 versions got nowhere and kept their damage.
- **The barrel did reach 300 in Blender,** but it came out faceted. QuadriFlow's counts were crate
  260, barrel 286 and lantern 332, with the textures baked on again. The lantern lost its frame
  as well as its handle.
- **The dock** has 11 crates, 11 barrels and 7 lanterns, with the same layout, lights and cameras
  in both renders. The first renders had the 3,000 scene much darker, which had nothing to do
  with triangles. Its lanterns were closed shells and trapped their own lights, so Claude made
  the shells cast no shadow in both sets before comparing.
- **The 3,000 dock's crate is 3,549 triangles,** cut from TRELLIS.2's 30,000 version, not from
  the full model.
- **The two crates you can turn over** are copies of Claude's files with smaller textures, so
  they load fast.
- **As I first wrote the rule,** it said to generate at 30,000 and cut from there. Claude
  corrected it for the thin props. The 300 copy and the 3,000 copy would come from the same
  model, and there's no decision on that look yet.

</details>
