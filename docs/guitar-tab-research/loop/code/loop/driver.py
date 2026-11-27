#!/usr/bin/env python3
"""driver.py <run_dir> [--restart-from N] [--to N] [--revisits on|off] [--state on|off] [--void-policy stop|restart]
                       [--hard-min 15] [--effort max] [--no-answer] [--fake [--fake-sleep S]] [--test-void-at N]

Runs the loop of LOOP-DESIGN.md on a run prepared by prep.py. For each unit in order: a snapshot of state.json, tab.json,
changes.jsonl and progress.json as they were (<run>/snapshots/uNNN/), pack.py, one blind Opus call through
sandbox_run.sh (sbxcall.py: its own session and process group, pid file <run>/writer.pid, hard limit --hard-min, the
work folder read-only except the call's folder), the audit of its transcript, validation (a rejected bar is asked again
once with the errors shown, then the solver's proposal stands in), the merge into tab.json, the lessons into state.json
by rule, revisits by the five triggers (plus the writer's own revisit.json), every change to changes.jsonl and every
call to units_log.jsonl (exactly once per call: rows are keyed by call id).

Safety (LOOP-REVIEW.md): the blind folder must hold no hard link (checked at start: st_nlink = 1 for every file); every
writer, reviser and tuner call is sandboxed (transcripts in G/transcripts/<run name>/<call id>/); a call whose audit says
VOID stops the driver (exit 3, <run>/VOID.json) unless --void-policy restart, which restarts once from the snapshot
taken before that unit's round and stops if it is void again. --restart-from N restores the snapshot taken before unit N,
moves every folder made since out of the blind folder (to <run>/voided/fromNNN.<T>/) and goes on from unit N. A signal
(TERM, INT, HUP) kills the running call's process group before the driver exits; a restart first kills a call left in
writer.pid, audits it and logs its cost (from its transcript when run.json is missing). Each apply (merge, lessons,
changes, the cost row, the queue) is one transaction: a kill in its middle is rolled back at the next start (the unit's
snapshot, or <run>/snapshots/apply/ for a revisit or tuning review), so lessons merge and costs log exactly once. A call
that finished, or was killed by the hard limit, and left a valid bar is reused after a restart, not paid again.

--state off (E6): every call runs in a fresh per-call folder G/loop/bw/<id>.solo/ that holds only that unit's pack, a
copy of the inputs without similar.json, the tools and an empty state (the tuning only): no other unit's folder, no
finished tab (for a revisit: only that unit's own notes). unit_conf and unsure are still kept, on the driver side, from
each unit's own confidence, so revisit triggers 3 and 5 fire as in L2. --revisits off runs none (every trigger is logged
as skipped). It never reads a key or a score. At the end it writes answer.json and answer.gp5 from the tab so far."""
import argparse, fcntl, json, os, re, shutil, signal, subprocess, sys, time
from datetime import datetime, timezone
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (G, LOOP, KIT, GROUP_S, rj, wj, append_jsonl, read_jsonl, unit_dir, groups, name, Window)
from solve import load_run, solve_unit
import pack as PK
import validate as VA
import make_tools
import audit_unit
import sbxcall

EMPTY_STATE = {"shape_book": [], "hand": {}, "model_habits": {}, "player_habits": {}, "repeats": [], "unsure": [],
               "unit_conf": {}, "units_done": 0}
MAX_REV_PER_UNIT = 2      # a unit is opened again at most twice in a run (tuning re-placing excepted)
MAX_REV_PER_ROUND = 4     # at most this many revisits after any one unit; the rest wait for the next round, never dropped
CONFLICT_UNITS = 3        # L3: a string is reviewed after conflicts in this many units with no support
KEEP_PROG = ("calls", "restarts")   # progress keys that survive a restore


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Stop(Exception):
    pass


class VoidHit(Exception):
    def __init__(self, round_unit, rec):
        super().__init__(f"void call {rec.get('call_id')} in the round of unit {round_unit}")
        self.round_unit, self.rec = round_unit, rec


