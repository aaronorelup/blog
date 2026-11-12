# Verifier: energy of each stem relative to the mix (sum of squares over both channels).
import sys, os, glob, numpy as np, soundfile as sf
mix_path = sys.argv[1]
mix, sr = sf.read(mix_path, always_2d=True)
em = np.sum(mix.astype(np.float64) ** 2)
for d in sys.argv[2:]:
    out = []
    for p in sorted(glob.glob(d + '/*.wav')):
        y, s2 = sf.read(p, always_2d=True); info = sf.info(p)
        e = np.sum(y.astype(np.float64) ** 2) / em
        pk = 20*np.log10(np.max(np.abs(y))+1e-12)
        out.append(f"{os.path.basename(p)[:-4]} {e:.4f} ({10*np.log10(e+1e-30):.1f} dB, pk {pk:.1f} dBFS, {info.samplerate} Hz {info.channels}ch {info.frames/info.samplerate:.3f}s {info.subtype})")
    print(d.replace('/home/user/gtr/lanes/', ''), '|', '; '.join(out))
