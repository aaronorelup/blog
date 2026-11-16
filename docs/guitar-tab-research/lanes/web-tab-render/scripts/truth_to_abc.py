#!/usr/bin/env python3
"""Write ABC notation from a truth JSON (stdlib only): one V: per truth voice, joined on one staff with
%%score (1 2), L:1/16, Q from the truth tempo, K from the truth key (major keys with sharps only: C G D A E).
ABC has no syntax for string or fret: a renderer that draws tablature (abcjs) chooses them itself.

Usage: python3 -I truth_to_abc.py <id>.truth.json out.abc [--written-octave]
--written-octave writes every pitch one octave higher (guitar music is written an octave above its sound; abcjs's
default guitar tablature tuning is E, A, D G B e, i.e. the written pitches of the open strings).
"""
import json
import sys

KEY_SHARPS = {'C': '', 'G': 'F', 'D': 'FC', 'A': 'FCG', 'E': 'FCGD'}
PC_NAMES = [('C', 0), ('C', 1), ('D', 0), ('D', 1), ('E', 0), ('F', 0), ('F', 1), ('G', 0), ('G', 1), ('A', 0),
            ('A', 1), ('B', 0)]


def abc_pitch(m, sharps):
    letter, sharp = PC_NAMES[m % 12]
    if sharp:
        acc = '' if letter in sharps else '^'
    else:
        acc = '=' if letter in sharps else ''
    octave = m // 12 - 1
    if octave >= 5:
        name = letter.lower() + "'" * (octave - 5)
    else:
        name = letter + ',' * (4 - octave)
    return acc + name


def split(u):
    out = []
    for s in [16, 12, 8, 6, 4, 3, 2, 1]:
        while u >= s:
            out.append(s)
            u -= s
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    shift = 12 if '--written-octave' in sys.argv else 0
    t = json.load(open(src))
    six = 60.0 / t['tempo_bpm'] / 4
    num, den = (int(x) for x in t['time_signature'].split('/'))
    bar_units = num * 16 // den
    tonic = (t.get('key') or 'C major').split()[0]
    sharps = KEY_SHARPS.get(tonic, '')
    notes = [n for n in t['notes'] if n.get('pitch') is not None and n.get('voice') != 'drums']
    voices = sorted({n['voice'] for n in notes}, key=lambda v: (v != 'melody', v))
    n_bars = int(round(max(n['onset'] for n in notes) / six)) // bar_units + 1
    lines = ['X:1', f'T:{t["title"]}', f'M:{num}/{den}', 'L:1/16', f'Q:1/4={round(t["tempo_bpm"])}',
             '%%score (' + ' '.join(str(i + 1) for i in range(len(voices))) + ')',
             f'K:{tonic if tonic in KEY_SHARPS else "C"}']
    for vi, v in enumerate(voices, start=1):
        groups = {}
        for n in [n for n in notes if n['voice'] == v]:
            groups.setdefault(int(round(n['onset'] / six)), []).append(n)
        starts = sorted(groups)
        bars = []
        for b in range(n_bars):
            b0, b1 = b * bar_units, (b + 1) * bar_units
            toks, pos = [], b0
            for q in [s for s in starts if b0 <= s < b1]:
                toks += [f'z{u}' for u in split(q - pos)] if q > pos else []
                nxt = [s for s in starts if s > q]
                end = min(nxt[0] if nxt else b1, b1)
                parts = split(end - q)
                ps = sorted({n['pitch'] + shift for n in groups[q]})
                head = abc_pitch(ps[0], sharps) if len(ps) == 1 else '[' + ''.join(abc_pitch(p, sharps) for p in ps) + ']'
                toks.append(f'{head}{parts[0]}')
                toks += [f'z{u}' for u in parts[1:]]
                pos = end
            toks += [f'z{u}' for u in split(b1 - pos)] if pos < b1 else []
            bars.append(' '.join(toks))
        lines.append(f'V:{vi} name="{v}"')
        for i in range(0, len(bars), 4):
            lines.append(' | '.join(bars[i:i + 4]) + ' |')
    open(dst, 'w').write('\n'.join(lines) + '\n')
    print(f'wrote {dst}: {len(notes)} notes, voices {voices}, {n_bars} bars, K:{tonic}')


if __name__ == '__main__':
    main()
