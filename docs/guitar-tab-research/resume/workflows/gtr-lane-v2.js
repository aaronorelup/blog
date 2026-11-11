export const meta = {
  name: 'gtr-lane',
  description: 'Guitar tab research, one lane: try the tools and read the docs and licenses, verify both against sources, then structure the facts',
  phases: [
    { title: 'Research', detail: 'try-<lane> runs the tools, docs-<lane> reads docs, formats and licenses (Opus 5.5, max)' },
    { title: 'Verify', detail: 'independent check of trials against ledger and files, and of every license quote against its URL (Opus 5.5, max)' },
    { title: 'Structure', detail: 'tools.json for the handoff graph', model: 'claude-sonnet-5-5' },
  ],
}

const OPUS = 'claude-opus-5-5'
const SONNET = 'claude-sonnet-5-5'
const laneName = (args && args.lane) || ''

const LANES = {
  'audio-to-notes': {
    title: 'audio to notes or MIDI, and melody extraction',
    tools: `Spotify Basic Pitch (the Python package and the model files it ships; basic-pitch-ts belongs to the browser lane); CREPE and torchcrepe; pYIN (librosa.pyin); PESTO; RMVPE; FCPE (torchfcpe); SwiftF0; aubio (aubio pitch, aubio notes); Essentia (PredominantPitchMelodia, MultiPitchKlapuri, PitchYinProbabilistic, its CREPE TensorFlow models); the MELODIA Vamp plugin; MT3 (Google Magenta); YourMT3+; MR-MT3; Onsets and Frames; ByteDance piano_transcription_inference; Transkun; hFT-Transformer; Timbre-Trap; Omnizart (music and vocal modules); NeuralNote; Sheet Sage. Guitar-specific audio-to-tab models belong to the guitar-tab lane.`,
    tryNotes: `- Clips: S1 (single melody: every monophonic f0 tracker and every note transcriber), S2n and S2s (two-voice polyphony: note transcribers; also the monophonic trackers, to record what they return on polyphony), S3 (strummed chords), the S4 mix and S4/stems/guitar.wav and lead.wav (melody from a mix versus from the isolated stem), R1a-c (real guitar with note truth), R2 (real band excerpt, no truth: keep the output only), R3a audio (real fingerstyle, no truth).
- Basic Pitch: the CLI and the Python predict() call. Record its options (onset threshold, frame threshold, minimum note length, minimum and maximum frequency, multiple pitch bends, melodia trick) and its outputs (MIDI, the note-events CSV columns, the model-output file). Run the defaults, then once with the frequency range limited to the guitar's range (E2 at 82.4 Hz up to about 1319 Hz), so the effect of a range constraint is on record. Note which backend ran (TFLite, ONNX, TensorFlow, CoreML) and on which Python versions it installs.
- Monophonic trackers give frame-wise f0 (time, Hz, confidence), not notes. For each: record the hop size, range settings and confidence field, score with gtr-eval f0, and record what extra step turns frames into notes. If the tool has its own note segmenter (aubio notes, a pYIN note tracker), run that too and score with gtr-eval notes.
- Multi-instrument transformers (MT3, YourMT3+, MR-MT3): try on CPU with a 20 to 30 s clip. If a model has an official public demo Space on Hugging Face, calling it through gradio_client with a shared clip also counts as a trial: record that it ran on the Space's hardware (read it from the Space API), not here.
- Piano-trained models (Onsets and Frames, ByteDance, Transkun, hFT-Transformer): run one or two on the guitar clips and report what comes out, stating plainly that the weights were trained on piano.
- Omnizart needs old TensorFlow: give it one attempt on an old Python and move on if it will not install.
- Save a piano-roll picture (estimate over truth) for a few runs as PNG under samples.
- Put MIDI outputs where other lanes can use them: /home/user/gtr/lanes/audio-to-notes/out/<tool>/<clip>.mid`,
    docsNotes: `- Check separately, for each model, the code license and the weights license, and what data the published weights were trained on (piano models and MAESTRO; multi-instrument models and Slakh2100, MusicNet, GuitarSet, URMP, Cerberus4): look up each dataset's license and quote it.
- Essentia and its pretrained models have their own terms. The MELODIA plugin has its own license. For Basic Pitch check the license of the model files shipped inside the package. Do not assume any of these: read them.`,
  },
  'chords-beats-key': {
    title: 'chord recognition, tempo, beat and downbeat detection, key and tuning detection',
    tools: `Chords: Chordino and NNLS Chroma (Vamp plugins), madmom (CNN and deep-chroma chord recognisers), autochord, chord-extractor, BTC (Bi-directional Transformer for Chord recognition), CREMA, lv-chordia and ChordMini, Essentia ChordsDetection, Omnizart chord, Harmony Transformer. Beat and tempo: madmom (beat, downbeat, tempo), librosa, Beat This!, BeatNet, All-In-One (allin1), Essentia (RhythmExtractor2013, TempoCNN), aubio tempo, tempo-cnn, Beat Transformer. Key and tuning: librosa estimate_tuning and pitch_tuning, Essentia KeyExtractor and TuningFrequency, madmom key, libKeyFinder and keyfinder-cli, S-KEY, music21 key analysis on symbolic notes. Also anything that detects a guitar's open-string tuning or capo position from audio.`,
    tryNotes: `- Clips: S3 (chord, tempo and key truth), the S4 mix (chords, beats, downbeats, tempo, key truth), S2n and S2s (beats and key truth on fingerstyle), S7flat30 (truth: 30 cents flat; run the tuning-offset estimators, and record whether chord and key outputs change against S3), S5capo2 and S5dropd (key and lowest-pitch facts), R1a-c (GuitarSet chords, beats, tempo, key annotations), R2 and R2full (real song, no truth; R2full gives whole-song runtimes).
- Score with gtr-eval chords, beats, tempo, key and tuning.
- madmom: the PyPI release is old; installing from the git repository on Python 3.10 or 3.11 is the usual route. Record what worked. Run its beat tracker, downbeat tracker, tempo estimator, both chord recognisers and the key recogniser.
- Chordino / NNLS Chroma is a Vamp plugin: try the Python packages that bundle or wrap it (chord-extractor, autochord, vamp), or sonic-annotator with the plugin binary, or a source build. Record which route worked.
- Beat This!, BeatNet, All-In-One (it runs Demucs first, so its runtime includes separation: say so), librosa, Essentia (essentia and essentia-tensorflow wheels: check which Python versions they exist for), the aubio CLI (already installed), tempo-cnn.
- Key: Essentia KeyExtractor (note its profile option), madmom, libKeyFinder if it builds, S-KEY, and a plain chroma plus Krumhansl-template estimate written in a few lines with librosa, labelled as a baseline you wrote.
- Tuning offset: librosa.estimate_tuning and Essentia TuningFrequency on S7flat30 (truth -30 cents) and S3 (truth 0).
- Open-string tuning and capo: on S5dropd and S5capo2 record what the existing tools give that bears on it (lowest detected pitch, estimated key) and nothing more. If the docs agent finds a tool that claims to detect guitar tuning or capo from audio, try it.
- Record output formats exactly: beat times in seconds? tempo as BPM with a confidence? chord labels in which vocabulary (major and minor only, sevenths, slash chords)? what time resolution?`,
    docsNotes: `- madmom's code and its bundled model files carry different licenses: quote both. Check the same split for Essentia, BeatNet, Beat This!, All-In-One, BTC, CREMA, autochord and Chordino (plugin license, and whether its binaries may be redistributed).
- Record each chord tool's vocabulary (how many chord types) and time resolution, and each beat tool's outputs (beats, downbeats, tempo, time signature).
- For guitar tuning and capo detection from audio, search the literature and code and report what exists, with links.`,
  },
  'source-separation': {
    title: 'source separation and stem isolation',
    tools: `Demucs v4 (htdemucs, htdemucs_ft, htdemucs_6s with its guitar and piano stems, mdx_extra); Spleeter; Open-Unmix (umxhq, umxl); python-audio-separator and the UVR model zoo (MDX-Net, MDX23C, VR Arch, BS-RoFormer, Mel-Band RoFormer, SCNet); ZFTurbo's Music-Source-Separation-Training; Banquet (query-based); AudioSep (text-queried); Meta SAM Audio; librosa HPSS; demucs.cpp and in-browser Demucs builds; any model that isolates guitar specifically (acoustic, electric, lead and rhythm). Hosted separation services belong to the hosted-apis lane.`,
    tryNotes: `- Clips: the S4 mix with S4/stems as truth (score with gtr-eval stems; note which estimated stem the synthetic lead instrument lands in), R2 (real band excerpt, no truth: keep the stems), R2full (whole-song runtime for two or three models, once with gtr-run --all-cores for a whole-box figure), S6taps (guitar plus percussive taps with truth stems: what do band models put in drums, and what does HPSS give), S2s and R3a audio (a single guitar: what a 4-stem and a 6-stem model output for solo guitar; report the RMS level of each stem).
- Demucs v4: htdemucs, htdemucs_ft, htdemucs_6s. Record the options --two-stems, --shifts, --overlap, --segment, -j, --mp3, --float32. Note any audio loading or saving problem with current torchaudio versions and the fix used.
- Spleeter (old TensorFlow: try an older Python), Open-Unmix, python-audio-separator (save its model catalogue listing as a sample; try one model of each architecture it offers, and any model whose name or stems mention guitar), ZFTurbo's training repo with a published RoFormer checkpoint if a CPU run is feasible.
- CPU runtime of the large RoFormer models may be long: measure on a 10 to 30 s clip. Do not extrapolate to song length unless you say it is an extrapolation and show the arithmetic.
- librosa HPSS (default and with margins) on S6taps and S2s.
- AudioSep, Banquet, SAM Audio: check whether weights download without a login and whether a 10 s CPU run is feasible. Otherwise NOT RUN HERE, with the evidence.
- demucs.cpp: try a CPU build and one run if it builds in reasonable time.
- Save estimated stems under /home/user/gtr/lanes/source-separation/out/<model>/<clip>/ so other lanes can transcribe them.
- For each model record: stem names, output sample rate, channels, bit depth or float, and whether length and alignment match the input sample for sample (check it).`,
    docsNotes: `- For every published checkpoint record what data it was trained on and that data's license (MUSDB18, MUSDB18-HQ, MoisesDB, internal or private data, as the authors state), separately from the code license.
- For the UVR and audio-separator model zoo, record where each model family comes from and what license statement, if any, accompanies the weights.
- Record which models offer a guitar stem or other stems beyond the usual four.
- For SAM Audio, AudioSep and Banquet: gating, license name and the clauses on commercial use.`,
  },
  'guitar-tab': {
    title: 'guitar-specific transcription: string and fret assignment and tab generation',
    tools: `Audio to tablature or guitar notes: TabCNN, FretNet, guitar-transcription-with-inhibition, amt-tools, the high-resolution guitar transcription model (Riley, Edwards and others), the GAPS model, SynthTab-pretrained models, TART, and newer ones. Notes or MIDI to string and fret: tuttut, tayuya, Fretting-Transformer, MIDI-to-Tab (Edwards and others), other MIDI-to-tab libraries, LilyPond's automatic tablature. Supporting: PyGuitarPro, music21, DadaGP tooling. Datasets: GuitarSet, IDMT-SMT-Guitar, EGDB, DadaGP, SynthTab, GAPS, Guitar-TECHS, GOAT.`,
    tryNotes: `- Clips: S2n and S2s (string and fret truth), S5capo2 and S5dropd (constraint truth), S3 (chords with string and fret truth), R1a-c (GuitarSet: real audio with string truth). Score with gtr-eval notes and gtr-eval tab.
- Family A, audio straight to tablature or guitar notes. First establish for each model whether pretrained weights are published at all. If only training code is published, record that as a fact with the link that shows it, and do not train on this CPU box; put it in for-aaron.md only if the paper shows training on a single 8 GB GPU is realistic. For models trained on GuitarSet, state what the authors say about train and test splits, because the R1 clips come from GuitarSet and may have been seen in training.
- Family B, notes or MIDI to string and fret. Run each tool on the truth MIDI of S2n, S3, S5capo2, S5dropd and R1a-c and score string and fret against the truth. Then run the same tools on notes transcribed from audio (use /home/user/gtr/lanes/audio-to-notes/out/ if it has MIDI for these clips, otherwise run Basic Pitch yourself), so both "perfect notes in" and "transcribed notes in" are on record.
- Constraints: for every tool find out and demonstrate which of these it accepts and how: tuning, capo, number of frets, maximum hand span, preferred position, a pinned string or fret for specific notes. Show a re-run on S5capo2 with and without telling the tool about the capo, and on S5dropd with and without the tuning. This is the app's "user corrections re-run the analysis" requirement, so record parameter names and outputs exactly.
- Formats: what each tool emits (ASCII tab, Guitar Pro, MusicXML, JAMS, JSON) and whether timing and rhythm survive. Writing a Guitar Pro 5 file from a tool's output with PyGuitarPro is fine where it is a few lines: say that it is your glue code.`,
    docsNotes: `- For each model record whether pretrained weights are published and where.
- Dataset licenses matter here: quote the license of GuitarSet, IDMT-SMT-Guitar, EGDB, DadaGP (and how access is granted), SynthTab, GAPS, Guitar-TECHS and GOAT, and say which released weights were trained on which.
- For MIDI-to-tab tools record the algorithm family only as the authors describe it, and every user-settable constraint.
- Also survey the research on audio-visual guitar transcription and on fingering estimation, 2019 to 2026, with links to code where it exists.`,
  },
  'fingerstyle-voices-taps': {
    title: 'fingerstyle on one guitar: separating melody, bass and percussive taps',
    tools: `Harmonic-percussive separation (librosa.effects.hpss, Essentia HPSS); onset detectors (librosa, madmom CNN onset and SuperFlux, aubio onset methods, Essentia OnsetDetection); drum and percussion transcription models pointed at guitar-body taps (ADTOF, Omnizart drum, other maintained drum transcribers); NMF decomposition (librosa.decompose); symbolic voice separation into melody and bass (music21, partitura voice estimation, published voice-separation models with weights); playing-technique detection for guitar; research on percussive fingerstyle transcription.`,
    tryNotes: `- Clips: S6taps with its stems and tap times (truth), S2n and S2s (truth voices: bass and melody), S5dropd, whichever GuitarSet excerpt is closest to fingerstyle, and R3 audio (real fingerstyle, no truth). If the shared set has no real recording with percussive body taps, say so and look for one freely licensed clip yourself (Wikimedia Commons, archive.org, freesound.org under CC0 or CC BY) and document it the way the manifest does.
- Taps: (1) harmonic-percussive separation at several margins: score the percussive part against S6taps/stems/taps.wav with gtr-eval stems, and run onset detection on it scored against the tap times with gtr-eval onsets --field taps. (2) Onset detectors on the full mix: report how many detected onsets match taps, match notes, or match neither. (3) Drum transcription models applied to the taps, and a band separator's drums stem (the source-separation lane may already have one under /home/user/gtr/lanes/source-separation/out/).
- Voices: (1) split the truth notes of S2 into bass and melody with existing tools (music21, partitura, any published voice-separation model with weights), plus two plain baselines labelled as baselines (a pitch threshold, and lowest note per onset). Report the fraction of notes given the right voice. (2) The same on notes transcribed from audio. (3) From audio directly: what a band separator's bass stem contains for a solo guitar, and a low-pass filter plus a monophonic f0 tracker on the bass register.
- Record for each method what it needs as input (audio, notes, onsets) and what it emits.`,
    docsNotes: `- Survey research and code for percussive fingerstyle guitar transcription (body hits, slaps, tapping) and its datasets; playing-technique detection on guitar (harmonics, slides, bends, hammer-ons, palm mutes); drum transcription models that could be pointed at body percussion; and symbolic voice or stream separation.
- For each: is code published, are weights published, and the license clauses.`,
  },
  'video-hands-fretboard': {
    title: 'video: hand and finger tracking, and fretboard detection',
    tools: `MediaPipe Hand Landmarker, Holistic and Pose; MMPose, RTMPose, RTMW and DWPose hand and whole-body models (also through rtmlib); Ultralytics YOLO pose and hand-keypoint models; OpenPose; 3D hand mesh models HaMeR, WiLoR and Hamba (and the MANO hand model they depend on); Segment Anything 2 and 3; open-vocabulary detectors (Grounding DINO, OWLv2, YOLO-World); OpenCV edge, line and homography methods for frets and strings; point trackers (CoTracker, TAPIR, TAPNext); Roboflow Universe fretboard datasets and models; published video-to-tab projects (TapToTab and others); datasets pairing guitar video with annotations.`,
    tryNotes: `- Clips: R3a now (640x480, the player is small in frame), and R3b and R3c when they appear (closer views; /home/user/gtr/inputs/READY-VIDEO marks them final). Read the manifest for what each shows, its frame rate and resolution. Because the hands are small in R3a, also run each hand tool on an upscaled crop around the hands and report both. If READY-VIDEO has not appeared by the time you are through R3a, find one freely licensed close-up of a fretting hand yourself (archive.org; a still photo from Wikimedia Commons is acceptable for the image-only tools) and document it the way the manifest does. There is no ground truth, so report measurable facts: the fraction of frames with one and with two hands detected, per-frame runtime and frames per second on 2 cores, landmark count and coordinate system, confidence values, handedness labels. Save a few annotated frames per tool as samples (WebP or PNG, 300 KB at most, 1280 px wide at most). Anything longer than a still stays in /home/user/gtr/lanes/video-hands-fretboard/out/.
- MediaPipe Hand Landmarker (current tasks API, VIDEO mode, 2 hands, world landmarks too) and the older solutions API if it still installs; Holistic or Pose for arm context.
- RTMPose, RTMW, DWPose: rtmlib (ONNX Runtime) is a light route if MMPose itself will not build on CPU in reasonable time. Record which route worked.
- Ultralytics YOLO pose, and any published hand-keypoint weights.
- Segment Anything 2 (tiny or small checkpoint): image mode on single frames prompted with a point or box on the neck, and video mode propagating a neck mask over about 30 frames on CPU. Record time per frame. For SAM 3 and other gated models record the gate as a fact.
- Open-vocabulary detectors through transformers or ultralytics, with prompts such as guitar neck, fretboard, capo, hand: record boxes and scores per prompt.
- OpenCV: on a neck crop, edge and line detection (Canny, HoughLinesP, LSD) for frets and strings. Report how many fret-like and string-like lines come out per frame and save the overlay. If a neck quadrilateral is available from SAM or a detector, rectify it with a homography and repeat.
- Point tracking (CoTracker, TAPIR or TAPNext) on a 2 to 3 s clip if a CPU run is feasible: track a few fretboard points and record the time.
- 3D hand mesh models: check whether the weights and the MANO model download without a login. If not, NOT RUN HERE with the evidence.
- Published video-to-tab projects: clone and run any that ship weights.
- One worked handoff on a single frame, as a fact about formats and not as a product: fingertip landmark pixel coordinates from one tool, mapped through a fretboard homography from another, to a (string, fret) cell. Label each step with the tool that produced it and say what was done by hand.`,
    docsNotes: `- Licenses differ sharply in this lane, so quote each: MediaPipe (code and model cards), OpenPose (its academic license and commercial terms), MMPose and the datasets its hand models were trained on, Ultralytics (AGPL and its enterprise license page), SAM 2 and SAM 3, HaMeR, WiLoR, Hamba and the MANO license, CoTracker, TAPIR and TAPNext, Grounding DINO, OWLv2, YOLO-World, and any Roboflow Universe dataset or model for fretboards (each has its own license field).
- Survey the research on video-based guitar transcription, fretboard detection and fingering from video (2006 to 2026), and which of it has code or weights.
- Record each tool's output: landmark count, coordinate system, confidence, handedness, 2D or 3D.`,
  },
  'web-tab-render': {
    title: 'tab rendering, editing and playback on the web, and the tab file formats',
    tools: `alphaTab (alphaTex, Guitar Pro import and export, its alphaSynth player); VexFlow and VexTab; OpenSheetMusicDisplay; abcjs; Verovio; MuseScore command line and webmscore; LilyPond tablature; TuxGuitar; PyGuitarPro; music21; the formats themselves (Guitar Pro 3/4/5, .gpx, .gp of Guitar Pro 7 and 8, MusicXML tablature, MEI, alphaTex, ASCII tab, ABC); open-source browser tab editors; ChordPro and chordsheetjs; chord diagram libraries (svguitar, vexchords); Tonal; Soundslice and Flat.io embeds.`,
    tryNotes: `- Inputs: the correct tabs in /home/user/gtr/inputs/ (S2n.gp5, S5capo2.gp5, S5dropd.gp5, and the .tab.txt, .mid and truth JSON files). Chromium and Playwright are pre-installed: require("playwright") works from any directory and chromium.launch() needs no options. Do NOT install Playwright or browsers again. Serve test pages from a local static server.
- alphaTab (npm @coderline/alphatab, current version): load S2n.gp5 in headless Chromium, render, screenshot. Write the same tab as alphaTex from the truth JSON and render that. Start its player and record which playback events it emits (position, beat, note) and their timing against the truth onsets. Try its metronome and count-in settings, its capo and tuning fields, transposition, and exporting back to a Guitar Pro file. Also load it under Node without a DOM and read the score model (tracks, staves, bars, beats, notes with string and fret): record what a program could read and write. Establish from the docs and the package whether alphaTab ships any editing UI.
- VexFlow (TabStave and TabNote) and VexTab; OpenSheetMusicDisplay with a MusicXML file that carries string and fret; abcjs tablature; Verovio with tablature input. For each: render the S2 tab if the library can, screenshot it, and record what input it needed.
- Converters run headless: MuseScore (apt has musescore3; a MuseScore 4 AppImage can be unpacked with --appimage-extract and run with QT_QPA_PLATFORM=offscreen) converting .gp5 to MusicXML, MIDI, PDF and PNG; LilyPond (apt) engraving a TabStaff from the truth notes, including which frets its automatic string choice picks compared with the truth; TuxGuitar if it has a headless convert mode; PyGuitarPro read and write; music21 to MusicXML with tablature.
- A format matrix measured by actually converting: which tool reads and writes which of Guitar Pro 3/4/5, .gpx, .gp, MusicXML with tab, MEI, MIDI, alphaTex, ASCII tab, ABC and LilyPond; and for each round trip whether string, fret, timing, tuning and capo survived (check with gtr-eval tab or by reading the file).
- Open-source editable tab editors for the web: build and open any maintained one in headless Chromium, add or change a note through its UI with Playwright, export, and record what worked.
- Chord diagram libraries and ChordPro tooling: render one example each.
- Screenshots go under samples as WebP or PNG (300 KB at most each).`,
    docsNotes: `- For each library record its license, whether it renders tablature, whether it plays audio, whether it offers editing or only rendering, and what input formats it reads.
- Record the SoundFont files each player ships or needs, and their licenses.
- For file formats record what is publicly specified (MusicXML tablature elements, MEI tablature, the Guitar Pro formats and which libraries parse which versions).
- For Soundslice and Flat.io record the embed and API terms.
- Look for open-source browser tab editors and record their state of maintenance.`,
  },
  'browser-audio-sync': {
    title: 'metronome, audio and video sync, playback and analysis inside the browser',
    tools: `The Web Audio clock with look-ahead scheduling; AudioWorklet; Tone.js Transport; alphaTab's metronome, count-in, backing track and sync points; wavesurfer.js and peaks.js; syncing to a video element (requestVideoFrameCallback, WebCodecs, Mediabunny); time-stretch for slow practice (playbackRate with preservesPitch, SoundTouchJS, Signalsmith Stretch, Rubber Band WASM); sample playback (smplr, soundfont-player, SpessaSynth, js-synthesizer); in-browser analysis: @spotify/basic-pitch (TensorFlow.js), essentia.js, ONNX Runtime Web, MediaPipe Tasks Vision, Transformers.js, ffmpeg.wasm, in-browser Demucs builds.`,
    tryNotes: `- Everything is measured in the pre-installed headless Chromium through Playwright (require("playwright") works from any directory; do NOT install Playwright or browsers). Headless Chromium has no sound card but Web Audio still runs: launch with --autoplay-policy=no-user-gesture-required and capture the audio inside the page (AudioWorklet, MediaStreamAudioDestinationNode or OfflineAudioContext) to measure what was actually scheduled. Say with every number that it was measured in headless Chromium on this 4 vCPU box with software rendering and no GPU. Check which codecs this Chromium build decodes (H.264 and AAC may be missing; the inputs include WebM copies) and record it. Run the Node driver scripts through gtr-run.
- Metronome timing: (a) clicks scheduled ahead on the AudioContext clock from a setTimeout look-ahead loop; (b) clicks started directly from setInterval callbacks; (c) Tone.js Transport; (d) clicks generated inside an AudioWorklet. For each: capture the output, find the click onsets to the sample, and report the deviation from the ideal grid (mean and max in ms) over at least 60 s, idle and with the main thread kept busy.
- Sync to a recording: play S4 and schedule clicks on its truth beat times (S4.beats.txt), once with the audio in an AudioBufferSourceNode (same clock) and once in an audio element. Measure the offset between click and beat in the captured mix, and the drift between HTMLMediaElement.currentTime and AudioContext.currentTime over the clip. Record baseLatency and outputLatency as reported.
- Video: requestVideoFrameCallback on an R3 clip (mediaTime and presentedFrames against the frame index), seek accuracy with currentTime, and frame-accurate decoding through WebCodecs (Mediabunny or a plain VideoDecoder) if this build supports the codec.
- Slow practice: playbackRate with preservesPitch on a media element, SoundTouchJS, Signalsmith Stretch, Rubber Band WASM: stretch S1 to 0.5x and 0.75x and report the output duration and the measured pitch of a known note.
- Reference playback of a tab: schedule the truth notes of S2n through smplr, soundfont-player, SpessaSynth or js-synthesizer, capture the audio, detect onsets and report the timing error against the truth. Keep the captured WAV in /home/user/gtr/lanes/browser-audio-sync/out/.
- Analysis in the browser: @spotify/basic-pitch on S1 and S2n with runtime, and notes scored by gtr-eval; essentia.js (beat, tempo, key, pitch, chords) on S3 and S4 scored by gtr-eval; ONNX Runtime Web running a real model with and without threads (threads need cross-origin isolation, so serve with COOP and COEP headers); MediaPipe Tasks Vision hand landmarker on frames of an R3 clip with ms per frame; ffmpeg.wasm pulling the audio out of an R3 file with runtime; an in-browser Demucs build on a 10 s clip if one exists and loads. Record model download sizes.
- Because these numbers come from a cloud box without a GPU, also write one self-contained HTML page under for-aaron/ in your docs folder (no build step, libraries from a CDN) that repeats the metronome timing test and one in-browser model test in Aaron's own browser and prints numbers he can copy back. Keep it a measuring page, not an app.`,
    docsNotes: `- Quote the relevant lines of the Web Audio API specification and MDN on the audio clock, AudioWorklet, baseLatency, outputLatency and getOutputTimestamp; the HTML specification and MDN on requestVideoFrameCallback and preservesPitch; WebCodecs support; and the cross-origin isolation requirement for WASM threads.
- For each library record its license, size, last release and what it does.
- For in-browser model runtimes record the backends (WASM, WebGL, WebGPU) and documented limits.
- Record alphaTab's documented sync features (metronome, count-in, backing track, sync points) with links.`,
  },
  'apps-survey': {
    title: 'existing apps that already do some of this',
    tools: `Soundslice; Songsterr; Klangio (Guitar2Tabs and its sibling apps); Moises; Chordify; Chord ai; Ultimate Guitar; Yousician; Guitar Pro; AnthemScore; Melodyne; RipX; Samplab; MIDI Guitar (Jam Origin); Capo; Transcribe!; Yamaha Chord Tracker; Fender apps; and anything newer, especially products from 2025 and 2026 and any product that reads hands or the fretboard from video.`,
    tryNotes: `- Most of these products need an account, a payment, a desktop install with a window, or a phone, so most of this lane is for-aaron.md. Before automating any website, read its terms: if they forbid automated access, do not script the site. Write Aaron's steps instead.
- What can run here: products that ship a Linux build with a command line or headless mode and a free trial (check AnthemScore, and others the docs agent finds), and open-source desktop apps. Run those on S2s, R1a and R2 and record the same facts as for any other tool, including the trial's limits and what its license says about the trial.
- For every product write, in for-aaron.md, a test Aaron can do in about 10 minutes: which shared clip to upload (refer to clips by id: S2s for a clean fingerstyle tab with a known answer, R1a for real guitar with a known answer, R2 for a band song, R3a for a fingerstyle video, S5capo2 and S5dropd for capo and tuning), the exact clicks or settings, which export formats to download, and what to send back (the exported files, a screenshot of the result, the time it took, what it cost, and for apps that claim to detect tuning or capo, what they said for S5capo2 and S5dropd).
- Group the steps so one sitting covers as many apps as possible, free ones first.`,
    docsNotes: `- For each product record: inputs accepted (audio file, video file, YouTube link, microphone); outputs (tab, notation, chords, MIDI, MusicXML, Guitar Pro export, stems); whether the tab is editable inside the product; whether it handles a capo and alternate tunings, and whether those are detected or set by the user; whether a user correction triggers a re-analysis; sync features (video sync, looping, slow-down, metronome, count-in); whether it uses video of the hands at all; platforms; price and free-tier limits with the date; whether an API or embed exists; and the terms-of-service clauses on who owns the output and on commercial use. Published accuracy claims only as attributed quotes.
- Look hard for products that appeared in 2025 and 2026.`,
  },
  'hosted-apis': {
    title: 'hosted services and APIs an agent could call over HTTP',
    tools: `Music.AI (the Moises API platform); Klangio API; LALAL.AI API; AudioShake; Fadr API; MVSEP API; Replicate and fal.ai hosted models (Demucs, Basic Pitch, All-In-One and others); Hugging Face Inference and public Spaces; Soundslice API; Flat.io API; Songsterr API; Hooktheory API; Chordify; multimodal LLM APIs that accept audio or video (Gemini and others); and the YouTube terms and yt-dlp for taking audio from a video link.`,
    tryNotes: `- Gemini: a key exists. Read it inside your script with: python3 ~/.claude/bin/getkey.py GEMINI_API_KEY (capture it into a variable; NEVER print it, echo it, write it to a file, or put it in a URL or a log). Hard cap: 2 US dollars of calls in total, counted from the token usage each response reports and the published price. List the available models first and use the current flagship and the current small one. Trials: (a) S3 and S4 audio: ask for the chord progression with times, the tempo and the key as JSON, and score with gtr-eval chords, tempo and key; (b) S2n audio: ask for the notes as JSON (onset, pitch) and score with gtr-eval notes; (c) the R3 video excerpts: ask where the capo is, which frets the fretting hand covers over time, and the tuning, and record the answers (there is no truth for R3); (d) S5capo2 audio only: ask whether a capo is used. Save each prompt and raw response as samples with the model id, token counts and computed cost. Only the synthesized and freely licensed shared clips may be uploaded.
- Other keys that exist by name in the key store: XAI_API_KEY, DEEPSEEK_API_KEY, VERCEL_AI_GATEWAY_API_KEY, ELEVENLABS_API_KEY. Check from their docs whether those APIs accept audio or video input for analysis. If one does, a small trial under the same 2 dollar cap per service is allowed. If not, record that as a fact. Total spend across all services: 10 dollars at most.
- Public Hugging Face Spaces: for models in this project (Basic Pitch, YourMT3, Demucs, Beat This!, chord recognition, SAM Audio and the like), find official or widely used public Spaces and call one or two through gradio_client without a token, with a shared clip. Record the Space id, the hardware its API reports, the queue and run time, and the output. Keep it to a handful of calls.
- Everything else (Music.AI, Klangio, LALAL.AI, AudioShake, Fadr, MVSEP, Replicate, fal.ai) needs an account or a key that does not exist yet: do not sign up for anything. Write for-aaron.md: for each, how to get a key (he can store it in his usual key store so an agent can run the trial later), the free tier or trial, the exact first request to make with a shared clip (a curl command with a placeholder where the key goes), and what to send back.`,
    docsNotes: `- For each API: the endpoints for upload, job start and result; the auth scheme; request fields (including hints such as instrument, tuning, tempo); the response format with exact fields (stems as URLs to WAV or MP3? chords as a list with times? MIDI, MusicXML or Guitar Pro files? JSON note events?); limits (file size, length, rate); price per minute or per call with the date; and the terms clauses on commercial use, output ownership, data retention and whether inputs train their models.
- For multimodal LLM APIs: the documented audio and video input formats, sampling (frames per second for video, token cost per second of audio and of video), limits and price.
- YouTube: quote the YouTube Terms of Service clauses on downloading and on accessing content by automated means, the YouTube API Services terms on storing audiovisual content, and the yt-dlp license. Record what products such as Chordify, Songsterr and Moises state about how they handle YouTube links. Quotes only, no legal conclusions.`,
  },
}

