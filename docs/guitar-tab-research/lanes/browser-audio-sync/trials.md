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

## Metronome timing: Web Audio look-ahead, setInterval, Tone.js 15.1.22 Transport, AudioWorklet

- What: `scripts/pages/metronome.html`, run by `scripts/run_metronome.sh` (one page per method and load). 120 BPM,
  122 clicks (61 s), click = 10 ms decaying 2 kHz cosine whose first sample is 0.8. Methods:
  (a) **look-ahead**: a `setTimeout` loop every 25 ms schedules `AudioBufferSourceNode.start(when)` for every click
  due within the next 100 ms, at frame-exact times; (b) **setInterval**: `setInterval(500 ms)`, each callback starts a
  click at once (`start()` with no time); (c) **Tone.js** `tone` 15.1.22 (npm, UMD build): `Tone.setContext(ctx)`,
  `Transport.scheduleRepeat(cb, '4n')`, `Transport.start(t0)`, each callback starts the same click buffer at the
  `time` Tone passes in; Tone's context reported lookAhead 0.1 s, updateInterval 0.05 s, clockSource "worker";
  (d) **AudioWorklet**: a processor that writes the click samples itself at frame positions it counts from
  `currentFrame`. Load: **idle**, or **busy** = the main thread spins for 100 ms, yields with `setTimeout(0)`, and
  repeats for the whole run (59.0 to 59.2 s of the 61 s blocked, 576 to 581 blocks).
- Measurement: the recorder captured the click bus; an onset is the first sample with |x| > 0.05 after at least 0.1 s
  below it (exact for this noise-free signal). Deviation = onset frame minus the ideal grid frame, in ms at 44.1 kHz
  (1 sample = 0.0227 ms). Ideal grid: the intended first-click frame + n x 22050 for (a), (c), (d); the first
  detected click + n x 22050 for (b), which has no intended times. The page computed the numbers;
  `scripts/check_metronome.py` recomputed them from the saved WAVs with numpy and got the same values
  (`samples/web-audio-metronome/check_metronome_output.txt`).
- Run: **r0199** (`gtr-run --nolock`, real time, wall 548.5 s for all 8 pages; load average 9 to 16 on the box from
  other lanes during the run, 21:20-21:29 UTC). 122 of 122 clicks were found in every one of the 8 captures.

| method | load | mean deviation (ms) | largest deviation (ms) | clicks off the grid | other facts |
|---|---|---|---|---|---|
| look-ahead (setTimeout 25 ms, 100 ms ahead) | idle | 0.000 | 0.000 | 0 of 122 | 0 scheduled late; smallest margin between scheduling and click time 69.4 ms; loop period mean 25.42 ms, longest 61.4 ms |
| look-ahead | busy | 0.856 | 42.132 | 11 of 122 (all late) | 11 clicks were scheduled after their time had passed (largest 41.45 ms); the late clicks: 41.451, 42.132, 11.383, 2.313, 1.723, 1.678, 1.451, 0.862, 0.771, 0.635, 0.045 ms; loop period mean 107.2 ms, longest 229.7 ms |
| setInterval(500 ms), start() at once | idle | 2.175 (against the first click); 0.000 mean, 1.664 mean absolute against a least-squares grid | 42.630 | 5 of 122 more than 5 ms off (42.6, 22.2, 12.7, 12.3, 11.7 ms) | fitted period 499.9933 ms; callback-to-callback interval 461.9 to 538.0 ms |
| setInterval | busy | 30.724 | 91.202 | 95th percentile of the absolute deviation 79.8 ms | fitted period 500.0178 ms; deviation from the fitted grid: mean absolute 27.04 ms, largest 60.04 ms; callback interval up to 580.0 ms |
| Tone.js Transport | idle | 0.000 | 0.000 | 0 of 122 | 0 scheduled late; smallest margin 39.6 ms |
| Tone.js Transport | busy | 0.077 (corrected, see below) | 2.268 (corrected) | 7 of 122 (all late: 0.227 to 2.268 ms) | 7 callbacks ran after the click time (largest by 2.27 ms) |
| AudioWorklet | idle | 0.000 | 0.000 | 0 of 122 | |
| AudioWorklet | busy | 0.000 | 0.000 | 0 of 122 | |

