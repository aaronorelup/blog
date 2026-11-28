"""Gap round 2: inputs for MidiBERT-Piano melody extraction (run elsewhere), and a scorer for the files it returns.

MIDI-BERT (github.com/wazenmai/MIDI-BERT at 0b93558, read, not run) reads a MIDI file with miditoolkit and works in
raw ticks as if the file had 480 ticks per beat: `quantize_items(items, ticks=120)` and
`group_items(items, max_time, ticks_per_bar=DEFAULT_RESOLUTION*4)` with `DEFAULT_RESOLUTION = 480`, 16 positions per
4/4 bar; it never reads the file's ticks_per_beat. The lane's MIDI files are written by pretty_midi at 220 ticks per
beat, so `inputs` re-writes the notes at 480 ticks per beat (same seconds, same tempo). extract.py then writes the notes
it predicts as melody (class 1, plus class 2 "bridge" unless --bridge False) at 480 ticks per beat, re-quantized, with
the first bar that holds notes placed at bar 1 (`events2midi`: `current_bar` starts at 0 and the first event is a Bar).

usage:
  python gap2_midibert.py inputs <out dir>
      writes, for S2n and S5dropd: <clip>_truth_merged_480tpb.mid (the 90 truth notes, onset, offset and pitch only,
      one track, the clip's tempo from its truth file), <clip>_basicpitch_480tpb.mid (the notes of
      out/basic-pitch/<clip>.mono_basic_pitch.mid with that file's own tempo) and <clip>_basicpitch_112bpm_480tpb.mid
      (the same notes, same seconds, with the clip's truth tempo, so the 4/4 bar grid lines up with the music; this
      uses one piece of truth, the tempo, as M1 did in trials.md). Prints a read-back of every file.
  python gap2_midibert.py score <predicted melody .mid> <input .mid it was made from> <clip id> [--out result.json]
      Each predicted note is mapped back to input time the way extract.py numbers bars (output bar k = the k-th input
      bar that holds notes, after onsets are snapped to the 120-tick grid; see input_bars / match), then input and
      predicted notes are matched in beats, same pitch, onsets at most 0.25 beat apart (one 1/16-bar grid step),
      one-to-one per pitch (mir_eval.util.match_events). Matched input notes are labelled melody,
      the others bass, and the labelled input notes are scored against the truth with fvt_common.voice_accuracy
      (onset within 50 ms, pitch within half a semitone, then the share of matched pairs with the right voice), as
      for partitura, music21 and piano_svsep.
  python gap2_midibert.py selftest <inputs dir> <work dir>
      For each input file: a fake prediction holding the input notes that match a truth melody note, written the way
      extract.py writes (480 ticks per beat, no tempo event, onsets rounded to 120 ticks, the first bar with notes
      moved to bar 1), then scored.
"""
import json
import os
import sys

import mir_eval
import numpy as np
import pretty_midi

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fvt_common import load_truth, voice_accuracy  # noqa: E402

LANE = "/home/user/gtr/lanes/fingerstyle-voices-taps"


def notes_of(path):
    pm = pretty_midi.PrettyMIDI(path)
    out = []
    for inst in pm.instruments:
        for n in inst.notes:
            out.append({"onset": float(n.start), "offset": float(n.end), "pitch": int(n.pitch),
                        "beat": pm.time_to_tick(n.start) / pm.resolution, "velocity": int(n.velocity)})
    out.sort(key=lambda n: (n["onset"], n["pitch"]))
    return pm, out


def write(path, notes, tempo, resolution=480, program=24):
    pm = pretty_midi.PrettyMIDI(resolution=resolution, initial_tempo=tempo)
    inst = pretty_midi.Instrument(program=program)
    for n in notes:
        inst.notes.append(pretty_midi.Note(velocity=int(n.get("velocity", 80)), pitch=int(n["pitch"]),
                                           start=float(n["onset"]), end=float(n["offset"])))
    pm.instruments.append(inst)
    pm.write(path)


def readback(path):
    pm, ns = notes_of(path)
    tempi = pm.get_tempo_changes()[1].tolist()
    return {"file": os.path.basename(path), "ticks_per_beat": pm.resolution, "tempi_bpm": [round(t, 3) for t in tempi],
            "n_notes": len(ns), "pitch_range": [min(n["pitch"] for n in ns), max(n["pitch"] for n in ns)],
            "first_onsets_s": [round(n["onset"], 3) for n in ns[:3]]}


def cmd_inputs(out):
    os.makedirs(out, exist_ok=True)
    for clip in ("S2n", "S5dropd"):
        truth = load_truth(clip)
        tempo = float(truth["tempo_bpm"])
        tn = [{"onset": n["onset"], "offset": n["offset"], "pitch": n["pitch"]} for n in truth["notes"]]
        write(os.path.join(out, f"{clip}_truth_merged_480tpb.mid"), tn, tempo)
        bp_pm, bp = notes_of(os.path.join(LANE, "out/basic-pitch", f"{clip}.mono_basic_pitch.mid"))
        bp_tempo = float(bp_pm.get_tempo_changes()[1][0])
        write(os.path.join(out, f"{clip}_basicpitch_480tpb.mid"), bp, bp_tempo)
        write(os.path.join(out, f"{clip}_basicpitch_112bpm_480tpb.mid"), bp, tempo)
        for f in (f"{clip}_truth_merged_480tpb.mid", f"{clip}_basicpitch_480tpb.mid", f"{clip}_basicpitch_112bpm_480tpb.mid"):
            print(json.dumps(readback(os.path.join(out, f))))


