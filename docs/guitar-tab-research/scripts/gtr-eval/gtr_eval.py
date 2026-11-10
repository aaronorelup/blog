#!/usr/bin/env python3
"""gtr-eval: score one tool's output against a ground-truth file, the same way for every lane.

Usage:  gtr-eval <subcommand> --truth <id>.truth.json --est <file> [options] [--out result.json]

Subcommands: notes f0 beats tempo chords key tab stems onsets tuning check-truth selftest
`gtr-eval <subcommand> -h` lists the options of one subcommand. README.md next to the copy of this file in
docs/guitar-tab-research/scripts/gtr-eval/ says what every number means and which mir_eval call computes it.

Every subcommand prints one compact JSON object (one line) to stdout. It carries the gtr-eval version, the truth
id, file hashes, the counts, the metrics, the definitions used (tolerances, mir_eval function names) and a
"processing" list of everything that was done to the inputs (format detected, units detected, shifts, resampling).
Non-finite numbers are written as the strings "inf", "-inf" and "nan". Floats are rounded to 6 decimals.
"""
import argparse
import contextlib
import hashlib
import io
import json
import math
import os
import re
import sys
import warnings

import numpy as np

VERSION = "0.11.1"
VERSION_DATE = "2026-11-10"

VOICES = ("melody", "bass", "chord", "lead", "drums")
SOURCE_KINDS = ("synthesized", "dataset", "recording", "video")
AUDIO_EXTS = (".wav", ".flac", ".ogg", ".mp3", ".aiff", ".aif")
DEFAULT_INPUTS = "/home/user/gtr/inputs"


class EvalError(Exception):
    pass


# ----------------------------------------------------------------------------------------------------------------
# small helpers
# ----------------------------------------------------------------------------------------------------------------

def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def file_facts(path):
    if path is None:
        return None
    p = os.path.abspath(path)
    if not os.path.exists(p):
        return {"file": p, "exists": False}
    if os.path.isdir(p):
        return {"file": p, "directory": True}
    return {"file": p, "bytes": os.path.getsize(p), "sha256": sha256_of(p)}


def clean(o):
    """Make an object JSON-safe: numpy types to Python, floats rounded to 6 decimals, non-finite to strings."""
    if isinstance(o, dict):
        return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if isinstance(o, np.ndarray):
        return [clean(v) for v in o.tolist()]
    if isinstance(o, (bool, np.bool_)):
        return bool(o)
    if isinstance(o, (int, np.integer)):
        return int(o)
    if isinstance(o, (float, np.floating)):
        f = float(o)
        if math.isnan(f):
            return "nan"
        if math.isinf(f):
            return "inf" if f > 0 else "-inf"
        r = round(f, 6)
        return 0.0 if r == 0 else r
    return o


def midi_to_hz(m):
    return 440.0 * 2.0 ** ((np.asarray(m, dtype=float) - 69.0) / 12.0)


def hz_to_midi(f):
    return 69.0 + 12.0 * np.log2(np.asarray(f, dtype=float) / 440.0)


NUM_RE = re.compile(r"^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$")


def isnum(s):
    s = s.strip().strip('"').strip("'")
    return bool(NUM_RE.match(s)) or s.lower() in ("nan", "+nan", "-nan", "inf", "-inf", "+inf")


def tofloat(s):
    return float(s.strip().strip('"').strip("'"))


def libraries():
    import mir_eval
    out = {"python": sys.version.split()[0], "numpy": np.__version__, "mir_eval": mir_eval.__version__}
    return out


class Capture:
    """Collect warnings raised by mir_eval (and others) so stdout stays one JSON object; they go into processing."""

    def __init__(self, sink):
        self.sink = sink

    def __enter__(self):
        self._cm = warnings.catch_warnings(record=True)
        self._rec = self._cm.__enter__()
        warnings.simplefilter("always")
        return self

    def __exit__(self, *exc):
        for w in self._rec:
            msg = f"warning from {os.path.basename(w.filename)}: {w.message}"
            if msg not in self.sink:
                self.sink.append(msg)
        return self._cm.__exit__(*exc)


# ----------------------------------------------------------------------------------------------------------------
# truth
# ----------------------------------------------------------------------------------------------------------------

class Truth:
    def __init__(self, path):
        if path is None:
            raise EvalError("--truth <id>.truth.json is required")
        if not os.path.exists(path):
            raise EvalError(f"truth file not found: {path}")
        self.path = os.path.abspath(path)
        self.dir = os.path.dirname(self.path)
        with open(self.path, encoding="utf-8") as f:
            self.d = json.load(f)
        self.id = self.d.get("id")

    def get(self, k, default=None):
        v = self.d.get(k, default)
        return default if v is None else v

    def facts(self):
        return {"id": self.id, **file_facts(self.path)}

    def tuning(self):
        t = self.d.get("tuning_midi")
        return list(t) if t else None

    def capo(self):
        c = self.d.get("capo")
        return int(c) if c is not None else 0

    def cents(self):
        c = self.d.get("tuning_offset_cents")
        return float(c) if c is not None else 0.0

    def duration(self):
        d = self.d.get("duration_s")
        if d:
            return float(d)
        ends = [n.get("offset", 0) or 0 for n in (self.d.get("notes") or [])]
        ends += list(self.d.get("beats") or []) + [c.get("end", 0) for c in (self.d.get("chords") or [])]
        return float(max(ends) if ends else 0.0)

    def notes(self, voice=None, include_drums=False):
        """Truth notes as a list of dicts, sorted by (onset, pitch). Returns (notes, excluded_counts)."""
        sel, excluded = [], {}
        for n in self.d.get("notes") or []:
            v = n.get("voice")
            if voice is not None:
                if v != voice:
                    excluded[str(v)] = excluded.get(str(v), 0) + 1
                    continue
            elif v == "drums" and not include_drums:
                excluded["drums"] = excluded.get("drums", 0) + 1
                continue
            sel.append(n)
        sel.sort(key=lambda n: (float(n["onset"]), float(n["pitch"])))
        return sel, excluded


def resolve_truth_path(p):
    """Accept a truth file path, or a clip id (S2n) looked up under /home/user/gtr/inputs/<id>/<id>.truth.json."""
    if p and not os.path.exists(p) and re.match(r"^[A-Za-z0-9_.-]+$", p):
        cand = os.path.join(os.environ.get("GTR_INPUTS", DEFAULT_INPUTS), p, f"{p}.truth.json")
        if os.path.exists(cand):
            return cand
    return p


# ----------------------------------------------------------------------------------------------------------------
# generic text table reading
# ----------------------------------------------------------------------------------------------------------------

def read_lines(path):
    with open(path, encoding="utf-8-sig", errors="replace") as f:
        raw = f.read().splitlines()
    out, comments = [], 0
    for line in raw:
        s = line.strip()
        if not s:
            continue
        if s.startswith("#") or s.startswith("//") or s.startswith("%"):
            comments += 1
            continue
        out.append(s)
    return out, comments


def split_cells(lines):
    if not lines:
        return [], "empty"
    first = lines[0]
    if "\t" in first:
        d, name = "\t", "tab"
    elif "," in first:
        d, name = ",", "comma"
    elif ";" in first:
        d, name = ";", "semicolon"
    else:
        d, name = None, "whitespace"
    cells = []
    for line in lines:
        parts = line.split(d) if d else line.split()
        cells.append([c.strip().strip('"').strip("'") for c in parts])
    return cells, name


def read_table(path):
    """Returns (header or None, numeric-ish rows (list of lists of str), facts)."""
    lines, comments = read_lines(path)
    cells, delim = split_cells(lines)
    header = None
    if cells:
        r0 = cells[0]
        r1 = cells[1] if len(cells) > 1 else None
        nonnum = [i for i, c in enumerate(r0) if c and not isnum(c)]
        if nonnum and (r1 is None or any(i < len(r1) and isnum(r1[i]) for i in nonnum) or all(not isnum(c) for c in r0)):
            header = [c.lower() for c in r0]
            cells = cells[1:]
    facts = {"delimiter": delim, "header": header, "rows": len(cells), "comment_lines_skipped": comments}
    return header, cells, facts


def find_col(header, keys, exclude=()):
    if not header:
        return None
    for k in keys:  # keys in priority order
        for i, h in enumerate(header):
            if k in h and not any(x in h for x in exclude):
                return i
    return None


NOTE_NAME_RE = re.compile(r"^([A-Ga-g])([#b♯♭]*)(-?\d+)$")
PC = {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}


def note_name_to_midi(s):
    m = NOTE_NAME_RE.match(s.strip())
    if not m:
        return None
    pc = PC[m.group(1).lower()]
    for ch in m.group(2):
        pc += 1 if ch in "#♯" else -1
    return pc + 12 * (int(m.group(3)) + 1)


def detect_pitch_unit(values, header_name=None, forced="auto"):
    """Returns (unit, rule). unit is 'midi' or 'hz'."""
    if forced in ("midi", "hz"):
        return forced, f"pitch unit set by --pitch-unit {forced}"
    if header_name:
        h = header_name.lower()
        if "hz" in h or "freq" in h or h in ("f0",):
            return "hz", f"column/key name '{header_name}' names a frequency, read as Hz"
        if "midi" in h or "note" in h or "semitone" in h:
            return "midi", f"column/key name '{header_name}' names MIDI numbers, read as MIDI"
    v = np.asarray(values, dtype=float)
    v = v[np.isfinite(v)]
    if v.size == 0:
        return "midi", "no pitch values; unit irrelevant"
    if v.max() > 127.5:
        return "hz", "auto: at least one value is above 127.5 (outside the MIDI note range), read as Hz"
    if np.all(np.abs(v - np.round(v)) <= 0.01):
        return "midi", "auto: every value is within 0.01 of an integer between 0 and 127, read as MIDI note numbers"
    return "hz", ("auto: values are non-integer and all at most 127.5, read as Hz "
                  "(pass --pitch-unit midi if they are fractional MIDI numbers)")


# ----------------------------------------------------------------------------------------------------------------
# estimated notes (notes and tab)
# ----------------------------------------------------------------------------------------------------------------

class EstNotes:
    def __init__(self):
        self.onset = []
        self.offset = []  # None entries allowed
        self.pitch = []  # MIDI (float) or None
        self.string = []
        self.fret = []
        self.tuning = None  # tuning_midi low->high if the file states it
        self.capo = None
        self.cents = None
        self.ordered_only = False  # True for formats without absolute times (ASCII tab)
        self.facts = {}
        self.processing = []

    def add(self, onset, offset=None, pitch=None, string=None, fret=None):
        self.onset.append(float(onset))
        self.offset.append(None if offset is None else float(offset))
        self.pitch.append(None if pitch is None else float(pitch))
        self.string.append(None if string is None else int(string))
        self.fret.append(None if fret is None else int(fret))

    def __len__(self):
        return len(self.onset)


def _json_note_fields(o, unit_hint):
    """Map one JSON note object to (onset, offset, pitch_value, pitch_key, string, fret)."""
    def pick(keys):
        for k in keys:
            if k in o and o[k] is not None:
                return k, o[k]
        return None, None
    _, on = pick(("onset", "start", "start_time", "start_time_s", "onset_time", "time", "t", "begin"))
    _, off = pick(("offset", "end", "end_time", "end_time_s", "offset_time", "stop"))
    if off is None:
        _, dur = pick(("duration", "dur", "length"))
        if dur is not None and on is not None:
            off = float(on) + float(dur)
    pk, pv = pick(("pitch_midi", "midi", "midi_pitch", "note", "pitch", "pitch_hz", "frequency", "freq", "hz", "f0"))
    if isinstance(pv, str):
        m = note_name_to_midi(pv)
        pv, pk = (m, "note_name") if m is not None else (None, pk)
    _, s = pick(("string",))
    _, fr = pick(("fret",))
    return on, off, pv, pk, s, fr


def load_est_notes(path, a, want_tab=False):
    if path is None:
        raise EvalError("--est <file> is required")
    if not os.path.exists(path):
        raise EvalError(f"estimate file not found: {path}")
    ext = os.path.splitext(path)[1].lower()
    E = EstNotes()
    if ext in (".mid", ".midi", ".smf", ".kar"):
        _load_midi(path, a, E)
    elif ext in (".gp3", ".gp4", ".gp5", ".gtp"):
        _load_gp(path, a, E)
    elif ext in (".gpx", ".gp", ".gp6", ".gp7", ".gp8"):
        raise EvalError(f"{ext} files are Guitar Pro 6/7/8; PyGuitarPro reads only .gp3, .gp4 and .gp5. "
                        "Export to .gp5 or MusicXML/CSV first")
    elif ext in (".musicxml", ".xml", ".mxl"):
        _load_musicxml(path, a, E)
    elif ext == ".json":
        _load_json_notes(path, a, E)
    else:
        lines, _ = read_lines(path)
        if want_tab and looks_like_ascii_tab(lines):
            _load_ascii_tab(path, a, E)
        else:
            _load_table_notes(path, a, E, want_tab)
    return E


def parse_programs(spec):
    if not spec:
        return None
    out = set()
    for part in str(spec).split(","):
        part = part.strip()
        if "-" in part:
            lo, hi = part.split("-", 1)
            out |= set(range(int(lo), int(hi) + 1))
        elif part:
            out.add(int(part))
    return out


def _load_midi(path, a, E):
    import pretty_midi
    pm = pretty_midi.PrettyMIDI(path)
    insts = []
    for inst in pm.instruments:
        progs = parse_programs(getattr(a, "midi_programs", None))
        use = ((not inst.is_drum) or getattr(a, "include_drums", False)) and (progs is None or inst.program in progs)
        insts.append({"name": inst.name, "program": inst.program, "is_drum": inst.is_drum,
                      "n_notes": len(inst.notes), "used": bool(use),
                      "n_pitch_bends": len(inst.pitch_bends)})
        if not use:
            continue
        for n in inst.notes:
            E.add(n.start, n.end, n.pitch)
    E.facts = {"format": "midi", "reader": f"pretty_midi {pretty_midi.__version__}", "instruments": insts}
    E.processing.append("MIDI: notes of every non-drum instrument were pooled"
                        + (f" (only programs {getattr(a, 'midi_programs')}, 0-based GM numbers, --midi-programs)" if getattr(a, "midi_programs", None) else "")
                        + "; pitch is the MIDI note number; pitch bends are ignored")
    E.unit = "midi"
    E.unit_rule = "MIDI file note numbers"


def _load_json_notes(path, a, E):
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    container = "list"
    if isinstance(d, dict):
        E.tuning = d.get("tuning_midi") or d.get("tuning")
        if E.tuning is not None and not (isinstance(E.tuning, list) and all(isinstance(x, (int, float)) for x in E.tuning)):
            E.processing.append(f"JSON 'tuning' value {E.tuning!r} is not a list of MIDI numbers; ignored")
            E.tuning = None
        E.capo = d.get("capo")
        E.cents = d.get("tuning_offset_cents")
        for k in ("notes", "tab", "events", "data"):
            if isinstance(d.get(k), list):
                d, container = d[k], f"object with '{k}' list"
                break
        else:
            raise EvalError("JSON estimate: expected a list of notes or an object with a 'notes' list")
    rows, keys = [], set()
    for o in d:
        if isinstance(o, dict):
            on, off, pv, pk, s, fr = _json_note_fields(o, None)
            keys.add(pk)
        elif isinstance(o, (list, tuple)) and len(o) >= 3:
            on, off, pv, pk, s, fr = o[0], o[1], o[2], None, None, None
        else:
            raise EvalError(f"JSON estimate: cannot read note entry {o!r}")
        if on is None:
            raise EvalError(f"JSON estimate: note without an onset: {o!r}")
        rows.append((on, off, pv, s, fr))
    pkey = sorted(k for k in keys if k)[0] if len([k for k in keys if k]) == 1 else None
    vals = [r[2] for r in rows if r[2] is not None]
    unit, rule = detect_pitch_unit(vals, pkey if pkey != "note_name" else "midi", getattr(a, "pitch_unit", "auto"))
    if pkey == "note_name":
        unit, rule = "midi", "pitch given as note names (e.g. C#4, C4 = MIDI 60), converted to MIDI"
    for on, off, pv, s, fr in rows:
        p = None if pv is None else (float(pv) if unit == "midi" else float(hz_to_midi(float(pv))))
        E.add(on, off, p, s, fr)
    E.facts = {"format": "json", "container": container, "pitch_key": pkey}
    E.unit, E.unit_rule = unit, rule


