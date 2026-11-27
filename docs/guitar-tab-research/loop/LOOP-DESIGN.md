# The loop: Opus writes the tab one bar at a time, under constraints

The design of E4 (LOOP.md section 4), written by the orchestrator before any loop run. DIRECTION.md item 4: the AI
works "the way a person does: one bar at a time. What it learns in each bar should improve the bars before it and make
the next ones more accurate and faster." The constraints (item "Constraints, not transcription"): the tuning, the capo,
where the fretting hand is, which notes were played. The capo is given in every run.

## What a person does, and what the loop copies

A guitarist transcribing a video by hand plays a bar back, looks at the hand, writes the bar, checks it against the
recording, and moves on. Three things make the next bar faster and better: they know the tuning by now, they know the
shapes this player uses, and when the music repeats they copy the earlier bar and look only for what changed. When
something in a later bar shows an earlier guess was wrong (a shape seen clearly, a string that cannot be in that
tuning) they go back and fix it. The loop is that, with these parts:

| part | who | what |
|---|---|---|
| the preparer | code | the sound, the candidate notes from five note models merged, the bars, the hand window, repeats found by sound |
| the solver | code (E3) | for each bar, the cheapest string-and-fret path that keeps every fretted note inside the window, and each note's next-best places |
| the bar writer | Opus 5.5, blind, one call per unit | keeps, drops and adds notes, places them, checks the bar against the recording, writes the bar's tab, its confidence and its lessons |
| the driver | code | calls the bar writer in order, merges lessons into the carried state, schedules revisits, saves everything after every call |
| the reviser | Opus 5.5, blind, one call per revisit | opens a finished bar again with what was learned since, and writes it again or leaves it |

Opus never sees an answer key, a score or a song title. It sees what the app will have: the video, the sound, the note
models' output, the window, the capo, and (rung by rung) the tuning.

## Units of work

- A unit is one bar from Beat This!'s downbeats (`G/experiments/<S>/c-01/beats.txt`, beat number 1). Two short bars
  share a unit (under 2.5 s or under 6 candidate notes). Where the downbeats are unsure (the nylon song: downbeat F
  0.117) a unit is 2 to 4 s of sound cut at the widest gap between candidate onsets. Units are only units of work:
  never scored as bars.
- A note belongs to the unit its onset falls in. The unit's pack also shows 0.5 s of context on each side, read only.

## The candidate notes (the "which notes were played" constraint)

- Base: chain-2's notes (`G/experiments/<S>/chain-2/notes.csv`: guitar-fl on the steel songs, guitar-gaps on the Demucs
  stem for the nylon one). Alternatives: Basic Pitch (n-01), guitar-gaps (n-02), guitar-fl (n-03), Transkun (n-04),
  YourMT3+ (n-05). Notes of one pitch within 50 ms are one candidate, with its supporters (which models have it).
- L1 (true notes): the key's onsets, offsets and pitches only, no alternatives: the writer only places them.
- When the NOTES session's candidates land they are a new rung, with the file's SHA-256 in every run that uses them.
- The writer may: keep a candidate, drop it (dropping one that two or more models hold needs a reason), add a note (it
  needs an onset in the sound, seen on the spectrogram, and a reachable place).

## The bar pack (one folder per unit, given to the writer)

- `PACK.md`: the unit's times, the capo, the tuning (with each string's evidence when the tuning is not given), the
  window's summary, the carried state's summary, and the rules.
- `candidates.csv`: id, onset, offset, pitch (MIDI and name), supporters, in the base or not, and every place the tuning,
  capo and window allow (string, fret), with the solver's choice and its next-best places and their costs; conflicts
  (no allowed place; two notes on one string) flagged.
- `spectrogram.png`: a constant-Q picture of the unit with a note-name grid and the candidates drawn on it (base and
  alternatives marked differently), so the writer can see onsets and harmonics.
- `neck.jpg`: the overlay at each onset group of the unit (the window band, frets numbered from the capo, the
  fingertips), at most 8 frames; the writer can draw more with the overlay command.
- `similar.md`: earlier units that sound alike (chroma of the sound and the candidates' pitch sets), with their
  finished tabs and the time offset between them. A unit that repeats an earlier one starts from that tab.
- Tools it may run (TOOLS-BAR.md): render a tab of the unit with FluidSynth beside the recording; the self-check (a note
  model's reading of the render against the recording, per note); spectrograms of any stretch; the overlay at any
  time; the solver on the unit with pins.

## What the writer hands back

- `bar.json`: every note it keeps or adds: onset, offset, pitch, string, fret (from the capo), confidence (0 to 1), and
  for every candidate a decision (keep, drop, add) with a short reason when it is not the obvious one.
- `lessons.json`: what this unit taught, in the state's own fields (below).
- `revisit.json`: earlier units it thinks are wrong in the light of this one, each with the reason.

## The carried state (`state.json`), what makes the next bar better

- **tuning**: each string's pitch, its evidence (the units and times where it was seen and heard) and a conflict count
  (notes that no place in the window can play with that string's pitch, open strings seen ringing at another pitch).
- **shape book**: a sounding pitch set and its places (the string and fret of each note), with the unit and the frame
  it was seen in. When a later unit sounds the same set, the book's shape is the first proposal.
- **hand**: the hand's place per unit (the window's lo..hi at the unit's onsets, as accepted by the writer).
- **model habits**: per note model on this recording, what it invents and misses, with counts, as the writer judges them
  (for example "base invents a note at a thumb slap: 12 units").
- **player habits**: let-ring open strings, thumb over the neck, taps, slides, harmonics, with the units they were seen in.
- **repeats**: which unit repeats which, and what differed.
- **unsure**: units with confidence under 0.6.

The driver merges lessons by rule (it appends evidence, adds counts, keeps the book), never by judgement.

## Revisits: lessons that go backwards

A finished unit is opened again (one reviser call) when:
1. a shape is seen for a pitch set that an earlier unit placed otherwise;
2. a string of the tuning changes (L3 only): every unit with a note on that string is solved again, and the writer
   revisits those where the solver's new path differs;
3. a repeat's earlier copy was unsure;
4. a model habit found now applies to earlier units (it names them);
5. every 8 units, over the unsure units among them.
Every change is logged before and after; after the run, each is scored as wrong to right or right to wrong.

## The tuning in the loop (L3)

The run starts from the tuning finder's answer (E2). A string changes only when what is seen and heard keeps
disagreeing with it: a conflict count per string over a threshold fixed before the held-out runs (start: 3 conflicts
in different units with no support for the current pitch). Then one call reviews the evidence and decides, and rule 2
above runs.

## Rungs (E4 conditions)

| run | notes | tuning | hand |
|---|---|---|---|
| L1 | the key's onsets and pitches | given | E1's window |
| L2 (main) | chain-2's, alternatives from the five models | given | E1's window |
| L3 | as L2 | found (E2), revised in the loop | E1's window |
| L4 | as L2 | given | off (no window, no neck pictures) |

E5's W2 gives one session L2's whole-song inputs and 90 minutes; E6 runs L2 on the capo song with the state emptied
before every unit, and with revisits off.

## What is measured

Main number: the tab list on the recording's clock (gtr-eval `tab` on the assembled `answer.json`), and its parts; the
same per unit against the unit index (is there a slope?); minutes, tokens and list-price cost per unit by thirds of the
song (is it faster later?); revisions and their verdicts; tuning changes; window corrections. Never shown to the writer.
