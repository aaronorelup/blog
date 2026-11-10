# video-hands-fretboard: trials

Lane agent `try-video-hands-fretboard`, started 2026-11-10 20:52 UTC. Every timed run went through `gtr-run`
(ledger `/home/user/gtr/ledger/runs.jsonl`); unless a line says otherwise a run had **2 CPU cores** (one slot of the
4-vCPU Intel Xeon 2.10 GHz box, no GPU). "Wall" is the gtr-run wall clock of the whole command (model load, frame
decoding from PNG, drawing and writing included); "per-frame inference" is measured inside the script around the
model call only (`time.perf_counter`), so it excludes PNG decoding and drawing.

Inputs: R3a from the shared set (`/home/user/gtr/inputs/R3a/R3a.mp4`, 540 frames, 640x480, 30000/1001 fps) and R3a_cu,
a 10 s close shot from the same CC BY-SA 4.0 concert video added by this lane (300 frames; see `inputs.md`). Frames
were decoded once to PNG with `ffmpeg -i <clip>.mp4 -vsync 0 <dir>/%04d.png`. There is no ground truth for either
clip, so the numbers below are counts, rates and times, not accuracy.

**Modes.** `full` = the 640x480 frame as it is. `crop` = a fixed box around both hands, upscaled 3x with OpenCV
`INTER_CUBIC` (R3a: medium shot box (200,110)-(440,350) to 720x720, wide shot box (200,100)-(480,320) to 840x660),
or for R3a_cu the whole frame upscaled 2x to 1280x960. Boxes were set by eye from gridded frames (`inputs.md`).
Landmarks found in a crop are mapped back to full-frame pixels (`x = x0 + x_crop / 3`) before any comparison.

**Where detections landed (R3a).** With no truth, each detection's box centre was sorted into hand-set regions
(full-frame pixels, read by eye off frames 100 and 300; `scripts/hand_regions.py`): medium shot fretting-hand region
(340,160)-(410,260), picking-hand region (280,245)-(360,320); wide shot fretting-hand region (330,150)-(450,235). In
the wide shot the picking hand is behind the music stand (by eye, frame 300), so no picking region is defined there.
"elsewhere" means outside these boxes. The shot table: medium = frames 0-217 and 439-539 (319 frames), wide = frames
218-438 (221 frames), from `ffmpeg select='gt(scene,0.12)'` cuts at frames 218 and 439.

Shared scripts: `scripts/vhf_common.py` (frames, shots, crops, summaries, sample writer), `scripts/hand_regions.py`.

## MediaPipe Hand Landmarker (tasks API) 1.2.2

- What it is: Google's palm detector plus 21-point hand landmark model, run through the MediaPipe Tasks Python API.
  Package `mediapipe` 1.2.2 from PyPI (uploaded 2026-11-03, wheel `mediapipe-1.2.2-py3-none-manylinux_2_28_x86_64.whl`),
  model bundle `hand_landmarker.task` (7,819,105 bytes, sha256
  `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`) from
  `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task`,
  downloaded 2026-11-10 without a login.
- Install (worked): `uv venv --python 3.11 venv-mediapipe && uv pip install --python venv-mediapipe/bin/python
  mediapipe==1.2.2` (pulls numpy 2.4.6, opencv-contrib-python 5.0.0.93, matplotlib, sounddevice; full list in
  `samples/mediapipe-hand-landmarker/uv-pip-freeze.txt`), venv 473 MB apparent size (files hard-linked from the shared
  uv cache). Dead end: the first two runs (r0057, r0061) failed at import with `OSError: libGLESv2.so.2: cannot open
  shared object file`; fixed with `apt-get install -y libgles2 libegl1` (libgles2 1.7.0-1build1). Version 1.2.2 has no
  `mp.solutions` attribute (the older "solutions" API is gone from this release; `hasattr(mp, 'solutions')` is False).
  `mediapipe.tasks.python.vision` in 1.2.2 exposes HandLandmarker, PoseLandmarker, HolisticLandmarker and FaceLandmarker.
- Settings for every run: `running_mode=VIDEO` (`detect_for_video` with timestamps n x 1000 / 29.97 ms),
  `num_hands=2`, `min_hand_detection_confidence=0.5`, `min_hand_presence_confidence=0.5`,
  `min_tracking_confidence=0.5`. Script: `scripts/run_mediapipe_hands.py <clip> <full|crop> <model> <outdir>`.

| run | clip, mode | frames | wall | CPU (user+sys) | peak RSS | per-frame inference mean / median / p90 | fps from mean | frames with 0 / 1 / 2 hands | handedness labels | mean handedness score (min) |
|---|---|---|---|---|---|---|---|---|---|---|
| r0071 | R3a full 640x480 | 540 | 27.83 s | 23.2 s | 224.6 MB | 36.94 / 35.11 / 53.13 ms | 27.07 | 1 / 267 / 272 | Left 679, Right 132 | 0.856 (0.500) |
| r0075 | R3a crop 3x | 540 | 27.14 s | 25.2 s | 225.6 MB | 36.88 / 35.43 / 50.12 ms | 27.11 | 0 / 462 / 78 | Left 565, Right 53 | 0.954 (0.509) |
| r0078 | R3a_cu full 640x480 | 300 | 14.29 s | 11.5 s | 211.3 MB | 32.56 / 27.66 / 44.81 ms | 30.71 | 0 / 300 / 0 | Left 300 | 0.995 (0.987) |
| r0087 | R3a_cu 2x (1280x960) | 300 | 13.76 s | 13.5 s | 238.1 MB | 29.41 / 27.91 / 37.50 ms | 34.00 | 0 / 300 / 0 | Left 300 | 0.995 (0.987) |

