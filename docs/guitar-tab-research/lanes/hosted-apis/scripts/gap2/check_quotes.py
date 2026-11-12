"""Gap round 2: check that every double-quoted string this round added to the lane record occurs in a saved source.

usage: python3 -I check_quotes.py <lane record dir> <diff file> <out tsv>
<diff file> is `git diff -U0` of survey.md, trials.md and for-aaron.md against the commit before the round (made by the
caller; read-only). Added lines are joined into contiguous blocks (so quotes wrapped over lines are whole), and every
"..." string of 4 or more characters in them is searched for, after normalising whitespace, curly quotes, markdown
bold/backticks and backslash escapes, in the pages saved under /home/user/gtr/lanes/hosted-apis/raw/ (all rounds),
/home/user/gtr/lanes/hosted-apis/verify-docs/raw/, the lane's samples/ and the inputs manifest. tools.json quote
fields added in this round are checked the same way. Writes one line per quote: found or NOT FOUND, and the quote.
"""
import glob
import html
import json
import os
import re
import sys

lane, diff_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]


def norm(s):
    s = html.unescape(s)
    s = s.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    s = s.replace("\\$", "$").replace("\\-", "-").replace("\\_", "_").replace('\\"', '"')
    s = s.replace("**", "").replace("`", "")
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    return re.sub(r"\s+", " ", s).strip()


corpus = []
roots = ["/home/user/gtr/lanes/hosted-apis/raw", "/home/user/gtr/lanes/hosted-apis/verify-docs/raw",
         "/home/user/gtr/lanes/hosted-apis/dl/web", os.path.join(lane, "samples")]
for r in roots:
    for p in glob.glob(os.path.join(r, "**", "*"), recursive=True):
        if p.endswith(".tsv"):  # earlier quote-check outputs hold the record's own quotes: never a source
            continue
        if os.path.isfile(p) and os.path.getsize(p) < 30_000_000:
            try:
                text = open(p, encoding="utf-8", errors="replace").read()
            except Exception:
                continue
            corpus.append(norm(text))
            if p.endswith((".html", ".raw")):  # also the visible text: tags and HTML comments removed
                corpus.append(norm(re.sub(r"<[^>]+>", "", re.sub(r"<!--.*?-->", "", text))))
corpus.append(norm(open("/home/user/gtr/inputs/INPUTS.md").read()))
big = "\n".join(corpus)

# added blocks from the diff
blocks, cur = [], []
for line in open(diff_path, encoding="utf-8"):
    if line.startswith("+") and not line.startswith("+++"):
        cur.append(line[1:].rstrip("\n"))
    else:
        if cur:
            blocks.append(" ".join(cur))
            cur = []
if cur:
    blocks.append(" ".join(cur))

quotes = []
for b in blocks:
    for m in re.finditer(r'"([^"]{4,}?)"', b):
        quotes.append(("md", m.group(1)))

# tools.json quote fields of this round
d = json.load(open(os.path.join(lane, "tools.json")))
for t in d["tools"]:
    lic = t.get("license") or {}
    items = list(lic.get("service_terms") or [])
    for k in ("weights", "code"):
        if isinstance(lic.get(k), dict):
            items.append(lic[k])
    for it in items:
        if it.get("read") == "2026-11-11" and it.get("quote"):
            quotes.append(("json:" + t["name"][:40], it["quote"]))

n_found = 0
with open(out_path, "w") as f:
    for src, q in quotes:
        ok = norm(q) in big
        n_found += ok
        f.write(("found" if ok else "NOT FOUND") + "\t" + src + "\t" + q.replace("\t", " ") + "\n")
print(f"{len(quotes)} quotes, {n_found} found, {len(quotes) - n_found} not found -> {out_path}")
