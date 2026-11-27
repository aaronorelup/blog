#!/usr/bin/env python3
"""run_ladder.py [song ...]: E3's constraint ladder (second pass). Every cell: answer.json in
G/loop/e3/<S>/<notes>-<tuning>-<hand>[-soft]/ (start-weight cells under G/loop/e3/<S>/startw/), validated, scored with
gtr-eval tab and notes against the key, and tab against the key's HEARD notes (conf not "tab"), ledger
G/loop/ledger/evals.jsonl; everything about a cell is in its cell.json, which is the only source of the records.

- One run at a time: an exclusive lock on G/loop/e3/.run_ladder.lock (a second run waits).
- Resumable: a cell is skipped when its cell.json has the same inputs (notes, window and solver SHA-256, tuning, capo,
  mode, weights). So a window file that changes later re-runs exactly the cells that used it.
- Tunings: given (the key's), wrong (wrong_tuning.py: nylon D G C F A D; steel the capo-aware lowest-note rule, dropped
  where it equals the true tuning), finder (E2's slot: read from G/loop/e3/<S>/inputs/finder_tuning.json
  {"tuning_midi": [...], "source": "..."} when the orchestrator writes it; until then listed as waiting).
- Hand windows: tool = the published G/loop/hand/<S>/hand_window.csv (or the records' loop/hand/<S>/) when it exists,
  else E1's development window (DEV below); perfect and ceiling are ASSISTED windows made from the key (key_windows.py).
- chain2f = chain-2's notes after the session's one hand filter (hand_filter.py, where E1 publishes it), else the
  solver's own rule (solver.placeable_in_window, the same rule); which one is recorded with its SHA-256.
- Fixed points re-scored in G/loop/e3/<S>/fixed/: AO-082's chains 5, 2 and 1, and the round-2 kit arm's answer.json.
- The first pass's wrong-tuning cells (chain-1's tuning), frozen in G/loop/e3/first-pass/<S>/, get the heard share too."""
import fcntl, hashlib, json, os, re, subprocess, sys, time

G = "/home/user/gtv"
BLOG = "/home/user/blog/docs/guitar-tab-research/loop"
HERE = os.path.dirname(os.path.abspath(__file__))
SOLVER = f"{HERE}/solver.py"
PY = f"{G}/tools/venv-torch/bin/python"
EVAL = "/home/user/gtr/bin/gtr-eval"
VALID = f"{G}/tools/kit/validate_answer.py"
OUT = f"{G}/loop/e3"
FIRST = f"{OUT}/first-pass"
ENV = dict(os.environ, GTR_EVAL_LEDGER=f"{G}/loop/ledger/evals.jsonl", GTR_AGENT="e3-fix")
NOTES_KINDS = ["key", "chain2", "chain2f"]
TUNINGS = ["given", "wrong", "finder"]
HANDS = ["off", "tool", "perfect", "ceiling"]
DEV = {"capo": f"{G}/loop/e1/capo/dev/final_m1_f30/hand_window.csv",
       "standard": f"{G}/loop/e1/standard/dev/final_m1_f30/hand_window.csv",
       "tuning": f"{G}/loop/e1/tuning/dev/final2_m1_f30/hand_window.csv"}
FILTERS = [f"{G}/loop/tools/handreach/hand_filter.py", f"{BLOG}/hand/hand_filter.py"]
START_CELLS = {"notes": ["key", "chain2"], "tuning": "given"}     # the weight search's start weights, all hands

sys.path.insert(0, HERE)
import solver  # noqa: E402
import wrong_tuning  # noqa: E402


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def start_weights():
    tc = json.load(open(f"{OUT}/tune_capo.json"))
    return dict(solver.DEFAULT_W, **tc["log"][0]["W"])


def tool_window(S):
    for src, p in (("published", f"{G}/loop/hand/{S}/hand_window.csv"), ("published", f"{BLOG}/hand/{S}/hand_window.csv"),
                   ("development", DEV[S])):
        if os.path.exists(p): return p, src
    return None, None


def hand_filter():
    for p in FILTERS:
        if os.path.exists(p): return p
    return None


def evalrun(args):
    p = subprocess.run([EVAL] + args, capture_output=True, text=True, env=ENV)
    m = re.search(r"\[gtr-eval (e\d+)\]", p.stderr)
    return (m.group(1) if m else None), p.returncode, p.stderr.strip()[-400:]


def truth_heard(S):
    T = json.load(open(f"{G}/truth/{S}/{S}.truth.json"))
    p = f"{OUT}/{S}/inputs/truth_heard.json"
    Th = dict(T); Th["notes"] = [n for n in T["notes"] if n.get("conf") != "tab"]
    if not os.path.exists(p) or json.load(open(p))["notes"] != Th["notes"]: json.dump(Th, open(p, "w"))
    return p


