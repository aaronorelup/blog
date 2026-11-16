"""Verifier: compare a re-run JSONL with the trial's JSONL frame by frame (counts, labels, landmark distance)."""
import json, sys, math, statistics as st
a, b = sys.argv[1], sys.argv[2]
A=[json.loads(l) for l in open(a)]; B=[json.loads(l) for l in open(b)]
same_counts=sum(1 for x,y in zip(A,B) if len(x['hands'])==len(y['hands']))
same_labels=sum(1 for x,y in zip(A,B) if sorted(str(h.get('label')) for h in x['hands'])==sorted(str(h.get('label')) for h in y['hands']))
d=[]
key='lm_px_full'
for x,y in zip(A,B):
    if len(x['hands'])==len(y['hands']):
        for hx,hy in zip(x['hands'],y['hands']):
            px=hx.get('lm_px_full') or hx.get('kp_px_full'); py=hy.get('lm_px_full') or hy.get('kp_px_full')
            if px and py:
                d.extend(math.hypot(p[0]-q[0],p[1]-q[1]) for p,q in zip(px,py))
print(f"frames trial {len(A)} rerun {len(B)}; same hand count {same_counts}; same label set {same_labels}; "
      + (f"landmark distance rerun-vs-trial: max {max(d):.3f} px, mean {st.mean(d):.4f} px, exactly equal {sum(1 for v in d if v==0)}/{len(d)}" if d else "no landmarks"))
