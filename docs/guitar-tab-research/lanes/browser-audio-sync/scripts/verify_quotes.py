#!/usr/bin/env python3
"""verify-docs-browser-audio-sync: check every double-quoted passage of survey.md against freshly fetched sources.

Usage: python3 -I verify_quotes.py SURVEY.md OUT.tsv SRC_DIR [SRC_DIR ...]
Sources: every file under the SRC_DIRs (raw pages, HTML->text copies, npm package files, repository files).
Normalisation applied to both sides: NFKC, curly quotes -> straight, markdown links [t](u) -> t, the characters
* _ ` \\ removed, whitespace collapsed ("whitespace aside", as the task asks). A passage counts as found when its
normalised form is a substring of a normalised source; a second pass also ignores all whitespace.
Pairing of quote marks: from each opening mark, the longest span up to 6 marks ahead that is found wins (this
keeps nested quotes such as (the "Software") inside one passage); if none is found, the span to the next mark
is reported as NOT FOUND. Passages shorter than 12 normalised characters are listed as SHORT and not searched.
Output columns: survey line, section, status, source keys where found (max 4), passage (first 160 chars)."""
import os, re, sys, unicodedata

def norm(s):
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("‘", "'").replace("’", "'").replace("“", '"').replace("”", '"')
    s = s.replace(" ", " ").replace(" ", " ")
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"[*_`\\]", "", s)
    return re.sub(r"\s+", " ", s).strip()

def main():
    survey, outp, dirs = sys.argv[1], sys.argv[2], sys.argv[3:]
    srcs = {}
    for d in dirs:
        for root, _, files in os.walk(d):
            for f in files:
                p = os.path.join(root, f)
                if f.startswith("_") and f.endswith((".tsv", ".txt")): continue
                try:
                    raw = open(p, "rb").read()
                except OSError: continue
                if len(raw) > 30_000_000 or b"\x00" in raw[:4096]: continue
                key = os.path.relpath(p, os.path.dirname(d.rstrip("/")))
                srcs[key] = norm(raw.decode("utf-8", "replace"))
    nows = {k: re.sub(r"\s", "", v) for k, v in srcs.items()}
    lines = open(survey).read().split("\n")
    # group lines into blocks: a block starts at a heading, a list item or after a blank line
    blocks, cur, start, section = [], [], 0, "0"
    for i, l in enumerate(lines, 1):
        m = re.match(r"^## (\d+)\.", l)
        newblock = l.startswith("#") or re.match(r"^\s*(- |\d+\. )", l) or not l.strip()
        if newblock and cur:
            blocks.append((start, section, " ".join(cur))); cur = []
        if m: section = m.group(1)
        elif l.startswith("## "): section = l[3:30]
        if l.strip() and not l.startswith("#"):
            if not cur: start = i
            cur.append(l.strip())
    if cur: blocks.append((start, section, " ".join(cur)))
    out = open(outp, "w")
    stats = {}
    for start, section, text in blocks:
        pos = [m.start() for m in re.finditer('"', text)]
        i = 0
        while i < len(pos) - 1:
            best = None
            for j in range(i + 1, min(i + 7, len(pos))):
                q = norm(text[pos[i] + 1:pos[j]])
                if len(q) < 12: 
                    if j == i + 1: best = ("SHORT", j, q, [])
                    break
                hits = [k for k, v in srcs.items() if q in v]
                st = "FOUND"
                if not hits:
                    qq = re.sub(r"\s", "", q)
                    hits = [k for k, v in nows.items() if qq in v]; st = "FOUND_WS"
                if hits: best = (st, j, q, hits)
                elif best is None and j == i + 1: best = ("NOT_FOUND", j, q, [])
            st, j, q, hits = best
            if st == "NOT_FOUND":
                # a longer found span may exist starting here only if j>i+1; already tried; report the short span
                pass
            stats[st] = stats.get(st, 0) + 1
            out.write(f"{start}\t{section}\t{st}\t{' | '.join(hits[:4])}\t{q[:160]}\n")
            i = j + 1
    out.close()
    print(stats, "sources:", len(srcs))

if __name__ == "__main__":
    main()
