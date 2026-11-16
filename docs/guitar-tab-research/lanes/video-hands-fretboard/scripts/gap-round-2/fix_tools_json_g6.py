"""Gap round 2, gaps V6 (capo still) and V1 (Grounding DINO now has output): add the runs of 2026-11-11 to tools.json.
Numbers are from the ledger lines (r0628, r0629, r0632, r0634, r0639, r0648, r0650, r0652) and the results.json files
copied to samples/. Usage: fix_tools_json_g6.py <tools.json> <ledger runs.jsonl>"""
import json
import sys

PATH, LEDGER = sys.argv[1:3]
d = json.load(open(PATH))
by = {t["name"]: t for t in d["tools"]}
LED = {}
for line in open(LEDGER):
    r = json.loads(line)
    LED[r["id"]] = r

C1 = "C1 (Commons still 'Kapodaster an Westerngitarre', CC BY-SA 4.0, 960x1706; inputs.md) full and lower crop"
VIEWS8 = "the 8 R3a / R3a_cu views of the earlier YOLOE run (R3a f100, f300, f500 full; f100, f300 3x crop; R3a_cu f0, f150, f280)"


def run(rid, input_id, output_files, metrics, note=None):
    led = LED[rid]
    assert led["lane"] == "video-hands-fretboard"
    m = {"peak_unit": "MB", "cpu_s": round(led["cpu_user_s"] + led["cpu_sys_s"], 2)}
    if not led.get("locked"):
        m["nolock"] = "--nolock"
    m.update(metrics)
    return {"run_id": rid, "step": None, "note": note, "input_id": input_id,
            "cores": len(led["cores"]) if led.get("cores") else None, "wall_s": led["wall_s"],
            "peak_mb": led["max_rss_mb"], "exit_code": led["exit_code"], "output_files": output_files, "metrics": m}


# ---- OWLv2 ----
o = by["OWLv2 (google/owlv2-base-patch16-ensemble) via the public Space merve/owlv2"]
o["tried_how"] = "public-space and local-cpu"
o["version"] += ("; (gap round 2) local runs: model repo commit cfd3195ba4ea9592eec887ded089f4c08eff231d, "
                 "model.safetensors 619,918,824 bytes, sha256 e1e130b9e404cf91a75ad45644c1da9d7fa5284085eecc864266a6923efb99e7, "
                 "transformers 5.22.2, torch 2.15.0+cpu")
o["inputs"].append("(gap round 2) transformers 5.22.2: Owlv2Processor has no post_process_object_detection (AttributeError, "
                   "run r0634); Owlv2ImageProcessor.post_process_object_detection(outputs, threshold, target_sizes) and "
                   "Owlv2Processor.post_process_grounded_object_detection(outputs, threshold, target_sizes, text_labels) exist")
o["runs"] += [
    run("r0629", "C1 full (Space merve/owlv2, text_queries 'guitar neck, fretboard, headstock, capo, hand', score_threshold 0.1)",
        ["samples/owlv2-space/spaces_results_C1.json", "samples/owlv2-space/C1_kapodaster_owlv2_space_boxes.webp"],
        {"remote": "model runs on Hugging Face's cpu-basic Space; time is network plus remote inference",
         "owlv2_call_s": 31.3, "annotations": "28 mask boxes: fretboard 13, guitar neck 6, headstock 5, capo 4; no scores",
         "capo_boxes": "(291,1434)-(723,1497) the capo bar with its clamp; (614,1397)-(724,1486) and (614,1400)-(711,1445) "
                       "the clamp; (176,750)-(278,824) a tuner button (by eye)"}),
    run("r0632", f"{C1}; {VIEWS8}", [],
        {"error": "OSError: Can't load image processor for 'google/owlv2-base-patch16-ensemble' (offline mode; the snapshot "
                  "had been fetched by commit hash, no refs/main)"}, note="failed attempt"),
    run("r0634", f"{C1}; {VIEWS8}", [],
        {"error": "AttributeError: 'Owlv2Processor' object has no attribute 'post_process_object_detection'. Did you "
                  "mean: 'post_process_grounded_object_detection'?"}, note="failed attempt"),
    run("r0639", f"{C1}; {VIEWS8}", ["samples/owlv2-local/results.json", "samples/owlv2-local/*.webp"],
        {"settings": "queries 'a photo of a <prompt>' for guitar, guitar neck, fretboard, headstock, capo, hand; boxes >= 0.1; "
                     "image_processor.post_process_object_detection with target size max(h, w) squared",
         "model_load_s": 3.16, "per_view_s": "7.07-10.03",
         "C1_full": "22 boxes; guitar 1 (0.4838), guitar neck 11 (top 0.2092), fretboard 8 (top 0.2837), capo 2 (0.2539 and "
                    "0.1454, both on the clamp at the neck's right edge by eye), headstock 0, hand 0",
         "C1_lower": "4 boxes; capo 0.2154 and 0.1475 (clamp), fretboard 0.1821, guitar 0.1536",
         "capo_on_capo_less_views": "top 'capo' score per view 0.1919 to 0.3682; 4 of the 8 views above C1's 0.2539",
         "no_ground_truth": "capo position read by eye; no gtr-eval"}),
]
o["unverified"] = [u for u in o["unverified"]
                   if u != "The Space returns no scores, so the scored transformers output format was not observed in a run."]
