# Independent recompute (verifier) of the event-energy table: energy in [t, t+50 ms) of the mono signal, dB re loudest event.
import json, sys, numpy as np, soundfile as sf
T = json.load(open('/home/user/gtr/inputs/S6taps/S6taps.truth.json'))
on = sorted(n['onset'] for n in T['notes']); g = []
for t in on:
    if g and t - g[-1] <= 0.001: continue
    g.append(t)
g = np.array(g); taps = sorted(t['time'] for t in T['taps']); ev = []; near = set()
for t in taps:
    i = int(np.argmin(np.abs(g - t)))
    if abs(g[i] - t) <= 0.001: near.add(i)
    else: ev.append((t, 'tap-only'))
for i, x in enumerate(g): ev.append((x, 'tap+note' if i in near else 'note-only'))
ev.sort()
for p in sys.argv[1:]:
    y, sr = sf.read(p, always_2d=True); y = y.mean(axis=1); w = int(round(0.05 * sr))
    e = np.array([np.sum(y[int(round(t * sr)):int(round(t * sr)) + w] ** 2) for t, _ in ev])
    db = 10 * np.log10(e / e.max())
    out = []
    for lab in ('tap+note', 'note-only', 'tap-only'):
        v = np.array([db[i] for i, (_, l) in enumerate(ev) if l == lab])
        out.append(f"{lab} {v.min():.2f}/{np.median(v):.2f}/{v.max():.2f}")
    tapmin = min(db[i] for i, (_, l) in enumerate(ev) if l != 'note-only')
    nmax = max(db[i] for i, (_, l) in enumerate(ev) if l == 'note-only')
    nab = sum(1 for i, (_, l) in enumerate(ev) if l == 'note-only' and db[i] > tapmin)
    print(p.replace('/home/user/gtr/lanes/', ''), '|', ' | '.join(out), f"| note-only above quietest tap: {nab}; gap {tapmin - nmax:.2f} dB")
