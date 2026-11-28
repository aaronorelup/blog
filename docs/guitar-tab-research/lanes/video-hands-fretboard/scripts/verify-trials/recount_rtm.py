"""Verifier: recount rtmlib JSONL (frames with det box, hands per frame, score stats, per-shot det boxes)."""
import json, sys, statistics as st
import numpy as np
for p in sys.argv[1:]:
    R=[json.loads(l) for l in open(p)]
    k=[len(r['hands']) for r in R]; t=[r['t_infer_ms'] for r in R]
    sc=[h['score'] for r in R for h in R and r['hands']]
    det=sum(1 for r in R if r['n_det_boxes']>0)
    detshot={}
    for r in R:
        if r['n_det_boxes']>0: detshot[r['shot']]=detshot.get(r['shot'],0)+1
    lab={}
    for r in R:
        for h in r['hands']: lab[h['label']]=lab.get(h['label'],0)+1
    print(p, 'frames',len(R),'det',det,detshot,'maxbox',max(r['n_det_boxes'] for r in R),
          '0/1/2/>2', k.count(0),k.count(1),k.count(2),sum(1 for x in k if x>2),
          'mean/med/p90', round(st.mean(t),2), round(st.median(t),2), round(float(np.percentile(t,90)),2), 'fps', round(1000/st.mean(t),2),
          'score', (round(st.mean(sc),3), round(min(sc),3), round(max(sc),3)) if sc else None, 'labels', lab)
