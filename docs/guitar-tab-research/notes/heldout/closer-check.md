# Independent check of the held-out key `closer` (*Closer*, Gareth Evans, E A D G A D + capo 1)

Checked 2026-11-27 by lane H's check agent, which did not build the key. Nothing in `/home/user/gtv/truth/closer/` was
changed. Truth checked: `closer.truth.json`, SHA-256 `bbfc78d24489...` (1,156 notes). The per-note verdicts are in
`/home/user/gtv/work/heldout-closer/check1.json` (index, `verdict` = the conf this check gives, `level`, `evidence`);
scripts, logs, outputs and pictures are in `/home/user/gtv/work/heldout-closer/check/` (`bin/`, `logs/`, `out/`,
`frames/`). Every number below comes from a file named next to it. The notes whose conf this check changes are in
`closer-check-conf.csv` (105 rows; per-note, so kept with the key outside git in `/home/user/gtv/heldout/closer/`).

**No note transcriber was run, in any step.** The evidence is my own: two onset detectors on the raw audio (librosa
SuperFlux, and a high-frequency-content flux), STFT energy at each note's own partials around its onset, power added
at its partials against its neighbour semitones in 186 ms windows, CQT pictures, and my eyes. The key builder's
outputs (`key/`) were not used as inputs.

**Verdict.** The pitches, the tuning and the times mostly hold up. **1,073 of 1,156 notes are heard here, 876 of them
pitch-specifically.** Four things need fixing, the largest first:
- the key's `conf` disagrees with this check on 105 notes;
- 7 unison pairs can never be matched by a transcriber;
- 2 chord notes sit 44-64 ms after their sound;
- 11 notes at thumps sit 32-52 ms before their pitch.

No missing note was found.

## Counts

| | |
|---|---|
| `gtr-eval check-truth` | 11,965 checks, 0 mismatches (`logs/check_truth.json`) |
| my schema check (`bin/check_schema.py`, `out/schema.json`) | pitch = tuning + capo + fret for 1,156/1,156; 0 notes outside the audio (246.301 s); 0 zero-length notes (shortest 0.100 s, longest 2.000 s); 0 overlaps on one string; beats rise strictly, downbeats every 4th beat; chords cover 0-246.301 s with no gap; `notes.csv` (1,156 rows), `beats.txt` (384), `chords.lab` (187) equal the JSON. **7 duplicate (onset, pitch) pairs** (Problem 2) |
| this check's verdicts (`check1.json`) | **tab+audio 1,073, tab 82, audio 1** |
| by level | S (heard, pitch-specific) 876; L (hammer/pull heard) 35; C (consistent with a pluck, not pitch-specific) 163; N (not confirmed) 75 = 69 no attack + 4 pitch weaker than a neighbour + 2 weak; U (second note of a unison pair) 7 |
| against the key's conf | agree on 1,051 (1,012 tab+audio, 38 tab, 1 audio); key tab+audio but here tab: **44**; key tab but here tab+audio: **61** (16 S, 5 L, 40 C) |
| strict heard set (S + L only) | 911 notes |
| onset groups vs my SuperFlux (`logs/timing.log`) | plucked groups **0.989 within 50 ms**, 0.975 within 30 ms, median 0 ms (713 groups); hammer/pull groups 0.977 (44); taps 0.984 (243). HFC: 0.980 / 0.930, median -20 ms (its own lag) |
| per-note pitch attack (`logs/tf_count.log`) | of the 940 plucked notes whose own partials rise 3 dB, **883 (93.9 %)** have their pitch-flux peak within 30 ms of the onset (bias of -4 ms removed) |
| tuning (`bin/tuning.py`, `out/tuning.json`) | **-2.5 cents** median over 685 notes (IQR -5.5 to +0.1), against the key's -2 |
| missing notes (`bin/missing.py`, `logs/missing_sum.log`) | 979 times scanned (756 onset groups and 223 detector onsets more than 50 ms from every note and tap), 44 pitches each; 57 strict candidates, **none judged a played note missing** |
| the key's added note (bar 68, D#3 at 171.880 s) | confirmed, level S: own partials +18.7 dB, added energy +24.6 dB over its neighbours, pitch flux on the onset. Its string (4 open or 5 fret 5) cannot be told from the sound |

### How a note is judged (`bin/notecheck.py`, `bin/notecheck2.py`, `bin/verdict.py`)

For each note I measured these. A note's own partials leave out any partial within 40 cents of a partial of another
note that starts within 40 ms or rings into the attack.
- **attack:** the dB rise of its own partials for an attack anywhere within ±50 ms of the onset (median over
  partials 1-6 in a 23/46 ms window, or the power sum of partials 1-8);
- **louder:** comb power in 186 ms after the attack over 186 ms before;
- **added:** power added at its partials against the louder neighbour semitone that is not itself sounding in the key
  (partials 280-5,000 Hz, none shared with another sounding note);