def score(S, est, d):
    tr = f"{G}/truth/{S}/{S}.truth.json"; th = truth_heard(S)
    eid_t, rc1, e1 = evalrun(["tab", "--truth", tr, "--est", est, "--out", f"{d}/score_tab.json"])
    eid_n, rc2, e2 = evalrun(["notes", "--truth", tr, "--est", est, "--out", f"{d}/score_notes.json"])
    eid_h, rc3, e3 = evalrun(["tab", "--truth", th, "--est", est, "--out", f"{d}/score_tab_heard.json"])
    r = {"eval_tab": eid_t, "eval_notes": eid_n, "eval_tab_heard": eid_h, "truth_sha256": sha(tr),
         "truth_heard_sha256": sha(th)}
    if rc1 or rc2 or rc3:
        r["error"] = (e1 if rc1 else "") + (e2 if rc2 else "") + (e3 if rc3 else ""); return r
    t = json.load(open(f"{d}/score_tab.json")); n = json.load(open(f"{d}/score_notes.json"))
    h = json.load(open(f"{d}/score_tab_heard.json"))
    m, c = t["metrics"], t["counts"]
    right = m["same_string_and_fret_count"]; matched = c["n_matched"]
    hm, hc = h["metrics"], h["counts"]
    r.update(main=m["same_string_and_fret_fraction_of_truth"], of_matched=m["same_string_and_fret_fraction_of_matched"],
             matched=m["matched_fraction_of_truth"], onset_f1=n["metrics"]["onset_only"]["f1"],
             right=right, wrong_place=matched - right, missed=c["n_truth"] - matched, invented=c["n_est"] - matched,
             n_truth=c["n_truth"], n_est=c["n_est"], tuning_differs=t["tuning_and_capo"]["tuning_differs"],
             heard=hm["same_string_and_fret_fraction_of_truth"], heard_of_matched=hm["same_string_and_fret_fraction_of_matched"],
             heard_right=hm["same_string_and_fret_count"], heard_matched=hc["n_matched"], n_heard=hc["n_truth"])
    return r


def inputs(S):
    T = json.load(open(f"{G}/truth/{S}/{S}.truth.json"))
    d = f"{OUT}/{S}/inputs"; os.makedirs(d, exist_ok=True)
    kn = f"{d}/key_notes.csv"
    if not os.path.exists(kn):
        with open(kn, "w") as f:
            f.write("onset,offset,pitch\n")
            for n in sorted(T["notes"], key=lambda n: n["onset"]):
                f.write(f"{n['onset']},{n['offset']},{n['pitch']}\n")
    wr = wrong_tuning.wrong_rung(S)
    tunings, waiting, dropped = {"given": T["tuning_midi"]}, [], {}
    if wr["dropped"]: dropped["wrong"] = f"{wr['tuning_midi']} equals the true tuning ({wr['rung']['rule']})"
    else: tunings["wrong"] = wr["tuning_midi"]
    fp = f"{d}/finder_tuning.json"
    if os.path.exists(fp): tunings["finder"] = json.load(open(fp))["tuning_midi"]
    else: waiting.append(f"tuning finder: all cells (E2; {fp.replace(G, 'G')} not written)")
    return T, kn, tunings, wr, waiting, dropped


def filtered(S, tk, tuning, capo, win):
    """chain-2's notes minus those the tool window cannot place under this tuning: the session's hand filter when it
    exists, else the solver's own rule."""
    d = f"{OUT}/{S}/inputs"; p = f"{d}/chain2f_{tk}.csv"; meta = p + ".json"; rem = f"{d}/chain2f_{tk}_removed.csv"
    src = f"{G}/experiments/{S}/chain-2/notes.csv"
    hf = hand_filter()
    want = {"window": win, "window_sha256": sha(win), "tuning": tuning, "capo": capo, "notes": src, "notes_sha256": sha(src),
            "filter": hf or "solver.placeable_in_window", "filter_sha256": sha(hf) if hf else sha(SOLVER)}
    if os.path.exists(meta) and os.path.exists(p):
        old = json.load(open(meta))
        if all(old.get(k) == v for k, v in want.items()): return p, old
    notes = solver.load_notes(src); m = dict(want)
    if hf:
        cmd = [PY, hf, src, win, "--tuning", ",".join(map(str, tuning)), "--capo", str(capo), "--out", p, "--removed", rem]
        q = subprocess.run(cmd, capture_output=True, text=True)
        try:
            if q.returncode: raise RuntimeError(q.stderr[-300:])
            keep = solver.load_notes(p); m["cmd"] = " ".join(cmd)
        except Exception as e:  # the filter failed: record it and use the solver's rule
            m["filter_error"] = str(e)[-300:]; m["filter"] = "solver.placeable_in_window (hand_filter.py failed)"
            m["filter_sha256"] = sha(SOLVER); hf = None
    if not hf:
        W = solver.Window(win); opn = solver.open_pitches(tuning, capo)
        keep = [n for n in notes if solver.placeable_in_window(n, opn, W, 20)]
        with open(p, "w") as f:
            f.write("onset,offset,pitch\n")
            for n in keep: f.write(f"{n['onset']},{n['offset']},{n['pitch']}\n")
    kept = {(round(n["onset"], 4), n["pitch"]) for n in keep}
    m.update(n_in=len(notes), n_kept=len(keep), removed=len(notes) - len(keep),
             removed_notes=[[round(n["onset"], 4), n["pitch"]] for n in notes if (round(n["onset"], 4), n["pitch"]) not in kept])
    json.dump(m, open(meta, "w"), indent=0)
    return p, m


