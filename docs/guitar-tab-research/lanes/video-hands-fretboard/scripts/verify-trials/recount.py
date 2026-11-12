"""Independent recount of per-frame JSONL outputs (verifier). Usage: python recount.py <jsonl> [...]"""
import json, sys, statistics
import numpy as np
def block(recs):
    k=[len(r['hands']) for r in recs]
    t=[r['t_infer_ms'] for r in recs]
    lab={}
    sc=[]
    for r in recs:
        for h in r['hands']:
            lab[h.get('label')]=lab.get(h.get('label'),0)+1
            if h.get('score') is not None: sc.append(h['score'])
    out=dict(frames=len(recs), n0=k.count(0), n1=k.count(1), n2=k.count(2), nmore=sum(1 for x in k if x>2),
             labels=lab, mean=round(statistics.mean(t),2), median=round(statistics.median(t),2),
             p90=round(float(np.percentile(t,90)),2), fps=round(1000/statistics.mean(t),2))
    if sc: out.update(score_mean=round(statistics.mean(sc),4), score_min=round(min(sc),4), score_max=round(max(sc),4))
    return out
for p in sys.argv[1:]:
    recs=[json.loads(l) for l in open(p)]
    print('##', p)
    print('  all  ', block(recs))
    shots={}
    for r in recs: shots.setdefault(r['shot'],[]).append(r)
    if len(shots)>1:
        for s,rs in shots.items(): print('  ', s, block(rs))
