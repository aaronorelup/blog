<!-- RUNDOWN -->
- **My agents linked 15 tools from the other lanes into five chains, running 8 of them and reusing files the other 7 had already made.** On S4, a band mix I synthesized so every note is known, Demucs, Basic Pitch and tuttut together found 233 of the 369 guitar notes. My agents then wrote the tab into a Guitar Pro file, the format of the Guitar Pro tab app. At the clip's real tempo of 116 beats per minute, 223 of the 369 were found in it. At 115, the tempo taken from the median gap between the beats a beat tracker marked, 57 were.

<!-- SECTION -->
## Tools handing off to each other

My agents linked 15 tools from the other lanes into five chains. They ran 8 of the tools themselves, and for the other 7 they used the files those tools had already made in their own lanes on the same cloud box. In the app this research is for, each step would hand its result to the next. A guitar track pulled out of a song would go to a note finder. Its notes would go to a tab writer that picks a string and fret for each one, and the tab would go to a player. The chains used eight clips: five I synthesized so every note is known, a real band song and two real guitar videos.

S4 is a 39-second band mix I synthesized. One chain took it all the way to a Guitar Pro file, the format of the Guitar Pro tab app. It used Demucs to pull out the guitar, Basic Pitch to find its notes and tuttut to pick a string and fret for each. Before the file, that chain found 233 of the 369 real guitar notes, and 214 of them were on the same string and fret as the real part. A note counts as found when it starts within 50 ms of a real note and is within half a semitone of its pitch. A semitone is the step from one fret to the next. My agents' three other pairings, with the becruily separator or with LilyPond as the tab writer, found 217 to 229 and put 106 to 199 on the real string and fret. In the Guitar Pro file, 223 of the 369 were found at 116 beats per minute, the clip's real tempo. At 115, the tempo taken from the median gap between the beats a beat tracker marked, 57 were.

A capo is a clamp across the strings that raises every note. The two tab writers, tuttut and LilyPond, have no setting for one. So for the clip played with a capo on fret 2, the capo went in as open strings tuned 2 semitones up. Open strings are the ones played without pressing a fret.

<ao-compare cols="2" aspect="62/27">
<figure><img src="/media/guitar-tab-tools/chains-s4-madmom-grid.webp" width="1240" height="540" alt="The first four bars of a tab drawn by alphaTab. A row of five chord diagrams named D, A, Bm, G and Em, each with all six strings marked x, then tempo 116, a 4/4 bar with two notes at fret 1 on the lowest string, a bar of rests, and bars 3 and 4 with the chord names D and A over tab numbers."><figcaption><b>On madmom's beats</b><span class="ao-meta">S4 at the end of the full-song chain. Demucs pulled out the guitar stem, the guitar's own track. Basic Pitch found its notes and tuttut picked a string and fret for each. madmom gave the bars and chord names, PyGuitarPro wrote the file and alphaTab drew it. Bars 1 to 4 of 18.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/chains-s4-beatthis-grid.webp" width="1240" height="540" alt="The first five bars of the same tab on another beat grid. Six chord diagrams named D, A, Bm, G, Em7 and A7, all strings marked x, tempo 116, then a 1/4 bar of rests, a 3/4 bar with the chord name D and two notes at fret 1 on the lowest string, a 4/4 bar of rests, and bars 4 and 5 with tab numbers and the chord name A over bar 5."><figcaption><b>On <code>Beat This!</code> beats</b><span class="ao-meta">The same tab notes on the bars of the <code>Beat This!</code> beat tracker, with chord names from Chordino, a chord recogniser. The file opens with a 1-beat and a 3-beat bar. Bars 1 to 5 of 19.</span></figcaption></figure>
<figure class="wide"><img src="/media/guitar-tab-tools/chains-r3c-fingertip-cells.webp" width="1200" height="260" alt="A guitar neck from a lesson video, warped flat into a wide strip with the strings running left to right. Magenta vertical lines mark the lines OpenCV found, the numbers 1 to 19 along the top mark the fitted frets, and five green dots on the fretting hand are labelled index s2 f2, middle s3 f3, ring s3 f3, thumb s2 f3 and pinky s1 f4."><figcaption><b>Fingertips on fret cells</b><span class="ao-meta">Frame 225 of R3c, a real guitar lesson video. The neck is flattened from an outline set by hand. The magenta lines are the lines found by OpenCV, a computer vision library, and the fret numbers come from a fret model fitted to them. The dots are fingertips from MediaPipe, a hand tracker, marked with string (s) and fret (f). From "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb, via <a href="https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm">Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>, warped and marked up.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

The five chains, as my agents named them:

- A, full song to tab, beat grid and chords: S4, and R2, 36 seconds of a real band song with singing and no known answer.
- B, fingerstyle audio to melody, bass and taps. Fingerstyle means picking the strings with the fingers. S6taps is a 29-second fingerstyle clip I synthesized: a thumb bass under a melody, with drum-kit hits standing in for 32 taps on the guitar body. S2s has the same steel-string notes without the taps.
- C, a user correction: S5capo2, the same fingerstyle piece with a capo on fret 2, and S5dropd, the piece in Drop D (the lowest string tuned down to D).
- D, video with audio. R3b is 18 seconds of a home video of a classical guitar, a close view with the player's face out of frame and the whole fretboard in view. R3c is 18 seconds of a guitar lesson video with both hands in view. Neither has a known answer.
- E, tab to reference playback with a metronome in the browser: S4.

Found means a note that starts within 50 ms of a real note and is within half a semitone of its pitch, each real note counted once. A beat is found within 70 ms of a real one. Chord seconds are the time the chord label matched the real chord, compared as major or minor. Every tool ran with its defaults or with a setting another lane had already written down, and nothing was tuned. Eight tools ran in this lane. For the other seven, the files their own lanes had made went into the chains. Times are real elapsed seconds on 2 CPU cores unless the line says otherwise, and local runs cost nothing beyond the cloud session.

