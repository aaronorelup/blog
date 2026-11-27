#!/usr/bin/env python3
"""blindcheck.py <blind folder> [<blind folder> ...]: is there anything in a writer's folder it must not see?

Run by prep.py at the end of every prep (a hit refuses the run: the folder is deleted) and by driver.py at every
start (a hit stops it). Looks at every file of the folder:
  - text files (anything without a NUL byte in its first 8 kB): the whole text;
  - JSON files also value by value; CSV files also cell by cell;
  - media and other binary files: their container tags (ffprobe) and the printable runs of 8+ characters in their
    first and last 2 MB (where the container keeps its names); short words only in runs of 12+ (random bytes of a
    compressed stream would spell a 4-letter word every few MB).
A hit is:
  - a slot name (capo, tuning, standard) in a path, a file name or an id (next to / \\ . or -), or as a whole value
    (a JSON string or a CSV cell). The bare word in prose or as a key ("capo": 3, tuning_midi) is the run's schema,
    the same in every run, and is allowed;
  - "truth" or "experiments" anywhere (any case);
  - a song's title, the artist in it, its player, its id, source file or source and video hosts, from the song list
    (/home/user/blog/docs/guitar-tab-research/video/songs.json: picks and backups) and the credit lines of
    /home/user/gtv/library/NOTES.md, read here only;
  - a path under /home or /root other than the folder itself, the loop's code (/home/user/gtv/loop/tools/) and the
    venvs (/home/user/gtv/tools/), or any source path of a run (songs, experiments, blind, the E1 windows, ...).
Held-out songs: /home/user/gtv/heldout/blind-names.json (masked in every sandbox) adds their titles, artists, players
and sources to the names (every run), and their slot ids, which are checked as slot names only in a held-out run:
check(folder, extra_slots=heldout_slots(slot)) (prep.py and driver.py pass them; for the three dev slots it is empty,
so a dev run is checked exactly as before). The command line takes --slots a,b for the same.
Prints one line per hit (file and what, never the matched text of a title: only its kind and position) and exits 1
on any hit. check(folder) returns the hits as (relative file, why) pairs."""
import json, os, re, subprocess, sys

SONGS_JSON = "/home/user/blog/docs/guitar-tab-research/video/songs.json"
NOTES_MD = "/home/user/gtv/library/NOTES.md"
HELDOUT_NAMES = "/home/user/gtv/heldout/blind-names.json"
SLOTS = ("capo", "tuning", "standard")
WORDS = ("truth", "experiments")
ALLOWED_PREFIX = ("/home/user/gtv/loop/tools/", "/home/user/gtv/tools/")
SOURCE_BITS = ("/songs/", "/experiments/", "/truth/", "/blind/", "/loop/e1/", "/loop/hand/", "/heldout/", "/candidates/",
               "/notes/", "/transcripts/", "/loop/runs/", "G/songs", "G/experiments", "G/truth", "G/blind", "blind/b2",
               "/home/claude", "/root/")
MEDIA_EXT = (".wav", ".mp4", ".mkv", ".mov", ".webm", ".flac", ".mp3", ".m4a", ".png", ".jpg", ".jpeg", ".webp", ".gif",
             ".gp5", ".mid", ".npy", ".npz", ".pdf")
def slot_re(slots):
    return re.compile(r"(?i)(?<![A-Za-z0-9_])(" + "|".join(slots) + r")(?![A-Za-z0-9_])")


SLOT_RE = slot_re(SLOTS)


def heldout_slots(slot=None):
    """The held-out slot ids (from HELDOUT_NAMES) when `slot` is not one of the three dev slots, else ()."""
    if slot in SLOTS:
        return ()
    try:
        return tuple(s for s in json.load(open(HELDOUT_NAMES)).get("slots", []) if s)
    except (OSError, ValueError):
        return (slot,) if slot else ()
PATH_RE = re.compile(r"(?:/home/|/root/)[^\s\"'<>|,;)\]}]*")
SCHEMA_KEYS = {"service_tier", "speed"}  # values of the CLI's own result (run.json): "standard" there is the API's tier
SCHEMA_OBJ = ("lessons", "state", "config", "tab", "hand", "run", "unit")   # lessons.tuning, state.tuning, config.capo


