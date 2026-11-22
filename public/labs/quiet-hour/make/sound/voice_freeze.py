"""Choose one take of every maker's line, freeze it, and tell the engine how long each line is.

    python voice_freeze.py --voice-dir <dir with takes.json> --voice-json <.../data/voice.json>

takes.json (written when the takes were spoken) lists, for every line: id, variant, the exact subtitle text, and two
takes, each a file (mp3 or wav, decoded here with ffmpeg) and its transcript (speech-to-text, read back from the take).

The choice, per line, made by measurement because nobody listens:
  1. the transcript must say the subtitle's words (case, punctuation and "good night" / "goodnight" ignored; numbers
     written as digits by the transcriber count, but a take whose transcript spells the words is preferred);
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


UNITS = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen ' \
        'seventeen eighteen nineteen'.split()
TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split()


def words(s):
    s = s.lower().replace('good night', 'goodnight')
    return re.sub(r"[^a-z0-9' ]+", ' ', s.replace('-', ' ')).split()


def as_numbers(ws):
    """Speech-to-text writes some numbers as digits ("27 in 100"). Turn number words into digits so the two forms
    compare; "a hundred" and "one hundred" both become 100 (the transcript cannot tell them apart)."""
    out, i = [], 0
    while i < len(ws):
        w = ws[i]
        if w in ('a', 'one') and i + 1 < len(ws) and ws[i + 1] == 'hundred':
            out.append('100'); i += 2; continue
        if w in TENS:
            v = 20 + 10 * TENS.index(w)
            if i + 1 < len(ws) and ws[i + 1] in UNITS[1:10]:
                v += UNITS.index(ws[i + 1]); i += 1
            out.append(str(v)); i += 1; continue
        if w in UNITS:
            out.append(str(UNITS.index(w))); i += 1; continue
        out.append(w); i += 1
    return out


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
            tw = words(t['transcript'])
            ok = as_numbers(tw) == as_numbers(want)
            exact = tw == want
            cands.append({'file': t['file'], 'transcript': t['transcript'], 'transcriptMatch': ok, 'spelledMatch': exact, 'wpm': m['wpm'],
                          'speech_s': m['speech_s'], 'f0_median_hz': m.get('f0_median_hz'), 'x': x})
        good = [c for c in cands if c['transcriptMatch']]
        if not good:
            raise SystemExit('no take of %s %s says its words' % (line['id'], line.get('variant')))
        best = min(good, key=lambda c: (not c['spelledMatch'], abs(c['wpm'] - TARGET_WPM), c['file']))
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
    # The engine (make/cues.mjs --durations) looks a line's length up by its exact text, so every text is also a key.
    doc = {'about': "The maker's lines as frozen audio: each line's exact text and its length in seconds, from the "
                    "file's first sample, which is placed on the line's start frame. The texts are also keys, for "
                    "make/cues.mjs --durations. Written by make/sound/voice_freeze.py.",
           'voice': takes['voiceName'], 'lines': public}
    for ln in public:
        doc[ln['text']] = ln['seconds']
    json.dump(doc, open(a.voice_json, 'w'), indent=1)
    print('froze', len(manifest), 'lines;', 'characters spoken for takes:', chars)


if __name__ == '__main__':
    main()
