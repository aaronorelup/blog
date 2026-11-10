# Guitar tablature web app: research plan

Written 2026-11-10, before any agent started. This is the plan, not the findings. The findings land in
this folder as the lanes finish, and the draft post is built from them.

## What is being researched (not built)

A web app, linked from aaronorelup.com, that builds guitar tablature step by step with a person in the loop.

1. **Full-song audio or video in:** extract notes, chords, melody and tempo, and isolate tracks.
2. **Fingerstyle guitar video in:** isolate melody, bass and taps, and track the fretting and picking hands
   from video to tablature.

It also needs metronome sync, reference playback of the correct tab, fully editable tablature, and user
corrections (capo, tuning, wrong string or fret) that re-run the analysis with those constraints. The finished
program would combine roughly 24 tools with cross-feedback between them.

## Ground rules for every agent

- **Facts only.** What went in, what came out, how long it took, what the license says. No grading, ranking,
  "best", scores presented as verdicts, or recommendations. Measured numbers against a known ground truth are
  facts and are reported with how they were computed.
- **Nothing is faked.** A tool that could not run here is written up as "not run here" with the reason, and
  goes into `FOR_AARON.md` with steps and what to send back.
- **Every license claim carries the exact clause, quoted, with its link** and the date it was read: code
  license, model weights license, training data restrictions, API or service terms.
- **Every run is logged** through the `gtr-run` wrapper: exact command, input file hash, wall-clock time, CPU
  time, peak memory, exit code. One timed job runs at a time on the box.
- No secrets in files or commits. Nothing changes outside `docs/guitar-tab-research/`, the new draft post and
  that post's own assets. Sub-agents do not commit. The orchestrator commits and pushes.

## The box everything runs on

| | |
|---|---|
| Machine | Claude Code cloud session, one container |
| CPU | 4 vCPU, Intel Xeon @ 2.10 GHz |
| Memory | 15 GiB, no swap |
| GPU | none |
| Disk | about 26 GB free at the start |
| OS | Ubuntu 24.04.5 |
| Python | 3.13.18 by default, 3.9 / 3.10 / 3.11 / 3.12 available through `uv` |
| Node | 22.23.4 |
| Browser | Playwright 1.63.0 with its bundled headless Chromium |
| Audio tools | ffmpeg 6.1.1, FluidSynth 2.3.4 with the FluidR3_GM SoundFont, SoX, Rubber Band, aubio, TiMidity |
| Network | unrestricted outbound HTTPS through the session proxy |
| Cost | local runs cost nothing beyond the session. Paid API calls are capped (below) and logged |

Work that is too big for git (virtual environments, model weights, clips, full outputs) lives outside the repo
in `/home/user/gtr/`. Small samples, scripts and reports are copied into this folder.

## Phases

| Phase | What happens | Agents |
|---|---|---|
| A | Build one shared set of test inputs with known ground truth. Read the earlier post for its findings | `inputs-builder`, `prior-brief` |
| B | Ten lanes. In each lane one agent installs and runs the tools, one reads the docs, licenses and terms, then two more check that work against the sources and the saved files | 5 per lane, below |
| C | Stitch the lanes into one handoff graph and one `FOR_AARON.md`. A critic looks for what is missing, and the gaps get another round | `handoff-graph`, `completeness-critic`, gap fillers |
| D | Draft the blog post from the verified facts, then fact-check the draft against the lane files | orchestrator, `post-factcheck-*` |

Models: the orchestrator runs on Fable 5. Research, trials and verification run on Opus 5.5
(`claude-opus-5-5`) at max effort. Sonnet 5.5 does mechanical work (turning a verified report into JSON).

## Phase A: shared test inputs

`inputs-builder` makes `/home/user/gtr/inputs/` and its manifest, copied to `inputs/` here.

| Id | Input | Ground truth |
|---|---|---|
| S1 | Synthesized single-note melody on nylon guitar | exact notes, onsets, tempo |
| S2 | Synthesized fingerstyle piece, bass and melody as two voices | exact notes per voice, string and fret per note, tempo, key |
| S3 | Synthesized strummed chord progression | chord labels and times, tempo, key |
| S4 | Synthesized band mix (guitar, bass, drums, lead) plus each stem alone | stems, chords, beats, downbeats, tempo, key |
| S5 | S2 again with a capo, and again in an altered tuning | capo fret, tuning, same tab shapes |
| S6 | S2 with percussive body taps mixed in | tap times |
| S7 | S1 or S3 detuned by a known number of cents | tuning offset |
| R1 | Real solo guitar excerpts from GuitarSet (CC BY 4.0) | the dataset's per-string note annotations, chords, beats |
| R2 | A real full-band song under a Creative Commons license that allows reuse | none (licensed stems if the artist publishes them) |
| R3 | A real fingerstyle guitar video under a free license, with its audio | none |

