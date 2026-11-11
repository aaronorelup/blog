<!-- RUNDOWN -->
- **My agents tried 34 of the 100 entries on their list for the click track, sync and playback, in Chrome on a cloud box with no sound card.** With the page kept busy, an AudioWorklet (code that writes the click inside the audio stream) put 0 of 122 clicks off the beat and a look-ahead loop (a timer that books clicks ahead) put 11 off, 8 in a second run. A plain repeating timer, setInterval, put clicks up to 91 ms off a beat counted from its own first click, and the Tone.js music library put 7 off, 11 in a second run.

<!-- SECTION -->
## Metronome and sync in the browser

This is the part of the app that keeps time, so the metronome's click, the song or video and the cursor on the tab all agree on where the beat is. My agents' list for it has 100 entries. They tried 34 in headless Chrome, a copy of Chrome with no window, on a cloud box with no sound card and no graphics card. The clips were four I synthesized with known answers, two real recordings and three real guitar videos.

My agents timed 122 clicks at 120 BPM (beats per minute) while the page's own code stayed busy 100 ms at a time. An AudioWorklet, code that writes the click inside the audio stream, put 0 of them off the beat grid, the times the clicks should land on. A look-ahead loop, a timer that books each click on the audio clock up to 100 ms ahead, put 11 off, the largest 42 ms late. The plain repeating timer, setInterval, has no booked times, so my agents measured its clicks against a grid started at its own first click. They were up to 91 ms off it. Tone.js, a music library, put 7 off, the largest 2.3 ms late. An agent that checked the runs did the busy look-ahead and Tone.js tests again. It got 8 off for the look-ahead loop, the largest 62 ms, and 11 off for Tone.js, the largest 10 ms.

S4 is a four-instrument band mix I synthesized, with 68 known beats. With the song on the browser's audio clock, the clicks booked on those beats landed 0 to 0.023 ms after them. With the song in an audio element, the browser's built-in player, they landed 0 to 2.8 ms after. All of it was measured inside the browser, since nothing was played out loud.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/browser-audio-sync-metronome-idle.webp" alt="Four rows of blue dots across 60 seconds, labelled AudioWorklet, look-ahead loop, setInterval and Tone.js. In three rows every dot sits on the zero line. In the setInterval row the dots sit just above the line and five stand higher, the highest labelled 42.630 ms."><figcaption><b>Metronome, page idle</b><span class="ao-meta">122 clicks at 120 BPM, timed four ways in headless Chrome, no clip. Each dot is one click's distance from the beat grid. For setInterval the grid starts at its own first click (r0199).</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/browser-audio-sync-metronome-busy.webp" alt="The same four rows with the page busy. The AudioWorklet dots all sit on the zero line. The look-ahead row has two dots just under the 50 ms line, one near 11 ms and the rest on or just above the zero line. The setInterval dots are scattered above and below the line, up to the labelled 91.202 ms. The Tone.js dots sit on the line with a few barely above it."><figcaption><b>Metronome, page busy</b><span class="ao-meta">The same test with the page's own code kept busy 100 ms at a time. Tone.js is shown after correcting a 2.902 ms slip in my agents' recorder (r0199).</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Everything here ran in headless Chrome 153 on the cloud box. The exact build was Google Chrome for Testing 153.0.8010.12, driven from a script by Playwright 1.63.0. The box has no sound card and no graphics card, so WebGL, the way a page draws with the graphics card, ran in software. My agents' recorder caught the sound inside the page, so every time below is a position in the browser's audio stream, not the moment a speaker would play it. The browser probe is a page that checks what the browser supports. Only its two runs (r0042, r0050) and two short click tests (r0095, r0103) ran pinned to 2 of the box's 4 cores. Every other run is marked shared, which means it wasn't pinned and ran next to my other agents' jobs, so its times are what that busy box gave right then. The run ledger's peak memory leaves out some of Chrome's processes, so none is given here. Nothing cost money beyond the cloud session.

The clips, all from the shared test set:

