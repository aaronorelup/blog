#!/usr/bin/env python3
"""solver.py: notes + tuning + capo [+ a hand window] -> string and fret for every note, by a Viterbi over onset groups.

Plain solver for the LOOP session (E3; E4 calls solve_range). No song-specific value anywhere: everything the solver
knows about a recording comes from its arguments.

Model
-----
- Notes whose onsets lie within GROUP_S (35 ms) of a group's first note form one onset group.
- A group's state is (assignment, h): every note of the group on its own string at a fret 0..max_fret counted from the
  capo (pitch = tuning[6 - string] + capo + fret), and h, the fret of the hand's index finger (1..max_fret). The hand
  covers frets h..h+BOX (four frets).
- Costs of a state:
    stretch: W.span per fret that a fretted note lies outside the hand's box h..h+3 (a group spanning more than 4 frets
             always pays it);
    height:  W.height x the mean fretted fret of the group;
    open:    W.open per open-string note (negative = a bonus), plus W.open_win when the window is known at the onset
             and the same pitch has a fretted place inside it (the hand is there: a fretted place under it is likelier);
    window:  a fretted note outside the hand window [lo, hi] at its onset is forbidden (hard) or costs W.win per fret
             outside (soft); open strings are always allowed; rows marked lost give no constraint. If no state of a
             group is allowed under hard, that group falls back to soft and is counted.
- Costs between consecutive groups:
    move:    W.move per fret the hand moves (|h - h'|);
    ring:    W.ring for each note placed on a string that still rings (offset > onset + RING_TOL) from the previous
             group with a different pitch.
- A note that no string can play (pitch out of range, or more notes than strings in a group) is dropped at W.drop.
The min-sum forward and backward passes give the best path and, for every note, the best path cost with the note at
each of its places (min-marginals), so alternatives are exact under the model.

CLI: run without arguments for usage, or see README.md next to this file.
"""
import argparse, csv, json, math, sys, time

import numpy as np

GROUP_S = 0.035      # notes within 35 ms of a group's first note are one group
RING_TOL = 0.05      # a previous note rings on if its offset is later than this after the new onset
BOX = 3              # the hand box is h..h+3 (four frets)
MAX_STATES = 600     # per group, kept by lowest local cost (see stats.max_states)

# Set once on the capo song (LADDER.md "Weights"), never per song.
DEFAULT_W = {"move": 0.4, "height": 0.1, "span": 1.0, "ring": 0.0, "open": 0.0, "open_win": 0.0, "win": 2.0,
             "drop": 5.0}

PLACEHOLDER = {"tuning_offset_cents": 0.0, "tempo_bpm": 120.0, "key": "C major", "beats": [0.0, 1.0],
               "downbeats": [0.0], "chords": [{"start": 0.0, "end": 1.0, "label": "N"}]}


# ----------------------------------------------------------------------------------------------------------- inputs
def load_notes(path):
    """CSV with onset, offset, pitch (extra columns ignored) or JSON (a list or an object with 'notes').
    String and fret in the input are ignored."""
    out = []
    if path.endswith(".json"):
        d = json.load(open(path))
        rows = d["notes"] if isinstance(d, dict) else d
    else:
        rows = list(csv.DictReader(open(path)))
    for r in rows:
        on, off, p = float(r["onset"]), float(r["offset"]), float(r["pitch"])
        out.append({"onset": on, "offset": off if off > on else on + 0.05, "pitch": int(round(p))})
    out.sort(key=lambda n: (n["onset"], n["pitch"]))
    for i, n in enumerate(out):
        n["i"] = i
    return out


class Window:
    """hand_window.csv: t, lo, hi, [conf], lost (readers ignore extra columns). Rows at any times; the row nearest
    to a note's onset applies. lost = 1 (or an empty lo/hi) means no constraint."""

    def __init__(self, path):
        t, lo, hi, ok = [], [], [], []
        for r in csv.DictReader(open(path)):
            t.append(float(r["t"]))
            lost = str(r.get("lost", "0")).strip() in ("1", "1.0", "True", "true")
            good = (not lost) and r.get("lo", "") not in ("", None) and r.get("hi", "") not in ("", None)
            lo.append(float(r["lo"]) if good else 0.0)
            hi.append(float(r["hi"]) if good else 0.0)
            ok.append(good)
        o = np.argsort(t)
        self.t = np.array(t)[o]; self.lo = np.array(lo)[o]; self.hi = np.array(hi)[o]; self.ok = np.array(ok)[o]
        self.path = path

    def at(self, t):
        k = int(np.searchsorted(self.t, t))
        if k >= len(self.t): k = len(self.t) - 1
        elif k > 0 and abs(self.t[k - 1] - t) <= abs(self.t[k] - t): k -= 1
        if not self.ok[k]: return None
        return (self.lo[k], self.hi[k])


