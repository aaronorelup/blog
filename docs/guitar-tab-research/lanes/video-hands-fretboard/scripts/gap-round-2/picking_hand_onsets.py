"""Gap round 2, gap V5: picking-hand fingertip motion around note onsets on R3c. Descriptive only (R3c has no
ground truth): nothing here says which fingertip played which note.

Inputs
  --landmarks  MediaPipe Hand Landmarker 1.2.2 output for R3c (group job r0408, step C1/mediapipe-hands_R3c_full):
               one JSON record per frame, hands with "label" and "lm_px_full" (21 x [x, y] in 1920x1080 pixels).
               On R3c the hand labelled "Right" is the picking hand (trials.md, MediaPipe section).
  --bp-notes   Basic Pitch 0.4.0 notes for R3c.wav (audio-to-notes lane, run r0264): CSV start_time_s,end_time_s,
               pitch_midi,velocity,pitch_bend...
  --wav        R3c.mono.wav (for librosa 0.11.0 onset_detect with default settings, a second onset list)
  --mp4        R3c.mp4 (its AAC track is decoded with ffmpeg and cross-correlated with --wav to measure any offset
               between the video timeline and the WAV)
  --out        output folder

Definitions (all stated in the summary JSON as well)
  frame time      t_n = n / 25 s (R3c is 25 fps, video stream start_time 0)
  speed sample    v_n = |p_n - p_(n-1)| in pixels per frame (1920x1080 frame), n = 1..449, placed at the midpoint
                  time (n - 0.5) / 25 s. "abs" = image coordinates; "rel" = fingertip minus wrist (landmark 0), so
                  whole-hand movement is removed.
  onset merge     Basic Pitch note starts are sorted; a start within MERGE_S of the previous kept onset is merged
                  into it (chords and bass-plus-melody pairs give near-equal starts).
  near sample     a speed sample whose midpoint is within NEAR_S of an onset; "rest" = all other samples.
  peak            a local maximum of the speed series (scipy.signal.find_peaks, plateaus count once) whose value is
                  above the series' 75th percentile.
  onset hit       an onset with at least one peak midpoint within NEAR_S of it.
  timeline share  the share of the 0-18 s timeline within NEAR_S of at least one peak (what a uniformly random time
                  would hit), for comparison with the hit rate.
"""
import argparse
import csv
import json
import os
import subprocess
import sys

import numpy as np
from scipy.signal import find_peaks

FPS = 25.0
MERGE_S = 0.030
NEAR_S = 0.040
TIPS = {"wrist_0": 0, "thumb_4": 4, "index_8": 8, "middle_12": 12, "ring_16": 16, "pinky_20": 20}

ap = argparse.ArgumentParser()
ap.add_argument("--landmarks", required=True)
ap.add_argument("--bp-notes", required=True)
ap.add_argument("--wav", required=True)
ap.add_argument("--mp4", required=True)
ap.add_argument("--out", required=True)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)

# ---- landmarks --------------------------------------------------------------------------------------------
recs = [json.loads(line) for line in open(a.landmarks)]
n_frames = len(recs)
right_counts = [sum(1 for h in r["hands"] if h["label"] == "Right") for r in recs]
assert all(r["n"] == i for i, r in enumerate(recs))
t_check = max(abs(r["t_s"] - i / FPS) for i, r in enumerate(recs))
P = np.full((n_frames, 21, 2), np.nan)
scores = []
for i, r in enumerate(recs):
    rh = [h for h in r["hands"] if h["label"] == "Right"]
    if len(rh) == 1:
        P[i] = np.array(rh[0]["lm_px_full"], dtype=float)
        scores.append(rh[0]["score"])
wrist = P[:, 0, :]
wrist_jump = np.linalg.norm(np.diff(wrist, axis=0), axis=1)

t_mid = (np.arange(1, n_frames) - 0.5) / FPS
speeds = {}
for name, k in TIPS.items():
    absd = np.linalg.norm(np.diff(P[:, k, :], axis=0), axis=1)
    reld = np.linalg.norm(np.diff(P[:, k, :] - P[:, 0, :], axis=0), axis=1)
    speeds[(name, "abs")] = absd
    if k != 0:
        speeds[(name, "rel")] = reld

# ---- onsets -------------------------------------------------------------------------------------------------
starts = []
with open(a.bp_notes) as fh:
    rd = csv.reader(fh)
    head = next(rd)
    for row in rd:
        starts.append((float(row[0]), float(row[1]), int(row[2]), int(row[3])))
starts.sort()
bp_on = []
for s, _, _, _ in starts:
    if not bp_on or s - bp_on[-1] > MERGE_S:
        bp_on.append(s)
bp_on = np.array(bp_on)
gaps = np.diff(sorted(s for s, *_ in starts))

