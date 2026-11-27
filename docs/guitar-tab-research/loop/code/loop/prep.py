#!/home/user/gtv/tools/venv-torch/bin/python
"""prep.py <S> <run_dir> --notes {l1|l2} --tuning T6 T5 T4 T3 T2 T1 --capo N --hand-dir <dir|none>
          [--tuning-source given|found] [--units bars|gaps] [--anchors anchors.json] [--track track.json] [--force]
          (--window <hand_window.csv|none> is the older form of --hand-dir: the window file's folder)
          Held-out songs (no G/experiments/<S>/): [--notes-dir <dir> [--base gaps-paper] [--alts m1,m2,..]
          [--base-label <label|none>] [--base-filter hand|none]] [--audio <wav>] [--video <mp4>] [--beats <beats.txt>]
          [--strings steel|nylon], e.g. for G/heldout/<S>/:
            prep.py <S> <run> --notes l2 --tuning <6 MIDI> --tuning-source found --capo N --hand-dir G/loop/hand/<S> \
              --notes-dir G/heldout/<S>/notes --audio G/heldout/<S>/audio.mono.wav --video G/heldout/<S>/video.mp4 \
              --beats G/heldout/<S>/beats.txt [--strings nylon]
          --notes-dir: a folder of <model>/notes.csv (onset,offset,pitch; extra columns ignored). With --notes l2 the
            base reading is <base>/notes.csv (default gaps-paper) after the hand filter (G/loop/tools/handreach/
            hand_filter.py, unchanged: a base note is removed when, at its onset, no place inside the hand window and no
            open string plays it, with this run's --tuning and --capo; lost rows keep everything; default on when the
            hand is on, --base-filter none turns it off; the removed notes go to <run>/base_removed.csv, driver side),
            and the alternatives are --alts (default basic-pitch,guitar-gaps,guitar-fl,transkun), each folder's
            notes as one model, under the labels bp, gaps, fl, tk (yourmt3 = mt3, basic-pitch-range = bpr, gaps-paper =
            gpap). The base reading gets no supporter label of its own (base=1 marks it, as chain-2 on the steel dev
            songs) unless --base-label names one (the nylon dev song's base had "gstem"). Everything else (merging,
            units, similar units, the hand, the blind check) is the dev songs' code, unchanged; without these options
            a run is prepared exactly as before (candidates from G/experiments/<S>/chain-2 and n-01..n-05, beats from
            c-01, sound and video from G/songs/<S>/).

Writes a run's inputs, once, before the driver starts. The driver side goes to <run_dir> (run.json); everything a
writer may see goes to a new neutral folder G/loop/bw/<random id>/ (linked as <run_dir>/blind), which never holds the
slot name, a title, a key or a score:
  inputs/audio.wav     a COPY of the song's mono sound (G/songs/<S>/<S>.mono.wav: same samples as <S>.wav)
  inputs/video.mp4     a COPY of the video (the nylon song: G/blind/b2/video.mp4, title and end cards blacked out);
                       left out when the hand is off (--hand-dir none). Every file of the blind folder is a copy (never a
                       hard link: `find -samefile` would name the original's folder); prep.py checks st_nlink = 1 at the end
                       and the driver checks it again at the start of every run.
  inputs/candidates.csv  id,onset,offset,pitch,name,supporters,n_sup,base: l2 = chain-2's notes (base) merged with the
                       five note models (n-01..n-05: bp, gaps, fl, tk, mt3), one candidate per pitch within 50 ms;
                       l1 = the key's onsets, offsets and pitches (read here ONCE; never strings or frets)
  inputs/units.json    the units of work (bars from Beat This!'s downbeats, two short bars share one; or 2-4 s cuts)
  inputs/similar.json  for each unit, earlier units that sound alike (chroma + candidate pitches), score and offset
  inputs/beats.txt     Beat This!'s beats (time, beat number)
  inputs/hand/         from --hand-dir (E1's published folder G/loop/hand/<S>/, or an E1 version folder):
                       hand_window.csv (copied), tips.jsonl, anchors.json and track.json if any, the JSON ones REWRITTEN
                       with every path-like string nulled (no source path, so no slot name: the video is
                       inputs/video.mp4, the anchors inputs/hand/anchors.json; notes dropped). Nothing else of that
                       folder (never a score). --anchors / --track override.
  inputs/config.json   the run in neutral words (no slot name)
  state.json           the empty carried state
The tuning is given as plain MIDI numbers on the command line (the orchestrator's config), never read from a key.
At the end blindcheck.py looks at every file of the blind folder (text, JSON values, CSV cells, media tags and the
printable strings of binary files) for a slot name in a path or id or as a value, "truth", "experiments", a song's
title, artist, player, id or source, and any outside path; one hit refuses the run (the folder is deleted)."""
import argparse, csv, json, os, re, secrets, shutil, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import G, MODELS, HAND_TOOL, name, wj, rj

