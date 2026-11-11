> **Handoff note (added when this copy was made for `docs/tea-handoff/`; the text below it is unchanged).** Paths starting with `/workspace/` are on the build box only and are not in this repository. `/workspace/teahouse_alt/hero_work/carry/` is `hero/` in this folder (stills, compressed GLBs, sheets, lab page, tools, PODS.txt, COSTS.md). Everything else under `hero_work/` (the raw TRELLIS GLBs, full-size stills, per-model sheets, compression variants) stayed on the box. The tools hard-code box paths (`/workspace/teahouse_alt/hero_work/...`) and read keys through the box's `getkey.py`: adjust both before running them. The reference images they name (`world1_*.jpg`, `ip_eltv_still_01.jpg`, `jefrie_canon_tail_ride.jpg`) are original art that stayed on the box (`HANDOFF.md` section 10). Pod state was re-checked independently for the handoff: see `HANDOFF.md` section 8.

# hero-spike: TRELLIS pipeline spike for the /tea/ hero (status)

**Pods: all four pods I created are TERMINATED. Confirmed through the RunPod API at 19:14 CST: `myself.pods` is empty. No pod is running.**

Written by the hero-spike worker, 2026-11-10, 12:57 to about 14:30 CST, with a restart at 13:05. All work is in
`/workspace/teahouse_alt/hero_work/` (scratch, not git). This file is meant to stand alone: a fresh session with no
access to that box should be able to repeat everything from it. The small outputs are copied to
`/workspace/teahouse_alt/hero_work/carry/`.

## 0. Verdict in one paragraph

**The pipeline is proven end to end:** still, then TRELLIS.2 on a RunPod 4090, then a GLB, then compression, then a
Three.js puppet in a lab page.
- TRELLIS.2 turned eight of nine stills into good models.
- The models that pass: Jefrie A-pose and leap, Yusef A-pose, Echo A-pose and leap, the CRT, the lantern and the bell.
- One failed: Yusef's mid-flight leap came out as a flat relief.
- **For the hero, use Jefrie and Yusef around the CRT television.** Echo is the alternate.
- **Rig approach to ship: a hybrid.** Rigid named parts with pivots for the head and arms, plus skinned bone chains for
  tails and wings (computed in the browser at load), plus whole-body bob and lean. Use the pose-baked leap meshes where a
  pose cannot be reached by rotating parts.
- Compressed sizes: Yusef 619 KB, which passes the 900 KB cap. The CRT is 237 KB, which passes the 250 KB cap. Jefrie is
  still 1.36 MB, over the cap, and needs the cleaner TRELLIS export noted below.
- **Cost about USD 5.6, of which about USD 3.4 was a pod sitting idle after its jobs finished** (my session stalled).
  Every pod is now terminated.

## 1. Pods and cost

| Pod | GPU | Route | $/h | Created | Final state |
|---|---|---|---|---|---|
| vdz1yk8137gg6f | RTX 4090 secure | image `camenduru/trellis2:latest` (29 GB, weights baked in) | 0.89 | 13:04 | TERMINATED 13:49. The image pull never finished: still no container after 45 min |
| e9i3f2qwqzy9yx | RTX 4090 secure | `runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404` + bootstrap | 0.89 | 13:32 | TERMINATED 13:49. pip refused the install (dependency conflict between the cumesh and o_voxel wheels) |
| pdv3f0gwb5d1be | RTX 4090 secure | same, bootstrap fixed (`--no-deps` per wheel) | 0.89 | 13:49 | TERMINATED 14:09. Deps and weights were ready in 4 min and the pipeline loaded in 2, but my job thread never started (bug), and a hot-swap restart killed itself |
| 3c8oacy2gt6wlr | RTX 4090 secure | same, worker bug fixed | 0.89 | 14:09 | TERMINATED 18:12 (API confirms). All 9 jobs finished by 14:23, then the pod sat idle until 18:12 because my session stalled |

Pod time is about 5.41 h, so about 4.82 (3c8oacy2gt6wlr alone: 4.05 h, USD 3.60) USD. Images cost about USD 0.82 (section 3). There is also a per-row log in
`hero_work/COSTS.md`, and the pod ledger is `hero_work/PODS.txt`.

## 2. Route to TRELLIS: what worked, what failed and why

