"""Run Demucs htdemucs with the barvarvara/demucs-guitar-lora PEFT LoRA adapter merged in.

Usage: python -I demucs_lora.py <adapter dir> <input wav> <out dir>
Follows the model card (https://huggingface.co/barvarvara/demucs-guitar-lora):
  base = pretrained.get_model('htdemucs').models[0]; model = PeftModel.from_pretrained(base, './adapter')
then merge_and_unload() so demucs.apply.apply_model can use it, and the same normalisation as `demucs` 4.1.0's
separate.py (subtract the mono mean, divide by the mono std, undo afterwards). apply_model settings are the CLI
defaults: shifts=1, split=True, overlap=0.25. Writes one PCM_16 WAV per source (the base model's source names) and
prints the source names and the time taken.
"""
import sys, os, time
import numpy as np
import soundfile as sf
import torch
from demucs.pretrained import get_model
from demucs.apply import apply_model
from peft import PeftModel

adapter_dir, wav_in, out_dir = sys.argv[1:4]
t0 = time.time()
base = get_model("htdemucs").models[0]
model = PeftModel.from_pretrained(base, adapter_dir)
model = model.merge_and_unload()
model.eval()
t_load = time.time() - t0
x, sr = sf.read(wav_in, dtype="float32", always_2d=True)
assert sr == model.samplerate, (sr, model.samplerate)
wav = torch.from_numpy(x.T.copy())
ref = wav.mean(0)
mu, sd = ref.mean(), ref.std()
t1 = time.time()
with torch.no_grad():
    sources = apply_model(model, ((wav - mu) / sd)[None], device="cpu", shifts=1, split=True, overlap=0.25,
                          progress=False)[0]
sources = sources * sd + mu
t_sep = time.time() - t1
os.makedirs(out_dir, exist_ok=True)
for name, src in zip(model.sources, sources):
    sf.write(os.path.join(out_dir, f"{name}.wav"), np.clip(src.numpy().T, -1, 1), sr, subtype="PCM_16")
print(f"sources {list(model.sources)} load+merge {t_load:.1f} s separate {t_sep:.1f} s")
