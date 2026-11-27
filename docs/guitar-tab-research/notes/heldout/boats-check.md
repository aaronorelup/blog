# Independent check of the held-out `boats` key (*Three Little Boats*, Pete Lumb, nylon, standard, no capo)

Checked 2026-11-27 by the lane H check agent of the NOTES session, which did not build the key, with its own scripts.
Nothing in `/home/user/gtv/truth/boats/` was changed. Key checked: `boats.truth.json`, SHA-256 `16516a204c9c...`.
Per-note verdicts and the `conf` I set are in `/home/user/gtv/work/heldout-newplayer/check1.json`; scripts, logs and
pictures in `/home/user/gtv/work/heldout-newplayer/check1/` (`bin/`, `logs/`, `out/`, `frames/`, `PROGRESS.md`).

**No note transcriber** (Basic Pitch, the guitar models, Transkun, YourMT3, Noise2Fret, the kit's notes tools) was
run. I used only my own 2-11 kHz attack envelope, partial levels from STFTs of the raw audio (46, 93 and 186 ms
windows), narrow-band envelopes, CQT pictures, the tab page and the video picture.

**Verdict.** The notes, strings, frets, form and tuning hold up: my own reading of the page matches the key bar by bar,
and 213 of 221 notes sound at their pitch: 210 at their onset and 3 later (Problems 2 and 3). The other 8 are not
confirmed, and I mark them `tab`. Every other onset is on the attack. **Two problems move scores**:
- 8 loud left-hand sounds are missing from the key;
- one event sits on a nail touch 52 ms before its pluck, and one rolled pinch was not split.

I would also change 8 `conf` values.

## Counts

| what | result | file |
|---|---|---|
| `gtr-eval check-truth` | 2339 checks, 0 mismatches | `logs/check_truth.json` |
| notes by my verdict | ok 201, ok-weak 9, not confirmed 8, early onset 2, roll late 1 (221) | `check1.json` |
| `conf` as I set it | `tab+audio` 212, `tab` 8, `audio` 1 (the key: 206 / 14 / 1); 8 changes, Problem 4 | `check1.json` |
| events with my >= 10 dB attack within 50 ms | 136 of 164. Key minus attack: median -0.2 ms (p10-p90 -3.0 to +1.7); 127 within 5 ms, 131 within 15 ms | `logs/onsets.log` |
| the 28 events with no such attack (10 pull-offs, 1 hammer-on, soft inner notes) | their notes' own partials rise from -27 to +8 ms around the key onset | `out/verdict.json` |
| the steepest rise of each note's own partials | median -8.7 ms over 209 notes (the 46 ms window's bias); only 3 notes rise more than 15 ms late (Problems 2, 3) | `out/verdict.json` |
| notes missing from the key | 8 sounds within 6.3 dB of the median key note, the level of the key's own added G3; 5 weaker ones | `logs/extralevel.log` |
| tuning | median -2.5 cents over 211 notes (IQR -4.7 to +1.0), none over 30 cents off; `librosa.estimate_tuning` 0.0; the key says 0.0 | `logs/tuning.log` |
| side files | `notes.csv` 221/221 equal, `beats.txt` 64 (32 beat-1 rows = downbeats), `chords.lab` 49 equal, `.mid` onsets within 1.3 ms; `tab.txt` 219 drawn (Problem 5) | `logs/sidefiles.log` |

## Problems (largest first)

### 1. Eight loud left-hand sounds are not in the key

The fretting hand lands on, or leaves, a string that is still ringing, and that string changes pitch. A chord shape
landing makes a hammer-on, and a finger leaving makes a pull-off. These eight are as loud as the key's notes, or
louder than the one such sound the key added (the G3 at 60.703 s, -6.3 dB on the same scale):

