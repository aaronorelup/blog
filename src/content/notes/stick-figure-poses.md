---
post: "stick-figure-poses"
title: "Posing with a stick figure: the recipe for your agent"
summary: "What an AI agent needs to rerun the test: the stick figures, the model and graph, the prompts, and the scripts that score the pictures and draw the sheets."
---

This page is written for the agent that reruns the experiment in [the post](/ledger/stick-figure-poses/).
Adapt anything to the computer and the character you are given, and say what you changed next to
the scores. The parts marked **keep** are what makes a rerun's scores comparable with the post's.

## What to make

- **4 poses x 3 versions = 12 pictures**, one seed each. A: the pose in words only. B: the stick
  figure only. C: the stick figure and the words.
- **The comparison table**, the **scored grid** and **what OpenPose saw**. `sheets.py` in the kit
  makes all three from the scores.
- Look at every picture yourself too. The scores miss things like a missing tail or a prop held
  wrong.

## The kit

Download into one folder: [pose1.png](/media/stick-figure-poses/kit/pose1.png),
[pose2.png](/media/stick-figure-poses/kit/pose2.png), [pose3.png](/media/stick-figure-poses/kit/pose3.png),
[pose4.png](/media/stick-figure-poses/kit/pose4.png) (the stick figures, **keep**),
[targets.json](/media/stick-figure-poses/kit/targets.json) (their joints),
[pose.py](/media/stick-figure-poses/kit/pose.py), [score.py](/media/stick-figure-poses/kit/score.py)
and [sheets.py](/media/stick-figure-poses/kit/sheets.py).

The stick figures are 1024 x 1024, OpenPose's colours on black. pose1 is an arabesque seen from
the side facing right, pose2 a deep lunge facing the viewer with both hands overhead, pose3 a
sprint seen from the side facing right, pose4 a star jump facing the viewer.

## Model and graph

- **ComfyUI 0.37.0 or newer**, the release that added Qwen-Image 2.1. If it's older, ask before
  updating it.
- **Qwen-Image 2.1, Comfy-Org's int8 repackage** on Hugging Face (`Comfy-Org/Qwen-Image-2.1`):
  `diffusion_models/qwen_image_2.1_int8_convrot.safetensors` (7.3 GB),
  `text_encoders/qwen3vl_8b_int8_convrot.safetensors` (9.4 GB),
  `vae/qwen_image_2.1_vae_bf16.safetensors` (0.7 GB). Another build of Qwen-Image 2.1 the reader
  already has is fine. A different edit model works too, as long as it takes several reference
  pictures, but say so next to the scores.
- **Measured on an 8 GB RTX 4070 laptop GPU with 64 GB of RAM:** 6.9 to 7.3 GB of graphics memory
  at peak, 61 to 66 s a picture with two references, 111 to 140 s with three. 13 pictures in 23
  minutes.
- **Settings (keep):** 1024 x 1024 empty latent, 25 steps, cfg 1.0, euler, simple, denoise 1.0,
  seed 3801. The output must be 1024 x 1024 so the picture shares the stick figure's frame.
- Every picture the graph loads goes in ComfyUI's `input` folder.

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

This is version C of the lunge. For version A, delete node 22 and the `images.image_3` input, and
wire node 23 into `images.image_2`.

</details>

## Reference pictures

- **B and C (keep the order):** `<image1>` a full-body front view of the character, `<image2>` the
  stick figure, `<image3>` the character's main picture.
- **A:** `<image1>` the front view, `<image2>` the main picture.
- The post used a crop of the front panel of her character sheet and her main picture. With only
  one picture of the character, use it in both places, full body or not, and say so.

## The prompt

In this order, as one paragraph:

1. **Style:** the post used "Painterly dark-fantasy illustration of one full figure, seen whole
   from head to boots and tail, on a plain flat mid-grey studio background with a faint floor
   shadow, soft even light." Write one that suits the character. Keep the full figure and the plain
   grey background, since they make the scoring easier.
2. **The character:** a description of the character that names the reference pictures. The post's
   began "The girl is Jefrie, the same girl as in `<image1>` and `<image3>`: ..." (A: `<image1>`
   and `<image2>`).
3. **B and C, the stick-figure sentence (keep):** "Her pose is exactly the pose of the stick figure
   in `<image2>`: the same angle of every arm, leg and her body, at the same place and size in the
   picture. `<image2>` is only a pose guide: draw no lines, dots or stick figure in the picture."
   Change "her" to fit the character, nothing else.