def open_pitches(tuning, capo):
    """string (1..6) -> sounding open pitch with the capo."""
    return {s: tuning[6 - s] + capo for s in range(1, 7)}


def all_places(pitch, opn, max_fret):
    return [(s, pitch - opn[s]) for s in range(1, 7) if 0 <= pitch - opn[s] <= max_fret]


def placeable_in_window(note, opn, window, max_fret):
    """False only when the window is known at the onset and the note has no open-string place and no fretted place
    inside it (the chain2f filter)."""
    pl = all_places(note["pitch"], opn, max_fret)
    if not pl: return False
    w = window.at(note["onset"]) if window is not None else None
    if w is None: return True
    return any(f == 0 or (w[0] <= f <= w[1]) for s, f in pl)


def group_notes(notes):
    groups, cur = [], []
    for n in notes:
        if cur and n["onset"] - cur[0]["onset"] > GROUP_S:
            groups.append(cur); cur = []
        cur.append(n)
    if cur: groups.append(cur)
    return groups


# ------------------------------------------------------------------------------------------------------ the groups
def _enumerate(opts, allow_drop, drop_cost):
    """All assignments with distinct strings. opts[k] = list of (s, f, cost). Returns list of (places, cost)."""
    res = []
    n = len(opts)

    def rec(k, used, acc, cost):
        if k == n:
            res.append((tuple(acc), cost)); return
        for (s, f, c) in opts[k]:
            if s in used: continue
            used.add(s); acc.append((s, f)); rec(k + 1, used, acc, cost + c); acc.pop(); used.discard(s)
        if allow_drop:
            acc.append(None); rec(k + 1, used, acc, cost + drop_cost); acc.pop()

    rec(0, set(), [], 0.0)
    return res


def build_group(g, opn, window, mode, W, max_fret, pins):
    per = []
    for n in g:
        pl = all_places(n["pitch"], opn, max_fret)
        pin = pins.get(n["i"])
        pinned = False
        if pin is not None:
            if pin in pl: pl = [pin]; pinned = True
            else: print(f"warning: pin {pin} cannot play pitch {n['pitch']} at {n['onset']:.3f}: ignored", file=sys.stderr)
        w = window.at(n["onset"]) if window is not None else None
        per.append((pl, w, pinned))

    def opts(hard):
        out = []
        for pl, w, pinned in per:
            o = []
            inwin = w is not None and any(f > 0 and w[0] <= f <= w[1] for s, f in pl)
            for s, f in pl:
                c = W["open"] if f == 0 else 0.0
                if f == 0 and inwin: c += W["open_win"]
                if w is not None and f > 0 and not pinned:
                    d = w[0] - f if f < w[0] else (f - w[1] if f > w[1] else 0.0)
                    if d > 0:
                        if hard: continue
                        c += W["win"] * d
                o.append((s, f, c))
            out.append(o)
        return out

    hard = mode == "hard" and window is not None
    fallback = False
    st = _enumerate(opts(hard), False, W["drop"])
    if not st and hard:
        st = _enumerate(opts(False), False, W["drop"]); fallback = True
    dropped_needed = False
    if not st:
        st = _enumerate(opts(False), True, W["drop"]); dropped_needed = True
    # local cost: per-assignment base + per-h stretch
    H = max_fret
    hs = np.arange(1, H + 1)
    A = len(st)
    base = np.zeros(A); loc = np.zeros((A, H))
    for a, (places, c) in enumerate(st):
        fr = [p[1] for p in places if p is not None and p[1] > 0]
        b = c + (W["height"] * float(np.mean(fr)) if fr else 0.0)
        base[a] = b
        if fr:
            fa = np.array(fr)[:, None]
            d = np.maximum(0, hs[None, :] - fa) + np.maximum(0, fa - (hs[None, :] + BOX))
            loc[a] = b + W["span"] * d.sum(0)
        else:
            loc[a] = b
    if A > MAX_STATES:
        keep = np.argsort(loc.min(1))[:MAX_STATES]
        st = [st[k] for k in keep]; loc = loc[keep]; A = len(st)
    # per-string pitch of the assignment (-1 = string unused), for ring costs
    sp = np.full((A, 7), -1, int)
    for a, (places, c) in enumerate(st):
        for n, p in zip(g, places):
            if p is not None: sp[a, p[0]] = n["pitch"]
    return {"notes": g, "states": [s[0] for s in st], "loc": loc, "sp": sp, "fallback": fallback,
            "drop_needed": dropped_needed, "onset": g[0]["onset"]}


