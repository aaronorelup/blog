"""Run tabsynth 1.0.6 (events in Hz and seconds -> DP/Viterbi over candidate fingerings -> tab) on one MIDI file.
Glue (guitar-tab lane): MIDI notes (pretty_midi, non-drum instruments pooled) become tabsynth events:
  --mode groups : notes whose onsets are within --chord-window s (default 0.03) of a group's first onset form one
                  ChordEvent(pitches_hz, start, duration) (duration = the longest note of the group); a lone note is a
                  NoteEvent(pitch_hz, start, duration). This is how tabsynth's own demos mix notes and chords.
  --mode notes  : every note is its own NoteEvent (polyphony ignored).
Calls tabsynth.pipeline.events_to_tablature(events, output_format=..., max_fret=..., tolerance_cents=...) twice
(ascii and json). The gtr-eval file lists every (string, fret) of every returned state at the state's start time,
pitch = standard tuning + fret (tabsynth has no tuning argument in this pipeline).
usage: python run_tabsynth.py in.mid outdir --name N [--mode groups|notes] [--max-fret 15] [--tolerance-cents 50]
       [--transpose 0]   (adds semitones to every note before tabsynth sees it; used for the capo workaround)"""
import argparse, json, time
from pathlib import Path
import pretty_midi
from tabsynth.model import NoteEvent, ChordEvent
from tabsynth.pipeline import events_to_tablature

ap = argparse.ArgumentParser()
ap.add_argument("midi"); ap.add_argument("outdir"); ap.add_argument("--name", required=True)
ap.add_argument("--mode", default="groups", choices=["groups", "notes"]); ap.add_argument("--chord-window", type=float, default=0.03)
ap.add_argument("--max-fret", type=int, default=15); ap.add_argument("--tolerance-cents", type=float, default=50.0)
ap.add_argument("--transpose", type=int, default=0)
a = ap.parse_args()
out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
pm = pretty_midi.PrettyMIDI(a.midi)
notes = sorted([(n.start, n.end, n.pitch + a.transpose) for i in pm.instruments if not i.is_drum for n in i.notes])
hz = lambda p: 440.0 * 2 ** ((p - 69) / 12)
events = []
if a.mode == "notes":
    events = [NoteEvent(pitch_hz=hz(p), start=s, duration=max(e - s, 1e-3)) for s, e, p in notes]
else:
    groups = []
    for s, e, p in notes:
        if groups and s - groups[-1][0] <= a.chord_window:
            groups[-1][1].append(p); groups[-1][2] = max(groups[-1][2], e)
        else:
            groups.append([s, [p], e])
    for s, ps, e in groups:
        if len(ps) == 1:
            events.append(NoteEvent(pitch_hz=hz(ps[0]), start=s, duration=max(e - s, 1e-3)))
        else:
            events.append(ChordEvent(pitches_hz=[hz(p) for p in sorted(ps)], start=s, duration=max(e - s, 1e-3)))
t0 = time.time()
asc = events_to_tablature(events, output_format="ascii", max_fret=a.max_fret, tolerance_cents=a.tolerance_cents)
js = events_to_tablature(events, output_format="json", max_fret=a.max_fret, tolerance_cents=a.tolerance_cents)
t1 = time.time()
(out / f"{a.name}.tabsynth.txt").write_text(asc); (out / f"{a.name}.tabsynth.json").write_text(js)
states = json.loads(js)
tun = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}
res = []
for st in states:
    for s, f in st["frets"].items():
        res.append({"onset": round(st["start"], 6), "pitch": tun[int(s)] + f - a.transpose, "string": int(s), "fret": f,
                    "kind": st["kind"], "chord_id": st["chord_id"]})
json.dump({"tool": "tabsynth 1.0.6", "tuning_midi": [40, 45, 50, 55, 59, 64], "capo": 0, "settings": vars(a),
           "n_events_in": len(events), "n_states_out": len(states), "notes": res}, open(out / f"{a.name}.gtreval.json", "w"), indent=1)
kinds = {}
for st in states: kinds[st["kind"]] = kinds.get(st["kind"], 0) + 1
print(f"{a.name}: midi notes {len(notes)}, events in {len(events)} ({sum(isinstance(e, ChordEvent) for e in events)} chord events), "
      f"states out {len(states)} {kinds}, tab notes {len(res)}, tabsynth time {t1-t0:.2f}s (two calls)")
