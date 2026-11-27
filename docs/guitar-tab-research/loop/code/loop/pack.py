#!/usr/bin/env python3
"""pack.py <run_dir> <unit index> [--revisit "reason"] [--state on|off] [--quiet]

Builds one unit's pack folder (G/loop/bw/<id>/u007/, or u007.r1/ for a revisit) from the run's inputs, the carried
state.json and the finished units (tab.json): PACK.md, unit.json, candidates.csv (every place, the solver's choice and
next-best places with their costs, conflicts, the shape book's and repeats' proposals), solver.json, spectrogram.png,
neck.jpg (overlays at the unit's onset groups, at most 8 tiles; not with the hand off), similar.md (earlier units that
sound alike with their finished tabs), state.json (a copy). The writer's tools are in the run's tools/ folder
(make_tools.py). Pictures are drawn with draw.py (venv-torch) and neckpic.py (venv-video)."""
import argparse, csv, json, os, shutil, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import LOOP, PYT, PYVID, Window, groups, name, places, rj, wj, unit_dir, maxfret
from solve import load_run, solve_unit


def blind_of(run_dir):
    rd = os.path.abspath(run_dir)
    if os.path.exists(os.path.join(rd, "run.json")):
        return rj(os.path.join(rd, "run.json"))["blind_dir"]
    return rd   # already a blind dir


def sf(x):
    return f"{x[0]}:{x[1]}" if x else ""


def ascii_tab(notes, t_shift=0.0):
    """A plain text tab: one column per onset group, string 1 on top, frets from the capo, onsets on the first line."""
    gs = groups([n for n in notes if n.get("string")])
    if not gs:
        return "(no notes)"
    cols = []
    for g in gs:
        col = {int(n["string"]): str(n["fret"]) for n in g}
        cols.append((g[0]["onset"] + t_shift, col))
    w = 6
    head = "   " + "".join(f"{t:<{w}.2f}" for t, _ in cols)
    lines = [head]
    for s in range(1, 7):
        lines.append(f"{s}| " + "".join((c.get(s, "-")).ljust(w, "-") for _, c in cols))
    return "\n".join(lines)


def state_summary(st, i):
    L = []
    T = st["tuning"]
    nm = " ".join(name(p) for p in T["midi"])
    if T.get("given"):
        L.append(f"- tuning: GIVEN, string 6 to 1: {nm} (MIDI {T['midi']}). It does not change in this run.")
    else:
        L.append(f"- tuning: FOUND by a tuning finder, string 6 to 1: {nm} (MIDI {T['midi']}); it may be wrong. Evidence so far:")
        for s in range(6, 0, -1):
            e = T["strings"].get(str(s), {})
            L.append(f"  string {s} ({name(T['midi'][6 - s])}): agrees in units {e.get('agree_units', [])[-6:]}, "
                     f"conflicts in units {e.get('conflict_units', [])[-6:]}"
                     + (f"; heard instead: {e.get('heard', {})}" if e.get("heard") else ""))
    book = st.get("shape_book", [])
    L.append(f"- shape book: {len(book)} pitch sets with their places (proposals in candidates.csv column 'book')")
    hd = st.get("hand", {})
    if hd:
        last = sorted(hd.items(), key=lambda kv: int(kv[0]))[-3:]
        L.append("- hand (window accepted, by unit): " + "; ".join(
            f"u{k}: {v.get('lo', '?')}-{v.get('hi', '?')}" + ("" if v.get("window_ok", True) else f" (fixed: {v.get('fix', '')})")
            for k, v in last))
    mh = sorted(st.get("model_habits", {}).items(), key=lambda kv: -kv[1]["count"])[:6]
    if mh:
        L.append("- note models' habits on this recording: " + "; ".join(
            f"{k.replace('|', ' ')}: {v['count']} (units {v['units'][-4:]})" for k, v in mh))
    ph = st.get("player_habits", {})
    if ph:
        L.append("- player's habits: " + "; ".join(f"{k}: units {v['units'][-5:]}" for k, v in ph.items()))
    rp = st.get("repeats", [])
    if rp:
        L.append("- repeats: " + "; ".join(f"u{r['unit']} repeats u{r['of']}" + (f" ({r['differs']})" if r.get("differs") else "")
                                            for r in rp[-4:]))
    if st.get("unsure"):
        L.append(f"- unsure units (confidence under 0.6): {st['unsure']}")
    if len(L) == 2 and not book:
        L.append("- (nothing learned yet)")
    return "\n".join(L)