def ring_matrix(prev, cur, W):
    """R[a_prev, a_cur] = W.ring x (notes of cur on strings still ringing from prev with another pitch)."""
    t = cur["onset"]
    Ap = len(prev["states"])
    rs = np.full((Ap, 7), -1, int)
    for a, places in enumerate(prev["states"]):
        for n, p in zip(prev["notes"], places):
            if p is not None and n["offset"] > t + RING_TOL: rs[a, p[0]] = n["pitch"]
    cs = cur["sp"]
    conflict = (rs[:, None, 1:] >= 0) & (cs[None, :, 1:] >= 0) & (rs[:, None, 1:] != cs[None, :, 1:])
    return W["ring"] * conflict.sum(2)


def context_group(ctx, opn, max_fret):
    """A fixed one-state group from a context {notes: [{onset, offset, pitch, string, fret}], hand: h or null}."""
    notes = [{"onset": float(n["onset"]), "offset": float(n["offset"]), "pitch": int(n["pitch"]), "i": -1}
             for n in ctx.get("notes", [])]
    places = tuple((int(n["string"]), int(n["fret"])) for n in ctx.get("notes", []))
    H = max_fret
    h = ctx.get("hand")
    if h is None:
        fr = [p[1] for p in places if p[1] > 0]
        h = min(fr) if fr else None
    alpha = np.zeros((1, H))
    if h is not None:
        alpha[0, :] = np.inf
        alpha[0, int(min(max(h, 1), H)) - 1] = 0.0
    sp = np.full((1, 7), -1, int)
    for n, p in zip(notes, places): sp[0, p[0]] = n["pitch"]
    return {"notes": notes, "states": [places], "loc": alpha, "sp": sp, "fallback": False, "drop_needed": False,
            "onset": notes[0]["onset"] if notes else -1.0}


# --------------------------------------------------------------------------------------------------------- solving
def _move_matrix(H, W):
    hs = np.arange(H)
    return W["move"] * np.abs(hs[:, None] - hs[None, :]).astype(float)


