import json
import numpy as np, mir_eval
for clip, est in [("R1c", "R1c.truthmidi"), ("R1a", "R1a.truthmidi.mindur256"), ("S5dropd", "S5dropd.truthmidi.dropD"), ("S5capo2", "S5capo2.truthmidi.capo2"), ("S2n", "S2n.truthmidi.pin-n1-s4")]:
    t = json.load(open(f"/home/user/gtr/inputs/{clip}/{clip}.truth.json"))["notes"]; E = json.load(open(f"/home/user/gtr/lanes/guitar-tab/gap2/scorify/{est}.gtreval.json")); e = E["notes"]
    ri = np.array([[n["onset"], n["onset"] + 0.1] for n in t]); rp = np.array([mir_eval.util.midi_to_hz(n["pitch"]) for n in t])
    ei = np.array([[n["onset"], n["onset"] + 0.1] for n in e]); ep = np.array([mir_eval.util.midi_to_hz(n["pitch"]) for n in e])
    m = mir_eval.transcription.match_notes(ri, rp, ei, ep, onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)
    same = sum((t[i]["string"], t[i]["fret"]) == (e[j]["string"], e[j]["fret"]) for i, j in m)
    print(est, "truth capo", json.load(open(f"/home/user/gtr/inputs/{clip}/{clip}.truth.json")).get("capo"), "est capo", E["capo"], "| matched", len(m), "same string+fret", same, f"{same/len(m):.4f}")
