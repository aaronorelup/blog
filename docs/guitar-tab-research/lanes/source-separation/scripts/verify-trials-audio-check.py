"""verify-trials-source-separation: independent re-computation of the audio facts in trials.md.

Written from scratch (does not import the trial's stem_facts.py or gtr-eval). Run with the gtr-eval venv's Python
(numpy, scipy, soundfile, mir_eval 0.8.2) under gtr-run:
  python -I verify-trials-audio-check.py facts   <out json>   every samples/*/stemfacts_*.json against the audio
  python -I verify-trials-audio-check.py diffs   <out json>   the "difference level" claims and the verifier's re-runs
  python -I verify-trials-audio-check.py metrics <out json>   one or more scores per tool with mir_eval directly

Definitions used here:
  level_db(x)      = 10 log10(mean(x^2)) over all channels and samples (= RMS in dBFS)
  peak_db(x)       = 20 log10(max |x|)
  residual_db      = 10 log10(sum (m - s)^2 / sum m^2), m = mono mix, s = mono sum of the stems, common length, lag 0
  lag              = the k in [-4096, 4096] maximising |sum_n s[n+k] m[n]|; k > 0: the stems' sum is late
  projection       = <e, r> / <r, r> on mono signals, common length
  diff_level_db    = 10 log10(sum (a - b)^2 / sum a^2) over all channels, common length
  si_sdr           = mean removed; t = (<e,r>/<r,r>) r; 10 log10(|t|^2 / |e - t|^2)
  sdr/sir/sar      = mir_eval.separation.bss_eval_sources(refs, ests, compute_permutation=False), mono, joint call
  onset F          = mir_eval.onset.f_measure(truth_taps, est, window=0.05)
"""
import glob, json, os, sys
import numpy as np
import soundfile as sf
from scipy.signal import fftconvolve

LANE = "/home/user/blog/docs/guitar-tab-research/lanes/source-separation"
OUT = "/home/user/gtr/lanes/source-separation/out"
VER = "/home/user/gtr/lanes/source-separation/verify/out"
INP = "/home/user/gtr/inputs"


def rd(p):
    x, sr = sf.read(p, always_2d=True, dtype="float64")
    return x, sr


def level_db(x):
    e = np.mean(x ** 2)
    return float(10 * np.log10(e)) if e > 0 else float("-inf")


def peak_db(x):
    p = np.max(np.abs(x))
    return float(20 * np.log10(p)) if p > 0 else float("-inf")


def lag_of(s, m, K=4096):
    # z[k] = sum_n s[n+k] m[n]  ->  fftconvolve(s, m[::-1]); index of k=0 is len(m)-1
    z = fftconvolve(s, m[::-1], mode="full")
    c = len(m) - 1
    w = z[c - K: c + K + 1]
    return int(np.argmax(np.abs(w)) - K)