ap = argparse.ArgumentParser()
ap.add_argument("S"); ap.add_argument("run_dir")
ap.add_argument("--notes", choices=["l1", "l2"], required=True)
ap.add_argument("--tuning", type=int, nargs=6, required=True)
ap.add_argument("--capo", type=int, required=True)
ap.add_argument("--hand-dir", default=None, help="folder with hand_window.csv, tips.jsonl, anchors.json, track.json (E1), or none")
ap.add_argument("--window", default=None, help="older form: a hand_window.csv (its folder is the hand dir) or none")
ap.add_argument("--tuning-source", choices=["given", "found"], default="given")
ap.add_argument("--units", choices=["bars", "gaps"], default=None, help="default: gaps on the nylon song, else bars")
ap.add_argument("--anchors", default=None); ap.add_argument("--track", default=None)
ap.add_argument("--force", action="store_true")
ap.add_argument("--notes-dir", default=None, help="held-out songs: a folder of <model>/notes.csv; the candidates come from here")
ap.add_argument("--base", default="gaps-paper", help="--notes-dir: the base reading's folder (default gaps-paper)")
ap.add_argument("--alts", default="basic-pitch,guitar-gaps,guitar-fl,transkun", help="--notes-dir: the alternatives' folders")
ap.add_argument("--base-label", default=None, help="--notes-dir: the base reading's supporter label (default: none)")
ap.add_argument("--base-filter", choices=["hand", "none"], default=None, help="--notes-dir: hand filter on the base (default: hand when the hand is on)")
ap.add_argument("--audio", default=None, help="the sound (default G/songs/<S>/<S>.mono.wav)")
ap.add_argument("--video", default=None, help="the video (default G/songs/<S>/<S>.mp4; the nylon dev song: G/blind/b2/video.mp4)")
ap.add_argument("--beats", default=None, help="Beat This!'s beats.txt (default G/experiments/<S>/c-01/beats.txt)")
ap.add_argument("--strings", choices=["steel", "nylon"], default=None, help="default: nylon for the nylon dev slot, else steel")
a = ap.parse_args()
LABELS = {"basic-pitch": "bp", "guitar-gaps": "gaps", "guitar-fl": "fl", "transkun": "tk", "yourmt3": "mt3",
          "basic-pitch-range": "bpr", "gaps-paper": "gpap"}
if (a.hand_dir is None) == (a.window is None):
    sys.exit("give exactly one of --hand-dir <dir|none> or --window <hand_window.csv|none>")
HAND_DIR = None
if (a.hand_dir or a.window).lower() != "none":
    HAND_DIR = os.path.abspath(a.hand_dir) if a.hand_dir else os.path.dirname(os.path.abspath(a.window))
    if not os.path.exists(os.path.join(HAND_DIR, "hand_window.csv")):
        sys.exit(f"no hand_window.csv in {HAND_DIR}")
S = a.S
NYLON = {"tuning"}            # the nylon recording's slot; never written to the blind side
EXP = os.path.join(G, "experiments", S)
run_dir = os.path.abspath(a.run_dir)
if os.path.exists(os.path.join(run_dir, "run.json")) and not a.force:
    sys.exit(f"{run_dir}/run.json exists: a prepared run (use --force to prepare it again)")
