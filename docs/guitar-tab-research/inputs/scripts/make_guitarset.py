#!/usr/bin/env python3
"""make_guitarset.py - cut GuitarSet excerpts R1a, R1b, R1c and convert their JAMS annotations to the shared truth schema.

Inputs (downloaded with remotezip from Zenodo record 3371780, annotation.zip and audio_mono-mic.zip):
  DL/<stem>.jams, DL/<stem>_mic.wav
Writes OUT/<id>/: <id>.wav (the mic recording, mono 44.1 kHz 16-bit, samples 0..t1 copied unchanged),
  <id>.mono.wav (identical copy, for uniformity with the synthesized clips), <id>.truth.json, <id>.notes.csv,
  <id>.beats.txt, <id>.chords.lab (lead-sheet chords), <id>.chords_performed.lab (the dataset's second chord
  annotation), <id>.mid, <id>.tab.txt
and OUT/_checks/guitarset_checks.json.

The excerpt is always [0, t1): t1 is the last annotated downbeat at or before 30.0 s, so no note is cut at the start.
string = 6 - int(data_source of the note_midi annotation) (data_source 0 is the low E string);
pitch = round(annotated MIDI value); fret = pitch - open-string pitch of that string (standard tuning, no capo).
Notes with onset < t1 are kept; their offsets are clipped to t1.

Usage: python -I make_guitarset.py DL OUT
"""
import json
import os
import sys

import mido
import numpy as np
import soundfile as sf

sys.path.insert(0, "/home/user/blog/docs/guitar-tab-research/inputs/scripts")
from gtr_common import tab_text, write_beats, write_json, write_lab, write_notes_csv  # noqa: E402

STD = [40, 45, 50, 55, 59, 64]
PPQ = 960
CLIPS = [
    ("R1a", "02_SS2-107-Ab_comp", "comp"),
    ("R1b", "04_Rock1-90-C#_solo", "solo"),
    ("R1c", "00_BN3-119-G_comp", "comp"),
]
STYLE = {"SS": "Singer-Songwriter", "BN": "Bossa Nova", "Rock": "Rock", "Jazz": "Jazz", "Funk": "Funk"}
LICENSE_QUOTE = ("\"Creative Commons Attribution 4.0 International\" / \"The Creative Commons Attribution license allows "
                 "re-distribution and re-use of a licensed work on the condition that the creator is appropriately "
                 "credited.\" (Rights / License box of the Zenodo record, read 2026-11-10)")
CITATION = ("Q. Xi, R. Bittner, J. Pauwels, X. Ye, and J. P. Bello, \"GuitarSet: A Dataset for Guitar Transcription\", "
            "in 19th International Society for Music Information Retrieval Conference, Paris, France, Sept. 2018. "
            "Data: GuitarSet v1.1.0, Zenodo, doi:10.5281/zenodo.3371780.")


def parse_stem(stem):
    player, rest, kind = stem.split("_")
    style_prog, tempo, key = rest.split("-")
    style = "".join(ch for ch in style_prog if not ch.isdigit())
    prog = style_prog[len(style):]
    return dict(player=player, style=STYLE.get(style, style), progression=prog, tempo=int(tempo), key=key, kind=kind)


