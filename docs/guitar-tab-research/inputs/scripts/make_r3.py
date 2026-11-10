#!/usr/bin/env python3
"""make_r3.py - R3a: a real classical (fingerstyle) guitar video under CC BY-SA 4.0, with its own audio.

Source: archive.org item scm-422828-crescendo313-drh-meredithconn, "Crescendo 313 - DRH - Meredith Connie Solo
Classical Guitar - Part II" (creator field: Mark Andersen; publisher field: Seattle Community Media), file
crescendo313_2014_09_04_0.mp4 (archive.org's h.264 derivative, 640x480, 30000/1001 fps, AAC 44.1 kHz stereo,
1680.03 s; the item's original is a 1.33 GB MPEG-2 file that was not downloaded). Kept as R3a/original/.

The excerpt 400.000-418.000 s was cut with ffmpeg 6.1.1 (run r0010 in the ledger):
  ffmpeg -ss 400 -i ORIG -t 18 -map 0:v:0 -map 0:a:0 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
         -c:a aac -b:a 192k -movflags +faststart R3a.mp4
  ffmpeg -ss 400 -i ORIG -t 18 -map 0:v:0 -map 0:a:0 -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -deadline good \
         -cpu-used 4 -pix_fmt yuv420p -c:a libopus -b:a 128k R3a.webm
  ffmpeg -ss 400 -i ORIG -t 18 -vn -c:a pcm_s16le -ar 44100 R3a.wav
  ffmpeg -ss 400 -i ORIG -t 18 -vn -ac 1 -c:a pcm_s16le -ar 44100 R3a.mono.wav
This script only writes R3a.truth.json (there is no ground truth: notes, beats and chords are empty).

Usage: python make_r3.py INPUTS_DIR
"""
import os
import sys

import soundfile as sf

sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/inputs/scripts")
from gtr_common import write_json  # noqa: E402

PAGE = "https://archive.org/details/scm-422828-crescendo313-drh-meredithconn"


def main():
    root = sys.argv[1]
    d = os.path.join(root, "R3a")
    info = sf.info(os.path.join(d, "R3a.wav"))
    what = ("Real classical guitar performance video (nylon strings, played with the fingers), 18 s excerpt "
            "(400-418 s) of a 28-minute concert recording; 640x480, 30000/1001 fps, progressive. Multi-camera edit: "
            "medium shot of the seated player from the front at a slight angle (guitar neck and fretting hand at the "
            "upper right of the player, picking hand at the sound hole partly behind a microphone stand) from 0 to "
            "7.27 s, a wide shot of the stage (player small in frame, a music stand in front of the lower guitar "
            "body) from 7.27 to 14.65 s, and the medium shot again from 14.65 s to the end (cut times from ffmpeg "
            "scene score > 0.12). The piece played is not identified in the item's metadata. No ground truth.")
    truth = dict(id="R3a", title="Classical guitar concert video, 18 s excerpt (archive.org, CC BY-SA 4.0)",
                 what=what, audio="R3a.wav", duration_s=round(info.frames / info.samplerate, 6),
                 sample_rate=info.samplerate, channels=info.channels, tempo_bpm=None, time_signature=None, key=None,
                 tuning_midi=None, capo=None, tuning_offset_cents=None, notes=[], beats=[], downbeats=[], chords=[],
                 taps=[], stems={},
                 source=dict(kind="video", url=PAGE, license="CC BY-SA 4.0",
                             license_quote="Usage: Attribution-ShareAlike 4.0 International "
                                           "(https://creativecommons.org/licenses/by-sa/4.0/)",
                             attribution="\"Crescendo 313 - DRH - Meredith Connie Solo Classical Guitar - Part II\", "
                                         "Mark Andersen / Seattle Community Media, archive.org item "
                                         "scm-422828-crescendo313-drh-meredithconn, CC BY-SA 4.0; excerpt 400-418 s, "
                                         "re-encoded."))
    write_json(os.path.join(d, "R3a.truth.json"), truth)
    print("wrote", os.path.join(d, "R3a.truth.json"))


if __name__ == "__main__":
    main()
