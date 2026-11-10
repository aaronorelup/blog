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

## HaMeR (3D hand mesh), commit not cloned: NOT RUN HERE

- What it is: "HaMeR" 3D MANO hand mesh recovery from one image (`geopavlakos/hamer`), README read 2026-11-10 at
  https://raw.githubusercontent.com/geopavlakos/hamer/main/README.md .
- NOT RUN HERE: the MANO hand model needs a registered account. README: "Besides these files, you also need to
  download the MANO model. Please visit the [MANO website](https://mano.is.tue.mpg.de) and register to get access to
  the downloads section.  We only require the right hand model. You need to put `MANO_RIGHT.pkl` under the
  `_DATA/data/mano` folder." From this box, `https://mano.is.tue.mpg.de/download.php` redirected to
  `https://mano.is.tue.mpg.de/login.php` (curl -L, 2026-11-10).
- Demo weights: `fetch_demo_data.sh` (read 2026-11-10) downloads `hamer_demo_data.tar.gz` from Google Drive with
  `gdown https://drive.google.com/uc?id=1mv7CUAnm73oKsEEG1xE3xH2C_oqcFSzT` or, commented out,
  `wget https://www.cs.utexas.edu/~pavlakos/hamer/data/hamer_demo_data.tar.gz`. A `curl -I` of the utexas URL from this
  box failed with `curl: (60) SSL certificate problem: unable to get local issuer certificate` (not retried, TLS not
  disabled). Its size was not read.
- The README's install example is for CUDA ("This is for CUDA 11.7, but you can adapt accordingly"); CPU use is not
  stated in it.

## WiLoR (hand detector + 3D hand mesh): NOT RUN HERE (mesh: MANO login; detector: pickle load refused)

- What it is: `rolpotamias/WiLoR` (README read 2026-11-10 at raw.githubusercontent.com/rolpotamias/WiLoR/main/README.md):
  a YOLO-based hand detector (`detector.pt`) plus a transformer that regresses MANO hand meshes (`wilor_final.ckpt`).
- Weights: the Hugging Face model repo `rolpotamias/WiLoR` is not gated (`"gated": false` from
  `https://huggingface.co/api/models/rolpotamias/WiLoR`, 2026-11-10) and lists `detector.pt`, `detector_medium_v2.pt`,
  `detector_small.pt`, `wilor_final.ckpt`; its card metadata says `license: cc-by-nc-4.0`. The repository's
  `license.txt` begins "Attribution-NonCommercial-NoDerivatives 4.0 International"; the README says "WiLoR models fall
  under the [CC-BY-NC--ND License](./license.txt)."
- NOT RUN HERE (mesh): the README says "It is also required to download MANO model from [MANO website]
  (https://mano.is.tue.mpg.de). Create an account by clicking Sign Up and download the models (mano_v*_*.zip). Unzip
  and place the right hand model `MANO_RIGHT.pkl` under the `mano_data/` folder."
- A third-party copy of `MANO_RIGHT.pkl` exists: the Hugging Face repo `warmshao/WiLoR-mini` (not gated) lists
  `pretrained_models/MANO_RIGHT.pkl`, and WiLoR-mini's pipeline code downloads it with `hf_hub_download(...,
  filename="MANO_RIGHT.pkl")` when the file is missing. It was not downloaded or used here, because the MANO license
  (https://mano.is.tue.mpg.de/license.html, read 2026-11-10) says: "No Distribution The Software and the license herein
  granted shall not be copied, shared, distributed, re-sold, offered for re-sale, transferred or sub-licensed in whole or
  in part except that you may make one copy for archive purposes only." and "By downloading and/or using the Software,
  you acknowledge that you have read these terms and conditions, understand them, and agree to be bound by them."
- The hand detector alone (`detector.pt` from `https://huggingface.co/rolpotamias/WiLoR/resolve/main/detector.pt`,
  53,582,271 bytes, sha256 `5ef3df44e42d2db52d4ffe91f83a22ce9925e2acc9abebf453f2c5d22e380033`, downloaded without a
  login) was meant to run through Ultralytics as a hand-box detector. Loading it with `YOLO('detector.pt')` stopped with
  `ModuleNotFoundError: No module named 'dill'` (the checkpoint is a pickle that needs `dill` to load). The next step,
  installing `dill` and unpickling this third-party checkpoint, was refused by this session's permission check
  ("[Code from External]"), so the detector was NOT RUN HERE. Its class names were not read.