def _load_table_notes(path, a, E, want_tab):
    header, rows, facts = read_table(path)
    cols = getattr(a, "cols", None)
    names = None
    if cols:
        names = [c.strip().lower() for c in cols.split(",")]
        idx = {n: i for i, n in enumerate(names) if n != "skip"}
        how = f"--cols {cols}"
    elif header:
        idx = {}
        i_on = find_col(header, ("onset", "start", "begin"), exclude=("end",))
        if i_on is None:
            i_on = find_col(header, ("time",), exclude=("end", "off", "dur"))
        idx["onset"] = i_on
        idx["offset"] = find_col(header, ("offset", "end", "stop"))
        idx["duration"] = find_col(header, ("dur", "length"))
        idx["pitch"] = find_col(header, ("pitch_midi", "midi", "pitch", "note", "freq", "hz", "f0"),
                                exclude=("bend", "velocity", "name_"))
        idx["string"] = find_col(header, ("string",))
        idx["fret"] = find_col(header, ("fret",))
        idx = {k: v for k, v in idx.items() if v is not None}
        how = "column names in the header row"
    else:
        if want_tab:
            names = ["onset", "pitch", "string", "fret"]
        else:
            names = ["onset", "offset", "pitch"]
        idx = {n: i for i, n in enumerate(names)}
        how = f"no header row: columns read as {','.join(names)} (override with --cols)"
    if "onset" not in idx:
        raise EvalError(f"could not find an onset column in {path} (header {header}); use --cols")
    pname = header[idx["pitch"]] if (header and "pitch" in idx and not cols) else None
    raw_p = []
    for r in rows:
        if "pitch" in idx and idx["pitch"] < len(r) and r[idx["pitch"]] != "":
            c = r[idx["pitch"]]
            raw_p.append(note_name_to_midi(c) if not isnum(c) else tofloat(c))
    note_names = any(not isnum(r[idx["pitch"]]) for r in rows if "pitch" in idx and idx["pitch"] < len(r) and r[idx["pitch"]])
    if note_names:
        unit, rule = "midi", "pitch given as note names (C4 = MIDI 60), converted to MIDI"
    else:
        unit, rule = detect_pitch_unit([v for v in raw_p if v is not None], pname, getattr(a, "pitch_unit", "auto"))
    bad = 0
    for r in rows:
        def cell(k):
            i = idx.get(k)
            if i is None or i >= len(r) or r[i] == "":
                return None
            return r[i]
        try:
            on = tofloat(cell("onset"))
        except (TypeError, ValueError):
            bad += 1
            continue
        off = cell("offset")
        off = tofloat(off) if off is not None else None
        if off is None and cell("duration") is not None:
            off = on + tofloat(cell("duration"))
        pc = cell("pitch")
        p = None
        if pc is not None:
            pv = note_name_to_midi(pc) if not isnum(pc) else tofloat(pc)
            if pv is not None:
                p = float(pv) if unit == "midi" else float(hz_to_midi(pv))
        s, fr = cell("string"), cell("fret")
        try:
            s = int(round(tofloat(s))) if s is not None else None
            fr = int(round(tofloat(fr))) if fr is not None else None
        except ValueError:
            s = fr = None
        E.add(on, off, p, s, fr)
    if bad:
        E.processing.append(f"{bad} rows without a numeric onset were skipped")
    E.facts = {"format": "table", **facts, "columns": {k: v + 1 for k, v in idx.items()}, "columns_from": how}
    E.unit, E.unit_rule = unit, rule


# --- Guitar Pro 3/4/5 via PyGuitarPro ---------------------------------------------------------------------------

def _load_gp(path, a, E):
    import guitarpro
    from guitarpro.models import NoteType
    song = guitarpro.parse(path)
    tracks = []
    for t in song.tracks:
        n = sum(len(b.notes) for m in t.measures for v in m.voices for b in v.beats)
        tracks.append({"number": t.number, "name": t.name, "percussion": t.isPercussionTrack,
                       "strings": len(t.strings), "capo": t.offset, "n_notes": n})
    sel = getattr(a, "track", None)
    if sel:
        if not (1 <= sel <= len(song.tracks)):
            raise EvalError(f"--track {sel}: file has {len(song.tracks)} tracks")
        track = song.tracks[sel - 1]
        how = f"--track {sel}"
    else:
        cands = [t for t, f in zip(song.tracks, tracks) if not f["percussion"] and f["n_notes"] > 0]
        if not cands:
            raise EvalError("Guitar Pro file has no non-percussion track with notes")
        track = cands[0]
        how = "first non-percussion track with notes (choose another with --track N)"
    # tempo map in ticks (960 per quarter note); the first measure starts at tick 960 in PyGuitarPro
    q = 960
    events = {q: float(song.tempo)}
    for t in song.tracks:
        for m in t.measures:
            for v in m.voices:
                for b in v.beats:
                    mtc = getattr(b.effect, "mixTableChange", None)
                    if mtc is not None and getattr(mtc, "tempo", None) is not None and b.start is not None:
                        events[int(b.start)] = float(mtc.tempo.value)
    tmap = sorted(events.items())
    first_tick = min((h.start for h in song.measureHeaders), default=q)

    def tick_to_s(tick):
        s, prev_t, prev_bpm = 0.0, first_tick, tmap[0][1]
        for et, bpm in tmap:
            if et <= first_tick:
                prev_bpm = bpm
                continue
            if et >= tick:
                break
            s += (et - prev_t) / q * 60.0 / prev_bpm
            prev_t, prev_bpm = et, bpm
        return s + (tick - prev_t) / q * 60.0 / prev_bpm

    by_num = {gs.number: gs.value for gs in track.strings}
    nstr = len(track.strings)
    E.tuning = [by_num[k] for k in sorted(by_num, reverse=True)]  # low (highest string number) to high (string 1)
    E.capo = int(track.offset)
    ties = dead = 0
    for m in track.measures:
        for v in m.voices:
            for b in v.beats:
                if b.start is None:
                    continue
                for n in b.notes:
                    if n.type == NoteType.tie:
                        ties += 1
                        continue
                    if n.type == NoteType.dead:
                        dead += 1
                        continue
                    if n.type == NoteType.rest:
                        continue
                    on = tick_to_s(b.start)
                    off = tick_to_s(b.start + b.duration.time)
                    pitch = by_num[n.string] + E.capo + n.value
                    E.add(on, off, pitch, n.string, n.value)
    E.facts = {"format": f"guitar pro ({os.path.splitext(path)[1]})", "reader": f"PyGuitarPro {guitarpro.__version__ if hasattr(guitarpro, '__version__') else ''}".strip(),
               "tracks": tracks, "track_used": track.number, "track_chosen_by": how, "n_strings": nstr,
               "tempo_events_bpm": [[round(tick_to_s(t), 4), bpm] for t, bpm in tmap],
               "tied_notes_skipped": ties, "dead_notes_skipped": dead}
    E.processing.append("Guitar Pro: times computed from beat positions (960 ticks per quarter note) and the tempo "
                        "map (song tempo plus mix-table tempo changes), first measure at 0 s; repeats are not "
                        "expanded; tied notes continue the earlier note and are not counted as new notes; dead "
                        "(x) notes are skipped")
    E.processing.append("Guitar Pro: sounding pitch = string tuning + capo (Track.offset) + fret, the same convention "
                        "as the truth schema (PyGuitarPro's Note.realValue leaves the capo out)")
    E.unit, E.unit_rule = "midi", "computed from string tuning + capo + fret"


# --- MusicXML (partwise, .musicxml/.xml or compressed .mxl) -----------------------------------------------------

STEP_PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def _musicxml_bytes(path):
    import zipfile
    if os.path.getsize(path) > 64 * 1024 * 1024:
        raise EvalError("MusicXML file larger than 64 MB; not read")
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as z:
            names = z.namelist()
            target = None
            if "META-INF/container.xml" in names:
                m = re.search(rb'full-path="([^"]+)"', z.read("META-INF/container.xml"))
                target = m.group(1).decode() if m else None
            if target is None:
                target = next((n for n in names if n.lower().endswith((".musicxml", ".xml")) and not n.startswith("META-INF")), None)
            if target is None:
                raise EvalError("compressed MusicXML without a score file inside")
            return z.read(target), f"compressed MusicXML (.mxl), score file {target}"
    with open(path, "rb") as f:
        return f.read(), "MusicXML"


def _load_musicxml(path, a, E):
    import xml.etree.ElementTree as ET
    data, kind = _musicxml_bytes(path)
    if re.search(rb"<!ENTITY", data[:20000]):
        raise EvalError("MusicXML declares XML entities; not read (entity expansion is unsafe)")
    root = ET.fromstring(data)
    for el in root.iter():  # drop namespaces
        if isinstance(el.tag, str) and "}" in el.tag:
            el.tag = el.tag.split("}", 1)[1]
    if root.tag != "score-partwise":
        raise EvalError(f"MusicXML root <{root.tag}> is not score-partwise; convert it first")
    names = {sp.get("id"): (sp.findtext("part-name") or "") for sp in root.iter("score-part")}
    parts = root.findall("part")
    want_tab = getattr(a, "cmd", None) == "tab"
    parsed = []
    for part in parts:
        divisions, qpos, max_q = 1.0, 0.0, 0.0
        tempo_events = []  # (quarter position, bpm)
        tuning, capo, transpose = {}, None, 0
        notes, ties, graces, unpitched = [], 0, 0, 0
        last_onset_q = 0.0
        measure_start = 0.0
        for meas in part.findall("measure"):
            qpos = measure_start
            max_q = measure_start
            for el in meas:
                tag = el.tag
                if tag == "attributes":
                    if el.findtext("divisions"):
                        divisions = float(el.findtext("divisions"))
                    for st in el.iter("staff-tuning"):
                        line = int(st.get("line", "0"))
                        step = st.findtext("tuning-step")
                        if step:
                            midi = STEP_PC[step.strip()] + int(float(st.findtext("tuning-alter") or 0)) + 12 * (int(st.findtext("tuning-octave")) + 1)
                            tuning[line] = midi
                    if el.find("staff-details/capo") is not None:
                        capo = int(el.findtext("staff-details/capo"))
                    tr = el.find("transpose")
                    if tr is not None:
                        transpose = int(float(tr.findtext("chromatic") or 0)) + 12 * int(float(tr.findtext("octave-change") or 0))
                elif tag in ("direction", "sound"):
                    snd = el if tag == "sound" else el.find(".//sound")
                    if snd is not None and snd.get("tempo"):
                        tempo_events.append((qpos, float(snd.get("tempo"))))
                elif tag == "backup":
                    qpos -= float(el.findtext("duration") or 0) / divisions
                elif tag == "forward":
                    qpos += float(el.findtext("duration") or 0) / divisions
                    max_q = max(max_q, qpos)
                elif tag == "note":
                    snd = el.find(".//sound")
                    if snd is not None and snd.get("tempo"):
                        tempo_events.append((qpos, float(snd.get("tempo"))))
                    dur_q = float(el.findtext("duration") or 0) / divisions
                    is_chord = el.find("chord") is not None
                    if el.find("grace") is not None:
                        graces += 1
                        continue
                    onset_q = last_onset_q if is_chord else qpos
                    if not is_chord:
                        last_onset_q = qpos
                        qpos += dur_q
                        max_q = max(max_q, qpos)
                    if el.find("rest") is not None:
                        continue
                    if el.find("unpitched") is not None:
                        unpitched += 1
                        continue
                    tie_types = {t.get("type") for t in el.findall("tie")}
                    if "stop" in tie_types:
                        ties += 1
                        continue
                    pitch = None
                    if el.find("pitch") is not None:
                        pe = el.find("pitch")
                        pitch = STEP_PC[pe.findtext("step").strip()] + float(pe.findtext("alter") or 0) + 12 * (int(pe.findtext("octave")) + 1)
                    s_ = el.findtext("notations/technical/string")
                    f_ = el.findtext("notations/technical/fret")
                    notes.append([onset_q, onset_q + dur_q, pitch, int(s_) if s_ else None, int(f_) if f_ else None])
            measure_start = max_q
        parsed.append({"id": part.get("id"), "name": names.get(part.get("id"), ""), "notes": notes, "tempo": tempo_events,
                       "tuning": tuning, "capo": capo, "transpose": transpose, "ties": ties, "graces": graces,
                       "unpitched": unpitched})
    info = [{"number": i + 1, "id": p["id"], "name": p["name"], "n_notes": len(p["notes"]),
             "with_string_fret": sum(1 for n in p["notes"] if n[3] is not None and n[4] is not None),
             "staff_tuning": [p["tuning"][k] for k in sorted(p["tuning"])] or None, "capo": p["capo"],
             "transpose_semitones": p["transpose"]} for i, p in enumerate(parsed)]
    sel = getattr(a, "track", None)
    if sel:
        if not (1 <= sel <= len(parsed)):
            raise EvalError(f"--track {sel}: file has {len(parsed)} parts")
        use = [parsed[sel - 1]]
        how = f"--track {sel}"
    elif want_tab:
        cands = [p for p in parsed if any(n[3] is not None for n in p["notes"])]
        if not cands:
            raise EvalError("MusicXML has no part with <string>/<fret> technical marks")
        use = [cands[0]]
        how = "first part with string/fret marks (choose another with --track N)"
    else:
        use = [p for p in parsed if p["notes"] and not p["unpitched"]] or parsed
        how = "notes of every part with pitched notes pooled"
    q = 0
    for p in use:
        ev = sorted(p["tempo"]) or [(0.0, 120.0)]
        if ev[0][0] > 0:
            ev = [(0.0, ev[0][1])] + ev
        def q_to_s(x, ev=ev):
            s_, pq, pb = 0.0, 0.0, ev[0][1]
            for eq, bpm in ev:
                if eq >= x:
                    break
                s_ += (eq - pq) * 60.0 / pb
                pq, pb = eq, bpm
            return s_ + (x - pq) * 60.0 / pb
        if p["tuning"]:
            E.tuning = [p["tuning"][k] for k in sorted(p["tuning"])]  # staff line 1 = bottom line = lowest string
        if p["capo"] is not None:
            E.capo = p["capo"]
        mism = 0
        for on_q, off_q, pitch, s_, f_ in p["notes"]:
            sounding = None if pitch is None else pitch + p["transpose"]
            if s_ is not None and f_ is not None and E.tuning and 1 <= s_ <= len(E.tuning):
                derived = E.tuning[len(E.tuning) - s_] + (E.capo or 0) + f_
                if sounding is not None and abs(sounding - derived) > 0.5:
                    mism += 1
            E.add(q_to_s(on_q), q_to_s(off_q), sounding, s_, f_)
            q += 1
        if mism:
            E.processing.append(f"MusicXML part {p['id']}: {mism} notes whose <pitch> (plus <transpose>) differs from "
                                "staff tuning + capo + fret; the <pitch> value is used as the note's pitch")
        if not p["tempo"]:
            E.processing.append(f"MusicXML part {p['id']}: no <sound tempo>, 120 quarter notes per minute assumed")
    E.facts = {"format": kind, "parts": info, "parts_used": [p["id"] for p in use], "parts_chosen_by": how,
               "tied_notes_skipped": sum(p["ties"] for p in use), "grace_notes_skipped": sum(p["graces"] for p in use),
               "unpitched_notes_skipped": sum(p["unpitched"] for p in use)}
    E.processing.append("MusicXML: times from <duration>/<divisions> and <sound tempo> (quarter notes per minute), first "
                        "measure at 0 s, <backup>/<forward> followed, repeats not expanded; tie continuations and grace "
                        "notes are not new notes; pitch = <pitch> + <transpose> (chromatic + 12 x octave-change); "
                        "staff-tuning line 1 (bottom line) is the lowest string")
    E.unit, E.unit_rule = "midi", "MusicXML <pitch> elements"


# --- ASCII tab --------------------------------------------------------------------------------------------------

TAB_LINE_RE = re.compile(r"^\s*([A-Ga-g][#b]?-?\d?)?\s*[|:]([-0-9|:a-zA-Z~/\\^()<>.*=\s]*)$")