import librosa  # noqa: E402

y, sr = librosa.load(a.wav, sr=None, mono=True)
lr_on = librosa.onset.onset_detect(y=y, sr=sr, units="time")

# ---- A/V offset: decode the mp4's AAC track and cross-correlate with the WAV ------------------------------
tmp = os.path.join(a.out, "R3c_mp4_audio_44k1_mono.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.mp4, "-vn", "-ac", "1", "-ar", str(sr), "-c:a", "pcm_f32le", tmp],
               check=True)
y2, _ = librosa.load(tmp, sr=None, mono=True)
os.remove(tmp)
L = min(len(y), len(y2))
seg = int(sr * 2.0)  # correlate 2 s windows at 3 places, lags up to +-0.2 s
lags = []
for start in (int(sr * 2), int(sr * 8), int(sr * 14)):
    a1 = y[start:start + seg]
    best = None
    for lag in range(-int(sr * 0.2), int(sr * 0.2) + 1, 1):
        s2 = start + lag
        if s2 < 0 or s2 + seg > L:
            continue
        b1 = y2[s2:s2 + seg]
        c = float(np.dot(a1, b1) / (np.linalg.norm(a1) * np.linalg.norm(b1) + 1e-12))
        if best is None or c > best[1]:
            best = (lag, c)
    lags.append({"window_start_s": start / sr, "lag_samples": best[0], "lag_ms": round(1000 * best[0] / sr, 3),
                 "corr": round(best[1], 4)})


# ---- measures -------------------------------------------------------------------------------------------------
def near_mask(onsets):
    m = np.zeros_like(t_mid, dtype=bool)
    for o in onsets:
        m |= np.abs(t_mid - o) <= NEAR_S + 1e-9
    return m


def peaks_of(v):
    thr = float(np.nanpercentile(v, 75))
    idx, _ = find_peaks(np.nan_to_num(v, nan=-1.0))
    idx = idx[v[idx] > thr]
    return idx, thr


def share_near_peaks(pk_t):
    grid = np.arange(0.0, n_frames / FPS, 0.001)
    m = np.zeros_like(grid, dtype=bool)
    for p in pk_t:
        m |= np.abs(grid - p) <= NEAR_S + 1e-9
    return float(m.mean())


def onset_locked(v, onsets, lags=range(-5, 6)):
    """mean speed of the speed sample whose midpoint is nearest to onset + lag * 40 ms."""
    out = {}
    for lg in lags:
        vals = []
        for o in onsets:
            j = int(np.argmin(np.abs(t_mid - (o + lg / FPS))))
            if abs(t_mid[j] - (o + lg / FPS)) <= 0.5 / FPS + 1e-9 and not np.isnan(v[j]):
                vals.append(v[j])
        out[str(lg)] = round(float(np.mean(vals)), 3) if vals else None
    return out


results = {}
per_onset_rows = []
for src_name, onsets in (("basic_pitch_r0264_merged", bp_on), ("librosa_onset_detect", lr_on)):
    nm = near_mask(onsets)
    src = {"n_onsets": int(len(onsets)), "near_samples": int(nm.sum()), "rest_samples": int((~nm).sum()),
           "per_point": {}}
    for (name, frame), v in speeds.items():
        pk, thr = peaks_of(v)
        pk_t = t_mid[pk]
        hits = 0
        dists = []
        for o in onsets:
            d = float(np.min(np.abs(pk_t - o))) if len(pk_t) else float("inf")
            dists.append(d)
            if d <= NEAR_S + 1e-9:
                hits += 1
        src["per_point"][f"{name}/{frame}"] = {
            "speed_px_per_frame_near_median": round(float(np.nanmedian(v[nm])), 3),
            "speed_px_per_frame_rest_median": round(float(np.nanmedian(v[~nm])), 3),
            "speed_px_per_frame_near_mean": round(float(np.nanmean(v[nm])), 3),
            "speed_px_per_frame_rest_mean": round(float(np.nanmean(v[~nm])), 3),
            "peak_threshold_p75": round(thr, 3),
            "n_peaks": int(len(pk)),
            "onsets_with_peak_within_40ms": hits,
            "onset_hit_share": round(hits / len(onsets), 4),
            "timeline_share_within_40ms_of_a_peak": round(share_near_peaks(pk_t), 4),
            "median_onset_to_nearest_peak_ms": round(1000 * float(np.median(dists)), 1),
            "onset_locked_mean_speed_by_lag_frames": onset_locked(v, onsets),
        }
    results[src_name] = src

