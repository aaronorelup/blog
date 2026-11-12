#!/usr/bin/env python3
"""List every tool name by the block it sits in, per section fragment, and flag names that are 'ran' in one section and 'did not run' in another.
   python3 cross_sections.py > cross_sections.txt"""
import re, os, sys, json, collections
SP = os.path.dirname(os.path.abspath(__file__)) + '/post'
LANES = ['source-separation', 'audio-to-notes', 'chords-beats-key', 'guitar-tab', 'fingerstyle-voices-taps', 'video-hands-fretboard',
         'web-tab-render', 'browser-audio-sync', 'chains', 'hosted-apis', 'apps-survey']
def norm(n):
    n = re.sub(r'\(.*?\)', ' ', n)
    n = re.sub(r'\b(v?\d+(\.\d+)+[a-z0-9.-]*)\b', ' ', n)
    return re.sub(r'[^a-z0-9+]+', ' ', n.lower()).strip()
seen = collections.defaultdict(list)
for lane in LANES:
    p = f'{SP}/{lane}.md'
    if not os.path.exists(p): continue
    t = open(p, encoding='utf-8').read()
    for m in re.finditer(r'<details><summary>(.*?)</summary>(.*?)</details>', t, re.S):
        title, body = m.group(1), m.group(2)
        kind = 'ran' if 'that ran' in title and 'License' not in title else ('not-run' if "didn't run" in title or 'did not run' in title else None)
        if not kind: continue
        for line in body.splitlines():
            mm = re.match(r'^(?:- )?\*\*(.+?)\*\*', line)
            if mm:
                name = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', mm.group(1)).strip(' .:')
                seen[norm(name)].append((lane, kind, name))
print('NAMES THAT ARE "ran" IN ONE SECTION AND "not-run" IN ANOTHER (same normalised name):')
n = 0
for k, v in sorted(seen.items()):
    kinds = {x[1] for x in v}
    if len(kinds) > 1:
        n += 1
        print(' ', k, '=>', '; '.join(f'{l}:{kd} ("{nm}")' for l, kd, nm in v))
print('count', n)
print('\nNAMES IN MORE THAN ONE SECTION, SAME BLOCK KIND:')
for k, v in sorted(seen.items()):
    if len({x[0] for x in v}) > 1 and len({x[1] for x in v}) == 1:
        print(' ', k, '=>', '; '.join(f'{l}:{kd}' for l, kd, nm in v))
print('\nPER SECTION: entries in "ran" block / "not-run" block')
for lane in LANES:
    r = sum(1 for v in seen.values() for x in v if x[0] == lane and x[1] == 'ran'); q = sum(1 for v in seen.values() for x in v if x[0] == lane and x[1] == 'not-run')
    print(f'  {lane:26s} {r:3d} / {q:3d}')