def solve_range(notes, tuning, capo, window=None, mode="hard", W=None, t0=None, t1=None, context=None, pins=None,
                max_fret=20, alternatives=True, top=3):
    """Best path over the notes with t0 <= onset < t1.
    notes: list of {onset, offset, pitch[, i]}; tuning: 6 MIDI numbers, string 6 to 1; capo: fret;
    window: a Window or None; mode: 'hard' or 'soft'; context: the previous group's state
    ({notes: [{onset, offset, pitch, string, fret}], hand}); pins: list of {onset, pitch, string, fret} (matched to a
    note within 30 ms with the same pitch; a pin overrides the window).
    Returns {path, alternatives, last_state, cost, stats}."""
    W = dict(DEFAULT_W, **(W or {}))
    T0 = time.time()
    opn = open_pitches(tuning, capo)
    sel = [n for n in notes if (t0 is None or n["onset"] >= t0) and (t1 is None or n["onset"] < t1)]
    for k, n in enumerate(sel):
        if "i" not in n: n["i"] = k
    pinmap = {}
    for p in pins or []:
        best = None
        for n in sel:
            if n["pitch"] == int(p["pitch"]) and abs(n["onset"] - float(p["onset"])) <= 0.03:
                if best is None or abs(n["onset"] - float(p["onset"])) < abs(best["onset"] - float(p["onset"])):
                    best = n
        if best is not None: pinmap[best["i"]] = (int(p["string"]), int(p["fret"]))
        else: print(f"warning: pin {p} matches no note in the range", file=sys.stderr)
    groups = [build_group(g, opn, window, mode, W, max_fret, pinmap) for g in group_notes(sel)]
    if context and context.get("notes"):
        groups = [context_group(context, opn, max_fret)] + groups
        has_ctx = True
    else:
        has_ctx = False
    if not groups or (has_ctx and len(groups) == 1):
        return {"path": [], "alternatives": [], "last_state": context, "cost": 0.0,
                "stats": {"notes": 0, "groups": 0, "soft_fallback_groups": 0, "dropped": 0, "seconds": 0.0}}
    H = max_fret
    Mv = _move_matrix(H, W)
    K = len(groups)
    alpha = [groups[0]["loc"].copy()]
    bpa, bph = [None], [None]
    Rs = [None]
    for k in range(1, K):
        R = ring_matrix(groups[k - 1], groups[k], W)          # Ap x A
        Rs.append(R)
        prev = alpha[-1]                                       # Ap x H
        tmp = prev[:, :, None] + Mv[None, :, :]                # Ap x H(h) x H(h')
        Mh = tmp.argmin(1)                                     # Ap x H'
        M = np.take_along_axis(tmp, Mh[:, None, :], 1)[:, 0, :]  # Ap x H'
        tot = R[:, :, None] + M[:, None, :]                    # Ap x A x H'
        ba = tot.argmin(0)                                     # A x H'
        best = np.take_along_axis(tot, ba[None, :, :], 0)[0]   # A x H'
        alpha.append(best + groups[k]["loc"])
        bpa.append(ba); bph.append(Mh)
    # backtrack
    last = alpha[-1]
    a, h = np.unravel_index(int(np.argmin(last)), last.shape)
    total = float(last[a, h])
    path = [None] * K
    path[K - 1] = (int(a), int(h))
    for k in range(K - 1, 0, -1):
        a, h = path[k]
        pa = int(bpa[k][a, h]); ph = int(bph[k][pa, h])
        path[k - 1] = (pa, ph)
    # backward pass for min-marginals
    alts = []
    if alternatives:
        beta = [None] * K
        beta[K - 1] = np.zeros_like(alpha[K - 1])
        for k in range(K - 1, 0, -1):
            G = groups[k]["loc"] + beta[k]                    # A x H'
            N = (G[:, None, :] + Mv[None, :, :]).min(2)        # A x H(h)   (Mv symmetric)
            beta[k - 1] = (Rs[k][:, :, None] + N[None, :, :]).min(1)  # Ap x H
        for k in range(1 if has_ctx else 0, K):
            g = groups[k]
            mm = (alpha[k] + beta[k]).min(1)                   # per assignment
            for j, n in enumerate(g["notes"]):
                best = {}
                for a_, places in enumerate(g["states"]):
                    p = places[j]
                    key = p if p is not None else ("drop",)
                    if key not in best or mm[a_] < best[key]: best[key] = float(mm[a_])
                ranked = sorted(best.items(), key=lambda kv: kv[1])[:top]
                alts.append({"onset": round(n["onset"], 4), "pitch": n["pitch"],
                             "places": [({"string": kk[0], "fret": kk[1]} if kk != ("drop",) else {"drop": True})
                                        | {"cost": round(v, 4), "delta": round(v - total, 4)} for kk, v in ranked]})
    out, dropped = [], 0
    for k in range(1 if has_ctx else 0, K):
        g = groups[k]; a, h = path[k]
        for n, p in zip(g["notes"], g["states"][a]):
            if p is None: dropped += 1; continue
            out.append({"onset": round(n["onset"], 4), "offset": round(n["offset"], 4), "pitch": n["pitch"],
                        "string": p[0], "fret": p[1], "hand": h + 1})
    lg = groups[-1]; la, lh = path[-1]
    last_state = {"notes": [{"onset": n["onset"], "offset": n["offset"], "pitch": n["pitch"], "string": p[0],
                             "fret": p[1]} for n, p in zip(lg["notes"], lg["states"][la]) if p is not None],
                  "hand": lh + 1}
    real = groups[1:] if has_ctx else groups
    stats = {"notes": len(sel), "groups": len(real), "soft_fallback_groups": sum(g["fallback"] for g in real),
             "groups_with_drops_needed": sum(g["drop_needed"] for g in real), "dropped": dropped,
             "max_states": max(len(g["states"]) for g in real), "seconds": round(time.time() - T0, 3)}
    return {"path": out, "alternatives": alts, "last_state": last_state, "cost": total, "stats": stats}


