"""Measure a slowed-down copy of S1: length of the audible part, where the notes landed, and the pitch of each note.

Usage: python analyze_stretch.py <stretched.wav> <rate> <out.json> [--ref /home/user/gtr/inputs/S1/S1.wav]

- Audible span: first and last sample whose absolute value exceeds 10^(-50/20) (-50 dBFS) on the mono mix.
- Alignment: the truth note onsets divided by <rate> are shifted so that the first truth onset sits on the first
  audible sample of the stretched file (the shift is reported).
- Pitch: librosa.pyin (fmin 60 Hz, fmax 1200 Hz, frame 2048, hop 256) on the mono mix; for every truth note the
  median f0 over the middle 60 percent of its stretched span (voiced frames only), compared with the nominal
  frequency of its MIDI pitch, 440 * 2^((p - 69)/12), in cents (pyin works on a 10-cent grid). The first note of
  S1 (F#4, MIDI 66) is reported on its own as "the known note", also measured with a zero-padded FFT peak.
"""
import json, sys
import numpy as np, soundfile as sf, librosa

path, rate, outp = sys.argv[1], float(sys.argv[2]), sys.argv[3]
truth = json.load(open('/home/user/gtr/inputs/S1/S1.truth.json'))
y, sr = sf.read(path, dtype='float64', always_2d=True)
y = y.mean(axis=1)
thr = 10 ** (-50 / 20)
idx = np.flatnonzero(np.abs(y) > thr)
first, last = int(idx[0]), int(idx[-1])
notes = truth['notes']
shift = first / sr - notes[0]['onset'] / rate
f0, vflag, vprob = librosa.pyin(y.astype(np.float32), fmin=60, fmax=1200, sr=sr, frame_length=2048, hop_length=256)
times = librosa.times_like(f0, sr=sr, hop_length=256)
rows = []
for n in notes:
    a = n['onset'] / rate + shift
    b = n['offset'] / rate + shift
    d = b - a
    m = (times >= a + 0.2 * d) & (times <= b - 0.2 * d) & np.isfinite(f0)
    if m.sum() < 2:
        rows.append({'onset_s': a, 'pitch': n['pitch'], 'median_f0_hz': None, 'cents': None, 'frames': int(m.sum())})
        continue
    med = float(np.median(f0[m]))
    nom = 440 * 2 ** ((n['pitch'] - 69) / 12)
    rows.append({'onset_s': round(a, 4), 'pitch': n['pitch'], 'median_f0_hz': round(med, 3), 'cents': round(1200 * np.log2(med / nom), 2), 'frames': int(m.sum())})
cents = np.array([r['cents'] for r in rows if r['cents'] is not None])
# finer measurement of the known note (pyin's default grid is 0.1 semitone = 10 cents): Hann-windowed FFT of the
# middle 60 percent of the first note, zero-padded to 2^20 points, strongest peak between 0.4 and 1.6 times the
# nominal frequency, refined by parabolic interpolation on the log magnitude
n0 = notes[0]; a = n0['onset'] / rate + shift; b = n0['offset'] / rate + shift; d = b - a
seg = y[int((a + 0.2 * d) * sr):int((b - 0.2 * d) * sr)]
nom0 = 440 * 2 ** ((n0['pitch'] - 69) / 12)
N = 1 << 20
spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), N))
fr = np.fft.rfftfreq(N, 1 / sr)
band = (fr > 0.4 * nom0) & (fr < 1.6 * nom0)
k = np.flatnonzero(band)[np.argmax(spec[band])]
l0, l1, l2 = np.log(spec[k - 1:k + 2] + 1e-20)
delta = 0.5 * (l0 - l2) / (l0 - 2 * l1 + l2)
f_fft = (k + delta) * sr / N
known_fft = {'hz': round(float(f_fft), 3), 'cents_vs_nominal': round(float(1200 * np.log2(f_fft / nom0)), 2), 'segment_s': round(len(seg) / sr, 3)}
out = {'file': path, 'sample_rate': sr, 'rate': rate, 'samples': len(y), 'seconds': len(y) / sr,
       'audible_first_s': first / sr, 'audible_last_s': last / sr, 'audible_span_s': (last - first) / sr,
       'alignment_shift_s': shift,
       'known_note': rows[0], 'known_note_fft': known_fft,
       'notes_with_pitch': int(len(cents)), 'notes_total': len(rows),
       'cents_median': float(np.median(cents)) if len(cents) else None,
       'cents_mean_abs': float(np.mean(np.abs(cents))) if len(cents) else None,
       'cents_max_abs': float(np.max(np.abs(cents))) if len(cents) else None,
       'notes_within_50_cents': int(np.sum(np.abs(cents) <= 50)) if len(cents) else 0,
       'first5': rows[:5]}
json.dump(out, open(outp, 'w'), indent=1)
print(json.dumps({k: v for k, v in out.items() if k != 'first5'}))
