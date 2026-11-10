# video-hands-fretboard: steps for Aaron

Written 2026-11-10 by `try-video-hands-fretboard`, checked and corrected the same day by
`verify-trials-video-hands-fretboard` (log at the end). These are the tools from this lane that did not run on the
research box (no GPU, a shared disk with a 200 MB download limit, no logins, and a session permission check that
refused to run some downloaded code). Each section says where to run it, which clip, which settings and what to send
back. No source read on 2026-11-10 states run times for these tools on these clips, so none are given; the only
limits given are the ones a source states (the ZeroGPU quotas in section 1).

**The clips.** R3a is the shared 18 s concert excerpt (640x480). R3a_cu is a 10 s close shot of the same concert:
there the fretting hand's 21 MediaPipe landmarks span about 123 x 145 px of the 640x480 frame (frame 150), against
about 35 x 44 px in R3a's wide shot (frame 300). Both come from the archive.org item
https://archive.org/details/scm-422828-crescendo313-drh-meredithconn (CC BY-SA 4.0). If the orchestrator has filed
them in your studio library, use those files. Otherwise: open that page, download the file
`crescendo313_2014_09_04_0.mp4` (listed there as "h.264", 175,074,292 bytes), and use 6:40-6:58 (R3a) and
11:22-11:32 (R3a_cu). For the image-only tools use
three stills: a screenshot of R3a_cu at 11:27 (frame 150 of the excerpt), of R3a at 0:03 (6:43 in the full video,
medium shot) and of R3a at 0:10 (6:50, wide shot). R3b and R3c (closer views of two other players, in the shared
manifest since 21:29 UTC) can be used the same way.

**What to send back for every tool** unless the section says otherwise: the output files (images, JSON, video),
screenshots of the settings you used, the tool's version or the page URL, and how long each step took by your clock.

## 1. WiLoR (hand detector + 3D hand mesh) in its Hugging Face demo

