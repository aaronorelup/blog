# video-hands-fretboard: trials

Lane agent `try-video-hands-fretboard`, started 2026-11-10 20:52 UTC. Every timed run went through `gtr-run`
(ledger `/home/user/gtr/ledger/runs.jsonl`); unless a line says otherwise a run had **2 CPU cores** (one slot of the
4-vCPU Intel Xeon 2.10 GHz box, no GPU). Exception found by the verifier: the rtmlib steps (ONNX Runtime) pinned some
of their own threads to cores outside the slot, so their times are not 2-core times (rtmlib section). "Wall" is the gtr-run wall clock of the whole command (model load, frame
decoding from PNG, drawing and writing included); "per-frame inference" is measured inside the script around the
model call only (`time.perf_counter`), so it excludes PNG decoding and drawing.

Inputs: R3a from the shared set (`/home/user/gtr/inputs/R3a/R3a.mp4`, 540 frames, 640x480, 30000/1001 fps); R3a_cu,
a 10 s close shot from the same CC BY-SA 4.0 concert video added by this lane (300 frames; see `inputs.md`); and R3b
and R3c from the shared set once `/home/user/gtr/inputs/READY-VIDEO` appeared (2026-11-10T21:29:15Z): each 18 s,
1920x1080, 25 fps, 450 frames (sha256 of R3b.mp4 `95adf1a34c976ad67b6a443fe916a3a0b2755246efcd0a4ca13aee1814c675a6`, of R3c.mp4
`62467c5738fee276e51fbf3dc355188fddc862231f74d3e483a1e725baf52783`; see the shared manifest). R3a and
R3a_cu frames were decoded once to PNG (`ffmpeg -i <clip>.mp4 -vsync 0 <dir>/%04d.png`); R3b and R3c to JPEG at
`-q:v 2` to save disk. The decoded frames were deleted after the last run, to free shared disk (the `frames/`
folder's modification time is 22:43 UTC; the verifier decoded the R3a and R3a_cu frames and R3b frames 0, 225 and 449
again with the same commands for its re-runs, found them pixel-identical to the frames the trial saved as Space
inputs, and deleted them afterwards); the scripts expect them at `frames/R3a_%04d.png`, `frames/R3a_cu/f_%04d.png`, `frames/R3b/f_%04d.jpg` and
`frames/R3c/f_%04d.jpg` under the lane folder (see `scripts/vhf_common.py`), so a re-run must decode them again. There is no ground truth for any of these clips, so the numbers below are counts, rates and
times, not accuracy.

**Box load.** The two CPU slots were contended by about 20-25 queued jobs of other lanes during this lane's work, so
from 21:12 UTC this lane grouped several runs into one gtr-run job (`scripts/steps.sh`): the group's run id is in the
ledger, and each step's wall time, CPU time and peak memory come from GNU `time` inside that job
(`steps/<group>.steps.times.tsv`, copied to `samples/steps/`).

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

Shared scripts: `scripts/vhf_common.py` (frames, shots, crops, summaries, sample writer), `scripts/hand_regions.py`
(where detections landed), `scripts/steps.sh` (grouped jobs), `scripts/make_overlay_video.py` (landmark overlay
videos). Each tool's script is named in its section.

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
- Settings for every run: `running_mode=VIDEO` (`detect_for_video` with timestamps round(n x 1000 / fps) ms, fps
  29.97 for R3a and R3a_cu and 25 for R3b and R3c),
  `num_hands=2`, `min_hand_detection_confidence=0.5`, `min_hand_presence_confidence=0.5`,
  `min_tracking_confidence=0.5`. Script: `scripts/run_mediapipe_hands.py <clip> <full|crop> <model> <outdir>`.

| run | clip, mode | frames | wall | CPU (user+sys) | peak RSS | per-frame inference mean / median / p90 | fps from mean | frames with 0 / 1 / 2 hands | handedness labels | mean handedness score (min) |
|---|---|---|---|---|---|---|---|---|---|---|
| r0071 | R3a full 640x480 | 540 | 27.83 s | 23.2 s | 224.6 MB | 36.94 / 35.11 / 53.13 ms | 27.07 | 1 / 267 / 272 | Left 679, Right 132 | 0.856 (0.500) |
| r0075 | R3a crop 3x | 540 | 27.14 s | 25.2 s | 225.6 MB | 36.88 / 35.43 / 50.12 ms | 27.11 | 0 / 462 / 78 | Left 565, Right 53 | 0.954 (0.509) |
| r0078 | R3a_cu full 640x480 | 300 | 14.29 s | 11.5 s | 211.3 MB | 32.56 / 27.66 / 44.81 ms | 30.71 | 0 / 300 / 0 | Left 300 | 0.995 (0.987) |
| r0087 | R3a_cu 2x (1280x960) | 300 | 13.76 s | 13.5 s | 238.1 MB | 29.41 / 27.91 / 37.50 ms | 34.00 | 0 / 300 / 0 | Left 300 | 0.995 (0.987) |

(Frame counts with 0/1/2 hands are the summary fractions times the frame count: r0071 0.0019/0.4944/0.5037 of 540.)

R3b and R3c (1920x1080, 25 fps, 450 frames each), same settings, run as steps of group job C1 (gtr-run id in the
"Grouped jobs" table at the end; 2 cores; step times from GNU time):

| step | clip | wall | CPU (user+sys) | peak RSS | per-frame inference mean / median / p90 | fps from mean | frames with 0 / 1 / 2 hands | labels | mean score (min) |
|---|---|---|---|---|---|---|---|---|---|
| mediapipe-hands_R3b_full | R3b | 22.43 s | 21.89 s | 254.9 MiB | 26.52 / 24.74 / 32.86 ms | 37.71 | 5 / 445 / 0 | Left 445 | 0.989 (0.971) |
| mediapipe-hands_R3c_full | R3c | 21.53 s | 20.36 s | 258.3 MiB | 24.25 / 22.92 / 30.04 ms | 41.24 | 0 / 0 / 450 | Left 450, Right 450 | 0.989 (0.596) |

- On R3c the "Left" detections have a mean wrist position of (1679, 591) px, at the neck (the fretting hand, by eye on
  frames 0, 225, 449), and the "Right" detections (966, 901), at the sound hole (the picking hand). On R3b the one hand
  found ("Left", mean wrist (1110, 510)) is the fretting hand; the picking-hand fingers at the left edge of the picture
  were not detected in any frame.

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
  on the same frame has score 0.9959 and box (349,175)-(384,219). In the 3x crop run, 9 wide-shot detections (frames
  394-435, all labelled "Right", scores 0.53-0.76) lie outside the fretting region, with boxes of about
  (328,232)-(355,279) that overlap the frame-300 box above; their centres fall in the 20-px cell just above it,
  (340-360, 240-260) (verifier, from `out/mediapipe-hands/R3a_crop.jsonl`).
- Labels against the hands, by eye on the sample frames: the detection on the fretting hand (the player's left hand)
  is labelled "Left" in every sample frame. Over all medium-shot frames, the detections whose box centre lies in the
  fretting-hand region are Left 310 / Right 9 in r0071 and Left 312 / Right 13 in r0075 (`hand_regions.py`, counted
  by the verifier). The docs page says: "Left and Right handedness correspond to the subject's
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
  `NormalizedLandmark` with `x`, `y` normalized to the image width and height; the docs page: "z represents landmark
  depth with the wrist (#0) as the origin") and `hand_world_landmarks` (21 `Landmark` with x, y, z in meters; the docs
  page: "with the origin at the hand's geometric center"). Landmark order: 0 wrist, 1-4 thumb (CMC, MCP, IP, tip), 5-8 index,
  9-12 middle, 13-16 ring, 17-20 pinky (tips are 4, 8, 12, 16, 20). The script stores per frame: `n`, `t_s`, `shot`,
  `view_wh`, `view_tf` (crop offset and scale), `t_infer_ms`, and per hand `label`, `score`, `index`, `lm_norm_view`,
  `lm_px_full` (pixels in the full frame), `world_m`. Files: `out/mediapipe-hands/<clip>_<mode>.jsonl` (R3a full
  1,460,405 bytes; not copied), summaries and 5-frame excerpts in `samples/mediapipe-hand-landmarker/`.
- Input format facts: an `mp.Image` in SRGB (uint8 HxWx3) per call; VIDEO mode needs a timestamp in ms that increases
  monotonically. 640x480, 720x720, 840x660, 1280x960 and 1920x1080 inputs were all accepted, and the frame size may
  change between calls in VIDEO mode (it did at the R3a shot cut in crop mode).
- Constraint inputs that matter for a re-run: `num_hands`, the three confidence thresholds, `running_mode` (IMAGE,
  VIDEO, LIVE_STREAM). There is no region-of-interest input in the Python options; cropping (as here) is done outside.
- Oddities: every run logs `landmark_projection_calculator.cc:81] Using NORM_RECT without IMAGE_DIMENSIONS is only
  supported for the square ROI. Provide IMAGE_DIMENSIONS or use PROJECTION_MATRIX.` and, at interpreter exit,
  `Exception ignored in: <function HandLandmarker.__del__ ...> TypeError: 'NoneType' object is not callable` (exit code
  still 0; the landmarker was not closed explicitly before exit).
- Samples: `samples/mediapipe-hand-landmarker/` (annotated WebP frames R3a full 100 and 300, crop 100 and 300,
  R3a_cu 150, R3b and R3c 225; summaries; 5-frame JSONL excerpts; frame 300 and frame 150 records; uv pip freeze).
- Verifier re-run (steps of group job r0495, 2 cores, same commands): R3a_cu full and R3a full gave the same number of
  hands and the same labels in every frame, and every landmark pixel value equal to r0078 and r0071 (6,300 and 17,031
  landmarks compared). Per-frame inference mean in the re-run: 24.79 ms (R3a_cu) and 27.63 ms (R3a), against 32.56 and
  36.94 ms in the trial; step wall 10.74 s and 20.35 s.

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
- NOT RUN HERE (mesh): the README says
  "It is also required to download MANO model from [MANO website](https://mano.is.tue.mpg.de).
  Create an account by clicking Sign Up and download the models (mano_v*_*.zip). Unzip and place the right hand model
  `MANO_RIGHT.pkl` under the `mano_data/` folder."
- A third-party copy of `MANO_RIGHT.pkl` exists: the Hugging Face repo `warmshao/WiLoR-mini` (not gated) lists
  `pretrained_models/MANO_RIGHT.pkl`, and WiLoR-mini's pipeline code downloads it with `hf_hub_download(...,
  filename="MANO_RIGHT.pkl")` when the file is missing. It was not downloaded or used here, because the MANO license
  (https://mano.is.tue.mpg.de/license.html, read 2026-11-10) says: "No Distribution The Software and the license herein
  granted shall not be copied, shared, distributed, re-sold, offered for re-sale, transferred or sub-licensed in whole or
  in part except that you may make one copy for archive purposes only." and "By downloading and/or using the Software,
  you acknowledge that you have read these terms and conditions, understand them, and agree to be bound by them."
- The hand detector alone (`detector.pt` from `https://huggingface.co/rolpotamias/WiLoR/resolve/main/detector.pt`,
  53,582,271 bytes, sha256 `5ef3df44e42d2db52d4ffe91f83a22ce9925e2acc9abebf453f2c5d22e380033`, downloaded without a
  login; deleted unused at the end) was meant to run through Ultralytics as a hand-box detector. Loading it with `YOLO('detector.pt')` stopped with
  `ModuleNotFoundError: No module named 'dill'` (the checkpoint is a pickle that needs `dill` to load). The next step,
  installing `dill` and unpickling this third-party checkpoint, was refused by the trial session's permission check
  ("[Code from External]", as recorded by the trial agent; no log file of it), so the detector was NOT RUN HERE.
  Verifier check without executing the file: the same file (same sha256, re-downloaded, then deleted) is a zip whose
  `last/data.pkl` was read with Python's `pickletools` (which lists the pickle's opcodes and runs nothing). It
  references `dill._dill _load_type` (so loading it needs `dill`), `ultralytics.nn.tasks PoseModel` and
  `ultralytics.nn.modules.head Pose`, and the strings after `names` are `left` and `right`; the stored training path
  ends in `hand_side_all_medium2/weights/last.pt`. What the model outputs was not run here.

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

