"""Turn samples/scores/scores.jsonl (written by score_all.py) into markdown tables, one per subcommand.

Usage: python3 -I summarize_scores.py [--tool madmom] > tables.md
Only the newest row per (tool, variant, clip, subcommand) is shown. Every number comes from gtr-eval; the eval id
is given in the last column (look it up with `gtr-eval ledger --id <id> --full`).
"""
import argparse
import json

SC = "/home/user/gtr/lanes/chords-beats-key/out/scores/scores.jsonl"
ORDER = ["S3", "S7flat30", "S4", "S2n", "S2s", "S5capo2", "S5dropd", "S6taps", "R1a", "R1b", "R1c", "S1"]


def f3(x):
    return "" if x is None else ("%.3f" % x if isinstance(x, float) else str(x))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tool", default=None)
    ap.add_argument("--sub", default=None)
    a = ap.parse_args()
    rows = {}
    for line in open(SC):
        r = json.loads(line)
        if a.tool and r["tool"] != a.tool:
            continue
        if a.sub and r["subcommand"] != a.sub:
            continue
        rows[(r["tool"], r["variant"], r["clip"], r["subcommand"])] = r
    by_sub = {}
    for k, r in rows.items():
        by_sub.setdefault(k[3], []).append(r)
    for sub in ("beats", "tempo", "chords", "key", "tuning"):
        rs = sorted(by_sub.get(sub, []), key=lambda r: (r["tool"], r["variant"], ORDER.index(r["clip"]) if r["clip"] in ORDER else 99))
        if not rs:
            continue
        print("\n#### %s (gtr-eval %s)\n" % (sub, rs[0]["gtr_eval_version"]))
        if sub == "beats":
            print("| tool / variant | clip | beat F (70 ms) | P | R | CMLt | AMLt | est / truth beats | downbeat F | downbeat CMLt | est / truth downbeats | eval |")
            print("|---|---|---|---|---|---|---|---|---|---|---|---|")
            for r in rs:
                m = r["metrics"] or {}
                b = m.get("beats", {})
                d = m.get("downbeats") or {}
                c = r["counts"] or {}
                print("| %s / %s | %s | %s | %s | %s | %s | %s | %s / %s | %s | %s | %s | %s |" % (
                    r["tool"], r["variant"], r["clip"], f3(b.get("f_measure")), f3(b.get("precision")), f3(b.get("recall")),
                    f3(b.get("CMLt")), f3(b.get("AMLt")), c.get("n_est_beats"), c.get("n_truth_beats"),
                    f3(d.get("f_measure")), f3(d.get("CMLt")),
                    ("%s / %s" % (c.get("n_est_downbeats"), c.get("n_truth_downbeats"))) if d else "", r["eval_id"]))
        elif sub == "tempo":
            print("| tool / variant | clip | est BPM | truth BPM | est / truth | within 4 % | closest factor | eval |")
            print("|---|---|---|---|---|---|---|---|")
            for r in rs:
                m = r["metrics"] or {}
                print("| %s / %s | %s | %s | %s | %s | %s | %s | %s |" % (
                    r["tool"], r["variant"], r["clip"], f3(m.get("est_bpm")), f3(m.get("truth_bpm")),
                    f3(m.get("ratio_est_over_truth")), m.get("within_tolerance"), m.get("closest_factor"), r["eval_id"]))
        elif sub == "chords":
            print("| tool / variant | clip | root | majmin | sevenths | mirex | seg | est / truth segments | eval |")
            print("|---|---|---|---|---|---|---|---|---|")
            for r in rs:
                m = r["metrics"] or {}
                o = m.get("other_mir_eval_chord_scores", {})
                c = r["counts"] or {}
                print("| %s / %s | %s | %s | %s | %s | %s | %s | %s / %s | %s |" % (
                    r["tool"], r["variant"], r["clip"], f3(m.get("root")), f3(m.get("majmin")), f3(m.get("sevenths")),
                    f3(o.get("mirex")), f3(o.get("seg")), c.get("n_est_segments"), c.get("n_truth_segments"), r["eval_id"]))
        elif sub == "key":
            print("| tool / variant | clip | estimated key | truth key | weighted score | relationship | eval |")
            print("|---|---|---|---|---|---|---|")
            for r in rs:
                m = r["metrics"] or {}
                print("| %s / %s | %s | %s | %s | %s | %s | %s |" % (
                    r["tool"], r["variant"], r["clip"], m.get("est_key"), m.get("truth_key"), f3(m.get("weighted_score")),
                    m.get("relationship"), r["eval_id"]))
        elif sub == "tuning":
            print("| tool / variant | clip | estimated cents | truth cents | difference | eval |")
            print("|---|---|---|---|---|---|")
            for r in rs:
                m = r["metrics"] or {}
                print("| %s / %s | %s | %s | %s | %s | %s |" % (
                    r["tool"], r["variant"], r["clip"], f3(m.get("est_cents")), f3(m.get("truth_cents")),
                    f3(m.get("difference_cents")), r["eval_id"]))


if __name__ == "__main__":
    main()
