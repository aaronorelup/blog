#!/usr/bin/env python3
"""w2.py <run_dir> [--minutes 90] [--prepare-only] [--finish-only]

E5's W2: one blind session gets L2's whole-song inputs (run prepared by prep.py with --notes l2) and 90 minutes, and
writes the whole tab at once. Prepares <blind>/w2/ (PACK.md; candidates.csv with every note's places, window and the
solver's choice over the whole song; the tools unitpack.sh and check_answer.sh next to the unit tools), runs one
blind_run.sh call there (effort max, hard limit minutes + 5), then finishes: fills the answer's placeholders (beats,
downbeats, tempo, key, chords), validates it (validate_answer.py), writes <run_dir>/answer.json, answer.gp5,
units_log.jsonl (one row: wall time, tokens, list cost) and audit.json. Never reads a key or a score."""
import argparse, csv, json, os, statistics, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import LOOP, KIT, G, rj, wj, name, append_jsonl
from solve import load_run, solve_unit
import make_tools, audit_unit

if len(sys.argv) >= 3 and sys.argv[1] == "--check":
    from common import GROUP_S
    errs = []
    try:
        A = json.load(open(sys.argv[2]))
    except Exception as e:
        sys.exit(f"ERROR: cannot read {sys.argv[2]}: {e}")
    c = rj(os.path.join(sys.argv[3], "inputs", "config.json"))
    tun, capo = A.get("tuning_midi"), A.get("capo")
    if tun != c["tuning_midi"] or capo != c["capo"]:
        errs.append(f"tuning_midi must be {c['tuning_midi']} and capo {c['capo']} (given)")
    ns = A.get("notes")
    if not isinstance(ns, list) or not ns:
        errs.append("notes: a non-empty list is needed"); ns = []
    ok = []
    for k, n in enumerate(ns):
        try:
            on, off, p, st, f = float(n["onset"]), float(n["offset"]), int(n["pitch"]), int(n["string"]), int(n["fret"])
        except Exception:
            errs.append(f"note {k + 1}: needs onset, offset, pitch, string, fret"); continue
        if not (1 <= st <= 6) or f < 0 or c["tuning_midi"][6 - st] + c["capo"] + f != p:
            errs.append(f"note {k + 1} ({on:.3f} s): string {st} fret {f} does not sound pitch {p}")
        if not (0 <= on < off and on < c["duration_s"]):
            errs.append(f"note {k + 1} ({on:.3f} s): times must satisfy 0 <= onset < offset, onset inside the recording")
        ok.append((on, st))
    ok.sort(); grp = []
    for x in ok + [None]:
        if x is None or (grp and x[0] - grp[0][0] > GROUP_S):
            ss = [s for _, s in grp]
            if len(ss) != len(set(ss)): errs.append(f"two notes on one string at {grp[0][0]:.3f} s")
            grp = []
        if x is not None: grp.append(x)
    for e in errs[:30]: print("ERROR:", e)
    print(f"OK: {len(ns)} notes" if not errs else f"REJECTED: {len(errs)} problems")
    sys.exit(1 if errs else 0)

ap = argparse.ArgumentParser()
ap.add_argument("run_dir"); ap.add_argument("--minutes", type=float, default=90.0)
ap.add_argument("--prepare-only", action="store_true"); ap.add_argument("--finish-only", action="store_true")
a = ap.parse_args()
run = os.path.abspath(a.run_dir); R = rj(os.path.join(run, "run.json")); blind = R["blind_dir"]
cfg, units, cands = load_run(blind)
W = os.path.join(blind, "w2"); T = os.path.join(blind, "tools"); I = os.path.join(blind, "inputs")
hand = cfg.get("hand") != "off"