const L = LANES[laneName]
if (!L) { throw new Error('unknown lane: ' + laneName + ' (expected one of ' + Object.keys(LANES).join(', ') + ')') }
const BIG = '/home/user/gtr/lanes/' + laneName
const DOC = '/home/user/blog/docs/guitar-tab-research/lanes/' + laneName

const COMMON = `PROJECT
You are one agent in a research project for Aaron Orelup (aaronorelup.com), coordinated by an orchestrator who will assemble everyone's files into a research folder and a blog post draft. The thing being researched (NOT built) is a web app that builds guitar tablature step by step with a human in the loop. Two inputs: (1) full-song audio or video, from which it extracts notes, chords, melody and tempo and isolates tracks; (2) fingerstyle guitar video, from which it isolates melody, bass and taps and tracks the fretting and picking hands from video to tablature. It also needs metronome sync, reference playback of the correct tab, fully editable tablature, and user corrections (capo, tuning, wrong string or fret) that re-run the analysis with those constraints. The finished program would chain roughly 24 tools with cross-feedback between them (for example, fingering seen in the video constraining the pitch guesses from the audio). The plan is /home/user/blog/docs/guitar-tab-research/PLAN.md. Read it first. Get today's date with: date -u +%F

YOUR LANE: ${laneName} (${L.title}).
Big files go in ${BIG}/ . The written record goes in ${DOC}/ .

HARD RULES
1. FACTS ONLY. Write what went in, what came out, how long it took, what a license says. No judging, grading, ranking, "best", "better", "winner", "recommended", "impressive", "poor", scores presented as verdicts, or advice about what to choose. A number measured against ground truth is a fact: give it with how it was computed. An author's own claim is a fact only when attributed and cited.
2. NEVER FAKE ANYTHING. If something did not run, say so and why. If you did not read a page, do not cite it. If you are unsure, write UNVERIFIED and what would settle it. Do not fill gaps from memory: your memory of versions, licenses and prices is often out of date, so check the live source.
3. LICENSES AND TERMS are quoted: the exact clause, verbatim, in quotation marks, with the URL it was read from and the date read.
4. THE BOX: 4 vCPU (Intel Xeon 2.10 GHz), 15 GiB RAM, no swap, NO GPU, about 25 GB of free disk shared by about 20 agents working at the same time. Start every shell command with: source /home/user/gtr/env.sh  (shared caches for uv, pip, Hugging Face and torch, and CPU-only torch wheels by default through UV_TORCH_BACKEND=cpu). Make Python environments with uv, one per tool or small group: uv venv --python 3.11 ${BIG}/venv-<tool> then uv pip install --python ${BIG}/venv-<tool>/bin/python <packages>. Pythons 3.9 to 3.13 are installed (uv python install 3.8 works if a tool needs older). Node 22 and npm are installed. ffmpeg, sox, fluidsynth (with /usr/share/sounds/sf2/FluidR3_GM.sf2), rubberband, aubio and timidity are installed. Stay under about 3 GB of disk for your lane (du -sh ${BIG}). When you finish with a tool, save its uv pip freeze next to its samples, and delete its venv if you are near the budget. Never fill the disk: check df -h / before any download over 1 GB, and stop and report if less than 4 GB is free.
5. HEAVY COMPUTE GOES THROUGH gtr-run. The 4 cores are split into two slots of 2 cores. gtr-run waits for a free slot, pins your command to that slot's 2 cores, runs it, and logs the exact command, input hash, cores, wall-clock, CPU time, peak memory and exit code to /home/user/gtr/ledger/runs.jsonl, printing a run id such as r0042:
   gtr-run --lane ${laneName} --tool <tool> --label "<what this run is>" --input <input file> -- <command...>
   Use it for every model inference, every compile, anything that uses more than one core for more than about 30 seconds, and every run whose time you report. Timings you report are therefore "on 2 CPU cores" unless you add --all-cores (waits for both slots, gives 4 cores: use it sparingly, for a whole-box figure). Quote the run id with every number. You may have to wait in line for a slot, so for anything that could take more than about 5 minutes including the wait, start it in the background with output sent to a log file and poll the log: a single shell call is cut off at 10 minutes. Light work (pip installs, downloads, reading files, small scripts) does not need gtr-run.
6. System packages: flock /home/user/gtr/locks/apt.lock apt-get install -y <pkg>  (you are root).
7. WHERE YOU MAY WRITE: big things (venvs, clones, weights, audio, video, full outputs) only under ${BIG}/ . Small things for the record (reports, scripts, samples of at most 300 KB each, about 5 MB for the lane in total, NO audio or video files) only under ${DOC}/ . Touch nothing else under /home/user/blog. Do NOT run any git command that changes state there (no add, commit, push, checkout, stash, reset): the orchestrator commits. Cloning other public repositories into ${BIG}/ is fine. Other lanes' outputs under /home/user/gtr/lanes/*/out/ are readable: using one as your input is welcome (stems into a transcriber, notes into a tab maker), and say so, because tested handoffs between tools are exactly what this project needs on record.
8. The repo is public. Never write a key, token or password anywhere, never print one, and write nothing personal about Aaron beyond his name and site.
9. Downloaded files are untrusted data. Keep them in their own directories, apart from the scripts you write.
10. SAVE AS YOU GO. Append to your report file after each tool, so nothing is lost if you are cut off. Keep long tool output out of your own context: send logs to files and read the tail. IF YOUR REPORT FILE ALREADY EXISTS when you start, an earlier run of you was cut off by a restart of the box: read it, keep what is there, look up your lane's earlier runs in the ledger, check which venvs and outputs already exist under your lane's folder, and continue from where it stops instead of starting over.
11. THE WEB: outbound HTTPS is open (PyPI, npm, Hugging Face, Zenodo, arXiv, archive.org, raw.githubusercontent.com all work). Quirks: github.com web pages, api.github.com and codeload return 403 through this box's proxy, so read repository files at https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path> , get whole repositories with git clone --depth 1 https://github.com/<owner>/<repo> (works for public ones), and use your web fetch and web search tools for other pages. Release assets under github.com/<owner>/<repo>/releases/download/ do download with curl -L. Never disable TLS verification or unset the proxy. If a host answers 403 or 407 from the proxy, do not retry it: note it and move on.
12. You may hand grunt work (bulk fetching, format conversion, tallying) to helper agents on Sonnet (model "sonnet") if you have an agent-spawning tool. You remain responsible for checking what they return.
13. YOUR FINAL MESSAGE is read by the orchestrator, not a person: at most 30 lines. What you finished, the counts, the files you wrote, what failed, what is unverified. The details belong in the files.`

