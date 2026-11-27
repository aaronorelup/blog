# Independent check of the held-out key `september`

Checked 2026-11-27 by an agent of lane H (NOTES session) that did not build the key, with its own scripts.
Nothing in `/home/user/gtv/truth/september/` was changed. Key checked: `september.truth.json`, SHA-256
`892d95c0cdb0...f305a2ca8` (417 notes). Per-note verdicts: `/home/user/gtv/work/heldout-september/check1.json`
(index, `conf_check`, verdict, evidence). Scripts, logs, pictures: `/home/user/gtv/work/heldout-september/check1/`
(`bin/`, `logs/`, `out/`, `frames/`, `PROGRESS.md`). The 40 notes that change are listed in
`check1/out/september-check-fixes.csv`: index, onset, `conf` in the key and here, the onset fix, and the evidence.
Per-note files stay out of git, as `notes/.gitignore` asks.

**No note transcriber was run.** Every test used the raw audio only: SuperFlux and complex-domain onset detection,
STFT and CQT energy at each note's partials, new spectral peaks before and after an onset, a 2-8 kHz envelope, and
pictures I looked at. The builder's records and scripts were read; none of its outputs were reused as evidence.

**Verdict: not passed yet. Five notes sit 40-150 ms before the pluck. Repair them and re-check.** The notes'
pitches, the form, the tuning and capo, the side files and the schema hold up. The `conf` field needs 35 changes.

## Counts

| | key | this check |
|---|---|---|
| notes | 417 | 417 (no note of the key is a wrong pitch; none missing as far as found) |
| `conf` tab+audio / tab / audio | 351 / 64 / 2 | **376 / 39 / 2** (agree on 382; 30 `tab` heard, 5 `tab+audio` not confirmed) |
| onsets on the attack | | 409 yes, **5 wrong** (played 40-150 ms after the key onset), 3 doubts |
| `gtr-eval check-truth` 0.12.1 | 4325 checks, 0 mismatches | the same (`check1/logs/check_truth.json`) |
| side files | | all agree with the JSON (`check1/out/schema.json`) |
| tuning | +5 c | +5.0 c (librosa); partials +3.2 c median (IQR -1.3 to +6.3), per string -5 to +6 c |

## Problems, largest first

### 1. Five notes are placed 40-150 ms before they are played (the AO-082 "early" fault)

| # | key onset | note | played at | late by | what the key sits on |
|---|---|---|---|---|---|
| 31 | 13.084 | F#3 s4 f2 (bass, downbeat of measure 5) | 13.205-13.228 | ~140 ms | the loudest click of the passage (13.07): new energy only above 1.5 kHz, no F#3 |
| 150 | 60.703 | A3 s3 f0 (`tab`) | 60.854 | ~150 ms | a strong click (60.69) whose new partials are not A3 |
| 21 | 10.078 | G#3 s4 f4 (bass, downbeat of measure 4) | 10.168-10.182 | ~100 ms | a click (10.072) |
| 255 | 95.864 | G#3 s4 f4 (bass, downbeat of measure 31) | 95.945-95.957 | ~90 ms | a click (95.855), the same figure as #21 |
| 136 | 56.366 | G#2 s6 f4 (`tab`) | 56.405-56.43 | 40-60 ms | a click (56.355); the thumb damps the ringing string at 56.39 and plucks at 56.405 |

