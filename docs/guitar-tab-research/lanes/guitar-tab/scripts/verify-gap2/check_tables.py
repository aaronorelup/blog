"""verify-gapfill-guitar-tab round 2: compare every table row of the gap round 2 section that carries an eval id with the
stored eval-ledger result; also check the est file's sha256 still equals the one the ledger recorded."""
import hashlib, json, re, sys

sec = open(sys.argv[1]).read()
ev = {}
for line in open("/home/user/gtr/eval/ledger/evals.jsonl"):
    d = json.loads(line)
    ev[d["id"]] = d


def f4(x):
    return f"{x:.4f}"


def sdc(m):
    return ", ".join(f"{int(k):+d}: {v}".replace("+0:", "0:") for k, v in sorted(m["string_difference_counts"].items(), key=lambda kv: int(kv[0])))


problems = 0
rows = 0
for line in sec.splitlines():
    if not line.startswith("| ") or "---" in line:
        continue
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    ids = [c for c in cells if re.fullmatch(r"e\d{4}", c)]
    if not ids and not any(re.match(r"e\d{4}:", c) for c in cells):
        continue
    rows += 1
    msgs = []
    if len(cells) == 10:  # TabCNN table
        clip, et, nt, ne, nm, fm, ft, sd, notes, frames = cells
        r = ev[et]["result"]; m, c = r["metrics"], r["counts"]
        if str(c["n_truth"]) != nt: msgs.append(f"truth {nt} vs {c['n_truth']}")
        if str(c["n_est"]) != ne: msgs.append(f"est {ne} vs {c['n_est']}")
        if str(c["n_matched"]) != nm: msgs.append(f"matched {nm} vs {c['n_matched']}")
        fm0 = fm.split(" ")[0]
        if fm0 != f4(m["same_string_and_fret_fraction_of_matched"]): msgs.append(f"ssf/m {fm0} vs {m['same_string_and_fret_fraction_of_matched']}")
        mm = re.search(r"from the nut: ([0-9.]+)", fm)
        if mm and mm.group(1) != f4(m["same_string_and_absolute_fret_fraction_of_matched"]): msgs.append(f"abs {mm.group(1)} vs {m['same_string_and_absolute_fret_fraction_of_matched']}")
        if ft != f4(m["same_string_and_fret_fraction_of_truth"]): msgs.append(f"ssf/t {ft} vs {m['same_string_and_fret_fraction_of_truth']}")
        if sd != sdc(m): msgs.append(f"sdc '{sd}' vs '{sdc(m)}'")
        mo = re.fullmatch(r"(e\d{4}): ([0-9.]+) \(([0-9.]+) / ([0-9.]+)\)", notes)
        n = ev[mo.group(1)]["result"]["metrics"]["onset_only"]
        if (mo.group(2), mo.group(3), mo.group(4)) != (f4(n["f1"]), f4(n["precision"]), f4(n["recall"])): msgs.append(f"notes {notes} vs {n}")
        mf = re.fullmatch(r"(e\d{4}): ([0-9.]+), ([0-9.]+)", frames)
        fr = ev[mf.group(1)]["result"]["metrics"]
        if (mf.group(2), mf.group(3)) != (f4(fr["tab_f1"]), f4(fr["pitch_f1"])): msgs.append(f"frames {frames} vs {fr['tab_f1']}, {fr['pitch_f1']}")
        for eid in (et, mo.group(1), mf.group(1)):
            d = ev[eid]; p = d["result"]["est"]["file"]
            h = hashlib.sha256(open(p, "rb").read()).hexdigest()
            if h != d["result"]["est"]["sha256"]: msgs.append(f"{eid} est file changed since scoring: {p}")
            if ev[eid]["argv"][2] != clip: msgs.append(f"{eid} truth {ev[eid]['argv'][2]} != {clip}")
        print(clip, et, "OK" if not msgs else msgs)
    elif len(cells) == 11:  # scorify table
        clip, settings, run, status, arr, et, nt, pm, fm, ft, sd = cells
        if not et:
            continue
        r = ev[et]["result"]; m, c = r["metrics"], r["counts"]
        if str(c["n_truth"]) != nt: msgs.append(f"truth {nt} vs {c['n_truth']}")
        a, b = [x.strip() for x in pm.split("/")]
        if a != str(c["n_est"]) or b != str(c["n_matched"]): msgs.append(f"placed/matched {pm} vs {c['n_est']}/{c['n_matched']}")
        fm0 = fm.split(" ")[0]
        if fm0 != f4(m["same_string_and_fret_fraction_of_matched"]): msgs.append(f"ssf/m {fm0} vs {m['same_string_and_fret_fraction_of_matched']}")
        mm = re.search(r"from the nut: ([0-9.]+)", fm)
        if mm and mm.group(1) != f4(m["same_string_and_absolute_fret_fraction_of_matched"]): msgs.append(f"abs {mm.group(1)} vs {m['same_string_and_absolute_fret_fraction_of_matched']}")
        if ft != f4(m["same_string_and_fret_fraction_of_truth"]): msgs.append(f"ssf/t {ft} vs {m['same_string_and_fret_fraction_of_truth']}")
        if sd != sdc(m): msgs.append(f"sdc '{sd}' vs '{sdc(m)}'")
        d = ev[et]; p = d["result"]["est"]["file"]
        h = hashlib.sha256(open(p, "rb").read()).hexdigest()
        if h != d["result"]["est"]["sha256"]: msgs.append(f"{et} est file changed since scoring: {p}")
        if d["argv"][2] != clip: msgs.append(f"{et} truth {d['argv'][2]} != {clip}")
        print(clip, settings[:30], et, "OK" if not msgs else msgs)
    else:
        print("UNPARSED", len(cells), line[:120])
        continue
    problems += bool(msgs)
print("rows with eval ids:", rows, "rows with problems:", problems)
