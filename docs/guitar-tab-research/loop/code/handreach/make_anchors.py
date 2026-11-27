#!/usr/bin/env python3
"""make_anchors.py <anchors.json> --video V --capo N --kind steel|nylon --add <candidates.json> <names>
   [--snap] [--landmarks lm.jsonl] [--by WHO] [--note TEXT] [--shot t0,t1] [--dry-run]
Adds a keyframe to an anchors file (created if missing) from a wire_candidates.py file and names like "U=0,T=1,S=2,Q=4"
(letter = wire number counted from the NUT; the nut itself is 0; with a capo on fret N the capo sits on wire N).
A keyframe already in the file at the same time is replaced.
Prints (1) the fit's residual per named wire (pixels): a named wire far off the 12-TET model means a wrong name or a
false candidate; (2) the keyframe check: the wire detector run on the fitted board, each candidate's distance to the
nearest modelled wire as a share of the fret spacing (median well under 0.1 is a good keyframe; 0.25 is chance).
--snap: after the fit, wires the detector finds within 0.2 of a spacing of a modelled wire are added to the keyframe
(growing outwards from the named wires, 3 wires a round), and the board refitted; the check is printed before and after,
and the snapped wires are kept only if the check improves. Named wires always stay. --landmarks leaves candidates
under a hand out of the check and the snap. --dry-run prints everything and writes nothing."""
import argparse, json, os, sys
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neck import fit, to_image
from track_check import check_frame, _stats, snap_grow

ap = argparse.ArgumentParser()
ap.add_argument("anchors"); ap.add_argument("--video", required=True); ap.add_argument("--capo", type=int, required=True)
ap.add_argument("--kind", default="steel"); ap.add_argument("--add", nargs=2, required=True, metavar=("CAND", "NAMES"))
ap.add_argument("--by", default=""); ap.add_argument("--note", default=""); ap.add_argument("--shot", default=None)
ap.add_argument("--snap", action="store_true"); ap.add_argument("--landmarks", default=None)
ap.add_argument("--dry-run", action="store_true")
a = ap.parse_args()
A = json.load(open(a.anchors)) if os.path.exists(a.anchors) else {"video": a.video, "capo": a.capo, "board": {"kind": a.kind}, "keyframes": [], "shots": []}
kind = A["board"]["kind"]
C = json.load(open(a.add[0])); byid = {c["id"]: c for c in C["candidates"]}
wires = []
for pair in a.add[1].split(","):
    k, v = pair.split("=")
    c = byid[k.strip()]
    wires.append({"k": int(v), "a": c["a"], "b": c["b"], "cand": k.strip()})
if len({w["k"] for w in wires}) < 2:
    sys.exit("name at least two different wires (better: four or more, far apart)")
Hm = fit(wires, kind)
print("residuals (px, wire end a / b):")
for w in wires:
    p = to_image(Hm, [w["k"], w["k"]], [0.0, 1.0], kind)
    print(f"  {w['cand']}={w['k']}: {np.hypot(*(p[0] - w['a'])):.1f} / {np.hypot(*(p[1] - w['b'])):.1f}")
cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS)
cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(C["t"] * fps))); ok, img = cap.read()
if not ok: sys.exit("cannot read the frame")
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
hm = None
if a.landmarks:
    from lmhands import Hands
    hm = Hands(a.landmarks).mask(C["t"], g.shape)


def report(label, H):
    r = check_frame(g, H, kind, hm)
    if r is None:
        print(f"keyframe check ({label}): the board is not inside the frame"); return None
    s = _stats(r["cands"])
    if s["n"]:
        print(f"keyframe check ({label}): {s['n']} candidates on frets {r['range'][0]:.1f}..{r['range'][1]:.1f}, median {s['median_px']} px = "
              f"{s['median_share']:.3f} of a spacing, p90 {s['p90_share']:.3f}, within 1/3: {s['within_third']:.2f}; at the board edges median {s['median_edge']:.3f}")
    else:
        print(f"keyframe check ({label}): no candidates")
    return s


s0 = report("named wires", Hm)
final = wires
if a.snap and s0 and s0.get("n"):
    cur = snap_grow(g, [{"k": w["k"], "a": w["a"], "b": w["b"]} for w in wires], kind, hm)
    for w in cur:
        w["cand"] = "snap" if w.get("snap") else next((x["cand"] for x in wires if x["k"] == w["k"]), "?")
    H1 = fit(cur, kind)
    s1 = report(f"after snapping {len(cur) - len(wires)} more wires", H1)
    if s1 and s1.get("n") and s1["median_share"] <= s0["median_share"]:
        final = cur
        print("snapped wires kept:", sorted(w["k"] for w in cur if w["cand"] == "snap"))
    else:
        print("snapped wires NOT kept (the check did not improve)")
kf = {"t": C["t"], "wires": [dict({"k": w["k"], "a": w["a"], "b": w["b"]}, **({"snap": True} if w["cand"] == "snap" else {})) for w in final],
      "by": a.by, "note": a.note, "from": os.path.basename(a.add[0]), "names": a.add[1]}
old = [k for k in A["keyframes"] if abs(k["t"] - C["t"]) < 1e-3]
A["keyframes"] = [k for k in A["keyframes"] if abs(k["t"] - C["t"]) >= 1e-3] + [kf]
A["keyframes"].sort(key=lambda k: k["t"])
if a.shot:
    A["shots"].append([float(x) for x in a.shot.split(",")])
if a.dry_run:
    print("dry run: nothing written")
else:
    json.dump(A, open(a.anchors, "w"), indent=1)
    print(("replaced the keyframe at %.2f s; " % C["t"] if old else "") + "keyframes:", len(A["keyframes"]), [k["t"] for k in A["keyframes"]])
