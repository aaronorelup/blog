"""verify-gapfill-chords-beats-key, round 2: re-run every gtr-eval scoring the gap round 2 agent wrote, and check the
LiveChord table in trials.md against the results.

1. Ledger lines e1837 to e1856: exit code 0, agent_hint, estimate file unchanged (SHA-256), and gtr-eval run again as a
   separate process (the launcher /home/user/gtr/bin/gtr-eval) with the stored argv plus --no-ledger, from the stored
   working directory; the whole new result is compared with the stored one.
2. The "in" (prior) evals against the first-round evals the text names (same estimate SHA-256, every metric equal).
3. The rows of samples/scores/scores_{livechord,beat_this,madmom}.jsonl with these eval ids equal the ledger results.
4. Every cell of the LiveChord score table in trials.md, recomputed from the ledger results with this script's own
   formatting (not the gap agent's livechord_tables.py).
Run: python3 -I rerun_gap2_evals.py <out_dir>
"""
import hashlib
import json
import os
import re
import subprocess
import sys

LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"
REC = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key"
IDS = ["e%04d" % i for i in range(1837, 1857)]
FIRST_ROUND = {  # clip -> (Beat This! final0 eval, madmom downbeat-tracker eval), as named in trials.md "Gap round 2"
    "S3": ("e1364", "e0210"), "S4": ("e1366", "e0240"), "R1a": ("e1373", "e1086"),
    "R1b": ("e1375", "e1121"), "R1c": ("e1376", "e1158")}


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def diff(a, b, path=""):
    out = []
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a or k not in b:
                out.append("%s/%s: present only in %s" % (path, k, "rerun" if k not in a else "stored"))
            else:
                out += diff(a[k], b[k], path + "/" + k)
    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            out.append("%s: length %d vs %d" % (path, len(a), len(b)))
        for i, (x, y) in enumerate(zip(a, b)):
            out += diff(x, y, "%s[%d]" % (path, i))
    elif a != b:
        out.append("%s: %r vs %r" % (path, a, b))
    return out


