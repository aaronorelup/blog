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
  pretty-midi 0.2.11.post0, eel 0.18.2 (for its GUI). Size: the `tuttut` package folder is 504 KB; the whole shared
  venv is 271 MB, of which music21 is 101 MB. No model weights. Freeze: `samples/tuttut/uv-pip-freeze.txt`.
- Entry points: `tuttut` (GUI, eel + a browser window) and `tuttut-cli <song>.mid <output_dir>`. The CLI always uses
  the default tuning and fret count (it calls `Tab(source.stem, Tuning(), midi, output_dir=...)` and writes only the
  ASCII file). To reach the constraint parameters I called the library from `scripts/run_tuttut.py` (my glue: it builds
  `Tuning(...)`, calls `Tab(...)`, then tuttut's own `to_ascii()` and `to_json()`, and converts tuttut's JSON into the
  note list gtr-eval reads).
- Runs (all on the merged truth MIDI, "perfect notes in"): one single run r0027 (S2n, wall 0.37 s, CPU 0.37 s, peak
  RSS 40.5 MB, 2 cores) and one batch of 15 runs in one `gtr-run` call, r0048 (`scripts/batch_tuttut.sh`; wall 3.74 s
  for all 15 runs including 15 Python start-ups, CPU 3.37 s, peak RSS 37.1 MB, 2 cores, exit 0). The time tuttut itself
  spent building the tab (`Tab(...)`, measured inside the script) was 0.01 to 0.06 s per clip. An earlier batch r0044
  stopped at the failing span-7 run (exit 1) and was repeated as r0048 with "continue on error".
- Results against the truth tab (`gtr-eval tab`, default time-based matching):

| clip | settings given to tuttut | eval id | truth notes | est notes | matched | same string+fret / matched | same string / matched | string diff counts (est - truth) |
|---|---|---|---|---|---|---|---|---|
| S1 | default (standard tuning, 20 frets, span 5) | e0042 | 62 | 62 | 62 | 1.0000 | 1.0000 | 0: 62 |
| S2n | default | e0043 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| S3 | default | e0044 | 182 | 182 | 182 | 1.0000 | 1.0000 | 0: 182 |
| S5capo2 | default (capo not told) | e0045 | 90 | 90 | 90 | 0.0000 (same string and same fret from the nut: 0.6000) | 0.6000 | -1: 36, 0: 54 |
| S5capo2 | capo 2 told the only way tuttut allows: every open string raised 2 semitones (`F#4 C#4 A3 E3 B2 F#2`), nfrets 18 | e0046 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |
| S5dropd | default (Drop D not told) | e0047 | 90 | 90 | 86 | 0.8372 | 1.0000 | 0: 86 |
| S5dropd | tuning `E4 B3 G3 D3 A2 D2` | e0048 | 90 | 90 | 90 | 0.9778 | 0.9778 | 0: 88, +1: 2 |
| R1a | default | e0049 | 189 | 189 | 189 | 0.5291 | 0.5291 | -2: 22, -1: 67, 0: 100 |
| R1b | default | e0050 | 70 | 70 | 70 | 0.4429 | 0.4429 | -1: 39, 0: 31 |
| R1c | default | e0052 | 148 | 148 | 148 | 0.8108 | 0.8108 | -1: 27, 0: 120, +1: 1 |
| R1c | nfrets 12 | e0054 | 148 | 148 | 148 | 0.8108 | 0.8108 | same as default |
| R1c | max fret span 3 (module constant patched) | e0055 | 148 | 148 | 148 | 0.8108 | 0.8108 | same as default |
| S2n | nfrets 3 | e0056 | 90 | 90 | 90 | 1.0000 | 1.0000 | 0: 90 |

- What the S5 rows show, in detail: S5capo2 without the capo: tuttut writes the sounding pitches from the nut in
  standard tuning; 54 notes land on the truth string at the same fret counted from the nut, 36 land one string higher.
  With the raised tuning every note matches the truth tab (frets counted from the capo). S5dropd without the tuning:
  the 4 D2 notes (below standard tuning's E2) are moved up an octave by tuttut (`Fretboard.fix_oob_notes`) and become D3,
  so they no longer match the truth pitch (86 of 90 matched); 72 of the 86 have the truth string and fret. With the
  Drop D tuning, 88 of 90 notes have the truth string and fret; the first melody note G3 (truth: string 3 open) is
  written at string 4 fret 5, twice (the two +1 differences). The S5capo2 "notes transposed down 2" workaround
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
  the span; the span can be lowered but not raised past 5 without changing a second constant. With nfrets 3 on S2n
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
  fret 7) 7 times in R1c and 6 times in S3; D2 is placed at string 6 fret 10 (D3) 4 times in S5dropd; no other clip has
  such notes. Scored on the pitch the position sounds (pitch field removed, so gtr-eval uses tuning + capo + fret):
  S3 e0157: 176 of 182 matched, same string+fret / matched 0.1534; S5dropd e0158: 86 of 90 matched, 0.0000 (same string
  0.1628); R1c e0159: 141 of 148 matched, 0.1844.