os.makedirs(run_dir, exist_ok=True)
bid = secrets.token_hex(4)
blind = os.path.join(G, "loop", "bw", bid)
inp = os.path.join(blind, "inputs"); os.makedirs(inp)
kind = a.strings or ("nylon" if S in NYLON else "steel")
if a.notes_dir and a.notes != "l2":
    sys.exit("--notes-dir goes with --notes l2")
BASE_FILTER = None
if a.notes_dir:
    BASE_FILTER = a.base_filter or ("hand" if HAND_DIR else "none")
    if BASE_FILTER == "hand" and not HAND_DIR:
        sys.exit("--base-filter hand needs a hand window (--hand-dir)")
hand_on = HAND_DIR is not None


def link(src, dst):
    """A plain copy (never a hard link or a symlink): the blind folder must share no inode with the originals."""
    shutil.copyfile(src, dst)
    if os.stat(dst).st_nlink != 1 or os.path.samefile(src, dst):
        sys.exit(f"{dst} is not a separate copy")


PATHLIKE = re.compile(r"^(?:/|~|\.\.?/)|^[\w.-]+/[\w./ -]+$|\.(?:json|jsonl|csv|mp4|mkv|wav|png|jpg|txt|npy|npz|mid|gp5)$")


def scrub(x, keep=None):
    """Every string of a JSON file that names a file or a folder becomes null (track.json named the E1 window's
    anchors and the landmark file of G/experiments/<slot>/...: the slot's name); `keep` maps keys to the neutral path
    they get instead (the video, the anchors), so no source path reaches the blind folder."""
    keep = keep or {}
    if isinstance(x, dict):
        return {k: (keep[k] if k in keep else scrub(v, keep)) for k, v in x.items()}
    if isinstance(x, list):
        return [scrub(v, keep) for v in x]
    if isinstance(x, str) and PATHLIKE.search(x.strip()):
        return None
    return x


def copy_json(src, dst, keep=None, lines=False):
    """A JSON (or JSON-lines) file rewritten with scrub(): never a byte copy of a file that may name its sources."""
    if lines:
        with open(src) as fi, open(dst, "w") as fo:
            for line in fi:
                if line.strip():
                    fo.write(json.dumps(scrub(json.loads(line), keep)) + "\n")
    else:
        wj(dst, scrub(rj(src), keep))


# ---- sound and video
wav = os.path.join(G, "songs", S, f"{S}.mono.wav")
if not os.path.exists(wav):
    wav = os.path.join(G, "songs", S, f"{S}.wav")
if a.audio:
    wav = os.path.abspath(a.audio)
link(wav, os.path.join(inp, "audio.wav"))
import soundfile as sf
dur = sf.info(wav).duration
fps = None
if hand_on:
    vid = os.path.join(G, "blind", "b2", "video.mp4") if S in NYLON else os.path.join(G, "songs", S, f"{S}.mp4")
    if a.video:
        vid = os.path.abspath(a.video)
    link(vid, os.path.join(inp, "video.mp4"))

# ---- beats
beats = []
BEATS = os.path.abspath(a.beats) if a.beats else os.path.join(EXP, "c-01", "beats.txt")
for line in open(BEATS):
    v = line.split()
    if len(v) >= 2:
        beats.append((float(v[0]), int(float(v[1]))))
with open(os.path.join(inp, "beats.txt"), "w") as fh:
    fh.writelines(f"{t:.3f}\t{b}\n" for t, b in beats)


# ---- candidates
def read_notes(p):
    out = []
    for r in csv.DictReader(open(p)):
        out.append((float(r["onset"]), float(r["offset"]), int(round(float(r["pitch"])))))
    return sorted(out)


