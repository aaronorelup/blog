# video-hands-fretboard: steps for Aaron

Written 2026-11-10 by `try-video-hands-fretboard`. These are the tools from this lane that did not run on the
research box (no GPU, a shared disk with a 200 MB download limit, no logins). Each section says where to run it, which
clip, which settings, about how long, and exactly what to send back. Times and costs are only given where a source
states them; "not stated" means no source read today gave one.

**The clips.** R3a is the shared 18 s concert excerpt (640x480). R3a_cu is a 10 s close shot of the same concert in
which the fretting hand and frets are large. Both come from the archive.org item
https://archive.org/details/scm-422828-crescendo313-drh-meredithconn (CC BY-SA 4.0). If the orchestrator has filed
them in your studio library, use those files. Otherwise: open that page, download the MPEG4 file
`crescendo313_2014_09_04_0.mp4`, and use 6:40-6:58 (R3a) and 11:22-11:32 (R3a_cu). For the image-only tools use
three stills: a screenshot of R3a_cu at 11:27 (frame 150 of the excerpt), of R3a at 0:03 (6:43 in the full video,
medium shot) and of R3a at 0:10 (6:50, wide shot). If R3b or R3c appear in the shared manifest (closer views of other
players), run the same steps on them too.

**What to send back for every tool** unless the section says otherwise: the output files (images, JSON, video),
screenshots of the settings you used, the tool's version or the page URL, and how long each step took by your clock.

## 1. WiLoR (hand detector + 3D hand mesh) in its Hugging Face demo

1. Open https://huggingface.co/spaces/rolpotamias/WiLoR in a browser (it showed "RUNNING" on 2026-11-10; it uses
   Hugging Face's shared "zero-a10g" GPUs, so you may need to sign in to Hugging Face and may wait in a queue).
2. Upload the R3a_cu still (11:27). Keep the default settings and press the run button.
3. Repeat with the two R3a stills.
4. Send back: the result images, and whether each hand was found and labelled left or right. Note how many seconds
   each run took.
5. Licence note to keep in mind: the WiLoR models are CC BY-NC-ND 4.0 and the MANO hand model they need is for
   "non-commercial scientific research, non-commercial education, or non-commercial artistic projects" only (quoted
   in `trials.md`). For anything beyond a test, the MANO account (step 2 of the next section) is needed.

## 2. HaMeR or Hamba (3D hand mesh) on the laptop

Their web demo for HaMeR showed "BUILD_ERROR" on 2026-11-10 (https://huggingface.co/spaces/geopavlakos/HaMeR), so
this needs the laptop's GPU and is a programmer-level install. If you want it:

1. Make a free account on https://mano.is.tue.mpg.de (Sign Up), accept the licence, and download the MANO models
   (`mano_v*_*.zip`). Only `MANO_RIGHT.pkl` is needed.
2. Ask a coding agent on the laptop to install HaMeR from https://github.com/geopavlakos/hamer following its README
   (it names CUDA 11.7 as its example), to put `MANO_RIGHT.pkl` in `_DATA/data/mano`, and to run `demo.py` on the
   three stills and on the R3a_cu clip frame by frame.
3. Send back: the rendered mesh images, the per-hand output files the demo writes, and the run time per image.
4. Hamba (https://github.com/humansensinglab/Hamba) is the same procedure; its weights are a Google Drive download
   linked in its README.

## 3. SAM 3 (text-prompted segmentation and tracking)

1. Sign in to Hugging Face, open https://huggingface.co/facebook/sam3 and request access (the model is gated with
   manual approval).
2. Once approved, open the demo Space https://huggingface.co/spaces/merve/SAM3-video-segmentation (RUNNING on
   2026-11-10, shared GPU).
3. Upload R3a_cu.mp4. Type the prompts one at a time: `guitar neck`, `fretboard`, `hand`, `capo`.
4. Send back: the output video or the masked frames for each prompt, and the time each took. Note whether `capo`
   returned anything (there is no capo in this clip).

## 4. Grounding DINO and OWLv2 (text-prompted boxes)

These need no login. They did not run on the box only because their weights (about 690 MB and 620 MB) were over the
disk limit there.

1. Open https://huggingface.co/spaces/merve/Grounding_DINO_demo (RUNNING on 2026-11-10, CPU).
2. Upload the R3a_cu still. Text prompt: `guitar neck . fretboard . headstock . capo . hand .` Keep the default
   thresholds and write them down.
3. Repeat with the two R3a stills.
4. Open https://huggingface.co/spaces/merve/owlv2 (RUNNING on 2026-11-10, CPU) and do the same three stills with the
   prompts `guitar neck, fretboard, headstock, capo, hand`.
5. Send back: screenshots of each result with the boxes and scores visible, and the thresholds shown on the page.

## 5. YOLO-World

Its two public demo Spaces showed errors on 2026-11-10 (stevengrove/YOLO-World: RUNTIME_ERROR; SkalskiP/YOLO-World:
BUILD_ERROR). On the laptop a coding agent can run it with Ultralytics in a few lines (`YOLO("yolov8s-worldv2.pt")`,
`set_classes(["guitar", "guitar neck", "fretboard", "headstock", "capo", "hand"])`); it downloads a 354 MB CLIP text
model the first time. The script this lane wrote for it is `scripts/run_openvocab.py yoloworld <outdir> <weights dir>`.
Send back the `results.json` and the `frames/` folder it writes.

## 6. TAPIR / BootsTAPIR / TAPNext (point tracking) in Google Colab

1. Open the "Standard PyTorch TAPIR" Colab linked from https://github.com/google-deepmind/tapnet (README section
   "Colab Demo"). It needs a Google account; pick a GPU runtime if Colab offers one.
2. Upload R3a_cu.mp4 when the notebook asks for a video, and run all cells.
3. If the notebook lets you choose points, click the nut, two frets away from the hand, and the knuckle of the
   index finger.
4. Send back: the output video with the tracks, and the time the tracking cell took. Do the same with the
   "BootsTAPNext PyTorch" Colab if you have time.

## 7. Roboflow Universe guitar-neck and fret models

1. Make a free account on https://roboflow.com and sign in.
2. Open each project page named in `survey.md` (for example
   https://universe.roboflow.com/code-and-chords/guitar-necks-detector-ogacd and
   https://universe.roboflow.com/code-and-chords/guitar-frets-segmenter).
3. Before using one, take a screenshot of the licence shown on the project page.
4. If the page has a "Try this model" or "Deploy" tab with an upload box, upload the three stills.
5. Send back: the licence screenshots, the result screenshots, and the JSON if the page offers it.

## 8. OpenPose (the full CMU program)

The box ran only OpenPose's hand model (a PyTorch port, with hand boxes taken from MediaPipe). The full program finds
the hands from its own body model.

1. On https://github.com/CMU-Perceptual-Computing-Lab/openpose open "Releases" and download the Windows portable demo
   for GPU if it is listed (check that it matches an NVIDIA GPU).
2. Follow the README's "Windows portable demo" steps and run it with hand detection on, for example
   `bin\OpenPoseDemo.exe --video R3a_cu.mp4 --hand --write_json out\ --write_video out\R3a_cu_openpose.avi`.
3. Send back: the `out\` folder (one JSON per frame) and the output video, plus the frame rate the program prints.
4. Licence: OpenPose is for non-commercial research use (the docs agent quotes it in `survey.md`).