- From about 21:12 UTC (the trial agent's record; the notice's first appearance is not logged in any file the verifier
  found, and `env.sh`, which prints it, was last modified at 21:32:27 UTC) the orchestrator's disk notice (it reported
  "8027 MB free") said: "start no new download or install over 200 MB unless your lane cannot finish without it; pick
  the smallest checkpoint a model offers".
- Sizes read from the Hugging Face API (`?blobs=true`, 2026-11-10): `IDEA-Research/grounding-dino-tiny`
  `model.safetensors` 689,359,096 bytes (card `license: apache-2.0`, not gated); `google/owlv2-base-patch16-ensemble`
  `model.safetensors` 619,918,824 bytes (`license: apache-2.0`, not gated). YOLO-World v2 in Ultralytics
  (`yolov8s-worldv2.pt`, 25,923,032 bytes, downloaded, deleted unused at the end) calls `set_classes` through the OpenAI CLIP "ViT-B/32" text
  encoder (`ultralytics/nn/tasks.py` line 1189: `build_text_model("clip:ViT-B/32", ...)`), whose weight file
  `https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt` has `content-length: 353976522`. All three
  are over the 200 MB limit, and YOLOE-26 (below) was run as this lane's open-vocabulary detector instead, with its
  MobileCLIP2 text encoder (`mobileclip2_b.ts`, 253,794,476 bytes, file time 21:14:08 UTC; whether that was before the
  notice first appeared is UNVERIFIED, see above). The verifier re-read all sizes on 2026-11-10 and found the same
  byte counts (HF API for the two safetensors files; `curl -I` for `yolov8s-worldv2.pt` and `ViT-B-32.pt`).
- The script for all four detectors is `scripts/run_openvocab.py` (`gdino`, `owlv2`, `yoloworld`, `yoloe`); only
  `yoloe` was run locally (OWLv2 also ran through a public web demo; see its section).

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

## TAPIR / BootsTAPIR and TAPNext (google-deepmind/tapnet): NOT RUN HERE (BootsTAPIR, TAPNext: disk; TAPIR: permission check)

- Checkpoint sizes (`curl -I`, 2026-11-10; the verifier re-read the same values): `https://storage.googleapis.com/dm-tapnet/bootstap/bootstapir_checkpoint_v2.pt`
  218,886,140 bytes; `.../causal_bootstapir_checkpoint.pt` 218,887,028 bytes;
  `.../tapnext/bootstapnext_ckpt.npz` 776,980,182 bytes. These three are over the 200 MB download limit of the disk
  notice; CoTracker3 (102 MB checkpoint) was run as this lane's point tracker.
- The original TAPIR checkpoint, listed in the same README's Checkpoints table ("TAPIR | Jax & PyTorch"), is under
  that limit: `https://storage.googleapis.com/dm-tapnet/tapir_checkpoint_panning.pt` 124,348,474 bytes
  (`tapir_checkpoint_panning.npy` 124,307,770 bytes). The trial did not try it. The verifier downloaded it (sha256
  `628611c656b3bd65d4a70fbf5526b62afe82d1b085ce6044685287fb78509daa`), cloned tapnet (`git clone --depth 1`, commit
  `ceedd60bb9f6c9f7c74796e4445aff6c6ddf7c9b`, 2026-11-02), made a venv from the cached CPU torch 2.15.0 plus
  `dm-tree` 0.1.10 and `einshape` 1.0 (the imports of `tapnet/torch/`), and wrote a script with the same 8 queries and
  90 frames as the CoTracker3 run (`scripts/verify-trials/run_tapir.NOT-RUN.py`; model settings from
  `configs/tapir_config.py`: `pyramid_level=0`, no extra convs). Its first command, a 4-frame smoke test, was refused by
  this session's permission check ("[Code from External]") before it started, so TAPIR is NOT RUN HERE either. The
  checkpoint and the venv were deleted. The tapnet README (read 2026-11-10) links Colab
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
  String-like clusters (y in px from the upper edge): LSD 6.4, 27.7, 46.2, 109.9; Hough 5.5, 28.1, 46.1, i.e. 4 and 3
  clusters, not 6 (the rectified fretboard is 116 px tall, from a 58.8 px wide original).
- Output format facts: `opencv_lines.json` = per frame and quad: `quad` (4 corners), `homography_img_to_rect` (3x3),
  `unrectified` {neck_axis_deg, fretboard_width_px, hough/lsd counts, time_s}, `rectified` {size, hough/lsd counts,
  `fret_x_clusters_px_from_nut`, `string_y_clusters_px_from_upper_edge`, time_s}. The rectified neck image of each frame
  is written as PNG (`out/opencv-lines/*_rectified.png`).
- Constraint inputs: the quad (4 points) and every threshold above are parameters; nothing is learned.
- Samples: `samples/opencv-lines/` (overlays: unrectified Hough per frame, rectified Hough and LSD per frame; JSON).
- A second quad taken from the SAM 2.1 neck mask (minimum-area rectangle) is supported by the script
  (`run_opencv_lines.py <outdir> <mask.png>`); it ran as r0400, reported in the SAM 2.1 section.
- Verifier re-runs (`--nolock`, same commands, frames decoded again): r0482 (this quad), r0483 (R3b, below) and r0484
  (SAM quad) wrote per-frame results identical to r0149, r0214 and r0400 in every field except the timings. (r0149's
  JSON has no top-level `clip`, `quad_set_by_hand` and `rect_size` keys; the script was extended for R3b after r0149.)

### Same method on R3b (1920x1080, close view)

- Quad set BY HAND on zoomed crops of R3b frame 225 (1920x1080 pixels): nut end upper edge (1262,25), nut end lower
  edge (1340,130), body end lower edge (290,765), body end upper edge (245,635); the body end is where the fretboard
  stops at the sound hole. Long axis 149.04 degrees, nut-end width 130.8 px. Rectified to 1200x130. Same detector and
  classification settings as above. Reused unchanged on frames 0 and 449.
- Run: `run_opencv_lines.py <outdir> --clip R3b --frames 225,0,449 --quad 1262,25,1340,130,290,765,245,635 --size
  1200,130`, gtr-run r0214 (`--nolock`): wall 3.96 s, CPU 1.5 s, peak RSS 164.4 MB. Per frame inside the script:
  unrectified 0.51-0.79 s, rectified 0.23-0.41 s.

| frame | view | Hough segments (in quad) | Hough string-like / fret-like | LSD segments (in quad) | LSD string-like / fret-like | rectified fret clusters Hough / LSD | rectified string clusters Hough / LSD |
|---|---|---|---|---|---|---|---|
| 225 | unrectified | 351 (115) | 31 / 41 | 828 (213) | 38 / 33 | | |
| 225 | rectified | 106 | 15 / 15 | 223 | 17 / 30 | 13 / 16 | 4 / 7 |
| 0 | unrectified | 310 (109) | 42 / 37 | 793 (201) | 40 / 34 | | |
| 0 | rectified | 95 | 18 / 21 | 248 | 25 / 32 | 13 / 18 | 2 / 6 |
| 449 | unrectified | 375 (151) | 87 / 41 | 877 (269) | 72 / 30 | | |
| 449 | rectified | 119 | 20 / 15 | 299 | 47 / 23 | 12 / 14 | 4 / 5 |

