# Ground truth: slot `capo` (*Steal My Girl*, Gareth Evans, capo 3)

Built 2026-11-25 by the truth-capo agent. Every number below comes from a file named next to it. Heavy files are under
`/home/user/gtv/` (not in the repo); work scripts and logs in `/home/user/gtv/work/truth-capo/` (`bin/`, `logs/`,
`PROGRESS.md`).

**Repaired the same day** by the truth-fix-capo agent after the independent check (`truth-capo-check.md`): 120 of the
791 events (128 notes) sat 32-119 ms before their attack and were moved to it, and the beats, downbeats and taps were
rebuilt from them. See **Repairs** at the end; the numbers in this record are those of the repaired truth unless they
say "before". The repair's scripts and logs: `/home/user/gtv/work/truth-fix-capo/` (the first build is kept in `orig/`).

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
   some sections. **Flaw, repaired:** this pitch-rise score stays high from about 60 ms *before* an attack (the CQT's
   long low-pitch windows smear a note's energy back in time), so the tempo penalty could hold late-played figures on
   the written grid at no cost, and the 15 ms snap then landed on a small envelope bump before the attack. 120 events
   were moved to their attack afterwards (Repairs).
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
     confirmed that way. No `audio` notes were added (see Departures). Measured again at the repaired onsets, 7
     re-timed notes fall under 3 dB (the same smear lowers this rise at an attack), so they are now `tab`.
5. **Side files**: `gtr_common.py` writers of the research for csv/beats/lab/tab.txt, pretty_midi for the MIDI,
   PyGuitarPro for the GP5 (`bin/write_gp5.py`: one beat per tab event, X as dead notes, cross-bar ties split, a
   hidden tempo change on every beat so each beat starts at its aligned time; **GP5 time 0 = 0.3455 s of capo.wav**,
   score it with `--time-shift 0.3455`).

## Covered range and counts

- **The whole piece**: `scored_range` [0, 227.921] s, bars 1-72, first note 0.3455 s, last onset 224.88 s.
- 815 pitched notes (melody 573, bass 202, chord 40); conf: **761 tab+audio, 54 tab, 0 audio** (before the repair
  768 / 47).
- 72 bars, 288 beats, 72 downbeats, tempo 76.56 bpm (76.57 before), 4/4, key Bb major.
- 68 chord segments (labels: Eb:maj 23, C:min 18, Bb:maj 17, D:min 4, F:maj 4, G:min 1, N 1).
- 258 taps: 96 string-slap, 146 thump (6 interpolated), 16 body-slap.
- `gtr-eval check-truth`: **8317 checks, 0 mismatches** (before and after the repair; `truth-fix-capo/out/eval/`).
- Side files, rewritten with the repaired JSON and scored against it (`--no-ledger`, `truth-fix-capo/out/eval/side_*.json`):
  notes.csv onset and onset+offset F1 1.0; .mid onset 1.0 (onset+offset 0.985: 17 same-pitch notes overlap on different
  strings, so 19 note-offs read back from the MIDI file differ by 0.06-1.82 s; not tick rounding, `truth-fix-capo/logs/mid_offsets.log`);
  .tab.txt `tab` 815/815 same string and fret; .gp5 `tab` 815/815 and
  `notes` onset F1 1.0 with `--time-shift 0.3455` (onset+offset 0.409: Guitar Pro stores written lengths, not the
  let-ring offsets); beats.txt beats F 1.0 and downbeats F 1.0 (`--downbeat-col 2`); chords.lab root, majmin,
  sevenths 1.0.

## Departures from the tab

None found that the tab does not write: the performance follows the 72 written-out bars in order (no repeat signs,
every bar aligned, no bar with a cluster of unconfirmed notes; the 47 `tab` notes of the first build (54 after the
repair, see Repairs) are spread over 36 bars, at most 3 in one bar: 16 on pull-off origins (7 of them struck with an X slap), 7 more struck with an X slap, 5 with a thump,
2 slides, 17 plain). Heard but **not** added: Basic Pitch
finds open-string G2 (43, open s6 with the capo) and F3 (53, open s4) at about 20 places (for example 27.6-30.7 s,
95-110 s, 172-173 s), most likely strings left open after slaps and tapped pull-offs; they are not in the tab, were not
confirmed by eye, and are not in `notes`.

## Checks

| check | result | file |
|---|---|---|
| Basic Pitch 0.4.0 (tflite) on capo.wav, gtr-run r0756 | onset P 0.537, R 0.960, **F1 0.689**; onset+offset F1 0.302; recall bass 0.950, melody 0.962 (eval e1907; before the repair 0.518 / 0.925 / 0.664, e1878) | `work/truth-capo/bp/`, `truth-fix-capo/out/eval/eval_bp_after.json` |
| guitar-fl.pth (guitar-trained model) on capo.mono.wav, r0759 | onset P 0.884, R 0.958, **F1 0.920**; onset+offset F1 0.523 (eval e1908; before 0.860 / 0.931 / 0.894, e1879) | `work/truth-capo/gfl/`, `truth-fix-capo/out/eval/eval_gfl_after.json` |
| per 10 s, guitar-fl | F1 0.86 to 1.00 in every window but the last (220-228 s: 0.62, precision 0.44, recall 1.00: extra notes in the final ringing chord); recall 0.88 to 1.00 everywhere (before: F1 0.82-0.98, last 0.54) | `truth-fix-capo/out/models/capo.guitar-fl.mid.per10.json` |
| per 10 s, Basic Pitch | recall 0.85 to 1.00, F1 0.61 to 0.77; its low precision is extra notes: of 674 unmatched, 282 repeat a pitch still ringing, 206 are octaves or harmonics of a sounding note, 71 sit on a slap or thump (before: 702, 306, 207, 72) | `truth-fix-capo/out/models/capo_basic_pitch.mid.per10.json`, `truth-fix-capo/logs/unmatched_after.log` |
| truth synthesized (FluidSynth, steel guitar) vs recording, chroma cosine | 0.845 overall (also after the repair); per 10 s 0.77 to 0.92; same frets without the capo 0.496, one semitone up 0.465 | `chroma_check.json`, `truth-fix-capo/logs/chroma_after.log` |
| 10 notes by hand, one every ~22 s (CQT slice at the onset, frame at the onset) | spectrogram: 8 clear onsets at the written pitch, 2 weak (84.20 s and 215.52 s, both s2 f3 = F4, rise 3.1 and 3.3 dB); frames: the fretting or tapping hand is at the note's fret region in 10 of 10 (judged at half scale; strings not resolvable there). Run again after the repair: the same 10 notes; two were re-timed (126.61 -> 126.68 s C4, 148.44 -> 148.48 s G4), still clear at the new onset (rise 9.1 and 6.0 dB), hand at nut-fret 5 and in the fret-12 region | `handcheck.json`, `handcheck_spec.png`, `handcheck_frames.jpg` (in `work/truth-capo/` and, after the repair, `work/truth-fix-capo/`) |
| alignment stability | +-0.30 s vs +-0.50 s search: 0 of 791 events move more than 20 ms (this tests the search window, not the tempo penalty that caused the early runs) | `aligned_dp_r030.json` |
| timing against an own onset detector (the checker's `timing.py`) | truth onsets with a detection within 50 ms 0.977 (per 10 s 0.93 to 1.00); before the repair 0.916 (0.80 to 1.00) | `truth-fix-capo/out/timing_after.json`, `timing_before.json` |

The first build said that no stretch was misaligned because no 10-second window scored low; the independent check
showed that the windows hid 24 short runs of early notes. After the repair no note is more than 50 ms off for two of
three independent methods (Repairs). Basic Pitch's F1 of 0.689 is low because of precision, not recall (0.960).

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
- **54 notes** (`conf` "tab"; 47 before the repair) have no 3 dB pitch rise at their onset: their timing comes from
  the event alignment and they may be very soft (pull-off origins, notes under a slap). Onsets of all notes are
  aligned events, not individually hand-checked beyond the 10 above; legato (h/p) and tapped notes are quieter and
  their onsets are less sharp than plucked ones.
- **Timing left as it is after the repair** (Repairs, "Not changed"): 197.80 s (split evidence); 12 events whose attack
  is 26 ms after the truth; five thump events where the written notes sound about 40-55 ms after the thump and the
  thump time stays the onset of both.
- **Voices, chords and key are derived** (voice by string rule; chords from the notes, no chord names in the tab),
  not given by the source.
- **Taps**: the six thumps over tied notes are interpolated; slap kinds follow the legend, not a frame-by-frame look.
- **Open-string ghost notes** (G2, F3) heard by Basic Pitch are not in the truth.
- **Video**: the nut corners of the quadrilateral are extrapolated; in the second labelled frame the index finger's
  string was read with help from the audio.

## Repairs

Done 2026-11-25 by the truth-fix-capo agent after the independent check (`truth-capo-check.md`, PROBLEMS 1 and 2).
Work folder `/home/user/gtv/work/truth-fix-capo/` (`bin/`, `logs/`, `out/`, `PROGRESS.md`; the first build in `orig/`,
SHA-256 `d6f95a15aa98...`). Repaired `capo.truth.json`: SHA-256 `426d256fcec1...` (`logs/installed.sha256`). Every
re-timed note, before and after: `truth-capo-repairs.csv` (next to this record).

**Cause.** The alignment's pitch-rise score (Method, step 3) does not peak at an attack: it is high from about 60 ms
before it. Where the player stretched the time (the figures that lead into a bar at phrase ends), the tempo penalty held
the events on the written grid at no cost, and the 15 ms snap put them on a small envelope bump before the attack.

**Rule used to re-time** (`bin/retime4.py`, written in four passes; the drafts and why they were dropped are in
`PROGRESS.md`). For each of the 791 events, in time order, onset-envelope peaks of `capo.wav` (the builder's envelope:
mel flux, hop 256) are searched from 12 to 163 ms after the event's time and before the next event. A peak qualifies if
its envelope is at least 1.8 times the envelope at the event's time (and at least 0.15) and one of the event's pitches
is at least 2 dB louder after it than at the event's time (harmonic salience from a 46 ms STFT; a rise is not required,
so a string that was still ringing and is struck again counts); events with only X slaps need 2.5 times. For events
with no tap mark, a peak at least as strong as the one at the event's time also qualifies when that one carries no
rise of the event's pitches (under 3 dB) and the later one a gain of 6 dB or more. The event's attack is the earliest
qualifying peak with at least 75 % of the largest qualifying envelope; the event moves to it if it is 30 ms or more
later. The convention is unchanged: a truth onset is an onset-envelope peak. Nothing qualified for a move to an earlier
time (no event has a qualifying attack 25-60 ms before a weak truth time). The Basic Pitch, guitar-fl and Beat This
outputs were used only to check the result, never to set a time.

### Problem 1, note onsets 50-100 ms early: fixed (1 note left, with reasons)

- **Changed: 128 of 815 notes (120 of 791 events), all moved later by 32 to 119 ms (median 49).** Pitches, strings,
  frets and voices are unchanged; 103 let-ring offsets follow the moved attacks.
  - 45 of the checker's 46 notes, in all 24 runs it lists (7.21-7.42 ... 223.23 s), plus 2 more notes of the same
    events (173.35 and 223.23 s).
  - 81 notes of the same kind at other times, mostly 32-49 ms early (the checker's test stops at 50 ms): 7.9, 9.2, 18.8,
    19.4, 20.4, 20.9, 21.9, 22.1, 23.5, 24.8, 25.5, 26.7, 27.9, 28.3, 28.5, 30.0, 32.7, 37.9, 38.1, 38.9, 39.3, 51.8,
    54.9, 57.1, 65.5, 69.9, 70.0, 70.5, 76.1, 78.1, 79.8, 92.1, 94.2, 95.0, 96.5, 96.7, 98.7, 106.6, 108.1, 109.0,
    109.4, 111.1, 112.5, 121.9, 123.5, 126.0, 126.2, 126.4, 128.7, 134.0, 134.2, 138.5, 138.7, 139.1, 144.8, 146.5,
    146.7, 148.4, 161.7, 164.1, 167.2, 170.3, 173.9, 177.6, 177.8, 178.5, 179.2, 180.8, 184.1, 188.6, 189.0, 196.4,
    196.6, 198.4, 208.2, 210.9, 223.4 s. Two of them were more than 50 ms early behind an attack that is not theirs:
    54.87 and 123.48 s (Eb3 on s6 f8, bar 18 and bar 40 beat 3) sound 67 ms after an unwritten attack that carries no
    Eb3 rise. At 177.82 s an extra attack with a D4 sits where the truth was; the written D4 + Bb3 chord comes 90 ms
    later, on the 16th grid, with the largest envelope peak there and Bb3 11.5 dB louder (D4 2.3 dB, already sounding).
  - `conf`: measured again at the new onsets with the builder's measure, 7 re-timed notes fall under 3 dB (70.05,
    126.41, 173.35, 174.10, 174.89, 179.23, 180.78 s before the repair) and are now `tab`: 761 `tab+audio`, 54 `tab`
    (768 / 47 before). The 687 notes that did not move get exactly the builder's values again (`logs/fixalign.log`).
- **Not changed: 197.80 s** (the checker's #716, D4, the pull-off target of the Eb4 at 197.64 s). The evidence is split,
  not one-sided: the onset detector finds no onset of its own (its nearest is the Eb4, 160 ms earlier), Basic Pitch
  hears a D4 84 ms *before* the truth and guitar-fl 22 ms after; the envelope has only a faint bump (0.18 against
  0.10) 46 ms later, under the rule's threshold. Each of these tools gets the same score with the truth at 197.80 s or
  at 197.85 s. Its `conf` stays `tab+audio`.
- **Also not changed**, inside every tolerance used: 12 events whose attack is 26 ms after the truth (under the 30 ms
  floor); five thump events (56.47, 79.64, 125.08, 148.24, 198.20 s) where the thump is at the truth time and the written
  notes sound about 40-55 ms later (splitting a tap from its notes would change the build). A looser rule (1.5 times,
  1 dB) would move 8 more events (these five, 197.80 s, and 79.26 and 147.85 s, two more D4s after a pull-off) and
  give no event another time; stricter ones move 112 (2.2 times, 3 dB) or 109 (2.5 times, 3 dB) instead of 120; a
  25 ms floor 132, a 40 ms floor 93 (`logs/sensitivity_v4.log`).

| measure (`bin/validate.py`, the checker's `bin/timing.py`, `gtr-eval`) | before | after |
|---|---|---|
| notes that 2 of 3 methods (own detector, Basic Pitch, guitar-fl, bias removed) hear > 50 ms after the truth, none within 30 ms | 47 (the checker's 45 + 180.78 and 189.01 s) | **0** |
| the same, heard > 50 ms before the truth | 1 (197.80 s) | 1 (197.80 s) |
| own onset detector: truth onsets with a detection within 50 ms (per 10 s) | 0.916 (0.80-1.00) | **0.977** (0.93-1.00) |
| own detector: precision against notes and taps; taps found within 50 ms | 0.879; 0.965 | 0.932; 1.000 |
| median detection minus truth | +2.8 ms | 0.0 ms |
| the 128 re-timed notes within 50 ms of: detector / Basic Pitch / guitar-fl | 79 / 67 / 75 | 127 / 119 / 124 (of 128 / 123 / 125) |
| the same notes, median offset (bias removed): detector / Basic Pitch / guitar-fl | +49 / +47 / +46 ms | 0 / -3 / -3 ms |
| guitar-fl P / R / F1 (median offset) | 0.860 / 0.931 / 0.894 (-18 ms) | 0.884 / 0.958 / 0.920 (-20 ms) |
| Basic Pitch P / R / F1 (median offset) | 0.518 / 0.925 / 0.664 (-13 ms) | 0.537 / 0.960 / 0.689 (-15 ms) |

No re-timed note is put more than 40 ms after its sound by any method, except by the detector at 3 notes (70.09,
112.49, 162.33 s) where Basic Pitch and guitar-fl agree with the new time within 11 ms (`logs/overshoot_v4.log`).
Files: `out/validate_before.json`, `out/validate_after.json`, `out/timing_before.json`, `out/timing_after.json`,
`out/eval/eval_*`, `logs/timing_table.log`.

### Problem 2, beats, downbeats and taps early by the same amount: fixed

Rebuilt from the re-timed events with the builder's own code (`bin/build_truth_fix.py`, a copy of `build_truth.py` with
only the work folder and the onset texts changed): beats interpolated between events (exact on an event), the six
thumps over ties placed on the beat grid. **57 of 288 beats changed (by up to 102 ms), 22 of 72 downbeats, 24 of 258
taps** (all thumps: 18 on re-timed events, the 6 interpolated ones by 28-29 ms); 24 chord boundaries follow the beats
(up to 84 ms); the 68 chord labels, key (Bb major) and `scored_range` [0, 227.921] are unchanged; tempo 76.57 -> 76.56.

- The checker's items: beat 7.21 -> 7.309 s (Beat This -9 ms from it, was +87), 59.50 -> 59.594 (-14, was +82),
  128.10 -> 128.203 (-23, was +78), 174.89 -> 174.974 (-14, was +70), 178.02 -> 178.120 (-20, was +75); 161.68 ->
  161.727 (the slide's attack, bar 52 beat 4: Beat This stays 53 ms later, inside its 70 ms window, was +102).
  Downbeats of bars 18, 21, 43, 53, 59: 53.287 -> 53.359, 62.627 -> 62.700, 131.236 -> 131.303, 162.479 -> 162.551,
  181.153 -> 181.232 s. Thumps 59.498 -> 59.594 and 128.102 -> 128.203 s (`logs/beats_items.log`).

| measure | before | after |
|---|---|---|
| Beat This 1.1.0 (the checker's run) vs truth beats: F / matched | 0.977 / 282 of 288 | **0.998 / 288 of 288** |
| Beat This downbeats: F / matched | 0.932 / 68 of 72 | **0.986 / 72 of 72** |
| truth beats more than 70 ms from a Beat This beat | 6 | 0 |
| beats on a note or tap with a detected onset within 50 ms | 0.915 | 1.000 |
| downbeats with the detector more than 50 ms off | 13 | 1 (bar 60, which starts on a tie: no attack) |

### Self-checks after the repair (step 6 of the method)

`gtr-eval check-truth` 8317 checks, 0 mismatches. Side files rewritten with the repaired JSON (csv, beats, lab,
tab.txt and MIDI by the build; the GP5 by `bin/write_gp5_fix.py`, GP time 0 still 0.3455 s) and scored against it:
all 1.0 as before (.mid onset+offset 0.985, .gp5 onset+offset 0.409). Basic Pitch and guitar-fl, per 10 s, chroma and
the hand check: in the Checks table above. Everything ran again from one script, `bin/rebuild_and_check.sh`.
