# gtr-eval and gtr-run

Two commands for the lanes of the guitar-tab research on the shared box:

- **`gtr-eval`** scores one tool's output against a clip's ground-truth file, the same way for every lane, so the
  numbers in the write-up are comparable and can be recomputed.
- **`gtr-run`** runs a heavy command in a fixed CPU slot and writes one line per run to the run ledger.

Files in this folder:

| File | What it is |
|---|---|
| `gtr_eval.py` | the scorer (all subcommands) |
| `gtr_eval_selftest.py` | the known-answer checks behind `gtr-eval selftest` |
| `gtr-eval` | the launcher installed at `/home/user/gtr/bin/gtr-eval` |
| `requirements.lock.txt` | the exact package versions of the scorer's Python environment |
| `selftest.txt` | the output of the last `gtr-eval selftest --all-inputs` run |
| `../gtr-run` | the run wrapper, copied unchanged from `/home/user/gtr/bin/gtr-run` |

## Running it

```
gtr-eval <subcommand> --truth <id>.truth.json --est <tool output> [options] [--out result.json]
gtr-eval <subcommand> -h        # the options of one subcommand
gtr-eval selftest [--all-inputs] # known-answer checks
```

`--truth` takes a path, or a clip id such as `S2n` that is looked up as `/home/user/gtr/inputs/S2n/S2n.truth.json`.
The launcher runs `/home/user/gtr/eval/venv/bin/python -I -B /home/user/gtr/eval/gtr_eval.py`, so it works from any
directory and from inside any other virtual environment (`-I` ignores `PYTHONPATH`, the user site directory and the
current directory).

Environment: Python 3.11.15 in a uv venv with mir_eval 0.8.2, numpy 2.4.6, scipy 1.17.1, pretty_midi 0.2.11.post0,
PyGuitarPro 0.11, soundfile 0.14.0 (full list in `requirements.lock.txt`). To rebuild it elsewhere:

```
uv venv --python 3.11 venv && uv pip install --python venv/bin/python -r requirements.lock.txt
venv/bin/python -I gtr_eval.py selftest
```

### What every result contains

Each subcommand prints one JSON object on one line (`--pretty` indents it; `--out` also writes it to a file):

| Field | Content |
|---|---|
| `gtr_eval_version` | version of the scorer that produced the numbers |
| `subcommand` | which comparison ran |
| `truth` | truth id, absolute path, size and SHA-256 of the truth file |
| `est` | path, size, SHA-256 of the estimate and what was read from it (format, delimiter, header, columns, MIDI tracks, Guitar Pro tracks...) |
| `options` | every option value used |
| `counts` | n_truth, n_est, n_matched and the other counts behind the metrics |
| `metrics` | the numbers |
| `definitions` | for each number: the mir_eval function and parameters, or the formula, in words |
| `processing` | everything done to the inputs before scoring: units detected and why, rows skipped, shifts, resampling, trimming, warnings raised by mir_eval |
| `libraries` | Python, numpy and mir_eval versions |

Floats are rounded to 6 decimals. Values that are not finite are written as the strings `"inf"`, `"-inf"`, `"nan"`.
An input problem prints `{"error": ...}` and exits with code 1. The JSON holds no timestamps or run ids: the same files at
the same paths with the same options give byte-identical output (checked for `notes`, `tab` and `stems`).

### The scoring ledger

Every scoring run (all subcommands except `check-truth`, `ledger` and `selftest`) appends one line to
`/home/user/gtr/eval/ledger/evals.jsonl` and prints its id to stderr, for example
`[gtr-eval e0042] notes truth=S2n exit=0`. The line holds the id, the UTC time, the exact arguments, the working
directory, the exit code, the seconds taken and the whole result. `--no-ledger` skips it; the environment variable
`GTR_EVAL_LEDGER` points it at another file; `GTR_AGENT`, if set, is stored as `agent_hint`.

```
gtr-eval ledger --truth-id S2n --sub notes     # one summary line per matching run
gtr-eval ledger --id e0042 --full              # the whole stored result
```

A number quoted in a lane report can carry its eval id and the scorer version, for example "onset F1 0.873 (gtr-eval
0.8.0, e0042)", and anyone can then find the exact inputs (with their SHA-256) and options behind it.

## Conventions shared with the truth files

The truth schema is the one in the inputs manifest. The parts the scorer relies on:

