"""verify-trials-browser-audio-sync: compare the verifier's re-runs (verify/out/) with the trial's outputs (out/).
Prints one block per page. Run with the lane's analysis venv (numpy, soundfile, librosa, mir_eval)."""
import json, os, csv, hashlib, numpy as np, soundfile as sf
L = "/home/user/gtr/lanes/browser-audio-sync/"; O = L + "out/"; V = L + "verify/out/"
def j(p):
    try: return json.load(open(p))
    except Exception as e: return {"_missing": str(e)}
def res(p): return j(p).get("result") or {}
def h(p):
    try: return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]
    except Exception: return None
def onsets(x, thr=0.05, quiet=4410):
    idx = np.flatnonzero(np.abs(x) > thr); out = []; last = -10**9
    for i in idx:
        if i - last > quiet: out.append(i)
        last = i
    return np.array(out, dtype=np.int64)
def say(*a): print(*a, flush=True)

say("== probe"); a = res(O + "probe/probe_headless_shell.json"); b = res(V + "probe/probe_headless_shell.json")
for k in ["hardwareConcurrency", "crossOriginIsolated", "canPlayType", "MediaSource_isTypeSupported", "VideoDecoder_isConfigSupported",
          "AudioDecoder_isConfigSupported", "VideoEncoder_isConfigSupported", "videoElement", "webgl", "webgpu", "wasm"]:
    say(" ", k, "same" if a.get(k) == b.get(k) else ("DIFF %s -> %s" % (json.dumps(a.get(k))[:120], json.dumps(b.get(k))[:120])))
for k in ["sampleRate", "baseLatency", "outputLatency", "renderQuantumSize"]:
    say(" ", "audio." + k, a.get("audio", {}).get(k), "->", b.get("audio", {}).get(k))

say("== sync buffer")
s4, _ = sf.read("/home/user/gtr/inputs/S4/S4.wav", dtype="float32"); s4m = s4.mean(axis=1)
beats = [float(l.split()[0]) for l in open("/home/user/gtr/inputs/S4/S4.beats.txt") if l.strip()]
from scipy.signal import fftconvolve
for tag, p in [("orig", O + "sync/sync_s4_buffer_busy0.wav"), ("rerun", V + "sync/sync_s4_buffer_busy0.wav")]:
    if not os.path.exists(p): say(" ", tag, "missing"); continue
    x, sr = sf.read(p, dtype="float32"); c = fftconvolve(x[:, 0], s4m[:441000][::-1], mode="valid"); lag = int(np.argmax(c))
    d = x[lag:lag + len(s4m), 0] - s4m[:len(x) - lag]; on = onsets(x[:, 1]); bf = lag + np.round(np.array(beats) * 44100).astype(int)
    dev = np.array([(on[np.argmin(np.abs(on - q))] - q) / 44.1 for q in bf])
    r = res(p.replace(".wav", ".json")); sched = r.get("start_frame_scheduled"); ff = (r.get("capture") or {}).get("firstFrame")
    say(" ", tag, "clicks", len(on), "of", len(bf), "maxdiff %.1e" % np.abs(d).max(), "dev ms min %.3f max %.3f mean %.3f" % (dev.min(), dev.max(), dev.mean()),
        "S4 start frame found - scheduled:", (lag + ff - sched) if (sched is not None and ff is not None) else None, "late", r.get("n_scheduled_late"))

say("== video mp4 (rVFC, seek)")
a = res(O + "video/video_mp4.json"); b = res(V + "video/video_mp4.json")
for part in ["play", "playid"]:
    for k in ["callbacks", "presentedFrames_step_counts", "identified", "shown_frame_minus_ref_frame_at_mediaTime_counts", "distinct_frames_shown"]:
        if k in a.get(part, {}) or k in b.get(part, {}): say(" ", part, k, a.get(part, {}).get(k), "->", b.get(part, {}).get(k))
    say(" ", part, "callback interval mean ms %.2f -> %.2f" % (a[part]["callback_interval_ms"]["mean"], b.get(part, {}).get("callback_interval_ms", {}).get("mean", float("nan"))))
sa = [(r["k"], r["where"], r["shown_frame"]) for r in a["seek"]["rows"]]; sb = [(r["k"], r["where"], r["shown_frame"]) for r in b.get("seek", {}).get("rows", [])]
say("  seek rows same shown frame:", sum(1 for x, y in zip(sa, sb) if x == y), "of", len(sa), "| rerun n_shown_equals_k", b.get("seek", {}).get("n_shown_equals_k"), "expected", b.get("seek", {}).get("n_shown_equals_expected"))

