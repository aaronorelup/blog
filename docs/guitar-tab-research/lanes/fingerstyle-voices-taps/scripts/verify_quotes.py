#!/usr/bin/env python3
"""verify-docs-fingerstyle-voices-taps: check that every quoted string in survey.md occurs in a re-fetched source.

Usage: python3 -I verify_quotes.py <survey.md> <raw_dir> [<raw_dir> ...] > report.tsv

Each <raw_dir> holds <key>.body files and a fetch_log.tsv written by verify_fetch.sh. Bodies are turned into text
(HTML -> text with BeautifulSoup, PDF -> pdftotext, JSON and XML kept with entities unescaped) and every quote in the
survey ("..." on one or more lines) is looked up in all of them. Levels of match, strictest first:
  EXACT     the quote, whitespace collapsed, is a substring of the source text (whitespace collapsed)
  TYPO      same after folding curly quotes, dashes, non-breaking spaces and the ellipsis character
  MARKDOWN  same after also rendering Markdown in the source ([text](url) -> [text] and text, ** and ` removed)
  DEHYPH    same after also joining words hyphenated across PDF line ends
  PARTS     the quote holds [...] or " ... " elisions, and every part matches at one of the levels above
  MISSING   none of the above
The report lists the matching source keys, so a quote that matched only a different source than the one the survey
cites can be spotted by eye. Downloaded files are only read, never executed.
"""
import html, json, os, re, subprocess, sys

def body_to_text(path, ctype):
    raw = open(path, 'rb').read()
    if 'pdf' in ctype or raw[:4] == b'%PDF':
        txt = path[:-5] + '.pdftxt'
        if not os.path.exists(txt):
            subprocess.run(['pdftotext', path, txt], check=False)
        return open(txt, encoding='utf-8', errors='replace').read() if os.path.exists(txt) else ''
    s = raw.decode('utf-8', errors='replace')
    if 'html' in ctype:
        from bs4 import BeautifulSoup
        return BeautifulSoup(s, 'html.parser').get_text(' ')
    if 'json' in ctype:
        try:
            obj = json.loads(s)
        except Exception:
            return s
        parts = []
        def walk(o):
            if isinstance(o, dict):
                for k, v in o.items():
                    parts.append(str(k)); walk(v)
            elif isinstance(o, list):
                for v in o: walk(v)
            else:
                v = str(o)
                parts.append(v)
                if '<' in v and '>' in v:
                    from bs4 import BeautifulSoup
                    parts.append(BeautifulSoup(v, 'html.parser').get_text(' '))
        walk(obj)
        return '\n'.join(parts)
    if 'xml' in ctype:
        return html.unescape(re.sub(r'<[^>]+>', ' ', s)) + '\n' + s
    return s

WS = re.compile(r'\s+')
def ws(s): return WS.sub(' ', s).strip()
def typo(s):
    for a, b in (('‘', "'"), ('’', "'"), ('“', '"'), ('”', '"'), ('–', '-'), ('—', '-'),
                 ('−', '-'), (' ', ' '), ('…', '...'), (' ', ' '), (' ', ' '),
                 ('ﬁ', 'fi'), ('ﬂ', 'fl'), ('ﬀ', 'ff'), ('ﬃ', 'ffi'), ('ﬄ', 'ffl'),
                 ('­', '')):
        s = s.replace(a, b)
    s = ws(html.unescape(s))
    # HTML-to-text leaves a space where an inline tag ended ("GPLv3 , for"); drop space before , . ; : ) ] and after ( [
    s = re.sub(r' ([,.;:)\]])', r'\1', s)
    return re.sub(r'([(\[]) ', r'\1', s)
def md(s):
    s = re.sub(r'!?\[([^\]]*)\]\([^)]*\)', r'[\1]', s)
    s2 = re.sub(r'\[([^\]]*)\]', r'\1', s)
    out = []
    for t in (s, s2):
        t = t.replace('**', '').replace('`', '').replace('\\_', '_').replace('\\*', '*')
        out.append(typo(t))
    return out
def dehyph(s): return re.sub(r'(\w)- (\w)', r'\1\2', s)

def load_sources(dirs):
    src = {}
    for d in dirs:
        log = os.path.join(d, 'fetch_log.tsv')
        if not os.path.exists(log):
            continue
        for line in open(log, encoding='utf-8'):
            f = line.rstrip('\n').split('\t')
            if len(f) < 5 or f[2] != '200':
                continue
            key, ctype = f[0], f[4]
            p = os.path.join(d, key + '.body')
            if os.path.exists(p):
                t = body_to_text(p, ctype)
                e = ws(t); ty = typo(t); m = md(t); dh = dehyph(ty)
                src[key] = (e, ty, m, dh)
    return src

def match_one(q, src):
    qe, qt = ws(q), typo(q)
    qm = md(q)[0]
    for level, fn in (('EXACT', lambda v: qe in v[0]), ('TYPO', lambda v: qt in v[1]),
                      ('MARKDOWN', lambda v: any(qm in x or qt in x for x in v[2])),
                      ('DEHYPH', lambda v: qt in v[3] or dehyph(qt) in v[3])):
        keys = [k for k, v in src.items() if fn(v)]
        if keys:
            return level, keys
    return 'MISSING', []

def extract_quotes(text):
    out = []
    lines = text.split('\n')
    section = ''
    buf = []
    def flush():
        joined = ' '.join(l.strip() for l in buf)
        for m in re.finditer(r'"([^"]*)"', joined):
            if len(m.group(1)) >= 4:
                out.append((section, m.group(1)))
    for l in lines:
        if l.startswith('#'):
            flush(); buf = []; section = l.strip('# ').strip()
        else:
            buf.append(l)
    flush()
    return out

def main():
    survey, dirs = sys.argv[1], sys.argv[2:]
    src = load_sources(dirs)
    quotes = extract_quotes(open(survey, encoding='utf-8').read())
    print('section\tlevel\tsources\tquote')
    for section, q in quotes:
        level, keys = match_one(q, src)
        if level == 'MISSING':
            parts = [p for p in re.split(r'\[\.\.\.\]|\[e-mail address in the file\]| \.\.\. |\.\.\. ', q) if len(p.strip()) > 3]
            if len(parts) >= 1 and parts != [q]:
                res = [match_one(p, src) for p in parts]
                if all(r[0] != 'MISSING' for r in res):
                    level, keys = 'PARTS', sorted({k for r in res for k in r[1]})
        print(f"{section[:40]}\t{level}\t{','.join(keys[:6])}\t{q}")

if __name__ == '__main__':
    main()
