# browser-audio-sync: what Aaron can run himself

Written 2026-11-10 by `try-browser-audio-sync`. Everything in `trials.md` ran in headless Chromium on a cloud box with
no sound card and no GPU (WebGL ran on the SwiftShader software renderer; WebGPU had no adapter). The steps below
repeat or extend those tests on a Windows 11 laptop with an 8 GB RTX 4070, in Chrome. Clip ids refer to the shared
test set (`docs/guitar-tab-research/inputs/` and `/home/user/gtr/inputs/`); the orchestrator files the audio and video
clips in the studio library.

## 1. The measuring page: metronome timing and one in-browser model (about 5 to 15 minutes)

What it repeats: the metronome test of `trials.md` (four ways of making a 120 BPM click, idle and with a busy page)
and Basic Pitch in TensorFlow.js on WebGL (your GPU) and on the CPU. The page synthesizes its own test melody (the
62 notes of clip S1), so no clip has to be downloaded. It sends nothing anywhere; it loads Tone.js, Basic Pitch and
TensorFlow.js from the jsDelivr CDN (about 4 MB in all, no cost).

1. Get the file `docs/guitar-tab-research/lanes/browser-audio-sync/for-aaron/browser-timing-check.html` from the
   repository onto the laptop (for example from GitHub's "Download raw file" button).
2. Close other heavy programs (ComfyUI renders, games, video calls), so the numbers describe the browser and not a
   busy machine. Plug in the charger.
3. Open the file in Chrome (right-click, "Open with", Google Chrome). Keep the tab in front the whole time.
4. Under "1. Metronome timing", choose "61 (as on the cloud box, about 9 min)". Leave "audible" off (on makes the
   clicks play through the speakers; the numbers are the same either way, they are measured inside the browser).
   Click "Run metronome test" and wait until the status line says "metronome test done". Eight rows appear.
5. Under "2. In-browser model: Basic Pitch", leave "also run the CPU backend" ticked, click "Run model test", and
   wait for "model test done" (the WebGL run should take seconds to tens of seconds; the CPU run took 88 s on the
   cloud box, r0170).
6. Click "Copy to clipboard" and paste the whole text back into the chat. Also send: the laptop's power mode
   (Battery saver / Balanced / Best performance) and the Chrome version (chrome://version, first line).

What comes back is JSON: per metronome run the number of clicks found, the mean and largest deviation from the
ideal grid in ms, how many clicks were off the grid and how many were scheduled late, the sample rate, `baseLatency`,
`outputLatency` and `playbackStats` of your sound device; per Basic Pitch run the backend, model load time, inference
time, notes found and notes matched to the 62 known notes (onset within 50 ms, same pitch). It also records the WebGL
renderer string and whether WebGPU found an adapter.

If the page stays blank or the status shows an error about modules or CORS: send a screenshot of the page and of
the Console (F12, Console tab). This page was tested here only in headless Chromium with the CDN files served from a
local cache (`trials.md`, "Measuring page"), not over the real CDN and not from a `file://` address.

## 2. Basic Pitch on your GPU in Spotify's own web demo (about 5 minutes, free)

Not run here: the demo needs a person to drop a file into a web page; this box ran the same library headless
(`trials.md`, Basic Pitch section).

1. Open https://basicpitch.io in Chrome. (The npm README of `@spotify/basic-pitch` 1.0.1 calls it "our snappy demo
   website"; its current interface was not checked from this box.)
2. Drop in the WAV of clip **S1** (`S1.wav`), then of **S2n** (`S2n.wav`), one at a time, with the default settings.
3. Note roughly how long each took from drop to result, and download the MIDI file for each.
4. Send back: the two MIDI files (named `S1_basicpitchio.mid`, `S2n_basicpitchio.mid`), the times, and a screenshot of
   the settings panel. They can be scored against the truth with `gtr-eval notes` exactly like the runs here.

## 3. Source separation in the browser on WebGPU (about 10 minutes, free)

Not run here: WebGPU had no adapter in this headless Chromium (`requestAdapter()` returned null, `trials.md`
environment probe). demucs-web ran here on the WebAssembly backend only (see `trials.md`, Demucs section).

1. Open the demucs-rs browser demo, https://nikhilunni.github.io/demucs-rs/ , in Chrome (the survey quotes its README:
   it runs "entirely **in the browser** via WebAssembly + WebGPU"). Its controls were not checked from this box.
2. Load clip **S4** (`S4.wav`, 38.7 s band mix with known stems), choose the standard 4-stem model if asked, run it, and
   time it from start to finished stems.
3. If the demo offers the 6-stem model (it lists "6-Stem (adds guitar & piano)"), run S4 again with it.
4. Download the stems it produces.
5. Send back: the stem WAV files, the times, the model names as the page shows them, and a screenshot. They can be
   scored against S4's stems with `gtr-eval stems`.
