"""Onset timing of a reference-playback capture against the truth notes of its clip.

Usage: python analyze_synths.py <result.json from drive.mjs, or "baseline:<wav>"> <clip id> <out prefix>

- Onsets: librosa.onset.onset_detect(y=mono, sr, hop_length=128, units='time') on the mono mix (the same detector the
  inputs manifest used as its sanity check).
- Time base: for pages that scheduled the notes at t0 + onset, truth time = (capture frame + firstFrame - t0_frame) / sr.
  For the js-synthesizer page (MIDI player, start not set by the page) the shift is estimated: the one that matches
  the most detected onsets to truth onsets within 50 ms (1 ms grid from 0 to 3 s), refined to the median difference
  of those matches; it is reported as "estimated_shift_s".
- Writes <out prefix>.onsets.txt (one time per line, truth time base). Scoring is done afterwards with gtr-eval
  onsets --field notes, so the numbers carry a gtr-eval id.
- Also reports, for the clip's own truth render (<clip>.mono.wav), the peak normalized cross-correlation with the
  capture and its lag (how close the capture is to the FluidSynth render of the truth).
"""
import json, sys
import numpy as np, soundfile as sf, librosa
from scipy.signal import fftconvolve

src, clip, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
truth = json.load(open(f'/home/user/gtr/inputs/{clip}/{clip}.truth.json'))
tr_on = np.unique(np.round([n['onset'] for n in truth['notes'] if n['voice'] != 'drums'], 3))
out = {'source': src, 'clip': clip}
if src.startswith('baseline:'):
    wav = src.split(':', 1)[1]; res = None
else:
    res = json.load(open(src))['result']; wav = res['wav']
y, sr = sf.read(wav, dtype='float32', always_2d=True)
y = y.mean(axis=1)
on = librosa.onset.onset_detect(y=y, sr=sr, hop_length=128, units='time')
out['n_detected'] = int(len(on)); out['sample_rate'] = sr
if res is not None and res.get('t0_frame') is not None:
    # a repeated currentFrame (negative step) recorded by the first recorder version moved every later sample by
    # that many frames (see trials.md, metronome section); add it back for steps before the first note
    extra = sum(-g['frames'] for g in res['capture']['gaps'] if g['frames'] < 0 and 'handled' not in g and g['atFrame'] < res['t0_frame'])
    shift = (res['t0_frame'] - res['capture']['firstFrame'] + extra) / sr
    out['shift_from_schedule_s'] = shift; out['recorder_negative_step_correction_frames'] = extra
elif res is not None:
    best = (-1, 0.0)
    for s in np.arange(0, 3.0, 0.001):
        d = np.abs((on - s)[:, None] - tr_on[None, :]).min(axis=1)
        c = int((d <= 0.05).sum())
        if c > best[0]:
            best = (c, s)
    s = best[1]
    diffs = []
    for t in on:
        j = np.argmin(np.abs(t - s - tr_on))
        if abs(t - s - tr_on[j]) <= 0.05:
            diffs.append(t - s - tr_on[j])
    shift = s + float(np.median(diffs))
    out['estimated_shift_s'] = shift; out['estimated_shift_matches'] = best[0]
else:
    shift = 0.0
est = on - shift
np.savetxt(prefix + '.onsets.txt', est, fmt='%.6f')
# similarity with the truth render
ref, rsr = sf.read(f'/home/user/gtr/inputs/{clip}/{clip}.mono.wav', dtype='float32')
if rsr == sr and not src.startswith('baseline:'):
    c = fftconvolve(y, ref[::-1], mode='full')
    k = int(np.argmax(np.abs(c)))
    lag = k - (len(ref) - 1)
    a = y[max(lag, 0):max(lag, 0) + len(ref)]
    b = ref[max(-lag, 0):max(-lag, 0) + len(a)]
    a = a[:len(b)]
    out['xcorr_with_truth_render'] = {'lag_samples': lag, 'lag_s': lag / sr,
        'normalized_peak': float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12)),
        'gain_fit': float(np.dot(a, b) / (np.dot(b, b) + 1e-12))}
    g = out['xcorr_with_truth_render']['gain_fit']
    out['xcorr_with_truth_render']['residual_rms_rel'] = float(np.linalg.norm(a - g * b) / (np.linalg.norm(a) + 1e-12))
json.dump(out, open(prefix + '.analysis.json', 'w'), indent=1)
print(json.dumps(out))
