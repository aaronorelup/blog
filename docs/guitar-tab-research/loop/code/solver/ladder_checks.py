#!/usr/bin/env python3
"""ladder_checks.py [out.json]: every count LADDER.md states that is not a cell's own score, computed from files (so
nothing in the records is typed in). Run with the eval venv's python (needs mir_eval): /home/user/gtr/eval/venv/bin/python.
Writes G/loop/e3/checks.json (default):
- error_types: each cell's wrong places by kind (the solver open where the key frets the same pitch elsewhere, the
  solver fretted where the key is open, both fretted), matched with gtr-eval's rule (onset 50 ms, 50 cents, each once);
- window_stats: each window at the key's fretted onsets (fret >= 1): known (not lost), coverage of known, mean width
  (hi - lo + 1), with the solver's own reading of the file (nearest row);
- chain2f_removed: the notes the hand filter removed, each real (a key note within 50 ms, same pitch) or invented;
- hand_off_pairing: the hand-off answers against AO-082's chain-5 (key's notes) and chain-2 tabs, paired by onset
  (3 ms) and pitch: how many share string and fret;
- soft_win_extra: soft window weights 3, 4 and 8 on capo with the window the weight search used (first pass's v0),
  scored by gtr-eval (ledger), to show the plateau the weights table describes;
- nylon_string1: on nylon, the key's notes at C4 and D4 and where each cell put the matched ones.
Every cell named is read from G/loop/e3/<S>/ladder_<S>.json (its cell.json and answer.json)."""
import json, os, subprocess, sys
from collections import Counter
import numpy as np
import mir_eval

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import solver  # noqa: E402

G = "/home/user/gtv"
OUT = f"{G}/loop/e3"
SONGS = ["capo", "tuning", "standard"]
PY = f"{G}/tools/venv-torch/bin/python"
EVAL = "/home/user/gtr/bin/gtr-eval"
ENV = dict(os.environ, GTR_EVAL_LEDGER=f"{G}/loop/ledger/evals.jsonl", GTR_AGENT="e3-fix")


def notes_of(p):
    d = json.load(open(p)); return d["notes"] if isinstance(d, dict) else d


def match(ref, est):
    iv = lambda L: np.array([[n["onset"], max(n["offset"], n["onset"] + 0.01)] for n in L]).reshape(-1, 2)
    hz = lambda L: np.array([440 * 2 ** ((n["pitch"] - 69) / 12) for n in L])
    if not ref or not est: return []
    return mir_eval.transcription.match_notes(iv(ref), hz(ref), iv(est), hz(est), onset_tolerance=0.05,
                                              pitch_tolerance=50.0, offset_ratio=None)


def error_types(tn, est):
    k = Counter()
    for i, j in match(tn, est):
        t, e = tn[i], est[j]
        if (t["string"], t["fret"]) == (e["string"], e["fret"]): k["right"] += 1
        elif e["fret"] == 0 and t["fret"] > 0: k["solver_open_key_fretted"] += 1
        elif t["fret"] == 0 and e["fret"] > 0: k["solver_fretted_key_open"] += 1
        else: k["both_fretted"] += 1
    return dict(k)


def window_stats(T, path):
    W = solver.Window(path)
    fr = [n for n in T["notes"] if n.get("fret", 0) >= 1]
    known = cov = 0; widths = []
    for n in fr:
        w = W.at(n["onset"])
        if w is None: continue
        known += 1; widths.append(w[1] - w[0] + 1)
        cov += int(w[0] <= n["fret"] <= w[1])
    return {"window": path.replace(G, "G"), "fretted": len(fr), "known": known,
            "coverage_of_known": round(cov / known, 4) if known else None,
            "excluded": known - cov, "mean_width": round(float(np.mean(widths)), 2) if widths else None}


def pair(a, b):
    used = set(); paired = same = 0
    for n in a:
        best = None
        for j, m in enumerate(b):
            if j in used or m["pitch"] != n["pitch"] or abs(m["onset"] - n["onset"]) > 0.003: continue
            if best is None or abs(m["onset"] - n["onset"]) < abs(b[best]["onset"] - n["onset"]): best = j
        if best is None: continue
        used.add(best); paired += 1
        same += (b[best]["string"], b[best]["fret"]) == (n["string"], n["fret"])
    return {"solver_notes": len(a), "chain_notes": len(b), "paired": paired, "same_place": same}


