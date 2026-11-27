#!/usr/bin/env python3
"""validate.py <pack_dir> [--json]: checks a writer's (or reviser's) bar.json, lessons.json and revisit.json exactly as
the driver does. Prints OK or every problem; exit 0 = the bar is accepted, 1 = rejected (lessons and revisit items that
do not fit their schema are only warned about and dropped).

bar.json  {"unit": i, "notes": [{"id": <candidate id or "new">, "onset", "offset", "pitch", "string", "fret",
           "confidence", "why"?, "place_why"?}], "drops": [{"id", "why"}], "confidence": 0..1, "recognised": "no" | text}
rules: pitch = tuning[6 - string] + capo + fret (fret from the capo, 0..max); strings distinct within an onset group
(onsets within 35 ms); onsets inside the unit; each candidate id at most once; every base candidate and every candidate
two or more models hold is kept or dropped (a drop of a 2+ model note needs a why); a new note needs a why; a place
other than the solver's choice, or a fretted place outside the window, needs a place_why; with the notes given, nothing
is dropped or added.
also: a note may not start on a string that an earlier note of the unit still rings on (its offset more than 35 ms after
the new onset) unless the later note says "repluck": true (the string is struck again: the earlier note stops there, and
the driver cuts its offset); a kept candidate's onset moves at most 30 ms (more is a drop plus a new note); with the notes
given (L1) a note's pitch and onset are the given ones, why or not; two notes of one pitch within 35 ms (a unison
duplicate on two strings) are rejected."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import GROUP_S, rj, maxfret

MOVE_S = 0.030      # a kept candidate's onset may move this far
RING_S = GROUP_S    # an earlier note on the same string "still rings" when its offset is this far past the new onset

HABIT_KINDS = {"invents", "misses", "wrong-pitch", "late", "early", "split", "merged"}
PLAYER_KINDS = {"let-ring", "thumb-over", "tap", "slap", "slide", "hammer-on", "pull-off", "harmonic", "bend",
                "muted", "other"}


def num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def validate_bar(bar, unit, ucands, rows, cfg, tuning, wins):
    """wins: id -> (lo, hi) or None. rows: solver rows by id (choice). Returns (errors, warnings)."""
    E, Wn = [], []
    if not isinstance(bar, dict) or not isinstance(bar.get("notes"), list):
        return ["bar.json must be an object with a list 'notes'"], []
    capo = int(cfg["capo"]); mf = maxfret(cfg); given = cfg.get("notes") == "given"
    t0, t1 = unit["t0"], unit["t1"]
    cid = {c["id"]: c for c in ucands}
    seen = set()
    ok_notes = []
    for k, n in enumerate(bar["notes"]):
        tag = f"note {k + 1}"
        if not isinstance(n, dict):
            E.append(f"{tag}: not an object"); continue
        miss = [f for f in ("id", "onset", "offset", "pitch", "string", "fret", "confidence") if f not in n]
        if miss:
            E.append(f"{tag}: missing {', '.join(miss)}"); continue
        if not all(num(n[f]) for f in ("onset", "offset", "pitch", "string", "fret", "confidence")):
            E.append(f"{tag}: onset, offset, pitch, string, fret, confidence must be numbers"); continue
        tag = f"note {k + 1} (id {n['id']}, {n['onset']:.3f} s, pitch {n['pitch']})"
        s, f, p = int(n["string"]), int(n["fret"]), int(n["pitch"])
        if s != n["string"] or f != n["fret"] or p != n["pitch"]:
            E.append(f"{tag}: string, fret and pitch must be whole numbers")
        if not 1 <= s <= 6:
            E.append(f"{tag}: string {s} is not 1..6"); continue
        if not 0 <= f <= mf:
            E.append(f"{tag}: fret {f} is not 0..{mf} (frets count from the capo)"); continue
        if tuning[6 - s] + capo + f != p:
            E.append(f"{tag}: string {s} fret {f} sounds {tuning[6 - s] + capo + f}, not {p} "
                     f"(pitch = open string {tuning[6 - s]} + capo {capo} + fret)")
        if n["offset"] <= n["onset"]:
            E.append(f"{tag}: offset must be after onset")
        if not (t0 - 0.03 <= n["onset"] < t1 + 0.03):
            E.append(f"{tag}: onset outside this unit ({t0:.3f}-{t1:.3f} s); notes of the context belong to other units")
        if not 0 <= n["confidence"] <= 1:
            E.append(f"{tag}: confidence must be 0..1")
        why = str(n.get("why") or "").strip(); pwhy = str(n.get("place_why") or "").strip()
        if n["id"] == "new":
            if given:
                E.append(f"{tag}: the notes are given in this run: no new notes")
            elif not why:
                E.append(f"{tag}: a new note needs a 'why' (its onset seen in the sound)")
        else:
            try:
                i = int(n["id"])
            except (TypeError, ValueError):
                E.append(f"{tag}: id must be a candidate id of this unit or \"new\""); continue
            if i not in cid:
                E.append(f"{tag}: id {i} is not a candidate of this unit"); continue
            if i in seen:
                E.append(f"{tag}: candidate {i} used twice")
            seen.add(i)
            if given and p != cid[i]["pitch"]:
                E.append(f"{tag}: the notes are given in this run: candidate {i}'s pitch is {cid[i]['pitch']} and cannot change")
            elif p != cid[i]["pitch"] and not why:
                E.append(f"{tag}: candidate {i} is {cid[i]['pitch']}; a changed pitch needs a 'why'")
            if given and abs(float(n["onset"]) - cid[i]["onset"]) > 0.001:
                E.append(f"{tag}: the notes are given in this run: candidate {i}'s onset is {cid[i]['onset']:.4f} s and "
                         f"cannot change")
            elif abs(float(n["onset"]) - cid[i]["onset"]) > MOVE_S:
                E.append(f"{tag}: candidate {i} starts at {cid[i]['onset']:.3f} s; a kept candidate may move at most "
                         f"{int(MOVE_S * 1000)} ms: drop it and add a \"new\" note at the other onset (with its why)")
            if given and abs(float(n["offset"]) - cid[i]["offset"]) > 0.005:
                Wn.append(f"{tag}: the given offset is {cid[i]['offset']:.3f} s (kept in the tab as given)")
            ch = rows.get(i, {}).get("choice") if rows.get(i, {}).get("solved") else None
            if ch and (s, f) != tuple(ch) and not pwhy:
                E.append(f"{tag}: {s}:{f} is not the solver's choice {ch[0]}:{ch[1]}: give a 'place_why'")
        w = wins.get(n["id"]) if n["id"] != "new" else wins.get(("t", round(n["onset"], 2)))
        if f > 0 and w is not None and not (w[0] <= f <= w[1]) and not pwhy:
            E.append(f"{tag}: fret {f} is outside the hand window {w[0]}-{w[1]}: give a 'place_why' (stretch, thumb, "
                     f"tap, a hand the tool lost...)")
        ok_notes.append(n)
    # strings distinct within an onset group
    ns = sorted([n for n in ok_notes if num(n.get("onset"))], key=lambda n: n["onset"])
    grp = []
    for n in ns + [None]:
        if n is None or (grp and n["onset"] - grp[0]["onset"] > GROUP_S):
            ss = [int(x["string"]) for x in grp]
            if len(ss) != len(set(ss)):
                E.append(f"two notes on one string in the group at {grp[0]['onset']:.3f} s (strings {sorted(ss)})")
            grp = []
        if n is not None:
            grp.append(n)
    # a unison duplicate: one pitch twice within an onset group
    for x in range(len(ns)):
        for y in range(x + 1, len(ns)):
            if ns[y]["onset"] - ns[x]["onset"] > GROUP_S:
                break
            if int(ns[x]["pitch"]) == int(ns[y]["pitch"]):
                E.append(f"pitch {int(ns[x]['pitch'])} twice within {int(GROUP_S * 1000)} ms ({ns[x]['onset']:.3f} s "
                         f"string {ns[x]['string']}, {ns[y]['onset']:.3f} s string {ns[y]['string']}): one note, keep one")
    # a string that still rings: a later onset on it stops the earlier note, which is a re-pluck only if said so
    for y in range(len(ns)):
        for x in range(y):
            m, n = ns[x], ns[y]
            if int(m["string"]) != int(n["string"]) or n["onset"] - m["onset"] <= GROUP_S:
                continue
            if num(m.get("offset")) and m["offset"] > n["onset"] + RING_S and n.get("repluck") is not True:
                E.append(f"note id {n['id']} ({n['onset']:.3f} s, pitch {int(n['pitch'])}) is on string {int(n['string'])}, "
                         f"which still rings id {m['id']} (pitch {int(m['pitch'])}, {m['onset']:.3f}-{m['offset']:.3f} s): "
                         f"put one of them on another string, or give the later note \"repluck\": true if the string is "
                         f"struck again (the earlier note then stops at {n['onset']:.3f} s)")
    # drops
    drops = bar.get("drops", [])
    if not isinstance(drops, list):
        E.append("'drops' must be a list"); drops = []
    dropped = {}
    for d in drops:
        try:
            dropped[int(d["id"])] = str(d.get("why") or "").strip()
        except (TypeError, ValueError, KeyError):
            E.append(f"drop {d!r}: needs a candidate 'id'")
    for i in dropped:
        if i not in cid:
            E.append(f"drop of {i}: not a candidate of this unit")
        elif i in seen:
            E.append(f"candidate {i} is both kept and dropped")
        elif given:
            E.append(f"candidate {i}: the notes are given in this run: place every one, drop none")
        elif cid[i]["n_sup"] >= 2 and not dropped[i]:
            E.append(f"drop of {i} ({cid[i]['n_sup']} models hold it) needs a 'why'")
    for c in ucands:
        if (c["base"] or c["n_sup"] >= 2) and c["id"] not in seen and c["id"] not in dropped:
            E.append(f"candidate {c['id']} ({c['onset']:.3f} s, pitch {c['pitch']}, {c['supporters']}) is neither kept "
                     f"nor dropped")
    if not num(bar.get("confidence")) or not 0 <= bar.get("confidence", -1) <= 1:
        E.append("'confidence' (the unit's, 0..1) is missing")
    if not isinstance(bar.get("recognised"), str):
        E.append("'recognised' is missing: \"no\", or what you think the piece is")
    return E, Wn


def clean_lessons(L, i):
    """Keeps the items that fit the schema; returns (lessons, warnings)."""
    W = []
    if not isinstance(L, dict):
        return {}, ["lessons.json is not an object: ignored"]
    out = {}
    tl = []
    for x in L.get("tuning", []) or []:
        if isinstance(x, dict) and num(x.get("string")) and 1 <= x["string"] <= 6 and num(x.get("pitch")) \
                and isinstance(x.get("agrees"), bool):
            tl.append({"string": int(x["string"]), "pitch": int(x["pitch"]), "agrees": x["agrees"],
                       "seen": str(x.get("seen", ""))[:200]})
        else:
            W.append(f"lessons.tuning item dropped: {str(x)[:80]}")
    out["tuning"] = tl
    sh = []
    for x in L.get("shapes", []) or []:
        try:
            pit = [int(p) for p in x["pitches"]]; pl = [[int(a), int(b)] for a, b in x["places"]]
            assert len(pit) == len(pl) and len(pit) >= 2
            sh.append({"pitches": pit, "places": pl, "t": float(x.get("t", 0)), "seen": bool(x.get("seen", False))})
        except Exception:
            W.append(f"lessons.shapes item dropped: {str(x)[:80]}")
    out["shapes"] = sh
    h = L.get("hand")
    if isinstance(h, dict):
        out["hand"] = {"window_ok": bool(h.get("window_ok", True)), "fix": str(h.get("fix", ""))[:200]}
        for k in ("lo", "hi"):
            if num(h.get(k)): out["hand"][k] = int(h[k])
    mh = []
    for x in L.get("model_habits", []) or []:
        if isinstance(x, dict) and isinstance(x.get("model"), str) and x.get("kind") in HABIT_KINDS:
            eu = [int(u) for u in x.get("earlier_units", []) or [] if num(u) and 0 <= u < i]
            mh.append({"model": x["model"], "kind": x["kind"], "where": str(x.get("where", ""))[:60],
                       "count": int(x["count"]) if num(x.get("count")) and x["count"] > 0 else 1, "earlier_units": eu})
        else:
            W.append(f"lessons.model_habits item dropped (kind must be one of {sorted(HABIT_KINDS)}): {str(x)[:80]}")
    out["model_habits"] = mh
    ph = []
    for x in L.get("player_habits", []) or []:
        if isinstance(x, dict) and x.get("kind") in PLAYER_KINDS:
            ph.append({"kind": x["kind"], "t": float(x["t"]) if num(x.get("t")) else None, "note": str(x.get("note", ""))[:120]})
        else:
            W.append(f"lessons.player_habits item dropped (kind must be one of {sorted(PLAYER_KINDS)}): {str(x)[:80]}")
    out["player_habits"] = ph
    r = L.get("repeat_of")
    if isinstance(r, dict) and num(r.get("unit")) and 0 <= r["unit"] < i:
        out["repeat_of"] = {"unit": int(r["unit"]), "differs": str(r.get("differs", ""))[:200]}
    return out, W


def clean_revisit(R, i):
    W, out = [], []
    items = R.get("revisit", []) if isinstance(R, dict) else (R if isinstance(R, list) else [])
    for x in items:
        if isinstance(x, dict) and num(x.get("unit")) and 0 <= x["unit"] < i and str(x.get("why", "")).strip():
            out.append({"unit": int(x["unit"]), "why": str(x["why"])[:300]})
        else:
            W.append(f"revisit item dropped (needs an earlier unit and a why): {str(x)[:80]}")
    return out, W


def check_pack(pack, bar_path=None):
    """Loads the pack's context (unit.json, candidates via the run) and validates its outputs."""
    meta = rj(os.path.join(pack, "unit.json"))
    blind = meta["blind"]; i = meta["i"]
    if not os.path.isdir(os.path.join(blind, "inputs")):   # a pack moved out of its per-call folder (state off)
        blind = os.path.dirname(os.path.abspath(pack))
    from solve import load_run
    cfg, units, cands = load_run(blind)
    tuning = meta["tuning"]
    ucands = [c for c in cands if units[i]["t0"] <= c["onset"] < units[i]["t1"]]
    rows = {r["id"]: r for r in rj(os.path.join(pack, "solver.json"))["rows"]}
    wins = {}
    from common import Window
    wp = os.path.join(blind, "inputs", "hand", "hand_window.csv")
    Wc = Window(wp) if cfg.get("hand") != "off" and os.path.exists(wp) else None
    for c in ucands:
        wins[c["id"]] = Wc.at(c["onset"]) if Wc else None
    errs, warns = [], []
    bp = bar_path or os.path.join(pack, "bar.json")
    try:
        bar = json.load(open(bp))
    except FileNotFoundError:
        return ["bar.json is missing"], [], None
    except json.JSONDecodeError as e:
        return [f"bar.json is not valid JSON: {e}"], [], None
    if Wc:
        for n in bar.get("notes", []) if isinstance(bar, dict) else []:
            if isinstance(n, dict) and n.get("id") == "new" and num(n.get("onset")):
                wins[("t", round(n["onset"], 2))] = Wc.at(n["onset"])
    e, w = validate_bar(bar, units[i], ucands, rows, cfg, tuning, wins)
    errs += e; warns += w
    for fn, f in (("lessons.json", clean_lessons), ("revisit.json", clean_revisit)):
        p = os.path.join(pack, fn)
        if os.path.exists(p):
            try:
                _, w = f(json.load(open(p)), i); warns += w
            except json.JSONDecodeError as ex:
                warns.append(f"{fn} is not valid JSON ({ex}): it will be ignored")
        else:
            warns.append(f"{fn} is missing (an empty one is fine)")
    return errs, warns, bar


if __name__ == "__main__":
    pack = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else ".")
    vp = os.path.join(pack, "verdict.json")
    if os.path.exists(vp):
        try:
            v = json.load(open(vp))
        except json.JSONDecodeError as ex:
            print("ERROR: verdict.json is not valid JSON:", ex); sys.exit(1)
        if v.get("action") not in ("keep", "rewrite") or not str(v.get("why", "")).strip():
            print('ERROR: verdict.json needs {"action": "keep" or "rewrite", "why": "..."}'); sys.exit(1)
        if v["action"] == "keep":
            print("OK: verdict keep (the unit stays as it is)"); sys.exit(0)
    errs, warns, bar = check_pack(pack)
    for w in warns:
        print("warning:", w)
    for e in errs:
        print("ERROR:", e)
    if not errs:
        print(f"OK: bar.json is accepted ({len(bar['notes'])} notes, {len(bar.get('drops', []))} drops)")
    sys.exit(1 if errs else 0)
