import numpy as np, soundfile as sf
I="/home/user/gtr/lanes/browser-audio-sync/inputs/S4_10s/"
full, sr = sf.read("/home/user/gtr/inputs/S4/S4.wav", dtype="int16"); cut, _ = sf.read(I+"S4_10s.wav", dtype="int16")
print("cut equals S4[182483:623483]:", np.array_equal(full[182483:623483], cut), cut.shape)
for truth, est in [("drums","drums"),("bass","bass"),("guitar","other"),("lead","vocals")]:
    r, _ = sf.read(I+"stems/%s.wav" % truth, dtype="float64"); e, _ = sf.read("/home/user/gtr/lanes/browser-audio-sync/out/demucs/t2/S4_10s_%s.wav" % est, dtype="float64")
    r = r.mean(axis=1); e = e.mean(axis=1); n = min(len(r), len(e)); r = r[:n] - r[:n].mean(); e = e[:n] - e[:n].mean()
    tgt = (e @ r) / (r @ r) * r
    print(truth, est, "SI-SDR %.2f dB" % (10*np.log10((tgt @ tgt) / ((e - tgt) @ (e - tgt)))))