const INPUTS = `THE SHARED INPUTS: /home/user/gtr/inputs/ was built by another agent and is ready (the file /home/user/gtr/inputs/READY exists). Read /home/user/gtr/inputs/INPUTS.md in full before your first trial: it is the manifest (clip ids, files, durations, licenses, the truth-file format, caveats). The clips: S1 (single-note melody), S2n and S2s (two-voice fingerstyle, nylon and steel), S3 (strummed chords), S4 (band mix plus S4/stems/), S5capo2 and S5dropd (the fingerstyle piece with a capo and in Drop D), S6taps (fingerstyle plus percussive taps, with stems), S7flat30 (chords 30 cents flat) are synthesized, with exact ground truth in <id>.truth.json and side files (.mid, .notes.csv, .beats.txt, .chords.lab, .tab.txt, some .gp5). R1a, R1b, R1c are real GuitarSet excerpts with annotations. R2 and R2full are a real Creative Commons band song. R3a is a real freely licensed video of a classical guitar concert with its audio (640x480, medium and wide shots). R3b and R3c (closer views of the hands) could not be downloaded at first: another agent is fetching them now and will add them to INPUTS.md and write /home/user/gtr/inputs/READY-VIDEO when they are final, so look again before you finish. If a tool needs an input the shared set lacks, you may add one under ${BIG}/inputs/ and document it the way the manifest does (how it was made or where it came from, license quoted).

SCORING: where ground truth exists, score with /home/user/gtr/bin/gtr-eval (run gtr-eval --help; its README is /home/user/blog/docs/guitar-tab-research/scripts/gtr-eval/README.md). Every scoring run prints an id such as e0042: quote it next to the number. If a subcommand you need is missing or looks wrong, say so in your report and compute the number yourself with mir_eval, showing the code. Report numbers as measurements with their definition (tolerances), never as a grade.`

