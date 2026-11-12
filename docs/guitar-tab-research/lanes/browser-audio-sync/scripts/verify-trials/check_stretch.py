import numpy as np, soundfile as sf, json
t = json.load(open("/home/user/gtr/inputs/S1/S1.truth.json")); n0 = t["notes"][0]
O = "/home/user/gtr/lanes/browser-audio-sync/out/stretch/"
files = [("/home/user/gtr/inputs/S1/S1.wav", 1.0)] + [(O + "S1_%s_%s.wav" % (m, r), {"0p5": 0.5, "0p75": 0.75}[r.split("_")[0]])
         for m, r in [("element", "0p5_pp1"), ("element", "0p75_pp1"), ("element", "0p75_pp0"), ("soundtouch", "0p5"), ("soundtouch", "0p75"),
                      ("rubberband", "0p5"), ("rubberband", "0p75"), ("signalsmith", "0p5"), ("signalsmith", "0p75")]]
ref = None
for f, rate in files:
    y, sr = sf.read(f, dtype="float64", always_2d=True); y = y.mean(axis=1)
    idx = np.flatnonzero(np.abs(y) > 10 ** (-50 / 20)); first, last = idx[0], idx[-1]
    span = (last - first) / sr
    a = first / sr; d = (n0["offset"] - n0["onset"]) / rate
    seg = y[int((a + 0.2 * d) * sr):int((a + 0.8 * d) * sr)]
    N = 1 << 20; S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), N)); fr = np.fft.rfftfreq(N, 1 / sr)
    nom = 440 * 2 ** ((n0["pitch"] - 69) / 12); band = (fr > 0.4 * nom) & (fr < 1.6 * nom)
    k = np.flatnonzero(band)[np.argmax(S[band])]; l0, l1, l2 = np.log(S[k - 1:k + 2]); fhz = (k + 0.5 * (l0 - l2) / (l0 - 2 * l1 + l2)) * sr / N
    if ref is None: ref = (span, fhz)
    print(f.split("/")[-1], "len %.3f span %.4f ratio %.5f f %.3f Hz change %.2f cents peak %.3f" % (len(y) / sr, span, span / ref[0], fhz, 1200 * np.log2(fhz / ref[1]), np.abs(sf.read(f, dtype='float64')[0]).max()))
