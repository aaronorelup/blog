#!/usr/bin/env python3
"""docs-browser-audio-sync: check that quoted passages in survey.md occur in the saved source files.

Usage: python3 -I docs_quote_check.py SURVEY.md CORPUS_DIR [CORPUS_DIR ...]
Extracts every "double-quoted" passage of 30+ characters from SURVEY.md (curly quotes too), collapses whitespace,
and looks for it in the concatenated, whitespace-collapsed text of every file under the corpus directories (HTML is
also reduced to text). Prints the passages that were NOT found, so they can be re-checked by hand. A passage can fail
only because of formatting (a quote that spans a list item break, an HTML entity, a markdown link); every miss is
looked at, not deleted automatically.
"""
import html, os, re, sys

def norm(t):
    t = html.unescape(t)
    t = t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return re.sub(r'\s+', ' ', t).strip()

survey = open(sys.argv[1], encoding='utf-8').read()
corpus = []
for root in sys.argv[2:]:
    for dp, dn, fn in os.walk(root):
        if '.git' in dp:
            continue
        for f in fn:
            path = os.path.join(dp, f)
            try:
                if os.path.getsize(path) > 8_000_000:
                    continue
                raw = open(path, encoding='utf-8', errors='replace').read()
            except OSError:
                continue
            if '<html' in raw[:2000].lower() or '<!doctype' in raw[:200].lower():
                raw = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', raw, flags=re.S | re.I)
                raw = re.sub(r'<[^>]+>', ' ', raw)
            corpus.append(norm(raw))
big = '\n'.join(corpus)
big_nomd = re.sub(r'[*_`]', '', big)
quotes = re.findall(r'"([^"]{30,}?)"', survey.replace('“', '"').replace('”', '"'))
missing = 0
for q in quotes:
    nq = norm(q)
    if nq in big or re.sub(r'[*_`]', '', nq) in big_nomd:
        continue
    missing += 1
    print('NOT FOUND:', nq[:160])
print(f'checked {len(quotes)} quoted passages, {missing} not found')