say("== metronome (busy 100)")
for m in ["lookahead", "tone"]:
    for tag, base in [("orig", O), ("rerun", V)]:
        r = res(base + "metronome/metronome_%s_busy100.json" % m)
        if not r: say(" ", m, tag, "missing"); continue
        d = r.get("deviation_ms", {})
        say(" ", m, tag, "clicks", r.get("n_onsets_detected"), "mean %.3f max %.3f" % (d.get("mean", float("nan")), d.get("max_abs", float("nan"))),
            "late", r.get("n_scheduled_late"), "nonzero", sum(1 for v in r.get("dev_all_ms", []) if abs(v) > 1e-9), "gaps", [(g["atFrame"], g["frames"]) for g in r["capture"]["gaps"]],
            "blocked s %.1f" % (r.get("busy", {}).get("blocked_ms", 0) / 1000), "underruns", r.get("playbackStats", {}).get("underrunEvents"))

say("== reference playback")
truth = json.load(open("/home/user/gtr/inputs/S2n/S2n.truth.json")); ref = np.array(sorted(set(round(n["onset"], 3) for n in truth["notes"])))
import librosa, mir_eval
tr, _ = sf.read("/home/user/gtr/inputs/S2n/S2n.mono.wav", dtype="float64")
for p in ["smplr", "sfplayer", "spessa", "jssynth"]:
    for tag, base in [("orig", O), ("rerun", V)]:
        r = res(base + "synths/synth_%s_S2n.json" % p); w = base + "synths/S2n_%s.wav" % p
        if not r or not os.path.exists(w): say(" ", p, tag, "missing", j(base + "synths/synth_%s_S2n.json" % p).get("status")); continue
        x, sr = sf.read(w, dtype="float64"); y = x.mean(axis=1)
        t = librosa.onset.onset_detect(y=y.astype(np.float32), sr=sr, hop_length=128, units="time")
        neg = sum(-g["frames"] for g in r["capture"]["gaps"] if g["frames"] < 0 and not g.get("handled"))
        if r.get("t0_frame") is not None:
            est = t - (r["t0_frame"] - r["capture"]["firstFrame"] + neg) / sr
        else:   # js-synthesizer: the constant shift that matches the most onsets within 50 ms, refined to the median
            best = (-1, 0.0)
            for s in {round(tt - rr, 4) for tt in t for rr in ref}:
                m = sum(1 for tt in t if np.min(np.abs(ref - (tt - s))) <= 0.05)
                if m > best[0]: best = (m, s)
            diffs = [tt - ref[np.argmin(np.abs(ref - (tt - best[1])))] for tt in t if np.min(np.abs(ref - (tt - best[1]))) <= 0.05]
            est = t - float(np.median(diffs))
        est = est[est >= 0]
        F, P, R = mir_eval.onset.f_measure(ref, est, window=0.05)
        n = min(len(tr), len(y)); cc = fftconvolve(y, tr[::-1], mode="full"); k = int(np.argmax(np.abs(cc)))
        lag = k - (len(tr) - 1); seg = y[max(lag, 0):max(lag, 0) + len(tr)]; tt = tr[:len(seg)]
        peak = float(seg @ tt / (np.linalg.norm(seg) * np.linalg.norm(tt) + 1e-12))
        say(" ", p, tag, "load_ms %.0f" % r.get("load_ms", float("nan")), "onsets", len(est), "F %.3f" % F, "xcorr peak %.5f lag %d" % (peak, lag),
            "underruns", r.get("playbackStats", {}).get("underrunEvents"))

say("== stretch")
for name in ["S1_element_0p75_pp1", "S1_soundtouch_0p5", "S1_rubberband_0p5", "S1_signalsmith_0p5"]:
    for tag, base in [("orig", O), ("rerun", V)]:
        w = base + "stretch/%s.wav" % name
        if not os.path.exists(w): say(" ", name, tag, "missing"); continue
        x, sr = sf.read(w, dtype="float64"); y = x.mean(axis=1); idx = np.flatnonzero(np.abs(y) > 10 ** (-50 / 20))
        say(" ", name, tag, "len %.3f span %.4f peak %.3f sha %s" % (len(y) / sr, (idx[-1] - idx[0]) / sr, np.abs(x).max(), h(w)))
    for tag, base in [("orig", O), ("rerun", V)]:
        r = res(base + "stretch/st_%s.json" % name.replace("S1_", ""))
        if r: say("   page", tag, "processing_ms", round(r.get("processing_ms", 0)), "out samples", (r.get("output") or {}).get("samples"))

