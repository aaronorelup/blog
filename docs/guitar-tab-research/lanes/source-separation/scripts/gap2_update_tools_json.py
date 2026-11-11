#!/usr/bin/env python3
"""gap2_update_tools_json.py: write the gap round 2 facts of trials.md into tools.json (same keys as the existing
entries). Idempotent: run it again and it replaces what it wrote before (runs are matched by run_id).
Usage: python3 -I gap2_update_tools_json.py <tools.json>"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path))
T = {t["name"]: t for t in d["tools"]}
GR = "gap round 2 (trials.md, \"Gap round 2\")"


def put_run(tool, run):
    tool["runs"] = [r for r in (tool.get("runs") or []) if r["run_id"] != run["run_id"]] + [run]


def add_unverified(tool, items, drop_prefixes=()):
    u = [x for x in (tool.get("unverified") or []) if not any(x.startswith(p) for p in drop_prefixes)]
    for x in items:
        if x not in u:
            u.append(x)
    tool["unverified"] = u


ORT_NOTE = ("not a 2-core figure (corrected in gap round 2): ONNX Runtime's thread count is not set, and with that "
            "default the re-runs r0610 / r0615 had ORT worker threads pinned to CPUs 1, 2 and 3 while the job's "
            "slot was CPUs 0-1")

# --- Gaborformer: install refused --------------------------------------------------------------------------------
g = T["Gaborformer (sevagh)"]
g["not_run_reason"] = ("No PyPI package (pypi.org/pypi/gaborformer/json: HTTP 404); installing the cloned repository "
                       "(uv pip install <clone>) was refused by the session's permission system: 'Reason: [Code from "
                       "External]', 2026-11-11 00:21 UTC; weights not downloaded (" + GR + ")")
g["for_aaron"] = True
g["outputs"] = ["<out>/<input name>/{vocals,drums,bass,other}.wav, 44.1 kHz stereo, 32-bit float "
                "(sf.write(..., 44100, subtype='FLOAT'))"]
g["constraints_accepted"] = ["--cpu", "--batch-size", "--out", "--weights", "--offline", "--revision",
                             "--precision bf16|fp16|fp32", "--overlap (default 0.5)", "--compile"]
add_unverified(g, ["Not run here: install of the clone refused (gap round 2); steps in for-aaron.md item 8",
                   "separate.py: 'on the CPU the model runs in fp32' (read, not run)"], drop_prefixes=("Not run here",))

# --- demucs-onnx: thread caveat and the re-runs ---------------------------------------------------------------------
o = T["demucs-onnx (StemSplit) with StemSplitio ONNX repos"]
for r in o["runs"]:
    if r["run_id"] in ("r0471", "r0548"):
        r.setdefault("metrics", {})["cores_note"] = ORT_NOTE
put_run(o, {"run_id": "r0610", "input_id": "S4", "cores": 2, "wall_s": 57.8, "peak_mb": 8051.0, "exit_code": 0,
            "output_files": ["bass.wav", "drums.wav", "guitar.wav", "other.wav", "piano.wav", "vocals.wav"],
            "metrics": {"cpu_s": 98.95, "load1_start": 3.16, "ort_intra_op_threads": "default (not set)",
                        "slot_cpus": "0-1", "max_threads_at_once": 7,
                        "cpu_s_by_thread_allowed_cpus": {"0-1": 31.87, "1": 22.74, "2": 21.99, "3": 21.76},
                        "cores_note": ORT_NOTE, "rerun_of": "r0471",
                        "note": "stems sample-identical to r0471's (scores e1417); probe samples/gap2-ort/probe_onnx-default_S4.json"}})
put_run(o, {"run_id": "r0612", "input_id": "S4", "cores": 2, "wall_s": 61.33, "peak_mb": 6203.9, "exit_code": 0,
            "output_files": ["bass.wav", "drums.wav", "guitar.wav", "other.wav", "piano.wav", "vocals.wav"],
            "metrics": {"cpu_s": 71.12, "load1_start": 5.97, "ort_intra_op_threads": 2, "slot_cpus": "0-1",
                        "max_threads_at_once": 5, "cpu_s_by_thread_allowed_cpus": {"0-1": 70.49},
                        "how": "scripts/gap2_ort_threads.py sets sess_options.intra_op_num_threads = 2",
                        "note": "stems sample-identical to r0471's (scores e1417); probe samples/gap2-ort/probe_onnx-ort2_S4.json"}})
o["constraints_accepted"] = sorted(set(o.get("constraints_accepted") or []) | {
    "ONNX Runtime intra_op_num_threads (not exposed by the CLI; set here by wrapping onnxruntime.InferenceSession)"})

# --- MDX-Net through audio-separator: same caveat -----------------------------------------------------------------
for name in ("MDX-Net (KUIELab; UVR MDX-Net models)", "python-audio-separator (audio-separator) with the UVR model zoo"):
    m = T[name]
    for r in m["runs"]:
        if r["run_id"] in ("r0487", "r0503"):
            r.setdefault("metrics", {})["cores_note"] = ORT_NOTE
    put_run(m, {"run_id": "r0615", "input_id": "S4", "cores": 2, "wall_s": 85.76, "peak_mb": 3166.0, "exit_code": 0,
                "output_files": ["instrumental.wav", "vocals.wav"],
                "metrics": {"model": "MDX-Net: UVR-MDX-NET-Inst_HQ_3.onnx", "cpu_s": 142.58, "load1_start": 6.63,
                            "ort_intra_op_threads": "default (not set)", "slot_cpus": "0-1", "max_threads_at_once": 15,
                            "cpu_s_by_thread_allowed_cpus": {"0-1": 56.92, "1": 28.34, "2": 28.19, "3": 27.87},
                            "cores_note": ORT_NOTE, "rerun_of": "r0487",
                            "note": "stems sample-identical to r0487's (scores e1422); probe samples/gap2-ort/probe_mdx-default_S4.json"}})
    put_run(m, {"run_id": "r0619", "input_id": "S4", "cores": 2, "wall_s": 66.38, "peak_mb": 3166.6, "exit_code": 0,
                "output_files": ["instrumental.wav", "vocals.wav"],
                "metrics": {"model": "MDX-Net: UVR-MDX-NET-Inst_HQ_3.onnx", "cpu_s": 93.76, "load1_start": 6.13,
                            "ort_intra_op_threads": 2, "slot_cpus": "0-1", "max_threads_at_once": 13,
                            "cpu_s_by_thread_allowed_cpus": {"0-1": 92.6},
                            "how": "scripts/gap2_ort_threads.py sets sess_options.intra_op_num_threads = 2",
                            "note": "stems sample-identical to r0487's (scores e1422); probe samples/gap2-ort/probe_mdx-ort2_S4.json"}})

# --- Banquet: refused ---------------------------------------------------------------------------------------------
b = T["Banquet (query-bandit)"]
b["not_run_reason"] = ("Gap round 2 (corrected; the disk notice is no longer the reason): running the README's "
                       "'python train.py inference_byoq' from the cloned repository was refused by the session's "
                       "permission system, 'Reason: [Code from External]', 2026-11-11 00:33 UTC; no weights "
                       "downloaded (smallest checkpoint 551,785,899 bytes; PaSST openmic weights 341,546,630 bytes)")
b["inputs"] = ["mixture audio file (torchaudio.load), resampled to 44.1 kHz",
               "query audio file (torchaudio.load), resampled to 44.1 kHz and cut or tiled to exactly 10 s; inside "
               "the model its channels are averaged to mono (torch.mean(qaudio, dim=1)), resampled to 32 kHz, and "
               "PaSST (get_basic_model(mode='embed_only', arch='openmic')) turns it into one 768-number embedding "
               "that conditions the separator through FiLM (read from the code, head 79ed5bb; not run)"]
b["outputs"] = ["one waveform per call: the estimate of the stem that sounds like the query, with the mixture's "
                "channels and length (chunks of 6.0 s, hop 0.5 s, Hann-window overlap-add, trimmed to the mixture "
                "length), resampled back to the mixture's rate, written with ta.save(output_path, estimate, fsm)"]
add_unverified(b, ["Not run here: running the clone's train.py was refused by the permission system (gap round 2)"])

# --- AudioSep: disk floor ------------------------------------------------------------------------------------------
a = T["AudioSep (Separate Anything You Describe)"]
a["not_run_reason"] = ("Gap round 2 (corrected; the 200 MB notice is no longer the reason): with 7,403 MB free at "
                       "2026-11-11 00:42 UTC the 3,617,315,079 bytes of checkpoints would have left about 3,950 MB, "
                       "under the 4 GB of free disk that round had to keep; nothing downloaded. Its route also runs a "
                       "cloned repository's code (from pipeline import ...), which the permission system refused for "
                       "Gaborformer and Banquet in the same round; not attempted for AudioSep. Whether a 10 s CPU run "
                       "is feasible is still UNVERIFIED")
add_unverified(a, ["README imports 'inference' from pipeline, but pipeline.py (head 944583f) defines "
                   "separate_audio(model, audio_file, text, output_file, device='cuda', use_chunk=False) and no "
                   "'inference' (read in gap round 2, not run)"])

# --- the guitar fine-tune: run -------------------------------------------------------------------------------------
f = T["adityalakhani/htdemucs-6s-guitar-ft"]
f["tried"] = True
f["tried_how"] = "local-cpu"
f["not_run_reason"] = None
f["for_aaron"] = True
f["outputs"] = ["six sources drums, bass, other, vocals, guitar, piano (the repository's inference.py writes only "
                "source 4, guitar), 44.1 kHz stereo; written here as PCM_24 like that script"]
f["constraints_accepted"] = ["--checkpoint", "--device auto|cuda|cpu", "--shifts", "--overlap"]
SC = lambda a, b, c, e: {"si_sdr_db": a, "sdr_db": b, "sir_db": c, "sar_db": e}
HOW = ("scripts/gap2_guitar_ft.py: the steps of the repository's inference.py (read, not run) with demucs 4.1.0; "
       "shifts 1, overlap 0.25, segment 7.8, seed 0, no input normalisation, clamp to [-1, 1], PCM_24")
put_run(f, {"run_id": "r0636", "input_id": "S4", "cores": 2, "wall_s": 25.98, "peak_mb": 1606.5, "exit_code": 0,
            "output_files": ["drums.wav", "bass.wav", "other.wav", "vocals.wav", "guitar.wav", "piano.wav"],
            "metrics": {"cpu_s": 44.8, "load1_start": 1.48, "how": HOW, "eval_id": "e1831",
                        "scores": {"drums": SC(7.98, 8.58, 22.44, 8.79), "bass": SC(7.85, 9.02, 20.95, 9.35),
                                   "guitar": SC(6.10, 6.35, 10.43, 8.87), "lead": SC(7.85, 8.31, 14.22, 9.76)},
                        "score_map": "drums=drums, bass=bass, guitar=guitar, lead=vocals",
                        "stem_sum_residual_db": -11.13,
                        "projection_true_guitar": {"guitar": 0.898},
                        "guitar_stem_also_holds": {"true_bass": 0.121, "true_drums": 0.147, "true_lead": 0.161},
                        "control_stock_htdemucs_6s_same_script": {"run_id": "r0638", "eval_id": "e1832",
                                                                  "guitar": SC(1.73, 3.40, 14.65, 3.89),
                                                                  "projection_true_guitar": {"guitar": 0.345, "piano": 0.218}}}})
put_run(f, {"run_id": "r0637", "input_id": "R2", "cores": 2, "wall_s": 31.66, "peak_mb": 1644.9, "exit_code": 0,
            "output_files": ["drums.wav", "bass.wav", "other.wav", "vocals.wav", "guitar.wav", "piano.wav"],
            "metrics": {"cpu_s": 48.8, "load1_start": 2.38, "how": HOW, "eval_id": "e1835",
                        "scores": {"instrumental": SC(6.78, 7.75, 19.39, 8.11), "vocals": SC(13.21, 13.54, 18.85, 15.11)},
                        "score_map": "instrumental=drums+bass+other+guitar+piano, vocals_derived=vocals",
                        "stem_sum_residual_db": -12.44, "vocals_samples_at_full_scale": 40}})
put_run(f, {"run_id": "r0640", "input_id": "S6taps", "cores": 2, "wall_s": 22.45, "peak_mb": 1566.9, "exit_code": 0,
            "output_files": ["drums.wav", "bass.wav", "other.wav", "vocals.wav", "guitar.wav", "piano.wav"],
            "metrics": {"cpu_s": 39.2, "load1_start": 4.28, "how": HOW, "eval_id": "e1833",
                        "scores": {"guitar": SC(3.02, 4.07, 17.70, 4.33), "taps": SC(2.91, 11.22, 24.92, 11.42)},
                        "score_map": "guitar=guitar, taps=drums", "stem_sum_residual_db": -8.40,
                        "control_stock_htdemucs_6s_same_script": {"run_id": "r0644", "eval_id": "e1834",
                                                                  "guitar": SC(-7.75, 0.34, 29.56, 0.35),
                                                                  "taps": SC(7.17, 10.58, 25.57, 10.73)}}})
put_run(f, {"run_id": "r0642", "input_id": "S2s", "cores": 2, "wall_s": 22.28, "peak_mb": 1576.6, "exit_code": 0,
            "output_files": ["drums.wav", "bass.wav", "other.wav", "vocals.wav", "guitar.wav", "piano.wav"],
            "metrics": {"cpu_s": 39.0, "load1_start": 3.97, "how": HOW, "stem_sum_residual_db": -5.70,
                        "stem_rms_dbfs": {"piano": -24.55, "guitar": -36.63, "bass": -52.44, "other": -55.54,
                                          "vocals": -59.18, "drums": -60.49}, "mix_rms_dbfs": -18.23}})
add_unverified(f, ["Run here through scripts/gap2_guitar_ft.py with demucs 4.1.0, not through the repository's own "
                   "inference.py (pinned demucs 4.0.1); checkpoint = training snapshot, epoch 60, val_sdr_db 6.0798"],
               drop_prefixes=("Steps for Aaron in for-aaron.md item 5",))

# --- Demucs: whole-song runs with 4 cores, and a 2-core run in the same session -----------------------------------
dm = T["Demucs v4 (htdemucs, htdemucs_ft, htdemucs_6s, mdx_extra)"]
FOUR = ["drums.wav", "bass.wav", "other.wav", "vocals.wav"]
put_run(dm, {"run_id": "r0659", "input_id": "R2full", "cores": 4, "wall_s": 263.9, "peak_mb": 1776.6, "exit_code": 0,
             "output_files": FOUR,
             "metrics": {"model": "htdemucs", "cpu_s": 684.6, "load1_start": 0.98, "all_cores": True,
                         "stem_sum_residual_db": -25.74, "frames_per_stem": 10076073,
                         "stem_rms_dbfs": {"vocals": -15.80, "other": -18.64, "bass": -21.25, "drums": -24.61},
                         "note": "audio deleted after the facts were taken (gap round 2)"}})
put_run(dm, {"run_id": "r0660", "input_id": "R2full", "cores": 4, "wall_s": 109.55, "peak_mb": 2176.1, "exit_code": 0,
             "output_files": FOUR + ["guitar.wav", "piano.wav"],
             "metrics": {"model": "htdemucs_6s", "cpu_s": 334.0, "load1_start": 6.22, "all_cores": True,
                         "stem_sum_residual_db": -22.01, "frames_per_stem": 10076073,
                         "stem_rms_dbfs": {"vocals": -15.76, "guitar": -19.20, "bass": -20.93, "drums": -25.08,
                                           "other": -46.49, "piano": -49.95},
                         "note": "audio deleted after the facts were taken (gap round 2)"}})
put_run(dm, {"run_id": "r0669", "input_id": "R2full", "cores": 4, "wall_s": 363.56, "peak_mb": 1740.2, "exit_code": 0,
             "output_files": FOUR,
             "metrics": {"model": "htdemucs", "cpu_s": 819.0, "load1_start": 2.63, "all_cores": True,
                         "other_processes_cpu_s": 622.0, "box_busy_cpu_s": 1438.1, "sampled_s": 368.8,
                         "mean_load1": 6.5,
                         "note": "repeat of r0659 with scripts/gap2_box_sampler.py; audio deleted (gap round 2)"}})
put_run(dm, {"run_id": "r0677", "input_id": "R2full", "cores": 2, "wall_s": 277.63, "peak_mb": 1763.8, "exit_code": 0,
             "output_files": FOUR,
             "metrics": {"model": "htdemucs", "cpu_s": 356.8, "load1_start": 5.25,
                         "other_processes_cpu_s": 723.5, "box_busy_cpu_s": 1079.1, "sampled_s": 284.6,
                         "mean_load1": 6.26,
                         "note": "2-core run in the same session as r0669, with scripts/gap2_box_sampler.py; audio deleted (gap round 2)"}})

with open(path, "w") as fh:
    fh.write(json.dumps(d, indent=1, ensure_ascii=False))  # the file's existing layout (no trailing newline)
print("updated", path)
