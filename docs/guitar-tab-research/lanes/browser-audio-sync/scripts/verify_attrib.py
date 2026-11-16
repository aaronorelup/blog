#!/usr/bin/env python3
"""verify-docs-browser-audio-sync: for each found quote, check that a source it was found in is the one the survey
cites next to it (same list item = BLOCK, same section = SECTION, otherwise ELSEWHERE).
Usage: python3 -I verify_attrib.py SURVEY.md QUOTES.tsv URLS.tsv[,URLS2.tsv...] > OUT.tsv"""
import re, sys
from urllib.parse import urlparse
survey, qtsv, urlfiles = sys.argv[1], sys.argv[2], sys.argv[3].split(",")
urls = {}
for f in urlfiles:
    for l in open(f):
        if "\t" in l and not l.startswith("#"):
            k, u = l.rstrip("\n").split("\t", 1); urls[k] = u
lines = open(survey).read().split("\n")
# block text per starting line, section text per section id
blocks, sect_text = {}, {}
cur, start, section = [], 0, "0"
for i, l in enumerate(lines, 1):
    m = re.match(r"^## (\d+)\.", l)
    newblock = l.startswith("#") or re.match(r"^\s*(- |\d+\. )", l) or not l.strip()
    if newblock and cur:
        blocks[start] = " ".join(cur); cur = []
    if m: section = m.group(1)
    elif l.startswith("## "): section = l[3:30]
    sect_text[section] = sect_text.get(section, "") + " " + l
    if l.strip() and not l.startswith("#"):
        if not cur: start = i
        cur.append(l.strip())
if cur: blocks[start] = " ".join(cur)
def tokens(key):
    t = []
    if key.startswith("fetch/"):
        k = key[6:]
        if k.endswith(".txt"): k = k[:-4]
        u = urls.get(k, "")
        p = urlparse(u)
        path = p.path.strip("/")
        if "mdn/content" in u:
            t.append(path.split("files/en-us/")[-1].replace("/index.md", ""))
        elif p.netloc == "raw.githubusercontent.com":
            parts = path.split("/"); t.append(parts[0] + "/" + parts[1])
        elif p.netloc == "huggingface.co" and ("/raw/" in u or "/api/" in u):
            parts = path.replace("api/models/", "").split("/"); t.append(parts[0] + "/" + parts[1])
        elif p.netloc == "unpkg.com":
            t.append(path.split("/", 1)[-1].split("/")[-1]); t.append(path.split("@")[0] if not path.startswith("@") else "@" + path[1:].split("@")[0])
        else:
            t.append(p.netloc + ("/" + path if path else ""))
    elif key.startswith("files/"):
        pkgdir, fn = key[6:].split("/", 1)
        t.append(pkgdir.replace("__", "/"))
    return [x for x in t if x]
for l in open(qtsv):
    ln, sec, st, hits, q = l.rstrip("\n").split("\t", 4)
    if not st.startswith("FOUND"): continue
    keys = [h.strip() for h in hits.split("|") if h.strip()]
    b = blocks.get(int(ln), ""); s = sect_text.get(sec, "")
    toks = {k: tokens(k) for k in keys}
    where = "ELSEWHERE"
    if any(tok in b for k in keys for tok in toks[k]): where = "BLOCK"
    elif any(tok in s for k in keys for tok in toks[k]): where = "SECTION"
    print(f"{ln}\t{sec}\t{where}\t{' | '.join(keys)}\t{q[:90]}")
