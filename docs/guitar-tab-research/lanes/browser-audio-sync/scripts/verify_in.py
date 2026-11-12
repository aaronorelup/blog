#!/usr/bin/env python3
"""verify-docs-browser-audio-sync: does each quoted passage occur in the named file (normalised as in verify_quotes.py)?
Usage: python3 -I verify_in.py PAIRS.tsv   (lines: file<TAB>passage). Prints YES/NO per line."""
import re, sys, unicodedata
def norm(s):
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("‘", "'").replace("’", "'").replace("“", '"').replace("”", '"')
    s = s.replace(" ", " ").replace(" ", " ")
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"[*_`\\]", "", s)
    return re.sub(r"\s+", " ", s).strip()
cache = {}
for l in open(sys.argv[1]):
    if "\t" not in l: continue
    f, q = l.rstrip("\n").split("\t", 1)
    if f not in cache:
        try: cache[f] = norm(open(f, "rb").read().decode("utf-8", "replace"))
        except OSError as e: cache[f] = None
    t = cache[f]
    if t is None: print("NOFILE", f, q[:80]); continue
    nq = norm(q)
    ok = nq in t or re.sub(r"\s", "", nq) in re.sub(r"\s", "", t)
    print("YES" if ok else "NO ", f.split("/")[-2] + "/" + f.split("/")[-1], "|", q[:90])
