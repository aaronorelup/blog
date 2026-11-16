#!/usr/bin/env python3
"""verify-docs-browser-audio-sync: print MDN browser-compat-data support statements for the features the survey cites.
Usage: python3 -I verify_bcd.py OUTDIR feature.path [feature.path ...]
Fetches https://raw.githubusercontent.com/mdn/browser-compat-data/main/<area>/<Name>.json (saved to OUTDIR) and
prints, per browser, every support statement: version_added, version_removed, prefix, partial_implementation, flags,
notes; plus status.experimental."""
import json, os, subprocess, sys
out = sys.argv[1]
for path in sys.argv[2:]:
    parts = path.split(".")
    n = 3 if parts[0] in ("javascript", "http") else 2
    fn = os.path.join(out, "_".join(parts[:n]) + ".json")
    if not os.path.exists(fn):
        url = "https://raw.githubusercontent.com/mdn/browser-compat-data/main/" + "/".join(parts[:n]) + ".json"
        subprocess.run(["curl", "-sS", "-L", "-o", fn, url], check=False)
    node = json.load(open(fn))
    for p in parts:
        node = node.get(p, {})
    c = node.get("__compat", {})
    print(f"== {path}  experimental={c.get('status', {}).get('experimental')}")
    for b in ["chrome", "edge", "firefox", "safari", "chrome_android", "safari_ios"]:
        s = c.get("support", {}).get(b)
        if s is None: continue
        if isinstance(s, str):
            print(f"   {b}: {s}"); continue
        for st in (s if isinstance(s, list) else [s]):
            extra = {k: v for k, v in st.items() if k != "version_added"}
            print(f"   {b}: {st.get('version_added')} {json.dumps(extra) if extra else ''}"[:400])
