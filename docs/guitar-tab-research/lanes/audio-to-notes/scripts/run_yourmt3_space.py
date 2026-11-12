"""YourMT3+ through its author's public Hugging Face Space (mimbres/YourMT3), with gradio_client.

usage: python run_yourmt3_space.py <outdir> <clip> [<clip> ...]
For each clip: uploads the clip's WAV to the Space's /process_audio endpoint, saves the returned HTML, pulls the MIDI
out of the HTML (the Space embeds it as a base64 data URL), and writes <clip>.mid and <clip>.notes.csv. Before and
after the calls it records the Space's runtime (stage, hardware, git sha) from https://huggingface.co/api/spaces/.
The inference runs on the Space's hardware, not on this box.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import CLIPS, midi_notes, write_notes_csv  # noqa: E402
from gradio_client import Client, handle_file  # noqa: E402

SPACE = "mimbres/YourMT3"
out = sys.argv[1]
clips = sys.argv[2:]
os.makedirs(out, exist_ok=True)


def runtime():
    with urllib.request.urlopen(f"https://huggingface.co/api/spaces/{SPACE}") as r:
        d = json.load(r)
    return {"stage": d["runtime"]["stage"], "hardware": d["runtime"]["hardware"], "sha": d["runtime"].get("sha"),
            "lastModified": d.get("lastModified")}


rec = {"space": SPACE, "runtime_before": runtime(), "clips": {}}
c = Client(SPACE, verbose=False)
for clip in clips:
    t0 = time.perf_counter()
    try:
        html = c.predict(handle_file(CLIPS[clip]), api_name="/process_audio")
        err = None
    except Exception as e:  # keep the error text
        html, err = None, repr(e)[:600]
    dt = time.perf_counter() - t0
    info = {"input": CLIPS[clip], "seconds_round_trip": round(dt, 2), "error": err}
    if html:
        with open(os.path.join(out, f"{clip}.html"), "w") as f:
            f.write(html)
        m = re.search(r"data:audio/midi;base64,([A-Za-z0-9+/=]+)", html) or \
            re.search(r"data:[a-z/\-]*;base64,([A-Za-z0-9+/=]+)", html)
        if m:
            mid = os.path.join(out, f"{clip}.mid")
            with open(mid, "wb") as f:
                f.write(base64.b64decode(m.group(1)))
            import pretty_midi
            pm = pretty_midi.PrettyMIDI(mid)
            info["instruments"] = [{"program": i.program, "is_drum": i.is_drum, "name": i.name,
                                    "n_notes": len(i.notes)} for i in pm.instruments]
            notes = midi_notes(mid)
            write_notes_csv(os.path.join(out, f"{clip}.notes.csv"), notes)
            info["n_notes_non_drum"] = len(notes)
        else:
            info["note"] = "no base64 MIDI found in the returned HTML"
    rec["clips"][clip] = info
    print(clip, info, flush=True)
rec["runtime_after"] = runtime()
with open(os.path.join(out, "space_calls.json"), "w") as f:
    json.dump(rec, f, indent=1)
