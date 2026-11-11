"""Apply gap round 2's changes to this lane's tools.json (idempotent: entries are found by name and replaced).

usage: python3 -I update_tools_json.py <tools.json>
Every value here is copied from trials.md "Gap round 2" and survey.md section 55 (and, for gap B2, the OpenCV.js
section of "Gap round 2"); see those files for sources and how each number was measured.
"""
import json
import sys

path = sys.argv[1]
with open(path) as f:
    doc = json.load(f)
tools = doc["tools"]


def find(name):
    for t in tools:
        if t["name"] == name:
            return t
    return None


def upsert_after(after_name, entry):
    old = find(entry["name"])
    if old is not None:
        tools[tools.index(old)] = entry
        return
    i = tools.index(find(after_name))
    tools.insert(i + 1, entry)


def add_runs(entry, runs):
    have = {r["run_id"] for r in entry["runs"]}
    entry["runs"].extend(r for r in runs if r["run_id"] not in have)


SLOT = "2-core gtr-run slot (pinned)"
MEM_NOTE = "peak_mb = renderer VmHWM read from /proc by scripts/gap2/drive_gap2.mjs (the ledger's max_rss misses the renderer)"

# ---- B1: htdemucs_6s ONNX in ONNX Runtime Web -------------------------------------------------------------------
B1 = {
    "name": "htdemucs_6s ONNX export (StemSplitio/htdemucs-6s-onnx) in ONNX Runtime Web",
    "kind": "research-model",
    "what": "StemSplit's ONNX export of Demucs htdemucs_6s (stems drums, bass, other, vocals, guitar, piano): waveform in, waveforms out, STFT inside the graph; run in the page with ONNX Runtime Web 1.31.1 (wasm) and the chunked overlap-add of demucs-onnx 0.3.4 ported to JavaScript.",
    "url": "https://huggingface.co/StemSplitio/htdemucs-6s-onnx",
    "version": "revision 49df9b6989cf2150840ea65b0bef77a2e471b678 (2026-05-21); htdemucs_6s_fp16weights.onnx 136,428,532 bytes, sha256 7ce55792...; onnxruntime-web 1.31.1; demucs-onnx 0.3.4 (overlap-add, native reference)",
    "tried": True,
    "tried_how": "browser-headless",
    "runs": [
        {"run_id": "r0593", "input_id": "S4_10s", "cores": 2, "wall_s": 11.6, "peak_mb": 4384.0, "exit_code": 0, "output_files": ["samples/htdemucs-6s-onnx-web/run_t2.json"],
         "metrics": {"cpu_slot": SLOT, "graph_optimization": "all", "threads": 2, "outcome": "InferenceSession.create threw after 9.9 s: Can't create a session. ERROR_CODE: 6, ERROR_MESSAGE: std::bad_alloc", "note": MEM_NOTE}},
        {"run_id": "r0606", "input_id": "S4_10s", "cores": 2, "wall_s": 7.73, "peak_mb": 4386.2, "exit_code": 0, "output_files": ["samples/htdemucs-6s-onnx-web/run_t2_optbasic.json"],
         "metrics": {"cpu_slot": SLOT, "graph_optimization": "basic", "threads": 2, "outcome": "the same std::bad_alloc after 6.5 s"}},
        {"run_id": "r0617", "input_id": "S4_10s", "cores": 2, "wall_s": 9.46, "peak_mb": 4381.4, "exit_code": 0, "output_files": ["samples/htdemucs-6s-onnx-web/run_t2_optall_noarena.json"],
         "metrics": {"cpu_slot": SLOT, "graph_optimization": "all, enableCpuMemArena false", "threads": 2, "outcome": "the same std::bad_alloc after 8.2 s"}},
        {"run_id": "r0597", "input_id": "S4_10s", "cores": 2, "wall_s": 49.7, "peak_mb": 1319.1, "exit_code": 0,
         "output_files": ["out/htdemucs6s-web/S4_10s_t2_optdisabled_<stem>.wav", "samples/htdemucs-6s-onnx-web/run_t2_optdisabled.json"],
         "metrics": {"cpu_slot": SLOT, "graph_optimization": "disabled", "threads": 2, "session_create_s": 15.65, "separate_s_for_10_s": 29.09, "chunk_s": [13.95, 15.04],
                     "renderer_cpu_per_wall_separation": 1.656, "stem_sum_minus_mix_db": -12.93,
                     "gtr_eval_e1765_si_sdr_sdr_sir_sar_db": {"drums": [8.76, 9.52, 21.10, 9.86], "bass": [6.90, 9.30, 19.54, 9.78], "guitar": [-0.35, 2.37, 15.11, 2.74], "lead=vocals": [7.31, 8.39, 13.06, 10.41]},
                     "true_guitar_projection": {"guitar": 0.2146, "piano": 0.3507, "vocals": 0.1265, "bass": 0.0249, "drums": 0.0220, "other": 0.0007},
                     "vs_native_db": "-41.4 (guitar) to -61.4 (bass) dB against the native ORT outputs, with the same input and optimization level"}},
        {"run_id": "r0607", "input_id": "S4_10s", "cores": 2, "wall_s": 51.45, "peak_mb": 1216.1, "exit_code": 0, "output_files": ["out/htdemucs6s-web/S4_10s_t4_optdisabled_<stem>.wav"],
         "metrics": {"cpu_slot": SLOT, "graph_optimization": "disabled", "threads": 4, "session_create_s": 16.65, "separate_s_for_10_s": 30.25, "renderer_cpu_per_wall_separation": 1.929, "stems": "sample-identical to r0597"}},
        {"run_id": "r0613", "input_id": "S4_10s", "cores": 2, "wall_s": 75.36, "peak_mb": 1204.3, "exit_code": 0, "output_files": ["out/htdemucs6s-web/S4_10s_t1_optdisabled_<stem>.wav"],
         "metrics": {"cpu_slot": SLOT, "graph_optimization": "disabled", "threads": 1, "session_create_s": 16.89, "separate_s_for_10_s": 52.73, "renderer_cpu_per_wall_separation": 0.823, "stems": "sample-identical to r0597"}},
        {"run_id": "r0596", "input_id": "S4_10s", "cores": 2, "wall_s": 18.52, "peak_mb": 7099.5, "exit_code": 0, "output_files": ["out/htdemucs6s-native/"],
         "metrics": {"cpu_slot": SLOT, "what": "native reference: demucs-onnx 0.3.4 functions, onnxruntime 1.31.1 CPU EP, ORT_ENABLE_ALL", "session_create_s": 8.79, "separate_s": 8.86, "gtr_eval_e1766_guitar_si_sdr_sdr_sir_sar_db": [-0.38, 2.36, 15.13, 2.73]}},
        {"run_id": "r0603", "input_id": "S4_10s", "cores": 2, "wall_s": 26.48, "peak_mb": 1793.7, "exit_code": 0, "output_files": ["out/htdemucs6s-native-optdisabled/"],
         "metrics": {"cpu_slot": SLOT, "what": "native reference, ORT_DISABLE_ALL", "session_create_s": 12.28, "separate_s": 13.76}},
        {"run_id": "r0611", "input_id": "S4_10s (Chromium-decoded samples)", "cores": 2, "wall_s": 42.4, "peak_mb": 1793.5, "exit_code": 0, "output_files": ["out/htdemucs6s-native-chromiuminput-optdisabled/"],
         "metrics": {"cpu_slot": SLOT, "what": "native reference, ORT_DISABLE_ALL, fed the float32 samples Chromium's decodeAudioData returned (r0608)"}},
        {"run_id": "r0608", "input_id": "S4_10s", "cores": None, "wall_s": 2.04, "peak_mb": None, "exit_code": 0, "output_files": ["out/htdemucs6s-web/S4_10s_decoded_by_chromium.wav"],
         "metrics": {"cpu_slot": "none (gtr-run --nolock, light)", "what": "decodeAudioData of the 16-bit WAV: negative samples x/32768, positive samples x * float32(1/32767); soundfile: x/32768 for all"}},
    ],
    "not_run_reason": None,
    "for_aaron": False,
    "callable_via": ["js-browser", "wasm", "python"],
    "inputs": ["mix: float32 tensor (1, 2, 343980), stereo 44.1 kHz, a 7.8 s segment, values in [-1, 1]"],
    "outputs": ["stems: float32 tensor (1, 6, 2, 343980), rows drums, bass, other, vocals, guitar, piano"],
    "constraints_accepted": [
        "segment length fixed in the graph (343,980 samples); longer audio by chunked overlap-add (demucs-onnx _chunked_separate_single / infer.py separate)",
        "ONNX Runtime session options: graphOptimizationLevel (all and basic threw std::bad_alloc in WebAssembly here; disabled ran), numThreads",
    ],
    "license": {
        "code": {"spdx": "MIT (card licence field mit; demucs-onnx LICENSE MIT)", "quote": "This repo is **MIT-licensed**, matching the original HT-Demucs.", "url": "https://huggingface.co/StemSplitio/htdemucs-6s-onnx/raw/main/README.md"},
        "weights": {"name": "Meta's htdemucs_6s weights converted to ONNX", "quote": "The 6 source variant of htdemucs was trained only on Meta internal dataset, which likely means CC-NC-BY license is applicable, as it was the case for all models released by FAIR.", "url": "https://raw.githubusercontent.com/adefossez/demucs/main/README.md"},
        "training_data": [{"name": "Meta internal dataset (htdemucs_6s)", "license": None, "quote": "The 6 source variant of htdemucs was trained only on Meta internal dataset, which likely means CC-NC-BY license is applicable, as it was the case for all models released by FAIR.", "url": "https://raw.githubusercontent.com/adefossez/demucs/main/README.md"}],
        "service_terms": [],
    },
    "pricing": None,
    "handoffs_out": [{"to": "Basic Pitch for the browser", "via_format": "the guitar row of stems as a Float32Array at 44.1 kHz, resampled to 22,050 Hz mono", "evidence": "survey.md section 55 (not run as a pipeline)"}],
    "unverified": [
        "which kernels of the WebAssembly build cause the -41.4 to -61.4 dB difference from the native ORT outputs was not looked into",
        "the maker's speed, memory and parity figures (Apple M4 Pro) were not measured here",
        "graphOptimizationLevel extended, enableMemPattern false, the fp32 file, the proxy worker and WebGPU/WebNN were not tried",
    ],
}


