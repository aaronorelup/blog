"""checkquotes2.py <quotes2.json> : gap round 2 (gapfill-apps-survey, 2026-11-11). Checks every quote added in gap
round 2 against the saved copy of the page it is attributed to (/home/user/gtr/lanes/apps-survey/gap2/raw/<file>.txt,
made by fetch2.sh). Each quote is split at "..." and every part must be on that page, in order. Matching ignores
case, whitespace, curly-vs-straight quotes and dash variants (same rules as ../verify-docs/vterms.py)."""
import json, re, sys
RAW = "/home/user/gtr/lanes/apps-survey/gap2/raw/"
def norm(s):
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), (" ", " "), ("—", "-"),
                 ("–", "-"), ("‑", "-"), ("​", "")):
        s = s.replace(a, b)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s+([.,;:!?)])", r"\1", s)
    return s.strip().lower()
items = json.load(open(sys.argv[1], encoding="utf-8"))
ok = bad = 0
for it in items:
    txt = norm(open(RAW + it["file"] + ".txt", encoding="utf-8", errors="replace").read())
    parts = [norm(p.strip(" ,;:")) for p in re.split(r"\s*\.\.\.\s*", it["quote"]) if len(p.strip()) >= 3]
    pos, found = 0, True
    for p in parts:
        i = txt.find(p, pos)
        if i < 0:
            found = False; break
        pos = i + len(p)
    print(("CONFIRMED " if found else "NOT FOUND ") + it["id"] + " " + it["url"] + " :: " + it["quote"][:70])
    ok += found; bad += (not found)
print(f"{ok} confirmed, {bad} not found")