- **Evidence.** The note's own partials, chosen so that no other nearby note shares them, rise 8-34 dB at the
  later time and not at the key onset. The 2-8 kHz envelope and SuperFlux show a second attack there. The new
  spectral peak at the later time is the note's own pitch: F#3 +2 c rises +41.8 dB at 13.205, G#3 -8 c +18.5 dB at
  10.17, A3 +1 c +18 dB at 60.854.
  - Pictures: `check1/frames/z_g3.png` (#21, #255), `c_m8.png` panel 4 (#31), `c_a.png` panel 2 (#136),
    `c_b.png` panel 4 and `z_first.png` (#150), `c_310.png` (#21, #255 with unique partials).
  - In the rhythm: #150 at 60.854 falls one eighth after the C#4 at 60.482, as the tab's spacing wants. 60.703 does
    not.
- **Why the builder's checks missed them.** The key onset is on a click, and a click is an onset. Any check of the
  form "is there a detection within 30 ms" therefore passes. That includes the builder's early-placement check
  ("1 event looks early") and the 0.975 detector recall.
  - The recording has many such clicks: 75 of my 122 SuperFlux detections with no key note lie 50-150 ms before a
    pluck.
  - Only a test on the note's own pitch sees the problem: `check1/bin/ponset.py`, the steepest rise of the note's
    unique partials. It places 0.937 of the 287 notes with a clear rise within 30 ms of the key, with a median of
    -14.6 ms in its frame-centre convention.
- **Effect.**
  - Any tool that finds these notes is scored as missing them and as inventing a note.
  - Three of them are downbeats: 10.0775, 13.0844 and 95.8636 are in `downbeats` and `beats`. 56.3664 is also a
    beat. So those beats are early by the same amount.
  - #31's offset is 13.1044, 20 ms after its onset, because the decay rule measured the click.
- **Fix.**
  - Move the five onsets to the attack in the key's own convention, which puts the onset about 9 ms after the
    SuperFlux peak and 15-20 ms after the pitch's half-rise: #31 → 13.225, #150 → 60.862, #21 → 10.185,
    #255 → 95.962, #136 → 56.42.
  - Recompute their offsets. Re-interpolate the beats and downbeats there, and the chord boundaries that sit on
    them. Add the moves to the record's Departures.
  - Then look for the same figure the way this check did. Take a pitch-specific onset per note (unique-partial
    rise, `ponset.py`) and flag any note whose own pitch starts more than 35 ms after the key onset. A detector
    match alone does not count.
  - #150 stays `tab` even after the move: its re-pluck is weak (+8 dB at its unique partials).

### 2. `conf`: 30 notes marked `tab` are heard, and 5 marked `tab+audio` are not confirmed

- **What I used.** Two rules, calibrated on 3336 null samples. A null sample is the note's pitch tested at 8 other
  key events that hold no note of that pitch and no note that shares its harmonics.
  - **Peaks rule:** the note's harmonics appear as new spectral peaks (186 ms windows, +-30 c). Key notes pass
    0.909, null samples 0.070.
  - **Rise rule:** the per-harmonic rise is at least 5 dB, and the new energy is larger than a semitone or a tone
    away. Key notes 0.847, null 0.050.
  - **Both together:** key 0.813, null **0.029**.
  - The rules are in `check1.json` → `method`.
- **What I looked at.** Every note that does not pass both rules (78), every `tab` note that does (28), the two
  `audio` notes and the timing suspects. I looked at CQT crops and per-harmonic level traces
  (`check1/frames/n_*.png`, `u_*.png`, `aud.png`). A note counts as heard when one of its partials rises by about
  10 dB or more at the onset.
- **Up to `tab+audio` (30).** #1, 5, 21, 32, 38, 49, 57, 84, 90, 94, 106, 112, 120, 136, 144, 147, 154, 156, 247,
  255, 258, 274, 283, 298, 315, 326, 359, 402, 409, 415.
  - Most are open-string re-plucks (A3 s3, E3 s4) or bass notes with a clear fundamental rise of 9-40 dB.
  - A re-plucked ringing open string shows its fundamental dip as the finger lands, then its upper partials rise
    10-25 dB. The builder's rule required a sharp fundamental jump, so it could not see this.
- **Down to `tab` (5).**
  - #253 (95.190 A3 s4 f5): a broadband bump only.
  - #310 (117.139 E3): no E3 partial rises there or at the strong attack at 117.175. The new energy at 117.175 is
    at about 226 and 452 Hz, the body, not E3.
  - #327 (121.696 A3): borderline, about +8 dB at h4.
  - #355 (130.368 C#4): its fundamental is the h3 of the ringing F#2 and falls at the onset.
  - #357 (131.106 A3): no attack within -406 to +334 ms, and its partials decay through the onset.
- **Fix.** Take `conf_check` from `check1.json`, or the `conf_check` column of `check1/out/september-check-fixes.csv`. Then
  recount the record's `conf` and its "64 tab notes" paragraph. The two `audio` G#4s (84.695 and 144.312 s, with
  the B4) are confirmed: G#4 rises +15 dB at h1 and +20-28 dB at h2 (`frames/aud.png`).

### 3. Two onsets 26-30 ms before the attack (doubts, within 50 ms)

- **#269 (100.426 A3).** The A3 half-rise is at about 100.452 and the SuperFlux peak at 100.467. The builder's
  attack check moved this note from 100.478 to 100.426. Measured against the key's own convention, it now sits
  about 45 ms early.
  - Fix: restore it to about 100.47.
- **#272 (101.163 F#3).** The attack is at about 101.19-101.20, the SuperFlux peak at 101.201. It sits about 45 ms
  early in the key's convention.
  - Fix: move it to about 101.20 (`frames/z_t2.png`).
- **#292 (108.170 F4, rolled chord of measure 35).** The F4 rises a little at about 108.14 and more at about 108.27,
  together with the E4. Leave it unless a closer look settles it (`frames/c_m8.png` panel 3). The same chord in
  measures 8 and 16 is timed right, string by string.

### 4. A muted strum at 120.227 s is in no field of the key

- **What.** One of the strongest attacks of the piece: SuperFlux 1.36, 192 ms after the last key note and 197 ms
  before the next.
  - It brings open-string partials that rise 15-28 dB and die within about 60 ms: E3 -26 c, E4 +10 c, A3, and
    G#4 +8 c (the h5 of E2).
  - A weaker one comes at 132.804 s (SuperFlux 0.61; E3, G#4, E4 +17-19 dB).
  - Pictures: `frames/c_b.png` panels 1-2. The builder's record calls it "a soft burst", "none a note".
- **Effect.** A note tool may report short E3, A3 or E4 notes there and be charged with inventing them. The key has
  no taps.
- **Fix.** Either add `taps: [{time: 120.227, kind: "string-slap"}]`, and 132.804 if wanted, or name it in the
  record as a known non-note event that the film can exclude.

### 5. Small

- **`september.tab.txt` header.** It says "one column = one sixth of a beat". A 4/4 measure is 48 columns and
  eighths sit every 6 columns, so one column is a sixth of an *eighth*, a twelfth of a beat.
- **The record's Checks table** reports "Early-placement check: 1 early / 4 late". That check cannot see problem 1
  (see why above). Name problem 1 and its fix in the record instead.

## What holds up

- **Schema and side files** (`check1/bin/check_schema.py` → `out/schema.json`):
  - Every key is present. `september.wav` has 6,770,651 frames: 153.529501 s, equal to `duration_s`.
  - No duplicates, no same-pitch pair within 30 ms, no overlap on one string. pitch = tuning + capo + fret for
    417/417.
  - Beats rise strictly, with a downbeat every 4 beats. The chords cover 0-153.5295 s with no gap.
  - `notes.csv`, `beats.txt` and `chords.lab` are identical to the JSON.
  - `tab.txt` bar times equal the downbeats within 0.5 ms, with the same (bar, string, fret) multiset: 0 differences.
  - `.mid`: onsets within 1.8 ms. The offsets differ by up to 2.36 s where same-pitch notes overlap on two strings.
  - Three notes are 20-25 ms long. #26 and #108 are C#4s hammered to E4 29-35 ms later, which is right. #31 is
    problem 1.
- **The tab and the form.**
  - I read both pages myself and compared every line with `tab.txt` (`frames/page1_s.png`, `page2_s.png`): the
    same notes and strings in every line.
  - The arrow from the first bar line of page 1, line 5, goes to TO CHORUS on the second pass.
  - The form as played is the post's. A wrong form would show as wrong pitches, and no note fails the pitch tests
    once its timing is right.
  - The slanted line on page 2, line 4 is played as a slide in both choruses: a glide through G4 and D#3/D#4 at
    80.28 and 139.89 s, with no new pluck at the 7s.
- **Pitches.** Every note judged heard sounds at its written pitch.
  - The new-peak test matches its harmonics within +-30 c. Semitone neighbours do not win, by the linear
    specificity test and by eye.
  - The open strings sound A2, E3, A3, C#4 and E4, so open G with capo 2 is confirmed by the sound. I did not look
    at the video frames.
- **Cents** (`check1/logs/cents.txt`).
  - 578 partials h1-h3 that rise at least 15 dB: median **+3.2 c** against equal temperament, IQR -1.3 to +6.3.
  - By string: s1 +1.2, s2 +5.8, s3 +3.4, s4 -4.7, s5 -2.1, s6 +5.5. `librosa.estimate_tuning` gives +5.0.
  - The key's +5 holds for every string within 10 c.
- **Timing elsewhere.**
  - SuperFlux finds a detection within 50 ms for 0.978 of the 402 key events, a median 8.7 ms earlier (p10-p90
    -14.5 to -2.9 ms).
  - The chord rolls are right string by string: measures 8, 16 and 35, the chorus C#3 chords at 61.2 and 73.8 s,
    and the F#2 chord at 117.49 s (`frames/c_a.png`, `c_m8.png`, `c_310.png`). The one exception is #292 (problem
    3).
  - The first note is right: a soft touch at 0.24, the half-rise at 0.287, the key at 0.308.
  - Hammer, pull and slide targets: the change from origin to target pitch (`bin/legato.py`) crosses within -35 to
    +33 ms of the key for 21 of 26. The others are weak signals: #271, #281, #398. #217 and #388 are slides, where
    the key marks the arrival and the crossing is mid-glide.
- **Notes heard but missing.** Of the 122 SuperFlux onsets with no key note within 50 ms:
  - 75 lie 50-150 ms before a pluck: finger or fret-hand clicks, whose new energy is at body-resonance frequencies
    or above 1.5 kHz.
  - 13 lie just after a key onset.
  - 34 are isolated. A harmonic test flags some of them (h1 plus one more of h1-h4 among the new peaks;
    `logs/isolated_pitch.txt`):
    - 120.227 and 132.804 (E3, E4, G#4): problem 4.
    - 60.854: #150's real time.
    - Weak high or odd pitches at 0.029, 14.573, 24.155, 25.443, 54.57, 73.285, 85.957, 98.786 and 111.087. In the
      pictures these start no sustained line: they are clicks (`frames/iso4.png`).
  - Other candidates I looked at and found no note at: 8.176, 88.143, 93.112, 115.865 and 143.871
    (`frames/c_c.png`, `c_b.png`).
  - I found no missing note.

## Doubts

- **39 notes stay `tab`.** Most are re-plucks of a ringing pitch with only a broadband bump. Some may be played
  softly.
  - #13 (7.518 A3 s3) has no attack within -284 to +357 ms: probably not played, or not heard.
  - #357 (131.106) is the same.
  - "As played" would allow dropping these two notes. Keeping them as `tab` is the safer choice.
- **Fret-hand sounds before #21 and #255.** The click 90-100 ms before each pluck carries a small bump at G#3 and A3
  (+10 dB, A3+11 c at 10.06). A tool that reports a note there is charged with an extra note.
- **Pull-off targets #28, #47 and #281** show no clear C#4 return. They are `tab` in both the key and this check.
- **Not re-checked:** the video frames (capo picture, hand positions), the derived chord labels and key, and the
  beats away from problem 1.

## Re-check after the repair

1. Run `check1/bin/ponset.py` on the repaired key. No note's pitch should start more than 35 ms after its onset.
2. Run `check1/bin/verdicts.py` again, after `pernote4.py`, `peaks.py` and `legato.py`.
3. Run `gtr-eval check-truth` and confirm the side files are rebuilt.