CAPO_RES = [
    (re.compile(r"\bno\s+capo\b", re.I), lambda m: 0),
    (re.compile(r"\bcapo\s*[:=]?\s*(?:none|no|off)\b", re.I), lambda m: 0),
    (re.compile(r"\bcapo\s*[:=]?\s*(?:on\s+|at\s+)?(?:the\s+)?(?:fret\s*)?(\d{1,2})(?:st|nd|rd|th)?\b", re.I),
     lambda m: int(m.group(1))),
]


def looks_like_ascii_tab(lines):
    run = best = 0
    for s in lines:
        if TAB_LINE_RE.match(s) and s.count("-") >= 3:
            run += 1
            best = max(best, run)
        else:
            run = 0
    return best >= 4


def _load_ascii_tab(path, a, E):
    with open(path, encoding="utf-8-sig", errors="replace") as f:
        raw = f.read().splitlines()
    blocks, cur = [], []
    for s in raw:
        m = TAB_LINE_RE.match(s.strip()) if s.strip() else None
        if m and s.count("-") >= 3:
            cur.append((m.group(1), s.strip()))
        else:
            if cur:
                blocks.append(cur)
            cur = []
    if cur:
        blocks.append(cur)
    blocks = [b for b in blocks if len(b) >= 4]
    if not blocks:
        raise EvalError("no ASCII tab staff (4 or more lines like 'e|---0---|') found")
    nstr = len(blocks[0])
    labels = [lab for lab, _ in blocks[0]]
    events = []  # (order_key, string, fret)
    xs = 0
    for bi, blk in enumerate(blocks):
        if len(blk) != nstr:
            E.processing.append(f"ASCII tab block {bi + 1} has {len(blk)} lines, first block has {nstr}; skipped")
            continue
        for si, (lab, line) in enumerate(blk):
            body = line[line.index("|") + 1:] if "|" in line else line[line.index(":") + 1:]
            i = 0
            while i < len(body):
                if body[i].isdigit():
                    j = i
                    while j < len(body) and body[j].isdigit() and j - i < 2:
                        j += 1
                    events.append(((bi, i), si + 1, int(body[i:j])))
                    i = j
                else:
                    if body[i] in "xX":
                        xs += 1
                    i += 1
    order = sorted({k for k, _, _ in events})
    rank = {k: r for r, k in enumerate(order)}
    tuning = getattr(a, "est_tuning_list", None)
    for k, s, fr in events:
        E.add(float(rank[k]), None, None, s, fr)
    E.ordered_only = True
    for s in raw:
        if TAB_LINE_RE.match(s.strip() or "x") and s.count("-") >= 3:
            continue
        for rx, val in CAPO_RES:
            mcap = rx.search(s)
            if mcap and val(mcap) <= 24:
                E.capo = val(mcap)
                E.processing.append(f"ASCII tab: capo {E.capo} read from the line {s.strip()[:100]!r}")
                break
        if E.capo is not None:
            break
    octs = [note_name_to_midi(l) if l else None for l in labels]
    if all(o is not None for o in octs):
        E.tuning = list(reversed(octs))
        E.processing.append(f"ASCII tab: every string label names an octave ({labels}), so they give the estimate's tuning {E.tuning}")
    E.facts = {"format": "ascii tab", "staff_blocks": len(blocks), "strings_per_block": nstr, "string_labels": labels,
               "muted_x_marks_skipped": xs, "events": len(order)}
    E.processing.append("ASCII tab: each staff line is one string, top line = string 1; a run of 1-2 digits is a "
                        "fret; notes in the same character column are simultaneous; the order of columns (then "
                        "staff blocks) is the only timing, so tab matching uses --ignore-time order alignment")
    E.unit, E.unit_rule = "midi", "computed from string tuning + capo + fret"


# ----------------------------------------------------------------------------------------------------------------
# note matching
# ----------------------------------------------------------------------------------------------------------------

def match_notes_custom(ref_iv, ref_hz, est_iv, est_hz, onset_tol=0.05, pitch_tol=50.0, offset_ratio=None,
                       offset_min_tol=0.05, chroma=False):
    """Same procedure as mir_eval.transcription.match_notes (non-strict, onset/offset distances rounded to
    N_DECIMALS, maximum bipartite matching with mir_eval.util._bipartite_match), except that with chroma=True the
    pitch distance is the circular distance between pitch classes: min(d mod 1200, 1200 - d mod 1200) cents."""
    from mir_eval import util
    from mir_eval.transcription import N_DECIMALS
    if len(ref_hz) == 0 or len(est_hz) == 0:
        return []
    on = np.around(np.abs(np.subtract.outer(ref_iv[:, 0], est_iv[:, 0])), decimals=N_DECIMALS) <= onset_tol
    cents = 1200.0 * np.subtract.outer(np.log2(ref_hz), np.log2(est_hz))
    if chroma:
        d = np.mod(np.abs(cents), 1200.0)
        d = np.minimum(d, 1200.0 - d)
    else:
        d = np.abs(cents)
    hit = on & (d <= pitch_tol)
    if offset_ratio is not None:
        offd = np.around(np.abs(np.subtract.outer(ref_iv[:, 1], est_iv[:, 1])), decimals=N_DECIMALS)
        tol = np.maximum(offset_ratio * (ref_iv[:, 1] - ref_iv[:, 0]), offset_min_tol)
        hit &= offd <= tol.reshape(-1, 1)
    G = {}
    for r, e in zip(*np.where(hit)):
        G.setdefault(e, []).append(r)
    return sorted(util._bipartite_match(G).items())


def timing_stats(diffs):
    """Statistics of (estimated time - truth time) over matched pairs, in seconds."""
    d = np.asarray(diffs, dtype=float)
    if d.size == 0:
        return None
    return {"n_pairs": int(d.size), "median_s": float(np.median(d)), "mean_s": float(np.mean(d)),
            "mean_abs_s": float(np.mean(np.abs(d))), "p95_abs_s": float(np.percentile(np.abs(d), 95)),
            "max_abs_s": float(np.max(np.abs(d)))}


TIMING_DEF = ("over the matched pairs above: estimated time minus truth time, in seconds (median, mean, mean of the "
              "absolute value, 95th percentile of the absolute value, largest absolute value); positive = the "
              "estimate is late")


def prf(n_match, n_ref, n_est):
    p = n_match / n_est if n_est else 0.0
    r = n_match / n_ref if n_ref else 0.0
    f = 2 * p * r / (p + r) if (p + r) > 0 else 0.0
    return p, r, f


# ----------------------------------------------------------------------------------------------------------------
# notes
# ----------------------------------------------------------------------------------------------------------------

def cmd_notes(a):
    import mir_eval
    T = Truth(a.truth)
    proc = []
    ref, excluded = T.notes(a.voice, a.include_drums)
    if a.voice is not None and not ref:
        raise EvalError(f"truth has no notes with voice '{a.voice}' (voices present: "
                        f"{sorted({str(n.get('voice')) for n in T.get('notes', [])})})")
    if excluded:
        proc.append(f"truth notes left out: {excluded} " + ("(--voice)" if a.voice else "(drums; --include-drums keeps them)"))
    E = load_est_notes(a.est, a)
    proc += E.processing
    proc.append(f"estimate pitch unit: {E.unit} ({E.unit_rule})")
    keep = [i for i in range(len(E)) if E.pitch[i] is not None]
    if len(keep) < len(E):
        proc.append(f"{len(E) - len(keep)} estimated notes without a pitch were left out")
    on = np.array([E.onset[i] for i in keep], dtype=float)
    offs = [E.offset[i] for i in keep]
    has_off = all(o is not None for o in offs)
    off = np.array([o if o is not None else E.onset[i] for o, i in zip(offs, keep)], dtype=float)
    pm = np.array([E.pitch[i] for i in keep], dtype=float)
    if a.time_shift:
        on, off = on + a.time_shift, off + a.time_shift
        proc.append(f"--time-shift {a.time_shift} s added to every estimated onset and offset")
    if a.pitch_shift:
        pm = pm + a.pitch_shift
        proc.append(f"--pitch-shift {a.pitch_shift} semitones added to every estimated pitch")
    neg = off < on
    if neg.any():
        off[neg] = on[neg]
    # mir_eval.transcription requires every interval to have a strictly positive duration
    if has_off:
        short = off <= on
        if short.any():
            off[short] = on[short] + 0.001
            proc.append(f"{int(short.sum())} estimated notes had offset <= onset; offset set to onset + 0.001 s "
                        "(mir_eval.transcription needs positive durations)")
    else:
        off = on + 0.001
    ref_iv = np.array([[float(n["onset"]), float(n["offset"])] for n in ref], dtype=float).reshape(-1, 2)
    if len(ref):
        rshort = ref_iv[:, 1] <= ref_iv[:, 0]
        if rshort.any():
            ref_iv[rshort, 1] = ref_iv[rshort, 0] + 0.001
            proc.append(f"{int(rshort.sum())} truth notes had offset <= onset; offset set to onset + 0.001 s")
    ref_m = np.array([float(n["pitch"]) for n in ref], dtype=float)
    if a.apply_tuning_offset and T.cents():
        ref_m = ref_m + T.cents() / 100.0
        proc.append(f"truth pitches shifted by the truth tuning_offset_cents ({T.cents()}) (--apply-tuning-offset)")
    ref_hz, est_hz = midi_to_hz(ref_m), midi_to_hz(pm)
    est_iv = np.stack([on, off], axis=1) if len(on) else np.zeros((0, 2))
    lo = min(float(est_iv.min()) if len(on) else 0.0, float(ref_iv.min()) if len(ref) else 0.0)
    if lo < 0:  # mir_eval refuses negative times; moving both sides by the same amount changes no difference
        est_iv, ref_iv = est_iv - lo, ref_iv - lo
        proc.append(f"some estimated times were negative (lowest {lo:.6f} s); {-lo:.6f} s was added to every truth and "
                    "estimated time before matching, which leaves every time difference unchanged")
    tol = a.onset_tol
    voices = [str(n.get("voice")) for n in ref]
    metrics = {}
    with Capture(proc):
        P, R, F, AOR = mir_eval.transcription.precision_recall_f1_overlap(
            ref_iv, ref_hz, est_iv, est_hz, onset_tolerance=tol, pitch_tolerance=50.0, offset_ratio=None)
        m_on = mir_eval.transcription.match_notes(ref_iv, ref_hz, est_iv, est_hz, onset_tolerance=tol,
                                                  pitch_tolerance=50.0, offset_ratio=None) if len(ref) and len(on) else []
        metrics["onset_only"] = {"precision": P, "recall": R, "f1": F, "avg_overlap_ratio": AOR if has_off else None,
                                 "n_matched": len(m_on)}
        m_off = None
        if has_off:
            P2, R2, F2, AOR2 = mir_eval.transcription.precision_recall_f1_overlap(
                ref_iv, ref_hz, est_iv, est_hz, onset_tolerance=tol, pitch_tolerance=50.0, offset_ratio=0.2,
                offset_min_tolerance=0.05)
            m_off = mir_eval.transcription.match_notes(ref_iv, ref_hz, est_iv, est_hz, onset_tolerance=tol,
                                                       pitch_tolerance=50.0, offset_ratio=0.2,
                                                       offset_min_tolerance=0.05) if len(ref) and len(on) else []
            metrics["onset_offset"] = {"precision": P2, "recall": R2, "f1": F2, "avg_overlap_ratio": AOR2,
                                       "n_matched": len(m_off)}
        else:
            metrics["onset_offset"] = None
            proc.append("the estimate has no offsets for some or all notes, so onset+offset metrics are not computed")
    if a.chroma:
        mc = match_notes_custom(ref_iv, ref_hz, est_iv, est_hz, tol, 50.0, None, chroma=True)
        p, r, f = prf(len(mc), len(ref), len(on))
        metrics["chroma_onset_only"] = {"precision": p, "recall": r, "f1": f, "n_matched": len(mc)}
        if has_off:
            mc2 = match_notes_custom(ref_iv, ref_hz, est_iv, est_hz, tol, 50.0, 0.2, 0.05, chroma=True)
            p, r, f = prf(len(mc2), len(ref), len(on))
            metrics["chroma_onset_offset"] = {"precision": p, "recall": r, "f1": f, "n_matched": len(mc2)}
    byv = {}
    for v in sorted(set(voices)):
        idx = {i for i, x in enumerate(voices) if x == v}
        d = {"n_truth": len(idx)}
        k = sum(1 for r_, _ in m_on if r_ in idx)
        d.update({"onset_only_matched": k, "onset_only_recall": k / len(idx)})
        if m_off is not None:
            k2 = sum(1 for r_, _ in m_off if r_ in idx)
            d.update({"onset_offset_matched": k2, "onset_offset_recall": k2 / len(idx)})
        byv[v] = d
    metrics["recall_by_voice"] = byv
    metrics["onset_timing_of_matched"] = timing_stats([est_iv[j, 0] - ref_iv[i, 0] for i, j in m_on])
    defs = {
        "onset_only": (f"mir_eval.transcription.precision_recall_f1_overlap(ref_intervals, ref_pitches_hz, "
                       f"est_intervals, est_pitches_hz, onset_tolerance={tol}, pitch_tolerance=50.0, "
                       "offset_ratio=None). A truth note and an estimated note match when their onsets differ by at "
                       f"most {tol} s and their pitches by at most 50 cents; offsets are ignored. Each note matches "
                       "at most one other (maximum bipartite matching). precision = n_matched/n_est, recall = "
                       "n_matched/n_truth, f1 = 2PR/(P+R). avg_overlap_ratio: mean over matched pairs of "
                       "(overlap of the two intervals)/(union of the two intervals)"),
        "onset_offset": (f"same call with offset_ratio=0.2, offset_min_tolerance=0.05 (mir_eval defaults): in addition "
                         "the estimated offset must lie within max(0.2 x truth note duration, 0.05 s) of the truth "
                         "offset"),
        "onset_timing_of_matched": "onset-only matched pairs; " + TIMING_DEF,
        "recall_by_voice": ("for each truth voice: matched truth notes of that voice / truth notes of that voice, "
                            "using the matchings above (estimated notes carry no voice, so there is no precision "
                            "per voice)"),
        "n_matched": "mir_eval.transcription.match_notes with the same parameters",
        "pitch": "truth pitch = the truth note's MIDI number converted to Hz (440 * 2^((m-69)/12)); estimated pitches likewise",
    }
    if a.chroma:
        defs["chroma_onset_only"] = ("same as onset_only, but the pitch condition is on pitch class: circular distance "
                                     "min(|d| mod 1200, 1200 - |d| mod 1200) <= 50 cents, so octave errors match. "
                                     "Computed with gtr-eval's copy of mir_eval.transcription.match_notes "
                                     "(match_notes_custom), the selftest checks it equals mir_eval's when chroma is off")
        defs["chroma_onset_offset"] = "same as onset_offset with the pitch-class condition"
    if a.voice:
        defs["voice_filter"] = (f"only truth notes with voice '{a.voice}' are the reference; estimated notes that match "
                                "notes of other voices count as unmatched, which lowers precision")
    return {
        "subcommand": "notes", "truth": T.facts(), "est": {**file_facts(a.est), **E.facts},
        "options": {"voice": a.voice, "onset_tol": tol, "pitch_shift": a.pitch_shift, "time_shift": a.time_shift,
                    "chroma": a.chroma, "include_drums": a.include_drums, "apply_tuning_offset": a.apply_tuning_offset,
                    "midi_programs": a.midi_programs,
                    "pitch_unit": a.pitch_unit},
        "counts": {"n_truth": len(ref), "n_est": int(len(on)), "n_truth_left_out": excluded,
                   "n_matched_onset_only": len(m_on), "n_matched_onset_offset": (len(m_off) if m_off is not None else None)},
        "metrics": metrics, "definitions": defs, "processing": proc,
    }


# ----------------------------------------------------------------------------------------------------------------
# f0
# ----------------------------------------------------------------------------------------------------------------