1. **No hosted image-to-3D key.** The key NAMES available through `getkey.py --list` include RUNPOD, GEMINI, XAI and
   VERCEL_AI_GATEWAY, and no fal, Replicate, Hugging Face, Tripo, Meshy or Stability key.
2. **The public HF Space `microsoft/TRELLIS.2` (gradio_client) failed.** Its API is `/start_session`, `/preprocess_image`,
   `/image_to_3d` and `/extract_glb`. The first call returned *"You have exceeded your ZeroGPU quota (90s requested vs. 47s
   left). Try again in 2:30:15. Authenticate with a Hugging Face token for more quota."* The quota is per IP or anonymous,
   so it is useless without an HF token. `trellis-community/TRELLIS` is up but shares the same quota. `JeffreyXiang/TRELLIS`
   is in CONFIG_ERROR. Script: `tools/trellis2_space.py`. It would work with an HF token (`HF_TOKEN` env), which we do not have.
3. **Pod A with the prebuilt image `camenduru/trellis2:latest` failed.** It is a 29.3 GB image with TRELLIS.2-4B, RMBG-2.0
   and DINOv3 mirrored ungated under `camenduru/*` and baked in, and its CMD is a RunPod serverless worker that uploads to S3.
   The pod sat in "pulling" for 45 minutes on a secure 4090 host. **Do not use big prebuilt images on RunPod pods:** pulls are
   slow and you cannot see the progress.
4. **What works (pod B3): a cached generic image plus a 4-minute bootstrap.**
   - Image `runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404` (Python 3.12, torch 2.8.0+cu128). It is cached on hosts, so
     the container starts in about 20 s.
   - `tools/pod/boot.sh` pip-installs the pure deps, then installs camenduru's prebuilt cp312 wheels **one by one with
     `--no-deps`** (cumesh, flash_attn 2.8.3, flex_gemm, nvdiffrast 0.4.0, nvdiffrec_render, o_voxel, all from
     `https://github.com/camenduru/wheels/releases/download/trellis2/`). Installed together with deps, pip reports
     ResolutionImpossible.
   - It then clones `https://github.com/camenduru/TRELLIS.2-hf` (branch `dev`) to `/content/TRELLIS.2` and runs
     `hf download` for `camenduru/TRELLIS.2-4B`, `camenduru/RMBG-2.0` and `camenduru/dinov3-vitl16-pretrain-lvd1689m`,
     with HF_HOME=/content/cache and hf_transfer. These are ungated mirrors; the official `facebook/dinov3-*` repo is gated.
   - Measured times: pip about 30 s, wheels about 15 s, weights about 2.5 min, pipeline load about 2 min. **From create to
     READY is about 6 min.**
   - `tools/pod/server.py` is a tiny HTTP job server on port 8000. It is token-guarded (`?t=`, random token in
     `tools/pod/token`, not an API key). Endpoints: `POST /submit?name=&res=1024&dec=&tex=` with the image bytes as the body,
     `GET /status`, `GET /result/<name>.glb`, `GET /log` (boot log plus server log), and `POST /exec` (debug bash, 120 s).
     HTTP comes up first and the pipeline loads in a background thread, so failures can be read at `/log`.
   - `tools/pod/trellis_core.py` is camenduru's `worker_runpod.py` with the S3 and RunPod handler removed. It loads
     `Trellis2ImageTo3DPipeline.from_pretrained('camenduru/TRELLIS.2-4B')` with `low_vram=True`, removes the background with
     BiRefNet (RMBG-2.0), crops and squares, runs the `1024_cascade` pipeline (12/12/12 steps), then calls
     `o_voxel.postprocess.to_glb(decimation_target, texture_size, remesh=True)` and exports with `extension_webp=True`.
   - Launch is `tools/pod/create_b.py "NVIDIA GeForce RTX 4090"`. It tars server.py, trellis_core.py and boot.sh and passes
     them base64-encoded in `docker_args`, sets env SPIKE_TOKEN, exposes `ports="8000/http"`, and uses an 80 GB container disk.
     Calls go through `tools/pod/client.py submit|status|log|wait` against `https://<podId>-8000.proxy.runpod.net`.
     Terminate with `tools/pod/terminate.py <id>`, which confirms through the API and rewrites PODS.txt.
   - Per-model timing on the 4090: jefrie_apose took 130 s (first job, includes warm-up), yusef_apose 54 s, jefrie_leap 60 s, prop_bell 74 s, echo_leap 54 s, prop_crt 103 s, echo_apose 62 s, prop_lantern 47 s, yusef_leap 43 s. That is about 11 min for all nine at `res=1024`, `dec=150000`, `tex=2048`. Each raw GLB is 5.5 to 8.3 MB, with about 140k to 150k triangles and WebP textures
