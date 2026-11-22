"""Check the four soundtracks again, with tools that are not the build's own: ffmpeg's ebur128 filter and pyloudnorm.

    python verify_sound.py --dir <dir with soundtrack-<ending>.wav> [--again <dir of a second build>] [--mp3]

1. Loudness of every ending by ffmpeg ebur128 (integrated, short-term maximum, true peak) and by pyloudnorm
   (integrated), against the caps of the film bible section 5: true peak <= -1 dBTP, short-term never above
   -13 LUFS, integrated about -16 (accepted -18 to -15).
2. Length: exactly 4,800,000 samples, 48 kHz, stereo.
3. The first 60 s (samples 0 to 2,879,999) are the same bytes in all four endings.
4. With --again: every WAV is byte-identical to the second build's.
5. With --mp3: each fable-opus-quiet-hour-<ending>.mp3 decodes (ffmpeg) to how many samples, from which start time,
   and at what offset against the WAV (cross-correlation of the first 10 s).
Prints JSON; exits non-zero if any check fails.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from wav24 import read_wav  # noqa: E402

ENDINGS = ['main', 'alone', 'x3', 'x10']
N = 4_800_000
HEAD60 = 2_880_000
CAP_TP, CAP_ST, INTEGRATED = -1.0, -13.0, (-18.0, -15.0)


def ebur128(path):
    r = subprocess.run(['ffmpeg', '-nostats', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true:framelog=verbose',
                        '-f', 'null', '-'], capture_output=True, text=True)
    log = r.stderr
    st = [float(v) for v in re.findall(r'S:\s*(-?[\d.]+|-inf)', log) if v != '-inf']
    summ = log[log.rfind('Summary:'):]
    i = float(re.search(r'I:\s*(-?[\d.]+) LUFS', summ).group(1))
    lra = float(re.search(r'LRA:\s*(-?[\d.]+) LU', summ).group(1))
    tp = float(re.search(r'Peak:\s*(-?[\d.]+|-inf) dBFS', summ[summ.find('True peak'):]).group(1))
    return {'integratedLUFS': i, 'LRA': lra, 'shortTermMaxLUFS': max(st), 'truePeak_dBTP': tp}


def pyln(x):
    import pyloudnorm
    return round(float(pyloudnorm.Meter(48000).integrated_loudness(x)), 2)


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def data_bytes(path):
    b = open(path, 'rb').read()
    i = b.find(b'data')
    return b[i + 8:]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dir', required=True)
    ap.add_argument('--again')
    ap.add_argument('--mp3', action='store_true')
    a = ap.parse_args()
    rep, bad = {'endings': {}}, []
    heads = {}
    for e in ENDINGS:
        p = os.path.join(a.dir, 'soundtrack-%s.wav' % e)
        x = read_wav(p)
        r = {'sha256': sha(p), 'samples': int(x.shape[0]), 'channels': int(x.shape[1]), 'ffmpeg': ebur128(p),
             'pyloudnormIntegratedLUFS': pyln(x)}
        f = r['ffmpeg']
        if r['samples'] != N or r['channels'] != 2:
            bad.append('%s: %d x %d samples' % (e, r['samples'], r['channels']))
        if f['truePeak_dBTP'] > CAP_TP:
            bad.append('%s: true peak %.1f dBTP' % (e, f['truePeak_dBTP']))
        if f['shortTermMaxLUFS'] > CAP_ST:
            bad.append('%s: short-term %.1f LUFS' % (e, f['shortTermMaxLUFS']))
        for v in (f['integratedLUFS'], r['pyloudnormIntegratedLUFS']):
            if not INTEGRATED[0] <= v <= INTEGRATED[1]:
                bad.append('%s: integrated %.2f LUFS' % (e, v))
        d = data_bytes(p)
        heads[e] = d[:HEAD60 * 6]
        if a.again:
            q = os.path.join(a.again, 'soundtrack-%s.wav' % e)
            r['secondBuildIdentical'] = sha(q) == r['sha256']
            if not r['secondBuildIdentical']:
                bad.append('%s: second build differs' % e)
        if a.mp3:
            m = os.path.join(a.dir, 'fable-opus-quiet-hour-%s.mp3' % e)
            probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                                               'stream=sample_rate,channels,bit_rate,start_time,duration', '-of', 'json', m],
                                              capture_output=True, text=True).stdout)['streams'][0]
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', m, '-f', 'f32le', '-ac', '2', '-'], capture_output=True).stdout
            y = np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)
            # offset: cross-correlate the first 10 s (mono) over +/- 3,000 samples
            u, v = x[:480000].mean(1), y[:480000 + 6000].mean(1)
            lags = range(-3000, 3001)
            best = max(lags, key=lambda L: float(np.dot(u[3000:-3000], v[3000 + L:3000 + L + len(u) - 6000])))
            r['mp3'] = {'file': m, 'bytes': os.path.getsize(m), 'ffprobe': probe, 'ffmpegDecodedSamples': int(y.shape[0]),
                        'offsetVsWavSamples': int(best)}
            if y.shape[0] != N or best != 0:
                bad.append('%s: mp3 decodes to %d samples at offset %d' % (e, y.shape[0], best))
        rep['endings'][e] = r
    ref = heads['main']
    rep['first60sIdentical'] = {e: heads[e] == ref for e in ENDINGS}
    for e in ENDINGS:
        if heads[e] != ref:
            diff = np.nonzero(np.frombuffer(heads[e], np.uint8) != np.frombuffer(ref, np.uint8))[0]
            bad.append('%s: first 60 s differ from main from sample %d' % (e, int(diff[0]) // 6))
    rep['caps'] = {'truePeak_dBTP': CAP_TP, 'shortTermMax_LUFS': CAP_ST, 'integrated_LUFS': INTEGRATED}
    rep['failures'] = bad
    rep['pass'] = not bad
    print(json.dumps(rep, indent=1))
    sys.exit(0 if not bad else 1)


if __name__ == '__main__':
    main()