if not a.finish_only:
    make_tools.make(blind)
    os.makedirs(W, exist_ok=True)
    # the solver over the whole song, unit by unit with its own previous choices as context
    tab, rows = [], []
    for u in units:
        o = solve_unit(blind, u["i"], tab_notes=tab, cfg=cfg, units=units, cands=cands)
        for r in o["rows"]:
            r["unit"] = u["i"]; rows.append(r)
            if r["solved"] and r["choice"]:
                tab.append({"onset": r["onset"], "offset": r["offset"], "pitch": r["pitch"], "string": r["choice"][0],
                            "fret": r["choice"][1]})
    with open(os.path.join(W, "candidates.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["unit", "id", "onset", "offset", "pitch", "name", "supporters", "n_sup", "base", "window", "places",
                    "solver", "next_best", "flags"])
        for r in rows:
            inw = [tuple(x) for x in r["in_window"]]
            w.writerow([r["unit"], r["id"], f"{r['onset']:.3f}", f"{r['offset']:.3f}", r["pitch"], r["name"], r["supporters"],
                        r["n_sup"], r["base"], r["window"],
                        " ".join(f"{s}:{f}" + ("" if (s, f) in inw else "*") for s, f in map(tuple, r["places"])),
                        (f"{r['choice'][0]}:{r['choice'][1]}" if r["choice"] else "") + ("" if r["solved"] else "?"),
                        " ".join(f"{s}:{f}" + (f"(+{d})" if d is not None else "") for s, f, d in r["alts"][:3]),
                        ",".join(r["flags"])])
    tp = cfg["tuning_midi"]
    open(os.path.join(W, "PACK.md"), "w").write("\n".join([
        "# The whole recording", "",
        f"- {cfg['duration_s']:.1f} s; {len(units)} units (bars from a beat tracker; inputs/units.json: i, t0, t1).",
        f"- Capo: fret {cfg['capo']}; frets everywhere count FROM THE CAPO. Tuning, string 6 to 1: "
        f"{' '.join(name(p) for p in tp)} = MIDI {tp}; pitch = open + capo + fret.",
        f"- candidates.csv: {len(rows)} candidates: unit, id, onset, offset, pitch, name, supporters (bp, gaps, fl, tk, mt3 = "
        "five note models), n_sup, base (1 = the base reading), window (lo-hi at the onset; 'lost' = no constraint), places "
        "(* = outside the window), solver (its choice; ? = not in its set: the in-window place nearest its hand), "
        "next_best (+ extra path cost), flags.",
        ("- The hand: inputs/hand/hand_window.csv (t, lo, hi, conf, lost; frets from the capo; open strings always "
         "allowed) and the overlay tool." if hand else "- The hand: off in this run."),
        f"- inputs/audio.wav (the sound), {'inputs/video.mp4, ' if hand else ''}inputs/beats.txt (time, beat number; 1 = a bar's first beat).",
        "- The solver's whole tab as a start: solver_tab.json (the base candidates at the solver's choice)."]) + "\n")
    wj(os.path.join(W, "solver_tab.json"), {"tuning_midi": tp, "capo": cfg["capo"], "notes": tab})
    hdr = f"#!/bin/bash\nset -euo pipefail\nB={blind}\n"
    open(os.path.join(T, "unitpack.sh"), "w").write(hdr + f"""# unitpack.sh N : builds unit N's folder (no carried state) and prints its path
[ $# -ge 1 ] || {{ echo "usage: unitpack.sh N"; exit 2; }}
python3 {LOOP}/pack.py $B "$1" --state off --quiet >/dev/null
python3 -c "print('$B/u%03d' % int('$1'))"
""")
    open(os.path.join(T, "check_answer.sh"), "w").write(hdr + f"""# check_answer.sh [answer.json] : checks the notes of your answer (fields, pitch = tuning + capo + fret, one note
# per string at a time, times inside the recording)
python3 {LOOP}/w2.py --check "${{1:-$B/w2/answer.json}}" $B
""")
    for f in ("unitpack.sh", "check_answer.sh"):
        os.chmod(os.path.join(T, f), 0o755)
    print("prepared", W)
    if a.prepare_only:
        sys.exit(0)
    txt = open(os.path.join(LOOP, "W2.md")).read()
    rep = {"W": W, "TOOLS": T, "INPUTS": I, "START": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
           "CAPO": str(cfg["capo"]), "TUNING": " ".join(name(p) for p in tp) + f" (MIDI {tp})",
           "HAND": "the hand-reach window (inputs/hand/) and the video (inputs/video.mp4)." if hand else "no hand information.",
           "NECKPIC": "the neck at its onsets, " if hand else "", "OVERLAY": ", `overlay.sh`" if hand else ""}
    for k, v in rep.items():
        txt = txt.replace("{" + k + "}", v)
    open(os.path.join(W, "PROMPT.txt"), "w").write(txt)
    # sandboxed (sbxcall.py): work folder = the run's blind folder (the W2 session builds unit folders there with
    # unitpack.sh), inputs/ and tools/ read-only, its own process group, pid file <run>/writer.pid, a hard limit
    import signal
    import sbxcall
    sbxcall.kill_leftover(os.path.join(run, "writer.pid"), print)
    def _stop(signum, frame):
        signal.signal(signum, signal.SIG_IGN); raise SystemExit(130)
    for sg in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
        signal.signal(sg, _stop)
    k = 1
    while os.path.exists(os.path.join(sbxcall.TRANSCRIPTS, os.path.basename(run), f"w2.{k}")):
        k += 1
    td = os.path.join(sbxcall.TRANSCRIPTS, os.path.basename(run), f"w2.{k}")
    wj(os.path.join(run, "w2_call.json"), {"td": td, "work": blind, "pack": W, "started": time.strftime("%Y-%m-%dT%H:%M:%SZ")})
    res = sbxcall.run(blind, W, os.path.join(W, "PROMPT.txt"), "w2", "max", td, (a.minutes + 5) * 60,
                      os.path.join(run, "writer.pid"), os.path.join(W, "blind_run.log"), rw=[],
                      ro_extra=[os.path.join(blind, "inputs"), os.path.join(blind, "tools")])
    wj(os.path.join(run, "w2_call.json"), dict(rj(os.path.join(run, "w2_call.json")), **res))
    print("blind run exit", res["rc"], "after", round(res["wall_s"] / 60, 1), "min", "(hard limit)" if res["timed_out"] else "")

