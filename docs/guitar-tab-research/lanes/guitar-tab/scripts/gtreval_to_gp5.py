"""Glue (guitar-tab lane): write a tool's string/fret note list (the gtr-eval JSON this lane writes for every tool) as a
Guitar Pro 5 file with PyGuitarPro 0.11, so a tab editor (TuxGuitar, Guitar Pro, alphaTab) can open it.
- one track, 6 strings, tuning from the file's tuning_midi, capo written as Track.offset (PyGuitarPro's capo field);
- rhythm: every onset is snapped to a 16th-note grid of the given tempo (--bpm) and --start (first beat time, s);
  each onset group becomes one beat of a 16th note, gaps are filled with 16th rests; 4/4 measures.
  This keeps string, fret and the order of notes; durations are NOT the played durations.
usage: python gtreval_to_gp5.py in.gtreval.json out.gp5 --bpm 112 [--start 0.0] [--title T]"""
import argparse, json, math
import guitarpro as gp

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst"); ap.add_argument("--bpm", type=float, required=True)
ap.add_argument("--start", type=float, default=0.0); ap.add_argument("--title", default="")
a = ap.parse_args()
d = json.load(open(a.src))
tun = d.get("tuning_midi", [40, 45, 50, 55, 59, 64]); capo = int(d.get("capo", 0) or 0)
sixteenth = 60.0 / a.bpm / 4
slots = {}
for n in d["notes"]:
    k = max(0, int(round((n["onset"] - a.start) / sixteenth)))
    slots.setdefault(k, {})
    slots[k].setdefault(n["string"], n["fret"])          # one note per string per 16th slot
n_slots = (max(slots) + 1) if slots else 1
n_meas = math.ceil(n_slots / 16)
song = gp.Song(); song.title = a.title; song.tempo = int(round(a.bpm))
track = song.tracks[0]; track.name = "guitar"
track.strings = [gp.GuitarString(i + 1, tun[5 - i]) for i in range(6)]     # string 1 (highest) first
track.offset = capo
while len(song.measureHeaders) < n_meas:
    h = gp.MeasureHeader(); h.number = len(song.measureHeaders) + 1
    h.start = song.measureHeaders[-1].start + song.measureHeaders[-1].length
    song.addMeasureHeader(h)
for t in song.tracks:
    while len(t.measures) < n_meas:
        t.measures.append(gp.Measure(t, song.measureHeaders[len(t.measures)]))
written = 0
for mi in range(n_meas):
    voice = track.measures[mi].voices[0]; voice.beats.clear()
    for s in range(16):
        k = mi * 16 + s
        beat = gp.Beat(voice, duration=gp.Duration(value=16))
        if k in slots:
            beat.status = gp.BeatStatus.normal
            for string, fret in sorted(slots[k].items()):
                beat.notes.append(gp.Note(beat, value=fret, string=string, type=gp.NoteType.normal)); written += 1
        else:
            beat.status = gp.BeatStatus.rest
        voice.beats.append(beat)
gp.write(song, a.dst)
print(f"{a.dst}: {written} notes written of {len(d['notes'])} in the list, {n_meas} measures, tuning {tun}, capo {capo}")
