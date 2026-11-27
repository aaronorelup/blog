#!/usr/bin/env python3
"""score_run.py <run_dir> <truth.json> [--solver]

AFTER a run, by the orchestrator (never by the driver, never shown to a writer). Writes <run_dir>/score/:
  tab.json, tab_gp5.json, notes.json   gtr-eval 0.12.1 on answer.json / answer.gp5 against the whole key
  span_*.json                          the same against the key cut to the units the run finished (a partial run)
  units.csv                            per unit: key notes, right (same string and fret), wrong place, missed,
                                       invented (onset within 50 ms, same pitch), minutes, tokens, list cost, calls
  changes.csv                          every logged change scored: wrong-to-right, right-to-wrong, ...
  summary.json                         the main number and its parts, the per-unit slope, thirds, change verdicts,
                                       eval ids
  G/loop/score/<run>/truth_heard.json, truth_span.json, truth_span_heard.json: the key cuts scored against (key
                                       copies: kept out of the run folder, so copy_run.py never copies them)
  *_heard.json                         the same main number over the HEARD key notes only (key notes whose conf is not
                                       "tab": the notes the recording itself shows), whole key and span; per unit and per
                                       third in units.csv / summary.json beside the share of all key notes
--solver also scores the solver alone on the same units and candidates (the base set at the solver's choice, the
packs' solver.json files) for the same span: the E3 cell the loop is compared with."""
import argparse, csv, json, os, re, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import rj, read_jsonl, unit_dir

EVAL = "/home/user/gtr/bin/gtr-eval"
LEDGER = "/home/user/gtv/loop/ledger/evals.jsonl"
KEY_DIR = "/home/user/gtv/loop/score"


def gtr(args, out):
    env = dict(os.environ, GTR_EVAL_LEDGER=LEDGER)
    r = subprocess.run([EVAL] + args + ["--out", out], capture_output=True, text=True, env=env)
    ids = re.findall(r"\[gtr-eval (e\d+)\]", r.stderr + r.stdout)
    if r.returncode != 0:
        print("gtr-eval failed:", " ".join(args[:1]), (r.stderr or r.stdout)[-300:], file=sys.stderr)
    return ids


def g(path, *keys):
    try:
        d = json.load(open(path))
    except Exception:
        return None
    for k in keys:
        d = d.get(k) if isinstance(d, dict) else None
    return d


