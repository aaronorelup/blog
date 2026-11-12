#!/usr/bin/env python3
"""verify-gapfill-audio-to-notes, round 2: corrections to tools.json found when checking gap round 2.
usage: python3 fix_tools_json.py <tools.json>
Keeps the file's layout (json.dumps(indent=0, ensure_ascii=False), no trailing newline). Idempotent: each change is
applied only if the old text is still there; prints what changed."""
import json, sys
path = sys.argv[1]
raw = open(path, 'rb').read()
d = json.loads(raw)
assert json.dumps(d, indent=0, ensure_ascii=False).encode() == raw, 'layout differs from indent=0'
by = {t['name']: t for t in d['tools']}
changes = []
def sub(entry, key, old, new, idx=None):
    t = by[entry]
    v = t[key] if idx is None else t[key][idx]
    if old in v:
        v2 = v.replace(old, new)
        if idx is None: t[key] = v2
        else: t[key][idx] = v2
        changes.append(f'{entry}.{key}{"" if idx is None else f"[{idx}]"}')
Y = 'yourmt3 (PyPI, third party)'
sub(Y, 'outputs', 'a MIDI file written by note_event2midi: MidiFile(ticks_per_beat=480, type=0), default velocity 100, set_tempo commented out, one channel per program (0-8, 10-15), drums as internal program 128; from the code, not observed',
    'a MIDI file written by note_event2midi: MidiFile(ticks_per_beat=480, type=0) followed by midi.type = 1, so type 1: an empty first track, then one track per program with a track_name and a program_change; every note-on at velocity 100 (the default; predict() passes none); no tempo message (set_tempo commented out; ticks at 500,000 microseconds per beat); one channel per program (0-8, 10-15), drums on channel 9 as internal program 128; from the code (yourmt3/utils/midi.py), not observed; corrected by verify-gapfill-audio-to-notes round 2 (2026-11-11)', idx=0)
sub(Y, 'checkpoint_facts', 'YPTF+Single.pt 121,781,787 bytes (taken: the smallest)',
    'YPTF+Single.pt 121,781,787 bytes (taken: the smallest of the six YourMT3 .pt files; the repository has 80 files, among them smaller CREPE, Basic Pitch, Omnizart and MELODIA files that this package does not load)')
for e in ('melodyExtraction_JDC', 'melodyExtraction_SSL'):
    sub(e, 'not_run_reason', 'and no TensorFlow or Keras venv was on the box (trials.md, Gap round 2, A5). README pins',
        'and no TensorFlow or Keras venv was on the box (trials.md, Gap round 2, A5); this tool itself was not attempted after that refusal. README lists')
out = json.dumps(d, indent=0, ensure_ascii=False).encode()
open(path, 'wb').write(out)
print('changed:', changes, 'bytes', len(raw), '->', len(out))
