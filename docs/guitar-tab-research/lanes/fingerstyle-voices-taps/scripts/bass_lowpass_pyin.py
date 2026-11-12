"""Bass voice from audio: low-pass filter + monophonic f0 tracker (librosa.pyin), and the f0 track turned into notes.

Usage: python bass_lowpass_pyin.py <clip id> <out dir> [cutoff_hz ...]
Input: /home/user/gtr/inputs/<id>/<id>.mono.wav (44.1 kHz).
For each cutoff: scipy.signal.butter(4, cutoff, 'low', fs=sr, output='sos') applied forward and backward
(sosfiltfilt, zero phase), then librosa.pyin(y, fmin=65.4 Hz (C2), fmax=261.6 Hz (C4), sr=sr, frame_length=4096,
hop_length=441 (10 ms)). Writes f0_<cutoff>.csv (time_s, f0_hz (empty when unvoiced), voiced_prob).
Notes from the f0 track (a plain segmentation written here, not part of pyin): voiced frames are rounded to the
nearest MIDI number; a run of consecutive voiced frames with the same MIDI number lasting at least 50 ms is one note
(onset = first frame time, offset = last frame time + 10 ms). Writes notes_<cutoff>.csv (onset,offset,pitch).
"""
import os
import sys
import time

import librosa
import numpy as np
import scipy.signal as ss

cid, out = sys.argv[1], sys.argv[2]
cutoffs = [float(c) for c in sys.argv[3:]] or [150.0, 200.0, 250.0]
os.makedirs(out, exist_ok=True)
y, sr = librosa.load(f"/home/user/gtr/inputs/{cid}/{cid}.mono.wav", sr=None, mono=True)
hop = 441
for fc in cutoffs:
    t0 = time.time()
    sos = ss.butter(4, fc, "low", fs=sr, output="sos")
    ylp = ss.sosfiltfilt(sos, y).astype(np.float32)
    f0, vflag, vprob = librosa.pyin(ylp, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C4"), sr=sr,
                                    frame_length=4096, hop_length=hop)
    t = librosa.times_like(f0, sr=sr, hop_length=hop)
    with open(os.path.join(out, f"f0_{fc:g}.csv"), "w") as f:
        f.write("time_s,f0_hz,voiced_prob\n")
        for ti, fi, vi, pi in zip(t, f0, vflag, vprob):
            f.write(f"{ti:.4f},{'' if (not vi or np.isnan(fi)) else f'{fi:.3f}'},{pi:.4f}\n")
    midi = np.where(vflag & ~np.isnan(f0), np.round(librosa.hz_to_midi(np.nan_to_num(f0, nan=1.0))), -1)
    notes = []
    i = 0
    while i < len(midi):
        if midi[i] < 0:
            i += 1
            continue
        j = i
        while j + 1 < len(midi) and midi[j + 1] == midi[i]:
            j += 1
        if (j - i + 1) * hop / sr >= 0.05:
            notes.append((t[i], t[j] + hop / sr, int(midi[i])))
        i = j + 1
    with open(os.path.join(out, f"notes_{fc:g}.csv"), "w") as f:
        f.write("onset,offset,pitch\n")
        for a, b, p in notes:
            f.write(f"{a:.4f},{b:.4f},{p}\n")
    print(f"cutoff {fc:g} Hz: {len(t)} frames, {int(np.sum(vflag))} voiced, {len(notes)} notes, {time.time() - t0:.2f} s")