o["unverified"].append("(gap round 2) The scored transformers output was observed in run r0639 (boxes, scores, label "
                       "indices). The Space's own query handling (it got 'guitar neck, fretboard, ...' without 'a photo of "
                       "a') was not read; its C1 boxes differ from the local run's.")

# ---- Grounding DINO ----
g = by["Grounding DINO (IDEA Research; tiny in transformers)"]
g["tried"] = True
g["tried_how"] = "local-cpu"
g["not_run_reason"] = None
g["version"] += ("; (gap round 2) local run: model repo commit a2bb814dd30d776dcf7e30523b00659f4f141c71, "
                 "model.safetensors sha256 1a2412ef99bd74bcd3c2a246fa1e48581f8889a1300c9051974741314fc042f3, "
                 "transformers 5.22.2")
g["outputs"].append("(gap round 2, run r0648) transformers post_process_grounded_object_detection returns per box a score, "
                    "an xyxy box in pixels and a text label made of the prompt tokens above text_threshold; labels outside "
                    "the prompt list came back: 'guitar guitar', 'neck', '##tock', 'heads'")
g["runs"] += [
    run("r0629", "C1 full (Space merve/Grounding_DINO_demo)", [],
        {"error": "ValueError('Unknown protocol: ws'), as in r0193 and r0488"},
        note="the Grounding DINO call of job r0629 (the same job called the OWLv2 Space); the job exited 0"),
    run("r0648", f"{C1}; {VIEWS8}", ["samples/grounding-dino-local/results.json", "samples/grounding-dino-local/*.webp"],
        {"settings": "text 'guitar. guitar neck. fretboard. headstock. capo. hand.', threshold 0.2, text_threshold 0.2",
         "model_load_s": 3.72, "per_view_s": "7.39-11.86",
         "C1_full": "5 boxes: 'guitar guitar' 0.4528 and 0.2377, 'guitar neck' 0.3558 (whole instrument) and 0.3448 "
                    "(headstock), 'neck' 0.2255; no 'capo' label",
         "C1_lower": "6 boxes, among them 'guitar neck' 0.3298 and '##tock' 0.2105 at (287.6,1431.7)-(725.4,1499.6), the capo "
                     "bar's position by eye; no 'capo' label",
         "capo_on_capo_less_views": "one 'capo' box, 0.2653, R3a frame-100 crop",
         "hand_on_earlier_views": "'hand' in all 8 views, top 0.334-0.6231",
         "no_ground_truth": "no gtr-eval"}),
]
g["unverified"] = [u for u in g["unverified"]
                   if not u.startswith("Space merve/Grounding_DINO_demo state RUNNING")]
g["unverified"].append("Space merve/Grounding_DINO_demo state RUNNING on cpu-basic (2026-11-10 and 2026-11-11); its API "
                       "could not be called from the box (r0193, r0488, r0629: 'Unknown protocol: ws'); the model itself "
                       "ran locally in r0648 (gap round 2).")

# ---- YOLOE-26 ----
y = by["YOLOE-26 (yoloe-26s-seg in Ultralytics)"]
y["runs"].append(
    run("r0628", f"{C1}; {VIEWS8}", ["samples/yoloe-26s/gap2/results.json", "samples/yoloe-26s/gap2/C1_*.webp"],
        {"setup_s": 3.43, "per_view_s": "0.23-0.41",
         "C1": "one box per view, both 'fretboard' (0.051 full, 0.0512 lower crop); no 'capo', 'guitar neck', 'headstock' "
               "or 'guitar' box >= 0.05",
         "capo_on_capo_less_views": "none >= 0.05",
         "check": "the 8 earlier views gave the same prompts, scores and boxes as the trial's results.json"}))