def main(out):
    rec = {"error_types": {}, "window_stats": {}, "chain2f_removed": {}, "hand_off_pairing": {}, "nylon_string1": {}}
    for S in SONGS:
        L = json.load(open(f"{OUT}/{S}/ladder_{S}.json"))
        T = json.load(open(f"{G}/truth/{S}/{S}.truth.json"))
        tn = [n for n in T["notes"] if n.get("string") is not None]
        et = {}
        for name in L["cells"]:
            if name.startswith("chain2f"): continue
            p = f"{OUT}/{S}/{name}/answer.json"
            if os.path.exists(p): et[name] = error_types(tn, notes_of(p))
        for name in L.get("first_pass_wrong_cells", []):
            if name.startswith("chain2f"): continue
            et["first-pass " + name] = error_types(tn, notes_of(f"{OUT}/first-pass/{S}/{name}/answer.json"))
        rec["error_types"][S] = et
        ws = {"tool": window_stats(T, L["tool_window"])} if L["tool_window"] else {}
        fp = json.load(open(f"{OUT}/first-pass/{S}/ladder_{S}.json")).get("tool_window")
        if fp: ws["tool, first pass"] = window_stats(T, fp)
        for k in ("perfect", "ceiling"): ws[k] = window_stats(T, f"{OUT}/windows/{S}/{k}.csv")
        rec["window_stats"][S] = ws
        cr = {}
        for tk, m in L.get("chain2f", {}).items():
            kon = [(n["onset"], n["pitch"]) for n in T["notes"]]
            real = [r for r in m["removed_notes"] if any(abs(o - r[0]) <= 0.05 and p == r[1] for o, p in kon)]
            cr[tk] = {"filter": m["filter"].replace(G, "G"), "removed": m["removed"], "real": len(real),
                      "invented": m["removed"] - len(real), "notes": m["removed_notes"]}
        rec["chain2f_removed"][S] = cr
        rec["hand_off_pairing"][S] = {
            "key-given-off vs chain-5": pair(notes_of(f"{OUT}/{S}/key-given-off/answer.json"),
                                             notes_of(f"{G}/experiments/{S}/chain-5/tab.json")),
            "chain2-given-off vs chain-2": pair(notes_of(f"{OUT}/{S}/chain2-given-off/answer.json"),
                                                notes_of(f"{G}/experiments/{S}/chain-2/tab.json"))}
        if S == "tuning":
            for pitch in (60, 62):
                kn = [n for n in tn if n["pitch"] == pitch]
                per = {"key_places": dict(Counter(f"s{n['string']}f{n['fret']}" for n in kn))}
                for name in L["cells"]:
                    if not name.startswith(("key-", "chain2-")) or name.endswith("-soft"): continue
                    est = notes_of(f"{OUT}/{S}/{name}/answer.json")
                    m = match(kn, est)
                    per[name] = dict(Counter(f"s{est[j]['string']}f{est[j]['fret']}" for i, j in m))
                rec["nylon_string1"][f"pitch {pitch}"] = per
    # soft window weights 3, 4, 8 with the weight search's window (first pass v0) on capo
    v0 = json.load(open(f"{OUT}/first-pass/capo/ladder_capo.json"))["tool_window"]
    T = json.load(open(f"{G}/truth/capo/capo.truth.json"))
    d0 = f"{OUT}/checks/soft_win"; os.makedirs(d0, exist_ok=True); sw = []
    for w in (2, 3, 4, 8):
        for nk, nf in (("key", f"{OUT}/capo/inputs/key_notes.csv"), ("chain2", f"{G}/experiments/capo/chain-2/notes.csv")):
            d = f"{d0}/{nk}-win{w}"; os.makedirs(d, exist_ok=True)
            a = f"{d}/answer.json"
            subprocess.run([PY, f"{HERE}/solver.py", "--notes", nf, "--tuning", ",".join(map(str, T["tuning_midi"])),
                            "--capo", str(T["capo"]), "--window", v0, "--window-mode", "soft", "--weights", f"win={w}",
                            "--answer", a], capture_output=True, check=True)
            p = subprocess.run([EVAL, "tab", "--truth", f"{G}/truth/capo/capo.truth.json", "--est", a, "--out",
                                f"{d}/score_tab.json"], capture_output=True, text=True, env=ENV)
            eid = p.stderr.split("[gtr-eval ")[-1].split("]")[0] if "[gtr-eval " in p.stderr else None
            m = json.load(open(f"{d}/score_tab.json"))["metrics"]["same_string_and_fret_fraction_of_truth"]
            sw.append({"win": w, "notes": nk, "main": m, "eval_tab": eid})
    rec["soft_win_extra"] = {"song": "capo", "window": v0.replace(G, "G"), "mode": "soft", "runs": sw}
    json.dump(rec, open(out, "w"), indent=1, default=lambda o: o.item())  # numpy scalars
    print(out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else f"{OUT}/checks.json")
