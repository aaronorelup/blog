# Re-run every gtr-eval call cited in trials.md with the same arguments (--no-ledger) and compare the result with the
# result stored in the scoring ledger. Writes reeval.tsv: id, subcommand, est sha256 then/now, identical result yes/no.
import json, subprocess, sys
cited = json.load(open('cited.json'))['evals']
led = {}
for l in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    d = json.loads(l); led[d['id']] = d
out = open('reeval.tsv', 'w')
out.write('eval_id\tsubcommand\texit_then\texit_now\test_sha_then\test_sha_now\tresult_identical\tdiffering_keys\n')
for e in cited:
    d = led['e' + e]
    p = subprocess.run(['/home/user/gtr/bin/gtr-eval'] + d['argv'] + ['--no-ledger'], capture_output=True, text=True, cwd=d['cwd'])
    line = [l for l in p.stdout.splitlines() if l.startswith('{')]
    now = json.loads(line[-1]) if line else {'error': p.stderr[-300:]}
    then = d['result']
    same = now == then
    diff = sorted(k for k in set(now) | set(then) if now.get(k) != then.get(k))
    sha_then = (then.get('est') or {}).get('sha256', '')[:12] if isinstance(then.get('est'), dict) else ''
    sha_now = (now.get('est') or {}).get('sha256', '')[:12] if isinstance(now.get('est'), dict) else ''
    out.write(f"e{e}\t{d['argv'][0]}\t{d['exit_code']}\t{p.returncode}\t{sha_then}\t{sha_now}\t{'yes' if same else 'NO'}\t{','.join(diff)}\n")
    out.flush()