- Times are seconds from the start of the audio file.
- `pitch` is the sounding MIDI note number. The scorer converts MIDI numbers to Hz as 440 * 2^((m - 69) / 12)
  wherever mir_eval wants Hz.
- `tuning_midi` lists the open strings low to high (string 6 to string 1), without a capo. String 1 is the
  highest-pitched string. `fret` is counted from the capo, so sounding pitch = `tuning_midi[6 - string] + capo + fret`.
- `voice` is one of melody, bass, chord, lead, drums. Notes with voice `drums` are left out of note scoring unless
  `--include-drums` is given.
- Chords are Harte labels as mir_eval.chord reads them; `key` is `"<tonic> major"` or `"<tonic> minor"`.

## The subcommands, and what each number means

### `notes`: note transcription

**Input** (`--est`): a MIDI file (notes of every non-drum track pooled, pitch bends ignored; `--midi-programs 24-31`
keeps only instruments with those 0-based General MIDI program numbers); a MusicXML file (`.musicxml`, `.xml`, `.mxl`,
see `tab` below for how it is read); a CSV/TSV/TXT table with
onset, offset and pitch columns (found by header names such as `onset`/`start`/`start_time_s`, `offset`/`end`/
`end_time_s`, `pitch`/`pitch_midi`/`midi`/`frequency`, or read in that order when there is no header; `--cols onset,duration,pitch` and similar for other
orders); or JSON (a list of note objects, an object with a `notes` list such as a truth file, or a list of
`[onset, offset, pitch]`). Pitch may be MIDI numbers, Hz or note names (`C#4`, C4 = MIDI 60). The unit is decided in
this order and the rule used is written into `processing`: `--pitch-unit`; a column or key name naming Hz/frequency or
MIDI/note; any value above 127.5 means Hz; every value within 0.01 of an integer means MIDI; otherwise Hz.

**Numbers:**

- `onset_only.precision`, `.recall`, `.f1`: `mir_eval.transcription.precision_recall_f1_overlap(ref_intervals,
  ref_pitches_hz, est_intervals, est_pitches_hz, onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)`.
  A truth note and an estimated note match when the onsets are at most 50 ms apart and the pitches at most 50 cents
  apart; offsets are ignored; each note matches at most one other (maximum bipartite matching). Precision = matched /
  estimated notes, recall = matched / truth notes, F1 = 2PR / (P + R).
