"""Where on R3a did each hand detection land? Counts per shot against hand-set regions (full-frame pixels).

usage: python hand_regions.py <tool jsonl> [<tool jsonl> ...]
A detection's position is the centre of the box around its 21 points (`lm_px_full` or `kp_px_full`).
Regions were read off gridded frames 100 (medium shot) and 300 (wide shot) by eye; see trials.md.
In the wide shot the picking hand is behind the music stand, so only the fretting-hand region is defined there.
"""
import json
import sys

REGIONS = {
    "medium": {"fretting": (340, 160, 410, 260), "picking": (280, 245, 360, 320)},
    "wide": {"fretting": (330, 150, 450, 235)},
    "close": {},
}


def where(shot, cx, cy):
    for name, (x0, y0, x1, y1) in REGIONS.get(shot, {}).items():
        if x0 <= cx <= x1 and y0 <= cy <= y1:
            return name
    return "elsewhere"


for path in sys.argv[1:]:
    counts = {}
    frames_with = {}
    for line in open(path):
        r = json.loads(line)
        seen = set()
        for h in r["hands"]:
            pts = h.get("lm_px_full") or h.get("kp_px_full")
            if not pts:
                continue
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
            w = where(r["shot"], cx, cy)
            key = (r["shot"], w, h.get("label"))
            counts[key] = counts.get(key, 0) + 1
            seen.add((r["shot"], w))
        for k in seen:
            frames_with[k] = frames_with.get(k, 0) + 1
    print(path)
    for k in sorted(counts, key=str):
        print("  detections", k, counts[k])
    for k in sorted(frames_with, key=str):
        print("  frames with >=1 detection in", k, frames_with[k])
