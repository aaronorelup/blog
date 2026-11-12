"""verify-trials-source-separation: re-check of the Demucs 4.0.1 + torchaudio 2.11 + torchcodec writer claim.

Usage: python -I verify-trials-demucs401-io.py <input wav> <out dir>
Calls demucs.audio.save_audio (demucs 4.0.1, the CLI's writer) on the first second of the input three times, the way
demucs.separate passes its options: (as_float=False, bits_per_sample=16) for the default, (bits_per_sample=24) for
--int24, (as_float=True, bits_per_sample=32) for --float32; then reports bytes and the WAV fmt chunk (format tag, bits per sample), parsed here without soundfile (the
frozen 4.0.1 venv has no soundfile; the verifier read the same files back with soundfile from the gtr-eval venv).
Also reports demucs.separate.load_track's shape/dtype and which libav* libraries are mapped into the process."""
import sys, os, re, struct, warnings
import torch, torchaudio, demucs
from demucs.separate import load_track
from demucs.audio import save_audio

inp, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
print("demucs", demucs.__version__, "torch", torch.__version__, "torchaudio", torchaudio.__version__)
wav = load_track(inp, 2, 44100)
print("load_track:", tuple(wav.shape), wav.dtype)
for tag, kw in (("int16", dict(as_float=False, bits_per_sample=16)),
                ("int24", dict(as_float=False, bits_per_sample=24)),
                ("float32", dict(as_float=True, bits_per_sample=32))):
    p = os.path.join(out, f"save_{tag}.wav")
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        save_audio(wav[:, :44100], p, samplerate=44100, **kw)
    raw = open(p, "rb").read(); i = raw.find(b"fmt ")
    fmt_tag, ch, sr, _, _, bits = struct.unpack("<HHIIHH", raw[i + 8:i + 24])
    print(tag, kw, "->", os.path.getsize(p), "bytes, fmt tag", fmt_tag, "(1 = PCM, 3 = IEEE float)", "bits", bits,
          "| warnings:", sorted(set(str(x.message)[:90] for x in w)))
libs = sorted(set(l.split()[-1] for l in open("/proc/self/maps") if re.search(r"libavformat|libtorchcodec_core", l)))
print("mapped:", libs)
