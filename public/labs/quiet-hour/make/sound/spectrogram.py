"""Draw a soundtrack so it can be looked at: spectrogram, short-term loudness and every placed sound.

    python spectrogram.py --wav soundtrack-main.wav --json soundtrack-main.json --png soundtrack-main.png

Top: spectrogram of the mono mix, 0 to 8 kHz (log magnitude, 4096-point frames every 10 ms). Markers: each voice
line (labelled, its span shaded), knob ratchets, chalk, dial taps, the 20:00 bar line and the coda. Bottom: short-term
loudness (3 s) against the -13 LUFS cap, and each line's margin over its bed. Needs matplotlib.
"""
import argparse
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bs1770  # noqa: E402
from wav24 import read_wav  # noqa: E402

SR = 48000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--wav', required=True)
    ap.add_argument('--json', required=True)
    ap.add_argument('--png', required=True)
    a = ap.parse_args()
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    x = read_wav(a.wav)
    rep = json.load(open(a.json))
    mono = x.mean(axis=1)
    nfft, hop = 4096, 480
    win = np.hanning(nfft)
    m = (len(mono) - nfft) // hop
    idx = np.arange(nfft)[None, :] + hop * np.arange(m)[:, None]
    S = np.empty((m, nfft // 2 + 1), dtype=np.float32)
    for k in range(0, m, 2000):
        S[k:k + 2000] = np.abs(np.fft.rfft(mono[idx[k:k + 2000]] * win, axis=1)).astype(np.float32)
    db = 20 * np.log10(S + 1e-9)
    f = np.fft.rfftfreq(nfft, 1 / SR)
    keep = f <= 8000
    t = (np.arange(m) * hop + nfft / 2) / SR
    fig, (ax, bx) = plt.subplots(2, 1, figsize=(22, 9), sharex=True, gridspec_kw={'height_ratios': [3, 1]})
    vmax = float(np.percentile(db[:, keep], 99.9))
    ax.imshow(db[:, keep].T, origin='lower', aspect='auto', extent=[t[0], t[-1], 0, 8000], cmap='magma',
              vmin=vmax - 80, vmax=vmax, interpolation='nearest')
    ax.set_ylabel('Hz')
    ax.set_title('%s  (%s)  integrated %.1f LUFS, short-term max %.1f LUFS, true peak %.1f dBTP' % (
        os.path.basename(a.wav), rep['ending'], rep['loudness']['integratedLUFS'], rep['loudness']['shortTermMaxLUFS'],
        rep['loudness']['truePeak_dBTP']))
    colours = {'ratchet': '#7fdbff', 'chalk': '#ffffff', 'tap': '#2ecc40'}
    for ev in rep['events']:
        s = ev['sample'] / SR
        if ev['layer'] == 'foley' and ev['what'] in colours:
            ax.plot([s, s], [5600, 8000], color=colours[ev['what']], lw=0.8)
    vm = {v['sample']: v for v in rep.get('voiceMargins', [])}
    for ev in rep['events']:
        if ev['layer'] != 'voice':
            continue
        s = ev['sample'] / SR
        v = vm.get(ev['sample'])
        e = s + (v['playedSamples'] / SR if v else 1)
        ax.axvspan(s, e, ymin=0, ymax=0.04, color='#ffdc00', alpha=0.9)
        ax.text(s, 7400 - 500 * (hash(ev['what']) % 3), ev['what'], color='#ffdc00', fontsize=8)
        if v:
            bx.plot([s, e], [v['marginLU'] - 30, v['marginLU'] - 30], color='#b8860b', lw=3)
    for s, lab in ((60.0, '20:00'), (90.0, 'coda (black)')):
        ax.axvline(s, color='#39cccc', lw=1, ls='--')
        ax.text(s + 0.2, 300, lab, color='#39cccc', fontsize=9)
    ax.text(0.3, 7700, 'ratchet (cyan), chalk (white), dial tap (green) above 5.6 kHz; voice lines yellow', color='w', fontsize=8)
    st = bs1770.measure(x)['shortTerm']
    bx.plot(st['endsAt_s'], st['lufs'], color='k', lw=1, label='short-term LUFS (3 s)')
    bx.axhline(-13, color='r', lw=0.8, ls='--', label='cap -13')
    bx.axhline(4 - 30, color='#b8860b', lw=0.6, ls=':', label='voice margin 4 LU (bars: margin - 30)')
    bx.set_ylim(-45, -8)
    bx.set_xlim(0, 100)
    bx.set_xlabel('seconds (frame = s x 24)')
    bx.legend(loc='lower left', fontsize=8)
    fig.tight_layout()
    fig.savefig(a.png, dpi=80)


if __name__ == '__main__':
    main()
