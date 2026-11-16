#!/usr/bin/env python3
"""music21 trial: build a score from a truth JSON with string and fret on every note, write MusicXML, read it back.

Usage: python -I music21_truth_to_musicxml.py <id>.truth.json <out_dir> [--tab-only]

- one Part; per bar one Measure with one stream.Voice per truth voice (melody, bass), notes and rests on a 16th grid;
- every note gets articulations.StringIndication(string) and articulations.FretIndication(fret)
  (music21 writes these as <technical><string>/<fret>);
- by default a treble-8vb clef (standard notation with string/fret marks); with --tab-only a TabClef and
  layout.StaffLayout(staffLines=6) instead, to see whether music21 writes a tablature staff;
- writes <out_dir>/<id>.music21[.tab].musicxml, then parses that file back with music21 and counts notes with
  string/fret.
"""
import json
import os
import sys
import time

from music21 import (articulations, clef, converter, duration, layout, meter, note, stream, tempo, metadata,
                     __version__ as m21version)

PIECES = [16, 12, 8, 6, 4, 3, 2, 1]


def split(u):
    out = []
    for s in PIECES:
        while u >= s:
            out.append(s)
            u -= s
    return out


def main():
    src, out_dir = sys.argv[1], sys.argv[2]
    tab_only = '--tab-only' in sys.argv
    t0 = time.time()
    t = json.load(open(src))
    six = 60.0 / t['tempo_bpm'] / 4
    num, den = (int(x) for x in t['time_signature'].split('/'))
    bar_units = num * 16 // den
    notes = [n for n in t['notes'] if n.get('string') and n.get('fret') is not None]
    voices = sorted({n['voice'] for n in notes}, key=lambda v: (v != 'melody', v))
    n_bars = int(round(max(n['onset'] for n in notes) / six)) // bar_units + 1
    sc = stream.Score()
    sc.insert(0, metadata.Metadata(title=t['title']))
    part = stream.Part()
    part.partName = 'Guitar'
    written = 0
    for b in range(n_bars):
        m = stream.Measure(number=b)
        if b == 0:
            if tab_only:
                m.insert(0, clef.TabClef())
                m.insert(0, layout.StaffLayout(staffLines=6))
            else:
                m.insert(0, clef.Treble8vbClef())
            m.insert(0, meter.TimeSignature(f'{num}/{den}'))
            m.insert(0, tempo.MetronomeMark(number=t['tempo_bpm']))
        b0, b1 = b * bar_units, (b + 1) * bar_units
        for vi, v in enumerate(voices):
            vs = stream.Voice(id=str(vi + 1))
            groups = {}
            for n in [n for n in notes if n['voice'] == v]:
                groups.setdefault(int(round(n['onset'] / six)), []).append(n)
            starts = sorted(groups)
            pos = b0
            for q in [s for s in starts if b0 <= s < b1]:
                for u in (split(q - pos) if q > pos else []):
                    vs.append(note.Rest(quarterLength=u / 4))
                nxt = [s for s in starts if s > q]
                end = min(nxt[0] if nxt else b1, b1)
                parts = split(end - q)
                if len(groups[q]) != 1:
                    raise SystemExit('chord inside one voice: not handled by this script')
                tn = groups[q][0]
                n = note.Note(tn['pitch'], quarterLength=parts[0] / 4)
                n.articulations.append(articulations.StringIndication(tn['string']))
                n.articulations.append(articulations.FretIndication(tn['fret']))
                vs.append(n)
                written += 1
                for u in parts[1:]:
                    vs.append(note.Rest(quarterLength=u / 4))
                pos = end
            for u in (split(b1 - pos) if pos < b1 else []):
                vs.append(note.Rest(quarterLength=u / 4))
            m.insert(0, vs)
        part.append(m)
    sc.insert(0, part)
    tag = os.path.basename(src).split('.')[0] + ('.music21.tab' if tab_only else '.music21')
    path = os.path.join(out_dir, tag + '.musicxml')
    sc.write('musicxml', fp=path)
    t1 = time.time()
    back = converter.parse(path)
    n_back = 0
    with_sf = 0
    for n in back.recurse().notes:
        n_back += 1
        arts = {type(a).__name__: getattr(a, 'number', None) for a in n.articulations}
        if 'StringIndication' in arts and 'FretIndication' in arts:
            with_sf += 1
    print(json.dumps({'music21': m21version, 'out': path, 'bytes': os.path.getsize(path), 'notes_written': written,
                      'voices': voices, 'bars': n_bars, 'write_s': round(t1 - t0, 3),
                      'read_back_s': round(time.time() - t1, 3), 'notes_read_back': n_back,
                      'read_back_with_string_and_fret': with_sf}))


if __name__ == '__main__':
    main()
