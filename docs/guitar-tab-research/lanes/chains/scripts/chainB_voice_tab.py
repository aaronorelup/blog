"""Chain B glue: voice-labelled notes -> tuttut 0.0.7 string/fret, two ways, and the joins between them.

usage: python chainB_voice_tab.py <voice csv: onset,offset,pitch,voice> <outdir> --name N

(a) pooled:   every labelled note in one MIDI file -> one tuttut run (tuttut has no voice input; it pools all
              instruments) -> each tab note gets back the label of the input note with the same onset (within 2.5 ms: tuttut reads the MIDI tick times, 220 ticks per quarter at 120 BPM = 2.27 ms per tick)
              and the same pitch class (tuttut may move a note by octaves, fix_oob_notes).
(b) separate: the bass-labelled notes and the melody-labelled notes as two MIDI files -> two tuttut runs.
Writes gtr-eval tab JSON files: <N>.pooled.{all,bass,melody}.gtreval.json, <N>.sep.{all,bass,melody}.gtreval.json,
and <N>.chainB.json with the counts: notes in / out per run, notes whose label could not be joined back,
and "collisions": pairs of one bass-labelled and one melody-labelled tab note on the same string whose sounding
intervals (input onset to input offset) overlap.
"""
import argparse, csv, json, time
from pathlib import Path
import pretty_midi
from tuttut.logic.tab import Tab
from tuttut.logic.theory import Tuning

STD = [40, 45, 50, 55, 59, 64]
ap = argparse.ArgumentParser()
ap.add_argument("csv"); ap.add_argument("outdir"); ap.add_argument("--name", required=True)
a = ap.parse_args()
out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
rows = [{"onset": float(r["onset"]), "offset": float(r["offset"]), "pitch": int(round(float(r["pitch"]))),
         "voice": r["voice"]} for r in csv.DictReader(open(a.csv))]


def write_midi(notes, path):
    pm = pretty_midi.PrettyMIDI(initial_tempo=120.0)
    inst = pretty_midi.Instrument(program=25)
    for n in notes:
        inst.notes.append(pretty_midi.Note(velocity=80, pitch=n["pitch"], start=n["onset"],
                                           end=max(n["offset"], n["onset"] + 0.01)))
    pm.instruments.append(inst)
    pm.write(str(path))


def run_tuttut(notes, tag):
    mid = out / f"{a.name}.{tag}.in.mid"
    write_midi(notes, mid)
    strings = [pretty_midi.note_number_to_name(p) for p in reversed(STD)]
    t0 = time.perf_counter()
    tab = Tab(f"{a.name}.{tag}", Tuning(strings, 20), pretty_midi.PrettyMIDI(str(mid)), output_dir=out)
    dt = time.perf_counter() - t0
    tab.to_ascii(); tab.to_json()
    res = []
    for meas in tab.tab["measures"]:
        for ev in meas["events"]:
            for n in ev.get("notes", []):
                res.append({"onset": round(ev["time"], 6),
                            "pitch": pretty_midi.note_name_to_number(n["degree"] + n["octave"]),
                            "string": n["string"] + 1, "fret": n["fret"]})
    return res, dt


def join_labels(tabnotes, src):
    unjoined = 0
    used = set()
    for t in tabnotes:
        best = None
        for i, s in enumerate(src):
            if i in used or abs(s["onset"] - t["onset"]) > 0.0025 or (s["pitch"] - t["pitch"]) % 12:
                continue
            if best is None or abs(s["pitch"] - t["pitch"]) < abs(src[best]["pitch"] - t["pitch"]):
                best = i
        if best is None:
            t["voice"] = None; t["offset"] = None; unjoined += 1
        else:
            used.add(best); t["voice"] = src[best]["voice"]; t["offset"] = src[best]["offset"]
            t["pitch_in"] = src[best]["pitch"]
    return unjoined


def collisions(tabnotes):
    b = [t for t in tabnotes if t.get("voice") == "bass" and t.get("offset") is not None]
    m = [t for t in tabnotes if t.get("voice") == "melody" and t.get("offset") is not None]
    return sum(1 for x in b for y in m if x["string"] == y["string"]
               and x["onset"] < y["offset"] and y["onset"] < x["offset"])


def dump(notes, tag):
    (out / f"{a.name}.{tag}.gtreval.json").write_text(json.dumps(
        {"tool": "tuttut 0.0.7 via chainB_voice_tab.py", "tuning_midi": STD, "capo": 0, "notes": notes}, indent=0))


rep = {"input_csv": a.csv, "n_in": len(rows), "n_in_bass": sum(r["voice"] == "bass" for r in rows),
       "n_in_melody": sum(r["voice"] == "melody" for r in rows)}
pooled, dt = run_tuttut(rows, "pooled")
rep["pooled"] = {"n_out": len(pooled), "tuttut_s": round(dt, 3), "unjoined": join_labels(pooled, rows)}
rep["pooled"]["collisions"] = collisions(pooled)
dump(pooled, "pooled.all")
for v in ("bass", "melody"):
    dump([t for t in pooled if t.get("voice") == v], f"pooled.{v}")
sep = []
rep["sep"] = {}
for v in ("bass", "melody"):
    src = [r for r in rows if r["voice"] == v]
    res, dt = run_tuttut(src, f"sep.{v}")
    un = join_labels(res, src)
    rep["sep"][v] = {"n_in": len(src), "n_out": len(res), "tuttut_s": round(dt, 3), "unjoined": un}
    dump(res, f"sep.{v}")
    sep += res
rep["sep"]["collisions"] = collisions(sep)
dump(sep, "sep.all")
# what changed between the two ways: same input note (onset, input pitch) -> (string, fret)
key = lambda t: (round(t["onset"], 3), t.get("pitch_in"))
pm = {key(t): (t["string"], t["fret"]) for t in pooled if t.get("pitch_in") is not None}
sm = {key(t): (t["string"], t["fret"]) for t in sep if t.get("pitch_in") is not None}
common = set(pm) & set(sm)
rep["pooled_vs_sep"] = {"notes_in_both": len(common), "same_string_and_fret": sum(pm[k] == sm[k] for k in common)}
(out / f"{a.name}.chainB.json").write_text(json.dumps(rep, indent=1))
print(json.dumps(rep))