- Frame 225, LSD fret clusters (x from the nut, rectified px): 4.1, 389.9, 496.2, 573.1, 645.5, 711.9, 777.1, 830.7,
  884.5, 933.6, 979.9, 1022.7, 1063.0, 1101.2, 1135.7, 1168.0. On the overlay (`samples/opencv-lines-R3b/
  R3b_f0225_handquad_rectified_lsd.webp`) the cluster at 389.9 lies on the edge of a finger, not on a fret wire (by eye),
  and the fret wires visible at about x = 120 and 228 (left of the fingers) were not classified as fret-like. LSD
  string clusters (y from the upper edge): 3.5, 22.0, 27.6, 44.8, 67.3, 73.3, 89.8.
- Samples: `samples/opencv-lines-R3b/` (overlays per frame, `opencv_lines_R3b.json`).

## Worked handoff on one frame: fingertip pixels -> rectified fretboard -> (string, fret) cell

A fact about formats, not a product. Frame 150 of R3a_cu, no ground truth. Script
`scripts/handoff_fingertip_to_cell.py`, first run r0172 (`--nolock`, light: wall 1.2 s, CPU 0.4 s, 86.7 MB), re-run
r0218 (wall 0.39 s) after the script was generalized for other clips and given the "drop" rule in step 4. Both runs
gave the same cells; the fit numbers below are from r0218, and step 4 also gives r0172's choice.

