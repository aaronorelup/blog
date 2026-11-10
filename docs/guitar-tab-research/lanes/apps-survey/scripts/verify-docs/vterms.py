"""vterms.py : verify-docs-apps-survey. Checks every license / terms clause quoted in survey.md against the one page
it is attributed to (this agent's fresh copies in /home/user/gtr/lanes/apps-survey/verify-docs/{raw,rendered}/).
Each quote is split at "..." into parts; every part must be on that page, in order. For each hit it prints the
text just before the first part, so the section number the survey gives can be read off by a person.
Matching ignores case, whitespace, curly-vs-straight quotes, dash variants and leading "#" comment marks."""
import os, re, sys, json

BASE = "/home/user/gtr/lanes/apps-survey/verify-docs"


def slug(u):
    s = re.sub(r"^https?://", "", u)
    s = re.sub(r"[^A-Za-z0-9._-]+", "_", s)
    return re.sub(r"_+$", "", s)[:120]


def norm(s):
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), ("„", '"'), (" ", " "), ("—", "-"),
                 ("–", "-"), ("‑", "-"), ("**", ""), ("​", ""), ("`", "")):
        s = s.replace(a, b)
    s = re.sub(r"(?m)^\s*#\s?", " ", s)  # plain-text files with "#" comment lines
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s+([.,;:!?)])", r"\1", s)
    return s.strip().lower()


def page(u):
    out = {}
    for d in ("raw", "rendered"):
        f = os.path.join(BASE, d, slug(u) + ".txt")
        if os.path.exists(f):
            out[d] = norm(open(f, encoding="utf-8", errors="replace").read())
    return out


items = json.load(open(sys.argv[1], encoding="utf-8"))
tally = {}
for it in items:
    pg = page(it["url"])
    parts = [p.strip(" .,;:") for p in re.split(r"\s*\.\.\.\s*", it["quote"])]
    parts = [norm(p) for p in parts if len(p.strip()) >= 4]
    best = None
    for src, txt in pg.items():
        pos, ok, first = 0, True, None
        for p in parts:
            i = txt.find(p, pos)
            if i < 0:
                ok = False
                break
            if first is None:
                first = i
            pos = i + len(p)
        if ok:
            best = (src, first, txt)
            break
    st = "CONFIRMED" if best else "NOT FOUND"
    tally[st] = tally.get(st, 0) + 1
    print(f"[{st}] {it['id']} {it.get('sec', '')} {it['url']}")
    if best:
        src, first, txt = best
        print(f"     via {src}; before: ...{txt[max(0, first - 160):first]!r}")
    else:
        for p in parts:
            hit = [s for s, t in pg.items() if p in t]
            print(f"     part {'found' if hit else 'MISSING'}: {p[:110]!r}")
print(tally)
