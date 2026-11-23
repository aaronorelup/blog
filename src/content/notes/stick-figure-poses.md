---
post: "stick-figure-poses"
title: "Posing with a stick figure: the recipe for your agent"
summary: "What an AI agent needs to rerun the test: the stick figures and their joints, the model and graph, the prompts, and how each picture was scored."
---

This page is written for the agent that reruns the experiment in [the post](/ledger/stick-figure-poses/).
Adapt anything to the computer and the character you are given. The parts marked **keep** are what
makes a rerun's scores comparable with the post's.

## What to make

- **4 poses x 3 versions = 12 pictures**, one seed each. A: the pose in words only. B: the stick
  figure only. C: the stick figure and the words.
- **A scored grid**: the targets down the left, A, B and C across, the limb error under each
  picture, the closest of each row marked.
- **What OpenPose saw**: every picture with the skeleton OpenPose found drawn over it and the
  target in a corner, joints under 0.6 confidence drawn hollow.
- Look at every picture yourself too. The scores miss things like a missing tail or a prop held
  wrong.

## The stick figures (keep)

The exact targets, 1024 x 1024, OpenPose's colours on black:
[pose1.png](/media/stick-figure-poses/kit/pose1.png) (arabesque, side view facing right),
[pose2.png](/media/stick-figure-poses/kit/pose2.png) (deep lunge facing the viewer, both hands
overhead), [pose3.png](/media/stick-figure-poses/kit/pose3.png) (sprint, side view facing right),
[pose4.png](/media/stick-figure-poses/kit/pose4.png) (star jump facing the viewer). Their joints,
in pixels in the same frame, OpenPose's 18 names, `null` where a joint isn't drawn:
[targets.json](/media/stick-figure-poses/kit/targets.json).

<details><summary>The joints as text</summary>

```json
{"W": 1024, "H": 1024, "poses": {
"pose1": {"nose":[659.2,245.4],"neck":[622.0,298.6],"r_shoulder":[611.5,294.7],"r_elbow":[729.6,273.9],"r_wrist":[832.9,251.9],"l_shoulder":[632.5,302.4],"l_elbow":[514.4,281.5],"l_wrist":[411.0,259.6],"r_hip":[553.7,462.7],"r_knee":[380.8,447.6],"r_ankle":[191.1,431.0],"l_hip":[568.8,468.2],"l_knee":[568.8,641.8],"l_ankle":[568.8,832.2],"r_eye":[651.2,227.8],"l_eye":null,"r_ear":[617.6,232.6],"l_ear":null},
"pose2": {"nose":[483.8,325.0],"neck":[483.8,389.8],"r_shoulder":[423.8,389.8],"r_elbow":[338.9,305.0],"r_wrist":[375.1,205.8],"l_shoulder":[543.8,389.8],"l_elbow":[628.7,305.0],"l_wrist":[592.5,205.8],"r_hip":[441.4,567.4],"r_knee":[273.7,612.4],"r_ankle":[273.7,802.8],"l_hip":[526.2,567.4],"l_knee":[633.1,704.2],"l_ankle":[750.3,854.2],"r_eye":[469.4,307.4],"l_eye":[498.2,307.4],"r_ear":[448.6,313.8],"l_ear":[519.0,313.8]},
"pose3": {"nose":[638.9,352.1],"neck":[601.8,405.2],"r_shoulder":[594.0,403.2],"r_elbow":[692.3,472.0],"r_wrist":[745.1,380.5],"l_shoulder":[609.4,407.3],"l_elbow":[524.6,492.1],"l_wrist":[480.0,587.9],"r_hip":[549.6,575.1],"r_knee":[462.8,725.5],"r_ankle":[278.9,676.2],"l_hip":[561.9,578.4],"l_knee":[725.0,519.1],"l_ankle":[692.0,706.5],"r_eye":[630.9,334.5],"l_eye":null,"r_ear":[597.3,339.3],"l_ear":null},
"pose4": {"nose":[512.0,272.1],"neck":[512.0,336.9],"r_shoulder":[452.0,336.9],"r_elbow":[348.1,276.9],"r_wrist":[256.6,224.1],"l_shoulder":[572.0,336.9],"l_elbow":[675.9,276.9],"l_wrist":[767.4,224.1],"r_hip":[469.6,514.5],"r_knee":[388.1,667.8],"r_ankle":[298.7,835.9],"l_hip":[554.4,514.5],"l_knee":[635.9,667.8],"l_ankle":[725.3,835.9],"r_eye":[497.6,254.5],"l_eye":[526.4,254.5],"r_ear":[476.8,260.9],"l_ear":[547.2,260.9]}}}
```

