# browser-audio-sync: what Aaron can run himself

Written 2026-11-10 by `try-browser-audio-sync`, checked the same day by `verify-trials-browser-audio-sync` (log at the
end). Everything in `trials.md` ran in headless Chromium on a cloud box with no sound card and no GPU (WebGL ran on the
SwiftShader software renderer; WebGPU had no adapter). The steps below repeat or extend those tests in Chrome on a
computer with a sound device and a GPU.

Clips used below: `S1.wav`, `S2n.wav`, `S4.wav`, `R3a.mp4` and `R3b.mp4` from the shared test set. The repository
holds only their manifest and truth files (`docs/guitar-tab-research/inputs/INPUTS.md` says "no audio or video is
copied there"); the audio and video files are in `/home/user/gtr/inputs/<id>/` on the cloud box and, per `PLAN.md`
("Media"), are to be filed in the studio library by the orchestrator. `INPUTS.md` lists the SHA-256 of every audio and
video file, so a copy can be checked. The measuring page in step list 1 needs no clip.

## 1. The measuring page: metronome timing and one in-browser model

Time: the page says the metronome part takes "about 9 min" at 61 s per run ("about 2.5 min in all" at 15 s per run).
On the cloud box the model parts of the same page took 139 s of inference (WebGL on SwiftShader, r0271) and 3.70 s of
session creation plus 6.08 s of inference (ONNX section, WebAssembly, r0313); the CPU backend was not run on this page
there, and took 103 s for S1 in the lane's own Basic Pitch page (r0270). A computer with a GPU will give its own times.

What it repeats: the metronome test of `trials.md` (four ways of making a 120 BPM click, idle and with a busy page),
Basic Pitch in TensorFlow.js on WebGL (your GPU) and on the CPU, and the ONNX copy of Basic Pitch in ONNX Runtime Web on
WebAssembly and WebGPU. The page synthesizes its own test melody (the 62 notes of clip S1), so no clip has to be
downloaded. It uploads nothing (the page's own text: "Nothing is sent anywhere"); it loads Tone.js, Basic Pitch and
TensorFlow.js from the jsDelivr CDN, ONNX Runtime Web (its WebAssembly file is about 29 MB) from jsDelivr, and the
230 KB ONNX model from raw.githubusercontent.com (no cost). In the two tests here (r0271, r0313) it requested nothing
else: 23 jsDelivr files, then 21 files from jsDelivr and raw.githubusercontent.com.

1. Get the file `docs/guitar-tab-research/lanes/browser-audio-sync/for-aaron/browser-timing-check.html` from the
   repository onto the computer (for example from GitHub's "Download raw file" button).
2. Close other heavy programs (renders, games, video calls), so the numbers describe the browser and not a busy
   machine. On a laptop, plug in the charger.
3. Open the file in Chrome (right-click, "Open with", Google Chrome). Keep the tab in front the whole time.
4. Under "1. Metronome timing", choose "61 (as on the cloud box, about 9 min)". Leave "audible" unticked. (Ticked, the
   page also sends the clicks to the speakers through a gain of 0.5; the timing is measured from a recording inside the
   page in both cases. The page was never run with "audible" ticked, since the cloud box has no sound device.) Click
   "Run metronome test" and wait until the status line says "metronome test done". Eight rows appear.
5. Under "2. In-browser model: Basic Pitch", leave "also run the CPU backend (slower)" ticked, click "Run model test",
   and wait for "model test done".
6. Under "3. The same model in ONNX Runtime Web: WebAssembly and WebGPU", click "Run ONNX test" and wait for "ONNX test
   done" (it runs the ONNX copy of the same model on WebAssembly, then on WebGPU if Chrome offers a WebGPU adapter; the
   WebGPU part could not be tried on the cloud box, which has no GPU).
7. Click "Copy to clipboard" and paste the whole text back into the chat. Also send: the power setting the computer
   was on (for example Balanced or Best performance), whether it ran on battery, and the Chrome version
   (chrome://version, first line).

What comes back is JSON: per metronome run the number of clicks found, the mean and largest deviation from the
ideal grid in ms, how many clicks were off the grid and how many were scheduled late, the sample rate, `baseLatency`,
`outputLatency` and the AudioContext's `playbackStats`; per Basic Pitch run the backend, model load time, inference
time, notes found and notes matched to the 62 known notes (onset within 50 ms, same pitch); per ONNX run the execution
provider, session creation time, inference time, the WebAssembly thread count and the same note counts. It also
records the WebGL renderer string (on the cloud box: "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)
(0x0000C0DE)), SwiftShader driver)") and whether WebGPU found an adapter.

If the page stays blank or the status shows an error about modules or CORS: send a screenshot of the page and of
the Console (F12, Console tab). This page was tested here only in headless Chromium with the CDN files served from a
local cache (`trials.md`, "Measuring page"), not over the real CDN and not from a `file://` address.

## 2. Basic Pitch in Spotify's own web demo (about 5 minutes, free)

Not run here: the demo needs a person to drop a file into a web page; this box ran the same library headless
(`trials.md`, Basic Pitch section).

1. Open https://basicpitch.io in Chrome (from this box the address redirected to https://basicpitch.spotify.com/ and
   answered HTTP 200 on 2026-11-10; the npm README of `@spotify/basic-pitch` 1.0.1 calls it "our snappy demo
   website"; its interface was not checked from this box).
2. Drop in clip **S1** (`S1.wav`), then **S2n** (`S2n.wav`), one at a time, with the default settings.
3. Note roughly how long each took from drop to result, and download the MIDI file for each if the page offers one.
4. Send back: the two MIDI files (named `S1_basicpitchio.mid`, `S2n_basicpitchio.mid`), the times, and a screenshot of
   the settings panel (or of the page, if it shows no settings). The MIDI files can be scored against the truth with
   `gtr-eval notes` exactly like the runs here.

## 3. Source separation in the browser on WebGPU (about 10 minutes, free)

Not run here: WebGPU had no adapter in this headless Chromium (`requestAdapter()` returned null, `trials.md`
environment probe). demucs-web ran here on the WebAssembly backend only (see `trials.md`, Demucs section).

1. Open the demucs-rs browser demo, https://nikhilunni.github.io/demucs-rs/ , in Chrome (it answered HTTP 200 from
   this box on 2026-11-10; `survey.md` section 50 quotes its README: it runs "entirely **in the browser** via
   WebAssembly + WebGPU"). Its controls were not checked from this box.
2. Load clip **S4** (`S4.wav`, 38.7 s band mix with known stems), choose the standard 4-stem model if asked, run it, and
   time it from start to finished stems.
3. If the demo offers the 6-stem model (`survey.md` quotes the README listing "6-Stem (adds guitar & piano)"), run S4
   again with it.
4. Download the stems it produces.
5. Send back: the stem WAV files, the times, the model names as the page shows them, and a screenshot. They can be
   scored against S4's stems with `gtr-eval stems`.

## 4. Hand landmarks on a GPU (MediaPipe Tasks Vision in Chrome, about 10 minutes, free)

Not run here on a GPU: this box has no GPU; MediaPipe's GPU delegate ran only on the SwiftShader software renderer
(`trials.md`, MediaPipe section: 3,481 ms per frame on average over 60 frames of R3a, r0314), so those times are
software-rendering times.

1. Open Google's MediaPipe Studio hand landmarker demo, https://mediapipe-studio.webapps.google.com/demo/hand_landmarker ,
   in Chrome. From this box the address redirected to Google's sign-in page (accounts.google.com) on 2026-11-10, so it
   may ask you to sign in with a Google account; its controls were not checked from this box.
2. If it offers a choice of delegate, pick GPU. If it offers to run on a video or image file, use clip **R3b**
   (`R3b.mp4`: per `INPUTS.md` a close view with the neck and the fretting hand fully in frame and the picking hand
   partly cut off at the left edge) and then **R3a** (`R3a.mp4`).
3. Note the frames per second or milliseconds per frame it shows, and whether both hands are found.
4. Send back: screenshots with the landmarks drawn and the speed figures, and the delegate shown. If the demo only
   takes the webcam, say so; a screenshot of the demo tracking hands on a guitar in front of the webcam also works.

## Verification log (verify-trials-browser-audio-sync, 2026-11-10)

- Checked against the page source `for-aaron/browser-timing-check.html`: every button, option and status text named
  in step list 1, the "audible" wiring (`GainNode` 0.5 or 0 after the recorder), the test melody (62 S1 notes) and the
  jsDelivr and raw.githubusercontent.com URLs. Checked against the saved test outputs (`samples/for-aaron-page/`): the
  139 s figure (r0271, TF.js WebGL inference) and the ONNX section's 3.70 s session creation plus 6.08 s inference
  (r0313). The ONNX
  Runtime 1.31.1 WebAssembly files the page can load are 28,747,738 bytes (`asyncify`) and 29,520,971 bytes (`jsep`)
  in the npm tarball.
- Re-checked from this box on 2026-11-10: basicpitch.io redirects to basicpitch.spotify.com (HTTP 200); the demucs-rs
  demo answers HTTP 200 and its README (raw.githubusercontent.com) has both quoted phrases; MediaPipe Studio redirects
  to accounts.google.com.
- Changed: removed the computer's model and GPU (personal detail) and the mention of a specific rendering program;
  named the five clip files and where they are (the repository has no audio or video); replaced "the numbers are the
  same either way" for "audible" with what the page does (it was never run with sound); removed the 88 s CPU figure
  (from smoke run r0170, whose result files no longer exist); made the MIDI download in step list 2 conditional, since
  the demo's interface was not seen; described R3b from `INPUTS.md`; replaced "says nothing about a real GPU" with the
  measured software-rendering figure.