5. **Gotchas met:**
   - The RunPod proxy returns 404 or 502 for a while after boot, and some POSTs get dropped. Resubmit and check `/status`.
   - The proxy cuts requests at about 100 s, so use submit and poll.
   - `pkill -f` on a command line that contains its own pattern kills itself.
   - In the generic image, `hf` exists only after `huggingface_hub[cli]` is installed.
   - Gemini image billing hit HTTP 402 after 3 images.
   - GPU stock was "Low" for every 24 GB+ type; only secure 4090s could be had (L40S, A6000, 6000 Ada and A5000 had none).

## 3. Stills (all in `hero_work/stills/`, copies in `carry/stills/`)

The prior logs (`/workspace/jefrie_gb_log.md`, `/workspace/jefrie_fight_iterations.md`) do not name the image model they
used. Script: `tools/gen_stills.py` (Gemini, `generateContent` with the reference image(s) inline and
`responseModalities: ["IMAGE"]`, aspect 1:1) and `tools/gen_xai.py` (xAI `POST https://api.x.ai/v1/images/edits`, model
`grok-imagine-image-2.0`, `image: {type: "image_url", url: data-URI}` for one reference or `images: [...]` for several,
`response_format: b64_json`). The prompts per still live in `tools/gen_stills_jobs.py` (JOBS dict plus the ISO suffix).

| Still | Model | References | Verdict |
|---|---|---|---|
| jefrie_apose | grok-imagine-image-2.0 | world1_jefrie.jpg, jefrie_canon_tail_ride.jpg | Excellent and on-model: mask grin, red ear flaps, torn cape, tail laid to her left on the floor, arms clear |
| jefrie_leap | gemini-3-pro-image | same | Excellent: rides the coiled tail, red-eyed scythe raised |
| yusef_apose | grok-imagine-image-2.0 | world1_yusef.jpg | Good: halo, wings spread, arms out. The wings sit close to the arms |
| yusef_leap | grok-imagine-image-2.0 | world1_yusef.jpg | Good: wings up, lantern raised, red book |
| echo_apose | grok-imagine-image-2.0 | world1_echo.jpg | Good: bell helmet, trench coat, satchel, arms out |
| echo_leap | gemini-3-pro-image | world1_echo.jpg | Good: lunge with the hand bell. Greyer coat than canon |
| prop_crt | gemini-3-pro-image | ip_eltv_still_01.jpg | Excellent: wood-grain 70s set, blank dark screen, rabbit ears |
| prop_lantern | grok-imagine-image-2.0 | world1_yusef.jpg | Good: ornate brass lantern, lit candle |
| prop_bell | grok-imagine-image-2.0 | world1_echo.jpg | Good: canon fleshy red clapper hanging out |

Shared prompt suffix (ISO): *"Isolated single subject, full body entirely in frame with generous margin on all sides,
centered, on a perfectly flat plain light grey (#d8d8d8) studio background, no floor, no ground shadow, no scenery, no
text, even soft frontal lighting, no strong rim light. Painterly dark-fantasy illustration style matching the reference,
sharp clean silhouette edges."* The A-pose prompts ask for arms at 45 degrees and away from the body, hands empty (props
are separate models), wings open away from the body, and Jefrie's tail laid out to one side rather than coiled. Contact
sheets: `spike/sheets/stills_a.jpg` and `stills_b.jpg`.

## 4. Image to 3D results and per-candidate verdicts

Raw GLBs are in `hero_work/raw/<name>.glb` (61 MB in total; they stay on the box). The 4-angle sheets (front, right,
back, left) are in `hero_work/spike/sheets/<name>.png`. The combined sheets are `chars_apose.jpg`, `chars_leap.jpg` and
`props.jpg`, also in `carry/sheets/`.

