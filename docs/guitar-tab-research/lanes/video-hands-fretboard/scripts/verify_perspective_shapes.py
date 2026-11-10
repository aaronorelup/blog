"""Which point-array shapes cv2.perspectiveTransform accepts (verify-docs-video-hands-fretboard, 2026-11-10).

Run with the lane's OpenCV 5.0.0 venv:
  /home/user/gtr/lanes/video-hands-fretboard/venv-rtmlib/bin/python -I verify_perspective_shapes.py

Output on 2026-11-10 (cv2 5.0.0): (21, 2) raises "(-215:Assertion failed) scn + 1 == m.cols";
(21, 1, 2) and (1, 21, 2) are accepted, for float32 and float64. A light check (well under a second), not a timed run.
"""
import numpy as np
import cv2

H = np.eye(3)
print("cv2", cv2.__version__)
for shape, dt in [((21, 2), np.float32), ((21, 1, 2), np.float32), ((1, 21, 2), np.float32),
                  ((21, 2), np.float64), ((21, 1, 2), np.float64)]:
    try:
        r = cv2.perspectiveTransform(np.zeros(shape, dt), H)
        print(shape, dt.__name__, "OK ->", r.shape)
    except Exception as e:  # noqa: BLE001
        print(shape, dt.__name__, "ERROR", str(e).splitlines()[-1][:120])
