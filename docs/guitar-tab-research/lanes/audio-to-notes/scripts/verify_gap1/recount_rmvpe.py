import csv, json, sys, numpy as np
O = '/home/user/gtr/lanes/audio-to-notes/out/rmvpe/f0/'
for c in ['S1','S2n','S2s','S4','S4lead','R1b','R2','R3a']:
    rows = list(csv.reader(open(O + c + '.f0.csv')))
    hdr, rows = rows[0], rows[1:]
    t = np.array([float(r[0]) for r in rows]); f = np.array([float(r[1]) for r in rows]); cf = np.array([float(r[2]) for r in rows])
    hops = np.diff(t)
    print(c, hdr, 'frames', len(rows), 'ge0.03', int((cf >= 0.03).sum()), 'ge0.5', int((cf >= 0.5).sum()), 'max %.3f' % cf.max(),
          'hop min/max %.4f/%.4f' % (hops.min(), hops.max()), 'f min/max %.1f/%.1f' % (f.min(), f.max()), 'zeros', int((f == 0).sum()), 'first', rows[0])
