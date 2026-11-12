"""Gap round 2, gaps V1 and V2 (GAPS.md, video-hands-fretboard): edit tools.json in place.

V1: WiLoR and Grounding DINO get tried=false (no output from either); their attempt records stay in runs[].
V2: every runs[].run_id becomes a bare ledger id (or null when no ledger run exists); the grouped-job step name
    moves into a new field "step" ("<group>/<step name as in the group's .steps.times.tsv>"), and the free text
    that sat in run_id ("verifier re-run", "not mirrored", "first attempt") moves into a new field "note".
    Groups (trials.md, "Grouped jobs" and verification log): C1 = r0408, B1 = r0448, V1 = r0495, V2 = r0497.
    Entries that covered several steps or ledger runs are split, one entry per step or run, with wall time,
    peak memory and exit code taken from the step's times.tsv row or the ledger line.
    Missing exit codes, wall times and peak memory of the other entries are filled from the same sources.

Usage: python3 fix_tools_json_g1_g2.py <tools.json> <samples dir> <ledger runs.jsonl>
"""
import copy
import json
import re
import sys

TOOLS, SAMPLES, LEDGER = sys.argv[1:4]
GROUP_ID = {"C1": "r0408", "B1": "r0448", "V1": "r0495", "V2": "r0497"}


def read_tsv(path):
    rows = {}
    with open(path) as fh:
        head = fh.readline().rstrip("\n").split("\t")
        for line in fh:
            vals = line.rstrip("\n").split("\t")
            rec = dict(zip(head, vals))
            rows[rec["step"]] = rec
    return rows


STEPS = {
    "C1": read_tsv(f"{SAMPLES}/steps/C1.steps.times.tsv"),
    "B1": read_tsv(f"{SAMPLES}/steps/B1.steps.times.tsv"),
    "V1": read_tsv(f"{SAMPLES}/verify-trials/V1.steps.times.tsv"),
    "V2": read_tsv(f"{SAMPLES}/verify-trials/V2.steps.times.tsv"),
}
LED = {}
with open(LEDGER) as fh:
    for line in fh:
        r = json.loads(line)
        LED[r["id"]] = r


def group_of(step):
    hits = [g for g in ("C1", "B1") if step in STEPS[g]]
    assert len(hits) == 1, (step, hits)
    return hits[0]


def from_step(run, group, step, note=None):
    """Fill a run from the step's times.tsv row. Wall, CPU and peak are kept if already set (same numbers)."""
    row = STEPS[group][step]
    out = copy.deepcopy(run)
    out["run_id"] = GROUP_ID[group]
    out["step"] = f"{group}/{step}"
    out["note"] = note
    out["cores"] = 2
    out["exit_code"] = int(row["exit"])
    wall = float(row["wall_s"])
    mib = round(int(row["max_rss_kb"]) / 1024, 1)
    cpu = round(float(row["user_s"]) + float(row["sys_s"]), 2)
    if out.get("wall_s") is None:
        out["wall_s"] = wall
    else:
        assert abs(out["wall_s"] - wall) < 0.006, (step, out["wall_s"], wall)
    m = out.setdefault("metrics", {})
    if out.get("peak_mb") is None:
        out["peak_mb"] = mib
        m["peak_unit"] = "MiB"
    else:
        if m.get("peak_unit") == "MB (8,813,832 kB, 8.4 GiB)":  # CoTracker3 step: 8813832 kB / 1024 = 8607.3 MiB
            m["peak_unit"] = "MiB (8,813,832 kB, 8.4 GiB)"
        assert m.get("peak_unit", "").startswith("MiB") and abs(out["peak_mb"] - mib) < 0.06, (step, out["peak_mb"], mib)
    if m.get("cpu_s") is None:
        m["cpu_s"] = cpu
    return out


def from_ledger(run, rid, note=None, keep_wall=False):
    led = LED[rid]
    assert led["lane"] == "video-hands-fretboard", rid
    out = copy.deepcopy(run)
    out["run_id"] = rid
    out["step"] = None
    out["note"] = note
    out["exit_code"] = led["exit_code"]
    if not keep_wall:
        if out.get("wall_s") is None:
            out["wall_s"] = led["wall_s"]
        else:
            assert abs(out["wall_s"] - led["wall_s"]) < 0.006, (rid, out["wall_s"], led["wall_s"])
        if out.get("peak_mb") is None:
            out["peak_mb"] = led["max_rss_mb"]
            out.setdefault("metrics", {})["peak_unit"] = "MB"
        if out.get("cores") is None and led.get("cores"):
            out["cores"] = len(led["cores"])
    return out


d = json.load(open(TOOLS))
tools = d["tools"]
by_name = {t["name"]: t for t in tools}

