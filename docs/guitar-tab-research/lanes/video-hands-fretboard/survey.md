# Video lane survey: hands, fingers and the fretboard from video

Lane `video-hands-fretboard`, written by the `docs-video-hands-fretboard` agent on 2026-11-10 (date from
`date -u +%F`). This file is a written record from primary sources (repositories, model cards, license files,
official docs). Nothing here was run as a model: the `try-video-hands-fretboard` agent runs the tools and writes
`trials.md`. "Read 2026-11-10" means the source was fetched on that date.

Checked and corrected in place by `verify-docs-video-hands-fretboard` on 2026-11-10: every quote was re-fetched from
its URL and compared verbatim. Corrections, additions and the tally are listed in the "Verification log" at the end;
lines marked "(verify)" were added or rewritten by that check.

How the dates below were obtained (all on 2026-11-10):

- Last commit: a metadata-only `git clone --depth 1 --filter=blob:none --no-checkout https://github.com/<owner>/<repo>`
  then `git log -1 --format=%cI` (script: `scripts/repo_facts.sh`). The date is the committer date of the newest
  commit on the default branch, in the committer's own time zone (verify: for example ViTPose's
  `2025-12-26T00:25:15+08:00` is 2025-12-25 in UTC). (verify) On 2026-11-10 at about 21:20 UTC every clone's HEAD was
  compared with `git ls-remote` of the repository: all 32 were still at the remote HEAD, so the dates below stand.
- Latest release: `https://pypi.org/pypi/<name>/json` (version and the earliest upload time of that version's
  files) and `npm view <name>`.
- License files: read with `git show HEAD:<file>` from those clones, then fetched again from
  `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<file>` and compared by MD5: 29 such URLs (28 LICENSE files
  and the SAM 2 README) answered HTTP 200 with content identical to the clone on 2026-11-10. Dataset READMEs and
  license files of repositories that were not cloned (COCO-WholeBody, FreiHAND, Halpe, InterHand2.6M, OSX/UBody) were
  read directly from raw.githubusercontent.com. Default branches seen: `main` for most, `master` for
  mediapipe, openpose, YOLO-World, tfjs-models, manopth, manotorch and alltracker, `onnx` for DWPose, `5.x` for
  OpenCV (whose `4.x/LICENSE` is identical).

## Tool list

One line per tool. RUNNABLE = the tool's own README or docs show CPU inference (a `device='cpu'` example, a
CPU-only build or a CPU benchmark), so it looks runnable on this CPU-only Linux box. "CPU not stated" = the README
read today says nothing about CPU; whether it runs here is UNVERIFIED until the try agent attempts it.

(verify) What the try agent had actually run on this box by 21:40 UTC, from the run ledger
(`/home/user/gtr/ledger/runs.jsonl`, exit code 0) and `trials.md`: MediaPipe Hand Landmarker 1.2.2 (r0071, r0075,
r0078, r0087), OpenCV 5.0.0 line detection (r0149, r0214), the MediaPipe-to-OpenCV fingertip handoff (r0172, r0218)
and OWLv2 through a public Hugging Face Space (r0193, remote inference). Group runs for rtmlib, RTMW / DWPose and
Ultralytics pose (gtr-run groups A1, A2, B1) were still running, and trials.md had no section yet for rtmlib,
Ultralytics pose, YOLOE-26, CoTracker3, SAM 2.1 or OpenPose, so those formats are not yet cross-checked against runs.

### Hand and body keypoints (2D, some 3D)

- MediaPipe Hand Landmarker / Holistic / Pose (Google, `google-ai-edge/mediapipe`): PyPI `mediapipe` 1.2.2
  (2026-11-03), npm `@mediapipe/tasks-vision` 1.2.2; last commit 2026-11-10. Python, JS/WASM, Android, iOS. RUNNABLE
  (the hand page publishes a CPU latency benchmark; its Python examples set no GPU delegate).
- Legacy MediaPipe JS solutions `@mediapipe/hands` 0.4.1675469240 and `@mediapipe/holistic` 0.5.1675471629 (npm;
  version numbers embed a 2023-02 Unix time). The pre-Tasks packages (see the MediaPipe section).
- TensorFlow.js `@tensorflow-models/hand-pose-detection` 2.0.1 (npm, published 2023-07-31; repo
  `tensorflow/tfjs-models` last commit 2026-03-28): browser hand model with `runtime: 'mediapipe'` or `'tfjs'`.
- ml5.js `handPose` (npm `ml5` 1.4.0, 2026-08-07; repo `ml5js/ml5-next-gen` last commit 2026-11-09): browser
  library whose `src/HandPose/index.js` imports `@tensorflow-models/hand-pose-detection` (verify: the README itself
  does not mention handPose).
- MMPose 1.x (OpenMMLab, `open-mmlab/mmpose`): PyPI 1.3.2 (2024-07-12); last commit 2025-08-04. Home of RTMPose
  hand models, RTMW whole-body and the DWPose distillation. Python API and CLI demo scripts. RUNNABLE (the RTMPose
  README reports Intel i7-11700 CPU speeds).
- rtmlib (`Tau-J/rtmlib`): PyPI 0.0.16 (2026-08-04); last commit 2026-11-07. RTMPose / RTMW / DWPose / RTMO through
  ONNX Runtime or OpenCV DNN, no mmcv. RUNNABLE (`device = 'cpu'` in README).
- DWPose (IDEA Research, `IDEA-Research/DWPose`): last commit 2023-12-12. 133-keypoint whole-body (incl. 2x21 hand)
  distilled RTMPose. Also run through rtmlib and `controlnet-aux` 0.0.10 (PyPI 2025-05-08).
- Ultralytics YOLO pose and hand-keypoints (`ultralytics/ultralytics`): PyPI 8.4.209 (2026-11-10); last commit
  2026-11-10. Python API and `yolo` CLI. RUNNABLE (README shows `device="cpu"` and CPU ONNX speeds). AGPL-3.0.
- OpenPose (CMU, `CMU-Perceptual-Computing-Lab/openpose`): last commit 2024-08-02. C++ with Python bindings; body
  + 2x21 hand + face keypoints. RUNNABLE by the definition above (README lists a CPU-only build; needs a source
  build). Academic, non-commercial license (quoted below).
- ViTPose (`ViTAE-Transformer/ViTPose`): last commit 2025-12-26. Transformer pose models; HaMeR's and Hamba's demos
  use a ViTPose model to locate hands (`vitpose_model.py`); rtmlib lists "ViTPose for 133 keypoints". CPU not stated.
- Sapiens (Meta, `facebookresearch/sapiens`): last commit 2026-05-26. Human-centric models including pose (verify:
  17, 133 or 308 keypoints, `docs/POSE_README.md`). CPU not stated. CC BY-NC 4.0 (code and HF weights).
- (verify, added) Sapiens2 (Meta, `facebookresearch/sapiens2`, ICLR 2026, arXiv 2604.21681): last commit 2026-05-24;
  "April 24, 2026: Initial Sapiens2 release"; pose estimation with "308 whole-body keypoints" (README). Own "Sapiens2
  License" (quoted in the whole-body section). CPU not stated.

### 3D hand mesh (MANO-based)

- HaMeR (`geopavlakos/hamer`): last commit 2026-02-07. 3D MANO hand mesh "from monocular input". CPU not stated.
- WiLoR (`rolpotamias/WiLoR`): last commit 2026-04-07. Hand detector + 3D MANO hand mesh. CPU not stated.
- WiLoR-mini (`warmshao/WiLoR-mini`): last commit 2025-06-14; not on PyPI. Repackaged WiLoR inference. RUNNABLE by
  the definition above (README example falls back to `torch.device("cpu")` when CUDA is absent; it also sets
  `dtype = torch.float16`).
- Hamba (`humansensinglab/Hamba`): last commit 2026-02-01. 3D hand mesh with a Mamba-based graph backbone. CPU not
  stated.
- HaWoR (`ThunderVVV/HaWoR`): last commit 2026-04-16. World-space 3D hand motion from egocentric video. CPU not stated.
- SAM 3D Body (Meta, `facebookresearch/sam-3d-body`): last commit 2026-02-19. "single-image full-body 3D human mesh
  recovery", with "hand refinement from the hand decoder" (README). CPU not stated. Gated weights.
- (verify, added) FAH, "Fast and Accurate Hand Estimation" (`noahcao/FAH`, arXiv 2611.07711): last commit
  2026-11-07, subject "feat: FAH initial release". 2D and 3D hand joints and surface points, then a MANO and/or
  MHR-Hand fit; video mode. README: "On CPU or Apple silicon, omit the CUDA PyTorch command and install with
  `pip install -e .`." Code Apache-2.0, weights research and non-commercial only (FAH section).
- (verify, added) EgoHand v1 (NVIDIA, `NVIDIA/IsaacCapture` subfolder `src/python/isaaccapture_egopost`, arXiv
  2610.30293, v1 21 Oct 2026): monocular 3D hand reconstruction with the SOMA-Hand representation (no MANO). README
  system requirements list an NVIDIA GPU. OpenMDW-1.1 (EgoHand section).
- MANO hand model (MPI; layers `hassony2/manopth` last commit 2020-09-10, `lixiny/manotorch` last commit 2026-02-03,
  `vchoutas/smplx` PyPI 0.1.28 2021-05-26): needed by HaMeR / WiLoR / Hamba / HaWoR; the model files come from
  mano.is.tue.mpg.de after registration.

### Segmentation and open-vocabulary detection (neck, fretboard, capo, hands)

- Segment Anything 2 (Meta, `facebookresearch/sam2`): last commit 2024-12-15. Image and video segmentation with
  prompts. NOTE: PyPI `sam2` 1.1.0 (2024-12-21) is uploaded by a third party (author "Jorge Insua", homepage
  github.com/JinsuaFeito-dev/segment-anything-2), not by Meta. CPU not stated in README.
- Segment Anything 3 (Meta, `facebookresearch/sam3`): PyPI `sam3` 0.1.4 (2026-05-26, author "Meta AI Research");
  last commit 2026-10-23. Text-prompted ("concept") segmentation and tracking. CPU not stated.
- Segment Anything 1 (`facebookresearch/segment-anything`): last commit 2024-09-18.
- Grounding DINO (IDEA Research, `IDEA-Research/GroundingDINO`): last commit 2024-08-12; PyPI `groundingdino-py`
  0.4.0 (2023-05-23; verify: its PyPI homepage is github.com/giswqs/GroundingDINO, a third-party packaging). Text-prompted
  boxes. RUNNABLE (README: "Support CPU-only mode", `--cpu-only` flag). Also in
  Hugging Face `transformers` (PyPI 5.22.2, 2026-11-06).
- Grounded-SAM-2 (`IDEA-Research/Grounded-SAM-2`): last commit 2025-11-11. Scripts that pass Grounding DINO,
  Florence-2 or DINO-X boxes to SAM 2 (root files `grounded_sam2_dinox_demo.py`, `grounded_sam2_florence2_*`).
- OWLv2 (Google, `google-research/scenic`, last commit 2026-10-31; also in `transformers`): open-vocabulary boxes.
- YOLO-World (`AILab-CVC/YOLO-World`): last commit 2025-02-27; also inside Ultralytics. CPU not stated in its README.
- YOLOE (`THU-MIG/yoloe`): last commit 2025-06-26; text, visual or prompt-free open-vocabulary detection and
  segmentation, built on the Ultralytics code base. (verify) Ultralytics also ships YOLOE-26 (`YOLOE("yoloe-26s-seg.pt")`;
  paper arXiv 2602.00168, Sapkota and Karkee, 29 Jan 2026); its text prompts load Apple's MobileCLIP2 text encoder,
  whose upstream model card carries a research-only license (YOLO-World / YOLOE section).
- Roboflow Inference (`roboflow/inference`): PyPI `inference` 1.8.4 (2026-10-30); last commit 2026-11-10. Runs
  Roboflow Universe models locally (CPU Docker image `roboflow-inference-server-cpu`) or through Roboflow's hosted
  API. Roboflow Universe guitar projects found by search (pages answered HTTP 403 to this box, so their licenses and
  contents are UNVERIFIED): `code-and-chords/guitar-necks-detector-ogacd`,
  `code-and-chords/guitar-frets-segmenter`, `hubert-drapeau-qt6ae/guitar-necks-detector`, `soen357/fretboard`,
  `john-tappen-workspace/fret-detection`, `javiribera/guitar-fret`, `joaomarcoscrs/guitar-chords-daewp`,
  `b101/guitar-g65u6`, `guitardetection/guitar_detection-ca6i4`.

### Classical fretboard geometry

- OpenCV (`opencv/opencv`): `opencv-python` 5.0.0.93 (PyPI 2026-07-02); last commit 2026-11-10. Canny, Hough
  lines, `findHomography`, `warpPerspective`, optical flow. RUNNABLE. Also in the browser
  (`@techstark/opencv-js` 5.0.0-release.1 on npm).

### Point trackers (follow the neck, frets and fingertips between frames)

- CoTracker / CoTracker3 (Meta, `facebookresearch/co-tracker`): last commit 2025-01-21; not on PyPI (torch.hub).
  RUNNABLE for small tasks (README: "for small tasks CoTracker can be run on CPU"). CC BY-NC 4.0.
- TAPIR, BootsTAPIR, TAPNext (Google DeepMind, `google-deepmind/tapnet`): last commit 2026-11-02; not on PyPI.
  CPU not stated.
- AllTracker (`aharley/alltracker`): last commit 2026-05-07. CPU not stated.

### Research systems that go from guitar video to fingering or tab (papers; code status in each section)

- TapToTab (arXiv 2409.08618, 2024): YOLOv8 / YOLOv8-OBB detection of strings, fret zones and hand positions plus
  FFT audio analysis. No code link found.
- GuiFiR (Kookmin University AI Lab, IEEE Access 2026): guitar finger reading, weakly supervised hand + fretboard
  pose (126 fretboard landmarks). Dataset "publicly available" per the lab page; no code or data link found.
- "Tabbers" / "You Just Play" (PyData Tel Aviv 2025 talk): audio + video tab product (Python, OpenCV, Librosa; the
  talk page names no specific pose model). No code release.
- (verify, added) Bae, Kwon and Park, "An Audio-Visual Framework for Transcription and Fingering Optimization in Bass
  Guitar Performance", UIST Adjunct 2025 poster: MediaPipe hand landmarks + OpenCV Hough lines for strings + CREPE
  Notes for pitch + a Bi-LSTM for fingering, on bass guitar. No code link in the PDF.
- Read today (see the Research section): Burns and Wanderley (NIME 2006, Hough transforms), Paleari et al. (2008,
  audio + video, "89% of notes"), Goldstein and Moses (BMVC 2018, string vibration from silent 240 fps video; project
  site with data and code per the paper; verify: the site's code page reads "Code will be available soon.", its data
  page links Dropbox videos). Named but not read: Kerdvibulvech and Saito (2007-2008), Hrybyk and Kim
  (2010), Scarr and Green (2010), Duke and Salgian (2019).

### Datasets pairing guitar video with annotations

- Goldstein and Moses 2018 (GoPro on the guitar, note ground truth); GuiFiR-Synth / GuiFiR-Vid (2026, no link found);
  GAPS (audio + score + MIDI, YouTube performance-video links, CC BY-NC-SA 4.0 on Zenodo; verify: "license: mit" on its
  Hugging Face card); Ego-Exo4D (Music scenario, 3D hand
  pose, signed license); Guitar-TECHS has no video in its release; Ultralytics Hand Keypoints (generic hands,
  CC BY-NC-SA 4.0). Details in the Datasets section.

(One section per tool follows; the Handoff facts are at the end.)

---

## MediaPipe Hand Landmarker, Holistic Landmarker and Pose Landmarker (Google)

