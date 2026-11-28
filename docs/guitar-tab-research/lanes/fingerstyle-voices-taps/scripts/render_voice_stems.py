"""Render one-voice reference stems (melody alone, bass alone) of an S2-family clip from the clip's own MIDI file.

Usage: python render_voice_stems.py <clip id> <out dir>
How: the clip's MIDI (/home/user/gtr/inputs/<id>/<id>.mid) has one track per part ('melody', 'bass', and 'taps'
in S6taps). For each of melody and bass, a copy of the MIDI with the other note tracks removed (tempo track
kept) is rendered with the inputs builder's exact FluidSynth command (make_synth.py: fluidsynth -ni -q -T wav
-O float -r 44100 -g 0.5 -R 1 -C 0 -o synth.polyphony=1024 -F out.wav FluidR3_GM.sf2 in.mid), cut or padded to
the clip's sample count, multiplied by the clip's 'gain_applied' from /home/user/gtr/inputs/_checks/
synth_checks.json and written as 16-bit stereo WAV, like the builder's stems. Then checks: melody + bass (+ the
clip's taps stem for S6taps) against the clip's mix: largest absolute sample difference as a fraction of the
mix peak.
"""
import json
import os
import subprocess
import sys
import tempfile

import mido
import numpy as np
import soundfile as sf

cid, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
src = f"/home/user/gtr/inputs/{cid}/{cid}.mid"
mix, sr = sf.read(f"/home/user/gtr/inputs/{cid}/{cid}.wav", dtype="float64", always_2d=True)
checks = json.load(open("/home/user/gtr/inputs/_checks/synth_checks.json"))
entry = checks[cid] if isinstance(checks, dict) and cid in checks else None
if entry is None:  # the file may be a list or nested; search for the clip's entry
    def find(o):
        if isinstance(o, dict):
            if o.get("id") == cid and "gain_applied" in o:
                return o
            for v in o.values():
                r = find(v)
                if r:
                    return r
        if isinstance(o, list):
            for v in o:
                r = find(v)
                if r:
                    return r
    entry = find(checks)
gain = float(entry["gain_applied"])
n = len(mix)
FLUID = ["fluidsynth", "-ni", "-q", "-T", "wav", "-O", "float", "-r", "44100", "-g", "0.5", "-R", "1", "-C", "0",
         "-o", "synth.polyphony=1024"]
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
mf = mido.MidiFile(src)
names = [next((m.name for m in t if m.type == "track_name"), None) for t in mf.tracks]
res = {"clip": cid, "gain_applied": gain, "n_samples": n, "midi_tracks": names, "stems": {}}
arrs = {}
with tempfile.TemporaryDirectory() as td:
    for voice in ("melody", "bass"):
        m2 = mido.MidiFile(type=mf.type, ticks_per_beat=mf.ticks_per_beat)
        for t, nm in zip(mf.tracks, names):
            if nm in (voice, "tempo map") or nm is None:
                m2.tracks.append(t)
        p = os.path.join(td, f"{voice}.mid")
        m2.save(p)
        w = os.path.join(td, f"{voice}.wav")
        subprocess.run(FLUID + ["-F", w, SF2, p], check=True, capture_output=True)
        x, _ = sf.read(w, dtype="float64", always_2d=True)
        x = np.vstack([x, np.zeros((max(0, n - len(x)), 2))])[:n] * gain
        arrs[voice] = x
        sf.write(os.path.join(out, f"{voice}.wav"), x, sr, subtype="PCM_16")
        sf.write(os.path.join(out, f"{voice}.mono.wav"), x.mean(axis=1), sr, subtype="PCM_16")
        res["stems"][voice] = {"tracks_kept": [nm for nm in names if nm in (voice, "tempo map") or nm is None],
                               "rms_dbfs": round(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12), 2)}
total = arrs["melody"] + arrs["bass"]
if os.path.exists(f"/home/user/gtr/inputs/{cid}/stems/taps.wav"):
    taps, _ = sf.read(f"/home/user/gtr/inputs/{cid}/stems/taps.wav", dtype="float64", always_2d=True)
    total = total + taps[:n]
    res["sum_includes_taps_stem"] = True
res["max_abs_diff_sum_vs_mix_fraction_of_mix_peak"] = float(np.max(np.abs(total - mix)) / np.max(np.abs(mix)))
json.dump(res, open(os.path.join(out, "render_voice_stems.json"), "w"), indent=1)
print(json.dumps(res))
