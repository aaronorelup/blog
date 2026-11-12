"""Gap round 2, item A3: facts of the CREPE Notes outputs (MIDI layout, note counts, printed tuning offset, scores).

usage: <gtr-eval venv python> -I crepenotes_facts.py <out/crepe-notes dir>
Reads <cfg>/<clip>.<cfg>.mid, <cfg>/<clip>.<cfg>.log and <cfg>/<clip>.<cfg>.notes-score.json (gtr-eval output) and
prints one JSON object per line; the eval id is looked up in the gtr-eval ledger by the estimate's SHA-256.
"""
import hashlib
import json
import os
import re
import sys

import mido
import pretty_midi

root = sys.argv[1]
ledger = [json.loads(l) for l in open("/home/user/gtr/eval/ledger/evals.jsonl")]
for cfg in ("tcfull", "tctiny", "tcfullz"):
    for clip in ("S1", "R1b", "S4lead"):
        base = os.path.join(root, cfg, f"{clip}.{cfg}")
        mid = base + ".mid"
        sha = hashlib.sha256(open(mid, "rb").read()).hexdigest()
        pm = pretty_midi.PrettyMIDI(mid)
        mf = mido.MidiFile(mid)
        notes = sorted((n for i in pm.instruments for n in i.notes), key=lambda n: (n.start, n.pitch))
        log = open(base + ".log").read()
        m = re.search(r"Tuning offset: ([-0-9.e]+) cents", log)
        sc = json.load(open(base + ".notes-score.json"))
        eid = [e["id"] for e in ledger if e.get("result", {}).get("est", {}).get("sha256") == sha
               and e.get("exit_code") == 0]
        met = sc["metrics"]
        print(json.dumps({
            "cfg": cfg, "clip": clip, "eval_ids": eid,
            "tuning_offset_cents_printed": float(m.group(1)) if m else None,
            "midi": {"type": mf.type, "ticks_per_beat": mf.ticks_per_beat, "tracks": len(mf.tracks),
                     "programs": sorted({i.program for i in pm.instruments}),
                     "is_drum": [i.is_drum for i in pm.instruments],
                     "tempo_bpm": [round(float(x), 3) for x in pm.get_tempo_changes()[1]],
                     "n_notes": len(notes), "velocity_range": [min(n.velocity for n in notes), max(n.velocity for n in notes)] if notes else None,
                     "first_notes": [[round(n.start, 3), round(n.end, 3), n.pitch, n.velocity] for n in notes[:6]]},
            "counts": sc["counts"],
            "onset_only": met["onset_only"], "onset_offset_f1": met["onset_offset"]["f1"] if met.get("onset_offset") else None,
            "median_onset_diff": met["onset_timing_of_matched"]["median_s"] if met.get("onset_timing_of_matched") else None,
            "recall_by_voice": met.get("recall_by_voice"),
        }, default=lambda o: o.item()))
