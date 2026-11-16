# Verifier: recompute onsets from the smplr / soundfont-player / spessa captures and score them with mir_eval directly.
import json, numpy as np, soundfile as sf, librosa, mir_eval
truth = json.load(open("/home/user/gtr/inputs/S2n/S2n.truth.json"))
on = sorted(set(round(n["onset"], 3) for n in truth["notes"]))
ref = np.array(on)
D = "/home/user/gtr/lanes/browser-audio-sync/out/synths/"
for p in ["smplr", "sfplayer", "spessa"]:
    r = json.load(open(D + "synth_%s_S2n.json" % p))["result"]
    x, sr = sf.read(D + "S2n_%s.wav" % p, dtype="float32")
    y = x.mean(axis=1)
    t = librosa.onset.onset_detect(y=y, sr=sr, hop_length=128, units="time")
    shift = (r["t0_frame"] - r["capture"]["firstFrame"]) / sr
    if p == "spessa":
        shift += 128 / sr   # first recorder version: samples after the repeat sit 128 frames late in the WAV
    est = t - shift
    est = est[est > -1]
    stored = np.loadtxt(D + "S2n_%s.onsets.txt" % p)
    F, P, R = mir_eval.onset.f_measure(ref, est[est >= 0], window=0.05)
    m = mir_eval.util.match_events(ref, est[est >= 0], 0.05)
    d = np.array([est[est >= 0][j] - ref[i] for i, j in m]) * 1000
    print(p, "n_ref", len(ref), "n_est", len(est), "stored n", len(stored), "max |mine-stored| ms",
          round(float(np.max(np.abs(np.sort(est)[:len(stored)] - np.sort(stored)))) * 1000, 3) if len(est) == len(stored) else "len differs",
          "F %.3f P %.3f R %.3f" % (F, P, R), "median %.2f mean %.2f max %.2f" % (np.median(d), d.mean(), np.abs(d).max()))
