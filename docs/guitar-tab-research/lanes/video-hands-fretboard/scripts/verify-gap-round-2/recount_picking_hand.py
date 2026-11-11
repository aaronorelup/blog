"""Independent recount of the gap-round-2 picking-hand measurement (verify-gapfill, round 2).
Written separately from picking_hand_onsets.py: own speed computation, own onset merge, own local-maximum
rule (v[i-1] < v[i] > v[i+1], i.e. no plateau handling) and own percentile threshold.
Usage: python -I recount_picking_hand.py <R3c_full.jsonl> <R3c.notes.csv (Basic Pitch r0264)> <speeds_R3c.npz of a run>
The npz is used only for its librosa onset list (librosa itself is not re-implemented here)."""
import csv, json, sys
import numpy as np

jl, bp_csv, npz = sys.argv[1:4]
recs = [json.loads(l) for l in open(jl)]
n = len(recs)
R = np.full((n, 21, 2), np.nan); Lw = []
right_per_frame = []; rscores = []
for i, r in enumerate(recs):
    rh = [h for h in r['hands'] if h['label'] == 'Right']
    right_per_frame.append(len(rh))
    if len(rh) == 1:
        R[i] = rh[0]['lm_px_full']; rscores.append(rh[0]['score'])
    for h in r['hands']:
        if h['label'] == 'Left':
            Lw.append(h['lm_px_full'][0])
print('frames', n, 'frames with exactly one Right', sum(1 for c in right_per_frame if c == 1),
      'max Right per frame', max(right_per_frame))
print('t_s check max |t_s - n/25|', max(abs(r['t_s'] - r['n'] / 25.0) for r in recs))
print('Right score mean %.4f min %.4f' % (np.mean(rscores), np.min(rscores)))
w = R[:, 0, :]
print('Right wrist mean (%.1f, %.1f), x min %.1f max %.1f' % (w[:, 0].mean(), w[:, 1].mean(), w[:, 0].min(), w[:, 0].max()))
jump = np.hypot(*np.diff(w, axis=0).T)
print('wrist jump median %.2f p95 %.2f max %.2f' % (np.median(jump), np.percentile(jump, 95), jump.max()))
if Lw:
    Lw = np.array(Lw); print('Left (fretting) wrist mean x %.1f over %d detections' % (Lw[:, 0].mean(), len(Lw)))

# onsets
st = []
for row in csv.reader(open(bp_csv)):
    if row[0] == 'start_time_s':
        continue
    st.append(float(row[0]))
st.sort()
kept = []
for s in st:
    if kept and s - kept[-1] <= 0.030:
        continue
    kept.append(s)
bp = np.array(kept)
print('BP notes', len(st), 'onsets after merge', len(bp), 'merged', len(st) - len(bp), 'first %.3f last %.3f' % (bp[0], bp[-1]))
lr = np.load(npz)['librosa_onsets']
print('librosa onsets', len(lr), 'first %.3f last %.3f' % (lr[0], lr[-1]),
      'BP onsets with a librosa onset within 40 ms', int(sum(np.min(np.abs(lr - o)) <= 0.040 for o in bp)))

tm = (np.arange(1, n) - 0.5) / 25.0
def series(k, frame):
    p = R[:, k, :] - (R[:, 0, :] if frame == 'rel' else 0)
    return np.hypot(*np.diff(p, axis=0).T)
def peaks(v):
    thr = np.percentile(v, 75)
    idx = [i for i in range(1, len(v) - 1) if v[i - 1] < v[i] > v[i + 1] and v[i] > thr]
    return np.array(idx, dtype=int)
grid = np.arange(0, n / 25.0, 0.001)
for name, ons in (('basic_pitch', bp), ('librosa', lr)):
    near = np.array([np.min(np.abs(ons - t)) <= 0.040 + 1e-9 for t in tm])
    print('==', name, 'onsets', len(ons), 'near', int(near.sum()), 'rest', int((~near).sum()))
    for lab, k, fr in (('wrist', 0, 'abs'), ('thumb', 4, 'abs'), ('thumb', 4, 'rel'), ('index', 8, 'abs'), ('index', 8, 'rel'),
                       ('middle', 12, 'abs'), ('middle', 12, 'rel'), ('ring', 16, 'abs'), ('ring', 16, 'rel'), ('pinky', 20, 'rel')):
        v = series(k, fr)
        pk = peaks(v); pt = tm[pk]
        d = np.array([np.min(np.abs(pt - o)) for o in ons])
        hits = int((d <= 0.040 + 1e-9).sum())
        cov = np.zeros_like(grid, dtype=bool)
        for p in pt:
            cov |= np.abs(grid - p) <= 0.040 + 1e-9
        prof = []
        for lag in range(-5, 6):
            vals = []
            for o in ons:
                j = int(np.argmin(np.abs(tm - (o + lag / 25.0))))
                if abs(tm[j] - (o + lag / 25.0)) <= 0.02 + 1e-9:
                    vals.append(v[j])
            prof.append(round(float(np.mean(vals)), 2))
        print('%-6s %s near med %.2f rest med %.2f near mean %.2f rest mean %.2f peaks %d hits %d share %.3f timeline %.3f med-dist %.1f ms'
              % (lab, fr, np.median(v[near]), np.median(v[~near]), v[near].mean(), v[~near].mean(), len(pk), hits,
                 hits / len(ons), cov.mean(), 1000 * np.median(d)))
        if name == 'basic_pitch':
            print('        onset-locked k=-5..+5:', prof)
