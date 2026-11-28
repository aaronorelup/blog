<!-- RUNDOWN -->
- **Splitting a song into instruments: 64 entries on the list, and 16 are marked as run.** This section is short for now. Its full write-up was drafted but hadn't been fact-checked when I stopped.

<!-- SECTION -->
## Splitting a song into instruments

This step takes a full mix and gives back one track per instrument, called stems, so the guitar can be worked on alone. My agents' list has 64 entries and 16 are marked as run on the cloud box. One of those ran in a last round that wasn't checked before I stopped.

The ones that ran in the checked rounds, in alphabetical order: Demucs with four of its models, demucs.cpp, demucs-onnx, a Demucs guitar add-on, librosa's harmonic and percussive split, Music-Source-Separation-Training with two RoFormer models, Open-Unmix, python-audio-separator with one model from each family it offers, SCNet and Spleeter. They ran on the synthesized band clip, where each instrument's true track is known, on the real song and on the solo guitar clips.

The full write-up of this section was drafted but not fact-checked when I stopped, so it isn't here yet. Every run, with its command, time and counts, is in [this lane's records](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/source-separation).