- Correction applied to the Tone.js busy row: in that capture the recorder's `process()` once reported the same
  `currentFrame` twice (a step of -128 frames, then +128, at frame 752768, 17.07 s). The first recorder version
  appended the repeated quantum and padded the following jump with zeros, which moves every later sample 128 frames
  (2.902 ms) late; the raw page numbers for that run (mean 2.195 ms, largest 5.170 ms; clicks 33 to 121 all show
  +2.902 ms) contain that shift. `check_metronome.py` subtracts the 128 frames after the event and gives the row
  above. The recorder was changed afterwards (`common.js`) to step back on a repeated frame index; no other capture of
  this lane before the change had a negative step (each result lists its steps in `capture.gaps`).
- `AudioContext.playbackStats` at the end (fake audio output, no device): underrunEvents 0 in 6 runs, 1 (Tone.js idle)
  and 5 (AudioWorklet idle, underrunDuration 0.05 s) in the others; averageLatency 0.0313 s in all.
- Output files (kept outside git): `out/metronome/metronome_<method>_busy<0|100>.wav`, mono 32-bit float, 44.1 kHz,
  about 62 s each; results with every deviation (`dev_all_ms`) in `samples/web-audio-metronome/`.
- What this does not measure: the time from the graph to a loudspeaker (no audio device here) and the effect of a
  busy main thread on the audio thread of a real device.

## Reference playback of a tab: smplr 1.2.0, soundfont-player 0.12.0, SpessaSynth 4.4.7, js-synthesizer 1.13.0

- What: `scripts/pages/synths.html` plays the 90 truth notes of S2n (two-voice nylon fingerstyle, 112 BPM) through a
  sample player in a real-time AudioContext and records the result (2 channels, 32-bit float, 44.1 kHz).
  smplr, soundfont-player and SpessaSynth get every note scheduled up front at t0 + onset (t0 on an exact frame);
  js-synthesizer plays `S2n.mid` with FluidSynth's own MIDI player, so its start is not set by the page.
- Timing measurement: `scripts/analyze_synths.py` runs `librosa.onset.onset_detect(hop_length=128, units='time')`
  (librosa 0.11.0) on the mono capture, moves the onsets onto the truth time base (capture frame - t0 frame; for
  js-synthesizer the constant shift that matches the most onsets within 50 ms, refined to the median difference), and
  `gtr-eval onsets --field notes` (window 50 ms; chord notes that start together count once, 48 truth onsets)
  scores them. "Detected minus truth" contains the detector's own lag and each sample's attack, so the same detector
  was run on the truth render `S2n.mono.wav` (FluidSynth 2.3.4 + FluidR3_GM, made by the inputs builder) as the
  baseline: e0429, 46 of 48 matched, detected minus truth median 14.67 ms, mean 15.30 ms, max 20.50 ms.
- The analysis also cross-correlates each capture with the truth render: normalized peak and lag.
- Library setup and runs (captures r0225 and r0229, `gtr-run --nolock`, real time):

