"""Copy the lane's master scores file (/home/user/gtr/lanes/chords-beats-key/out/scores/scores.jsonl, over 300 KB)
into one file per tool under samples/scores/ (each under 300 KB), keeping only the newest line per
(tool, variant, clip, subcommand)."""
import json
import os

SC = "/home/user/gtr/lanes/chords-beats-key/out/scores/scores.jsonl"
OUT = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples/scores"
rows = {}
for line in open(SC):
    r = json.loads(line)
    rows[(r["tool"], r["variant"], r["clip"], r["subcommand"])] = r
by_tool = {}
for k, r in rows.items():
    by_tool.setdefault(r["tool"], []).append(r)
os.makedirs(OUT, exist_ok=True)
for t, rs in by_tool.items():
    with open(os.path.join(OUT, "scores_%s.jsonl" % t), "w") as f:
        for r in sorted(rs, key=lambda r: (r["variant"], r["clip"], r["subcommand"])):
            f.write(json.dumps(r) + "\n")
    print(t, len(rs))
