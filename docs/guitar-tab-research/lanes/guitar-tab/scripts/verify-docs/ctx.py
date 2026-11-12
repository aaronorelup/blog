#!/usr/bin/env python3
"""Print text context around a search term in a saved source (HTML stripped, whitespace collapsed)."""
import sys, re, html
sys.path.insert(0, '/home/user/gtr/lanes/guitar-tab/verify-scripts')
from quotecheck import to_text, norm_strict
path, term = sys.argv[1], sys.argv[2]
width = int(sys.argv[3]) if len(sys.argv) > 3 else 300
t = norm_strict(to_text(path))
for m in re.finditer(re.escape(term), t, flags=re.I):
    s = max(0, m.start() - width); e = min(len(t), m.end() + width)
    print('...' + t[s:e] + '...\n')