Synthesized audio is rendered from MIDI with FluidSynth and the FluidR3_GM SoundFont, so every note is known.

`prior-brief` reads the earlier post, [`src/content/posts/guitar-tabs-from-video.md`](../../src/content/posts/guitar-tabs-from-video.md),
and writes down which tools its three passes used and what they found. That post is not edited.

## Phase B: the ten lanes

Each lane has the same five jobs:

| Agent | Job |
|---|---|
| `try-<lane>` | Install each tool that can run on this box and run it on the shared inputs. Record input, command, output, runtime. Save small samples. Write Aaron's steps for what cannot run here |
| `docs-<lane>` | Survey the category on the web (including anything newer than this list). For every tool: what it is, version, how an agent could call it, input and output formats, and the license clauses quoted with links |
| `verify-trials-<lane>` | Check every trial claim against the run ledger and the saved files, recompute numbers, re-run spot checks, fix the report |
| `verify-docs-<lane>` | Re-fetch every quoted license clause and link, fix anything that does not match, strip judging language |
| `json-<lane>` | Turn the two verified reports into one `tools.json` for the handoff graph (Sonnet) |

The starting tool lists. These are candidates to look at, and the `docs-` agents add what they find.

### 1. `audio-to-notes`: audio to notes or MIDI, and melody extraction

Spotify Basic Pitch, CREPE and torchcrepe, pYIN (librosa), PESTO, RMVPE, FCPE, SwiftF0, aubio (pitch, notes),
Essentia (PredominantPitchMelodia, MultiPitchKlapuri, its CREPE models), the MELODIA Vamp plugin, MT3, YourMT3+,
MR-MT3, Onsets and Frames, ByteDance piano transcription, Transkun, hFT-Transformer, Timbre-Trap, Omnizart,
NeuralNote, Sheet Sage.

### 2. `chords-beats-key`: chords, tempo, beat, downbeat, key, tuning

Chords: Chordino and NNLS Chroma (Vamp), madmom, autochord, BTC, CREMA, lv-chordia / ChordMini, Essentia
ChordsDetection, Omnizart chord, Harmony Transformer. Beat and tempo: madmom, librosa, Beat This!, BeatNet,
All-In-One, Essentia (RhythmExtractor2013, TempoCNN), aubio tempo, tempo-cnn, Beat Transformer. Key and tuning:
librosa `estimate_tuning`, Essentia KeyExtractor and TuningFrequency, madmom key, libKeyFinder, S-KEY, music21
(symbolic key). Also what exists for finding a guitar's open-string tuning and capo position from audio.

### 3. `source-separation`: stems

Demucs v4 (htdemucs, htdemucs_ft, htdemucs_6s with its guitar stem), Spleeter, Open-Unmix,
python-audio-separator with the UVR model zoo (MDX-Net, MDX23C, BS-RoFormer, Mel-Band RoFormer, SCNet),
ZFTurbo's Music-Source-Separation-Training, Banquet, AudioSep, Meta SAM Audio, librosa HPSS, demucs.cpp and
the in-browser Demucs builds.

### 4. `guitar-tab`: guitar transcription with string and fret assignment

TabCNN, FretNet, guitar-transcription-with-inhibition, amt-tools, the high-resolution guitar transcription
model (Riley et al.), the GAPS model, SynthTab-pretrained models, TART, Fretting-Transformer, MIDI-to-Tab
(Edwards et al.), tuttut, tayuya, other MIDI-to-tab libraries, PyGuitarPro, music21, DadaGP tooling. The
datasets behind them and their licenses: GuitarSet, IDMT-SMT-Guitar, EGDB, DadaGP, SynthTab, GAPS, Guitar-TECHS,
GOAT. How each tool takes a capo, a tuning or a fixed string as a constraint.

### 5. `fingerstyle-voices-taps`: melody, bass and percussive taps from one guitar

Harmonic-percussive separation (librosa, Essentia), onset detectors (madmom, aubio, librosa, SuperFlux,
Essentia), drum and percussion transcription models tried on body taps (ADTOF, Omnizart drum, others), NMF,
symbolic voice separation into melody and bass (music21, partitura, published voice-separation code), and the
research on percussive fingerstyle transcription.

### 6. `video-hands-fretboard`: hands, fingers and the fretboard from video

