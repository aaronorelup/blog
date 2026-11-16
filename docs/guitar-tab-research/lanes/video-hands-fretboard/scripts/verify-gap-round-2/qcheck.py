"""qcheck.py SOURCE QUOTES : check each quote in QUOTES (separated by lines that are exactly '---') against
SOURCE (a text, markdown, HTML or pdftotext file). EXACT = found after collapsing whitespace runs to one space
(HTML: also after removing tags and unescaping entities); else NO, with the best-matching source window.
Nothing else is folded (curly quotes, dashes, no-break spaces and ligatures count as different)."""
import html, re, sys

def ws(s):
    return re.sub(r'\s+', ' ', s).strip()

src = open(sys.argv[1], encoding='utf-8', errors='replace').read()
variants = [ws(src)]
if '<' in src and '>' in src:
    t = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', src, flags=re.S | re.I)
    variants.append(ws(html.unescape(re.sub(r'<[^>]+>', ' ', t))))
    variants.append(ws(html.unescape(re.sub(r'<[^>]+>', '', t))))
quotes = [q.strip('\n') for q in open(sys.argv[2], encoding='utf-8').read().split('\n---\n') if q.strip()]
for q in quotes:
    qq = ws(q)
    ok = any(qq in v for v in variants)
    if ok:
        print('EXACT |', qq[:110])
    else:
        words = qq.split()
        best = (0, '')
        v = variants[-1] if len(variants) > 1 else variants[0]
        for k in range(0, max(1, len(words) - 4)):
            frag = ' '.join(words[k:k + 5])
            i = v.find(frag)
            if i >= 0:
                best = (k, v[max(0, i - 60): i + len(qq) + 60]); break
        print('NO    |', qq[:110]); print('      source near:', best[1][:400])
