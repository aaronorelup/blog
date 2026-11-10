# verify-docs-source-separation: find every double-quoted string in survey.md and look for it in the re-fetched
# sources.  Each quote is cut at "..." / "…" into fragments; every fragment of 8+ characters must be found.
#   strict = whitespace-normalized, otherwise verbatim
#   loose  = also ignores Markdown emphasis (** __ `), link targets "[text](url)" -> "[text]", curly vs straight quotes,
#            HTML tags/entities (Zenodo descriptions), and backslash escapes
# JSON files are searched through every string value they contain.  Run with python3 -I.
# Usage: python3 -I verify-docs-quotes.py SURVEY.md OUT.tsv DIR [DIR ...]
import html, json, os, re, sys

survey, out_path, dirs = sys.argv[1], sys.argv[2], sys.argv[3:]


def ws(s):
    return re.sub(r'\s+', ' ', s).strip()


def loose(s):
    s = html.unescape(s)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = re.sub(r'\]\([^)]*\)', ']', s)          # [text](url) -> [text]
    s = s.replace('\\', '')
    s = re.sub(r'(\*\*|__|`)', '', s)
    for a, b in (('“', '"'), ('”', '"'), ('‘', "'"), ('’', "'"), ('–', '-'), ('—', '-'), (' ', ' ')):
        s = s.replace(a, b)
    s = re.sub(r'\[([^\]]*)\]', r'\1', s)       # drop brackets entirely
    return ws(s).lower()


def strings_of(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from strings_of(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings_of(v)


docs = {}
for d in dirs:
    for root, _, files in os.walk(d):
        for f in files:
            p = os.path.join(root, f)
            if f.startswith('_') or os.path.getsize(p) > 20_000_000:
                continue
            try:
                t = open(p, encoding='utf-8', errors='replace').read()
            except Exception:
                continue
            texts = [t]
            if f.endswith('.json'):
                try:
                    texts += list(strings_of(json.loads(t)))
                except Exception:
                    pass
            if f.endswith(('.html', '.htm')) or '<html' in t[:2000].lower():
                texts.append(re.sub(r'<[^>]+>', ' ', t))
            key = os.path.relpath(p, d) if len(dirs) == 1 else p
            docs[key] = (ws('\n'.join(texts)), loose('\n'.join(texts)))

text = open(survey, encoding='utf-8').read()
lines = text.split('\n')
# Map character offset -> line number
offs, o = [], 0
for i, l in enumerate(lines):
    offs.append(o)
    o += len(l) + 1


def lineno(pos):
    lo, hi = 0, len(offs) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if offs[mid] <= pos:
            lo = mid
        else:
            hi = mid - 1
    return lo + 1


flat = text.replace('\n', ' ')
rows = []
for m in re.finditer(r'"([^"]{6,}?)"', flat):
    q = m.group(1)
    if q.startswith(('http', 'license', 'sample_rate')):
        pass
    frags = [f for f in re.split(r'\s*(?:\.\.\.|…)\s*', q) if len(ws(f)) >= 8]
    if not frags:
        continue
    strict_hits, loose_hits = None, None
    for f in frags:
        fs, fl = ws(f), loose(f)
        sh = {k for k, (s, l) in docs.items() if fs in s}
        lh = {k for k, (s, l) in docs.items() if fl in l}
        strict_hits = sh if strict_hits is None else strict_hits & sh
        loose_hits = lh if loose_hits is None else loose_hits & lh
    status = 'STRICT' if strict_hits else ('LOOSE' if loose_hits else 'NOTFOUND')
    rows.append((lineno(m.start()), status, ';'.join(sorted(strict_hits or loose_hits or []))[:300], ws(q)[:220]))

with open(out_path, 'w', encoding='utf-8') as fo:
    for r in rows:
        fo.write('\t'.join(map(str, r)) + '\n')
from collections import Counter
print(Counter(r[1] for r in rows), 'quotes:', len(rows))
