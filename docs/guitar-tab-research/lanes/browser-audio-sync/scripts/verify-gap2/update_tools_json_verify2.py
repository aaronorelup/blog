"""Verifier (round 2) edits to tools.json: the native reference runs are not 2-core figures (ORT default threads),
the verifier's re-runs, and the R3c OpenCV.js runs. Run once: python3 -I update_tools_json_verify2.py <tools.json>"""
import json, sys
path = sys.argv[1]
doc = json.load(open(path))
T = {t['name']: t for t in doc['tools']}
H = T['htdemucs_6s ONNX export (StemSplitio/htdemucs-6s-onnx) in ONNX Runtime Web']
NOTE = ("started in a 2-core gtr-run slot, but ONNX Runtime ran with its default thread setting; in the verifier's "
        "re-run of r0603's command (r0696) the worker threads were pinned one each to CPUs 1, 2 and 3 whatever the slot, so "
        "this is not a 2-core figure (verifier, round 2; no probe ran in this run itself)")
for r in H['runs']:
    if r['run_id'] in ('r0596', 'r0603', 'r0611'):
        r['cores'] = None
        r['metrics']['cpu_slot'] = NOTE
H['runs'] += [
 {"run_id": "r0687", "input_id": "S4_10s", "cores": 2, "wall_s": 51.32, "peak_mb": 1209.0, "exit_code": 0,
  "output_files": ["verify-gap2/out/htdemucs6s-web/ (outside git)", "samples/verify-gap2/"],
  "metrics": {"cpu_slot": "2-core gtr-run slot (pinned)", "what": "verifier's re-run of r0597 (2 threads, graph optimization disabled)",
              "session_create_s": 15.21, "separate_s_for_10_s": 30.97, "renderer_cpu_per_wall_separation": 1.582,
              "stems": "all six WAV files byte-identical to r0597's", "thread_binding": "every listed renderer thread allowed on 0-1 and last seen on CPU 0 or 1"}},
 {"run_id": "r0696", "input_id": "S4_10s", "cores": None, "wall_s": 30.77, "peak_mb": 1796.4, "exit_code": 0,
  "output_files": ["samples/verify-gap2/probe_native_optdisabled_default.json"],
  "metrics": {"cpu_slot": "gtr-run slot 0-1; ORT default threads: main thread on CPUs 0-1, three worker threads allowed only on CPU 1, CPU 2 and CPU 3 (a /proc probe every 0.25 s)",
              "what": "verifier's re-run of r0603 (native reference, ORT_DISABLE_ALL, default threads) inside a thread probe",
              "cpu_s_by_allowed_cpus": {"0-1": 23.99, "1": 8.88, "2": 8.32, "3": 8.9},
              "session_create_s": 13.31, "separate_s": 16.51, "stems": "sample-identical to r0603's"}},
 {"run_id": "r0697", "input_id": "S4_10s", "cores": 2, "wall_s": 22.31, "peak_mb": 1794.8, "exit_code": 0,
  "output_files": ["samples/verify-gap2/probe_native_optdisabled_2threads.json"],
  "metrics": {"cpu_slot": "2-core gtr-run slot (pinned); ORT intra_op_num_threads=2 set by a wrapper, every thread allowed on 0-1",
              "what": "native reference, ORT_DISABLE_ALL, 2 ORT threads (verifier)", "session_create_s": 12.47, "separate_s": 9.24,
              "stems": "sample-identical to r0603's"}},
 {"run_id": "r0700", "input_id": "S4_10s", "cores": 2, "wall_s": 18.33, "peak_mb": 7862.5, "exit_code": 0,
  "output_files": ["samples/verify-gap2/probe_native_optall_2threads.json"],
  "metrics": {"cpu_slot": "2-core gtr-run slot (pinned); ORT intra_op_num_threads=2 set by a wrapper, every thread allowed on 0-1",
              "what": "native reference, ORT_ENABLE_ALL (demucs-onnx _make_session), 2 ORT threads (verifier)", "session_create_s": 8.79,
              "separate_s": 8.38, "stems": "sample-identical to r0596's"}},
 {"run_id": "r0701", "input_id": "S4_10s", "cores": 2, "wall_s": 1.68, "peak_mb": None, "exit_code": 0,
  "output_files": [],
  "metrics": {"cpu_slot": "2-core gtr-run slot (pinned)", "what": "verifier's re-run of r0608 (decodeAudioData check): decoded WAV byte-identical to r0608's"}},
]
O = T['OpenCV.js (@techstark/opencv-js)']
O['unverified'] = [u for u in O['unverified'] if not u.startswith('R3c was not run')]
O['runs'] += [
 {"run_id": "r0703", "input_id": "R3a_cu (frames 150, 0, 280), R3b and R3c (frames 225, 0, 449)", "cores": 2, "wall_s": 4.05, "peak_mb": 304.7, "exit_code": 0,
  "output_files": ["samples/verify-gap2/opencvjs_compare_raw.json"],
  "metrics": {"cpu_slot": "2-core gtr-run slot (pinned)", "what": "verifier's re-run of r0651 (input raw) with R3c added, R3c quad from the chains lane's r0532",
              "vs_r0651": "segment lists, homographies and rectified bytes identical on the 7 shared frame/quad pairs",
              "R3c_vs_opencv_python_5_0_0": "HoughLinesP segment lists identical (same order), counts, clusters, edge and mask pixels equal, homography identical; rectified images differ in 0, 0 and 1 bytes (of 468,000) by at most 1 level",
              "counts_frame_in_quad_string_fret": {"R3c 225": [433, 124, 75, 48], "R3c 0": [378, 108, 62, 46], "R3c 449": [392, 102, 57, 43]},
              "counts_rectified_string_fret": {"R3c 225": [117, 28, 29], "R3c 0": [139, 33, 19], "R3c 449": [116, 33, 30]},
              "ms_R3c_frame_step_rectified_step": [[46.7, 67.4], [16.4, 25.1]]}},
 {"run_id": "r0704", "input_id": "R3a_cu, R3b, R3c", "cores": 2, "wall_s": 4.34, "peak_mb": 361.0, "exit_code": 0,
  "output_files": ["samples/verify-gap2/opencvjs_compare_img.json"],
  "metrics": {"cpu_slot": "2-core gtr-run slot (pinned)", "what": "verifier's re-run of r0654 (Chromium decodes the PNG / JPEG) with R3c added",
              "results": "the same as r0703; Chromium's decode of the three R3c JPEGs gave the same bytes as cv2.imread (0 differ), 47.1-52.7 ms per frame"}},
 {"run_id": "r0702", "input_id": "R3a_cu, R3b, R3c", "cores": 2, "wall_s": 3.01, "peak_mb": 151.1, "exit_code": 0,
  "output_files": ["scripts/verify-gap2/opencv_lines_ref_verify.py"],
  "metrics": {"cpu_slot": "2-core gtr-run slot (pinned)", "what": "OpenCV-Python 5.0.0.93 reference with R3c added (verifier); its R3c output equals the chains lane's r0532 output in every field but the times, rectified PNGs pixel-identical"}},
]
with open(path, 'w') as f:   # the file's own format: indent 1, UTF-8, no trailing newline
    json.dump(doc, f, indent=1, ensure_ascii=False)
print('ok')