- **What and who.** On-device hand, body and face landmark models and runtime from Google
  (`google-ai-edge/mediapipe`). Docs: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker ,
  https://ai.google.dev/edge/mediapipe/solutions/vision/holistic_landmarker ,
  https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker (all read 2026-11-10; the hand page says
  "Last updated 2026-11-04 UTC"; verify: each ai.google.dev URL redirects to the same path under
  https://developers.google.com/edge/mediapipe/solutions/vision/ , which answered HTTP 200 on 2026-11-10). Hand model card (PDF, linked from the hand page):
  https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf
  (read 2026-11-10).
- **Versions and maintenance.** PyPI `mediapipe` 1.2.2, files uploaded 2026-11-03; npm `@mediapipe/tasks-vision`
  1.2.2 (a `1.2.2-rc.20261110` pre-release was published 2026-11-10); repository last commit 2026-11-10. The older
  JS packages `@mediapipe/hands` (0.4.1675469240) and `@mediapipe/holistic` (0.5.1675471629) are the pre-Tasks
  "legacy solutions"; their version numbers end in 2023-02 Unix times. The repository at HEAD still contains
  `mediapipe/python/solutions/` (legacy) and `mediapipe/tasks/python/vision/hand_landmarker.py`,
  `holistic_landmarker.py`, `pose_landmarker.py` (Tasks API), checked with `git ls-tree` on 2026-11-10.
  (verify) The installed PyPI wheel differs from the repository tree: trials.md (MediaPipe section) records that in
  `mediapipe` 1.2.2 `hasattr(mp, 'solutions')` is False and `mediapipe.tasks.python.vision` exposes HandLandmarker,
  PoseLandmarker, HolisticLandmarker and FaceLandmarker; its first runs (r0057, r0061) failed with `OSError:
  libGLESv2.so.2: cannot open shared object file` until `libgles2` and `libegl1` were installed with apt.
- **How a program calls it.**
  - Python: `pip install mediapipe`, then (from the hand page) `HandLandmarkerOptions(base_options=BaseOptions(model_asset_path="hand_landmarker.task"), running_mode=VisionRunningMode.VIDEO, num_hands=2)`,
    `HandLandmarker.create_from_options(options)`, and per frame `landmarker.detect_for_video(mp_image, timestamp_ms)`.
    The page describes VIDEO mode as "Synchronous tracking across decoded video frames with monotonic timestamps.
    Processes every frame in order and never drops frames."
  - Browser: `npm install @mediapipe/tasks-vision`, `HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: "hand_landmarker.task", delegate: "GPU" }, ... })`,
    then `handLandmarker.detectForVideo(video, performance.now())`. The holistic demo line says "Runs in your browser
    with WebAssembly."
  - Also Android (Kotlin/Java) and iOS (Swift) APIs on the same pages. No HTTP API.
  - Model file: `hand_landmarker.task` from
    https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
    (link on the hand page); holistic: `.../holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task`;
    pose: `pose_landmarker_lite|full|heavy.task`.
- **Runs on.** CPU or GPU delegate. The hand page's benchmark: "HandLandmarker (full) Pixel 6 17.12ms 12.27ms"
  (CPU / GPU latency, "average latency on Pixel 6"). The model table lists "HandLandmarker (full) 192 x 192, 224 x 224
  float 16".
- **Input.** "Still images", "Decoded video frames", "Live video feed". The model card: "A video stream or an image of
  arbitrary size. Channels order: RGB with values in [0.0, 1.0]." Video mode needs a timestamp in milliseconds per
  frame, monotonically increasing. (verify) At the API level the trial passed an `mp.Image` in SRGB (uint8 HxWx3) per
  call, and 640x480, 720x720, 840x660 and 1280x960 inputs were accepted (trials.md, runs r0071-r0087); the model card's
  "[0.0, 1.0]" describes the model's input tensor, not the API object.
- **Output (hand).** From the hand page's "Task output" table: `handedness` "Category[][] (score in [0.0, 1.0])",
  "Left or Right classification for each detected hand"; `landmarks` "NormalizedLandmark[][] (x, y in [0.0, 1.0])",
  "21 3D keypoints per hand. x and y are normalized by image width and height. z represents landmark depth with the
  wrist (#0) as the origin (hand_landmarks in Python)"; `worldLandmarks` "Landmark[][] (meters)", "21 3D keypoints per
  hand in real-world meters, with the origin at the hand's geometric center (hand_world_landmarks in Python)". The 21
  ids run from 0 WRIST, 1-4 THUMB_CMC/MCP/IP/TIP, 5-8 INDEX_FINGER_MCP/PIP/DIP/TIP, 9-12 MIDDLE, 13-16 RING, to 17-20
  PINKY_MCP/PIP/DIP/TIP. No per-landmark confidence for hands in this table (one handedness score per hand). The page
  notes: "Left and Right handedness correspond to the subject's hands, not the viewer. Passing a horizontally mirrored
  image will invert these outputs." The model card says the z and world values are "provided using synthetic data,
  obtained via the GHUM model (articulated 3D human shape model) fitted to 2D point projections."
- **Output (holistic).** The holistic page's table: `faceLandmarks` 478, `poseLandmarks` 33 (normalized, "z relative
  to the midpoint of the hips"), `poseWorldLandmarks` 33 in meters, `leftHandLandmarks` / `rightHandLandmarks` 21
  each (normalized) and `leftHandWorldLandmarks` / `rightHandWorldLandmarks` 21 each (meters), optional
  `faceBlendshapes` and `segmentationMask`. The example payload shows `visibility` and `presence` on pose landmarks
  only. The same page says both "a total of 553 human body landmarks" (intro) and "Simultaneously track 543 face,
  pose, and hand landmarks" (demo line); 478 + 33 + 21 + 21 = 553.
- **Hints a re-run can take.** `num_hands` (default 1), `min_hand_detection_confidence`,
  `min_hand_presence_confidence`, `min_tracking_confidence` (each default 0.5), running mode. Nothing about
  instruments, regions of interest or handedness priors is listed among the options. (verify) trials.md agrees: "There
  is no region-of-interest input in the Python options; cropping (as here) is done outside."
- **Model card scope statements (quoted).** Out-of-scope applications include "Predicting hand landmarks with gloves
  or occlusions. For example when the hand is holding objects or there is decoration on the hand including jewelry,
  tattoo and henna." Limitations: "The model has been trained on limited datasets and is meant for experimental
  usage." and "The model has not been tested in “in-the-wild” smartphone camera conditions, including low-end
  devices, low light, motion blur etc., that can affect performance." Ethical considerations: "The primary intended
  application is for research and entertainment purposes."
- **Training data.** The hand page: "The model was trained on approximately 30K real-world images, as well as several
  rendered synthetic hand models imposed over various backgrounds." The model card: "This model was trained and
  evaluated on images, including consented images captured using a mobile AR application for smartphone cameras in
  various “in-the-wild” conditions." No public dataset name or dataset license is given on either page.
- **Author measurements.** The model card (page "5 of 7", read 2026-11-10) reports mean normalized absolute error
  (MNAE) on its own validation set: "Evaluation across 14 regions on the validation dataset yields an average
  performance of 12.02% +/- 1.6% stdev with a range of [8.43%, 13.42%] across regions for the lite model and an
  average performance of 10.09% +/- 1.73% stdev with a range of [6.10%, 13.00%] across regions for the full model."
  Its annotator baseline: "We asked 5 annotators to re-annotate the validation dataset, yielding an MNAE of 6.0%". It
  also states: "per-joint MNAE is the smallest at the base of each finger, and gets larger toward the fingertip" and
  "the normalized absolute error is larger for blurry or occluded joints." No guitar-specific figure is published.
- **LICENSE FACTS.**
  - a. Code: Apache-2.0. https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/LICENSE (read 2026-11-10)
    begins "Apache License Version 2.0, January 2004" and section 2 reads "Subject to the terms and conditions of
    this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge,
    royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly
    perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form." PyPI and npm
    metadata say "Apache 2.0" / "Apache-2.0".
  - b. Weights: the hand model card's header block reads "LICENSED UNDER Apache License, Version 2.0" (PDF above, read
    2026-11-10; verify: the heading and the value sit in the right-hand column of a two-column block, beside
    "DOCUMENTATION"); the BlazePose GHUM 3D model card (pose and holistic body part,
    https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf, read 2026-11-10) has
    the same "LICENSED UNDER Apache License, Version 2.0" block.
  - c. Training data: not named (see above), so no dataset license to quote.
  - d. Docs pages: "Except as otherwise noted, the content of this page is licensed under the Creative Commons
    Attribution 4.0 License, and code samples are licensed under the Apache 2.0 License." (hand page footer, read
    2026-11-10). No service terms apply: it runs locally or in the browser.

---

## MMPose, RTMPose (hand), RTMW and DWPose (whole body), and rtmlib

- **What and who.** MMPose is OpenMMLab's pose toolbox (`open-mmlab/mmpose`, docs https://mmpose.readthedocs.io).
  RTMPose is its real-time top-down pose family (`projects/rtmpose/README.md` in the repo); the hand model is
  "RTMPose-m" for 21 hand keypoints; RTMW is a 133-keypoint whole-body model "trained on 14 public datasets"
  (`Cocktail14`); DWPose (IDEA Research, `IDEA-Research/DWPose`) is a distilled 133-keypoint whole-body RTMPose,
  "trained and distilled on" COCO-WholeBody and UBody (RTMPose README, read 2026-11-10 from the repo at HEAD).
  rtmlib (`Tau-J/rtmlib`) is a separate small library that runs these models from ONNX files; the RTMPose README's
  entry for it: "Support OpenCV/ONNXRuntime/OpenVINO inference and does not require Pytorch or MMCV."
- **Versions and maintenance.** PyPI `mmpose` 1.3.2 (2024-07-12), `mmcv` 2.2.0 (2024-04-24), `mmdet` 3.3.0
  (2024-01-05); mmpose repository last commit 2025-08-04 (verify: its `requirements/mminstall.txt` at `main` reads
  "mmcv>=2.0.0,<3.0.0", "mmdet>=3.0.0,<3.3.0", "mmengine>=0.4.0,<1.0.0", so the newest PyPI mmdet, 3.3.0, is outside
  the pinned range). rtmlib PyPI 0.0.16 (2026-08-04, requires Python >=3.10),
  repository last commit 2026-11-07. DWPose repository last commit 2023-12-12; its weights were last modified on
  Hugging Face `yzd-v/DWPose` 2023-08-22 (HF API, read 2026-11-10).
- **How a program calls it.**
  - MMPose Python (docs "Inference with existing models", https://mmpose.readthedocs.io/en/latest/user_guides/inference.html,
    read 2026-11-10): the page's example is `inferencer = MMPoseInferencer('human')` ("instantiate the inferencer
    using the model alias"); its alias table maps `hand` to `rtmpose-m_8xb256-210e_hand5-256x256` with detector
    `ssdlite_mobilenetv2`, and `wholebody` to `rtmpose-m_8xb64-270e_coco-wholebody-256x192` with `RTMDet-m`, so
    `MMPoseInferencer('hand')` is that example with the hand alias (verify: not shown verbatim on the page). 3D alias
    `hand3d` = `internet_res50_4xb16-20e_interhand3d-256x256` (InterNet, "whole image").
  - MMPose CLI, verbatim from the same page: `python demo/inferencer_demo.py 'tests/data/coco/000000000785.jpg' \
    --pose2d 'human' --show --pred-out-dir 'predictions'`; for hands the alias would be `--pose2d 'hand'` (verify:
    adapted, not on the page). The `device` argument: "If left None, the Inferencer will select the most suitable one."
  - rtmlib Python (README at HEAD, read 2026-11-10): `from rtmlib import Wholebody, draw_skeleton` (and, for video,
    `from rtmlib import Body, Custom, PoseTracker, draw_skeleton`); `wholebody = Wholebody(to_openpose=openpose_skeleton,
    mode='balanced',  # 'performance', 'lightweight', 'balanced'. Default: 'balanced'` / `backend=backend,
    device=device)` with `openpose_skeleton = False`; `keypoints, scores = wholebody(img)`.
    (verify: the README has no `from rtmlib import Wholebody, Hand, PoseTracker` line; `Hand` is exported by
    `rtmlib/__init__.py` and its own docstring example starts `from rtmlib import Hand, draw_skeleton`.)
    The README lists `device = 'cpu'  # cpu, cuda, mps` and `backend = 'onnxruntime'  # opencv, onnxruntime, openvino`.
    `rtmlib.Hand` (source `rtmlib/tools/solution/hand.py`) downloads an RTMDet-nano hand detector
    (`rtmdet_nano_8xb32-300e_hand-267f9c8f.zip`, 320x320) and the RTMPose-m Hand5 model
    (`rtmpose-m_simcc-hand5_pt-aic-coco_210e-256x256-74fb594_20230320.zip`, 256x256) from download.openmmlab.com;
    only `mode='lightweight'` is accepted. `rtmlib.Wholebody` downloads RTMW ONNX models
    (`rtmw-dw-x-l_simcc-cocktail14_270e-384x288_20231122.zip` for `performance`, `rtmw-dw-l-m_..._256x192` for
    `lightweight`, `rtmw-dw-x-l_..._256x192` for `balanced`) with YOLOX person detectors.
  - Also: `controlnet-aux` 0.0.10 and `easy-dwpose` 1.0.2 on PyPI wrap DWPose (not read beyond PyPI metadata).
  - No HTTP API of its own. The models ship as ONNX files; ONNX Runtime Web (`onnxruntime-web` 1.31.1 on npm) is a
    browser runtime for ONNX. Whether these particular files run in it was not checked (UNVERIFIED).
- **Runs on.** The RTMPose README: "Our RTMPose-m achieves **75.8% AP** on COCO with **90+ FPS** on an Intel i7-11700
  CPU and **430+ FPS** on an NVIDIA GTX 1660 Ti GPU." Hand model latency is not filled in ("-") in the Hand5 table.
- **Input / output.** Images or video frames (numpy BGR arrays in rtmlib; paths, arrays or video files in MMPose).
  rtmlib returns `keypoints` (shape instances x K x 2, pixel coordinates of the input image: `RTMPose.postprocess`
  rescales SimCC locations back through the detection box's center and scale) and `scores` (instances x K, from
  `get_simcc_maximum`). K = 21 for `Hand`, 133 for `Wholebody` / DWPose. COCO-WholeBody README: "133 keypoints (17 for
  body, 6 for feet, 68 for face and 42 for hands)"; in MMPose's `configs/_base_/datasets/coco_wholebody.py` id 91 is
  `left_hand_root` and id 112 is `right_hand_root`, through id 132 `right_pinky_finger4` (read at HEAD 2026-11-10). With `to_openpose=True`, keypoints are converted to OpenPose order (rtmlib
  ships skeleton files `openpose134.py` and `openpose18.py`). `Hand` returns only `keypoints, scores` (its docstring
  example: `keypoints, scores = hand(frame)`), with no handedness field; whole-body models give hands as fixed left /
  right slots of the 133. MMPose's inferencer returns, per detected instance, a dict with
  `'keypoints'` and `'keypoint_scores'` (docs page above; the dict elides further keys with "...").
  2D only, except RTMW3D ("RTMW3D for 133 keypoints (**3D**)", rtmlib README) and the `hand3d` InterNet alias.
- **Hints a re-run can take.** Detection boxes can be passed in (`RTMPose.__call__(image, bboxes=[...])` in rtmlib),
  so a crop around the fretting hand or the neck can be forced; score thresholds (`kpt_thr`) apply at drawing time.
- **Author measurements.** RTMPose README, Hand5 table: RTMPose-m (alpha version) 256x256: "PCK@0.2 (COCO-Wholebody-Hand)
  81.5", "PCK@0.2 (Hand5) 96.4", "AUC (Hand5) 83.9", FLOPS 2.581 G. RTMDet-nano hand detector: "Model AP (OneHand10K)
  76.0". Cocktail14 table: RTMW-x 384x288 "Whole AP 70.2, Whole AR 78.1". DWPose README table (hand AP on
  COCO-WholeBody): DWPose-l 384x288 "Hand AP 0.621", "Whole AP 0.665"; DWPose-m 256x192 "Hand AP 0.527".