const TRY = `[AGENT: try-${laneName}]

${COMMON}

YOUR JOB: install and RUN as many of this lane's tools as this box allows, on the shared inputs, and write down exactly what went in and what came out.

STARTING TOOL LIST (candidates). The docs-${laneName} agent is surveying the category in parallel and writes what it finds to ${DOC}/survey.md under "## Tool list". When you are through your first pass, read that list and try anything runnable it adds.
${L.tools}

NOTES FOR THIS LANE
${L.tryNotes}

${INPUTS}

FOR EACH TOOL write a section in ${DOC}/trials.md, appended as soon as that tool is done:
## <Tool name> <version or commit>
- What it is, in one line, and where it came from (URL, commit hash or package version, date).
- Install: the exact commands that worked, and briefly the dead ends (for example "needs Python 3.10 or older", "needs numpy below 2"). Installed size on disk. Model weight files downloaded (name, size, URL).
- Each run: the input clip id, the exact command or script (scripts saved under ${DOC}/scripts/), settings, the gtr-run id, cores, wall-clock, CPU time, peak memory, the output files (format, size), and what the output contained: counts, a short excerpt (the first 10 notes, the chord list, the first beat times, the stem list), and the gtr-eval numbers where truth exists.
- Output format facts, for handoffs: exactly which fields and units the output has (for example "MIDI file, one track, note-on and note-off with velocity, pitch bends present", "CSV with start_time_s,end_time_s,pitch_midi,velocity", "JSON with keys ...", "one WAV per stem, 44.1 kHz stereo float32").
- Input format facts: what it accepted (sample rates, mono or stereo, file types, length) and what it rejected.
- Constraint inputs it accepts that matter to a human-in-the-loop re-run (note range, known tuning, capo, tempo hint, key hint, number of strings, prompts), with the parameter names.
- Failures and oddities, stated plainly (error messages trimmed to the relevant lines).
- NOT RUN HERE, when that is the case: the precise reason with evidence (for example "the README states a CUDA GPU is required: <link>", or "a 5 s clip took N minutes on 2 cores, run id r00xx", or "weights are behind a login: <link>", or "desktop GUI only").
Save small samples under ${DOC}/samples/<tool>/ (MIDI, JSON, CSV, text, PNG or WebP pictures of 300 KB at most). Audio and video outputs stay under ${BIG}/out/<tool>/ and are listed at the end of trials.md under "## Media kept outside git" with size, duration and what each one is (the orchestrator files them in Aaron's media library).

FOR AARON: ${DOC}/for-aaron.md . For every tool you could not run here, numbered steps a non-programmer can follow on a Windows laptop with a consumer NVIDIA GPU (or in the product's own web or desktop app): which shared clip to use (by id), which settings, roughly how long and how much it costs if the docs say, and exactly what to send back (which files, screenshots, numbers).

PACE: breadth first. Get one clean run of every runnable tool on its most relevant clips before doing extra clips or parameter sweeps. Give up on a tool after about 25 minutes of failed installing and write down what failed. Aim to finish in about 2 hours. Before your final message, re-read trials.md once from the top and fix anything that is not a supported fact.`

