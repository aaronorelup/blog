"""gap round 2 (guitar-tab lane): glue around scorify 0.4.0 (npm). Reads a single-track MIDI file (this lane's merged
truth MIDI), writes scorify's input (exact tick times as rationals of the MIDI's ticks per quarter note, the tempo map,
the first time signature, note names spelled with sharps), runs scripts/gap2_run_scorify.mjs with Node from the
node-scorify folder, and turns scorify's per-note string and fret into the gtr-eval note list (onset s, pitch, string,
fret counted from the capo; tuning_midi and capo stated).

Options (all optional): --mode exact|adaptive, --allow-hold-shortening, --allow-octave-shift (adaptive-mode
permissions), --override name=value (a player capability), --beam N, --max-candidates N, --max-expanded N (scorify search limits), --tuning 38,45,50,55,59,64 (MIDI, low to high), --capo N, --level <scorify level>, --right-hand pick|strum,
--group-ms X (notes whose onsets lie within X ms of the first note of a group get that note's tick, as the LilyPond
glue groups a strum into one chord; the gtr-eval file keeps each note's own onset), --pin <note index>:<string>
(0-based index in onset order; a soft pin through scorify's scoring hook).
usage: python gap2_run_scorify.py in.mid outdir --name NAME [options]"""
import argparse, json, os, subprocess, time
import mido

NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
ap = argparse.ArgumentParser()
ap.add_argument("mid"); ap.add_argument("outdir"); ap.add_argument("--name", required=True)
ap.add_argument("--tuning"); ap.add_argument("--capo", type=int, default=0); ap.add_argument("--level")
ap.add_argument("--right-hand", dest="right_hand"); ap.add_argument("--group-ms", type=float, default=0.0)
ap.add_argument("--pin")
ap.add_argument("--mode", choices=["exact", "adaptive"]); ap.add_argument("--allow-hold-shortening", action="store_true")
ap.add_argument("--allow-octave-shift", action="store_true"); ap.add_argument("--beam", type=int)
ap.add_argument("--max-candidates", type=int); ap.add_argument("--max-expanded", type=int)
ap.add_argument("--override", action="append", default=[], help="player capability, e.g. minDuration=1/256 or maxAttacksPerSecond=64")
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
mf = mido.MidiFile(a.mid)
ppq = mf.ticks_per_beat
tempo_changes, meter, notes, open_ = [], None, [], {}
tick = 0
for msg in mido.merge_tracks(mf.tracks):
    tick += msg.time
    if msg.type == "set_tempo":
        tempo_changes.append((tick, msg.tempo))
    elif msg.type == "time_signature" and meter is None:
        meter = (msg.numerator, msg.denominator)
    elif msg.type == "note_on" and msg.velocity > 0:
        open_.setdefault((msg.channel, msg.note), []).append(tick)
    elif msg.type in ("note_off", "note_on"):
        st = open_.get((msg.channel, msg.note))
        if st:
            notes.append({"tick": st.pop(0), "end": tick, "pitch": msg.note})
if not tempo_changes or tempo_changes[0][0] != 0:
    tempo_changes.insert(0, (0, 500000))
meter = meter or (4, 4)

def sec(t):
    s, last_t, last_tempo = 0.0, 0, tempo_changes[0][1]
    for ct, tp in tempo_changes:
        if ct > t:
            break
        s += (ct - last_t) * last_tempo / 1e6 / ppq; last_t, last_tempo = ct, tp
    return s + (t - last_t) * last_tempo / 1e6 / ppq

notes.sort(key=lambda n: (n["tick"], n["pitch"]))
for i, n in enumerate(notes):
    n["id"] = f"n{i}"; n["sec"] = sec(n["tick"])
# optional onset grouping
gtick, g0 = None, None
for n in notes:
    if a.group_ms > 0 and g0 is not None and (n["sec"] - g0) * 1000.0 <= a.group_ms:
        n["qtick"] = gtick
    else:
        gtick, g0 = n["tick"], n["sec"]; n["qtick"] = n["tick"]
inp = {"name": a.name, "ppq": ppq, "meter": list(meter),
       "tempoMap": [{"tick": t, "bpm": 60e6 / tp} for t, tp in tempo_changes],
       "notes": [{"id": n["id"], "tick": n["qtick"], "durTicks": max(1, n["end"] - n["qtick"]),
                  "name": NAMES[n["pitch"] % 12] + str(n["pitch"] // 12 - 1)} for n in notes],
       "tuning": None, "capo": a.capo, "level": a.level, "rightHand": a.right_hand, "pin": None}
if a.mode:
    inp["mode"] = a.mode
if a.override:
    inp["overrides"] = {}
    for kv in a.override:
        k, v = kv.split("=")
        inp["overrides"][k] = [int(x) for x in v.split("/")] if "/" in v else float(v)
adapt = {k: True for k, v in (("allowHoldShortening", a.allow_hold_shortening), ("allowOctaveShift", a.allow_octave_shift)) if v}
if adapt:
    inp["adaptation"] = adapt
srch = {k: v for k, v in (("beamWidth", a.beam), ("maxCandidatesPerFrame", a.max_candidates),
                          ("maxExpandedStates", a.max_expanded)) if v}
if srch:
    inp["search"] = srch
tuning = [40, 45, 50, 55, 59, 64]
if a.tuning:
    tuning = [int(x) for x in a.tuning.split(",")]
    inp["tuning"] = [NAMES[m % 12] + str(m // 12 - 1) for m in tuning]
if a.pin:
    idx, s = a.pin.split(":")
    inp["pin"] = {"id": f"n{int(idx)}", "string": int(s)}
base = os.path.join(a.outdir, a.name)
json.dump(inp, open(base + ".scorify.in.json", "w"), indent=1)
here = os.path.dirname(os.path.abspath(__file__))
t0 = time.time()
p = subprocess.run(["node", os.path.join(here, "gap2_run_scorify.mjs"), base + ".scorify.in.json", base + ".scorify.out.json"],
                   cwd="/home/user/gtr/lanes/guitar-tab/node-scorify", capture_output=True, text=True,
                   env=dict(os.environ, SCORIFY_PATH="/home/user/gtr/lanes/guitar-tab/node-scorify/node_modules/scorify/dist/index.mjs"))
wall = time.time() - t0
print(p.stdout.strip(), p.stderr.strip()[-600:], f"(node process {wall:.2f} s)")
out = json.load(open(base + ".scorify.out.json"))
by_id = {n["id"]: n for n in out["notes"]}
outp = {n["id"]: n for n in out.get("outputNotes", [])}
smap = out.get("sourceMap", {})
est = []
for n in notes:
    for oid in smap.get(n["id"], [n["id"]]):        # output note ids of this source note (the same id in exact mode)
        r = by_id.get(oid)
        if r is None:
            continue
        pitch = outp[oid]["midi"] if oid in outp else n["pitch"]   # the realized pitch (an octave edit changes it)
        est.append({"onset": round(n["sec"], 6), "pitch": pitch, "string": r["string"], "fret": r["relativeFret"],
                    "finger": r["finger"], "source_pitch": n["pitch"]})
json.dump({"tool": "scorify 0.4.0 arrange (exact mode)", "tuning_midi": tuning, "capo": a.capo,
           "status": out["status"], "edits": out.get("edits", []), "notes": est}, open(base + ".gtreval.json", "w"), indent=1)
