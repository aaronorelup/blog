"""Write a plain MIDI file (one track, program 24 nylon guitar, velocity 80 unless the CSV has one, 120 BPM,
480 ticks per quarter) from a lane notes CSV (onset_s,offset_s,pitch_midi[,...]). This is a lane conversion so other
lanes can read the note lists of tools that do not write MIDI themselves.
usage: python notes_csv_to_midi.py <in.csv> <out.mid>"""
import csv, sys
import pretty_midi
rows = list(csv.DictReader(open(sys.argv[1])))
pm = pretty_midi.PrettyMIDI(resolution=480, initial_tempo=120.0)
inst = pretty_midi.Instrument(program=24, name="lane conversion from " + sys.argv[1].split("/")[-1])
for r in rows:
    v = int(float(r["velocity"])) if r.get("velocity") not in (None, "") else 80
    inst.notes.append(pretty_midi.Note(velocity=max(1, min(127, v)), pitch=int(round(float(r["pitch_midi"]))),
                                       start=float(r["onset_s"]), end=max(float(r["offset_s"]), float(r["onset_s"]) + 0.001)))
pm.instruments.append(inst)
pm.write(sys.argv[2])