| Model | Verdict |
|---|---|
| jefrie_apose | **Good.** Silhouette, mask, red ear flaps, cape and scaled tail all read from every side, and the back of the cape is plausible. The tail curls around in front of her feet on the floor, so a tail chain must follow that curl. Textures are very dark, and she will need a rim light at night. |
| jefrie_leap | **Good.** The coiled tail ride works in 3D. The thin scythe blade, its red eye and the chain all survived. This is a strong pose-baked fallback. |
| yusef_apose | **Best of the set.** Face, halo, layered robe and full feathered wings, with a convincing back side. The wings are close to the body but separable. |
| yusef_leap | **Failed.** TRELLIS made a flat bas-relief: the side views are a sliver. Wide-open wings plus a three-quarter flying pose gave it no depth cue. Do not use it. Rig the A-pose instead. |
| echo_apose | **Good.** The bell helmet and trench coat read clearly. Fine detail is soft, and the back is dark. |
| echo_leap | **Very good.** A full 3D lunge with the hand bell in hand and the coat flaring. Usable as a pose-baked mesh as it is. |
| prop_crt | **Very good.** Wood-grain cabinet, knobs, speaker grille and rabbit ears. The convex screen is one surface with the body, so it needs a screen mask (UV region or vertex-position test) for the glow shader. The back is plausible but dark. |
| prop_lantern | **Very good.** Ornate hexagonal brass with readable glass panes. |
| prop_bell | **Very good.** The canon fleshy red clapper survived as geometry. |

## 5. Compression

Command: `tools/compress.sh in.glb out.glb ratio texsize simplify-error`. It runs `gltf-transform optimize` with meshopt
geometry, WebP textures, simplify and weld. Three.js 0.160 needs `MeshoptDecoder` from
`examples/jsm/libs/meshopt_decoder.module.js`.

| Model | Raw | Settings | Result | Tris | Quality |
|---|---|---|---|---|---|
| yusef_apose | 6.67 MB | ratio 0.12, tex 1024, error 0.01 | **619 KB** | 25,810 | Holds up: face, halo and feathers are fine, with slight texture softening (`spike/sheets/compressed.jpg`) |
| prop_crt | 6.03 MB | ratio 0.05, tex 512, error 0.01 | **237 KB** | 10,942 | Holds up. The screen glass is slightly blotchy |
| prop_bell | 5.52 MB | ratio 0.05, tex 512, error 0.002 | 171 KB | | Fine |
| prop_lantern | 7.42 MB | same | 703 KB | 41,818 | Over the prop cap. Needs error 0.01 or a 3k-triangle Blender pass |
| echo_leap | 7.29 MB | ratio 0.14, tex 1024, error 0.002 | 1.19 MB | | Over the cap |
| jefrie_apose | 8.30 MB | ratio 0.12, tex 1024, error 0.01 | 1.36 MB | 51,978 | **Over the cap.** The simplifier stalls at about 52k triangles because TRELLIS's UV atlas has many seams |

How to get Jefrie and the others under 900 KB in phase 2:
- Ask TRELLIS's own extractor for fewer faces: `dec=30000`. Its remesh path rebuilds the UVs, and Aaron's
  props-three-budgets post found 30k from TRELLIS fine (it was 3k that shattered).
- Drop the metallicRoughness texture (about 250 KB at 1024). A night hero can use base colour plus a simple roughness constant.
- Optionally use the Blender voxel-remesh, collapse and re-bake recipe from that post.
- All the compressed files are in `hero_work/spike/compressed/` and in `carry/glb/`.

## 6. Rig test

**Done. Proof: `hero_work/spike/rig_test.png` (also `carry/sheets/rig_test.jpg`).** It shows Yusef (the compressed
619 KB TRELLIS model) in three poses of a wing-beat cycle.

The lab page is `spike/lab/index.html` with `rigs.js`. Modes: `live` animates, `poses` shows three phases side by side,
`parts` colour-codes the cut. At load, the page:
1. Normalises the mesh: feet at y=0, height 1.
2. Cuts the triangles into named parts by centroid tests, with an overlap band so seams stay covered when a part rotates.
3. Parents each part to a pivot group at its joint.
4. For parts that declare a `chain` polyline, builds a SkinnedMesh with bones along the polyline and linear-blend weights
   from the nearest segment. Bone 0 is fixed at the root, so the joint with the body never opens.

