"""usage: python3 -I qfind.py <source file> <quote> [<quote> ...]  -- whitespace-normalised search; '...' in a quote
splits it into parts that must appear in order."""
import re, sys
norm = lambda s: re.sub(r"\s+", " ", s.replace(" ", " ")).strip()
T = norm(open(sys.argv[1], encoding="utf-8", errors="replace").read())
for q in sys.argv[2:]:
    parts = [norm(p) for p in re.split(r"\s*(?:\.\.\.|…)\s*", q) if norm(p)]
    pos, ok = 0, True
    for p in parts:
        i = T.find(p, pos)
        if i < 0:
            ok = False; break
        pos = i + len(p)
    print(("FOUND   " if ok else "MISSING ") + q[:110] + ("" if ok else f"   [first missing part: {p[:80]!r}]"))
