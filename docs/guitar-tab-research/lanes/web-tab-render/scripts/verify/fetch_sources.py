"""verify-docs-web-tab-render: fetch every source listed in sources.tsv (id<TAB>url) with curl, save the raw
bytes as <outdir>/<id>.raw, and a plain-text rendering as <outdir>/<id>.txt (HTML tags dropped, script/style
removed, entities decoded). Writes <outdir>/status.tsv with id, url, HTTP code, final URL, bytes.
Usage: python3 -I fetch_sources.py sources.tsv <outdir> [id ...]"""
import sys, os, subprocess, html
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor

class Text(HTMLParser):
    SKIP = {"script", "style", "noscript", "template", "svg"}
    BLOCK = {"p", "div", "br", "li", "ul", "ol", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "pre",
             "section", "article", "header", "footer", "table", "dt", "dd", "blockquote", "hr", "nav", "main"}
    def __init__(self):
        super().__init__(convert_charrefs=True); self.out = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP: self.skip += 1
        elif tag in self.BLOCK: self.out.append("\n")
    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip: self.skip -= 1
        elif tag in self.BLOCK: self.out.append("\n")
    def handle_data(self, data):
        if not self.skip: self.out.append(data)

def to_text(raw):
    s = raw.decode("utf-8", "replace")
    head = s[:2000].lower()
    if "<html" in head or "<!doctype html" in head or "<body" in head:
        p = Text(); p.feed(s); s = "".join(p.out)
    return s

def fetch(item):
    sid, url, outdir = item
    raw = os.path.join(outdir, sid + ".raw")
    cmd = ["curl", "-sS", "-L", "--max-time", "90", "-A", "Mozilla/5.0 (X11; Linux x86_64) research-verifier/1.0",
           "-o", raw, "-w", "%{http_code}\t%{url_effective}\t%{size_download}", url]
    r = subprocess.run(cmd, capture_output=True, text=True)
    status = r.stdout.strip() or ("ERR " + r.stderr.strip()[:200])
    if os.path.exists(raw):
        open(os.path.join(outdir, sid + ".txt"), "w").write(to_text(open(raw, "rb").read()))
    return f"{sid}\t{url}\t{status}"

if __name__ == "__main__":
    src, outdir = sys.argv[1], sys.argv[2]; only = set(sys.argv[3:])
    os.makedirs(outdir, exist_ok=True)
    items = []
    for line in open(src):
        if not line.strip(): continue
        sid, url = line.rstrip("\n").split("\t")[:2]
        if only and sid not in only: continue
        items.append((sid, url, outdir))
    with ThreadPoolExecutor(8) as ex:
        rows = list(ex.map(fetch, items))
    mode = "a" if only else "w"
    with open(os.path.join(outdir, "status.tsv"), mode) as f:
        for r in rows: f.write(r + "\n")
    print("\n".join(rows))
