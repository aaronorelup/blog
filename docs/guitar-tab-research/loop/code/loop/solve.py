#!/usr/bin/env python3
"""solve.py: the loop's adapter to E3's solver (G/loop/tools/solver/solver.py, solve_range), for one unit.

solve_unit() gives every candidate of a unit its places (all that the tuning and capo allow, marked when outside the
window), the solver's choice and its next-best places with their extra cost (exact min-marginals of E3's model), and
flags: no-place (no string can play the pitch), out-window (no place inside the window), dropped (the solver had to
leave the note out: more notes than strings in its group). The solver runs on the unit's proposed set (the base
candidates, or the set the caller gives), with the last finished group before the unit as fixed context and pins;
candidates outside the set get the in-window place nearest to the solver's hand at that time.

CLI (used by the writer's tools/solve.sh): solve.py <blind_dir> <unit> [--keep ids] [--drop ids] [--pin id=s:f ...]
  [--add onset:pitch ...] [--tab bar.json] [--json out.json]
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import G, Window, name, places, read_cands, rj, groups, maxfret, wj

SOLVER_DIR = os.path.join(G, "loop", "tools", "solver")
sys.path.insert(0, SOLVER_DIR)
import solver as E3  # noqa: E402


def load_run(blind):
    cfg = rj(os.path.join(blind, "inputs", "config.json"))
    units = rj(os.path.join(blind, "inputs", "units.json"))["units"]
    cands = read_cands(os.path.join(blind, "inputs", "candidates.csv"))
    return cfg, units, cands


def hand_window(blind, cfg):
    p = os.path.join(blind, "inputs", "hand", "hand_window.csv")
    if cfg.get("hand") == "off" or not os.path.exists(p):
        return None, None
    return E3.Window(p), Window(p)


def context_before(tab_notes, t0):
    """The last finished onset group that starts before t0 (fixed context for the solver)."""
    prev = [n for n in tab_notes if n["onset"] < t0 and n.get("string")]
    if not prev:
        return None
    g = groups(prev)[-1]
    return {"notes": [{"onset": n["onset"], "offset": n["offset"], "pitch": n["pitch"], "string": n["string"],
                       "fret": n["fret"]} for n in g], "hand": None}


def solve_unit(blind, i, tuning=None, keep=None, drop=None, pins=None, adds=None, tab_notes=None, cfg=None,
               units=None, cands=None):
    if cfg is None:
        cfg, units, cands = load_run(blind)
    tuning = tuning or rj(os.path.join(blind, "state.json"))["tuning"]["midi"]
    capo = int(cfg["capo"]); mf = maxfret(cfg)
    u = units[i]
    t0, t1 = u["t0"], u["t1"]
    W3, Wc = hand_window(blind, cfg)
    if tab_notes is None:
        tab_notes = rj(os.path.join(blind, "tab.json"), {"notes": []})["notes"]
    uc = [c for c in cands if t0 <= c["onset"] < t1]
    keep = set(keep or []); drop = set(drop or [])
    in_set = [c for c in uc if (c["base"] or c["id"] in keep) and c["id"] not in drop]
    notes = [{"onset": c["onset"], "offset": c["offset"], "pitch": c["pitch"], "id": c["id"]} for c in in_set]
    for k, (on, p) in enumerate(adds or []):
        notes.append({"onset": on, "offset": on + 0.4, "pitch": p, "id": f"new{k + 1}"})
    notes.sort(key=lambda n: (n["onset"], n["pitch"]))
    for k, n in enumerate(notes):
        n["i"] = k
    pin_list = []
    byid = {n["id"]: n for n in notes}
    for pid, (s, f) in (pins or {}).items():
        if pid in byid:
            pin_list.append({"onset": byid[pid]["onset"], "pitch": byid[pid]["pitch"], "string": s, "fret": f})
    ctx = context_before(tab_notes, t0)
    res = E3.solve_range(notes, tuning, capo, window=W3, mode="hard", t0=None, t1=None, context=ctx, pins=pin_list,
                         max_fret=mf, alternatives=True, top=4)
    key = lambda on, p: (round(float(on), 4), int(p))
    chosen = {key(n["onset"], n["pitch"]): n for n in res["path"]}
    alts = {key(a["onset"], a["pitch"]): a["places"] for a in res["alternatives"]}
    hands = sorted((n["onset"], n["hand"]) for n in res["path"] if n.get("hand"))

    def hand_at(t):
        if not hands:
            return None
        return min(hands, key=lambda x: abs(x[0] - t))[1]

    rows = []
    allc = [dict(c, new=False) for c in uc] + [dict(onset=n["onset"], offset=n["offset"], pitch=n["pitch"], id=n["id"],
                                                    supporters="new", n_sup=0, base=0, new=True)
                                               for n in notes if isinstance(n["id"], str)]
    for c in sorted(allc, key=lambda c: (c["onset"], c["pitch"])):
        win = Wc.at(c["onset"]) if Wc else None
        pl = places(c["pitch"], tuning, capo, mf)
        inw = [(s, f) for s, f in pl if f == 0 or win is None or win[0] <= f <= win[1]]
        r = {"id": c["id"], "onset": round(c["onset"], 4), "offset": round(c["offset"], 4), "pitch": c["pitch"],
             "name": name(c["pitch"]), "supporters": c["supporters"], "n_sup": c["n_sup"], "base": c["base"],
             "solved": c["id"] in byid, "window": f"{win[0]}-{win[1]}" if win else ("off" if Wc is None else "lost"),
             "places": pl, "in_window": inw, "choice": None, "alts": [], "flags": []}
        if not pl:
            r["flags"].append("no-place")
        elif not inw:
            r["flags"].append("out-window")
        k = key(c["onset"], c["pitch"])
        if r["solved"]:
            ch = chosen.get(k)
            if ch:
                r["choice"] = (ch["string"], ch["fret"])
            elif pl:
                r["flags"].append("dropped")
            best = None
            for a in alts.get(k, []):
                if a.get("drop"):
                    continue
                if best is None:
                    best = a["cost"]
                if (a["string"], a["fret"]) != r["choice"]:
                    r["alts"].append((a["string"], a["fret"], round(a["cost"] - (best or 0), 2)))
        else:
            h = hand_at(c["onset"])
            pool = inw or pl
            if pool:
                r["choice"] = min(pool, key=lambda sf: (abs(sf[1] - (h + 1.5)) if (h and sf[1] > 0) else 0.5 + 0.1 * sf[1]))
            r["alts"] = [(s, f, None) for s, f in pl if (s, f) != r["choice"]]
        rows.append(r)
    return {"unit": i, "t0": t0, "t1": t1, "tuning": tuning, "capo": capo, "rows": rows, "cost": res["cost"],
            "stats": res["stats"], "context": ctx}


def fmt_sf(sf):
    return f"{sf[0]}:{sf[1]}" if sf else "-"


def table(out):
    lines = ["id   onset   pitch  sup  base window  choice  next-best (+cost)        flags"]
    for r in out["rows"]:
        al = " ".join(f"{s}:{f}" + (f"(+{d})" if d is not None else "") for s, f, d in r["alts"][:3])
        lines.append(f"{str(r['id']):<4} {r['onset']:7.3f} {r['name']:<5} {r['n_sup']:>3}  {r['base']:>4} "
                     f"{r['window']:<6} {fmt_sf(r['choice']):<7} {al:<24} {','.join(r['flags'])}"
                     + ("" if r["solved"] else "  (not in the solved set)"))
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("blind"); ap.add_argument("unit", type=int)
    ap.add_argument("--keep", default=""); ap.add_argument("--drop", default="")
    ap.add_argument("--pin", action="append", default=[]); ap.add_argument("--add", action="append", default=[])
    ap.add_argument("--json", default=None)
    a = ap.parse_args()
    ids = lambda s: [int(x) for x in s.replace(",", " ").split()] if s else []
    pins = {}
    for p in a.pin:
        k, v = p.split("="); s, f = v.split(":"); pins[int(k)] = (int(s), int(f))
    adds = []
    for x in a.add:
        on, p = x.split(":"); adds.append((float(on), int(p)))
    out = solve_unit(os.path.abspath(a.blind), a.unit, keep=ids(a.keep), drop=ids(a.drop), pins=pins, adds=adds)
    print(table(out))
    print(f"path cost {out['cost']:.2f}; places are string:fret, frets from the capo; next-best = the best path with "
          f"the note there costs that much more")
    if a.json:
        wj(a.json, out)


if __name__ == "__main__":
    main()