**alphaTab 1.9.0** ([link](https://github.com/CoderLine/alphaTab)). A library that draws tab in a web page and plays it back.

- In: chain A's Guitar Pro 5 files, S4 on the madmom grid (`S4.madmom.span.gp5`, 6,468 bytes), S4 on the `Beat This!` grid and R2 on the madmom grid. alphaTab loads a file by URL (`core.file`), here in headless Chromium, a browser with no window, on the web-tab-render lane's page or a copy of it with one option added.
- Command or settings: screenshots with that lane's `shot.cjs`, once with the page's defaults (r0522) and once with `?lazy=0`, which sets `core.enableLazyLoading = false` (r0523, below). In chain E, `exportAudio` made two renders in chunks of 1,000 ms with `useSyncPoints` off, one with the guitar track at volume 0 and one with the metronome at volume 0 (r0535, below).

```text
bash -c 'for f in S4.madmom.span S4.beatthis.span R2.madmom.span; do node /home/user/blog/docs/guitar-tab-research/lanes/web-tab-render/scripts/shot.cjs '"'"'http://127.0.0.1:8791/cpages/alphatab_chains.html?lazy=0&file=/chains/out/gp5/'"'"'$f'"'"'.gp5'"'"' out/render/$f.nolazy '"'"'window.__rendered === true'"'"' 60000 1240; done'
node /home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/scripts/drive.mjs '/cpages/chainE.html?gp=/chains/out/gp5/S4.madmom.span.gp5&beats=/chains/inputs/S4.madmom.downbeats.txt&gp0=-0.01&tag=S4.madmom.span' out/chainE/S4.madmom.span.result.json --port 8791 --timeout 300
```

- Out: the drawn tab, and a `renderFinished` log line with its size. S4 on the madmom grid: 18 bars, tempo 116, 1,200 x 2,353 px. alphaTab's default lazy loading puts off drawing parts of the page. With it on, the full-page screenshot showed bars 1 to 8 and blank space below. With it off, it showed all 18 bars. Chord names sat over their beats, and the header showed one chord diagram per name with every string marked x. S4 on the `Beat This!` grid: 19 bars, 1,200 x 2,381 px, opening with a 1/4 and a 3/4 bar. R2: 12 bars, 1,200 x 2,134 px. Chain E: two 37.76-second stereo float renders at 44.1 kHz. The metronome render held 73 clicks, one for each beat of the file.
- Time: r0522 4.61 s and r0523 4.32 s for the three files, 124.8 MB peak memory. The chain E page, r0535, took 47.71 s and 573.4 MB, not pinned to 2 cores because other lanes' jobs held both slots.
- Takes as a hint: none was given. It took the tempo (116) and the bars from the file.
- Hands off to: the screenshots are the pictures above. In chain E both renders went into one `AudioContext` (the browser's audio clock) with a click scheduled at each of madmom's 65 tracked beats, shifted by the file's start at -0.01 s in the audio. The guitar render started on the exact audio sample it was scheduled for, and all 65 clicks were found on theirs. Each tracked-beat click came 3.88 to 26.53 ms after the nearest alphaTab metronome click (mean 16.38 ms), 52 of 65 within 20 ms and 1 within 5 ms. alphaTab's own clicks inside the span of real beats came 10.07 to 11.45 ms before the real beats (r0538). That range lies within 0.07 ms of the file's -0.01 s start plus the -1.429 to 0 ms the browser lane measured for alphaTab's metronome against its own grid (r0195).

**Basic Pitch 0.4.0** ([link](https://github.com/spotify/basic-pitch)). Spotify's note finder: audio in, a list of notes out.

- In: four WAV files. S4's guitar stem from the becruily model (float32 stereo), R2's guitar stem from Demucs (16-bit stereo), and the harmonic parts of S6taps and S2s from librosa, the sustained sound left once the percussive hits were split off (float32 stereo). Basic Pitch loads each file at 22,050 Hz mono itself, so nothing was converted first.
- Command or settings: `bp_run.py` (36 lines) calls `predict()` with the audio-to-notes lane's defaults: the TFLite version of its model, onset 0.5, frame 0.3, minimum note length 127.70 ms, no frequency limits (r0511).

```text
venv-bp/bin/python /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/bp_run.py out/bp S4becruily-Guitar=/home/user/gtr/lanes/source-separation/out/msst-becruily-guitar/S4/Guitar.wav R2sep6s-guitar=/home/user/gtr/lanes/source-separation/out/htdemucs_6s/R2/guitar.wav S6taps-hpss-harmonic=/home/user/gtr/lanes/source-separation/out/hpss/S6taps/default/harmonic.wav S2s-hpss-harmonic=/home/user/gtr/lanes/source-separation/out/hpss/S2s/default/harmonic.wav
```

- Out: per file a MIDI file (a list of notes with start times) and a note-events CSV in seconds (`start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`). The MIDI has 220 ticks per quarter note and one tempo of 120 BPM (beats per minute), a fixed default and not the clip's tempo, so the seconds are what carries over.
  - S4 becruily stem: 406 notes, 229 of the 369 real guitar notes found (e1447).
  - S6taps harmonic part: 175 notes, 83 of 90 found, bass 41 of 48 and melody 42 of 42 (e1448). 92 had no real note to match. From the whole mix the audio-to-notes lane had 196 notes, 90 of 90 found, 106 with no match (e0512).
  - S2s harmonic part: 174 notes, 86 of 90, bass 44 of 48 and melody 42 of 42 (e1449), 88 with no match. From the whole mix 199 notes, 90 of 90, 109 with no match (e0495).
  - R2 stem: 305 notes from MIDI note 30 to 97, 29 of them below 40, the low E of standard tuning.
  - The four MIDI files hold no pitch-bend messages, though the CSVs carry bend values. With `multiple_pitch_bends` off, Basic Pitch 0.4.0 drops the bends of every note that overlaps another note in time, and every note in these four files overlaps another (runs r0589 and r0590, by the agent that checked this lane's work).
- Time: r0511, 24.68 s for the four files, 383.1 MB peak memory.
- Takes as a hint: a note range, `minimum_frequency` and `maximum_frequency` in Hz. For chain C the audio-to-notes lane ran it on S5dropd with 73.4 Hz and 1319 Hz for Drop D (r0349): 129 notes, 90 of 90 found (e1335). A range set for standard tuning, 82.4 to 1319 Hz, had removed the four D2 notes before any tab writer saw them (r0234: 86 of 90, e0544).
- Hands off to: tuttut as MIDI, and LilyPond as `.ly` text written from that MIDI (chains A and C), the voice split as CSV (chain B), and the taps join as note start times (chain B). The R3b and R3c notes for chain D came from the audio-to-notes lane's run r0264 (129 and 87 notes).

**`Beat This!` 1.1.0** ([link](https://github.com/CPJKU/beat_this)). A beat tracker: it marks each beat and the first beat of each bar, the downbeat.

- In: S4 and R2 audio, in the chords-beats-key lane's run r0397. Not run in this lane.
- Command or settings: the `final0` model.
- Out: two text files, `final0_beats.txt` and `final0_downbeats.txt`, one time in seconds per line. S4: 68 beats from 0.52 s with 65 of the 68 real beats found, and 18 downbeats with all 17 real ones found (e1494). R2: 43 beats and 11 downbeats.
- Time: not timed in this lane (r0397).
- Takes as a hint: not recorded in this lane.
- Hands off to: the Guitar Pro step as its bar grid (see PyGuitarPro). It put 3 beats and a downbeat in S4's silent first bar, so that file opens with a 1-beat and a 3-beat bar.

**becruily Mel-Band RoFormer guitar model, through MSST** ([link](https://huggingface.co/becruily/mel-band-roformer-guitar)). A separation model that pulls a guitar track out of a mix. It ran through MSST, a toolkit that runs separation models.

- In: `S4.wav`, a WAV at 44.1 kHz, 2 channels, 16-bit, 38.741 s, in the source-separation lane's run r0491. Not run in this lane. MSST's `msst-inference` wants a folder holding the file (`--input_folder`), a config and a checkpoint.
- Command or settings: `--model_type mel_band_roformer` with the checkpoint `becruily_guitar.ckpt` and `--force_cpu`.
- Out: one WAV, `Guitar.wav` with a capital G, float32 stereo, the one target the model has.
- Time: 289.53 s in the source-separation lane (r0491).
- Takes as a hint: not recorded in this lane.
- Hands off to: Basic Pitch (r0511, above). Demucs names its file `guitar.wav` and this model `Guitar.wav`, so picking the guitar stem took a rule for each tool.

**Chordino, through chord-extractor 0.1.3 and vamp 1.1.0** ([link](https://github.com/c4dm/nnls-chroma)). A chord recogniser: it names the chord at each moment of a recording. chord-extractor and vamp are the Python packages that run it.

- In: S4 and R2 audio, in the chords-beats-key lane's run r0215. Not run in this lane.
- Command or settings: as that run set them.
- Out: a `.lab` text file, one segment per line with start, end and a plain chord name (`D`, `Bm`). S4: 18 segments, the first (`N`, no chord) starting at 0.372 s, not at 0. The label matched the real chord for 34.34 of S4's 38.74 seconds (e1496). R2: 16 segments, `N F# Ebm Bmaj7 F# Bb7 Ebm B Bb7 Eb F7 F#6 C# Ab Bb Bdim`.
- Time: not timed in this lane (r0215).
- Takes as a hint: not recorded in this lane.
- Hands off to: the Guitar Pro step as chord names (see PyGuitarPro). It spells roots with flats (`Ebm`, `Bb7`), where madmom uses sharps (`D#:min`, `A#:maj`).

**Demucs 4.1.0, `htdemucs_6s` model** ([link](https://github.com/adefossez/demucs)). A separation model that splits a mix into six stems (a stem is one instrument's track pulled out of a mix).

- In: `S4.wav` and `R2.wav`, in the source-separation lane's runs r0021 (S4) and r0428 (R2). Not run in this lane.
- Command or settings: `-n htdemucs_6s -d cpu`, default options.
- Out: six WAVs with lowercase names, `drums.wav`, `bass.wav`, `other.wav`, `vocals.wav`, `guitar.wav` and `piano.wav`, 16-bit stereo. Some of S4's real guitar also landed in `piano.wav`, by that lane's measure.
- Time: 36.37 s for S4 (r0021).
- Takes as a hint: not recorded in this lane.
- Hands off to: Basic Pitch. On S4 the audio-to-notes lane's run r0243 turned the guitar stem into 342 notes with 233 of the 369 real guitar notes found (e0652), and tuttut then placed them (below). R2's guitar stem went through Basic Pitch in this lane (r0511, above).

**librosa 1.0.0, HPSS and onset detection** ([link](https://github.com/librosa/librosa)). HPSS splits audio into a sustained, harmonic part and a percussive part. The onset detector lists the times where new sounds start.

- In: the S6taps and S2s mixes, in the source-separation lane's runs r0262 (S6taps) and r0268 (S2s). Not run in this lane.
- Command or settings: HPSS `default` (margin 1), then `librosa.onset.onset_detect` on S6taps' percussive part.
- Out: `harmonic.wav` and `percussive.wav`, float32 stereo at 44.1 kHz, as long as the input. S6taps' onset list: 53 times in seconds, one per line, with no label. All 32 real taps were among the 53, and the other 21 were guitar-note attacks (e0815).
- Time: not timed in this lane (r0262, r0268).
- Takes as a hint: not recorded in this lane.
- Hands off to: Basic Pitch took the harmonic parts as they were (above). The onset list was joined with Basic Pitch's notes from S6taps' harmonic part by `chainB_taps.py` (54 lines, r0540, 0.03 s, not pinned). 5 onsets had no note within 50 ms, and they were the 5 real taps that fall between notes. The other 48 had a note: 27 were taps played with a bass note and 21 were notes with no tap. Timing alone didn't tell those 27 from those 21.

**LilyPond 2.24.3** ([link](https://lilypond.org/index.html)). A music engraver: it reads a text file and prints tab. The string and fret of each note come out as data through the guitar-tab lane's Scheme add-on, which logs each note's moment, string and fret.

- In: Basic Pitch's MIDI merged into one track, turned into LilyPond's own `.ly` text by the guitar-tab lane's `run_lilypond_tab.py`, which groups notes that start within 30 ms and writes them as 16th-note chords, a 16th note being a quarter of a beat.
- Command or settings: the system binary `/usr/bin/lilypond`, through the guitar-tab lane's scripts, run by `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_tab.sh` (r0514) and `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_chainC.sh` (r0528). Chain C told it Drop D (D2 A2 D3 G3 B3 E4) with `--tuning` and pinned one note with `--pin 1:55:4`.
- Out: an engraved tab and, through the add-on, a list of moment, string and fret. A note it can't place gets a `No string for pitch` warning and is left out.
  - S4, notes from the Demucs stem: 329 written with 13 warnings, 229 found, 199 on the same string and fret as the real part (e1451).
  - S4, notes from the becruily stem: 392 written with 14 warnings, 217 found, 106 on the real string and fret (e1453).
  - R2: 266 written with 39 warnings. No fret limit was given, so it wrote frets up to 33, with 3 notes above fret 19.
  - S5capo2, from the guitar-tab lane's run r0240 and compared note by note here: told nothing, 0 notes on the real string and fret counted from the capo (e0683). Told the capo, 90 found and 86 of them on the real string and fret (e0739). Of 136 paired notes, 95 kept their string and 41 moved.
  - S5dropd, same source: told nothing, 86 found and 72 on the real string and fret, with the 4 D2 notes given no string (e0700). Told Drop D, 90 of 90 found, all 90 on the real string and fret (e0740). All 125 paired notes kept their string, and 16 changed fret on it, the G2 on string 6 going from fret 3 to fret 5.
  - Drop D given to Basic Pitch and LilyPond both (r0528): 90 found, 90 on the real string and fret, no warnings (e1512).
  - The pin: LilyPond reads a string mark on a single note (`note\N`). The guitar-tab lane's `run_lilypond_tab.py` wrote the G3 of chord group 1, counting from 0, as `g\4`, a mark for string 4. Against the same run without the pin, 128 of 129 notes stayed the same. One changed: the G3 at 2.15 s moved from string 3 fret 0 to string 4 fret 5. That left 89 of 90 on the real string and fret (e1513), against 90 in e0740.
- Time: r0514, 9.80 s and 79.8 MB peak memory for the merge, tuttut and LilyPond on three files plus chain B's first tab try. r0528, 4.38 s and 75.8 MB.
- Takes as a hint: the tuning (`stringTunings`), `minimumFret`, `restrainOpenStrings`, `maximumFretStretch`, and a string mark on one note (`note\N`). No capo: the capo went in as open strings raised 2 semitones (`--capo-as-tuning 2`).
- Hands off to: nothing further here. Its add-on gives an order of chord groups and no rhythm, so the Guitar Pro step used tuttut's list.

**madmom 0.16.1** ([link](https://github.com/CPJKU/madmom)). An audio analysis library. Two of its programs went into the chains, the `DBNDownBeatTracker` for beats and bar starts and the CNN chord recogniser, CNN being a kind of neural network.

- In: S4 and R2 audio, in the chords-beats-key lane's runs r0072 (S4) and r0316 (R2). Not run in this lane.
- Command or settings: `DBNDownBeatTracker` and the CNN chord recogniser, as those runs set them.
- Out: `downbeats.txt`, one row per beat, `time<TAB>beat number`, with times on a 10 ms grid. S4: 65 rows from `2.070<TAB>1`, 65 of the 68 real beats found and all 17 downbeats (e1492). R2: 43 rows from `0.600<TAB>4`. The chord file is a `.lab` with start, end and a Harte label, a text form of chord names (`D:maj`, `B:min`). S4: 18 segments from 0.000 s, matching the real chord for 37.16 of 38.74 seconds (e1495). R2: 16 segments, every label major or minor.
- Time: not timed in this lane (r0072, r0316).
- Takes as a hint: not recorded in this lane.
- Hands off to: the Guitar Pro step as bar lines and chord names (see PyGuitarPro). madmom's separate beat tracker (`beats.txt`, another program) starts at 0.52 s with 74 beats, while the downbeat tracker starts at 2.07 s, at S4's count-in, the bar of four side-stick clicks before the song.

**MediaPipe Hand Landmarker 1.2.2** ([link](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)). A hand tracker: it marks 21 points on each hand it finds in a video frame.

- In: R3b and R3c, 450 frames each at 25 frames a second, in the video lane's group job r0408. Not run in this lane.
- Command or settings: as that job set them.
- Out: JSONL, a text file with one record per line. Here each line is a frame: `n`, `t_s` = n / 25, and per hand `label`, `score`, `index` and 21 landmarks as normalized x, y, z (`lm_norm_view`), as full-frame pixels (`lm_px_full`) and in metres (`world_m`). R3b: a `Left` (fretting) hand in 445 of 450 frames. R3c: both hands in all 450.
- Time: not timed in this lane (r0408).
- Takes as a hint: not recorded in this lane.
- Hands off to: `chainD_join.py` (99 lines, r0533, 0.53 s, not pinned). It mapped fingertips 8, 12, 16 and 20 through frame 225's neck model on every frame (see OpenCV) and matched each Basic Pitch note start to the nearest frame. A fingertip over a cell isn't necessarily pressing that string.
  - Frames with at least one of the four fingertips on a fret cell from 1 to 19: R3b 445 of 450, R3c 444 of 450.
  - Note starts with a frame within 20 ms: 129 of 129 on R3b and 87 of 87 on R3c, and every one of those frames had a fretting hand. With at least one fingertip on a string-and-fret cell: 129 of 129 and 85 of 87.
  - Pitch check, standard tuning and no capo (r0533, r0546). R3b: 65 of the 129 pitches matched an open string and 28 a fingertip cell, 85 one or the other, and 44 neither. With every fret moved by -1 the cell matches were 36, by +1, 27. R3c: 31 of the 85 pitches with cells matched an open string and 6 a fingertip cell, 36 one or the other, and 49 neither. With every fret moved by -1 the cell matches were 17, by +1, 6.
  - The fretting hand is taken as MediaPipe's `Left` label. The video lane found that the older MediaPipe `solutions` API labels the same R3c hand `Right`.

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A toolkit for working with music as notes. The fingerstyle lane's rule M1 uses its parse to label each note melody or bass.

- In: Basic Pitch's notes of the harmonic parts as the note-events CSV (S6taps 175 notes, S2s 174), read by the fingerstyle lane's `voice_split.py`. M1 writes them into a MIDI file at the real tempo, 112 BPM, for music21 to read.
- Command or settings (r0513, both clips and every rule of the script in one go):

```text
bash -c '/home/user/gtr/lanes/fingerstyle-voices-taps/venv-core/bin/python /home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/scripts/voice_split.py S6taps out/bp/S6taps-hpss-harmonic.notes.csv out/voicesplit/S6taps && /home/user/gtr/lanes/fingerstyle-voices-taps/venv-core/bin/python /home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/scripts/voice_split.py S2s out/bp/S2s-hpss-harmonic.notes.csv out/voicesplit/S2s'
```

- Out: a CSV of `onset, offset, pitch, voice`. S6taps: 77 notes labelled melody and 98 bass, and 64 of the 83 found notes got their real voice. S2s: 23 melody and 151 bass, 51 of 86. On S2s, 122 of the 174 notes couldn't be found again in music21's parse (same pitch within 0.1 s) and got the lane's default label, bass. On S6taps, none.
- Time: r0513, 4.23 s for both clips and every rule, 164.1 MB peak memory.
- Takes as a hint: a tempo, to write M1's MIDI. The real 112 BPM was given.
- Hands off to: tuttut, with the labels carried around it (below).

**OpenCV 5.0.0** ([link](https://github.com/opencv/opencv)). A computer vision library. Its LSD (line segment detector) found lines in a flattened picture of the neck.

- In: R3c frames 225, 0 and 449 as JPEG pictures. My agents set an outline of the neck by hand on frame 225, from three zoomed crops. Its corners are (1655, 335), (1705, 378), (1210, 903) and (1112, 858) in full-frame pixels, and the neck inside it was flattened to 1200 x 130. The video lane's scripts ran unchanged apart from the frame folder.
- Command or settings (r0532):

```text
bash -c '/home/user/gtr/lanes/video-hands-fretboard/venv-mediapipe/bin/python /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/video_lane_copy/run_opencv_lines.py out/chainD/opencv-lines-R3c --clip R3c --frames 225,0,449 --quad 1655,335,1705,378,1210,903,1112,858 --size 1200,130 && /home/user/gtr/lanes/video-hands-fretboard/venv-mediapipe/bin/python /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/video_lane_copy/handoff_fingertip_to_cell.py /home/user/gtr/lanes/video-hands-fretboard/out/mediapipe-hands/R3c_full.jsonl out/chainD/opencv-lines-R3c/opencv_lines_R3c.json out/chainD/handoff R3c 225'
```

- Out: 13 clusters of lines on frame 225. The one at 3.6 px was taken as the nut, the strip at the head end of the neck that the strings rest on. The others sit at 22.2 px, then from 540.8 to 1045.2 px. A 12-TET fret model, the fret spacing of an equal-tempered guitar, was fitted to them. It dropped 540.8 and 615.2 and took the 9 clusters from 685.4 to 1045.2 px as frets 9 to 17. Its fit error was 5.33 px RMS (root mean square) and 8.75 px at most. Fingertip cells on frame 225: index string 2 fret 2, middle string 3 fret 3, ring string 3 fret 3, pinky string 1 fret 4, and the thumb inside the board at string 2 fret 3. For R3b the video lane had fitted frets 8 to 19 the same way (r0214, r0402).
- Time: r0532, 2.22 s, 162.0 MB peak memory.
- Takes as a hint: none. The outline's corners and the flattened size go in on the command line.
- Hands off to: the frame-225 mapping was applied to all 450 frames in chain D's join (see MediaPipe), with the camera taken as fixed and the guitar as not moving, which wasn't tracked. Each string's cell is one of six equal strips across the neck. The fret numbers come from the 12-TET fit, which the video lane found can differ by one fret from counting the wires on R3b. Which numbering matches the guitar was not verified.

**partitura 1.9.0** ([link](https://github.com/CPJKU/partitura)). A package for written music. Its `estimate_voices` splits a list of notes into voices.

- In: the same Basic Pitch notes of the harmonic parts, through `voice_split.py`.
- Command or settings: `estimate_voices` with two settings, the lane's P1 and P2, in the same run as music21 (r0513, above).
- Out: 8 voices on each clip. The lane's labelling rule then marked 1 note melody and the rest bass, so 41 of the 83 found notes got their real voice on S6taps and 44 of 86 on S2s, the same with both settings.
- Time: part of r0513 (4.23 s for the whole run).
- Takes as a hint: not recorded in this lane.
- Hands off to: nothing. The tab writer got the labels of two other rules instead: B1, the fingerstyle lane's pitch threshold at MIDI note 55, and M1, its music21 rule.

**PyGuitarPro 0.11** ([link](https://github.com/Perlence/PyGuitarPro)). A library that reads and writes Guitar Pro files.

- In: three inputs, joined by `tab_beats_to_gp5.py`, a 195-line glue script, meaning a small script my agents wrote to pass one tool's output to the next. They are tuttut's list of notes with a start in seconds, a string and a fret but no lengths or bars, a beat tracker's grid from madmom or `Beat This!`, and the chord labels of madmom's CNN or of Chordino.
- Command or settings: `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_gp5.sh` (r0520). The glue script adds beats at the median beat gap before the first tracked beat, and after the last one until the last note is covered. It starts a bar at each beat within 35 ms of a downbeat. It cuts each beat into four 16th notes and moves each note to the nearest one. It keeps one note per string per 16th and sets the tempo by one of three rules. Median: 60 over the median gap between tracked beats. Span: from the first to the last tracked beat. Per bar: the span tempo plus a tempo change on every bar.
- Out: Guitar Pro 5 (GP5) files, with bars and time signatures, beats with note values at 960 ticks per quarter, one whole-number song tempo and optional tempo changes. 12 files: S4 and R2, each on the madmom and the `Beat This!` grid, with each tempo rule. Read back against S4's real notes:
  - S4 on the madmom grid: 18 bars, 325 of 342 notes written. 17 were dropped as a second note on the same string in the same 16th. Before the GP5, tuttut's list had 233 found and 214 on the real string and fret (e1450).
  - Median rule, 115 BPM. madmom's times sit on a 10 ms grid, so the median gap of a 116 BPM beat (0.5172 s) came out as 0.52 s. 57 of the 369 real guitar notes found, 52 on the real string and fret (e1486). The 16th slots drifted from the tracked beats by up to 0.295 s by the end. Beats where the file plays them: 14 of 68 found, downbeats 4 of 17 (e1488).
  - Span rule, 116 BPM, the clip's real tempo: 223 found, 210 on the real string and fret (e1497), drift at most 0.029 s. Beats 68 of 68 with 73 beats in the file, downbeats 17 of 17 (e1498). The 73 are 4 beats the glue added before the count-in, the 65 tracked beats and 4 added after the last one.
  - Per-bar rule, 115 to 117 BPM: 223 found, 210 on the real string and fret (e1500), beats 68 of 68 (e1501).
  - On the `Beat This!` grid: 53 found and 49 on the real string and fret at the median tempo (e1487), 223 and 210 at the span tempo (e1503).
  - Chord names: 17 of 18 written (the `N` segment has none). madmom's CNN labels in the madmom-grid file matched the real chord for 36.59 s at the span tempo (e1499) and 34.04 s at the median tempo (e1490). Chordino's in the `Beat This!`-grid file: 33.62 s (e1505) and 32.00 s (e1491).
  - A chord with `firstFret` unset made PyGuitarPro raise `GPException: ... got TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'` (run r0566, by the agent that checked this lane's work). The glue writes the names with `firstFret` 0 and no fingering, and alphaTab then drew an empty diagram for each.
  - R2 on the madmom grid: 72 BPM, the file's time 0 at -0.23 s in the audio, 12 bars of 2, 4 (ten times) and 1 beats, 264 of 298 notes written (34 dropped). On the `Beat This!` grid: 72 BPM, 266 written.
- Time: r0520, 1.99 s for the 12 files, 36.8 MB peak memory.
- Takes as a hint: nothing to analyse, it writes what it's given. A GP5 file holds one whole-number tempo plus tempo changes, and a tuning and a capo per track (the test set's own GP5 files were written that way with PyGuitarPro 0.11). It has no field for where its time 0 sits in the audio, so that offset (-0.01 s for S4 on the madmom grid) had to travel beside the file.
- Hands off to: alphaTab (the pictures above, and chain E).

**tuttut 0.0.7** ([link](https://github.com/natecdr/tuttut)). A MIDI-to-tab program: it picks a string and fret for each note.

- In: one MIDI file. tuttut pools all non-drum notes and takes bars from the MIDI time signatures. The notes came from Basic Pitch, merged into one track by the guitar-tab lane's `merge_midi.py`. Chain B's labelled notes went in through `chainB_voice_tab.py` (113 lines). It writes a MIDI file at 120 BPM and 220 ticks per quarter note. The notes are on instrument 25, steel-string guitar, at velocity 80, the MIDI word for how hard a note is played, and each lasts at least 10 ms. It gives tuttut standard tuning with 20 frets.
- Command or settings: `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_tab.sh` (r0514), `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_chainC.sh` (r0528), and for chain B (r0515):

```text
bash -c 'for clip in S6taps S2s; do for m in B1_threshold_T55 M1_music21; do /home/user/gtr/lanes/guitar-tab/venv-sym/bin/python -I /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/chainB_voice_tab.py out/voicesplit/$clip/$m.csv out/tab/chainB --name $clip.$m; done; done'
```

- Out: through the guitar-tab lane's `run_tuttut.py`, a list of notes with start time in seconds, string and fret, with no lengths and no bars. It leaves out notes of chords it can't finger and moves notes out of its range by octaves.
  - S4, notes from the Demucs stem: 342 written, 233 found, 214 on the same string and fret as the real part (e1450).
  - S4, notes from the becruily stem: 390 of 406 written, 220 found, 143 on the real string and fret (e1452).
  - R2: 298 of 305 written, 29 on open strings, highest fret 20 (its fret count), notes on strings 1 to 6: 30, 37, 63, 65, 66 and 37.
  - S6taps with the fingerstyle lane's B1 labels (a pitch threshold at MIDI note 55), all notes in one run: 171 of 175 written. Bass 40 of 48 found, 35 on the real string and fret (e1455). Melody 41 of 42 found, 31 on the real string and fret (e1456). 3 collisions, meaning a bass and a melody note on the same string while both sound. One run per voice: bass 41 found and all 41 on the real string and fret (e1458), melody 42 found and 29 on it (e1459), 6 collisions. 159 of the 171 notes got the same string and fret both ways.
  - S2s with B1 labels, one run: bass 43 found and 35 on the real string and fret (e1467), melody 41 found and 29 on it (e1468), 6 collisions. Per voice: bass 44 found and all 44 on the real string and fret (e1470), melody 42 found and 27 on it (e1471), 8 collisions. 153 of 170 the same both ways.
  - With music21's M1 labels: 23 collisions in one run and 29 per voice on S6taps, 10 and 12 on S2s. Melody notes found, 24 on S6taps and 8 on S2s, both ways (e1462, e1465, e1474, e1477).
  - S5capo2, from the guitar-tab lane's run r0240 and compared note by note here: told nothing, 90 of 90 found and 0 on the real string and fret counted from the capo (e0678). Told the capo, 90 found and all 90 on the real string and fret (e0732). Of 139 notes, 82 kept their string with every written fret 2 lower, and 57 moved string.
  - S5dropd, same source: told nothing, 86 found (the 4 D2 notes written as D3) and 72 on the real string and fret (e0695). Told Drop D, 90 found and 86 on the real string and fret (e0733). 14 of 126 paired notes moved string.
  - Drop D given to Basic Pitch and tuttut both (r0528): 90 found, 86 on the real string and fret (e1511).
- Time: r0514 9.80 s with LilyPond, 79.8 MB peak memory. r0515 1.21 s, 39.1 MB. r0528 4.38 s with LilyPond, 75.8 MB.
- Takes as a hint: the tuning (a `Tuning` with D2 on string 6 for Drop D), the fret count, the weights of its difficulty measure and a fixed number in its code for hand span. No capo: it went in as open strings raised 2 semitones (`F#4 C#4 A3 E3 B2 F#2`) with frets counted from the capo. No string or fret for a single note and no voice input, so the voice labels had to be carried around it. They were joined back by start time, within 2.5 ms, and by pitch class, the note name ignoring the octave. A first try joined within 1 ms and lost 18 to 20 labels per run, because MIDI ticks move start times by up to 1.1 ms (r0514, replaced by r0515).
- Hands off to: the Guitar Pro step (see PyGuitarPro).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Every run in this lane finished without an error. These are the parts my agents listed as not done. Each of the three below ran on the box in another lane. What wasn't done is the step that links it into a chain. No reason is recorded unless the line gives one, and this lane has no steps for me to try any of them myself.

- **alphaTab's real-time player** (chain E): not measured in this chain. The exported renders were played in the page's own audio clock instead, so the playback and the clicks shared one clock by construction. The browser lane had to tap the player's own audio nodes to record it (r0269).
- **RTMPose and YOLO pose** (chain D): two other models that mark points in video frames. RTMPose marks 21 points on each hand, and YOLO pose marks 17 points on the body, the wrists among them. Chain D wasn't run with their points. Their outputs are on disk in the video lane.
- **tutts** (chain A, as a third tab writer): not done, and no reason is recorded. In the guitar-tab lane's table tutts wrote as many notes as tuttut on 5 of the 8 clips. On S3, strummed chords I synthesized, it wrote 183 to tuttut's 186. R1a and R1c are real guitar recordings from GuitarSet, a research dataset. On R1a it wrote 193 to tuttut's 195, and on R1c 152 to 153. On those three clips tuttut reduces chords it can't finger to fewer notes, and tutts writes them empty.

Two other steps weren't done either: a GP5 file carrying two voices and a percussion track for the taps (chain B), and chain E on R2.

</details>

<details><summary>Licenses of the tools that ran</summary>

This lane recorded no licenses. Every tool in these chains came from another lane, and that lane's survey quotes its license, or records that none was found.

| Tool | License recorded in |
|---|---|
| alphaTab 1.9.0 | [web-tab-render](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/web-tab-render) |
| Basic Pitch 0.4.0 | [audio-to-notes](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/audio-to-notes) |
| `Beat This!` 1.1.0 | [chords-beats-key](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/chords-beats-key) |
| becruily Mel-Band RoFormer guitar model and MSST | [source-separation](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/source-separation) |
| Chordino | [chords-beats-key](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/chords-beats-key) |
| Demucs 4.1.0 | [source-separation](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/source-separation) |
| librosa 1.0.0 | [source-separation](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/source-separation) |
| LilyPond 2.24.3 | [guitar-tab](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/guitar-tab) |
| madmom 0.16.1 | [chords-beats-key](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/chords-beats-key) |
| MediaPipe Hand Landmarker 1.2.2 | [video-hands-fretboard](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/video-hands-fretboard) |
| music21 10.5.2 | [fingerstyle-voices-taps](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/fingerstyle-voices-taps) |
| OpenCV 5.0.0 | [video-hands-fretboard](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/video-hands-fretboard) |
| partitura 1.9.0 | [fingerstyle-voices-taps](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/fingerstyle-voices-taps) |
| PyGuitarPro 0.11 | [guitar-tab](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/guitar-tab) |
| tuttut 0.0.7 | [guitar-tab](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/guitar-tab) |

Each lane's quoted clauses are in its `survey.md`. This lane's full record, every handoff with its runs and checks, is `trials.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/chains).

</details>

<!-- IMAGES -->
1. Source `docs/guitar-tab-research/lanes/chains/samples/chainA/alphatab_S4.madmom.span.nolazy.webp` (1240x2353, 135,040 bytes, alphaTab 1.9.0 render of `S4.madmom.span.gp5` with lazy loading off, run r0523). Written `public/media/guitar-tab-tools/chains-s4-madmom-grid.webp`, 1240x540, 50,876 bytes, with Pillow: cropped to the box 0,20,1240,560 (the header and the first two systems, cut inside the blank rows 549 to 568), saved as lossless WebP.
   - Alt: The first four bars of a tab drawn by alphaTab. A row of five chord diagrams named D, A, Bm, G and Em, each with all six strings marked x, then tempo 116, a 4/4 bar with two notes at fret 1 on the lowest string, a bar of rests, and bars 3 and 4 with the chord names D and A over tab numbers.
   - Caption: **On madmom's beats.** S4 at the end of the full-song chain. Demucs pulled out the guitar stem, the guitar's own track. Basic Pitch found its notes and tuttut picked a string and fret for each. madmom gave the bars and chord names, PyGuitarPro wrote the file and alphaTab drew it. Bars 1 to 4 of 18.
2. Source `docs/guitar-tab-research/lanes/chains/samples/chainA/alphatab_S4.beatthis.span.nolazy.webp` (1240x2381, 137,176 bytes, run r0523). Written `public/media/guitar-tab-tools/chains-s4-beatthis-grid.webp`, 1240x540, 52,468 bytes, the same crop box (cut inside the blank rows 554 to 573) and steps.
   - Alt: The first five bars of the same tab on another beat grid. Six chord diagrams named D, A, Bm, G, Em7 and A7, all strings marked x, tempo 116, then a 1/4 bar of rests, a 3/4 bar with the chord name D and two notes at fret 1 on the lowest string, a 4/4 bar of rests, and bars 4 and 5 with tab numbers and the chord name A over bar 5.
   - Caption: **On `Beat This!` beats.** The same tab notes on the bars of the `Beat This!` beat tracker, with chord names from Chordino, a chord recogniser. The file opens with a 1-beat and a 3-beat bar. Bars 1 to 5 of 19.
3. Source `docs/guitar-tab-research/lanes/chains/samples/chainD/handoff_R3c_f0225_rectified.webp` (1200x260, 20,526 bytes, from run r0532). Written `public/media/guitar-tab-tools/chains-r3c-fingertip-cells.webp`, 1200x260, 25,800 bytes, with Pillow, no crop or resize, WebP quality 92. It is a crop of a CC BY 3.0 video, so the caption carries the attribution from INPUTS.md (R3c) and says it was changed.
   - Alt: A guitar neck from a lesson video, warped flat into a wide strip with the strings running left to right. Magenta vertical lines mark the lines OpenCV found, the numbers 1 to 19 along the top mark the fitted frets, and five green dots on the fretting hand are labelled index s2 f2, middle s3 f3, ring s3 f3, thumb s2 f3 and pinky s1 f4.
   - Caption: **Fingertips on fret cells.** Frame 225 of R3c, a real guitar lesson video. The neck is flattened from an outline set by hand. The magenta lines are the lines found by OpenCV, a computer vision library, and the fret numbers come from a fret model fitted to them. The dots are fingertips from MediaPipe, a hand tracker, marked with string (s) and fret (f). From "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb, via Wikimedia Commons (linked), CC BY 3.0 (linked to the license), warped and marked up.
   - The magenta lines sit at the 13 x positions of `lsd_fret_clusters_x` in `samples/chainD/handoff_R3c_f0225.json` (3.6, 22.2, 540.8 ... 1045.2), checked by eye against the picture.

All three were opened and looked at after writing. Not used: `alphatab_S4.madmom.span.webp` (the lazy page, bars 1 to 8 and blank space, described in the alphaTab entry) and `alphatab_R2.madmom.span.nolazy.webp` (a tab of the CC BY 4.0 song R2, which would need its own credit line).

<!-- PENDING MEDIA -->
All three under `/home/user/gtr/lanes/chains/out/chainE/`, checked present on 2026-11-11 with ffprobe. Derived from S4 (synthesized for the test set, see INPUTS.md). alphaTab 1.9.0 made the renders with its bundled SONiVOX SoundFont, `sonivox.sf2` (`scripts/pages/chainE.html` line 26), whose license the web-tab-render survey quotes as `Copyright (c) 2004-2006 Sonic Network Inc. Licensed under the Apache License, Version 2.0` (`web-tab-render/survey.md`, section "SoundFonts used by the web players above"). No credit decision was made here. It is left to the media step. No video was made in this lane.

1. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_alphatab_guitar_only.wav`: alphaTab 1.9.0's `exportAudio` render of the chain A file `S4.madmom.span.gp5` with the metronome at volume 0, the tab from the full-song chain played back at 116 BPM. 37.760 s, 2 channels float32, 44.1 kHz, 13,321,772 bytes (run r0535).
2. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_alphatab_metronome_only.wav`: the same render with the guitar track at volume 0, alphaTab's metronome alone, 73 clicks. 37.760 s, 2 channels float32, 44.1 kHz, 13,321,772 bytes (run r0535).
3. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_capture.wav`: the chain E page's capture, 3 channels: the guitar render, the clicks at madmom's tracked beats, and alphaTab's metronome, all on one `AudioContext` clock. 38.650 s (38.649615), 3 channels float32, 44.1 kHz, 20,453,420 bytes (run r0535).

<!-- NUMBERS -->
Sources: `trials.md` is `docs/guitar-tab-research/lanes/chains/trials.md` (the lane's only document: this lane has no `tools.json`, `survey.md` or `for-aaron.md`). Run ids are rows of `/home/user/gtr/ledger/runs.jsonl`, eval ids rows of `/home/user/gtr/eval/ledger/evals.jsonl`, all re-read for this fragment. "Found" is the eval's `n_matched` (or `n_matched_onset_only` for notes evals), "on the real string and fret" its `same_string_and_fret_count`. Peak memory is the ledger's `max_rss_mb`.

Counts of the lane
- 15 tools: the tools named at the head of chains A to E in trials.md: Demucs `htdemucs_6s`, becruily Mel-Band RoFormer through MSST, Basic Pitch 0.4.0, tuttut 0.0.7, LilyPond 2.24.3, madmom 0.16.1 (`DBNDownBeatTracker` and CNN chords, counted once), `Beat This!` 1.1.0, Chordino, PyGuitarPro 0.11, alphaTab 1.9.0 (chain A), librosa 1.0.0 HPSS and onset detection (counted once), partitura 1.9.0, music21 10.5.2 (chain B), MediaPipe Hand Landmarker 1.2.2, OpenCV 5.0.0 (chain D). The B1, B2, B3 and M1 rules are the fingerstyle lane's labelling rules, not tools.
- 8 ran in this lane: ledger rows with `lane: chains`, tools Basic Pitch (r0511), partitura and music21 (r0513 label "B1-B3 baselines, partitura 1.9.0, music21 10.5.2"), tuttut and LilyPond (r0514, r0515, r0528), PyGuitarPro (r0519, r0520), alphaTab (r0522, r0523, r0535), OpenCV (r0532). The other 7 came from other lanes' runs: r0021, r0428 (Demucs), r0491 (becruily/MSST), r0072, r0316 (madmom), r0397 (`Beat This!`), r0215 (Chordino), r0262, r0268 (librosa), r0408 (MediaPipe), as trials.md cites them. Those runs are rows of the same `runs.jsonl`, and ENVIRONMENT.md says "Every runtime in this folder was measured here unless the line says otherwise", so the 7 ran on the same box and the chains used their output files (trials.md "Beats and chords: the chords-beats-key lane's S4 and R2 outputs, not re-run", chain D "per-frame outputs on disk").
- Five chains A to E: trials.md section headings. Names used in the chain list: A "full song to tab, beat grid and chords", B "fingerstyle audio to melody, bass and taps", C "a user correction", D "video with audio", E "tab to reference playback with a metronome in the browser", copied from the headings.
- "In the app this research is for, each step would hand its result to the next": the project brief (the app was researched, nothing was built), and trials.md opening ("A chain here is not a product").
- Eight clips: S4, R2 (chain A), S6taps, S2s (chain B), S5capo2, S5dropd (chain C), R3b, R3c (chain D). Five synthesized, R2 a real band song, R3b and R3c real videos: INPUTS.md clip table.
- Not tuned, defaults or a documented setting: trials.md opening paragraph ("A chain here is not a product and was not tuned").
- Found within 50 ms and 50 cents (half a semitone), each note once, beats within 70 ms, chord time as mir_eval's `majmin` share x 38.741 s: trials.md "How to read the numbers".
- 2 cores per timed run, `--nolock` runs not pinned: trials.md "How to read the numbers", ENVIRONMENT.md "How runs were timed". Not pinned here: r0533, r0535, r0537, r0538, r0540, r0546 (ledger `locked: false`).
- No cost beyond the session: ENVIRONMENT.md "Cost".
- Every run without an error: trials.md verification log ("all exit 0"), ledger `exit_code` 0 for all 16 runs of the run list.

Clips (INPUTS.md clip table)
- S4 38.741 s ("39-second"), synthesized band, 116 BPM, 369 guitar notes (661 notes minus drums 194, bass 61, melody 37: e1450 `n_truth_left_out`).
- R2 36.000 s, real band song with singing, no ground truth.
- S6taps 29.357 s, the S2s notes (steel, program 25) plus GM percussion standing in for body taps, 32 taps. So S2s is the same steel-string notes without the taps. S2s the S2n notes on steel-string (program 25). S2n "alternating thumb bass plus a melody on top", 112 BPM. "Fingerstyle means picking the strings with the fingers": a term explanation (INPUTS.md describes R3a to R3c as "played with the fingers").
- S5capo2 capo on fret 2 ("sounds 2 semitones higher"). S5dropd Drop D (D2 A2 D3 G3 B3 E4).
- R3b 18 s, a 580.5 s home recording, classical (nylon) guitar, "Close view: the player's face is out of frame", "the whole fretboard from the nut to the sound hole is in frame". R3c 18 s, guitar lesson video, both hands visible. 450 frames each, 25 fps: trials.md verification log (ffprobe).
- S3 synthesized strummed chords. R1a and R1c GuitarSet excerpts, real guitar.
- R3c attribution and both links: INPUTS.md R3c row and "Sources, licenses and attribution".

Rundown and section
- 8 run, 7 reused from files the other lanes had made: see "Counts of the lane".
- The chain that went on to the Guitar Pro file is Demucs `htdemucs_6s` (r0021), Basic Pitch (the audio-to-notes lane's r0243), tuttut (r0514): trials.md chain A row "tab + beat tracker -> Guitar Pro 5" ("Before the GP5 (tuttut list): 233, 214 (e1450)") and the GP5 read-back (325 of 342 notes written, 342 being tuttut's count on the htdemucs_6s notes). The main read names this chain for that reason and gives the other three pairings beside it.
- 233 of 369 found, 214 on the real string and fret: e1450 (tuttut on the htdemucs_6s notes, r0514). trials.md chain A S4 table.
- The three other pairings, trials.md chain A row "notes -> tab assigner": e1451 (htdemucs_6s notes, LilyPond: 229 found, 199 on the real string and fret), e1452 (becruily notes, tuttut: 220, 143), e1453 (becruily notes, LilyPond: 217, 106). "217 to 229" and "106 to 199" are their lowest and highest values.
- Found within 50 ms and half a semitone (50 cents): trials.md "How to read the numbers". "A semitone is the step from one fret to the next", "Open strings are the ones played without pressing a fret": term explanations (INPUTS.md S5capo2: capo on fret 2, "sounds 2 semitones higher").
- "Guitar Pro file, the format of the Guitar Pro tab app": term explanation, unchanged from the earlier draft.
- 223 at 116 BPM (span tempo): e1497. 57 at 115 BPM (median tempo, round(60 / 0.52 s), the median gap between madmom's tracked beats): e1486 and the trials.md tempo-rules paragraph. "The truth tempo is 116 BPM": the same paragraph.
- The two tab writers, tuttut and LilyPond, have no capo setting, and the capo went in as open strings raised 2 semitones: trials.md chain C point 1 ("No tool here takes a capo", said of chain C's tools) and table (tuttut "has no capo parameter", `F#4 C#4 A3 E3 B2 F#2`, LilyPond raised `stringTunings`). The sentence names only the two tab writers, because a GP5 file does hold a capo per track (INPUTS.md "Guitar Pro 5": "capo as the track offset").
- "the clip played with a capo on fret 2" is S5capo2 (INPUTS.md).

Pictures
- Five diagrams D, A, Bm, G, Em, tempo 116, 18 bars, every string x: the image, and trials.md chain A row "GP5 -> alphaTab" and verification log. Six diagrams D, A, Bm, G, Em7, A7, 19 bars, 1/4 and 3/4 bars: the image, trials.md point 7 and verification log ("Beat This! file 19, 1200 x 2381").
- The two fret-1 notes on the lowest string in the first bars: the image, and `samples/chainA/S4sep6s-guitar.bp.gtreval.json` (first two notes, pitch 41, string 6, fret 1).
- R3c labels index s2 f2, middle s3 f3, ring s3 f3, thumb s2 f3, pinky s1 f4: the image, and trials.md chain D row "frame -> neck geometry". The numbers 1 to 19 along its top and the 13 magenta lines: the image, checked against `samples/chainD/handoff_R3c_f0225.json` (`lsd_fret_clusters_x`). Frame 225 and the attribution line: trials.md "One image derived from a video" and INPUTS.md R3c.
- Crops "Bars 1 to 4 of 18" and "Bars 1 to 5 of 19": the crop box 0,20,1240,560 on the two full renders, looked at (18 and 19 bars from the alphaTab logs).
- Caption 1 roles: the madmom-grid file carries madmom's beat grid and madmom CNN chord names, the `Beat This!`-grid file Chordino's (`batch_gp5.sh`, trials.md chain A point 11 and the chord row). "the guitar's own track" explains stem as the Demucs entry does. Caption 3: magenta lines and green dots as the alt text describes the image, the fret numbers from the 12-TET fit (trials.md chain D row "frame -> neck geometry").

alphaTab
- 1.9.0, `core.file`, headless Chromium, web-tab-render page and `shot.cjs`, `?lazy=0` sets `core.enableLazyLoading = false`: trials.md chain A tools paragraph and row "GP5 -> alphaTab", run list.
- `S4.madmom.span.gp5` 6,468 bytes: trials.md, ledger r0522 inputs.
- 18 bars, tempo 116, 1,200 x 2,353 px, `renderFinished`, lazy page bars 1 to 8 and blank space, all 18 with lazy off, chord names over beats, diagrams with every string x: trials.md chain A row and verification log, `samples/chainA/S4.madmom.span.log.json`.
- 19 bars, 1,200 x 2,381 px. R2 12 bars, 1,200 x 2,134 px: trials.md verification log.
- r0522 4.61 s, r0523 4.32 s, 124.8 MB each: ledger. r0535 47.71 s, 573.4 MB, `locked: false`: ledger, and trials.md verification log ("both slots held by other lanes' locked jobs").
- Chain E: `exportAudio` chunks 1,000 ms, `useSyncPoints` off, guitar volume 0 / metronome volume 0, two 37.76 s stereo float renders at 44.1 kHz, 73 clicks: trials.md chain E table and point 5. Both commands: ledger r0523 and r0535 `cmd_str`.
- 65 clicks at their scheduled frames, guitar render 0 frames off, click minus metronome +3.88 to +26.53 ms (mean +16.38), 52 of 65 within 20 ms, 1 within 5 ms, metronome minus real beat -11.45 to -10.07 ms, within 0.07 ms of -0.01 s plus -1.429 to 0 ms: trials.md chain E table and point 3, `samples/chainE/S4.madmom.span.analysis.json` (3.878, 26.531, 16.382, 52, 1, -11.451, -10.068). A Web Audio frame is one audio sample per channel, so "0 frames off" is written as "on the exact audio sample". r0538 is this lane's final analysis (run list, ledger label "chain E: analysis of the r0535 capture"), so it sits on the 10.07 to 11.45 ms sentence. The -1.429 to 0 ms is the browser lane's run r0195 (`browser-audio-sync/trials.md`, alphaTab section: "Run r0195 ... from -1.429 to 0 ms", repeated in r0329), the joint trials.md cites as "browser-audio-sync, r0143, r0195 / r0329".
- "headless Chromium, a browser with no window" and "lazy loading puts off drawing parts of the page": term explanations, the second matching what the two screenshots showed (bars 1 to 8 with it on, all 18 with it off, trials.md chain A point 10).
- -0.01 s file start in the audio: trials.md chain E input line and chain A point 6.

Basic Pitch
- 0.4.0, TFLite, onset 0.5, frame 0.3, minimum note 127.70 ms, no frequency limits, `bp_run.py` 36 lines, `predict()`: trials.md chain A tools and point 11, verification log line counts, `samples/chainA/basic-pitch-r0511-timings.json` `settings` (`minimum_frequency: null`).
- 22,050 Hz mono inside, no conversion: trials.md chain A row "guitar stem -> Basic Pitch".
- Input formats: becruily float32 stereo, htdemucs_6s PCM_16 stereo, HPSS float32 stereo: trials.md verification log "Formats".
- MIDI 220 ticks per quarter, one tempo 120 BPM, CSV header: trials.md chain A row "notes -> tab assigner" and verification log.
- Hands off to tuttut as MIDI and to LilyPond as `.ly` text written from that MIDI: trials.md chain A row "notes -> tab assigner", column "what B needed" ("tuttut: a MIDI file ... LilyPond: its own `.ly` text").
- "harmonic part ... the sustained sound left once the percussive hits were split off": the librosa entry's own explanation (HPSS, trials.md chain B tools).
- 406 notes, 229 of 369 (e1447). 175, 83 of 90, bass 41 of 48, melody 42 of 42 (e1448). 174, 86, 44 of 48, 42 of 42 (e1449). Mix 196, 90 of 90 (e0512), 199, 90 of 90 (e0495). No match 92, 106, 88, 109: trials.md chain B point 2 (175 - 83, 196 - 90, 174 - 86, 199 - 90).
- R2 305 notes, MIDI 30 to 97, 29 below 40: trials.md chain A R2 table.
- No pitch bends in the four r0511 MIDI files, `multiple_pitch_bends` off drops bends of overlapping notes, every note of the four overlaps: trials.md chain A row and verification r0589, r0590.
- r0511 24.68 s, 383.1 MB: ledger and trials.md run list.
- `minimum_frequency` 73.4 Hz, `maximum_frequency` 1319 Hz, r0349, 129 notes, 90 of 90 (e1335). 82.4 to 1319 Hz, r0234, 86 of 90 (e0544), four D2 notes removed: trials.md chain C table and point 2.
- R3b and R3c notes r0264, 129 and 87: trials.md chain D tools paragraph.

`Beat This!`
- 1.1.0, `final0`, r0397, two files, 68 beats from 0.52 s, 18 downbeats, 65 of 68, 17 of 17 (e1494). R2 43 and 11: trials.md chain A tools, table and R2 table, verification log.
- 3 beats and a downbeat in the silent first bar, 1-beat and 3-beat bar: trials.md chain A point 7.

becruily and MSST
- `msst-inference`, `--input_folder`, config and checkpoint: trials.md chain A row "mix -> separator". `--model_type mel_band_roformer`, `becruily_guitar.ckpt`, `--force_cpu`: ledger r0491 `cmd_str`.
- "MSST, a toolkit that runs separation models": `source-separation/survey.md` table row "Music-Source-Separation-Training (MSST, ZFTurbo) | training + inference for the 24 `--model_type` keys".
- `S4.wav` 44.1 kHz, 2 ch, 16-bit, 38.741 s. `Guitar.wav` float32 stereo, the model's only target: trials.md rows and verification log.
- 289.53 s (r0491): trials.md chain A row.
- Link: `https://huggingface.co/becruily/mel-band-roformer-guitar`, from `docs/guitar-tab-research/lanes/source-separation/trials.md` line 670 at 01:16 UTC (this lane names no URLs).

Chordino
- chord-extractor 0.1.3 and vamp 1.1.0: ledger r0215 label. "the Python packages that run it": `chords-beats-key/survey.md` entry 4 ("chord-extractor (Chordino wrapper)", PyPI) and its section "vamp (Python Vamp host ...)".
- 18 segments, first `N` at 0.372 s, plain names (`D`, `Bm`): trials.md chain A row "chord recogniser". 34.34 s (e1496, `majmin` 0.886327 x 38.741383 = 34.3375). R2 16 segments, the quoted list: trials.md R2 table. Flats against sharps: trials.md R2 table.

Demucs
- 4.1.0: ledger r0021 and r0428 `tool` field. `-n htdemucs_6s -d cpu`, default options: ledger r0021 `cmd_str` and label.
- Six lowercase PCM_16 stereo WAVs, the names: trials.md chain A row "separator -> guitar stem". Guitar also in `piano.wav`: same row ("true guitar also lands in htdemucs_6s `piano.wav`").
- 36.37 s (r0021): trials.md chain A row.
- r0243, 342 notes, 233 of 369 (e0652): trials.md "Joints the lanes had already run".

librosa
- 1.0.0, HPSS `default` = margin 1, float32 stereo, input length, `librosa.onset.onset_detect`, r0262, r0268: trials.md chain B tools paragraph and table.
- 53 onsets, all 32 taps, other 21 note attacks (e0815): trials.md chain B table.
- `chainB_taps.py` 54 lines, r0540 0.03 s not pinned, 5 / 48, 27 / 21: trials.md chain B table, run list, `samples/chainB/chainB_taps_S6taps.json`.

LilyPond
- 2.24.3, `/usr/bin/lilypond`, Scheme hook logging moment, string, fret, 30 ms groups as 16th chords: trials.md chain A tools and row "notes -> tab assigner".
- Commands: ledger r0514 and r0528 `cmd_str`. `--tuning`, `--pin 1:55:4`, `note\N`, `g\4`: trials.md chain C table. D2 A2 D3 G3 B3 E4: INPUTS.md S5dropd.
- 329, 13 warnings, 229, 199 (e1451). 392, 14, 217, 106 (e1453). R2 266, 39 warnings, frets up to 33, 3 above 19: trials.md chain A tables.
- S5capo2: 0 (e0683), capo told 90 found and 86 on the real string and fret (e0739: `n_matched` 90, `same_string_and_fret_count` 86), 136 paired, 95 kept, 41 moved: trials.md chain C table, `samples/chainC/diff_lane_outputs.jsonl`.
- S5dropd: 86, 72, 4 D2 notes without a string (e0700). 90 of 90 (e0740). 125 paired kept their string, 16 fret changes G2 string 6 fret 3 to 5: trials.md chain C table and verification r0574.
- Both stages: 90, 90, no warnings (e1512), r0528.
- Pin: 128 identical, 1 changed, G3 at 2.15 s string 3 fret 0 to string 4 fret 5, e1513 89 of 90 against 90 (e0740), 129 notes written: trials.md chain C table, `samples/chainC/diff_pin.json`. The `g\4` was written by the guitar-tab lane's `run_lilypond_tab.py --pin 1:55:4`: trials.md chain C row "pin one note".
- "a 16th note being a quarter of a beat": term explanation (the GP5 glue cuts "each beat interval into four 16ths", trials.md chain A).
- r0514 9.80 s, 79.8 MB. r0528 4.38 s, 75.8 MB: ledger.
- `stringTunings`, `minimumFret`, `restrainOpenStrings`, `maximumFretStretch`: trials.md "What each tab assigner ... exposes". `--capo-as-tuning 2`: trials.md chain C table.
- Order of chord groups, no rhythm: trials.md chain A point 4.

madmom
- 0.16.1, `DBNDownBeatTracker`, CNN chords, r0072, r0316: trials.md chain A tools.
- `time<TAB>beat number`, 10 ms grid, 65 rows from `2.070<TAB>1`, 65 of 68, 17 of 17 (e1492). R2 43 rows from `0.600<TAB>4`: trials.md chain A tables and verification log.
- Harte labels `D:maj`, `B:min`, 18 segments from 0.000 s, 37.16 s (e1495, 0.959235 x 38.741383 = 37.1621). R2 16 segments, major or minor only: trials.md chain A rows and R2 table.
- `beats.txt` 74 beats from 0.52 s, downbeat tracker from 2.07 s at the count-in: trials.md chain A point 7. The count-in as "the bar of four side-stick clicks before the song": INPUTS.md S4 row and "Count-in" convention ("one silent bar, then a count-in bar of four side-stick clicks (GM key 37), then the song"). "CNN being a kind of neural network": term explanation (`CNNChordRecognition` in `chords-beats-key/survey.md`).

MediaPipe
- Hand Landmarker 1.2.2, r0408, 450 frames, 25 fps, JSONL fields, 445 of 450, both hands in 450: trials.md chain D tools and table, verification log.
- 21 landmarks: trials.md chain D table ("21 landmarks").
- `chainD_join.py` 99 lines, r0533 0.53 s not pinned, fingertips 8, 12, 16, 20, cells 1 to 19: trials.md chain D table, point 7, run list.
- 445 of 450, 444 of 450. 129 of 129, 87 of 87, 129 of 129, 85 of 87: trials.md chain D table.
- Pitch check 65 / 28 / 44, 36 and 27, R3c 31 / 6 / 49, 17 and 6: trials.md chain D table and point 4. "85 one or the other" and "36 one or the other": `samples/chainD/R3b.join.json` and `R3c.join.json` (`pitch_open_or_fingertip_cell`).
- `Left` label, `Right` with the older `solutions` API: trials.md chain D point 5. A fingertip over a cell isn't necessarily pressing: point 6. "marks 21 points on each hand it finds in a video frame": trials.md chain D table (21 landmarks per hand) and R3b's 445 of 450 frames.

music21
- 10.5.2, M1, MIDI at 112 BPM, `voice_split.py`: trials.md chain B tools, table and point 5. Command: ledger r0513 `cmd_str`.
- CSV `onset, offset, pitch, voice`: trials.md chain B row "labelled notes -> tab assigner".
- 77 melody 98 bass, 64 of 83. 23 melody 151 bass, 51 of 86. 122 of 174 not found again within 0.1 s, default bass. S6taps 0: trials.md chain B table, `samples/chainB/*.voice_split.json`.
- r0513 4.23 s, 164.1 MB: ledger.

OpenCV
- 5.0.0, LSD, R3c frames 225, 0, 449, corners (1655, 335), (1705, 378), (1210, 903), (1112, 858), 1200 x 130, three zoom crops, scripts unchanged but the frame folder: trials.md chain D tools paragraph. Command: ledger r0532 `cmd_str`.
- 13 clusters, 3.6 nut, 22.2, 540.8 ... 1045.2, dropped 540.8 and 615.2, 9 clusters 685.4 ... 1045.2 as frets 9 to 17, RMS 5.33 px, max 8.75 px, cells: trials.md chain D table. R3b frets 8 to 19 (r0214, r0402): same table.
- r0532 2.22 s, 162.0 MB: ledger.
- Fixed camera, six equal string lanes (written "strips" in the post, since "lane" there means a research lane), 12-TET can differ by one fret on R3b, UNVERIFIED which is right: trials.md chain D points 3 and 4, verification log "UNVERIFIED".
- "LSD (line segment detector)": `cv2.createLineSegmentDetector() (LSD, default parameters)` in `video-hands-fretboard/scripts/run_opencv_lines.py` line 11. "the nut, the strip at the head end of the neck that the strings rest on": term explanation (INPUTS.md R3b and R3c: "the whole fretboard from the nut to the sound hole").

partitura
- 1.9.0, `estimate_voices`, P1 and P2, 8 voices, 1 note labelled melody, 41 of 83 and 44 of 86: trials.md chain B table, `samples/chainB/*.voice_split.json` (`P1_partitura_poly`, `P2_partitura_mono`).
- The tab writer got B1 (threshold at MIDI 55) and M1 (music21) labels: trials.md chain B tools paragraph and the r0515 command (`for m in B1_threshold_T55 M1_music21`).

PyGuitarPro
- 0.11, `tab_beats_to_gp5.py` 195 lines, command (ledger r0520 `cmd_str`), the glue's rules (median-gap padding, last note covered, 35 ms downbeat window, four 16ths, nearest 16th, one note per string per 16th, three tempo rules): trials.md chain A row "tab + beat tracker -> GP5", the tempo-rules paragraph and point 11.
- GP5 bars, time signatures, 960 ticks per quarter, one integer tempo, tempo changes: trials.md same row. 12 files: run list r0520.
- 325 of 342 written, 17 dropped, 18 bars: trials.md row, `samples/chainA/S4.madmom.span.gp5.readback.json`.
- 115 BPM = round(60 / 0.52 s), 0.5172 s as 0.52 s, 57, 52 (e1486), drift up to 0.295 s, 14 of 68 (e1488), 4 of 17: trials.md tempo paragraph and row "beat tracker -> bar lines".
- 116 BPM, 223, 210 (e1497), drift at most 0.029 s, 68 of 68, 73 beats, 17 of 17 (e1498), 73 = 4 + 65 + 4: trials.md same, verification correction 5. (The read-back JSON lists `beats_added_after` 5. Per trials.md chain E table, the fifth only closes the final beat.)
- Per bar 115 to 117, 223, 210 (e1500), 68 of 68 (e1501). `Beat This!` grid 53, 49 (e1487), 223, 210 (e1503): trials.md row.
- 17 of 18 chord names, 36.59 s (e1499), 34.04 s (e1490), 33.62 s (e1505), 32.00 s (e1491): trials.md chord row, eval `majmin` x 38.741383 (0.944593, 0.878687, 0.867824, 0.825913).
- `GPException` text: trials.md verification table, r0566. `firstFret` 0, no fingering, empty diagrams: trials.md chord row and point 9.
- R2 72 BPM, time 0 at -0.23 s, 12 bars of 2, 4 (x10) and 1, 264 of 298, 34 dropped, `Beat This!` 72 BPM, 266: trials.md R2 table, `samples/chainA/R2.madmom.span.gp5.readback.json`.
- r0520 1.99 s, 36.8 MB: ledger.
- Capo as the track offset and tuning as the track strings, written with PyGuitarPro 0.11: INPUTS.md "Guitar Pro 5". No field for time 0, -0.01 s: trials.md chain A point 6.
- "glue script, meaning a small script my agents wrote to pass one tool's output to the next": trials.md "How to read the numbers" ("Glue scripts are in `scripts/`") and the `glue written` column of each chain table.

tuttut
- 0.0.7, pooled non-drum notes, measures from MIDI time signatures, `merge_midi.py`, `run_tuttut.py`: trials.md chain A row "notes -> tab assigner". `chainB_voice_tab.py` 113 lines, 120 BPM, 220 ticks, program 25, velocity 80, 10 ms, 20 frets: trials.md chain B table and point 7. Commands: ledger r0514, r0515, r0528 `cmd_str`.
- 342, 233, 214 (e1450). 390 of 406, 220, 143 (e1452). R2 298 of 305, 29 open, fret 20, 30, 37, 63, 65, 66, 37: trials.md chain A tables and point 3.
- Chain B B1: 171 of 175, 40 and 35 (e1455), 41 and 31 (e1456), 3 collisions, 41 and 41 (e1458), 42 and 29 (e1459), 6 collisions, 159 of 171. S2s 43 and 35 (e1467), 41 and 29 (e1468), 6, 44 and 44 (e1470), 42 and 27 (e1471), 8, 153 of 170: trials.md chain B table, `samples/chainB/*.chainB.json`.
- M1: collisions 23 / 29, 10 / 12, melody 24 (e1462, e1465), 8 (e1474, e1477): trials.md chain B table.
- B1 threshold at MIDI 55: trials.md chain B tools paragraph.
- Capo: 90 of 90, 0 (e0678), capo told 90 found and 90 on the real string and fret (e0732: `n_matched` 90, `same_string_and_fret_count` 90), 139 paired, 82 kept, every written fret 2 lower, 57 moved. Drop D: 86, D2 as D3, 72 (e0695), Drop D told 90 found and 86 (e0733: 90, 86), 14 of 126 moved. Both stages 90, 86 (e1511): trials.md chain C table.
- Chain B pairs written out as found and on the real string and fret: evals.jsonl `n_matched` and `same_string_and_fret_count` of e1455 (40, 35), e1456 (41, 31), e1458 (41, 41), e1459 (42, 29), e1467 (43, 35), e1468 (41, 29), e1470 (44, 44), e1471 (42, 27).
- "instrument 25, steel-string guitar": `chainB_voice_tab.py` line 31 `pretty_midi.Instrument(program=25)` and INPUTS.md ("steel-string guitar (GM program 25)"). "velocity, the MIDI word for how hard a note is played" and "pitch class, the note name ignoring the octave": term explanations. "a fixed number in its code for hand span" is trials.md's "a module constant for hand span".
- r0514 9.80 s, 79.8 MB. r0515 1.21 s, 39.1 MB. r0528 4.38 s, 75.8 MB: ledger.
- Tuning, fret count, difficulty weights, hand-span constant, no capo, `F#4 C#4 A3 E3 B2 F#2`, `Tuning` with D2 on string 6, no per-note string or fret input: trials.md chain C table and constraint paragraph. No voice input, 2.5 ms and pitch class, 1 ms lost 18 to 20 labels, ticks move onsets up to 1.1 ms: trials.md chain B table and point 3.

Not run
- The summary line is the heading every lane's fragment shares, so it stays. The block opens by saying that each of the three ran on the box in another lane and that the chain step is what wasn't done.
- alphaTab real-time player, r0269 (browser-audio-sync, "alphaTab 1.9.0 real-time player on S2n.gp5", exit 0), one clock by construction: trials.md chain E point 1.
- RTMPose: rtmlib Hand on R3b and R3c in r0408 (exit 0). The first two steps stopped with exit 1 for a missing PIL, and the reruns `rtmlib-hand_R3b_full_rerun` and `rtmlib-hand_R3c_full_rerun` exited 0 (`video-hands-fretboard/samples/steps/C1.steps.times.tsv` rows 25 and 26). Outputs `out/rtmlib-hand/R3b_full.jsonl` and `R3c_full.jsonl` in the video lane. 21 points per hand: `video-hands-fretboard/trials.md` rtmlib model table ("hand pose, 21 points") and `survey.md` ("RTMPose-m" for 21 hand keypoints).
- YOLO pose: yolo26n-pose on R3b and R3c, rows `yolo-pose_yolo26n-pose_R3b_full` and `_R3c_full` of the YOLO26 table in `video-hands-fretboard/trials.md` (steps of the video lane's group job B1, r0448, exit 0: `video-hands-fretboard/samples/steps/B1.steps.times.tsv` rows `yolo-pose_yolo26n-pose_R3b_full` and `_R3c_full`, exit code 0, and the lane's "Grouped jobs" note that C2's steps were moved into B1 and C1), outputs `out/yolo-pose/yolo26n-pose/R3b_full.jsonl` and `R3c_full.jsonl`. 17 body points with the wrists among them: same file, "17 COCO body keypoints per person (no finger keypoints)" and "COCO 9 = the person's left wrist, 10 = right wrist".
- "Chain D wasn't run with their points", outputs on disk in the video lane: trials.md "Not done" ("chain D with the hands of other landmark models (RTMPose, YOLO pose, outputs on disk in the video lane)").
- tutts ran in the guitar-tab lane, r0205 and r0240 (exit 0). Its counts against tuttut's, from the guitar-tab lane's handoff table (`guitar-tab/trials.md`, rows S3, R1a and R1c, in the order tuttut / tutts) and evals.jsonl `n_est`: S3 tuttut 186 (e0667), tutts 183 (e0668). R1a tuttut 195 (e0707), tutts 193 (e0709). R1c tuttut 153 (e0727), tutts 152 (e0728). Equal on S1, S2n, S5capo2, S5dropd and R1b. The earlier draft had each pair the wrong way round, after the ambiguous "186 against 183" in the chains trials.md "Not done" paragraph. The guitar-tab lane's text settles the order: "tuttut 12 notes, tutts 15 ... 186 and 183 notes out" and "tuttut wrote one note (pitch 82), tutts none (153 vs 152 notes out)". "reduces chords it can't finger to fewer notes" follows the docstring quoted there ("dropping inner notes until it is playable").
- No reason recorded for not running tutts, the GP5 with voices and percussion, or chain E on R2: trials.md "Not done" paragraph gives none. No steps for Aaron: this lane has no `for-aaron.md`.

Licenses
- Each tool's license is in the named lane's `survey.md` (checked for this fragment, not quoted in it). Line numbers as read at 01:16 UTC on 2026-11-11. The surveys were still being edited, so a moved line is found again by the text given. web-tab-render line 26 (alphaTab, table row "MPL-2.0"). audio-to-notes entry 13 at line 54 (Basic Pitch "Code Apache-2.0"). chords-beats-key line 200 (`Beat This!` "a. Code: MIT"), line 34 (entry 1, "Chordino + NNLS Chroma + Tuning", GPL-2.0-or-later) and line 404 (madmom, "raw.githubusercontent.com/CPJKU/madmom/main/LICENSE"). source-separation line 177 (Demucs LICENSE), line 927 (librosa "License ISC"), line 453 (MSST "a. Code: MIT"), line 850 (becruily "no license tag"). guitar-tab line 75 (entry 16, tuttut MIT), line 99 (entry 29, PyGuitarPro LGPL-3.0-only) and line 841 (LilyPond "the repository's COPYING"). video-hands-fretboard lines 274 to 275 (MediaPipe "LICENSE FACTS", "a. Code: Apache-2.0") and line 993 (OpenCV "LICENSE FACTS"). fingerstyle-voices-taps line 166 (partitura Apache-2.0) and line 168 (music21 BSD-3-Clause).

Links (this lane names no tool URLs, so each is copied from another lane's file)
- First line holding each URL, by `grep -n -F` at 01:16 UTC on 2026-11-11 (the files were still being edited, so grep the URL if a line has moved). alphaTab `https://github.com/CoderLine/alphaTab`: web-tab-render survey.md line 111. Basic Pitch `https://github.com/spotify/basic-pitch`: audio-to-notes survey.md line 104. `Beat This!` `https://github.com/CPJKU/beat_this`: chords-beats-key survey.md line 176. Chordino `https://github.com/c4dm/nnls-chroma`: chords-beats-key survey.md line 430. Demucs `https://github.com/adefossez/demucs`: source-separation survey.md lines 115 to 116 ("the officially maintained Demucs"). librosa `https://github.com/librosa/librosa`: audio-to-notes survey.md line 271. LilyPond `https://lilypond.org/index.html`: guitar-tab survey.md line 818. madmom `https://github.com/CPJKU/madmom`: chords-beats-key survey.md line 305. MediaPipe Hand Landmarker `https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker`: video-hands-fretboard survey.md line 180. music21 `https://github.com/cuthbertLab/music21`: fingerstyle-voices-taps survey.md line 168. OpenCV `https://github.com/opencv/opencv`: video-hands-fretboard survey.md line 993. partitura `https://github.com/CPJKU/partitura`: fingerstyle-voices-taps survey.md line 166. PyGuitarPro `https://github.com/Perlence/PyGuitarPro`: guitar-tab survey.md line 877. tuttut `https://github.com/natecdr/tuttut`: guitar-tab survey.md line 633.

Pending media
- Sizes, durations, channels: ffprobe on the three files (37.760000 s, 37.760000 s, 38.649615 s, 13,321,772, 13,321,772, 20,453,420 bytes), matching trials.md "Media kept outside git" and verification log.
- "Derived from S4 (synthesized for the test set, see INPUTS.md)": trials.md "Media kept outside git". The earlier draft's "no credit needed" is in no source and is gone. INPUTS.md gives S4 the line "Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license)", but these WAVs were rendered by alphaTab with `sonivox.sf2` (`scripts/pages/chainE.html` line 26: `soundFont: '/nm/@coderline/alphatab/dist/soundfont/sonivox.sf2'`). The SONiVOX license text is from `web-tab-render/survey.md`, section "SoundFonts used by the web players above".
- The sentence about browsers playing at most 2 channels is gone: no source says it.