def build(run_dir, i, revisit=None, state_on=True, quiet=False, rev_number=None):
    blind = blind_of(run_dir)
    cfg, units, cands = load_run(blind)
    u = units[i]
    t0, t1 = u["t0"], u["t1"]
    c0, c1 = max(0.0, t0 - 0.5), min(cfg["duration_s"], t1 + 0.5)
    st = rj(os.path.join(blind, "state.json"))
    if not state_on:
        st = {"tuning": st["tuning"], "shape_book": [], "hand": {}, "model_habits": {}, "player_habits": {},
              "repeats": [], "unsure": [], "units_done": st.get("units_done", 0)}
    tuning = st["tuning"]["midi"]; capo = int(cfg["capo"])
    tab = rj(os.path.join(blind, "tab.json"), {"notes": []})["notes"]
    rev = 0
    if revisit:
        while os.path.exists(unit_dir(blind, i, rev + 1)):
            rev += 1
        rev += 1
        if rev_number:          # a pack built in a fresh per-call folder (E6 state off) takes the run's next number
            rev = rev_number
    P = unit_dir(blind, i, rev)
    if os.path.exists(P):
        shutil.rmtree(P)
    os.makedirs(P)
    hand_on = cfg.get("hand") != "off"
    # ---- the solver on the unit's base set
    prev_bar = None
    if revisit:
        prev_bar = [n for n in tab if n.get("unit") == i]
    sol = solve_unit(blind, i, tuning=tuning, tab_notes=[n for n in tab if n.get("unit") != i], cfg=cfg, units=units,
                     cands=cands)
    wj(os.path.join(P, "solver.json"), sol)
    rows = sol["rows"]
    # ---- shape book and repeats
    book = {tuple(sorted(b["pitches"])): b for b in st.get("shape_book", [])} if state_on else {}
    sim = rj(os.path.join(blind, "inputs", "similar.json"))["units"][i]["similar"] if state_on else []
    done = {n.get("unit") for n in tab}
    sim = [s for s in sim if s["j"] in done and s["j"] != i]
    like = {}
    for s in sim:      # refine the offset: start from the downbeats, then line the notes up (+-0.4 s, 10 ms steps)
        tj = [n for n in tab if n.get("unit") == s["j"]]
        uj = units[s["j"]]
        d0 = (u["downbeats"][0] - uj["downbeats"][0]) if u.get("downbeats") and uj.get("downbeats") else s["offset_s"]
        best = (-1, d0)
        for k in range(-40, 41):
            d = d0 + k * 0.01
            hit = sum(1 for r in rows if r["base"] and any(n["pitch"] == r["pitch"] and abs(n["onset"] + d - r["onset"]) <= 0.06 for n in tj))
            if hit > best[0] or (hit == best[0] and abs(d - d0) < abs(best[1] - d0)):
                best = (hit, d)
        s["offset_s"] = round(best[1], 3); s["aligned"] = best[0]
        for r in rows:
            if r["id"] in like:
                continue
            best = None
            for n in tj:
                d = abs(n["onset"] + s["offset_s"] - r["onset"])
                if n["pitch"] == r["pitch"] and d <= 0.12 and (best is None or d < best[0]):
                    best = (d, n)
            if best:
                like[r["id"]] = f"{best[1]['string']}:{best[1]['fret']} u{s['j']}"
    bookp = {}
    for g in groups([r for r in rows if r["base"]]):
        key = tuple(sorted(r["pitch"] for r in g))
        if len(key) >= 2 and key in book:
            pl = {p: tuple(x) for p, x in zip(book[key]["pitches"], book[key]["places"])}
            for r in g:
                if r["pitch"] in pl:
                    bookp[r["id"]] = sf(pl[r["pitch"]]) + (" seen" if book[key].get("seen") else "")
    # ---- candidates.csv of the pack
    W = Window(os.path.join(blind, "inputs", "hand", "hand_window.csv")) if hand_on else None
    out = []
    for n in tab:
        if c0 <= n["onset"] < t0 or (t1 <= n["onset"] < c1 and n.get("unit") != i):
            out.append({"role": "before" if n["onset"] < t0 else "after(done)", "id": "", "onset": n["onset"],
                        "offset": n["offset"], "pitch": n["pitch"], "name": name(n["pitch"]), "supporters": "",
                        "n_sup": "", "base": "", "window": "", "places": "", "solver": sf((n["string"], n["fret"])),
                        "next_best": "", "flags": "finished", "book": "", "like": ""})
    for r in rows:
        pl = " ".join(sf(p) + ("" if p in [tuple(x) for x in r["in_window"]] else "*") for p in map(tuple, r["places"]))
        out.append({"role": "unit", "id": r["id"], "onset": r["onset"], "offset": r["offset"], "pitch": r["pitch"],
                    "name": r["name"], "supporters": r["supporters"], "n_sup": r["n_sup"], "base": r["base"],
                    "window": r["window"], "places": pl, "solver": sf(r["choice"]) + ("" if r["solved"] else "?"),
                    "next_best": " ".join(f"{s}:{f}" + (f"(+{d})" if d is not None else "") for s, f, d in r["alts"][:3]),
                    "flags": ",".join(r["flags"]), "book": bookp.get(r["id"], ""), "like": like.get(r["id"], "")})
    done_after = any(n.get("unit") == i + 1 for n in tab)
    if not done_after:
        for c in cands:
            if t1 <= c["onset"] < c1:
                out.append({"role": "after", "id": c["id"], "onset": c["onset"], "offset": c["offset"], "pitch": c["pitch"],
                            "name": name(c["pitch"]), "supporters": c["supporters"], "n_sup": c["n_sup"], "base": c["base"],
                            "window": "", "places": "", "solver": "", "next_best": "", "flags": "next unit", "book": "", "like": ""})
    out.sort(key=lambda r: (r["onset"], r["pitch"]))
    cols = ["role", "id", "onset", "offset", "pitch", "name", "supporters", "n_sup", "base", "window", "places", "solver",
            "next_best", "flags", "book", "like"]
    with open(os.path.join(P, "candidates.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols); w.writeheader()
        for r in out:
            r = dict(r); r["onset"] = f"{r['onset']:.3f}"; r["offset"] = f"{r['offset']:.3f}"; w.writerow(r)
    # ---- pictures
    ctxnotes = os.path.join(P, ".finished_context.json")
    wj(ctxnotes, {"notes": [n for n in tab if c0 - 1 <= n["onset"] < c1 and n.get("unit") != i]})
    sp = subprocess.run([PYT, os.path.join(LOOP, "draw.py"), "spec", os.path.join(blind, "inputs", "audio.wav"),
                         os.path.join(P, "spectrogram.png"), "--from", f"{c0:.3f}", "--to", f"{c1:.3f}",
                         "--cands", os.path.join(blind, "inputs", "candidates.csv"), "--notes", ctxnotes,
                         "--unit", f"{t0:.3f},{t1:.3f}", "--beats", os.path.join(blind, "inputs", "beats.txt"),
                         "--title", f"unit {i}: {t0:.2f}-{t1:.2f} s (dimmed: 0.5 s of context each side; white = base "
                                    f"candidates, cyan dashed = held by 2+ other models, cyan dotted = by one; green = "
                                    f"finished notes with string:fret)"], capture_output=True, text=True)
    if sp.returncode != 0:
        print("spectrogram failed:", sp.stderr[-300:], file=sys.stderr)
    tiles = []
    if hand_on:
        gs = groups([r for r in rows if r["solved"] or r["base"]])
        pick = list(range(len(gs)))
        if len(gs) > 8:
            score = []
            for k, g in enumerate(gs):
                close = any(d is not None and d < 1.0 for r in g for _, _, d in r["alts"])
                score.append((len(g) >= 2) + close + any(r["choice"] and r["choice"][1] > 0 for r in g))
            even = {round(x * (len(gs) - 1) / 7) for x in range(8)}
            pick = sorted(sorted(range(len(gs)), key=lambda k: (-score[k], k not in even, k))[:8])
        tiles = [(round(gs[k][0]["onset"] + 0.02, 3), [r["id"] for r in gs[k]]) for k in pick]
        if tiles:
            nk = subprocess.run([PYVID, os.path.join(LOOP, "neckpic.py"), blind, os.path.join(P, "neck.jpg"),
                                 "--times", ",".join(str(t) for t, _ in tiles)], capture_output=True, text=True)
            neck_txt = nk.stdout.strip().splitlines()
            if nk.returncode != 0:
                print("neck picture failed:", nk.stderr[-300:], file=sys.stderr); neck_txt = []
        orient = edge_note(blind, t0)
    # ---- similar.md
    simL = [f"# Earlier units that sound alike (unit {i})", ""]
    if not state_on:
        simL.append("(not given in this run)")
    elif not sim:
        simL.append("None among the finished units (chroma of the sound + the candidates' pitches, score >= 0.6).")
    for s in sim:
        tj = [n for n in tab if n.get("unit") == s["j"]]
        uj = units[s["j"]]
        conf = next((c for c in st.get("unit_conf", {}).items() if int(c[0]) == s["j"]), None)
        nb_i = sum(1 for r in rows if r["base"])
        simL += [f"## unit {s['j']} ({uj['t0']:.2f}-{uj['t1']:.2f} s): score {s['score']} (sound {s['chroma']}, pitches "
                 f"{s['pitches']}); add {s['offset_s']:+.2f} s to its times to land on this unit's clock; then "
                 f"{s.get('aligned', '?')} of this unit's {nb_i} base candidates line up with its notes (same pitch, 60 ms)"
                 + (f"; its confidence {conf[1]}" if conf else ""), "",
                 "Its finished tab, times shifted onto this unit's clock (string 1 on top, frets from the capo):", "",
                 "```", ascii_tab(tj, s["offset_s"]), "```", ""]
    if prev_bar:
        simL += ["## This unit as it stands now (your earlier tab)", "", "```", ascii_tab(prev_bar), "```", ""]
    open(os.path.join(P, "similar.md"), "w").write("\n".join(simL) + "\n")
    wj(os.path.join(P, "state.json"), st)
    if prev_bar is not None:
        wj(os.path.join(P, "previous_bar.json"), rj(os.path.join(unit_dir(blind, i, 0), "final_bar.json"),
                                                    {"unit": i, "notes": prev_bar}))
    # ---- unit.json and PACK.md
    wj(os.path.join(P, "unit.json"), {"blind": blind, "i": i, "rev": rev, "t0": t0, "t1": t1, "context": [c0, c1],
                                      "tuning": tuning, "capo": capo, "revisit": revisit, "state": state_on,
                                      "neck_tiles": tiles})
    nb = sum(1 for r in rows if r["base"]); na = len(rows) - nb
    wins = [r["window"] for r in rows if r["base"]]
    flags = [f"{r['id']}:{','.join(r['flags'])}" for r in rows if r["flags"]]
    M = [f"# Unit {i} of {len(units)}" + (f": REVISIT {rev}" if revisit else ""), "",
         f"- Time: {t0:.3f} to {t1:.3f} s of the recording ({t1 - t0:.2f} s"
         + (f", {u['bars']} bar{'s' if u['bars'] > 1 else ''} by the beat tracker" if u.get("bars") else ", cut at gaps")
         + f"). Context shown 0.5 s each side ({c0:.2f}-{c1:.2f} s), read only.",
         f"- Capo: fret {capo}. Frets everywhere are counted FROM THE CAPO (capo = fret 0).",
         f"- Tuning, string 6 to 1 (without the capo): {' '.join(name(p) for p in tuning)} = MIDI {tuning}; "
         f"sounding open strings with the capo: {' '.join(name(p + capo) for p in tuning)}. pitch = open + capo + fret.",
         f"- Notes: {'GIVEN (the notes played: place every one, drop none, add none)' if cfg.get('notes') == 'given' else f'{nb} base candidates and {na} alternatives'}"
         f" (candidates.csv; flags: {', '.join(flags) if flags else 'none'}).",
         (f"- Hand window at this unit's onsets (frets from the capo): {', '.join(sorted(set(wins), key=wins.index))}. "
          f"Open strings are always allowed; 'lost' = no constraint." if hand_on else
          "- Hand: OFF in this run (no window, no neck pictures, no video)."),
         ]
    if hand_on and tiles:
        M.append(f"- neck.jpg: {len(tiles)} tiles at these onsets (left to right, top to bottom): " +
                 "; ".join(f"{t:.2f} s ids {','.join(str(x) for x in ids)}" for t, ids in tiles) + f". {orient}")
        if neck_txt:
            M.append("  The tool's reading: " + " | ".join(x for x in neck_txt if x.startswith("t ")))
    if revisit:
        M += ["", f"## Why this revisit", "", revisit, "",
              "previous_bar.json is the unit as it stands; similar.md shows it as a text tab. Finished notes of the units "
              "after it are now in the context (role 'after(done)')."]
    M += ["", "## What was learned so far (state.json)", "", state_summary(st, i) if state_on else "- (the carried state is off in this run)",
          "", "## Files", "",
          "- candidates.csv: role (unit = yours to decide; before/after = context, read only), id, onset, offset, pitch, name, "
          "supporters (bp, gaps, fl, tk, mt3 = five note models" + (", gstem = the base model on a separated guitar stem" if "gstem" in open(os.path.join(blind, "inputs", "candidates.csv")).read(4000) else "")
          + "; given = the notes played), n_sup, base (1 = the base reading), window (lo-hi at the onset), places (every "
          "string:fret that plays the pitch; * = outside the window), solver (its choice; ? = not in the solved set, the "
          "in-window place nearest its hand), next_best (+ extra path cost), flags (no-place, out-window, dropped), book "
          "(the shape book's place for this pitch set), like (the place in a similar finished unit).",
          "- spectrogram.png: the sound with the candidates drawn; neck.jpg: the hand; similar.md: earlier units that sound alike.",
          "- state.json: the carried state in full. solver.json: the solver's output. unit.json: this unit's facts.",
          f"- Tools: {os.path.join(blind, 'tools')}/ (TOOLS-BAR.md there)."]
    open(os.path.join(P, "PACK.md"), "w").write("\n".join(M) + "\n")
    if not quiet:
        print(json.dumps({"pack": P, "unit": i, "rev": rev, "base": nb, "alts": na, "tiles": len(tiles),
                          "similar": [s["j"] for s in sim]}))
    return P


def edge_note(blind, t):
    """Which picture edge string 6 runs along (from the neck model)."""
    try:
        r = subprocess.run([PYVID, "-c", f"""
import sys; sys.path.insert(0, '/home/user/gtv/loop/tools/handreach')
from neck import NeckModel, to_image
import os
h = '{os.path.join(blind, 'inputs', 'hand')}'
trk = os.path.join(h, 'track.json')
NM = NeckModel(os.path.join(h, 'anchors.json'), trk if os.path.exists(trk) else None)
H, _ = NM.H_at({t + 0.5})
c = int(NM.A.get('capo', 0))
p = to_image(H, [c + 3, c + 3, c + 12], [0.0, 1.0, 0.0], NM.kind)
print('top' if p[0][1] < p[1][1] else 'bottom', 'left' if p[2][0] < p[0][0] else 'right')
"""], capture_output=True, text=True)
        e, d = r.stdout.split()
        return (f"In these pictures string 6 (lowest) runs along the {e.upper()} edge of the neck, string 1 along the "
                f"{'BOTTOM' if e == 'top' else 'TOP'}; higher frets lie to the {d.upper()}.")
    except Exception:
        return ""


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("run_dir"); ap.add_argument("unit", type=int)
    ap.add_argument("--revisit", default=None); ap.add_argument("--state", choices=["on", "off"], default="on")
    ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args()
    build(a.run_dir, a.unit, revisit=a.revisit, state_on=a.state == "on", quiet=a.quiet)
