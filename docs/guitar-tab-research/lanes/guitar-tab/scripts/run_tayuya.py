"""Run tayuya 0.0.4 (MIDI -> guitar tab for single-note lines) on one single-track MIDI file.
Writes <name>.tayuya.txt (tayuya's own render(), captured from stdout), <name>.tayuya.raw.json (tayuya's own
generate_notes() list of (note name, string, fret)), and <name>.gtreval.json (glue code, guitar-tab lane).

Glue: tayuya returns no times. Its list has one entry per note_on message of the track, in file order
(MIDIParser.notes_played() filters note_on messages), so the glue walks the same track with mido, sums the delta
ticks into seconds with the file's tempo map (mido.tick2second, tempo changes followed) and gives entry i the onset
of the i-th note_on. Pitch in the gtr-eval file = the MIDI number of tayuya's returned note name (tayuya may rename a
note, see trials.md), string and fret as tayuya returned them. tuning_midi standard, capo 0 (tayuya has neither).
"""
import argparse, contextlib, io, json, time
from pathlib import Path
import mido, pretty_midi
from tayuya import MIDIParser
from tayuya.tabs import Tabs

ap = argparse.ArgumentParser()
ap.add_argument("midi"); ap.add_argument("outdir"); ap.add_argument("--name", required=True)
ap.add_argument("--track", type=int, default=0)
a = ap.parse_args()
out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
t0 = time.time()
mid = MIDIParser(a.midi, track=a.track)
key = mid.get_key()
played = mid.notes_played()
tabs = Tabs(notes=played, key=key)
to_play = tabs.generate_notes()
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    mid2 = MIDIParser(a.midi, track=a.track)
    mid2.render_tabs()
t1 = time.time()
(out / f"{a.name}.tayuya.txt").write_text(buf.getvalue())
(out / f"{a.name}.tayuya.raw.json").write_text(json.dumps({"key": [str(key[0]), key[1]], "notes": to_play}))
# glue: onset of the i-th note_on of the same track
mf = mido.MidiFile(a.midi)
tempo = 500000; t = 0.0; onsets = []
for msg in mf.tracks[a.track]:
    t += mido.tick2second(msg.time, mf.ticks_per_beat, tempo)
    if msg.type == "set_tempo": tempo = msg.tempo
    if msg.type == "note_on": onsets.append(t)
assert len(onsets) == len(to_play), (len(onsets), len(to_play))
notes = []
for (name, s, f), on in zip(to_play, onsets):
    notes.append({"onset": round(on, 6), "pitch": pretty_midi.note_name_to_number(name),
                  "string": int(s), "fret": int(f), "tayuya_note_name": name})
(out / f"{a.name}.gtreval.json").write_text(json.dumps({"tool": "tayuya 0.0.4", "tuning_midi": [40, 45, 50, 55, 59, 64],
                                                         "capo": 0, "key_detected": [str(key[0]), key[1]], "notes": notes}, indent=1))
print(f"{a.name}: note_on in track {len(onsets)}, notes out {len(to_play)}, key {key}, tayuya time {t1-t0:.2f}s")
