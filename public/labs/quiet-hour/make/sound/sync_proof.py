"""Sync proof for the soundtrack: are the sounds where the picture's frames say they are?

    python sync_proof.py --plain soundtrack-main.wav --proof soundtrack-main-syncproof.wav --cues cues-main.json \
        --programme <the published programme WAV the build read>

1. Bar-line clicks. build_sound.py --sync-proof adds a click at the first sample of every bar line (frame 30 k) on the
   TV, before the speaker chain. proof - plain is then the clicks alone, after the chain. Each click's onset (the first
   sample of its 2 ms window above half its peak) must be at frame x 2000. The speaker chain's filters delay a click's
   peak by a few samples; anything within 24 samples (0.5 ms) passes.
2. The programme's own notes, which nobody placed by hand: note g of the published audio (as the build reads it)
   should start at sample g x 10,000 (frame 5 g). The rise of high-band energy (1 ms hops) is cross-correlated with
   a train of pulses at the note starts, each weighted by its pluck velocity; the best lag must be within half a frame
   (1,000 samples). The build places the programme at sample 0, so (1) + (2) is the sync of the music.
numpy and scipy only. Prints a JSON report; exits non-zero if a check fails.
"""
import argparse
import json
import sys

import numpy as np
from scipy.signal import butter, sosfilt

from wav24 import read_wav

SR, SPF, FPB, SPN = 48000, 2000, 30, 10000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--plain', required=True)
    ap.add_argument('--proof', required=True)
    ap.add_argument('--cues', required=True)
    ap.add_argument('--programme', required=True, help='the published programme WAV the build read')
    a = ap.parse_args()
    x = read_wav(a.plain)
    y = read_wav(a.proof)
    rep = {'samples': [len(x), len(y)]}
    d = (y - x).mean(axis=1)
    bars = []
    for b in range(2400 // FPB):
        s = b * FPB * SPF
        w = np.abs(d[max(0, s - 1000):s + 1000])
        pk = w.max()
        onset = int(np.nonzero(w >= 0.5 * pk)[0][0]) + max(0, s - 1000)
        bars.append({'bar': b, 'frame': b * FPB, 'expected': s, 'found': onset, 'offset': onset - s})
    offs = [r['offset'] for r in bars]
    rep['clicks'] = {'count': len(bars), 'offsetsSamples': sorted(set(offs)), 'maxAbsOffset': int(max(abs(o) for o in offs)),
                     'first': bars[:3], 'last': bars[-2:]}
    # pluck onsets in the published programme: high band (2 to 5 kHz) energy rise in 1 ms hops
    c = json.load(open(a.cues))
    vel = c['perNote']['velocity']
    pr = read_wav(a.programme)
    hb = sosfilt(butter(4, [2000, 5000], btype='bandpass', fs=SR, output='sos'), pr.mean(axis=1) if pr.ndim == 2 else pr)
    hop = 48
    m = len(hb) // hop
    e = np.sqrt((hb[:m * hop].reshape(m, hop) ** 2).mean(1)) + 1e-9
    led = 20 * np.log10(e)
    flux = np.maximum(0, np.diff(led, prepend=led[0]))
    train = np.zeros(m)
    for g in range(432):
        if vel[g] is not None:
            train[g * SPN // hop] = vel[g]
    lags = np.arange(-40, 41)
    score = [float(np.dot(flux[max(0, L):m + min(0, L)], train[max(0, -L):m - max(0, L)])) for L in lags]
    best = int(lags[int(np.argmax(score))]) * hop
    rep['plucks'] = {'bestLagSamples': best, 'lagStepSamples': hop, 'searchedSamples': [-40 * hop, 40 * hop],
                     'scoreAtBestOverMedian': round(max(score) / float(np.median(score)), 2)}
    ok = rep['clicks']['maxAbsOffset'] <= 24 and abs(rep['plucks']['bestLagSamples']) <= SPF // 2
    rep['pass'] = bool(ok)
    print(json.dumps(rep, indent=1))
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
