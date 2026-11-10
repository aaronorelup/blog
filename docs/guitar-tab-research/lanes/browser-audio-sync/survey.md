# Lane 8, browser-audio-sync: survey of browser audio, sync, playback and in-browser analysis

Agent: docs-browser-audio-sync. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from live
sources on 2026-11-10 unless a line says otherwise. Raw copies of fetched pages, npm registry records and shallow
clones are kept outside the repo in `/home/user/gtr/lanes/browser-audio-sync/docs-agent/` (not committed). The
script that read the npm registry is `scripts/docs_npm_meta.py` in this folder. This file records facts and
quotes only. It does not run the tools: the trials are in `trials.md` (written by the try-browser-audio-sync agent).

Marks used in the tool list:

- `RUNNABLE`: a JavaScript or WebAssembly library or a web platform API that can be loaded in the box's headless
  Chromium (Playwright) on CPU. Whether it actually ran is recorded in `trials.md`, not here.
- `RUNNABLE?`: loads in a browser, but its documented fast path needs WebGPU or another feature whose availability in
  headless Chromium without a GPU is not established here (UNVERIFIED until a trial shows it).
- `KEY`: needs an account, a licence key or a commercial agreement to use as documented.

Versions and dates in the tool list come from the npm registry (`https://registry.npmjs.org/<package>`, field
`dist-tags.latest` and `time[<latest>]`), read 2026-11-10. "npm license field" is the package's own declaration;
the LICENSE file itself is quoted in each tool's section.

## Tool list

First pass written in the first 15 minutes; each line is re-checked in its own section below, and the section is
what counts. "pending" means the section has not been written yet.

### Web platform APIs (built into browsers, no package)

1. Web Audio API clock: `AudioContext.currentTime` and look-ahead scheduling of `AudioBufferSourceNode.start(when)`
   (W3C Web Audio API). https://webaudio.github.io/web-audio-api/ . RUNNABLE. pending
2. AudioWorklet (`AudioWorkletNode`, `AudioWorkletProcessor`, Web Audio API). RUNNABLE. pending
3. Output latency reporting: `AudioContext.baseLatency`, `outputLatency`, `getOutputTimestamp()`. RUNNABLE. pending
4. `HTMLVideoElement.requestVideoFrameCallback()` (WICG spec). https://wicg.github.io/video-rvfc/ . RUNNABLE. pending
5. `HTMLMediaElement.playbackRate` and `preservesPitch` (HTML Standard). RUNNABLE. pending
6. WebCodecs (`AudioDecoder`, `VideoDecoder`, `VideoFrame`, W3C). https://www.w3.org/TR/webcodecs/ . RUNNABLE. pending
7. Cross-origin isolation (COOP/COEP headers) as the condition for `SharedArrayBuffer` and WASM threads. pending
8. WebGPU and WebNN as model-runtime backends (W3C). RUNNABLE? pending

### Transport, scheduling and timers

9. Tone.js (`Tone.Transport`, `Tone.Player`, `GrainPlayer`, `PitchShift`), Yotam Mann. npm `tone` 15.1.22,
   2025-04-27, npm license field MIT. https://github.com/Tonejs/Tone.js . RUNNABLE. pending
10. @tonejs/midi (MIDI file to JSON and back). 2.0.28, 2022-02-04, MIT. https://github.com/Tonejs/Midi . RUNNABLE. pending
11. worker-timers (setInterval/setTimeout run in a Web Worker), Christoph Guttandin. 8.0.34, 2026-07-21, MIT. RUNNABLE. pending
12. standardized-audio-context (cross-browser AudioContext). 25.3.77, 2024-08-31, MIT. RUNNABLE. pending
13. WAAClock (scheduling events on the Web Audio clock), Sébastien Piquemal. 0.5.5, 2024-02-03, MIT. RUNNABLE. pending
14. @ircam/sc-scheduling (scheduler and transport, IRCAM ISMM). 1.0.0, 2024-07-08, BSD-3-Clause. RUNNABLE. pending

### Tab player with sync

15. alphaTab (CoderLine): player with metronome, count-in, backing track, sync points, Media Sync Editor, YouTube
    sync. npm `@coderline/alphatab` 1.9.0, 2026-10-31, npm license field MPL-2.0. https://alphatab.net . RUNNABLE. pending

### Waveform display and regions

