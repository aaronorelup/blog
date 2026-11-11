<!-- RUNDOWN -->
- **For one guitar's melody, bass and taps, 11 of 52 listed tools, apps and research projects ran. No onset detector's output said which sounds were taps.** On a clip with 32 drum-kit hits standing in for body taps, 23 of 25 detector settings put an onset (where a sound starts) on all 53 note and tap starts. Demucs and Open-Unmix split a song into one track per instrument. On the three drums tracks they pulled out, an onset detector found 34, 32 and 82 onsets. The 34 fell on 31 of the taps and on 3 other moments. The 32 fell one on each tap. The 82 fell on all 53 starts and on 29 other moments.

<!-- SECTION -->
## Melody, bass and taps from one guitar

In fingerstyle, one guitar played with the fingers carries the tune, the bass and sometimes taps on its body. To write tab (guitar music as fret numbers on six lines), the app has to tell them apart. My agents listed 52 tools, apps and research projects plus 13 datasets and recordings for this, and 11 of the tools ran on the cloud box. Most runs used two clips I synthesized so every note is known. S2n is 29 seconds of a tune over a bass line, and S6taps is the same piece with 32 drum-kit hits standing in for body taps. My agents later added RT1, a real recording tagged tapping, with no answer key. Nobody listened for hits on its guitar body.

On S6taps, 23 of 25 onset detector settings put an onset, the moment a sound starts, on all 53 note and tap starts. No output said which was a tap. Demucs and Open-Unmix split a recording into instrument tracks. On their drums tracks the onset detector in librosa, a Python audio library, found 34 onsets with Demucs's four-track model, 32 with its six-track model and 82 with Open-Unmix. The 34 fell on 31 of the 32 taps and on 3 other moments. The 32 fell one on each tap. The 82 fell on all 53 starts and on 29 other moments. Essentia, an audio analysis library, has a melody tracker. On four synthesized clips it came within half a semitone (half a fret) of the tune in 1,587 to 2,012 of the 2,529 slices of 10 ms where the tune plays. It came that close to the bass in none of the 2,523 bass slices. My agents put a low-pass filter in front of pyin, librosa's pitch tracker, to turn down everything above 150, 200 or 250 Hz. On S2n, pyin came within half a semitone of the bass in 2,018, 1,207 and 984 of the 2,523 bass slices. When my agents turned those pitches into notes, 11, 6 and 8 of the 48 bass notes were among the 71 notes made at each cutoff.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/fingerstyle-voices-taps-s2n-pitch-tracks.webp" alt="Pitch against time over the 29-second clip S2n. Outlined boxes mark the 90 played notes, melody notes in an upper band around C4 and bass notes in a lower band around C3. A blue line labelled Essentia Melodia lies on the melody notes, with gaps. An orange line labelled low-pass + pyin lies on the bass notes, with short bends between notes, a short mark at C2 near 0 seconds and a rise above the bass band after the last note."><figcaption><b>Pitch tracks on S2n</b><span class="ao-meta">Essentia's melody tracker (r0220) and a 150 Hz low-pass plus librosa's pyin (r0235), drawn over the 90 played notes</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/fingerstyle-voices-taps-s6taps-onsets.webp" alt="Six rows of tick marks from 1.8 to 11 seconds of the clip S6taps. The top two rows mark when the 12 taps and the 17 note starts in that stretch were played. The four rows below, for librosa on the percussive part and for aubio hfc, Essentia complex and madmom CNN on the mix, each hold 19 blue ticks, one under every played tap and every note start. Shaded columns mark the 7 note starts with no tap, and every detector row has a tick in each of them."><figcaption><b>Onsets on S6taps, 1.8 to 11 s</b><span class="ao-meta">librosa on the percussive part at margin 4 (r0031), and aubio hfc (r0079), Essentia complex (r0090) and madmom CNNOnsetDetector (r0247) on the mix, under the 12 taps and 17 note starts played in that stretch</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Eleven tools, A to Z. Times are real elapsed seconds on the shared box. The box had two slots, each two of its four processor cores reserved for one job. Three of my agents' first runs here had a slot (r0031, r0079, r0090). So did four of the later RT1 runs (r0542, r0551, r0554, r0556), and the Demucs and Open-Unmix runs my source-separation agents made on the synthesized clips. The rest ran outside the slots while other agents' jobs shared the box, most of them limited to one thread, one stream of work at a time. A few light runs, the voice-splitting ones among them, had no thread limit. Where the processor (CPU) time differs a lot from the clock time, I give both. Nothing here cost money beyond the cloud session. None of the eleven takes a capo (a clamp across the strings that raises every note) or a tuning directly. Basic Pitch, Essentia's melody tracker and librosa's pyin take a note range, which a known tuning could set. In a later round to fill gaps, my agents ran librosa, aubio, Essentia, madmom and Demucs on RT1. It's a real 233.5-second recording from archive.org, "With A New Tuning, You Can Fly" by Chris Smuck (2007). It's under CC BY 3.0, a license that lets anyone reuse it with credit. Its keywords are `Acoustic, Tapping, Fingerstyle`. It has no answer key, so its numbers are counts and levels only, and whether it has hits on the guitar body wasn't checked by listening.

