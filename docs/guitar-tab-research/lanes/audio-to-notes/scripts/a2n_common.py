"""Shared helpers for the audio-to-notes lane trials (written for this lane, not part of any tool).

- clip paths and truth loading
- writing note lists and f0 tracks in one CSV layout that gtr-eval reads
- a piano-roll picture (estimate drawn over truth)
- frames_to_notes(): the simple frame-to-note step this lane applies to monophonic f0 trackers that have no
  note segmenter of their own. It is lane code, not the tool's: round each voiced frame to the nearest MIDI
  note, join runs of consecutive frames with the same rounded note, drop runs shorter than min_dur seconds.
"""
import csv
import json
import os

INPUTS = "/home/user/gtr/inputs"
LANE = "/home/user/gtr/lanes/audio-to-notes"

# clip id -> audio file used as the tool input (the stereo or mono file a user would upload)
CLIPS = {
    "S1": f"{INPUTS}/S1/S1.wav",
    "S2n": f"{INPUTS}/S2n/S2n.wav",
    "S2s": f"{INPUTS}/S2s/S2s.wav",
    "S3": f"{INPUTS}/S3/S3.wav",
    "S4": f"{INPUTS}/S4/S4.wav",
    "S4guitar": f"{INPUTS}/S4/stems/guitar.wav",
    "S4lead": f"{INPUTS}/S4/stems/lead.wav",
    "S5capo2": f"{INPUTS}/S5capo2/S5capo2.wav",
    "S5dropd": f"{INPUTS}/S5dropd/S5dropd.wav",
    "S6taps": f"{INPUTS}/S6taps/S6taps.wav",
    "S7flat30": f"{INPUTS}/S7flat30/S7flat30.wav",
    "R1a": f"{INPUTS}/R1a/R1a.wav",
    "R1b": f"{INPUTS}/R1b/R1b.wav",
    "R1c": f"{INPUTS}/R1c/R1c.wav",
    "R2": f"{INPUTS}/R2/R2.wav",
    "R3a": f"{INPUTS}/R3a/R3a.wav",
}

# which truth file a clip is scored against (stems are scored against the S4 truth with --voice)
TRUTH = {k: k for k in CLIPS}
TRUTH.update({"S4guitar": "S4", "S4lead": "S4"})
NO_TRUTH = {"R2", "R3a"}


def mono_path(clip):
    """the (L+R)/2 mono file the inputs builder made next to each clip (stems have none)."""
    p = CLIPS[clip]
    m = p[:-4] + ".mono.wav"
    return m if os.path.exists(m) else p


def load_truth(clip):
    tid = TRUTH[clip]
    with open(f"{INPUTS}/{tid}/{tid}.truth.json") as f:
        return json.load(f)


def truth_notes(clip, voice=None):
    t = load_truth(clip)
    out = []
    for n in t["notes"]:
        if n["voice"] == "drums":
            continue
        if voice and n["voice"] != voice:
            continue
        out.append((n["onset"], n["offset"], n["pitch"]))
    return out


def write_notes_csv(path, notes, extra_cols=None):
    """notes: list of (onset_s, offset_s, pitch_midi[, velocity_or_amplitude])"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        hdr = ["onset_s", "offset_s", "pitch_midi"]
        if notes and len(notes[0]) > 3:
            hdr.append(extra_cols or "velocity")
        w.writerow(hdr)
        for n in notes:
            w.writerow([f"{n[0]:.4f}", f"{n[1]:.4f}", f"{n[2]:.3f}" if isinstance(n[2], float) and n[2] != int(n[2]) else int(round(n[2]))] + ([f"{n[3]:.4f}" if isinstance(n[3], float) else n[3]] if len(n) > 3 else []))


def write_f0_csv(path, times, freqs, confs=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["time_s", "frequency_hz", "confidence"] if confs is not None else ["time_s", "frequency_hz"])
        for i, t in enumerate(times):
            fr = float(freqs[i])
            if fr != fr:  # NaN -> 0 (unvoiced)
                fr = 0.0
            row = [f"{float(t):.4f}", f"{fr:.3f}"]
            if confs is not None:
                c = float(confs[i])
                row.append(f"{(0.0 if c != c else c):.4f}")
            w.writerow(row)


def frames_to_notes(times, freqs, confs=None, conf_threshold=None, min_dur=0.05, fmin=1.0):
    """Lane post-processing (not the tool's): f0 frames -> notes, see module docstring."""
    import math
    notes = []
    cur = None  # [start_t, last_t, midi]
    hop = (times[1] - times[0]) if len(times) > 1 else 0.01
    for i, t in enumerate(times):
        f = float(freqs[i])
        voiced = f == f and f > fmin
        if voiced and conf_threshold is not None and confs is not None:
            voiced = float(confs[i]) >= conf_threshold
        m = int(round(69 + 12 * math.log2(f / 440.0))) if voiced else None
        if cur is not None and m == cur[2] and t - cur[1] <= 1.5 * hop:
            cur[1] = t
            continue
        if cur is not None:
            notes.append((cur[0], cur[1] + hop, cur[2]))
        cur = [t, t, m] if m is not None else None
    if cur is not None:
        notes.append((cur[0], cur[1] + hop, cur[2]))
    return [n for n in notes if n[1] - n[0] >= min_dur]


def read_notes_csv(path):
    out = []
    with open(path) as f:
        r = csv.DictReader(f)
        for row in r:
            out.append((float(row["onset_s"]), float(row["offset_s"]), float(row["pitch_midi"])))
    return out


def midi_notes(path):
    import pretty_midi
    pm = pretty_midi.PrettyMIDI(path)
    out = []
    for inst in pm.instruments:
        if inst.is_drum:
            continue
        for n in inst.notes:
            out.append((n.start, n.end, n.pitch, n.velocity))
    return sorted(out)


def pianoroll_png(est, truth, path, title, t0=0.0, t1=None):
    """est/truth: lists of (onset, offset, pitch). Truth drawn as grey bars, estimate as thin red bars on top."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if t1 is None:
        t1 = max([n[1] for n in est + truth] + [1.0])
    fig, ax = plt.subplots(figsize=(10, 3.6), dpi=90)
    for (a, b, p) in [(n[0], n[1], n[2]) for n in truth]:
        ax.add_patch(plt.Rectangle((a, p - 0.45), b - a, 0.9, color="0.72", lw=0))
    for (a, b, p) in [(n[0], n[1], n[2]) for n in est]:
        ax.add_patch(plt.Rectangle((a, p - 0.18), b - a, 0.36, color="#c0392b", lw=0))
    ps = [n[2] for n in est + truth] or [60]
    ax.set_xlim(t0, t1)
    ax.set_ylim(min(ps) - 2, max(ps) + 2)
    ax.set_xlabel("time (s)")
    ax.set_ylabel("MIDI pitch")
    ax.set_title(title, fontsize=9)
    ax.grid(axis="y", lw=0.3, color="0.85")
    from matplotlib.patches import Patch
    ax.legend(handles=[Patch(color="0.72", label="truth"), Patch(color="#c0392b", label="estimate")],
              loc="upper right", fontsize=7)
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)
