# guitar-tab lane: trials

Agent `try-guitar-tab`, 2026-11-10 (UTC). Box: 4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU. Every timed run went
through `gtr-run` (ledger `/home/user/gtr/ledger/runs.jsonl`); timings are on 2 CPU cores unless a line says
otherwise. Scores come from `gtr-eval` (ledger `/home/user/gtr/eval/ledger/evals.jsonl`); every number carries its
eval id. Big outputs are under `/home/user/gtr/lanes/guitar-tab/out/<tool>/`; small samples are under `samples/<tool>/`
here; the scripts are under `scripts/`.

## Lane inputs made here (glue, documented as the manifest does)

- `/home/user/gtr/lanes/guitar-tab/inputs/merged/<id>.merged.mid` for S1, S2n, S3, S5capo2, S5dropd, R1a, R1b, R1c:
  the clip's truth MIDI (`/home/user/gtr/inputs/<id>/<id>.mid`) with every track merged into one track on channel 0,
  made by `scripts/merge_midi.py` (mido 1.3.3 `merge_tracks`; tick times, tempo map and time signature kept; only the
  first program change kept; track names dropped). Reason: the truth files are type-1 MIDI with several tracks (S2
  family: `melody` and `bass`; R1a-c: one track per guitar string, which would hand a tool the string answer), and some
  tools read only one track. Check: `gtr-eval notes` (not logged, `--no-ledger`) of each merged file against its truth
  gives onset-only F1 1.0 for all eight; onset+offset F1 is 1.0 except R1a 0.994709 and R1c 0.986486, where notes of
  the same pitch overlap on two strings and their note-offs pair up differently once they share one channel. Onsets
  and pitches are unchanged.
- `S5capo2.merged.minus2.mid`: the same with every note moved down 2 semitones (`--transpose -2`), used only for the
  "tell a tool about the capo by transposing the notes" workaround on tools that have no capo parameter.
- These are derived from the shared truth files, so they carry the clips' licenses (synthesized clips: public-domain
  melodies, arrangement written for the test set; R1: GuitarSet, CC BY 4.0), see `inputs/INPUTS.md`.

How tab is scored (`gtr-eval tab`, version 0.11.x): estimated and truth notes are matched by
`mir_eval.transcription.match_notes` (onsets within 50 ms, same pitch within 50 cents, each note matched once). Then
`same_string_and_fret_fraction_of_matched` = matched pairs with the same string and the same fret counted from the
capo / matched pairs; `same_string_fraction_of_matched` = same string / matched pairs;
`same_string_and_absolute_fret_fraction_of_matched` = same string and the same fret counted from the nut;
`same_string_and_fret_fraction_of_truth` = same string and fret / all truth notes. `string_difference_counts` counts
estimated string number minus truth string number (string 1 = highest string), so -1 means the tool put the note one
string higher than the truth tab.

## tuttut 0.0.7 (PyPI, uploaded 2026-11-04; git commit 329f7cb, 2026-11-04)

- What it is: a Python package that turns a MIDI file into string-instrument tab, by Nathan Candre. Its README
  describes the method as a hidden Markov model with fingerings as hidden states and notes as observations, decoded
  with Viterbi; transition probabilities come from a hand-written difficulty metric. Source:
  https://github.com/natecdr/tuttut (cloned 2026-11-10, HEAD `329f7cb1cbf1f9d1d1258b800a148e8dbfcc5f4c`), PyPI
  https://pypi.org/project/tuttut/ (0.0.7, wheel uploaded 2026-11-04T15:39:28Z).
- Install: `uv venv --python 3.11 /home/user/gtr/lanes/guitar-tab/venv-sym` then
  `uv pip install --python .../venv-sym/bin/python tuttut==0.0.7 tayuya==0.0.4 pyguitarpro==0.11 mido pretty_midi music21`
  (one venv shared with tayuya and the helpers; no dead ends). Dependencies pulled in by tuttut: numpy 2.4.6,
  pretty-midi 0.2.11.post0, eel 0.18.2 (for its GUI). Size (du, re-measured by the verifier at 22:50 UTC, without the
  `__pycache__` folders that later runs wrote; with them in brackets): the `tuttut` package folder 412 KB (504 KB);
  the whole shared venv 268 MB (285 MB), of which music21 is 101 MB (113 MB); the venv also holds tabsynth, installed
  later. No model weights. Freeze: `samples/tuttut/uv-pip-freeze.txt`.
- Entry points: `tuttut` (GUI, eel + a browser window) and `tuttut-cli <song>.mid <output_dir>`. The CLI always uses
  the default tuning and fret count (it calls `Tab(source.stem, Tuning(), midi, output_dir=...)` and writes only the
  ASCII file). To reach the constraint parameters I called the library from `scripts/run_tuttut.py` (my glue: it builds
  `Tuning(...)`, calls `Tab(...)`, then tuttut's own `to_ascii()` and `to_json()`, and converts tuttut's JSON into the
  note list gtr-eval reads).
- Runs (all on the merged truth MIDI, "perfect notes in"): one single run r0027 (S2n, wall 0.37 s, CPU 0.37 s, peak
  RSS 40.5 MB, 2 cores) and one batch of 15 runs in one `gtr-run` call, r0048 (`scripts/batch_tuttut.sh`; wall 3.74 s
  for all 15 runs including 15 Python start-ups, CPU 3.37 s, peak RSS 37.1 MB, 2 cores, exit 0). The time measured
  inside the glue script (from loading the MIDI file to the end of tuttut's own `to_ascii()` and `to_json()`, so
  `Tab(...)` plus file reading and writing) was 0.01 to 0.10 s per run in r0048 (0.10 s for S1, the first run of the
  batch; `/home/user/gtr/lanes/guitar-tab/logs/tuttut_batch.log`). An earlier batch r0044 (same script path) ended
  with exit 1 and was repeated as r0048 with "continue on error". That r0044 stopped at the failing span-7 run is the
  trial agent's account: r0044's log was overwritten by r0048's, so the files do not show it (its CPU time, 3.03 s
  against r0048's 3.37 s, fits one Python run fewer).
- Results against the truth tab (`gtr-eval tab`, default time-based matching):

| clip | settings given to tuttut | eval id | truth notes | est notes | matched | same string+fret / matched | same string / matched | string diff counts (est - truth) |
|---|---|---|---|---|---|---|---|---|
| S1 | default (standard tuning, 20 frets, span 5) | e0042 | 62 | 62 | 62 | 1.0000 | 1.0000 | 0: 62 |
| S2n | default | e0043 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| S3 | default | e0044 | 182 | 182 | 182 | 1.0000 | 1.0000 | 0: 182 |
| S5capo2 | default (capo not told) | e0045 | 90 | 90 | 90 | 0.0000 (same string and same fret from the nut: 0.6000) | 0.6000 | -1: 36, 0: 54 |
| S5capo2 | capo 2 told by raising every open string 2 semitones (`F#4 C#4 A3 E3 B2 F#2`), nfrets 18 (tuttut has no capo parameter) | e0046 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| S5dropd | default (Drop D not told) | e0047 | 90 | 90 | 86 | 0.8372 | 1.0000 | 0: 86 |
| S5dropd | tuning `E4 B3 G3 D3 A2 D2` | e0048 | 90 | 90 | 90 | 0.9778 | 0.9778 | 0: 88, +1: 2 |
| R1a | default | e0049 | 189 | 189 | 189 | 0.5291 | 0.5291 | -2: 22, -1: 67, 0: 100 |
| R1b | default | e0050 | 70 | 70 | 70 | 0.4429 | 0.4429 | -1: 39, 0: 31 |
| R1c | default | e0052 | 148 | 148 | 148 | 0.8108 | 0.8108 | -1: 27, 0: 120, +1: 1 |
| R1c | nfrets 12 | e0054 | 148 | 148 | 148 | 0.8108 | 0.8108 | note list identical to the default run |
| R1c | max fret span 3 (module constant patched) | e0055 | 148 | 148 | 148 | 0.8108 | 0.8108 | note list identical to the default run |
| S2n | nfrets 3 | e0056 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |

- What the S5 rows show, in detail: S5capo2 without the capo: tuttut writes the sounding pitches from the nut in
  standard tuning; 54 notes land on the truth string at the same fret counted from the nut, 36 land one string higher.
  With the raised tuning every note matches the truth tab (frets counted from the capo). S5dropd without the tuning:
  the 4 D2 notes (below standard tuning's E2) are moved up an octave by tuttut (`Fretboard.fix_oob_notes`) and become D3,
  so they no longer match the truth pitch (86 of 90 matched; each D2 became D3 on the open D string); 72 of the 86 have
  the truth string and fret. With the Drop D tuning, 88 of 90 notes have the truth string and fret; the two others are
  the G3 at 2.14 s and the G3 at 19.29 s (truth: string 3 open), written at string 4 fret 5 (the two +1 differences). The S5capo2 "notes transposed down 2" workaround
  (`S5capo2.truthmidi.transposed-2`) was run in r0048 but not scored: its pitches are 2 semitones below the truth, so
  gtr-eval's pitch matching cannot pair them. Compared note by note instead (a short Python check): all 90 notes have
  the same onset, string and fret as the raised-tuning run, every pitch is 2 lower, and the two ASCII files are
  identical apart from the string-name column. So for tuttut both workarounds give the same tab.
- Output excerpt, S2n (first bars of `S2n.truthmidi.txt`, tuttut's ASCII; the first empty bar is the silent count-in):
  `E |||--------------------|0----0--------------|`, `B |||----------3----3----|----------3---------|`,
  `G |||0----0--------------|`, `D |||-----0---------0----|-----2---------0----|`, `A |||--------------------|3---...`,
  `E |||3---------3---------|`. Full files: `samples/tuttut/`.
- Output format facts: (1) ASCII text, one line per string, thinnest string first, each line starts with the string's
  note letter (`E `, `B `, `F#`), bars separated by `|`, one character per 16th of a bar (`floor(gap * 16)` dashes,
  at least one), no times, no durations. (2) JSON (`Tab.to_json`): `{"tuning": [MIDI numbers, thinnest first],
  "measures": [{"events": [{"time": seconds, "time_ticks": int, "measure_timing": fraction of the bar,
  "time_signature_change": [num, den] (only where one occurs), "notes": [{"degree": "G", "octave": "3", "string":
  0-based index from the thinnest string, "fret": int}]}]}]}`. No MIDI pitch number, no velocity, no note duration or
  offset. (3) The CLI writes only the ASCII file. No Guitar Pro or MusicXML writer.
- Input format facts: a `.mid`/`.midi` file read with pretty_midi; notes of all non-drum instruments are pooled into one
  timeline keyed by start tick; notes starting on the same tick form one chord; measures come from the MIDI time
  signatures (4/4 assumed if none). Out-of-range notes are moved by octaves into the instrument's range
  (`fix_oob_notes`), so the output pitch can differ from the input pitch.
- Constraint inputs (read from the source of 0.0.7 and exercised above): `Tuning(strings=[note names, thinnest first],
  nfrets=20)` (any number of strings; the GUI has presets); `Tab(..., weights={"b":1, "height":1, "length":1,
  "n_changed_strings":1})` (weights of the difficulty metric; not varied here); `tuttut.logic.fretboard.MAX_FRET_SPAN = 5`
  is a module constant, not a parameter. No capo parameter (the raised-tuning run above is the workaround), no
  preferred position, no way to pin a note to a string or fret.
- Failures and oddities: setting `MAX_FRET_SPAN` to 7 (R1c) stops with `AssertionError` at
  `assert 0 <= span <= 1` in `difficulty.get_path_span`, because `SPAN_NORMALIZATION = 5` in `difficulty.py` divides
  the span (largest minus smallest non-zero fret of a fingering), and the filter in `fretboard.is_fingering_possible`
  keeps fingerings whose span is below `MAX_FRET_SPAN` (strict `<`): with 7, a span of 6 passes the filter and
  6 / 5 > 1 fails the assertion. The verifier reproduced the span-7 failure and also ran `MAX_FRET_SPAN = 6` on R1c
  (r0469, `--nolock`): no error, and the note list is identical to the default run (148 notes, same string and fret
  for all). So the constant runs at 3, 5 and 6 on R1c and failed at 7; values above 7 were not tried. With nfrets 3 on S2n
  the output still had all 90 notes on the truth positions (the S2 arrangement uses frets 0-3 only), so that run does
  not show what happens when notes do not fit.

## tayuya 0.0.4 (PyPI, uploaded 2019-09-14; git HEAD 793d6a4, 2019-10-13)

- What it is: a small Python library by Vipul Sharma that turns one MIDI track into guitar tab for single-note lines
  (README: "Works only for guitar solos. Implementation for determination and rendering of chords is not done yet."
  and "Works only for standard tuning (E A D G B E)"). Method, from the source: detect the key with six music21
  key-profile algorithms (majority vote), find a starting position from the detected scale, then place each note at
  the position in a fixed note-to-position table nearest to the previous note's fret, with a per-note cache. Sources:
  https://github.com/vipul-sharma20/tayuya (cloned 2026-11-10, HEAD `793d6a4d6ae19d82a27cb4de402e6678d6240174`),
  https://pypi.org/project/tayuya/ (0.0.4, wheel uploaded 2019-09-14T11:50:18Z).
- Install: in the same venv as tuttut (`uv pip install ... tayuya==0.0.4`, which pulls mido and music21; music21
  10.5.2 installed, 101 MB). The `tayuya` package folder is 40 KB. No weights. Freeze: `samples/tayuya/uv-pip-freeze.txt`.
- How it was called: `scripts/run_tayuya.py` (my glue) calls the library exactly as its README shows:
  `MIDIParser(path, track=0)`, `Tabs(notes=mid.notes_played(), key=mid.get_key()).generate_notes()` (list of
  `(note name, string, fret)`), and `MIDIParser.render_tabs()` for its ASCII (captured from stdout). Input: the merged
  single-track truth MIDI. tayuya returns no times, so the glue gives the i-th returned note the onset of the i-th
  `note_on` message of the same track (tayuya's list is built from those messages in file order), using mido's tempo
  map, and writes the gtr-eval note file.
- Run: one batch of 9 runs in one `gtr-run` call, r0117 (`scripts/batch_tayuya.sh`): wall 7.35 s for all 9 including
  Python start-ups, CPU 4.7 s, peak RSS 72.6 MB, 2 cores, exit 0 (it waited 459.5 s for a slot first). Time inside
  tayuya per clip: 0.02 to 0.06 s.
- Results against the truth tab (time-based matching; the first table scores the pitch tayuya returns with each note):

| clip | eval id | truth notes | est notes | matched | same string+fret / matched | same string / matched | string diff counts (est - truth) | key tayuya detected |
|---|---|---|---|---|---|---|---|---|
| S1 | e0124 | 62 | 62 | 62 | 0.0000 | 0.0000 | +1: 46, +2: 16 | D major |
| S2n | e0125 | 90 | 90 | 90 | 0.1556 | 0.1556 | 0: 14, +1: 16, +2: 60 | G major |
| S3 | e0127 | 182 | 182 | 182 | 0.1813 | 0.1813 | -1: 6, 0: 33, +1: 100, +2: 43 | E minor |
| S5capo2 (capo not told) | e0129 | 90 | 90 | 90 | 0.0000 (same string, same fret from nut: 0.1556) | 0.1556 | 0: 14, +1: 16, +2: 60 | A major |
| S5capo2, notes moved down 2 semitones, frets read from capo 2 | e0131 | 90 | 90 | 90 | 0.1556 | 0.1556 | 0: 14, +1: 16, +2: 60 | G major |
| S5dropd (tuning cannot be told) | e0133 | 90 | 90 | 90 | 0.0000 | 0.2000 | 0: 18, +1: 16, +2: 56 | G major |
| R1a | e0135 | 189 | 189 | 189 | 0.4180 | 0.4180 | -1: 57, 0: 79, +1: 37, +2: 16 | B major |
| R1b | e0137 | 70 | 70 | 70 | 0.4143 | 0.4143 | -1: 5, 0: 29, +1: 35, +2: 1 | C# minor |
| R1c | e0139 | 148 | 148 | 148 | 0.1757 | 0.2230 | 0: 33, +1: 51, +2: 64 | G major |

- The pitch tayuya returns is not always the pitch of the position it returns. Notes below its table's range are looked
  up an octave up (source: `if int(note[-1]) <= 2: new_note = note[:-1] + '3'`), but the tuple keeps the original name.
  Counted with a short Python check over the outputs: E2 is placed where E3 sounds (string 6 fret 12 or string 5
  fret 7) 7 times in R1c and 6 times in S3; D2 is placed at string 6 fret 10 (D3) 4 times in S5dropd; in the other
  outputs the named and the sounding pitch agree (the verifier added the two S5capo2 outputs to that check: they
  agree in all 90 notes each). Scored on the pitch the position sounds (pitch field removed, so gtr-eval uses tuning + capo + fret):
  S3 e0157: 176 of 182 matched, same string+fret / matched 0.1534; S5dropd e0158: 86 of 90 matched, 0.0000 (same string
  0.1628); R1c e0159: 141 of 148 matched, 0.1844.
- Its position table has no fret 0 entries (for example `'E4': {1: '', 2: 5, ...}`, `'G3': {4: 5, 5: 10, 6: 15}`), so
  no open string is ever written: 0 of the notes in every output above are on fret 0 (checked in all 9 output files:
  the 8 clips and the transposed S5capo2 run),
  while the truth tabs have fret-0 notes as follows: S1 16 of 62, S2n 40 of 90, S3 100 of 182, R1a 1 of 189, R1b 0 of
  70, R1c 49 of 148.
- Output excerpt, S2n, first 10 entries of `generate_notes()`: `('G3', 5, 10), ('G2', 6, 3), ('G3', 5, 10),
  ('D3', 6, 10), ('D4', 4, 12), ('G2', 6, 3), ('D4', 4, 12), ('D3', 6, 10), ('E4', 3, 9), ('C3', 6, 8)` (melody and
  bass notes come out as one sequence; same-tick notes are treated one after the other). Full files: `samples/tayuya/`.
- Output format facts: (1) `generate_notes()`: Python list of `(note name with octave, string 1-6 (1 = high E),
  fret)`, no times, no durations. (2) `render_tabs()` prints ASCII tab to stdout in chunks of about 70 characters, six
  lines per chunk; the lines are filled from string 1 (top) to string 6 (bottom) but labelled `E A D G B E` from the
  top (`GUITAR_STAFF = {0: 'E', 1: 'A', 2: 'D', 3: 'G', 4: 'B', 5: 'E'}`), so the labels of lines 2 to 5 do not name
  the string the line holds. One note per column group, no bar lines, no rhythm.
- Input format facts: a MIDI file and a track index (`MIDIParser(path, track=n)`); it reads every `note_on` message of
  that one track, whatever the channel. A type-1 file whose notes are in tracks 1 and 2 (the shared truth MIDI) needs
  the track merged or chosen first.
- Constraint inputs: none. No tuning, capo, fret count, hand span, position or pinned-note parameter in 0.0.4 (the
  README's to-do list has "Add way to handle non standard tuning"). The capo row above uses the transposition
  workaround (`S5capo2.merged.minus2.mid` in, frets read from capo 2 with `scripts/capo_relabel.py`); with it the
  positions are the same as for S2n (14 of 90 on the truth string and fret), which is all a capo can change for a tool
  that only sees pitches.
- Failures and oddities: none that stopped a run on the truth MIDI. The glue checks that the number of returned notes
  equals the number of `note_on` messages (it did for all 9 runs). On Basic Pitch MIDI tayuya doubled the notes and
  stopped with `UnboundLocalError` on 3 clips (handoff section below).

## LilyPond 2.24.3 automatic tablature (TabStaff string selection)

- What it is: the music engraver's `TabStaff` picks a string and fret for every note that has no string mark. Its
  documented rule (`define-context-properties.scm`, property `minimumFret`): "The tablature auto string-selecting
  mechanism selects the highest string with a fret at least `minimumFret`." In the code (`scm/lily/translation-functions.scm`), `determine-frets`
  is called with the notes of one moment (one chord), and the parts read here (`determine-frets-and-strings`) use no
  note from an earlier or later moment (UNVERIFIED for the whole engraver: only this file was read).
  Present on the box as the Ubuntu 24.04 package `lilypond 2.24.3-1build3` (installed already, not by this
  lane; `lilypond --version`: "GNU LilyPond 2.24.3 (running Guile 2.2)"). No weights.
- How it was called: LilyPond reads its own text format, not MIDI, and prints tab as PDF/PNG/SVG; it has no
  machine-readable tab output. `scripts/run_lilypond_tab.py` (my glue) therefore (1) reads the MIDI notes with
  pretty_midi and groups notes whose onsets are within 30 ms of a group's first note into one chord (so a strum is one
  chord, as in a tab column), (2) writes a `.ly` file with one `TabStaff` and every group as one 16th-note chord in order
  (`\cadenzaOn`, no bar lines), with `stringTunings`, `minimumFret`, `restrainOpenStrings`, `maximumFretStretch` and
  optional string marks (`g\4`), and with `tablatureFormat` set to a Scheme procedure that appends (moment, string
  number, fret) to a TSV file and then calls LilyPond's own `fret-number-tablature-format`, (3) runs
  `lilypond --loglevel=WARNING -dno-print-pages` (`--png -dresolution=70` for two picture runs) and turns the TSV into
  the gtr-eval note file (each logged note gets the onset of its group; pitch = tuning + capo + fret). The rhythm in
  the `.ly` is not the music's rhythm: it only orders the chords.
- Runs: r0145 (`scripts/batch_lilypond.sh`, 14 runs: 8 clips and 6 constraint runs, `gtr-run --nolock`: no CPU slot,
  light job; wall 36.04 s for all 14, CPU 32.42 s, peak RSS 78.7 MB; the `lilypond` subprocess itself took 2.05 to
  2.88 s per run, timed inside the glue),
  r0151 (2 runs: restrainOpenStrings with minimumFret 1, and minimumFret 3; wall 9.74 s), r0155 (pinned-string run;
  wall 2.78 s). Input: the merged truth MIDI.
- Results against the truth tab:

| clip | LilyPond settings | eval id | truth notes | tab notes written | matched | same string+fret / matched | same string / matched | string diff counts (est - truth) |
|---|---|---|---|---|---|---|---|---|
| S1 | defaults (standard tuning, minimumFret 0, maximumFretStretch 4) | e0175 | 62 | 62 | 62 | 1.0000 | 1.0000 | 0: 62 |
| S2n | defaults | e0176 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| S3 | defaults | e0177 | 182 | 182 | 182 | 1.0000 | 1.0000 | 0: 182 |
| S5capo2 | defaults (capo not told) | e0178 | 90 | 90 | 90 | 0.0000 (same string and fret from the nut: 0.6000) | 0.6000 | -1: 36, 0: 54 |
| S5capo2 | `stringTunings` raised 2 semitones (`fis, b, e a cis' fis'`): the capo workaround | e0179 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| S5dropd | defaults (Drop D not told) | e0180 | 90 | 86 | 86 | 0.8372 | 1.0000 | 0: 86 |
| S5dropd | `stringTunings = \stringTuning <d, a, d g b e'>` | e0181 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| R1a | defaults | e0182 | 189 | 188 | 188 | 0.5532 | 0.5532 | -2: 22, -1: 62, 0: 104 |
| R1b | defaults | e0183 | 70 | 70 | 70 | 0.4571 | 0.4571 | -1: 38, 0: 32 |
| R1c | defaults | e0184 | 148 | 148 | 148 | 0.8716 | 0.8716 | -1: 19, 0: 129 |
| S1 | `minimumFret = 5` | e0185 | 62 | 62 | 62 | 0.3548 | 0.3548 | 0: 22, +1: 40 |
| R1b | `minimumFret = 5` | e0188 | 70 | 70 | 70 | 0.4143 | 0.4143 | -1: 12, 0: 29, +1: 29 |
| R1c | `minimumFret = 3` | e0187 | 148 | 146 | 146 | 0.5685 | 0.5685 | -1: 15, 0: 83, +1: 48 |
| S2n | `minimumFret = 3` | e0190 | 90 | 90 | 90 | 0.7333 | 0.7333 | 0: 66, +1: 24 |
| S2n | `restrainOpenStrings = ##t` (minimumFret 0) | e0186 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| S2n | `restrainOpenStrings = ##t`, `minimumFret = 1` | e0189 | 90 | 90 | 90 | 0.5556 | 0.5556 | 0: 50, +1: 40 |

- Notes LilyPond did not place: it writes `warning: No string for pitch ...` and leaves the note out of the tab. S5dropd
  without the tuning: 4 warnings, all `No string for pitch #<Pitch d, > (given frets (2))` (D2 is below standard
  tuning), so 86 of 90 notes are written; unlike tuttut, LilyPond does not move them an octave. R1a: 1 warning, `No
  string for pitch #<Pitch ais, > (given frets (4 1))`: the A#2 at 10.668 s, in the 30 ms group A#2 + C#3 + G#3
  (column 359 of the `.ly` line points at it; checked by the verifier). LilyPond wrote the C#3 at string 5 fret 4 and
  the G#3 at string 3 fret 1, both the truth positions; the truth has the A#2 at string 6 fret 6, which is 5 frets
  from the fret 1 already given, more than the default `maximumFretStretch` of 4 (reading of `close-enough` in
  `translation-functions.scm`). R1c with minimumFret 3:
  2 warnings for B3 (`(given frets (4 7))`). Files: `samples/lilypond/*.lilypond.stderr.txt`.
- `restrainOpenStrings` alone changed nothing on S2n (40 of 90 notes still on open strings in e0186): in
  `string-qualifies` an open string passes `(>= fret minimum-fret)` when `minimumFret` is 0. With `minimumFret = 1` the
  40 open-string notes moved one string down (+1).
- Pinning a note: `--pin 0:55:4` writes the first chord as `<g, g\4>16` (LilyPond's string-number mark). Result
  (r0155, not scored separately): that G3 is written at string 4 fret 5 instead of string 3 fret 0, and the other 89
  notes are identical to the unpinned S2n run (compared note by note). Files: `samples/lilypond/S2n.truthmidi.pin0-55-s4.*`.
- Output excerpt, S2n (`S2n.truthmidi.lilylog.tsv`, moment in whole notes, string, fret): `0 6 3`, `0 3 0`,
  `1/16 4 0`, `1/16 3 0`, `1/8 6 3` (G2 on string 6 fret 3 with G3 on the open G string, then D3 on the open D string
  with G3...). Picture: `samples/lilypond/S5dropd.truthmidi.dropD.png` (70 dpi page, one unbroken line of tab that runs
  off the page edge because of `\cadenzaOn`; 8.7 KB).
- Output format facts: LilyPond itself writes PDF, PNG, SVG or PostScript of the engraved tab (and MIDI if a
  `\midi {}` block is added); there is no text, JSON or MusicXML tab export. The string and fret per note are only
  reachable through Scheme inside the `.ly` file, as done here (`tablatureFormat` gets context, string number, fret).
  The `.lilylog.tsv` files are my glue's output: `moment<TAB>string<TAB>fret`, string 1 = highest.
- Input format facts: LilyPond's `.ly` text format. MIDI can be turned into `.ly` with LilyPond's `midi2ly` (bundled),
  which quantizes the rhythm; it was not used here (the glue writes the notes directly).
- Constraint inputs (all exercised above except where noted): `stringTunings` (any number of strings, e.g.
  `\stringTuning <d, a, d g b e'>`; presets such as `#guitar-drop-d-tuning`, not used); `minimumFret` (lowest fret the
  automatic choice may use, i.e. a position hint); `restrainOpenStrings` (only bites with `minimumFret` above 0, see
  above); `maximumFretStretch` (default 4: "Don't allocate frets further than this from specified frets"; not varied);
  string marks per note `note\N` (pins a note to string N); fingering marks are also read by the same function (not
  tried). No capo property for `TabStaff` was found: in `define-context-properties.scm` the only line containing "capo" is
  about *da capo* repeats; "capo" appears in `fret-diagrams.scm` and `predefined-fretboards.scm`, which belong to chord
  diagrams (fret diagram markup), not to `TabStaff` string selection. The raised-tuning run above is the workaround.

## SynthTab pretrained TabCNN checkpoints (repo commit 6136f79, 2024-12-05)

- What it is: TabCNN (Wiggins and Kim, ISMIR 2019: a CNN on a CQT that outputs, for each frame, one fret class or
  "silent" per string) trained by the SynthTab authors (Zang, Zhong, Cwitkowitz, Duan; arXiv 2309.09085, ICASSP 2024)
  on their synthesized SynthTab dataset, with versions fine-tuned on GuitarSet, IDMT-SMT-Guitar and EGDB. The repository
  ships the checkpoints in git: https://github.com/yongyizang/SynthTab (cloned 2026-11-10, HEAD
  `6136f79d04d8627f1fec57d31cd5667db9854bbc`), folder `demo_embedding/pretrained_models/`: `SynthTab-Pretrained.pt`,
  `finetuned/{GuitarSet,IDMT,EGDB}.pt`, `non_finetuned/{GuitarSet,IDMT,EGDB}.pt`, 52.57 MB each (7 files; byte counts
  in `samples/synthtab-tabcnn/checkpoint-files.txt`; the verifier re-downloaded `finetuned/GuitarSet.pt` from
  raw.githubusercontent.com at that commit: 52,574,019 bytes, the same SHA-256 as recorded there). The clone measured
  352 MB with the rest of the repository (trial agent's figure; UNVERIFIED: the clone was deleted before verification).
  Its README: "`demo_embedding` is where we put our benchmark pre-trained models, with a simple demo
  script for training and running evaluation." and `demo_embedding/README.md`: "The code is still being cleaned up. You
  would probably need to change directories paths and datasets in the code to make it work". The README does not say
  what `non_finetuned/` holds; UNVERIFIED (the paper's Table 3 has models trained on one dataset without SynthTab, which
  may be these).
- Weights are published: yes, in the repository itself (no separate download). The repo `LICENSE` file is the "Creative
  Commons Attribution 4.0 International" text; the README says the SynthTab dataset "is released with CC BY-NC 4.0
  license". (Quotes read from the clone 2026-11-10; the docs lane owns the full license record.)
- Train/test split and the R1 clips: the paper says "We create training, validation, and testing splits randomly by
  track for IDMT and GuitarSet, following 10:1:1 and 8:1:1 ratios, respectively." (arXiv 2309.09085 PDF, read
  2026-11-10); which tracks were in which split is not published in the repository (UNVERIFIED). The fine-tuning script
  in the repository (`demo_embedding/exp_finetuning.py`) instead takes `train_splits = GuitarSet.available_splits()`,
  pops the last two as validation and test, and SynthTab's own `GuitarSet.py` returns players
  `['00', ..., '09']` (GuitarSet has players 00 to 05), so with that code every GuitarSet player would be in training.
  Either way the R1 takes (players 02, 04, 00) may have been seen by `finetuned/GuitarSet.pt`; the R1 numbers below
  must be read with that.
- Install: no code from the SynthTab repository was run. `uv venv --python 3.11 .../venv-amt`;
  `uv pip install --python .../venv-amt/bin/python torch amt-tools==0.3.2` (torch 2.15.0+cpu, librosa 0.11.0, numpy
  2.4.6, amt-tools 0.3.2 = identical to its git HEAD 7822dc2 apart from README files) and `resampy` (needed by
  `load_normalize_audio`'s `res_type='kaiser_best'`: first run failed with `ModuleNotFoundError: No module named
  'resampy'`). The checkpoints are whole pickled models; `pickletools` listed the classes they name (`tabcnn.TabCNN`,
  `amt_tools.models.common.SoftmaxGroups`, `amt_tools.tools.instrument.GuitarProfile`, torch layers, numpy scalars), and
  `scripts/run_synthtab_tabcnn.py` opens them with `torch.load(weights_only=True)` and that allow-list, mapping
  SynthTab's `tabcnn.TabCNN` onto amt-tools' `TabCNN` (a diff shows the two classes differ only in
  `nn.ReLU(inplace=True)` vs `nn.ReLU()`). First attempt failed with `Unsupported global: GLOBAL
  numpy.core.multiarray.scalar` (numpy 2 renamed the module); the allow-list maps the old name. venv: 1.6 GB on disk as
  counted by du, all but 80 MB hard links into the shared uv cache (re-measured by the verifier at 23:05 UTC, after
  piano-transcription-inference and `__pycache__` folders were added: 1.6 GB, 88.9 MB in files with one link). Freeze: `samples/synthtab-tabcnn/uv-pip-freeze.txt`.
- Pipeline (settings copied from `demo_embedding/evaluate.py`): audio from `<clip>.mono.wav` resampled to 22050 Hz by
  `amt_tools.tools.load_normalize_audio`, `CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)`,
  `run_offline` with `ComboEstimator([TablatureWrapper, StackedNoteTranscriber])`. The checkpoint's own profile: tuning
  `[40, 45, 50, 55, 59, 64]`, 19 frets. Frame hop 512/22050 = 23.2 ms.
- Run `finetuned/GuitarSet.pt`: r0139, one `gtr-run` call for 8 clips (`scripts/batch_synthtab.sh`), 2 cores, wall
  185.81 s, CPU 205.69 s, peak RSS 3798.2 MB (the largest single process). Per clip (wall from /usr/bin/time inside the
  batch, including Python start-up): S2n 32.91 s, S2s 25.90 s, S3 18.65 s, S5capo2 20.61 s, S5dropd 25.07 s, R1a 20.56 s,
  R1b 18.36 s, R1c 23.68 s, for clips of 24 to 29.4 s. (The trial agent also reports an unlogged smoke test on S2n
  outside `gtr-run`, 87.94 s for features + inference + decoding while the box was loaded; it is not a measurement,
  and UNVERIFIED: no log of it exists in the lane folder.) The verifier re-ran the R1c item with the re-downloaded
  checkpoint (r0501, 2 cores 2-3, after 1380.3 s waiting for a slot; wall 21.15 s, CPU 24.73 s, peak RSS 3647.2 MB):
  frames CSV byte-identical to r0139's and the same 141 notes; features + inference + decoding 15.60 s (r0139: 17.10 s).
- Results, `finetuned/GuitarSet.pt` (note level: the decoded notes; frame level: the model's per-frame frets):

| clip | tab eval id | truth notes | est notes | matched (50 ms, same pitch) | same string+fret / matched | same string+fret / truth | string diff counts | notes eval id: onset F1 (P / R) | tab-frames eval id: tab F1, pitch F1 |
|---|---|---|---|---|---|---|---|---|---|
| S2n | e0198 | 90 | 260 | 67 | 0.6119 | 0.4556 | 0: 41, +1: 26 | e0206: 0.3829 (0.2577 / 0.7444) | e0207: 0.4699, 0.8012 |
| S2s | e0199 | 90 | 395 | 59 | 0.7797 | 0.5111 | 0: 46, +1: 13 | e0209: 0.2433 (0.1494 / 0.6556) | e0211: 0.5564, 0.6166 |
| S3 | e0200 | 182 | 169 | 48 | 0.8750 | 0.2308 | 0: 42, +1: 6 | e0213: 0.2735 (0.2840 / 0.2637) | e0215: 0.8764, 0.9120 |
| S5capo2 | e0201 | 90 | 235 | 64 | 0.0000 (from the nut: 0.5625) | 0.0000 | -1: 12, 0: 36, +1: 16 | e0217: 0.3938 (0.2723 / 0.7111) | e0244 (estimate stated as capo 0): 0.0005, 0.7894 |
| S5dropd | e0202 | 90 | 263 | 67 | 0.5672 | 0.4222 | 0: 43, +1: 24 | e0222: 0.3796 (0.2548 / 0.7444) | e0246 (estimate stated as standard tuning): 0.3771, 0.7494 |
| R1a | e0203 | 189 | 77 | 69 | 0.9855 | 0.3598 | -1: 1, 0: 68 | e0226: 0.5188 (0.8961 / 0.3651) | e0228: 0.9687, 0.9703 |
| R1b | e0204 | 70 | 96 | 64 | 0.9219 | 0.8429 | 0: 59, +1: 5 | e0229: 0.7711 (0.6667 / 0.9143) | e0232: 0.7407, 0.8204 |
| R1c | e0205 | 148 | 141 | 129 | 0.9845 | 0.8581 | 0: 127, +1: 2 | e0234: 0.8927 (0.9149 / 0.8716) | e0236: 0.9540, 0.9609 |

  Definitions: `gtr-eval notes` onset F1 = mir_eval match with 50 ms onset tolerance and 50 cents pitch tolerance;
  `gtr-eval tab-frames` tab F1 = per-frame (string, fret) sets against the truth notes sounding at each frame time,
  pitch F1 = the same after turning (string, fret) into MIDI pitch; both are gtr-eval's own definitions (README). The
  frame scores e0220 (S5capo2) and e0224 (S5dropd) were computed with gtr-eval assuming the truth's capo / tuning for the
  estimate and are superseded by e0244 / e0246, which state the model's own capo 0 and standard tuning.
- Run `SynthTab-Pretrained.pt` (trained on SynthTab only, no fine-tuning on a real dataset): r0274, same batch script
  and clips, 2 cores (cores 0-1), wall 517.17 s, CPU 211.74 s, peak RSS 3797.4 MB, 898.3 s waiting for a slot. The
  1-minute load average at its start was 16.19 (r0139: 10.54), and wall-clock is 2.4 times the CPU time here against
  0.9 times in r0139, which points to the pinned cores being shared with processes outside `gtr-run`'s slots (not
  measured); per-clip walls (47.66 s for S3 to 77.40 s for S2n) are therefore not comparable with r0139's. CPU time for the whole batch: 211.74 s (r0274) vs
  205.69 s (r0139).
- Results, `SynthTab-Pretrained.pt`:

| clip | tab eval id | truth notes | est notes | matched | same string+fret / matched | same string+fret / truth | string diff counts | notes eval id: onset F1 (P / R) | tab-frames eval id: tab F1, pitch F1 |
|---|---|---|---|---|---|---|---|---|---|
| S2n | e0863 | 90 | 163 | 67 | 0.8955 | 0.6667 | 0: 60, +1: 7 | e0885: 0.5296 (0.4110 / 0.7444) | e0887: 0.8308, 0.8559 |
| S2s | e0866 | 90 | 334 | 49 | 1.0000 | 0.5444 | 0: 49 | e0889: 0.2311 (0.1467 / 0.5444) | e0891: 0.5675, 0.6162 |
| S3 | e0869 | 182 | 86 | 32 | 0.9688 | 0.1703 | 0: 31, +1: 1 | e0894: 0.2388 (0.3721 / 0.1758) | e0897: 0.9260, 0.9297 |
| S5capo2 | e0873 | 90 | 156 | 70 | 0.0000 (from the nut: 0.5143) | 0.0000 | -1: 28, 0: 36, +1: 6 | e0899: 0.5691 (0.4487 / 0.7778) | e0901 (estimate stated as capo 0): 0.0026, 0.8397 |
| S5dropd | e0875 | 90 | 152 | 66 | 0.8030 | 0.5889 | 0: 60, +1: 6 | e0903: 0.5455 (0.4342 / 0.7333) | e0905 (estimate stated as standard tuning): 0.6743, 0.8136 |
| R1a | e0879 | 189 | 178 | 68 | 0.7500 | 0.2698 | -2: 6, -1: 9, 0: 51, +1: 2 | e0909: 0.3706 (0.3820 / 0.3598) | e0912: 0.5316, 0.7051 |
| R1b | e0881 | 70 | 114 | 50 | 0.6200 | 0.4429 | -1: 16, 0: 31, +1: 3 | e0915: 0.5435 (0.4386 / 0.7143) | e0918: 0.3480, 0.5538 |
| R1c | e0883 | 148 | 180 | 82 | 0.7439 | 0.4122 | -1: 14, 0: 61, +1: 7 | e0922: 0.5000 (0.4556 / 0.5541) | e0925: 0.5208, 0.6466 |

  Side by side with `finetuned/GuitarSet.pt` on the R1 clips, frame tab F1: R1a 0.9687 vs 0.5316, R1b 0.7407 vs 0.3480,
  R1c 0.9540 vs 0.5208 (e0228/e0912, e0232/e0918, e0236/e0925). The fine-tuned model may have been trained on these
  takes (see the split note above); the SynthTab-only model was not trained on GuitarSet according to the checkpoint's
  name and the paper's description of pre-training on SynthTab (not otherwise verified).
- What the S5 rows show: neither checkpoint has a capo or tuning input; frets are counted from the nut in standard
  tuning. On S5capo2 the decoded notes that match a truth pitch sit on the truth string at the same fret from the nut in
  36 of 64 cases (`finetuned/GuitarSet.pt`, e0201) and 36 of 70 (`SynthTab-Pretrained.pt`, e0873). On S5dropd the 4 D2
  notes cannot be produced (the profile's lowest note is E2).
- Output excerpt, `finetuned/GuitarSet.pt`, S2n, first 10 decoded notes (onset s, MIDI pitch, string, fret): (2.1595, 55, 4, 5), (2.1827, 43, 6, 3),
  (2.4613, 43, 6, 3), (2.5310, 43, 6, 3), (2.6935, 50, 5, 5), (2.8561, 55, 3, 0), (2.8793, 43, 6, 3), (3.2044, 62, 2, 3),
  (3.2508, 43, 6, 3), (3.4598, 55, 3, 0). Truth starts with G2 (string 6 fret 3) and G3 (string 3 open) at 2.1429 s.
- Output format facts: the model's raw output is a (6 strings x frames) array of fret classes, -1 = silent, index 0 =
  lowest string; `TablatureWrapper` turns it into a stacked multi-pitch array and `StackedNoteTranscriber` into
  per-string note lists (MIDI pitch, onset, offset in seconds). Saved here as `<clip>.<ckpt>.frames.csv`
  (`time,s1,...,s6`, string 1 first, fret or -1, 23.2 ms hop) and `<clip>.<ckpt>.gtreval.json` (`notes: [{onset,
  offset, pitch, string, fret}]`, my glue). No velocity, no ASCII tab, no Guitar Pro/MusicXML writer in the pipeline.
- Input format facts: any audio file librosa reads; resampled to 22050 Hz mono and peak-normalized by amt-tools.
- Constraint inputs: none at inference. The tuning and fret count are fixed in the checkpoint's `GuitarProfile`
  (`[40, 45, 50, 55, 59, 64]`, 19 frets); amt-tools can build a different profile, but the output layer is trained for
  this one. No capo, position, hand-span or pinned-note input.
- Samples: `samples/synthtab-tabcnn/` (S2n frames CSV, S2n and R1c note files, score table).

## tabsynth 1.0.6 (PyPI, uploaded 2026-01-06)

- What it is: a Python package "Guitar tablature synthesis from musical events" (its CLI help text): note events
  (`NoteEvent(pitch_hz, start, duration)`) and chord events (`ChordEvent(pitches_hz, start, duration)`) become playable
  states; `optimize_sequence` picks one state per event by dynamic programming over hand-position, string-change,
  stretch, barre and position-preference costs; chords are matched against 63 built-in chord-shape templates
  (`V1_TEMPLATES`). Source: https://pypi.org/project/tabsynth/ (wheel uploaded 2026-01-06T23:17:43; PyPI shows no
  author and no project URL; classifier `License :: OSI Approved :: MIT License`). Installed in the shared symbolic venv:
  `uv pip install --python .../venv-sym/bin/python tabsynth==1.0.6` (no dependencies; package folder 68 KB). Freeze:
  `samples/tabsynth/uv-pip-freeze.txt`.
- How it was called: `scripts/run_tabsynth.py` (my glue) turns the MIDI into events and calls
  `tabsynth.pipeline.events_to_tablature(events, output_format="ascii"|"json", max_fret=15, tolerance_cents=50)`.
  Two modes: `groups` (notes with onsets within 30 ms form one `ChordEvent`, lone notes are `NoteEvent`s, as in
  tabsynth's own `demo-mixed`) and `notes` (every note a `NoteEvent`). The gtr-eval file lists every string/fret of every
  returned state at the state's start time.
- Runs: r0186 (`scripts/batch_tabsynth.sh`, 19 runs, `gtr-run --nolock`: light job, no slot; wall 8.73 s for all 19,
  CPU 4.2 s, peak RSS 37.0 MB). Time inside tabsynth: 0.01 to 0.15 s per clip for both output calls together
  (UNVERIFIED: r0186's printed output was not saved to a log; in the verifier's re-run r0469 the glue printed 0.03 s
  for S2n `groups` and 0.01 s for R1b `notes` with `max_fret=5`).
- Results against the truth tab:

| clip | mode | eval id | truth notes | tab notes out | matched | same string+fret / matched | same string+fret / truth | string diff counts |
|---|---|---|---|---|---|---|---|---|
| S1 | notes | e0370 | 62 | 62 | 62 | 0.8065 | 0.8065 | 0: 50, +1: 12 |
| S1 | groups (no chords in S1) | e0372 | 62 | 62 | 62 | 0.8065 | 0.8065 | 0: 50, +1: 12 |
| S2n | notes | e0373 | 90 | 90 | 90 | 0.7556 | 0.7556 | 0: 68, +1: 22 |
| S2n | groups | e0375 | 90 | 238 | 54 | 1.0000 | 0.6000 | 0: 54 |
| S3 | notes | e0377 | 182 | 182 | 182 | 0.8077 | 0.8077 | 0: 147, +1: 35 |
| S3 | groups | e0379 | 182 | 249 | 114 | 1.0000 | 0.6264 | 0: 114 |
| S5capo2 (capo not told) | notes | e0380 | 90 | 90 | 90 | 0.0000 (from nut: 0.6000) | 0.0000 | -1: 36, 0: 54 |
| S5capo2 (capo not told) | groups | e0381 | 90 | 195 | 63 | 0.0000 (from nut: 0.5238) | 0.0000 | -1: 30, 0: 33 |
| S5capo2, notes moved down 2, frets read from capo 2 | notes | e0392 | 90 | 90 | 90 | 0.7556 | 0.7556 | 0: 68, +1: 22 |
| S5capo2, same workaround | groups | e0393 | 90 | 238 | 54 | 1.0000 | 0.6000 | 0: 54 |
| S5dropd (tuning cannot be told) | notes | e0382 | 90 | 86 | 86 | 0.5814 | 0.5556 | 0: 64, +1: 22 |
| S5dropd | groups | e0383 | 90 | 238 | 52 | 1.0000 | 0.5778 | 0: 52 |
| R1a | notes | e0384 | 189 | 189 | 189 | 0.5767 | 0.5767 | -2: 20, -1: 57, 0: 109, +1: 3 |
| R1a | groups | e0385 | 189 | 271 | 95 | 0.4842 | 0.2434 | -2: 8, -1: 41, 0: 46 |
| R1b | notes | e0386 | 70 | 70 | 70 | 0.7857 | 0.7857 | -1: 14, 0: 55, +1: 1 |
| R1b | groups | e0387 | 70 | 73 | 68 | 0.6618 | 0.6429 | -1: 22, 0: 45, +1: 1 |
| R1c | notes | e0388 | 148 | 148 | 148 | 0.7770 | 0.7770 | -1: 8, 0: 115, +1: 25 |
| R1c | groups | e0390 | 148 | 238 | 100 | 0.7600 | 0.5135 | -1: 19, 0: 76, +1: 5 |
| R1b | notes, `max_fret=5` | e0394 | 70 | 69 | 69 | 0.4638 | 0.4571 | -1: 37, 0: 32 |

- What "groups" does to chords, read from `candidates.match_chord_template` and seen in the output: a `ChordEvent` is
  replaced by a whole template shape, keeping only the template's strings and frets, when the event's pitch classes
  are a subset of the template's (or the reverse, or share at least 2). So the S2n bass-and-melody dyad G2 + G3 (pitch
  classes {G}) became `Em7_open` (`{'1': 0, '2': 0, '3': 0, '4': 0, '5': 2, '6': 0}`, six notes); templates used most
  in S2n: Em7_open 16, Am7_open 14 of the 42 chord states. Tab notes out exceed notes in (S2n 238 for 90; S3 249 for
  182). Events with no candidate are dropped without a message (`optimize_sequence`: "No valid candidates for this event
  ... we handle it by skipping this event"): R1a groups 94 events in, 82 states out; S5dropd notes: the 4 D2 notes
  (below standard tuning) dropped; R1b with `max_fret=5`: 1 note dropped.
- Output excerpt, S2n groups, first state of `S2n.truthmidi.groups.tabsynth.json`: `{"index": 0, "start": 2.142856,
  "duration": 0.5256693625, "kind": "chord", "strings": [1, 2, 3, 4, 5, 6], "frets": {"1": 0, "2": 0, "3": 0, "4": 0,
  "5": 2, "6": 0}, "mean_fret": 0.33, "min_fret": 0, "max_fret": 2, "requires_barre": false, "chord_id": "Em7_open"}`.
- Output format facts: `render_json`: list of states `{index, start (s), duration (s), kind: "note"|"chord", strings,
  frets: {"<string 1-6>": fret}, mean_fret, min_fret, max_fret, requires_barre, chord_id}`; `render_ascii`: a header
  "Guitar Tablature" and six lines `e|`, `B|`, `G|`, `D|`, `A|`, `E|` (string 1 on top), one column group per state, no
  bar lines, no rhythm; `render_compact` also exists (not used). No MIDI pitch in the output (it is implied by standard
  tuning + fret).
- Input format facts: Python objects only (no file reader): pitch in Hz, start and duration in seconds, non-negative
  start, positive duration (the constructors raise `ValueError` otherwise).
- Constraint inputs: `max_fret` (default 15 in `events_to_tablature`), `tolerance_cents` (pitch match tolerance,
  default 50; relevant to detuned input such as S7flat30, not tried), `templates` (the chord-shape list can be replaced).
  Tuning: `STANDARD_TUNING_HZ` is used whenever no fretboard is passed, and neither `events_to_tablature` nor
  `optimize_sequence` passes one, so the pipeline has no tuning or capo input; `generate_candidates` alone accepts a
  `fretboard`. No hand-span, position or pinned-note input.

## tutts 0.1.0 (npm, TypeScript port of tuttut)

- What it is: "Renderer-neutral MIDI→guitar-tab fingering engine. A from-scratch, idiomatic TypeScript port of tuttut's
  algorithm" (README), by Madison Rickert, npm `tutts` 0.1.0 (registry `time.modified` 2026-06-09), repository
  `git+https://github.com/madisonrickert/tutts.git` (directory `packages/core`), `"license": "MIT"` in package.json.
  ESM only, zero runtime dependencies, Node >= 18. The README lists three deliberate divergences from tuttut (notes at
  the clip end kept; unplayable chords emitted as empty events; the first chord seeded with the easiest fingering).
- Install: `npm install tutts@0.1.0` in `/home/user/gtr/lanes/guitar-tab/node-tutts` ("added 1 package", 124 KB).
  Node v22.23.4. `samples/tutts/npm-ls.txt`.
- How it was called: `scripts/run_tutts.py` (glue) converts the MIDI to tutts' note model `{midi, startBeats,
  durationBeats}` (ticks / ticks-per-beat), passes the MIDI's time signatures and first tempo, and runs
  `scripts/run_tutts.mjs`, which calls `generateTab({notes, tuning: new Tuning([names thin->thick], nfrets), tempo,
  timeSignatures, quantizeGrid?})` and writes `tab.data` (JSON) and `tab.toAscii({maxWidth: 120})`. The glue maps each
  event's `beats` back to the MIDI's seconds for gtr-eval.
- Runs: r0205 (`scripts/batch_tutts.sh`, 11 runs, `gtr-run --nolock`, light job; wall 7.59 s for all 11 including
  Python and Node start-ups, CPU 3.2 s, peak RSS 62.1 MB). `generateTab` itself: 51.3 ms on S2n in the trial agent's
  smoke test (UNVERIFIED: not in any log); in the verifier's re-run r0469 (`--nolock`) the script printed 151.6 ms for
  R1c with `quantizeGrid: "1/16"` and 43.6 ms for S5dropd with Drop D.
- Results (time-based tab matching):

| clip | settings | eval id | truth | out | matched | same string+fret / matched | string diff counts |
|---|---|---|---|---|---|---|---|
| S1 | standard tuning, 20 frets | e0401 | 62 | 62 | 62 | 1.0000 | 0: 62 |
| S2n | same | e0402 | 90 | 90 | 90 | 1.0000 | 0: 90 |
| S3 | same | e0403 | 182 | 182 | 182 | 1.0000 | 0: 182 |
| S5capo2 | capo not told | e0404 | 90 | 90 | 90 | 0.0000 (same string 0.6000) | -1: 36, 0: 54 |
| S5capo2 | tuning raised 2 semitones, 18 frets (capo workaround) | e0409 | 90 | 90 | 90 | 1.0000 | 0: 90 |
| S5dropd | Drop D not told | e0405 | 90 | 90 | 86 | 0.8372 | 0: 86 |
| S5dropd | `new Tuning(["E4","B3","G3","D3","A2","D2"], 20)` | e0410 | 90 | 90 | 90 | 0.9778 | 0: 88, +1: 2 |
| R1a | standard | e0406 | 189 | 189 | 189 | 0.5291 | -2: 22, -1: 67, 0: 100 |
| R1b | standard | e0407 | 70 | 70 | 70 | 0.4429 | -1: 39, 0: 31 |
| R1c | standard | e0408 | 148 | 148 | 148 | 0.8108 | -1: 27, 0: 120, +1: 1 |
| R1c | `quantizeGrid: "1/16"` | e0411 | 148 | 145 | 139 | 0.8201 | -1: 17, 0: 114, +1: 8 |

- Compared note by note with tuttut 0.0.7 (a short Python check over the two output files): for S1, S2n, S3, S5capo2,
  R1a, R1b, R1c and S5dropd the (onset, pitch, string, fret) lists are identical (the verifier repeated this and also
  found the capo and Drop D runs identical). Two of the README's three divergences describe an earlier tuttut: the
  tuttut 0.0.7 code (uploaded 2026-11-04; tutts 0.1.0 is from 2026-06-09) seeds the first chord with easiness
  (`easiness = [1 / compute_isolated_path_difficulty(...)]`), first reduces an unplayable chord
  (`get_fingerings_with_reduction`, see the handoff section) and leaves out of the Viterbi path any chord still
  without a fingering (`valid = [i for i, obs in enumerate(notes_sequence) if obs != -1]` in `_run_viterbi`); read
  by the verifier. In S5dropd without the tuning, tutts
  also writes the 4 D2 notes an octave up (no output pitch below 40), so they do not match the truth pitch.
- With `quantizeGrid: "1/16"` on R1c, 145 notes come out of 148. Traced by the verifier: tutts 0.1.0 (`dist/index.js`,
  `buildTimeline`) snaps every onset to the grid (`Math.round(beats / grid) * grid`) and groups notes by the snapped
  onset, then keeps each pitch once per event (`[...new Set(entry.notes.map((n) => n.midi))]`). In R1c's input three
  grid points each receive two B3 (MIDI 59) notes (in the truth, B3 on string 2 open and on string 3 fret 4, 3 to
  10 ms apart, at 0.78, 1.26 and 1.75 s), so 3 notes are dropped; no event came out empty. The snapping moved the 148 onsets by a median 17.9 ms and at most
  56.2 ms (|round(startBeats / 0.25) x 0.25 - startBeats| x 60 / 119 BPM, computed from
  `R1c.truthmidi.q16.tutts.in.json`); 6 moved more than the 50 ms matching tolerance. The matched count is 139 (e0411).
- Output format facts: `TabData` JSON `{tuning: [MIDI, thin->thick], measures: [{events: [{beats, measureTiming,
  seconds?, timeSignatureChange?, notes?: [{string (0 = thinnest), fret, midi, durationBeats, degree, octave}]}]}]}`;
  `seconds` is present only when `tempo` is given; ASCII via `toAscii({maxWidth, timeSignature})`. Unlike tuttut's JSON,
  every note carries its MIDI pitch and its duration in beats.
- Input format facts: notes in quarter-note beats (`{midi, startBeats, durationBeats}`, "the Ableton-native
  projection"); no file reader.
- Constraint inputs: `tuning` (`new Tuning([...], nfrets)`, any number of strings, presets `Tuning.standardGuitar()`,
  `Tuning.ukulele()`), `timeSignatures`, `weights` (`b` must be > 0), `tempo`, `quantizeGrid`. No capo (raised-tuning
  workaround above), no span, position or pinned-note input.

## PyGuitarPro 0.11 as glue: tool output to Guitar Pro 5 (my glue code, not a tool's own output)

- `scripts/gtreval_to_gp5.py` (about 50 lines, mine) writes any of this lane's string/fret note lists as a Guitar Pro 5
  file with PyGuitarPro 0.11 (LGPL-3.0-only per the docs lane): one 6-string track, `Track.strings` from the list's
  tuning, the capo as `Track.offset`, every onset snapped to a 16th-note grid at a given tempo, one 16th-note beat per
  onset group, 16th rests in between, 4/4 bars. String, fret and order are kept; durations are not the played ones.
- Converted (2026-11-10, not timed; not run through `gtr-run`): tuttut S2n (default), tuttut S5capo2 with the capo
  workaround, tuttut S5dropd with Drop D, LilyPond S5dropd with Drop D, all at 112 BPM. Files: 3,158 to 3,170 bytes
  each, `samples/pyguitarpro-glue/*.gp5`.
- Read back with `gtr-eval tab` (PyGuitarPro reader, time from the beat positions and the song tempo): tuttut S2n e0430
  90/90 matched, same string+fret 1.0000, tuning and capo "stated in the estimate file" as [40..64] / 0; tuttut S5capo2
  e0431 90/90, 1.0000, capo read back 2; tuttut S5dropd e0432 90/90, 0.9778, tuning read back [38, 45, 50, 55, 59, 64];
  LilyPond S5dropd e0433 90/90, 1.0000. So capo and tuning survive the GP5 round trip, and on these synthesized clips
  (constant tempo, onsets on a 16th grid) the snapped times still match the truth within 50 ms.
- Whole chain from audio to a Guitar Pro file (audio -> Basic Pitch MIDI from the audio-to-notes lane -> tuttut ->
  this glue), read back with `gtr-eval tab`: S2n at 112 BPM e1088: 136 of the 137 tuttut notes written (one lost where two
  notes fell on the same string in the same 16th slot; the glue keeps the first), 90 of 90 truth notes matched, same
  string+fret 0.9889; S5capo2 with the capo told, e1090: 139 written, capo read back 2, 90 matched, 1.0000; R1c at the
  take's 119 BPM, grid starting at 0 s, e1092: 151 of 153 written, 112 matched (117 before snapping, e0727), 0.8036. On
  R1c the fixed 16th grid moved some onsets more than 50 ms; a beat grid taken from the recording (chords-beats-key
  lane) was not used. Files: `samples/pyguitarpro-glue/bp-tuttut_*.gp5`.

## Tools NOT RUN here, with the reason

Permission note that applies to several entries: this session's permission system refused, twice, to install code
from a GitHub repository (`uv pip install -e <clone of xavriley/hf_midi_transcription>` and later
`uv pip install <clone of DanieleMorotti/guitab>`), each time with "Permission for this action was denied by the Claude
Code auto mode classifier. Reason: [Code from External]". Packages from PyPI and npm installed normally. After the second
refusal no other repository-only tool was installed or executed. Where a repository-only tool's model could be loaded
with PyPI code and my own few-line loader, that is said in its section; otherwise the tool is listed here.
(Verifier's note: the refusal messages are the trial agent's report and no log of them is in the lane folder; the
files are consistent with it: the clones are in `/home/user/gtr/lanes/guitar-tab/src/`, and no environment for Guitab
or `hf_midi_transcription` exists under the lane folder.)

- **TabCNN, original code** (https://github.com/andywiggins/tab-cnn, HEAD `305c1a154b9dd1f13ab9bb157e42d4f8942ed0e3`,
  2019-06-27). Weights published: no. The repository holds `README.md`, `data/`, `demos/` (five demo videos) and
  `model/` (`TabCNN.py`, `DataGenerator.py`, `Metrics.py`); its README says to download GuitarSet and run
  `python model/TabCNN.py` to "train and test", after which "a folder for each fold of data will be created, containing
  the individual model's weights". Not trained here (CPU box). TabCNN outputs are on record through the SynthTab
  checkpoints above, which use amt-tools' re-implementation.
- **amt-tools 0.3.2** (PyPI, MIT per its metadata) itself publishes no trained model; it was installed and used as the
  inference framework for the SynthTab checkpoints (section above).
- **guitar-transcription-with-inhibition** (https://github.com/cwitkowitz/guitar-transcription-with-inhibition, HEAD
  `e611c1dc9b7340d35c9a697d1658b3b2afb3978a`, 2022-12-14). Weights published: none found. The README describes computing
  inhibition matrices and running `six_fold_cv_scripts/experiment.py`, which writes "`models/` - folder containing saved
  model and optimizer state at each checkpoint"; no download of a trained model is linked. Not trained here.
- **FretNet** (https://github.com/cwitkowitz/guitar-transcription-continuous, HEAD
  `d481054f54184374c04b1cc27a487dc35c87f353`, 2023-06-03). Weights published: none found. README "Usage" section reads
  "TODO"; `examples/inference.py` loads `os.path.join(tools.HOME, 'Downloads', 'FretNet', 'models', 'fold-0',
  'model-2000.pt')`, a file that neither the README nor the repository links to. Not trained here.
- **High Resolution Guitar Transcription / GAPS models, as the `hf_midi_transcription` package**
  (https://github.com/xavriley/hf_midi_transcription, HEAD `96f6797881e9497cbfc8f8e5deccea9c1f2f7adc`, 2026-01-27):
  the package is not on PyPI (`pypi.org/pypi/hf-midi-transcription/json` answered "not found" on 2026-11-10, although
  its README says `pip install hf-midi-transcription`) and installing the clone was refused (above). Its `guitar-fl.pth`
  checkpoint was run with PyPI code instead (section "Riley et al. guitar checkpoints" below); `guitar-gaps.pth` waited
  for a CPU slot and was not run by the trial agent; the verifier ran it on S2n with the same PyPI code (same section).
- **Guitab 1.2.0** (https://github.com/DanieleMorotti/guitab, HEAD `b2537dcd1ad68fa2c1cde35496a353b0a33081d6`,
  2026-10-31): audio to Guitar Pro 5 with string and fret, `--capo N`, CPU allowed. Weights published: yes,
  https://huggingface.co/danmor/guitab (`guitab_e25.safetensors` 24,776,472 bytes, `guitab_e24` 11,766,560,
  `guitab_e19` 95,327,424, ONNX copies, Beat This! ONNX 3.8 and 22.1 MB, `tablm.safetensors`, `chord_model`; sizes
  re-read from the Hugging Face API by the verifier, card `license: cc-by-nc-sa-4.0`). It is not on PyPI under its own
  name: `pypi.org/pypi/guitab/json` is a different project (bielsnohr/guitab 1.0.0, BSD 3-clause, uploaded
  2022-01-13; checked by the verifier). NOT RUN HERE: installing it (from the clone, with its git dependency
  `beat-this @ git+https://github.com/CPJKU/beat_this@b95c8ab`) was refused by the permission system as described
  above (the trial agent reports that `uv pip install --dry-run` had resolved it to 9 new packages, including
  onnxruntime 1.31.1 and torchaudio 2.11.1+cpu; UNVERIFIED: no log of the dry run was kept). Steps for Aaron are in
  `for-aaron.md`.
- **Noise2Fret** (https://github.com/RiccardoVib/Noise2Fret, HEAD `b65a7ecfb849d49d8ae6a0df6d0a2937c3334cd7`,
  2026-10-14, MIT): diffusion audio-to-tab (arXiv 2608.30854; the arXiv record's Comments field reads "Accepted for
  ISMIR 2026", and the repository README lists the paper as "(ISMIR26)"; both read by the verifier 2026-11-10).
  Weights published: yes, on Zenodo record
  23361924 ("The repository collects the checkpoints for the pre-trained models"; `CheckpointsGOAT.zip` 111,317,004
  bytes, `CheckpointsGuitarSet.zip` 111,488,115 bytes; record license id `cc-by-4.0`), linked from
  `Noise2Fret_Aux_Losses/README.md`. NOT RUN HERE: the README's only inference route is its training scripts with
  `TRAIN_MODEL=False` (`run_GS.sh` / `run_GOAT.sh`) over dataset folders built by its `BuildDataset.py` scripts, so
  running it on the shared clips means running the repository's own Python, which was not attempted after the two
  refusals above. Weights not downloaded. Steps for Aaron are in `for-aaron.md`.
- **gtrsnipe** (https://github.com/scottvr/gtrsnipe): not on PyPI (`pypi.org/pypi/gtrsnipe/json` "not found",
  2026-11-10); its README installs with `pip install -e .`. Not attempted, for the reason above.
- **Audio2Tab** (https://github.com/JackJamesLoth/Audio2Tab): README (main branch, read 2026-11-10 via
  raw.githubusercontent.com) describes training (`src/train.py`) and evaluating checkpoints the user supplies
  (`--checkpoint_paths ...`); no checkpoint download was found in it. Its "Checkpoints" section reads "We will host a
  checkpoint here soon!" (re-read by the verifier from raw.githubusercontent.com, main branch, 2026-11-10). Not run.
- **GuitarTab** (https://github.com/MusicGuitarTab/GuitarTab): README describes training on DadaGP and loading
  `outputs/<exp_dir>/best_model.pt` from your own training run; no published checkpoint found in it. Not run.
- **Guitar-Transcription-CNN-MTL** (found here on the Hugging Face API, not in the survey list at the time):
  https://huggingface.co/MehmetErenn0/guitar-transcription-cnn-mtl (card `license: mit`, last modified 2026-10-12). The
  card: "Pretrained weights for the proposed configuration from the Guitar-Transcription paper, "Automatic Guitar
  Tablature Transcription using Dual Representation Feature Fusion and Instrument Informed Multi-Task Learning."", code
  at github.com/ErenReyhanlioglu/Guitar-Transcription; the folder holds "the six-fold leave-one-player-out
  cross-validation run" with one `model_best.pt` per fold ("Model weights only (state_dict)"); the card reports
  "tablature F1 0.776, TDR 0.943" (the authors' figure). Weights published: yes. NOT RUN HERE: the model class lives in
  the GitHub repository, which would have to be installed or executed (see the permission note above). The card
  says "Fold i was tested on GuitarSet player i (00 to 05) and validated on player i+1", and its per-fold table lists
  folds 1 to 6 with test players 00 to 05 (read by the verifier from the card on huggingface.co, 2026-11-10), so the
  folds whose test player is an R1 clip's player are fold 3 (R1a, player 02), fold 5 (R1b, player 04) and fold 1 (R1c,
  player 00).
- **Fretting-Transformer** (arXiv 2506.14223) and **MIDI-to-Tab** (arXiv 2408.05024): the arXiv HTML pages
  (`arxiv.org/html/<id>v1`, fetched 2026-11-10) contain no GitHub, Hugging Face or Zenodo link other than arXiv's own;
  a web search found no code release (the verifier re-fetched both HTML pages and repeated one web search per paper on
  2026-11-10: no code repository or checkpoint link found). Not run.
- **TART** (arXiv 2510.02597 and 2609.11904): the text of both PDFs (pdftotext, 2026-11-10) contains no GitHub, Hugging
  Face or Zenodo link to code or weights (only references to other works). Not run.
- **music21 10.5.2 `tablature` module**: not a string/fret assignment tool. It maps positions to pitches
  (`FretBoard.getPitches()` with a tuning), and `ChordWithFretBoard.getFretNotesFromFigure()` is a stub (docstring
  "TODO", body `return None`; the constructor's call to it is commented out "uncomment when
  self.getFretNotesFromFigure() works"). Nothing to run for pitch-to-position.
- **TuxGuitar 1.5.6, MuseScore 3.2.3** (both installed on the box, not by this lane; `dpkg -l`): the MIDI-to-Tab paper
  used MuseScore, TuxGuitar and Guitar Pro 8 as comparison systems for producing tablature from MIDI (arXiv 2408.05024
  HTML). No command-line conversion with string assignment was tried here (the web-tab-render lane covers these
  programs); GUI steps are in `for-aaron.md`.

## Riley et al. guitar checkpoints (huggingface.co/xavriley/midi-transcription-models), run with Kong's PyPI package

- What it is: guitar fine-tunes of Kong et al.'s high-resolution piano transcription CRNN
  (`Regress_onset_offset_frame_velocity_CRNN`; the package's `config.py`: `sample_rate = 16000`, `classes_num = 88`
  from `begin_note = 21`, `frames_per_second = 100`), published in the Hugging Face model repository
  https://huggingface.co/xavriley/midi-transcription-models (card YAML `license: mit`; API `lastModified`
  2026-08-22). The card lists "Code: https://github.com/xavriley/hf_midi_transcription/", "Paper (guitar 1):
  https://arxiv.org/pdf/2402.15258" (High Resolution Guitar Transcription via Domain Adaptation, ICASSP 2024) and
  "Paper (guitar 2): https://arxiv.org/abs/2408.08653" (GAPS, ISMIR 2024). Files: `guitar-fl.pth` (98,916,957 bytes,
  SHA-256 `50d93dba89bdd3401849bc735614478e83d9f46d21fa3f71d8aca5acc0a52028`) and `guitar-gaps.pth` (99,178,877 bytes,
  SHA-256 `65483e7c0e340a90415b15b520687587698c8c728f5fa470a205f13ee45c6513`); the code's `instruments.json` describes
  them as "Guitar transcription model trained on Francois Leduc dataset" and "Guitar transcription model (default:
  GAPS)". These models output notes only (pitch, onset, offset, velocity), no string or fret, so they are the "guitar
  notes" half of Family A; string and fret come from a MIDI-to-tab tool afterwards (below).
- Training data, from the papers (read 2026-11-10 from the arXiv PDFs): 2402.15258 reports "Ours (FL)" and "Ours
  (GS+FL)", with the table note "FL refers to our dataset (François Leduc) and GS refers to GuitarSet where these were
  used as training data"; 2408.08653: "For our experiments, we trained 2 sets of models. The first set of models is
  trained only on the GAPS dataset and the second set of models is trained with a combination of GuitarSet and GAPS."
  Neither the card nor `instruments.json` says which of these runs the two files are, so whether they saw GuitarSet
  (and so the R1 takes) is UNVERIFIED. The checkpoints store `iteration` = 100000 (`guitar-fl.pth`, printed by the run;
  `guitar-gaps.pth` stores 5000, printed by the verifier's run r0499)
  and the folder name inside `guitar-gaps.pth` is `5000_iterations` (pickletools listing; re-checked by the verifier on
  a fresh download with the same SHA-256: every one of the 244 archive members is under `5000_iterations/`); the
  repository also has a separate `guitar-gaps-paper-version-12200_iterations.pth` (99,256,753 bytes), not used here,
  and a `guitar_kroma.safetensors` (49,360,574 bytes) that neither the card nor `instruments.json` describes (file list
  from the Hugging Face API, read by the verifier; not looked at further).
- Install: no code from the GitHub repository was run (its own install was refused, see "Tools NOT RUN here"). Into
  the existing torch venv: `uv pip install --python .../venv-amt/bin/python piano-transcription-inference==0.0.6`
  (adds torchlibrosa 0.1.0; torch 2.15.0+cpu and librosa 0.11.0 reused). Weights downloaded with curl from
  `huggingface.co/xavriley/midi-transcription-models/resolve/main/<file>` (about 99 MB each). What
  `hf_midi_transcription` does (read from its source): `PianoTranscription("Regress_onset_offset_frame_velocity_CRNN",
  device, checkpoint_path, segment_samples=10 * 16000, batch_size)` from xavriley's fork of
  `piano_transcription_inference`, with audio from `librosa.load(path, sr=16000)`. Diff of the fork against PyPI 0.0.6
  (files fetched from raw.githubusercontent.com): `models.py` differs only in a dropout `inplace` flag, `utilities.py`
  in librosa API spellings, `config.py` and `pytorch_utils.py` are identical, and `inference.py` adds constructor
  arguments whose defaults equal PyPI's fixed values (onset 0.3, offset 0.3, frame 0.1, pedal offset 0.2) and loads with
  `weights_only=False`. (The verifier repeated this diff against a clone of the fork at `7568dc7`, 2025-12-09: the same,
  plus three differences not listed above: the fork drops PyPI's re-download when the checkpoint is under 1.6e8 bytes,
  accepts `mps` as a device, and passes its `batch_size` to `forward`, where PyPI 0.0.6 passes 1; the
  `hf_midi_transcription` CLI's default batch size is 8, this lane's glue used PyPI's 1.) `scripts/run_hfmt_guitar.py` (my glue) does not use PyPI's `PianoTranscription.__init__`,
  because that re-downloads the piano model when the checkpoint file is under 160 MB (`os.path.getsize(checkpoint_path)
  < 1.6e8`): it builds the model class, loads `checkpoint['model']` with `torch.load(weights_only=True)` and an
  allow-list (OrderedDict, numpy ndarray reconstruction, dtypes), reports `load_state_dict(strict=False)`'s missing and
  unexpected keys (0 and 0 for `guitar-fl.pth`), sets the same attributes and calls PyPI's `transcribe()`. Freeze:
  `samples/riley-guitar-crnn/uv-pip-freeze.txt`.
- Runs: an unlogged smoke test of `guitar-gaps.pth` on S1 outside `gtr-run` was stopped by my 280 s `timeout` before it
  finished (box load average about 15 at the time; not a measurement). `guitar-fl.pth`: r0331, one `gtr-run` call,
  2 cores (0-1), clips S2n and R1c (`scripts/batch_hfmt.sh`), wall 400.85 s, CPU 286.74 s, peak RSS 943.9 MB, load
  average 8.94 at start. Per clip: S2n load 4.94 s + transcription 216.80 s (29.4 s of audio), R1c load 6.22 s +
  transcription 165.55 s (28.2 s of audio). The verifier's re-run of the R1c item (r0494, 2 cores 2-3, load average
  5.21 at start) printed load 3.58 s + transcription 22.87 s (process wall 28.96 s, run CPU 37.98 s) and wrote a
  byte-identical MIDI file and CSV: the same R1c transcription on the same input took 165.55 s in r0331 and 22.87 s
  in r0494, both on 2 pinned cores. What else was running on r0331's cores was not recorded.
- Results, `guitar-fl.pth` (notes: `gtr-eval notes`, onset within 50 ms and pitch within 50 cents):
  S2n e1224: 90 notes out, 89 of 90 matched, P 0.9889, R 0.9889, F1 0.9889; onset+offset F1 0.3222; recall by voice:
  bass 48/48, melody 41/42; matched onsets a median 13.95 ms late (largest 22.1 ms). R1c e1274: 133 notes out, 125 of
  148 matched, P 0.9398, R 0.8446, F1 0.8897; onset+offset F1 0.4057.
- Handoff to tab (these MIDI files, velocity-0 note-ons rewritten as note-offs and merged to one track, into tuttut
  0.0.7 with default settings; r0326 and r0332, `--nolock`, under 1 s each): S2n e1225: 89 matched, same string+fret /
  matched 1.0000, / truth 0.9889; R1c e1275: 125 matched, same string+fret / matched 0.8320, / truth 0.7027, string
  differences -1: 18, 0: 104, +1: 3. The same MIDI into LilyPond 2.24.3 with defaults (r0356, `--nolock`, wall 9.82 s
  for both): S2n e1344: 89 matched, 1.0000 / 0.9889; R1c e1345: 125 matched, 0.8720 / 0.7365 (-1: 14, 0: 109, +1: 2).
- Output format facts: a type-1 MIDI file, 384 ticks per beat, 2 tracks (tempo/time signature, then the notes), notes as
  `note_on` with velocity and `note_on` velocity 0 as note-off, no pedal events from this model class, no pitch bends;
  my glue also writes `<clip>.<ckpt>.notes.csv` (`onset,offset,pitch,velocity`, seconds and MIDI numbers). First rows
  of R1c: `4.029094,4.580000,40,100`, `4.585752,5.290000,40,99`, `5.303260,6.100000,40,99`.
- Input format facts: any file librosa reads, resampled to 16 kHz mono; processed in 10 s segments.
- Constraint inputs: none for tuning, capo or range (88 piano keys from A0); the thresholds (onset 0.3, offset 0.3,
  frame 0.1) are the only settings, exposed as constructor arguments in the fork and fixed in PyPI 0.0.6.
- `guitar-gaps.pth`: not run by the trial agent (the verifier's S2n run follows below). A first `gtr-run` call for
  S2n, S3, R1b and R1c waited about 30 minutes for a CPU
  slot without getting one and was cancelled; a second call for S2n and R1c waited 37 minutes (until 22:36 UTC) and was
  cancelled too, so the lane could finish in its time budget (neither left a ledger line). The checkpoint was
  downloaded and its pickle inspected (above); it was not run, and the file was deleted afterwards to free disk. Steps for Aaron (the authors' own command on a GPU) are
  in `for-aaron.md`, section 2. (Verifier's note: the files fit this account: `gtr-run` writes its ledger line only
  after the command has run, and the two log files `logs/hfmt_gaps_cancelled.log` and `logs/hfmt_gaps_cancelled2.log`
  are empty, created at 21:28 and 21:59 UTC. `gtr-run` waits for a slot by polling every 0.4 s, not in a queue, so a
  later call can take a freed slot first, as r0331 did at 21:51 after 9.2 s. The verifier's own slot runs waited
  608.4 to 1380.3 s between 22:47 and 23:11 UTC, while the source-separation and video-hands-fretboard lanes' jobs
  held the slots.)
- (run by the verifier) `guitar-gaps.pth` on S2n, S3, R1b and R1c (the clips of the trial agent's cancelled calls),
  with the trial agent's `scripts/run_hfmt_guitar.py` unchanged and the checkpoint re-downloaded (same SHA-256 as
  above). Runs: r0499, S2n (2 cores 2-3, after 608.4 s waiting for a slot; wall 21.28 s, CPU 34.33 s, peak RSS
  919.1 MB, load average 4.29 at start); r0505, S3, R1b and R1c in one call (2 cores 2-3, no wait; wall 87.17 s, CPU
  112.21 s, peak RSS 948.0 MB, load average 3.20). The script printed `iteration` 5000 and 0 missing and 0 unexpected
  keys each time; load + transcription: S2n 3.72 + 15.03 s, S3 3.11 + 22.82 s, R1b 3.73 + 25.02 s, R1c 4.63 + 19.97 s.
  Each MIDI file was merged to one track with velocity-0 note-ons rewritten as note-offs and given to tuttut 0.0.7 and
  LilyPond 2.24.3 with defaults (r0500 for S2n, wall 3.54 s; r0506 for the other three, wall 7.31 s; both `--nolock`).
  Scores (`gtr-eval notes`: onset within 50 ms, pitch within 50 cents; `gtr-eval tab`: same matching, then string and
  fret):

| clip | notes eval id | notes out | matched / truth | P / R / F1 | onset+offset F1 | tuttut tab eval id: same string+fret / matched, / truth | LilyPond tab eval id: same string+fret / matched, / truth |
|---|---|---|---|---|---|---|---|
| S2n | e1428 | 90 | 90 / 90 | 1.0000 / 1.0000 / 1.0000 | 0.6000 | e1430: 1.0000, 1.0000 | e1432: 1.0000, 1.0000 |
| S3 | e1436 | 208 | 172 / 182 | 0.8269 / 0.9451 / 0.8821 | 0.6667 | e1440: 1.0000, 0.9451 | e1441: 1.0000, 0.9451 |
| R1b | e1437 | 69 | 61 / 70 | 0.8841 / 0.8714 / 0.8777 | 0.3885 | e1442: 0.4098, 0.3571 (-1: 36, 0: 25) | e1443: 0.4098, 0.3571 (-1: 36, 0: 25) |
| R1c | e1438 | 130 | 121 / 148 | 0.9308 / 0.8176 / 0.8705 | 0.1727 | e1444: 0.8760, 0.7162 (-1: 15, 0: 106) | e1445: 0.8926, 0.7297 (-1: 13, 0: 108) |

  S2n recall by voice: bass 48/48, melody 42/42; its matched onsets are a median 8.37 ms late (largest 14.7 ms). Whether
  this checkpoint was trained with GuitarSet, and so may have seen the R1 takes, is UNVERIFIED (see "Training data"
  above). Output: type-1 MIDI, 384 ticks per beat, 2 tracks, as for `guitar-fl.pth`. Scripts:
  `scripts/verify-trials/post_gaps.sh`, `gaps_more.sh`, `post_gaps_more.sh`. Files: `samples/verify-trials/`
  (`S2n.guitar-gaps.mid`, `S2n.guitar-gaps.notes.csv`, `tuttut_S2n.guitar-gaps.txt`); the rest under
  `/home/user/gtr/lanes/guitar-tab/verify-trials/hfmt/`.

## Handoff runs: transcribed notes in (Basic Pitch MIDI from the audio-to-notes lane into the MIDI-to-tab tools)

- Input: the audio-to-notes lane's Basic Pitch 0.4.0 output, configuration `tflite-default` (Python API, TFLite model,
  default thresholds), run r0234 in that lane (one `gtr-run` batch, wall 207.81 s, exit 0; their `trials.md` has the
  details), files `/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/tflite-default/<clip>.mid`. Copied unchanged to
  `/home/user/gtr/lanes/guitar-tab/inputs/bp-a2n/<clip>.bp.mid` (SHA-256 in
  `samples/handoff-basicpitch/basic-pitch-input-SHA256SUMS.txt`) and merged to one track with `scripts/merge_midi.py`
  (the files are type 1 with 2 tracks, 220 ticks per beat, one tempo of 120 BPM, and close notes with velocity-0
  note_on messages; they also carry pitch-bend messages, 12 to 1,385 per file (verifier's count with mido), which none
  of the glue scripts or tools here read: they take note numbers only).
  A Basic Pitch run of this lane's own (`scripts/batch_basicpitch.sh`, ONNX model in a Python 3.10 venv with
  `basic-pitch[onnx]==0.4.0`, `numpy<2` and `setuptools<70`, the last needed because resampy imports `pkg_resources`)
  waited about 19 minutes for a CPU slot and was cancelled once the audio-to-notes lane's files existed; it produced
  nothing. On Python 3.11 `basic-pitch` 0.4.0 requires `tensorflow<2.15.1` on Linux (its PyPI metadata), which is why
  3.10 was used.
- The notes going in, scored with `gtr-eval notes` (onset within 50 ms, pitch within 50 cents): S2n e0559: 137 notes,
  90 of 90 truth notes matched (P 0.6569, R 1.0000, F1 0.7930); S3 e0561: 197, 150 of 182 (P 0.7614, R 0.8242);
  S5capo2 e0562: 139, 90 of 90 (P 0.6475); S5dropd e0565: 130, 90 of 90 (P 0.6923); R1a e0569: 196, 137 of 189
  (P 0.6990, R 0.7249); R1b e0573: 76, 57 of 70 (P 0.7500, R 0.8143); R1c e0577: 156, 120 of 148 (P 0.7692, R 0.8108).
  (S1 was not scored as notes here.) Pitch range of the S2n file: MIDI 24 to 87 (one C1 and notes up to D#6).
- Runs: r0240 (`scripts/batch_bp_handoff.sh`: tuttut, tutts, tayuya, LilyPond, tabsynth `notes` and `groups` on 8
  clips, plus 8 constraint runs; `gtr-run --nolock`, light jobs; wall 95.24 s for all, CPU 38.23 s, peak RSS 98.2 MB)
  and r0242 (tayuya on the same MIDI with velocity-0 note_on rewritten as note_off by `merge_midi.py
  --vel0-to-noteoff`; wall 13.05 s).
- Results (`gtr-eval tab`, time-based; "matched" = truth notes that the tool's output pairs with, which is capped by
  what Basic Pitch found; the last column is same string+fret / all truth notes):

| clip | tool | eval id | truth | tab notes out | matched | same string+fret / matched | same string+fret / truth |
|---|---|---|---|---|---|---|---|
| S1 | tuttut / tutts / LilyPond | e0646 / e0648 / e0649 | 62 | 64 / 64 / 64 | 61 | 1.0000 each | 0.9839 each |
| S1 | tabsynth notes / groups | e0650 / e0651 | 62 | 64 / 68 | 61 | 0.8033 / 0.8033 | 0.7903 / 0.7903 |
| S1 | tayuya as is / note_off fixed | e0653 / e0656 | 62 | 128 / 64 | 61 | 0.0000 / 0.0000 | 0.0000 / 0.0000 |
| S2n | tuttut / tutts | e0658 / e0661 | 90 | 137 / 137 | 90 | 0.9889 / 0.9889 | 0.9889 / 0.9889 |
| S2n | LilyPond | e0663 | 90 | 136 | 90 | 0.9778 | 0.9778 |
| S2n | tabsynth notes / groups | e0665 / e0666 | 90 | 132 / 233 | 90 / 48 | 0.7889 / 1.0000 | 0.7889 / 0.5333 |
| S2n | tayuya | (crashed, see below) | 90 | none | | | |
| S3 | tuttut / tutts | e0667 / e0668 | 182 | 186 / 183 | 142 / 141 | 0.9296 / 0.9362 | 0.7253 / 0.7253 |
| S3 | LilyPond | e0670 | 182 | 185 | 139 | 0.7698 | 0.5879 |
| S3 | tabsynth notes / groups | e0672 / e0674 | 182 | 195 / 222 | 150 / 91 | 0.6800 / 0.8681 | 0.5604 / 0.4341 |
| S3 | tayuya as is / note_off fixed | e0676 / e0677 | 182 | 394 / 197 | 150 | 0.3133 / 0.1400 | 0.2582 / 0.1154 |
| S5capo2, capo not told | tuttut / tutts / LilyPond | e0678 / e0680 / e0683 | 90 | 139 / 139 / 138 | 90 | 0.0000 each | 0.0000 each |
| S5capo2, capo not told | tabsynth notes / groups | e0685 / e0687 | 90 | 135 / 215 | 90 / 62 | 0.0000 / 0.0000 | 0.0000 / 0.0000 |
| S5capo2, capo not told | tayuya as is / note_off fixed | e0689 / e0692 | 90 | 278 / 139 | 90 | 0.0000 / 0.0000 | 0.0000 / 0.0000 |
| S5capo2, capo told (raised tuning) | tuttut / tutts | e0732 / e0735 | 90 | 139 / 139 | 90 | 1.0000 / 1.0000 | 1.0000 / 1.0000 |
| S5capo2, capo told (raised `stringTunings`) | LilyPond | e0739 | 90 | 136 | 90 | 0.9556 | 0.9556 |
| S5capo2, notes moved down 2, frets read from capo 2 | tabsynth notes | e0743 | 90 | 135 | 90 | 0.8222 | 0.8222 |
| S5capo2, same workaround | tayuya as is | e0742 | 90 | 278 | 90 | 0.1556 | 0.1556 |
| S5dropd, tuning not told | tuttut / tutts / LilyPond | e0695 / e0698 / e0700 | 90 | 130 / 130 / 125 | 86 | 0.8372 each | 0.8000 each |
| S5dropd, tuning not told | tabsynth notes / groups | e0704 / e0705 | 90 | 122 / 230 | 86 / 47 | 0.6163 / 1.0000 | 0.5889 / 0.5222 |
| S5dropd | tayuya | (crashed, see below) | 90 | none | | | |
| S5dropd, Drop D told | tuttut / tutts | e0733 / e0737 | 90 | 130 / 130 | 90 | 0.9556 / 0.9556 | 0.9556 / 0.9556 |
| S5dropd, Drop D told | LilyPond | e0740 | 90 | 129 | 90 | 1.0000 | 1.0000 |
| R1a | tuttut / tutts / LilyPond | e0707 / e0709 / e0711 | 189 | 195 / 193 / 195 | 137 / 135 / 137 | 0.5037 / 0.4963 / 0.5037 | 0.3651 / 0.3545 / 0.3651 |
| R1a | tabsynth notes / groups | e0713 / e0715 | 189 | 196 / 283 | 137 / 94 | 0.5620 / 0.4149 | 0.4074 / 0.2063 |
| R1a | tayuya as is / note_off fixed | e0717 / e0719 | 189 | 392 / 196 | 137 | 0.3650 / 0.4526 | 0.2646 / 0.3280 |
| R1b | tuttut / tutts / LilyPond | e0720 / e0721 / e0722 | 70 | 76 each | 57 | 0.4211 / 0.4211 / 0.4561 | 0.3429 / 0.3429 / 0.3714 |
| R1b | tabsynth notes / groups | e0723 / e0724 | 70 | 76 / 90 | 57 / 54 | 0.6316 / 0.5185 | 0.5143 / 0.4000 |
| R1b | tayuya as is / note_off fixed | e0725 / e0726 | 70 | 152 / 76 | 57 | 0.4912 / 0.4737 | 0.4000 / 0.3857 |
| R1c | tuttut / tutts / LilyPond | e0727 / e0728 / e0729 | 148 | 153 / 152 / 155 | 117 / 117 / 119 | 0.7949 / 0.7949 / 0.7899 | 0.6284 / 0.6284 / 0.6351 |
| R1c | tabsynth notes / groups | e0730 / e0731 | 148 | 155 / 240 | 120 / 82 | 0.6750 / 0.7195 | 0.5473 / 0.3986 |
| R1c | tayuya | (crashed, see below) | 148 | none | | | |

  Full rows with string-difference counts: `samples/handoff-basicpitch/scores_bp_handoff.tsv` (eval id to tool in
  `scores_bp_handoff_named.json`, read from the gtr-eval ledger).
- What happened between the tools and Basic Pitch's MIDI:
  - tayuya counts every `note_on` message, including the velocity-0 ones that Basic Pitch's MIDI uses as note-offs, so
    it returned twice as many notes as Basic Pitch wrote (S1: 128 for 64; S3: 394 for 197). After rewriting them as
    `note_off` (same MIDI meaning; glue, r0242) the counts equal Basic Pitch's.
  - tayuya stopped with `UnboundLocalError: cannot access local variable 'note_info' where it is not associated with a
    value` (`tabs.py` line 58, `note_nearest_to_fret`) on S2n, S5dropd and R1c, in both runs: these files contain notes
    above D6, the top of its position table, and the code only has a fallback for notes in octave 2 or below (S2n and
    S5dropd: up to MIDI 87 = D#6; R1c: up to 94). The verifier fed tayuya a two-note MIDI file, C4 then D#6 (r0469):
    the same `UnboundLocalError`.
  - LilyPond printed `No string for pitch` warnings and left those notes out: for the C1 (MIDI 24) that Basic Pitch wrote
    in S2n, S3, S5capo2 and S5dropd, for D2 notes in S5dropd when the tuning was not told, and for some notes in chords
    it could not place (S3: 12 warnings in all, e.g. `No string for pitch #<Pitch g, > (given frets (7 5 5 4 3))`).
    Warnings per run, counted by the verifier in the `.lilypond.stderr.txt` files: S2n 1, S3 12, S5capo2 1, S5dropd 5
    (C1 and 4 D2), R1a 1 (F#2), R1c 1 (G2), S1 0, R1b 0; with the capo told 3 (C1 and 2 D4), with Drop D told 1 (C1).
    Each count equals notes in minus tab notes written in the table above. LilyPond was given no fret limit and wrote
    frets up to 30: in R1c's first chord the A#6 (MIDI 94) at string 1 fret 30 and the F#4 (MIDI 66) at string 6 fret
    26; in S2n and S5dropd the D#6 (MIDI 87) at string 1 fret 23. For the same notes tuttut and tutts moved the S2n D#6
    down an octave (below), and in R1c's first chord tuttut wrote one note, 82, and tutts none.
  - tuttut moved notes outside the instrument's range by octaves (`fix_oob_notes`), so its output contains pitches Basic
    Pitch did not write: in S2n the C1 (24) came out as C3 (48), C#6 (85) as C#5 (73) and D#6 (87) as D#5 (75); tutts
    did the same there. Both left out notes of chords they could not finger. S3 (197 notes in): the 6-note group at 17.518 s
    (MIDI 48, 52, 55, 60, 72, 76) and the 8-note group at 18.145 s: tutts wrote none of their 14 notes; tuttut wrote 2
    of the 6 and 1 of the 8 (missing in all: tuttut 12 notes, tutts 15, counting the C1 that both moved; 186 and 183 notes
    out). On R1c the group at 0.011 s (MIDI 43, 59, 66, 94) differs
    between the two: tuttut wrote one note (pitch 82), tutts none (153 vs 152 notes out). These lists come from a short
    Python comparison of input and output (onset, pitch) pairs. Cause, traced by the verifier: tuttut 0.0.7's
    `Fretboard.get_fingerings_with_reduction` ("Returns fingerings for a chord, dropping inner notes until it is
    playable. Keeps the bass (lowest) and melody (highest) notes as long as possible.") reduces these three chords to
    exactly (48, 76), (80) and (82, the 94 moved down an octave, at string 1 fret 18) when called on them directly;
    tutts 0.1.0 has no such reduction and writes the event with no notes, which its README gives as a divergence from
    tuttut ("Unplayable chords render as empty events, not phantom notes"). The "phantom notes" the README attributes to
    tuttut were not seen in these runs.
  - tabsynth silently dropped notes with no candidate position (S2n `notes`: 132 out of 137).
- The capo and tuning re-runs on transcribed notes: with the raised tuning (capo 2) tuttut and tutts put all 90 matched
  notes on the truth string and fret (e0732, e0735), and LilyPond 86 of 90 (e0739); with Drop D told, 86 of 90 (tuttut,
  tutts) and 90 of 90 (LilyPond). Without being told, every tool scored 0 same-string-and-fret on S5capo2 (frets counted
  from the nut) and matched at most 86 notes on S5dropd (the D2 notes are missing or an octave off).

## Constraint inputs across the tools run here (summary of the sections above)

"param" = a documented or code-level parameter, exercised in a run listed above; "workaround" = no parameter, but the
same effect was reached as described; "no" = neither. Every cell is backed by the tool's section.

| tool | tuning | capo | number of frets | hand span | preferred position | pin a note to a string/fret | output carries times |
|---|---|---|---|---|---|---|---|
| tuttut 0.0.7 | param `Tuning(strings)` (S5dropd e0048) | workaround: raised tuning (e0046) or notes transposed down | param `nfrets` | module constant `MAX_FRET_SPAN` (default 5; 3 and 6 ran on R1c, 7 failed an assertion) | no | no | yes (JSON `time`, seconds) |
| tutts 0.1.0 | param `new Tuning([...], nfrets)` (e0410) | workaround: raised tuning (e0409) | param `nfrets` | no | no | no | beats (seconds only if `tempo` given) |
| tayuya 0.0.4 | no (standard only) | workaround: notes transposed down (e0131) | no | no | no | no | no (order only) |
| LilyPond 2.24.3 | param `stringTunings` (e0181) | workaround: raised `stringTunings` (e0179) | no fret-count property used (frets up to 30 written on Basic Pitch notes) | `maximumFretStretch` (not varied) | param `minimumFret` (e0185, e0187, e0188, e0190); `restrainOpenStrings` (e0189) | param `note\N` string mark (r0155) | no (engraved output; times came from my glue) |
| tabsynth 1.0.6 | no in `events_to_tablature` (a `fretboard` only at `generate_candidates`) | workaround: notes transposed down (e0392) | param `max_fret` (e0394) | no (stretch is a cost term) | no (position preference is a cost term) | no | yes (`start`, `duration`, seconds) |
| SynthTab TabCNN checkpoints | no (trained profile, standard) | no | no (19 in the profile) | no | no | no | yes (frames, 23.2 ms hop) |

## Handoff run on real video audio without truth: R3a (Basic Pitch notes into tuttut and LilyPond)

- Input: the audio-to-notes lane's Basic Pitch `tflite-default` MIDI of R3a (the classical guitar concert excerpt,
  18 s; run r0234 in that lane), copied to `inputs/bp-a2n/R3a.bp.mid` (754 bytes, SHA-256
  `c77b5aec9c685db0c0d431ede06d42961c74357a057d5141e7ad37bbff4630a5`), 105 notes.
- Run r0301 (`gtr-run --nolock`, light job; tuttut default and LilyPond default; wall 4.5 s for both). No truth exists
  for R3a, so nothing is scored; these are output facts only.
- tuttut wrote all 105 notes: 31 on open strings, highest fret 10, notes per string (1 to 6): 22, 28, 18, 6, 16, 15.
  First notes (onset s, pitch, string, fret): (0.011, 40, 6, 0), (0.093, 59, 2, 0), (0.325, 47, 5, 2), (0.336, 54, 4, 4),
  (0.336, 59, 3, 4), (1.045, 57, 4, 7), (1.045, 61, 3, 6), (1.045, 73, 1, 9). LilyPond placed all 105 (67 chord groups,
  no warnings). The tuttut list was also written as Guitar Pro 5 with the glue at an assumed 120 BPM
  (`samples/pyguitarpro-glue/bp-tuttut_R3a.bp.gp5`, 102 of 105 notes written: 3 fell on an occupied string in the same
  16th slot). Files: `samples/handoff-basicpitch/R3a.bp.*`.
- R3b and R3c (closer views of the hands, added to the inputs at 21:29 UTC per `READY-VIDEO`) were not run by the
  trial agent, which reports that no Basic Pitch MIDI of them existed in the audio-to-notes lane's output folder when
  it wrote this, and that this lane's audio models were waiting for CPU slots. Verifier's note: the audio-to-notes
  lane wrote them at 21:42 UTC (run r0264) into a separate folder, `out/basic-pitch/tflite-default-R3bc/` (129 and 87
  notes), not into `tflite-default/` where the other clips are; links `out/basic-pitch/R3b.mid` and `R3c.mid` were
  added at 21:52 UTC.
- (run by the verifier) R3b and R3c, the same handoff as R3a: those two Basic Pitch files (SHA-256
  `8dac76232016363c3a59d31ee7ef1d4689f0423994b27845b7f9a7f591b9b446` and
  `642650358ba8ef68c0782949783e84947bd32ee64199b0eabd58f6b767e62618`) merged with
  `scripts/merge_midi.py`, then tuttut 0.0.7 and LilyPond 2.24.3 with defaults, run r0479 (`gtr-run --nolock`, light
  job; wall 6.27 s for the four runs, CPU 4.9 s, peak RSS 77.3 MB; script `scripts/verify-trials/r3bc_handoff.sh`). No
  truth exists, so nothing is scored. R3b: both tools wrote all 129 notes, 65 on open strings, highest fret 4, notes
  per string (1 to 6) 21, 36, 21, 26, 25, 0; paired by pitch with onsets within 31 ms (LilyPond's glue gives each note
  its 30 ms group's onset), all 129 tuttut notes have the same string and fret as LilyPond's. R3c: both wrote all 87
  notes; tuttut 31 on open strings, highest fret 8, per string 12, 14, 26, 15, 12, 8; LilyPond 30 open, highest fret 8,
  per string 12, 15, 24, 17, 11, 8; 84 of the 87 paired notes have the same string and fret. LilyPond wrote no
  warnings (88 and 63 chord groups). Files: `samples/verify-trials/tuttut_R3b.bp.*`, `tuttut_R3c.bp.*`.

## Media kept outside git

None. This lane wrote no audio or video files. Its large outputs (frame CSVs, note lists, LilyPond files, Guitar Pro
files) are under `/home/user/gtr/lanes/guitar-tab/out/`; the small pictures it made (LilyPond PNG pages, 8.5 to 9.9 KB)
are in `samples/lilypond/` (including `R3a.bp.png`, the R3a tab from Basic Pitch notes).

## Verification log (verify-trials-guitar-tab, 2026-11-10)

Checked by an independent agent between 22:37 and 23:20 UTC. Its scripts are in `scripts/verify-trials/`, its outputs
under `/home/user/gtr/lanes/guitar-tab/verify-trials/` (no audio or video; the trial agent's outputs were not
modified; the two checkpoints it re-downloaded were deleted after use), its small records and samples in `samples/verify-trials/`.

What was checked, and how:

- **Run ledger.** All 19 run ids cited by the trial agent (the lane's 18, r0027 to r0356, and the audio-to-notes
  lane's r0234) have a ledger line. Wall-clock, CPU (user + system), peak RSS, cores, slot wait, load average and exit
  code in the text match the ledger; the commands match the batch scripts in `scripts/`. The only nonzero exit code is
  r0044 (exit 1), which the text describes as a failed batch. Per-clip times quoted for r0048, r0117, r0139, r0145,
  r0274 and r0331 match the logs in `/home/user/gtr/lanes/guitar-tab/logs/` (after the correction to r0048's range).
- **Scores.** All 199 eval ids cited by the trial agent exist in the eval ledger with exit 0. Run r0456
  (`gtr-run --nolock`, wall 313.48 s) re-ran each of them from its recorded arguments and working directory with
  `--no-ledger` (`scripts/verify-trials/rescore_cited_evals.py`): 199 of 199 results equal the stored results as whole
  JSON objects, including the SHA-256 of every estimate file, so every scored output file still exists unchanged
  (`samples/verify-trials/rescore_report.json`). Every number in the tables that carry eval ids (869 cells: counts,
  fractions to 4 decimals, string-difference counts, note P/R/F1, frame tab and pitch F1) was compared with the ledger
  by `scripts/verify-trials/check_tables.py`: 0 mismatches (`samples/verify-trials/check_tables_output.txt`; the checker
  found all 7 errors planted in a test copy). The numbers in the prose that carry eval ids were compared by hand: all
  match.
- **Independent recomputation** with mir_eval 0.8.2 called directly and no gtr-eval code
  (`scripts/verify-trials/independent_mir_eval.py`, output `samples/verify-trials/independent_mir_eval.txt`): 16
  numbers, at least one per tool, all equal to the stored values: matched count and same-string-and-fret fraction for
  tuttut (e0052, e0048), tayuya (e0135), LilyPond (e0184, e0179), tabsynth (e0385), tutts (e0411), SynthTab
  `finetuned/GuitarSet.pt` (e0205) and `SynthTab-Pretrained.pt` (e0863), Basic Pitch into tuttut (e0727) and into
  LilyPond (e0670), guitar-fl into tuttut (e1275); onset-only P/R/F1 of guitar-fl on S2n (e1224) and R1c (e1274);
  frame tab F1 of SynthTab on R1c (e0236) and R1a (e0912), computed from the frames CSV with gtr-eval's written
  definition.
- **Re-runs** from the recorded commands, outputs compared with the originals:
  - r0469 (`gtr-run --nolock`, wall 13.91 s; `scripts/verify-trials/verify_light_reruns.sh`, log
    `samples/verify-trials/light_reruns.log.txt`): tuttut (R1c default, S5dropd Drop D, S5capo2 capo, R1c span 7),
    tayuya (S2n, R1c), LilyPond (R1a, S2n pinned), tabsynth (S2n `groups`, R1b `max_fret=5`), tutts (R1c
    `quantizeGrid`, S5dropd Drop D), Basic Pitch handoff (tuttut R1c, LilyPond S3, tayuya S2n), PyGuitarPro glue
    (3 GP5 files). Every note list is identical to the original; the files that differ do so only in the output paths
    they record. The GP5 files have identical notes, tuning, capo and tempo (the titles differ: the trial agent passed
    `--title`). The span-7 `AssertionError`, the R1a LilyPond warning, the 12 S3 LilyPond warnings and tayuya's
    `UnboundLocalError` on the S2n Basic Pitch MIDI all recurred.
  - r0494 (2 cores 2-3, after 861.9 s waiting for a slot): `guitar-fl.pth` on R1c: MIDI file and note CSV
    byte-identical to r0331's. Transcription 22.87 s here against 165.55 s in r0331 (see the Riley section).
  - r0501 (2 cores 2-3, after 1380.3 s waiting for a slot): SynthTab `finetuned/GuitarSet.pt` on R1c, checkpoint
    re-downloaded from raw.githubusercontent.com (same SHA-256 as recorded): frames CSV byte-identical, same 141 notes.
- **Files and formats.** Every output and sample file named in this report exists; every file in `samples/` that also
  exists under `out/` or `inputs/` is byte-identical to it. The merged truth MIDI files were re-scored
  (`--no-ledger`): onset F1 1.0 for all eight, onset+offset F1 1.0 except R1a 0.994709 and R1c 0.986486, as stated;
  mido shows one track, channel 0, the first program change only, no track names. The MIDI, JSON, CSV, TSV, PNG and GP5
  files were opened and compared with the format descriptions. Counts recomputed from the outputs: tuttut's S5 and
  constraint claims; tayuya's fret-0 and renamed-pitch counts and its first 10 notes; LilyPond's restrainOpenStrings,
  minimumFret and pin comparisons and its S2n log excerpt; tabsynth's template counts and first state; the
  tutts-to-tuttut identity on the 8 clips plus the capo and Drop D runs; the Basic Pitch handoff note losses and octave
  moves; the guitar-fl CSV rows; the R3a counts.
- **Sources re-read** (2026-11-10): the PyPI JSON API (tuttut, tayuya, tabsynth, basic-pitch 0.4.0 `requires_dist`,
  piano-transcription-inference, amt-tools, PyGuitarPro; "Not Found" for gtrsnipe, hf-midi-transcription and tutts);
  the npm registry entry of tutts; the Hugging Face API and cards of xavriley/midi-transcription-models,
  danmor/guitab and MehmetErenn0/guitar-transcription-cnn-mtl; Zenodo record 23361924 through its API; the arXiv PDFs
  2309.09085, 2402.15258, 2408.08653, 2510.02597, 2609.11904 and 2608.30854, the abstract pages (Comments
  field) of 2309.09085, 2402.15258, 2408.08653 and 2608.30854, and the HTML of 2408.05024v1 and 2506.14223v1; READMEs and source files of SynthTab, tutts, gtrsnipe, Guitab
  (and its live browser page), Noise2Fret, Audio2Tab, GuitarTab, TabCNN, FretNet, guitar-transcription-with-inhibition,
  hf_midi_transcription, xavriley's piano_transcription_inference fork, Guitar-Transcription and FretPath, from git
  objects of clones in the lane folder or from raw.githubusercontent.com; the installed code of tuttut, tayuya,
  tabsynth, tutts, music21, amt-tools, piano-transcription-inference and LilyPond 2.24.3; TuxGuitar 1.5.6's language
  file; two web searches (Fretting-Transformer, MIDI-to-Tab code). Every quotation in this report that comes from these
  sources was found in them.
- **NOT RUN reasons.** Checked against the sources above: no published weights for the original TabCNN, FretNet,
  guitar-transcription-with-inhibition, Audio2Tab and GuitarTab; no code or weight links in the Fretting-Transformer,
  MIDI-to-Tab and both TART papers; gtrsnipe and hf-midi-transcription absent from PyPI (and PyPI's `guitab` is another
  project); Noise2Fret's README inference route; music21's stub; the clone-based install routes of Guitab and gtrsnipe.
  The permission refusals are the trial agent's account (no log of them), consistent with the files. The
  guitar-gaps slot waits are the trial agent's account, consistent with the files; the model itself runs on this box
  (below).
- **Language, secrets, personal data, sizes.** No judging words in either file apart from quoted sources. No keys or
  tokens. One line of `for-aaron.md` described Aaron's own laptop and GPU model; it now says "a Windows computer with
  an NVIDIA GPU (CUDA)". No file over 300 KB and no audio or video in this folder.

Run by the verifier (gaps in the trial, filled in the trial's own format and marked in the text):

- `guitar-gaps.pth` on S2n, S3, R1b and R1c (r0499, r0505; handoff to tuttut and LilyPond r0500, r0506; eval ids
  e1428, e1430, e1432, e1436 to e1438, e1440 to e1445), in the Riley section.
- The R3b and R3c Basic Pitch handoff to tuttut and LilyPond (r0479), in the R3a section.
- tuttut with `MAX_FRET_SPAN = 6` on R1c, and tayuya on a two-note MIDI file (C4, D#6), both in r0469.

What was changed in the trial report:

- tuttut: the in-script time range (0.01 to 0.10 s, not 0.06, and what it covers); the package and venv sizes
  (re-measured); the r0044 sentence (attributed: its log was overwritten); the `MAX_FRET_SPAN` statement ("values above
  5 fail an assertion" was wrong: 6 runs, 7 failed) and the constraint table row.
- tayuya: "10 output files" corrected to 9; the S5capo2 outputs added to the renamed-pitch check.
- LilyPond: r0145 is 14 runs, not 15; the R1a warning concerns the A#2 of the A#2 + C#3 + G#3 group at 10.668 s, not
  "A#2 grouped with F2".
- SynthTab: the 352 MB clone size and the 87.94 s smoke test marked UNVERIFIED; the checkpoint re-download and the
  r0501 re-run recorded.
- tabsynth: the per-clip time range marked UNVERIFIED (no log). PyGuitarPro glue: "a fraction of a second each"
  removed (not timed).
- tutts: the 51.3 ms smoke-test figure marked UNVERIFIED; the "3 notes lost with quantizeGrid" UNVERIFIED replaced by
  the traced cause (two B3 notes on one grid point, merged by tutts' pitch de-duplication) and the measured onset
  shifts; two of its README's divergences shown not to apply to tuttut 0.0.7's code.
- Basic Pitch handoff: the cause of the tuttut/tutts differences corrected (tuttut 0.0.7's chord reduction, not the
  "phantom notes" of tutts' README); the pitch-bend messages, an S5dropd tayuya row, the LilyPond warning counts and
  its frets up to 30 added; the R3b/R3c sentence corrected (their Basic Pitch MIDI existed from 21:42 UTC in another
  folder).
- Riley et al.: the `5000_iterations` check, two further files in the model repository, three further fork
  differences, the r0494 timing, the slot-wait evidence and the verifier's GAPS runs added; "NOT RUN HERE" for
  `guitar-gaps.pth` changed accordingly.
- Guitab: PyPI's `guitab` is another project; the dry-run package list marked UNVERIFIED. Noise2Fret: the venue
  attributed to the arXiv Comments field and the README. Audio2Tab: its "Checkpoints" sentence quoted.
  Guitar-Transcription-CNN-MTL: the fold-to-player mapping added from the card, and the claim that it is "the one
  published tab model found here" that could be scored on an R1 clip by a model not trained on that player removed
  (`SynthTab-Pretrained.pt`, run here, was not trained on GuitarSet according to its name and the paper).
- Fretting-Transformer and MIDI-to-Tab: the verifier's repeat of the link check and web search recorded.

What was changed in `for-aaron.md`: the laptop description (personal hardware) replaced; Guitab: the browser page's
control names (from its HTML), the README's CPU/GPU device rule (the GPU is not required), "Free." and the
setup-time estimate removed; `hf_midi_transcription`: a torch CUDA check, `--verbose` and what the console prints
(from its source), and the GAPS status (run on the box by the verifier); Noise2Fret: the README sentence quoted and
"not a non-programmer task" removed; gtrsnipe: its `--capo` option (from its source) replaces the conditional step;
desktop editors: licences and price attributed to the web-tab-render and apps-survey surveys, TuxGuitar 1.5.6 menu
labels from its language file, FretPath steps from its README; the GuitarSet source of the R1 clips; the closing
paragraph without the GPU-size remark.

Still UNVERIFIED after this check: the trial agent's unlogged smoke-test timings (SynthTab 87.94 s, tutts 51.3 ms,
guitar-gaps 280 s timeout); tabsynth's per-clip time range in r0186; the 352 MB SynthTab clone size; the Guitab
dry-run package list; the wording of the two permission refusals; which GuitarSet split `finetuned/GuitarSet.pt` was
trained on, and which paper run `guitar-fl.pth` and `guitar-gaps.pth` are (so whether they saw the R1 takes); the
TuxGuitar and MuseScore menu paths in `for-aaron.md` (programs not opened); the Guitab browser page's behaviour (its
HTML was read, the page was not run).
