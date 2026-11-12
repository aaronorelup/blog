"""verify-trials-audio-to-notes: one metric per tool recomputed independently of gtr-eval and of the trial agent's
scoring scripts, in a few lines of mir_eval 0.8.2 (run with the gtr-eval venv's Python: numpy, mir_eval, pretty_midi).
- notes: mir_eval.transcription.precision_recall_f1_overlap(onset_tolerance=0.05 (or 0.1), pitch_tolerance=50,
  offset_ratio=None) against the clip's truth notes (all non-drum notes, or one voice).
- f0: reference = truth notes of the voice on a 10 ms grid from 0 to duration_s (frequency of the note sounding at t,
  onset <= t < offset; 0 Hz elsewhere); estimate = the tool's CSV as written (frequency column; no confidence threshold:
  raw pitch accuracy does not depend on it); mir_eval.melody.to_cent_voicing + raw_pitch_accuracy(cent_tolerance=50).
- multi-pitch: reference = sounding truth notes on a 10 ms grid; estimate = the frame nearest each grid time;
  mir_eval.multipitch.evaluate (Precision, Recall, Accuracy).
"""
import csv, json
import numpy as np, mir_eval, pretty_midi
O = "/home/user/gtr/lanes/audio-to-notes/out"; I = "/home/user/gtr/inputs"
def truth(clip): return json.load(open(f"{I}/{clip}/{clip}.truth.json"))
def tnotes(clip, voice=None):
    return [n for n in truth(clip)["notes"] if n.get("voice") != "drums" and (voice is None or n.get("voice") == voice)]
def hz(m): return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)
def est_csv(p):
    rows = [r for r in csv.reader(open(p)) if r][1:]
    return np.array([[float(r[0]), float(r[1])] for r in rows]), np.array([float(r[2]) for r in rows])
def est_mid(p):
    ns = [n for i in pretty_midi.PrettyMIDI(p).instruments if not i.is_drum for n in i.notes]
    return np.array([[n.start, n.end] for n in ns]), np.array([n.pitch for n in ns], float)
def notes_score(clip, est, voice=None, tol=0.05):
    tn = tnotes(clip, voice); ri = np.array([[n["onset"], n["offset"]] for n in tn]); rp = hz([n["pitch"] for n in tn])
    ei, ep = est; ei = ei.copy(); ei[:, 1] = np.maximum(ei[:, 1], ei[:, 0] + 0.001)
    p, r, f, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, hz(ep), onset_tolerance=tol,
                                                                   pitch_tolerance=50.0, offset_ratio=None)
    return round(p, 3), round(r, 3), round(f, 3), len(ei)
def ref_grid(clip, voice):
    T = truth(clip); g = np.arange(0, T["duration_s"], 0.01); f = np.zeros(len(g))
    for n in sorted(tnotes(clip, voice), key=lambda n: n["onset"]):
        m = (g >= n["onset"]) & (g < n["offset"]); f[m] = hz(n["pitch"] + T.get("tuning_offset_cents", 0) / 100)
    return g, f
def rpa(clip, voice, csvp):
    g, f = ref_grid(clip, voice)
    rows = [r for r in csv.reader(open(csvp)) if r][1:]
    et = np.array([float(r[0]) for r in rows]); ef = np.nan_to_num(np.array([float(r[1]) for r in rows]))
    rv, rc, ev, ec = mir_eval.melody.to_cent_voicing(g, f, et, ef)
    return round(mir_eval.melody.raw_pitch_accuracy(rv, rc, ev, ec, cent_tolerance=50), 3)
def multipitch(clip, voice, est_json):
    T = truth(clip); g = np.arange(0, T["duration_s"], 0.01); tn = tnotes(clip, voice)
    ref = [hz([n["pitch"] for n in tn if n["onset"] <= t < n["offset"]]) for t in g]
    J = json.load(open(est_json)); et = np.array(J["times"])
    idx = np.clip(np.searchsorted(et, g), 1, len(et) - 1); idx = np.where(np.abs(et[idx - 1] - g) <= np.abs(et[idx] - g), idx - 1, idx)
    est = [np.array([x for x in J["freqs_hz"][i] if x > 0]) for i in idx]
    s = mir_eval.multipitch.evaluate(g, ref, g, est)
    return round(s["Precision"], 3), round(s["Recall"], 3), round(s["Accuracy"], 3)