def facts():
    res = {}
    for f in sorted(glob.glob(os.path.join(LANE, "samples", "*", "stemfacts_*.json"))):
        d = json.load(open(f))
        mix, msr = rd(d["input"]["path"])
        mm = mix.mean(axis=1)
        r = {"input_frames": len(mix), "input_level_db": round(level_db(mix), 2), "stems": {}, "mismatch": []}
        monos = []
        for name, st in d["stems"].items():
            p = os.path.join(d["est_dir"], st["file"])
            x, sr = rd(p)
            info = sf.info(p)
            mine = {"frames": len(x), "subtype": info.subtype, "bytes": os.path.getsize(p), "sr": sr,
                    "level_db": round(level_db(x), 2), "peak_db": round(peak_db(x), 2)}
            r["stems"][name] = mine
            for k_mine, k_theirs in (("frames", "frames"), ("subtype", "subtype"), ("bytes", "bytes"), ("sr", "sample_rate")):
                if mine[k_mine] != st[k_theirs]:
                    r["mismatch"].append(f"{name} {k_mine}: {mine[k_mine]} vs {st[k_theirs]}")
            for k_mine, k_theirs in (("level_db", "rms_dbfs"), ("peak_db", "peak_dbfs")):
                a, b = mine[k_mine], st[k_theirs]
                if not (np.isinf(a) and np.isinf(b)) and abs(a - b) > 0.011:
                    r["mismatch"].append(f"{name} {k_mine}: {a} vs {b}")
            monos.append((name, x.mean(axis=1), sr))
        if "sum_vs_mix" in d:
            n = min(len(m) for _, m, _ in monos)
            s = np.sum([m[:n] for _, m, _ in monos], axis=0)
            n = min(n, len(mm)); s = s[:n]; m0 = mm[:n]
            resid = float(10 * np.log10(np.sum((m0 - s) ** 2) / np.sum(m0 ** 2)))
            lag = lag_of(s, m0)
            r["residual_db"] = round(resid, 2); r["lag"] = lag
            if abs(resid - d["sum_vs_mix"]["residual_db_at_lag0"]) > 0.011:
                r["mismatch"].append(f"residual {resid:.2f} vs {d['sum_vs_mix']['residual_db_at_lag0']}")
            if lag != d["sum_vs_mix"]["best_lag_samples"]:
                r["mismatch"].append(f"lag {lag} vs {d['sum_vs_mix']['best_lag_samples']}")
            if lag != 0:  # s[n] ~ m[n - lag]
                ma, sa = (m0[:n - lag], s[lag:]) if lag > 0 else (m0[-lag:], s[:n + lag])
                r["residual_db_at_lag"] = round(float(10 * np.log10(np.sum((ma - sa) ** 2) / np.sum(ma ** 2))), 2)
        if "projection" in d:
            refs = {os.path.splitext(os.path.basename(g))[0]: rd(g)[0].mean(axis=1)
                    for g in sorted(glob.glob(os.path.join(d["truth_dir"], "*.wav")))}
            for name, e, _ in monos:
                for rn, ref in refs.items():
                    n = min(len(e), len(ref))
                    pj = float(np.dot(e[:n], ref[:n]) / np.dot(ref[:n], ref[:n]))
                    if abs(pj - d["projection"][name][rn]) > 0.00051:
                        r["mismatch"].append(f"projection {name}/{rn}: {pj:.4f} vs {d['projection'][name][rn]}")
        res[os.path.relpath(f, LANE)] = r
        print(os.path.relpath(f, LANE), "mismatches:", r["mismatch"] or "none", flush=True)
    return res


def dlev(a, b):
    x, _ = rd(a); y, _ = rd(b)
    n = min(len(x), len(y)); d = x[:n] - y[:n]
    e = np.sum(d ** 2)
    return {"a": a, "b": b, "frames": [len(x), len(y)], "subtypes": [sf.info(a).subtype, sf.info(b).subtype],
            "max_abs_diff": round(float(np.max(np.abs(d))), 4),
            "diff_level_db_ref_a": round(float(10 * np.log10(e / np.sum(x[:n] ** 2))), 2) if e > 0 else "identical",
            "diff_level_db_ref_b": round(float(10 * np.log10(e / np.sum(y[:n] ** 2))), 2) if e > 0 else "identical"}