TOL = 0.05
cands = []
if a.notes == "l1":
    key = json.load(open(os.path.join(G, "truth", S, f"{S}.truth.json")))   # the one read of a key, l1 only
    for n in sorted(key["notes"], key=lambda n: (n["onset"], n["pitch"])):
        cands.append({"onset": float(n["onset"]), "offset": float(n["offset"]), "pitch": int(n["pitch"]),
                      "sup": ["given"], "base": 1})
    del key
    src_note = "the notes played (onset, offset, pitch), given; no alternatives"
else:
    if a.notes_dir:   # held-out songs: every reading from the notes folder
        ND = os.path.abspath(a.notes_dir)
        BASE_SRC = os.path.join(ND, a.base, "notes.csv")
        ALT_SRC = {m: os.path.join(ND, m, "notes.csv") for m in [x for x in a.alts.split(",") if x]}
        for pth in [BASE_SRC] + list(ALT_SRC.values()):
            if not os.path.exists(pth):
                shutil.rmtree(blind); sys.exit(f"no notes: {pth}")
        if a.base in ALT_SRC:
            shutil.rmtree(blind); sys.exit("the base reading cannot also be an alternative")
        if len({LABELS.get(m, m) for m in ALT_SRC}) != len(ALT_SRC):
            shutil.rmtree(blind); sys.exit("two alternatives share a label")
        base = read_notes(BASE_SRC)
        base_removed = []
        if BASE_FILTER == "hand":   # the hand filter, unchanged (hand_filter.py's own functions)
            sys.path.insert(0, HAND_TOOL)
            import hand_filter
            HT, HW = hand_filter.load_window(os.path.join(HAND_DIR, "hand_window.csv"))
            kept = []
            for nt in base:
                (kept if hand_filter.allowed(nt[2], hand_filter.window_at(HT, HW, nt[0]), a.tuning, a.capo) else base_removed).append(nt)
            base = kept
        models = {LABELS.get(m, m): read_notes(p_) for m, p_ in ALT_SRC.items()}
        bl = a.base_label if a.base_label not in (None, "", "none") else None
        extra = [bl] if bl else []
    else:
        base = read_notes(os.path.join(EXP, "chain-2", "notes.csv"))
        models = {m: read_notes(os.path.join(EXP, f"n-0{i + 1}", "notes.csv")) for i, m in enumerate(MODELS)}
        extra = ["gstem"] if S in NYLON else []   # nylon: the base is guitar-gaps on a separated guitar stem, a reading of its own
    # base notes of one pitch within 50 ms are one candidate
    for on, off, p in base:
        if cands and any(c["pitch"] == p and abs(c["onset"] - on) <= TOL for c in cands[-8:]):
            continue
        cands.append({"onset": on, "offset": off, "pitch": p, "sup": list(extra), "base": 1})
    used = {m: [False] * len(v) for m, v in models.items()}
    for c in cands:
        for m, v in models.items():
            for k, (on, off, p) in enumerate(v):
                if p == c["pitch"] and abs(on - c["onset"]) <= TOL and not used[m][k]:
                    c["sup"].append(m); used[m][k] = True; break
    # the rest: clusters of one pitch within 50 ms across models
    rest = sorted((on, off, p, m) for m, v in models.items() for k, (on, off, p) in enumerate(v) if not used[m][k])
    alts = []
    for on, off, p, m in rest:
        hit = None
        for c in alts[::-1]:
            if on - c["on0"] > 0.2:
                break
            if c["pitch"] == p and abs(on - c["on0"]) <= TOL and m not in c["sup"]:
                hit = c; break
        if hit:
            hit["ons"].append(on); hit["offs"].append(off); hit["sup"].append(m)
        else:
            alts.append({"on0": on, "ons": [on], "offs": [off], "pitch": p, "sup": [m]})
    for c in alts:
        cands.append({"onset": float(np.median(c["ons"])), "offset": float(np.median(c["offs"])), "pitch": c["pitch"],
                      "sup": c["sup"], "base": 0})
    src_note = ("candidates: one note model's reading as the base (base=1), the other models' extra notes as "
                "alternatives (base=0); supporters = the models that hold the note")
