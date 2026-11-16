"""verify-docs-chords-beats-key helper: print the whitespace-normalised context around a regex in a cached source.
Usage: python3 -I verify_grep.py CACHE_DIR URL REGEX [WIDTH]"""
import hashlib, html, html.parser, json, re, subprocess, sys, os
cache, url, pat = sys.argv[1:4]
width = int(sys.argv[4]) if len(sys.argv) > 4 else 200
key = hashlib.sha1(url.encode()).hexdigest()[:16]
body = os.path.join(cache, key + ".body")
if not os.path.exists(body):
    r = subprocess.run(["curl", "-sS", "-L", "--max-time", "60", "-A", "Mozilla/5.0 (research check)", "-o", body,
                        "-w", "%{http_code}", url], capture_output=True, text=True)
    json.dump({"url": url, "code": r.stdout.strip(), "err": r.stderr.strip()[:200]}, open(os.path.join(cache, key + ".meta"), "w"))
    print("fetched HTTP", r.stdout.strip())
raw = open(body, "rb").read()
if raw[:4] == b"%PDF":
    t = subprocess.run(["pdftotext", body, "-"], capture_output=True, text=True).stdout
else:
    t = raw.decode("utf-8", errors="replace")
    if "<html" in t[:3000].lower() or "<!doctype html" in t[:3000].lower():
        class P(html.parser.HTMLParser):
            def __init__(s): super().__init__(); s.o = []; s.k = 0
            def handle_starttag(s, tag, a):
                if tag in ("script", "style"): s.k += 1
                if tag in ("p", "br", "li", "div", "tr", "h1", "h2", "h3", "dt", "dd"): s.o.append("\n")
            def handle_endtag(s, tag):
                if tag in ("script", "style") and s.k: s.k -= 1
            def handle_data(s, d):
                if not s.k: s.o.append(d)
        p = P(); p.feed(t); t = html.unescape("".join(p.o))
t = re.sub(r"\s+", " ", t)
n = 0
for m in re.finditer(pat, t, flags=re.I):
    print("...", t[max(0, m.start() - width): m.end() + width], "...\n"); n += 1
    if n >= 6: break
print(f"[{n} match(es) shown; text length {len(t)}]")
