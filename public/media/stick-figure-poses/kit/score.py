"""CNDY-038 step 5: score each render's OpenPose skeleton against its target (and, as the null, the other three).
Rules fixed before any render was scored:
- joints count only at confidence >= 0.6; biggest detected person; body joints 0-13 only.
- limbs scored: 8 limb segments (upper arms, forearms, thighs, shins) + torso (neck -> mid-hip, or the one hip
  found) + head (neck -> nose) = 10. A limb counts when both its ends are found.
- primary: mean absolute limb-angle error (deg). OpenPose's left/right labels are ambiguous on a profile or a
  back view, so each render is scored as labelled and with r_/l_ swapped, and the lower mean is kept (both stored).
- PCK@0.2 torso: after a least-squares translation + uniform scale fit of the found joints onto the target
  (shape, not placement), a joint is right within 0.2 x the target torso (neck to mid-hip, 222 px = 44 px).
  Denominator 14: a joint not found counts as a miss. Raw (unaligned) PCK stored too.
- a render with fewer than 4 scored limbs is 'unscored'.
- stick-line check: share of pixels that are saturated and not red (the skeleton's greens, blues, yellows,
  purples); Jefrie's palette is grey + red, so a painted skeleton shows up here.
Usage: python score.py OUT.json IMG:pose:arm [...]
"""
import os, sys, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from pose import detect, BODY14

HERE = os.path.dirname(os.path.abspath(__file__))
T = json.load(open(os.path.join(HERE, "targets.json")))["poses"]
SEGS = [("r_shoulder", "r_elbow"), ("r_elbow", "r_wrist"), ("l_shoulder", "l_elbow"), ("l_elbow", "l_wrist"),
        ("r_hip", "r_knee"), ("r_knee", "r_ankle"), ("l_hip", "l_knee"), ("l_knee", "l_ankle")]
CONF = 0.6

def found(kp):
    return {n: kp[n][:2] for n in BODY14 if kp.get(n) and (len(kp[n]) < 3 or kp[n][2] >= CONF)}

def swap(k):
    out = {}
    for n, v in k.items():
        m = "l_" + n[2:] if n.startswith("r_") else ("r_" + n[2:] if n.startswith("l_") else n)
        out[m] = v
    return out

def limbs(k):
    """name -> angle (deg) for every scoreable limb in joint dict k"""
    out = {}
    for a, b in SEGS:
        if a in k and b in k:
            out[f"{a}>{b}"] = math.degrees(math.atan2(k[b][1] - k[a][1], k[b][0] - k[a][0]))
    if "neck" in k:
        hips = [k[h] for h in ("r_hip", "l_hip") if h in k]
        if hips:
            m = np.mean(hips, axis=0); out["torso"] = math.degrees(math.atan2(m[1] - k["neck"][1], m[0] - k["neck"][0]))
        if "nose" in k:
            out["head"] = math.degrees(math.atan2(k["nose"][1] - k["neck"][1], k["nose"][0] - k["neck"][0]))
    return out

def adiff(a, b):
    d = abs(a - b) % 360; return min(d, 360 - d)

def angle_err(out_k, tgt_k):
    lo, lt = limbs(out_k), limbs(tgt_k)
    errs = {n: adiff(lo[n], lt[n]) for n in lo if n in lt}
    return (float(np.mean(list(errs.values()))) if errs else None), errs

def pck(out_k, tgt_k, aligned=True):
    tgt_torso = math.dist(tgt_k["neck"], np.mean([tgt_k["r_hip"], tgt_k["l_hip"]], axis=0))
    thr = 0.2 * tgt_torso
    common = [n for n in BODY14 if n in out_k and n in tgt_k]
    if len(common) < 3:
        return 0.0, 0
    P = np.array([out_k[n] for n in common], float); Q = np.array([tgt_k[n] for n in common], float)
    if aligned:
        Pm, Qm = P.mean(0), Q.mean(0); Pc, Qc = P - Pm, Q - Qm
        s = (Pc * Qc).sum() / max((Pc * Pc).sum(), 1e-9)
        P = Pc * s + Qm
    hits = int((np.linalg.norm(P - Q, axis=1) <= thr).sum())
    return hits / 14.0, hits

