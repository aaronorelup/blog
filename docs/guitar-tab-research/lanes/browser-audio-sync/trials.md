# browser-audio-sync: trials

Lane agent `try-browser-audio-sync`, 2026-11-10 (UTC). Everything below was run in the headless Chromium that
Playwright installed on the shared box (4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU, software rendering), not in
a browser with a sound card or a GPU. Every number is a measurement on that box with its run id from
`/home/user/gtr/ledger/runs.jsonl` (`rNNNN`) and, where a score against ground truth exists, its gtr-eval id (`eNNNN`).

## How the trials were run (applies to every section)

- **Browser:** Playwright 1.63.0 (`/opt/node-tools/node_modules/playwright`), browser build `chromium-1243`, which
  reports itself as "Google Chrome for Testing 153.0.8010.12". Default mode is Playwright's headless shell
  (`chrome-headless-shell`, user agent `HeadlessChrome/153.0.8010.12`); the environment probe was also run with
  `channel: 'chromium'` (the full build in new headless mode). Launch flag: `--autoplay-policy=no-user-gesture-required`.
- **Pages:** plain HTML pages with ES modules, in `scripts/pages/`, served by `scripts/serve.mjs` (Node 22.23.4) on
  127.0.0.1 with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (so
  `crossOriginIsolated` is true and SharedArrayBuffer exists), or without them when the URL has `?coi=0`.
  `scripts/drive.mjs` opens one page, waits for it to set `window.__done`, and saves `window.__result` as JSON.
  Requests from the browser to any other host are answered from a local cache or aborted; every result file lists
  them under `external_requests` (none of the runs below made any). Libraries come from npm (versions per section),
  installed with `npm install --save-exact` into `/home/user/gtr/lanes/browser-audio-sync/node/` (696 MB for all of
  them); packages with bare imports were bundled with esbuild 0.28.2 (`node/entries/*.js`).
- **Capturing audio:** an AudioWorklet recorder (`scripts/pages/common.js`, `makeRecorder`) at the end of the graph
  copies every render quantum it receives into memory and maps each sample to the AudioContext frame timeline with
  `currentFrame`. Measured fact found while building it: right after an AudioWorkletNode is created, Chromium skipped
  its `process()` call for a few render quanta and `currentFrame` jumped by 384 to 1408 frames (one such jump per run,
  within the first 30 ms; logged in every result as `capture.gaps`); the recorder writes zeros for the skipped
  frames so that the timeline stays exact. Without that fill the first smoke test (r0095) showed every click 20.3 ms
  or 31.9 ms "early", which is how it was found (r0103 after the fix). The numbers are therefore positions on the
  AudioContext's render timeline as the graph produced them. Headless Chromium has no sound device: what a speaker
  would add (device latency, glitches) is not in these numbers.
- **CPU slots:** compute runs went through `gtr-run` in a 2-core slot. Real-time tests (metronome, sync, video
  playback, real-time capture) were run with `gtr-run --nolock` (logged in the ledger, not pinned, no slot) because
  about 30 jobs from other lanes were queued for the two slots at 21:16-21:20 UTC and a real-time test cannot be made
  faster by a slot; the ledger line of each of those runs records `load1_at_start`, and the box was shared with other
  agents' jobs throughout (load average 6 to 11 at 21:05-21:20 UTC).

## Environment probe: Chromium 153 (Chrome for Testing 153.0.8010.12)

- What: `scripts/pages/probe.html` reads the Web Audio settings, tries every codec string listed below, decodes four
  shared inputs with `decodeAudioData`, loads R3a.mp4 and R3a.webm in a `<video>`, and asks for WebGL and WebGPU.
- Runs: r0042 (headless shell) and r0050 (channel chromium), 2 cores each, 7.5 s wall each. Results:
  `samples/chromium-probe/probe_headless_shell.json`, `samples/chromium-probe/probe_chromium_channel.json`. Every
  field below was the same in both modes except the user agent string and the decode times.
