import json, numpy as np, mir_eval, csv
def truth(clip):
    t = json.load(open("/home/user/gtr/inputs/%s/%s.truth.json" % (clip, clip)))
    n = [x for x in t["notes"] if x.get("voice") != "drums"]
    iv = np.array([[x["onset"], x["offset"]] for x in n]); p = np.array([440*2**((x["pitch"]-69)/12) for x in n])
    return iv, p
for clip, f in [("S1","S1_tfjs-webgl_pydefault.csv"),("S2n","S2n_ort-t1_pydefault.csv"),("S2n","S2n_tfjs-webgl_readme.csv")]:
    rows = list(csv.DictReader(open("/home/user/gtr/lanes/browser-audio-sync/out/basicpitch/"+f)))
    ei = np.array([[float(r["start_time_s"]), float(r["end_time_s"])] for r in rows]); ep = np.array([440*2**((float(r["pitch_midi"])-69)/12) for r in rows])
    ri, rp = truth(clip)
    P,R,F,_ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, ep, onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)
    P2,R2,F2,_ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, ep)
    print(clip, f, "onset-only P %.3f R %.3f F %.3f | on+off F %.3f" % (P,R,F,F2), "n_est", len(ei), "n_ref", len(ri))
