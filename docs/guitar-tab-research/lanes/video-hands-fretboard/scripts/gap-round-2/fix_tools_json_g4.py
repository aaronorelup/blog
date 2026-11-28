"""Gap round 2, gap V4: training data (and weights quotes) for MediaPipe Holistic and Pose, ViTPose-s whole-body
ONNX and YOLOE-26, from sources read 2026-11-11 (survey.md: MediaPipe section, "Other whole-body models", YOLO-World /
YOLOE section). Usage: fix_tools_json_g4.py <tools.json>"""
import json
import sys

PATH = sys.argv[1]
d = json.load(open(PATH))
by = {t["name"]: t for t in d["tools"]}

BP = "https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf"
FM = "https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Face%20Mesh%20V2.pdf"
HAND_PAGE = "https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker"
BP_DATA = {
    "name": "BlazePose GHUM 3D (pose part): Google's own images from a mobile AR application, 30K consented, 85K of "
            "training images with fitness poses (no public dataset named)",
    "license": None,
    "quote": "This model was trained and evaluated on images, including consented images (30K), of people using a "
             "mobile AR application captured with smartphone cameras in various “in-the-wild” conditions. The "
             "majority of training images (85K) capture a wide range of fitness poses.",
    "url": BP,
}
BP_DATA2 = {
    "name": "BlazePose GHUM 3D (pose part): capture conditions",
    "license": None,
    "quote": "All dataset images were captured on a diverse set of back-facing smartphone cameras.",
    "url": BP,
}

pose = by["MediaPipe Pose Landmarker (heavy)"]
pose["license"]["training_data"] = [BP_DATA, BP_DATA2]
pose["unverified"] = list(pose.get("unverified") or []) + [
    "(gap round 2) The pose page links all three pose bundles (lite, full, heavy) to the BlazePose GHUM 3D card; the "
    "card names no public dataset and no dataset license."]

hol = by["MediaPipe Holistic Landmarker (Tasks API)"]
hol["license"]["training_data"] = [
    BP_DATA,
    {"name": "FaceLandmarker-V2 / Face Mesh V2 (face part): smartphone captures through an AR application (no public "
             "dataset named)",
     "license": None,
     "quote": "All dataset images were captured on a diverse set of smartphone cameras, both front- and back-facing.",
     "url": FM,
     },
    {"name": "HandLandmarker (hand part): approximately 30K real-world images plus rendered synthetic hand models "
             "(dataset not named)",
     "license": None,
     "quote": "The model was trained on approximately 30K real-world images, as well as several rendered synthetic "
              "hand models imposed over various backgrounds.",
     "url": HAND_PAGE,
     },
]
hol["license"]["weights"]["also"] = [
    {"quote": "LICENSED UNDER Apache License, Version 2.0 (Face Mesh V2 card)", "url": FM},
    {"quote": "LICENSED UNDER Apache License, Version 2.0 (hand card)",
     "url": "https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf"},
]
hol["unverified"] = list(hol.get("unverified") or []) + [
    "(gap round 2) The holistic page lists the model cards 'BlazePose', 'FaceLandmarker-V2' and 'HandLandmarker' for "
    "the Holistic landmarker bundle. The Face Mesh V2 quote was read on the rendered PDF page (its text layer drops the "
    "'rt' and 'ff' ligatures). None of the three cards names a public dataset or a dataset license."]