def swap_part(k, part):
    """swap r_/l_ only for the arm joints ('arms') or only for the leg joints ('legs')"""
    names = ("shoulder", "elbow", "wrist") if part == "arms" else ("hip", "knee", "ankle")
    out = dict(k)
    for nm in names:
        r, l = k.get("r_" + nm), k.get("l_" + nm)
        out.pop("r_" + nm, None); out.pop("l_" + nm, None)
        if r is not None: out["l_" + nm] = r
        if l is not None: out["r_" + nm] = l
    return out

LABELLINGS = {"as labelled": lambda k: k, "all swapped": swap,
              "arms swapped": lambda k: swap_part(k, "arms"), "legs swapped": lambda k: swap_part(k, "legs")}

def best_of_swap(out_k, tgt_k):
    """Amended after the gate render (pose1 B, before the batch): OpenPose's left/right labels are chosen per
    limb pair, so a front-facing render of a profile target got its arms and legs labelled from opposite sides.
    Primary = the best of 4 labellings (as labelled / all / arms only / legs only swapped).
    Returns (err, per_limb, labelling, err_whole_body_rule) - the last is the pre-registered whole-body rule."""
    best = None; errs = {}
    for name, f in LABELLINGS.items():
        e, d = angle_err(f(out_k), tgt_k); errs[name] = e
        if e is not None and (best is None or e < best[0]):
            best = (e, d, name)
    pre = min([v for v in (errs["as labelled"], errs["all swapped"]) if v is not None], default=None)
    if best is None:
        return None, {}, "as labelled", pre
    return best[0], best[1], best[2], pre

def stick_share(path):
    im = cv2.imread(path); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0].astype(int), hsv[..., 1], hsv[..., 2]
    sat = (s > 140) & (v > 110)
    red = (h <= 12) | (h >= 165)
    return float((sat & ~red).mean())

def score(path, pose):
    people, W, H = detect(path)
    res = {"file": os.path.basename(path), "pose": pose, "people": len(people), "stick_share": round(stick_share(path), 5)}
    if not people:
        res.update(status="no person"); return res
    k = found(people[0]["kp"])
    res["joints_found"] = len(k); res["joints"] = {n: [round(v[0]), round(v[1])] for n, v in k.items()}
    res["raw_kp"] = people[0]["kp"]
    tgt = found(T[pose])
    e, per, lab, e_pre = best_of_swap(k, tgt)
    kk = LABELLINGS[lab](k)
    res.update(angle_err=None if e is None else round(e, 1), limbs_scored=len(per), labelling=lab,
               angle_err_prereg=None if e_pre is None else round(e_pre, 1),
               per_limb={n: round(v, 1) for n, v in per.items()})
    res["pck_aligned"], res["pck_hits"] = pck(kk, tgt, True)
    res["pck_raw"], _ = pck(kk, tgt, False)
    res["status"] = "scored" if len(per) >= 4 else "unscored"
    null = {}
    for other in T:
        if other == pose:
            continue
        eo, po, _, _ = best_of_swap(k, found(T[other]))
        null[other] = None if eo is None else round(eo, 1)
    res["null"] = null
    vals = [v for v in null.values() if v is not None]
    res["null_mean"] = round(float(np.mean(vals)), 1) if vals else None
    res["beats_all_null"] = bool(e is not None and vals and e < min(vals))
    return res

if __name__ == "__main__":
    out = sys.argv[1]; rows = json.load(open(out)) if os.path.exists(out) else {}
    for spec in sys.argv[2:]:
        path, pose, arm = spec.rsplit(":", 2)
        r = score(path, pose); r["arm"] = arm; rows[f"{pose}_{arm}"] = r
        print(f"{pose} {arm}: {r['status']} joints {r.get('joints_found')} limbs {r.get('limbs_scored')} "
              f"err {r.get('angle_err')} ({r.get('labelling')}; prereg {r.get('angle_err_prereg')}) PCK {r.get('pck_aligned', 0):.2f} raw {r.get('pck_raw', 0):.2f} "
              f"null {r.get('null_mean')} beats {r.get('beats_all_null')} stick {r['stick_share']:.4f}")
    json.dump(rows, open(out, "w"), indent=1)
