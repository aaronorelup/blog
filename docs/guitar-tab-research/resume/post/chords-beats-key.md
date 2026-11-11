<!-- RUNDOWN -->
- **For chords, beat, key and tuning, 17 of 63 listed tools ran, and none of them reports a capo or how the open strings are tuned.** On S3, 24 seconds of strummed chords I synthesized, seven chord recognizers had the right root note and major or minor for 18.8 to 23.2 of the 24 seconds. On a fingerstyle clip with a capo on fret 2, their labels at the middle of its first four chords were all A, D or B minor, never the G and C shapes played.

<!-- SECTION -->
## Chords, beat, key and tuning

Before an app can line tab up with a song, it needs the song's frame: the chords, the beats and bars, the key and the tuning. My agents listed 63 tools, apps and research projects for that and ran 17 on the cloud box, mostly on clips I synthesized so every answer is known, plus three real GuitarSet recordings that come with their chords and beats written down. On S3, 24 seconds of strummed chords, seven chord recognizers had the right root note (the note a chord is named after) and the right major or minor for 18.8 to 23.2 of the 24 seconds. On S5capo2, a fingerstyle piece with a capo on fret 2, their labels at the middle of its first four chords were all A, D or B minor, never the G and C shapes played, and none of the 17 tools reports a capo. Told that S7flat30, the S3 chords played 30 cents flat (a cent is a hundredth of a fret), was tuned that way, Essentia's chord labels went from 0 to 16.2 of the 24 seconds with the right root. On S2n, the S5capo2 piece without the capo, All-In-One returned 12 bar starts, each within 70 ms of a played one, `Beat This!` and BeatNet's offline mode returned 26 and 27, and madmom returned all 12 one beat late.

<ao-compare cols="1" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/chords-beats-key-s3-chords.webp" alt="Eight rows of labeled boxes over 24 seconds. The top row, played, reads none, G, Em, Am7, D7, G, Em, C, D7, G. Below it are rows for autochord, Chordino, CREMA, Essentia TonalExtractor, lv-chordia, madmom CNN + CRF and madmom deep chroma. The lv-chordia row has the same ten labels as the played row. Chordino's row starts with G where the played row says none, and Essentia's starts with Am there. autochord, Essentia and both madmom rows have Am where the played row has Am7, and D under the first D7. CREMA has D under the first D7 and C/E across the played C and the second D7. The madmom CNN row has a none box near 22 seconds."><figcaption><b>Chord labels on S3</b><span class="ao-meta">seven chord recognizers on 24 seconds of strummed chords I synthesized, under the chords played (r0063, r0088, r0215, r0337, r0398)</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/chords-beats-key-s2n-bar-starts.webp" alt="Five rows of tick marks over 29 seconds, with the first 2.1 seconds shaded as a silent count-in. Tall ticks mark the first beat of a bar. The played row has 48 beats and 12 tall ticks. All-In-One's row has 47 beats with its 12 tall ticks under the played ones. The Beat This! and BeatNet rows each start with 3 beats inside the count-in and have 26 and 27 tall ticks, BeatNet's on every other beat. madmom's row has 48 beats and 12 tall ticks, each one beat after a played bar start."><figcaption><b>Bar starts on S2n</b><span class="ao-meta">beats and bar starts from All-In-One (r0563), <code>Beat This!</code> final0 (r0397), BeatNet offline (r0361) and madmom's bar tracker (r0100) on a 29-second fingerstyle clip I synthesized, under the 48 beats and 12 bar starts played</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/chords-beats-key-s7flat30-tuning.webp" alt="Four rows of labeled boxes over 24 seconds. The played row reads none, G, Em, Am7, D7, G, Em, C, D7, G. Essentia on S3 at its default 440 Hz reads Am, G, Em, Am, D, G, Em, C, a narrow box with no label, then G. On S7flat30 at 440 Hz it reads Am, a sliver of G, then F#, Ebm, Abm, B, Abm, C#, F#, Ebm, B, F#. On S7flat30 told 432.45 Hz it reads Am, G, Em, Am, C, Am, D, G, Em, C, G."><figcaption><b>Telling Essentia the tuning</b><span class="ao-meta">Essentia TonalExtractor's chords on S3 (r0088), and on S7flat30, the same chords 30 cents flat, at its default 440 Hz (r0267) and told 432.45 Hz (r0324)</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Fifteen entries, A to Z. The other two of the 17, chord-extractor 0.1.3 and vamp 1.1.0, are the Python wrappers my agents ran Chordino through, so they're in its entry. Every tool but music21, which reads MIDI, got the clips as 44.1 kHz 16-bit WAV files by path, stereo except the mono R1 clips. The clips:

- S3 is 24 seconds of strummed chords on a steel-string sound, 96 BPM, G major, after a silent count-in bar. S7flat30 is the same notes rendered 30 cents flat.
- S4 is a 39-second band mix in D major at 116 BPM, with drums, bass, strummed guitar and a lead line, after one silent bar and one count-in bar.
- S2n is 29 seconds of one nylon-string guitar playing a tune over a thumb bass, 112 BPM, G major, after a silent count-in bar. S2s is the same notes on a steel-string sound. S6taps is S2s plus drum-kit hits standing in for taps on the guitar body. S5capo2 is the same tab with a capo on fret 2, so it sounds in A major. S5dropd is the piece in Drop D, a tuning with the lowest string lowered from E to D.
- R1a, R1b and R1c are real 28 to 29-second takes from GuitarSet, with its annotations. R1a is an accompaniment in Ab minor at 107 BPM, R1b a single-note solo in C# major at 90 BPM and R1c a bossa nova accompaniment in G major at 119 BPM. Their chord answer is GuitarSet's lead-sheet chord list.
- R2 and R2full are 36 seconds and all 228.5 seconds of a real band song with singing, with no answer key. The artist's page lists `Key: D# Minor, Tempo: 72 bpm`, which my agents didn't check.
- R3a, R3b and R3c are the sound of three real 18-second nylon-string guitar videos, with no answer key.

How I count. A beat counts when it's within 70 ms of a played beat, each played beat used once, and bar starts (the first beat of each bar) are counted the same way. For chords I give the seconds where a tool's label had the right root note and the right major or minor, and "none" over silence counts as right. "Sevenths too" means a played D7 also had to be called D7. On the R1 clips I give seconds with the right root only, because R1a's answer has a chord that's neither major nor minor. Tuning is in cents, hundredths of a fret.

Times are real elapsed seconds on the shared box. It had two slots, each two of its four processor cores reserved for one job. Runs marked "on 2 cores" had a slot. The others ran outside the slots while other agents' jobs shared the box, some limited to one thread (one stream of work at a time), so their times include that sharing. Nothing here cost money beyond the cloud session.

The agent that checked the first round re-ran each of its tools on two to 13 clips and got byte-identical files every time, and re-ran all 509 of that round's comparisons with the answer keys with the same results. All-In-One, tempo-cnn and S-KEY ran in a later round, which also put autochord, CREMA and lv-chordia on S5capo2. The agent that checked that round re-ran its 121 comparisons with the same results, and re-ran S-KEY, All-In-One on S3 and lv-chordia on S5capo2, again byte-identical. It didn't re-run tempo-cnn or the later autochord and CREMA runs, because their TensorFlow versions had left the box's shared cache and a disk rule allowed no new download over 200 MB. Their numbers were checked from the saved files only. Every run, command and output is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/chords-beats-key).

