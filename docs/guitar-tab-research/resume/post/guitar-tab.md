<!-- RUNDOWN -->
- **My agents listed 95 tools, models, papers, apps and datasets for choosing the string and fret, and 13 ran on the cloud box.** Given a synthesized clip's 90 notes, the six tools that turn notes into tab put 14 to 90 on the known string and fret.

<!-- SECTION -->
## Choosing the string and fret

Since the same note can be played in more than one place, this step picks a string and fret (a metal strip on the neck) for each note. My agents listed 95 tools, models, papers, apps and datasets and ran 13 on the cloud box. Given a synthesized clip's 90 notes, the six note-to-tab tools put 14 to 90 on the known string and fret.

<ao-compare cols="1" aspect="9/1">
<figure><img src="/media/guitar-tab-tools/guitar-tab-lilypond-s2n.webp" alt="One line of guitar tab: six horizontal lines with a TAB sign at the left and fret numbers from 0 to 3 along them, with only 3s on the bottom line."><figcaption><b>S2n in standard tuning</b><span class="ao-meta">LilyPond 2.24.3 on S2n's exact notes with its default settings, which use standard tuning, the usual E A D G B E (r0145). All 90 notes on the known string and fret. The tab is spaced by note order, not rhythm, and the whole clip is on this one line.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/guitar-tab-lilypond-s5dropd.webp" alt="The same kind of line of tab, with fret numbers from 0 to 3 on the upper five lines and 5s and 0s on the bottom line."><figcaption><b>S5dropd, told it's Drop D</b><span class="ao-meta">The same piece in Drop D (the lowest string tuned down to D), with LilyPond given that tuning (r0145). All 90 notes on the known string and fret. The bass G (G2, the 2 is the octave) sits at fret 5 of the lowest string, and the low D is that string played open, with no finger on it.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/guitar-tab-lilypond-r3a.webp" alt="A line of tab with fret numbers from 0 to 10 on all six lines, some of them stacked in columns."><figcaption><b>R3a, a real concert video</b><span class="ao-meta">LilyPond on the 105 notes that Basic Pitch, a tool that writes down the notes it hears, wrote from R3a's audio (r0301). It placed all 105. There's no known answer to count them against.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Thirteen ran on the cloud box, at no cost beyond the session itself. Six of them turn a list of notes into tab (LilyPond, scorify, tabsynth, tayuya, tutts and tuttut). Four are trained models, or sets of them, that start from audio. The Riley et al. guitar models give notes only, and the SynthTab TabCNN checkpoints (saved, trained model files) give a string and fret per note. So do a TabCNN file on Zenodo, a site for research data, and two TabCNN files from an account called cstr on Hugging Face, a site for AI models. amt-tools and piano-transcription-inference were the code that loaded three of those, and PyGuitarPro wrote files for the Guitar Pro tab program from the results. cstr's two are ONNX files, a format for trained models, and ONNX Runtime 1.31.1 ran them. One agent, the trial agent, ran the trials. A second one, the checking agent, re-ran all 199 runs of the counting tool that the trial agent cited (r0456). It got the same results as the ledger, the log where each one was recorded. It also repeated some of the runs and filled a few gaps. Later a critic agent listed gaps in the research, and another agent, the gap agent, worked through this step's. It ran the Zenodo file, cstr's files and scorify, and ran the PyGuitarPro conversions again through the timing wrapper. Another agent, the second checker, checked that round. It re-ran all 57 of its counts with the same results, and repeated some of its runs with the same output.

The clips. S1 is a single-note melody. S2n is a 29-second fingerstyle clip my agents synthesized, so every note is known. S2s has the S2n notes on a steel-string sound, and S3 is strummed chords. S5capo2 is the S2n piece with a capo (a clamp across the strings that raises every note) on fret 2. S5dropd is the same piece in Drop D, with the lowest string tuned down to D, and 4 of its bass notes go down to that low D. All of those are synthesized. R1a and R1c are chord accompaniments and R1b is a single-note solo, real recordings from GuitarSet of 28 to 29 seconds. GuitarSet is a research set of recordings with each note's string and fret logged. R3a, R3b and R3c are 18-second excerpts of real guitar videos, with no known answer.

How the counting works. A note counts as found when it starts within 50 ms of a known note and has the same pitch, each known note counted once. Then its string and fret are compared with the known ones. For the synthesized clips the known string and fret are the tab each piece was written with, and for R1a, R1b and R1c they're the ones GuitarSet logged. "Exact notes" means the clip's own MIDI (a list of notes with start times), with its tracks merged into one because some tools read only one track. "Basic Pitch's notes" means the MIDI that Basic Pitch 0.4.0, a tool that writes down the notes it hears, made from the clip's audio in the audio-to-notes part of this research. That was run r0234 there, and r0264 for R3b and R3c. For S2n it wrote 137 notes and found all 90 real ones, and for R1c it wrote 156 and found 120 of 148 (e0559, e0577). "Shared" means a light job run without one of the box's two 2-core slots, so it wasn't pinned to its own cores and other jobs ran beside it. Peak memory is the run ledger's figure.

