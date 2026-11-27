#!/usr/bin/env python3
"""conflicts.py <notes.csv> <hand_window.csv> --capo N --centre T [--t0 S --t1 S] [--tips tips.jsonl]
                [--support a.csv b.csv ...] [--check T] [--top 20] [--groups-for 5000] [--json out.json]

Which tunings could play the heard notes where the fretting hand was? Every tuning on a grid is scored by its conflicts
over a stretch of the recording; fewer is better.

A tuning T is six MIDI numbers, the open strings WITHOUT the capo, string 6 (the lowest) first, comma separated; the
capo adds N semitones to every open string. The grid: each string from 5 semitones below to 2 semitones above the
tuning you give as --centre, 8 values a string, 8^6 = 262,144 tunings, of which only those whose six open strings
strictly rise in pitch from string 6 to string 1 are kept.

A note is placeable in a tuning if some string can sound its pitch either open (at the capo) or fretted at a fret, counted
from the capo, inside the hand window at the note's onset (hand_window.csv: the row nearest the onset; lo..hi frets from
the capo; a row with lost=1 or no window allows every fret 0..MAXF-capo). Conflicts of a tuning:
  singles  notes that no string can sound inside the window (or open);
  groups   onset groups (notes whose onsets lie within GROUP_S of the group's first onset, repeated pitches merged)
           whose placeable notes cannot all be put on different strings (checked by Hall's rule over every subset).
total = singles + groups. Singles are counted for every tuning (vectorised); groups only for the GROUPS_FOR tunings with
the fewest singles. Ranking: total, then fewer strings changed from the --centre, then smaller sum of |change|; tunings with the
same total as the best are listed as tied. Within a tie the order prefers tunings nearer the --centre: a prior, not
evidence.

Stretches: --t0/--t1 (seconds on the recording's clock) give one stretch; without them three: the first 30 s and the
first 60 s from the first note, and the whole recording.
--support: other note lists (onset,offset,pitch); a note heard by --min-support (2) or more of them (same pitch, onsets
  within 0.05 s) that the base list lacks is added. The base list's notes always count.
--check T: also report the rank and conflicts of tuning T (six MIDI numbers, string 6 to 1, comma separated).
--tips: also break the tie with the finger rule (fingers.py): the first-ranked tied tuning is the champion; each other
  tied tuning in rank order challenges it and takes its place when fingers.py's verdict favours it; a second pass
  counts the tied tunings that would still beat the final champion (0 = a stable answer). At most --tie-max (500).
Prints a readable report; --json writes everything.
"""
import argparse, bisect, csv, itertools, json, os, sys
import numpy as np

REF = None                               # the grid's centre, string 6 .. string 1: set from --centre
DLO, DHI = -5, 2                         # each string: REF-5 .. REF+2
D = np.arange(DLO, DHI + 1)              # 8 values
MAXF = 22                                # highest fret counted from the nut
GROUP_S = 0.035                          # onset group: onsets within this of the group's first onset
SUPPORT_TOL = 0.05
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def name(m):
    return f"{NAMES[m % 12]}{m // 12 - 1}"


def tname(t):
    return " ".join(name(int(m)) for m in t)


def read_notes(path):
    """onset, offset, pitch from a CSV with a header (by name) or without (first three columns). Other columns ignored."""
    out = []
    with open(path) as fh:
        rows = list(csv.reader(fh))
    if not rows:
        return out
    hdr = [h.strip().lower() for h in rows[0]]
    if "onset" in hdr and "pitch" in hdr:
        io, ip = hdr.index("onset"), hdr.index("pitch")
        iff = hdr.index("offset") if "offset" in hdr else None
        rows = rows[1:]
    else:
        io, iff, ip = 0, 1, 2
    for r in rows:
        if not r or not r[0].strip():
            continue
        on = float(r[io]); off = float(r[iff]) if iff is not None and r[iff] != "" else on + 0.5
        out.append((on, off, int(round(float(r[ip])))))
    out.sort()
    return out


