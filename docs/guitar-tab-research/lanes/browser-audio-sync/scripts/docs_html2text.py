#!/usr/bin/env python3
"""docs-browser-audio-sync: HTML file to plain text (one block element per line) for grepping quotes.
Usage: python3 -I docs_html2text.py IN.html > OUT.txt"""
import html.parser, re, sys

BLOCK = {"p", "div", "li", "dt", "dd", "h1", "h2", "h3", "h4", "h5", "h6", "tr", "pre", "section", "br", "table", "td", "th", "blockquote", "dl", "ul", "ol", "header", "footer", "article", "nav"}

class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip += 1
        elif tag in BLOCK:
            self.out.append("\n")
    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip = max(0, self.skip - 1)
        elif tag in BLOCK:
            self.out.append("\n")
    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)

p = P()
p.feed(open(sys.argv[1], encoding="utf-8", errors="replace").read())
text = "".join(p.out)
text = re.sub(r"[ \t\r\f\v]+", " ", text)
text = re.sub(r"\n\s*\n+", "\n", text)
print(text)