const DOCS = `[AGENT: docs-${laneName}]

${COMMON}

YOUR JOB: the written record for this category: what exists as of today, how a program could call each tool, what goes in and what comes out, and what the licenses and terms actually say about commercial use in a public web app. You do not run the tools (the try-${laneName} agent is doing that in parallel, writing ${DOC}/trials.md). You read primary sources.

STARTING TOOL LIST (extend it):
${L.tools}

NOTES FOR THIS LANE
${L.docsNotes}

1. SURVEY FIRST (your first 15 minutes): search the web for the current state of this category: open source projects, research models (papers with code from 2023 to today), APIs and commercial products. Write the list, one line per tool, to ${DOC}/survey.md under "## Tool list" straight away, because the try agent reads it to pick up tools it did not know about. Mark the ones that look runnable on a CPU-only Linux box with RUNNABLE. Give release or last-commit dates so stale projects show as a fact (for example "last commit 2021-03").
2. THEN ONE SECTION PER TOOL in survey.md:
## <Tool>
- What it is, who made it, primary links (repository, paper, docs, model card), latest version and date, maintenance facts (archived? last release?).
- How a program can call it: CLI (the command shape), Python API (import and call), HTTP API (endpoint and auth), WASM or JavaScript in the browser, desktop only. What the docs say it needs to run (GPU? memory? model size?).
- Input: formats, sample rate, length limits. Output: formats and exact fields (per-note onset, offset, pitch, velocity? pitch bends? confidence? string and fret? what time unit?). Cite the doc lines.
- Constraints or hints it accepts that matter to a human-in-the-loop re-run (tuning, capo, key, tempo, note range, instrument, prompts).
- Access needs: what Aaron would need to try it himself if it cannot run on a CPU box (GPU size, account, price, trial limits, operating system), with links.
- LICENSE FACTS, each as the exact clause quoted verbatim in quotation marks, the URL it was read from, and "read <date>":
   a. the code license (SPDX id, the grant sentence, and any non-commercial, field-of-use or copyleft clause);
   b. the model weights license if weights exist (often different from the code: check the model card, the README's license section and the download page);
   c. the training data: which datasets the released weights were trained on, and each dataset's license clause where it restricts commercial use, plus anything the authors say about it;
   d. for APIs and services: the terms clauses on commercial use, ownership of outputs, limits, automated access, and the pricing with the pricing page URL and date.
   If no license can be found, write "no license file found at <URL> on <date>". Do not guess. If sources conflict (the README says MIT, the LICENSE file says GPL), quote both.
   Do NOT give legal advice and do not say whether a use "is allowed" beyond what the clause literally says. Quote and stop.
- Measurements reported by the authors (benchmark numbers with the dataset and the paper or page), as attributed facts.
3. HANDOFFS, at the end of survey.md under "## Handoff facts": one line per fact of the form "X outputs <format with fields>, which Y accepts as <input>", for pairs inside this lane and to neighbouring lanes (stems into transcribers, notes or MIDI into string-and-fret assigners, tab files into renderers, beat times into a metronome, hand landmarks into fretboard coordinates, user constraints into the tools that accept them), each with the link that supports each half.

QUALITY BAR: every factual sentence must be traceable to a URL you actually read today. Prefer primary sources (the LICENSE file through raw.githubusercontent.com, the model card, the official terms page) over blogs and over your memory. Aim to finish in about 90 minutes. Before your final message, re-read survey.md once from the top and fix or mark UNVERIFIED anything you cannot trace.`

