#!/usr/bin/env python3
"""make_r2.py - R2full and R2 from Josh Woodward, "I Want to Destroy Something Beautiful" (CC BY 4.0).

Sources (downloaded 2026-11-10, linked from https://www.joshwoodward.com/song/IWantToDestroySomethingBeautiful):
  original/JoshWoodward-DW-01-IWantToDestroySomethingBeautiful.flac        the song (with vocals), FLAC 16-bit 44.1 kHz
  original/JoshWoodward-DW-NoVox-01-IWantToDestroySomethingBeautiful.flac  the artist's instrumental version
The two FLACs have the same length and line up sample for sample (checked below), so vocals = song - instrumental.
Writes R2full/R2full.wav (+ .mono.wav, stems/instrumental.wav, stems/vocals_derived.wav, truth JSON) and the excerpt
R2/ (same files, samples [START, START + LEN)). No notes, beats or chords: this clip has no ground truth.

Usage: python -I make_r2.py INPUTS_DIR START_S LEN_S
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/inputs/scripts")
from gtr_common import write_json, write_lab, write_beats, write_notes_csv  # noqa: E402

PAGE = "https://www.joshwoodward.com/song/IWantToDestroySomethingBeautiful"
FAQ = "https://www.joshwoodward.com/faq"
QUOTE = "This work is licensed under a Creative Commons Attribution 4.0 License"
ATTR = ("\"I Want to Destroy Something Beautiful\" by Josh Woodward (album Dirty Wings), "
        "https://www.joshwoodward.com/, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).")


def main():
    root, start_s, len_s = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    orig = os.path.join(root, "R2full", "original")
    song, sr = sf.read(os.path.join(orig, "JoshWoodward-DW-01-IWantToDestroySomethingBeautiful.flac"), dtype="int16")
    inst, sr2 = sf.read(os.path.join(orig, "JoshWoodward-DW-NoVox-01-IWantToDestroySomethingBeautiful.flac"),
                        dtype="int16")
    assert sr == sr2 == 44100 and song.shape == inst.shape, (sr, sr2, song.shape, inst.shape)
    diff = song.astype(np.int32) - inst.astype(np.int32)
    voc = np.clip(diff, -32768, 32767).astype(np.int16)
    checks = dict(samples=len(song), clipped_samples_in_vocals_derived=int(np.sum(np.abs(diff) > 32767)))
    # where the instrumental and the song are identical except for the last bit (no singing)
    sec = sr
    per_sec = [int(np.max(np.abs(diff[i:i + sec]))) for i in range(0, len(diff) - sec + 1, sec)]
    checks["seconds_where_song_minus_instrumental_max_abs_le_2_lsb"] = int(sum(1 for v in per_sec if v <= 2))
    checks["seconds_total"] = len(per_sec)
    for cid, a, b in [("R2full", 0, len(song)), ("R2", int(round(start_s * sr)), int(round((start_s + len_s) * sr)))]:
        d = os.path.join(root, cid)
        os.makedirs(os.path.join(d, "stems"), exist_ok=True)
        sf.write(os.path.join(d, cid + ".wav"), song[a:b], sr, subtype="PCM_16")
        mono = np.round(song[a:b].astype(np.float64).mean(axis=1)).astype(np.int16)
        sf.write(os.path.join(d, cid + ".mono.wav"), mono, sr, subtype="PCM_16")
        sf.write(os.path.join(d, "stems", "instrumental.wav"), inst[a:b], sr, subtype="PCM_16")
        sf.write(os.path.join(d, "stems", "vocals_derived.wav"), voc[a:b], sr, subtype="PCM_16")
        dur = (b - a) / sr
        what = ("Real full-band song with singing: Josh Woodward, 'I Want to Destroy Something Beautiful' (album Dirty "
                "Wings), " + ("the whole song" if cid == "R2full" else f"excerpt {start_s:.3f}-{start_s + len_s:.3f} s "
                              "of the song (R2full)") +
                ". No ground truth. The artist's song page lists Key D# minor, Tempo 72 bpm, Meter 4/4 Swing (artist's "
                "metadata, not checked here). stems/instrumental.wav is the artist's own instrumental version; "
                "stems/vocals_derived.wav = song minus instrumental, computed here.")
        truth = dict(id=cid, title="Josh Woodward - I Want to Destroy Something Beautiful" +
                     ("" if cid == "R2full" else f" (excerpt from {start_s:.1f} s)"), what=what, audio=cid + ".wav",
                     duration_s=round(dur, 6), sample_rate=sr, channels=2, tempo_bpm=None, time_signature=None,
                     key=None, tuning_midi=None, capo=None, tuning_offset_cents=None, notes=[], beats=[],
                     downbeats=[], chords=[], taps=[],
                     stems={"instrumental": "stems/instrumental.wav", "vocals_derived": "stems/vocals_derived.wav"},
                     source=dict(kind="recording", url=PAGE, license="CC BY 4.0", license_quote=QUOTE,
                                 attribution=ATTR))
        write_json(os.path.join(d, cid + ".truth.json"), truth)
        checks[cid] = dict(start_sample=a, end_sample=b, duration_s=round(dur, 6),
                           peak_dbfs=round(20 * np.log10(np.max(np.abs(song[a:b])) / 32768), 2),
                           samples_at_full_scale=int(np.sum(np.abs(song[a:b].astype(np.int32)) >= 32767)),
                           vocals_derived_rms_dbfs=round(20 * np.log10(np.sqrt(np.mean((voc[a:b] / 32768.0) ** 2))
                                                                       + 1e-12), 2))
    os.makedirs(os.path.join(root, "_checks"), exist_ok=True)
    with open(os.path.join(root, "_checks", "r2_checks.json"), "w") as f:
        json.dump(checks, f, indent=1)
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
