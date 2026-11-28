#!/usr/bin/env python3
"""Read the guitar-tablature staff of an MEI file (as written by truth_to_mei.py or exported by Verovio) into the
{tuning_midi, capo, notes: [{onset, pitch, string, fret}]} JSON that gtr-eval `tab` reads. Stdlib only.

Usage: python3 -I mei_tab_to_json.py in.mei out.json [--bpm 112]

- staff = the first <staffDef notationtype="tab.guitar"> (or tab.*); tuning from its <course n pname accid oct>
  (course n = string n, 1 = highest); no capo element is read (MEI tab in these files has none), capo = 0 unless
  --capo is given;
- time: each <layer> of that staff in each <measure> is walked; <tabGrp dur dots> (and <rest>, <space>, <mRest>)
  advance the layer clock; a measure lasts as long as its longest layer; seconds = quarter notes x 60 / bpm, with bpm
  from scoreDef/@midi.bpm, the first <tempo @midi.bpm>, or --bpm;
- pitch = tuning(course) + capo + tab.fret.
"""
import json
import sys
import xml.etree.ElementTree as ET

NS = '{http://www.music-encoding.org/ns/mei}'
PC = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}
ACC = {'s': 1, 'f': -1, 'ss': 2, 'ff': -2, 'n': 0}


def qlen(el):
    dur = el.get('dur')
    if dur is None:
        return 0.0
    base = 4.0 / float(dur)
    dots = int(el.get('dots') or 0)
    return base * (2 - 0.5 ** dots)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    bpm_arg = float(sys.argv[sys.argv.index('--bpm') + 1]) if '--bpm' in sys.argv else None
    capo = int(sys.argv[sys.argv.index('--capo') + 1]) if '--capo' in sys.argv else 0
    root = ET.parse(src).getroot()
    tab_def = None
    for sd in root.iter(NS + 'staffDef'):
        if (sd.get('notationtype') or '').startswith('tab'):
            tab_def = sd
            break
    if tab_def is None:
        raise SystemExit('no tablature staffDef')
    staff_n = tab_def.get('n')
    courses = {}
    for c in tab_def.iter(NS + 'course'):
        midi = 12 * (int(c.get('oct')) + 1) + PC[c.get('pname')] + ACC.get(c.get('accid') or c.get('accid.ges') or 'n', 0)
        courses[int(c.get('n'))] = midi
    tuning = [courses[n] for n in sorted(courses, reverse=True)]
    bpm = bpm_arg
    for sd in root.iter(NS + 'scoreDef'):
        if sd.get('midi.bpm'):
            bpm = bpm or float(sd.get('midi.bpm'))
    for tp in root.iter(NS + 'tempo'):
        if tp.get('midi.bpm'):
            bpm = bpm or float(tp.get('midi.bpm'))
    bpm = bpm or 120.0
    notes = []
    t_q = 0.0
    for m in root.iter(NS + 'measure'):
        longest = 0.0
        for st in m.findall(NS + 'staff'):
            if st.get('n') != staff_n:
                continue
            for layer in st.findall(NS + 'layer'):
                clock = 0.0
                for el in layer.iter():
                    tag = el.tag.replace(NS, '')
                    if tag == 'tabGrp':
                        for n in el.findall(NS + 'note'):
                            if n.get('tab.course') is None:
                                continue
                            s, f = int(n.get('tab.course')), int(n.get('tab.fret'))
                            notes.append({'onset': round((t_q + clock) * 60.0 / bpm, 6), 'string': s, 'fret': f,
                                          'pitch': courses[s] + capo + f})
                        clock += qlen(el)
                    elif tag in ('rest', 'space') and el.get('dur'):
                        clock += qlen(el)
                longest = max(longest, clock)
        if longest == 0.0:
            # measure without tab events (e.g. only an mRest): take the meter
            longest = 4.0
        t_q += longest
    json.dump({'tuning_midi': tuning, 'capo': capo, 'bpm_used': bpm, 'notes': notes}, open(dst, 'w'), indent=1)
    print(f'{dst}: {len(notes)} notes, tuning {tuning}, bpm {bpm}')


if __name__ == '__main__':
    main()