**amt-tools 0.3.2** ([link](https://github.com/cwitkowitz/amt-tools)). Frank Cwitkowitz's Python library for music transcription models, with a TabCNN re-implementation in it. Here it loaded and ran the SynthTab checkpoints and the TabCNN file from Zenodo, and its decoding turned the frets from cstr's files into notes.

- In: the audio of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, each clip's mono WAV, a one-channel audio file, resampled to 22050 Hz by its `load_normalize_audio`.
- Command or settings: `CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)`, then `run_offline` with `ComboEstimator([TablatureWrapper, StackedNoteTranscriber])`, settings copied from SynthTab's `demo_embedding/evaluate.py`. My agents' loader, `scripts/run_synthtab_tabcnn.py`, opened each checkpoint with `torch.load(weights_only=True)` and a list of the classes it names. Two earlier tries stopped, one with `ModuleNotFoundError: No module named 'resampy'` and one with `Unsupported global: GLOBAL numpy.core.multiarray.scalar`, until resampy was installed and the loader mapped numpy's old module name.
- Out: the checkpoint's frets frame by frame, turned into a list of notes per string (MIDI pitch, start and end in seconds). The counts are under the SynthTab entry, and for the gap agent's TabCNN files under the TabCNN + GuitarProFX and cstr/tabcnn-onnx entries.
- Time: the two SynthTab runs, r0139 and r0274, and the Zenodo file's run, r0592.
- Takes as a hint: `GuitarProfile(tuning=None, num_frets=None)`, but these checkpoints were trained for one profile, standard tuning with 19 frets.
- Hands off to: its `write_stacked_notes_jams` writes the per-string notes as JAMS (a JSON format for music annotations). Not run here. It has no writer for Guitar Pro or for MusicXML, a file format for sheet music.

**cstr/tabcnn-onnx** ([link](https://huggingface.co/cstr/tabcnn-onnx)), revision `886ead7` of the model repository, created 2026-07-20 and last changed 2026-08-02. Two ONNX files of TabCNN, the model described under the SynthTab entry, from the Hugging Face account cstr. The model card, the model's description page, says `Vanilla: trained here on **GuitarSet** (CC BY 4.0).` for `tabcnn.onnx`, and `GuitarProFX: weights from **Zenodo 11406378**` for `tabcnn-gpfx.onnx`. That Zenodo file has its own entry, TabCNN + GuitarProFX weights. The export scripts are in the GitHub repository CrispStrobe/onnx_runtime_dart. GGUF copies, another model file format, sit in a second repository, cstr/tabcnn-GGUF, and weren't run.

- In: the mono WAV of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, resampled to 22050 Hz.
- Command or settings: ONNX Runtime 1.31.1 on the CPU, with `intra_op_num_threads` set to the slot's 2 cores and `inter_op_num_threads` to 1, in my agents' script `scripts/gap2_run_tabcnn.py`. Each file got the audio preparation its card gives. Both start from a CQT, a map of how loud each pitch band is over time, with the same settings. For `tabcnn-gpfx.onnx` that's `|librosa.cqt(y, sr=22050, hop_length=512, n_bins=192, bins_per_octave=24)|`, then `amplitude_to_db(ref=np.max)` and a rescale to 0 to 1. For `tabcnn.onnx` it's the plain CQT, with no decibels or rescale, after `librosa.util.normalize(y)`. The script fed the model windows of 9 frames, took the top class on each string and passed the frets through the same amt-tools decoding as the SynthTab runs.
- Out: for each 23.2 ms frame and each string, 21 numbers, one per class. Class 0 is a silent string, and classes 1 to 20 are the open string up to fret 19. The card gives the shape as `float32[N, 6, 21]`. The frets were decoded into notes per string, as for the SynthTab files. The counts for `tabcnn.onnx` are in the table after this list.
  - `tabcnn-gpfx.onnx` gave the same fret or silence as the Zenodo file on every string of every frame, 58,980 of 58,980 string-and-frame pairs over the 9,830 frames of the 8 clips. That held with the card's audio preparation (r0591) and with amt-tools' (r0595). The decoded notes matched too, so its counts are the Zenodo file's, under that entry.
  - `tabcnn.onnx` with the training repository's order of steps, which first scales the 44.1 kHz audio so its loudest point is at full volume and then resamples it (r0601), differed from the card's order in 58 of the 9,830 frames. That run wasn't counted.
  - Neither file has a capo or tuning input. On S5capo2, 40 of the 58 notes `tabcnn.onnx` found sit on the known string at the same fret counted from the top of the neck, and none at the fret counted from the capo. On S5dropd the 4 D2 notes can't come out, because the lowest note these files know is E2.
  - The export repository's README gives `EPOCHS=4 VAL_GUITARIST=5 python train.py features/ tabcnn.onnx` as the command that trains `tabcnn.onnx`, and `train.py` trains on every GuitarSet player but player 5. That takes in the players of all three R1 clips. Whether the file on Hugging Face is the one that command made isn't verified.
- Time: on 2 cores. `tabcnn.onnx` took 62.01 s wall for the 8 clips, 1001.7 MB peak (r0594). Wall time is time on the clock, start to finish. Each clip, 24.0 to 29.4 s long, took 5.84 to 11.65 s with Python start-up, and 0.75 to 1.90 s of that was the audio preparation, the model and the decoding. The run started while other lanes' jobs ran, and its first two clips took longest, S2n 10.92 s and S2s 11.65 s. `tabcnn-gpfx.onnx` took 47.11 s wall, 1009.8 MB peak, 5.68 to 6.17 s per clip and 0.66 to 0.84 s inside (r0591). In both, ONNX Runtime split the work into 6 threads, all held to the slot's two cores. The second checker's re-run of S2n and R1c gave byte-identical frames and notes (r0674).
- Takes as a hint: none. Standard tuning and 19 frets are fixed by training. The GGUF card says `Turning them into a playable fingering needs a constrained decoder (one note per string, fret range, capo, hand span).` My agents built no such step. Their script took the top class on each string, frame by frame.
- Hands off to: nothing downstream. The files take `float32[N, 192, 9, 1]` and give `float32[N, 6, 21]`, so the audio preparation, the windows, the choice of class and the decoding are the caller's own code, here my agents' script.

Each cell is notes out, real notes found, and found notes on the known string and fret (e1739, e1742, e1745, e1748, e1751, e1754, e1757, e1760):

| Clip | `tabcnn.onnx` |
|---|---|
| S2n, 90 notes | 223, 72, 62 |
| S2s, 90 notes | 189, 43, 43 |
| S3, 182 notes | 106, 40, 40 |
| S5capo2, 90 notes | 182, 58, 0 |
| S5dropd, 90 notes | 224, 67, 54 |
| R1a, 189 notes | 120, 56, 55 |
| R1b, 70 notes | 90, 64, 62 |
| R1c, 148 notes | 151, 107, 103 |

**LilyPond 2.24.3** ([link](https://lilypond.org/index.html)). A music engraving program, the kind that typesets sheet music. Its tab staff picks a string and fret for each note by a fixed rule, not a trained model. Its manual says `By default pitches are assigned to the lowest playing position on the fretboard (first position). Open strings are automatically preferred.`

- In: the exact notes of S1, S2n, S3, S5capo2, S5dropd, R1a, R1b and R1c. Also Basic Pitch's notes for the same clips and for R3a, R3b and R3c, and the Riley et al. models' notes. LilyPond reads its own `.ly` text, not MIDI. So my agents' script `scripts/run_lilypond_tab.py` wrote the notes on a `TabStaff` in order, with no rhythm. Notes starting within 30 ms of a group's first note became one chord.
- Command or settings: `lilypond --loglevel=WARNING -dno-print-pages`, and `--png -dresolution=70` for the pictures above. A `tablatureFormat` hook logged each note's string and fret to a TSV file, a plain-text table. Settings tried: `stringTunings`, `minimumFret`, `restrainOpenStrings` and a string number on one note (`g\4`).
- Out: a PDF, PNG or SVG of the tab, with no text or JSON export. On the exact notes, on the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1a 104 of 189, R1b 32 of 70, R1c 129 of 148 (e0175 to e0177, e0182 to e0184).
  - On R1a it left one note out with a `No string for pitch` warning, an A#2 at 10.668 s, which my agents traced to the default `maximumFretStretch` of 4.
  - S5capo2: 0 of 90 with no capo given, 90 of 90 with `stringTunings` raised 2 semitones, which is 2 frets (e0178, e0179).
  - S5dropd: in standard tuning it left out the 4 D2 notes with `No string for pitch #<Pitch d, > (given frets (2))` and put 72 of 90 on the known string and fret. With `\stringTuning <d, a, d g b e'>`, 90 of 90 (e0180, e0181).
  - `minimumFret`, the lowest fret it may use: at 5 on S1, 22 of 62. At 3 on S2n, 66 of 90. At 5 on R1b, 29 of 70. At 3 on R1c, 83 of 148, with 2 notes left out (e0185, e0190, e0188, e0187). `restrainOpenStrings` alone changed nothing on S2n, and with `minimumFret` at 1 the 40 open-string notes moved one string down, 50 of 90 (e0186, e0189).
  - The string number `g\4` on S2n's first G3 put it on string 4 fret 5, and the other 89 notes stayed as they were (r0155).
  - On Basic Pitch's notes: S2n 88 of 90, R1c 94 of 148 (e0663, e0729). With no fret limit given it wrote frets up to 30, and it left out notes it couldn't place, like the C1 Basic Pitch wrote in S2n. With the tuning raised 2 semitones for the capo, 86 of 90 on S5capo2, and with the Drop D tuning given, 90 of 90 on S5dropd (e0739, e0740). On R3a it placed all 105 notes in 67 chord groups with no warnings (r0301).
  - The start of its S2n log (position in whole notes, string, fret):

  ```text
  0 6 3
  0 3 0
  1/16 4 0
  1/16 3 0
  1/8 6 3
  ```

- Time: shared, 36.04 s wall for 14 runs and 78.7 MB peak (r0145). The `lilypond` program itself took 2.05 to 2.88 s per run.
- Takes as a hint: the tuning through `stringTunings` and the lowest fret to use through `minimumFret`. Also `restrainOpenStrings`, `maximumFretStretch`, left at its default of 4, and a string number per note. My agents found no capo setting for its automatic string choice.
- Hands off to: the logged strings and frets went through PyGuitarPro into a Guitar Pro 5 file, and S5dropd with Drop D read back 90 of 90 (e0433).

**piano-transcription-inference 0.0.6** ([link](https://pypi.org/project/piano-transcription-inference/)). Kong et al.'s Python package for their piano transcription model. The Riley et al. guitar checkpoints are fine-tuned copies of that model, meaning copies trained further on guitar, so here it ran them.

- In: the mono WAV of S2n and R1c, and in the checking agent's runs S3 and R1b too, loaded at 16 kHz and cut into 10 s pieces.
- Command or settings: the package's `transcribe()` from PyPI, the public store for Python packages, behind a few lines of my agents' own loader (`scripts/run_hfmt_guitar.py`, `torch.load(weights_only=True)`). The loader was there because the package's own setup downloads its piano model again when the checkpoint file is under 160 MB. Thresholds as fixed in 0.0.6: onset 0.3, offset 0.3, frame 0.1. Those are the model's cut-offs for a note's start, its end and each frame where it sounds.
- Out: a MIDI file of notes with their loudness (velocity). The counts are under Riley et al.
- Time: the Riley et al. runs, r0331, r0494, r0499 and r0505.
- Takes as a hint: only those thresholds, which xavriley's fork, a changed copy of the package's code, turns into settings.
- Hands off to: the MIDI went into tuttut and LilyPond, under Riley et al.

**PyGuitarPro 0.11** ([link](https://github.com/Perlence/PyGuitarPro)). A Python package whose README says `PyGuitarPro is a package to read, write and manipulate GP3, GP4 and GP5 files.` Those are files of the Guitar Pro tab program. My agents used its GP5 writer in about 50 lines of their own, `scripts/gtreval_to_gp5.py`, to turn string and fret lists into `.gp5` files, and its reader to read them back.

- In: tuttut's lists for S2n, for S5capo2 with the tuning raised for the capo and for S5dropd with Drop D, and LilyPond's for S5dropd with Drop D, all at 112 BPM (beats per minute). Also three whole chains from audio, Basic Pitch's notes into tuttut into this glue, for S2n, S5capo2 with the tuning raised for the capo, and R1c.
- Command or settings: one 6-string track, `Track.strings` from the tuning, the capo as `Track.offset`, each note's start snapped to a 16th-note grid at the given tempo, 4/4 bars. String, fret and order are kept, and the note lengths aren't the played ones.
- Out: `.gp5` files, 3,158 to 3,170 bytes each for the four made from the exact notes. Read back, tuttut's S2n had 90 of 90 on the known string and fret, S5capo2 90 of 90 with the capo read back as 2, S5dropd 88 of 90 with the tuning read back as `[38, 45, 50, 55, 59, 64]`, and LilyPond's S5dropd 90 of 90 (e0430 to e0433). The chains from audio: S2n 89 of 90, with 136 of tuttut's 137 notes written (one fell on a string already used in the same 16th slot, and the glue keeps the first). S5capo2 90 of 90. R1c, at the recording's tempo of 119 BPM, 90 of 148, with 151 of 153 notes written. There the fixed 16th grid moved some note starts more than 50 ms (e1088, e1090, e1092). R3a's tuttut list at an assumed 120 BPM kept 102 of 105 notes.
- Time: the first conversions weren't timed or run through the timing wrapper. The gap agent ran all eight again through it, shared, 0.77 s wall for all eight with eight Python start-ups and 21.1 MB peak (r0586). The new files hold the same notes, tuning, capo and tempo as the old ones, with no song title, and the seven with a known answer read back to the same counts.
- Takes as a hint: tuning, capo and tempo, which it writes into the file.
- Hands off to: `gtr-eval`, my agents' counting tool, read the files back with PyGuitarPro's reader. Opening them in a tab program wasn't tried in this part of the research.

**Riley et al. guitar note models** ([link](https://huggingface.co/xavriley/midi-transcription-models)), `guitar-fl.pth` and `guitar-gaps.pth` from a model repository last changed 2026-08-22. Two trained models from Queen Mary University of London that turn guitar audio into notes (pitch, start, end and loudness), with no string or fret. The string and fret come from a note-to-tab tool afterwards.

- In: mono WAV. `guitar-fl.pth` on S2n and R1c. `guitar-gaps.pth` on S2n, S3, R1b and R1c, run by the checking agent after two of the trial agent's runs waited about 30 and 37 minutes for a CPU slot and were cancelled, by the trial agent's account.
- Command or settings: through piano-transcription-inference 0.0.6 and my agents' loader (above), not the authors' own `midi_transcription` command, whose install was refused (next block).
- Out: a MIDI file per clip, 384 ticks per beat, which my agents' script also wrote out as a CSV of `onset,offset,pitch,velocity`.
  - `guitar-fl.pth`: S2n 90 notes out, 89 of the 90 real notes found, 1 extra. R1c 133 out, 125 of 148 found, 8 extra (e1224, e1274).
  - `guitar-gaps.pth`: S2n 90 out, all 90 found. S3 208 out, 172 of 182 found, 36 extra. R1b 69 out, 61 of 70 found, 8 extra. R1c 130 out, 121 of 148 found, 9 extra (e1428, e1436 to e1438).
  - Into tuttut and LilyPond with defaults, on the known string and fret. From `guitar-fl.pth`, S2n 89 of 90 with both, and R1c 104 of 148 with tuttut and 109 with LilyPond (e1225, e1275, e1344, e1345). From `guitar-gaps.pth`, S2n 90 of 90, S3 172 of 182 and R1b 25 of 70 with both, and R1c 106 of 148 with tuttut and 108 with LilyPond (e1430, e1432, e1440 to e1445).
  - Neither the model card nor the code says which training run each file is, so whether they heard GuitarSet, and with it the R1 takes, isn't verified.
  - The first rows of the R1c CSV:

  ```text
  onset,offset,pitch,velocity
  4.029094,4.580000,40,100
  4.585752,5.290000,40,99
  ```

- Time: on 2 cores. `guitar-fl.pth` took 400.85 s wall for both clips, 943.9 MB peak, 216.80 s of it transcribing S2n and 165.55 s R1c (r0331). The checking agent ran R1c again and the transcription took 22.87 s, with a byte-identical MIDI file (r0494). What else was running on r0331's cores wasn't recorded. `guitar-gaps.pth` took 15.03 s to transcribe S2n, 21.28 s wall, 919.1 MB peak (r0499), and 87.17 s wall for S3, R1b and R1c together, 948.0 MB peak (r0505).
- Takes as a hint: none for tuning, capo or range. Only the onset, offset and frame thresholds.
- Hands off to: MIDI, into tuttut and LilyPond (above). Before that, the tracks were merged into one. These files end each note with a note-on message at velocity 0, and those were rewritten as note-offs, the usual MIDI message for a note's end.

**scorify 0.4.0** ([link](https://github.com/kyr0/scorify)). Aron Homberg's JavaScript library, published 2026-10-31 on npm, the public store for JavaScript packages. Its README calls it `Instrument-aware music arrangement, transposition, and fingering constraints for vanilla JavaScript.` It places each note on a string and fret, with the finger that presses it, by searching over a model of the hand. Its README names three ways to search, `exhaustive reference, exact dynamic programming, or bounded beam search`.

- In: the exact notes of S1, S2n, S3, S5capo2, S5dropd, R1a, R1b and R1c. The package reads no files, and its README's list of first-release limitations says `audio/MIDI/MusicXML import ... remain future work.` So my agents' script `scripts/gap2_run_scorify.py` wrote each note as a scorify note, with its start and length as exact fractions of a quarter note and its name spelled with sharps (`parsePitch("C#4")`), plus the MIDI's tempo map and first time signature.
- Command or settings: scorify's `arrange` with `mode: "exact"`, in Node v22.23.4, which runs JavaScript outside a browser, from `scripts/gap2_run_scorify.mjs`, with `classicalGuitar()` (E2 A2 D3 G3 B3 E4, 19 frets), `classicalGuitar({capoFret: 2})` for the capo or `classicalGuitar({tuning: ["D2", "A2", "D3", "G3", "B3", "E4"]})` for Drop D. The default player, `compilePlayer({})`, is level "maestro". Its limits include the widest stretch in frets (`maxFretSpan` 9), the most notes plucked in a second (`maxAttacksPerSecond` 32) and the shortest note (`minDuration` 1/64 quarter). The default search keeps 64 partial answers at a time, tries 128 candidates per step and stops after 500,000 expansions, that is, after extending a partial answer 500,000 times. Variations: larger search limits (512, 512 and 5,000,000), `mode: "adaptive"` with held notes allowed to be cut short or notes moved by an octave, level "amateur", `minDuration` 1/256 quarter, `maxAttacksPerSecond` 64, `rightHand: "strum"` and a pinned note.
- Out: a status, and on success each note's string, its fret counted from the capo and a finger, 0 for an open string and 1 to 4 for the fingers, plus a cost and a difficulty summary. Times come in quarter notes, not seconds. It's the only note-to-tab tool here that gives a finger. The package declares no writer for ASCII tab, Guitar Pro or MusicXML. On the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1c 127 of 148 (e1808, e1810, e1812, e1814).
  - R1a and R1b gave no tab with the defaults. The status was `search-exhausted`, with `No valid path within the declared candidate and mechanics model`, and 0 notes were placed. Its README says `No partial prefix is emitted as a successful arrangement.` Larger search limits gave the same, and the `adaptive` mode stopped with `Expansion budget exceeded`.
  - R1a's 188th note, a D#3 at 29.152 s, is cut to 7 ms by the end of the excerpt, under the default `minDuration`. With `minDuration` at 1/256 quarter, all 189 notes were placed, 101 of 189 on the known string and fret (e1829).
  - R1b stops at its 56th note, a B4 that starts 18.3 ms after an F#4 that's still sounding. `maxAttacksPerSecond` at 64 and `rightHand: "strum"` gave the same status. scorify's `limitsExceeded` check names no limit for R1b at the default level, so which part of its model turns it down isn't known.
  - S5capo2 with no capo given: `search-exhausted`, with `Expansion budget exceeded`. With the larger search limits it placed all 90, none on the known string and fret counted from the capo and 54 on the known string at the same fret counted from the top of the neck (e1828). With `classicalGuitar({capoFret: 2})`, 89 of 90 (e1816).
  - S5dropd with no tuning given: `search-exhausted` with the defaults, with the larger limits and in the `adaptive` mode. With the Drop D tuning, 82 of 90 (e1818). The other 8 are four C3s at string 6 fret 10 instead of string 5 fret 3, and four C4s at string 4 fret 10 instead of string 2 fret 1.
  - R1c at level "amateur" came back `infeasible` after 44 ms. The `limitsExceeded` check lists `up to 11 string attacks in one second` where that level allows 7, and `up to 15 picked notes in one bar, some together` where it allows 4 unless each sounds alone.
  - A pinned note. scorify's notes have no string field. Its README offers a cost hook instead and says `It cannot override hard validity or the musical-fidelity priority.` My agents' hook added a cost of 1000 to any choice that put S2n's first G3, at 2.143 s, on a string other than 4. That G3 went to string 4 fret 5, finger 3. The other 89 notes kept their strings and frets, and 35 of the 90 got a different finger (e1830). So the pin is a cost, not a hard rule. LilyPond's string number made the same move (r0155).
- Time: on 2 cores. The first batch, the 8 clips plus the capo and Drop D runs, took 19.73 s wall, 175.7 MB peak, after 20.0 s waiting for a slot (r0621). `arrange` itself took 0.80 to 2.70 s per run. The second batch, 9 runs, took 48.26 s wall, 345.3 MB peak (r0623), and its larger search on S5capo2 ran 16,546 ms inside `arrange`. The second checker's re-run of seven of the runs gave the same status and the same string, fret and finger for every note (r0680).
- Takes as a hint: a tuning per string, a capo for the whole instrument or per string (`capoFret`), a fret count per string (not varied here), the player's level and single limits like `minDuration`, `maxAttacksPerSecond` and `rightHand`, and the search limits. A string for one note goes in only through the cost hook. Its `songs` part also declares a `suggestCapo` function, not tried.
- Hands off to: nothing downstream was tried. The package can also render WAV audio (`renderPerformance`, `encodeWav`), not tried. Its README says a separate agent skill in the repository, `skills/score-import/`, `converts MusicXML, MXL, ABC and MIDI into scorify Score JSON`, also not tried.

**SynthTab TabCNN checkpoints** ([link](https://github.com/yongyizang/SynthTab)), repository commit 6136f79 of 2024-12-05. TabCNN is a model that reads audio and gives, for every 23.2 ms frame of it, a fret for each of the six strings or a mark that the string is silent. The SynthTab researchers trained it on SynthTab, guitar audio they rendered from DadaGP tabs, and fine-tuned copies on real recordings. Two of their files ran, `finetuned/GuitarSet.pt` and `SynthTab-Pretrained.pt`. Going by its name and the paper, the second was trained on SynthTab alone.

- In: the mono WAV of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, resampled to 22050 Hz.
- Command or settings: loaded with amt-tools 0.3.2 (above) instead of SynthTab's own scripts, whose README says `The code is still being cleaned up. You would probably need to change directories paths and datasets in the code to make it work`. `finetuned/GuitarSet.pt` ran in r0139 and `SynthTab-Pretrained.pt` in r0274.
- Out: a fret or -1 (silent) per string for each frame, decoded into notes per string with pitch, start and end. The counts are in the table after this list.
  - Neither file has a capo input, so on S5capo2 the frets come out counted from the top of the neck by the tuning pegs, not from the capo. On S5dropd the 4 D2 notes can't come out, because the lowest note these files know is E2.
  - `finetuned/GuitarSet.pt` was fine-tuned on GuitarSet, and with the repository's own fine-tuning script every GuitarSet player would be in its training, so it may have heard the R1 takes. `SynthTab-Pretrained.pt` wasn't trained on GuitarSet, going by its name and the paper (not otherwise verified).
  - The first decoded notes of S2n from `finetuned/GuitarSet.pt` (start in seconds, MIDI pitch, string, fret). The known tab starts with G2 on string 6 fret 3 and G3 on the open third string at 2.1429 s.

  ```text
  (2.1595, 55, 4, 5), (2.1827, 43, 6, 3), (2.4613, 43, 6, 3), (2.5310, 43, 6, 3), (2.6935, 50, 5, 5)
  ```

- Time: on 2 cores. `finetuned/GuitarSet.pt` took 185.81 s wall for the 8 clips, 3798.2 MB peak (r0139). Each clip, 24 to 29.4 s long, took 18.36 to 32.91 s with Python start-up. The checking agent's re-run of R1c took 21.15 s wall, 3647.2 MB peak, and gave the same 141 notes (r0501). `SynthTab-Pretrained.pt` took 517.17 s wall, 3797.4 MB peak (r0274). Its wall time was 2.4 times its CPU time, which counts only the time the processors spent working on it. In r0139 it was 0.9 times. Whether other jobs shared its cores wasn't measured. Its CPU time for the batch was 211.74 s, against 205.69 s in r0139.
- Takes as a hint: none. The tuning `[40, 45, 50, 55, 59, 64]` and 19 frets are fixed in each checkpoint.
- Hands off to: nothing downstream. There's no Guitar Pro or MusicXML writer in this pipeline. My agents saved the frames as CSV and the notes as JSON to count them.

Each cell is notes out, real notes found, and found notes on the known string and fret (e0198 to e0205, and e0863, e0866, e0869, e0873, e0875, e0879, e0881, e0883):

| Clip | `finetuned/GuitarSet.pt` | `SynthTab-Pretrained.pt` |
|---|---|---|
| S2n, 90 notes | 260, 67, 41 | 163, 67, 60 |
| S2s, 90 notes | 395, 59, 46 | 334, 49, 49 |
| S3, 182 notes | 169, 48, 42 | 86, 32, 31 |
| S5capo2, 90 notes | 235, 64, 0 | 156, 70, 0 |
| S5dropd, 90 notes | 263, 67, 38 | 152, 66, 53 |
| R1a, 189 notes | 77, 69, 68 | 178, 68, 51 |
| R1b, 70 notes | 96, 64, 59 | 114, 50, 31 |
| R1c, 148 notes | 141, 129, 127 | 180, 82, 61 |

**TabCNN + GuitarProFX weights** ([link](https://zenodo.org/api/records/11406378)), the file `best_TabCNN_tablature_trancription_model` in Zenodo record 11406378, published 2024-06-01. TabCNN in amt-tools' version, trained by Pedroza, Abreu, Corey and Roman for a DAFx 2024 paper, on GuitarSet plus GuitarProFX by that paper's account. Their paper says GuitarProFX `comprises 360 randomly-chosen solo performance tracks from DadaGP`, which they rendered with guitar tones from EGFxSet and their own recordings. The file is a PyTorch archive (PyTorch is a Python library for trained models) holding a whole amt-tools `TabCNN` object under `model-2500`, with its weights saved on a graphics card (`cuda:0`).

- In: the mono WAV of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, read by amt-tools' `load_normalize_audio(path, 22050)`.
- Command or settings: `torch.load(weights_only=True)` with a list of the classes the file names. Those are amt-tools' own, so none had to be mapped as for SynthTab, and only numpy's old `numpy.core.multiarray.scalar` path was mapped to numpy 2's. Then amt-tools 0.3.2, `amt_tools.features.CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)`, `run_offline` and the same decoding as the SynthTab runs, in my agents' script `scripts/gap2_run_tabcnn.py`.
- Out: a fret or silence per string for each 23.2 ms frame, decoded into notes per string. The counts are in the table after this list.
  - On S5capo2 the frets come out counted from the top of the neck. Of the 77 notes it found, 39 sit on the known string at the same fret counted that way, and none at the fret counted from the capo.
  - On S5dropd the 4 D2 notes can't come out, because the lowest note the file knows is E2.
  - The training script trains six models, called folds, each tested on one GuitarSet player, and the record doesn't say which fold the file is. If it was trained as the paper describes, five of GuitarSet's six players were in its training data, so at least two of the three R1 players. The training script itself takes its training tracks only from its own GuitarProFX folder, and whether that folder held GuitarSet tracks isn't in the repository.
  - The first decoded notes of S2n (start in seconds, MIDI pitch, string, fret). The known tab starts with G2 on string 6 fret 3 and G3 on the open third string at 2.1429 s.

  ```text
  (2.1362, 55, 4, 5), (2.1827, 43, 6, 3), (2.6703, 50, 5, 5), (2.7632, 55, 3, 0), (2.9257, 55, 3, 0)
  ```

- Time: on 2 cores, 64.44 s wall for the 8 clips, 1364.9 MB peak (r0592). Each clip took 7.46 to 8.86 s with Python start-up, and 2.22 to 3.57 s of that was the audio preparation, the model and the decoding. The second checker's re-run of S2n and R1c gave byte-identical frames and notes (r0674).
- Takes as a hint: none. The tuning E2 A2 D3 G3 B3 E4 and 19 frets are fixed in the saved file.
- Hands off to: nothing downstream. cstr's `tabcnn-gpfx.onnx` is this file as ONNX, by its card, and it gave the same output (cstr/tabcnn-onnx entry).

Each cell is notes out, real notes found, and found notes on the known string and fret (e1715, e1718, e1721, e1724, e1727, e1730, e1733, e1736):

| Clip | Zenodo file, and `tabcnn-gpfx.onnx` |
|---|---|
| S2n, 90 notes | 220, 76, 49 |
| S2s, 90 notes | 262, 61, 56 |
| S3, 182 notes | 106, 33, 32 |
| S5capo2, 90 notes | 225, 77, 0 |
| S5dropd, 90 notes | 226, 74, 40 |
| R1a, 189 notes | 100, 56, 54 |
| R1b, 70 notes | 90, 65, 64 |
| R1c, 148 notes | 135, 119, 119 |

**tabsynth 1.0.6** ([link](https://pypi.org/project/tabsynth/)). A Python package whose PyPI summary reads `Convert musical events to playable guitar tablature via DP optimization`. It gives each possible position a cost for hand position, string changes, stretch and barres, where one finger holds down several strings. Then it picks the path through them with the lowest total cost by dynamic programming, a method that finds that total one step at a time. It matches chords against 63 built-in chord shapes. PyPI lists no author or project page for it.

- In: the exact notes of the 8 clips, turned into tabsynth's Python events in Hz and seconds (it has no file reader), in two modes: `notes`, each note on its own, and `groups`, notes starting within 30 ms as one chord, the way its own demo, `demo-mixed`, does. Also Basic Pitch's notes.
- Command or settings: `tabsynth.pipeline.events_to_tablature(events, output_format="ascii"|"json", max_fret=15, tolerance_cents=50)`, and once with `max_fret=5` on R1b.
- Out: a list of states in JSON (`start`, `duration`, `strings`, `frets`, `chord_id` and more) or ASCII tab, which is tab typed as plain text. In `notes` mode, on the known string and fret: S1 50 of 62, S2n 68 of 90, S3 147 of 182, R1a 109 of 189, R1b 55 of 70, R1c 115 of 148 (e0370, e0373, e0377, e0384, e0386, e0388).
  - In `groups` mode a chord becomes a whole chord shape from its list. The G2 and G3 that open S2n came out as a six-note `Em7_open`, so S2n gave 238 tab notes for 90 played, 54 of them on the known string and fret (e0375). R1c gave 238 out and 76 of 148 (e0390).
  - It drops notes it has no position for, without a message. In `notes` mode it dropped the 4 D2 notes of S5dropd and put 50 of 90 on the known string and fret. With `max_fret=5` it dropped 1 note of R1b and put 32 of 70 there (e0382, e0394).
  - S5capo2: 0 of 90 with no capo given (e0380). With the notes moved down 2 semitones and the frets read from capo 2, 68 of 90, the same positions as for S2n (e0392).
  - On Basic Pitch's notes in `notes` mode: S2n 71 of 90 from 132 notes out, R1c 81 of 148 (e0665, e0730).
  - The first state of S2n in `groups` mode:

  ```text
  {"index": 0, "start": 2.142856, "duration": 0.5256693625, "kind": "chord", "strings": [1, 2, 3, 4, 5, 6], "frets": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 2, "6": 0}, "mean_fret": 0.33, "min_fret": 0, "max_fret": 2, "requires_barre": false, "chord_id": "Em7_open"}
  ```

- Time: shared, 8.73 s wall for all 19 runs, 37.0 MB peak (r0186). Its own time per clip wasn't logged.
- Takes as a hint: `max_fret`, `tolerance_cents` and `templates`. `tolerance_cents` is how far off pitch a note may be, and it wasn't varied. `templates` is the list of chord shapes. No tuning or capo. Standard tuning is used whenever no fretboard is passed, and its pipeline passes none.
- Hands off to: nothing downstream was tried. A transcriber's notes come as MIDI numbers, so they need turning into Hz first.

**tayuya 0.0.4** ([link](https://github.com/vipul-sharma20/tayuya)). Vipul Sharma's Python library from 2019 that turns one MIDI track into tab. It detects the key, then puts each note at the spot in a fixed table nearest the previous note's fret. Its README says `Works only for guitar solos. Implementation for determination and rendering of chords is not done yet.` and `Works only for standard tuning (E A D G B E)`.

- In: the exact notes of the 8 clips, and Basic Pitch's notes.
- Command or settings: as its README shows, `MIDIParser(path, track=0)`, then `Tabs(notes=mid.notes_played(), key=mid.get_key()).generate_notes()` and `render_tabs()`. It returns no times, so my agents' script gave each returned note the start of the matching MIDI note.
- Out: a list of `(note name, string, fret)` and ASCII tab. On the known string and fret: S1 0 of 62, S2n 14 of 90, S3 33 of 182, R1a 79 of 189, R1b 29 of 70, R1c 26 of 148 (e0124, e0125, e0127, e0135, e0137, e0139).
  - Its position table has no fret 0, so it never writes an open string (a string played with no finger on it). The known tabs have open strings for 16 of S1's 62 notes, 40 of S2n's 90, 100 of S3's 182 and 49 of R1c's 148.
  - Notes below its table are looked up an octave higher but keep their name, so the position it gives sounds an octave above the note it names. It placed E2 where E3 sounds, 7 times in R1c and 6 times in S3, and D2 at string 6 fret 10, 4 times in S5dropd.
  - On Basic Pitch's notes it counted the velocity-0 `note_on` messages that mean note-off as notes, so twice as many came out (128 for the 64 notes Basic Pitch wrote for S1). It stopped with `UnboundLocalError: cannot access local variable 'note_info' where it is not associated with a value` on S2n, S5dropd and R1c, whose files hold notes above D6, the top of its table.
  - The first 10 entries for S2n:

  ```text
  ('G3', 5, 10), ('G2', 6, 3), ('G3', 5, 10), ('D3', 6, 10), ('D4', 4, 12), ('G2', 6, 3), ('D4', 4, 12), ('D3', 6, 10), ('E4', 3, 9), ('C3', 6, 8)
  ```

- Time: on 2 cores, 7.35 s wall for all 9 runs with Python start-ups, 72.6 MB peak, after 459.5 s waiting for a slot. Inside tayuya, 0.02 to 0.06 s per clip (r0117).
- Takes as a hint: none. A capo can only be given by moving the notes down, and on S5capo2 that gave the same 14 of 90 as S2n (e0131).
- Hands off to: nothing downstream. Its output has no times.

**tutts 0.1.0** ([link](https://github.com/madisonrickert/tutts)). Madison Rickert's TypeScript port of tuttut, on npm. Its npm description reads `Renderer-neutral MIDI to guitar-tab fingering engine (TypeScript port of tuttut).` Its README says `The core is pure (zero runtime dependencies), ESM-only`. My agents ran it in Node, and installing it with npm printed `added 1 package`.

- In: the exact notes of the 8 clips, turned into its note format `{midi, startBeats, durationBeats}` because it has no file reader, and Basic Pitch's notes.
- Command or settings: `generateTab({notes, tuning: new Tuning([names thin->thick], nfrets), tempo, timeSignatures, quantizeGrid?})` from `scripts/run_tutts.mjs`. Variations: `new Tuning(["E4","B3","G3","D3","A2","D2"], 20)` for Drop D, a tuning 2 semitones higher with 18 frets for capo 2, and `quantizeGrid: "1/16"` on R1c.
- Out: `tab.data` JSON, where each note has its string, fret, MIDI pitch and length in beats, and ASCII from `toAscii`. On the exact notes it matched tuttut 0.0.7 note for note on all 8 clips and on the capo and Drop D runs. On the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1a 100 of 189, R1b 31 of 70, R1c 120 of 148 (e0401 to e0403, e0406 to e0408).
  - S5capo2: 0 of 90 with no capo given, 90 of 90 with the raised tuning (e0404, e0409).
  - S5dropd: in standard tuning it wrote the 4 D2 notes an octave up, 72 of 90. With Drop D, 88 of 90 (e0405, e0410).
  - With `quantizeGrid: "1/16"` on R1c, 145 of 148 notes came out, because three grid points each got two B3s and it keeps each pitch once per chord. 114 were on the known string and fret (e0411).
  - On Basic Pitch's notes: S2n 89 of 90, R1c 93 of 148, with the tuning raised for capo 2, 90 of 90, and with the Drop D tuning, 86 of 90 (e0661, e0728, e0735, e0737). On S3, two chords it couldn't finger held 14 notes, and it wrote none of them.
- Time: shared, 7.59 s wall for 11 runs with Python and Node start-ups, 62.1 MB peak (r0205). The checking agent's re-run printed 151.6 ms for `generateTab` on R1c with the grid and 43.6 ms on S5dropd with Drop D (r0469).
- Takes as a hint: `tuning`, any set of strings with a fret count, `nfrets`. Also `quantizeGrid`, `tempo`, `timeSignatures` and `weights`. `tempo` only adds a `seconds` field. No capo, hand span, position or pinned note.
- Hands off to: its README calls `tab.data` `the renderer-neutral result`, meant for `a thin adapter` to a tab renderer, and the repository has a `packages/alphatab` folder. Not tried here.

**tuttut 0.0.7** ([link](https://github.com/natecdr/tuttut)). Nathan Candre's Python package that turns a MIDI file into tab. Its README describes the method as a hidden Markov model decoded with the Viterbi algorithm. That picks one fingering for each note or chord across the whole piece, using a difficulty measure. The README also says `It can handle any tuning for any number of strings, and will do the arrangement accordingly.`

- In: the exact notes of S1, S2n, S3, S5capo2, S5dropd, R1a, R1b and R1c. Also Basic Pitch's notes for the same clips and for R3a, R3b and R3c, and the Riley et al. models' notes.
- Command or settings: `tuttut-cli <song>.mid <output_dir>` always uses standard tuning, so my agents' script `scripts/run_tuttut.py` called the library, `Tuning(strings=[note names, thinnest first], nfrets=20)` and `Tab(...)`, then `to_ascii()` and `to_json()`. Variations: the tuning `E4 B3 G3 D3 A2 D2` for Drop D, `F#4 C#4 A3 E3 B2 F#2` with 18 frets for capo 2, `nfrets` 12 on R1c and 3 on S2n, and the module constant `MAX_FRET_SPAN` (the widest hand stretch, default 5) at 3, 6 and 7 on R1c.
- Out: ASCII tab, one line per string, and JSON with each note's string, fret and time in seconds, but no MIDI pitch or length. On the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1a 100 of 189, R1b 31 of 70, R1c 120 of 148 (e0042 to e0044, e0049, e0050, e0052).
  - S5capo2: 0 of 90 with no capo given, with 54 on the known string at the same fret counted from the top of the neck. With the raised tuning, 90 of 90 (e0045, e0046).
  - S5dropd: in standard tuning it moved the 4 D2 notes up an octave, 72 of 90. With Drop D, 88 of 90. The other two are G3s written at string 4 fret 5 instead of the open third string (e0047, e0048).
  - `nfrets` 12 and `MAX_FRET_SPAN` 3 and 6 gave the same notes as the default on R1c. At 7 it stopped with `AssertionError` at `assert 0 <= span <= 1`.
  - On Basic Pitch's notes: S2n 89 of 90, R1c 93 of 148, with the tuning raised for capo 2, 90 of 90, and with the Drop D tuning, 86 of 90 (e0658, e0727, e0732, e0733). It moved notes outside the guitar's range by octaves, so the C1 Basic Pitch wrote in S2n came out as C3, and it left out notes of chords it couldn't finger. On S3, of the 14 notes in two such chords it kept 3.
  - On the real videos, which have no known answer: all 105 notes of R3a, 31 of them on open strings, highest fret 10 (r0301). The same string and fret as LilyPond for all 129 notes of R3b and for 84 of R3c's 87 (r0479).
  - Its README says `Slides, Hammer-on, Pull-offs and other advanced techniques are not modeled.`
  - The start of its S2n tab:

  ```text
  E |||--------------------|0----0--------------|
  B |||----------3----3----|----------3---------|
  G |||0----0--------------|--------------------|
  D |||-----0---------0----|-----2---------0----|
  A |||--------------------|3-------------------|
  E |||3---------3---------|----------3---------|
  ```

- Time: on 2 cores, 3.74 s wall for 15 runs including 15 Python start-ups, 37.1 MB peak (r0048). S2n on its own took 0.37 s and 40.5 MB (r0027). Inside the script, 0.01 to 0.10 s per run.
- Takes as a hint: tuning and fret count (`Tuning(strings, nfrets)`, from Python only), the hand-span constant and difficulty weights. No capo setting, no preferred position and no way to pin a note to a string.
- Hands off to: its string and fret lists went through PyGuitarPro into `.gp5` files (above).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

The list has 95 entries: 78 tools, models, papers, apps and services, and 17 datasets. Besides the 13 above, here's each one and why it didn't run. Where my agents wrote steps for me to try it myself, the line gives the section number in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/guitar-tab). A number after arXiv is the paper's id on arXiv, a site for research papers. Several lines go back to one event. By the trial agent's account, Claude's permission system twice refused to install code straight from a GitHub repository. The first time was Riley et al.'s own command and the second was Guitab. The message was `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. After that no tool that installs only that way was tried, until an agent in a later round, the gap agent, tried gtrsnipe and got the same message, by its own account. No log of the refusals was kept, so they're not verified.

- **A Graph Engine for Guitar Chord-Tone Soloing Education** (arXiv 2510.19666): read as a title only. No steps.
- **Algomus bend-prediction and rhythm-guitar-detection repositories**: linked next to the chord-diagram code, not examined. No steps.
- **alphaTab**: not run in this part of the research. It's covered in the section on showing tab in the browser. No steps.
- **AnthemScore**: a commercial app, a pointer only, covered in the apps part of the research. No steps.
- **Asmar, Séoud and Bilodeau's RGB-D video work** (Polytechnique Montréal): RGB-D means color video plus depth. It's known only from search-result summaries, because `publications.polymtl.ca` reset the connection. Not verified. No steps.
- **audio2chart** (arXiv 2511.03337): read as a title only. It makes Guitar Hero charts, not tab. No steps.
- **Audio2Tab** (Jackson Loth): no trained model found. Its README's checkpoint section reads `We will host a checkpoint here soon!` No steps.
- **Basic Pitch 0.4.0**: this part's own run waited about 19 minutes for a CPU slot and was cancelled once the audio-to-notes part's MIDI files existed, so it made nothing. Those files were used instead (above). No steps.
- **`Beat This!`**: not run in this part of the research, where it's only the beat tracker inside Guitab, which didn't run. My chord and beat agents ran `Beat This!` 1.1.0 on its own (r0397). No steps.
- **Chieppa, Brutti and Paiva** (IEEE Access 2025): no code or data link in the paper. No steps.
- **CrispASR's `--tab` mode**: named on a model card, not examined. No steps.
- **DadaGP encoder and decoder** (`dadagp.py`): no run recorded. No steps.
- **Enumerating Left Hand Forms for Guitar Tablatures** (Gen Hori, TENOR 2023): read as a title only, code not checked. No steps.
- **Exploring Procedural Data Generation for Automatic Acoustic Guitar Fingerpicking Transcription** (Murgul and Heizmann): its linked repository was empty. No steps.
- **Expressive Guitar Synthesis via Controllable Latent Flow Matching** (arXiv 2610.36786): read as a title only. No steps.
- **Fretiq** (arXiv 2607.18303): no code found. No steps.
- **FretNet**: no trained model found. Its example loads `model-2000.pt` from a `Downloads` folder, a file neither the README nor the repository links to. Whether one is published elsewhere wasn't verified. No steps.
- **FretPath** (a plugin for MuseScore Studio 4.4 or later): it runs inside MuseScore Studio, and the box has MuseScore 3.2.3. Steps for me: section 5, including a step that marks one note with a string number. Its README says it `respects existing finger-number and string-number annotations as hard constraints`.
- **Fretting-Transformer** (ICMC 2025): no code or model found in the paper or by web search. No steps.
- **From MIDI to Rich Tablatures** (Bontempi et al.): no code found. The authors ran it in IBM's CPLEX optimizer. No steps.
- **gtrsnipe 0.8.3**: not on PyPI, and its README installs it from a GitHub clone with `pip install -e .`. The gap agent tried to install it straight from its repository, and the permission system refused with the message above, by that agent's account. Steps for me: section 4, including a step where I move one note to another string by hand and run the tab through gtrsnipe again with the default settings, `--no-refinger` and `--refinger`.
- **GuiFiR** (IEEE Access 2026): its repository holds dataset preparation only, no model code or weights. No steps.
- **Guitab 1.2.0** (its README says it turns a recording of a solo guitar into a `.gp5` tab, with a `--capo N` option): installing it from its GitHub clone was refused, and the `guitab` on PyPI is a different project. Its browser page was fetched but not run. Steps for me: section 1, in the browser or installed.
- **Guitar Chord Diagram Suggestion** (d'Hooge et al., SMC 2024): added when the survey was checked, no run recorded. No steps.
- **Guitar Pro 8**: a commercial desktop app, not run. No steps.
- **Guitar-Transcription-CNN-MTL**: its weights are published under MIT, as six copies of the model, each tested on one GuitarSet player. The model code lives in its GitHub repository, which would have had to be installed. Its README runs the copies one at a time over prepared GuitarSet features, not on one file. Section 3 says so, with no run steps.
- **guitar-transcription-with-inhibition**: no trained model found. Its README trains one. No steps.
- **GuitarFlow** (arXiv 2510.21872): read as a title only. It goes from tab to audio. No steps.
- **GuitarTab** (Hsu et al.): no trained model found. Its README loads `outputs/<exp_dir>/best_model.pt` from your own training run. No steps.
- **hf_midi_transcription**, Riley et al.'s own command: not on PyPI, although its README says `pip install hf-midi-transcription`, and installing the clone was refused. Their models ran another way (above). Steps for me: section 2.
- **@hidechae/eztab-mcp** (npm): found in a search, not examined. No steps.
- **IBM ILOG CPLEX Optimization Studio**: named only as the solver Bontempi et al. used. No steps.
- **Joint Transcription of Acoustic Guitar Strumming Directions and Chords** (ISMIR 2025): no code link in the paper. No steps.
- **keyjockey** (npm): found in a search, not examined. No steps.
- **kk9293/guitar-tab-omr, guitar-tab-transformer and vldsavelyev/guitar_tab_gpt2** (Hugging Face models): found in a search, not examined. No steps.
- **Klangio API**: a hosted service, a pointer only, covered in the hosted services part. No steps.
- **Klangio Guitar2Tabs**: a commercial app, a pointer only. No steps.
- **MIDI-to-Tab** (ISMIR 2024): no code found. No steps.
- **midi2tab_Deconvolutions**: no trained model in its repository. No steps.
- **MuseScore**: version 3.2.3 is on the box, but no command-line conversion that picks strings was tried here. It ran from the command line on Guitar Pro and MusicXML files in the section on showing a tab in the browser (r0120). Steps for me: section 5, in MuseScore 4 with the FretPath plugin.
- **Music.AI**: a hosted service, a pointer only. No steps.
- **music21 10.5.2's tablature module**: it maps strings and frets to pitches, not the other way round, and `getFretNotesFromFigure()` is a stub, an empty placeholder that returns nothing, so there was nothing to run. No steps.
- **Noise2Fret**: its weights are published under CC BY 4.0 on Zenodo, a site that stores research data. Its README's only way to run them is through its training scripts over prepared dataset folders. That means running the repository's own code, which wasn't tried after the refusals. Section 3 has no run steps, only a question for the authors.
- **Note-level Automatic Guitar Transcription Using Attention Mechanism** (EUSIPCO 2022): a search result, not examined. No steps.
- **Note2Tabs**: a commercial app, a pointer only. No steps.
- **nylon-amt**: no trained model in its repository. No steps.
- **openai/whisper-small**: Audio2Tab's base model, not run. No steps.
- **Paleari, Huet, Schutz and Slock** (2008): no code in the paper. No steps.
- **PolyMap** (arXiv 2608.27522): read as a title only. No steps.
- **polytab**: a search result, not examined. No steps.
- **Rhythm Guitar Tablature Continuation through Picking Pattern Generation**: its data record is restricted, not run. No steps.
- **Songscription**: a commercial app, a pointer only. No steps.
- **Songsterr**: a commercial app, a pointer only. No steps.
- **string-fingerings** (npm): found in a search, not examined. No steps.
- **STRUM** (arXiv 2605.12135): read as a title only. It makes rhythm-game charts. No steps.
- **Synchronize Dual Hands for Physics-Based Dexterous Guitar Playing** (SIGGRAPH Asia 2024): it goes the other way, from tab to simulated hand motion. No steps.
- **TabCNN, the original code** (ISMIR 2019): no trained model in its repository, which trains one on GuitarSet, and it wasn't trained here on the CPU box. Copies of TabCNN trained by other people did run (above). No steps.
- **Taming the Shotgun** (a bachelor thesis in Swedish, Lund University, 2026): no code or data link in its PDF or on its record page. Its method runs Basic Pitch with its shortest note lowered to 40 ms, filters the notes by rules, then picks a string and fret for each. No steps.
- **TapToTab**: no code link found. No steps.
- **TART**: no code or model link in either paper. No steps.
- **Tone-informed Transformer and EGDB-PG** (Chen et al.): no code link on the project page. No steps.
- **TPMNet**: a search result, not examined. No steps.
- **Transcribing Rhythmic Patterns of the Guitar Track in Polyphonic Music**: read as a title only. No steps.
- **TuxGuitar 1.5.6**, its own string choice: on the box, but the program wasn't opened and no conversion that picks strings was tried here. Its file plugins ran in the section on showing a tab in the browser (r0221). Steps for me: section 5.
- **Velocity Prediction in Automatic Guitar Transcription** (EUSIPCO 2026): no code link in the paper. No steps.
- **Visual Guitar Tab Comparison**: an interface for comparing tabs, not a transcriber. No steps.
- **The 17 datasets** (AnimeTAB, Chordonomicon, DadaGP, EGDB, EGFxSet, EGSet12, François Leduc, GAPS, GOAT, Guitar-TECHS, guitar_style_dataset, GuitarDuets, GuitarSet, IDMT-SMT-Guitar, mySongBook, SCORE-SET, SynthTab): data, not tools, so there's nothing to run. GuitarSet supplied R1a, R1b and R1c. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| amt-tools 0.3.2 | MIT | none | none |
| cstr/tabcnn-onnx | MIT by the export scripts' repository, whose LICENSE begins `MIT License / Copyright (c) 2024-2026 CrispStrobe` ([repository](https://github.com/CrispStrobe/onnx_runtime_dart)) | `license: cc-by-4.0` on the model card ([card](https://huggingface.co/cstr/tabcnn-onnx/raw/main/README.md)) and on the GGUF card. The export README says `Derived weights redistributable **with attribution**.` | `tabcnn.onnx`: GuitarSet. The card says `Vanilla: trained here on **GuitarSet** (CC BY 4.0). Attribution to GuitarSet required.`, and the export README names the 1.1.0 record, `cc-by-4.0`. `tabcnn-gpfx.onnx`: the Zenodo file's data, in the TabCNN + GuitarProFX row |
| LilyPond 2.24.3 | GPL-3.0-or-later. Its COPYING begins `GNU GENERAL PUBLIC LICENSE / Version 3, 29 June 2007` ([COPYING](https://gitlab.com/lilypond/lilypond/-/raw/master/COPYING)) | none | none |
| piano-transcription-inference 0.0.6 | MIT, by the PyPI classifier `License :: OSI Approved :: MIT License` ([PyPI](https://pypi.org/pypi/piano-transcription-inference/json)). xavriley's fork has no LICENSE file | none of its own here | none |
| PyGuitarPro 0.11 | LGPL-3.0-only. Its LICENSE says `This version of the GNU Lesser General Public License incorporates the terms and conditions of version 3 of the GNU General Public License, supplemented by the additional permissions listed below.` ([repository](https://github.com/Perlence/PyGuitarPro)) | none | none |
| Riley et al. guitar models | MIT by the code's README, `This project is licensed under the MIT License - see the LICENSE file for details.`, though no LICENSE file is in the repository ([repository](https://github.com/xavriley/hf_midi_transcription)) | MIT, model card `license: mit` ([card](https://huggingface.co/xavriley/midi-transcription-models/raw/main/README.md)) | `guitar-gaps.pth`: GAPS, `cc-by-nc-sa-4.0` on Zenodo, and its project page says `GAPS may be used only for non-commercial research purposes.` ([GAPS](https://aim-qmul.github.io/GAPS/)). `guitar-fl.pth`: the François Leduc dataset, whose Zenodo record says `For copyright reasons this dataset is made available by request only, for use in research projects.` ([Zenodo](https://zenodo.org/api/records/10984521)). The newer Hugging Face copies of both datasets say `license: mit` |
| scorify 0.4.0 | MIT. Its LICENSE begins `MIT License / Copyright (c) 2026 Aron Homberg`, and its `THIRD-PARTY-LICENSES.txt` lists 9 bundled `@tonaljs/*` modules, each `License: MIT` ([npm](https://registry.npmjs.org/scorify)) | none | none |
| SynthTab TabCNN checkpoints | CC BY 4.0 by the repository's LICENSE file, which begins `Creative Commons Attribution 4.0 International` ([LICENSE](https://raw.githubusercontent.com/yongyizang/SynthTab/main/LICENSE)) | kept in the same repository, whose README says `SynthTab is released with CC BY-NC 4.0 license` ([README](https://raw.githubusercontent.com/yongyizang/SynthTab/main/README.md)), which differs from the LICENSE file. CC BY-NC 4.0 says `NonCommercial means not primarily intended for or directed towards commercial advantage or monetary compensation.` ([legal code](https://creativecommons.org/licenses/by-nc/4.0/legalcode.en)) | SynthTab, rendered from DadaGP tabs, and DadaGP's README asks people to contact its makers `to request access to the dataset for research purposes.` ([DadaGP](https://github.com/dada-bots/dadaGP)). `finetuned/GuitarSet.pt` also GuitarSet, `cc-by-4.0` in version 1.1.0 and `cc-by-nc-4.0` in 1.0.1, and the SynthTab README names no version ([Zenodo](https://zenodo.org/api/records/3371780)) |
| TabCNN + GuitarProFX weights | Its training code's repository is CC0 1.0 at the root, whose LICENSE begins `Creative Commons Legal Code / CC0 1.0 Universal`, and MIT in its AMT-Tools folder, `MIT License / Copyright (c) 2023 Frank Cwitkowitz` ([repository](https://github.com/robust-guitar-tabs/code)). It ran here through amt-tools 0.3.2 | `cc-by-4.0`, the Zenodo record's license id ([Zenodo](https://zenodo.org/api/records/11406378)) | GuitarSet, `cc-by-4.0` in version 1.1.0 and `cc-by-nc-4.0` in 1.0.1, with no version stated. GuitarProFX, DadaGP tracks the authors rendered, and DadaGP's README asks people to contact its makers `to request access to the dataset for research purposes.` The training code's README says `This repository includes 16 Guitar Pro examples. For a full dataset, request access from DadaGP`. EGFxSet's license wasn't read |
| tabsynth 1.0.6 | MIT by its PyPI classifier and its README, `MIT License - see LICENSE file for details.`, though the package holds no LICENSE file ([PyPI](https://pypi.org/pypi/tabsynth/json)) | none | none |
| tayuya 0.0.4 | MIT | none | none |
| tutts 0.1.0 | MIT | none | none |
| tuttut 0.0.7 | MIT | none | none |

For LilyPond and PyGuitarPro, `survey.md` quotes only the opening of the GPL and LGPL texts and says it doesn't interpret the GPL. Every clause with its source, for these and the tools that didn't run, is in `survey.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/guitar-tab).

</details>

<!-- IMAGES -->
1. Source `docs/guitar-tab-research/lanes/guitar-tab/samples/lilypond/S2n.truthmidi.png` (579x819, a page at 70 dpi from run r0145, LilyPond defaults on S2n's exact notes, e0176). Written `public/media/guitar-tab-tools/guitar-tab-lilypond-s2n.webp`, 996x110, 13,060 bytes, with Pillow: cropped to the tab line (box 60,12,558,67, around the inked rows 19 to 60 and columns 68 to 550), scaled 2x with Lanczos, WebP quality 90. The rest of the page, blank apart from LilyPond's footer line, is left out.
   - Alt: One line of guitar tab: six horizontal lines with a TAB sign at the left and fret numbers from 0 to 3 along them, with only 3s on the bottom line.
   - Caption: **S2n in standard tuning.** LilyPond 2.24.3 on S2n's exact notes with its default settings, which use standard tuning, the usual E A D G B E (r0145). All 90 notes on the known string and fret. The tab is spaced by note order, not rhythm, and the whole clip is on this one line.
2. Source `docs/guitar-tab-research/lanes/guitar-tab/samples/lilypond/S5dropd.truthmidi.dropD.png` (579x819, 70 dpi, run r0145, `--tuning 38,45,50,55,59,64`, e0181). Written `public/media/guitar-tab-tools/guitar-tab-lilypond-s5dropd.webp`, 996x110, 13,190 bytes, the same crop and steps.
   - Alt: The same kind of line of tab, with fret numbers from 0 to 3 on the upper five lines and 5s and 0s on the bottom line.
   - Caption: **S5dropd, told it's Drop D.** The same piece in Drop D (the lowest string tuned down to D), with LilyPond given that tuning (r0145). All 90 notes on the known string and fret. The bass G (G2, the 2 is the octave) sits at fret 5 of the lowest string, and the low D is that string played open, with no finger on it.
3. Source `docs/guitar-tab-research/lanes/guitar-tab/samples/lilypond/R3a.bp.png` (579x819, 70 dpi, run r0301, LilyPond defaults on Basic Pitch's 105 notes of R3a). Written `public/media/guitar-tab-tools/guitar-tab-lilypond-r3a.webp`, 996x110, 13,826 bytes, the same crop and steps.
   - Alt: A line of tab with fret numbers from 0 to 10 on all six lines, some of them stacked in columns.
   - Caption: **R3a, a real concert video.** LilyPond on the 105 notes that Basic Pitch, a tool that writes down the notes it hears, wrote from R3a's audio (r0301). It placed all 105. There's no known answer to count them against.

The script that made them: `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/work/make_guitar_tab_images.py`. All three were opened and looked at after writing.

Gap round 2 (checked 2026-11-12) made no picture: its outputs are frame CSVs, note lists, scorify JSON, GP5 files and logs (trials.md, "Media kept outside git"), and the only PNG files under `/home/user/gtr/lanes/guitar-tab/gap2/` are images inside the gtrsnipe repository clone. So no picture was added.

<!-- PENDING MEDIA -->
None. This lane wrote no audio or video files (trials.md, "Media kept outside git"), and `/home/user/gtr/lanes/guitar-tab/out/` holds no audio or video file (checked 2026-11-10: its folders hold JSON, text, TSV, LilyPond, CSV, GP5, MIDI and PNG files only). Gap round 2 wrote none either (trials.md, same section), and neither `/home/user/gtr/lanes/guitar-tab/gap2/` nor `/home/user/gtr/lanes/guitar-tab/verify-gap2/` holds a file with an audio or video extension (checked 2026-11-12). The 5 PNG files in `gap2/` are images inside the gtrsnipe repository clone, not outputs.

<!-- NUMBERS -->
Sources are in `docs/guitar-tab-research/lanes/guitar-tab/` unless the line says otherwise. Run ids are rows of `/home/user/gtr/ledger/runs.jsonl`, eval ids rows of `/home/user/gtr/eval/ledger/evals.jsonl`. Every eval id below was re-read in the ledger for this fragment, and every "N of M" on the known string and fret is the ledger's `same_string_and_fret_count` of `n_truth`, "out" its `n_est` and "found" its `n_matched` (or `n_matched_onset_only` for note evals).

Counts of the whole lane (updated 2026-11-12 for gap round 2, from tools.json as refreshed in commit 4bb2d6f, `generated` 2026-11-11)
- 95 entries: tools.json, `tools` array has 95 items (94 at the fact-check, commit 22c8124). The one added is the Lund thesis, tools.json item 31, survey.md tool-list item 48 ("Added in gap round 2").
- 78 tools, models, papers, apps and services and 17 datasets: tools.json `kind` counts, research-model 45 (44 plus the thesis), open-source 12, library 12, commercial-app 7, api 2 (78), dataset 17.
- 13 ran: tools.json, 13 items with `"tried": true`, all `"tried_how": "local-cpu"` (amt-tools, SynthTab checkpoints, Riley et al., tuttut, tutts, tayuya, tabsynth, LilyPond, PyGuitarPro, piano-transcription-inference, and since gap round 2 the TabCNN + GuitarProFX weights, the one entry "cstr/tabcnn-onnx and cstr/tabcnn-GGUF", and scorify). The three changed from `"tried": false` between 22c8124 and now.
- Six tools that turn notes into tab, four trained-model entries that start from audio, amt-tools, piano-transcription-inference and PyGuitarPro: 6 + 4 + 3 = 13. amt-tools loaded SynthTab and the Zenodo file and decoded all the TabCNN frames, piano-transcription-inference loaded Riley et al., ONNX Runtime 1.31.1 ran the two cstr ONNX files: trials.md "Gap round 2", TabCNN section "Install" and "How it was called".
- The gap agent (`gapfill-guitar-tab`), the critic's gaps (`GAPS.md`, rows G1 to G5): trials.md "Gap round 2", first paragraph. "A critic" as in the post's main text ("a critic listed 52 gaps").
- The second checker (`verify-gapfill-guitar-tab`): 57 of 57 counts re-run equal (`scripts/verify-gap2/rescore.py`, `samples/verify-gap2/rescore_57_evals.txt`), re-runs r0674 (TabCNN, byte-identical), r0680 (scorify, same notes and cost in all seven), r0711 (GP5, byte-identical): trials.md "Verification log (verify-gapfill-guitar-tab, round 2, 2026-11-11)".
- Zenodo "a site for research data", Hugging Face "a site for AI models", ONNX "a format for trained models", PyTorch "a Python library for trained models": plain-word glosses, not findings (other fragments gloss them the same way).
- No cost beyond the session: ENVIRONMENT.md, "Cost" ("Local runs cost nothing beyond the cloud session itself").
- 2 cores, slots, shared runs: ENVIRONMENT.md "How runs were timed". Pinned 2-core runs cited (ledger `locked: true`, `n_cores: 2`): r0027, r0048, r0117, r0139, r0274, r0331, r0494, r0499, r0501, r0505, and from gap round 2 r0591 (cores 2-3), r0592 (0-1), r0594 (2-3), r0595 (0-1), r0601 (2-3), r0621 (0-1, `lock_wait_s` 20.0), r0623 (0-1), r0674 (0-1), r0680 (2-3, `lock_wait_s` 121.0). Shared runs cited (ledger `locked: false`): r0145, r0151, r0155, r0186, r0205, r0240, r0242, r0301, r0326, r0332, r0356, r0456, r0469, r0479, r0500, r0506, and from gap round 2 r0586.
- Found = onset within 50 ms and same pitch, each note matched once: trials.md section `How tab is scored`, eval `definitions.matching` (`onset_tolerance=0.05, pitch_tolerance=50.0`).
- Exact notes = the truth MIDI merged to one track, reason some tools read one track: trials.md "Lane inputs made here".
- Trial agent and checking agent (verify-trials-guitar-tab): the 199 eval ids the trial agent cited, each one run of `gtr-eval` holding many counts, re-run with results equal to the stored ones (r0456, label `re-score all 199 gtr-eval ids cited`, trials.md "199 of 199 results equal the stored results"), runs repeated (r0469, r0494, r0501), gaps filled (r0479, r0499, r0500, r0505, r0506): trials.md "Verification log". Ledger = the log of every run or count: ENVIRONMENT.md.
- "Added when the survey was checked" (now only on Guitar Chord Diagram Suggestion. The cstr exports, the TabCNN + GuitarProFX weights and scorify had it too, and left the not-run block when gap round 2 ran them): added by a different agent, verify-docs-guitar-tab, not by the checking agent above. survey.md "Added by the verification pass (2026-11-10)" items 44, 46 and 47 and the section headings "(added by verify-docs-guitar-tab, 2026-11-10)", tools.json `not_run_reason` ("Listed by the verifier", "Found by the verification pass in the docs lane", "Added by the verification pass" at the fact-check, commit 22c8124. Now only Guitar Chord Diagram Suggestion's still says "Added by the verification pass").

Clips (INPUTS.md clip table)
- S2n 29.357 s, synthesized fingerstyle, 90 notes. S2s the S2n notes on steel-string (GM program 25).
- R1c 28.235 s, GuitarSet player 00, 148 notes. R1a 29.159 s, 189 notes, comp take. R1b 29.333 s, 70 notes, solo take. "28 to 29 seconds".
- GuitarSet with string and fret logged: INPUTS.md (GuitarSet section and R1 truth convention, "string = 6 - data_source"), survey.md GuitarSet ("string and fret positions").
- S1 single-note melody, 62 notes. S3 strummed chords, 182 notes. S5capo2 capo on fret 2. S5dropd Drop D (D2 A2 D3 G3 B3 E4), G2 to string 6 fret 5, the D-chord root down to D2 on string 6 open (4 notes).
- R3a, R3b, R3c 18.000 s each, real guitar videos, no ground truth. R3a a concert recording.

Rundown and section (both open parts cut on 2026-11-12 to a bold lead plus one sentence, and a three-sentence opening. Each fact they no longer carry is in the folded blocks, as listed below)
- 95 listed and 13 ran: see "Counts of the whole lane". "Given a synthesized clip's 90 (exact) notes" = S2n's merged truth MIDI (trials.md "Lane inputs made here"), `n_truth` 90.
- S2n exact notes on the known string and fret, the six tools that turn notes into tab: LilyPond 90 (e0176), scorify 90 (e1810), tabsynth `notes` 68 (e0373), tayuya 14 (e0125), tutts 90 (e0402), tuttut 90 (e0043). "14 to 90": the lowest and highest of those. tabsynth `groups` (54 of 90, e0375) falls inside. Every one of these counts is in its tool's entry.
- R1c, no longer in the open part, in each entry: LilyPond 129 (e0184), scorify 127 (e1814), tabsynth `notes` 115 (e0388), tabsynth `groups` 76 (e0390), tayuya 26 (e0139), tutts 120 (e0408), tuttut 120 (e0052). The old open part's range "26 to 129" holds with scorify's 127.
- Moved into the folded blocks: what S2n is ("29-second fingerstyle clip I synthesized so every note is known"), GuitarSet's gloss ("a research set of recordings with each note's string and fret logged") and the capo gloss, all into the clips paragraph. "The way its own demo does" into tabsynth's In line (trials.md tabsynth, "as in tabsynth's own `demo-mixed`"). The S5capo2 workaround counts and the TabCNN paragraph were already in the entries (LilyPond, tabsynth, tayuya, tutts, tuttut, and the SynthTab entry and table).
- The fret gloss "a metal strip on the neck": plain words, from the old opening's "one of the metal strips across the guitar's neck".
- Capo settings: five of the six note-to-tab tools have none my agents found, trials.md, "Constraint inputs across the tools run here" table, capo column ("workaround" or "no" for the LilyPond, tabsynth, tayuya, tutts and tuttut rows), LilyPond "No capo property for `TabStaff` was found". scorify has one, row "scorify 0.4.0 (gap round 2)", "param `capoFret` (e1816)". Each entry's "Takes as a hint" line says which.
- S5capo2 with a tuning 2 semitones (2 frets) higher, 90 of 90: LilyPond e0179 (`fis, b, e a cis' fis'`), tutts e0409, tuttut e0046 (`F#4 C#4 A3 E3 B2 F#2`, nfrets 18). tabsynth and tayuya take no tuning (same table, tuning column "no"), so the notes were moved down 2 semitones (`S5capo2.merged.minus2.mid`) and the frets read from capo 2: tabsynth `notes` 68 (e0392), tayuya 14 (e0131).
- TabCNN on S2n: `finetuned/GuitarSet.pt` e0198 (260 out, 67 found, 41), `SynthTab-Pretrained.pt` e0863 (163 out, 67 found, 60). On R1c: e0205 (127 of 148) and e0883 (61 of 148). TabCNN is Wiggins and Kim's (ISMIR 2019), and these copies were trained by the SynthTab authors: trials.md SynthTab "What it is". The first copy may have heard R1c: trials.md "Train/test split and the R1 clips" (R1 takes "may have been seen by `finetuned/GuitarSet.pt`").
- What a fret, a capo, an open string and an octave number are, and "standard tuning, the usual E A D G B E": plain-word explanations, not findings. E A D G B E is the tayuya README quote in trials.md, and LilyPond's defaults are standard tuning (trials.md LilyPond table, row S1).

Pictures (r0145, r0301, e0176, e0181)
- S2n picture: 90 of 90, e0176. S5dropd with `--tuning 38,45,50,55,59,64`, 90 of 90, e0181. Both made in r0145 (`scripts/batch_lilypond.sh`, the two `--png` lines).
- R3a: 105 notes, 67 chord groups, no warnings, r0301 (trials.md "Handoff run on real video audio without truth").
- Bottom line 3s in S2n and 5s and 0s in S5dropd: seen in the pictures, and `samples/lilypond/S2n.truthmidi.lilylog.tsv` (string 6 fret 3, 14 rows) and `S5dropd.truthmidi.dropD.lilylog.tsv` (string 6 fret 5, 14 rows, fret 0, 4 rows). G2 at string 6 fret 5 and D2 on string 6 open: INPUTS.md, S5dropd.
- Spaced by note order, not rhythm: trials.md LilyPond ("The rhythm in the `.ly` is not the music's rhythm: it only orders the chords").
- The whole clip on one line: the three PNG pages, measured with Pillow. The ink of the tab line ends at column 550 (counting from 0) of the 579-pixel width, and no ink lies between rows 61 and 790. The last group of each log is the last mark on the line: S2n and S5dropd 48 groups, the last at moment 47/16 on string 4 fret 0, R3a 67 groups (`/home/user/gtr/lanes/guitar-tab/out/handoff-bp/lilypond/R3a.bp.lilylog.tsv`), the last on string 2 fret 0. See "Where the sources looked off".
- R3a "wrote", not "found": the 105 are the notes in Basic Pitch's R3a MIDI, and `No truth exists for R3a, so nothing is scored` (trials.md "Handoff run on real video audio without truth").

Details intro
- Basic Pitch 0.4.0 notes from the audio-to-notes lane, run r0234 there (ledger lane `audio-to-notes`): trials.md "Handoff runs". R3b and R3c from run r0264 (ledger lane `audio-to-notes`, label "basic-pitch 0.4.0 TFLite defaults on R3b.wav and R3c.wav", `locked: false`): trials.md R3a section ("the audio-to-notes lane wrote them at 21:42 UTC (run r0264)"), and r0479's label ("audio-to-notes r0264").
- Clips paragraph placed before the counting paragraph, so R1a and R1b are described before they are named there.
- Basic Pitch S2n 137 out, 90 of 90 found (e0559). R1c 156 out, 120 of 148 found (e0577).
- R3 clips 18 s: INPUTS.md.

amt-tools
- 0.3.2, PyPI 2023-07-30: tools.json, survey.md amt-tools. 22050 Hz, `CQT(...)` settings, `ComboEstimator([...])`, `evaluate.py`: trials.md SynthTab "Pipeline".
- `ModuleNotFoundError: No module named 'resampy'`, `Unsupported global: GLOBAL numpy.core.multiarray.scalar`: trials.md SynthTab "Install".
- `GuitarProfile(tuning=None, num_frets=None)`, 19 frets: survey.md amt-tools, trials.md SynthTab "Constraint inputs".
- `write_stacked_notes_jams`, no Guitar Pro or MusicXML writer: survey.md amt-tools.
- Gap round 2: amt-tools 0.3.2 loaded the Zenodo file (`run_offline`, its CQT front-end), and "For every configuration the per-string frets go through the same amt-tools decoding as the SynthTab runs" (`TablatureWrapper` + `StackedNoteTranscriber`), the ONNX runs included: trials.md "Gap round 2", TabCNN section "Install" (venv-amt with amt-tools 0.3.2) and "How it was called". r0592: ledger tool `tabcnn-zenodo-11406378-amt-tools`.

cstr/tabcnn-onnx (gap round 2)
- Revision `886ead7`, created 2026-07-20, last modified 2026-08-02, account cstr, export repository CrispStrobe/onnx_runtime_dart: tools.json `version`, trials.md "Gap round 2" TabCNN section, survey.md "TabCNN weights published by others".
- Card quotes `Vanilla: trained here on **GuitarSet** (CC BY 4.0).` and `GuitarProFX: weights from **Zenodo 11406378**`: survey.md same section (card read 2026-11-10, re-read 2026-11-11).
- GGUF copies (f32, f16, q8_0, q4_k) in cstr/tabcnn-GGUF, not run: survey.md same section, trials.md "(b) two ONNX files" (only the ONNX files ran).
- ONNX Runtime 1.31.1 CPU, `intra_op_num_threads` = the slot's 2 cores, `inter_op_num_threads` 1, front-ends per file, windows of 9 frames, argmax per string, amt-tools decoding, `scripts/gap2_run_tabcnn.py`: trials.md "How it was called". "22050 Hz": the `sr=22050` in both front-ends.
- 21 classes, class 0 silent, class 1 open to class 20 fret 19, `float32[N, 6, 21]`, `float32[N, 192, 9, 1]`, the caller's code: survey.md "Card facts on the front-end" ("class 1 = open, class 20 = fret 19"), trials.md "Output and input format facts". 23.2 ms hop: same.
- 58,980 of 58,980 cells over 9,830 frames, r0591 and r0595 against r0592, decoded notes the same within 1 microsecond, so not scored separately: trials.md "The ONNX export against the pickled model", `samples/tabcnn-published-weights/compare_zenodo-amt_vs_onnx-gpfx.txt` ("all: frames 9830, identical frames 9830, identical string cells 58980/58980").
- r0601, 58 of 9,830 frames, `preprocess.py` order (peak-normalize at 44.1 kHz, then `librosa.resample`), not scored: trials.md same paragraph.
- Table: e1739, e1742, e1745, e1748, e1751, e1754, e1757, e1760, `n_est`, `n_matched`, `same_string_and_fret_count` (S2n 223, 72, 62. S2s 189, 43, 43. S3 106, 40, 40. S5capo2 182, 58, 0. S5dropd 224, 67, 54. R1a 120, 56, 55. R1b 90, 64, 62. R1c 151, 107, 103).
- S5capo2 40 of 58 at the same fret from the nut: trials.md "What the S5 rows show" ("40 of 58 (b)"), e1748 `same_string_and_absolute_fret_fraction_of_matched` 0.689655 of 58. D2 below the lowest pitch 40 (E2): same paragraph.
- Training command and players: trials.md "What (b) `tabcnn.onnx` was trained on" (`EPOCHS=4 VAL_GUITARIST=5 python train.py features/ tabcnn.onnx`, "`train.py` keeps every clip whose player is not 5", R1 players 02, 04, 00). Not verified that the Hugging Face file is that command's: trials.md verification log (round 2), "Still UNVERIFIED".
- GGUF card quote and "a step this lane did not build": trials.md "Constraints accepted", survey.md.
- r0594 62.01 s wall, 1001.7 MB, per clip 5.84 to 11.65 s, inner 0.75 to 1.90 s, load 3.45, first two clips S2n 10.92 s and S2s 11.65 s. r0591 47.11 s, 1009.8 MB, 5.68 to 6.17 s, 0.66 to 0.84 s. 6 threads, all on the slot's cores. Clips 24.0 to 29.4 s: trials.md "Runs" table and the paragraph under it, ledger. "Other lanes' jobs ran": trials.md ("r0594 and r0595 started while other lanes' jobs ran (load 3.45)").
- r0674: S2n and R1c, all six frames CSVs and note lists byte-identical: trials.md verification log (round 2), "Re-runs".

LilyPond
- 2.24.3, Ubuntu package: trials.md LilyPond. Manual quote: survey.md LilyPond, Notation Reference 2.24.
- 30 ms groups, `.ly`, `TabStaff`, `tablatureFormat` hook, command `lilypond --loglevel=WARNING -dno-print-pages`, `--png -dresolution=70`: trials.md LilyPond "How it was called".
- S1 62/62 e0175, S2n 90/90 e0176, S3 182/182 e0177, R1a 104/189 (188 written) e0182, R1b 32/70 e0183, R1c 129/148 e0184.
- R1a warning, A#2 at 10.668 s, default `maximumFretStretch` 4: trials.md LilyPond "Notes LilyPond did not place".
- S5capo2 0/90 e0178, 90/90 e0179. S5dropd 86 written, 72/90 e0180, warning text, 90/90 e0181.
- `minimumFret`: S1 at 5, 22/62 e0185. S2n at 3, 66/90 e0190. R1b at 5, 29/70 e0188. R1c at 3, 83/148, 146 written e0187. `restrainOpenStrings` 90/90 e0186, with `minimumFret` 1, 50/90 e0189, 40 open-string notes moved one string down (trials.md).
- Pin `g\4`, string 4 fret 5, 89 notes unchanged: r0155, trials.md.
- Basic Pitch notes: S2n 88/90 (136 out) e0663, R1c 94/148 (155 out) e0729, frets up to 30 and the C1 left out (trials.md "What happened between the tools and Basic Pitch's MIDI"), S5capo2 with the raised `stringTunings` 86/90 e0739 (trials.md row "capo told (raised `stringTunings`)"), S5dropd with the Drop D tuning 90/90 e0740.
- Log excerpt: trials.md LilyPond "Output excerpt" (`0 6 3`, `0 3 0`, `1/16 4 0`, `1/16 3 0`, `1/8 6 3`).
- Time: r0145, 36.04 s wall, 14 runs, 78.7 MB, `lilypond` 2.05 to 2.88 s per run (trials.md).
- Settings and no capo setting: trials.md LilyPond "Constraint inputs". `maximumFretStretch` default 4.
- PyGuitarPro read-back of LilyPond S5dropd 90/90: e0433.

piano-transcription-inference
- 0.0.6, Kong et al.: tools.json, trials.md Riley section.
- 16 kHz, 10 s segments, thresholds onset 0.3, offset 0.3, frame 0.1, re-download under 160 MB (`os.path.getsize(checkpoint_path) < 1.6e8`), `torch.load(weights_only=True)`: trials.md Riley section.
- Runs r0331, r0494, r0499, r0505 (the last three with the same `run_hfmt_guitar.py`, trials.md).

PyGuitarPro
- README quote `PyGuitarPro is a package to read, write and manipulate GP3, GP4 and GP5 files.`: survey.md PyGuitarPro (README.rst). GP5 writer used by `gtreval_to_gp5.py`, reader used by `gtr-eval tab` to read the files back: trials.md "PyGuitarPro 0.11 as glue".
- 0.11, about 50 lines, `gtreval_to_gp5.py`, 112 BPM, `Track.strings`, `Track.offset`, 16th grid, 4/4: trials.md "PyGuitarPro 0.11 as glue".
- 3,158 to 3,170 bytes for the four from exact notes (tuttut S2n, tuttut S5capo2, tuttut S5dropd, LilyPond S5dropd): trials.md ("Files: 3,158 to 3,170 bytes each"), and the files in `samples/pyguitarpro-glue/` (3,158, 3,168, 3,168, 3,170). The other four, not sized in the post: `bp-tuttut_S2n.bp.gp5` 3,355, `bp-tuttut_S5capo2.bp.capo2.gp5` 3,376, `bp-tuttut_R1c.bp.gp5` 3,498, `bp-tuttut_R3a.bp.gp5` 2,765. e0430 90/90, e0431 90/90 capo 2, e0432 88/90 tuning `[38, 45, 50, 55, 59, 64]`, e0433 90/90.
- "with the tuning raised for the capo": the two tuttut S5capo2 lists are the raised-tuning runs, `S5capo2.truthmidi.capo2` (e0046, read back as e0431) and `S5capo2.bp.capo2` (e0732, read back as e1090), written with the capo as `Track.offset` (ledger file paths, trials.md).
- Chains: e1088 S2n 89/90, 136 of 137 written. e1090 S5capo2 90/90, 139 written. e1092 R1c 90/148, 119 BPM, 151 of 153 written, 112 found.
- R3a 102 of 105 at an assumed 120 BPM: trials.md R3a section.
- Not timed, not run through `gtr-run`: trials.md, tools.json. Since gap round 2 that holds only for the 2026-11-10 conversions: r0586 re-ran all eight (`gtr-run --nolock`, `locked: false`), wall 0.77 s for all eight including eight Python start-ups, peak RSS 21.1 MB, exit 0. Same content in all eight (tempo, tuning, capo, every beat's (string, fret) notes), only the song title differs, and the seven scored files give the stored results of e0430 to e0433, e1088, e1090 and e1092: trials.md "PyGuitarPro glue conversions given a ledger line (G1)", tools.json PyGuitarPro `runs`. R3a is the eighth, with no truth.

Riley et al.
- Model repository last modified 2026-08-22, Queen Mary University of London: tools.json, survey.md.
- Slot waits about 30 and 37 minutes, cancelled, the trial agent's account: trials.md Riley section and verification log.
- 384 ticks per beat, CSV columns: trials.md Riley "Output format facts".
- guitar-fl: S2n e1224 90 out, 89 found. R1c e1274 133 out, 125 found.
- guitar-gaps: S2n e1428 90 out, 90 found. S3 e1436 208 out, 172 found. R1b e1437 69 out, 61 found. R1c e1438 130 out, 121 found.
- Extra = out minus found: 1, 8, 0, 36, 8, 9.
- Into tuttut and LilyPond: e1225 89, e1344 89, e1275 104, e1345 109, e1430 90, e1432 90, e1440 172, e1441 172, e1442 25, e1443 25, e1444 106, e1445 108.
- Training runs unverified: trials.md Riley "Training data", tools.json `unverified`.
- CSV rows: `samples/riley-guitar-crnn/R1c.guitar-fl.notes.csv` lines 1 to 3.
- r0331 400.85 s wall, 943.9 MB, 216.80 s and 165.55 s transcription. r0494 22.87 s, byte-identical MIDI. r0499 15.03 s transcription, 21.28 s wall, 919.1 MB. r0505 87.17 s wall, 948.0 MB.

scorify (gap round 2)
- 0.4.0, Aron Homberg, npm, published 2026-10-31, repository github.com/kyr0/scorify, README description quote, the three search methods quote: survey.md scorify, tools.json `version` and `what`.
- Places each note with string, fret and finger "by a search over a hand-mechanics model": trials.md "Gap round 2" scorify "What it is".
- No file reader, README quote `audio/MIDI/MusicXML import ... remain future work.` (survey.md "Inputs it does not read", trials.md "Input format facts"). Glue `scripts/gap2_run_scorify.py`: exact rational onset and duration in quarter notes, sharps (`parsePitch("C#4")`), tempo map and first time signature: trials.md "How it was called".
- `arrange` with `mode: "exact"` (trials.md gives the call as `arrange(score, {instrument, mode: "exact", player})`, cut in the post to keep the variable name `score` out of the prose), Node v22.23.4, `scripts/gap2_run_scorify.mjs`, the three `classicalGuitar(...)` calls, E2 A2 D3 G3 B3 E4 with 19 frets: trials.md "How it was called" and "Install", r0689. Default player `compilePlayer({})`, level "maestro", `maxFretSpan` 9, `maxAttacksPerSecond` 32, `minDuration` 1/64 quarter. Default search beam width 64, 128 candidates per frame, 500,000 expansions. Larger search beam 512, 512 candidates, 5,000,000 expansions: trials.md results table, row S5capo2. Adaptive mode with hold shortening or octave shift: same table. The glosses of the three limits ("widest stretch in frets", "most notes plucked in a second", "shortest note") are plain words for the parameter names.
- Output: status, per note string, `relativeFret` (from the capo), finger 0 to 4, cost, difficulty, times as quarter-note rationals, no ASCII, Guitar Pro or MusicXML writer, "Unlike the other symbolic tools here it gives a fretting finger per note": trials.md "Output format facts".
- e1808 S1 62/62, e1810 S2n 90/90, e1812 S3 182/182, e1814 R1c 127/148 (`same_string_and_fret_count`).
- R1a and R1b `search-exhausted`, "No valid path within the declared candidate and mechanics model", 0 placed (r0621, `samples/scorify/scorify_batch1.log.txt`, `R1a.truthmidi.scorify.out.json`, `R1b.truthmidi.scorify.out.json`). README "No partial prefix is emitted as a successful arrangement.": trials.md. Larger search same words, adaptive "Expansion budget exceeded" (r0623, `scorify_batch2.log.txt`).
- R1a's 188th note, D#3 at 29.152 s, cut to 7 ms (12 ticks = 0.0125 quarter at 107 BPM, under 1/64 = 0.0156): trials.md "Why R1a and R1b stopped" (r0630). `minDuration` 1/256: 189 placed, e1829 101/189 (r0631).
- R1b fails at its 56th note, the B4 at 25.272 s, 18.3 ms after an F#4 at 25.254 s that sounds until 25.457 s. `maxAttacksPerSecond` 64 (r0631) and `rightHand: "strum"` (r0633): same status. `limitsExceeded` lists no limit for R1b at maestro (r0641), cause UNVERIFIED: trials.md same section.
- S5capo2 not told: "Expansion budget exceeded" (r0621). Larger search: 90 placed, e1828 0/90, string 0 on 54 matched pairs and `same_string_and_absolute_fret_fraction_of_matched` 0.6 of 90 = 54. `classicalGuitar({capoFret: 2})`: e1816 89/90.
- S5dropd not told: `search-exhausted` with defaults (r0621), larger search (r0623), adaptive with `allowOctaveShift` (r0623). Drop D: e1818 82/90. The 8 off: "the four C3 (truth string 5 fret 3, scorify string 6 fret 10) and the four C4 (truth string 2 fret 1, scorify string 4 fret 10)": trials.md.
- R1c level amateur `infeasible`, 44 ms (r0623, `scorify_batch2.log.txt` 43.8 ms). `limitsExceeded` lines for R1c at amateur: trials.md, `samples/scorify/scorify_limits.log.txt`. Each line has a second clause after a semicolon, "this difficulty allows 7" and "this difficulty allows 4 unless each sounds alone". The post quotes each line only up to the semicolon and gives the rest in words.
- Pin: no string field on a note (`NoteEvent` fields in `model.d.mts`), README cost-hook sentence `It cannot override hard validity or the musical-fidelity priority.`, hook returns 1000 for note n1 (the G3 at 2.143 s) off string 4, result string 4 fret 5 finger 3, the other 89 unchanged, finger changed on 35 of 90: trials.md "Pinning a note to a string (G4)", e1830 89/90. LilyPond the same move: trials.md "A corrected string re-running the assignment" (r0155).
- r0621 19.73 s wall, 175.7 MB, after 20.0 s waiting, 10 runs. `arrange` 799.5 to 2695.4 ms per run (`scorify_batch1.log.txt`, tools.json "arrange 0.80-2.70 s per clip"). r0623 48.26 s, 345.3 MB, 9 runs, S5capo2 larger search 16546 ms (trials.md table, `scorify_batch2.log.txt` 16546.4 ms). r0680: seven runs, same status, same (onset, pitch, string, fret, finger) and the same cost: trials.md verification log (round 2).
- Constraint inputs: trials.md "Constraint inputs" (tuning per string, `capoFret` per instrument or string, `fretCount` not varied, level and single overrides, search limits, a string only through the cost hook). `suggestCapo` in the `songs` subpath, not tried: survey.md scorify (verifier's line, "not read further"), tools.json `unverified` ("Not tried: ... `suggestCapo` ...").
- WAV rendering (`renderPerformance`, `encodeWav`) not tried, `skills/score-import/` README quote, not tried: trials.md "Output format facts" and "Input format facts", survey.md scorify.

SynthTab TabCNN checkpoints
- Commit 6136f79, 2024-12-05: trials.md, survey.md. Frame hop 23.2 ms (512/22050): trials.md "Pipeline".
- SynthTab rendered from DadaGP: survey.md SynthTab (abstract) and "Training data of the released weights".
- README quote about code being cleaned up: trials.md and survey.md SynthTab.
- Table: e0198 to e0205 (`finetuned/GuitarSet.pt`) and e0863, e0866, e0869, e0873, e0875, e0879, e0881, e0883 (`SynthTab-Pretrained.pt`), `n_est`, `n_matched`, `same_string_and_fret_count`.
- No capo input, D2 notes can't come out, lowest note E2: trials.md "What the S5 rows show".
- May have heard R1 takes: trials.md "Train/test split and the R1 clips". `SynthTab-Pretrained.pt` trained on SynthTab alone and not on GuitarSet, going by its name and the paper, not otherwise verified: trials.md, note under the second results table.
- Decoded notes excerpt and the known first notes at 2.1429 s: trials.md "Output excerpt".
- r0139 185.81 s wall, per clip 18.36 to 32.91 s, clips 24 to 29.4 s, 3798.2 MB. r0501 21.15 s, 3647.2 MB, 141 notes. r0274 517.17 s, 3797.4 MB, wall 2.4 times CPU against 0.9 times in r0139, cores shared "(not measured)", CPU 211.74 s vs 205.69 s: trials.md "Run `SynthTab-Pretrained.pt`". The post gives the ratio and that sharing wasn't measured, without the source's "points to" reading.
- Tuning `[40, 45, 50, 55, 59, 64]`, 19 frets: trials.md "Constraint inputs".

TabCNN + GuitarProFX weights (gap round 2)
- `best_TabCNN_tablature_trancription_model` in Zenodo record 11406378, published 2024-06-01, TabCNN in amt-tools' implementation by Pedroza, Abreu, Corey and Roman (DAFx 2024), GuitarSet plus GuitarProFX, the quote `comprises 360 randomly-chosen solo performance tracks from DadaGP`, tones from EGFxSet and the authors' own recordings: survey.md "TabCNN weights published by others", trials.md "Gap round 2" TabCNN "What they are", tools.json `what`.
- PyTorch zip archive, one pickle `model-2500/data.pkl` naming `amt_tools.models.tabcnn.TabCNN`, tensors saved on `cuda:0` ("its weights saved on a graphics card"): trials.md "What (a) is", survey.md ("a whole pickled amt-tools `TabCNN` object saved at `model-2500`").
- `load_normalize_audio(path, 22050)`, `torch.load(weights_only=True)` with an allow-list of amt-tools' own class names, only numpy's `numpy.core.multiarray.scalar` mapped, `amt_tools.features.CQT(...)`, `run_offline`, `scripts/gap2_run_tabcnn.py`: trials.md "How it was called".
- Table: e1715, e1718, e1721, e1724, e1727, e1730, e1733, e1736, `n_est`, `n_matched`, `same_string_and_fret_count` (S2n 220, 76, 49. S2s 262, 61, 56. S3 106, 33, 32. S5capo2 225, 77, 0. S5dropd 226, 74, 40. R1a 100, 56, 54. R1b 90, 65, 64. R1c 135, 119, 119). The same numbers stand for `tabcnn-gpfx.onnx`: trials.md ("its numbers are (a)'s"), tools.json r0591 ("scores are those of the Zenodo entry").
- S5capo2 39 of 77 from the nut: trials.md "What the S5 rows show", e1724 0.506494 of 77. Lowest pitch 40 (E2) in the pickled `GuitarProfile`: trials.md "What (a) is".
- Folds and R1 overlap, written as conditional, the training script's own `GuitarProFx` folder, "whether GuitarSet tracks were in that folder is not in the repository": trials.md "What (a) is" with the verifier's note, tools.json `training_overlap`, UNVERIFIED.
- Excerpt: trials.md "Output excerpt, (a), S2n, first 10 decoded notes", the first five. `samples/tabcnn-published-weights/S2n.zenodo-amt.gtreval.json` gives the same first notes.
- r0592 64.44 s wall, 1364.9 MB, per clip 7.46 to 8.86 s, inner 2.22 to 3.57 s: trials.md "Runs" table, `samples/tabcnn-published-weights/tabcnn_zenodo-amt.log.txt`. r0674: verification log (round 2).
- Tuning E2 A2 D3 G3 B3 E4 and 19 frets fixed: trials.md "What (a) is", tools.json `constraints_accepted`.

tabsynth
- 1.0.6, PyPI summary quote, no author or project URL: survey.md tabsynth, trials.md. 63 templates (`V1_TEMPLATES`): trials.md.
- Command and `max_fret=5` run: trials.md tabsynth.
- `notes`: S1 50/62 e0370, S2n 68/90 e0373, S3 147/182 e0377, R1a 109/189 e0384, R1b 55/70 e0386, R1c 115/148 e0388.
- `groups`: `Em7_open`, S2n 238 out, 54/90 e0375. R1c 238 out, 76/148 e0390. "The way its own demo, `demo-mixed`, does": trials.md tabsynth "How it was called" ("as in tabsynth's own `demo-mixed`"), moved here from the old opening.
- Drops: S5dropd `notes` 86 out, 50/90 e0382. R1b `max_fret=5` 69 out, 32/70 e0394.
- Barres, dynamic programming, lowest total cost: trials.md tabsynth "What it is" ("dynamic programming over hand-position, string-change, stretch, barre and position-preference costs"). `tolerance_cents` "not tried" (trials.md), and the command passes its default 50, so the post says it wasn't varied.
- S5capo2 0/90 e0380, transposed 68/90 e0392.
- Basic Pitch `notes`: S2n 132 out, 71/90 e0665. R1c 81/148 e0730.
- First state: trials.md tabsynth "Output excerpt".
- r0186 8.73 s, 19 runs, 37.0 MB. Per-clip time not logged: trials.md (UNVERIFIED, left out).
- Standard tuning when no fretboard passed: trials.md tabsynth "Constraint inputs".

tayuya
- 0.0.4, 2019, README quotes: trials.md and survey.md tayuya.
- S1 0/62 e0124, S2n 14/90 e0125, S3 33/182 e0127, R1a 79/189 e0135, R1b 29/70 e0137, R1c 26/148 e0139. S5capo2 workaround 14/90 e0131.
- Fret-0 counts in the truth (S1 16 of 62, S2n 40 of 90, S3 100 of 182, R1c 49 of 148), E2 7 and 6 times, D2 4 times: trials.md tayuya.
- 128 for the 64 notes Basic Pitch wrote for S1 (e0653, 128 out, and the S1 handoff row, 64 out), `UnboundLocalError` text, notes above D6: trials.md "What happened between the tools and Basic Pitch's MIDI".
- "small" (trials.md "a small Python library") left out as an impression with no unit.
- First 10 entries: trials.md tayuya "Output excerpt", `samples/tayuya/S2n.truthmidi.tayuya.raw.json`.
- r0117 7.35 s, 9 runs, 72.6 MB, 459.5 s waiting, 0.02 to 0.06 s inside.

tutts
- 0.1.0, npm description quote: survey.md tutts. README quote `The core is pure (zero runtime dependencies), ESM-only`: survey.md tutts. Installed with `npm install tutts@0.1.0`, which printed "added 1 package", Node v22.23.4: trials.md tutts "Install". Run in Node only, never in a browser: trials.md tutts.
- Command and variations: trials.md tutts.
- S1 62/62 e0401, S2n 90/90 e0402, S3 182/182 e0403, R1a 100/189 e0406, R1b 31/70 e0407, R1c 120/148 e0408, S5capo2 0 e0404 and 90 e0409, S5dropd 72 (86 found) e0405 and 88 e0410, `quantizeGrid` 145 out, 139 found, 114 e0411.
- Identical to tuttut: trials.md "Compared note by note with tuttut 0.0.7".
- Basic Pitch: S2n 89/90 e0661, R1c 93/148 e0728, capo 90/90 e0735, Drop D 86/90 e0737. S3 two chords, 14 notes, tutts none, tuttut 3 (2 of 6 and 1 of 8): trials.md.
- r0205 7.59 s, 11 runs, 62.1 MB. 151.6 ms and 43.6 ms in r0469.
- README quotes `the renderer-neutral result` and `a thin adapter`, `packages/alphatab`: survey.md tutts and handoff fact 4.

tuttut
- 0.0.7, README method and quotes: survey.md and trials.md tuttut.
- Command, CLI default tuning, variations, `MAX_FRET_SPAN` default 5, 3, 6 and 7: trials.md tuttut.
- S1 62/62 e0042, S2n 90/90 e0043, S3 182/182 e0044, R1a 100/189 e0049, R1b 31/70 e0050, R1c 120/148 e0052, nfrets 12 e0054, span 3 e0055, nfrets 3 e0056.
- S5capo2 0/90 with 54 on the same string and nut fret e0045, 90/90 e0046. S5dropd 72/90 (86 found) e0047, 88/90 e0048 with the two G3s, at 2.14 s and 19.29 s, written at string 4 fret 5 (trials.md tuttut "What the S5 rows show"). The two times are left out of the post as decimal seconds that don't change the point.
- Span 7 `AssertionError`, span 6 identical (r0469): trials.md tuttut "Failures and oddities".
- Basic Pitch: S2n 89/90 e0658, R1c 93/148 e0727, capo 90/90 e0732, Drop D 86/90 e0733. C1 to C3: trials.md.
- R3a 105 notes, 31 open, highest fret 10 (r0301). R3b 129 of 129 and R3c 84 of 87 the same as LilyPond (r0479).
- Tab excerpt: `samples/tuttut/S2n.truthmidi.txt`, the first 47 characters of lines 1 to 6.
- r0048 3.74 s, 15 runs, 37.1 MB. r0027 0.37 s, 40.5 MB. 0.01 to 0.10 s inside (corrected by the verifier).

What didn't run
- 66 tool lines plus the datasets line: the 65 non-dataset entries of tools.json with `"tried": false` (78 minus 13), plus Riley et al.'s own `midi_transcription` command, which tools.json covers inside the Riley entry's `not_run_reason`. Sorted by name, ignoring case, backticks and a leading @. Gap round 2 took out three lines (cstr exports, TabCNN + GuitarProFX weights, scorify, now in the ran block) and added one, the Lund thesis, listed by its English title "Taming the Shotgun" so it sorts between "TabCNN, the original code" and "TapToTab" whichever way the accent is treated.
- Refusal note, "until an agent in a later round, the gap agent, tried gtrsnipe and got the same message, by its own account": trials.md "Tools NOT RUN here" ("Gap round 2: the same refusal text was returned to the gap agent on 2026-11-11 for an install of gtrsnipe from its repository"), "gtrsnipe, re-checked" (00:40 UTC, `uv pip install ... "gtrsnipe @ git+https://github.com/scottvr/gtrsnipe@a9be933..."`, "refused before it ran"), verification log (round 2), which lists under "Still UNVERIFIED" the permission refusal of the gtrsnipe install at 00:40 UTC as the gap agent's report, with no log of it.
- gtrsnipe: still not on PyPI on 2026-11-11 (JSON API and simple index HTTP 404), install from the repository refused: tools.json `not_run_reason` (new), trials.md "gtrsnipe, re-checked". Section 4's new step 7 (move the G3 to the D string at fret 5 by hand, read back with the default, `--no-refinger` and `--refinger`): for-aaron.md section 4.
- FretPath: section 5's new step 6 (a string number 4 on S2n's first G3): for-aaron.md section 5. README quote `respects existing finger-number and string-number annotations as hard constraints`: tools.json FretPath `constraints_accepted`, trials.md "A corrected string re-running the assignment".
- TabCNN, the original code: "Copies of TabCNN trained by other people did run": tools.json `not_run_reason` (new: "and through TabCNN weights trained by other people (Zenodo 11406378 and cstr/tabcnn-onnx), which ran on the box in gap round 2").
- Taming the Shotgun: tools.json item 31 (`NO-CODE-FOUND: no repository, code or data link in the 35-page PDF (URLs only in its references) or on the record page`), survey.md, the thesis's own section, "Taming the Shotgun" being its alternative title on the record (Swedish, two authors, Lund University, bachelor thesis LU-CS-EX 2026-17, Basic Pitch's minimum note length lowered from 127.7 ms to 40 ms, rule-based filters, then a Viterbi string-and-fret step), `for_aaron` false, so "No steps". The Swedish title and the authors' names are left out of the post because they hold letters the fragment didn't already have (rule 8).
- Reasons: tools.json `not_run_reason` of each entry, trials.md "Tools NOT RUN here", survey.md sections and "Not covered".
- Refusal message and its status: trials.md "Tools NOT RUN here" and verification log (the trial agent's account, no log).
- Steps: `for-aaron.md` sections 1 (Guitab), 2 (hf_midi_transcription), 3 (Noise2Fret and Guitar-Transcription-CNN-MTL, no run steps), 4 (gtrsnipe), 5 (TuxGuitar, MuseScore with FretPath).
- Basic Pitch run about 19 minutes waiting, cancelled: trials.md "Handoff runs".
- MuseScore 3.2.3, TuxGuitar 1.5.6 on the box: trials.md "Tools NOT RUN here". MuseScore's steps are for MuseScore 4 with the FretPath plugin: `for-aaron.md` section 5.
- arXiv ids 2510.19666, 2511.03337, 2610.36786, 2607.18303, 2510.21872, 2608.27522, 2605.12135: survey.md "Not covered" and research tables. Zenodo 11406378: survey.md "TabCNN weights published by others".
- Noise2Fret Zenodo CC BY 4.0, CNN-MTL weights MIT: survey.md and trials.md.
- 17 dataset names: tools.json entries 70 to 86. Guitar-TECHS now sorts before guitar_style_dataset (`-` before `_`), by the same rule.
- "no trained model found" (Audio2Tab, FretNet, guitar-transcription-with-inhibition, GuitarTab): tools.json `not_run_reason` ("Weights published: none found" for FretNet and guitar-transcription-with-inhibition, "no published checkpoint found in it" for GuitarTab), trials.md Audio2Tab ("no checkpoint download was found in it"), for-aaron.md ("no trained model that the research found"). FretNet elsewhere: survey.md FretNet "Pretrained weights" ("Whether one is published elsewhere: UNVERIFIED").
- Guitab: survey.md Guitab (README "Guitab turns a recording of a solo guitar into a tab you can open in Guitar Pro, ...", output `my_song.gp5`, option table `--capo N`).
- Guitar-Transcription-CNN-MTL six copies, each tested on one GuitarSet player: trials.md ("Fold i was tested on GuitarSet player i (00 to 05)", one `model_best.pt` per fold), for-aaron.md section 3 ("fold by fold").
- music21 stub: trials.md (docstring "TODO", body `return None`). RGB-D: survey.md research table (search-result summaries, UNVERIFIED, said so in the post).

Licenses
- Each quote: survey.md (amt-tools, LilyPond, Riley et al., SynthTab, tabsynth, PyGuitarPro, GAPS, François Leduc, DadaGP, GuitarSet, "Shared license texts") and tools.json `license` of each entry. GuitarSet versions: Zenodo 3371780 1.1.0 `cc-by-4.0`, Zenodo 1422265 1.0.1 `cc-by-nc-4.0`.
- "says it doesn't interpret the GPL": survey.md LilyPond ("this file does not interpret the GPL").
- cstr/tabcnn-onnx row (gap round 2): tools.json `license` (code MIT `MIT License / Copyright (c) 2024-2026 CrispStrobe`, weights card YAML `license: cc-by-4.0` for both ONNX files and for cstr/tabcnn-GGUF, the vanilla card quote, the export README's data sentence), survey.md "TabCNN weights published by others" (the export README "names `zenodo.org/records/3371780`, the v1.1.0 record").
- scorify row (gap round 2): tools.json `license`, survey.md scorify ("`LICENSE` begins "MIT License / Copyright (c) 2026 Aron Homberg"", "`THIRD-PARTY-LICENSES.txt` lists 9 bundled `@tonaljs/*` modules, each "License: MIT"").
- TabCNN + GuitarProFX row (gap round 2): tools.json `license` (code CC0 1.0 root and MIT AMT-Tools folder with their opening lines, weights `cc-by-4.0`, GuitarSet versions, GuitarProFX, DadaGP quote, the training README quote), survey.md "TabCNN weights published by others" (training code paragraph, "EGFxSet's licence was not read (UNVERIFIED)"). "It ran here through amt-tools 0.3.2": trials.md (the training code was read, not run).

Checker's fixes (2026-11-12, independent check of the gap round 2 update. Every count, run and eval id of the three new entries was re-read in the ledgers and logs and matched)
- "another agent" for the gap agent and the second checker: the critic is an agent too, so "a third agent" and "a fourth agent" miscounted.
- "my agents synthesized": INPUTS.md gives S2n's source as "synthesized here", made by the agents, not by me.
- cstr In "resampled to 22050 Hz": the mono WAVs are 44100 Hz (INPUTS.md clip table) and the glue loads them at `sr=22050` (trials.md "How it was called"). It said "at 22050 Hz", which reads as the files' own rate.
- cstr "That Zenodo file has its own entry": replaces "the file under the TabCNN + GuitarProFX entry", which read as if `tabcnn-gpfx.onnx` were the Zenodo file.
- CQT gloss ("a map of how loud each pitch band is over time"): plain words. "with the same settings": survey.md card facts ("the same CQT geometry (sr 22050, hop 512, n_bins 192, bins_per_octave 24, fmin C1 = 32.703 Hz)"). "with no decibels or rescale": the card's "RAW magnitude, no log/norm" (survey.md), against the gpfx steps `amplitude_to_db` and min-max.
- "scales the 44.1 kHz audio so its loudest point is at full volume and then resamples it": plain words for trials.md "peak-normalize at 44.1 kHz, then `librosa.resample`".
- 58,980 "string-and-frame pairs": `samples/tabcnn-published-weights/compare_zenodo-amt_vs_onnx-gpfx.txt` ("identical string cells 58980/58980"), tools.json r0591 ("58,980 of 58,980 string-frame cells"). Frames per clip in the run logs add up to 9,830.
- "gives ... as the command that trains": the README gives the command (trials.md "What (b) `tabcnn.onnx` was trained on"), it doesn't train anything itself.
- "split the work into 6 threads": trials.md ("6 threads in each ONNX run, all allowed only the slot's two cores"), `samples/tabcnn-published-weights/tabcnn_onnx-*.log.txt` (`threads 6`, `Cpus_allowed_list of the threads ['2-3']`).
- First-use glosses moved to the entry that now comes first: "Wall time" from LilyPond to cstr/tabcnn-onnx, "model card" from Riley et al. to cstr/tabcnn-onnx, "npm, the public store for JavaScript packages" from tutts to scorify. Node gloss "which runs JavaScript outside a browser": plain words (trials.md tutts, "Run in Node only, never in a browser").
- scorify "expansions, that is, after extending a partial answer 500,000 times": plain words for the beam search's expanded states (`expandedStates` in `stats`, `samples/scorify/R1a.truthmidi.scorify.out.json`).
- scorify R1b "at the default level": `samples/scorify/scorify_limits.log.txt` (R1b maestro `[]`, R1b amateur lists `up to 9 string attacks in one second`). trials.md "lists no exceeded limit for R1b at level maestro".
- TabCNN + GuitarProFX "by that paper's account": the training data comes from the paper's text, and which fold the file is and what the script's folder held are UNVERIFIED (trials.md "What (a) is", verifier's note). "trains six models, called folds": trials.md ("loops over six folds, trains each on five of six splits ... tests each on one GuitarSet player ... saves under `models/fold-<k>`").
- gtrsnipe step "with the default settings, `--no-refinger` and `--refinger`": for-aaron.md section 4, step 7 (`S2n_pinned_kept.tab` default, `--no-refinger`, `--refinger`). "now with" dropped from the gtrsnipe and FretPath lines, since a reader has no earlier version to compare with.

Picture files
- 579x819 source pages, 70 dpi: Pillow, and trials.md (`-dresolution=70`). Inked rows 19 to 60, columns 68 to 550: measured with Pillow. 996x110, 13,060, 13,190 and 13,826 bytes: written files.

Where the sources looked off
- r0494's wall time: trials.md says "process wall 28.96 s" (from `/usr/bin/time` inside the run), the ledger's `wall_s` is 28.97. Neither is used above.
- tools.json gives r0494 `peak_mb: null`, the ledger has `max_rss_mb` 934.3. Not used above.
- trials.md describes `samples/lilypond/S5dropd.truthmidi.dropD.png` as "one unbroken line of tab that runs off the page edge because of `\cadenzaOn`". The PNG files contradict it: in all three pages the line ends inside the page, and the last group of each log is on it (see "Pictures"). The post follows the files.
- tools.json says the TabCNN + GuitarProFX weights and the cstr exports were "Listed by the verifier" without naming which one. survey.md names verify-docs-guitar-tab, the agent that checked the survey, and the post follows survey.md. (Since gap round 2 those `not_run_reason` fields are `null` and the two entries are in the ran block.)
- Gap round 2: tools.json gives r0674 `peak_mb: null` and `exit_code: null`, the ledger has `max_rss_mb` 1492.5 and exit 0. tools.json also leaves `peak_mb` null for r0631, r0633 and r0635, which the ledger has (150.7, 136.1 and 172.0 MB). None of these figures is used above.
- Gap round 2: trials.md's own "Checks made in this round" counts "41 rows" compared, and the second checker could not reproduce that count from the tables (it found 25 rows with eval ids, all matching). Not used above.
- Whole-post repair (2026-11-12). tutts: "On the exact notes" added, since the chains fragment gives tutts' counts on Basic Pitch's notes (5 of 8 clips with as many notes as tuttut, r0240).
- Whole-post repair: `Beat This!`: this lane's `tools.json` reason "Not run in this lane; used only as the beat tracker inside Guitab (which was not run)." It ran on its own in chords-beats-key (1.1.0, r0397), on a demo page in hosted-apis (r0118) and in chains.
- Whole-post repair: MuseScore and TuxGuitar: this lane's `tools.json` reasons ("no command-line conversion with string assignment was tried here (the web-tab-render lane covers these programs)"; TuxGuitar "the program itself was not opened; no command-line conversion with string assignment was tried here"). MuseScore 3.2.3 ran in web-tab-render (r0120, `S2n.gp5` to MusicXML; MusicXML inputs r0179, r0180). TuxGuitar 1.5.6's file plugins ran in web-tab-render (r0221).
- Whole-post repair: LilyPond licence written GPL-3.0-or-later as in web-tab-render, whose `tools.json` quotes the LICENSE grant (`either version 3 of the License, or (at your option) any later version`). This lane's `tools.json` spdx says `GPL-3.0`, from the COPYING text alone.
