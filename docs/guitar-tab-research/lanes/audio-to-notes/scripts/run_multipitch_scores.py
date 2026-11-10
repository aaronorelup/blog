"""Run score_multipitch.py (mir_eval.multipitch, 10 ms grid) over several tools' outputs and write one JSON.
usage: python3 run_multipitch_scores.py <out.json>   (paths below; missing files are skipped)"""
import json, os, subprocess, sys
L = "/home/user/gtr/lanes/audio-to-notes/out"
PY = "/home/user/gtr/eval/venv/bin/python"
SC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_multipitch.py")
CL = [("S2n", "S2n", None), ("S2s", "S2s", None), ("S3", "S3", None), ("S4guitar", "S4", "chord"), ("R1a", "R1a", None), ("R1c", "R1c", None)]
TOOLS = {
    "basic-pitch (notes -> frames)": f"{L}/basic-pitch/tflite-default/{{c}}.notes.csv",
    "transkun (notes -> frames)": f"{L}/transkun/{{c}}.mid",
    "bytedance (notes -> frames)": f"{L}/bytedance/{{c}}.mid",
    "essentia MultiPitchKlapuri": f"{L}/essentia-klapuri/f0/{{c}}.multif0.json",
    "essentia MultiPitchMelodia": f"{L}/essentia-multimelodia/f0/{{c}}.multif0.json",
}
res = {}
for tool, pat in TOOLS.items():
    for c, truth, voice in CL:
        f = pat.format(c=c)
        if not os.path.exists(f):
            continue
        args = [PY, "-I", SC, truth, f] + (["--voice", voice] if voice else [])
        p = subprocess.run(args, capture_output=True, text=True)
        try:
            d = json.loads(p.stdout)
        except Exception:
            d = {"error": (p.stdout + p.stderr)[-300:]}
        res.setdefault(tool, {})[c] = d
        sc = d.get("scores", {})
        print(tool, c, {k: round(sc[k], 3) for k in ("Precision", "Recall", "Accuracy", "Chroma Accuracy") if k in sc} or d.get("error"))
json.dump(res, open(sys.argv[1], "w"), indent=1)