MediaPipe Hand Landmarker and Holistic, MMPose / RTMPose / RTMW hand models, DWPose, Ultralytics YOLO pose and
hand keypoints, OpenPose, HaMeR, WiLoR, Hamba, SAM 2 and SAM 3, open-vocabulary detectors (Grounding DINO,
OWLv2, YOLO-World) for the neck and a capo, OpenCV line and homography methods for frets and strings, point
trackers (CoTracker, TAPIR, TAPNext), Roboflow fretboard datasets and models, published video-to-tab projects
(TapToTab and others), and datasets that pair guitar video with annotations.

### 7. `web-tab-render`: tab rendering, editing and playback on the web

alphaTab (alphaTex, Guitar Pro import and export, its player), VexFlow and VexTab, OpenSheetMusicDisplay, abcjs,
Verovio, MuseScore's command line, LilyPond tab output, TuxGuitar, PyGuitarPro, music21 to MusicXML, the file
formats themselves (Guitar Pro 3 to 8, MusicXML tab, MEI, ASCII tab), open-source editable tab editors,
ChordPro and chordsheetjs, chord diagram libraries (svguitar, vexchords), Tonal.

### 8. `browser-audio-sync`: metronome, audio sync and in-browser analysis

The Web Audio clock and look-ahead scheduling, AudioWorklet, Tone.js Transport, alphaTab's metronome, count-in
and backing-track sync points, wavesurfer.js and peaks.js, syncing to a `<video>` (requestVideoFrameCallback,
WebCodecs, Mediabunny), time-stretch for slow practice (SoundTouchJS, Signalsmith Stretch, Rubber Band WASM,
`preservesPitch`), sample playback (smplr, soundfont-player, SpessaSynth, js-synthesizer), and analysis that
runs in the browser itself: basic-pitch-ts, essentia.js, ONNX Runtime Web, MediaPipe Tasks Vision,
Transformers.js, ffmpeg.wasm. Measured in headless Chromium.

### 9. `apps-survey`: existing apps that already do some of this

Soundslice, Songsterr, Klangio (Guitar2Tabs and its siblings), Moises, Chordify, Chord ai, Ultimate Guitar,
Yousician, Guitar Pro, AnthemScore, Melodyne, RipX, Samplab, MIDI Guitar, Capo, Transcribe!, Yamaha Chord
Tracker, and anything newer. What each one takes in and gives back, price, and what its terms say about using
the output. Most need an account or a desktop install, so most of this lane becomes steps for Aaron.

### 10. `hosted-apis`: services an agent could call over HTTP

Music.AI (Moises), Klangio API, LALAL.AI, AudioShake, Fadr, MVSEP, Replicate and fal.ai hosted models, Hugging
Face Inference and public Spaces, Soundslice and Flat.io APIs, Songsterr, Hooktheory, and multimodal LLM APIs
that accept audio or video (Gemini). Request and response formats, price, and the terms clauses on commercial
use. Also what YouTube's terms and yt-dlp's license say about taking audio from a video link.

## Phase C and D

- `handoff-graph` reads every lane's `tools.json` and writes `HANDOFFS.md`: one fact per edge, of the form
  "X outputs MIDI with per-note onset times, which Y accepts", each tied to a doc link or a run id.
- `completeness-critic` lists tools not covered, claims without a source, and trials that should have run.
  Those go back out as gap-filling agents.
- The draft post is written to `src/content/posts/` with `draft: true`, from the verified lane files only.
  Fact-check agents then compare every number, quote and name in the draft with its source.

## Where things land

```
docs/guitar-tab-research/
  PLAN.md              this file
  README.md            index of what is here, written at the end
  FOR_AARON.md         everything Aaron has to run himself, step by step, with what to send back
  HANDOFFS.md          the handoff graph as facts
  ENVIRONMENT.md       the box, versions, and the run ledger
  PRIOR.md             what the earlier post already found
  inputs/              the test inputs: manifest, scripts, MIDI, ground-truth JSON
  lanes/<lane>/
    trials.md          what was run and what came out
    survey.md          the tools, how to call them, formats, licenses with quoted clauses
    for-aaron.md       this lane's steps for Aaron
    tools.json         the same facts, machine-readable
    samples/<tool>/    small output samples (text, JSON, MIDI, images)
    scripts/           the scripts that produced them
```

## Media

Audio and video never go into git. Small pictures go into the post's own folder as WebP. Audio and video
samples are filed in Aaron's studio library and listed in the post as pending, because Aaron handles the R2
uploads for the site.

## Spending

- Local runs: no extra cost.
- Paid APIs: only with a key that already exists in Aaron's key store, only on the synthesized or freely
  licensed test clips, at most 2 USD per service and 10 USD in total, each call logged with its cost.
- No GPU is rented. Anything that needs one goes to `FOR_AARON.md`.