cands.sort(key=lambda c: (c["onset"], c["pitch"]))
order = {m: i for i, m in enumerate(["given", "gstem"] + MODELS + ["gpap", "bpr"])}
with open(os.path.join(inp, "candidates.csv"), "w", newline="") as fh:
    w = csv.writer(fh); w.writerow(["id", "onset", "offset", "pitch", "name", "supporters", "n_sup", "base"])
    for i, c in enumerate(cands):
        c["id"] = i + 1
        sup = sorted(set(c["sup"]), key=lambda m: order.get(m, 99))
        w.writerow([c["id"], f"{c['onset']:.4f}", f"{max(c['offset'], c['onset'] + 0.03):.4f}", c["pitch"],
                    name(c["pitch"]), "+".join(sup), len(sup), c["base"]])

# ---- units
mode = a.units or ("gaps" if S in NYLON else "bars")
base_on = np.array([c["onset"] for c in cands if c["base"]])
EARLY = 0.05   # a unit starts 50 ms before its downbeat, so a note detected a hair early stays in its bar


def n_in(t0, t1):
    return int(((base_on >= t0) & (base_on < t1)).sum())


units = []
if mode == "bars":
    downs = [t for t, b in beats if b == 1]
    edges = [0.0] + [max(0.0, t - EARLY) for t in downs[1:]] + [dur]
    bars = [(edges[k], edges[k + 1], [downs[k]] if k < len(downs) else []) for k in range(len(edges) - 1)]
    bars = [b for b in bars if b[1] - b[0] > 0.05]
    k = 0
    while k < len(bars):
        t0, t1, dl = bars[k]
        short = (t1 - t0) < 2.5 or n_in(t0, t1) < 6
        if short and k + 1 < len(bars):
            nt0, nt1, ndl = bars[k + 1]
            units.append({"t0": t0, "t1": nt1, "downbeats": dl + ndl, "bars": 2}); k += 2
        elif short and units and units[-1]["bars"] == 1:
            units[-1]["t1"] = t1; units[-1]["downbeats"] += dl; units[-1]["bars"] = 2; k += 1
        else:
            units.append({"t0": t0, "t1": t1, "downbeats": dl, "bars": 1}); k += 1
else:
    t = 0.0
    while t < dur - 1e-6:
        if dur - t <= 4.0:
            units.append({"t0": t, "t1": dur, "downbeats": [], "bars": 0}); break
        lo, hi = t + 2.0, min(t + 4.0, dur)
        ons = np.sort(base_on[(base_on >= lo - 0.5) & (base_on <= hi + 0.5)])
        best, cut = -1.0, t + 3.0
        for x, y in zip(ons[:-1], ons[1:]):
            mid = (x + y) / 2
            if lo <= mid <= hi and y - x > best:
                best, cut = y - x, (y - min(0.06, (y - x) / 2)) if y - x > 0.25 else mid
        units.append({"t0": t, "t1": cut, "downbeats": [], "bars": 0}); t = cut
for i, u in enumerate(units):
    u["i"] = i
    u["t0"] = round(u["t0"], 4); u["t1"] = round(u["t1"], 4)
    u["cand_ids"] = [c["id"] for c in cands if u["t0"] <= c["onset"] < u["t1"]]
    u["n_base"] = sum(1 for c in cands if c["base"] and u["t0"] <= c["onset"] < u["t1"])
    u["beats"] = [t for t, b in beats if u["t0"] <= t < u["t1"]]
wj(os.path.join(inp, "units.json"), {"mode": mode, "context_s": 0.5, "units": units})

# ---- similar units: chroma of the sound + the candidates' pitches
import librosa
y, sr = librosa.load(wav, sr=22050, mono=True)
hop = 512
C = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
C = C / (np.linalg.norm(C, axis=0, keepdims=True) + 1e-9)
fr = lambda t: int(round(t * sr / hop))
STEPS = 32
prof, pitches = [], []
for u in units:
    seg = C[:, fr(u["t0"]):max(fr(u["t1"]), fr(u["t0"]) + 2)]
    idx = np.linspace(0, seg.shape[1] - 1, STEPS).round().astype(int)
    prof.append(seg[:, idx])
    pitches.append([c["pitch"] for c in cands if c["base"] and u["t0"] <= c["onset"] < u["t1"]])