## Hamba (3D hand mesh): NOT RUN HERE

- `humansensinglab/Hamba`, README read 2026-11-10 (raw.githubusercontent.com/humansensinglab/Hamba/main/README.md).
- NOT RUN HERE: "Download the MANO hand model. Please visit the [MANO website](https://mano.is.tue.mpg.de) and register
  to get access to the downloads section. Our model only requires the right hand MANO model." Demo weights are a
  Google Drive file ("download the trained Hamba model weights [here](https://drive.google.com/file/d/1JRPC11YfQym8t_EZkhsroglvGHrGPbU-/view?usp=sharing)").
  The README's install sample is "for CUDA 11.7"; CPU use is not stated. README license line: "This work is licensed
  under a [Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc]."

## MANO hand model: what the license says (needed by HaMeR, WiLoR, Hamba)

Read 2026-11-10 at https://mano.is.tue.mpg.de/license.html (page text extracted from the HTML):

- "Licensor grants you (Licensee) personally a single-user, non-exclusive, non-transferable, free of charge right: To
  install the Software on computers owned, leased or otherwise controlled by you and/or your organization; To use the
  Software for the sole purpose of performing non-commercial scientific research, non-commercial education, or
  non-commercial artistic projects; To modify, adapt, translate or create derivative works based upon the Software."
- "Any other use, in particular any use for commercial, pornographic, military, or surveillance, purposes is
  prohibited. This includes, without limitation, incorporation in a commercial product, use in a commercial service, or
  production of other artifacts for commercial purposes."
- "For commercial uses of the Software, please send email to ps-license@tue.mpg.de"

## Segment Anything 3 (SAM 3): NOT RUN HERE

- `facebook/sam3` on Hugging Face: `"gated": "manual"` (API https://huggingface.co/api/models/facebook/sam3,
  2026-11-10; card metadata `license: other`; files include `sam3.pt` and `model.safetensors`). Unauthenticated
  requests for `config.json` and `sam3.pt` under `/resolve/main/` answered HTTP 401. No Hugging Face token is among
  the key names in Aaron's key store (names listed with `getkey.py --list`; no values read), so access could not be
  requested from here.

## Grounding DINO (tiny), OWLv2 (base) and YOLO-World v2: NOT RUN HERE (disk)

- At 21:12 UTC the orchestrator's disk notice (printed by `env.sh`) said: "start no new download or install over 200 MB
  unless your lane cannot finish without it; pick the smallest checkpoint a model offers". Free disk was 7.9 GB.
- Sizes read from the Hugging Face API (`?blobs=true`, 2026-11-10): `IDEA-Research/grounding-dino-tiny`
  `model.safetensors` 689,359,096 bytes (card `license: apache-2.0`, not gated); `google/owlv2-base-patch16-ensemble`
  `model.safetensors` 619,918,824 bytes (`license: apache-2.0`, not gated). YOLO-World v2 in Ultralytics
  (`yolov8s-worldv2.pt`, 25,923,032 bytes, downloaded) calls `set_classes` through the OpenAI CLIP "ViT-B/32" text
  encoder (`ultralytics/nn/tasks.py` line 1189: `build_text_model("clip:ViT-B/32", ...)`), whose weight file
  `https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt` has `content-length: 353976522`. All three
  are over the 200 MB limit, and YOLOE-26 (below) was run as this lane's open-vocabulary detector instead, with its
  MobileCLIP2 text encoder (`mobileclip2_b.ts`, 253,794,476 bytes) downloaded before the notice.
- The script for all four detectors is `scripts/run_openvocab.py` (`gdino`, `owlv2`, `yoloworld`, `yoloe`); only
  `yoloe` was run.

## MMPose (framework): NOT RUN HERE; the same RTMPose / RTMW / DWPose models ran through rtmlib

- MMPose's `requirements/mminstall.txt` (main branch, read 2026-11-10): "mmcv>=2.0.0,<3.0.0", "mmdet>=3.0.0,<3.3.0",
  "mmengine>=0.4.0,<1.0.0". OpenMMLab's prebuilt CPU wheels of mmcv: the index for torch 2.4
  (`https://download.openmmlab.com/mmcv/dist/cpu/torch2.4/index.html`) lists mmcv-2.2.0 for cp38-cp312; the index for
  torch 2.1 lists mmcv-2.1.0 and 2.2.0; `.../cpu/torch2.15/index.html` answered 404. The torch in this lane's venv is
  2.15.0+cpu, so MMPose would need a second torch (2.4 or older) or an mmcv source build; the disk notice says "never
  install a second torch or tensorflow version if an existing venv can be reused". Not attempted.

