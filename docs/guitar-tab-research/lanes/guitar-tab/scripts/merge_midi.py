"""Glue code (guitar-tab lane): merge every track of a MIDI file into ONE track on channel 0.

Why: the shared truth MIDI files are type 1 with several tracks (S2-family: 'melody' + 'bass';
R1a-c: one track per guitar string, which would leak the string answer to a tool). Tools such as
tayuya read a single track. Tick times, tempo map and time signature are kept exactly
(mido.merge_tracks); every channel message is moved to channel 0; only the first program_change
is kept; track names are dropped.

usage: python merge_midi.py in.mid out.mid [--transpose N] [--vel0-to-noteoff]
  --transpose N  adds N semitones to every note (used ONLY for the 'capo told by transposing'
                 workaround on tools that have no capo parameter; written next to the result)
"""
import sys, argparse, mido

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst"); ap.add_argument("--transpose", type=int, default=0)
ap.add_argument("--vel0-to-noteoff", action="store_true", help="rewrite note_on with velocity 0 as note_off (same MIDI meaning)")
a = ap.parse_args()
m = mido.MidiFile(a.src)
merged = mido.merge_tracks(m.tracks)
out = mido.MidiTrack()
seen_prog = False
pending = 0  # delta ticks carried over from dropped messages
for msg in merged:
    if msg.is_meta and msg.type == "track_name":
        pending += msg.time; continue
    if msg.type == "program_change":
        if seen_prog:
            pending += msg.time; continue
        seen_prog = True
    if hasattr(msg, "channel"):
        msg = msg.copy(channel=0)
    if a.vel0_to_noteoff and msg.type == "note_on" and msg.velocity == 0:
        msg = mido.Message("note_off", channel=msg.channel, note=msg.note, velocity=0, time=msg.time)
    if msg.type in ("note_on", "note_off") and a.transpose:
        msg = msg.copy(note=msg.note + a.transpose)
    msg = msg.copy(time=msg.time + pending); pending = 0
    out.append(msg)
mf = mido.MidiFile(type=0, ticks_per_beat=m.ticks_per_beat)
mf.tracks.append(out)
mf.save(a.dst)
n_on = sum(1 for x in out if x.type == "note_on" and x.velocity > 0)
print(f"{a.dst}: 1 track, {n_on} note_on, tpb {m.ticks_per_beat}, transpose {a.transpose}")
