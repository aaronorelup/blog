"""verify-gapfill-chords-beats-key, round 2: the verifier's corrections to tools.json (pyace and mixedkey entries only).

Written in the gap round's format: json.dumps(indent=0, ensure_ascii=False), no trailing newline, so that the other
entries stay byte-identical. Run: python3 -I fix_tools_json.py
"""
import json

TJ = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/tools.json"
d = json.load(open(TJ, encoding="utf-8"))
before = {t["name"]: json.dumps(t, ensure_ascii=False) for t in d["tools"]}
for t in d["tools"]:
    if t["name"] == "pyace":
        add = (" The PyPI sdist's own pyace/pyace.py is older than the GitHub HEAD's: it still has `import cPickle` and"
               " Python 2 print statements (e.g. `print st, et, ochord`), and Python 3.13.18's ast.parse rejects it"
               " (\"Missing parentheses in call to 'print'\", line 89); HEAD 4321145's pyace.py parses (verifier,"
               " 2026-11-12).")
        if add not in t["not_run_reason"]:
            t["not_run_reason"] += add
        t["unverified"] = [
            u.replace("the README's script route (python pyace.py from inside the source folder, with Keras installed)",
                      "the README's script route (python pyace.py from inside a clone of the GitHub source at HEAD"
                      " 4321145, with Keras installed; the PyPI sdist's pyace.py does not parse under Python 3)")
            for u in t["unverified"]]
    elif t["name"] == "mixedkey (Go)":
        t["unverified"] = [
            ("the lane's glue main.go was never built against mixedkey itself; it passes go vet against a stub that holds"
             " only the declarations it uses, copied from v0.1.0's detect.go and profiles.go (verifier, 2026-11-12,"
             " scripts/verify/gap2/typecheck_mixedkey_glue.sh)")
            if u == "the lane's glue main.go was never compiled" else u
            for u in t["unverified"]]
open(TJ, "w", encoding="utf-8").write(json.dumps(d, indent=0, ensure_ascii=False))
after = {t["name"]: json.dumps(t, ensure_ascii=False) for t in d["tools"]}
print("changed entries:", [n for n in after if after[n] != before[n]])