def apply_b1():
    upsert_after("Ghilda/htdemucs-onnx", B1)
    ort = find("ONNX Runtime Web")
    add_runs(ort, [
        {"run_id": "r0597", "input_id": "S4_10s", "cores": 2, "wall_s": 49.7, "peak_mb": 1319.1, "exit_code": 0, "output_files": ["samples/htdemucs-6s-onnx-web/"],
         "metrics": {"cpu_slot": SLOT, "what": "htdemucs_6s on the wasm provider, 2 threads, graph optimization disabled; see the htdemucs_6s entry",
                     "thread_binding": "every renderer thread had Cpus_allowed_list 0-1 and last ran on CPU 0 or 1 at every sample; renderer CPU/wall 1.656"}},
        {"run_id": "r0607", "input_id": "S4_10s", "cores": 2, "wall_s": 51.45, "peak_mb": 1216.1, "exit_code": 0, "output_files": ["samples/htdemucs-6s-onnx-web/"],
         "metrics": {"cpu_slot": SLOT, "what": "4 threads requested inside a 2-core slot", "numThreads_after_create": 4, "worker_threads": 3,
                     "thread_binding": "all threads on CPUs 0-1; renderer CPU/wall over the separation 1.929", "hardwareConcurrency": 2}},
        {"run_id": "r0613", "input_id": "S4_10s", "cores": 2, "wall_s": 75.36, "peak_mb": 1204.3, "exit_code": 0, "output_files": ["samples/htdemucs-6s-onnx-web/"],
         "metrics": {"cpu_slot": SLOT, "what": "1 thread (no worker thread)", "thread_binding": "CPUs 2-3 only; renderer CPU/wall 0.823"}},
        {"run_id": "r0593", "input_id": "S4_10s", "cores": 2, "wall_s": 11.6, "peak_mb": 4384.0, "exit_code": 0, "output_files": [],
         "metrics": {"cpu_slot": SLOT, "what": "htdemucs_6s session creation with graphOptimizationLevel all: std::bad_alloc (also r0606 basic, r0617 all without the CPU memory arena)"}},
    ])
    c = "htdemucs_6s session creation with graphOptimizationLevel all or basic threw std::bad_alloc with the renderer at 4,381-4,386 MB (the docs: WebAssembly memory limit 4 GB; trials.md, Gap round 2)"
    ort["constraints_accepted"] = [x for x in ort["constraints_accepted"] if not x.startswith("WebAssembly memory 4 GB in practice")]
    if c not in ort["constraints_accepted"]:
        ort["constraints_accepted"].append(c)
    w = find("webnn/stem-separator")
    w["not_run_reason"] = ("Not tried (trials.md). The card says it cascades to WebGPU/WASM, so a WASM run would not need a GPU; weights about 168 MB. "
                           "(corrected in gap round 2: the earlier text added 'disk notice on the shared box', which trials.md does not give as this tool's reason; "
                           "gap round 2 ran the 6-stem export StemSplitio/htdemucs-6s-onnx for a guitar stem instead and did not try this 4-stem model.)")


apply_b1()
with open(path, "w") as f:   # the file's own format: indent 1, UTF-8, no trailing newline
    json.dump(doc, f, indent=1, ensure_ascii=False)
print("tools:", len(tools))
