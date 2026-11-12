# Strip tags from a saved HTML page and print the text (collapsed whitespace). Usage: python3 -I html_text.py file [maxchars]
import re, sys, html
t = open(sys.argv[1], encoding="utf-8", errors="replace").read()
t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", t, flags=re.S)
t = html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t)))
n = int(sys.argv[2]) if len(sys.argv) > 2 else 4000
print(t[:n])
