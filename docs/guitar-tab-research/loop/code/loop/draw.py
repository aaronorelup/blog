#!/home/user/gtv/tools/venv-torch/bin/python
"""draw.py: the loop's pictures of the sound (venv-torch: librosa, matplotlib).

  draw.py spec <audio.wav> <out.png> --from S --to S [--cands candidates.csv] [--notes tab.json|bar.json]
          [--unit T0,T1] [--beats beats.txt] [--title T] [--lo MIDI --hi MIDI]
      constant-Q picture (3 bins a semitone), every semitone a line, naturals named, C lines brighter; candidates as
      boxes with their ids (base = white solid, alternatives held by 2+ models = cyan dashed, by one model = cyan
      dotted); finished notes (--notes) as green boxes with string:fret; the unit's edges as yellow lines, the
      context outside them dimmed; beats as thin grey lines with their number.
  draw.py residual <audio.wav> <bar.json> <outdir> --from S --to S --unit T0,T1 --program 25|24 [--context tab.json]
      renders the notes with FluidSynth (the kit's notes2wav.py), writes mix.wav (left = recording, right = render),
      render.wav, residual.png (recording minus render, each as presence 0..1 over its own top 50 dB: RED = sound in
      the recording that the tab does not explain, BLUE = sound the tab invents) and prints a short per-note check.
"""
import argparse, csv, json, os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
import librosa
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
PYEV = "/home/user/gtr/eval/venv/bin/python"
N2W = "/home/user/gtv/tools/kit/lib/notes2wav.py"
SR, BPS, HOP = 22050, 3, 128


def nm(p):
    p = int(round(p)); return f"{NAMES[p % 12]}{p // 12 - 1}"


def load_seg(path, t0, t1):
    info = sf.info(path)
    a = max(0, int(t0 * info.samplerate)); b = int(t1 * info.samplerate)
    y, sr = sf.read(path, start=a, stop=b, dtype="float32", always_2d=True)
    y = y.mean(axis=1)
    if sr != SR:
        y = librosa.resample(y, orig_sr=sr, target_sr=SR)
    pad = int(round((a / info.samplerate - t0) * SR)) if t0 < 0 else 0
    return np.concatenate([np.zeros(pad, np.float32), y]) if pad > 0 else y


def cqt_db(y, lo, hi):
    n = (hi - lo + 1) * BPS
    C = np.abs(librosa.cqt(y, sr=SR, hop_length=HOP, fmin=librosa.midi_to_hz(lo - 1.0 / BPS), n_bins=n,
                           bins_per_octave=12 * BPS))
    return librosa.amplitude_to_db(C, ref=np.max(C) + 1e-9)


def read_cands(p):
    out = []
    for r in csv.DictReader(open(p)):
        out.append({"id": int(r["id"]), "onset": float(r["onset"]), "offset": float(r["offset"]), "pitch": int(r["pitch"]),
                    "n_sup": int(r["n_sup"]), "base": int(r["base"])})
    return out


def read_notes(p):
    d = json.load(open(p)); n = d["notes"] if isinstance(d, dict) else d
    return [x for x in n if "pitch" in x]


def grid(ax, lo, hi, t0, t1):
    for m in range(lo, hi + 1):
        nat = "#" not in NAMES[m % 12]
        ax.axhline(m - 0.5, color="white", alpha=0.10, lw=0.5)
    ticks = [m for m in range(lo, hi + 1)]
    ax.set_yticks(ticks)
    ax.set_yticklabels([nm(m) if "#" not in NAMES[m % 12] else "" for m in ticks], fontsize=8)
    for m in ticks:
        if m % 12 == 0:
            ax.axhline(m, color="white", alpha=0.30, lw=0.6)
    step = 0.25 if t1 - t0 <= 6 else (0.5 if t1 - t0 <= 12 else 1.0)
    xt = np.arange(np.ceil(t0 / step) * step, t1 + 1e-9, step)
    ax.set_xticks(xt); ax.set_xticklabels([f"{x:.2f}".rstrip("0").rstrip(".") for x in xt], fontsize=7)
    ax.set_xlim(t0, t1); ax.set_ylim(lo - 0.5, hi + 0.5)
    ax.set_xlabel("seconds of the recording", fontsize=8)


