"""Analyse a sync_s4 capture: where S4 sits in the recorded graph timeline, where each click landed, and how
HTMLMediaElement.currentTime / the buffer position moved against AudioContext.currentTime.

Usage: python analyze_sync.py <result.json from drive.mjs> <out.json>
Channel 0 of the capture is S4 as it arrived in the graph ((L+R)/2), channel 1 the clicks.
"""
import json, sys
import numpy as np, soundfile as sf
from scipy.signal import fftconvolve

res = json.load(open(sys.argv[1]))['result']
sr = res['sampleRate']
cap, csr = sf.read(res['wav'], dtype='float64', always_2d=True)
assert csr == sr
first = res['capture']['firstFrame']
ref, rsr = sf.read('/home/user/gtr/inputs/S4/S4.wav', dtype='float64', always_2d=True)
assert rsr == sr
ref = ref.mean(axis=1)
x = cap[:, 0]
beats = np.array([b['beat'] for b in res['scheduled']]) if res['scheduled'] else None
beats = np.loadtxt('/home/user/gtr/inputs/S4/S4.beats.txt', usecols=0)

# 1) global lag of S4 inside the capture (capture index of S4 sample 0), by FFT cross-correlation
corr = fftconvolve(x, ref[::-1], mode='full')
lag = int(np.argmax(corr)) - (len(ref) - 1)
seg = x[lag:lag + len(ref)] if lag >= 0 else None
out = {'capture_index_of_S4_sample0': lag, 'context_frame_of_S4_sample0': lag + first}
if seg is not None and len(seg) == len(ref):
    out['max_abs_difference_capture_vs_S4_mono_at_lag'] = float(np.max(np.abs(seg - ref)))
    out['rms_difference'] = float(np.sqrt(np.mean((seg - ref) ** 2)))
if 'start_frame_scheduled' in res:
    out['start_frame_scheduled'] = res['start_frame_scheduled']
    out['start_frame_found_minus_scheduled_frames'] = lag + first - res['start_frame_scheduled']

# 2) local lag in 2 s windows (does the position of S4 in the timeline move during playback?)
loc = []
W, step, search = 2 * sr, 2 * sr, int(0.05 * sr)
for s in range(int(1.5 * sr), len(ref) - W, step):
    r = ref[s:s + W]
    if np.sqrt(np.mean(r ** 2)) < 1e-3:
        continue
    a = lag + s - search
    if a < 0 or a + W + 2 * search > len(x):
        continue
    c = fftconvolve(x[a:a + W + 2 * search], r[::-1], mode='valid')
    l = int(np.argmax(c)) - search
    loc.append([round(s / sr, 3), l])
out['local_lag_frames_vs_global'] = loc
out['local_lag_values'] = sorted(set(l for _, l in loc))

# 3) click onsets (channel 1): first sample above 0.05 after 100 ms below it
y = np.abs(cap[:, 1])
on, quiet, minGap = [], int(0.1 * sr), int(0.1 * sr)
for i in np.flatnonzero(y > 0.05):
    if not on or i - last > minGap:
        on.append(int(i))
    last = i
on = np.array(on)
out['n_clicks_detected'] = int(len(on)); out['n_beats'] = int(len(beats))
beat_idx = lag + np.round(beats * sr).astype(int)
n = min(len(on), len(beat_idx))
off = (on[:n] - beat_idx[:n]) / sr * 1000.0
def st(a):
    a = np.asarray(a, float)
    return {'n': int(a.size), 'mean': float(a.mean()), 'median': float(np.median(a)), 'sd': float(a.std()),
            'min': float(a.min()), 'max': float(a.max()), 'max_abs': float(np.abs(a).max())}
out['click_minus_beat_ms'] = st(off)
out['click_minus_beat_ms_first10'] = [round(v, 3) for v in off[:10]]

# 4) clocks: media position vs context time
log = np.array(res['clock_log'], float)
if len(log) > 10:
    pos, ct = log[:, 1], log[:, 2]
    keep = (pos > 0.2) & (pos < pos.max() - 0.2)
    d = (pos - ct)[keep]
    tt = ct[keep]
    p = np.polyfit(tt - tt[0], d, 1)
    resid = d - np.polyval(p, tt - tt[0])
    out['clock'] = {
        'samples': int(keep.sum()), 'span_s': float(tt[-1] - tt[0]),
        'position_minus_ctxTime_first_s': float(d[0]), 'position_minus_ctxTime_last_s': float(d[-1]),
        'change_over_span_ms': float((d[-1] - d[0]) * 1000), 'fit_slope_ms_per_min': float(p[0] * 1000 * 60),
        'residual_ms': st(resid * 1000),
        'distinct_position_values': int(len(np.unique(pos[keep]))),
    }
    steps = np.diff(np.unique(pos[keep]))
    if len(steps):
        out['clock']['position_update_step_ms'] = st(steps * 1000)
json.dump(out, open(sys.argv[2], 'w'), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ('local_lag_frames_vs_global',)}, indent=1))