- `navigator.hardwareConcurrency` 2 (the slot's 2 cores), `crossOriginIsolated` true, SharedArrayBuffer present,
  WebAssembly SIMD validates.
- **Web Audio:** default `AudioContext` sample rate 44100 Hz, `renderQuantumSize` 128, `baseLatency` 0.01 s,
  `outputLatency` 0.032 s (read after 3 s of running; read right after `resume()` it was 0 in r0143 and r0150),
  latencyHint `interactive` and `balanced` the same, `playback` gives baseLatency 0.02322 s and outputLatency 0.072 s.
  `ctx.currentTime` advanced 3.0128 s while `performance.now()` advanced 3.0008 s (r0042). `AudioContext.playbackStats`
  exists (underrunEvents 0, averageLatency 0.031183 s, maximumLatency 0.032879 s after 2 s). `setSinkId` exists.
  `destination.maxChannelCount` 2.
- **Codecs (`canPlayType`):** "probably" for audio/mpeg, audio/flac, AAC (`mp4a.40.2`), Opus (ogg and webm), Vorbis,
  H.264 Baseline and High (`avc1.42E01E`, `avc1.64001E`), VP8, VP9 (webm and mp4), AV1 (mp4 and webm); "maybe" for
  audio/wav; "" (no) for HEVC (`hev1`, `hvc1`). `MediaSource.isTypeSupported`: true for MP3, AAC, webm Opus, H.264,
  VP8, VP9, AV1; false for WAV, FLAC, ogg Opus/Vorbis and HEVC.
- **WebCodecs:** VideoDecoder, AudioDecoder, VideoEncoder, AudioEncoder all present. `VideoDecoder.isConfigSupported`
  true for H.264, VP8, VP9, AV1 with `no-preference` and `prefer-software`, false for all with `prefer-hardware`;
  HEVC false in all three. `AudioDecoder.isConfigSupported` true for AAC, Opus, MP3, pcm-s16, pcm-f32 (FLAC and Vorbis
  threw "description is required", i.e. they need the codec description from a container). `VideoEncoder` true for
  H.264, VP8, VP9, AV1.
- **decodeAudioData** worked on S1.wav (44.1 kHz, 2 ch, 29.833 s, 27 ms), R3a.webm (Opus track, returned at 44.1 kHz,
  17.9995 s, 120 ms), R3a.mp4 (AAC, 44.1 kHz, 17.9995 s, 43 ms) and the R2full FLAC (228.48 s, 558 ms) (times r0042).
- **`<video>`:** R3a.mp4 and R3a.webm both load (640x480, duration 18.018 s). `requestVideoFrameCallback` and
  `preservesPitch` exist.
- **Graphics:** WebGL 2.0 through ANGLE on "SwiftShader Device (Subzero)" (software). `navigator.gpu` exists but
  `requestAdapter()` returned null ("No available adapters."): no WebGPU here.

## Sync to a recording: S4 with clicks on its truth beats (Web Audio, no library)

- What: `scripts/pages/sync_s4.html`. S4.wav plays; a 10 ms click (decaying 2 kHz cosine, first sample 0.8) is put on
  each of the 68 truth beats of `S4.beats.txt`. The recorder takes S4 as it arrives in the graph ((L+R)/2) on channel 0
  and the clicks on channel 1. `scripts/analyze_sync.py` (numpy 2.4.6, scipy 1.17.1, soundfile 0.14.0) finds where
  S4's sample 0 is in the capture by FFT cross-correlation with S4.wav's (L+R)/2, checks the same lag in 2 s windows
  through the clip, finds each click onset (first sample above 0.05 after 100 ms below it) and reports click frame
  minus beat frame (beat frame = S4 sample-0 frame + round(beat time x 44100)). Every 50 ms the page also logged
  `ctx.currentTime` and the media position.
- **Same clock (AudioBufferSourceNode), r0143** (--nolock, wall 44.2 s, load1 at start in ledger): S4 decoded with
  `decodeAudioData`, started at a frame-exact time; all 68 clicks scheduled up front at start + beat time. S4's sample
  0 was found at exactly the scheduled frame (29602; difference 0 frames); the lag was the same (0) in every 2 s window;
  the captured channel 0 differed from S4's (L+R)/2 by at most 2.6e-5 (rms 2.9e-6). 68 of 68 clicks found; click minus
  beat: min 0 ms, max 0.023 ms (one sample), mean 0.012 ms.
- **`<audio>` element, r0150** (--nolock, wall 46.5 s): S4.wav in an `<audio>` element routed into the graph with
  `createMediaElementSource`; a `setTimeout` loop every 25 ms read `audio.currentTime` and `ctx.currentTime` and
  scheduled each click due within 100 ms at `ctx.currentTime + (beat - audio.currentTime)` (0 of 68 scheduled late).
  68 of 68 clicks found; click minus beat in the captured mix: min 0 ms, max 2.789 ms, mean 0.598 ms, median 0.023 ms,
  sd 0.902 ms. The element's audio kept the same position in the graph timeline for the whole clip (the lag was the same
  in every 2 s window). `audio.currentTime - ctx.currentTime` was -0.40255 s at the start and -0.40054 s at the end of
  38.29 s: a change of +2.00 ms, linear-fit slope +0.122 ms per minute, residual sd 0.52 ms, largest residual 2.68 ms.
  Each of the 766 reads of `audio.currentTime` (one per 50 ms `setInterval` tick) returned a new value.
