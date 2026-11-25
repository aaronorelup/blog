# Ground truth: slot `capo` (*Steal My Girl*, Gareth Evans, capo 3)

Built 2026-11-25 by the truth-capo agent. Every number below comes from a file named next to it. Heavy files are under
`/home/user/gtv/` (not in the repo); work scripts and logs in `/home/user/gtv/work/truth-capo/` (`bin/`, `logs/`,
`PROGRESS.md`).

## Source and credit

- *Steal My Girl* (One Direction, 2014), solo fingerstyle arrangement, tab and performance by Gareth Evans.
  Video from his YouTube channel (-I0KV5KLC7c, 2016-04-01) via the Internet Archive item `gareth-evans_202101`.
- Licence as stated: none in the Internet Archive item (a third-party mirror); the YouTube original carries the
  standard YouTube licence. A cover of a major-label composition. Details: `SONGS.md`, `songs.json`.
- Credit line: "Steal My Girl (One Direction), fingerstyle arrangement, tab and performance by Gareth Evans
  (goliathguitartutorials.com). Video from his YouTube channel, via the Internet Archive."

## Files

| file | what |
|---|---|
| `/home/user/gtv/songs/capo/capo.mp4` | what the tools and the blind run get: video.mkv 18.0 s + 227.92 s, crop 1920x556 (tab strip and logo banner gone), title card and end card cut, x264 crf 16 (preset medium, GOP 50), Opus audio copied, metadata stripped (the mkv carried the title, the comment and the URL). gtr-run r0754 |
| `capo.full.mp4` | the same cut, uncropped (1920x1080, tab strip visible) |
| `capo.wav`, `capo.mono.wav` | from capo.mp4, 44.1 kHz 16-bit, 227.921 s |
| `capo.seg30.wav`, `.seg30.mono.wav`, `.seg30.mp4` | the 30 s segment, **t0 = 12.76 s of capo.wav** (= 30.75 s of video.mkv, the segment `songs.json` names) |
| `/home/user/gtv/truth/capo/capo.truth.json` | the truth (schema of EXPERIMENTS.md "Scoring"), `capo.wav` linked next to it |
| `capo.notes.csv`, `.beats.txt`, `.chords.lab`, `.mid`, `.gp5`, `.tab.txt` | side files |
| `capo.tab-merged.json` | the merged reading of the tab (reader format plus a `merge` block) |
| `capo.video.json` | video truth |

**Time base.** capo.wav sample 0 = 17.9925 s of the video.mkv audio (cross-correlation with the selector's
`audio.wav`, the same value at 10 s and at 200 s). Title card: fades out by 17.6 s, audio silent until 18.17 s, first
note at 18.34 s. End card: its fade starts on the frame at 245.97 s, so capo.mp4 stops at 245.91 s. capo.mp4 frame 0 =
video.mkv frame 18.007 s: audio-video offset -0.007 to -0.015 s, under half a frame, recorded as 0.

## Tuning and capo

- **Standard tuning, capo on fret 3** (`tuning_midi` 40 45 50 55 59 64, `capo` 3). Confirmed four ways:
  1. The title card legend (frame at 12 s of video.mkv): "The guitar is tuned to standard tuning", "The capo is on the
     3rd fret"; the tab strip prints "Capo. fret 3" over bar 1.
  2. Lowest notes heard: bars 1-2 bass, tab s6 f3 = Bb2 (46): CQT level 30-150 ms after the bass onsets +18.4 dB at
     Bb2 against -4.9 dB at Eb3; bars 3-4, tab s5 f3 = Eb3 (51): +20.5 dB at Eb3, -9.1 dB at Bb2. With no capo the
     same frets would sound G2/C3.
  3. The whole truth synthesized against the recording: chroma cosine 0.845, against 0.496 for the same frets
     without the capo and 0.465 a semitone up (`work/truth-capo/chroma_check.json`).
  4. Frames: the capo sits just behind fret wire 3 (the fret-3 inlay is on its nut side); the ring finger on s6 at
     nut-fret 6 while Bb2 sounds (frame 2.60 s, `capo.video.json`).
- `tuning_offset_cents` **+2**: median deviation of 544 confirmed notes (spectral peak of the harmonic nearest
  650 Hz, 60 ms after the onset) +1.6 cents, interquartile range -0.1 to +4.0, per string +0.7 to +2.1;
  `librosa.estimate_tuning` on the whole file +4.1 cents (`bin/tuning.py`).

## Method

1. **Reading.** Two readers read the 72 bars on the 19 tab pages independently (`read-a.json`, `read-b.json`):
   791 events and 1007 note heads each, identical event positions in every bar, identical mark counts (o 140,
   X events 96, T 91, rh 16, h 28, p 76, slide 4, tie 8). Compared note by note (`bin/compare_readers.py`):
   **997 notes agreed, 10 differed**, all in bars 3-4 (bass 3s: A string 5, B string 6). Settled for A by the page
   (the 3s of bars 3-4 sit on the 5th line, those of bars 1-2 on the 6th, `page_01.png` enlarged) and by the audio
   (point 2 above). Other differences carried no pitch: bar 56 pos 3.5, the duration of two X notes (0.25 or 0.5);
   mark spelling in bars 18, 40, 56-58. Neither reader marked a doubt; neither file was missing or broken.