1. Open https://huggingface.co/spaces/rolpotamias/WiLoR in a browser (Hugging Face's Space API reported it
   "RUNNING" on "zero-a10g" hardware on 2026-11-10). Hugging Face's ZeroGPU page
   (https://huggingface.co/docs/hub/spaces-zerogpu, read 2026-11-10) lists a daily GPU quota of 2 minutes with "Low"
   queue priority without signing in and 5 minutes with "Medium" priority for a free account.
2. Upload the R3a_cu still (11:27) as "Input image". Leave "Detection Confidence Threshold" at its default, 0.3, and
   press "Submit".
3. Repeat with the two R3a stills.
4. Send back: the "Reconstructions" image and the "Hands Detected" text for each still, and how many seconds each
   run took.
5. Licence note to keep in mind: the WiLoR models are CC BY-NC-ND 4.0 and the MANO hand model they need is for
   "non-commercial scientific research, non-commercial education, or non-commercial artistic projects" only (quoted
   in `trials.md`). Running WiLoR outside this demo needs `MANO_RIGHT.pkl`, which needs a MANO account (step 1 of the
   next section; WiLoR's README: "Create an account by clicking Sign Up and download the models").

## 2. HaMeR or Hamba (3D hand mesh) on a machine with an NVIDIA GPU

The HaMeR web demo showed "BUILD_ERROR" on 2026-11-10 (https://huggingface.co/spaces/geopavlakos/HaMeR). HaMeR's
README gives its install example for CUDA ("This is for CUDA 11.7, but you can adapt accordingly") and does not state
CPU use, so this is for a machine with an NVIDIA GPU, installed by a coding agent from the README. If you want it:

1. Make an account on https://mano.is.tue.mpg.de (Sign Up), accept the licence (it grants a "free of charge right"
   for non-commercial research, education or artistic projects only; quoted in `trials.md`), and download the MANO
   models (`mano_v*_*.zip`). Only `MANO_RIGHT.pkl` is needed.
2. Ask a coding agent on that machine to install HaMeR from https://github.com/geopavlakos/hamer following its README
   (it names CUDA 11.7 as its example), to put `MANO_RIGHT.pkl` in `_DATA/data/mano`, to put the three stills (and,
   for the clip, R3a_cu's 300 frames extracted with `ffmpeg -i R3a_cu.mp4 frames/%04d.png`) in one folder, and to run
   the README's demo command on it: `python demo.py --img_folder <folder> --out_folder demo_out --batch_size=48
   --side_view --save_mesh --full_frame`.
3. Send back: the `demo_out` folder and the run time per image.
4. Hamba (https://github.com/humansensinglab/Hamba) is the same procedure; its weights are a Google Drive download
   linked in its README, and its README's demo command is `python demo.py --checkpoint
   ckpts/hamba/checkpoints/hamba.ckpt --img_folder example_data --out_folder ./demo_out/example_data/ --full_frame`
   (replace `example_data` with the folder of stills).

## 3. SAM 3 (text-prompted segmentation and tracking)

1. Open the demo Space https://huggingface.co/spaces/merve/SAM3-video-segmentation (the Space API reported it
   "RUNNING" on "zero-a10g" hardware on 2026-11-10; the ZeroGPU quotas in section 1 apply).
2. In its "Text Prompting" tab, upload R3a_cu.mp4 under "Upload video". Type `guitar neck` in "Text Prompt(s)",
   press "Apply Text Prompt(s)", then "Propagate across video", then "Render MP4 for smooth playback", and download
   the "Rendered Playback" video. Press "Reset Prompts" and repeat with `fretboard`, `hand` and `capo`. (Labels as in
   the Space's own configuration, read 2026-11-10.)
3. Send back: the four rendered videos, and the time each prompt took from "Apply" to the rendered video. Note
   whether `capo` returned anything (there is no capo in this clip).
4. Only if the model files themselves are wanted (to run SAM 3 elsewhere): sign in to Hugging Face, open
   https://huggingface.co/facebook/sam3 and request access (the model is gated with manual approval; unauthenticated
   downloads answered HTTP 401 on 2026-11-10).

## 4. Grounding DINO and OWLv2 (text-prompted boxes)

These need no login. They did not run on the box itself because their weights (about 690 MB and 620 MB) were over the
disk limit there. OWLv2 did run through the `merve/owlv2` web demo from the box (boxes and labels, but that demo
returns no scores); the Grounding DINO demo could not be called from the box (`Unknown protocol: ws`), so step 1-3
below is the part still missing.

1. Open https://huggingface.co/spaces/merve/Grounding_DINO_demo (RUNNING on "cpu-basic" on 2026-11-10).
2. Upload the R3a_cu still. "Detection Prompt": `guitar neck . fretboard . headstock . capo . hand .` Leave "Box
   Threshold" and "Text Threshold" at their defaults (0.25 and 0.25 in the Space's configuration on 2026-11-10).
3. Repeat with the two R3a stills.
4. Optional (the box already has these): https://huggingface.co/spaces/merve/owlv2 (RUNNING on "cpu-basic" on
   2026-11-10) with the same three stills, `text_queries` = `guitar neck, fretboard, headstock, capo, hand` and
   `score_threshold` 0.1 (its default). This demo shows labels on the boxes but returns no scores.
5. Send back: screenshots of each result with the boxes (and, for Grounding DINO, any scores the page shows), and the
   thresholds used.

## 5. YOLO-World

Its two public demo Spaces showed errors on 2026-11-10 (stevengrove/YOLO-World: RUNTIME_ERROR; SkalskiP/YOLO-World:
BUILD_ERROR; Space runtime API). On your own machine a coding agent can run it with Ultralytics in a few lines (`YOLO("yolov8s-worldv2.pt")`,
`set_classes(["guitar", "guitar neck", "fretboard", "headstock", "capo", "hand"])`); it downloads a 354 MB CLIP text
model the first time. The script this lane wrote for it is `scripts/run_openvocab.py yoloworld <outdir> <weights dir>`
(its `yoloworld` branch has never been run; its `yoloe` branch ran on the box);
it reads decoded frames from the research box's paths (`LANE` and `CLIPS` in `scripts/vhf_common.py`), so the agent
has to decode R3a and R3a_cu to PNG frames first (`ffmpeg -i <clip>.mp4 -vsync 0 <dir>/<prefix>_%04d.png`, as in
`trials.md`) and point those two settings at them. Send back the `results.json` and the `frames/` folder it writes.

## 6. TAPIR / BootsTAPIR / TAPNext (point tracking) in Google Colab

The box did not run any of these: the BootsTAPIR and TAPNext checkpoints are over its 200 MB download limit, and the
original TAPIR checkpoint (124 MB) was downloaded but the session's permission check refused to run the tapnet code
(`trials.md`).

1. Open the "Standard PyTorch TAPIR" Colab linked from https://github.com/google-deepmind/tapnet (README section
   "Colab Demo", which says: "You can also upload your own video and try point tracking with TAPIR."). Pick a GPU
   runtime if Colab offers one.
2. The notebook (`colabs/torch_tapir_demo.ipynb`, read 2026-11-10) downloads the BootsTAPIR checkpoint
   (`bootstap/bootstapir_checkpoint_v2.pt`) and loads its own example video in the cell "Load an Exemplar Video"
   (`media.read_video("tapnet/examplar_videos/horsejump-high.mp4")`). Upload R3a_cu.mp4 to the Colab session's files
   and change that path to the uploaded file, then run the cells in order.
3. In the cell "Select Any Points at Any Frame", click the nut, two frets away from the hand, and the knuckle of the
   index finger, then run "Predict Point Tracks for the Selected Points". (That cell's frame slider is set for the
   50-frame example video: `max:49`.)
4. Send back: the output video with the tracks, and the time the tracking cell took. Do the same with the
   "BootsTAPNext PyTorch" Colab if you have time.

## 7. Roboflow Universe guitar-neck and fret models

1. Make an account on https://roboflow.com (its pricing page, quoted in `survey.md`, lists a "$0 Free Tier") and
   sign in.
2. Open each project page named in `survey.md` (for example
   https://universe.roboflow.com/code-and-chords/guitar-necks-detector-ogacd and
   https://universe.roboflow.com/code-and-chords/guitar-frets-segmenter).
3. Before using one, take a screenshot of the licence shown on the project page.
4. If the page has a "Try this model" or "Deploy" tab with an upload box, upload the three stills.
5. Send back: the licence screenshots, the result screenshots, and the JSON if the page offers it.

## 8. OpenPose (the full CMU program)

The box ran only OpenPose's hand model (a PyTorch port, with hand boxes taken from MediaPipe, left-hand crops mirrored
as OpenPose itself does). The full program finds the hands from its own body model, which the box did not download.

1. Follow "Windows Portable Demo" in OpenPose's installation doc (`doc/installation/0_index.md`, read 2026-11-10):
   update the NVIDIA driver, "Download the latest OpenPose version from the Releases section", then "Follow the
   `Instructions.txt` file inside the downloaded zip file to download the models required by OpenPose (about 500 Mb)".
2. In PowerShell, in the unzipped folder, run it with hand keypoints on (flags from `doc/01_demo.md`:
   `--video`, `--hand`, `--write_json`, `--write_video`), for example
   `bin\OpenPoseDemo.exe --video R3a_cu.mp4 --hand --write_json out\ --write_video out\R3a_cu_openpose.avi`.
3. Send back: the `out\` folder (one JSON per frame) and the output video, plus how long the run took by your clock
   (and any frame rate the program shows).
4. Licence: OpenPose is for non-commercial research use (the docs agent quotes it in `survey.md`).

## 9. Label two frames by hand (this settles a question the box could not)

The box mapped fingertips to (string, fret) cells on two frames, and on R3b two methods disagree by one fret. You can
settle it in a few minutes, no software needed beyond a video player.

1. Open R3b (archive.org item "Brylie Christopher Oxley Guitar 2018-10-06",
   https://archive.org/details/BrylieChristopherOxleyGuitar20181006, file `BrylieChristopherOxley-guitar-2018-10-06.mp4`;
   or the R3b excerpt if the orchestrator has filed it in your studio library) and pause at 3:29 in the full video
   (9.0 s into the R3b excerpt, which starts at 200 s; it is frame 225 of the excerpt at 25 fps).
2. For each fretting-hand finger that presses a string, write down: finger (index, middle, ring, pinky), string (1 = the
   thinnest), fret (1 = the first fret from the nut).
3. Do the same for R3a_cu at 11:27 in the concert video (`crescendo313_2014_09_04_0.mp4`, 5.0 s into the R3a_cu
   excerpt, frame 150).
4. Send back: the two lists, and a screenshot of each paused frame. The box's answers to compare with are in
   `trials.md` ("Worked handoff" section): R3b index string 4 fret 3, middle string 5 fret 4, ring and pinky string 2
   fret 5 (12-TET fit), or one fret lower by the wire count; R3a_cu index string 4 fret 2, middle string 6 fret 4, ring
   string 4 fret 4, pinky string 2 fret 4.

## Verification log (verify-trials-video-hands-fretboard, 2026-11-10)

Checked against the live pages on 2026-11-10: the Space states and hardware (Hugging Face Space runtime API), the
WiLoR, SAM 3, Grounding DINO and OWLv2 Space controls and defaults (each Space's own configuration), the ZeroGPU quota
table, the HaMeR and Hamba README demo commands, the tapnet README and `colabs/torch_tapir_demo.ipynb`, OpenPose's
`doc/installation/0_index.md` and `doc/01_demo.md`, the archive.org file lists of both items, and the frame times
(R3a 400-418 s, R3a_cu 682-692 s, R3b 200-218 s of their sources).

Changed: the clip file is listed as "h.264" on archive.org, not "MPEG4"; "large" replaced with measured hand sizes;
the WiLoR step now names the Space's controls, and the unsourced "may need to sign in / may wait in a queue" is
replaced by the quota table from Hugging Face's ZeroGPU page; "the laptop's GPU and a programmer-level install"
replaced by what the HaMeR README says; HaMeR and Hamba get their README demo commands; the SAM 3 steps no longer
make the demo depend on model access (the Space runs on its own) and name the Space's buttons; the Grounding DINO and
OWLv2 defaults are given and the OWLv2 step says that demo returns no scores; the YOLO-World script note says the
script reads the box's frame paths and was never run in that mode; the TAPIR Colab step no longer says the notebook
asks for a video (it loads its own example; the path has to be changed); OpenPose's "frame rate the program prints"
became "how long the run took"; the R3b source is named exactly, and the studio-library copy is conditional. The
answers to compare with in section 9 were checked against `samples/handoff/*.json`.