**All-In-One 1.1.0** ([link](https://github.com/mir-aidj/all-in-one)). A music structure analyzer from a 2023 paper by Taejun Kim and Juhan Nam. It first splits the song into four instrument tracks with Demucs, then finds the beats, bar starts, a tempo and the song's sections.

- In: S3, S7flat30, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c and R2full.
- Command or settings: the package's own steps, in the order and with the defaults of `allin1.analyze()`, model `harmonix-all` (eight networks averaged), device `cpu`. Once, on S4, the published command, `allin1 /home/user/gtr/inputs/S4/S4.wav -o <dir> -d cpu --demix-dir <dir>/demix --spec-dir <dir>/spec`. It gave the same tempo, beats and bar starts as the steps above, and one section boundary at 20.70 s instead of 20.69 s. Installing it took NATTEN 0.17.3 built from its PyPI source for the CPU. NATTEN 0.17.4 built too but didn't import on Python 3.9, with `TypeError: unsupported operand type(s) for |: 'type' and '_GenericAlias'`.
- Out: a JSON file with `bpm` (a whole number), `beats` and `downbeats` in seconds on a 0.01 s grid, `beat_positions` and `segments` (start, end, label). No confidence. Within 70 ms: S3 29 of 32 beats and 8 of 8 bar starts, S4 65 of 68 and 17 of 17, S2n 47 of 48 and 12 of 12, S5capo2 46 of 48 and 12 of 12, S5dropd 47 of 48 and 12 of 12. On those five it returned no other beats. On R1a and R1c its beats ran at the played tempo but sat between the played ones, a median 0.267 s early on R1a and 0.223 s late on R1c, so 0 of 53 and 0 of 56 beats and 0 of 14 bar starts on each were within 70 ms. R1b: 25 of 44 beats from 35 returned, 1 of 11 bar starts from 8. Tempo, with the played one in brackets: S3 95 (96), S4 115 (116), S2n 111 (112), R1a 107 (107), R1b 91 (90), R1c 120 (119). Sections on S3: `start` 0 to 2.50, `intro` 2.50 to 23.99, `start` 23.99 to 24.00. On R2full: tempo 71, 264 beats, 66 bar starts and ten sections, `start`, `verse`, `verse`, `chorus`, `verse`, `chorus`, `solo`, `chorus`, `chorus`, `outro`. No clip here has an answer for sections.
- Time: S3 103.5 s on 2 cores, peak memory 1,552.6 MB, of which Demucs 31.4 s, loading the networks 1.2 s and running them 67.6 s (r0521). R2full 777.8 s, peak 2,038.5 MB, of which Demucs 186.9 s and the networks 581.6 s (r0563, 1,854.58 s for its nine clips). The agent that checked the later round re-ran S3 in 142.7 s with more of the box busy, and it wrote a byte-identical file (r0693).
- Takes as a hint: the model (`harmonix-all` or one of `harmonix-fold0` to `harmonix-fold7`) and the device. No tempo range, tempo or meter. Its bar tracker allows 3 or 4 beats per bar, fixed in its code as `beats_per_bar=[3, 4]`.
- Hands off to: its own `allin1.sonify(result)`, which its README says `will mix metronome clicks for beats and downbeats`, a click track on the song. Not run here.

**aubio 0.4.9** ([link](https://github.com/aubio/aubio)). A C library and command-line tools that mark beats and give one tempo. It was already on the box as Ubuntu's `aubio-tools 0.4.9-4.4build1`.

- In: S2n, S2s, S3, S4, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2 and R2full, then R3a, R3b and R3c.
- Command or settings: `python3.12 /usr/bin/aubio tempo <wav>`, `python3.12 /usr/bin/aubio beat <wav>` and `aubiotrack -i <wav>`, with the defaults (buffer 1024, hop 512). Under the box's default Python 3.13 the `aubio` command stopped with `ModuleNotFoundError: No module named 'aubio._aubio'`, so my agents ran it with Python 3.12.
- Out: `aubio tempo` prints one line, `<bpm> bpm`. The two beat commands print one time in seconds per line, and they gave the same number of beats on every clip, at most 8 microseconds apart. No bar starts, no confidence. Beats within 70 ms, from `aubiotrack`: S3 32 of 32 with 40 returned, S4 65 of 68 with 71, S2n 47 of 48 with 51, R1a 22 of 53 with 47, R1b 13 of 44 with 65, R1c 2 of 56 with 49. The first five on S3, where the played beats start at 2.5, 3.125 and 3.75 s:

  ```text
  2.514558
  2.872381
  3.140204
  3.443379
  3.746553
  ```

  Tempo, with the played one in brackets: S3 121.24 (96), S4 117.09 (116), S2n 115.35 (112), R1a 105.59 (107), R1b 155.34 (90), R1c 113.92 (119). R2full: 539 beats, tempo 144.61. R3a, R3b and R3c: 133.22, 150.84 and 125.73.
- Time: 20.8 s for all 13 clips and all three commands, outside the slots, 9.2 s of processor time, peak 64.2 MB (r0200). On S3: `aubio tempo` 0.80 s, `aubio beat` 0.58 s, `aubiotrack` 0.22 s.
- Takes as a hint: buffer size `-B`, hop size `-H` and sample rate `-r`, and for `aubiotrack` the onset method `-O`, threshold `-t`, minimum gap `-M` and silence level `-s`. No tempo range, tempo or meter.
- Hands off to: a plain list of seconds.

**autochord 0.1.4** ([link](https://github.com/cjbayron/autochord)). A Python chord recognizer. It runs the NNLS Chroma plugin (see Chordino below) to measure how much of each of the 12 notes the sound holds, then a TensorFlow network picks one of 25 labels: 12 major chords, 12 minor chords or no chord.

- In: S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2 and R2full. S5capo2 in the later round.
- Command or settings: `autochord.recognize(path, lab_fn=...)`. On its first import it downloaded its model, `chroma-seq-bilstm-crf-v1`, from Google Drive.
- Out: a list of (start, end, label) and a tab-separated `.lab` file with unrounded times. Labels are `<root>:maj`, `<root>:min` and `N`, with roots spelled with flats (`Gb:maj`). No confidence. The last segment can end after the file does, at 36.037 s on the 36.000-second R2. S3: 11 segments, the right root and major or minor for 22.1 of 24 s, sevenths too for 16.8 s. S4: 34.5 of 38.7 s. S2n: 16 segments against 22 played, 20.1 of 29.4 s. S5capo2: 15 segments, 19.0 of 29.4 s. The right root on R1a for 26.3 of 29.2 s, R1b 0.1 of 29.3 s and R1c 17.2 of 28.2 s. Its first S3 chord:

  ```text
  2.2291156462585033	4.96907029478458	G:maj
  ```

- Time: S3 25.9 s on 2 cores, of which loading 7.8 s and recognizing 16.2 s, the other 24 to 39-second clips 10.5 to 11.6 s, R2full 15.7 s, peak 951 to 1,068 MB per clip (r0337, a batch shared with CREMA). S5capo2 9.28 s on 2 cores (r0605).
- Takes as a hint: none. `autochord.recognize(audio_fn, lab_fn)` has no key, tuning or chord-list argument.
- Hands off to: its `.lab` file, which its README says `follows the MIREX chord label format`, the file its own JavaScript chord viewer loads. Not run here.

**`Beat This!` 1.1.0** ([link](https://github.com/CPJKU/beat_this)). A beat and bar tracker from JKU Linz and a 2024 paper, installed from PyPI as `beat-this`.

- In: final0, the larger model, on S3, S7flat30, S4, S2n, S2s, S6taps, R1a, R1b, R1c, R2 and R2full. small0, the smaller one, on seven of them. It resamples to 22050 Hz itself.
- Command or settings: `beat_this.inference.File2Beats(checkpoint_path=<final0|small0>, device="cpu", float16=False, dbn=False)(path)`, its default peak picking.
- Out: two lists of seconds on a 20 ms grid, beats and bar starts, the bar starts always among the beats. No tempo, no confidence. final0, within 70 ms: S3 29 of 32 beats and 8 of 8 bar starts, from 32 beats and 9 bar starts returned, the first three beats inside the silent count-in. S4 65 of 68 and 17 of 17, from 68 and 18. S2n 48 of 48 and 8 of 12, from 54 and 26. R1a 52 of 53 and 13 of 14, from 52 and 13. R1b 28 of 44 and 7 of 11, from 43 and 21. R1c 56 of 56 and 14 of 14, from 56 and 14. small0 on S2n: 23 of 48 and 9 of 12, from 39 and 22. GuitarSet, where the R1 clips come from, is in its training data, and its README says `the results may be unfairly good if you run inference on any file from the training datasets`. R2: 43 beats, a median gap that works out to 71.43 BPM, and 11 bar starts with both models. R2full: 266 beats.
- Time: outside the slots on one thread, with both slots held by other agents' long jobs. final0 4.1 to 6.8 s per 24 to 39-second clip (S3: import 2.1 s, loading the model 0.36 s, running it 2.25 s), R2full 22.1 s. small0 3.0 to 5.4 s, R2full 15.0 s. Peak 625 MB for the batch (r0397).
- Takes as a hint: the model, the device and `dbn`, madmom's bar tracker after the network, which needs madmom and wasn't used. No tempo range, meter or tempo.
- Hands off to: its `.beats` file, where `each line has a time in seconds, a tab, and a beat number (1 = downbeat)`, which its README names for importing into Sonic Visualiser. Not tried here.

**BeatNet 1.1.3** ([link](https://github.com/mjhydri/BeatNet)). A beat and bar tracker built on a small neural network. Offline, madmom's bar tracker reads the network's output for the whole file. Online, a particle filter, a guess-and-update method that only uses what it has already heard, as a live app would, reads it as it goes.

- In: S3, S7flat30, S4, S2n, S2s, S6taps, R1a, R1b, R1c, R2 and R2full. It resamples to 22050 Hz itself.
- Command or settings: `BeatNet(1, mode='offline', inference_model='DBN', plot=[], thread=False, device='cpu').process(path)`, and the same with `mode='online', inference_model='PF'`, with numpy's random seed set to 0 before each. Model 1 of its 3. It ran after a one-line edit to the installed madmom so that it imports on Python 3.11, `from collections import MutableSequence` changed to `from collections.abc import MutableSequence`.
- Out: rows of seconds and a position, on a 20 ms grid. Offline, the position is the beat's number in the bar, 1 for a bar start. Online, 1 is a bar start and 2 any other beat. No tempo or meter field. Offline, within 70 ms: S3 0 of 32 beats and 0 of 8 bar starts, from 38 beats and 10 bar starts. S4 68 of 68 and 17 of 17, from 75 and 19. S2n 48 of 48 and 0 of 12, from 54 and 27, its positions going 1, 2, 1, 2. R1a 30 of 53 and 8 of 14. R1b 27 of 44 and 2 of 11. R1c 0 of 56 and 0 of 14. Online: S3 5 of 32 and 2 of 8, from 30 and 7. S4 64 of 68 and 16 of 17, from 65 and 16. S2n 35 of 48 and 1 of 12, from 36 and 11. Its first offline rows on S3, where the played beats start at 2.5 s and come every 0.625 s:

  ```text
  0.340	4
  0.980	1
  1.580	2
  2.220	3
  2.840	4
  3.440	1
  ```

- Time: outside the slots on one thread. S3, the first clip, 27.6 s (offline 19.9 s, online 3.9 s), the other 24 to 39-second clips 6.2 to 11.0 s, R2full 68.4 s (offline 5.6 s, online 57.4 s). Peak 802 MB for the batch (r0361).
- Takes as a hint: the model (1 to 3), the mode, the method and the device. No tempo range or meter. The offline bar tracker allows 2, 3 or 4 beats per bar, fixed in its code.
- Hands off to: its offline mode is itself a chain, madmom's bar tracker reading BeatNet's network, which its README describes as `we added madmom's DBN beat/downbeat inference model for the offline usages`.

**Chordino, NNLS Chroma and NNLS Tuning** ([link](https://github.com/c4dm/nnls-chroma)), run through **chord-extractor 0.1.3** ([link](https://github.com/ohollo/chord-extractor)) and **vamp 1.1.0** ([link](https://github.com/c4dm/vampy-host)). Three plugins by Matthias Mauch in the Vamp format, a plugin format for audio analysis programs. Chordino names chords, NNLS Chroma measures the 12 notes and Tuning measures the concert pitch, the frequency in Hz the music treats as A (440 Hz is standard). chord-extractor ships a compiled copy of the plugins, and the `vamp` module hosts them in Python.

- In: the same 13 clips as aubio, loaded by chord-extractor with `librosa.load(file)` at 22050 Hz mono, then R3a, R3b and R3c.
- Command or settings: `Chordino()` with chord-extractor's defaults (useNNLS=1, rollon=1, tuningmode=0 global, whitening=1, s=0.7, boostn=0.1), the same with tuningmode=1 local, and `vamp.collect(data, rate, 'nnls-chroma:tuning')`. The install was `uv pip install --no-build-isolation chord-extractor==0.1.3` after numpy, setuptools and wheel, and it needed `setuptools<81` for `pkg_resources`.
- Out: a list of `ChordChange(chord, timestamp)`, a label and a start time with no end time and no confidence, on a 0.0929 s grid. The labels go past major and minor, for example `Am7`, `D7`, `Abmaj7`, `Bbm7b5/Ab`, `F#6` and `Bdim`. Every clip's list started with `N` at 0.372 s. S3:

  ```text
  0.372 N, 0.464 G, 4.923 Em, 7.523 Am7, 9.938 D7, 12.446 G, 14.954 Em, 17.461 C, 19.226 D7, 19.876 G
  ```

  That's the played sequence, with G starting over the silent count-in. The right root and major or minor, sevenths too, for 21.1 of 24 s. S4 34.3 of 38.7 s. S2n 19 segments against 22 played, 22.5 of 29.4 s. S5capo2 22.9 of 29.4 s. The right root on R1a for 27.6 of 29.2 s, R1b 15.4 of 29.3 s and R1c 11.5 of 28.2 s. Local tuning mode gave the same chords as global on S3. The Tuning plugin returned the label `431.9 Hz` for S7flat30, 431.863 Hz unrounded, which is 32.316 cents flat where 30 were played, and 0.167 cents flat for S3, played at 0.
- Time: 97.5 s for the 13 clips and all three calls, outside the slots, 60.5 s of processor time, peak 389 MB (r0215). S3, the first clip, 25.9 s, the other 24 to 39-second clips 3.3 to 6.4 s, R2full 16.6 s. The agent that checked the first round traced most of the first clip's extra time to numba, a compiler librosa uses, compiling once per new Python environment: S3 took 3.3 s with numba's cache files and 17.9 s without them (r0468).
- Takes as a hint: `use_nnls`, `roll_on`, `tuning_mode` (global or local), `spectral_whitening`, `spectral_shape`, `boost_n_likelihood` and any other plugin setting by name, plus a chord list file, `chord.dict`. No key, capo or tuning input. The plugin measures the tuning itself.
- Hands off to: NNLS Chroma's 24-value `bothchroma` output is what autochord runs and feeds its network. The Tuning plugin's value in Hz is the kind of number Essentia's key finder takes as `tuningFrequency`, a chain my agents didn't run.

**CREMA 0.2.0** ([link](https://github.com/bmcfee/crema)). Brian McFee's chord model package. It returns a JAMS document, a JSON format for music annotations, with a confidence for each chord.

- In: S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2 and R2full. S5capo2 in the later round.
- Command or settings: `crema.analyze.analyze(filename=path)`, in the same TensorFlow 2.12.1 environment as autochord.
- Out: a JAMS `chord` annotation with a time, duration, value and confidence for each chord. Labels include `A:min7`, `C:maj/3` (C major with its third, E, in the bass), `B:maj7`, `A#:7`, `D:dim7` and `D#:min/5`. Confidences ran from 0.21 to 0.97 over the nine clips. S3, 9 segments:

  ```text
  N 0-2.32, G:maj, E:min, A:min7, D:maj, G:maj, E:min, C:maj/3, G:maj
  ```

  The right root and major or minor for 22.3 of 24 s, sevenths too for 19.9 s. S4: 38.0 of 38.7 s. S2n: 7 segments against 22 played, 19.2 of 29.4 s. S5capo2: 7 segments, 18.7 of 29.4 s. The right root on R1a for 27.5 of 29.2 s, R1b 11.9 of 29.3 s and R1c 16.8 of 28.2 s.
- Time: S3 14.4 s on 2 cores, 10.4 s of it analyzing, the other clips 7.1 to 8.0 s, R2full 8.5 s, peak 696 to 760 MB per clip (r0337, shared with autochord). S5capo2 6.95 s on 2 cores (r0605).
- Takes as a hint: none. `crema.analyze.analyze(filename, y, sr)` has no key, tuning or chord-list argument.
- Hands off to: JAMS, the same container tempo-cnn writes with `--jams`.

**DeepRhythm 0.0.13** ([link](https://github.com/bleugreen/deeprhythm)). A neural network that gives one tempo for a whole file, with a confidence.

- In: S3, S7flat30, S4, S2n, S2s, R1a, R1b, R1c, R2 and R2full.
- Command or settings: `DeepRhythmPredictor(device="cpu", quiet=True).predict(path, include_confidence=True)`, with its weights, `deeprhythm-0.7.pth`, fetched by my agents from raw.githubusercontent.com.
- Out: one tempo, whole numbers in these runs, and a confidence, the largest of its per-tempo probabilities averaged over the 8-second pieces it cuts the audio into. No beat times. Tempo, with the played one in brackets, then the confidence: S3 95 (96) 0.648, S7flat30 95 (96) 0.612, S4 116 (116) 0.788, S2n 112 (112) 0.731, S2s 112 (112), R1a 107 (107) 0.967, R1b 89 (90) 0.457, R1c 120 (119) 0.467. R2 143 at 0.537 and R2full 143 at 0.619, where the artist's page lists 72.
- Time: outside the slots on one thread. S3, the first clip, 26.7 s (import 6.1 s, predicting 18.8 s), the others 4.8 to 6.6 s, R2full 7.8 s. Peak 773 MB for the batch (r0351).
- Takes as a hint: none besides `include_confidence`. Its batch tool takes a device and a confidence flag.
- Hands off to: one number per file.

**Essentia 2.1-beta6-dev** ([link](https://github.com/MTG/essentia)). The Music Technology Group's C++ audio library with Python bindings, from Universitat Pompeu Fabra, installed as `essentia-tensorflow==2.1b6.dev1389`. My agents ran its beat tracker, its key finder with five key profiles, its tuning meter, the chord labels from `TonalExtractor` and `TempoCNN` with two small tempo models.

- In: the same 13 clips as aubio, plus R3a, R3b and R3c, loaded at 44100 Hz, and at 11025 Hz for TempoCNN.
- Command or settings: `RhythmExtractor2013` with the methods `multifeature` and `degara`, `KeyExtractor` with the profiles `bgate`, `krumhansl`, `temperley`, `edma` and `shaath`, `TuningFrequencyExtractor`, `TonalExtractor(frameSize=4096, hopSize=2048, tuningFrequency=440)`, and `TempoCNN` with `deeptemp-k16-3.pb` and `deeptemp-k4-3.pb`. Then `KeyExtractor` and `TonalExtractor` again on S7flat30 and S3 with `tuningFrequency=432.45`, which is 440 Hz lowered by 30 cents.
- Out: a tempo, beat times and a confidence (from `multifeature` only), a key with major or minor and a strength, a tuning in Hz, and one chord label per 46.4 ms from 24 major and minor chords. There's no "no chord" label, so S3's silent count-in came out `Am`. No bar starts.
  - Beats within 70 ms, `multifeature`: S3 30 of 32 from 37, S4 67 of 68 from 74, S2n 48 of 48 from 54, R1a 51 of 53 from 51, R1b 37 of 44 from 87, R1c 3 of 56 from 55.
  - Tempo, with the played one in brackets, `multifeature`: S3 95.557 (96), S4 115.605 (116), S2n 111.807 (112), R1a 106.992 (107), R1b 178.206 (90), R1c 117.309 (119). TempoCNN, the two models: S3 96 and 96, S4 116 and 116, S2n 111 and 112, R1a 108 and 108, R1b 92 and 90, R1c 120 and 120.
  - Key: 47 of the 55 profile and clip pairs named the played key. All five profiles said G major on S3, S7flat30, S2n, S2s, S5dropd, S6taps and R1c, D major on S4 and A major on S5capo2. On R1a, played in Ab minor, four said F# major and `edma` said C# major. On R1b, played in C# major, `bgate`, `temperley` and `edma` said C# minor. Told 432.45 Hz, all five still said G major on S7flat30 and S3. Its key finder's `averageDetuningCorrection` is on by default.
  - Tuning: S7flat30 31 cents flat, where 30 were played, and S3 2 cents sharp. On R1a its last frame said 50 cents sharp, where the answer file states 0 without saying it was measured. Its reference page gives the range as `between -35 to 65 cents`.
  - Chords: S3 10 segments, the right root and major or minor for 18.8 of 24 s, sevenths too for 14.8 s. On S7flat30 at 440 Hz, 0 of 24 s, with its roots a semitone below S3's except one B where S3's said Am. Told 432.45 Hz, 16.2 of 24 s, sevenths too for 14.3 s. S4: 33 segments against 18 played, 28.1 of 38.7 s. S2n: 23 segments, 19.6 of 29.4 s. S5capo2: 29 segments, 16.7 of 29.4 s. The right root on R1a for 19.5 of 29.2 s, R1b 11.5 of 29.3 s and R1c 7.1 of 28.2 s.
- Time: S3 2.35 s on 2 cores, peak 274 MB (r0088), S4 3.17 s (r0097), S7flat30 2.65 s (r0148). The other clips ran outside the slots, 4.9 to 8.8 s per 24 to 39-second clip, and R2full 25.8 s with 9.2 s of processor time and a 394 MB peak (r0267). The 432.45 Hz calls took 2.4 s per clip (r0324).
- Takes as a hint: `RhythmExtractor2013(minTempo=40, maxTempo=208, method)`, `KeyExtractor(profileType, tuningFrequency=440, pcpThreshold, hpcpSize, minFrequency=25, maxFrequency=3500, averageDetuningCorrection=True, ...)` and `TonalExtractor(frameSize, hopSize, tuningFrequency)`. The tuning frequency is the hint my agents tried.
- Hands off to: its own `TuningFrequency` gives a value in Hz that `KeyExtractor` takes as `tuningFrequency`, a chain its reference pages describe. The 432.45 here came from the known 30 cents, not from the tuning meter.

**librosa 1.0.0** ([link](https://github.com/librosa/librosa)). A Python audio library with a beat tracker, a tempo estimate and a tuning estimate. It has no key finder, so my agents wrote one for this test, which the record calls the lane-written baseline: the average of librosa's 12-note chroma over the whole file, compared with the 24 major and minor key profiles of Krumhansl and Kessler, the closest one being the answer.

- In: the same 13 clips as aubio, plus R3a, R3b and R3c, loaded with `librosa.load(path, sr=22050, mono=True)`.
- Command or settings: `librosa.beat.beat_track(y=y, sr=sr, units='time')`, `librosa.feature.tempo(y=y, sr=sr)` and `librosa.estimate_tuning(y=y, sr=sr)` with their defaults, and the key baseline.
- Out: a tempo and beat times in seconds, and a tuning offset in whole cents. No bar starts, no confidence. Beats within 70 ms: S3 25 of 32 from 29, S4 65 of 68 from 65, S2n 45 of 48 from 45, R1a 49 of 53 from 52, R1b 26 of 44 from 45, R1c 4 of 56 from 52. Tempo, with the played one in brackets: S3 95.703 (96), S4 117.454 (116), S2n 112.347 (112), R1a 107.666 (107), R1b 95.703 (90), R1c 117.454 (119). Tuning: S7flat30 31 cents flat, where 30 were played, S3 1 sharp and R1a 13 sharp. The key baseline named the played key on 10 of 11 clips, all but R1b, where it said C# minor for C# major. On R2 and R2full it said Eb minor, and the artist's page lists D# minor, the same notes spelled with sharps.
- Time: S3 16.05 s on 2 cores, peak 343 MB, 12.2 s of it in `beat_track` (r0069). The agent that checked the first round traced the extra to numba compiling librosa's functions once per new environment, 3.1 s with its cache files and 11.5 s without (r0468). The other first-round clips took 3.12 to 3.78 s each on 2 cores. R1b, R1c, R2 and R2full ran outside the slots, R2full in 23.1 s with a 625 MB peak (r0267).
- Takes as a hint: `beat_track(bpm=...)`, which fixes the tempo and sets `start_bpm` aside, plus `start_bpm`, `tightness` and `prior`. `chroma_cqt(tuning=...)` takes a tuning offset, and `estimate_tuning(resolution, bins_per_octave)`.
- Hands off to: `librosa.load` gives the decoded audio array that the `vamp` host takes, which is how chord-extractor feeds Chordino.

**lv-chordia 1.1.0** ([link](https://github.com/music-x-lab/ISMIR2019-Large-Vocabulary-Chord-Recognition)). An inference-only PyPI package of the large-vocabulary chord model from Music X Lab's ISMIR 2019 paper: five networks, then a decoder that can only output chords from a list.

- In: S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2 and R2full. S5capo2 in the later round.
- Command or settings: `lv_chordia.chord_recognition.chord_recognition(path, chord_dict_name=<dict>)` with `submission`, the package default, and `ismir2017`.
- Out: a JSON list of `{"start_time", "end_time", "chord"}` with times to 0.01 s and labels with flats and inversions, like `Bb:7`, `B:maj/3` and `Bb:maj/b7`. No confidence. S3, the same with both chord lists:

  ```text
  N 0-2.48, G:maj 2.48-5.02, E:min 5.02-7.52, A:min7 7.52-10.03, D:7 10.03-12.54, G:maj, E:min, C:maj, D:7, G:maj 20.04-24.01
  ```

  That's the played sequence, the right root and major or minor, sevenths too, for 23.2 of 24 s. S7flat30: 11 segments, 21.1 of 24 s, sevenths too for 17.9 s. S4: 38.3 of 38.7 s. S2n: 23 segments against 22 played, 28.0 of 29.4 s. S5capo2: 23 segments, 27.8 of 29.4 s. The right root on R1a for 28.3 of 29.2 s. R1b, the single-note solo, came back as one segment, `N` from 0 to 29.35 s, so 0 s. R1c 19.6 of 28.2 s with `submission` and 21.1 with `ismir2017`.
- Time: outside the slots on one thread. S3, the first clip, 30.3 s (`submission` 25.1 s, then `ismir2017` 2.1 s on the same file), the others 9.2 to 13.0 s, R2full 68.4 s. Peak 1,084 MB for the batch (r0398). S5capo2 9.14 s on 2 cores (r0605).
- Takes as a hint: `chord_dict_name`, one of `submission`, `ismir2017` or `full`. The chord lists are plain text files that limit what the decoder can output. No key, tuning or capo argument.
- Hands off to: JSON whose labels its PyPI page calls `Chord label in JAMS format`.

**madmom 0.16.1** ([link](https://github.com/CPJKU/madmom)). A Python audio library from JKU Linz with trained models for beats, bar starts, tempo, two chord recognizers and a key finder.

- In: the same 13 clips as aubio.
- Command or settings: `RNNBeatProcessor` into `DBNBeatTrackingProcessor(fps=100)`, `TempoEstimationProcessor(fps=100)`, `RNNDownBeatProcessor` into `DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=100)`, `CNNChordFeatureProcessor` into `CRFChordRecognitionProcessor`, `DeepChromaProcessor` into `DeepChromaChordRecognitionProcessor`, and `CNNKeyRecognitionProcessor`. Building the GitHub version was refused by the session's permission policy (`Code from External`). PyPI's 0.16.1 built on Python 3.11 but didn't import, with `ImportError: cannot import name 'MutableSequence' from 'collections'`. It ran on Python 3.9 with numpy 1.23.5.
- Out: beats on a 10 ms grid, bar tracker rows of seconds and position in the bar, tempo candidates with strengths, chords on a 0.1 s grid from 25 labels (12 major, 12 minor, no chord), and a key with a probability for each of the 24 keys. No confidence per beat or chord.
  - Beats within 70 ms: S3 30 of 32 from 37, S4 68 of 68 from 74, S2n 48 of 48 from 55, R1a 52 of 53 from 104, R1b 39 of 44 from 45, R1c 0 of 56 from 56.
  - Bar starts within 70 ms: S3 8 of 8, S4 17 of 17 and S6taps 12 of 12. On S2n, S2s, S5capo2 and S5dropd, 0 of 12. On S2n each of its 12 came one beat late, 0.536 to 0.544 s after a played bar start. R1a 0 of 14, R1b 0 of 11, R1c 2 of 14.
  - Tempo, the strongest candidate, with the played one in brackets: S3 95.238 (96), S4 115.385 (116), S2n 111.111 (112), R1a 107.143 (107), R1b 181.818 (90), R1c 120.000 (119). R2 and R2full 72.289, where the artist's page lists 72.
  - Chords, the CNN recognizer and then the deep chroma one, the right root and major or minor: S3 20.55 and 22.05 of 24 s, sevenths too 15.35 and 17.05 s. S4 37.2 and 36.3 of 38.7 s. S2n 25.5 and 25.8 of 29.4 s. S5capo2 21.2 and 25.2 of 29.4 s. The right root on R1a for 27.9 and 27.8 of 29.2 s, R1b 2.4 and 4.4 of 29.3 s, and R1c 16.9 and 15.7 of 28.2 s.
  - Key: the played key on 7 of 11 clips. The others were D major on S2n, played in G major, with D major 0.384, E minor 0.306 and G major 0.158 as its top three, E major on S5capo2 (A major), and F# major on R1a (Ab minor) and R1b (C# major).
- Time: S3 20.9 s on 2 cores, peak 212 MB (r0063), and S4 35.1 s, 316 MB (r0072). R2full 190.2 s with 146.9 s of processor time and a 1,383.7 MB peak (r0316). Inside S3's run: beats 3.61 s, the bar network 3.41 s, CNN chords 10.23 s, deep chroma chords 0.06 s, key 2.21 s.
- Takes as a hint: `DBNBeatTrackingProcessor(min_bpm, max_bpm, num_tempi, transition_lambda, observation_lambda, correct, threshold, fps)`, `DBNDownBeatTrackingProcessor(beats_per_bar, min_bpm, max_bpm, ...)` with the meter as a list of allowed beats per bar, `TempoEstimationProcessor(method, min_bpm, max_bpm, act_smooth, hist_smooth, fps)` and `DeepChromaProcessor(fmin=65, fmax=2100, unique_filters=True, models=None)`. The chord and key processors take no key, tuning or capo input.
- Hands off to: its bar tracker is the last step inside All-In-One and BeatNet's offline mode, and an option in `Beat This!`.

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A Python toolkit for written music. Its key finders read notes, not audio.

- In: for 11 clips, two note lists as MIDI files (a list of notes with start times): the exact notes from my test set, and the notes Basic Pitch 0.4.0 wrote from each clip's audio in my audio-to-notes agents' run r0234. Drum parts were dropped, which mattered only for S4.
- Command or settings: `Stream.analyze(<method>)` with `key` (Aarden-Essen's weights in 10.5.2), `key.krumhansl`, `key.simple`, `key.bellman` and `key.temperley`.
- Out: a `music21.key.Key` (tonic and mode) with a `correlationCoefficient` and the other 23 keys ranked. 76 of the 110 results named the played key, 35 of 55 from the exact notes and 41 of 55 from Basic Pitch's notes. On S3's exact notes, four methods said E minor, which has the same notes as G major, and `key.bellman` said C major. On Basic Pitch's S3 notes, three said G major. All ten said D major on S4, G major on S2n, S5dropd and R1c, and A major on S5capo2. None said Ab minor on R1a or C# major on R1b. The pitch bend that makes S7flat30 flat isn't read from MIDI, so its exact notes gave the same keys as S3's.
- Time: 13.2 s for all 110 results, outside the slots, 4.3 s of processor time, peak 70 MB (r0237), 0.29 to 1.14 s per MIDI file.
- Takes as a hint: the method, and a stream can be cut to a time range or one part first. No tuning input.
- Hands off to: nothing further. It's the end of a chain that ran, Basic Pitch's MIDI into music21's key finder.

**S-KEY**, through the ONNX export `aaatmy/skey-onnx` ([link](https://github.com/deezer/skey), [ONNX export](https://huggingface.co/aaatmy/skey-onnx)). Deezer's model that names one key for a whole recording, from an ICASSP 2025 paper. Deezer's own code installs from its repository, so my agents ran the same weights through a community conversion to ONNX, a portable model format, with onnxruntime 1.31.1 and 83 lines of their own glue, `scripts/skey_onnx_run.py`. The conversion's card calls it `a community conversion of the upstream checkpoint, not a newly trained model or an official Deezer release`.

- In: S3, S7flat30, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c, R2 and R2full, decoded with soundfile, resampled to 22050 Hz with `torchaudio.transforms.Resample(orig_freq=44100, new_freq=22050)` and averaged to mono.
- Command or settings: the glue follows Deezer's `skey/key_detection.py`. The float32 audio goes into the graph, and the label is the one with the largest of its 24 outputs.
- Out: 24 numbers, one per key, softmax included, for one key per file. The card claims no calibrated confidence for them. The played key on 8 of the 9 clips that have one: G major on S3, its top value 0.815, G major on S7flat30, 0.774, D major on S4, G major on S2n, A major on S5capo2, G major on S5dropd and G major on R1c. R1b C# major at 0.258, with C# minor next at 0.244. R1a F# major at 0.571, with G# minor next at 0.114, which is the played Ab minor spelled with a sharp. R2 and R2full: D# minor, the key the artist's page lists.
- Time: 22.29 s for all 11 clips on 2 cores, 28.5 s of processor time, peak 1,158.8 MB (r0588). 1.6 to 2.0 s per clip, S3 first at 3.56 s, R2full 2.65 s. The network itself took 0.05 to 0.30 s per clip and 0.48 s on R2full.
- Takes as a hint: none. The graph takes only the audio.
- Hands off to: the card says the same file runs in a browser, `Browser inference uses ONNX Runtime Web WASM CPU`. Not run here.

**tempo-cnn 0.0.8** ([link](https://github.com/hendriks73/tempo-cnn)). Hendrik Schreiber's tempo networks, installed as `tempocnn`: one tempo per file from each of eight models, and a meter model that guesses the beats per bar. The package has no key model.

- In: S3, S7flat30, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c and R2full.
- Command or settings: `read_features(file)` once, then for each of `fcn` (the `tempo` command's default), `cnn`, `ismir2018`, `fma2018`, `deeptemp`, `deepsquare`, `shallowtemp` and `mazurka`, `TempoClassifier(model).estimate_tempo(features, interpolate=False)`, which is what `tempo -m <model> -i <file>` prints. Then `MeterClassifier('fma2018-meter').estimate_meter(read_features(file, frames=512))`, what `meter -i <file>` prints.
- Out: one tempo per model, whole numbers except from `fma2018`, a MIREX pair of two tempos and a strength, and a meter number. No beat times. `fcn`, with the played tempo in brackets: S3 96 (96), S4 116 (116), S2n 112 (112), S5capo2 112 (112), S5dropd 112 (112), R1a 108 (107), R1b 90 (90), R1c 119 (119). Over the eight models and the nine clips with an answer, 48 of the 72 tempos were the played one to the whole BPM. `mazurka` gave 190 on S3, 211 on R1a and 171 on R1b, and `fma2018` gave 192.82 on S3. The meter model said 4 on S4, S2n, S5capo2 and S5dropd, 3 on S3, S7flat30 and R1c, 9 on R1a and 5 on R1b, and all nine are in 4/4. R2full: 72 from `fcn`, `cnn`, `ismir2018` and `deepsquare`, and meter 9, where the artist's page lists 72 bpm and `4/4 Swing`.
- Time: 140.95 s for the ten clips on 2 cores, 147.4 s of processor time, peak 1,249.9 MB (r0584). S3, the first, 26.98 s, 16.49 s of it reading the audio, the others 11.1 to 12.3 s, R2full 20.58 s. Each model took 0.05 to 0.46 s to load and 0.11 to 1.31 s to run on a 24 to 39-second clip.
- Takes as a hint: the model and `interpolate`. No tempo range or tempo.
- Hands off to: plain numbers, or JAMS with `--jams`, the container CREMA writes.

With a capo, the first four chords of S5capo2 are played as G and C shapes and sound as A and D. These are the labels each chord recognizer gave at the middle of each of those four chords, written short:

| | 3.21 s | 4.82 s | 5.89 s | 6.96 s |
|---|---|---|---|---|
| Shape played | G | C | G | C |
| Sounds as | A | D | A | D |
| autochord | A | D | D | D |
| Chordino | A | D | D | D |
| CREMA | A | D | D | D |
| Essentia | A | Bm | A | D |
| lv-chordia | A | D | A | D |
| madmom CNN | A | D | D | D |
| madmom deep chroma | A | D | A | D |

None of the 17 tools names an open-string tuning either. My agents counted the lowest notes in Basic Pitch's MIDI for S2n, S5capo2 and S5dropd instead. Each of the three holds one C1 that wasn't played. Above it, S2n's lowest note is G2 and S5capo2's is A2. S5dropd's holds 4 notes at D2, the low D that Drop D adds below standard tuning's lowest string, E2, and the exact notes hold the same 4, which start 12 to 24 ms earlier.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Of the 63 tools, apps and research projects on the list, 46 didn't run here. Two limits come up again and again. The session's permission policy refused running code from cloned repositories, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. And hosted services need an account or a key, so they and the consumer apps were left to my other agents. Where my agents wrote me steps to run one myself, the section number points into [`for-aaron.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/chords-beats-key/for-aaron.md). It also has steps for four tools that did run: Chordino in Sonic Visualiser (section 1), Deezer's own S-KEY code (section 3), a GPU timing of All-In-One (section 5) and tempo-cnn on Windows (section 6).

- **ACR_seq2seq.** An ICASSP 2026 chord paper's repository with no checkpoints in it, so nothing to run. No steps.
- **BACHI.** Chord recognition from written notes, not audio. Its files weren't read. No steps.
- **Basic Pitch.** My audio-to-notes agents ran it (their run r0234). Here my agents only read its MIDI files, for music21 and the lowest-note count. No steps.
- **BEAST.** An evaluation script and a Google Drive model, with no documented way to run it on new audio. No steps.
- **Beat Transformer.** Repository code that first splits the song with Spleeter, and running repository code was refused here twice, so it wasn't attempted. Steps for me: section 8, its Google Colab notebook.
- **BeatNet+.** Added by the agent that checked the survey. No run was attempted. No steps.
- **BMACE.** A paper, with no code found. No steps.
- **BTC.** Only a GitHub repository, no package. My agents cloned it, built its environment and wrote `scripts/btc_run.py`, and then the run was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. The clone was deleted. Steps for me: section 2.
- **Capo, the Mac and iOS app.** A consumer app, left to my apps agents. No steps.
- **Chord ai.** Named in search results only and left to my apps agents. No steps.
- **Chord Recognition with Deep Learning (Pierre Mackenzie).** An arXiv paper with no code link in its abstract. No steps.
- **ChordCoT.** Its repository is a placeholder, and its README says `Note: The code is currently being organized and cleaned up. Updates will be pushed soon.` No steps.
- **ChordFormer.** A paper, with no code found. No steps.
- **Chordify.** Named in search results only and left to my apps agents. No steps.
- **ChordMini.** The full app needs Firebase and Gemini keys. No steps.
- **Cyanite.** Named in search results only and left to my apps agents. No steps.
- **Demucs.** Not run on its own here, since my source-separation agents covered it. It did run inside every All-In-One call. No steps.
- **essentia.js.** A browser library, left to my browser-audio agents. No steps.
- **GetSongBPM API.** Per a search summary it looks tempo and key up by song title instead of listening to audio, and its page answered HTTP 403 to my agents. No steps.
- **Guitar open-string tuning classifier (Hulme et al.).** Repository code with TensorFlow models on Google Drive and no license file, not attempted. A later search of the web, arXiv, Hugging Face and PyPI for any open-string tuning or capo detector from audio with published weights or a package found none. Steps for me: section 9.
- **Harmony Transformer v1 and v2.** Training scripts only, no released weights. No steps.
- **InceptionKeyNet.** Found by the agent that checked the survey and not looked at in depth. No steps.
- **Jangdan as Downbeats.** A paper on traditional Korean music, with no code link on its author page. No steps.
- **key-cnn.** Added by the agent that checked the survey. No run was attempted. No steps.
- **Klangio.** A hosted service that needs an account, left to my hosted-services agents. No steps.
- **libKeyFinder and keyfinder-cli.** No Ubuntu, Debian or conda-forge package, and PyPI's `keyfinder` needs the library installed first. A build of a cloned 2.2.8 was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. Steps for me: section 4, through Mixxx or a build in WSL.
- **Mixxx.** A desktop DJ program whose key analysis can use libKeyFinder, a step for me on Windows. Steps for me: section 4.
- **Music.AI (Moises).** A hosted service that needs an account, left to my hosted-services agents. No steps.
- **Omnizart, chord mode.** The agent that checked the first round tried a chord-only install, and it was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. A later try with the 0.5.0 wheel on Python 3.8 stopped while building madmom, with `madmom/ml/nn/layers.c:38:6: error: #error Cython requires Python 3.9+.`, from a file an earlier build had left in the shared cache. Steps for me: section 7, its Docker image.
- **pyace.** Not looked at further. No steps.
- **QM Vamp Plugins (key finder, beat and bar trackers).** No package for Linux, the plugin download site reset the connection, and the Linux plugin pack holds them only inside a desktop installer program, which wasn't run on a box with no screen. Steps for me: section 1, Sonic Visualiser with the Vamp Plugin Pack on Windows.
- **realtime-bpm-analyzer.** A browser library, left to my browser-audio agents. No steps.
- **Replicate-hosted All-In-One and chord models.** Hosted, with an account needed, left to my hosted-services agents. No steps.
- **Rochester ECE 477, "Guitar Tuning Detection" (2023).** A student report with no code link in its text. No steps.
- **Rochester ECE 477, "Guitar Tuning Identification" (2019).** Not read. No steps.
- **Sonic Annotator.** No Ubuntu package, and cloning its repository asked for a login. No steps.
- **Sonic Visualiser.** A desktop program, a step for me on Windows. Steps for me: section 1.
- **Spleeter.** Left to my source-separation agents. No steps.
- **Spotify Web API, audio features and audio analysis.** Closed to new apps since 2024-11-27, per Spotify's announcement. No steps.
- **STONE.** Added by the agent that checked the survey. No run was attempted. No steps.
- **Tunebat.** Named in search results only and left to my apps agents. No steps.
- **Vamp Plugin Pack.** The Windows installer for the plugins, a step for me. Steps for me: section 1.
- **Vamp plugin SDK.** Only its Ubuntu package listing was checked. No steps.
- **WaveBeat.** Its checkpoint folder holds only a note saying to download one. No steps.
- **web-audio-beat-detector.** A browser library, left to my browser-audio agents. No steps.
- **Yamaha Chord Tracker.** Named in search results only and left to my apps agents. No steps.

The list also names 10 datasets, 3 file formats and one browser standard, with nothing to run. GuitarSet is where R1a, R1b and R1c come from.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| All-In-One | MIT | MIT, per the Hugging Face card's `license: mit` ([source](https://huggingface.co/taejunkim/allinone/raw/main/README.md)) | the Harmonix Set, per its README, `The models are trained on the Harmonix Set with 8-fold cross-validation.` ([source](https://raw.githubusercontent.com/mir-aidj/all-in-one/main/README.md)). Its annotations are MIT and its audio isn't distributed. Each call also runs Demucs, whose weights' license is in my source-separation agents' record |
| aubio | GPL-3.0-or-later, `c) You must license the entire work, as a whole, under this License to anyone who comes into possession of a copy. This License will therefore apply, along with any applicable section 7 additional terms, to the whole of the work, and all its parts, regardless of how they are packaged.` ([source](https://raw.githubusercontent.com/aubio/aubio/master/COPYING)) | none | none |
| autochord | Apache-2.0 in the repository's LICENSE, MIT in its PyPI classifier. It bundles the NNLS Chroma plugin, GPL-2.0-or-later (see Chordino) | downloaded from Google Drive, with no license statement found | McGill Billboard chord annotations, CC0, read by its training code from `data/McGill-Billboard`. Their audio isn't distributed |
| `Beat This!` | MIT | MIT, with the README's note `Note that some of the training files are fully copyrighted or under limited Creative Commons licenses, and it is up to the user to assess whether this may impact their use case.` ([source](https://raw.githubusercontent.com/CPJKU/beat_this/main/README.md)) | annotations of 16 datasets, GuitarSet (CC BY 4.0) among them. Most of their licenses weren't read, and the RWC page didn't load |
| BeatNet | CC BY 4.0 in the repository's LICENSE file. PyPI 1.1.3 lists no license | in the repository, with no separate statement | GTZAN, Ballroom and Rock Corpus, one per weight file per its README. Their licenses weren't read |
| chord-extractor | GPL-2.0, `b) You must cause any work that you distribute or publish, that in whole or in part contains or is derived from the Program or any part thereof, to be licensed as a whole at no charge to all third parties under the terms of this License.` ([source](https://raw.githubusercontent.com/ohollo/chord-extractor/master/LICENSE)). It ships the compiled Chordino | none | none |
| Chordino, NNLS Chroma and Tuning | GPL-2.0-or-later. For copies of the compiled plugin, `You may copy and distribute the Program (or a work based on it, under Section 2) in object code or executable form under the terms of Sections 1 and 2 above provided that you also do one of the following: a) Accompany it with the complete corresponding machine-readable source code, ...` ([source](https://raw.githubusercontent.com/c4dm/nnls-chroma/master/COPYING)) | none, its chord templates are built in | none stated |
| CREMA | BSD-2-Clause in LICENSE.md, ISC on PyPI | inside the package, with no separate license found | not read |
| DeepRhythm | AGPL-3.0, whose section 13 says `Notwithstanding any other provision of this License, if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network (if your version supports such interaction) an opportunity to receive the Corresponding Source of your version by providing access to the Corresponding Source from a network server at no charge, through some standard or customary means of facilitating copying of software.` ([source](https://raw.githubusercontent.com/bleugreen/deeprhythm/main/LICENSE)) | `deeprhythm-0.7.pth` comes from the same AGPL repository, the only license text found for it | not stated in its README |
| Essentia | AGPL-3.0 with the same section 13 ([source](https://raw.githubusercontent.com/MTG/essentia/master/COPYING.txt)), and its licensing page says `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications, thus it is possible to test the library before deciding to licence it under a comercial licence. Contact Music Technology Group (UPF) for more information about licensing conditions ...` ([source](https://essentia.upf.edu/licensing_information.html)) | the TempoCNN models, `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use, and are also available under a proprietary license upon request.` ([source](https://essentia.upf.edu/licensing_information.html)). The other parts run here have no trained weights | TempoCNN, per its models page `trained on the Extended Ballroom, LMDTempo, and MTGTempo datasets` ([source](https://essentia.upf.edu/models.html)), whose licenses weren't read |
| librosa | ISC | none | none |
| lv-chordia | MIT | in the wheel, with no separate license found | not read |
| madmom | BSD-2-Clause | `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0`, with `NonCommercial: You must not use the material for commercial purposes.` and `If you want to include any of these files (or a variation or modification thereof) or technology which utilises them in a commercial product, please contact Gerhard Widmer [...]. Please note that pickled Processors (i.e. saved models) fall into this category.` ([source](https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE)) | not stated in the files read. Second-hand, the S-KEY paper says madmom's key model was `trained on a varied corpus (electronic dance music, pop/rock, and classical music)` ([source](https://arxiv.org/html/2501.12907v2)) |
| music21 | BSD-3-Clause | none | none |
| S-KEY | MIT, `The code of SKEY is MIT-licensed.` | `The MIT license does not apply to the model weights in skey.pt. You may use the model weights only for non-commercial research purposes.` ([source](https://raw.githubusercontent.com/deezer/skey/main/README.md)). The README at the commit the ONNX file was converted from says only that the code is MIT-licensed, the weights file is the same, and the ONNX card gives the weights no new license | songs from the Deezer catalog, per the paper, `STONE was trained on a corpus of 60k songs from the Deezer catalog. To offer a fair comparison, we begin by training S-KEY on the exact same dataset`, then a version trained on 1M songs. Which one `skey.pt` is isn't stated ([source](https://arxiv.org/html/2501.12907v2)) |
| tempo-cnn | AGPL-3.0, `Source code and models can be licensed under the GNU AFFERO GENERAL PUBLIC LICENSE v3. For details, please see the LICENSE file.` ([source](https://raw.githubusercontent.com/hendriks73/tempo-cnn/main/README.rst)), with the same section 13 as DeepRhythm | the same AGPL-3.0 | not read |
| vamp | MIT-style | none | none |

Every clause, quoted with its link and the date it was read, is in [`survey.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/chords-beats-key/survey.md).

</details>

<!-- IMAGES -->
All three were drawn with Pillow by `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/cbk/draw_cbk.py`, in the frame, palette and Inter fonts of the hosted-apis and fingerstyle-voices-taps lanes' pictures, at 1400 x 788 so the short chords get labels and the ao-compare frame stays 16/9. Tool outputs come from files under `/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples/`. The played chords and beats come from `/home/user/blog/docs/guitar-tab-research/inputs/<id>/`, the files gtr-eval used, each truth JSON's SHA-256 checked before drawing. I looked at each picture after writing it.

1. `chords-beats-key-s3-chords.webp`
   - Source files: `samples/autochord/S3.chords_autochord.lab` (r0337), `samples/chordino/S3.chords_chordino.lab` (r0215, default global tuning), `samples/crema/S3.chords_crema.lab` (r0337), `samples/essentia/S3.chords_tonal.lab` (r0088), `samples/lv_chordia/S3.chords_lvchordia_submission.json` (r0398), `samples/madmom/S3.chords_cnn.lab` and `samples/madmom/S3.chords_dc.lab` (r0063), over `inputs/S3/S3.chords.lab` (S3.truth.json SHA-256 `fde659effff9ba7f9f66a53ebd374c01aa0f88a84279efc06d613c7f76ebe8cf`).
   - Written: `/home/user/blog/public/media/guitar-tab-tools/chords-beats-key-s3-chords.webp`, 1400 x 788 WebP, 71,114 bytes, quality 90. Harte labels shown short (`G:maj` as G, `E:min` as Em, `A:min7` as Am7, `D:7` as D7, `C:maj` as C, `A:min` as Am, `D:maj` as D, `C:maj/3` as C/E, `N` as none). Segments cropped to 0 to 24 s. Chordino's and lv-chordia's D7 near 19.5 s carry their label turned upright. Three boxes are too narrow for a label: Chordino's none at 0.372 to 0.464 s, Essentia's D at 19.876 to 20.201 s and autochord's none at 23.777 to 24.0 s.
   - Alt: Eight rows of labeled boxes over 24 seconds. The top row, played, reads none, G, Em, Am7, D7, G, Em, C, D7, G. Below it are rows for autochord, Chordino, CREMA, Essentia TonalExtractor, lv-chordia, madmom CNN + CRF and madmom deep chroma. The lv-chordia row has the same ten labels as the played row. Chordino's row starts with G where the played row says none, and Essentia's starts with Am there. autochord, Essentia and both madmom rows have Am where the played row has Am7, and D under the first D7. CREMA has D under the first D7 and C/E across the played C and the second D7. The madmom CNN row has a none box near 22 seconds.
   - Caption: **Chord labels on S3.** Seven chord recognizers on 24 seconds of strummed chords I synthesized, under the chords played (r0063, r0088, r0215, r0337, r0398).
2. `chords-beats-key-s2n-bar-starts.webp`
   - Source files: `samples/allin1/S2n.json` (r0563), `samples/beat_this/S2n.final0.json` (r0397), `samples/beatnet/S2n.beatnet_offline.txt` (r0361), `samples/madmom/S2n.downbeats.txt` (r0100, the bar tracker's rows), over `inputs/S2n/S2n.beats.txt` (S2n.truth.json SHA-256 `dad55e25200a10969150d4fe42297ce1247a464615b2583eb2c1feebedf749d9`). The shaded band runs from 0 to the first played beat, 2.143 s.
   - Written: `/home/user/blog/public/media/guitar-tab-tools/chords-beats-key-s2n-bar-starts.webp`, 1400 x 788 WebP, 39,712 bytes, quality 90. Drawn counts: played 48 beats and 12 bar starts, All-In-One 47 and 12, `Beat This!` final0 54 and 26 (3 beats before 2.143 s), BeatNet offline 54 and 27 (3 beats before 2.143 s), madmom 48 and 12.
   - Alt: Five rows of tick marks over 29 seconds, with the first 2.1 seconds shaded as a silent count-in. Tall ticks mark the first beat of a bar. The played row has 48 beats and 12 tall ticks. All-In-One's row has 47 beats with its 12 tall ticks under the played ones. The Beat This! and BeatNet rows each start with 3 beats inside the count-in and have 26 and 27 tall ticks, BeatNet's on every other beat. madmom's row has 48 beats and 12 tall ticks, each one beat after a played bar start.
   - Caption: **Bar starts on S2n.** Beats and bar starts from All-In-One (r0563), `Beat This!` final0 (r0397), BeatNet offline (r0361) and madmom's bar tracker (r0100) on a 29-second fingerstyle clip I synthesized, under the 48 beats and 12 bar starts played.
3. `chords-beats-key-s7flat30-tuning.webp`
   - Source files: `samples/essentia/S3.chords_tonal.lab` (r0088), `samples/essentia/S7flat30.chords_tonal.lab` (the r0148 command, its output rewritten byte for byte by r0267) and `samples/essentia/S7flat30.chords_tonal_tf432.45.lab` (r0324), over `inputs/S7flat30/S7flat30.chords.lab`, which equals `inputs/S3/S3.chords.lab` (S7flat30.truth.json SHA-256 `eaa376d9feed20b577e7a98e2ea06b65e11a6adb7c50060adc6bc6b2487eb941`).
   - Written: `/home/user/blog/public/media/guitar-tab-tools/chords-beats-key-s7flat30-tuning.webp`, 1400 x 788 WebP, 50,644 bytes, quality 90. Segments cropped to 0 to 24 s. The two Abm boxes and the two short Am boxes carry their labels turned upright. Two boxes are too narrow for a label: S3's D at 19.876 to 20.201 s and S7flat30's G at 1.579 to 1.625 s at 440 Hz.
   - Alt: Four rows of labeled boxes over 24 seconds. The played row reads none, G, Em, Am7, D7, G, Em, C, D7, G. Essentia on S3 at its default 440 Hz reads Am, G, Em, Am, D, G, Em, C, a narrow box with no label, then G. On S7flat30 at 440 Hz it reads Am, a sliver of G, then F#, Ebm, Abm, B, Abm, C#, F#, Ebm, B, F#. On S7flat30 told 432.45 Hz it reads Am, G, Em, Am, C, Am, D, G, Em, C, G.
   - Caption: **Telling Essentia the tuning.** Essentia TonalExtractor's chords on S3 (r0088), and on S7flat30, the same chords 30 cents flat, at its default 440 Hz (r0267) and told 432.45 Hz (r0324).

<!-- PENDING MEDIA -->
None. This lane wrote no audio or video. Checked at 01:21 UTC on 2026-11-11: `/home/user/gtr/lanes/chords-beats-key/out/` holds only 981 `.txt`, 413 `.json`, 130 `.lab`, 11 `.jams` and 1 `.jsonl` files (9.3 MB), with no audio or video file. All-In-One's Demucs stems were deleted at the end of each run, as allin1 does by default, and its click-track option (`sonify`) wasn't run. trials.md, "Media kept outside git", says the same, and the gap-round verifier found no audio file left under `out/`.

<!-- NUMBERS -->
Lane files as read: `docs/guitar-tab-research/lanes/chords-beats-key/` trials.md, survey.md, for-aaron.md and tools.json, including the gap-round verifier's edits and its log, "Verification log (verify-gapfill-chords-beats-key, round 1, 2026-11-11)" (trials.md, written about 01:12 UTC on 2026-11-11). Counts in seconds of chords are a gtr-eval fraction times the truth span in the same eval (`counts.truth_span_s`), read from `samples/scores/scores_<tool>.jsonl`. Beat and bar counts are `n_matched`, `n_truth` and `n_est` of the eval named.

Sources that disagree, and what I used:
- The brief says every timed run was pinned to 2 cores. runs.jsonl and trials.md say many were not: `locked` false for r0198, r0200, r0215, r0237, r0267, r0320, r0324, r0335, r0347, r0348, r0351, r0361, r0397, r0398 (the last four with `OMP_NUM_THREADS` 1, "--nolock and one thread" in trials.md). I wrote "outside the slots" for those and "on 2 cores" only where `locked` is true.
- tools.json, Demucs entry, `not_run_reason`: `Not run in this lane (source-separation lane covers it; allin1 was not run)`. trials.md "Gap round 1", All-In-One: each allin1 call runs `demucs.separate --name htdemucs` in a subprocess (r0521, r0563, r0576). I followed trials.md ("It did run inside every All-In-One call").
- DeepRhythm confidence: trials.md DeepRhythm "Output format" says "the mean softmax probability of the chosen class over the 8-second clips", and the same section's verifier line says "the largest value of the per-class softmax probabilities averaged over the 8-second clips". I used the verifier's wording.
- R2full length: INPUTS.md row R2full says 228.482 s, trials.md says 228.5 s. I used 228.5.
- tools.json's `tried` count is 17 tools, two of them wrappers (chord-extractor, vamp) that tools.json lists as separate entries with Chordino's run r0215. I counted 17 and put the two in Chordino's entry.

Counts of the list
- 77 entries in tools.json `tools[]` (`lane` "chords-beats-key", `generated` 2026-11-10): 63 tools, apps and research projects by `kind` (research-model 25, open-source 19, library 8, api 5, commercial-app 6), plus 10 `dataset`, 3 `file-format` and 1 `web-standard`.
- 17 with `tried` true: aubio, Chordino/NNLS, chord-extractor, vamp, madmom, librosa, Essentia, music21, autochord, CREMA, DeepRhythm, BeatNet, Beat This!, lv-chordia, All-In-One, tempo-cnn, S-KEY. 46 of the 63 with `tried` false.
- "Fifteen entries": the 17 less chord-extractor and vamp, which ran Chordino (trials.md table "What ran here": "chord-extractor 0.1.3 + vamp 1.1.0").
- GuitarSet as the source of R1a, R1b, R1c: tools.json GuitarSet entry `what`, and INPUTS.md rows R1a to R1c.

RUNDOWN and SECTION
- 18.8 to 23.2 of 24 s, seven chord recognizers on S3, root = majmin for all seven: Essentia TonalExtractor 0.782208 x 24.0 = 18.773 s (e0237), lv-chordia 0.965 x 24.0 = 23.16 s (e1379, e1378). The other five in between: madmom CNN 0.85625 (e0214), Chordino 0.877625 (e0557), madmom deep chroma 0.91875 (e0216), autochord 0.922527 (e1283), CREMA 0.931125 (e1290). S3 truth span [0.0, 24.0] (each eval's `counts`).
- S5capo2, labels at the four truth midpoints 3.214, 4.821, 5.893, 6.964 s all A, D or Bm, never G or C: trials.md "Capo 2 and chord labels" table and its note ("at those four midpoints every S5capo2 label is A, D or, once (Essentia), B minor"), `samples/capo_chords/capo_chord_labels.json`. Shapes G and C: the same section ("The shapes played in the truth's first four segments are G and C (S2n's labels at the same times)"). Capo on fret 2, sounds in A major: INPUTS.md row S5capo2.
- "none of the 17 reports a capo" and "none ... how the open strings are tuned": trials.md "Open-string tuning and capo" ("no tool run here outputs a capo position or an open-string tuning") and "Capo 2 and chord labels" ("No tool here outputs a capo position, and none takes a capo or transposition input").
- 30 cents flat, S7flat30 = S3 notes with a pitch bend: INPUTS.md row S7flat30. Essentia chords 0 of 24 s at 440 Hz (e0273, root 0.0) and 16.2 of 24 s told 432.45 Hz (e1218, root = majmin 0.675083 x 24.0 = 16.202 s). 432.45 = 440 Hz lowered by 30 cents: trials.md Essentia section.
- S2n bar starts: All-In-One 12 returned, 12 of 12 within 70 ms (e1582). Beat This! final0 26 returned (e1369). BeatNet offline 27 returned (e1352). madmom bar tracker 12 returned, 0 of 12 (e0276), each 0.536 to 0.544 s after a played bar start (trials.md madmom "Verifier re-run" line). 112 BPM beat = 0.536 s: same line.
- "a cent is a hundredth of a fret": 100 cents per semitone (`cents = 1200 log2(f / 440)`, trials.md Chordino tuning table) and one fret per semitone.

Details intro
- 44.1 kHz 16-bit WAV by path, stereo, mono for R1: trials.md top, "Inputs".
- S3: 24.000 s, steel guitar program 25, 96 BPM, G major, silent count-in bar: INPUTS.md row S3 and "Count-in" note (silent in S1, S2n, S2s, S3, S5capo2, S5dropd, S6taps, S7flat30).
- S4: 38.741 s ("39-second"), D major, 116 BPM, one silent bar and one side-stick count-in bar, drums, bass, strummed steel guitar, lead on Voice Oohs: INPUTS.md row S4.
- S2n: 29.357 s, nylon, thumb bass plus melody, 112 BPM, G major. S2s steel. S6taps = S2s plus GM percussion standing in for taps. S5capo2 capo 2, A major. S5dropd Drop D (D2 A2 D3 G3 B3 E4): INPUTS.md rows.
- R1a 29.159 s, R1b 29.333 s, R1c 28.235 s ("28 to 29-second"). R1a comp, 107 BPM, Ab minor (truth). R1b single-note solo, 90 BPM, C# major. R1c bossa nova comp, 119 BPM, G major: INPUTS.md rows and trials.md "Truth facts". Lead-sheet chord answer: trials.md Chordino note ("The R1 truth is GuitarSet's lead-sheet chord annotation").
- R2 36.000 s, R2full 228.5 s, no truth, `Key: D# Minor, Tempo: 72 bpm` "not checked": trials.md madmom section and INPUTS.md row R2.
- R3a, R3b, R3c 18.000 s, nylon, played with the fingers, no ground truth: INPUTS.md rows.
- 70 ms window, each truth beat matched once: gtr-eval definitions in e0494 (`f_measure` 70 ms, `match_events`).
- Chord seconds, root and majmin, "none" over silence counts: gtr-eval definitions (e0557) and mir_eval root/majmin. R1a truth has `A#:hdim7`: `inputs/R1a/R1a.chords.lab`.
- Two slots of 2 cores out of 4: ENVIRONMENT.md "How runs were timed". No cost beyond the session: ENVIRONMENT.md "Cost".
- First-round verifier re-ran every first-round tool on 2 to 13 clips, all byte-identical (aubio 13, Chordino 3, Essentia 3 plus the 432.45 Hz call, librosa 3, music21 11, madmom 2, DeepRhythm 2, Beat This! 2 clips, lv-chordia 2, autochord and CREMA 2, BeatNet 2), and 509 of 509 evals identical (r0411): trials.md "Verification log (verify-trials-chords-beats-key, 2026-11-10)".
- Later round: All-In-One, tempo-cnn, S-KEY, and autochord, CREMA and lv-chordia on S5capo2 (r0605): trials.md "Gap round 1". Its verifier: 121 of 121 evals identical, S-KEY re-run r0665, lv-chordia on S5capo2 r0671, All-In-One S3 r0693 byte-identical, tempo-cnn, autochord and CREMA not re-run because tensorflow 2.17.0 and tensorflow-cpu 2.12.1 are no longer cached and the disk notice allows no new download over 200 MB, "Their outputs and scores were checked from the files": trials.md "Verification log (verify-gapfill-chords-beats-key, round 1, 2026-11-11)".

All-In-One
- allin1 1.1.0, Taejun Kim and Juhan Nam, WASPAA 2023: survey.md All-In-One. Demucs htdemucs per call, harmonix-all = 8 fold models: trials.md "Gap round 1", All-In-One.
- Published CLI `allin1 /home/user/gtr/inputs/S4/S4.wav -o <dir> -d cpu --demix-dir <dir>/demix --spec-dir <dir>/spec`, same bpm, 65 beats, 17 downbeats and positions, boundary 20.70 against 20.69 s: r0576, same section.
- NATTEN 0.17.3 built from the PyPI sdist (r0518, exit 0). 0.17.4 (r0512, exit 1) `TypeError: unsupported operand type(s) for |: 'type' and '_GenericAlias'`: same section.
- Output fields `bpm`, `beats`, `downbeats`, `beat_positions`, `segments`, 0.01 s grid, no confidence: same section, "Output format".
- S3 29/32 beats, 8/8 bars, 29 returned (e1509). S4 65/68, 17/17 (e1578). S2n 47/48, 12/12 (e1582). S5capo2 46/48, 12/12 (e1584). S5dropd 47/48, 12/12 (e1586). R1a 0/53 from 48, 0/14 from 12 (e1588). R1b 25/44 from 35, 1/11 from 8 (e1590). R1c 0/56 from 52, 0/14 from 13 (e1614).
- R1a median offset -0.267 s, R1c +0.223 s, tempo matching: trials.md All-In-One "Output excerpts".
- bpm S3 95 (e1510), S4 115 (e1579), S2n 111 (e1583), R1a 107 (e1589), R1b 91 (e1591), R1c 120 (e1615). Truth BPMs 96, 116, 112, 107, 90, 119: trials.md "Truth facts".
- S3 sections `start` 0 to 2.50, `intro` 2.50 to 23.99, `start` 23.99 to 24.00. R2full bpm 71, 264 beats, 66 bar starts, ten labels: same section. "No clip here has an answer for sections": "Song sections have no truth in these clips and were not scored."
- Times: S3 103.507 s, htdemucs 31.425 s, model load 1.168 s, inference 67.555 s, peak 1552.6 MB (r0521). R2full 777.783 s, htdemucs 186.930 s, inference 581.557 s, peak 2038.5 MB, r0563 1854.58 s: timing table. Re-run S3 142.7 s, byte-identical (r0693): gap verifier's log.
- Hints: `analyze()` signature, `harmonix-all` or `harmonix-fold0` to `harmonix-fold7`, `beats_per_bar=[3, 4]` fixed: same section, "Constraint inputs".
- `will mix metronome clicks for beats and downbeats`: survey.md All-In-One and handoff fact 7.

aubio
- 0.4.9, Ubuntu `aubio-tools 0.4.9-4.4build1`, commands, buffer 1024 and hop 512, `ModuleNotFoundError: No module named 'aubio._aubio'`, Python 3.13 and 3.12: trials.md aubio section.
- Same number of beats, at most 8 microseconds apart: same section, "Output format".
- aubiotrack S3 32/32 from 40 (e0494), S4 65/68 from 71 (e0500), S2n 47/48 from 51 (e0513), R1a 22/53 from 47 (e0549), R1b 13/44 from 65 (e0552), R1c 2/56 from 49 (e0555).
- First beats 2.514558 2.872381 3.140204 3.443379 3.746553: `samples/aubio/S3.beats_aubiotrack.txt` and trials.md excerpt. Played beats 2.5, 3.125, 3.75: same excerpt.
- Tempo S3 121.24 (e0496), S4 117.09 (e0503), S2n 115.35 (e0515), R1a 105.59 (e0550), R1b 155.34 (e0553), R1c 113.92 (e0556). R2full 539 beats, 144.61: trials.md excerpt. R3a 133.22, R3b 150.84, R3c 125.73: trials.md R3 table (r0348).
- 20.8 s, 9.2 s CPU, 64.2 MB, r0200 not locked. S3 tempo 0.80 s, beat 0.58 s, aubiotrack 0.22 s: trials.md aubio "Run".
- Hints `-B`, `-H`, `-r`, `-O`, `-t`, `-M`, `-s`, no tempo range, hint or meter: same section.

autochord
- 0.1.4, NNLS Chroma plus Bi-LSTM-CRF, 25 classes (12 maj, 12 min, N): survey.md autochord. Model `chroma-seq-bilstm-crf-v1` from Google Drive: trials.md autochord setup.
- Output tuples and `.lab`, `<root>:maj`, `<root>:min`, `N`, flats `Gb:maj`, no confidence, R2 last segment 36.037 s on a 36.000 s clip: trials.md "Output formats".
- S3 11 segments, 22.141 s root/majmin, 16.792 s sevenths (e1283). S4 34.519 of 38.741 s (e1284). S2n 16 segments, 22 truth, 20.090 s (e1286). S5capo2 15 segments, 18.988 s (e1767). R1a root 26.301 of 29.159 s (e1287), R1b 0.110 of 29.333 s (e1288), R1c 17.183 of 28.235 s (e1289).
- Excerpt `2.2291156462585033	4.96907029478458	G:maj`: `samples/autochord/S3.chords_autochord.lab` line 2, trials.md "Output formats".
- S3 25.9 s (load 7.8 s, recognize 16.2 s), others 10.5 to 11.6 s, R2full 15.7 s, 951 to 1068 MB per job, r0337 locked: trials.md autochord "Runs". S5capo2 9.28 s, r0605 locked: trials.md "Capo 2 and chord labels".
- No hint arguments: trials.md "Constraint inputs". `follows the MIREX chord label format`: survey.md autochord ("The output file follows the MIREX chord label format.") and handoff fact 15.

Beat This!
- beat-this 1.1.0, JKU Linz, ISMIR 2024: tools.json and survey.md. final0 and small0, resampled to 22050 Hz: trials.md Beat This! section.
- `File2Beats(...)` call with `dbn=False`: same section "Run".
- 20 ms grid, downbeats a subset of beats in all 18 outputs: same section "Output format".
- final0 S3 29/32 from 32, 8/8 from 9 (e1364). S4 65/68 from 68, 17/17 from 18 (e1366). S2n 48/48 from 54, 8/12 from 26 (e1369). R1a 52/53 from 52, 13/14 from 13 (e1373). R1b 28/44 from 43, 7/11 from 21 (e1375). R1c 56/56 from 56, 14/14 from 14 (e1376). small0 S2n 23/48 from 39, 9/12 from 22 (e1370). First three S3 beats in the count-in: trials.md excerpt.
- README quote `the results may be unfairly good if you run inference on any file from the training datasets` and GuitarSet among the training sets: survey.md Beat This! (c), tools.json `unverified`.
- R2 43 beats, 71.43 BPM median, 11 downbeats both checkpoints, R2full 266 beats: trials.md excerpt.
- Times final0 4.1 to 6.8 s, S3 import 2.1, load 0.36, inference 2.25 s, R2full 22.1 s, small0 3.0 to 5.4 s, R2full 15.0 s, 625 MB, r0397 not locked, one thread, slots held: trials.md Beat This! "Run".
- Hints `File2Beats(checkpoint_path, device, float16, dbn)`, no tempo range, meter or hint: same section. `.beats` quote `each line has a time in seconds, a tab, and a beat number (1 = downbeat)` and Sonic Visualiser: survey.md Beat This! and handoff fact 5.

BeatNet
- 1.1.3, CRNN plus madmom DBN offline or particle filter online: trials.md BeatNet "What". Calls, seed 0, model 1 of 3: "Run" and "What". The madmom edit `from collections import MutableSequence` to `from collections.abc import MutableSequence`: "Install".
- Rows, 20 ms grid, offline position = beat number, online 1 and 2, no tempo or meter field: "Output format".
- Offline S3 0/32 from 38, 0/8 from 10 (e1346). S4 68/68 from 75, 17/17 from 19 (e1348). S2n 48/48 from 54, 0/12 from 27 (e1352), positions 1, 2, 1, 2 (excerpt). R1a 30/53, 8/14 (e1358). R1b 27/44, 2/11 (e1360). R1c 0/56, 0/14 (e1362). Online S3 5/32 from 30, 2/8 from 7 (e1347). S4 64/68 from 65, 16/17 from 16 (e1349). S2n 35/48 from 36, 1/12 from 11 (e1353).
- Excerpt rows 0.340 4 to 3.440 1: `samples/beatnet/S3.beatnet_offline.txt` (tab-separated) and trials.md excerpt. S3 beats every 0.625 s from 2.5 s: 96 BPM and the S3 excerpt truth "2.5, 3.125, 3.75".
- S3 27.6 s (offline 19.9, online 3.9), others 6.2 to 11.0 s, R2full 68.4 s (offline 5.6, online 57.4), 802 MB, r0361 not locked, one thread: "Run".
- Hints, meters [2, 3, 4] fixed: "Constraint inputs". README quote `we added madmom's DBN beat/downbeat inference model for the offline usages`: survey.md handoff fact 6.

Chordino, chord-extractor, vamp
- Plugins by Matthias Mauch, ids, chord-extractor 0.1.3 ships `nnls-chroma.so`, vamp 1.1.0: trials.md Chordino "What" and survey.md. Concert pitch in Hz: survey.md Chordino outputs.
- `librosa.load(file)` 22050 Hz mono, `Chordino()` defaults useNNLS=1, rollon=1, tuningmode=0 global, whitening=1, s=0.7, boostn=0.1, tuningmode=1 local, `vamp.collect(data, rate, 'nnls-chroma:tuning')`: "Runs". Install commands and `setuptools<81`: "Install".
- `ChordChange(chord, timestamp)`, no end, no confidence, 2048/22050 s = 0.0929 s grid, label examples, `N` at 0.372 s on every clip: "Output format".
- S3 excerpt: trials.md "Output excerpts". Same label sequence as played: truth chords in trials.md "Truth facts".
- S3 21.063 s, all four comparisons equal (e0557). S4 34.338 of 38.741 s (e0563). S2n 19 segments, 22 truth, 22.537 s (e0583). S5capo2 22.910 s (e0598). R1a root 27.568 s (e0613), R1b 15.416 s (e0616), R1c 11.477 s (e0619). Local = global on S3: "Default (global) versus local tuning mode".
- Tuning `431.9 Hz`, 431.863 Hz, -32.316 cents (e0580). S3 -0.167 cents (e0560): trials.md tuning table.
- 97.5 s, 60.5 s CPU, 389 MB, r0215 not locked. S3 25.9 s, others 3.3 to 6.4 s, R2full 16.6 s. r0468: 3.3 s with numba cache, 17.9 s without: "Runs" and "Verifier re-run".
- Hints: trials.md "Constraint inputs" and survey.md (`chord.dict`). Handoffs: tools.json `handoffs_out` (bothchroma to autochord, Hz to KeyExtractor).

CREMA
- 0.2.0, Brian McFee, JAMS: trials.md autochord and CREMA "What". TensorFlow 2.12.1 venv: "Install".
- JAMS fields, label examples, confidences 0.21 to 0.97: "Output formats". S3 excerpt `N 0-2.32, G:maj, E:min, A:min7, D:maj, G:maj, E:min, C:maj/3, G:maj`, 9 segments: "Output excerpts".
- S3 22.347 s root/majmin, 19.932 s sevenths (e1290). S4 37.985 s (e1291). S2n 7 segments, 19.212 s (e1293). S5capo2 7 segments, 18.740 s (e1768). R1a root 27.501 s (e1294), R1b 11.913 s (e1295), R1c 16.759 s (e1296).
- S3 14.4 s (analyze 10.4 s), others 7.1 to 8.0 s, R2full 8.5 s, 696 to 760 MB, r0337. S5capo2 6.95 s, r0605.
- No hint: "Constraint inputs". JAMS also from tempo-cnn `--jams`: survey.md handoff fact 26.

DeepRhythm
- 0.0.13, weights `deeprhythm-0.7.pth` fetched from raw.githubusercontent.com: trials.md DeepRhythm "Install". Call: "Run".
- Values and confidences S3 95 0.648, S7flat30 95 0.612, S4 116 0.788, S2n 112 0.731, S2s 112, R1a 107 0.967, R1b 89 0.457, R1c 120 0.467, R2 143 0.537, R2full 143 0.619: "Outputs". Evals e1336 to e1343.
- S3 26.7 s (import 6.1, predict 18.8), others 4.8 to 6.6 s, R2full 7.8 s, 773 MB, r0351 not locked, one thread: "Run".
- Hints: `include_confidence`, batch CLI device and confidence flag: "Constraint inputs".

Essentia
- PyPI essentia-tensorflow 2.1b6.dev1389, MTG UPF: trials.md Essentia "What" and "Install". Algorithms, profiles, model files, `TonalExtractor(frameSize=4096, hopSize=2048, tuningFrequency=440)`, `tuningFrequency=432.45`: "Runs" and "Tuning as a constraint". 44100 and 11025 Hz: "Runs".
- Outputs, 46.4 ms per label, 24 triads, no `N`, S3 count-in `Am`, confidence multifeature only, no downbeats: "Output formats".
- multifeature beats S3 30/32 from 37 (e0225), S4 67/68 from 74 (e0250), S2n 48/48 from 54 (e0768), R1a 51/53 from 51 (e1094), R1b 37/44 from 87 (e1131), R1c 3/56 from 55 (e1167).
- multifeature BPM S3 95.557 (e0230), S4 115.605 (e0252), S2n 111.807 (e0773), R1a 106.992 (e1096), R1b 178.206 (e1133), R1c 117.309 (e1169). TempoCNN k16/k4: S3 96/96 (e0233, e0235), S4 116/116 (e0254, e0255), S2n 111/112 (e0892, e0895), R1a 108/108 (e1098, e1099), R1b 92/90 (e1135, e1136), R1c 120/120 (e1171, e1172).
- Keys 47 of 55: `samples/scores/scores_essentia.jsonl` key rows (bgate 9/11, edma 9/11, krumhansl 10/11, shaath 10/11, temperley 9/11). R1a and R1b labels: trials.md key table (e1100 to e1107, e1137 to e1142). 432.45 Hz all G major: e1207 to e1211, e1213 to e1217. `averageDetuningCorrection`: trials.md Essentia.
- Tuning S7flat30 -31 (e0274), S3 +2 (e0238), R1a +50 (e1111), range `between -35 to 65 cents`: trials.md tables and note. R1 truth 0 stated, not measured: trials.md Chordino tuning note.
- Chords S3 10 segments, 18.773 s, sevenths 14.825 s (e0237). S7flat30 440 Hz 0.0 (e0273), roots a semitone lower except a `B` where S3's has Am: trials.md Essentia S7flat30 paragraph. 432.45 Hz 16.202 s, sevenths 14.251 s (e1218). S4 33 segments, majmin 28.071 s (e0256). S2n 23 segments, 19.628 s (e0911). S5capo2 29 segments, majmin 16.712 s (e0983). R1a root 19.509 s (e1109), R1b 11.539 s (e1144), R1c 7.105 s (e1178).
- Times S3 2.35 s, 274 MB (r0088), S4 3.17 s (r0097), S7flat30 2.65 s (r0148), others 4.9 to 8.8 s and R2full 25.8 s, 9.2 s CPU, 394 MB (r0267, not locked), 432.45 Hz 2.4 s per clip (r0324, not locked): "Runs".
- Hint signatures: "Constraint inputs". TuningFrequency to KeyExtractor: survey.md handoff fact 10.

librosa
- 1.0.0, lane-written Krumhansl-Kessler baseline: trials.md librosa "What". Calls and `librosa.load(path, sr=22050, mono=True)`: "Runs".
- Outputs, whole cents: "Output format".
- Beats S3 25/32 from 29 (e0219), S4 65/68 from 65 (e0247), S2n 45/48 from 45 (e0282), R1a 49/53 from 52 (e0338), R1b 26/44 from 45 (e1127), R1c 4/56 from 52 (e1163).
- Tempo S3 95.703 (e0221), S4 117.454 (e0248), S2n 112.347 (e0283), R1a 107.666 (e0340), R1b 95.703 (e1128), R1c 117.454 (e1164).
- Tuning S7flat30 -31 (e0266), S3 +1 (e0223), R1a +13 (e0344). Key baseline 10 of 11, R1b C# minor (e1129): `samples/scores/scores_librosa.jsonl`. R2, R2full Eb minor, artist D# minor: trials.md "Output excerpts".
- S3 16.05 s, 343 MB, beat_track 12.2 s (r0069). r0468: 3.1 s with cache, 11.5 s without. Others 3.12 to 3.78 s (r0074, r0081, r0091 to r0094, r0096, r0104). R2full 23.1 s, 625 MB (r0267): "Runs".
- Hints `bpm`, `start_bpm`, `tightness`, `prior`, `chroma_cqt(tuning=...)`, `estimate_tuning(resolution, bins_per_octave)`: "Constraint inputs". librosa.load to vamp: survey.md handoff fact 4.

lv-chordia
- 1.1.0, ISMIR 2019 model, Music X Lab, 5 networks, HMM against a dictionary: trials.md lv-chordia "What" and survey.md. Call with `submission` and `ismir2017`: "Run".
- JSON fields, 0.01 s, labels `Bb:7`, `B:maj/3`, `Bb:maj/b7`, no confidence: "Output format". S3 excerpt: "Output excerpts".
- S3 23.16 s, all comparisons (e1379, e1378). S7flat30 11 segments, 21.07 s, sevenths 17.91 s (e1383). S4 38.341 s (e1381). S2n 23 segments, 27.953 s (e1385). S5capo2 23 segments, 27.770 s (e1770). R1a root 28.310 s (e1387). R1b one segment `N` 0 to 29.35 s, 0.0 (e1389). R1c 19.589 s submission (e1391), 21.069 s ismir2017 (e1390).
- S3 30.3 s (submission 25.1, ismir2017 2.1), others 9.2 to 13.0 s, R2full 68.4 s, 1084 MB, r0398 not locked, one thread. S5capo2 9.14 s, r0605.
- Hints `chord_dict_name` submission, ismir2017, full: "Constraint inputs". `Chord label in JAMS format`: survey.md lv-chordia.

madmom
- 0.16.1, JKU Linz, processors: trials.md madmom "What" and "Runs". GitHub build refused (`Code from External`), Python 3.11 import error `ImportError: cannot import name 'MutableSequence' from 'collections'`, Python 3.9 with numpy 1.23.5: "Install routes tried".
- Output grids 10 ms and 0.1 s, 25 labels, 24 key probabilities: "Output formats".
- Beats S3 30/32 from 37 (e0208), S4 68/68 from 74 (e0239), S2n 48/48 from 55 (e0275), R1a 52/53 from 104 (e1085), R1b 39/44 from 45 (e1120), R1c 0/56 from 56 (e1157).
- Bars S3 8/8 (e0210), S4 17/17 (e0240), S6taps 12/12 (e1059), S2n 0/12 (e0276), S2s 0/12 (e0287), S5capo2 0/12 (e0302), S5dropd 0/12 (e1007), R1a 0/14 (e1086), R1b 0/11 (e1121), R1c 2/14 (e1158). S2n offsets 0.536 to 0.544 s: verifier line.
- Tempo S3 95.238 (e0212), S4 115.385 (e0241), S2n 111.111 (e0278), R1a 107.143 (e1087), R1b 181.818 (e1122), R1c 120.000 (e1159). R2, R2full 72.289: "Output excerpts".
- Chords CNN / DC: S3 20.55 / 22.05 s, sevenths 15.35 / 17.05 s (e0214, e0216). S4 37.162 / 36.286 s (e0242, e0243). S2n 25.529 / 25.771 s (e0279, e0280). S5capo2 21.171 / 25.157 s (e0306, e0309). R1a root 27.904 / 27.820 s (e1089, e1091). R1b 2.433 / 4.367 s (e1123, e1125). R1c 16.883 / 15.687 s (e1160, e1161).
- Key 7 of 11 (`samples/scores/scores_madmom.jsonl`), S2n D major and top three 0.384, 0.306, 0.158 (trials.md excerpt, e0281), S5capo2 E major (e0311), R1a F# major (e1093), R1b F# major (e1126).
- S3 20.9 s, 212 MB (r0063). S4 35.1 s, 316 MB (r0072). R2full 190.2 s, 146.9 s CPU, 1383.7 MB (r0316). S3 stages 3.61, 3.41, 10.23, 0.06, 2.21 s: "Runs".
- Hint signatures: "Constraint inputs". DBN inside All-In-One, BeatNet, Beat This! `--dbn`: tools.json madmom `handoffs_out`.

music21
- 10.5.2, methods and class mapping (key = AardenEssen): trials.md music21. Two sources, truth MIDI and Basic Pitch 0.4.0 ONNX from r0234, drum part removed (S4): "Inputs".
- `music21.key.Key`, `correlationCoefficient`, `alternateInterpretations`: "Output format".
- 76 of 110, 35 of 55 truth MIDI, 41 of 55 Basic Pitch: counted from `samples/scores/scores_music21.jsonl` (110 rows, est_key = truth_key). Table: trials.md music21 results. S7flat30 pitch bend not read: same section and verifier note (one pitch-wheel message, -1229).
- 13.2 s, 4.3 s CPU, 70 MB, r0237 not locked, 0.29 to 1.14 s per MIDI file: "Run".

S-KEY
- Deezer, ICASSP 2025: survey.md S-KEY. ONNX export `aaatmy/skey-onnx` revision c04b6a2b, onnxruntime 1.31.1: trials.md "Gap round 1", S-KEY. 83 lines of glue `scripts/skey_onnx_run.py`: trials.md "Not run here" S-KEY row as corrected by the gap verifier. Card quote `a community conversion of the upstream checkpoint, not a newly trained model or an official Deezer release`: trials.md S-KEY "What".
- Resample call `torchaudio.transforms.Resample(orig_freq=44100, new_freq=22050)`, channel mean, argmax label: "Run".
- 24 outputs, softmax included, no calibrated confidence claimed: "Output format".
- Labels and values: S3 G major 0.815 (e1706), S7flat30 0.774 (e1708), S4 (e1707), S2n (e1709), S5capo2 (e1710), S5dropd (e1711), R1c (e1714), R1b C# major 0.258, C# minor 0.244 (e1713), R1a F# major 0.571, G# minor 0.114 (e1712). 8 of 9 with a known key. R2, R2full D# minor: trials.md S-KEY note.
- 22.29 s, 28.5 s CPU, 1158.8 MB (r0588), 1.6 to 2.0 s per clip, S3 3.56 s, R2full 2.65 s, inference 0.05 to 0.30 s and 0.48 s: "Run".
- `Browser inference uses ONNX Runtime Web WASM CPU`: survey.md handoff fact 24.

tempo-cnn
- tempocnn 0.0.8, Hendrik Schreiber, no key model: trials.md "Gap round 1", tempo-cnn. Calls: "Run".
- 48 of 72 tempos equal to the truth BPM: counted from `samples/scores/scores_tempocnn.jsonl` (tempo rows, est_bpm = truth_bpm: fcn 8, cnn 7, ismir2018 8, fma2018 0, deeptemp 5, deepsquare 8, shallowtemp 9, mazurka 3). fcn values (e1619, e1629, e1649, e1659, e1669, e1679, e1689, e1699). mazurka S3 190, R1a 211, R1b 171, fma2018 S3 192.82: trials.md tempo-cnn table. Meter 3, 4, 9, 5 and 4/4 truth: same table and note. R2full 72 from fcn, cnn, ismir2018, deepsquare, meter 9, `4/4 Swing`: note under the table.
- 140.95 s, 147.4 s CPU, 1249.9 MB (r0584), S3 26.98 s with read_features 16.49 s, others 11.1 to 12.3 s, R2full 20.58 s, load 0.05 to 0.46 s, estimate 0.11 to 1.31 s: "Run".

Capo table and lowest notes
- Midpoint labels per tool: `samples/capo_chords/capo_chord_labels.json` `at_truth_midpoints` (Chordino global and local identical, lv-chordia both dictionaries identical), trials.md "Capo 2 and chord labels" table.
- Lowest Basic Pitch notes: one MIDI 24 (C1) in each of S2n, S5capo2, S5dropd. S2n then 43 (G2), S5capo2 then 45 (A2), S5dropd 4 notes at 38 (D2), truth exactly 4 at 38, onsets 12 to 24 ms after the truth onsets, E2 = MIDI 40: trials.md "Open-string tuning and capo".

Didn't run
- 46 of 63: tools.json `tried` false among non-dataset kinds. Refusal text `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`: trials.md "Not run here" (BTC, Omnizart rows) and tools.json libKeyFinder and Omnizart `not_run_reason`.
- for-aaron.md sections: 1 Sonic Visualiser and Vamp Plugin Pack (QM plugins, Chordino in a GUI), 2 BTC, 3 S-KEY, 4 libKeyFinder via Mixxx or WSL, 5 All-In-One GPU timing, 6 tempo-cnn, 7 Omnizart Docker, 8 Beat Transformer Colab, 9 Hulme classifier.
- Each line's reason: tools.json `not_run_reason` of that entry, with trials.md "Not run here" and "Gap round 1" for BTC, libKeyFinder, Omnizart (`madmom/ml/nn/layers.c:38:6: error: #error Cython requires Python 3.9+.`, 0.5.0 wheel, Python 3.8), QM Vamp Plugins (connection reset, AppImage installer not run), Hulme et al. (no license file: survey.md), Beat Transformer (refused twice). ChordCoT quote: tools.json and survey.md. Spotify 2024-11-27: tools.json. GetSongBPM HTTP 403: tools.json. Sonic Annotator authentication prompt: tools.json. WaveBeat `checkpoints.md`: tools.json. ACR_seq2seq ICASSP 2026: tools.json `what`. Jangdan title: tools.json.
- 10 datasets, 3 file formats, 1 web standard: tools.json `kind`.

Licenses
- Every quote and URL in the table: tools.json `license` of each tried tool, each quote checked present in survey.md (whitespace collapsed). All-In-One model card `license: mit`, Harmonix MIT, audio not distributed, Demucs weights in the source-separation lane, README quote `The models are trained on the Harmonix Set with 8-fold cross-validation.`: survey.md All-In-One. autochord Apache-2.0 vs PyPI MIT, `data/McGill-Billboard`, CC0: survey.md autochord. Beat This! 16 annotation datasets, GuitarSet cc-by-4.0, RWC unreachable: survey.md Beat This!. BeatNet CC BY 4.0, PyPI empty license: survey.md BeatNet. CREMA BSD-2 vs ISC: survey.md CREMA. DeepRhythm weights in the AGPL repository: survey.md DeepRhythm. Essentia AGPL section 13, licensing page and models page quotes, TempoCNN data quote: survey.md Essentia. madmom three quotes and the S-KEY paper's second-hand quote: survey.md madmom. S-KEY code and weights quotes, README at 918b83d, ONNX card assigns no new license, STONE/S-KEY training quote, 1M songs: survey.md S-KEY. tempo-cnn README quote: survey.md tempo-cnn. vamp MIT-style: survey.md vamp. Section 13 text present in every AGPL file named (DeepRhythm, Essentia, tempo-cnn): survey.md "Common license texts" note.

Images
- Byte sizes 71,114, 39,712 and 50,644, 1400 x 788: `ls -l` and `draw_cbk.py` output after the last draw. Drawn counts and the unlabeled boxes: the same output. Truth SHA-256 values: `sha256sum` of `inputs/<id>/<id>.truth.json`, equal to the `truth.sha256` in e0557 (S3), e0571 (S7flat30) and e1352 (S2n).

Pending media
- 981 .txt, 413 .json, 130 .lab, 11 .jams, 1 .jsonl, 9.3 MB, no audio or video: `find` and `du` on `/home/user/gtr/lanes/chords-beats-key/out` at 01:21 UTC. trials.md "Media kept outside git" and the gap verifier's "no audio file is left under `out/`".
