"""Score tab estimates with gtr-eval tab (and gtr-eval notes for pitch/onset) and print one table row each.
usage: python score_tab.py <tsvfile-out> <clip>=<est>[::extra gtr-eval args] ...
Each row: clip, est file, eval id, n_truth, n_est, n_matched, same string+fret / matched, same string / matched,
same string + absolute fret / matched, same string+fret / truth, est capo/tuning as gtr-eval read them."""
import subprocess, sys, json, re, shlex
rows = []
out = sys.argv[1]
for spec in sys.argv[2:]:
    extra = []
    if "::" in spec:
        spec, ex = spec.split("::", 1); extra = shlex.split(ex)
    clip, est = spec.split("=", 1)
    p = subprocess.run(["gtr-eval", "tab", "--truth", clip, "--est", est] + extra, capture_output=True, text=True)
    eid = re.search(r"\[gtr-eval (e\d+)\]", p.stderr)
    eid = eid.group(1) if eid else "?"
    try:
        d = json.loads([l for l in p.stdout.splitlines() if l.startswith("{")][0])
    except Exception:
        rows.append([clip, est, eid, "ERROR", p.stdout[-300:] + p.stderr[-300:]]); continue
    if "error" in d:
        rows.append([clip, est, eid, "ERROR", d["error"]]); continue
    c, m, tc = d["counts"], d["metrics"], d.get("tuning_and_capo", {})
    f = lambda x: "null" if x is None else (f"{x:.4f}" if isinstance(x, float) else str(x))
    rows.append([clip, est.split("/")[-1], eid, c["n_truth"], c["n_est"], c["n_matched"],
                 f(m["same_string_and_fret_fraction_of_matched"]), f(m["same_string_fraction_of_matched"]),
                 f(m["same_string_and_absolute_fret_fraction_of_matched"]), f(m["same_string_and_fret_fraction_of_truth"]),
                 json.dumps(m["string_difference_counts"]), " ".join(extra),
                 json.dumps({"est_tuning": tc.get("est", {}).get("tuning_midi"), "est_capo": tc.get("est", {}).get("capo"), "capo_differs": tc.get("capo_differs"), "tuning_differs": tc.get("tuning_differs"), "assumed": tc.get("est_tuning_or_capo_assumed")})])
hdr = ["clip", "estimate", "eval_id", "n_truth", "n_est", "n_matched", "same_str_fret/matched", "same_str/matched",
       "same_str_absfret/matched", "same_str_fret/truth", "string_diff_counts", "extra_args", "est_tuning_capo"]
with open(out, "w") as fh:
    fh.write("\t".join(hdr) + "\n")
    for r in rows: fh.write("\t".join(str(x) for x in r) + "\n")
for r in rows: print(" | ".join(str(x) for x in r))
