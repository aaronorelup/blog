#!/usr/bin/env python3
"""fingers.py <notes.csv> <hand_window.csv> <tips.jsonl> --capo N (--a T --b T | --strings T) [--t0 S --t1 S]
              [--list 30] [--json out.json]

Evidence from the fingertips for two tunings that play the same notes about equally well (conflicts.py ties them).
T is six MIDI numbers without the capo, string 6 (lowest) to string 1, comma separated.

For every note (onset, pitch) each tuning has a set of places inside the hand window: (string, fret from the capo), the
open string (fret 0) always allowed, any fret where the window is lost (as conflicts.py). A note DISCRIMINATES between
the tunings unless both can play it open or both have the same places. Then, at the video frames within FRAME_S of
the onset, the fretting hand's fingertips (tips.jsonl: fret coordinate f from the nut, wire k at f = k, a tip
pressing fret k has k-1 < f <= k; across position s, 0 = string-6 edge, 1 = string-1 edge) are compared with the places:

  near(place)  some fingertip (index, middle, ring, little; the thumb only in frames where it comes over the neck)
               has a fret distance d_f <= F_TOL (0 inside the fret's space, else frets to the space's nearer wire)
               and a string distance d_s <= S_TOL (|s - the string's line| in string spacings).
  string lines s_j = E + (1 - 2E) * (6 - j) / 5 for string j (E = the board edge beyond the outer strings).

  If only A needs a finger (B can play the note open): no tip near any of A's fretted places favours B ("absence");
  a tip near a fretted place that only A has favours A ("presence"); a tip near a place both have is neutral. Same the
  other way. If both need a finger: a tip INSIDE the fret space (d_f = 0, within S_TOL of the string) of a place only
  A has, and none in a place only B has, favours A ("presence"), and the other way; else neutral (strict here, since
  with the tolerance two neighbouring frets are both near a tip close to a wire). No tips at the onset: neutral.
  Changes, both made before any count of the result was seen: (1) the strict fret space in the both-need case, after
  a first look at one onset listing; (2) notes whose places are partly shared (one tuning: open string 1 or string 2
  fret 3; the other: string 2 fret 3 only) now count by absence, where the first version skipped every shared place.
Verdict: the side with at least WIN_RATIO times the other's count and a lead of at least WIN_LEAD onsets; else
"undecided". The rule's constants are fixed below and were not fitted to any answer.

--strings T asks each string's question separately: T against T with that one string moved by -2, -1, +1, +2
semitones (only moves that keep the strings rising), and prints a verdict per move.
--list N prints the first N discriminating onsets with times, places and distances.
"""
import argparse, bisect, json, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conflicts import read_notes, read_window, window_at, name, tname, MAXF

FRAME_S = 0.05      # frames used: |t_frame - onset| <= FRAME_S
F_TOL = 0.25        # frets
S_TOL = 0.5         # string spacings
E = 0.08            # board edge beyond the outer strings, share of the board width
WIN_RATIO, WIN_LEAD = 2.0, 3
FINGERS = ("8", "12", "16", "20")
THUMB = "4"


def s_line(j):
    return E + (1 - 2 * E) * (6 - j) / 5.0


SPACING = (1 - 2 * E) / 5.0


def read_tips(path):
    T, R = [], []
    with open(path) as fh:
        for line in fh:
            d = json.loads(line)
            T.append(float(d["t"])); R.append(d)
    o = np.argsort(T)
    return [T[i] for i in o], [R[i] for i in o]


def tips_at(tips, t):
    T, R = tips
    i = bisect.bisect_left(T, t - FRAME_S)
    out = []
    while i < len(T) and T[i] <= t + FRAME_S:
        d = R[i]
        if not d.get("lost") and d.get("tips"):
            pts = [(k, v[0], v[1]) for k, v in d["tips"].items() if k in FINGERS and v is not None]
            if d.get("thumb_over") and d["tips"].get(THUMB) is not None:
                v = d["tips"][THUMB]; pts.append((THUMB, v[0], v[1]))
            out.append((T[i], pts))
        i += 1
    return out


