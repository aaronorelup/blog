"""Gap round 2, gap V8: add GigaHands (arXiv 2412.04244) to tools.json, from sources read 2026-11-11
(survey.md, Datasets section). Usage: fix_tools_json_g8.py <tools.json>"""
import json
import sys

PATH = sys.argv[1]
d = json.load(open(PATH))
assert not any(t["name"].startswith("GigaHands") for t in d["tools"])
d["tools"].append({
    "name": "GigaHands (bimanual hand-activity dataset, Brown University)",
    "kind": "dataset",
    "what": "'We introduce GigaHands, a massive annotated dataset capturing 34 hours of bimanual hand activities from 56 "
            "subjects and 417 objects, totaling 14k motion clips derived from 183 million frames paired with 84k text "
            "annotations.' (arXiv 2412.04244, CVPR 2025 Highlight). 51 camera views; its instruction script includes a "
            "'Playing the Ukulele' activity (fretboard chords, strumming, plucking).",
    "url": "https://ivl.cs.brown.edu/research/gigahands.html",
    "version": "arXiv 2412.04244 v3 (v1 5 Dec 2024); HF dataset freddie007/GigaHands last modified 2026-11-07; code "
               "github.com/Kristen-Z/GigaHands HEAD be19068 (2026-11-07), also linked as github.com/brown-ivl/GigaHands",
    "tried": False,
    "tried_how": None,
    "runs": [],
    "not_run_reason": "A dataset, not a tool: not downloaded (multiview RGB videos 1.06 TB; CC BY-NC 4.0). Only "
                      "instruction_script.json (387,755 bytes) and annotations_v2.jsonl (18,539,852 bytes) were fetched to "
                      "count the ukulele activity; the latter was deleted after counting.",
    "for_aaron": False,
    "callable_via": ["python", "http"],
    "inputs": ["hf download freddie007/GigaHands --repo-type dataset (README); per-session hand_poses/<session>.tar.gz, "
               "multiview_rgb_vids/<session>.tar with tar_index.csv.gz for HTTP range requests of single clips"],
    "outputs": ["per session: keypoints_2d, keypoints_3d, keypoints_3d_mano, keypoints_3d_mano_align, MANO params, camera "
                "parameters; object poses and meshes; text annotations (annotations_v2.jsonl: scene, sequence, "
                "start_frame_id, end_frame_id, clarify_annotation, description, rewritten_annotation, all_tokens)"],
    "constraints_accepted": [],
    "license": {
        "code": {"spdx": None,
                 "quote": "GigaHands is released under the Creative Commons Attribution-NonCommercial 4.0 International License.",
                 "url": "https://raw.githubusercontent.com/Kristen-Z/GigaHands/main/README.md",
                 "note": "No LICENSE file in the repository tree (67 files at HEAD be19068); the README's License section is "
                         "quoted."},
        "weights": None,
        "training_data": [{"name": "GigaHands data (HF dataset freddie007/GigaHands)", "license": "CC-BY-NC-4.0",
                           "quote": "license: cc-by-nc-4.0",
                           "url": "https://huggingface.co/datasets/freddie007/GigaHands/raw/main/README.md"},
                          {"name": "MANO hand model (needed by the repository's tools)", "license": "MANO license",
                           "quote": "Download [mano](https://mano.is.tue.mpg.de/download.php) models and place the "
                                    "`MANO_*.pkl` files under `body_models/smplh`.",
                           "url": "https://raw.githubusercontent.com/Kristen-Z/GigaHands/main/README.md"}],
        "service_terms": [],
    },
    "pricing": None,
    "handoffs_out": [],
    "unverified": [
        "Fretted-instrument content: instruction_script.json has scene 'Playing mini instruments' with activity 'Playing "
        "the Ukulele' (16 actions, e.g. 'Place your left-hand fingers on the fretboard to form chords.'); 119 of 13,787 "
        "rows of annotations_v2.jsonl mention 'ukulele', in 11 sessions named '*instrument*'. No guitar in the script.",
        "Whether object poses include the ukulele, whether any fret or string labels exist, and how the ukulele clips look "
        "on video were not checked (videos not downloaded).",
        "The 2025 venue claim from the gap list: the arXiv comment reads 'CVPR 2025 Highlight'.",
    ],
})
with open(PATH, "w") as fh:
    json.dump(d, fh, indent=1, ensure_ascii=False)
print("ok", len(d["tools"]))