const VERIFY_TRIALS = `[AGENT: verify-trials-${laneName}]

${COMMON}

YOUR JOB: you are the independent checker of this lane's trial report, ${DOC}/trials.md, and of ${DOC}/for-aaron.md. Another agent wrote them. Assume they contain mistakes, find them, and FIX the files in place so that every statement left in them is supported.
Check, for every tool section:
1. Every run cited has a matching line in /home/user/gtr/ledger/runs.jsonl (id, command, cores, wall-clock, exit code). Numbers in the text match the ledger and the output files. A run with a nonzero exit code is not described as a success.
2. Every output and sample file named exists. Open it and confirm the description (note counts, chord lists, stem names, durations, formats and fields): recount and recompute yourself.
3. Every gtr-eval number: re-run gtr-eval on the saved output and compare. Where feasible recompute at least one metric per tool independently in a few lines of mir_eval.
4. Re-run at least one representative trial per tool from the recorded command, through gtr-run with the label starting "verify", when it takes under about 5 minutes, and confirm the output matches (same counts, allowing for nondeterminism). Record differences as facts.
5. Every NOT RUN HERE reason is specific and true (does the README really say a GPU is required? was the CPU attempt really made?).
6. Input and output format statements match the actual files (open the MIDI, JSON or CSV and look).
7. No judging language: remove "best", "better", "winner", "recommended", "impressive", "poor", "disappointing", "state of the art" (unless it is a quoted, attributed claim), rankings, grades and advice. Replace with the plain measurement.
8. No secrets, no personal data, no file over 300 KB and no audio or video under ${DOC}/ (move audio and video to ${BIG}/out/ and fix the references).
9. for-aaron.md steps are concrete enough to follow (which clip, which settings, what to send back) and claim nothing about a product that its docs do not say.
Fix what you find directly in the files. If a claim cannot be supported and you cannot determine the truth, delete it or mark it "UNVERIFIED: <why>". If a runnable tool on the lane's list was skipped without a good reason and you have time, run it yourself in the same reporting format, marked "(run by the verifier)". Append "## Verification log (verify-trials-${laneName}, <date>)" listing what you checked, what you changed, your re-run ids and what stays unverified.

The inputs manifest is /home/user/gtr/inputs/INPUTS.md and the scoring tool's README is /home/user/blog/docs/guitar-tab-research/scripts/gtr-eval/README.md .

The trial agent's own closing summary follows. Treat it as a claim to check, not as fact:
`