def to_answer(path, tuning, capo):
    """The kit's answer.json; same-string overlaps trimmed (offsets are not scored); fixed placeholders elsewhere."""
    notes = [dict(n) for n in sorted(path, key=lambda n: (n["onset"], n["string"]))]
    last = {}
    for n in notes:
        n.pop("hand", None)
        s = n["string"]
        if s in last and last[s]["offset"] > n["onset"] - 0.005:
            last[s]["offset"] = round(max(last[s]["onset"] + 0.02, n["onset"] - 0.01), 4)
        last[s] = n
    for n in notes:
        if n["offset"] <= n["onset"]: n["offset"] = round(n["onset"] + 0.02, 4)
    a = {"tuning_midi": list(tuning), "capo": capo}
    a.update(PLACEHOLDER)
    a["notes"] = notes
    return a


def parse_weights(s):
    W = {}
    for kv in (s or "").split(","):
        if kv.strip():
            k, v = kv.split("="); k = k.strip()
            if k not in DEFAULT_W: raise SystemExit(f"unknown weight {k}; known: {', '.join(DEFAULT_W)}")
            W[k] = float(v)
    return W


def main(argv=None):
    ap = argparse.ArgumentParser(description="Viterbi string/fret solver (E3). See README.md.")
    ap.add_argument("--notes", required=True, help="notes CSV (onset, offset, pitch) or JSON")
    ap.add_argument("--tuning", required=True, help="six MIDI numbers, string 6 to 1, without the capo, e.g. 40,45,50,55,59,64")
    ap.add_argument("--capo", type=int, required=True)
    ap.add_argument("--window", help="hand_window.csv (t, lo, hi, conf, lost); frets from the capo")
    ap.add_argument("--window-mode", choices=["hard", "soft"], default="hard")
    ap.add_argument("--filter-window", action="store_true",
                    help="first remove notes the window cannot place (no open string, no fretted place inside it)")
    ap.add_argument("--t0", type=float); ap.add_argument("--t1", type=float)
    ap.add_argument("--pins", help="JSON list of {onset, pitch, string, fret}")
    ap.add_argument("--context", help="JSON {notes: [{onset, offset, pitch, string, fret}], hand} of the previous group")
    ap.add_argument("--weights", help="override weights, e.g. move=0.2,span=0.6")
    ap.add_argument("--max-fret", type=int, default=20)
    ap.add_argument("--top", type=int, default=3)
    ap.add_argument("--answer", help="write the kit's answer.json here")
    ap.add_argument("--json-out", help="write {path, alternatives, last_state, cost, stats} here")
    ap.add_argument("--stats-out", help="write the stats (and the inputs) here")
    a = ap.parse_args(argv)
    tuning = [int(x) for x in a.tuning.split(",")]
    if len(tuning) != 6: raise SystemExit("--tuning needs six numbers")
    notes = load_notes(a.notes)
    window = Window(a.window) if a.window else None
    W = dict(DEFAULT_W, **parse_weights(a.weights))
    n_filtered = 0
    if a.filter_window:
        if window is None: raise SystemExit("--filter-window needs --window")
        opn = open_pitches(tuning, a.capo)
        keep = [n for n in notes if placeable_in_window(n, opn, window, a.max_fret)]
        n_filtered = len(notes) - len(keep); notes = keep
        for i, n in enumerate(notes): n["i"] = i
    pins = json.load(open(a.pins)) if a.pins else None
    ctx = json.load(open(a.context)) if a.context else None
    r = solve_range(notes, tuning, a.capo, window, a.window_mode, W, a.t0, a.t1, ctx, pins, a.max_fret,
                    alternatives=bool(a.json_out), top=a.top)
    r["stats"]["filtered_by_window"] = n_filtered
    if a.answer:
        json.dump(to_answer(r["path"], tuning, a.capo), open(a.answer, "w"), indent=0)
    if a.json_out:
        json.dump(r, open(a.json_out, "w"), indent=1)
    st = dict(r["stats"], weights=W, window=a.window, window_mode=a.window_mode if window else None,
              tuning=tuning, capo=a.capo, notes_file=a.notes, cost=round(r["cost"], 4))
    if a.stats_out: json.dump(st, open(a.stats_out, "w"), indent=1)
    print(json.dumps(r["stats"]))


if __name__ == "__main__":
    main()