| step | done by | input | output |
|---|---|---|---|
| 1 | MediaPipe Hand Landmarker 1.2.2 (run r0078) | R3a_cu frame 150, 640x480 | 21 landmarks, label "Left", score 0.9985; fingertips 4, 8, 12, 16, 20 in pixels |
| 2 | BY HAND (four corners) + OpenCV `getPerspectiveTransform` (run r0149) | the neck quad | 3x3 homography to an 800x116 rectangle, nut at x = 0 |
| 3 | OpenCV LSD (run r0149) | rectified frame 150 | fret-like clusters at x = 5.7 (taken as the nut), 98.9, then 341.2 ... 789.7 (9 clusters right of the hand) |
| 4 | this script (a model, not a tool) | the 9 clusters right of the hand | 12-TET fit x_n = 5.7 + s (1 - 2^(-n/12)), trying first-fret numbers k0 = 1..14 and dropping 0-2 leading clusters: lowest RMS with 2 dropped and k0 = 6 (so 341.2 and 410.6 sit at model frets 4 and 5), s = 1581.3 px, RMS residual 5.04 px, max 7.86 px. Without dropping: k0 = 4, s = 1584.4 px, RMS 5.96 px (r0172's choice); k0 = 3: RMS 32.07 px; k0 = 5: RMS 14.88 px. Model frets 1-4 at x = 94.5, 178.2, 257.3, 331.9 |
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

### The same handoff on R3b frame 225 (1920x1080)

Run r0402 (`--nolock`, wall 0.8 s). Step 1: MediaPipe Hand Landmarker on R3b (group C1), the "Left" hand, score on this
frame in `samples/handoff/handoff_R3b_f0225.json`. Step 2: the hand-set R3b quad (OpenCV section), 1200x130. Step 3:
OpenCV LSD (r0214): clusters 4.1 (nut), 389.9, 496.2, 573.1, 645.5, 711.9, 777.1, 830.7, 884.5, 933.6, 979.9, 1022.7,
1063.0, 1101.2, 1135.7, 1168.0. Step 4: the script leaves out the nut cluster (x < 20) and takes the clusters right of
the widest gap between consecutive remaining clusters (389.9 to 496.2): 496.2 ... 1168.0 (14). The lowest RMS came from dropping the first two of them and fitting 645.5 ... 1168.0 (12 clusters)
as frets 8-19: s = 1754.2 px, RMS 3.52 px, max 7.70 px, which puts 496.2 at fret 6. Without dropping, k0 = 6 for 496.2
had RMS 7.52 px and k0 = 5 had RMS 20.48 px.

| fingertip | pixel (x, y) | rectified (u, v) | fret cell | string cell |
|---|---|---|---|---|
| thumb tip (4) | (1031.74, 140.00) | (265.6, -20.4), outside the fretboard | 3 | 6 |
| index tip (8) | (1082.59, 200.67) | (255.6, 58.9) | 3 | 4 |
| middle tip (12) | (992.45, 234.35) | (351.3, 41.4) | 4 | 5 |
| ring tip (16) | (983.43, 295.62) | (391.1, 88.7) | 5 | 2 |
| pinky tip (20) | (970.30, 327.14) | (418.4, 108.3) | 5 | 2 |

- A second reading of the same frame gives different fret numbers. By eye on the rectified image
  (`samples/handoff/handoff_R3b_f0225_rectified.webp`), fret wires are visible at about x = 120 and 228 left of the
  fingers and at the 14 LSD clusters from 496.2 to 1168.0 right of them; counting wires from the nut that way puts
  496.2 at fret 5, and the shared manifest describes this frame as showing "frets 5 to 18 by their spacing, with
  frets 2-4 under the fingers". The 12-TET fit above puts 496.2 at fret 6 and its model fret 1 at x = 102.6 and fret 2
  at 195.5, not at the visible wires near 120 and 228. So on R3b the fret numbers of the cells depend on the method,
  by one fret here; which is right is UNVERIFIED (no ground truth; a hand-labelled frame would settle it). The cluster
  at 389.9 lies on a finger edge by eye.
- Verifier re-runs r0485 (R3a_cu frame 150) and r0486 (R3b frame 225), `--nolock`, fed with the trial's MediaPipe
  JSONL and the verifier's own OpenCV re-runs (r0482, r0483): the JSON is identical to r0218 and r0402 (same fits,
  model frets and cells). r0172's fit without the drop rule (k0 = 4, s = 1584.4 px) gives the same five cells when
  recomputed (model frets 1-4 at x = 94.6, 178.6, 257.8, 332.6).

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
- Verifier re-run r0488 (`--nolock`, same script and the trial's three input PNGs, 2026-11-10 22:56 UTC): OWLv2
  returned the same labels, mask boxes and mask pixel counts for all three images (19.52, 19.02 and 22.27 s per
  image); the Grounding DINO calls failed again with the same error.

## MediaPipe legacy "solutions" Hands API, mediapipe 0.10.21

- What it is: the pre-Tasks Python API `mp.solutions.hands.Hands` (hand models bundled in the wheel). 0.10.21 (PyPI
  upload 2025-02-06) has `mp.solutions`; 1.2.2 does not; the releases in between (0.10.30 to 1.2.0) were not
  checked.
- Install (worked, 2026-11-10): `uv venv --python 3.11 venv-mp-legacy && uv pip install --python
  venv-mp-legacy/bin/python mediapipe==0.10.21`. It pulled jax 0.7.1, jaxlib 0.7.1, numpy 1.26.4 (the wheel requires
  `numpy<2`), protobuf 4.25.9, opencv-contrib-python 4.11.0.86 (full list: `samples/mediapipe-legacy/uv-pip-freeze.txt`).
  Wheel `mediapipe-0.10.21-cp311-cp311-manylinux_2_28_x86_64.whl`, 35,622,638 bytes.
- Settings: `Hands(static_image_mode=False, max_num_hands=2, model_complexity=1, min_detection_confidence=0.5,
  min_tracking_confidence=0.5)`; all five equal the defaults in the constructor's signature.
  Script `scripts/run_mediapipe_legacy_hands.py <clip> <full|crop> <outdir>`. Runs: steps of group job C1.
- Handedness convention, from the docstring of `mediapipe/python/solutions/hands.py` in this wheel: "Note that it
  determines handedness assuming the input image is mirrored, i.e., taken with a front-facing/selfie camera (
  https://en.wikipedia.org/wiki/Front-facing_camera) with images flipped horizontally. If that is not the case, use, for
  instance, cv2.flip(image, 1) to flip the image first for a correct handedness output." The frames here were not
  flipped. Measured: on R3c the hand at the neck (mean wrist (1679, 591)) is "Right" in all 450 frames here and "Left"
  in all 450 frames with the Tasks API 1.2.2; the hand at the sound hole (mean wrist (966, 900)) is "Left" here and
  "Right" with the Tasks API. On R3a_cu and R3b the fretting hand is "Right" here (300 of 300, 451 of 451 detections) and
  "Left" with the Tasks API.

| step | clip, mode | wall | CPU (user+sys) | peak RSS | per-frame inference mean / median / p90 | fps from mean | frames with 0 / 1 / 2 hands | labels | mean score (min) |
|---|---|---|---|---|---|---|---|---|---|
| mediapipe-legacy_R3a_full | R3a full | 23.20 s | 20.37 s | 279.9 MiB | 27.68 / 24.49 / 39.03 ms | 36.12 | 1 / 296 / 243 | Right 678, Left 104 | 0.891 (0.500) |
| mediapipe-legacy_R3a_crop | R3a crop 3x | 20.77 s | 20.60 s | 281.0 MiB | 27.07 / 24.41 / 38.43 ms | 36.94 | 1 / 297 / 242 | Right 640, Left 141 | 0.926 (0.501) |
| mediapipe-legacy_R3a_cu_full | R3a_cu full | 11.39 s | 10.50 s | 270.0 MiB | 26.56 / 24.36 / 34.90 ms | 37.66 | 0 / 300 / 0 | Right 300 | 0.995 (0.987) |
| mediapipe-legacy_R3b_full | R3b | 23.43 s | 22.00 s | 299.6 MiB | 28.86 / 26.89 / 36.33 ms | 34.65 | 5 / 439 / 6 | Right 451 | 0.989 (0.973) |
| mediapipe-legacy_R3c_full | R3c | 21.80 s | 20.90 s | 306.8 MiB | 24.86 / 23.82 / 29.75 ms | 40.22 | 0 / 0 / 450 | Left 450, Right 450 | 0.989 (0.682) |

Where the R3a detections landed (`hand_regions.py`; frames with at least one detection in the region):

| step | medium: fretting | medium: picking | medium: elsewhere | wide: fretting | wide: elsewhere |
|---|---|---|---|---|---|
| R3a full | 318 of 319 | 62 of 319 | 1 | 221 of 221 | 135 |
| R3a crop 3x | 319 of 319 | 158 of 319 | 0 | 220 of 221 | 48 |

- The wide-shot "elsewhere" detections sit in the same 20-px cell as the Tasks API's (centre in (340-360, 260-280),
  135 of 135 in full mode, 46 of 48 in crop mode), the spot on the hanging sheet music described above.
- On R3b, 6 frames (434, 436, 438, 440, 442, 444) have two detections; their 12 wrists lie at x 1189.8-1273.3 px (all 451 R3b detections:
  x 949.8-1273.3 px; the fretting-hand area; the picking hand is at x < 300); which of the two is a second detection
  of the same hand was not checked.
- Output format: `results.multi_hand_landmarks` (per hand 21 `landmark` with x, y normalized and z),
  `results.multi_handedness` (per hand `classification[0]` with `label`, `score`, `index`),
  `results.multi_hand_world_landmarks` (meters). Same 21-point order as the Tasks API. The script stores the same JSON
  fields as the Tasks run.
- Samples: `samples/mediapipe-legacy/` (frames, summaries).
- Verifier re-run (step of r0495, 2 cores): the trial's venv had been deleted, so the verifier made one from the
  same cached wheels without `jax`/`jaxlib` (they were gone from the uv cache; in this wheel only
  `mediapipe/tasks/python/genai/converter/` imports jax; freeze in `samples/verify-trials/mp-legacy-rerun-venv.freeze.txt`).
  `run_mediapipe_legacy_hands.py R3a_cu full` gave the same hands, labels ("Right" in 300 of 300 frames) and every
  landmark pixel value as the trial's C1 step; per-frame mean 25.79 ms, step wall 11.46 s.

## Ultralytics YOLO26 pose (yolo26n-pose, yolo26s-pose), ultralytics 8.4.209

- What it is: one-stage person detector with 17 COCO body keypoints per person (no finger keypoints). Package
  `ultralytics` 8.4.209 (PyPI) with torch 2.15.0+cpu and torchvision 0.29.2+cpu (`samples/ultralytics-torch-venv/
  uv-pip-freeze.txt`). Weights from the Ultralytics assets release `v8.4.0`
  (`https://github.com/ultralytics/assets/releases/download/v8.4.0/<name>`, downloaded 2026-11-10, no login):
  `yolo26n-pose.pt` 7,878,574 bytes (sha256 `eb3bb8268828aeaf515cec23a4bfafd793944a86fe9af94ba7823609c14522a9`),
  `yolo26s-pose.pt` 24,151,790 bytes (sha256 `a083adb42303728ae14c4bd6bd56d80da46f82fb2564dbd6f31dcc92ea321646`).
  The Ultralytics asset list in 8.4.209 (`ultralytics.utils.downloads.GITHUB_ASSETS_NAMES`) has pose weights for
  yolov8, yolo11 and yolo26 and no hand-keypoint weights (no asset name contains "hand").
- Install: `uv venv --python 3.11 venv-ultra && uv pip install --python venv-ultra/bin/python ultralytics==8.4.209`
  (UV_TORCH_BACKEND=cpu gave the CPU torch wheels). Runs used `YOLO_OFFLINE=1`.
- Settings: `model.predict(frame, imgsz=640, conf=0.25, device="cpu")`. A wrist counts as a "hand" when its keypoint
  confidence is >= 0.5 (COCO 9 = the person's left wrist, 10 = right wrist). Script `scripts/run_yolo_pose.py <clip>
  <full|crop> <weights> <outdir>`. Runs: steps of group job B1 (2 cores; GNU time per step).

| step | model, clip, mode | frames | wall | CPU | peak RSS | per-frame mean / median / p90 | fps from mean | Ultralytics "inference" mean | frames with a person | frames with 0 / 1 / 2 wrists >= 0.5 | max persons in a frame |
|---|---|---|---|---|---|---|---|---|---|---|---|
| yolo-pose_yolo26n-pose_R3a_full | n, R3a full | 540 | 70.78 s | 77.97 s | 463.3 MiB | 117.02 / 106.22 / 129.18 ms | 8.55 | 104.0 ms | 540 | 0 / 0 / 540 | 1 |
| yolo-pose_yolo26n-pose_R3a_crop | n, R3a crop 3x | 540 | 79.27 s | 82.96 s | 472.4 MiB | 130.96 / 125.16 / 155.17 ms | 7.64 | 122.2 ms | 540 | 0 / 57 / 482 (1 frame with more than 2) | 2 |
| yolo-pose_yolo26s-pose_R3a_full | s, R3a full | 540 | 167.16 s | 154.32 s | 538.2 MiB | 292.67 / 293.17 / 359.55 ms | 3.42 | 283.5 ms | 540 | 0 / 1 / 539 | 2 |
| yolo-pose_yolo26n-pose_R3a_cu_full | n, R3a_cu full | 300 | 48.62 s | 44.62 s | 452.5 MiB | 138.88 / 129.06 / 153.44 ms | 7.20 | 126.3 ms | 300 | 0 / 264 / 36 | 2 |
| yolo-pose_yolo26n-pose_R3b_full | n, R3b 1920x1080 | 450 | 54.99 s | 57.77 s | 480.1 MiB | 87.94 / 81.45 / 100.65 ms | 11.37 | 80.1 ms | 450 | 0 / 251 / 197 (2 frames with more than 2) | 2 |
| yolo-pose_yolo26n-pose_R3c_full | n, R3c 1920x1080 | 450 | 52.20 s | 57.91 s | 477.7 MiB | 85.75 / 80.24 / 97.35 ms | 11.66 | 78.7 ms | 450 | 0 / 0 / 450 | 1 |

- The per-frame time is measured around `model.predict` and includes Ultralytics' first-call setup on frame 0
  (4362.8 ms in the first run, 1464-2261 ms in the others); "Ultralytics inference" is the `speed["inference"]` value
  the library reports per frame, averaged.
- Arm keypoints on R3a full (yolo26n): in the medium shot the right wrist (person's right) averages (319, 263) px with
  mean confidence 0.982 and the left wrist (376, 243) with 0.947; in the wide shot the right wrist averages (157, 203)
  with mean confidence 0.911 (minimum 0.7235) and the left wrist (395, 210) with 0.974. By eye on frame 300 the
  picking hand is behind the music stand in the wide shot; the right wrist reported on that frame, (181, 204) with
  confidence 0.83, lies on the top edge of the music stand (verifier, by eye on
  `samples/ultralytics-yolo-pose/R3a_full_f0300.webp`).
- R3a_cu (close shot, picking hand not in frame): the person's left wrist is reported in all 300 frames, the right wrist
  with confidence >= 0.5 in 36. R3b (picking-hand fingers at the left edge of the picture): left wrist in 450 frames,
  right wrist in 199 frames (201 right-wrist detections: frames 209 and 210 have a second person box with a second
  right wrist). Every input, 1080p included, is resized by Ultralytics to the `imgsz=640` network size before
  inference.
- Output format facts: `results[0].keypoints.xy` (N persons x 17 x 2 pixels), `.keypoints.conf` (N x 17),
  `results[0].boxes.xyxy` / `.conf`, `results[0].speed` = {preprocess, inference, postprocess} in ms. The script stores
  per frame the elbows and wrists (x, y, confidence) in full-frame pixels and the person-box confidence.
- Constraint inputs: `imgsz`, `conf`, `iou`, `classes`, `max_det`; nothing hand- or guitar-specific.
- Samples: `samples/ultralytics-yolo-pose/` (annotated frames R3a 100 and 300, R3a_cu 150; summaries of the four R3a
  and R3a_cu runs; first two JSONL records). The R3b and R3c summaries are only under
  `out/yolo-pose/yolo26n-pose/`.
- Verifier re-run (step of r0495, 2 cores): yolo26n-pose on R3a_cu full gave the same persons and wrists in all 300
  frames, with every stored elbow and wrist coordinate, keypoint confidence and box confidence equal to the trial's;
  per-frame mean 105.96 ms, step wall 36.58 s.

## OpenPose hand model (CMU), PyTorch port `Hzzone/pytorch-openpose` @5ee71dc

- What it is: OpenPose's 21-keypoint hand network, converted from the CMU Caffe model to PyTorch by the
  `pytorch-openpose` project (`git clone --depth 1 https://github.com/Hzzone/pytorch-openpose`, commit
  `5ee71dc10020403dc3def2bb68f9b77c40337ae2`, 2021-06-21; README: "the pytorch model is directly converted from
  [openpose](https://github.com/CMU-Perceptual-Computing-Lab/openpose) caffemodel"). Weights `hand_pose_model.pth`,
  147,341,049 bytes (sha256 `b76b00d1750901abd07b9f9d8c98cc3385b8fe834a26d4b4f0aad439e75fc600`), from
  `https://huggingface.co/lllyasviel/Annotators/resolve/main/hand_pose_model.pth` (repo not gated; card metadata
  `license: other`), loaded with `torch.load(..., weights_only=True)`. The full OpenPose C++ program was not built.
- Route and what was done by this lane: OpenPose finds hands from its body model; that model
  (`body_pose_model.pth`, 209,267,595 bytes) was over the disk notice's 200 MB limit and was not downloaded. Hand boxes
  were taken from MediaPipe Hand Landmarker instead (a handoff): a square around MediaPipe's 21 points, side 1.5 x the
  longer side of their box. The clone is passed to the script as a path and only `src/model.py` (`handpose_model`) is
  imported; the inference loop re-implements `src/hand.py` (scales 0.5, 1.0, 1.5, 2.0 of a 368-px box, stride 8, heatmap
  threshold 0.05 after a Gaussian blur with sigma 3, then per keypoint the connected component with the largest sum of
  heatmap values, as `src/hand.py` does) with OpenCV in place of scipy and scikit-image. Script `scripts/run_openpose_hand.py`.
- Left hands: OpenPose's own C++ hand extractor mirrors the crop of its hand 0 (the left hand):
  `const bool mirrorImage = (hand == 0);` in `src/openpose/hand/handExtractorCaffe.cpp` (master, read 2026-11-10). The
  port's `Hand` class does not mirror. The first run below did not mirror; the fretting hand is the player's left hand.
  Later steps with `--mirror-left` (flip the crop of a hand MediaPipe labels "Left", flip x back) are reported below
  when they ran.

| run | clip, boxes from | hands run | wall | CPU | peak RSS | per-hand inference mean / median (min-max) | keypoints found per hand (mean; of 21) | median distance to MediaPipe's same-index landmark (median of per-hand medians) | mean peak heatmap value |
|---|---|---|---|---|---|---|---|---|---|
| r0336 (not mirrored) | R3a_cu every 10th frame, MediaPipe r0078 | 30 | 519.06 s | 522.4 s | 1088.1 MB | 17.161 / 11.116 s (7.492-46.669 s) | 13.4 (range 2-20) | 52.52 px | 0.0873 |
| step `openpose-hand_R3a_cu_every30_mirrorleft` (B1) | R3a_cu every 30th frame, left-hand crops mirrored | 10 | 202.43 s | 188.03 s | 1101.3 MiB | 20.017 / 21.178 s | 19.5 (range 12-21) | 4.68 px | 0.2149 |
| step `openpose-hand_R3a_every30_mirrorleft` (B1) | R3a every 30th frame, boxes from MediaPipe crop-mode run r0075, "Left" crops mirrored (20 of 21 hands) | 21 | 311.11 s | 348.49 s | 1072.8 MiB | 14.679 / 12.883 s | 9.29 (range 0-20) | 2.74 px | 0.1143 |

- The same 10 frames (every 30th) in r0336 without mirroring: keypoints found 13.3 per hand on average (range 5-19),
  median of per-hand median distances to MediaPipe 53.97 px, mean peak value 0.086. With mirroring: 19.5 found, 4.68 px
  (per-hand medians 4.09-10.59 px), 0.2149. All 10 hands were labelled "Left" by MediaPipe and were mirrored.
- On R3a the hand boxes had sides of 41-93 px in the 640x480 frame (each crop is scaled to the 368-px box and its
  multiples inside the model); 3 of the 21 hands had no keypoint found.
- "Mean peak heatmap value" is the mean over all 21 keypoints of every hand, with not-found keypoints counted as 0
  (`run_openpose_hand.py`).
- r0336 waited 1800.7 s for a CPU slot before it ran. Box sides were 181-282 px. "Found" = the blurred heatmap
  exceeded 0.05 somewhere; a keypoint that was not found is stored as (box origin, score 0).
- Output format facts: per hand 21 (x, y, peak value) in full-frame pixels, in the OpenPose hand order (0 wrist, 1-4
  thumb, 5-8 index, 9-12 middle, 13-16 ring, 17-20 pinky), the same order as MediaPipe's 21 landmarks. Files:
  `out/openpose-hand/R3a_cu.json` (summary + per hand), samples in `samples/openpose-hand/`. The r0336 sample images
  were redrawn afterwards from that JSON (no new inference) because the run's own drawing joined not-found keypoints
  to the box corner; the redraw shows only found keypoints (cyan) over MediaPipe's landmarks (magenta).
- Verifier checks: the 30 hands of r0336, the 10 of the mirrored R3a_cu step and the 21 of the R3a step were recounted
  from the JSON with a separate script (`scripts/verify-trials/`), giving the numbers above (r0336 median of medians
  52.53 px before the script's per-hand rounding; same 10 frames 53.97 px, 13.3 keypoints, range 5-19; mirrored 4.68 px,
  per-hand medians 4.09-10.59 px). Re-run of the mirrored R3a_cu step (r0497, 2 cores): all 210 keypoints (x, y, peak
  value) identical to the trial's; per-hand inference mean 7.863 s against 20.017 s in the trial (step wall 80.78 s
  against 202.43 s).

## MediaPipe Pose Landmarker (heavy) and Holistic Landmarker (tasks API), mediapipe 1.2.2

- What they are: Pose Landmarker = 33 body landmarks per person (wrists 15/16, pinky 17/18, index 19/20, thumb
  21/22: three hand points per side, no finger joints). Holistic Landmarker = one person's pose (33) + face (478) +
  left hand (21) + right hand (21) in one graph. Same venv as the Hand Landmarker. Bundles (2026-11-10, no login):
  `pose_landmarker_heavy.task` 30,664,242 bytes (sha256 `64437af838a65d18e5ba7a0d39b465540069bc8aae8308de3e318aad31fcbc7b`)
  from `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/`;
  `holistic_landmarker.task` 13,683,609 bytes (sha256 `e2dab61191e2dcd0a15f943d8e3ed1dce13c82dfa597b9dd39f562975a50c3f8`)
  from `.../holistic_landmarker/holistic_landmarker/float16/latest/`. (`pose_landmarker_full.task`, 9,398,198 bytes,
  was downloaded, not run, and deleted at the end.)
- Settings: VIDEO mode. Pose: `num_poses=1`, detection, presence and tracking confidence 0.5; a "hand" is counted when
  the wrist landmark's `visibility` is >= 0.5. Holistic: default options; a hand is counted when its 21-landmark list
  is non-empty (Holistic returns no handedness score). Script `scripts/run_mediapipe_pose_holistic.py`. Runs: steps of
  group job C1.

| step | clip, mode | wall | CPU | peak RSS | per-frame mean / median / p90 | fps from mean | pose found | frames with 0 / 1 / 2 hands | counts per side |
|---|---|---|---|---|---|---|---|---|---|
| mediapipe-pose_R3a_full | R3a full | 43.65 s | 40.35 s | 316.7 MiB | 69.27 / 65.84 / 82.03 ms | 14.44 | 540 of 540 | 0 / 149 / 391 | wrist vis. >= 0.5: left 532, right 399 |
| mediapipe-pose_R3a_crop | R3a crop 3x | 44.33 s | 42.43 s | 325.5 MiB | 70.25 / 67.32 / 82.51 ms | 14.23 | 540 of 540 | 0 / 217 / 323 | left 540, right 323 |
| mediapipe-holistic_R3a_full | R3a full | 31.57 s | 34.52 s | 307.2 MiB | 48.24 / 48.60 / 58.89 ms | 20.73 | 540 of 540 | 13 / 439 / 88 | left_hand 521, right_hand 94 |
| mediapipe-holistic_R3a_cu_full | R3a_cu full | 18.53 s | 20.84 s | 308.6 MiB | 50.25 / 51.29 / 61.44 ms | 19.90 | 300 of 300 | 0 / 300 / 0 | left_hand 300 |
| mediapipe-holistic_R3c_full | R3c | 39.31 s | 47.89 s | 405.5 MiB | 62.49 / 58.94 / 78.97 ms | 16.00 | 450 of 450 | 0 / 10 / 440 | left_hand 450, right_hand 440 |
| mediapipe-holistic_R3a_crop | R3a crop 3x | 15.14 s | 15.12 s | 318.5 MiB | (failed at frame 218) | | | | |

- Per shot on R3a full: Pose, medium shot 0 / 8 / 311 frames with 0 / 1 / 2 wrists visible, wide shot 0 / 141 / 80
  (right wrist visible in 80 of 221 wide-shot frames); Holistic, medium shot 12 / 219 / 88, wide shot 1 / 220 / 0
  (left_hand in 220 of 221 wide-shot frames, right_hand in none).
- Where Holistic's R3a hands landed (`hand_regions.py`, frames): medium fretting 301, medium picking 78, medium
  elsewhere 8, wide fretting 220, wide elsewhere 0. (The Hand Landmarker had 215 wide-shot frames with a detection on the
  hanging sheet music; Holistic has none there.)
- On R3c, Holistic's `left_hand` (mean wrist (1681, 585) px) is the fretting hand and `right_hand` (mean wrist (966, 899))
  the picking hand; the names follow the subject's hands, as with the Hand Landmarker.
- Holistic, crop mode: it failed when the crop size changed at the shot cut (720x720 to 840x660 at frame 218):
  `RuntimeError: CalculatorGraph::Run() failed: Calculator::Process() for node "..._SegmentationSmoothingCalculator"
  failed: RET_CHECK failure (third_party/mediapipe/calculators/image/segmentation_smoothing_calculator.cc:207)
  current_mat->rows == previous_mat->rows (660 vs. 720)`. Input fact: in VIDEO mode Holistic needs a constant frame
  size. Up to the failure (frames 0-217, medium shot) it found the pose in 218 of 218 frames and 0 / 1 / 2 hands in
  36 / 97 / 85 frames (left_hand 151, right_hand 116), 55.59 ms per frame mean. The Hand and Pose Landmarkers took the
  same size change without an error.
- Output format facts: Pose: `pose_landmarks` (per person 33 `NormalizedLandmark` with x, y, z, visibility, presence)
  and `pose_world_landmarks`; Holistic: `pose_landmarks`, `face_landmarks`, `left_hand_landmarks`,
  `right_hand_landmarks` (21 normalized landmarks each, empty when not found), plus world landmarks and (optionally)
  a segmentation mask. The script stores shoulders, elbows, wrists and the three hand points of the pose in full-frame
  pixels, and Holistic's hand landmarks in the same 21-point format as the Hand Landmarker.
- Samples: `samples/mediapipe-pose-holistic/`.
- Verifier re-runs (steps of r0495, 2 cores): Holistic on R3a_cu full gave every hand landmark equal to the trial's;
  Holistic on the R3a crops failed again at the shot cut with the same `RET_CHECK failure ... (660 vs. 720)` (exit 1)
  after 218 frames whose hand landmarks equal the trial's; Pose on R3a full gave the same per-frame hand counts and all
  6,480 stored arm values (x, y, visibility) equal to the trial's. Step walls 16.12 s, 12.25 s and 43.04 s.

## Segment Anything 2.1 tiny (`sam2.1_t.pt`) through ultralytics 8.4.209: image mode and video mode

- What it is: Meta's SAM 2.1 "tiny" checkpoint as packaged by Ultralytics (asset `sam2.1_t.pt`, 78,105,722 bytes,
  sha256 `3c1e81ca9b037dd39d70a014ddb9a813d6c4c4e12555420db7eaff31689bd4e3`, from the Ultralytics assets release
  v8.4.0, no login), run with `ultralytics.SAM` (image mode) and `ultralytics.models.sam.SAM2VideoPredictor` (video
  mode). Note from the docs agent's survey: the PyPI package `sam2` 1.1.0 is uploaded by a third party, so it was not
  used. Same torch venv as YOLO.
- Prompts (set BY HAND, foreground points, label 1, 640x480 pixels): R3a_cu frame 150: (260,314), (330,272),
  (380,243) on the fretboard between the body and the hand; R3a frame 100: (342,248), (350,228); R3a frame 300:
  (350,222), (372,205). Each image was run with all its points ("all_points") and with the first point only.
  Video mode: R3a_cu frames 150-179 re-encoded to a 30-frame MP4 (`ffmpeg -framerate 30000/1001 ... -crf 10`), the
  three R3a_cu points on the first frame, `imgsz=1024`, `conf=0.25`. Script `scripts/run_sam2.py`.
- Run: step `sam2.1-tiny_image_and_video` of group job B1 (2 cores): wall 668.34 s, CPU 685.01 s, peak RSS 1726.3
  MiB, for all six image calls and the 30-frame video. Model load 1.83 s.

| image | prompt | time | masks returned | scores | union mask area | union mask bbox (x0,y0,x1,y1) | connected components | min-area rectangle of the largest component (centre, size, angle) |
|---|---|---|---|---|---|---|---|---|
| R3a_cu f150 | 3 points | 5.128 s | 3 | 0.8678, 0.8827, 0.8729 | 27,394 px | (0,60,639,416) | 33 | (329.0,294.5), 293.7x70.2, -32.24 deg |
| R3a_cu f150 | 1 point | 5.105 s | 1 | 0.8678 | 26,612 px | (0,61,639,395) | 23 | (328.1,294.9), 290.6x69.9, -32.24 deg |
| R3a f100 | 2 points | 5.657 s | 2 | 0.7979, 0.7491 | 4,327 px | (281,128,395,363) | 7 | (362.5,198.6), 148.9x40.5, -71.57 deg |
| R3a f100 | 1 point | 5.387 s | 1 | 0.7979 | 4,053 px | (281,128,395,352) | 6 | (362.3,198.6), 148.9x39.9, -71.42 deg |
| R3a f300 | 2 points | 5.848 s | 2 | 0.3479, 0.8135 | 40,503 px | (136,74,428,458) | 51 | (325.0,322.8), 210.6x137.1, -59.24 deg |
| R3a f300 | 1 point | 6.068 s | 1 | 0.3479 | 40,091 px | (136,74,428,458) | 57 | (325.0,322.8), 210.6x137.1, -59.24 deg |

- What the masks cover, by eye on the overlays (`samples/sam2.1-tiny/`): R3a_cu frame 150: the neck from the body end
  to the headstock, interrupted by the fretting hand, plus specks on the guitar body at the left edge; the largest
  component (and its rectangle) is the stretch between the body end and the hand. R3a frame 100 (medium shot): the
  visible neck. R3a frame 300 (wide shot): the whole player and guitar, not only the neck. Ultralytics returned one
  mask per point (several points were not merged into one object); the script takes the union.
- Video mode: 30 frames in 629.95 s including setup; the first frame took 25.017 s and frames 2-30 took 20.86 s each
  on average (about 0.05 frames per second on 2 cores). Every frame returned 3 masks (one per prompt point); the union
  area stayed between 25,041 and 26,913 px; the largest component's rectangle moved from centre (327.2,294.2),
  291.1x68.5 at frame 150 to (346.3,281.3), 335.7x67.4 at frame 179, both at -32.5 degrees.
- Handoff to OpenCV (run r0400, `--nolock`): the minimum-area rectangle of the largest component of the frame-150
  mask was used as a second quad for `run_opencv_lines.py`: corners (434.5,186.5), (471.9,245.8), (223.5,402.5),
  (186.1,343.1), long axis 147.76 degrees, width 70.2 px. Because the largest component stops at the hand, x = 0 of
  this rectification is at the hand, not at the nut (the JSON key name `fret_x_clusters_px_from_nut` does not hold for
  this quad). Rectified 800x116: LSD 13 fret-like / 50 string-like segments, fret clusters at x = 117.5, 210.9,
  304.2, 390.4, 473.3, 620.2, 696.8, 759.1; Hough 9 / 27. Overlays: `samples/opencv-lines/R3a_cu_f0150_samquad_*`.
- Output format facts: `results[0].masks.data` (N x H x W boolean tensor, one per prompt point), `results[0].boxes`
  with `conf` (the scores above). The script writes each union mask as a PNG (`out/sam2/masks/`, 0/255, frame size) and
  `sam2_results.json` (areas, boxes, rectangles, times).
- Constraint inputs: points with labels (1 foreground, 0 background), boxes (`bboxes=`), and in video mode prompts on
  the first frame; `imgsz`, `conf`.

## CoTracker3 (offline model), facebookresearch/co-tracker @82e02e8

- What it is: Meta's point tracker. Code: `git clone --depth 1 https://github.com/facebookresearch/co-tracker` (commit
  `82e02e8029753ad4ef13cf06be7f4fc5facdda4d`, 2025-01-21); checkpoint `scaled_offline.pth` 101,890,938 bytes (sha256
  `2670d4562ed69326dda775a26e54883925cd11b6fc9b24cb7aa9f8078bce7834`) from
  `https://huggingface.co/facebook/cotracker3/resolve/main/scaled_offline.pth` (2026-11-10, no login). The README says
  "for small tasks CoTracker can be run on CPU".