- Its position table has no fret 0 entries (for example `'E4': {1: '', 2: 5, ...}`, `'G3': {4: 5, 5: 10, 6: 15}`), so
  no open string is ever written: 0 of the notes in every output above are on fret 0 (checked in all 10 output files),
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
- Failures and oddities: none that stopped a run. The glue checks that the number of returned notes equals the number of
  `note_on` messages (it did for all 9 runs).

## LilyPond 2.24.3 automatic tablature (TabStaff string selection)

- What it is: the music engraver's `TabStaff` picks a string and fret for every note that has no string mark. Its
  documented rule (`define-context-properties.scm`, property `minimumFret`): "The tablature auto string-selecting
  mechanism selects the highest string with a fret at least `minimumFret`." The code (`scm/lily/translation-functions.scm`,
  `determine-frets-and-strings`) works one moment (chord) at a time: no note before or after a moment is considered.
  Installed here as the Ubuntu 24.04 package `lilypond 2.24.3-1build3` (it was already on the box, installed by another
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
- Runs: r0145 (`scripts/batch_lilypond.sh`, 15 runs, `gtr-run --nolock`: no CPU slot, light job; wall 36.04 s for
  all 15, CPU 32.42 s, peak RSS 78.7 MB; about 2 to 3 s per run, almost all of it LilyPond start-up and engraving),
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
  string for pitch #<Pitch ais, > (given frets (4 1))` (A#2 grouped with F2 in one 30 ms group). R1c with minimumFret 3:
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
  `finetuned/{GuitarSet,IDMT,EGDB}.pt`, `non_finetuned/{GuitarSet,IDMT,EGDB}.pt`, 52.57 MB each (7 files, 352 MB with the
  rest of the clone). Its README: "`demo_embedding` is where we put our benchmark pre-trained models, with a simple demo
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
  counted by du, all but 80 MB hard links into the shared uv cache. Freeze: `samples/synthtab-tabcnn/uv-pip-freeze.txt`.
- Pipeline (settings copied from `demo_embedding/evaluate.py`): audio from `<clip>.mono.wav` resampled to 22050 Hz by
  `amt_tools.tools.load_normalize_audio`, `CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)`,
  `run_offline` with `ComboEstimator([TablatureWrapper, StackedNoteTranscriber])`. The checkpoint's own profile: tuning
  `[40, 45, 50, 55, 59, 64]`, 19 frets. Frame hop 512/22050 = 23.2 ms.
- Run `finetuned/GuitarSet.pt`: r0139, one `gtr-run` call for 8 clips (`scripts/batch_synthtab.sh`), 2 cores, wall
  185.81 s, CPU 205.69 s, peak RSS 3798.2 MB (the largest single process). Per clip (wall from /usr/bin/time inside the
  batch, including Python start-up): S2n 32.91 s, S2s 25.90 s, S3 18.65 s, S5capo2 20.61 s, S5dropd 25.07 s, R1a 20.56 s,
  R1b 18.36 s, R1c 23.68 s, for clips of 24 to 29.4 s. (An unlogged smoke test on S2n outside `gtr-run`, while the box
  was loaded, took 87.94 s for features + inference + decoding; it is not a measurement.)
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
- What the S5 rows show: the model has no capo or tuning input; its frets are counted from the nut in standard tuning.
  On S5capo2 the decoded notes that match a truth pitch sit on the truth string at the same fret from the nut in 36 of
  64 cases. On S5dropd the 4 D2 notes cannot be produced (the profile's lowest note is E2).
- Output excerpt, S2n, first 10 decoded notes (onset s, MIDI pitch, string, fret): (2.1595, 55, 4, 5), (2.1827, 43, 6, 3),
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
  CPU 4.2 s, peak RSS 37.0 MB). Time inside tabsynth: 0.01 to 0.15 s per clip for both output calls together.
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