class Driver:
    def __init__(self, a):
        self.a = a
        self.run = os.path.abspath(a.run_dir)
        self.name = os.path.basename(self.run)
        self.R = rj(os.path.join(self.run, "run.json"))
        self.blind = self.R["blind_dir"]
        self.solo = self.blind.rstrip("/") + ".solo"
        self.log_p = os.path.join(self.run, "driver.log")
        self.lock = open(os.path.join(self.run, "driver.lock"), "w")
        try:
            fcntl.flock(self.lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            sys.exit(f"another driver is running on {self.run} (driver.lock is held)")
        wj(os.path.join(self.run, "driver.pid"), {"pid": os.getpid(), "pgid": os.getpgid(0), "started": now()})
        self.cfg, self.units, self.cands = load_run(self.blind)
        self.cid = {c["id"]: c for c in self.cands}
        self.check_links()
        make_tools.make(self.blind)
        self.check_names()
        self.prog_p = os.path.join(self.run, "progress.json")
        self.prog = rj(self.prog_p, {})
        for k, v in {"done": [], "queue": [], "revisits": {}, "last_sweep": -1, "calls": 0, "tuning_done": [],
                     "round": {"after": -1, "ran": 0}, "restarts": []}.items():
            self.prog.setdefault(k, v)
        self.vr_p = os.path.join(self.run, "void_restarts.json")      # survives every restore
        self.pid_p = os.path.join(self.run, "writer.pid")
        self.infl_p = os.path.join(self.run, "inflight.json")
        self.calls_d = os.path.join(self.run, "calls"); os.makedirs(self.calls_d, exist_ok=True)
        self.td_root = os.path.join(sbxcall.TRANSCRIPTS, self.name)
        self.logged = {r.get("call_id") for r in read_jsonl(os.path.join(self.run, "units_log.jsonl")) if r.get("call_id")}
        wp = os.path.join(self.blind, "inputs", "hand", "hand_window.csv")
        self.W = Window(wp) if self.cfg.get("hand") != "off" and os.path.exists(wp) else None
        self.templates = {k: open(os.path.join(LOOP, f"{k}.md")).read() for k in ("WRITER", "REVISER", "TUNER")}
        if not os.path.exists(os.path.join(self.blind, "tab.json")):
            self.save_tab(self.tab())
        for s in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
            signal.signal(s, self.on_signal)

    # ------------------------------------------------------------------ files
    def log(self, msg):
        line = f"{now()} {msg}"
        print(line, flush=True)
        with open(self.log_p, "a") as fh:
            fh.write(line + "\n")

    def on_signal(self, signum, frame):
        signal.signal(signum, signal.SIG_IGN)
        raise Stop(signal.Signals(signum).name)

    def test_stop(self, tag):
        """Test hook: LOOP_TEST_STOP=<tag> stops the driver at that point (as a kill there would), once."""
        if os.environ.get("LOOP_TEST_STOP") == tag and not os.path.exists(os.path.join(self.run, f"test_stop_used.{tag}")):
            open(os.path.join(self.run, f"test_stop_used.{tag}"), "w").write(now())
            raise Stop(f"test stop at {tag}")

    def check_links(self):
        """The blind folder must share no inode with anything (a hard link names the original under find -samefile)."""
        bad = []
        for dp, dns, fs in os.walk(self.blind):
            for f in fs + [d for d in dns if os.path.islink(os.path.join(dp, d))]:
                p = os.path.join(dp, f)
                st = os.lstat(p)
                if os.path.islink(p) or st.st_nlink != 1:
                    bad.append(f"{p} (links {st.st_nlink}{', symlink' if os.path.islink(p) else ''})")
        if bad:
            self.log(f"REFUSED: the blind folder holds {len(bad)} hard or symbolic links: {bad[:4]}; prepare the run again "
                     f"(prep.py copies every file)")
            sys.exit(2)

    def check_names(self):
        """Nothing in the blind folder may name the slot, a song, a player, a key or a source (blindcheck.py, as at the
        end of prep.py): a folder made before that check, or changed since, is refused."""
        import blindcheck
        hits = blindcheck.check(self.blind, extra_slots=blindcheck.heldout_slots(self.R.get("slot")))   # held-out slots: () for dev
        if hits:
            self.log(f"REFUSED: the blind folder names what a writer must not see ({len(hits)} hits: "
                     f"{['%s: %s' % h for h in hits[:4]]}); prepare the run again with prep.py")
            sys.exit(2)

    def state(self):
        return rj(os.path.join(self.blind, "state.json"))

    def save_state(self, st):
        wj(os.path.join(self.blind, "state.json"), st)

    def tab(self):
        return rj(os.path.join(self.blind, "tab.json"), {"tuning_midi": self.cfg["tuning_midi"], "capo": self.cfg["capo"],
                                                          "notes": []})

    def save_tab(self, tb):
        tb["notes"].sort(key=lambda n: (n["onset"], n["pitch"]))
        tb["tuning_midi"] = self.state()["tuning"]["midi"]
        wj(os.path.join(self.blind, "tab.json"), tb)
        wj(os.path.join(self.run, "tab.json"), tb)

    def save_prog(self):
        wj(self.prog_p, self.prog)

    def void_restarts(self):
        return rj(self.vr_p, {})

    # ------------------------------------------------------------------ snapshots and transactions
    def take_snapshot(self, dst, key):
        tmp = dst + ".tmp"
        if os.path.exists(tmp):
            shutil.rmtree(tmp)
        os.makedirs(tmp)
        for src, nm in ((os.path.join(self.blind, "state.json"), "state.json"), (os.path.join(self.blind, "tab.json"), "tab.json"),
                        (os.path.join(self.run, "changes.jsonl"), "changes.jsonl")):
            if os.path.exists(src):
                shutil.copyfile(src, os.path.join(tmp, nm))
        wj(os.path.join(tmp, "progress.json"), self.prog)
        wj(os.path.join(tmp, "meta.json"), {"key": key, "taken": now(), "folders": sorted(os.listdir(self.blind)),
                                            "log_rows": len(read_jsonl(os.path.join(self.run, "units_log.jsonl")))})
        if os.path.exists(dst):
            shutil.rmtree(dst)
        os.rename(tmp, dst)

    def restore_snapshot(self, src):
        for nm, dsts in (("state.json", [os.path.join(self.blind, "state.json")]),
                         ("tab.json", [os.path.join(self.blind, "tab.json"), os.path.join(self.run, "tab.json")])):
            for d in dsts:
                shutil.copyfile(os.path.join(src, nm), d + ".rst"); os.replace(d + ".rst", d)
        ch = os.path.join(self.run, "changes.jsonl")
        if os.path.exists(os.path.join(src, "changes.jsonl")):
            shutil.copyfile(os.path.join(src, "changes.jsonl"), ch + ".rst"); os.replace(ch + ".rst", ch)
        elif os.path.exists(ch):
            os.remove(ch)
        keep = {k: self.prog.get(k) for k in KEEP_PROG}
        self.prog = rj(os.path.join(src, "progress.json"))
        self.prog.update({k: v for k, v in keep.items() if v is not None})
        self.save_prog()

    def begin(self, key):
        """A transaction for a revisit or a tuning review (a unit's own is its snapshot)."""
        self.take_snapshot(os.path.join(self.run, "snapshots", "apply"), key)

    def commit(self, key):
        self.prog.setdefault("applied", [])
        if key not in self.prog["applied"]:
            self.prog["applied"].append(key)
        self.save_prog()
        ap = os.path.join(self.run, "snapshots", "apply")
        if os.path.exists(ap):
            shutil.rmtree(ap)
        if os.path.exists(self.infl_p):
            os.remove(self.infl_p)

    def rollback_apply(self):
        ap = os.path.join(self.run, "snapshots", "apply")
        if not os.path.exists(os.path.join(ap, "meta.json")):
            return
        key = rj(os.path.join(ap, "meta.json"))["key"]
        if key in self.prog.get("applied", []):
            self.log(f"transaction {key} was committed before the stop; dropping its snapshot")
        else:
            self.restore_snapshot(ap)
            self.log(f"transaction {key} was cut off; state, tab, changes and progress rolled back to before it")
        shutil.rmtree(ap)

    def move_out(self, path, where):
        """Moves a folder out of the blind folder (where = 'aborted' or a voided dir) so no later writer can read it."""
        d = where if os.path.isabs(where) else os.path.join(self.run, where)
        os.makedirs(d, exist_ok=True)
        dst = os.path.join(d, os.path.basename(path.rstrip("/")) + f".{int(time.time())}")
        shutil.move(path, dst)
        return dst

    def restart_from(self, N, why):
        snap = os.path.join(self.run, "snapshots", f"u{N:03d}")
        if not os.path.exists(os.path.join(snap, "meta.json")):
            self.log(f"REFUSED: no snapshot before unit {N} ({snap}); a run started before snapshots existed cannot "
                     f"restart there"); sys.exit(2)
        meta = rj(os.path.join(snap, "meta.json"))
        stamp = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
        vd = os.path.join(self.run, "voided", f"from{N:03d}.{stamp}")
        os.makedirs(os.path.join(vd, "blind"), exist_ok=True)
        keep = set(meta["folders"]) | {"inputs", "tools", "state.json", "tab.json"}
        moved = []
        for f in sorted(os.listdir(self.blind)):
            if f not in keep:
                shutil.move(os.path.join(self.blind, f), os.path.join(vd, "blind", f)); moved.append(f)
        for src, nm in ((os.path.join(self.blind, "state.json"), "state.json"), (os.path.join(self.blind, "tab.json"), "tab.json"),
                        (os.path.join(self.run, "changes.jsonl"), "changes.jsonl"), (self.prog_p, "progress.json")):
            if os.path.exists(src):
                shutil.copyfile(src, os.path.join(vd, nm))
        for f in sorted(os.listdir(os.path.join(self.run, "snapshots"))):
            m = re.match(r"u(\d{3})$", f)
            if (m and int(m.group(1)) > N) or f == "apply":
                os.makedirs(os.path.join(vd, "snapshots"), exist_ok=True)
                shutil.move(os.path.join(self.run, "snapshots", f), os.path.join(vd, "snapshots", f))
        if os.path.exists(self.solo):
            shutil.rmtree(self.solo)
        self.restore_snapshot(snap)
        # units_log: the rows made since the snapshot are marked voided (their cost was paid and stays counted)
        lp = os.path.join(self.run, "units_log.jsonl")
        rows = read_jsonl(lp); nv = 0
        for k, r in enumerate(rows):
            if k >= meta.get("log_rows", 0) and not r.get("voided"):
                r["voided"] = f"from{N:03d}.{stamp}"; nv += 1
        with open(lp + ".rst", "w") as fh:
            fh.writelines(json.dumps(r) + "\n" for r in rows)
        os.replace(lp + ".rst", lp)
        if os.path.exists(self.infl_p):
            os.remove(self.infl_p)
        self.prog["restarts"].append({"t": now(), "from": N, "why": why, "voided": vd, "folders": moved})
        self.save_prog()
        append_jsonl(lp, {"t": now(), "unit": N, "kind": "restart-from", "call_id": f"restart.{stamp}", "why": why,
                          "moved_out": moved, "rows_voided": nv, "voided_dir": vd})
        self.log(f"restart from unit {N} ({why}): state, tab, changes and progress as they were before unit {N}; "
                 f"{len(moved)} folders moved out of the blind folder to {vd}; {nv} log rows marked voided")

    # ------------------------------------------------------------------ prompts
    def fill(self, kind, P, extra=None, tools=None, inputs=None):
        hand = self.cfg.get("hand") != "off"
        given = self.cfg.get("notes") == "given"
        tun_given = self.state()["tuning"].get("given", True)
        u = rj(os.path.join(P, "unit.json"))
        rep = {
            "PACK": P, "TOOLS": tools or os.path.join(self.blind, "tools"), "INPUTS": inputs or os.path.join(self.blind, "inputs"),
            "START": now(), "UNIT": str(u["i"]), "T0": f"{u['t0']:.3f}", "T1": f"{u['t1']:.3f}",
            "NECK_LOOK": " and neck.jpg" if hand else "",
            "NOTES_RULE": ("The notes are given: they are the notes played. Keep every one (its id, onset, offset and "
                           "pitch); add none and drop none. Your job is the places." if given else
                           "Keep, drop or add. The base candidates (white boxes) are one note model's reading; the "
                           "alternatives (cyan) are other models' extra notes: often overtones (12, 19 or 24 semitones "
                           "above a lower note), doubled onsets or inventions, sometimes real notes the base missed. Keep "
                           "a note when its own stroke starts at its onset in the spectrogram; add a note only where you "
                           "see an onset in the sound and the hand can reach a place for it."),
            "HAND_RULE": ("The hand window (the green band in neck.jpg, 'window' in candidates.csv) is where the "
                          "fretting hand can reach at each onset; open strings are always allowed. Check the tool "
                          "yourself on neck.jpg (overlay.sh draws more times; --plain shows the fingers): if it is "
                          "wrong, say so in lessons.hand." if hand else
                          "There is no hand information in this run: places come from the sound, the solver and what a "
                          "guitarist's hand would do."),
            "TUNING_RULE": ("The tuning is given and right." if tun_given else
                            "The tuning was found by a tool and may be wrong. When a note can only be played on a "
                            "string tuned otherwise, or an open string rings at another pitch, record it in "
                            "lessons.tuning (agrees: false, with the pitch you hear); when an open string clearly rings "
                            "at its pitch, record agrees: true. Never write a place the tuning cannot play."),
        }
        rep.update(extra or {})
        text = self.templates[kind]
        for k, v in rep.items():
            text = text.replace("{" + k + "}", v)
        return text

    # ------------------------------------------------------------------ the per-call folder for --state off
    def make_solo(self, own_notes=None):
        """A fresh folder for one call: a copy of the inputs without similar.json, the tools, an empty state (tuning
        only) and, for a revisit, a tab.json with that unit's own notes only. Nothing of other units."""
        S = self.solo
        if os.path.exists(S):
            shutil.rmtree(S)
        src = os.path.join(self.blind, "inputs")
        for dp, _, fs in os.walk(src):
            rel = os.path.relpath(dp, src)
            os.makedirs(os.path.join(S, "inputs", rel), exist_ok=True)
            for f in fs:
                if rel == "." and f == "similar.json":
                    continue
                shutil.copyfile(os.path.join(dp, f), os.path.join(S, "inputs", rel, f))
        ap = os.path.join(S, "inputs", "hand", "anchors.json")
        if os.path.exists(ap):
            A = rj(ap); A["video"] = os.path.join(S, "inputs", "video.mp4"); wj(ap, A)
        st = self.state()
        wj(os.path.join(S, "state.json"), dict(json.loads(json.dumps(EMPTY_STATE)), tuning=st["tuning"]))
        wj(os.path.join(S, "tab.json"), {"tuning_midi": st["tuning"]["midi"], "capo": self.cfg["capo"],
                                         "notes": list(own_notes or [])})
        make_tools.make(S)
        return S

    # ------------------------------------------------------------------ one blind call
    def call_id(self, label):
        k = 1
        while os.path.exists(os.path.join(self.calls_d, f"{label}.{k}.json")):
            k += 1
        return f"{label}.{k}"

    def fingerprint(self, work, pack):
        fp = {}
        for dp, dns, fs in os.walk(work):
            if os.path.abspath(dp) == os.path.abspath(pack):
                dns[:] = []; continue
            dns[:] = [d for d in dns if os.path.abspath(os.path.join(dp, d)) != os.path.abspath(pack)]
            for f in fs:
                p = os.path.join(dp, f)
                try:
                    st = os.lstat(p); fp[os.path.relpath(p, work)] = (st.st_size, st.st_mtime_ns)
                except OSError:
                    pass
        return fp

    def call(self, P, kind, prompt, label, unit, work=None):
        work = work or self.blind
        cid = self.call_id(label)
        pf = os.path.join(P, "PROMPT.txt")
        open(pf, "w").write(prompt)
        for f in ("run.json", "run.meta.json", "run.err"):         # keep an earlier attempt's records
            fp = os.path.join(P, f)
            if os.path.exists(fp):
                k = 1
                while os.path.exists(fp.replace(".json", f".{k}.json").replace(".err", f".{k}.err")):
                    k += 1
                os.rename(fp, fp.replace(".json", f".{k}.json").replace(".err", f".{k}.err"))
        td = os.path.join(self.td_root, cid)
        crec = {"call_id": cid, "kind": kind, "label": label, "unit": unit, "pack": P, "work": work,
                "state_off": self.a.state == "off", "td": td, "started": now()}
        wj(os.path.join(self.calls_d, f"{cid}.json"), crec)
        wj(self.infl_p, {"call_id": cid, "pack": P, "work": work, "kind": kind, "unit": unit})
        self.prog["calls"] = self.prog.get("calls", 0) + 1
        if self.a.fake and self.a.fake_sleep is None:
            res = {"rc": 0, "wall_s": 0, "timed_out": False, "pgid": None, "left_alive": False}
        else:
            before = self.fingerprint(work, P)
            def started(proc, pgid):
                crec.update({"pid": proc.pid, "pgid": pgid})
                wj(os.path.join(self.calls_d, f"{cid}.json"), crec)
                self.log(f"call {cid} started: pid {proc.pid}, process group {pgid}")
            res = sbxcall.run(work, P, pf, label, self.a.effort, td, self.a.hard_min * 60, self.pid_p,
                              os.path.join(P, "blind_run.log"), extra_rec={"call_id": cid, "kind": kind, "unit": unit},
                              fake_sleep=self.a.fake_sleep if self.a.fake else None, on_start=started)
            after = self.fingerprint(work, P)
            changed = sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))
            crec["outside_changed"] = changed[:20]
        if self.a.fake:     # plumbing test: no model call; the solver's proposal is the writer's answer
            if kind in ("write", "reask"):
                wj(os.path.join(P, "bar.json"), self.solver_bar(P, unit))
                fl = {"model_habits": [{"model": "bp", "kind": "invents", "where": "fake", "count": 1, "earlier_units": []}]}
                if os.environ.get("LOOP_FAKE_CONFLICT"):      # test of L3: every unit reports a conflict on that string
                    fl["tuning"] = [{"string": int(os.environ["LOOP_FAKE_CONFLICT"]), "pitch": 40, "agrees": False,
                                     "seen": "fake"}]
                wj(os.path.join(P, "lessons.json"), fl)
                wj(os.path.join(P, "revisit.json"), {"revisit": []})
            elif kind.startswith("revisit"):
                wj(os.path.join(P, "verdict.json"), {"action": "keep", "why": "fake run"})
            elif kind == "tuning":
                ft = os.environ.get("LOOP_FAKE_TUNING")      # test of L3: the fake tuner answers this tuning
                wj(os.path.join(P, "tuning.json"), {"tuning_midi": [int(x) for x in ft.split()] if ft else
                                                    self.state()["tuning"]["midi"], "why": "fake run"})
            wj(os.path.join(P, "run.meta.json"), {"label": label, "wall_s": res["wall_s"], "exit": res["rc"],
                                                  "cost_usd_list": 0.0, "output_tokens": 0, "input_tokens": 0,
                                                  "cache_read": 0, "cache_write": 0, "num_turns": 0, "fake": True})
        return self.finish_call(crec, res)

    def finish_call(self, crec, res, aborted=False):
        """Post-processes a call (finished, killed by the hard limit, or aborted): the transcript path kept on the driver
        side only, the audit, the cost from the transcript when run.json is missing; returns the call's record."""
        P, td, label = crec["pack"], crec["td"], crec["label"]
        mp = os.path.join(P, "run.meta.json")
        meta = rj(mp, {}) if os.path.exists(mp) else {}
        tr = sbxcall.find_transcript(td, meta.get("session_id")) if not meta.get("fake") else None
        au = {} if meta.get("fake") and not tr else audit_unit.audit(crec["pack"], tr, crec["work"], crec["state_off"])
        if self.a.fake and not tr:
            au = {"calls": 0, "void": [], "warn": [], "reads": {}, "usage": {}}
        if self.a.test_void_at is not None and crec["unit"] == self.a.test_void_at and crec["kind"] == "write" \
                and not os.path.exists(os.path.join(self.run, f"test_void_used.{crec['unit']}")):
            open(os.path.join(self.run, f"test_void_used.{crec['unit']}"), "w").write(now())
            au.setdefault("void", []).append("TEST: --test-void-at marks this call void")
        if crec.get("outside_changed"):
            au.setdefault("void", []).append(f"files outside the call's folder changed during the call: {crec['outside_changed'][:5]}")
        if not meta.get("cost_usd_list") and not meta.get("fake"):   # killed before blind_run.sh wrote its record
            us = au.get("usage") or {}
            tk = us.get("tokens", {})
            meta.update({"label": label, "wall_s": res.get("wall_s"), "exit": res.get("rc"),
                         "cost_usd_list": us.get("cost_usd_list"), "cost_from": us.get("cost_from"),
                         "output_tokens": tk.get("output"), "input_tokens": tk.get("input"),
                         "cache_read": tk.get("cache_read"), "cache_write": tk.get("cache_write"), "from_transcript": True})
        meta["timed_out"] = bool(res.get("timed_out")) or meta.get("timed_out", False)
        meta["aborted"] = aborted
        full = dict(meta, transcript=tr)
        if os.path.exists(P):     # the pack keeps a neutral record: no outside path (it names the run)
            wj(mp, dict(meta, transcript=("<transcripts>/" + os.path.relpath(tr, td)) if tr else None))
        crec.update({"ended": now(), "rc": res.get("rc"), "wall_s": res.get("wall_s"), "timed_out": meta["timed_out"],
                     "aborted": aborted, "left_alive": res.get("left_alive"), "transcript": tr, "meta": full,
                     "audit": {k: au.get(k) for k in ("calls", "void", "warn", "reads")}})
        wj(os.path.join(self.calls_d, f"{crec['call_id']}.json"), crec)
        wj(os.path.join(self.calls_d, f"{crec['call_id']}.audit.json"), au)
        rec = {"call_id": crec["call_id"], "kind": crec["kind"], "label": label, "rc": res.get("rc"), "unit": crec["unit"],
               "wall_s": res.get("wall_s"), "meta": meta, "void": bool(au.get("void")),
               "audit": {"calls": au.get("calls"), "void": au.get("void"), "warn": (au.get("warn") or [])[:8],
                         "pictures_read": (au.get("reads") or {}).get("pictures")}}
        if au.get("void"):
            self.log(f"VOID: call {crec['call_id']} ({crec['kind']}, unit {crec['unit']}): {au['void'][:3]}")
        return rec

    def aborted_call(self, crec, why):
        """A call cut off by a stop or a dead driver: audited, its cost logged once, its folder moved out."""
        try:
            wall = round(time.time() - datetime.strptime(crec["started"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).timestamp(), 1)
        except (KeyError, ValueError):
            wall = None
        rec = self.finish_call(crec, {"rc": crec.get("rc"), "wall_s": crec.get("wall_s") or wall}, aborted=True)
        self.unit_log(crec["unit"], rec, {"aborted": why, "valid": False})
        P = crec["pack"]
        if os.path.exists(P):
            dst = self.move_out(P, "aborted")
            self.log(f"aborted call {crec['call_id']} ({why}): cost {rec['meta'].get('cost_usd_list')} logged, "
                     f"folder moved to {dst}")
        if os.path.exists(self.solo):
            shutil.rmtree(self.solo)

    def kill_leftover(self):
        rec, killed = sbxcall.kill_leftover(self.pid_p, self.log)
        if not rec:
            return
        crec = rj(os.path.join(self.calls_d, f"{rec.get('call_id')}.json"), {})
        if crec and not crec.get("ended"):
            meta = rj(os.path.join(crec["pack"], "run.meta.json"), {}) if os.path.exists(crec["pack"]) else {}
            if not killed and meta.get("exit") == 0 and not crec["pack"].startswith(self.solo + "/"):
                self.finish_call(crec, {"rc": 0, "wall_s": meta.get("wall_s")})
                self.log(f"call {crec['call_id']} finished while no driver ran: kept for reuse")
            else:
                self.aborted_call(crec, "killed at restart" if killed else "driver died during the call")
        os.remove(self.pid_p)

    def unit_log(self, i, rec, extra):
        if rec.get("call_id") in self.logged:
            return
        m = rec["meta"]
        row = {"t": now(), "unit": i, "call_id": rec.get("call_id"), "kind": rec["kind"], "label": rec["label"],
               "exit": rec["rc"], "wall_s": rec["wall_s"], "cost_usd_list": m.get("cost_usd_list"),
               "tokens": {"input": m.get("input_tokens"), "output": m.get("output_tokens"),
                          "cache_read": m.get("cache_read"), "cache_write": m.get("cache_write")},
               "num_turns": m.get("num_turns"), "timed_out": m.get("timed_out", False), "audit": rec["audit"]}
        row.update(extra)
        append_jsonl(os.path.join(self.run, "units_log.jsonl"), row)
        self.logged.add(rec.get("call_id"))

    def note_skip(self, j, kind, why, after):
        key = f"skip:{after}:{j}:{kind}:{why[:40]}"
        if key in self.logged:          # a redone apply logs its skips once
            return
        self.log(f"revisit of unit {j} ({kind}) not run: {why}")
        append_jsonl(os.path.join(self.run, "units_log.jsonl"), {"t": now(), "unit": j, "kind": "revisit-skip",
                                                                 "call_id": key, "trigger": kind, "after": after, "why": why})
        self.logged.add(key)

    def reusable(self, P):
        """A call in P whose result may be used again after a restart: it finished or hit the hard limit, its audit is
        clean, and its bar passes the check (or, for a revisit, its verdict is a keep)."""
        meta = rj(os.path.join(P, "run.meta.json"), {}) if os.path.exists(P) else {}
        if not meta or meta.get("aborted") or not (meta.get("exit") == 0 or meta.get("timed_out")):
            return None
        infl = rj(self.infl_p, {})
        cid = infl.get("call_id") if infl.get("pack") == P else None
        if not cid:
            for f in sorted(os.listdir(self.calls_d)):
                if f.endswith(".json") and not f.endswith(".audit.json"):
                    c = rj(os.path.join(self.calls_d, f), {})
                    if c.get("pack") == P and c.get("ended"):
                        cid = c["call_id"]
        crec = rj(os.path.join(self.calls_d, f"{cid}.json"), {}) if cid else {}
        if not crec or (crec.get("audit") or {}).get("void"):
            return None
        return crec

    # ------------------------------------------------------------------ validation
    def check(self, P):
        return VA.check_pack(P)

    def solver_bar(self, P, i):
        """The stand-in when a bar is rejected twice: the solver's places for the base candidates."""
        sol = rj(os.path.join(P, "solver.json"))
        notes = [{"id": r["id"], "onset": r["onset"], "offset": r["offset"], "pitch": r["pitch"],
                  "string": r["choice"][0], "fret": r["choice"][1], "confidence": 0.3, "why": "", "place_why": "",
                  "repluck": True} for r in sol["rows"] if r["solved"] and r["choice"]]
        drops = [{"id": r["id"], "why": "not in the base reading (the solver's stand-in)"} for r in sol["rows"]
                 if not r["solved"] and isinstance(r["id"], int) and (r["base"] or r["n_sup"] >= 2)]
        drops += [{"id": r["id"], "why": "no place (the solver's stand-in)"} for r in sol["rows"]
                  if r["solved"] and not r["choice"] and isinstance(r["id"], int)]
        return {"unit": i, "notes": notes, "drops": drops, "confidence": 0.3, "recognised": "no", "fallback": "solver"}

    # ------------------------------------------------------------------ merge and log
    def merge(self, i, bar, by):
        tb = self.tab()
        old = [n for n in tb["notes"] if n.get("unit") == i]
        tb["notes"] = [n for n in tb["notes"] if n.get("unit") != i]
        new = []
        for n in bar["notes"]:
            new.append({"onset": round(float(n["onset"]), 4), "offset": round(float(n["offset"]), 4),
                        "pitch": int(n["pitch"]), "string": int(n["string"]), "fret": int(n["fret"]),
                        "unit": i, "id": n["id"], "confidence": n.get("confidence")})
        # a later onset on a string stops the note ringing there (a re-pluck): its offset is cut at that onset
        new.sort(key=lambda n: (n["onset"], n["pitch"]))
        for y, n in enumerate(new):
            for m in new[:y]:
                if m["string"] == n["string"] and n["onset"] - m["onset"] > GROUP_S and m["offset"] > n["onset"]:
                    m["offset"] = n["onset"]
        # ... and a note of another unit still ringing on a string this unit strikes stops there too (no revisit needed)
        for n in new:
            for m in tb["notes"]:
                if m["string"] == n["string"] and n["onset"] - m["onset"] > GROUP_S and m["offset"] > n["onset"]:
                    m["offset"] = n["onset"]
        tb["notes"] += new
        self.save_tab(tb)
        return old, new

    def log_change(self, unit, by, kind, before, after, why):
        append_jsonl(os.path.join(self.run, "changes.jsonl"),
                     {"t": now(), "unit": unit, "by": by, "kind": kind, "before": before, "after": after, "why": why})

    def log_first_write(self, i, P, bar):
        sol = {r["id"]: r for r in rj(os.path.join(P, "solver.json"))["rows"]}
        kept = set()
        for n in bar["notes"]:
            sf = {"onset": n["onset"], "pitch": n["pitch"], "string": n["string"], "fret": n["fret"]}
            if n["id"] == "new":
                self.log_change(i, "writer", "add", None, sf, n.get("why", ""))
                continue
            kept.add(int(n["id"]))
            r = sol.get(int(n["id"]))
            if r and r["choice"] and (n["string"], n["fret"]) != tuple(r["choice"]):
                self.log_change(i, "writer", "place" if r["solved"] else "place-alt",
                                {"onset": r["onset"], "pitch": r["pitch"], "string": r["choice"][0], "fret": r["choice"][1]},
                                sf, n.get("place_why", ""))
            if r and not r["base"]:
                self.log_change(i, "writer", "keep-alt", {"onset": r["onset"], "pitch": r["pitch"], "id": r["id"]}, sf,
                                n.get("why", ""))
            if r and r["pitch"] != n["pitch"]:
                self.log_change(i, "writer", "pitch", {"onset": r["onset"], "pitch": r["pitch"]}, sf, n.get("why", ""))
        why = {int(d["id"]): d.get("why", "") for d in bar.get("drops", []) if "id" in d}
        for r in sol.values():
            if r["base"] and r["id"] not in kept:
                self.log_change(i, "writer", "drop", {"onset": r["onset"], "pitch": r["pitch"], "id": r["id"],
                                                      "string": (r["choice"] or [None, None])[0],
                                                      "fret": (r["choice"] or [None, None])[1]}, None, why.get(r["id"], ""))

    def log_revision(self, j, old, new, by, why_all):
        def key(n):
            return n["id"] if n["id"] != "new" else f"new@{n['onset']:.2f}:{n['pitch']}"
        o = {key(n): n for n in old}; nw = {key(n): n for n in new}
        sf = lambda n: {"onset": n["onset"], "pitch": n["pitch"], "string": n["string"], "fret": n["fret"]}
        nch = 0
        for k in set(o) | set(nw):
            a, b = o.get(k), nw.get(k)
            if a and not b:
                self.log_change(j, by, "drop", sf(a), None, why_all); nch += 1
            elif b and not a:
                self.log_change(j, by, "add", None, sf(b), why_all); nch += 1
            elif (a["string"], a["fret"], a["pitch"]) != (b["string"], b["fret"], b["pitch"]) or abs(a["onset"] - b["onset"]) > 0.03:
                kind = "place" if a["pitch"] == b["pitch"] else "pitch"
                self.log_change(j, by, kind, sf(a), sf(b), why_all); nch += 1
        return nch

    # ------------------------------------------------------------------ lessons -> state, triggers
    def apply_lessons(self, i, P, bar, triggers=True):
        st = self.state()
        for k, v in EMPTY_STATE.items():
            st.setdefault(k, json.loads(json.dumps(v)))
        L, w1 = VA.clean_lessons(rj(os.path.join(P, "lessons.json"), {}), i)
        RV, w2 = VA.clean_revisit(rj(os.path.join(P, "revisit.json"), {}), i)
        trig = []
        for x in L.get("tuning", []):
            e = st["tuning"]["strings"].setdefault(str(x["string"]), {"agree_units": [], "conflict_units": [], "heard": {},
                                                                       "evidence": []})
            (e["agree_units"] if x["agrees"] else e["conflict_units"]).append(i)
            if not x["agrees"]:
                e["heard"][str(x["pitch"])] = e["heard"].get(str(x["pitch"]), 0) + 1
            e["evidence"].append({"unit": i, "pitch": x["pitch"], "agrees": x["agrees"], "seen": x["seen"]})
        tb = self.tab()["notes"]
        for x in L.get("shapes", []):
            pairs = sorted(zip(x["pitches"], [tuple(p) for p in x["places"]]))
            keyp = [p for p, _ in pairs]; plc = [list(q) for _, q in pairs]
            ent = next((b for b in st["shape_book"] if b["pitches"] == keyp), None)
            if ent is None:
                st["shape_book"].append({"pitches": keyp, "places": plc, "units": [i], "seen": x["seen"],
                                         "seen_in": [[i, x["t"]]] if x["seen"] else []})
            elif ent["places"] == plc:
                if i not in ent["units"]: ent["units"].append(i)
                if x["seen"]:
                    ent["seen"] = True; ent["seen_in"].append([i, x["t"]])
            else:
                if x["seen"] and not ent["seen"]:
                    ent.setdefault("was", []).append({"places": ent["places"], "units": ent["units"]})
                    ent.update({"places": plc, "units": [i], "seen": True, "seen_in": [[i, x["t"]]]})
                else:
                    ent.setdefault("other", []).append({"places": plc, "unit": i, "seen": x["seen"]})
            if x["seen"] and triggers:      # trigger 1: an earlier unit placed this pitch set otherwise
                for g in groups([n for n in tb if n.get("unit", 1e9) < i]):
                    gp = sorted((n["pitch"], (n["string"], n["fret"])) for n in g)
                    if [p for p, _ in gp] == keyp and [list(q) for _, q in gp] != plc:
                        trig.append((g[0]["unit"], "shape", f"unit {i} saw the fingers play {[name(p) for p in keyp]} as "
                                     f"{' '.join(f'{s}:{f}' for s, f in [tuple(q) for q in plc])} at {x['t']:.2f} s; this unit "
                                     f"placed it {' '.join(f'{s}:{f}' for _, (s, f) in gp)} at {g[0]['onset']:.2f} s"))
        if "hand" in L:
            st["hand"][str(i)] = L["hand"]
        elif self.W:
            ws = [self.W.at(n["onset"]) for n in bar["notes"]]
            ws = [w for w in ws if w]
            if ws:
                st["hand"][str(i)] = {"lo": min(w[0] for w in ws), "hi": max(w[1] for w in ws), "window_ok": True, "fix": ""}
        for x in L.get("model_habits", []):
            k = f"{x['model']}|{x['kind']}"
            e = st["model_habits"].setdefault(k, {"count": 0, "units": [], "where": []})
            e["count"] += x["count"]; e["units"].append(i)
            if x["where"] and x["where"] not in e["where"]:
                e["where"] = (e["where"] + [x["where"]])[-5:]
            if triggers:
                for j in x["earlier_units"]:
                    if x["kind"] != "misses" and x["model"] != "base":
                        weak = [n for n in tb if n.get("unit") == j and isinstance(n.get("id"), int)
                                and x["model"] in self.cid[n["id"]]["supporters"].split("+") and self.cid[n["id"]]["n_sup"] <= 2]
                        if not weak:
                            self.note_skip(j, "habit", f"unit {i} named it for '{x['model']} {x['kind']}', but it kept no "
                                                       f"weakly held note of that model", i)
                            continue
                    trig.append((j, "habit", f"unit {i} found that the note model '{x['model']}' {x['kind']} "
                                             f"({x['where']}) and named this unit as one where it shows"))
        for x in L.get("player_habits", []):
            e = st["player_habits"].setdefault(x["kind"], {"units": [], "times": []})
            if i not in e["units"]: e["units"].append(i)
            if x["t"] is not None: e["times"] = (e["times"] + [x["t"]])[-8:]
        conf = float(bar.get("confidence", 0.5))
        st["unit_conf"][str(i)] = conf
        if conf < 0.6 and i not in st["unsure"]:
            st["unsure"].append(i)
        if conf >= 0.6 and i in st["unsure"]:
            st["unsure"].remove(i)
        if "repeat_of" in L:
            j = L["repeat_of"]["unit"]
            st["repeats"].append({"unit": i, "of": j, "differs": L["repeat_of"]["differs"]})
            if triggers and st["unit_conf"].get(str(j), 1.0) < 0.6:
                trig.append((j, "repeat", f"unit {i} repeats this unit ({L['repeat_of']['differs'] or 'no difference named'}) "
                                          f"and this unit's confidence was {st['unit_conf'][str(j)]:.2f}"))
        if triggers:
            for x in RV:
                trig.append((x["unit"], "asked", f"the writer of unit {i}: {x['why']}"))
        st["units_done"] = len(set(self.prog["done"]) | {i})
        self.save_state(st)
        return trig, w1 + w2

    def queue(self, trig, after):
        """Every trigger is queued or logged as skipped with why; nothing is cut silently."""
        q = {x["unit"]: x for x in self.prog["queue"]}
        for j, kind, why in trig:
            if self.a.revisits == "off":
                self.note_skip(j, kind, "revisits are off in this run", after); continue
            if j > after or j not in self.prog["done"] and j != after:
                self.note_skip(j, kind, f"unit {j} is not finished", after); continue
            if kind != "tuning" and self.prog["revisits"].get(str(j), 0) >= MAX_REV_PER_UNIT:
                self.note_skip(j, kind, f"unit {j} was already opened again {MAX_REV_PER_UNIT} times", after); continue
            e = q.setdefault(j, {"unit": j, "kinds": [], "why": [], "after": after})
            if kind not in e["kinds"]: e["kinds"].append(kind)
            if why not in e["why"]: e["why"].append(why)
        self.prog["queue"] = sorted(q.values(), key=lambda x: (0 if "tuning" in x["kinds"] else 1, x["unit"]))

    def sweep(self, i):
        """Trigger 5: every 8 units, the unsure units among the last 8."""
        if (i + 1) % 8 != 0 or self.prog.get("last_sweep", -1) >= i:
            return []
        self.prog["last_sweep"] = i
        st = self.state()
        return [(j, "unsure", f"every 8 units the unsure ones are opened again: this unit's confidence was "
                              f"{st['unit_conf'].get(str(j), 0):.2f}") for j in st.get("unsure", []) if i - 7 <= j <= i]

    # ------------------------------------------------------------------ the void rule
    def void_check(self, rec, round_unit):
        if rec.get("void"):
            raise VoidHit(round_unit, rec)

    # ------------------------------------------------------------------ L3's tuning review
    def tuning_review(self, i):
        """Trigger 2 (L3 only): a string with conflicts in CONFLICT_UNITS units and no support since gets one review call;
        if the tuning changes, every finished unit with a note on that string is solved again with the new tuning and
        revisited where the solver's new path differs from its re-placed notes (no cap); the others are logged."""
        st = self.state()
        if st["tuning"].get("given", True) or i in self.prog.get("tuning_done", []):
            return
        bad = []
        for s, e in st["tuning"]["strings"].items():
            cu = sorted(set(e.get("conflict_units", [])))
            if len(cu) >= CONFLICT_UNITS and not [u for u in e.get("agree_units", []) if u >= cu[0]] \
                    and str(s) not in st["tuning"].get("reviewed", {}):
                bad.append(int(s))
        if not bad:
            return
        key = f"tuning.u{i:03d}"
        self.begin(key)
        P = os.path.join(self.blind, f"tuning.u{i:03d}")
        if os.path.exists(P) and not self.reusable(P):
            self.move_out(P, "aborted")
        reuse = self.reusable(P) if os.path.exists(P) else None
        os.makedirs(P, exist_ok=True)
        if not reuse:
            wj(os.path.join(P, "unit.json"), {"blind": self.blind, "i": i, "t0": 0, "t1": 0, "context": [0, 0],
                                              "tuning": st["tuning"]["midi"], "capo": self.cfg["capo"]})
            lines = ["# Tuning evidence", "", f"Tuning now, string 6 to 1: {' '.join(name(p) for p in st['tuning']['midi'])} "
                     f"= MIDI {st['tuning']['midi']}; capo {self.cfg['capo']}.", ""]
            for s in range(6, 0, -1):
                e = st["tuning"]["strings"].get(str(s), {})
                lines.append(f"## string {s} ({name(st['tuning']['midi'][6 - s])})")
                for ev in e.get("evidence", []):
                    lines.append(f"- unit {ev['unit']} ({self.units[ev['unit']]['t0']:.1f}-{self.units[ev['unit']]['t1']:.1f} s): "
                                 f"{'agrees' if ev['agrees'] else 'conflict, heard ' + name(ev['pitch'])}: {ev['seen']}")
                lines.append("")
            lines += ["# The tab so far", "", "```", PK.ascii_tab(self.tab()["notes"]), "```"]
            open(os.path.join(P, "TUNING.md"), "w").write("\n".join(lines) + "\n")
            prompt = self.fill("TUNER", P, {"TUNING": " ".join(name(p) for p in st["tuning"]["midi"]), "CAPO": str(self.cfg["capo"]),
                                            "STRING": " and ".join(str(s) for s in bad),
                                            "OVERLAY_HINT": f" and `{self.blind}/tools/overlay.sh T1,T2` for the hand"
                                            if self.cfg.get("hand") != "off" else ""})
            self.log(f"tuning review after unit {i}: strings {bad}")
            rec = self.call(P, "tuning", prompt, f"t{i:03d}", i)
            self.void_check(rec, i)
        else:
            rec = {"call_id": reuse["call_id"], "kind": "tuning", "label": reuse["label"], "rc": reuse.get("rc"),
                   "wall_s": reuse.get("wall_s"), "meta": reuse.get("meta", {}), "audit": reuse.get("audit", {})}
        res = rj(os.path.join(P, "tuning.json"), {})
        new = res.get("tuning_midi")
        st = self.state()
        st["tuning"].setdefault("reviewed", {})
        for s in bad:
            st["tuning"]["reviewed"][str(s)] = i
        ok = isinstance(new, list) and len(new) == 6 and all(isinstance(x, int) and 24 <= x <= 80 for x in new)
        trig = []
        before_t = st["tuning"]["midi"]
        if ok and new != st["tuning"]["midi"]:
            old = st["tuning"]["midi"]
            changed = [6 - k for k in range(6) if new[k] != old[k]]
            self.log_change(None, "tuning", "tuning", {"tuning_midi": old}, {"tuning_midi": new}, res.get("why", ""))
            st["tuning"]["midi"] = new
            st["tuning"].setdefault("changes", []).append({"after_unit": i, "from": old, "to": new, "strings": changed})
            self.save_state(st)
            from common import places as _pl, maxfret as _mf
            tb = self.tab()
            aff = sorted(set(n["unit"] for n in tb["notes"] if n["string"] in changed))
            for nt in tb["notes"]:
                if nt["string"] in changed:
                    before = dict(nt)
                    f = nt["pitch"] - (new[6 - nt["string"]] + int(self.cfg["capo"]))
                    if 0 <= f <= _mf(self.cfg):
                        nt["fret"] = f
                    else:
                        pl = _pl(nt["pitch"], new, int(self.cfg["capo"]), _mf(self.cfg))
                        if pl:
                            nt["string"], nt["fret"] = min(pl, key=lambda sf: abs(sf[1] - before["fret"]))
                    self.log_change(nt["unit"], "tuning-reflow", "place",
                                    {k: before[k] for k in ("onset", "pitch", "string", "fret")},
                                    {k: nt[k] for k in ("onset", "pitch", "string", "fret")}, "the tuning changed")
            self.save_tab(tb)
            # every affected unit is solved again with the new tuning; a revisit where the solver's path differs
            tb = self.tab()
            for j in aff:
                sol = solve_unit(self.blind, j, tuning=new, tab_notes=[n for n in tb["notes"] if n.get("unit") != j],
                                 cfg=self.cfg, units=self.units, cands=self.cands)
                ch = {r["id"]: tuple(r["choice"]) for r in sol["rows"] if r["solved"] and r["choice"]}
                diff = [n for n in tb["notes"] if n.get("unit") == j and isinstance(n.get("id"), int)
                        and n["id"] in ch and ch[n["id"]] != (n["string"], n["fret"])]
                if diff:
                    trig.append((j, "tuning", f"the tuning changed after unit {i}: string(s) {changed} from "
                                              f"{[name(old[6 - s]) for s in changed]} to {[name(new[6 - s]) for s in changed]}; "
                                              f"solved again, the solver now places {len(diff)} of this unit's notes otherwise "
                                              f"than the re-placed tab"))
                else:
                    self.note_skip(j, "tuning", f"solved again after the tuning change: the solver agrees with its "
                                                f"re-placed notes", i)
        else:
            self.save_state(st)
        self.unit_log(i, rec, {"tuning_before": before_t, "tuning_after": new if ok else None,
                               "why": str(res.get("why", ""))[:300], "tuning_revisits": [j for j, _, _ in trig]})
        self.queue(trig, i)
        self.prog.setdefault("tuning_done", []).append(i)
        self.commit(key)

    # ------------------------------------------------------------------ one unit / one revisit
    def write_unit(self, i):
        snap = os.path.join(self.run, "snapshots", f"u{i:03d}")
        if os.path.exists(os.path.join(snap, "meta.json")):
            self.restore_snapshot(snap)          # a restart inside this unit: undo anything half applied
        else:
            self.take_snapshot(snap, f"u{i:03d}")
        if self.a.state == "off":
            st = self.state()       # the carried state is emptied; the unit's own confidences stay (driver side)
            keep = {k: st.get(k, EMPTY_STATE.get(k)) for k in ("tuning", "unit_conf", "unsure", "units_done")}
            self.save_state(dict(json.loads(json.dumps(EMPTY_STATE)), **keep))
        P = unit_dir(self.blind, i)
        reuse = self.reusable(P) if os.path.exists(P) else None
        e = None
        if reuse:
            e, w, bar = self.check(P)
            if e:
                reuse = None
        if reuse:
            self.log(f"unit {i}: reusing the finished call {reuse['call_id']} in {P} (restart)")
            rec = {"call_id": reuse["call_id"], "kind": "write", "label": reuse["label"], "rc": reuse.get("rc"),
                   "wall_s": reuse.get("wall_s"), "meta": reuse.get("meta", {}), "audit": reuse.get("audit", {})}
            asks = 1
        else:
            if os.path.exists(P):
                self.move_out(P, "aborted")
            if self.a.state == "off":
                work = self.make_solo()
                Ps = PK.build(work, i, state_on=False, quiet=True)
            else:
                work = self.blind
                Ps = PK.build(self.run, i, state_on=True, quiet=True)
            self.log(f"unit {i}: pack ready, calling the writer")
            T, I = os.path.join(work, "tools"), os.path.join(work, "inputs")
            rec = self.call(Ps, "write", self.fill("WRITER", Ps, tools=T, inputs=I), f"u{i:03d}", i, work=work)
            self.void_check(rec, i)
            e, w, bar = self.check(Ps)
            asks = 1
            if e:
                self.unit_log(i, rec, {"valid": False, "errors": e[:12]})
                self.log(f"unit {i}: rejected ({len(e)} problems), asking again once")
                fix = self.fill("WRITER", Ps, tools=T, inputs=I) + (
                    "\n\nA first attempt in this folder was rejected by the checker. Its files are still here (bar.json "
                    "and others). Fix exactly these problems, change nothing else unless needed, and run check.sh:\n- "
                    + "\n- ".join(e[:20]))
                rec = self.call(Ps, "reask", fix, f"u{i:03d}b", i, work=work)
                self.void_check(rec, i)
                e, w, bar = self.check(Ps)
                asks = 2
            if work != self.blind:
                shutil.move(Ps, P)
                shutil.rmtree(work)
        fallback = None
        if e:
            self.log(f"unit {i}: still rejected; the solver's proposal stands in")
            bar = self.solver_bar(P, i); fallback = "solver"
        wj(os.path.join(P, "final_bar.json"), bar)
        self.merge(i, bar, "writer")
        if not fallback:
            self.log_first_write(i, P, bar)
        self.test_stop(f"u{i:03d}:after-merge")
        trig, warns = self.apply_lessons(i, P, bar, triggers=True)
        self.test_stop(f"u{i:03d}:after-lessons")
        trig += self.sweep(i)
        self.unit_log(i, rec, {"valid": not e, "errors": (e or [])[:12], "warnings": warns[:8], "asks": asks,
                               "fallback": fallback, "notes": len(bar["notes"]), "drops": len(bar.get("drops", [])),
                               "new": sum(1 for n in bar["notes"] if n["id"] == "new"),
                               "confidence": bar.get("confidence"), "recognised": bar.get("recognised"),
                               "triggers": [(j, k) for j, k, _ in trig]})
        self.test_stop(f"u{i:03d}:after-log")
        self.queue(trig, i)
        self.prog["done"] = sorted(set(self.prog["done"]) | {i})
        self.prog["round"] = {"after": i, "ran": 0}
        self.save_prog()                          # the commit of unit i
        if os.path.exists(self.infl_p):
            os.remove(self.infl_p)

    def revisit(self, item):
        j = item["unit"]
        reason = " / ".join(item["why"])
        key = f"revisit.u{j:03d}.after{item['after']:03d}.{self.prog['revisits'].get(str(j), 0) + 1}"
        self.begin(key)
        n = self.prog["revisits"].get(str(j), 0) + 1
        self.prog["revisits"][str(j)] = n
        infl = rj(self.infl_p, {})
        P = infl.get("pack") if infl.get("kind", "").startswith("revisit") and infl.get("unit") == j else None
        reuse = self.reusable(P) if P and os.path.exists(P) else None
        if P and os.path.exists(P) and not reuse:
            self.move_out(P, "aborted"); P = None
        if reuse:
            self.log(f"revisit of unit {j}: reusing the finished call {reuse['call_id']} (restart)")
            rec = {"call_id": reuse["call_id"], "kind": "revisit", "label": reuse["label"], "rc": reuse.get("rc"),
                   "wall_s": reuse.get("wall_s"), "meta": reuse.get("meta", {}), "audit": reuse.get("audit", {})}
            work = self.blind
        else:
            if self.a.state == "off":
                own = [x for x in self.tab()["notes"] if x.get("unit") == j]
                rv = 1
                while os.path.exists(unit_dir(self.blind, j, rv)) or os.path.exists(os.path.join(self.run, "aborted")) and \
                        any(f.startswith(os.path.basename(unit_dir(self.blind, j, rv)) + ".") for f in os.listdir(os.path.join(self.run, "aborted"))):
                    rv += 1
                work = self.make_solo(own)
                fb = rj(os.path.join(unit_dir(self.blind, j), "final_bar.json"), None)
                P = PK.build(work, j, revisit=reason, state_on=False, quiet=True, rev_number=rv)
                if fb:
                    wj(os.path.join(P, "previous_bar.json"), fb)
            else:
                work = self.blind
                P = PK.build(self.run, j, revisit=reason, state_on=True, quiet=True)
            self.log(f"revisit of unit {j} ({', '.join(item['kinds'])})")
            T, I = os.path.join(work, "tools"), os.path.join(work, "inputs")
            rec = self.call(P, "revisit", self.fill("REVISER", P, {"REASON": reason}, tools=T, inputs=I),
                            f"u{j:03d}r{n}", j, work=work)
            self.void_check(rec, item["after"])
        v = rj(os.path.join(P, "verdict.json"), {})
        action = v.get("action")
        e = []
        if action == "rewrite":
            e, w, bar = self.check(P)
            if e and not reuse:
                fix = self.fill("REVISER", P, {"REASON": reason}, tools=os.path.join(work, "tools"),
                                inputs=os.path.join(work, "inputs")) + (
                    "\n\nA first attempt in this folder was rejected by the checker. Fix exactly these problems and run "
                    "check.sh:\n- " + "\n- ".join(e[:20]))
                self.unit_log(j, rec, {"revisit": n, "triggers_in": item["kinds"], "action": action, "valid": False,
                                       "errors": e[:12]})
                rec = self.call(P, "revisit-reask", fix, f"u{j:03d}r{n}b", j, work=work)
                self.void_check(rec, item["after"])
                v = rj(os.path.join(P, "verdict.json"), {}); action = v.get("action")
                e, w, bar = self.check(P) if action == "rewrite" else ([], [], None)
        if work != self.blind:
            dst = os.path.join(self.blind, os.path.basename(P))
            shutil.move(P, dst); P = dst
            shutil.rmtree(work)
        nch = 0
        if action == "rewrite" and not e:
            wj(os.path.join(P, "final_bar.json"), bar)
            old, new = self.merge(j, bar, "reviser")
            nch = self.log_revision(j, old, new, "revisit:" + "+".join(item["kinds"]), str(v.get("why", ""))[:300])
            wj(os.path.join(unit_dir(self.blind, j), "final_bar.json"), bar)
            self.apply_lessons(j, P, bar, triggers=False)
        self.unit_log(j, rec, {"revisit": n, "triggers_in": item["kinds"], "action": action or "none", "after": item["after"],
                               "valid": not e, "errors": e[:12], "changes": nch, "why": str(v.get("why", ""))[:300]})
        self.prog["queue"] = [x for x in self.prog["queue"] if x is not item and x != item]
        if "tuning" not in item["kinds"]:
            self.prog["round"]["ran"] = self.prog["round"].get("ran", 0) + 1
        self.commit(key)

    def run_queue(self, final=False):
        """Tuning items all run; others at most MAX_REV_PER_ROUND after one unit, the rest wait (logged) for the next
        round; at the end of the run (final) everything left runs."""
        told = set()
        while self.prog["queue"]:
            item = next((x for x in self.prog["queue"] if "tuning" in x["kinds"]), None)
            if item is None:
                if not final and self.prog["round"].get("ran", 0) >= MAX_REV_PER_ROUND:
                    left = [x["unit"] for x in self.prog["queue"]]
                    if tuple(left) not in told:
                        self.log(f"round cap ({MAX_REV_PER_ROUND}) reached after unit {self.prog['round']['after']}: "
                                 f"revisits of units {left} wait for the next round")
                        told.add(tuple(left))
                    return
                item = self.prog["queue"][0]
            self.revisit(item)

    # ------------------------------------------------------------------ answer
    def answer(self):
        tb = self.tab()
        beats = []
        for line in open(os.path.join(self.blind, "inputs", "beats.txt")):
            v = line.split()
            if len(v) >= 2: beats.append((float(v[0]), int(v[1])))
        bt = [t for t, _ in beats]
        import statistics
        bpm = 60.0 / statistics.median([b - a for a, b in zip(bt, bt[1:])]) if len(bt) > 2 else 120.0
        notes = [{"onset": n["onset"], "offset": min(n["offset"], float(self.cfg["duration_s"])), "pitch": n["pitch"],
                  "string": n["string"], "fret": n["fret"]}
                 for n in sorted(tb["notes"], key=lambda n: (n["onset"], n["pitch"]))]
        ans = {"tuning_midi": self.state()["tuning"]["midi"], "capo": int(self.cfg["capo"]), "tuning_offset_cents": 0.0,
               "tempo_bpm": round(bpm, 2), "key": "C major", "notes": notes, "beats": bt,
               "downbeats": [t for t, b in beats if b == 1],
               "chords": [{"start": 0.0, "end": float(self.cfg["duration_s"]), "label": "N"}]}
        ap = os.path.join(self.run, "answer.json")
        wj(ap, ans)
        v = subprocess.run(["python3", os.path.join(KIT, "validate_answer.py"), ap, "--duration", str(self.cfg["duration_s"])],
                           capture_output=True, text=True)
        g = subprocess.run([os.path.join(KIT, "answer2gp5.py"), ap, os.path.join(self.run, "answer.gp5")],
                           capture_output=True, text=True)
        z = None
        for line in g.stdout.splitlines():
            if line.strip().startswith("{"):
                try: z = json.loads(line).get("gp_time_zero_s"); break
                except Exception: pass
        open(os.path.join(self.run, "answer.check.txt"), "w").write(v.stdout + v.stderr + "\n" + g.stdout[-800:] + g.stderr[-400:])
        self.log(f"answer.json: {len(notes)} notes, validator: {(v.stdout.strip().splitlines() or ['?'])[-1][:80]}; "
                 f"answer.gp5: {'ok' if g.returncode == 0 else 'failed'} (time zero {z})")

    # ------------------------------------------------------------------ main loop
    def run_units(self, end):
        n = len(self.units)
        if self.prog["done"]:
            self.tuning_review(max(self.prog["done"]))     # a stop between a unit and its tuning review
        self.run_queue()
        for i in range(n):
            if i >= end:
                break
            if i in self.prog["done"]:
                continue
            self.write_unit(i)
            self.tuning_review(i)
            self.run_queue()
        if end >= n:
            self.run_queue(final=True)

    def main(self):
        a = self.a
        n = len(self.units)
        end = min(n, a.to) if a.to is not None else n
        try:
            self.kill_leftover()
            self.rollback_apply()
            if a.restart_from is not None:
                self.restart_from(a.restart_from, "--restart-from")
            self.log(f"driver start (pid {os.getpid()}): units {len(self.prog['done'])} done of {n}, running to {end}; "
                     f"revisits {a.revisits}, state {a.state}, void policy {a.void_policy}, hard limit {a.hard_min} min, "
                     f"effort {a.effort}{', FAKE' if a.fake else ''}; sandboxed calls, transcripts in {self.td_root}")
            while True:
                try:
                    self.run_units(end)
                    break
                except VoidHit as v:
                    u = v.round_unit
                    vr = self.void_restarts()
                    if a.void_policy == "restart" and vr.get(str(u), 0) < 1:
                        vr[str(u)] = vr.get(str(u), 0) + 1; wj(self.vr_p, vr)
                        self.unit_log(v.rec.get("unit", u), v.rec, {"valid": False, "void_policy": "restart", "round_unit": u})
                        self.log(f"void call {v.rec['call_id']}: restarting once from the snapshot before unit {u}")
                        self.restart_from(u, f"void call {v.rec['call_id']}: {v.rec['audit'].get('void', [])[:2]}")
                        continue
                    self.unit_log(v.rec.get("unit", u), v.rec, {"valid": False, "void_policy": a.void_policy, "round_unit": u})
                    wj(os.path.join(self.run, "VOID.json"), {"t": now(), "call_id": v.rec["call_id"], "round_unit": u,
                                                             "void": v.rec["audit"].get("void"),
                                                             "restarted_before": vr.get(str(u), 0),
                                                             "how_to_go_on": f"driver.py {self.run} --restart-from {u}"})
                    self.save_prog()
                    self.log(f"STOPPED: call {v.rec['call_id']} is void (round of unit {u}); its result was not used. "
                             f"See VOID.json; go on with --restart-from {u}")
                    sys.exit(3)
        except Stop as s:
            infl = rj(os.path.join(self.run, "inflight.json"), {})
            self.log(f"STOPPED by {s}: the running call (if any) was killed with its process group; a restart rolls back "
                     f"any half-applied step and goes on")
            crec = rj(os.path.join(self.calls_d, f"{infl.get('call_id')}.json"), {}) if infl else {}
            if crec and not crec.get("ended"):
                self.aborted_call(crec, f"driver stopped by {s}")
            if os.path.exists(self.pid_p):
                os.remove(self.pid_p)
            sys.exit(130)
        if not a.no_answer:
            self.answer()
        self.log(f"driver end: {len(self.prog['done'])} units done")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("run_dir")
    ap.add_argument("--restart-from", "--from", dest="restart_from", type=int,
                    help="restore the snapshot taken before unit N and go on from there")
    ap.add_argument("--to", type=int)
    ap.add_argument("--revisits", choices=["on", "off"], default="on")
    ap.add_argument("--state", choices=["on", "off"], default="on")
    ap.add_argument("--void-policy", choices=["stop", "restart"], default="stop")
    ap.add_argument("--max-parallel", type=int, default=1, help="only 1 is built")
    ap.add_argument("--hard-min", type=float, default=15.0)
    ap.add_argument("--effort", default="max")
    ap.add_argument("--no-answer", action="store_true")
    ap.add_argument("--fake", action="store_true", help="plumbing test: no model calls, the solver answers")
    ap.add_argument("--fake-sleep", type=float, default=None, help="with --fake: each call is a sandboxed sleep of S s")
    ap.add_argument("--test-void-at", type=int, default=None, help="test: the first write call of unit N is marked void")
    a = ap.parse_args()
    Driver(a).main()
