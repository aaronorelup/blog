#!/usr/bin/env python3
"""make_tools.py <blind_dir>: writes the writer's tools into <blind_dir>/tools/ (small scripts that call the loop's
code with this run's inputs) and TOOLS-BAR.md. Every tool runs from a unit's pack folder (the current folder),
prints short text and writes pictures there that the writer can Read. No tool is offered that the run's rung leaves
out (with the hand off: no overlay, no frames)."""
import json, os, stat, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import LOOP, PYT, PYVID, rj


def write(path, text):
    open(path, "w").write(text)
    os.chmod(path, os.stat(path).st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def make(blind):
    cfg = rj(os.path.join(blind, "inputs", "config.json"))
    T = os.path.join(blind, "tools"); os.makedirs(T, exist_ok=True)
    hand = cfg.get("hand") != "off"
    head = f"""#!/bin/bash
# run from your unit's folder
set -euo pipefail
B={blind}; P=$(pwd)
[ -f "$P/unit.json" ] || {{ echo "run this from your unit's folder (it has unit.json)"; exit 2; }}
U=$(python3 -c "import json;print(json.load(open('$P/unit.json'))['i'])")
read C0 C1 T0 T1 <<< $(python3 -c "import json;u=json.load(open('$P/unit.json'));print(u['context'][0],u['context'][1],u['t0'],u['t1'])")
export PYTHONDONTWRITEBYTECODE=1 MPLBACKEND=Agg
"""
    write(os.path.join(T, "render.sh"), head + f"""# render.sh [bar.json] : your tab rendered with FluidSynth (program {cfg['render_program']}) beside the recording.
# Writes render/mix.wav (left = recording, right = render), render/residual.png (RED = in the recording, not in your
# tab; BLUE = in your tab, not in the recording) and render/check.txt (per note: is its fundamental heard after the
# onset; energy the tab does not explain). Read residual.png after running it.
BAR=${{1:-$P/bar.json}}
{PYT} {LOOP}/draw.py residual $B/inputs/audio.wav "$BAR" "$P/render" --from $C0 --to $C1 --unit $T0,$T1 \\
  --program {cfg['render_program']} --context $B/tab.json 2>&1 | grep -v Warning
echo "picture: $P/render/residual.png"
""")
    write(os.path.join(T, "spec.sh"), head + f"""# spec.sh FROM TO [out.png] [notes.json] : the constant-Q picture of any stretch (12 s at most) with the candidates
# and the finished notes drawn (or the notes of notes.json, e.g. your bar.json, as green boxes with string:fret).
[ $# -ge 2 ] || {{ sed -n '9,10p' "$0"; exit 2; }}
OUT=${{3:-$P/spec_$1-$2.png}}; NOTES=${{4:-$B/tab.json}}
{PYT} {LOOP}/draw.py spec $B/inputs/audio.wav "$OUT" --from $1 --to $2 --cands $B/inputs/candidates.csv \\
  --notes "$NOTES" --beats $B/inputs/beats.txt 2>&1 | grep -v Warning
""")
    write(os.path.join(T, "solve.sh"), head + f"""# solve.sh [--keep "ids"] [--drop "ids"] [--pin ID=S:F]... [--add ONSET:PITCH]... : the solver on this unit
# (the base candidates, plus --keep, minus --drop, plus --add) with places pinned; prints each note's choice and
# next-best places with their extra cost. Frets from the capo.
python3 {LOOP}/solve.py $B $U "$@" --json "$P/solve_out.json"
""")
    write(os.path.join(T, "check.sh"), head + f"""# check.sh : checks bar.json, lessons.json and revisit.json in this folder exactly as the driver will. Run it last.
python3 {LOOP}/validate.py "$P"
""")
    if hand:
        write(os.path.join(T, "overlay.sh"), head + f"""# overlay.sh T1,T2,... [out.jpg] [--plain|--zoom] : the neck at up to 8 times, cropped to the fretboard: fret
# numbers FROM THE CAPO (gold), the hand window (green band), fingertips (red, with their fret). --plain: the same
# frames without drawing (to see the fingers); --zoom: a tighter crop around the fingertips. Prints the window and the
# fingertips' frets at each time.
[ $# -ge 1 ] || {{ sed -n '9,12p' "$0"; exit 2; }}
TS=$1; shift; OUT="$P/overlay_$(echo $TS | tr ',' '_' | cut -c1-40).jpg"
if [ $# -ge 1 ] && [[ "$1" != --* ]]; then OUT=$1; shift; fi
{PYVID} {LOOP}/neckpic.py $B "$OUT" --times "$TS" "$@"
""")
    tools = [("render.sh [bar.json]", "render your tab beside the recording; residual.png + check.txt (run it before you finish)"),
             ("spec.sh FROM TO [out.png] [notes.json]", "spectrogram of any stretch, candidates and finished notes drawn"),
             ("solve.sh [--keep ids] [--drop ids] [--pin ID=S:F] [--add ONSET:PITCH]", "the solver on this unit with your changes")]
    if hand:
        tools.append(("overlay.sh T1,T2,... [out.jpg] [--plain|--zoom]", "the neck at any times (window, frets from the capo, fingertips)"))
    tools.append(("check.sh", "check your three files as the driver will (run it last)"))
    md = ["# The writer's tools (TOOLS-BAR.md)", "",
          f"Run each from your unit's folder as `{T}/<tool>`. Each prints a few lines and writes pictures into your "
          "folder; Read the pictures.", ""]
    md += [f"- `{a}`: {b}" for a, b in tools]
    md += ["", "Inputs you may read: " + os.path.join(blind, "inputs") + "/ (audio.wav, " +
           ("video.mp4, " if hand else "") + "candidates.csv, beats.txt, units.json, config.json"
           + (", hand/" if hand else "") + "). You may also run python3 or the ffmpeg command on them in your folder.",
           "The render cannot be heard by you: judge it by residual.png and check.txt. The render is a General MIDI "
           "guitar, so its overtones and body differ from the recording: a steady red or blue band across the whole "
           "stretch (often low, under the bass, or at the bass's overtones) is timbre, not a note. Trust red that starts "
           "with an onset (check.txt's 'unexplained' list) and blue where a tab note's fundamental has no stroke "
           "('weak' in check.txt). A wrong string at the right pitch sounds the same: places are judged on the neck "
           "pictures."]
    open(os.path.join(T, "TOOLS-BAR.md"), "w").write("\n".join(md) + "\n")
    return T


if __name__ == "__main__":
    print(make(os.path.abspath(sys.argv[1])))
