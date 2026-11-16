"""verify-gapfill-hosted-apis (round 2): check every quoted string that gap round 2 added against pages fetched
fresh by this verifier (not the gap-filler's saved copies).

usage: python3 -I check_quotes_live.py <lane record dir> <diff file> <old tools.json> <pages dir> [extra source ...]
       -- <out tsv>

<diff file>: `git diff -U0 d2e9a17 d90f43e` of survey.md, trials.md and for-aaron.md (the commit before gap round 2
and the commit that holds it; read-only). Added lines are joined into blocks so wrapped quotes are whole, and every
"..." string of 4 or more characters is taken. <old tools.json>: tools.json as of d2e9a17. From the current
tools.json, every string that is new or changed since then is taken: license "quote" fields whole, and the "..."
strings inside every other new or changed string field.
Each page in <pages dir> (*.raw from fetch_pages.sh) is searched in several renderings: the raw text, the text with
HTML tags removed, pandoc's plain text, and the raw text with JSON / JavaScript string escapes decoded (for pages
whose text sits in embedded data). Normalisation before the search: HTML entities, curly quotes and apostrophes to
straight ones, non-breaking spaces, markdown bold, backticks and links, backslash escapes, and every whitespace run
to one space. Output: one line per quote: the pages it was found in (or NOT FOUND), where it came from, the quote.
"""
import glob
import html
import json
import os
import re
import subprocess
import sys

args = sys.argv[1:]
sep = args.index("--")
lane, diff_path, old_tools_path, pages_dir = args[0], args[1], args[2], args[3]
extra = args[4:sep]
out_path = args[sep + 1]


def norm(s):
    s = html.unescape(s)
    for a, b in (("“", '"'), ("”", '"'), ("’", "'"), ("‘", "'"), (" ", " "),
                 (" ", " "), (" ", " ")):
        s = s.replace(a, b)
    s = s.replace("\\$", "$").replace("\\-", "-").replace("\\_", "_").replace('\\"', '"').replace("\\*", "*")
    s = s.replace("**", "").replace("`", "")
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    return re.sub(r"\s+", " ", s).strip()


def js_unescape(s):
    def rep(m):
        t = m.group(1)
        if len(t) == 5 and t.startswith("u"):
            return chr(int(t[1:], 16))
        return {"n": "\n", "t": "\t", "r": "\n", '"': '"', "'": "'", "\\": "\\", "/": "/"}.get(t, t)
    return re.sub(r"\\(u[0-9a-fA-F]{4}|.)", rep, s)


renderings = {}
for p in sorted(glob.glob(os.path.join(pages_dir, "*.raw"))):
    name = os.path.basename(p)[:-4]
    raw = open(p, encoding="utf-8", errors="replace").read()
    texts = [raw]
    if re.search(r"<html|<!doctype html", raw[:3000], re.I):
        texts.append(re.sub(r"<[^>]+>", " ", re.sub(r"<!--.*?-->", "", raw, flags=re.S)))
        try:
            texts.append(subprocess.run(["pandoc", "-f", "html", "-t", "plain", "--wrap=none", p],
                                        capture_output=True, text=True, timeout=180).stdout)
        except Exception:
            pass
    dec = js_unescape(raw)
    texts.append(dec)
    texts.append(re.sub(r"<[^>]+>", " ", dec))
    renderings[name] = [norm(t) for t in texts]
for p in extra:
    renderings["extra:" + os.path.basename(os.path.dirname(p)) + "/" + os.path.basename(p)] = \
        [norm(open(p, encoding="utf-8", errors="replace").read())]

quotes = []
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
for b in blocks:
    for m in re.finditer(r'"([^"]{4,}?)"', b):
        quotes.append(("md", m.group(1)))


def strings(x, path=""):
    if isinstance(x, str):
        yield path, x
    elif isinstance(x, dict):
        for k, v in x.items():
            yield from strings(v, path + "." + k)
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from strings(v, path + "[%d]" % i)


old = {t["name"]: t for t in json.load(open(old_tools_path))["tools"]}
new = json.load(open(os.path.join(lane, "tools.json")))["tools"]
for t in new:
    old_strings = set(s for _, s in strings(old.get(t["name"], {})))
    for path, s in strings(t):
        if s in old_strings:
            continue
        src = "json:" + t["name"][:32] + path
        if path.endswith(".quote"):
            quotes.append((src, s))
        else:
            for m in re.finditer(r'"([^"]{4,}?)"', s):
                quotes.append((src, m.group(1)))

n_found = 0
with open(out_path, "w") as f:
    f.write("result\tsource of the quote\tquote\n")
    for src, q in quotes:
        nq = norm(q)
        hits = [name for name, texts in renderings.items() if any(nq in t for t in texts)]
        n_found += bool(hits)
        f.write((",".join(hits) if hits else "NOT FOUND") + "\t" + src + "\t" + q.replace("\t", " ") + "\n")
print(f"{len(quotes)} quotes, {n_found} found in a fresh page, {len(quotes) - n_found} not found -> {out_path}")
