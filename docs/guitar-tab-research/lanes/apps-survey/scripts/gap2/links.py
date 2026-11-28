"""links.py <saved.html> [regex] : print the links of a saved page whose href or text matches the regex
(default: terms, legal, EULA, licen, conditions, privacy). stdlib only; the page is only parsed as text."""
import sys, re, html.parser
pat = re.compile(sys.argv[2] if len(sys.argv) > 2 else r'term|legal|eula|licen|condition|agreement|tos\b|cgv|mentions', re.I)
class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.cur=None; self.txt=[]; self.out=[]
    def handle_starttag(self, t, a):
        if t == 'a':
            self.cur = dict(a).get('href') or ''; self.txt = []
    def handle_data(self, d):
        if self.cur is not None: self.txt.append(d)
    def handle_endtag(self, t):
        if t == 'a' and self.cur is not None:
            text = ' '.join(''.join(self.txt).split())
            if pat.search(self.cur) or pat.search(text): self.out.append((self.cur, text))
            self.cur = None
p = P(); p.feed(open(sys.argv[1], 'rb').read().decode('utf-8', 'replace'))
seen = set()
for h, t in p.out:
    if (h, t) not in seen:
        seen.add((h, t)); print(f'{h}\t{t}')
