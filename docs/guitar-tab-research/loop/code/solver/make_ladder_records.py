#!/usr/bin/env python3
"""make_ladder_records.py <ladder.json out> <tables.md out>: the public records of E3 (second pass), built from each
cell's own cell.json (names listed in G/loop/e3/<S>/ladder_<S>.json), the fixed points' fixed.json, the first pass's
frozen cells (G/loop/e3/first-pass/<S>/), checks.json (ladder_checks.py) and the weight search's logs. Every eval id
is checked against the ledger (subcommand, answer file, value) before it is written; any mismatch stops the run.
Prints nothing typed in: every count comes from one of those files."""
import hashlib, json, os, sys

G = "/home/user/gtv"
OUT = f"{G}/loop/e3"
SONGS = ["capo", "tuning", "standard"]
LEDGER = f"{G}/loop/ledger/evals.jsonl"
LABEL = {"capo": "capo (Steal My Girl, capo 3)", "tuning": "nylon (slot tuning, D2 G2 C3 F3 A3 C4)",
         "standard": "standard (Imagine)"}
COLS = ["main", "heard", "heard_of_matched", "of_matched", "matched", "onset_f1", "right", "wrong_place", "missed",
        "invented", "heard_matched", "n_heard", "soft_fallback_groups", "dropped", "eval_tab", "eval_notes", "eval_tab_heard"]
HANDCOLS = ["off", "tool", "tool-soft", "perfect", "perfect-soft", "ceiling", "ceiling-soft"]


def sha(p): return hashlib.sha256(open(p, "rb").read()).hexdigest()
def short(p): return p.replace(G, "G") if isinstance(p, str) else p


def ledger():
    L = {}
    for line in open(LEDGER):
        try: r = json.loads(line)
        except ValueError: continue
        L[r["id"]] = r
    return L


class Checker:
    def __init__(self): self.L = ledger(); self.n = 0; self.bad = []

    def check(self, eid, sub, est, value, key, est_sha=None):
        """The ledger line of eid must be subcommand sub on this answer file (path, or with est_sha its SHA-256 only,
        for frozen copies) and carry this value; the answer must still have the bytes it was scored with."""
        self.n += 1
        r = self.L.get(eid)
        if r is None: self.bad.append(f"{eid}: not in ledger"); return
        a = r["argv"]
        e = a[a.index("--est") + 1] if "--est" in a else None
        if a[0] != sub or (est_sha is None and e != est): self.bad.append(f"{eid}: {a[0]} {e} != {sub} {est}"); return
        if r["result"]["est"]["sha256"] != (est_sha or sha(est)): self.bad.append(f"{eid}: {est} changed since scored"); return
        m = r["result"]["metrics"]
        v = m["onset_only"]["f1"] if key == "onset_f1" else m[key]
        if abs(v - value) > 1e-9: self.bad.append(f"{eid}: {key} {v} != {value}")


def row(s, solver_stats=None):
    out = []
    for k in COLS:
        if k in ("soft_fallback_groups", "dropped"): out.append(solver_stats.get(k) if solver_stats else None)
        elif k in ("main", "heard", "heard_of_matched", "of_matched", "matched", "onset_f1"): out.append(round(s[k], 4))
        else: out.append(s.get(k))
    return out


def check_score(C, s, est, heard_truth=True):
    C.check(s["eval_tab"], "tab", est, s["main"], "same_string_and_fret_fraction_of_truth")
    C.check(s["eval_notes"], "notes", est, s["onset_f1"], "onset_f1")
    C.check(s["eval_tab_heard"], "tab", est, s["heard"], "same_string_and_fret_fraction_of_truth")


def same_as_chain2(B, tk):
    """True when every chain2f cell of this tuning scores exactly as its chain2 cell (the filter removed nothing)."""
    ns = [n for n in B if n.startswith(f"chain2f-{tk}-")]
    return bool(ns) and all(B[n]["main"] == B.get(n.replace("chain2f", "chain2", 1), {}).get("main") and
                            B[n]["heard"] == B[n.replace("chain2f", "chain2", 1)]["heard"] for n in ns)


