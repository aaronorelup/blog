"""Loudness by ITU-R BS.1770-4 / EBU R128 at 48 kHz, in numpy and scipy: integrated (gated), short-term (3 s),
momentary (400 ms) and true peak (4x oversampled). The build checks its caps with this; verify_sound.py checks the
same files again with ffmpeg's ebur128 filter and pyloudnorm."""
import numpy as np
from scipy.signal import lfilter, resample_poly

# K-weighting for 48 kHz (BS.1770-4, table 1 and 2)
_B1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
_A1 = [1.0, -1.69065929318241, 0.73248077421585]
_B2 = [1.0, -2.0, 1.0]
_A2 = [1.0, -1.99004745483398, 0.99007225036621]


def kweight(x):
    """x: (n, ch) float at 48 kHz."""
    return lfilter(_B2, _A2, lfilter(_B1, _A1, x, axis=0), axis=0)


def _block_power(z, win, hop):
    """Mean square per channel summed over channels, for windows of `win` samples every `hop` samples."""
    p = (z * z).sum(axis=1)
    c = np.concatenate([[0.0], np.cumsum(p)])
    starts = np.arange(0, len(p) - win + 1, hop)
    return (c[starts + win] - c[starts]) / win, starts


def _lufs(power):
    with np.errstate(divide='ignore'):
        return -0.691 + 10 * np.log10(power)


def measure(x, sr=48000):
    assert sr == 48000
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    z = kweight(x)
    # integrated: 400 ms blocks, 75 % overlap, absolute gate -70 LUFS, relative gate -10 LU
    pw, _ = _block_power(z, int(0.4 * sr), int(0.1 * sr))
    l = _lufs(pw)
    g1 = pw[l > -70]
    integ = -np.inf
    if len(g1):
        rel = _lufs(g1.mean()) - 10
        g2 = pw[(l > -70) & (l > rel)]
        integ = float(_lufs(g2.mean()))
    st_p, st_s = _block_power(z, 3 * sr, int(0.1 * sr))
    st = _lufs(st_p)
    mo_p, mo_s = _block_power(z, int(0.4 * sr), int(0.1 * sr))
    mo = _lufs(mo_p)
    over = resample_poly(x, 4, 1, axis=0)
    tp = float(20 * np.log10(np.abs(over).max() + 1e-20))
    sp = float(20 * np.log10(np.abs(x).max() + 1e-20))
    i = int(np.argmax(st))
    return {'integratedLUFS': round(integ, 2), 'shortTermMaxLUFS': round(float(st[i]), 2),
            'shortTermMaxEndsAt_s': round((st_s[i] + 3 * sr) / sr, 2), 'momentaryMaxLUFS': round(float(mo.max()), 2),
            'truePeak_dBTP': round(tp, 2), 'samplePeak_dBFS': round(sp, 2),
            'shortTerm': {'endsAt_s': ((st_s + 3 * sr) / sr).round(2).tolist(), 'lufs': np.round(st, 2).tolist()}}
