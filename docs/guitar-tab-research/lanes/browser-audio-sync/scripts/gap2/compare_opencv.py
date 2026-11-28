"""Compare the OpenCV.js page's output (opencvjs.html) with the OpenCV-Python reference (opencv_lines_ref.py).

usage: python -I compare_opencv.py <pyref json> <pyref dir with *_rectified.png> <page result json> <rect .rgb dir> <input mode>

Per frame and quad: the HoughLinesP segment lists (unrectified and rectified) compared as ordered lists and as sets;
the counts (segments, in quad, string-like, fret-like); the fret and string clusters (the page's unrounded means
rounded here with Python's round(x, 1), as the reference does); the neck axis and width; the homography (max |JS - Py|
over the 9 entries, and the max relative difference); the rectified image (bytes differing from the reference PNG,
max |difference|); edge-pixel counts.
"""
import json
import os
import sys

import cv2
import numpy as np

pyref = json.load(open(sys.argv[1]))
pydir = sys.argv[2]
page = json.load(open(sys.argv[3]))["result"]
rectdir, mode = sys.argv[4], sys.argv[5]
TAGS = {"hand_quad": "handquad", "sam_quad": "samquad"}
out = {"input_mode": mode, "frames": {}}
for lab, pf in pyref["frames"].items():
    jf = page["frames"][lab]
    for ptag, jtag in TAGS.items():
        if ptag not in pf:
            continue
        p, j = pf[ptag], jf["quads"][jtag]
        r = {}
        for view in ("unrectified", "rectified"):
            ps, js = p[view]["hough_segments"], j[view]["hough_segments"]
            r[view] = {"segments_py": len(ps), "segments_js": len(js), "same_list_same_order": ps == js,
                       "same_set": sorted(map(tuple, ps)) == sorted(map(tuple, js)),
                       "only_py": len(set(map(tuple, ps)) - set(map(tuple, js))), "only_js": len(set(map(tuple, js)) - set(map(tuple, ps))),
                       "edge_pixels_py_js": [p[view]["edge_pixels"], j[view]["edge_pixels"]]}
            ph, jh = p[view]["hough"], j[view]["hough"]
            keys = [k for k in ("segments_total", "segments_in_quad", "string_like", "fret_like") if k in ph]
            r[view]["counts_equal"] = all(ph[k] == jh[k] for k in keys)
            r[view]["counts_py"] = {k: ph[k] for k in keys}
            if view == "rectified":
                jx = [round(float(v), 1) for v in jh["fret_x_cluster_means"]]
                jy = [round(float(v), 1) for v in jh["string_y_cluster_means"]]
                r[view]["fret_x_clusters_equal"] = jx == ph["fret_x_clusters_px_from_nut"]
                r[view]["string_y_clusters_equal"] = jy == ph["string_y_clusters_px_from_upper_edge"]
                r[view]["fret_x_clusters_js"] = jx
                r[view]["string_y_clusters_js"] = jy
        u = j["unrectified"]
        r["neck_axis_deg_equal"] = round(u["neck_axis_deg"], 2) == p["unrectified"]["neck_axis_deg"]
        r["fretboard_width_equal"] = round(u["fretboard_width_px"], 1) == p["unrectified"]["fretboard_width_px"]
        r["mask_pixels_py_js"] = [p["unrectified"]["mask_pixels"], u["mask_pixels"]]
        Hp, Hj = np.array(p["homography_full"]), np.array(j["homography_full"])
        r["homography_max_abs_diff"] = float(np.max(np.abs(Hp - Hj)))
        r["homography_max_rel_diff"] = float(np.max(np.abs(Hp - Hj) / np.maximum(np.abs(Hp), 1e-300)))
        r["homography_identical"] = bool(np.array_equal(Hp, Hj))
        r["homography_rounded_6_equal"] = np.round(Hj, 6).tolist() == p["homography_img_to_rect"]
        ref = cv2.cvtColor(cv2.imread(os.path.join(pydir, f"{lab}_{jtag}_rectified.png")), cv2.COLOR_BGR2RGB)
        js = np.fromfile(os.path.join(rectdir, f"{lab}_{jtag}_{mode}_rect.rgb"), np.uint8).reshape(ref.shape)
        dd = np.abs(ref.astype(int) - js.astype(int))
        r["rectified_bytes_differing"] = int(np.count_nonzero(dd))
        r["rectified_bytes_total"] = int(dd.size)
        r["rectified_max_abs_diff"] = int(dd.max())
        r["times_ms_js_unrect_rect"] = j["repeat_ms_unrect_rect"]
        r["times_s_py_unrect_rect_incl_lsd"] = [p["unrectified"]["time_s"], p["rectified"]["time_s"]]
        if "py_timing" in p:
            r["times_ms_py_same_steps"] = p["py_timing"]
        out["frames"][f"{lab}/{jtag}"] = r
        if "bytes_differing_from_cv2_imread" in jf:
            out["frames"][f"{lab}/{jtag}"]["input_bytes_differing_from_cv2_imread"] = jf["bytes_differing_from_cv2_imread"]
            out["frames"][f"{lab}/{jtag}"]["input_max_abs_byte_diff"] = jf["max_abs_byte_diff"]
print(json.dumps(out, indent=1))