def run_cell(S, d, name, nk, tk, hk, md, nf, fmeta, tun, capo, dur, win, wsrc, W, wname):
    os.makedirs(d, exist_ok=True)
    sig = {"notes": nf, "notes_sha256": sha(nf), "tuning": tun, "capo": capo, "window": win,
           "window_sha256": sha(win) if win else None, "window_source": wsrc, "mode": md, "solver_sha256": sha(SOLVER),
           "weights": W}
    cj = f"{d}/cell.json"
    if os.path.exists(cj):
        old = json.load(open(cj))
        if old.get("inputs") == sig and "main" in old.get("score", {}): return old, False
    cmd = [PY, SOLVER, "--notes", nf, "--tuning", ",".join(map(str, tun)), "--capo", str(capo),
           "--answer", f"{d}/answer.json", "--stats-out", f"{d}/solver_stats.json"]
    if wname != "kept": cmd += ["--weights", ",".join(f"{k}={v}" for k, v in W.items())]
    if win: cmd += ["--window", win, "--window-mode", md]
    open(f"{d}/cmd.sh", "w").write("#!/bin/bash\n" + " ".join(cmd) + "\n")
    t0 = time.time(); p = subprocess.run(cmd, capture_output=True, text=True); wall = time.time() - t0
    if p.returncode:
        cell = {"cell": name, "song": S, "inputs": sig, "error": p.stderr[-500:], "score": {}}
        json.dump(cell, open(cj, "w"), indent=1); return cell, True
    v = subprocess.run(["python3", VALID, f"{d}/answer.json", "--duration", str(dur)], capture_output=True, text=True)
    st = json.load(open(f"{d}/solver_stats.json"))
    cell = {"cell": name, "song": S, "notes": nk, "tuning": tk, "hand": hk, "mode": md, "weights_name": wname,
            "assisted": hk in ("perfect", "ceiling") or nk == "key", "inputs": sig,
            "chain2f_filter": fmeta and {k: fmeta[k] for k in ("filter", "filter_sha256", "removed", "n_in", "n_kept",
                                                                 "removed_notes")},
            "valid": v.stdout.strip().splitlines()[-1] if v.stdout else v.stderr[-200:],
            "solver": {k: st[k] for k in ("seconds", "groups", "soft_fallback_groups", "dropped",
                                          "groups_with_drops_needed", "max_states")},
            "solver_wall_s": round(wall, 3), "answer_sha256": sha(f"{d}/answer.json"),
            "score": score(S, f"{d}/answer.json", d), "utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    json.dump(cell, open(cj, "w"), indent=1)
    return cell, True


def run_song(S):
    T, kn, tunings, wr, waiting, dropped = inputs(S)
    capo = T["capo"]; dur = T["duration_s"]
    tw, tsrc = tool_window(S)
    wins = {"tool": (tw, tsrc), "perfect": (f"{OUT}/windows/{S}/perfect.csv", "assisted"),
            "ceiling": (f"{OUT}/windows/{S}/ceiling.csv", "assisted")}
    names, startw, ran, fmetas = [], [], 0, {}
    WS = {"kept": dict(solver.DEFAULT_W), "start": start_weights()}
    for wname, W in WS.items():
        for nk in NOTES_KINDS:
            for tk in TUNINGS:
                if wname == "start" and (nk not in START_CELLS["notes"] or tk != START_CELLS["tuning"]): continue
                if tk not in tunings: continue
                tun = tunings[tk]
                if nk == "key": nf, fmeta = kn, None
                elif nk == "chain2": nf, fmeta = f"{G}/experiments/{S}/chain-2/notes.csv", None
                else:
                    if tw is None:
                        waiting.append(f"{nk}-{tk}-*: no tool window"); continue
                    nf, fmeta = filtered(S, tk, tun, capo, tw); fmetas[tk] = fmeta
                for hk in HANDS:
                    for md in ([None] if hk == "off" else ["hard", "soft"]):
                        name = f"{nk}-{tk}-{hk}" + ("-soft" if md == "soft" else "")
                        win, wsrc = wins.get(hk, (None, None))
                        if hk != "off" and win is None: waiting.append(f"{name}{' (start weights)' if wname == 'start' else ''}"); continue
                        d = f"{OUT}/{S}/{name}" if wname == "kept" else f"{OUT}/{S}/startw/{name}"
                        cell, new = run_cell(S, d, name, nk, tk, hk, md, nf, fmeta, tun, capo, dur, win, wsrc, W, wname)
                        ran += new
                        (names if wname == "kept" else startw).append(name)
    # fixed points: AO-082's chains and the round-2 kit arm
    R = json.load(open(f"{G}/blind/results.json"))
    kit = [k for k, a in R["attempts"].items() if a.get("tools", {}).get("song") == S and a["tools"].get("round") == 2]
    ests = {c: f"{G}/experiments/{S}/{c}/tab.json" for c in ("chain-5", "chain-2", "chain-1")}
    ests["kit-arm"] = f"{G}/blind/{kit[0]}/tools/answer.json"
    fixed = {}
    for c, est in ests.items():
        d = f"{OUT}/{S}/fixed/{c}"; os.makedirs(d, exist_ok=True); cj = f"{d}/fixed.json"
        sig = {"est": est, "est_sha256": sha(est), "scores": ["tab", "notes", "tab_heard"]}
        if os.path.exists(cj):
            old = json.load(open(cj))
            if old.get("inputs") == sig and "main" in old.get("score", {}): fixed[c] = old; continue
        fixed[c] = {"est": est, "inputs": sig, "score": score(S, est, d),
                    "utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        if c == "kit-arm": fixed[c]["attempt"] = kit[0]
        json.dump(fixed[c], open(cj, "w"), indent=1); ran += 1
    # the first pass's wrong-tuning cells (frozen): add the heard share beside them, never re-solve
    first = []
    if os.path.isdir(f"{FIRST}/{S}"):
        for name in sorted(os.listdir(f"{FIRST}/{S}")):
            d = f"{FIRST}/{S}/{name}"
            if "-wrong-" not in name or not os.path.exists(f"{d}/cell.json"): continue
            first.append(name); hj = f"{d}/heard.json"
            est = f"{d}/answer.json"
            if os.path.exists(hj) and json.load(open(hj)).get("answer_sha256") == sha(est): continue
            th = truth_heard(S)
            eid, rc, err = evalrun(["tab", "--truth", th, "--est", est, "--out", f"{d}/score_tab_heard.json"])
            h = json.load(open(f"{d}/score_tab_heard.json"))
            json.dump({"answer_sha256": sha(est), "eval_tab_heard": eid, "truth_heard_sha256": sha(th),
                       "heard": h["metrics"]["same_string_and_fret_fraction_of_truth"],
                       "heard_of_matched": h["metrics"]["same_string_and_fret_fraction_of_matched"],
                       "n_heard": h["counts"]["n_truth"]}, open(hj, "w"), indent=1); ran += 1
    L = {"song": S, "tool_window": tw, "tool_window_source": tsrc, "tool_window_sha256": sha(tw) if tw else None,
         "hand_filter": hand_filter() or "solver.placeable_in_window (no hand_filter.py at run time)",
         "chain2f": {k: {kk: v[kk] for kk in ("filter", "filter_sha256", "removed", "n_in", "n_kept", "removed_notes",
                                               "window_sha256")} for k, v in fmetas.items()},
         "tunings": tunings, "wrong_rung": wr, "dropped": dropped, "waiting": waiting,
         "cells": names, "startw_cells": startw, "start_weights": WS["start"], "kept_weights": WS["kept"],
         "fixed": list(fixed), "first_pass_wrong_cells": first, "utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    json.dump(L, open(f"{OUT}/{S}/ladder_{S}.json", "w"), indent=1)
    print(S, len(names), "cells,", len(startw), "start-weight cells,", ran, "(re)run;", len(waiting), "waiting; tool window",
          tw, tsrc, "; filter", L["hand_filter"], flush=True)


if __name__ == "__main__":
    lock = open(f"{OUT}/.run_ladder.lock", "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("run_ladder.py: another run holds G/loop/e3/.run_ladder.lock; waiting", file=sys.stderr, flush=True)
        fcntl.flock(lock, fcntl.LOCK_EX)
    lock.write(f"{os.getpid()} {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}\n"); lock.flush()
    for S in (sys.argv[1:] or ["capo", "tuning", "standard"]): run_song(S)
