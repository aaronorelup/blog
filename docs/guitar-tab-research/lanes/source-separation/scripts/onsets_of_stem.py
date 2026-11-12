"""Onset times of one stem, for the handoff test "separated drums / percussive stem -> onset list -> tap times".
Usage: python -I onsets_of_stem.py <stem wav> <out txt>
librosa.onset.onset_detect on the mono average of the stem, default parameters (hop 512, units='time');
one time in seconds per line. Same call as scripts/hpss_run.py uses on the HPSS percussive part."""
import sys
import numpy as np
import soundfile as sf
import librosa

x, sr = sf.read(sys.argv[1], always_2d=True, dtype="float32")
on = librosa.onset.onset_detect(y=x.mean(axis=1), sr=sr, units="time")
np.savetxt(sys.argv[2], on, fmt="%.4f")
print(f"{sys.argv[1]}: {len(on)} onsets; first: {[round(float(t), 3) for t in on[:8]]}")
