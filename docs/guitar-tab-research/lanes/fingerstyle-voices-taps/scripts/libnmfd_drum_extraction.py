"""libnmfd 1.0.0 drum extraction, following the package's own demo notebook
demo_drum_extraction_kam_nmf_perc_threshold.ipynb (https://github.com/groupmm/libnmfd, branch main, read 2026-11-10)
step by step, with only the input file and output paths changed.

Usage: python libnmfd_drum_extraction.py <input wav> <out dir>
Steps (demo values): STFT block 2048 hop 512 -> hpss_kam_fitzgerald(A, num_iter=30, kern_dim=13) -> resynthesize
the two KAM parts (index 0 percussive, 1 harmonic, per the function's docstring) -> stack [kam_A[0]; kam_A[1]] ->
nmfd(num_comp=30, num_iter=60, num_template_frames=1, random templates, uniform activations,
func_preprocess=drum_specific_soft_constraints_nmf, kern=kern, decay=0.75) -> percussiveness_estimation ->
threshold 0.25 -> conv_model for the percussive and harmonic parts -> fold the stacking back -> alpha_wiener_filter
(alpha 1.0) -> resynthesize. Writes kam_percussive.wav, kam_harmonic.wav, nmf_percussive.wav, nmf_harmonic.wav
(float32, input rate) and libnmfd_summary.json.
Random templates: init_templates(strategy='random') draws from numpy's global generator; this script seeds it with
np.random.seed(0) before the call (the demo does not seed).
"""
import json
import os
import sys
import time

import numpy as np
import soundfile as sf
from libnmfd.core.nmfconv import conv_model, init_activations, init_templates, nmfd
from libnmfd.dsp.algorithms import hpss_kam_fitzgerald
from libnmfd.dsp.filters import alpha_wiener_filter
from libnmfd.dsp.transforms import forward_stft, inverse_stft
from libnmfd.utils import make_monaural
from libnmfd.utils.core_utils import drum_specific_soft_constraints_nmf, percussiveness_estimation

inp, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
summ = {"input": inp}
t0 = time.time()
x, fs = sf.read(inp)
x = make_monaural(x)
BLOCK_SIZE, HOP_SIZE = 2048, 512
X, A, P = forward_stft(x, block_size=BLOCK_SIZE, hop_size=HOP_SIZE, reconst_mirror=True, append_frames=True)
num_bins, num_frames = X.shape
kam_A, kern, kern_ord = hpss_kam_fitzgerald(X=A, num_iter=30, kern_dim=13)
for k, name in ((0, "kam_percussive"), (1, "kam_harmonic")):
    y, _ = inverse_stft(X=kam_A[k] * np.exp(1j * P), block_size=BLOCK_SIZE, hop_size=HOP_SIZE, reconst_mirror=True,
                        append_frames=True, num_samp=len(x))
    sf.write(os.path.join(out, name + ".wav"), np.asarray(y, dtype=np.float32).reshape(-1), fs, subtype="FLOAT")
summ["kam_seconds"] = round(time.time() - t0, 2)
t1 = time.time()
V = np.concatenate([kam_A[0], kam_A[1]])
num_double_bins = V.shape[0]
accu_mat = np.concatenate([np.eye(num_bins), np.eye(num_bins)], axis=1)
num_iter_nmf, num_comp, num_template_frames = 60, 30, 1
np.random.seed(0)
init_W = init_templates(num_comp=num_comp, num_bins=num_double_bins, num_template_frames=num_template_frames,
                        strategy="random")
init_H = init_activations(num_comp=num_comp, num_frames=num_frames, strategy="uniform")
nmfd_W, nmfd_H, _, _, tensor_W = nmfd(V=V, num_comp=num_comp, num_frames=num_frames, num_iter=num_iter_nmf,
                                      num_template_frames=num_template_frames, init_W=init_W, init_H=init_H,
                                      num_bins=num_double_bins, func_preprocess=drum_specific_soft_constraints_nmf,
                                      kern=kern, decay=0.75)
perc_weight = percussiveness_estimation(tensor_W)
summ["percussiveness_per_component_sorted"] = [round(float(v), 4) for v in sorted(perc_weight, reverse=True)]
perc_bin = np.where(perc_weight > 0.25, 1.0, 0.0)
summ["n_components_above_0.25"] = int(perc_bin.sum())
Vp = conv_model(W=tensor_W, H=np.diag(perc_bin) @ nmfd_H)
Vh = conv_model(W=tensor_W, H=np.diag(1 - perc_bin) @ nmfd_H)
Ap, Ah = accu_mat @ Vp, accu_mat @ Vh
nmfd_A, _ = alpha_wiener_filter(mixture_X=A, source_A=[Ap, Ah], alpha=1.0)
for k, name in ((0, "nmf_percussive"), (1, "nmf_harmonic")):
    y, _ = inverse_stft(X=nmfd_A[k] * np.exp(1j * P), block_size=BLOCK_SIZE, hop_size=HOP_SIZE, reconst_mirror=True,
                        append_frames=True, num_samp=len(x))
    sf.write(os.path.join(out, name + ".wav"), np.asarray(y, dtype=np.float32).reshape(-1), fs, subtype="FLOAT")
summ["nmf_seconds"] = round(time.time() - t1, 2)
json.dump(summ, open(os.path.join(out, "libnmfd_summary.json"), "w"), indent=1)
print(json.dumps(summ))