for o in bp_on:
    row = {"onset_s": round(float(o), 4)}
    j = int(np.argmin(np.abs(t_mid - o)))
    row["nearest_speed_sample_mid_s"] = round(float(t_mid[j]), 3)
    for name in ("thumb_4", "index_8", "middle_12", "ring_16"):
        v = speeds[(name, "rel")]
        nm = np.abs(t_mid - o) <= NEAR_S + 1e-9
        row[f"{name}_rel_max_px_near"] = round(float(np.nanmax(v[nm])), 2) if nm.any() else None
    per_onset_rows.append(row)

summary = {
    "clip": "R3c (18.000 s, 1920x1080, 25 fps, 450 frames)",
    "definitions": {"fps": FPS, "merge_s": MERGE_S, "near_s": NEAR_S,
                    "speed": "pixels per frame between consecutive frames, sample at the midpoint time",
                    "rel": "fingertip minus wrist (landmark 0)",
                    "peak": "local maximum above the series' 75th percentile",
                    "timeline_share": "share of 0-18 s within near_s of a peak"},
    "landmarks": {"frames": n_frames, "frames_with_exactly_one_Right": int(sum(c == 1 for c in right_counts)),
                  "max_abs_t_s_minus_n_over_25": t_check,
                  "Right_score_mean_min": [round(float(np.mean(scores)), 4), round(float(np.min(scores)), 4)],
                  "Right_wrist_mean_px": [round(float(np.nanmean(wrist[:, 0])), 1), round(float(np.nanmean(wrist[:, 1])), 1)],
                  "Right_wrist_x_min_max": [round(float(np.nanmin(wrist[:, 0])), 1), round(float(np.nanmax(wrist[:, 0])), 1)],
                  "wrist_jump_px_per_frame_median_p95_max": [round(float(np.nanmedian(wrist_jump)), 2),
                                                             round(float(np.nanpercentile(wrist_jump, 95)), 2),
                                                             round(float(np.nanmax(wrist_jump)), 2)]},
    "onsets": {"basic_pitch_notes": len(starts),
               "basic_pitch_onsets_after_merge": int(len(bp_on)),
               "basic_pitch_start_gaps_le_30ms": int((gaps <= MERGE_S).sum()),
               "basic_pitch_first_last_s": [round(float(bp_on[0]), 3), round(float(bp_on[-1]), 3)],
               "librosa_onsets": int(len(lr_on)),
               "librosa_first_last_s": [round(float(lr_on[0]), 3), round(float(lr_on[-1]), 3)],
               "librosa_sr": int(sr),
               "basic_pitch_onsets_with_librosa_onset_within_40ms": int(sum(np.min(np.abs(lr_on - o)) <= NEAR_S for o in bp_on))},
    "av_offset_mp4_audio_vs_wav": lags,
    "results": results,
    "versions": {"python": sys.version.split()[0], "numpy": np.__version__, "librosa": librosa.__version__,
                 "scipy": __import__("scipy").__version__},
}
json.dump(summary, open(os.path.join(a.out, "picking_hand_onsets_R3c.json"), "w"), indent=1)
with open(os.path.join(a.out, "per_onset_R3c.csv"), "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(per_onset_rows[0].keys()))
    w.writeheader()
    w.writerows(per_onset_rows)
np.savez_compressed(os.path.join(a.out, "speeds_R3c.npz"), t_mid=t_mid, bp_onsets=bp_on, librosa_onsets=lr_on,
                    **{f"{n}__{f}": v for (n, f), v in speeds.items()})

# ---- picture --------------------------------------------------------------------------------------------------
import matplotlib  # noqa: E402

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

fig, axes = plt.subplots(5, 1, figsize=(12, 9), sharex=True)
for ax, name in zip(axes, ("wrist_0", "thumb_4", "index_8", "middle_12", "ring_16")):
    frame = "abs" if name == "wrist_0" else "rel"
    v = speeds[(name, frame)]
    ax.plot(t_mid, v, lw=0.8, color="black")
    pk, thr = peaks_of(v)
    ax.plot(t_mid[pk], v[pk], "o", ms=2.5, color="tab:orange")
    for o in bp_on:
        ax.axvline(o, color="tab:blue", lw=0.5, alpha=0.6)
    ax.set_ylabel(f"{name}\n{frame} px/frame", fontsize=8)
axes[-1].set_xlabel("time in R3c (s); blue lines = Basic Pitch onsets (r0264, merged); orange = speed peaks above p75")
fig.suptitle("R3c picking hand (MediaPipe 'Right'), per-frame speed; descriptive, no ground truth", fontsize=10)
fig.tight_layout()
fig.savefig(os.path.join(a.out, "picking_hand_speed_R3c.png"), dpi=80)
print(json.dumps({k: summary[k] for k in ("landmarks", "onsets", "av_offset_mp4_audio_vs_wav")}, indent=1))
