import json, sys, statistics as st
import numpy as np
for p in sys.argv[1:]:
    R=[json.loads(l) for l in open(p)]
    t=[r['t_infer_ms'] for r in R]; inf=[r['ultra_speed_ms']['inference'] for r in R]
    k=[len(r['hands']) for r in R]
    per=sum(1 for r in R if r['persons']); maxp=max(len(r['persons']) for r in R)
    # wrists >=0.5 per person-left / person-right
    lw=sum(1 for r in R if any(h['label']=='person_left' for h in r['hands']))
    rw=sum(1 for r in R if any(h['label']=='person_right' for h in r['hands']))
    print(p.split('out/')[-1], 'frames',len(R),'person',per,'maxp',maxp,'0/1/2/>2',k.count(0),k.count(1),k.count(2),sum(1 for x in k if x>2),
          'mean/med/p90',round(st.mean(t),2),round(st.median(t),2),round(float(np.percentile(t,90)),2),'fps',round(1000/st.mean(t),2),
          'ultra_inf_mean',round(st.mean(inf),1),'first',t[0],'frames with left wrist',lw,'right wrist',rw)