def read_window(path):
    T, LO, HI, LOST = [], [], [], []
    with open(path) as fh:
        for r in csv.DictReader(fh):
            T.append(float(r["t"]))
            lost = r.get("lost", "0") in ("1", "True", "true") or r.get("lo", "") == "" or r.get("hi", "") == ""
            LOST.append(lost)
            LO.append(int(float(r["lo"])) if not lost else -1)
            HI.append(int(float(r["hi"])) if not lost else -1)
    return np.array(T), np.array(LO), np.array(HI), np.array(LOST)


def window_at(W, t):
    T, LO, HI, LOST = W
    i = bisect.bisect_left(T, t)
    if i > 0 and (i == len(T) or abs(T[i - 1] - t) <= abs(T[i] - t)):
        i -= 1
    return (None, None) if LOST[i] else (int(LO[i]), int(HI[i]))


def add_support(base, others, k):
    """Notes heard by >= k of the other lists (same pitch, onsets within SUPPORT_TOL) and missing from the base."""
    allr = sorted((p, on, off, j) for j, lst in enumerate(others) for (on, off, p) in lst)
    clusters, cur = [], None
    for p, on, off, j in allr:
        if cur and cur["p"] == p and on - cur["on"] <= SUPPORT_TOL:
            cur["files"].add(j); cur["ons"].append(on); cur["offs"].append(off)
        else:
            cur = {"p": p, "on": on, "files": {j}, "ons": [on], "offs": [off]}; clusters.append(cur)
    byp = {}
    for on, off, p in base:
        byp.setdefault(p, []).append(on)
    for p in byp:
        byp[p].sort()
    extra = []
    for c in clusters:
        if len(c["files"]) < k:
            continue
        on = float(np.median(c["ons"]))
        lst = byp.get(c["p"], [])
        i = bisect.bisect_left(lst, on - SUPPORT_TOL)
        if i < len(lst) and lst[i] <= on + SUPPORT_TOL:
            continue
        extra.append((on, float(np.median(c["offs"])), c["p"]))
    return sorted(base + extra), len(extra)


def place_table(notes, W, capo):
    """ok[n, k, d]: note n can sound on string k (0 = string 6) with open pitch REF[k]+D[d] (plus the capo)."""
    N = len(notes)
    ok = np.zeros((N, 6, len(D)), bool)
    for n, (on, off, p) in enumerate(notes):
        lo, hi = window_at(W, on)
        for k in range(6):
            fr = p - (REF[k] + D + capo)              # fret from the capo, per d
            if lo is None:
                good = (fr >= 0) & (fr <= MAXF - capo)
            else:
                good = (fr == 0) | ((fr >= max(lo, 1)) & (fr <= min(hi, MAXF - capo)))
            ok[n, k] = good
    return ok


def rising_mask():
    g = np.meshgrid(*[np.array(REF[k]) + D for k in range(6)], indexing="ij")
    m = np.ones(g[0].shape, bool)
    for k in range(5):
        m &= g[k] < g[k + 1]
    return m


def single_counts(ok):
    """conflicts[d6,d5,...,d1] = number of notes with no place."""
    cnt = np.zeros((len(D),) * 6, np.int32)
    flat = ok.reshape(len(ok), -1)
    uniq, inv, mult = np.unique(flat, axis=0, return_inverse=True, return_counts=True)
    for u, c in zip(uniq, mult):
        nk = ~u.reshape(6, len(D))
        bad = (nk[0][:, None, None, None, None, None] & nk[1][None, :, None, None, None, None]
               & nk[2][None, None, :, None, None, None] & nk[3][None, None, None, :, None, None]
               & nk[4][None, None, None, None, :, None] & nk[5][None, None, None, None, None, :])
        cnt += c * bad
    return cnt


