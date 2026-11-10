import json, numpy as np, mir_eval, csv
E="/home/user/gtr/lanes/browser-audio-sync/out/essentia/"
for clip in ["S3","S4","S1"]:
    t=json.load(open("/home/user/gtr/inputs/%s/%s.truth.json"%(clip,clip)))
    ref=np.array([b["time"] if isinstance(b,dict) else b for b in t["beats"]], dtype=float)
    est=np.loadtxt(E+"%s_beats.txt"%clip)
    print(clip, "beats F %.3f" % mir_eval.beat.f_measure(ref, est), "CMLt %.3f" % mir_eval.beat.continuity(ref, est)[1], "n_est", len(est), "n_ref", len(ref),
          "bpm", open(E+"%s_bpm.txt"%clip).read().strip(), "key", open(E+"%s_key.txt"%clip).read().strip(), "truth key", t.get("key"), "truth bpm", t.get("tempo_bpm"))
    if clip in ("S3","S4"):
        ri, rl = [], []
        for c in t["chords"]:
            ri.append([c["start"], c["end"]]); rl.append(c["label"])
        rows=[l.rstrip("\n").split("\t") for l in open(E+"%s_chords.lab"%clip) if l.strip()]
        ei=np.array([[float(a),float(b)] for a,b,_ in rows]); el=[x for _,_,x in rows]
        conv=lambda s: s.replace("m",":min") if s.endswith("m") else (s+":maj" if s!="N" else s)
        el=[conv(x) for x in el]
        ri=np.array(ri)
        ei2, el2 = mir_eval.util.adjust_intervals(ei, el, ri.min(), ri.max(), mir_eval.chord.NO_CHORD, mir_eval.chord.NO_CHORD)
        iv, r_, e_ = mir_eval.util.merge_labeled_intervals(ri, rl, ei2, el2)
        dur = mir_eval.util.intervals_to_durations(iv)
        print("   chords root %.3f majmin %.3f sevenths %.3f" % (mir_eval.chord.weighted_accuracy(mir_eval.chord.root(r_, e_), dur),
              mir_eval.chord.weighted_accuracy(mir_eval.chord.majmin(r_, e_), dur), mir_eval.chord.weighted_accuracy(mir_eval.chord.sevenths(r_, e_), dur)), "labels", sorted(set(el)))
pm=list(csv.reader(open(E+"S1_pitchmelodia.csv")))
print("pitchmelodia header", pm[0], "rows", len(pm)-1, "voiced", sum(1 for r in pm[1:] if float(r[1])>0), "last t", pm[-1][0])