def diffs():
    O = OUT; D = O + "/demucs-options"
    pairs = [
        ("base-10s other vs jobs2-10s other (claim -20.74 dB, max 0.0549)",
         D + "/base-10s/htdemucs/S4_0-10s/other.wav", D + "/jobs2-10s/htdemucs/S4_0-10s/other.wav"),
        ("base-10s other vs float32-10s other (claim -20.49 dB)",
         D + "/base-10s/htdemucs/S4_0-10s/other.wav", D + "/float32-10s/htdemucs/S4_0-10s/other.wav"),
        ("htdemucs_6s S4 guitar (r0021) vs --two-stems guitar (r0450) (claim -13.10 dB, max 0.0874)",
         O + "/htdemucs_6s/S4/guitar.wav", D + "/two-stems-guitar/htdemucs_6s/S4/guitar.wav"),
        ("demucs-onnx guitar vs PyTorch htdemucs_6s guitar (claim -12.41 dB, max 0.115)",
         O + "/demucs-onnx-htdemucs_6s-fp16/S4/guitar.wav", O + "/htdemucs_6s/S4/guitar.wav"),
        ("demucs.cpp target_4_guitar vs PyTorch htdemucs_6s guitar (claim -5.35 dB, max 0.215)",
         O + "/demucs.cpp-htdemucs_6s/S4/target_4_guitar.wav", O + "/htdemucs_6s/S4/guitar.wav"),
    ]
    for st in ("bass", "drums", "guitar", "other", "piano", "vocals"):
        pairs.append((f"MSST BS-RoFormer-SW {st} vs audio-separator BS-RoFormer-SW {st} (claim -22.70 to -23.21 dB, max 0.037 to 0.072)",
                      O + f"/msst-bs-roformer-sw/S4_0-10s/{st}.wav", O + f"/uvr/BS-Roformer-SW/S4_0-10s/{st}.wav"))
    # verifier's re-runs against the trial's files
    for st in ("drums", "bass", "other", "vocals"):
        pairs.append((f"verify re-run htdemucs S4 {st} vs r0019", VER + f"/htdemucs/S4/{st}.wav", O + f"/htdemucs/S4/{st}.wav"))
        pairs.append((f"verify re-run LoRA S4 {st} vs r0467", VER + f"/demucs-guitar-lora/S4/{st}.wav", O + f"/demucs-guitar-lora/S4/{st}.wav"))
        pairs.append((f"verify re-run --mp3 {st} vs r0462", VER + f"/demucs-options/mp3-10s/htdemucs/S4_0-10s/{st}.mp3", D + f"/mp3-10s/htdemucs/S4_0-10s/{st}.mp3"))
        pairs.append((f"verify re-run umxhq S4 {st} vs r0085", VER + f"/umxhq/S4/{st}.wav", O + f"/umxhq/S4/{st}.wav"))
    for st in ("bass", "drums", "guitar", "other", "piano", "vocals"):
        pairs.append((f"verify re-run htdemucs_6s S2s {st} vs r0099", VER + f"/htdemucs_6s/S2s/{st}.wav", O + f"/htdemucs_6s/S2s/{st}.wav"))
        pairs.append((f"verify re-run demucs-onnx S4 {st} vs r0471", VER + f"/demucs-onnx-htdemucs_6s-fp16/S4/{st}.wav", O + f"/demucs-onnx-htdemucs_6s-fp16/S4/{st}.wav"))
    for i, st in enumerate(("drums", "bass", "other", "vocals", "guitar", "piano")):
        pairs.append((f"verify re-run demucs.cpp S4_0-10s target_{i}_{st} vs r0508", VER + f"/demucs.cpp-htdemucs_6s/S4_0-10s/target_{i}_{st}.wav", O + f"/demucs.cpp-htdemucs_6s/S4_0-10s/target_{i}_{st}.wav"))
    for setting in ("default", "margin3", "margin1-5"):
        for part in ("harmonic", "percussive"):
            pairs.append((f"verify re-run HPSS S6taps {setting} {part} vs r0262", VER + f"/hpss/S6taps/{setting}/{part}.wav", O + f"/hpss/S6taps/{setting}/{part}.wav"))
    for st in ("instrumental", "vocals"):
        pairs.append((f"verify re-run VR 1_HP-UVR S4 {st} vs r0481", VER + f"/uvr/1_HP-UVR/S4/{st}.wav", O + f"/uvr/1_HP-UVR/S4/{st}.wav"))
    pairs.append(("verify re-run becruily S4_0-10s Guitar vs r0473", VER + "/msst-becruily-guitar/S4_0-10s/Guitar.wav", O + "/msst-becruily-guitar/S4_0-10s/Guitar.wav"))
    for st in ("bass", "drums", "other", "vocals"):
        pairs.append((f"verify re-run spleeter S4 {st} vs r0419", VER + f"/spleeter-4stems/S4/{st}.wav", O + f"/spleeter-4stems/S4/{st}.wav"))
    res = {}
    for label, a, b in pairs:
        if not (os.path.exists(a) and os.path.exists(b)):
            res[label] = "missing: " + (a if not os.path.exists(a) else b); print(label, res[label]); continue
        res[label] = dlev(a, b)
        print(label, {k: v for k, v in res[label].items() if k not in ("a", "b")}, flush=True)
    return res


def mono_trim(paths, max_s=None, sr=44100):
    xs = [rd(p)[0].mean(axis=1) for p in paths]
    n = min(len(x) for x in xs)
    if max_s:
        n = min(n, int(round(max_s * sr)))
    return [x[:n] for x in xs]


def si_sdr(e, r):
    e = e - e.mean(); r = r - r.mean()
    t = (np.dot(e, r) / np.dot(r, r)) * r
    return float(10 * np.log10(np.dot(t, t) / np.dot(e - t, e - t)))