def onset_groups(notes):
    groups, cur, t0 = [], [], None
    for n, (on, off, p) in enumerate(notes):
        if cur and on - t0 <= GROUP_S:
            if p not in [notes[j][2] for j in cur]:
                cur.append(n)
        else:
            if len(cur) > 1:
                groups.append(cur)
            cur, t0 = [n], on
    if len(cur) > 1:
        groups.append(cur)
    return groups


POP = np.array([bin(i).count("1") for i in range(64)], np.int16)


def group_fails(ok, groups, idx):
    """idx: (K, 6) d-indices of K tunings. Returns (K,) number of failing groups and, per group, a (K,) bool."""
    K = len(idx)
    # mask[n, K]: 6-bit set of strings where note n can sound
    fails = np.zeros(K, np.int32)
    per = []
    bits = (1 << np.arange(6)).astype(np.uint8)
    for g in groups:
        masks = np.zeros((len(g), K), np.uint8)
        for a, n in enumerate(g):
            for k in range(6):
                masks[a] |= ok[n, k, idx[:, k]].astype(np.uint8) * bits[k]
        placeable = masks != 0
        bad = np.zeros(K, bool)
        m = len(g)
        for r in range(2, m + 1):
            for sub in itertools.combinations(range(m), r):
                orm = np.zeros(K, np.uint8)
                need = np.zeros(K, np.int16)
                for a in sub:
                    orm |= masks[a]; need += placeable[a]
                bad |= POP[orm] < need
        fails += bad
        per.append(bad)
    return fails, per


def evaluate(notes, W, capo, groups_for=5000, check=None):
    ok = place_table(notes, W, capo)
    groups = onset_groups(notes)
    single = single_counts(ok)
    valid = rising_mask()
    cidx = np.argwhere(valid)                                   # (V, 6) d-indices
    cs = single[valid]
    changed = (D[cidx] != 0).sum(1); dist = np.abs(D[cidx]).sum(1)
    order = np.lexsort((dist, changed, cs))
    top = cidx[order[:groups_for]]
    gf, _ = group_fails(ok, groups, top)
    s_top = cs[order[:groups_for]]
    tot = s_top + gf
    o2 = np.lexsort((dist[order[:groups_for]], changed[order[:groups_for]], tot))
    ranked = top[o2]; rs = s_top[o2]; rg = gf[o2]; rt = tot[o2]
    cutoff = int(cs[order[groups_for - 1]]) if len(order) >= groups_for else None
    res = {"notes": len(notes), "groups": len(groups), "valid_tunings": int(valid.sum()),
           "groups_checked_for": int(len(top)), "singles_cutoff": cutoff, "ranked": ranked, "singles": rs,
           "group_fails": rg, "total": rt, "ok": ok, "group_list": groups}
    best = int(rt[0])
    tied = rt == best
    res["best_total"] = best
    res["tied"] = int(tied.sum())
    nxt = rt[rt > best]
    res["margin"] = (int(nxt.min()) - best) if len(nxt) else None
    if check is not None:
        cd = np.array([[int(np.where(D == (check[k] - REF[k]))[0][0]) for k in range(6)]])
        s = int(single[tuple(cd[0])]); g, _ = group_fails(ok, groups, cd); t = s + int(g[0])
        better = int((rt < t).sum())
        sure = cutoff is None or t <= cutoff
        res["check"] = {"tuning": list(check), "singles": s, "group_fails": int(g[0]), "total": t,
                        "rank": better + 1, "rank_exact": bool(sure), "tied_with": int((rt == t).sum())}
    return res