2. **Bar times from the cursor.** The tab strip has a blue Guitar Pro cursor that moves smoothly through each bar
   and jumps 62-92 px at every bar line (the next largest jump on any page is 47 px) and back at page turns. Read on
   all 5,725 frames (`bin/cursor_track.py`, `bin/bar_fit.py`): 72 bar starts, page by page equal to the readers'
   bar-to-page map. The cursor runs at 76.95 bpm but is **not** locked to the playing: the performance sits -40 to
   +205 ms from it, drifting by section, so the cursor only seeds the alignment.
3. **Event alignment.** A monotonic dynamic programme over the 791 tab events (`bin/align_dp.py`): each event may sit
   within +-0.30 s of its cursor time; its score is the rise in a CQT (36 bins per octave) at the pitch or the octave
   of each of its notes plus the onset envelope; X-only events use the onset envelope; a penalty on
   log(gap / written gap)^2 keeps the tempo musical; each time is then moved to the envelope peak within 15 ms.
   Widening the window to +-0.50 s changes no event by more than 20 ms (0 of 791). Two simpler tries were rejected:
   a comb correlation on the onset envelope and a pitch-weighted one both locked onto one-16th shifts (+-180 ms) in
   some sections.
4. **Truth fields** (`bin/build_truth.py`). Pitch = tuning + capo + fret for every note with a fret. X notes ("XX on
   strings = percussive thumb slap into strings" in the legend) are not pitched notes: they are `taps`.
   - Offsets: the tab says "let ring throughout", so a note lasts to the next attack on the same string (pitched or
     X slap) minus 10 ms, at most 2.0 s, at most the end of the file. **Estimates, not measured.**
   - Voice by rule: per event, the highest note on strings 1-3 (or the tapped note of a T event) = melody, the lowest
     note on strings 4-6 = bass, the rest = chord.
   - Beats: the 288 quarter-note positions of the tab, times interpolated between aligned events (exact where an
     event sits on the beat). Downbeats: beat 1 of the 72 bars. Tempo = 60 / median beat interval.
   - Chords: the tab has no chord names, so they are **derived from the truth notes** per half bar (duration-weighted
     pitch classes, lowest note counted again, major/minor templates), merged when repeated; `N` before bar 1.
   - Key: Krumhansl-Kessler profile on the note durations (second best: G minor).
   - Taps: kind `string-slap` (X notes), `thump` (o, wrist thump into the body), `body-slap` (rh, right-hand slap
     into the body; the legend defines rh that way, and in the frame at 25.95 s the right hand is off the fretboard,
     at the edge of the body, on that beat). Six thumps drawn over tied notes (bars 22, 26, 44, 48, 64 beat 1, bar 56 pos 3.25) have
     no event; their times are interpolated on the beat grid.
   - `conf` per note: `tab+audio` = a rise of at least 3 dB at the note's pitch or octave at the onset; `tab` = not
     confirmed that way. No `audio` notes were added (see Departures).
5. **Side files**: `gtr_common.py` writers of the research for csv/beats/lab/tab.txt, pretty_midi for the MIDI,
   PyGuitarPro for the GP5 (`bin/write_gp5.py`: one beat per tab event, X as dead notes, cross-bar ties split, a
   hidden tempo change on every beat so each beat starts at its aligned time; **GP5 time 0 = 0.3455 s of capo.wav**,
   score it with `--time-shift 0.3455`).

## Covered range and counts

- **The whole piece**: `scored_range` [0, 227.921] s, bars 1-72, first note 0.3455 s, last onset 224.88 s.
- 815 pitched notes (melody 573, bass 202, chord 40); conf: **768 tab+audio, 47 tab, 0 audio**.
- 72 bars, 288 beats, 72 downbeats, tempo 76.57 bpm, 4/4, key Bb major.
- 68 chord segments (labels: Eb:maj 23, C:min 18, Bb:maj 17, D:min 4, F:maj 4, G:min 1, N 1).
- 258 taps: 96 string-slap, 146 thump (6 interpolated), 16 body-slap.
- `gtr-eval check-truth`: **8317 checks, 0 mismatches**.
- Side files scored against the JSON (`--no-ledger`): notes.csv onset and onset+offset F1 1.0; .mid onset 1.0
  (onset+offset 0.985, MIDI tick rounding); .tab.txt `tab` 815/815 same string and fret; .gp5 `tab` 815/815 and
  `notes` onset F1 1.0 with `--time-shift 0.3455` (onset+offset 0.409: Guitar Pro stores written lengths, not the
  let-ring offsets); beats.txt beats F 1.0 and downbeats F 1.0 (`--downbeat-col 2`); chords.lab root, majmin,
  sevenths 1.0.

## Departures from the tab

None found that the tab does not write: the performance follows the 72 written-out bars in order (no repeat signs,
every bar aligned, no bar with a cluster of unconfirmed notes; the 47 `tab` notes are spread over 36 bars, at most 3
in one bar: 16 on pull-off origins (7 of them struck with an X slap), 7 more struck with an X slap, 5 with a thump,
2 slides, 17 plain). Heard but **not** added: Basic Pitch
finds open-string G2 (43, open s6 with the capo) and F3 (53, open s4) at about 20 places (for example 27.6-30.7 s,
95-110 s, 172-173 s), most likely strings left open after slaps and tapped pull-offs; they are not in the tab, were not
confirmed by eye, and are not in `notes`.

## Checks

| check | result | file |
|---|---|---|
| Basic Pitch 0.4.0 (tflite) on capo.wav, gtr-run r0756 | onset P 0.518, R 0.925, **F1 0.664**; onset+offset F1 0.289; recall bass 0.881, melody 0.939 (eval e1878) | `work/truth-capo/bp/`, `logs/eval_bp_final.json` |
| guitar-fl.pth (guitar-trained model) on capo.mono.wav, r0759 | onset P 0.860, R 0.931, **F1 0.894**; onset+offset F1 0.501 (eval e1879) | `work/truth-capo/gfl/`, `logs/eval_gfl_final.json` |
| per 10 s, guitar-fl | F1 0.82 to 0.98 in every window but the last (220-228 s: 0.54, recall 0.88, extra notes in the final ringing chord); recall 0.84 to 1.00 everywhere | `gfl/capo.guitar-fl.mid.per10.json` |
| per 10 s, Basic Pitch | recall 0.78 to 1.00, F1 0.57 to 0.74; its low precision is extra notes: of 702 unmatched, 306 repeat a pitch still ringing, 207 are octaves or harmonics of a sounding note, 72 sit on a slap or thump | `bp/capo_basic_pitch.mid.per10.json`, `bin/unmatched.py` |
| truth synthesized (FluidSynth, steel guitar) vs recording, chroma cosine | 0.845 overall; per 10 s 0.77 to 0.91; same frets without the capo 0.496, one semitone up 0.465 | `chroma_check.json` |
| 10 notes by hand, one every ~22 s (CQT slice at the onset, frame at the onset) | spectrogram: 8 clear onsets at the written pitch, 2 weak (84.20 s and 215.52 s, both s2 f3 = F4, rise 3.1 and 3.3 dB); frames: the fretting or tapping hand is at the note's fret region in 10 of 10 (judged at half scale; strings not resolvable there) | `handcheck.json`, `handcheck_spec.png`, `handcheck_frames.jpg` |
| alignment stability | +-0.30 s vs +-0.50 s search: 0 of 791 events move more than 20 ms | `aligned_dp_r030.json` |

No 10-second stretch scores far below the research's 0.7-0.9 onset F1 for the guitar-trained model, so no stretch is
misaligned. Basic Pitch's F1 of 0.664 is below that range because of precision, not recall (0.925).

## Video truth (`capo.video.json`)

25 fps, 1920x556, 5698 frames, one static shot, not mirrored, `capo_fret` 3. String 6 is the top edge of the neck,
the nut side is on the right. **The nut is off-frame** (fret wire 2 at x ~1820, wire 1 and the nut extrapolated to
~1935 and ~2050 from the fret spacing), so the neck quadrilateral's nut corners lie outside the picture: [2050, 222,
2050, 378, 540, 400, 540, 203] (nut-top, nut-bottom, body-bottom, body-top); frets 2 to 20 visible. Two frames
labelled by eye on full-resolution zooms: 2.60 s (ring s6 nut-fret 6, middle s3 nut-fret 5, index hovering at fret
4, pinky hovering at fret 7) and 59.96 s (the thumb over the top frets s6 nut-fret 6; index nut-fret 6, read as s2
with the help of the F4 that sounds; other fingers not visible). Both frames come from the same shot (there is only
one).

## What remains uncertain

- **Offsets** are a let-ring rule, not measured: use onset metrics as the truth, onset+offset only as a hint.
- **47 notes** (`conf` "tab") have no 3 dB pitch rise at their onset: their timing comes from the event alignment
  and they may be very soft (pull-off origins, notes under a slap). Onsets of all notes are aligned events, not
  individually hand-checked beyond the 10 above; legato (h/p) and tapped notes are quieter and their onsets are less
  sharp than plucked ones.
- **Voices, chords and key are derived** (voice by string rule; chords from the notes, no chord names in the tab),
  not given by the source.
- **Taps**: the six thumps over tied notes are interpolated; slap kinds follow the legend, not a frame-by-frame look.
- **Open-string ghost notes** (G2, F3) heard by Basic Pitch are not in the truth.
- **Video**: the nut corners of the quadrilateral are extrapolated; in the second labelled frame the index finger's
  string was read with help from the audio.
