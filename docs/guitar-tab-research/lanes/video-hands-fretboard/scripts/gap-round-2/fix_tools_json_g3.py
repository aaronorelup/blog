"""Gap round 2, gap V3: license facts of pytorch-openpose (code, converted weights) and the OpenPose hand model's
training data, from sources read 2026-11-11 (survey.md, OpenPose section). Usage: fix_tools_json_g3.py <tools.json>"""
import json
import sys

PATH = sys.argv[1]
d = json.load(open(PATH))
by = {t["name"]: t for t in d["tools"]}

PAPER = "https://arxiv.org/pdf/1704.07809"
TRAIN = [
    {"name": "MPII Human Pose dataset images, hands annotated by the paper's authors",
     "license": None,
     "quote": "We therefore manually annotated two publicly available image sets: (1) The MPII Human Pose dataset [2], "
              "which contains images extracted from YouTube videos explicitly collected to reflect every-day human "
              "activities, and (2) Images from the New Zealand Sign Language (NZSL) Exercises of the Victoria "
              "University of Wellington [11], in which several people use NZSL to tell stories.",
     "url": PAPER},
    {"name": "New Zealand Sign Language (NZSL) Exercises images, hands annotated by the paper's authors",
     "license": None,
     "quote": "we have collected annotations for 1300 hands on the MPII set and 1500 on NZSL, which we split 70/30 into "
              "training (2000 hands) and testing (800) sets.",
     "url": PAPER},
    {"name": "synthetically rendered hand images (about 11000)",
     "license": None,
     "quote": "an initial set of synthetically rendered images of hands, totalling around 11000 examples "
              "(footnote mark '3' after 'rendered' left out)",
     "url": PAPER},
    {"name": "Panoptic Studio dataset (multiview bootstrapping)",
     "license": None,
     "quote": "For multiview bootstrapping, we use images from the Panoptic Studio dataset [8].",
     "url": PAPER},
]
NOTE_TRAIN = ("Named in Simon, Joo, Matthews, Sheikh, 'Hand Keypoint Detection in Single Images using Multiview "
              "Bootstrapping' (arXiv 1704.07809), the paper OpenPose's README cites for its hand detector. Which of "
              "the paper's detectors is OpenPose's hand/pose_iter_102000.caffemodel is not stated in the pages read; "
              "the dataset licenses were not read.")

t = by["pytorch-openpose hand model (PyTorch port of OpenPose's 21-keypoint hand network)"]
t["license"]["code"] = {
    "spdx": None,
    "quote": None,
    "url": "https://raw.githubusercontent.com/Hzzone/pytorch-openpose/master/LICENSE",
    "note": "No license file found (read 2026-11-11): that URL and .../master/LICENSE.md answered HTTP 404; git ls-tree "
            "of HEAD 5ee71dc (metadata clone) lists 32 files, none a LICENSE or COPYING file; the README contains no "
            "occurrence of 'licen'. GitHub's own license field was not read (github.com and api.github.com answer 403 "
            "from the box).",
}
t["license"]["weights"] = {
    "name": "hand_pose_model.pth from huggingface.co/lllyasviel/Annotators (OpenPose's hand caffemodel converted to "
            "PyTorch); its distributor ships CMU's OpenPose license beside the code that downloads it",
    "quote": "OPENPOSE: MULTIPERSON KEYPOINT DETECTION SOFTWARE LICENSE AGREEMENT ACADEMIC OR NON-PROFIT ORGANIZATION "
             "NONCOMMERCIAL RESEARCH USE ONLY",
    "url": "https://raw.githubusercontent.com/lllyasviel/ControlNet-v1-1-nightly/main/annotator/openpose/LICENSE",
    "note": "The HF card of lllyasviel/Annotators is front matter only ('license: other', no text). The same account's "
            "annotator/openpose/__init__.py in lllyasviel/ControlNet-v1-1-nightly begins '# Original from CMU "
            "https://github.com/CMU-Perceptual-Computing-Lab/openpose' and '# 2nd Edited by "
            "https://github.com/Hzzone/pytorch-openpose' and sets hand_model_path = "
            "'https://huggingface.co/lllyasviel/Annotators/resolve/main/hand_pose_model.pth'; the LICENSE in that folder "
            "is CMU's OpenPose LICENSE apart from one no-break space and the final newline (compared 2026-11-11). "
            "pytorch-openpose README: 'the pytorch model is directly converted from openpose caffemodel'. CMU's license "
            "text does not name model files.",
    "also": [
        {"quote": "license: other", "url": "https://huggingface.co/lllyasviel/Annotators/raw/main/README.md"},
        {"quote": "# 2nd Edited by https://github.com/Hzzone/pytorch-openpose",
         "url": "https://raw.githubusercontent.com/lllyasviel/ControlNet-v1-1-nightly/main/annotator/openpose/__init__.py"},
    ],
}
t["license"]["training_data"] = TRAIN
t["unverified"] = [u for u in t["unverified"]
                   if not u.startswith("No license of the pytorch-openpose repository was read")]
t["unverified"] = [("The full OpenPose software license (CMU, non-commercial) is quoted under the OpenPose (CMU) entry; "
                    "CMU's text does not name model files. (gap round 2) The distributor of the converted weights, "
                    "lllyasviel, ships that license text in annotator/openpose/ beside the code that downloads them.")
                   if u.startswith("The full OpenPose software license") else u for u in t["unverified"]]
t["unverified"] += [
    "Whether lllyasviel/Annotators' hand_pose_model.pth is byte-identical to the file in pytorch-openpose's own "
    "Dropbox / Google Drive folders was not checked.",
    NOTE_TRAIN,
]

o = by["OpenPose (CMU, full C++ program)"]
o["license"]["training_data"] = TRAIN
o["unverified"] = list(o.get("unverified") or []) + ["(hand model) " + NOTE_TRAIN]

with open(PATH, "w") as fh:
    json.dump(d, fh, indent=1, ensure_ascii=False)
print("ok")

# Applied afterwards by hand (same session, 2026-11-11): in the "OpenPose (CMU, full C++ program)" entry the
# unverified line "Training data: not stated in the files read." became "Training data: not stated in the files read.
# (corrected in gap round 2: the hand model's training sets are named in the hand paper, see license.training_data;
# the body and face models' training data were not read.)"
