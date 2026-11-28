#!/usr/bin/env python3
"""Re-run every gtr-eval call cited in trials.md with --no-ledger and compare the full result JSON
with the result stored in the eval ledger. Verifier script (verify-trials-guitar-tab).
Usage: rescore_cited_evals.py <trials.md> <out.json>"""
import json, re, subprocess, sys
trials, out = sys.argv[1], sys.argv[2]
txt = open(trials).read()
ids = sorted(set('e' + i for i in re.findall(r'\be(\d{4})\b', txt)))
led = {}
for line in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    d = json.loads(line)
    led[d['id']] = d
report = {}
for i in ids:
    d = led.get(i)
    if d is None:
        report[i] = {'status': 'NOT IN LEDGER'}; continue
    p = subprocess.run(['/home/user/gtr/bin/gtr-eval'] + d['argv'] + ['--no-ledger'], cwd=d['cwd'],
                       capture_output=True, text=True)
    try:
        new = json.loads(p.stdout.strip().splitlines()[-1])
    except Exception as e:
        report[i] = {'status': 'NO JSON', 'rc': p.returncode, 'stderr': p.stderr[-500:]}; continue
    old = d['result']
    if new == old:
        report[i] = {'status': 'IDENTICAL'}
    else:
        diffs = [k for k in sorted(set(old) | set(new)) if old.get(k) != new.get(k)]
        report[i] = {'status': 'DIFFERENT', 'keys': diffs,
                     'old_metrics': old.get('metrics'), 'new_metrics': new.get('metrics'),
                     'old_est': old.get('est'), 'new_est': new.get('est')}
json.dump(report, open(out, 'w'), indent=1)
from collections import Counter
print(Counter(v['status'] for v in report.values()))
for k, v in report.items():
    if v['status'] != 'IDENTICAL':
        print(k, v['status'], v.get('keys'))