## Roboflow Universe fretboard datasets and models: NOT RUN HERE

- `curl https://api.roboflow.com/code-and-chords/guitar-necks-detector-ogacd` (no key) answered HTTP 401:
  `{"error":{"message":"This method requires your API key.","type":"OAuthException",...}}`;
  `https://detect.roboflow.com/guitar-necks-detector-ogacd/1` answered 401 `{"status":401,"message":"Unauthorized
  api_key"}`; the Universe page `https://universe.roboflow.com/code-and-chords/guitar-necks-detector-ogacd` answered
  403 with a "Just a moment..." challenge page (2026-11-10). No Roboflow key is among the key names in Aaron's store.
  The project names come from the docs agent's survey (`survey.md`, Tool list).

## TapToTab (arXiv 2409.08618): NOT RUN HERE

- "TapToTab : Video-Based Guitar Tabs Generation using AI and Audio Analysis" (Ghaleb et al., submitted 13 September
  2024). The arXiv abstract page (https://arxiv.org/abs/2409.08618, read 2026-11-10) has no code, data or weights link;
  the docs agent's survey also found none. Nothing to run.

## TAPIR / BootsTAPIR and TAPNext (google-deepmind/tapnet): NOT RUN HERE (disk)

- Checkpoint sizes (`curl -I`, 2026-11-10): `https://storage.googleapis.com/dm-tapnet/bootstap/bootstapir_checkpoint_v2.pt`
  218,886,140 bytes; `.../causal_bootstapir_checkpoint.pt` 218,887,028 bytes;
  `.../tapnext/bootstapnext_ckpt.npz` 776,980,182 bytes. All are over the 200 MB download limit of the disk notice;
  CoTracker3 (102 MB checkpoint) was run as this lane's point tracker. The tapnet README (read 2026-11-10) links Colab
  demos, among them "**Standard PyTorch TAPIR**" (`colabs/torch_tapir_demo.ipynb`) and "**BootsTAPNext PyTorch**"
  (`colabs/torch_tapnext_demo.ipynb`).

## OpenCV 5.0.0: Canny + HoughLinesP and LSD on the neck, before and after rectification

- What it is: classical edge and line detection (`cv2.Canny`, `cv2.HoughLinesP`, `cv2.createLineSegmentDetector`)
  and a perspective rectification (`cv2.getPerspectiveTransform`, `cv2.warpPerspective`). Package
  `opencv-contrib-python` 5.0.0.93 (PyPI), used from the MediaPipe venv (`cv2.__version__` "5.0.0").
- Install: nothing extra (it came with mediapipe 1.2.2). Oddity: in OpenCV 5 `HoughLinesP` returns an array of shape
  (N, 4), not (N, 1, 4) as in 4.x; the script reshapes both detectors' output to (-1, 4).
- Input: R3a_cu frames 150, 0 and 280 (640x480). The neck quadrilateral was set BY HAND on a gridded 2x crop of frame
  150: nut end upper edge (541,120), nut end lower edge (575,168), body end lower edge (225,390), body end upper edge
  (195,335) (full-frame pixels). "Body end" is where the visible fretboard meets the guitar's upper bout in this view,
  not a named fret. The same quad was reused unchanged on frames 0 and 280. The quad's long axis is at 148.14 degrees
  and its nut-end width is 58.8 px. Rectified size 800x116 px, nut at x = 0, the fretboard's upper edge (in the image)
  at y = 0.
- Settings: `Canny(50, 150)`; `HoughLinesP(rho=1, theta=pi/180, threshold=30, minLineLength=20, maxLineGap=5)`; LSD
  with default parameters. Classification: "string-like" = within 10 degrees of the neck axis and at least 20 px
  (unrectified) or 40 px (rectified) long; "fret-like" = within 20 degrees of the perpendicular and at least 40 % of the
  fretboard width long. Unrectified segments count only if their midpoint lies inside the quad. Fret-like segments in the
  rectified image are grouped by x (gap <= 8 px), string-like ones by y (gap <= 4 px).
- Run: `scripts/run_opencv_lines.py <outdir>`, gtr-run r0149 with `--nolock` (a light job, so no CPU slot and no core
  pinning): wall 1.91 s, CPU 0.8 s, peak RSS 94.1 MB for all three frames, both detectors, both views. Times measured
  inside the script per frame: unrectified 0.13-0.45 s, rectified 0.20-0.30 s.

| frame | view | HoughLinesP segments (in quad) | Hough string-like / fret-like | LSD segments (in quad) | LSD string-like / fret-like |
|---|---|---|---|---|---|
| 150 | unrectified | 142 (70) | 37 / 27 | 443 (129) | 39 / 22 |
| 150 | rectified | 113 | 31 / 8 | 237 | 39 / 21 |
| 0 | unrectified | 116 (54) | 27 / 25 | 436 (129) | 44 / 20 |
| 0 | rectified | 107 | 31 / 10 | 228 | 36 / 17 |
| 280 | unrectified | 118 (61) | 29 / 31 | 421 (136) | 40 / 23 |
| 280 | rectified | 89 | 26 / 16 | 194 | 40 / 20 |

- Fret-like clusters in the rectified frame 150 (x in px from the nut): LSD 5.7, 98.9, 341.2, 410.6, 476.7, 537.2,
  594.8, 647.9, 698.1, 744.7, 789.7 (11 clusters); HoughLinesP 339.0, 408.5, 478.0, 647.0, 746.2, 793.0 (6). The
  fretting hand covers about x = 100-330 of the rectified image in this frame (by eye), and no cluster falls there.
  String-like clusters (y in px from the upper edge): LSD 6.4, 27.7, 46.2, 109.9; Hough 5.5, 28.1, 46.1. Six separate
  strings were not resolved at this size (the rectified fretboard is 116 px tall, from a 58.8 px wide original).
- Output format facts: `opencv_lines.json` = per frame and quad: `quad` (4 corners), `homography_img_to_rect` (3x3),
  `unrectified` {neck_axis_deg, fretboard_width_px, hough/lsd counts, time_s}, `rectified` {size, hough/lsd counts,
  `fret_x_clusters_px_from_nut`, `string_y_clusters_px_from_upper_edge`, time_s}. The rectified neck image of each frame
  is written as PNG (`out/opencv-lines/*_rectified.png`).
- Constraint inputs: the quad (4 points) and every threshold above are parameters; nothing is learned.
- Samples: `samples/opencv-lines/` (overlays: unrectified Hough per frame, rectified Hough and LSD per frame; JSON).
- A second quad taken from the SAM 2.1 neck mask (minimum-area rectangle) is supported by the script
  (`run_opencv_lines.py <outdir> <mask.png>`); see the SAM 2.1 section for whether it ran.

## Worked handoff on one frame: fingertip pixels -> rectified fretboard -> (string, fret) cell

A fact about formats, not a product. Frame 150 of R3a_cu, no ground truth. Script
`scripts/handoff_fingertip_to_cell.py`, gtr-run r0172 (`--nolock`, light: wall 1.2 s, CPU 0.4 s, 86.7 MB).

| step | done by | input | output |
|---|---|---|---|
| 1 | MediaPipe Hand Landmarker 1.2.2 (run r0078) | R3a_cu frame 150, 640x480 | 21 landmarks, label "Left", score 0.9985; fingertips 4, 8, 12, 16, 20 in pixels |
| 2 | BY HAND (four corners) + OpenCV `getPerspectiveTransform` (run r0149) | the neck quad | 3x3 homography to an 800x116 rectangle, nut at x = 0 |
| 3 | OpenCV LSD (run r0149) | rectified frame 150 | fret-like clusters at x = 5.7 (taken as the nut), 98.9, then 341.2 ... 789.7 (9 clusters right of the hand) |
| 4 | this script (a model, not a tool) | the 9 clusters right of the hand | 12-TET fit x_n = 5.7 + s (1 - 2^(-n/12)), trying first-fret numbers k0 = 1..14: best k0 = 4, s = 1584.4 px, RMS residual 5.96 px, max 8.64 px (k0 = 3: RMS 32.07 px; k0 = 5: RMS 14.88 px). Model frets 1-4 at x = 94.6, 178.6, 257.8, 332.6 |
| 5 | this script, by stated assumption | fingertip (u, v) | fret cell = n with x_(n-1) <= u < x_n; string cell = one of 6 equal lanes across the 116 px width, string 6 at the upper edge (bass side for a right-handed player seen from the front; not checked against string thickness) |

Result (pixel -> rectified (u, v) -> cell):

| fingertip (MediaPipe index) | pixel (x, y) | rectified (u, v) | fret cell | string cell | nearest detected fret lines (u) |
|---|---|---|---|---|---|
| thumb tip (4) | (490.56, 221.13) | (202.0, 115.3) | 3 | 1 | 98.9 / 341.2 |
| index tip (8) | (482.76, 186.02) | (175.8, 49.9) | 2 | 4 | 98.9 / 341.2 |
| middle tip (12) | (435.65, 196.79) | (266.7, 18.9) | 4 | 6 | 98.9 / 341.2 |
| ring tip (16) | (423.57, 217.63) | (309.5, 40.9) | 4 | 4 | 98.9 / 341.2 |
| pinky tip (20) | (430.49, 241.06) | (323.0, 86.1) | 4 | 2 | 98.9 / 341.2 |

- The thumb tip lands at v = 115.3 of 116, the lower edge; on a classical guitar the thumb is normally behind the
  neck, so its projection onto the fretboard plane is not a fretted position (no check was made here).
- Format chain: MediaPipe gives normalized x, y per landmark (the script multiplies by 640 and 480); OpenCV takes
  pixel points as a float array of shape (N, 1, 2) for `cv2.perspectiveTransform`; the cell is two integers.
- Done by hand: the four quad corners, the six-equal-lanes string rule, the "string 6 on top" assumption, and the
  choice of a 12-TET model for frets hidden under the hand. Samples: `samples/handoff/handoff_R3a_cu_f0150.json`
  and `handoff_R3a_cu_f0150_rectified.webp` (model frets as numbered ticks, detected frets as lines, fingertips as
  dots).

## OWLv2 (google/owlv2) through the public Space `merve/owlv2`; Grounding DINO Space failed

- Route: the model weights were over the box's 200 MB download limit (see above), so the public Hugging Face Space
  demos were called with `gradio_client` 2.7.2 (PyPI, installed into the torch venv). Both Spaces reported
  `"stage": "RUNNING"` on `cpu-basic` hardware (API `https://huggingface.co/api/spaces/<id>/runtime`, 2026-11-10). The
  model runs on Hugging Face's machine; times are network plus remote inference, not this box's CPU. Which OWLv2
  checkpoint the Space loads was not read.
- Space API (`Client.view_api()`): `merve/owlv2`: `predict(img: filepath, text_queries: str, score_threshold: float,
  api_name="/predict") -> AnnotatedImage = {image: filepath, annotations: [{image: filepath (a mask), label: str}]}`.
  The output has no score field; each box arrives as a mask image, and the script took the mask's bounding box.
  `merve/Grounding_DINO_demo`: two unnamed endpoints; `fn_index=0` takes a base64 image, a prompt, `box_threshold`,
  `text_threshold` and returns only an annotated image.
- Run: `scripts/run_spaces_openvocab.py`, gtr-run r0193 (`--nolock`; wall 68.16 s for both Spaces and all images,
  local CPU 1.6 s). Inputs: R3a_cu frame 150, R3a frame 100 (medium shot), R3a frame 300 (wide shot), as 640x480 PNG.
  OWLv2 settings: `text_queries="guitar neck, fretboard, headstock, capo, hand"`, `score_threshold=0.1`.
- OWLv2 results (label: count of boxes; time per image):

| image | time | guitar neck | fretboard | headstock | capo | hand |
|---|---|---|---|---|---|---|
| R3a_cu frame 150 | 19.67 s | 4 | 2 | 0 | 2 | 1 |
| R3a frame 100 | 18.54 s | 2 | 2 | 0 | 3 | 0 |
| R3a frame 300 | 25.30 s | 5 | 1 | 0 | 10 | 0 |

  There is no capo on the guitar in these frames (by eye). On R3a_cu frame 150 the one "hand" box is (417,170)-(565,345);
  the 21 MediaPipe fretting-hand landmarks on the same frame span x 423.57-546.70, y 177.72-322.99 (r0078). The two "capo"
  boxes there lie at y 405-479, the music-stand area at the bottom of the frame (by eye). All boxes:
  `samples/owlv2-space/spaces_results.json`; overlays: `samples/owlv2-space/*.webp`.
- Grounding DINO Space: all three calls failed with `ValueError('Unknown protocol: ws')` from gradio_client (the
  Space uses the older websocket queue). NOT RUN (local: weights over the disk limit; Space: client error). Steps for
  Aaron in `for-aaron.md`.
