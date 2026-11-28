"""Analyse a chainE.html capture (derived from the browser-audio-sync lane's analyze_sync.py: same lag search by FFT
cross-correlation, same click-onset rule for the scheduled clicks, the alphatab.html onset rule for alphaTab's metronome).

usage: python analyze_chainE.py <result.json from drive.mjs> <truth beats file or -> <out.json>
Capture channels: 0 = alphaTab's guitar render as it arrived in the graph, 1 = the clicks scheduled at the beat tracker's
times, 2 = alphaTab's metronome render.
Reported: where the guitar render's sample 0 sits in the capture (and against the scheduled start frame); each click's
onset minus the nearest alphaTab metronome onset ("click to tab beat"), minus its scheduled frame, and minus the
nearest truth beat placed on the same timeline (truth time - gp0); alphaTab metronome onsets minus truth beats.
"""
import json, sys
import numpy as np, soundfile as sf
from scipy.signal import fftconvolve

d = json.load(open(sys.argv[1])); res = d["result"]
sr = res["sampleRate"]; gp0 = res["gp0_s"]
cap, csr = sf.read(res["wav"], dtype="float64", always_2d=True); assert csr == sr
first = res["capture"]["firstFrame"]
ref, rsr = sf.read(res["guitar_wav"], dtype="float64", always_2d=True); assert rsr == sr
ref = ref.mean(axis=1)
x = cap[:, 0]
corr = fftconvolve(x, ref[::-1], mode="full")
lag = int(np.argmax(corr)) - (len(ref) - 1)
out = {"capture_index_of_render_sample0": lag, "context_frame_of_render_sample0": lag + first,
       "start_frame_scheduled": res["start_frame_scheduled"],
       "found_minus_scheduled_frames": lag + first - res["start_frame_scheduled"]}
seg = x[lag:lag + len(ref)]
if len(seg) == len(ref):
    out["max_abs_difference_capture_vs_render"] = float(np.max(np.abs(seg - ref)))


def onsets(y, thr, min_gap):
    on, last = [], -10 ** 9
    for i in np.flatnonzero(np.abs(y) > thr):
        if i - last > min_gap:
            on.append(int(i))
        last = i
    return np.array(on)


clicks = onsets(cap[:, 1], 0.05, int(0.1 * sr))                     # analyze_sync.py rule
m = cap[:, 2]; mpk = float(np.max(np.abs(m)))
mets = onsets(m, 0.05 * mpk, int(0.15 * sr))                          # alphatab.html rule (5 % of peak, 150 ms quiet)
met_ref, _ = sf.read(res["metronome_wav"], dtype="float64", always_2d=True)
met_ref = met_ref.mean(axis=1)
mets_render = onsets(met_ref, 0.05 * float(np.max(np.abs(met_ref))), int(0.15 * sr))
sched = np.array([s["frame"] - first for s in res["scheduled"] if "frame" in s])


def st(a):
    a = np.asarray(a, float)
    if a.size == 0:
        return {"n": 0}
    return {"n": int(a.size), "mean": round(float(a.mean()), 3), "median": round(float(np.median(a)), 3),
            "sd": round(float(a.std()), 3), "min": round(float(a.min()), 3), "max": round(float(a.max()), 3),
            "max_abs": round(float(np.abs(a).max()), 3)}


def nearest(a, b):
    """for each element of a, (b_nearest - nothing): returns a - nearest b, in ms"""
    idx = np.searchsorted(b, a)
    res_ = []
    for v, i in zip(a, idx):
        c = [b[j] for j in (i - 1, i) if 0 <= j < len(b)]
        res_.append(v - min(c, key=lambda z: abs(v - z)))
    return np.array(res_) / sr * 1000.0


out["n_clicks_scheduled"] = int(len(sched)); out["n_clicks_found"] = int(len(clicks))
out["n_alphatab_metronome_onsets_in_capture"] = int(len(mets))
out["n_alphatab_metronome_onsets_in_render_file"] = int(len(mets_render))
out["alphatab_metronome_capture_minus_render_frames"] = st((mets - lag) - mets_render) if len(mets) == len(mets_render) else "count differs"
n = min(len(clicks), len(sched))
out["click_minus_scheduled_ms"] = st((clicks[:n] - sched[:n]) / sr * 1000.0)
c2m = nearest(clicks, mets)
out["click_minus_nearest_alphatab_metronome_ms"] = st(c2m)
out["clicks_within_20ms_of_a_metronome_onset"] = int(np.sum(np.abs(c2m) <= 20))
out["clicks_within_5ms_of_a_metronome_onset"] = int(np.sum(np.abs(c2m) <= 5))
out["click_minus_nearest_alphatab_metronome_ms_first10"] = [round(v, 3) for v in c2m[:10]]
out["click_minus_nearest_alphatab_metronome_ms_last5"] = [round(v, 3) for v in c2m[-5:]]
if sys.argv[2] != "-":
    tb = np.loadtxt(sys.argv[2], usecols=0)
    tb = tb[tb - gp0 >= 0]
    tb_idx = lag + np.round((tb - gp0) * sr).astype(int)
    out["click_minus_nearest_truth_beat_ms"] = st(nearest(clicks, tb_idx))
    half = int(0.5 * np.median(np.diff(tb_idx)))
    inside = mets[(mets >= tb_idx[0] - half) & (mets <= tb_idx[-1] + half)]
    out["alphatab_metronome_onsets_within_truth_beat_span"] = int(len(inside))
    out["alphatab_metronome_minus_nearest_truth_beat_ms"] = st(nearest(inside, tb_idx))
json.dump(out, open(sys.argv[3], "w"), indent=1)
print(json.dumps(out, indent=1))