const VERIFY_DOCS = `[AGENT: verify-docs-${laneName}]

${COMMON}

YOUR JOB: you are the independent checker of ${DOC}/survey.md. Another agent wrote it. Assume some quotes are paraphrased, some links are wrong, some licenses are confused with each other (code, weights, dataset), and some project facts are out of date. Find them and FIX the file in place.
1. For EVERY quoted license or terms clause: fetch the URL given and confirm the quote appears there verbatim (whitespace aside). If it does not, find the real text and correct the quote, or correct the URL, or mark it "UNVERIFIED: could not fetch <URL> on <date> (HTTP xxx)". Keep a tally.
2. Check that code, weights and data licenses are not conflated. Look for a separate weights or model-card license, and for non-commercial, no-derivatives or research-only clauses on the training data that the survey missed. Add what is missing, quoted and linked.
3. Check versions, dates and "archived" facts against the repository or the package index.
4. Check each "how to call it" and each input and output format statement against the docs or the source code (clone the repository and read it when the docs are thin). Where ${DOC}/trials.md (the try agent's report, possibly still being written) shows the actual output format, make sure the two agree. If they differ, state both with their sources.
5. Check each line under "## Handoff facts": both halves must be supported by a link or a run id. Fix or delete the rest.
6. Pricing and API terms: re-read the page and record the date.
7. Remove judging language and advice ("best", "better", "recommended", "state of the art" unless quoted and attributed, rankings, grades). Numbers reported by authors must name the paper or page and the table.
8. Completeness: search once more for notable tools in this category that are missing, especially releases from 2025 and 2026, and add them with the same rigor, or list them under "## Not covered" with a link and one line.
Fix in place. Append "## Verification log (verify-docs-${laneName}, <date>)" with the tally: quotes checked, confirmed, corrected, unverifiable; links fixed; tools added.

The survey agent's own closing summary follows. Treat it as a claim to check, not as fact:
`

