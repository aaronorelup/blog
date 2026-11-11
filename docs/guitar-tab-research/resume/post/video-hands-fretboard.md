<!-- RUNDOWN -->
- **Hands and frets from video: of 74 tools, papers and datasets, 15 tools gave output, 14 of them on the cloud box.** Google's MediaPipe hand tracker reported one hand in all 300 frames of a close shot where only the hand on the guitar's neck is in view. In a wide shot it also put a "hand" on the sheet music in 215 of 221 frames.

<!-- SECTION -->
## Reading hands and the fretboard from video

This step watches the player's hands, so the app can tell which string and fret each finger presses. My agents looked at 74 tools, papers and datasets, and 15 tools gave an output, 14 on the cloud box and one on a public demo page. They ran on four real videos of nylon-string guitar played with the fingers. My agents had no record of what was played in any of them, so there's no answer to check against. R3a is an 18-second excerpt of a concert. R3a_cu is a 10-second close shot from the same concert with only the fretting hand in view, the hand that presses the strings. R3b and R3c are 18-second clips of two other players, filmed closer up. Google's MediaPipe hand tracker returned one hand in all 300 frames of R3a_cu and two hands in all 450 frames of R3c, where both are in view. In R3a's wide shot it also put a "hand" on the sheet music in 215 of 221 frames. With the neck's four corners set by hand, a script my agents wrote turned fingertips into a string and a fret on one frame of R3a_cu and one of R3b. On R3b, two ways of counting the frets give numbers one fret apart, and which is right isn't known.

<ao-compare cols="2" aspect="4/3">
<figure><img src="/media/guitar-tab-tools/video-hands-fretboard-mediapipe-close.webp" alt="A classical guitarist seen from the chest up, the guitar neck rising to the right. Green lines and white dots trace the fingers of the hand on the neck, labelled Left 1.00."><figcaption><b>One hand, 21 points</b><span class="ao-meta">MediaPipe Hand Landmarker on R3a_cu, frame 150 · video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/video-hands-fretboard-mediapipe-sheet-music.webp" alt="A seated guitarist on a stage behind a black music stand. Green and white hand points sit on her hand on the guitar neck, labelled Left 1.00, and a second set sits on white sheet music hanging from the stand, labelled Left 0.54."><figcaption><b>A second "hand" on the sheet music</b><span class="ao-meta">the same tool on R3a's wide shot, frame 300, enlarged detail · video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0</span></figcaption></figure>
<figure class="wide"><img src="/media/guitar-tab-tools/video-hands-fretboard-fingertips-r3a-cu.webp" alt="A straightened close-up of a guitar neck with four fingers pressing strings. Magenta vertical lines mark frets, cyan ticks along the top count frets 0 to 11, and green dots on the fingertips read index s4 f2, middle s6 f4, ring s4 f4, pinky s2 f4 and thumb s1 f3."><figcaption><b>Fingertips to string and fret, R3a_cu</b><span class="ao-meta">frame 150, the neck straightened from four corners set by hand. Magenta: frets found by OpenCV, a library of image functions. Cyan: fret numbers from a spacing formula fitted to them · video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0</span></figcaption></figure>
<figure class="wide"><img src="/media/guitar-tab-tools/video-hands-fretboard-fingertips-r3b.webp" alt="A straightened close-up of another guitar neck with four fingertips marked by green dots: index s4 f3, middle s5 f4, ring s2 f5, pinky s2 f5. Magenta lines mark the fret-like lines OpenCV found: one at the nut, one along the edge of a finger at the ring fingertip, and the frets right of the hand. Cyan ticks count frets 0 to 19, and two pale fret wires left of the fingers have no magenta line."><figcaption><b>Fingertips to string and fret, R3b</b><span class="ao-meta">frame 225, same steps. Counting the metal fret wires by eye from the nut, where the fretboard ends by the tuning pegs, gives one fret lower for each finger. Which count is right isn't known · video CC0, from archive.org</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

None of these videos has a known answer, so every figure here is a count, a rate or a time. Each video was turned into still frames once with ffmpeg, a command-line video tool, to PNG for R3a and R3a_cu (`ffmpeg -i <clip>.mp4 -vsync 0 <dir>/%04d.png`) and to JPEG at `-q:v 2` for R3b and R3c. R3a is 540 frames at 640x480 with camera cuts at frames 218 and 439, so it has 319 medium-shot frames and 221 wide-shot frames. R3a_cu is 300 frames at 640x480. R3b and R3c are 450 frames each at 1920x1080. "Crop" means a fixed box around both hands enlarged 3 times on R3a, or the whole R3a_cu frame enlarged 2 times.

Timed runs had 2 of the box's 4 CPU cores unless the entry says otherwise. The four that ran through rtmlib are the exception. The engine under rtmlib, ONNX Runtime, put some of its work on cores outside the 2 it was given. In one step it used 2.31 seconds of processor time for each second on the clock, more than 2 cores can give. So their times aren't 2-core times. "Wall" is time on the clock. Many runs went through one shared job, a group run, so several entries carry that job's run id. Local runs cost nothing beyond the cloud session itself.

A second agent, the checking agent, re-ran at least one run of 13 of these 15 tools, all but RTMW and ViTPose, with the same commands. The outputs came out the same and the times didn't. CoTracker3 took 0.74 s a frame in the re-run, against 1.47 s the first time. Other jobs shared the box both times. Partway through the work my agents were given a 200 MB cap on new downloads and installs, to save space on the shared disk. Their notes put its start at about 21:12 UTC, a time the checking agent couldn't confirm. The RTMW file below is dated 21:06 UTC. Whether the MobileCLIP2 file, dated 21:14:08 UTC, came before the cap isn't verified.

