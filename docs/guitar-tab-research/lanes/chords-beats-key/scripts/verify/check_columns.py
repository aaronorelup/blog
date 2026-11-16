"""Verifier: column-by-column check of the score tables in trials.md against the gtr-eval ledger.

Each table is described by a spec: for every column, which metric(s) of which eval column the numbers in that cell
must equal (after rounding to the number of decimals written). Prints every cell that does not match.
Usage: python3 check_columns.py trials.md /home/user/gtr/eval/ledger/evals.jsonl
"""
import sys, re, json

md, ledger_path = sys.argv[1], sys.argv[2]
L = {}
for line in open(ledger_path):
    d = json.loads(line)
    L[d["id"]] = d


def argv_val(d, key):
    a = d["argv"]
    return a[a.index(key) + 1] if key in a else None


def get(eid, key):
    d = L[eid]
    m = d["result"].get("metrics", {})
    c = d["result"].get("counts", {})
    b = m.get("beats", {})
    db = m.get("downbeats") or {}
    o = m.get("other_mir_eval_chord_scores", {})
    table = {
        "bF": b.get("f_measure"), "bP": b.get("precision"), "bR": b.get("recall"), "bCMLt": b.get("CMLt"),
        "bAMLt": b.get("AMLt"), "bnest": b.get("n_est"), "bntruth": b.get("n_truth"),
        "dF": db.get("f_measure"), "dCMLt": db.get("CMLt"), "dnest": db.get("n_est"), "dntruth": db.get("n_truth"),
        "root": m.get("root"), "majmin": m.get("majmin"), "sevenths": m.get("sevenths"), "mirex": o.get("mirex"),
        "seg": o.get("seg"), "segs_est": c.get("n_est_segments"), "segs_truth": c.get("n_truth_segments"),
        "w": m.get("weighted_score"), "key": m.get("est_key"),
        "estc": m.get("est_cents"), "truthc": m.get("truth_cents"), "diffc": m.get("difference_cents"),
        "hz": argv_val(d, "--est-a4-hz"), "bpm": argv_val(d, "--est-bpm"),
        "ratio": m.get("ratio_est_over_truth"), "within": m.get("within_tolerance"),
    }
    return table[key]


def num_eq(text, val):
    if val is None:
        return False
    ndp = len(text.split(".")[1]) if "." in text else 0
    try:
        v = float(val)
    except (TypeError, ValueError):
        return False
    return abs(round(v, ndp) - float(text)) <= 0.5 * 10 ** (-ndp) + 1e-9