4. **A and C, the pose in words (keep, changing only pronouns and the prop):**
   - Arabesque: "She balances in a ballet arabesque, seen from the side, facing the right of the
     picture: she stands on one straight leg, her other leg is lifted and stretched straight out
     behind her at hip height, level with the ground, her body tips forward a little, and both arms
     are stretched out wide, one reaching forward and one reaching back, a little above shoulder
     height."
   - Lunge: "She drops into a deep lunge facing the viewer: the knee on the left side of the
     picture is bent at a right angle with that thigh level with the ground and the shin straight
     up and down; the leg on the right side of the picture is stretched out straight, diagonally
     down to the side. Her body is upright, and she holds her scythe horizontally above her head
     with both hands, both arms raised and her elbows bent outward." Swap "her scythe" for the
     character's own long prop, or write "both hands raised above her head" instead.
   - Sprint: "She sprints at full speed, seen exactly from the side, running toward the right of
     the picture: her body leans forward, her front knee is driven high with that thigh pointing
     forward, her back leg is pushed off behind her with the foot kicked up, one arm swings forward
     with the elbow bent and the hand up by her face, and the other arm swings back behind her."
   - Star jump: "She leaps high into the air in a star jump, facing the viewer: both arms are flung
     up and out in a wide V above her shoulders and both legs are spread wide apart in an
     upside-down V, so her body makes a big X; her boots are far off the ground."
5. **The prop:** in the lunge, one sentence describing the prop. The other three poses said "Her
   hands are empty: no weapon."
6. **Colour:** one sentence on the character's palette.

## Scoring (keep)

- **OpenPose body model** from `controlnet_aux` 0.0.9, weights `lllyasviel/Annotators` (a few
  hundred MB, downloaded on first use), run on the CPU. `pose.py` loads it and already patches
  `torch.load` for torch 2.6 and newer.
- **Install** into the Python that has torch, which is ComfyUI's own on a portable install:
  `pip install --no-deps controlnet_aux==0.0.9`, so its pinned versions leave torch alone. Then
  check that `cv2`, `timm`, `skimage`, `einops`, `scipy` and `huggingface_hub` import, and install
  any that don't (`opencv-python-headless`, `scikit-image`), never upgrading torch.
- **Run** every script with that same Python, from the kit folder:
  - `python score.py scores.json <render>:pose1:A <render>:pose1:B ...` for all twelve.
  - `python sheets.py scores.json <folder of the renders> <out folder>` prints the comparison
    table beside the post's averages and writes `grid.jpg` and `openpose.jpg`.
  - Also score the character's reference pictures against each target (`<ref>:pose1:ref` and so on)
    as a baseline. The post's references scored 31 to 70 degrees.
- **The rules:** the biggest person in the picture. A joint counts at 0.6 confidence or more. Ten
  limbs: upper arms, forearms, thighs, shins, torso (neck to the middle of the hips) and head (neck
  to nose). The error is the mean absolute angle difference between each limb and the target's, in
  degrees. OpenPose picks left and right separately for the arms and the legs, so each picture is
  scored four ways (as labelled, all swapped, arms swapped, legs swapped) and keeps the lowest.
- **The comparison number** for a pose averages each version over only the limbs found in all its
  versions. A version with fewer than 4 limbs found is left out of that pose, and a pose with fewer
  than 4 common limbs is not comparable. Report which.
- `score.py`'s `stick_share` counts bright pixels that aren't red, to catch a painted stick figure.
  It only works for a grey and red character. For any other, look at the pictures instead.
- **A test for setup:** one render through the graph with any picture as `<image1>`, then
  `score.py` on it. It should print `scored` with a joint count.

## The post's numbers, to compare with

| Pose | A, words | B, stick figure | C, both | Limbs common |
|---|---|---|---|---|
| Arabesque | 26.5 | 8.7 | 8.4 (no tail) | 7 |
| Lunge, scythe overhead | 10.0 | 9.3 | 2.9 | 9 |
| Side-view sprint | 26.4 | 58.1 | 6.3 (seed 3802: 4.5) | 5 |
| Star jump | 8.2 | 36.5 | 4.1 | 10 |
| Average | 17.8 | 28.1 | 5.4 | |

The null, each picture scored against the other three targets, was 35 to 58 degrees. No picture
had the stick figure drawn into it.
