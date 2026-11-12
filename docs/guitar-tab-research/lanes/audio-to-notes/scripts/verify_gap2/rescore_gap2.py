#!/usr/bin/env python3
"""verify-gapfill-audio-to-notes, round 2: re-score the round's cited eval ids with gtr-eval --no-ledger
from their stored arguments and compare the result objects; print the table values from the stored results."""
import json, subprocess, sys, os, tempfile
IDS = sys.argv[1].split(',')
LEDGER = '/home/user/gtr/eval/ledger/evals.jsonl'
rows = {}
for l in open(LEDGER):
    if l.strip():
        d = json.loads(l)
        if d['id'] in IDS:
            rows[d['id']] = d
out = []
for eid in IDS:
    d = rows[eid]
    argv = list(d['argv'])
    # write to a temp --out so the original score file is not touched
    tmpdir = tempfile.mkdtemp(dir='/home/user/gtr/lanes/audio-to-notes/verify-gap2')
    if '--out' in argv:
        i = argv.index('--out'); argv[i+1] = os.path.join(tmpdir, 'res.json')
    else:
        argv += ['--out', os.path.join(tmpdir, 'res.json')]
    p = subprocess.run(['/home/user/gtr/bin/gtr-eval'] + argv + ['--no-ledger'], cwd=d['cwd'], capture_output=True, text=True)
    new = json.load(open(os.path.join(tmpdir, 'res.json')))
    old = d['result']
    same = (new == old)
    diffkeys = [k for k in set(old) | set(new) if old.get(k) != new.get(k)]
    m = old.get('metrics', {})
    oo = m.get('onset_only', {}); of = m.get('onset_offset', {}); tm = m.get('onset_timing_of_matched', {})
    line = '\t'.join(map(str, [eid, old['gtr_eval_version'], d['exit_code'], p.returncode, 'identical' if same else 'DIFF:' + ','.join(sorted(diffkeys)),
        old['truth']['id'], d['argv'][d['argv'].index('--est')+1].split('/out/')[-1], old['est']['sha256'][:12], new['est']['sha256'][:12],
        old['counts'].get('n_est'), old['counts'].get('n_truth'), round(oo.get('precision', -1), 3), round(oo.get('recall', -1), 3), round(oo.get('f1', -1), 3),
        round(of.get('f1', -1), 3), round(tm.get('median_s', 99), 3), json.dumps(old['options'].get('voice'))]))
    out.append(line)
    print(line)