def places(p, t, tun, capo, W):
    lo, hi = window_at(W, t)
    pl = set()
    for k in range(6):
        fr = p - (tun[k] + capo)
        if fr == 0:
            pl.add((6 - k, 0))
        elif lo is None:
            if 0 < fr <= MAXF - capo:
                pl.add((6 - k, fr))
        elif max(lo, 1) <= fr <= min(hi, MAXF - capo):
            pl.add((6 - k, fr))
    return pl


def dist(place, f, s, capo):
    j, fc = place
    k = fc + capo
    if k - 1 <= f <= k:
        df = 0.0
    else:
        df = min(abs(f - (k - 1)), abs(f - k))
    ds = abs(s - s_line(j)) / SPACING
    return df, ds


def nearest(pls, frames, capo):
    """Best (d_f, d_s, finger, place, frame time) over the fretted places and the frames; None if no tips."""
    best = None
    for tf, pts in frames:
        for pl in pls:
            if pl[1] == 0:
                continue
            for fid, f, s in pts:
                df, ds = dist(pl, f, s, capo)
                key = (max(df / F_TOL, ds / S_TOL), df, ds)
                if best is None or key < best[0]:
                    best = (key, round(df, 3), round(ds, 3), fid, pl, round(tf, 3))
    return None if best is None else {"d_f": best[1], "d_s": best[2], "finger": best[3], "place": best[4], "t": best[5],
                                      "near": best[1] <= F_TOL and best[2] <= S_TOL}


def any_in_space(pls, frames, capo):
    """Some tip inside the fret space of a fretted place (d_f = 0) and within S_TOL of its string."""
    for tf, pts in frames:
        for pl in pls:
            if pl[1] == 0:
                continue
            for fid, f, s in pts:
                df, ds = dist(pl, f, s, capo)
                if df == 0 and ds <= S_TOL:
                    return True
    return False


def compare(notes, W, tips, capo, A, B):
    ev = {"A": list(A), "B": list(B), "favour_A": 0, "favour_B": 0, "neutral": 0, "not_discriminating": 0,
          "A_presence": 0, "A_absence": 0, "B_presence": 0, "B_absence": 0, "onsets": []}
    for on, off, p in notes:
        PA, PB = places(p, on, A, capo, W), places(p, on, B, capo, W)
        if not PA or not PB:
            ev["not_discriminating"] += 1; continue
        openA = any(f == 0 for _, f in PA); openB = any(f == 0 for _, f in PB)
        FA = {q for q in PA if q[1] > 0}; FB = {q for q in PB if q[1] > 0}
        if (openA and openB) or PA == PB or (openA == openB and FA == FB):
            ev["not_discriminating"] += 1; continue
        XA, XB = FA - FB, FB - FA                  # fretted places only one of them has
        frames = tips_at(tips, on)
        row = {"t": round(on, 3), "pitch": p, "name": name(p), "A_places": sorted(PA), "B_places": sorted(PB),
               "frames": len(frames)}
        if not frames:
            ev["neutral"] += 1; row["why"] = "no tips"; ev["onsets"].append(row); continue
        nA = nearest(FA, frames, capo) if FA else None
        nB = nearest(FB, frames, capo) if FB else None
        row["A_nearest"], row["B_nearest"] = nA, nB
        if openA != openB:
            # one side (O) can play it open, the other (N) needs a finger at one of its fretted places
            O, N, FN, XN, nN = ("A", "B", FB, XB, nB) if openA else ("B", "A", FA, XA, nA)
            nearN = bool(nN and nN["near"])
            nearX = bool(XN) and bool((nearest(XN, frames, capo) or {}).get("near"))
            if not nearN:
                side, why = O, "absence"
            elif nearX:
                side, why = N, "presence"
            else:
                side, why = None, "tip at a shared place"
        else:
            # both need a finger: a tip INSIDE the fret space (d_f = 0) of a place only one of them has decides
            inA = bool(XA) and any_in_space(XA, frames, capo); inB = bool(XB) and any_in_space(XB, frames, capo)
            if inA and not inB:
                side, why = "A", "presence"
            elif inB and not inA:
                side, why = "B", "presence"
            else:
                side, why = None, "both in a place" if inA else "neither in a place"
            row["A_in_space"], row["B_in_space"] = inA, inB
        row["favours"], row["why"] = side, why
        if side is None:
            ev["neutral"] += 1
        else:
            ev["favour_" + side] += 1; ev[f"{side}_{why}"] += 1
        ev["onsets"].append(row)
    fa, fb = ev["favour_A"], ev["favour_B"]
    if fa >= WIN_RATIO * fb and fa - fb >= WIN_LEAD:
        ev["verdict"] = "A"
    elif fb >= WIN_RATIO * fa and fb - fa >= WIN_LEAD:
        ev["verdict"] = "B"
    else:
        ev["verdict"] = "undecided"
    return ev


