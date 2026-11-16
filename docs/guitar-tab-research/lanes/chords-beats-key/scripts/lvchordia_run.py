"""lv-chordia 1.1.0 (PyPI): the ISMIR 2019 large-vocabulary chord model (5-network ensemble + HMM decoding).

Usage (venv-lvchordia, Python 3.11, torch 2.15.0+cpu):
  python -I lvchordia_run.py --audio <file.wav> --outdir <dir> [--dicts submission,ismir2017]
Calls lv_chordia.chord_recognition.chord_recognition(audio_path, chord_dict_name=<dict>) for each dictionary.
It returns a list of {"start_time", "end_time", "chord"} (times rounded to 0.01 s by the package).
Writes <outdir>/chords_lvchordia_<dict>.json, chords_lvchordia_<dict>.lab ("start<TAB>end<TAB>label"), timings_lvchordia.json.
"""
import argparse
import json
import os
import time


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--dicts", default="submission,ismir2017")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import torch
    from lv_chordia.chord_recognition import chord_recognition
    tim = {"torch": torch.__version__, "torch_threads": torch.get_num_threads(), "import_s": round(time.perf_counter() - t0, 3)}
    for d in a.dicts.split(","):
        t = time.perf_counter()
        res = chord_recognition(a.audio, chord_dict_name=d)
        tim["chord_recognition_%s_s" % d] = round(time.perf_counter() - t, 3)
        with open(os.path.join(a.outdir, "chords_lvchordia_%s.json" % d), "w") as f:
            json.dump(res, f, indent=0)
        with open(os.path.join(a.outdir, "chords_lvchordia_%s.lab" % d), "w") as f:
            for r in res:
                f.write("%.2f\t%.2f\t%s\n" % (r["start_time"], r["end_time"], r["chord"]))
        tim["n_segments_%s" % d] = len(res)
        tim["labels_%s" % d] = sorted(set(r["chord"] for r in res))
    with open(os.path.join(a.outdir, "timings_lvchordia.json"), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
