<!-- RUNDOWN -->
- **13 of the 68 tools, apps and services my agents listed for turning sound into notes ran on the cloud box.** The four that write MIDI straight from audio found 79 to 90 of the 90 notes in a synthesized fingerstyle clip, and 63 to 120 of the 148 in a real guitar recording.

<!-- SECTION -->
## Turning sound into notes

This step listens to a recording and writes down the notes: the pitch, when each one starts and when it stops. My agents' record for it lists 68 tools, apps and services (plus 30 training datasets), and 13 of the tools ran on the cloud box, on up to 16 of the 17 test clips. Four of the 13 write MIDI, a list of notes with start times, straight from the audio (three of the four were trained on piano), and the other nine track pitch over time or turn a tracked pitch into notes. On S2n, a 29-second fingerstyle clip I synthesized so every note is known (90 notes, a bass line under a melody), Basic Pitch returned 137 notes with all 90 among them, ByteDance's piano model 87 with 79, Onsets and Frames 91 with 88 and Transkun 99 with 88. On R1c, 28 seconds of real bossa nova guitar with 148 annotated notes from the GuitarSet dataset, the same four, in the same order, returned 156, 87, 173 and 119 notes and found 120, 63, 105 and 111 of the real ones. Every run and source is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/audio-to-notes).

<ao-compare cols="2" aspect="25/9">
<figure><img src="/media/guitar-tab-tools/audio-to-notes-basic-pitch-s2n.webp" alt="Piano roll titled Basic Pitch 0.4.0 on S2n, estimate in red over truth in grey. Red bars cover the grey bars of the low and high lines from about 2 to 28 seconds. A few short red notes sit alone near MIDI pitch 83 to 87, and one sits near pitch 24 at the very start."><figcaption><b>Basic Pitch on S2n</b><span class="ao-meta">Synthesized fingerstyle. 137 notes returned, 90 of 90 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-transkun-s2n.webp" alt="Piano roll titled Transkun 2.0.1, piano-trained, on S2n, estimate in red over truth in grey. Red bars sit on almost every grey bar between MIDI pitch 43 and 64. A red note at pitch 67 runs from about 2.1 to 3.8 seconds with no grey under it, and a few thin red marks sit near pitch 70."><figcaption><b>Transkun on S2n</b><span class="ao-meta">Piano-trained model, same clip. 99 returned, 88 of 90 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-basic-pitch-r1c.webp" alt="Piano roll titled Basic Pitch 0.4.0 on R1c, estimate in red over truth in grey. Grey bars spread between MIDI pitch 40 and 67 over 28 seconds, with red lines on most of them. Some grey bars have no red, and a few red notes stand alone, the highest near pitch 94 at the start."><figcaption><b>Basic Pitch on R1c</b><span class="ao-meta">Real bossa nova guitar from GuitarSet. 156 returned, 120 of 148 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-transkun-r1c.webp" alt="Piano roll titled Transkun 2.0.1, piano-trained, on R1c, estimate in red over truth in grey. Red bars sit on most grey bars between MIDI pitch 40 and 70. Several grey bars have no red, and a thin red line at pitch 50 runs through the last seconds of the clip with no grey under it."><figcaption><b>Transkun on R1c</b><span class="ao-meta">Same real clip. 119 returned, 111 of 148 found.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

The clips, by id. S1 is a 30-second single-note melody I synthesized (62 notes). S2n is the fingerstyle clip above and S2s is the same 90 notes on steel strings. S3 is 24 seconds of strummed chords (182 notes). S4 is a band mix of bass, drums, strummed guitar and a lead line (467 notes besides the drums), and S4guitar and S4lead are its guitar and lead tracks on their own. S5capo2 is S2n played on the same strings and frets with a capo on fret 2 (a capo is a clamp across the strings that raises every note), so every note sounds 2 semitones higher. S5dropd is the same piece in Drop D, with the lowest string tuned down to D, so four bass notes sit below the usual lowest note. S6taps is S2s with 32 drum-kit hits mixed in, standing in for taps on the guitar body. S7flat30 is S3 rendered 30 cents flat (a cent is a hundredth of a semitone). R1a, R1b and R1c are real guitar recordings from GuitarSet: R1a is an accompaniment part (189 notes), R1b a single-note solo (70 notes) and R1c the bossa nova clip. R2 is a real band song with singing, and R3a, R3b and R3c are real guitar videos. Those four have no known answer.

A real note counts as found when a returned note starts within 50 ms of it and is within 50 cents (half a semitone) of its pitch, and each returned note can match one real note at most. The pitch trackers write one pitch per short slice of time, so for them the count is in 10 ms slices: in how many of the slices where the melody sounds their pitch was within 50 cents of it. Times are wall-clock seconds on 2 CPU cores unless the line says the run was unpinned, which means it shared the CPU with other jobs. Local runs cost nothing beyond the cloud session itself.

