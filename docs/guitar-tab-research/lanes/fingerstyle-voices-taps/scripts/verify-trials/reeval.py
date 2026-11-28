# Verifier: re-run every gtr-eval scoring cited in trials.md with --no-ledger and compare counts/metrics with the ledger.
import json, re, subprocess, sys, os
TR = '/home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/trials.md'
OUT = '/home/user/gtr/lanes/fingerstyle-voices-taps/verify-trials/reeval'
os.makedirs(OUT, exist_ok=True)
ids = sorted(set(re.findall(r'\be(\d{4})\b', open(TR).read())))
# expand ranges written as "e0440 to e0447"
for a, b in re.findall(r'\be(\d{4}) to e(\d{4})\b', open(TR).read()):
    ids += ['%04d' % i for i in range(int(a), int(b) + 1)]
ids = sorted(set(ids))
EV = {}
for l in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    d = json.loads(l); EV[d['id']] = d
same = diff = 0; rows = []
for i in ids:
    eid = 'e' + i; d = EV[eid]; argv = list(d['argv'])
    if '--out' in argv:
        k = argv.index('--out'); del argv[k:k + 2]
    p = subprocess.run(['/home/user/gtr/bin/gtr-eval'] + argv + ['--no-ledger'], capture_output=True, text=True,
                       cwd=d.get('cwd') if os.path.isdir(d.get('cwd') or '') else '/')
    try:
        new = json.loads(p.stdout.strip().splitlines()[-1]) if p.stdout.strip() else {}
    except Exception:
        new = {'unparsed': p.stdout[-300:]}
    old = d['result']
    ok = (p.returncode == d['exit_code'] and new.get('metrics') == old.get('metrics') and new.get('counts') == old.get('counts')
          and new.get('error') == old.get('error'))
    same += ok; diff += (not ok)
    rows.append({'id': eid, 'exit_old': d['exit_code'], 'exit_new': p.returncode, 'same_counts_metrics_error': ok,
                 'sub': old.get('subcommand'), 'error_new': new.get('error')})
    if not ok:
        print('DIFF', eid, d['exit_code'], p.returncode, json.dumps(new.get('metrics'))[:200], json.dumps(old.get('metrics'))[:200], flush=True)
json.dump(rows, open(OUT + '/reeval_summary.json', 'w'), indent=0)
print('re-ran', len(ids), 'same', same, 'different', diff)