class Labels:
    """Places small text labels so they never overlap: each tries its own place, then shifted up, right, down; a
    one-model alternative's label that still collides is left out (thinned); others go to the least crowded spot."""
    def __init__(self, ax, fig):
        self.ax, self.boxes = ax, []
        (x0, x1), (y0, y1) = ax.get_xlim(), ax.get_ylim()
        bb = ax.get_position(); W, H = fig.get_size_inches()
        self.sx = (x1 - x0) / (bb.width * W * 72.0)     # data units per point
        self.sy = (y1 - y0) / (bb.height * H * 72.0)

    def add(self, x, y, text, fontsize, thin=False, **kw):
        w = (len(text) * 0.62 * fontsize + 3) * self.sx; h = (fontsize + 3) * self.sy
        x = max(x, self.ax.get_xlim()[0] + 0.2 * w)
        tries = [(0, 0), (0, h), (w, 0), (0, -h - 0.9), (w, h), (0, 2 * h), (2 * w, 0), (w, -h - 0.9)]
        hit = lambda bx, by: sum(1 for (a, b, c, d) in self.boxes if bx < c and a < bx + w and by < d and b < by + h)
        best = None
        for dx, dy in tries:
            n = hit(x + dx, y + dy)
            if n == 0:
                best = (dx, dy); break
            if best is None or n < best[2]:
                best = (dx, dy, n)
        if len(best) == 3 and thin:
            return False
        dx, dy = best[0], best[1]
        self.boxes.append((x + dx, y + dy, x + dx + w, y + dy + h))
        self.ax.text(x + dx, y + dy, text, fontsize=fontsize, ha="left", va="bottom", **kw)
        if dx or dy:
            self.ax.plot([x, x + dx], [y - 0.1, y + dy], color=kw.get("color", "white"), lw=0.5, alpha=0.6)
        return True


def fig_for(t0, t1, lo, hi):
    dur = t1 - t0
    w = min(15.6, max(9.0, dur * 3.3)); h = min(10.0, max(6.5, (hi - lo + 1) * 0.19))
    fig = plt.figure(figsize=(w, h), dpi=100)
    ax = fig.add_axes([0.055, 0.06, 0.935, 0.89])
    return fig, ax


