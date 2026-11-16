"""verify-docs-web-tab-render: pull every double-quoted string out of survey.md and look for it in each fetched
source text. Levels: EXACT (whitespace collapsed), MARKUP (markdown/HTML markup and backticks dropped on both
sides), TYPO (also curly quotes, dashes and ellipses folded), NOT FOUND. A quote with "..." is split into
pieces that must each be found (in order is not enforced). Prints a TSV: line, level, sources, quote.
Usage: python3 -I check_quotes.py survey.md <dir with *.txt sources>"""
import re, sys, os, glob

def ws(s): return re.sub(r"\s+", " ", s).strip()
def markup(s):
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)      # markdown links -> text
    s = re.sub(r"<[^>]{1,80}>", " ", s)                   # inline html tags
    s = s.replace("`", "").replace("**", "").replace("__", "").replace("\\", "")
    s = re.sub(r"(?<!\w)[*_](?=\S)|(?<=\S)[*_](?!\w)", "", s)
    s = s.replace("&nbsp;", " ").replace(" ", " ").replace("​", "")
    return ws(s)
def typo(s):
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), ("–", "-"), ("—", "-"),
                 ("…", "..."), ("«", '"'), ("»", '"')):
        s = s.replace(a, b)
    s = s.replace(" ,", ",").replace(" .", ".").replace(" ;", ";").replace(" :", ":").replace("( ", "(").replace(" )", ")")
    return ws(s)

srcdir = sys.argv[2]
sources = {}
for p in glob.glob(os.path.join(srcdir, "*.txt")):
    t = open(p, errors="replace").read()
    sid = os.path.basename(p)[:-4]
    sources[sid] = (ws(t), markup(t), typo(markup(t)))

text = open(sys.argv[1]).read()
lines = text.split("\n")
# map char offset -> line number
offs = []; o = 0
for i, l in enumerate(lines): offs.append(o); o += len(l) + 1
import bisect
def lineno(pos): return bisect.bisect_right(offs, pos)

# mask inline code spans (same length) so quote characters inside `...` do not break the pairing
masked = re.sub(r"`[^`\n]*`", lambda m: "`" + "x" * (len(m.group(0)) - 2) + "`", text)
for m in re.finditer(r'"([^"]{6,}?)"', masked):
    q = text[m.start(1):m.end(1)]
    if "\n\n" in q: continue
    pieces = [p for p in re.split(r"\s*(?:\.\.\.|…)\s*", ws(q)) if len(p.strip()) >= 4]
    if not pieces: continue
    best = None
    for level, fn, idx in (("EXACT", ws, 0), ("MARKUP", markup, 1), ("TYPO", lambda s: typo(markup(s)), 2)):
        hits = [sid for sid, v in sources.items() if all(fn(p) in v[idx] for p in pieces)]
        if hits: best = (level, hits); break
    if not best: best = ("NOTFOUND", [])
    print(f"{lineno(m.start())}\t{best[0]}\t{','.join(sorted(best[1])[:6])}\t{ws(q)[:160]}")
