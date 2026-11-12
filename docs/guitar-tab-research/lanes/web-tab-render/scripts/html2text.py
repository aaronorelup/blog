"""Crude HTML to text, for reading saved documentation pages (untrusted data, read only).

Usage: python3 -I html2text.py <file.html> [start-marker] [n-chars]
Strips scripts, styles and tags, unescapes entities, collapses spaces, prints from the first occurrence of
start-marker (if given) for n-chars characters (default 4000).
"""
import html
import re
import sys

t = open(sys.argv[1], encoding="utf-8", errors="replace").read()
t = re.sub(r"<script.*?</script>", "", t, flags=re.S | re.I)
t = re.sub(r"<style.*?</style>", "", t, flags=re.S | re.I)
t = re.sub(r"<br\s*/?>|</p>|</li>|</h\d>|</tr>|</div>", "\n", t, flags=re.I)
t = re.sub(r"<[^>]+>", " ", t)
t = html.unescape(t)
t = re.sub(r"[ \t\r\f\v]+", " ", t)
lines = [ln.strip() for ln in t.splitlines() if ln.strip()]
s = "\n".join(lines)
start = 0
if len(sys.argv) > 2 and sys.argv[2]:
    i = s.find(sys.argv[2])
    start = i if i >= 0 else 0
n = int(sys.argv[3]) if len(sys.argv) > 3 else 4000
print(s[start : start + n])
