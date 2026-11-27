"""common.py: shared pieces of the bar-by-bar loop (prep, pack, driver, tools). Standard library only, so the driver
can run on any python3; the picture code lives in draw.py (venv-torch) and the overlay in the hand-reach tool.

Layout of a run (see LOOP-BUILD.md):
  <run_dir>/            driver side, never shown to a writer: run.json (slot, rung, blind dir), progress.json, tab.json,
                        changes.jsonl, units_log.jsonl, driver.log, answer.json, answer.gp5, score/
  <run_dir>/blind -> G/loop/bw/<random id>/   the writer side, neutral names only:
      inputs/  audio.wav video.mp4 candidates.csv units.json similar.json config.json beats.txt hand/
      tools/   the writer's tools (render.sh, spec.sh, overlay.sh, frame.sh, solve.sh, check.sh) and TOOLS-BAR.md
      state.json  the carried state
      u007/    one unit's pack (PACK.md, candidates.csv, spectrogram.png, neck.jpg, similar.md, state.json) and the
               writer's bar.json, lessons.json, revisit.json; u007.r1/ a revisit of it
"""
import csv, json, math, os, tempfile

G = "/home/user/gtv"
LOOP = os.path.join(G, "loop", "tools", "loop")
HAND_TOOL = os.path.join(G, "loop", "tools", "handreach")
KIT = os.path.join(G, "tools", "kit")
PYT = os.path.join(G, "tools", "venv-torch", "bin", "python")   # librosa, matplotlib
PYVID = os.path.join(G, "tools", "venv-video", "bin", "python")  # OpenCV
PYEV = "/home/user/gtr/eval/venv/bin/python"                       # gtr-eval's reader, notes2wav
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
GROUP_S = 0.035     # notes whose onsets lie this close form one onset group (one note per string)
MODELS = ["bp", "gaps", "fl", "tk", "mt3"]   # Basic Pitch, guitar-gaps, guitar-fl, Transkun, YourMT3+


def name(p):
    p = int(round(p)); return f"{NAMES[p % 12]}{p // 12 - 1}"


def rj(path, default=None):
    try:
        with open(path) as fh:
            return json.load(fh)
    except (FileNotFoundError, json.JSONDecodeError):
        if default is not None:
            return default
        raise


def wj(path, obj, indent=1):
    """Atomic JSON write (a restart never leaves half a file)."""
    d = os.path.dirname(os.path.abspath(path)); os.makedirs(d, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".tmp_")
    with os.fdopen(fd, "w") as fh:
        json.dump(obj, fh, indent=indent)
    os.chmod(tmp, 0o644)
    os.replace(tmp, path)


def append_jsonl(path, obj):
    with open(path, "a") as fh:
        fh.write(json.dumps(obj) + "\n"); fh.flush(); os.fsync(fh.fileno())


def read_jsonl(path):
    out = []
    if os.path.exists(path):
        for line in open(path):
            line = line.strip()
            if line:
                try: out.append(json.loads(line))
                except json.JSONDecodeError: pass
    return out


def read_cands(path):
    """candidates.csv of the run: id,onset,offset,pitch,name,supporters,n_sup,base."""
    out = []
    for r in csv.DictReader(open(path)):
        out.append({"id": int(r["id"]), "onset": float(r["onset"]), "offset": float(r["offset"]),
                    "pitch": int(r["pitch"]), "supporters": r["supporters"], "n_sup": int(r["n_sup"]),
                    "base": int(r["base"])})
    return out


class Window:
    """hand_window.csv (t, lo, hi, conf, lost, ...): frets from the capo the fretting hand can reach; open strings are
    always allowed; a lost row is no constraint. at(t) gives the nearest row (span > 0: the union within +-span)."""
    def __init__(self, path):
        self.t, self.lo, self.hi, self.lost = [], [], [], []
        if path and os.path.exists(path):
            for r in csv.DictReader(open(path)):
                self.t.append(float(r["t"])); self.lost.append(r.get("lost", "0") not in ("0", "", "False", "false"))
                self.lo.append(int(float(r["lo"])) if r.get("lo") not in (None, "") else None)
                self.hi.append(int(float(r["hi"])) if r.get("hi") not in (None, "") else None)
        self.on = bool(self.t)

    def at(self, t, span=0.0):
        """(lo, hi) or None (no window: lost, off, or out of range). span 0 = the row nearest to t (as the solver)."""
        if not self.on:
            return None
        import bisect
        if span <= 0:
            k = bisect.bisect_left(self.t, t)
            if k >= len(self.t): k = len(self.t) - 1
            elif k > 0 and abs(self.t[k - 1] - t) <= abs(self.t[k] - t): k -= 1
            return None if self.lost[k] or self.lo[k] is None else (self.lo[k], self.hi[k])
        i0 = bisect.bisect_left(self.t, t - span); i1 = bisect.bisect_right(self.t, t + span)
        los, his = [], []
        for i in range(max(0, i0), min(len(self.t), max(i1, i0 + 1))):
            if not self.lost[i] and self.lo[i] is not None:
                los.append(self.lo[i]); his.append(self.hi[i])
        if not los:
            return None
        return (min(los), max(his))


def places(pitch, tuning, capo, maxf):
    """Every (string, fret-from-capo) that sounds `pitch`; tuning = 6 MIDI numbers, string 6 to string 1."""
    out = []
    for s in range(1, 7):
        f = pitch - (tuning[6 - s] + capo)
        if 0 <= f <= maxf:
            out.append((s, f))
    return out


def in_window(f, win):
    return f == 0 or win is None or (win[0] <= f <= win[1])


def groups(notes, key="onset"):
    """Onset groups: lists of notes whose onsets lie within GROUP_S of the group's first note."""
    out, cur = [], []
    for n in sorted(notes, key=lambda n: (n[key], n.get("pitch", 0))):
        if cur and n[key] - cur[0][key] > GROUP_S:
            out.append(cur); cur = []
        cur.append(n)
    if cur:
        out.append(cur)
    return out


def unit_dir(blind, i, rev=0):
    return os.path.join(blind, f"u{i:03d}" + (f".r{rev}" if rev else ""))


def maxfret(cfg):
    return int(cfg.get("max_fret_from_capo", 20 - int(cfg["capo"])))