</details>

They were drawn for a small figure with a large tail, scaled to 0.8 of the frame to leave room
for the tail and cape. Keep them as they are for any humanoid character.

## Model and graph

- **ComfyUI 0.37.0 or newer** (that release added Qwen-Image 2.1).
- **Qwen-Image 2.1, Comfy-Org's int8 repackage** on Hugging Face (`Comfy-Org/Qwen-Image-2.1`):
  `diffusion_models/qwen_image_2.1_int8_convrot.safetensors` (7.3 GB),
  `text_encoders/qwen3vl_8b_int8_convrot.safetensors` (9.4 GB, CLIPLoader type `qwen_image`),
  `vae/qwen_image_2.1_vae_bf16.safetensors` (0.7 GB).
- **Measured on an 8 GB RTX 4070 laptop GPU:** peak 6.9 to 7.3 GB. 61 to 66 s a picture with two
  references, 111 to 140 s with three. 13 pictures, 23 minutes.
- **Settings (keep):** 1024 x 1024 empty latent, 25 steps, cfg 1.0, euler, simple, denoise 1.0,
  seed 3801.
- On a smaller card, or with another edit model the reader already has, use what fits and say so
  next to the scores. Any edit model that takes several reference pictures can run the test.

<details><summary>The graph, in ComfyUI's API format</summary>

```json
{
 "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "qwen_image_2.1_int8_convrot.safetensors", "weight_dtype": "default"}},
 "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen3vl_8b_int8_convrot.safetensors", "type": "qwen_image", "device": "default"}},
 "3": {"class_type": "VAELoader", "inputs": {"vae_name": "qwen_image_2.1_vae_bf16.safetensors"}},
 "4": {"class_type": "TextEncodeQwenImage21", "inputs": {"clip": ["2", 0], "prompt": "<the prompt>", "negative_prompt": "", "resolution": 1024, "vae": ["3", 0],
       "images.image_1": ["21", 0], "images.image_2": ["22", 0], "images.image_3": ["23", 0]}},
 "5": {"class_type": "QwenImage21Cache", "inputs": {"model": ["1", 0], "device": "auto", "dtype": "default"}},
 "6": {"class_type": "EmptyLatentImage", "inputs": {"width": 1024, "height": 1024, "batch_size": 1}},
 "7": {"class_type": "KSampler", "inputs": {"model": ["5", 0], "positive": ["4", 0], "negative": ["4", 1], "latent_image": ["6", 0],
       "seed": 3801, "steps": 25, "cfg": 1.0, "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0}},
 "8": {"class_type": "VAEDecode", "inputs": {"samples": ["7", 0], "vae": ["3", 0]}},
 "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "stick-figure-poses/pose2_C", "images": ["8", 0]}},
 "21": {"class_type": "LoadImage", "inputs": {"image": "character_front.png"}},
 "22": {"class_type": "LoadImage", "inputs": {"image": "pose2.png"}},
 "23": {"class_type": "LoadImage", "inputs": {"image": "character_main.png"}}
}
```

This is version C of the lunge. Version A drops node 22 and its `images.image_2` input, and
wires the main picture in as `images.image_2`.

</details>

## Reference pictures

- **B and C (keep the order):** `<image1>` a full-body front view of the character, `<image2>` the
  stick figure, `<image3>` the character's main picture.
- **A:** `<image1>` the front view, `<image2>` the main picture.
- The post used a crop of the front panel of her character sheet (918 x 1536) and her main
  picture (2528 x 1696). With only one picture of the character, use it for both.

## The prompt

In this order, as one paragraph:

1. **Style:** "Painterly dark-fantasy illustration of one full figure, seen whole from head to
   boots and tail, on a plain flat mid-grey studio background with a faint floor shadow, soft
   even light." Write one that suits the character. Keep the plain grey background and the full
   figure, since they make the scoring easier.
2. **The character:** a description of the reader's character, naming the reference pictures:
   "The girl is Jefrie, the same girl as in `<image1>` and `<image3>`: ..." (A: `<image1>` and
   `<image2>`).