16. wavesurfer.js (waveform, regions, timeline, spectrogram plugins), katspaugh. 8.0.5, 2026-11-02, BSD-3-Clause.
    https://wavesurfer.xyz . RUNNABLE. pending
17. peaks.js (BBC R&D origin; npm repository now codeberg.org/chrisn/peaks.js). 4.0.0, 2025-08-30, LGPL-3.0. RUNNABLE. pending
18. waveform-data.js (BBC) plus the `audiowaveform` C++ CLI that precomputes peaks. waveform-data 4.5.2, 2025-06-07,
    LGPL-3.0. RUNNABLE. pending

### Video decode, demux and sync

19. Mediabunny (read, write and convert media files with WebCodecs), Vanilagy. 1.65.2, 2026-11-04, MPL-2.0.
    https://mediabunny.dev . RUNNABLE. pending
20. mp4box.js (GPAC, MP4 demux for WebCodecs). 2.5.0, 2026-10-25, BSD-3-Clause. RUNNABLE. pending
21. web-demuxer (FFmpeg-based WASM demuxer for WebCodecs), ForeverSc. 4.0.0, 2025-12-20, npm license field empty. RUNNABLE. pending

### Time-stretch and pitch-shift (slow practice)

22. SoundTouchJS (port of SoundTouch), cutterbl: `soundtouchjs` 0.3.0, 2026-02-04, LGPL-2.1;
    `@soundtouchjs/audio-worklet` and `@soundtouchjs/core` 2.1.1, 2026-08-03, npm license field MPL-2.0. RUNNABLE. pending
23. Signalsmith Stretch (C++ library compiled to WASM with an AudioWorklet wrapper), Signalsmith Audio. npm
    `signalsmith-stretch` 1.3.2, 2025-06-27, MIT. RUNNABLE. pending
24. Rubber Band Library in WASM: `rubberband-wasm` (Daninet) 3.3.0, 2024-12-23, npm "GPLv2"; `rubberband-web`
    (delude88) 0.2.1, 2022-10-18, GPL-2.0-or-later; `@echogarden/rubberband-wasm` 0.2.0, 2024-10-26, GPL-2.0-only.
    Rubber Band itself is dual-licensed (GPL or commercial). RUNNABLE. pending
25. Bungee (Parabola Research) WASM build `bungee-pitch-shift` 1.0.8, 2025-10-25, npm license field MIT. RUNNABLE. pending
26. Superpowered Web Audio SDK (WASM, time-stretch, pitch-shift, effects). `@superpoweredsdk/web` 2.8.2,
    2026-09-09, npm license field "SEE LICENSE IN /license". RUNNABLE KEY? pending

### Sample playback and synthesis (reference playback of the tab)

27. smplr (SoundFont and sampled instruments on Web Audio), danigb. 1.2.0, 2026-11-06, MIT. RUNNABLE. pending
28. soundfont-player (predecessor of smplr), danigb. 0.12.0, 2020-01-27, MIT. RUNNABLE. pending
29. SpessaSynth (SoundFont2/DLS synth and MIDI player in TypeScript), spessasus. `spessasynth_lib` 4.4.7 and
    `spessasynth_core` 4.4.9, 2026-11-06, Apache-2.0. RUNNABLE. pending
30. js-synthesizer (FluidSynth compiled to WASM), jet2jet. 1.13.0, 2026-04-20, BSD-3-Clause (FluidSynth: LGPL-2.1). RUNNABLE. pending
31. WebAudioFont, surikov. 3.0.4, 2022-06-28, GPL-3.0-or-later. RUNNABLE. pending
32. MidiPlayerJS (MIDI event player, no synth), grimmdude. 2.0.17, 2026-03-01, MIT. RUNNABLE. pending

### In-browser analysis and model runtimes

33. Basic Pitch for the browser, Spotify: `@spotify/basic-pitch` (TensorFlow.js). 1.0.1, 2022-08-05, Apache-2.0. RUNNABLE. pending
34. essentia.js (Essentia compiled to WASM, plus TF.js models), MTG-UPF. 0.1.3, 2021-06-24, AGPL-3.0. RUNNABLE. pending
35. ONNX Runtime Web, Microsoft. `onnxruntime-web` 1.31.1, 2026-10-26, MIT. RUNNABLE (WASM); WebGPU RUNNABLE?. pending
36. MediaPipe Tasks Vision (Hand Landmarker, Pose, etc. in the browser), Google. `@mediapipe/tasks-vision` 1.2.2,
    2026-11-03, Apache-2.0 (also `@mediapipe/tasks-audio` 1.2.2). RUNNABLE. pending