def main():
    dl, out = sys.argv[1], sys.argv[2]
    checks = {}
    for cid, stem, kind in CLIPS:
        info = parse_stem(stem)
        jam = json.load(open(os.path.join(dl, stem + ".jams")))
        anns = jam["annotations"]
        beats_ann = [a for a in anns if a["namespace"] == "beat_position"][0]["data"]
        downs = [b["time"] for b in beats_ann if b["value"]["position"] == 1]
        t1 = max(t for t in downs if t <= 30.0 + 1e-9)
        audio, sr = sf.read(os.path.join(dl, stem + "_mic.wav"), dtype="int16", always_2d=True)
        n = int(round(t1 * sr))
        d = os.path.join(out, cid)
        os.makedirs(d, exist_ok=True)
        clip = audio[:n]
        sf.write(os.path.join(d, cid + ".wav"), clip, sr, subtype="PCM_16")
        sf.write(os.path.join(d, cid + ".mono.wav"), clip, sr, subtype="PCM_16")
        dur = n / sr
        voice = "chord" if kind == "comp" else "lead"
        notes, neg, dropped_after = [], 0, 0
        for a in anns:
            if a["namespace"] != "note_midi":
                continue
            string = 6 - int(a["annotation_metadata"]["data_source"])
            for x in a["data"]:
                on = x["time"]
                if on >= dur:
                    dropped_after += 1
                    continue
                pitch = int(round(x["value"]))
                fret = pitch - STD[6 - string]
                if fret < 0:
                    neg += 1
                notes.append(dict(onset=round(on, 6), offset=round(min(on + x["duration"], dur), 6), pitch=pitch,
                                  velocity=None, voice=voice, string=string, fret=fret))
        notes.sort(key=lambda m: (m["onset"], m["pitch"]))
        beats = [(b["time"], b["value"]["position"]) for b in beats_ann if b["time"] < dur]
        tempo = [a for a in anns if a["namespace"] == "tempo"][0]["data"][0]["value"]
        key_val = [a for a in anns if a["namespace"] == "key_mode"][0]["data"][0]["value"]
        tonic, mode = key_val.split(":")
        chord_anns = [a for a in anns if a["namespace"] == "chord"]
        lead = [a for a in chord_anns if not a["annotation_metadata"].get("data_source")][0]
        perf = [a for a in chord_anns if a["annotation_metadata"].get("data_source")][0]

        def clip_chords(data):
            res = []
            for c in data:
                st, en = c["time"], c["time"] + c["duration"]
                if st >= dur:
                    continue
                res.append(dict(start=round(st, 6), end=round(min(en, dur), 6), label=c["value"]))
            return res
        chords = clip_chords(lead["data"])
        chords_perf = clip_chords(perf["data"])
        bv = beats_ann[0]["value"]
        ts = f"{bv['num_beats']}/{bv['beat_units']}"
        what = (f"GuitarSet excerpt: player {info['player']}, {info['style']} progression {info['progression']}, "
                f"'{info['kind']}' take ({'accompaniment' if kind == 'comp' else 'single-note solo'}), "
                f"{info['tempo']} BPM, key {info['key']}; mic recording, first {dur:.3f} s of {stem}_mic.wav.")
        truth = dict(id=cid, title=f"GuitarSet {stem} (first {dur:.1f} s)", what=what, audio=cid + ".wav",
                     duration_s=round(dur, 6), sample_rate=sr, channels=1, tempo_bpm=float(tempo),
                     time_signature=ts, key=f"{tonic} {mode}", tuning_midi=STD, capo=0, tuning_offset_cents=0,
                     notes=notes, beats=[round(t, 6) for t, _ in beats],
                     downbeats=[round(t, 6) for t, p in beats if p == 1], chords=chords, taps=[], stems={},
                     source=dict(kind="dataset", url="https://zenodo.org/records/3371780",
                                 license="CC BY 4.0 (Creative Commons Attribution 4.0 International)",
                                 license_quote=LICENSE_QUOTE,
                                 attribution=f"GuitarSet (Xi, Bittner, Pauwels, Ye, Bello, ISMIR 2018), file {stem}, "
                                             f"CC BY 4.0. Excerpt 0-{dur:.3f} s. " + CITATION))
        write_json(os.path.join(d, cid + ".truth.json"), truth)
        write_notes_csv(os.path.join(d, cid + ".notes.csv"), notes)
        write_beats(os.path.join(d, cid + ".beats.txt"), [t for t, _ in beats], [p for _, p in beats])
        write_lab(os.path.join(d, cid + ".chords.lab"), chords)
        write_lab(os.path.join(d, cid + ".chords_performed.lab"), chords_perf)
        # MIDI: one track per string (channel = 6 - string), annotated tempo, velocity fixed at 80 (not annotated)
        mf = mido.MidiFile(type=1, ticks_per_beat=PPQ)
        t0 = mido.MidiTrack()
        mf.tracks.append(t0)
        t0.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(tempo), time=0))
        t0.append(mido.MetaMessage("time_signature", numerator=bv["num_beats"], denominator=bv["beat_units"], time=0))
        s2t = lambda s: int(round(s * tempo / 60.0 * PPQ))
        for string in range(6, 0, -1):
            ch = 6 - string
            msgs = [(0, 0, mido.MetaMessage("track_name", name=f"string {string}")),
                    (0, 1, mido.Message("program_change", channel=ch, program=25))]
            for m in notes:
                if m["string"] == string:
                    msgs.append((s2t(m["onset"]), 3, mido.Message("note_on", channel=ch, note=m["pitch"], velocity=80)))
                    msgs.append((s2t(m["offset"]), 2, mido.Message("note_off", channel=ch, note=m["pitch"], velocity=0)))
            msgs.sort(key=lambda z: (z[0], z[1]))
            tr = mido.MidiTrack()
            last = 0
            for tick, _, msg in msgs:
                tr.append(msg.copy(time=tick - last))
                last = tick
            mf.tracks.append(tr)
        mf.save(os.path.join(d, cid + ".mid"))
        # ASCII tab on the annotated beat grid, positions rounded to the nearest 16th note
        bt = np.array([t for t, _ in beats_ann_times(beats_ann)])
        bpos = [p for _, p in beats_ann_times(beats_ann)]
        bar_of_beat, bar = [], -1
        for p in bpos:
            if p == 1:
                bar += 1
            bar_of_beat.append(max(bar, 0))
        events = []
        for m in notes:
            k = int(np.searchsorted(bt, m["onset"], side="right") - 1)
            if k < 0:
                events.append((0, 0.0, m["string"], m["fret"]))
                continue
            nxt = bt[k + 1] if k + 1 < len(bt) else bt[k] + (bt[k] - bt[k - 1])
            frac = (m["onset"] - bt[k]) / (nxt - bt[k])
            events.append((bar_of_beat[k], (bpos[k] - 1) + frac, m["string"], m["fret"]))
        bar_starts = [round(t, 3) for t, p in beats if p == 1]
        header = [f"{cid}: {truth['title']}", what,
                  "Tuning: E2 A2 D3 G3 B3 E4, no capo. Strings and frets from the dataset's per-string note "
                  "annotations (fret = rounded pitch - open string).",
                  "Positions are rounded to the nearest 16th note of the annotated beat grid (a reading aid: exact "
                  "times are in the truth JSON). One column = one 16th note."]
        txt, coll = tab_text(header, STD, events, bar_starts, beats_per_bar=bv["num_beats"])
        with open(os.path.join(d, cid + ".tab.txt"), "w") as f:
            f.write(txt)
        frets = [m["fret"] for m in notes]
        checks[cid] = dict(stem=stem, excerpt_s=[0.0, round(dur, 6)], samples=n, sample_rate=sr,
                           source_file_samples=len(audio), notes=len(notes), notes_starting_after_excerpt=dropped_after,
                           negative_frets=neg, fret_range=[min(frets), max(frets)], beats=len(beats),
                           downbeats=len(truth["downbeats"]), chords=len(chords), tab_collisions=coll,
                           tempo=tempo, key=key_val, peak_dbfs=round(20 * np.log10(np.max(np.abs(clip)) / 32768), 2),
                           rms_dbfs=round(20 * np.log10(np.sqrt(np.mean((clip / 32768.0) ** 2))), 2))
    os.makedirs(os.path.join(out, "_checks"), exist_ok=True)
    with open(os.path.join(out, "_checks", "guitarset_checks.json"), "w") as f:
        json.dump(checks, f, indent=1)
    print(json.dumps(checks, indent=1))


def beats_ann_times(beats_ann):
    return [(b["time"], b["value"]["position"]) for b in beats_ann]


if __name__ == "__main__":
    main()
