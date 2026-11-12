"""Run madmom 0.16.1's beat, downbeat, tempo, chord and key processors on one audio file.

Usage (inside venv-madmom39, Python 3.9, numpy 1.23.5):
  python -I madmom_run.py --audio <file.wav> --outdir <dir> [--stages beats,downbeats,tempo,chords_cnn,chords_dc,key]

Writes into <outdir>:
  beats.txt            one beat time per line, seconds        (RNNBeatProcessor -> DBNBeatTrackingProcessor(fps=100))
  downbeats.txt        "time<TAB>beat_number" per line, seconds (RNNDownBeatProcessor -> DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=100))
  tempo.txt            "bpm<TAB>strength" per line, strongest first (RNNBeatProcessor -> TempoEstimationProcessor(fps=100), method 'comb')
  chords_cnn.lab       "start<TAB>end<TAB>label"  (CNNChordFeatureProcessor -> CRFChordRecognitionProcessor)
  chords_dc.lab        "start<TAB>end<TAB>label"  (DeepChromaProcessor -> DeepChromaChordRecognitionProcessor)
  key.txt              one line, e.g. "G major"   (CNNKeyRecognitionProcessor -> key_prediction_to_label)
  key_probs.json       the 24 key probabilities
  timings.json         wall-clock seconds of each stage, measured in this script with time.perf_counter
Every stage uses the processors' default parameters except where written above.
"""
import argparse
import json
import os
import time

import numpy as np


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--stages", default="beats,downbeats,tempo,chords_cnn,chords_dc,key")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    stages = a.stages.split(",")
    t_import = time.perf_counter()
    import madmom
    from madmom.features.beats import RNNBeatProcessor, DBNBeatTrackingProcessor
    from madmom.features.downbeats import RNNDownBeatProcessor, DBNDownBeatTrackingProcessor
    from madmom.features.tempo import TempoEstimationProcessor
    from madmom.features.chords import (CNNChordFeatureProcessor, CRFChordRecognitionProcessor,
                                        DeepChromaChordRecognitionProcessor)
    from madmom.audio.chroma import DeepChromaProcessor
    from madmom.features.key import CNNKeyRecognitionProcessor, key_prediction_to_label
    timings = {"madmom_version": madmom.__version__, "import_s": round(time.perf_counter() - t_import, 3)}
    out = {}

    beat_act = None
    if "beats" in stages or "tempo" in stages:
        t = time.perf_counter()
        beat_act = RNNBeatProcessor()(a.audio)
        timings["rnn_beat_activation_s"] = round(time.perf_counter() - t, 3)
    if "beats" in stages:
        t = time.perf_counter()
        beats = DBNBeatTrackingProcessor(fps=100)(beat_act)
        timings["dbn_beat_tracking_s"] = round(time.perf_counter() - t, 3)
        np.savetxt(os.path.join(a.outdir, "beats.txt"), beats, fmt="%.3f")
        out["n_beats"] = int(len(beats))
    if "tempo" in stages:
        t = time.perf_counter()
        tempi = TempoEstimationProcessor(fps=100)(beat_act)
        timings["tempo_estimation_s"] = round(time.perf_counter() - t, 3)
        np.savetxt(os.path.join(a.outdir, "tempo.txt"), tempi, fmt="%.3f", delimiter="\t")
        out["tempo_top"] = [float(x) for x in tempi[0]]
    if "downbeats" in stages:
        t = time.perf_counter()
        db_act = RNNDownBeatProcessor()(a.audio)
        timings["rnn_downbeat_activation_s"] = round(time.perf_counter() - t, 3)
        t = time.perf_counter()
        db = DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=100)(db_act)
        timings["dbn_downbeat_tracking_s"] = round(time.perf_counter() - t, 3)
        np.savetxt(os.path.join(a.outdir, "downbeats.txt"), db, fmt=["%.3f", "%d"], delimiter="\t")
        out["n_downbeat_rows"] = int(len(db))
        out["n_bar_starts"] = int((db[:, 1] == 1).sum()) if len(db) else 0
    if "chords_cnn" in stages:
        t = time.perf_counter()
        feats = CNNChordFeatureProcessor()(a.audio)
        segs = CRFChordRecognitionProcessor()(feats)
        timings["chords_cnn_crf_s"] = round(time.perf_counter() - t, 3)
        with open(os.path.join(a.outdir, "chords_cnn.lab"), "w") as f:
            for s, e, lab in segs:
                f.write("%.3f\t%.3f\t%s\n" % (s, e, lab))
        out["chords_cnn_n_segments"] = int(len(segs))
    if "chords_dc" in stages:
        t = time.perf_counter()
        chroma = DeepChromaProcessor()(a.audio)
        segs = DeepChromaChordRecognitionProcessor()(chroma)
        timings["chords_deepchroma_s"] = round(time.perf_counter() - t, 3)
        with open(os.path.join(a.outdir, "chords_dc.lab"), "w") as f:
            for s, e, lab in segs:
                f.write("%.3f\t%.3f\t%s\n" % (s, e, lab))
        out["chords_dc_n_segments"] = int(len(segs))
    if "key" in stages:
        t = time.perf_counter()
        pred = CNNKeyRecognitionProcessor()(a.audio)
        label = key_prediction_to_label(pred)
        timings["key_cnn_s"] = round(time.perf_counter() - t, 3)
        with open(os.path.join(a.outdir, "key.txt"), "w") as f:
            f.write(label + "\n")
        # madmom's key order (madmom.features.key.KEY_LABELS)
        from madmom.features.key import KEY_LABELS
        p = np.asarray(pred).reshape(-1)
        with open(os.path.join(a.outdir, "key_probs.json"), "w") as f:
            json.dump({k: round(float(v), 5) for k, v in zip(KEY_LABELS, p)}, f, indent=0)
        out["key"] = label
    timings["outputs"] = out
    with open(os.path.join(a.outdir, "timings.json"), "w") as f:
        json.dump(timings, f, indent=1)
    print(json.dumps(timings))


if __name__ == "__main__":
    main()