def conflict_list(notes, ok, groups, d_idx, capo, W, limit=40):
    """The conflicting notes and groups of one tuning (d indices), for the report."""
    out = {"singles": [], "groups": []}
    for n, (on, off, p) in enumerate(notes):
        if not any(ok[n, k, d_idx[k]] for k in range(6)):
            out["singles"].append({"t": round(on, 3), "pitch": p, "name": name(p), "window": window_at(W, on)})
    _, per = group_fails(ok, groups, np.array([d_idx]))
    for g, bad in zip(groups, per):
        if bad[0]:
            out["groups"].append({"t": round(notes[g[0]][0], 3), "pitches": [notes[n][2] for n in g],
                                  "names": [name(notes[n][2]) for n in g], "window": window_at(W, notes[g[0]][0])})
    out["n_singles"] = len(out["singles"]); out["n_groups"] = len(out["groups"])
    out["singles"] = out["singles"][:limit]; out["groups"] = out["groups"][:limit]
    return out


def tuning_of(d_idx):
    return [int(REF[k] + D[d_idx[k]]) for k in range(6)]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("notes"); ap.add_argument("window")
    ap.add_argument("--capo", type=int, required=True)
    ap.add_argument("--centre", required=True, help="the grid's centre: six MIDI numbers, string 6 to 1")
    ap.add_argument("--t0", type=float); ap.add_argument("--t1", type=float)
    ap.add_argument("--tips"); ap.add_argument("--support", nargs="*", default=[])
    ap.add_argument("--min-support", type=int, default=2)
    ap.add_argument("--check"); ap.add_argument("--top", type=int, default=20)
    ap.add_argument("--groups-for", type=int, default=5000)
    ap.add_argument("--tie-max", type=int, default=500, help="with --tips: at most this many tied tunings go to the finger rule")
    ap.add_argument("--json")
    a = ap.parse_args()
    global REF
    REF = [int(x) for x in a.centre.split(",")]
    if len(REF) != 6 or any(REF[k] >= REF[k + 1] for k in range(5)):
        sys.exit("--centre: six rising MIDI numbers, string 6 to 1")
    base = read_notes(a.notes)
    n_extra = 0
    if a.support:
        base, n_extra = add_support(base, [read_notes(f) for f in a.support], a.min_support)
    W = read_window(a.window)
    check = [int(x) for x in a.check.split(",")] if a.check else None
    if check is not None and (len(check) != 6 or any(not (DLO <= check[k] - REF[k] <= DHI) for k in range(6))):
        sys.exit("--check: six MIDI numbers, string 6 to 1, each within the grid")
    first = base[0][0] if base else 0.0
    if a.t0 is not None or a.t1 is not None:
        stretches = [("t%.1f-%.1f" % (a.t0 or 0, a.t1 or 1e9), a.t0 or 0.0, a.t1 if a.t1 is not None else 1e9)]
    else:
        stretches = [("first30", first, first + 30), ("first60", first, first + 60), ("all", 0.0, 1e9)]
    report = {"notes_file": os.path.abspath(a.notes), "window_file": os.path.abspath(a.window), "capo": a.capo,
              "support_files": [os.path.abspath(f) for f in a.support], "support_added": n_extra,
              "rule": {"grid": f"each string centre{DLO}..centre+{DHI}", "centre": REF, "maxf": MAXF, "group_s": GROUP_S,
                       "window": "row nearest the onset; lost -> any fret 0..MAXF-capo; open always allowed"},
              "stretches": []}
    for lab, t0, t1 in stretches:
        notes = [x for x in base if t0 <= x[0] < t1]
        r = evaluate(notes, W, a.capo, a.groups_for, check)
        print(f"== stretch {lab}: {t0:.2f}-{min(t1, base[-1][1]):.2f} s, {r['notes']} notes, {r['groups']} onset groups, "
              f"groups checked for the {r['groups_checked_for']} tunings with fewest singles (singles <= {r['singles_cutoff']})")
        print(f"   best total {r['best_total']}, tied {r['tied']}, margin to the next {r['margin']}")
        rows = []
        for i in range(min(a.top, len(r["ranked"]))):
            t = tuning_of(r["ranked"][i])
            rows.append({"rank": i + 1, "tuning": t, "names": tname(t), "singles": int(r["singles"][i]),
                         "groups": int(r["group_fails"][i]), "total": int(r["total"][i])})
            print(f"   {i+1:3d}  {tname(t):24s} {','.join(map(str, t)):18s} singles {r['singles'][i]:4d}  groups {r['group_fails'][i]:4d}  total {r['total'][i]:4d}")
        tied_t = [tuning_of(r["ranked"][i]) for i in range(r["tied"])]
        per_string = []
        for k in range(6):
            vals = sorted(set(t[k] for t in tied_t))
            per_string.append({"string": 6 - k, "values": vals, "names": [name(v) for v in vals]})
        print("   among the tied: " + "; ".join(f"s{p['string']} {'/'.join(p['names'])}" for p in per_string))
        best_conf = conflict_list(notes, r["ok"], r["group_list"], r["ranked"][0], a.capo, W)
        st = {"label": lab, "t0": t0, "t1": t1, "notes": r["notes"], "groups": r["groups"],
              "groups_checked_for": r["groups_checked_for"], "singles_cutoff": r["singles_cutoff"],
              "best_total": r["best_total"], "tied": r["tied"], "margin": r["margin"], "top": rows,
              "tied_tunings": tied_t[:200], "tied_per_string": per_string, "best_conflicts": best_conf}
        if check is not None:
            c = r["check"]
            c["conflicts"] = conflict_list(notes, r["ok"], r["group_list"],
                                           [int(np.where(D == (check[k] - REF[k]))[0][0]) for k in range(6)], a.capo, W)
            print(f"   check {tname(check)}: singles {c['singles']} groups {c['group_fails']} total {c['total']} "
                  f"rank {c['rank']}{'' if c['rank_exact'] else ' (or lower)'} tied with {c['tied_with']}")
            st["check"] = c
        if a.tips:
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            import fingers
            tips = fingers.read_tips(a.tips)
            pool = tied_t[:a.tie_max]
            champ, log = pool[0], []
            for B in pool[1:]:
                ev = fingers.compare(notes, W, tips, a.capo, champ, B)
                if ev["verdict"] == "B":
                    log.append({"from": champ, "to": B, "favour_from": ev["favour_A"], "favour_to": ev["favour_B"]})
                    champ = B
            beaten_by, n_beats, n_undec = [], 0, 0
            for B in pool:
                if B == champ:
                    continue
                ev = fingers.compare(notes, W, tips, a.capo, champ, B)
                if ev["verdict"] == "B":
                    beaten_by.append({"by": B, "favour_champ": ev["favour_A"], "favour_by": ev["favour_B"]})
                elif ev["verdict"] == "A":
                    n_beats += 1
                else:
                    n_undec += 1
            fr = {"pool": len(pool), "tied": r["tied"], "champion": champ, "names": tname(champ), "switches": log,
                  "champion_beaten_by": beaten_by[:20], "n_beaten_by": len(beaten_by),
                  "champion_beats": n_beats, "champion_undecided": n_undec}
            if check is not None and check != champ:
                ev = fingers.compare(notes, W, tips, a.capo, champ, check)
                fr["champion_vs_check"] = {"favour_champ": ev["favour_A"], "favour_check": ev["favour_B"],
                                           "neutral": ev["neutral"], "verdict": ev["verdict"]}
            print(f"   finger rule over the {len(pool)} tied: {tname(champ)} ({','.join(map(str, champ))}), "
                  f"{len(log)} switches; then it beats {n_beats}, undecided {n_undec}, beaten by {len(beaten_by)}")
            if "champion_vs_check" in fr:
                c = fr["champion_vs_check"]
                print(f"   finger rule, champion vs check: {c['favour_champ']} : {c['favour_check']} -> {c['verdict']}")
            st["finger_rule"] = fr
        report["stretches"].append(st)
    if a.json:
        json.dump(report, open(a.json, "w"), indent=1)


if __name__ == "__main__":
    main()