(Frame counts with 0/1/2 hands are the summary fractions times the frame count: r0071 0.0019/0.4944/0.5037 of 540.)

Per shot on R3a (from the `.summary.json` files):

| run | shot | frames | 0 / 1 / 2 hands (fraction) | per-frame inference mean | labels |
|---|---|---|---|---|---|
| r0071 full | medium | 319 | 0.0031 / 0.8182 / 0.1787 | 42.47 ms | Left 335, Right 40 |
| r0071 full | wide | 221 | 0.0 / 0.0271 / 0.9729 | 28.95 ms | Left 344, Right 92 |
| r0075 crop | medium | 319 | 0.0 / 0.7837 / 0.2163 | 40.61 ms | Left 344, Right 44 |
| r0075 crop | wide | 221 | 0.0 / 0.9593 / 0.0407 | 31.50 ms | Left 221, Right 9 |

Where the R3a detections landed (`hand_regions.py`, frames with at least one detection in the region):

| run | medium: fretting region | medium: picking region | medium: elsewhere | wide: fretting region | wide: elsewhere |
|---|---|---|---|---|---|
| r0071 full | 318 of 319 | 54 of 319 | 2 | 221 of 221 | 215 |
| r0075 crop | 319 of 319 | 63 of 319 | 0 | 221 of 221 | 9 |

- What the "wide: elsewhere" detections are: in r0071, 215 detections have box centres in the 20-px cell
  (340-360, 260-280). On frame 300 that detection (label "Left", handedness score 0.5443, box (336,250)-(357,280)) sits,
  by eye on a 3x crop, on the white sheet music hanging from the music stand, not on a hand. The fretting-hand detection
  on the same frame has score 0.9959 and box (349,175)-(384,219). In the 3x crop run the same spot produced 9 detections.
- Labels against the hands, by eye on the sample frames: the detection on the fretting hand (the player's left hand)
  is labelled "Left" in every sample frame. The docs page says: "Left and Right handedness correspond to the subject's
  hands, not the viewer." and "Passing a horizontally mirrored image will invert these outputs."
  (https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker, read 2026-11-10). Detections in
  the medium-shot picking region carry both labels (r0071: Left 23, Right 31; r0075: Left 32, Right 31).
- R3a_cu: one hand (the fretting hand, by eye on frames 0, 150, 280) in all 300 frames in both modes; the picking hand
  is not in this shot.
- Output excerpt (R3a_cu frame 150, `samples/.../R3a_cu_full.frame150.jsonl`): label "Left", score 0.9985, wrist
  (landmark 0) at normalized (0.85115, 0.6729), index fingertip (landmark 8) at (0.75431, 0.38754), i.e. pixel
  (482.8, 186.0) in the 640x480 frame.
- Output format facts (for handoffs): per frame a `HandLandmarkerResult` with three parallel lists, one entry per
  hand: `handedness` (list of `Category` with `category_name` "Left"/"Right", `score`, `index`), `hand_landmarks` (21
  `NormalizedLandmark` with `x`, `y` normalized to the image width and height, `z` relative depth with the wrist as
  origin; the docs' wording is quoted above) and `hand_world_landmarks` (21 `Landmark` with x, y, z in meters, origin
  at the hand's geometric centre per the docs). Landmark order: 0 wrist, 1-4 thumb (CMC, MCP, IP, tip), 5-8 index,
  9-12 middle, 13-16 ring, 17-20 pinky (tips are 4, 8, 12, 16, 20). The script stores per frame: `n`, `t_s`, `shot`,
  `view_wh`, `view_tf` (crop offset and scale), `t_infer_ms`, and per hand `label`, `score`, `lm_norm_view`,
  `lm_px_full` (pixels in the 640x480 frame), `world_m`. Files: `out/mediapipe-hands/<clip>_<mode>.jsonl` (R3a full
  1,460,405 bytes; not copied), summaries and 5-frame excerpts in `samples/mediapipe-hand-landmarker/`.
- Input format facts: an `mp.Image` in SRGB (uint8 HxWx3) per call; VIDEO mode needs a timestamp in ms that increases
  monotonically. 640x480, 720x720, 840x660 and 1280x960 inputs were all accepted.
- Constraint inputs that matter for a re-run: `num_hands`, the three confidence thresholds, `running_mode` (IMAGE,
  VIDEO, LIVE_STREAM). There is no region-of-interest input in the Python options; cropping (as here) is done outside.
- Oddities: every run logs `landmark_projection_calculator.cc:81] Using NORM_RECT without IMAGE_DIMENSIONS is only
  supported for the square ROI. Provide IMAGE_DIMENSIONS or use PROJECTION_MATRIX.` and, at interpreter exit,
  `Exception ignored in: <function HandLandmarker.__del__ ...> TypeError: 'NoneType' object is not callable` (exit code
  still 0; the landmarker was not closed explicitly before exit).
- Samples: `samples/mediapipe-hand-landmarker/` (annotated WebP frames R3a full 100 and 300, crop 100 and 300,
  R3a_cu 150; summaries; 5-frame JSONL excerpts; frame 300 and frame 150 records; uv pip freeze).
