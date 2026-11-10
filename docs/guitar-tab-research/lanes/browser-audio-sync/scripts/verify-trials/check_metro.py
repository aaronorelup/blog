# Verifier's own re-analysis of the 8 metronome captures (r0199).
import numpy as np, soundfile as sf, json
S="/home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/samples/web-audio-metronome/"
O="/home/user/gtr/lanes/browser-audio-sync/out/metronome/"
def onsets(x, thr=0.05, quiet=4410):
    idx = np.flatnonzero(np.abs(x) > thr); res=[]; last=-10**9
    for i in idx:
        if i - last > quiet: res.append(i)
        last = i
    return np.array(res)
for m in ["lookahead","interval","tone","worklet"]:
    for b in [0,100]:
        j = json.load(open(S+"metronome_%s_busy%d.json"%(m,b)))["result"]
        x, sr = sf.read(O+"metronome_%s_busy%d.wav"%(m,b), dtype="float32")
        if x.ndim>1: x=x[:,0]
        on = onsets(x).astype(np.int64)
        ff = j["capture"]["firstFrame"]; fr = on + ff
        # correction for repeated currentFrame (negative step) in the first recorder version
        corr = [g for g in j["capture"]["gaps"] if g["frames"] < 0]
        for g in corr:
            fr = np.where(fr > g["atFrame"], fr + g["frames"], fr)
        n = np.arange(len(fr))
        if m == "interval":
            dev = (fr - (fr[0] + n*22050))/44.1
            A = np.vstack([n, np.ones_like(n)]).T; p,c = np.linalg.lstsq(A, fr.astype(float), rcond=None)[0]
            res = (fr - (p*n + c))/44.1
            extra = "fit period %.4f ms, fit mean abs %.3f max %.3f, p95abs %.1f, >5ms: %s" % (p/44.1, np.abs(res).mean(), np.abs(res).max(), np.percentile(np.abs(dev),95), sorted([round(v,1) for v in np.abs(dev) if v>5], reverse=True)[:6])
        else:
            dev = (fr - (j["first_click_intended_frame"] + n*22050))/44.1
            nz = [round(v,3) for v in dev if abs(v) > 1e-9]
            extra = "nonzero %d: %s" % (len(nz), sorted(nz, reverse=True))
        page = np.array(j["dev_all_ms"])
        print(m, b, "dur %.2f" % (len(x)/sr), "clicks", len(fr), "mean %.3f maxabs %.3f" % (dev.mean(), np.abs(dev).max()),
              "| page mean %.3f max %.3f" % (page.mean(), np.abs(page).max()), "gaps", j["capture"]["gaps"], "|", extra,
              "| busy", j.get("busy"), "| late", j.get("n_scheduled_late"), "| pbstats", {k:j["playbackStats"][k] for k in ("underrunEvents","underrunDuration","averageLatency")})
