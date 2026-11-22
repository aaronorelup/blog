"""Choose one take of every maker's line, freeze it, and tell the engine how long each line is.

    python voice_freeze.py --voice-dir <dir with takes.json> --voice-json <.../data/voice.json>

takes.json (written when the takes were spoken) lists, for every line: id, variant, the exact subtitle text, and two
takes, each a file (mp3 or wav, decoded here with ffmpeg) and its transcript (speech-to-text, read back from the take).

The choice, per line, made by measurement because nobody listens:
  1. the transcript must say the subtitle's words (case, punctuation and "good night" / "goodnight" ignored);
  2. of the takes that pass, the one whose pace is nearest 125 words a minute.
The chosen take is trimmed (20 ms before the first sound, 150 ms after the last, with short fades), levelled so its
speech sits at SPEECH_DB (RMS of its 20 ms frames above the speech gate) and written as 48 kHz mono 24-bit WAV to
<voice-dir>/frozen/. frozen/manifest.json records each file's sha256. voice.json gets each line's text and length.
numpy and scipy only (plus ffmpeg to decode the takes once).
"""
import argparse
import hashlib
import json
import os
import re
import subprocess

import numpy as np

from voice_measure import measure
from wav24 import read_wav, write_wav24

SR = 48000
SPEECH_DB = -20.0
TARGET_WPM = 125.0


def words(s):
    s = s.lower().replace('good night', 'goodnight')
    return re.sub(r"[^a-z0-9' ]+", ' ', s).split()


def decode(path, tmp):
    if path.endswith('.wav'):
        return read_wav(path)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s24le', tmp], check=True)
    return read_wav(tmp)


def speech_level(x):
    hop = SR // 50
    m = len(x) // hop
    r = np.sqrt((x[:m * hop].reshape(m, hop) ** 2).mean(1) + 1e-20)
    db = 20 * np.log10(r)
    on = db > db.max() - 30
    return 10 * np.log10(np.mean(r[on] ** 2))


def freeze(x):
    hop = SR // 50
    m = len(x) // hop
    db = 20 * np.log10(np.sqrt((x[:m * hop].reshape(m, hop) ** 2).mean(1) + 1e-20))
    on = np.nonzero(db > max(db.max() - 40, -60))[0]
    a = max(0, on[0] * hop - SR // 50)
    b = min(len(x), (on[-1] + 1) * hop + int(0.15 * SR))
    y = x[a:b].copy()
    fi, fo = SR // 200, int(0.05 * SR)
    y[:fi] *= np.linspace(0, 1, fi)
    y[-fo:] *= np.linspace(1, 0, fo)
    y *= 10 ** ((SPEECH_DB - speech_level(y)) / 20)
    return y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice-dir', required=True)
    ap.add_argument('--voice-json', required=True)
    a = ap.parse_args()
    vd = a.voice_dir
    takes = json.load(open(os.path.join(vd, 'takes.json')))
    os.makedirs(os.path.join(vd, 'frozen'), exist_ok=True)
    tmp = os.path.join(vd, 'frozen', '_decode.wav')
    manifest, public, chars = [], [], 0
    for line in takes['lines']:
        want = words(line['text'])
        cands = []
        for t in line['takes']:
            x = decode(os.path.join(vd, t['file']), tmp)
            write_wav24(tmp, x[:, None], SR)
            m = measure(tmp, len(want))
            ok = words(t['transcript']) == want
            cands.append({'file': t['file'], 'transcript': t['transcript'], 'transcriptMatch': ok, 'wpm': m['wpm'],
                          'speech_s': m['speech_s'], 'f0_median_hz': m.get('f0_median_hz'), 'x': x})
        good = [c for c in cands if c['transcriptMatch']]
        if not good:
            raise SystemExit('no take of %s %s says its words' % (line['id'], line.get('variant')))
        best = min(good, key=lambda c: (abs(c['wpm'] - TARGET_WPM), c['file']))
        y = freeze(best['x'])
        name = line['id'] + ('-' + line['variant'] if line.get('variant') else '') + '.wav'
        path = os.path.join(vd, 'frozen', name)
        write_wav24(path, y[:, None], SR)
        sha = hashlib.sha256(open(path, 'rb').read()).hexdigest()
        secs = round(len(y) / SR, 4)
        chars += len(line.get('sentText', line['text'])) * len(line['takes'])
        manifest.append({'id': line['id'], 'variant': line.get('variant'), 'text': line['text'], 'file': name, 'sha256': sha,
                         'seconds': secs, 'chosen': best['file'],
                         'takes': [{k: v for k, v in c.items() if k != 'x'} for c in cands]})
        public.append({'id': line['id'], 'variant': line.get('variant'), 'text': line['text'], 'seconds': secs})
    os.remove(tmp)
    json.dump({'voiceId': takes['voiceId'], 'voiceName': takes['voiceName'], 'sampleRate': SR, 'speechDb': SPEECH_DB,
               'lines': manifest}, open(os.path.join(vd, 'frozen', 'manifest.json'), 'w'), indent=1)
    json.dump({'about': "The maker's lines as frozen audio: each line's exact text and its length in seconds (from the "
                        "file's first sample, which is placed on the line's start frame). Written by make/sound/voice_freeze.py.",
               'voice': takes['voiceName'], 'lines': public}, open(a.voice_json, 'w'), indent=1)
    print('froze', len(manifest), 'lines;', 'characters spoken for takes:', chars)


if __name__ == '__main__':
    main()
