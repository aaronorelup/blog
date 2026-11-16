#!/bin/bash
# Score everything TGConvert wrote for one input with gtr-eval. Usage: tg_eval_all.sh <tag> <truth clip id>
# Prints one line per file: file, eval id, matched/truth, same string+fret/matched, tuning/capo flags.
source /home/user/gtr/env.sh
export GTR_AGENT=try-web-tab-render
O=/home/user/gtr/lanes/web-tab-render/out/tuxguitar
S=/home/user/blog/docs/guitar-tab-research/lanes/web-tab-render/scripts
tag=$1; clip=$2
# the model dump as gtr-eval JSON (string numbers in TuxGuitar: 1 = highest string; tuning from TGString values)
python3 -I - "$O/$tag.tuxguitar.json" "$O/$tag.tuxguitar.est.json" <<'EOF'
import json, sys
d = json.load(open(sys.argv[1]))
t = d['tracks'][0]
strings = sorted(t['strings'])            # [number, open midi], number 1 = highest
tuning = [v for n, v in sorted(strings, key=lambda x: -x[0])]   # low to high
json.dump({'tuning_midi': tuning, 'capo': t['offset_capo'], 'notes': t['notes']}, open(sys.argv[2], 'w'))
print('model', len(t['notes']), 'notes, tuning', tuning, 'capo(offset)', t['offset_capo'])
EOF
summ() {
  python3 -c '
import sys, json
l = sys.stdin.read(); i = l.find("{")
if i < 0: print(l.strip()[:300]); sys.exit()
eid = l[:i].strip()
d = json.loads(l[i:])
if "metrics" not in d: print(eid, l[i:i+300]); sys.exit()
m = d["metrics"]; c = d["counts"]
if "same_string_and_fret_fraction_of_matched" in m:
    tc = m.get("tuning_and_capo", {})
    print(eid, "matched", c["n_matched"], "/", c["n_truth"], "est", c["n_est"], "| same s+f", m["same_string_and_fret_fraction_of_matched"], "| strdiff", m["string_difference_counts"], "| est tuning/capo", (tc.get("est") or {}).get("tuning_midi"), (tc.get("est") or {}).get("capo"), (tc.get("est") or {}).get("capo_source", "")[:40], "| ignore_time", d.get("ignore_time_used"))
else:
    print(eid, "onset F1", m["onset_only"]["f1"], "P", m["onset_only"]["precision"], "R", m["onset_only"]["recall"], "n_est", c["n_est"])
'
}
for f in $tag.tuxguitar.est.json $tag.tg.gp5 $tag.tg.gp4 $tag.tg.gp3 $tag.tg.musicxml $tag.tg.ascii.txt; do
  echo -n "$f: "; python3 $S/evalsum.py tab --truth $clip --est $O/$f 2>&1 | grep -v "DISK LOW" | summ
done
echo -n "$tag.tg.mid (notes): "; python3 $S/evalsum.py notes --truth $clip --est $O/$tag.tg.mid 2>&1 | grep -v "DISK LOW" | summ
