import json, sys, statistics as st
import numpy as np
for p in sys.argv[1:]:
    R=[json.loads(l) for l in open(p)]
    t=[r['t_infer_ms'] for r in R]; k=[len(r['hands']) for r in R]
    lab={}
    for r in R:
        for h in r['hands']: lab[h['label']]=lab.get(h['label'],0)+1
    pf=sum(1 for r in R if r.get('pose_found'))
    out=f"{p.split('out/')[-1]} frames {len(R)} pose {pf} 0/1/2 {k.count(0)}/{k.count(1)}/{k.count(2)} mean/med/p90 {st.mean(t):.2f}/{st.median(t):.2f}/{float(np.percentile(t,90)):.2f} fps {1000/st.mean(t):.2f} labels {lab}"
    print(out)
    sh={}
    for r in R: sh.setdefault(r['shot'],[]).append(r)
    if len(sh)>1:
        for s,rs in sh.items():
            kk=[len(r['hands']) for r in rs]; l2={}
            for r in rs:
                for h in r['hands']: l2[h['label']]=l2.get(h['label'],0)+1
            print('   ',s,len(rs),f"{kk.count(0)}/{kk.count(1)}/{kk.count(2)}", l2, 'mean ms', round(st.mean(r['t_infer_ms'] for r in rs),2))
