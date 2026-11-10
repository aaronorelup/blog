# browser-audio-sync: what Aaron can run himself

Written 2026-11-10 by `try-browser-audio-sync`. Everything in `trials.md` ran in headless Chromium on a cloud box with
no sound card and no GPU (WebGL ran on the SwiftShader software renderer; WebGPU had no adapter). The steps below
repeat or extend those tests on a Windows 11 laptop with an 8 GB RTX 4070, in Chrome. Clip ids refer to the shared
test set (`docs/guitar-tab-research/inputs/` and `/home/user/gtr/inputs/`); the orchestrator files the audio and video
clips in the studio library.

## 1. The measuring page: metronome timing and one in-browser model (about 5 to 15 minutes)

What it repeats: the metronome test of `trials.md` (four ways of making a 120 BPM click, idle and with a busy page),
Basic Pitch in TensorFlow.js on WebGL (your GPU) and on the CPU, and the ONNX copy of Basic Pitch in ONNX Runtime Web on
WebAssembly and WebGPU. The page synthesizes its own test melody (the
62 notes of clip S1), so no clip has to be downloaded. It sends nothing anywhere; it loads Tone.js, Basic Pitch and
TensorFlow.js from the jsDelivr CDN, ONNX Runtime Web (its WebAssembly file is about 29 MB) from jsDelivr, and the
230 KB ONNX model from raw.githubusercontent.com (no cost).

1. Get the file `docs/guitar-tab-research/lanes/browser-audio-sync/for-aaron/browser-timing-check.html` from the
   repository onto the laptop (for example from GitHub's "Download raw file" button).
2. Close other heavy programs (ComfyUI renders, games, video calls), so the numbers describe the browser and not a
   busy machine. Plug in the charger.
3. Open the file in Chrome (right-click, "Open with", Google Chrome). Keep the tab in front the whole time.
4. Under "1. Metronome timing", choose "61 (as on the cloud box, about 9 min)". Leave "audible" off (on makes the
   clicks play through the speakers; the numbers are the same either way, they are measured inside the browser).
   Click "Run metronome test" and wait until the status line says "metronome test done". Eight rows appear.
5. Under "2. In-browser model: Basic Pitch", leave "also run the CPU backend" ticked, click "Run model test", and
   wait for "model test done". On the cloud box, with software WebGL, the WebGL run on this page took 139 s (r0271);
   the CPU backend took 88 to 103 s for a 30 s clip in the lane's own page (r0170, r0270).
6. Under "3. The same model in ONNX Runtime Web", click "Run ONNX test" and wait for "ONNX test done" (it runs the
   ONNX copy of the same model on WebAssembly, then on WebGPU if Chrome finds your GPU; the WebGPU part could not be
   tried on the cloud box, which has no GPU).
7. Click "Copy to clipboard" and paste the whole text back into the chat. Also send: the laptop's power mode
   (Battery saver / Balanced / Best performance) and the Chrome version (chrome://version, first line).

What comes back is JSON: per metronome run the number of clicks found, the mean and largest deviation from the
ideal grid in ms, how many clicks were off the grid and how many were scheduled late, the sample rate, `baseLatency`,
`outputLatency` and `playbackStats` of your sound device; per Basic Pitch run the backend, model load time, inference
time, notes found and notes matched to the 62 known notes (onset within 50 ms, same pitch); per ONNX run the execution
provider, session creation time, inference time, the WebAssembly thread count and the same note counts. It also
records the WebGL renderer string and whether WebGPU found an adapter.

If the page stays blank or the status shows an error about modules or CORS: send a screenshot of the page and of
the Console (F12, Console tab). This page was tested here only in headless Chromium with the CDN files served from a
local cache (`trials.md`, "Measuring page"), not over the real CDN and not from a `file://` address.

## 2. Basic Pitch on your GPU in Spotify's own web demo (about 5 minutes, free)

Not run here: the demo needs a person to drop a file into a web page; this box ran the same library headless
(`trials.md`, Basic Pitch section).

1. Open https://basicpitch.io in Chrome (from this box the address redirected to https://basicpitch.spotify.com/ and
   answered HTTP 200 on 2026-11-10; the npm README of `@spotify/basic-pitch` 1.0.1 calls it "our snappy demo
   website"; its interface was not checked from this box).
2. Drop in the WAV of clip **S1** (`S1.wav`), then of **S2n** (`S2n.wav`), one at a time, with the default settings.
3. Note roughly how long each took from drop to result, and download the MIDI file for each.
4. Send back: the two MIDI files (named `S1_basicpitchio.mid`, `S2n_basicpitchio.mid`), the times, and a screenshot of
   the settings panel. They can be scored against the truth with `gtr-eval notes` exactly like the runs here.

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

## 4. Hand landmarks on your GPU (MediaPipe Tasks Vision in Chrome, about 10 minutes, free)

Not run here on a GPU: this box has no GPU; MediaPipe's GPU delegate ran only on the SwiftShader software renderer
(`trials.md`, MediaPipe section), so its time there says nothing about a real GPU.

1. Open Google's MediaPipe Studio hand landmarker demo, https://mediapipe-studio.webapps.google.com/demo/hand_landmarker ,
   in Chrome. From this box the address redirected to Google's sign-in page (accounts.google.com) on 2026-11-10, so it
   may ask you to sign in with a Google account; its controls were not checked from this box.
2. If it offers a choice of delegate, pick GPU. If it offers to run on a video or image file, use clip **R3b**
   (`R3b.mp4`, a close view of the fretting hand) and then **R3a** (`R3a.mp4`).
3. Note the frames per second or milliseconds per frame it shows, and whether both hands are found.
4. Send back: screenshots with the landmarks drawn and the speed figures, and the delegate shown. If the demo only
   takes the webcam, say so; a screenshot of the demo tracking hands on a guitar in front of the webcam also works.
