#!/usr/bin/env python3
"""Rebuild post/_pending.md from each fragment's PENDING MEDIA part, and list every media path named (pending_paths_now.txt)."""
import re, os
SP = os.path.dirname(os.path.abspath(__file__))
ORDER = ['source-separation', 'audio-to-notes', 'chords-beats-key', 'guitar-tab', 'fingerstyle-voices-taps', 'video-hands-fretboard',
         'web-tab-render', 'browser-audio-sync', 'chains', 'hosted-apis', 'apps-survey']
MARK = re.compile(r'^<!-- (RUNDOWN|SECTION|IMAGES|PENDING MEDIA|NUMBERS) -->\s*$', re.M)
out = ['<details><summary>The outputs still to upload, section by section</summary>', '']
paths = []
for lane in ORDER:
    f = open(f'{SP}/post/{lane}.md', encoding='utf-8').read()
    seg = MARK.split(f)
    d = {seg[i]: seg[i + 1].strip('\n') for i in range(1, len(seg) - 1, 2)}
    title = re.search(r'^## (.+)$', d['SECTION'], re.M).group(1)
    pm = d.get('PENDING MEDIA', '').strip() or 'None.'
    assert '~~~' not in pm, lane
    out += [f'**{title}**', '', '~~~text', pm, '~~~', '']
    for p in re.findall(r'(/home/user/gtr/[^\s`"\')]+\.(?:wav|mp3|mp4|webm|flac|ogg|m4a|mov|mkv))', pm, re.I):
        paths.append(p.rstrip('.,:'))
out += ['</details>']
open(f'{SP}/post/_pending.md', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
paths = sorted(set(paths))
open(f'{SP}/pending_paths_now.txt', 'w').write('\n'.join(paths) + '\n')
print(len(paths), 'media paths named;', sum(os.path.exists(p) for p in paths), 'exist')
bad = sorted({c for c in '\n'.join(out) if ord(c) > 127})
print('non-ascii in pending:', ''.join(bad))
