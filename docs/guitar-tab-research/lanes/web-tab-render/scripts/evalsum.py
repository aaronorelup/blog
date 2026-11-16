#!/usr/bin/env python3
"""Run gtr-eval with the given arguments and print one compact line: eval id, counts, the key metrics.
Usage: python3 evalsum.py <gtr-eval args...>   e.g. python3 evalsum.py tab --truth S2n --est file.json
The full JSON result is kept in the gtr-eval ledger (gtr-eval ledger --id eNNNN --full)."""
import json
import subprocess
import sys

KEYS = {
    'tab': ['matched_fraction_of_truth', 'matched_fraction_of_est', 'same_string_and_fret_fraction_of_matched',
            'same_string_fraction_of_matched', 'same_string_and_fret_fraction_of_truth'],
    'notes': None,
    'onsets': None,
}
p = subprocess.run(['/home/user/gtr/bin/gtr-eval'] + sys.argv[1:], capture_output=True, text=True)
eid = [l for l in p.stderr.splitlines() if l.startswith('[gtr-eval')]
try:
    d = json.loads(p.stdout)
except Exception:
    print('NO JSON; exit', p.returncode, p.stdout[-500:], p.stderr[-800:])
    sys.exit(1)
if 'error' in d:
    print(eid, 'ERROR', d['error'])
    sys.exit(1)
sub = d.get('subcommand')
m = d.get('metrics', {})
keys = KEYS.get(sub)
if keys:
    m = {k: m.get(k) for k in keys}
    tc = d.get('tuning_and_capo', {})
    m['tuning_and_capo'] = {'est': tc.get('est'), 'tuning_differs': tc.get('tuning_differs'),
                            'capo_differs': tc.get('capo_differs')}
    m['string_difference_counts'] = d['metrics'].get('string_difference_counts')
print(' '.join(eid), json.dumps({'counts': d.get('counts'), 'metrics': m, 'ignore_time_used': d.get('IGNORE_TIME_USED'),
                                 'processing': (d.get('processing') or [])[:4]}))
