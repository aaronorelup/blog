"""Run tuttut 0.0.7 (MIDI -> guitar tab, HMM + Viterbi) on one MIDI file and write
   (1) tuttut's own outputs: <name>.txt (ASCII tab, Tab.to_ascii) and <name>.json (Tab.to_json)
   (2) <name>.gtreval.json: glue code (guitar-tab lane) turning tuttut's JSON into the note list
       gtr-eval tab reads: {"tuning_midi": [low..high], "capo": N, "notes": [{onset, pitch, string, fret}]}
       string = tuttut string index + 1 (index 0 = first entry of the tuning = thinnest string),
       pitch = MIDI number of tuttut's note name (degree + octave), onset = tuttut's event "time" (s).

Constraint parameters actually present in tuttut 0.0.7 (read from its source):
   Tuning(strings=[note names, thin to thick], nfrets=20)       -> --tuning, --nfrets
   Tab(..., weights={"b":1,"height":1,"length":1,"n_changed_strings":1})  -> --weights b,height,length,n_changed_strings
   tuttut.logic.fretboard.MAX_FRET_SPAN = 5 (module constant, not an argument) -> --max-span (monkey-patched here)
   No capo argument. --capo N is glue: every open string is raised N semitones and nfrets reduced by N, so the
   frets tuttut returns are counted from the capo; the gtr-eval file then states the unraised tuning and capo N.
"""
import argparse, json, sys, time
from pathlib import Path
import pretty_midi
import tuttut.logic.fretboard as fb
from tuttut.logic.tab import Tab
from tuttut.logic.theory import Tuning

ap = argparse.ArgumentParser()
ap.add_argument("midi"); ap.add_argument("outdir"); ap.add_argument("--name", required=True)
ap.add_argument("--tuning", default="40,45,50,55,59,64", help="open strings low->high as MIDI numbers")
ap.add_argument("--nfrets", type=int, default=20)
ap.add_argument("--capo", type=int, default=0)
ap.add_argument("--max-span", type=int, default=None)
ap.add_argument("--weights", default=None)
a = ap.parse_args()

tun_low_high = [int(x) for x in a.tuning.split(",")]
strings_thin_to_thick = [pretty_midi.note_number_to_name(p + a.capo) for p in reversed(tun_low_high)]
if a.max_span is not None:
    fb.MAX_FRET_SPAN = a.max_span
weights = None
if a.weights:
    w = [float(x) for x in a.weights.split(",")]
    weights = dict(zip(["b", "height", "length", "n_changed_strings"], w))
out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
t0 = time.time()
midi = pretty_midi.PrettyMIDI(a.midi)
tab = Tab(a.name, Tuning(strings_thin_to_thick, a.nfrets - a.capo), midi, output_dir=out, weights=weights)
tab.to_ascii(); tab.to_json()
t1 = time.time()
notes = []
for meas in tab.tab["measures"]:
    for ev in meas["events"]:
        for n in ev.get("notes", []):
            notes.append({"onset": round(ev["time"], 6),
                          "pitch": pretty_midi.note_name_to_number(n["degree"] + n["octave"]),
                          "string": n["string"] + 1, "fret": n["fret"]})
res = {"tool": "tuttut 0.0.7", "tuning_midi": tun_low_high, "capo": a.capo,
       "tuttut_strings_thin_to_thick": strings_thin_to_thick, "nfrets_given_to_tuttut": a.nfrets - a.capo,
       "max_fret_span": fb.MAX_FRET_SPAN, "weights": tab.weights, "notes": notes}
(out / f"{a.name}.gtreval.json").write_text(json.dumps(res, indent=1))
n_in = sum(len(i.notes) for i in midi.instruments if not i.is_drum)
print(f"{a.name}: notes in {n_in}, notes out {len(notes)}, tuttut time {t1-t0:.2f}s, strings {strings_thin_to_thick}, nfrets {a.nfrets - a.capo}, span {fb.MAX_FRET_SPAN}")