37. Transformers.js, Hugging Face. `@huggingface/transformers` 4.3.2, 2026-10-27, Apache-2.0 (older
    `@xenova/transformers` 2.17.2, 2024-05-29). RUNNABLE. pending
38. ffmpeg.wasm: `@ffmpeg/ffmpeg` 0.12.15, 2025-01-07, MIT; `@ffmpeg/core` 0.12.10, 2025-01-07, and
    `@ffmpeg/core-mt` 0.12.10, 2025-04-28, npm license field GPL-2.0-or-later. RUNNABLE. pending
39. TensorFlow.js (backends cpu, webgl, wasm, webgpu), Google. `@tensorflow/tfjs` 4.22.0, 2024-10-21, Apache-2.0. RUNNABLE. pending
40. LiteRT.js (LiteRT / TFLite models in the browser), Google AI Edge. `@litertjs/core` 2.6.0, 2026-10-22, Apache-2.0. RUNNABLE?. pending
41. Magenta.js (`@magenta/music`, includes Onsets and Frames piano transcription on TF.js). 1.23.1, 2021-11-01,
    Apache-2.0. RUNNABLE. pending
42. ml5.js (friendly wrapper over TF.js and MediaPipe models). 1.4.0, 2026-08-07, MIT. RUNNABLE. pending
43. Meyda (audio feature extraction). 5.6.3, 2024-04-21, MIT. RUNNABLE. pending
44. pitchy (McLeod pitch method, single pitch). 4.1.0, 2024-01-04, MIT. RUNNABLE. pending
45. pitchfinder (YIN, AMDF, McLeod, dynamic wavelet). 2.3.4, 2025-12-16, npm license field "GNU v3". RUNNABLE. pending
46. aubiojs (aubio compiled to WASM: pitch, onset, tempo). 0.2.1, 2022-11-08, npm license field empty. RUNNABLE. pending
47. web-audio-beat-detector (offline tempo/first-beat estimate). 8.2.39, 2026-08-26, MIT. RUNNABLE. pending
48. realtime-bpm-analyzer (BPM from live or file audio). 5.6.1, 2026-11-03, Apache-2.0. RUNNABLE. pending
49. OpenCV.js builds (`@techstark/opencv-js` 5.0.0-release.1, 2026-06-24, Apache-2.0) for fretboard geometry in
    the browser. RUNNABLE. pending
50. In-browser Demucs builds: `demucs-web` (timcsy, ONNX Runtime Web) 1.0.2, 2025-12-01, MIT; `demucs-wasm`
    (bengfarrell) 0.1.5, 2025-01-29; demucs-rs (nikhilunni, Rust + Burn wgpu to WASM/WebGPU); sevagh's
    demucs.cpp / demucs.onnx (freemusicdemixer.com); Hugging Face ONNX exports (monteslu/htdemucs-web-onnx,
    webnn/stem-separator). RUNNABLE (WASM) / RUNNABLE? (WebGPU). pending
51. Beat This! ONNX export for onnxruntime-web (Hugging Face `musetric/beat-this-onnx`). RUNNABLE?. pending

## Sources used for the web platform sections (1 to 8)

- MDN pages were read from their source files in the `mdn/content` repository, fetched 2026-11-10 from
  `https://raw.githubusercontent.com/mdn/content/main/files/en-us/<path>/index.md` (the rendered page is
  `https://developer.mozilla.org/en-US/docs/<Path>`). MDN macros such as `{{domxref(...)}}` are kept as they
  appear in the source.
- Browser support rows come from MDN's browser-compat-data (BCD), read 2026-11-10 from
  `https://raw.githubusercontent.com/mdn/browser-compat-data/main/<area>/<Name>.json` with
  `scripts/docs_bcd.py`. The number is BCD's `version_added` for the first support statement; "mirror" means BCD
  copies the value from the desktop browser it derives from (Chrome for Edge and Chrome Android, Safari for Safari iOS).
