"""vquotes.py <survey.md> : verify-docs-apps-survey's quote check.

For every double-quoted passage in survey.md (straight quotes, at least 10 characters), find the "## " section it is in
and the URLs that section cites, then look for the passage (split at "..." / "…" into parts) in this agent's own fresh
copies of those pages (curl text in verify-docs/raw/<slug>.txt, Chromium-rendered text in verify-docs/rendered/<slug>.txt).
Prints one line per passage: OK (every part found in a page the section cites), ELSEWHERE (found only in a page cited by
another section), PARTIAL (some parts found) or MISSING. Matching ignores case, whitespace, curly-vs-straight quotes,
dash variants and Markdown emphasis marks. A human reads every non-OK line; this script only sorts them.
Options: --short checks passages of 2 to 9 characters instead; --strict keeps each part's end punctuation (so a quote
ending "settings." does not match a page reading "settings, and ..."); -v prints OK lines too."""
import sys, re, os, glob

BASE = "/home/user/gtr/lanes/apps-survey/verify-docs"


def slug(u):
    s = re.sub(r"^https?://", "", u)
    s = re.sub(r"[^A-Za-z0-9._-]+", "_", s)
    return re.sub(r"_+$", "", s)[:120]


def norm(s):
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), (" ", " "), ("—", "-"), ("–", "-"),
                 ("‑", "-"), ("**", ""), ("​", ""), ("`", "")):
        s = s.replace(a, b)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s+([.,;:!?)])", r"\1", s)
    return s.strip().lower()


def corpus(u):
    out = ""
    for d in ("raw", "rendered"):
        f = os.path.join(BASE, d, slug(u) + ".txt")
        if os.path.exists(f):
            out += "\n" + norm(open(f, encoding="utf-8", errors="replace").read())
    return out


text = open(sys.argv[1], encoding="utf-8").read()
# sections
secs = re.split(r"\n(?=## )", text)
all_urls = sorted(set(re.findall(r"https?://[^\s)>`\"]+", text)))
all_urls = [re.sub(r"[.,;]$", "", u) for u in all_urls]
corp = {u: corpus(u) for u in all_urls}
stats = {}
for sec in secs:
    title = sec.split("\n", 1)[0][:70]
    urls = [re.sub(r"[.,;]$", "", u) for u in re.findall(r"https?://[^\s)>`\"]+", sec)]
    flat = re.sub(r"\n\s*", " ", sec)
    lo, hi = (2, 10) if "--short" in sys.argv else (10, 10**9)
    for q in [x for x in re.findall(r'"([^"]*)"', flat) if lo <= len(x) < hi]:
        strip = " " if "--strict" in sys.argv else " .,;:"
        parts = [p.strip(strip) for p in re.split(r"\s*\.\.\.\s*|\s*…\s*|\s*\[\.\.\.\]\s*", q)]
        parts = [p for p in parts if len(p) >= (2 if lo < 10 else 6)]
        if not parts:
            continue
        found_sec, found_else = [], []
        for p in parts:
            n = norm(p)
            hit = [u for u in urls if n in corp.get(u, "")]
            if hit:
                found_sec.append(hit)
            else:
                other = [u for u in all_urls if n in corp.get(u, "")]
                found_else.append((p, other))
        if not found_else:
            st = "OK"
        elif all(o for _, o in found_else):
            st = "ELSEWHERE"
        elif found_sec:
            st = "PARTIAL"
        else:
            st = "MISSING"
        stats[st] = stats.get(st, 0) + 1
        if st != "OK" or "-v" in sys.argv:
            print(f"[{st}] ({title}) {q[:200]}")
            for p, o in found_else:
                print(f"     part not in section pages: {p[:150]!r} -> {o[:3]}")
print(stats)
