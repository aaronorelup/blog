#!/usr/bin/env python3
"""Write alphaTex (alphaTab's text format) from a ground-truth JSON of the shared inputs.

Usage: python3 -I truth_to_alphatex.py <id>.truth.json out.atex [--voices melody,bass]

What it does (stdlib only):
- one track, one staff showing standard notation and tablature, the truth tuning (alphaTex lists the strings top
  line first = string 1 = highest), the truth capo, the truth tempo and time signature;
- one alphaTex voice per truth voice (S2 family: melody, bass), so the two-voice fingerstyle layout is kept;
- every note is written as fret.string (alphaTex string 1 = highest string, the same as the truth files);
- onsets are quantized to a 16th-note grid from the truth tempo (one silent count-in bar first, as in the inputs);
- a note's written length = the time to the next onset in the same voice or the bar end, on that grid;
  notes with the same onset in one voice become one chord; gaps become rests;
- lengths are split into plain/dotted values (1, 2, 4, 8, 16) inside the bar; a note crossing a bar line is cut at
  the bar line (no ties are written; the S2 family has none).
"""
import json
import sys

NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def midi_name(m):
    return f"{NAMES[m % 12]}{m // 12 - 1}"


# 16th-note units -> list of (alphaTex duration, dotted) pieces
PIECES = [(16, 1, False), (8, 2, False), (12, 2, True), (4, 4, False), (6, 4, True), (2, 8, False), (3, 8, True),
          (1, 16, False)]


def split_len(units):
    out = []
    for size, dur, dotted in sorted(PIECES, key=lambda p: -p[0]):
        while units >= size:
            out.append((dur, dotted))
            units -= size
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    voices_arg = None
    if '--voices' in sys.argv:
        voices_arg = sys.argv[sys.argv.index('--voices') + 1].split(',')
    t = json.load(open(src))
    bpm = t['tempo_bpm']
    num, den = (int(x) for x in t['time_signature'].split('/'))
    sixteenth = 60.0 / bpm / 4
    bar_units = num * 16 // den
    tuning = t['tuning_midi']  # low to high
    notes = [n for n in t['notes'] if n.get('string') and n.get('fret') is not None]
    voices = voices_arg or sorted({n['voice'] for n in notes}, key=lambda v: (v != 'melody', v))
    last = max(n['onset'] for n in notes)
    n_bars = int(round(last / sixteenth)) // bar_units + 1
    lines = [
        f'\\title "{t["title"]}"',
        '\\subtitle "alphaTex written from the truth JSON by truth_to_alphatex.py"',
        f'\\tempo {int(round(bpm))}',
        '\\track "Guitar"',
        '\\staff {score tabs}',
        '\\tuning (' + ' '.join(midi_name(m) for m in reversed(tuning)) + ')',
    ]
    if t.get('capo'):
        lines.append(f'\\capo {t["capo"]}')
    lines.append('\\instrument acousticguitarnylon')
    for vi, voice in enumerate(voices):
        vn = sorted([n for n in notes if n['voice'] == voice], key=lambda n: n['onset'])
        groups = {}
        for n in vn:
            q = int(round(n['onset'] / sixteenth))
            groups.setdefault(q, []).append(n)
        starts = sorted(groups)
        lines.append('\\voice')
        if vi == 0:
            lines.append(f'\\ts ({num} {den})')
        bars = []
        for b in range(n_bars):
            b0, b1 = b * bar_units, (b + 1) * bar_units
            toks = []
            pos = b0
            for q in [s for s in starts if b0 <= s < b1]:
                if q > pos:
                    toks += [f'r.{d}' + ('{d}' if dot else '') for d, dot in split_len(q - pos)]
                nxt = [s for s in starts if s > q]
                end = min(nxt[0] if nxt else b1, b1)
                chord = groups[q]
                body = ' '.join(f'{n["fret"]}.{n["string"]}' for n in sorted(chord, key=lambda n: n['string']))
                head = f'({body})' if len(chord) > 1 else body
                pieces = split_len(end - q)
                # first piece carries the note; later pieces of a cut-up length become rests (no ties written)
                d, dot = pieces[0]
                toks.append(f'{head}.{d}' + ('{d}' if dot else ''))
                toks += [f'r.{d2}' + ('{d}' if dot2 else '') for d2, dot2 in pieces[1:]]
                pos = end
            if pos < b1:
                toks += [f'r.{d}' + ('{d}' if dot else '') for d, dot in split_len(b1 - pos)]
            bars.append(' '.join(toks))
        lines.append(' |\n'.join(bars))
    open(dst, 'w').write('\n'.join(lines) + '\n')
    print(f'wrote {dst}: {len(notes)} notes, {len(voices)} voices ({", ".join(voices)}), {n_bars} bars')


if __name__ == '__main__':
    main()