Results, in the order the brief asked:
- **(i) Rigid parts alone:** fine for the head and arms. Tested on Aaron's prior Jefrie (`carry/sheets/rig_prior_jefrie_rigid_tail.jpg`).
  Rigid tail segments show doubled scales and spikes where the segments overlap, so they are not good enough for tails.
- **(ii) A skinned chain for the tail:** smooth (`carry/sheets/rig_prior_jefrie_skinned_tail.jpg`). On Yusef, the head and arms
  are rigid and each wing is a 5-bone chain. The part split is clean (`carry/sheets/rig_yusef_parts.jpg`).
  - At full beat amplitude the lower feathers stretch into shards (`carry/sheets/rig_test_too_strong.jpg`).
  - At about 0.2 rad per bone the beat reads cleanly (`rig_test.jpg`).
- **What I would ship:** this hybrid, plus whole-body bob, lean and squash, with pose-baked meshes (jefrie_leap, echo_leap)
  swapped or cross-faded in for the extreme leap moment.
- **Limits:**
  - Feather sheets only take modest angles.
  - The neck seam shows past about 0.2 rad of head turn.
  - The sleeves move with the arms as rigid pieces.
  - No real skeleton for legs (robes and coats hide them; Jefrie's legs are short).
- Jefrie's new A-pose model was NOT rigged in this spike. Her tail curls on the floor in front of her, so its chain needs a
  curved polyline. The lab supports that, but it is untested on her.

## 7. Recommendation for the hero

- **Characters: Jefrie and Yusef.**
  - Jefrie is the strongest silhouette, and her leap model (riding her tail, scythe up) survived TRELLIS whole.
  - Yusef is the cleanest model and the one already rigged and compressed under budget.
  - Light against dark gives the frame the contrast the Shopify hero gets from its two figures.
  - **Alternate: Echo.** echo_leap is the best action model of the set, and the bell prop is good.
- **Object: the CRT television** (prop_crt). It is clean, 237 KB, and the blank screen can take an emissive shader.
- **Rig:** the hybrid above.
  - Yusef: wing chains, rigid arms and head, and the lantern as a separate rigid prop parented to his hand pivot.
  - Jefrie: a tail chain along her curl, rigid arms and head.
  - The scroll timeline drives the bone rotations and the root transform. For the leap peak, cross-fade to the pose-baked
    jefrie_leap mesh (or keep her in the leap pose throughout and animate only the tail and cape chains).

## 8. What remains risky

**Not proven:**
- A rig on Jefrie's new model.
- Jefrie under 900 KB.
- The CRT screen-glow mask.
- How the models look lit at night in the real scene with the painted background.
- Performance on mobile with two skinned characters.
- Any skeleton with real weights (Blender automatic weights or UniRig). Aaron's own `ai-rigging-vs-a-script` post says
  UniRig tears tails and capes.

**Risky:**
- TRELLIS fails on wide flat poses (yusef_leap).
- The textures come out dark, so they need lighting work.
- GPU stock on RunPod is "Low" for every 24 GB+ type.
- Gemini image billing is capped (HTTP 402).
- The xAI pricing I logged is an estimate.

## 9. Phase 2 production plan (estimates are agent wall clock)

1. **Final stills** (45 min). Use grok-imagine-image-2.0 with the reference images and the prompts in
   `tools/gen_stills_jobs.py`, 2 to 3 variants per character, and pick by eye.
   - Jefrie A-pose with the tail laid in a gentle S to one side, not curled in front of her feet.
   - Yusef A-pose with the wings a little further from the body.
   - A leap pose for Jefrie only. Yusef flies by rig, and any Yusef leap still must be three-quarter with the wings not
     edge-on.
   - Keep the CRT, lantern and bell as they are, or regenerate the CRT with the screen as a separate dark inset.
2. **Final models** (40 min plus about USD 1). Launch with `tools/pod/create_b.py "NVIDIA GeForce RTX 4090"`; it is READY
   in about 6 min. Run each still at 1024 with `dec=30000 tex=1024` and also at `dec=150000`.
   **Terminate the pod as soon as `client.py wait` returns.** Never leave it waiting on a person.
3. **Compression** (30 min). Use compress.sh, drop metallicRoughness, and target under 900 KB per character and under
   250 KB per prop. Check with the turntable sheets.
4. **Rig** (2 to 3 h).
   - Port `spike/lab` logic into the hero module.
   - Jefrie: tail chain along a curved polyline, cape as a 3-bone chain, rigid arms and head.
   - Yusef: as in the lab, with a two-chain fan per wing so the feathers do not stretch, and the lantern parented to the
     right-hand pivot with its candle emissive.
   - Idle loop plus a scroll timeline. Check every keyframe with screenshots.
5. **Background** (1.5 h). One painted night tea-house garden picture (image model, 16:9, about 2400 px), with the door
   lit and lanterns, matched to the homepage night palette. Cut one or two depth layers (a foreground cherry branch and
   bushes, the middle house) with a matte, saved as WebP with alpha. Place them on planes at three depths and add pointer
   parallax.
6. **Poster** (30 min). Render the opening frame from the real scene, as WebP under 150 KB, for first paint, reduced
   motion and no WebGL.
7. **Integration and budgets** (2 h). Hero chunk, lazy load, byte cap under 4 MB in total, Playwright screenshots.

Total: about 1 working day of agent time, plus about USD 2 of GPU and images.

## 10. Files

Tools (all under `/workspace/teahouse_alt/hero_work/tools/`):
- `gen_stills.py`: Gemini image generation. `IMG_MODEL` env, default gemini-3-pro-image. Arguments are job names.
- `gen_stills_jobs.py`: the JOBS dict (references and prompt per still) and the ISO suffix, shared by both generators.
- `gen_xai.py`: xAI grok-imagine-image-2.0 image edits with references. Arguments are job names.
- `list_models.py`: lists image model names for Gemini and xAI.
- `probe_spaces.py`, `trellis2_space.py`: the HF Space route. It failed on quota; it works with an HF token.
- `pod/boot.sh`, `pod/server.py`, `pod/trellis_core.py`: what runs on the pod.
- `pod/create_b.py` (the route that works), `pod/create.py` (the prebuilt-image route, do not use), `pod/client.py`,
  `pod/terminate.py`, `pod/gql.py` (raw RunPod GraphQL), `pod/podinfo.py`.
- `queue_all.sh`: submits all nine stills.
- `compress.sh in.glb out.glb ratio texsize` runs `gltf-transform optimize` with meshopt, WebP, simplify and weld.
- `node/shot.mjs url out.png [w h]` takes Playwright screenshots (Chromium with SwiftShader WebGL). `node/package.json`
  holds @gltf-transform 4, three 0.160, meshoptimizer and sharp.
- Keys are read at run time through `python3 ~/.claude/bin/getkey.py NAME`, with INFISICAL_CLIENT_ID unset. No key value
  is in any file.

Pages (serve `hero_work/` with `python3 -m http.server 4455`):
- `spike/turntable/index.html?src=/raw/x.glb&label=...`: a 4-angle sheet (front, right, back, left).
- `spike/lab/index.html?rig=<name>&mode=live|poses|parts` with `spike/lab/rigs.js`: the puppet lab.

## 11. What is carried over and what stays on the box

`/workspace/teahouse_alt/hero_work/carry/` is 5.9 MB:
- `stills/` holds the 9 stills as WebP at 1024.
- `glb/` holds the compressed GLBs:
  - yusef_apose_e01 619 KB
  - prop_crt_e01 237 KB
  - prop_bell 171 KB
  - prop_lantern 703 KB
  - echo_leap 1.19 MB
  - jefrie_apose_e01 1.36 MB
- `sheets/` holds the contact sheets and the rig screenshots.
- `lab/` holds the lab page, rigs.js and the turntable page.
- `tools/` holds all scripts, without the venv, node_modules or token.
- PODS.txt and COSTS.md.

Bigger files that stay on this box:
- `hero_work/raw/*.glb`: the 9 raw TRELLIS.2 GLBs, 5.5 to 8.3 MB each, 61 MB in total, plus `prior_jefrie_v2.glb`.
- `hero_work/stills/*.jpg`: full-resolution stills, 2.3 MB.
- `hero_work/spike/sheets/*.png`: per-model sheets.
- `hero_work/spike/compressed/`: all compression variants.
- `hero_work/tools/venv` and `tools/node/node_modules`: re-create them with `pip install gradio_client requests trimesh
  pillow numpy runpod` and `npm i @gltf-transform/cli@4 @gltf-transform/core@4 @gltf-transform/extensions@4
  @gltf-transform/functions@4 meshoptimizer three@0.160.0 sharp`.