say("== alphaTab")
a = res(O + "alphatab/alphatab_S2n.json"); b = res(V + "alphatab/alphatab_S2n.json")
say("  export: onsets", a.get("metronome", {}).get("n_onsets"), "->", b.get("metronome", {}).get("n_onsets"), "dev stats same:",
    a.get("metronome", {}).get("deviation_from_grid_ms") == b.get("metronome", {}).get("deviation_from_grid_ms"),
    "load_ms", round(a.get("load_ms", 0)), "->", round(b.get("load_ms", 0)), "render ms", round(a.get("metronome_render", {}).get("ms", 0)), "->", round(b.get("metronome_render", {}).get("ms", 0)))
for f in ["S2n_alphatab_metronome_only.wav", "S2n_alphatab_guitar_no_metronome.wav"]:
    say("   ", f, "sha orig", h(O + "alphatab/" + f), "rerun", h(V + "alphatab/" + f))
a = res(O + "alphatab/alphatab_live_countin.json"); b = res(V + "alphatab/alphatab_live_countin.json")
say("  count-in: clicks", a.get("clicks", {}).get("n"), "->", b.get("clicks", {}).get("n"), "intervals", a.get("clicks", {}).get("intervals_ms"), "->", b.get("clicks", {}).get("intervals_ms"),
    "first after play ms", a.get("clicks", {}).get("first_after_play_ms"), "->", b.get("clicks", {}).get("first_after_play_ms"), "taps", a.get("taps_after"), "->", b.get("taps_after"))
a = res(O + "alphatab/alphatab_live_external.json"); b = res(V + "alphatab/alphatab_live_external.json")
say("  external: calls", [c[:2] for c in a.get("handler_calls", [])], "->", [c[:2] for c in b.get("handler_calls", [])])
say("            events", a.get("position_events"), "->", b.get("position_events"), "checked", a.get("position_event_minus_audio_ms", {}).get("n"), "->", b.get("position_event_minus_audio_ms", {}).get("n"),
    "max_abs", a.get("position_event_minus_audio_ms", {}).get("max_abs"), "->", b.get("position_event_minus_audio_ms", {}).get("max_abs"))

say("== Basic Pitch")
def notes(p):
    try: return [tuple(r[:3]) for r in list(csv.reader(open(p)))[1:]]
    except Exception: return None
for eng in ["ort-t1", "tfjs-cpu"]:
    for ps in ["pydefault", "readme"]:
        a = notes(O + "basicpitch/S1_%s_%s.csv" % (eng, ps)); b = notes(V + "basicpitch/S1_%s_%s.csv" % (eng, ps))
        say(" ", eng, ps, "n", None if a is None else len(a), "->", None if b is None else len(b), "start/end/pitch identical:", a == b)
for f in ["bp_ort_t1_S1.json", "bp_tfjs_cpu_S1.json", "bp_tfjs_wasm_S1.json"]:
    a = res(O + "basicpitch/" + f); b = res(V + "basicpitch/" + f)
    say(" ", f, "model_load_ms", round(a.get("model_load_ms", 0)), "->", round(b.get("model_load_ms", 0) or 0), "inference_ms", round(a.get("inference_ms", 0) or 0), "->", round(b.get("inference_ms", 0) or 0),
        "error", a.get("error"), "->", b.get("error"), "threads after", a.get("ort_numThreads_after_create"), "->", b.get("ort_numThreads_after_create"))

say("== essentia.js")
for c in ["S3", "S1"]:
    a = res(O + "essentia/essentia_%s.json" % c); b = res(V + "essentia/essentia_%s.json" % c)
    for k in ["rhythm", "key", "tonal", "melodia"]:
        if k in a: say(" ", c, k, "same values:", {kk: v for kk, v in a[k].items() if kk not in ("ms",) and not kk.endswith("file") and kk != "lab"} == {kk: v for kk, v in b.get(k, {}).items() if kk not in ("ms",) and not kk.endswith("file") and kk != "lab"},
                       "ms %.0f -> %.0f" % (a[k].get("ms", 0), b.get(k, {}).get("ms", 0) or 0))
    for f in ["%s_beats.txt" % c, "%s_bpm.txt" % c, "%s_key.txt" % c, "%s_chords.lab" % c, "%s_pitchmelodia.csv" % c]:
        if os.path.exists(O + "essentia/" + f): say("   ", f, "identical:", h(O + "essentia/" + f) == h(V + "essentia/" + f))

