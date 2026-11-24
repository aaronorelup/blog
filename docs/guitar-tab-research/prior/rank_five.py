#!/usr/bin/env python3
"""Where each playback's own recording ranks, for the five videos in AO-078.

The post's check: measure how much of each of the 12 notes is in a playback, and compare that mix with
every real recording. A playback's rank is where its own recording falls when the recordings are sorted
by closeness, highest first. Written on 2026-11-24.

    python3 rank_five.py <folder with song-NNN.mp4> <folder with the playback MP3s> > rank_five.json

Each file is loaded with librosa (22050 Hz, mono). Its profile is the chroma (librosa.feature.chroma_cqt,
defaults) averaged over time with each frame weighted by its loudness (librosa.feature.rms). Closeness is
the cosine similarity of two profiles. Video 001 is not ranked: its recording is muted or nearly silent.
Made with librosa 0.11.0, numpy 2.4.6 and Python 3.11.
"""
import json, sys
import librosa, numpy as np

VIDEOS = ['001', '002', '003', '004', '009']
PASSES = {'grokbot': 'Grok Bot', 'opus-blind': 'Opus 5.5, blind', 'opus-tabber': 'Opus 5.5 with Tabber'}
NO_TAB = {('grokbot', '001'), ('grokbot', '002')}      # Grok Bot wrote only a header for these: nothing to play
SKIPPED = {'001'}


def profile(path):
    y, sr = librosa.load(path)
    c = librosa.feature.chroma_cqt(y=y, sr=sr)
    w = librosa.feature.rms(y=y)[0]
    n = min(c.shape[1], w.shape[0])
    return (c[:, :n] * w[:n]).sum(axis=1) / w[:n].sum()


def cosine(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def main(videos, playbacks):
    rec = {v: profile(f'{videos}/song-{v}.mp4') for v in VIDEOS}
    out = {'pool': VIDEOS, 'method': 'chroma_cqt, loudness-weighted mean, cosine similarity, 22050 Hz', 'rows': {}}
    for v in VIDEOS:
        row = {}
        for key, name in PASSES.items():
            if (key, v) in NO_TAB:
                row[name] = 'no tab'
            elif v in SKIPPED:
                row[name] = 'skipped'
            else:
                p = profile(f'{playbacks}/{key}-{v}.mp3')
                sims = {u: round(cosine(p, rec[u]), 4) for u in VIDEOS}
                order = sorted(VIDEOS, key=lambda u: -sims[u])
                row[name] = {'rank': order.index(v) + 1, 'closeness': {u: sims[u] for u in order}}
        out['rows'][v] = row
    json.dump(out, sys.stdout, indent=1)
    print()


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