# ---- V1: tried=false for WiLoR and Grounding DINO -------------------------------------------------------
for name, how in (("WiLoR (hand detector + 3D MANO hand mesh)", "local-cpu"),
                  ("Grounding DINO (IDEA Research; tiny in transformers)", "public-space")):
    t = by_name[name]
    assert t["tried"] is True and t["tried_how"] == how
    t["tried"] = False
    t["tried_how"] = None
    t["not_run_reason"] = (t["not_run_reason"] + f" (gap round 2: tried set to false because no attempt gave output;"
                           f" the attempts, made as '{how}', stay in runs[].)")

# ---- V2: run ids -------------------------------------------------------------------------------------------
new_tools = []
for t in tools:
    runs = t.get("runs") or []
    new_runs = []
    for r in runs:
        rid = r.get("run_id")
        if rid is None:
            r = dict(r)
            r["step"] = None
            r["note"] = "attempt outside gtr-run: no ledger entry"
            new_runs.append(r)
            continue
        if re.fullmatch(r"r\d{4}", rid):
            rr = from_ledger(r, rid, keep_wall=(rid in ("r0193",) and "Grounding DINO" in t["name"]))
            new_runs.append(rr)
            continue
        m = re.fullmatch(r"r0408 step (\S+)", rid)
        if m:
            new_runs.append(from_step(r, "C1", m.group(1)))
            continue
        m = re.fullmatch(r"C1 step (\S+)", rid)
        if m:
            new_runs.append(from_step(r, "C1", m.group(1)))
            continue
        m = re.fullmatch(r"B1/C1 step (\S+)", rid)
        if m:
            new_runs.append(from_step(r, group_of(m.group(1)), m.group(1)))
            continue
        m = re.fullmatch(r"B1 \(r0448\) step (\S+)", rid)
        if m:
            new_runs.append(from_step(r, "B1", m.group(1)))
            continue
        m = re.fullmatch(r"B1 step (\S+)", rid)
        if m:
            new_runs.append(from_step(r, "B1", m.group(1)))
            continue
        if rid == "B1 step yoloe-26s_openvocab (first attempt)":
            rr = from_step(r, "B1", "yoloe-26s_openvocab", note="first attempt")
            rr["metrics"]["error"] = rr["metrics"]["error"].replace(
                "; exit code not stated in the reports", "; exit code 1 (B1.steps.times.tsv)")
            new_runs.append(rr)
            continue
        if rid == "C1 steps rtmlib-hand_R3b_full and rtmlib-hand_R3c_full (first attempts)":
            for step, inp in (("rtmlib-hand_R3b_full", "R3b"), ("rtmlib-hand_R3c_full", "R3c")):
                rr = from_step(r, "C1", step, note="first attempt")
                rr["input_id"] = inp
                new_runs.append(rr)
            continue
        if rid == "r0336 (not mirrored)":
            new_runs.append(from_ledger(r, "r0336", note="left-hand crops not mirrored"))
            continue
        if rid == "r0193 (Grounding DINO calls)":
            rr = from_ledger(r, "r0193", note="the Grounding DINO calls of job r0193 (the same job also called"
                             " the OWLv2 Space); the job exited 0 while all three Grounding DINO calls failed",
                             keep_wall=True)
            new_runs.append(rr)
            continue
        if rid == "r0488 (verifier re-run)":
            keep = "Grounding DINO" in t["name"]
            note = "verifier re-run" + ("; the job exited 0 while the Grounding DINO calls failed again" if keep else "")
            new_runs.append(from_ledger(r, "r0488", note=note, keep_wall=keep))
            continue
        if rid == "r0482-r0486 (verifier re-runs)":
            what = {
                "r0482": ("R3a_cu frames 150, 0, 280 (re-run of r0149)", "per-frame JSON identical to r0149 except timings"),
                "r0483": ("R3b frames 225, 0, 449 (re-run of r0214)", "per-frame JSON identical to r0214 except timings"),
                "r0484": ("R3a_cu frame 150 with the SAM 2.1 quad (re-run of r0400)", "per-frame JSON identical to r0400 except timings"),
                "r0485": ("R3a_cu frame 150 handoff (re-run of r0218)", "JSON identical to r0218 (same fits, model frets and cells)"),
                "r0486": ("R3b frame 225 handoff (re-run of r0402)", "JSON identical to r0402 (same fits, model frets and cells)"),
            }
            for k, (inp, note) in what.items():
                rr = from_ledger({"run_id": k, "input_id": inp, "cores": None, "wall_s": None, "peak_mb": None,
                                  "exit_code": None, "output_files": [],
                                  "metrics": {"nolock": "--nolock", "note": note}}, k, note="verifier re-run")
                new_runs.append(rr)
            continue
        # verifier groups V1 / V2
        vmap = {
            ("MediaPipe Hand Landmarker (Tasks API)", "r0495 steps (verifier re-run)"): None,  # split below
            ("MediaPipe Holistic Landmarker (Tasks API)", "r0495 steps (verifier re-run)"): None,  # split below
            ("MediaPipe Pose Landmarker (heavy)", "r0495 step (verifier re-run)"): ("V1", "verify-mediapipe-pose_R3a_full"),
            ("MediaPipe legacy solutions Hands API (Python)", "r0495 step (verifier re-run, R3a_cu full)"): ("V1", "verify-mediapipe-legacy_R3a_cu_full"),
            ("rtmlib (RTMPose hand: RTMDet-nano + RTMPose-m Hand5)", "V1 (r0495) step Hand on R3a full (verifier re-run)"): ("V1", "verify-rtmlib-hand_R3a_full"),
            ("DWPose (whole-body 133 keypoints, DWPose-l via rtmlib)", "V1 (r0495) step DWPose-l on R3a_cu every 5th frame (verifier re-run)"): ("V1", "verify-rtmlib-dwpose_R3a_cu_full_step5"),
            ("Ultralytics YOLO26 pose (yolo26n-pose, yolo26s-pose)", "V1 (r0495) step yolo26n-pose on R3a_cu (verifier re-run)"): ("V1", "verify-yolo-pose_yolo26n-pose_R3a_cu_full"),
            ("pytorch-openpose hand model (PyTorch port of OpenPose's 21-keypoint hand network)", "V2 (r0497) step openpose-hand R3a_cu every 30th mirrored (verifier re-run)"): ("V2", "verify-openpose-hand_R3a_cu_every30_mirrorleft"),
            ("Segment Anything 2.1 (sam2.1_t tiny via Ultralytics SAM / SAM2VideoPredictor)", "V2 (r0497) image mode only (verifier re-run)"): ("V2", "verify-sam2.1-tiny_image_mode_only"),
            ("CoTracker3 (offline model)", "V2 (r0497) CoTracker3 (verifier re-run)"): ("V2", "verify-cotracker3-offline_R3a_cu_f150_90"),
            ("YOLOE-26 (yoloe-26s-seg in Ultralytics)", "V1 (r0495) step YOLOE-26s (verifier re-run)"): ("V1", "verify-yoloe-26s_openvocab"),
        }
        key = (t["name"], rid)
        assert key in vmap, key
        if vmap[key] is not None:
            g, step = vmap[key]
            new_runs.append(from_step(r, g, step, note="verifier re-run"))
            continue
        if t["name"].startswith("MediaPipe Hand Landmarker"):
            a = copy.deepcopy(r)
            a["input_id"] = "R3a_cu (full)"
            a["metrics"] = {"note": "output records identical to r0078 apart from timing; per-frame inference mean 24.79 ms",
                            "landmarks_compared": "6,300"}
            b = copy.deepcopy(r)
            b["input_id"] = "R3a (full)"
            b["metrics"] = {"note": "output records identical to r0071 apart from timing; per-frame inference mean 27.63 ms",
                            "landmarks_compared": "17,031"}
            new_runs.append(from_step(a, "V1", "verify-mediapipe-hands_R3a_cu_full", note="verifier re-run"))
            new_runs.append(from_step(b, "V1", "verify-mediapipe-hands_R3a_full", note="verifier re-run"))
            continue
        if t["name"].startswith("MediaPipe Holistic"):
            a = copy.deepcopy(r)
            a["input_id"] = "R3a_cu (full)"
            a["metrics"] = {"note": "every hand landmark equal to the trial's"}
            b = copy.deepcopy(r)
            b["input_id"] = "R3a (3x crop)"
            b["metrics"] = {"note": "failed again at frame 218 with the same RET_CHECK failure (660 vs. 720), exit 1, "
                                    "after 218 frames whose hand landmarks equal the trial's"}
            new_runs.append(from_step(a, "V1", "verify-mediapipe-holistic_R3a_cu_full", note="verifier re-run"))
            new_runs.append(from_step(b, "V1", "verify-mediapipe-holistic_R3a_crop", note="verifier re-run"))
            continue
        raise SystemExit(f"unmapped run_id {rid!r} in {t['name']}")
    if runs:
        t["runs"] = new_runs
    new_tools.append(t)

# final checks: every run_id is a bare ledger id of this lane, or null with a note
for t in tools:
    for r in t.get("runs") or []:
        rid = r["run_id"]
        assert rid is None or (re.fullmatch(r"r\d{4}", rid) and LED[rid]["lane"] == "video-hands-fretboard"), rid
        assert "step" in r and "note" in r
        if r["step"]:
            g = r["step"].split("/")[0]
            assert GROUP_ID[g] == rid, r

with open(TOOLS, "w") as fh:
    json.dump(d, fh, indent=1, ensure_ascii=False)  # same layout as the file had (indent 1, no final newline)
print("ok")