def spec(a):
    t0, t1 = a.t0, a.t1
    cands = read_cands(a.cands) if a.cands else []
    fin = read_notes(a.notes) if a.notes and os.path.exists(a.notes) else []
    vis = [c["pitch"] for c in cands if c["onset"] < t1 and c["offset"] > t0] + \
          [n["pitch"] for n in fin if n["onset"] < t1 and n["offset"] > t0]
    lo = a.lo if a.lo is not None else (min(vis) - 3 if vis else 40)
    hi = a.hi if a.hi is not None else (max(vis) + 14 if vis else 84)
    lo, hi = max(24, min(lo, 45)), min(100, max(hi, lo + 30))
    y = load_seg(a.audio, t0, t1)
    D = cqt_db(y, lo, hi)
    fig, ax = fig_for(t0, t1, lo, hi)
    ax.imshow(D, origin="lower", aspect="auto", cmap="magma", vmin=-60, vmax=0, interpolation="nearest",
              extent=[t0, t0 + D.shape[1] * HOP / SR, lo - 0.5, hi + 0.5])
    grid(ax, lo, hi, t0, t1)
    if a.unit:
        u0, u1 = [float(x) for x in a.unit.split(",")]
        for x in (u0, u1):
            ax.axvline(x, color="yellow", lw=1.6, ls="--")
        if u0 > t0: ax.axvspan(t0, u0, color="black", alpha=0.35)
        if u1 < t1: ax.axvspan(u1, t1, color="black", alpha=0.35)
    if a.beats:
        for line in open(a.beats):
            v = line.split()
            if len(v) >= 2 and t0 <= float(v[0]) <= t1:
                ax.axvline(float(v[0]), color="#bbbbbb", lw=0.6, alpha=0.6)
                ax.text(float(v[0]) + 0.01, hi + 0.1, ("bar " if v[1] == "1" else "") + v[1], color="#dddddd", fontsize=7, va="top")
    u_start = float(a.unit.split(",")[0]) if a.unit else None
    lab = Labels(ax, fig)
    for c in sorted(cands, key=lambda c: (-c["base"], -c["n_sup"], c["onset"])):
        if c["offset"] < t0 or c["onset"] > t1:
            continue
        if fin and u_start is not None and c["onset"] < u_start - 0.001:
            continue      # decided already: the finished notes (green) stand there
        if c["base"]:
            ec, ls, lw, fc = "white", "-", 1.5, "white"
        elif c["n_sup"] >= 2:
            ec, ls, lw, fc = "cyan", "--", 1.2, "cyan"
        else:
            ec, ls, lw, fc = "cyan", ":", 0.9, "#7fdfff"
        ax.add_patch(Rectangle((c["onset"], c["pitch"] - 0.42), max(c["offset"] - c["onset"], 0.04), 0.84, fill=False,
                               ec=ec, ls=ls, lw=lw))
        lab.add(c["onset"], c["pitch"] + 0.55, str(c["id"]), 7.5 if c["base"] else 6.5, thin=not c["base"] and c["n_sup"] < 2,
                color=fc, bbox=dict(fc="black", ec="none", alpha=0.55, pad=0.4))
    for n in fin:
        if n["offset"] < t0 or n["onset"] > t1:
            continue
        ax.add_patch(Rectangle((n["onset"], n["pitch"] - 0.3), max(n["offset"] - n["onset"], 0.04), 0.6, fill=False,
                               ec="#66ff66", lw=1.3))
        if n.get("string"):
            ax.text(n["onset"], n["pitch"] - 0.6, f"{n['string']}:{n['fret']}", color="#66ff66", fontsize=7, va="top",
                    bbox=dict(fc="black", ec="none", alpha=0.5, pad=0.3))
    ax.set_title(a.title or f"{t0:.2f}-{t1:.2f} s", fontsize=9)
    fig.savefig(a.out); plt.close(fig)
    print(f"wrote {a.out} ({t0:.2f}-{t1:.2f} s, {nm(lo)}-{nm(hi)})")