| time s | pitch | string, fret | where | level vs median key note | evidence |
|---|---|---|---|---|---|
| 46.642 | B2 | 5, 2 | pass 2 bar 2 pos 1.5, G shape | -3.8 dB | B2's 3rd and 5th partials (F#4, D#5) rise with the onset; F#4 reaches the level of G2's 2nd partial (`b_46.png`, `sl_a.png`) |
| 48.461 | B2 | 5, 2 | pass 2 bar 4 pos 0, Em shape (the written B2 follows at pos 0.5) | -0.4 dB | F#4 rises 25 dB at 48.42-48.48 s (`b_48.png`, `sl_a.png`) |
| 53.138 | C4 | 2, 1 | pass 2 bar 8 pos 0, Am shape | -1.2 dB | C5 (C4's 2nd partial) rises about 20 dB with the A2/A3 pluck (`sl_a.png`) |
| 62.595 | C4 | 2, 1 | pass 2 bar 16 pos 0, Am shape | -1.5 dB | C5 rises about 16 dB (`sl_a.png`) |
| 19.317 | C4 | 2, 1 | pass 1, 193 ms before bar 8; the Am shape lands on the ringing B string | -2.1 dB | C5 rises about 17 dB while B3 decays; there is no pluck there, only a damping attack (`sl_a.png`) |
| about 57.42 | E3 | 4, 2 | pass 2 bar 10 pos 1.5, C shape | -3.3 dB | string 4 goes from D3 to E3: the peak moves from 147 to 165 Hz (`sl_b.png`). It rises about 30 ms after the C3/E4 onset at 57.390 |
| 58.640 | E3 | 4, 2 | pass 2 bar 12 pos 1.5, C shape | -5.1 dB | string 4 goes from F3 to E3: the peak moves from 175 to 165 Hz (`sl_b.png`) |
| 59.180 | D3 | 4, 0 | pass 2 bar 13 pos 0, the finger leaves string 4 fret 2 | -6.0 dB | string 4 goes from E3 to D3: the peak moves from 165 to 147 Hz (`sl_b.png`) |

- **Weaker ones** (9-17 dB under the median key note), all in pass 1 between plucks:
  - A#2 at 3.695, 13.966 and 24.42 s: the barres of bars 2, 6 and 10 land on the ringing A string;
  - B2 at 5.189 s (G shape);
  - A2 at 36.211 s (the finger leaves string 5 fret 3).
- **Effect.** A tool that hears these is charged with 8 invented notes, 3.6 % of the key. Seven of them are in the
  full-speed pass, which is the pass a 30 s scoring segment would most likely take.
- **The record against this.** The record says `bin/extras.py` found no other pitched note, and that `bin/newscan.py`'s
  flag at 62.595 s is "sub-semitone leakage". Most of these sounds fall on key onsets, so `extras.py` never looks at
  them. At 62.595 s the spectrum after the onset has a clear new peak at 523 Hz.
- **How I found them.** `bin/missing.py` lists every pitch from 38 to 88 that rises at a key event or at an attack 60 ms
  or more from every key onset, and that no key note's partials explain. `missing2.py` and `missing3.py` drop the
  quiet ones and the artefacts of the long window: the window would hold the next key note. Then I looked at every
  survivor by eye on before/after spectra (`slices.py`). G#3 and the E2 sympathetic resonance did not survive (see
  Doubts).
- **Fix.** Either:
  - Add the eight as `conf: "audio"`, `voice: "chord"`, with the string and fret above. Time each one at its own rise:
    the first five at the times given; for the E3 at about 57.42, the steepest rise of string 4's partial. Then
    re-check.
  - Or keep the key's policy (add only a sound that replaces a written note). Then list the eight in the record and in
    a small mask file, so that scoring can ignore detections within 50 ms of them.

  Either way, name the five weaker ones in the record.

### 2. The downbeat of pass 2 bar 7 (#152 A2, #153 E4, 51.925 s) is a nail touch, 52 ms before the pluck

- **Evidence** (`frames/z_51.png`, `b_51.png`, `logs/release.log`):
  - At 51.925 s the 2-11 kHz band jumps 25 dB, but the broadband level rises only 1.8 dB.
  - Over the next 25 ms the partials of the ringing A2, E4 and B3 fall: E4's 3rd partial drops from -20 to -49 dB by
    51.945 s.
  - At 51.977 s comes a second attack, with the broadband level up 7 dB. Then E4's 3rd and 4th partials rise 30 dB,
    with the half-rise at 51.96-51.97 s, and the waveform's amplitude returns.
  - Both notes' own partials rise +44 and +50 ms after the key onset, the only ones in the key that late.
  - At 51.977 both pass my rule; at 51.925 neither does, which is why the key has them as `tab`.
- **Effect.** A tool that puts these two notes at their pluck is 52 ms off: two misses and two inventions at a 50 ms
  window.
