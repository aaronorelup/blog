#!/usr/bin/env python3
"""make_r3bc.py - R3b and R3c: two more real guitar videos played with the fingers (nylon strings), with their own
audio, closer to the hands than R3a. Writes R3b/R3b.truth.json and R3c/R3c.truth.json in the R3a shape (there is no
ground truth: notes, beats and chords are empty; tempo, key and tuning are null).

R3b: archive.org item BrylieChristopherOxleyGuitar20181006, "Brylie Christopher Oxley Guitar 2018-10-06" (creator
field Brylie Christopher Oxley; item page "Usage: CC0 1.0 Universal"). Kept as R3b/original/: the item's original
upload BrylieChristopherOxley-guitar-2018-10-06.mp4 (H.264 1920x1080, 25 fps, AAC 48 kHz stereo, 580.52 s; 229,070,359
bytes, md5 bce85d67e2c61a40877c112e1db435f6 as archive.org lists it).

R3c: Wikimedia Commons file "Manx Guitar Lesson- Three Little Boats 2019.webm" (Culture Vannin, presented by Pete
Lumb; file page: CC BY 3.0). Kept as R3c/original/: Commons' own VP9 1080p transcode of that file,
Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm.1080p.vp9.webm (VP9 1920x1080, 25 fps, Opus 48 kHz stereo,
292.84 s; 51,075,480 bytes). The uploaded AV1 original answered HTTP 429 and was not obtained.

The excerpts were cut with encode_r3_excerpt.sh (R3a's encoder settings), each run through gtr-run (ledger lane
"inputs", --nolock, FF_THREADS=2):
  FF_THREADS=2 bash encode_r3_excerpt.sh R3b/original/BrylieChristopherOxley-guitar-2018-10-06.mp4 200 18 R3b R3b
  FF_THREADS=2 bash encode_r3_excerpt.sh R3c/original/Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm.1080p.vp9.webm \
      222 18 R3c R3c
This script only writes the two truth files. The facts in "what" (camera, cut times, what is in frame) come from
ffprobe, ffmpeg scene-score scans (> 0.12, as for R3a: r0056 for R3b, r0152 for R3c) and frames looked at by eye;
see INPUTS.md.

Usage: python make_r3bc.py INPUTS_DIR
"""
import os
import sys

import soundfile as sf

sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/inputs/scripts")
from gtr_common import write_json  # noqa: E402

R3B_PAGE = "https://archive.org/details/BrylieChristopherOxleyGuitar20181006"
R3C_PAGE = "https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm"

R3B_WHAT = (
    "Real classical guitar video (nylon strings; a Yamaha C-40 per the item description), played with the fingers, "
    "18 s excerpt (200-218 s) of a 580.5 s home recording; 1920x1080, 25 fps, progressive. The picture fills the left "
    "1438x1080 of the frame; the right 482 columns are black, as in the source. One fixed camera facing the player "
    "and the guitar top at about chest height; no cut inside the excerpt (the only cut in the whole video, ffmpeg "
    "scene score > 0.12, is at 287.08 s, where a second take starts). Close view: the player's face is out of frame; "
    "the neck runs diagonally to the upper right, with the nut and part of the headstock at the upper-right edge, and "
    "the whole fretboard from the nut to the sound hole is in frame (on the frame at 209 s of the original: the nut, "
    "fret 1 and 14 more fret wires, frets 5 to 18 by their spacing, with frets 2-4 under the fingers). The fretting "
    "hand (left) is on the neck and fully in frame, in the low positions in the frames looked at (one every 3 s); the "
    "picking-hand fingers (right) are at the sound hole at the left edge of the picture, partly cut off by it. No "
    "capo. Audio: both channels carry the same signal (left minus right is -117.7 dBFS RMS in R3b.wav), i.e. a "
    "mono recording stored as stereo; R3b.wav peaks at -13.1 dBFS. The piece played is not identified in the "
    "item's metadata. No ground truth.")

R3C_WHAT = (
    "Real classical guitar lesson video (nylon strings, played with the fingers): 'Manx Guitar Lesson: Three Little "
    "Boats' (Culture Vannin, 2019), presented by Pete Lumb; the tune is the traditional Manx 'Three Little "
    "Boats'. 18 s excerpt (222-240 s) from the section captioned 'Slow play-through'; 1920x1080, 25 fps, "
    "progressive. One continuous medium shot, no cut inside the excerpt (the shot runs from 213.97 to 259.45 s of "
    "the source; cuts from ffmpeg scene score > 0.12): camera in front of the seated player at about chest height, "
    "head to lap in frame; both hands visible: the fretting hand (left) on the neck, which rises to the upper right "
    "with the headstock and nut in frame (the hand is near the nut on the frame at 232 s), and the picking hand "
    "(right) at the sound hole; the whole fretboard from the nut to the sound hole is in frame (frets not counted). "
    "Sheet music on a stand along the bottom edge covers the lower "
    "bout; a bright window behind the player (backlit); a second guitar stands at the left edge. No capo. The whole "
    "video is a multi-camera edit (wide shot, this medium shot, side close-ups of the fretting hand and of the "
    "picking hand, title cards). Audio: the two channels are the same signal apart from a residue at -67.1 dBFS "
    "RMS (left minus right in R3c.wav), i.e. effectively mono; R3c.wav peaks at -2.1 dBFS. No ground truth (the "
    "file description links a guitar tab for the tune; it was not downloaded or used).")


def truth(root, cid, title, what, url, lic, quote, attribution):
    d = os.path.join(root, cid)
    info = sf.info(os.path.join(d, cid + ".wav"))
    t = dict(id=cid, title=title, what=what, audio=cid + ".wav", duration_s=round(info.frames / info.samplerate, 6),
             sample_rate=info.samplerate, channels=info.channels, tempo_bpm=None, time_signature=None, key=None,
             tuning_midi=None, capo=None, tuning_offset_cents=None, notes=[], beats=[], downbeats=[], chords=[],
             taps=[], stems={},
             source=dict(kind="video", url=url, license=lic, license_quote=quote, attribution=attribution))
    write_json(os.path.join(d, cid + ".truth.json"), t)
    print("wrote", os.path.join(d, cid + ".truth.json"))


def main():
    root = sys.argv[1]
    truth(root, "R3b", "Classical guitar close view, 18 s excerpt (archive.org, CC0 1.0)", R3B_WHAT, R3B_PAGE,
          "CC0 1.0",
          "Usage: CC0 1.0 Universal (http://creativecommons.org/publicdomain/zero/1.0/)",
          "\"Brylie Christopher Oxley Guitar 2018-10-06\" by Brylie Christopher Oxley, archive.org item "
          "BrylieChristopherOxleyGuitar20181006, CC0 1.0 (no attribution required); excerpt 200-218 s, re-encoded.")
    truth(root, "R3c", "Classical guitar lesson, both hands, 18 s excerpt (Wikimedia Commons, CC BY 3.0)",
          R3C_WHAT, R3C_PAGE, "CC BY 3.0",
          "This file is licensed under the Creative Commons Attribution 3.0 Unported license. Attribution: "
          "Culture Vannin",
          "\"Manx Guitar Lesson: Three Little Boats\" (2019) by Culture Vannin, presented by Pete Lumb, via "
          "Wikimedia Commons (File:Manx Guitar Lesson- Three Little Boats 2019.webm), CC BY 3.0 "
          "(https://creativecommons.org/licenses/by/3.0/); excerpt 222-240 s of Commons' 1080p VP9 transcode, "
          "re-encoded.")


if __name__ == "__main__":
    main()