out = {}
out["Basic Pitch S1 notes P/R/F1 (e0490: 0.953/0.984/0.968)"] = notes_score("S1", est_csv(f"{O}/basic-pitch/tflite-default/S1.notes.csv"))
out["Transkun S1 notes (e0437: 0.984/1.000/0.992)"] = notes_score("S1", est_mid(f"{O}/transkun/S1.mid"))
out["ByteDance S2n notes (e1393: 0.908/0.878/0.893)"] = notes_score("S2n", est_mid(f"{O}/bytedance/S2n.mid"))
def aub(p):
    rows = [r for r in csv.reader(open(p)) if r][1:]
    return np.array([[float(r[0]), float(r[1])] for r in rows]), np.array([float(r[2]) for r in rows])
out["aubionotes S1 50 ms (e0305: 0.048)"] = notes_score("S1", aub(f"{O}/aubio/S1.notes.csv"))
out["aubionotes S1 100 ms (e0352: 0.984)"] = notes_score("S1", aub(f"{O}/aubio/S1.notes.csv"), tol=0.1)
out["SwiftF0 segment_notes S1 (e0152: 0.958/0.742/0.836)"] = notes_score("S1", aub(f"{O}/swiftf0/f0/S1.notes.csv"))
out["Essentia Melodia+PCS S1 (e1038: 1.000/0.597/0.747)"] = notes_score("S1", aub(f"{O}/essentia-melodia/f0/S1.notes.csv"))
out["FCPE->PCS S1 (e1319: 1.000/0.774/0.873)"] = notes_score("S1", aub(f"{O}/contour-segmentation/fcpe/S1.notes.csv"))
out["Basic Pitch S4 bass stem from htdemucs_6s, voice bass (e0657: 0.324/0.754/0.453)"] = notes_score("S4", est_csv(f"{O}/basic-pitch/handoff-htdemucs6s/S4sep6s-bass.notes.csv"), voice="bass")
for tool, ref in [("swiftf0", "0.961 e0113"), ("pyin", "0.958 e0121"), ("fcpe", "0.990 e0132"), ("pesto", "0.987 e0146"),
                  ("torchcrepe-tiny", "0.982 e0747"), ("torchcrepe-full", "0.986 e0758"), ("essentia-melodia", "0.693 e0997"),
                  ("essentia-pyin", "0.495 e1014"), ("essentia-crepe-tiny", "0.982 e1027"), ("essentia-crepe-full", "0.990 e1205")]:
    out[f"{tool} S1 RPA ({ref})"] = rpa("S1", "melody", f"{O}/{tool}/f0/S1.f0.csv")
out["aubiopitch S1 RPA (0.957 e0293)"] = rpa("S1", "melody", f"{O}/aubio/S1.f0.csv")
out["torchcrepe tiny viterbi R1b RPA (0.442 e0969)"] = rpa("R1b", "lead", f"{O}/torchcrepe-tiny/decoders/viterbi/R1b.f0.csv")
out["torchcrepe tiny weighted_argmax R1b RPA (0.848 e0975)"] = rpa("R1b", "lead", f"{O}/torchcrepe-tiny/decoders/weighted_argmax/R1b.f0.csv")
out["Klapuri S2n multipitch P/R/Acc (lane script: 0.722/0.803/0.613)"] = multipitch("S2n", None, f"{O}/essentia-klapuri/f0/S2n.multif0.json")
out["MultiPitchMelodia S2n multipitch P/R/Acc (lane script: 0.942/0.481/0.467)"] = multipitch("S2n", None, f"{O}/essentia-multimelodia/f0/S2n.multif0.json")
out["Klapuri R1c multipitch P/R/Acc (lane script: 0.516/0.403/0.293)"] = multipitch("R1c", None, f"{O}/essentia-klapuri/f0/R1c.multif0.json")
for k, v in out.items():
    print(f"{k}\t{v}")