def input_bars(inp):
    """MIDI-BERT's view of the input (file at 480 ticks per beat): onsets snapped to the 120-tick grid
    (quantize_items), bars of 1920 ticks (group_items), only bars that hold notes get a Bar event (item2event)."""
    q = [int(round(n["beat"] * 480 / 120.0)) * 120 for n in inp]
    return q, sorted({t // 1920 for t in q})


def match(inp, pred, window=0.25):
    """Map each predicted note back to input time: extract.py's events2midi puts the k-th bar that holds input notes
    at output bar k (k = 1, 2, ...), so output bar k = input bar bars[k - 1]. Then match per pitch in beats."""
    _, bars = input_bars(inp)
    back = []
    for n in pred:
        tick = int(round(n["beat"] * 480))
        k, pos = tick // 1920, tick % 1920
        back.append((bars[k - 1] * 1920 + pos) / 480.0 if 1 <= k <= len(bars) else None)
    pairs = []
    for p in sorted({n["pitch"] for n in inp}):
        ii = [i for i, n in enumerate(inp) if n["pitch"] == p]
        jj = [j for j, n in enumerate(pred) if n["pitch"] == p and back[j] is not None]
        if not ii or not jj:
            continue
        ref = np.array([inp[i]["beat"] for i in ii])
        est = np.array([back[j] for j in jj])
        order_r, order_e = np.argsort(ref), np.argsort(est)
        m = mir_eval.util.match_events(ref[order_r], est[order_e], window)
        pairs += [(ii[order_r[a]], jj[order_e[b]]) for a, b in m]
    return sum(b is None for b in back), pairs


def cmd_score(pred_path, inp_path, clip):
    truth = load_truth(clip)
    _, inp = notes_of(inp_path)
    _, pred = notes_of(pred_path)
    n_outside, pairs = match(inp, pred)
    mel = {i for i, _ in pairs}
    lab = [dict(n, voice="melody" if i in mel else "bass") for i, n in enumerate(inp)]
    acc = voice_accuracy(lab, truth["notes"])
    return {"pred": pred_path, "input": inp_path, "clip": clip, "n_input_notes": len(inp), "n_pred_notes": len(pred),
            "n_input_bars_with_notes": len(input_bars(inp)[1]), "n_pred_outside_those_bars": n_outside,
            "n_pred_matched_to_input": len(pairs), "n_pred_unmatched": len(pred) - len(pairs),
            "n_labelled_melody": len(mel), "n_labelled_bass": len(inp) - len(mel),
            "vs_truth": {"n_matched": acc["n_matched"], "n_right_voice": acc.get("n_voice_agree"),
                         "confusion": acc.get("confusion")}}


def cmd_selftest(ind, work):
    os.makedirs(work, exist_ok=True)
    res = []
    for clip in ("S2n", "S5dropd"):
        truth = load_truth(clip)
        tmel = [n for n in truth["notes"] if n["voice"] == "melody"]
        for f in (f"{clip}_truth_merged_480tpb.mid", f"{clip}_basicpitch_480tpb.mid", f"{clip}_basicpitch_112bpm_480tpb.mid"):
            pm, inp = notes_of(os.path.join(ind, f))
            iv = np.array([[n["onset"], n["offset"]] for n in tmel])
            hz = np.array([440.0 * 2 ** ((n["pitch"] - 69) / 12) for n in tmel])
            eiv = np.array([[n["onset"], max(n["offset"], n["onset"] + 0.001)] for n in inp])
            ehz = np.array([440.0 * 2 ** ((n["pitch"] - 69) / 12) for n in inp])
            m = mir_eval.transcription.match_notes(iv, hz, eiv, ehz, onset_tolerance=0.05, pitch_tolerance=50.0,
                                                   offset_ratio=None)
            keep = sorted(j for _, j in m)
            q, bars = input_bars(inp)
            fake = pretty_midi.PrettyMIDI(resolution=480)
            inst = pretty_midi.Instrument(program=0)
            for j in keep:
                tick = (bars.index(q[j] // 1920) + 1) * 1920 + q[j] % 1920
                inst.notes.append(pretty_midi.Note(velocity=80, pitch=inp[j]["pitch"], start=fake.tick_to_time(tick),
                                                   end=fake.tick_to_time(tick + 240)))
            fake.instruments.append(inst)
            fp = os.path.join(work, f.replace(".mid", "_fake_melody.mid"))
            fake.write(fp)
            r = cmd_score(fp, os.path.join(ind, f), clip)
            r["fake_prediction_notes"] = len(keep)
            res.append(r)
            print(json.dumps(r))
    return res


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "inputs":
        cmd_inputs(a[1])
    elif a[0] == "score":
        r = cmd_score(a[1], a[2], a[3])
        print(json.dumps(r))
        if "--out" in a:
            with open(a[a.index("--out") + 1], "w") as f:
                json.dump(r, f, indent=1)
    elif a[0] == "selftest":
        out = cmd_selftest(a[1], a[2])
        with open(os.path.join(a[2], "selftest.json"), "w") as f:
            json.dump(out, f, indent=1)