def main(out_json, out_md):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import solver
    C = Checker()
    R = json.load(open(f"{G}/blind/results.json"))
    checks = json.load(open(f"{OUT}/checks.json"))
    rec = {"what": "E3 of LOOP.md, second pass: the constraint ladder with a plain solver (no Opus), capo given everywhere.",
           "solver": {"path": "G/loop/tools/solver/solver.py", "sha256": sha(f"{G}/loop/tools/solver/solver.py"),
                      "weights_kept": solver.DEFAULT_W},
           "scorer": "gtr-eval 0.12.1, ledger G/loop/ledger/evals.jsonl: tab (main = metrics.same_string_and_fret_fraction_"
                     "of_truth on answer.json: the tab list on the recording's clock), notes (metrics.onset_only.f1), and tab "
                     "against the key's heard notes (conf not 'tab': G/loop/e3/<S>/inputs/truth_heard.json): heard = same "
                     "string and fret as a share of those, heard_of_matched = of the matched ones among them",
           "cell_names": "<notes>-<tuning>-<hand>[-soft]; notes key|chain2|chain2f, tuning given|wrong (finder: the "
                         "orchestrator's slot), hand off|tool|perfect|ceiling, window hard unless -soft",
           "assisted": "every key-notes cell and every perfect or ceiling cell uses the answer key: ceilings, never results",
           "fitted": "the kept weights were chosen on the capo song's key (tune_weights.py): capo's kept-weight rows are "
                     "FITTED; startw_cells use the search's start weights",
           "columns": COLS, "songs": {}}
    md = []
    for S in SONGS:
        L = json.load(open(f"{OUT}/{S}/ladder_{S}.json"))
        S_ = {"label": LABEL[S], "tool_window": {"path": short(L["tool_window"]), "source": L["tool_window_source"],
                                                  "sha256": L["tool_window_sha256"]},
              "hand_filter": short(L["hand_filter"]),
              "chain2f": {k: {kk: short(v[kk]) for kk in ("filter", "filter_sha256", "removed", "n_in", "n_kept")}
                          for k, v in L["chain2f"].items()},
              "tunings": L["tunings"], "dropped": L["dropped"], "waiting": L["waiting"],
              "wrong_rung": {k: L["wrong_rung"][k] for k in ("tuning_midi", "string_differences_semitones", "dropped")}
                            | {"rule": L["wrong_rung"]["rung"]["rule"],
                               "evidence": {k: v for k, v in L["wrong_rung"]["rung"].items() if k not in ("rule", "tuning_midi")},
                               "same_rule_other_notes": {k: v["tuning_midi"] for k, v in
                                                         L["wrong_rung"]["same_rule_on_other_notes_reference_only"].items()}},
              "cells": {}, "startw_cells": {}, "fixed": {}, "first_pass_wrong": {}}
        by, bys = {}, {}
        for group, names, base, dest in (("kept", L["cells"], f"{OUT}/{S}", S_["cells"]),
                                         ("start", L["startw_cells"], f"{OUT}/{S}/startw", S_["startw_cells"])):
            for name in names:
                c = json.load(open(f"{base}/{name}/cell.json"))
                s = c["score"]
                if "main" not in s: dest[name] = {"error": s.get("error") or c.get("error")}; continue
                if c["inputs"]["weights"] != (solver.DEFAULT_W if group == "kept" else L["start_weights"]):
                    raise SystemExit(f"{S} {name}: weights differ from the {group} set")
                check_score(C, s, f"{base}/{name}/answer.json")
                dest[name] = row(s, c["solver"])
                (by if group == "kept" else bys)[name] = dict(s, **c["solver"])
        fp_names = L.get("first_pass_wrong_cells", [])
        fpL = json.load(open(f"{OUT}/first-pass/{S}/ladder_{S}.json"))
        S_["first_pass"] = {"tool_window": short(fpL["tool_window"]), "tool_window_sha256": fpL["tool_window_sha256"],
                            "wrong_tuning": "chain-1's (" + str(json.load(open(f"{G}/experiments/{S}/chain-1/tab.json"))["tuning_midi"]) + ")"}
        fpby = {}
        for name in fp_names:
            d = f"{OUT}/first-pass/{S}/{name}"
            c = json.load(open(f"{d}/cell.json")); h = json.load(open(f"{d}/heard.json")); s = c["score"]
            if h["answer_sha256"] != sha(f"{d}/answer.json"): raise SystemExit(f"first pass {S} {name}: heard is stale")
            C.check(s["eval_tab"], "tab", f"{d}/answer.json", s["main"], "same_string_and_fret_fraction_of_truth",
                    est_sha=sha(f"{d}/answer.json"))
            C.check(h["eval_tab_heard"], "tab", f"{d}/answer.json", h["heard"], "same_string_and_fret_fraction_of_truth")
            s = dict(s, heard=h["heard"], heard_of_matched=h["heard_of_matched"], eval_tab_heard=h["eval_tab_heard"])
            S_["first_pass_wrong"][name] = row(s, c["solver"]); fpby[name] = s
        # what changed from the first pass, same cell name (tuning given)
        ch = {}
        for name, s in by.items():
            p = f"{OUT}/first-pass/{S}/{name}/cell.json"
            if os.path.exists(p):
                o = json.load(open(p))["score"].get("main")
                if o is not None and abs(o - s["main"]) > 1e-9: ch[name] = [round(o, 4), round(s["main"], 4)]
        S_["changed_from_first_pass"] = ch
        for k in L["fixed"]:
            f = json.load(open(f"{OUT}/{S}/fixed/{k}/fixed.json")); s = f["score"]
            check_score(C, s, f["est"])
            S_["fixed"][k] = {"est": short(f["est"]), "row": row(s)}
        kit = [k for k, a in R["attempts"].items() if a.get("tools", {}).get("song") == S and a["tools"].get("round") == 2][0]
        a = R["attempts"][kit]["tools"]
        S_["kit_arm_round2"] = {"attempt": kit, "from": "G/blind/results.json",
                                "list": {"main": a["protocol"]["list_same_string_fret_of_truth"],
                                         "of_matched": a["chain_style"]["tab_list_same_string_fret_of_matched"],
                                         "matched": a["chain_style"]["tab_list_matched_of_truth"],
                                         "onset_f1": a["protocol"]["list_notes_onset_f1"]},
                                "gp5": {"main": a["chain_style"]["tab_gp5_same_string_fret_of_truth"],
                                        "of_matched": a["chain_style"]["tab_gp5_same_string_fret_of_matched"],
                                        "onset_f1": a["chain_style"]["notes_gp5_onset_f1"], "counts": a["counts_gp5"]}}
        ks = json.load(open(f"{OUT}/{S}/fixed/kit-arm/fixed.json"))["score"]
        for k_ in ("main", "of_matched", "matched", "onset_f1"):
            if abs(ks[k_] - S_["kit_arm_round2"]["list"][k_]) > 5e-6:
                raise SystemExit(f"{S} kit arm re-score {k_} {ks[k_]} != results.json {S_['kit_arm_round2']['list'][k_]}")
        gains = {}
        for grp, B in (("kept", by), ("start", bys)):
            for nk in ("key", "chain2", "chain2f"):
                off = B.get(f"{nk}-given-off")
                if not off: continue
                for hk in ("tool", "perfect", "ceiling"):
                    r = B.get(f"{nk}-given-{hk}")
                    if r: gains[f"{grp} {nk}-given: {hk} - off"] = round(r["main"] - off["main"], 4)
        S_["window_gains_tuning_given"] = gains
        S_["chain2f_equals_chain2"] = {tk: same_as_chain2(by, tk) for tk in L["tunings"] if f"chain2f-{tk}-off" in by}
        hs = [round(by[n]["main"] - by[n + "-soft"]["main"], 4) for n in by if n + "-soft" in by]
        S_["hard_minus_soft"] = {"n_pairs": len(hs), "min": min(hs) if hs else None, "max": max(hs) if hs else None,
                                 "n_differ": sum(1 for x in hs if abs(x) > 1e-9)}
        rec["songs"][S] = S_
        # ---- markdown
        fit = " FITTED" if S == "capo" else ""
        tw = L["tool_window"]
        md.append(f"\n### {LABEL[S]}\n")
        md.append(f"Tool window ({L['tool_window_source']}): `{short(tw)}` (SHA-256 `{L['tool_window_sha256'][:12]}`); "
                  f"chain2f by {('`' + short(L['hand_filter']) + '`') if L['hand_filter'].endswith('.py') else 'the solver rule'}. "
                  f"Each cell: main / heard.\n")
        md.append("| notes, tuning, weights | " + " | ".join(h.replace("-", " ") + (" (A)" if h.startswith(("perfect", "ceiling")) else "")
                                                 for h in HANDCOLS) + " |")
        md.append("|---" * (len(HANDCOLS) + 1) + "|")
        for nk in ("key", "chain2", "chain2f"):
            for tk in ("given", "wrong"):
                for grp, B in (("kept", by), ("start", bys)):
                    if not any(f"{nk}-{tk}-{h}" in B for h in HANDCOLS): continue
                    if nk == "chain2f" and same_as_chain2(B, tk): continue
                    vals = [(f"{B[n]['main']:.3f} / {B[n]['heard']:.3f}" if n in B else "-") for n in
                            (f"{nk}-{tk}-{h}" for h in HANDCOLS)]
                    lab = f"{nk}{' (A)' if nk == 'key' else ''}, {tk}, " + ("kept" + fit if grp == "kept" else "start")
                    md.append(f"| {lab} | " + " | ".join(vals) + " |")
        md.append("")
        md.append("| detail | main | heard | heard of matched | of matched | matched | onset F1 | right / wrong place / missed / invented | eval tab, notes, heard |")
        md.append("|---|---|---|---|---|---|---|---|---|")
        names = ["key-given-off", "key-given-tool", "chain2-given-off", "chain2-given-tool"] + \
                ([] if same_as_chain2(by, "given") else ["chain2f-given-tool"]) + ["key-wrong-tool", "chain2-wrong-tool"]
        for grp, B, nl in (("kept" + fit.lower(), by, names),):
            for name in nl:
                r = B.get(name)
                if not r: continue
                md.append(f"| {name} ({grp}) | {r['main']:.3f} | {r['heard']:.3f} | {r['heard_of_matched']:.3f} | {r['of_matched']:.3f} | "
                          f"{r['matched']:.3f} | {r['onset_f1']:.3f} | {r['right']} / {r['wrong_place']} / {r['missed']} / "
                          f"{r['invented']} | {r['eval_tab']}, {r['eval_notes']}, {r['eval_tab_heard']} |")
        eq = {}
        for k, cell in (("chain-5", "key-given-off"), ("chain-2", "chain2-given-off")):
            f_ = json.load(open(f"{OUT}/{S}/fixed/{k}/fixed.json"))["score"]
            eq[k] = all(f_[x] == by[cell][x] for x in ("main", "heard", "heard_of_matched", "of_matched", "matched", "onset_f1",
                                                        "right", "wrong_place", "missed", "invented"))
        S_["fixed_equal_hand_off_cells"] = eq
        for k in L["fixed"]:
            if eq.get(k): continue
            s = json.load(open(f"{OUT}/{S}/fixed/{k}/fixed.json"))["score"]
            lab = f"AO-082 {k}, re-scored" if k != "kit-arm" else f"kit arm round 2 ({kit}), list re-scored"
            md.append(f"| {lab} | {s['main']:.3f} | {s['heard']:.3f} | {s['heard_of_matched']:.3f} | {s['of_matched']:.3f} | "
                      f"{s['matched']:.3f} | {s['onset_f1']:.3f} | {s['right']} / {s['wrong_place']} / {s['missed']} / "
                      f"{s['invented']} | {s['eval_tab']}, {s['eval_notes']}, {s['eval_tab_heard']} |")
        g = S_["kit_arm_round2"]["gp5"]; cg = g["counts"]
        md.append(f"| kit arm round 2, GP5 (results.json) | {g['main']:.3f} | | | {g['of_matched']:.3f} | | {g['onset_f1']:.3f} | "
                  f"{cg['right']} / {cg['wrong_position']} / {cg['missed']} / {cg['invented']} (GP5) | |")
        same = [f"{k} = {c}" for k, c in (("chain-5", "key-given-off"), ("chain-2", "chain2-given-off")) if eq[k]]
        if same: md.append(f"\nAO-082's fixed points re-scored: {', '.join(same)} in every column (eval ids in ladder.json).")
    # ---- first pass table (all songs)
    md.append("\n### First pass: the old wrong rung (chain-1's tuning), frozen\n")
    md.append("| song, notes | " + " | ".join(h.replace("-", " ") + (" (A)" if h.startswith(("perfect", "ceiling")) else "")
                                            for h in HANDCOLS) + " |")
    md.append("|---" * (len(HANDCOLS) + 1) + "|")
    for S in SONGS:
        fp = rec["songs"][S]["first_pass_wrong"]
        for nk in ("key", "chain2", "chain2f"):
            ns = [f"{nk}-wrong-{h}" for h in HANDCOLS]
            if not any(n in fp for n in ns): continue
            if nk == "chain2f" and all(fp[n][:2] == fp.get(n.replace("chain2f", "chain2", 1), [None, None])[:2] for n in ns if n in fp):
                continue
            i, j = COLS.index("main"), COLS.index("heard")
            md.append(f"| {'nylon' if S == 'tuning' else S}, {nk}{' (A)' if nk == 'key' else ''} | " +
                      " | ".join((f"{fp[n][i]:.3f} / {fp[n][j]:.3f}" if n in fp else "not run") for n in ns) + " |")
    # ---- window gains
    md.append("\n### What the window buys (tuning given; main number)\n")
    md.append("| song, notes, weights | tool - off | perfect - off (A) | ceiling - off (A) |")
    md.append("|---|---|---|---|")
    for S in SONGS:
        gz = rec["songs"][S]["window_gains_tuning_given"]
        for grp in ("kept", "start"):
            for nk in ("key", "chain2", "chain2f"):
                ks = [f"{grp} {nk}-given: {h} - off" for h in ("tool", "perfect", "ceiling")]
                if not any(k in gz for k in ks): continue
                if nk == "chain2f" and rec["songs"][S]["chain2f_equals_chain2"].get("given"): continue
                if nk == "key" and grp == "start": continue
                lab = f"{'nylon' if S == 'tuning' else S}, {nk}{' (A)' if nk == 'key' else ''}, {grp}{' FITTED' if S == 'capo' and grp == 'kept' else ''}"
                md.append(f"| {lab} | " + " | ".join((f"{gz[k]:+.3f}" if k in gz else "-") for k in ks) + " |")
    # ---- weight search, checks, plan rule
    tc = json.load(open(f"{OUT}/tune_capo.json"))
    best = tc["log"][0]["obj"]; steps = []
    for e in tc["log"][1:]:
        if e["obj"] > best + 1e-4: best = e["obj"]; steps.append([e["step"], round(e["obj"], 4)])
    rec["weight_search"] = {"song": "capo (FITTED on its key)", "window": "G/loop/e1/capo/v0_m1/hand_window.csv (first pass)",
                            "objective": "mean main number of key-given-off, key-given-tool, chain2-given-off, chain2-given-tool "
                                         "(hard), scored in-process with mir_eval's matching",
                            "start": tc["log"][0]["W"], "start_objective": round(tc["log"][0]["obj"], 4),
                            "accepted_steps": steps, "kept": tc["kept"], "kept_objective": round(tc["objective"], 4),
                            "soft_win_search": tc["soft_win_search"], "soft_win_extra": checks["soft_win_extra"],
                            "open_win_search": json.load(open(f"{OUT}/tune_capo_open_win.json")),
                            "files": ["G/loop/e3/tune_capo.json", "G/loop/e3/tune_capo_open_win.json", "G/loop/e3/checks.json"]}
    for r_ in checks["soft_win_extra"]["runs"]:
        C.check(r_["eval_tab"], "tab", f"{OUT}/checks/soft_win/{r_['notes']}-win{r_['win']}/answer.json", r_["main"],
                "same_string_and_fret_fraction_of_truth")
    rec["checks"] = {k: v for k, v in checks.items() if k != "soft_win_extra"}
    rec["checks"]["made_by"] = "G/loop/tools/solver/ladder_checks.py -> G/loop/e3/checks.json"
    gz = {s: rec["songs"][s]["window_gains_tuning_given"].get("kept chain2-given: tool - off") for s in ("capo", "standard")}
    rec["plan_rule"] = {"rule": "if the window adds under 0.01 on both steel songs with the tuning given, E4's hand-off "
                        "rung runs on the nylon song only", "chain2-given tool - off (kept weights)": gz,
                        "fires": all(v is not None and v < 0.01 for v in gz.values())}
    rec["eval_ids_checked"] = {"n": C.n, "mismatches": C.bad}
    if C.bad: raise SystemExit("eval id mismatches:\n" + "\n".join(C.bad[:20]))
    json.dump(rec, open(out_json, "w"), separators=(",", ":"))
    open(out_md, "w").write("\n".join(md) + "\n")
    print(out_json, os.path.getsize(out_json), "bytes;", C.n, "eval ids checked, 0 mismatches")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
