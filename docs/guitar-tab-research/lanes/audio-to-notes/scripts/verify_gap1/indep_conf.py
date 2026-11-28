import csv, json, numpy as np
O = '/home/user/gtr/lanes/audio-to-notes/out/rmvpe/f0/'
for c, truth, voice in [('S1','S1','melody'),('S2n','S2n','melody'),('S2s','S2s','melody'),('S4','S4','melody'),('S4lead','S4','melody'),('R1b','R1b','lead')]:
    T = json.load(open('/home/user/gtr/inputs/%s/%s.truth.json' % (truth, truth)))
    rows = list(csv.reader(open(O + c + '.f0.csv')))[1:]
    t = np.array([float(r[0]) for r in rows]); f = np.array([float(r[1]) for r in rows]); cf = np.array([float(r[2]) for r in rows])
    ref = np.zeros(len(t)); 
    notes = sorted([n for n in T['notes'] if n['voice'] == voice], key=lambda n: n['onset'])
    for n in notes:  # later onset wins
        m = (t >= n['onset'] - 1e-9) & (t < n['offset'] - 1e-9)
        ref[m] = 440 * 2 ** ((n['pitch'] - 69) / 12)
    v = ref > 0
    cents = 1200 * np.abs(np.log2(np.where(f > 0, f, 1e-9) / np.where(v, ref, 1)))
    print(c, 'in-note frames', int(v.sum()), 'median conf %.4f' % np.median(cf[v]), 'p90 %.4f' % np.percentile(cf[v], 90), 'share<50c %.3f' % (cents[v] < 50).mean())
