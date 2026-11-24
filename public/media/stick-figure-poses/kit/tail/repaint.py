"""Rerun kit, part 2 of https://aaronorelup.com/ledger/stick-figure-poses/ : which repaint strength to keep.
After score.py has scored the tail-chain still and its repaints into one scores.json:
  python repaint.py scores.json pose1 BASE REPAINT [REPAINT ...]
  e.g. python repaint.py scores.json pose1 tail d035 d050 d065   (keys pose1_tail, pose1_d035, ...)
For each repaint: the change in limb error from the still, on the limbs found in both (score.py's per_limb, degrees;
positive = further from the stick figure). The rule: keep the strongest repaint whose change is 3 degrees or less; one
where OpenPose found no person, or fewer than 4 limbs in common, is out. Give the repaints weakest first.
The post's changes, 0.35 / 0.50 / 0.65: sit +0.7 / +0.6 / +3.9 (kept 0.50), jump +1.8 / +0.8 / +0.9 (0.65),
skid +11.4 / +0.1 / +11.2 (0.50), lift -3.3 / -2.0 / no person (0.50).
"""
import sys, json

LIMIT = 3.0

if __name__ == "__main__":
    S = json.load(open(sys.argv[1])); pose, base, reps = sys.argv[2], sys.argv[3], sys.argv[4:]
    b = (S.get(f"{pose}_{base}") or {}).get("per_limb") or {}
    keep = None
    for r in reps:
        pl = (S.get(f"{pose}_{r}") or {}).get("per_limb") or {}
        common = sorted(set(b) & set(pl))
        if len(common) < 4:
            print(f"{r}: out ({len(common)} limbs in common)"); continue
        change = sum(pl[l] - b[l] for l in common) / len(common)
        ok = change <= LIMIT
        print(f"{r}: {change:+.1f} deg on {len(common)} common limbs" + ("" if ok else "  over the limit"))
        if ok:
            keep = r
    print("keep:", keep or f"none: use {base}")
