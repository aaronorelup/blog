#!/usr/bin/env python3
"""Write a MusicXML 4.0 file with a standard staff AND a tablature staff from a truth JSON (stdlib only).

Usage: python3 -I truth_to_musicxml.py <id>.truth.json out.musicxml [--tab-only]

Layout (the way notation programs export a guitar with linked notation and TAB staves):
- one part "Guitar"; <staves>2</staves>; staff 1 = G clef with <clef-octave-change>-1</clef-octave-change> (treble 8vb),
  staff 2 = <clef><sign>TAB</sign><line>5</line></clef> with <staff-details> holding <staff-lines>6</staff-lines>,
  one <staff-tuning line="n"> per string (line 1 = the lowest string, as the MusicXML reference says lines are
  "numbered from bottom to top") and <capo> when the truth has one;
- every note is written twice: once on staff 1 (voices 1 and 2 = melody and bass) and once on staff 2 (voices 5 and 6)
  with <notations><technical><string>/<fret>; <pitch> is the sounding pitch (no <transpose>);
- <divisions>4 (a 16th note = 1), <sound tempo>, key from the truth key, onsets on a 16th grid, the last-onset-to-next
  rule for lengths (as truth_to_alphatex.py). With --tab-only only the TAB staff is written (<staves>1</staves>).
"""
import json
import sys

STEPS = [('C', 0), ('C', 1), ('D', 0), ('D', 1), ('E', 0), ('F', 0), ('F', 1), ('G', 0), ('G', 1), ('A', 0), ('A', 1),
         ('B', 0)]
FIFTHS = {'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4}
TYPES = {16: ('whole', 0), 12: ('half', 1), 8: ('half', 0), 6: ('quarter', 1), 4: ('quarter', 0), 3: ('eighth', 1),
         2: ('eighth', 0), 1: ('16th', 0)}


def split(u):
    out = []
    for s in [16, 12, 8, 6, 4, 3, 2, 1]:
        while u >= s:
            out.append(s)
            u -= s
    return out


def pitch_xml(m):
    step, alter = STEPS[m % 12]
    return (f'<pitch><step>{step}</step>' + (f'<alter>{alter}</alter>' if alter else '')
            + f'<octave>{m // 12 - 1}</octave></pitch>')


def note_xml(dur_u, voice, staff, n=None, chord=False):
    typ, dot = TYPES[dur_u]
    body = '<note>' + ('<chord/>' if chord else '')
    body += pitch_xml(n['pitch']) if n else '<rest/>'
    body += f'<duration>{dur_u}</duration><voice>{voice}</voice><type>{typ}</type>' + ('<dot/>' if dot else '')
    body += f'<staff>{staff}</staff>'
    if n and staff_is_tab(staff):
        body += (f'<notations><technical><string>{n["string"]}</string><fret>{n["fret"]}</fret>'
                 '</technical></notations>')
    return body + '</note>'


TAB_STAFF = 2


def staff_is_tab(staff):
    return staff == TAB_STAFF


def main():
    global TAB_STAFF
    src, dst = sys.argv[1], sys.argv[2]
    tab_only = '--tab-only' in sys.argv
    t = json.load(open(src))
    six = 60.0 / t['tempo_bpm'] / 4
    num, den = (int(x) for x in t['time_signature'].split('/'))
    bar_units = num * 16 // den
    notes = [n for n in t['notes'] if n.get('string') and n.get('fret') is not None]
    voices = sorted({n['voice'] for n in notes}, key=lambda v: (v != 'melody', v))
    n_bars = int(round(max(n['onset'] for n in notes) / six)) // bar_units + 1
    tonic = (t.get('key') or 'C major').split()[0]
    staves = [1] if tab_only else [1, 2]
    TAB_STAFF = 1 if tab_only else 2
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" '
           '"http://www.musicxml.org/dtds/partwise.dtd">',
           '<score-partwise version="4.0">',
           f'<work><work-title>{t["title"]}</work-title></work>',
           '<identification><encoding><software>truth_to_musicxml.py (web-tab-render lane)</software></encoding>'
           '</identification>',
           '<part-list><score-part id="P1"><part-name>Guitar</part-name>'
           '<score-instrument id="P1-I1"><instrument-name>Guitar</instrument-name></score-instrument>'
           '<midi-instrument id="P1-I1"><midi-channel>1</midi-channel><midi-program>25</midi-program>'
           '</midi-instrument></score-part></part-list>', '<part id="P1">']
    for b in range(n_bars):
        out.append(f'<measure number="{b}">')
        if b == 0:
            attrs = f'<attributes><divisions>4</divisions><key><fifths>{FIFTHS.get(tonic, 0)}</fifths></key>'
            attrs += f'<time><beats>{num}</beats><beat-type>{den}</beat-type></time><staves>{len(staves)}</staves>'
            if not tab_only:
                attrs += '<clef number="1"><sign>G</sign><line>2</line><clef-octave-change>-1</clef-octave-change></clef>'
            attrs += f'<clef number="{TAB_STAFF}"><sign>TAB</sign><line>5</line></clef>'
            attrs += f'<staff-details number="{TAB_STAFF}"><staff-lines>6</staff-lines>'
            for line, m in enumerate(t['tuning_midi'], start=1):
                step, alter = STEPS[m % 12]
                attrs += (f'<staff-tuning line="{line}"><tuning-step>{step}</tuning-step>'
                          + (f'<tuning-alter>{alter}</tuning-alter>' if alter else '')
                          + f'<tuning-octave>{m // 12 - 1}</tuning-octave></staff-tuning>')
            if t.get('capo'):
                attrs += f'<capo>{t["capo"]}</capo>'
            attrs += '</staff-details></attributes>'
            out.append(attrs)
            out.append(f'<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit>'
                       f'<per-minute>{t["tempo_bpm"]:g}</per-minute></metronome></direction-type>'
                       f'<sound tempo="{t["tempo_bpm"]:g}"/></direction>')
        b0, b1 = b * bar_units, (b + 1) * bar_units
        first = True
        for staff in staves:
            for vi, v in enumerate(voices):
                voice_no = (vi + 1) if staff == 1 else (vi + 5)
                if not first:
                    out.append(f'<backup><duration>{bar_units}</duration></backup>')
                first = False
                groups = {}
                for n in [n for n in notes if n['voice'] == v]:
                    groups.setdefault(int(round(n['onset'] / six)), []).append(n)
                starts = sorted(groups)
                pos = b0
                for q in [s for s in starts if b0 <= s < b1]:
                    for u in (split(q - pos) if q > pos else []):
                        out.append(note_xml(u, voice_no, staff))
                    nxt = [s for s in starts if s > q]
                    end = min(nxt[0] if nxt else b1, b1)
                    parts = split(end - q)
                    for k, n in enumerate(sorted(groups[q], key=lambda n: n['pitch'])):
                        out.append(note_xml(parts[0], voice_no, staff, n, chord=k > 0))
                    for u in parts[1:]:
                        out.append(note_xml(u, voice_no, staff))
                    pos = end
                for u in (split(b1 - pos) if pos < b1 else []):
                    out.append(note_xml(u, voice_no, staff))
        out.append('</measure>')
    out.append('</part></score-partwise>')
    open(dst, 'w').write('\n'.join(out) + '\n')
    print(f'wrote {dst}: {len(notes)} notes x {len(staves)} staves, {n_bars} bars, tuning {t["tuning_midi"]}, '
          f'capo {t.get("capo")}')


if __name__ == '__main__':
    main()
