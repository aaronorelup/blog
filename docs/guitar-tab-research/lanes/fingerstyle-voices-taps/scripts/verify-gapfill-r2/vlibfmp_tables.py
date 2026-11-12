#!/usr/bin/env python3
"""Check (verifier, round 2) the numbers of trials.md "libfmp 1.3.0 HPS and HRPS" against the eval ledger and samples.

Usage: python3 -I vlibfmp_tables.py
The expected values below are typed from trials.md (gap round 2). Standard library only. Prints MISMATCH lines, then
a count.
"""
import json

LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"
SAMP = "/home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/samples/libfmp/"
ev = {}
for line in open(LEDGER):
    r = json.loads(line)
    ev[r["id"]] = r
bad = 0
n = 0


def check(what, got, want, tol=0.005):
    global bad, n
    n += 1
    if got is None or abs(got - want) > tol:
        bad += 1
        print("MISMATCH", what, "ledger/sample", got, "text", want)


# stems table: setting -> eval id, taps SI-SDR, SDR, SIR, SAR, guitar SI-SDR, SDR
stems = {"e1820": (-2.01, -0.46, 9.13, 0.55, 14.64, 14.94), "e1821": (-2.64, -1.79, 2.07, 2.62, 14.62, 15.21),
         "e1822": (-1.83, -0.14, 9.77, 0.76, 14.26, 14.58), "e1823": (-1.61, 0.42, 12.04, 0.99, 12.28, 12.72),
         "e1824": (-2.36, 0.30, 13.79, 0.67, 9.65, 10.26), "e1825": (-8.31, -1.81, 15.29, -1.60, 1.24, 3.24)}
for eid, want in stems.items():
    m = ev[eid]["result"]["metrics"]["per_stem"]
    got = (m["taps"]["si_sdr_db"], m["taps"]["sdr_db"], m["taps"]["sir_db"], m["taps"]["sar_db"],
           m["guitar"]["si_sdr_db"], m["guitar"]["sdr_db"])
    for k, (g, w) in enumerate(zip(got, want)):
        check(f"{eid} field {k}", round(g, 2), w)
    proc = ev[eid]["result"].get("processing")
    print(eid, "processing:", json.dumps(proc)[:300])

# onset P/R/F and timing
onsets = {  # eval id: (P, R, F, median timing ms or None)
    "e1792": (0.604, 1.0, 0.753, 21.6), "e1794": (0.604, 1.0, 0.753, 23.7), "e1796": (0.604, 1.0, 0.753, 21.6),
    "e1798": (0.604, 1.0, 0.753, 18.4), "e1802": (0.604, 1.0, 0.753, 15.0), "e1800": (0.604, 1.0, 0.753, 11.7),
    "e1793": (0.906, 1.0, 0.950, None), "e1795": (0.906, 1.0, 0.950, None), "e1797": (0.906, 1.0, 0.950, None),
    "e1799": (0.906, 1.0, 0.950, None), "e1803": (0.906, 1.0, 0.950, None), "e1801": (0.906, 1.0, 0.950, None),
    "e1804": (0.294, 0.938, 0.448, None), "e1805": (0.461, 0.979, 0.627, None),
    "e1806": (0.604, 1.0, 0.753, None), "e1807": (0.906, 1.0, 0.950, None), "e1813": (0.604, 1.0, 0.753, None),
    "e1815": (0.906, 1.0, 0.950, None), "e1809": (0.604, 1.0, 0.753, None), "e1811": (0.906, 1.0, 0.950, None),
    "e1817": (0.604, 1.0, 0.753, 34.1), "e1819": (0.906, 1.0, 0.950, None)}
