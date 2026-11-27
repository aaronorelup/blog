#!/usr/bin/env python3
"""make_results.py [out.json]: LOOP's results.json from the score files, the run logs and the eval ledger.
Types in no number: every score is read from a gtr-eval output, every eval id from the ledger by its --out path,
every cost and minute from a run's units_log.jsonl or w2_summary.json. Orchestrator only."""
import json, os, sys

G = "/home/user/gtv"
R = f"{G}/loop/runs"
S = f"{G}/loop/score"
LEDGER = f"{G}/loop/ledger/evals.jsonl"

led = {}
for line in open(LEDGER):
    e = json.loads(line)
    a = e.get("argv") or []
    if "--out" in a:
        led[os.path.realpath(os.path.join(e.get("cwd") or "/", a[a.index("--out") + 1]))] = e["id"]  # the last eval to write a path wins


def ev(path):
    return led.get(os.path.realpath(path))


def tabm(path):
    d = json.load(open(path))
    c, m = d["counts"], d["metrics"]
    right = m["same_string_and_fret_count"]
    return {"main": m["same_string_and_fret_fraction_of_truth"], "of_matched": m["same_string_and_fret_fraction_of_matched"],
            "matched": m["matched_fraction_of_truth"], "right": right, "wrong_place": c["n_matched"] - right,
            "missed": c["n_truth"] - c["n_matched"], "invented": c["n_est"] - c["n_matched"], "key_notes": c["n_truth"],
            "file": path.replace(G, "G"), "eval": ev(path)}


def onset_f1(path):
    d = json.load(open(path))
    o = d["metrics"]["onset_only"]; return o.get("f1", o.get("f_measure")), ev(path)


def runlog(r):
    rows = [json.loads(l) for l in open(f"{R}/{r}/units_log.jsonl")]
    kinds = {}
    for x in rows:
        kinds[x.get("kind")] = kinds.get(x.get("kind"), 0) + 1
    return {"calls": kinds, "cost_usd_list": round(sum((x.get("cost_usd_list") or 0) for x in rows), 2),
            "writer_minutes": round(sum(x.get("wall_s", 0) for x in rows) / 60, 1),
            "output_tokens": sum((x.get("tokens") or {}).get("output", 0) for x in rows),
            "file": f"G/loop/runs/{r}/units_log.jsonl"}


out = {"made_by": "G/loop/work/make_results.py", "scorer": "gtr-eval 0.12.1",
       "main_number": "same string and fret as the key, frets from each side's capo, onset within 50 ms, same pitch, as a share of all key notes (gtr-eval tab, same_string_and_fret_fraction_of_truth)",
       "heard": "the same over the key notes whose conf is not 'tab'", "loop_runs": {}, "w2": {}, "e6": None, "heldout": {}}

SONG = {"capo": "Steal My Girl (Gareth Evans), standard, capo 3", "standard": "Imagine (Gareth Evans), standard",
        "nylon": "A soft collision of breath (Evan Handyside), D G C F A C", "closer": "Closer (Gareth Evans), E A D G A D, capo 1",
        "september": "Wake Me Up When September Ends, Jonathan's Version (Evan Handyside), open G, capo 2", "boats": "Boats (held out, a third player)"}
WHAT = {"l1": "L1: the loop with the key's notes (ASSISTED: a ceiling)", "l2": "L2: the loop, the app's path with the tuning given",
        "l3": "L3: the loop, the tuning found", "l4": "L4: L2 with the hand window off", "e6s": "E6: L2 with the carried state emptied before every unit"}

for r in sorted(os.listdir(R)):
    sd = f"{R}/{r}/score"
    if not os.path.exists(f"{sd}/summary.json") or r.startswith(("dry", "sn-", "kt-", "vt-")):
        continue
    sm = json.load(open(f"{sd}/summary.json"))
    kind, song = r.split("-", 1)
    row = {"what": WHAT.get(kind, kind), "song": song, "units_done": sm["units_done"], "units_total": sm["units_total"],
           "tab": tabm(f"{sd}/span_tab.json"), "heard": tabm(f"{sd}/span_tab_heard.json")}
    f1, f1e = onset_f1(f"{sd}/span_notes.json")
    row["onset_f1"], row["onset_f1_eval"] = f1, f1e
    if os.path.exists(f"{sd}/span_tab_gp5.json"):
        row["gp5"] = tabm(f"{sd}/span_tab_gp5.json")
    if os.path.exists(f"{sd}/span_solver_tab.json"):
        row["solver_alone"] = tabm(f"{sd}/span_solver_tab.json")
        row["solver_alone_heard"] = tabm(f"{sd}/span_solver_tab_heard.json")
    for k in ("thirds", "per_unit_slope_of_right_share", "changes", "change_verdicts"):
        if k in sm:
            row[k] = sm[k]
    row["log"] = runlog(r)
    out["loop_runs"][r] = row

for r in sorted(os.listdir(S)):
    f = f"{S}/{r}/w2_summary.json"
    if not os.path.exists(f):
        continue
    w = json.load(open(f))
    song = r.replace("w2-ho-", "").replace("w2-", "")
    row = {"song": song, "held_out": r.startswith("w2-ho-"), "tab": tabm(f"{S}/{r}/w2_tab.json"),
           "heard": tabm(f"{S}/{r}/w2_tab_heard.json"), "minutes": w["minutes"], "cost_usd_list": w["cost_usd_list"],
           "answer": w["answer"].replace(G, "G")}
    if os.path.exists(f"{S}/{r}/w2_notes.json"):
        row["onset_f1"], row["onset_f1_eval"] = onset_f1(f"{S}/{r}/w2_notes.json")
    if os.path.exists(f"{S}/{r}/solver_tab_score.json"):
        row["solver_alone_same_inputs"] = tabm(f"{S}/{r}/solver_tab_score.json")
    (out["heldout"] if row["held_out"] else out["w2"])[song] = row

e6 = f"{S}/e6-span/e6_span.json"
if os.path.exists(e6):
    d = json.load(open(e6))
    out["e6"] = {"span": f"units 0 to 37, onsets before {d['t1']} s", "key_notes": d["key_notes"], "heard_key_notes": d["heard_key_notes"],
                 "runs": {r: {"tab": tabm(f"{S}/e6-span/{r}_all.json"), "heard": tabm(f"{S}/e6-span/{r}_heard.json")} for r in d["runs"]},
                 "e6_log": runlog("e6s-capo"), "note": "E6 stopped at 38 of 73 units for the weekly limit; L2 and L4 cut to the same span"}

out["heldout_tuning"] = {}
for song in ("closer", "september", "boats"):
    f = f"{S}/heldout-tuning/{song}.json"
    if os.path.exists(f):
        m = json.load(open(f))["metrics"]
        out["heldout_tuning"][song] = {"found": m["est_tuning_midi"], "key": m["truth_tuning_midi"], "capo_given": m["est_capo"],
                                      "strings_right": sum(a == b for a, b in zip(m["est_tuning_midi"], m["truth_tuning_midi"])),
                                      "finder": f"G/heldout/{song}/finder.json", "file": f.replace(G, "G"), "eval": ev(f)}

json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else "/home/user/blog/docs/guitar-tab-research/loop/results.json", "w"), indent=1)
missing = [(k, r) for k in ("loop_runs",) for r, v in out[k].items() if v["tab"]["eval"] is None]
print("runs", list(out["loop_runs"]), "w2", list(out["w2"]), "heldout", list(out["heldout"]), "e6", bool(out["e6"]), "no eval id:", missing)