- **LICENSE FACTS.**
  - a. Code. MMPose: `LICENSE` at HEAD begins "Copyright 2018-2020 Open-MMLab. All rights reserved." then "Apache
    License Version 2.0, January 2004", with the Apache grant ("each Contributor hereby grants to You a perpetual,
    worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative
    Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in
    Source or Object form."). README: "This project is released under the [Apache 2.0 license](LICENSE)." MMPose's
    `LICENSES.md`: "In this file, we list the algorithms with other licenses instead of Apache 2.0. Users should be
    careful about adopting these algorithms in any commercial matters." It lists one table row (verify: the Files cell
    is a markdown link): "| EDPose | [mmpose/models/heads/transformer_heads/edpose_head.py](https://github.com/open-mmlab/mmpose/blob/main/mmpose/models/heads/transformer_heads/edpose_head.py) | IDEA License 1.0 |"
    (not used by the hand or RTMW models).
    rtmlib `LICENSE`: Apache License 2.0 (first lines read from the repo at HEAD; PyPI metadata "Apache License 2.0").
    DWPose `LICENSE`: Apache License 2.0 (first lines read from the repo at HEAD). All read 2026-11-10:
    https://raw.githubusercontent.com/open-mmlab/mmpose/main/LICENSE ,
    https://raw.githubusercontent.com/Tau-J/rtmlib/main/LICENSE ,
    https://raw.githubusercontent.com/IDEA-Research/DWPose/main/LICENSE (DWPose's default branch is `onnx`; its
    `LICENSE` there is identical).
  - b. Weights. DWPose on Hugging Face: model card front matter "license: apache-2.0"
    (https://huggingface.co/yzd-v/DWPose/raw/main/README.md, read 2026-11-10). RTMPose / RTMW / RTMDet-hand weights
    on download.openmmlab.com: no separate weights license was found on the README or the download links; the
    repository license above is Apache-2.0. Whether the dataset terms below carry over to the weights is not stated
    by OpenMMLab in the pages read.
  - c. Training data (the hand-relevant sets named in the RTMPose README's "Hand5", "Cocktail14" and "COCO+UBody"
    lists, and in the hand detector config `projects/rtmpose/rtmdet/hand/rtmdet_nano_320-8xb32_hand.py`, which loads
    OneHand10K, FreiHand, RHD and Halpe-hand):
    - COCO-WholeBody (https://raw.githubusercontent.com/jin-s13/COCO-WholeBody/master/README.md, read 2026-11-10):
      "1. COCO-WholeBody dataset is **ONLY** for research and non-commercial use. The annotations of COCO-WholeBody
      dataset belong to [SenseTime Research](https://www.sensetime.com), and are licensed under a [Creative Commons
      Attribution 4.0 License](https://creativecommons.org/licenses/by-nc/4.0/legalcode)." (the link text says
      Attribution 4.0, the link target is by-nc/4.0) "2. For commercial usage of our COCO-WholeBody annotations,
      please contact ..." "3. We do not own the copyright of the images. Use of the images must abide by the [Flickr
      Terms of Use](https://www.flickr.com/creativecommons/)."
    - OneHand10K (https://www.yangangwang.com/papers/WANG-MCC-2018-10.html, read 2026-11-10): "NOTE: this dataset is
      ONLY for research and non-commercial use." and "Any commercial use is not allowed. Commercial use includes but
      is not limited to sale of the data, derivatives, replicas, images, or video, inclusion in a product for sale,
      or inclusion in advertisements (printed or electronic), on commercially-oriented web sites, or in trade shows."
    - FreiHAND (https://raw.githubusercontent.com/lmb-freiburg/freihand/master/README.md, read 2026-11-10): "This
      dataset is provided for research purposes only and without any warranty. Any commercial use is prohibited."
    - RHD, Rendered Hand Pose Dataset
      (https://lmb.informatik.uni-freiburg.de/resources/datasets/RenderedHandposeDataset.en.html, read 2026-11-10):
      "This dataset is provided for research purposes only and without any warranty. Any commercial use is
      prohibited. If you use the dataset or parts of it in your research, you must cite the respective paper."
    - Halpe-FullBody (https://raw.githubusercontent.com/Fang-Haoshu/Halpe-FullBody/master/README.md, read
      2026-11-10): the README gives no license; "Train images from [HICO-DET]" and "Val images from [COCO]". No
      license file found at https://raw.githubusercontent.com/Fang-Haoshu/Halpe-FullBody/master/LICENSE (HTTP 404)
      on 2026-11-10.
    - InterHand2.6M (in Cocktail14; https://raw.githubusercontent.com/facebookresearch/InterHand2.6M/main/LICENSE,
      read 2026-11-10): the file is the "Attribution-NonCommercial 4.0 International" Creative Commons license text.
    - UBody (DWPose and Cocktail14): distributed through a Google Form linked from
      https://raw.githubusercontent.com/IDEA-Research/OSX/main/README.md; that README states no dataset license and
      the OSX code `LICENSE` is "MIT License" "Copyright (c) 2023 Jing Lin" (read 2026-11-10). The form's terms were
      not read: UNVERIFIED.
  - d. No service terms: local inference.

---

## Ultralytics YOLO: pose models and the Hand Keypoints dataset

- **What and who.** Ultralytics' YOLO package (`ultralytics/ultralytics`): detection, segmentation, oriented boxes
  (OBB) and pose. Docs https://docs.ultralytics.com/tasks/pose/ , https://docs.ultralytics.com/modes/predict/ ,
  https://docs.ultralytics.com/datasets/pose/hand-keypoints/ (all read 2026-11-10). TapToTab (research section below)
  reports YOLO V5, V8, V8 OBB and V9 results for its fretboard detector.
- **Versions and maintenance.** PyPI `ultralytics` 8.4.209 (2026-11-10); repository last commit 2026-11-10. The
  README's current model family is YOLO26 ("the latest [YOLO26]", README at HEAD).
- **How a program calls it.** CLI: `yolo predict model=yolo26n.pt source='https://ultralytics.com/images/bus.jpg'`;
  Python: `model = YOLO("yolo26n-pose.pt"); results = model(<image|video|stream>)` (README and predict docs).
  Training on the hand set: `yolo train data=hand-keypoints.yaml` or `model.train(data="hand-keypoints.yaml",
  epochs=100, imgsz=640)` (hand keypoints page). Export to ONNX and other formats is part of the package (README
  speed tables are "CPU ONNX"). No HTTP API in the open-source package; the README links its models to platform.ultralytics.com (a hosted
  service whose terms were not read: UNVERIFIED).
- **Runs on.** README: `device="cpu",  # Device to run on (e.g., 'cpu', 0, [0,1,2,3])`; README footnote: "CPU speeds
  measured with [ONNX](https://onnx.ai/) export." README pose table (YOLO26n-pose, 640 px): "mAP pose 50-95 (e2e)
  57.2", "mAP pose 50 (e2e) 83.3", "Speed CPU ONNX (ms) 40.3 ± 0.5". The pose models are "trained on
  [COCO-Pose](https://docs.ultralytics.com/datasets/pose/coco), focusing on the 'person' class" (README), i.e. body
  keypoints, not finger joints.
- **Output.** Per result, `result.keypoints` is a `Keypoints` object (predict docs table): `xy` "Keypoint coordinates
  in pixels with shape (N,K,2)", `xyn` "Normalized keypoint coordinates with shape (N,K,2)", `conf` "Returns confidence
  values of keypoints if available, else None". Plus `result.boxes` per instance. 2D only. No handedness field.
- **Hand Keypoints dataset (Ultralytics).** "The Ultralytics Hand Keypoints dataset contains 26,768 images of hands
  annotated with 21 keypoints each, generated using the Google MediaPipe library"; "Total images: 26,768 (18,776
  train / 7,992 val)"; "Keypoints: 21 per hand with (x, y, visibility) triplets"; `kpt_shape: [21, 3]`; download
  `https://github.com/ultralytics/assets/releases/download/v0.0.0/hand-keypoints.zip`. Provenance: "Images come from
  the 11k Hands collection and the Kaggle "2000 Hand Gestures" and "Gesture Recognition" datasets, with keypoints
  generated automatically by Google MediaPipe. Created by Ultralytics (Rion Dsilva)". The page shows how to train a
  model on it; no pretrained hand-keypoint weight file is linked on the page (the `.pt` names on it are
  `yolo26n-pose.pt`, `yolo11n-pose.pt`, `best.pt`, `pose.pt`).
- **Hints a re-run can take.** `conf` (default 0.25), `iou` (0.5), `imgsz` (640), `classes` and `device` are predict
  arguments (predict docs table, defaults re-read 2026-11-10). The `classes` argument filters among the classes a model
  was trained on; the pretrained pose models are trained on the 'person' class (README), and the docs' route to other
  classes is training on a dataset (`model.train(data=...)`, as on the hand keypoints page). (verify: rewritten; the
  earlier sentence gave advice.)
- **LICENSE FACTS.**
  - a. Code: AGPL-3.0. `LICENSE` at HEAD begins "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007"
    (https://raw.githubusercontent.com/ultralytics/ultralytics/main/LICENSE; read from the clone 2026-11-10). Section
    13: "Notwithstanding any other provision of this License, if you modify the Program, your modified version must
    prominently offer all users interacting with it remotely through a computer network (if your version supports
    such interaction) an opportunity to receive the Corresponding Source of your version by providing access to the
    Corresponding Source from a network server at no charge, through some standard or customary means of
    facilitating copying of software." README: "Request an Enterprise License for commercial use at [Ultralytics
    Licensing](https://www.ultralytics.com/license)."
  - Ultralytics licensing page (https://www.ultralytics.com/license, read 2026-11-10): "AGPL-3.0 covers a lot of use
    cases - but there are specific triggers that require an Ultralytics Enterprise license." "An Enterprise License is
    required if you want to use Ultralytics YOLO without open-sourcing your entire project." Listed triggers include
    "Any commercial product or service", "SaaS platforms, APIs, or cloud systems that use YOLO behind the scenes" and
    "Using custom-trained or fine-tuned YOLO models in a proprietary or commercial setting". The AGPL-3.0 column: "This
    license is the right one for you if you are comfortable open-sourcing your entire project under AGPL-3.0." No
    price is published on the page (Enterprise is "Request an Ultralytics Enterprise License").
  - b. Weights: no separate weights license file was found in the repository or on the pages read. The licensing
    page's triggers include "Using custom-trained or fine-tuned YOLO models in a proprietary or commercial setting".
  - c. Training data: COCO-Pose for the pose weights (COCO terms not quoted here). Hand Keypoints dataset page: "The
    images were collected and used under the respective licenses provided by each platform and are distributed under
    the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License." The dataset YAML header
    reads "# Ultralytics 🚀 AGPL-3.0 License - https://ultralytics.com/license".

---

## OpenPose (CMU)

- **What and who.** Carnegie Mellon University's Perceptual Computing Lab (`CMU-Perceptual-Computing-Lab/openpose`).
  README (read at HEAD 2026-11-10): "the **first real-time multi-person system to jointly detect human body, hand,
  facial, and foot keypoints (in total 135 keypoints) on single images**". C++ with a Python API (`doc/03_python_api.md`).
- **Versions and maintenance.** Last commit 2024-08-02, subject "Models working again". Not on PyPI.
- **How a program calls it.** Built from source (CMake), then the demo binary, e.g.
  `./build/examples/openpose/openpose.bin --video examples/media/video.avi --face --hand` (`doc/01_demo.md`), with
  `--write_json <dir>` to save one JSON file per frame (`doc/02_output.md`). Windows binary `bin\OpenPoseDemo.exe`.
- **Runs on.** `doc/installation/0_index.md`, under "**Requirements** for the default configuration" (verify:
  re-quoted with its list structure): the item "CPU-only (no GPU) version:" has the sub-item "Around 8GB of free RAM
  memory."; a separate item at the same level as the CUDA, OpenCL and CPU-only items reads "Highly recommended: a CPU
  with at least 8 cores." README: "**Hardware compatibility**: CUDA (Nvidia GPU), OpenCL (AMD
  GPU), and non-GPU (CPU-only) versions."
- **Output.** `doc/02_output.md` (verify: re-quoted with its numbered list): "Each file represents a frame, it has a
  `people` array of objects, where each object has:" followed by the list item "1. `pose_keypoints_2d`: Body part
  locations (`x`, `y`) and detection confidence (`c`) formatted as `x0,y0,c0,x1,y1,c1,...`." "`face_keypoints_2d`, `hand_left_keypoints_2d`, and `hand_right_keypoints_2d` are
  analogous to `pose_keypoints_2d` but applied to the face and hand parts." "The coordinates `x` and `y` can be
  normalized to the range [0,1], [-1,1], [0, source size], [0, output size], etc." 3D arrays
  (`x0,y0,z0,c0,...`) are filled only with `--3d` ("They are empty if `--3d` is not enabled"). The example shows hand points as
  x, y, c triplets (truncated with "..."), with `0,0,0` for a missing point; the README lists "**2x21-keypoint hand
  keypoint estimation**. **Runtime depends on number of detected people**." and `handKeypoints[0]` "corresponds to the
  left hand and handKeypoints[1] to the right one" (`doc/02_output.md`).
- **LICENSE FACTS.**
  - a. Code: `LICENSE` at HEAD
    (https://raw.githubusercontent.com/CMU-Perceptual-Computing-Lab/openpose/master/LICENSE; read from the clone
    2026-11-10) is titled "SOFTWARE LICENSE AGREEMENT ACADEMIC OR NON-PROFIT ORGANIZATION NONCOMMERCIAL RESEARCH USE
    ONLY". Grant: "Licensor retains exclusive ownership of any copy of the Software (as defined below) licensed under
    this Agreement and hereby grants to Licensee a personal, non-exclusive, non-transferable license to use the
    Software for noncommercial research purposes, without the right to sublicense". "PERMITTED USES: The Software may
    be used for your own noncommercial internal research purposes." "You may not sell, rent, lease, sublicense, lend,
    time-share or transfer, in whole or in part, or provide third parties access to prior or present versions (or
    any parts thereof) of the Software." "DERIVATIVES: You may create derivatives of or make modifications to the
    Software, however, You agree that all and any such derivatives and modifications will be owned by Licensor".
  - Commercial terms. README "License" section: "OpenPose is freely available for free non-commercial use, and may be
    redistributed under these conditions. Please, see the [license](./LICENSE) for further details. Interested in a
    commercial license? Check this [FlintBox link](https://cmu.flintbox.com/#technologies/b820c21d-8443-4aa2-a49f-8919d93a8740)."
    The FlintBox page returned only the title "CMU Flintbox" to a non-JavaScript fetch on 2026-11-10, so the
    commercial price and terms were not read: UNVERIFIED (a browser visit to that link would settle it).
  - b. Weights: no separate weights license or model card was found in the repository. The agreement defines
    "Software" as "(i) the actual copy of all or any portion of code for program routines made accessible to Licensee
    by Licensor pursuant to this Agreement, ... and (ii) all or any derivatives and/or modifications created or made
    by You to any of the items specified in (i)." Whether the downloaded model files fall under that definition is not
    stated in the text read.
  - c. Training data: not stated in the files read (UNVERIFIED).

---

## MANO hand model (needed by HaMeR, WiLoR, Hamba, HaWoR)

- **What and who.** MANO is a parametric 3D hand model from the Max Planck Institute for Intelligent Systems
  (https://mano.is.tue.mpg.de). HaMeR, WiLoR, Hamba and HaWoR predict MANO pose and shape parameters and need the
  file `MANO_RIGHT.pkl` (HaWoR also `MANO_LEFT.pkl`), which their READMEs tell the user to download after
  registering ("Please visit the [MANO website](https://mano.is.tue.mpg.de) and register to get access to the
  downloads section", HaMeR README).
- **PyTorch layers.** manopth (`hassony2/manopth`, last commit 2020-09-10, `LICENSE` "GNU GENERAL PUBLIC LICENSE
  Version 3, 29 June 2007"); manotorch (`lixiny/manotorch`, last commit 2026-02-03, `LICENSE` Apache License 2.0;
  README: "retrieve 778 vertices, 21 joints and 16 SE3 transforms of each articulation", "verts =
  mano_output.verts  # (B, 778, 3), root(center_joint) relative"). Both READMEs: "Note that all code and data from
  this download falls under the [MANO license](http://mano.is.tue.mpg.de/license)."
- **LICENSE FACTS (MANO model files).** https://mano.is.tue.mpg.de/license.html (read 2026-11-10), titled "Software
  Copyright License for non-commercial scientific research purposes":
  - "Licensor grants you (Licensee) personally a single-user, non-exclusive, non-transferable, free of charge right:
    ... To use the Software for the sole purpose of performing non-commercial scientific research, non-commercial
    education, or non-commercial artistic projects;"
  - "Any other use, in particular any use for commercial, pornographic, military, or surveillance, purposes is
    prohibited. This includes, without limitation, incorporation in a commercial product, use in a commercial
    service, or production of other artifacts for commercial purposes."
  - "This license also prohibits the use of the Software to train methods/algorithms/neural networks/etc. for
    commercial, pornographic, military, surveillance, or defamatory use of any kind."
  - (verify, added; missing before) "The Data & Software may not be reproduced, modified and/or made available in any
    form to any third party without Max-Planck’s prior written permission." and "By downloading and/or using the
    Software, you acknowledge that you have read these terms and conditions, understand them, and agree to be bound by
    them." (same page, re-read 2026-11-10).
  - Under the heading "No Distribution": "The Software and the license herein granted shall not be copied, shared,
    distributed, re-sold, offered for re-sale, transferred or sub-licensed in whole or in part except that you may
    make one copy for archive purposes only."
  - Under the heading "Commercial licensing opportunities": "For commercial uses of the Software, please send email
    to ps-license@tue.mpg.de"
- **Observed distribution fact.** The Hugging Face model repository `warmshao/WiLoR-mini`, which WiLoR-mini's code
  downloads from by default (`WILOR_MINI_REPO_ID = "warmshao/WiLoR-mini"`), lists a file
  `pretrained_models/MANO_RIGHT.pkl` (HF API, read 2026-11-10). That repository carries no license tag. (verify) The
  try agent did not download or use that copy, citing the MANO "No Distribution" clause (trials.md, WiLoR section).

---

## HaMeR (3D hand mesh from one image)

- **What and who.** "Reconstructing Hands in 3D with Transformers", Pavlakos et al., arXiv 2312.05251 (submitted 8 Dec
  2023), code `geopavlakos/hamer` (last commit 2026-02-07). Abstract: "For training data, we combine multiple
  datasets that contain 2D or 3D hand annotations. For the deep model, we use a large scale Vision Transformer
  architecture." HInt annotations released separately (README: "[2024/05] We have released the HInt dataset
  annotations").
- **How a program calls it.** Python repository (not on PyPI): `pip install -e .[all]`, `pip install -v -e
  third-party/ViTPose`, `bash fetch_demo_data.sh` (trained models), plus `MANO_RIGHT.pkl`. Demo:
  `python demo.py --img_folder example_data --out_folder demo_out --batch_size=48 --side_view --save_mesh
  --full_frame` (README "Demo" block; argument names from `demo.py` at HEAD: `--checkpoint`, `--img_folder`, `--out_folder`,
  `--save_mesh`, `--rescale_factor` default 2.0, `--body_detector` `vitdet` or `regnety`). Hands are located
  with a detectron2 person detector and a ViTPose keypoint model (`demo.py` imports `ViTPoseModel` and detectron2;
  it takes the last 21 keypoints as the right hand, `vitposes['keypoints'][-21:]`, and records `is_right` 0 or 1 per
  hand box).
- **Runs on.** README install is "for CUDA 11.7, but you can adapt accordingly"; CPU is not mentioned (UNVERIFIED).
- **Output.** `hamer/models/hamer.py` returns `pred_cam`, `pred_mano_params` (MANO pose and shape), `pred_cam_t`,
  `focal_length`, `pred_keypoints_3d`, `pred_vertices` and `pred_keypoints_2d` per hand crop; `--save_mesh` writes
  meshes. README: "We only require the right hand model"; `demo.py` multiplies the camera x term by `(2*batch['right']-1)`
  for each hand box.
  No per-joint confidence output in the keys listed. (verify) `pred_keypoints_2d` is not in frame pixels:
  `hamer.py` projects with `focal_length=focal_length / self.cfg.MODEL.IMAGE_SIZE` and `perspective_projection`
  defaults the camera center to zeros (`hamer/utils/geometry.py`), so the points are relative to the hand crop; the
  demo maps the camera to the full frame with `cam_crop_to_full(pred_cam, box_center, box_size, img_size,
  scaled_focal_length)` for rendering.
- **Training data.** `hamer/configs_hydra/data/mix_all.yaml` at HEAD: FREIHAND-TRAIN 0.25, INTERHAND26M-TRAIN 0.25,
  MTC-TRAIN 0.1, RHD-TRAIN 0.05, COCOW-TRAIN 0.1, HALPE-TRAIN 0.05, MPIINZSL-TRAIN 0.05, HO3D-TRAIN 0.05,
  H2O3D-TRAIN 0.05, DEX-TRAIN 0.05 (weights). License clauses for FreiHAND, RHD, InterHand2.6M, COCO-WholeBody and
  Halpe are quoted in the MMPose section above; MTC, MPII NZSL, HO-3D, H2O-3D and DexYCB licenses were not read
  (UNVERIFIED).
- **LICENSE FACTS.** a. Code: `LICENSE.md` "MIT License", "Copyright (c) 2023 UC Regents, Georgios Pavlakos",
  "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software"
  (https://raw.githubusercontent.com/geopavlakos/hamer/main/LICENSE.md, read from the clone 2026-11-10).
  b. Weights: fetched by `fetch_demo_data.sh`; no separate weights license found in the README. c. Requires MANO
  (license quoted above) and the datasets listed.

## WiLoR and WiLoR-mini (hand detector + 3D hand mesh)

- **What and who.** "WiLoR: End-to-end 3D Hand Localization and Reconstruction in-the-wild", Potamias et al., arXiv
  2409.12259 (v1 18 Sep 2024, v2 26 Mar 2025, "CVPR 2025"). Abstract: "a real-time fully convolutional hand
  localization and a high-fidelity transformer-based 3D hand reconstruction model" and "a large-scale dataset with
  over than 2M in-the-wild hand images". Code `rolpotamias/WiLoR` (last commit 2026-04-07). WiLoR-mini
  (`warmshao/WiLoR-mini`, last commit 2025-06-14): "I have simplified WiLoR, focusing on the inference process. Now it
  can be installed via pip and used directly, and it will automatically download the model."
- **How a program calls it.** WiLoR: `python demo.py --img_folder demo_img --out_folder demo_out --save_mesh --fast`,
  weights from `https://huggingface.co/spaces/rolpotamias/WiLoR/resolve/main/pretrained_models/detector.pt` and
  `.../wilor_final.ckpt`, plus `MANO_RIGHT.pkl` from the MANO site (README). WiLoR-mini:
  `pip install git+https://github.com/warmshao/WiLoR-mini`, then
  `pipe = WiLorHandPose3dEstimationPipeline(device=device, dtype=dtype); outputs = pipe.predict(image)` with an RGB
  numpy image; the README's example picks `torch.device("cpu")` when CUDA is absent and uses `dtype = torch.float16`.
  A hosted demo exists as a Hugging Face Space (`rolpotamias/WiLoR`).
- **Output (WiLoR-mini `predict`, from `wilor_hand_pose3d_estimation_pipeline.py` at HEAD).** A list with one dict per
  detected hand: `hand_bbox` (x1, y1, x2, y2 pixels), `is_right` (the detector's class: right or left), and
  `wilor_preds` holding the model outputs including `pred_cam`, `pred_keypoints_3d`, `pred_vertices`,
  `pred_cam_t_full`, `scaled_focal_length` and `pred_keypoints_2d` (3D joints projected to image pixels). For a left hand
  (`if right == 0:`) the code negates the x of `pred_keypoints_3d` and `pred_vertices` and adjusts `global_orient`
  (verify: and `hand_pose`). (verify, added) The class also has `predict_with_bboxes(self, image, bboxes, is_rights,
  **kwargs)`, which skips the detector and uses given boxes and handedness (default `rescale_factor` 2.5), a way for a
  re-run to force chosen hand boxes. The pipeline's docstring notes "focal_length: you will
  need to scale the actual focal length by 256/max_image_side_length"; default `FOCAL_LENGTH` 5000. The detector's
  results are read as Ultralytics boxes (`det.boxes.data`, `det.boxes.cls`); the WiLoR README says the repository
  "depends also on [Ultralytics library]".
- **LICENSE FACTS.**
  - a/b. WiLoR README "License": "WiLoR models fall under the [CC-BY-NC--ND License](./license.txt). This repository
    depends also on [Ultralytics library](https://github.com/ultralytics/ultralytics) and [MANO
    Model](https://mano.is.tue.mpg.de/license.html), which are fall under their own licenses. By using this
    repository, you must also comply with the terms of these external licenses." The repository's `license.txt` is
    the "Attribution-NonCommercial-NoDerivatives 4.0 International" Creative Commons text (read from the clone,
    https://raw.githubusercontent.com/rolpotamias/WiLoR/main/license.txt, 2026-11-10). Conflicting source: the Hugging
    Face model repository `rolpotamias/WiLoR` is tagged `license:cc-by-nc-4.0` (HF API, read 2026-11-10; verify: it
    also lists `detector_medium_v2.pt` and `detector_small.pt`, last modified 2025-11-23). (verify) trials.md (WiLoR
    section): loading `detector.pt` with Ultralytics `YOLO('detector.pt')` stopped with `ModuleNotFoundError: No module
    named 'dill'` (the checkpoint is a pickle that needs `dill`).
  - WiLoR-mini: no license file found in the repository root at HEAD (files: `.gitignore`, `README.md`, `assets`,
    `requirements.txt`, `setup.py`, `tests`, `wilor_mini`) on 2026-11-10; its HF repository `warmshao/WiLoR-mini`
    carries no license tag and hosts `MANO_RIGHT.pkl`, `detector.pt`, `wilor_final.ckpt` and `wilor_vit.onnx`.
  - c. Training data: the WHIM dataset (annotations on Google Drive and `huggingface.co/datasets/rolpotamias/WHIM`;
    "To download the corresponding images you need to first download the YouTube videos and extract the specific
    frames", `whim/Dataset_instructions.md`). (verify, added) The WHIM dataset card's front matter reads "license:
    cc-by-nc-nd-4.0" (https://huggingface.co/datasets/rolpotamias/WHIM/raw/main/README.md, read 2026-11-10). Other
    training sets not read (UNVERIFIED).

## Hamba (3D hand mesh, graph-guided Mamba)

- **What and who.** "Hamba: Single-view 3D Hand Reconstruction with Graph-guided Bi-Scanning Mamba", arXiv 2407.09646
  (v1 12 Jul 2024, v2 26 Nov 2024, "NeurIPS 2024"); code `humansensinglab/Hamba` (last commit 2026-02-01). README:
  "**Mar. 31, 2025**: We released the Hamba Inference Codes and Weights."
- **How a program calls it.** Install like HaMeR (README sample "for CUDA 11.7"), then "dependencies for [State Space
  Model](https://github.com/state-spaces/mamba) and [VMamba](https://github.com/MzeroMiko/VMamba) repositories":
  `git clone https://github.com/state-spaces/mamba`, `pip install causal-conv1d>=1.4.0`, and in a VMamba clone
  `cd kernels/selective_scan && pip install .`; plus `MANO_RIGHT.pkl` and weights from a Google Drive link; demo
  `python demo.py --checkpoint ckpts/hamba/checkpoints/hamba.ckpt --img_folder example_data --out_folder
  ./demo_out/example_data/ --full_frame` (README). CPU is not mentioned (UNVERIFIED).
- **Author measurements.** Abstract: "achieving the PA-MPVPE of 5.3mm and F@15mm of 0.992 on FreiHAND".
- **LICENSE FACTS.** `LICENSE` is the "Attribution-NonCommercial 4.0 International" text; README: "This work is
  licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc]. Permission is
  granted for non-commercial research. For commerical use, please reachout to our Lab." (read 2026-11-10). Requires
  MANO.

## HaWoR (world-space hand motion from egocentric video)

- **What and who.** "HaWoR: World-Space Hand Motion Reconstruction from Egocentric Videos", arXiv 2501.02973 (6 Jan
  2025); code `ThunderVVV/HaWoR` (last commit 2026-04-16). Video in, per-frame MANO hands in world coordinates, with a
  SLAM camera trajectory and a "motion infiller network that effectively completes the missing frames" (abstract).
- **How a program calls it.** `python demo.py --video_path ./example/video_0.mp4 --vis_mode world` (or `cam`);
  weights from `huggingface.co/ThunderVVV/HaWoR` plus WiLoR's `detector.pt`, DROID-SLAM and Metric3D weights, and
  both MANO hands (README). Tested "with PyTorch 1.13 and CUDA 11.7" (README). (verify) The README links the
  DROID-SLAM (`droid.pth`) and Metric3D (`metric_depth_vit_large_800k.pth`) weights on Google Drive; the HF repo
  also lists `external/droid.pth` and `external/metric_depth_vit_large_800k.pth`. MANO paths:
  `_DATA/data/mano/MANO_RIGHT.pkl` and `_DATA/data_left/mano_left/MANO_LEFT.pkl`.
- **LICENSE FACTS.** `license.txt` is the "Attribution-NonCommercial-NoDerivatives 4.0 International" text (read
  from the clone 2026-11-10). (verify, added) README: "HaWoR models fall under the [CC-BY-NC--ND License](./license.txt).
  This repository depends also on [MANO Model](https://mano.is.tue.mpg.de/license.html), which are fall under their own
  licenses." HF repo `ThunderVVV/HaWoR` has no license tag. Requires MANO.

## FAH, "Fast and Accurate Hand Estimation" (added by verify, 2026 release)

- **What and who.** `noahcao/FAH` (README read 2026-11-10 at https://raw.githubusercontent.com/noahcao/FAH/main/README.md;
  paper link https://arxiv.org/pdf/2611.07711, not opened). Last commit 2026-11-07, subject "feat: FAH initial
  release". README: "FAH predicts 2D and 3D hand joints and surface points, then fits MANO, MHR-Hand or both." and
  "Optional heads add part labels and object-contact probabilities. Video mode refines tracks; world mode adds camera
  estimation." For video: "call `model.reset()` before each clip and process frames in order."
- **Runs on.** README: "On CPU or Apple silicon, omit the CUDA PyTorch command and install with `pip install -e .`."
  Author speed claims are on a GPU: "FAH-L reaches **4.31 mm HOT3D PA-MPJPE at 65 fps** with mesh fitting on an RTX
  4070 Ti SUPER." Not run here.
- **MANO.** Optional: "**MANO:** register and download from [mano.is.tue.mpg.de](https://mano.is.tue.mpg.de), then
  convert" (README); MHR-Hand is the other fitter.
- **LICENSE FACTS.** Code: `LICENSE` is the Apache License 2.0 text; README: "**Code:** [Apache 2.0](LICENSE), except
  upstream files identified in [NOTICE](NOTICE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)." Weights: README
  "**All FAH weights, including the detector, fitted data and exported models:** [WEIGHTS_LICENSE](WEIGHTS_LICENSE),
  for research and non-commercial use." `WEIGHTS_LICENSE` (https://raw.githubusercontent.com/noahcao/FAH/main/WEIGHTS_LICENSE,
  read 2026-11-10), Part 3: "In addition to the applicable upstream terms, the FAH Weights may be used, reproduced,
  modified and distributed for research and other non-commercial purposes only." Part 1 passes through the SAM License
  because "The pose models derive from SAM 3D Body (Meta Platforms, Inc.)". Part 3 lists the training sources it calls
  non-commercial, among them MANO, ARCTIC, "the HOT3D hand annotations (CC BY-NC-SA 4.0), DexYCB (CC BY-NC 4.0),
  InterHand2.6M (CC BY-NC 4.0)" and "WiLoR (CC BY-NC-ND 4.0): its outputs are distillation targets of the pose
  models." HF `noahcao/FAH`: not gated, `license:other` (`fah-weights-license`), last modified 2026-11-04.

## EgoHand v1 (NVIDIA; added by verify, 2026 release)

- **What and who.** arXiv 2610.30293, "EgoHand: Monocular 3D Hand Reconstruction from Egocentric Video" (v1 21 Oct
  2026, v2 26 Oct 2026; read 2026-11-10 at https://export.arxiv.org/abs/2610.30293). Abstract: "The model adopts
  SOMA-Hand as its parametric representation and processes 2D hand crops with a transformer encoder" and "We release
  the EgoHand model and source code under the OpenMDW license, allowing free commercial use of the model." Code: the
  folder `src/python/isaaccapture_egopost` of `NVIDIA/IsaacCapture` (README read 2026-11-10 at
  https://raw.githubusercontent.com/NVIDIA/IsaacCapture/main/src/python/isaaccapture_egopost/README.md): "**[2026-10-21]**
  🚀 **EgoHand v1** is released for monocular 3D hand pose estimation using the [SOMA-Hand representation]". Weights:
  HF `nvidia/EgoHand-v1` (file `egohand_s060000.ckpt`; not gated; `license:openmdw-1.1`; last modified 2026-10-27).
- **Runs on.** README "System requirements" table: "GPU | NVIDIA RTX 6000 Ada, L40, L20, or RTX PRO 6000 Blackwell",
  "Memory | 32 GB", "Storage | 25 GB", "OS | Ubuntu 24.04". CPU not stated. Not run here.
- **LICENSE FACTS.** README header: "SPDX-License-Identifier: LicenseRef-OpenMDW-1.1". The license file
  (https://raw.githubusercontent.com/NVIDIA/IsaacCapture/main/LICENSES/LicenseRef-OpenMDW-1.1.txt, read 2026-11-10):
  "Subject to your compliance with this agreement, permission is hereby granted, free of charge, to deal in the Model
  Materials without restriction, including under all copyright, patent, database, and trade secret rights included or
  embodied therein." and "If you distribute any portion of the Model Materials, you shall retain in your distribution
  (1) a copy of this agreement, and (2) all copyright notices and other notices of origin included in the Model
  Materials that are applicable to your distribution." The repository root has no `LICENSE` file
  (https://raw.githubusercontent.com/NVIDIA/IsaacCapture/main/LICENSE answered HTTP 404). Training data licenses were
  not read (UNVERIFIED).

---

## Segment Anything 2 (SAM 2 / SAM 2.1), Segment Anything 3 (SAM 3 / SAM 3.1) and SAM 3D Body (Meta)

- **What and who.** Meta AI's promptable segmentation models. SAM 2 (`facebookresearch/sam2`, last commit 2024-12-15):
  "a foundation model towards solving promptable visual segmentation in images and videos" (README). SAM 3
  (`facebookresearch/sam3`, last commit 2026-10-23): "a unified foundation model for promptable segmentation in images
  and videos. It can detect, segment, and track objects using text or visual prompts such as points, boxes, and masks."
  and "SAM 3 introduces the ability to exhaustively segment all instances of an open-vocabulary concept specified by a
  short text phrase or exemplars" (README). SAM 3.1 release notes
  (`RELEASE_SAM3p1.md`): "## SAM 3.1 — March 27, 2026", "SAM 3.1 introduces **Object Multiplex**, a shared-memory
  approach for joint multi-object tracking". SAM 3D Body (`facebookresearch/sam-3d-body`, last commit 2026-02-19;
  README "**11/19/2025** -- Checkpoints Launched, Dataset Released, Web Demo and Paper are out!") is "a promptable model for
  single-image full-body 3D human mesh recovery (HMR)" that "estimates the human pose of the body, feet, and hand"
  and "supports auxiliary prompts, including 2D keypoints and masks" (README).
- **Versions.** SAM 2.1 checkpoints `sam2.1_hiera_tiny|small|base_plus|large.pt` at
  `https://dl.fbaipublicfiles.com/segment_anything_2/092824/` (README, "09/30/2024 -- SAM 2.1 Developer Suite").
  PyPI: `sam3` 0.1.4 (2026-05-26, author "Meta AI Research", homepage github.com/facebookresearch/sam3). PyPI `sam2`
  1.1.0 (2024-12-21) is published by a third party (author "Jorge Insua", homepage
  github.com/JinsuaFeito-dev/segment-anything-2); Meta's README installs from the repository (`pip install -e .`).
- **How a program calls it (SAM 2).** `predictor = build_sam2_video_predictor(model_cfg, checkpoint)`; then
  `predictor.add_new_points_or_box(state, <your_prompts>)` returns `frame_idx, object_ids, masks`, and
  `for frame_idx, object_ids, masks in predictor.propagate_in_video(state):` gives the per-frame masks of each prompted
  object (README). Image: `SAM2ImagePredictor(build_sam2(model_cfg, checkpoint))`, `masks, _, _ =
  predictor.predict(<input_prompts>)`. The README's prompt call takes points or a box (`add_new_points_or_box`); the README shows no text prompt.
  Requirements: "The code requires `python>=3.10`, as well as `torch>=2.5.1` and `torchvision>=0.20.1`"; the optional
  CUDA extension can fail to build: "you can ignore it and still use SAM 2 (some post-processing functionality may be
  limited, but it doesn't affect the results" (README). CPU is not stated (UNVERIFIED).
- **How a program calls it (SAM 3).** `model = build_sam3_image_model(); processor = Sam3Processor(model);
  inference_state = processor.set_image(image); output = processor.set_text_prompt(state=inference_state,
  prompt="<YOUR_TEXT_PROMPT>"); masks, boxes, scores = output["masks"], output["boxes"], output["scores"]`. Video:
  `build_sam3_video_predictor()`, `handle_request(request=dict(type="start_session", resource_path=video_path))`
  ("a JPEG folder or an MP4 video file"), then `type="add_prompt"` with `frame_index` and `text` (README). Listed
  prerequisites: "Python 3.12 or higher", "PyTorch 2.7 or higher", "CUDA-compatible GPU with CUDA 12.6 or higher".
  Checkpoints are gated: "Before using SAM 3, please request access to the checkpoints on the SAM 3 Hugging Face
  [repo](https://huggingface.co/facebook/sam3). Once accepted, you need to be authenticated to download the
  checkpoints." HF API (read 2026-11-10): `facebook/sam3` and `facebook/sam3.1` are `gated: manual`, tagged
  `license:other`; `facebook/sam-3d-body-dinov3` is `gated: manual`, `license:other` (verify: so is
  `facebook/sam-3d-body-vith`).
- **Output.** SAM 2: `masks` per `object_ids` per `frame_idx` (README loop). SAM 3 image: `output["masks"]`,
  `output["boxes"]`, `output["scores"]` for a text prompt; SAM 3 video: `response["outputs"]` (fields not read:
  UNVERIFIED). Neither README shows keypoint output. A text prompt such as "guitar neck" or "capo" is the kind of hint a re-run can take (SAM 3), and
  user clicks or boxes (SAM 2).
- **Author measurements.** SAM 2.1 README table: `sam2.1_hiera_tiny` "Size (M) 38.9", "Speed (FPS) 91.2", "SA-V test
  (J&F) 76.5"; `sam2.1_hiera_small` 46 M, 84.8 FPS, 76.6. README: "Speed measured on an A100 with `torch 2.5.1, cuda
  12.4`." SAM 3.1: "**~7x speedup** at 128 objects on a single H100 GPU
  compared to the SAM 3 November 2025 release".
- **LICENSE FACTS.**
  - SAM 2 code and weights. README "License": "The SAM 2 model checkpoints, SAM 2 demo code (front-end and back-end),
    and SAM 2 training code are licensed under [Apache 2.0](./LICENSE), however the [Inter Font] and [Noto Color
    Emoji] used in the SAM 2 demo code are made available under the [SIL Open Font License, version 1.1]". `LICENSE` is
    the Apache License 2.0 text. Third-party (verify: re-quoted with its links): "we use a GPU-based connected component
    algorithm adapted from [`cc_torch`](https://github.com/zsef123/Connected_components_PyTorch) (with its license in
    [`LICENSE_cctorch`](./LICENSE_cctorch)) as an optional". HF `facebook/sam2.1-hiera-large` and `-tiny` tagged `license:apache-2.0`. All
    read 2026-11-10 (https://raw.githubusercontent.com/facebookresearch/sam2/main/README.md and `LICENSE`, via clone).
  - SAM 2 training data (SA-V). https://ai.meta.com/datasets/segment-anything-video/ (verify: re-fetched as HTML with
    curl on 2026-11-10 and all three quotes below found verbatim in the page text): License "CC BY 4.0"; "It is intended to be used for computer
    vision research for the purposes permitted under the CC by 4.0 license." "SA-V consists of 51K diverse videos and
    643K spatio-temporal segmentation masks".
  - SAM 3 and SAM 3.1 (code and weights). `LICENSE` at HEAD (https://raw.githubusercontent.com/facebookresearch/sam3/main/LICENSE,
    read from the clone 2026-11-10): "SAM License Last Updated: November 19, 2025". "“SAM Materials” means,
    collectively, Documentation and the models, software and algorithms, including machine-learning model code,
    trained model weights, inference-enabling code, training-enabling code, fine-tuning enabling code, and other
    elements of the foregoing distributed by Meta". "a. Grant of Rights. You are granted a non-exclusive, worldwide,
    non-transferable and royalty-free limited license under Meta’s intellectual property or other rights owned by Meta
    embodied in the SAM Materials to use, reproduce, distribute, copy, create derivative works of, and make
    modifications to the SAM Materials." "i. Distribution of SAM Materials, and any derivative works thereof, are
    subject to the terms of this Agreement. If you distribute or make the SAM Materials, or any derivative works
    thereof, available to a third party, you may only do so under the terms of this Agreement and you shall provide a
    copy of this Agreement with any such SAM Materials." "v. ... You agree not to use, or permit others to use, SAM
    Materials for any activities subject to the International Traffic in Arms Regulations (ITAR) or end uses
    prohibited by Trade Controls, including those related to military or warfare purposes, nuclear industries or
    applications, espionage, or the development or use of guns or illegal weapons." "a. Subject to Meta’s ownership
    of SAM Materials and derivatives made by or for Meta, with respect to any derivative works and modifications of
    the SAM Materials that are made by you, as between you and Meta, you are and will be the owner of such derivative
    works and modifications." The license text contains no clause that names commercial use either way (searched for
    "commercial" on 2026-11-10: no match). PyPI `sam3` license metadata begins "SAM License Last Updated: November 19,
    2025". (verify, added) Conflicting metadata: the same PyPI release (0.1.4) also carries the classifier "License ::
    OSI Approved :: MIT License" (https://pypi.org/pypi/sam3/json, read 2026-11-10).
  - SAM 3D Body: the same "SAM License" text plus one added clause: "i. Grant of Patent License. Subject to the terms
    and conditions of this License, you are granted a perpetual, worldwide, non-exclusive, no-charge, royalty-free,
    irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell,
    import, and otherwise transfer the Work ..." (word-level diff of the two `LICENSE` files, 2026-11-10).
  - SAM 1 (`facebookresearch/segment-anything`): `LICENSE` Apache License 2.0 (first lines, read from clone).

---

## Open-vocabulary detectors (text-prompted boxes for "guitar neck", "fretboard", "capo", "hand")

### Grounding DINO (IDEA Research)

- **What, versions.** Paper "Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection"
  (arXiv 2303.05499). Code `IDEA-Research/GroundingDINO`, last commit 2024-08-12 (subject "Grounded SAM 2 Release");
  PyPI `groundingdino-py` 0.4.0 (2023-05-23). Also in Hugging Face `transformers` (PyPI 5.22.2, 2026-11-06) as
  `IDEA-Research/grounding-dino-tiny|base` (HF `license:apache-2.0`, last modified 2024-05-12).
- **How a program calls it.** README Python block: `model = load_model("groundingdino/config/GroundingDINO_SwinT_OGC.py",
  "weights/groundingdino_swint_ogc.pth")`, `TEXT_PROMPT = "chair . person . dog ."`, `BOX_TRESHOLD = 0.35`,
  `TEXT_TRESHOLD = 0.25` (README spelling), `boxes, logits, phrases = predict(model=model, image=image,
  caption=TEXT_PROMPT, box_threshold=BOX_TRESHOLD, text_threshold=TEXT_TRESHOLD)` (verify: re-quoted; the earlier
  version substituted the values into the call). README: "Support
  CPU-only mode. Now the model can run on machines without GPUs." and a `--cpu-only` flag in the demo command.
- **Output.** `boxes`, `logits` (scores), `phrases`. (verify: format read from source, resolving the earlier
  UNVERIFIED) In `groundingdino/util/inference.py` at HEAD, `predict` returns the model's `pred_boxes` filtered by the
  thresholds, and `annotate` turns them into pixels with `boxes = boxes * torch.Tensor([w, h, w, h])` and
  `box_convert(boxes=boxes, in_fmt="cxcywh", out_fmt="xyxy")`: the returned boxes are normalized (center x, center y,
  width, height). No masks; Grounded-SAM-2 (`IDEA-Research/Grounded-SAM-2`, Apache-2.0, last commit 2025-11-11) ships
  scripts that pass these boxes to SAM 2 (Handoff fact 4).
- **Author measurements.** README: "COCO zero-shot **52.5 AP** (training without COCO data!). COCO fine-tune **63.0
  AP**." The released SwinT-OGC checkpoint's pre-training data column reads "O365,GoldG,Cap4M" (README table).
- **LICENSE FACTS.** a. Code: `LICENSE` Apache License 2.0 (read from clone 2026-11-10;
  https://raw.githubusercontent.com/IDEA-Research/GroundingDINO/main/LICENSE). b. Weights: GitHub release
  `v0.1.0-alpha/groundingdino_swint_ogc.pth` and HF `ShilongLiu/GroundingDINO` (HF tag `license:apache-2.0`). c.
  Training data "O365,GoldG,Cap4M": licenses not read (UNVERIFIED).

### OWLv2 (Google)

- **What, versions.** "Scaling Open-Vocabulary Object Detection" (Minderer, Gritsenko, Houlsby, 2023, arXiv
  2306.09683, per the model card's BibTeX). Code in `google-research/scenic` (JAX; last commit 2026-10-31); also in
  `transformers` as `Owlv2ForObjectDetection` with `google/owlv2-base-patch16-ensemble` and
  `google/owlv2-large-patch14-ensemble` (HF `license:apache-2.0`, last modified 2024-10-31).
- **How a program calls it.** Model card (https://huggingface.co/google/owlv2-base-patch16-ensemble, read 2026-11-10):
  `processor = Owlv2Processor.from_pretrained(...)`, `model = Owlv2ForObjectDetection.from_pretrained(...)`,
  `results = processor.post_process_object_detection(outputs=outputs, target_sizes=target_sizes, threshold=0.1)`,
  then `boxes, scores, labels = results[i]["boxes"], results[i]["scores"], results[i]["labels"]`. The card's comment:
  "Convert outputs (bounding boxes and class logits) to Pascal VOC Format (xmin, ymin, xmax, ymax)". Queries are
  free-text strings. (verify) A different output format was observed in the trial: the public Space `merve/owlv2`
  called with `gradio_client` returns an `AnnotatedImage` whose annotations are mask images with a label and no score
  field (trials.md, OWLv2 section, run r0193); the format above is the `transformers` API from the model card.
- **Card statements.** "The model is intended as a research output for research communities." Data: "The CLIP
  backbone of the model was trained on publicly available image-caption data. This was done through a combination of
  crawling a handful of websites and using commonly-used pre-existing image datasets such as [YFCC100M]." "The
  prediction heads of OWL-ViT, along with the CLIP backbone, are fine-tuned on publicly available object detection
  datasets such as [COCO] and [OpenImages]." followed by "(to be updated for v2)".
- **LICENSE FACTS.** Code: scenic `LICENSE` Apache License 2.0 (clone, 2026-11-10). Weights: model card front matter
  "license: apache-2.0". Training data licenses: not stated on the card beyond the lines quoted.

### YOLO-World (AILab-CVC) and YOLOE (THU-MIG)

- **What, versions.** YOLO-World: `AILab-CVC/YOLO-World`, last commit 2025-02-27; README: "`[2025-2-8]:` We release a
  new YOLO-World-V2.1, which includes new pre-trained weights and training code for image prompts" and "YOLO-World
  presents a *prompt-then-detect* paradigm for efficient user-vocabulary inference". YOLOE: `THU-MIG/yoloe`, last
  commit 2025-06-26, built on the Ultralytics code base (its repo contains an `ultralytics` folder). Both are also
  shipped inside the Ultralytics package: `YOLOWorld("yolov8s-worldv2.pt")` then `model.set_classes(["person",
  "bus"])` (https://docs.ultralytics.com/models/yolo-world/, read 2026-11-10); the YOLO-World page says "For
  open-vocabulary work that also needs instance masks, visual prompts, or a prompt-free mode, see YOLOE, which keeps
  the same set_classes() API."
- (verify, added) **YOLOE-26 in Ultralytics.** The YOLOE docs page (https://docs.ultralytics.com/models/yoloe/, read
  2026-11-10): `model = YOLOE("yoloe-26s-seg.pt")`, `model.set_classes(["double-decker bus", "person"])`; "YOLOE-26
  returns boxes and instance segmentation masks for categories it was never trained on." and "The first set_classes()
  call installs ultralytics/CLIP from GitHub with pip (it provides the tokenizer) and downloads a TorchScript text
  encoder into the current working directory. YOLOE-26 pulls mobileclip2_b.ts, about 254 MB". In the source
  (`ultralytics/nn/text_model.py` at HEAD) the `mobileclip2` variant returns `MobileCLIPTS(device,
  weight="mobileclip2_b.ts")`, fetched with `attempt_download_asset` (Ultralytics' `ultralytics/assets` releases). The
  trial downloaded that file (253,794,476 bytes, trials.md). Paper: arXiv 2602.00168, "YOLOE-26: Integrating YOLO26
  with YOLOE for Real-Time Open-Vocabulary Instance Segmentation" (Ranjan Sapkota, Manoj Karkee; v1 29 Jan 2026).
- **Output.** Ultralytics `Results` (boxes with `xyxy`, `conf`, `cls`; masks for YOLOE-seg), as in the Ultralytics
  section.
- **LICENSE FACTS.** YOLO-World `LICENSE`: "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007" (clone, 2026-11-10);
  README badge "License-GPLv3.0" and "For business licensing and other related inquiries, don't hesitate to contact"
  a Tencent address. YOLOE `LICENSE`: "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007" (clone,
  2026-11-10). The copies inside the Ultralytics package are part of that AGPL-3.0 package (Ultralytics section; an
  Ultralytics staff reply on the YOLOE docs page: "For production use you’ll need to
  choose between AGPL-3.0 compliance (open‑source your entire derivative) or an Enterprise License for proprietary
  deployment").
- (verify, added: a weights license the survey had missed) **Text encoder used by YOLOE-26 prompts.** The upstream
  model, Apple's MobileCLIP2-B on Hugging Face (`apple/MobileCLIP2-B`, tag `license:apple-amlr`, read 2026-11-10), ships
  this `LICENSE` (https://huggingface.co/apple/MobileCLIP2-B/raw/main/LICENSE): "Apple hereby grants you a personal,
  non-exclusive, worldwide, non-transferable, royalty-free, revocable, and limited license, to use, copy, modify,
  distribute, and create Model Derivatives (defined below) of the Apple Machine Learning Research Model exclusively for
  Research Purposes." and "“Research Purposes” does not include any commercial exploitation, product development or use
  in any commercial product or service." The `mobileclip2_b.ts` file that Ultralytics downloads is its own TorchScript
  export; no license statement for that file was found in the Ultralytics pages read (UNVERIFIED which terms Ultralytics
  applies to it). YOLO-World in Ultralytics uses the OpenAI CLIP "ViT-B/32" text encoder instead (trials.md, Grounding
  DINO / OWLv2 / YOLO-World section); its license was not read (UNVERIFIED).

---

## OpenCV (classical fret, string and neck geometry)

- **What, versions.** `opencv/opencv`, last commit 2026-11-10; the default branch's `version.hpp` reads
  `CV_VERSION_MAJOR 5`, `CV_VERSION_MINOR 2`, `CV_VERSION_STATUS "-dev"`. PyPI `opencv-python` and
  `opencv-contrib-python` 5.0.0.93 (2026-07-02). Browser: npm `@techstark/opencv-js` 5.0.0-release.1 (Apache-2.0
  metadata; a third-party packaging of OpenCV.js, not read further) and the older `opencv.js` 1.2.1 (verify: npm
  publish time of 1.2.1 is 2017-11-01, package metadata last modified 2022-05-12; npm license field "BSD-3-Clause").
  docs.opencv.org answered with a Cloudflare "Just a moment..." challenge page to a scripted fetch on 2026-11-10,
  so the function facts below come from the source headers and from the docstrings of the installed package.
- **Functions relevant to fret, string and neck geometry (all present in `cv2` 5.0.0, checked with `hasattr` in the try
  agent's `venv-rtmlib` on 2026-11-10):** `Canny`, `HoughLines`, `HoughLinesP`, `createLineSegmentDetector`,
  `findHomography`, `getPerspectiveTransform`, `warpPerspective`, `calcOpticalFlowPyrLK`, and the contrib module
  `ximgproc`.
  - `HoughLinesP(image, rho, theta, threshold[, lines[, minLineLength[, maxLineGap]]]) -> lines` (docstring);
    header `modules/imgproc/include/opencv2/imgproc.hpp`: "@brief Finds line segments in a binary image using the
    probabilistic Hough transform." "@param image 8-bit, single-channel binary source image." "@param lines Output
    vector of lines. Each line is represented by a 4-element vector" (x1, y1, x2, y2 in pixels). (verify) Observed in the
    trial: "in OpenCV 5 `HoughLinesP` returns an array of shape (N, 4), not (N, 1, 4) as in 4.x" (trials.md, OpenCV
    section, run r0149).
  - `findHomography(srcPoints, dstPoints[, method[, ransacReprojThreshold[, mask[, maxIters[, confidence]]]]]) ->
    retval, mask` (docstring): "@brief Finds a perspective transformation between two planes." The returned 3x3
    matrix maps points of one plane to the other, so point pairs found on the neck (for example nut and fret ends)
    matched to a fretboard template give a mapping from image pixels to fretboard coordinates; `warpPerspective`
    applies such a matrix to the whole frame.
  - (verify, added) `perspectiveTransform(src, m[, dst]) -> dst` (docstring) maps point arrays through such a matrix. In
    cv2 5.0.0 it accepts points shaped (N, 1, 2) or (1, N, 2) and raises "(-215:Assertion failed) scn + 1 == m.cols"
    for a plain (N, 2) array (float32 and float64 alike; `scripts/verify_perspective_shapes.py`, run 2026-11-10 in the
    lane's `venv-rtmlib`). The trial's handoff used (N, 1, 2) float points (trials.md, runs r0172 and r0218).
- **Input / output.** Images as numpy arrays (Python) or `cv.Mat` (JS); outputs are numpy arrays of line segments,
  matrices and point tracks. No learned model, no training data.
- **LICENSE FACTS.** `LICENSE` at HEAD of the default branch (metadata clone of https://github.com/opencv/opencv,
  read 2026-11-10): "Apache License Version 2.0, January 2004". `COPYRIGHT` lists holders from "Copyright (C) 2000-2022, Intel Corporation, all rights reserved." to
  "Copyright (C) 2019-2022, Shenzhen Institute of Artificial Intelligence and Robotics for Society, all rights
  reserved." PyPI metadata for `opencv-python`: "Apache 2.0". (The contrib modules in `opencv-contrib-python` were not
  checked for per-module licenses: UNVERIFIED.)

---

## Point trackers (follow fret ends, the nut, inlays or fingertips through a video)

### CoTracker / CoTracker3 (Meta)

- **What, versions.** `facebookresearch/co-tracker`, last commit 2025-01-21 ("release kubric dataset used for
  cotracker3 training"). Papers arXiv 2307.07635 and 2410.11831 (README links). README: "[October 15, 2024] 📣 We're
  releasing CoTracker3!" Not on PyPI; loaded through `torch.hub`.
- **How a program calls it.** `cotracker = torch.hub.load("facebookresearch/co-tracker", "cotracker3_offline").to(device)`;
  `pred_tracks, pred_visibility = cotracker(video, grid_size=grid_size) # B T N 2,  B T N 1` (README). Online mode:
  `torch.hub.load(..., "cotracker3_online")`, first call with `is_first_step=True`, then per chunk; "Online processing
  is more memory-efficient and allows for the processing of longer videos." The README examples use
  `grid_size`. (verify, resolves the earlier UNVERIFIED) Other query forms, from the `forward` comments in
  `cotracker/predictor.py` at HEAD (the class `torch.hub` returns for `cotracker3_offline`, per `hubconf.py`):
  "queries. Queried points of shape (B, N, 3) in format (t, x, y) for frame index and pixel coordinates.", "grid_size.
  Grid of N*N points from the first frame. if segm_mask is provided, then computed only for the mask.", and
  `segm_mask: torch.Tensor = None,  # Segmentation mask of shape (B, 1, H, W)`. CPU: "We strongly
  recommend installing both PyTorch and TorchVision with CUDA support, although for small tasks CoTracker can be run
  on CPU."
- **Output.** `pred_tracks` "B T N 2" and `pred_visibility` "B T N 1" (README code comments: batch, frames,
  points). (verify) Unit, from `cotracker/predictor.py`: the video is resized to the model resolution and the tracks
  are scaled back with `tracks *= tracks.new_tensor([(W - 1) / (self.interp_shape[1] - 1), (H - 1) /
  (self.interp_shape[0] - 1)])` before return, i.e. x, y in pixels of the input video.
- **LICENSE FACTS.** `LICENSE.md`: "Attribution-NonCommercial 4.0 International" (clone, 2026-11-10;
  https://raw.githubusercontent.com/facebookresearch/co-tracker/main/LICENSE.md). README "License": "The majority of
  CoTracker is licensed under CC-BY-NC, however portions of the project are available under separate license terms:
  Particle Video Revisited is licensed under the MIT license, TAP-Vid and LocoTrack are licensed under the Apache 2.0
  license." Weights: HF `facebook/cotracker3` tagged `license:cc-by-nc-4.0` (HF API 2026-11-10).

### TAPIR, BootsTAPIR, TAPNext, TAPNext++ (Google DeepMind `tapnet`)

- **What, versions.** `google-deepmind/tapnet`, last commit 2026-11-02. README: "[TAPNext](https://tap-next.github.io)
  is our latest, most capable, fastest, yet simplest tracker. It formulates the TAP problem as next token prediction";
  "[TAPNext++] is an improved TAPNext checkpoint that has a 40x longer stable tracking performance, allows tracking
  through occlusions and shows strong re-detection capabilities." TAPIR: "a two-stage algorithm" (matching, then
  refinement). Checkpoints in JAX and PyTorch on `storage.googleapis.com/dm-tapnet/...` and HF `google/tapnet`
  (HF `license:apache-2.0`, last modified 2026-07-16).
- **How a program calls it.** Colab notebooks (`colabs/torch_tapnextpp_demo.ipynb`, `torch_tapir_demo.ipynb`, ...),
  or `pip install .` from the repository and a live-camera demo with the causal TAPIR checkpoint
  (`wget -P checkpoints https://storage.googleapis.com/dm-tapnet/causal_tapir_checkpoint.npy`). The README's GPU
  note concerns JAX with CUDA; CPU inference is not stated (UNVERIFIED).
- **Output.** Per-point tracks over the video (array names and units in the notebooks were not read: UNVERIFIED).
- **Author measurements (README checkpoint table, "reported under 256x256 inference resolution").** Online TAPIR:
  DAVIS First AJ 56.2%, Kinetics First 51.2%; TAPNext (TrecViT-B): DAVIS First 65.25%, DAVIS Strided 68.9%,
  Kinetics First 57.3%, RoboTAP First 64.1%; TAPNext++ (512x512): DAVIS First 67.0%, DAVIS Strided 71.2%.
- **LICENSE FACTS.** README "License and Disclaimer" (read from clone 2026-11-10): "All other software in this
  repository is licensed under the Apache License, Version 2.0 (Apache 2.0)"; "All pre-trained model checkpoints
  released in this repository and linked from this README (including TAP-Net, TAPIR, BootsTAPIR, TAPNext, TAPNext++,
  and TRAJAN weights) are also licensed under Apache 2.0."; "All other non-software materials released here for the
  TAP-Vid datasets, i.e. the TAP-Vid annotations, as well as the RGB-Stacking videos and RoboTAP videos, are released
  under a [Creative Commons BY license]". "Kinetics videos are publicly available on YouTube, but subject to their own
  individual licenses." `LICENSE`: Apache License 2.0.

### AllTracker

- **What, versions.** "AllTracker: Efficient Dense Point Tracking at High Resolution" (arXiv 2506.07310, README link);
  `aharley/alltracker`, last commit 2026-05-07 ("Add hubconf.py for torch.hub loading"). README: "AllTracker estimates
  long-range point tracks by way of estimating the flow field between a query frame and every other frame of a video."
- **How a program calls it.** `python demo.py --mp4_path ./demo_video/monkey.mp4 --query_frame 32 --conf_thr 0.01
  ...`; "The demo script will automatically download the model weights from [huggingface]" (README).
- **LICENSE FACTS.** `LICENSE`: "MIT License Copyright (c) 2025 Adam W. Harley Permission is hereby granted, free of
  charge, to any person obtaining a copy" (clone, 2026-11-10). (verify, resolves the earlier UNVERIFIED) Weights:
  `demo.py` downloads `https://huggingface.co/aharley/alltracker/resolve/main/alltracker.pth` (or `alltracker_tiny.pth`);
  HF `aharley/alltracker` is tagged `license:mit` (HF API, read 2026-11-10).
  Training: "Stage 1 is kubric alone; Stage 2 is a mix of datasets" (README).

---

## Roboflow Universe guitar datasets and models, Roboflow Inference, and Roboflow's terms

- **Universe projects found by web search (2026-11-10).** `code-and-chords/guitar-necks-detector-ogacd`,
  `code-and-chords/guitar-frets-segmenter`, `hubert-drapeau-qt6ae/guitar-necks-detector`, `soen357/fretboard`,
  `john-tappen-workspace/fret-detection`, `javiribera/guitar-fret`, `joaomarcoscrs/guitar-chords-daewp`,
  `b101/guitar-g65u6`, `guitardetection/guitar_detection-ca6i4` (all under https://universe.roboflow.com/).
  **Not read:** every one of these pages answered a scripted fetch with HTTP 403 and a Cloudflare "Just a moment..."
  challenge page, and the WebFetch tool also got "HTTP 403 Forbidden" (2026-11-10). Their license fields, class
  lists, image counts and model availability are therefore UNVERIFIED here (search-engine snippets are not cited).
  What would settle it: open each URL in a browser and copy the "License" field and class list, or call the
  Roboflow API with an API key (`roboflow` PyPI 1.7.3, 2026-10-26). (verify) The try agent found the API closed without
  a key: `https://api.roboflow.com/code-and-chords/guitar-necks-detector-ogacd` answered HTTP 401 "This method requires
  your API key." and `https://detect.roboflow.com/guitar-necks-detector-ogacd/1` answered 401 (trials.md, Roboflow
  section). The verify pass did not re-request the Universe pages (they had answered 403).
- **Roboflow Inference (`roboflow/inference`).** PyPI `inference` / `inference-cli` / `inference-sdk` 1.8.4
  (2026-10-30), repository last commit 2026-11-10. Runs models in a local Docker server:
  "`pip install inference-cli && inference server start --dev`" ("This will pull the proper image for your machine
  and start it in development mode"), served on `localhost:9001`; a client
  calls it with (verify: re-quoted, the comment was missing) `client = InferenceHTTPClient(api_url="http://localhost:9001",
  # use local inference server` / `# api_key="<YOUR API KEY>" # optional to access your private data and models` / `)`
  and `client.run_workflow(...)` (README). A CPU image is published
  (`roboflow/roboflow-inference-server-cpu`, README badge). Bundled model folders include `grounding_dino`, `owlv2`,
  `sam`, `sam2`, `sam3`, `yolo_world`, `yolo26`, `rfdetr`, `florence2` (`inference/models/` at HEAD).
- **LICENSE FACTS (Inference).** Repository `LICENSE` (clone, 2026-11-10): "LICENSE.core (Apache 2.0) applies to all
  files in this repository except for files in or under any directory that contains a superseding license file (such
  as the models located in `inference/models/` which are governed by their own individual licenses and the files and
  folders in the `inference/enterprise/` and `inference_cli/lib/enterprise/` directories which are governed by the
  Roboflow Enterprise License located at `inference/enterprise/LICENSE.txt`)." `LICENSE.core` is the Apache License
  2.0 text. Per-model `LICENSE.txt` files exist in `inference/models/<model>/` (not read individually).
- **Roboflow terms (https://roboflow.com/terms, "Last modified: May 3, 2024", read 2026-11-10).** "To the extent you
  have chosen the Public Plan, you will only use the Services for your own internal, non-commercial use, and not on
  behalf of or for the benefit of any third party ." Among rights not granted: "to the extent you have chosen the
  Public Plan, the right to resell or commercially use the Websites and Mobile Apps or its contents" and "the right
  to use data mining, web scraping, robots, spider/web crawler, offline readers, or similar data gathering and
  extraction tools." On content: "Public Projects. By submitting User Content through the Website and Mobile Apps to a
  public project or in connection with a Public Plan, you hereby do and shall grant Company a worldwide,
  non-exclusive, perpetual, royalty-free, fully paid, sublicensable and transferable license to use, edit, modify,
  ... and otherwise fully exploit the User Content".
- **Roboflow pricing (https://roboflow.com/pricing, read 2026-11-10; verify: re-read with curl on 2026-11-10 at
  21:27 UTC, every figure below found on the page; the terms page still shows "Last modified: May 3, 2024").**
  "Free Tier $0", "10 credits included a
  month", "Enough to train ~30 models or run 80,000 inferences"; "Core $39per month, billed monthly" (+10 credits;
  larger packs up to "$1,399 a month, 500 credits in total"); Enterprise "Custom Pricing". Hosted inference rates in
  credits, e.g. "YOLO26 Nano 0.000125 credits" per image ("8,000" images per credit) and "SAM 3 0.000500 credits" per
  image. "Every Core plan, including the $0 Free Tier, keeps projects private unless you publish them to Roboflow
  Universe." The Enterprise add-on list includes "Self-hosted model weights commercial licensing". Research plan:
  "Students and researchers with an academic email can apply for the Research plan for non-commercial work. Projects
  on the Research plan are public on Roboflow Universe."

---

## Research on guitar fingering and tablature from video, 2006-2026 (what was read today, and code status)

Each entry: what the source itself says, and whether code or weights are linked from the pages read.

- **Burns and Wanderley, "Visual Methods for the Retrieval of Guitarist Fingering", NIME 2006**
  (https://idmil.org/wp-content/uploads/2022/06/NIME06_Burns.pdf, read 2026-11-10). Abstract: "This article presents
  a method to visually detect and recognize fingering gestures of the left hand of a guitarist." Body: a camera on a
  "guitar mount"; "the circular Hough transform was chosen to perform finger-tracking"; "The second study examined
  the use of the linear Hough transform for string and fret detection". No code link in the text read.
- **Paleari, Huet, Schutz, Slock, "A Multimodal Approach to Music Transcription", ICIP 2008 MIR workshop**
  (https://www.eurecom.fr/publication/2491/download/mm-palema-081012.pdf, read 2026-11-10). Four modules: "a system
  which tracks the position of the fretboard on a video stream, a system which automatically detects the position of
  the guitar on the first fret to initialize the first system, a system which detects the position of the hand on the
  guitar, and finally a system which fuses the visual and audio information to extract a tablature." "Results show
  that this kind of multimodal approach can easily disambiguate 89% of notes in a deterministic way." A companion
  "Audio-visual guitar transcription" (Jamboree 2008, CEUR, 2008-07-25) is listed at https://www.eurecom.fr/en/node/4905240.
  No code link found.
- **Goldstein and Moses, "Guitar Music Transcription from Silent Video", BMVC 2018**
  (https://bmva-archive.org.uk/bmvc/2018/contents/papers/0978.pdf, read 2026-11-10). "the string vibrations are
  recovered from silent video captured by a commercial camera mounted on the instrument. These vibrations are also
  used to detect the string locations in the video." Data: "videos captured by a camera (GoPro HERO3+ with 240 FPS in
  WVGA resolution) mounted to the guitar. Four tuned guitars were used; classical, electric, electric bass and
  acoustic." Result with ground-truth note intervals: "Overall, 66% of the notes’ pitches were detected correctly: 86%
  for the bass guitar, and an average of 58% for the others." "The algorithm was implemented in Matlab". Reference
  [3] (verify: re-quoted with the paper's own spelling): "Guitar Music Transcription from Silent Video: porject [sic]
  website, including data, code, and supplemental material. https://shirgoldstein.wixsite.com/shirg/nt-from-silent-video".
  (verify, resolves the earlier UNVERIFIED) The site, opened 2026-11-10, has "Code" and "Data" links. The code page
  (https://shirgoldstein.wixsite.com/shirg/copy-of-nt-from-silent-video) reads "Code will be available soon." The data
  page (https://shirgoldstein.wixsite.com/shirg/data) lists clips per guitar (classic, bass, acoustic, electric) and
  string, as 61 Dropbox links: 59 `.MP4` files and a `getGroundTruth.m`. One link probed with `curl -I`
  (`getGroundTruth.m`) answered HTTP 302 to a `dropbox.com/scl/fi/...` address (not downloaded). No license text
  appears on the data page ("licen" occurs 0 times in its HTML).
- **TapToTab (Ghaleb, Elsadawy, Essam et al.), arXiv 2409.08618, submitted 13 Sep 2024** (https://export.arxiv.org/abs/2409.08618 and
  the PDF https://arxiv.org/pdf/2409.08618, read 2026-11-10). Abstract: "YOLO models for real-time fretboard detection,
  and Fourier Transform-based audio analysis for precise note identification." PDF: YOLO V8 and "YOLO V8 Oriented
  Bounding Box (OBB), to detect and segment guitar strings and fret zones"; data "self-collecting a dataset using
  Roboflow"; Table 3 "YOLO Versions Results and Metrics" (precision, recall, mAP50, mAP50-95): YOLO V5 0.919 / 0.822 /
  0.913 / 0.769; YOLO V8 0.987 / 0.995 / 0.992 / 0.951; YOLO V8 OBB 0.988 / 0.988 / 0.993 / 0.955; YOLO V9 0.958 /
  0.949 / 0.983 / 0.907 (on the authors' own annotated set). It names GuitarSet's lack of video: "Lack of Visual
  Guitar Data: GuitarSet and IDMT-SMT-GUITAR primarily focus on audio data with limited visual information, which is
  essential for our computer vision approach." Authors on the PDF include Ali Ghaleb and others; each author block
  reads "Faculty of Computer and Information" / "Sciences" / "Ain Shams University" / "Cairo, Egypt" (verify: the
  affiliation is set over several lines in the PDF). The arXiv page shows only the generic "Code, Data and Media" toggles; no code
  or dataset link was found in the abstract page or the PDF lines read.
- **"You Just Play" / Tabbers, PyData Tel Aviv 2025 talk** (https://cfp.pydata.org/pydata-tel-aviv-2025/talk/FA7JGZ,
  read 2026-11-10; the page HTML carries the date 2025-11-05). "Our core technology turns guitar-playing videos into
  rich, instructional content. We use audio and video analysis to generate tablature, color-coded finger
  visualizations". System list: "Computer vision application to detect finger placement on the fretboard", "Video and
  audio based technique extraction (bends, slides, hammer-on, etc.)", "Fusion pipeline for aligning visual hand
  positioning with note transcription". Stack: "Backend in Python (FastAPI, OpenCV, Librosa, Pandas, Numpy, etc.)",
  "A verity of open-source audio and visual models", "Next.js frontend with custom SVG rendering for tabs". A product,
  no code release mentioned.
- **GuiFiR (An, Chung, Park, Lee), "Weakly-Supervised Learning of Hand Pose Estimation for Guitar Finger Reading",
  IEEE Access 2026** (https://ailab.kookmin.ac.kr/publications/2026-07-15-guifir-weakly-supervised-learning-of-han/,
  read 2026-11-10). "estimating which finger presses which string on which fret from an image"; "GuiFiR-Synth provides
  strong supervision through synthetic composite images"; "GuiFiR-Vid provides weak supervision from real guitar
  playing videos using tablature ... with pseudo-GT tablature automatically generated from audio by a customized
  TabCNN. The fretboard is modeled as a dense grid of 126 semantically-indexed 2D landmarks, and a
  Hungarian-matching-based tablature loss aligns predicted fingertips with the corresponding fret positions." "GuiFiR
  consistently improves hand pose estimation accuracy on guitar playing videos regardless of the baseline method
  (MediaPipe, OpenPose, WiLoR, HaMeR)". "The GuiFiR dataset resources are publicly available." The page links no
  repository or dataset URL (its only GitHub link is the lab organization `github.com/kmu-ee-ailab`); `git ls-remote`
  of `kmu-ee-ailab/GuiFiR` and `kmu-ee-ailab/guifir` failed on 2026-11-10. Code and data location: UNVERIFIED.
- (verify, added) **Bae, Kwon, Park, "An Audio-Visual Framework for Transcription and Fingering Optimization in Bass
  Guitar Performance", UIST Adjunct '25 (3-page poster, DOI 10.1145/3746058.3758448)**
  (https://ixlab.cau.ac.kr/papers/bassguitar-uist25poster.pdf, read 2026-11-10). Abstract: "This paper presents a
  framework for estimating optimal bass fingering by analyzing video input, detecting strings, frets, finger
  positions, and played notes. Using a Bi-LSTM model, the system estimates optimal fingering sequences." Parts named in
  the text: "we used Google MediaPipe Hand Landmarks Detection", "To detect bass string, we used OpenCV’s houghlines
  function" (the PDF's two-column text interleaves this sentence; quoted as it reads in column order), and CREPE Notes
  for pitch and note-on times. Data: "We collected a total of 21 YouTube videos". Reported result (the poster's
  section "4.3 Results", authors' own evaluation): "The note
  recognition accuracy was 0.81 on average (SD=0.06), the position recognition accuracy was 0.77 (SD = 0.12), and the
  fingering prediction accuracy was 0.50 (SD = 0.07)". No code or data link was found in the PDF text.
- **Names that came up in search results but were not read today** (nothing is claimed about them here; years and
  venues are UNVERIFIED): Duke and Salgian (a PDF link titled "Guitar Tablature Generation Using Computer Vision"
  returned HTTP 404), Kerdvibulvech and Saito, Hrybyk and Kim, Scarr and Green, Canales and Jörg, and PianoVAM
  (arXiv 2509.08800, a piano dataset).

## Datasets that pair guitar video (or guitar hands) with annotations

- **Goldstein and Moses 2018**: GoPro 240 fps videos from a camera mounted on four guitars, with note ground truth;
  "available on project webpage" per the paper. (verify) Page opened 2026-11-10: 59 `.MP4` Dropbox links per guitar
  and string plus `getGroundTruth.m` (Research section); no license text on the page; the code page says "Code will be
  available soon."
- **GuiFiR-Synth and GuiFiR-Vid** (2026): described above; "publicly available" per the lab page; no link found.
- **GAPS** (Xavier Riley, Zixun Guo, Drew Edwards, Simon Dixon; arXiv 2408.08653, comment "ISMIR 2024", per
  https://export.arxiv.org/abs/2408.08653; text from https://arxiv.org/html/2408.08653v2, both read 2026-11-10): "14 hours
  of freely available audio-score aligned pairs, recorded in diverse conditions by over 200 performers, together with
  high-resolution note-level MIDI alignments and performance videos"; "547 of the pieces include links to videos on
  YouTube of a performance of the same piece"; "We also downloaded the audio and video for the 547 pieces where
  YouTube links were available." Zenodo record https://zenodo.org/records/17152440 (read 2026-11-10): "Links to
  YouTube URLs for audio and video are provided in the accompanying metadata file"; License "Creative Commons
  Attribution Non Commercial Share Alike 4.0 International"; (verify: re-quoted as the description shows it) "UPDATE -
  a newer version of this dataset is now available at
  [https://huggingface.co/datasets/xavriley/GAPS](https://huggingface.co/datasets/xavriley/GAPS) which includes audio and
  also fixes a bug with case sensitivity in the Soundslice ids that are used to identify files." Video frames are not
  hand- or fret-annotated in what was read; note-level MIDI (and tablature in MusicXML per the paper: "tablatures in
  MusicXML format") is.
  (verify, added: a conflicting license source) The Hugging Face dataset card
  (https://huggingface.co/datasets/xavriley/GAPS/raw/main/README.md, read 2026-11-10) has the front matter "license:
  mit" and says "300 solo guitar performances with accurately aligned MIDI and musicxml scores." and "audio now
  included". Its top-level folders (HF API, 2026-11-10) are `audio`, `midi`, `musicxml`, `match`, `syncpoints`,
  `scripts`, plus `gaps_metadata_with_splits.csv`; no video folder. Zenodo (CC BY-NC-SA 4.0) and Hugging Face (MIT)
  therefore state different licenses for GAPS; both are quoted here as found.
- **Guitar-TECHS** (https://zenodo.org/records/14963133, "Published April 6, 2025 | Version v1", read 2026-11-10):
  "Per-string MIDI annotations via Fishman Triple Play Connect pickup"; "(note: the ego and exo signals were captured
  with a video device, but Guitar-TECHS only includes this device's audio capture)". License "Creative Commons
  Attribution 4.0 International". So: no video in the release.
- **Ego-Exo4D** (https://docs.ego-exo4d-data.org/, read 2026-11-10): "skilled activites covering both physical
  (Soccer, Basketball, Dance, Bouldering, Music) and procedural (Cooking, Bike Repair, Health) tasks"; "extensively
  annotated with 3D body and hand pose". Access (https://ego-exo4d-data.org/): "Sign the Ego-Exo4D Licenses, this will
  take 2 days to be approved". Whether the Music scenario includes guitar, and the license terms, were not read:
  UNVERIFIED. (verify) The home page's scenario table lists "Music 276 59 8 180.08h" (takes, participants, sites,
  ego+exo hours); neither page read mentions guitar.
- **Ultralytics Hand Keypoints** (generic hands, not guitar): 26,768 images, MediaPipe-generated 21-point labels,
  CC BY-NC-SA 4.0 (Ultralytics section).
- **Roboflow Universe guitar projects**: listed in the Roboflow section; pages not readable from this box.
- **TapToTab's own set**: "self-collecting a dataset using Roboflow" (PDF); release not found.
- GuitarSet (R1 in this project's inputs): TapToTab's PDF: "GuitarSet and IDMT-SMT-GUITAR primarily focus on audio
  data with limited visual information".

---

## Browser-side hand tracking wrappers (TensorFlow.js hand-pose-detection, ml5.js handPose)

- **TensorFlow.js `@tensorflow-models/hand-pose-detection`** 2.0.1 (npm, published 2023-07-31; `tensorflow/tfjs-models`
  last commit 2026-03-28). README (`hand-pose-detection/README.md` at HEAD, read 2026-11-10): runtime option
  `runtime: 'mediapipe', // or 'tfjs'`, `modelType: 'full'`. Output per hand: "a prediction of the handedness (left
  or right), a confidence score of this prediction, as well as an array of keypoints"; "For the `keypoints`, x and y
  represent the actual keypoint position in the image pixel space."; "For the `keypoints3D`, x, y and z represent
  absolute distance in a metric scale, where the origin is formed as an average between the first knuckles of index,
  middle, ring and pinky fingers." Each keypoint carries a `name` (e.g. `"wrist"`, `"pinky_finger_tip"`). License:
  repository `LICENSE` Apache License 2.0; npm metadata "Apache-2.0".
- **ml5.js** npm `ml5` 1.4.0 (2026-08-07; `ml5js/ml5-next-gen` last commit 2026-11-09). (verify: rewritten; the
  README does not mention handPose) README: "ml5.js aims to make machine learning approachable for a broad audience of
  artists, creative coders, and students." The hand model is `src/HandPose/index.js`, which has `import * as
  handPoseDetection from "@tensorflow-models/hand-pose-detection";` and options `maxHands`, `modelType`, `runtime`
  (source at HEAD, read 2026-11-10), i.e. a wrapper of the TensorFlow.js model above. License sources conflict: npm metadata says "MIT"; the repository's
  `LICENSE.md` reads "# ml5.js LICENSE _Version 1.0 of the ml5.js license was adopted and last updated on May 10, 2021.
  It applies to all contributions to the ml5.js library as of May 20,2021. Contributions prior to that date are
  licensed under the MIT license." It includes "You must use this software in compliance with the ml5.js [Code of
  Conduct]" and "Each contribution to this software is licensed under this license for three years from the date it
  is contributed to the software. After that three year period the contribution is licensed under the [Blue Oak Model
  License v 1.0.0]" (read from clone 2026-11-10).
- The MediaPipe Tasks web package (`@mediapipe/tasks-vision`) is covered in the MediaPipe section; the
  `browser-audio-sync` lane measures in-browser runs.

## Other whole-body models with hand keypoints (brief)

- **ViTPose / ViTPose+** (`ViTAE-Transformer/ViTPose`, last commit 2025-12-26): `LICENSE` "Copyright 2018-2020
  Open-MMLab. All rights reserved." + Apache License 2.0 (clone 2026-11-10). HaMeR and Hamba ship a `vitpose_model.py` at their
  repository roots; HaMeR's demo uses it to locate hands. rtmlib lists "ViTPose for 133 keypoints".
- **Sapiens** (Meta, `facebookresearch/sapiens`, last commit 2026-05-26): `LICENSE` "Creative Commons
  Attribution-NonCommercial 4.0 International" (clone 2026-11-10). (verify, resolves the earlier UNVERIFIED)
  `docs/POSE_README.md` lists "Body: 17 Keypoints", "Body + Face + Hands + Feet: 133 Keypoints" ("following the
  [COCO-WholeBody keypoint format]") and "Body + Dense Face + Hands + Feet: 308 Keypoints". README: "This project is
  licensed under [LICENSE](LICENSE)." Weights: README "Please download the **original** checkpoints from
  [hugging-face](https://huggingface.co/facebook/sapiens)"; HF `facebook/sapiens` and `facebook/sapiens-pose-1b` are
  tagged `license:cc-by-nc-4.0` (HF API, 2026-11-10).
- (verify, added) **Sapiens2** (Meta, `facebookresearch/sapiens2`, last commit 2026-05-24; README "ICLR 2026", paper
  arXiv 2604.21681, not opened): "A family of high-resolution transformers pretrained on 1 billion human images,
  achieving state-of-the-art performance across diverse human-centric tasks — pose estimation, body-part segmentation,
  surface normals, pointmaps, and human matting." (authors' claim, quoted). Pose: "308 whole-body keypoints"; weights
  `sapiens2_{0.4b,0.8b,1b,5b}_pose.safetensors`; "**Install** (requires Python ≥3.12 and PyTorch ≥2.7)". CPU not
  stated. License `LICENSE.md` "Sapiens2 License" (https://raw.githubusercontent.com/facebookresearch/sapiens2/main/LICENSE.md,
  read 2026-11-10): "**a. Grant of Rights.** You are granted a non-exclusive, worldwide, non-transferable and
  royalty-free limited license under Meta's intellectual property or other rights owned by Meta embodied in the
  Sapiens Materials to use, reproduce, distribute, copy, create derivative works of, and make modifications to the
  Sapiens Materials."; among the listed prohibited uses: "(ii) for biometric processing;". HF
  `facebook/sapiens2-pretrain-0.4b`: `license:other`, license name "sapiens2-license".
- **SAM 3D Body** (Meta): see the SAM section (SAM License; gated weights).

---

## Handoff facts

One line per fact: "X outputs <format>, which Y accepts as <input>", with the source for each half. Sources in this
file's sections were read on 2026-11-10; lines that point at another lane's `survey.md` rely on that lane's record.

Inside this lane (video):

1. MediaPipe Hand Landmarker outputs, per hand, 21 landmarks with x, y "normalized by image width and height" plus a
   Left / Right `handedness` score (https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker), which
   OpenCV's `perspectiveTransform(src, m[, dst])` ("Performs the perspective matrix transformation of vectors", cv2
   5.0.0 docstring) accepts once multiplied by the frame width and height and shaped (N, 1, 2) (verify: a plain (N, 2)
   array raises an assertion error in cv2 5.0.0; OpenCV section), with `m` the 3x3 matrix from
   `findHomography(srcPoints, dstPoints[, method ...])` or `getPerspectiveTransform` (OpenCV section). (verify) Run on
   this box: trials.md "Worked handoff" (runs r0172, r0218) did exactly this on R3a_cu frame 150 with four hand-set
   neck corners and `getPerspectiveTransform`, and turned each fingertip into a rectified (u, v) and a (fret cell,
   string cell) pair.
2. rtmlib `Hand` outputs `keypoints` (instances x 21 x 2, image pixels) and `scores` (instances x 21)
   (`rtmlib/tools/pose_estimation/rtmpose.py`, `solution/hand.py`), which the same OpenCV point mapping accepts after
   one instance's (21, 2) array is reshaped to (21, 1, 2) (verify: corrected from "accepts directly";
   `scripts/verify_perspective_shapes.py`). Not yet run through rtmlib on this box when this was checked.
3. A detector's boxes (Ultralytics `result.boxes.xyxy`, "Return the boxes in xyxy format"; OWLv2
   `results["boxes"]`, "(xmin, ymin, xmax, ymax)"; Grounding DINO `boxes`, normalized center x, center y, width,
   height, which first need scaling by the image size and `box_convert(..., in_fmt="cxcywh", out_fmt="xyxy")` as its
   own `annotate` does: verify, resolved from source) can be passed to rtmlib's `RTMPose.__call__(image, bboxes=[...])`,
   which accepts "xyxy-format bounding box" lists (`rtmpose.py` docstring) to force the pose model onto a chosen hand
   or neck region. (verify, added) WiLoR-mini's `predict_with_bboxes(image, bboxes, is_rights)` takes xyxy boxes the
   same way (its code computes the center as `(bboxes[:, 2:4] + bboxes[:, 0:2]) / 2.0`).
4. Grounding DINO outputs text-prompted boxes (`predict(..., caption=TEXT_PROMPT, ...)`), which SAM 2's video
   predictor accepts as box prompts (`add_new_points_or_box(state, <your_prompts>)`); the Grounded-SAM-2 repository
   (`IDEA-Research/Grounded-SAM-2`, Apache-2.0) ships scripts for this pairing (root files include
   `grounded_sam2_dinox_demo.py` and `grounded_sam2_florence2_autolabel_pipeline.py`, and `LICENSE_groundingdino`,
   `LICENSE_sam2`; verify: `grounded_sam2_tracking_demo.py` at HEAD calls `video_predictor.add_new_points_or_box(`
   with `box=box`).
5. SAM 3 outputs per-instance `masks`, `boxes`, `scores` for a text prompt (e.g. "guitar neck", "capo") per frame
   (SAM 3 README), and a mask converted to an 8-bit single-channel binary image is the input OpenCV `HoughLinesP`
   documents ("8-bit, single-channel binary source image"), returning fret / string segments as 4-element vectors.
6. CoTracker3 outputs `pred_tracks` ("B T N 2"; verify: x, y in pixels of the input video, `cotracker/predictor.py`)
   and `pred_visibility` (CoTracker README), which `findHomography` accepts frame by frame as point correspondences (a
   template of the neck's points in frame 0 against their tracked positions in frame t), keeping a fretboard mapping
   through camera or guitar motion. TAPIR / TAPNext also output per-point tracks (tapnet README).
7. WiLoR-mini outputs per hand `hand_bbox`, `is_right` and `wilor_preds["pred_keypoints_2d"]` (3D joints projected
   to image pixels) (`wilor_hand_pose3d_estimation_pipeline.py`), which the point mapping in fact 1 accepts the same
   way as 2D landmarks. (verify: corrected) HaMeR's `pred_keypoints_2d` is not in image pixels: `hamer/models/hamer.py`
   projects with `focal_length / self.cfg.MODEL.IMAGE_SIZE` and a zero camera center, so its points are relative to
   the hand crop and need the crop's box center and size before this mapping (HaMeR section).
8. A horizontally mirrored (front-camera) video inverts MediaPipe's handedness labels ("Passing a horizontally
   mirrored image will invert these outputs", MediaPipe hand page); PRIOR.md records two of Aaron's earlier videos as
   "Video is mirrored" / "Video is mirrored (front camera)" (`docs/guitar-tab-research/PRIOR.md` lines 24 and 29), so a
   user's "this video is mirrored" correction changes which hand MediaPipe labels Left or Right.
9. MediaPipe VIDEO mode takes a per-frame `timestamp_ms` and returns one result per frame (hand page), and Basic Pitch
   outputs `note_events` as `(start_time_s, end_time_s, pitch_midi, amplitude, pitch_bends)` "times in seconds"
   (`lanes/audio-to-notes/survey.md`, section "13. Spotify Basic Pitch"; verify: that file has changed since, the line
   was 120 at 21:37 UTC, not 115): the two share a time axis once frame index / fps and audio seconds are
   put on one clock (an alignment step; no tool in this lane does it for you).
9a. (verify, added) SAM 2 / SAM 3 output per-object masks (READMEs), and CoTracker's predictor accepts "segm_mask"
   ("Segmentation mask of shape (B, 1, H, W)") together with `grid_size`, in which case the grid is "computed only for
   the mask" (`cotracker/predictor.py` comments): a neck mask can restrict which points CoTracker follows.

To neighbouring lanes (constraints from video into string-and-fret assignment):

10. A fret position read from video (the fretting hand's fingertip landmarks mapped through a fretboard homography,
    facts 1-7) is the kind of value gtrsnipe accepts as `--max-fret` or `--capo`
    (`lanes/guitar-tab/survey.md`, section "gtrsnipe": "User-settable constraints (README)" include `--max-fret`,
    `--capo`; from https://github.com/scottvr/gtrsnipe README), and LilyPond accepts as `minimumFret` / string numbers
    (same file, section "LilyPond automatic tablature": "per-note string numbers (`c4\5`), `\set TabStaff.minimumFret =
    #5`"); FretPath takes "string-number annotations as hard constraints" (same file, section "FretPath (MuseScore
    plugin)", github.com/knoguchi/fretpath). (verify: the earlier line numbers 455-456, 80 and 82 no longer pointed at
    these lines; at 21:37 UTC they were 548, 752 and 769.)
11. The reverse direction is published: GuiFiR trains its video hand / fretboard model with "pseudo-GT tablature
    automatically generated from audio by a customized TabCNN" (GuiFiR page) — audio tab output used as video
    supervision. TabCNN itself is covered in the `guitar-tab` lane.
12. TapToTab pairs YOLO fret-zone boxes and a hand box with FFT note frequencies (abstract: "YOLO models for real-time
    fretboard detection, and Fourier Transform-based audio analysis for precise note identification"), i.e. the
    video lane's box output and the audio lane's pitch output meet in one fingering choice; no code link was found on
    the arXiv page or in the PDF (Research section; verify: reworded from "its code is not public").
13. Paleari et al. (2008) fused fretboard tracking, hand position and audio "to extract a tablature" and report "89% of
    notes" disambiguated deterministically (Research section): a published system in which video information is used
    to choose the string and fret for an audio pitch (verify: reworded). Bae, Kwon and Park (UIST Adjunct 2025) do the
    same for bass with MediaPipe landmarks, OpenCV Hough lines and CREPE Notes (Research section).

---

## Access needs (what a person needs to try the tools that the docs do not show running on a CPU box)

Facts from the sections above, collected for `for-aaron.md`; each requirement is quoted or cited where it appears.

| Tool | Stated requirement | Account / gate | Cost stated |
|---|---|---|---|
| SAM 3 / SAM 3.1 | "CUDA-compatible GPU with CUDA 12.6 or higher", "Python 3.12 or higher", "PyTorch 2.7 or higher" (README) | Hugging Face login and manual approval (`gated: manual`) | none stated |
| SAM 3D Body | README points to INSTALL.md (not read) | HF `gated: manual` | none stated |
| SAM 2.1 | `python>=3.10`, `torch>=2.5.1`; CUDA extension optional (README) | none (direct download URLs) | none |
| HaMeR | install "for CUDA 11.7, but you can adapt accordingly"; MANO_RIGHT.pkl | MANO site registration | none stated |
| WiLoR | "The code has been tested with PyTorch 2.0.0 and CUDA 11.7." (README); MANO_RIGHT.pkl | MANO site registration (WiLoR-mini's HF repo hosts the file itself) | none stated |
| Hamba | HaMeR-style install "for CUDA 11.7" plus mamba / VMamba `selective_scan` builds (README); MANO_RIGHT.pkl; weights on Google Drive | MANO site registration | none stated |
| HaWoR | "tested with PyTorch 1.13 and CUDA 11.7"; MANO left and right; DROID-SLAM and Metric3D weights | MANO site registration | none stated |
| OpenPose | CPU-only build: "Around 8GB of free RAM memory."; a separate requirements item: "Highly recommended: a CPU with at least 8 cores." (verify: re-quoted as two items) | none for research use; commercial license via CMU FlintBox | commercial price not readable (UNVERIFIED) |
| TAPIR / TAPNext | Colab notebooks (README); JAX with CUDA for the live demo | not stated in the README (verify: "Google account for Colab" was removed as unsourced) | none stated |
| (verify, added) EgoHand v1 | README table: "NVIDIA RTX 6000 Ada, L40, L20, or RTX PRO 6000 Blackwell", "32 GB" memory, "25 GB" storage | none (HF `nvidia/EgoHand-v1` not gated) | none stated |
| (verify, added) FAH | CPU install stated ("On CPU or Apple silicon, omit the CUDA PyTorch command"); MANO optional | MANO site registration only for the MANO fit | none stated; weights non-commercial |
| (verify, added) YOLOE-26 text prompts | first `set_classes()` downloads `mobileclip2_b.ts` ("about 254 MB") and installs ultralytics/CLIP from GitHub | none | none stated; upstream MobileCLIP2 license is research-only |
| (verify, added) Sapiens2 | "requires Python ≥3.12 and PyTorch ≥2.7"; CPU not stated | none read (HF `facebook/sapiens2-pretrain-0.4b` not gated) | none stated |
| Roboflow Universe projects | a browser (pages blocked to this box) or an API key | Roboflow account | Free Tier $0 with "10 credits included a month"; Core "$39per month" |
| Ego-Exo4D | signed license | "Sign the Ego-Exo4D Licenses, this will take 2 days to be approved" | none stated |
| Ultralytics commercial use outside AGPL-3.0 | n/a | Enterprise license request | no price published |

---

## Not covered

Found by the verify pass's searches on 2026-11-10 (WebSearch, standard mode) and not surveyed here. Only what is
stated after each link was checked; the rest is how the search results described it.

- WeDetect, https://github.com/wechatcv/WeDetect : an open-vocabulary detector (search results: "CVPR2026"). The
  repository root has no `LICENSE` file (raw.githubusercontent.com answered HTTP 404 for `main/LICENSE`). README not read.
- OV-DEIM, arXiv 2603.07022 (code link in search results: https://gitee.com/lsreback/OV-DEIM): a real-time
  DETR-style open-vocabulary detector. Not read.
- RF-DETR, https://github.com/roboflow/rf-detr (default branch `develop`): Roboflow's detector family, bundled in
  Roboflow Inference as `rfdetr`. `LICENSE` at `develop` is the Apache License 2.0 text; README, weights and
  per-model terms not read.
- TAPIP3D, https://github.com/zbw001/TAPIP3D ("Tracking Any Point in Persistent 3D Geometry"): `LICENSE` at `main` is
  the Apache License 2.0 text; README not read.
- AnyHand, https://github.com/chen-si-cs/AnyHand : search results describe synthetic hand data plus fine-tuned HaMeR
  and WiLoR checkpoints. `LICENSE` at `main` is "CC0 1.0 Universal". README not read.
- HOPformer, https://huggingface.co/Sid2697/HOPformer : the page title reads "You need to agree to share your contact
  information to access this model" (gated); search results describe egocentric 3D hand-object pose from video. Not read.
- "Monocular Biomechanical Tracking of Fingers", arXiv 2605.09258 (https://www.alphaxiv.org/abs/2605.09258). Not read.
- Asmar, Séoud and Bilodeau (2021), RGB-D reading of guitar fretting, https://publications.polymtl.ca/80726/ : the
  page did not answer a curl request on 2026-11-10 (no HTTP status). Not read.
- Canales and Jörg, ACM MIG 2025, hand motion synthesis for virtual guitar playing (named in search results). Not read.
- TAPNext++ paper, arXiv 2604.10582: its checkpoint is already listed in the tapnet section.

---

## Verification log (verify-docs-video-hands-fretboard, 2026-11-10)

Method. Every URL quoted in this file was fetched again with curl through the session proxy (147 pages and files,
saved under `/home/user/gtr/lanes/video-hands-fretboard/verify/web/`), plus 29 Hugging Face API records, 19 PyPI JSON
records, 8 npm records and `git ls-remote` of 44 repositories. Each quote was compared with
`scripts/verify_quotes.py` (copied from `verify/bin/vq.py`): verbatim after collapsing whitespace; a quote with "..."
passes only if each part occurs in order; HTML is compared as text with and without tag separators; PDF text is
compared in layout and reading order. The quote lists are in `/home/user/gtr/lanes/video-hands-fretboard/verify/q/` and
every result in `verify/checks.log`. Source code statements were checked against the clones (`git show HEAD:<file>`),
whose HEADs all matched `git ls-remote` on 2026-11-10. No model was run; the only code run was
`scripts/verify_perspective_shapes.py` (a sub-second shape check, no gtr-run id).

Tally of the quotes the survey agent wrote (377 quoted passages from 99 sources):

| Kind | Checked | Verbatim | Matched after reading the layout (no change) | Corrected | Unverifiable |
|---|---|---|---|---|---|
| License and terms clauses (code, weights, data, service, pricing page excluded) | 110 | 107 | 1 (hand model card's two-column "LICENSED UNDER" block) | 2 (MMPose `LICENSES.md` table row; SAM 2 `cc_torch` sentence) | 0 |
| Docs, papers, commands, prices | 267 | 249 | 7 (PDF line-break hyphens x3, a title set in capitals, a URL split over two lines, line-continued HaMeR command, a git commit subject) | 11 | 0 |
| Total | 377 | 356 | 8 | 13 | 0 |

The 11 corrected docs quotes: OpenPose `02_output.md` (list marker dropped) and `0_index.md` (two list levels merged,
which changed which configuration the "8 cores" line belongs to); the Grounding DINO `predict(...)` call (threshold
constants replaced by values); the Roboflow `InferenceHTTPClient` snippet (comment dropped); the GAPS Zenodo update
sentence (link markup and the end of the sentence dropped); three MMPose inferencer lines (`'hand'` presented as the
page's example; the page shows `'human'`); the Goldstein and Moses reference (the paper's "porject" silently
corrected); the rtmlib `Wholebody(...)` call (variables replaced by values); the TapToTab affiliation (lines joined).
Three SA-V quotes that were marked "UNVERIFIED verbatim" were confirmed verbatim.

Other facts corrected (not quote mismatches):
- `opencv.js` 1.2.1 date: published 2017-11-01, not 2022 (npm `time`).
- ml5.js: its README does not mention handPose; the hand model is `src/HandPose/index.js`, a wrapper of
  `@tensorflow-models/hand-pose-detection`.
- rtmlib: the README has no `from rtmlib import Wholebody, Hand, PoseTracker` line.
- HaMeR `pred_keypoints_2d` is relative to the hand crop, not image pixels (Handoff fact 7 was wrong).
- Handoff fact 2: an (N, 2) keypoint array is not accepted "directly" by `cv2.perspectiveTransform`; (N, 1, 2) is.
- Handoff facts 9 and 10: four line references into other lanes' surveys pointed at other lines (those files changed);
  now cited by section with the line numbers seen at 21:37 UTC.
- Judging or advice wording removed or reworded: Ultralytics "is the way to add guitar-specific classes"; Handoff 12
  "its code is not public" (now "no code link was found"); Handoff 13 "the published precedent". Author claims such as
  TAPNext's "latest, most capable, fastest" and Sapiens2's "state-of-the-art" stay only as attributed quotes.
- Access table: "Google account for Colab" removed (no source); the OpenPose row re-quoted.

UNVERIFIED marks: the file had 31; 9 were resolved (Grounding DINO box format x2, CoTracker query forms and units,
AllTracker weights license, Sapiens keypoint counts, SA-V wording, Goldstein code and data pages x2); 3 new ones were
added (terms of Ultralytics' `mobileclip2_b.ts` export, the OpenAI CLIP text encoder's license, EgoHand's training
data). 25 remain.

License facts added (weights and data the survey had not separated or had missed):
- MANO: "The Data & Software may not be reproduced, modified and/or made available in any form to any third party
  without Max-Planck’s prior written permission."
- YOLOE-26 prompts load Apple's MobileCLIP2 text encoder; the upstream model's license is research-only (quoted).
- GAPS: Hugging Face card "license: mit" against Zenodo CC BY-NC-SA 4.0 (both quoted).
- WiLoR's WHIM training set: "license: cc-by-nc-nd-4.0" (HF card).
- Sapiens weights `license:cc-by-nc-4.0` (HF); AllTracker weights `license:mit` (HF).
- PyPI `sam3` 0.1.4: SAM License text in the license field but an "MIT License" classifier.
- PyPI `groundingdino-py`: homepage github.com/giswqs/GroundingDINO (third-party packaging).
- HaWoR README license line; MMPose `mminstall.txt` pins `mmdet<3.3.0`.

Tools and research added with the same checks: FAH (2026; code Apache-2.0, weights non-commercial), EgoHand v1 (2026;
OpenMDW-1.1), Sapiens2 (2026; Sapiens2 License), YOLOE-26 inside Ultralytics (2026 paper), and Bae, Kwon and Park's
audio-visual bass fingering framework (UIST Adjunct 2025). Ten more items are listed under "Not covered". The 78 new
quotes written by this pass were run through the same checker: 77 verbatim, 1 quoted in column order from a
two-column PDF (marked in the text).

Cross-check with trials.md (last modified 21:36 UTC; re-read at 21:52 UTC): MediaPipe output fields, the region-of-interest statement,
OWLv2 output (Space versus `transformers`), OpenCV `HoughLinesP` shape and the fingertip-to-cell handoff were compared
and noted in place; they agree with the survey except where both forms are now stated. trials.md had no section yet
for rtmlib, Ultralytics pose, YOLOE-26, CoTracker3, SAM 2.1 or OpenPose, so those output formats are checked against
source code only.

Still open: the nine Roboflow Universe pages (HTTP 403 to this box), the OpenPose FlintBox price page (needs
JavaScript), docs.opencv.org (Cloudflare challenge; source headers and docstrings were used), the Duke and Salgian PDF
(404, URL not recorded in this file), GuiFiR code and data location, Ego-Exo4D guitar content and license text.
