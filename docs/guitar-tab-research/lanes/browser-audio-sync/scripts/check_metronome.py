"""Recompute the metronome numbers from the saved capture WAV, independently of the page's own JavaScript.

Usage: python check_metronome.py <result.json> ...
Onset rule (same definition as the page): first sample with |x| > 0.05 after at least 0.1 s of samples below it.
Grid: intended first click frame + n * period (lookahead, tone, worklet) or first detected onset + n * period (interval).
"""
import json, sys
import numpy as np, soundfile as sf

for p in sys.argv[1:]:
    d = json.load(open(p)); r = d['result']
    x, sr = sf.read(r['wav'], dtype='float64')
    a = np.abs(x) > 0.05
    gap = int(0.1 * sr)
    on, last = [], -10 ** 9
    for i in np.flatnonzero(a):
        if i - last > gap:
            on.append(i)
        last = i
    on = np.array(on) + r['capture']['firstFrame']
    P = r['period_frames']
    g0 = on[0] if r['method'] == 'interval' else r['first_click_intended_frame']
    dev = (on - (g0 + P * np.arange(len(on)))) / sr * 1000
    print(json.dumps({'file': p.split('/')[-1], 'n': int(len(on)), 'mean_ms': round(float(dev.mean()), 3),
                      'max_abs_ms': round(float(np.abs(dev).max()), 3), 'sd_ms': round(float(dev.std()), 3),
                      'page_mean_ms': round(r['deviation_ms']['mean'], 3), 'page_max_abs_ms': round(r['deviation_ms']['max_abs'], 3)}))

# Correction for a repeated currentFrame (gap of -128 frames followed by +128): the first recorder version appended the
# repeated quantum and then wrote 128 zeros, which moves every later sample 128 frames late. The corrected deviation
# subtracts that shift from onsets after the event (the recorder was fixed afterwards to write by frame index).
for p in sys.argv[1:]:
    d = json.load(open(p)); r = d['result']
    neg = [g for g in r['capture']['gaps'] if g['frames'] < 0 and not g.get('handled', False)]
    if not neg:
        continue
    x, sr = sf.read(r['wav'], dtype='float64')
    a = np.abs(x) > 0.05; gap = int(0.1 * sr); on, last = [], -10 ** 9
    for i in np.flatnonzero(a):
        if i - last > gap: on.append(i)
        last = i
    on = np.array(on) + r['capture']['firstFrame']
    for g in neg:
        on = np.where(on > g['atFrame'], on + g['frames'], on)
    P = r['period_frames']; g0 = r['first_click_intended_frame']
    dev = (on - (g0 + P * np.arange(len(on)))) / sr * 1000
    print(json.dumps({'file': p.split('/')[-1], 'corrected_for': neg, 'n': int(len(on)), 'mean_ms': round(float(dev.mean()), 3),
        'mean_abs_ms': round(float(np.abs(dev).mean()), 3), 'max_abs_ms': round(float(np.abs(dev).max()), 3),
        'sd_ms': round(float(dev.std()), 3), 'n_nonzero': int((np.abs(dev) > 1e-9).sum()),
        'nonzero_ms': [round(float(v), 3) for v in dev[np.abs(dev) > 1e-9]]}))