3. **B and C, the stick-figure sentence (keep, word for word):** "Her pose is exactly the pose of
   the stick figure in `<image2>`: the same angle of every arm, leg and her body, at the same
   place and size in the picture. `<image2>` is only a pose guide: draw no lines, dots or stick
   figure in the picture." Change "her" to fit the character.
4. **A and C, the pose in words (keep):**
   - Arabesque: "She balances in a ballet arabesque, seen from the side, facing the right of the
     picture: she stands on one straight leg, her other leg is lifted and stretched straight out
     behind her at hip height, level with the ground, her body tips forward a little, and both arms
     are stretched out wide, one reaching forward and one reaching back, a little above shoulder
     height."
   - Lunge: "She drops into a deep lunge facing the viewer: the knee on the left side of the
     picture is bent at a right angle with that thigh level with the ground and the shin straight
     up and down; the leg on the right side of the picture is stretched out straight, diagonally
     down to the side. Her body is upright, and she holds her scythe horizontally above her head
     with both hands, both arms raised and her elbows bent outward."
   - Sprint: "She sprints at full speed, seen exactly from the side, running toward the right of
     the picture: her body leans forward, her front knee is driven high with that thigh pointing
     forward, her back leg is pushed off behind her with the foot kicked up, one arm swings forward
     with the elbow bent and the hand up by her face, and the other arm swings back behind her."
   - Star jump: "She leaps high into the air in a star jump, facing the viewer: both arms are flung
     up and out in a wide V above her shoulders and both legs are spread wide apart in an
     upside-down V, so her body makes a big X; her boots are far off the ground."
5. **The prop:** the lunge holds her scythe overhead, described in a sentence. The other three
   poses say "Her hands are empty: no weapon." Swap the scythe for the character's own prop, or
   leave the hands empty.
6. **Colour:** one sentence on the character's palette.

## Scoring (keep)

- **OpenPose body model** from `controlnet_aux` 0.0.9, weights `lllyasviel/Annotators`, on the
  CPU. Call `OpenposeDetector.from_pretrained("lllyasviel/Annotators").body_estimation(bgr_image)`
  directly: it returns the joints with their confidence.
- **Install** it into the Python that has torch and OpenCV (ComfyUI's own, on the post's laptop)
  with `pip install --no-deps controlnet_aux==0.0.9`, so its pinned dependencies leave torch
  alone. With torch 2.6 or newer, patch `torch.load` to pass `weights_only=False` before the
  import, or its weights refuse to load. An `AttributeError` about `MessageFactory` on import is
  harmless.
- **The scripts the post used:** [pose.py](/media/stick-figure-poses/kit/pose.py) (detect and
  draw) and [score.py](/media/stick-figure-poses/kit/score.py). Put both beside `targets.json` and
  run `python score.py scores.json render.png:pose2:C ...` (one `picture:pose:version` per
  picture).
- **The rules:** the biggest person in the picture. A joint counts at 0.6 confidence or more. Ten
  limbs: upper arms, forearms, thighs, shins, torso (neck to the middle of the hips) and head (neck
  to nose), each scored when both its ends are found. The error is the mean of the absolute angle
  differences between each limb and the target's, in degrees.
- **Left and right:** OpenPose picks them separately for the arms and the legs, so score each
  picture four ways (as labelled, all swapped, arms swapped, legs swapped) and keep the lowest.
- **The number to compare:** for each pose, average each version's per-limb errors over only the
  limbs found in all three of its versions. `score.py` writes the per-limb errors (`per_limb`).
- **Also stored:** the share of joints within 0.2 torso lengths of the target after a fit for
  position and size, and a null: the same picture scored against the other three targets.
- **The painted-lines check** in `score.py` (`stick_share`) counts bright pixels that aren't red,
  which only works for a grey and red character like hers. For another character, look at the
  pictures instead.

## The post's numbers, to compare with

| Pose | A, words | B, stick figure | C, both | Limbs common |
|---|---|---|---|---|
| Arabesque | 26.5 | 8.7 | 8.4 (no tail) | 7 |
| Lunge, scythe overhead | 10.0 | 9.3 | 2.9 | 9 |
| Side-view sprint | 26.4 | 58.1 | 6.3 (seed 3802: 4.5) | 5 |
| Star jump | 8.2 | 36.5 | 4.1 | 10 |
| Average | 17.8 | 28.1 | 5.4 | |

Her reference pictures' own poses scored 31 to 70 degrees against the four targets. The null was
35 to 58. No picture had the stick figure drawn into it.
