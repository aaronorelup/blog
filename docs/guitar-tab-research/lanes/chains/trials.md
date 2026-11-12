# Chains: the handoffs between the lanes' tools

Agent `chain-trials`, 2026-11-10, 23:20 to 23:55 UTC. Box: 4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU (see
`ENVIRONMENT.md`). The ten lanes tried their tools one at a time; this file records what happened at the joints when
the output of one tool was fed to the next. A chain here is not a product and was not tuned: every tool ran with its
defaults or with a setting a lane had already documented. The tool used at each stage is named with the reason it
was at hand (already installed or its output already on disk, and it emits the format the next stage reads). That is
a statement of convenience, not a choice between tools.

How to read the numbers:

- `rNNNN` is a line of the run ledger `/home/user/gtr/ledger/runs.jsonl` (exact command, input SHA-256, wall clock,
  CPU time, peak memory). Runs of this lane are `--lane chains`. Unless a line says `--nolock`, a run had one slot of
  2 CPU cores. The `--nolock` runs here are light glue or browser jobs started while both slots were held by other
  lanes' jobs; they took no slot and were not pinned.
- `eNNNN` is a scoring run of `gtr-eval` 0.11.1 (`/home/user/gtr/eval/ledger/evals.jsonl`), with the definitions in
  `scripts/gtr-eval/README.md`: notes match when onsets are within 50 ms and pitches within 50 cents (each note once);
  tab adds "same string and same fret" over the matched pairs; beats match within 70 ms; chord time is mir_eval's
  `majmin` share of the truth span, given here also as seconds = share x 38.741 s (S4's length).
- Run ids and eval ids of other lanes are cited where a joint had already been run; those joints were not repeated.
- Glue scripts are in `scripts/` (line counts by `wc -l`); small outputs in `samples/`; big outputs under
  `/home/user/gtr/lanes/chains/` (list at the end).

## Joints the lanes had already run (cited, not repeated)

| joint | lane, runs | what came out |
|---|---|---|
| S4 mix -> htdemucs_6s stems -> Basic Pitch on `guitar.wav`, `vocals.wav`, `bass.wav`; S6taps -> htdemucs_6s `guitar.wav` -> Basic Pitch | audio-to-notes, r0021 / r0054 (separation lane) + r0243 | S4 guitar stem: 342 notes, 233 of 369 truth guitar notes matched (e0652); S6taps guitar stem: 96 notes, 41 of 90 (e0660) |
| Basic Pitch MIDI (8 clips) -> tuttut, tutts, tayuya, LilyPond, tabsynth, with and without the capo / tuning | guitar-tab, r0240, r0242 | eval ids from e0646 to e0743 in that lane's handoff table (other lanes' eval ids are interleaved in that range) |
| Basic Pitch -> tuttut -> Guitar Pro 5 at a fixed tempo and a fixed 16th grid (S2n, S5capo2, R1c) | guitar-tab, no run id (glue) | e1088, e1090, e1092 |
| Basic Pitch notes of the mix -> voice split (baselines, partitura, music21) | fingerstyle-voices-taps, r0252 + r0258, r0260, r0263, r0265 (r0259, r0261, r0262 and r0264 between them are other lanes' runs) | eval ids from e0744 to e0877 (interleaved with other lanes' ids) |
| HPSS / Demucs drums stem -> onset detector -> tap times (S6taps) | source-separation r0262 + eval ids from e0815 to e0934 (interleaved with other lanes' ids); fingerstyle r0031 + e0022 | 53 onsets from the HPSS percussive part, all 32 taps among them (precision 0.604) |
| music21 key analysis on Basic Pitch MIDI | chords-beats-key, r0237 | in that lane's music21 section |
| ElevenLabs guitar stem (MP3) -> YourMT3 Space (MIDI) on S4 | hosted-apis, r0064 (stems) + r0231 (the `mimbres/YourMT3-cpu` call) | 516 notes, 334 of 369 truth guitar notes matched (e0522; e0525 with a -25.057 ms shift); details in that lane's handoff section |
| MediaPipe fingertips -> hand-set neck quad -> OpenCV LSD frets -> 12-TET fret model -> (string, fret) cell, one frame | video-hands-fretboard, r0078/r0149/r0218 (R3a_cu f150), r0408/r0214/r0402 (R3b f225) | five fingertip cells per frame |
| Basic Pitch notes of R3a, R3b, R3c -> tuttut and LilyPond | guitar-tab, r0301, r0479 | output counts only (no truth) |
| S4 audio + clicks on the truth beats in one AudioContext; alphaTab metronome export of S2n.gp5 | browser-audio-sync, r0143, r0195 / r0329 | clicks 0 to 0.023 ms from the scheduled frames; alphaTab's clicks -1.429 to 0 ms from the 112 BPM grid |

What was missing and is run below: notes from a stem into a tab assigner, a beat tracker's grid and a chord
recogniser's labels into a Guitar Pro file, that file into alphaTab and into a metronome measurement, the HPSS
harmonic part into a transcriber, voice labels into a tab assigner, a correction given to two stages at once, a
pinned note on transcribed notes, and a hand-landmark stream joined with a note stream on whole clips.

## Chain A: full song to tab, beat grid and chords (S4, then R2)

Tools at each stage, and why they were at hand: separators with a guitar stem whose S4 outputs were on disk:
Demucs `htdemucs_6s` (source-separation r0021) and the becruily Mel-Band RoFormer guitar model through MSST (r0491).
Transcriber: Spotify Basic Pitch 0.4.0 (the TFLite default the audio-to-notes lane used; its venv was rebuilt here
from that lane's saved `uv pip freeze`, offline from the shared cache). Tab assigners: tuttut 0.0.7 (emits seconds +
string + fret as JSON) and LilyPond 2.24.3 (emits engraved tab; string and fret only through the guitar-tab lane's
Scheme glue); tuttut from the guitar-tab lane's `venv-sym`, LilyPond the system binary `/usr/bin/lilypond`, both run
through that lane's scripts. Beats and chords: the chords-beats-key lane's
S4 and R2 outputs, not re-run: madmom 0.16.1 `DBNDownBeatTracker` (r0072 S4, r0316 R2; one file of `time, beat
number`), Beat This! 1.1.0 `final0` (r0397; two files, beats and downbeats), madmom CNN chords (r0072 / r0316; Harte
labels) and Chordino (r0215; plain chord names). Guitar Pro writer: PyGuitarPro 0.11 (in `venv-sym`). Renderer:
alphaTab 1.9.0 from the web-tab-render lane's `node_modules`, its `alphatab.html` page and `shot.cjs` driver.

### S4 (ground truth for every stage)

| joint | A's output (format, fields, units) | what B needed | glue written | run ids | counts against truth |
|---|---|---|---|---|---|
| mix -> separator | `S4.wav`: WAV, 44.1 kHz, 2 channels, 16-bit PCM, 38.741 s | Demucs CLI: an audio file path. MSST `msst-inference`: a folder holding the file (`--input_folder`), a config and a checkpoint | none | r0021 (htdemucs_6s, 36.37 s wall), r0491 (becruily, 289.53 s wall), both source-separation lane | the lane's projection of the true guitar onto the guitar stem: 0.358 (htdemucs_6s, e0095 for its SDRs), 0.0773 (becruily, e1425) |
| separator -> guitar stem | htdemucs_6s: six WAVs `drums bass other vocals guitar piano`.wav, PCM_16 stereo, lowercase names. becruily: one WAV `Guitar.wav` (capital G), float32 stereo, the model's only target | a path to one audio file | none; the guitar file is picked by name, which differs between the two tools | (as above) | true guitar also lands in htdemucs_6s `piano.wav` (projection 0.232, lane) |
| guitar stem -> Basic Pitch | the stem WAV | an audio path; Basic Pitch loads it with librosa at 22,050 Hz mono itself (stereo to mono and 44.1 to 22.05 kHz happen inside; no conversion by the caller) | `bp_run.py` (36 lines): calls `predict()` with the lane's default settings on named files | r0243 (htdemucs_6s stem, audio-to-notes lane); r0511 (becruily stem and three more files, 2 cores, 24.68 s wall for four files) | htdemucs_6s stem: 342 notes, 233 of 369 truth guitar notes matched (e0652). becruily stem: 406 notes, 229 of 369 (P 0.564, R 0.621, e1447) |
| notes -> tab assigner | Basic Pitch MIDI: 220 ticks per quarter, one tempo of 120 BPM (a fixed default, `--midi-tempo`, not the song's), velocity-0 note-ons as note-offs; pitch-bend messages in the audio-to-notes lane's file (139 in r0243's S4 htdemucs_6s MIDI) but none in the four MIDI files `bp_run.py` wrote in r0511, although their note-events CSVs carry bend values (Basic Pitch 0.4.0, with `multiple_pitch_bends` off, drops the bends of every note that overlaps another note in time; every note of the four r0511 files overlaps another, 3 of r0243's 342 do not; verifier runs r0589, r0590); and a note-events CSV in seconds | tuttut: a MIDI file (pretty_midi; all non-drum notes pooled, measures from MIDI time signatures). LilyPond: its own `.ly` text | the guitar-tab lane's `merge_midi.py` (one track), `run_tuttut.py` (tuttut JSON -> gtr-eval list: string = index + 1, pitch from the note name), `run_lilypond_tab.py` (notes grouped within 30 ms, written as 16th chords; a Scheme hook logs moment, string, fret) | r0514 (2 cores, 9.80 s wall for all) | tuttut on the htdemucs_6s notes: 342 written, 233 matched, 214 with the truth string and fret (e1450). LilyPond: 329 written (13 "No string for pitch" warnings), 229 matched, 199 (e1451). On the becruily notes: tuttut 390 of 406 written, 220 matched, 143 (e1452); LilyPond 392 written (14 warnings), 217 matched, 106 (e1453) |
| tab + beat tracker -> Guitar Pro 5 | tuttut list: onset (s), string, fret; no durations, no bars. madmom `downbeats.txt`: `time<TAB>beat number`, times on a 10 ms grid, 65 rows from 2.07 s. Beat This!: `final0_beats.txt` (68 times from 0.52 s) + `final0_downbeats.txt` (18) | GP5: bars with time signatures, beats with note values (960 ticks per quarter), one integer song tempo, optional mix-table tempo changes on beats | `tab_beats_to_gp5.py` (195 lines): adds beats at the median beat interval before the first tracked beat (until the first is within half an interval of 0 s) and after the last (until the last note onset is covered; the audio after that is not), starts a bar at each grid beat within 35 ms of a downbeat, cuts each beat interval into four 16ths and puts each note on the nearest one, writes one note per string per 16th, sets the tempo by one of three rules (below) | r0520 (2 cores, 1.99 s wall for 12 files; supersedes r0519) | read back from the GP5 (`gtr-eval tab`, time from the GP5 tempo, `--time-shift` = the GP5's time 0 in the audio): tempo from the median beat interval, 115 BPM: 57 of 369 matched, 52 with truth string and fret (e1486; Beat This! grid: 53, 49, e1487; e1486 to e1491 scored r0519's `S4.madmom.gp5` and `S4.beatthis.gp5` and their read-back files, byte-identical to r0520's `*.median.*` files). Tempo from the span of tracked beats, 116 BPM: 223 matched, 210 (e1497; Beat This!: 223, 210, e1503). Per-bar tempo changes (115 to 117): 223, 210 (e1500, e1506). Before the GP5 (tuttut list): 233, 214 (e1450). 17 of 342 notes were not written (a second note on the same string in the same 16th) |
| beat tracker -> bar lines | (as above) | (as above) | (same script) | r0520 | the trackers' own files: madmom 65 beats, 65 of 68 truth beats matched, downbeats 17 of 17 (e1492); Beat This! 68 beats, 65 of 68, downbeats 17 of 17 with 18 given (e1494). Beats where the GP5 plays them: median tempo 14 of 68 (e1488), downbeats 4 of 17; span tempo 68 of 68 with 73 GP5 beats, downbeats 17 of 17 (e1498 with 18 GP5 downbeats, e1504 with 19); per bar 68 of 68 (e1501, e1507). The 73 GP5 beats of the madmom file are 4 beats the glue added before the count-in, the 65 tracked beats and 4 added after the last tracked beat (3 of these 4 fall on truth beats the tracker missed); its 5 beats with no truth beat within 70 ms are the 4 added before and the last added one. The Beat This! file: 1 added + 68 tracked + 4 added; its 5 without a truth beat are the added beat at 0 s, Beat This!'s 3 beats in the silent bar and the last added one |
| chord recogniser -> chord names in the GP5 | madmom CNN `.lab`: `start end label`, Harte labels (`D:maj`, `B:min`), 18 segments from 0.000 s. Chordino `.lab`: plain names (`D`, `Bm`), 18 segments, the first (`N`) starting at 0.372 s | a GP5 chord on a beat (name, root and fingering fields); PyGuitarPro 0.11 raised a `GPException` reporting `TypeError: int() argument must be ... not 'NoneType'` while writing a chord whose `firstFret` was unset (re-checked by the verifier, r0566) | in `tab_beats_to_gp5.py`: Harte to name (`B:min` -> `Bm`), each segment start to the nearest 16th, a chord with a name, `firstFret` 0 and no fingering (every string -1). Which recogniser goes into which file is fixed in `batch_gp5.sh`: madmom CNN labels into the madmom-grid files, Chordino labels into the Beat This!-grid files | r0520 | seconds on which the chord label matches the truth (majmin): madmom CNN as recognised 37.16 s of 38.74 (e1495); placed in the madmom-grid GP5 at the span tempo 36.59 s (e1499); at the median tempo 34.04 s (e1490). Chordino as recognised 34.34 s (e1496); placed in the Beat This!-grid GP5 at the span tempo 33.62 s (e1505); median 32.00 s (e1491). 17 of 18 chord names written (the `N` segment has none) |
| GP5 -> alphaTab in headless Chromium -> picture | `S4.madmom.span.gp5`, 6,468 bytes | alphaTab loads a GP5 by URL (`core.file`) | none to load it; one page option added in a copy of the web-tab-render page (`?lazy=0` sets `core.enableLazyLoading = false`) | r0522 (default page), r0523 (`lazy=0`), 2 cores, 4.6 s and 4.3 s for three files | alphaTab read 18 master bars, tempo 116, and reported a 1,200 x 2,353 px render (`renderFinished`; the screenshot is 1,240 px wide). With the default (lazy) setting the full-page screenshot shows bars 1 to 8 and blank space below; with lazy loading off all 18 bars are drawn. Chord names appear above their beats; the page header shows one chord diagram per name with every string marked x |

The tempo rules of the GP5 glue, and what each did on S4 (madmom grid; `samples/chainA/*.readback.json`): "median":
round(60 / median interval of the tracked beats) = round(60 / 0.52 s) = 115 BPM; the 16th slots then drift from the
tracked grid by a median 0.159 s and at most 0.295 s by the end of the clip. "span": round(60 x (65 - 1) / (last -
first tracked beat)) = 116 BPM; drift median -0.016 s, at most 0.029 s. "perbar": the span tempo plus a mix-table
tempo change on each bar, round(60 / that bar's mean interval) (115, 116 or 117); drift median 0.002 s, at most
0.025 s. The truth tempo is 116 BPM. The madmom times are multiples of 10 ms, so the median interval of a 116 BPM
beat (0.5172 s) came out as 0.52 s.

Picture: `samples/chainA/alphatab_S4.madmom.span.nolazy.webp` (all 18 bars), `alphatab_S4.madmom.span.webp` (the
default lazy page, bars 1 to 8), `alphatab_S4.beatthis.span.nolazy.webp` (Beat This! grid: a 1-beat and a 3-beat bar
before the count-in). GP5 files and their read-back beat, downbeat and chord files: `samples/chainA/`.

### R2 (real song, no truth): what each stage emitted

| joint | A's output | what B needed | glue | run ids | what came out (no truth) |
|---|---|---|---|---|---|
| mix -> htdemucs_6s | `R2.wav`, 44.1 kHz stereo, 36.0 s | an audio path | none | r0428 (source-separation, batch A) | six stems, `guitar.wav` 6,350,444 bytes, PCM_16 stereo |
| guitar stem -> Basic Pitch | the stem WAV | an audio path | `bp_run.py` | r0511 | 305 notes, MIDI 30 to 97; 29 notes below MIDI 40 (the low E of standard tuning); onsets 0.046 to 35.363 s |
| notes -> tuttut / LilyPond | Basic Pitch MIDI (120 BPM placeholder tempo) | MIDI / `.ly` | the guitar-tab lane's scripts | r0514 | tuttut wrote 298 of 305 notes (it leaves out notes of chords it cannot finger and moves out-of-range notes by octaves); 29 on open strings, highest fret 20 (its fret count); notes per string 1 to 6: 30, 37, 63, 65, 66, 37. LilyPond wrote 266 (39 "No string for pitch" warnings), frets up to 33 (no fret limit was given; 3 notes above fret 19) |
| tab + beats -> GP5 | madmom `downbeats.txt` (43 rows, the first `0.600 4`; the lane's top tempo 72.289 BPM); Beat This! 43 beats, 11 downbeats | (as for S4) | `tab_beats_to_gp5.py` | r0520 | madmom grid, span tempo 72 BPM, GP5 time 0 at -0.23 s in the audio, 12 bars of 2, 4 (x10) and 1 beats, 264 of 298 notes written (34 on a string already used in that 16th); Beat This! grid: 72 BPM, 266 written. Median-tempo files: 72 and 71 BPM |
| chords -> GP5 | Chordino: 16 segments `N F# Ebm Bmaj7 F# Bb7 Ebm B Bb7 Eb F7 F#6 C# Ab Bb Bdim`; madmom CNN: 16 segments `F#:maj D#:min B:maj F#:maj A#:maj B:maj A#:maj D#:maj D#:min F:maj ...` | GP5 chord names | (same) | r0520 | 15 Chordino names (in the madmom-grid files) and 16 madmom CNN names (in the Beat This!-grid files) written; the pairing is fixed in `batch_gp5.sh`. The two recognisers spell the same roots differently: flats in Chordino (`Ebm`, `Bb7`), sharps in madmom (`D#:min`, `A#:maj`); madmom's CNN labels are major or minor only. The song page lists the key as D# minor |
| GP5 -> alphaTab | `R2.madmom.span.gp5` (Chordino chords), 5,216 bytes | (as for S4) | `?lazy=0` | r0523 | 12 master bars, a 2,134 px tall render (`samples/chainA/alphatab_R2.madmom.span.nolazy.webp`) |

### Chain A: where a handoff failed or needed a manual choice

1. The two separators name and store the stem differently: Demucs writes `guitar.wav` (PCM_16, with five other
   stems); MSST's becruily model writes only `Guitar.wav` (float32). Picking "the guitar stem" is a per-tool rule.
2. Basic Pitch's MIDI carries a fixed 120 BPM tempo, not the song's: its ticks are not musical rhythm. Only the
   seconds survive the joint.
3. tuttut does not write every note it receives (S4 becruily 390 of 406, R2 298 of 305) and changes pitches by
   octaves when they are out of range; LilyPond leaves notes out with a warning (13, 14, 39) and, with no fret limit
   given, writes frets up to 33.
4. Neither tab assigner emits rhythm: tuttut gives seconds, LilyPond's glue gives only an order of chord groups.
   The GP5 needs bars, note values and a tempo, so the beat tracker's grid had to be brought in by glue.
5. A tempo was needed to turn seconds into GP5 time. GP5 stores one integer song tempo (and integer tempo changes).
   With 115 BPM from the median interval the 16th slots moved up to 0.295 s by the end of S4, and after read-back 57
   of the 369 truth notes matched (233 before the GP5); with 116 BPM from the span, 223 matched.
6. The audio before the first tracked beat is not a whole number of beats. The glue extends the grid backwards at
   the median interval and records where GP5 time 0 sits in the audio (-0.01 s, 0.00 s, -0.23 s, -0.22 s); reading
   the GP5 back on the audio's clock needs that shift (`gtr-eval --time-shift`). A GP5 file has no field for it.
7. The trackers disagree on where beats start: Beat This! put 3 beats and a downbeat in S4's silent first bar
   (0.52 s on), so its GP5 starts with a 1-beat and a 3-beat bar; madmom's downbeat tracker starts at 2.07 s (the
   count-in), while madmom's separate beat tracker (`beats.txt`, a different program) starts at 0.52 s (74 vs 65
   beats). The last bar takes the leftover beats (5/4 on S4, 1/4 on R2).
8. One note per string per 16th: 17 of 342 (S4) and 34 of 298 (R2) notes were dropped by that rule.
9. Chord labels come in two syntaxes (Harte from madmom, plain names from Chordino, which also starts at 0.372 s,
   not 0) and two spellings (sharps, flats). A GP5 chord object needs fingering fields; PyGuitarPro raised a
   `GPException` (a `TypeError` inside) on an unset `firstFret`. The glue wrote names without diagrams, and alphaTab
   then drew empty diagrams (every string x) in the page header.
10. alphaTab's default lazy loading drew 8 of 18 bars in a headless full-page screenshot; turning it off drew all.
11. Fixed by hand in the glue, not by any tool (added by the verifier from the scripts): the 35 ms window that makes a
    grid beat a downbeat, four 16ths per beat, an x/4 time signature for every bar, the first listed note keeping a
    string in a 16th (`tab_beats_to_gp5.py`); which beat tracker's file is paired with which chord recogniser's
    (`batch_gp5.sh`: S4 madmom + madmom CNN and Beat This! + Chordino; R2 madmom + Chordino and Beat This! + madmom
    CNN), so the two recognisers' in-GP5 figures sit on different grids; each file's GP5 time zero typed into its
    `gtr-eval --time-shift` (-0.01, 0.0); the separator file names (`Guitar.wav`, `guitar.wav`) written into the
    r0511 command; Basic Pitch's thresholds (onset 0.5, frame 0.3, minimum note 127.70 ms) written into `bp_run.py`
    as the audio-to-notes lane's defaults; the `?lazy=0` page option.

## Chain B: fingerstyle audio to melody, bass and taps (S6taps, S2s)

Tools at hand: librosa 1.0.0 HPSS outputs on disk (source-separation r0262 S6taps, r0268 S2s; `default` = margin 1,
float32 stereo `harmonic.wav` and `percussive.wav`) and that lane's `librosa.onset.onset_detect` list of the
percussive part (the same file as its handoff sample, checked with `cmp`); Basic Pitch 0.4.0 (as in chain A); the
fingerstyle lane's `voice_split.py` in its `venv-core` (B1 threshold at MIDI 55, B2 lowest note per onset, B3
skyline, partitura 1.9.0 `estimate_voices`, music21 10.5.2 with that lane's labelling rule M1); tuttut 0.0.7.

| joint | A's output | what B needed | glue written | run ids | counts against truth |
|---|---|---|---|---|---|
| mix -> HPSS | float32 WAV, 44.1 kHz, 2 channels, the input's length: `harmonic.wav`, `percussive.wav` | (cited) | none | r0262, r0268 (source-separation) | S6taps: true guitar 0.899 in the harmonic part, true taps 0.900 in the percussive part (projections, e0811) |
| percussive part -> onset detector -> tap times | 53 onset times (s), one per line, no label | (cited) | none | r0262; e0815 | 32 of 32 taps among the 53 onsets (precision 0.604); the other 21 are guitar-note attacks |
| tap times + notes of the harmonic part (cross join) | the 53 onsets; Basic Pitch note onsets of the harmonic part (175) | a time to compare: within 50 ms | `chainB_taps.py` (54 lines): marks each onset "with" or "without" a transcribed note within 50 ms and matches it to the truth event classes | r0540 (`--nolock`, 0.03 s) | 5 onsets have no transcribed note within 50 ms: they are the 5 truth tap-only events. The other 48 have a note: 27 are truth taps played with a bass note, 21 are notes with no tap. Timing alone did not separate those 27 from those 21 |
| harmonic part -> Basic Pitch | the float32 stereo WAV | an audio path (Basic Pitch resamples and downmixes itself) | `bp_run.py` | r0511 | S6taps: 175 notes, 83 of 90 matched: bass 41 of 48, melody 42 of 42 (e1448). S2s: 174 notes, 86 of 90: bass 44 of 48, melody 42 of 42 (e1449). From the unseparated mix the lanes had 196 notes, 90 of 90 (e0512) and 199 notes, 90 of 90 (e0495) |
| notes -> voice split | note-events CSV: `start_time_s, end_time_s, pitch_midi, velocity, pitch_bend...` | onset, offset, pitch (the lane's script reads Basic Pitch's CSV headers) | none (the fingerstyle lane's `voice_split.py`); its M1 writes a MIDI at the truth tempo, 112 BPM | r0513 (2 cores, 4.23 s for both clips) | matched notes whose label equals the truth voice, of 83 (S6taps) / 86 (S2s): B1 83 / 86 (labels: 126 melody 49 bass / 125, 49); B2 80 / 83; B3 54 / 57; partitura P1 and P2 41 / 44 (8 voices returned; 1 note labelled melody); M1 music21 64 / 51 (77 melody 98 bass / 23 melody 151 bass; on S2s 122 of the 174 notes were not found back in music21's parse, same pitch within 0.1 s, and took the lane's default label bass; on S6taps 0) |
| labelled notes -> tab assigner | CSV `onset, offset, pitch, voice` | tuttut: one MIDI file; it has no voice input and pools all instruments | `chainB_voice_tab.py` (113 lines): (a) "pooled": all notes in one MIDI, one tuttut run, each tab note gets its label back by onset (within 2.5 ms: tuttut reads MIDI tick times, 2.27 ms per tick at 220 ticks per quarter and 120 BPM) and pitch class; (b) "separate": one tuttut run per voice. Counts "collisions": a bass and a melody tab note on the same string with overlapping sounding times | r0515 (2 cores, 1.21 s; r0514's chain B part used a 1 ms join and lost 18 to 20 labels per run, superseded) | S6taps, B1 labels. Pooled: 171 of 175 notes written; bass 40 of 48 matched, 35 with truth string and fret (e1455); melody 41 of 42, 31 (e1456); 3 collisions. Separate: bass 41, 41 (e1458); melody 42, 29 (e1459); 6 collisions; 159 of 171 notes got the same string and fret both ways. S2s, B1: pooled bass 43, 35 (e1467), melody 41, 29 (e1468), 6 collisions; separate bass 44, 44 (e1470), melody 42, 27 (e1471), 8 collisions; 153 of 170 the same. M1 labels: S6taps pooled bass 39, 34 (e1461), melody 24, 17 (e1462), 23 collisions; separate 40, 38 (e1464) and 24, 17 (e1465), 29 collisions. S2s pooled bass 42, 34 (e1473), melody 8, 6 (e1474); separate 42, 36 (e1476) and 8, 5 (e1477); 10 and 12 collisions. All-voice files: e1454, e1457, e1460, e1463, e1466, e1469, e1472, e1475 |

### Chain B: where a handoff failed or needed a manual choice

1. The onset list from the percussive part has no tap/note label, and the percussive part still holds every note
   attack (fingerstyle lane). Joining it with the transcribed notes separated only the 5 taps that fall between notes;
   the 27 taps that coincide with a bass note look the same as the 21 plain notes at this joint.
2. Transcribing the harmonic part instead of the mix lost bass notes (7 of 48 on S6taps, 4 of 48 on S2s) and gave
   fewer notes in all (175 against 196; 174 against 199; notes with no truth match 92 against 106 and 88 against
   109).
3. tuttut has no voice input: the voice labels had to be carried around it and joined back by onset and pitch
   class. MIDI tick rounding moves onsets by up to 1.1 ms, so a 1 ms join lost labels (r0514).
4. Running the voices through the assigner separately put both voices on the same string at the same time more
   often (6 against 3 on S6taps with B1 labels; 29 against 23 with M1); nothing in tuttut's input prevents it.
5. The M1 music21 rule needs a tempo to write its MIDI and used the truth tempo (112 BPM); partitura returned 8
   voices on transcribed notes and the lane's rule then labels one voice melody. On S2s music21's parse could not be
   joined back to 122 of the 174 notes (same pitch within 0.1 s), and the lane's rule gave those the label bass.
6. HPSS writes float32 stereo; Basic Pitch accepted it with no conversion.
7. Fixed by hand in the glue (added by the verifier from the scripts): `chainB_voice_tab.py` writes its MIDI at
   120 BPM (set in the script) and 220 ticks per quarter (pretty_midi's default), program 25, velocity 80, notes at
   least 10 ms long, and gives tuttut standard tuning with 20 frets; the label join (2.5 ms and pitch class) and the
   collision rule; `chainB_taps.py`'s 50 ms window and its 1 ms grouping of truth events; the fingerstyle lane's B1
   threshold (MIDI 55) and its M1 labelling rule.

## Chain C: a user correction (S5capo2, S5dropd)

The no-hint and hint runs on transcribed notes were made by the guitar-tab lane (r0240, Basic Pitch notes of the
audio-to-notes lane's r0234; capo told as open strings raised 2 semitones, Drop D as the tuning parameter). Their
counts are cited; "what changed" was computed here note by note from that lane's output files (`chainC_diff.py`, 40
lines; pairs notes by pitch and onset within 35 ms; a light comparison, not run through `gtr-run`). Two joints were
added: the Drop D correction given to the transcriber and the assigner at once, and a pinned note.

| joint | A's output | what B needed | glue | run ids | counts |
|---|---|---|---|---|---|
| notes -> tuttut, no hint vs capo 2 | Basic Pitch MIDI, 139 notes | tuttut has no capo parameter: open strings raised 2 semitones (`F#4 C#4 A3 E3 B2 F#2`), frets then counted from the capo | `run_tuttut.py --capo 2` (guitar-tab lane) | r0240 | no hint: 90 of 90 matched, 0 on the truth string and fret counted from the capo (e0678); capo told: 90 (e0732). Changed, note by note (139 paired): 82 kept their string (same fret from the nut, every written fret number 2 lower); 57 moved string (5->6: 15, 1->2: 17, 2->3: 8, 4->5: 7, others 10) |
| notes -> LilyPond, no hint vs capo 2 | Basic Pitch notes, 138 / 136 placed | raised `stringTunings` | `run_lilypond_tab.py --capo-as-tuning 2` | r0240 | no hint 0 (e0683); capo told 86 of 90 (e0739). 136 paired: 95 kept their string, 41 moved (5->6: 15, 1->2: 17, 2->3: 8, 4->5: 1); 2 notes placed without the hint had no string with it |
| notes -> tuttut, no hint vs Drop D | 130 notes | `Tuning` with D2 on string 6 | `run_tuttut.py --tuning 38,...` | r0240 | no hint: 86 matched (the 4 D2 notes written as D3), 72 on the truth string and fret (e0695); Drop D: 90, 86 (e0733). 126 paired: 112 kept their string, 96 kept string and fret; 14 moved (3->4: 9, 4->5: 5) |
| notes -> LilyPond, no hint vs Drop D | 125 / 129 placed | `stringTunings` | `--tuning 38,...` | r0240 | no hint: 86 matched, 72 (e0700, 4 D2 notes without a string); Drop D: 90 of 90 (e0740). All 125 paired notes kept their string; 16 changed fret on it (G2: string 6 fret 3 -> fret 5) |
| Drop D given to both stages | Basic Pitch re-run with `minimum_frequency` 73.4 Hz and `maximum_frequency` 1319 Hz (audio-to-notes r0349): 129 notes, 90 of 90 matched (e1335) | (as above) | `batch_chainC.sh` (merge, then the two lane scripts with Drop D) | r0528 (2 cores, 4.38 s) | tuttut: 90 matched, 86 on the truth string and fret (e1511); LilyPond: 90, 90, no warnings (e1512). Against r0234's notes (no frequency limits) with Drop D told (e0733 tuttut, e0740 LilyPond): the 129 common notes have the same string and fret in both tools; r0234 had one more note (a MIDI 24 at 0.0 s, which LilyPond could not place) |
| pin one note | LilyPond reads string marks in its input (`note\N`) | the note's chord group, pitch and string | `run_lilypond_tab.py --pin 1:55:4` (the guitar-tab lane's option): writes the G3 of chord group 1 (0-based) as `g\4`; input: r0234's notes (no frequency limits; the guitar-tab lane's merged MIDI, 130 notes) with Drop D told | r0528 | 129 notes written (the MIDI 24 at 0.0 s gets `No string for pitch` with and without the pin); against the unpinned Drop D run, 128 identical and 1 changed: the G3 at 2.15 s, string 3 fret 0 -> string 4 fret 5 (e1513: 89 of 90 on the truth string and fret, against 90 in e0740) |

What each tab assigner that ran here exposes for a pinned note (from the guitar-tab lane's constraint table; the
chain agent did not re-read the tools' sources): LilyPond 2.24.3, a string mark per note (`note\N`; fingering marks are read by the same function, not
tried); tuttut 0.0.7, tutts 0.1.0, tayuya 0.0.4, tabsynth 1.0.6 and the SynthTab TabCNN checkpoints, no per-note
string or fret input. tuttut exposes tuning, fret count, the weights of its difficulty metric and a module constant
for hand span; tutts tuning, fret count, time signatures, weights, tempo, quantize grid; tabsynth `max_fret`, cent
tolerance, chord templates; LilyPond tuning, `minimumFret`, `restrainOpenStrings`, `maximumFretStretch`; tayuya 0.0.4
and the TabCNN checkpoints no constraint input at all (the guitar-tab lane's tables; checked here against that lane's
text by the verifier).

### Chain C: where a handoff failed or needed a manual choice

1. No tool here takes a capo: the capo became a tuning of raised open strings (the frets are then counted from the
   capo) or a transposition of the notes. Either way the hint is translated by glue.
2. The tuning hint has to reach the transcriber too. A range set for standard tuning removed the four D2 notes before
   any assigner saw them (fingerstyle lane r0325, ONNX, 77.78 to 1396.91 Hz, e1222: 86 of 90; audio-to-notes r0234,
   TFLite, 82.4 to 1319 Hz, e0544: 86 of 90, bass 44 of 48); with a Drop D range (r0349) all 90 came through, as they
   did with no frequency limits (r0234 defaults: 130 notes, 90 of 90 matched, bass 48 of 48, e0510).
3. A pin is expressed in LilyPond's text input by chord-group index and pitch; the transcribed notes have to be
   grouped first (30 ms groups in the glue) to name the note. No other tool here has a pin input.

## Chain D: video with audio (R3b close view, R3c both hands; no ground truth)

Tools at hand: MediaPipe Hand Landmarker 1.2.2 per-frame outputs on disk (video lane group job C1, r0408, all 450
frames of each clip); the video lane's neck method (a neck quadrilateral set by hand, OpenCV 5.0.0 LSD fret lines in
the rectified neck, a 12-TET fret model fitted to them, six equal string lanes); for R3b that lane's frame-225 result
(r0214, r0402). For R3c no quad existed, so one was set here by hand on frame 225 from three gridded zoom crops (nut
end upper edge (1655, 335), nut end lower edge (1705, 378), body end lower edge (1210, 903), body end upper edge
(1112, 858), full-frame pixels; rectified to 1200 x 130), and the lane's scripts were run on it unchanged except for
the frame folder (`scripts/video_lane_copy/`, r0532). Notes: Basic Pitch 0.4.0 on R3b.wav and R3c.wav
(audio-to-notes r0264: 129 and 87 notes).

| joint | A's output | what B needed | glue | run ids | what came out (no truth) |
|---|---|---|---|---|---|
| video -> hand landmarks | JSONL, one record per frame: `n`, `t_s` = n / 25 (40 ms apart), per hand `label`, `score`, `index`, 21 landmarks as normalized x, y, z (`lm_norm_view`), as full-frame pixels (`lm_px_full`) and in metres (`world_m`) | (not a joint input) | none | r0408 | R3b: a "Left" (fretting) hand in 445 of 450 frames; R3c: both hands in 450 |
| frame -> neck geometry | R3b: the lane's quad and fit, LSD clusters 4.1 ... 1168.0 px, model frets 8 to 19 fitted (s 1754.2 px, RMS 3.52 px). R3c, here: 13 LSD fret clusters (3.6 taken as the nut, 22.2, then 540.8 ... 1045.2 px right of the hand); the fit drops 540.8 and 615.2 and takes the 9 clusters 685.4 ... 1045.2 px as frets 9 to 17 (s 1679.4 px, RMS 5.33 px, max 8.75 px) | a homography from pixels to the rectified neck, and fret positions in it | the lane's `run_opencv_lines.py` and `handoff_fingertip_to_cell.py` (copies, frame path changed) | r0214/r0402 (R3b, lane); r0532 (R3c, 2.22 s) | R3c frame 225 fingertip cells: index string 2 fret 2, middle string 3 fret 3, ring string 3 fret 3, pinky string 1 fret 4 (thumb inside the board at string 2 fret 3) |
| fingertips -> fretboard cells on every frame | per frame: fingertip pixels 8, 12, 16, 20 (and 4) | the frame-225 homography applied to all frames (camera fixed; the guitar assumed not to move) | `chainD_join.py` (99 lines) | r0533 (`--nolock`, 0.53 s) | frames with at least one of the four fingertips on a fret cell 1 to 19: R3b 445 of 450, R3c 444 of 450 |
| audio -> note onsets | Basic Pitch note events: onset and offset in seconds (model hop 256 / 22,050 Hz = 11.6 ms) | (not a joint input) | none | r0264 | 129 (R3b) and 87 (R3c) onsets |
| onsets + frames (join) | two timelines: frames every 40 ms, onsets in continuous seconds; both streams of each excerpt start at 0.000 s (ffprobe) | the nearest frame to each onset | `chainD_join.py`: nearest frame = round(onset x 25) | r0533 | onsets with a frame within 20 ms: 129 of 129 (R3b; distance median 11.46 ms, max 19.84 ms) and 87 of 87 (R3c; 10.06, 19.93 ms). Of those, with a fretting hand in that frame: 129 and 87. With at least one fingertip on a string-and-fret cell: 129 of 129 (R3b: 3 cells at 45 onsets, 4 at 84) and 85 of 87 (R3c). Distinct cells touched at onsets: 37 (R3b, frets 1 to 7), 21 (R3c, frets 1 to 5) |
| cross check: note pitch against the cells | each onset's MIDI pitch and its fingertip cells | standard tuning, no capo | `chainD_join.py`, `chainD_pitch_shift_check.py` (21 lines) | r0533, r0546 | R3b, 129 onsets with cells: pitch is an open string 65; pitch equals the standard-tuning pitch of one of the fingertip cells 28 (with every cell's fret moved by -1: 36; by +1: 27); neither open nor a fingertip cell 44. R3c, 85 onsets: open string 31; fingertip cell 6 (-1: 17; +1: 6); neither 49 |

### Chain D: where a handoff failed or needed a manual choice

1. The two streams run on different clocks: frames every 40 ms, onsets anywhere. Half a frame is 20 ms, so every
   onset inside the clip has a frame within 20 ms; nothing finer than one frame is possible without interpolation.
2. Audio-video alignment was taken from the container (both streams start at 0.000 s); it was not measured.
3. The neck quad is set by hand (R3b by the video lane, R3c here) and held for all 450 frames; whether the guitar
   moved was not tracked. The string cell assumes six equal lanes, string 6 at the upper edge (the lane's
   assumption).
4. The fret numbers come from a 12-TET fit, which the video lane found can differ by one fret from counting the
   wires on R3b (UNVERIFIED which is right; a hand-labelled frame would settle it). The pitch cross check moves with
   it: 28 / 36 / 27 matches on R3b for frets as fitted / -1 / +1, and 6 / 17 / 6 on R3c.
5. The fretting hand is taken as MediaPipe's "Left" label; the video lane found the older MediaPipe "solutions" API
   labels the same R3c hand "Right", so the rule depends on the API.
6. A fingertip over the neck is not necessarily pressing a string: the join counts cells under fingertips, not
   fretted notes; four fingertips give three or four cells at most onsets.
7. Fixed by hand in `chainD_join.py` (added by the verifier from the script): 25 frames per second (both videos are
   25 fps), the 20 ms window, landmark ids 8, 12, 16 and 20 for the four fingertips (the thumb, 4, is mapped but not
   counted), the highest-scoring "Left" hand when there are two, fret cells 1 to 19 only (no open-string cell), and
   standard tuning without capo for the pitch check; in `run_opencv_lines.py`, the R3c quad corners and the
   rectified size 1200 x 130 given on the command line.

## Chain E: tab to reference playback with a metronome in the browser (S4)

Tools at hand: alphaTab 1.9.0 (web-tab-render lane's `node_modules`) and the browser-audio-sync lane's page code:
its `alphatab.html` export routine (`exportAudio`, metronome-only and guitar-only renders), its `sync_s4.html`
pattern (one AudioContext, AudioBufferSourceNode, clicks scheduled up front on the context clock), its `common.js`
AudioWorklet recorder (imported unchanged), its `drive.mjs` Playwright driver and its `analyze_sync.py` method (lag by
FFT cross-correlation, click onset = first sample whose absolute value is above 0.05 after 100 ms below; alphaTab
metronome onset = first sample above 5 % of the channel's peak after 150 ms below, the rule of the browser lane's
`alphatab.html`). Page: `scripts/pages/chainE.html`;
analysis: `scripts/analyze_chainE.py` (91 lines, derived from `analyze_sync.py`).

Input: chain A's `S4.madmom.span.gp5` (116 BPM, 18 bars) and the madmom beat times it was built from (65 beats; GP5
time 0 = -0.01 s in the audio).

| joint | A's output | what B needed | glue | run ids | counts |
|---|---|---|---|---|---|
| GP5 -> alphaTab player (export) -> playback timeline | alphaTab read tempo 116, 18 master bars (numerators 4 x 17, 5); `exportAudio` gave two 37.76 s stereo float renders at 44.1 kHz (metronome only: guitar track volume 0; guitar only: metronome volume 0); last chunk `endTime` 37,758.62 ms, `endTick` 70,080 | the renders as AudioBuffers in one AudioContext | `chainE.html` (93 lines) | r0535 (`--nolock`, 47.7 s wall) | 73 metronome clicks in the metronome render (one per GP5 beat, including the 4 beats the glue added before the count-in and the 4 it added after the last tracked beat; the glue's read-back file counts 5 added after, the last of which only closes the final beat) |
| beat tracker times -> metronome on the same clock | madmom beat times in the audio's seconds | context time = start + (beat time - (-0.01 s)) | in `chainE.html` | r0535 | 65 clicks scheduled, 65 found, each at its scheduled frame (difference 0 frames) |
| capture -> click-to-beat offset | 3-channel float capture: guitar render, clicks, alphaTab metronome | the browser lane's onset rules | `analyze_chainE.py` | r0538 (`--nolock`, 1.88 s; r0537 superseded) | the guitar render's sample 0 found at the scheduled frame (0 frames off; largest sample difference 3e-8). Click minus the nearest alphaTab metronome click: mean +16.38 ms, median +16.37, sd 4.43, min +3.88, max +26.53; 52 of 65 within 20 ms, 1 within 5 ms. Click minus the nearest truth beat on the same clock: mean +5.62 ms, min -6.21, max +15.51 (the tracker's own offset; e1492 gives a median of 5.86 ms). alphaTab's metronome clicks inside the truth beat span (68) minus the nearest truth beat: mean -10.76 ms, sd 0.42, min -11.45, max -10.07 |

### Chain E: where a handoff failed or needed a manual choice

1. alphaTab's real-time player renders in its own AudioContext; the browser lane had to tap its nodes to record it
   (r0269). Here the exported renders were played in the page's own AudioContext instead, so the playback and the
   clicks share one clock by construction. The real-time path was not measured in this chain.
2. The tracked beat times are on the audio's clock and the GP5 starts at its own time 0; the offset (-0.01 s) comes
   from chain A's glue and has to be passed along, because the GP5 file has no field for it.
3. The tab's beat grid (a constant 116 BPM from -0.01 s) and the tracked beats are two different grids: the
   metronome built from tracked beats sat 3.9 to 26.5 ms after alphaTab's own metronome. alphaTab's grid sat 10.1 to
   11.5 ms before the truth beats. That range (-11.451 to -10.068 ms) lies within 0.07 ms (3 samples) of the -0.01 s
   start of the GP5 time plus the -1.429 to 0 ms the browser lane measured for alphaTab's metronome against its own
   grid (64-sample synthesis blocks), i.e. -11.429 to -10.000 ms; S4's truth beats lie on the 116 BPM grid counted
   from 0 s (the first at 2.068966 s).
4. alphaTab's metronome clicks on every beat of the file, including bars the glue added to pad the start and the
   end; the tracker-built metronome clicks only on tracked beats (65 against 73).
5. Fixed by hand in the page and the analysis (added by the verifier from the scripts): the GP5 time zero (-0.01 s)
   passed on the page URL; 44.1 kHz; the click (10 ms, 2 kHz cosine with a 2 ms decay, peak 0.8); playback start
   0.5 s after the context's current time; `exportAudio` chunks of 1,000 ms with `useSyncPoints` off and the guitar
   track at volume 0 for the metronome render; the onset thresholds above; the 20 ms and 5 ms counting windows.

## Run list (this lane)

| run | what | cores | wall s |
|---|---|---|---|
| r0511 | Basic Pitch 0.4.0 TFLite on 4 files (S4 becruily stem, R2 htdemucs_6s guitar stem, S6taps and S2s HPSS harmonic parts) | 2 | 24.68 |
| r0513 | voice split (fingerstyle lane script) on the two harmonic-part note lists | 2 | 4.23 |
| r0514 | merge + tuttut + LilyPond on three Basic Pitch files; chain B tab (1 ms label join, superseded by r0515) | 2 | 9.80 |
| r0515 | chain B tab, pooled and per voice | 2 | 1.21 |
| r0519 | GP5 glue, first version (median tempo only; superseded by r0520, same "median" files) | 2 | 0.69 |
| r0520 | GP5 glue, 12 files (S4, R2 x madmom, Beat This! x median, span, perbar) | 2 | 1.99 |
| r0522, r0523 | alphaTab render, default and `lazy=0` | 2 | 4.61, 4.32 |
| r0528 | chain C: Drop D to both stages, pinned note | 2 | 4.38 |
| r0532 | chain D: R3c neck lines and fret fit (video lane scripts) | 2 | 2.22 |
| r0533 | chain D join | nolock | 0.53 |
| r0535 | chain E page in headless Chromium | nolock | 47.71 |
| r0537, r0538 | chain E analysis (r0538 final) | nolock | 1.81, 1.88 |
| r0540 | chain B taps join | nolock | 0.03 |
| r0546 | chain D pitch check with fret shifts | nolock | 0.03 |

Eval ids of this lane: e1447 to e1449 (notes), e1450 to e1477 (tab, chains A and B), e1486 to e1508 (GP5 read-back,
beats, chords, raw tracker files), e1511 to e1513 (chain C). Summaries with counts: `samples/scores/`.

Not done: chain A with a third tab assigner (tutts, whose note counts in the guitar-tab lane's handoff table equal
tuttut's on S1, S2n, S5capo2, S5dropd and R1b and differ on S3, 186 against 183, R1a, 195 against 193, and R1c, 153
against 152, where tuttut reduces chords it cannot finger and tutts writes them empty), chain B
with a GP5 file carrying two voices and a percussion track for the taps, chain D with the hands of other landmark
models (RTMPose, YOLO pose; outputs on disk in the video lane), chain E through alphaTab's real-time player and on
R2. The Basic Pitch venv rebuilt for r0511 (`/home/user/gtr/lanes/chains/venv-bp`, from
`lanes/audio-to-notes/samples/basic-pitch/uv-pip-freeze-venv-basicpitch-py3.10.txt`) was deleted after use.

## Media kept outside git

All under `/home/user/gtr/lanes/chains/` (none of these is in the blog repo):

- `out/chainE/S4.madmom.span_alphatab_metronome_only.wav` and `..._alphatab_guitar_only.wav` (alphaTab renders of
  the chain A GP5, 2 ch float32, 37.76 s, 13,321,772 bytes each) and `S4.madmom.span_capture.wav` (3 ch float32,
  20,453,420 bytes). Derived from S4 (synthesized for the test set; see INPUTS.md).
- `frames/R3c/f_0001.jpg`, `f_0226.jpg`, `f_0450.jpg` (frames 0, 225, 449 of R3c) and `frames/view/` (crops used to set
  the R3c neck quad), from "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb,
  via Wikimedia Commons, CC BY 3.0 (see INPUTS.md). `out/chainD/opencv-lines-R3c/` holds the rectified neck images.
- `out/render/*.png`: alphaTab screenshots (the WebP copies are in `samples/chainA/`).
- `out/bp/`, `out/tab/`, `out/gp5/`, `out/voicesplit/`, `out/chainC/`, `out/chainD/`: notes, tab lists, GP5 files,
  LilyPond files and joins (the small ones are copied to `samples/`).

One image derived from a video is in the repo (added by the verifier): `samples/chainD/handoff_R3c_f0225_rectified.webp`
(20,526 bytes, 1200 x 260 px), the rectified neck of R3c frame 225 with the model fret numbers and the fingertip cells
marked. It is a crop of "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb, via
Wikimedia Commons (File:Manx Guitar Lesson- Three Little Boats 2019.webm), CC BY 3.0
(https://creativecommons.org/licenses/by/3.0/), warped to a rectangle and annotated here.

## Verification log (verify-chains, 2026-11-11)

Agent `verify-chains`, independent check of this file; re-runs 2026-11-11 00:00 to 00:17 UTC (11 runs: r0564, r0566,
r0572 to r0575, r0578, r0580, r0582, r0589, r0590, all exit 0; evals e1598 to e1613). Method: every run id
and eval id above was looked up in `/home/user/gtr/ledger/runs.jsonl` and `/home/user/gtr/eval/ledger/evals.jsonl`;
every file named was opened and its format read with soundfile, mido, ffprobe, `json` or by eye; every glue script
was read and counted with `wc -l`; at least one joint per chain was re-run from the recorded command into
`/home/user/gtr/lanes/chains/verify/` (label "verify (run by verify-chains): ..."), compared with the lane's output
(`cmp`, or field by field where a file records its own paths or timings) and scored again. The corrections listed
below were made in place in the sections above.

**Ledgers.**
- The 16 runs of the run list are in the ledger with the commands, cores, wall-clock seconds and exit codes given
  (all exit 0). r0511, r0513 to r0515, r0519, r0520, r0522, r0523, r0528 and r0532 held a 2-core slot; r0533,
  r0535, r0537, r0538, r0540 and r0546 are `locked: false` with no cores, and at the start of each of those six the
  ledger shows both slots held by other lanes' locked jobs. No run of this lane is missing from the list.
- The other lanes' runs cited in the sections above (40 ids after the corrections) are in the ledger with exit 0
  and match what the rows say. Corrected: "r0258 to r0265" spanned four runs of other lanes; the YourMT3 half of
  the hosted-apis handoff is r0231, which was missing.
- All 85 eval ids cited in the sections above (after the corrections) exist, exit 0, and give the counts quoted
  (notes written, matched, same string and fret; beats and downbeats matched; majmin share x 38.741383 s; recall by
  voice). e1486 to e1491 scored r0519's files `S4.madmom.gp5` and `S4.beatthis.gp5` and their read-back files;
  `cmp` shows them byte-identical to r0520's `*.median.*` files. Before this check the evals run from this lane's
  folder were exactly e1447 to e1477, e1486 to e1508 and e1511 to e1513 (the verifier's are e1598 to e1613); the
  four `samples/scores/` summaries (54 records) carry the same counts as the ledger. No cited run or eval failed,
  so no failure is described as a success.

**Formats, re-read from the files.** `S4.wav` PCM_16, 2 ch, 44.1 kHz, 38.741 s. htdemucs_6s stems (S4, R2): six
lowercase PCM_16 stereo WAVs (the R2 folder also holds a seventh file, `derived_instrumental_sum.wav`, float32, not
a Demucs output name); R2 `guitar.wav` 6,350,444 bytes, 36.0 s. becruily `Guitar.wav`: float32 stereo,
38.741 s. HPSS `harmonic.wav` / `percussive.wav` (S6taps, S2s): float32 stereo, 44.1 kHz, 29.357 s like the inputs;
the percussive onset file is byte-identical to the source-separation lane's handoff sample. Basic Pitch MIDI (mido):
type 1, 220 ticks per quarter, one tempo of 120 BPM, one 4/4 time signature, every note-off a velocity-0 note-on;
pitch-bend messages 139 in r0243's S4 file and none in the four r0511 files (corrected). Note-events CSV header
`start_time_s,end_time_s,pitch_midi,velocity,pitch_bend` with a variable number of bend values per row. Beat and
chord files: madmom S4 `downbeats.txt` 65 rows from `2.070<TAB>1`, `beats.txt` 74 rows from 0.520; Beat This! 68
beats from 0.520 and 18 downbeats from 0.520; madmom CNN 18 segments from 0.000; Chordino 18 from 0.372; R2: madmom
43 rows from `0.600<TAB>4`, top tempo 72.289; Beat This! 43 and 11; both R2 chord lists as quoted. GP5 read-back
JSON: tempos, time zeros, bar beat counts, notes written and dropped, chords written, drift medians and maxima as
quoted. alphaTab logs: S4 18 master bars, 1200 x 2353; Beat This! file 19, 1200 x 2381; R2 12, 1200 x 2134;
screenshots 1,240 px wide. Looked at: the default page shows bars 1 to 8 and blank space; the `lazy=0` page bars 1
to 18 with chord names over beats and a header of diagrams with every string x; the Beat This! page starts with a
1/4 and a 3/4 bar. MediaPipe JSONL: 450 records per clip, `t_s` = n / 25 exactly, per hand `label`, `score`,
`index`, `lm_norm_view` (x, y, z), `lm_px_full`, `world_m` (corrected in the row); R3b one "Left" hand in 445 frames
and none in 5; R3c "Left" and "Right" in all 450. ffprobe: R3b.mp4 and R3c.mp4 video 25/1 fps, 450 frames, audio
48 kHz 2 ch, both streams start at 0.000000 s. The R3c quad drawn on frame 225 (`f_0226.jpg`; frame n is
`f_{n+1:04d}.jpg`) lies on the fretboard from the nut to the sound hole with the corners as described. Chain E:
renders 2 ch float32, 44.1 kHz, 37.76 s, 13,321,772 bytes each; capture 3 ch float32, 38.65 s, 20,453,420 bytes;
result JSON tempo 116, 18 bars (17 x 4, then 5), last chunk `endTime` 37,758.62 ms, `endTick` 70,080 (73 x 960).
Every copy under `samples/` that has a counterpart under `/home/user/gtr/lanes/chains/out/` is byte-identical to it.

**Re-runs.**

| run | chain: joint(s) re-run (recorded command, outputs to `verify/`) | cores, wall s | result |
|---|---|---|---|
| r0564 | A: merge + tuttut + LilyPond on the S4 htdemucs_6s notes (r0514); GP5 glue span and median on the madmom grid, span on the Beat This! grid (r0520) | 2, 3.47 (slot wait 106.1) | merged MIDI, tuttut list, the three GP5 files and their beat, downbeat and chord files byte-identical; LilyPond notes identical (only its recorded paths differ). Scored: tuttut 342 written, 233 matched, 214 same string and fret (e1598); LilyPond 329, 229, 199 (e1599); GP5 span 325, 223, 210 (e1600); median 325, 57, 52 (e1601); Beat This! span 325, 223, 210 (e1602); beats span 68 of 68, downbeats 17 of 17 (e1603); median 14 of 68, 4 of 17 (e1604); chords in GP5: madmom CNN 0.944593 = 36.59 s (e1605), Chordino 0.867824 = 33.62 s (e1606) |
| r0566 | A: PyGuitarPro 0.11 writing a GP5 chord with `firstFret` unset, then 0 | nolock, 0.1 | unset: `GPException: ... got TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'`; 0: written |
| r0572 | B: voice split on S6taps (r0513); labelled notes -> tuttut pooled and per voice, both clips, B1 and M1 (r0515); taps join (r0540) | 2, 3.03 | voice-split counts and label CSVs identical; the four `*.chainB.json` count files identical (171 / 170 written, 0 unjoined, collisions 3 / 6, 23 / 29, 6 / 8, 10 / 12, same both ways 159, 155, 153, 165); every gtr-eval file byte-identical; taps join identical (5 tap-only, 27 tap+note, 21 note-only). Scored: e1607 40 matched, 35 same string and fret; e1608 41, 31; e1609 41, 41; e1610 8, 6 |
| r0573 | C: Drop D range notes -> merge -> tuttut and LilyPond told Drop D; LilyPond pin 1:55:4 (r0528) | 2, 4.34 | notes identical; LilyPond 0 warnings on the Drop D range notes, 1 (`c,,`) on the pinned run. Scored: e1611 90 matched, 86; e1612 90, 90; e1613 90, 89 |
| r0574 | C: `chainC_diff.py` on the four r0240 pairs, the pin, and the two note sets told Drop D | nolock, 0.17 | counts as in the table (82 kept / 57 moved; 95 / 41; 112 / 96 / 14; 125 / 109, the 16 fret changes all G2 string 6 fret 3 -> 5; pin: 128 identical, 1 moved 3 -> 4); Drop D range notes against r0234's: 129 paired, all with the same string and fret, in tuttut and in LilyPond |
| r0575 | D: R3c neck lines and fret fit (r0532); joins R3b and R3c (r0533); fret-shift check (r0546) | 2, 2.31 | handoff JSON identical; lines JSON identical apart from timings; joins identical apart from a recorded path; shift check 28 / 36 / 27 and 6 / 17 / 6 |
| r0578 | E: `analyze_chainE.py` on the r0535 capture (r0538) | nolock, 1.44 | analysis JSON byte-identical |
| r0580 | E: the chain E page (r0535) with tag `verify.S4.madmom.span`, `serve_chains.cjs` on port 8791 | 2, 46.63 | both exported renders byte-identical to r0535's; 65 clicks scheduled; tempo 116, 18 bars |
| r0589 | A and B: Basic Pitch on the four r0511 files (r0511's command, `bp_run.py`), venv rebuilt offline from the audio-to-notes lane's saved freeze (`uv pip install --offline`) and deleted afterwards | 2, 24.62 | all four note-events CSVs and MIDI files byte-identical to r0511's (406, 305, 175, 174 notes); no pitch-bend messages in the four MIDI files |
| r0590 | A: the same script and venv on r0243's input (S4 htdemucs_6s `guitar.wav`) | 2, 5.30 | CSV and MIDI byte-identical to r0243's, 139 pitch-bend messages: the difference in bends comes from the inputs. In `basic_pitch/note_creation.py`, `note_events_to_midi` calls `drop_overlapping_pitch_bends` ("Drop pitch bends from any notes that overlap in time with another note") when `multiple_pitch_bends` is off; counted from the CSVs, no note of the four r0511 files and 3 of r0243's 342 notes overlap no other note |
| r0582 | E: analysis of the r0580 capture | nolock, 1.27 | every count and offset identical to r0538's (73 metronome onsets; click minus metronome +3.878 to +26.531 ms, mean +16.382; 52 within 20 ms, 1 within 5 ms; click minus truth -6.213 to +15.51 ms; metronome minus truth -11.451 to -10.068 ms); only the absolute start frame differs (23,842 against 24,738). The three verify WAVs (47,081,604 bytes) were deleted after this run |

Not re-run: the alphaTab screenshots (r0522, r0523; the saved PNG and WebP files were looked at instead) and the S2s
voice split.

**Glue scripts.** Line counts as stated for `bp_run.py` 36, `tab_beats_to_gp5.py` 195, `chainB_taps.py` 54,
`chainB_voice_tab.py` 113, `chainC_diff.py` 40, `chainD_join.py` 99, `pages/chainE.html` 93, `analyze_chainE.py`
91; `chainD_pitch_shift_check.py` has 21 lines, not 24 (corrected). Not named in the tables: `batch_tab.sh` (24
lines; r0514), `batch_gp5.sh` (15; r0519, r0520), `batch_chainC.sh` (15; r0528), `score.py` (38; runs gtr-eval
jobs and writes `samples/scores/`), `serve_chains.cjs` (59; the web-tab-render lane's static server plus four
routes and an upload route used by chain E), `pages/alphatab_chains.html` (71; the web-tab-render page plus the line
`enableLazyLoading: q.get('lazy') !== '0'` and a new title). `video_lane_copy/` differs from the video lane's
scripts only by one comment line per file and the `LANE` path in `vhf_common.py` (diff). Each script does what its
row says, except that `tab_beats_to_gp5.py` extends the grid only to the last note onset, not to the end of the
audio, and starts bars at grid beats within 35 ms of a downbeat (both corrected).

**Corrections made in place.**
1. Cited joints: the fingerstyle runs are r0258, r0260, r0263, r0265 (not "r0258 to r0265"); the eval ranges e0646
   to e0743, e0744 to e0877 and e0815 to e0934 are marked as interleaved with other lanes' ids; r0231 and the
   handoff's counts (e0522, e0525) added to the hosted-apis row.
2. Chain A tools: LilyPond is the system binary `/usr/bin/lilypond`, not part of `venv-sym`.
3. Basic Pitch MIDI format: no pitch-bend messages in the r0511 files, and why (r0589, r0590).
4. GP5 glue: grid extended to the last note onset, 35 ms downbeat window; e1486 to e1491 scored r0519's files.
5. Beat row: "the 9 extra are the glue's added beats" was wrong: 73 = 4 + 65 + 4 (madmom) and 1 + 68 + 4 (Beat
   This!); the 5 GP5 beats without a truth beat are named. Chain E: "5 after the end" changed to 4.
6. Chords: which recogniser went into which grid's files (`batch_gp5.sh`), so the Chordino in-GP5 seconds are on the
   Beat This! grid; "the right chord" reworded as a match with the truth; PyGuitarPro's error is a `GPException`
   wrapping a `TypeError` (r0566); R2: "spell the same pitch classes" changed to the same roots, and madmom CNN gives
   major and minor only.
7. Chain A point 5: "57 of the 233 matched notes" changed to 57 of the 369 truth notes after read-back.
8. Chain B: on S2s, M1 could not join 122 of 174 notes back and labelled them bass by default (added to the row and
   to point 5); point 2 gives totals and unmatched counts instead of "fewer extra notes".
9. Chain C: r0349 also set `maximum_frequency` 1319 Hz; the comparison is with r0234's notes (no frequency limits) in
   both tools; the pinned run's input (r0234's 130 notes, 129 placed, one warning with and without the pin);
   e0544 and e0510 added to point 2; the parameter list completed (tuttut weights; tutts time signatures and tempo;
   tayuya and TabCNN no constraint input).
10. Chain D: the landmark fields; the script's line count.
11. Chain E: "That range equals" changed to "lies within 0.07 ms (3 samples) of"; both onset rules spelled out.
12. Not done: tutts' note counts equal tuttut's on 5 of the 8 clips, not on all.
13. The rectified R3c WebP in `samples/chainD/` (a crop of the CC BY 3.0 video) now carries its attribution.

**Manual choices that were missing** (read from the scripts and added as chain A point 11, chain B point 7, chain D
point 7 and chain E point 5): hard-coded windows (35 ms downbeat, 2.5 ms label join, 50 ms tap join, 1 ms truth
grouping, 20 ms frame window, 20 ms and 5 ms counting windows), the four-16ths grid and x/4 bars, the pairing of beat
trackers with chord recognisers, the `--time-shift` values, stem file names, Basic Pitch thresholds, MIDI tempo,
program and velocity, tuttut's 20 frets, 25 fps, landmark ids, the R3c quad and rectified size, the click and the
playback start of the chain E page.

**Language.** Searched for ranking and judging words (best, better, worse, good, poor, recommended, success,
reliable, accurate, and the like); none is used about a tool. "The right chord" was reworded (item 6); "the rule
matters" was removed (item 7). Tools are introduced as the ones at hand, as the opening paragraph says.

**Size and media.** `lanes/chains/` holds 93 files, 1.2 MB; the largest is 137,176 bytes
(`samples/chainA/alphatab_S4.beatthis.span.nolazy.webp`). No recorded audio or video; four MIDI files (symbolic
notes), four GP5 files and five WebP images.

**UNVERIFIED.**
- Which fret numbering is right on R3b and R3c (as chain D says): a hand-labelled frame would settle it.
- That the chain agent's r0511 venv was rebuilt "offline from the shared cache": not checkable after its deletion;
  the verifier's own rebuild from the same freeze with `--offline` succeeded and reproduced r0511's outputs byte for
  byte (r0589).