def truth_f0(T, voice=None, hop=0.01, nominal=False, proc=None):
    notes_all, _ = T.notes(None, False)
    if voice:
        sel = [n for n in notes_all if n.get("voice") == voice]
        rule = f"truth notes with voice '{voice}' (--voice)"
        if not sel:
            raise EvalError(f"truth has no notes with voice '{voice}'")
    elif any(n.get("voice") == "melody" for n in notes_all):
        sel = [n for n in notes_all if n.get("voice") == "melody"]
        rule = "truth notes with voice 'melody'"
    else:
        sel = notes_all
        rule = "all truth notes (there is no 'melody' voice)"
    sel = sorted(sel, key=lambda n: (float(n["onset"]), float(n["pitch"])))
    overlaps = sum(1 for x, y in zip(sel, sel[1:]) if float(y["onset"]) < float(x["offset"]))
    if overlaps and not voice and not any(n.get("voice") == "melody" for n in notes_all):
        raise EvalError(f"truth has no 'melody' voice and its notes overlap ({overlaps} overlaps), so there is no "
                        "single reference f0; pick a voice with --voice")
    dur = T.duration()
    n = int(math.floor(dur / hop + 1e-9)) + 1
    times = np.arange(n) * hop
    freq = np.zeros(n)
    cents = 0.0 if nominal else T.cents()
    for x in sel:  # later onsets overwrite earlier ones: "latest onset wins" where notes overlap
        m = (times >= float(x["onset"]) - 1e-9) & (times < float(x["offset"]) - 1e-9)
        freq[m] = float(midi_to_hz(float(x["pitch"]) + cents / 100.0))
    info = {"reference_notes": rule, "n_reference_notes": len(sel), "n_overlapping_consecutive_pairs": overlaps,
            "hop_s": hop, "n_frames": n, "tuning_offset_cents_applied": cents}
    return times, freq, info


def cmd_f0(a):
    import mir_eval
    T = Truth(a.truth)
    proc = []
    ref_t, ref_f, info = truth_f0(T, a.voice, 0.01, a.nominal, proc)
    if info["n_overlapping_consecutive_pairs"]:
        proc.append(f"{info['n_overlapping_consecutive_pairs']} reference notes start before the previous one ends; "
                    "on the grid the later onset wins")
    header, rows, facts = read_table(a.est)
    it = find_col(header, ("time", "timestamp", "sec")) if header else None
    if_ = find_col(header, ("freq", "f0", "hz", "pitch", "midi")) if header else None
    ic = find_col(header, ("conf", "voic", "periodicity", "prob")) if header else None
    if header is None or it is None or if_ is None:
        it, if_ = 0, 1
        ic = 2 if rows and len(rows[0]) > 2 else None
        cols_from = "no usable header: columns read as time, frequency_hz[, confidence]"
    else:
        cols_from = "column names in the header row"
    unit = a.f0_unit
    if unit == "auto":
        unit = "midi" if (header and if_ is not None and "midi" in header[if_]) else "hz"
    t, f, c = [], [], []
    for r in rows:
        try:
            t.append(tofloat(r[it]))
            f.append(tofloat(r[if_]))
            c.append(tofloat(r[ic]) if ic is not None and ic < len(r) else np.nan)
        except (ValueError, IndexError):
            continue
    t, f, c = np.array(t), np.array(f), np.array(c)
    if unit == "midi":
        f = np.where(np.isfinite(f) & (f > 0), midi_to_hz(np.where(f > 0, f, 69)), 0.0)
        proc.append("frequency column read as MIDI numbers and converted to Hz (values <= 0 mean unvoiced)")
    nan = ~np.isfinite(f)
    if nan.any():
        f[nan] = 0.0
        proc.append(f"{int(nan.sum())} non-finite frequency values (NaN or inf) set to 0 = unvoiced")
    order = np.argsort(t, kind="stable")
    if np.any(order != np.arange(len(t))):
        proc.append("estimate rows were not in time order; sorted")
    t, f, c = t[order], f[order], c[order]
    dup = np.concatenate([[False], np.diff(t) <= 0])
    if dup.any():
        t, f, c = t[~dup], f[~dup], c[~dup]
        proc.append(f"{int(dup.sum())} rows with a repeated time were dropped (first kept)")
    if a.conf_threshold is not None:
        if ic is None:
            raise EvalError("--conf-threshold given but the estimate has no confidence column")
        low = ~(c >= a.conf_threshold)
        f = np.where(low, -np.abs(f), np.abs(f))
        proc.append(f"--conf-threshold {a.conf_threshold}: {int(low.sum())} frames with confidence below it were "
                    "marked unvoiced by negating their frequency (mir_eval convention: still used for raw pitch and "
                    "raw chroma accuracy)")
    if len(t) == 0:
        raise EvalError("estimate has no rows")
    with Capture(proc):
        rv, rc, ev, ec = mir_eval.melody.to_cent_voicing(ref_t, ref_f, t, f)
        m = {
            "voicing_recall": mir_eval.melody.voicing_recall(rv, ev),
            "voicing_false_alarm": mir_eval.melody.voicing_false_alarm(rv, ev),
            "raw_pitch_accuracy": mir_eval.melody.raw_pitch_accuracy(rv, rc, ev, ec, cent_tolerance=50),
            "raw_chroma_accuracy": mir_eval.melody.raw_chroma_accuracy(rv, rc, ev, ec, cent_tolerance=50),
            "overall_accuracy": mir_eval.melody.overall_accuracy(rv, rc, ev, ec, cent_tolerance=50),
        }
    defs = {
        "reference": ("built from the truth notes on a 10 ms grid from 0 s to duration_s: frequency of the sounding "
                      "note (440 * 2^((pitch + tuning_offset_cents/100 - 69)/12)) where a reference note sounds "
                      "(onset <= t < offset), 0 (unvoiced) elsewhere; where notes overlap the later onset wins. "
                      "Which notes: " + info["reference_notes"] + (". --nominal: tuning offset not applied" if a.nominal else "")),
        "resampling": ("mir_eval.melody.to_cent_voicing(ref_time, ref_freq, est_time, est_freq): the estimate is "
                       "linearly interpolated onto the reference grid; frequency <= 0 means unvoiced"),
        "voicing_recall": "mir_eval.melody.voicing_recall: fraction of reference-voiced frames the estimate marks voiced",
        "voicing_false_alarm": "mir_eval.melody.voicing_false_alarm: fraction of reference-unvoiced frames the estimate marks voiced",
        "raw_pitch_accuracy": ("mir_eval.melody.raw_pitch_accuracy(cent_tolerance=50): fraction of reference-voiced "
                               "frames where the estimate's frequency is within 50 cents (strictly less), voicing "
                               "decision ignored"),
        "raw_chroma_accuracy": "mir_eval.melody.raw_chroma_accuracy(cent_tolerance=50): the same with octave errors ignored",
        "overall_accuracy": ("mir_eval.melody.overall_accuracy(cent_tolerance=50): fraction of all frames "
                             "where the two agree: unvoiced in both, or voiced in both with the pitch less than 50 cents apart"),
    }
    return {
        "subcommand": "f0", "truth": T.facts(),
        "est": {**file_facts(a.est), "format": "table", **facts, "columns_from": cols_from,
                "columns": {"time": it + 1, "frequency": if_ + 1, "confidence": (ic + 1 if ic is not None else None)},
                "frequency_unit": unit, "first_time_s": float(t[0]), "last_time_s": float(t[-1]),
                "median_hop_s": float(np.median(np.diff(t))) if len(t) > 1 else None},
        "options": {"voice": a.voice, "conf_threshold": a.conf_threshold, "nominal": a.nominal, "f0_unit": a.f0_unit},
        "counts": {"n_frames": int(len(rv)), "n_ref_voiced_frames": int(np.sum(rv > 0)),
                   "n_est_voiced_frames": int(np.sum(ev > 0)), "n_est_rows": int(len(t)), **{k: v for k, v in info.items() if k.startswith("n_")}},
        "metrics": m, "definitions": defs, "processing": proc,
    }


# ----------------------------------------------------------------------------------------------------------------
# beats and onsets
# ----------------------------------------------------------------------------------------------------------------

def read_event_file(path, col=1, marker_col=None, proc=None, what="events"):
    """First numeric column (or column `col`, 1-based) as times. With marker_col, also return times whose marker == 1."""
    if not os.path.exists(path):
        raise EvalError(f"file not found: {path}")
    if path.lower().endswith(".json"):
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        key = None
        if isinstance(d, dict):
            for k in ({"beats": ("beats", "beat_times"), "downbeats": ("downbeats", "downbeat_times"),
                       "onsets": ("onsets", "onset_times", "taps", "times")}.get(what, ()) + ("times", "events")):
                if isinstance(d.get(k), list):
                    key, d = k, d[k]
                    break
            else:
                raise EvalError(f"JSON estimate: no list of {what} found (keys: {sorted(d)[:12]})")
        t = np.array(sorted(float(x["time"] if isinstance(x, dict) else (x[0] if isinstance(x, list) else x)) for x in d), dtype=float)
        if marker_col and proc is not None:
            proc.append("--downbeat-col does not apply to a JSON estimate; ignored")
        return t, (np.zeros(len(t), dtype=bool) if marker_col else None), {"format": "json", "key": key}
    header, rows, facts = read_table(path)
    times, marks, bad = [], [], 0
    for r in rows:
        try:
            tt = tofloat(r[col - 1])
        except (ValueError, IndexError):
            bad += 1
            continue
        times.append(tt)
        if marker_col:
            try:
                marks.append(int(round(tofloat(r[marker_col - 1]))) == 1)
            except (ValueError, IndexError):
                marks.append(False)
    if bad and proc is not None:
        proc.append(f"{os.path.basename(path)}: {bad} rows without a number in column {col} were skipped")
    t = np.array(times, dtype=float)
    order = np.argsort(t, kind="stable")
    if np.any(order != np.arange(len(t))) and proc is not None:
        proc.append(f"{os.path.basename(path)}: {what} were not in time order; sorted")
    t = t[order]
    mk = np.array(marks, dtype=bool)[order] if marker_col else None
    return t, mk, facts


def beat_block(ref, est, min_beat_time, window=0.07):
    import mir_eval
    if min_beat_time > 0:
        ref = mir_eval.beat.trim_beats(ref, min_beat_time)
        est = mir_eval.beat.trim_beats(est, min_beat_time)
    F = mir_eval.beat.f_measure(ref, est, f_measure_threshold=window)
    try:
        CMLc, CMLt, AMLc, AMLt = mir_eval.beat.continuity(ref, est)
    except Exception as e:  # noqa
        CMLc = CMLt = AMLc = AMLt = float("nan")
    match = mir_eval.util.match_events(ref, est, window) if len(ref) and len(est) else []
    p, r, _ = prf(len(match), len(ref), len(est))
    return {"f_measure": F, "precision": p, "recall": r, "CMLc": CMLc, "CMLt": CMLt, "AMLc": AMLc, "AMLt": AMLt,
            "n_truth": int(len(ref)), "n_est": int(len(est)), "n_matched": len(match),
            "timing_of_matched": timing_stats([est[j] - ref[i] for i, j in match])}


def cmd_beats(a):
    T = Truth(a.truth)
    proc = []
    ref_b = np.array(T.get("beats", []), dtype=float)
    ref_d = np.array(T.get("downbeats", []), dtype=float)
    if ref_b.size == 0:
        raise EvalError("truth has no beats")
    est_b, marks, facts = read_event_file(a.est, 1, a.downbeat_col, proc, "beats")
    if a.time_shift:
        est_b = est_b + a.time_shift
        proc.append(f"--time-shift {a.time_shift} s added to every estimated beat")
    est_d, dfrom = None, None
    jd = None
    if a.est.lower().endswith(".json") and not a.downbeats_est:
        with open(a.est, encoding="utf-8") as f:
            jd = json.load(f)
        jd = jd.get("downbeats") if isinstance(jd, dict) else None
    if jd is not None and isinstance(jd, list):
        est_d = np.array(sorted(float(x) for x in jd)) + (a.time_shift or 0.0)
        dfrom = "the 'downbeats' list of the JSON estimate"
    elif a.downbeats_est:
        est_d, _, _ = read_event_file(a.downbeats_est, 1, None, proc, "downbeats")
        est_d = est_d + (a.time_shift or 0.0)
        dfrom = f"--downbeats-est {a.downbeats_est}"
    elif a.downbeat_col:
        est_d = est_b[marks]
        dfrom = f"rows of --est whose column {a.downbeat_col} equals 1"
    if a.min_beat_time > 0:
        proc.append(f"beats before {a.min_beat_time} s removed from truth and estimate (mir_eval.beat.trim_beats)")
    with Capture(proc):
        metrics = {"beats": beat_block(ref_b, est_b, a.min_beat_time)}
        if est_d is not None:
            if ref_d.size == 0:
                metrics["downbeats"] = None
                proc.append("estimate has downbeats but the truth has none")
            else:
                metrics["downbeats"] = beat_block(ref_d, est_d, a.min_beat_time)
    defs = {
        "f_measure": ("mir_eval.beat.f_measure(reference_beats, estimated_beats, f_measure_threshold=0.07): an "
                      "estimated beat is a hit when within 70 ms of a truth beat, each matched once; F = 2PR/(P+R)"),
        "precision_recall": "n_matched/n_est and n_matched/n_truth with the same 70 ms matching (mir_eval.util.match_events)",
        "CMLc_CMLt_AMLc_AMLt": ("mir_eval.beat.continuity(reference_beats, estimated_beats, "
                                "continuity_phase_threshold=0.175, continuity_period_threshold=0.175). A beat is a hit when its "
                                "distance to the nearest truth beat and its interval to the previous estimated beat are "
                                "both within 17.5 percent of the truth inter-beat interval. CML: against the truth beats; "
                                "AML: the highest score over the truth beats, double tempo, half tempo (odd, even) and "
                                "off-beat variants. t = hits / max(truth beats in the variant, estimated beats); c = "
                                "longest run of consecutive hits / the same denominator"),
        "trimming": ("no beats are removed by default (mir_eval.beat.evaluate would drop beats before 5 s; the clips "
                     "here are short). --min-beat-time 5 reproduces that convention"),
        "downbeats": "the same functions applied to downbeat times only" + (f" ({dfrom})" if dfrom else ""),
        "timing_of_matched": "70 ms matched pairs; " + TIMING_DEF,
    }
    return {"subcommand": "beats", "truth": T.facts(), "est": {**file_facts(a.est), **facts, "downbeats_from": dfrom},
            "options": {"downbeat_col": a.downbeat_col, "downbeats_est": a.downbeats_est,
                        "min_beat_time": a.min_beat_time, "time_shift": a.time_shift},
            "counts": {"n_truth_beats": int(ref_b.size), "n_truth_downbeats": int(ref_d.size),
                       "n_est_beats": int(est_b.size), "n_est_downbeats": (int(est_d.size) if est_d is not None else None)},
            "metrics": metrics, "definitions": defs, "processing": proc}


def cmd_onsets(a):
    import mir_eval
    T = Truth(a.truth)
    proc = []
    if a.field == "taps":
        taps = T.get("taps", [])
        if a.tap_kind:
            taps = [x for x in taps if x.get("kind") == a.tap_kind]
            proc.append(f"only truth taps of kind '{a.tap_kind}'")
        ref = np.array(sorted(float(x["time"]) for x in taps), dtype=float)
        what = "truth taps" + (f" of kind {a.tap_kind}" if a.tap_kind else "")
    else:
        notes, excl = T.notes(a.voice, False)
        raw = np.array(sorted(float(n["onset"]) for n in notes), dtype=float)
        ref = np.unique(np.round(raw, 3))
        what = "truth note onsets" + (f" of voice {a.voice}" if a.voice else "")
        if len(ref) < len(raw):
            proc.append(f"{len(raw) - len(ref)} truth note onsets that coincide (to the millisecond) with another "
                        "were merged, so a chord counts as one onset")
    if ref.size == 0:
        raise EvalError(f"the truth file has no {what.replace('truth ', '')}")
    est, _, facts = read_event_file(a.est, 1, None, proc, "onsets")
    if a.time_shift:
        est = est + a.time_shift
        proc.append(f"--time-shift {a.time_shift} s added to every estimated onset")
    with Capture(proc):
        F, P, R = mir_eval.onset.f_measure(ref, est, window=a.window)
        match = mir_eval.util.match_events(ref, est, a.window) if len(est) else []
    timing = timing_stats([est[j] - ref[i] for i, j in match])
    return {"subcommand": "onsets", "truth": T.facts(), "est": {**file_facts(a.est), **facts},
            "options": {"field": a.field, "window": a.window, "tap_kind": a.tap_kind, "voice": a.voice, "time_shift": a.time_shift},
            "counts": {"n_truth": int(ref.size), "n_est": int(est.size), "n_matched": len(match)},
            "metrics": {"f_measure": F, "precision": P, "recall": R, "timing_of_matched": timing},
            "definitions": {"reference": what,
                            "timing_of_matched": "the matched pairs; " + TIMING_DEF,
                            "f_measure": (f"mir_eval.onset.f_measure(reference_onsets, estimated_onsets, window={a.window}): "
                                          f"an estimated onset is a hit when within {a.window} s of a reference onset, "
                                          "each matched once; precision = n_matched/n_est, recall = n_matched/n_truth")},
            "processing": proc}


