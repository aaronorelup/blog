# Lane 8, browser-audio-sync: survey of browser audio, sync, playback and in-browser analysis

Agent: docs-browser-audio-sync. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from live
sources on 2026-11-10 unless a line says otherwise. Raw copies of fetched pages, npm registry records, package
licence and README files are kept outside the repo in `/home/user/gtr/lanes/browser-audio-sync/docs-agent/` (not
committed); the shallow repository clones were deleted after reading because of the shared-disk notice, and the
README and licence files read from them are kept in `docs-agent/readmes/` and `docs-agent/repolic/`. The
script that read the npm registry is `scripts/docs_npm_meta.py` in this folder. This file records facts and
quotes only. It does not run the tools: the trials are in `trials.md` (written by the try-browser-audio-sync agent).

Checked by verify-docs-browser-audio-sync on 2026-11-10: every quoted passage was compared again with freshly fetched
copies of the cited pages, package files and repository files (copies kept outside the repo in
`/home/user/gtr/lanes/browser-audio-sync/verify-docs/`, not committed; scripts `scripts/verify_*.py` and
`scripts/verify_*.sh`). Text added or changed by the checker is marked "[verify]". The tally is in the Verification
log at the end of this file.

Marks used in the tool list:

- `RUNNABLE`: a JavaScript or WebAssembly library or a web platform API that can be loaded in the box's headless
  Chromium (Playwright) on CPU. Whether it actually ran is recorded in `trials.md`, not here.
- `RUNNABLE?`: loads in a browser, but its documented GPU path needs WebGPU or another feature whose availability in
  headless Chromium without a GPU is not established here (UNVERIFIED until a trial shows it).
- `KEY`: needs an account, a licence key or a commercial agreement to use as documented.

Versions and dates in the tool list come from the npm registry (`https://registry.npmjs.org/<package>`, field
`dist-tags.latest` and `time[<latest>]`), read 2026-11-10. "npm license field" is the package's own declaration;
the LICENSE file itself is quoted in each tool's section.

## Tool list

First pass written in the first 15 minutes; each line is re-checked in its own section below, and the section is
what counts. Every entry now points to its section.

### Web platform APIs (built into browsers, no package)

1. Web Audio API clock: `AudioContext.currentTime` and look-ahead scheduling of `AudioBufferSourceNode.start(when)`
   (W3C Web Audio API). https://webaudio.github.io/web-audio-api/ . RUNNABLE. Section 1.
2. AudioWorklet (`AudioWorkletNode`, `AudioWorkletProcessor`, Web Audio API). RUNNABLE. Section 2.
3. Output latency reporting: `AudioContext.baseLatency`, `outputLatency`, `getOutputTimestamp()`. RUNNABLE. Section 3.
4. `HTMLVideoElement.requestVideoFrameCallback()` (WICG spec). https://wicg.github.io/video-rvfc/ . RUNNABLE. Section 4.
5. `HTMLMediaElement.playbackRate` and `preservesPitch` (HTML Standard). RUNNABLE. Section 5.
6. WebCodecs (`AudioDecoder`, `VideoDecoder`, `VideoFrame`, W3C). https://www.w3.org/TR/webcodecs/ . RUNNABLE. Section 6.
7. Cross-origin isolation (COOP/COEP headers) as the condition for `SharedArrayBuffer` and WASM threads. Section 7.
8. WebGPU and WebNN as model-runtime backends (W3C). RUNNABLE? Section 8. [verify] `trials.md`, run r0042: in the
   box's headless Chromium 153, `navigator.gpu` exists but `requestAdapter()` returned null ("No available
   adapters."), so the WebGPU paths do not run on this box.

### Transport, scheduling and timers

9. Tone.js (`Tone.getTransport()`, `Tone.Player`, `GrainPlayer`, `PitchShift`), Yotam Mann. npm `tone` 15.1.22,
   2025-04-27, npm license field MIT. https://github.com/Tonejs/Tone.js . RUNNABLE. Section 9.
10. @tonejs/midi (MIDI file to JSON and back). 2.0.28, 2022-02-04, MIT. https://github.com/Tonejs/Midi . RUNNABLE. Section 10.
11. worker-timers (setInterval/setTimeout run in a Web Worker), Christoph Guttandin. 8.0.34, 2026-07-21, MIT. RUNNABLE. Section 11.
12. standardized-audio-context (cross-browser AudioContext). 25.3.77, 2024-08-31, MIT. RUNNABLE. Section 12.
13. WAAClock (scheduling events on the Web Audio clock), Sébastien Piquemal. 0.5.5, 2024-02-03, MIT. RUNNABLE. Section 13.
14. @ircam/sc-scheduling (scheduler and transport, IRCAM ISMM). 1.0.0, 2024-07-08, BSD-3-Clause. RUNNABLE. Section 14.

### Tab player with sync

15. alphaTab (CoderLine): player with metronome, count-in, backing track, sync points, Media Sync Editor, and a
    documented example of YouTube sync through the YouTube iframe API. npm `@coderline/alphatab` 1.9.0, 2026-10-31, npm license field MPL-2.0. https://alphatab.net . RUNNABLE. Section 15.

### Waveform display and regions

16. wavesurfer.js (waveform, regions, timeline, spectrogram plugins), katspaugh. 8.0.5, 2026-11-02, BSD-3-Clause.
    https://wavesurfer.xyz . RUNNABLE. Section 16.
17. peaks.js (BBC R&D origin; npm repository now codeberg.org/chrisn/peaks.js). 4.0.0, 2025-08-30, LGPL-3.0. RUNNABLE. Section 17.
18. waveform-data.js (BBC) plus the `audiowaveform` C++ CLI that precomputes peaks. waveform-data 4.5.2, 2025-06-07,
    LGPL-3.0. RUNNABLE. Section 18.

### Video decode, demux and sync

19. Mediabunny (read, write and convert media files with WebCodecs), Vanilagy. 1.65.2, 2026-11-04, MPL-2.0.
    https://mediabunny.dev . RUNNABLE. Section 19.
20. mp4box.js (GPAC, MP4 demux for WebCodecs). 2.5.0, 2026-10-25, BSD-3-Clause. RUNNABLE. Section 20.
21. web-demuxer (FFmpeg-based WASM demuxer for WebCodecs), ForeverSc. 4.0.0, 2025-12-20, npm license field empty. RUNNABLE. Section 21.

### Time-stretch and pitch-shift (slow practice)

22. SoundTouchJS (port of SoundTouch), cutterbl: `soundtouchjs` 0.3.0, 2026-02-04, LGPL-2.1;
    `@soundtouchjs/audio-worklet` and `@soundtouchjs/core` 2.1.1, 2026-08-03, npm license field MPL-2.0. RUNNABLE. Section 22.
23. Signalsmith Stretch (C++ library compiled to WASM with an AudioWorklet wrapper), Signalsmith Audio. npm
    `signalsmith-stretch` 1.3.2, 2025-06-27, MIT. RUNNABLE. Section 23.
24. Rubber Band Library in WASM: `rubberband-wasm` (Daninet) 3.3.0, 2024-12-23, npm "GPLv2"; `rubberband-web`
    (delude88) 0.2.1, 2022-10-18, GPL-2.0-or-later; `@echogarden/rubberband-wasm` 0.2.0, 2024-10-26, GPL-2.0-only.
    Rubber Band itself is dual-licensed (GPL or commercial). RUNNABLE. Section 24.
25. Bungee (Parabola Research) WASM build `bungee-pitch-shift` 1.0.8, 2025-10-25, npm license field MIT. RUNNABLE. Section 25.
26. Superpowered Web Audio SDK (WASM, time-stretch, pitch-shift, effects). `@superpoweredsdk/web` 2.8.2,
    2026-09-09, npm license field "SEE LICENSE IN /license". RUNNABLE under its evaluation licence (internal R&D
    only); KEY for any public release. Section 26.

### Sample playback and synthesis (reference playback of the tab)

27. smplr (SoundFont and sampled instruments on Web Audio), danigb. 1.2.0, 2026-11-06, MIT. RUNNABLE. Section 27.
28. soundfont-player (predecessor of smplr), danigb. 0.12.0, 2020-01-27, MIT. RUNNABLE. Section 28.
29. SpessaSynth (SoundFont2/DLS synth and MIDI player in TypeScript), spessasus. `spessasynth_lib` 4.4.7 and
    `spessasynth_core` 4.4.9, 2026-11-06, Apache-2.0. RUNNABLE. Section 29.
30. js-synthesizer (FluidSynth compiled to WASM), jet2jet. 1.13.0, 2026-04-20, BSD-3-Clause (FluidSynth: LGPL-2.1). RUNNABLE. Section 30.
31. WebAudioFont, surikov. 3.0.4, 2022-06-28, GPL-3.0-or-later. RUNNABLE. Section 31.
32. MidiPlayerJS (MIDI event player, no synth), grimmdude. 2.0.17, 2026-03-01, MIT. RUNNABLE. Section 32.

### In-browser analysis and model runtimes

33. Basic Pitch for the browser, Spotify: `@spotify/basic-pitch` (TensorFlow.js). 1.0.1, 2022-08-05, Apache-2.0. RUNNABLE. Section 33.
34. essentia.js (Essentia compiled to WASM, plus TF.js models), MTG-UPF. 0.1.3, 2021-06-24, AGPL-3.0. RUNNABLE. Section 34.
35. ONNX Runtime Web, Microsoft. `onnxruntime-web` 1.31.1, 2026-10-26, MIT. RUNNABLE (WASM); WebGPU RUNNABLE?. Section 35.
36. MediaPipe Tasks Vision (Hand Landmarker and other vision tasks in the browser), Google. `@mediapipe/tasks-vision` 1.2.2,
    2026-11-03, Apache-2.0 (also `@mediapipe/tasks-audio` 1.2.2). RUNNABLE. Section 36.
37. Transformers.js, Hugging Face. `@huggingface/transformers` 4.3.2, 2026-10-27, Apache-2.0 (older
    `@xenova/transformers` 2.17.2, 2024-05-29). RUNNABLE. Section 37.
38. ffmpeg.wasm: `@ffmpeg/ffmpeg` 0.12.15, 2025-01-07, MIT; `@ffmpeg/core` 0.12.10, 2025-01-07, and
    `@ffmpeg/core-mt` 0.12.10, 2025-04-28, npm license field GPL-2.0-or-later. RUNNABLE. Section 38.
39. TensorFlow.js (backends cpu, webgl, wasm, webgpu), Google. `@tensorflow/tfjs` 4.22.0, 2024-10-21, Apache-2.0. RUNNABLE. Section 39.
40. LiteRT.js (LiteRT / TFLite models in the browser), Google AI Edge. `@litertjs/core` 2.6.0, 2026-10-22, Apache-2.0. RUNNABLE?. Section 40.
41. Magenta.js (`@magenta/music`, includes Onsets and Frames piano transcription on TF.js). 1.23.1, 2021-11-01,
    Apache-2.0. RUNNABLE. Section 41.
42. ml5.js (wrapper over TF.js models such as HandPose, BodyPose, SoundClassifier). 1.4.0, 2026-08-07, npm license
    field MIT, while its LICENSE.md is the separate "ml5.js license". RUNNABLE. Section 42.
43. Meyda (audio feature extraction). 5.6.3, 2024-04-21, MIT. RUNNABLE. Section 43.
44. pitchy (McLeod pitch method, single pitch). 4.1.0, 2024-01-04, MIT. RUNNABLE. Section 44.
45. pitchfinder (YIN, AMDF, McLeod, dynamic wavelet). 2.3.4, 2025-12-16, npm license field "GNU v3". RUNNABLE. Section 45.
46. aubiojs (aubio compiled to WASM: pitch, tempo). 0.2.1, 2022-11-08, npm license field empty. RUNNABLE. Section 46.
47. web-audio-beat-detector (offline tempo/first-beat estimate). 8.2.39, 2026-08-26, MIT. RUNNABLE. Section 47.
48. realtime-bpm-analyzer (BPM from live or file audio). 5.6.1, 2026-11-03, Apache-2.0. RUNNABLE. Section 48.
49. OpenCV.js builds (`@techstark/opencv-js` 5.0.0-release.1, 2026-06-24, Apache-2.0) for fretboard geometry in
    the browser. RUNNABLE. Section 49.
50. In-browser Demucs builds: `demucs-web` (timcsy, ONNX Runtime Web) 1.0.2, 2025-12-01, MIT; `demucs-wasm`
    (bengfarrell) 0.1.5, 2025-01-29; demucs-rs (nikhilunni, Rust + Burn wgpu to WASM/WebGPU); sevagh's
    demucs.cpp / demucs.onnx (freemusicdemixer.com); Hugging Face ONNX exports (monteslu/htdemucs-web-onnx,
    webnn/stem-separator). RUNNABLE (WASM) / RUNNABLE? (WebGPU). Section 50. [verify] Also bakkot's demucs-js (npm
    `demucs` 1.0.0, 2025-10-07, npm license field "SEE LICENSE IN LICENSE.md", which says the bundled weights file is
    not covered by the code's MIT licence). Section 50.
51. Beat This! ONNX export for onnxruntime-web (Hugging Face `musetric/beat-this-onnx`). RUNNABLE?. Section 51.

### Found during the survey

52. OpenVoicing (pjdoland): open-source practice app built on alphaTab and the Signalsmith Stretch AudioWorklet,
    with recording and YouTube sync; last commit 2026-07-26; MIT. Section 52.

### Found by the checker [verify]

53. libav.js (Yahweasel): FFmpeg's libavformat, libavcodec, libavfilter, libavutil and libswresample compiled to
    WebAssembly (demux, decode, filter, resample in the page). npm `libav.js` 6.10.9, 2026-08-18, npm license field
    LGPL-2.1. RUNNABLE (not tried here). Section 53.
54. Further tools found by the checker are listed with one line each under "Not covered" at the end of this file.

### Added in gap round 2 (2026-11-11)

55. StemSplit's htdemucs_6s ONNX export (`StemSplitio/htdemucs-6s-onnx`, card licence field `mit`) in ONNX Runtime Web,
    with demucs-onnx's browser helpers (PyPI `demucs-onnx` 0.3.4, 2026-05-22, MIT): six stems including guitar.
    RUNNABLE (WASM, with graph optimizations disabled: `trials.md`, "Gap round 2"). Section 55.

## Sources used for the web platform sections (1 to 8)

- MDN pages were read from their source files in the `mdn/content` repository, fetched 2026-11-10 from
  `https://raw.githubusercontent.com/mdn/content/main/files/en-us/<path>/index.md` (the rendered page is
  `https://developer.mozilla.org/en-US/docs/<Path>`). MDN macros such as `{{domxref(...)}}` are kept as they
  appear in the source.
- Browser support rows come from MDN's browser-compat-data (BCD), read 2026-11-10 from
  `https://raw.githubusercontent.com/mdn/browser-compat-data/main/<area>/<Name>.json` with
  `scripts/docs_bcd.py`. The number is BCD's `version_added` for the first support statement; "mirror" means BCD
  copies the value from the desktop browser it derives from (Chrome for Edge and Chrome Android, Safari for Safari iOS).
- Web Audio API: the W3C publication read 2026-11-10 is Web Audio API 1.1, status "W3C Working Draft, 22 September
  2026", https://www.w3.org/TR/webaudio-1.1/ (the text says: "This document is intended to become a W3C Recommendation.").

## 1. Web Audio API clock and look-ahead scheduling

- What it is: the `AudioContext` clock (`currentTime`) and the `when` argument of `AudioScheduledSourceNode.start()`
  and of the `AudioParam.set*ValueAtTime()` methods. Specification: W3C Web Audio API 1.1 (Working Draft, 22 September
  2026), https://www.w3.org/TR/webaudio-1.1/ ; editor's draft https://webaudio.github.io/web-audio-api/ .
- How a program calls it: in page JavaScript, `const ctx = new AudioContext(); src.start(ctx.currentTime + t)`.
  No package. A metronome or tab player schedules each click or note at an absolute time on this clock.
- Spec definition of `currentTime` (https://www.w3.org/TR/webaudio-1.1/ , read 2026-11-10): "This is the time in
  seconds of the sample frame immediately following the last sample-frame in the block of audio most recently
  processed by the context’s rendering graph. If the context’s rendering graph has not yet processed a block of
  audio, then currentTime has a value of zero." and "Elapsed time in this system corresponds to elapsed time in the
  audio stream generated by the BaseAudioContext, which may not be synchronized with other clocks in the system."
- Render quantum: the same spec says "The AudioContext’s render quantum size is the default value of 128 frames."
  Web Audio 1.1 adds a `renderSizeHint` constructor option and a `renderQuantumSize` attribute; BCD lists both as
  experimental, Chrome 153, not in Firefox or Safari (BCD `api.AudioContext.AudioContext.options_renderSizeHint_parameter`,
  `api.BaseAudioContext.renderQuantumSize`, read 2026-11-10).
- MDN `BaseAudioContext.currentTime` (source `web/api/baseaudiocontext/currenttime/index.md`, read 2026-11-10):
  "While the context is running, this value advances in increments of one audio rendering block, or _render
  quantum_, and represents the start of the next block to be processed. For a block of 128 sample frames, this is
  approximately 2.9 ms at a {{domxref("BaseAudioContext.sampleRate", "sampleRate")}} of 44.1 kHz, or 2.7 ms at 48 kHz.
  Repeated reads can return the same value until the next block is processed." and "This audio timeline is separate
  from the system clock used by {{jsxref("Date.now()")}}. It stops advancing while the context is suspended."
- Reduced precision, same MDN page: "In Chrome and Safari, the browser does not apply additional timer rounding to
  this value." and "In Firefox, the `privacy.reduceTimerPrecision` preference is enabled by default and uses a
  rounding interval of 1 ms, or 0.02 ms in cross-origin-isolated contexts." and "At common sample rates such as
  44.1 kHz and 48 kHz, the default value therefore follows the audio block timing rather than being rounded."
- MDN `AudioScheduledSourceNode.start()` (source `web/api/audioscheduledsourcenode/start/index.md`, read 2026-11-10),
  parameter `when`: "The time, in seconds, at which the sound should begin to play. This value is specified in the
  same time coordinate system as the {{domxref("AudioContext")}} is using for its
  {{domxref("BaseAudioContext/currentTime", "currentTime")}} attribute. A value of 0 (or omitting the `when` parameter
  entirely) causes the sound to start playback immediately."
- Look-ahead scheduling pattern: Chris Wilson, "Scheduling web audio with precision" ("A Tale of Two Clocks"),
  https://web.dev/articles/audio-scheduling , page metadata "Last updated 2013-01-09 UTC", read 2026-11-10. Quotes:
  "the actual callback of timer events in JavaScript (through window.setTimeout() or window.setInterval) can easily
  be skewed by tens of milliseconds or more by layout, rendering, garbage collection, and XMLHTTPRequest and other
  callbacks" and "The following timing diagram shows what the metronome demo code actually does: it has a setTimeout
  interval of 25ms, but a much more resilient overlap: each call will schedule for the next 100ms. The downside of
  this long lookahead is that tempo changes, etc., will take a tenth of a second to take effect". MDN's "Advanced
  techniques" step-sequencer tutorial (source `web/api/web_audio_api/advanced_techniques/index.md`, read 2026-11-10)
  uses the same constants: `const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)`
  and `const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)`, and says: "This is a much stripped
  down version of [Chris Wilson's A Tale Of Two Clocks (2013)](https://web.dev/articles/audio-scheduling) article".
- Starting audio needs a user gesture: MDN "Autoplay guide for media and Web Audio APIs" (source
  `web/media/guides/autoplay/index.md`, read 2026-11-10): "In the [Web Audio API](/en-US/docs/Web/API/Web_Audio_API),
  a website or app can start playing audio using the `start()` method on a source node linked to the
  {{domxref("AudioContext")}}. Doing so outside the context of handling a user input event is subject to autoplay rules."
- Input / output: input is any `AudioBuffer` (decoded with `decodeAudioData`) or generated signal; output is sound
  at the context's sample rate. Times are seconds as double-precision floats on the context clock.
- Constraints that matter for re-runs: tempo, count-in length and click pattern are whatever the scheduling code
  computes; nothing in the API itself knows about tempo.
- Browser support (BCD `api.BaseAudioContext.currentTime`): Chrome 14, Edge 12, Firefox 25, Safari 6.
- Licence: a web platform API, no licence to accept. The W3C document carries the W3C document licence (not quoted
  here, not relevant to calling the API).

## 2. AudioWorklet

- What it is: custom audio processing (JavaScript or WebAssembly) on the audio rendering thread. Spec: Web Audio API
  1.1, https://www.w3.org/TR/webaudio-1.1/ . MDN: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet .
- Spec (read 2026-11-10): "The AudioWorklet object allows developers to supply scripts (such as JavaScript or
  WebAssembly code) to process audio on the rendering thread, supporting custom AudioNodes. This processing
  mechanism ensures synchronous execution of the script code with other built-in AudioNodes in the audio graph."
- MDN `AudioWorklet` (source `web/api/audioworklet/index.md`, read 2026-11-10): "The worklet's code is run in the
  {{domxref("AudioWorkletGlobalScope")}} global execution context, using a separate Web Audio thread which is shared
  by the worklet and other audio nodes."
- Secure context: MDN `AudioWorkletNode` (source `web/api/audioworkletnode/index.md`, read 2026-11-10): "Although the
  interface is available outside [secure contexts](/en-US/docs/Web/Security/Defenses/Secure_Contexts), the
  {{domxref("BaseAudioContext.audioWorklet")}} property is not, thus custom {{domxref("AudioWorkletProcessor")}}s
  cannot be defined outside them."
- Block size: MDN `AudioWorkletProcessor.process()` (source `web/api/audioworkletprocessor/process/index.md`, read
  2026-11-10), in a note block: "Currently, audio data blocks are always 128 frames" (the note continues on the next
  source lines: "long—that is, they contain 128 32-bit floating-point samples for each of the inputs'").
- How a program calls it: `await ctx.audioWorklet.addModule('proc.js'); new AudioWorkletNode(ctx, 'name')`; the
  processor's `process(inputs, outputs, parameters)` runs per block (MDN `process()` page: "The method is called
  synchronously from the audio rendering thread, once for each block" (sentence continues)). Messages to and from the main
  thread go through `node.port` (a `MessagePort`). The time-stretch libraries in sections 22 to 26 ship as
  AudioWorklet processors.
- Browser support (BCD `api.BaseAudioContext.audioWorklet`): Chrome 66, Firefox 76, Safari 14.1.
- [verify] Observed behaviour next to the documented one: `trials.md` ("How the trials were run") reports that in the
  box's headless Chromium 153, right after an AudioWorkletNode was created, its `process()` was not called for a few
  render quanta and `currentFrame` jumped by 384 to 1408 frames (one such jump per run, within the first 30 ms; logged
  in every result as `capture.gaps`), and that once a recorder's `process()` saw the same `currentFrame` twice (metronome
  section, run r0199). MDN's sentence above says the method is called "once for each block".
