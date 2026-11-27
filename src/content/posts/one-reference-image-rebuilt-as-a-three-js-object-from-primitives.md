---
id: "AO-097"
title: "One reference image rebuilt as a Three.js object from primitives"
summary: "A mug, a desk lamp and a toy robot, each handed to its own Claude agent and scored against its picture over five tries."
date: 2026-11-27
topic: "3d"
draft: false
credits:
  owner: "Gages"
  worker: "Opus 5.5 fleet"
  orchestrator: "Opus 5.5 xhigh"
  cost: 18.18
preview:
  verdict: "18 of 18 joints moved"
  takeaway: "The rebuilt outlines ended at 0.86 for the mug, 0.85 for the lamp and 0.79 for the robot, where 1 is a perfect match. Each object took 11 to 14 minutes."
  points:
    - "The drafts started at 0.74, 0.81 and 0.63. Only the robot improved every round. The lamp peaked at 0.87 at fix 2."
    - "The three agents wrote 217,456 output tokens between them. The three pictures cost 6 Higgsfield credits."
    - "The joints have no limits: tipping the mug the other way pushes its base through the floor."
  image: "/media/previews/one-reference-image-rebuilt-as-a-three-js-object-from-primitives.webp"
  alt: "Three product pictures of a mug, a red desk lamp and an orange toy robot above their Three.js rebuilds, with outline match 0.74 to 0.86, 0.81 to 0.85 and 0.63 to 0.79"
---

My agents tested whether an AI agent can look at one picture of an object and write code that rebuilds it in 3D, with joints that really move. They ran it on three objects of rising difficulty: a mug, a desk lamp and a toy robot. **After a first draft and four rounds of fixes, the rebuilt outlines overlapped the pictures by 0.86, 0.85 and 0.79**, on a scale where 1 is a perfect match. All 18 joints the agents named moved the object when turned. Each object took 11 to 14 minutes.

![Three product pictures of a mug, a red desk lamp and an orange toy robot above their Three.js rebuilds, with outline match 0.74 to 0.86, 0.81 to 0.85 and 0.63 to 0.79](/media/one-reference-image-rebuilt-as-a-three-js-object-from-primitives/rebuilds.webp)

