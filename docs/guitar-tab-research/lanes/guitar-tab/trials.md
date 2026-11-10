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
