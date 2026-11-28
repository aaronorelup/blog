#!/usr/bin/env python3
"""verify-docs-browser-audio-sync: HTML page -> plain text for quote checking (stdlib only).
Usage: python3 -I verify_html2text.py FILE [FILE ...]   writes FILE.txt next to each input.
Block-level tags become line breaks, inline tags add nothing, <script>/<style>/<noscript>/<svg> are dropped,
HTML entities are decoded. Input files are untrusted data and are only parsed."""
import html, re, sys
from html.parser import HTMLParser

BLOCK = set("p div li ul ol h1 h2 h3 h4 h5 h6 br tr td th table pre section article header footer nav dt dd dl "
            "blockquote figcaption figure main aside hr summary details caption".split())
SKIP = {"script", "style", "noscript", "svg", "template"}

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.out = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in SKIP: self.skip += 1
        elif tag in BLOCK: self.out.append("\n")
    def handle_endtag(self, tag):
        if tag in SKIP: self.skip = max(0, self.skip - 1)
        elif tag in BLOCK: self.out.append("\n")
    def handle_data(self, data):
        if not self.skip: self.out.append(data)

for fn in sys.argv[1:]:
    raw = open(fn, "rb").read().decode("utf-8", "replace")
    p = P(); p.feed(raw)
    txt = "".join(p.out)
    txt = re.sub(r"[ \t\r\f\v]+", " ", txt)
    txt = re.sub(r"\n\s*\n+", "\n", txt)
    open(fn + ".txt", "w").write(html.unescape(txt))