# spec: table header prefix -> list per column of (eval column index, [metric keys in order of the numbers]) or None
SPECS = {
    "| clip | beat F (70 ms) | P | R | CMLt | AMLt": [None, (7, ["bF"]), (7, ["bP"]), (7, ["bR"]), (7, ["bCMLt"]), (7, ["bAMLt"]),
                                                   (7, ["bnest", "bntruth"]), None, (10, ["bpm"]), (10, ["ratio"]), None],
    "| clip | mode | root | majmin | sevenths | mirex | seg |": [None, None, (8, ["root"]), (8, ["majmin"]), (8, ["sevenths"]),
                                                                (8, ["mirex"]), (8, ["seg"]), (8, ["segs_est", "segs_truth"]), None],
    "| clip | estimated A4 (Hz)": [None, (5, ["hz"]), (5, ["estc"]), (5, ["truthc"]), (5, ["diffc"]), None],
    "| clip | beats F / CMLt / AMLt (RNN+DBN)": [None, (3, ["bF", "bCMLt", "bAMLt"]), (3, ["bnest", "bntruth"]), None,
                                                (6, ["bF", "dF", "dCMLt", "bAMLt"]), (6, ["dnest", "dntruth"]), None],
    "| clip | tempo (top) | within 4 %": [None, (3, ["bpm"]), (3, ["ratio"]), None, (6, ["root", "majmin", "sevenths"]),
                                         (6, ["segs_est"]), None, (9, ["root", "majmin", "sevenths"]), (9, ["segs_est"]), None,
                                         None, (12, ["w"]), None],
    "| clip | beats F / CMLt / AMLt | est / truth beats | eval | tempo |": [
        None, (3, ["bF", "bCMLt", "bAMLt"]), (3, ["bnest", "bntruth"]), None, (6, ["bpm"]), (6, ["ratio"]), None,
        None, (9, ["w"]), None, (12, ["estc", "truthc"]), None],
    "| clip | multifeature beats F / CMLt / AMLt": [None, (2, ["bF", "bCMLt", "bAMLt"]), None, (4, ["bF"]), None,
                                                  (6, ["bpm"]), None, (8, ["bpm"]), None, ("10a", ["bpm"]), None],
    "| clip | KeyExtractor bgate": [None, None, None, (5, ["root", "majmin", "sevenths"]), (5, ["segs_est"]), None,
                                    (7, ["estc", "truthc"]), None],
    "| clip | autochord root": [None, (3, ["root", "majmin", "sevenths", "mirex"]), (3, ["segs_est"]), None,
                                (6, ["root", "majmin", "sevenths", "mirex"]), (6, ["segs_est"]), None],
    "| clip | offline beats F / CMLt / AMLt": [None, (4, ["bF", "bCMLt", "bAMLt"]), (4, ["dF", "dCMLt"]), (4, ["dnest", "dntruth"]),
                                             None, (8, ["bF", "bCMLt", "bAMLt"]), (8, ["dF", "dCMLt"]), (8, ["dnest", "dntruth"]), None],
    "| clip | ckpt | beats F / CMLt / AMLt": [None, None, (6, ["bF", "bCMLt", "bAMLt"]), (6, ["bnest", "bntruth"]),
                                             (6, ["dF", "dCMLt"]), (6, ["dnest", "dntruth"]), None],
    "| clip | dict | root | majmin": [None, None, (8, ["root"]), (8, ["majmin"]), (8, ["sevenths"]), (8, ["mirex"]),
                                     (8, ["seg"]), (8, ["segs_est", "segs_truth"]), None],
}

spec = None
problems = 0
checked = 0
for ln, line in enumerate(open(md), 1):
    if line.startswith("| clip"):
        spec = None
        for k, v in SPECS.items():
            if line.startswith(k):
                spec = v
        continue
    if not line.startswith("|") or set(line.strip()) <= set("|-: "):
        if not line.startswith("|"):
            spec = None
        continue
    if spec is None:
        continue
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    for ci, sp in enumerate(spec):
        if sp is None or ci >= len(cells):
            continue
        evcol, keys = sp
        if evcol == "10a":  # "e0233 / e0235": k16 then k4
            evs = re.findall(r"e\d{4}", cells[10])
            nums = re.findall(r"[-+]?\d+(?:\.\d+)?", cells[ci])
            pairs = list(zip(nums, evs))
            for n, e in pairs:
                checked += 1
                if not num_eq(n, get(e, "bpm")):
                    problems += 1
                    print(f"L{ln} col{ci} {n} != {get(e, 'bpm')} ({e})")
            continue
        evs = re.findall(r"e\d{4}", cells[evcol]) if evcol < len(cells) else []
        if not evs:
            continue
        e = evs[0]
        cell = re.sub(r"\(x?[\d.]+(?:, [^)]*)?\)", "", cells[ci]) if keys != ["ratio"] else cells[ci]
        if keys == ["ratio"]:
            want_yes = get(e, "within")
            if ("yes" in cell) != bool(want_yes):
                problems += 1
                print(f"L{ln} col{ci} within-4% cell '{cell}' but eval {e} within={want_yes}")
            m = re.search(r"\(([\d.]+)", cell)
            if m:
                checked += 1
                if not num_eq(m.group(1), get(e, "ratio")):
                    problems += 1
                    print(f"L{ln} col{ci} ratio {m.group(1)} != {get(e, 'ratio')} ({e})")
            continue
        nums = re.findall(r"[-+]?\d+(?:\.\d+)?", cell)
        if len(nums) < len(keys):
            # cells such as "0.000, 0.000, 0.000 (beats AMLt 1.000)" or missing values
            pass
        for n, k in zip(nums, keys):
            checked += 1
            if not num_eq(n, get(e, k)):
                problems += 1
                print(f"L{ln} col{ci} {k}: text {n} vs eval {e} {get(e, k)}")
print("checked numbers:", checked, "problems:", problems)
