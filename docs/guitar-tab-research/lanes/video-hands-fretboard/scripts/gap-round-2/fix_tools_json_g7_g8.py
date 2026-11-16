"""Gap round 2, gap V7: the GuiFiR repository, license and dataset contents (read 2026-11-11), copied into the video
lane's two GuiFiR entries; the facts agree with the guitar-tab lane's entry. Usage: fix_tools_json_g7_g8.py <tools.json>
(gap V8, GigaHands, was added afterwards by fix_tools_json_g8.py.)"""
import json
import sys

PATH = sys.argv[1]
d = json.load(open(PATH))
by = {t["name"]: t for t in d["tools"]}
REPO = "https://github.com/kmu-ee-ailab/guifir_dataset"
RAW = "https://raw.githubusercontent.com/kmu-ee-ailab/guifir_dataset/main/"

CODE = {"spdx": "MIT",
        "quote": "This license applies only to the source code and documentation in this repository. Dataset assets are "
                 "governed by DATASET_TERMS.md.",
        "url": RAW + "LICENSE",
        "note": "LICENSE begins 'MIT License' and 'Copyright (c) 2026 GuiFiR authors'; it covers the preparation scripts."}
DATA = [{"name": "GuiFiR dataset assets (video clips, annotations, metadata, source-video references, frames)",
         "license": "non-commercial research, education and reproducibility (DATASET_TERMS.md)",
         "quote": "The dataset assets are provided for non-commercial research, education, and reproducibility of the "
                  "GuiFiR work.",
         "url": RAW + "DATASET_TERMS.md"}]
TERMS = [{"topic": "commercial use (DATASET_TERMS.md, under 'You may not:')",
          "quote": "Use the dataset assets for commercial products, services, or training pipelines without written "
                   "permission from the dataset maintainers.",
          "url": RAW + "DATASET_TERMS.md"},
         {"topic": "redistribution (DATASET_TERMS.md, under 'You may not:')",
          "quote": "Redistribute, mirror, sublicense, sell, or commercially exploit the dataset assets.",
          "url": RAW + "DATASET_TERMS.md"},
         {"topic": "derived weights and results (DATASET_TERMS.md, under 'You may:')",
          "quote": "Publish aggregate results, analysis, and derived model weights, subject to the terms of any "
                   "third-party data sources used.",
          "url": RAW + "DATASET_TERMS.md"}]
LINK = ("(gap round 2) The lab's home page https://ailab.kookmin.ac.kr/ (read 2026-11-11) lists the paper with a link "
        "titled 'Code' to " + REPO + " (HEAD e707e5167ec3e495ebffe539c5d6060ec203b9ce, 2026-10-29); the publication "
        "page links only the organization. The guitar-tab lane's survey found the same repository.")

m = by["GuiFiR (Weakly-Supervised Learning of Hand Pose Estimation for Guitar Finger Reading)"]
m["not_run_reason"] = ("No model code or weights found: the repository the lab links as 'Code' (" + REPO + ") holds "
                       "dataset-preparation scripts and metadata only (13 files at HEAD e707e51, 2026-10-29). Not run. "
                       "(corrected in gap round 2: the earlier text said no code or data link was found.)")
m["license"]["code"] = CODE
m["license"]["training_data"] = DATA
m["license"]["service_terms"] = TERMS
m["unverified"] = [u for u in m["unverified"] if u != "Code and data location: UNVERIFIED."] + [
    LINK, "No model code or weights were found in any page or repository read."]

ds = by["GuiFiR-Synth and GuiFiR-Vid datasets (2026)"]
ds["url"] = REPO
ds["version"] = "repository HEAD e707e5167ec3e495ebffe539c5d6060ec203b9ce (2026-10-29); IEEE Access 2026, doi 10.1109/ACCESS.2026.3713562"
ds["what"] = ("'Official dataset release for **GuiFiR** (IEEE Access, 2026), a guitar finger reading dataset for **hand pose "
              "estimation**, **fretboard pose estimation**, and **guitar tablature / fingering recognition** from guitar "
              "performance videos.' (README). GuiFiR-Synth: 'synthetic composite images with hand and guitar fretboard "
              "coordinate annotations.'; GuiFiR-Vid: 'real guitar performance video clips with ground-truth or "
              "pseudo-ground-truth tablature.'; 10-second clips; splits train 900 clips / 29,051 annotated frames (no "
              "keypoint ground truth), val 30 / 543, test 100 / 2,048 (with keypoint ground truth).")
ds["not_run_reason"] = ("Not downloaded: the archive is a Google Drive file (gdown --id 1Ri42XQnpwWQzjNLOPgZCR2XCx9YGrqxc) "
                        "and the clips come from YouTube links; the data terms are non-commercial. (corrected in gap round "
                        "2: the earlier text said no link was found.)")
ds["callable_via"] = ["python"]
ds["inputs"] = ["GuiFiR.tar (raw_clips/, metadata/ split.csv yt_link.csv start_end.csv, annotations/ "
                "guifir_{train,val,test}_coco_anno_box.jsonl); scripts: move_annotations.py, "
                "download_clips_from_metadata.py (yt-dlp), split_clips.py, extract_frames.py (ffmpeg or OpenCV)"]
ds["outputs"] = ["per annotated frame (JSONL): frame_id, filename, frame_width, frame_height, frame_tab (fret per string, "
                 "6 values; 0 = open string, 20 = string not played), frame_capo (capo position, 0 = no capo), "
                 "hand_annotation and neck_annotation (detector box [x1, y1, x2, y2], pred_phrases, xc, yc, scale, theta), "
                 "frame_gt_pose (val/test only: fretboard corners lt, lb, rt, rb as [x, y] and fingertips 4, 8, 12, 16, "
                 "20 as [x, y, visibility] in MediaPipe indices, in 640x360 space)"]
ds["license"]["code"] = CODE
ds["license"]["training_data"] = DATA
ds["license"]["service_terms"] = TERMS + [
    {"topic": "source videos", "quote": "The source videos referenced by GuiFiR may be owned by third parties.",
     "url": RAW + "DATASET_TERMS.md"}]
ds["unverified"] = [LINK,
                    "Read from the README only; the archive was not downloaded, so counts and fields were not checked "
                    "against the files.",
                    "The released ground-truth pose is four fretboard corners and five fingertips; the 126-landmark grid "
                    "is how the lab page describes the model, not an annotation field of the release.",
                    "The annotations carry a per-frame capo position (frame_capo); how many clips have a capo was not "
                    "read."]

with open(PATH, "w") as fh:
    json.dump(d, fh, indent=1, ensure_ascii=False)
print("ok")
