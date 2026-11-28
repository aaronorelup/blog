"""Re-run the 13 gtr-eval scorings cited in trials.md "Gap round 1" with --no-ledger, from the stored argv and cwd,
and compare the result objects with the ledger (verify-gapfill-audio-to-notes)."""
import json, subprocess, sys, os, hashlib
ids = ['e%04d' % i for i in list(range(1478, 1486)) + list(range(1570, 1575))]
rows = {}
for line in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    d = json.loads(line)
    if d['id'] in ids:
        rows[d['id']] = d
def strip(o):
    # drop fields that legitimately differ between runs (none expected besides timing-free result)
    return o
out = []
for i in ids:
    d = rows[i]
    argv = [a for a in d['argv']]
    # drop --out <file> so nothing is overwritten
    if '--out' in argv:
        k = argv.index('--out'); del argv[k:k+2]
    p = subprocess.run(['/home/user/gtr/bin/gtr-eval'] + argv + ['--no-ledger'], cwd=d['cwd'], capture_output=True, text=True)
    try:
        new = json.loads(p.stdout.strip().splitlines()[-1])
    except Exception as e:
        out.append((i, 'PARSE-ERROR', p.returncode, p.stderr[-300:])); continue
    old = d['result']
    same = json.dumps(new, sort_keys=True) == json.dumps(old, sort_keys=True)
    est_sha_same = new['est']['sha256'] == old['est']['sha256']
    diffkeys = [] if same else [k for k in set(new) | set(old) if json.dumps(new.get(k), sort_keys=True) != json.dumps(old.get(k), sort_keys=True)]
    out.append((i, 'IDENTICAL' if same else 'DIFF', p.returncode, 'est_sha_same=%s' % est_sha_same, ','.join(sorted(diffkeys)), ' '.join(d['argv'])))
for o in out:
    print('\t'.join(str(x) for x in o))
