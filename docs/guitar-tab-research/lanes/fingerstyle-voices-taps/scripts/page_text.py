#!/usr/bin/env python3
"""Usage: page_text.py URL OUTFILE
Fetches a page with urllib (through the box's proxy) and writes its visible text (script/style dropped,
block elements on new lines) to OUTFILE, with the URL and fetch time (UTC) on the first line."""
import sys, urllib.request, datetime, html.parser, re
url, out = sys.argv[1], sys.argv[2]
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research script)"})
raw = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
class P(html.parser.HTMLParser):
    def __init__(s): super().__init__(); s.out=[]; s.skip=0
    def handle_starttag(s, t, a):
        if t in ("script","style","noscript"): s.skip+=1
        if t in ("p","div","br","li","tr","h1","h2","h3","h4","h5","pre","dt","dd","table","section"): s.out.append("\n")
    def handle_endtag(s, t):
        if t in ("script","style","noscript"): s.skip=max(0,s.skip-1)
    def handle_data(s, d):
        if not s.skip: s.out.append(d)
p = P(); p.feed(raw)
txt = re.sub(r"\n\s*\n+", "\n", "".join(p.out))
with open(out, "w") as f:
    f.write(f"URL: {url}\nFETCHED: {datetime.datetime.utcnow().isoformat()}Z\n\n{txt}")
print(out, len(txt))