def names():
    """(kind, text) pairs a blind folder must never hold: titles, artists, players, ids, sources (case-insensitive)."""
    out = set()
    try:
        S = json.load(open(SONGS_JSON))
        for s in (S.get("picks") or []) + (S.get("backups") or []):
            t = s.get("title") or ""
            out.add(("title", t))
            out.add(("title", t.split(" (")[0]))
            for m in re.findall(r"\(([^)]+)\)", t):
                if "arrangement" not in m and "original" not in m:
                    out.add(("artist", m))
            out.add(("player", s.get("performer") or ""))
            out.add(("song id", s.get("id") or ""))
            sf = s.get("source_file") or ""
            out.add(("source file", os.path.splitext(sf)[0]))
            for k in ("source_url", "video_url"):
                u = s.get(k) or ""
                if "://" in u:
                    out.add(("source host", u.split("://", 1)[1].split("/")[0].replace("www.", "")))
                    out.add(("source url", u))
            for m in re.findall(r"YouTube ([A-Za-z0-9_-]{11})", s.get("original") or ""):
                out.add(("video id", m))
            for m in re.findall(r"\(([a-z0-9-]+\.[a-z]{2,})\)", s.get("credit") or ""):
                out.add(("source host", m))
    except (OSError, ValueError):
        out.add(("error", "the song list could not be read"))
    try:
        txt = open(NOTES_MD).read().split("\n## ")[0]
        for line in txt.splitlines():
            if line.startswith("- "):
                for m in re.findall(r"\b([a-z0-9-]+\.(?:com|org|net|io))\b", line):
                    out.add(("source host", m))
                for m in re.findall(r"by ([A-Z][a-z]+ [A-Z][a-z]+)", line):
                    out.add(("player", m))
    except OSError:
        out.add(("error", "the library notes could not be read"))
    if os.path.exists(HELDOUT_NAMES):
        try:
            for k, v in json.load(open(HELDOUT_NAMES)).get("names", []):
                out.add((k, v))
        except (OSError, ValueError, TypeError):
            out.add(("error", "the held-out names could not be read"))
    return sorted((k, v.strip()) for k, v in out if len(v.strip()) >= 5)


def is_binary(p):
    if p.lower().endswith(MEDIA_EXT):
        return True
    try:
        with open(p, "rb") as fh:
            return b"\0" in fh.read(8192)
    except OSError:
        return True


def text_hits(txt, rel, blind, NAMES, short_ok=True, where="text", sre=SLOT_RE):
    hits = []
    low = txt.lower()
    for w in WORDS:
        if short_ok and w in low:
            hits.append((rel, f"the word '{w}' ({where}, at {low.index(w)})"))
    for k, v in NAMES:
        if " " in v or len(v) >= 9:              # several words or a long name: anywhere, any case
            i = low.find(v.lower())
        else:                                    # one short word (a title like a common word): the word, as written
            m = re.search(r"(?<![A-Za-z0-9])" + re.escape(v) + r"(?![A-Za-z0-9])", txt); i = m.start() if m else -1
        if i >= 0:
            hits.append((rel, f"a {k} ({where}, at {i})"))
    if short_ok:
        for m in sre.finditer(txt):
            a, b = m.start(), m.end()
            w = m.group(1).lower()
            c2, c0, n1, n2 = txt[a - 2:a - 1], txt[a - 1:a], txt[b:b + 1], txt[b + 1:b + 2]
            if w == "tuning" and re.match(r"(?i)\.(json|md|u\d)", txt[b:b + 6]):
                continue                         # the driver's tuning reviews: tuning.u012/, tuning.json, TUNING.md
            if c0 == "." and re.search(r"(?<![A-Za-z0-9_])(" + "|".join(SCHEMA_OBJ) + r")$", txt[max(0, a - 12):a - 1]):
                continue                         # a field of the run's own files (lessons.tuning, config.capo)
            if c0 in "/\\" and c0 or n1 in "/\\" and n1 \
                    or (n1 in ".-" and n1 and n2.isalnum()) or (c0 in ".-" and c0 and c2.isalnum()):
                hits.append((rel, f"the slot name '{w}' in a path, file name or id ({where}, at {a})"))
    for m in PATH_RE.finditer(txt):
        p = m.group(0)
        b0 = blind.rstrip("/")
        if p.startswith((b0 + "/", b0 + ".solo/")) or p in (b0, b0 + ".solo") or p.startswith(ALLOWED_PREFIX):
            continue
        hits.append((rel, f"an outside path ({where}, at {m.start()})"))
    for s in SOURCE_BITS:
        for m in re.finditer(re.escape(s), txt):
            ctx = txt[max(0, m.start() - 60):m.end()]
            if blind in ctx or "/home/user/gtv/loop/tools" in ctx or "/home/user/gtv/tools" in ctx:
                continue
            hits.append((rel, f"a source path part '{s}' ({where}, at {m.start()})"))
            break
    return hits


