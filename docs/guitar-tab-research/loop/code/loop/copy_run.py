#!/usr/bin/env python3
"""copy_run.py <run_dir> <new_run_dir>: a full copy of a run for tests (restarts, kills): the driver side and its blind
folder (to a new G/loop/bw/<random id>/), every file a plain copy (never a link), the old paths rewritten in the text
files of both (run.json, unit.json, calls/, snapshots/, progress.json ...). Transcripts stay where they are. Never
copied: truth*.json (key cuts; score_run.py now writes them to G/loop/score/<run>/ only) and the pid and lock files."""
import os, secrets, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import G, rj, wj

src, dst = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
if os.path.exists(dst):
    sys.exit(f"{dst} exists")
R = rj(os.path.join(src, "run.json"))
ob = R["blind_dir"]; nb = os.path.join(G, "loop", "bw", secrets.token_hex(4))
# never a key copy: score_run.py keeps its key cuts in G/loop/score/<run>/; truth*.json left by older scorings are skipped
shutil.copytree(src, dst, symlinks=True, ignore=shutil.ignore_patterns("driver.lock", "driver.pid", "writer.pid",
                                                                     "truth*.json", "UNUSABLE.json"))
shutil.copytree(ob, nb)
os.remove(os.path.join(dst, "blind")); os.symlink(nb, os.path.join(dst, "blind"))
n = 0
for root in (dst, nb):
    for dp, _, fs in os.walk(root):
        for f in fs:
            p = os.path.join(dp, f)
            if os.path.islink(p) or not f.endswith((".json", ".jsonl", ".md", ".txt", ".sh", ".csv")):
                continue
            t = open(p, errors="surrogateescape").read()
            if ob in t or src in t:
                open(p, "w", errors="surrogateescape").write(t.replace(ob, nb).replace(src, dst)); n += 1
print({"run": dst, "blind": nb, "files_rewritten": n})
