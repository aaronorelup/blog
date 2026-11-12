import json, sys
import numpy as np, mir_eval
def load(p):
    return json.load(open(p))["notes"]
for clip, est in [("S2n", "S2n.zenodo-amt"), ("R1c", "R1c.zenodo-amt"), ("R1c", "R1c.onnx-vanilla"), ("S2n", "S2n.onnx-vanilla")]:
    t = load(f"/home/user/gtr/inputs/{clip}/{clip}.truth.json"); e = load(f"/home/user/gtr/lanes/guitar-tab/gap2/tabcnn/{est}.gtreval.json")
    ri = np.array([[n["onset"], max(n["offset"], n["onset"] + 1e-3)] for n in t]); rp = np.array([mir_eval.util.midi_to_hz(n["pitch"]) for n in t])
    ei = np.array([[n["onset"], max(n["offset"], n["onset"] + 1e-3)] for n in e]); ep = np.array([mir_eval.util.midi_to_hz(n["pitch"]) for n in e])
    m = mir_eval.transcription.match_notes(ri, rp, ei, ep, onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)
    same = sum((t[i]["string"], t[i]["fret"]) == (e[j]["string"], e[j]["fret"]) for i, j in m)
    print(est, "matched", len(m), "same string+fret", same, f"{same/len(m):.4f}", f"/truth {same/len(t):.4f}")
