"""Gap round 1: MusicXML input files for Cluster and Separate (piano_svsep), which this box could not run.

The S2n file `samples/voice-split/S2n_truth_merged_single_track.musicxml` was written in the first round by music21
from `out/voice-split/S2n_truth/merged_single_track.mid` (the 90 truth notes with onset, offset and pitch only, one
track, written by voice_split.py with pretty_midi at the clip's tempo). This script writes the same for any clip with
music21's own MusicXML writer and prints what is in the file (parts, notes, chords, <voice> numbers), so the S5dropd
file is made the same way.

usage: python gap1_svsep_inputs.py <merged_single_track.mid> <out.musicxml>
"""
import re
import sys

import music21

mid, out = sys.argv[1], sys.argv[2]
s = music21.converter.parse(mid)
s.write("musicxml", fp=out)
x = open(out, encoding="utf-8").read()
voices = re.findall(r"<voice>(\d+)</voice>", x)
print({"music21": music21.__version__, "parts": len(s.parts), "pitches": len(s.flatten().pitches),
       "note_elements": x.count("<note"), "chord_tags": len(re.findall(r"<chord\s*/>", x)),
       "voice_tags": {v: voices.count(v) for v in sorted(set(voices))}, "bytes": len(x.encode("utf-8"))})