# ---- YOLO-World ----
w = by["YOLO-World (AILab-CVC; also YOLOWorld in Ultralytics)"]
w["tried"] = True
w["tried_how"] = "local-cpu"
w["not_run_reason"] = None
w["version"] += ("; (gap round 2) run with ultralytics 8.4.209: yolov8s-worldv2.pt sha256 "
                 "9b2c17ab6124a913e9b3a5c170617920d91b0f01111a8479da69f00e2cf27792 (ultralytics/assets v8.4.0), CLIP "
                 "ViT-B-32.pt 353,976,522 bytes via openai-clip 1.0.1")
w["inputs"].append("(gap round 2) Ultralytics' WEIGHTS_DIR is the relative path 'weights', so set_classes() downloads the "
                   "CLIP file to <working directory>/weights/clip/ViT-B-32.pt")
w["runs"] = [run("r0650", f"{C1}; {VIEWS8}", ["samples/yolo-world-v2/results.json", "samples/yolo-world-v2/*.webp"],
                 {"settings": "set_classes(guitar, guitar neck, fretboard, headstock, capo, hand); conf 0.05",
                  "setup_s": 5.16, "per_view_s": "0.19-0.31",
                  "C1": "no box >= 0.05 for any prompt on C1_full or C1_lower",
                  "earlier_views": "'guitar' in all 8 (top 0.5267-0.8554); one 'hand' box (0.0767, R3a frame-100 crop); "
                                   "nothing for guitar neck, fretboard, headstock or capo",
                  "no_ground_truth": "no gtr-eval"})]
w["unverified"].append("(gap round 2) The two demo Spaces were not checked again; for-aaron.md section 5 is now optional.")

clip = by["CLIP ViT-B/32 (OpenAI text encoder used by YOLO-World in Ultralytics)"]
clip["not_run_reason"] = ("Not run on its own. (gap round 2) Downloaded and used as YOLO-World v2's text encoder in run r0650 "
                          "(ViT-B-32.pt, 353,976,522 bytes, sha256 40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af), "
                          "then deleted; see the YOLO-World entry.")

# ---- OpenCV ----
cv = by["OpenCV (Canny, HoughLinesP, LSD, findHomography, warpPerspective)"]
cv["runs"].append(
    run("r0652", "C1 full (capo still), quad set by hand: (345,1090), (612,1090), (617,1700), (338,1700); rectified 610x270",
        ["samples/opencv-lines-C1/opencv_lines_C1.json", "samples/opencv-lines-C1/*.webp"],
        {"script": "scripts/run_opencv_lines.py unchanged, through scripts/gap-round-2/run_opencv_lines_image.py",
         "unrectified": "Hough 326 segments in quad, 296 string-like, 2 fret-like; LSD 255, 106, 3",
         "rectified": "Hough 288, 91 string-like, 3 fret-like, fret clusters x = 1.0, 412.0, 452.0; LSD 262, 60, 2, fret "
                      "clusters x = 380.1, 394.3",
         "by_eye": "Hough 1.0 = nut's lower edge, 412.0 = lower edge of the capo bar, 452.0 = fret wire 2; both LSD clusters "
                   "on the capo bar's highlight; fret wire 1 (x about 232-237) not classified fret-like by either detector",
         "string_clusters": "Hough 16, LSD 9 (10.8, 62.1, 111.9, 122.3, 159.8, 167.3, 206.9, 254.0, 267.4); six strings at "
                            "about y = 12, 62, 112, 160, 208, 255 by eye"}))

for t in d["tools"]:
    for r in t.get("runs") or []:
        r.setdefault("step", None)
        r.setdefault("note", None)

with open(PATH, "w") as fh:
    json.dump(d, fh, indent=1, ensure_ascii=False)
print("ok")

# Applied afterwards by an inline edit (same session, 2026-11-11): in the Grounding DINO entry the r0629 run got
# wall_s and peak_mb set to null (the job's wall time covers the OWLv2 Space call too, as for r0193), and an
# unverified line records that gap V1 had first set tried=false before r0648 gave output.
