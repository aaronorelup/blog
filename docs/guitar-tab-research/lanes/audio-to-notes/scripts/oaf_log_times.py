"""Gap round 1: per-file seconds of Magenta's onsets_frames_transcription_transcribe, from its absl log.

usage: python oaf_log_times.py <run log> <midi> [<midi> ...]
For each input the time from "Starting transcription for <file>" to "Transcription written to <file>.midi"
(absl timestamps, same day), plus the MIDI facts of each written file (needs pretty_midi and mido: run with the
gtr-eval venv's Python). Prints JSON.
"""
import json
import re
import sys
from datetime import datetime

import mido
import pretty_midi

log, mids = sys.argv[1], sys.argv[2:]
pat = re.compile(r"^I\d{4} (\d\d:\d\d:\d\d\.\d+) \d+ \S+\] (Starting transcription for (.+)\.\.\.|Transcription written to (.+)\.)$")
start, out = {}, {"per_file_s": {}, "midi": {}}
for line in open(log, errors="replace"):
    m = pat.match(line.rstrip("\n"))
    if not m:
        continue
    t = datetime.strptime(m.group(1), "%H:%M:%S.%f")
    if m.group(3):
        start[m.group(3)] = t
    else:
        f = m.group(4)[: -len(".midi")]
        out["per_file_s"][f.split("/")[-1]] = round((t - start[f]).total_seconds(), 3)
for f in mids:
    pm, mf = pretty_midi.PrettyMIDI(f), mido.MidiFile(f)
    notes = [n for i in pm.instruments for n in i.notes]
    out["midi"][f.split("/")[-1]] = {
        "type": mf.type, "ticks_per_quarter": mf.ticks_per_beat, "tracks": len(mf.tracks),
        "tempi": [float(x) for x in pm.get_tempo_changes()[1]],
        "instruments": [{"program": int(i.program), "is_drum": i.is_drum, "notes": len(i.notes),
                         "control_changes": len(i.control_changes), "pitch_bends": len(i.pitch_bends)}
                        for i in pm.instruments],
        "velocity_min_max": [min(n.velocity for n in notes), max(n.velocity for n in notes)] if notes else None,
        "pitch_min_max": [min(n.pitch for n in notes), max(n.pitch for n in notes)] if notes else None,
    }
print(json.dumps(out, indent=1))