- Web Audio API: the W3C publication read 2026-11-10 is "Web Audio API 1.1, W3C Working Draft, 22 September 2026",
  https://www.w3.org/TR/webaudio-1.1/ (the text says: "This document is intended to become a W3C Recommendation.").

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
  2026-11-10): "Currently, audio data blocks are always 128 frames long—that is, they contain 128 32-bit
  floating-point samples for each of the inputs'" (the sentence continues on the next source line).
- How a program calls it: `await ctx.audioWorklet.addModule('proc.js'); new AudioWorkletNode(ctx, 'name')`; the
  processor's `process(inputs, outputs, parameters)` is called once per render quantum. Messages to and from the main
  thread go through `node.port` (a `MessagePort`). The time-stretch libraries in sections 22 to 26 ship as
  AudioWorklet processors.
- Browser support (BCD `api.BaseAudioContext.audioWorklet`): Chrome 66, Firefox 76, Safari 14.1.
- Licence: web platform API, nothing to accept.

## 3. Output latency: baseLatency, outputLatency, getOutputTimestamp()

- Why it matters here: the time a click is heard is later than its `currentTime` by the output latency, and a
  `<video>` frame or a cursor drawn on screen lives on the `performance.now()` clock. These three members are the
  documented bridge between the two clocks.
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
- How a program calls it: `video.playbackRate = 0.5; video.preservesPitch = true;`. The video and its own audio
  stay together; a separate Web Audio metronome must then be scheduled at the stretched tempo.
- Browser support (BCD): `preservesPitch` Chrome 86, Firefox 101, Safari 17.2 (Safari 4 with the `webkit` prefix);
  `playbackRate` Chrome 3, Firefox 20, Safari 3.1.

## 6. WebCodecs

- What it is: frame-level decode and encode of audio and video. Spec: "WebCodecs, W3C Working Draft, 9 November
  2026", https://www.w3.org/TR/webcodecs/ , read 2026-11-10.
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
- Output: `VideoFrame` (timestamp and duration in microseconds), `AudioData` (samples as planar or interleaved
  floats or ints, `copyTo` into a `Float32Array`).
- Browser support (BCD): `VideoDecoder` Chrome 94, Firefox 130, Safari 16.4; `AudioDecoder` Chrome 94, Firefox 130,
  Safari 26; `VideoFrame` Chrome 94, Firefox 130, Safari 16.4.
- Which codecs the box's Playwright Chromium decodes is a trial question (proprietary codecs such as H.264 and AAC
  depend on the build; UNVERIFIED here, settled by `VideoDecoder.isConfigSupported()` in `trials.md`).

## 7. Cross-origin isolation for SharedArrayBuffer and WASM threads

- Why it matters: multi-threaded WASM builds (ffmpeg.wasm `core-mt`, ONNX Runtime Web with `numThreads > 1`,
  essentia/TF.js WASM SIMD-threads, in-browser Demucs builds) need `SharedArrayBuffer`.
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

- WebGPU: "WebGPU, W3C Candidate Recommendation Draft, 15 September 2026", https://www.w3.org/TR/webgpu/ , read
  2026-11-10. BCD `api.GPU` (read 2026-11-10): Chrome 144 with the note "Supported on ChromeOS, macOS, Windows, and
  Linux (Intel Gen12+ GPUs only)." and an earlier partial entry from Chrome 113 ("Supported on ChromeOS, macOS, and
  Windows."); Firefox 141 partial ("Supports Windows since Firefox 141"); Safari 26; Chrome Android 121.
- WebNN: "Web Neural Network API, W3C Candidate Recommendation Draft, 21 October 2026", https://www.w3.org/TR/webnn/ ,
  read 2026-11-10. BCD `api.ML` (read 2026-11-10): experimental, Chrome 112 behind a flag, not in Firefox or Safari.
  (The MDN page `web/api/webnn_api/index.md` returned HTTP 404 on 2026-11-10.)
- Whether the box's headless Chromium exposes a WebGPU adapter without a GPU is a trial question (UNVERIFIED here).
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
  gesture; `Tone.getTransport()` with `bpm`, `start()`, `stop()`, loop points; `Tone.Loop`, `Tone.Part`,
  `transport.schedule(cb, time)`; `Tone.Player`/`Tone.Players` for samples; `Tone.Sampler` for pitched samples.
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
  to 0 to get the lowest latency."