- **Fix.**
  - Move both onsets to 51.977 s, and set both `conf` to `tab+audio`.
  - The pass-2 bar-7 downbeat and beat, the bar's `tab.txt` time and the chord boundary at 51.925 move with them.
  - `refine.py`'s choice between a touch and a release should also weigh the broadband jump, which is +1.8 dB at the
    touch and +7.0 dB at the pluck.
  - At four other events a later attack with a bigger broadband jump follows: 12.916, 44.926, 53.770 and 58.013 s.
    It comes 17-29 ms after the key onset, so the key is at most that early there. At 12.916 the picture shows the
    nail's contact before the release (Doubts); at 58.013 it shows a roll or a contact (`frames/z_12.png`,
    `z_58.png`).

### 3. A rolled pinch was not split: pass 2 bar 6 pos 0 (50.745 s), C4 (#146) sounds 36 ms after F2

- **Evidence** (`frames/z_50b.png`, `b_50.png`):
  - F2's partials start at the key onset (steepest rise -3.7 ms).
  - C4's partials rise at 50.765-50.80 s, with a second attack at 50.781 s and the broadband level up 3 dB.
  - At 50.781 s the C4 passes my rule strongly: specific rise 34 dB on the 186 ms window, 21 dB on the 46/93 ms
    windows, steepest rise -4.8 ms.
  - Of the two-note events where both notes can be timed (octave pairs cannot), this is the only one whose two notes
    rise 20 ms or more apart.
- **Effect.** It is inside 50 ms, but it leaves only 14 ms for a tool's own bias. The C4 is also heard, though the key
  has it as `tab`.
- **Fix.** Set the C4's onset to 50.781 s and its `conf` to `tab+audio`. This makes the second split roll, after pass 1
  bar 7 pos 1.5.

### 4. `conf`: 8 changes

| # | time s | note | key | mine | why (`check1.json` has each note's numbers) |
|---|---|---|---|---|---|
| 29 | 11.802 | A3 s3 f2, the hammer after the grace (pass 1) | tab | tab+audio | across the onset G3 falls and A3 rises (`sl_f.png`); the 15 ms-early attack is the hammer itself |
| 43 | 16.824 | E4 s1 f0 with A2 | tab | tab+audio | its partials 5 and up rise (specific rise 6.7 dB, step 25.6 dB, attack -1.3 ms); its lower partials are A2's 3rd, 6th, 9th and 12th |
| 146 | 50.745 | C4 s2 f1 | tab | tab+audio | heard at 50.781 (Problem 3) |
| 152, 153 | 51.925 | A2, E4 | tab | tab+audio | heard at 51.977 (Problem 2) |
| 168 | 54.561 | B3 s2 f0, the pull-off target | tab | tab+audio | across the onset C4 falls and B3 appears (`sl_f.png`) |
| 218 | 62.595 | A3 s3 f2 with A2 | tab | tab+audio | A2's even-to-odd balance is 18.6 dB, against a median 7.2 dB (max 15.2) where A2 is plucked alone (`logs/octave.log`) |
| 205 | 60.709 | D4 s2 f3 (pass 2 bar 14, the soft D4) | tab+audio | tab | D4's partials fall across the onset; the string-3 G3 dominates (`sl_e.png`) |

- **I agree with the key's other 7 `tab` notes:** #56, #129, #138 (the pass-2 grace), #139, #140, #141 and #166 show
  no rise of their own.
- **I also agree with 12 `tab+audio` notes that my automatic rule failed**, all in pass 2. I looked at each one in a
  before/after spectrum (`sl_c.png` to `sl_e.png`): #118, #120, #124, #125, #127, #131, #151, #154, #156, #163, #179
  and #208 rise at their own partials, mostly re-plucks and inner notes with small rises.

**Fix:** set these 8 values. After Problems 2 and 3 the counts become 212 / 8 / 1, plus whatever Problem 1 adds as
`audio`.

### 5. Small: `tab.txt` bar 5, and the build log's clock

- **`tab.txt` bar 5.** In both passes, bar 5 shows the grace's `0` at beat 1 on string 3 and leaves out the hammered
  A3's `2` (`logs/sidefiles.log`). Its header says it does the opposite ("only the A3 is drawn there"), and so does
  the record ("the drawing leaves them out"). **Fix:** draw the A3's `2` (or `0h2`) and correct the header, or correct
  the header and the record.
- **The build log's clock.** `heldout-boats/PROGRESS.md` logs steps at 03:25-05:15, but the key's files are dated
  03:06, the log itself 03:11, and the box's clock read 03:26 when this check began. **Fix:** correct the times, so
  a resumed session is not misled.

## How each part was checked

