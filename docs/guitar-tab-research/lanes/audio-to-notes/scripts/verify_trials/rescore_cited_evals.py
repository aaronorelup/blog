"""Re-run gtr-eval (no ledger) with the exact argv of every eval id cited in trials.md and compare the result with
the stored ledger result: est sha256, counts and metrics."""
import json, re, subprocess, sys, os
T='/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/trials.md'
ids=sorted(set(re.findall(r'\b(e\d{4})\b', open(T).read())))
ev={}
for l in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    d=json.loads(l); ev[d['id']]=d
out=open(sys.argv[1],'w')
out.write('eval_id\tsubcommand\ttruth\test_sha256_same\tcounts_same\tmetrics_same\twhole_result_same\tnote\n')
nsame=0
for e in ids:
    d=ev[e]; argv=d['argv']
    p=subprocess.run(['/home/user/gtr/bin/gtr-eval']+argv+['--no-ledger'],capture_output=True,text=True,cwd=d['cwd'] if os.path.isdir(d['cwd']) else '/')
    try:
        r=json.loads(p.stdout.strip().splitlines()[-1])
    except Exception as ex:
        out.write(f'{e}\t{argv[0]}\t\t\t\t\t\tERROR {p.returncode} {p.stderr[-200:]!r}\n'); continue
    o=d['result']
    shs=r['est'].get('sha256')==o['est'].get('sha256') if isinstance(r.get('est'),dict) else None
    cs=r.get('counts')==o.get('counts'); ms=r.get('metrics')==o.get('metrics'); ws=(r==o)
    note=''
    if not ws:
        diff=[k for k in set(r)|set(o) if r.get(k)!=o.get(k)]
        note='differs in: '+','.join(sorted(diff))
    nsame+=ms
    out.write(f"{e}\t{argv[0]}\t{o['truth'].get('id')}\t{shs}\t{cs}\t{ms}\t{ws}\t{note}\n"); out.flush()
print('ids',len(ids),'metrics identical',nsame)
