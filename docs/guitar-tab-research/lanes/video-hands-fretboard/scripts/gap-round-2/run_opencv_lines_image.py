"""Gap round 2 (gap V6): run the lane's unchanged scripts/run_opencv_lines.py on a still image instead of a clip frame.

usage: python run_opencv_lines_image.py <image> <label> <out dir> --quad x1,y1,...,x4,y4 --size W,H
The wrapper replaces vhf_common.load_rgb with a loader for <image>, then executes run_opencv_lines.py as __main__ with
"--clip <label> --frames 0" plus the given --quad and --size, so every setting (Canny 50/150, HoughLinesP, LSD,
the string-like / fret-like rules, the clustering) is the one the earlier runs r0149 and r0214 used.
Quad order as in that script: nut end upper edge, nut end lower edge, body end lower edge, body end upper edge.
"""
import os
import runpy
import sys

import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
LANE_SCRIPTS = os.path.dirname(HERE)
sys.path.insert(0, LANE_SCRIPTS)
import vhf_common as C  # noqa: E402

image, label, out = sys.argv[1:4]
rest = sys.argv[4:]


def load_image(clip, n):
    bgr = cv2.imread(image, cv2.IMREAD_COLOR)
    return bgr[:, :, ::-1].copy()


C.load_rgb = load_image
script = os.path.join(LANE_SCRIPTS, "run_opencv_lines.py")
sys.argv = [script, out, "--clip", label, "--frames", "0"] + rest
runpy.run_path(script, run_name="__main__")