def mset_j(a_, b_):
    from collections import Counter
    A, B = Counter(a_), Counter(b_)
    inter = sum((A & B).values()); uni = sum((A | B).values())
    return inter / uni if uni else 0.0


sim = []
for i, u in enumerate(units):
    row = []
    for j in range(i):
        ratio = (u["t1"] - u["t0"]) / max(units[j]["t1"] - units[j]["t0"], 1e-6)
        if not 0.7 <= ratio <= 1.43:
            continue
        cs = float(np.mean(np.sum(prof[i] * prof[j], axis=0)))
        ps = mset_j(pitches[i], pitches[j])
        sc = 0.5 * cs + 0.5 * ps
        if sc >= 0.6:
            row.append({"j": j, "score": round(sc, 3), "chroma": round(cs, 3), "pitches": round(ps, 3),
                        "offset_s": round(u["t0"] - units[j]["t0"], 3), "scale": round(ratio, 3)})
    row.sort(key=lambda r: -r["score"])
    sim.append({"i": i, "similar": row[:3]})
wj(os.path.join(inp, "similar.json"), {"how": "0.5 x mean chroma cosine (each unit resampled to 32 steps) + 0.5 x "
                                       "multiset Jaccard of the base candidates' pitches; kept >= 0.6, best 3",
                                       "units": sim})

# ---- the hand
hand = None
if hand_on:
    hd = os.path.join(inp, "hand"); os.makedirs(hd)
    wdir = HAND_DIR; wsrc = os.path.join(wdir, "hand_window.csv")
    link(wsrc, os.path.join(hd, "hand_window.csv"))
    if os.path.exists(os.path.join(wdir, "tips.jsonl")):
        copy_json(os.path.join(wdir, "tips.jsonl"), os.path.join(hd, "tips.jsonl"), lines=True)
    else:
        print("warning: no tips.jsonl in the hand dir: the overlay draws no fingertips", file=sys.stderr)
    anc = a.anchors
    if not anc:
        for cand in [os.path.join(wdir, "anchors.json"), os.path.join(G, "loop", "hand", S, "anchors.json")] + \
                sorted([os.path.join(G, "loop", "e1", S, f) for f in os.listdir(os.path.join(G, "loop", "e1", S))
                        if f.startswith("anchors")] if os.path.isdir(os.path.join(G, "loop", "e1", S)) else [], reverse=True):
            if os.path.exists(cand):
                anc = cand; break
    if not anc:
        shutil.rmtree(blind)
        sys.exit("no anchors.json for this window (beside it, in G/loop/hand/<S>/ or G/loop/e1/<S>/): give --anchors, "
                 "or prepare the run with --window none")
    A = rj(anc)
    for kf in A.get("keyframes", []):
        kf.pop("by", None); kf.pop("note", None)
    A.pop("note", None)
    wj(os.path.join(hd, "anchors.json"), scrub(A, {"video": os.path.join(inp, "video.mp4")}))
    trk = a.track or next((p for p in [os.path.join(wdir, "track.json"), os.path.join(G, "loop", "hand", S, "track.json")]
                           if os.path.exists(p)), None)
    if trk:     # rewritten, not copied: its "video", "anchors" and "landmarks" named the sources (and the slot)
        copy_json(trk, os.path.join(hd, "track.json"), {"video": os.path.join(inp, "video.mp4"),
                                                        "anchors": os.path.join(hd, "anchors.json"), "landmarks": None})
    fps = A.get("fps")
    hand = {"hand_dir": wdir, "window_src": wsrc, "anchors_src": anc, "track_src": trk}

