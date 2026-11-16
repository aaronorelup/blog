#!/usr/bin/env python3
"""Write VexTab text from a ground-truth JSON of the shared inputs (stdlib only).

Usage: python3 -I truth_to_vextab.py <id>.truth.json out.vextab [bars_per_line]

- one `tabstave notation=true` per line of bars (default 4 bars per line, 13 bars = count-in bar + 12),
  each with one `voice` per truth voice (melody first, then bass);
- notes are fret/string (VexTab string 1 = highest, the same as the truth files); chords are (f/s.f/s);
- onsets are quantized to 16th notes from the truth tempo; a note lasts until the next onset in the same voice
  or the bar end; gaps are rests (##); VexTab durations :w :h :q :8 :16 with a trailing d for dotted.
- tuning: VexTab's tabstave takes tuning=standard|dropd|eb|E/5,B/4,... ; the truth tuning is written that way.
  VexTab has no capo option; for a capo the frets are written as in the truth (counted from the capo).
"""
import json
import sys

PIECES = [(16, 'w'), (12, 'hd'), (8, 'h'), (6, 'qd'), (4, 'q'), (3, '8d'), (2, '8'), (1, '16')]
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def split_len(units):
    out = []
    for size, name in PIECES:
        while units >= size:
            out.append(name)
            units -= size
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    per_line = int(sys.argv[3]) if len(sys.argv) > 3 else 4
    t = json.load(open(src))
    bpm = t['tempo_bpm']
    num, den = (int(x) for x in t['time_signature'].split('/'))
    six = 60.0 / bpm / 4
    bar_units = num * 16 // den
    notes = [n for n in t['notes'] if n.get('string') and n.get('fret') is not None]
    voices = sorted({n['voice'] for n in notes}, key=lambda v: (v != 'melody', v))
    n_bars = int(round(max(n['onset'] for n in notes) / six)) // bar_units + 1
    tun = t['tuning_midi']
    if tun == [40, 45, 50, 55, 59, 64]:
        tuning = 'standard'
    elif tun == [38, 45, 50, 55, 59, 64]:
        tuning = 'dropd'
    else:
        # VexTab spells custom tunings high string first, in written pitch (one octave above sounding)
        tuning = ','.join(f'{NAMES[m % 12]}/{m // 12}' for m in reversed(tun))  # written octave, like VexTab's E/5,B/4,G/4,D/4,A/3,E/3
    key = (t.get('key') or 'C major').split()[0]

    def voice_bars(voice):
        vn = [n for n in notes if n['voice'] == voice]
        groups = {}
        for n in vn:
            groups.setdefault(int(round(n['onset'] / six)), []).append(n)
        starts = sorted(groups)
        bars = []
        for b in range(n_bars):
            b0, b1 = b * bar_units, (b + 1) * bar_units
            toks, pos = [], b0
            for q in [s for s in starts if b0 <= s < b1]:
                if q > pos:
                    toks += [f':{d} ##' for d in split_len(q - pos)]
                nxt = [s for s in starts if s > q]
                end = min(nxt[0] if nxt else b1, b1)
                ch = sorted(groups[q], key=lambda n: n['string'])
                body = '.'.join(f'{n["fret"]}/{n["string"]}' for n in ch)
                head = f'({body})' if len(ch) > 1 else body
                parts = split_len(end - q)
                toks.append(f':{parts[0]} {head}')
                toks += [f':{d} ##' for d in parts[1:]]
                pos = end
            if pos < b1:
                toks += [f':{d} ##' for d in split_len(b1 - pos)]
            bars.append(' '.join(toks))
        return bars

    vb = {v: voice_bars(v) for v in voices}
    out = ['options space=20 tab-stems=false']
    for line_start in range(0, n_bars, per_line):
        rng = range(line_start, min(line_start + per_line, n_bars))
        out.append(f'tabstave notation=true tablature=true tuning={tuning} key={key}'
                   + (f' time={num}/{den}' if line_start == 0 else ''))
        for v in voices:
            out.append('voice')
            out.append('notes ' + ' | '.join(vb[v][b] for b in rng) + ' |')
    open(dst, 'w').write('\n'.join(out) + '\n')
    print(f'wrote {dst}: {len(notes)} notes, voices {voices}, {n_bars} bars, tuning={tuning}')


if __name__ == '__main__':
    main()
