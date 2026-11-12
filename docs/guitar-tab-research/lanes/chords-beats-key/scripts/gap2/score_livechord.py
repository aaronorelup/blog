"""Gap round 2: score the LiveChord refiner's outputs and, with the same gtr-eval version, the prior trackers' files they
were given, so that each before / after pair comes from one scorer version (gtr-eval 0.12.1 on 2026-11-12; the first
round's numbers for the priors are gtr-eval 0.11.1).

Usage: python3 -I score_livechord.py
Uses ev() from ../score_all.py: one gtr-eval run per file, appended to out/scores/scores.jsonl (tool, variant, clip,
subcommand, args, estimate sha256, eval id, metrics, counts); a run already in that file is not repeated.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, ".."))
import score_all  # noqa: E402

OUT = score_all.OUT
CLIPS = ["S3", "S4", "R1a", "R1b", "R1c"]


def main():
    done = score_all.load_done()
    for clip in CLIPS:
        # priors, re-scored
        b = os.path.join(OUT, "beat_this", clip, "final0_beats.txt")
        d = os.path.join(OUT, "beat_this", clip, "final0_downbeats.txt")
        score_all.ev(done, "beat_this", "final0 (prior of the LiveChord refiner, re-scored in gap round 2)", clip,
                     "beats", b, ["--est", b, "--downbeats-est", d])
        m = os.path.join(OUT, "madmom", clip, "downbeats.txt")
        score_all.ev(done, "madmom", "RNNDownBeatProcessor+DBNDownBeatTrackingProcessor (prior of the LiveChord "
                     "refiner, re-scored in gap round 2)", clip, "beats", m, ["--est", m, "--downbeat-col", "2"])
        # refined
        for prior in ("beat_this_final0", "madmom_dbn_downbeat"):
            b = os.path.join(OUT, "livechord", clip, "beats_%s.txt" % prior)
            d = os.path.join(OUT, "livechord", clip, "downbeats_%s.txt" % prior)
            score_all.ev(done, "livechord", "refine(prior=%s)" % prior, clip, "beats", b,
                         ["--est", b, "--downbeats-est", d])


if __name__ == "__main__":
    main()
