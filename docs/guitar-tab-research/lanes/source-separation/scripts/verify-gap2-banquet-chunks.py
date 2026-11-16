"""verify-gapfill-source-separation (round 2, resumed 2026-11-12): how many chunks Banquet's `chunked_inference`
cuts S4 into. This re-types the arithmetic and tensor steps of `core/models/ebase.py` `chunked_inference`
(query-bandit head 79ed5bb, lines 263-299 and 321-333) with plain torch on a zero signal of S4's length; no code
of the repository is imported or run, and no model is involved.  Usage: python verify-gap2-banquet-chunks.py OUT.json
"""
import json
import math
import sys

import torch
import torch.nn.functional as F

fs = 44100
chunk_size = int(6.0 * fs)          # config/data/moisesdb-test.yml inference_kwargs.chunk_size_seconds
hop_size = int(0.5 * fs)            # inference_kwargs.hop_size_seconds
n_samples = 1708495                 # S4.wav frames (soundfile)
c = 2
overlap = chunk_size - hop_size
scaler = chunk_size / (2 * hop_size)
n_chunks_formula = int(math.ceil((n_samples + 4 * overlap - chunk_size) / hop_size)) + 1
pad = (n_chunks_formula - 1) * hop_size + chunk_size - n_samples

audio = torch.zeros(1, c, n_samples)
audio = F.pad(audio, pad=(2 * overlap, 2 * overlap + pad), mode="reflect")
padded_length = audio.shape[-1]
audio = audio.reshape(c, 1, -1, 1)
chunked = F.unfold(audio, kernel_size=(chunk_size, 1), stride=(hop_size, 1))
chunked = chunked.permute(2, 0, 1).reshape(-1, c, chunk_size)
n_chunks_unfold = chunked.shape[0]

# fold back (as the code does after the forward passes) and trim, to check the output length
out = chunked * torch.hann_window(chunk_size).reshape(1, 1, chunk_size) / scaler
out = torch.permute(out, (1, 2, 0))
out = F.fold(out, output_size=(padded_length, 1), kernel_size=(chunk_size, 1), stride=(hop_size, 1))
out = out[None, :, 0, 2 * overlap: n_samples + 2 * overlap, 0]

res = {
    "chunk_size": chunk_size, "hop_size": hop_size, "overlap": overlap, "scaler": scaler,
    "n_samples": n_samples, "n_chunks_formula": n_chunks_formula, "pad": pad,
    "padded_length": padded_length, "n_chunks_after_unfold": n_chunks_unfold,
    "batches_of_12": math.ceil(n_chunks_unfold / 12), "output_shape": list(out.shape),
    "torch": torch.__version__,
}
print(json.dumps(res, indent=1))
with open(sys.argv[1], "w") as f:
    json.dump(res, f, indent=1)
