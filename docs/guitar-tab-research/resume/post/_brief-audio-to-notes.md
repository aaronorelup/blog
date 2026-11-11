<!-- RUNDOWN -->
- **Turning sound into notes: 99 entries on the list, and 16 are marked as run.** This section is short for now. Its full write-up was drafted but hadn't been fact-checked when I stopped.

<!-- SECTION -->
## Turning sound into notes

This step listens to a recording and writes down which notes were played and when. My agents' list has 99 entries and 16 are marked as run. One of the 16 is SoX, which only prepared a test file, and one is YourMT3+, which ran on a public demo page instead of the cloud box.

The ones that ran, in alphabetical order: aubio, Basic Pitch, the ByteDance piano transcription model, CREPE Notes, Essentia, FCPE, librosa's pYIN, Onsets and Frames, PESTO, RMVPE and its ONNX version, SoX, SwiftF0, torchcrepe, Transkun and YourMT3+. Some of these write notes. Others only follow one pitch over time and need another step to turn that into notes. Three were trained on piano and were run on guitar anyway.

MT3 didn't run. The permission system refused its install, and a second route through a package that repackages it was refused at the run step.

The full write-up of this section was drafted but not fact-checked when I stopped, so it isn't here yet. Every run, with its command, time and counts, is in [this lane's records](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/audio-to-notes).