# ---- finish
ans = rj(os.path.join(W, "answer.json"), {})
wc = rj(os.path.join(run, "w2_call.json"), {})
import sbxcall
meta = rj(os.path.join(W, "run.meta.json"), {})
tr = sbxcall.find_transcript(wc["td"], meta.get("session_id")) if wc.get("td") else None
au = audit_unit.audit(W, tr, blind); wj(os.path.join(run, "audit_w2.json"), au)
if meta:      # the blind side keeps no outside path
    wj(os.path.join(W, "run.meta.json"), dict(meta, transcript=("<transcripts>/" + os.path.relpath(tr, wc["td"])) if tr else None))
    meta["transcript"] = tr
if wc.get("timed_out"):
    meta["timed_out"] = True
if not meta:
    us = au.get("usage") or {}; tk = us.get("tokens", {})
    meta = {"label": "w2", "exit": None, "timed_out": True, "cost_usd_list": us.get("cost_usd_list"),
            "output_tokens": tk.get("output"), "input_tokens": tk.get("input"), "cache_read": tk.get("cache_read"),
            "cache_write": tk.get("cache_write"), "from_transcript": True}
beats = [(float(l.split()[0]), int(l.split()[1])) for l in open(os.path.join(I, "beats.txt")) if l.strip()]
bt = [t for t, _ in beats]
out = {"tuning_midi": cfg["tuning_midi"], "capo": int(cfg["capo"]), "tuning_offset_cents": 0.0,
       "tempo_bpm": round(60 / statistics.median([y - x for x, y in zip(bt, bt[1:])]), 2), "key": "C major",
       "notes": [dict({k: n[k] for k in ("onset", "pitch", "string", "fret")}, offset=min(n["offset"], cfg["duration_s"]))
                 for n in ans.get("notes", []) if all(k in n for k in ("onset", "offset", "pitch", "string", "fret"))],
       "beats": bt, "downbeats": [t for t, b in beats if b == 1],
       "chords": [{"start": 0.0, "end": float(cfg["duration_s"]), "label": "N"}]}
wj(os.path.join(run, "answer.json"), out)
v = subprocess.run(["python3", os.path.join(KIT, "validate_answer.py"), os.path.join(run, "answer.json")], capture_output=True, text=True)
g = subprocess.run([os.path.join(KIT, "answer2gp5.py"), os.path.join(run, "answer.json"), os.path.join(run, "answer.gp5")],
                   capture_output=True, text=True)
append_jsonl(os.path.join(run, "units_log.jsonl"), {"unit": "all", "kind": "w2", "wall_s": meta.get("wall_s"),
             "cost_usd_list": meta.get("cost_usd_list"), "tokens": {"input": meta.get("input_tokens"), "output": meta.get("output_tokens"),
             "cache_read": meta.get("cache_read"), "cache_write": meta.get("cache_write")}, "num_turns": meta.get("num_turns"),
             "timed_out": meta.get("timed_out", False), "audit": {"void": au.get("void"), "warn": (au.get("warn") or [])[:8]},
             "notes": len(out["notes"]), "recognised": ans.get("recognised")})
print("answer:", len(out["notes"]), "notes;", (v.stdout.strip().splitlines() or ["?"])[-1][:100], "; gp5", g.returncode)