- `onset_offset.*`: the same call with mir_eval's defaults `offset_ratio=0.2, offset_min_tolerance=0.05`: in addition
  the estimated offset must be within max(20 percent of the truth note's duration, 50 ms) of the truth offset. Not
  computed (null) when the estimate has no offsets.
- `avg_overlap_ratio`: mean, over matched pairs, of the overlap of the two note intervals divided by their union
  (mir_eval's Average Overlap Ratio).
- `n_matched`: `mir_eval.transcription.match_notes` with the same parameters.
- `recall_by_voice`: for each truth voice, matched truth notes of that voice / truth notes of that voice. Estimated
  notes have no voice, so there is no precision per voice.
- `onset_timing_of_matched`: over the onset-only matched pairs, estimated onset minus truth onset in seconds: median,
  mean, mean absolute, 95th percentile of the absolute value, largest absolute value (positive = the estimate is
  late). `beats` and `onsets` report the same statistics for their matched pairs as `timing_of_matched`.
- `chroma_onset_only`, `chroma_onset_offset` (with `--chroma`): the same matching with the pitch condition on pitch
  class only: the circular distance min(|d| mod 1200, 1200 - |d| mod 1200) must be at most 50 cents, so a note an
  octave off matches. mir_eval has no such option; this uses gtr-eval's copy of `mir_eval.transcription.match_notes`
  (same rounding, same bipartite matching), and the selftest checks that the copy gives mir_eval's match counts when
  the chroma condition is off.

**Options:** `--voice <name>` scores against one truth voice (estimated notes that match other voices then count as
unmatched, which lowers precision); `--pitch-shift <semitones>` and `--time-shift <seconds>` are added to the estimate;
`--onset-tol <seconds>` replaces 0.05 in both matchings; `--apply-tuning-offset` adds the truth `tuning_offset_cents`
to the truth pitches (off by default: the truth pitch is the nominal note).

mir_eval needs every note to have a positive duration: estimated or truth notes with offset <= onset get offset =
onset + 1 ms, and the count is written into `processing`.

### `f0`: a monophonic pitch track

**Input:** a table of `time, frequency_hz[, confidence]` from a monophonic pitch tracker. Columns are found
by header names (time; freq/f0/hz/pitch; conf/voicing/periodicity/prob) or read in that order. NaN frequencies count
as unvoiced (0 Hz). `--f0-unit midi` reads the frequency column as MIDI numbers.

**Reference:** built from the truth notes on a 10 ms grid from 0 s to `duration_s`: the melody voice if there is one,
otherwise all notes if no two overlap (otherwise an error asks for `--voice`). At each grid time the reference is the
frequency of the sounding note, 440 * 2^((pitch + tuning_offset_cents/100 - 69)/12), or 0 (unvoiced) between notes;
where reference notes overlap the later onset wins. `--nominal` leaves the tuning offset out.

**Numbers** (estimate resampled onto the reference grid by `mir_eval.melody.to_cent_voicing`, linear interpolation):

- `voicing_recall`: `mir_eval.melody.voicing_recall`: share of reference-voiced frames that the estimate marks voiced.
- `voicing_false_alarm`: `mir_eval.melody.voicing_false_alarm`: share of reference-unvoiced frames the estimate marks voiced.
- `raw_pitch_accuracy`: `mir_eval.melody.raw_pitch_accuracy(cent_tolerance=50)`: share of reference-voiced frames
  where the estimated frequency is less than 50 cents from the reference, whatever the estimate's voicing decision.
- `raw_chroma_accuracy`: `mir_eval.melody.raw_chroma_accuracy(cent_tolerance=50)`: the same, octave errors forgiven.
- `overall_accuracy`: `mir_eval.melody.overall_accuracy(cent_tolerance=50)`: share of all frames where the two
  agree: unvoiced in both, or voiced in both with the pitch less than 50 cents apart.

**Option** `--conf-threshold <x>`: frames with confidence below x are marked unvoiced by negating their frequency,
which is mir_eval's convention for "unvoiced, but here is the pitch": they then lower voicing recall but still count
for raw pitch and raw chroma accuracy. Without it, every frame with a frequency above 0 counts as voiced, so for a
tracker that writes a frequency in every frame the voicing numbers describe that file as written.

### `beats`: beats and downbeats

**Input:** one beat time per line; other columns are ignored unless `--downbeat-col <n>` names a 1-based column whose
value 1 marks a downbeat (for a file of `time  beat_number` rows, `--downbeat-col 2`), or downbeats come from a second
file with `--downbeats-est`. A JSON estimate may be a list of times or an object with a `beats` list; a `downbeats`
list in the same object is used for the downbeat scores.

**Numbers** (for beats, and the same for downbeats when given):

- `f_measure`: `mir_eval.beat.f_measure(reference_beats, estimated_beats, f_measure_threshold=0.07)`: an estimated beat
  is a hit when within 70 ms of a truth beat, each truth beat matched once.
- `precision`, `recall`, `n_matched`: from the same 70 ms matching (`mir_eval.util.match_events`).
- `CMLc`, `CMLt`, `AMLc`, `AMLt`: `mir_eval.beat.continuity(reference_beats, estimated_beats,
  continuity_phase_threshold=0.175, continuity_period_threshold=0.175)`. An estimated beat is a hit when its distance
  to the nearest truth beat and its interval to the previous estimated beat are both within 17.5 percent of the truth's
  inter-beat interval there. CML = against the truth beats; AML = the highest score over the truth beats and four
  variants built from them (double tempo, half tempo on the odd beats, half tempo on the even beats, off-beat).
  `t` = hits / max(number of truth beats in that variant, number of estimated beats); `c` = the longest run of
  consecutive hits / the same denominator.

Facts about these definitions that show up in the numbers: mir_eval builds the double-tempo and off-beat variants by
interpolating between truth beats, so an estimated beat after the last truth beat is a miss in every variant
(a double-tempo estimate that runs past the last truth beat gets an AMLt a little below 1). `mir_eval.beat.evaluate`
would drop all beats before 5 s first; gtr-eval does not, because the clips are short. `--min-beat-time 5` applies
that trimming (`mir_eval.beat.trim_beats`). For downbeats the continuity tolerance is 17.5 percent of the interval
between truth downbeats (350 ms for 2 s bars), so downbeats shifted by 100 ms give an F-measure of 0 under the 70 ms
window and still CMLt 1 (the selftest checks exactly this case).

### `tempo`: one global tempo

**Input:** `--est-bpm <x>`, or `--est <file>` (the first number in the file is used).

**Numbers:** `ratio_est_over_truth`; `relative_deviation` = (est - truth) / truth; `within_tolerance`:
|est - truth| / truth <= 0.04; `within_tolerance_any_factor`: within 4 percent of 1, 2, 3, 1/2 or 1/3 times the
truth; `octave_error`: not within 4 percent at factor 1 but within 4 percent at factor 2 or 1/2; `closest_factor` and
the deviation from it. `--tolerance` changes 0.04. Plain arithmetic; `mir_eval.tempo` is not used (it scores a pair of
tempi with a salience weight and has an 8 percent default tolerance).

### `chords`: chord labels over time

**Input:** a `.lab` file (`start end label`, whitespace, tab or comma separated); a two-column `time label` file of
chord changes (each chord then lasts until the next change and the last one until the truth's `duration_s`; a
non-numeric cell before the first time, such as a file name, is skipped); or JSON (a list of `{start, end, label}`, or
an object with a `chords` list).

**Labels** are rewritten in Harte syntax before scoring: `C`→`C:maj`, `Cm`→`C:min`, `Cmaj7`/`CM7`/`CΔ7`→`C:maj7`,
`Cm7`/`Cmin7`→`C:min7`, `C7`→`C:7`, `Cdim`→`C:dim`, `Cdim7`→`C:dim7`, `Cm7b5`/`Cø`→`C:hdim7`, `Caug`/`C+`→`C:aug`,
`Csus2`, `Csus4`, `C6`→`C:maj6`, `Cm6`, `C9`, `Cmaj9`, `Cm9`, `C11`, `C13`, `CmMaj7`→`C:minmaj7`, `C5`→`C:5`,
`Cadd9`→`C:maj(9)`, slash chords with a note name (`C/E`→`C:maj/3`), `N`, `N.C.`, `NC`→`N`. `labels.normalized` lists
every rewrite and `labels.unparsed` every label that could not be read; unreadable estimated labels are scored as
`N` (no chord), so they match only truth segments without a chord, and their total duration is in
`counts.est_unparsed_duration_s`. (They are not passed as mir_eval's `X`: in mir_eval 0.8.2 an estimated `X` scores
1.0 under `mirex` against any truth chord and 1.0 under `root` against a truth `N`.)

**Numbers:** `mir_eval.chord.evaluate(ref_intervals, ref_labels, est_intervals, est_labels)`. The estimate is cropped,
or padded with `N`, to the truth's time span (`mir_eval.util.adjust_intervals`); both are cut at every boundary of
either (`mir_eval.util.merge_labeled_intervals`); each comparison is weighted by segment duration
(`mir_eval.chord.weighted_accuracy`).

- `root`: `mir_eval.chord.root`: share of time with the same root.
- `majmin`: `mir_eval.chord.majmin`: same root and same class among major, minor and no-chord; truth segments with
  other qualities are left out of the weighting.
- `sevenths`: `mir_eval.chord.sevenths`: same root and quality among maj, min, 7, maj7, min7 and no-chord; other truth
  qualities are left out.
- `other_mir_eval_chord_scores`: the rest of what `mir_eval.chord.evaluate` returns (thirds, triads, tetrads, mirex,
  the `_inv` variants that also compare the bass note, and the segmentation scores overseg, underseg, seg).

### `key`: one global key

**Input:** `--est-key "G major"` or `--est <file>` (first line). Accepted forms: `G major`, `G minor`, `Gm`, `G min`,
`G:maj`, `Bb major`, `F# minor`, `g minor`; a bare upper-case tonic (`G`) is read as major; `Cb`, `Fb`, `E#`, `B#` are
respelled as B, E, F, C because mir_eval's table does not contain them.

**Numbers:** `weighted_score` = `mir_eval.key.weighted_score(reference_key, estimated_key)`: 1.0 same tonic and mode;
0.5 the estimate is a perfect fifth above in the same mode; 0.3 relative major or minor; 0.2 parallel major or minor;
0 otherwise. `exact_match`: same tonic pitch class and same mode. `relationship`: which row of that table applies.

### `tab`: string and fret assignment

**Input:** JSON (a list of `{onset, pitch, string, fret}` objects, or an object with a `notes` list plus optional
`tuning_midi` and `capo`, such as a truth file); a CSV/TSV with `onset,pitch,string,fret` columns (by header names,
or in that order without a header; pitch may be left out); a Guitar Pro 3/4/5 file (`.gp3`, `.gp4`, `.gp5`, read with
PyGuitarPro; `--track N` picks a track, default the first non-percussion track with notes; Guitar Pro 6/7/8 files
`.gpx`/`.gp` are not readable by PyGuitarPro and are refused with that reason); a MusicXML file with TAB marks
(`.musicxml`, `.xml`, or compressed `.mxl`; `--track N` picks a part, default the first part with `<string>`/`<fret>`
marks); or ASCII tab (lines such as `e|---0---|` or `E4|---0---|`, top line = string 1).

- Estimated pitch: the file's pitch if it gives one, else the estimate's own tuning + capo + fret.
- Guitar Pro: note times come from the beat positions (960 ticks per quarter note) and the tempo map (song tempo plus
  mix-table tempo changes), first measure at 0 s; repeats are not expanded; tied notes are not new notes and dead
  notes are skipped; the capo is `Track.offset`; sounding pitch is taken as string tuning + capo + fret
  (PyGuitarPro's own `Note.realValue` leaves the capo out).
- MusicXML: partwise scores only. Times from `<duration>` / `<divisions>` and `<sound tempo>` (quarter notes per
  minute; 120 assumed when there is none, which `processing` says), `<backup>` and `<forward>` followed, first measure
  at 0 s, repeats not expanded; tie continuations and grace notes are not new notes. Pitch = `<pitch>` plus
  `<transpose>` (chromatic + 12 x octave-change); string and fret from `<technical><string>`/`<fret>`; tuning from
  `<staff-tuning>` and capo from `<staff-details><capo>`; sounding pitch from a position = staff tuning + capo + fret.
  The MusicXML 4.0 reference (w3.org, read 2026-11-10) says: `<staff-tuning>` "specifies the open, non-capo tuning of
  the lines on a tablature staff", its `line` attribute "Indicates the staff line for this tuning, numbered from bottom
  to top" (gtr-eval takes the bottom line as the lowest string); for `<string>`, "String numbers start with 1 for the
  highest pitched full-length string"; and `<capo>` "changes the open tuning of the strings specified by the
  `<staff-tuning>` element by the specified number of half-steps". Pages: w3.org/2021/06/musicxml40/musicxml-reference/
  elements/staff-tuning/, .../string/, .../capo/. Notes whose `<pitch>` disagrees with staff tuning + capo + fret are
  counted in `processing`. Files that declare XML entities are refused.
- ASCII tab carries no times. A run of one or two digits is a fret, notes in the same character column are
  simultaneous, and the order of columns is the only timing, so `--ignore-time` is switched on. When every string
  label names an octave (`E4`, `B3`, ...) the labels give the estimate's tuning. The capo is read from the first
  text line with "no capo" (0), "capo: none/no/off" (0), or "capo" followed by a fret number ("Capo: 2", "capo 2nd
  fret", "capo on 3rd fret"); the line used is quoted in `processing`.

**Matching:** by default `mir_eval.transcription.match_notes(onset_tolerance=0.05, pitch_tolerance=50.0,
offset_ratio=None)`: onsets within 50 ms and the same pitch, each note matched once. With `--ignore-time` (and for
ASCII tab) the output says `"IGNORE_TIME_USED": true`. Truth notes are grouped into chords (a note whose onset is
within 50 ms of the first note of the current group joins it; `--chord-window` changes 0.05) and put in order of group,
then pitch; estimated notes the same way (for ASCII tab one character column is one group); the longest common
subsequence of the two MIDI pitch sequences gives the matched pairs. Times are not compared at all. The grouping keeps
a strum, whose notes start a few milliseconds apart, in the same order as a tab column that writes it as one chord.

**Numbers:**

- `same_string_and_fret_fraction_of_matched`: matched pairs with the same string and the same fret / matched pairs.
- `same_string_fraction_of_matched`: matched pairs on the same string / matched pairs.
- `same_string_and_absolute_fret_fraction_of_matched`: same string and the same fret counted from the nut
  (fret + capo); it differs from the first number only when the two sides have different capos.
- `same_string_and_fret_fraction_of_truth`: same-string-and-fret pairs / truth notes that have a string and fret.
- `matched_fraction_of_truth`, `matched_fraction_of_est`: matched pairs / truth notes, / estimated notes.
- `string_difference_counts`: how many matched pairs have estimated string - truth string = -2, -1, 0, +1, ...
- `fret_difference_counts_when_same_string`, `string_confusion` (truth string rows x estimated string columns).
- `tuning_and_capo`: the tuning and capo of both sides, where the estimate's came from (the file, `--est-tuning` /
  `--est-capo`, or "not stated in the estimate; the truth tuning is assumed"), and the flags `tuning_differs`,
  `capo_differs`, `est_tuning_or_capo_assumed`.

### `tab-frames`: frame-level string and fret activations

For tools that output tablature frame by frame rather than as notes.

**Input:** a CSV/TSV in one of two layouts: long, one row per active string per frame (`time,string,fret`); or
matrix, one row per frame (`time` then one fret column per string, string 1 first; a negative number, empty cell,
`x` or `-` means the string is silent). JSON is also read: a list of `{"time": t, "active": [{"string": s, "fret": f},
...]}`. `--frame-format` forces the layout.

**Frame grid:** in the matrix layout, the estimate's own frame times. In the long layout, frames every `hop` seconds
starting at 0 s and running to `duration_s`, where the hop is `--hop` or the most common gap between consecutive frame times in the file;
each estimated row goes to the nearest frame (rows more than half a hop away from every frame are left out and
counted in `processing`).

**Reference:** at each frame time t, the set of (string, fret) of the truth notes that sound at t
(onset <= t < offset); notes without a position and drums are left out.

**Numbers:**

- `tab_precision`, `tab_recall`, `tab_f1`: hits = the sum over frames of the size of (estimated set & reference set);
  precision = hits / all estimated activations, recall = hits / all reference activations, F1 = 2PR/(P+R).
- `pitch_precision`, `pitch_recall`, `pitch_f1`: the same after turning each (string, fret) into its MIDI pitch (each
  side with its own tuning and capo; `--est-tuning`, `--est-capo`, otherwise the truth's are assumed and the output
  says so), with a pitch that appears twice in one frame counted once.
- `tab_hits_over_pitch_hits`: tab hits / pitch hits, the share of the frame-pitches found that also sit on the
  reference string and fret.

These are gtr-eval's own definitions, written out above; they are not taken from a paper.

### `stems`: source separation

```
gtr-eval stems --truth S4 --est-dir <dir with the tool's stems> [--map guitar=other.wav bass=bass.wav] [--ref-dir <dir>]
```

`--map name=file` pairs a truth stem (a name in the truth's `stems`, or a file in `--ref-dir`) with an estimated file
(in `--est-dir`, or a path). Without `--map` each truth stem is paired with `<est-dir>/<stem name>.wav` (or .flac,
.ogg, .mp3, .aiff). Every signal is averaged to mono, resampled to the truth's `sample_rate` (or `--sr`) with
`scipy.signal.resample_poly`, and all are trimmed to the shortest length; each of these steps is written into
`processing`. No time alignment is searched. `--max-seconds` scores only the start.

- `si_sdr_db`: computed by gtr-eval: both signals with their mean removed; target = (<est, ref> / <ref, ref>) * ref;
  SI-SDR = 10 log10(|target|^2 / |est - target|^2), in dB.
- `sdr_db`, `sir_db`, `sar_db`: `mir_eval.separation.bss_eval_sources(reference_sources, estimated_sources,
  compute_permutation=False)` on the mono signals, with mir_eval's 512-tap distortion filter, computed once over the
  whole signal (not in frames; `bss_eval_sources_framewise` is not used). With two or more stems all go into one
  call ("joint" mode), so the other stems are the interference for SIR; `--sdr-mode single` scores each stem alone
  (SIR is then not defined and not reported). mir_eval refuses an all-silent reference or estimate; the error is
  written into `processing`.

Measured cost: scoring S4 against itself (4 stems, 38.7 s at 44.1 kHz, joint mode) took 14.4 s wall-clock and a peak
of 903 MB resident memory on 2 cores (ledger run r0009). Time and memory grow with clip length and number of stems: run
full songs under `gtr-run`. mir_eval 0.8.2 marks the module as deprecated (its docstring: "The mir_eval.separation
module is deprecated in mir_eval version 0.8, and will be removed."; the call warns "Deprecated as of mir_eval version
0.8. It will be removed in mir_eval version 0.9."); the scorer pins 0.8.2 and copies the warning into `processing`.

### `onsets`: onsets and taps

**Input:** one time per line, or JSON (a list of times, or an object with an `onsets` list). **Reference:** the truth taps (`--field taps`, default; `--tap-kind` keeps one kind) or
the truth note onsets (`--field notes`, `--voice`), where onsets that coincide to the millisecond are merged, so a chord
is one onset.

**Numbers:** `mir_eval.onset.f_measure(reference_onsets, estimated_onsets, window=0.05)`: an estimated onset is a hit
when within 50 ms of a reference onset, each matched once; `f_measure`, `precision`, `recall`, `n_matched`.
`--window` changes 0.05.

### `tuning`: tuning offset, capo, open strings

`--est-cents <x>` (or `--est-a4-hz <hz>`, converted as 1200 log2(hz/440)) against the truth `tuning_offset_cents`:
`difference_cents` = est - truth, and `difference_mod_100_cents`, the difference wrapped into [-50, 50) cents (an
offset and the same offset plus or minus 100 cents give the same pitch classes, which is all a tuning-offset estimate
sees). `--est-capo` and `--est-tuning-midi 38,45,50,55,59,64` add `capo_equal`, `tuning_equal` and the per-string
differences in semitones.

### `check-truth`: a truth file against the schema

Field presence, value ranges, time order, positive note durations, pitch = `tuning_midi[6 - string] + capo + fret`
for every note with a position, chord labels that `mir_eval.chord.encode` reads, a key that `mir_eval.key.validate_key`
accepts, downbeats that are also beats, and that the audio and stem files exist. Prints the list of mismatches.

## selftest

`gtr-eval selftest` builds a fixture clip (8 s at 120 bpm in 4/4, G major, standard tuning, 32 melody notes on strings
1-3 and 8 bass notes on strings 4-6, four chords, eight taps, and two synthesized stems; written to
`/home/user/gtr/eval/fixtures/FX1/`) and scores estimates whose answers are known beforehand. Examples: the truth
against itself gives 1.0 in every format (CSV in MIDI numbers and in Hz, headerless, MIDI file, JSON, the truth file
itself, Guitar Pro 5, ASCII tab); onsets shifted by 100 ms give F1 0, by 40 ms and by exactly 50 ms give 1, and
`--onset-tol 0.03` turns the 50 ms case into 0; a transposition by one semitone gives 0 and `--pitch-shift -1` undoes
it; an octave transposition gives 0 but 1 with `--chroma`; 30 cents sharp still matches and 60 cents does not; half the
notes removed gives recall 0.5 and precision 1; offsets cut to half the duration keep onset F1 1 and give onset+offset
F1 0; the beat grid at double tempo gives F = 32/47, CMLt 0 and AMLt 1; a tempo of twice the truth is flagged as an
octave error and three times is within tolerance at factor 3 but not an octave error; transposed chords give root 0;
the key table gives 1.0, 0.5, 0.3, 0.2, 0; tab notes all moved one string down give a string difference of +1 for
those notes; a capo difference and a tuning difference are flagged; frame-level tab written from the truth gives
tab and pitch F1 of 1 in both layouts, and with the melody moved one string down pitch F1 stays 1 while tab precision
drops to the share of activations not moved; SI-SDR with noise added at 10 dB SNR is within
0.3 dB of 10; swapped stems give negative SI-SDR; the launcher works from `/` with `PYTHONPATH` and `VIRTUAL_ENV`
pointing elsewhere.

Not covered by a known-answer check: tempo changes inside Guitar Pro and MusicXML files (they are read as described
above), and repeats (they are not expanded).

`gtr-eval selftest --all-inputs` adds checks derived from every real truth file under `/home/user/gtr/inputs/`:
`check-truth`, the truth scored against itself in every subcommand its fields allow, and the 100 ms shift, semitone
transposition and half-removed checks wherever the truth itself makes the answer certain (a check is reported as N/A
with the reason when it does not, for example same-pitch notes 50 to 150 ms apart). It also scores the files the
inputs builder wrote next to each truth file with its own code (`<id>.notes.csv`, `<id>.mid`, `<id>.beats.txt`,
`<id>.chords.lab`, `<id>.tab.txt`, `<id>.gp5`) and expects 1.0 from each, so two separately written programs have to
agree. For the ASCII tab files only the matched pairs must agree on string and fret: a column per 16th note cannot hold
two notes on one string, and its column order can differ from the onset order (R1b: 66 of 70 truth notes are in the
tab file; R1c: 146 of 148 notes are matched by order).

## gtr-run

`/home/user/gtr/bin/gtr-run` (copy: `../gtr-run`) wraps every heavy command on the box:

```
gtr-run --lane <lane> --tool <tool> --label "<what>" [--input <file>]... [--all-cores | --nolock] -- <command...>
```

- The box's 4 cores are two slots of 2 cores (cores 0-1, cores 2-3). By default gtr-run waits for a free slot and
  pins the command and everything it starts to that slot (`os.sched_setaffinity`), so at most two timed jobs run at
  once and each has 2 cores. `--all-cores` waits for both slots and gives the command all 4. `--nolock` takes no slot
  and does no pinning.
- It sets `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, `OPENBLAS_NUM_THREADS`, `NUMEXPR_NUM_THREADS`,
  `VECLIB_MAXIMUM_THREADS` and `TF_NUM_INTRAOP_THREADS` to the number of cores given, unless they are already set.
- It appends one JSON line per run to `/home/user/gtr/ledger/runs.jsonl` and prints `[gtr-run r0042] ...` to stderr.
  The line holds: `id`, `lane`, `tool`, `label`, `started_utc`, `cmd` and `cmd_str` (the exact command), `cwd`,
  `inputs` (path, bytes and SHA-256 of each `--input`), `wall_s`, `cpu_user_s`, `cpu_sys_s`, `max_rss_mb`,
  `exit_code`, `cores`, `n_cores`, `lock_wait_s`, `locked`, `load1_at_start`, `threads_env`, `nproc`.
- How the numbers are measured: wall-clock is `time.time()` around `subprocess.call`; CPU seconds are the difference
  in `resource.getrusage(RUSAGE_CHILDREN)` user and system time, which covers the command and the descendants it
  waited for; `max_rss_mb` is `ru_maxrss` of `RUSAGE_CHILDREN`, the peak resident memory of the largest single
  descendant process, not the sum over processes running at the same time. `lock_wait_s` is the time spent waiting
  for a slot and is not part of `wall_s`.
- Run ids are the line number in the ledger (`r0001` is line 1).

## Changelog

The version is in every result (`gtr_eval_version`). Numbers from different versions are comparable unless a line
below says a definition changed.

- 0.4.0 (2026-11-10): first version available to the lanes.
- 0.5.0 (2026-11-10): MusicXML input (notes and tab), `--midi-programs`, capo line in ASCII tab, octave-labelled ASCII
  tab strings (`E4|`), zero-length notes given 1 ms so mir_eval accepts them, `avg_overlap_ratio` null when the
  estimate has no offsets. Wording of the definitions. No metric definition changed.
- 0.6.0 (2026-11-10): definition change for `tab --ignore-time`: notes are now grouped into chords with a 50 ms window
  before ordering (0.5.0 ordered by exact onset, then pitch), so the matched counts of order-only comparisons can differ
  from 0.5.0. ASCII tab capo reading fixed: 0.5.0 could take an unrelated number from a line that says "no capo"
  (for example the tempo). Time-based tab matching and every other subcommand are unchanged.
- 0.7.0 (2026-11-10): definition change for `chords`: estimated labels that cannot be read are scored as `N` (0.6.0
  and earlier passed them to mir_eval as `X`, which mir_eval's `mirex` comparison scores as 1.0). Results without
  unreadable labels are unchanged. `check-truth` no longer counts one check that could not fail.
- 0.8.0 (2026-11-10): the scoring ledger (`evals.jsonl`, `gtr-eval ledger`, `--no-ledger`). No metric changed.
- 0.9.0 (2026-11-10): new subcommand `tab-frames`. No existing metric changed.
- 0.10.0 (2026-11-10): timing statistics of matched pairs in `notes`, `beats` and `onsets`. No existing metric changed.
- 0.11.0 (2026-11-10): JSON estimates for `beats` (with an optional `downbeats` list) and `onsets`. No metric changed.
- 0.11.1 (2026-11-10): `notes` and `tab` accept estimated times below 0 (after `--time-shift`): mir_eval refuses
  negative times, so the same constant is added to both sides first, which changes no time difference. Before this the
  run stopped with an error. No metric changed.
