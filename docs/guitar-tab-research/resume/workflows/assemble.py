#!/usr/bin/env python3
"""Assemble the draft post from the main read (_main.md), the front matter (_front.yaml) and the lane fragments.

  python3 assemble.py            -> writes src/content/posts/guitar-tab-tools.md and prints a size report
Tokens in _main.md:  {{RUNDOWN}}  {{SECTIONS}}  (and any {{FILE:name}} pulls scratchpad/post/name verbatim)
"""
import re, sys, os

SP = '/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/post'
POST = '/home/user/blog/src/content/posts/guitar-tab-tools.md'
ORDER = ['source-separation', 'audio-to-notes', 'chords-beats-key', 'guitar-tab', 'fingerstyle-voices-taps',
         'video-hands-fretboard', 'web-tab-render', 'browser-audio-sync', 'chains', 'hosted-apis', 'apps-survey']
MARK = re.compile(r'^<!-- (RUNDOWN|SECTION|IMAGES|PENDING MEDIA|NUMBERS) -->\s*$', re.M)


BRIEF = set()   # every section is a full, fact-checked fragment now


def parts(lane):
    p = f'{SP}/_brief-{lane}.md' if lane in BRIEF else f'{SP}/{lane}.md'
    if not os.path.exists(p):
        return None
    f = open(p, encoding='utf-8').read()
    seg = MARK.split(f)
    return {seg[i]: seg[i + 1].strip('\n') for i in range(1, len(seg) - 1, 2)}


def words_open(md):
    """Words a reader sees without opening anything: no details blocks, code, tables, figures or html."""
    t = re.sub(r'<details>.*?</details>', ' ', md, flags=re.S)
    t = re.sub(r'```.*?```', ' ', t, flags=re.S)
    t = re.sub(r'<ao-[a-z]+.*?</ao-[a-z]+>', ' ', t, flags=re.S)
    t = re.sub(r'^\|.*$', ' ', t, flags=re.M)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = re.sub(r'`[^`]*`', ' x ', t)
    return len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'’.,%-]*", t))


def main():
    front = open(f'{SP}/_front.yaml', encoding='utf-8').read().strip('\n')
    body = open(f'{SP}/_main.md', encoding='utf-8').read()
    rundown, sections, missing = [], [], []
    for lane in ORDER:
        d = parts(lane)
        if not d:
            missing.append(lane)
            continue
        rundown.append(d.get('RUNDOWN', '').strip())
        sections.append(d.get('SECTION', '').strip())
    body = body.replace('{{RUNDOWN}}', '\n'.join(rundown))
    body = body.replace('{{SECTIONS}}', '\n\n'.join(sections))
    for m in re.findall(r'\{\{FILE:([\w.-]+)\}\}', body):
        body = body.replace('{{FILE:%s}}' % m, open(f'{SP}/{m}', encoding='utf-8').read().strip('\n'))
    fp = f'{SP}/_fills.json'
    if os.path.exists(fp):
        import json
        for k, v in json.load(open(fp, encoding='utf-8')).items():
            body = body.replace('[[%s]]' % k, v)
            front = front.replace('[[%s]]' % k, v)
    left = re.findall(r'\{\{[^}]+\}\}|\[\[[^\]]+\]\]', body)
    body = body.replace('github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research', 'github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research')
    body = body.replace('github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research', 'github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research')
    out = '---\n' + front + '\n---\n\n' + body.strip('\n') + '\n'
    open(POST, 'w', encoding='utf-8').write(out)
    print(f'wrote {POST}: {len(out.encode())/1024:.0f} KB, {len(out.splitlines())} lines')
    print('open words (main read):', words_open(body))
    for lane in ORDER:
        d = parts(lane)
        if d:
            print(f"  {lane:26s} rundown {len(d.get('RUNDOWN','').split()):4d} w | section open {words_open(d.get('SECTION','')):4d} w | section total {len(d.get('SECTION','').split()):6d} w")
    if missing:
        print('MISSING FRAGMENTS:', missing)
    if left:
        print('UNFILLED TOKENS:', sorted(set(left))[:20])


if __name__ == '__main__':
    main()