def parse_t(s):
    t = [int(x) for x in s.split(",")]
    if len(t) != 6:
        sys.exit("a tuning is six MIDI numbers, string 6 to 1")
    return t


def show(ev, capo, n_list):
    A, B = ev["A"], ev["B"]
    print(f"A {tname(A)} ({','.join(map(str, A))})  vs  B {tname(B)} ({','.join(map(str, B))}), capo {capo}")
    print(f"  discriminating onsets {ev['favour_A'] + ev['favour_B'] + ev['neutral']} (not discriminating "
          f"{ev['not_discriminating']}): favour A {ev['favour_A']} (presence {ev['A_presence']}, absence {ev['A_absence']}), "
          f"favour B {ev['favour_B']} (presence {ev['B_presence']}, absence {ev['B_absence']}), neutral {ev['neutral']} "
          f"-> verdict {ev['verdict']}")
    for row in ev["onsets"][:n_list]:
        def fmt(n):
            if n is None:
                return "open"
            return f"s{n['place'][0]}f{n['place'][1]} by tip {n['finger']} d_f {n['d_f']} d_s {n['d_s']}{' NEAR' if n['near'] else ''}"
        print(f"   {row['t']:8.3f} {row['name']:4s} A{row['A_places']} B{row['B_places']} "
              f"A: {fmt(row.get('A_nearest')) if row['frames'] else '-'} | B: {fmt(row.get('B_nearest')) if row['frames'] else '-'}"
              f" -> {row.get('favours')} ({row['why']})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("notes"); ap.add_argument("window"); ap.add_argument("tips")
    ap.add_argument("--capo", type=int, required=True)
    ap.add_argument("--a"); ap.add_argument("--b"); ap.add_argument("--strings")
    ap.add_argument("--t0", type=float, default=0.0); ap.add_argument("--t1", type=float, default=1e9)
    ap.add_argument("--list", type=int, default=0); ap.add_argument("--json")
    a = ap.parse_args()
    notes = [x for x in read_notes(a.notes) if a.t0 <= x[0] < a.t1]
    W = read_window(a.window); tips = read_tips(a.tips)
    out = {"rule": {"FRAME_S": FRAME_S, "F_TOL": F_TOL, "S_TOL": S_TOL, "E": E, "WIN_RATIO": WIN_RATIO,
                    "WIN_LEAD": WIN_LEAD}, "capo": a.capo, "t0": a.t0, "t1": a.t1, "comparisons": []}
    if a.strings:
        T = parse_t(a.strings)
        for k in range(6):
            for mv in (-2, -1, 1, 2):
                U = list(T); U[k] += mv
                if any(U[i] >= U[i + 1] for i in range(5)):
                    continue
                ev = compare(notes, W, tips, a.capo, T, U)
                print(f"string {6 - k} {name(T[k])} -> {name(U[k])}: favour T {ev['favour_A']}, favour moved {ev['favour_B']}, "
                      f"neutral {ev['neutral']} -> {'T' if ev['verdict'] == 'A' else 'moved' if ev['verdict'] == 'B' else 'undecided'}")
                ev["string"] = 6 - k; ev["move"] = mv
                out["comparisons"].append(ev)
    else:
        if not (a.a and a.b):
            sys.exit("give --a and --b, or --strings")
        ev = compare(notes, W, tips, a.capo, parse_t(a.a), parse_t(a.b))
        show(ev, a.capo, a.list)
        out["comparisons"].append(ev)
    if a.json:
        json.dump(out, open(a.json, "w"), indent=1, default=list)


if __name__ == "__main__":
    main()
