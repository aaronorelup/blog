# Independent recount (verifier): onset files vs S6taps truth events, written without importing the lane's fvt_common.
import json, sys, os, numpy as np, mir_eval
T = json.load(open('/home/user/gtr/inputs/S6taps/S6taps.truth.json'))
on = sorted(n['onset'] for n in T['notes'])
groups = []
for t in on:
    if groups and t - groups[-1] <= 0.001: continue
    groups.append(t)
groups = np.array(groups)
taps = np.array(sorted(t['time'] for t in T['taps']))
ev = []  # (time,label)
tapnear = set()
for t in taps:
    d = np.abs(groups - t); i = int(np.argmin(d))
    if d[i] <= 0.001: tapnear.add(i)
    else: ev.append((t, 'tap-only'))
for i, g in enumerate(groups):
    ev.append((g, 'tap+note' if i in tapnear else 'note-only'))
ev.sort()
et = np.array([e[0] for e in ev]); el = [e[1] for e in ev]
L = '/home/user/gtr/lanes/fingerstyle-voices-taps/out/'
SS = '/home/user/gtr/lanes/source-separation/out/'
files = sys.argv[1:]
for f in files:
    p = f if f.startswith('/') else L + f
    est = np.sort(np.atleast_1d(np.loadtxt(p))) if os.path.getsize(p) else np.array([])
    m = mir_eval.util.match_events(et, est, 0.05)
    c = {'tap+note': 0, 'note-only': 0, 'tap-only': 0}
    for ri, ei in m: c[el[ri]] += 1
    ft = mir_eval.onset.f_measure(taps, est, window=0.05)
    fn = mir_eval.onset.f_measure(groups, est, window=0.05)
    print(f"{f}: n {len(est)} | {c['tap+note']} {c['note-only']} {c['tap-only']} neither {len(est)-len(m)} | taps P {ft[1]:.3f} R {ft[2]:.3f} F {ft[0]:.3f} | notes P {fn[1]:.3f} R {fn[2]:.3f} F {fn[0]:.3f}")
