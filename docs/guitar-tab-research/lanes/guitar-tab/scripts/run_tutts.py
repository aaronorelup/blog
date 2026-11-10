"""Glue (guitar-tab lane) around tutts 0.1.0: MIDI -> tutts note model (beats) -> node run_tutts.mjs -> gtr-eval file.
startBeats = tick / ticks_per_beat (pretty_midi time_to_tick), durationBeats likewise; tempo = the MIDI file's first
tempo (only used by tutts for its optional 'seconds' field); time signature from the MIDI (4/4 if none). The gtr-eval
onset of each output event = the original MIDI time of that beat position (pretty_midi tick_to_time), string = tutts
index + 1, pitch = tutts 'midi'.
usage: python run_tutts.py in.mid outdir --name N [--tuning 40,45,50,55,59,64] [--capo 0] [--nfrets 20] [--quantize 1/16]"""
import argparse, json, subprocess, os, time
from pathlib import Path
import pretty_midi
ap = argparse.ArgumentParser()
ap.add_argument("midi"); ap.add_argument("outdir"); ap.add_argument("--name", required=True)
ap.add_argument("--tuning", default="40,45,50,55,59,64"); ap.add_argument("--capo", type=int, default=0)
ap.add_argument("--nfrets", type=int, default=20); ap.add_argument("--quantize", default=None)
a = ap.parse_args()
out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
pm = pretty_midi.PrettyMIDI(a.midi); tpb = pm.resolution
notes = []
for inst in pm.instruments:
    if inst.is_drum: continue
    for n in inst.notes:
        s = pm.time_to_tick(n.start); e = pm.time_to_tick(n.end)
        notes.append({"midi": n.pitch, "startBeats": s / tpb, "durationBeats": max(e - s, 1) / tpb})
tempo = pm.get_tempo_changes()[1][0] if len(pm.get_tempo_changes()[1]) else 120.0
ts = [{"startBeats": pm.time_to_tick(t.time) / tpb, "numerator": t.numerator, "denominator": t.denominator} for t in pm.time_signature_changes]
tun = [int(x) + a.capo for x in a.tuning.split(",")]
inp = {"notes": notes, "tuning": [pretty_midi.note_number_to_name(p) for p in reversed(tun)], "nfrets": a.nfrets - a.capo,
       "tempo": float(tempo)}
if ts: inp["timeSignatures"] = ts
if a.quantize: inp["quantizeGrid"] = a.quantize
jin = out / f"{a.name}.tutts.in.json"; jin.write_text(json.dumps(inp))
env = dict(os.environ, TUTTS_PATH="/home/user/gtr/lanes/guitar-tab/node-tutts/node_modules/tutts/dist/index.js")
p = subprocess.run(["node", "/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts/run_tutts.mjs", str(jin), str(out / a.name)],
                   capture_output=True, text=True, env=env)
print(p.stdout.strip(), p.stderr.strip()[-500:])
data = json.loads((out / f"{a.name}.tutts.json").read_text())
res = []
for m in data["measures"]:
    for ev in m["events"]:
        for n in ev.get("notes") or []:
            res.append({"onset": round(pm.tick_to_time(int(round(ev["beats"] * tpb))), 6), "pitch": n["midi"],
                        "string": n["string"] + 1, "fret": n["fret"]})
json.dump({"tool": "tutts 0.1.0", "tuning_midi": [int(x) for x in a.tuning.split(",")], "capo": a.capo, "settings": vars(a),
           "ts_given": ts, "notes": res}, open(out / f"{a.name}.gtreval.json", "w"), indent=1)
print(f"{a.name}: notes in {len(notes)}, tab notes {len(res)}")