- Time-stretch inside Tone.js: `GrainPlayer`, shipped source `build/esm/source/buffer/GrainPlayer.js`: "Granular
  Synthesis enables you to adjust pitch and playback rate independently. The grainSize is the amount of time each
  small chunk of audio is played for and the overlap is the amount of crossfading transition time between successive
  grains." `PitchShift` (`build/esm/effect/PitchShift.js`): "PitchShift does near-realtime pitch shifting to the
  incoming signal. The effect is achieved by speeding up or slowing down the delayTime of a DelayNode using a sawtooth wave."
- Input: audio URLs or `AudioBuffer`s; note events with times in seconds, Tone time notation ("4n", "1m", "0:2:0")
  or ticks. Output: Web Audio graph. Constraint hooks for re-runs: `bpm`, time signature, loop start/end, swing.
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
  `value`. The README does not mention pitch bends (searched for "pitchBend" on 2026-11-10); whether the parser exposes
  them is UNVERIFIED here.
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
    was not read: UNVERIFIED.)
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
- Input for sync: a score (Guitar Pro 3-8, MusicXML, Capella, alphaTex) plus either a SoundFont (synth), an embedded
  or loaded audio file (backing track), or an external player that reports its time in milliseconds. Output: audio,
  cursor position events in ticks and milliseconds, metronome events.
- Constraint hooks for re-runs: tempo and speed (`playbackSpeed`), playback range and looping, count-in and metronome
  volume, per-track mute/solo/volume, transposition; sync points can be replaced at runtime (`updateSyncPoints()`).
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
  and audio playback library, perfect for web applications." Official plugins listed in the README include "Regions
  – visual overlays and markers for regions of audio", "Timeline – displays notches and time labels below the
  waveform" and "Spectrogram – visualization of an audio frequency spectrum". Site https://wavesurfer.xyz ; repository
  https://github.com/katspaugh/wavesurfer.js (last commit 2026-11-10).
- Version 8.0.5, published 2026-11-02; unpacked 1,658,106 bytes. React wrapper `@wavesurfer/react` 1.0.14
  (2026-10-30, BSD-3-Clause per npm).
- How a program calls it: `WaveSurfer.create({ container, url })` or with a `media` element; plugins via
  `wavesurfer.registerPlugin(Regions.create())`. Regions give start/end times in seconds for loop selection.
- Limits, README FAQ: "Since wavesurfer decodes audio entirely in the browser using Web Audio, large clips may fail to
  decode due to memory constraints. We recommend using pre-decoded peaks for large files" and "Streaming audio is
  supported only with pre-decoded peaks and duration." and "If you're using a VBR (variable bit rate) audio file, there
  might be a mismatch between the audio and the waveform. This can be fixed by converting your file to CBR (constant
  bit rate)." The README also mentions "a `rendering: 'windowed'` option for very long audio files".
- Licence (`LICENSE` in package): "BSD 3-Clause License", "Copyright (c) 2012-2023, katspaugh and contributors",
  standard BSD redistribution sentence and no-endorsement clause present verbatim.

## 17. peaks.js

- What: README of `peaks.js@4.0.0` (read 2026-11-10): "A client-side JavaScript component to display and interact
  with audio waveforms in the browser". Features listed include "Client-side waveform computation, using the Web
  Audio API, for convenience", "Server-side waveform computation, for efficiency" and "Create point or segment marker
  annotations". Origin: BBC R&D (README links https://waveform.prototyping.bbc.co.uk/). The npm `repository` field
  and README now point to https://codeberg.org/chrisn/peaks.js .
- Version 4.0.0, published 2025-08-30; unpacked 4,376,968 bytes. `package.json` peer dependencies:
  `"konva": ">= 8.3.14 < 10"`, `"waveform-data": ">= 4.5.2 < 5"`.
- How a program calls it: `Peaks.init({ zoomview, overview, mediaElement, dataUri | webAudio }, cb)`; segments and
  points carry `startTime`/`endTime`/`time` in seconds.
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

## 18. waveform-data.js and audiowaveform

- What: README of `waveform-data@4.5.2` (read 2026-11-10): "**waveform-data.js** is a JavaScript library for creating
  zoomable representations of audio waveforms to enable visualisation of audio content." and it lists the family:
  "audiowaveform: C++ program that generates waveform data files from MP3 or WAV format audio." Repository field
  `git://github.com/bbc/waveform-data.js.git`.