def main():
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)
    led = {}
    for line in open(LEDGER):
        d = json.loads(line)
        led[d["id"]] = d
    problems = []
    summary = {"checked": 0, "identical": 0}
    with open(os.path.join(out_dir, "rerun_gap2_results.jsonl"), "w") as rr:
        for eid in IDS:
            L = led[eid]
            if L["exit_code"] != 0:
                problems.append((eid, "exit %s" % L["exit_code"]))
            res = L["result"]
            f = res["est"]["file"]
            if sha(f) != res["est"]["sha256"]:
                problems.append((eid, "estimate changed " + f))
            argv = list(L["argv"]) + ["--no-ledger"]
            p = subprocess.run(["/home/user/gtr/bin/gtr-eval"] + argv, cwd=L["cwd"], capture_output=True, text=True)
            new = json.loads(p.stdout.strip().splitlines()[-1])
            d = diff(res, new)
            summary["checked"] += 1
            if p.returncode == 0 and not d:
                summary["identical"] += 1
            else:
                problems.append((eid, "rerun differs: %s" % d[:5]))
            rr.write(json.dumps({"id": eid, "agent_hint": L.get("agent_hint"), "argv": L["argv"], "cwd": L["cwd"],
                                 "rerun_exit": p.returncode, "identical": not d, "result": new}) + "\n")

    # 2. first-round evals of the priors
    def key_metrics(r):
        m = r["metrics"]
        return {k: m[k] for k in ("beats", "downbeats")}, r["est"]["sha256"]
    first = []
    for clip, (bt, mm) in FIRST_ROUND.items():
        for old_id in (bt, mm):
            old = led[old_id]["result"]
            # the gap-round "in" eval for the same estimate file
            match = [e for e in IDS if led[e]["result"]["est"]["file"] == old["est"]["file"]]
            ok = False
            for e in match:
                a, sa = key_metrics(old)
                b, sb = key_metrics(led[e]["result"])
                ok = (sa == sb) and not diff(a, b) and led[old_id]["result"]["options"] == led[e]["result"]["options"]
                first.append({"clip": clip, "first_round": old_id, "version": old["gtr_eval_version"], "gap2": e,
                              "same_sha_metrics_options": ok, "truth_sha_equal":
                              old["truth"]["sha256"] == led[e]["result"]["truth"]["sha256"]})
            if not match:
                problems.append((old_id, "no gap-round eval of its estimate file"))
            elif not ok:
                problems.append((old_id, "first-round result differs"))

    # 3. score files in samples/
    sc = {}
    for t in ("livechord", "beat_this", "madmom"):
        for line in open(os.path.join(REC, "samples/scores/scores_%s.jsonl" % t)):
            r = json.loads(line)
            if r["eval_id"] in IDS:
                sc[r["eval_id"]] = r
    for eid in IDS:
        r = sc.get(eid)
        if r is None:
            problems.append((eid, "not in samples/scores"))
            continue
        res = led[eid]["result"]
        if r["metrics"] != res["metrics"] or r["est_sha256"] != res["est"]["sha256"]:
            problems.append((eid, "samples/scores row differs from ledger"))

    # 4. the table in trials.md
    text = open(os.path.join(REC, "trials.md"), encoding="utf-8").read()
    sec = text[text.index("### LiveChord beat refiner 0.1.0"):text.index("### Training data, CREMA")]
    rows = [l for l in sec.splitlines() if re.match(r"\| (S3|S4|R1a|R1b|R1c) \|", l)]

    def cells(eid):
        m = led[eid]["result"]["metrics"]
        b, d = m["beats"], m["downbeats"]
        tm = b.get("timing_of_matched")
        med = "%+.0f" % (tm["median_s"] * 1000) if tm and tm.get("n_pairs") else "(none matched)"
        return ["%.3f / %.3f / %.3f" % (b["f_measure"], b["CMLt"], b["AMLt"]), "%d / %d" % (b["n_est"], b["n_truth"]),
                med, "%.3f / %.3f" % (d["f_measure"], d["CMLt"]), "%d / %d" % (d["n_est"], d["n_truth"]), eid]
    table = []
    for l in rows:
        c = [x.strip() for x in l.strip().strip("|").split("|")]
        clip, prior, e_in, e_out = c[0], c[1], c[7], c[13]
        want = [clip, prior] + cells(e_in) + cells(e_out)
        same = c == want
        # which prior each eval scored
        pin = led[e_in]["result"]["est"]["file"]
        pout = led[e_out]["result"]["est"]["file"]
        okfiles = (("/%s/" % clip) in pin and ("/%s/" % clip) in pout and
                   (("beat_this" in pin and "beat_this_final0" in pout) if prior.startswith("Beat This") else
                    ("/madmom/" in pin and "madmom_dbn_downbeat" in pout)))
        table.append({"row": c[:2], "cells_equal": same, "files_match_row": okfiles,
                      "differences": [(i, a, b) for i, (a, b) in enumerate(zip(c, want)) if a != b]})
        if not same or not okfiles:
            problems.append((clip + " " + prior, "table row differs", table[-1]["differences"]))
    hdr = [l for l in sec.splitlines() if l.startswith("| clip |")][0]
    sep = sec.splitlines()[sec.splitlines().index(hdr) + 1]
    n_hdr = len(hdr.strip().strip("|").split("|"))
    n_sep = len(sep.strip().strip("|").split("|"))
    summary.update({"table_rows": len(rows), "table_rows_equal": sum(t["cells_equal"] for t in table),
                    "header_cells": n_hdr, "separator_cells": n_sep, "first_round": first, "problems": problems})
    json.dump(summary, open(os.path.join(out_dir, "summary.json"), "w"), indent=1)
    print(json.dumps({k: v for k, v in summary.items() if k != "first_round"}, indent=1))
    print("first-round comparisons:", sum(x["same_sha_metrics_options"] for x in first), "of", len(first))


if __name__ == "__main__":
    main()
