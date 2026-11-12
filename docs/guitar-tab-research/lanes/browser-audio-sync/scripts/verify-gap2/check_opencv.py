"""Verifier (round 2): check the OpenCV.js section against the video lane's own saved files.
usage: python -I check_opencv.py <page result json> <rect .rgb dir> <mode> [pyref json]"""
import json, os, sys
import numpy as np, cv2

page = json.load(open(sys.argv[1]))['result']; rectdir = sys.argv[2]; mode = sys.argv[3]
pyref = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else None
VL = '/home/user/gtr/lanes/video-hands-fretboard/out'
vl = {}
vl.update(json.load(open(f'{VL}/opencv-lines-samquad/opencv_lines.json'))['frames'])   # r0400 (hand quads + SAM quad)
vl.update(json.load(open(f'{VL}/opencv-lines-R3b/opencv_lines_R3b.json'))['frames'])   # r0214
PNG = {**{k: f'{VL}/opencv-lines-samquad' for k in ('R3a_cu_f0150', 'R3a_cu_f0000', 'R3a_cu_f0280')},
       **{k: f'{VL}/opencv-lines-R3b' for k in ('R3b_f0225', 'R3b_f0000', 'R3b_f0449')}}
TAG = {'hand_quad': 'handquad', 'sam_quad': 'samquad'}
out = {}
def strip_times(d):
    if isinstance(d, dict): return {k: strip_times(v) for k, v in d.items() if k not in ('time_s', 'py_timing', 'hough_segments', 'homography_full', 'edge_pixels', 'mask_pixels', 'tag')}
    if isinstance(d, list): return [strip_times(x) for x in d]
    return d
for lab, vf in vl.items():
    jf = page['frames'][lab]
    for q, t in TAG.items():
        if q not in vf: continue
        v = vf[q]; j = jf['quads'][t]; r = {}
        for view in ('unrectified', 'rectified'):
            vh, jh = v[view]['hough'], j[view]['hough']
            r[f'{view}_counts_equal_video_lane'] = all(vh[k] == jh[k] for k in ('segments_total', 'segments_in_quad', 'string_like', 'fret_like') if k in vh)
            r[f'{view}_counts'] = {k: vh[k] for k in ('segments_total', 'segments_in_quad', 'string_like', 'fret_like') if k in vh}
        jr = j['rectified']['hough']
        r['fret_clusters_equal_video_lane'] = [round(x, 1) for x in jr['fret_x_cluster_means']] == v['rectified']['hough']['fret_x_clusters_px_from_nut']
        r['string_clusters_equal_video_lane'] = [round(x, 1) for x in jr['string_y_cluster_means']] == v['rectified']['hough']['string_y_clusters_px_from_upper_edge']
        r['axis_equal'] = round(j['unrectified']['neck_axis_deg'], 2) == v['unrectified']['neck_axis_deg']
        r['width_equal'] = round(j['unrectified']['fretboard_width_px'], 1) == v['unrectified']['fretboard_width_px']
        r['homography_rounded6_equal_video_lane'] = np.round(np.array(j['homography_full']), 6).tolist() == v['homography_img_to_rect']
        ref = cv2.cvtColor(cv2.imread(f'{PNG[lab]}/{lab}_{t}_rectified.png'), cv2.COLOR_BGR2RGB)
        js = np.fromfile(f'{rectdir}/{lab}_{t}_{mode}_rect.rgb', np.uint8).reshape(ref.shape)
        dd = np.abs(ref.astype(int) - js.astype(int))
        r['rect_bytes_differing_vs_video_lane_png'] = [int(np.count_nonzero(dd)), int(dd.size), int(dd.max())]
        if pyref:
            p = pyref['frames'][lab][q]
            for view in ('unrectified', 'rectified'):
                r[f'{view}_segments_same_order'] = p[view]['hough_segments'] == j[view]['hough_segments']
                r[f'{view}_edge_pixels_equal'] = p[view]['edge_pixels'] == j[view]['edge_pixels']
            r['mask_pixels_equal'] = p['unrectified']['mask_pixels'] == j['unrectified']['mask_pixels']
            r['homography_bit_identical_pyref'] = p['homography_full'] == j['homography_full']
            # pyref vs video lane JSON in every field except times
            r['pyref_equals_video_lane_json_except_times'] = strip_times(p) == strip_times(v)
            pp = cv2.imread(f'{os.path.dirname(sys.argv[4])}/{lab}_{t}_rectified.png')
            r['pyref_png_equals_video_lane_png'] = bool(np.array_equal(pp, cv2.imread(f'{PNG[lab]}/{lab}_{t}_rectified.png')))
        r['js_times_ms'] = [[round(a, 1), round(b, 1)] for a, b in j['repeat_ms_unrect_rect']]
        if 'browser_decode_ms' in jf:
            r['img_decode'] = [round(jf['browser_decode_ms'], 1), jf['bytes_differing_from_cv2_imread'], jf['max_abs_byte_diff']]
        out[f'{lab}/{t}'] = r
print(json.dumps(out, indent=1))
