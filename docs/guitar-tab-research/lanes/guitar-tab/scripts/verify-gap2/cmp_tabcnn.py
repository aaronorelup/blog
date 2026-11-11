import json, sys
A = "/home/user/gtr/lanes/guitar-tab/gap2/tabcnn"; B = "/home/user/gtr/lanes/guitar-tab/verify-gap2/tabcnn"
for c in ["S2n", "R1c"]:
    for cfg in ["zenodo-amt", "onnx-gpfx", "onnx-vanilla"]:
        fa = open(f"{A}/{c}.{cfg}.frames.csv").read(); fb = open(f"{B}/{c}.{cfg}.frames.csv").read()
        ra = [l.split(",") for l in fa.strip().splitlines()[1:]]; rb = [l.split(",") for l in fb.strip().splitlines()[1:]]
        cells = sum(x[1:] == y[1:] for x, y in zip(ra, rb))
        ja = json.load(open(f"{A}/{c}.{cfg}.gtreval.json"))["notes"]; jb = json.load(open(f"{B}/{c}.{cfg}.gtreval.json"))["notes"]
        key = lambda n: (n["pitch"], n["string"], n["fret"])
        same_notes = len(ja) == len(jb) and all(key(x) == key(y) and abs(x["onset"] - y["onset"]) < 1e-5 and abs(x["offset"] - y["offset"]) < 1e-5 for x, y in zip(ja, jb))
        print(f"{c} {cfg}: frames csv byte-identical {fa == fb}; frames {len(ra)}/{len(rb)}, identical frame rows {cells}; notes {len(ja)}/{len(jb)}, same (pitch,string,fret,onset,offset) {same_notes}")
# zenodo vs gpfx (verify outputs)
for c in ["S2n", "R1c"]:
    fa = open(f"{B}/{c}.zenodo-amt.frames.csv").read().strip().splitlines()[1:]; fb = open(f"{B}/{c}.onnx-gpfx.frames.csv").read().strip().splitlines()[1:]
    print(c, "verify zenodo-amt vs onnx-gpfx frame rows identical:", sum(x.split(",")[1:] == y.split(",")[1:] for x, y in zip(fa, fb)), "of", len(fa))
