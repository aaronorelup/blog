#!/usr/bin/env python3
"""Write a LilyPond file (standard staff + TabStaff) from a truth JSON, stdlib only.

Usage: python3 -I truth_to_lilypond.py <id>.truth.json out.ly [--strings truth|auto] [--capo-as-tuning] [--sequence]

- notes are absolute LilyPond pitches (c' = MIDI 60) with durations on a 16th grid (same rule as the other writers);
  one voice per truth voice (melody up, bass down) inside << { } \\\\ { } >>;
- --strings auto (default): no string numbers, LilyPond chooses string and fret itself;
  --strings truth: every note carries the truth string as \\N (LilyPond's string-number syntax);
- TabStaff.stringTunings from the truth tuning; LilyPond has no capo setting for TabStaff, so with --capo-as-tuning
  the tuning is raised by the capo (frets are then counted from the capo);
- a Scheme callback on every TabNoteHead prints "TABNOTE <moment> <midi pitch> <staff-position> <fret text>" to the
  log, so the string and fret LilyPond chose can be read back (string = (5 - staff-position)/2 + 1 on 6 lines);
- writes \\layout and \\midi blocks;
- --sequence (for recorded clips whose notes are not on a grid): one voice, every group of notes starting within 50 ms
  of each other becomes one chord, all written as 8th notes in order; only the string choice is meaningful then
  (score it with gtr-eval tab --ignore-time).
"""
import json
import sys

NAMES = ['c', 'cis', 'd', 'dis', 'e', 'f', 'fis', 'g', 'gis', 'a', 'ais', 'b']
DUR = {16: '1', 12: '2.', 8: '2', 6: '4.', 4: '4', 3: '8.', 2: '8', 1: '16'}


def ly_pitch(m):
    octv = m // 12 - 1 - 3
    return NAMES[m % 12] + ("'" * octv if octv > 0 else ',' * (-octv))


def split(u):
    out = []
    for s in [16, 12, 8, 6, 4, 3, 2, 1]:
        while u >= s:
            out.append(s)
            u -= s
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    strings = sys.argv[sys.argv.index('--strings') + 1] if '--strings' in sys.argv else 'auto'
    capo_as_tuning = '--capo-as-tuning' in sys.argv
    t = json.load(open(src))
    six = 60.0 / t['tempo_bpm'] / 4
    num, den = (int(x) for x in t['time_signature'].split('/'))
    bar_units = num * 16 // den
    notes = [n for n in t['notes'] if n.get('string') and n.get('fret') is not None]
    voices = sorted({n['voice'] for n in notes}, key=lambda v: (v != 'melody', v))
    n_bars = int(round(max(n['onset'] for n in notes) / six)) // bar_units + 1
    capo = t.get('capo') or 0
    tun = [m + (capo if capo_as_tuning else 0) for m in t['tuning_midi']]
    music = {}
    if '--sequence' in sys.argv:
        ordered = sorted(notes, key=lambda n: (n['onset'], n['pitch']))
        groups, cur = [], []
        for n in ordered:
            if cur and n['onset'] - cur[0]['onset'] > 0.05:
                groups.append(cur)
                cur = []
            cur.append(n)
        if cur:
            groups.append(cur)
        toks = []
        for g in groups:
            pitches = sorted({n['pitch'] for n in g})
            toks.append((ly_pitch(pitches[0]) if len(pitches) == 1 else '<' + ' '.join(ly_pitch(p) for p in pitches) + '>') + '8')
        music['all'] = ' '.join(toks)
        voices = ['all']
    for v in ([] if '--sequence' in sys.argv else voices):
        groups = {}
        for n in [n for n in notes if n['voice'] == v]:
            groups.setdefault(int(round(n['onset'] / six)), []).append(n)
        starts = sorted(groups)
        toks, pos = [], 0
        end_all = n_bars * bar_units
        for q in starts:
            if q > pos:
                toks += ['r' + DUR[u] for u in split(q - pos)]
            nxt = [s for s in starts if s > q]
            bar_end = (q // bar_units + 1) * bar_units
            end = min(nxt[0] if nxt else end_all, bar_end)
            parts = split(end - q)
            ch = sorted(groups[q], key=lambda n: n['pitch'])
            def one(n):
                return ly_pitch(n['pitch']) + (f'\\{n["string"]}' if strings == 'truth' else '')
            head = one(ch[0]) if len(ch) == 1 else '<' + ' '.join(one(n) for n in ch) + '>'
            toks.append(head + DUR[parts[0]])
            toks += ['r' + DUR[u] for u in parts[1:]]
            pos = end
        if pos < end_all:
            toks += ['r' + DUR[u] for u in split(end_all - pos)]
        music[v] = ' '.join(toks)
    tuning_ly = '<' + ' '.join(ly_pitch(m) for m in tun) + '>'
    vs = list(music.values())
    if len(vs) == 1:
        voice_block = '{ ' + vs[0] + ' }'
    else:
        voice_block = '<< { \\voiceOne ' + vs[0] + ' } \\\\ { \\voiceTwo ' + vs[1] + ' } >>'
    ly = f"""\\version "2.24.0"
\\header {{ title = "{t['title']}" subtitle = "LilyPond TabStaff, strings: {strings}{', capo as raised tuning' if capo_as_tuning and capo else ''}" tagline = ##f }}
#(define (log-tab grob)
   (let* ((cause (event-cause grob))
          (pitch (ly:event-property cause 'pitch))
          (pos (ly:grob-property grob 'staff-position))
          (txt (ly:grob-property grob 'text))
          (mom (grob::when grob)))
     (ly:message "TABNOTE ~a ~a ~a ~a" (exact->inexact (ly:moment-main mom))
                 (+ 60 (ly:pitch-semitones pitch)) pos (markup->string txt))))
music = {{ \\time {num}/{den} \\tempo 4 = {round(t['tempo_bpm']):g} {voice_block} }}
\\score {{
  <<
    \\new Staff \\with {{ instrumentName = "Guitar" }} {{ \\clef "treble_8" \\music }}
    \\new TabStaff \\with {{ stringTunings = \\stringTuning {tuning_ly} }} {{ \\music }}
  >>
  \\layout {{ \\context {{ \\TabStaff \\override TabNoteHead.after-line-breaking = #log-tab }} }}
  \\midi {{ }}
}}
"""
    open(dst, 'w').write(ly)
    print(f'wrote {dst}: {len(notes)} notes, strings={strings}, tuning {tun}')


if __name__ == '__main__':
    main()
