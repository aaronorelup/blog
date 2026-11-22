"""The web copy of a soundtrack for the lab page: an mp3 (128 kb/s, 48 kHz stereo) and the proof that it stays in step.

    python web_copy.py --wav <dir>/soundtrack-main.wav --mp3 <dir>/fable-opus-quiet-hour-main.mp3

Encodes with ffmpeg's libmp3lame, then decodes the mp3 twice and compares it with the WAV:
  - the way players that read the mp3's gapless header decode it (ffmpeg's default; the lab page's decodeAudioData in
    Chromium was measured to do the same): this must give exactly the WAV's 4,800,000 samples with no offset, so that
    sample n of the decoded buffer is frame n / 2000 of the film;
  - with the header ignored, which shows the encoder's own delay: the samples a player would put before the film if it
    does not read the header (1,105 samples, 23 ms, for LAME at any rate).
It also measures the decoded copy's loudness and true peak, because mp3 coding moves peaks. Fails (exit 1) if the
gapless decode is not 4,800,000 samples at offset 0 or its true peak is above -1 dBTP.
numpy and scipy only (and ffmpeg).
"""
import argparse
import hashlib
import json
import subprocess
import sys

import numpy as np

import bs1770
from wav24 import read_wav

SR = 48000
N = 4800000
CAP_TP = -1.0
ENCODE = ['-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-c:a', 'libmp3lame', '-b:a', '128k',
          '-ar', str(SR), '-ac', '2', '-id3v2_version', '0', '-write_id3v1', '0', '-write_xing', '1']


def decode(path, raw=False):
    cmd = ['ffmpeg', '-v', 'error'] + (['-flags2', '+skip_manual'] if raw else []) + ['-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    b = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(b, dtype='<f4').reshape(-1, 2).astype(np.float64)


def lag_of(x, ref, start, n=1 << 20, reach=8192):
    """k such that x[i + k] is ref[i], searched over +/- reach samples, on n samples from `start` of ref."""
    a = ref[start:start + n].mean(axis=1)
    lo = max(0, start - reach)
    b = x[lo:start + n + reach].mean(axis=1)
    m = 1 << int(np.ceil(np.log2(len(a) + len(b))))
    c = np.fft.irfft(np.fft.rfft(b, m) * np.conj(np.fft.rfft(a, m)), m)
    k = int(np.argmax(c[:len(b) - len(a) + 1]))
    return k + lo - start


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--wav', required=True)
    ap.add_argument('--mp3', required=True)
    ap.add_argument('--report')
    a = ap.parse_args()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.wav] + ENCODE + [a.mp3], check=True)
    wav = read_wav(a.wav)
    data = open(a.mp3, 'rb').read()
    probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-show_entries',
                                       'stream=codec_name,sample_rate,channels,bit_rate,start_time,duration,nb_read_packets',
                                       '-of', 'json', a.mp3], check=True, capture_output=True, text=True).stdout)['streams'][0]
    g = decode(a.mp3)
    r = decode(a.mp3, raw=True)
    rep = {'mp3': a.mp3, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'probe': probe,
           'wavSamples': int(len(wav)),
           'gapless': {'samples': int(len(g)), 'offsetSamples': lag_of(g, wav, 0), 'offsetSamplesNearEnd': lag_of(g, wav, N - (1 << 20) - 8192)},
           'headerIgnored': {'samples': int(len(r)), 'offsetSamples': lag_of(r, wav, 0), 'offsetSamplesNearEnd': lag_of(r, wav, N - (1 << 20) - 8192)}}
    rep['headerIgnored']['samplesAfterTheFilm'] = rep['headerIgnored']['samples'] - rep['headerIgnored']['offsetSamples'] - N
    n = min(len(g), len(wav))
    err = g[:n] - wav[:n]
    rep['gapless']['differenceFromWav_dB'] = round(float(10 * np.log10((err ** 2).mean() / (wav[:n] ** 2).mean())), 1)
    m = bs1770.measure(g)
    rep['decodedLoudness'] = {k: v for k, v in m.items() if k != 'shortTerm'}
    bad = []
    if rep['gapless']['samples'] != N:
        bad.append('gapless decode gives %d samples, not %d' % (rep['gapless']['samples'], N))
    if rep['gapless']['offsetSamples'] != 0 or rep['gapless']['offsetSamplesNearEnd'] != 0:
        bad.append('gapless decode is offset by %d samples (%d near the end)' % (rep['gapless']['offsetSamples'], rep['gapless']['offsetSamplesNearEnd']))
    if m['truePeak_dBTP'] > CAP_TP:
        bad.append('decoded true peak %.2f dBTP > %.1f' % (m['truePeak_dBTP'], CAP_TP))
    rep['pass'] = not bad
    rep['failures'] = bad
    if a.report:
        json.dump(rep, open(a.report, 'w'), indent=1)
    print(json.dumps(rep))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
