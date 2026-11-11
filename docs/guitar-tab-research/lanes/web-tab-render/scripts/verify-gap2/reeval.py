#!/usr/bin/env python3
"""verify-gapfill-web-tab-render (round 2): re-score the eval ids cited in trials.md "Gap round 2" with the same
arguments and --no-ledger, and compare everything but the version and definitions with the stored result.
Usage: python3 -I reeval.py <out tsv> <scratch dir> eNNNN ..."""
import hashlib, json, os, subprocess, sys
out_tsv, scratch, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(scratch, exist_ok=True)
rows = {}
for line in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    if line.strip():
        r = json.loads(line); rows[r['id']] = r
def strip(d):
    return {k: v for k, v in d.items() if k not in ('gtr_eval_version', 'definitions', 'libraries', 'processing')}
with open(out_tsv, 'w') as f:
    f.write('eval_id\tstored_version\trerun_version\test_file_sha256_unchanged\texit_stored\texit_rerun\tidentical_apart_from_version\tn_matched\tsame_string_and_fret\n')
    for i in ids:
        r = rows[i]; argv = list(r['argv'])
        if '--out' in argv:
            argv[argv.index('--out') + 1] = os.path.join(scratch, i + '.json')
        est = r['result']['est']['file']
        same_sha = hashlib.sha256(open(est, 'rb').read()).hexdigest() == r['result']['est']['sha256']
        p = subprocess.run(['/home/user/gtr/bin/gtr-eval'] + argv + ['--no-ledger'], cwd=r['cwd'], capture_output=True, text=True)
        new = json.load(open(os.path.join(scratch, i + '.json')))
        f.write('\t'.join(map(str, [i, r['result']['gtr_eval_version'], new['gtr_eval_version'], same_sha, r['exit_code'],
                                    p.returncode, strip(new) == strip(r['result']), new['counts']['n_matched'],
                                    new['metrics']['same_string_and_fret_count']])) + '\n')
print(open(out_tsv).read())