def render(notes, t0, t1, program, out_wav):
    """FluidSynth render of notes on [t0, t1] (time 0 of the file = t0)."""
    with tempfile.TemporaryDirectory() as td:
        p = os.path.join(td, "n.csv")
        with open(p, "w") as fh:
            fh.write("onset,offset,pitch\n")
            for n in notes:
                if n["onset"] >= t0 - 0.001 and n["onset"] < t1:
                    fh.write(f"{n['onset'] - t0:.4f},{min(n['offset'], t1 + 1.0) - t0:.4f},{int(n['pitch'])}\n")
        r = subprocess.run([PYEV, N2W, p, out_wav, "--program", str(program), "--duration", f"{t1 - t0:.3f}"],
                           capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit("render failed: " + (r.stderr or r.stdout)[-400:])


def presence(D, whiten=False):
    """0..1 over the top 50 dB; whiten: each pitch row's median over the stretch is taken out first, so a steady
    resonance or hum (the guitar body, the room) does not read as a missing note."""
    if whiten:
        D = D - np.median(D, axis=1, keepdims=True) + np.median(D)
    top = np.percentile(D, 99.5)
    return np.clip((D - top + 50.0) / 50.0, 0, 1)


def residual(a):
    t0, t1 = a.t0, a.t1
    u0, u1 = [float(x) for x in a.unit.split(",")]
    os.makedirs(a.outdir, exist_ok=True)
    bar = read_notes(a.bar)
    ctx = [n for n in (read_notes(a.context) if a.context and os.path.exists(a.context) else [])
           if n["onset"] < u0 and n["offset"] > t0]
    allnotes = ctx + bar
    rw = os.path.join(a.outdir, "render.wav")
    render(allnotes, t0, t1, a.program, rw)
    yr, srr = sf.read(rw, dtype="float32", always_2d=True)
    yr = librosa.resample(yr.mean(axis=1), orig_sr=srr, target_sr=SR)
    yo = load_seg(a.audio, t0, t1)
    L = min(len(yo), len(yr)); yo, yr = yo[:L], yr[:L]
    pk = lambda v: v / (np.max(np.abs(v)) + 1e-9) * 0.89
    sf.write(os.path.join(a.outdir, "mix.wav"), np.stack([pk(yo), pk(yr)], axis=1), SR, subtype="PCM_16")
    vis = [n["pitch"] for n in allnotes] or [52]
    lo, hi = max(24, min(min(vis) - 3, 45)), min(100, max(max(vis) + 14, min(vis) + 30))
    Po, Pr = presence(cqt_db(yo, lo, hi)), presence(cqt_db(yr, lo, hi))
    T = min(Po.shape[1], Pr.shape[1]); Po, Pr = Po[:, :T], Pr[:, :T]
    R = Po - Pr
    Rv = np.where(np.abs(R) < 0.2, 0.0, R)   # a dead zone, so timbre differences between the render and the guitar fade
    fpsx = SR / HOP     # the context outside the unit is masked: it is not this unit's to explain (the next unit is unwritten)
    m0, m1 = max(0, int((u0 - t0) * fpsx)), min(Rv.shape[1], int((u1 - t0) * fpsx) + 1)
    Rv[:, :m0] = 0.0; Rv[:, m1:] = 0.0
    fig, ax = fig_for(t0, t1, lo, hi)
    ax.set_facecolor("white")
    ax.imshow(Rv, origin="lower", aspect="auto", cmap="bwr", vmin=-1, vmax=1, interpolation="nearest",
              extent=[t0, t0 + T * HOP / SR, lo - 0.5, hi + 0.5])
    grid(ax, lo, hi, t0, t1)
    for m in range(lo, hi + 1):
        if m % 12 == 0: ax.axhline(m, color="black", alpha=0.25, lw=0.6)
    for x in (u0, u1):
        ax.axvline(x, color="#aa8800", lw=1.4, ls="--")
    for a_, b_ in ((t0, u0), (u1, t1)):
        if b_ > a_:
            ax.axvspan(a_, b_, color="#999999", alpha=0.25, lw=0)
            ax.text((a_ + b_) / 2, hi + 0.3, "context: masked", ha="center", va="top", fontsize=7, color="#555555")
    for n in allnotes:
        ax.add_patch(Rectangle((n["onset"], n["pitch"] - 0.42), max(n["offset"] - n["onset"], 0.04), 0.84, fill=False,
                               ec="black", lw=1.0, ls="-" if n in bar else ":"))
        if n.get("string"):
            ax.text(n["onset"], n["pitch"] + 0.5, f"{n['string']}:{n['fret']}", fontsize=7, color="black", va="bottom")
    ax.set_title("recording minus render: RED = in the recording, not in the tab; BLUE = in the tab, not in the recording;"
                 " boxes = the tab (dotted: earlier units); grey = context outside the unit, masked", fontsize=9)
    fig.savefig(os.path.join(a.outdir, "residual.png")); plt.close(fig)
    # per-note check on the recording: presence of the fundamental just after the onset, and its rise
    fps = SR / HOP
    semi = lambda P, m: P[max(0, (m - lo) * BPS):(m - lo) * BPS + BPS].max(axis=0) if lo <= m <= hi else np.zeros(P.shape[1])
    lines = [f"render + residual of {len(bar)} notes, {u0:.2f}-{u1:.2f} s (pictures: residual.png; mix.wav = left recording, right render)",
             "note                 heard  rise  verdict   (heard = recording presence 0..1 of the fundamental 30-150 ms after the onset)"]
    weak = 0
    for n in sorted(bar, key=lambda n: (n["onset"], n["pitch"])):
        f0 = int((n["onset"] - t0) * fps)
        row = semi(Po, int(n["pitch"]))
        aft = float(row[f0 + int(0.03 * fps):f0 + int(0.15 * fps) + 1].max()) if f0 < len(row) else 0.0
        bef = float(row[max(0, f0 - int(0.12 * fps)):max(1, f0 - int(0.02 * fps))].mean()) if f0 > 2 else 0.0
        v = "ok" if aft >= 0.55 and aft - bef >= 0.08 else ("rings-on?" if aft >= 0.55 else "weak")
        weak += v == "weak"
        lines.append(f"{n['onset']:7.3f} {nm(n['pitch']):<4} {str(n.get('string', '-'))}:{str(n.get('fret', '-')):<3}"
                     f"     {aft:4.2f}  {aft - bef:+4.2f}  {v}")
    # unexplained energy: red peaks with a rise, not a fundamental or overtone of a tab note sounding then
    P = np.stack([semi(R, m) for m in range(lo, hi + 1)])
    Po_s = np.stack([semi(Po, m) for m in range(lo, hi + 1)])
    found = []
    a0, a1 = int((u0 - t0) * fps), int((u1 - t0) * fps)
    for k in range(P.shape[0]):
        m = lo + k
        for f in range(max(a0, 3), min(a1, P.shape[1] - 3)):
            if P[k, f] >= 0.45 and Po_s[k, f] - Po_s[k, max(0, f - int(0.06 * fps))] >= 0.25 and P[k, f] == P[k, f - 3:f + 4].max():
                t = t0 + f / fps
                expl = any(n["onset"] - 0.08 <= t <= n["offset"] and (m - n["pitch"]) in (0, 12, 19, 24, 28, 31) for n in allnotes)
                if not expl and not any(abs(t - x) < 0.12 and abs(m - y) <= 1 for x, y, _ in found):
                    found.append((t, m, float(P[k, f])))
    found.sort(key=lambda x: -x[2])
    lines.append("unexplained (red with an onset, not a tab note or its overtones): " +
                 (", ".join(f"{t:.3f}s {nm(m)} ({s:.2f})" for t, m, s in sorted(found[:8])) if found else "none"))
    blue = float(np.clip(-R[:, a0:a1], 0, 1).mean()); red = float(np.clip(R[:, a0:a1], 0, 1).mean())
    lines.append(f"mean red {red:.3f}, mean blue {blue:.3f} inside the unit; weak notes {weak} of {len(bar)}")
    txt = "\n".join(lines)
    open(os.path.join(a.outdir, "check.txt"), "w").write(txt + "\n")
    print(txt)


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    s = sp.add_parser("spec"); s.add_argument("audio"); s.add_argument("out")
    s.add_argument("--from", dest="t0", type=float, required=True); s.add_argument("--to", dest="t1", type=float, required=True)
    s.add_argument("--cands"); s.add_argument("--notes"); s.add_argument("--unit"); s.add_argument("--beats")
    s.add_argument("--title"); s.add_argument("--lo", type=int); s.add_argument("--hi", type=int)
    r = sp.add_parser("residual"); r.add_argument("audio"); r.add_argument("bar"); r.add_argument("outdir")
    r.add_argument("--from", dest="t0", type=float, required=True); r.add_argument("--to", dest="t1", type=float, required=True)
    r.add_argument("--unit", required=True); r.add_argument("--program", type=int, default=25); r.add_argument("--context")
    a = ap.parse_args()
    if a.cmd == "spec":
        if a.t1 - a.t0 > 12.5:
            sys.exit("keep a picture to 12 s or less")
        spec(a)
    else:
        residual(a)


if __name__ == "__main__":
    main()