# ----------------------------------------------------------------------------------------------------------------
# tempo, key, tuning
# ----------------------------------------------------------------------------------------------------------------

def first_number_in_file(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        txt = f.read()
    m = re.search(r"[-+]?\d+(\.\d+)?([eE][-+]?\d+)?", txt)
    if not m:
        raise EvalError(f"no number found in {path}")
    return float(m.group(0)), txt.strip()[:200]


def cmd_tempo(a):
    T = Truth(a.truth)
    proc = []
    ref = T.d.get("tempo_bpm")
    if ref is None:
        raise EvalError("truth has no tempo_bpm")
    ref = float(ref)
    if a.est_bpm is not None:
        est, src = float(a.est_bpm), "--est-bpm"
    elif a.est:
        est, txt = first_number_in_file(a.est)
        src = f"first number in {a.est}"
        proc.append(f"estimate read as the first number in the file (file starts: {txt[:60]!r})")
    else:
        raise EvalError("give --est-bpm <x> or --est <file containing the bpm>")
    tol = a.tolerance
    factors = [("1", 1.0), ("2", 2.0), ("3", 3.0), ("1/2", 0.5), ("1/3", 1 / 3)]
    dev = {name: (est - f * ref) / (f * ref) for name, f in factors}
    within = {name: abs(d) <= tol + 1e-12 for name, d in dev.items()}
    any_f = [name for name, _ in factors if within[name]]
    best = min(dev, key=lambda k: abs(dev[k]))
    metrics = {"truth_bpm": ref, "est_bpm": est, "ratio_est_over_truth": est / ref,
               "relative_deviation": dev["1"], "within_tolerance": within["1"],
               "within_tolerance_any_factor": bool(any_f),
               "factors_within_tolerance": any_f,
               "octave_error": (not within["1"]) and (within["2"] or within["1/2"]),
               "closest_factor": best, "relative_deviation_from_closest_factor": dev[best]}
    defs = {"within_tolerance": f"|est - truth| / truth <= {tol}",
            "within_tolerance_any_factor": f"|est - f*truth| / (f*truth) <= {tol} for at least one f in 1, 2, 3, 1/2, 1/3",
            "octave_error": "not within tolerance at factor 1, but within tolerance at factor 2 or 1/2",
            "ratio_est_over_truth": "est_bpm / truth_bpm",
            "library": "plain arithmetic; mir_eval.tempo is not used (it scores a pair of tempi with a salience weight and an 8 percent default tolerance)"}
    return {"subcommand": "tempo", "truth": T.facts(), "est": {"source": src, **(file_facts(a.est) if a.est else {})},
            "options": {"tolerance": tol}, "counts": {"n_truth": 1, "n_est": 1},
            "metrics": metrics, "definitions": defs, "processing": proc}


KEY_RE = re.compile(r"^\s*([A-Ga-g])\s*([#b♯♭]?)\s*[:_\-\s]*\s*(major|minor|maj|min|ionian|aeolian|dur|moll|m|M)?\s*$")
ENHARMONIC_OUTSIDE = {"cb": "B", "fb": "E", "e#": "F", "b#": "C"}


def normalize_key(s):
    """Return (mir_eval key string, how) or (None, reason)."""
    if s is None:
        return None, "no key"
    raw = str(s).strip()
    if raw.lower() in ("x", "unknown", "none", "n"):
        return "X", "unknown key written as X (mir_eval convention)"
    m = KEY_RE.match(raw.replace("♯", "#").replace("♭", "b"))
    if not m:
        return None, f"could not read key {raw!r}"
    letter, acc, mode = m.group(1), m.group(2), m.group(3)
    if mode is None:
        if letter.islower():
            return None, f"key {raw!r}: lower-case tonic without a mode is ambiguous"
        mode_n = "major"
    elif mode in ("M", "major", "maj", "ionian", "dur") or mode.lower() in ("major", "maj", "ionian", "dur"):
        mode_n = "major" if mode != "m" else "minor"
    else:
        mode_n = "minor"
    if mode == "m":
        mode_n = "minor"
    tonic = letter.upper() + acc
    if tonic.lower() in ENHARMONIC_OUTSIDE:
        tonic = ENHARMONIC_OUTSIDE[tonic.lower()]
    out = f"{tonic} {mode_n}"
    return out, ("unchanged" if out == raw else f"{raw!r} read as {out!r}")


KEY_PC = {"c": 0, "c#": 1, "db": 1, "d": 2, "d#": 3, "eb": 3, "e": 4, "f": 5, "f#": 6, "gb": 6, "g": 7, "g#": 8,
          "ab": 8, "a": 9, "a#": 10, "bb": 10, "b": 11}


def key_relationship(ref, est):
    if ref == "X" or est == "X":
        return "same (both X)" if ref == est else "other (X involved)"
    rk, rm = ref.split()
    ek, em = est.split()
    r, e = KEY_PC[rk.lower()], KEY_PC[ek.lower()]
    if r == e and rm == em:
        return "same key and mode"
    if em == rm and (e - r) % 12 == 7:
        return "estimate is a perfect fifth above, same mode"
    if em != rm and rm == "major" and (e - r) % 12 == 9:
        return "relative minor"
    if em != rm and rm == "minor" and (e - r) % 12 == 3:
        return "relative major"
    if em != rm and r == e:
        return "parallel (same tonic, other mode)"
    return "other"


def cmd_key(a):
    import mir_eval
    T = Truth(a.truth)
    proc = []
    rk_raw = T.d.get("key")
    if rk_raw is None:
        raise EvalError("truth has no key")
    rk, how_r = normalize_key(rk_raw)
    if rk is None:
        raise EvalError(f"truth key: {how_r}")
    if how_r != "unchanged":
        proc.append(f"truth key {how_r}")
    if a.est_key is not None:
        ek_raw, src = a.est_key, "--est-key"
    elif a.est:
        with open(a.est, encoding="utf-8", errors="replace") as f:
            ek_raw = f.read().strip().splitlines()[0] if os.path.getsize(a.est) else ""
        src = f"first line of {a.est}"
    else:
        raise EvalError("give --est-key \"G major\" or --est <file whose first line is the key>")
    ek, how_e = normalize_key(ek_raw)
    if ek is None:
        raise EvalError(f"estimated key: {how_e}")
    if how_e != "unchanged":
        proc.append(f"estimated key {how_e}")
    ws = mir_eval.key.weighted_score(rk, ek)
    exact = rk != "X" and ek != "X" and KEY_PC[rk.split()[0].lower()] == KEY_PC[ek.split()[0].lower()] and rk.split()[1] == ek.split()[1]
    return {"subcommand": "key", "truth": T.facts(), "est": {"source": src, "raw": ek_raw},
            "options": {}, "counts": {"n_truth": 1, "n_est": 1},
            "metrics": {"truth_key": rk, "est_key": ek, "weighted_score": ws, "exact_match": bool(exact),
                        "relationship": key_relationship(rk, ek)},
            "definitions": {"weighted_score": ("mir_eval.key.weighted_score(reference_key, estimated_key): 1.0 same "
                                               "tonic and mode; 0.5 estimate a perfect fifth above in the same mode; "
                                               "0.3 relative major/minor; 0.2 parallel major/minor; 0.0 otherwise"),
                            "exact_match": "same tonic pitch class (enharmonic spellings equal) and same mode",
                            "relationship": "which row of the weighted_score table applies"},
            "processing": proc}


def parse_int_list(s):
    if s is None:
        return None
    return [int(round(float(x))) for x in re.split(r"[,\s]+", s.strip()) if x]


def cmd_tuning(a):
    T = Truth(a.truth)
    proc = []
    tc = T.cents()
    if T.d.get("tuning_offset_cents") is None:
        proc.append("truth tuning_offset_cents is null; read as 0")
    if a.est_cents is not None:
        ec, src = float(a.est_cents), "--est-cents"
    elif a.est_a4_hz is not None:
        ec, src = 1200.0 * math.log2(a.est_a4_hz / 440.0), f"--est-a4-hz {a.est_a4_hz} converted: 1200*log2(hz/440)"
    elif a.est:
        ec, _ = first_number_in_file(a.est)
        src = f"first number in {a.est} (cents)"
    else:
        ec, src = None, None
    metrics = {}
    if ec is not None:
        d = ec - tc
        wrapped = (d + 50.0) % 100.0 - 50.0
        metrics.update({"truth_cents": tc, "est_cents": ec, "difference_cents": d, "abs_difference_cents": abs(d),
                        "difference_mod_100_cents": wrapped, "abs_difference_mod_100_cents": abs(wrapped)})
    if a.est_capo is not None:
        metrics.update({"truth_capo": T.capo(), "est_capo": a.est_capo, "capo_equal": T.capo() == a.est_capo})
    if a.est_tuning_midi is not None:
        et = parse_int_list(a.est_tuning_midi)
        tt = T.tuning()
        metrics.update({"truth_tuning_midi": tt, "est_tuning_midi": et,
                        "tuning_equal": tt == et,
                        "string_differences_semitones": ([e - t for e, t in zip(et, tt)] if tt and len(tt) == len(et) else None)})
    if not metrics:
        raise EvalError("give --est-cents, --est-a4-hz, --est <file>, --est-capo or --est-tuning-midi")
    return {"subcommand": "tuning", "truth": T.facts(), "est": {"source": src},
            "options": {"est_capo": a.est_capo, "est_tuning_midi": a.est_tuning_midi}, "counts": {"n_truth": 1, "n_est": 1},
            "metrics": metrics,
            "definitions": {"difference_cents": "est_cents - truth tuning_offset_cents",
                            "difference_mod_100_cents": ("the difference wrapped into [-50, 50) cents; an offset and the "
                                                         "same offset +/- 100 cents describe the same set of pitch "
                                                         "classes, which is all a tuning-offset estimator sees"),
                            "string_differences_semitones": "est open-string MIDI minus truth open-string MIDI, low string first"},
            "processing": proc}


# ----------------------------------------------------------------------------------------------------------------
# chords
# ----------------------------------------------------------------------------------------------------------------

QUAL_MAP = {
    "": "maj", "maj": "maj", "M": "maj", "major": "maj",
    "m": "min", "min": "min", "-": "min", "minor": "min",
    "7": "7", "dom7": "7", "dom": "7",
    "maj7": "maj7", "M7": "maj7", "Δ": "maj7", "Δ7": "maj7", "ma7": "maj7", "j7": "maj7",
    "m7": "min7", "min7": "min7", "-7": "min7", "mi7": "min7",
    "dim": "dim", "°": "dim", "o": "dim",
    "dim7": "dim7", "°7": "dim7", "o7": "dim7",
    "m7b5": "hdim7", "ø": "hdim7", "ø7": "hdim7", "hdim7": "hdim7", "hdim": "hdim7", "min7b5": "hdim7", "-7b5": "hdim7",
    "aug": "aug", "+": "aug", "#5": "aug", "+5": "aug",
    "sus2": "sus2", "sus4": "sus4", "sus": "sus4",
    "6": "maj6", "maj6": "maj6", "M6": "maj6", "m6": "min6", "min6": "min6",
    "9": "9", "maj9": "maj9", "M9": "maj9", "m9": "min9", "min9": "min9",
    "11": "11", "m11": "min11", "min11": "min11", "13": "13", "maj13": "maj13", "m13": "min13", "min13": "min13",
    "mmaj7": "minmaj7", "mM7": "minmaj7", "minmaj7": "minmaj7", "m(maj7)": "minmaj7",
    "5": "5", "1": "1",
    "add9": "maj(9)", "add2": "maj(2)", "madd9": "min(9)", "add11": "maj(11)",
    "7sus4": "sus4(b7)", "7sus": "sus4(b7)",
}
DEGREE_OF_SEMITONE = {0: "1", 1: "b2", 2: "2", 3: "b3", 4: "3", 5: "4", 6: "b5", 7: "5", 8: "b6", 9: "6", 10: "b7", 11: "7"}
ROOT_RE = re.compile(r"^([A-G])([#b]*)(.*)$")


def _pc(root):
    p = PC[root[0].lower()]
    for ch in root[1:]:
        p += 1 if ch == "#" else -1
    return p % 12


NO_CHORD_LABELS = ("N", "N.C.", "NC", "N.C", "n", "none", "None", "nc", "no chord", "-")


def normalize_chord(label):
    """Return (harte_label, how) or (None, reason). how is 'unchanged' when the label is returned as written."""
    import mir_eval
    raw = str(label).strip()
    s = raw.replace("\u266f", "#").replace("\u266d", "b")
    if s in NO_CHORD_LABELS:
        return "N", ("unchanged" if raw == "N" else f"{raw!r} read as no chord 'N'")
    if s in ("X", "x"):
        return "X", ("unchanged" if raw == "X" else "read as X")
    bass = None
    if ":" in s:
        try:
            mir_eval.chord.encode(s)
            return s, ("unchanged" if s == raw else f"{raw!r} read as {s!r}")
        except Exception:  # noqa
            pass
        root, qual = s.split(":", 1)
        if "/" in qual:
            qual, bass = qual.split("/", 1)
    else:
        if "/" in s:
            s, bass = s.split("/", 1)
        m = ROOT_RE.match(s)
        if not m:
            return None, f"cannot read chord label {raw!r}"
        root, qual = m.group(1) + m.group(2), m.group(3)
    if not re.match(r"^[A-G][#b]*$", root):
        return None, f"cannot read the root of {raw!r}"
    qual = qual.strip()
    if qual in QUAL_MAP:
        q = QUAL_MAP[qual]
    elif qual.lower() in QUAL_MAP:
        q = QUAL_MAP[qual.lower()]
    else:
        q = qual
    out = f"{root}:{q}"
    if bass:
        b = bass.strip()
        if re.match(r"^[A-G][#b]*$", b):
            out += "/" + DEGREE_OF_SEMITONE[(_pc(b) - _pc(root)) % 12]
        else:
            out += "/" + b
    try:
        mir_eval.chord.encode(out)
    except Exception:  # noqa
        return None, f"cannot read chord label {raw!r}"
    return out, ("unchanged" if out == raw else f"{raw!r} read as {out!r}")


def load_est_chords(path, duration, proc):
    ext = os.path.splitext(path)[1].lower()
    items = []
    fmt = None
    if ext == ".json":
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        if isinstance(d, dict):
            d = d.get("chords") or d.get("segments") or d.get("data") or []
        for o in d:
            if isinstance(o, dict):
                st = o.get("start", o.get("onset", o.get("time")))
                en = o.get("end", o.get("offset"))
                if en is None and o.get("duration") is not None and st is not None:
                    en = float(st) + float(o["duration"])
                lab = o.get("label", o.get("chord", o.get("name")))
            else:
                st, en, lab = (o[0], o[1], o[2]) if len(o) >= 3 else (o[0], None, o[1])
            items.append((float(st), None if en is None else float(en), str(lab)))
        fmt = "json"
    else:
        lines, _ = read_lines(path)
        cells, delim = split_cells(lines)
        skipped = 0
        for r in cells:
            nums, lab = [], None
            started = False
            for c in r:
                if isnum(c) and lab is None:
                    nums.append(tofloat(c))
                    started = True
                elif started:
                    lab = c if lab is None else lab + " " + c
            if not nums or lab is None:
                skipped += 1
                continue
            items.append((nums[0], nums[1] if len(nums) >= 2 else None, lab))
        if skipped:
            proc.append(f"{skipped} lines without a time and a label were skipped (header or file-name lines)")
        fmt = f"text ({delim})"
    if not items:
        raise EvalError("no chords read from the estimate")
    if all(en is None for _, en, _ in items):
        items.sort(key=lambda x: x[0])
        out = []
        for i, (st, _, lab) in enumerate(items):
            en = items[i + 1][0] if i + 1 < len(items) else max(duration, st)
            out.append((st, en, lab))
        items = out
        proc.append("estimate gives chord change times only (time, label): each chord lasts until the next change, "
                    "the last one until the truth duration_s")
        fmt += ", change points"
    elif any(en is None for _, en, _ in items):
        raise EvalError("some chord rows have an end time and some do not")
    else:
        fmt += ", intervals"
    items.sort(key=lambda x: x[0])
    return items, fmt


def cmd_chords(a):
    import mir_eval
    T = Truth(a.truth)
    proc = []
    tc = T.get("chords", [])
    if not tc:
        raise EvalError("truth has no chords")
    ref_iv, ref_lab = [], []
    for c in tc:
        lab, how = normalize_chord(c["label"])
        if lab is None:
            raise EvalError(f"truth chord label: {how}")
        if how != "unchanged":
            proc.append(f"truth label {how}")
        ref_iv.append([float(c["start"]), float(c["end"])])
        ref_lab.append(lab)
    items, fmt = load_est_chords(a.est, T.duration(), proc)
    est_iv, est_lab, unparsed, changed = [], [], {}, {}
    unp_dur = 0.0
    for st, en, lab in items:
        n, how = normalize_chord(lab)
        if n is None:
            unparsed[lab] = unparsed.get(lab, 0) + 1
            n = "N"
        elif how != "unchanged":
            changed[lab] = n
        if a.time_shift:
            st, en = st + a.time_shift, en + a.time_shift
        if en <= st:
            proc.append(f"estimated chord {lab!r} at {st} s has end <= start; dropped")
            continue
        est_iv.append([st, en])
        est_lab.append(n)
        if lab in unparsed:
            unp_dur += en - st
    if a.time_shift:
        proc.append(f"--time-shift {a.time_shift} s added to every estimated chord time")
    if unparsed:
        proc.append(f"estimated labels that could not be read were scored as 'N' (no chord): {unparsed}")
    ref_iv, est_iv = np.array(ref_iv), np.array(est_iv).reshape(-1, 2)
    with Capture(proc):
        sc = mir_eval.chord.evaluate(ref_iv, ref_lab, est_iv, est_lab)
    main = {k: sc[k] for k in ("root", "majmin", "sevenths")}
    other = {k: v for k, v in sc.items() if k not in main}
    return {"subcommand": "chords", "truth": T.facts(), "est": {**file_facts(a.est), "format": fmt},
            "options": {"time_shift": a.time_shift},
            "counts": {"n_truth_segments": len(ref_lab), "n_est_segments": len(est_lab),
                       "n_est_labels_unparsed": sum(unparsed.values()), "est_unparsed_duration_s": unp_dur,
                       "truth_span_s": [float(ref_iv.min()), float(ref_iv.max())]},
            "metrics": {**main, "other_mir_eval_chord_scores": other},
            "labels": {"unparsed": unparsed, "normalized": changed},
            "definitions": {
                "procedure": ("mir_eval.chord.evaluate(ref_intervals, ref_labels, est_intervals, est_labels): the "
                              "estimate is cropped or padded with 'N' to the truth span (mir_eval.util.adjust_intervals), "
                              "both are cut at every boundary of either (mir_eval.util.merge_labeled_intervals), and each "
                              "comparison is weighted by segment duration (mir_eval.chord.weighted_accuracy)"),
                "root": "mir_eval.chord.root: same root; reference 'X' segments are left out of the weighting",
                "majmin": ("mir_eval.chord.majmin: same root and the same maj/min/N class; reference chords whose "
                           "quality is not maj, min or N are left out"),
                "sevenths": ("mir_eval.chord.sevenths: same root and quality among maj, min, 7, maj7, min7, N; other "
                             "reference qualities are left out"),
                "other_mir_eval_chord_scores": "every other score mir_eval.chord.evaluate returns (thirds, triads, tetrads, mirex, *_inv, seg)",
                "label_normalisation": ("labels such as C, Cm, Cmaj7, Amin7, F#m7b5, C/E, N.C. are rewritten in Harte "
                                        "syntax (C:maj, C:min, C:maj7, A:min7, F#:hdim7, C:maj/3, N) before scoring; "
                                        "labels.normalized lists each rewrite and labels.unparsed every label that "
                                        "could not be read")},
            "processing": proc}


# ----------------------------------------------------------------------------------------------------------------
# tab
# ----------------------------------------------------------------------------------------------------------------

def order_groups(notes, window):
    """Sort notes by onset, group notes whose onset is within `window` s of the group's first onset, and return them
    ordered by (group, pitch). window 0 groups only identical onsets."""
    ns = sorted(notes, key=lambda n: (float(n["onset"]), float(n["pitch"])))
    out, group, g0 = [], [], None
    for n in ns:
        t = float(n["onset"])
        if group and t - g0 > window + 1e-9:
            out += sorted(group, key=lambda x: float(x["pitch"]))
            group = []
        if not group:
            g0 = t
        group.append(n)
    out += sorted(group, key=lambda x: float(x["pitch"]))
    return out


def lcs_pairs(a, b):
    n, m = len(a), len(b)
    L = np.zeros((n + 1, m + 1), dtype=np.int32)
    for i in range(n - 1, -1, -1):
        ai = a[i]
        Li, Li1 = L[i], L[i + 1]
        for j in range(m - 1, -1, -1):
            Li[j] = Li1[j + 1] + 1 if ai == b[j] else (Li1[j] if Li1[j] >= Li[j + 1] else Li[j + 1])
    i = j = 0
    out = []
    while i < n and j < m:
        if a[i] == b[j]:
            out.append((i, j))
            i += 1
            j += 1
        elif L[i + 1][j] >= L[i][j + 1]:
            i += 1
        else:
            j += 1
    return out


def cmd_tab(a):
    import mir_eval
    T = Truth(a.truth)
    proc = []
    ref_all, excluded = T.notes(a.voice, False)
    ref = [n for n in ref_all if n.get("string") is not None and n.get("fret") is not None]
    if len(ref) < len(ref_all):
        proc.append(f"{len(ref_all) - len(ref)} truth notes without string/fret were left out")
    if not ref:
        raise EvalError("truth has no notes with string and fret")
    t_tuning, t_capo = T.tuning(), T.capo()
    a.est_tuning_list = parse_int_list(a.est_tuning)
    E = load_est_notes(a.est, a, want_tab=True)
    proc += E.processing
    # est tuning and capo: the file, then the command line, then the truth's (assumed)
    if a.est_tuning_list is not None:
        e_tuning, tsrc = a.est_tuning_list, "--est-tuning"
        if E.tuning is not None and list(E.tuning) != e_tuning:
            proc.append(f"the file states tuning {E.tuning}; --est-tuning {e_tuning} used instead")
    elif E.tuning is not None:
        e_tuning, tsrc = [int(x) for x in E.tuning], "stated in the estimate file"
    else:
        e_tuning, tsrc = t_tuning, "not stated in the estimate; the truth tuning is assumed"
    if a.est_capo is not None:
        e_capo, csrc = int(a.est_capo), "--est-capo"
    elif E.capo is not None:
        e_capo, csrc = int(E.capo), "stated in the estimate file"
    else:
        e_capo, csrc = t_capo, "not stated in the estimate; the truth capo is assumed"
    nstr = len(e_tuning)
    est = []
    no_pos = inconsistent = 0
    for i in range(len(E)):
        s, fr = E.string[i], E.fret[i]
        if s is None or fr is None:
            no_pos += 1
            continue
        if not (1 <= s <= nstr):
            no_pos += 1
            proc.append(f"estimated note at {E.onset[i]} has string {s}, outside 1..{nstr}; left out")
            continue
        computed = e_tuning[nstr - s] + e_capo + fr
        p = E.pitch[i]
        if p is None:
            p = computed
        elif abs(p - computed) > 0.5:
            inconsistent += 1
        est.append({"onset": E.onset[i], "pitch": float(p), "string": s, "fret": fr})
    if no_pos:
        proc.append(f"{no_pos} estimated notes without a usable string and fret were left out")
    if inconsistent:
        proc.append(f"{inconsistent} estimated notes give a pitch that differs from string tuning + capo + fret; "
                    "the given pitch was used for matching")
    if a.time_shift and not (a.ignore_time or E.ordered_only):
        for n in est:
            n["onset"] += a.time_shift
        proc.append(f"--time-shift {a.time_shift} s added to every estimated onset")
    ignore_time = a.ignore_time or E.ordered_only
    if E.ordered_only and not a.ignore_time:
        proc.append("the estimate format has no absolute times, so --ignore-time was switched on")
    if ignore_time:
        cw = a.chord_window
        ref_sorted = order_groups(ref, cw)
        est_sorted = order_groups(est, 0.0 if E.ordered_only else cw)
        pairs = lcs_pairs([int(round(float(n["pitch"]))) for n in ref_sorted], [int(round(n["pitch"])) for n in est_sorted])
        matching = (f"ORDER ONLY (--ignore-time): truth notes are grouped into chords (a note within {cw} s of the "
                    "first note of the current group joins it, --chord-window) and put in order of group, then pitch; "
                    "estimated notes likewise (for ASCII tab a group is one character column); the longest common "
                    "subsequence of the two MIDI pitch sequences gives the matched pairs; times are not compared")
    else:
        ref_sorted = sorted(ref, key=lambda n: (float(n["onset"]), float(n["pitch"])))
        est_sorted = sorted(est, key=lambda n: (n["onset"], n["pitch"]))
        ref_iv = np.array([[float(n["onset"]), float(n["onset"]) + 0.1] for n in ref_sorted])
        est_iv = np.array([[n["onset"], n["onset"] + 0.1] for n in est_sorted]).reshape(-1, 2)
        lo = min(float(est_iv.min()) if len(est_iv) else 0.0, float(ref_iv.min()))
        if lo < 0:
            est_iv, ref_iv = est_iv - lo, ref_iv - lo
            proc.append(f"some estimated onsets were negative (lowest {lo:.6f} s); {-lo:.6f} s was added to every truth "
                        "and estimated onset before matching, which leaves every time difference unchanged")
        with Capture(proc):
            pairs = mir_eval.transcription.match_notes(
                ref_iv, midi_to_hz([float(n["pitch"]) for n in ref_sorted]), est_iv,
                midi_to_hz([n["pitch"] for n in est_sorted]), onset_tolerance=a.onset_tol, pitch_tolerance=50.0,
                offset_ratio=None) if est_sorted else []
        matching = (f"mir_eval.transcription.match_notes(onset_tolerance={a.onset_tol}, pitch_tolerance=50.0, "
                    "offset_ratio=None): onsets within the tolerance and pitches within 50 cents, each note matched once")
    nm = len(pairs)
    same_sf = same_s = same_abs = 0
    sdiff, conf, fdiff = {}, {}, {}
    strings_seen = set()
    for ri, ei in pairs:
        r, e = ref_sorted[ri], est_sorted[ei]
        rs, rf, es, ef = int(r["string"]), int(r["fret"]), e["string"], e["fret"]
        strings_seen |= {rs, es}
        if rs == es:
            same_s += 1
            fdiff[ef - rf] = fdiff.get(ef - rf, 0) + 1
            if rf == ef:
                same_sf += 1
            if rf + t_capo == ef + e_capo:
                same_abs += 1
        d = es - rs
        sdiff[d] = sdiff.get(d, 0) + 1
        conf[(rs, es)] = conf.get((rs, es), 0) + 1
    labels = sorted(strings_seen) or list(range(1, len(t_tuning or []) + 1))
    matrix = [[conf.get((rs, es), 0) for es in labels] for rs in labels]
    fmt_d = lambda d: ("+" if d > 0 else "") + str(d)  # noqa
    n_ref, n_est = len(ref_sorted), len(est_sorted)
    metrics = {
        "same_string_and_fret_fraction_of_matched": same_sf / nm if nm else None,
        "same_string_fraction_of_matched": same_s / nm if nm else None,
        "same_string_and_absolute_fret_fraction_of_matched": same_abs / nm if nm else None,
        "same_string_and_fret_count": same_sf,
        "same_string_and_fret_fraction_of_truth": same_sf / n_ref if n_ref else None,
        "matched_fraction_of_truth": nm / n_ref if n_ref else None,
        "matched_fraction_of_est": nm / n_est if n_est else None,
        "string_difference_counts": {fmt_d(k): sdiff[k] for k in sorted(sdiff)},
        "fret_difference_counts_when_same_string": {fmt_d(k): fdiff[k] for k in sorted(fdiff)},
        "string_confusion": {"rows_truth_string": labels, "cols_est_string": labels, "counts": matrix},
    }
    tun = {"truth": {"tuning_midi": t_tuning, "capo": t_capo, "tuning_offset_cents": T.cents()},
           "est": {"tuning_midi": e_tuning, "tuning_source": tsrc, "capo": e_capo, "capo_source": csrc},
           "tuning_differs": list(t_tuning or []) != list(e_tuning or []), "capo_differs": t_capo != e_capo,
           "est_tuning_or_capo_assumed": tsrc.startswith("not stated") or csrc.startswith("not stated")}
    if E.facts.get("string_labels"):
        labs = E.facts["string_labels"]
        names = [l for l in labs]
        if all(names) and t_tuning and len(names) == len(t_tuning):
            lab_pc = [_pc(re.match(r"^([A-Ga-g][#b]?)", l).group(1).capitalize()) for l in names]  # top line = string 1
            tru_pc = [x % 12 for x in reversed(t_tuning)]
            tun["ascii_string_labels"] = labs
            tun["ascii_labels_differ_from_truth_tuning"] = lab_pc != tru_pc
    defs = {
        "matching": matching,
        "same_string_and_fret_fraction_of_matched": "matched pairs whose string AND fret are equal / matched pairs",
        "same_string_fraction_of_matched": "matched pairs on the same string / matched pairs",
        "same_string_and_absolute_fret_fraction_of_matched": ("matched pairs on the same string with fret + capo equal "
                                                              "(fret counted from the nut) / matched pairs; differs from "
                                                              "the plain fraction only when the two capos differ"),
        "same_string_and_fret_fraction_of_truth": "same-string-and-fret pairs / truth notes with string and fret",
        "string_difference_counts": "histogram of (estimated string - truth string) over matched pairs; string 1 is the highest-pitched string",
        "string_confusion": "counts of matched pairs by truth string (rows) and estimated string (columns)",
        "pitch": "estimated pitch = the pitch in the file if given, else est tuning[n_strings - string] + est capo + fret",
    }
    return {"subcommand": "tab", "truth": T.facts(), "est": {**file_facts(a.est), **E.facts},
            "options": {"ignore_time": ignore_time, "chord_window": (a.chord_window if ignore_time else None),
                        "onset_tol": a.onset_tol, "voice": a.voice,
                        "est_tuning": a.est_tuning, "est_capo": a.est_capo, "time_shift": a.time_shift},
            "IGNORE_TIME_USED": ignore_time,
            "tuning_and_capo": tun,
            "counts": {"n_truth": n_ref, "n_est": n_est, "n_matched": nm, "n_truth_left_out": excluded,
                       "n_est_without_position": no_pos},
            "metrics": metrics, "definitions": defs, "processing": proc}


# ----------------------------------------------------------------------------------------------------------------
# tab-frames: frame-level string/fret activations
# ----------------------------------------------------------------------------------------------------------------

def _is_silent_cell(c):
    c = c.strip().lower()
    if c in ("", "x", "-", "nan", "none", "null", "silent"):
        return True
    try:
        return float(c) < 0
    except ValueError:
        return True


def load_frames(path, fmt, nstr, proc):
    """Returns (rows, kind): rows = list of (time, string, fret) for active strings; for the matrix layout also the
    list of every frame time (silent frames included)."""
    if path.lower().endswith(".json"):
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        d = d.get("frames", d) if isinstance(d, dict) else d
        rows, times = [], []
        for fr in d:
            t = float(fr.get("time", fr.get("t")))
            times.append(t)
            for x in fr.get("active", fr.get("notes", [])):
                rows.append((t, int(x["string"]), int(x["fret"])))
        return rows, sorted(set(times)), "json frames"
    header, cells, facts = read_table(path)
    if fmt == "auto":
        if header and any("string" in h for h in header) and any("fret" in h for h in header) and len(header) <= 4:
            fmt = "long"
        elif cells and len(cells[0]) == 1 + nstr:
            fmt = "matrix"
        elif cells and len(cells[0]) == 3:
            fmt = "long"
        else:
            raise EvalError(f"cannot tell the frame layout of {path}; give --frame-format long (time,string,fret rows) "
                            f"or matrix (time then one fret column per string, string 1 first)")
    rows, times = [], []
    if fmt == "long":
        it = find_col(header, ("time", "frame_time", "t")) if header else 0
        is_ = find_col(header, ("string",)) if header else 1
        if_ = find_col(header, ("fret",)) if header else 2
        it = 0 if it is None else it
        for r in cells:
            try:
                t = tofloat(r[it])
            except (ValueError, IndexError):
                continue
            if _is_silent_cell(r[if_]) or _is_silent_cell(r[is_]):
                continue
            rows.append((t, int(round(tofloat(r[is_]))), int(round(tofloat(r[if_])))))
        return rows, None, "long (time, string, fret)"
    for r in cells:
        try:
            t = tofloat(r[0])
        except (ValueError, IndexError):
            continue
        times.append(t)
        for si in range(nstr):
            c = r[1 + si] if 1 + si < len(r) else ""
            if not _is_silent_cell(c):
                rows.append((t, si + 1, int(round(tofloat(c)))))
    return rows, sorted(set(times)), f"matrix (time, then fret on string 1..{nstr}; negative/empty/x = silent)"


def cmd_tab_frames(a):
    T = Truth(a.truth)
    proc = []
    ref_all, excluded = T.notes(a.voice, False)
    ref = [n for n in ref_all if n.get("string") is not None and n.get("fret") is not None]
    if not ref:
        raise EvalError("truth has no notes with string and fret")
    t_tuning, t_capo = T.tuning(), T.capo()
    e_tuning = parse_int_list(a.est_tuning) or t_tuning
    e_capo = a.est_capo if a.est_capo is not None else t_capo
    tsrc = "--est-tuning" if a.est_tuning else "not stated; the truth tuning is assumed"
    csrc = "--est-capo" if a.est_capo is not None else "not stated; the truth capo is assumed"
    nstr = len(e_tuning)
    rows, times, kind = load_frames(a.est, a.frame_format, nstr, proc)
    if a.time_shift:
        rows = [(t + a.time_shift, s_, f_) for t, s_, f_ in rows]
        times = [t + a.time_shift for t in times] if times is not None else None
        proc.append(f"--time-shift {a.time_shift} s added to every frame time")
    # the frame grid
    if times is not None and not a.hop:
        grid = np.array(times, dtype=float)
        grid_from = "the estimate's own frame times (matrix layout lists every frame)"
        hop = float(np.median(np.diff(grid))) if len(grid) > 1 else None
    else:
        if a.hop:
            hop = a.hop
            hop_from = "--hop"
        else:
            ut = np.unique(np.round([t for t, _, _ in rows], 6))
            if len(ut) < 2:
                raise EvalError("cannot infer the frame hop from fewer than two frame times; give --hop")
            d = np.round(np.diff(ut), 5)
            vals, cnts = np.unique(d, return_counts=True)
            hop = float(vals[np.argmax(cnts)])
            hop_from = "the most common gap between consecutive frame times in the estimate"
        dur = T.duration()
        grid = np.arange(int(math.floor(dur / hop + 1e-9)) + 1) * hop
        grid_from = f"0 to duration_s every {hop:.6f} s (hop from {hop_from})"
    k_of = {}
    E_sets = [set() for _ in grid]
    off_grid = 0
    for t, s_, f_ in rows:
        k = int(np.argmin(np.abs(grid - t))) if len(grid) else None
        if k is None or abs(grid[k] - t) > (hop or 0) / 2 + 1e-6:
            off_grid += 1
            continue
        if not (1 <= s_ <= nstr):
            off_grid += 1
            continue
        E_sets[k].add((s_, f_))
    if off_grid:
        proc.append(f"{off_grid} estimated activations fell outside the frame grid or the string range and were left out")
    R_sets = [set() for _ in grid]
    for n in ref:
        on, off = float(n["onset"]), float(n["offset"])
        idx = np.where((grid >= on - 1e-9) & (grid < off - 1e-9))[0]
        for k in idx:
            R_sets[k].add((int(n["string"]), int(n["fret"])))
    tn = len(t_tuning)
    to_p_ref = lambda s_, f_: t_tuning[tn - s_] + t_capo + f_  # noqa
    to_p_est = lambda s_, f_: e_tuning[nstr - s_] + e_capo + f_  # noqa
    tp_tab = sum(len(E & R) for E, R in zip(E_sets, R_sets))
    n_e = sum(len(E) for E in E_sets)
    n_r = sum(len(R) for R in R_sets)
    tp_p = n_ep = n_rp = 0
    for E, R in zip(E_sets, R_sets):
        ep = {to_p_est(*x) for x in E}
        rp = {to_p_ref(*x) for x in R}
        tp_p += len(ep & rp)
        n_ep += len(ep)
        n_rp += len(rp)
    P, Rc, F = prf(tp_tab, n_r, n_e)
    Pp, Rp, Fp = prf(tp_p, n_rp, n_ep)
    metrics = {"tab_precision": P, "tab_recall": Rc, "tab_f1": F,
               "pitch_precision": Pp, "pitch_recall": Rp, "pitch_f1": Fp,
               "tab_hits_over_pitch_hits": (tp_tab / tp_p) if tp_p else None}
    defs = {
        "grid": "frames at " + grid_from + "; each estimated activation is put on the nearest frame (within half a hop)",
        "reference": ("at each frame time t, the set of (string, fret) of truth notes sounding at t (onset <= t < "
                      "offset), drums and notes without a position left out"),
        "tab_precision_recall_f1": ("over all frames: hits = sum of |estimated (string, fret) set & reference set|; "
                                    "precision = hits / sum of estimated set sizes; recall = hits / sum of reference "
                                    "set sizes; F1 = 2PR/(P+R)"),
        "pitch_precision_recall_f1": ("the same with each (string, fret) turned into its MIDI pitch (tuning + capo + "
                                      "fret, each side with its own tuning and capo) and duplicate pitches in a frame "
                                      "counted once"),
        "tab_hits_over_pitch_hits": "tab hits / pitch hits: of the frame-pitches found, the share that also have the reference string and fret",
    }
    return {"subcommand": "tab-frames", "truth": T.facts(), "est": {**file_facts(a.est), "layout": kind},
            "options": {"hop": a.hop, "frame_format": a.frame_format, "est_tuning": a.est_tuning, "est_capo": a.est_capo,
                        "voice": a.voice, "time_shift": a.time_shift},
            "tuning_and_capo": {"truth": {"tuning_midi": t_tuning, "capo": t_capo},
                                "est": {"tuning_midi": e_tuning, "tuning_source": tsrc, "capo": e_capo, "capo_source": csrc},
                                "tuning_differs": list(t_tuning) != list(e_tuning), "capo_differs": t_capo != e_capo},
            "counts": {"n_frames": int(len(grid)), "hop_s": hop, "n_truth_notes": len(ref), "n_truth_left_out": excluded,
                       "ref_activations": n_r, "est_activations": n_e, "tab_hits": tp_tab,
                       "ref_frame_pitches": n_rp, "est_frame_pitches": n_ep, "pitch_hits": tp_p},
            "metrics": metrics, "definitions": defs, "processing": proc}


# ----------------------------------------------------------------------------------------------------------------
# stems
# ----------------------------------------------------------------------------------------------------------------

def find_audio(base, name):
    if base is None:
        return None
    cands = [os.path.join(base, name)] + [os.path.join(base, name + e) for e in AUDIO_EXTS]
    for c in cands:
        if os.path.isfile(c):
            return c
    return None


def si_sdr(ref, est):
    ref = ref - ref.mean()
    est = est - est.mean()
    rr = float(np.dot(ref, ref))
    if rr == 0:
        return float("nan")
    alpha = float(np.dot(est, ref)) / rr
    tgt = alpha * ref
    res = est - tgt
    nn = float(np.dot(res, res))
    tt = float(np.dot(tgt, tgt))
    if nn == 0:
        return float("inf")
    if tt == 0:
        return float("-inf")
    return 10.0 * math.log10(tt / nn)


def load_audio_mono(path, sr_target, proc, label):
    import soundfile as sf
    from scipy.signal import resample_poly
    x, sr = sf.read(path, always_2d=True, dtype="float64")
    ch = x.shape[1]
    x = x.mean(axis=1)
    facts = {"file": os.path.abspath(path), "sample_rate": sr, "channels": ch, "seconds": len(x) / sr, **{"sha256": sha256_of(path)}}
    if sr_target and sr != sr_target:
        g = math.gcd(int(sr), int(sr_target))
        x = resample_poly(x, int(sr_target) // g, int(sr) // g)
        proc.append(f"{label}: resampled {sr} -> {sr_target} Hz (scipy.signal.resample_poly)")
    if ch > 1:
        proc.append(f"{label}: {ch} channels averaged to mono")
    return x, facts


def cmd_stems(a):
    import mir_eval
    T = Truth(a.truth)
    proc = []
    tstems = T.get("stems", {}) or {}
    pairs = []
    if a.map:
        for m in a.map:
            if "=" not in m:
                raise EvalError(f"--map expects name=file, got {m!r}")
            name, f = m.split("=", 1)
            pairs.append((name, f))
    else:
        if not tstems:
            raise EvalError("truth lists no stems and no --map was given")
        for name in tstems:
            pairs.append((name, name))
        proc.append("no --map: each truth stem is paired with <est-dir>/<stem name>.<audio extension>")
    rows = []
    for name, f in pairs:
        rp = None
        if a.ref_dir:
            rp = find_audio(a.ref_dir, name) or (find_audio(a.ref_dir, os.path.basename(tstems[name])) if name in tstems else None)
        elif name in tstems:
            rp = os.path.join(T.dir, tstems[name])
        if rp is None or not os.path.isfile(rp):
            raise EvalError(f"reference stem {name!r} not found (truth stems: {list(tstems)}; --ref-dir {a.ref_dir})")
        ep = f if os.path.isfile(f) else find_audio(a.est_dir, f)
        if ep is None:
            raise EvalError(f"estimated stem for {name!r} not found: {f!r} in --est-dir {a.est_dir}")
        rows.append((name, rp, ep))
    import soundfile as sf
    sr_t = a.sr or int(T.d.get("sample_rate") or sf.info(rows[0][1]).samplerate)
    refs, ests, rfacts, efacts = [], [], {}, {}
    for name, rp, ep in rows:
        x, fr = load_audio_mono(rp, sr_t, proc, f"truth stem {name}")
        y, fe = load_audio_mono(ep, sr_t, proc, f"estimated stem for {name}")
        refs.append(x)
        ests.append(y)
        rfacts[name], efacts[name] = fr, fe
    n = min(len(v) for v in refs + ests)
    if a.max_seconds:
        n = min(n, int(a.max_seconds * sr_t))
        proc.append(f"--max-seconds {a.max_seconds}: only the first {a.max_seconds} s are scored")
    lens = sorted({len(v) for v in refs + ests})
    if len(lens) > 1 or lens[0] != n:
        proc.append(f"all signals trimmed to the shortest common length, {n} samples = {n / sr_t:.3f} s at {sr_t} Hz "
                    f"(lengths before trimming, in samples: {lens})")
    R = np.stack([v[:n] for v in refs])
    S = np.stack([v[:n] for v in ests])
    per = {}
    for i, (name, _, _) in enumerate(rows):
        per[name] = {"si_sdr_db": si_sdr(R[i], S[i])}
    mode = a.sdr_mode
    if mode == "auto":
        mode = "joint" if len(rows) > 1 else "single"
    try:
        with Capture(proc):
            if mode == "joint":
                sdr, sir, sar, _ = mir_eval.separation.bss_eval_sources(R, S, compute_permutation=False)
                for i, (name, _, _) in enumerate(rows):
                    per[name].update({"sdr_db": sdr[i], "sir_db": sir[i], "sar_db": sar[i]})
            else:
                for i, (name, _, _) in enumerate(rows):
                    sdr, sir, sar, _ = mir_eval.separation.bss_eval_sources(R[i:i + 1], S[i:i + 1], compute_permutation=False)
                    per[name].update({"sdr_db": sdr[0], "sar_db": sar[0]})
    except ValueError as e:
        proc.append(f"mir_eval.separation.bss_eval_sources raised: {e}; SDR not reported")
    defs = {
        "si_sdr_db": ("scale-invariant SDR computed by gtr-eval: both signals mono with their mean removed; "
                      "target = (<est, ref>/<ref, ref>) * ref; SI-SDR = 10 log10(|target|^2 / |est - target|^2)"),
        "sdr_db": (f"mir_eval.separation.bss_eval_sources(reference_sources, estimated_sources, "
                   f"compute_permutation=False) on mono signals ({mode} mode: "
                   + ("all mapped stems in one call, so the other stems are the interference for SIR" if mode == "joint"
                      else "one call per stem with that stem alone; SIR is undefined and not reported")
                   + "). Distortion filter length 512 taps (BSS Eval v3 as in mir_eval). sdr/sir/sar in dB"),
        "alignment": "no time alignment is searched; the signals are compared sample by sample from the start of each file",
    }
    return {"subcommand": "stems", "truth": T.facts(),
            "est": {"est_dir": os.path.abspath(a.est_dir) if a.est_dir else None, "files": efacts},
            "reference_files": rfacts,
            "options": {"map": a.map, "ref_dir": a.ref_dir, "sr": sr_t, "sdr_mode": mode, "max_seconds": a.max_seconds},
            "counts": {"n_stems": len(rows), "samples_scored": n, "seconds_scored": n / sr_t, "sample_rate": sr_t},
            "metrics": {"per_stem": per}, "definitions": defs, "processing": proc}


# ----------------------------------------------------------------------------------------------------------------
# check-truth
# ----------------------------------------------------------------------------------------------------------------

def check_truth(path):
    import mir_eval
    T = Truth(path)
    d = T.d
    probs, checked = [], 0

    def need(cond, msg):
        nonlocal checked
        checked += 1
        if not cond:
            probs.append(msg)
    for k in ("id", "title", "what", "audio", "duration_s", "sample_rate", "channels", "tempo_bpm", "time_signature",
              "key", "tuning_midi", "capo", "tuning_offset_cents", "notes", "beats", "downbeats", "chords", "taps",
              "stems", "source"):
        need(k in d, f"missing field '{k}'")
    if d.get("audio"):
        need(os.path.isfile(os.path.join(T.dir, d["audio"])), f"audio file {d['audio']} not found next to the truth file")
    dur = d.get("duration_s") or None
    tun = d.get("tuning_midi")
    capo = d.get("capo") or 0
    if tun is not None:
        need(isinstance(tun, list) and all(isinstance(x, int) for x in tun), "tuning_midi is not a list of integers")
    voices = {}
    bad_pos = []
    for i, n in enumerate(d.get("notes") or []):
        for k in ("onset", "offset", "pitch"):
            need(k in n and n[k] is not None, f"note {i} has no {k}")
        if n.get("onset") is None or n.get("offset") is None or n.get("pitch") is None:
            continue
        need(float(n["offset"]) > float(n["onset"]), f"note {i}: offset <= onset (mir_eval needs positive durations)")
        need(float(n["onset"]) >= 0, f"note {i}: negative onset")
        if dur:
            need(float(n["offset"]) <= dur + 1.0, f"note {i}: offset {n['offset']} more than 1 s past duration_s {dur}")
        need(float(n["pitch"]) == int(n["pitch"]) and 0 <= int(n["pitch"]) <= 127, f"note {i}: pitch {n['pitch']} not an integer 0..127")
        v = n.get("voice")
        voices[str(v)] = voices.get(str(v), 0) + 1
        need(v is None or v in VOICES, f"note {i}: voice {v!r} not one of {VOICES}")
        s, fr = n.get("string"), n.get("fret")
        if s is not None and fr is not None and tun:
            ok = isinstance(s, int) and 1 <= s <= len(tun) and isinstance(fr, int) and fr >= 0
            need(ok, f"note {i}: string {s} / fret {fr} out of range")
            if ok:
                exp = tun[len(tun) - s] + capo + fr
                checked += 1
                if exp != int(n["pitch"]):
                    bad_pos.append(i)
    if bad_pos:
        probs.append(f"{len(bad_pos)} notes where pitch != tuning_midi[6-string] + capo + fret (first: {bad_pos[:5]})")
    for k in ("beats", "downbeats"):
        b = d.get(k) or []
        need(all(x <= y for x, y in zip(b, b[1:])), f"{k} not in increasing order")
        if dur and b:
            need(b[-1] <= dur + 0.5, f"{k}: last time {b[-1]} past duration_s")
    beats = d.get("beats") or []
    if beats and d.get("downbeats"):
        off = [x for x in d["downbeats"] if min(abs(x - y) for y in beats) > 0.001]
        need(not off, f"{len(off)} downbeats are not also beats (within 1 ms)")
    labs_bad = []
    ch = d.get("chords") or []
    for i, c in enumerate(ch):
        try:
            mir_eval.chord.encode(c["label"])
            checked += 1
        except Exception:  # noqa
            labs_bad.append(c.get("label"))
        need(float(c["end"]) > float(c["start"]), f"chord {i}: end <= start")
    if labs_bad:
        probs.append(f"chord labels mir_eval.chord cannot parse as written: {sorted(set(map(str, labs_bad)))}")
    need(all(float(x["end"]) <= float(y["start"]) + 1e-6 for x, y in zip(ch, ch[1:])), "chords overlap or are out of order")
    if d.get("key") is not None:
        try:
            mir_eval.key.validate_key(d["key"])
            checked += 1
        except Exception as e:  # noqa
            probs.append(f"key {d['key']!r} is not valid for mir_eval.key: {e}")
    taps = d.get("taps") or []
    need(all(float(x["time"]) <= float(y["time"]) for x, y in zip(taps, taps[1:])), "taps not in time order")
    for name, p in (d.get("stems") or {}).items():
        need(os.path.isfile(os.path.join(T.dir, p)), f"stem {name}: {p} not found next to the truth file")
    src = d.get("source") or {}
    need(src.get("kind") in SOURCE_KINDS, f"source.kind {src.get('kind')!r} not one of {SOURCE_KINDS}")
    probs = [p for p in probs if p]
    return {"subcommand": "check-truth", "truth": T.facts(), "counts": {"checks": checked, "mismatches": len(probs),
            "notes": len(d.get("notes") or []), "notes_by_voice": voices, "beats": len(beats),
            "downbeats": len(d.get("downbeats") or []), "chords": len(ch), "taps": len(taps),
            "stems": len(d.get("stems") or {})},
            "mismatches_with_schema": probs,
            "definitions": {"checks": "field presence, value ranges, time order, pitch = tuning_midi[6-string] + capo + fret, "
                                      "chord labels parse with mir_eval.chord.encode, key parses with mir_eval.key.validate_key, "
                                      "referenced files exist"}}


def cmd_check_truth(a):
    return check_truth(a.truth)


# ----------------------------------------------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------------------------------------------

def build_parser():
    p = argparse.ArgumentParser(prog="gtr-eval", description=__doc__.split("\n\n")[0],
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--version", action="version", version=f"gtr-eval {VERSION} ({VERSION_DATE})")
    sub = p.add_subparsers(dest="cmd")

    def common(sp, est=True):
        sp.add_argument("--truth", help="truth JSON (or a clip id like S2n, looked up under /home/user/gtr/inputs)")
        if est:
            sp.add_argument("--est", help="the tool's output file")
        sp.add_argument("--out", help="also write the JSON result to this file")
        sp.add_argument("--pretty", action="store_true", help="indent the JSON (default: one line)")
        sp.add_argument("--no-ledger", action="store_true", help="do not append this run to the gtr-eval ledger")

    s = sub.add_parser("notes", help="note transcription: onset / onset+offset P, R, F1 (mir_eval.transcription)")
    common(s)
    s.add_argument("--voice", help="score against truth notes of this voice only")
    s.add_argument("--pitch-shift", type=float, default=0.0, help="semitones added to every estimated pitch")
    s.add_argument("--time-shift", type=float, default=0.0, help="seconds added to every estimated onset/offset")
    s.add_argument("--onset-tol", type=float, default=0.05, help="onset tolerance in seconds (default 0.05)")
    s.add_argument("--chroma", action="store_true", help="also report pitch-class-only matching")
    s.add_argument("--pitch-unit", choices=("auto", "midi", "hz"), default="auto")
    s.add_argument("--cols", help="column names for a headerless table, e.g. onset,offset,pitch or onset,duration,pitch")
    s.add_argument("--include-drums", action="store_true", help="keep truth notes with voice 'drums' (and drum tracks of a MIDI estimate)")
    s.add_argument("--midi-programs", help="MIDI estimate: only instruments with these 0-based GM programs, e.g. 24-31 or 24,25,33")
    s.add_argument("--apply-tuning-offset", action="store_true", help="add the truth tuning_offset_cents to truth pitches")
    s.set_defaults(fn=cmd_notes)

    s = sub.add_parser("f0", help="monophonic pitch track vs truth melody on a 10 ms grid (mir_eval.melody)")
    common(s)
    s.add_argument("--voice", help="build the reference from this voice instead of 'melody'")
    s.add_argument("--conf-threshold", type=float, help="frames with confidence below this are unvoiced")
    s.add_argument("--nominal", action="store_true", help="do not apply the truth tuning_offset_cents to the reference")
    s.add_argument("--f0-unit", choices=("auto", "hz", "midi"), default="auto")
    s.set_defaults(fn=cmd_f0)

    s = sub.add_parser("beats", help="beat and downbeat tracking (mir_eval.beat)")
    common(s)
    s.add_argument("--downbeat-col", type=int, help="1-based column whose value 1 marks a downbeat (e.g. 2 for 'time beat_number')")
    s.add_argument("--downbeats-est", help="separate file with one downbeat time per line")
    s.add_argument("--min-beat-time", type=float, default=0.0, help="drop beats before this time (mir_eval.beat.trim_beats); default 0")
    s.add_argument("--time-shift", type=float, default=0.0)
    s.set_defaults(fn=cmd_beats)

    s = sub.add_parser("tempo", help="global tempo vs truth tempo_bpm")
    common(s)
    s.add_argument("--est-bpm", type=float)
    s.add_argument("--tolerance", type=float, default=0.04, help="relative tolerance (default 0.04 = 4 percent)")
    s.set_defaults(fn=cmd_tempo)

    s = sub.add_parser("chords", help="chord labels over time (mir_eval.chord)")
    common(s)
    s.add_argument("--time-shift", type=float, default=0.0)
    s.set_defaults(fn=cmd_chords)

    s = sub.add_parser("key", help="global key (mir_eval.key)")
    common(s)
    s.add_argument("--est-key")
    s.set_defaults(fn=cmd_key)

    s = sub.add_parser("tab", help="string and fret assignment of matched notes")
    common(s)
    s.add_argument("--ignore-time", action="store_true", help="match by note order instead of onset times")
    s.add_argument("--chord-window", type=float, default=0.05, help="with --ignore-time: notes this close (s) form one chord (default 0.05)")
    s.add_argument("--onset-tol", type=float, default=0.05)
    s.add_argument("--voice")
    s.add_argument("--est-tuning", help="open strings of the estimate, low to high, e.g. 40,45,50,55,59,64")
    s.add_argument("--est-capo", type=int)
    s.add_argument("--track", type=int, help="Guitar Pro track number (1-based)")
    s.add_argument("--time-shift", type=float, default=0.0)
    s.add_argument("--pitch-unit", choices=("auto", "midi", "hz"), default="auto")
    s.add_argument("--cols", help="column names for a headerless table, e.g. onset,pitch,string,fret")
    s.set_defaults(fn=cmd_tab)

    s = sub.add_parser("tab-frames", help="frame-level string/fret activations (precision, recall, F1)")
    common(s)
    s.add_argument("--hop", type=float, help="frame hop in seconds (default: the estimate's frame times, or inferred)")
    s.add_argument("--frame-format", choices=("auto", "long", "matrix"), default="auto")
    s.add_argument("--est-tuning")
    s.add_argument("--est-capo", type=int)
    s.add_argument("--voice")
    s.add_argument("--time-shift", type=float, default=0.0)
    s.set_defaults(fn=cmd_tab_frames)

    s = sub.add_parser("stems", help="source separation: SI-SDR and bss_eval SDR per stem")
    common(s, est=False)
    s.add_argument("--ref-dir", help="directory with the true stems (default: the truth's stems paths)")
    s.add_argument("--est-dir", help="directory with the estimated stems")
    s.add_argument("--map", nargs="+", help="name=file pairs: truth stem name (or file in --ref-dir) = estimated file")
    s.add_argument("--sr", type=int, help="common sample rate (default: truth sample_rate)")
    s.add_argument("--sdr-mode", choices=("auto", "joint", "single"), default="auto")
    s.add_argument("--max-seconds", type=float, help="score only the first N seconds")
    s.set_defaults(fn=cmd_stems)

    s = sub.add_parser("onsets", help="onset times vs truth taps or note onsets (mir_eval.onset)")
    common(s)
    s.add_argument("--field", choices=("taps", "notes"), default="taps")
    s.add_argument("--tap-kind", help="only truth taps of this kind")
    s.add_argument("--voice", help="with --field notes: only this voice")
    s.add_argument("--window", type=float, default=0.05)
    s.add_argument("--time-shift", type=float, default=0.0)
    s.set_defaults(fn=cmd_onsets)

    s = sub.add_parser("tuning", help="global tuning offset in cents (and optionally capo / open strings)")
    common(s)
    s.add_argument("--est-cents", type=float)
    s.add_argument("--est-a4-hz", type=float, help="estimated A4 frequency in Hz, converted to cents vs 440")
    s.add_argument("--est-capo", type=int)
    s.add_argument("--est-tuning-midi", help="estimated open strings, low to high, e.g. 38,45,50,55,59,64")
    s.set_defaults(fn=cmd_tuning)

    s = sub.add_parser("check-truth", help="check a truth file against the schema and its conventions")
    common(s, est=False)
    s.set_defaults(fn=cmd_check_truth)

    s = sub.add_parser("ledger", help="print scoring runs from the gtr-eval ledger")
    s.add_argument("--id", nargs="+", help="ledger ids such as e0012")
    s.add_argument("--truth-id", help="only runs on this clip id")
    s.add_argument("--sub", help="only this subcommand")
    s.add_argument("--last", type=int, help="only the last N matching runs")
    s.add_argument("--full", action="store_true", help="print the whole stored result")
    s.set_defaults(fn=None)

    s = sub.add_parser("selftest", help="known-answer checks for every subcommand")
    s.add_argument("--truth", nargs="*", help="also run truth-derived checks on these truth files")
    s.add_argument("--all-inputs", action="store_true", help="also run them on every /home/user/gtr/inputs/*/*.truth.json")
    s.add_argument("--quick", action="store_true", help="skip the stems checks")
    s.add_argument("--out", help="write the results as JSON")
    s.set_defaults(fn=None)
    return p


def run_args(argv):
    """Run one subcommand in-process and return its result dict (used by selftest)."""
    p = build_parser()
    a = p.parse_args(argv)
    if getattr(a, "truth", None) and isinstance(a.truth, str):
        a.truth = resolve_truth_path(a.truth)
    res = a.fn(a)
    return finish(res, a)


def finish(res, a):
    out = {"tool": "gtr-eval", "gtr_eval_version": VERSION}
    out.update(res)
    out["libraries"] = libraries()
    return clean(out)


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    p = build_parser()
    a = p.parse_args(argv)
    if a.cmd is None:
        p.print_help()
        return 2
    if a.cmd == "selftest":
        # the launcher runs python -I, which keeps this file's directory off sys.path; add it for our own module
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from gtr_eval_selftest import run_selftest  # noqa  (same directory)
        return run_selftest(a)
    if a.cmd == "ledger":
        return cmd_ledger(a)
    if getattr(a, "truth", None):
        a.truth = resolve_truth_path(a.truth)
    t0 = __import__("time").time()
    try:
        res = finish(a.fn(a), a)
        code = 0
    except EvalError as e:
        res = {"tool": "gtr-eval", "gtr_eval_version": VERSION, "subcommand": a.cmd, "error": str(e)}
        code = 1
    except Exception as e:  # noqa
        import traceback
        res = {"tool": "gtr-eval", "gtr_eval_version": VERSION, "subcommand": a.cmd,
               "error": f"{type(e).__name__}: {e}", "traceback": traceback.format_exc().splitlines()[-6:]}
        code = 3
    txt = json.dumps(res, ensure_ascii=False, indent=2 if getattr(a, "pretty", False) else None,
                     separators=None if getattr(a, "pretty", False) else (",", ":"))
    print(txt)
    if getattr(a, "out", None):
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        with open(a.out, "w", encoding="utf-8") as f:
            f.write(txt + "\n")
    if code:
        sys.stderr.write(f"gtr-eval {a.cmd}: {res.get('error')}\n")
    if a.cmd != "check-truth" and not getattr(a, "no_ledger", False):
        eid = append_ledger(argv, res, code, __import__("time").time() - t0)
        if eid:
            sys.stderr.write(f"[gtr-eval {eid}] {a.cmd} truth={res.get('truth', {}).get('id')} exit={code} "
                             f"(ledger {LEDGER})\n")
    return code


LEDGER = os.environ.get("GTR_EVAL_LEDGER", "/home/user/gtr/eval/ledger/evals.jsonl")


def append_ledger(argv, res, code, seconds):
    """One line per scoring run: id, time, exact argv, cwd, exit code, and the full result. Returns the id."""
    import datetime
    import fcntl
    try:
        os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
        with open(LEDGER + ".lock", "w") as lf:
            fcntl.flock(lf, fcntl.LOCK_EX)
            n = 0
            if os.path.exists(LEDGER):
                with open(LEDGER, "rb") as f:
                    n = sum(1 for _ in f)
            eid = f"e{n + 1:04d}"
            rec = {"id": eid, "utc": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
                   "argv": list(argv), "cwd": os.getcwd(), "exit_code": code, "seconds": round(seconds, 3),
                   "agent_hint": os.environ.get("GTR_AGENT"), "result": res}
            with open(LEDGER, "a", encoding="utf-8") as f:
                f.write(json.dumps(rec, ensure_ascii=False, separators=(",", ":")) + "\n")
            fcntl.flock(lf, fcntl.LOCK_UN)
        return eid
    except OSError as e:
        sys.stderr.write(f"gtr-eval: could not write the ledger {LEDGER}: {e}\n")
        return None


def cmd_ledger(a):
    """Print ledger lines, filtered by id, truth id or subcommand."""
    if not os.path.exists(LEDGER):
        print(json.dumps({"ledger": LEDGER, "entries": 0}))
        return 0
    out = []
    with open(LEDGER, encoding="utf-8") as f:
        for line in f:
            try:
                d = json.loads(line)
            except ValueError:
                continue
            r = d.get("result", {})
            if a.id and d.get("id") not in a.id:
                continue
            if a.truth_id and (r.get("truth") or {}).get("id") != a.truth_id:
                continue
            if a.sub and r.get("subcommand") != a.sub:
                continue
            out.append(d if a.full else {"id": d["id"], "utc": d["utc"], "argv": d["argv"], "exit_code": d["exit_code"],
                                         "version": r.get("gtr_eval_version"), "truth": (r.get("truth") or {}).get("id"),
                                         "subcommand": r.get("subcommand"), "error": r.get("error"),
                                         "metrics": r.get("metrics")})
    for d in out[-a.last:] if a.last else out:
        print(json.dumps(d, ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
