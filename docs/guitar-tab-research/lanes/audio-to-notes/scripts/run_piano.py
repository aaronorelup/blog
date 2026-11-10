"""Piano-trained transcribers run on guitar clips (the weights were trained on piano recordings).

usage: python run_piano.py <bytedance|transkun> <outdir> [--clips S1,S2n,...]
bytedance: piano_transcription_inference 0.0.6, PianoTranscription(model_type='Note_pedal', device='cpu',
           checkpoint_path=<Zenodo record 4034264 checkpoint>) on librosa.load(path, sr=16000, mono=True)
transkun:  transkun 2.0.1 CLI `transkun <in.wav> <out.mid> --device cpu` (bundled pretrained/2.0.pt), run as a
           subprocess per clip
Per clip: <clip>.mid, <clip>.notes.csv (onset_s,offset_s,pitch_midi,velocity), timings.json (per-clip seconds).
"""
import argparse
import json
import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import CLIPS, midi_notes, write_notes_csv  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("tool")
ap.add_argument("outdir")
ap.add_argument("--clips", default="S1,S2n,S3,R1a,R1b,R1c")
a = ap.parse_args()
os.makedirs(a.outdir, exist_ok=True)
rec = {"tool": a.tool, "clips": {}}
t0 = time.perf_counter()
if a.tool == "bytedance":
    import torch
    torch.set_num_threads(2)
    from piano_transcription_inference import PianoTranscription, sample_rate, load_audio
    CK = "/home/user/gtr/lanes/audio-to-notes/dl/bytedance/note_F1=0.9677_pedal_F1=0.9186.pth"
    tr = PianoTranscription(model_type="Note_pedal", device="cpu", checkpoint_path=CK)
    rec["settings"] = {"model_type": "Note_pedal", "checkpoint": os.path.basename(CK), "sample_rate": sample_rate,
                       "device": "cpu"}
rec["setup_s"] = round(time.perf_counter() - t0, 3)
for clip in a.clips.split(","):
    path = CLIPS[clip]
    mid = os.path.join(a.outdir, f"{clip}.mid")
    t1 = time.perf_counter()
    if a.tool == "bytedance":
        # the package's own load_audio() fails with librosa 0.11 (it calls librosa.core.audio.util.buf_to_float,
        # which no longer exists), so the audio is read with librosa.load at the package's sample rate instead
        import librosa
        audio, _ = librosa.load(path, sr=sample_rate, mono=True)
        d = tr.transcribe(audio, mid)
        extra = {"n_pedal_events": len(d.get("est_pedal_events", []) or [])}
    else:
        r = subprocess.run([os.path.join(os.path.dirname(sys.executable), "transkun"), path, mid, "--device", "cpu"],
                           capture_output=True, text=True)
        extra = {"returncode": r.returncode, "stderr_tail": r.stderr[-400:]}
    dt = time.perf_counter() - t1
    notes = midi_notes(mid) if os.path.exists(mid) else []
    write_notes_csv(os.path.join(a.outdir, f"{clip}.notes.csv"), notes)
    rec["clips"][clip] = dict(input=path, seconds=round(dt, 3), n_notes=len(notes), **extra)
    print(clip, rec["clips"][clip], flush=True)
with open(os.path.join(a.outdir, "timings.json"), "w") as fh:
    json.dump(rec, fh, indent=1)