- **present:** the same comparison on the power after the attack.

The levels:
- **S** = attack ≥ 3 dB, louder ≥ 1 dB, added ≥ 0 dB.
- **C** = attack ≥ 3 dB, and present ≥ 3 dB (or not testable, or a slap or thump within 30 ms).
- **L** = (target − origin) salience up ≥ 3 dB within ±50 ms.

The rules were tested on two null sets (`bin/rules.py`):
- **A:** a pitch the key has ringing, at the attack of another event with no tap (491 cases);
- **B:** a ringing pitch at a quiet time (1,394 cases).

| rule | key notes | null A | null B |
|---|---|---|---|
| S | 78 % | 10 % | 2.5 % |
| S or C | 91 % | 62 % | 6 % |
| a 3 dB rise alone (about the key builder's rule) | 90 % | 74 % | 5 % |

So S is fairly specific. C, and the key builder's rule, mostly say "something sounded at those partials". In this
open tuning (open strings F2, A#2, D#3, G#3, A#3, D#4) partials coincide everywhere, and a pitch re-struck while
ringing looks the same as one left ringing at another note's attack.

Eight random notes (seed 7, `frames/random8.png`) and every N-level note with a tap or a doubtful presence were looked
at by eye (`frames/look_*.png`, `frames/partials_*.png`).

## PROBLEMS (largest first)

1. **The key's `conf` disagrees with this check on 105 notes** (`closer-check-conf.csv`).
   - **44 notes the key calls `tab+audio` get `tab` here:**
     - 35 show no 3 dB rise at their own partials within 50 ms;
     - 4 are the second note of a unison pair (Problem 2);
     - 3 are weaker than a free neighbour semitone after the onset;
     - 2 are weak.
   - Most are re-struck or doubled G#3s (s3 0 ×12, s4 5 ×9) and C4/A#3 on s4 (f9 ×6, f7 ×4).
   - Also the lower note of 7 octave dyads (bars 42, 64, 68, 84 and 88 ×3; s4 under s1, except s5 under s3 in bar 42).
   - Two examples (`frames/look_N1.png`):
     - At 23.975 s (bar 10, A#3 s4 7, the 16th at pos 1.25) nothing starts: the A#3 is struck at the slap before it
       and again 160 ms later (`frames/look_N1.png`, `partials_N1.png`).
     - In bar 88 the s1 note of each octave dyad starts and the s4 note an octave below does not.
   - The key's rule accepts a 3 dB rise at the note **or its octave** (`derivation.conf`). With windows like the
     key builder's, 113 of its 1,056 `tab+audio` notes rise only at the octave (`bin/summ2.py`). In bar 88 that
     octave is a different note of the same chord.
   - **61 notes the key calls `tab` are heard here:**
     - 16 are pitch-specific (S), e.g. the G#3 of the bar 22 chord at 55.072 s (+7.6 dB at its own partials) and the
       16th G#3s of bars 13-16;
     - 5 are pull-off or hammer-on targets whose pitch takes over (L);
     - 40 are consistent (C).
   - Effect: the heard-only recall is computed on a set that holds about 44 notes that are not heard and leaves out
     about 21 that clearly are.
   - Fix: take `conf` from `check1.json`'s `verdict` (S, L, C = `tab+audio`; N and U = `tab`), or from S + L only for
     a strict heard set (911 notes). Re-run `check-truth`. If the key builder disagrees on a note, look at it in
     `bin/look.py` (CQT with the key's notes drawn on) and `bin/partials.py` (per-partial traces).

2. **7 unison pairs: two notes with the same pitch at the same onset on two strings** (`out/schema.json`).
   - Where:
     - 27.214 s (bar 11): D#3 on s4 0 (pull-off target) and s5 5.
     - G#3 on s3 0 and s4 5 at 79.418 (bar 32), 89.490 (36), 160.235 (64), 170.347 (68), 220.921 (88) and
       230.998 s (92).
   - Both notes are written in the tab. The sound cannot say whether one or both strings sounded.
   - Effect: `gtr-eval notes` matches one to one (mir_eval), and a transcriber gives one note per pitch at a time. So
     every tool misses 7 notes whatever it does, and recall can reach at most 1,149/1,156. AO-082's keys had no such
     pair.
   - Fix:
     - Keep one note per (onset, pitch) in `notes`: s3 0 for the six G#3 pairs (its offset is as long or longer),
       either one for the D#3 pair.
     - Record the other string on it, e.g. `"unison": {"string": 4, "fret": 5}`.
     - Keep both in `tab.txt` and the tab-merged file for string and fret scoring.
     - Then `check-truth`.

3. **Two chord notes sit 44-64 ms after their sound** (`check1.json` evidence `timing`, `frames/look_late.png`).
   - Where: the A#3 on s2 0 of the bar 54 and bar 74 downbeat chords (#610 at 134.351 s and #840 at 184.929 s).
   - The key split them from their chord, which starts at 134.293 and 184.866 s.
   - At both, every measure puts the attack on the chord, not on the split note:
     - #610: SuperFlux -61 ms, HFC -78 ms, the A#3's own partial flux -46 ms;
     - #840: SuperFlux -64 ms, HFC -81 ms, partial flux -40 ms;
     - at the key time the A#3 does not rise (-1.1 and -1.4 dB).
   - The other 12 split notes are backed by their own partial flux (-16 to +4 ms) and stay.
   - Effect: a tool that puts A#3 on the chord is scored wrong on both.
   - Fix: move #610 to 134.2926 s and #840 to 184.8657 s. Recompute the let-ring offset of the s2 note before each.
     Check again.

4. **11 notes sit 32-52 ms from their pitch's attack, almost all at wrist thumps or slaps**
   (`check1.json` evidence `timing`; `frames/late_tf_a.png`, `late_tf_b.png`).
   - The notes:
     - #85 and #86 at 19.737 s (bar 8);
     - #127 at 30.105 s (bar 12; the slap 29 ms later is the only attack);
     - #311 at 71.100 s (bar 29);
     - #332 at 76.220 s (bar 31, A#4 harmonic);
     - #524 at 118.190 s (bar 47);
     - #754 at 167.149 s (bar 67, harmonic);
     - #829 at 182.700 s (bar 73);
     - #1095 at 230.365 s (bar 92);
     - #493 at 113.511 s (bar 45) and #1097 at 230.719 s (bar 92), which are the other way: 36-44 ms after the attack.
   - Six of the first nine sit on a thump; #127 and #311 sit 29 and 58 ms before a slap or thump; #829 has no tap.
     At each of the nine, the rise of its own partials at the key time is at least 2 dB below their best rise within
     50 ms, and their flux peaks 32-52 ms later.
   - Bass notes with a thump show this in general: their median partial flux is +9 ms (90th percentile +28 ms),
     against -4 ms without one (`bin/tf_bias.py`).
   - Effect: inside the 50 ms tolerance, but at its edge. A tool that hears the pitch late by a few more ms is scored
     wrong.
   - Fix (optional): move each to its pitch attack (the `pitch_flux_peak_ms` in `check1.json`, +4 ms bias). Leave the
     thump where it is.

## Doubts (none changes a fact the scoring relies on)

- **C level (163 notes) is not pitch-specific.** These notes show a fresh rise at their own partials and their pitch
  is there afterwards, but null A passes the same test 62 % of the time. They are mostly re-struck chord tones and
  the repeated G#3 / A#3 / C4 figures. Use S + L for a strict heard set.
- **21 of the 218 `<12>` harmonics start together with their open string's fundamental, an octave below**
  (`bin/harmfund.py`, `out/harmfund.json`). For s2 that is A#3, for s3 G#3: rises of 3 dB or more, added energy
  6 dB or more and presence 6 dB or more over the neighbours. Examples: 74.69, 77.23, 126.44, 131.48, 219.03, 224.02
  and 226.28 s. The player sounds both, but the open note is a side effect of the harmonic, not a written note. A
  transcriber that reports it is counted as inventing a note. Not added to the key.
- **Missing-note candidates** (`out/missing_strong.json`, `frames/miss_a.png`, `miss_b.png`). The 57 strict
  candidates (no tap within 60 ms, pitch not ringing in the key, rise ≥ 6 dB, louder ≥ 6 dB, added and present
  ≥ 10 dB) are:
  - 12 open-string pitches excited without being struck;
  - 7 open-string fundamentals under their harmonic;
  - 13 low smears G2-F3 at bass and body hits (e.g. 43.39 and 48.45 s), with no sustained line;
  - 8 high squeaks or upper partials (B5/C6);
  - 17 others that are partials of ringing open strings or bass notes, e.g.:
    - D5 at 153.31 and 219.03 s = the 5th partial of open A#2;
    - F4 with the A#4 harmonics = the 4th partial of open F2;
    - three faint B4 (71) rises at 143.53, 150.78 and 182.34 s.

  None shows a separate sustained note in the CQT. 229.38 s (bar 91) is a broadband hit 60 ms before the written
  thump, as the key builder found.
- **The added D#3 of bar 68**: heard (level S) and on its attack; the string is still a guess.
- **Tuning per string**: s6 -10.0 cents (90 notes), s2 -5.2, s1 -1.4, s3 -1.6, s5 -0.8, s4 +0.3; open strings -3.8,
  harmonics -4.1, fretted -0.6. `librosa.estimate_tuning` gives +1 (default) and +2 cents (fine). The key's -2 cents
  agrees; all of these are far inside the scorer's 50 cents.
- **Not re-checked here**: the tab readings themselves (the two readers agree on every note head), beats, downbeats,
  chords and the key's tempo. No beat tracker was run.
