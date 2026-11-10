#!/usr/bin/env python3
"""Verifier's checks behind two corrections in trials.md (2026-11-10). Plain Python 3, no packages.

1. alphaTab player at playbackSpeed 2.0 (r0317): against which timeline did midiEventsPlayed and playedBeatChanged arrive?
2. abcjs read-backs (r0241, r0244): why 88/90 matched with gtr-eval's default 50 ms chord window.
Usage: python3 -I speed2_and_abcjs_checks.py
"""
import json, statistics as st
from collections import Counter

L = '/home/user/gtr/lanes/web-tab-render/out/'
d = json.load(open(L + 'alphatab-player/S2n_transp2_speed2.player.json'))
log = d['log']
tp = [e['t_ms'] for e in log if e['type'] == 'play_called'][0]
ev = [(e['t_ms'] - tp, x['tick'], x['type']) for e in log if e['type'] == 'midiEvents' for x in e['events']]
for sp in (1.0, 2.0):
    lat = [a - tk / 960 * 60 / 112 / sp * 1000 for a, tk, ty in ev if ty == 128]
    print(f'speed-2 run, note-ons against the speed-{sp} timeline: n={len(lat)} median={st.median(lat):.1f} '
          f'min={min(lat):.1f} max={max(lat):.1f} ms')
print('highest note-on tick', max(tk for a, tk, ty in ev if ty == 128), 'last event at', round(max(a for a, tk, ty in ev), 1), 'ms')
pb = [(e['t_ms'] - tp, e['absTick']) for e in log if e['type'] == 'playedBeat']
print('playedBeatChanged n', len(pb), 'median against speed 2.0:',
      round(st.median([a - tk / 960 * 60 / 112 / 2 * 1000 for a, tk in pb]), 1), 'ms')

t = json.load(open('/home/user/gtr/inputs/S2n/S2n.truth.json'))
for f in ['S2n_written', 'S5capo2_written_capo2', 'S5dropd_written_dropd']:
    e = json.load(open(L + 'abcjs/' + f + '.tab.json'))
    clip = f.split('_')[0]
    tt = json.load(open(f'/home/user/gtr/inputs/{clip}/{clip}.truth.json'))
    same = Counter((n['string'], n['fret'], n['pitch']) for n in tt['notes']) == Counter((n['string'], n['fret'], n['pitch']) for n in e['notes'])
    ns = sorted(e['notes'], key=lambda n: (n['onset'], n['pitch']))
    groups = []
    for n in ns:  # gtr-eval's rule: a note joins the group if within 50 ms of the group's first note
        if groups and n['onset'] - groups[-1][0]['onset'] <= 0.05:
            groups[-1].append(n)
        else:
            groups.append([n])
    print(f, 'same (string, fret, pitch) multiset as the truth:', same, '| groups of size:', dict(Counter(len(g) for g in groups)))