| player | sound | how notes were given | load time | run | onsets matched (gtr-eval) | detected minus truth onset |
|---|---|---|---|---|---|---|
| smplr 1.2.0 (`dist/index.mjs`) | MIDI.js soundfont FluidR3_GM `acoustic_guitar_nylon-ogg.js` (2,158,023 bytes, gleitz.github.io) | `Soundfont(ctx,{instrument:'acoustic_guitar_nylon',kit:'FluidR3_GM'})`, `start({note, velocity, time, duration})` | 0.74 s | r0229 | e0533: 46 of 48 truth, 46 detected (F 0.979) | median 14.75 ms, mean 14.65, 95th pct 16.76, max 17.74 |
| soundfont-player 0.12.0 (`dist/soundfont-player.min.js`) | MIDI.js soundfont FluidR3_GM `acoustic_guitar_nylon-mp3.js` (1,837,439 bytes) | `Soundfont.instrument(ctx,'acoustic_guitar_nylon',{soundfont:'FluidR3_GM'})`, `play(note, time, {duration, gain: velocity/127})` | 1.47 s | r0229 | e0540: 48 of 48, 49 detected (F 0.990) | median 14.74 ms, mean 15.30, 95th pct 16.75, max 33.17 |
| SpessaSynth (`spessasynth_lib` 4.4.7 + `spessasynth_core` 4.4.9, esbuild bundle) | FluidR3_GM.sf2 (148,398,306 bytes) | `WorkletSynthesizer`, `programChange(0,24)`, `noteOn(0,p,v,{time})`, `noteOff(0,p,{time})` | 1.79 s | r0225 | e0427: 46 of 48, 46 detected (F 0.979) | median 13.80 ms, mean 14.02, 95th pct 16.80, max 19.73 |
| js-synthesizer 1.13.0 + `libfluidsynth-2.4.6.js` | FluidR3_GM.sf2 | `AudioWorkletNodeSynthesizer`, `loadSFont`, `addSMFDataToPlayer(S2n.mid)`, `playPlayer()` | 2.18 s | r0225 | e0428: 46 of 48, 46 detected (F 0.979) | start fitted: median 0.00 ms (by construction), mean 0.40, mean absolute 1.17, max 5.41 |

- Cross-correlation with the truth render (mono, 44.1 kHz): js-synthesizer's capture matches it with a normalized
  peak of 0.99908 (gain 0.2287, residual 4.3 % of the capture's RMS) at lag 96640 samples, i.e. FluidSynth 2.4.6 in
  WASM rendered S2n.mid almost sample for sample like the native FluidSynth 2.3.4 that made the shared input. smplr and
  soundfont-player: normalized peak 0.650 and 0.648; both line up with the truth render 35 samples (0.79 ms) before
  the scheduled offset. SpessaSynth: -0.229 (its rendering of FluidR3_GM differs in waveform).
- Failures and oddities: the first smplr attempt (r0225) imported `smplr/dist/index.js`, which is CommonJS, and failed
  with "module is not defined"; `dist/index.mjs` works. The first soundfont-player attempt (r0225) failed with
  "Network Error" because the browser's request for the soundfont at gleitz.github.io was blocked by this lane's
  driver before the file was in its cache (`scripts/cache_url.sh` then fetched it with curl). In the SpessaSynth
  capture the recorder logged one repeated `currentFrame` (before the first note); the analysis adds the 128 frames
  back (`recorder_negative_step_correction_frames`, see the metronome section). `AudioContext.playbackStats` counted
  47 underruns (0.47 s) of the fake output during the js-synthesizer run and 32 during SpessaSynth; the recorder found
  no skipped render quanta after the start in either.
- Output format facts: all four produce audio inside the Web Audio graph (an `AudioNode` to connect), nothing else.
  Inputs: MIDI note numbers with times in `AudioContext` seconds (smplr, soundfont-player, SpessaSynth), or a
  Standard MIDI File / MIDI events (js-synthesizer, SpessaSynth's sequencer). A tab's string, fret, tuning and capo
  reach them only as the resulting MIDI pitch.
- Output files (kept outside git): `out/synths/S2n_<player>.wav` (2 ch, float32, 31.2 to 32.5 s). Samples:
  `samples/reference-playback/` (result JSON, onset lists, analyses, gtr-eval outputs).

## Basic Pitch in the browser: @spotify/basic-pitch 1.0.1 (TensorFlow.js) and nmp.onnx in ONNX Runtime Web 1.31.1

- What: Spotify's note transcription model, run inside the page (`scripts/pages/basicpitch.html`). Two engines, the
  same post-processing: (1) npm `@spotify/basic-pitch` 1.0.1 with its own TF.js graph model (`model/model.json`
  174,537 bytes + `group1-shard1of1.bin` 742,392 bytes, sha256 `1ed1aaee...` and `b142a957...`) on the TF.js that npm
  installed with it, `@tensorflow/tfjs` 3.21.0, backends `webgl`, `cpu`, `wasm` (`@tensorflow/tfjs-backend-wasm`
  3.21.0); (2) the ONNX export of the same model from the Python repository,
  https://raw.githubusercontent.com/spotify/basic-pitch/main/basic_pitch/saved_models/icassp_2022/nmp.onnx (230,444
  bytes, sha256 `2c3c1d14...`, downloaded 2026-11-10), in `onnxruntime-web` 1.31.1 (`ort.wasm.min.mjs`, wasm execution
  provider) with `numThreads` 1 or 2. For ORT the page copies basic-pitch-ts's windowing (43,844-sample windows, 30
  overlapping frames, half the overlap padded in front, as in its `inference.js`) and the output names the Python
  package uses for ONNX (`note` = `StatefulPartitionedCall:1`, `onset` = `StatefulPartitionedCall:2`, `contour` =
  `StatefulPartitionedCall:0`, from `basic_pitch/inference.py`). Notes: `outputToNotesPoly` +
  `addPitchBendsToNoteEvents` + `noteFramesToTime` from the npm package, with two parameter sets: "pydefault" =
  onset 0.5, frame 0.3, minimum length 11 frames (the Python CLI defaults: 127.70 ms at 86 frames/s) and "readme" =
  0.25, 0.25, 5 (the npm README example).
