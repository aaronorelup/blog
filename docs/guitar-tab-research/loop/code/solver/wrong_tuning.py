#!/usr/bin/env python3
"""wrong_tuning.py [song ...]: the ladder's "wrong" tuning rung, as the reviewed brief (sessions/LOOP.md, STATE.md
01:45 UTC) defines it, written to G/loop/e3/<S>/inputs/wrong_tuning.json with its evidence.

- nylon (slot tuning): D G C F A D, the answer both AO-082 round-2 blind arms gave (read from G/blind/results.json,
  attempts whose song is "tuning", round 2, tools and bare arms; they must agree).
- steel songs: the lowest-note rule re-run knowing the capo. The kit's rule (G/tools/kit/lib/lowest_notes.py, defaults
  --min-dur 0.1 --min-count 4) on chain-2's notes gives L, the lowest recurring pitch; with the capo K given, the open
  6th string sounds 40 + K in standard tuning, so: L < 40 + K => 6th string tuned to L - K, the other five standard;
  else standard. The rung is dropped where it equals the true tuning.
For reference only (not a rung), the same capo-aware rule on AO-082's other note sets (n-01, n-01-hint: t-02's and
t-02-hint's inputs) and on nylon's chain-2 notes.
Opens the key for its tuning and capo only (the capo is given in every run; the tuning to say "dropped")."""
import json, os, subprocess, sys

G = "/home/user/gtv"
OUT = f"{G}/loop/e3"
LOWEST = f"{G}/tools/kit/lib/lowest_notes.py"
STD = [40, 45, 50, 55, 59, 64]


def capo_aware(notes_csv, capo, out_json):
    """The kit's lowest-note rule on notes_csv, read with the capo given."""
    p = subprocess.run(["python3", "-I", LOWEST, notes_csv, out_json], capture_output=True, text=True)
    if p.returncode: raise SystemExit(p.stderr)
    low = json.load(open(out_json))
    L = low["lowest_recurring"][0] if low["lowest_recurring"] else None
    tuning = ([L - capo] + STD[1:]) if (L is not None and L < 40 + capo) else list(STD)
    return {"notes": notes_csv.replace(G, "G"), "lowest_recurring": low["lowest_recurring"],
            "kit_rule_answer_without_capo": low["answer"], "capo_given": capo, "tuning_midi": tuning,
            "lowest_json": out_json.replace(G, "G")}


def wrong_rung(S):
    T = json.load(open(f"{G}/truth/{S}/{S}.truth.json"))
    capo, true_t = T["capo"], T["tuning_midi"]
    d = f"{OUT}/{S}/inputs"; os.makedirs(d, exist_ok=True)
    chain2 = capo_aware(f"{G}/experiments/{S}/chain-2/notes.csv", capo, f"{d}/lowest_chain2.json")
    ref = {}
    for n in ("n-01", "n-01-hint"):
        p = f"{G}/experiments/{S}/{n}/notes.csv"
        if os.path.exists(p): ref[n] = capo_aware(p, capo, f"{d}/lowest_{n}.json")
    if S == "tuning":
        R = json.load(open(f"{G}/blind/results.json"))
        arms = {}
        for k, a in R["attempts"].items():
            for arm, v in a.items():
                if v.get("song") == S and v.get("round") == 2: arms[f"{k} {arm}"] = v["protocol"]["tuning_midi"]
        vals = {tuple(v) for v in arms.values()}
        if len(vals) != 1: raise SystemExit(f"round-2 arms disagree on nylon: {arms}")
        tuning = list(vals.pop())
        rung = {"rule": "both AO-082 round-2 blind arms' answer (G/blind/results.json, protocol.tuning_midi)",
                "arms": arms, "tuning_midi": tuning}
        ref["chain-2 (capo-aware lowest-note rule)"] = chain2
    else:
        rung = dict(chain2, rule="the kit's lowest-note rule on chain-2's notes, read knowing the capo: L < 40 + capo "
                                 "=> 6th string L - capo, else standard")
        tuning = chain2["tuning_midi"]
    rec = {"song": S, "true_tuning_midi": true_t, "capo": capo, "rung": rung, "tuning_midi": tuning,
           "string_differences_semitones": [a - b for a, b in zip(tuning, true_t)],
           "dropped": tuning == true_t, "same_rule_on_other_notes_reference_only": ref}
    json.dump(rec, open(f"{d}/wrong_tuning.json", "w"), indent=1)
    return rec


if __name__ == "__main__":
    for S in (sys.argv[1:] or ["capo", "tuning", "standard"]):
        r = wrong_rung(S)
        print(S, r["tuning_midi"], "dropped" if r["dropped"] else "kept",
              {k: v["tuning_midi"] for k, v in r["same_rule_on_other_notes_reference_only"].items()})