- Install: `torch.hub.load("facebookresearch/co-tracker", ...)` (the README's route) needs api.github.com, which this
  box's proxy refuses. `uv pip install -e <clone>` was refused by this session's permission check. What ran: the clone
  is passed to the script as a path and appended to `sys.path`; `cotracker.predictor.CoTrackerPredictor(checkpoint=...,
  offline=True, window_len=60)` with the torch venv (torch 2.15.0+cpu).
- Input: R3a_cu frames 150-239 (90 frames, 3.0 s), 640x480 RGB as a float tensor (1, 90, 3, 480, 640); the model
  resizes to its `interp_shape` (384, 512). Queries (t = first frame, x, y in pixels), set BY HAND on frame 150: four
  points on the neck (nut_mid (557,140), neck_a (242,331), neck_b (297,296), neck_c (353,261)) and four on the hand
  (index_mcp (525,227), wrist (545,323), index_tip (483,186), middle_tip (436,197)). Script `scripts/run_cotracker.py`.
- Run: step `cotracker3-offline_R3a_cu_f150_90` of group job B1 (2 cores): wall 136.52 s, CPU 134.01 s, peak RSS
  8,813,832 kB (8.4 GiB). Inside the script: model load 0.49 s, tracking 132.43 s for 90 frames = 1.47 s per frame.

| point | visible frames (of 90) | start (x, y) | end (x, y) at frame 239 | largest distance from start |
|---|---|---|---|---|
| nut_mid | 90 | (557.0, 140.0) | (553.79, 137.08) | 4.34 px |
| neck_a | 90 | (242.0, 331.0) | (239.45, 328.83) | 3.85 px |
| neck_b | 90 | (297.0, 296.0) | (293.73, 294.12) | 3.77 px |
| neck_c | 90 | (353.0, 261.0) | (349.01, 260.07) | 4.10 px |
| index_mcp | 90 | (525.0, 227.0) | (477.55, 247.14) | 66.43 px |
| wrist | 90 | (545.0, 323.0) | (448.49, 340.96) | 98.17 px |
| index_tip | 16 | (483.0, 186.0) | (468.31, 186.05) | 55.88 px |
| middle_tip | 73 | (436.0, 197.0) | (434.20, 197.81) | 5.46 px |

- There is no ground truth for these tracks. By eye on frame 239 (`samples/cotracker3/R3a_cu_track_f0239.webp`) the
  four neck points are still on the neck, and the wrist and index_mcp points are on the hand, which has moved toward
  the guitar body.
- Output format facts: `pred_tracks` (B, T, N, 2) pixel coordinates in the input frame size, `pred_visibility` (B, T, N)
  booleans. Queries are (t, x, y) rows; a `grid_size` or a `segm_mask` can be given instead of queries.
  `out/cotracker/R3a_cu_f150_90.json` holds all tracks; `samples/cotracker3/` an excerpt and two frames.

## rtmlib 0.0.16 (ONNX Runtime 1.31.1): RTMPose hand, RTMW and DWPose whole-body, ViTPose-s whole-body

- What it is: `Tau-J/rtmlib`, a small library that runs OpenMMLab's RTMPose family (and ViTPose) as ONNX models
  through ONNX Runtime, without mmcv/MMPose. Package `rtmlib` 0.0.16 (PyPI); install `uv venv --python 3.11
  venv-rtmlib && uv pip install --python venv-rtmlib/bin/python rtmlib==0.0.16 onnxruntime==1.31.1` (rtmlib requires
  both `opencv-python` and `opencv-contrib-python`; 5.0.0.93 of each); `pillow` was added later for the sample writer.
  First attempt stalled while downloading opencv-python; killed and re-run, it finished in under 5 minutes.
- Models (ONNX, downloaded by rtmlib into `$TORCH_HOME/hub/checkpoints` on first use, no login; sizes and sha256 of
  the unpacked files):

| role | file | bytes | sha256 | source |
|---|---|---|---|---|
| hand detector (Hand solution) | `rtmdet_nano_8xb32-300e_hand-267f9c8f.onnx` | 4,010,667 | `568d3ea97a5b142488366b67e036b6a5cb0a1fef9087a710cb8e66b6979fbac2` | download.openmmlab.com/mmpose/v1/projects/rtmposev1/onnx_sdk/ (zip) |
| hand pose, 21 points, 256x256 | `rtmpose-m_simcc-hand5_pt-aic-coco_210e-256x256-74fb594_20230320.onnx` | 55,080,248 | `39e858936bca0f94c09847d4e70b68a51d6c0adac61f36b457fcadb54621cd29` | same |
| person detector (RTMW, DWPose, ViTPose runs) | `yolox_m_8xb8-300e_humanart-c2c7a14a.onnx` | 101,400,344 | `3dea6513388889f0fff4b77bf7a26013600321b9eb9ceb0e9a400a82572f5f23` | same |
| RTMW-x-l whole body 133 points, 384x288 (rtmlib `Wholebody(mode="performance")`) | `rtmw-dw-x-l_simcc-cocktail14_270e-384x288_20231122.onnx` | 229,320,930 | `bd033156e5104c4f5d2edfe0453e02661e30a2f3da453ec93c8764d561b83054` | download.openmmlab.com/mmpose/v1/projects/rtmw/onnx_sdk/ (zip) |
| DWPose-l whole body 133 points, 384x288 | `rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.onnx` | 134,399,323 | `8cfecfc2226d8e14b510c2fd28442226c518b4d60690535753187877411d4005` | download.openmmlab.com/mmpose/v1/projects/rtmposev1/onnx_sdk/ (zip) |
| ViTPose-s whole body 133 points, 256x192 | `vitpose-s-wholebody.onnx` | 97,427,067 | `ccac893a8ad6da7d43f9655047acf48e482e66922db7f4273a3b615cea989127` | huggingface.co/JunkyByte/easy_ViTPose (repo not gated; its card metadata has no license field) |

  (The RTMW model, 229 MB unpacked, was downloaded at 21:06 UTC by file time, before the 200 MB disk notice.)
- How the script calls it (`scripts/run_rtmlib.py <clip> <full|crop> <hand|rtmw|dwpose|vitpose> <outdir> [step]`):
  the detector and the pose model are called separately (`model.det_model(img)`, then
  `model.pose_model(img, bboxes=...)`), because rtmlib's pose models fall back to the WHOLE image as the box when the
  detector returns none (`rtmlib/tools/pose_estimation/rtmpose.py`: `if len(bboxes) == 0: bboxes = [[0, 0,
  image.shape[1], image.shape[0]]]`); such fallback outputs are not counted here. The first R3a Hand runs (full and
  crop, before this change; their summaries are kept as `*.summary.first-run-counts-fallback.json`) produced exactly one
  21-point result in all 540 frames for that reason; they were re-run. A hand is counted when the mean of its 21
  keypoint scores is >= 0.3. Whole-body hands are keypoints 91-111 (the person's left hand) and 112-132 (right hand) of
  the COCO-WholeBody layout. Hand mode has no left/right label.
- Runs: steps of group jobs C1 (Hand) and B1/C1 (whole body), 2 cores, GNU time per step. Whole-body runs used every
  6th frame of R3a (90 frames) because each frame takes over a second.

| step | clip, mode | frames | wall | CPU | peak RSS | per-frame mean / median / p90 | fps from mean | frames with a detector box | frames with 0 / 1 / 2 / >2 hands | hand score mean [min-max] |
|---|---|---|---|---|---|---|---|---|---|---|
| rtmlib-hand_R3a_full_rerun_detcount | Hand, R3a full | 540 | 77.00 s | 154.47 s | 237.5 MiB | 127.07 / 113.87 / 184.25 ms | 7.87 | 148 (medium 147, wide 1) | 465 / 75 / 0 / 0 | 0.332 [0.300-0.385] |
| rtmlib-hand_R3a_crop_rerun_detcount | Hand, R3a crop 3x | 540 | 73.69 s | 170.36 s | 239.7 MiB | 123.15 / 112.64 / 177.97 ms | 8.12 | 536 (medium 315, wide 221) | 350 / 150 / 40 / 0 | 0.356 [0.301-0.554] |
| rtmlib-hand_R3a_cu_full | Hand, R3a_cu | 300 | 84.48 s | 96.83 s | 238.3 MiB | 252.61 / 188.49 / 481.27 ms | 3.96 | 300 | 32 / 231 / 37 / 0 | 0.424 [0.300-0.557] |
| rtmlib-hand_R3a_cu_crop | Hand, R3a_cu 2x | 300 | 111.13 s | 108.87 s | 248.9 MiB | 311.52 / 287.62 / 526.93 ms | 3.21 | 300 | 53 / 216 / 31 / 0 | 0.421 [0.301-0.573] |
| rtmlib-hand_R3b_full_rerun | Hand, R3b | 450 | 74.80 s | 153.61 s | 257.8 MiB | 133.77 / 121.17 / 203.39 ms | 7.48 | 448 | 25 / 413 / 12 / 0 | 0.398 [0.302-0.564] |
| rtmlib-hand_R3c_full_rerun | Hand, R3c | 450 | 80.83 s | 167.87 s | 256.8 MiB | 149.87 / 137.61 / 218.17 ms | 6.67 | 446 | 22 / 392 / 35 / 1 | 0.389 [0.300-0.497] |
| rtmlib-rtmw_R3a_full_step6 | RTMW-x-l, R3a full | 90 | 150.89 s | 228.74 s | 800.5 MiB | 1622.84 / 1549.07 / 2042.10 ms | 0.62 | 90 | 0 / 0 / 90 / 0 | 5.001 [2.631-7.827] |
| rtmlib-rtmw_R3a_crop_step6 | RTMW-x-l, R3a crop | 90 | 141.96 s | 228.09 s | 777.3 MiB | 1539.90 / 1459.92 / 1902.61 ms | 0.65 | 90 (max 2 boxes) | 0 / 0 / 85 / 5 | 5.238 [1.788-8.692] |
| rtmlib-dwpose_R3a_full_step6 | DWPose-l, R3a full | 90 | 124.90 s | 196.24 s | 577.2 MiB | 1340.44 / 1298.65 / 1601.46 ms | 0.75 | 90 | 0 / 0 / 90 / 0 | 0.767 [0.541-0.976] |
| rtmlib-dwpose_R3a_crop_step6 | DWPose-l, R3a crop | 90 | 127.58 s | 207.09 s | 577.8 MiB | 1378.10 / 1340.40 / 1826.28 ms | 0.73 | 90 (max 2) | 0 / 0 / 87 / 3 | 0.731 [0.313-0.989] |
| rtmlib-vitpose_R3a_full_step6 | ViTPose-s, R3a full | 90 | 112.09 s | 183.30 s | 498.6 MiB | 1199.29 / 1173.78 / 1366.94 ms | 0.83 | 90 | 0 / 0 / 90 / 0 | 0.742 [0.436-0.917] |
| rtmlib-vitpose_R3a_crop_step6 | ViTPose-s, R3a crop | 90 | 114.06 s | 195.84 s | 504.6 MiB | 1219.62 / 1195.95 / 1552.28 ms | 0.82 | 90 (max 2) | 0 / 4 / 85 / 1 | 0.658 [0.335-0.907] |
| rtmlib-vitpose_R3b_full_step10 | ViTPose-s, R3b | 45 | 51.05 s | 85.20 s | 525.9 MiB | 1062.64 / 893.72 / 1434.21 ms | 0.94 | 45 | 0 / 19 / 26 / 0 | 0.647 [0.323-0.809] |
| rtmlib-rtmw_R3a_cu_full_step5 | RTMW-x-l, R3a_cu | 60 | 90.68 s | 175.52 s | 790.1 MiB | 1465.16 / 1511.71 / 1808.48 ms | 0.68 | 60 | 0 / 0 / 60 / 0 | 4.509 [0.959-8.758] |
| rtmlib-dwpose_R3a_cu_full_step5 | DWPose-l, R3a_cu | 60 | 62.18 s | 129.03 s | 575.2 MiB | 993.21 / 984.85 / 1515.23 ms | 1.01 | 60 | 0 / 45 / 15 / 0 | 0.782 [0.303-0.947] |
| rtmlib-vitpose_R3a_cu_full_step5 | ViTPose-s, R3a_cu | 60 | 106.48 s | 128.82 s | 498.2 MiB | 1721.15 / 1722.57 / 2137.89 ms | 0.58 | 60 | 0 / 57 / 3 / 0 | 0.747 [0.315-0.864] |

- Score scales differ: RTMW's hand scores run above 1 (per-hand means 0.96 to 8.76 across its three runs), DWPose's
  and ViTPose's stay below 1 here; a fixed threshold such as 0.3 therefore means different things per model, and every
  RTMW hand passed it.
- On R3a_cu (picking hand out of frame), the person's right hand passed the 0.3 mean-score rule in 60 of 60 RTMW
  frames, 15 of 60 DWPose frames and 3 of 60 ViTPose frames; the left (fretting) hand in all 60 for all three.
- Whole-body models output both hands for every detected person whether or not a hand is visible: on R3a full all
  three report 2 hands in all 90 frames, including the wide shot, where by eye the picking hand is behind the music
  stand. Where their hands landed on R3a full (`hand_regions.py`, frames): medium fretting 53 of 53, medium picking 53
  of 53, wide fretting 37 of 37, wide elsewhere 37 (the person's right hand, behind the stand) - identical counts for
  RTMW, DWPose and ViTPose.
- Hand detector on R3a: RTMDet-nano returned a box in 148 of 540 full frames (147 of 319 medium, 1 of 221 wide) and in
  536 of 540 3x crops. Counted hands (mean score >= 0.3) on R3a full: 74 frames in the medium-shot fretting region, 1 in
  the wide-shot fretting region; on the crops: 166 frames medium fretting, 11 medium elsewhere, 16 wide fretting.
- The "crop" mode on R3a gives the whole-body detector a crop with the person cut at the hip; YOLOX found two person
  boxes in some crop frames (5 RTMW frames with 4 hands, 3 DWPose, 1 ViTPose).
- Output format facts: rtmlib returns `keypoints` (N, K, 2) pixels and `scores` (N, K), K = 21 (hand) or 133
  (whole body, COCO-WholeBody order: 0-16 body, 17-22 feet, 23-90 face, 91-111 left hand, 112-132 right hand). The
  hand order inside each 21-block is the same as MediaPipe's (wrist, then thumb to pinky, base to tip). The detectors
  return (M, 4) xyxy boxes. The script stores per frame `n_det_boxes`, `det_boxes_full`, and per hand `kp_px_full`,
  `kp_score`, `score` (mean), `label`.
- Constraint inputs: the model files and input sizes (`det_input_size`, `pose_input_size`), `backend`
  ("onnxruntime", "opencv", "openvino"), `device`; `mode` ("performance", "balanced", "lightweight") for the solution
  classes; `to_openpose` for an OpenPose-style keypoint order. No handedness or guitar-specific constraint.
- Samples: `samples/rtmlib/` (frames, summaries, freeze).

## YOLOE-26s (open-vocabulary detection and segmentation), ultralytics 8.4.209

- What it is: Ultralytics' YOLOE model (`yoloe-26s-seg.pt`, 31,072,171 bytes, sha256
  `48f24206bc8680d60cbbfa296b0140da849669b9515058b72f5a945142df0654`, assets release v8.4.0) with text prompts encoded
  by MobileCLIP2 (`mobileclip2_b.ts`, 253,794,476 bytes, sha256
  `35d7f213e4d75f38514e4656ad3cb91158bd33e3805d8ac349f23b186f66982f`; the checkpoint's stored config names the text
  model `mobileclip2:b`). Same torch venv.
- Install facts: Ultralytics' `nn/text_model.py` runs `import clip` at import time even for MobileCLIP models. With
  `openai-clip` 1.0.1 installed (it had been installed for YOLO-World), the first run failed with
  `ModuleNotFoundError: No module named 'pkg_resources'` (raised in `clip/clip.py` line 6, `from pkg_resources import
  packaging`); installing `setuptools<81` (80.10.2) fixed the import, which then warns `pkg_resources is deprecated as
  an API`. A separately downloaded `mobileclip_blt.ts` (599,764,649 bytes) was deleted unused after the model's config
  showed it uses MobileCLIP2.
- Settings: `model.set_classes(PROMPTS, model.get_text_pe(PROMPTS))` with PROMPTS = guitar, guitar neck, fretboard,
  headstock, capo, hand; `predict(conf=0.05)`; boxes >= 0.05 kept. Script `scripts/run_openvocab.py yoloe <outdir>
  <weights dir>`. Images: R3a frames 100, 300, 500 (full), 100 and 300 (3x crop), R3a_cu frames 0, 150, 280.
- Run: step `yoloe-26s_openvocab_rerun` of group job B1 (2 cores): wall 16.00 s, CPU 11.79 s, peak RSS 733.5 MiB;
  model and text-encoder setup 7.52 s; 0.33-0.81 s per image.

| image | guitar (count >= 0.25; top score) | guitar neck | fretboard (top score, below 0.25) | headstock | capo | hand (top score, below 0.25) |
|---|---|---|---|---|---|---|
| R3a f100 full | 1; 0.877 | none >= 0.05 | none | none | none | none |
| R3a f300 full | 1; 0.712 | none | none | none | none | none |
| R3a f500 full | 1; 0.847 | none | none | none | none | none |
| R3a f100 crop | 1; 0.339 | none | 0.091 | none | none | none |
| R3a f300 crop | 1; 0.768 | none | 0.097 | none | none | none |
| R3a_cu f0 | 1; 0.764 | none | none | none | none | 0.071 |
| R3a_cu f150 | 1; 0.766 | none | none | none | none | 0.096 |
| R3a_cu f280 | 1; 0.626 | none | none | none | none | none |

- The "guitar" box on R3a frame 100 is (206.7,128.6)-(394.8,422.4) (whole instrument). On R3a_cu frame 150 the "hand"
  box (score 0.096) is (428.4,175.2)-(572.6,358.5), around the fretting hand.
- Output format facts: like YOLO detection plus masks: `results[0].boxes` (xyxy, conf, cls index into the prompt list)
  and `results[0].masks` (one mask per box). `results.json` (`samples/yoloe-26s/`) lists every box >= 0.05 per image
  and prompt, with counts at >= 0.05, 0.25 and 0.5.
- Constraint inputs: the text prompt list (`set_classes`), `conf`, `imgsz`; YOLOE also takes visual prompts (not used).

## Grouped jobs (gtr-run ids for the steps above)

The CPU slots were contended (the C1 job waited 1823.2 s for a slot, r0336 1800.7 s), so from 21:12 UTC most model
runs went through two grouped jobs that each held one 2-core slot and ran their steps one after another
(`scripts/steps.sh`, GNU `time` per step; `samples/steps/<group>.steps` lists the exact commands and
`<group>.steps.times.tsv` the per-step exit code, wall, user and system CPU seconds and peak RSS in kB). Steps were
appended to the two step files while the jobs ran, so each job's ledger label names only the steps it was started
with. Four other grouped jobs (A1, A2, C2, D1), a separate CoTracker job and a second OpenPose job (R3a) were queued
as well and cancelled while still waiting for a slot (no ledger entries); their steps were moved into B1 and C1.

| gtr-run id | group | cores | slot wait | started (UTC) | wall | CPU (user+sys) | peak RSS of any step | steps |
|---|---|---|---|---|---|---|---|---|
| r0408 | C1 | 0-1 | 1823.2 s | 2026-11-10T22:01:25 | 1596.1 s | 2307.95 s | 777.3 MB | 29 (2 failed and were re-run, 1 failed: see below) |
| r0448 | B1 | 2-3 | 2941.0 s | 2026-11-10T22:01:24 | 2457.96 s | 2887.20 s | 8607.3 MB (the CoTracker step) | 18 (1 failed and was re-run: see below) |

Failed steps, as they happened: `rtmlib-hand_R3b_full` and `rtmlib-hand_R3c_full` (C1) stopped at the first sample
image with `ModuleNotFoundError: No module named 'PIL'` (pillow was then installed into the rtmlib venv and both were
re-run); `mediapipe-holistic_R3a_crop` (C1) failed at the shot cut (Holistic section); `yoloe-26s_openvocab` (B1) failed
at import with `ModuleNotFoundError: No module named 'pkg_resources'` (from `import clip`, see the YOLOE section) and was
re-run after `setuptools<81` was installed.

Runs outside the groups: r0071, r0075, r0078, r0087 (MediaPipe Hand Landmarker; r0057 and r0061 failed before
libgles2 was installed), r0336 (OpenPose hand, unmirrored), and the light `--nolock` runs r0149, r0172, r0193, r0214,
r0218, r0227, r0350 (smoke test of the edited rtmlib script on 2 frames), r0400, r0402. Two short ffmpeg jobs made the
lane input and contact sheet (r0012, r0015).

## Media kept outside git

All under `/home/user/gtr/lanes/video-hands-fretboard/`; none is copied into the repo.

| file | bytes | duration | what it is |
|---|---|---|---|
| `inputs/R3a_cu/R3a_cu.mp4` | 2,244,809 | 10.01 s | Lane input: 682-692 s of the R3a source concert (CC BY-SA 4.0, attribution in `inputs.md`), H.264 640x480 with AAC audio |
| `inputs/R3a_cu/R3a_cu.wav` | 1,765,672 | 10.008 s | Its audio, 16-bit 44.1 kHz stereo |
| `out/videos/R3a_cu_mediapipe_hands.mp4` | 925,707 | 10.01 s | R3a_cu with MediaPipe Hand Landmarker landmarks drawn (r0078 output; drawing run r0227), no audio |
| `out/videos/R3a_mediapipe_hands_full.mp4` | 927,653 | 18.02 s | R3a full frame with MediaPipe landmarks (r0071 output), no audio; shows the false detection on the sheet music in the wide shot |
| `out/videos/R3b_mediapipe_hands_960.mp4` | 1,608,746 | 18.00 s | R3b at 960x540 with MediaPipe landmarks (group C1 output), no audio |
| `out/videos/R3c_mediapipe_hands_960.mp4` | 940,447 | 18.00 s | R3c at 960x540 with MediaPipe landmarks (group C1 output), no audio |
| `out/sam2/R3a_cu_f150-179.mp4` | 395,005 | 1.00 s | The 30 R3a_cu frames given to SAM 2.1 video mode (H.264 CRF 10), no audio |

The R3b and R3c overlays carry the licenses of those clips (shared manifest); R3a and R3a_cu overlays are CC BY-SA 4.0
derivatives of the archive.org concert video.
