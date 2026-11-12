"""Gap round 2, item A6: Essentia PitchYinProbabilistic on pure sines with every parameter set explicitly, plus the
frame-level stages it chains (PitchYinProbabilities -> PitchYinProbabilitiesHMM), to see where the output pitch comes
from. Run with the fingerstyle-voices-taps lane's venv-essentia (essentia 2.1b6.dev1389), `python -I`.
Same signals as scripts/check_essentia_pyin_sines.py: 1 s of a 0.5-amplitude sine at 44.1 kHz per frequency."""
import json

import numpy as np
import essentia
import essentia.standard as es

print("essentia", essentia.__version__)
sr = 44100
t = np.arange(sr) / sr


def describe(algo):
    return {n: algo.paramValue(n) for n in algo.parameterNames()}


print("PitchYinProbabilistic defaults:", json.dumps(describe(es.PitchYinProbabilistic())))
print("PitchYinProbabilities defaults:", json.dumps(describe(es.PitchYinProbabilities())))
print("PitchYinProbabilitiesHMM defaults:", json.dumps(describe(es.PitchYinProbabilitiesHMM())))

for f in (110.0, 220.0, 369.99, 440.0):
    x = (0.5 * np.sin(2 * np.pi * f * t)).astype(np.float32)
    print(f"\nsine {f} Hz")
    for unv in ("negative", "zero", "abs"):
        for precise in (False, True):
            algo = es.PitchYinProbabilistic(sampleRate=44100, frameSize=2048, hopSize=256, lowRMSThreshold=0.1,
                                            outputUnvoiced=unv, preciseTime=precise)
            p, v = algo(x)
            p = np.asarray(p)
            good = p[p > 0]
            vals, counts = np.unique(np.round(good, 3), return_counts=True)
            top = sorted(zip(counts.tolist(), vals.tolist()), reverse=True)[:3]
            print(f"  explicit sampleRate=44100 frameSize=2048 hopSize=256 lowRMSThreshold=0.1 outputUnvoiced={unv} "
                  f"preciseTime={precise}: frames {len(p)}, >0 {len(good)}, median "
                  f"{round(float(np.median(good)), 3) if len(good) else None}, most frequent values (count, Hz) {top}")
    # the frame-level stages, on frames cut as PitchYinProbabilistic's source configures its FrameCutter
    # (frameSize, hopSize, startFromZero true, silentFrames keep)
    yp = es.PitchYinProbabilities(frameSize=2048, sampleRate=44100, lowAmp=0.1, preciseTime=False)
    cands, probs = [], []
    for frame in es.FrameGenerator(x, frameSize=2048, hopSize=256, startFromZero=True):
        c, pr, rms = yp(frame)
        cands.append(np.asarray(c, dtype=np.float32))
        probs.append(np.asarray(pr, dtype=np.float32))
    mid = len(cands) // 2
    print(f"  PitchYinProbabilities frame {mid}: candidates (as returned) {np.round(cands[mid], 4).tolist()}, "
          f"probabilities {np.round(probs[mid], 4).tolist()}")
    hmm = es.PitchYinProbabilitiesHMM()
    hp = np.asarray(hmm(cands, probs))
    hg = hp[hp > 0]
    print(f"  PitchYinProbabilitiesHMM on those frames (defaults): frames {len(hp)}, >0 {len(hg)}, median "
          f"{round(float(np.median(hg)), 3) if len(hg) else None}")
