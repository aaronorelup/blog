"""Facts about one set of estimated stems, for the source-separation trials.

Usage: python -I stem_facts.py <input mix wav> <dir with estimated stems> <out json> [<truth stems dir>]

For every estimated stem file (*.wav / *.flac / *.mp3 in the directory, not recursive) it records:
  - file format as read by soundfile: sample rate, channels, subtype (PCM_16, FLOAT, ...), frames, seconds
  - frames_minus_input: frames of the stem minus frames of the input mix (0 = same length sample for sample)
  - rms_dbfs: 20 log10(sqrt(mean(x^2))) over all channels and samples (full scale = 1.0); peak_dbfs likewise
Over the whole set:
  - sum_vs_mix: the sum of all stems against the input mix (both averaged to mono, input resampled if the rates
    differ): best lag in samples from the cross-correlation within +-4096 samples (0 = aligned), and the residual
    level 10 log10(|mix - sum|^2 / |mix|^2) in dB at lag 0, over the common length.
With a truth stems directory (one WAV per true stem, same rate as the input):
  - projection[est][true] = <est, ref> / <ref, ref> on mono signals over the common length: the share (by
    amplitude projection) of the true stem that is present in the estimated stem. When the estimated stems add up to
    the mix and the true stems add up to the mix, the column sums are close to 1.
  - si_sdr_db[est][true]: SI-SDR of each estimated stem against each true stem, same formula as gtr-eval stems
    (mean removed; target = (<est,ref>/<ref,ref>) ref; 10 log10(|target|^2 / |est - target|^2)).
"""
import sys, os, json, glob
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, fftconvolve


def read(path):
    x, sr = sf.read(path, always_2d=True, dtype="float64")
    info = sf.info(path)
    return x, sr, info


def db(v):
    return float(20 * np.log10(v)) if v > 0 else float("-inf")


def mono(x):
    return x.mean(axis=1)


def to_sr(x, sr, target):
    if sr == target:
        return x
    g = np.gcd(int(sr), int(target))
    return resample_poly(x, target // g, sr // g)


def si_sdr(est, ref):
    est = est - est.mean(); ref = ref - ref.mean()
    rr = np.dot(ref, ref)
    if rr == 0:
        return None
    target = (np.dot(est, ref) / rr) * ref
    noise = est - target
    tn, nn = np.dot(target, target), np.dot(noise, noise)
    if nn == 0:
        return float("inf")
    if tn == 0:
        return float("-inf")
    return float(10 * np.log10(tn / nn))


def main():
    mix_path, est_dir, out_json = sys.argv[1:4]
    truth_dir = sys.argv[4] if len(sys.argv) > 4 else None
    mix, msr, minfo = read(mix_path)
    files = sorted(f for ext in ("wav", "flac", "mp3") for f in glob.glob(os.path.join(est_dir, f"*.{ext}"))
                   if not os.path.basename(f).startswith("derived_"))  # derived_*: sums made here, not tool output
    res = {"input": {"path": mix_path, "sample_rate": msr, "channels": mix.shape[1], "frames": mix.shape[0],
                     "subtype": minfo.subtype, "rms_dbfs": db(np.sqrt(np.mean(mix ** 2))),
                     "seconds": round(mix.shape[0] / msr, 4)},
           "est_dir": est_dir, "stems": {}}
    monos = {}
    for f in files:
        x, sr, info = read(f)
        name = os.path.splitext(os.path.basename(f))[0]
        res["stems"][name] = {
            "file": os.path.basename(f), "bytes": os.path.getsize(f), "sample_rate": sr, "channels": x.shape[1],
            "subtype": info.subtype, "format": info.format, "frames": x.shape[0], "seconds": round(x.shape[0] / sr, 4),
            "frames_minus_input": (x.shape[0] - mix.shape[0]) if sr == msr else None,
            "rms_dbfs": round(db(np.sqrt(np.mean(x ** 2))), 2), "peak_dbfs": round(db(np.max(np.abs(x))), 2),
        }
        monos[name] = (mono(x), sr)
    # sum of stems vs mix
    if monos:
        srs = {sr for _, sr in monos.values()}
        sr0 = srs.pop() if len(srs) == 1 else None
        if sr0 is not None:
            n = min(len(m) for m, _ in monos.values())
            s = np.sum([m[:n] for m, _ in monos.values()], axis=0)
            mm = to_sr(mono(mix), msr, sr0)
            n = min(n, len(mm)); s = s[:n]; mm = mm[:n]
            K = 4096
            c = fftconvolve(mm, s[::-1], mode="full")
            mid = len(s) - 1
            win = c[mid - K: mid + K + 1]
            # argmax index - K is negative when the sum is delayed; flip it so that positive = late (checked with
            # a synthetic 100-sample delay, which gives +100)
            lag = -int(np.argmax(np.abs(win)) - K)
            resid = 10 * np.log10(np.sum((mm - s) ** 2) / np.sum(mm ** 2))
            res["sum_vs_mix"] = {"common_rate": sr0, "common_frames": n, "best_lag_samples": lag,
                                 "residual_db_at_lag0": round(float(resid), 2),
                                 "note": "positive lag = the stems' sum is late relative to the mix"}
    if truth_dir:
        refs = {}
        for f in sorted(glob.glob(os.path.join(truth_dir, "*.wav"))):
            x, sr, _ = read(f)
            refs[os.path.splitext(os.path.basename(f))[0]] = (mono(x), sr)
        proj, sis = {}, {}
        for en, (e, esr) in monos.items():
            proj[en], sis[en] = {}, {}
            for rn, (r, rsr) in refs.items():
                ee = to_sr(e, esr, rsr)
                n = min(len(ee), len(r))
                a, b = ee[:n], r[:n]
                proj[en][rn] = round(float(np.dot(a, b) / np.dot(b, b)), 4)
                v = si_sdr(a, b)
                sis[en][rn] = round(v, 2) if v is not None and np.isfinite(v) else v
        colsum = {rn: round(sum(proj[en][rn] for en in proj), 4) for rn in refs}
        res["truth_dir"] = truth_dir
        res["projection"] = proj
        res["projection_column_sums"] = colsum
        res["si_sdr_db_cross"] = sis
    os.makedirs(os.path.dirname(os.path.abspath(out_json)), exist_ok=True)
    with open(out_json, "w") as fh:
        json.dump(res, fh, indent=1)
    # short text summary on stdout
    print(f"input {mix_path}: {res['input']['sample_rate']} Hz, {res['input']['channels']} ch, {res['input']['frames']} frames")
    for n, s in res["stems"].items():
        print(f"  {n:16s} {s['sample_rate']} Hz {s['channels']} ch {s['subtype']:8s} frames {s['frames']} "
              f"(diff {s['frames_minus_input']}) rms {s['rms_dbfs']} dBFS peak {s['peak_dbfs']} dBFS")
    if "sum_vs_mix" in res:
        print("  sum vs mix:", res["sum_vs_mix"])
    if truth_dir:
        print("  projection (rows est, cols true):")
        for en, row in res["projection"].items():
            print(f"    {en:14s}", row)
        print("  column sums:", res["projection_column_sums"])


if __name__ == "__main__":
    main()