maxes = []
for eid, (p, r, f, med) in onsets.items():
    res = ev[eid]["result"]
    m = res["metrics"]
    check(f"{eid} P", round(m["precision"], 3), p)
    check(f"{eid} R", round(m["recall"], 3), r)
    check(f"{eid} F", round(m["f_measure"], 3), f)
    t = m.get("timing_of_matched") or {}
    if med is not None:
        check(f"{eid} median ms", round(t["median_s"] * 1000, 1), med, 0.05)
        maxes.append((eid, round(t["max_abs_s"] * 1000, 1)))
    print(eid, res["counts"], "median_ms", round(t.get("median_s", float("nan")) * 1000, 1),
          "max_abs_ms", round(t.get("max_abs_s", float("nan")) * 1000, 1))
print("largest |timing| of matched taps (text: 25.8 to 39.0 ms for the six percussive parts, 49.0 ms for the mix):", maxes)

# event energy table vs the jsonl sample
table = {  # file part -> (tap+note min/med/max, note-only, tap-only, note-only above quietest tap)
    "hps_binary/percussive.wav": ((-6.84, -6.04, 0.0), (-13.42, -10.39, -8.09), (-8.26, -5.24, -2.78), 1),
    "hps_soft/percussive.wav": ((-6.74, -5.71, 0.0), (-11.82, -8.90, -7.92), (-7.11, -4.73, -3.55), 0),
    "hrps_beta1.1/percussive.wav": ((-6.85, -6.05, 0.0), (-13.58, -10.59, -9.34), (-8.33, -6.24, -2.76), 0),
    "hrps_beta2/percussive.wav": ((-6.65, -5.94, 0.0), (-14.34, -11.73, -10.41), (-12.31, -7.03, -4.67), 15),
    "hrps_beta4/percussive.wav": ((-6.45, -5.85, 0.0), (-15.76, -12.29, -11.21), (-18.32, -9.25, -4.66), 21),
    "hrps_beta32/percussive.wav": ((-6.03, -1.39, 0.0), (-13.65, -10.24, -5.52), (-18.62, -15.62, -11.61), 21),
    "hrps_beta2/residual.wav": ((-10.78, -6.71, 0.0), (-9.74, -6.58, -1.13), (-4.45, -2.34, -0.64), 21),
    "hrps_beta32/residual.wav": ((-9.33, -4.91, 0.0), (-8.05, -4.66, -2.69), (-4.00, -3.53, -3.20), 21)}
rows = [json.loads(l) for l in open(SAMP + "S6taps_event_energy.jsonl")]
for row in rows:
    key = "/".join(row["file"].split("/")[-2:])
    want = table[key]
    for lab, w in zip(("tap+note", "note-only", "tap-only"), want[:3]):
        g = row[lab]
        for k, (a, b) in enumerate(zip((g["min_db"], g["median_db"], g["max_db"]), w)):
            check(f"{key} {lab} {k}", a, b)
    check(f"{key} count", row["note_only_above_lowest_tap_event"], want[3], 0)
print("event-energy rows in the sample:", len(rows), "of", len(table))

# energy fractions vs summary sample
summ = json.load(open(SAMP + "S6taps_libfmp_summary.json"))
frac = {"hps_binary": (0.922, 0.041, None), "hps_soft": (0.813, 0.045, None), "hrps_beta1.1": (0.916, 0.038, 0.0028),
        "hrps_beta2": (0.867, 0.028, 0.032), "hrps_beta4": (0.793, 0.020, 0.090), "hrps_beta32": (0.399, 0.0049, 0.453)}
for r in summ["runs"]:
    want = frac[r["name"]]
    ef = r["energy_fraction"]
    for k, part in enumerate(("harmonic", "percussive", "residual")):
        if want[k] is not None:
            digits = 4 if want[k] < 0.01 else 3
            check(f"{r['name']} {part}", round(ef[part], digits), want[k], 0.00051 if digits == 3 else 0.00005)
    print(r["name"], "sum of fractions", round(sum(ef.values()), 4), "mix-minus-parts", r["energy_fraction_mix_minus_parts"],
          "seconds", r["seconds"], "L_h", r["L_h_frames"], "L_p", r["L_p_bins"])
print(f"{n - bad} of {n} values match; {bad} mismatches")