cfg = {"what": "one recording of solo fingerstyle guitar; write its tab as played, one unit at a time",
       "notes": "given" if a.notes == "l1" else "models", "notes_how": src_note,
       "tuning_midi": a.tuning, "tuning_names": [name(p) for p in a.tuning],
       "tuning_given": a.tuning_source == "given", "capo": a.capo, "strings": kind,
       "render_program": 24 if kind == "nylon" else 25, "hand": "window" if hand_on else "off",
       "units": mode, "duration_s": round(dur, 3), "video_fps": fps, "max_fret_from_capo": 20 - a.capo,
       "n_units": len(units), "n_candidates": len(cands)}
wj(os.path.join(inp, "config.json"), cfg)
wj(os.path.join(blind, "state.json"), {"tuning": {"midi": a.tuning, "given": cfg["tuning_given"], "strings": {}},
                                        "shape_book": [], "hand": {}, "model_habits": {}, "player_habits": {},
                                        "repeats": [], "unsure": [], "units_done": 0})
# ---- nothing in the blind folder may name the slot, a song, a player, a key or a source (blindcheck.py: reads the
# song list and the library notes for the names, here only); a hit refuses the run and deletes the folder
import blindcheck
hits = blindcheck.check(blind, extra_slots=blindcheck.heldout_slots(S))
if hits:
    shutil.rmtree(blind)
    for rel, why in hits[:20]:
        print(f"  {rel}: {why}", file=sys.stderr)
    sys.exit(f"prep refused: {len(hits)} thing(s) in the blind folder name what a writer must not see (folder deleted)")
lk = os.path.join(run_dir, "blind")
if os.path.islink(lk) or os.path.exists(lk):
    os.remove(lk)
os.symlink(blind, lk)
wj(os.path.join(run_dir, "run.json"), {"slot": S, "notes": a.notes, "tuning_midi": a.tuning, "tuning_source": a.tuning_source,
                                       "capo": a.capo, "window": HAND_DIR or "none", "hand": hand, "units": mode, "blind_dir": blind,
                                       "n_units": len(units), "n_candidates": len(cands),
                                       "inputs": {"audio": wav, "chain2": os.path.join(EXP, "chain-2", "notes.csv") if a.notes == "l2" and not a.notes_dir else None}})
if a.notes_dir or a.audio or a.video or a.beats or a.strings:   # held-out options: what was read, with SHA-256s (driver side)
    import hashlib
    sha = lambda p_: hashlib.sha256(open(p_, "rb").read()).hexdigest()
    R = rj(os.path.join(run_dir, "run.json"))
    R["inputs"].update({"audio_sha256": sha(wav), "beats": BEATS, "beats_sha256": sha(BEATS), "strings": kind})
    if hand_on:
        R["inputs"].update({"video": vid, "video_sha256": sha(vid)})
    if a.notes_dir:
        if base_removed:
            with open(os.path.join(run_dir, "base_removed.csv"), "w") as fh:
                fh.write("onset,offset,pitch\n"); fh.writelines(f"{x:.6f},{y:.6f},{p_}\n" for x, y, p_ in base_removed)
        R["inputs"].update({"notes_dir": ND, "base": {"model": a.base, "file": BASE_SRC, "sha256": sha(BASE_SRC),
                                                      "label": extra[0] if extra else None, "filter": BASE_FILTER,
                                                      "kept": len(base), "removed": len(base_removed)},
                            "alts": {m: {"label": LABELS.get(m, m), "file": p_, "sha256": sha(p_)} for m, p_ in ALT_SRC.items()}})
    wj(os.path.join(run_dir, "run.json"), R)
# ---- no file of the blind folder may share its inode with another file (a hard link)
bad = [os.path.join(dp, f) for dp, _, fs in os.walk(blind) for f in fs if os.lstat(os.path.join(dp, f)).st_nlink != 1
       or os.path.islink(os.path.join(dp, f))]
if bad:
    sys.exit(f"hard or symbolic links in the blind folder: {bad[:5]}")
print(json.dumps({"blind": blind, "units": len(units), "candidates": len(cands),
                  "base": int(sum(c["base"] for c in cands)), "mode": mode, "hand": cfg["hand"]}))