**CoTracker3, offline model, commit 82e02e8** ([repo](https://github.com/facebookresearch/co-tracker)). Meta's point tracker. It follows chosen points through a video.
- In: R3a_cu frames 150 to 239 (90 frames, 3.0 s) as one block of color values, shape `(1, 90, 3, 480, 640)`. Eight points set by hand on frame 150, four on the neck and four on the hand.
- Command or settings: `CoTrackerPredictor(checkpoint=..., offline=True, window_len=60)`, with the points as `(t, x, y)` queries. The checkpoint, the trained model file, is `scaled_offline.pth` (101,890,938 bytes). The README's `torch.hub.load` route needs api.github.com, which the box's proxy refuses, so the clone went on `sys.path` instead.
- Out: `pred_tracks` (x and y in pixels, per frame and point) and `pred_visibility` (true or false). CoTracker3 marked the four neck points visible in 90 of 90 frames, and the farthest it moved each one from its start was 3.77 to 4.34 px. It marked the wrist and index knuckle visible in 90 of 90 and moved them up to 98.17 and 66.43 px from their starts. It marked the index fingertip visible in 16 of 90 frames and the middle fingertip in 73. Nothing records where these points really were. By eye on frame 239 the neck points are still on the neck and the wrist and knuckle points are on the hand.
- Time: 136.52 s wall, 132.43 s of it tracking (1.47 s a frame), peak memory 8,813,832 kB (8.4 GiB). Step `cotracker3-offline_R3a_cu_f150_90` of group run r0448.
- Takes as a hint: the points to follow (`queries`), a `grid_size`, or a `segm_mask`, a black-and-white picture that marks an area, to keep the grid inside it. Nothing about the guitar.
- Hands off to: not tried. Its tracks, set against the same points on the first frame, give the point pairs OpenCV's `findHomography` takes. My agents' notes say that would keep the fretboard map in place as the camera or the guitar moves. Nobody ran it.

**DWPose-l, through rtmlib 0.0.16** ([repo](https://github.com/IDEA-Research/DWPose)). IDEA Research's whole-body model with 133 points: body, feet, face and 21 per hand.
- In: every 6th frame of R3a (90 frames, full and crop) and every 5th frame of R3a_cu (60 frames), as numpy BGR arrays. A YOLOX person detector found the player first.
- Command or settings: `scripts/run_rtmlib.py <clip> <full|crop> <hand|rtmw|dwpose|vitpose> <outdir> [step]` with `dwpose` and the model `rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.onnx` (134,399,323 bytes). A hand counts when the mean of its 21 point values in `scores` is 0.3 or more.
- Out: `keypoints` (people x 133 x 2, in pixels) and `scores` (people x 133). The hands are points 91-111 and 112-132. On R3a full it gave two hands in 90 of 90 frames, the wide shot included, where the picking hand, the one that plucks the strings, is behind the music stand. On R3a_cu, where the picking hand is out of the picture, the right-hand slot passed the 0.3 rule in 15 of 60 frames.
- Time: R3a full 124.90 s wall, 577.2 MiB peak, 1340.44 ms a frame. R3a_cu 62.18 s, 575.2 MiB. Steps of group run r0448. Not 2-core times.
- Takes as a hint: person boxes (`bboxes`), `backend`, `device`. No handedness or guitar setting.
- Hands off to: not tried.

**MediaPipe Hand Landmarker 1.2.2** ([docs](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)). Google's palm detector plus a 21-point hand model.
- In: R3a (full and crop), R3a_cu (full and 2x), R3b and R3c, one `mp.Image` (SRGB, uint8) per frame.
- Command or settings: `running_mode=VIDEO`, `num_hands=2`, `min_hand_detection_confidence=0.5`, `min_hand_presence_confidence=0.5`, `min_tracking_confidence=0.5`, model `hand_landmarker.task` (7,819,105 bytes), script `scripts/run_mediapipe_hands.py <clip> <full|crop> <model> <outdir>`.
- Out: per hand a `handedness` label (Left or Right, with a `score`), 21 `hand_landmarks` (x and y as fractions of the frame's width and height) and 21 `hand_world_landmarks` in meters. R3a_cu: one hand in 300 of 300 frames, full and 2x, labelled Left every time. R3b: one hand, the fretting hand, in 445 of 450 frames and none in 5. The picking-hand fingers at the left edge weren't found in any frame. R3c: two hands in 450 of 450 frames, the "Left" ones at the neck on average and the "Right" ones at the sound hole. R3a full: 0, 1 and 2 hands in 1, 267 and 272 frames. In the medium shot a hand landed in the fretting-hand area in 318 of 319 frames and in the picking-hand area in 54. In the wide shot, 215 frames also had a "hand" in one 20-px square that on frame 300 is the sheet music hanging from the music stand. In crop mode, 9 wide-shot frames had a detection outside the fretting-hand area, in the square just above it. The R3a_cu frame 150 record, as my agents summed it up:

  ```text
  label Left, score 0.9985, wrist normalized (0.85115, 0.6729), index fingertip (landmark 8) (0.75431, 0.38754) = pixel (482.8, 186.0)
  ```

- Time: R3a_cu 14.29 s wall, 211.3 MB peak, 32.56 ms a frame (r0078). R3a 27.83 s, 224.6 MB (r0071). R3b 22.43 s, 254.9 MiB, and R3c 21.53 s, 258.3 MiB (steps of group run r0408).
- Takes as a hint: `num_hands`, the three confidence thresholds and `running_mode`. There's no option to look at only part of the picture, so the crops were made outside it. Nothing about the guitar. About the Left and Right labels, its docs say `Passing a horizontally mirrored image will invert these outputs.`
- Hands off to: OpenCV, as fingertip pixels shaped `(N, 1, 2)` for `cv2.perspectiveTransform` (runs r0172, r0218 and r0402, in the OpenCV entry). Its hand boxes also went to the OpenPose hand model.

**MediaPipe Holistic Landmarker 1.2.2** ([docs](https://ai.google.dev/edge/mediapipe/solutions/vision/holistic_landmarker)). Body (33 points), face (478) and both hands (21 each) in one model.
- In: R3a full and crop, R3a_cu full and R3c, as `mp.Image` frames.
- Command or settings: default options in VIDEO mode, model `holistic_landmarker.task` (13,683,609 bytes), script `scripts/run_mediapipe_pose_holistic.py`.
- Out: `pose_landmarks`, `face_landmarks`, `left_hand_landmarks` and `right_hand_landmarks` (21 each, empty when not found), with no handedness value. R3a full: a body in 540 of 540 frames, and 0, 1 and 2 hands in 13, 439 and 88. In the wide shot the left hand came up in 220 of 221 frames, the right hand in none, and nothing landed on the sheet music. R3a_cu: the left hand in 300 of 300 frames. R3c: the left hand in 450 frames, the right in 440. On the R3a crops it stopped at frame 218, where the crop size changes at the camera cut:

  ```text
  RET_CHECK failure (third_party/mediapipe/calculators/image/segmentation_smoothing_calculator.cc:207) current_mat->rows == previous_mat->rows (660 vs. 720)
  ```

- Time: R3a full 31.57 s wall, 307.2 MiB, 48.24 ms a frame. R3a_cu 18.53 s, 308.6 MiB. R3c 39.31 s, 405.5 MiB. The crop run ended after 15.14 s with exit code 1. Steps of group run r0408.
- Takes as a hint: the run left every option at its default. In VIDEO mode it needs the same frame size on every frame.
- Hands off to: not tried. Its hands use the same 21-point layout as the Hand Landmarker.

**MediaPipe legacy Hands API, mediapipe 0.10.21** ([repo](https://github.com/google-ai-edge/mediapipe)). The older Python API, `mp.solutions.hands.Hands`. It's in 0.10.21 and in none of the releases from 0.10.30 to 1.2.2 that the checking agent looked at.
- In: R3a full and crop, R3a_cu, R3b and R3c, as RGB frames.
- Command or settings: `Hands(static_image_mode=False, max_num_hands=2, model_complexity=1, min_detection_confidence=0.5, min_tracking_confidence=0.5)`. All five are the constructor's defaults. It was installed with `uv pip install --python venv-mp-legacy/bin/python mediapipe==0.10.21`.
- Out: `multi_hand_landmarks` (21 points per hand), `multi_handedness` (`label` and `score`) and `multi_hand_world_landmarks`. R3a_cu: one hand in 300 of 300 frames. R3b: 0, 1 and 2 hands in 5, 439 and 6 frames. In those 6 frames both detections sit in the fretting-hand area, and whether one is a second copy of the same hand wasn't checked. R3c: two hands in 450 of 450. R3a full: 0, 1 and 2 hands in 1, 296 and 243 frames, with 135 wide-shot frames that had a "hand" on the same sheet-music spot. This API assumes a mirrored selfie picture and these videos weren't flipped, so the fretting hand came out "Right" on R3a_cu, R3b and R3c, where the newer API says "Left".
- Time: R3a_cu 11.39 s wall, 270.0 MiB. R3a full 23.20 s, 279.9 MiB. R3c 21.80 s, 306.8 MiB. Steps of group run r0408.
- Takes as a hint: the constructor arguments above. The note in its code says `If that is not the case, use, for instance, cv2.flip(image, 1) to flip the image first for a correct handedness output.`
- Hands off to: not tried. Same 21-point order as the newer API.

**MediaPipe Pose Landmarker (heavy) 1.2.2** ([docs](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)). 33 body points per person, with three points per hand (pinky, index, thumb) and no finger joints.
- In: R3a full and crop, as `mp.Image` frames.
- Command or settings: VIDEO mode, `num_poses=1`, detection, presence and tracking confidence 0.5, model `pose_landmarker_heavy.task` (30,664,242 bytes). A wrist counts as a hand when its `visibility` is 0.5 or more.
- Out: `pose_landmarks` (33 points with x, y, z, `visibility` and `presence`) and `pose_world_landmarks` in meters. R3a full: a body in 540 of 540 frames, a left-wrist `visibility` of 0.5 or more in 532 and a right-wrist one in 399. In the wide shot, where the picking hand is behind the music stand, the right wrist reached 0.5 in 80 of 221 frames.
- Time: R3a full 43.65 s wall, 316.7 MiB, 69.27 ms a frame. Crop 44.33 s, 325.5 MiB. Steps of group run r0408.
- Takes as a hint: `num_poses` and the confidence thresholds. Nothing about the guitar.
- Hands off to: not tried.

**OpenCV 5.0.0, `opencv-contrib-python` 5.0.0.93** ([repo](https://github.com/opencv/opencv)). Edge, line and perspective functions written as fixed rules, with no trained model.
- In: R3a_cu frames 150, 0 and 280 (640x480) and R3b frames 225, 0 and 449 (1920x1080). The four corners of the neck were set by hand on one frame of each clip and reused on the other two.
- Command or settings: `Canny(50, 150)` for edges, then two line finders. Hough is `HoughLinesP(rho=1, theta=pi/180, threshold=30, minLineLength=20, maxLineGap=5)`. LSD, OpenCV's line segment detector, ran with default parameters. Both ran before and after `getPerspectiveTransform` and `warpPerspective` straighten the neck into an 800x116 rectangle (R3a_cu) or a 1200x130 one (R3b). For R3b: `run_opencv_lines.py <outdir> --clip R3b --frames 225,0,449 --quad 1262,25,1340,130,290,765,245,635 --size 1200,130`.
- Out: line segments as x1, y1, x2, y2 in pixels, a 3x3 matrix that straightens the neck, and the counts and clusters of "string-like" and "fret-like" lines in `opencv_lines.json`. In OpenCV 5 `HoughLinesP` returns shape `(N, 4)`, where 4.x returned `(N, 1, 4)`. On straightened R3a_cu frame 150, LSD gave 11 fret clusters and Hough 6, and none fell where the hand covers the neck. LSD gave 4 string clusters and Hough 3, not 6. On straightened R3b frame 225, LSD gave 16 fret clusters and 7 string clusters, Hough 13 and 4. By eye on the overlay, one LSD fret cluster sits on the edge of a finger, and the fret wires about 120 and 228 px from the nut in the straightened picture, left of the fingers, weren't counted as frets.
- Time: R3a_cu 1.91 s wall for all three frames, 94.1 MB peak (r0149). R3b 3.96 s, 164.4 MB (r0214). These light runs had no CPU slot or core pinning (`--nolock`).
- Takes as a hint: the four corners and every threshold above.
- Hands off to: the fingertip step, run on one frame of each clip. My agents' script fitted the standard fret spacing to the fret lines right of the hand. That spacing is 12-TET, where each fret is one semitone, one piano key, higher. The script split the neck into six equal string lanes, with string 6, the thickest, on top. Then it put each MediaPipe fingertip in a cell. The string rule was an assumption, not checked against string thickness. The fit's RMS residual, the typical gap between fitted and found frets, was 5.04 px on R3a_cu and 3.52 px on R3b.
  - R3a_cu frame 150 (r0218, 0.39 s): index string 4 fret 2, middle string 6 fret 4, ring string 4 fret 4, pinky string 2 fret 4. The thumb landed on the neck's bottom edge at string 1 fret 3. My agents noted that a classical player's thumb is normally behind the neck, so that cell isn't a pressed note. Nobody checked it.
  - R3b frame 225 (r0402, 0.8 s): index string 4 fret 3, middle string 5 fret 4, ring and pinky string 2 fret 5. The thumb landed outside the fretboard. Counting the fret wires from the nut by eye puts each finger one fret lower. With no answer to check against, which count is right is open.

**OpenPose hand model, PyTorch port pytorch-openpose at commit 5ee71dc** ([repo](https://github.com/Hzzone/pytorch-openpose)). OpenPose's 21-point hand network, converted from CMU's Caffe model to PyTorch.
- In: 30 hands from every 10th frame of R3a_cu, 10 from every 30th frame of R3a_cu and 21 from every 30th frame of R3a. Each is a square cut around MediaPipe's 21 points, with a side 1.5 times the longer side of their box.
- Command or settings: each crop scaled to a 368-px box at scales 0.5, 1.0, 1.5 and 2.0, stride 8, heatmap threshold 0.05 after a Gaussian blur with sigma 3, script `scripts/run_openpose_hand.py`. The weights, the trained model file, are `hand_pose_model.pth` (147,341,049 bytes). OpenPose's own C++ mirrors left-hand crops (in `handExtractorCaffe.cpp`) and the port doesn't, so the later runs used `--mirror-left`.
- Out: per hand 21 points as x, y and a peak value, in frame pixels and MediaPipe's order. Not mirrored (r0336): 13.4 of 21 points found per hand on average, and a median distance of 52.52 px from MediaPipe's point for the same joint. Mirrored, R3a_cu: 19.5 of 21 found, 4.68 px. R3a, with the left-hand crops mirrored (20 of the 21 hands): 9.29 of 21 found, 2.74 px, and 3 of the 21 hands with no point found. The R3a hand boxes were 41-93 px wide.
- Time: r0336 took 519.06 s wall for 30 hands and 1088.1 MB peak, after waiting 1800.7 s for a free slot. The model averaged 17.161 s a hand. Mirrored R3a_cu 202.43 s for 10 hands, 1101.3 MiB (step of group run r0448).
- Takes as a hint: hand boxes from another detector, and `--mirror-left`. Nothing about the guitar.
- Hands off to: it took MediaPipe's boxes in. Its points weren't fed further.

**OWLv2 base, on a public demo page** ([model](https://huggingface.co/google/owlv2-base-patch16-ensemble)). Google's open-vocabulary detector: it draws boxes around whatever words you give it. The demo page is merve/owlv2 on Hugging Face, a site that hosts AI models.
- In: three 640x480 PNG stills, R3a_cu frame 150 and R3a frames 100 (medium shot) and 300 (wide shot), sent with `gradio_client` 2.7.2. The model ran on Hugging Face's machine because its 619,918,824-byte weights were over the 200 MB cap.
- Command or settings: `text_queries="guitar neck, fretboard, headstock, capo, hand"`, `score_threshold=0.1`.
- Out: an `AnnotatedImage`, one mask image and one label per box, with no `score` field. A headstock is the end of the neck that holds the tuning pegs. A capo is a clamp across the strings that raises every note. Boxes for guitar neck, fretboard, headstock, capo and hand: R3a_cu frame 150 gave 4, 2, 0, 2 and 1. R3a frame 100 gave 2, 2, 0, 3 and 0. R3a frame 300 gave 5, 1, 0, 10 and 0. There's no capo on the guitar in these frames. On R3a_cu frame 150 the "hand" box is (417,170)-(565,345), and MediaPipe's 21 fretting-hand points there span x 423.57-546.70, y 177.72-322.99.
- Time: 19.67, 18.54 and 25.30 s per image, network included, not the box's CPU (r0193). It needed no login.
- Takes as a hint: the text queries and `score_threshold`.
- Hands off to: not tried. The `transformers` version returns boxes as `(xmin, ymin, xmax, ymax)`, the xyxy format rtmlib takes as `bboxes`.

**rtmlib 0.0.16 with RTMPose hand** ([repo](https://github.com/Tau-J/rtmlib)). A small library that runs OpenMMLab's RTMPose models through ONNX Runtime 1.31.1. Its hand setup is an RTMDet-nano hand detector plus the RTMPose-m 21-point hand model.
- In: R3a full and crop, R3a_cu full and 2x, R3b and R3c, as numpy BGR frames.
- Command or settings: `rtmdet_nano_8xb32-300e_hand-267f9c8f.onnx` (4,010,667 bytes), then `rtmpose-m_simcc-hand5_pt-aic-coco_210e-256x256-74fb594_20230320.onnx` (55,080,248 bytes), called as `model.det_model(img)` and then `model.pose_model(img, bboxes=...)` through the same script with `hand`. A hand counts when the mean of its 21 values in `scores` is 0.3 or more.
- Out: `keypoints` (hands x 21 x 2, in pixels) and `scores` (hands x 21), with no left or right label. R3a full: the detector gave a box in 148 of 540 frames (147 of 319 medium, 1 of 221 wide), and 0, 1 and 2 hands came out in 465, 75 and 0 frames. R3a crop: boxes in 536 of 540 frames, and 350, 150 and 40. R3a_cu: 32, 231 and 37. R3b: 25, 413 and 12. R3c: 22, 392 and 35, plus 1 frame with more than 2.
- Time: R3a full 77.00 s wall, 237.5 MiB, 127.07 ms a frame. R3c 80.83 s, 256.8 MiB. Steps of group run r0408. Not 2-core times.
- Takes as a hint: boxes (`bboxes`), `det_input_size`, `pose_input_size`, `backend`, `device`. When the detector finds no box, rtmlib uses the whole image as the box. Those outputs weren't counted.
- Hands off to: not tried. Its keypoints reshaped to `(21, 1, 2)` are what `cv2.perspectiveTransform` takes.

**RTMW-x-l, through rtmlib 0.0.16** ([project](https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose)). OpenMMLab's 133-point whole-body model, which its README says was `trained on 14 public datasets`.
- In: every 6th frame of R3a (90 frames, full and crop) and every 5th of R3a_cu (60), as numpy BGR frames, after the YOLOX person detector `yolox_m_8xb8-300e_humanart-c2c7a14a.onnx` (101,400,344 bytes).
- Command or settings: rtmlib `Wholebody(mode="performance")` with `rtmw-dw-x-l_simcc-cocktail14_270e-384x288_20231122.onnx` (229,320,930 bytes), the same script with `rtmw`.
- Out: `keypoints` (people x 133 x 2) and `scores`. Its hand values run above 1 (per-hand means 0.96 to 8.76), so every RTMW hand passed the 0.3 rule. R3a full: two hands in 90 of 90 frames. R3a_cu: the right-hand slot passed in 60 of 60 frames, with the picking hand out of the picture.
- Time: R3a full 150.89 s wall, 800.5 MiB, 1622.84 ms a frame. R3a_cu 90.68 s, 790.1 MiB. Steps of group run r0448. Not 2-core times.
- Takes as a hint: `mode` and person boxes (`bboxes`).
- Hands off to: not tried.

**Segment Anything 2.1 tiny, through ultralytics 8.4.209** ([repo](https://github.com/facebookresearch/sam2)). Meta's model that cuts an object out of a picture or a video from a click.
- In: three 640x480 stills, R3a_cu frame 150 and R3a frames 100 and 300, each with 1 to 3 points set by hand. On R3a_cu they sit on the fretboard between the body and the hand. For video mode, R3a_cu frames 150-179 as a 30-frame MP4.
- Command or settings: `ultralytics.SAM` for stills and `ultralytics.models.sam.SAM2VideoPredictor` for video, checkpoint `sam2.1_t.pt` (78,105,722 bytes), points labelled 1 (foreground), video at `imgsz=1024` and `conf=0.25`, script `scripts/run_sam2.py`.
- Out: one mask per point (`results[0].masks.data`, true or false for each pixel) with a `conf` value each. R3a_cu frame 150 with 3 points: 3 masks at 0.8678, 0.8827 and 0.8729, together 27,394 px. By eye they cover the neck from the body to the headstock, broken by the hand, plus specks on the guitar body. R3a frame 100 with 2 points: the visible neck. R3a frame 300 (wide shot) with 2 points: 0.3479 and 0.8135, covering the player from head to feet and part of the guitar, not only the neck. Video mode: 3 masks on every frame, together 25,041 to 26,913 px.
- Time: 668.34 s wall and 1726.3 MiB peak for all six still calls plus the 30-frame video (step of group run r0448). Each still took 5.105-6.068 s. The video took 629.95 s for 30 frames, about 0.05 frames a second.
- Takes as a hint: points (label 1 or 0), boxes (`bboxes=`), `imgsz` and `conf`. No text prompt.
- Hands off to: OpenCV (r0400). The mask's largest piece, turned into a rectangle, became a second neck outline. That piece stops at the hand, so the straightened image starts at the hand, not the nut. LSD then found 13 fret-like and 50 string-like segments in it.

**Ultralytics YOLO26 pose, ultralytics 8.4.209** ([docs](https://docs.ultralytics.com/tasks/pose/)). A person detector with 17 body points per person and no finger points.
- In: R3a full and crop, R3a_cu, R3b and R3c frames. Ultralytics resizes every input to 640 px.
- Command or settings: `model.predict(frame, imgsz=640, conf=0.25, device="cpu")` with `yolo26n-pose.pt` (7,878,574 bytes) or `yolo26s-pose.pt` (24,151,790 bytes). A wrist counts as a hand when its confidence is 0.5 or more.
- Out: `results[0].keypoints.xy` (people x 17 x 2, in pixels), `.keypoints.conf` and `results[0].boxes`. The hands are the two wrist points. yolo26n on R3a full: both wrists in 540 of 540 frames. On wide-shot frame 300 it put the right wrist at (181, 204) with confidence 0.83, on the top edge of the music stand, where the picking hand is hidden. R3a_cu: the left wrist in 300 of 300 frames and the right in 36, with the picking hand out of the picture. R3b: left 450, right 199. R3c: both in 450 of 450.
- Time: yolo26n on R3a full 70.78 s wall, 463.3 MiB, 117.02 ms a frame. yolo26s on R3a full 167.16 s, 538.2 MiB, 292.67 ms a frame. Steps of group run r0448.
- Takes as a hint: `imgsz`, `conf`, `iou`, `classes`, `max_det` and `device`. Nothing about hands or guitars.
- Hands off to: not tried.

**ViTPose-s whole body, through rtmlib 0.0.16** ([repo](https://github.com/ViTAE-Transformer/ViTPose)). A transformer pose model with 133 whole-body points.
- In: every 6th frame of R3a (90 frames, full and crop), every 10th of R3b (45) and every 5th of R3a_cu (60), after the YOLOX person detector.
- Command or settings: `vitpose-s-wholebody.onnx` (97,427,067 bytes) from [easy_ViTPose](https://huggingface.co/JunkyByte/easy_ViTPose) on Hugging Face, the same script with `vitpose`.
- Out: `keypoints` (people x 133 x 2) and `scores`. R3a full: two hands in 90 of 90 frames. R3a_cu: the right-hand slot passed the 0.3 rule in 3 of 60 frames. R3b: 0, 1 and 2 hands in 0, 19 and 26 frames.
- Time: R3a full 112.09 s wall, 498.6 MiB, 1199.29 ms a frame (step of group run r0448). Not 2-core times.
- Takes as a hint: person boxes (`bboxes`), `backend`, `device`.
- Hands off to: not tried.

**YOLOE-26s, ultralytics 8.4.209** ([docs](https://docs.ultralytics.com/models/yoloe/)). An open-vocabulary detector that also outlines each object, with its text prompts read by Apple's MobileCLIP2 text encoder.
- In: eight stills: R3a frames 100, 300 and 500, R3a crop frames 100 and 300, and R3a_cu frames 0, 150 and 280.
- Command or settings: `model.set_classes(PROMPTS, model.get_text_pe(PROMPTS))` with `PROMPTS = guitar, guitar neck, fretboard, headstock, capo, hand`, then `predict(conf=0.05)`. Files `yoloe-26s-seg.pt` (31,072,171 bytes) and `mobileclip2_b.ts` (253,794,476 bytes). The first try failed with `ModuleNotFoundError: No module named 'pkg_resources'`, and installing `setuptools<81` fixed it.
- Out: `results[0].boxes` (xyxy, `conf` and which prompt) and `results[0].masks`, one mask per box. "guitar": 1 box at 0.25 or more on each of the 8 images, with top values from 0.339 to 0.877. "guitar neck", "headstock" and "capo": nothing at 0.05 or more on any image. "fretboard": 0.091 and 0.097 on the two crops. "hand": 0.071 and 0.096 on R3a_cu frames 0 and 150. Those four values are all below 0.25.
- Time: 16.00 s wall and 733.5 MiB, of which 7.52 s was setup and 0.33-0.81 s each image (step of group run r0448).
- Takes as a hint: the prompt list (`set_classes`), `conf`, `imgsz`, and visual prompts (not used).
- Hands off to: not tried.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

"Steps" means my agents wrote me steps to run it somewhere else, and the section numbers point into [for-aaron.md](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/video-hands-fretboard/for-aaron.md). "Survey only" means they read its docs and didn't run it.

- **AllTracker** ([repo](https://github.com/aharley/alltracker)): survey only, and its README doesn't state CPU use. No steps.
- **AnyHand** ([repo](https://github.com/chen-si-cs/AnyHand)): found by the checking agent's web search, README not read. No steps.
- **CLIP ViT-B/32**, the OpenAI text encoder YOLO-World uses in Ultralytics: not downloaded, because its 353,976,522-byte file was over the 200 MB cap on new downloads. No steps of its own (see YOLO-World).
- **EgoHand v1** ([repo](https://github.com/NVIDIA/IsaacCapture)): survey only. Its README lists an NVIDIA GPU (`NVIDIA RTX 6000 Ada, L40, L20, or RTX PRO 6000 Blackwell`) and doesn't state CPU use. No steps.
- **FAH** ([repo](https://github.com/noahcao/FAH)): survey only, added by the checking agent. No steps.
- **Grounded-SAM-2** ([repo](https://github.com/IDEA-Research/Grounded-SAM-2)): survey only. No steps.
- **Grounding DINO** ([repo](https://github.com/IDEA-Research/GroundingDINO)): tried, no output. The tiny model's 689,359,096-byte weights were over the 200 MB cap, and all three calls to its public demo page failed with `ValueError('Unknown protocol: ws')`, in the first try (r0193) and again in the re-run (r0488). Steps: yes, section 4.
- **Hamba** ([repo](https://github.com/humansensinglab/Hamba)): needs the MANO hand model, a 3D model of the hand that these tools fit to the picture, which needs a registered account. Its weights are a Google Drive file. Its install sample is for CUDA 11.7, Nvidia's toolkit for graphics cards, and CPU use isn't stated. Steps: yes, section 2 step 4.
- **HaMeR** ([repo](https://github.com/geopavlakos/hamer)): needs MANO, and the MANO download page redirected the box to a login page. Its README's install example is for CUDA. The demo weights are a Google Drive file or a utexas.edu link, and the box's secure-connection check (TLS) failed on that link. Its web demo showed `BUILD_ERROR` on 2026-11-10. Steps: yes, section 2.
- **HaWoR** ([repo](https://github.com/ThunderVVV/HaWoR)): survey only. It needs MANO left and right, DROID-SLAM and Metric3D weights. Its README says it was tested `with PyTorch 1.13 and CUDA 11.7`. No steps.
- **HOPformer** ([model](https://huggingface.co/Sid2697/HOPformer)): found by the checking agent's web search. It's gated, meaning its page asks you to share your contact details before you can get it, and it wasn't read. No steps.
- **MANO hand model** ([site](https://mano.is.tue.mpg.de)): downloads need a registered account, and the box couldn't log in (`download.php` redirected to `login.php`). Steps: yes, section 2 step 1.
- **manopth** ([repo](https://github.com/hassony2/manopth)): survey only. No steps.
- **manotorch** ([repo](https://github.com/lixiny/manotorch)): survey only. No steps.
- **MediaPipe legacy JS solutions** ([package](https://www.npmjs.com/package/@mediapipe/hands)), `@mediapipe/hands` and `@mediapipe/holistic`: survey only. No steps.
- **ml5.js handPose** ([repo](https://github.com/ml5js/ml5-next-gen)): survey only. No steps.
- **MMPose 1.x** ([repo](https://github.com/open-mmlab/mmpose)): it needs a helper package, mmcv. OpenMMLab's ready-built CPU copies of mmcv were listed for PyTorch 2.4 and 2.1, and the page for PyTorch 2.15 answered 404, not found. My agents' setup had PyTorch 2.15.0+cpu, so MMPose would have needed a second, older PyTorch or a build of mmcv from source. The same disk note that set the 200 MB cap said `never install a second torch or tensorflow version if an existing venv can be reused`. Its `requirements/mminstall.txt` also requires `mmdet<3.3.0`. The same RTMPose, RTMW and DWPose models ran through rtmlib instead. No steps.
- **MobileCLIP2-B** ([card](https://huggingface.co/apple/MobileCLIP2-B)): not run on its own. It ran as YOLOE-26's text encoder. No steps.
- **ONNX Runtime 1.31.1** ([docs](https://onnxruntime.ai/docs/performance/tune-performance/threading.html)): not run on its own, only as rtmlib's backend. `onnxruntime-web` wasn't run, and whether the RTMPose and RTMW files run in it wasn't checked. No steps.
- **OpenPose, the full CMU program** ([repo](https://github.com/CMU-Perceptual-Computing-Lab/openpose)): not built. Its body model, `body_pose_model.pth` at 209,267,595 bytes, was over the 200 MB cap, so only the hand network ran, through the PyTorch port. Steps: yes, section 8.
- **OV-DEIM** ([repo](https://gitee.com/lsreback/OV-DEIM)): found by the checking agent's web search, not read. No steps.
- **RF-DETR** ([repo](https://github.com/roboflow/rf-detr)): found by the checking agent's web search. README, weights and per-model terms not read. No steps.
- **Roboflow Inference** ([repo](https://github.com/roboflow/inference)): survey only. No steps.
- **Roboflow Universe guitar-neck and fret projects** ([one of them](https://universe.roboflow.com/code-and-chords/guitar-necks-detector-ogacd)): every Universe page answered HTTP 403 with a Cloudflare challenge page, the API answered 401 with `This method requires your API key.`, and my agents had no Roboflow key. Steps: yes, section 7.
- **SAM 3D Body** ([repo](https://github.com/facebookresearch/sam-3d-body)): survey only. Its weights are gated. No steps.
- **Sapiens** ([repo](https://github.com/facebookresearch/sapiens)): survey only, CPU use not stated. No steps.
- **Sapiens2** ([repo](https://github.com/facebookresearch/sapiens2)): survey only, added by the checking agent. Its README says it needs Python 3.12 or newer and PyTorch 2.7 or newer, and CPU use isn't stated. No steps.
- **Segment Anything 1** ([repo](https://github.com/facebookresearch/segment-anything)): survey only. No steps.
- **Segment Anything 3 and 3.1** ([repo](https://github.com/facebookresearch/sam3)): the model files on Hugging Face are gated with manual approval, requests without a login got HTTP 401, and my agents had no Hugging Face token. The README also lists a CUDA GPU. Steps: yes, section 3, through a demo page that needs no model access.
- **TAPIP3D** ([repo](https://github.com/zbw001/TAPIP3D)): found by the checking agent's web search, README not read. No steps.
- **TAPIR, BootsTAPIR, TAPNext and TAPNext++** ([repo](https://github.com/google-deepmind/tapnet)): the two BootsTAPIR model files, 218,886,140 and 218,887,028 bytes, and the TAPNext file, 776,980,182 bytes, were over the 200 MB cap. The TAPIR file, 124,348,474 bytes, was under it. The checking agent tried a 4-frame test of it, and the session's permission check, the rule on what code my agents may run, stopped it before it started. CoTracker3 ran as the point tracker instead. Steps: yes, section 6, in Google Colab.
- **TensorFlow.js hand-pose-detection** ([repo](https://github.com/tensorflow/tfjs-models)): survey only. No steps.
- **WeDetect** ([repo](https://github.com/wechatcv/WeDetect)): found by the checking agent's web search, README not read. No steps.
- **WiLoR** ([repo](https://github.com/rolpotamias/WiLoR)): tried, no output. The 3D hand mesh needs MANO, which needs a login. Its hand detector, loaded through Ultralytics, stopped with `ModuleNotFoundError: No module named 'dill'`. Installing `dill` to load the downloaded file was refused by the session's permission check. Steps: yes, section 1, in its Hugging Face demo.
- **WiLoR-mini** ([repo](https://github.com/warmshao/WiLoR-mini)): survey only. The `MANO_RIGHT.pkl` its code downloads from Hugging Face wasn't used, because of the MANO license's `No Distribution` clause. No steps.
- **YOLO-World** ([repo](https://github.com/AILab-CVC/YOLO-World)): `set_classes` needs the CLIP ViT-B/32 text encoder, over the 200 MB cap, and both public demo pages showed errors on 2026-11-10 (`RUNTIME_ERROR` and `BUILD_ERROR`). Steps: yes, section 5.
- **YOLOE, THU-MIG repository** ([repo](https://github.com/THU-MIG/yoloe)): survey only. YOLOE-26 inside Ultralytics ran instead. No steps.
- **Papers and a talk with nothing to run**, no steps for any:
  - Bae, Kwon and Park, UIST Adjunct 2025: no code or data link in the PDF.
  - Burns and Wanderley, NIME 2006: no code link in the text read.
  - Goldstein and Moses, BMVC 2018: the code page reads `Code will be available soon.`
  - GuiFiR, IEEE Access 2026: no code or data link found.
  - Paleari, Huet, Schutz and Slock, 2008: no code link found.
  - TapToTab, arXiv 2409.08618 (arXiv is a research-paper site): no code, data or weights link on its arXiv page.
  - You Just Play / Tabbers, a PyData Tel Aviv 2025 talk: a product, no code release mentioned.
- **Papers named in search results but not read**, no steps for any:
  - Asmar, Séoud and Bilodeau, 2021.
  - Canales and Jörg, year and venue not verified.
  - Duke and Salgian, year and venue not verified.
  - Hrybyk and Kim, year and venue not verified.
  - Kerdvibulvech and Saito, year and venue not verified.
  - "Monocular Biomechanical Tracking of Fingers", arXiv 2605.09258.
  - Scarr and Green, year and venue not verified.
- **Datasets, none downloaded**, no steps for any:
  - Ego-Exo4D needs signed licenses. Its site says `Sign the Ego-Exo4D Licenses, this will take 2 days to be approved`.
  - GAPS.
  - Goldstein and Moses' 2018 GoPro clips.
  - GuiFiR-Synth and GuiFiR-Vid: no link found.
  - Guitar-TECHS: no video in its release.
  - PianoVAM: named in search results, not read.
  - The Ultralytics Hand Keypoints dataset.
  - WHIM.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| CoTracker3 | CC BY-NC 4.0: `Attribution-NonCommercial 4.0 International` ([LICENSE.md](https://raw.githubusercontent.com/facebookresearch/co-tracker/main/LICENSE.md)) | CC BY-NC 4.0, card tag `license:cc-by-nc-4.0` ([card](https://huggingface.co/facebook/cotracker3)) | Kubric, license not recorded |
| DWPose-l | Apache-2.0 | Apache-2.0 on the Hugging Face card yzd-v/DWPose. The run used the ONNX file from download.openmmlab.com, where no separate weights license was found | COCO-WholeBody: `COCO-WholeBody dataset is **ONLY** for research and non-commercial use.` ([README](https://raw.githubusercontent.com/jin-s13/COCO-WholeBody/master/README.md)). UBody: the terms of its download form weren't read |
| MediaPipe Hand Landmarker | Apache-2.0 | Apache 2.0 (model card) | Google's hand page says `The model was trained on approximately 30K real-world images, as well as several rendered synthetic hand models imposed over various backgrounds.` No public dataset or dataset license is named |
| MediaPipe Holistic Landmarker | Apache-2.0 | Apache 2.0 (BlazePose GHUM 3D model card, for the body part) | no public dataset or dataset license named on its model cards |
| MediaPipe legacy Hands 0.10.21 | Apache-2.0 | bundled in the wheel, no separate license read | not recorded by my agents |
| MediaPipe Pose Landmarker (heavy) | Apache-2.0 | Apache 2.0 (BlazePose GHUM 3D model card) | no public dataset or dataset license named on its model card |
| OpenCV 5.0.0 | Apache-2.0 (the contrib modules weren't checked one by one) | none | none |
| OpenPose hand model, PyTorch port | the port's own license wasn't read. OpenPose's license is titled `SOFTWARE LICENSE AGREEMENT ACADEMIC OR NON-PROFIT ORGANIZATION NONCOMMERCIAL RESEARCH USE ONLY` ([LICENSE](https://raw.githubusercontent.com/CMU-Perceptual-Computing-Lab/openpose/master/LICENSE)) | card tag `license: other` on Hugging Face `lllyasviel/Annotators`. Whether OpenPose's license covers these converted weights isn't stated in the text read | the image sets named in the hand paper OpenPose cites, their licenses not read. Which of the paper's models this file is isn't stated |
| OWLv2 base | Apache-2.0 (scenic) | Apache-2.0. The card says `The model is intended as a research output for research communities.` ([card](https://huggingface.co/google/owlv2-base-patch16-ensemble)) | the card's data lines name OWL-ViT and end `(to be updated for v2)`. They say `The CLIP backbone of the model was trained on publicly available image-caption data.` and name COCO and OpenImages for fine-tuning. Their licenses aren't stated on the card |
| rtmlib, RTMPose hand | Apache-2.0 (rtmlib and MMPose) | no separate license found on the README or the download links | COCO-WholeBody `**ONLY** for research and non-commercial use` ([README](https://raw.githubusercontent.com/jin-s13/COCO-WholeBody/master/README.md)), OneHand10K `ONLY for research and non-commercial use` ([page](https://www.yangangwang.com/papers/WANG-MCC-2018-10.html)), FreiHAND and RHD `Any commercial use is prohibited.` ([FreiHAND](https://raw.githubusercontent.com/lmb-freiburg/freihand/master/README.md), [RHD](https://lmb.informatik.uni-freiburg.de/resources/datasets/RenderedHandposeDataset.en.html)), Halpe-FullBody with no license found |
| RTMW-x-l | Apache-2.0 (MMPose) | no separate license found | its hand sets include the ones in the row above, plus InterHand2.6M, `Attribution-NonCommercial 4.0 International` ([LICENSE](https://raw.githubusercontent.com/facebookresearch/InterHand2.6M/main/LICENSE)), and UBody, whose form terms weren't read |
| Segment Anything 2.1 tiny | Apache 2.0 (Meta's SAM 2 code). The run called it through the Ultralytics package, AGPL-3.0 (YOLO26 row) | Apache-2.0 on Meta's Hugging Face cards. The run used Ultralytics' copy, `sam2.1_t.pt` | SA-V, CC BY 4.0 |
| Ultralytics YOLO26 pose | AGPL-3.0, section 13: `if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network (if your version supports such interaction) an opportunity to receive the Corresponding Source of your version` ([LICENSE](https://raw.githubusercontent.com/ultralytics/ultralytics/main/LICENSE)) | no separate weights license file. Ultralytics' license page: `An Enterprise License is required if you want to use Ultralytics YOLO without open-sourcing your entire project.` Its listed triggers include `SaaS platforms, APIs, or cloud systems that use YOLO behind the scenes` ([page](https://www.ultralytics.com/license)). No price is published | COCO-Pose, the COCO terms weren't quoted |
| ViTPose-s whole body | Apache-2.0 | ONNX file from easy_ViTPose on Hugging Face, whose card has no license field | not stated for this file |
| YOLOE-26s | AGPL-3.0, the same Ultralytics terms as the YOLO26 row | `yoloe-26s-seg.pt`: terms not found. YOLOE-26 reads its prompts with Ultralytics' own export of Apple's MobileCLIP2-B, whose license grants use `exclusively for Research Purposes.` and says `“Research Purposes” does not include any commercial exploitation, product development or use in any commercial product or service.` ([LICENSE](https://huggingface.co/apple/MobileCLIP2-B/raw/main/LICENSE)). Which terms Ultralytics applies to its own export of it is unverified | the datasets named on Ultralytics' YOLOE page and in the YOLOE-26 paper, their licenses not read |

Every clause, quoted in full with its link and the date it was read, is in [survey.md](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/video-hands-fretboard/survey.md), in [my agents' research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/video-hands-fretboard).

</details>

<!-- IMAGES -->
Made with Pillow by `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/make_vhf_images.py` (WebP, quality 88). All four are under 1400 px wide and under 150 KB.

1. Source: `/home/user/blog/docs/guitar-tab-research/lanes/video-hands-fretboard/samples/mediapipe-hand-landmarker/R3a_cu_full_f0150.webp` (640x480, MediaPipe Hand Landmarker run r0078). Written: `/home/user/blog/public/media/guitar-tab-tools/video-hands-fretboard-mediapipe-close.webp` (640x480, 26,204 bytes, re-encoded, no crop).
   - Alt: A classical guitarist seen from the chest up, the guitar neck rising to the right. Green lines and white dots trace the fingers of the hand on the neck, labelled Left 1.00.
   - Caption: **One hand, 21 points** / MediaPipe Hand Landmarker on R3a_cu, frame 150 · video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0
2. Source: `/home/user/blog/docs/guitar-tab-research/lanes/video-hands-fretboard/samples/mediapipe-hand-landmarker/R3a_full_f0300.webp` (640x480, run r0071). Written: `/home/user/blog/public/media/guitar-tab-tools/video-hands-fretboard-mediapipe-sheet-music.webp` (crop box x 120-520, y 90-390, enlarged 2x with Lanczos to 800x600, 31,934 bytes). The crop drops the overlay's title line and the frame's edges, and keeps both detections and their labels.
   - Alt: A seated guitarist on a stage behind a black music stand. Green and white hand points sit on her hand on the guitar neck, labelled Left 1.00, and a second set sits on white sheet music hanging from the stand, labelled Left 0.54.
   - Caption: **A second "hand" on the sheet music** / the same tool on R3a's wide shot, frame 300, enlarged detail · video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0
3. Source: `/home/user/blog/docs/guitar-tab-research/lanes/video-hands-fretboard/samples/handoff/handoff_R3a_cu_f0150_rectified.webp` (800x232, written by run r0218 at 21:32:48 UTC, copied to samples at 21:32:56). Written: `/home/user/blog/public/media/guitar-tab-tools/video-hands-fretboard-fingertips-r3a-cu.webp` (800x232, 18,118 bytes, re-encoded, no crop). Uses `<figure class="wide">`, the documented ao-compare way to span a row at the picture's own ratio.
   - Alt: A straightened close-up of a guitar neck with four fingers pressing strings. Magenta vertical lines mark frets, cyan ticks along the top count frets 0 to 11, and green dots on the fingertips read index s4 f2, middle s6 f4, ring s4 f4, pinky s2 f4 and thumb s1 f3.
   - Caption: **Fingertips to string and fret, R3a_cu** / frame 150, the neck straightened from four corners set by hand. Magenta: frets found by OpenCV, a library of image functions. Cyan: fret numbers from a spacing formula fitted to them · video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0
4. Source: `/home/user/blog/docs/guitar-tab-research/lanes/video-hands-fretboard/samples/handoff/handoff_R3b_f0225_rectified.webp` (1200x260, run r0402). Written: `/home/user/blog/public/media/guitar-tab-tools/video-hands-fretboard-fingertips-r3b.webp` (1200x260, 19,768 bytes, re-encoded, no crop). Also `<figure class="wide">`.
   - Alt: A straightened close-up of another guitar neck with four fingertips marked by green dots: index s4 f3, middle s5 f4, ring s2 f5, pinky s2 f5. Magenta lines mark the fret-like lines OpenCV found: one at the nut, one along the edge of a finger at the ring fingertip, and the frets right of the hand. Cyan ticks count frets 0 to 19, and two pale fret wires left of the fingers have no magenta line.
   - Caption: **Fingertips to string and fret, R3b** / frame 225, same steps. Counting the metal fret wires by eye from the nut, where the fretboard ends by the tuning pegs, gives one fret lower for each finger. Which count is right isn't known · video CC0, from archive.org

Credit for the assembler: pictures 1 to 3 are CC BY-SA 4.0 derivatives (trials.md, "Media kept outside git": "R3a and R3a_cu overlays are CC BY-SA 4.0 derivatives of the archive.org concert video"). Full attribution from the shared manifest: "Crescendo 313 - DRH - Meredith Connie Solo Classical Guitar - Part II", Mark Andersen / Seattle Community Media, archive.org item scm-422828-crescendo313-drh-meredithconn, CC BY-SA 4.0, https://archive.org/details/scm-422828-crescendo313-drh-meredithconn . Picture 4 comes from R3b, "Brylie Christopher Oxley Guitar 2018-10-06", archive.org item BrylieChristopherOxleyGuitar20181006, CC0 1.0 (no attribution required). If the post carries one credits line for all lanes, the per-caption credits can move there.

<!-- PENDING MEDIA -->
All four exist (checked with ls and ffprobe on 2026-11-10). H.264, no audio. Made by drawing run r0227 (R3a_cu, R3a) and by steps `overlay-video_R3b_mediapipe` and `overlay-video_R3c_mediapipe` of group run r0408 (R3b, R3c).

1. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3a_cu_mediapipe_hands.mp4`: R3a_cu with MediaPipe Hand Landmarker's landmarks drawn (output of r0078). 10.01 s, 925,707 bytes, 640x480. CC BY-SA 4.0 derivative.
2. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3a_mediapipe_hands_full.mp4`: R3a full frame with MediaPipe Hand Landmarker's landmarks (output of r0071). Shows the detection on the sheet music in the wide shot. 18.02 s (ffprobe 18.018 s), 927,653 bytes, 640x480. CC BY-SA 4.0 derivative.
3. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3c_mediapipe_hands_960.mp4`: R3c at 960x540 with MediaPipe Hand Landmarker's landmarks on both hands (group C1 output). 18.00 s, 940,447 bytes. R3c is CC BY 3.0, "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb, via Wikimedia Commons.
4. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3b_mediapipe_hands_960.mp4`: R3b at 960x540 with MediaPipe Hand Landmarker's landmarks (group C1 output), where the picking-hand fingers at the left edge are never found. 18.00 s, 1,608,746 bytes. CC0.

Left out: `/home/user/gtr/lanes/video-hands-fretboard/out/sam2/R3a_cu_f150-179.mp4` (1.00 s, 395,005 bytes) is the 30-frame input given to SAM 2.1 video mode, not an output.

<!-- NUMBERS -->
Sources: VHF = /home/user/blog/docs/guitar-tab-research/lanes/video-hands-fretboard/. T = VHF/trials.md, S = VHF/survey.md, J = VHF/tools.json, F = VHF/for-aaron.md, I = VHF/inputs.md, M = /home/user/gtr/inputs/INPUTS.md, E = /home/user/blog/docs/guitar-tab-research/ENVIRONMENT.md, L = /home/user/gtr/ledger/runs.jsonl, ST = VHF/samples/steps/{B1,C1}.steps.times.tsv. No gtr-eval ids exist for this lane (T, verification log: "this lane has no gtr-eval numbers and no ground truth").

Counts and clips
- 74 tools, papers and datasets: J, length of `tools` (kinds: 44 research-model, 12 open-source, 9 dataset, 8 library, 1 commercial-app).
- 15 gave output: J entries with output, 14 `tried_how: local-cpu` (MediaPipe Hand, Holistic, Pose, legacy Hands, rtmlib hand, RTMW, DWPose, ViTPose, YOLO26 pose, pytorch-openpose hand, SAM 2.1, CoTracker3, OpenCV, YOLOE-26) plus OWLv2 `tried_how: public-space`. Grounding DINO and WiLoR were tried with no output. Gap round 2 set both to `tried: false` in J and kept the attempts in `runs` (J not_run_reason), so J now has exactly 15 entries with `tried: true` (14 local-cpu, 1 public-space). Both are in the didn't-run block as "tried, no output".
- Didn't-run block: 37 tool lines, plus 13 papers and the talk (14 items: 6 papers and the talk in the first sub-list, 7 named-but-not-read papers in the second), plus 8 datasets = 59. 59 + 15 = 74.
- R3a 18 s, 540 frames, 640x480, cuts at frames 218 and 439, 319 medium and 221 wide frames: T header, I "Shot boundaries", M R3a row.
- R3a_cu 10 s close shot, 300 frames, 640x480, picking hand not in frame: I table ("10.010 s video (300 frames)"), T header.
- R3b, R3c 18 s, 1920x1080, 450 frames: T header, M rows. "closer views": I and T. R3c "both hands visible": M R3c row.
- All nylon-string, played with the fingers: M Caveats ("R3a, R3b and R3c are all nylon-string guitars played with the fingers").
- No ground truth for any clip: T header, M.
- Crop: 3x box on R3a, 2x whole frame on R3a_cu: T "Modes", I.
- Frame decode commands `ffmpeg -i <clip>.mp4 -vsync 0 <dir>/%04d.png` and JPEG `-q:v 2`: T header.
- 2 of 4 cores, rtmlib exception, CPU/wall 2.31: T header and rtmlib "Cores", J rtmlib unverified. "4 vCPU": E.
- Local runs cost nothing beyond the cloud session itself: E "Cost".
- Checking agent (T's "verifier") re-runs, same outputs, different times, CoTracker3 0.74 s vs 1.47 s a frame, other jobs on the box both times: T verification log (r0495, r0497 table and the "Times in the re-runs differed" line: "the box was shared with other lanes' jobs in both cases").
- "Wall" is time on the clock: T header ("Wall" is the gtr-run wall clock of the whole command). Group run sentence: T "Box load" (several runs grouped into one gtr-run job, the group's run id in the ledger) and "Grouped jobs".
- 200 MB cap paragraph: T "Grounding DINO (tiny), OWLv2 (base) and YOLO-World v2: NOT RUN HERE (disk)" (the disk notice: "start no new download or install over 200 MB unless your lane cannot finish without it", from about 21:12 UTC by the trial agent's record, not confirmed by the verifier, and `mobileclip2_b.ts` file time 21:14:08 UTC, before or after the notice UNVERIFIED), T rtmlib model-table note (RTMW file time 21:06 UTC, the 21:12 UTC record "a time the verifier could not confirm"), T header ("to free shared disk"). This answers checker problem 7: the RTMW and MobileCLIP2 files are over 200 MB yet ran.
- "13 of these 15 tools" re-run, "all but RTMW and ViTPose": counted from T's verifier re-run table (r0482-r0486 OpenCV and handoffs, r0488 OWLv2, r0495 MediaPipe Hand, legacy Hands, Holistic, Pose, rtmlib Hand, DWPose, yolo26n-pose, YOLOE-26s, r0497 OpenPose hand, SAM 2.1 image mode, CoTracker3) and J `runs` (no verifier run for RTMW or ViTPose).
- "the four that ran through rtmlib": rtmlib RTMPose hand, RTMW, DWPose, ViTPose (J entries 7-10, each with the "not a 2-core time" unverified note). "2.31 seconds of processor time for each second on the clock, more than 2 cores can give": T rtmlib "Cores" (CPU / wall reaches 2.31 in `rtmlib-hand_R3a_crop_rerun_detcount`, "above the 2.0 that 2 cores allow"), threads on the other slot's cores: same bullet.
- Glosses are plain definitions, not lane facts: ffmpeg, wall, checkpoint, weights, `segm_mask`, Hugging Face, demo page (a Hugging Face Space), OpenCV, LSD, Hough, Canny, 12-TET, semitone, string 6 (the thickest), nut, headstock, capo, picking hand, MANO, CUDA, TLS, gated, permission check, arXiv.

Section and rundown
- MediaPipe R3a_cu one hand in 300 of 300: T MediaPipe table r0078, r0087. R3c two hands in 450 of 450: T C1 table "0 / 0 / 450".
- 215 of 221 wide-shot frames with a "hand" on the sheet-music spot: T "Where the R3a detections landed" (wide: elsewhere 215, frames) and the note on the 20-px cell (340-360, 260-280), frame 300 by eye. J MediaPipe Hand r0071 metrics.
- Fingertip cells on one frame each, corners set by hand, one fret apart on R3b: T "Worked handoff" (r0218, r0402), J OpenCV unverified ("The neck quad was set BY HAND for every run"), F section 9. "which is right isn't known": T R3b handoff ("which is right is UNVERIFIED (no ground truth ...)").
- Rundown "reported one hand in all 300 frames of a close shot where only the hand on the guitar's neck is in view": T r0078 (0 / 300 / 0), I R3a_cu row ("fretting hand on the neck ..., picking hand not in frame"). "Reported" because T checked that it is the fretting hand only by eye on frames 0, 150 and 280.
- "My agents had no record of what was played in any of them": M R3a, R3b, R3c rows ("No ground truth"). Worded this way, not "none comes with a record", because M's R3c row says its file description links a guitar tab that "was not downloaded or used". R3a_cu "only the fretting hand in view": I table.

CoTracker3
- commit 82e02e8, frames 150-239, 90 frames, 3.0 s, tensor `(1, 90, 3, 480, 640)`, 8 points: T CoTracker3 section. J version.
- `CoTrackerPredictor(checkpoint=..., offline=True, window_len=60)`, torch.hub route refused by the proxy, clone on `sys.path`: T CoTracker3 "Install". J inputs.
- `scaled_offline.pth` 101,890,938 bytes: T, J version.
- Neck points visible 90 of 90, largest distance 4.34, 3.85, 3.77, 4.10 px (range 3.77 to 4.34): T table, J metrics.
- Wrist 98.17 px, index_mcp 66.43 px, visible 90: T table. index_tip 16 of 90, middle_tip 73 of 90: T table, J unverified.
- By eye frame 239: T ("the four neck points are still on the neck, and the wrist and index_mcp points are on the hand").
- 136.52 s wall, 132.43 s tracking, 1.47 s per frame, 8,813,832 kB (8.4 GiB): T run line, ST B1. Group run r0448: T grouped jobs. Note: gap round 2 corrected the unit in both places, so J now has peak_mb 8607.3 with unit "MiB (8,813,832 kB, 8.4 GiB)" and T's grouped table "8607.3 MiB" (T: "corrected in gap round 2: the two peak values are MiB"). I used the kB figure from T.
- "CoTracker3 marked ... visible": the counts are its own `pred_visibility` flags (T output facts: booleans). "Nothing records where these points really were": T ("There is no ground truth for these tracks"). J lists the index_tip 16 and middle_tip 73 line under unverified, so the post now gives it as the tool's flag.
- Hints `queries`, `grid_size`, `segm_mask`: J constraints_accepted, T output facts.
- `findHomography` handoff, not run: J handoffs_out (evidence: survey.md Handoff fact 6, and "not run as a handoff in the trials"), S Handoff fact 6 ("a template of the neck's points in frame 0 against their tracked positions in frame t), keeping a fretboard mapping through camera or guitar motion"), given as my agents' notes.

DWPose-l
- 133 points, body, feet, face, hands (21 each): S MMPose section ("133 keypoints (17 for body, 6 for feet, 68 for face and 42 for hands)").
- every 6th frame of R3a 90 frames, every 5th of R3a_cu 60 frames, YOLOX first: T rtmlib section, J runs.
- Script line `scripts/run_rtmlib.py <clip> <full|crop> <hand|rtmw|dwpose|vitpose> <outdir> [step]`: T rtmlib "How the script calls it".
- Model file name and 134,399,323 bytes: T rtmlib model table.
- 0.3 mean rule: T rtmlib.
- Points 91-111 and 112-132: T output format facts.
- 2 hands in 90 of 90 on R3a full incl. wide shot, picking hand behind the stand: T ("Whole-body models output both hands ...").
- Right hand passed 0.3 in 15 of 60 on R3a_cu: T rtmlib.
- 124.90 s, 577.2 MiB, 1340.44 ms: T table, ST B1 (591080 kB). R3a_cu 62.18 s, 575.2 MiB: T table, ST B1 (589024 kB).
- Hints bboxes, backend, device: J constraints_accepted.

MediaPipe Hand Landmarker
- 1.2.2, `hand_landmarker.task` 7,819,105 bytes: T MediaPipe section. Settings `running_mode=VIDEO`, `num_hands=2`, three thresholds 0.5: T settings line. Script line: T.
- `mp.Image` SRGB uint8: T input format facts.
- Output fields handedness, hand_landmarks, hand_world_landmarks: T output format facts.
- R3a_cu 300 of 300, Left every time (Left 300), full and 2x: T table r0078, r0087.
- R3b 5 / 445 / 0, picking-hand fingers never detected: T R3b/R3c table and note. R3c 0 / 0 / 450, Left at neck (1679, 591), Right at sound hole (966, 901): T note.
- R3a full 1 / 267 / 272: T table r0071. Medium fretting 318 of 319, picking 54: T regions table. Wide elsewhere 215, 20-px cell = sheet music on frame 300: T. Crop mode 9 wide-shot detections in the cell just above: T (verifier addition).
- Excerpt text block: J MediaPipe Hand r0078 `frame150_excerpt`, verbatim.
- Times: r0078 14.29 s, 211.3 MB, 32.56 ms. r0071 27.83 s, 224.6 MB. R3b 22.43 s, 254.9 MiB. R3c 21.53 s, 258.3 MiB: T tables, L (r0071, r0078), ST C1 (261040 and 264548 kB).
- No region-of-interest option: T constraint inputs. Docs quote `Passing a horizontally mirrored image will invert these outputs.`: T labels bullet (docs page), S MediaPipe output.
- Handoff `(N, 1, 2)` to `cv2.perspectiveTransform`, runs r0172, r0218, r0402, boxes to OpenPose: J handoffs_out, T worked handoff.

MediaPipe Holistic
- 33 / 478 / 21 / 21: T Pose and Holistic "What they are". `holistic_landmarker.task` 13,683,609 bytes: T. Script: T.
- No handedness value ("Holistic returns no handedness `score`"): T settings. R3a full pose 540 of 540, 13 / 439 / 88, wide left_hand 220 of 221, right none, wide elsewhere 0: T table and notes.
- R3a_cu 300 of 300, R3c left 450, right 440: T table.
- Error text block: T Holistic crop bullet, a contiguous part copied from "RET_CHECK failure (" to "(660 vs. 720)".
- Times 31.57 s, 307.2 MiB, 48.24 ms. 18.53 s, 308.6 MiB. 39.31 s, 405.5 MiB. Crop 15.14 s, exit 1: T table, J runs, ST C1.
- Needs constant frame size: T ("Input fact: in VIDEO mode Holistic needs a constant frame size"). "the run left every option at its default": T settings ("Holistic: default options").

MediaPipe legacy Hands
- 0.10.21, in none of 0.10.30 to 1.2.2 checked: T legacy section (verifier list). Constructor line and "all five equal the defaults": T. Install command: T legacy "Install".
- Output fields: T output format. R3a_cu 300 of 300 (Right 300): T table. R3b 5 / 439 / 6: T. The 6 two-detection frames: T R3b bullet (frames 434-444, all 12 wrists at x 1189.8-1273.3 px, "the fretting-hand area", the picking hand at x < 300, "which of the two is a second detection of the same hand was not checked"). R3c 0 / 0 / 450: T. R3a full 1 / 296 / 243, wide elsewhere 135 in the sheet-music cell: T.
- Mirrored-selfie assumption, fretting hand "Right" on R3a_cu, R3b, R3c vs "Left" with Tasks API: T handedness bullet. Docstring quote: T, J constraints_accepted.
- Times 11.39 s, 270.0 MiB. 23.20 s, 279.9 MiB. 21.80 s, 306.8 MiB: T table, ST C1.

MediaPipe Pose (heavy)
- 33 points, three hand points per side, no finger joints: T. `pose_landmarker_heavy.task` 30,664,242 bytes: T. `num_poses=1`, 0.5 thresholds, visibility >= 0.5 rule: T settings.
- Pose 540 of 540, left 532, right 399, wide right wrist 80 of 221: T table ("wrist vis. >= 0.5: left 532, right 399") and per-shot line. Worded as the `visibility` value reaching 0.5, the run's counting rule, not as the wrist being in view. Picking hand behind the music stand in the wide shot: T "Where detections landed (R3a)" (by eye, frame 300).
- 43.65 s, 316.7 MiB, 69.27 ms. Crop 44.33 s, 325.5 MiB: T table, ST C1.

OpenCV
- 5.0.0, `opencv-contrib-python` 5.0.0.93: T OpenCV section.
- Frames 150, 0, 280 and 225, 0, 449, corners by hand, reused: T.
- `Canny(50, 150)`, `HoughLinesP(...)`, LSD defaults: T settings. 800x116 and 1200x130: T. R3b command: T "Run".
- `(N, 4)` vs `(N, 1, 4)`: T install oddity.
- R3a_cu f150 rectified: LSD 11 clusters, Hough 6, none under the hand (x = 100-330), string clusters 4 and 3, "not 6": T.
- R3b f225 rectified: fret clusters Hough 13 / LSD 16, string clusters Hough 4 / LSD 7: T R3b table. Cluster at 389.9 on a finger edge, wires at about x = 120 and 228 not classified: T (both by eye on the overlay, x in rectified px from the nut).
- r0149 1.91 s, 94.1 MB. r0214 3.96 s, 164.4 MB. `--nolock`: T, L.
- Handoff: 12-TET fit, six equal lanes, string 6 on top, not checked against thickness: T worked handoff steps 4-5. RMS 5.04 px (r0218), 3.52 px (r0402): T. r0218 wall 0.39 s, r0402 wall 0.8 s: T, L.
- R3a_cu cells index s4 f2, middle s6 f4, ring s4 f4, pinky s2 f4, thumb s1 f3 at v = 115.3 of 116 (the lower edge), "on a classical guitar the thumb is normally behind the neck, so its projection onto the fretboard plane is not a fretted position (no check was made here)": T result table and note, VHF/samples/handoff/handoff_R3a_cu_f0150.json.
- R3b cells index s4 f3, middle s5 f4, ring s2 f5, pinky s2 f5, thumb outside: T R3b table, VHF/samples/handoff/handoff_R3b_f0225.json. One fret lower by wire count, UNVERIFIED which is right: T, F section 9.

OpenPose hand port
- commit 5ee71dc, converted from CMU Caffe model: T. Box side 1.5 x the longer side: T. Every 10th R3a_cu (30 hands), every 30th R3a_cu (10), every 30th R3a (21): T table.
- Scales 0.5, 1.0, 1.5, 2.0, 368-px box, stride 8, threshold 0.05, sigma 3: T. `hand_pose_model.pth` 147,341,049 bytes: T. OpenPose mirrors the left-hand crop in `src/openpose/hand/handExtractorCaffe.cpp`: T OpenPose "Left hands" bullet. `--mirror-left`: T.
- r0336 13.4 keypoints, 52.52 px. Mirrored R3a_cu 19.5, 4.68 px. R3a 9.29, 2.74 px, 3 of 21 hands none, boxes 41-93 px: T table and notes.
- r0336 519.06 s, 17.161 s per hand, 1088.1 MB, wait 1800.7 s: T, L. 17.161 s is T's "per-hand inference mean" (measured inside the script), not 519.06 / 30 = 17.30 s, so the post now says "the model averaged". Mirrored R3a_cu 202.43 s, 1101.3 MiB: T, ST B1.
- R3a step mirrored 20 of the 21 hands: T table ('"Left" crops mirrored (20 of 21 hands)'). All 10 R3a_cu hands were mirrored: T ("All 10 hands were labelled "Left" by MediaPipe and were mirrored").

OWLv2
- Space merve/owlv2 (called "a public demo page" in the post), `gradio_client` 2.7.2, weights 619,918,824 bytes, 200 MB cap: T OWLv2 section. Inputs R3a_cu f150, R3a f100, R3a f300, 640x480 PNG: T.
- Settings quote: T. Output `AnnotatedImage`, no `score` field: T.
- Counts 4/2/0/2/1, 2/2/0/3/0, 5/1/0/10/0: T table. No capo by eye: T. Hand box (417,170)-(565,345), MediaPipe span x 423.57-546.70, y 177.72-322.99: T.
- 19.67, 18.54, 25.30 s, r0193: T. "These need no login.": F section 4.
- transformers boxes `(xmin, ymin, xmax, ymax)` and rtmlib `bboxes`: S Handoff fact 3, J handoffs_out.

rtmlib RTMPose hand
- 0.0.16, ONNX Runtime 1.31.1: T. Detector and pose file names, 4,010,667 and 55,080,248 bytes: T model table. `model.det_model(img)`, `model.pose_model(img, bboxes=...)`: T.
- R3a full boxes 148 of 540 (147 of 319, 1 of 221), 465 / 75 / 0: T table and note. Crop 536 of 540, 350 / 150 / 40: T. R3a_cu 32 / 231 / 37: T. R3b 25 / 413 / 12: T. R3c 22 / 392 / 35 / 1: T.
- 77.00 s, 237.5 MiB, 127.07 ms. R3c 80.83 s, 256.8 MiB: T table, ST C1.
- Whole-image fallback not counted: T. Hints: J constraints_accepted, T constraint inputs. `(21, 1, 2)`: S Handoff fact 2.

RTMW-x-l
- `trained on 14 public datasets`: S MMPose section (RTMPose README). YOLOX file and 101,400,344 bytes, RTMW file and 229,320,930 bytes: T model table. `Wholebody(mode="performance")`: T table.
- Hand values above 1, per-hand means 0.96 to 8.76, all passed 0.3: T. R3a full 2 hands 90 of 90. R3a_cu right hand 60 of 60: T.
- 150.89 s, 800.5 MiB, 1622.84 ms. R3a_cu 90.68 s, 790.1 MiB: T table, ST B1.

SAM 2.1 tiny
- `sam2.1_t.pt` 78,105,722 bytes, `ultralytics.SAM`, `ultralytics.models.sam.SAM2VideoPredictor`, ultralytics 8.4.209: T. Prompts, label 1, `imgsz=1024`, `conf=0.25`, 30-frame MP4 frames 150-179, script: T. Only the R3a_cu points are described as "on the fretboard between the body and the hand". T gives the R3a frame 100 and 300 points as coordinates only.
- R3a_cu f150 3 masks 0.8678, 0.8827, 0.8729, union 27,394 px. R3a f300 0.3479, 0.8135: T table. By-eye descriptions: T "What the masks cover". Video union 25,041 to 26,913 px, 3 masks every frame: T.
- 668.34 s, 1726.3 MiB: T run line, ST B1 (1767748 kB). Still calls 5.105-6.068 s: T table. Video 629.95 s for 30 frames, about 0.05 frames per second: T.
- r0400: LSD 13 fret-like, 50 string-like, x = 0 at the hand: T SAM handoff bullet.

YOLO26 pose
- ultralytics 8.4.209, 17 points, no finger points: T. `yolo26n-pose.pt` 7,878,574 bytes, `yolo26s-pose.pt` 24,151,790 bytes: T. Predict call: T settings. Wrist >= 0.5 rule: T. Resized to imgsz 640: T.
- R3a full yolo26n 0 / 0 / 540: T table. Frame 300 right wrist (181, 204), 0.83, top edge of music stand: T arm keypoints bullet. R3a_cu left 300, right 36: T. R3b left 450, right 199 frames: T. R3c 0 / 0 / 450: T table.
- yolo26n 70.78 s, 463.3 MiB, 117.02 ms. yolo26s 167.16 s, 538.2 MiB, 292.67 ms: T table, ST B1.
- Hints `imgsz`, `conf`, `iou`, `classes`, `max_det`, `device`: T constraint inputs, J.

ViTPose-s
- `vitpose-s-wholebody.onnx` 97,427,067 bytes, huggingface.co/JunkyByte/easy_ViTPose: T model table. Every 6th R3a 90, every 10th R3b 45, every 5th R3a_cu 60: T table.
- R3a full 2 hands 90 of 90. R3a_cu right 3 of 60. R3b 0 / 19 / 26: T.
- 112.09 s, 498.6 MiB, 1199.29 ms: T table, ST B1.

YOLOE-26s
- Eight stills: T. `set_classes` call and PROMPTS list, `predict(conf=0.05)`: T settings. `yoloe-26s-seg.pt` 31,072,171 bytes, `mobileclip2_b.ts` 253,794,476 bytes: T. `pkg_resources` error and `setuptools<81`: T install facts.
- guitar 1 box >= 0.25 on all 8, top 0.339 to 0.877. guitar neck, headstock, capo nothing >= 0.05. fretboard 0.091, 0.097 on crops. hand 0.071, 0.096 on R3a_cu f0 and f150: T table, J unverified.
- 16.00 s, 733.5 MiB, setup 7.52 s, 0.33-0.81 s per image: T run line, ST B1 (751128 kB).

Didn't-run block
- 200 MB cap, disk notice (named "the 200 MB cap" everywhere now, "on new downloads" at its first mention in this block): T "Grounding DINO, OWLv2 and YOLO-World" section, F intro. "The same disk note that set the 200 MB cap" (MMPose): T MMPose ("the disk notice says ...").
- CLIP ViT-B/32 353,976,522 bytes: T, J entry 38.
- EgoHand GPU quote: J not_run_reason.
- Grounding DINO 689,359,096 bytes, `ValueError('Unknown protocol: ws')`, r0193 and r0488: T OWLv2 section, J. Section 4: F.
- Hamba MANO, Google Drive, CUDA 11.7: T Hamba, J. Section 2 step 4: F.
- HaMeR MANO login redirect, CUDA, Google Drive or utexas.edu TLS failure, BUILD_ERROR on 2026-11-10: T HaMeR, J, F section 2.
- HaWoR quote `with PyTorch 1.13 and CUDA 11.7`: J not_run_reason.
- MANO download.php to login.php: J, T. Section 2 step 1: F.
- MMPose `mmdet<3.3.0`, torch 2.4 or older, torch2.15 index 404, torch 2.15.0+cpu: T MMPose, J. Disk-notice quote `never install a second torch or tensorflow version if an existing venv can be reused`: T MMPose section.
- OpenPose `body_pose_model.pth` 209,267,595 bytes: J, T OpenPose route. Section 8: F.
- Roboflow 403, 401 `This method requires your API key.`: T Roboflow section. Section 7: F.
- Sapiens2 quote `requires Python at least 3.12 and PyTorch at least 2.7`: J not_run_reason, S Tool list.
- SAM 3 gated manual, HTTP 401, no Hugging Face token, CUDA GPU: T SAM 3, J. Section 3: F.
- tapnet checkpoints 218,886,140, 218,887,028, 776,980,182 and 124,348,474 bytes, 4-frame smoke test refused: T TAPIR section, J. Section 6: F.
- WiLoR `ModuleNotFoundError: No module named 'dill'`, permission check refusal, MANO: T WiLoR, J. Section 1: F.
- WiLoR-mini "No Distribution": J, T.
- YOLO-World: RUNTIME_ERROR and BUILD_ERROR on 2026-11-10: J, F section 5.
- Papers and datasets, reasons: J not_run_reason for entries 47-72. Goldstein code page quote `Code will be available soon.`: J. Ego-Exo4D quote: J entry 64, attributed to its site per S ("Access (https://ego-exo4d-data.org/)").
- Named-but-not-read papers: years and venues dropped for Canales and Jörg, Duke and Salgian, Hrybyk and Kim, Kerdvibulvech and Saito, Scarr and Green (S Research section: "years and venues are UNVERIFIED", J entries 56-58 the same, J entry 59 "year and venue are UNVERIFIED"). Asmar, Séoud and Bilodeau 2021 and arXiv 2605.09258 are not marked UNVERIFIED (S "Not covered", J entries 61, 72). Spelling Séoud and Jörg: S (J's names are unaccented, its unverified notes say "survey spells the second author ...").
- "found by the checking agent's web search" for AnyHand, HOPformer, OV-DEIM, RF-DETR, TAPIP3D, WeDetect: S "Not covered" ("Found by the verify pass's searches on 2026-11-10 ... and not surveyed here"). "added by the checking agent" for FAH and Sapiens2: S ("(verify, added)").
- Links added from J url fields: HOPformer (entry 71), MediaPipe legacy JS (entry 4, npm), ONNX Runtime (entry 73, its threading docs page), OV-DEIM (entry 68, gitee), Roboflow Universe (entry 44), easy_ViTPose (T rtmlib model table). CLIP left unlinked: its J url is a weights file, not a home page.
- HaWoR "Its README says it was tested": S HaWoR ('Tested "with PyTorch 1.13 and CUDA 11.7" (README)').
- HaMeR "the box's secure-connection check (TLS) failed on that link": J not_run_reason ("a utexas.edu URL that failed TLS verification from the box (curl: (60) ...)"), T verification log ("the utexas TLS failure (reproduced, TLS not disabled)").
- HOPformer gated gloss: S "Not covered" (page title "You need to agree to share your contact information to access this model").
- MMPose rewrite: T MMPose (CPU wheel indexes for torch 2.4 and 2.1 listed, `.../cpu/torch2.15/index.html` answered 404, venv torch 2.15.0+cpu, "would need a second torch (2.4 or older) or an mmcv source build", the disk notice quote, `mminstall.txt` "mmdet>=3.0.0,<3.3.0").
- tapnet entry name with TAPNext++: J entry 40 name. Two BootsTAPIR files and the TAPNext file: J not_run_reason. "The checking agent tried a 4-frame test ... stopped it before it started": T TAPIR ("Its first command, a 4-frame smoke test, was refused by this session's permission check ... before it started").
- WiLoR "to load the downloaded file": T WiLoR ("the checkpoint is a pickle that needs `dill` to load").

Licenses
- CoTracker3 `Attribution-NonCommercial 4.0 International` (LICENSE.md) and `license:cc-by-nc-4.0`: S CoTracker LICENSE FACTS, J. Note: J puts the README sentence "The majority of CoTracker is licensed under CC-BY-NC, ..." under the LICENSE.md URL. S says that sentence is from the README and LICENSE.md reads "Attribution-NonCommercial 4.0 International". I quoted the LICENSE.md text from S. Kubric license null: J.
- DWPose Apache-2.0, HF `license: apache-2.0`, COCO-WholeBody quote, UBody form not read: S MMPose LICENSE FACTS, J. The Apache-2.0 tag is on HF yzd-v/DWPose (J entry 9 license.weights). The file that ran came from download.openmmlab.com (T rtmlib model table, source column), where "no separate weights license was found on the README or the download links" (S MMPose LICENSE FACTS b).
- MediaPipe Apache-2.0, model cards "LICENSED UNDER Apache License, Version 2.0": S MediaPipe LICENSE FACTS, J. Hand page training-data quote, and "No public dataset name or dataset license is given on either page": S MediaPipe "Training data", J entry 0. Holistic "for the body part": J entry 1 license.weights name ("BlazePose GHUM 3D model card (pose and holistic body part)").
- Legacy Hands weights: J unverified ("No separate license text for the bundled hand models of 0.10.21 was read"). Legacy Hands training data: J entry 3 training_data is empty, so "not recorded by my agents".
- OpenCV Apache-2.0, contrib modules unchecked: S OpenCV LICENSE FACTS.
- OpenPose license title, `license: other`, coverage of the port not stated, port license not read: S OpenPose, T OpenPose section, J unverified.
- OWLv2 Apache-2.0, `license: apache-2.0`, intended-use quote: S OWLv2, J. Training-data cell: S OWLv2 "Card statements" (the CLIP backbone sentence, the OWL-ViT fine-tuning sentence naming COCO and OpenImages, then "(to be updated for v2)"), J unverified ("Training data licenses are not stated on the card beyond the lines quoted ('(to be updated for v2)')").
- rtmlib and RTMW datasets, quotes (substrings of COCO-WholeBody, OneHand10K, FreiHAND, RHD), Halpe none, InterHand2.6M: S MMPose LICENSE FACTS c, J.
- SAM 2 Apache 2.0, HF apache-2.0, SA-V CC BY 4.0: S SAM LICENSE FACTS, J. Ultralytics AGPL-3.0: S Ultralytics LICENSE FACTS.
- Ultralytics section 13 substring, Enterprise quote, SaaS trigger quote, no price published: S Ultralytics LICENSE FACTS, J.
- ViTPose Apache-2.0, easy_ViTPose card no license field: S whole-body section, T rtmlib model table.
- YOLOE AGPL-3.0, weights terms not found, UNVERIFIED which terms Ultralytics applies: S YOLO-World / YOLOE section, J entries 21, 22. MobileCLIP2-B quotes `exclusively for Research Purposes.` and `“Research Purposes” does not include ...` are substrings of the LICENSE text in S (curly quotes kept as in S). "Ultralytics' own export": S ("its own TorchScript export").
- Trained-on cells changed because the sources changed during this repair. Gap round 2 wrote S, T and J between about 00:20 and 00:29 UTC on 2026-11-11 and added training-data text for Holistic and Pose (S "Training data of the Pose and Holistic Landmarkers": "None of the three cards names a public dataset or a dataset license"), the OpenPose hand model (S OpenPose "Hand model training data": image sets named in arXiv 1704.07809, "Which of the paper's detectors is the file OpenPose ships ... is not stated", "The licenses of MPII Human Pose, the NZSL Exercises and the Panoptic Studio data were not read"), ViTPose (S whole-body section: "that `vitpose-s-wholebody.onnx` is converted from that checkpoint is not stated in the files read (UNVERIFIED)") and YOLOE-26s (S "YOLOE-26 weights and training data": Objects365, GQA, Flickr30k, "The licenses of Objects365, GQA and Flickr30k were not read"). Checker problem 25 asked for "not recorded by my agents", which would now be false for those five, so they say only what is safe to say from the new text, with no dataset names added. Only legacy Hands says "not recorded by my agents".
- Not changed here, though gap round 2 adds to them (for the assembler to decide): OpenPose port Code cell (S now: "no license file found" at 5ee71dc), OpenPose Model files cell (S now: the weights' distributor ships CMU's OpenPose license beside the code that downloads them), ViTPose Model files cell (S now: the card's "License" section points to ViTPose's Apache-2.0 LICENSE, its metadata still has no license field), YOLOE-26s `yoloe-26s-seg.pt` (S now: from the `ultralytics/assets` release v8.4.0, whose repository LICENSE is AGPL-3.0, the release page not read), Holistic Model files (S now: the face and hand cards also read Apache 2.0). T also has a new R3c picking-hand onsets section that the post doesn't cover.

Pictures and media
- Image sizes and bytes: measured after writing (Pillow, ls).
- Overlay videos: T "Media kept outside git" table (bytes, durations), ffprobe on 2026-11-10 (R3a full 18.018 s, 960x540 for R3b and R3c), ST C1 (overlay-video steps), L r0227.
- R3c license and attribution: M R3c row. R3b CC0: M R3b row. R3a CC BY-SA 4.0 attribution: M R3a row, I.
