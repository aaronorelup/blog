import json, numpy as np, mir_eval, csv
D="/home/user/gtr/lanes/browser-audio-sync/out/smalljs/"
t=json.load(open("/home/user/gtr/inputs/S1/S1.truth.json"))
dur=t["duration_s"]; off=t.get("tuning_offset_cents",0) or 0
rt=np.round(np.arange(0, dur, 0.01), 6); rf=np.zeros_like(rt)
for n in sorted(t["notes"], key=lambda n: n["onset"]):
    m=(rt>=n["onset"])&(rt<n["offset"]); rf[m]=440*2**((n["pitch"]+off/100-69)/12)
def score(f, conf=None):
    rows=list(csv.reader(open(D+f))); h=rows[0]; rows=rows[1:]
    et=np.array([float(r[0]) for r in rows]); ef=np.array([float(r[1]) if r[1] not in ("","nan","NaN") else 0 for r in rows])
    if conf is not None:
        c=np.array([float(r[2]) for r in rows]); ef=np.where(c<conf, -np.abs(ef), ef)
    rv, rc, ev, ec = mir_eval.melody.to_cent_voicing(rt, rf, et, ef)
    return h, (mir_eval.melody.voicing_recall(rv, ev), mir_eval.melody.voicing_false_alarm(rv, ev),
            mir_eval.melody.raw_pitch_accuracy(rv, rc, ev, ec), mir_eval.melody.raw_chroma_accuracy(rv, rc, ev, ec),
            mir_eval.melody.overall_accuracy(rv, rc, ev, ec))
for f, c in [("S1_pitchy.csv", None), ("S1_pitchy_conf.csv", 0.9), ("S1_aubio_yinfft.csv", None), ("S1_pitchfinder_yin.csv", None)]:
    h, s = score(f, c); print(f, h, "VR %.3f VFA %.3f RPA %.3f RCA %.3f OA %.3f" % s)