- Version 4.5.2, published 2025-06-07; unpacked 279,458 bytes.
- How a program calls it: `WaveformData.create(arrayBuffer)` for `.dat`/JSON from audiowaveform, or
  `WaveformData.createFromAudio({ audio_context, array_buffer, scale }, cb)` in the browser.
- Licence, waveform-data (`LICENSE` in package): "GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007"
  (same section 4 text as peaks.js).
- Licence, audiowaveform (repository file https://raw.githubusercontent.com/bbc/audiowaveform/master/COPYING ,
  read 2026-11-10): "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007". audiowaveform runs as a server-side or
  build-time CLI, not in the browser.

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
  decodable codecs are those the browser's WebCodecs supports.
- Use here: frame-accurate access to a fingerstyle video (timestamps in seconds with microsecond precision) for the
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
- Versions: `soundtouchjs` 0.3.0 (2026-02-04, npm licence LGPL-2.1, older `PitchShifter` API on ScriptProcessor);
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
  - The upstream C++ SoundTouch library's own licence was not read here (UNVERIFIED; its site is
    https://www.surina.net/soundtouch/).

## 23. Signalsmith Stretch

- What: Signalsmith Audio (Geraint Luff). C++ page https://signalsmith-audio.co.uk/code/stretch/ (read 2026-11-10):
  "This is a C++11 header-only class for pitch-shifting and time-stretching". GitHub mirror
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
  - `@echogarden/rubberband-wasm` 0.2.0 (2024-10-26), README: "Rubber Band, an audio time-stretching and
    pitch-shifting library, compiled to WASM." and "Intended for use with [Echogarden](https://github.com/echogarden-project/echogarden)."
- Licence facts (read 2026-11-10):
  - Upstream, https://breakfastquay.com/rubberband/license.html : "When you receive a copy of Rubber Band Library —
    whether by downloading it, pulling it from our repository or official Github mirror, receiving a copy from a
    friend or employee, or by any other means — you're getting it under the terms of the GNU General Public License
    (version 2 or later)." and "That is, your application must also be Free Software and you must provide source code
    for it." and "For commercial software development, we provide simple and flexible licences which allow you to take
    the Rubber Band Library code, modify it if desired, and redistribute it in proprietary products." and "No expiry
    date, no royalties." (Commercial licence price not read: UNVERIFIED.) Repository file `COPYING`: "GNU GENERAL PUBLIC
    LICENSE Version 2, June 1991".
  - `rubberband-wasm@3.3.0` README: "Rubber Band Library is open source software under the GNU General Public License.
    If you want to distribute it in a proprietary commercial application, you need to buy a licence." Its `LICENSE`
    file: "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"; npm licence field "GPLv2".
  - `rubberband-web@0.2.1` `LICENSE`: GPL version 2 text; npm field "GPL-2.0-or-later".
  - `@echogarden/rubberband-wasm@0.2.0` `COPYING`: GPL version 2 text; npm field "GPL-2.0-only".

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
  Who publishes this package is not stated in it (UNVERIFIED).

## 26. Superpowered Web Audio JavaScript & WebAssembly SDK

- What: npm `@superpoweredsdk/web` 2.8.2 (2026-09-09), unpacked 27,150,288 bytes, npm licence field "SEE LICENSE IN
  /license"; repository https://github.com/superpoweredSDK/web-audio-javascript-webassembly-SDK-interactive-audio
  (last commit 2026-09-09), whose `license/` folder holds one file, "SUPERPOWERED SDKS MASTER LICENSE AGREEMENT - Oct
  16 2019.pdf" (not opened here).
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
- How a program calls it: `const g = Soundfont(ctx, { instrument: "acoustic_guitar_nylon", kit: "FluidR3_GM" });
  g.start({ note: 60, velocity: 80, time, duration })`; also `Soundfont2` (reads .sf2 through the `soundfont2`
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
  2021-12-17, read 2026-11-10): for "Fluid Soundfont" "Generated from [FluidR3_GM.sf2](...)" and "Released under
  [Creative Commons Attribution 3.0 license](https://creativecommons.org/licenses/by/3.0/us/)"; for "Musyng Kite
  Soundfont" "Released under [Creative Commons Attribution Share-Alike 3.0 license](https://creativecommons.org/licenses/by-sa/3.0/)";
  for "FatBoy Soundfont" "Released under [Creative Commons Attribution Share-Alike 3.0 license]". The repository's
  `LICENSE.txt` is an MIT text, "Copyright (C) 2012 Benjamin Gleitzman", covering the repository. The licences of the
  `smpldsnds` sample repositories (used by `SplendidGrandPiano`, `DrumMachine`) were not read (UNVERIFIED).

## 28. soundfont-player

- What: README of `soundfont-player@0.12.0` (read 2026-11-10): "A soundfont loader/player to play MIDI sounds using
  WebAudio API." It loads the same gleitz pre-rendered sound fonts. Repository https://github.com/danigb/soundfont-player
  (last commit 2023-05-16); smplr's README calls smplr "a modern replacement of" it.
- Version 0.12.0, published 2020-01-27; unpacked 102,577 bytes.
- Licence (`LICENSE`): "The MIT License", "Copyright (c) 2015 Daniel Gómez Blasco", standard MIT grant present.
  Sample licences as in section 27.

## 29. SpessaSynth (spessasynth_lib, spessasynth_core)

- What: README of `spessasynth_lib@4.4.7` (read 2026-11-10): "A powerful multipurpose SF2/DLS/MIDI
  TypeScript/JavaScript library for the browsers, based on spessasynth_core." and "This is a WebAudioAPI wrapper for
  the [spessasynth_core](https://github.com/spessasus/spessasynth_core) library." Features listed: "Play MIDI files
  using SF2/SF3/DLS files!" and "Featuring full Yamaha XG effects". `spessasynth_core` is the same engine without Web
  Audio ("Looking for a bare JS version that works without WebAudioAPI? Try spessasynth_core"). Docs
  https://spessasus.github.io/spessasynth_lib ; repositories https://github.com/spessasus/spessasynth_lib (last commit
  2026-11-07) and https://github.com/spessasus/spessasynth_core (last commit 2026-11-09).
- Versions: `spessasynth_lib` 4.4.7 and `spessasynth_core` 4.4.9, both published 2026-11-06; unpacked 4,769,806 and
  5,021,263 bytes.
- Input: SF2/SF3/DLS SoundFont plus MIDI (also MOD/XM/S3M). Output: audio through Web Audio (lib) or rendered sample
  arrays (core). No SoundFont is required by the licence of the code; which SoundFont is shipped decides the sample
  licence (for example FluidR3_GM, section 27, or alphaTab's Sonivox SoundFont, section 15).
- Licence (`LICENSE` in both packages): Apache License 2.0 text; standard Apache-2.0 grant present verbatim.

## 30. js-synthesizer (FluidSynth in WASM)

- What: README of `js-synthesizer@1.13.0` (read 2026-11-10): "js-synthesizer is a library that generates audio data
  (frames). [WebAssembly (wasm) version of FluidSynth](https://github.com/jet2jet/fluidsynth-emscripten) is used as a
  core synthesizer engine." It can run in an AudioWorklet (`context.audioWorklet.addModule('libfluidsynth-2.4.6.js')`)
  or a Web Worker ("Executing on a Web Worker prevents from blocking main thread while rendering."). Maker jet2jet.
  Repository https://github.com/jet2jet/js-synthesizer (last commit 2026-05-12).
- Version 1.13.0, published 2026-04-20; unpacked 6,932,424 bytes. Ships `externals/libfluidsynth-2.4.6.js` (FluidSynth
  2.4.6 compiled to WASM) and a variant with libsndfile for SF3.
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

## 32. MidiPlayerJS

- What: README of `midi-player-js@2.0.17` (read 2026-11-10): "MidiPlayerJS is a JavaScript library which reads
  standard MIDI files and emits JSON events in real time. This player does not generate any audio, but by attaching a
  handler to the event emitter you can trigger any code you like which could play audio". Repository
  https://github.com/grimmdude/MidiPlayerJS (last commit 2026-03-22).
- Version 2.0.17, published 2026-03-01; unpacked 191,607 bytes.
- Note: it fires events from JavaScript timers, not on the Web Audio clock (the README's own description: "emits JSON
  events in real time"); the precision implications are those described in section 1.
- Licence (`LICENSE`): "MIT License", "Copyright (c) 2018 Garrett Grimm", standard MIT grant present.
