# Ground truth: held-out slot `boats` (*Three Little Boats*, Pete Lumb, standard tuning, no capo)

Built 2026-11-27 by the lane H key agent of the NOTES session. The fetch, the cut, the time base, the tuning and capo
checks and the rights note are in `newplayer.md` (next to this file); this record covers the key. Every number below
comes from a file named next to it. Heavy files are under `/home/user/gtv/` (not in the repo); work scripts, logs and
pictures in `/home/user/gtv/work/heldout-boats/` (`bin/`, `logs/`, `out/`, `frames/`, `PROGRESS.md`).

**No note transcriber** (Basic Pitch, the guitar models, Transkun, YourMT3, Noise2Fret, the kit's notes tools) was run
on this recording to build, time or check this key. Everything comes from the tab page, onset envelopes of the raw
audio, a high-pass attack envelope, CQT and STFT energy at the notes' partials, chroma, FluidSynth renderings of the
key itself and the video picture.

**Read this first: the onset convention.** This key puts every onset **on the physical attack**: the half-rise point
of the note's attack on a 2.9 ms envelope of the band above 1.5 kHz. That is earlier than the AO-082 keys' convention
(a peak of librosa's onset envelope): on this recording the AO-082 checker's onset detector (mel, hop 256) sits a
median **+14.1 ms** after this key's onsets (p10-p90 +8.1 to +18.9 ms), and the 1 kHz+ flux peak that the september
key uses sits +25.5 ms after them (IQR 22-29 ms). See Method, step 3. A tool scored on several keys will see this as a
10-25 ms shift between them. It stays inside the 50 ms window, but it is not nothing.

## Source and credit

- *Three Little Boats*, traditional Manx tune, arranged for guitar by James Franklin, played and presented by Pete
  Lumb on a nylon-string classical guitar, in "Manx Guitar Lesson: Three Little Boats" (Culture Vannin, 2019). Video
  from Wikimedia Commons (Commons' VP9 1080p transcode); tab = the lesson's own sheet, a free PDF linked from the
  Commons page and from Culture Vannin's "Manx guitar lessons" page. Details: `newplayer.md`.
- Licence: video CC BY (3.0 on the Commons page; its licence review notes 4.0), attribution Culture Vannin; the tune is
  traditional; the arrangement is James Franklin's ("Culture Vannin & individual composers (c) 2019" on the sheet).
- Credit line: "Three Little Boats (Manx traditional), arranged by James Franklin, played by Pete Lumb. From 'Manx
  Guitar Lesson: Three Little Boats' (2019) by Culture Vannin, via Wikimedia Commons, CC BY 3.0."
- Not unseen: 18 s of the slow pass (`boats` 8.0-26.0 s) were AO-082's research clip R3c. No key was ever made for it
  (`newplayer.md`).

## Files

| file | what |
|---|---|
| `/home/user/gtv/songs/boats/boats.wav`, `.mono.wav`, `.mp4`, `.full.mp4` | the cut (prep step, `newplayer.md`): 67.094 s, both play-throughs |
| `/home/user/gtv/truth/boats/boats.truth.json` | the key, in the schema of `capo.truth.json`; `boats.wav` is linked next to it. SHA-256 `16516a204c9c...` |
| `boats.notes.csv`, `.beats.txt`, `.chords.lab`, `.mid`, `.tab.txt` | side files, written by the same build |
| `boats.tab-merged.json` | the merged reading: reader A's file plus a `merge` block (comparison and settled doubts) |
| `read-A.json`, `read-B.json` | the two independent readings (copied from the prep work folder) |

The scripts are in `/home/user/gtv/work/heldout-boats/bin/`. `common.py`, `feats.py`, `feats2.py` and `newscan.py`
are copied from the september lane. `align.py`, `refine.py`, `build.py` and `check_render.py` are adapted from that
lane's `align4.py`, `refine.py`, `build.py` and `check_render.py`. `pitch_check.py` is copied from the closer lane.
The originals were not edited.

## Tuning and capo

**Standard tuning, no capo** (`tuning_midi` 40 45 50 55 59 64, `capo` 0, `tuning_offset_cents` 0). This was
confirmed four ways in the prep step (`newplayer.md`): the notation fixes every open string; chroma is best at shift 0
(0.925 / 0.899 against <= 0.586 for capo 1 or 2); the open A2 sounds A2; and a frame shows the nut with no capo.
`librosa.estimate_tuning` gives +0.0 cents. Both readers say the same. The FluidSynth rendering of the key against the
recording (Checks) agrees.

## Method

1. **Reading** (`bin/compare_readers.py`, `out/compare.json`). The two readers worked independently from the PDF at
   600 dpi (`read-A.md`, `read-B.md` in the prep work folder).
   - **109 of 109 notes agree** on bar, position, string and fret. So do the grace note, the 80 event positions, every
     note's written duration and stem, the 8 ties and the 26 chord names. **0 differed.**
   - The only differences are conventions. A keeps the grace note as its own event, B keeps it in `grace_notes`. A
     puts `p` on the origin event, B puts `p(sN)` there and `sounded_by` on the target. That is why the counts read
     81 events / 110 notes against 80 / 109 + 1.
   - Doubts, settled from the page (the `merge` block):
     - The slurs of bars 11-13 are drawn over the notation only. They are read as pull-offs, as both readers did; the
       recording agrees (Departures).
     - The grace note's timing is not fixed by the page, so it was timed from the recording.
     - Bar 6's dotted quarter is kept as printed.
     - The Roman "I" under the TAB in bars 2 and 6 is the barre number, not a note.
2. **Form as played** (`bin/events.py`). The page, pickup (bar 0) plus bars 1-16, is played twice: the "Slow
   play-through" (pass 1, from 0.465 s) and the "Full-speed performance" (pass 2, from 44.697 s). There are no added
   or missing bars, no repeats and no changed ending. The event alignment fits every bar in order, and the CQT
   pictures (`frames/a2_*.png`) show each bar's notes. That makes 162 events and 220 tab notes, with ties not counted
   as notes.
3. **Timing.**
   - **Event DP** (`bin/align.py`). Pass by pass, the tab events are placed on 1 kHz+ spectral-flux peaks.
     - Each match is scored by peak strength plus pitch evidence: the CQT rise of the note, less a plucked lower
       string's share, plus the 23 ms STFT jump of its fundamental.
     - The tempo model is the **tab's written rhythm** in eighths, with a Huber penalty. A first run uses the passes'
       mean eighths (0.420 / 0.195 s); a second run uses the local tempo of the first (`out/align2.json`, identical).
     - The grace note is left out of the DP. 159 of 160 events were matched. The DP skipped pass 2, bar 14, pos 1.0
       (a soft D4), so its time is interpolated from the written position, then refined like the others.
   - **Why not the flux peak.** On clear single-note attacks (`bin/calib.py`) the 1 kHz+ flux peak sits a median
     21.8 ms (pass 1) / 26.7 ms (pass 2) after the attack's half-rise. Over all events the figure is 25.5 ms (IQR 22-29).
     The cause is librosa's envelope padding and its long windows: a synthetic pluck gives +15 ms for this envelope and
     +9 ms for the checker's.
     - Nail **pre-clicks** add a second error. The nail touches the string about 40 ms before it releases it, and the
       touch makes its own flux peak. At 31.744 s a pre-click took the DP's peak, 41 ms before the real attack at
       31.785 s (`frames/be_31.png`).
     - So snapping to a flux peak would have put the key 15-40 ms early or late. **The key uses the physical attack.**
   - **Attacks** (`bin/attack_env.py`, `bin/attacks.py`). The band above 1.5 kHz is high-passed at zero phase; its RMS
     is taken in 2.9 ms frames with a 1 ms hop. An attack is a local maximum of the 4 ms rise, with at least 8 dB of
     total rise. Its time is the half-rise point. Its strength is the ratio of broadband peak amplitude after to before.
   - **Per note** (`bin/refine.py`):
     - **Plucked events**: the clear attack (amplitude ratio >= 1.5, rise >= 8 dB) in [flux - 75 ms, flux + 90 ms]
       with the best score, log(amplitude ratio) + 0.05 x the event's pitch jumps. A pre-click or a damping touch has a
       small ratio and no pitch jump.
     - **Rolled pinches**: a two-note event is split when each note's own fundamental jump points to a different clear
       attack. This happened once: pass 1 bar 7 pos 1.5, G2 at 18.109 s and D4 at 18.178 s (`frames/w_18.png`,
       `frames/s_18.png`).
     - **No clear attack**: the peak of the note's own 46 ms fundamental jump (at clear attacks it is within about
       5 ms of the half-rise: median -4.0 / -1.7 ms, `bin/calib.py`), if it reaches 6 dB. Otherwise the flux peak
       - 25.5 ms.
     - **Pull-off targets**: a clear attack near the flux peak - 25.5 ms; else the steepest rise of (target - origin)
       salience in a 46 ms STFT (`common.legato_time`, median -2.9 / +1.4 ms from clear attacks); else the flux peak
       - 25.5 ms.
     - **The grace G3**: with the bass when G3's fundamental jumps there. In both passes it is played **on the beat
       with the bass** (11.641 s and 49.596 s). Its hammered A3 comes at the salience rise after it (11.802 s and
       49.679 s; `frames/z_11.png`, `frames/s_49.png`).
   - Onsets by method: attack 172, the note's own 46 ms jump 25, pull-off salience 9, pull-off flux - 25.5 ms 5,
     flux - 25.5 ms 4, grace with the bass 2, pull-off on an attack 2, rolled 1, the added G3 1.
4. **Truth fields** (`bin/build.py`).
   - Pitch = tuning + capo + fret.
   - **Offsets**: let ring to the next onset on the same string - 10 ms, at most where the note's CQT band has fallen
     25 dB, at most 6 s. **Estimates, not measured**: a nylon guitar rings past the written lengths.
   - **Voices from the tab's stems** (both readers agree on every stem): stem up = melody; stem down = bass when it is
     the lowest note of its event on strings 4-6, else chord. The grace note is melody; the added G3 is chord.
   - **Beats**: 6/8 felt in two, so two dotted-quarter beats per bar (pos 0 and 1.5) in bars 1-16 of each pass. Every
     beat has a plucked event, and the beat sits on its earliest onset. The pickups carry no beat. Downbeats are beat 1
     of the 32 bars. `tempo_bpm` 69.42 dotted quarters per minute over both passes (pass 1 47.06, pass 2 100.94).
   - **Chords**: from the tab's own chord names (Am F G Em C Dm), each running from the beat it stands on to the next
     name. Before the first note, between the passes and after the last ring-out they are `N`. Chord work is left out
     of the research (DIRECTION.md); this only fills the field.
   - **Key**: Krumhansl-Kessler on note durations gives A minor (second A major); the sheet's harmony is A minor.
   - **Taps**: none. The tab marks no slaps or thumps. The one strong unpitched noise, at 26.79 s (flux 1.27; no pitch
     rises above -54 dB), is not a written tap.
   - **`conf`**: `tab+audio` when, at the onset, the CQT rise of the note (fundamental or harmonics 2-4, less 0.7 x a
     lower note's share) is >= 3 dB and its 23 ms or 46 ms fundamental jump is >= 2 dB. This is the september lane's
     rule. Pull-off targets also pass with a salience jump >= 10 dB. E2, F2 and G2 also pass when an unshared partial
     3-6 rises >= 10 dB, because this recording carries little below about 95 Hz; the two E2 re-plucks of bar 4 pos 1.5
     pass this way, on their 5th partial, +32.4 and +20.4 dB. Calibration (`bin/calib_conf.py`): the rule passes at
     0.927 of the onsets and at 0.109 at the same pitch 0.2 s away.

## Covered range and counts

- **The whole cut**: `scored_range` [0, 67.094] s. Pass 1 has notes from 0.465 to 40.165 s, then the last chord rings
  out. Pass 2 has notes from 44.697 to 63.226 s, then rings out. Between them there is 41.5-44.7 s of ring-out and small
  noises, and no notes.
- **221 notes**:

| | notes | `tab+audio` | `tab` | `audio` |
|---|---|---|---|---|
| pass 1 | 110 | 107 | 3 | 0 |
| pass 2 | 111 | 99 | 11 | 1 |
| total | 221 | 206 | 14 | 1 |

- By voice: melody 136, bass 78, chord 7.
- Legato: 14 pull-off targets (`"legato": "p"`) and 2 hammer-ons (`"h"`, the grace's targets); 2 grace notes
  (`"grace": true`).
- 64 beats, 32 downbeats, 6/8, tempo 69.42, key A minor, 49 chord segments, 0 taps.
- `gtr-eval check-truth` (0.12.1): **2339 checks, 0 mismatches** (`logs/checktruth.json`).
- Side files scored against the JSON (`out/eval/side_*.json`):
  - `notes.csv`: onset and onset+offset F1 1.0.
  - `.mid`: onset F1 1.0, onset+offset 1.0.
  - `beats.txt`: beats F 1.0, downbeats F 1.0 (`--downbeat-col 2`).
  - `chords.lab`: root, majmin and sevenths 1.0.
  - `.tab.txt` (`tab`, order only): 219 of 221 matched, all on the same string and fret. The 2 grace G3s share
    beat 1 with their hammered A3 on string 3, so the drawing leaves them out (its header says so).

## Departures from the tab

- **Form**: none. The page is played twice, whole, as written.
- **Notes**:
  - **One added, `conf: "audio"`.** In pass 2, bar 14, pos 1.0 (60.703 s), the written D4 (s2 f3) is played softly:
    its fundamental rises to only -50 dB, against -25 to -27 dB at the same spot in the other five passes of this
    figure (bars 6, 10, 14). An **open G3** sounds there instead, louder than the D4. It comes when the finger leaves
    string 3 fret 2, the A3 of pos 0.5: the A3's partials fall 23-27 dB, and G3 rises with its 2nd partial at -41 dB
    (`bin/partials.py`, `bin/levels.py`, `frames/r3_60.png`). It is added as **G3, string 3, fret 0**: the string is
    the one the finger left, the fret is 0 because the string is open. The D4 stays in the key: it is in the tab and
    it does sound, rising +13.6 dB, so its `conf` is `tab+audio` by the rule.
  - **Heard, not added**:
    - The same lifted-finger G3 sounds at bars 6, 10 and 14 pos 1.0 in every other pass. There it lies 8-25 dB under
      the D4 being played: pass 1 23-25 dB, pass 2 bar 6 15 dB, bar 10 8 dB.
    - A weaker one sounds at 2.93 s (bar 1, -54 dB).
    - AO-082 left the same kind of open-string sound out of the capo key, and this key does too, except where that
      sound replaces the written note.
  - **Checked, no departure**:
    - The prep step's suspected B2 in bar 2 is B3's octave and G2's partials. A B2 fundamental stays at -55 dB with no
      rise (`bin/partials.py` at 5.362 s, `frames/s_4.png`).
    - **Ties are held**: at every tied continuation the tied E3 and B2 show no rise (-7.5 to -0.9 dB at their
      fundamentals).
    - The slurs of bars 11-13, which are drawn only in the notation, **are pull-offs** as played. Their targets show a
      high-band jump of -1.7 to +6.5 dB, like the drawn pull-offs of bars 7, 9 and 15 (+1.0 to +7.4 dB), against a
      median of 17.6 dB for plucked notes.
  - `bin/newscan.py` looked at every key onset for new partials that the key does not explain. It flagged 4 onsets:
    - the G3 above;
    - 46.452 s and 62.595 s: sub-semitone leakage of the notes sounding there, under 100 ms windows;
    - 51.925 s: A2's 2nd partial, with a short burst at 200-240 Hz.
  - `bin/extras.py` looked at every attack and flux peak that no key onset explains (`logs/` in the work folder). It
    found pre-clicks, damping touches, the left-hand G3 sounds above and the unpitched noise at 26.79 s, and no other
    pitched note.

## Checks

| check | result | file |
|---|---|---|
| key rendered (FluidSynth, FluidR3_GM, program 24 nylon) vs recording, chroma cosine | **0.839** (pass 1 0.840, pass 2 0.837; per 10 s 0.797-0.878); the same rendering shifted by one bar 0.488 (0.446 / 0.578); program 25 steel 0.842 | `out/check_render_p24.json`, `_p25.json` |
| the AO-082 checker's onset detector (librosa mel, hop 256, `delta` 0.05) on the recording | key events with a detection within 50 ms **0.988** (161 of 163); missed: pass 2's hammered A3 (49.679 s) and the added G3 (60.703 s), both left-hand sounds; detection minus key median **+14.1 ms** (p10-p90 +8.1 to +18.9), the convention offset above; detections near a key event 0.70 (the rest: pre-clicks, damping touches, noises) | same |
| the same detector on the rendering vs on the recording | F 0.78, P **0.975**, R 0.65 (the recording's extra detections); render - recording median +11.6 ms | same |
| per-note pitch (8192-point FFT from onset + 30 ms, harmonics 1-8, own pitch vs free semitone neighbours) | 0.878 at >= 3 dB, median +9.0 dB; strings 1-3 0.95-0.96; string 5 0.58 (A2 and C3: weak fundamentals, shared partials); 8 below 0 dB: 7 basses on string 5 (5 C3, 2 A2) and the pass-2 grace G3, none a pitch error by the CQT pictures | `out/pitch_check.json` |
| the conf rule as a test (`bin/calib_conf.py`) | 0.927 of onsets pass; the same pitch 0.2 s away 0.109 | `logs/calib_conf.log` |
| alignment stability (tempo penalty 4 -> 8 / 2) | 8: 0 notes move > 20 ms; 2: 3 notes move. Pass 2 bar 7 pos 1.5 goes 70 ms earlier, where D4 does not sound yet; the D4 rises at 52.54-52.56 s, 10-15 ms before the key's 52.570. The skipped D4 of pass 2 bar 14 goes onto the next event's attack. The base run is kept. | `logs/align_L*.log`, `out/refined4_L*.json` |
| by hand: 9 places at full resolution (waveform, high-band envelope, STFT 2048-8192 points, pitch levels) | 31.77 s pre-click / attack; 18.11 / 18.18 s roll; 22.51 s pull-off (the first build's salience rule had put it 200 ms late, so the rule was changed to search near the flux peak); 11.64 / 11.80 s and 49.60 / 49.68 s grace and hammer; 52.56 s; 55.38 s; 60.70 s G3; 4.87-5.36 s bar 2 | `frames/` (`be_31`, `w_18`, `s_18`, `s_22`, `tr_22`, `z_11`, `s_49`, `w_49`, `r3_51`, `r3_60`, `s_4`) |
| frames at 6 onsets (3.99, 15.10, 18.13, 26.98, 34.82, 60.72 s) | the fretting hand is in first position by the nut in 6 of 6; the string under each finger cannot be resolved at this scale | `frames/hand_sheet.jpg` |
| CQT pictures of the whole cut with the key drawn on | every bar's notes on their pitch bands, onsets at the start of each band | `frames/a2_*.png`, `frames/final_53.png` |

## What remains uncertain

- **The onset convention** is the physical attack, 10-25 ms earlier than the AO-082 keys and the september key (see
  the top of this record). The convention was chosen because it is what a note's start is, and because it leans to no
  tool. A comparison across keys should know this.
- **Notes without a clear attack**: 29 plucked onsets came from the note's own 46 ms fundamental jump (25) or from
  the flux peak - 25.5 ms (4). They are mostly inner-voice notes at pos 0.5 and notes in the full-speed pass, where the sound never
  stops. These are good to about +-10-15 ms, against about +-5 ms for clear attacks. The 9 pull-offs timed by salience
  and the 5 by flux - 25.5 ms are the same.
- **14 `tab` notes** are not confirmed at their onsets. In pass 1 they are bar 5's hammered A3, bar 7's E4 and bar 9's
  A2; in pass 2, bar 3's A2, bar 5's grace G3, hammered A3, E3 and A3, bar 6's C4, bar 7's E4 and A2, bar 9's A2 and
  pull-off B3, and bar 16's A3. Most are re-plucks of a string still ringing (E4 and A2) or soft notes of the
  full-speed pass. None is contradicted.
- **Rolled pinches**: only one was split. Other two-note events share one onset. Where bass and melody sit 20-50 ms
  apart, the 23 ms fundamental jump of a low note cannot say so reliably, so a few melody notes may start 10-40 ms
  after the shared onset.
- **The pass-2 bar-14 G3** is a left-hand sound, so its string (3, open) is the one the finger left, not one seen. Its
  onset is ±15 ms (G3 and the D4 change within 60.68-60.71 s).
- **Offsets** are a let-ring rule, not measured. **Voices** come from the stems; **chords** come from the tab's names
  and the **key** from Krumhansl-Kessler; beats follow the written rhythm.
- **Training sets** (GuitarSet, GAPS, the Leduc set, GOAT) were not checked against track lists here. A 2019 Manx
  lesson video is unlikely to be in any of them (`newplayer.md`), but that is not proven.
- **No independent check yet.** As with AO-082's keys, an agent that did not build this key should check it, audit it
  and repair it if needed.
