"""Picture: f0 tracks of several monophonic trackers on S2n (two voices) over the truth melody and bass notes.
usage: python plot_f0_s2n.py <out.png>"""
import csv, json, math, sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
L = "/home/user/gtr/lanes/audio-to-notes/out"
T = json.load(open("/home/user/gtr/inputs/S2n/S2n.truth.json"))
tools = [("pyin", "librosa pyin"), ("fcpe", "FCPE"), ("pesto", "PESTO"), ("torchcrepe-full", "torchcrepe full (viterbi)"),
         ("essentia-melodia", "Essentia Melodia"), ("swiftf0", "SwiftF0")]
fig, axes = plt.subplots(len(tools), 1, figsize=(10, 1.6 * len(tools)), dpi=80, sharex=True, sharey=True)
for ax, (t, name) in zip(axes, tools):
    for n in T["notes"]:
        ax.plot([n["onset"], n["offset"]], [n["pitch"]] * 2, color="0.6" if n["voice"] == "bass" else "0.25", lw=3, solid_capstyle="butt")
    rows = list(csv.DictReader(open(f"{L}/{t}/f0/S2n.f0.csv")))
    xs, ys = [], []
    for r in rows:
        f = float(r["frequency_hz"]); c = float(r["confidence"]) if "confidence" in r and r["confidence"] else 1.0
        if f > 0 and (t != "swiftf0" or c >= 0.5) and (t != "torchcrepe-full" or c >= 0.21):
            xs.append(float(r["time_s"])); ys.append(69 + 12 * math.log2(f / 440.0))
    ax.scatter(xs, ys, s=1.2, color="#c0392b")
    ax.set_ylim(36, 84); ax.set_ylabel("MIDI", fontsize=7); ax.set_title(name, fontsize=8, loc="left")
    ax.tick_params(labelsize=7)
axes[-1].set_xlabel("time (s)")
fig.suptitle("S2n: f0 frames (red; SwiftF0 conf >= 0.5, torchcrepe periodicity >= 0.21, others as written) over truth melody (dark) and bass (light)", fontsize=8)
fig.tight_layout()
fig.savefig(sys.argv[1])
print(sys.argv[1])