- Latency values reported in both runs: `baseLatency` 0.01 s, `outputLatency` 0 (read right after `resume()`),
  `playbackStats.averageLatency` 0.03132 s and 0.031318 s, underrunEvents 0 at the end.
- Output files (kept outside git): `out/sync/sync_s4_buffer_busy0.wav`, `out/sync/sync_s4_element_busy0.wav`
  (2-channel 32-bit float WAV, 44.1 kHz); analyses `out/sync/*.analysis.json`; copies in `samples/web-audio-sync/`.
- Constraint inputs that matter for a re-run: the beat list (any list of times), the click sound, the look-ahead
  (100 ms) and loop period (25 ms) are page parameters; nothing else.

## Video: requestVideoFrameCallback, seeking and WebCodecs on R3a (Chromium's `<video>`, Mediabunny 1.65.2)

- What: `scripts/pages/video.html`. Frames are identified exactly: `scripts/frame_hashes.py` decodes every frame of
  R3a.webm (VP9, 539 frames) and R3a.mp4 (H.264, 540 frames) with ffmpeg 6.1.1 (`-fps_mode passthrough`, yuv420p) and
  stores the SHA-1 of each frame's luma plane and its ffprobe pts (all 539 and 540 hashes distinct). In the page,
  `new VideoFrame(video)` copies the frame on screen; the SHA-1 of its luma plane is looked up in that list.
- **requestVideoFrameCallback during playback** (muted, rate 1, whole 18 s clip; r0156 webm, r0157 mp4; --nolock):
  - mp4: 539 callbacks for 540 frames; `presentedFrames` went up by 1 at every callback; `mediaTime x 30000/1001` was
    within 1e-5 of an integer every time; callback interval mean 33.46 ms, min 16.66 ms, max 66.67 ms (60 Hz compositor
    ticks). With frame identification on (second pass): all 539 frames shown were identified, each was the frame whose
    pts equals `mediaTime` (539 of 539), pixel format I420, identification cost mean 1.27 ms per frame (max 6.5 ms).
  - webm: 536 callbacks in the first pass (`presentedFrames` stepped by 2 twice), 537 in the second; the frame shown
    was in every case (537 of 537) the frame whose pts equals `mediaTime`. In this file the pts are rounded to whole
    milliseconds and the first frame has pts 0.033 s (so `mediaTime x fps` is up to 0.015 frame off an integer, and
    "frame index from mediaTime" is 1 more than the decode index). Callback interval mean 33.61 ms, min 16.66, max 83.33.
- **Seeking** (`currentTime = t`, then the frame shown after `seeked` and the next video frame callback), 12 target
  frames k (1 to 530) x two targets each, t = k x 1001/30000 ("start") and t = (k + 0.5) x 1001/30000 ("mid"):
  - mp4 (r0157): "mid" showed frame k in 12 of 12. "start" (the nominal frame time) showed frame k in 2 of 12 and
    frame k-1 in 10 of 12. The frame shown was the one whose ffprobe pts (6 decimals) is the last at or before t in
    18 of 24; the 6 others are "start" seeks where t and the pts differ by less than 1 microsecond.
  - webm (r0156): 24 of 24 showed the frame whose (millisecond-rounded) pts is the last at or before t.
  - The callback after each seek arrived in every case (no 3 s timeout).
- **WebCodecs through Mediabunny** (decode every frame with `VideoSampleSink.samples()`): see the batch run below.
- Output: `out/video/video_webm.json`, `out/video/video_mp4.json` (all callbacks, all seek rows); copies in
  `samples/video-element-rvfc/`.
