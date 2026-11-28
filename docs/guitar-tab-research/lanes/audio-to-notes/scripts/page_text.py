"""Fetch a web page with urllib, strip HTML to plain text, save to
/home/user/gtr/lanes/audio-to-notes/fetched/web/<name>.txt and print the HTTP status and size.
Usage: python3 -I page_text.py <name> <url> [<name> <url> ...]. Used by the docs-audio-to-notes agent."""
import html
import os
import re
import sys
import urllib.error
import urllib.request

OUT = "/home/user/gtr/lanes/audio-to-notes/fetched/web"
os.makedirs(OUT, exist_ok=True)
args = sys.argv[1:]
for name, url in zip(args[::2], args[1::2]):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research fetch)"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            code, raw = r.status, r.read()
    except urllib.error.HTTPError as e:
        code, raw = e.code, b""
    except Exception as e:  # noqa: BLE001
        code, raw = str(e), b""
    t = raw.decode("utf-8", errors="replace")
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<(br|p|div|li|h[1-6]|tr|pre|dt|dd)[^>]*>", "\n", t, flags=re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = re.sub(r"[ \t\r\f\v]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n", t)
    open(f"{OUT}/{name}.txt", "w").write(t)
    print(f"{code} {len(t)} chars {name} {url}")
