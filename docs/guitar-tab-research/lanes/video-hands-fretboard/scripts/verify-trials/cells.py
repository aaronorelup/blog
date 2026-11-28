import json, sys
# regions as in hand_regions.py (copied, verifier re-implementation)
REG={"medium":{"fretting":(340,160,410,260),"picking":(280,245,360,320)},"wide":{"fretting":(330,150,450,235)}}
def where(shot,cx,cy):
    for n,(a,b,c,d) in REG.get(shot,{}).items():
        if a<=cx<=c and b<=cy<=d: return n
    return 'elsewhere'
for p in sys.argv[1:]:
    cell={}; tot=0; incell=0; frames_cell=set()
    f300=None
    for l in open(p):
        r=json.loads(l)
        for h in r['hands']:
            pts=h.get('lm_px_full') or h.get('kp_px_full')
            if not pts: continue
            xs=[q[0] for q in pts]; ys=[q[1] for q in pts]
            cx=(min(xs)+max(xs))/2; cy=(min(ys)+max(ys))/2
            if r['n']==300: print('  f300', h.get('label'), h.get('score'), 'box', (round(min(xs)),round(min(ys)),round(max(xs)),round(max(ys))), 'centre',(round(cx,1),round(cy,1)), where(r['shot'],cx,cy))
            if r['shot']=='wide' and where('wide',cx,cy)=='elsewhere':
                tot+=1
                if 340<=cx<360 and 260<=cy<280: incell+=1; frames_cell.add(r['n'])
                k=(int(cx//20)*20,int(cy//20)*20); cell[k]=cell.get(k,0)+1
    print(p,'wide elsewhere detections',tot,'in cell 340-360x260-280:',incell,'frames',len(frames_cell),'cells',sorted(cell.items(),key=lambda x:-x[1])[:5])
