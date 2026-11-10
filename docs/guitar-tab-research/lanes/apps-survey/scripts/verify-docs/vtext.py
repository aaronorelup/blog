"""vtext.py <raw-dir>: verify-docs-apps-survey. For every <slug>.body saved by vfetch.sh, write <slug>.txt with the
page's visible text (stdlib HTML parser; script, style, noscript and svg dropped; line breaks at block tags).
A body that is not HTML (plain text, Markdown) is copied as it is. Pages are untrusted data and only read as text."""
import sys, os, re, glob, html.parser

BLOCK = {"p", "div", "br", "li", "h1", "h2", "h3", "h4", "h5", "h6", "tr", "section", "article", "header", "footer",
         "td", "th", "dt", "dd", "ul", "ol", "table", "blockquote", "pre", "main", "nav", "aside", "summary", "details"}


class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0

    def handle_starttag(self, t, a):
        if t in ("script", "style", "noscript", "svg", "template"):
            self.skip += 1
        if t in BLOCK:
            self.out.append("\n")

    def handle_endtag(self, t):
        if t in ("script", "style", "noscript", "svg", "template") and self.skip:
            self.skip -= 1
        if t in BLOCK:
            self.out.append("\n")

    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)


def to_text(raw):
    head = raw[:2000].lower()
    if "<html" not in head and "<!doctype html" not in head and "<body" not in head:
        return raw
    p = P()
    p.feed(raw)
    txt = "".join(p.out)
    txt = re.sub(r"[ \t\r\f\v ]+", " ", txt)
    txt = "\n".join(l.strip() for l in txt.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", txt).strip()


for f in glob.glob(os.path.join(sys.argv[1], "*.body")):
    raw = open(f, "rb").read().decode("utf-8", "replace")
    open(f[:-5] + ".txt", "w", encoding="utf-8").write(to_text(raw))
print("done")
