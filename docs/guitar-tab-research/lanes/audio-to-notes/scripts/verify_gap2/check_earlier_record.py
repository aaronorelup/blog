#!/usr/bin/env python3
"""verify-gapfill-audio-to-notes, round 2: compare the lane's record files with git commit d2e9a17 (the state before
gap round 2): every '## ' section of the old file must still exist with the same heading; the earlier verification
logs must be byte-identical; every old line must still be present in order (the round may only insert text)."""
import subprocess, sys, difflib
BASE = 'd2e9a17'
LANE = 'docs/guitar-tab-research/lanes/audio-to-notes'
def sections(text):
    out, cur, name = {}, [], None
    for line in text.splitlines(keepends=True):
        if line.startswith('## '):
            if name is not None: out[name] = ''.join(cur)
            name, cur = line.strip(), [line]
        else:
            cur.append(line)
    if name is not None: out[name] = ''.join(cur)
    return out
for f in ['trials.md', 'survey.md', 'for-aaron.md']:
    old = subprocess.run(['git', '-C', '/home/user/blog', 'show', f'{BASE}:{LANE}/{f}'], capture_output=True, text=True).stdout
    new = open(f'/home/user/blog/{LANE}/{f}').read()
    so, sn = sections(old), sections(new)
    missing = [h for h in so if h not in sn]
    logs = [h for h in so if 'Verification log' in h]
    same_logs = {h: so[h] == sn.get(h) for h in logs}
    # every old line kept, in order? (a line may have had text appended: count those separately)
    sm = difflib.SequenceMatcher(None, old.splitlines(), new.splitlines(), autojunk=False)
    deleted = [(i1, i2, j1, j2) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag in ('delete', 'replace')]
    changed_old_lines = sum(i2 - i1 for i1, i2, _, _ in deleted)
    print(f, 'old sections', len(so), 'new sections', len(sn), 'old headings missing', missing)
    print('  earlier verification logs byte-identical:', same_logs)
    print('  old lines changed or removed:', changed_old_lines)
    ol = old.splitlines(); nl = new.splitlines()
    for i1, i2, j1, j2 in deleted:
        for k in range(i1, i2):
            # is the old line a prefix of some new line in the replacement block (text appended)?
            appended = any(nl[j].startswith(ol[k].rstrip()) for j in range(j1, j2)) if ol[k].strip() else True
            print('   ', 'APPENDED' if appended else 'CHANGED ', k + 1, ol[k][:150])
