"""Chain D glue: join a hand-landmark stream (MediaPipe, one record per video frame) with a note-onset stream
(Basic Pitch note events, continuous seconds) and map fretting-hand fingertips to fretboard cells.

usage: python chainD_join.py <clip> <mediapipe jsonl> <notes csv> <handoff json> <out json>
  <handoff json>: the video lane's handoff_fingertip_to_cell.py output for one frame of this clip (homography of the
                  hand-set neck quad, rectified size, 12-TET model fret positions x_0..x_19).
Assumptions (stated, not checked): the audio's t = 0 is the video's frame 0 (both streams of the excerpt start at
0.000 s in ffprobe); frame n is at n / fps; the neck quad and fret model of the one handoff frame hold for every frame
(fixed camera, guitar assumed not to move); the fretting hand is MediaPipe's "Left" detection (the video lane's reading
of these clips); string cell = one of 6 equal lanes across the rectified width, string 6 at the upper edge (the
video lane's assumption); fret cell n = the model frets n-1 <= u < n; standard tuning without capo for the pitch check.
Counts written: onsets; onsets with a frame within 20 ms; of those, onsets whose frame has a fretting-hand detection;
onsets with at least one of the four fingertips (index, middle, ring, pinky) inside the rectified fretboard and on a
fret cell 1..19; and a cross check of each such note's pitch against the cells (open string, or a fingertip cell whose
standard-tuning pitch equals the note's pitch).
"""
import csv, json, sys
import numpy as np

clip, mpj, notes_csv, handoff, outp = sys.argv[1:6]
FPS = 25.0
TUNING = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}
TIPS = {"index": 8, "middle": 12, "ring": 16, "pinky": 20, "thumb": 4}
recs = [json.loads(l) for l in open(mpj)]
by_n = {r["n"]: r for r in recs}
h = json.load(open(handoff))
H = np.array(h["homography_img_to_rect"], dtype=np.float64)
RW, RH = h["rect_size"]
mx = h["fret_model_x_0_to_19"]
notes = []
with open(notes_csv) as f:
    r = csv.reader(f); next(r)
    for row in r:
        notes.append((float(row[0]), float(row[1]), int(row[2])))
notes.sort()


def to_uv(px):
    p = H @ np.array([px[0], px[1], 1.0])
    return p[0] / p[2], p[1] / p[2]


def cell(u, v):
    if not (0 <= v <= RH) or u < mx[0] or u >= mx[-1]:
        return None
    fret = next(n for n in range(1, len(mx)) if u < mx[n])
    lane = int(min(max(v / (RH / 6), 0), 5))
    return (6 - lane, fret)


frame_stats = {"frames": len(recs), "frames_with_left": 0, "frames_with_a_tip_cell": 0}
frame_cells = {}
for rec in recs:
    left = [x for x in rec["hands"] if x["label"] == "Left"]
    if not left:
        continue
    frame_stats["frames_with_left"] += 1
    hand = max(left, key=lambda x: x["score"])
    cells = {}
    for k, i in TIPS.items():
        u, v = to_uv(hand["lm_px_full"][i])
        cells[k] = {"uv": [round(u, 1), round(v, 1)], "cell": cell(u, v)}
    frame_cells[rec["n"]] = cells
    if any(c["cell"] for k, c in cells.items() if k != "thumb"):
        frame_stats["frames_with_a_tip_cell"] += 1

out_notes = []
cnt = {"onsets": len(notes), "onsets_with_frame_within_20ms": 0, "onsets_with_fretting_hand_in_that_frame": 0,
       "onsets_with_a_fingertip_cell": 0, "fingertip_cells_per_onset": {}, "pitch_is_open_string": 0,
       "pitch_equals_a_fingertip_cell": 0, "pitch_open_or_fingertip_cell": 0, "pitch_neither": 0}
dts = []
for on, off, p in notes:
    n = int(round(on * FPS)); dt = on - n / FPS
    rec = {"onset": round(on, 4), "pitch": p, "frame": n, "dt_ms": round(dt * 1000, 2)}
    if n in by_n and abs(dt) <= 0.020 + 1e-9:
        cnt["onsets_with_frame_within_20ms"] += 1; dts.append(abs(dt))
        if n in frame_cells:
            cnt["onsets_with_fretting_hand_in_that_frame"] += 1
            tips = {k: c["cell"] for k, c in frame_cells[n].items() if k != "thumb" and c["cell"]}
            rec["tip_cells"] = {k: list(v) for k, v in tips.items()}
            if tips:
                cnt["onsets_with_a_fingertip_cell"] += 1
                kk = str(len(set(tips.values())))
                cnt["fingertip_cells_per_onset"][kk] = cnt["fingertip_cells_per_onset"].get(kk, 0) + 1
                is_open = p in TUNING.values()
                on_tip = any(TUNING[s] + f == p for s, f in tips.values())
                cnt["pitch_is_open_string"] += is_open
                cnt["pitch_equals_a_fingertip_cell"] += on_tip
                cnt["pitch_open_or_fingertip_cell"] += (is_open or on_tip)
                cnt["pitch_neither"] += not (is_open or on_tip)
                rec["pitch_open"] = is_open; rec["pitch_on_tip_cell"] = on_tip
    out_notes.append(rec)
res = {"clip": clip, "mediapipe_jsonl": mpj, "notes_csv": notes_csv, "handoff_json": handoff, "fps": FPS,
       "video_frames": len(recs), "frame_times": "n / 25 s (t_s field of the jsonl)",
       "onset_times": "Basic Pitch note events, seconds (model frame hop 256 / 22050 Hz = 11.6 ms)",
       "abs_dt_to_nearest_frame_ms": {"median": round(float(np.median(dts)) * 1000, 2), "max": round(float(np.max(dts)) * 1000, 2)} if dts else None,
       "frame_stats": frame_stats, "counts": cnt, "notes": out_notes}
json.dump(res, open(outp, "w"), indent=0)
print(json.dumps({k: res[k] for k in ("clip", "video_frames", "abs_dt_to_nearest_frame_ms", "frame_stats", "counts")}))