const JSON_JOB = `[AGENT: json-${laneName}]

You are finishing one lane (${laneName}: ${L.title}) of a research project on tools for a guitar tablature web app. Two verified reports exist: ${DOC}/survey.md (docs, formats, licenses) and ${DOC}/trials.md (what was actually run), plus ${DOC}/for-aaron.md (steps for the things that could not run on the box). Read all three in full.

Write ${DOC}/tools.json : {"lane": "${laneName}", "generated": "<UTC date>", "tools": [ ... ]} with one object per tool that appears in either report:
 name, kind (one of: open-source, research-model, api, commercial-app, web-standard, library, dataset, file-format), what (one line), url, version,
 tried (true or false), tried_how (one of: "local-cpu", "public-space", "api", "browser-headless", null),
 runs: [{run_id, input_id, cores, wall_s, peak_mb, exit_code, output_files, metrics: {...}}],
 not_run_reason (or null), for_aaron (true if for-aaron.md has steps for it),
 callable_via (array from: cli, python, http, wasm, js-browser, desktop-gui, mobile-app, vamp-plugin),
 inputs (array of format strings), outputs (array of format strings with their fields), constraints_accepted (array),
 license: {code: {spdx, quote, url}, weights: {name, quote, url}, training_data: [{name, license, quote, url}], service_terms: [{topic, quote, url}]},
 pricing (string or null), handoffs_out: [{to, via_format, evidence}], unverified (array of strings).
Rules: copy facts exactly as the reports state them. Add NO fact that is not in those three files. Use null or [] where the reports say nothing. Do not paraphrase license quotes: copy them character for character. Do not touch any other file, and run no git commands. Check the file parses (python3 -m json.tool ${DOC}/tools.json > /dev/null).
Then report the counts.`

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    lane: { type: 'string' },
    tools_total: { type: 'integer' },
    tools_tried: { type: 'integer' },
    tools_not_run: { type: 'integer' },
    tools_for_aaron: { type: 'integer' },
    license_quotes: { type: 'integer' },
    unverified_items: { type: 'integer' },
    tried_names: { type: 'array', items: { type: 'string' } },
    for_aaron_names: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['lane', 'tools_total', 'tools_tried', 'tools_for_aaron'],
}

const opts = (label, ph, model, effort) => ({ label, phase: ph, model, effort, agentType: 'general-purpose' })
const tail = r => (r ? String(r) : '(it returned nothing: it may have been cut off. Verify whatever is on disk and say what is missing.)')

const chains = await pipeline(
  ['try', 'docs'],
  kind => agent(kind === 'try' ? TRY : DOCS, opts(kind + '-' + laneName, 'Research', OPUS, 'max')),
  (res, kind) => agent((kind === 'try' ? VERIFY_TRIALS : VERIFY_DOCS) + tail(res),
    opts((kind === 'try' ? 'verify-trials-' : 'verify-docs-') + laneName, 'Verify', OPUS, 'max'))
    .then(v => ({ kind, research: res, verify: v })),
)

phase('Structure')
const summary = await agent(JSON_JOB, { label: 'json-' + laneName, phase: 'Structure', model: SONNET, effort: 'high', agentType: 'general-purpose', schema: SUMMARY_SCHEMA })

return { lane: laneName, chains, summary }