vit = by["ViTPose (ViTPose-s whole-body ONNX via rtmlib)"]
vit["license"]["weights"] = {
    "name": "easy_ViTPose ONNX onnx/wholebody/vitpose-s-wholebody.onnx (huggingface.co/JunkyByte/easy_ViTPose, "
            "97,427,067 bytes): the card points to ViTPose's Apache-2.0 LICENSE",
    "quote": "Refer to official https://github.com/ViTAE-Transformer/ViTPose/blob/main/LICENSE for model license",
    "url": "https://huggingface.co/JunkyByte/easy_ViTPose/raw/main/README.md",
    "also": [
        {"quote": "We provide all the VitPose original models, converted for inference, with single dataset format output.",
         "url": "https://raw.githubusercontent.com/JunkyByte/easy_ViTPose/main/README.md"},
    ],
}
vit["license"]["training_data"] = [
    {"name": "ViTPose++-S whole-body checkpoint: COCO, AI Challenger (AIC), MPII, AP-10K, APT-36K, COCO-WholeBody",
     "license": None,
     "quote": "| **ViTPose++-S** | COCO+AIC+MPII+AP10K+APT36K+WholeBody | 256x192 | 54.4 |",
     "url": "https://raw.githubusercontent.com/ViTAE-Transformer/ViTPose/main/README.md"},
    {"name": "COCO-WholeBody (one of the six)",
     "license": "research and non-commercial use only (annotations); images under Flickr terms",
     "quote": "1. COCO-WholeBody dataset is **ONLY** for research and non-commercial use.",
     "url": "https://raw.githubusercontent.com/jin-s13/COCO-WholeBody/master/README.md"},
]
vit["unverified"] = [u for u in vit["unverified"]
                     if u != "easy_ViTPose repo is not gated and its card metadata has no license field."]
vit["unverified"] += [
    "easy_ViTPose repo is not gated and its card metadata has no license field; (gap round 2) the card's 'License' "
    "section points to ViTPose's LICENSE (quoted in license.weights).",
    "(gap round 2) That vitpose-s-wholebody.onnx is converted from the README's ViTPose++-S whole-body checkpoint is not "
    "stated in the files read; it is the only S-size model in the README's 'WholeBody dataset' table. The licenses of "
    "COCO, AIC, MPII, AP-10K and APT-36K were not read.",
]

ye = by["YOLOE-26 (yoloe-26s-seg in Ultralytics)"]
ye["license"]["weights"] = {
    "name": "yoloe-26s-seg.pt from the ultralytics/assets release v8.4.0; that repository's LICENSE is AGPL-3.0 (the "
            "mobileclip2_b.ts text encoder: terms Ultralytics applies not found)",
    "quote": "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007",
    "url": "https://raw.githubusercontent.com/ultralytics/assets/main/LICENSE",
    "note": "The release page itself was not read (github.com answers 403 from the box).",
}
ye["license"]["training_data"] = [
    {"name": "Objects365v1 (detection, 609k samples, 9621k boxes), GQA (grounding, 621k, 3681k), Flickr30k "
             "(grounding, 149k, 641k): the published open-vocabulary checkpoints, per Ultralytics",
     "license": None,
     "quote": "It reproduces the published open-vocabulary checkpoints from Objects365, GQA and Flickr30k — about 1.4 M "
              "training samples on 8× RTX 4090 — and is unrelated to fine-tuning on your own data, which is covered "
              "under Train Usage above.",
     "url": "https://docs.ultralytics.com/models/yoloe/"},
    {"name": "Objects365, GQA, Flickr30k Entities (YOLOE-26 paper, Sapkota and Karkee)",
     "license": None,
     "quote": "Models are trained on Objects365v1, GQA, and Flickr30k datasets.",
     "url": "https://arxiv.org/pdf/2602.00168"},
    {"name": "Objects365 (V1), GoldG (GQA and Flickr30k), COCO images excluded (original YOLOE paper, arXiv 2503.07465)",
     "license": None,
     "quote": "Data. We employ Objects365[52], GoldG [22] (including GQA[17] and Flickr30k [43]) for training YOLOE.",
     "url": "https://arxiv.org/pdf/2503.07465"},
]
ye["unverified"] = list(ye.get("unverified") or []) + [
    "(gap round 2) The licenses of Objects365, GQA and Flickr30k were not read."]

with open(PATH, "w") as fh:
    json.dump(d, fh, indent=1, ensure_ascii=False)
print("ok")

# Gap V5 (applied in the same session, 2026-11-11, by an inline edit): the MediaPipe Hand Landmarker entry's
# handoff to "Basic Pitch (audio-to-notes lane)" got the evidence sentence about run r0609 appended
# ("; (gap round 2) run r0609 ... descriptive, no ground truth").
