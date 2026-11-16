<!-- RUNDOWN -->
- **15 of the 68 tools, apps and services my agents listed for turning sound into notes ran on the cloud box.** Four write MIDI, a list of notes, straight from the audio. On a 90-note clip I synthesized they returned 87 to 137 notes, with 79 to 90 of the real ones among them.

<!-- SECTION -->
## Turning sound into notes

This step writes down a recording's notes, with pitch, start and end. 15 of the 68 tools, apps and services my agents listed for it ran on the cloud box, and four write MIDI (a list of notes) straight from the audio. On R1c, a real bossa nova guitar recording, those four returned 87 to 173 notes, with 63 to 120 of its 148 notes among them.

<ao-compare cols="2" aspect="25/9">
<figure><img src="/media/guitar-tab-tools/audio-to-notes-basic-pitch-s2n.webp" alt="Piano roll, a chart of notes as bars with time across and MIDI pitch up, titled Basic Pitch 0.4.0 on S2n, estimate in red over truth in grey. Red bars cover the grey bars of the low and high lines from about 2 to 28 seconds. Four short red notes sit alone near MIDI pitch 83 to 87, and one sits near pitch 24 at the very start."><figcaption><b>Basic Pitch on S2n</b><span class="ao-meta">Synthesized fingerstyle. 137 notes returned, 90 of 90 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-transkun-s2n.webp" alt="Piano roll titled Transkun 2.0.1, piano-trained, on S2n, estimate in red over truth in grey. Red bars sit on the grey bars between MIDI pitch 43 and 64. All 48 bass notes and 40 of the 42 melody notes were found. A red note at pitch 67 runs from about 2.1 to 3.8 seconds with no grey under it, and thin red marks sit near pitch 70."><figcaption><b>Transkun on S2n</b><span class="ao-meta">Piano-trained model, same clip. 99 returned, 88 of 90 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-basic-pitch-r1c.webp" alt="Piano roll titled Basic Pitch 0.4.0 on R1c, estimate in red over truth in grey. Grey bars spread between MIDI pitch 40 and 69 over 28 seconds, with red lines along them, and 120 of the 148 real notes were found. Some grey bars have no red, and some red notes have no grey under them, the highest near pitch 94 at the start."><figcaption><b>Basic Pitch on R1c</b><span class="ao-meta">Real bossa nova guitar from GuitarSet. 156 returned, 120 of 148 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-transkun-r1c.webp" alt="Piano roll titled Transkun 2.0.1, piano-trained, on R1c, estimate in red over truth in grey. Red bars sit on grey bars between MIDI pitch 40 and 69, and 111 of the 148 real notes were found. Other grey bars have no red, and a thin red line at pitch 50 runs through the last seconds of the clip with no grey under it."><figcaption><b>Transkun on R1c</b><span class="ao-meta">Same real clip. 119 returned, 111 of 148 found.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

The clips, by id. S1 is a 30-second single-note melody I synthesized (62 notes). S2n is the fingerstyle clip above, 29 seconds of a bass line under a melody (90 notes), synthesized so every note is known. S2s is the same 90 notes on steel strings. S3 is 24 seconds of strummed chords (182 notes). S4 is a band mix of bass, drums, strummed guitar and a lead line (467 notes besides the drums), and S4guitar and S4lead are its guitar and lead tracks on their own. S5capo2 is S2n played on the same strings and frets with a capo on fret 2 (a capo is a clamp across the strings that raises every note), so every note sounds two frets higher. S5dropd is the same piece in Drop D, with the lowest string tuned down to D, so four bass notes sit below the usual lowest note. S6taps is S2s with 32 drum-kit hits mixed in, standing in for taps on the guitar body. S7flat30 is S3 rendered 30 cents flat (a cent is a hundredth of the step between two frets). R1a, R1b and R1c are real guitar recordings from GuitarSet: R1a is an accompaniment part (189 notes), R1b a single-note solo (70 notes) and R1c the bossa nova clip above (28 seconds, 148 notes). R2 is a real band song with singing, and R3a, R3b and R3c are real guitar videos. Those four have no known answer. The 17th clip, R2full, is the whole song R2 is cut from, and no tool here ran on it. Basic Pitch ran on the other 16.

Four of the tools write MIDI straight from the audio. Three of them were trained on piano: ByteDance's model, Onsets and Frames, and Transkun. The fourth is Basic Pitch. Of the rest, SoX only prepared a test file, and the others track pitch over time or turn a tracked pitch into notes. A real note counts as found when a returned note starts within 50 ms of it and is within 50 cents (half the step between two frets) of its pitch, and each returned note can match one real note at most. The pitch trackers write one pitch per short slice of time, so for them the count is in 10 ms slices. It's how many of the slices where the melody plays had the tracker's pitch within 50 cents of the melody. S2n has a melody and a bass line at once, and these trackers follow one pitch at a time, so my agents also checked their pitch against the bass line, in S2n's 2,523 bass slices. It was within 50 cents of the bass in 989 of them for aubio, 0 for Essentia's Melodia and 1,135 for its PitchCREPE with CREPE's small `tiny` model, 1,605 for FCPE, 1,266 for librosa `pyin`, 958 for PESTO, 495 for RMVPE, 1,754 for SwiftF0, and 40 and 310 for torchcrepe's small `tiny` and big `full` models. Essentia's PitchYinProbabilistic has no bass count. A MIDI pitch is a note's number, one step per fret, where 69 is the A at 440 Hz (hertz, vibrations per second). Velocity is how hard a note is played, the program is the instrument a MIDI file asks for, ticks per quarter note is the file's time grid, and a pitch bend is a slide in pitch inside a note. A confidence is a tracker's own number for how sure it is of a pitch. Times are wall-clock seconds on 2 CPU cores unless the line says the run was unpinned, which means it shared the CPU with other jobs. Local runs cost nothing beyond the cloud session itself. Every run and source is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/audio-to-notes).