- Input handling: the WAV is decoded by `decodeAudioData` and resampled to 22,050 Hz mono by an OfflineAudioContext
  (the browser's resampler); the npm `evaluateModel` throws unless the AudioBuffer is 22,050 Hz and mono.
- Run: r0270 (`gtr-run --nolock`, 10 pages, wall 510.7 s; box load average 10 to 19 during the run, so the times
  below are on a heavily shared 4-core box, not on a reserved slot; a 2-core slot run was queued as
  `browser-inference-2core`, see the end of this file).

| engine / backend | clip | model load | inference | notes (pydefault / readme) | gtr-eval (pydefault) | gtr-eval (readme) |
|---|---|---|---|---|---|---|
| TF.js 3.21.0 webgl (SwiftShader) | S1 | 62 ms | 160.6 s | 64 / 115 | e0669: onset F1 0.968 (P 0.953, R 0.984), on+off F1 0.667 | e0671: F1 0.678 (P 0.522, R 0.968) |
| TF.js cpu | S1 | 55 ms | 103.1 s (87.8 s in smoke run r0170) | 64 / 115 | e0673: same values as webgl | e0675: same as webgl |
| TF.js wasm | S1, S2n | 53 ms | failed | none | "Error: Unknown dtype undefined" in the wasm backend's `fill` kernel (`BackendWasm.makeOutput`), raised from the model's input preparation | |
| ORT Web wasm, 1 thread | S1 | 1.93 s | 7.86 s (4.37 s in smoke run r0170) | 64 / 115 | e0808: F1 0.968 (P 0.953, R 0.984), on+off F1 0.667 | e0812: F1 0.678 |
| ORT Web wasm, 2 threads | S1 | 1.84 s | 9.92 s | 64 / 115 | e0823: same | e0825: same |
| ORT Web, 2 threads asked, no cross-origin isolation (`?coi=0`) | S1 | 2.08 s | 6.31 s | 64 / 115 | e0816: same | e0819: same |
| TF.js webgl | S2n | 34 ms | 157.7 s | 136 / 267 | e0840: F1 0.796 (P 0.662, R 1.000); recall melody 42/42, bass 48/48; on+off F1 0.540 | e0844: F1 0.504 (P 0.337, R 1.000) |
| ORT Web wasm, 1 thread | S2n | 3.11 s | 8.36 s | 136 / 267 | e0828: same as TF.js | e0831: same |
| ORT Web wasm, 2 threads | S2n | 1.22 s | 6.53 s | 136 / 267 | e0834: same | e0837: same |

- gtr-eval `notes`: onset within 50 ms and pitch within 50 cents (mir_eval.transcription, offsets ignored), plus
  on+off with mir_eval's default offset rule. Median onset error of matched notes (estimate minus truth): +10.4 ms on
  S1, +8.1 ms on S2n, the same for every engine.
- The note lists of TF.js (webgl, cpu) and ORT Web (1 thread, 2 threads, not isolated) are identical in start, end
  and pitch on both clips (compared as text after dropping the amplitude column; one amplitude on S2n differs in the
  4th decimal). First notes of S1 (pydefault, start s, end s, MIDI): 1.683447, 2.091080, 66; 2.091080, 2.509039, 66;
  2.509039, 2.950218, 67; 2.926998, 3.356567, 69; 3.356567, 4.008010, 69 (truth: 66, 66, 67, 69, 69 at 1.667, 2.083,
  2.500, 2.917, 3.333 s).
- Threads: with cross-origin isolation, `ort.env.wasm.numThreads` stayed at the requested 1 or 2; without it
  (`crossOriginIsolated` false) ORT set it to 1 after creating the session.
- Output format facts: the page writes CSV `start_time_s,end_time_s,pitch_midi,amplitude` (from basic-pitch-ts's
  `NoteEventTime`: `startTimeSeconds`, `durationSeconds`, `pitchMidi`, `amplitude`, `pitchBends`); the raw model
  outputs are frames x 88 (note), frames x 88 (onset), frames x 264 (contour) at 86 frames per second. The npm package
  1.0.1 does not export the MIDI writer `generateFileData` from its index (esbuild: "No matching export").
- Constraint inputs a re-run can use (post-processing parameters of `outputToNotesPoly`): `onsetThresh`, `frameThresh`,
  `minNoteLen` (frames), `inferOnsets`, `maxFreq`, `minFreq` (Hz), `melodiaTrick`, `energyTolerance`. A known tuning,
  capo or string count is not an input; a note range can be imposed through `minFreq` / `maxFreq`.
- Samples: `samples/basic-pitch-browser/` (CSV for S1 and S2n, gtr-eval JSON, page results).

## essentia.js 0.1.3 (Essentia compiled to WebAssembly)

- What: npm `essentia.js` 0.1.3 (`dist/essentia-wasm.web.js` + `dist/essentia.js-core.js`, script tags); the page
  (`scripts/pages/essentia.html`) reports `essentia.version` "2.1-beta6-dev" and 199 algorithm names. Input: the clip
  decoded at 44.1 kHz, channels averaged to mono, passed as a vector. Algorithms and settings:
  `RhythmExtractor2013(signal, 208, 'multifeature', 40)` (bpm, beat ticks); `KeyExtractor(signal)` (defaults);
  `TonalExtractor(signal, 4096, 2048, 440)` (per-frame `chords_progression`, written as a .lab by merging equal
  neighbouring frames, frame i placed at i x 2048 / 44100 s); `PitchMelodia(signal)` (defaults, frame i placed at
  i x 128 / 44100 s; this time convention is the page's assumption, not checked against Essentia's docs).
- Run: the `browser-analysis-batch` run (`gtr-run --nolock`; its id is listed under "Run ids" at the end); per
  clip in the page: S3 2.90 s total (WASM init 197 ms, rhythm 2.15 s, key 69 ms, tonal 148 ms); S4 4.44 s (rhythm
  3.42 s, key 105 ms, tonal 451 ms); S1 10.62 s (rhythm 3.10 s, key 202 ms, PitchMelodia 6.87 s).
- Scores (gtr-eval; beats: 70 ms window, continuity 17.5 %; tempo: 4 % tolerance; chords: mir_eval duration-weighted):

| clip | beats | tempo | key | chords |
|---|---|---|---|---|
| S3 (strummed, 96 BPM, G major) | e0906: F 0.870 (P 0.811, R 0.938; 37 est, 32 truth), CMLt 0.838, AMLt 0.838; matched beats late by median 38.7 ms | e0910: 95.61 BPM (-0.41 %) | e0913: G major, exact | e0916: root 0.782, majmin 0.782, sevenths 0.618 |
| S4 (band, 116 BPM, D major) | e0920: F 0.944 (P 0.905, R 0.985; 74 est, 68 truth), CMLt 0.919; median +28.5 ms | e0923: 115.61 BPM (-0.34 %) | e0926: D major, exact | e0929: root 0.743, majmin 0.725, sevenths 0.686 |
| S1 (melody, 144 BPM, D major) | e0936: F 0.955 (P 0.914, R 1.000), CMLt 0.914; median +7.8 ms | e0933: 143.87 BPM (-0.09 %) | e0931: D major, exact | none (S1 has no chords) |

- PitchMelodia on S1 against the truth melody (gtr-eval `f0`, 10 ms grid, 50 cents): e0938: voicing recall 0.893,
  voicing false alarm 0.067, raw pitch accuracy 0.881, raw chroma accuracy 0.881, overall accuracy 0.887 (10,280
  frames, 8,156 voiced).
- TonalExtractor's other outputs in the same runs: S3 `key_key` C major while `chords_key` G major; S4 `key_key` G
  major, `chords_key` B minor (KeyExtractor gave G major for S3 and D major for S4, as in the table). First S3 chord
  segments (s): 0-1.579 Am, 1.579-4.923 G, 4.923-7.941 Em, 7.941-10.588 Am, 10.588-12.353 D, 12.353-14.861 G.
- Output format facts: JavaScript objects of Emscripten vectors (`ticks` in seconds, `bpm`, `key` + `scale` +
  `strength`, `chords_progression` as one label per frame in the style "Am", "G", "Bm"; `pitch` in Hz with 0 for
  unvoiced and `pitchConfidence`), converted by `essentia.vectorToArray`. The page wrote `<clip>_beats.txt` (one time
  per line), `<clip>_bpm.txt`, `<clip>_key.txt` ("G major"), `<clip>_chords.lab` (start, end, label, tab separated),
  `S1_pitchmelodia.csv` (time_s, frequency_hz, confidence).
- Constraint inputs a re-run can use: RhythmExtractor2013 `minTempo`, `maxTempo`, `method`; TonalExtractor
  `tuningFrequency` (a known tuning offset can be passed as a reference frequency), frame and hop size; KeyExtractor
  has profile and tuning parameters (not varied here). No capo or string inputs.
- Samples: `samples/essentia-js/` (beats, bpm, key, .lab files, gtr-eval JSON, page results, the first 2,000 rows of
  the PitchMelodia CSV).

## WebCodecs decoding through Mediabunny 1.65.2 (R3a.webm VP9, R3a.mp4 H.264)

- What: npm `mediabunny` 1.65.2 (`dist/bundles/mediabunny.mjs`), `Input` + `UrlSource` + `ALL_FORMATS`,
  `VideoSampleSink.samples()` for every frame and `VideoSampleSink.getSample(t)` for 12 random-access times;
  Mediabunny decodes with the browser's WebCodecs `VideoDecoder` (`canDecode()` true for both). Each decoded frame's
  luma plane was hashed and compared with ffmpeg 6.1.1's decode (`scripts/frame_hashes.py`).
- Run: same batch as essentia.js (`browser-analysis-batch`, --nolock). Results (`out/video/decode_<webm|mp4>.json`):
  - webm: codec "vp9", decoder config `vp09.00.30.08.01.02.02.02.00`, 640x480; 539 frames; all 539 luma planes
    bit-identical to ffmpeg's frame with the same index; every timestamp equal to ffprobe's pts (0.033, 0.067, 0.100 ...
    s, whole milliseconds); pixel format I420; decode of all frames 712.8 ms (1.32 ms per frame), 985.7 ms with the
    hashing. `getSample(k x 1001/30000)` returned the frame whose pts is the last at or before t in 12 of 12 cases.
  - mp4: codec "avc", decoder config `avc1.64001e`; 540 frames; all 540 luma planes bit-identical to ffmpeg's;
    timestamps within 0.00033 ms of ffprobe's 6-decimal pts (Mediabunny gives k x 1001/30000 exactly); decode of all
    frames 1078.7 ms (2.00 ms per frame), 1304.9 ms with hashing. `getSample(k x 1001/30000)` returned frame k in 12 of
    12 cases (the `<video>` element showed frame k-1 for 10 of the same 12 times, see the video section above).
  - `getSample` took 7 to 337 ms per call (it decodes from the previous key frame).
- Output format facts: `VideoSample` objects (timestamp and duration in seconds, `format` "I420", `toVideoFrame()`,
  `copyTo()`, `draw()` onto a canvas). Samples: `samples/mediabunny-webcodecs/`.

## alphaTab 1.9.0: metronome (audio export), count-in, external media sync

- What: npm `@coderline/alphatab` 1.9.0 (`dist/alphaTab.mjs`, its own worker and AudioWorklet files, SoundFont
  `dist/soundfont/sonivox.sf2`), loading the shared `S2n.gp5` (written with PyGuitarPro by the inputs builder).
  alphaTab read it as: title "Twinkle (Ah! vous dirai-je, maman), fingerstyle, nylon", tempo 112, one track "Guitar",
  strings [64, 59, 55, 50, 45, 40] (string 1 first), capo 0, 13 master bars in 4/4 (the first is the silent count-in
  bar of the test set). The web-tab-render lane covers alphaTab's rendering and player in general; this section is
  only the timing features.
- **Metronome through the audio export API** (`api.exportAudio(options)`, since 1.6.0; `scripts/pages/alphatab.html`):
  `AudioExportOptions` with `sampleRate` 44100, `metronomeVolume` 1, `useSyncPoints` false and `trackVolume`
  {0: 0} (guitar muted) rendered the metronome alone; a second export with `metronomeVolume` 0 rendered the guitar.
  Run r0195 (`gtr-run --nolock`, labelled as a smoke test; the result is used here): score load 616 ms; each export of
  the 27.858 s song took 103 ms (metronome) and 85 ms (guitar) in `render(1000)` chunks; last chunk `endTime`
  27857.14 ms, `endTick` 49920. The metronome-only render has 52 clicks (13 bars x 4); onset = first sample above 5 %
  of the peak after 150 ms below it. Click onset minus n x 535.714 ms (the beat at 112 BPM): from -1.429 to 0 ms
  (mean -0.711 ms); successive intervals 535.51 ms or 536.96 ms (interval minus beat -0.204 to +1.247 ms), which is
  23,616 or 23,680 samples: whole multiples of 64 samples, the synthesizer's block size stated in alphaTab's
  `IAudioExporter.render` documentation ("the synthesizer internally uses a fixed block size of 64 samples").
- **Count-in and metronome in real-time playback** (`scripts/pages/alphatab_live.html?mode=countin`, r0269, --nolock):
  `countInVolume` 1, `metronomeVolume` 1, guitar muted with `changeTrackMute`. alphaTab's synthesizer output is an
  AudioWorkletNode in its own AudioContext (44.1 kHz), connected to the destination only after the first `play()`
  (the first attempt, r0257, found no connection before playing and recorded nothing; r0266 tapped the first node,
  which stayed silent, because alphaTab connected new nodes on the next `play()`; r0269 tapped every node connected
  to the destination: 3). In the 8 s after `play()`: 15 clicks; the first 8.7 ms after the context frame at which
  `play()` was called; intervals 535.51 ms (11 of 14), 552.93 ms (between clicks 4 and 5, where the one-bar count-in
  meets the song's own metronome, if the count-in is one 4/4 bar: an assumption, the page cannot tell count-in clicks
  from metronome clicks), 536.96 ms and 550.02 ms. Box load average was above 10 during the run.
- **External media mode** (`PlayerMode.EnabledExternalMedia`, `mode=external`, r0261, --nolock): the page gave
  `api.player.output.handler` an object driving an `<audio>` element with S2n.wav and called
  `api.player.output.updatePosition(audio.currentTime * 1000)` on every animation frame. alphaTab called the handler:
  `seekTo(0.558 ms)` then `play()` on `api.play()`; `seekTo(20000)` when `api.timePosition = 20000` was set;
  `seekTo(20892.857)` and `pause()` on `api.pause()`. 661 position events in 10 s; in all 504 checked,
  `playerPositionChanged.currentTime` equalled the media time passed in (alphaTab takes the media element's time as
  its clock in this mode, so the cursor can only be as exact as the position the page feeds it). 1.5 s after the seek
  the audio was at 21414.5 ms and `api.timePosition` at 21412.7 ms.
- NOT RUN HERE: the backing-track mode (`PlayerMode.EnabledBackingTrack`) with sync points, which needs a Guitar Pro
  7/8 file that carries an audio track and sync points; the shared set has Guitar Pro 5 files only.
- Output files (kept outside git): `out/alphatab/S2n_alphatab_metronome_only.wav`,
  `S2n_alphatab_guitar_no_metronome.wav` (2 ch, float32, 27.86 s), `S2n_alphatab_live_countin_metronome.wav` (1 ch,
  8.4 s). Samples: `samples/alphatab-player/`.

## Measuring page for Aaron's own browser (`for-aaron/browser-timing-check.html`)

- What: one self-contained HTML file (no build step) that repeats the metronome test (same four methods, same click,
  same onset rule, idle and busy, 15 or 61 s per run) and runs Basic Pitch 1.0.1 on TF.js (webgl, then cpu) on a test
  melody it synthesizes itself from the 62 S1 truth notes (fundamental + 4 harmonics, 22,050 Hz), scoring the notes
  with a simple greedy match (onset within 50 ms, same MIDI pitch; not gtr-eval). Libraries from jsDelivr:
  `tone@15.1.22/+esm`, `@spotify/basic-pitch@1.0.1/+esm`, `@tensorflow/tfjs@3.19.0/+esm` (the version jsDelivr
  resolves for basic-pitch 1.0.1's `^3.2.0` dependency, imported by the same URL so both share one TF.js instance),
  and the model files from `@spotify/basic-pitch@1.0.1/model/`. It prints JSON to copy back.
- Test here: r0271 (`scripts/test_foraaron.mjs`, `gtr-run --nolock`, wall 272.2 s): headless Chromium clicked both
  buttons (15 s per metronome run, webgl only); the 23 jsDelivr files were served from this lane's cache, filled with
  curl from the same URLs (no request was aborted). Both parts finished. Metronome (15 s, 30 clicks each): look-ahead,
  Tone.js and AudioWorklet idle 0 ms; setInterval idle largest 9.57 ms; busy: look-ahead 3 late clicks (largest
  9.52 ms), setInterval mean 40.68 ms, largest 102.63 ms, Tone.js 3 late (largest 29.84 ms), AudioWorklet 0 ms. Basic
  Pitch webgl on SwiftShader: model load 130 ms, inference 139.4 s, 62 notes found, 62 of 62 matched, mean onset error
  -3.92 ms. The page was not tested over the real CDN or from a `file://` address. Saved output:
  `samples/for-aaron-page/test_in_headless_chromium.json`.
