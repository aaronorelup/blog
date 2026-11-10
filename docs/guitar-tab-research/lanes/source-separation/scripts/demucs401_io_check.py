"""I/O-only check of demucs 4.0.1 with the current torchaudio (no model is loaded or run).
Usage: python -I demucs401_io_check.py <input wav> <out dir>
1. demucs.separate.load_track (the CLI's reader: ffmpeg through demucs.audio.AudioFile, torchaudio as fallback)
2. demucs.audio.save_audio on the first second, as int16 WAV (the CLI's default writer)
Prints versions and either the result or the exception (type and message) of each step."""
import sys, os, traceback
import torch, torchaudio, demucs
from demucs.separate import load_track
from demucs.audio import save_audio

inp, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
print("demucs", demucs.__version__, "torch", torch.__version__, "torchaudio", torchaudio.__version__)
try:
    wav = load_track(inp, 2, 44100)
    print("load_track OK:", tuple(wav.shape), wav.dtype)
except BaseException as e:
    print("load_track FAILED:", type(e).__name__, str(e)[:300]); wav = torch.zeros(2, 44100)
try:
    save_audio(wav[:, :44100], os.path.join(out, "save_check.wav"), samplerate=44100, bits_per_sample=16)
    print("save_audio OK:", os.path.getsize(os.path.join(out, "save_check.wav")), "bytes")
except BaseException as e:
    print("save_audio FAILED:", type(e).__name__, str(e)[:300])
    tb = traceback.extract_tb(e.__traceback__)
    print("  raised at:", " <- ".join(f"{os.path.basename(f.filename)}:{f.lineno}" for f in tb[-3:]))