**aubio 0.4.9** ([repository](https://github.com/aubio/aubio)). A C library whose command-line programs track pitch and cut notes, from the Ubuntu package `aubio-tools` 0.4.9-4.4build1 that was already on the box.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as WAV files.
- Command: `aubiopitch -i <wav>` and `aubionotes -i <wav>`, with the defaults (pitch method `yinfft`, note-start method `hfc`).
- Out: `aubiopitch` writes `time_s pitch_hz` lines every 5.805 ms, 0 Hz in silence, with no confidence. Its pitch was within 50 cents in 2,511 of S1's 2,624 melody slices, 1,242 of S2n's 2,529 and 1,585 of R1b's 1,823. `aubionotes` writes `midi_pitch onset_s offset_s` lines. On S1 it returned 62 notes, and 3 of the 62 real ones were found within 50 ms. With a 100 ms window 61 of 62 were found, and those started a median 56.2 ms after the real notes. On S2n it returned 43 notes. None of the 90 real notes was found within 50 ms, and with a 100 ms window 38 were, 30 of them melody notes. On R1b it returned 169 notes with 52 of the 70 real ones among them.
- Time: 4.23 s for all 8 clips and both programs, peak memory 35.2 MB, run r0130. Unpinned and single-threaded. Per clip 0.14 to 0.30 s for `aubiopitch` and 0.19 to 0.42 s for `aubionotes`.
- Takes as a hint: `-p` sets the pitch method, `-l` the tolerance, `-s` the silence setting, `-B` and `-H` the analysis window and the step between windows, `-r` the sample rate and `-u` the unit. For notes it also takes `-O`, `-t`, `-M` and `-d`. No note range, tuning or key input.
- Hands off to: my agents turned its note lists into MIDI files with their own script (one track, program 24, velocity 80, 120 beats per minute). MuseScore 4, a notation app, was named as the next step for the MIDI and not run.

**Basic Pitch 0.4.0** ([repository](https://github.com/spotify/basic-pitch)). Spotify's note transcriber. Its makers' paper is titled `A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation`. Its model file, `nmp.tflite`, is 204,448 bytes and ships inside the package.

- In: 16 WAV files, S1, S2n, S2s, S3, S4, S4guitar, S4lead, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2 and R3a. Also R3a's MP4 video file as it was, and R3b and R3c (run r0264).
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
- Takes as a hint: note range through `minimum_frequency` and `maximum_frequency` in Hz, plus `onset_threshold`, `frame_threshold`, `minimum_note_length` and `midi_tempo`. No tuning, capo, key or instrument input. With the range set to 82.4 to 1319.0 Hz (E2 to about E6, the guitar's range), it found 44 of S5dropd's 48 bass notes, because the four D2 notes (73.4 Hz) lie below that floor. With the floor at 73.4 Hz all 48 were found again (run r0349).
- Hands off to: its MIDI files went on to music21's key finders in the section on chords, beat, key and tuning (r0237) and to the tab writers in the section on choosing the string and fret (r0240). MuseScore 4 was named as a next step and not run. Two handoffs into Basic Pitch were tried. On the stems the source-separation agents made from S4 with Demucs `htdemucs_6s` (a stem is one instrument's track pulled out of a mix), the guitar stem gave 342 notes with 233 of the 369 real guitar notes among them. The true guitar track gave 386 notes with 302 among them. From the full mix's 461 notes, 249 guitar notes were found when counted against the guitar part alone. The table below counts the same mix against all three parts at once, and there the guitar share is 243. The bass stem gave 142 notes with 46 of the 61 real ones (run r0243). The second handoff stood in for a user saying the guitar is 30 cents flat. SoX shifted S7flat30 up 30 cents, and on that file Basic Pitch returned 265 notes with 139 of the 182 real ones among them (run r0319). On the clip as it was it returned 112, with 83 among them (run r0234).

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

**ByteDance piano transcription 0.0.6** (`piano_transcription_inference`, [repository](https://github.com/qiuqiangkong/piano_transcription_inference)). A piano transcription package. Its weights, the numbers the model learned in training (171,966,578 bytes, from the research archive Zenodo), were trained on piano, and here they ran on guitar.

- In: S2n and R1c, read with `librosa.load(path, sr=16000, mono=True)`. The package's own loader stopped with `AttributeError: No librosa.core attribute audio` under librosa 0.11, so my agents loaded the audio themselves.
- Command: `PianoTranscription(model_type="Note_pedal", device="cpu", checkpoint_path=...).transcribe(audio, out.mid)`
- Out: a MIDI file (384 ticks per quarter note, tempo 120, program 0, sustain pedal as CC64 events, 18 of them in S2n's file, no pitch bends). S2n: 87 notes returned, 79 of 90 found (all 48 bass notes, 31 of 42 melody notes). R1c: 87 returned, 63 of 148 found.
- Time: 159.3 s for both clips (model setup 8.6 s, S2n 75.8 s, R1c 73.7 s), peak memory 998.8 MB, run r0401, unpinned, with PyTorch, the machine-learning library it runs on, set to 2 threads. A re-run of S2n on 2 cores took 27.8 s (run r0464).
- Takes as a hint: none for pitch range, tuning or instrument. Its settings are `model_type`, `checkpoint_path` and `device`.
- Hands off to: MIDI, not fed further.

**CREPE Notes 0.2.0** ([repository](https://github.com/xavriley/crepe_notes)). Its makers call it `Post-processing for the CREPE pitch tracker to turn f0 pitch estimates into discrete notes (MIDI)`. Here it turned torchcrepe's pitch into notes. It cuts a note where the confidence dips and the pitch changes, and splits repeated notes where madmom, a music analysis library, detects a note start. The copy of madmom came from another agent's build on the box.

- In: torchcrepe's pitch file for S1, R1b and S4lead (10 ms per row), plus each clip's WAV. The pitch came in three versions, from torchcrepe's big `full` model, from its small `tiny` one, and from `full` with every slice set to 0 Hz where its periodicity (the model's 0-to-1 probability for the pitch it picked) is below 0.21.
- Command: `crepe_notes --f0 <clip>.f0in.csv --use-cwd --output-label <cfg> <clip>.wav`
- Out: one MIDI file per call (type 1, 220 ticks per quarter note, program 0, tempo 120, velocities 7 to 127, no pitch bends). It also prints the tuning it estimated, `Tuning offset: 6.000000000000005 cents` on S1, and takes it off before rounding to notes. In the order `full`, `tiny`, and `full` with the low-periodicity slices set to 0 Hz, S1 gave 62, 62 and 61 notes, with 61, 62 and 59 of its 62 found. R1b gave 94, 95 and 97 notes, with 29, 25 and 28 of its 70 found. S4lead gave 38, 38 and 40 notes, with 28, 33 and 27 of its 37 found. In R1b's `full` and `tiny` files, 48 and 52 notes sit at MIDI pitch 90 or above, carried over from torchcrepe's slices at 1,500 Hz or above.
- Time: 35.19 s for 9 calls (3 clips times 3 pitch versions), peak memory 570.9 MB, run r0616. Each call took 3.17 to 4.44 s, which includes running madmom's note-start detector on the audio. A re-run of the same nine calls, also on 2 cores, took 75.6 s, 6.12 to 22.33 s per call (22.33 s for the first), and wrote the same nine MIDI files byte for byte (run r0694).
- Takes as a hint: `--tuning-offset` (cents), `--min-duration`, `--min-velocity` and `--sensitivity`. No pitch range, capo or string input.
- Hands off to: it reads a pitch CSV with `frequency` and `confidence` columns at 10 ms per row, torchcrepe's here, and writes MIDI.

**Essentia 2.1b6.dev1389** ([repository](https://github.com/MTG/essentia)). An audio analysis library in C++ with Python wrappers, installed from the `essentia-tensorflow` package. Several of its algorithms ran.

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
  - PitchContourSegmentation cuts that line into notes (start, length and MIDI number). S1: 37 notes returned, all 37 matching real notes, so 37 of 62 found. S2n: 32 returned, 31 of 90 found, all of them melody notes. R1b: 106 returned, 48 of 70 found.
  - Every pitch PitchYinProbabilistic wrote sat on a whole MIDI note, because its first stage rounds its candidates to whole notes. That rounding was read in Essentia's source code, and whether the installed build was made from that code wasn't checked, though it behaves the same. On test tones it read 110 Hz as 103.826 Hz and 440 Hz as 293.665 Hz, and why it lands below the tone was not settled. Within 50 cents in 1,298 of S1's 2,624 slices, 0 of S2n's 2,529 and 42 of R1b's 1,823.
  - PitchCREPE writes a pitch and a confidence every 10 ms. With the `tiny` model, within 50 cents in 2,578 of S1's 2,624 slices, 1,282 of S2n's 2,529 and 1,552 of R1b's 1,823. With `full`, 2,597 of S1's and 1,602 of R1b's.
  - MultiPitchKlapuri and MultiPitchMelodia write a list of pitches every 2.9 ms and no notes. Klapuri gave at most 2 pitches in any slice and a pitch in every slice, the silent count-in included. MultiPitchMelodia gave up to 4 pitches in a slice on S3.
- Time: in batch r0321, on 2 cores, Melodia with note cutting took 38.90 s for 8 clips and peaked at 250 MB of memory. PitchYinProbabilistic took 11.31 s and 255 MB, PitchCREPE `tiny` 124.72 s and 367 MB, and `full` 453.93 s and 599 MB for 3 clips. MultiPitchKlapuri took 51.38 s and MultiPitchMelodia 11.42 s for 6 clips, both unpinned (runs r0345 and r0346).
- Takes as a hint: Melodia's `minFrequency` and `maxFrequency`. PitchContourSegmentation takes `tuningFrequency` in Hz, a tuning input (default 440). `Audio2Midi`, which didn't run, has `transpositionAmount` and `tuningFrequency`.
- Hands off to: PitchContourSegmentation also took other trackers' pitch lines (run r0341). On S1, FCPE's line gave 48 notes with 48 of 62 found, PESTO's 62 with 47, PitchCREPE `tiny`'s 65 with 43 and torchcrepe `full`'s 48 with 47. My agents also wrote MIDI files from Melodia's notes.

**FCPE, `torchfcpe` 0.0.4** ([repository](https://github.com/CNChTu/FCPE)). A pitch tracker built on PyTorch. Its name stands for `Fast Context-based Pitch Estimation`, and its 43,363,260-byte model ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, resampled to 16 kHz.
- Command: `spawn_bundled_infer_model(device="cpu").infer(x, sr=16000, decoder_mode="local_argmax", threshold=0.006, f0_min=80, f0_max=880, interp_uv=False)`, the settings of the example in its README, the repository's front page.
- Out: a pitch in Hz every 10 ms, 0 where it judged there's no note, with no confidence. Within 50 cents in 2,598 of S1's 2,624 slices, 704 of S2n's 2,529 and 1,622 of R1b's 1,823.
- Time: 32.57 s for 8 clips (model setup 9.13 s), peak memory 636 MB, batch r0321.
- Takes as a hint: `f0_min` and `f0_max` (its built-in help text says `Use in post-processing`), `threshold` and `decoder_mode`.
- Hands off to: Essentia's PitchContourSegmentation (run r0341). S1 gave 48 notes with 48 of 62 found. R1b gave 87 notes with 56 of 70 found, after 7 notes with no pitch were dropped.

**librosa 1.0.0 `pyin`** ([repository](https://github.com/librosa/librosa)). Probabilistic YIN, a pitch tracker with no trained weights.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, loaded at 22,050 Hz.
- Command: `librosa.pyin(y, sr=22050, fmin=65.406 (C2), fmax=2093.005 (C7), frame_length=2048, hop_length=512)`
- Out: a pitch in Hz every 23.2 ms (NaN, a not-a-number marker, where it hears no note), a yes-or-no flag for whether a slice has a pitch, and the probability that it does, no notes. Within 50 cents in 2,515 of S1's 2,624 slices, 116 of S2n's 2,529 and 1,552 of R1b's 1,823.
- Time: 31.75 s for 8 clips, peak memory 485 MB, batch r0321. S1, the first clip, took 13.18 s and the others 1.39 to 3.46 s.
- Takes as a hint: note range through `fmin` and `fmax`, both required. Its other settings, such as `max_transition_rate`, shape the tracking itself.
- Hands off to: none was tried.

**Onsets and Frames, Magenta's MAESTRO checkpoint** (`magenta` 2.1.4, [repository](https://github.com/magenta/magenta)). Google Magenta's transcription model. The checkpoint, its saved trained model, was trained on piano recordings, and here it ran on guitar. It needed Python 3.7 or 3.8 (3.8 was used) and TensorFlow 2.9.1, another machine-learning library, and its install took 2.0 GB of disk.

- In: S1, S2n and R1c as mono WAV, and S4guitar.
- Command: `onsets_frames_transcription_transcribe --model_dir=<checkpoint>/train S1.wav S2n.wav R1c.wav S4guitar.wav`
- Out: one MIDI file per input (type 1, 220 ticks per quarter note, tempo 120, program 0, no pedal, no pitch bends). S1: 65 returned, 62 of 62 found. S2n: 91 returned, 88 of 90 found (all 48 bass, 40 of 42 melody). R1c: 173 returned, 105 of 148 found, with the found notes starting a median 33.7 ms early. With a 100 ms window R1c gave 119 of 148. S4guitar: 372 returned, 299 of 369 found.
- Time: 39.57 s for the 4 files, peak memory 1,151.0 MB, run r0545. The first file started about 20 s in, after TensorFlow's start-up, and then each file took 4.07 to 5.30 s.
- Takes as a hint: none for pitch range, tuning, instrument or tempo.
- Hands off to: MIDI, not fed further.

**PESTO, `pesto-pitch` 2.0.1** ([repository](https://github.com/SonyCSLParis/pesto)). A pitch tracker from Sony CSL Paris. Its default model file is 534,664 bytes and ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a at 44.1 kHz.
- Command: `pesto.predict(torch.from_numpy(y), 44100, step_size=10.0)`
- Out: time, pitch in Hz and a confidence from 0 to 1 every 10 ms, with a pitch on every slice and no decision on whether a slice has a pitch. Within 50 cents in 2,590 of S1's 2,624 slices, 1,534 of S2n's 2,529 and 1,599 of R1b's 1,823.
- Time: 49.59 s for 8 clips (setup 4.38 s), peak memory 1,044 MB, batch r0321.
- Takes as a hint: `step_size`, `model_name`, `reduction` and `num_chunks`. No range or tuning input.
- Hands off to: Essentia's PitchContourSegmentation (run r0341). S1 gave 62 notes with 47 of 62 found. R1b gave 169 notes with 43 of 70 found.

**RMVPE through `rmvpe-onnx` 0.2.3** ([RMVPE](https://github.com/Dream-High/RMVPE), [rmvpe-onnx](https://github.com/NewComer00/rmvpe-onnx)). RMVPE is a pitch model for the singing voice. `rmvpe-onnx` is a third-party wrapper that runs its 361,688,443-byte model file on ONNX Runtime, a program that runs model files. My agents' record lists the model and the wrapper as two entries, with the same runs.

- In: S1, S2n, S2s, S4, R1b, R2 and R3a as mono WAV, and S4lead.
- Command: `RMVPE(model_path=..., device="cpu").predict(audio, sr)`, and the command line `rmvpe-onnx predict S1.wav --model rmvpe.onnx --device cpu --csv S1.csv`.
- Out: time, pitch in Hz and a confidence from 0 to 1 every 10 ms, plus the model's raw values for 360 pitch steps, with a pitch on every slice and no notes. At its default threshold of 0.03 the command line marked 498 of all 2,984 slices in S1 as having a pitch. Within 50 cents in 1,710 of S1's 2,624 melody slices, 1,051 of S2n's 2,529, 2,667 of S4lead's 2,780 and 1,544 of R1b's 1,823.
- Time: 34.68 s for 8 clips, peak memory 1,198.7 MB, run r0516. `predict()` took 16.05 s on S1, the first call, and 1.13 to 2.44 s on the others. `rmvpe-onnx` sets no thread count. A later probe with the same ONNX Runtime version and settings, held to CPUs 0 and 1, saw ONNX Runtime's worker threads run on CPUs 1, 2 and 3 (run r0666). So the 2 cores of this run are the slot it was given, not where all its threads ran. That wasn't measured in this run itself.
- Takes as a hint: `model_path`, `device`, and `--confidence-threshold` on the command line. No frequency range, tuning or key input.
- Hands off to: none was tried.

**SoX 14.4.2** ([source](https://sourceforge.net/p/sox/code/)). An audio command-line tool, not a transcriber. It made the input for the tuning test, and the same command ran again later to log it and to compare outputs.

- In: S7flat30 as a WAV file.
- Command: `sox S7flat30.wav S7flat30.plus30c.wav pitch 30`
- Out: a WAV file 24.00 s long (44.1 kHz, 2 channels, 16-bit), 30 cents higher. Runs of the same command gave files that differ by at most 2 in 16-bit units, from the dither, a little noise SoX adds by default. With `-R`, two runs came out identical.
- Time: 0.26 s, peak memory 9.7 MB, run r0602, unpinned.
- Takes as a hint: the shift in cents, as the argument of its `pitch` effect. Also the switches `-R`, a repeatable mode, and `-D`, which turns off the automatic dither.
- Hands off to: Basic Pitch read the shifted file (run r0319, in the Basic Pitch entry).

**SwiftF0 0.3.0** ([repository](https://github.com/lars76/swift-f0)). A pitch tracker for one voice or instrument at a time, with its own note cutter and MIDI export. Its 135,090-byte ONNX model ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as WAV through `detect_file`, resampled to 16 kHz.
- Command: `SwiftF0(threads=2).detect_file(path)`, then `segment_notes(result)` with `pitch_hold_ms=80`.
- Out: a pitch and a confidence every 16 ms (a slice counts as having a pitch at confidence 0.5 or more, its built-in help text says), and notes as `Note(start, end, pitch_hz)`. Within 50 cents in 2,522 of S1's 2,624 slices, 567 of S2n's 2,529 and 1,555 of R1b's 1,823. Notes: S1 48 returned with 46 of 62 found, S2n 55 returned with 27 of 90 (18 bass, 9 melody), R1b 60 returned with 50 of 70. S1's real melody starts with F#4 at 1.667 s and F#4 again at 2.083 s. SwiftF0's first notes on S1, as start-end in seconds, MIDI pitch and fitted pitch:

  ```text
  1.680-2.512 66 (369.994 Hz)
  2.512-2.944 67 (391.769 Hz)
  2.944-3.776 69
  ```

  The two F#4 notes came out as one.
- Time: 4.39 s for 8 clips (model setup 0.12 s, 0.22 to 0.80 s per clip), peak memory 282 MB, batch r0321.
- Takes as a hint: `fmin` and `fmax` (clamped to 46.875 to 2093.75 Hz), and `pitch_hold_ms` for the note cutter. No tuning, key, tempo or instrument input. With 82.4 to 1319.0 Hz set (run r0131, unpinned), the note lists came out with the same counts and the same number of matched notes on the six clips with a known answer.
- Hands off to: its own `segment_notes`. My agents also wrote MIDI files from the note lists.

**torchcrepe 0.0.24** ([repository](https://github.com/maxrmorrison/torchcrepe)). A PyTorch version of the CREPE pitch tracker with CREPE's weights converted, `tiny` (1,962,363 bytes) and `full` (88,991,291 bytes).

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, resampled to 16 kHz.
- Command: `torchcrepe.predict(x, 16000, hop_length=160, fmin=50.0, fmax=2006.0, model=<tiny|full>, return_periodicity=True, batch_size=512, device="cpu")`
- Out: a pitch in Hz and a periodicity from 0 to 1 every 10 ms, with a pitch on every slice. Within 50 cents in 2,576 (`tiny`) and 2,586 (`full`) of S1's 2,624 slices, 175 and 358 of S2n's 2,529, and 809 and 872 of R1b's 1,823. With the default Viterbi decoder, the step that picks one pitch per slice from the model's output, 890 (`tiny`) and 838 (`full`) of R1b's 1,823 melody slices came out at 1,500 Hz or above. With the `weighted_argmax` decoder, `tiny` was within 50 cents in 1,546 of R1b's 1,823 (run r0287). It adds random noise to every pitch, so a re-run gave a different pitch in all 2,934 slices of R1b, a median 8.1 cents apart.
- Time: batch r0321, `tiny` 160.58 s for 8 clips (peak 833 MB) and `full` 1,786.71 s (peak 1,947 MB, 116.2 to 354.5 s per clip).
- Takes as a hint: `fmin`, `fmax`, `model`, `decoder` and `hop_length`, plus threshold and filter helpers.
- Hands off to: Essentia's PitchContourSegmentation (run r0341, `full` with slices below periodicity 0.21 set to 0 Hz). S1 gave 48 notes with 47 of 62 found, R1b 38 notes with 27 of 70. And CREPE Notes (run r0616, above).

**Transkun 2.0.1** ([repository](https://github.com/Yujia-Yan/Transkun)). A piano transcription model. The 56,408,978-byte weights in the package were trained on piano, and here they ran on guitar.

- In: S1, S2n, S3, R1a, R1b and R1c as WAV.
- Command: `transkun <clip>.wav <clip>.mid --device cpu`
- Out: a MIDI file (960 ticks per quarter note, tempo 120, program 0, velocities, sustain pedal as CC64 events, 24 in S2n's file, no pitch bends). S1: 63 returned, 62 of 62 found. S2n: 99 returned, 88 of 90 found (all 48 bass, 40 of 42 melody). S3: 171 returned, 167 of 182. R1a: 134 returned, 112 of 189. R1b: 52 returned, 49 of 70. R1c: 119 returned, 111 of 148.
- Time: 814.45 s for the 6 clips, peak memory 1,490 MB, run r0216. It loads the model again for every clip, and each clip took 83.7 s (S1) to 172.5 s (R1a), loading included. A re-run of S1, also on 2 cores but under a different load on the box, took 40.6 s (run r0464).
- Takes as a hint: `--weight`, `--conf`, `--device`, `--segmentHopSize` and `--segmentSize`. No pitch range, tuning, instrument or tempo input.
- Hands off to: MIDI, not fed further.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Several were stopped by the cloud session's permission system. It refused some commands with the reason `[Code from External]`, among them installing or running code cloned from other people's repositories and running two packages installed from the Python package index. Where my agents wrote steps for me to try a tool myself, the line names the section of [`for-aaron.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/audio-to-notes/for-aaron.md).

- **Ableton Live "Convert to MIDI"**: my agents didn't read up on it for this step, and neither the apps list nor the services list has it. My fingerstyle agents list its drum command, and test T115 in my list of 120 tests covers both.
- **[alphaTab](https://alphatab.net/docs/introduction)**: a notation library whose importers include MusicXML and Guitar Pro files, named as a later step for the notes and not run in this step. Version 1.9.0 ran in three other sections: showing a tab in the browser, metronome and sync, and tools handing off to each other. No steps.
- **AnthemScore**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[Aria-AMT](https://github.com/EleutherAI/aria-amt)**: a piano transcription model, not attempted. In their first round my agents gave the reason that two piano models, ByteDance's and Transkun, had already run. Onsets and Frames, the third, ran in a later round. As shipped, its transcribe step begins with `assert cuda_is_available(), "CUDA device not found"`, so it stops on a machine without a graphics card. Steps for me: test T73 in my list of 120 tests.
- **Audacity**: named as a host for Vamp plugins (a plugin format for audio analysis) and not read. No steps.
- **[audio_to_midi_melodia](https://github.com/justinsalamon/audio_to_midi_melodia)**: a script made to turn MELODIA's melody into MIDI. It needs the MELODIA plugin, whose download page refused the box (HTTP 403). No steps.
- **[basicpitch.io](https://basicpitch.io)**: Basic Pitch's demo site. The page was read and the app was not run. No steps.
- **[CREPE](https://github.com/marl/crepe)**, the original TensorFlow package `crepe` 0.0.16: building it stopped with `ModuleNotFoundError: No module named 'pkg_resources'`, and with the build constraint `setuptools<81` it stopped with `urllib.error.HTTPError: HTTP Error 403: Forbidden` while fetching its weights from github.com. Installing it with the weights put in place was refused by the permission system. Its weights ran here through torchcrepe and Essentia. Steps: section 4.
- **[Deep Salience](https://github.com/rabitt/ismir2017-deepsalience)**: pitch and melody models from a 2017 paper, with no package from their authors, so they run from a clone of their repository. Running its script was refused by the permission system, and no setup of TensorFlow or Keras, another machine-learning library, was on the box. Steps: section 13.
- **[Demucs](https://github.com/adefossez/demucs)**: splits a mix into stems. The source-separation agents ran it, and its stems went into Basic Pitch here. No steps.
- **[GAME](https://github.com/openvpi/GAME)** (openvpi): its makers describe it as `designed for transcribing singing voice into music scores`. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[Harmonica](https://arxiv.org/abs/2609.04640)**: a paper on transcription models, found late and not surveyed in full. It names no code or weights. No steps.
- **[hFT-Transformer](https://github.com/sony/hFT-Transformer)**: a piano transcription model from Sony. Not attempted. Its README lists machines with graphics cards, and its checkpoint runs through the repository's own scripts. Running Timbre-Trap's cloned code had been refused earlier, the agent that tried Timbre-Trap reports. No file on the box records that refusal, so it is not verified. Steps: section 10.
- **Klangio**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[madmom](https://github.com/CPJKU/madmom)**: a music analysis library, not run on its own here. Its note-start detector ran inside CREPE Notes, and my chord and fingerstyle agents ran madmom itself (r0063, r0247). No steps.
- **[MELODIA](https://www.upf.edu/web/mtg/melodia)** Vamp plugin: its download page refused the box (HTTP 403), and the download sits behind a form. The same method ran inside Essentia as Melodia. Steps: section 5.
- **[melodyExtraction_JDC](https://github.com/keums/melodyExtraction_JDC)**: a singing-melody model in Keras with no package from its authors, so it runs from a clone of its repository. The permission system refused running the Deep Salience clone, and no TensorFlow or Keras setup was on the box. This one wasn't attempted after that refusal. Steps: section 13.
- **[melodyExtraction_SSL](https://github.com/keums/melodyExtraction_SSL)**: a melody extraction model in Keras by the same author, not run for the same reason and not attempted after that refusal either. Steps: section 13.
- **Melodyne**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[MIROS](https://arxiv.org/abs/2603.27528)**: a transcription system that extends YourMT3+, found late and not surveyed in full. The paper gives no code or weights link. No steps.
- **[MR-MT3](https://github.com/gudgud96/MR-MT3)**: a multi-instrument transcription model. Not attempted. It runs from a clone of its repository. Minutes earlier the permission system had refused cloned code twice, for MT3 and mt3-pytorch. Its `inference.py` also calls `self.model.cuda()` with no device check, so a run without a graphics card needs a code change. Later the package `mt3-infer` installed. Its `mr_mt3` model pairs MR-MT3's code with MR-MT3's `mt3.pth` checkpoint. Running the package was refused (its own entry). Steps: section 10.
- **[MT3](https://github.com/magenta/mt3)** (Magenta): Google's multi-instrument transcription model. Installing its cloned repository the way its notebook does was refused by the permission system. Later my agents installed the package `mt3-infer`, which carries code for a PyTorch version of MT3 and two related models. Running it was refused too (its own entry). Steps: section 2.
- **[mt3-infer](https://github.com/openmirlab/mt3-infer)** 0.2.0: a third-party package around MT3-family models. It installed, but running its command line was refused by the permission system, so no model was downloaded. Steps: section 14.
- **[mt3-pytorch](https://github.com/kunato/mt3-pytorch)**: a PyTorch version of MT3. Its requirements can't all be installed on the box, because `ddsp` needs `crepe` and `crepe`'s build fails. Running its clone was refused by the permission system too. Steps: section 10.
- **[MTANet](https://github.com/Annmixiu/MTANet)**: a singing-melody model with no trained weights published. No steps.
- **[MuScriptor](https://github.com/muscriptor/muscriptor)** (Kyutai and Mirelo): a multi-instrument transcription model. Its weights are gated on Hugging Face, a site that hosts AI models, behind a sign-in and an acceptance step, and no Hugging Face access key was on the box. The 411,888,600-byte file was also over the 200 MB download limit in force that day. Steps: section 11.
- **[MuScriptor's hosted page](https://muscriptor.kyutai.org)**: the page needs JavaScript and the app wasn't run. Steps: section 11.
- **[MuseScore 4](https://musescore.org/en/handbook/4/command-line-usage)**: a notation app whose command line converts MIDI, named as a later step and not run. No steps.
- **Music.AI**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[music21](https://www.music21.org/)**: a music library whose converter reads MIDI, named as a later step for MIDI and not run in this step. My chord and beat agents ran music21 10.5.2's key finders on Basic Pitch's notes from this section (r0237). No steps.
- **[NeuralNote](https://github.com/DamRsn/NeuralNote)**: a desktop plugin and app for audio to MIDI. Its README describes no command-line use, and it wasn't attempted. Steps: section 3.
- **[Omnizart](https://github.com/Music-and-Culture-Technology-Lab/omnizart)**: a transcription library for instruments, vocals, chords, drums and beats. One install attempt, version 0.5.0 on Python 3.8, stopped while building `vamp` 1.1.0 with `ModuleNotFoundError: No module named 'numpy'`. Steps: section 7.
- **[Onsets and Velocities](https://github.com/andres-fr/iamusica_training)**: a piano model. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[onsets-and-frames](https://github.com/jongwook/onsets-and-frames)** (PyTorch version): publishes no trained checkpoint, so Magenta's own checkpoint ran instead. No steps.
- **[PENN](https://github.com/interactiveaudiolab/penn)** 1.0.0: a pitch tracker. It installed, but `import penn` stopped with `Could not find any lib files matching version pt215cpu`, because its decoder package has compiled files for PyTorch 2.6 to 2.11 and the box had PyTorch 2.15 (runs r0399 and r0423). A second PyTorch version in its own environment was ruled out by the disk limit at the time. Steps: section 12.
- **[pitch-core](https://crates.io/crates/pitch-core)**: a pitch tracker in Rust, found late and not surveyed in full. No steps.
- **[praat-parselmouth](https://github.com/YannickJadoul/Parselmouth)**: Praat's pitch analysis for Python, found late and not surveyed in full. No steps.
- **[pYIN Vamp plugin](https://github.com/c4dm/pyin)**: pYIN as a plugin, with a notes output. The agent that tried it reports that building it was refused by the session's permission settings. No file on the box records that refusal, so it is not verified. Steps: section 6, through Tony.
- **[pyworld](https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder)**: the WORLD vocoder's pitch trackers for Python, found late and not surveyed in full. No steps.
- **[ROSVOT](https://github.com/RickyL-2000/ROSVOT)**: a research model built to turn singing into MIDI. Its README installs a version of PyTorch made for graphics cards. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[Self-supervised F0 and voicing for monophonic music](https://arxiv.org/abs/2601.11768)** (Bitra and Beigi): a 2026 paper with no code or weights linked. A web search for its code couldn't be made, because the session's search budget was used up. No steps.
- **[Sheet Sage](https://github.com/chrisdonahue/sheetsage)**: its makers say it `transcribes your favorite pop song into a lead sheet containing the melody and chords`. Its README asks to `ensure you are running Linux and have Docker installed`, and its one-time setup downloads `a ~4GB Docker container`. The box has no Docker, a system that ships a program with everything it needs to run. Steps: section 8.
- **[SOME](https://github.com/openvpi/SOME)** (openvpi): its makers' README says `SOME is a MIDI extractor that can convert singing voice to MIDI sequence`. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **Sonic Annotator**: a command-line host for Vamp plugins, named and not read. No steps.
- **[Sonic Visualiser](https://www.sonicvisualiser.org/)**: a desktop host for Vamp plugins, named and not run. No steps.
- **[SPICE](https://arxiv.org/abs/1910.11664)**: Google's self-supervised pitch model, found late and not surveyed in full. No steps.
- **Spleeter 2-stem ONNX**: a source-separation model that Omnizart's vocal mode downloads. Not run here, since the source-separation research covers Spleeter. No steps.
- **[Timbre-Trap](https://github.com/sony/timbre-trap)**: a multi-pitch model. Its code was cloned and its 11,353,410-byte checkpoint downloaded, and the agent that tried it reports that running the cloned code and loading the checkpoint was refused by the session's permission settings. No file on the box records that refusal, so it is not verified. Its Hugging Face demo reported `RUNTIME_ERROR`. Steps: section 10.
- **[Tony](https://www.sonicvisualiser.org/tony/)**: a desktop app built on pYIN that shows the pitch and the notes. Not run here, since the pYIN plugin build was reported refused. Steps: section 6.
- **vamp-simple-host**: a command-line host for Vamp plugins that is on the box, but no Vamp plugin could be run (MELODIA's download page refused the box and the pYIN build was reported refused). No steps.
- **[VocalParse](https://github.com/pymaster17/VocalParse)**: a model built to turn singing into lyrics, notes and tempo, on top of Qwen3-ASR, a speech-recognition model. Its README installs a version of PyTorch made for graphics cards and doesn't describe use without one. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[VOCANO](https://github.com/B05901022/VOCANO)**: a model made to turn singing into MIDI, found late and not surveyed in full. No steps.
- **[yourmt3](https://pypi.org/project/yourmt3/)** 0.1.4: a third-party package of YourMT3 models, with weights from a third party's Hugging Face repository. It installed and a 121,781,787-byte checkpoint downloaded, but the run was refused by the permission system. Steps: section 14.
- **[YourMT3+](https://huggingface.co/spaces/mimbres/YourMT3)**: a multi-instrument transcription model with a demo on Hugging Face. My agents' one call to the demo from this step was refused for lack of graphics-card time. The answer was `You have exceeded your ZeroGPU quota (90s requested vs. 79s left).` The hosted-services research ran the demo itself on S2n (r0112) and its CPU copy, `mimbres/YourMT3-cpu`, on S2n, R1c and an ElevenLabs guitar stem of S4 (r0164, r0245, r0231). My agents didn't try a local run. Its code has no package from its authors and sits in the demo's repository, and running cloned code had been refused. Later two third-party packages that carry YourMT3 models, `yourmt3` and `mt3-infer`, installed. Running them was refused too (their own entries). Steps: section 1.

</details>

<details><summary>Licenses of the tools that ran</summary>

Besides the 68 tools, apps and services, my agents' record lists 30 datasets. Most were used to train models. Molina and Phenicx were used only to test Basic Pitch, ComMU to evaluate MR-MT3, and Vocadito's audio sits in Basic Pitch's tests. The table names the datasets behind the models that ran.

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| aubio | [GPL-3.0-or-later](https://raw.githubusercontent.com/aubio/aubio/master/COPYING) | no model | no training data |
| Basic Pitch | [Apache-2.0](https://raw.githubusercontent.com/spotify/basic-pitch/main/LICENSE) | inside the package, no separate license file found | GuitarSet ([CC BY 4.0](https://zenodo.org/records/3371780)), MAESTRO (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)), Slakh2100 ([CC BY 4.0](https://zenodo.org/records/4599666)), iKala (no license on its Zenodo backup copy, original terms not read), MedleyDB (`for non-commercial research use only`, [source](https://zenodo.org/records/1715175)) |
| ByteDance piano transcription | MIT by its `setup.py` classifier, no license file in the [repository](https://github.com/qiuqiangkong/piano_transcription_inference) | [CC BY 4.0](https://zenodo.org/records/4034264) | MAESTRO v2.0.0 (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |
| CREPE Notes | [GPL-3.0](https://raw.githubusercontent.com/xavriley/crepe_notes/main/LICENSE), and the madmom code it calls is BSD-2-Clause ([madmom LICENSE](https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE)) | runs madmom's note-start model, `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0` ([madmom LICENSE](https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE)), and the installed madmom's `madmom/models/LICENSE` says `All files in this repository are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0`. Its input pitch here came from torchcrepe, run separately (see torchcrepe) | not stated in the record |
| Essentia | [AGPL-3.0](https://raw.githubusercontent.com/MTG/essentia/master/Essentia%20Licensing.txt), and its site says `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications` ([licensing page](https://essentia.upf.edu/licensing_information.html)) | the sources disagree: `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use` ([licensing page](https://essentia.upf.edu/licensing_information.html)) and `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0` ([models LICENSE](https://essentia.upf.edu/models/LICENSE)) | CREPE models, per Essentia's models page and `crepe-full-1.json`: RWC-synth (license not read) and MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)) |
| FCPE | [MIT](https://raw.githubusercontent.com/CNChTu/FCPE/main/LICENSE) | inside the package, no separate license found, and my agents' record reads it as under the repository's MIT | per its paper, M4Singer (`We agree to the dataset license: CC BY-NC-SA 4.0`, [source](https://raw.githubusercontent.com/M4Singer/M4Singer/master/dataset_license.md)) and VCTK ([CC BY 4.0](https://datashare.ed.ac.uk/handle/10283/3443)), re-synthesized |
| librosa `pyin` | [ISC](https://raw.githubusercontent.com/librosa/librosa/main/LICENSE.md) | no model | no training data |
| Onsets and Frames | [Apache-2.0](https://raw.githubusercontent.com/magenta/magenta/main/LICENSE) | `maestro_checkpoint.zip`, no license statement found | MAESTRO (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |
| PESTO | [LGPL-3.0](https://raw.githubusercontent.com/SonyCSLParis/pesto/master/LICENSE.md) | inside the repository, no separate license found | MIR-1K (no license on its Zenodo backup copy, original terms not read), going by the file names `mir-1k.ckpt` and `mir-1k_g7.ckpt`, not verified |
| RMVPE via rmvpe-onnx | RMVPE [Apache-2.0](https://raw.githubusercontent.com/Dream-High/RMVPE/main/LICENSE), rmvpe-onnx [MIT](https://raw.githubusercontent.com/NewComer00/rmvpe-onnx/HEAD/LICENSE) | `rmvpe.onnx`, card tag `license: mit` ([card](https://huggingface.co/lj1995/VoiceConversionWebUI/raw/main/README.md)), and which training run made it is not verified | per its paper, MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)), MIR-1K (no license on its Zenodo backup copy, original terms not read), Cmedia and MIR-ST500 (licenses not read) |
| SoX | GPL-2.0-or-later for the `sox` program and LGPL-2.1-or-later for libsox, `sox.c, and thus SoX-the user application, is distributed under the GPL, while the files that make up libsox are licensed under the less restrictive LGPL.` ([COPYING](https://sourceforge.net/p/sox/code/ci/master/tree/COPYING?format=raw)), which goes on `Note that some of the external packages that can be linked into libsox are GPLed and/or may have licensing problems, so they can be disabled at configure time with the relevant--with-* options. If libsox is built with such libraries, it must be distributed under the GPL.` | no model | no training data |
| SwiftF0 | [MIT](https://raw.githubusercontent.com/lars76/swift-f0/main/LICENSE) | `model.onnx` inside the package, no separate license found | pitch-benchmark, card license tag `cc-by-nc-sa-4.0` ([card](https://huggingface.co/api/datasets/lars1234/pitch-benchmark)) |
| torchcrepe | [MIT](https://raw.githubusercontent.com/maxrmorrison/torchcrepe/master/LICENSE) | CREPE's weights converted, inside the repository, no separate license found | CREPE's data: MIR-1K (no license on its Zenodo backup copy, original terms not read), Bach10 and RWC-synth (licenses not read), MedleyDB (`for non-commercial research use only`, [source](https://zenodo.org/records/1715175)), MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)), NSynth ([CC BY 4.0](https://magenta.tensorflow.org/datasets/nsynth)) |
| Transkun | [MIT](https://raw.githubusercontent.com/Yujia-Yan/Transkun/main/LICENSE) | `2.0.pt` inside the package, no separate license found | MAESTRO v3.0.0 (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |

Every clause in full is in [`survey.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/audio-to-notes/survey.md) in the research folder.

</details>

<!-- IMAGES -->
1. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/basic-pitch/S2n-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-basic-pitch-s2n.webp` (900x324, lossless WebP, 5,598 bytes, pixel-identical to the PNG, made with Pillow). Alt: "Piano roll, a chart of notes as bars with time across and MIDI pitch up, titled Basic Pitch 0.4.0 on S2n, estimate in red over truth in grey. Red bars cover the grey bars of the low and high lines from about 2 to 28 seconds. Four short red notes sit alone near MIDI pitch 83 to 87, and one sits near pitch 24 at the very start." Caption: **Basic Pitch on S2n** / "Synthesized fingerstyle. 137 notes returned, 90 of 90 found."
2. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/transkun/S2n-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-transkun-s2n.webp` (900x324, lossless WebP, 6,060 bytes, pixel-identical, Pillow). Alt: "Piano roll titled Transkun 2.0.1, piano-trained, on S2n, estimate in red over truth in grey. Red bars sit on the grey bars between MIDI pitch 43 and 64. All 48 bass notes and 40 of the 42 melody notes were found. A red note at pitch 67 runs from about 2.1 to 3.8 seconds with no grey under it, and thin red marks sit near pitch 70." Caption: **Transkun on S2n** / "Piano-trained model, same clip. 99 returned, 88 of 90 found."
3. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/basic-pitch/R1c-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-basic-pitch-r1c.webp` (900x324, lossless WebP, 5,980 bytes, pixel-identical, Pillow). Alt: "Piano roll titled Basic Pitch 0.4.0 on R1c, estimate in red over truth in grey. Grey bars spread between MIDI pitch 40 and 69 over 28 seconds, with red lines along them, and 120 of the 148 real notes were found. Some grey bars have no red, and some red notes have no grey under them, the highest near pitch 94 at the start." Caption: **Basic Pitch on R1c** / "Real bossa nova guitar from GuitarSet. 156 returned, 120 of 148 found."
4. Source `/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/transkun/R1c-pianoroll.png` (900x324 PNG). Written: `/home/user/blog/public/media/guitar-tab-tools/audio-to-notes-transkun-r1c.webp` (900x324, lossless WebP, 6,874 bytes, pixel-identical, Pillow). Alt: "Piano roll titled Transkun 2.0.1, piano-trained, on R1c, estimate in red over truth in grey. Red bars sit on grey bars between MIDI pitch 40 and 69, and 111 of the 148 real notes were found. Other grey bars have no red, and a thin red line at pitch 50 runs through the last seconds of the clip with no grey under it." Caption: **Transkun on R1c** / "Same real clip. 119 returned, 111 of 148 found."

All four sources are 900x324, so the block uses `aspect="25/9"` (900/324). Each picture carries its own title and legend ("truth" grey, "estimate" red) inside the image.

<!-- PENDING MEDIA -->
- `/home/user/gtr/lanes/audio-to-notes/out/sox/S7flat30.plus30c.r0602.wav`: S7flat30 (the S3 chords rendered 30 cents flat) shifted up 30 cents with SoX 14.4.2, run r0602. 24.00 s, 44.1 kHz, 2 channels, 16-bit, 4,233,644 bytes. Exists (checked 2026-11-12, SHA-256 4f54aac7...ed91933b, as `trials.md` "Media kept outside git" records). The file Basic Pitch actually read in run r0319 is the same command's output from the day before, `/home/user/gtr/lanes/audio-to-notes/inputs/S7flat30.plus30c.wav` (24.00 s, 4,233,644 bytes, also present on 2026-11-12 with SHA-256 31f6f3a9...42c42eef as recorded, but under `inputs/`, not `out/`). The two differ only by SoX's dither (at most 2 in 16-bit units).
- No new file since the gap rounds: the verifier's re-run of the same SoX command (run r0691) wrote audio that was deleted afterwards (`trials.md`, "Verification log (verify-gapfill-audio-to-notes, round 2, 2026-11-11)": "the re-run's SoX audio ... were deleted afterwards"), and `/home/user/gtr/lanes/audio-to-notes/verify-gap2/sox/` is empty (checked 2026-11-12). A search of `/home/user/gtr/lanes/audio-to-notes/` for WAV, MP3, FLAC, OGG, M4A, MP4, MOV and WebM files on 2026-11-12 found only the two files above, besides symlinks to the shared inputs.
- Nothing else to hear or watch: no tool in this step wrote audio or video (`trials.md`, "Media kept outside git"). Basic Pitch's `--sonify-midi` was not used. The transcribers wrote MIDI, CSV and NPZ files. The `.wav` entries in `out/onsets-frames/` and `out/crepe-notes/<cfg>/` are symlinks to the shared input clips, not outputs.

<!-- NUMBERS -->
RUNDOWN and main read (recounted 2026-11-12 from `tools.json` as it is now, commit e95cdb8, 99 entries)
- 68 tools, apps and services: count of `tools.json` entries by `kind` (99 entries: dataset 30, paper 1, the other 68 are open-source 25, research-model 22, library 10, commercial-app 9, api 2). The 30 datasets moved to the license block's first line.
- 15 of them ran on the cloud box (was 13 in the first draft): the `tools.json` entries with `tried: true` and a `tried_how` starting `local-cpu`, which are 15: torchcrepe, librosa.pyin, PESTO, RMVPE, rmvpe-onnx, FCPE / torchfcpe, SwiftF0, aubio, Essentia, Spotify Basic Pitch, CREPE Notes, Transkun, ByteDance, Onsets and Frames, SoX. `tools.json` has 16 entries with `tried: true`. The 16th is YourMT3+ (`tried_how: public-space`): its one call to the Hugging Face demo returned the ZeroGPU quota error and no notes (`trials.md` "YourMT3+"), so it stays under "didn't run". RMVPE and rmvpe-onnx are two entries for the same runs and share one entry in the folded block, which holds 14 entries. SoX only made a test input (`trials.md` Gap round 2 A2, run r0602). The first draft's 13 was the row count of `trials.md` "Summary: what ran here", which leaves out SoX and puts RMVPE and rmvpe-onnx in one row. 15 + 53 tools in the "didn't run" block = 68 (that block's 54 lines include the paper).
- four write MIDI straight from the audio: Basic Pitch, ByteDance, Onsets and Frames and Transkun (`trials.md` summary table, "MIDI" outputs written from audio).
- "with pitch, start and end": the note outputs in the entries (MIDI notes and note lists carry start, end and pitch).
- rundown "On a 90-note clip I synthesized they returned 87 to 137 notes, with 79 to 90 of the real ones among them" (changed 2026-11-12 after the checkers: the first version gave only the found counts): S2n, 90 notes, synthesized fingerstyle (INPUTS.md) | returned and matched, n_est and n_matched_onset_only: Basic Pitch 137 and 90 (e0493), ByteDance 87 and 79 (e1393), Onsets and Frames 91 and 88 (e1571), Transkun 99 and 88 (e0438), all gtr-eval 0.11.1, exit 0 (re-read 2026-11-12).
- rundown "ran on the rented cloud computer" (was "on the cloud box"): the rundown sits above "How the tests worked", where `_main.md` introduces the name "the cloud box"; `_main.md`'s opening calls it "a rented cloud computer with no graphics card". The other sections' rundown lines still say "the cloud box".
- opening "15 of the 68 ... ran on the cloud box, and four write MIDI (a list of notes) straight from the audio. On R1c, a real bossa nova guitar recording, those four returned 87 to 173 notes, with 63 to 120 of its 148 notes among them" (changed 2026-11-12 after the checkers: the first version gave only the found counts; still three sentences, about 65 words): R1c is a GuitarSet excerpt, Bossa Nova progression 3, 'comp' take, mic recording, 148 notes (INPUTS.md) | returned and matched, n_est and n_matched_onset_only: Basic Pitch 156 and 120 (e0489), ByteDance 87 and 63 (e1392), Onsets and Frames 173 and 105 (e1572), Transkun 119 and 111 (e0436). All eight evals gtr-eval 0.11.1, exit 0 (checked 2026-11-12). "four write MIDI": the four MIDI writers are among the 15 that ran.
- Facts the first draft's opening carried, now in the folded blocks: 30 datasets (license block, first line); up to 16 of the 17 clips (clip key); S2n's 29 seconds, bass line under a melody, synthesized so every note is known (clip key); R1c's 28 seconds and 148 notes (clip key); four write MIDI from the audio, three trained on piano, the rest track pitch (folded block 1, second paragraph); each of the four tools' S2n and R1c counts (their entries: Basic Pitch table, ByteDance, Onsets and Frames, Transkun "Out" lines); the research folder link (folded block 1, end of the second paragraph). The rundown's earlier "63 to 120 of the 148 in a real guitar recording" is now in the opening.

Alt texts (read off the pictures, which plot the same output files; reworded 2026-11-12 after the checkers)
- R1c's grey bars span MIDI pitch 40 to 69 (was "40 and 67" in the Basic Pitch alt and "40 and 70" in the Transkun alt): `/home/user/gtr/inputs/R1c/R1c.truth.json`, 148 notes, lowest pitch 40, highest 69 (four notes at 69, starting 0.770, 4.807, 17.415 and 17.896 s, string 1 fret 5).
- counts in the alt texts, in place of "almost every", "most", "Several" and "a few": Transkun S2n all 48 bass and 40 of 42 melody (e0438) | Basic Pitch R1c 120 of 148 (e0489) | Transkun R1c 111 of 148 (e0436). "Four short red notes sit alone near MIDI pitch 83 to 87" (Basic Pitch S2n): `samples/basic-pitch/S2n.notes.csv` holds exactly four notes above pitch 75, at 83 (2.695 s), 85 (8.585 s), 87 (17.472 s) and 83 (19.866 s).
- Basic Pitch R1c "some red notes have no grey under them, the highest near pitch 94 at the start": a checker proposed "near pitch 67 to 72 and near pitch 94". Not used: in `/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/tflite-default/R1c.notes.csv` the 19 notes with no truth note of the same pitch sounding at the same time are at pitches 43, 45, 55 (5), 57 (3), 59, 60, 62, 67 (2), 71 (3) and 94 (checked 2026-11-12), so naming only 67 to 72 and 94 would leave the lower ones out. The note at 94 runs 0.012 to 0.395 s.
- Transkun S2n "thin red marks sit near pitch 70" (was "a few"): `samples/transkun/S2n.mid` has six notes at pitch 69, each 0.04 to 0.05 s long (8.576, 9.109, 13.934, 18.217, 25.718 and 26.252 s). In the picture four show, and the two after 25 s sit under the legend box, so no count is given.
- "Piano roll, a chart of notes as bars with time across and MIDI pitch up": the pictures' axes ("time (s)", "MIDI pitch").
- Transkun S2n red note at pitch 67 from about 2.1 to 3.8 s: trials.md Transkun first S2n notes (`2.146-3.773 67 89`). Basic Pitch S2n red note near pitch 24 at the start and near 83: trials.md Basic Pitch first S2n notes (`0.000-0.150 24 49`, `2.695-2.927 83 39`). Other positions (pitch ranges, the line at pitch 50 on Transkun R1c, the note near 94 on Basic Pitch R1c) are read from the pictures' axes.
- captions: counts as in the main read (e0493, e0438, e0489, e0436).

Folded block 1, clip key
- S2n 29 seconds, a bass line under a melody, 90 notes, synthesized: INPUTS.md (29.357 s, "Synthesized fingerstyle: alternating thumb bass plus a melody on top", "90 notes") | "29 s" in for-aaron.md. "the fingerstyle clip above" and "the bossa nova clip above" point at the pictures' captions.
- R1c 28 seconds, 148 notes: INPUTS.md (28.235 s, "148 notes") | "28 s" in for-aaron.md.
- R2full is the 17th clip and the whole song R2 is cut from: INPUTS.md ("Clips present: 17 (... R2, R2full ...)"; R2 "excerpt 32.000-68.000 s of the song (R2full)"; R2full "the whole song", 228.482 s). No tool here ran on it: none of the 52 audio-to-notes runs in `runs.jsonl` names R2full (checked 2026-11-12), and `trials.md`, `tools.json`, `survey.md` and `for-aaron.md` never mention it. Basic Pitch ran on the other 16: r0234 (S1, S2n, S2s, S3, S4 with its stems S4guitar and S4lead, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2, R3a) and r0264 (R3b, R3c).
- "Four of the tools write MIDI straight from the audio. Three of them were trained on piano ... The fourth is Basic Pitch" (Basic Pitch's own training data, GuitarSet, MAESTRO, Slakh2100, iKala and MedleyDB, is in the license table): ByteDance (weights trained on MAESTRO V2.0.0, `tools.json`), Onsets and Frames (MAESTRO checkpoint, `trials.md` Gap round 1), Transkun (Maestro v3.0.0, `tools.json`). The three are now listed alphabetically (ByteDance's model, Onsets and Frames, Transkun). "SoX only prepared a test file": `trials.md` A2 ("It is input preparation, not a transcription trial").
- research folder link: moved from the first draft's opening, unchanged.
- S1 30-second, 62 notes: INPUTS.md (29.833 s, "62 notes") | "30 s" in for-aaron.md.
- S3 24 seconds, 182 notes: INPUTS.md (24.000 s, 182 notes).
- S4 467 notes besides the drums: e0499 n_truth 467 (trials.md table "S4 | 467") | INPUTS.md lists 661 notes with drums.
- S5capo2 capo on fret 2, every note two frets higher (was "2 semitones higher"; a semitone is one fret, and the post's clip table explains cents as "a hundredth of the step between two frets"): INPUTS.md. "half the step between two frets" for 50 cents and "a cent is a hundredth of the step between two frets": the same wording as `_clips.md`.
- S5dropd four bass notes below the usual lowest note: INPUTS.md ("D2 (string 6 open, 4 notes)", "the audio contains notes below E2") | trials.md "the four D2 notes, 73.4 Hz".
- S6taps 32 hits: INPUTS.md ("32 taps").
- S7flat30 30 cents flat: INPUTS.md.
- R1a 189 notes, R1b 70 notes: INPUTS.md.
- 50 ms, 50 cents, one-to-one match: evals.jsonl definitions for subcommand notes (e0490 "onset_tolerance=0.05, pitch_tolerance=50.0", "maximum bipartite matching").
- 10 ms slices, within 50 cents, raw pitch: evals.jsonl f0 definitions (e0113 "built from the truth notes on a 10 ms grid", "raw_pitch_accuracy(cent_tolerance=50) ... voicing decision ignored").
- slice counts N of M = raw_pitch_accuracy x n_ref_voiced_frames from evals.jsonl (each product is within 0.002 of a whole number | M = n_ref_voiced_frames: S1 2,624, S2n 2,529 (melody voice), R1b 1,823 (voice lead), S4lead 2,780).
- The slice sentence was split in two (it read "in how many of the slices where the melody sounds their pitch was within 50 cents of it"). Same meaning.
- S2n bass slices, added 2026-11-12 after a checker (the entries give S2n against the melody only, and `trials.md` "Which voice the monophonic trackers follow on two-voice S2n and S2s" scores both voices): M = 2,523 (n_ref_voiced_frames of every `--voice bass` eval below). RPA x 2,523: aubio 0.391994 = 989 (e1313), Essentia Melodia 0.0 = 0 (e1309), Essentia PitchCREPE `tiny` 0.449861 = 1,135 (e1311), FCPE 0.636147 = 1,605 (e1301), librosa pyin 0.501784 = 1,266 (e1299), PESTO 0.379707 = 958 (e1303), RMVPE 0.196195 = 495 (e1484, `trials.md` Gap round 1 RMVPE "Against the bass voice (RPA ignores voicing): S2n 0.196 (e1484)"), SwiftF0 0.695204 = 1,754 (e1297), torchcrepe `tiny` 0.015854 = 40 (e1305) and `full` 0.12287 = 310 (e1307). All gtr-eval 0.11.1, exit 0. Essentia PitchYinProbabilistic: no `--voice bass` eval of its S2n output in `evals.jsonl` (searched 2026-11-12). The checker wrote that RMVPE has no bass count either. e1484 is one, so RMVPE is in the list.
- "these trackers follow one pitch at a time": `trials.md` "The monophonic f0 trackers: shared facts" (S2n and S2s are there "to record what a monophonic tracker returns on polyphony").
- MIDI terms, added 2026-11-12: "69 is the A at 440 Hz": evals.jsonl f0 definitions ("the truth note's MIDI number converted to Hz (440 * 2^((m-69)/12))"). "one step per fret": one MIDI number is one semitone, the step between two frets. Velocity, program, ticks per quarter note and pitch bend are the fields the entries quote from the MIDI files (`trials.md` "Output" lines). "A confidence is a tracker's own number for how sure it is of a pitch": the confidence columns of Melodia, PESTO, RMVPE, SwiftF0 and PitchCREPE (`trials.md`), defined once here in place of the checker's rewording of aubio's "with no confidence".
- 2 CPU cores, unpinned shares the CPU: ENVIRONMENT.md "How runs were timed" | trials.md "How to read the numbers" (`--nolock`).
- Local runs cost nothing beyond the cloud session itself: ENVIRONMENT.md "Cost".
- Memory figures: the ledger's "MB" and GNU time's "MiB" are the same unit here (trials.md "The monophonic f0 trackers: shared facts": "peak RSS in MiB = GNU time's KiB / 1024, the unit gtr-run's "MB" also uses"), so all are written MB.

aubio
- 0.4.9, `aubio-tools` 0.4.9-4.4build1: trials.md aubio section.
- clips S1, S2n, S2s, S4, S4lead, R1b, R2, R3a: trials.md | r0130 (8 inputs).
- `yinfft`, `hfc`: trials.md ("pitch method yinfft", "onset method hfc"). "note-start method" is "onset method" in plain words (changed 2026-11-12, as in Essentia's "start, length and MIDI number" and CREPE Notes' "note-start model").
- 5.805 ms hop, `time_s pitch_hz`, 0 Hz in silence, no confidence | `midi_pitch onset_s offset_s`: trials.md.
- 2,511 of 2,624 (S1): e0293 (RPA 0.956936 x 2624). 1,242 of 2,529 (S2n): e0295. 1,585 of 1,823 (R1b): e0292.
- S1 62 returned, 3 of 62 found at 50 ms: e0305. 61 of 62 at 100 ms: e0352. median 56.2 ms late: e0350 / trials.md ("a median 56.2 ms after the truth onsets").
- R1b 169 returned, 52 of 70: e0303. S2n 43 returned, 0 found: e0308. S2n with a 100 ms window, 38 of 90 found, 30 of them melody notes (bass 8 of 48, melody 30 of 42): e0353 (added 2026-11-12 after a checker, who proposed the melody-only figure, 30 of 42 from e0357; e0353 is scored against all 90 notes, as S1's 100 ms figure e0352 is). Clips now in the order S1, S2n, R1b.
- 4.23 s, 35.2 MB, r0130, unpinned single-threaded: runs.jsonl r0130 (wall 4.23, max_rss_mb 35.2, locked false) | trials.md.
- 0.14 to 0.30 s, 0.19 to 0.42 s per clip: trials.md.
- flags `-p -l -s -B -H -r -u -O -t -M -d`, no range/tuning/key input: trials.md "Constraint inputs" ("`-p` pitch method, `-l` tolerance, `-s` silence, `-B`/`-H` buffer and hop"). "the analysis window and the step between windows" is buffer and hop in plain words.
- MIDI conversion program 24, velocity 80, 120 BPM (written "120 beats per minute"): trials.md "Outputs for other lanes" (`scripts/notes_csv_to_midi.py`) | MuseScore 4 named and not run: tools.json aubio handoffs_out (to "MuseScore 4 (command line)", "not run").

Basic Pitch
- 0.4.0, `nmp.tflite` 204,448 bytes: trials.md Basic Pitch section.
- paper title `A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation`: survey.md section 13 (Bittner et al., ICASSP 2022). Now "Its makers' paper", since the title carries the makers' own words.
- 16 WAV files listed, R3a.mp4, R3b and R3c (r0264): trials.md | runs.jsonl r0234 (16 inputs), r0264.
- command lines: trials.md runs 1 and 4 | "same 64 notes": trials.md run 4 ("identical to run 1's S1 list (64 notes)").
- program 4, Electric Piano 1, 220 ticks per quarter, tempo 120, pitch bends: trials.md | tools.json outputs ("program Electric Piano 1 (observed program 4, 0-based)").
- CSV header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`, `.npz`: trials.md.
- R3a.mp4 108 notes vs 105: trials.md run 5. R3b 129, R3c 87: trials.md (r0264). R2 334: trials.md note counts.
- first S2n notes (six lines) and "inside the silent count-in bar": trials.md "First S2n notes from the MIDI".
- 62.37 s, 393 MB (393 MiB), r0234: trials.md run 1 (GNU time) | runs.jsonl r0234 max_rss_mb 393.0. 0.87 s (R3a, 18 s), 3.71 s (S4, 38.7 s), 20.36 s (S1 first call): trials.md run 1.
- hint parameters, no tuning/capo/key/instrument input: trials.md "Constraint inputs".
- 82.4 to 1319.0 Hz, "E2 to about E6, the guitar's range": trials.md run 2. S5dropd bass 44 of 48: e0544, and the reason as `tools.json` r0234 configuration 2 gives it ("48/48 -> 44/48 (e0544; the four D2 notes, 73.4 Hz, lie below the limit)"). four D2 notes 73.4 Hz: trials.md. floor 73.4 Hz, 48 of 48, r0349: e1335, trials.md. Sentence reworded 2026-11-12 (it read "Set to ..., S5dropd's bass came out 44 of 48").
- "Hands off to" reworded 2026-11-12: Basic Pitch's own `handoffs_out` in `tools.json` (music21, MuseScore 4 (command line), NeuralNote v1) all end "not run". The two tests fed other tools' output into Basic Pitch: Demucs `handoffs_out` ("read by Basic Pitch 0.4.0 in run r0243") and SoX `handoffs_out` ("S7flat30.plus30c.wav was read by Basic Pitch in run r0319"). NeuralNote v1 is left out of the line, since it takes Basic Pitch's model file, not its MIDI.
- htdemucs_6s stems: guitar stem 342 notes, 233 of 369: e0652. true guitar track 386 notes, 302: e0502. full mix 461 notes, 249 against the guitar part alone: e0682 (`--voice chord`). bass stem 142 notes, 46 of 61: e0657. run r0243: trials.md handoff section | tools.json r0243 ("onset_only_vs_one_truth_voice").
- 249 and 243 for the same S4 output (explained in the entry since 2026-11-12): e0682 scores Basic Pitch's 461 S4 notes against the 369 guitar (`chord`) notes alone and matches 249. e0499 scores the same file against all 467 non-drum notes at once, where some returned notes match bass or lead notes, and its `recall_by_voice` gives the guitar 243 of 369. The table row uses e0499.
- SoX-shifted S7flat30: 265 notes, 139 of 182: e1203, run r0319 (runs.jsonl r0319, input `S7flat30.plus30c.wav`) | unshifted 112 notes, 83 found: e0514, run r0234 (the 16-file batch). The first draft put "(run r0319)" after the unshifted figures. trials.md "Tuning-correction re-run test" | tools.json r0319 ("for comparison S7flat30 as is ... (e0514)").
- table: S1 e0490 | S2n e0493 (melody 42/42, bass 48/48) | S2s e0495 | S3 e0497 | S4 e0499 (bass 26/61, chord 243/369, melody 24/37) | S4guitar e0502 | S4lead e0505 | S5capo2 e0507 | S5dropd e0510 | S6taps e0512 | S7flat30 e0514 | R1a e0486 | R1b e0488 | R1c e0489.

ByteDance
- 0.0.6, weights 171,966,578 bytes from Zenodo, trained on piano: trials.md ByteDance section. "the numbers the model learned in training" and "the research archive Zenodo" are plain-word explanations added 2026-11-12 (first use of "weights" in the section).
- `librosa.load(path, sr=16000, mono=True)`, error `AttributeError: No librosa.core attribute audio`, librosa 0.11: trials.md "Dead end".
- command `PianoTranscription(...)`: trials.md.
- 384 ticks per quarter, tempo 120, program 0, CC64, 18 in S2n.mid, no pitch bends: trials.md "Output".
- S2n 87 returned, 79 of 90, bass 48/48, melody 31/42: e1393. R1c 87 returned, 63 of 148: e1392.
- 159.3 s, setup 8.6 s, S2n 75.8 s, R1c 73.7 s, 998.8 MB, r0401 unpinned torch 2 threads: trials.md ("`--nolock` (unpinned, torch set to 2 threads)") | runs.jsonl r0401 (wall 159.3, max_rss_mb 998.8, locked false). "torch" is PyTorch's package name, so the entry now says PyTorch, explained there as the machine-learning library it runs on (its first use in the section). PENN's line also says PyTorch for torch now.
- re-run 27.8 s, r0464: trials.md verification log ("ByteDance S2n 75.8 s in r0401 (unpinned), 27.8 s in r0464").
- `model_type`, `checkpoint_path`, `device`, none for range/tuning/instrument: trials.md "Constraint inputs".

CREPE Notes
- 0.2.0 | makers' quote `Post-processing for the CREPE pitch tracker to turn f0 pitch estimates into discrete notes (MIDI)`: tools.json what / trials.md A3.
- madmom copy from another lane's build: trials.md A3 install.
- what madmom does inside it (reworded 2026-11-12, the first draft said madmom finds where notes start): trials.md A3 "What" ("finds note boundaries where the confidence dips and the pitch changes, splits repeated notes at madmom `CNNOnsetProcessor` onsets").
- inputs S1, R1b, S4lead, 10 ms rows, three versions (full, tiny, full with periodicity below 0.21 set to 0 Hz): trials.md A3 "Input preparation". "big `full` model" and "small `tiny` one": `full.pth` 88,991,291 bytes, `tiny.pth` 1,962,363 bytes (trials.md torchcrepe). Periodicity "the model's 0-to-1 probability for the pitch it picked": trials.md torchcrepe "Output" ("a periodicity 0 to 1 (the probability at the decoded bin)").
- command: trials.md A3 "Run".
- type 1, 220 ticks per quarter, program 0, tempo 120, velocities 7 to 127, no pitch bends: trials.md A3 "Output".
- `Tuning offset: 6.000000000000005 cents`: trials.md A3.
- all nine configurations, returned and found (n_est and n_matched_onset_only), in the order `full` (tcfull), `tiny` (tctiny), `full` with low-periodicity slices at 0 Hz (tcfullz): S1 62 and 61 (e1781), 62 and 62 (e1786), 61 and 59 (e1789) | R1b 94 and 29 (e1783), 95 and 25 (e1787), 97 and 28 (e1790) | S4lead against the melody voice, 38 and 28 (e1785), 38 and 33 (e1788), 40 and 27 (e1791). All gtr-eval 0.12.0, exit 0 (read 2026-11-12), and the same as trials.md A3's table. The first draft quoted one or two versions per clip, the one with the most found for R1b and S4lead. A checker asked for all nine.
- R1b's 48 (`full`) and 52 (`tiny`) notes at MIDI 90 or above, from the slices at 1,500 Hz or above: trials.md A3 ("in the `tcfull` and `tctiny` outputs, R1b has 48 and 52 notes at MIDI 90 or above").
- 35.19 s, 9 calls, 570.9 MB, r0616, 3.17 to 4.44 s per call, onset detection inside each call: runs.jsonl r0616 (cores [2, 3], locked true) | trials.md A3.
- re-run (added 2026-11-12): r0694, 2 cores (cores 0-1), wall 75.6 s, per call 6.12 to 22.33 s ("the first call took 22.33 s"), all nine MIDI files byte-identical to r0616's: trials.md "Verification log (verify-gapfill-audio-to-notes, round 2, 2026-11-11)", Re-runs | runs.jsonl r0694 (wall 75.6, cores [0, 1], locked true, exit 0) | tools.json CREPE Notes runs r0694. Both runs had 2 cores, so the entry now says "also on 2 cores".
- hints `--tuning-offset` (cents), `--min-duration`, `--min-velocity`, `--sensitivity`, no pitch range/capo/string input: trials.md A3 "Constraints accepted".
- reads `frequency` and `confidence` columns: trials.md A3.

Essentia
- 2.1b6.dev1389, `essentia-tensorflow` wheel (the entry says "package"): trials.md Essentia section.
- clips, 44.1 kHz / 16 kHz: trials.md ("`MonoLoader(sampleRate=44100)`, or 16000 for CREPE") | multi-pitch clips S2n, S2s, S3, S4guitar, R1a, R1c: trials.md multi-pitch section.
- the five command lines: trials.md runs 1 to 4 and multi-pitch "Runs".
- Melodia 2.9 ms (hopSize 128), 0 Hz unvoiced: trials.md. Within 50 cents 1,818 (S1, e0997), 1,590 (S2n, e1000), 1,318 (R1b, e0994).
- PitchContourSegmentation S1 37 returned, 37 matched: e1038. S2n 32 returned, 31 of 90, all melody (bass 0/48, melody 31/42): e1040. R1b 106 returned, 48 of 70: e1036.
- PitchYinProbabilistic whole-MIDI outputs and the rounding cause: trials.md Gap round 2 A6. Added 2026-11-12, "That rounding was read in Essentia's source code, and whether the installed build was made from that code wasn't checked, though it behaves the same": A6 ("Essentia's source at `master` (read 2026-11-11) converts each candidate with ..."; "That the dev1389 wheel was built from these same lines was not checked (the run shows the same behaviour).") | tools.json Essentia `unverified`, new at e95cdb8 ("that the dev1389 wheel was built from the same Essentia source lines ... was not checked; the run shows the same behaviour"). 110 Hz read as 103.826 Hz, 440 Hz as 293.665 Hz: trials.md Essentia section and A6. "why it lands below the tone was not settled": A6 "What stays UNVERIFIED". Counts 1,298 (S1, e1014), 0 (S2n, e1016), 42 (R1b, e1011).
- PitchCREPE tiny 2,578 (S1, e1027), 1,282 (S2n, e1028), 1,552 (R1b, e1025) | full 2,597 (S1, e1205), 1,602 (R1b, e1204).
- Klapuri at most 2 pitches, a pitch in every frame including the silent count-in | MultiPitchMelodia up to 4 on S3: trials.md multi-pitch "Output". The entry says "slice" for "frame", as the clip key does.
- PitchContourSegmentation "(start, length and MIDI number)": trials.md ("onset (s), duration (s), MIDI note number").
- times: Melodia+PCS 38.90 s (250 MiB), PitchYinProbabilistic 11.31 s (255 MiB), CREPE tiny 124.72 s (367 MiB), CREPE full 453.93 s for 3 clips (599 MiB): trials.md runs 1 to 4 (batch r0321). The time line was split into sentences 2026-11-12, same figures. Klapuri 51.38 s, MultiPitchMelodia 11.42 s, 6 clips, unpinned, r0345, r0346: trials.md | runs.jsonl.
- hints `minFrequency`, `maxFrequency`, `tuningFrequency` (Hz, default 440), `Audio2Midi` `transpositionAmount` and `tuningFrequency`: trials.md "Constraint inputs" | tools.json constraints_accepted ("tuningFrequency (any integer Hz, default 440 ...)").
- handoff r0341, S1: FCPE 48 notes, 48 found (e1319) | PESTO 62, 47 (e1322) | Essentia PitchCREPE tiny 65, 43 (e1329) | torchcrepe full 48, 47 (e1325). Listed alphabetically since 2026-11-12 (the first draft's order ran from most found to fewest).
- MIDI from Melodia notes: trials.md "Outputs for other lanes".

FCPE
- `torchfcpe` 0.0.4, `Fast Context-based Pitch Estimation`, 43,363,260-byte model: trials.md FCPE section.
- command and "the settings of the README example": trials.md. "the repository's front page" explains README (its first use in the section). "built on PyTorch": trials.md FCPE ("a PyTorch f0 model").
- 10 ms, 0 where unvoiced, no confidence: trials.md "Output".
- 2,598 (S1, e0132), 704 (S2n, e0134), 1,622 (R1b, e0130).
- 32.57 s, setup 9.13 s, 636 MiB, batch r0321: trials.md.
- hints `f0_min`, `f0_max`, `threshold`, `decoder_mode` | docstring quote `Use in post-processing` ("its built-in help text" in the entry): trials.md "Constraint inputs".
- PCS handoff S1 48 notes, 48 of 62 (e1319) | R1b 87 notes, 56 of 70 (e1318) | 7 NaN-pitch notes dropped on R1b: trials.md handoff section.

librosa pyin
- 1.0.0, "probabilistic YIN", no trained weights: trials.md | tools.json what.
- 22,050 Hz load | command copied from trials.md (with its "(C2)" and "(C7)" annotations).
- 23.2 ms hop, NaN unvoiced, voiced flag, voiced probability, no notes: trials.md ("frame-wise f0 with a voiced flag and a voiced probability"). Written in plain words since 2026-11-12: NaN "a not-a-number marker", the voiced flag "a yes-or-no flag for whether a slice has a pitch", the voiced probability "the probability that it does".
- 2,515 (S1, e0121), 116 (S2n, e0122), 1,552 (R1b, e0120).
- 31.75 s, 485 MiB, batch r0321, S1 13.18 s first, others 1.39 to 3.46 s: trials.md.
- `fmin`, `fmax` required, `max_transition_rate`: trials.md "Constraint inputs".

Onsets and Frames
- `magenta` 2.1.4, MAESTRO checkpoint, trained on piano: trials.md Gap round 1.
- Python 3.7 or 3.8 (3.8 used), TensorFlow 2.9.1, venv 2.0 GB: trials.md Gap round 1 "Install" ("pins tensorflow 2.9.1, numba 0.49.1, numpy 1.21.6 and librosa 0.7.2, whose wheels overlap on Python 3.7 and 3.8, so: `uv venv --python 3.8 ...`"). The first draft said "Python 3.8". "The checkpoint, its saved trained model" and "TensorFlow ..., another machine-learning library" explain the two terms at their first use in the section.
- inputs S1, S2n, R1c (mono WAV) and S4guitar: trials.md (symlinks to `S1.mono.wav`, `S2n.mono.wav`, `R1c.mono.wav`, `S4/stems/guitar.wav`).
- command: trials.md "Run".
- type 1, 220 ticks per quarter, tempo 120, program 0, no pedal, no pitch bends: trials.md "Output".
- S1 65, 62 of 62 (e1570) | S2n 91, 88 of 90, bass 48/48, melody 40/42 (e1571) | R1c 173, 105 of 148 (e1572), median 33.7 ms early (trials.md), 119 of 148 at 100 ms (e1574) | S4guitar 372, 299 of 369 (e1573).
- 39.57 s, 1,151.0 MB, r0545: runs.jsonl. first file about 20 s in, 4.07 to 5.30 s per file: trials.md ("S1 5.30 s, S2n 4.07 s, R1c 4.31 s, S4 guitar stem 4.97 s").
- no pitch range, tuning, instrument or tempo input: trials.md "Constraint inputs".

PESTO
- `pesto-pitch` 2.0.1, Sony CSL Paris, default model `mir-1k_g7.ckpt` 534,664 bytes: trials.md PESTO section.
- command: trials.md.
- 10 ms, confidence 0 to 1, pitch on every frame, no voiced/unvoiced decision ("no decision on whether a slice has a pitch" in the entry): trials.md "Output".
- 2,590 (S1, e0146), 1,534 (S2n, e0147), 1,599 (R1b, e0143).
- 49.59 s, setup 4.38 s, 1,044 MiB, batch r0321: trials.md.
- hints `step_size`, `model_name`, `reduction`, `num_chunks`, no range or tuning input: trials.md.
- PCS handoff S1 62 notes, 47 of 62 (e1322) | R1b 169, 43 of 70 (e1321).

RMVPE / rmvpe-onnx
- 0.2.3, third-party wrapper, `rmvpe.onnx` 361,688,443 bytes, ONNX Runtime: trials.md Gap round 1 RMVPE section. "ONNX Runtime, a program that runs model files": plain-word explanation at its first use.
- "a pitch model for the singing voice": trials.md ("a frame-wise f0 model for the singing voice").
- inputs: trials.md (`<id>.mono.wav` and S4lead stereo stem).
- commands: trials.md "Run" and CLI paragraph.
- 10 ms, confidence 0 to 1, 360-bin activation ("the model's raw values for 360 pitch steps" in the entry), pitch every frame, no notes: trials.md "Output facts".
- threshold 0.03, 498 of 2,984 voiced: trials.md CLI printout ("Frames : 2984", "Voiced : 498 (16.7 %)"). Reworded 2026-11-12 to "marked 498 of all 2,984 slices in S1 as having a pitch", and the next sentence says "S1's 2,624 melody slices", since 2,984 is every 10 ms slice of S1 and 2,624 the ones where the melody plays (n_ref_voiced_frames of e1478).
- 1,710 (S1, e1478), 1,051 (S2n, e1479), 2,667 of 2,780 (S4lead, e1482), 1,544 (R1b, e1483).
- 34.68 s, 1,198.7 MB, r0516 | `predict()` 16.05 s on S1, 1.13 to 2.44 s others: trials.md | runs.jsonl.
- hints `model_path`, `device`, `--confidence-threshold`, no frequency range/tuning/key: trials.md "Constraint inputs".
- two entries, same runs (added 2026-11-12): tools.json "RMVPE" (kind research-model) and "rmvpe-onnx" (kind library), both `tried_how` "local-cpu (rmvpe-onnx 0.2.3, ONNX Runtime 1.31.1, rmvpe.onnx from lj1995/VoiceConversionWebUI)" with the same runs.
- thread caveat (added 2026-11-12): trials.md Gap round 1 RMVPE "Run" ("corrected in gap round 2: rmvpe-onnx sets no thread count, and with its session settings ONNX Runtime 1.31.1 pinned its worker threads to CPUs 1, 2 and 3 in a probe limited to CPUs 0 and 1, run r0666 ... so the "2 cores" of r0516 ... is the slot the process was given, not where all its threads ran. Not measured in r0516 itself.") | A8 (r0666: ONNX Runtime 1.31.1, `taskset -c 0,1`, threads "running on CPUs 1, 2 and 3"; "for r0516 and r0579 this follows from the probe with the same ONNX Runtime version and settings, not from a measurement of those runs") | tools.json RMVPE `cores_note` as reworded at e95cdb8 ("ran worker threads on CPUs 1, 2 and 3 in probe r0666 (two first seen with Cpus_allowed_list 0-1, then 2 and 3); not measured in this run") | ENVIRONMENT.md "How runs were timed", added after the first draft ("One catch found late: native ONNX Runtime sets its own thread affinity and ignored the 2-core slot unless its thread count was set, so timings of ONNX Runtime jobs at default settings are not 2-core figures (see the video, audio-to-notes and browser lanes)").
- Checked again 2026-11-12: 1,710.0, 1,051.0, 2,667.0 and 1,544.0 from raw_pitch_accuracy x n_ref_voiced_frames of e1478, e1479, e1482, e1483 | runs.jsonl r0516 (wall 34.68, 1,198.7 MB, cores [0, 1]).

SoX
- 14.4.2: trials.md A2 and "Media kept outside git".
- command `sox S7flat30.wav S7flat30.plus30c.wav pitch 30`: trials.md "Tuning-correction re-run test".
- 24.00 s, 44.1 kHz, 2 channels, 16-bit: trials.md A2 / "Media kept outside git".
- at most 2 in 16-bit units, dither by default, `-R` identical: trials.md A2. "the dither, a little noise SoX adds by default": plain-word explanation added 2026-11-12.
- 0.26 s, 9.7 MB, r0602 unpinned: runs.jsonl r0602.
- shift in cents as the `pitch` argument: tools.json SoX outputs ("audio file (pitch shift in cents)").
- `-R` repeatable mode and `-D` no automatic dither (added 2026-11-12): tools.json SoX `constraints_accepted`, new at e95cdb8 ("-D (\"Disable automatic dither\")", "-R (\"Run in `repeatable' mode\")") | survey.md section 38 (same quotes, from the `sox.1` man page source).
- "It made the input for the tuning test, and the same command ran again later to log it and to compare outputs" (corrected 2026-11-12, the first draft said "It ran once"): trials.md A2 (the 2026-11-10 command had no ledger line; r0602 ran the same command through `gtr-run`; "Two further runs of the same command (not logged)", "two runs with SoX's `-R`", "one run with `-D`") | the verifier's r0691 (trials.md Verification log round 2; runs.jsonl r0691, wall 0.27 s).

SwiftF0
- 0.3.0, ONNX model 135,090 bytes inside the wheel: trials.md SwiftF0 section.
- what it is: tools.json what ("a pitch detector for monophonic audio (one voice or instrument, not chords) ... has its own note segmenter and MIDI export | ONNX").
- `detect_file`, 16 kHz, command with `pitch_hold_ms=80`: trials.md.
- 16 ms, voiced at confidence 0.5 or more per docstring ("a slice counts as having a pitch at confidence 0.5 or more, its built-in help text says"), `Note(start, end, pitch_hz)`: trials.md ("the tool's docstring: a frame is voiced when its confidence is at least 0.5").
- 2,522 (S1, e0113), 567 (S2n, e0114), 1,555 (R1b, e0112).
- S1 48 returned, 46 of 62 (e0152) | S2n 55, 27 of 90, bass 18, melody 9 (e0153) | R1b 60, 50 of 70 (e0151). In the clip order S1, S2n, R1b since 2026-11-12.
- F#4 at 1.667 s and 2.083 s | first three notes, "start-end in seconds" (trials.md writes them `onset_s,offset_s,pitch_midi,fitted_pitch_hz`) | "came out as one note": trials.md SwiftF0 "Output (notes)".
- 4.39 s, setup 0.12 s, 0.22 to 0.80 s per clip, 282 MiB, batch r0321: trials.md.
- `fmin`, `fmax` clamped 46.875 to 2093.75 Hz, `pitch_hold_ms`, no tuning/key/tempo/instrument: trials.md "Constraint inputs".
- 82.4 to 1319.0 Hz, r0131 unpinned, same counts and the same number of matched notes on the six clips with a known answer: trials.md ("the same counts and the same note scores on all six scored clips (e0343 to e0349)") | n_est and n_matched_onset_only of e0343 and e0345 to e0349 equal those of e0151 to e0156 (R1b 60 and 50, S1 48 and 46, S2n 55 and 27, S2s 28 and 9, S4 8 and 3, S4lead 35 and 20). e0344 is a tuning eval of R1a, not part of this set. Whether the same notes were matched was not checked, so the entry says "the same number of matched notes" (the first draft said "the same matches").

torchcrepe
- 0.0.24, `tiny.pth` 1,962,363 bytes, `full.pth` 88,991,291 bytes: trials.md torchcrepe section.
- command: trials.md "Run".
- 10 ms, periodicity 0 to 1, pitch every frame: trials.md "Output". "A PyTorch version" (was "port"): trials.md ("a PyTorch port of the CREPE pitch tracker").
- S1 2,576 tiny (e0747), 2,586 full (e0758) | S2n 175 (e0749), 358 (e0760) | R1b 809 (e0745), 872 (e0756).
- 890 (tiny) and 838 (full) of 1,823 at 1,500 Hz or above: trials.md "Oddity, measured". "the Viterbi decoder, the step that picks one pitch per slice from the model's output": plain-word explanation (trials.md "decoder: the default, `torchcrepe.decode.viterbi`").
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
- 814.45 s, 1,490 MiB, r0216, per clip 83.7 s (S1) to 172.5 s (R1a): trials.md ("one subprocess per clip (so the model is loaded for every clip)", "Per clip (subprocess, model load included)"). The entry now says the per-clip times include the loading.
- re-run S1 40.6 s, r0464: trials.md verification log ("The same commands took different times under a different box load: Transkun S1 83.7 s in r0216, 40.6 s in r0464") | runs.jsonl r0216 (cores [0, 1], locked true) and r0464 (cores [2, 3], locked true), so both on 2 cores.
- hints `--weight`, `--conf`, `--device`, `--segmentHopSize`, `--segmentSize`, no range/tuning/instrument/tempo: trials.md.

Folded block 2 (did not run)
- permission system refusals ("[Code from External]"): trials.md "Gap round 1" intro, A5, mt3-infer and yourmt3 sections. Intro reworded again 2026-11-12 (it read "refused to run outside code, like code cloned from other people's repositories", which a checker found ambiguous) to "It refused some commands with the reason `[Code from External]`, among them installing or running code cloned from other people's repositories and running two packages installed from the Python package index". The refusals on record: installing the MT3 clone and running the mt3-pytorch clone (trials.md "Gap round 1" intro, `samples/mt3/permission-refusal.txt`), installing CREPE's source with its weights put in place (`samples/crepe/gap1-not-run.txt`), running the Deep Salience clone (A5), running the `mt3-infer` CLI and the `yourmt3` script, both installed from PyPI (Gap round 2 sections `mt3-infer` and `yourmt3`). "among them" because the CREPE one is neither a clone nor a run of a PyPI package. The checker's wording ("refused to run code from outside the box") was not used: Basic Pitch, Transkun and the other tools that ran were also installed from PyPI.
- JDC and SSL "not attempted after that refusal" (added 2026-11-12): tools.json `not_run_reason` of both, changed at d2f96f3 ("this tool itself was not attempted after that refusal") | trials.md A5 ("JDC and SSL were not attempted after that refusal"), Verification log round 2 correction 4 | for-aaron.md section 13.
- MT3 "Later my agents installed the package `mt3-infer`, which carries code for a PyTorch version of MT3 and two related models. Running it was refused too" (added 2026-11-12, reworded the same day after a checker: "which runs" became "which carries code for", since it never ran, and "port" became "version"): tools.json MT3 `not_run_reason` ("(gap round 2 ...: the PyPI package(s) mt3-infer were installed; running them was refused by the session's permission system ...)") | its models: tools.json mt3-infer `constraints_accepted` ("model: mr_mt3, mt3_pytorch, yourmt3"), trials.md `mt3-infer` (default model `mt3_pytorch`; mt3-pytorch is "a PyTorch port of MT3" in its own entry) | trials.md MT3 ("the PyPI package `mt3-infer` 0.2.0 ..., which vendors the mt3-pytorch, MR-MT3 and YourMT3 code").
- MR-MT3 "Later the package `mt3-infer`, whose `mr_mt3` model pairs MR-MT3's code with its `mt3.pth` checkpoint" (added 2026-11-12): tools.json MR-MT3 `not_run_reason` ("mt3-infer (its mr_mt3 model uses gudgud1014/MR-MT3's mt3.pth)") | trials.md MR-MT3 ("whose `mr_mt3` model pairs vendored MR-MT3 code with the `mt3.pth` file above, was installed; running its CLI was refused").
- YourMT3+ (reworded 2026-11-12 after the checkers): "one call to the demo from this step was refused for lack of graphics-card time" (ZeroGPU quota, "90s requested vs. 79s left") | "The hosted-services research ran the demo's CPU copy, `mimbres/YourMT3-cpu`, on S2n and R1c": trials.md YourMT3+ ("The hosted-apis lane's runs of `mimbres/YourMT3-cpu` on S2n and R1c (r0164 31.18 s, r0245 31.34 s ...)") | tools.json YourMT3+ `not_run_reason` (same runs). "My agents didn't try a local run": trials.md ("Gap round 1, local CPU run: not attempted").
- YourMT3+ "Later two third-party packages that carry YourMT3 models, `yourmt3` and `mt3-infer`" (added 2026-11-12): tools.json YourMT3+ `not_run_reason` ("the PyPI package(s) yourmt3 and mt3-infer were installed; running them was refused") | trials.md YourMT3+ ("corrected in gap round 2: the third-party PyPI package `yourmt3` 0.1.4 was installed ..."), `mt3-infer` vendors YourMT3 code and has a `yourmt3` registry entry (trials.md `mt3-infer`).
- Self-supervised F0 paper "A web search for its code couldn't be made, because the session's search budget was used up" (added 2026-11-12): tools.json `not_run_reason` ("a web search for a repository was not possible in gap round 2 ... (search budget used up)") | trials.md A7 | Verification log round 2 ("Web search was not performed: this turn's web search budget is used up").
- for-aaron.md section numbers: for-aaron.md headings 1 to 14.
- Aria-AMT `assert cuda_is_available(), "CUDA device not found"`: tools.json not_run_reason ("so it stops on a machine without a CUDA GPU"; the entry says "without a graphics card", as the post does elsewhere). Its reason, reworded 2026-11-12 after both checkers: tools.json ("Piano model, none attempted (two piano models ran)") and trials.md "From the docs lane's survey" ("Aria-AMT, Onsets and Velocities: piano models (two piano models ran)") were written in the first round, when ByteDance (r0401) and Transkun (r0216) had run (trials.md hFT-Transformer: "Two other piano-trained models (Transkun, ByteDance) ran above"). Onsets and Frames ran later, in gap round 1 (r0545). The entry now says so instead of repeating "since two piano models already ran".
- "my agents didn't read up on it for this step" (Ableton Live, AnthemScore, Klangio, Melodyne, Music.AI; was "not read here"): tools.json not_run_reason ("not read by the docs agent (see the apps-survey and hosted-apis lanes)").
- "My agents skipped it to save time and disk space" (GAME, Onsets and Velocities, ROSVOT, SOME, VocalParse; was "Not attempted, for time and disk"): tools.json not_run_reason ("None attempted, for time and disk").
- audio_to_midi_melodia, MELODIA HTTP 403, download form: tools.json not_run_reason | trials.md. "a script made to turn MELODIA's melody into MIDI" (was "turns ..."): tools.json what ("Extract the melody notes from an audio file and export them to MIDI ... (wrapper around the MELODIA Vamp plugin)") | survey.md section 11 (run as `audio_to_midi_melodia.py infile outfile bpm`). "refused the box (HTTP 403)" for "answered the box with HTTP 403" here, for MELODIA and for vamp-simple-host.
- CREPE 0.0.16 errors `ModuleNotFoundError: No module named 'pkg_resources'` (newest setuptools) and, with the build constraint `setuptools<81`, `urllib.error.HTTPError: HTTP Error 403: Forbidden`: trials.md CREPE gap round 1.
- Deep Salience, JDC, SSL: trials.md A5 | tools.json | 2017 paper: tools.json what ("ISMIR 2017"). "Keras, another machine-learning library": plain-word explanation at its first use. CREPE "Its weights ran here through torchcrepe and Essentia" (was "did run"): tools.json CREPE not_run_reason ("The same CREPE weights ran through torchcrepe and Essentia's crepe-*-1.pb").
- Demucs run by the source-separation lane, stems into Basic Pitch: tools.json not_run_reason.
- GAME, SOME, Onsets and Velocities, ROSVOT, VocalParse "for time and disk": tools.json not_run_reason.
- the singing tools that didn't run, reworded 2026-11-12 so that what they do is the makers' word: GAME `designed for transcribing singing voice into music scores` and SOME `SOME is a MIDI extractor that can convert singing voice to MIDI sequence` (tools.json what | survey.md section 32, both README quotes) | ROSVOT "a research model built to turn singing into MIDI" (tools.json what "ROSVOT: Robust Singing Voice Transcription and MIDI Extraction", kind research-model) | VOCANO "a model made to turn singing into MIDI" (tools.json what "singing voice to MIDI") | VocalParse "a model built to turn singing into lyrics, notes and tempo, on top of Qwen3-ASR, a speech-recognition model" (tools.json what "transcribes singing audio into ... lyrics, pitch, note values, and global tempo (BPM) ...; built on Qwen3-ASR (fine-tuned Qwen3-ASR-1.7B)"). ROSVOT and VocalParse "a version of PyTorch made for graphics cards" for "a CUDA build of torch": tools.json ("README installs CUDA 11.8 torch", "README installs CUDA 12.4 torch; CPU inference is not described").
- Harmonica, MIROS, VOCANO, SPICE, praat-parselmouth, pyworld, pitch-core "found by the verifier's completeness search and not surveyed in full": tools.json.
- hFT-Transformer reasons: trials.md / tools.json ("Its README's 'Development Environment' lists a GPU (NVIDIA GeForce RTX 2080 Ti) for 'corpus generation, evaluation' and an A100 for training", "running cloned repository code had been refused in this session for Timbre-Trap"). Split into shorter sentences 2026-11-12, and "its cloned code" now names Timbre-Trap.
- madmom inside CREPE Notes: tools.json not_run_reason.
- MR-MT3 `self.model.cuda()`, refused twice, code change needed: trials.md MR-MT3 ("running code from a cloned repository is the action the session's permission system refused twice in this round, minutes earlier (... installing the MT3 clone, running the mt3-pytorch clone ...)"). Reworded 2026-11-12: the refusals were of MT3's and mt3-pytorch's clones, not MR-MT3's, and the `mt3.pth` checkpoint is MR-MT3's (Hugging Face `gudgud1014/MR-MT3`).
- MT3 notebook install refused: trials.md MT3.
- mt3-infer 0.2.0 installed, CLI refused, nothing downloaded: trials.md Gap round 2 `mt3-infer` section.
- mt3-pytorch `ddsp` needs `crepe`, build fails | clone run refused: trials.md MT3 | tools.json ("does not resolve on the box: ddsp 3.3.4 needs crepe>=0.0.11, and uv's build of the crepe 0.0.16 source archive stops ..."; "Without ddsp the list resolves"), hence "can't all be installed on the box".
- MTANet no weights: trials.md A5.
- MuScriptor gated, no token, 411,888,600 bytes, 200 MB limit: trials.md "From the docs lane's survey" | trials.md "Tools not run here" intro (200 MB notice). "Hugging Face, a site that hosts AI models" and "access key" for token: plain words at the first use.
- MuScriptor hosted page needs JavaScript: tools.json not_run_reason.
- NeuralNote no command-line use, not attempted: trials.md NeuralNote.
- Omnizart 0.5.0, Python 3.8, `vamp` 1.1.0, `ModuleNotFoundError: No module named 'numpy'`: trials.md Omnizart gap round 1.
- onsets-and-frames port no checkpoint: tools.json not_run_reason ("PyTorch port, jongwook"; written "PyTorch version").
- PENN 1.0.0 `Could not find any lib files matching version pt215cpu`, torch 2.6 to 2.11 vs 2.15 (written "PyTorch"), r0399, r0423, disk limit: trials.md A1 and "From the docs lane's survey" | tools.json.
- pYIN Vamp build refused, Timbre-Trap code run refused, both only the trial agent's report: trials.md "Verification log (verify-trials-audio-to-notes)" "Still UNVERIFIED" ("The two permission refusals (pYIN build, Timbre-Trap code) ... the trial agent's report, with no file on the box recording them"). hFT-Transformer's reason cites the Timbre-Trap refusal (tools.json), so it carries the same note. Tony: tools.json.
- Self-supervised F0 paper, 2026: trials.md A7 (submitted 2026-01-16).
- Sheet Sage quotes `ensure you are running Linux and have Docker installed`, `a ~4GB Docker container`, no Docker: trials.md Sheet Sage ("a one-time setup that downloads", so the entry no longer says the README downloads it). Makers' quote `transcribes your favorite pop song into a lead sheet containing the melody and chords`: tools.json what | survey.md section 22 (the README sentence ends with an exclamation mark, left out of the quote). "Docker, a system that ships a program with everything it needs to run": plain words at its only use.
- Spleeter 2-stem ONNX, Omnizart's vocal mode: tools.json what / not_run_reason.
- Timbre-Trap `tt-orig.pt` 11,353,410 bytes, refused, Space `RUNTIME_ERROR`: trials.md Timbre-Trap.
- vamp-simple-host on the box, no plugin runnable: tools.json not_run_reason.
- VocalParse built on Qwen3-ASR, CUDA 12.4 torch: tools.json what, version, not_run_reason.
- YourMT3+ quota quote `You have exceeded your ZeroGPU quota (90s requested vs. 79s left).`, local run not attempted: trials.md YourMT3+ | tools.json.
- yourmt3 0.1.4, `YPTF+Single.pt` 121,781,787 bytes, run refused: trials.md Gap round 2 `yourmt3` section.

Folded block 3 (licenses), all from `tools.json` license fields unless noted
- aubio GPL-3.0-or-later (COPYING url). Basic Pitch Apache-2.0, model files no separate license, training data GuitarSet CC BY 4.0, MAESTRO quote, Slakh2100 CC BY 4.0, iKala license null, MedleyDB quote substring `for non-commercial research use only`. iKala and MIR-1K were "no license found" in the first draft. Now "no license on its Zenodo backup copy, original terms not read": tools.json `unverified` of both ("restricted Zenodo copy; the original distributor's terms were not read") and their Zenodo quotes ("this version is just a backup for myself", "here the dataset just a backup of my using").
- ByteDance MIT by setup.py classifier, no LICENSE file | weights CC BY 4.0 (Zenodo 4034264) | MAESTRO V2.0.0.
- first line "Besides the 68 tools, apps and services, my agents' record lists 30 datasets": tools.json `kind` count (dataset 30). "training" dropped 2026-11-12 after a checker: tools.json `what` gives Molina and Phenicx "Used by (training): Basic Pitch (test-only)", ComMU "Used by (training): MR-MT3 (evaluation)" and Vocadito "dataset whose audio files are included in the basic-pitch tests (NOTICE)". "Most were used to train models": the other entries' `what` begins "training dataset. Used by (training):" with models named (Aria-MIDI's names a checkpoint it hosts, so no exact count is given). "The table names the datasets behind the models that ran" replaces "the ones the models that ran were trained on".
- CREPE Notes GPL-3.0 | madmom models quote `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0` | training data list empty in tools.json. "note-start model" for madmom's onset CNN. "plus torchcrepe's weights here" removed 2026-11-12: trials.md A3 ("It has no weights of its own; madmom's onset CNN ... is the only trained model it runs when given `--f0`") | tools.json CREPE Notes `license.weights.note` (the same). The cell now says its input pitch came from torchcrepe, run separately (run r0321, the f0 files named in r0616's inputs).
- CREPE Notes, added 2026-11-12 from the license fields refreshed at e95cdb8: "the madmom code it calls is BSD-2-Clause": tools.json CREPE Notes `license.weights.note` ("madmom source code: BSD-2-Clause (LICENSE has two numbered conditions and no third clause, re-read 2026-11-11; the text of the SPDX identifier BSD-2-Clause)") and madmom `license.code.spdx` "BSD-2-Clause" | trials.md A4 | survey.md section 12. "the installed madmom's `madmom/models/LICENSE` says `All files in this repository are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0`": tools.json CREPE Notes `license.weights.also` (url "madmom/models/LICENSE in the installed madmom 0.17.dev0 package (read 2026-11-11)") | survey.md section 12 (same quote).
- Essentia AGPL-3.0 | quote substring `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications` | models: quote substrings `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use` and `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0` (tools.json unverified: "sources disagree") | MDB-stem-synth quote substring | RWC license null. Since 2026-11-12 the cell says whose list it is, "per Essentia's models page and `crepe-full-1.json`": tools.json Essentia training data name ("RWC-synth and MDB-stem-synth (CREPE models, per the models page and crepe-full-1.json)") | trials.md Essentia (`crepe-full-1.json`: training data "RWC-synth, MDB-stem-synth"). torchcrepe's row lists CREPE's own data, six sets. RWC-synth "license not read" (was "no license found"): tools.json RWC `unverified` ("license not read (UNVERIFIED in the survey)").
- FCPE MIT | bundled model note ("bundled fcpe_c_v001.pt: no separate license was found, so it sits under the repository's MIT LICENSE"; since 2026-11-12 the cell gives this as my agents' reading, not as a fact) | M4Singer quote substring `We agree to the dataset license: CC BY-NC-SA 4.0` | VCTK CC BY 4.0.
- librosa ISC. Onsets and Frames Apache-2.0, checkpoint no license statement, MAESTRO.
- PESTO LGPL-3.0 | checkpoints | MIR-1K by names only (tools.json unverified). MIR-1K's license wording as in Basic Pitch's line above.
- RMVPE Apache-2.0 | rmvpe-onnx MIT | `license: mit` card tag | training run UNVERIFIED (trials.md Verification log round 1 "Still UNVERIFIED") | paper data MDB-stem-synth, MIR-1K, Cmedia, MIR ST500. Cmedia and MIR-ST500 "licenses not read" (was "no licenses found"): tools.json RMVPE `unverified` ("Cmedia and MIR-ST500 licenses not read") and both datasets' `unverified` ("license not read (UNVERIFIED in the survey)").
- SoX licenses and quote: trials.md A2 / tools.json SoX.
- SoX, added 2026-11-12: the `COPYING` sentence that goes on, `Note that some of the external packages ... it must be distributed under the GPL.`: tools.json SoX `license.code.also`, new at e95cdb8 | survey.md section 38 (same text, `relevant--with-*` with no space, as in the source).
- SwiftF0 MIT | model.onnx | pitch-benchmark card tag `cc-by-nc-sa-4.0`.
- torchcrepe MIT | CREPE weights converted | CREPE training data list (MIR-1K, Bach10, RWC-synth, MedleyDB, MDB-stem-synth, NSynth CC BY 4.0). Bach10 and RWC-synth "licenses not read" (was "no licenses found"): tools.json `unverified` of both ("license not read (UNVERIFIED in the survey)").
- Transkun MIT | `2.0.pt` | Maestro v3.0.0.
- The MAESTRO quote in cells is an exact substring of `The dataset is made available by Google LLC under a Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0) license.` | the MDB-stem-synth one of `MDB-stem-synth is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).`

Places where the sources disagree or look stale
- Resolved since the first draft (checked 2026-11-12): `tools.json` entries `mt3-infer` and `yourmt3 (PyPI, third party)` now give the gap round 2 reason (installed, run refused) and `for_aaron: true`, as `trials.md` does.
- Resolved since the first draft: the CREPE Notes evals are e1781, e1783 and e1785 to e1791 (e1782 and e1784 belong to the web-tab-render lane), gtr-eval 0.12.0 in `evals.jsonl`, and `trials.md` line 18 and A3 now say 0.12.0 too.
- `tools.json` keeps YourMT3+ at `tried: true` (`tried_how: public-space`) although its one call returned the quota error and no transcription. The fragment lists it under "didn't run", as PENN was moved in gap round 2 item A1, and leaves it out of the 15.
- `tools.json` gives exit code null for aubio r0130 and wall null for torchcrepe r0287. The ledger has exit 0 and wall 141.74 s (still so on 2026-11-12).
- Aria-AMT's `tools.json` reason still says "two piano models ran", written before Onsets and Frames, a third model trained on piano, ran in gap round 1. Since 2026-11-12 the fragment gives it as the first round's reason and says Onsets and Frames ran later (it said "since two piano models already ran", which clashed with "Three of them were trained on piano").
- A checker wrote that the record has no S2n bass count for RMVPE. It has one, e1484 (RPA 0.196195, n_ref_voiced_frames 2,523), cited in trials.md Gap round 1 RMVPE and in tools.json, so RMVPE is in the bass list. Only PitchYinProbabilistic has none.
- `trials.md` "Summary: what ran here" has 13 rows, while `tools.json` has 15 entries that ran on the box (SoX, and RMVPE and rmvpe-onnx as two). The fragment counts from `tools.json`, as asked.
- Whole-post repair (2026-11-12). T73 ("Piano and singing-voice transcribers the lane listed but did not try ... written for this file") covers Aria-AMT, Onsets and Velocities, SOME, GAME, ROSVOT and VocalParse; T115 ("Ableton Live, \"Convert Drums to New MIDI Track\", on the taps (fingerstyle-voices-taps survey; also the audio-to-notes lane's \"Convert to MIDI\" entry; written for this file; paid)") covers both Ableton entries: FOR_AARON.md headings. "No steps" there meant none in this lane's own `for-aaron.md`.
- Whole-post repair: Ableton is in the `tools.json` of audio-to-notes, fingerstyle-voices-taps and guitar-tab only, not apps-survey or hosted-apis (grep of all ten). The fingerstyle fragment lists "Ableton Live, Convert Drums to New MIDI Track".
- Whole-post repair: alphaTab 1.9.0 ran in web-tab-render, browser-audio-sync and chains. music21 10.5.2 on Basic Pitch's MIDI: `runs.jsonl` r0237 label "music21 10.5.2 key analysis (5 methods) on truth MIDI and on audio-to-notes lane Basic Pitch ONNX MIDI (r0234)"; the tab writers: r0240 label "tuttut, tutts, tayuya, LilyPond, tabsynth on Basic Pitch MIDI from the audio-to-notes lane". madmom ran on its own in chords-beats-key (0.16.1, r0063) and fingerstyle-voices-taps (0.17.dev0, r0247).
- Whole-post repair: YourMT3 in the hosted-apis fragment: GPU Space r0112 on S2n (79 of 90, e0110), CPU Space r0164 (S2n), r0245 (R1c), r0231 (the ElevenLabs guitar stem of S4).
- Whole-post repair (2026-11-12): rundown "the rented cloud computer" became "the cloud box", the name the main read's opening now gives it; no source says the box was rented (`ENVIRONMENT.md`: "one Claude Code cloud session container").