**aubio 0.4.9, Ubuntu package `aubio-tools 0.4.9-4.4build1`** ([link](https://github.com/aubio/aubio)). A C library and command-line tool that marks where sounds start, with eight methods to pick from. It was already on the box.

- In: S6taps, the synthesized fingerstyle clip with 32 drum-kit taps, as `S6taps.mono.wav` (44.1 kHz mono WAV). Later, hfc, complex and specflux ran on RT1 and on R1c, a 28-second excerpt of a real bossa nova accompaniment from the GuitarSet dataset, with its 148 notes annotated. The hfc method alone ran on the sound of R3a, R3b and R3c, three real 18-second nylon-string guitar videos with no answer key.
- Command or settings: `aubioonset -i <wav> -O <method>` for `energy`, `hfc`, `complex`, `phase`, `specdiff`, `kl`, `mkl` and `specflux`, every other setting at its default. The Python front end of the same package didn't start, with `ModuleNotFoundError: No module named 'aubio._aubio'`. The command-line tool worked.
- Out: plain text, one onset time in seconds per line, with nothing saying what kind of sound it is. On S6taps each method returned 53 to 62 onsets, and all eight put one on each of the 53 starts: 27 where a tap and a note start together, 21 notes with no tap and 5 taps with no note. The others landed on neither a note nor a tap: 1 for complex, 6 for energy, 0 for hfc, 9 for kl, 1 for mkl, 7 for phase, 1 for specdiff and 5 for specflux. On R1c, hfc returned 101 onsets with 58 of the 139 distinct note starts within 50 ms, complex 104 with 60 and specflux 180 with 66. On R3a, R3b and R3c, hfc returned 61, 87 and 47 onsets. On RT1, hfc returned 1,112, complex 558 and specflux 1,349. The first three from hfc on S6taps, where a tap and a note start at 2.143 s and at 2.679 s and a note with no tap starts at 3.214 s:

  ```text
  2.148254
  2.681905
  3.223061
  ```

- Time: 0.93 s for all eight methods on 2 cores, peak memory 35.1 MB (r0079). On RT1, six detectors from aubio, madmom and Essentia took 13.99 s together on 2 cores, peak 983.2 MB (r0542).
- Takes as a hint: `-t` threshold, `-M` minimum gap between onsets, `-s` silence level, `-B` and `-H` buffer and hop size. Nothing musical, so no tuning, capo or tempo.
- Hands off to: a list of seconds. The Inverse Drum Machine documents an input that takes onset times per drum class (`onsets={'KD': [...], 'SD': [...], ...}`), not run.

**Basic Pitch 0.4.0, ONNX model** ([link](https://github.com/spotify/basic-pitch)). An audio-to-notes transcriber that writes MIDI (a list of notes with start times and pitches), run here with the model file that ships in the package in the ONNX format, an open file format for trained models. It's the tool my audio-to-notes agents used, run here to feed the voice splitters.

- In: S2n, S2s (the same notes on a steel-string guitar sound), S6taps and S5dropd (the same piece in Drop D, a tuning with the lowest string lowered to D) as mono WAVs, plus the sound of R3a.
- Command or settings: `basic-pitch --model-serialization onnx --save-midi --save-note-events <out> S2n.mono.wav S2s.mono.wav S6taps.mono.wav S5dropd.mono.wav R3a.mono.wav`, defaults otherwise. A second run on the four synthesized clips added a note range for standard tuning, `--minimum-frequency 77.78 --maximum-frequency 1396.91` (D#2 to F6).
- Out: a MIDI file with pitch bends and a CSV (a plain-text table) per clip, header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`, rows not in time order. It wrote 137 notes for S2n, 201 for S2s, 196 for S6taps, 130 for S5dropd and 106 for R3a. On each synthesized clip all 90 played notes were among them (start within 50 ms, pitch within half a semitone), so 47, 111, 106 and 40 of its notes matched nothing played. The matched notes started a median 7.5 to 9.2 ms late. On S2n its pitches ran from MIDI note 23 to 87, where the piece spans 43 to 64. MIDI note numbers go up by one per semitone, one fret. With the standard-tuning range, S5dropd came out with 125 notes and 86 of the 90 played ones. The four not among them were the four D2 bass notes Drop D adds (at 8.571, 13.929, 18.214 and 25.714 s), which the run without a range had found. The first S2n notes in time order, as my agents listed them, with start and end in seconds, MIDI pitch and velocity (how hard the note is played):

  ```text
  0.012-0.151 23 49 (inside the silent count-in), 2.149-2.683 55 93, 2.161-2.927 43 71, 2.683-3.217 55 98, 2.683-3.217 50 98, 2.695-2.939 83 40, 3.217-3.391 67 43, 3.217-3.763 62 71
  ```

- Time: 74.95 s for the five clips, pinned to one core outside the slots, 28.2 s of CPU, peak 393.9 MB (r0252). The verifier, one of the agents that checked every run, re-ran it in 33.63 s (r0416). The run with the range took 29.81 s for four clips (r0325).
- Takes as a hint: `--minimum-frequency` and `--maximum-frequency` in Hz, a note range. The range set for standard tuning dropped the notes Drop D adds.
- Hands off to: its CSV went into partitura and music21 (below). After the install, the command-line tool first stopped with `ModuleNotFoundError: No module named 'pkg_resources'`, and it ran once `setuptools<81` was installed (my trial agent's note, not reproduced by the verifier). My audio-to-notes agents' first runs, r0033 among them, stopped with `File .../nmp.tflite cannot be loaded into either TensorFlow, CoreML, TFLite or ONNX`.

**Demucs 4.1.0, models htdemucs and htdemucs_6s** ([link](https://github.com/facebookresearch/demucs)). A source separator. It splits a recording into stems (one instrument's track each), drums, bass, other and vocals, and htdemucs_6s adds guitar and piano. My source-separation agents ran it on the synthesized clips, and my agents here checked their stems and ran it on the three real videos.

- In: S2s and S6taps as stereo WAVs. R3a, R3b and R3c as stereo WAVs. RT1 as a stereo WAV.
- Command or settings: `demucs -n htdemucs -d cpu` and `demucs -n htdemucs_6s -d cpu` on S2s and S6taps. On the real clips, `demucs -n htdemucs_6s -d cpu -j 1 -o <out> R3a.wav R3b.wav R3c.wav` and the same with `-n htdemucs`. On RT1, `demucs -n htdemucs_6s -d cpu -o <out> RT1.wav` and the same with `-n htdemucs`.
- Out: one 44.1 kHz stereo WAV per stem. On S6taps, librosa's onset detector on the htdemucs_6s drums stem returned 32 onsets, one on each of the 32 taps (27 with a note, 5 alone) and none on the 21 notes with no tap. On the htdemucs drums stem it returned 34, on 31 of the 32 taps, on no note without a tap and 3 on neither. Against the true taps track, the drums stem measured 5.67 dB with htdemucs and 6.98 dB with htdemucs_6s. That's SI-SDR, a figure that weighs the part of a stem matching the true track against everything else in it. A higher number means less of anything else. My agents also measured the spectral centroid, where a sound's energy sits on average in Hz, over the 50 ms after each onset on the htdemucs_6s stem. It ran from 233 to 817 Hz for the 8 bass-drum thumps and from 3,715 to 5,079 Hz for the 24 side-stick slaps. On this clip the two ranges didn't overlap. It's a measurement, not a classifier. On S2s and S6taps the bass stems were 58 to 63 dB below the mix, and against the bass part alone (rendered by my agents from the clip's own MIDI) they measured -17.03 to -6.54 dB SI-SDR. htdemucs put 0.998 (S2s) and 0.961 (S6taps) of the mix's energy into `other`, and htdemucs_6s put 0.826 and 0.623 into `piano` and 0.0041 and 0.0217 into `guitar`. On the real clips, where no body taps were seen in the video frames, htdemucs_6s put the guitar into `guitar` (0.1 to 0.3 dB below the mix). Their bass stems were 16.2 dB (htdemucs_6s) and 15.1 dB (htdemucs) below the mix on R3b, and 50.5 to 71.5 dB below on R3a and R3c. Their drums stems were 42 to 65 dB below the mix, and librosa's onset detector returned 55 to 226 onsets on them. By default, `normalize=True`, it scales its onset curve to run from 0 to 1 before picking peaks. A minimum loudness for an onset wasn't tested. Demucs shifts the audio by a random amount by default (`--shifts` defaults to 1), so runs differ. On R3a's htdemucs_6s drums stem the onset count was 226, 180 and 208 in three runs. On RT1, htdemucs_6s put -2.5 dB of the mix into `other`, -8.1 dB into `guitar`, -13.8 dB into `bass` and -40.0 dB into `drums` (r0554), and librosa found 351 onsets on its drums stem. The verifier ran the same command again (r0571). That run put -2.6 dB into `other`, -7.7 dB into `guitar`, -13.5 dB into `bass` and -37.3 dB into `drums`, and librosa found 23 onsets on its drums stem. htdemucs put -0.2 dB into `other`, -17.6 dB into `bass` and -41.4 dB into `drums`, with 1,078 onsets on its drums stem (r0556). That run wasn't repeated. My agents also took the peaks of each drums stem, at least 1 s apart. On the first htdemucs_6s stem, 5 of 181 were above -40 dBFS, a level 40 dB below the loudest a file can hold, at 0:31.8, 1:05.8, 1:08.4, 1:10.4 and 3:25.8. On the second, 7 of 180 were, at 0:31.8, 1:05.8, 1:08.3, 1:10.4, 2:00.8, 2:18.8 and 3:25.8, and each of the first run's five times was within 0.07 s of one of these seven. On the htdemucs stem 1 of 181 was, at 0:49.9. The two models' loudest moments came at different times. How far these figures move beyond those runs wasn't checked, and what sound is at those times wasn't checked by listening.
- Time: on 2 cores, S6taps took 45.63 s with htdemucs (peak 1,199.7 MB, r0053) and 29.74 s with htdemucs_6s (1,292.5 MB, r0054). S2s took 36.81 s (1,240.4 MB, r0060) and 73.43 s (1,317.2 MB, r0099). The three 18-second real clips together, pinned to one core outside the slots, took 139.41 s with htdemucs_6s (74.2 s of CPU, peak 1,354.1 MB, r0327) and 126.16 s with htdemucs (r0330). The verifier's re-run on R3a alone took 30.36 s (r0420). RT1, 233.5 s long, took 173.64 s with htdemucs_6s (261.5 s of CPU, peak 2,142.2 MB, r0554) and 171.41 s with htdemucs (r0556), each on 2 cores. The verifier's second htdemucs_6s run took 137.4 s (r0571).
- Takes as a hint: `-n` model, `-d` device, `-j` jobs, `--shifts`. Nothing musical.
- Hands off to: the drums stem, loaded as mono, went into `librosa.onset.onset_detect` (run). The guitar stem is an audio file that librosa's harmonic-percussive split and the onset detectors take (not run here).

**Essentia 2.1-beta6-dev, `essentia==2.1b6.dev1389`** ([link](https://github.com/MTG/essentia)). An open-source C++ audio analysis library with Python bindings, from the Music Technology Group at UPF. Used here for its onset algorithms and its melody tracker, `PredominantPitchMelodia`.

- In: S6taps as `S6taps.mono.wav`, loaded at 44.1 kHz. For the melody tracker, S2n, S2s, S6taps and S5dropd as mono WAVs. `OnsetRate()` also ran on R1c and RT1.
- Command or settings: for onsets, `MonoLoader` at 44.1 kHz, frames of 1024 with hop 512, Hann window, FFT, `CartesianToPolar`, then `OnsetDetection(method=m)` for m in `hfc`, `complex`, `complex_phase`, `flux`, `melflux` and `rms`, each followed by `Onsets()`, plus `OnsetRate()` and `SuperFluxExtractor()` with defaults. For melody, `MonoLoader(sampleRate=44100)` then `EqualLoudness()` then `PredominantPitchMelodia()` with defaults (hop 128 samples, 2.9 ms).
- Out: onset times in seconds, with no label. On S6taps, complex, complex_phase, flux, melflux, rms and `OnsetRate` put an onset on all 53 starts, with 0, 26, 6, 8, 104 and 0 more on neither. hfc returned 52, on every start but one, a tap with no note. `SuperFluxExtractor`, with its default threshold and no other tried, returned 19 onsets on the 29.4-second clip, on 18 of the 53 starts. `OnsetRate` on R1c returned 86 onsets with 64 of the 139 note starts within 50 ms, and 981 on RT1. The melody tracker writes a pitch in Hz per 2.9 ms frame (0 where it hears no melody) and a confidence per frame. Checked on 10 ms slices, it came within half a semitone of the melody in 1,589 of the 2,529 slices where a melody note sounds on S2n (nylon), 2,012 on S2s (steel), 2,008 on S6taps and 1,587 on S5dropd. Against the bass it came within half a semitone in 0 of 2,523 slices on every clip. Essentia has no harmonic-percussive separation (HPSS) algorithm, so the Essentia HPSS item on my agents' starting list had nothing to run.
- Time: the onset runs took 2.12 s for all eight on 2 cores, peak 165.5 MB (r0090). The melody tracker took 10.14 s for the four clips with one thread outside the slots, peak 177.1 MB (r0220). The RT1 run is under aubio (r0542).
- Takes as a hint: `OnsetDetection(method, sampleRate)`, `Onsets(alpha, delay, frameRate, silenceThreshold)`, `SuperFluxExtractor(frameSize, hopSize, threshold, ratioThreshold, combine)`. The melody tracker takes `minFrequency` and `maxFrequency` (a note range), `voicingTolerance`, `guessUnvoiced`, `frameSize`, `hopSize` and `magnitudeThreshold`. No tuning, capo or key input.
- Hands off to: onsets as a list of seconds. The melody tracker's CSV (`time_s,f0_hz,confidence`) went to the checking script, which stopped with `IndexError: index 5654 is out of bounds for axis 0 with size 5654` on S2n while frames with no pitch were empty cells, and worked with 0 Hz in them. The number in that message is each clip's count of frames with a pitch. Its output is a pitch per frame, not a list of notes.

**libnmfd 1.0.0** ([link](https://github.com/groupmm/libnmfd)). A toolbox from AudioLabs Erlangen for music uses of nonnegative matrix factorization (NMF), with a drum-extraction demo. NMF breaks a spectrogram, a map of how loud each frequency is over time, into a few repeating sound patterns and when each one plays.

- In: S6taps as `S6taps.mono.wav`.
- Command or settings: the package's demo notebook `demo_drum_extraction_kam_nmf_perc_threshold.ipynb`, copied step by step into a script. STFT 2048 with hop 512, `hpss_kam_fitzgerald(num_iter=30, kern_dim=13)`, then `nmfd(num_comp=30, num_iter=60, num_template_frames=1, func_preprocess=drum_specific_soft_constraints_nmf, decay=0.75)`, a percussiveness estimate per component, and every component above 0.25 counted as percussive. No answer key used.
- Out: four float32 mono WAVs, the percussive and harmonic parts after the KAM step (the package's harmonic-percussive split, `hpss_kam_fitzgerald`) and after the NMFD step. 3 of the 30 components came out above the 0.25 line (0.661, 0.510 and 0.370). Against the true taps track the percussive parts measured -1.95 dB SI-SDR (KAM) and -1.81 dB (KAM plus NMFD). librosa's onset detector returned 53 onsets on each percussive part, one on each of the 53 starts, taps and plain notes alike. In the 50 ms after each start, no note-only start was louder than the quietest tap in either part, with gaps of 0.07 dB (KAM) and 0.23 dB (NMF) between the loudest note-only start and the quietest tap.
- Time: 186.68 s with one thread outside the slots on a fully loaded box, 43.3 s of CPU, peak 1,778.8 MB (r0238). The verifier's re-run took 42.47 s, peak 1,780.9 MB (r0415).
- Takes as a hint: KAM `num_iter` and `kern_dim`, NMFD `num_comp`, `num_iter`, `num_template_frames`, `init_W` and `init_H`, `fix_W` and `fix_H` (they keep given templates fixed during the fit), and the percussiveness threshold. Nothing musical.
- Hands off to: the percussive WAV went into librosa's onset detector (run). It pins `numpy<2.0.0` and `pandas<2.0.0`, so it got a Python environment of its own.

**librosa 0.11.0** ([link](https://github.com/librosa/librosa)). A Python library for audio and music analysis. Used here for harmonic-percussive separation (HPSS, which splits a recording into a sustained part and a part with the sharp attacks), its onset detector, and pyin, a pitch tracker that follows one note at a time. Its NMF wrapper is under scikit-learn below.

- In: S6taps as `S6taps.mono.wav` (44.1 kHz mono). S2n and S5dropd as mono audio for the bass. R1c, RT1 and the sound of R3a, R3b and R3c as mono WAVs for onsets. The drums stems from Demucs and Open-Unmix, loaded as mono.
- Command or settings: `librosa.effects.hpss` with `margin` 1, 2, 4, 8 and 16, everything else default, then `librosa.onset.onset_detect(y=..., sr=..., units='time')` with defaults on each percussive part and on the mix. For the bass, a zero-phase 4th-order Butterworth low-pass at 150, 200 or 250 Hz, then `librosa.pyin(fmin=C2 65.4 Hz, fmax=C4 261.6 Hz, frame_length=4096, hop_length=441)`, then a step my agents wrote that turns a run of frames on the same MIDI note, at least 50 ms long, into one note.
- Out: HPSS gives two waveforms the length of the input. On S6taps the onset detector returned 53 onsets at every margin and on the mix, on all 53 starts, so every tap was in the list and so was every note with no tap. Against the true taps track the percussive parts measured 0.37, 3.43, 3.68, 1.89 and -0.64 dB SI-SDR at margins 1, 2, 4, 8 and 16. In the 50 ms after each start, no note-only start was louder than the quietest tap in the percussive parts at margins 1, 4 and 16, while in the mix all 21 were. On R1c, 90 onsets with 64 of the 139 note starts within 50 ms. On R3a, R3b and R3c, 81, 112 and 54 onsets on the mix and 86, 138 and 71 on the percussive part (margin 4), which held 0.0009, 0.0005 and 0.0018 of the mix's energy, against 0.022 on S6taps. On RT1, 931 onsets on the mix and 1,231, 1,192 and 946 on the percussive parts at margins 1, 4 and 16, which held 0.0254, 0.0048 and 0.0009 of its energy. pyin writes a pitch per 10 ms frame and a voiced probability. With the 150 Hz low-pass on S2n it came within half a semitone of the bass in 2,018 of the 2,523 slices where a bass note sounds (1,207 at 200 Hz, 984 at 250 Hz). The notes step made 71 notes at every cutoff. At 150 Hz, 11 of the 48 bass notes were among them (start within 50 ms, pitch within half a semitone) and none of the 42 melody notes. At 200 Hz it was 6 bass notes and 4 melody notes, and at 250 Hz 8 bass notes and 4 melody notes. With a 150 ms window, 37 of 48 matched at 150 Hz, a median 80 ms late. On S5dropd at 150 Hz, 1,980 of 2,523 slices and 11 of 48 notes. On S2n the bass is played at 2.143, 2.679, 3.214 and 3.750 s, on MIDI notes 43, 50, 43 and 50. The first notes at 150 Hz, where the first row falls inside the silent count-in:

  ```text
  onset,offset,pitch
  0.1300,0.2400,36
  2.2100,2.6600,43
  2.8000,3.1500,51
  3.2200,3.2700,50
  3.3300,3.7300,43
  3.7900,4.2800,50
  ```

- Time: the HPSS sweep with onsets took 39.91 s on 2 cores for all five margins, start-up included, peak 651.6 MB (r0031). pyin with the three cutoffs took 103.91 s on S2n (r0235) and 101.22 s on S5dropd (r0233) with one thread on a fully loaded box, 14.8 s of CPU each, peak 605 MB. The verifier's re-run on S2n took 16.26 s (r0444). The R3 onsets took 14.79 s for the three clips (r0292). RT1 took 79.7 s on 2 cores, peak 1,597.9 MB (r0551).
- Takes as a hint: `margin`, `kernel_size`, `power` and `mask` for HPSS. `hop_length`, `backtrack` and the peak-picking settings `delta`, `wait`, `pre_max` and `post_max` for onsets. `fmin` and `fmax` for pyin, a note range a known tuning could set (S5dropd's lowest bass note, D2 at 73.4 Hz, sits inside C2 to C4). No tuning, capo or tempo input.
- Hands off to: the percussive part went into the onset detector (run). The harmonic part as a WAV is a file Basic Pitch takes (not run on it). pyin's frames went into the notes step written here.

**madmom 0.17.dev0, git commit 27f032e8** ([link](https://github.com/CPJKU/madmom)). CPJKU's audio library, with eight onset programs: CNN, RNN offline and online, SuperFlux, SuperFlux with neural peak picking, ComplexFlux, LogFiltSpecFlux and SpectralOnsetDetection.

- In: S6taps as `S6taps.mono.wav`. CNNOnsetDetector and SuperFlux also on R1c and RT1, and CNNOnsetDetector on R3a, R3b and R3c.
- Command or settings: `<Program> single <wav> -o <out>.txt` with defaults, for each of the eight programs.
- Out: text, one onset time in seconds per line, in 10 ms steps for six programs and 5 ms steps for ComplexFlux and SuperFlux. On S6taps all eight put an onset on all 53 starts, with 0 or 1 more (53 or 54 onsets). No output says whether an onset is a tap or a plucked note. The 32 matched taps came a median 3.2 ms late with CNNOnsetDetector (largest 9.3 ms) and 2.1 ms early with SuperFlux (largest 5.0 ms). On R1c, CNNOnsetDetector returned 97 onsets with 71 of the 139 note starts within 50 ms, and SuperFlux 94 with 66. On R3a, R3b and R3c, CNNOnsetDetector returned 64, 102 and 57. On RT1, CNNOnsetDetector returned 1,124 and SuperFlux 1,095. Its first three on S6taps:

  ```text
  2.150
  2.680
  3.220
  ```

- Time: 30.88 s for all eight programs with one thread outside the slots on a fully loaded box, 2.6 to 5.4 s each, peak 281.2 MB (r0247). The verifier's re-run took 17.92 s (r0443). The RT1 run is under aubio (r0542).
- Takes as a hint: `--threshold`, `--smooth`, `--pre_max` and `--post_max`, `--combine`, `--delay`, `--fps`, and online or offline mode. Nothing musical.
- Hands off to: a list of seconds, the kind of input the Inverse Drum Machine's onset override takes (not run).

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A toolkit for computer-aided music analysis that reads and writes MIDI and MusicXML, a file format for sheet music. Its MIDI import puts overlapping notes of different lengths into separate Voice objects, and it has no function that labels melody and bass. So my agents wrote a rule on top: a chord's lowest note is bass and its other notes melody, a single note in the Voice with the highest mean pitch in its bar is melody, and any other single note is bass.

- In: notes as a single-track MIDI file written with pretty_midi at the clip's tempo. Two sets of notes, the 90 played notes of S2n and S5dropd with only start, end and pitch kept, and Basic Pitch's notes for S2n, S2s, S6taps and S5dropd.
- Command or settings: `music21.converter.parse` on the MIDI file, then the rule above. The MIDI file uses the clip's tempo read from the answer key (112 BPM), so this method used that one piece of the answer.
- Out: a Stream, music21's tree of parts, measures, voices, notes and chords, with times in quarter notes. On S2n's played notes, 1 part, 36 Chords, 18 single Notes and 12 Voice objects. With the rule, 90 of 90 played notes got their right voice on S2n and on S5dropd. On Basic Pitch's notes, of the 90 that matched a played note, 83 got the right voice on S2n, 79 on S2s, 77 on S6taps and 81 on S5dropd, and on S2n it labelled 62 notes melody and 75 bass. It also wrote S2n's played notes as `S2n_truth_merged_single_track.musicxml`. In these clips every melody note is higher than every bass note. The melody runs from MIDI 55 to 64 and the bass from 43 to 52, or 38 to 52 in Drop D. So a pitch line my agents wrote, melody from MIDI 55 up, also gave 90 of 90, on played notes and on Basic Pitch's matched notes. On played notes a line at 53 or 54 did too.
- Time: 0.198 s on S2n and 0.265 s on S5dropd to parse and label, inside light runs of the whole voice-splitting script outside the slots (4.49 s for S2n's played notes with every method, peak 159.2 MB, r0184, and 6.2 to 7.8 s for each clip's Basic Pitch notes, r0258 to r0265).
- Takes as a hint: parsing options (quantization) only. No note range, tuning or capo.
- Hands off to: the MusicXML file is ready as the input for Cluster and Separate (not run). `Stream.voicesToParts()` turns voices into parts (not run).

**Open-Unmix 1.3.0, model umxhq**. A music source separator that writes bass, drums, other and vocals stems. My source-separation agents ran it, and my agents here checked the stems. My agents' files here don't hold its link or license.

- In: S6taps as `S6taps.wav` (stereo).
- Command or settings: `umx --model umxhq --no-cuda --outdir <out> S6taps.wav`.
- Out: four WAVs. The drums stem held 0.0366 of the mix's energy (-14.4 dB) and `other` held 0.924. Against the true taps track the drums stem measured 2.71 dB SI-SDR. librosa's onset detector on it returned 82 onsets, on all 32 taps, on all 21 notes with no tap and 29 on neither. In the 50 ms after each start, 10 of the 21 note-only starts were louder than the quietest tap. Its bass stem measured -31.96 dB SI-SDR against the bass part alone.
- Time: 96.63 s on 2 cores, peak 1,401.6 MB (r0147).
- Takes as a hint: none recorded in my agents' files here.
- Hands off to: the drums stem went into librosa's onset detector (run).

**partitura 1.9.0** ([link](https://github.com/CPJKU/partitura)). A Python package for written music as data. Its `estimate_voices` gives each note a voice number. Its documentation in the code cites Chew and Wu's 2004 paper, `Separating Voices in Polyphonic Music: A Contig Mapping Approach`.

- In: the same notes as music21 above, as a structured array with `onset_sec`, `duration_sec`, `pitch` and `id`.
- Command or settings: `estimate_voices(note_array, monophonic_voices=False)` and `estimate_voices(note_array, monophonic_voices=True)`. A rule my agents wrote then called the voice with the highest mean pitch melody and every other voice bass.
- Out: a numpy array with one voice number per note, starting at 1. On S2n's played notes, `monophonic_voices=False` made 2 voices of 10 and 80 notes and 54 of 90 notes got the right voice, since it puts notes with the same start and length into one voice. `True` made 2 voices of 42 and 48 notes, 90 of 90. S5dropd gave the same counts. On Basic Pitch's notes it made 5 to 8 voices, where the piece has 2. On S2n with `True` it made 6 voices, of 1, 8, 33, 18, 35 and 42 notes, and the rule labelled the 8 melody. With `False` the rule labelled 4 notes melody on S2n. Across the four clips, 48 to 55 of the 90 matched notes got the right voice. In these clips every played melody note is higher than every bass note (see music21 above).
- Time: 0.022 to 0.033 s per call on the played notes, inside the voice-splitting runs listed under music21 (r0184, r0185, r0258 to r0265).
- Takes as a hint: `monophonic_voices` only. No number of voices, note range, tuning or capo. In 1.9.0 the signature's default is `True` while the docstring says `Defaults to False`.
- Hands off to: voice numbers per note, which my agents' script wrote out as per-voice CSV files (`onset,offset,pitch`). A MIDI file per voice, the kind tuttut (my guitar-tab agents' tool) takes, would be an extra step that partitura doesn't document (not run).

**scikit-learn 1.9.1, NMF**. The `sklearn.decomposition.NMF` class, which librosa's `decompose.decompose` calls by default. My agents' files here give no home page for it, only its record on PyPI, the Python package index.

- In: the magnitude spectrogram of S6taps (STFT 2048, hop 512), through `librosa.decompose.decompose`.
- Command or settings: `decompose(S, n_components=k, sort=True, random_state=0)` for k = 8 and 16. NMF doesn't say which part is a tap, so my agents grouped the parts with the answer key: a part went to taps when its sound matched the true taps track more than the true guitar track. These numbers use the answer key and don't describe a method that could run on a new recording.
- Out: k components and their activations, with no labels. With k = 8, 1 component went to taps, and with k = 16, 3 did. Grouped that way, the taps measured 1.46 dB (k = 8) and 4.10 dB (k = 16) SI-SDR and the guitar 17.34 and 18.64 dB. librosa's onset detector on the taps group returned 59 onsets (k = 8) and 70 (k = 16), on all 53 starts each time plus 6 and 17 on neither. scikit-learn warned `ConvergenceWarning: Maximum number of iterations 200 reached`.
- Time: 8.85 s with one thread outside the slots, peak 515.3 MB, of which the fits took 2.3 s for k = 8 and 3.1 s for k = 16 (r0296).
- Takes as a hint: `n_components`, `beta_loss`, `max_iter`, `init`. librosa's wrapper also takes a transformer fitted beforehand, with `fit=False` (not tried).
- Hands off to: the grouped parts as WAVs went into librosa's onset detector (run).

Every run, command, output file and check is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/fingerstyle-voices-taps).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Of the 52 tools, apps and research projects on the list, 41 didn't run here. Of the 13 datasets and recordings, 12 weren't downloaded, and the thirteenth is RT1. Two limits come up again and again. One is the session's permission policy. It refused the verifier, one of the agents that checked every run, when that agent tried to compile McLeod and Steedman's voice splitter. By my trial agent's account it also refused two ADTOF-pytorch steps, installing the cloned code and running it. Those left no line in the run log, and the verifier didn't see that session's transcript. In a later round it refused the ADTOF, Omnizart, ADT_STR and Cluster and Separate installs, LarsNet's own script and the drumsep run. Those six left no line in the run log either, but the agent that checked that round read each refusal and its command in that session's transcript. The other limit is a disk-space notice the box printed for agents in the first round, `start no new download or install over 200 MB unless your lane cannot finish without it ... never install a second torch or tensorflow version if an existing venv can be reused`. Where my agents wrote me steps to run a tool myself, the list number points into [`for-aaron.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/for-aaron.md).

- **Ableton Live, Convert Drums to New MIDI Track.** A command in a commercial desktop program. My agents here didn't run it, and no reason beyond that is recorded. No steps.
- **ADT_STR.** At first its `pyproject.toml` pins of `torch==2.8.0` and `torchaudio==2.8.0` (a second torch version) ran into the disk notice, and so did its checkpoint, the trained model file, on Hugging Face (`setting-tau-0.8`, 289,134,056 bytes). In the later round, the README's two install lines (a Python 3.12 environment, then its PyPI dependencies from `pyproject.toml`) were refused before they ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` The checkpoint wasn't downloaded. Steps for me: list 6.
- **ADTLib.** No reason recorded in the trials. Its README says it needs madmom and TensorFlow. No steps.
- **ADTOF, the original Keras and TensorFlow version.** At first its `setup.py`, which asks for `tensorflow>=2.13.0`, met only `tensorflow-cpu` 2.12.1 on the box (installed by two other groups of my agents), and the disk notice ruled out another install. In the later round, with the disk free again, one install from its repository on Python 3.10 with `tensorflow==2.15.1` was refused before it ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` Nothing was installed. Steps for me: list 2.
- **ADTOF-pytorch 0.1.0.** My trial agent reported that the permission policy refused both installing the cloned repository and running its command-line tool from a copy of its five reviewed `.py` files, with `Permission for this action was denied by the Claude Code auto mode classifier ... judged this action dangerous (it gave no explanation)`. The verifier couldn't check the refusals, since neither left a line in the run log. Its dependencies had installed. Steps for me: list 1.
- **Cluster and Separate (piano_svsep).** At first not attempted: its `setup.py` pins `torch==2.8.0`, the box has 2.15.0+cpu, the disk notice ruled out a second torch, and it isn't on PyPI. In the later round, the README's `pip install .` of the cloned repository, with the CPU build of the PyG wheel index, was refused before it ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` Its input file is ready (`S2n_truth_merged_single_track.musicxml`). Steps for me: list 4.
- **Deep Salience.** Its `replicate.yaml` pins Python 2.7.15 and TensorFlow 1.12.0, and the box has no Python 2.7. Steps for me: list 11.
- **drumsep.** At first not attempted, for time and disk (its weights come from Google Drive through gdown). In the later round its Demucs environment installed and its checkpoint downloaded. That's `49469ca8.th`, 167,400,043 bytes, a Hybrid Demucs model with four sources, `bombo`, `redoblante`, `platillos` and `toms`. Then the run on the taps stem and the Demucs drums stem of S6taps was refused before it started, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` Steps for me: list 10.
- **EngravingGNN.** A paper, with no code link found in its PDF. No steps.
- **ExpressiveGuitar-TechniqueClassifier.** It takes pre-computed feature vectors, the feature extractor isn't in the repository, and neither are the trained models (the four `.tflite` entries are links to paths on the author's machine). No steps.
- **Guitar string separation (deep-guitar-separation).** No trained weights in the repository, so a user trains it first, and its README commands pass `--cuda`. No steps.
- **Hi-Drum.** No code, weights or paper link on its project page. No steps.
- **Inverse Drum Machine.** Its code comes only as a cloned repository, and running one was refused for ADTOF-pytorch. It needs Python 3.10+ and Poetry. Its README documents passing onset times by hand to override its own transcription. Steps for me: list 7.
- **ipt~, libipt and the IPT Vamp plugin with `eguitar_ircam.ts`.** Not attempted, and no reason beyond that is recorded. The survey marks it as runnable with TorchScript on a CPU, not yet confirmed. No steps.
- **Joint Transcription of Acoustic Guitar Strumming Directions and Chords.** A paper about strumming, not fingerstyle, not checked further. No steps.
- **Klangio Drum2Notes.** A hosted commercial service. My agents here didn't run it, and no reason beyond that is recorded. No steps.
- **LarsNet.** At first its checkpoint, 562 MB according to its README, was above the disk notice's 200 MB limit. In the later round its PyPI dependencies installed, but the first call of the repository's own script, `separate.py --help`, was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` So the checkpoint wasn't downloaded and nothing was separated. Steps for me: list 9.
- **libfmp (HPS and HRPS).** Two harmonic-percussive splits in a music-processing library. Added to the list by the verifier. Not run, and no reason is recorded. No steps.
- **Magenta Onsets and Frames, drums checkpoint.** It needs the Magenta package, whose repository says `currently inactive (archived, read only)` and whose last PyPI release, 2.1.4, pins `tensorflow==2.9.1` and `numba==0.49.1`. No environment on the box has TensorFlow 2.9.1. Steps for me: list 12.
- **Martelloni, McPherson and Barthet's percussive guitar classifiers (PercCNN, PercVAE, TablaCNN).** No code, weights or data released, and their dataset, GPercRep, is `currently not public`. No steps.
- **McLeod and Steedman HMM voice separation.** Building it means compiling a cloned repository. The verifier tried `make` and the permission classifier refused it, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. Steps for me: list 5.
- **MDX23C DrumSep.** Left to my source-separation agents. No steps here.
- **MERTech.** A paper. Which instruments it covers, its code and its licenses weren't checked. No steps.
- **MidiBERT-Piano melody extraction.** No reason recorded in the trials, only a survey entry. No steps.
- **MT3 and YourMT3+.** Left to my audio-to-notes agents. No steps here.
- **Noise-to-Notes (N2N).** A paper, with no code link found in its PDF. No steps.
- **nussl.** No reason recorded in the trials. Its README says it's deprecated. No steps.
- **Omnizart drum mode.** It needs TensorFlow (`tensorflow>=2.5.0` in its PyPI requirements, which the `tensorflow-cpu` build other agents installed doesn't satisfy). None was on the box when my agents here first checked, and the disk notice ruled out a new install. In the later round, one install of `omnizart==0.6.3` with `tensorflow==2.15.1` and `tf-keras==2.15.1` on Python 3.10 was refused before it ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: The server-side auto mode classifier judged this action dangerous (it gave no explanation).` Steps for me: list 3.
- **Procedural fingerpicking data (Murgul and Heizmann).** No code found. The linked repository returned no refs, and its `README.md` and `LICENSE` answered 404. No steps.
- **QM Vamp Plugins, note onset detector.** No reason recorded in the trials, only a survey entry. It needs a Vamp host. No steps.
- **Riley and Dixon, drum transcription with drum stem separation.** A paper, with no code located. No steps.
- **Separate-and-Detect.** No reason recorded in the trials. The survey lists two conda environments, a manual patch to madmom, MusicLDM parts from Zenodo and commands that set `CUDA_VISIBLE_DEVICES`, and whether it runs on a CPU wasn't checked. No steps.
- **SoloLa (TENT).** Found by the verifier, and its files and license weren't read. No steps.
- **Sonic Annotator.** No reason recorded, and its files and license weren't read. No steps.
- **SpectroFusionNet.** A paper, with no code link found in its page. No steps.
- **STRUM.** A paper. The code link in its arXiv record is a placeholder, `https://github.com/<your-github-username>/autocharter`. No steps.
- **SuperFlux reference implementation.** No reason recorded. The same algorithm ran inside madmom (`SuperFlux`) and Essentia (`SuperFluxExtractor`). No steps.
- **TART.** A paper, with no repository link in either of its PDFs. No steps.
- **torchnmf.** No reason recorded in the trials, only a survey entry. No steps.
- **tuttut.** My guitar-tab agents' tool. Not run here, and no steps.
- **vocsep_ijcai2023.** No reason recorded in the trials. The survey says the repository has no pretrained weights and the code needs a WANDB account. No steps.

Datasets and recordings not downloaded:

- **AG-PT-set.** A dataset, not downloaded. No steps.
- **archive.org, `DavidDrewLongey-MusicFromAModernCave2005`.** CC BY 3.0. Not downloaded, because the item doesn't say which tracks have guitar. No steps.
- **archive.org, Racer Sessions (Danny Godinez).** A steel-string acoustic set whose description mentions `imaginative fingerstyle and percussive textures`. Not downloaded, because its license is the Public Domain Mark 1.0, not CC0 or CC BY, the two licenses my agents were asked to use in that round. Steps for me: list 8.
- **EG-IPT dataset.** Not downloaded. No steps.
- **Freesound sound 674811, "guitar body kick".** `curl` from the box got HTTP 403, and the download link needs a login. In the later round the page and a preview address both answered HTTP 403 again, and whether that came from Freesound or from the box's proxy wasn't verified. Steps for me: list 8.
- **GOAT.** Access is restricted, by request. No steps.
- **Guitar-TECHS.** Not downloaded. No steps.
- **guitar_style_dataset (Magcil).** Not downloaded (14,251,969,884 bytes). No steps.
- **IDMT-SMT-Chords.** Not downloaded. No steps.
- **IDMT-SMT-Guitar.** Not downloaded. No steps.
- **Wikimedia Commons, `Am7 Percussive Bass Tapping.webm`.** A bass, not a guitar, not obtained. No steps.
- **Wikimedia Commons, `Erik Mongrain-AirTap.ogv`.** One download attempt got HTTP 429 (not re-checked). Its description names lap-tapping and doesn't mention hits on the body, and whether the video has any wasn't checked. Steps for me: list 8.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| aubio | GPL-3.0-or-later, `either version 3 of the License, or (at your option) any later version.` ([source](https://aubio.org/manual/latest/cli.html)) | none | none |
| Basic Pitch | not recorded in my agents' files here | `nmp.onnx` ships in the package, license not recorded here | not recorded here |
| Demucs | not recorded in my agents' files here | HTDemucs and HTDemucs-6s weights, license not recorded here | not recorded here |
| Essentia | AGPL-3.0, `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications, thus it is possible to test the library before deciding to licence it under a comercial licence.` ([source](https://essentia.upf.edu/licensing_information.html)) | none in the onset algorithms. For Essentia's separate models, `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use, and are also available under a proprietary license upon request.` ([source](https://essentia.upf.edu/licensing_information.html)) | none recorded |
| libnmfd | MIT | none | none |
| librosa | ISC | none | no model. Its docs say its peak-picking `parameters were chosen by large-scale hyper-parameter optimization over the dataset provided by` CPJKU's onset_db, where my agents found no license file |
| madmom | BSD | CC BY-NC-SA 4.0, loaded by the CNN and RNN programs, `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0` and `If you want to include any of these files (or a variation or modification thereof) or technology which utilises them in a commercial product, please contact Gerhard Widmer` ([source](https://github.com/CPJKU/madmom)) | not stated. Which audio its onset models learned from is unverified |
| music21 | BSD-3-Clause | none | none |
| Open-Unmix | not recorded in my agents' files here | not recorded here | not recorded here |
| partitura | Apache-2.0 | none | none |
| scikit-learn | BSD-3-Clause | none | none |

Every clause, quoted with its link and the date it was read, is in [`survey.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/survey.md).

</details>

<!-- IMAGES -->
1. `fingerstyle-voices-taps-s2n-pitch-tracks.webp`
   - Source files: `/home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/samples/essentia-melodia/S2n.melodia.csv` (Essentia `PredominantPitchMelodia`, r0220, the 0 Hz version that gtr-eval checked as e0478) and `/home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/samples/bass-lowpass-pyin/S2n_f0_150.csv` (150 Hz low-pass plus librosa `pyin`, r0235, checked as e0564), drawn over the played notes of `/home/user/blog/docs/guitar-tab-research/inputs/S2n/S2n.truth.json` (sha256 `dad55e25200a10969150d4fe42297ce1247a464615b2583eb2c1feebedf749d9`, the same file gtr-eval used).
   - Written: `/home/user/blog/public/media/guitar-tab-tools/fingerstyle-voices-taps-s2n-pitch-tracks.webp`, 1280 x 720 WebP, 41,262 bytes, made with Pillow by `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/draw_fvt.py` (same frame, palette and fonts as the hosted-apis lane's pictures). Pitch rows MIDI 34 to 66. A track line breaks at an unvoiced frame or a jump of half a semitone or more.
   - Alt: Pitch against time over the 29-second clip S2n. Outlined boxes mark the 90 played notes, melody notes in an upper band around C4 and bass notes in a lower band around C3. A blue line labelled Essentia Melodia lies on the melody notes, with gaps. An orange line labelled low-pass + pyin lies on the bass notes, with short bends between notes, a short mark at C2 near 0 seconds and a rise above the bass band after the last note.
   - Caption: **Pitch tracks on S2n.** Essentia's melody tracker (r0220) and a 150 Hz low-pass plus librosa's pyin (r0235), drawn over the 90 played notes.
2. `fingerstyle-voices-taps-s6taps-onsets.webp`
   - Source files, all under `/home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/samples/`: `librosa-hpss/S6taps_m4_onsets_percussive.txt` (r0031, margin 4), `aubio/S6taps_hfc.txt` (r0079), `essentia/S6taps_od_complex.txt` (r0090, `OnsetDetection` complex), `madmom/S6taps_CNNOnsetDetector.txt` (r0247), 53 onsets each, drawn under the taps and note starts of `/home/user/blog/docs/guitar-tab-research/inputs/S6taps/S6taps.truth.json` (sha256 `bfc06fde964a8f7d9e123f983e71ae34125f4ceb3b0015a9e00329297c72fb11`).
   - Written: `/home/user/blog/public/media/guitar-tab-tools/fingerstyle-voices-taps-s6taps-onsets.webp`, 1280 x 720 WebP, 41,020 bytes, made with Pillow by the same script. Window 1.8 to 11.0 s, holding 12 of the 32 taps, 17 of the 48 note starts, 7 of the 21 note starts with no tap and 19 onsets from each detector.
   - Alt: Six rows of tick marks from 1.8 to 11 seconds of the clip S6taps. The top two rows mark when the 12 taps and the 17 note starts in that stretch were played. The four rows below, for librosa on the percussive part and for aubio hfc, Essentia complex and madmom CNN on the mix, each hold 19 blue ticks, one under every played tap and every note start. Shaded columns mark the 7 note starts with no tap, and every detector row has a tick in each of them.
   - Caption: **Onsets on S6taps, 1.8 to 11 s.** librosa on the percussive part at margin 4 (r0031), and aubio hfc (r0079), Essentia complex (r0090) and madmom CNNOnsetDetector (r0247) on the mix, under the 12 taps and 17 note starts played in that stretch.

<!-- PENDING MEDIA -->
All nine checked present at 00:02 UTC on 2026-11-11. Float32 files are 44.1 kHz mono, the others 16-bit 44.1 kHz stereo.

1. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-hpss/S6taps/m4/percussive.wav`: librosa HPSS percussive part of S6taps at margin 4 (r0031), float32, 29.357 s, 5,178,680 bytes.
2. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-hpss/S6taps/m4/harmonic.wav`: the harmonic part from the same split (r0031), float32, 29.357 s, 5,178,680 bytes.
3. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/libnmfd/S6taps/kam_percussive.wav`: libnmfd KAM percussive part of S6taps (r0238), float32, 29.357 s, 5,178,680 bytes.
4. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/libnmfd/S6taps/nmf_percussive.wav`: libnmfd KAM plus NMFD percussive part with the 0.25 threshold (r0238), float32, 29.357 s, 5,178,680 bytes.
5. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-nmf/S6taps/nmf_k16_oracle_taps.wav`: scikit-learn NMF k = 16 components of S6taps grouped with the answer key (r0296), float32, 29.357 s, 5,178,680 bytes. Any caption must say the grouping used the answer key.
6. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/demucs-real/htdemucs_6s/R3b/bass.wav`: Demucs htdemucs_6s bass stem of R3b, the real home recording (-16.2 dB from the mix) (r0327), 18.000 s, 3,175,244 bytes.
7. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/demucs-real/htdemucs/R3c/drums.wav`: Demucs htdemucs drums stem of R3c, the real lesson video, which has no taps seen in its frames (-42.5 dB from the mix, peak -23.5 dBFS, 55 librosa onsets) (r0330), 18.000 s, 3,175,244 bytes.
8. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap1-RT1/demucs/htdemucs_6s/RT1/drums.wav`: Demucs htdemucs_6s drums stem of RT1, the real recording tagged tapping (-40.0 dB from the mix, 351 librosa onsets, its loudest moments at 0:31.8, 1:05.8, 1:08.4, 1:10.4 and 3:25.8) (r0554), 233.509 s, 41,190,956 bytes. Not listened to. RT1 is CC BY 3.0, so a caption must credit Chris Smuck. These figures are one run's. A second run of the same command (r0571, its stems deleted after the check) gave -37.3 dB, 23 librosa onsets and 7 of 180 peaks above -40 dBFS (0:31.8, 1:05.8, 1:08.3, 1:10.4, 2:00.8, 2:18.8, 3:25.8), so any caption must say the figures differ between two runs of one command.
9. Outside this lane's `out/` folder, the source-separation lane's file: `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S6taps/drums.wav`, Demucs htdemucs_6s drums stem of S6taps (r0054), the one whose librosa onsets were the 32 taps, 29.357 s, 5,178,644 bytes.

<!-- NUMBERS -->
Counts of the list
- 65 entries, 52 tools, apps and research projects (24 research-model, 18 open-source, 8 library, 2 commercial-app) plus 13 datasets and recordings: tools.json as on disk (modified 00:24 UTC on 2026-11-11, after commit d2e9a17), `tools[].kind`. Sources disagree here: the committed tools.json and the gap-round verification log ("`tools.json` (63 entries)") say 63. The two entries added after the commit are the archive.org items `RacerSessions-DannyGodinez11082015` (`not_run_reason`: license URL is the Public Domain Mark 1.0, neither CC0 nor CC BY, `for_aaron` true, for-aaron.md list 8 step 4) and `DavidDrewLongey-MusicFromAModernCave2005` (CC BY 3.0, `not_run_reason` "not downloaded, the item does not say which tracks have guitar", `for_aaron` false). trials.md "Gap round 1" (archive.org bullets, committed) already names both as candidates not downloaded, so the 65-entry count is used. Before that, 62 entries until gap round 1 added the RT1 entry at about 23:53 UTC.
- 11 tools tried, 41 of the 52 not run, 1 of the 13 datasets and recordings tried (RT1), 12 not: tools.json, `tools[].tried`.
- "steel-string acoustic set" and the quote `imaginative fingerstyle and percussive textures`: for-aaron.md list 8 step 4 and the Racer Sessions description in trials.md "Gap round 1". "the two licenses this round was asked to use": trials.md "Gap round 1".
- 23 of 25 onset detector settings on all 53 starts (RUNDOWN and SECTION): trials.md, madmom section ("The eight madmom programs report an onset at every one of the 53 events, as do librosa, the eight aubio methods and six of the eight Essentia runs on the mix"), 8 + 1 + 8 + 6 of 8 + 1 + 8 + 8.
- 32 taps (24 slap, 8 thump), 48 note-onset groups, 53 starts (27 tap+note, 21 note-only, 5 tap-only), 90 notes, 42 melody (MIDI 55 to 64), 48 bass (43 to 52), S5dropd bass 38 to 52: trials.md, "Facts about the inputs".
- S2n 29.357 s, nylon, two voices, 112 BPM: INPUTS.md, row S2n. S6taps = S2s notes (steel) plus GM side stick and acoustic bass drum: INPUTS.md, row S6taps. S2s steel: row S2s. S5dropd Drop D (D2 A2 D3 G3 B3 E4): row S5dropd.
- R1c 28.235 s, GuitarSet bossa nova comp, 148 notes: INPUTS.md, row R1c. 139 distinct note starts: trials.md, R1c section.
- R3a, R3b, R3c 18.000 s, real nylon-string videos, no ground truth: INPUTS.md rows R3a to R3c.
- Truth times 2.143 s (tap and note), 2.679 s (tap and note), 3.214 s (note, no tap), bass 2.143 s MIDI 43, 2.679 s 50, 3.214 s 43, 3.750 s 50: S6taps.truth.json and S2n.truth.json, and trials.md pyin section.
- "no real recording with body taps was obtained": trials.md, "A real recording with body taps: not obtained", and INPUTS.md ("A freely licensed video with a capo on the neck or with percussive body taps was not found in the time spent").
- 3 first-round runs with a 2-core slot (r0031, r0079, r0090): trials.md header. Four gap-round RT1 runs had 2-core slots (r0542, r0551, r0554, r0556), and r0534, r0557 and r0558 were `--nolock` light jobs: trials.md header note "(corrected in gap round 1 ...)" and runs.jsonl `locked`. Two slots of 2 cores, each job with 2 cores to itself: ENVIRONMENT.md "How runs were timed".
- No thread limit (`threads_env` empty in runs.jsonl): the voice-splitting runs r0184, r0185, r0258, r0260, r0263 and r0265, which are the only no-limit runs whose times the text gives. The gap-round light jobs r0534, r0549, r0552, r0557 and r0558, the verifier's r0577 and the first-round r0113, r0114, r0135 and r0138 have no limit either (no times in the text). Every other `--nolock` run whose time the text gives (r0220, r0233, r0235, r0238, r0247, r0252, r0292, r0296, r0325, r0327, r0330, r0415, r0416, r0420, r0443, r0444) has `OMP_NUM_THREADS`, `MKL_NUM_THREADS` and `OPENBLAS_NUM_THREADS` = 1.
- Main read and rundown, onsets on the three S6taps drums stems: htdemucs 34 (26 tap+note, 5 tap-only, 3 on neither, so 31 of 32 taps, e0173), htdemucs_6s 32 (27 + 5, e0171), umxhq 82 (27 + 21 + 5 and 29 on neither, e0971): trials.md drums-stem table and Open-Unmix paragraph.
- Main read, Melodia 1,587 to 2,012 of 2,529 on S2n, S2s, S6taps, S5dropd and 0 of 2,523 for the bass, pyin 2,018, 1,207, 984 of 2,523 and 11, 6, 8 of 48 bass notes among 71: see the Essentia and librosa lines below.
- RT1: 233.509 s, "With A New Tuning, You Can Fly", Chris Smuck, 2007, CC BY 3.0, archive.org item ChrisSmuckWithANewTuningYouCanFly, keywords "Acoustic, Tapping, Fingerstyle", body hits UNVERIFIED (not checked by listening), no ground truth: trials.md "Gap round 1", RT1 table, and tools.json RT1 entry.
- RT1 counts: librosa mix 931, percussive 1,231 (m1), 1,192 (m4), 946 (m16), energy 0.0254, 0.0048, 0.0009 (r0551, 79.7 s, 1,597.9 MB). aubio hfc 1,112, complex 558, specflux 1,349, madmom CNNOnsetDetector 1,124, SuperFlux 1,095, Essentia OnsetRate 981 (r0542, 13.99 s, 983.2 MB). Demucs htdemucs_6s bass -13.8, drums -40.0, other -2.5, guitar -8.1 dB, 351 onsets (r0554, 173.64 s, 261.5 s CPU, 2,142.2 MB), htdemucs bass -17.6, drums -41.4, other -0.2 dB, 1,078 onsets (r0556, 171.41 s). Peaks above -40 dBFS: htdemucs_6s 5 of 181 at 0:31.8, 1:05.8, 1:08.4, 1:10.4, 3:25.8, htdemucs 1 of 181 at 0:49.9 (r0558): trials.md "Gap round 1", RT1 section.
- RT1 second htdemucs_6s run (gap-round verifier, r0571, 2-core slot, wall 137.4 s): bass -13.5, drums -37.3, other -2.6, guitar -7.7 dB, 23 librosa onsets on the drums stem, 7 of 180 peaks above -40 dBFS at 0:31.8, 1:05.8, 1:08.3, 1:10.4, 2:00.8, 2:18.8 and 3:25.8 (measured in r0577), each of r0554's five times within 0.07 s of one of the seven: trials.md "Gap round 1" Demucs bullet and tools.json Demucs `verifier_rerun`. r0556 not repeated: verification log ("r0556 (htdemucs on RT1) was not repeated") and tools.json. "How far the RT1 drums-stem figures vary beyond two htdemucs_6s runs" is under "Still UNVERIFIED", so the text says it wasn't checked.
- Freesound gap-round HTTP 403 on the page and a preview address, source of the 403 UNVERIFIED: trials.md "Gap round 1".
- r0053, r0054, r0060, r0099, r0147 in 2-core slots: runs.jsonl (`locked` true, `n_cores` 2).
- No tool takes a capo or a tuning directly, note ranges in Basic Pitch, Melodia and pyin: survey.md Handoff 15 (with the trials.md addition).

aubio
- `aubio-tools 0.4.9-4.4build1`, eight methods, `aubioonset -i <wav> -O <method>`: trials.md, aubio section.
- `ModuleNotFoundError: No module named 'aubio._aubio'`: trials.md, aubio section.
- 53 to 62 onsets, on neither complex 1, energy 6, hfc 0, kl 9, mkl 1, phase 7, specdiff 1, specflux 5 (listed alphabetically, as in the source table): trials.md aubio table, e0077 to e0092.
- R1c hfc 101 / 58 (e1277), complex 104 / 60 (e1276), specflux 180 / 66 (e1278): trials.md R1c table.
- R3a, R3b, R3c hfc 61, 87, 47: trials.md R3 table.
- Excerpt `2.148254`, `2.681905`, `3.223061`: samples/aubio/S6taps_hfc.txt, first lines.
- 0.93 s, 2 cores, 35.1 MB: r0079 (runs.jsonl, trials.md).
- Constraint flags `-t`, `-M`, `-s`, `-B`, `-H`: trials.md aubio section.
- `onsets={'KD': [...], 'SD': [...], ...}`: survey.md Handoff 4, copied from `separate(..., onsets={'KD': [...], 'SD': [...], ...})` (tools.json aubio `handoffs_out` has `{'KD': [...], 'SD': [...]}`).

Basic Pitch
- 0.4.0, ONNX `nmp.onnx`: tools.json, trials.md Basic Pitch section.
- Command and `--minimum-frequency 77.78 --maximum-frequency 1396.91` (D#2 to F6): trials.md, r0252 and r0325.
- CSV header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`, rows not in time order: trials.md.
- 137, 201, 196, 130, 106 notes: trials.md, r0252. 90 of 90 matched on each synthesized clip: e0734, e0736, e0738, e0741. 47, 111, 106, 40 unmatched: computed as notes minus 90.
- Median 7.5 to 9.2 ms late: trials.md. MIDI 23 to 87 against 43 to 64: trials.md.
- S5dropd constrained 125 notes, 86 of 90, D2 onsets 8.571, 13.929, 18.214, 25.714 s: trials.md, e1222.
- Excerpt of first S2n notes: trials.md, Basic Pitch section, verbatim.
- 74.95 s, 28.2 s CPU, 393.9 MB (r0252), 33.63 s (r0416), 29.81 s (r0325): trials.md and runs.jsonl.
- `ModuleNotFoundError: No module named 'pkg_resources'`, `setuptools<81`: trials.md Basic Pitch install bullet ("the CLI then stopped with ...", so after the install), listed under "Still UNVERIFIED", stated as not reproduced.
- `File .../nmp.tflite cannot be loaded into either TensorFlow, CoreML, TFLite or ONNX`, r0033: trials.md Basic Pitch section and verification log.

Demucs
- 4.1.0, htdemucs, htdemucs_6s adds guitar and piano: tools.json, trials.md.
- Commands: trials.md Demucs sections, runs.jsonl r0053, r0054, r0327, r0330.
- htdemucs_6s drums 32 onsets, 27 + 5, 0 note-only (e0171, e0172). htdemucs 34, 31 of 32 taps, 3 on neither (e0173): trials.md drums-stem table.
- SI-SDR 5.67 dB (e0169), 6.98 dB (e0170). Definition: e0170 `definitions.si_sdr_db`.
- Centroid thump 233 to 817 Hz (8), slap 3,715 to 5,079 Hz (24), no overlap: trials.md, tap kind paragraph.
- Bass stems 58 to 63 dB below the mix, SI-SDR against the bass part -12.66, -9.63, -17.03, -6.54 dB (e0161, e0162, e0165, e0166): trials.md. Reference voice stems rendered by r0135 to r0138.
- Energy 0.998, 0.961 into `other`, 0.826, 0.623 into `piano`, 0.0041, 0.0217 into `guitar`: trials.md energy table.
- R3 guitar -0.1 to -0.3 dB, drums stems 42 to 65 dB below, 55 to 226 onsets, bass stems -16.2 dB (htdemucs_6s) and -15.1 dB (htdemucs) on R3b and -50.5 to -71.5 dB on R3a and R3c, `normalize=True` (docstring: "normalize the onset envelope to have minimum of 0 and maximum of 1 prior to detection"), "an absolute level gate was not tested": trials.md R3 section. No body taps seen in the frames: INPUTS.md caveats.
- `--shifts` defaults to 1, R3a onsets 226, 180, 208 (r0327, r0420, source-separation r0410): trials.md R3 verifier paragraph.
- 45.63 s / 1,199.7 MB (r0053), 29.74 s / 1,292.5 MB (r0054), 36.81 s / 1,240.4 MB (r0060), 73.43 s / 1,317.2 MB (r0099): runs.jsonl (`wall_s`, `max_rss_mb`). tools.json has no peak for these runs.
- 139.41 s, 74.2 s CPU, 1,354.1 MB (r0327), 126.16 s (r0330), 30.36 s (r0420): trials.md and runs.jsonl.

Essentia
- `essentia==2.1b6.dev1389`, 2.1-beta6-dev, MTG at UPF: tools.json, trials.md, survey.md.
- Onset pipeline and Melodia pipeline (hop 128 samples, 2.9 ms): trials.md, r0090 and r0220.
- On neither: complex 0, complex_phase 26, flux 6, melflux 8, rms 104, OnsetRate 0. hfc 52 onsets, 4 of 5 tap-only. SuperFluxExtractor 19 onsets, 9 + 6 + 3 = 18 starts: trials.md Essentia table, e0093 to e0109.
- OnsetRate R1c 86 / 64: e1279.
- Melodia frames within 50 cents: 1,589 (e0478), 2,012 (e0487), 2,008 (e0501), 1,587 (e0517) of 2,529, and 0 of 2,523 for the bass (e0483, e0492, e0509, e0528): computed as `raw_pitch_accuracy` x `n_ref_voiced_frames` from each eval (0.628 x 2,529 and so on, all within 0.002 of a whole number).
- `IndexError: index 5654 is out of bounds for axis 0 with size 5654`, e0440 to e0447: trials.md Melodia section. 5654 is S2n's (e0440, e0441). The others read 8348 (S2s), 8356 (S6taps) and 5651 (S5dropd), each clip's count of voiced frames: evals.jsonl.
- 2.12 s, 165.5 MB (r0090), 10.14 s, 177.1 MB (r0220): runs.jsonl, trials.md.
- Constraint names: trials.md Essentia sections.

libnmfd
- 1.0.0, AudioLabs Erlangen, demo notebook name and every parameter: trials.md libnmfd section.
- 3 components above 0.25 (0.661, 0.510, 0.370): trials.md.
- SI-SDR -1.95 dB (e0622), -1.81 dB (e0632): trials.md table.
- 53 onsets each (e0637, e0643), gaps 0.07 and 0.23 dB: trials.md.
- 186.68 s, 43.3 s CPU, 1,778.8 MB (r0238), 42.47 s, 1,780.9 MB (r0415): trials.md, runs.jsonl.
- `numpy<2.0.0`, `pandas<2.0.0`: trials.md install line.

librosa
- 0.11.0, `librosa.effects.hpss`, margins 1, 2, 4, 8, 16, onset call: trials.md, r0031.
- Butterworth 4th order at 150, 200, 250 Hz, `librosa.pyin(fmin=C2 65.4 Hz, fmax=C4 261.6 Hz, frame_length=4096, hop_length=441)`, notes step of at least 50 ms: trials.md pyin section.
- 53 onsets at every margin and on the mix (e0022 to e0041, e0053): trials.md.
- SI-SDR 0.37, 3.43, 3.68, 1.89 and -0.64 dB at margins 1, 2, 4, 8 and 16 (e0021, e0029, e0033, e0036, e0039): trials.md table.
- 0 of 21 in percussive parts, 21 of 21 in the mix: trials.md event-energy table.
- R1c 90 / 64 (e1280): trials.md R1c table.
- R3 onsets 81, 112, 54 and 86, 138, 71, energy 0.0009, 0.0005, 0.0018, S6taps 0.022: trials.md R3 table.
- pyin frames within 50 cents: 2,018 (e0564), 1,207 (e0572), 984 (e0582), S5dropd 1,980 (e0590) of 2,523: computed as `raw_pitch_accuracy` x `n_ref_voiced_frames`.
- 71 notes at every cutoff, 11 (e0566), 6 (e0576), 8 (e0584) of 48, 0 of 42 melody notes at 150 Hz (e0570), 4 at 200 Hz (e0579) and 4 at 250 Hz (e0587), 37 of 48 at 150 ms, median 80 ms late (e0611), S5dropd 11 of 48 (e0593): trials.md pyin table.
- Excerpt rows: samples/bass-lowpass-pyin/S2n_notes_150.csv, verbatim first seven lines.
- D2 73.4 Hz inside C2 to C4: trials.md pyin section.
- 39.91 s, 651.6 MB (r0031), 103.91 s (r0235), 101.22 s (r0233), 14.8 s CPU, 605 MB, 16.26 s (r0444), 14.79 s (r0292): trials.md, runs.jsonl.
- Constraint names: trials.md librosa and pyin sections.

madmom
- 0.17.dev0, commit 27f032e8, eight programs, `<Program> single <wav> -o <out>.txt`: trials.md madmom section.
- 10 ms and 5 ms steps, all 53 starts, 53 or 54 onsets, CNN +3.2 ms (largest 9.3 ms, e0681), SuperFlux -2.1 ms (largest 5.0 ms, e0712): trials.md.
- R1c CNN 97 / 71 (e1281), SuperFlux 94 / 66 (e1282), R3 CNN 64, 102, 57: trials.md.
- Excerpt `2.150`, `2.680`, `3.220`: samples/madmom/S6taps_CNNOnsetDetector.txt and trials.md.
- 30.88 s, 2.6 to 5.4 s each, 281.2 MB (r0247), 17.92 s (r0443): trials.md, runs.jsonl.

music21 and partitura
- music21 10.5.2, partitura 1.9.0: tools.json, trials.md.
- The M1 rule and the 112 BPM tempo from the truth file: trials.md voice-split sections.
- S2n truth: 1 part, 36 Chords, 18 single Notes, 12 Voice objects. 90 / 90 on S2n and S5dropd: trials.md truth table (r0184, r0185).
- Basic Pitch notes: music21 83, 79, 77, 81 of 90, 62 melody / 75 bass on S2n: trials.md Basic Pitch voice table.
- Threshold T = 53, 54 or 55 gives 90 of 90: trials.md "Facts about the inputs" and voice tables.
- 0.198 s, 0.265 s, 4.49 s, 159.2 MB (r0184), 6.2 to 7.8 s (r0258 to r0265): trials.md, runs.jsonl.
- partitura P1 2 voices of 10 and 80, 54 / 90, P2 42 and 48, 90 / 90: trials.md truth table. On S2n's Basic Pitch notes the rule labelled 8 notes melody with `True` (the voice with mean pitch 61.0 has 8 notes) and 4 with `False`: trials.md Basic Pitch voice table and the paragraph under it. Docstring cites Chew and Wu 2004 and the paper title: trials.md voice-separation section. 5 to 8 voices, S2n mono 1, 8, 33, 18, 35, 42 notes, 4 and 8 labelled melody, 48 to 55 of 90 (50, 55, 48, 48, 48, 48, 50, 51): trials.md Basic Pitch voice table.
- 0.022 to 0.033 s: trials.md truth table. Signature default `True` against `Defaults to False`: trials.md.
- Per-voice CSV `onset,offset,pitch`, tuttut handoff: survey.md Handoff 13.

Open-Unmix
- 1.3.0, umxhq, command: trials.md Open-Unmix paragraph and runs.jsonl r0147 (`--no-cuda --outdir`).
- Energy drums 0.0366 (-14.4 dB), other 0.924, SI-SDR 2.71 dB (e0950), 82 onsets on 27 + 21 + 5 and 29 neither (e0971, e0974), 10 of 21, bass -31.96 dB (e0965): trials.md.
- 96.63 s, 2 cores, 1,401.6 MB: runs.jsonl r0147 (`max_rss_mb`). tools.json has no peak.

scikit-learn
- 1.9.1: tools.json. No link given: tools.json `url` is the PyPI JSON API (`https://pypi.org/pypi/scikit-learn/json`), and survey.md "NMF libraries" gives no other URL.
- k = 8 and 16, 1 and 3 taps components, SI-SDR 1.46 and 4.10 dB, guitar 17.34 and 18.64 dB (e1124, e1138), 59 and 70 onsets, 6 and 17 on neither (e1147, e1143), `ConvergenceWarning: Maximum number of iterations 200 reached`, fits 2.3 s and 3.1 s: trials.md NMF section.
- 8.85 s, 515.3 MB (r0296): trials.md, runs.jsonl.

Not run
- Every reason line: tools.json `not_run_reason`, trials.md "Other candidates not run here" and "A real recording with body taps", survey.md "Not covered".
- Disk notice quote, printed from 21:16 UTC: trials.md Omnizart section. The UTC times of the first-round notice and of the gap-round attempts (ADTOF about 23:16, Omnizart 23:18, ADT_STR 23:20, LarsNet 23:22, drumsep 23:24, piano_svsep 23:25) are kept in this list and left out of the text, per WRITING.md ("Drop ... UTC timestamps"). That also removes the old "after 21:31 UTC" for the two `tensorflow-cpu` 2.12.1 installs, which were at 21:31 and 21:51 UTC (trials.md Omnizart section, verifier's check).
- Refusals: the gap-round verifier read the six gap-round refusals, with their commands, in the gap agent's session transcript (verification log "Refusals", at 23:16:04, 23:18:44, 23:20:15, 23:21:58, 23:24:11 and 23:25:22 UTC). The two ADTOF-pytorch refusals stay the trial agent's report (first verification log, "Still UNVERIFIED"). McLeod: the first-round verifier's own attempt.
- ADTOF-pytorch refusal quote, unverified: trials.md ADTOF-pytorch section and "Still UNVERIFIED".
- McLeod refusal quote `[Code from External]`: trials.md "Other candidates" (verifier's attempt).
- ADT_STR 289,134,056 bytes for `setting-tau-0.8/model.safetensors`, `torch==2.8.0`, `torchaudio==2.8.0`: trials.md (first round, verifier's additions), tools.json ADT_STR `unverified`, for-aaron.md list 6 step 3. for-aaron.md's list 6 intro says "289 MB per variant", but no size is recorded for `setting-tau-0.4` or `0.6`, so the text gives the one file. Gap round at 23:20 UTC, Python 3.12, `-r pyproject.toml`, refusal quote `[Code from External]`, checkpoint not downloaded: trials.md "Gap round 1", ADT_STR section.
- ADTOF `tensorflow>=2.13.0`, `tensorflow-cpu` 2.12.1 installed by two other lanes at 21:31 and 21:51 UTC: trials.md (first round, the verifier's check in the Omnizart section, and the first verification log "from 21:31 and 21:51 UTC"). Gap round install at about 23:16 UTC, Python 3.10, `tensorflow==2.15.1`, refusal quote `[Code from External]`, nothing installed, no ledger line: trials.md "Gap round 1", tools.json `not_run_reason` (updated 23:17 UTC), for-aaron.md list 2.
- piano_svsep `torch==2.8.0`, box torch 2.15.0+cpu: trials.md (first round). Gap round at 23:25 UTC, `pip install .` with `--find-links https://data.pyg.org/whl/torch-2.8.0+cpu.html`, refused with `[Code from External]`: trials.md "Gap round 1", piano_svsep section.
- Deep Salience Python 2.7.15, TensorFlow 1.12.0: trials.md.
- LarsNet 562 MB: trials.md (first round), the README's figure, never downloaded (tools.json LarsNet `unverified`, gap-round log "Still UNVERIFIED"), so the text says "according to its README". Gap round: PyPI dependencies installed at 23:21:48 UTC, `separate.py --help` refused at 23:22 UTC with `[Code from External]`, checkpoint not downloaded: trials.md "Gap round 1", LarsNet section. Magenta 2.1.4, `tensorflow==2.9.1`, `numba==0.49.1`, `currently inactive (archived, read only)`: tools.json, trials.md.
- Omnizart `tensorflow>=2.5.0`: tools.json, trials.md. Gap round install at 23:18 UTC, `omnizart==0.6.3`, `tensorflow==2.15.1`, `tf-keras==2.15.1`, Python 3.10, refusal quote: trials.md "Gap round 1".
- Runnable with TorchScript on a CPU, not yet confirmed: survey.md item 31 and trials.md, paraphrased because the source's mark contains a semicolon.
- `currently not public` (GPercRep): tools.json.
- STRUM placeholder link: tools.json.
- Freesound HTTP 403, AirTap HTTP 429 (not re-tested, "Still UNVERIFIED"), AirTap lap-tapping: trials.md.
- guitar_style_dataset 14,251,969,884 bytes: tools.json.
- drumsep gap round: `49469ca8.th`, 167,400,043 bytes, `HDemucs`, sources `bombo`, `redoblante`, `platillos`, `toms`, run refused at 23:24 UTC with `[Code from External]`: trials.md "Gap round 1", drumsep section.
- for-aaron.md list numbers 1 to 12: for-aaron.md headings.

Licenses
- aubio GPL-3.0-or-later and quote: tools.json, survey.md aubio license facts.
- Essentia AGPL-3.0 and both quotes (spelling `comercial` as in the source): tools.json, survey.md Essentia license facts.
- madmom BSD code (tools.json `spdx` "BSD", survey.md: a BSD-style text, PyPI license field "BSD, CC BY-NC-SA"), CC BY-NC-SA 4.0 model files, both quotes, CNN and RNN programs load the model files: survey.md madmom license facts.
- librosa ISC, onset_db with no license file: survey.md librosa license facts.
- libnmfd MIT, partitura Apache-2.0, music21 BSD-3-Clause, scikit-learn BSD-3-Clause: tools.json.
- Basic Pitch, Demucs, Open-Unmix license not stated: tools.json `unverified` for each.

Pictures
- Window 1.8 to 11.0 s, 12 taps, 17 note starts, 7 note-only, 19 onsets per detector: printed by draw_fvt.py from the truth file and the four sample files.
- Melodia 10,116 frames, 5,654 voiced, pyin 2,936 frames, 2,540 voiced: printed by draw_fvt.py, matches trials.md.
- Row labels of `fingerstyle-voices-taps-s6taps-onsets.webp`, read from the picture: librosa "percussive part", aubio "hfc, mix", Essentia "complex, mix", madmom "CNN, mix". The caption and alt text now name each row's method and signal, as the IMAGES source-file list does.

Things that looked off in the sources
- tools.json gives `cores: null` for r0054, r0060 and r0099 and no peak memory for r0053, r0054, r0060, r0099, r0147 and r0330. runs.jsonl has 2 cores (slot) for the first five and the peaks used above.
- tools.json on disk (65 entries) is newer than the committed file and the gap-round verification log (63 entries). See "Counts of the list". Commit d90f43e (00:42 UTC) has since committed the 65 entries.
- Sources changed during this repair: a second gap round, committed in d90f43e ("gap rounds in progress", 00:42 UTC) with more trials.md text uncommitted at 00:49 UTC, ran libfmp (r0620, "Gap round 2", gap F1) and `eguitar_ircam.ts` (r0643, gap F2), and wrote MidiBERT-Piano up as not run with a new reason (gap F3, for-aaron.md list 13). tools.json now marks 13 of the 52 as tried. No verification log covers that round yet, so this fragment still gives the state the gap-round-1 verification covers: 11 tools ran, 41 didn't, libfmp and ipt~ in the not-run list, MidiBERT with "no reason recorded". These lines need an update pass once that round is verified.
- Glosses added in the repair (fingerstyle, capo, CC BY 3.0, dBFS, MIDI note numbers, spectrogram, MusicXML, ONNX, velocity, checkpoint, slot, thread) are definitions of terms, not figures from the runs.
- survey.md's madmom section still quotes trials.md's old wording "10 ms resolution". trials.md's verifier changed it to 10 ms steps for six programs and 5 ms for ComplexFlux and SuperFlux, which is what the fragment uses.
- survey.md says partitura ran in r0113 and r0114. trials.md says r0184 and r0185 superseded them and their outputs were overwritten (UNVERIFIED), so only r0184 and r0185 are cited.