def match(truth, est, tol=0.05):
    """Greedy one-to-one match: same pitch, onset within tol, nearest first. Returns pairs (ti, ei)."""
    cand = []
    for ti, t in enumerate(truth):
        for ei, e in enumerate(est):
            d = abs(t["onset"] - e["onset"])
            if d <= tol and int(t["pitch"]) == int(e["pitch"]):
                cand.append((d, ti, ei))
    cand.sort()
    ut, ue, pairs = set(), set(), []
    for d, ti, ei in cand:
        if ti not in ut and ei not in ue:
            ut.add(ti); ue.add(ei); pairs.append((ti, ei))
    return pairs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run_dir"); ap.add_argument("truth"); ap.add_argument("--solver", action="store_true")
    a = ap.parse_args()
    rd = os.path.abspath(a.run_dir); O = os.path.join(rd, "score"); os.makedirs(O, exist_ok=True)
    # the key-derived files (cuts of the key: heard notes, the finished span) never go into the run folder, which
    # copy_run.py copies for tests: they live in G/loop/score/<run>/ (outside every sandbox)
    K = os.path.join(KEY_DIR, os.path.basename(rd)); os.makedirs(K, exist_ok=True)
    R = rj(os.path.join(rd, "run.json")); blind = R["blind_dir"]
    units = rj(os.path.join(blind, "inputs", "units.json"))["units"]
    prog = rj(os.path.join(rd, "progress.json"), {"done": []})
    done = sorted(prog["done"])
    T = json.load(open(a.truth))
    capo_t = int(T.get("capo", 0))
    ans = rj(os.path.join(rd, "answer.json"))
    capo_e = int(ans["capo"])
    ids = []
    heard = lambda n: n.get("conf") != "tab"
    Th = dict(T); Th["notes"] = [n for n in T["notes"] if heard(n)]
    thp = os.path.join(K, "truth_heard.json"); json.dump(Th, open(thp, "w"))
    ids += gtr(["tab", "--truth", thp, "--est", os.path.join(rd, "answer.json")], os.path.join(O, "tab_heard.json"))
    # ---- whole key
    ids += gtr(["tab", "--truth", a.truth, "--est", os.path.join(rd, "answer.json")], os.path.join(O, "tab.json"))
    ids += gtr(["notes", "--truth", a.truth, "--est", os.path.join(rd, "answer.json")], os.path.join(O, "notes.json"))
    z = g(os.path.join(rd, "answer.gp5.readback.json"), "gp_time_zero_s")
    if os.path.exists(os.path.join(rd, "answer.gp5")):
        ids += gtr(["tab", "--truth", a.truth, "--est", os.path.join(rd, "answer.gp5"), "--time-shift", str(z or 0)],
                   os.path.join(O, "tab_gp5.json"))
    # ---- the finished span (contiguous from the first finished unit)
    span = None
    if done:
        s0, s1 = units[done[0]]["t0"], units[done[-1]]["t1"]
        span = [s0, s1]
        Tc = dict(T); Tc["notes"] = [n for n in T["notes"] if s0 <= n["onset"] < s1]
        Tc["scored_range"] = [s0, s1]
        Tc["taps"] = [x for x in T.get("taps", []) if s0 <= x.get("time", -1) < s1]
        tp = os.path.join(K, "truth_span.json"); json.dump(Tc, open(tp, "w"))
        ids += gtr(["tab", "--truth", tp, "--est", os.path.join(rd, "answer.json")], os.path.join(O, "span_tab.json"))
        ids += gtr(["notes", "--truth", tp, "--est", os.path.join(rd, "answer.json")], os.path.join(O, "span_notes.json"))
        Tch = dict(Tc); Tch["notes"] = [n for n in Tc["notes"] if heard(n)]
        tph = os.path.join(K, "truth_span_heard.json"); json.dump(Tch, open(tph, "w"))
        ids += gtr(["tab", "--truth", tph, "--est", os.path.join(rd, "answer.json")], os.path.join(O, "span_tab_heard.json"))
        if os.path.exists(os.path.join(rd, "answer.gp5")):
            ids += gtr(["tab", "--truth", tp, "--est", os.path.join(rd, "answer.gp5"), "--time-shift", str(z or 0)],
                       os.path.join(O, "span_tab_gp5.json"))
    # ---- per unit
    log_all = read_jsonl(os.path.join(rd, "units_log.jsonl"))
    log = [x for x in log_all if not x.get("voided") and x.get("kind") not in ("restart-from", "revisit-skip")]
    est = ans["notes"]
    tab = rj(os.path.join(rd, "tab.json"))["notes"]
    rows = []
    for i in done:
        u = units[i]
        tn = [n for n in T["notes"] if u["t0"] <= n["onset"] < u["t1"] and n.get("string")]
        en = [n for n in tab if n.get("unit") == i]
        pr = match(tn, en)
        right = sum(1 for ti, ei in pr if tn[ti]["string"] == en[ei]["string"] and tn[ti]["fret"] == en[ei]["fret"])
        hn = sum(1 for n in tn if heard(n))
        hright = sum(1 for ti, ei in pr if heard(tn[ti]) and tn[ti]["string"] == en[ei]["string"] and tn[ti]["fret"] == en[ei]["fret"])
        calls = [x for x in log if x["unit"] == i]
        wr = [x for x in calls if x["kind"] in ("write", "reask")]   # an aborted call's row has its kind too
        rv = [x for x in calls if x["kind"].startswith("revisit")]
        tok = lambda xs, k: sum((x.get("tokens") or {}).get(k) or 0 for x in xs)
        rows.append({"unit": i, "t0": u["t0"], "t1": u["t1"], "key_notes": len(tn), "est_notes": len(en),
                     "right": right, "wrong_place": len(pr) - right, "missed": len(tn) - len(pr),
                     "invented": len(en) - len(pr), "right_share": round(right / len(tn), 4) if tn else None,
                     "heard_key_notes": hn, "heard_right": hright, "heard_right_share": round(hright / hn, 4) if hn else None,
                     "write_min": round(sum(x.get("wall_s") or 0 for x in wr) / 60, 2),
                     "write_out_tokens": tok(wr, "output"), "write_in_tokens": tok(wr, "input") + tok(wr, "cache_read") + tok(wr, "cache_write"),
                     "write_cost": round(sum(x.get("cost_usd_list") or 0 for x in wr), 3),
                     "revisits": len([x for x in rv if x["kind"] == "revisit"]),
                     "revisit_min": round(sum(x.get("wall_s") or 0 for x in rv) / 60, 2),
                     "revisit_cost": round(sum(x.get("cost_usd_list") or 0 for x in rv), 3),
                     "asks": max([x.get("asks", 1) for x in wr] or [0]),
                     "fallback": next((x.get("fallback") for x in wr if x.get("fallback")), ""),
                     "confidence": next((x.get("confidence") for x in wr if x.get("confidence") is not None), None)})
    if rows:
        with open(os.path.join(O, "units.csv"), "w", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    # slope of the per-unit share against the unit index; thirds by unit index of the whole song
    pts = [(r["unit"], r["right_share"]) for r in rows if r["right_share"] is not None]
    slope = None
    if len(pts) >= 3:
        mx = sum(x for x, _ in pts) / len(pts); my = sum(y for _, y in pts) / len(pts)
        den = sum((x - mx) ** 2 for x, _ in pts)
        slope = round(sum((x - mx) * (y - my) for x, y in pts) / den, 5) if den else None
    n = len(units); thirds = {}
    for k, nm in enumerate(["first", "middle", "last"]):
        rs = [r for r in rows if k * n / 3 <= r["unit"] < (k + 1) * n / 3]
        if rs:
            kn = sum(r["key_notes"] for r in rs)
            hk = sum(r["heard_key_notes"] for r in rs)
            thirds[nm] = {"units": len(rs), "right_share": round(sum(r["right"] for r in rs) / kn, 4) if kn else None,
                          "heard_right_share": round(sum(r["heard_right"] for r in rs) / hk, 4) if hk else None,
                          "min_per_unit": round(sum(r["write_min"] for r in rs) / len(rs), 2),
                          "out_tokens_per_unit": round(sum(r["write_out_tokens"] for r in rs) / len(rs)),
                          "cost_per_unit": round(sum(r["write_cost"] for r in rs) / len(rs), 3),
                          "revisit_cost": round(sum(r["revisit_cost"] for r in rs), 3)}
    # ---- changes
    tn_all = [n for n in T["notes"] if n.get("string")]

    def state(x):
        """'right' = a key note at this onset and pitch with this string and fret; 'place' = a key note, other place;
        'none' = no key note there."""
        if not x:
            return "absent"
        c = [t for t in tn_all if int(t["pitch"]) == int(x["pitch"]) and abs(t["onset"] - float(x["onset"])) <= 0.05]
        if not c:
            return "none"
        if x.get("string") is None:
            return "place"
        return "right" if any(t["string"] == x["string"] and t["fret"] == x["fret"] for t in c) else "place"

    ch = read_jsonl(os.path.join(rd, "changes.jsonl"))
    out, verdicts = [], {}
    for c in ch:
        if c["kind"] == "tuning":
            v = "tuning: " + str(c["after"])
        else:
            b, af = c["before"], c["after"]
            sb = state(b) if c["kind"] != "drop" or b.get("string") is not None else state(dict(b, string=None))
            sa = state(af)
            if c["kind"] == "drop":
                v = "right-to-wrong (a played note dropped)" if sb in ("right", "place") else "wrong-to-right (an invented note dropped)"
            elif c["kind"] in ("add", "keep-alt"):
                v = {"right": "wrong-to-right", "place": "wrong-to-half (a played note, wrong place)",
                     "none": "right-to-wrong (an invented note)"}[sa]
            else:
                good = lambda s: s == "right"
                v = ("wrong-to-right" if good(sa) and not good(sb) else "right-to-wrong" if good(sb) and not good(sa)
                     else "right-to-right" if good(sa) else "wrong-to-wrong")
        verdicts.setdefault(c["by"], {}).setdefault(c["kind"], {}).setdefault(v, 0)
        verdicts[c["by"]][c["kind"]][v] += 1
        out.append({"unit": c["unit"], "by": c["by"], "kind": c["kind"], "before": json.dumps(c["before"]),
                    "after": json.dumps(c["after"]), "verdict": v, "why": (c.get("why") or "")[:200]})
    if out:
        with open(os.path.join(O, "changes.csv"), "w", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=list(out[0].keys())); w.writeheader(); w.writerows(out)
    # ---- the solver alone on the same units (its proposal in each pack's solver.json, first write)
    solver = solver_h = None
    if a.solver and span:
        sn = []
        for i in done:
            sj = rj(os.path.join(unit_dir(blind, i), "solver.json"), None)
            if sj:
                sn += [{"onset": r["onset"], "offset": r["offset"], "pitch": r["pitch"], "string": r["choice"][0],
                        "fret": r["choice"][1]} for r in sj["rows"] if r["solved"] and r["choice"]]
        sa = dict(ans); sa["notes"] = sorted(sn, key=lambda n: (n["onset"], n["pitch"]))
        sp = os.path.join(O, "solver_answer.json"); json.dump(sa, open(sp, "w"))
        ids += gtr(["tab", "--truth", os.path.join(K, "truth_span.json"), "--est", sp], os.path.join(O, "span_solver_tab.json"))
        solver = g(os.path.join(O, "span_solver_tab.json"), "metrics", "same_string_and_fret_fraction_of_truth")
        ids += gtr(["tab", "--truth", os.path.join(K, "truth_span_heard.json"), "--est", sp], os.path.join(O, "span_solver_tab_heard.json"))
        solver_h = g(os.path.join(O, "span_solver_tab_heard.json"), "metrics", "same_string_and_fret_fraction_of_truth")
    # ---- every call's transcript audited again with the current auditor
    import audit_unit
    aud = {}
    cd = os.path.join(rd, "calls")
    if os.path.isdir(cd):      # every call the driver made (sandboxed): its folder at call time, work folder, transcript
        for f in sorted(os.listdir(cd)):
            if f.endswith(".json") and not f.endswith(".audit.json"):
                c = rj(os.path.join(cd, f), {})
                if c.get("transcript"):
                    r = audit_unit.audit(c["pack"], c["transcript"], c.get("work"), c.get("state_off", False))
                    aud[c["call_id"]] = {"calls": r.get("calls"), "void": r.get("void"), "warn": r.get("warn"),
                                         "pictures_read": (r.get("reads") or {}).get("pictures"), "aborted": c.get("aborted")}
    else:
        for f in sorted(os.listdir(blind)):
            pth = os.path.join(blind, f)
            if os.path.isdir(pth) and re.match(r"(u\d{3}(\.r\d+)?|tuning\.u\d{3}|w2)$", f):
                r = audit_unit.audit(pth)
                aud[f] = {"calls": r.get("calls"), "void": r.get("void"), "warn": r.get("warn"),
                          "pictures_read": (r.get("reads") or {}).get("pictures")}
    json.dump(aud, open(os.path.join(O, "audit.json"), "w"), indent=1)
    tot = lambda k: round(sum(r[k] for r in rows), 3)
    S = {"run": rd, "units_done": len(done), "units_total": n, "span_s": span,
         "main_same_string_and_fret_of_truth_whole_key": g(os.path.join(O, "tab.json"), "metrics", "same_string_and_fret_fraction_of_truth"),
         "main_same_string_and_fret_of_heard_key_notes_whole_key": g(os.path.join(O, "tab_heard.json"), "metrics", "same_string_and_fret_fraction_of_truth"),
         "heard_key_notes_whole_key": len(Th["notes"]), "key_notes_whole_key": len(T["notes"]),
         "span": {"same_string_and_fret_of_truth": g(os.path.join(O, "span_tab.json"), "metrics", "same_string_and_fret_fraction_of_truth"),
                  "matched_of_truth": g(os.path.join(O, "span_tab.json"), "metrics", "matched_fraction_of_truth"),
                  "same_string_and_fret_of_matched": g(os.path.join(O, "span_tab.json"), "metrics", "same_string_and_fret_fraction_of_matched"),
                  "onset_f1": g(os.path.join(O, "span_notes.json"), "metrics", "onset_only", "f1"),
                  "gp5_same_string_and_fret_of_truth": g(os.path.join(O, "span_tab_gp5.json"), "metrics", "same_string_and_fret_fraction_of_truth"),
                  "solver_alone_same_string_and_fret_of_truth": solver,
                  "same_string_and_fret_of_heard_key_notes": g(os.path.join(O, "span_tab_heard.json"), "metrics", "same_string_and_fret_fraction_of_truth"),
                  "solver_alone_same_string_and_fret_of_heard_key_notes": solver_h,
                  "heard_key_notes": sum(r["heard_key_notes"] for r in rows), "heard_right": sum(r["heard_right"] for r in rows),
                  "key_notes": sum(r["key_notes"] for r in rows), "right": sum(r["right"] for r in rows),
                  "wrong_place": sum(r["wrong_place"] for r in rows), "missed": sum(r["missed"] for r in rows),
                  "invented": sum(r["invented"] for r in rows)},
         "whole_key": {"onset_f1": g(os.path.join(O, "notes.json"), "metrics", "onset_only", "f1"),
                       "gp5_same_string_and_fret_of_truth": g(os.path.join(O, "tab_gp5.json"), "metrics", "same_string_and_fret_fraction_of_truth")},
         "per_unit_slope_of_right_share": slope, "thirds": thirds,
         "cost": {"write_min": tot("write_min") if rows else 0, "revisit_min": tot("revisit_min") if rows else 0,
                  "write_cost_usd_list": tot("write_cost") if rows else 0, "revisit_cost_usd_list": tot("revisit_cost") if rows else 0,
                  "all_calls_cost_usd_list": round(sum(x.get("cost_usd_list") or 0 for x in log_all), 3),
                  "voided_cost_usd_list": round(sum(x.get("cost_usd_list") or 0 for x in log_all if x.get("voided")), 3),
                  "aborted_cost_usd_list": round(sum(x.get("cost_usd_list") or 0 for x in log_all if x.get("aborted")), 3),
                  "revisits_skipped": sum(1 for x in log_all if x.get("kind") == "revisit-skip")},
         "changes": verdicts, "audit_void_calls": [k for k, v in aud.items() if v["void"]],
         "audit_calls": len(aud), "eval_ids": ids, "truth": os.path.abspath(a.truth)}
    json.dump(S, open(os.path.join(O, "summary.json"), "w"), indent=1)
    print(json.dumps({k: S[k] for k in ("units_done", "main_same_string_and_fret_of_truth_whole_key",
                                        "main_same_string_and_fret_of_heard_key_notes_whole_key", "span", "cost",
                                        "per_unit_slope_of_right_share")}, indent=None))


if __name__ == "__main__":
    main()