- **Page** (`frames/sys*.png`, my own 300 dpi render of the PDF):
  - I read all 17 bars from the notation and the TAB, and each matches the key's pass-1 notes in `tab.txt` (string,
    fret, position).
  - Seven pull-offs a pass, counting the notation-only slurs of bars 11-13.
  - Pass 2 equals pass 1, plus the added G3.
- **Attacks** (`bin/attacks.py`). The 2-11 kHz power of a 256-point (5.8 ms) STFT at a 0.73 ms hop. An attack is a
  maximum of the 4.4 ms slope, at least 4 dB, with at least 6 dB of total rise. It is a different construction from
  the builder's high-pass half-rise, and it lands on the same instants: median -0.2 ms.
- **Per-note pitch** (`bin/notecheck2.py`, `lwcheck.py`, `verdict.py`). Each test takes the note's partials that are
  resolved from the semitone neighbours and not shared with a simultaneous note. I measure the rise across the onset
  and subtract the semitone neighbours' rise at the same partials, which cancels the broadband pluck.
  - **The rule:** a 186 ms specific rise of 3 dB or more, or a 46/93 ms one of 4 dB or more, or presence over the
    neighbours of 3 dB or more together with a 6 dB step within -30..+15 ms and an attack.
  - It passes 202 of 221 key notes.
  - Where the pitch was not plucked it passes 0.110 of the time for the same pitch 0.25 s away, and 0.140 for the
    semitone neighbour at the true onset.
  - Every note the rule failed, and every `conf` disagreement, I judged by eye (`frames/sl_*.png`).
- **Timing beyond attacks.** For notes with no attack, the steepest rise of the note's own partials (`loc`). For
  touch-versus-release, the broadband jump (`bin/release.py`). Close looks at the waveform, the HF envelope and partial
  traces (`zoom.py`), and narrow-band envelopes (`bandenv.py`) at 10.56, 12.92, 25.00, 45.14, 50.75, 51.93, 52.57,
  58.01 and 62.60 s.
- **Tuning** (`bin/tuning.py`). Partials 1-4 of every note, 0.25 s from 60 ms after the onset, a 65536-point FFT with a
  parabolic peak.
- **Missing notes.** See Problem 1. For the levels (`bin/extralevel.py`): each pitch's strongest unshared partial 1-6
  in the 186 ms after the time, against the median of the same measure over the key's notes in that pass.
- **Video.** Seven frames of `boats.mp4` (`frames/mp4_sheet.jpg`): no tab, title or caption shows (two black boxes
  where captions were); a music stand is seen from behind. At 46.65 and 48.47 s the close-up camera sees the fretting
  hand in first position from behind the neck (`hand_zoom_46_48.jpg`), so which strings are stopped cannot be seen.

## Doubts (none changes a pitch in the key)

- **The onset convention.** On nail plucks, the HF half-rise is the nail's first contact, up to about 12 ms before
  the release in the waveform. At 12.916 s the HF rises at 12.915 and the waveform swings out at 12.928
  (`frames/z_12.png`). This is the record's stated convention, but a tool keyed to the release will sit about 10 ms
  late here, on top of the 10-25 ms gap the record describes.
- **#156 G2/D4 at 52.570 s.** The attack is at 52.558 s (-12 ms), and the D4 is rising by 52.55. This is inside
  tolerance.
- **The octave pairs (A2 with A3, 8 events).** All of A3's lower partials are A2's. Only its 7th and higher partials,
  and the even/odd balance, speak for it. The weakest is #6 (2.556 s), with a balance of 7.2 dB; the CQT shows A3
  brightening there, so I keep it heard.
- **The rule alone is about 1-in-10 lucky.** 190 notes rest on the rule without a look. At the null rates above, a few
  of them may be confirmed by chance. None is contradicted by any picture I made, and the CQT panels of pass 1 bars
  0-7 (`p1_a.png`) and pass 2 bars 2-5 (`d_46.png`) show each note on its band.
- **Two left out, not as notes:**
  - A G#3 (208 Hz) stands 7-9 dB over its neighbours with the A2 at 16.824 and 45.525 s. No fingering of the piece
    explains it, so it is probably body or sympathetic sound.
  - The open E2 resonates with no pluck at 0.83, 22.10, 22.59 and 57.39 s.
- **Not re-checked:** the cut, the time base and the rights note (`newplayer.md`); voices, chords, key and offsets
  (the let-ring rule).
