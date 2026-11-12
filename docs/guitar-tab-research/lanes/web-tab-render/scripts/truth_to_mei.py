#!/usr/bin/env python3
"""Write MEI 5 guitar tablature from a truth JSON (stdlib only), following the MEI Guidelines v5, chapter
"Repertoire: String Tablature" (https://music-encoding.org/guidelines/v5/content/tablature.html, read 2026-11-10):
<staffDef lines="6" notationtype="tab.guitar">, <tuning> with <course n pname oct> (course 1 = e4 in the guide's
standard tuning example), <tabGrp dur><tabDurSym/><note tab.course tab.fret/></tabGrp>, rests as a tabGrp holding only
a tabDurSym. One <layer> per truth voice (melody, bass). Onsets on a 16th grid; lengths as in truth_to_alphatex.py.

Usage: python3 -I truth_to_mei.py <id>.truth.json out.mei
"""
import json
import sys

PN = ['c', 'c', 'd', 'd', 'e', 'f', 'f', 'g', 'g', 'a', 'a', 'b']
ACC = [None, 's', None, 's', None, None, 's', None, 's', None, 's', None]
DUR = {16: ('1', 0), 12: ('2', 1), 8: ('2', 0), 6: ('4', 1), 4: ('4', 0), 3: ('8', 1), 2: ('8', 0), 1: ('16', 0)}


def split(u):
    out = []
    for s in [16, 12, 8, 6, 4, 3, 2, 1]:
        while u >= s:
            out.append(s)
            u -= s
    return out


def grp(u, notes=None):
    d, dots = DUR[u]
    a = f'<tabGrp dur="{d}"' + (f' dots="{dots}"' if dots else '') + '><tabDurSym/>'
    for n in notes or []:
        a += f'<note tab.course="{n["string"]}" tab.fret="{n["fret"]}"/>'
    return a + '</tabGrp>'


def main():
    src, dst = sys.argv[1], sys.argv[2]
    t = json.load(open(src))
    six = 60.0 / t['tempo_bpm'] / 4
    num, den = (int(x) for x in t['time_signature'].split('/'))
    bar_units = num * 16 // den
    notes = [n for n in t['notes'] if n.get('string') and n.get('fret') is not None]
    voices = sorted({n['voice'] for n in notes}, key=lambda v: (v != 'melody', v))
    n_bars = int(round(max(n['onset'] for n in notes) / six)) // bar_units + 1
    tun = t['tuning_midi']
    capo = t.get('capo') or 0
    courses = ''.join(
        f'<course n="{6 - i}" pname="{PN[m % 12]}"' + (f' accid="{ACC[m % 12]}"' if ACC[m % 12] else '')
        + f' oct="{m // 12 - 1}"/>' for i, m in enumerate(tun))
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.1">',
           f'<meiHead><fileDesc><titleStmt><title>{t["title"]}</title></titleStmt><pubStmt/></fileDesc></meiHead>',
           '<music><body><mdiv><score>',
           f'<scoreDef meter.count="{num}" meter.unit="{den}" midi.bpm="{t["tempo_bpm"]:g}"><staffGrp>',
           f'<staffDef n="1" lines="6" notationtype="tab.guitar"><tuning>{courses}</tuning></staffDef>',
           '</staffGrp></scoreDef><section>']
    if capo:
        out.append(f'<!-- capo {capo}: MEI 5 has no capo element used here; frets are counted from the capo -->')
    for b in range(n_bars):
        out.append(f'<measure n="{b}"><staff n="1">')
        b0, b1 = b * bar_units, (b + 1) * bar_units
        for li, v in enumerate(voices, start=1):
            out.append(f'<layer n="{li}">')
            groups = {}
            for n in [n for n in notes if n['voice'] == v]:
                groups.setdefault(int(round(n['onset'] / six)), []).append(n)
            starts = sorted(groups)
            pos = b0
            for q in [s for s in starts if b0 <= s < b1]:
                for u in (split(q - pos) if q > pos else []):
                    out.append(grp(u))
                nxt = [s for s in starts if s > q]
                end = min(nxt[0] if nxt else b1, b1)
                parts = split(end - q)
                out.append(grp(parts[0], sorted(groups[q], key=lambda n: n['string'])))
                for u in parts[1:]:
                    out.append(grp(u))
                pos = end
            for u in (split(b1 - pos) if pos < b1 else []):
                out.append(grp(u))
            out.append('</layer>')
        out.append('</staff></measure>')
    out.append('</section></score></mdiv></body></music></mei>')
    open(dst, 'w').write('\n'.join(out) + '\n')
    print(f'wrote {dst}: {len(notes)} notes, {n_bars} bars, layers {voices}')


if __name__ == '__main__':
    main()