def json_values(x, key=None):
    if isinstance(x, dict):
        for k, v in x.items():
            if k not in SCHEMA_KEYS:
                yield from json_values(v, k)
    elif isinstance(x, list):
        for v in x:
            yield from json_values(v, key)
    elif isinstance(x, str):
        yield x


def check(blind, NAMES=None, extra_slots=()):
    blind = os.path.abspath(blind)
    slots = SLOTS + tuple(s for s in extra_slots if s and s not in SLOTS)
    sre = slot_re(slots) if slots != SLOTS else SLOT_RE
    NAMES = names() if NAMES is None else NAMES
    hits = [(".", why) for k, why in NAMES if k == "error"]
    NAMES = [(k, v) for k, v in NAMES if k != "error"]
    for dp, dns, fs in os.walk(blind):
        for f in sorted(fs) + sorted(dns):
            p = os.path.join(dp, f); rel = os.path.relpath(p, blind)
            hits += text_hits(rel, rel, blind, NAMES, where="file name", sre=sre)
        for f in sorted(fs):
            p = os.path.join(dp, f); rel = os.path.relpath(p, blind)
            if os.path.islink(p):
                hits.append((rel, "a symbolic link")); continue
            if is_binary(p):
                tags = ""
                if p.lower().endswith(MEDIA_EXT[:9]):
                    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format_tags:stream_tags", "-of",
                                        "json", p], capture_output=True, text=True)
                    tags = " ".join(json_values(json.loads(r.stdout or "{}")))
                    hits += text_hits(tags, rel, blind, NAMES, where="media tags", sre=sre)
                size = os.path.getsize(p)
                with open(p, "rb") as fh:
                    parts = [fh.read(2 << 20)]
                    if size > 4 << 20:
                        fh.seek(size - (2 << 20)); parts.append(fh.read())
                for part in parts:
                    runs = re.findall(rb"[\x20-\x7e]{8,}", part)
                    long_runs = " | ".join(r.decode() for r in runs)
                    hits += text_hits(long_runs, rel, blind, [(k, v) for k, v in NAMES if len(v) >= 8], short_ok=False,
                                      where="binary strings", sre=sre)
                    hits += text_hits(" | ".join(r.decode() for r in runs if len(r) >= 12), rel, blind, [],
                                      where="binary strings", sre=sre)
                continue
            txt = open(p, encoding="utf-8", errors="replace").read()
            hits += text_hits(txt, rel, blind, NAMES, sre=sre)
            if f.endswith(".json"):
                try:
                    vals = list(json_values(json.load(open(p))))
                except ValueError:
                    vals = []
                for v in vals:
                    if v.strip().lower() in slots:
                        hits.append((rel, f"the slot name '{v.strip().lower()}' as a value")); break
            elif f.endswith(".jsonl"):
                for line in txt.splitlines()[:200000]:
                    try:
                        vals = list(json_values(json.loads(line)))
                    except ValueError:
                        continue
                    if any(v.strip().lower() in slots for v in vals):
                        hits.append((rel, "a slot name as a value")); break
            elif f.endswith(".csv"):
                cells = re.split(r"[,\n\r]", txt)
                if any(c.strip().strip('"').lower() in slots for c in cells):
                    hits.append((rel, "a slot name as a cell"))
    seen, out = set(), []
    for h in hits:
        if h not in seen:
            seen.add(h); out.append(h)
    return out


if __name__ == "__main__":
    bad = 0
    N = names()
    args, extra = sys.argv[1:], ()
    if "--slots" in args:
        k = args.index("--slots"); extra = tuple(x for x in args[k + 1].split(",") if x); del args[k:k + 2]
    for b in args:
        h = check(b, N, extra)
        print(f"{b}: {len(h)} hit(s)")
        for rel, why in h[:40]:
            print(f"  {rel}: {why}")
        bad += bool(h)
    sys.exit(1 if bad else 0)
