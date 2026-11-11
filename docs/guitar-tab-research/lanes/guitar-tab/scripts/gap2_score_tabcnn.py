"""gap round 2: score TabCNN runs with gtr-eval, the same three subcommands and options as this lane's SynthTab runs:
  tab        --est <clip>.<cfg>.gtreval.json            (tuning and capo stated in the file: standard, capo 0)
  notes      --est <clip>.<cfg>.gtreval.json
  tab-frames --est <clip>.<cfg>.frames.csv --frame-format matrix --est-capo 0 --est-tuning 40,45,50,55,59,64
Writes one TSV row per clip and configuration (eval ids from gtr-eval's stderr line).
usage: python gap2_score_tabcnn.py <out.tsv> <dir> <config> [<config> ...] -- <clips...>"""
import json, os, re, subprocess, sys
out, d = sys.argv[1], sys.argv[2]
i = sys.argv.index("--"); cfgs, clips = sys.argv[3:i], sys.argv[i + 1:]
env = dict(os.environ, GTR_AGENT="gapfill-guitar-tab")
def ev(args):
    p = subprocess.run(["gtr-eval"] + args, capture_output=True, text=True, env=env)
    m = re.search(r"\[gtr-eval (e\d+)\]", p.stderr)
    return (m.group(1) if m else None), json.loads(p.stdout)
rows = []
for cfg in cfgs:
    for c in clips:
        js, fr = f"{d}/{c}.{cfg}.gtreval.json", f"{d}/{c}.{cfg}.frames.csv"
        et, t = ev(["tab", "--truth", c, "--est", js])
        en, n = ev(["notes", "--truth", c, "--est", js])
        ef, f = ev(["tab-frames", "--truth", c, "--est", fr, "--frame-format", "matrix", "--est-capo", "0",
                    "--est-tuning", "40,45,50,55,59,64"])
        tm, tc, nm = t["metrics"], t["counts"], n["metrics"]
        sdc = ", ".join(f"{k}: {v}" for k, v in sorted(tm["string_difference_counts"].items(), key=lambda kv: int(kv[0])))
        row = [cfg, c, et, tc["n_truth"], tc["n_est"], tc["n_matched"],
               f'{tm["same_string_and_fret_fraction_of_matched"]:.4f}', f'{tm["same_string_and_absolute_fret_fraction_of_matched"]:.4f}',
               f'{tm["same_string_and_fret_fraction_of_truth"]:.4f}', sdc,
               en, f'{nm["onset_only"]["f1"]:.4f}', f'{nm["onset_only"]["precision"]:.4f}', f'{nm["onset_only"]["recall"]:.4f}',
               ef, f'{f["metrics"]["tab_f1"]:.4f}', f'{f["metrics"]["pitch_f1"]:.4f}']
        rows.append(row); print("\t".join(map(str, row)), flush=True)
hdr = ["config", "clip", "tab_eval", "truth", "est", "matched", "same_string_fret/matched", "same_string_abs_fret/matched",
       "same_string_fret/truth", "string_diff_counts", "notes_eval", "onset_F1", "P", "R", "frames_eval", "tab_F1", "pitch_F1"]
with open(out, "w") as fh:
    fh.write("\t".join(hdr) + "\n" + "".join("\t".join(map(str, r)) + "\n" for r in rows))