def metrics():
    import mir_eval
    S4 = INP + "/S4/stems"; S6 = INP + "/S6taps/stems"
    jobs = [
        ("e0389 Open-Unmix umxhq S6taps", [S6 + "/guitar.wav", S6 + "/taps.wav"], [OUT + "/umxhq/S6taps/other.wav", OUT + "/umxhq/S6taps/drums.wav"], None),
        ("e0073 Demucs htdemucs S4", [S4 + f"/{s}.wav" for s in ("drums", "bass", "guitar", "lead")], [OUT + f"/htdemucs/S4/{s}.wav" for s in ("drums", "bass", "other", "vocals")], None),
        ("e0811 librosa HPSS default S6taps", [S6 + "/guitar.wav", S6 + "/taps.wav"], [OUT + "/hpss/S6taps/default/harmonic.wav", OUT + "/hpss/S6taps/default/percussive.wav"], None),
        ("e1395 Spleeter 4stems S6taps", [S6 + "/guitar.wav", S6 + "/taps.wav"], [OUT + "/spleeter-4stems/S6taps/other.wav", OUT + "/spleeter-4stems/S6taps/drums.wav"], None),
        ("e1416 Demucs guitar LoRA S4", [S4 + f"/{s}.wav" for s in ("drums", "bass", "guitar", "lead")], [OUT + f"/demucs-guitar-lora/S4/{s}.wav" for s in ("drums", "bass", "other", "vocals")], None),
        ("e1417 demucs-onnx htdemucs_6s S4", [S4 + f"/{s}.wav" for s in ("drums", "bass", "guitar", "lead")], [OUT + f"/demucs-onnx-htdemucs_6s-fp16/S4/{s}.wav" for s in ("drums", "bass", "guitar", "vocals")], None),
        ("e1425 MSST becruily guitar S4 (single)", [S4 + "/guitar.wav"], [OUT + "/msst-becruily-guitar/S4/Guitar.wav"], None),
        ("e1427 MSST BS-RoFormer-SW S4 first 10 s", [S4 + f"/{s}.wav" for s in ("drums", "bass", "guitar", "lead")], [OUT + f"/msst-bs-roformer-sw/S4_0-10s/{s}.wav" for s in ("drums", "bass", "guitar", "other")], 10.0),
        ("e1421 audio-separator VR 1_HP-UVR S4", ["/home/user/gtr/lanes/source-separation/inputs/S4_truth_2stem/instrumental.wav", S4 + "/lead.wav"], [OUT + "/uvr/1_HP-UVR/S4/instrumental.wav", OUT + "/uvr/1_HP-UVR/S4/vocals.wav"], None),
        ("e1446 demucs.cpp htdemucs_6s S4", [S4 + f"/{s}.wav" for s in ("drums", "bass", "guitar", "lead")], [OUT + f"/demucs.cpp-htdemucs_6s/S4/target_{s}.wav" for s in ("0_drums", "1_bass", "4_guitar", "3_vocals")], None),
    ]
    res = {}
    for label, refs, ests, mx in jobs:
        sig = mono_trim(refs + ests, mx)
        R = np.vstack(sig[:len(refs)]); E = np.vstack(sig[len(refs):])
        sis = [round(si_sdr(E[i], R[i]), 2) for i in range(len(refs))]
        sdr, sir, sar, _ = mir_eval.separation.bss_eval_sources(R, E, compute_permutation=False)
        res[label] = {"si_sdr": sis, "sdr": [round(float(v), 2) for v in sdr], "sir": [round(float(v), 2) for v in sir] if len(refs) > 1 else None,
                      "sar": [round(float(v), 2) for v in sar], "samples": int(R.shape[1])}
        print(label, res[label], flush=True)
    truth = [t["time"] for t in json.load(open(INP + "/S6taps/S6taps.truth.json"))["taps"]]
    for label, f in (("e0928 onsets htdemucs_6s drums", LANE + "/samples/onsets-handoff/htdemucs_6s_S6taps_drums_onsets.txt"),
                     ("e0919 onsets htdemucs drums", LANE + "/samples/onsets-handoff/htdemucs_S6taps_drums_onsets.txt"),
                     ("e0815 onsets HPSS default percussive", LANE + "/samples/onsets-handoff/hpss-default_S6taps_percussive_onsets.txt"),
                     ("e0934 onsets umxhq drums", LANE + "/samples/onsets-handoff/umxhq_S6taps_drums_onsets.txt"),
                     ("e1397 onsets spleeter drums", LANE + "/samples/onsets-handoff/spleeter-4stems_S6taps_drums_onsets.txt")):
        est = np.loadtxt(f, ndmin=1)
        F, P, Rc = mir_eval.onset.f_measure(np.array(sorted(truth)), np.sort(est), window=0.05)
        res[label] = {"n_est": int(len(est)), "F": round(F, 3), "P": round(P, 3), "R": round(Rc, 3)}
        print(label, res[label], flush=True)
    return res


if __name__ == "__main__":
    mode, out = sys.argv[1], sys.argv[2]
    r = {"facts": facts, "diffs": diffs, "metrics": metrics}[mode]()
    with open(out, "w") as fh:
        json.dump(r, fh, indent=1)