- S1, a single-note melody I synthesized, the Ode to Joy theme on nylon guitar at 144 BPM with 62 known notes.
- S2n, a 29-second two-voice fingerstyle clip I synthesized so every note is known, 90 notes at 112 BPM, with its tab as a Guitar Pro file, `S2n.gp5`.
- S3, strummed chords I synthesized at 96 BPM in G major, with 32 known beats.
- S4, a four-instrument band mix I synthesized with its true stems (each instrument's own track), 116 BPM in D major, with 68 known beats. S4_10s is a 10-second cut of it from the first beat after the count-in.
- R1b, a real 29-second guitar solo from GuitarSet, a public set of guitar recordings with every note annotated, 70 notes.
- R2, a real band song with singing, a 36-second excerpt with no known answer. R2full is the whole song, 228.5 seconds.
- R3a, 18 seconds of a real classical-guitar concert video with camera cuts, as `R3a.mp4` (H.264) and `R3a.webm` (VP9).
- R3b and R3c, 18 seconds each of two real classical-guitar videos at 1920x1080 with the whole fretboard in frame.

**alphaTab 1.9.0** ([link](https://alphatab.net)). A library that reads tabs and sheet music, draws them and plays them with its own synthesizer. This section covers only its timing features. *Showing, editing and playing a tab in the browser* covers the rest.

- In: `S2n.gp5`, which alphaTab read as tempo 112, one track named Guitar and 13 bars of 4/4, one silent count-in bar and 12 bars of music. It read the strings as `[64, 59, 55, 50, 45, 40]`, the note numbers of standard tuning with the high string first, and the capo as 0. A capo is a clamp across the strings that raises every note, and 0 means none. For the modes where alphaTab follows a recording, the input was `S2n.wav`. It played in an `<audio>` element, or its 5,178,644 bytes were loaded as a backing track.
- Command or settings: the click alone through `api.exportAudio(options)` with `sampleRate` 44100, `metronomeVolume` 1, `useSyncPoints` `false` and `trackVolume` `{0: 0}`. The count-in while playing, with `countInVolume` 1, `metronomeVolume` 1 and the guitar muted with `changeTrackMute`. Following an `<audio>` element with `PlayerMode.EnabledExternalMedia`, the page calling `api.player.output.updatePosition(audio.currentTime * 1000)` on every animation frame. The checking agent set a backing track in code with `score.backingTrack = new model.BackingTrack()` and `rawAudioFile` set to the WAV. It added 13 sync points through `score.applyFlatSyncPoints()` and played with `PlayerMode.EnabledBackingTrack`. A sync point ties a bar to a time in the recording. These were one per bar, 2142.857 ms apart, shifted by 0 or 1000 ms.
- Out:
  - The export is a 27.858-second WAV with 52 clicks, 13 bars of 4. Each click came 0 to 1.429 ms before its beat, 0.711 ms before on average, and the clicks were 535.51 or 536.96 ms apart, whole multiples of 64 samples. A comment in alphaTab's own code says `the synthesizer internally uses a fixed block size of 64 samples for synthesizing audio`. A repeat had the same first 10 click times and the same statistics (r0329), and the checking agent's rerun wrote byte-identical files (r0451).
  - The count-in while playing (r0269): 15 clicks in the 8 seconds after `play()`, the first 8.7 ms after it, with 11 of the 14 gaps 535.51 ms and the others 552.93, 536.96 and 550.02 ms. alphaTab plays through its own AudioContext, a separate audio engine in the page, and connects its output only after the first `play()`. Two earlier tries recorded nothing (r0257) and silence (r0266), which isn't verified because their files were overwritten. The checking agent's rerun had 15 clicks, the first 11.6 ms after `play()` (r0441).
  - Following the `<audio>` element (r0261): alphaTab called the page with `seekTo(0.558 ms)` then `play()` on `api.play()`, `seekTo(20000)` when the page set `api.timePosition = 20000`, and `seekTo(20892.857)` and `pause()` on `api.pause()`. In this mode alphaTab reports the media time the page passes in as its own position, and it did so in 504 of 504 position events checked. The rerun checked 562 of 562 (r0441).
  - The backing track (r0453): `exportFlatSyncPoints()` returned the 13 points, and the player was an `AudioElementBackingTrackSynthOutput` playing a `blob:` URL. In the 131 position events checked at each offset, alphaTab's time minus the element's was 0 ms with no offset and -1000 ms with the 1000 ms offset. When it reaches a speaker wasn't measured. alphaTab's guide says `At this point alphaTab cannot mix the synthesized audio and a backing track together, therefore only either audio will be heard.`
- Time: shared. Loading the file took 616 ms. Exporting the click took 103 ms and the guitar 85 ms (r0195). In the repeat those were 377, 196 and 76 ms (r0329). With the backing track, `playerReady` fired after 243 ms and 141 ms (r0453). The playing modes run in real time.
- Takes as a hint: `playbackSpeed`, `countInVolume`, `metronomeVolume`, per-track mute, volume and transposition, a playback range and loop, and sync points (`applyFlatSyncPoints`, `updateSyncPoints()`). Tempo, tuning and capo come from the Guitar Pro file.
- Hands off to: position events in milliseconds, which a waveform view takes as `setTime(ms / 1000)`. Not tried here. MIDI, a list of notes with start times, isn't among its documented inputs. So notes from a transcriber, a tool that turns audio into notes, have to become Guitar Pro, MusicXML, Capella or alphaTex first.

**aubiojs 0.2.1** ([link](https://github.com/qiuxiang/aubiojs)). The aubio library, which finds pitch and beats, compiled to WebAssembly (code built to run inside a browser).

- In: S1 and R1b for pitch, S3, S4 and R2 for tempo, decoded at 44.1 kHz.
- Command or settings: `new Pitch('yinfft', 2048, 441, 44100)` fed 441-sample hops, and `new Tempo(1024, 512, 44100)` fed 512-sample hops, then `getBpm()`. esbuild, a tool that packs a library into one file for a page, could bundle its browser build only with `path`, `fs` and `crypto` marked external.
- Out: a frequency in Hz per hop (0 for none), a non-zero value at each beat, and a BPM. Pitch is counted in 10 ms frames. A cent is a hundredth of a semitone, and a semitone is one fret. On S1 its frequency was within 50 cents of the known note in 2,485 of the 2,624 frames where a note sounds, and it gave a pitch in 60 of the 360 frames where none does (e1226). On R1b that was 1,586 of 1,823, and 755 of 1,111 (e1227). Tempo was 97.33 BPM for S3, a 96 BPM clip, with 40 beats returned and 32 of the 32 known beats within 70 ms of one, a median 19.4 ms late (e1230, e1231). For S4, a 116 BPM clip, 117.79 BPM, with 71 beats and 66 of 68 within 70 ms, a median 8.2 ms late (e1233, e1234). For R2, with no known answer, 147.80 BPM and 84 beats.
- Time: shared (r0329). Pitch took 516 ms for S1 and 498 ms for R1b inside the page, tempo 334 to 469 ms per clip.
- Takes as a hint: none, only the method and window sizes.
- Hands off to: nothing here.

**AudioWorklet, Web Audio API 1.1 in Chrome 153** ([link](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)). A browser feature that runs a page's own code on the audio thread, one block of 128 samples at a time.

- In: no clip. A click, a 10 ms 2 kHz tone that fades out, at 120 BPM for 122 clicks (61 s).
- Command or settings: a processor that writes the click samples itself at frame positions it counts from `currentFrame`. Run once with the page idle and once busy, with the page's own code kept busy 100 ms at a time for the whole run.
- Out: a mono 32-bit float recording of the clicks. 0 of 122 clicks were off the beat grid, idle and busy (r0199). In the 15-second runs of my measuring page, 0 ms off too (r0271). Right after a worklet node was created, Chrome skipped its `process()` call for a few blocks and `currentFrame` jumped by 384 to 1408 frames, which my agents found while building their recorder. MDN, Mozilla's web documentation, says the method is called `once for each block`.
- Time: real time, 61 s a run, shared (r0199, 548.5 s for all 8 metronome runs).
- Takes as a hint: none. Tempo and click pattern are whatever the code computes.
- Hands off to: nothing here. The clicks are audio in the page's audio graph, the chain of sound sources and processors the page wires up.

**Basic Pitch for the browser, `@spotify/basic-pitch` 1.0.1** ([link](https://github.com/spotify/basic-pitch-ts)). Spotify's note transcription model (audio in, a list of notes out) in TypeScript, running its model in TensorFlow.js inside the page.

- In: S1 and S2n as WAV, decoded by the browser and resampled to 22,050 Hz mono, since the package throws an error otherwise.
- Command or settings: `evaluateModel` on TensorFlow.js 3.21.0 with three of its backends, the engines it runs a model on: `webgl` (in software here), `cpu` and `wasm`. Then `outputToNotesPoly`, `addPitchBendsToNoteEvents` and `noteFramesToTime` with two settings. One is the Python package's defaults, onset 0.5, frame 0.3 and at least 11 frames. The other is the example in the README of the npm package, 0.25, 0.25 and 5. npm is the public registry of JavaScript packages.
- Out: note events with `startTimeSeconds`, `durationSeconds`, `pitchMidi`, `amplitude` and `pitchBends`, written as CSV. A note counts as found when it starts within 50 ms of a known note with a pitch within 50 cents.
  - S1 with the defaults: 64 notes, 61 of the 62 real notes among them and 3 that matched no known note (e0669). With the README settings, 115 notes, 60 of 62 and 55 extra (e0671).
  - S2n with the defaults: 136 notes, 90 of the 90 real notes among them, 42 of 42 melody and 48 of 48 bass, and 46 extra (e0840). With the README settings, 267 notes, 90 of 90 and 177 extra (e0844).
  - Found notes started a median 10.4 ms after the known ones on S1 and 8.1 ms on S2n.
  - The `wasm` backend failed on both clips with `Error: Unknown dtype undefined`. `webgl` and `cpu` gave the same notes.
  - The package's MIDI writer, `generateFileData`, isn't exported from its entry (esbuild said `No matching export`).
  - The first rows on S1, where the known first notes are 66, 66 and 67 at 1.667, 2.083 and 2.500 s:

```text
start_time_s,end_time_s,pitch_midi,amplitude
1.683447,2.091080,66,0.7792
2.091080,2.509039,66,0.7456
2.509039,2.950218,67,0.7066
```

- Time: shared, on a heavily loaded box (r0270). Inference, the model's run over the clip, took 160.6 s on `webgl` and 103.1 s on `cpu` for S1, and 157.7 s on `webgl` for S2n, after a model load of 34 to 62 ms. The checking agent's rerun on `cpu` took 72.3 s (r0451).
- Takes as a hint: `onsetThresh`, `frameThresh`, `minNoteLen`, and a note range through `minFreq` and `maxFreq`. A tuning, capo or string count isn't an input.
- Hands off to: nothing here. A MIDI file or note list is what the tools in *Choosing the string and fret* take. MIDI isn't among alphaTab's documented inputs.

**Basic Pitch ONNX model, `nmp.onnx`, in ONNX Runtime Web 1.31.1** ([link](https://github.com/spotify/basic-pitch)). The same Basic Pitch model exported to ONNX, a file format for AI models, from Spotify's Python repository. It ran on WebAssembly with the npm package's note step.

- In: S1 and S2n at 22,050 Hz mono, in windows of 43,844 samples cut the way the TypeScript package cuts them. The model file is 230,444 bytes.
- Command or settings: `onnxruntime-web` 1.31.1 (`ort.wasm.min.mjs`) on the wasm execution provider, ONNX Runtime Web's WebAssembly engine. It ran with `numThreads` 1 or 2, with and without cross-origin isolation (`?coi=0`), and the same two note settings.
- Out: note lists identical to TensorFlow.js in start, end and pitch on both clips with both settings, amplitudes differing in the fourth decimal in 4 cells. S1 with the defaults: 64 notes, 61 of 62 (e0808). S2n: 136 notes, 90 of 90 (e0828).
- Time: shared (r0270). For S1 with 1 thread, loading the model took 1.93 s and inference 7.86 s. With 2 threads it was 1.84 s and 9.92 s. With 2 threads asked and no isolation it was 2.08 s and 6.31 s. For S2n it was 3.11 s and 8.36 s with 1 thread, and 1.22 s and 6.53 s with 2. The checking agent's rerun with 1 thread on S1: 1.23 s and 4.40 s (r0451).
- Takes as a hint: the same as the TensorFlow.js version.
- Hands off to: the same as the TensorFlow.js version.

**`browser-timing-check.html`, my agents' measuring page** ([link](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/browser-audio-sync)). One HTML file my agents wrote for me to open in my own Chrome. It repeats the metronome test, runs Basic Pitch on a melody it makes itself, and prints JSON to paste back.

- In: no clip. It synthesizes the 62 notes of S1 itself, each a tone plus 4 harmonics at 22,050 Hz.
- Command or settings: its buttons `Run metronome test` (15 or 61 s per run), `Run model test` and `Run ONNX test`, clicked by `scripts/test_foraaron.mjs` in headless Chrome. The files it loads came from a local copy: 23 from jsDelivr, a public site that serves code libraries, for the first two parts (r0271), and 21 from jsDelivr and raw.githubusercontent.com for the ONNX part (r0313).
- Out: JSON. In the metronome part (15 s, 30 clicks a run), with the page idle, AudioWorklet and the look-ahead loop were 0 ms off, setInterval up to 9.57 ms and Tone.js 0 ms. With the page busy, AudioWorklet was 0 ms off and the look-ahead loop had 3 late clicks, the largest 9.52 ms. With setInterval the mean was 40.68 ms and the largest 102.63 ms, and Tone.js had 3 late, the largest 29.84 ms (r0271). Basic Pitch on `webgl` found 62 notes, 62 of 62 matched by the page's own check (start within 50 ms, same pitch). The ONNX part matched 62 of 62 and skipped WebGPU, the newer way a page runs work on the graphics card, with `navigator.gpu.requestAdapter() gave no adapter` (r0313). Its first try failed because a file wasn't in the local copy yet, per my agents, and that isn't verified (r0310).
- Time: shared, 272.2 s for both parts (r0271), with Basic Pitch inference 139.4 s on `webgl`. The ONNX part took 3.70 s to start and 6.08 s to run (r0313).
- Takes as a hint: its run length, an `audible` checkbox and an `also run the CPU backend (slower)` checkbox.
- Hands off to: me. Its steps are item 1 of `for-aaron.md`. It wasn't tested over the real jsDelivr site or from a `file://` address.

**Cross-origin isolation** ([link](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated)). Two HTTP headers a page needs before the browser lets WebAssembly use several threads.

- In: my agents' local server sent `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, or neither for `?coi=0`.
- Command or settings: `scripts/serve.mjs`.
- Out: `crossOriginIsolated` was `true` and SharedArrayBuffer, memory that several threads can share, was present (r0042). With isolation, ONNX Runtime Web kept the 1 or 2 threads asked for. Without it, ONNX Runtime Web set the thread count to 1 after creating the session (r0270). ffmpeg.wasm's multi-thread core ran in an isolated page (r0314).
- Time: none of its own.
- Takes as a hint: none.
- Hands off to: every file a page loads from another site has to allow it, or the page sends the `Cross-Origin-Embedder-Policy` header as `credentialless` instead. Whether a YouTube embed works under it isn't verified.

**demucs-web 1.0.2** ([link](https://github.com/timcsy/demucs-web)). Meta's HTDemucs model, which splits a mix into stems (one track per instrument), as an ONNX file run by ONNX Runtime Web in the page.

- In: S4_10s, stereo at 44.1 kHz. The model, `htdemucs_embedded.onnx`, is 180,534,758 bytes.
- Command or settings: `separate(left, right)` with `executionProviders: ['wasm']`, since the box has no WebGPU, and `ort.env.wasm.numThreads` 2 or 4 in a cross-origin isolated page.
- Out: four stereo stems, `drums`, `bass`, `other` and `vocals`, 441,000 samples each. My agents paired its `other` stem with S4's guitar and its `vocals` stem with the lead line, a synthesizer sound named Voice Oohs standing in for a singer. SI-SDR is in dB on a scale where a higher number means the stem is closer to the true one. Against S4's true stems it was 8.92 dB for drums, 6.25 for bass, 5.25 for guitar and 6.40 for the lead. Their SIR was 22.28, 21.03, 8.73 and 13.57 dB, on a scale where a higher number means less of the other instruments leaked in (e1223).
- Time: shared (r0329). With 2 threads the model loaded in 3.23 s and separation took 55.6 s for the 10 s clip. With 4 threads, 3.93 s and 117.1 s, on a box shared with my other agents' jobs. That the two runs' stems were identical was stated by the agent that ran the trials and isn't verified.
- Takes as a hint: none for the music. Segment length and overlap are fixed in its code.
- Hands off to: nothing here. Basic Pitch takes a stem only after it's mixed to mono and resampled to 22,050 Hz. This 4-stem model has no guitar stem of its own.

**essentia.js 0.1.3** ([link](https://mtg.github.io/essentia.js/)). The Essentia audio analysis library from MTG-UPF in Barcelona, compiled to WebAssembly, for beats, tempo, key, chords and melody.

- In: S3, S4 and S1, mixed to mono at 44.1 kHz.
- Command or settings: `RhythmExtractor2013(signal, 208, 'multifeature', 40)`, `KeyExtractor(signal)`, `TonalExtractor(signal, 4096, 2048, 440)` and `PitchMelodia(signal)`.
- Out: beat times, a BPM, a key, a chord label per frame (written as a `.lab` file) and a pitch track.
  - Beats: for S3, 37 beats with 30 of the 32 known beats within 70 ms of one, a median 38.7 ms late (e0906). For S4, 74 beats and 67 of 68, a median 28.5 ms late (e0920). For S1, 70 beats and 64 of 64, a median 7.8 ms late (e0936).
  - Tempo: 95.61 BPM for S3, a 96 BPM clip, 115.61 for S4 at 116 and 143.87 for S1 at 144 (e0910, e0923, e0933).
  - Key: G major for S3 and D major for S4 and S1, the known keys (e0913, e0926, e0931). TonalExtractor's own key field said C major for S3.
  - Chords: the same root note as the known chord for 18.8 of S3's 24 seconds (e0916) and 28.8 of S4's 38.7 seconds (e0929). The root is the note a chord is named after.
  - PitchMelodia on S1: within 50 cents of the known note in 2,312 of the 2,624 frames where a note sounds, and a pitch in 24 of the 360 frames where none does (e0938). These counts place each of its frames at the frame's start time. Whether a frame belongs there or half a frame later wasn't checked.
  - The first chord lines for S3, start, end and label:

```text
0.000000	1.578957	Am
1.578957	4.922630	G
4.922630	7.941224	Em
```

- Time: shared (r0314). S3 took 2.90 s in all: 197 ms to start the WebAssembly, 2.15 s for the rhythm step, 69 ms for the key and 148 ms for the chords. S4 took 4.44 s. S1 took 10.62 s, 6.87 s of it for PitchMelodia. The checking agent's rerun: S3 1.92 s and S1 6.21 s, with byte-identical output files (r0451).
- Takes as a hint: `minTempo`, `maxTempo` and `method` for the rhythm step, `tuningFrequency` for the chord and key steps, where a known tuning offset goes in as a reference frequency, and `profileType`, `minFrequency` and `maxFrequency` for the key. No capo or string inputs.
- Hands off to: nothing here. Its beat times are seconds, the kind of list the S4 sync test booked clicks from.

**ffmpeg.wasm 0.12.15** ([link](https://github.com/ffmpegwasm/ffmpeg.wasm)). FFmpeg, a command-line program that converts audio and video, compiled to WebAssembly, with FFmpeg 5.1.4 inside.

- In: `R3a.mp4` (AAC audio, 2,368,626 bytes) and `R3a.webm` (Opus audio).
- Command or settings: `-hide_banner -i in -vn -map 0:a:0 -c:a pcm_s16le out.wav`, with the single-thread core `@ffmpeg/core` 0.12.10 and the multi-thread core `@ffmpeg/core-mt` 0.12.10.
- Out: 16-bit WAV. From the MP4, 3,178,792 bytes at 44.1 kHz stereo, 794,624 frames. From the WebM, 3,456,208 bytes at 48 kHz stereo, 863,978 frames. Against native ffmpeg 6.1.1 with the same arguments, the frame counts were the same and no sample differed by more than 1, the smallest step a 16-bit file can hold. The share of samples that were identical was 99.990 % for the MP4 and 99.989 % for the WebM. The single-thread and multi-thread outputs were identical.
- Time: shared (r0314). MP4 on one thread, 357 ms to load and 494 ms to run. WebM, 427 ms and 426 ms. MP4 on the multi-thread core, 1,396 ms and 373 ms. The checking agent's rerun of the single-thread MP4 took 516 ms and wrote a byte-identical file (r0451).
- Takes as a hint: none, it converts files.
- Hands off to: nothing here. With `-ac 1 -ar 22050` it writes the mono 22,050 Hz audio Basic Pitch needs. Not tried.

**js-synthesizer 1.13.0** ([link](https://github.com/jet2jet/js-synthesizer)). FluidSynth, a synthesizer that plays notes with a sound bank of recorded instrument samples, compiled to WebAssembly and run in an AudioWorklet.

- In: `S2n.mid`, S2n's 90 known notes as a MIDI file, and `FluidR3_GM.sf2`, the 148,398,306-byte sound bank that made the test clips.
- Command or settings: `AudioWorkletNodeSynthesizer` with `libfluidsynth-2.4.6.js`, then `loadSFont`, `addSMFDataToPlayer(S2n.mid)` and `playPlayer()`.
- Out: audio inside the page's graph, recorded as a 2-channel float WAV. A note-start detector from librosa, a Python audio library, found 46 starts in it, 46 of the 48 known ones among them, with notes that start together counted once (e0428). The same detector finds 46 of 48 on the original clip (e0429). Its own MIDI player set the start, so the timing was lined up afterwards. Against the original FluidSynth 2.3.4 render of S2n, its recording had a normalized cross-correlation peak of 0.99908, on a scale where 1 means the same waveform.
- Time: real time, shared (r0225). It loaded in 2.18 s, and 1.26 s in the checking agent's rerun (r0441).
- Takes as a hint: none. A tab's string, fret, tuning and capo reach it only as the MIDI pitch.
- Hands off to: it takes a Standard MIDI File or MIDI events.

**Mediabunny 1.65.2** ([link](https://mediabunny.dev)). A library that reads and writes media files and decodes them with the browser's WebCodecs.

- In: `R3a.webm` (VP9, 539 frames) and `R3a.mp4` (H.264, 540 frames).
- Command or settings: `Input` with `UrlSource` and `ALL_FORMATS`, `VideoSampleSink.samples()` for every frame and `getSample(t)` for 12 times.
- Out: `VideoSample` objects with a timestamp and duration in seconds, in `I420`. All 539 and all 540 decoded frames had a brightness plane bit-identical to ffmpeg 6.1.1's decode of the same frame. Asked for 12 frames by their start times, `getSample` returned that frame in 12 of 12 for the MP4, and for the WebM the frame with the last time at or before the target in 12 of 12. At the same 12 MP4 times the `<video>` element showed the frame before in 10.
- Time: shared (r0314). Decoding every frame took 712.8 ms for the WebM (1.32 ms a frame) and 1,078.7 ms for the MP4 (2.00 ms a frame). `getSample` took 7 to 337 ms a call. The checking agent's rerun decoded the MP4 in 809 ms (r0451).
- Takes as a hint: none. It decodes whatever the browser's WebCodecs decodes.
- Hands off to: each frame went to MediaPipe as a `VideoFrame` with `Math.round(timestamp * 1000)` (r0314, r0329).

**MediaPipe Tasks Vision 1.2.2, HandLandmarker** ([link](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js)). Google's hand tracker for web pages. It finds 21 points on each hand in a video frame.

- In: R3a, R3b and R3c decoded by Mediabunny, and the model `hand_landmarker.task` (float16, 7,819,105 bytes).
- Command or settings: `HandLandmarker.createFromOptions` with `runningMode` `"VIDEO"`, `numHands` 2 and `delegate`, the processor it runs on, set to `"CPU"` or `"GPU"`. Then `detectForVideo(frame, timestampMs)` for each frame.
- Out: for each frame, `landmarks` (21 points per hand, x and y as fractions of the picture, z as relative depth), `worldLandmarks` and `handedness`.
  - R3a on the CPU, all 539 frames: no hand in 1, one hand in 420 and two in 118. Alone, the hand was labelled `Left` in all 420. Pairs were labelled `Left` and `Left` in 62 and `Left` and `Right` in 56.
  - R3a on the `"GPU"` delegate, which ran on WebGL in software here, the first 60 frames: one hand in 53, two in 7. It found the same number of hands as the CPU in 52 of the 60.
  - R3b on the CPU, 150 frames: no hand in 5 and one in 145, all labelled `Left`.
  - R3c on the CPU, 150 frames: two hands in 150 of 150, labelled `Left` and `Right`.
  - The labels weren't checked against the videos. In the R3a runs the page sent one request each to `https://odml.pa.googleapis.com/v1/log`, which my agents' driver blocked (r0314). The R3b and R3c runs sent none (r0329).
- Time: shared, mean per frame. R3a on the CPU 293.5 ms, on the `"GPU"` delegate 3,480.7 ms, R3b 198.7 ms and R3c 148.1 ms. The checking agent's rerun of R3c: 192.7 ms, with the same landmarks to the 4 saved decimals (r0451).
- Takes as a hint: `numHands`, `minHandDetectionConfidence`, `minHandPresenceConfidence` and `minTrackingConfidence`. Nothing about guitars.
- Hands off to: the section *Reading hands and the fretboard from video*, which maps these points to frets and strings.

**ONNX Runtime Web 1.31.1** ([link](https://onnxruntime.ai/docs/tutorials/web/)). Microsoft's library for running ONNX model files in a web page, on WebAssembly or a graphics card.

- In: `nmp.onnx` (Basic Pitch) and `htdemucs_embedded.onnx` (demucs-web), in their own entries.
- Command or settings: the wasm execution provider with `ort.env.wasm.numThreads` 1, 2 or 4. Its WebGPU provider is in my measuring page and was skipped here for lack of an adapter.
- Out: tensors (arrays of numbers) for the two models. With cross-origin isolation the thread count stayed as asked. Without it, ONNX Runtime Web set it to 1.
- Time: in the Basic Pitch ONNX and demucs-web entries.
- Takes as a hint: none of its own.
- Hands off to: the page code that turns the tensors into notes or stems.

**Output latency figures, Web Audio API 1.1 in Chrome 153** ([link](https://www.w3.org/TR/webaudio-1.1/)). Numbers the browser reports about the delay between its audio clock and the sound card.

- In: none. The probe page and the sync pages read them.
- Command or settings: an `AudioContext` with the default `latencyHint` and with `playback`.
- Out: `baseLatency` 0.01 s and `outputLatency` 0.032 s after 3 s of running (r0042). Read right after `resume()`, `outputLatency` was 0 (r0143, r0150). With `playback` they were 0.02322 s and 0.072 s, and `playbackStats` gave an average latency of 0.031183 s (r0042). They come from a browser with no sound device, so they don't describe anyone's speakers. `getOutputTimestamp()` was read by the probe (r0042) and logged every 50 ms by both S4 sync pages (r0143, r0150).
- Time: none of its own (the probe, r0042, took 7.53 s pinned to 2 cores).
- Takes as a hint: `latencyHint`. MDN says `the browser may ignore the option`.
- Hands off to: nothing here.

**peaks.js 4.0.0** ([link](https://codeberg.org/chrisn/peaks.js)). A waveform view from BBC R&D, a drawing of the audio a person can click on and mark.

- In: S4 (38.7 s) and R2full, as WAV.
- Command or settings: `Peaks.init({zoomview, overview, mediaElement, webAudio: {audioContext, scale: 128, multiChannel: false}})`.
- Out: waveform data at scale 512, though the page asked for 128, with 3,337 points for S4 and 19,680 for R2full, 44,100 Hz, 1 channel. The checking agent's rerun gave the same (r0451).
- Time: shared (r0329). Ready after 325 ms for S4 and 1,398 ms for R2full.
- Takes as a hint: none. Point and segment markers are its own notes on the waveform.
- Hands off to: nothing here.

**pitchfinder 2.3.4** ([link](https://github.com/peterkhayes/pitchfinder)). A JavaScript set of pitch detectors. Its YIN detector ran.

- In: S1 and R1b, in 2048-sample frames every 441 samples (10 ms).
- Command or settings: `YIN({sampleRate: 44100})`.
- Out: a frequency in Hz or `null` per frame, with `null` counted as 0. On S1 its frequency was within 50 cents of the known note in 2,196 of the 2,624 frames where a note sounds, and it gave a pitch in 359 of the 360 frames where none does (e1228). On R1b, 550 of 1,823, and 1,104 of 1,111 (e1229). Its first rows on S1, where the clip is silent:

```text
time_s,frequency_hz
0.023220,17640.001
0.033220,17640.000
```

- Time: shared (r0329). 6.97 s for S1 and 7.58 s for R1b.
- Takes as a hint: none.
- Hands off to: nothing here.

**pitchy 4.1.0** ([link](https://github.com/ianprime0509/pitchy)). A JavaScript pitch detector that uses the McLeod pitch method.

- In: S1 and R1b, in 2048-sample frames every 10 ms.
- Command or settings: `PitchDetector.forFloat32Array(2048)` and `findPitch(frame, 44100)`.
- Out: a frequency and a `clarity` value from 0 to 1 per frame. It returned 0 Hz for some frames, such as the first ones of S1, before the first note. On S1 with no threshold, it gave a pitch in all 2,624 frames where a note sounds, within 50 cents of the known note in 2,458 of them, and a pitch in 168 of the 360 frames where none does (e1192). With frames under clarity 0.9 counted as silent, 2,333 of the 2,624 note frames still had a pitch, and 119 of the 360 silent frames did (e1200). On R1b, 1,418 of 1,823, with a pitch in 843 of the 1,111 silent frames, or 175 with the clarity cut (e1201, e1202).
- Time: shared (r0329). 1.09 s for S1 (2,979 frames) and 0.68 s for R1b.
- Takes as a hint: the frame size and the clarity threshold the caller applies.
- Hands off to: nothing here. An open string's measured frequency against its expected one gives the tuning offset in cents. Not tried.

**playbackRate and preservesPitch, HTML Living Standard, in Chrome 153** ([link](https://html.spec.whatwg.org/multipage/media.html)). The browser's own slow-down for `<audio>` and `<video>`, with or without keeping the pitch.

- In: S1 in an `<audio>` element, recorded from the page's audio graph.
- Command or settings: `playbackRate` 0.5 and 0.75 with `preservesPitch` `true`, and 0.75 with `preservesPitch` `false`.
- Out: audio. At 0.5x the music lasted 1.99978 times as long, its first note moved -1.13 cents, and 62 of 62 notes were within 50 cents of their written pitch. At 0.75x, 1.33276 times as long, -1.16 cents and 62 of 62. At 0.75x without `preservesPitch`, 1.33333 times as long, -498.05 cents and 0 of 62 (a median of -499.36 cents). The note pitches were read with pyin, a pitch reader in librosa, and that column wasn't rechecked. The checking agent's rerun at 0.75x gave the same length of sound (r0441).
- Time: real time, 59.629 s and 39.761 s from `play()` to `ended` (r0225, shared).
- Takes as a hint: `playbackRate` and `preservesPitch`. A click booked on the audio clock doesn't slow down with it, so its times have to be worked out for the slower tempo.
- Hands off to: nothing here. alphaTab can follow an element like this as outside media.

**realtime-bpm-analyzer 5.6.1** ([link](https://www.realtime-bpm-analyzer.com)). A TypeScript library that guesses the BPM of a file or live audio.

- In: S3, S4 and R2.
- Command or settings: `analyzeFullBuffer(audioBuffer)`.
- Out: a list of `{tempo, count, confidence}` guesses. For S3, a 96 BPM clip, its top guess was 96, with count 9 and confidence 0.206, then 97 and 110 (e1232). For S4, a 116 BPM clip, its top guess was 116, with count 36 and confidence 0.257, then 155 and 93 (e1235). For R2, with no known tempo, its top guess was 144, with count 11, then 96 and 143.
- Time: shared (r0329). 77 to 179 ms per clip.
- Takes as a hint: none.
- Hands off to: nothing here.

**requestVideoFrameCallback, a WICG draft, in Chrome 153** ([link](https://wicg.github.io/video-rvfc/)). A browser feature that calls the page once for each video frame shown, with that frame's time in the video.

- In: `R3a.mp4` and `R3a.webm`, played muted at normal speed.
- Command or settings: `requestVideoFrameCallback`, registered again from inside each callback. Each frame shown was copied with `new VideoFrame(video)` and identified by a hash of its brightness plane, checked against ffmpeg's decode.
- Out: for the MP4, 539 callbacks for 540 frames, with `presentedFrames` up by 1 each time, and 539 of 539 frames shown were the frame whose time is the last at or before `mediaTime` plus 0.5 ms. For the WebM, 536 callbacks in the first pass, where `presentedFrames` stepped by 2 twice, and 537 in the second, with 537 of 537 matching the same way. Seeking the WebM showed the frame whose time is the last at or before the target in 24 of 24. Seeking the MP4 to a frame's exact start time showed that frame in 2 of 12 and the one before in 10 of 12, and to the middle of a frame showed it in 12 of 12. The checking agent's rerun of the MP4 gave 539 of 539 and the same 24 seek frames (r0433).
- Time: real time, shared (r0157 for the MP4, r0156 for the WebM). Callbacks came a mean 33.46 ms apart for the MP4, and identifying a frame took 1.27 ms on average.
- Takes as a hint: none.
- Hands off to: nothing here. `mediaTime` times 1000 is the timestamp MediaPipe's `detectForVideo` takes. The hand runs used Mediabunny's frames instead.

**rubberband-wasm 3.3.0** ([link](https://github.com/Daninet/rubberband-wasm)). The Rubber Band time-stretch library compiled to WebAssembly.

- In: S1.
- Command or settings: `rubberband_new(44100, 2, 0, 1/rate, 1.0)`, a `study` pass, then `process` and `retrieve` in 1024-sample blocks, all ahead of time rather than while playing.
- Out: one float array per channel, exactly the input length divided by the rate. At 0.5x the music lasted 2.00004 times as long, the first note moved +0.09 cents, and 62 of 62 notes were within 50 cents. At 0.75x, 1.33361, +0.05 cents and 61 of 62, where pyin read one note 1199.36 cents off. The note pitches were read with pyin, and that column wasn't rechecked. Its loudest sample was 0.855 and 0.886, against 0.891 in the input.
- Time: shared (r0314). 2,959 ms at 0.5x and 2,163 ms at 0.75x, plus 17 and 13 ms to start the WebAssembly. The checking agent's rerun at 0.5x took 3,761 ms and wrote a byte-identical file (r0451).
- Takes as a hint: rate and pitch scale. Its option flags were left at 0.
- Hands off to: nothing here.

**Signalsmith Stretch 1.3.2** ([link](https://github.com/Signalsmith-Audio/signalsmith-stretch)). Signalsmith Audio's time-stretch and pitch-shift library, as WebAssembly inside an AudioWorklet.

- In: S1.
- Command or settings: in an OfflineAudioContext, `addBuffers` and `schedule({active: true, input: 0, rate, output})` sent during `suspend(256 frames)`, then `resume()`. Sent before `startRendering()` instead, the first try rendered silence (r0170), which isn't verified because its files are gone.
- Out: audio from an AudioNode, rendered ahead of time. At 0.5x the music lasted 2.00483 times as long, the first note moved +3.28 cents, and 62 of 62 notes were within 50 cents. At 0.75x, 1.33396, +2.68 cents and 62 of 62. The note pitches were read with pyin, and that column wasn't rechecked. Its loudest sample was 1.105 and 1.185 in float, above 1.0, against 0.891 in the input.
- Time: shared (r0314). 2,112 ms at 0.5x and 1,357 ms at 0.75x. The checking agent's rerun at 0.5x took 2,439 ms and wrote a byte-identical file (r0451).
- Takes as a hint: `rate`, `semitones`, `tonalityHz`, `formantSemitones` and loop points. Its README says `time-stretching sounds best for more modest changes (between 0.75x and 1.5x)`.
- Hands off to: nothing here. Its `schedule` takes audio-clock times, the clock a metronome uses.

**smplr 1.2.0** ([link](https://github.com/danigb/smplr)). Sampled instruments for Web Audio: recorded notes played back at the pitch asked for.

- In: S2n's 90 known notes as MIDI note numbers with times, and the FluidR3_GM nylon guitar sounds from gleitz's MIDI.js sound fonts (`acoustic_guitar_nylon-ogg.js`, 2,158,023 bytes).
- Command or settings: `Soundfont(ctx,{instrument:'acoustic_guitar_nylon',kit:'FluidR3_GM'})` and `start({note, velocity, time, duration})` for each note, booked ahead on the audio clock, imported from `dist/index.mjs`. The first try imported `dist/index.js` and failed with `module is not defined`, an error text that isn't verified because its file was overwritten.
- Out: audio in the page's graph. The detector found 46 note starts, 46 of the 48 known ones among them (e0533), a median 14.75 ms after the known time, where it gives 14.67 ms on the original clip. Against the original render, its recording had a normalized cross-correlation peak of 0.650. The checking agent's rerun found 48 starts, the 2 extra where the recorder logged repeated frames (r0441).
- Time: it loaded in 0.74 s and plays in real time (r0229, shared).
- Takes as a hint: none beyond the MIDI pitch.
- Hands off to: it takes MIDI note numbers with times.

**soundfont-player 0.12.0** ([link](https://github.com/danigb/soundfont-player)). The older sample player by smplr's author.

- In: S2n's 90 notes and the FluidR3_GM nylon guitar sounds as MP3 (`acoustic_guitar_nylon-mp3.js`, 1,837,439 bytes).
- Command or settings: `Soundfont.instrument(ctx,'acoustic_guitar_nylon',{soundfont:'FluidR3_GM'})` and `play(note, time, {duration, gain: velocity/127})`. The first try failed with `Network Error` because my agents' driver blocked the download before the file was cached, an error text that isn't verified.
- Out: 49 note starts found, all 48 known ones among them (e0540), a median 14.74 ms after the known time. Against the original render, its recording had a normalized cross-correlation peak of 0.648.
- Time: it loaded in 1.47 s and plays in real time (r0229, shared).
- Takes as a hint: none.
- Hands off to: it takes MIDI note numbers with times.

**SoundTouchJS 0.3.0** ([link](https://github.com/cutterbl/SoundTouchJS)). A JavaScript version of the SoundTouch tempo and pitch library.

- In: S1.
- Command or settings: `SoundTouch` with `tempo` set to the rate and `pitch` 1, then `WebAudioBufferSource` and `SimpleFilter.extract()` until it returns 0, ahead of time.
- Out: stereo float frames. At 0.5x the music lasted 2.00203 times as long, the first note moved -2.12 cents, and 62 of 62 notes were within 50 cents. At 0.75x, 1.33322, -1.08 cents and 62 of 62. The note pitches were read with pyin, and that column wasn't rechecked. It returned 0.41 s and 0.29 s less than the input length divided by the rate.
- Time: shared (r0314). 195 ms at 0.5x and 172 ms at 0.75x. The checking agent's rerun at 0.5x took 283 ms and wrote a byte-identical file (r0451).
- Takes as a hint: tempo and pitch.
- Hands off to: nothing here.

**SpessaSynth 4.4.7** ([link](https://spessasus.github.io/spessasynth_lib)). A sound-bank synthesizer and MIDI player written in TypeScript.

- In: S2n's 90 notes and `FluidR3_GM.sf2`.
- Command or settings: an esbuild bundle of `spessasynth_lib` 4.4.7 and `spessasynth_core` 4.4.9, with `WorkletSynthesizer`, `soundBankManager.addSoundBank(sf, 'main')`, `programChange(0,24)`, `noteOn(0,p,v,{time})` and `noteOff(0,p,{time})`.
- Out: 46 note starts found, 46 of the 48 known ones among them (e0427), a median 13.80 ms after the known time. Against the original render, its recording had a normalized cross-correlation peak of -0.229, since its waveform differs.
- Time: it loaded in 1.79 s and plays in real time (r0225, shared).
- Takes as a hint: none.
- Hands off to: it takes MIDI.

**TensorFlow.js 3.21.0** ([link](https://www.tensorflow.org/js/guide/platform_environment)). Google's library for running models in a web page. Basic Pitch's npm package pulled in 3.21.0, and the newest on npm is 4.22.0.

- In: Basic Pitch's model, `model/model.json` with one weights file.
- Command or settings: the `webgl` (in software here), `cpu` and `wasm` backends.
- Out: in the Basic Pitch entry. `webgl` and `cpu` gave the same notes. `wasm` failed with `Error: Unknown dtype undefined`, thrown during `evaluateModel`.
- Time: in the Basic Pitch entry.
- Takes as a hint: one backend at a time.
- Hands off to: Basic Pitch's note step.

**Tone.js 15.1.22** ([link](https://github.com/Tonejs/Tone.js)). A music library for Web Audio with a Transport, a timeline that runs at a tempo.

- In: no clip. The same 120 BPM click as the other ways of timing it.
- Command or settings: `Tone.setContext(ctx)`, `Transport.scheduleRepeat(cb, '4n')` and `Transport.start(t0)`, with each callback starting the click at the `time` Tone passes in. Tone reported `lookAhead` 0.1 s, `updateInterval` 0.05 s and `clockSource` `"worker"`.
- Out: with the page idle, 0 of 122 clicks off the beat grid. Busy, 7 of 122 late by 0.227 to 2.268 ms, after correcting a 2.902 ms slip in my agents' recorder. Before that correction, the mean was 2.195 ms and the largest 5.170 ms (r0199). The checking agent's busy rerun had 11 off the grid, the largest 10.249 ms (r0433). In the measuring page's 15-second busy run, 3 late, the largest 29.84 ms (r0271).
- Time: real time, 61 s a run, shared (r0199).
- Takes as a hint: `bpm`, and the Transport's start, stop and loop.
- Hands off to: nothing here.

**wavesurfer.js 8.0.5** ([link](https://wavesurfer.xyz)). A waveform view and player.

- In: S4 and R2full as WAV, and `R3a.webm` as its `media`.
- Command or settings: `WaveSurfer.create({container, url, height: 100, width: 1000})` and `exportPeaks({channels: 1, maxLength: 1000})`.
- Out: peaks as numbers from -1 to 1, 1000 per channel. It decoded the audio at 8000 Hz for the drawing. With the video as its media, `getCurrentTime()` equalled `video.currentTime` in 80 of 80 reads over 8 s. The checking agent's rerun gave the same (r0451).
- Time: shared (r0329). Ready after 704 ms for S4, 1,315 ms for R2full and 215 ms with the video.
- Takes as a hint: its Regions plugin marks a stretch of audio, for picking a loop.
- Hands off to: nothing here. alphaTab's position in milliseconds would go in as `setTime(ms / 1000)`.

**Web Audio clock and look-ahead scheduling, Web Audio API 1.1 in Chrome 153** ([link](https://www.w3.org/TR/webaudio-1.1/)). The browser's audio clock, `AudioContext.currentTime`, and booking a sound for an exact time on it with `start(when)`. The plain `setInterval` timer ran next to it for comparison.

- In: no clip for the metronome. S4 as a WAV for sync.
- Command or settings:
  - Metronome, look-ahead loop: a `setTimeout` loop every 25 ms books each click due in the next 100 ms with `AudioBufferSourceNode.start(when)`. Metronome, `setInterval(500 ms)`: each callback starts a click at once with `start()`. Both idle and busy, 122 clicks each.
  - Sync on the same clock: S4 decoded with `decodeAudioData` and started at an exact frame, with a 10 ms click booked on each of its 68 beats.
  - Sync with an `<audio>` element: S4 played in the element, routed in with `createMediaElementSource`, and the clicks booked from `audio.currentTime` by the same 25 ms and 100 ms loop.
- Out: recordings.
  - Look-ahead loop: idle, 0 of 122 off the beat grid. Busy, 11 of 122 late, the largest 42.132 ms, all 11 booked after their time had already passed (r0199). The checking agent's rerun had 8 late, the largest 61.769 ms on the first click (r0433).
  - setInterval: idle, 5 of 122 more than 5 ms off the grid of its own first click, the largest 42.630 ms. Busy, a mean of 30.724 ms and a largest of 91.202 ms (r0199).
  - Sync on the same clock: 68 of 68 clicks found, 0 to 0.023 ms (one sample) after their beats, with S4's first sample at exactly the booked frame (r0143). The checking agent's rerun gave the same (r0433).
  - Sync with the `<audio>` element: 68 of 68 clicks found, 0 to 2.789 ms after their beats, a median of 0.023 ms. The element's time minus the audio clock moved by 2.00 ms over 38.29 s (r0150).
- Time: real time, 61 s per metronome run and 44.2 and 46.5 s per sync run, shared (r0199, r0143, r0150).
- Takes as a hint: any list of times. Tempo, count-in and click pattern are whatever the code works out, and the 100 ms look-ahead and 25 ms loop are page settings.
- Hands off to: beat times from a beat tracker go in as `start(when)` times at the song's start plus each beat time, as S4's beat list did here.

**web-audio-beat-detector 8.2.39** ([link](https://github.com/chrisguttandin/web-audio-beat-detector)). A small library that guesses a tempo and the first beat of a decoded clip.

- In: S3, S4 and R2.
- Command or settings: `analyze(audioBuffer)` and `guess(audioBuffer)`. My agents built a beat grid from `guess()` as the offset plus n times 60 over the BPM.
- Out: a tempo as a decimal number, and from `guess()` a whole-number BPM and the time of the first beat, with no list of beats. For S3 (96 BPM), `analyze()` gave 96.650 and `guess()` 97 at 0.1439 s, a grid of 39 beats with 22 of the 32 known beats within 70 ms (e1196, e1197). For S4 (116 BPM), 115.970, and 116 at 0.0278 s, a grid of 75 beats with 68 of 68 within 70 ms, each 27.8 ms late (e1198, e1199). For R2, 143.474, and 143 at 0.0968 s, with no known answer. The artist's page lists 72 bpm, which wasn't checked.
- Time: shared (r0329). 73 to 226 ms per call.
- Takes as a hint: `tempoSettings` with `minTempo` and `maxTempo`, and an `offset` and `duration` to look at part of the clip. Its README says `By default the bpm are expected to be between 90 and 180 bpm.`
- Hands off to: nothing here. A metronome on the audio clock would take it as `start(t0 + offset + n * 60 / bpm)`.

**WebCodecs, W3C Working Draft of 9 November 2026, in Chrome 153** ([link](https://www.w3.org/TR/webcodecs/)). A browser feature that decodes and encodes single audio and video frames. It doesn't open MP4 or WebM files, so something like Mediabunny does that part.

- In: the probe page's list of codec names, and R3a through Mediabunny.
- Command or settings: `VideoDecoder.isConfigSupported` and `AudioDecoder.isConfigSupported`.
- Out: video decoding was supported for H.264, VP8, VP9 and AV1 with `no-preference` and `prefer-software`, for none with `prefer-hardware`, and not for HEVC. Audio decoding was supported for AAC, Opus, MP3, pcm-s16 and pcm-f32, while FLAC and Vorbis threw `description is required` (r0042). The decoded frames are in the Mediabunny entry.
- Time: the probe took 7.53 s pinned to 2 cores (r0042).
- Takes as a hint: none.
- Hands off to: its `VideoFrame`s went to MediaPipe through Mediabunny.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

The list has 100 entries, and 33 of them gave output above. Here are the other 67 and why each didn't run, including WebGPU, which was tried but found no graphics card. Where my agents wrote steps for me to try it myself, the line gives the item number in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/browser-audio-sync).

- **abcjs and osmd-audio-player**: players tied to sheet-music drawing, covered under *Showing, editing and playing a tab in the browser*. No steps.
- **@alexanderolsen/libsamplerate-js**: found by the checking agent in the npm registry, not surveyed in depth and not run. No steps.
- **aubio** (the C library inside aubiojs): not run on its own here. Only its license was read, and its command-line tool is in other sections. No steps.
- **audio-decode**: found by the checking agent, not surveyed in depth and not run. No steps.
- **audiomotion-analyzer**: found by the checking agent, not surveyed in depth and not run. No steps.
- **audiowaveform** (a program that precomputes waveform data for peaks.js): not reached in the time available, with no known blocker. No steps.
- **Basic Pitch web demo** (basicpitch.io): it needs a person to drop a file into the page. The same library ran headless above. Steps for me: item 2.
- **`Beat This!`** (the Python beat tracker): covered under *Chords, beat, key and tuning*, not run here. No steps.
- **`Beat This!` ONNX export** (`musetric/beat-this-onnx`): it's packaged for WebGPU, which the box lacks. Its card says the wasm route `also works and gives identical results, at roughly 12× the wall clock`, and that wasn't tried for lack of time, since the page would have had to build the model's input itself. No steps.
- **Bungee** (Parabola Research): not reached in the time available, with no known blocker. No steps.
- **Bungee Pro and the Bungee Pro Web SDK**: they need a commercial agreement, and the price isn't published. No steps.
- **bungee-pitch-shift** (a WebAssembly build of Bungee on npm): not reached in the time available, with no known blocker. No steps.
- **@csound/browser**: found by the checking agent, not surveyed in depth and not run. No steps.
- **Demucs** (Meta's Python original): covered under *Splitting a song into instruments*. No steps.
- **demucs-js** (bakkot): not run, and my agents' notes don't say why. No steps.
- **demucs-rs**: its browser version needs WebGPU, which the box lacks. Steps for me: item 3, its browser demo.
- **demucs-wasm** (bengfarrell): not reached in the time available, with no known blocker. No steps.
- **@echogarden/rubberband-wasm**: not reached in the time available, with no known blocker. No steps.
- **@echogarden/sonic-wasm**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@elemaudio/core**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@elemaudio/web-renderer**: found by the checking agent, not surveyed in depth and not run. No steps.
- **FluidSynth** (the native program): not run as a tool here. Its 2.3.4 render made the test clips, and js-synthesizer's recording was compared with it. No steps.
- **fnaught** (a small pitch model as one ONNX file): found by the checking agent, not surveyed in depth and not run. No steps.
- **free-music-demixer** (sevagh): not run, and my agents' notes don't say why. No steps.
- **Ghilda/htdemucs-onnx**: not run, and my agents' notes don't say why. No steps.
- **@grame/faustwasm**: found by the checking agent, not surveyed in depth and not run. No steps.
- **howler**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@ircam/sc-components**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@ircam/sc-scheduling**: not reached in the time available, with no known blocker. No steps.
- **libav.js**: not run, and my agents' notes don't say why. No steps.
- **libavjs-webcodecs-polyfill**: not run, and my agents' notes don't say why. No steps.
- **LiteRT.js**: not reached in the time available, with no known blocker. No steps.
- **Magenta.js** (`@magenta/music`, with the Onsets and Frames transcription model): not reached in the time available, with no known blocker. No steps.
- **MediaPipe Studio hand landmarker demo**: the box has no GPU, and from the box the address went to Google's sign-in page. Steps for me: item 4.
- **Meyda**: not reached in the time available, with no known blocker. No steps.
- **MidiPlayerJS**: not reached in the time available, with no known blocker. No steps.
- **ml5.js**: not reached in the time available, with no known blocker. No steps.
- **monteslu/htdemucs-web-onnx**: it's exported for ONNX Runtime Web on WebGPU, which the box lacks. No steps.
- **mp4box.js**: not reached in the time available, with no known blocker. No steps.
- **node-web-audio-api**: found by the checking agent, not surveyed in depth and not run. No steps.
- **OpenCV.js** (`@techstark/opencv-js`): not reached in the time available, with no known blocker. No steps.
- **OpenVoicing** (an open-source practice app built on alphaTab and Signalsmith Stretch): not reached in the time available, with no known blocker. No steps.
- **@remotion/media-parser**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@remotion/webcodecs**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@rnbo/js**: found by the checking agent, not surveyed in depth and not run. No steps.
- **Rubber Band Library** (the original): only its license page and the WebAssembly builds' READMEs were read. The library itself ran through rubberband-wasm. No steps.
- **rubberband-web**: not reached in the time available, with no known blocker. No steps.
- **sevagh/demucs.onnx and demucs.cpp**: not run, and my agents' notes don't say why. No steps.
- **SoundTouch** (the original C++ library): only its license page was read. No steps.
- **@soundtouchjs/audio-worklet and @soundtouchjs/core** (the newer SoundTouchJS packages): not reached in the time available, with no known blocker. No steps.
- **standardized-audio-context**: not tried. It was only installed as another package's dependency. No steps.
- **Superpowered Web Audio SDK**: not tried. The only reason on record, a license key, came from the agent that ran the trials, and the checking agent struck it as not supported by the sources. Its terms say the evaluation license `is offered for internal, private experimentation and R&D purposes (eg PoC) only and does not allow for public release`, and its pricing page says `Superpowered is sunsetting`. No steps.
- **SwiftF0 browser demo**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@tonejs/midi**: not reached in the time available, with no known blocker. No steps.
- **Transformers.js**: not installed. A notice on the shared box said `start no new download or install over 200 MB unless your lane cannot finish without it`, and per the npm registry its version 4.3.2 depends on `onnxruntime-web` (144,895,056 bytes) and `onnxruntime-node` (301,068,136 bytes). No steps.
- **WAAClock**: not reached in the time available, with no known blocker. No steps.
- **waveform-data.js**: not reached in the time available, with no known blocker. No steps.
- **waveform-playlist**: found by the checking agent, not surveyed in depth and not run. No steps.
- **web-demuxer**: not reached in the time available, with no known blocker. No steps.
- **WebAudioFont**: not reached in the time available, with no known blocker. No steps.
- **@webaudiomodules/api**: found by the checking agent, not surveyed in depth and not run. No steps.
- **WebGPU**: tried, but the box's Chrome found no adapter (`requestAdapter()` returned `null`) and WebGL ran in software. Steps for me: item 1, where my measuring page tries ONNX Runtime Web on WebGPU, and item 3.
- **webmidi**: found by the checking agent, not surveyed in depth and not run. No steps.
- **WebNN**: not tried. Browser support data lists it in Chrome 112 behind a flag only. No steps.
- **webnn/stem-separator**: not tried, and my agents' notes don't say why. Its card describes it as `running entirely client-side via ONNX Runtime Web with WebNN (NPU/GPU) acceleration, cascading to WebGPU/WASM`, which the checking agent took to mean a WebAssembly run wouldn't need a graphics card. Its weights are about 168 MB. No steps.
- **worker-timers**: not reached in the time available, with no known blocker. No steps.
- **YouTube iframe player API** (as alphaTab's docs use it): not tried, and my agents' notes don't say why. YouTube's own terms were covered by the agents researching *Services an agent can call over the internet*. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| alphaTab 1.9.0 | MPL-2.0, section 3.2: `If You distribute Covered Software in Executable Form then: (a) such Covered Software must also be made available in Source Code Form` ([LICENSE](https://unpkg.com/@coderline/alphatab@1.9.0/LICENSE)) | none. Its bundled sound bank, `sonivox.sf2`, is Apache-2.0 | none |
| aubiojs 0.2.1 | MIT for the package. The aubio library compiled into it is GPL-3.0, and its COPYING begins `GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007` ([COPYING](https://raw.githubusercontent.com/aubio/aubio/master/COPYING)) | none | none |
| Basic Pitch for the browser 1.0.1 | Apache-2.0 | the model ships inside the Apache-2.0 package, with no separate license file for it | GuitarSet, MAESTRO, Slakh, iKala and MedleyDB, per the paper. MAESTRO: `The dataset is made available by Google LLC under a Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0) license.` ([MAESTRO](https://magenta.tensorflow.org/datasets/maestro)). Neither Basic Pitch README says how the training data's licenses bear on the released model. |
| Basic Pitch ONNX model | Apache-2.0, the Python repository's license | `nmp.onnx` ships in that repository, with no separate license for it | the same as above |
| `browser-timing-check.html` | written by my agents for this research, no license stated | none | none |
| demucs-web 1.0.2 | MIT | `htdemucs_embedded.onnx`: no license stated, since its Hugging Face repository has no model card. The maintained Demucs fork says `The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.` ([README](https://raw.githubusercontent.com/adefossez/demucs/main/README.md)) | MUSDB18-HQ and 800 more songs of Meta's. MUSDB18-HQ: `MUSDBHQ: is provided for educational purposes only and the material contained in them should not be used for any commercial purpose without the express permission of the copyright holders` ([Zenodo](https://zenodo.org/api/records/3338373)) |
| essentia.js 0.1.3 | AGPL-3.0, section 13: `if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network` ([LICENSE](https://unpkg.com/essentia.js@0.1.3/LICENSE)). Its makers: `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications, thus it is possible to test the library before deciding to licence it under a comercial licence.` ([licensing](https://essentia.upf.edu/licensing_information.html)) | none used here | none |
| ffmpeg.wasm 0.12.15 | MIT for `@ffmpeg/ffmpeg`, GPL-2.0-or-later for `@ffmpeg/core` and `@ffmpeg/core-mt` per their npm fields, and none of the three ships a license file. Its FAQ: `@ffmpeg/core contains WebAssembly code which is transpiled from original FFmpeg C code with minor modifications, but overall it still following the same licenses as FFmpeg and its external libraries (as each external libraries might have its own license).` ([FAQ](https://ffmpegwasm.netlify.app/docs/faq)). The core here was built with `--enable-gpl`. | none | none |
| js-synthesizer 1.13.0 | BSD-3-Clause. On the FluidSynth file inside it, its README says `its license (LGPL v2.1) is different from js-synthesizer's (BSD-3-Clause).` ([repository](https://github.com/jet2jet/js-synthesizer)) | none. The sound bank used, FluidR3_GM, is MIT per its author | none |
| Mediabunny 1.65.2 | MPL-2.0. Its README: `If you modify Mediabunny's licensed source code (e.g. in a fork) and then distribute it, you must publicly publish your modifications under the Mozilla Public License 2.0.` ([README](https://unpkg.com/mediabunny@1.65.2/README.md)) | none | none |
| MediaPipe Tasks Vision 1.2.2 | Apache-2.0 | `hand_landmarker.task`: Apache-2.0 per its model card, which lists as out of scope `Predicting hand landmarks with gloves or occlusions. For example when the hand is holding objects or there is decoration on the hand including jewelry, tattoo and henna.` and says `The model has been trained on limited datasets and is meant for experimental usage.` ([model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf)) | not stated in the sources read |
| ONNX Runtime Web 1.31.1 | MIT | none of its own | none |
| peaks.js 4.0.0 | LGPL-3.0, section 4: `You may convey a Combined Work under terms of your choice that, taken together, effectively do not restrict modification of the portions of the Library contained in the Combined Work and reverse engineering for debugging such modifications, if you also do each of the following:` ([COPYING](https://unpkg.com/peaks.js@4.0.0/COPYING)) | none | none |
| pitchfinder 2.3.4 | its npm field says `"license": "GNU v3"`, and no license file was found in the package or at the top of its [repository](https://github.com/peterkhayes/pitchfinder) | none | none |
| pitchy 4.1.0 | MIT | none | none |
| realtime-bpm-analyzer 5.6.1 | Apache-2.0 | none | none |
| rubberband-wasm 3.3.0 | GPL-2.0, npm field `GPLv2`. Its README: `Rubber Band Library is open source software under the GNU General Public License. If you want to distribute it in a proprietary commercial application, you need to buy a licence.` ([repository](https://github.com/Daninet/rubberband-wasm)) | none | none |
| Signalsmith Stretch 1.3.2 | MIT | none | none |
| smplr 1.2.0 | MIT, per its `package.json` and README, with no license file | none. The FluidR3_GM sounds used here are CC BY 3.0 per gleitz's README and MIT per the sound bank's author, and neither source refers to the other. smplr's default kit, MusyngKite: `Released under [Creative Commons Attribution Share-Alike 3.0 license](https://creativecommons.org/licenses/by-sa/3.0/)` ([README](https://github.com/gleitz/midi-js-soundfonts)) | none |
| soundfont-player 0.12.0 | MIT | none. The same FluidR3_GM sounds as smplr | none |
| SoundTouchJS 0.3.0 | LGPL-2.1, its LICENSE begins `GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999` ([LICENSE](https://unpkg.com/soundtouchjs@0.3.0/LICENSE)) | none | none |
| SpessaSynth 4.4.7 | Apache-2.0 | none. The sound bank used, FluidR3_GM, is MIT per its author | none |
| TensorFlow.js 3.21.0 | Apache-2.0 | none of its own | none |
| Tone.js 15.1.22 | MIT | none | none |
| wavesurfer.js 8.0.5 | BSD-3-Clause | none | none |
| Web features: AudioWorklet, cross-origin isolation, output latency figures, playbackRate and preservesPitch, requestVideoFrameCallback, the Web Audio clock, WebCodecs | built into the browser, a web platform API with no license to accept | none | none |
| web-audio-beat-detector 8.2.39 | MIT | none | none |

Every clause with its source, for these and the tools that didn't run, is in `survey.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/browser-audio-sync).

</details>

<!-- IMAGES -->
The lane has no pictures of its own, so both are charts drawn with Pillow from the lane's sample data by `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/charts/metronome_chart.py`. The script asserts every number printed in the pictures against the data before drawing. Style matches the other charts of this post (surface `#16151E`, marks `#3987E5`, Inter), and the mark color was run through the dataviz validator on that surface (all checks pass). Rows are in alphabetical order.

1. `browser-audio-sync-metronome-idle.webp`
   - Source: `docs/guitar-tab-research/lanes/browser-audio-sync/samples/web-audio-metronome/metronome_worklet_busy0.json`, `metronome_lookahead_busy0.json`, `metronome_interval_busy0.json`, `metronome_tone_busy0.json`, field `result.dev_all_ms` (122 values each, run r0199).
   - Written: `/home/user/blog/public/media/guitar-tab-tools/browser-audio-sync-metronome-idle.webp`, WebP, 1280x720, 56,580 bytes.
   - Alt: Four rows of blue dots across 60 seconds, labelled AudioWorklet, look-ahead loop, setInterval and Tone.js. In three rows every dot sits on the zero line. In the setInterval row the dots sit just above the line and five stand higher, the highest labelled 42.630 ms.
   - Caption: **Metronome, page idle**. 122 clicks at 120 BPM, timed four ways in headless Chrome, no clip. Each dot is one click's distance from the beat grid. For setInterval the grid starts at its own first click (r0199).
   - What it shows (looked at): a "Page idle" header, a legend (one click, the beat grid), four labelled rows with a 0 line and a 50 ms hairline each, an x axis from 0 s to 60. Row notes printed on it: "0 of 122 off the grid" (AudioWorklet, look-ahead loop, Tone.js), "5 of 122 more than 5 ms off" and "largest 42.630 ms" (setInterval).

2. `browser-audio-sync-metronome-busy.webp`
   - Source: the same folder, `metronome_worklet_busy100.json`, `metronome_lookahead_busy100.json`, `metronome_interval_busy100.json`, `metronome_tone_busy100.json`, field `result.dev_all_ms` (run r0199). For Tone.js the 128-frame correction of `trials.md` ("Metronome timing", correction paragraph) is applied to clicks due after frame 752768, and the corrected non-zero values were asserted equal to `nonzero_ms` in `check_metronome_output.txt` (1.542, 1.179, 0.227, 1.995, 0.68, 2.268, 1.542).
   - Written: `/home/user/blog/public/media/guitar-tab-tools/browser-audio-sync-metronome-busy.webp`, WebP, 1280x720, 65,998 bytes.
   - Alt: The same four rows with the page busy. The AudioWorklet dots all sit on the zero line. The look-ahead row has two dots just under the 50 ms line, one near 11 ms and the rest on or just above the zero line. The setInterval dots are scattered above and below the line, up to the labelled 91.202 ms. The Tone.js dots sit on the line with a few barely above it.
   - Caption: **Metronome, page busy**. The same test with the page's own code kept busy 100 ms at a time. Tone.js is shown after correcting a 2.902 ms slip in my agents' recorder (r0199).
   - What it shows (looked at): a "Page busy" header with "main thread blocked 100 ms at a time", the same legend and axes. Row notes printed on it: "0 of 122 off the grid" (AudioWorklet), "11 of 122 late" and "largest 42.132 ms" (look-ahead loop), "mean 30.724 ms" and "largest 91.202 ms" (setInterval), "7 of 122 late" and "largest 2.268 ms" (Tone.js).

<!-- PENDING MEDIA -->
All checked on 2026-11-10 with `ffprobe` and `stat`: every file exists. All are 44.1 kHz 32-bit float WAV.

1. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_interval_busy100.wav`: the setInterval click track with the page busy, no clip (r0199). Mono, 62.04 s, 10,944,044 bytes.
2. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_lookahead_busy100.wav`: the look-ahead loop's click track with the page busy, no clip (r0199). Mono, 61.96 s, 10,930,220 bytes.
3. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_tone_busy100.wav`: Tone.js's click track with the page busy, no clip (r0199). Mono, 61.93 s, 10,925,100 bytes. The file still holds the recorder's 128-frame slip, so from 17.07 s on its clicks sit 2.902 ms later than played.
4. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_worklet_busy100.wav`: the AudioWorklet click track with the page busy, no clip (r0199). Mono, 62.00 s, 10,936,876 bytes.
5. `/home/user/gtr/lanes/browser-audio-sync/out/sync/sync_s4_element_busy0.wav`: S4 played in an `<audio>` element with clicks booked on its 68 beats, Web Audio (r0150). 2 channels, channel 0 S4 as it arrived in the graph and channel 1 the clicks. 39.40 s, 13,899,820 bytes.
6. `/home/user/gtr/lanes/browser-audio-sync/out/alphatab/S2n_alphatab_live_countin_metronome.wav`: alphaTab 1.9.0's count-in and click while playing `S2n.gp5`, guitar muted (r0269). Mono, 8.41 s, 1,483,820 bytes.
7. `/home/user/gtr/lanes/browser-audio-sync/out/synths/S2n_jssynth.wav`: S2n's 90 notes played by js-synthesizer 1.13.0 with FluidR3_GM (r0225). 2 channels, 32.11 s, 11,328,556 bytes.
8. `/home/user/gtr/lanes/browser-audio-sync/out/synths/S2n_smplr.wav`: S2n's 90 notes played by smplr 1.2.0 with the FluidR3_GM nylon guitar sounds (r0229). 2 channels, 31.18 s, 11,000,876 bytes.
9. `/home/user/gtr/lanes/browser-audio-sync/out/stretch/S1_element_0p75_pp1.wav`: S1 at 0.75x through an `<audio>` element with `preservesPitch` true (r0225). 2 channels, 40.27 s, 14,208,044 bytes.
10. `/home/user/gtr/lanes/browser-audio-sync/out/stretch/S1_element_0p75_pp0.wav`: the same at 0.75x with `preservesPitch` false (r0225). 2 channels, 40.31 s, 14,221,356 bytes.

<!-- NUMBERS -->
Abbreviations: T = `docs/guitar-tab-research/lanes/browser-audio-sync/trials.md`, S = `.../survey.md`, F = `.../for-aaron.md`, J = `.../tools.json`, I = `/home/user/gtr/inputs/INPUTS.md`, E = `/home/user/gtr/eval/ledger/evals.jsonl`, L = `/home/user/gtr/ledger/runs.jsonl`, M = `samples/web-audio-metronome/`. "Derived" lines turn a gtr-eval fraction into a count with that eval's own totals. Each product came out a whole number to within 0.002.

Counts of tools
- 100 entries: J, 100 records. Not all are browser tools (J also lists FluidSynth, Demucs, Beat This!, the aubio C library, audiowaveform, the upstream Rubber Band and SoundTouch libraries and node-web-audio-api), so the RUNDOWN says "entries on their list".
- 34 tried: J, 34 records with `tried` true.
- 33 that gave output, and WebGPU tried with no adapter: J (WebGPU record `not_run_reason`), T "Environment probe".
- 67 not run: 100 minus 33.
- 27 license rows: the 26 tools with their own row plus one row for the 7 web features.

RUNDOWN and SECTION
- 122 clicks, 120 BPM, 61 s: T "Metronome timing", What.
- Busy, AudioWorklet 0 of 122 off the grid: T metronome table, r0199.
- Busy, look-ahead loop 11 of 122, largest 42.132 ms: T metronome table, r0199.
- Look-ahead 100 ms, loop every 25 ms: T metronome, method (a).
- Busy, setInterval largest 91.202 ms (mean 30.724 ms in the details): T metronome table, r0199. Its grid starts at its own first click: T "Metronome timing", Measurement ("the first detected click + n x 22050 for (b), which has no intended times"). The other three methods use the intended times.
- Busy, Tone.js 7 of 122, largest 2.268 ms (corrected): T metronome table and correction paragraph, r0199.
- Rerun, look-ahead 8 off, largest 61.769 ms (the first click): T "Verification log", re-run table, r0433.
- Rerun, Tone.js 11 off, largest 10.249 ms: T re-run table, r0433.
- S4 68 known beats: T "Sync to a recording", I (S4: 68 beats).
- Same clock 0 to 0.023 ms (min 0, max 0.023): T sync, r0143.
- Audio element 0 to 2.789 ms (min 0, max 2.789): T sync, r0150.
- Rounded in the RUNDOWN and the opening paragraphs only (exact values stay in the details and on the charts): 91 ms = 91.202 ms, 42 ms = 42.132 ms, 62 ms = 61.769 ms, 10 ms = 10.249 ms, 2.3 ms = 2.268 ms, 2.8 ms = 2.789 ms. 0.023 ms is kept, since it is one sample.
- Busy = the page's main thread spins for 100 ms, yields and repeats for the whole run: T metronome, Load.
- "8 in a second run" and "11 in a second run": the checking agent's busy reruns, T re-run table, r0433. Only the busy look-ahead and Tone.js runs were rerun (T "Still UNVERIFIED": the setInterval and AudioWorklet runs were not).
- Four synthesized clips (S1, S2n, S3, S4), two real recordings (R1b, the R2/R2full song), three real videos (R3a, R3b, R3c): T sections, I clip table.

Pictures (ao-compare)
- The x axis runs 0 to 60 s: clicks every 0.5 s at 120 BPM, 122 clicks, so 0 to 60.5 s (T metronome).
- 42.630 ms, "five stand higher": T metronome table, setInterval idle, `5 of 122 more than 5 ms off (42.6, 22.2, 12.7, 12.3, 11.7 ms)` and largest 42.630.
- Two look-ahead dots under 50 ms: M `metronome_lookahead_busy100.json` `dev_all_ms`, 41.451 and 42.132 (T lists both). The third raised dot is 11.383 ms (click 103, 51.5 s), and the other 8 late clicks are 0.045 to 2.313 ms: the same file and T metronome table. Picture looked at again for the alt text.
- 91.202 ms: T metronome table.
- 100 ms blocks: T metronome, Load.
- 2.902 ms slip (128 frames): T metronome correction paragraph.

Details intro and clips
- Chrome 153, Google Chrome for Testing 153.0.8010.12, Playwright 1.63.0: T "How the trials were run", ENVIRONMENT.md.
- Pinned to 2 of 4 cores, the probe's two runs and two click tests: T "CPU slots" (r0042, r0050, r0095, r0103), L (`locked` true and `cores` [2, 3] for those four only). What the probe does: T "Environment probe" (reads the Web Audio settings, tries codec strings, asks for WebGL and WebGPU).
- Peak memory left out: T "Run ids" ("the ledger's CPU and memory figures for browser runs are lower bounds").
- No cost: ENVIRONMENT.md "Cost".
- S1 Ode to Joy, nylon, 144 BPM, 62 notes: I S1.
- S2n 29 s (29.357 s), 90 notes, 112 BPM, `S2n.gp5`: I S2n.
- S3 96 BPM, G major, 32 beats: I S3.
- S4 116 BPM, D major, 68 beats, stems: I S4.
- S4_10s, 10 s from the first beat after the count-in: T demucs-web, Input.
- R1b 29 s (29.333 s), GuitarSet solo, 70 notes: I R1b.
- R2 36 s (36.000 s), no ground truth. R2full 228.5 s (228.482 s): I R2, R2full, T waveform views, `R2full (228.5 s WAV)`.
- R3a 18 s, camera cuts, H.264 mp4 and VP9 webm: I R3a.
- R3b and R3c 18 s, 1920x1080, whole fretboard in frame: I R3b, R3c.

alphaTab
- 1.9.0: J, T alphaTab.
- Tempo 112, strings `[64, 59, 55, 50, 45, 40]`, capo 0, 13 bars of 4/4, one silent count-in bar and 12 bars: T alphaTab, What ("string 1 first"). Standard tuning, no capo: I S2n.
- 5,178,644 bytes: T alphaTab backing track (r0453).
- `sampleRate` 44100, `metronomeVolume` 1, `useSyncPoints` false, `trackVolume` `{0: 0}`: T alphaTab, metronome through the audio export API.
- `countInVolume` 1, `metronomeVolume` 1, `changeTrackMute`: T alphaTab count-in.
- 13 sync points, 2142.857 ms, offset 0 or 1000 ms: T alphaTab backing track. What a sync point is: S Handoff fact 6 (`millisecondOffset`, "the audio timestamp in milliseconds this point maps to").
- 27.858 s, 52 clicks (13 bars x 4): T alphaTab export.
- 0 to 1.429 ms before the beat, mean 0.711 ms before: T alphaTab export, `from -1.429 to 0 ms (mean -0.711 ms)`.
- 535.51 or 536.96 ms, multiples of 64 samples, quote `the synthesizer internally uses a fixed block size of 64 samples for synthesizing audio`: T alphaTab export.
- Repeat with the same first 10 click times, r0329: T alphaTab export. Byte-identical rerun, r0451: T re-run table.
- 15 clicks, 8 s, first 8.7 ms, 11 of 14 gaps 535.51 ms, others 552.93, 536.96, 550.02 ms, r0269: T alphaTab count-in.
- r0257 nothing, r0266 silence, unverified: T alphaTab count-in (verifier note).
- Rerun 15 clicks, first 11.6 ms, r0441: T re-run table.
- `seekTo(0.558 ms)`, `seekTo(20000)`, `api.timePosition = 20000`, `seekTo(20892.857)`, 504 of 504, r0261: T alphaTab external media, which also says "in this mode alphaTab's reported position is the media time the page passes to `updatePosition`".
- Rerun 562 of 562, r0441: T re-run table ("695 position events, all 562 checked").
- 13 points exported, `AudioElementBackingTrackSynthOutput`, `blob:`, 0 ms and -1000 ms: T alphaTab backing track, r0453.
- 131 events at each offset: `samples/alphatab-player/alphatab_backing_off0.json` and `alphatab_backing_off1000.json`, `position_minus_audio_ms_during_play.n` 131 in both.
- Quote `At this point alphaTab cannot mix the synthesized audio and a backing track together, therefore only either audio will be heard.`: S section 15, J alphaTab `service_terms`.
- 616 ms, 103 ms, 85 ms (r0195), 377, 196, 76 ms (r0329): T alphaTab export.
- `playerReady` 243 and 141 ms: T alphaTab backing track (r0453).
- Hints: J alphaTab `constraints_accepted`, S section 15.
- `setTime(ms / 1000)`: S Handoff fact 17. MIDI not a documented input: S Handoff fact 4 (the formats it names are Guitar Pro, MusicXML, Capella and alphaTex).
- Cross-references to other sections use the post's headings for the lanes named in the sources: web-tab-render = "Showing, editing and playing a tab in the browser", guitar-tab = "Choosing the string and fret", video-hands-fretboard = "Reading hands and the fretboard from video", chords-beats-key = "Chords, beat, key and tuning", source-separation = "Splitting a song into instruments", hosted-apis = "Services an agent can call over the internet". aubio's command-line tool stays "in other sections", since J and S say only "other lanes".

aubiojs
- 0.2.1: J. Settings `new Pitch('yinfft', 2048, 441, 44100)`, `new Tempo(1024, 512, 44100)`, esbuild externals: T "More small libraries".
- Derived, S1: 0.947027 x 2624 = 2485 of 2,624 frames, 0.166667 x 360 = 60 of 360 (E e1226: `n_frames` 2984, `n_ref_voiced_frames` 2624).
- Derived, R1b: 0.869995 x 1823 = 1586 of 1,823, 0.679568 x 1111 = 755 of 1,111 (E e1227: `n_frames` 2934, `n_ref_voiced_frames` 1823).
- 97.33 BPM for 96: T table (e1230), I S3.
- 40 beats, 32 of 32, median 19.4 ms: T table (e1231), E e1231 (`n_est` 40, `n_matched` 32).
- 117.79 BPM for 116, 71 beats, 66 of 68, median 8.2 ms: T table (e1233, e1234), E e1234 (`n_est` 71, `n_matched` 66).
- R2 147.80 BPM, 84 beats: T table.
- 516 ms, 498 ms, 334 to 469 ms (r0329): T "More small libraries".

AudioWorklet
- 128-sample blocks: S section 2 ("Currently, audio data blocks are always 128 frames"), T probe (`renderQuantumSize` 128).
- 10 ms 2 kHz click, 120 BPM, 122 clicks, 61 s, 100 ms blocks: T metronome.
- 0 of 122 idle and busy (r0199): T metronome table.
- 0 ms in the 15 s runs (r0271): T "Measuring page".
- 384 to 1408 frames: T "How the trials were run".
- Quote `once for each block`: S section 2.
- 548.5 s for all 8 runs (r0199): T metronome Run, L r0199 (548.52).

Basic Pitch for the browser
- 1.0.1, TensorFlow.js 3.21.0: J, T Basic Pitch.
- 22,050 Hz mono: T Basic Pitch, Input handling.
- Defaults 0.5, 0.3, 11 frames. README 0.25, 0.25, 5: T Basic Pitch, What.
- 50 ms and 50 cents: T Basic Pitch ("gtr-eval `notes`").
- S1: 64 notes, 61 of 62 (e0669). 115 notes, 60 of 62 (e0671): T table, E e0669 and e0671 (`n_est`, `n_matched_onset_only`).
- S2n: 136 notes, 90 of 90, melody 42 of 42, bass 48 of 48 (e0840). 267 notes, 90 of 90 (e0844): T table, E e0840 and e0844.
- Extra notes, `n_est` minus matched: 64 - 61 = 3 (e0669), 115 - 60 = 55 (e0671), 136 - 90 = 46 (e0840), 267 - 90 = 177 (e0844).
- Median 10.4 ms (S1), 8.1 ms (S2n): T Basic Pitch.
- `Error: Unknown dtype undefined`: T table. `No matching export`: T output format facts.
- Excerpt: `samples/basic-pitch-browser/S1_tfjs-webgl_pydefault.csv`, lines 1 to 4. Known 66, 66, 67 at 1.667, 2.083, 2.500 s: T Basic Pitch.
- 160.6 s, 103.1 s, 157.7 s, load 62, 55, 53 and 34 ms (r0270): T table.
- Rerun on `cpu` 72.3 s (r0451): T re-run table.
- Hints: T Basic Pitch, Constraint inputs. Handoffs: S Handoff facts 3 and 4.

Basic Pitch ONNX model
- 230,444 bytes, 43,844-sample windows, `onnxruntime-web` 1.31.1, `ort.wasm.min.mjs`, `numThreads` 1 or 2, `?coi=0`: T Basic Pitch.
- Identical note lists, 4 cells in the fourth decimal: T Basic Pitch.
- S1 64 notes, 61 of 62 (e0808). S2n 136 notes, 90 of 90 (e0828): T table, E.
- 1.93/7.86 s, 1.84/9.92 s, 2.08/6.31 s, S2n 3.11/8.36 s and 1.22/6.53 s: T table (r0270).
- Rerun 1.23 s and 4.40 s (r0451): T re-run table.

browser-timing-check.html
- 62 S1 notes, fundamental plus 4 harmonics, 22,050 Hz: T "Measuring page".
- Button names: F step list 1. 15 or 61 s: T "Measuring page", F.
- `scripts/test_foraaron.mjs`, 23 jsDelivr files for the metronome and model parts: T "Measuring page" (r0271), F ("23 jsDelivr files, then 21 files from jsDelivr and raw.githubusercontent.com"), `samples/for-aaron-page/test_in_headless_chromium.json` (23 `external` entries, all cdn.jsdelivr.net). 21 files for the ONNX part (r0313): F, `samples/for-aaron-page/test_onnx_section.json` (21 `external` entries: 20 cdn.jsdelivr.net, 1 raw.githubusercontent.com), all `cached`.
- Checkbox labels `audible` and `also run the CPU backend (slower)`: F steps 4 and 5.
- 15 s and 30 clicks, idle 0 ms, setInterval 9.57 ms, busy look-ahead 3 late and 9.52 ms, setInterval 40.68 and 102.63 ms, Tone.js 3 late and 29.84 ms, AudioWorklet 0 ms: T "Measuring page" (r0271).
- 62 notes, 62 of 62, 50 ms: T "Measuring page".
- ONNX 62 of 62, quote `navigator.gpu.requestAdapter() gave no adapter` (r0313), r0310 unverified: T "Measuring page".
- 272.2 s (r0271), 139.4 s, 3.70 s, 6.08 s (r0313): T "Measuring page", L.
- Item 1: F.

Cross-origin isolation
- Header values: T "How the trials were run". `crossOriginIsolated` true, SharedArrayBuffer (r0042): T probe.
- Threads 1 or 2, then 1: T Basic Pitch (r0270). core-mt in an isolated page (r0314): T ffmpeg.wasm.
- `credentialless`, YouTube embed unverified: S section 7 (MDN: the `Cross-Origin-Embedder-Policy` header "with the directive `require-corp` or `credentialless`").

demucs-web
- 1.0.2: J. 180,534,758 bytes: T demucs-web.
- `executionProviders: ['wasm']`, `ort.env.wasm.numThreads` 2 or 4, 441,000 samples: T demucs-web.
- SI-SDR 8.92, 6.25, 5.25, 6.40 dB. SIR 22.28, 21.03, 8.73, 13.57 dB (e1223): T demucs-web table, E e1223. Definitions: `samples/demucs-web/t2_stems.gtreval.json` (`definitions`).
- Voice Oohs lead line, standing in for a singer: I S4 ("lead line on Voice Oohs (program 53) standing in for a singer"). Pairing `other` = guitar, `vocals` = lead: T demucs-web.
- 3.23 s, 55.6 s, 3.93 s, 117.1 s (r0329), identical stems unverified: T demucs-web.
- 22,050 Hz mono for Basic Pitch: S Handoff fact 14. 4-stem model with no guitar stem: S section 50 (the 6-stem variant adds guitar).

essentia.js
- 0.1.3, MTG-UPF: J, S section 34. Calls: T essentia.js.
- S3 37 beats, 30 of 32, median 38.7 ms (e0906): T table, E e0906 (`n_est` 37, `n_matched` 30).
- S4 74 beats, 67 of 68, median 28.5 ms (e0920): T table, E e0920 (`n_matched` 67).
- S1 70 beats, 64 of 64, median 7.8 ms (e0936): T table, E e0936 (`n_est` 70, `n_matched` 64).
- 95.61, 115.61, 143.87 BPM (e0910, e0923, e0933): T table.
- G major, D major, D major (e0913, e0926, e0931), `key_key` C major: T essentia.js.
- Derived, chords: root 0.782142 x 24.0 s = 18.77 s (e0916), 0.742572 x 38.741383 s = 28.77 s (e0929). The root comparison leaves out only `X` segments (gtr-eval definition in `samples/essentia-js/S3_chords.gtreval.json`), and neither `S3.chords.lab` nor `S4.chords.lab` in `/home/user/gtr/inputs/` has one, so the whole span counts. 38.7 s rounds 38.741383 s.
- Derived, PitchMelodia: 0.881098 x 2624 = 2312 of 2,624, 0.066667 x 360 = 24 of 360 (E e0938).
- PitchMelodia frame i placed at i x 128 / 44100 s, and "whether frame i belongs at i x hop or half a frame later was not checked": T essentia.js, What. J essentia.js `unverified`.
- Excerpt: `samples/essentia-js/S3_chords.lab`, lines 1 to 3.
- 2.90 s, 197 ms, 2.15 s, 69 ms, 148 ms, 4.44 s, 10.62 s, 6.87 s (r0314): T essentia.js. Rerun 1.92 s and 6.21 s, byte-identical (r0451): T re-run table.

ffmpeg.wasm
- 0.12.15, cores 0.12.10, FFmpeg 5.1.4: J, T ffmpeg.wasm.
- 2,368,626 bytes in, 3,178,792 bytes, 794,624 frames, 3,456,208 bytes, 863,978 frames, 44.1 and 48 kHz: T ffmpeg.wasm.
- ffmpeg 6.1.1, 99.990 % and 99.989 % of the int16 samples identical, the rest differ by 1 ("largest difference 1"): T ffmpeg.wasm, with the verifier's rerun. The lane gives no count of identical samples, so the shares stay as measured figures.
- 357/494 ms, 427/426 ms, 1,396/373 ms (r0314): T ffmpeg.wasm. Rerun 516 ms, byte-identical (r0451): T re-run table.
- `-ac 1 -ar 22050`: S Handoff fact 12.

js-synthesizer
- 1.13.0, `libfluidsynth-2.4.6.js`: J, T reference playback.
- `FluidR3_GM.sf2` 148,398,306 bytes: T reference playback (SpessaSynth row, the same file).
- 46 found, 46 of 48 (e0428): T table, E e0428. 46 of 48 on the original render (e0429): T reference playback.
- 0.99908, FluidSynth 2.3.4: T reference playback, cross-correlation bullet ("normalized peak"). smplr 0.650 and soundfont-player 0.648 ("normalized peak 0.650 and 0.648"), SpessaSynth -0.229: the same bullet. The checking agent's reruns gave 0.99855, 0.6494 (0.6496 originally), 0.6482 and -0.229: T re-run table.
- 2.18 s (r0225), rerun 1.26 s (r0441): T table and re-run table.

Mediabunny
- 1.65.2, 539 and 540 frames, 12 of 12, frame k-1 in 10: T Mediabunny section.
- 712.8 ms, 1.32 ms, 1,078.7 ms, 2.00 ms, 7 to 337 ms (r0314): T Mediabunny. Rerun 809 ms (r0451): T re-run table.
- `Math.round(timestamp * 1000)`: J Mediabunny `handoffs_out`, S Handoff fact 10.

MediaPipe Tasks Vision
- 1.2.2, `hand_landmarker.task` float16 7,819,105 bytes: T MediaPipe. `runningMode` "VIDEO", `numHands` 2, `delegate` "CPU" or "GPU": T MediaPipe, What.
- 21 points: T MediaPipe output format facts.
- R3a CPU 539 frames, 1, 420, 118, "Left" 420, "Left"+"Left" 62, "Left"+"Right" 56: T MediaPipe table.
- GPU 60 frames, 53 and 7, same count in 52 of 60: T MediaPipe.
- R3b 150 frames, 5 and 145, "Left" 145. R3c 150 of 150, "Left"+"Right": T MediaPipe table.
- `https://odml.pa.googleapis.com/v1/log`, r0314, none in r0329: T MediaPipe Network.
- 293.5, 3,480.7, 198.7, 148.1 ms: T MediaPipe table. Rerun 192.7 ms, 4 decimals (r0451): T re-run table.

ONNX Runtime Web
- 1.31.1: J. Threads 1, 2, 4: T Basic Pitch and demucs-web.

Output latency figures
- 0.01 s, 0.032 s after 3 s, 0.02322 s and 0.072 s, 0.031183 s (r0042): T probe. 0 after `resume()` in r0143 and r0150: T probe ("read right after `resume()` it was 0 in r0143 and r0150"), J Output latency runs r0143 and r0150 (`outputLatency_s_after_resume` 0), `samples/web-audio-sync/*.result.json` (`outputLatency` 0).
- `getOutputTimestamp()` read by the probe: `samples/chromium-probe/probe_headless_shell.json`, `audio.outputTimestamp` (`contextTime` 2.9700330000000004, `performanceTime` 3138.840000000084), r0042. Logged by both S4 sync pages: `samples/web-audio-sync/sync_s4_buffer_busy0.result.json` and `sync_s4_element_busy0.result.json`, `clock_log_columns` (`getOutputTimestamp.contextTime s`, `getOutputTimestamp.performanceTime ms`), r0143 and r0150. Every 50 ms: T sync ("Every 50 ms the page also logged"). The draft's "wasn't read" was wrong.
- 7.53 s pinned: L r0042, T "Run ids".
- Quote `the browser may ignore the option`: S section 3.

peaks.js
- 4.0.0, S4 38.7 s: T waveform views.
- Scale 128 asked, 512 returned, 3,337 and 19,680 points, 44,100 Hz, 1 channel: T waveform views. Rerun the same (r0451): T re-run table.
- 325 ms, 1,398 ms (r0329): T waveform views.

pitchfinder
- 2.3.4, 2048-sample frames every 441 samples (10 ms), `YIN({sampleRate: 44100})`: T "More small libraries".
- Derived, S1: 0.83689 x 2624 = 2196 of 2,624, 0.997222 x 360 = 359 of 360 (E e1228).
- Derived, R1b: 0.3017 x 1823 = 550 of 1,823, 0.993699 x 1111 = 1104 of 1,111 (E e1229).
- Excerpt: `samples/small-js-libs/S1_pitchfinder_yin_first300.csv`, lines 1 to 3.
- 6.97 s, 7.58 s (r0329): T "More small libraries".

pitchy
- 4.1.0, 2048 frames every 10 ms, calls: T "Small JavaScript analysis libraries".
- Derived, S1 no threshold: 0.936738 x 2624 = 2458 of 2,624, 0.466667 x 360 = 168 of 360, voicing recall 1.0 x 2624 = all 2,624 (E e1192).
- 0 Hz for some frames: `samples/small-js-libs/S1_pitchy_first300.csv` has `0.000` Hz with clarity `0.0000` in rows 1 to 13 (0.023 to 0.143 s, before S1's first note at 1.667 s) and in 162 of its 299 rows. SOURCES DISAGREE: T "Small JavaScript analysis libraries" says "pitchy gives a frequency for every frame, so without a threshold every frame counts as voiced". The saved CSV and e1192's counts (`n_est_voiced_frames` 2792 of `n_frames` 2984, = 2,624 + 168) say otherwise, so the fragment follows the saved files and drops "every frame has a pitch".
- pitchy's README claim ("aims to be fast and accurate enough to be used in real-time applications such as tuners", S section 44) is left out, as a makers' claim not needed here.
- Derived, S1 clarity 0.9: 0.330556 x 360 = 119 of 360, 0.889101 x 2624 = 2333 of 2,624 (E e1200).
- Derived, R1b: 0.777839 x 1823 = 1418 of 1,823 (E e1201, the same in e1202), 0.758776 x 1111 = 843 of 1,111 (e1201), 0.157516 x 1111 = 175 (e1202).
- 1.09 s, 2,979 frames, 0.68 s (r0329): T pitchy.
- Tuning offset in cents: S Handoff fact 19.

playbackRate and preservesPitch
- 0.5 and 0.75, ratios 1.99978, 1.33276, 1.33333, cents -1.13, -1.16, -498.05, 62 of 62, 62 of 62, 0 of 62, median -499.36: T slow-practice table.
- Pyin column not rechecked: T slow-practice verifier note ("the pyin column was not recomputed") and "Still UNVERIFIED". The same caveat is now on all four slow-down entries: J SoundTouchJS and rubberband-wasm `unverified` say so, and the T note covers the whole table, Signalsmith included.
- Rerun the same span, 35.8954 s (r0441): T re-run table.
- 59.629 s and 39.761 s (r0225): T slow practice, Runs.

realtime-bpm-analyzer
- 5.6.1. 96 (count 9, confidence 0.206), 97, 110 (e1232). 116 (count 36, confidence 0.257), 155, 93 (e1235). R2 144 (count 11), 96, 143: T "More small libraries" table.
- 77 to 179 ms (r0329): T "More small libraries".

requestVideoFrameCallback
- MP4: 539 callbacks for 540 frames, +1 each, 539 of 539, `mediaTime` plus 0.5 ms (r0157): T video section.
- WebM: 536 then 537 callbacks, stepped by 2 twice, 537 of 537 (r0156): T video section.
- Seeks: WebM 24 of 24, MP4 start 2 of 12 and 10 of 12, mid 12 of 12: T video section.
- Rerun 539 of 539, same 24 seek frames (r0433): T re-run table.
- 33.46 ms, 1.27 ms: T video section.
- `mediaTime` x 1000 for MediaPipe: S Handoff fact 9.

rubberband-wasm
- 3.3.0, `rubberband_new(44100, 2, 0, 1/rate, 1.0)`, 1024-sample blocks: T slow practice.
- 2.00004, +0.09 cents, 62 of 62, 1.33361, +0.05 cents, 61 of 62, 1199.36 cents: T slow-practice table.
- Peaks 0.855 and 0.886, input 0.891: T slow practice, Peaks.
- 2,959 ms, 2,163 ms, 17 and 13 ms (r0314): T slow practice. Rerun 3,761 ms, byte-identical (r0451): T re-run table.

Signalsmith Stretch
- 1.3.2, `suspend(256 frames)`, r0170 silence unverified: T slow practice.
- 2.00483, +3.28 cents, 62 of 62, 1.33396, +2.68 cents, 62 of 62, peaks 1.105 and 1.185, input 0.891: T slow-practice table and Peaks.
- 2,112 ms, 1,357 ms (r0314), rerun 2,439 ms (r0451): T slow practice, re-run table.
- Quote `time-stretching sounds best for more modest changes (between 0.75x and 1.5x)`: S section 23 (repository README).

smplr
- 1.2.0, `acoustic_guitar_nylon-ogg.js` 2,158,023 bytes, calls, `dist/index.mjs`, `dist/index.js`, `module is not defined`: T reference playback table and Failures.
- 46 found, 46 of 48 (e0533), median 14.75 ms, 14.67 ms on the original render (e0429): T reference playback.
- Rerun 48 found, 2 extra (r0441): T re-run table.
- 0.74 s (r0229): T table.

soundfont-player
- 0.12.0, `acoustic_guitar_nylon-mp3.js` 1,837,439 bytes, calls, `Network Error`: T reference playback table and Failures.
- 49 found, 48 of 48 (e0540), median 14.74 ms, 1.47 s (r0229): T table.

SoundTouchJS
- 0.3.0, calls: T slow practice.
- 2.00203, -2.12 cents, 62 of 62, 1.33322, -1.08 cents, 62 of 62, 0.41 s and 0.29 s shorter: T slow-practice table and lengths note.
- 195 ms, 172 ms (r0314), rerun 283 ms (r0451): T slow practice, re-run table.

SpessaSynth
- 4.4.7 and core 4.4.9, calls: T reference playback table.
- 46 of 48 (e0427), median 13.80 ms, -0.229, 1.79 s (r0225): T reference playback.

TensorFlow.js
- 3.21.0 installed, 4.22.0 newest: T Install, J.

Tone.js
- 15.1.22, calls, `lookAhead` 0.1 s, `updateInterval` 0.05 s, `clockSource` "worker": T metronome, method (c).
- Correction of 128 frames, 2.902 ms: T metronome correction paragraph.
- Idle 0 of 122. Busy 7 of 122, 0.227 to 2.268 ms. Raw mean 2.195 ms and largest 5.170 ms (r0199): T metronome table and correction paragraph.
- Rerun 11 off, 10.249 ms (r0433): T re-run table. Measuring page 3 late, 29.84 ms (r0271): T "Measuring page".

wavesurfer.js
- 8.0.5, `height: 100`, `width: 1000`, `maxLength: 1000`, 8000 Hz, 80 of 80 over 8 s: T waveform views.
- 704 ms, 1,315 ms, 215 ms (r0329): T waveform views. Rerun the same (r0451): T re-run table.
- `setTime(ms / 1000)`: S Handoff fact 17.

Web Audio clock and look-ahead scheduling
- 25 ms loop, 100 ms ahead, `setInterval(500 ms)`, 122 clicks: T metronome methods (a), (b).
- 10 ms click on 68 beats: T sync.
- Look-ahead idle 0 of 122, busy 11 of 122, largest 42.132 ms, all 11 scheduled late (r0199): T metronome table.
- Rerun 8, 61.769 ms on the first click (r0433): T re-run table.
- setInterval idle 5 of 122 more than 5 ms off, 42.630 ms, busy mean 30.724 ms and largest 91.202 ms: T metronome table.
- Same clock 68 of 68, 0 to 0.023 ms (one sample), S4's sample 0 at the scheduled frame (r0143), rerun the same (r0433): T sync, re-run table.
- Element 68 of 68, 0 to 2.789 ms, median 0.023 ms, +2.00 ms over 38.29 s (r0150): T sync.
- 44.2 s and 46.5 s: T "Run ids" (r0143, r0150).
- Hands off as `start(when)` at the song's start plus each beat time: T sync, r0143 ("all 68 clicks scheduled up front at start + beat time"). S Handoff facts 7 and 8 add the start offset and, at a slowed rate, divide by the rate (the playbackRate entry already says click times have to be worked out for the slower tempo).

web-audio-beat-detector
- 8.2.39. S3 96.650, 97, 0.1439 s (e1196, e1197): T table. Grid of 39 beats, 22 of 32: E e1197 (`n_est` 39, `n_matched` 22).
- S4 115.970, 116, 0.0278 s, every matched beat +27.8 ms (e1198, e1199): T table. 75 beats, 68 of 68: E e1199 (`n_est` 75, `n_matched` 68).
- R2 143.474, 143, 0.0968 s, 72 bpm not checked: T table.
- 73 to 226 ms (r0329): T pitchy and beat-detector section.
- Quote `By default the bpm are expected to be between 90 and 180 bpm.`: T pitchy and beat-detector section (README).
- `start(t0 + offset + n * 60 / bpm)`: S Handoff fact 7.

WebCodecs
- W3C Working Draft, 9 November 2026: J. Codec results and `description is required` (r0042): T probe. 7.53 s: L r0042.

What didn't run
- Quote `also works and gives identical results, at roughly 12× the wall clock`: J, the `Beat This!` ONNX record's `not_run_reason`, S section 51.
- Superpowered quotes `is offered for internal, private experimentation and R&D purposes (eg PoC) only and does not allow for public release` and `Superpowered is sunsetting`, struck reason: T "Survey tools not tried", S section 26.
- Transformers.js quote `start no new download or install over 200 MB unless your lane cannot finish without it`, 4.3.2, 144,895,056 bytes, 301,068,136 bytes: T "Survey tools not tried".
- WebNN, Chrome 112 behind a flag: S section 8, J.
- webnn/stem-separator about 168 MB: T "Survey tools not tried". Card quote `running entirely client-side via ONNX Runtime Web with WebNN (NPU/GPU) acceleration, cascading to WebGPU/WASM`: S section 50. "So a WASM run would not need a GPU" is the checking agent's reading: T "Survey tools not tried" (verifier note) and Verification log ("its card says it falls back to WASM, moved out of "No GPU""). No reason for not trying it is recorded: J `not_run_reason` says "Not tried (trials.md)" and adds "(disk notice on the shared box)" after the weight size, which is not stated as the reason.
- "my agents' notes don't say why": J `not_run_reason` gives only "Not run here (survey.md section 50)" or "section 53" for demucs-js, free-music-demixer, Ghilda/htdemucs-onnx, libav.js, libavjs-webcodecs-polyfill and sevagh/demucs.onnx, and "Not tried" for the YouTube iframe player API. S sections 50 and 53 say "Not run here." with no reason. YouTube's terms "covered by the hosted-apis lane": S Handoff fact 16, J.
- Superpowered: J `not_run_reason` ("Not tried in this session ... The trial report's reason 'Needs a licence key for anything beyond evaluation' was marked by the verifier as not supported by the sources on record") and T verifier note.
- FluidSynth 2.3.4: J FluidSynth `not_run_reason`, I.
- Items 1 to 4: F step lists 1 to 4.
- Every other reason: J `not_run_reason` of each record.
- 67 lines in the list: counted after the edit (100 entries minus the 33 that gave output, WebGPU included as tried with no adapter).

Licenses (all quotes as in S, each section)
- alphaTab MPL-2.0 section 3.2 quote and LICENSE URL: S section 15, J. Sonivox Apache-2.0: S section 15.
- aubio GPL-3.0 COPYING first line: S section 46.
- Basic Pitch Apache-2.0, no separate weights license, training sets per the paper, MAESTRO quote, READMEs silent on weights: S section 33, J.
- Basic Pitch ONNX, Python repository Apache-2.0: S section 33.
- demucs-web MIT, no weights license (no model card), fork quote, MUSDB18-HQ quote, 800 songs: S section 50, J.
- essentia.js AGPL-3.0 section 13 quote, licensing-page quote (its spelling "comercial" kept): S section 34.
- ffmpeg.wasm license fields and FAQ quote, `--enable-gpl`: S section 38, T ffmpeg.wasm.
- js-synthesizer BSD-3-Clause and the README's LGPL v2.1 sentence: S section 30. FluidR3_GM MIT: S section 27, I.
- Mediabunny MPL-2.0 and README quote: S section 19.
- MediaPipe Apache-2.0, model card quotes: S section 36, J.
- peaks.js LGPL-3.0 section 4 quote: S section 17.
- pitchfinder `"license": "GNU v3"`, no license file: S section 45.
- rubberband-wasm `GPLv2` and README quote: S section 24.
- smplr MIT without a file, gleitz CC BY 3.0 and MusyngKite CC BY-SA 3.0 quotes, FluidR3_GM MIT: S section 27.
- SoundTouchJS LGPL-2.1 first line: S section 22.
- Every other license name: J `license` of each record and S sections 9, 16, 23, 28, 29, 35, 39, 44, 47, 48. Web features "no licence to accept": S sections 1 to 8, J.

Pending media
- Durations and sizes: `ffprobe` and `stat` on each file, 2026-11-10. They match T "Media kept outside git" where it lists them (for example 13,899,820 bytes and 39.398 s, 1,483,820 bytes and 8.411 s).
- 17.07 s and 2.902 ms for the Tone.js file: T metronome correction paragraph.