The idea comes from an X post by [goodboy (goodvbcode)](https://x.com/goodvbcode/status/2126065394469511550) about a tool called img2threejs. The post describes it as giving an agent one reference image and getting back a TypeScript factory, a function that builds the object in Three.js (the 3D library for web pages) from simple shapes and shaders, with named pivots so it can move. My agents did not install the tool. They tested the idea with their own prompt.

The technique as a template: give an AI agent one picture of an object and have it write a function that builds the object in Three.js from simple shapes, with every moving part hung on a named pivot, then render it from the picture's angle, compare and fix (optional: a fixed number of scored rounds).

<details><summary>The prompt each agent got, word for word</summary>

~~~text
[AGENT: build-<object>] You are one arm of a timed experiment. The claim being tested: an agent can take ONE reference image of an object and write a TypeScript factory that rebuilds the object in Three.js from primitives and procedural materials, with a real hierarchy (named pivots) so it can move. You are that agent. Work alone, unattended, ask nothing.

Your object: "<object>". Your ONLY information about it is the picture <the picture> (512x512). Open it with the Read tool. Blind test: do not open <the other objects' folders>, or any notes; do not look for how the picture was made.

Write <the factory file> with exactly this contract:
```ts
import * as THREE from 'three';
export const PIVOTS: string[] = ['<pivotName>:<axis x|y|z>', ...]; // every joint that can move, and the local axis it turns about
export const view = { position: [x, y, z], target: [x, y, z], fov: 35 }; // camera placed so the render matches the reference framing
export function build(): THREE.Group { /* the object */ }
// optional exports: setupLights(scene: THREE.Scene): void (else a default hemisphere + directional light is used),
// toneMapping (a THREE tone-mapping constant), shadows (boolean, enables renderer.shadowMap).
```
The harness sets the background to the reference's own background colour, renders 512x512 with headless Chromium and software WebGL (SwiftShader), three r170. Do not set scene.background.

Rules: geometry only from Three.js built-in geometry classes (Box, Cylinder, Sphere, Cone, Torus, Capsule, Lathe, Tube, Extrude/Shape, Plane, Ring, ...). No model files, no loaders, no image files, no network. Materials: built-in materials, or procedural ones (ShaderMaterial, onBeforeCompile, CanvasTexture/DataTexture drawn in code). A real hierarchy: every part that could move hangs under a named THREE.Group placed at its joint/hinge, and each such pivot is listed in PIVOTS. Rotating any listed pivot 30 degrees about its axis must visibly change the render (this is tested afterwards). Name the meshes too.

The loop (this is what is measured):
1. Write the draft, then run `<the round script> 1`. It snapshots factory.ts, renders it from your view, scores it against the reference, logs the time, and prints a compare-sheet path: reference | your render | difference | silhouettes (red = only in reference, green = only in yours, yellow = both). Open that sheet with the Read tool.
2. Up to 4 compare-and-fix rounds: edit factory.ts, run `<the round script> 2`, then 3, 4, 5. Each number once. round.mjs is the ONLY way you may render: no other renders, screenshots or previews, so every look at a result is a counted round. A render that fails (syntax or runtime error) is not logged: fix it and run the same number again.
3. Stop after round 5, or earlier if you judge another round will not help (say so).
Time cap: 35 minutes from now.

Scores printed each round: iou (headline: silhouette overlap, 1.0 = perfect; an empty frame scores 0), ssim_obj (grayscale SSIM inside the reference object's box; an empty frame already scores <empty-frame score> on this picture, so it moves little), ssim (whole frame), mae (mean RGB error, lower is better; empty frame <empty-frame error>). Aim to make it look like the reference: shape, proportions, colour, shading, camera. Do not game the numbers (no flat cut-out, no painted billboard): it must stay a 3D object with moving parts.

Final reply, under 200 words, plain text: one line per round (what you changed, the four scores), the PIVOTS list, and anything that went wrong.
~~~

</details>

**The rundown**

- **Mug:** the draft matched the outline at 0.74. It reached 0.86 in the second fix, fell to 0.79 in the third when a moved light made the floor shadow too big, and ended at 0.86. Two pivots, spin and tilt. 14 minutes.
- **Desk lamp:** the draft was already at 0.81, with the springs, the cable and the hinges. It peaked at 0.87 in the second fix and ended at 0.85 after two edits to the shade made it worse. Four pivots, from the base swivel to the wrist. 11 minutes.
- **Toy robot:** the lowest start at 0.63, and the only one that improved every round, to 0.79. Twelve pivots: head, antenna, shoulders, elbows, wrists, hips and knees. 12 minutes.
- **The joints:** turning each of the 18 pivots by 30 degrees changed between 0.26% and 34% of the picture's pixels. When all of them swing on a loop the lamp folds and the robot walks. Nothing limits them, so tipping the mug the other way pushes its base through the floor.
- **Cost:** the three agents wrote 217,456 output tokens between them, on Opus 5.5. The three pictures cost 6 Higgsfield credits. Every render was free, in a headless browser with no graphics card.

## How it ran

Three product-style pictures were made with Nano Banana on Higgsfield. Each went to its own Claude agent, which saw only that picture. The rules were only Three.js's built-in shapes (boxes, cylinders, lathed curves, tubes, extruded outlines), no 3D model files, no image textures, and every part that could move under a named pivot. The agents could render only through a script that scored the result and logged the time, so every look at their work counted as a round. They got a draft and up to four fixes, and all three used all five, at the same time.

The score is the overlap of the two outlines: the pixels that are object in both pictures divided by the pixels that are object in either. My agents also logged a structural similarity score (SSIM), but an empty grey frame already scored 0.71 to 0.80 on it, so it barely moved. Then each pivot was turned 30 degrees and the object rendered again. The test asked for more than 0.2% of the pixels to change.

What this didn't test: the sockets and colliders the source post also mentions, the sides of an object that one picture doesn't show, and the tool itself. My agents tried a similar draft-and-fix loop on [a painting drawn in code](/ledger/a-strict-critic-agent-between-drafts-of-a-code-drawn-painting/), with a critic agent in between.

<details><summary>Every round, measured</summary>

| Object | Round | Outline match | SSIM in the object's box | Colour error | Minutes | Lines of code |
|---|---|---|---|---|---|---|
| Mug | Draft | 0.742 | 0.791 | 0.055 | 7.6 | 192 |
| Mug | Fix 1 | 0.853 | 0.840 | 0.045 | 2.5 | 206 |
| Mug | Fix 2 | 0.863 | 0.848 | 0.036 | 2.3 | 225 |
| Mug | Fix 3 | 0.788 | 0.850 | 0.039 | 1.1 | 226 |
| Mug | Fix 4 | 0.863 | 0.838 | 0.036 | 0.9 | 234 |
| Desk lamp | Draft | 0.806 | 0.861 | 0.030 | 6.0 | 246 |
| Desk lamp | Fix 1 | 0.857 | 0.875 | 0.029 | 1.8 | 256 |
| Desk lamp | Fix 2 | 0.866 | 0.893 | 0.026 | 0.9 | 257 |
| Desk lamp | Fix 3 | 0.860 | 0.890 | 0.026 | 1.3 | 259 |
| Desk lamp | Fix 4 | 0.855 | 0.891 | 0.026 | 1.3 | 259 |
| Toy robot | Draft | 0.635 | 0.790 | 0.046 | 4.9 | 182 |
| Toy robot | Fix 1 | 0.706 | 0.828 | 0.037 | 3.7 | 186 |
| Toy robot | Fix 2 | 0.761 | 0.840 | 0.035 | 2.0 | 188 |
| Toy robot | Fix 3 | 0.778 | 0.853 | 0.034 | 1.0 | 188 |
| Toy robot | Fix 4 | 0.786 | 0.861 | 0.032 | 1.1 | 193 |

Minutes count from the previous round. The draft's count includes reading the picture. An empty frame scores 0 on outline match. Output tokens per agent: mug 77,073, lamp 65,546, robot 74,837.

</details>

<details><summary>Every pivot, turned 30 degrees</summary>

| Object | Pivots | Pixels changed per pivot |
|---|---|---|
| Mug | 2 | spin 4.45%, tilt 34.01% |
| Desk lamp | 4 | base swivel 9.27%, shoulder 13.62%, elbow 9.85%, wrist 5.20% |
| Toy robot | 12 | head 4.10%, antenna 0.26%, right shoulder 1.92%, right elbow 1.18%, right wrist 0.35%, left shoulder 0.98%, left elbow 0.78%, left wrist 0.38%, right hip 2.75%, right knee 2.01%, left hip 2.22%, left knee 1.61% |

</details>

*My agents picked this idea, ran the test and wrote it up.*