**aubio 0.4.9** ([repository](https://github.com/aubio/aubio)). A C library whose command-line programs track pitch and cut notes, from the Ubuntu package `aubio-tools` 0.4.9-4.4build1 that was already on the box.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as WAV files.
- Command: `aubiopitch -i <wav>` and `aubionotes -i <wav>`, with the defaults (pitch method `yinfft`, onset method `hfc`).
- Out: `aubiopitch` writes `time_s pitch_hz` lines every 5.805 ms, 0 Hz in silence, with no confidence. Its pitch was within 50 cents in 2,511 of S1's 2,624 melody slices, 1,242 of S2n's 2,529 and 1,585 of R1b's 1,823. `aubionotes` writes `midi_pitch onset_s offset_s` lines. On S1 it returned 62 notes, and 3 of the 62 real ones were found within 50 ms. With a 100 ms window 61 of 62 were found, and those started a median 56.2 ms after the real notes. On R1b it returned 169 notes with 52 of the 70 real ones among them. On S2n it returned 43 notes and none was found within 50 ms.
- Time: 4.23 s for all 8 clips and both programs, peak memory 35.2 MB, run r0130. Unpinned and single-threaded. Per clip 0.14 to 0.30 s for `aubiopitch` and 0.19 to 0.42 s for `aubionotes`.
- Takes as a hint: `-p` (pitch method), `-l` (tolerance), `-s` (silence), `-B` and `-H` (buffer and hop), `-r` (sample rate), `-u` (unit), and for notes `-O`, `-t`, `-M` and `-d`. No note range, tuning or key input.
- Hands off to: my agents turned its note lists into MIDI files with their own script (one track, program 24, velocity 80, 120 BPM). A notation app was named as the next step for the MIDI and not run.

**Basic Pitch 0.4.0** ([repository](https://github.com/spotify/basic-pitch)). Spotify's note transcriber. Its paper is titled `A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation`. Its model file, `nmp.tflite`, is 204,448 bytes and ships inside the package.

- In: 16 WAV files: S1, S2n, S2s, S3, S4, S4guitar, S4lead, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2 and R3a. Also R3a's MP4 video file as it was, and R3b and R3c (run r0264).
- Command: `basic_pitch.inference.predict(path, Model(nmp.tflite))` with the defaults, and the command line `basic-pitch --save-midi --save-model-outputs --save-note-events <outdir> S1.wav`, which gave the same 64 notes on S1.
- Out: a MIDI file (one instrument, program 4, Electric Piano 1, 220 ticks per quarter note, tempo 120, with pitch bends), a note list with the header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`, and the model's raw output as an `.npz` file. The counts per clip are in the table below. R3a's video file gave 108 notes against 105 from its WAV, R3b gave 129, R3c 87 and R2 334. The first S2n notes, as start-end in seconds, MIDI pitch and velocity (the first one sits inside the silent count-in bar):

  ```text
  0.000-0.150 24 49
  2.150-2.684 55 93
  2.161-2.927 43 71
  2.684-3.218 50 98
  2.684-3.218 55 98
  2.695-2.927 83 39
  ```

- Time: 62.37 s for the 16 files, peak memory 393 MB, run r0234. Per clip 0.87 s (R3a, 18 s long) to 3.71 s (S4, 38.7 s long), and 20.36 s for S1, the first call in the process.
- Takes as a hint: note range through `minimum_frequency` and `maximum_frequency` in Hz, plus `onset_threshold`, `frame_threshold`, `minimum_note_length` and `midi_tempo`. No tuning, capo, key or instrument input. Set to 82.4 to 1319.0 Hz (E2 to about E6, the guitar's range), S5dropd's bass came out 44 of 48, because its four D2 notes (73.4 Hz) lie below the limit. With the floor at 73.4 Hz all 48 were found again (run r0349).
- Hands off to: two handoffs were tried. On the stems the source-separation agents made from S4 with Demucs `htdemucs_6s` (a stem is one instrument's track pulled out of a mix), the guitar stem gave 342 notes with 233 of the 369 real guitar notes, against 302 from the true guitar track and 249 from the full mix. The bass stem gave 142 notes with 46 of the 61 real ones (run r0243). And on S7flat30 shifted up 30 cents with SoX, standing in for a user saying the guitar is 30 cents flat, it returned 265 notes with 139 of the 182 real ones, against 112 notes and 83 found on the clip as it was (run r0319). Its MIDI files were left for the other steps.

| clip | notes returned | real notes found |
|---|---|---|
| S1 | 64 | 61 of 62 |
| S2n | 137 | 90 of 90 (42 of 42 melody, 48 of 48 bass) |
| S2s | 199 | 90 of 90 |
| S3 | 197 | 150 of 182 |
| S4 | 461 | 293 of 467 (bass 26 of 61, guitar 243 of 369, lead 24 of 37) |
| S4guitar | 386 | 302 of 369 |
| S4lead | 39 | 27 of 37 |
| S5capo2 | 139 | 90 of 90 |
| S5dropd | 130 | 90 of 90 |
| S6taps | 196 | 90 of 90 |
| S7flat30 | 112 | 83 of 182 |
| R1a | 196 | 137 of 189 |
| R1b | 76 | 57 of 70 |
| R1c | 156 | 120 of 148 |

**ByteDance piano transcription 0.0.6** (`piano_transcription_inference`, [repository](https://github.com/qiuqiangkong/piano_transcription_inference)). A piano transcription package. Its weights (171,966,578 bytes, from Zenodo) were trained on piano, and here they ran on guitar.

- In: S2n and R1c, read with `librosa.load(path, sr=16000, mono=True)`. The package's own loader stopped with `AttributeError: No librosa.core attribute audio` under librosa 0.11, so my agents loaded the audio themselves.
- Command: `PianoTranscription(model_type="Note_pedal", device="cpu", checkpoint_path=...).transcribe(audio, out.mid)`
- Out: a MIDI file (384 ticks per quarter note, tempo 120, program 0, sustain pedal as CC64 events, 18 of them in S2n's file, no pitch bends). S2n: 87 notes returned, 79 of 90 found (all 48 bass notes, 31 of 42 melody notes). R1c: 87 returned, 63 of 148 found.
- Time: 159.3 s for both clips (model setup 8.6 s, S2n 75.8 s, R1c 73.7 s), peak memory 998.8 MB, run r0401, unpinned with torch on 2 threads. A re-run of S2n on 2 cores took 27.8 s (run r0464).
- Takes as a hint: none for pitch range, tuning or instrument. Its settings are `model_type`, `checkpoint_path` and `device`.
- Hands off to: MIDI, not fed further.

**CREPE Notes 0.2.0** ([repository](https://github.com/xavriley/crepe_notes)). Its makers call it `Post-processing for the CREPE pitch tracker to turn f0 pitch estimates into discrete notes (MIDI)`. Here it turned torchcrepe's pitch into notes, using a copy of madmom, a music analysis library another agent had built on the box, to find where notes start.

- In: torchcrepe's pitch file for S1, R1b and S4lead (10 ms per row), plus each clip's WAV. Three versions of the pitch: torchcrepe `full`, `tiny`, and `full` with the slices below periodicity 0.21 set to 0 Hz.
- Command: `crepe_notes --f0 <clip>.f0in.csv --use-cwd --output-label <cfg> <clip>.wav`
- Out: one MIDI file per call (type 1, 220 ticks per quarter note, program 0, tempo 120, velocities 7 to 127, no pitch bends). It also prints the tuning it estimated, `Tuning offset: 6.000000000000005 cents` on S1, and takes it off before rounding to notes. S1: 62 notes returned with 62 of 62 found from the `tiny` pitch, and 62 with 61 found from `full`. R1b: 94 returned, 29 of 70 found (`full`), and 48 of those 94 sit at MIDI pitch 90 or above, carried over from torchcrepe's slices at 1,500 Hz or above. S4lead: 38 returned, 33 of 37 found (`tiny`).
- Time: 35.19 s for 9 calls (3 clips times 3 pitch versions), peak memory 570.9 MB, run r0616. Each call took 3.17 to 4.44 s, which includes running madmom's note-start detector on the audio.
- Takes as a hint: `--tuning-offset` (cents), `--min-duration`, `--min-velocity` and `--sensitivity`. No pitch range, capo or string input.
- Hands off to: it reads a pitch CSV with `frequency` and `confidence` columns at 10 ms per row, torchcrepe's here, and writes MIDI.

**Essentia 2.1b6.dev1389** ([repository](https://github.com/MTG/essentia)). An audio analysis library in C++ with Python wrappers, run from the `essentia-tensorflow` wheel. Several of its algorithms ran.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as mono audio loaded at 44.1 kHz, or 16 kHz for CREPE. The two multi-pitch algorithms ran on S2n, S2s, S3, S4guitar, R1a and R1c.
- Command: all with their defaults.

  ```text
  EqualLoudness -> PredominantPitchMelodia() -> PitchContourSegmentation(hopSize=128)
  PitchYinProbabilistic()
  PitchCREPE(graphFilename=crepe-tiny-1.pb, hopSize=10)
  PitchCREPE(graphFilename=crepe-full-1.pb, hopSize=10)
  EqualLoudness -> MultiPitchKlapuri() or MultiPitchMelodia()
  ```

- Out:
  - Melodia writes a pitch and a confidence every 2.9 ms, 0 Hz where it judges there's no melody. Within 50 cents in 1,818 of S1's 2,624 slices, 1,590 of S2n's 2,529 and 1,318 of R1b's 1,823.
  - PitchContourSegmentation cuts that line into notes (onset, duration, MIDI number). S1: 37 notes returned, all 37 matching real notes, so 37 of 62 found. S2n: 32 returned, 31 of 90 found, all of them melody notes. R1b: 106 returned, 48 of 70 found.
  - Every pitch PitchYinProbabilistic wrote sat on a whole MIDI note, because its first stage rounds its candidates to whole notes. On test tones it read 110 Hz as 103.826 Hz and 440 Hz as 293.665 Hz, and why it lands below the tone was not settled. Within 50 cents in 1,298 of S1's 2,624 slices, 0 of S2n's 2,529 and 42 of R1b's 1,823.
  - PitchCREPE writes a pitch and a confidence every 10 ms. With the `tiny` model, within 50 cents in 2,578 of S1's 2,624 slices, 1,282 of S2n's 2,529 and 1,552 of R1b's 1,823. With `full`, 2,597 of S1's and 1,602 of R1b's.
  - MultiPitchKlapuri and MultiPitchMelodia write a list of pitches every 2.9 ms and no notes. Klapuri gave at most 2 pitches in any frame and a pitch in every frame, the silent count-in included. MultiPitchMelodia gave up to 4 pitches in a frame on S3.
- Time: on 2 cores in batch r0321, Melodia with note cutting took 38.90 s for 8 clips (peak 250 MB), PitchYinProbabilistic 11.31 s (255 MB), PitchCREPE `tiny` 124.72 s (367 MB) and `full` 453.93 s for 3 clips (599 MB). MultiPitchKlapuri took 51.38 s and MultiPitchMelodia 11.42 s for 6 clips, both unpinned (runs r0345 and r0346).
- Takes as a hint: Melodia's `minFrequency` and `maxFrequency`. PitchContourSegmentation takes `tuningFrequency` in Hz, a tuning input (default 440). `Audio2Midi`, which didn't run, has `transpositionAmount` and `tuningFrequency`.
- Hands off to: PitchContourSegmentation also took other trackers' pitch lines (run r0341). On S1, FCPE's line gave 48 notes with 48 of 62 found, PESTO's 62 with 47, torchcrepe `full`'s 48 with 47 and PitchCREPE `tiny`'s 65 with 43. My agents also wrote MIDI files from Melodia's notes.

**FCPE, `torchfcpe` 0.0.4** ([repository](https://github.com/CNChTu/FCPE)). A PyTorch pitch tracker whose name stands for `Fast Context-based Pitch Estimation`. Its 43,363,260-byte model ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, resampled to 16 kHz.
- Command: `spawn_bundled_infer_model(device="cpu").infer(x, sr=16000, decoder_mode="local_argmax", threshold=0.006, f0_min=80, f0_max=880, interp_uv=False)`, the settings of its README example.
- Out: a pitch in Hz every 10 ms, 0 where it judged there's no note, with no confidence. Within 50 cents in 2,598 of S1's 2,624 slices, 704 of S2n's 2,529 and 1,622 of R1b's 1,823.
- Time: 32.57 s for 8 clips (model setup 9.13 s), peak memory 636 MB, batch r0321.
- Takes as a hint: `f0_min` and `f0_max` (its docstring says `Use in post-processing`), `threshold` and `decoder_mode`.
- Hands off to: Essentia's PitchContourSegmentation (run r0341). S1 gave 48 notes with 48 of 62 found. R1b gave 87 notes with 56 of 70 found, after 7 notes with no pitch were dropped.

**librosa 1.0.0 `pyin`** ([repository](https://github.com/librosa/librosa)). Probabilistic YIN, a pitch tracker with no trained weights.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, loaded at 22,050 Hz.
- Command: `librosa.pyin(y, sr=22050, fmin=65.406 (C2), fmax=2093.005 (C7), frame_length=2048, hop_length=512)`
- Out: a pitch in Hz every 23.2 ms (NaN where it hears no note), a voiced flag and a voiced probability, no notes. Within 50 cents in 2,515 of S1's 2,624 slices, 116 of S2n's 2,529 and 1,552 of R1b's 1,823.
- Time: 31.75 s for 8 clips, peak memory 485 MB, batch r0321. S1, the first clip, took 13.18 s and the others 1.39 to 3.46 s.
- Takes as a hint: note range through `fmin` and `fmax`, both required. Its other settings, such as `max_transition_rate`, shape the tracking itself.
- Hands off to: none was tried.

**Onsets and Frames, Magenta's MAESTRO checkpoint** (`magenta` 2.1.4, [repository](https://github.com/magenta/magenta)). Google Magenta's transcription model. The checkpoint was trained on piano recordings, and here it ran on guitar. It needed Python 3.8 and TensorFlow 2.9.1, and its install took 2.0 GB of disk.

- In: S1, S2n and R1c as mono WAV, and S4guitar.
- Command: `onsets_frames_transcription_transcribe --model_dir=<checkpoint>/train S1.wav S2n.wav R1c.wav S4guitar.wav`
- Out: one MIDI file per input (type 1, 220 ticks per quarter note, tempo 120, program 0, no pedal, no pitch bends). S1: 65 returned, 62 of 62 found. S2n: 91 returned, 88 of 90 found (all 48 bass, 40 of 42 melody). R1c: 173 returned, 105 of 148 found, with the found notes starting a median 33.7 ms early. With a 100 ms window R1c gave 119 of 148. S4guitar: 372 returned, 299 of 369 found.
- Time: 39.57 s for the 4 files, peak memory 1,151.0 MB, run r0545. The first file started about 20 s in, after TensorFlow's start-up, and then each file took 4.07 to 5.30 s.
- Takes as a hint: none for pitch range, tuning, instrument or tempo.
- Hands off to: MIDI, not fed further.

**PESTO, `pesto-pitch` 2.0.1** ([repository](https://github.com/SonyCSLParis/pesto)). A pitch tracker from Sony CSL Paris. Its default model file is 534,664 bytes and ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a at 44.1 kHz.
- Command: `pesto.predict(torch.from_numpy(y), 44100, step_size=10.0)`
- Out: time, pitch in Hz and a confidence from 0 to 1 every 10 ms, with a pitch on every slice and no voiced or unvoiced decision. Within 50 cents in 2,590 of S1's 2,624 slices, 1,534 of S2n's 2,529 and 1,599 of R1b's 1,823.
- Time: 49.59 s for 8 clips (setup 4.38 s), peak memory 1,044 MB, batch r0321.
- Takes as a hint: `step_size`, `model_name`, `reduction` and `num_chunks`. No range or tuning input.
- Hands off to: Essentia's PitchContourSegmentation (run r0341). S1 gave 62 notes with 47 of 62 found. R1b gave 169 notes with 43 of 70 found.

**RMVPE through `rmvpe-onnx` 0.2.3** ([RMVPE](https://github.com/Dream-High/RMVPE), [rmvpe-onnx](https://github.com/NewComer00/rmvpe-onnx)). RMVPE is a pitch model for the singing voice. `rmvpe-onnx` is a third-party wrapper that runs its 361,688,443-byte model file on ONNX Runtime.

- In: S1, S2n, S2s, S4, R1b, R2 and R3a as mono WAV, and S4lead.
- Command: `RMVPE(model_path=..., device="cpu").predict(audio, sr)`, and the command line `rmvpe-onnx predict S1.wav --model rmvpe.onnx --device cpu --csv S1.csv`.
- Out: time, pitch in Hz and a confidence from 0 to 1 every 10 ms, plus a 360-bin activation, with a pitch on every slice and no notes. At its default threshold of 0.03 the command line kept 498 of S1's 2,984 slices as voiced. Within 50 cents in 1,710 of S1's 2,624 slices, 1,051 of S2n's 2,529, 2,667 of S4lead's 2,780 and 1,544 of R1b's 1,823.
- Time: 34.68 s for 8 clips, peak memory 1,198.7 MB, run r0516. `predict()` took 16.05 s on S1, the first call, and 1.13 to 2.44 s on the others.
- Takes as a hint: `model_path`, `device`, and `--confidence-threshold` on the command line. No frequency range, tuning or key input.
- Hands off to: none was tried.

**SoX 14.4.2** ([source](https://sourceforge.net/p/sox/code/)). An audio command-line tool, not a transcriber. It ran once, to make the input for the tuning test.

- In: S7flat30 as a WAV file.
- Command: `sox S7flat30.wav S7flat30.plus30c.wav pitch 30`
- Out: a WAV file 24.00 s long (44.1 kHz, 2 channels, 16-bit), 30 cents higher. Runs of the same command gave files that differ by at most 2 in 16-bit units, from the dither SoX adds by default. With `-R`, two runs came out identical.
- Time: 0.26 s, peak memory 9.7 MB, run r0602, unpinned.
- Takes as a hint: the shift in cents, as the argument of its `pitch` effect.
- Hands off to: Basic Pitch read the shifted file (run r0319, in the Basic Pitch entry).

**SwiftF0 0.3.0** ([repository](https://github.com/lars76/swift-f0)). A pitch tracker for one voice or instrument at a time, with its own note cutter and MIDI export. Its 135,090-byte ONNX model ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as WAV through `detect_file`, resampled to 16 kHz.
- Command: `SwiftF0(threads=2).detect_file(path)`, then `segment_notes(result)` with `pitch_hold_ms=80`.
- Out: a pitch and a confidence every 16 ms (a frame counts as voiced at confidence 0.5 or more, per its docstring), and notes as `Note(start, end, pitch_hz)`. Within 50 cents in 2,522 of S1's 2,624 slices, 567 of S2n's 2,529 and 1,555 of R1b's 1,823. Notes: S1 48 returned with 46 of 62 found, R1b 60 returned with 50 of 70, S2n 55 returned with 27 of 90 (18 bass, 9 melody). S1's real melody starts with F#4 at 1.667 s and F#4 again at 2.083 s, and its first notes came out as onset-offset, MIDI pitch and fitted pitch:

  ```text
  1.680-2.512 66 (369.994 Hz)
  2.512-2.944 67 (391.769 Hz)
  2.944-3.776 69
  ```

  The two F#4 notes came out as one.
- Time: 4.39 s for 8 clips (model setup 0.12 s, 0.22 to 0.80 s per clip), peak memory 282 MB, batch r0321.
- Takes as a hint: `fmin` and `fmax` (clamped to 46.875 to 2093.75 Hz), and `pitch_hold_ms` for the note cutter. No tuning, key, tempo or instrument input. With 82.4 to 1319.0 Hz set (run r0131, unpinned), the note lists came out with the same counts and the same matches on the six clips with a known answer.
- Hands off to: its own `segment_notes`. My agents also wrote MIDI files from the note lists.

**torchcrepe 0.0.24** ([repository](https://github.com/maxrmorrison/torchcrepe)). A PyTorch port of the CREPE pitch tracker with CREPE's weights converted, `tiny` (1,962,363 bytes) and `full` (88,991,291 bytes).

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, resampled to 16 kHz.
- Command: `torchcrepe.predict(x, 16000, hop_length=160, fmin=50.0, fmax=2006.0, model=<tiny|full>, return_periodicity=True, batch_size=512, device="cpu")`
- Out: a pitch in Hz and a periodicity from 0 to 1 every 10 ms, with a pitch on every slice. Within 50 cents in 2,576 (`tiny`) and 2,586 (`full`) of S1's 2,624 slices, 175 and 358 of S2n's 2,529, and 809 and 872 of R1b's 1,823. With the default Viterbi decoder, 890 (`tiny`) and 838 (`full`) of R1b's 1,823 melody slices came out at 1,500 Hz or above. With the `weighted_argmax` decoder, `tiny` was within 50 cents in 1,546 of R1b's 1,823 (run r0287). It adds random noise to every pitch, so a re-run gave a different pitch in all 2,934 slices of R1b, a median 8.1 cents apart.
- Time: batch r0321, `tiny` 160.58 s for 8 clips (peak 833 MB) and `full` 1,786.71 s (peak 1,947 MB, 116.2 to 354.5 s per clip).
- Takes as a hint: `fmin`, `fmax`, `model`, `decoder` and `hop_length`, plus threshold and filter helpers.
- Hands off to: Essentia's PitchContourSegmentation (run r0341, `full` with slices below periodicity 0.21 set to 0 Hz): S1 gave 48 notes with 47 of 62 found, R1b 38 notes with 27 of 70. And CREPE Notes (run r0616, above).

**Transkun 2.0.1** ([repository](https://github.com/Yujia-Yan/Transkun)). A piano transcription model. The 56,408,978-byte weights in the package were trained on piano, and here they ran on guitar.

- In: S1, S2n, S3, R1a, R1b and R1c as WAV.
- Command: `transkun <clip>.wav <clip>.mid --device cpu`
- Out: a MIDI file (960 ticks per quarter note, tempo 120, program 0, velocities, sustain pedal as CC64 events, 24 in S2n's file, no pitch bends). S1: 63 returned, 62 of 62 found. S2n: 99 returned, 88 of 90 found (all 48 bass, 40 of 42 melody). S3: 171 returned, 167 of 182. R1a: 134 returned, 112 of 189. R1b: 52 returned, 49 of 70. R1c: 119 returned, 111 of 148.
- Time: 814.45 s for the 6 clips, peak memory 1,490 MB, run r0216. It loads the model for every clip, 83.7 s (S1) to 172.5 s (R1a) each. A re-run of S1 took 40.6 s (run r0464).
- Takes as a hint: `--weight`, `--conf`, `--device`, `--segmentHopSize` and `--segmentSize`. No pitch range, tuning, instrument or tempo input.
- Hands off to: MIDI, not fed further.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Several were stopped by the cloud session's permission system, which refused to run code cloned from other people's repositories. Where my agents wrote steps for me to try a tool myself, the line names the section of [`for-aaron.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/audio-to-notes/for-aaron.md).

- **Ableton Live "Convert to MIDI"**: not read here. The apps and hosted-services research covers it. No steps.
- **[alphaTab](https://alphatab.net/docs/introduction)**: a notation library whose importers include MusicXML and Guitar Pro files, named as a later step for the notes and not run. No steps.
- **AnthemScore**: not read here. The apps and hosted-services research covers it. No steps.
- **[Aria-AMT](https://github.com/EleutherAI/aria-amt)**: a piano transcription model, not attempted since two piano models already ran. As shipped, its transcribe step begins with `assert cuda_is_available(), "CUDA device not found"`, so it stops on a machine without a CUDA graphics card. No steps.
- **Audacity**: named as a host for Vamp plugins (a plugin format for audio analysis) and not read. No steps.
- **[audio_to_midi_melodia](https://github.com/justinsalamon/audio_to_midi_melodia)**: turns MELODIA's melody into MIDI. It needs the MELODIA plugin, whose download page answered the box with HTTP 403. No steps.
- **[basicpitch.io](https://basicpitch.io)**: Basic Pitch's demo site. The page was read and the app was not run. No steps.
- **[CREPE](https://github.com/marl/crepe)**, the original TensorFlow package `crepe` 0.0.16: building it stopped with `ModuleNotFoundError: No module named 'pkg_resources'`, and with the build constraint `setuptools<81` it stopped with `urllib.error.HTTPError: HTTP Error 403: Forbidden` while fetching its weights from github.com. Installing it with the weights put in place was refused by the permission system. Its weights did run, through torchcrepe and Essentia. Steps: section 4.
- **[Deep Salience](https://github.com/rabitt/ismir2017-deepsalience)**: pitch and melody models from a 2017 paper, with no package from their authors, so they run from a clone of their repository. Running its script was refused by the permission system, and no TensorFlow or Keras setup was on the box. Steps: section 13.
- **[Demucs](https://github.com/adefossez/demucs)**: splits a mix into stems. The source-separation agents ran it, and its stems went into Basic Pitch here. No steps.
- **[GAME](https://github.com/openvpi/GAME)** (openvpi): turns singing into notes. Not attempted, for time and disk. No steps.
- **[Harmonica](https://arxiv.org/abs/2609.04640)**: a paper on transcription models, found late and not surveyed in full. It names no code or weights. No steps.
- **[hFT-Transformer](https://github.com/sony/hFT-Transformer)**: a piano transcription model from Sony. Not attempted. Its README lists GPU machines, its checkpoint runs through the repository's own scripts, and the agent that tried Timbre-Trap reports that running its cloned code had been refused, which no file on the box records, so that refusal is not verified. Steps: section 10.
- **Klangio**: not read here. The apps and hosted-services research covers it. No steps.
- **[madmom](https://github.com/CPJKU/madmom)**: a music analysis library, not run on its own here. Its note-start detector ran inside CREPE Notes. No steps.
- **[MELODIA](https://www.upf.edu/web/mtg/melodia)** Vamp plugin: its download page answered the box with HTTP 403, and the download sits behind a form. The same method ran inside Essentia as Melodia. Steps: section 5.
- **[melodyExtraction_JDC](https://github.com/keums/melodyExtraction_JDC)**: a singing-melody model in Keras with no package from its authors, so it runs from a clone of its repository. The permission system refused running the Deep Salience clone, and no TensorFlow or Keras setup was on the box. Steps: section 13.
- **[melodyExtraction_SSL](https://github.com/keums/melodyExtraction_SSL)**: a melody extraction model in Keras by the same author, not run for the same reason. Steps: section 13.
- **Melodyne**: not read here. The apps and hosted-services research covers it. No steps.
- **[MIROS](https://arxiv.org/abs/2603.27528)**: a transcription system that extends YourMT3+, found late and not surveyed in full. The paper gives no code or weights link. No steps.
- **[MR-MT3](https://github.com/gudgud96/MR-MT3)**: a multi-instrument transcription model. Not attempted. It runs from a clone of its repository, which the permission system had refused twice minutes earlier, for MT3 and mt3-pytorch, and its `inference.py` calls `self.model.cuda()` with no device check, so a run without a graphics card needs a code change. Steps: section 10.
- **[MT3](https://github.com/magenta/mt3)** (Magenta): Google's multi-instrument transcription model. Installing its cloned repository the way its notebook does was refused by the permission system. Steps: section 2.
- **[mt3-infer](https://github.com/openmirlab/mt3-infer)** 0.2.0: a third-party package around MT3-family models. It installed, but running its command line was refused by the permission system, so no model was downloaded. Steps: section 14.
- **[mt3-pytorch](https://github.com/kunato/mt3-pytorch)**: a PyTorch port of MT3. Its requirements don't resolve on the box, because `ddsp` needs `crepe`, whose build fails, and running its clone was refused by the permission system. Steps: section 10.
- **[MTANet](https://github.com/Annmixiu/MTANet)**: a singing-melody model with no trained weights published. No steps.
- **[MuScriptor](https://github.com/muscriptor/muscriptor)** (Kyutai and Mirelo): a multi-instrument transcription model. Its weights are gated on Hugging Face (sign-in and acceptance) and no Hugging Face token was on the box. The 411,888,600-byte file was also over the 200 MB download limit in force that day. Steps: section 11.
- **[MuScriptor's hosted page](https://muscriptor.kyutai.org)**: the page needs JavaScript and the app wasn't run. Steps: section 11.
- **[MuseScore 4](https://musescore.org/en/handbook/4/command-line-usage)**: a notation app whose command line converts MIDI, named as a later step and not run. No steps.
- **Music.AI**: not read here. The apps and hosted-services research covers it. No steps.
- **[music21](https://www.music21.org/)**: a music library whose converter reads MIDI, named as a later step for MIDI and not run. No steps.
- **[NeuralNote](https://github.com/DamRsn/NeuralNote)**: a desktop plugin and app for audio to MIDI. Its README describes no command-line use, and it wasn't attempted. Steps: section 3.
- **[Omnizart](https://github.com/Music-and-Culture-Technology-Lab/omnizart)**: a transcription library for instruments, vocals, chords, drums and beats. One install attempt, version 0.5.0 on Python 3.8, stopped while building `vamp` 1.1.0 with `ModuleNotFoundError: No module named 'numpy'`. Steps: section 7.
- **[Onsets and Velocities](https://github.com/andres-fr/iamusica_training)**: a piano model. Not attempted, for time and disk. No steps.
- **[onsets-and-frames](https://github.com/jongwook/onsets-and-frames)** (PyTorch port): publishes no trained checkpoint, so Magenta's own checkpoint ran instead. No steps.
- **[PENN](https://github.com/interactiveaudiolab/penn)** 1.0.0: a pitch tracker. It installed, but `import penn` stopped with `Could not find any lib files matching version pt215cpu`, because its decoder package has compiled files for torch 2.6 to 2.11 and the box had torch 2.15 (runs r0399 and r0423). A second torch version in its own environment was ruled out by the disk limit at the time. Steps: section 12.
- **[pitch-core](https://crates.io/crates/pitch-core)**: a pitch tracker in Rust, found late and not surveyed in full. No steps.
- **[praat-parselmouth](https://github.com/YannickJadoul/Parselmouth)**: Praat's pitch analysis for Python, found late and not surveyed in full. No steps.
- **[pYIN Vamp plugin](https://github.com/c4dm/pyin)**: pYIN as a plugin, with a notes output. The agent that tried it reports that building it was refused by the session's permission settings. No file on the box records that refusal, so it is not verified. Steps: section 6, through Tony.
- **[pyworld](https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder)**: the WORLD vocoder's pitch trackers for Python, found late and not surveyed in full. No steps.
- **[ROSVOT](https://github.com/RickyL-2000/ROSVOT)**: turns singing into MIDI. Its README installs a CUDA build of torch. Not attempted, for time and disk. No steps.
- **[Self-supervised F0 and voicing for monophonic music](https://arxiv.org/abs/2601.11768)** (Bitra and Beigi): a 2026 paper with no code or weights linked. No steps.
- **[Sheet Sage](https://github.com/chrisdonahue/sheetsage)**: turns a pop song into a lead sheet with melody and chords. Its README asks to `ensure you are running Linux and have Docker installed` and downloads `a ~4GB Docker container`, and the box has no Docker. Steps: section 8.
- **[SOME](https://github.com/openvpi/SOME)** (openvpi): turns singing into MIDI. Not attempted, for time and disk. No steps.
- **Sonic Annotator**: a command-line host for Vamp plugins, named and not read. No steps.
- **[Sonic Visualiser](https://www.sonicvisualiser.org/)**: a desktop host for Vamp plugins, named and not run. No steps.
- **[SPICE](https://arxiv.org/abs/1910.11664)**: Google's self-supervised pitch model, found late and not surveyed in full. No steps.
- **Spleeter 2-stem ONNX**: a source-separation model that Omnizart's vocal mode downloads. Not run here, since the source-separation research covers Spleeter. No steps.
- **[Timbre-Trap](https://github.com/sony/timbre-trap)**: a multi-pitch model. Its code was cloned and its 11,353,410-byte checkpoint downloaded, and the agent that tried it reports that running the cloned code and loading the checkpoint was refused by the session's permission settings. No file on the box records that refusal, so it is not verified. Its Hugging Face demo reported `RUNTIME_ERROR`. Steps: section 10.
- **[Tony](https://www.sonicvisualiser.org/tony/)**: a desktop app built on pYIN that shows the pitch and the notes. Not run here, since the pYIN plugin build was reported refused. Steps: section 6.
- **vamp-simple-host**: a command-line host for Vamp plugins that is on the box, but no Vamp plugin could be run (MELODIA's download answered 403 and the pYIN build was reported refused). No steps.
- **[VocalParse](https://github.com/pymaster17/VocalParse)**: turns singing into lyrics, notes and tempo, built on Qwen3-ASR. Its README installs a CUDA build of torch and doesn't describe use without a graphics card. Not attempted, for time and disk. No steps.
- **[VOCANO](https://github.com/B05901022/VOCANO)**: turns singing into MIDI, found late and not surveyed in full. No steps.
- **[yourmt3](https://pypi.org/project/yourmt3/)** 0.1.4: a third-party package of YourMT3 models, with weights from a third party's Hugging Face repository. It installed and a 121,781,787-byte checkpoint downloaded, but the run was refused by the permission system. Steps: section 14.
- **[YourMT3+](https://huggingface.co/spaces/mimbres/YourMT3)**: a multi-instrument transcription model with a demo on Hugging Face. My agents' call to the demo was refused for lack of GPU quota, `You have exceeded your ZeroGPU quota (90s requested vs. 79s left).` A local run was not attempted, since its code has no package from its authors and sits in the demo's repository, and running cloned code had been refused. Steps: section 1.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| aubio | [GPL-3.0-or-later](https://raw.githubusercontent.com/aubio/aubio/master/COPYING) | no model | no training data |
| Basic Pitch | [Apache-2.0](https://raw.githubusercontent.com/spotify/basic-pitch/main/LICENSE) | inside the package, no separate license file found | GuitarSet ([CC BY 4.0](https://zenodo.org/records/3371780)), MAESTRO (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)), Slakh2100 ([CC BY 4.0](https://zenodo.org/records/4599666)), iKala (no license found), MedleyDB (`for non-commercial research use only`, [source](https://zenodo.org/records/1715175)) |
| ByteDance piano transcription | MIT by its `setup.py` classifier, no license file in the [repository](https://github.com/qiuqiangkong/piano_transcription_inference) | [CC BY 4.0](https://zenodo.org/records/4034264) | MAESTRO v2.0.0 (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |
| CREPE Notes | [GPL-3.0](https://raw.githubusercontent.com/xavriley/crepe_notes/main/LICENSE) | runs madmom's onset model, `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0` ([madmom LICENSE](https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE)), plus torchcrepe's weights here | not stated in the record |
| Essentia | [AGPL-3.0](https://raw.githubusercontent.com/MTG/essentia/master/Essentia%20Licensing.txt), and its site says `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications` ([licensing page](https://essentia.upf.edu/licensing_information.html)) | the sources disagree: `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use` ([licensing page](https://essentia.upf.edu/licensing_information.html)) and `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0` ([models LICENSE](https://essentia.upf.edu/models/LICENSE)) | CREPE models: RWC-synth (no license found) and MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)) |
| FCPE | [MIT](https://raw.githubusercontent.com/CNChTu/FCPE/main/LICENSE) | the bundled model has no separate license found, so it sits under the repository's MIT | per its paper, M4Singer (`We agree to the dataset license: CC BY-NC-SA 4.0`, [source](https://raw.githubusercontent.com/M4Singer/M4Singer/master/dataset_license.md)) and VCTK ([CC BY 4.0](https://datashare.ed.ac.uk/handle/10283/3443)), re-synthesized |
| librosa `pyin` | [ISC](https://raw.githubusercontent.com/librosa/librosa/main/LICENSE.md) | no model | no training data |
| Onsets and Frames | [Apache-2.0](https://raw.githubusercontent.com/magenta/magenta/main/LICENSE) | `maestro_checkpoint.zip`, no license statement found | MAESTRO (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |
| PESTO | [LGPL-3.0](https://raw.githubusercontent.com/SonyCSLParis/pesto/master/LICENSE.md) | inside the repository, no separate license found | MIR-1K going by the file names `mir-1k.ckpt` and `mir-1k_g7.ckpt`, not verified, no license found |
| RMVPE via rmvpe-onnx | RMVPE [Apache-2.0](https://raw.githubusercontent.com/Dream-High/RMVPE/main/LICENSE), rmvpe-onnx [MIT](https://raw.githubusercontent.com/NewComer00/rmvpe-onnx/HEAD/LICENSE) | `rmvpe.onnx`, card tag `license: mit` ([card](https://huggingface.co/lj1995/VoiceConversionWebUI/raw/main/README.md)), and which training run made it is not verified | per its paper, MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)), MIR-1K, Cmedia and MIR-ST500 (no licenses found) |
| SoX | GPL-2.0-or-later for the `sox` program and LGPL-2.1-or-later for libsox, `sox.c, and thus SoX-the user application, is distributed under the GPL, while the files that make up libsox are licensed under the less restrictive LGPL.` ([COPYING](https://sourceforge.net/p/sox/code/ci/master/tree/COPYING?format=raw)) | no model | no training data |
| SwiftF0 | [MIT](https://raw.githubusercontent.com/lars76/swift-f0/main/LICENSE) | `model.onnx` inside the package, no separate license found | pitch-benchmark, card license tag `cc-by-nc-sa-4.0` ([card](https://huggingface.co/api/datasets/lars1234/pitch-benchmark)) |
| torchcrepe | [MIT](https://raw.githubusercontent.com/maxrmorrison/torchcrepe/master/LICENSE) | CREPE's weights converted, inside the repository, no separate license found | CREPE's data: MIR-1K, Bach10 and RWC-synth (no licenses found), MedleyDB (`for non-commercial research use only`, [source](https://zenodo.org/records/1715175)), MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)), NSynth ([CC BY 4.0](https://magenta.tensorflow.org/datasets/nsynth)) |
| Transkun | [MIT](https://raw.githubusercontent.com/Yujia-Yan/Transkun/main/LICENSE) | `2.0.pt` inside the package, no separate license found | MAESTRO v3.0.0 (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |

Every clause in full is in [`survey.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/audio-to-notes/survey.md) in the research folder.

</details>

<!-- IMAGES -->
1. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/basic-pitch/S2n-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-basic-pitch-s2n.webp` (900x324, lossless WebP, 5,598 bytes, pixel-identical to the PNG, made with Pillow). Alt: "Piano roll titled Basic Pitch 0.4.0 on S2n, estimate in red over truth in grey. Red bars cover the grey bars of the low and high lines from about 2 to 28 seconds. A few short red notes sit alone near MIDI pitch 83 to 87, and one sits near pitch 24 at the very start." Caption: **Basic Pitch on S2n** / "Synthesized fingerstyle. 137 notes returned, 90 of 90 found."
2. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/transkun/S2n-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-transkun-s2n.webp` (900x324, lossless WebP, 6,060 bytes, pixel-identical, Pillow). Alt: "Piano roll titled Transkun 2.0.1, piano-trained, on S2n, estimate in red over truth in grey. Red bars sit on almost every grey bar between MIDI pitch 43 and 64. A red note at pitch 67 runs from about 2.1 to 3.8 seconds with no grey under it, and a few thin red marks sit near pitch 70." Caption: **Transkun on S2n** / "Piano-trained model, same clip. 99 returned, 88 of 90 found."
3. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/basic-pitch/R1c-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-basic-pitch-r1c.webp` (900x324, lossless WebP, 5,980 bytes, pixel-identical, Pillow). Alt: "Piano roll titled Basic Pitch 0.4.0 on R1c, estimate in red over truth in grey. Grey bars spread between MIDI pitch 40 and 67 over 28 seconds, with red lines on most of them. Some grey bars have no red, and a few red notes stand alone, the highest near pitch 94 at the start." Caption: **Basic Pitch on R1c** / "Real bossa nova guitar from GuitarSet. 156 returned, 120 of 148 found."
4. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/transkun/R1c-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-transkun-r1c.webp` (900x324, lossless WebP, 6,874 bytes, pixel-identical, Pillow). Alt: "Piano roll titled Transkun 2.0.1, piano-trained, on R1c, estimate in red over truth in grey. Red bars sit on most grey bars between MIDI pitch 40 and 70. Several grey bars have no red, and a thin red line at pitch 50 runs through the last seconds of the clip with no grey under it." Caption: **Transkun on R1c** / "Same real clip. 119 returned, 111 of 148 found."

All four sources are 900x324, so the block uses `aspect="25/9"` (900/324). Each picture carries its own title and legend ("truth" grey, "estimate" red) inside the image.

<!-- PENDING MEDIA -->
- `/home/user/gtr/lanes/audio-to-notes/out/sox/S7flat30.plus30c.r0602.wav`: S7flat30 (the S3 chords rendered 30 cents flat) shifted up 30 cents with SoX 14.4.2, run r0602. 24.00 s, 44.1 kHz, 2 channels, 16-bit, 4,233,644 bytes. Exists (checked 2026-11-11). The file Basic Pitch actually read in run r0319 is the same command's output from the day before, `/home/user/gtr/lanes/audio-to-notes/inputs/S7flat30.plus30c.wav` (24.00 s, 4,233,644 bytes, also present, but under `inputs/`, not `out/`). The two differ only by SoX's dither (at most 2 in 16-bit units).
- Nothing else to hear or watch: no tool in this step wrote audio or video (`trials.md`, "Media kept outside git"). Basic Pitch's `--sonify-midi` was not used. The transcribers wrote MIDI, CSV and NPZ files. The `.wav` entries in `out/onsets-frames/` and `out/crepe-notes/<cfg>/` are symlinks to the shared input clips, not outputs.

<!-- NUMBERS -->
RUNDOWN and main read
- 68 tools, apps and services, 30 training datasets: count of `tools.json` entries by `kind` (99 entries: dataset 30, paper 1, the other 68 are open-source 25, research-model 22, library 10, commercial-app 9, api 2).
- 13 tools ran on the cloud box: `trials.md` "Summary: what ran here" table, 13 rows (Basic Pitch, SwiftF0, librosa pyin, FCPE, PESTO, torchcrepe, aubio, Essentia, Transkun, ByteDance, RMVPE via rmvpe-onnx, Onsets and Frames, CREPE Notes). SoX also ran (input preparation, `trials.md` Gap round 2 A2, run r0602) and has its own entry in the folded block, which therefore holds 14 entries. In `tools.json`, RMVPE and rmvpe-onnx are two entries for the same runs.
- up to 16 of the 17 test clips: INPUTS.md "Clips present: 17" | Basic Pitch ran on S1, S2n, S2s, S3, S4 (with stems S4guitar, S4lead), S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2, R3a (r0234) and R3b, R3c (r0264) | only R2full unused.
- four write MIDI straight from audio, three trained on piano: Basic Pitch | ByteDance (weights trained on MAESTRO V2.0.0, tools.json), Onsets and Frames (MAESTRO checkpoint, trials.md Gap round 1), Transkun (Maestro v3.0.0, tools.json) are the piano-trained three.
- S2n: 29.357 s, 90 notes, alternating thumb bass plus melody (INPUTS.md) | "29-second" as in for-aaron.md ("29 s").
- Basic Pitch S2n 137 returned, 90 of 90 found: e0493 (n_est 137, n_matched 90).
- ByteDance S2n 87 returned, 79 found: e1393 (n_est 87, matched 79).
- Onsets and Frames S2n 91 returned, 88 found: e1571.
- Transkun S2n 99 returned, 88 found: e0438.
- R1c: 28.235 s, GuitarSet bossa nova comp, 148 notes (INPUTS.md) | "28 seconds" as in for-aaron.md ("28 s").
- R1c Basic Pitch 156 returned, 120 found: e0489. ByteDance 87, 63: e1392. Onsets and Frames 173, 105: e1572. Transkun 119, 111: e0436.
- rundown ranges 79 to 90 and 63 to 120: the four tools' matched counts above.

Alt texts (read off the pictures, which plot the same output files)
- Transkun S2n red note at pitch 67 from about 2.1 to 3.8 s: trials.md Transkun first S2n notes (`2.146-3.773 67 89`). Basic Pitch S2n red note near pitch 24 at the start and near 83: trials.md Basic Pitch first S2n notes (`0.000-0.150 24 49`, `2.695-2.927 83 39`). Other positions (pitch ranges, the line at pitch 50 on Transkun R1c, the note near 94 on Basic Pitch R1c) are read from the pictures' axes.
- captions: counts as in the main read (e0493, e0438, e0489, e0436).

Folded block 1, clip key
- S1 30-second, 62 notes: INPUTS.md (29.833 s, "62 notes") | "30 s" in for-aaron.md.
- S3 24 seconds, 182 notes: INPUTS.md (24.000 s, 182 notes).
- S4 467 notes besides the drums: e0499 n_truth 467 (trials.md table "S4 | 467") | INPUTS.md lists 661 notes with drums.
- S5capo2 capo on fret 2, 2 semitones higher: INPUTS.md.
- S5dropd four bass notes below the usual lowest note: INPUTS.md ("D2 (string 6 open, 4 notes)", "the audio contains notes below E2") | trials.md "the four D2 notes, 73.4 Hz".
- S6taps 32 hits: INPUTS.md ("32 taps").
- S7flat30 30 cents flat: INPUTS.md.
- R1a 189 notes, R1b 70 notes: INPUTS.md.
- 50 ms, 50 cents, one-to-one match: evals.jsonl definitions for subcommand notes (e0490 "onset_tolerance=0.05, pitch_tolerance=50.0", "maximum bipartite matching").
- 10 ms slices, within 50 cents, raw pitch: evals.jsonl f0 definitions (e0113 "built from the truth notes on a 10 ms grid", "raw_pitch_accuracy(cent_tolerance=50) ... voicing decision ignored").
- slice counts N of M = raw_pitch_accuracy x n_ref_voiced_frames from evals.jsonl (each product is within 0.002 of a whole number | M = n_ref_voiced_frames: S1 2,624, S2n 2,529 (melody voice), R1b 1,823 (voice lead), S4lead 2,780).
- 2 CPU cores, unpinned shares the CPU: ENVIRONMENT.md "How runs were timed" | trials.md "How to read the numbers" (`--nolock`).
- Local runs cost nothing beyond the cloud session itself: ENVIRONMENT.md "Cost".
- Memory figures: the ledger's "MB" and GNU time's "MiB" are the same unit here (trials.md "The monophonic f0 trackers: shared facts": "peak RSS in MiB = GNU time's KiB / 1024, the unit gtr-run's "MB" also uses"), so all are written MB.

aubio
- 0.4.9, `aubio-tools` 0.4.9-4.4build1: trials.md aubio section.
- clips S1, S2n, S2s, S4, S4lead, R1b, R2, R3a: trials.md | r0130 (8 inputs).
- `yinfft`, `hfc`: trials.md ("pitch method yinfft", "onset method hfc").
- 5.805 ms hop, `time_s pitch_hz`, 0 Hz in silence, no confidence | `midi_pitch onset_s offset_s`: trials.md.
- 2,511 of 2,624 (S1): e0293 (RPA 0.956936 x 2624). 1,242 of 2,529 (S2n): e0295. 1,585 of 1,823 (R1b): e0292.
- S1 62 returned, 3 of 62 found at 50 ms: e0305. 61 of 62 at 100 ms: e0352. median 56.2 ms late: e0350 / trials.md ("a median 56.2 ms after the truth onsets").
- R1b 169 returned, 52 of 70: e0303. S2n 43 returned, 0 found: e0308.
- 4.23 s, 35.2 MB, r0130, unpinned single-threaded: runs.jsonl r0130 (wall 4.23, max_rss_mb 35.2, locked false) | trials.md.
- 0.14 to 0.30 s, 0.19 to 0.42 s per clip: trials.md.
- flags `-p -l -s -B -H -r -u -O -t -M -d`, no range/tuning/key input: trials.md "Constraint inputs".
- MIDI conversion program 24, velocity 80, 120 BPM: trials.md "Outputs for other lanes" (`scripts/notes_csv_to_midi.py`) | MuseScore not run: tools.json aubio handoffs_out.

Basic Pitch
- 0.4.0, `nmp.tflite` 204,448 bytes: trials.md Basic Pitch section.
- paper title `A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation`: survey.md section 13 (Bittner et al., ICASSP 2022).
- 16 WAV files listed, R3a.mp4, R3b and R3c (r0264): trials.md | runs.jsonl r0234 (16 inputs), r0264.
- command lines: trials.md runs 1 and 4 | "same 64 notes": trials.md run 4 ("identical to run 1's S1 list (64 notes)").
- program 4, Electric Piano 1, 220 ticks per quarter, tempo 120, pitch bends: trials.md | tools.json outputs ("program Electric Piano 1 (observed program 4, 0-based)").
- CSV header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`, `.npz`: trials.md.
- R3a.mp4 108 notes vs 105: trials.md run 5. R3b 129, R3c 87: trials.md (r0264). R2 334: trials.md note counts.
- first S2n notes (six lines) and "inside the silent count-in bar": trials.md "First S2n notes from the MIDI".
- 62.37 s, 393 MB (393 MiB), r0234: trials.md run 1 (GNU time) | runs.jsonl r0234 max_rss_mb 393.0. 0.87 s (R3a, 18 s), 3.71 s (S4, 38.7 s), 20.36 s (S1 first call): trials.md run 1.
- hint parameters, no tuning/capo/key/instrument input: trials.md "Constraint inputs".
- 82.4 to 1319.0 Hz, "E2 to about E6, the guitar's range": trials.md run 2. S5dropd bass 44 of 48: e0544. four D2 notes 73.4 Hz: trials.md. floor 73.4 Hz, 48 of 48, r0349: e1335, trials.md.
- htdemucs_6s stems: guitar stem 342 notes, 233 of 369: e0652. true guitar track 302: e0502. full mix 249: e0682. bass stem 142 notes, 46 of 61: e0657. run r0243: trials.md handoff section.
- SoX-shifted S7flat30: 265 notes, 139 of 182: e1203 | unshifted 112 notes, 83 found: e0514 | run r0319: trials.md "Tuning-correction re-run test".
- table: S1 e0490 | S2n e0493 (melody 42/42, bass 48/48) | S2s e0495 | S3 e0497 | S4 e0499 (bass 26/61, chord 243/369, melody 24/37) | S4guitar e0502 | S4lead e0505 | S5capo2 e0507 | S5dropd e0510 | S6taps e0512 | S7flat30 e0514 | R1a e0486 | R1b e0488 | R1c e0489.

ByteDance
- 0.0.6, weights 171,966,578 bytes from Zenodo, trained on piano: trials.md ByteDance section.
- `librosa.load(path, sr=16000, mono=True)`, error `AttributeError: No librosa.core attribute audio`, librosa 0.11: trials.md "Dead end".
- command `PianoTranscription(...)`: trials.md.
- 384 ticks per quarter, tempo 120, program 0, CC64, 18 in S2n.mid, no pitch bends: trials.md "Output".
- S2n 87 returned, 79 of 90, bass 48/48, melody 31/42: e1393. R1c 87 returned, 63 of 148: e1392.
- 159.3 s, setup 8.6 s, S2n 75.8 s, R1c 73.7 s, 998.8 MB, r0401 unpinned torch 2 threads: trials.md | runs.jsonl r0401 (wall 159.3, max_rss_mb 998.8, locked false).
- re-run 27.8 s, r0464: trials.md verification log ("ByteDance S2n 75.8 s in r0401 (unpinned), 27.8 s in r0464").
- `model_type`, `checkpoint_path`, `device`, none for range/tuning/instrument: trials.md "Constraint inputs".

CREPE Notes
- 0.2.0 | makers' quote `Post-processing for the CREPE pitch tracker to turn f0 pitch estimates into discrete notes (MIDI)`: tools.json what / trials.md A3.
- madmom copy from another lane's build: trials.md A3 install.
- inputs S1, R1b, S4lead, 10 ms rows, three versions (full, tiny, full with periodicity below 0.21 set to 0 Hz): trials.md A3 "Input preparation".
- command: trials.md A3 "Run".
- type 1, 220 ticks per quarter, program 0, tempo 120, velocities 7 to 127, no pitch bends: trials.md A3 "Output".
- `Tuning offset: 6.000000000000005 cents`: trials.md A3.
- S1 tiny 62 returned, 62 of 62: e1786. S1 full 62, 61: e1781. R1b full 94, 29 of 70: e1783. 48 notes at MIDI 90 or above from frames at 1,500 Hz or above: trials.md A3 ("R1b has 48 and 52 notes at MIDI 90 or above"). S4lead tiny 38, 33 of 37: e1788.
- 35.19 s, 9 calls, 570.9 MB, r0616, 3.17 to 4.44 s per call, onset detection inside each call: runs.jsonl r0616 | trials.md A3.
- hints `--tuning-offset` (cents), `--min-duration`, `--min-velocity`, `--sensitivity`, no pitch range/capo/string input: trials.md A3 "Constraints accepted".
- reads `frequency` and `confidence` columns: trials.md A3.

Essentia
- 2.1b6.dev1389, `essentia-tensorflow` wheel: trials.md Essentia section.
- clips, 44.1 kHz / 16 kHz: trials.md ("`MonoLoader(sampleRate=44100)`, or 16000 for CREPE") | multi-pitch clips S2n, S2s, S3, S4guitar, R1a, R1c: trials.md multi-pitch section.
- the five command lines: trials.md runs 1 to 4 and multi-pitch "Runs".
- Melodia 2.9 ms (hopSize 128), 0 Hz unvoiced: trials.md. Within 50 cents 1,818 (S1, e0997), 1,590 (S2n, e1000), 1,318 (R1b, e0994).
- PitchContourSegmentation S1 37 returned, 37 matched: e1038. S2n 32 returned, 31 of 90, all melody (bass 0/48, melody 31/42): e1040. R1b 106 returned, 48 of 70: e1036.
- PitchYinProbabilistic whole-MIDI outputs and the rounding cause: trials.md Gap round 2 A6. 110 Hz read as 103.826 Hz, 440 Hz as 293.665 Hz: trials.md Essentia section and A6. "why it lands below the tone was not settled": A6 "What stays UNVERIFIED". Counts 1,298 (S1, e1014), 0 (S2n, e1016), 42 (R1b, e1011).
- PitchCREPE tiny 2,578 (S1, e1027), 1,282 (S2n, e1028), 1,552 (R1b, e1025) | full 2,597 (S1, e1205), 1,602 (R1b, e1204).
- Klapuri at most 2 pitches, a pitch in every frame including the silent count-in | MultiPitchMelodia up to 4 on S3: trials.md multi-pitch "Output".
- times: Melodia+PCS 38.90 s (250 MiB), PitchYinProbabilistic 11.31 s (255 MiB), CREPE tiny 124.72 s (367 MiB), CREPE full 453.93 s for 3 clips (599 MiB): trials.md runs 1 to 4 (batch r0321). Klapuri 51.38 s, MultiPitchMelodia 11.42 s, 6 clips, unpinned, r0345, r0346: trials.md | runs.jsonl.
- hints `minFrequency`, `maxFrequency`, `tuningFrequency` (Hz, default 440), `Audio2Midi` `transpositionAmount` and `tuningFrequency`: trials.md "Constraint inputs" | tools.json constraints_accepted ("tuningFrequency (any integer Hz, default 440 ...)").
- handoff r0341, S1: FCPE 48 notes, 48 found (e1319) | PESTO 62, 47 (e1322) | torchcrepe full 48, 47 (e1325) | Essentia CREPE tiny 65, 43 (e1329).
- MIDI from Melodia notes: trials.md "Outputs for other lanes".

FCPE
- `torchfcpe` 0.0.4, `Fast Context-based Pitch Estimation`, 43,363,260-byte model: trials.md FCPE section.
- command and "the settings of the README example": trials.md.
- 10 ms, 0 where unvoiced, no confidence: trials.md "Output".
- 2,598 (S1, e0132), 704 (S2n, e0134), 1,622 (R1b, e0130).
- 32.57 s, setup 9.13 s, 636 MiB, batch r0321: trials.md.
- hints `f0_min`, `f0_max`, `threshold`, `decoder_mode` | docstring quote `Use in post-processing`: trials.md "Constraint inputs".
- PCS handoff S1 48 notes, 48 of 62 (e1319) | R1b 87 notes, 56 of 70 (e1318) | 7 NaN-pitch notes dropped on R1b: trials.md handoff section.

librosa pyin
- 1.0.0, "probabilistic YIN", no trained weights: trials.md | tools.json what.
- 22,050 Hz load | command copied from trials.md (with its "(C2)" and "(C7)" annotations).
- 23.2 ms hop, NaN unvoiced, voiced flag, voiced probability, no notes: trials.md.
- 2,515 (S1, e0121), 116 (S2n, e0122), 1,552 (R1b, e0120).
- 31.75 s, 485 MiB, batch r0321, S1 13.18 s first, others 1.39 to 3.46 s: trials.md.
- `fmin`, `fmax` required, `max_transition_rate`: trials.md "Constraint inputs".

Onsets and Frames
- `magenta` 2.1.4, MAESTRO checkpoint, trained on piano: trials.md Gap round 1.
- Python 3.8, TensorFlow 2.9.1, venv 2.0 GB: trials.md Gap round 1 "Install".
- inputs S1, S2n, R1c (mono WAV) and S4guitar: trials.md (symlinks to `S1.mono.wav`, `S2n.mono.wav`, `R1c.mono.wav`, `S4/stems/guitar.wav`).
- command: trials.md "Run".
- type 1, 220 ticks per quarter, tempo 120, program 0, no pedal, no pitch bends: trials.md "Output".
- S1 65, 62 of 62 (e1570) | S2n 91, 88 of 90, bass 48/48, melody 40/42 (e1571) | R1c 173, 105 of 148 (e1572), median 33.7 ms early (trials.md), 119 of 148 at 100 ms (e1574) | S4guitar 372, 299 of 369 (e1573).
- 39.57 s, 1,151.0 MB, r0545: runs.jsonl. first file about 20 s in, 4.07 to 5.30 s per file: trials.md ("S1 5.30 s, S2n 4.07 s, R1c 4.31 s, S4 guitar stem 4.97 s").
- no pitch range, tuning, instrument or tempo input: trials.md "Constraint inputs".

PESTO
- `pesto-pitch` 2.0.1, Sony CSL Paris, default model `mir-1k_g7.ckpt` 534,664 bytes: trials.md PESTO section.
- command: trials.md.
- 10 ms, confidence 0 to 1, pitch on every frame, no voiced/unvoiced decision: trials.md "Output".
- 2,590 (S1, e0146), 1,534 (S2n, e0147), 1,599 (R1b, e0143).
- 49.59 s, setup 4.38 s, 1,044 MiB, batch r0321: trials.md.
- hints `step_size`, `model_name`, `reduction`, `num_chunks`, no range or tuning input: trials.md.
- PCS handoff S1 62 notes, 47 of 62 (e1322) | R1b 169, 43 of 70 (e1321).

RMVPE / rmvpe-onnx
- 0.2.3, third-party wrapper, `rmvpe.onnx` 361,688,443 bytes, ONNX Runtime: trials.md Gap round 1 RMVPE section.
- "a pitch model for the singing voice": trials.md ("a frame-wise f0 model for the singing voice").
- inputs: trials.md (`<id>.mono.wav` and S4lead stereo stem).
- commands: trials.md "Run" and CLI paragraph.
- 10 ms, confidence 0 to 1, 360-bin activation, pitch every frame, no notes: trials.md "Output facts".
- threshold 0.03, 498 of 2,984 voiced: trials.md CLI printout ("Frames : 2984", "Voiced : 498 (16.7 %)").
- 1,710 (S1, e1478), 1,051 (S2n, e1479), 2,667 of 2,780 (S4lead, e1482), 1,544 (R1b, e1483).
- 34.68 s, 1,198.7 MB, r0516 | `predict()` 16.05 s on S1, 1.13 to 2.44 s others: trials.md | runs.jsonl.
- hints `model_path`, `device`, `--confidence-threshold`, no frequency range/tuning/key: trials.md "Constraint inputs".

SoX
- 14.4.2: trials.md A2 and "Media kept outside git".
- command `sox S7flat30.wav S7flat30.plus30c.wav pitch 30`: trials.md "Tuning-correction re-run test".
- 24.00 s, 44.1 kHz, 2 channels, 16-bit: trials.md A2 / "Media kept outside git".
- at most 2 in 16-bit units, dither by default, `-R` identical: trials.md A2.
- 0.26 s, 9.7 MB, r0602 unpinned: runs.jsonl r0602.
- shift in cents as the `pitch` argument: tools.json SoX outputs ("audio file (pitch shift in cents)").

SwiftF0
- 0.3.0, ONNX model 135,090 bytes inside the wheel: trials.md SwiftF0 section.
- what it is: tools.json what ("a pitch detector for monophonic audio (one voice or instrument, not chords) ... has its own note segmenter and MIDI export | ONNX").
- `detect_file`, 16 kHz, command with `pitch_hold_ms=80`: trials.md.
- 16 ms, voiced at confidence 0.5 or more per docstring, `Note(start, end, pitch_hz)`: trials.md.
- 2,522 (S1, e0113), 567 (S2n, e0114), 1,555 (R1b, e0112).
- S1 48 returned, 46 of 62 (e0152) | R1b 60, 50 of 70 (e0151) | S2n 55, 27 of 90, bass 18, melody 9 (e0153).
- F#4 at 1.667 s and 2.083 s | first three notes | "came out as one note": trials.md SwiftF0 "Output (notes)".
- 4.39 s, setup 0.12 s, 0.22 to 0.80 s per clip, 282 MiB, batch r0321: trials.md.
- `fmin`, `fmax` clamped 46.875 to 2093.75 Hz, `pitch_hold_ms`, no tuning/key/tempo/instrument: trials.md "Constraint inputs".
- 82.4 to 1319.0 Hz, r0131 unpinned, same counts and the same matched notes on the six clips with a known answer: trials.md (e0343 to e0349).

torchcrepe
- 0.0.24, `tiny.pth` 1,962,363 bytes, `full.pth` 88,991,291 bytes: trials.md torchcrepe section.
- command: trials.md "Run".
- 10 ms, periodicity 0 to 1, pitch every frame: trials.md "Output".
- S1 2,576 tiny (e0747), 2,586 full (e0758) | S2n 175 (e0749), 358 (e0760) | R1b 809 (e0745), 872 (e0756).
- 890 (tiny) and 838 (full) of 1,823 at 1,500 Hz or above: trials.md "Oddity, measured".
- weighted_argmax tiny R1b 1,546 of 1,823: e0975 (run r0287).
- random noise, 2,934 of 2,934 frames different, median 8.1 cents: trials.md (verifier re-run r0464).
- tiny 160.58 s, 833 MiB | full 1,786.71 s, 1,947 MiB, 116.2 to 354.5 s per clip: trials.md (batch r0321).
- hints: trials.md "Constraint inputs".
- PCS handoff (full, periodicity >= 0.21) S1 48 notes, 47 of 62 (e1325) | R1b 38, 27 of 70 (e1324).

Transkun
- 2.0.1, `2.0.pt` 56,408,978 bytes, trained on piano: trials.md Transkun section.
- inputs S1, S2n, S3, R1a, R1b, R1c: trials.md.
- command `transkun <clip>.wav <clip>.mid --device cpu`: trials.md.
- 960 ticks per quarter, tempo 120, program 0, velocities, CC64, 24 in S2n.mid, no pitch bends: trials.md "Output".
- S1 63, 62 of 62 (e0437) | S2n 99, 88 of 90, bass 48/48, melody 40/42 (e0438) | S3 171, 167 of 182 (e0439) | R1a 134, 112 of 189 (e0434) | R1b 52, 49 of 70 (e0435) | R1c 119, 111 of 148 (e0436).
- 814.45 s, 1,490 MiB, r0216, per clip 83.7 s (S1) to 172.5 s (R1a): trials.md.
- re-run S1 40.6 s, r0464: trials.md verification log.
- hints `--weight`, `--conf`, `--device`, `--segmentHopSize`, `--segmentSize`, no range/tuning/instrument/tempo: trials.md.

Folded block 2 (did not run)
- permission system refusals ("[Code from External]"): trials.md "Gap round 1" intro, A5, mt3-infer and yourmt3 sections.
- for-aaron.md section numbers: for-aaron.md headings 1 to 14.
- Aria-AMT `assert cuda_is_available(), "CUDA device not found"`: tools.json not_run_reason.
- audio_to_midi_melodia, MELODIA HTTP 403, download form: tools.json not_run_reason | trials.md.
- CREPE 0.0.16 errors `ModuleNotFoundError: No module named 'pkg_resources'` (newest setuptools) and, with the build constraint `setuptools<81`, `urllib.error.HTTPError: HTTP Error 403: Forbidden`: trials.md CREPE gap round 1.
- Deep Salience, JDC, SSL: trials.md A5 | tools.json | 2017 paper: tools.json what ("ISMIR 2017").
- Demucs run by the source-separation lane, stems into Basic Pitch: tools.json not_run_reason.
- GAME, SOME, Onsets and Velocities, ROSVOT, VocalParse "for time and disk": tools.json not_run_reason.
- Harmonica, MIROS, VOCANO, SPICE, praat-parselmouth, pyworld, pitch-core "found by the verifier's completeness search and not surveyed in full": tools.json.
- hFT-Transformer reasons: trials.md / tools.json.
- madmom inside CREPE Notes: tools.json not_run_reason.
- MR-MT3 `self.model.cuda()`, refused twice, code change needed: trials.md MR-MT3.
- MT3 notebook install refused: trials.md MT3.
- mt3-infer 0.2.0 installed, CLI refused, nothing downloaded: trials.md Gap round 2 `mt3-infer` section.
- mt3-pytorch `ddsp` needs `crepe`, build fails | clone run refused: trials.md MT3.
- MTANet no weights: trials.md A5.
- MuScriptor gated, no token, 411,888,600 bytes, 200 MB limit: trials.md "From the docs lane's survey" | trials.md "Tools not run here" intro (200 MB notice).
- MuScriptor hosted page needs JavaScript: tools.json not_run_reason.
- NeuralNote no command-line use, not attempted: trials.md NeuralNote.
- Omnizart 0.5.0, Python 3.8, `vamp` 1.1.0, `ModuleNotFoundError: No module named 'numpy'`: trials.md Omnizart gap round 1.
- onsets-and-frames port no checkpoint: tools.json not_run_reason.
- PENN 1.0.0 `Could not find any lib files matching version pt215cpu`, torch 2.6 to 2.11 vs 2.15, r0399, r0423, disk limit: trials.md A1 and "From the docs lane's survey" | tools.json.
- pYIN Vamp build refused, Timbre-Trap code run refused, both only the trial agent's report: trials.md "Verification log (verify-trials-audio-to-notes)" "Still UNVERIFIED" ("The two permission refusals (pYIN build, Timbre-Trap code) ... the trial agent's report, with no file on the box recording them"). hFT-Transformer's reason cites the Timbre-Trap refusal (tools.json), so it carries the same note. Tony: tools.json.
- Self-supervised F0 paper, 2026: trials.md A7 (submitted 2026-01-16).
- Sheet Sage quotes `ensure you are running Linux and have Docker installed`, `a ~4GB Docker container`, no Docker: trials.md Sheet Sage.
- Spleeter 2-stem ONNX, Omnizart's vocal mode: tools.json what / not_run_reason.
- Timbre-Trap `tt-orig.pt` 11,353,410 bytes, refused, Space `RUNTIME_ERROR`: trials.md Timbre-Trap.
- vamp-simple-host on the box, no plugin runnable: tools.json not_run_reason.
- VocalParse built on Qwen3-ASR, CUDA 12.4 torch: tools.json what, version, not_run_reason.
- YourMT3+ quota quote `You have exceeded your ZeroGPU quota (90s requested vs. 79s left).`, local run not attempted: trials.md YourMT3+ | tools.json.
- yourmt3 0.1.4, `YPTF+Single.pt` 121,781,787 bytes, run refused: trials.md Gap round 2 `yourmt3` section.

Folded block 3 (licenses), all from `tools.json` license fields unless noted
- aubio GPL-3.0-or-later (COPYING url). Basic Pitch Apache-2.0, model files no separate license, training data GuitarSet CC BY 4.0, MAESTRO quote, Slakh2100 CC BY 4.0, iKala license null, MedleyDB quote substring `for non-commercial research use only`.
- ByteDance MIT by setup.py classifier, no LICENSE file | weights CC BY 4.0 (Zenodo 4034264) | MAESTRO V2.0.0.
- CREPE Notes GPL-3.0 | madmom models quote `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0` | training data list empty in tools.json.
- Essentia AGPL-3.0 | quote substring `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications` | models: quote substrings `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use` and `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0` (tools.json unverified: "sources disagree") | MDB-stem-synth quote substring | RWC license null.
- FCPE MIT | bundled model note | M4Singer quote substring `We agree to the dataset license: CC BY-NC-SA 4.0` | VCTK CC BY 4.0.
- librosa ISC. Onsets and Frames Apache-2.0, checkpoint no license statement, MAESTRO.
- PESTO LGPL-3.0 | checkpoints | MIR-1K by names only (tools.json unverified).
- RMVPE Apache-2.0 | rmvpe-onnx MIT | `license: mit` card tag | training run UNVERIFIED (trials.md Verification log round 1 "Still UNVERIFIED") | paper data MDB-stem-synth, MIR-1K, Cmedia, MIR ST500.
- SoX licenses and quote: trials.md A2 / tools.json SoX.
- SwiftF0 MIT | model.onnx | pitch-benchmark card tag `cc-by-nc-sa-4.0`.
- torchcrepe MIT | CREPE weights converted | CREPE training data list (MIR-1K, Bach10, RWC-synth, MedleyDB, MDB-stem-synth, NSynth CC BY 4.0).
- Transkun MIT | `2.0.pt` | Maestro v3.0.0.
- The MAESTRO quote in cells is an exact substring of `The dataset is made available by Google LLC under a Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0) license.` | the MDB-stem-synth one of `MDB-stem-synth is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).`

Places where the sources disagree or look stale
- `tools.json` entries `mt3-infer` and `yourmt3 (PyPI, third party)` still give the gap round 1 reason ("added to the survey | not run") and `for_aaron: false`, while `trials.md` Gap round 2 says both were installed and their runs refused, with steps in `for-aaron.md` section 14. The fragment follows `trials.md`.
- CREPE Notes evals e1781 to e1791 are gtr-eval 0.12.0 in `evals.jsonl`, while `trials.md` A3 and its header say gtr-eval 0.11.1. The values match.
- `tools.json` keeps YourMT3+ at `tried: true` (`tried_how: public-space`) although its one call returned the quota error and no transcription. The fragment lists it under "didn't run", as PENN was moved in gap round 2 item A1.
- `tools.json` gives exit code null for aubio r0130 and wall null for torchcrepe r0287. The ledger has exit 0 and wall 141.74 s.
