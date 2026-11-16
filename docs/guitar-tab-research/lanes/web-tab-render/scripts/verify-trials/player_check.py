# Independent recomputation of the alphaTab player event timing (verifier, not the trial's analyze_player_log.py).
import json, sys, statistics as st
p, bpm, speed, countin_bars = sys.argv[1], 112.0, float(sys.argv[2]) if len(sys.argv) > 2 else 1.0, int(sys.argv[3]) if len(sys.argv) > 3 else 0
d = json.load(open(p)); log = d['log']
tplay = [e['t_ms'] for e in log if e['type'] == 'play_called'][0]
fin = [e['t_ms'] - tplay for e in log if e['type'] == 'playerFinished']
nom = lambda tick: (tick / 960 * 60 / bpm / speed) * 1000 + countin_bars * 4 * 60 / bpm / speed * 1000
by = {}
for e in log:
    if e['type'] != 'midiEvents': continue
    for ev in e['events']:
        by.setdefault(ev['type'], []).append((e['t_ms'] - tplay, ev['tick'], ev))
def stats(xs): return dict(n=len(xs), median=round(st.median(xs), 2), min=round(min(xs), 2), max=round(max(xs), 2), sd=round(st.pstdev(xs), 2)) if xs else None
print('counts by type', {k: len(v) for k, v in by.items()}, 'playerFinished after play', fin)
for t in (128, 144):
    if t in by: print(t, stats([a - nom(tk) for a, tk, _ in by[t]]))
m = sorted(a for a, tk, _ in by.get(242, []))
print('metronome intervals', stats([b - a for a, b in zip(m, m[1:])]), 'first5', [round(x, 1) for x in m[:5]])
pos = [e for e in log if e['type'] == 'position' and not e.get('isSeek')]
fins = fin[0] if fin else 1e12
w = [(e['t_ms'] - tplay) - e['currentTime'] for e in pos if 0 <= e['t_ms'] - tplay <= fins]
print('position wall-reported', stats(w), 'n position total', len([e for e in log if e['type']=='position']))
pb = [e for e in log if e['type'] == 'playedBeat']
print('playedBeat keys', list(pb[0].keys())[:12] if pb else None)
k128 = [ev.get('noteKey') for a, tk, ev in sorted(by.get(128, []), key=lambda x: x[0])][:8]
print('first noteKeys type128', k128)