say("== Mediabunny decode mp4")
a = res(O + "video/decode_mp4.json").get("decode", {}); b = res(V + "video/decode_mp4.json").get("decode", {})
for k in ["codec", "frames_decoded", "y_plane_identical_to_ffmpeg_same_index", "getSample_matches_expected"]:
    say(" ", k, a.get(k), "->", b.get(k))
say("  getSample frames same:", [g["frame"] for g in a.get("getSample", [])] == [g["frame"] for g in b.get("getSample", [])], "decode_only_ms %.0f -> %.0f" % (a.get("decode_only_ms_total", 0), b.get("decode_only_ms_total", 0) or 0))

say("== MediaPipe R3c CPU 150")
a = res(O + "mediapipe/mp_cpu_R3c_webm_150.json"); b = res(V + "mediapipe/mp_cpu_R3c_webm_150.json")
say("  hands", a.get("hands_per_frame_counts"), "->", b.get("hands_per_frame_counts"), "ms/frame mean %.1f -> %.1f" % (a["ms_per_frame"]["mean"], (b.get("ms_per_frame") or {}).get("mean", float("nan"))))
la = j(O + "mediapipe/hands_R3c_webm_CPU.json").get("frames", []); lb = j(V + "mediapipe/hands_R3c_webm_CPU.json").get("frames", [])
if la and lb:
    dd = [np.abs(np.array(x["landmarks"]) - np.array(y["landmarks"])).max() for x, y in zip(la, lb) if x["hands"] == y["hands"] and x["hands"]]
    say("  frames compared", len(dd), "largest landmark difference %.4f" % max(dd), "handedness same in", sum(1 for x, y in zip(la, lb) if [q.split(':')[0] for q in x['handedness']] == [q.split(':')[0] for q in y['handedness']]), "of", min(len(la), len(lb)))
say("  external requests (rerun):", j(V + "mediapipe/mp_cpu_R3c_webm_150.json").get("external_requests"))

say("== ffmpeg.wasm st mp4")
say("  output identical to trial's:", h(O + "ffmpegwasm/R3a_mp4_st.wav") == h(V + "ffmpegwasm/R3a_mp4_st.wav"), "exec_ms", round(res(O + "ffmpegwasm/ff_st_mp4.json").get("exec_ms", 0)), "->", round(res(V + "ffmpegwasm/ff_st_mp4.json").get("exec_ms", 0) or 0))

say("== small libraries")
for f in ["S1_pitchy.csv", "R1b_pitchy.csv", "S3_beatdetector_bpm.txt", "S4_beatdetector_grid.txt", "R2_beatdetector_bpm.txt",
          "S1_aubio_yinfft.csv", "R1b_aubio_yinfft.csv", "S1_pitchfinder_yin.csv", "S3_aubio_beats.txt", "S4_aubio_bpm.txt", "R2_aubio_bpm.txt", "S3_realtimebpm_bpm.txt", "S4_realtimebpm_bpm.txt", "R2_realtimebpm_bpm.txt"]:
    say(" ", f, "identical:", h(O + "smalljs/" + f) == h(V + "smalljs/" + f), "(rerun file present: %s)" % os.path.exists(V + "smalljs/" + f))

say("== waveform")
a = res(O + "waveform/waveform.json"); b = res(V + "waveform/waveform.json")
say("  wavesurfer S4 sampleRate", a.get("wavesurfer", {}).get("S4", {}).get("decoded_sampleRate"), "->", b.get("wavesurfer", {}).get("S4", {}).get("decoded_sampleRate"),
    "| peaks S4 scale/length", (a.get("peaks", {}).get("S4", {}).get("waveform") or {}).get("scale"), (a.get("peaks", {}).get("S4", {}).get("waveform") or {}).get("length"), "->",
    (b.get("peaks", {}).get("S4", {}).get("waveform") or {}).get("scale"), (b.get("peaks", {}).get("S4", {}).get("waveform") or {}).get("length"),
    "| video follow", a.get("wavesurfer", {}).get("video_follow", {}).get("ws_minus_video_ms", {}).get("max_abs"), "->", b.get("wavesurfer", {}).get("video_follow", {}).get("ws_minus_video_ms", {}).get("max_abs"))