- Licence: web platform API, nothing to accept.

## 3. Output latency: baseLatency, outputLatency, getOutputTimestamp()

- Why it matters here: the time a click is heard is later than its `currentTime` by the output latency, and a
  `<video>` frame or a cursor drawn on screen lives on the `performance.now()` clock. `getOutputTimestamp()` is the
  documented mapping between the two clocks; `baseLatency` and `outputLatency` are the documented latency figures.
- Spec `baseLatency` (https://www.w3.org/TR/webaudio-1.1/ , read 2026-11-10): "This represents the number of
  seconds of processing latency incurred by the AudioContext passing the audio from the AudioDestinationNode to the
  audio subsystem. It does not include any additional latency that might be caused by any other processing between
  the output of the AudioDestinationNode and the audio hardware and specifically does not include any latency
  incurred the audio graph itself."
- Spec `outputLatency` (same page): "The estimation in seconds of audio output latency, i.e., the interval between
  the time the UA requests the host system to play a buffer and the time at which the first sample in the buffer is
  actually processed by the audio output device." and "The outputLatency attribute value may change while the context
  is running or the associated audio output device changes. It is useful to query this value frequently when
  accurate synchronization is required."
- Spec `getOutputTimestamp()` (same page): "Returns a new AudioTimestamp instance containing two related audio stream
  position values for the context: the contextTime member contains the time of the sample frame which is currently
  being rendered by the audio output device (i.e., output audio stream position), in the same units and origin as
  context’s currentTime; the performanceTime member contains the time estimating the moment when the sample frame
  corresponding to the stored contextTime value was rendered by the audio output device, in the same units and origin
  as performance.now() (described in [hr-time-3])." The spec then gives this conversion function:
  `function outputPerformanceTime(contextTime) { const timestamp = context.getOutputTimestamp(); const elapsedTime =
  contextTime - timestamp.contextTime; return timestamp.performanceTime + elapsedTime * 1000; }`.
- MDN `baseLatency` (source `web/api/audiocontext/baselatency/index.md`, read 2026-11-10): "You can request a certain
  latency during {{domxref("AudioContext.AudioContext()", "construction time", "", "true")}} with the `latencyHint`
  option, but the browser may ignore the option."
- MDN `outputLatency` (source `web/api/audiocontext/outputlatency/index.md`, read 2026-11-10): "It varies depending on
  the platform and the available hardware."
- Output: three doubles in seconds (`baseLatency`, `outputLatency`) and an object `{contextTime (s),
  performanceTime (ms)}`.
- Browser support (BCD, read 2026-11-10): `baseLatency` Chrome 58, Firefox 70, Safari 14.1; `outputLatency` Chrome
  102, Firefox 70, Safari 18.4; `getOutputTimestamp` Chrome 57, Firefox 70, Safari 14.1; constructor option
  `latencyHint` Chrome 58, Firefox `false` (BCD's value for not supported), Safari 14.1.
- What a headless browser reports for these values on the research box is a trial question (see `trials.md`).
  [verify] `trials.md` reports, for the box's headless Chromium 153 (no sound device): `baseLatency` 0.01 s,
  `outputLatency` 0.032 s read after 3 s of running and 0 read right after `resume()`, `latencyHint: "playback"`
  giving 0.02322 s and 0.072 s, `playbackStats` present with `averageLatency` 0.031183 s (runs r0042, r0143, r0150;
  the r0042 values are also in `samples/chromium-probe/probe_headless_shell.json`).
- Glitch statistics: Web Audio 1.1 adds "An AudioPlaybackStats interface, which provides statistics about the audio
  played from the AudioContext." (https://www.w3.org/TR/webaudio-1.1/ , read 2026-11-10). BCD
  `api.AudioContext.playbackStats`: experimental, Chrome 146, not in Firefox or Safari (read 2026-11-10).
- `performance.now()` precision, MDN (source `web/api/performance/now/index.md`, read 2026-11-10): "To offer
  protection against timing attacks and [fingerprinting](/en-US/docs/Glossary/Fingerprinting), `performance.now()` is
  coarsened based on whether or not the document is {{domxref("Window.crossOriginIsolated","cross-origin
  isolated","","nocode")}}." followed by the list "Resolution in isolated contexts: 5 microseconds" and "Resolution in
  non-isolated contexts: 100 microseconds".

## 4. HTMLVideoElement.requestVideoFrameCallback()

- What it is: a per-video-frame callback that reports the media time of the frame being composited. Spec:
  "HTMLVideoElement.requestVideoFrameCallback()", Draft Community Group Report, 2 August 2024, editor Thomas Guilbert
  (Google), https://wicg.github.io/video-rvfc/ , read 2026-11-10. The spec says: "This specification was published by
  the Web Platform Incubator Community Group." and "It is not a W3C Standard nor is it on the W3C Standards Track."
- How a program calls it: `video.requestVideoFrameCallback((now, metadata) => { ...; video.requestVideoFrameCallback(cb) })`.
- Output fields (MDN source `web/api/htmlvideoelement/requestvideoframecallback/index.md`, read 2026-11-10): `now`,
  and `metadata` with `expectedDisplayTime`, `height`, `mediaTime`, `presentationTime`, `presentedFrames`,
  `processingDuration`, `width` (plus `captureTime`, `receiveTime`, `rtpTimestamp` for WebRTC). MDN on `mediaTime`:
  "A number, in seconds, representing the media presentation timestamp of the presented frame. This is equal to the
  frame's timestamp on the {{domxref("HTMLMediaElement.currentTime")}} timeline." On `presentedFrames`: "This can be
  used to detect whether frames were missed between callback instances."
- Rate: MDN, same page: "More specifically, the callback will run at the lower of the video frame rate and the
  browser paint refresh rate. For example, a video with a frame rate of 25fps playing in a browser that paints at
  60Hz would fire callbacks at a rate of 25Hz."
- Limits, spec (https://wicg.github.io/video-rvfc/ , read 2026-11-10): "Best effort in this case means that, even
  with a normal work load, a callback can occasionally be fired one v-sync late, relative to when the new video frame
  was presented." and "Additionally, if there is a heavy load on the main thread, we might not get a callback for
  every frame (as measured by a discontinuity in the presentedFrames)." Spec on `mediaTime`: "The media presentation
  timestamp (PTS) in seconds of the frame presented (e.g. its timestamp on the video.currentTime timeline). MAY have
  a zero value for live-streams or WebRTC applications."
- MDN lists among use cases "synchronization with external audio sources" and states: "The API runs on the main
  thread, while video compositing likely happens on a separate compositing thread."
- Use in this app: pair each `mediaTime` with the frame for hand tracking (MediaPipe, section 36), and map tab
  cursor time to video time.
- Browser support (BCD `api.HTMLVideoElement.requestVideoFrameCallback`): Chrome 83, Firefox 132, Safari 15.4.

## 5. HTMLMediaElement.playbackRate and preservesPitch

- What it is: built-in speed change of `<audio>`/`<video>` with or without pitch correction. Spec: HTML Living
  Standard, media elements, https://html.spec.whatwg.org/multipage/media.html , read 2026-11-10.
- HTML Standard: "Returns true if pitch-preserving algorithms are used when the playbackRate is not 1.0. The default
  value is true." and "If the element's playbackRate is not 1.0 and preservesPitch is true, the user agent must apply
  pitch adjustment to preserve the original pitch of the audio. Otherwise, the user agent must speed up or slow down
  the audio without any pitch adjustment." The standard does not name the pitch-preserving algorithm (searched the
  page for "pitch": only these definitions).
- MDN `playbackRate` (source `web/api/htmlmediaelement/playbackrate/index.md`, read 2026-11-10): "The audio is muted
  when the fast forward or slow motion is outside a useful range (for example, Gecko mutes the sound outside the range
  `0.25` to `4.0`)." and "The pitch of the audio is corrected by default."
- How a program calls it: `video.playbackRate = 0.5; video.preservesPitch = true;`. `playbackRate` is a property of
  the media element only, so a click track scheduled on an `AudioContext` (section 1) does not change speed with it;
  its click times have to be computed for the slowed tempo.
- Browser support (BCD): `preservesPitch` Chrome 86, Firefox 101, Safari 17.2 (Safari 4 with the `webkit` prefix);
  `playbackRate` Chrome 3, Firefox 20, Safari 3.1.
- [verify] Measured in `trials.md` (run r0225, analysis r0333, Chromium 153): an `<audio>` element playing S1 at
  `playbackRate` 0.5 and 0.75 with `preservesPitch` true kept the first note within 1.2 cents of the original and the
  audible span 1.99978 and 1.33276 times as long; at 0.75 with `preservesPitch` false the first note moved -498.05
  cents.

## 6. WebCodecs

- What it is: frame-level decode and encode of audio and video. Spec: WebCodecs, status "W3C Working Draft, 9
  November 2026", https://www.w3.org/TR/webcodecs/ , read 2026-11-10.
- MDN (source `web/api/webcodecs_api/index.md`, read 2026-11-10): "The **WebCodecs API** enables web developers to
  encode and decode video and audio in the browser efficiently (using hardware acceleration) and with very low-level
  control (processing on a per-frame basis)." and "A `VideoFrame` represents a video frame, and is tied to actual
  pixel data on the device's graphics memory, as well as metadata such as the timestamp and duration (in
  microseconds), format and resolution." and "There is no direct integration with the [Web Audio
  API](/en-US/docs/Web/API/Web_Audio_API); however, the extracted `Float32Array` samples can be copied directly into
  an {{domxref("AudioBuffer")}} for playback." and "Encoders and decoders must be configured with fully specified
  codec strings (such as `"vp09.00.40.08.00"` for VP9 or `"avc1.4d0034"` for H.264)".
- Available in windows and dedicated workers (MDN macro `{{AvailableInWorkers("window_and_dedicated")}}`).
- WebCodecs does not demux containers: the input is `EncodedVideoChunk`/`EncodedAudioChunk`, so an MP4 or WebM file
  needs a demuxer first (Mediabunny, mp4box.js, web-demuxer: sections 19 to 21).
- Output: `VideoFrame` (timestamp and duration in microseconds, per the MDN sentence above) and `AudioData`; MDN: "An
  `AudioData` object represents a number of individual audio samples (1024 is a typical number). Audio sample data can
  be extracted as a {{jsxref("Float32Array")}} via the `copyTo` method."
- Browser support (BCD): `VideoDecoder` Chrome 94, Firefox 130, Safari 16.4; `AudioDecoder` Chrome 94, Firefox 130,
  Safari 26; `VideoFrame` Chrome 94, Firefox 130, Safari 16.4.
- Which codecs the box's Playwright Chromium decodes is a trial question (proprietary codecs such as H.264 and AAC
  depend on the build). [verify] Settled by `trials.md`, run r0042 (Chromium 153 headless shell; r0050 full build
  gave the same): `VideoDecoder.isConfigSupported` true for H.264, VP8, VP9 and AV1 with `no-preference` and
  `prefer-software`, false for all with `prefer-hardware`, HEVC false; `AudioDecoder.isConfigSupported` true for AAC,
  Opus, MP3, pcm-s16 and pcm-f32, while FLAC and Vorbis threw "description is required" (they need the codec
  description from a container).

## 7. Cross-origin isolation for SharedArrayBuffer and WASM threads

- Why it matters: multi-threaded WASM builds (ffmpeg.wasm `core-mt`, ONNX Runtime Web with `numThreads > 1`, the
  TF.js `tfjs-backend-wasm-threaded-simd.wasm` build, in-browser Demucs builds such as demucs-web, section 50) need
  `SharedArrayBuffer`.
- MDN `SharedArrayBuffer` (source `web/javascript/reference/global_objects/sharedarraybuffer/index.md`, read
  2026-11-10): "To use shared memory your document must be in a [secure context](/en-US/docs/Web/Security/Defenses/Secure_Contexts)
  and {{domxref("Window.crossOriginIsolated","cross-origin isolated","","nocode")}}." and "When cross-origin isolated,
  `postMessage()` no longer throws for `SharedArrayBuffer` objects, and shared memory across threads is therefore
  available."
- MDN `Window.crossOriginIsolated` (source `web/api/window/crossoriginisolated/index.md`, read 2026-11-10): "A
  document will be cross-origin isolated if it is returned with an HTTP response that includes the headers:" then
  "{{HTTPHeader("Cross-Origin-Opener-Policy")}} header with the directive `same-origin`." and
  "{{HTTPHeader("Cross-Origin-Embedder-Policy")}} header with the directive `require-corp` or `credentialless`."
  and "Access to the APIs must also be allowed by the `Permissions-Policy`
  {{HTTPHeader("Permissions-Policy/cross-origin-isolated", "cross-origin-isolated")}}."
- MDN COEP header (source `web/http/reference/headers/cross-origin-embedder-policy/index.md`, read 2026-11-10): "If
  CORS is not supported for some images, a COEP value of `credentialless` can be used as an alternative to load the
  image without any explicit opt-in from the cross-origin server, at the cost of requesting it without cookies."
- Consequence for a page that embeds third-party content (for example a YouTube iframe for alphaTab's YouTube sync,
  section 15): every cross-origin subresource must be CORS/CORP-enabled, or COEP `credentialless` used. That a given
  embed works under COEP is UNVERIFIED here.
- Browser support (BCD): `SharedArrayBuffer` Chrome 68, Firefox 79, Safari 15.2, Chrome Android 89; COEP header
  Chrome 83, Firefox 79, Safari 15.2; COEP `credentialless` Chrome 96, Firefox 119, Safari not supported (BCD
  `http/headers/Cross-Origin-Embedder-Policy.json`, read 2026-11-10).

## 8. WebGPU and WebNN (backends for in-browser models)

- WebGPU: status "W3C Candidate Recommendation Draft, 15 September 2026", https://www.w3.org/TR/webgpu/ , read
  2026-11-10. BCD `api.GPU` (read 2026-11-10): Chrome 144 with the note "Supported on ChromeOS, macOS, Windows, and
  Linux (Intel Gen12+ GPUs only)." and an earlier partial entry from Chrome 113 ("Supported on ChromeOS, macOS, and
  Windows."); Firefox 141 partial ("Supports Windows since Firefox 141"); Safari 26; Chrome Android 121.
  [verify] Re-read 2026-11-10 (https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/GPU.json, script
  `scripts/verify_bcd.py`): the numbers above match; the Firefox entry carries further notes: "Supports macOS Tahoe on
  Apple silicon since Firefox 145.", "Supports older macOS versions on Apple silicon since Firefox 147.", "Does not
  support macOS on Intel CPUs." and "Does not support Linux." (each followed by a bug link).
- WebNN: Web Neural Network API, status "W3C Candidate Recommendation Draft, 21 October 2026", https://www.w3.org/TR/webnn/ ,
  read 2026-11-10. BCD `api.ML` (read 2026-11-10): experimental, Chrome 112 behind a flag, not in Firefox or Safari.
  (The MDN page `web/api/webnn_api/index.md` returned HTTP 404 on 2026-11-10.)
- Whether the box's headless Chromium exposes a WebGPU adapter without a GPU is a trial question. [verify] Settled by
  `trials.md`, runs r0042 and r0050: `navigator.gpu` exists, `requestAdapter()` returned null ("No available
  adapters."); WebGL 2.0 ran on "SwiftShader Device (Subzero)" (software). Saved result:
  `samples/chromium-probe/probe_headless_shell.json` (`webgpu: {"navigator_gpu": true, "adapter": null}`).
- Used by: ONNX Runtime Web (`webgpu`, `webnn` execution providers), Transformers.js (`device: 'webgpu'`), TF.js
  (`@tensorflow/tfjs-backend-webgpu`), LiteRT.js, MediaPipe Tasks (GPU delegate), the in-browser Demucs builds.

## Sources used for the library sections (9 onwards)

- Version, publish date, declared licence and unpacked size: npm registry, `https://registry.npmjs.org/<package>`,
  read 2026-11-10 by `scripts/docs_npm_meta.py` (fields `dist-tags.latest`, `time[latest]`, `license`,
  `dist.unpackedSize`). Unpacked size is the size of the published package on disk, not the bytes a browser loads.
- Licence files quoted below were read from the files shipped inside the published npm package, fetched from
  `https://unpkg.com/<package>@<version>/<file>` on 2026-11-10 by `scripts/docs_npm_files.py`, unless the line names
  a repository file instead. When a package ships no licence file, the repository's file was read from a shallow
  clone (`git clone --depth 1 --filter=blob:none https://github.com/<owner>/<repo>`) made 2026-11-10, and the
  line says so. `scripts/docs_license_scan.py` checked that each quoted standard sentence occurs verbatim in the file.
- Before hand-off, `scripts/docs_quote_check.py` compared the quoted passages of this file with the saved copies of
  the pages, packages and repository files (2026-11-10); passages it flagged were corrected or re-checked by hand
  (its remaining flags are quote-pairing artefacts around embedded quotation marks, MDN macros and markdown links).
- "Last commit" dates are the committer date of the default branch's HEAD in that shallow clone, 2026-11-10.
- The standard MIT grant sentence quoted for MIT packages is: "Permission is hereby granted, free of charge, to any
  person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the
  Software without restriction". The standard BSD sentence is: "Redistribution and use in source and binary forms,
  with or without modification, are permitted provided that the following conditions are met". The Apache-2.0 grant
  is: "Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual,
  worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license". Each section says which of these
  the named file contains verbatim.

## 9. Tone.js

- What: "Tone.js is a Web Audio framework for creating interactive music in the browser." (README in npm package
  `tone@15.1.22`, read 2026-11-10). Author in LICENSE: "Copyright (c) 2014-2020 Yotam Mann". Repository
  https://github.com/Tonejs/Tone.js (last commit 2026-10-31); docs https://tonejs.github.io/docs/ .
- Version: npm `tone` 15.1.22, published 2025-04-27; unpacked size 5,401,640 bytes.
- How a program calls it: browser ES module (`import * as Tone from "tone"`); `await Tone.start()` after a user
  gesture; `Tone.getTransport()` with `bpm` (the README shows `Tone.getTransport().bpm.rampTo(800, 10)`) and
  `start()`; `Tone.Loop` for repeating callbacks; `Tone.Player` for samples; `Tone.Sampler` for pitched samples (all
  four names appear in the README read 2026-11-10).
- README quotes (read 2026-11-10): "`Tone.getTransport()` returns the main timekeeper. Unlike the AudioContext clock,
  it can be started, stopped, looped and adjusted on the fly." and "Since Javascript callbacks are **not precisely
  timed**, the sample-accurate time of the event is passed into the callback function. **Use this time value to
  schedule the events**." and "`Tone.start()` returns a promise, the audio will be ready only after that promise is
  resolved. Scheduling or playing audio before the AudioContext is running will result in silence or incorrect
  scheduling."
- Scheduling defaults, from the shipped source `build/esm/core/context/Context.js` (https://unpkg.com/tone@15.1.22/build/esm/core/context/Context.js ,
  read 2026-11-10): `clockSource: "worker", latencyHint: "interactive", lookAhead: 0.1, updateInterval: 0.05`, and the
  doc comment on `lookAhead`: "The amount of time into the future events are scheduled. Giving Web Audio a short
  amount of time into the future to schedule events can reduce clicks and improve performance. This value can be set
  to 0 to get the lowest latency." [verify] `trials.md` (run r0199) reports the same values read at run time from
  Tone's context in Chromium: lookAhead 0.1 s, updateInterval 0.05 s, clockSource "worker".
- Time-stretch inside Tone.js: `GrainPlayer`, shipped source `build/esm/source/buffer/GrainPlayer.js`: "Granular
  Synthesis enables you to adjust pitch and playback rate independently. The grainSize is the amount of time each
  small chunk of audio is played for and the overlap is the amount of crossfading transition time between successive
  grains." `PitchShift` (`build/esm/effect/PitchShift.js`): "PitchShift does near-realtime pitch shifting to the
  incoming signal. The effect is achieved by speeding up or slowing down the delayTime of a DelayNode using a sawtooth wave."
- Input: audio URLs or `AudioBuffer`s; event times in seconds or in Tone's musical notation (the README's examples
  use "8n" and "4n"). Output: a Web Audio graph. Constraint hooks for re-runs: `bpm` and the Transport's start, stop
  and loop (README: "it can be started, stopped, looped and adjusted on the fly").
- Licence (file `LICENSE.md` in the npm package): first line "MIT License", "Copyright (c) 2014-2020 Yotam Mann",
  contains the standard MIT grant sentence verbatim.

## 10. @tonejs/midi

- What: "Midi makes it straightforward to read and write MIDI files with Javascript." (README in
  `@tonejs/midi@2.0.28`, read 2026-11-10). Repository https://github.com/Tonejs/Midi (last commit 2023-05-31).
- Version: 2.0.28, published 2022-02-04; unpacked 287,668 bytes.
- How a program calls it: `import { Midi } from "@tonejs/midi"; const midi = new Midi(arrayBuffer)` (or
  `Midi.fromUrl`), and `midi.toArray()` to write.
- Output fields, README (read 2026-11-10): header `tempos`, `timeSignatures`, `PPQ` ("the Pulses Per Quarter of the
  midi file"); per track `notes` with `midi: Number, // midi number, e.g. 60`, `time: Number, // time in seconds`,
  `ticks: Number, // time in ticks`, `name`, `pitch`, `octave`, `velocity: Number, // normalized 0-1 velocity`,
  `duration: Number, // duration in seconds between noteOn and noteOff`; control changes with `ticks`, `time`,
  `value`. The README does not mention pitch bends (searched for "pitchBend" on 2026-11-10). [verify] The shipped
  type files settle it: https://unpkg.com/@tonejs/midi@2.0.28/dist/Track.d.ts declares `pitchBends: PitchBend[];`
  (doc comment "The pitch bend events.") and `addPitchBend(...)`, and
  https://unpkg.com/@tonejs/midi@2.0.28/dist/PitchBend.d.ts gives each bend `value`, `ticks` and a `time` getter
  documented as "The time of the event in seconds" (both read 2026-11-10).
- Use here: turns a transcriber's MIDI (Basic Pitch, section 33) into timed note objects for a Web Audio player.
- Licence (file `LICENSE.md` in the npm package): "[The MIT License](http://opensource.org/licenses/MIT)",
  "Copyright © 2016 Yotam Mann", standard MIT grant sentence present verbatim.

## 11. worker-timers

- What: README of `worker-timers@8.0.34` (read 2026-11-10): "**A replacement for setInterval() and setTimeout()
  which works in unfocused windows.**" and "Chrome, Firefox and maybe others throttle the frequency at which they
  invoke those timers to a maximum of once per second in such a situation. However this is only true for the main
  thread and does not affect the behavior of [Web Workers](http://www.w3.org/TR/workers/). Therefore it is possible
  to avoid the throttling by using a worker to do the actual scheduling. This is exactly what `worker-timers` does."
  Repository https://github.com/chrisguttandin/worker-timers (last commit 2026-09-01).
- Version 8.0.34, published 2026-07-21; unpacked 41,774 bytes.
- Use here: drives the look-ahead loop of section 1 when the tab is in the background (Tone.js does the same
  internally with `clockSource: "worker"`, section 9).
- Licence (`LICENSE` in package): "MIT License", "Copyright (c) 2026 Christoph Guttandin", standard MIT grant present.

## 12. standardized-audio-context

- What: README of `standardized-audio-context@25.3.77` (read 2026-11-10): "**A cross-browser wrapper for the Web
  Audio API which aims to closely follow the standard.**" and "In contrast to other popular polyfills
  `standardized-audio-context` does not patch or modify anything on the global scope." Repository
  https://github.com/chrisguttandin/standardized-audio-context (last commit 2026-09-01).
- Version 25.3.77, published 2024-08-31; unpacked 2,980,777 bytes.
- Licence (`LICENSE`): "MIT License", "Copyright (c) 2024 Christoph Guttandin", standard MIT grant present.

## 13. WAAClock

- What: README of `waaclock@0.5.5` (read 2026-11-10): "`WAAClock` is a small library to help you schedule things in
  time with Web Audio API." API shape from the README: `clock.callbackAtTime(fn, time)`, `clock.setTimeout(fn,
  delay)`, `.repeat(interval)`. Repository https://github.com/sebpiq/WAAClock (last commit 2024-02-03).
- Version 0.5.5, published 2024-02-03; unpacked 17,604 bytes.
- Licence (`LICENSE-MIT`): "The MIT License (MIT)", "Copyright (c) 2013 - 2015 Sébastien Piquemal", standard MIT
  grant present.

## 14. @ircam/sc-scheduling

- What: README of `@ircam/sc-scheduling@1.0.0` (read 2026-11-10): "Simple library to schedule events in Node.js and
  the browser." and "The abstractions provided by the library are built in such way that they can be used in
  distributed contexts, allowing to synchronize events and controls among multiple devices and clients."
  Repository https://github.com/ircam-ismm/sc-scheduling (last commit 2024-08-02).
- Version 1.0.0, published 2024-07-08; unpacked 121,377 bytes.
- Licence (`LICENSE`): "Copyright (c) 2023-present IRCAM – Centre Pompidou (France, Paris)", BSD three-clause text
  (standard BSD redistribution sentence and the no-endorsement clause present verbatim). The no-endorsement clause
  reads: "Neither the name of the IRCAM nor the names of its contributors may be used to endorse or promote products
  derived from this software without specific prior written permission."

## 15. alphaTab: metronome, count-in, backing track, sync points, external media

- What: home page https://alphatab.net (read 2026-11-10): "alphaTab renders interactive guitar tabs and sheet music
  from Guitar Pro, MusicXML, Capella, and the built-in alphaTex syntax. One core, three runtimes — JavaScript, .NET,
  and Kotlin for Android." Maker: Daniel Kuschny and contributors (CoderLine). Repository
  https://github.com/CoderLine/alphaTab (last commit 2026-11-08). The rendering and editing side is covered by the
  `web-tab-render` lane; this section records the playback and sync features.
- Version: npm `@coderline/alphatab` 1.9.0, published 2026-10-31; unpacked 14,411,907 bytes (includes a SoundFont in
  `dist/soundfont/`).
- How a program calls it: `new alphaTab.AlphaTabApi(element, settings)`; `settings.player.playerMode` and the API
  members below. Docs read 2026-11-10:
  - Player modes, https://alphatab.net/docs/reference/settings/player/playermode : default
    `playerMode: PlayerMode = PlayerMode.Disabled;` and "If the synthesizer is used (via EnabledAutomatic or
    EnabledSynthesizer ) a sound font is needed so that the midi synthesizer can produce the audio samples." The
    audio-video guide also names `PlayerMode.EnabledBackingTrack` and `PlayerMode.EnabledExternalMedia`.
  - Output, https://alphatab.net/docs/reference/settings/player/outputmode : "Controls how alphaTab will play the
    audio samples in the browser." default `outputMode: PlayerOutputMode = PlayerOutputMode.WebAudioAudioWorklets;`.
    (The `playeroutputmode` reference URL returned the site's home page on 2026-11-10, so the list of other values
    was not read.) [verify] The URL tried (per the name of the docs agent's saved copy) was
    https://alphatab.net/docs/reference/types/synth/playeroutputmode/ , which does return the home page (same 99,172
    bytes, re-fetched 2026-11-10). The outputMode page links instead to
    https://alphatab.net/docs/reference/types/playeroutputmode (read 2026-11-10): "Lists the different modes how
    alphaTab will play the generated audio." with two members, `WebAudioAudioWorklets` (0): "If audio worklets are
    available in the browser, they will be used for playing the audio. It will fallback to the ScriptProcessor output
    if unavailable." and `WebAudioScriptProcessor` (1): "Uses the legacy ScriptProcessor output which might perform
    worse."
  - Metronome, https://alphatab.net/docs/reference/api/metronomevolume : "The metronome volume as percentage (0-1).
    Gets or sets the volume of the metronome. By default the metronome is disabled but can be enabled by setting the
    volume different." (`metronomeVolume: number = 0;`)
  - Count-in, https://alphatab.net/docs/reference/api/countinvolume : "The volume of the count-in metronome ticks.
    Gets or sets the volume of the metronome during the count-in of the song. By default the count-in is disabled but
    can be enabled by setting the volume different." (`countInVolume: number = 0;`)
  - Count-in and metronome feature page, https://alphatab.net/docs/features/play-sync/count-in-and-metronome :
    "While the count-in is playing, playerPositionChanged reports a negative currentTick." and "Every metronome tick
    fires through midiEventsPlayed as an AlphaTabMetronomeEvent." and, for pick-up bars, "Count-in: counts one full
    bar and continues until the beat playback starts on."
  - Speed, https://alphatab.net/docs/reference/api/playbackspeed : "Controls the current playback speed as percentual
    value. Normal speed is 1.0 (100%) and 0.5 would be 50%." (`playbackSpeed: number = 1;`)
  - Position events, https://alphatab.net/docs/reference/types/synth/positionchangedeventargs/ : fields documented as
    "The current time position within the song in midi ticks.", "The current time position within the song in
    milliseconds.", "The total length of the song in midi ticks.", "The total length of the song in milliseconds.",
    plus `isSeek: boolean;`, `originalTempo: number;`, `modifiedTempo: number;`.
- Backing track and external media, https://alphatab.net/docs/guides/audio-video-sync (read 2026-11-10):
  "alphaTab can be synchronized with an external audio or video backing track. You can either use Guitar Pro 8 files
  with an audio track or synchronize alphaTab with an external media using the Media Sync Editor in the Playground."
  "At this point alphaTab cannot mix the synthesized audio and a backing track together, therefore only either audio
  will be heard." Prerequisites listed: "The data model ships the backing track audio file.", "The data model ships
  sync points which aligns the external audio track with the music notation.", "You enabled the backing track via
  either PlayerMode.EnabledAutomatic or PlayerMode.EnabledBackingTrack." and "Your platform (browser, operating
  system,...) has to support the embedded audio file." Also: "Also we do not support changes in the audio (like
  adjusting the pitch)." For any other player: "To properly synchronize alphaTab and an external media source (audio
  or video) the alphaTab.synth.IExternalMediaHandler interface has to be implemented and provided to alphaTab." and
  "This update should happen at a rate smaller than two subsequent notes. 50ms updates have shown to work well on
  even fast songs". On YouTube: "Until now we decided to NOT ship a direct YouTube integration as there are quite
  some implications to it." followed by a worked example using the YouTube iframe API.
- [verify] Interface members, https://alphatab.net/docs/reference/types/synth/iexternalmediahandler (read
  2026-11-10): properties `backingTrackDuration` ("The total duration of the backing track in milliseconds."),
  `masterVolume` ("The volume at which the output should play (0-1)"), `playbackRate`; methods `play()`, `pause()`
  and `seekTo(time: number)` with `time` "The absolute time in milliseconds.". `api.updateSyncPoints()`,
  https://alphatab.net/docs/reference/api/updatesyncpoints : "since 1.6.0", "Triggers an update of the sync points
  for the current score after modification within the data model".
- Sync point data, https://alphatab.net/docs/features/play-sync/sync-points-at-runtime (read 2026-11-10): "For
  serialization and programmatic construction, use the flat form (FlatSyncPoint), which flattens that model into a
  plain object with four fields:" then "barIndex — the index of the target masterbar in score.masterBars.",
  "barPosition — a 0..1 ratio inside the bar. 0 is the downbeat, 0.5 is the halfway point, 1 is the next barline.",
  "barOccurence — the repeat count this sync point applies to (0 for the first pass, 1 for the second pass through the
  same bar after a repeat).", "millisecondOffset — the audio timestamp in milliseconds this point maps to." and "After
  applying the list, call api.updateSyncPoints() to regenerate the internal midi-time mapping." Helpers:
  `applyFlatSyncPoints(list)` and `exportFlatSyncPoints()` on the Score model.
- Runtime type `BackingTrackSyncPoint`, https://alphatab.net/docs/reference/types/synth/backingtracksyncpoint/ :
  `SyncTime`: "The millisecond time in the external media marking the synchronization point."; `SyncBpm`: "The BPM
  the song will have virtually after this sync point to align the external media time axis with the one from the
  synthesizer."; `masterBarIndex`: "This property is purely informative for external use like in editors. It has no
  impact to the synchronization itself."
- Media Sync Editor, https://alphatab.net/docs/guides/media-sync-editor (read 2026-11-10): "The Synth / Audio /
  YouTube switch selects what the notation plays with and is synchronized to"; "Sync points are markers that are
  pinned to a media time. They are drawn as full-height lines with their bar number. All other markers are placed
  automatically between the sync points, following the tempo of the notation."; "YouTube does not give access to the
  raw audio, so there is no waveform for videos."; exports: "Synced Guitar Pro file (audio only)", "Sync point code:
  the sync points as TypeScript, C#, Kotlin or alphaTex", and "Write into alphaTex (alphaTex files only): replaces the
  \sync lines of the alphaTex in the editor with the current sync points". When the media loads, the editor creates
  "Sync Points according to the audio start and end" and "Sync Points for all tempo changes and place them according
  to the played speed."
- Release history: https://alphatab.net/docs/releases/release1_6 (read 2026-11-10) introduces the feature: "This is
  the highlight feature of this release. It covers all extensions needed to synchronize the music sheet shown by
  alphaTab with an external media like audio backing tracks and videos." and "With the new audio export API you can
  obtain the audio as you need it." The 1.9 notes (https://alphatab.net/docs/releases/release1_9) add: "The
  count-in counts one full bar and continues up to the beat where playback starts, also when you start in the middle
  of a bar." (The URL https://alphatab.net/docs/alphatex/sync-points found by web search returned the site's home
  page on 2026-11-10; the alphaTex `\sync` syntax is therefore cited only through the Media Sync Editor page.)
  [verify] The 1.9 release notes link to https://alphatab.net/docs/alphatex/bar-metadata#sync , which documents it
  (read 2026-11-10): syntax `\sync (barIndex occurence millisecondOffset ratioPosition)`, "Adds a new sync point for
  synchronizing the music sheet with an external media source like a backing track or video player.", parameters
  barIndex "The index of the bar being synced", occurence "The occurence of the bar for which this sync point applies
  (on repeats)", millisecondOffset "The absolute millisecond offset within the external media", ratioPosition "The
  relative position within the bar where the synchronization happens" (its "Required" cell reads "no" followed by
  "0"; the other three read "yes"); the page's example lines
  include `\sync 0 0 1500 0.666`.
- [verify] Import formats, https://alphatab.net/docs/category/formats ("File Formats", read 2026-11-10): Guitar Pro 8
  (.gp), Guitar Pro 7 (.gp), Guitar Pro 6 (.gpx), Guitar Pro 3-5 (.gp3, .gp4, .gp5), MusicXML (.musicxml),
  Capella/CapXML (.capx); MIDI is not in that list (alphaTex is documented separately).
- Input for sync: a score (Guitar Pro, MusicXML, Capella, alphaTex, per the home page) plus either a SoundFont (synth), an embedded
  or loaded audio file (backing track), or an external player that reports its time in milliseconds. Output: audio,
  cursor position events in ticks and milliseconds, metronome events.
- [verify] Run facts in `trials.md` (alphaTab 1.9.0 section; runs r0195, r0261, r0269): `api.exportAudio(options)`
  rendered the metronome alone with `metronomeVolume` 1 and the guitar track muted; in real-time playback the
  synthesizer output was an AudioWorkletNode in alphaTab's own AudioContext, connected to the destination only after
  the first `play()`; in `PlayerMode.EnabledExternalMedia` alphaTab called the page's handler (`seekTo`, `play`,
  `pause`) and `playerPositionChanged.currentTime` equalled the media time the page passed to `updatePosition`. The
  backing-track mode with sync points was not run (no Guitar Pro 7/8 file with audio in the shared inputs).
- Constraint hooks for re-runs: speed (`playbackSpeed`), playback range and looping, count-in and metronome volume,
  per-track controls (home page: "Show, hide, solo, mute and re-mix individual tracks at runtime. Per-track volume, pan
  and transposition."); sync points can be replaced at runtime (`updateSyncPoints()`).
- Licence, code (file `LICENSE` in `@coderline/alphatab@1.9.0`, read 2026-11-10): first line "alphaTab is licensed
  under MPL-2.0.", then "Copyright © 2025, Daniel Kuschny and Contributors, All rights reserved." and the full
  "Mozilla Public License Version 2.0". Section 3.2 in that file: "If You distribute Covered Software in Executable
  Form then: (a) such Covered Software must also be made available in Source Code Form, as described in Section 3.1,
  and You must inform recipients of the Executable Form how they can obtain a copy of such Source Code Form by
  reasonable means in a timely manner, at a charge no more than the cost of distribution to the recipient". Section
  3.3: "You may create and distribute a Larger Work under terms of Your choice, provided that You also comply with
  the requirements of this License for the Covered Software."
- Licence, bundled SoundFont (file `dist/soundfont/LICENSE` in the same package): "Copyright (c) 2004-2006 Sonic
  Network Inc." and "Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
  in compliance with the License." The accompanying `dist/soundfont/README.md` says: "This soundfont is based on the
  Sonivox EAS synthesizer, Copyright Sonic Network Inc. 2006." and "Sonivox EAS belongs to the Android Open Source
  Project." and links https://musical-artifacts.com/artifacts/1517 .

## 16. wavesurfer.js

- What: README of `wavesurfer.js@8.0.5` (read 2026-11-10): "**Wavesurfer.js** is an interactive waveform rendering
  and audio playback library, perfect for web applications." Official plugins listed in the README include Regions
  ("– visual overlays and markers for regions of audio"), Timeline ("– displays notches and time labels below the
  waveform") and Spectrogram ("– visualization of an audio frequency spectrum (written by @akreal)"). Site https://wavesurfer.xyz ; repository
  https://github.com/katspaugh/wavesurfer.js (last commit 2026-11-10).
- Version 8.0.5, published 2026-11-02; unpacked 1,658,106 bytes. React wrapper `@wavesurfer/react` 1.0.14
  (2026-10-30, BSD-3-Clause per npm).
- How a program calls it: `WaveSurfer.create({ container: '#waveform', url: '/audio.mp3', ... })` (README example);
  plugins are imported as ES modules, e.g. "`import Regions from 'wavesurfer.js/dist/plugins/regions.esm.js'`".
- Limits, README FAQ: "Since wavesurfer decodes audio entirely in the browser using Web Audio, large clips may fail to
  decode due to memory constraints. We recommend using pre-decoded peaks for large files" and, for streaming, "Streaming
  audio is supported only with" pre-decoded peaks and duration (a link in the original README) and "If you're using a VBR (variable bit rate) audio file, there
  might be a mismatch between the audio and the waveform. This can be fixed by converting your file to CBR (constant
  bit rate)." The README also mentions "a `rendering: 'windowed'` option for very long audio files".
- Licence (`LICENSE` in package): "BSD 3-Clause License", "Copyright (c) 2012-2023, katspaugh and contributors",
  standard BSD redistribution sentence and no-endorsement clause present verbatim.
- [verify] Run facts in `trials.md` (run r0329): `getDecodedData().sampleRate` was 8000 for both test files (the
  drawing decode); `exportPeaks({channels: 1, maxLength: 1000})` returned 1000 values per channel; with a `<video>`
  as its `media` option, `getCurrentTime()` equalled `video.currentTime` in 80 of 80 reads.

## 17. peaks.js

- What: README of `peaks.js@4.0.0` (read 2026-11-10): "A client-side JavaScript component to display and interact
  with audio waveforms in the browser". Features listed include "Client-side waveform computation, using the Web
  Audio API, for convenience", "Server-side waveform computation, for efficiency" and "Create point or segment marker
  annotations". Origin: BBC R&D (README links https://waveform.prototyping.bbc.co.uk/). The npm `repository` field
  and README now point to https://codeberg.org/chrisn/peaks.js .
- Version 4.0.0, published 2025-08-30; unpacked 4,376,968 bytes. `package.json` peer dependencies:
  `"konva": ">= 8.3.14 < 10"`, `"waveform-data": ">= 4.5.2 < 5"`.
- How a program calls it: `Peaks.init({ zoomview: { container }, overview: { container }, mediaElement, webAudio: {...} }, cb)`
  (README example), or with precomputed data: "you can use this from Peaks.js by passing a `dataUri` option to
  `Peaks.init()`" with `dataUri: { arraybuffer: 'sample.dat' // or json: 'sample.json' }`.
- Precomputed peaks, README: "Peaks.js uses waveform data files produced by [audiowaveform](https://codeberg.org/chrisn/audiowaveform).
  These can be generated in either binary (.dat) or JSON format." with the example `audiowaveform -i sample.mp3 -o
  sample.dat -b 8`.
- Licence (`COPYING` in package): "GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007". Section 4 in that file:
  "You may convey a Combined Work under terms of your choice that, taken together, effectively do not restrict
  modification of the portions of the Library contained in the Combined Work and reverse engineering for debugging
  such modifications, if you also do each of the following:" followed by "a) Give prominent notice with each copy of
  the Combined Work that the Library is used in it and that the Library and its use are covered by this License." and
  "b) Accompany the Combined Work with a copy of the GNU GPL and this license document." (clause b read from the
  same file; its line ends with "this license" and continues with "document.").
- [verify] Run facts in `trials.md` (run r0329): `Peaks.init({zoomview, overview, mediaElement, webAudio:
  {audioContext, scale: 128, multiChannel: false}})` returned waveform data at scale 512 (not the 128 asked), 1
  channel, 44,100 Hz.

## 18. waveform-data.js and audiowaveform

- What: README of `waveform-data@4.5.2` (read 2026-11-10): "**waveform-data.js** is a JavaScript library for creating
  zoomable representations of audio waveforms to enable visualisation of audio content." and it lists the family:
  "[audiowaveform](https://github.com/bbc/audiowaveform): C++ program that generates waveform data files from MP3 or
  WAV format audio." Repository field
  `git://github.com/bbc/waveform-data.js.git`.
- Version 4.5.2, published 2025-06-07; unpacked 279,458 bytes.
- How a program calls it: `WaveformData.create(arrayBuffer)` for `.dat`/JSON from audiowaveform, or
  `WaveformData.createFromAudio({ audio_context, array_buffer, scale }, cb)` in the browser.
- Licence, waveform-data (`LICENSE` in package): "GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007"
  (same section 4 text as peaks.js).
- Licence, audiowaveform (repository file https://raw.githubusercontent.com/bbc/audiowaveform/master/COPYING ,
  read 2026-11-10): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007". audiowaveform is a "C++ program that
  generates waveform data files" (waveform-data README above), not a browser library.

## 19. Mediabunny

- What: README of `mediabunny@1.65.2` (read 2026-11-10): "Mediabunny is a JavaScript library for reading, writing,
  and converting media (like MP4, WebM, MP3, HLS), directly in the browser." Features: "Wide format support: Read
  _and_ write MP4, MOV, WebM, MKV, HLS, WAVE, MP3, Ogg, ADTS, FLAC, MPEG-TS", "Built-in encoding & decoding:
  Supports 25+ video, audio, and subtitle codecs, hardware-accelerated using the WebCodecs API", "High precision:
  Fine-grained, microsecond-accurate reading and writing operations", "Streaming I/O: Handle reading & writing files
  of any size with memory-efficient streaming", "Tree-shakable: Only bundle what you use (as small as 5 kB gzipped)",
  "Zero dependencies". Maker: Vanilagy. Docs https://mediabunny.dev ; repository https://github.com/Vanilagy/mediabunny
  (last commit 2026-11-04).
- Version 1.65.2, published 2026-11-04; unpacked 11,355,831 bytes. (The same author's earlier `mp4-muxer` and
  `webm-muxer` packages are not covered here.)
- How a program calls it: `new Input({ source: new BlobSource(file), formats: ALL_FORMATS })`, then track readers
  and sinks (the README example reads `audioTrack.getSampleRate()`); decoding goes through WebCodecs (section 6), so
  decodable codecs are those the browser's WebCodecs supports. [verify] As run in `trials.md`
  (run r0314, `browser-analysis-batch`): `Input` + `UrlSource` + `ALL_FORMATS`, `VideoSampleSink.samples()` and
  `getSample(t)`; output `VideoSample` objects with timestamp and duration in seconds, `format` "I420",
  `toVideoFrame()`, `copyTo()`, `draw()`; all 539 (VP9) and 540 (H.264) decoded luma planes were bit-identical to
  ffmpeg 6.1.1's decode.
- Use here: per-frame access to a fingerstyle video (timestamps in seconds; the README's own words are
  "microsecond-accurate") for the
  hand-tracking lane, and extraction of the audio track for in-browser analysis.
- Licence, file `LICENSE` in the package: "Mozilla Public License Version 2.0" (full text; section 3.2 and 3.3 as
  quoted for alphaTab in section 15). The README's own summary (read 2026-11-10): "Use Mediabunny for any purpose,
  commercial or non-commercial, without royalties", "However, you have the following obligation:" "If you modify
  Mediabunny's licensed source code (e.g. in a fork) and then distribute it, you must publicly publish your
  modifications under the Mozilla Public License 2.0." and "You are not allowed to:" "Remove the license and copyright
  headers from any Mediabunny source file" and "Claim the "Mediabunny" trademark", ending "> This is not legal advice.
  Refer to the full text of the [Mozilla Public License 2.0](https://choosealicense.com/licenses/mpl-2.0/) for the
  binding license agreement."

## 20. mp4box.js

- What: README of `mp4box@2.5.0` (read 2026-11-10): "MP4Box.js enables advanced MP4 parsing, segmentation, and sample
  extraction directly in the browser or in Node.js environments." Feature bullets include "**Progressive Parsing**:
  Analyze MP4 content as it's being loaded." and "**Sample Extraction**: Extract media samples for custom processing,
  such as generating subtitles or audio analysis." Maker: GPAC (Telecom Paris). Repository https://github.com/gpac/mp4box.js
  (last commit 2026-11-05).
- Version 2.5.0, published 2026-10-25; unpacked 2,485,275 bytes.
- Use here: MP4 demux feeding `VideoDecoder` (WebCodecs); MP4 only.
- Licence (`LICENSE` in package): "Copyright (c) 2012. Telecom ParisTech/TSI/MM/GPAC Cyril Concolato", BSD
  three-clause text (redistribution sentence and no-endorsement clause present verbatim).

## 21. web-demuxer

- What: README of `web-demuxer@4.0.0` (read 2026-11-10): "WebCodecs provides decoding capabilities but lacks
  demuxing functionality. While mp4box.js is excellent for MP4 files, it only supports MP4 format. **Web-Demuxer**
  aims to support a wide range of multimedia formats in one package, specifically designed for seamless WebCodecs
  integration." and "Handle mov/mp4/mkv/webm/flv/m4v/wmv/avi/ts and more formats". Ships two WASM files
  (`dist/wasm-files/web-demuxer.wasm`, `web-demuxer-mini.wasm`). Repository https://github.com/ForeverSc/web-demuxer
  (last commit 2025-12-20).
- Version 4.0.0, published 2025-12-20; unpacked 4,229,009 bytes; npm `license` field empty.
- Licence: `LICENSE` in the package: "MIT License", "Copyright (c) 2024 ForeverSc", standard MIT grant present. The
  README's licence section (read 2026-11-10): "This project is licensed under the MIT License for the main codebase."
  and "The `lib/` directory contains FFmpeg-derived code under the LGPL License." (The `lib/` directory is in the
  repository; the published package contains the compiled WASM files, not `lib/`.)

## 22. SoundTouchJS

- What: repository README, https://github.com/cutterbl/SoundTouchJS (shallow clone, last commit 2026-08-03, read
  2026-11-10): "A real-time audio processing library for pitch shifting and playback speed control using the Web
  Audio API. Converted, expanded, and maintained by [Cutter](https://cutterscrossing.com/), based on the original
  [SoundTouch](https://www.surina.net/soundtouch/) C++ library by Olli Parviainen." The monorepo lists packages
  `@soundtouchjs/audio-worklet` ("AudioWorklet implementation with `AudioParam`-based controls, offline rendering, and
  processor metrics"), `@soundtouchjs/stretch-phase-vocoder`, `@soundtouchjs/phase-vocoder-worklet` ("AudioWorklet
  implementation using the phase vocoder for smoother extreme-ratio time-stretching") and
  `@soundtouchjs/formant-correction-worklet`. JavaScript/TypeScript, not WASM.
- Versions: `soundtouchjs` 0.3.0 (2026-02-04, npm licence LGPL-2.1; its README: "It's important to note that the
  `PitchShifter` is a pseudo-node, and cannot be connected to.");
  `@soundtouchjs/audio-worklet` 2.1.1 and `@soundtouchjs/core` 2.1.1 (2026-08-03, npm licence MPL-2.0); unpacked
  296,114 and 224,481 bytes.
- How a program calls it (README of `@soundtouchjs/audio-worklet@2.1.1`): "The package ships a pre-bundled processor
  file at `@soundtouchjs/audio-worklet/processor`. You need to serve this file and register it with the `AudioContext`
  before creating a node." then `await SoundTouchNode.register(audioCtx, '/soundtouch-processor.js');`. The README
  says it "Provides real-time pitch shifting, tempo adjustment, and rate transposition on the audio rendering thread".
- Licence facts, quoted (read 2026-11-10):
  - `@soundtouchjs/audio-worklet@2.1.1` and `@soundtouchjs/core@2.1.1` file `LICENSE`: "Mozilla Public License Version
    2.0" and "This package is licensed under the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was
    not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/."
  - Repository root `LICENSE`: "1. Each file in this project is licensed under the terms of the Mozilla Public
    License, v. 2.0." Repository README changelog: "**Licensing Update**: With significant rewrites, we have now moved
    off of the LGPL to the MPL-2.0 — see [LICENSE](LICENSE) for details."
  - `soundtouchjs@0.3.0` file `LICENSE`: "GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999" (full text).
  - [verify] How `soundtouchjs` 0.3.0 was called in `trials.md` (run r0314, offline): `SoundTouch` with `tempo` =
    rate and `pitch` 1, `WebAudioBufferSource` + `SimpleFilter.extract()` until it returns 0; output interleaved
    stereo float frames. The `@soundtouchjs/audio-worklet` packages were not run there.
  - The upstream C++ SoundTouch library's own licence was not read here (its site is
    https://www.surina.net/soundtouch/). [verify] Read 2026-11-10 at that URL: "Licensed under the GNU Lesser General
    Public License (LGPL) v2.1. Commercial Non-LGPL license alternative available upon request." and "Unrestricted
    Royalty-free license also available for commercial purposes, please contact us for more information!" (no
    price on the page).

## 23. Signalsmith Stretch

- What: Signalsmith Audio (Geraint Luff). C++ page https://signalsmith-audio.co.uk/code/stretch/ (read 2026-11-10):
  "This is a C++11 header-only class for pitch-shifting and time-stretching". GitHub repository
  https://github.com/Signalsmith-Audio/signalsmith-stretch (last commit 2026-10-22); its README says "It can handle a
  wide-range of pitch-shifts (multiple octaves) but time-stretching sounds best for more modest changes (between 0.75x
  and 1.5x)."
- Web build: npm `signalsmith-stretch` 1.3.2 (2025-06-27), 4 files, unpacked 232,286 bytes. README (read 2026-11-10):
  "This is an official release of the Signalsmith Stretch library for Web Audio, using WASM/AudioWorklet." and "Call
  `SignalsmithStretch(audioContext, ?channelOptions)` from the main thread. This returns a Promise which resolves to
  an `AudioNode`, with extra methods attached to it."
- Controls (`stretch.schedule({...})`, README): "`output` (seconds): audio context time for this change. The node
  compensates for its own latency", "`input` (seconds): position in input buffer", "`rate` (number): playback rate,
  e.g. 0.5 == half speed", "`semitones` (number): pitch shift", "`tonalityHz` (number): tonality limit (default
  8000)", "`formantSemitones` (number) / `formantCompensation` (bool): formant shift/compensation", "`loopStart`
  (seconds) / `loopEnd` (seconds): sets a section of the input buffer to auto-loop." Buffers: "`stretch.addBuffers([...])`
  This adds buffers to the end of the current input sample buffers. Buffers should be typed arrays of equal length,
  one per channel." It reports latency: "Returns the latency when used in "live input" mode, in seconds."
  [verify] The same README list also has "`active` (bool): processing audio" and "`formantBaseHz` (number): rough
  fundamental used for formant analysis" (sentence continues), and states: "Either way, you need to call `.start()`
  (or equivalently `.schedule({active: true})`) for it to start processing audio." `trials.md` used
  `schedule({active: true, input: 0, rate, output})` with `addBuffers` in an OfflineAudioContext: sent before
  `startRendering()` the render was silent (run r0170, peak 0); sent during a `suspend()` it had sound (r0171).
- Use here: slow-practice playback of the original recording or of a stem, scheduled on the same `AudioContext`
  clock as the metronome; loop points in seconds.
- Licence: the npm package ships no licence file (its 4 files: `SignalsmithStretch.js`, `SignalsmithStretch.mjs`,
  `README.md`, `package.json`); `package.json` declares `"license": "MIT"`. Repository file `LICENSE.txt` (shallow
  clone of https://github.com/Signalsmith-Audio/signalsmith-stretch , read 2026-11-10): "MIT License", "Copyright (c)
  2022 Geraint Luff / Signalsmith Audio Ltd.", standard MIT grant present.

## 24. Rubber Band Library in WASM

- What: Rubber Band Library, Breakfast Quay / Particular Programs Ltd, https://breakfastquay.com/rubberband/ ;
  repository https://github.com/breakfastquay/rubberband (last commit 2025-02-27). Three independent WASM builds on npm:
  - `rubberband-wasm` 3.3.0 (2024-12-23, Daninet), README: "WebAssembly build of the audio time-stretching and
    pitch-shifting [Rubber Band Library](https://breakfastquay.com/rubberband/)". Repository
    https://github.com/Daninet/rubberband-wasm (last commit 2024-12-23).
  - `rubberband-web` 0.2.1 (2022-10-18, delude88), README: "A wasm-powered audio worklet using the [Rubber Band
    library](https://breakfastquay.com/rubberband/) to provide pitch shifting for the Web Audio API." Repository last
    commit 2022-11-14.
  - `@echogarden/rubberband-wasm` 0.2.0 (2024-10-26), README: "[Rubber Band](https://github.com/breakfastquay/rubberband),
    an audio time-stretching and pitch-shifting library,  compiled to WASM." and "Intended for use with [Echogarden](https://github.com/echogarden-project/echogarden)."
- Licence facts (read 2026-11-10):
  - Upstream, https://breakfastquay.com/rubberband/license.html : "When you receive a copy of Rubber Band Library —
    whether by downloading it, pulling it from our repository or official Github mirror, receiving a copy from a
    friend or employee, or by any other means — you're getting it under the terms of the GNU General Public License
    (version 2 or later)." and "That is, your application must also be Free Software and you must provide source code
    for it." and "For commercial software development, we provide simple and flexible licences which allow you to take
    the Rubber Band Library code, modify it if desired, and redistribute it in proprietary products." and "No expiry
    date, no royalties." (Commercial licence price not read: UNVERIFIED. [verify] Re-read 2026-11-10: the licence page
    and https://breakfastquay.com/rubberband/ show no price; the licence page links "Contact us" at `/contact.html`.)
    Repository file `COPYING`: "GNU GENERAL PUBLIC
    LICENSE Version 2, June 1991".
  - `rubberband-wasm@3.3.0` README: "Rubber Band Library is open source software under the GNU General Public License.
    If you want to distribute it in a proprietary commercial application, you need to buy a licence." Its `LICENSE`
    file: "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"; npm licence field "GPLv2".
  - `rubberband-web@0.2.1` `LICENSE`: GPL version 2 text; npm field "GPL-2.0-or-later".
  - `@echogarden/rubberband-wasm@0.2.0` `COPYING`: GPL version 2 text; npm field "GPL-2.0-only".
- [verify] How `rubberband-wasm` 3.3.0 was called in `trials.md` (run r0314, offline): the Rubber Band C API compiled
  to WASM, `rubberband_new(44100, 2, 0, 1/rate, 1.0)`, a `study` pass, then `process` / `retrieve` in 1024-sample
  blocks; output planar float arrays per channel, length exactly input length / rate.

## 25. Bungee (Parabola Research) and the `bungee-pitch-shift` WASM package

- What: https://bungee.parabolaresearch.com/ (read 2026-11-10): "Bungee is an open-source audio processing library
  designed to change playback speed" (the sentence continues on the page) and "Implements an adaptive phase vocoder
  for reliable performance across all audio types." and "Supports all time-stretching ratios, including reverse
  (negative) and zero-speed playback." The same page describes a proprietary "Bungee Pro" with a "Bungee Pro Web SDK"
  ("Both SDKs are available under simple, developer-friendly licensing terms."; price not published on that page).
  Repository https://github.com/kupix/bungee (last commit 2026-10-18).
- Bungee licence: repository file `LICENSE` (shallow clone of https://github.com/kupix/bungee , read 2026-11-10):
  "Mozilla Public License Version 2.0" (full text).
- npm `bungee-pitch-shift` 1.0.8 (2025-10-25), unpacked 499,406 bytes; `package.json` has `"author": ""`,
  `"license": "MIT"` and an empty repository URL. README (read 2026-11-10): "High-quality, low-latency pitch shifting
  and time stretching for Web Audio API using WebAssembly." and "Built on the [Bungee](https://github.com/Signalsmith-Audio/bungee)
  phase vocoder library" (the link target is as written in the README) and "**Low Latency**: ~40ms latency using
  AudioWorklet and WebAssembly" and "**Independent Control**: Separate pitch shifting (-12 to +12 semitones) and time
  stretching (0.5x to 2x speed)". Its `LICENSE` file: "MIT License", "Copyright (c) 2024", standard MIT grant present.
  Who publishes this package is not stated in it. [verify] The npm registry record
  (https://registry.npmjs.org/bungee-pitch-shift , read 2026-11-10) names the publishing npm account: `maintainers`
  and the 1.0.8 `_npmUser` are both the account "dexhonsa"; the package was created on npm 2025-10-21. Which person or
  company is behind that account is not stated (UNVERIFIED).

## 26. Superpowered Web Audio JavaScript & WebAssembly SDK

- What: npm `@superpoweredsdk/web` 2.8.2 (2026-09-09), unpacked 27,150,288 bytes, npm licence field "SEE LICENSE IN
  /license"; repository https://github.com/superpoweredSDK/web-audio-javascript-webassembly-SDK-interactive-audio
  (last commit 2026-09-09), whose `license/` folder holds one file, "SUPERPOWERED SDKS MASTER LICENSE AGREEMENT - Oct
  16 2019.pdf" (not opened here). [verify] The npm package ships the same file at
  `/license/SUPERPOWERED SDKS MASTER LICENSE AGREEMENT - Oct 16 2019.pdf` (218,154 bytes, unpkg file list read
  2026-11-10).
- Status: https://superpowered.com/pricing (read 2026-11-10): "Superpowered is sunsetting. Check out Yuby for your
  low-latency audio: https://yuby.com". (Yuby was not researched here.)
- Terms, https://superpowered.com/licensing (read 2026-11-10): "The following document details the Superpowered SDKs
  Master License Agreement as of an Effective Date of March 23, 2022"; "For avoidance of doubt, there is no free
  license available that allows public release and all licensees regardless of the date of use must immediately
  switch to one of the licenses listed above or discontinue use of Superpowered."; "The Evaluation License is offered
  for internal, private experimentation and R&D purposes (eg PoC) only and does not allow for public release. It
  supports a maximum of 1,000 app-installs (as determined by Superpowered analytics)."; "The White Label License
  requires annual license fees and has no credit or attribution requirment. App-installs and usage are unlimited.";
  "Do you intend to integrate Superpowered into a web-app, website or native app and make it available to the
  public?" "Then you must purchase either a White Label License."; "Licenses can be purchased by contacting
  licensing@superpowered.com." The pricing page lists "Fixed Annual Fee, No Royalty, No Rev-Share" without a number
  (no price published on 2026-11-10). KEY.

## 27. smplr

- What: README of `smplr@1.2.0` (read 2026-11-10): "`smplr` is a collection of sampled instruments for Web Audio API
  ready to be used with no setup required." and "No setup: specifically, all samples are online, so no need for a
  server." and "Samples are stored at https://github.com/smpldsnds and there is no need to download them." Maker
  danigb (Daniel Gómez Blasco). Repository https://github.com/danigb/smplr (last commit 2026-11-07).
- Version 1.2.0, published 2026-11-06; unpacked 1,173,778 bytes.
- How a program calls it (README examples): `const marimba = Soundfont(context, { instrument: "marimba" });
  marimba.start({ note: 60, velocity: 80 });` with an optional `kit: "FluidR3_GM"`; "Use `getSoundfontNames` to get
  all available instrument names". Also `Soundfont2` (reads .sf2 through the `soundfont2`
  package), `SplendidGrandPiano`, `DrumMachine`, and a `Sequencer` that "schedules notes from one or more tracks against
  any smplr instrument with sample-accurate timing." Options include `notesToLoad`, MIDI CC (`setCC(64, 127)` for
  sustain), pan, `humanize: { timingMs, velocity }`.
- Sample sources (README, Soundfont section): "By default it loads audio from Benjamin Gleitzman's package of
  [pre-rendered sound fonts](https://github.com/gleitz/midi-js-soundfonts)." and "There are two kits available:
  `MusyngKite` or `FluidR3_GM`. The first one is used by default: it sounds better but the samples are heavier." and
  "It's intended to be a modern replacement of [soundfont-player](https://github.com/danigb/soundfont-player)".
- Licence, code: the npm package and the repository ship no licence file (repository top-level listing checked
  2026-11-10); `package.json` declares `"license": "MIT"` and the README's "## License" section says "MIT License".
- Licence, default samples: README of https://github.com/gleitz/midi-js-soundfonts (shallow clone, last commit
  2021-12-17, read 2026-11-10): for "Fluid Soundfont" "Generated from
  [FluidR3_GM.sf2](http://www.synthfont.com/SoundFonts/FluidR3_GM.sfArk) (148 MB uncompressed)" and "Released under
  [Creative Commons Attribution 3.0 license](https://creativecommons.org/licenses/by/3.0/us/)"; for "Musyng Kite
  Soundfont" "Released under [Creative Commons Attribution Share-Alike 3.0 license](https://creativecommons.org/licenses/by-sa/3.0/)";
  for "FatBoy Soundfont" "Released under [Creative Commons Attribution Share-Alike 3.0
  license](https://creativecommons.org/licenses/by-sa/3.0/)". The repository's
  `LICENSE.txt` is an MIT text, "Copyright (C) 2012 Benjamin Gleitzman", covering the repository. The licences of the
  `smpldsnds` sample repositories (used by `SplendidGrandPiano`, `DrumMachine`) were not read by the survey.
- [verify] Upstream licence of the FluidR3_GM SoundFont itself (the source of gleitz's "Fluid Soundfont" renders, and
  the SoundFont at `/usr/share/sounds/sf2/FluidR3_GM.sf2` that rendered the shared inputs): the Debian/Ubuntu package
  copyright file, https://changelogs.ubuntu.com/changelogs/pool/universe/f/fluid-soundfont/fluid-soundfont_3.1-5.3/copyright
  (read 2026-11-10; the same file is installed on the box at `/usr/share/doc/fluid-soundfont-gm/copyright`), names
  "Upstream Author: Frank Wen" and quotes the upstream README: "I hereby release Fluid under the MIT license, as
  described in COPYING." followed by the MIT text. gleitz's README states CC BY 3.0 for its rendered "Fluid Soundfont"
  files (quoted above); both statements are recorded, neither source refers to the other.
- [verify] `smpldsnds` sample repositories that the shipped `smplr@1.2.0/dist/index.mjs` loads from (URLs found in
  that file, 2026-11-10), READMEs read 2026-11-10 from `https://raw.githubusercontent.com/smpldsnds/<repo>/HEAD/README.md`:
  `sfzinstruments-splendid-grand-piano` (SplendidGrandPiano): "Public Domain samples by AKAI" and "This samples set
  was released as public domain in early 2000 by Akai company." (no LICENSE file at HEAD: HTTP 404);
  `drum-machines` (DrumMachine): "A collection of public domain samples of different drum machines";
  `sgossner-vcsl`: "This collection is under a Creative Commons 0 license."; `sfzinstruments-greg-sullivan-e-pianos`:
  "This work is licensed under a Creative Commons Attribution 3.0 Unported License." (HTML link to
  http://creativecommons.org/licenses/by/3.0/ around the licence name) and "with the author permission with the
  request for attribution."; `soundfonts` lists a licence per file (for example the `galaxy-electric-pianos.sf2` line
  ends "License: GNU v3.0" and the `giga-hq-fm-gm.sf2` line ends "License: CC 4.0"). The READMEs of
  `archiveorg-mellotron` and `sfzinstruments-dsmolken-double-bass` contain no licence statement (searched for
  "licen", "creative", "public domain", "cc0"): UNVERIFIED for those two.
- [verify] Run facts from `trials.md` (runs r0225, r0229): `smplr/dist/index.js` is CommonJS and failed in the page
  with "module is not defined"; `dist/index.mjs` worked. `Soundfont(ctx,{instrument:'acoustic_guitar_nylon',kit:'FluidR3_GM'})`
  loaded gleitz's `acoustic_guitar_nylon-ogg.js` (2,158,023 bytes) and played notes given as
  `start({note, velocity, time, duration})`.

## 28. soundfont-player

- What: README of `soundfont-player@0.12.0` (read 2026-11-10): "A soundfont loader/player to play MIDI sounds using
  WebAudio API." It loads the same gleitz pre-rendered sound fonts. Repository https://github.com/danigb/soundfont-player
  (last commit 2023-05-16); smplr's README calls smplr "a modern replacement of" it.
- Version 0.12.0, published 2020-01-27; unpacked 102,577 bytes.
- Licence (`LICENSE`): "The MIT License", "Copyright (c) 2015 Daniel Gómez Blasco", standard MIT grant present.
  Sample licences as in section 27.
- [verify] How it was called in `trials.md` (run r0229): `Soundfont.instrument(ctx,'acoustic_guitar_nylon',{soundfont:'FluidR3_GM'})`,
  then `play(note, time, {duration, gain: velocity/127})`; it loaded gleitz's `acoustic_guitar_nylon-mp3.js`
  (1,837,439 bytes).

## 29. SpessaSynth (spessasynth_lib, spessasynth_core)

- What: README of `spessasynth_lib@4.4.7` (read 2026-11-10): "A powerful multipurpose SF2/DLS/MIDI
  TypeScript/JavaScript library for the browsers, based on spessasynth_core." and "This is a WebAudioAPI wrapper for
  the [spessasynth_core](https://github.com/spessasus/spessasynth_core) library." Features listed: "Play MIDI files
  using SF2/SF3/DLS files!" and "Featuring full Yamaha XG effects". `spessasynth_core` is the same engine without Web
  Audio ("Looking for a bare JS version that works without WebAudioAPI? Try
  [spessasynth_core](https://github.com/spessasus/spessasynth_core)!"). Docs
  https://spessasus.github.io/spessasynth_lib ; repositories https://github.com/spessasus/spessasynth_lib (last commit
  2026-11-07) and https://github.com/spessasus/spessasynth_core (last commit 2026-11-09).
- Versions: `spessasynth_lib` 4.4.7 and `spessasynth_core` 4.4.9, both published 2026-11-06; unpacked 4,769,806 and
  5,021,263 bytes.
- Input: SF2/SF3/DLS SoundFont plus MIDI (also MOD/XM/S3M). Output: audio through Web Audio (lib) or rendered sample
  arrays (core). Neither npm package ships a SoundFont file (no .sf2/.sf3/.dls in their file lists, read 2026-11-10),
  so the SoundFont an app loads comes with its own licence (for example FluidR3_GM, section 27, or alphaTab's Sonivox
  SoundFont, section 15).
- Licence (`LICENSE` in both packages): Apache License 2.0 text; standard Apache-2.0 grant present verbatim.
- [verify] How it was called in `trials.md` (run r0225, esbuild bundle of `spessasynth_lib` 4.4.7 + `spessasynth_core`
  4.4.9): `WorkletSynthesizer`, `programChange(0,24)`, `noteOn(0,p,v,{time})`, `noteOff(0,p,{time})`, with the box's
  FluidR3_GM.sf2 (148,398,306 bytes) loaded by the page.

## 30. js-synthesizer (FluidSynth in WASM)

- What: README of `js-synthesizer@1.13.0` (read 2026-11-10): "js-synthesizer is a library that generates audio data
  (frames). [WebAssembly (wasm) version of FluidSynth](https://github.com/jet2jet/fluidsynth-emscripten) is used as a
  core synthesizer engine." It can run in an AudioWorklet (`context.audioWorklet.addModule('libfluidsynth-2.4.6.js')`)
  or a Web Worker ("Executing on a Web Worker prevents from blocking main thread while rendering."). Maker jet2jet.
  Repository https://github.com/jet2jet/js-synthesizer (last commit 2026-05-12).
- Version 1.13.0, published 2026-04-20; unpacked 6,932,424 bytes. Ships `externals/libfluidsynth-2.4.6.js` (FluidSynth
  2.4.6 compiled to WASM) and a variant with libsndfile for SF3. [verify] The file list (unpkg, 2026-11-10) also
  holds `externals/libfluidsynth-2.3.0.js` and `externals/libfluidsynth-2.3.0-with-libsndfile.js`.
- [verify] `trials.md` (run r0225): `AudioWorkletNodeSynthesizer` with `libfluidsynth-2.4.6.js`, `loadSFont`,
  `addSMFDataToPlayer(S2n.mid)`, `playPlayer()` played the shared input S2n; its capture matched the native
  FluidSynth 2.3.4 render of the same MIDI with a normalized cross-correlation peak of 0.99908.
- How a program calls it: `JSSynth.waitForReady()`, then `synth.loadSFont(buffer)`, `synth.addSMFDataToPlayer(smf)`,
  `synth.playPlayer()`; `render()` for offline rendering without Web Audio. The box's command-line FluidSynth with
  FluidR3_GM (used to render the shared test inputs) is the same engine family.
- Licence: `LICENSE` in the package: "Copyright (C) 2018 jet", BSD three-clause text (redistribution sentence and
  no-endorsement clause present verbatim). README: "libfluidsynth JS file is not `import`-able (but `require`-able
  from 2.4.6) and its license (LGPL v2.1) is different from js-synthesizer's (BSD-3-Clause)." The package also ships
  `externals/LICENSE.fluidsynth.txt`. FluidSynth repository `LICENSE` (https://github.com/FluidSynth/fluidsynth ,
  last commit 2026-11-09): "GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999".

## 31. WebAudioFont

- What: README of `webaudiofont@3.0.4` (read 2026-11-10): "WebAudioFont is a set of resources and associated
  technology that uses sample-based synthesis to play musical instruments in the browser." and "see
  [LICENSE.md](https://github.com/surikov/webaudiofont/blob/master/LICENSE.md). Contact me if you need different
  license." Repository https://github.com/surikov/webaudiofont (last commit 2026-09-04).
- Version 3.0.4, published 2022-06-28; unpacked 5,497,869 bytes.
- Licence (`LICENSE.md` in package): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007" (full text); npm field
  "GPL-3.0-or-later".
- [verify] Sample sources, same README (read 2026-11-10): "Instruments came from free soundfonts:" with two links,
  "GeneralUserGS.sf2 license" (http://www.schristiancollins.com/generaluser.php) and "FluidR3.sf2 license"
  (https://github.com/musescore/MuseScore/blob/master/share/sound/FluidR3Mono_License.md). The instrument files
  themselves are loaded from `https://surikov.github.io/webaudiofontdata/sound/` (README examples). Fetched
  2026-11-10: the raw MuseScore file at that path returned HTTP 404, and the GeneralUser page returned a 3,872-byte
  script shell with no licence text, so the terms of those two SoundFonts were not read here (UNVERIFIED; the upstream
  FluidR3_GM licence is quoted in section 27).

## 32. MidiPlayerJS

- What: README of `midi-player-js@2.0.17` (read 2026-11-10): "MidiPlayerJS is a JavaScript library which reads
  standard MIDI files and emits JSON events in real time. This player does not generate any audio, but by attaching a
  handler to the event emitter you can trigger any code you like which could play audio". Repository
  https://github.com/grimmdude/MidiPlayerJS (last commit 2026-03-22).
- Version 2.0.17, published 2026-03-01; unpacked 191,607 bytes.
- Timing mechanism, from the shipped `build/index.js` (https://unpkg.com/midi-player-js@2.0.17/build/index.js , read
  2026-11-10): `this.sampleRate = 5; // milliseconds` and "Start play loop using drift-correcting setTimeout" with
  `this.startTime = new Date().getTime()`: events are fired from a JavaScript `setTimeout` loop, not scheduled on the
  Web Audio clock (the precision implications are those quoted in section 1).
- Licence (`LICENSE`): "MIT License", "Copyright (c) 2018 Garrett Grimm", standard MIT grant present.

## 33. Basic Pitch for the browser (`@spotify/basic-pitch`, basic-pitch-ts)

- What: README of `@spotify/basic-pitch@1.0.1` (read 2026-11-10): "Basic Pitch is a Typescript and
  [Python](https://github.com/spotify/basic-pitch) library for Automatic Music Transcription (AMT), using lightweight
  neural network developed by [Spotify's Audio Intelligence Lab]" and "Provide a compatible audio file and
  basic-pitch will generate a MIDI file, complete with pitch bends." and "This library is intended to be 100%
  compatible with feature parity to its Python sibling". Paper: Bittner et al., "A Lightweight Instrument-Agnostic
  Model for Polyphonic Note Transcription and Multipitch Estimation", ICASSP 2022 (https://arxiv.org/abs/2203.09893 ,
  link from the README). Repository https://github.com/spotify/basic-pitch-ts (last commit 2023-01-10).
- Version: npm 1.0.1, published 2022-08-05 (no later release on npm as of 2026-11-10); unpacked 1,761,856 bytes.
  The package ships a TF.js graph model: `model/model.json` (174,537 bytes) and `model/group1-shard1of1.bin` (742,392
  bytes) (sizes from `https://unpkg.com/@spotify/basic-pitch@1.0.1/?meta`, read 2026-11-10). `package.json`
  dependencies: `"@tensorflow/tfjs": "^3.2.0"`, `"@tonejs/midi": "^2.0.28"`.
- How a program calls it (README): `const basicPitch = new BasicPitch(model); await basicPitch.evaluateModel(audioBuffer,
  (f, o, c) => {...}, progressCb)`, then `noteFramesToTime(addPitchBendsToNoteEvents(contours, outputToNotesPoly(frames,
  onsets, 0.25, 0.25, 5)))`.
- Input, from the shipped `esm/inference.js` (https://unpkg.com/@spotify/basic-pitch@1.0.1/esm/inference.js , read
  2026-11-10): `const AUDIO_SAMPLE_RATE = 22050;` and the checks "Input audio buffer is not at correct sample rate!"
  and "Input audio buffer is not mono!" (the caller must resample to 22,050 Hz mono, for example with an
  `OfflineAudioContext`). Window: `AUDIO_WINDOW_LENGTH_SECONDS = 2`, `FFT_HOP = 256`.
- Output, from the shipped `esm/toMidi.js`: note events with `pitchMidi` (`freqIdx + MIDI_OFFSET`, `MIDI_OFFSET = 21`),
  `amplitude`, `pitchBends`, `startTimeSeconds`, `durationSeconds` (after `noteFramesToTime`), plus the raw frame,
  onset and contour matrices. `generateFileData(notes)` writes a MIDI file through `@tonejs/midi`, mapping
  `velocity: note.amplitude` and adding pitch bends with `track.addPitchBend`. [verify] The same function ends with
  `return Buffer.from(midi.toArray());` (shipped `esm/toMidi.js`, read 2026-11-10): it returns a Node.js `Buffer`, a
  global that browsers do not define unless the page or its bundler supplies one; `midi.toArray()` itself is the
  @tonejs/midi call that returns the file bytes (section 10). [verify] The package entry
  (https://unpkg.com/@spotify/basic-pitch@1.0.1/esm/index.js , read 2026-11-10) re-exports only `BasicPitch`,
  `addPitchBendsToNoteEvents`, `noteFramesToTime` and `outputToNotesPoly`; `generateFileData` is not exported from it
  (it can only be reached by importing `esm/toMidi.js` itself; `package.json` has no `exports` map). `trials.md` met
  the same fact (esbuild: "No matching export"). The entry's relative imports carry no file extension
  (`export { BasicPitch } from './inference';`); the trials loaded the package through esbuild bundles and jsDelivr's
  `+esm` build.
- Thresholds a re-run can change, signature read from the shipped `esm/toMidi.js`: `export function
  outputToNotesPoly(frames, onsets, onsetThresh = 0.5, frameThresh = 0.3, minNoteLen = 5, inferOnsets = true,
  maxFreq = null, minFreq = null, melodiaTrick = true, energyTolerance = 11)`. `minFreq`/`maxFreq` can restrict the
  note range, for example to a guitar's range for a given tuning and capo.
- Licence, code: `LICENSE` in the npm package: Apache License 2.0 (standard Apache-2.0 grant present). The Python
  repository README (https://github.com/spotify/basic-pitch , shallow clone, read 2026-11-10) says "This software is
  licensed under the Apache License, Version 2.0 (the "Apache License")." [verify] The npm package's README
  (`@spotify/basic-pitch@1.0.1`, read 2026-11-10) has the same paragraph, which continues: "You may choose either
  license to govern your use of this software only upon the condition that you accept all of the terms of either the
  Apache License." and later "software distributed under the Apache License or the GPL License is distributed on an
  "AS IS" BASIS"; the shipped `LICENSE` file is the Apache-2.0 text only and the npm license field is "Apache-2.0".
- Licence, weights: the TF.js weights ship inside the Apache-2.0 npm package; no separate weights licence file was
  found in the package (file list read 2026-11-10). [verify] The Python README
  (https://raw.githubusercontent.com/spotify/basic-pitch/HEAD/README.md , read 2026-11-10) says: "Basic Pitch comes
  with the original TensorFlow model and the TensorFlow model converted to CoreML, TensorFlowLite, and ONNX." The
  ONNX file (`basic_pitch/saved_models/icassp_2022/nmp.onnx`, 230,444 bytes) ran in ONNX Runtime Web 1.31.1 in
  `trials.md` (run r0270) and gave the same note lists as the TF.js model there.
- [verify] Output format as run in `trials.md` (r0270): note events with `startTimeSeconds`, `durationSeconds`,
  `pitchMidi`, `amplitude`, `pitchBends` (written there as CSV), raw outputs frames x 88 (note), frames x 88 (onset),
  frames x 264 (contour) at 86 frames per second; npm installed `@tensorflow/tfjs` 3.21.0 for the `^3.2.0` range; the
  TF.js `wasm` backend failed with "Error: Unknown dtype undefined" while `webgl` (SwiftShader) and `cpu` ran. This
  agrees with the field names read from `esm/toMidi.js` above.
- Training data: not stated in either README (searched 2026-11-10). The audio-to-notes lane's survey
  (`lanes/audio-to-notes/survey.md`, section 13) records the paper's training sets (GuitarSet, MAESTRO, Slakh, iKala,
  MedleyDB) and their licence clauses; this agent did not re-read the paper. [verify] That section exists and lists,
  from the paper's Table 1, GuitarSet (648 tracks), MAESTRO (1154), Slakh (1590), iKala (252) and MedleyDB (103) as
  training data.
  One of those sets carries a non-commercial clause: the MAESTRO page, https://magenta.tensorflow.org/datasets/maestro
  (read 2026-11-10): "The dataset is made available by Google LLC under a Creative Commons Attribution Non-Commercial
  Share-Alike 4.0 (CC BY-NC-SA 4.0) license." Neither Basic Pitch README says how the training-data licences bear on
  the released weights (searched 2026-11-10).

## 34. essentia.js

- What: https://mtg.github.io/essentia.js/ (read 2026-11-10): "Essentia.js is a JavaScript (JS) library for
  music/audio signal analysis and processing developed at the Music Technology Group, UPF, Barcelona. The core of
  library is powered by Essentia C++ library back-end using WebAssembly built via Emscripten" and "The packaged add-on
  modules includes configurable feature extractors for some selected features, interface for feature extraction and
  inference of a collection of pre-trained audio ML models using Tensorflow.js". The same page: "NOTE: Essentia.js is
  currently under rapid development." Repository https://github.com/MTG/essentia.js (last commit 2022-07-19); C++
  Essentia https://github.com/MTG/essentia (last commit 2026-11-05).
- Version: npm `essentia.js` 0.1.3, published 2021-06-24; unpacked 10,143,669 bytes; ships
  `dist/essentia-wasm.web.wasm` (1,987,689 bytes).
- How a program calls it: `const essentia = new Essentia(EssentiaWASM)`; algorithms such as `PitchYinProbabilistic`,
  `PredominantPitchMelodia`, `RhythmExtractor2013`, `KeyExtractor`, `ChordsDetection` take `essentia.arrayToVector(float32)`
  and return vectors. These five names occur in the shipped `dist/essentia.js-core.es.js` of 0.1.3 (grep of
  https://unpkg.com/essentia.js@0.1.3/dist/essentia.js-core.es.js , 2026-11-10); `TempoCNN` does not occur in that
  core file (the TF.js models are a separate add-on). [verify] Re-checked 2026-11-10 (same five names present,
  `TempoCNN` absent). `trials.md` loaded `dist/essentia-wasm.web.js` + `dist/essentia.js-core.js` by script tags; the
  page reported `essentia.version` "2.1-beta6-dev" and 199 algorithm names, and results came back as Emscripten
  vectors converted with `essentia.vectorToArray` (run r0314, `browser-analysis-batch`).
- Licence, code: `LICENSE` in the npm package and in both repositories: "GNU AFFERO GENERAL PUBLIC LICENSE Version 3,
  19 November 2007"; it contains section 13's sentence "if you modify the Program, your modified version must
  prominently offer all users interacting with it remotely through a computer network" verbatim.
- Licensing page linked from the essentia.js site, https://essentia.upf.edu/licensing_information.html (read
  2026-11-10): "Essentia is available under an open licence, Affero GPLv3, for non-commercial applications, thus it is
  possible to test the library before deciding to licence it under a comercial licence. Contact Music Technology Group
  (UPF) for more information about licensing conditions and for consulting how Essentia can suit your application."
  and "Some Essentia library algorithms use third-party libraries with licenses such as GPL, LGPL, and others for
  which UPF is not able to provide full sublicensing rights to third parties. If a third party plans to release a
  product based on Essentia, it needs to make sure to have cleared the rights over the required libraries for itself."
- Licence, models (same page): "All the models are available under the CC BY-NC-SA 4.0 license for non-commercial
  use, and are also available under a proprietary license upon request." The models page https://essentia.upf.edu/models.html
  (read 2026-11-10): "All the models created by the MTG are licensed under CC BY-NC-SA 4.0 and are also available under
  proprietary license upon request."

## 35. ONNX Runtime Web

- What: README of `onnxruntime-web@1.31.1` (read 2026-11-10): "ONNX Runtime Web is a Javascript library for running
  ONNX models on browsers and on Node.js." Microsoft. Docs https://onnxruntime.ai/docs/tutorials/web/ .
- Version 1.31.1, published 2026-10-26; unpacked 150,622,959 bytes. WASM binaries in the package (sizes from unpkg
  `?meta`, 2026-11-10): `ort-wasm-simd-threaded.wasm` 14,848,852 bytes, `ort-wasm-simd-threaded.jsep.wasm` 29,520,971
  bytes (the build with the WebGPU/WebNN execution providers), `.asyncify.wasm` 28,747,738, `.jspi.wasm` 17,920,659.
- Backends, https://onnxruntime.ai/docs/tutorials/web/ (read 2026-11-10): "With onnxruntime-web, you have the option to
  use webgl, webgpu or webnn (with deviceType set to gpu) for GPU processing, and WebAssembly (wasm, alias to cpu) or
  webnn (with deviceType set to cpu) for CPU processing. All ONNX operators are supported by WASM but only a subset
  are currently supported by WebGL, WebGPU and WebNN."
- Threads, https://onnxruntime.ai/docs/tutorials/web/env-flags-and-session-options.html : "The env.wasm.numThreads
  flag is used to set the number of threads that ONNX Runtime Web will use for model inference. This value includes the
  main thread." and "Only when the browser supports WebAssembly multi-threading and crossOriginIsolated mode is enabled,
  multi-threading will be enabled." Proxy worker: "When the proxy worker is enabled, ONNX Runtime Web will offload the
  heavy computation to a separate Web Worker." [verify] `trials.md` (run r0270) agrees: with cross-origin isolation
  `ort.env.wasm.numThreads` stayed at the requested 1 or 2; without it ORT set it to 1 after creating the session.
- Size limits, https://onnxruntime.ai/docs/tutorials/web/large-models.html : "For example, the maximum size of an
  ArrayBuffer in Chrome is 0x7fe00000 bytes (around 2GB)." and "The maximum size of a protobuf file is 2GB. If an ONNX
  model is larger than 2GB, it’s usually generated with external data." and "WebAssembly has a memory limit of 4GB.
  This is the maximum amount of memory that a WebAssembly module can access because of the 32-bit addressing.
  Currently, there is no way for ONNX Runtime Web to run models larger than 4GB."
- WebGPU, https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html : "WebGPU is available out-of-box in latest versions
  of Chrome and Edge on Windows, macOS, Android and ChromeOS. It is also available in Firefox behind a flag and Safari
  Technology Preview." (compare BCD in section 8, which lists Safari 26).
- Input / output: ONNX models (`.onnx`; sevagh's demo loads ORT-format files such as `htdemucs.ort.gz`, section 50),
  tensors as typed arrays with shapes; used by Transformers.js
  (section 37), the in-browser Demucs builds (section 50) and the Beat This! export (section 51).
- Licence: the npm package ships no licence file; npm field "MIT". Repository file
  https://raw.githubusercontent.com/microsoft/onnxruntime/main/LICENSE (read 2026-11-10): "MIT License", "Copyright (c)
  Microsoft Corporation", standard MIT grant present.

## 36. MediaPipe Tasks Vision (web)

- What: README of `@mediapipe/tasks-vision@1.2.2` (read 2026-11-10): "This package contains the vision tasks for
  MediaPipe." Google AI Edge. Hand Landmarker web guide https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js
  (read 2026-11-10, page "Last updated 2026-11-04 UTC" on the hand landmarker overview): "The MediaPipe Hand Landmarker
  task lets you detect the landmarks of the hands in an image." and it "outputs hand landmarks in image coordinates,
  hand landmarks in world coordinates, and handedness (left or right hand) of multiple detected hands." and "Track 21
  3D hand keypoints and handedness on images, clips, or your webcam."
- Version 1.2.2, published 2026-11-03; unpacked 31,269,184 bytes; ships `wasm/vision_wasm_internal.wasm` (14,603,354
  bytes). `@mediapipe/tasks-audio` 1.2.2 (audio classifier) is a sibling package.
- How a program calls it (guide): `HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath:
  "hand_landmarker.task", delegate: "GPU" }, runningMode: "VIDEO", numHands: 2 })`, then
  `handLandmarker.detectForVideo(frame, timestampMs)`. The guide on running modes: "VIDEO" "Synchronous tracking across
  decoded video frames with monotonic timestamps. Processes every frame in order and never drops frames."; "LIVE_STREAM"
  "Asynchronous camera pipeline with a result callback. Automatically drops incoming frames when busy". Model file:
  https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task .
- Authors' measurement on the guide page: "On-device benchmark · Pixel 6", "HandLandmarker (Full, FP16)", "CPU17.12ms
  GPU12.27ms" (as rendered, per frame; the page does not say more about the setup).
- Use here: per-frame timestamps from `requestVideoFrameCallback` (section 4) or WebCodecs frames (section 6) go in as
  `timestampMs`; 21 landmarks per hand come out in image coordinates and in world coordinates. The hand landmarker
  overview page (https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker , read 2026-11-10) describes
  the world landmarks as "21 3D keypoints per hand in real-world meters, with the origin at the hand's geometric center
  (hand_world_landmarks in Python)." 
- Licence, code: npm field "Apache-2.0" (the package ships no licence file); repository file
  https://raw.githubusercontent.com/google-ai-edge/mediapipe/master/LICENSE (read 2026-11-10): Apache License 2.0
  (standard grant present). Licence, model weights and the model card ("Model Card Hand Tracking (Lite_Full) with
  Fairness Oct 2021", linked from the guide): quoted in `lanes/video-hands-fretboard/survey.md`, not re-read here.
- [verify] The model card is linked (URL-encoded) from both the web_js guide and the overview page
  (https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker , models table), checked 2026-11-10. The
  card, read 2026-11-10 from
  https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf
  (7 pages, PDF title "Model Card Hand Tracking (Lite/Full) with Fairness Oct 2021", text extracted with pdftotext):
  under "LICENSED UNDER" it reads "Apache License, Version 2.0". Under "Intended Uses", "OUT-OF-SCOPE APPLICATIONS"
  lists "Not appropriate for:" including "Predicting hand landmarks with gloves or occlusions. For example when the
  hand is holding objects or there is decoration on the hand including jewelry, tattoo and henna." Under
  "Limitations": "The model has been trained on limited datasets and is meant for experimental usage." Under
  "Ethical Considerations": "The primary intended application is for research and entertainment purposes."
- [verify] Type signature in the shipped `vision.d.ts` (https://unpkg.com/@mediapipe/tasks-vision@1.2.2/vision.d.ts ,
  read 2026-11-10): `detectForVideo(videoFrame: ImageSource, timestamp: number, imageProcessingOptions?:
  ImageProcessingOptions): HandLandmarkerResult;` with `export declare type ImageSource = TexImageSource;` (marked
  "@deprecated Use TexImageSource instead.").
- [verify] Run facts in `trials.md` (runs r0314, r0329): `FilesetResolver.forVisionTasks` +
  `HandLandmarker.createFromOptions` with `runningMode` "VIDEO", `numHands` 2, delegate "CPU" or "GPU"; model
  `hand_landmarker.task` float16, 7,819,105 bytes; output per frame `landmarks` (21 points per hand, x and y
  normalized to image width and height, z relative depth), `worldLandmarks`, `handedness` ("Left"/"Right" with a
  score); the console warned "Using NORM_RECT without IMAGE_DIMENSIONS is only supported for the square ROI" on the
  non-square clips.

## 37. Transformers.js

- What: Hugging Face, https://huggingface.co/docs/transformers.js/index (read 2026-11-10): "Transformers.js is
  designed to be functionally equivalent to Hugging Face’s transformers python library" and lists for audio
  "automatic speech recognition, audio classification, and text-to-speech" and "Transformers.js uses ONNX Runtime to
  run models in the browser." README of `@huggingface/transformers@4.3.2`: "By default, when running in the browser, the
  model will be run on your CPU (via WASM). If you would like to run the model on your GPU (via WebGPU), you can do this
  by setting `device: 'webgpu'`". Repository https://github.com/huggingface/transformers.js (last commit 2026-11-10).
- Version 4.3.2, published 2026-10-27; unpacked 9,990,867 bytes; `package.json` pins `"onnxruntime-web":
  "1.31.0-dev.20260914-8d85527a0"` and `"onnxruntime-node": "1.30.0"`. The older `@xenova/transformers` 2.17.2
  (2024-05-29) is the previous package name.
- WebGPU guide, https://huggingface.co/docs/transformers.js/guides/webgpu (read 2026-11-10): "As of March 2026, global
  WebGPU support is around 85% (according to caniuse.com), meaning some users may not be able to use the API." and
  "Thanks to our collaboration with ONNX Runtime Web, enabling WebGPU acceleration is as simple as setting device:
  'webgpu' when loading a model." The navigation lists "Using quantized models (dtypes)".
- Use here: runs any ONNX export in the Hub with a supported architecture; no guitar transcription pipeline is listed
  among its tasks on the page read. Model licences are per model card.
- Licence (`LICENSE` in the npm package): Apache License 2.0, standard grant present.

## 38. ffmpeg.wasm

- What: https://ffmpegwasm.netlify.app/docs/overview (read 2026-11-10): "ffmpeg.wasm is a pure WebAssembly /
  JavaScript port of FFmpeg" and "Flexible: ffmpeg.wasm comes with single-thread and multi-thread cores" and "Multimedia
  transcoding is a resource-intensive task that you don't want to execute in main thread, thus in ffmpeg.wasm we
  offload those task to web worker". Repository https://github.com/ffmpegwasm/ffmpeg.wasm (last commit 2025-09-16).
- Versions: `@ffmpeg/ffmpeg` 0.12.15 (2025-01-07, unpacked 71,999 bytes), `@ffmpeg/util` 0.12.2, `@ffmpeg/core`
  0.12.10 (2025-01-07; `dist/esm/ffmpeg-core.wasm` 32,232,419 bytes), `@ffmpeg/core-mt` 0.12.10 (2025-04-28;
  32,718,323 bytes). `core-mt` needs `SharedArrayBuffer`, so cross-origin isolation (section 7).
- How a program calls it: `const ffmpeg = new FFmpeg(); await ffmpeg.load({ coreURL, wasmURL });
  await ffmpeg.writeFile('in.mp4', data); await ffmpeg.exec(['-i','in.mp4','-ac','1','-ar','22050','out.wav']);
  await ffmpeg.readFile('out.wav')`. Method and option names checked in the shipped type files
  https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm/classes.d.ts (`load`, `exec: (args: string[], timeout?: number,
  ...)`, `writeFile`, `readFile`, `terminate`) and `types.d.ts` (`coreURL?`, `wasmURL?`, `workerURL?`), 2026-11-10.
- Limits, FAQ https://ffmpegwasm.netlify.app/docs/faq (read 2026-11-10): "What is the maximum size of input file?"
  "2 GB, which is a hard limit in WebAssembly. Might become 4 GB in the future." and "Why ffmpeg.wasm is so slow
  comparing to ffmpeg?" "As of now, WebAssembly is still a lot slower than native".
- Licence facts (read 2026-11-10):
  - FAQ: "@ffmpeg/core contains WebAssembly code which is transpiled from original FFmpeg C code with minor
    modifications, but overall it still following the same licenses as FFmpeg and its external libraries (as each
    external libraries might have its own license)." and "@ffmpeg/ffmpeg contains kind of a wrapper to handle the
    complexity of loading core and calling low-level APIs. It is a small code base and under MIT license."
  - npm licence fields: `@ffmpeg/ffmpeg` "MIT", `@ffmpeg/core` and `@ffmpeg/core-mt` "GPL-2.0-or-later". None of the
    three packages ships a licence file (file lists read 2026-11-10). Repository `LICENSE`: "MIT License", "Copyright
    (c) 2019 Jerome Wu".
  - The repository's `Dockerfile` at HEAD (2025-09-16; not necessarily the exact 0.12.10 build) builds FFmpeg
    `n5.1.4` with `--enable-gpl`, `--enable-libx264`, `--enable-libx265`, `--enable-libvpx`, `--enable-libmp3lame`,
    `--enable-libtheora`, `--enable-libvorbis`, `--enable-libopus`, `--enable-libwebp` among others. [verify] Re-read
    2026-11-10 (https://raw.githubusercontent.com/ffmpegwasm/ffmpeg.wasm/HEAD/Dockerfile): `ENV FFMPEG_VERSION=n5.1.4`
    and the flags listed. The shipped 0.12.10 core reports the same build: in `trials.md` (run r0314) `-version` inside
    the core printed "ffmpeg version 5.1.4", built with Emscripten 3.1.40 and configured with `--enable-gpl
    --enable-libx264 --enable-libx265 --enable-libvpx --enable-libmp3lame --enable-libtheora --enable-libvorbis
    --enable-libopus ...`.

## 39. TensorFlow.js

- What: Google. Guide https://www.tensorflow.org/js/guide/platform_environment (page "Last updated 2022-11-01 UTC",
  read 2026-11-10): "TensorFlow.js support multiple different backends that implement tensor storage and mathematical
  operations. At any given time, only one backend is active." and "The WebGL backend, 'webgl', is currently the most
  powerful backend for the browser. This backend is up to 100x faster than the vanilla CPU backend." and
  "TensorFlow.js provides a WebAssembly backend (wasm), which offers CPU acceleration and can be used as an alternative
  to the vanilla JavaScript CPU (cpu) and WebGL accelerated (webgl) backends." and "WASM backend leverages the XNNPACK
  library for optimized implementation of neural" (sentence continues). WebGPU backend package:
  `@tensorflow/tfjs-backend-webgpu`.
- Versions: `@tensorflow/tfjs` 4.22.0, published 2024-10-21 (latest on npm on 2026-11-10); same version for
  `tfjs-backend-wasm` (ships `tfjs-backend-wasm-threaded-simd.wasm` 435,643 bytes), `tfjs-backend-webgl`,
  `tfjs-backend-webgpu`.
- Used by: Basic Pitch TS (section 33, which declares `@tensorflow/tfjs ^3.2.0`), essentia.js models, Magenta.js,
  ml5.js.
- Licence: the npm packages ship no licence file; npm field "Apache-2.0". Repository file
  https://raw.githubusercontent.com/tensorflow/tfjs/master/LICENSE (read 2026-11-10): Apache License 2.0, standard
  grant present.

## 40. LiteRT.js

- What: Google AI Edge, https://ai.google.dev/edge/litert/web (page "Last updated 2026-06-12 UTC", read 2026-11-10):
  "LiteRT.js is Google's high performance WebAI runtime, targeting production Web applications." (sentence split across
  lines on the page) and "CPU performance, accelerated by XNNPack mapped to lightweight WebAssembly (Wasm). For GPU and
  dedicated hardware scaling (such as NPUs), LiteRT.js natively surfaces both the WebGPU API and the emerging WebNN
  API" and "Out-the-box integration with existing TensorFlow.js architectures by parsing natively supported
  TensorFlow.js Tensors as direct boundary inputs and outputs." README of `@litertjs/core@2.6.0`: "Core web runtime for
  [LiteRT](https://ai.google.dev/edge/litert) ([previously TFLite](https://developers.googleblog.com/en/tensorflow-lite-is-now-litert/)),
  Google's open-source high performance runtime for on-device AI."
- Version 2.6.0, published 2026-10-22; unpacked 47,436,526 bytes; WASM variants `litert_wasm_internal.wasm`
  (11,131,135 bytes), `_threaded_`, `_jspi_`, `_compat_`.
- Input: `.tflite` models. Use here: a path for running a TFLite export (Basic Pitch ships a TFLite variant in its
  Python package, per that README) in the browser; not tried here. [verify] "That README" is the Basic Pitch Python
  README, https://raw.githubusercontent.com/spotify/basic-pitch/HEAD/README.md (quoted in section 33: TensorFlow,
  CoreML, TensorFlowLite and ONNX models).
- Licence: npm field "Apache-2.0", no licence file in the package; repository https://github.com/google-ai-edge/LiteRT
  `LICENSE`: Apache License 2.0, standard grant present.

## 41. Magenta.js (`@magenta/music`): Onsets and Frames in the browser

- What: README of `@magenta/music@1.23.1` (read 2026-11-10): "This JavaScript implementation of Magenta's musical
  note-based models uses [TensorFlow.js](https://js.tensorflow.org) for GPU-accelerated inference." and
  "[OnsetsAndFrames](https://magenta.github.io/magenta-js/music/classes/_transcription_model_.onsetsandframes.html)
  implements Magenta's [piano transcription model](g.co/magenta/onsets-frames) for converting
  raw audio to MIDI in the browser. While it is somewhat flexible, it works best on solo piano recordings. The
  algorithm takes half the duration of audio to run on most browsers". Repository https://github.com/tensorflow/magenta-js
  (last commit 2024-03-25).
- Version 1.23.1, published 2021-11-01; unpacked 11,985,015 bytes.
- Licence: npm field "Apache-2.0"; package ships no licence file; repository `LICENSE`: "Copyright 2018 The Magenta
  Team. All rights reserved." and Apache License 2.0 text. The checkpoint's training data and its licence were not
  read here (UNVERIFIED; the audio-to-notes lane covers Onsets and Frames). [verify] Still UNVERIFIED after these
  reads on 2026-11-10: the checkpoint list,
  https://raw.githubusercontent.com/tensorflow/magenta-js/master/music/checkpoints/README.md , describes
  `onsets_frames_uni` only as "A unidirectional piano transcription model." (hosted at
  https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni); neither that file, the
  page https://magenta.tensorflow.org/oaf-js , nor `music/src/transcription/model.ts` names the training data or a
  separate weights licence. What would settle it: a Magenta statement of which dataset trained this checkpoint (if
  MAESTRO, its CC BY-NC-SA 4.0 clause is quoted in section 33).

## 42. ml5.js

- What: README of `ml5@1.4.0` (read 2026-11-10): "ml5.js aims to make machine learning approachable for a broad
  audience of artists, creative coders, and students. The library provides access to machine learning algorithms and
  models in the browser, building on top of [TensorFlow.js](https://js.tensorflow.org/)." Repository
  https://github.com/ml5js/ml5-next-gen (last commit 2026-11-09); its `src/` holds `HandPose`, `BodyPose`,
  `SoundClassifier` and others (no pitch-detection module in the listing read 2026-11-10).
- Version 1.4.0, published 2026-08-07; unpacked 77,669,274 bytes.
- Licence: sources conflict. npm `package.json` declares "MIT". The `LICENSE.md` in the package is the "ml5.js
  LICENSE": "_Version 1.0 of the ml5.js license was adopted and last updated on May 10, 2021. It applies to all
  contributions to the ml5.js library as of May 20,2021. Contributions prior to that date are licensed under the MIT
  license._" and "This license gives everyone as much permission to work with this software as possible as long as they
  comply with the ml5.js [Code of Conduct](https://github.com/ml5js/Code-of-Conduct), while protecting contributors
  from liability." and "You must use this software in compliance with the ml5.js [Code of
  Conduct](https://github.com/ml5js/Code-of-Conduct) as it exists at the time of your use." and "Each contribution to this software is licensed under this license for three years from the
  date it is contributed to the software. After that three year period the contribution is licensed under the [Blue
  Oak Model License v 1.0.0](https://blueoakcouncil.org/license/1.0.0)."

## 43. Meyda

- What: README of `meyda@5.6.3` (read 2026-11-10): "Meyda is a Javascript audio feature extraction library. Meyda
  supports both offline feature extraction as well as real-time feature extraction using the [Web Audio API]".
  Repository https://github.com/meyda/meyda (last commit 2024-04-21).
- Version 5.6.3, published 2024-04-21; unpacked 556,048 bytes. The package's file list includes extractors such as
  `dist/esm/extractors/chroma.js`, `mfcc.js` and `rms.js` (file list from unpkg, 2026-11-10).
- Licence (`LICENSE.md`): "The MIT License (MIT)", "Copyright (c) 2014 Hugh A. Rawlinson, Nevo Segal, Jakub Fiala",
  standard MIT grant present.

## 44. pitchy

- What: README of `pitchy@4.1.0` (read 2026-11-10): "pitchy is a simple pitch-detection library written entirely in
  JavaScript that aims to be fast and accurate enough to be used in real-time applications such as tuners. To do this,
  it uses the McLeod Pitch Method". README: instances are created with `PitchDetector.forFloat32Array(inputLength)`,
  then "the `findPitch(input, sampleRate)`" method is used, "returning an array consisting of the detected pitch (in
  Hz) and a "clarity"" value. Repository https://github.com/ianprime0509/pitchy (last commit
  2026-10-13).
- Version 4.1.0, published 2024-01-04; unpacked 33,090 bytes.
- Use here: a tuner or a tuning-offset check (input S7 of the shared inputs is detuned by known cents).
- [verify] `trials.md` (run r0329): `PitchDetector.forFloat32Array(2048)`, `findPitch(frame, 44100)` returned one
  `[frequency, clarity]` pair per call, as the README says.
- Licence (`LICENSE`): "Copyright 2018-2021 Ian Johnson", standard MIT grant present.

## 45. pitchfinder

- What: README of `pitchfinder@2.3.4` (read 2026-11-10): "A compilation of pitch detection algorithms for Javascript.
  Supports both the browser and node." It lists "**YIN**", "**Mcleod**", "**AMDF**" and others. Repository
  https://github.com/peterkhayes/pitchfinder (last commit 2025-12-16).
- Version 2.3.4, published 2025-12-16; unpacked 228,607 bytes.
- Licence: no licence file in the npm package or at the repository top level (checked 2026-11-10); `package.json`
  declares `"license": "GNU v3"` (not an SPDX identifier); the README has no licence section (searched 2026-11-10).
  Recorded as: no license file found at https://github.com/peterkhayes/pitchfinder on 2026-11-10. [verify] Re-checked
  2026-11-10: no licence file in the npm file list or in the repository's top-level listing (depth-1 clone).
  `trials.md` (run r0329) called `YIN({sampleRate: 44100})`; the detector returned Hz or null per frame.

## 46. aubiojs

- What: README of `aubiojs@0.2.1` (read 2026-11-10): "aubiojs is a real-time audio processing library based on
  [aubio](https://github.com/aubio/aubio)" listing "pitch detection" and "tempo detection", and "This project uses
  [emscripten](https://github.com/kripken/emscripten) to compile aubio". API shape: `aubio().then(({ Tempo }) => { const
  tempo = new Tempo(bufferSize, hopSize, sampleRate); tempo.do(audioBuffer); tempo.getBpm() })`. Repository
  https://github.com/qiuxiang/aubiojs (last commit 2023-08-17).
- Version 0.2.1, published 2022-11-08; unpacked 427,009 bytes; npm licence field empty.
- Licence: the package's `license` file: "Copyright (c) 2021 7c00", standard MIT grant present. The compiled-in aubio
  library's licence, https://raw.githubusercontent.com/aubio/aubio/master/COPYING (read 2026-11-10): "GNU GENERAL
  PUBLIC LICENSE Version 3, 29 June 2007". (aubio's CLI is installed on the box and is covered in other lanes.)
- [verify] `trials.md` (run r0329): the browser build `build/aubio.esm.js` could be bundled by esbuild only with
  `path`, `fs` and `crypto` marked external (its Node branch calls `require("path")`); `new Pitch('yinfft', 2048, 441,
  44100)` returned Hz (0 when none) per hop, `new Tempo(1024, 512, 44100)` returned non-zero on a beat, plus
  `getBpm()` and `getConfidence()`.

## 47. web-audio-beat-detector

- What: README of `web-audio-beat-detector@8.2.39` (read 2026-11-10): "**A beat detection utility which is using the
  Web Audio API.**" and "It retrieves the beats as BPM of a given AudioBuffer. The algorithm used is not as complex (and
  expensive to compute) as many others. But it yields surprisingly good results especially for electronic music." (an
  author's claim). Repository https://github.com/chrisguttandin/web-audio-beat-detector (last commit 2026-08-30).
- Version 8.2.39, published 2026-08-26; unpacked 42,283 bytes.
- API (README): "The `analyze()` function expects an `AudioBuffer` as its first parameter and it returns a `Promise`
  which eventually resolves with the tempo of that buffer as a number."; "The `guess()` function expects an
  `AudioBuffer` as well and also returns a `Promise`. The `Promise` will resolve with an object containing the
  estimated BPM (the rounded tempo) and the offset of the first beat in seconds."; "By default
  the bpm are expected to be between 90 and 180 bpm. This can be changed by specifying the `tempoSettings`."
- Output to a metronome: `{ bpm, offset, tempo }` is a constant-tempo grid (first beat time plus BPM), no per-beat list.
  [verify] Same in `trials.md` (run r0329): `analyze()` returned a float tempo, `guess()` an integer `bpm` and the
  `offset` of the first beat in seconds.
- Licence (`LICENSE`): "MIT License", "Copyright (c) 2026 Christoph Guttandin", standard MIT grant present.

## 48. realtime-bpm-analyzer

- What: README of `realtime-bpm-analyzer@5.6.1` (read 2026-11-10): "A powerful TypeScript library for detecting
  beats-per-minute (BPM) in real-time." Docs https://www.realtime-bpm-analyzer.com . Repository
  https://github.com/dlepaux/realtime-bpm-analyzer (last commit 2026-11-10).
- Version 5.6.1, published 2026-11-03; unpacked 373,408 bytes.
- Licence (`license.md` in the package): "Apache License Version 2.0, January 2004" (full text; npm field Apache-2.0).
- [verify] `trials.md` (run r0329): `analyzeFullBuffer(audioBuffer)` returned a list of `{tempo, count, confidence}`
  candidates with integer tempi.

## 49. OpenCV.js (`@techstark/opencv-js`)

- What: README of `@techstark/opencv-js@5.0.0-release.1` (read 2026-11-10): "OpenCV JavaScript version (NPM package)
  for node.js or browser." and "The file `opencv.js` was downloaded from https://docs.opencv.org/5.0.0/opencv.js".
  [verify] That URL returned HTTP 404 on 2026-11-10 (https://docs.opencv.org/5.x/opencv.js returned 200).
  Repository https://github.com/TechStark/opencv-js .
- Version 5.0.0-release.1, published 2026-06-24; unpacked 14,731,296 bytes.
- Use here: Hough lines, edges and homography for fret and string geometry in the browser (the methods themselves are
  covered by the video-hands-fretboard lane).
- Licence (`LICENSE` in the package): Apache License 2.0, standard grant present.

## 50. In-browser Demucs builds

Demucs itself (https://github.com/facebookresearch/demucs , shallow clone, last commit 2023-11-16, read 2026-11-10):
README "**Important:** As I am no longer working at Meta, **this repository is not maintained anymore**." and on
`htdemucs`: "It has been trained on the [MUSDB HQ][musdb] dataset + an extra training dataset of 800 songs." and
"`htdemucs`: first version of Hybrid Transformer Demucs. Trained on MusDB + 800 songs. Default model." Repository
`LICENSE`: "MIT License", "Copyright (c) Meta Platforms, Inc. and affiliates." The licence of the training data
(MUSDB18-HQ and the 800 songs) is covered by the source-separation lane, not re-read here.

[verify] Weights and training data, read 2026-11-10 (the code licence above does not settle the weights that every
build below ships or downloads):

- The Meta repository's README says only: "Demucs is released under the MIT license as found in the
  [LICENSE](LICENSE) file." and points to the author's fork ("I've created a fork at
  [github.com/adefossez/demucs](https://github.com/adefossez/demucs)."), whose README,
  https://raw.githubusercontent.com/adefossez/demucs/main/README.md , calls itself "the officially maintained Demucs"
  and adds: "The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.
  I sadly cannot help granting a license, both coming from Meta custom data, or from the original MusDB data. The 6
  source variant of htdemucs was trained only on Meta internal dataset, which likely means CC-NC-BY license is
  applicable, as it was the case for all models released by FAIR." The same README describes `htdemucs_6s` as "6
  sources version of `htdemucs`, with `piano` and `guitar` being added as sources."
- MUSDB18-HQ, Zenodo record https://zenodo.org/api/records/3338373 (license id `other-nc`): "MUSDBHQ: is provided for
  educational purposes only and the material contained in them should not be used for any commercial purpose without
  the express permission of the copyright holders", and "46 tracks are taken from the MedleyDB licensed under Creative
  Commons (BY-NC-SA 4.0)."
- The exporters below state MIT for their files (monteslu: "License: MIT, matching demucs."; Ghilda: "reconverted from
  the official MIT-licensed HTDemucs weights"; webnn card licence field `mit`). bakkot's demucs-js states the
  opposite for its copy of the same weights (quoted in its entry below). Both kinds of statement are recorded here;
  none of them is a licence grant from Meta.

- `demucs-web` (npm 1.0.2, 2025-12-01, unpacked 31,003 bytes, repository https://github.com/timcsy/demucs-web , last
  commit 2025-12-01). README (in Chinese, read 2026-11-10): "在瀏覽器中運行的音樂源分離 AI，使用 ONNX Runtime Web 實現
  WebGPU/WASM 加速推論。" (music source separation AI that runs in the browser, using ONNX Runtime Web for WebGPU/WASM
  inference), "支援 4 軌道分離：drums、bass、other、vocals", "基於 Meta 的 HTDemucs 模型", output example
  `result.drums // { left: Float32Array, right: Float32Array }`, "ONNX Runtime Web 需要 SharedArrayBuffer，必須設定以下
  HTTP headers：" `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, and "ONNX
  模型（約 172MB）託管於 Hugging Face Hub" with the link https://huggingface.co/timcsy/demucs-web-onnx/resolve/main/htdemucs_embedded.onnx .
  Licence: `LICENSE` "MIT License", "Copyright (c) 2024", standard MIT grant present. [verify] The weights repository
  it links, https://huggingface.co/timcsy/demucs-web-onnx (Hub API read 2026-11-10: created 2025-11-30, files
  `.gitattributes` and `htdemucs_embedded.onnx` only, no `license` in the card data), has no model card (README.md:
  HTTP 404), so no licence is stated for that weights file. [verify] `trials.md` (run r0329) downloaded that file
  (180,534,758 bytes) and ran `separate(left, right)` on the WASM execution provider (no WebGPU adapter on the box);
  it returned `{drums, bass, other, vocals}`, each `{left: Float32Array, right: Float32Array}` at 44.1 kHz and the
  input's length, as the README example shows; package defaults recorded there: segments of 343,980 samples with 25 %
  overlap, execution providers `['webgpu', 'wasm']`.
- `demucs-wasm` (npm 0.1.5, 2025-01-29, repository https://github.com/bengfarrell/demucs-wasm , last commit
  2025-01-28; ships `demucs_onnx_simd.wasm`, 1,120,550 bytes). README: "wrapper around demucs wasm" and "See
  https://github.com/sevagh/demucs.cpp for more details." and "I still reverse engineered MIT licensed code from
  https://github.com/sevagh/freemusicdemixer.com to get this complicated thing working." Licence: `LICENSE` "MIT
  License", "Copyright (c) 2024 Ben Farrell". npm licence field empty.
- sevagh's free-music-demixer (https://github.com/sevagh/free-music-demixer , last commit 2026-11-06). README (read
  2026-11-10): "An archived snapshot of an early demo of client-side music demixing (music source separation) in the
  browser, using the Demucs v4 hybrid transformer model compiled to WebAssembly. It is provided as-is and is no longer
  maintained." and "While the WASM modules and JavaScript in this repo are licensed under MIT, the AI model weights
  and other website assets are proprietary and not covered by the MIT license." and "Model weights are not included."
  It also reports: "'Georgia Wonder - Siren' (takes ~41 minutes)" with "vocals ==> SDR: 7.261", "drums ==> SDR:
  10.629", "bass ==> SDR: 10.593", "other ==> SDR: 6.324", and a run "~9 minutes with 8 workers" (author's figures; the
  machine is not stated in the lines read). `LICENSE`: "MIT License", "Copyright (c) 2023 Sevag H". sevagh/demucs.onnx
  (last commit 2026-02-08): `LICENSE` "MIT License", "Copyright (c) 2024 Sevag H".
- demucs-rs (https://github.com/nikhilunni/demucs-rs , last commit 2026-10-19). README: "A native Rust implementation
  of [HTDemucs v4](https://arxiv.org/abs/2211.08553)" and "Runs as a **native CLI** (Metal on macOS, Vulkan on
  Linux/Windows), entirely **in the browser** via WebAssembly + WebGPU, or as a **DAW plugin** (VST3/CLAP, macOS)" and
  "**Three model variants** — Standard (4-stem), 6-Stem (adds guitar & piano), and Fine-Tuned (best quality)".
  Browser demo https://nikhilunni.github.io/demucs-rs/ . `LICENSE`: Apache License 2.0 (README badge "license-Apache
  2.0"). Needs WebGPU in the browser (RUNNABLE? on this box). [verify] README: "Model weights are downloaded
  automatically from Hugging Face on first use (both CLI and web)." (weights terms: see the weights note above).
- [verify] bakkot's demucs-js, https://github.com/bakkot/demucs-js (last commit 2025-10-06; README and `LICENSE.md`
  read 2026-11-10 from raw.githubusercontent.com): "This is a port of Meta's MIT-licensed Demucs Python+PyTorch library
  to JavaScript+ONNX. This allows it to run on the web" and "Weights are included here for convenience but see
  LICENSE.md for license information." `LICENSE.md`: "Code in this reposity/package is licensed under the MIT license,
  as below. However, this repository/package also include a weights file ("htdemucs.onnx"), which is not covered by
  this license. It is derived from a weights file provided by Meta, which is made available for personal and research
  use only." npm `demucs` 1.0.0 (2025-10-07), npm license field "SEE LICENSE IN LICENSE.md", unpacked 174,316,256
  bytes; its CLI "wants 44.1 kHz files" (README). Web version: https://bakkot.github.io/demucs-js (HTTP 200,
  2026-11-10). Not run here.
- Hugging Face ONNX exports (model cards read 2026-11-10 via `https://huggingface.co/api/models/<id>` and
  `https://huggingface.co/<id>/raw/main/README.md`):
  - `monteslu/htdemucs-web-onnx` (card licence field `mit`, last modified 2026-07-07): "music source separation (drums
    / bass / other / vocals), exported to ONNX for **onnxruntime-web on WebGPU**"; "**21 chained pieces**
    (`htdemucs_p00.onnx` ... `htdemucs_p20.onnx`)"; "126MB total instead of 173MB"; author's measurement: "Measured on
    a Radeon RX 7600 with a WebGPU app actively rendering: 30Hz display holds a steady 30fps through the entire
    separation" and "Throughput ~22x realtime run back-to-back, ~8x with compositor-friendly" (sentence continues).
  - `webnn/stem-separator` (licence `mit`, created 2026-09-24): "ONNX export of Meta's pretrained **HTDemucs v4**
    (`htdemucs.th`, base/non-fine-tuned checkpoint)"; "running entirely client-side via ONNX Runtime Web with WebNN
    (NPU/GPU) acceleration, cascading to WebGPU/WASM"; files `onnx/htdemucs_fwd.onnx` "~2.3 MB" and
    `onnx/htdemucs_fwd.onnx.data` "~168 MB"; "No training or fine-tuning was performed. This is a format conversion of
    an already-trained model."
  - `Ghilda/htdemucs-onnx` (licence `mit`, created 2026-06-03): "This model was **reconverted from the official
    MIT-licensed HTDemucs weights**"; "**This ONNX export:** MIT License, © 2026 Ghilda."; "takes the raw waveform
    **and** a pre-computed complex spectrogram as inputs".
- Input / output: the Python Demucs README says of its output: "There you will find four stereo wav files sampled
  at 44.1 kHz: `drums.wav`, `bass.wav`," (sentence continues); the browser builds return the same four stems as float
  arrays (demucs-web example `result.drums // { left: Float32Array, right: Float32Array }`). The 6-stem variant adds
  guitar and piano (demucs-rs README). Each browser build's exact input contract is in its own README. A separated
  guitar stem is the handoff to Basic Pitch (section 33) and to the guitar-tab lane.

## 51. Beat This! ONNX export for the browser (`musetric/beat-this-onnx`)

- What: Hugging Face model card https://huggingface.co/musetric/beat-this-onnx (licence field `mit`, created
  2026-07-16, last modified 2026-10-08; read 2026-11-10): "ONNX export of **Beat This!**, the JKU beat/downbeat
  tracker (checkpoint `final0`), packaged for the [`musetric`][musetric] `packages/ai` runtime on `onnxruntime-web`'s
  **WebGPU** execution provider." Files: `beat_this.onnx`, `config.json`, `mel-filterbank.bin`.
- Input / output (card): "beat_this.onnx  spect [windows, 1500, 128] → beat, downbeat [windows, 1500]"; "**Feed one
  1500-frame window per call** — the author's window, 30 s of audio."; "**The host owns feature extraction, and the
  contract is exact.** 22050 Hz mono; channels downmixed as the **arithmetic mean**" with "STFT with `n_fft` 1024, hop
  441, a **periodic Hann** window"; frames are converted to seconds "at `fps` 50". Backends: "The wasm EP also works
  and gives identical results, at roughly 12× the wall clock." The card also states: "Training-data provenance of the
  upstream checkpoint is not documented here."
- Upstream: https://github.com/CPJKU/beat_this (last commit 2026-05-28). README licence section (read 2026-11-10):
  "The code and the published model weights are released under the [MIT license](LICENSE). Note that some of the
  training files are fully copyrighted or under limited Creative Commons licenses, and it is up to the user to assess
  whether this may impact their use case." and on checkpoints: "`final0`, `final1`, `final2`: Our main model, trained
  on all data except the GTZAN dataset, with three different seeds." `LICENSE`: "MIT License", "Copyright (c) 2024
  Institute of Computational Perception, JKU Linz, Austria". Beat This! itself (Python) is covered by the
  chords-beats-key lane.
- Output to a metronome: beat and downbeat times in seconds (after peak picking or DBN on the 50 fps activations),
  which a Web Audio scheduler (section 1) or alphaTab sync points (section 15) can take as click times or barline times.

## 52. OpenVoicing (an open-source app that already combines alphaTab, time-stretch and recording sync)

- What: repository https://github.com/pjdoland/openvoicing (shallow clone, last commit 2026-07-26; README read
  2026-11-10 from https://raw.githubusercontent.com/pjdoland/openvoicing/main/README.md): "**Living sheet music:
  notation that plays, slows down without changing pitch, and syncs to real recordings.**" Status badge: "status-early
  development". Features listed: "**Practice:** play/pause, loop, tempo control without pitch change, metronome,
  count-in." and "**Recordings:** open an audio file, see its waveform, sync it to the score, click to seek, drag to
  loop, slow it down without changing pitch — via the [Signalsmith Stretch](https://signalsmith-audio.co.uk/code/stretch/)
  AudioWorklet. Or sync a **YouTube video** and follow the notation as it plays (embedded via YouTube's player, never
  downloaded)." Rendering: "[alphaTab](https://alphatab.net) behind a renderer-agnostic API."
- Format and CLI: "self-contained bundles (`.ovb`) holding a score, its recordings, and the sync map that aligns them";
  CLI shape from the README: `node packages/bundle/bin/ovb.mjs create --score song.musicxml --recording take.mp3 --out
  song.ovb`; embed: `OpenVoicing.create("#slot", { bundle: "https://example.com/tune.ovb" })`. The README marks the
  "Embed SDK & `.ovb` format" as "Working; **not yet version-stable** — pin what you embed".
- Licence: `LICENSE` "MIT License", "Copyright (c) 2026 PJ Doland". `LICENSING.md`: "OpenVoicing is released under the
  **MIT License**." and "OpenVoicing bundles or depends on a few third-party components that keep their own licenses."
  and "**alphaTab** (notation rendering and synth): **MPL-2.0**, which is file-level copyleft." Not run here.

## 53. libav.js [verify: section added by the checker]

- What: README, https://raw.githubusercontent.com/Yahweasel/libav.js/HEAD/README.md (read 2026-11-10): "This is a
  compilation of the libraries associated with handling audio and video in FFmpeg—libavformat, libavcodec,
  libavfilter, libavutil and libswresample—for WebAssembly and asm.js, and thus the web, as well as the `ffmpeg` and
  `ffprobe` CLIs themselves." and "In short, this is a pure JavaScript and WebAssembly system for low-level audio and
  video encoding, decoding, muxing, demuxing, and filtering." Maker: Yahweasel. Repository
  https://github.com/Yahweasel/libav.js (HEAD 2026-11-02, read from a depth-1 blob-less clone 2026-11-10).
- Version: npm `libav.js` 6.10.9, published 2026-08-18, npm license field "LGPL-2.1", unpacked 179,082,060 bytes;
  README: "libav.js is published to NPM as `libav.js`, and each released variant is published in a much smaller NPM
  package as `@libav.js/variant-<variant>`." (`@libav.js/variant-default` 6.10.9, 2026-08-18, LGPL-2.1, unpacked
  11,954,473 bytes). The `libav.js` package's file list (unpkg, 2026-11-10) has `dist/` (166 files), `docs/` and
  `sources/` (10 archives, among them `ffmpeg-9.0.tar.xz`, `opus-1.6.1.tar.gz`, `libvorbis-1.3.7.tar.xz`,
  `lame-3.100.tar.gz`, `libvpx-1.16.0.tar.gz`) and no licence file at its top level.
- How a program calls it (README example): load `libav-<version>-<variant>.js`, then
  `const libav = await LibAV.LibAV({noworker: true}); await libav.writeFile("tmp.opus", bytes);
  const [fmt_ctx, [stream]] = await libav.ff_init_demuxer_file("tmp.opus");` then `ff_init_decoder`, `ff_read_multi`
  and `ff_decode_multi(c, pkt, frame, packets[stream.index], true)`. README: "`LibAV.LibAV` is a factory function
  which returns a promise which resolves to a ready instance of libav." Builds come as asm.js, plain WebAssembly and
  threaded WebAssembly files (README "Plain WebAssembly", "Threaded WebAssembly").
- Variants (README, "Variants and Building libav.js"): "The default variant, `libav-<version>-default.js`, includes
  support for the most important (and timeless) audio codecs and formats: Opus, FLAC, and wav, in WebM, ogg, FLAC, or
  wav containers. It also has a set of common audio filters."; Vorbis is in the "obsolete" variant ("Same as default
  with the addition of two obsolete codecs, Vorbis" (sentence continues)).
- Use here: demux and decode in the page with FFmpeg's own code rather than the browser's decoders (the box's
  WebCodecs `AudioDecoder` refused FLAC and Vorbis configs without a description, section 6), and resampling with
  libswresample before Basic Pitch's 22,050 Hz mono input. Not run here.
- Licence (README): "FFmpeg is released under the LGPL. Therefore, if you distribute this library, you must provide
  sources. The sources are included in the `sources/` directory of the compiled version of libav.js." and "the small
  amount of wrapper functions provided by libav.js are all released under the so-called “0-clause BSD” license, which
  does not require that the license text itself appear in derivative works." Companion package
  `libavjs-webcodecs-polyfill` 0.5.5 (2025-07-04, npm license field "0BSD"): "A WebCodecs polyfill (ponyfill, really),
  using libav.js" (npm description).

## 55. StemSplit's htdemucs_6s ONNX export in ONNX Runtime Web (`StemSplitio/htdemucs-6s-onnx`, demucs-onnx's browser helpers) [gap round 2]

Added on 2026-11-11 by `gapfill-browser-audio-sync` (date from `date -u +%F`); every page below was read that day.
Raw copies are kept outside the repo in `/home/user/gtr/lanes/browser-audio-sync/gap2/fetch/` and
`gap2/wheel/` (not committed).

- What: Hugging Face model repository https://huggingface.co/StemSplitio/htdemucs-6s-onnx (Hub API
  `https://huggingface.co/api/models/StemSplitio/htdemucs-6s-onnx?blobs=true`: revision
  `49df9b6989cf2150840ea65b0bef77a2e471b678`, created and last modified 2026-05-21, card data `license: mit`,
  `library_name: onnxruntime`, `pipeline_tag: audio-to-audio`, `datasets: StemSplitio/stem-separation-benchmark-2026`).
  Card (https://huggingface.co/StemSplitio/htdemucs-6s-onnx/raw/main/README.md): "The **first ONNX export of the 6-stem
  `htdemucs_6s` variant** on the Hugging Face Hub. Adds **guitar** and **piano** stems on top of the standard 4 (drums
  / bass / other / vocals)." (the maker's claim, not checked). Maker: StemSplit (stemsplit.io), which also runs a
  hosted API (card: "same model under the hood, hosted for you, with credits"; hosted-apis lane).
- Files (Hub API): `htdemucs_6s.onnx` 258,159,781 bytes (LFS sha256 `48f8e849...`), `htdemucs_6s_fp16weights.onnx`
  136,428,532 bytes (LFS sha256 `7ce55792...`), `infer.py` 4,909 bytes, `requirements.txt` 46 bytes (onnxruntime>=1.17,
  numpy>=1.24, soundfile>=0.12), `README.md`. Card: "`htdemucs_6s.onnx` — 258 MB, opset 17, parity-verified vs PyTorch
  fp32." and "`htdemucs_6s_fp16weights.onnx` — 136 MB, fp16-stored weights, same runtime memory / latency."; "Parity vs
  PyTorch fp32 (random input, 7.8 s segment)": "max abs diff: **2.42 × 10⁻⁴**" (fp32) and "**1.06 × 10⁻⁴**" (fp16 weights
  against fp32 weights) (the maker's figures).
- Input / output (card, "Input / output spec"): input `mix`, `(1, 2, 343980)`, float32, "Stereo, 44.1 kHz, 7.8 s
  segment. Values in [-1, 1]."; output `stems`, `(1, 6, 2, 343980)`, float32, "Stems in order `[drums, bass, other,
  vocals, guitar, piano]`."; "For longer audio, chunk with overlap-add — see `infer.py::separate`." The STFT is inside
  the graph: "Complex-typed `torch.stft` outputs → `Conv1d` with sin/cos kernels." (card, "How it was built"). The
  demucs-onnx browser guide (https://stemsplit.github.io/demucs-onnx/browser/): "The exported ONNX graph bakes the
  segment length in to keep the model ~3× smaller (no dynamic-shape blowup in attention). Chunked overlap-add recovers
  any length." and "The graph still computes in fp32 at runtime, so latency and accuracy are unchanged; only the
  download shrinks 1.91×."
- How a page calls it (card, "Mobile / Web"): `ort.InferenceSession.create("htdemucs_6s_fp16weights.onnx", {
  executionProviders: ["wasm"] })`, then `sess.run({ mix: t })` with `new ort.Tensor("float32", audioBuffer, [1, 2,
  343980])` ("out.stems is (1, 6, 2, 343980)"). The overlap-add is in `infer.py` (`separate`: segments of
  `int(7.8 * 44100)` = 343,980 samples, overlap `N_SAMPLES // 4`, `np.linspace(0, 1, overlap)` fades) and identically in
  the PyPI package demucs-onnx 0.3.4 (`_chunked_separate_single`, wheel sha256 `9232ad4c...`, uploaded 2026-05-22).
  demucs-onnx's `browser.py` (in the wheel) prints bundler snippets (`demucs-onnx browser-config --bundler vite`, or
  webpack, esbuild, next, rollup), all with `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp`, and writes a demo (`demucs-onnx browser-demo PATH`, `--react` for Vite +
  React + TypeScript) whose script imports `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort.min.mjs`, sets
  `ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency ?? 2, 4)` and creates the session with
  `executionProviders: ["wasm"], graphOptimizationLevel: "all"`; its default model is the htdemucs_ft vocals file
  (`htdemucs_ft_vocals_fp16weights.onnx`, "~166 MB"). Its JavaScript fade is `w[i] = i / overlap`, while the Python
  uses `np.linspace(0, 1, overlap)`; the guide says: "For htdemucs_6s change stems[rowOffset + ...] to use a 6-row
  layout and pick whichever row you want ( drums=0, bass=1, other=2, vocals=3, guitar=4, piano=5 )."
- Speed and memory as published (the maker's figures, not measured here): card, "Single 7.8 s segment, Apple M4 Pro
  CPU": `htdemucs_6s_fp16weights.onnx` "~1.1 GB" RAM, "~1.6 s" latency, RTF "0.20"; browser guide: "Single-threaded WASM
  on an Apple M4 Pro processes a 7.8 s chunk in ~6 s (RTF ~0.77)" and "We've measured ~2.5 s per 7.8 s chunk on the
  same Apple M4 Pro with 4 threads." What this box measured is in `trials.md`, "Gap round 2": with the
  `graphOptimizationLevel: "all"` the demo uses (and with `basic`), `InferenceSession.create` threw `std::bad_alloc`
  in ONNX Runtime Web 1.31.1 with the renderer at about 4.38 GB (section 35 quotes the docs' "WebAssembly has a memory
  limit of 4GB."); with `disabled` it ran (2 threads: 29.09 s for 10 s of audio on 2 cores, renderer peak 1,319 MB).
- Use here: the guitar row of `stems` as a Float32Array at 44.1 kHz is the in-page handoff to Basic Pitch (section 33,
  after resampling to 22,050 Hz mono) and to a waveform view (sections 16 and 17); not run as a pipeline here.
- Licence: card front matter `license: mit`, and the card's "License & attribution": "This repo is **MIT-licensed**,
  matching the original HT-Demucs." demucs-onnx's `LICENSE` (in the 0.3.4 wheel, `demucs_onnx-0.3.4.dist-info/licenses/
  LICENSE`): "MIT License", "Copyright (c) 2026 StemSplit", standard MIT grant present ("Permission is hereby granted,
  free of charge, to any person obtaining a copy of this software and associated documentation files"); PyPI
  `license` field "MIT". Weights: these are
  Meta's `htdemucs_6s` weights converted to ONNX; the Demucs maintainer's README,
  https://raw.githubusercontent.com/adefossez/demucs/main/README.md (re-read 2026-11-11, same text as quoted in section
  50): "The license of the weights is not clear: MusDB contains some data that were only usable for research purpose."
  and "The 6 source variant of htdemucs was trained only on Meta internal dataset, which likely means CC-NC-BY license
  is applicable, as it was the case for all models released by FAIR." The MIT statements above are the converter's;
  none is a licence grant from Meta (as for the other exports in section 50).

## Access needs (what cannot be settled on the CPU-only box)

- WebGPU paths (ONNX Runtime Web `webgpu` EP, Transformers.js `device: 'webgpu'`, demucs-rs, the
  `monteslu/htdemucs-web-onnx` and `musetric/beat-this-onnx` exports, LiteRT.js GPU): need a browser with a WebGPU
  adapter. BCD `api.GPU` (read 2026-11-10) lists Chrome 144 (with "Linux (Intel Gen12+ GPUs only)"), Safari 26, Firefox
  141 on Windows. A desktop browser with a supported GPU is needed to try these paths; the CPU/WASM fallbacks of the
  same tools can run on the box. [verify] Confirmed on the box by `trials.md`, run r0042: `requestAdapter()` returned
  null in headless Chromium 153.
- WebNN (`webnn/stem-separator`, ONNX Runtime Web `webnn` EP): BCD lists Chrome 112 behind a flag only.
- Real output latency (`outputLatency`, `getOutputTimestamp()`): a headless container has no sound card, so the values
  measured there do not describe a listener's device; a real browser on a real device is needed. [verify] The values
  the headless browser reported are in section 3 (runs r0042, r0143, r0150).
- Licensed SDKs: Superpowered ("there is no free license available that allows public release"; licences through
  licensing@superpowered.com, and the pricing page says "Superpowered is sunsetting"); Bungee Pro (contact through
  https://bungee.parabolaresearch.com/); Rubber Band commercial licence (https://breakfastquay.com/rubberband/license.html);
  Essentia/essentia.js proprietary licence and models (contact MTG-UPF, https://essentia.upf.edu/licensing_information.html).

## Handoff facts

One line per fact: "X outputs ..., which Y accepts as ...". Each half cites the page or file it was read from (all
read 2026-11-10). Where a conversion is needed between the two, the line says so; a conversion step is a fact about
formats, not a tested pipeline (tested pipelines are in `trials.md`).

1. Basic Pitch TS `generateFileData(notes)` outputs a MIDI file whose notes carry `midi: note.pitchMidi`,
   `time: note.startTimeSeconds`, `duration: note.durationSeconds`, `velocity: note.amplitude` plus pitch bends
   (https://unpkg.com/@spotify/basic-pitch@1.0.1/esm/toMidi.js), which @tonejs/midi reads back as notes with `midi`,
   `time` (seconds), `ticks`, `duration` (seconds), `velocity` (0-1) (https://unpkg.com/@tonejs/midi@2.0.28/README.md),
   and the pitch bends as `track.pitchBends` with `time`, `ticks`, `value` (`dist/Track.d.ts`, `dist/PitchBend.d.ts`,
   section 10) [verify]. [verify] `generateFileData` is not exported from the package entry and returns a Node.js
   `Buffer` (section 33); a page can build the same file with @tonejs/midi's `addNote` / `addPitchBend` and
   `midi.toArray()`, as the function body does.
2. @tonejs/midi outputs notes with `midi`, `time` and `duration` in seconds (README above), which smplr accepts as
   `start({ note: "C4", velocity: 80, time: 5, duration: 1 })` with `velocity` "(0–127)"
   (https://unpkg.com/smplr@1.2.0/README.md); @tonejs/midi's 0-1 velocity has to be scaled to 0-127. [verify] The
   smplr half ran in `trials.md` (run r0229: `start({note, velocity, time, duration})` with notes from the S2n truth
   list, not from @tonejs/midi).
3. Basic Pitch TS outputs note events with `pitchMidi`, `startTimeSeconds`, `durationSeconds`, `amplitude`,
   `pitchBends` (toMidi.js above) or a MIDI file (fact 1), which the string-and-fret assigners of the guitar-tab lane take
   as MIDI or note lists (`lanes/guitar-tab/survey.md`). [verify] Named there: tuttut, "A package to convert MIDI
   files to string instrument tabs", called as `tuttut-cli <source.mid> <output_dir>`; gtrsnipe, `gtrsnipe -i input.mid -o
   out.tab`; scorify, described there as arranging "a note list onto a fretted instrument with tunings".
4. A MIDI file (from Basic Pitch or any transcriber) is not among alphaTab's documented input formats: alphaTab "renders
   interactive guitar tabs and sheet music from Guitar Pro, MusicXML, Capella, and the built-in alphaTex syntax"
   (https://alphatab.net); the notes must first be written as one of those (for example by the guitar-tab or
   web-tab-render lanes' tools) before alphaTab can render, play and sync them. [verify] alphaTab's "File Formats"
   page (https://alphatab.net/docs/category/formats , read 2026-11-10) lists Guitar Pro 3-5, 6, 7, 8, MusicXML and
   Capella/CapXML, and no MIDI format.
5. Guitar Pro files (written by tools in the guitar-tab lane, `lanes/guitar-tab/survey.md`; [verify] there: PyGuitarPro,
   "GP3 / GP4 / GP5 read and write", and Guitab and Audio2Tab, listed there as producing .gp5) are read by alphaTab
   (https://alphatab.net), which then plays them with `metronomeVolume`, `countInVolume` and `playbackSpeed`
   (https://alphatab.net/docs/reference/api/metronomevolume , /countinvolume , /playbackspeed).
6. Beat This! (ONNX export) outputs beat and downbeat activations at "`fps` 50", turned into times in seconds by the
   host's peak picking or DBN (https://huggingface.co/musetric/beat-this-onnx), which alphaTab accepts as sync points in
   the flat form `{ barIndex, barPosition, barOccurence, millisecondOffset }` ("millisecondOffset — the audio timestamp
   in milliseconds this point maps to", https://alphatab.net/docs/features/play-sync/sync-points-at-runtime): downbeat
   k at t seconds maps to `{ barIndex: k, barPosition: 0, barOccurence: 0, millisecondOffset: 1000 * t }` when the
   score's bars match the recording's bars one to one (repeats need `barOccurence`).
7. web-audio-beat-detector `guess()` outputs "the estimated BPM (the rounded tempo) and the offset of the first beat in
   seconds" (https://unpkg.com/web-audio-beat-detector@8.2.39/README.md), which a Web Audio metronome accepts as click
   times `start(t0 + offset + n * 60 / bpm)` on the `currentTime` clock (`start(when)`: "The time, in seconds, at which
   the sound should begin to play", MDN `AudioScheduledSourceNode.start()`).
8. Beat This! beat times (seconds of media time, fact 6) feed the same `start(when)` scheduler; at a slowed playback
   rate r, a beat at media time m plays at context time `t0 + (m - m0) / r`, where Signalsmith Stretch's
   `schedule({ output, input, rate })` takes `output` as "audio context time for this change" and `input` as "position
   in input buffer" (https://unpkg.com/signalsmith-stretch@1.3.2/README.md).
9. `requestVideoFrameCallback` outputs `metadata.mediaTime` ("the media presentation timestamp of the presented frame",
   in seconds) and `presentedFrames` (MDN `HTMLVideoElement.requestVideoFrameCallback()`), which MediaPipe Hand
   Landmarker accepts as `detectForVideo(frame, timestampMs)` in `runningMode: "VIDEO"` "with monotonic timestamps"
   (https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js): `timestampMs = mediaTime * 1000`.
10. WebCodecs `VideoFrame` carries its timestamp "in microseconds" (MDN WebCodecs API page), and the MediaPipe web
    guide's example passes decoded frames with a millisecond timestamp to `detectForVideo(frame, timestampMs)` (guide
    above): divide by 1000. Whether `detectForVideo` takes a WebCodecs `VideoFrame` object directly was left open by
    the survey. [verify] At the type level it does: the shipped `vision.d.ts` of `@mediapipe/tasks-vision@1.2.2` declares
    `detectForVideo(videoFrame: ImageSource, timestamp: number, ...)` with `ImageSource = TexImageSource` (section 36),
    and TypeScript's DOM library defines `type TexImageSource = ImageBitmap | ImageData | HTMLImageElement |
    HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas | VideoFrame;`
    (https://unpkg.com/typescript@5.9.3/lib/lib.dom.d.ts , line 39229, read 2026-11-10). At run time it did too:
    `trials.md` (runs r0314 and r0329) passed each Mediabunny-decoded frame as a `VideoFrame`
    (`s.toVideoFrame()`, `scripts/pages/mediapipe.html`) to `detectForVideo(vf, Math.round(s.timestamp * 1000))` in
    headless Chromium 153 with the CPU and the GPU (WebGL on SwiftShader) delegate and got landmarks back.
11. MediaPipe Hand Landmarker outputs 21 landmarks per hand in image coordinates, world landmarks as "21 3D keypoints per
    hand in real-world meters", and handedness (https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker),
    which the video-hands-fretboard lane maps to fret and string positions (`lanes/video-hands-fretboard/survey.md`);
    OpenCV.js (section 49) is one in-browser library with Hough line and homography functions for that step [verify:
    wording changed from "is the in-browser library"].
12. ffmpeg.wasm `exec(args: string[])` with `-ac 1 -ar 22050` writes mono 22,050 Hz audio
    (https://unpkg.com/@ffmpeg/ffmpeg@0.12.15/dist/esm/classes.d.ts for the API; the flags are FFmpeg's own), which Basic
    Pitch TS requires: it throws "Input audio buffer is not at correct sample rate!" or "Input audio buffer is not
    mono!" otherwise (https://unpkg.com/@spotify/basic-pitch@1.0.1/esm/inference.js).
13. Mediabunny reads MP4/MOV/WebM/MKV/MP3/WAVE/Ogg/FLAC and decodes through WebCodecs
    (https://unpkg.com/mediabunny@1.65.2/README.md); WebCodecs `AudioData` sample data "can be extracted as a
    {{jsxref("Float32Array")}} via the `copyTo` method" (MDN WebCodecs API), which must be downmixed and resampled to 22,050 Hz mono before Basic Pitch TS
    accepts it (fact 12).
14. The in-browser Demucs builds output four stems; demucs-web returns `result.drums // { left: Float32Array, right:
    Float32Array }` (https://unpkg.com/demucs-web@1.0.2/README.md) and Demucs writes "four stereo wav files sampled at
    44.1 kHz" (https://github.com/facebookresearch/demucs README), which Basic Pitch TS accepts only after downmix to
    mono and resampling to 22,050 Hz (fact 12). The 6-stem model adds a guitar stem (demucs-rs README).
15. An `<audio>`/`<video>` element with `playbackRate` and `preservesPitch` (HTML Standard) is accepted by alphaTab as an
    external media source through `IExternalMediaHandler`; the guide's example passes
    `updatePosition((media.currentTime / media.playbackRate) * 1000)` and seeks with `media.currentTime = (time *
    media.playbackRate) / 1000` (https://alphatab.net/docs/guides/audio-video-sync).
16. A YouTube iframe player's `getCurrentTime()` is accepted by alphaTab through the same handler, as in the guide's
    example `api.player.output.updatePosition(player.getCurrentTime() * 1000)` (same page); YouTube's own terms are
    covered by the hosted-apis lane.
17. alphaTab outputs position events with the current time "in milliseconds" and "in midi ticks", plus `isSeek`,
    `originalTempo`, `modifiedTempo` (https://alphatab.net/docs/reference/types/synth/positionchangedeventargs/), and
    metronome ticks as `AlphaTabMetronomeEvent` through `midiEventsPlayed`
    (https://alphatab.net/docs/features/play-sync/count-in-and-metronome), which a page can use to drive a waveform
    cursor (wavesurfer.js, section 16) or a video seek. [verify] Receiving side, checked 2026-11-10: wavesurfer.js
    8.0.5's shipped `dist/wavesurfer.d.ts` (https://unpkg.com/wavesurfer.js@8.0.5/dist/wavesurfer.d.ts) declares
    `setTime(time: number): void;` with the comment "Jump to a specific time in the audio (in seconds)", so a cursor
    position in milliseconds goes in as `setTime(ms / 1000)`; for a `<video>` element, MDN
    (`web/api/htmlmediaelement/currenttime/index.md`, read 2026-11-10): "**`currentTime`** property specifies the
    current playback time in seconds." and "Changing the value of `currentTime` seeks the media to the new time."
18. User constraint "tuning and capo" (lowest sounding open-string pitch) maps onto Basic Pitch TS's `minFreq`/`maxFreq`
    arguments of `outputToNotesPoly` (toMidi.js above); "tempo range" maps onto web-audio-beat-detector's
    `tempoSettings` (default "between 90 and 180 bpm", README above) and onto the DBN range in the Beat This! host
    post-processing ("55–215 BPM", model card above); "this bar starts here" maps onto an alphaTab sync point (fact 6).
19. pitchy `findPitch(input, sampleRate)` outputs "the detected pitch (in Hz) and a "clarity"" value
    (https://unpkg.com/pitchy@4.1.0/README.md); a measured open-string frequency compared with its nominal frequency gives
    the tuning offset in cents (1200 · log2(f / f_nominal)), the "tuning" constraint of fact 18 (shared input S7 is
    detuned by a known number of cents, `PLAN.md`).
20. A guitar stem or full mix decoded in the page can be shown with wavesurfer.js (`WaveSurfer.create({ url })`) or with
    peaks.js from precomputed `audiowaveform` data (`dataUri: { arraybuffer: 'sample.dat' }`), and wavesurfer's Regions
    plugin gives "visual overlays and markers for regions of audio" for choosing a loop to slow down (sections 16 to 18).

## Not covered [verify]

Found by the checker on 2026-11-10 (web search, then the npm registry record of each package read the same day:
latest version, its publish date, the npm license field, and the package's own npm `description` in quotes). Not
surveyed in depth here and not run.

- `@remotion/media-parser` and `@remotion/webcodecs` 4.0.542 (2026-11-09), https://github.com/remotion-dev/remotion :
  "A pure JavaScript library for parsing video files" and "Media conversion in the browser"; npm license fields
  "Remotion License https://remotion.dev/license" and "Remotion License (See https://remotion.dev/docs/webcodecs#license)"
  (licence terms not read here).
- `@elemaudio/core` 4.0.1 (2024-12-10) and `@elemaudio/web-renderer` 4.0.3 (2024-12-21), MIT: "Official package for
  rendering Elementary Audio applications to Web Audio" (no repository field on npm).
- `@grame/faustwasm` 0.20.1 (2026-11-07), LGPL-2.1, https://github.com/grame-cncm/faustwasm : "WebAssembly version of
  Faust Compiler".
- `@csound/browser` 7.0.0 (2026-10-22), Apache-2.0, repository https://github.com/csound/csound (its npm description is
  a badge line, not quoted).
- `@rnbo/js` 1.4.6 (2026-11-03), MIT: "JavaScript runtime for using exported RNBO Patchers in a Web Browser".
- `@webaudiomodules/api` 2.0.0-alpha.6 (2023-03-06), MIT: "WebAudioModules Plugin API".
- `node-web-audio-api` 2.2.0 (2026-08-09), BSD-3-Clause, https://github.com/ircam-ismm/node-web-audio-api : "Web Audio
  API implementation for Node.js".
- `@ircam/sc-components` 3.11.1 (2026-10-27), BSD-3-Clause, https://github.com/ircam-ismm/sc-components : "Web Component
  library for audio applications".
- `howler` 2.2.4 (2023-09-19), MIT, https://github.com/goldfire/howler.js : "Javascript audio library for the modern
  web."
- `waveform-playlist` 4.3.3 (2022-02-26), MIT, https://github.com/naomiaro/waveform-playlist : "Multiple track web audio
  editor and player with waveform preview".
- `audiomotion-analyzer` 4.5.4 (2026-01-09), AGPL-3.0-or-later, https://github.com/hvianna/audioMotion-analyzer :
  "High-resolution real-time graphic audio spectrum analyzer JavaScript module with no dependencies."
- `@alexanderolsen/libsamplerate-js` 2.1.2 (2024-08-16), MIT, https://github.com/aolsenjazz/libsamplerate-js : "Resample
  audio in node or browser using a webassembly port of libsamplerate."
- `audio-decode` 3.12.0 (2026-08-11), MIT, https://github.com/audiojs/decode : "Decode audio to AudioBuffer; unscoped
  alias of @audio/decode".
- `@echogarden/sonic-wasm` 0.2.0 (2024-10-26), Apache-2.0, https://github.com/echogarden-project/sonic-wasm : "Sonic
  library, compiled to WASM. Intended for use with Echogarden."
- `webmidi` 3.3.1 (2026-09-15), Apache-2.0, https://github.com/djipco/webmidi : "WEBMIDI.js makes it easy to talk to MIDI
  instruments from a browser or from Node.js."
- `abcjs` 6.7.2 (2026-10-16, MIT) and `osmd-audio-player` 0.7.0 (2021-12-30, MIT): players tied to notation renderers;
  both are in `lanes/web-tab-render/survey.md`.
- fnaught, https://huggingface.co/mnaoizyyy/fnaught (card licence `mit`, created 2026-06-12) and npm `fnaught` 0.1.3
  (2026-06-12, MIT, dependency `onnxruntime-web` ^1.19.2). Card: "a 106k-parameter CNN for monophonic
  fundamental-frequency (f0) estimation, distributed as a single 428 KB ONNX file"; "Output: per-frame pitch (Hz) and
  confidence in [0, 1]"; usage `await PitchDetector.create()` then `detector.detect(audio, { sampleRate: 44100 })`.
- SwiftF0's browser demo, README of https://github.com/lars76/swift-f0 (HEAD 2026-09-25; `LICENSE` "MIT License",
  "Copyright (c) 2025-2026 Lars Nieradzik"): "The demo runs entirely client-side with ONNX Runtime Web, so your audio
  stays private." The model and Python package are in `lanes/audio-to-notes/survey.md`, section 7.

## Verification log (verify-docs-browser-audio-sync, 2026-11-10)

Method. Every page, package file and repository file the survey cites was fetched again on 2026-11-10 into
`/home/user/gtr/lanes/browser-audio-sync/verify-docs/` (not committed; fetch log `fetch/_log.tsv`), independently of the
docs agent's saved copies: 151 fetches of pages and files by `scripts/verify_fetch.sh` (five answered HTTP 404: MDN's
WebNN page, as the survey says, and four look-ups by the checker whose 404 is recorded where it matters: the
`timcsy/demucs-web-onnx` model card, MuseScore's FluidR3Mono licence file, the splendid-grand-piano `LICENSE`, and a
guessed Basic Pitch `esm/constants.js` path used for nothing), 10 more for the tools found by the checker
(`cand/_log.tsv`), and the licence, README and `package.json` files of all 57 npm packages named in the tool list by
`scripts/verify_npm.py`, plus the npm registry record of each. `scripts/verify_quotes.py` then searched for every
double-quoted passage of the survey in those copies (whitespace and markdown emphasis or link syntax ignored, as the
task allows), and `scripts/verify_attrib.py` checked that the copy it was found in is the source cited next to it.
Repository "last commit" dates were re-read with `scripts/verify_repos.sh` (bare, depth-1, blob-less clones, deleted
afterwards); browser-support rows with `scripts/verify_bcd.py`; specific passages with `scripts/verify_in.py`.

Tally for the survey as handed over (before the checker's additions):

| Check | Count | Result |
|---|---|---|
| Quoted passages of 12+ characters | 493 | 476 found verbatim, 1 found with whitespace removed (MediaPipe benchmark table cells), 16 not found by the script: 5 of those are not quotations (terms in quote marks such as "npm license field"), 11 fragments of 10 quotations were confirmed by hand (2 fragments of one MDN passage split by a macro with nested quotes, 4 BCD notes confirmed in the BCD JSON, 1 file name confirmed in the npm file list, 1 quote ending inside a markdown link, 1 model-card file name and 2 badge texts that are URL-encoded on the page) |
| of these, passages in licence, terms or pricing items | 174 | 173 confirmed (170 by script, 3 by hand), 1 not a quotation; corrected 0; unverifiable 0 |
| Short quoted strings (under 12 characters: licence names, field values) | 81 | licence-field values checked against the npm registry records, first lines of licence files checked file by file; none wrong |
| "standard MIT / BSD / Apache sentence present" claims | 43 (24 MIT, 4 x 2 BSD, 11 Apache) | 43 confirmed in the named files |
| Attribution of found quotes | 477 | 305 found in a source named in the same list item, 131 in a source named in the same section, 41 flagged by the heuristic; all flagged and section-level cases reviewed by hand: each is in the cited source (the heuristic missed spellings such as "npm `signalsmith-stretch` 1.3.2") |
| npm versions, publish dates, licence fields, unpacked sizes | 57 packages | all match the survey; every listed version is still `latest` on 2026-11-10; no package is marked deprecated |
| WASM and model file sizes from unpkg file lists | 13 | all match |
| "last commit" dates | 47 mentions | all match the HEAD dates re-read from 51 repositories |
| Spec status lines and dates (Web Audio 1.1, WebCodecs, WebGPU, WebNN, rVFC) and page "Last updated" dates | 9 | all match |
| BCD browser-support rows | 20 features | all match; the Firefox WebGPU entry has further notes, now added (section 8) |
| Unique URLs in the survey | 166 | 61 on github.com (web pages answer 403 through this box's proxy; those repositories were read through raw.githubusercontent.com and clones instead). Of the other 104 (example.com left out): 99 answered 200, two of them the alphaTab URLs that serve the home page (already disclosed by the survey); 2 are path templates (the MDN and BCD raw base URLs used with `<path>`); https://docs.opencv.org/5.0.0/opencv.js 404 (inside a README quote; noted in section 49); https://musical-artifacts.com/artifacts/1517 could not be fetched on 2026-11-10 (HTTP 403); https://waveform.prototyping.bbc.co.uk/ failed with a TLS error (a link inside a README quote; no fact rests on it) |

Quotes corrected: 0 (no quoted passage differed from its source). Quotes added by the checker: 142 passages of 12+
characters, counted on the final file. All but 14 were found by `scripts/verify_quotes.py` in the copies named next to
them (the corpus for this run included copies of `trials.md` and `lanes/guitar-tab/survey.md` taken between 22:00 and
22:10 UTC); of those 14, 8 were compared directly with the BCD JSON (4), the npm registry records (2), the model card PDF's
metadata (1) and the e-pianos README (1, where an HTML link sits inside the quoted sentence), and 6 are this log's own
terms in quote marks, not quotations.

Links fixed or supplied: 3. The alphaTab `PlayerOutputMode` reference is
https://alphatab.net/docs/reference/types/playeroutputmode (the survey's `/types/synth/playeroutputmode/` returns the
home page); the alphaTex `\sync` syntax is at https://alphatab.net/docs/alphatex/bar-metadata#sync (the survey's
`/docs/alphatex/sync-points` returns the home page); the README behind "per that README" in section 40 is now named.

Facts corrected or completed (no number in the survey was found wrong):

- UNVERIFIED items settled: the box's Chromium codecs and its lack of a WebGPU adapter (from `trials.md`, runs r0042
  and r0050), the `PlayerOutputMode` values, the alphaTex `\sync` syntax, @tonejs/midi pitch bends, the upstream
  SoundTouch licence, most `smpldsnds` sample licences, the npm account that publishes `bungee-pitch-shift`, and
  `detectForVideo` taking a WebCodecs `VideoFrame` (type declarations, and `trials.md` runs r0314 and r0329).
- Weights and data clauses the survey did not carry: the Demucs weights statement of the maintained fork ("The license
  of the weights is not clear"), MUSDB18-HQ's "educational purposes only" clause, demucs-js's notice that its weights
  are "made available for personal and research use only", the missing licence on `timcsy/demucs-web-onnx`, the
  MediaPipe hand model card (Apache-2.0, out-of-scope uses including hands "holding objects"), MAESTRO's CC BY-NC-SA
  4.0 (a Basic Pitch training set), the FluidR3_GM author's MIT release next to gleitz's CC BY 3.0 statement, the
  WebAudioFont sample sources, and Basic Pitch's npm README sentence that mentions "either license" and "the GPL
  License".
- Run facts and formats: `generateFileData` is not exported by `@spotify/basic-pitch` and returns a Node.js `Buffer`
  (shipped source; `trials.md` met the same); Signalsmith Stretch's README requires `.start()` or
  `schedule({active: true})`, which the survey's field list left out. `trials.md` (as read at about 22:05 UTC) shows
  output formats for Basic Pitch, essentia.js, Mediabunny, MediaPipe, ffmpeg.wasm, demucs-web, smplr,
  soundfont-player, SpessaSynth, js-synthesizer, Tone.js, alphaTab, wavesurfer.js, peaks.js, pitchy, pitchfinder,
  aubiojs, web-audio-beat-detector, realtime-bpm-analyzer, SoundTouchJS, Rubber Band WASM and Signalsmith Stretch
  that agree with the survey's documented formats; each is cross-referenced in its section with run ids. One
  documented behaviour differed from what the trials observed: MDN says `AudioWorkletProcessor.process()` is called
  "once for each block", while the trials saw skipped quanta right after a node was created and one repeated
  `currentFrame` (section 2; both stated there). Where they differ in detail (for example the
  trials' alphaTab page passed `audio.currentTime * 1000` to `updatePosition` while the guide divides by
  `playbackRate`), both are stated with their sources; at playback rate 1 the two are equal.
- Handoff facts: all 20 kept. Facts 1, 2, 3, 4, 5, 10 and 17 were completed so that both halves carry a link, a
  lane-survey entry or a run id (fact 17's receiving half, wavesurfer's `setTime(seconds)`, was unsupported before);
  fact 11's last sentence was reworded (see judging language).
- Judging language: three phrases reworded ("fast path", "frame-accurate", "is the in-browser library"); a scan of
  the text outside quotations and code found no other judging words. Author numbers in the survey name their page.
- Pricing and terms re-read on 2026-11-10: Superpowered pricing and licensing pages (no price; "Superpowered is
  sunsetting"), Bungee page (no Bungee Pro price), Rubber Band licence page (no price), SoundTouch page (no price).

Tools added: 2 with full entries (libav.js, section 53; bakkot's demucs-js, section 50) and 18 one-line entries under
"Not covered" (21 packages or demos).

Still UNVERIFIED after this check (6): a YouTube embed under COEP (section 7), the Rubber Band commercial price
(section 24), who is behind the npm account that publishes `bungee-pitch-shift` (section 25), the licences of two
`smpldsnds` repositories (section 27), the GeneralUser GS and MuseScore FluidR3 terms linked by WebAudioFont (section
31), and the training data of Magenta.js's `onsets_frames_uni` checkpoint (section 41).
