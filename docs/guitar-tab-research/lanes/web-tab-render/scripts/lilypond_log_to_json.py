#!/usr/bin/env python3
"""Turn the TABNOTE lines that truth_to_lilypond.py's Scheme callback prints into the JSON gtr-eval `tab` reads.

Usage: python3 -I lilypond_log_to_json.py lilypond.log out.json --bpm 112 --tuning 40,45,50,55,59,64 [--capo 0]
TABNOTE <moment in whole notes> <midi pitch> <staff-position> <fret text>; on a 6-line TabStaff the lines are at
staff positions 5, 3, 1, -1, -3, -5 from the top (string 1) to the bottom (string 6): string = (5 - pos) / 2 + 1.
"""
import json
import sys


def main():
    src, dst = sys.argv[1], sys.argv[2]
    bpm = float(sys.argv[sys.argv.index('--bpm') + 1])
    tuning = [int(x) for x in sys.argv[sys.argv.index('--tuning') + 1].split(',')]
    capo = int(sys.argv[sys.argv.index('--capo') + 1]) if '--capo' in sys.argv else 0
    notes = []
    for line in open(src, errors='replace'):
        if 'TABNOTE' not in line:
            continue
        parts = line.split('TABNOTE', 1)[1].split()
        mom, pitch, pos, fret = float(parts[0]), int(parts[1]), int(round(float(parts[2]))), parts[3]
        string = int((5 - pos) / 2 + 1)
        notes.append({'onset': round(mom * 4 * 60.0 / bpm, 6), 'pitch': pitch, 'string': string,
                      'fret': int(fret) if fret.lstrip('-').isdigit() else None, 'staff_position': pos})
    json.dump({'tuning_midi': tuning, 'capo': capo, 'notes': notes}, open(dst, 'w'), indent=1)
    print(f'{dst}: {len(notes)} tab notes')


if __name__ == '__main__':
    main()
