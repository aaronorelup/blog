# Source separation: trials

Lane `source-separation`, agent `try-source-separation`, started 2026-11-10 20:52 UTC. Everything below was run on the
shared box (4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU). Timed runs went through `gtr-run`, which pins a job to
one slot of 2 cores; no 4-core (`--all-cores`) run was made (corrected in gap round 2: three 4-core runs were made
then, r0659, r0660 and r0669, under "Gap round 2"; that section also shows that ONNX Runtime's default threads left
the slot in four first-round runs). Every run id (r0xxx) is a line in
`/home/user/gtr/ledger/runs.jsonl`, every scoring id (e0xxx) a line in the gtr-eval ledger
(`/home/user/gtr/eval/ledger/evals.jsonl`). The first runs (r0019 to r0147) each took a slot. The trial agent
reports that from about 21:05 UTC the slots were queued 15 to 20 jobs deep (its own count at the time; no log of it
was kept). The run ledger only holds jobs that finished; counted from it (`started_utc` minus `lock_wait_s`), at most
8 jobs were waiting for a slot at the same moment between 20:50 and 23:30 UTC (at 21:04; sampled every 10 s), and 6
at each 5-minute mark from 21:35 to 21:55 (verifier's count). The later runs were grouped into three batch jobs
(r0478, r0493, r0510), each holding one 2-core slot, inside which every item was logged with `gtr-run --nolock`
(details under "Demucs
4.1.0, further runs"). The box was shared with about 20 agents throughout: the 1-minute load averages at run start
listed below run from 2.4 to 10.3 (17.4 and 19.6 for the two unpinned HPSS runs), so wall-clock times are single
runs on a busy machine, with CPU time beside them. Estimated stems are in
`/home/user/gtr/lanes/source-separation/out/<model>/<clip>/` for other lanes to use (index near the end).
Sections and lines marked "verifier" were added by `verify-trials-source-separation`; the log of that check is at
the end.

How stems are scored: `gtr-eval stems` (gtr-eval 0.11.1) averages every signal to mono, resamples to 44.1 kHz if
needed, trims to the shortest length, then reports SI-SDR (computed by gtr-eval: mean removed,
target = (<est,ref>/<ref,ref>) ref, 10 log10(|target|^2/|est-target|^2)) and mir_eval 0.8.2
`bss_eval_sources` SDR / SIR / SAR (512-tap filter, whole signal, one joint call over all scored stems unless
`--sdr-mode single` is stated). No time alignment is searched. References: the S4 and S6taps truth stems; for R2, the
artist's instrumental version and the song-minus-instrumental vocal (`R2/stems/`). These are measurements on single
clips, not a ranking. "Projection" below means <est, ref> / <ref, ref> on mono signals (`scripts/stem_facts.py`):
the share, by amplitude projection, of a true stem found in an estimated stem.

Scripts are in `scripts/`, small text samples in `samples/<tool>/`, scoring outputs in `samples/scores/`. Audio stays
outside git (list at the end).

## Open-Unmix (openunmix 1.3.0, `umx` CLI)

- **What:** spectrogram-mask source separation into vocals / drums / bass / other, one network per target, from
  sigsep/open-unmix-pytorch (https://github.com/sigsep/open-unmix-pytorch), PyPI `openunmix` 1.3.0 (uploaded
  2024-04-16). Tried 2026-11-10.
- **License (code):** the repository LICENSE reads "MIT License ... Copyright (c) 2019 Inria (Fabian-Robert Stöter,
  Antoine Liutkus)" (https://raw.githubusercontent.com/sigsep/open-unmix-pytorch/master/LICENSE, read 2026-11-10).
  **Weights:** the README says of `umxl`: "trained on private stems dataset of compressed stems. __Note, that the
  weights are only licensed for non-commercial use (CC BY-NC-SA 4.0).__"
  (https://raw.githubusercontent.com/sigsep/open-unmix-pytorch/master/README.md, read 2026-11-10). The Zenodo API
  metadata (read 2026-11-10) gives license id `cc-by-nc-sa-4.0` for record 5069601 ("Open-Unmix-Pytorch UMX-L") and
  `mit-license` for record 3370489 ("Open-Unmix-Pytorch UMX-HQ").
- **Install (worked):** `uv venv --python 3.11 venv-umx && uv pip install openunmix==1.3.0` (pulled torch
  2.15.0+cpu, torchaudio 2.11.1+cpu, numpy 2.4.6), then `uv pip install torchcodec` (0.17.0+cpu). Venv 895 MB
  by du (hard-linked from the shared uv cache). Freeze: `samples/openunmix/uv-pip-freeze.txt`. The venv
  was deleted afterwards for disk space.
- **Dead end:** without torchcodec the first run (r0051, exit 1, 2.91 s) stopped in `openunmix/data.py`
  `torchaudio.load(path)`: "ImportError: TorchCodec is required for load_with_torchcodec. Please install torchcodec
  to use this function." (torchaudio 2.11 routes `load` and `save` through torchcodec). Installing torchcodec fixed
  it. No other change was needed. (The log of r0051 was overwritten by the next run; the verifier reproduced the
  same message in the re-created venv by hiding torchcodec from `torchaudio.load`, and the matching one for
  `torchaudio.save`: "TorchCodec is required for save_with_torchcodec. Please install torchcodec to use this
  function."; `openunmix/data.py` line 58 is `sig, rate = torchaudio.load(path)`.)
- **Which FFmpeg torchcodec uses (checked by the verifier):** after a `torchaudio.load` in this venv the process had
  `torchcodec/libtorchcodec_core6.so` and the system's FFmpeg 6 libraries mapped
  (`/usr/lib/x86_64-linux-gnu/libavformat.so.60.16.100`, `libavcodec.so.60.31.102`, `libavutil.so.58.29.100`,
  `libswresample.so.4.12.100`, from `/proc/self/maps`). The WAVs `umx` wrote carry a 34-byte `LIST`/`INFO` chunk with
  `ISFT` = "Lavf60.16.100", which is why they are 34 bytes larger than the input (6,834,058 vs 6,834,024 bytes for S4).
- **Weights downloaded** (torch hub cache, fetched on first use from Zenodo): `umxhq` = 4 files of 35,637,796 bytes
  each (`bass-8d85a5bd.pth`, `drums-9619578f.pth`, `other-b52fbbf7.pth`, `vocals-b62c91ce.pth`) from
  `https://zenodo.org/records/3370489/files/...`; `umxl` = 4 files of 113,101,348 bytes each (`bass-2ca1ce51.pth`,
  `drums-69e0ebd4.pth`, `other-c8c5b3e6.pth`, `vocals-bccbd9aa.pth`) from `https://zenodo.org/records/5069601/files/...`.
  Parameter counts printed by the loaded separators: umxhq 35,577,488, umxl 113,032,848 (umxhq re-counted by the
  verifier; umxl not, its weights were deleted from the cache). All eight file sizes and both Zenodo license ids
  were re-read from the Zenodo API by the verifier.
- **Runs** (command: `umx --model <umxhq|umxl> --no-cuda --outdir out/<model> <clip>.wav`, all other options at
  their defaults: `--niter 1`, `--wiener-win-len 300`, no `--residual`, `--ext .wav`; script
  `scripts/umx_batch.sh`; 2 cores each):

| run | model | clip (length) | wall s | CPU s | peak RSS MB | load1 at start | note |
|---|---|---|---|---|---|---|---|
| r0085 | umxhq | S4 (38.7 s) | 28.82 | 37.4 | 1617.1 | 6.33 | |
| r0101 | umxl | S4 (38.7 s) | 127.36 | 129.9 | 1991.2 | 5.66 | |
| r0106 | umxhq | R2 (36.0 s) | 99.73 | 75.4 | 1549.3 | 7.69 | |
| r0115 | umxl | R2 (36.0 s) | 158.26 | 129.0 | 1912.9 | 10.17 | |
| r0147 | umxhq | S6taps (29.4 s) | 96.63 | 41.2 | 1401.6 | 6.99 | the umxhq weights had been deleted from the cache by this agent before this run, so its wall-clock includes re-downloading 4 x 35.6 MB from Zenodo (the log shows the four downloads) |

  load1 is the box's 1-minute load average when the run started (from the ledger); the box has 4 cores. Other lanes'
  jobs that do not go through `gtr-run` are not pinned, so a pinned run's wall-clock is not a single-tenant figure;
  CPU time is given beside it.
  **Verifier re-run of r0085** (r0539, same command with `--outdir` under `verify/out/`, cores 2-3, load1 3.67): wall
  19.54 s, CPU 29.9 s, peak RSS 1566.7 MB; all four stems are sample-identical to r0085's (max |diff| 0), and
  re-scoring them (e1592) gives exactly the e0076 numbers. The venv was re-created from `samples/openunmix/uv-pip-freeze.txt`
  (identical freeze) for this; 895 MB by `du` measured alone.
- **Output format:** one WAV per target, `vocals.wav`, `drums.wav`, `bass.wav`, `other.wav`, in
  `<outdir>/<input file stem>/`; read back with soundfile: 44,100 Hz, 2 channels, PCM_16, frame count equal to the
  input's (difference 0 on every file of every run); the sum of the four stems against the input mix:
  cross-correlation peak at lag 0 samples, residual -39.85 dB (umxhq, S4), -22.22 dB (umxl, S4), -42.83 dB (umxhq, S6taps), -35.35 dB (umxhq, R2),
  -39.97 dB (umxl, R2) (residual = 10 log10(|mix - sum|^2 / |mix|^2), mono, script `scripts/stem_facts.py`; full
  facts in `samples/openunmix/stemfacts_*.json`).
- **S4 (synthesized band, truth stems drums / bass / guitar / lead):** `gtr-eval stems` with the map drums=drums,
  bass=bass, guitar=other, lead=vocals. SI-SDR / SDR / SIR / SAR in dB:

| eval | model | drums | bass | guitar (= other) | lead (= vocals) |
|---|---|---|---|---|---|
| e0076 | umxhq | 3.58 / 3.90 / 11.16 / 5.13 | 2.58 / 4.68 / 11.11 / 6.12 | -1.99 / -1.66 / -1.36 / 13.85 | -39.95 / -13.66 / -4.22 / -7.52 |
| e0371 | umxl | 4.31 / 4.68 / 14.40 / 5.32 | 5.02 / 6.82 / 12.62 / 8.38 | -0.88 / -0.63 / -0.29 / 13.69 | -27.53 / -5.13 / 11.52 / -4.74 |

  Where the synthetic lead (GM "Voice Oohs") went: the projection of each estimated stem onto the true lead stem,
  <est, lead> / <lead, lead> (mono), is 0.9805 for `other` and 0.0001 for `vocals` with umxhq, 0.9053 for `other`
  and 0.0008 for `vocals` with umxl. The `vocals` stem's RMS level is -66.97 dBFS (umxhq) and -55.89 dBFS (umxl)
  against -17.37 dBFS for the mix. The true guitar's projection lands 0.8502 (umxhq) / 0.8886 (umxl) in `other`.
- **S6taps (guitar plus GM percussion taps, truth stems guitar / taps):** umxhq, map guitar=other, taps=drums
  (e0389): guitar 17.89 / 19.49 / 22.38 / 22.65, taps 2.71 / 4.35 / 7.37 / 8.08 (SI-SDR / SDR / SIR / SAR, dB).
  Projection of the true taps: 0.7573 in `drums`, 0.2538 in `other`; of the true guitar: 0.9745 in `other`, 0.0257
  in `drums`. Stem levels: drums -32.40, other -18.38, bass -67.37, vocals -64.49 dBFS (mix -18.03 dBFS).
- **R2 (real band excerpt, 36 s; no true stems, but the artist's instrumental version and the song-minus-instrumental
  vocal are in `R2/stems/`):** `derived_instrumental_sum.wav` = drums + bass + other (float32, `scripts/sum_stems.py`)
  scored against `instrumental`, and `vocals.wav` against `vocals_derived`: umxhq (e0397) instrumental 9.72 / 10.41 /
  17.76 / 11.36, vocals 11.76 / 12.22 / 17.49 / 13.82; umxl (e0398) instrumental 10.76 / 11.33 / 18.43 / 12.33, vocals
  12.73 / 13.35 / 19.33 / 14.67. Caveat: `vocals_derived` is a subtraction of two published mixes, not a stem the
  artist published (see INPUTS.md).
- **Input facts:** read WAV (16-bit, 44.1 kHz, stereo) through torchaudio/torchcodec; `--start` and `--duration`
  select a chunk. Mono input and other sample rates were not tried here.
- **Constraint inputs for a re-run:** `--targets` (which of the four to compute), `--residual <name>` (mix minus the
  computed targets as an extra stem), `--aggregate` (a dict that sums targets into new outputs), `--niter` (Wiener
  filter iterations), `--wiener-win-len`, `--start` / `--duration`, `--filterbank torch|asteroid`. No pitch, key,
  tuning or instrument-range parameters.
- **Oddities:** none besides the torchcodec requirement.
- **Independent check (verifier):** e0389 recomputed with `mir_eval.separation.bss_eval_sources` (mono, joint, no
  permutation) and a separate SI-SDR implementation (`scripts/verify-trials-audio-check.py metrics`): guitar 17.89 /
  19.49 / 22.38 / 22.65, taps 2.71 / 4.35 / 7.37 / 8.08, the same as gtr-eval.

## Demucs v4 (demucs 4.1.0): htdemucs, htdemucs_ft, htdemucs_6s, mdx_extra

- **What:** waveform plus spectrogram ("hybrid") source separation; v4 = Hybrid Transformer Demucs. PyPI `demucs`
  4.1.0 (uploaded 2026-07-11), homepage https://github.com/adefossez/demucs. The README (read 2026-11-10 at
  https://raw.githubusercontent.com/adefossez/demucs/main/README.md) says: "**This is the officially maintained
  Demucs** now that I (Alexandre Défossez) have left Meta to join [Kyutai]" and "11/07/2026: Released Demucs v4.1.0
  with modernized packaging, lighter inference dependencies, numerous fixes, and pretrained models hosted on Hugging
  Face." The release notes (`docs/release.md`, same date read) say: "**Removed torchaudio for inference**: audio
  decoding now goes through [sphn] with a fallback on ffmpeg for other formats. Wav files are written directly (16 /
  24 bits PCM or float32), flac encoding goes through ffmpeg" and "**Pretrained models are now hosted on the
  HuggingFace hub** (as safetensors ...)".
- **License** (README "License" section, same URL and date): "Demucs code is released under the MIT license as found
  in the [LICENSE](LICENSE) file. The license of the weights is not clear: MusDB contains some data that were only
  usable for research purpose. I sadly cannot help granting a license, both coming from Meta custom data, or from the
  original MusDB data. The 6 source variant of htdemucs was trained only on Meta internal dataset, which likely means
  CC-NC-BY license is applicable, as it was the case for all models released by FAIR."
- **Install (worked):** `uv venv --python 3.11 venv-demucs && uv pip install demucs==4.1.0` (28 packages: torch
  2.15.0+cpu, sphn 0.2.1, huggingface-hub 2.4.0, safetensors 0.8.0, julius 0.2.8, lameenc 1.9.0, einops 0.8.2; no
  torchaudio). **Dead end:** the first `demucs --help` failed with "ModuleNotFoundError: No module named 'numpy'"
  (raised from `demucs/transformer.py` line 14, `import numpy as np`): demucs 4.1.0's PyPI metadata lists numpy
  only for macOS on x86_64 (`numpy<2; sys_platform == "darwin" and platform_machine == "x86_64"`), so on Linux
  nothing in its dependency tree pulled it in. Fix: `uv pip install numpy` (2.4.6). Demucs 4.1.0 has no
  torchaudio in its inference path, so the torchaudio 2.11 load/save change does not reach it; what that change does
  to the previous release (4.0.1) is measured in "Demucs 4.0.1 with the current torchaudio" below. Venv 1.1 GB by du
  (hard-linked from the shared uv cache; this figure also includes `peft` and `transformers`, added later for the
  LoRA trial below).
- **Weights** (downloaded unauthenticated from Hugging Face by `get_model` on first use; script
  `scripts/demucs_fetch_models.py`; the hub printed "Warning: You are sending unauthenticated requests to the HF Hub"):
  `adefossez/HTDemucs` `955717e8.safetensors` 84,025,440 bytes; `adefossez/HTDemucs-6s` `5c90dfd2.safetensors`
  54,885,744 bytes; `adefossez/HTDemucs-ft` 4 x 84,025,440 bytes (`f7e0c4bc`, `d12395a8`, `92cfc3b6`, `04573f0d`);
  `adefossez/Demucs-mdx_extra` `a1d90b5c`, `5d2d6c55` (167,309,720 bytes each), `e51eebcc`, `cfa93e08` (167,317,416
  bytes each); plus one small `<name>.yaml` per repo. The `htdemucs_ft` and `mdx_extra` files were deleted from the
  shared cache after the R2 runs (disk). What the loaded models report:

| model | sources | sub-models | segment (s) | parameters | sample rate / channels |
|---|---|---|---|---|---|
| htdemucs | drums, bass, other, vocals | 1 HTDemucs | 7.8 | 41,984,456 | 44,100 / 2 |
| htdemucs_6s | drums, bass, other, vocals, guitar, piano | 1 HTDemucs | 7.8 | 27,414,996 | 44,100 / 2 |
| htdemucs_ft | drums, bass, other, vocals | 4 HTDemucs, bag weights one-hot (one specialist per source) | 7.8 | 167,937,824 | 44,100 / 2 |
| mdx_extra | drums, bass, other, vocals | 4 HDemucs (v3), equal bag weights | 44.0 | 334,543,632 | 44,100 / 2 |

  (Verifier: the htdemucs and htdemucs_6s rows were re-read by loading both models with `get_model` in the Demucs
  venv; the htdemucs_ft one-hot weights and the mdx_extra list of four models with `segment: 44` were read from
  `htdemucs_ft.yaml` and `mdx_extra.yaml` on the hub, and the mdx_extra models' `.json` files name the class
  `demucs.hdemucs.HDemucs`. The htdemucs_ft and mdx_extra parameter counts were not re-checked: their weights were
  deleted. The hub file sizes match the ones above.)
  `demucs --list-models` lists 11 bags (`mdx_extra_q`, `repro_mdx_a_time_only`, `mdx_q`, `repro_mdx_a`, `mdx_extra`,
  `htdemucs`, `mdx`, `hdemucs_mmi`, `htdemucs_ft`, `repro_mdx_a_hybrid_only`, `htdemucs_6s`) and 27 single models
  (`samples/demucs/list-models.txt`).
- **Runs, first pass** (command `demucs -n <model> -d cpu -o out <clip>.wav`, every other option at its default:
  `--shifts 1`, `--overlap 0.25`, segment = the model's, int16 WAV out, `--clip-mode rescale`; script
  `scripts/demucs_batch1.sh`; 2 cores each):

| run | model | clip (length) | wall s | CPU s | peak RSS MB | load1 at start |
|---|---|---|---|---|---|---|
| r0019 | htdemucs | S4 (38.7 s) | 38.86 | 59.5 | 1253.6 | 4.21 |
| r0021 | htdemucs_6s | S4 (38.7 s) | 36.37 | 50.0 | 1349.6 | 4.73 |
| r0029 | htdemucs_ft | S4 (38.7 s) | 131.84 | 224.7 | 1825.4 | 5.11 |
| r0049 | mdx_extra | S4 (38.7 s) | 114.44 | 138.4 | 3909.8 | 4.29 |
| r0053 | htdemucs | S6taps (29.4 s) | 45.63 | 58.2 | 1199.7 | 8.02 |
| r0054 | htdemucs_6s | S6taps (29.4 s) | 29.74 | 42.8 | 1292.5 | 8.08 |
| r0060 | htdemucs | S2s (29.4 s) | 36.81 | 55.0 | 1240.4 | 7.42 |
| r0099 | htdemucs_6s | S2s (29.4 s) | 73.43 | 62.7 | 1317.2 | 5.33 |

- **Output format:** `out/<model>/<input file stem>/<source>.wav`, one file per source; read back with soundfile:
  44,100 Hz, 2 channels, PCM_16, frame count equal to the input's on every file of every run (difference 0). Sum of
  the stems against the input mix (mono, `scripts/stem_facts.py`): cross-correlation peak at lag 0 in every run; residual
  10 log10(|mix - sum|^2/|mix|^2) = -32.14 dB (htdemucs S4), -12.76 dB (htdemucs_6s S4), -17.55 dB (htdemucs_ft S4),
  -34.73 dB (mdx_extra S4), -39.05 dB (htdemucs S6taps), -12.59 dB (htdemucs_6s S6taps), -44.67 dB (htdemucs S2s),
  -16.18 dB (htdemucs_6s S2s). So the stems do not add back exactly to the mix; the three htdemucs_6s residuals
  (-12.76, -12.59, -16.18 dB) are the highest in this list. Per-run facts: `samples/demucs/stemfacts_<model>_<clip>.json`
  (every value in the trial agent's 48 `stemfacts_*.json` files was recomputed by the verifier from the audio with
  separate code, `scripts/verify-trials-audio-check.py facts`, r0553: no mismatch).
- **S4, scored** (`gtr-eval stems`, map drums=drums, bass=bass, lead=vocals, guitar=other for the 4-stem models and
  guitar=guitar for htdemucs_6s; SI-SDR / SDR / SIR / SAR in dB; `samples/scores/gtreval_stems_<model>_S4.json`):

| eval | model | drums | bass | guitar | lead |
|---|---|---|---|---|---|
| e0073 | htdemucs | 9.09 / 9.61 / 22.09 / 9.89 | 7.65 / 9.58 / 22.39 / 9.84 | 2.45 / 2.63 / 4.46 / 8.61 (other) | 1.79 / 3.66 / 12.57 / 4.49 |
| e0074 | htdemucs_ft | 9.78 / 10.39 / 22.71 / 10.67 | 8.51 / 10.41 / 22.72 / 10.70 | 4.65 / 4.83 / 7.56 / 8.83 (other) | 4.97 / 6.12 / 16.43 / 6.64 |
| e0075 | mdx_extra | 8.91 / 9.37 / 19.76 / 9.84 | 5.67 / 8.20 / 20.67 / 8.50 | 3.69 / 3.84 / 5.76 / 9.32 (other) | 6.58 / 7.21 / 16.40 / 7.87 |
| e0095 | htdemucs_6s | 8.99 / 9.72 / 22.09 / 10.01 | 7.40 / 9.92 / 21.43 / 10.26 | 1.89 / 3.36 / 14.40 / 3.87 (guitar) | 7.94 / 8.50 / 15.12 / 9.70 |

  **Where the synthetic lead (GM "Voice Oohs", standing in for a singer) went**, as the projection
  <est, lead>/<lead, lead> of each estimated stem on the true lead stem (mono): htdemucs vocals 0.522, other 0.456;
  htdemucs_ft vocals 0.648, other 0.301; mdx_extra vocals 0.650, other 0.336; htdemucs_6s vocals 0.837, guitar
  0.024, piano 0.059. **Where the true strummed steel guitar went** (same projection): htdemucs other 0.883;
  htdemucs_ft other 0.897; mdx_extra other 0.870; htdemucs_6s guitar 0.358, piano 0.232, vocals 0.093, other 0.001
  (column sum 0.708, the rest is not in any stem). Stem levels (RMS dBFS, mix -17.37): htdemucs_6s guitar -28.46,
  piano -30.80, other -73.06, vocals -22.89.
- **S6taps (one steel guitar plus GM side-stick and bass-drum taps; truth stems guitar and taps):**

| eval | model, map | guitar | taps |
|---|---|---|---|
| e0116 | htdemucs, guitar=other, taps=drums | 20.72 / 20.75 / 21.93 / 27.00 | 5.67 / 11.72 / 31.54 / 11.76 |
| e0119 | htdemucs_6s, guitar=guitar, taps=drums | -8.05 / 1.64 / 29.82 / 1.65 | 6.98 / 10.87 / 26.26 / 11.01 |
| e0144 | htdemucs_6s, guitar=piano, taps=drums | 9.80 / 11.89 / 21.63 / 12.41 | 6.98 / 10.87 / 26.26 / 11.01 |

  What the band models put in `drums`: projection of the true taps 0.741 (htdemucs) and 0.790 (htdemucs_6s) in
  `drums`; the rest of the taps went to `other` (0.252, htdemucs) or `piano` (0.180, htdemucs_6s). The true guitar's
  projection on `drums` is 0.0015 (htdemucs) and 0.0042 (htdemucs_6s). htdemucs_6s put the guitar mostly in `piano`
  (projection 0.767) and little in `guitar` (0.056). Stem levels (RMS dBFS, mix -18.03): htdemucs drums -33.37, other
  -18.20, bass -78.77, vocals -82.43; htdemucs_6s drums -33.08, piano -20.09, guitar -34.66, other -82.71, bass
  -76.42, vocals -82.17.
- **S2s (one synthesized steel-string guitar, no truth stems), RMS level of each stem** (mix -18.23 dBFS):
  htdemucs (4 stems): other -18.24, drums -77.25, vocals -80.95, bass -81.35 dBFS. htdemucs_6s (6 stems): piano
  -19.06, guitar -42.15, bass -78.94, vocals -83.55, drums -83.98, other -86.71 dBFS. (FluidR3_GM's steel guitar is a
  sampled instrument, see the INPUTS.md caveats; R3a below is a real nylon guitar.)
- **Constraint inputs for a re-run:** `-n` (model), `--two-stems STEM` with `--other-method none|add|minus`,
  `--segment`, `--overlap`, `--shifts`, `--no-split`, `-j`, `--clip-mode rescale|clamp|none`, output `--int24`,
  `--float32`, `--flac`, `--mp3` (`--mp3-bitrate`, `--mp3-preset`), `--filename` template, `--repo` (a folder of
  pre-trained models) and `-s` (a locally trained XP signature), `hf://[namespace/]name` for models on the hub
  (release notes). Python API: `demucs.api` and `demucs.separate.main([...])`. No pitch, key, tuning or
  instrument-range parameters.
- **Verifier re-runs** (same commands with `-o` under `verify/out/`, cores 2-3):
  r0524 = r0019 again (`-n htdemucs`, S4; load1 1.65): wall 35.10 s, CPU 57.0 s, peak RSS 1202.2 MB. The stems are
  not sample-identical to r0019's (random shift, see the option checks): difference levels
  10 log10(|new - old|^2 / |new|^2) of -19.86 (drums), -22.60 (bass), -14.72 (other) and -10.89 dB (vocals), max |diff|
  0.05 to 0.21. Scored like e0073 (e1575): drums 9.15 / 9.67 / 22.20 / 9.95, bass 7.60 / 9.61 / 22.42 / 9.87, guitar
  (other) 2.77 / 2.92 / 4.96 / 8.38, lead (vocals) 2.54 / 4.22 / 13.49 / 4.96 (e0073: 9.09 / 9.61 / 22.09 / 9.89,
  7.65 / 9.58 / 22.39 / 9.84, 2.45 / 2.63 / 4.46 / 8.61, 1.79 / 3.66 / 12.57 / 4.49).
  r0525 = r0099 again (`-n htdemucs_6s`, S2s; load1 2.58): wall 21.30 s, CPU 37.6 s, peak RSS 1260.3 MB (r0099 took
  73.43 s wall at load1 5.33). Stem levels piano -19.07, guitar -41.72, bass -78.75, vocals -82.18, drums -83.79,
  other -86.41 dBFS (r0099: -19.06, -42.15, -78.94, -83.55, -83.98, -86.71): the synthesized steel guitar went to
  `piano` again.
- **Independent check (verifier):** e0073 recomputed with mir_eval directly (`scripts/verify-trials-audio-check.py
  metrics`): the same 16 numbers.

## librosa HPSS (librosa 1.0.0, `librosa.effects.hpss`)

- **What:** harmonic / percussive separation by median filtering of the spectrogram (no trained model); PyPI
  `librosa` 1.0.0 (uploaded 2026-08-11, requires Python >= 3.12). Tried 2026-11-10.
- **Install:** `uv venv --python 3.12 venv-librosa` (uv picked the system CPython 3.12.3) and
  `uv pip install librosa==1.0.0 soundfile scipy numpy` (numpy 2.5.4, scipy 1.18.1, numba 0.68.1, soxr 1.1.0,
  soundfile 0.14.0). Venv 430 MB by du. Freeze: `samples/librosa-hpss/uv-pip-freeze.txt`. No dead ends.
- **Runs:** `scripts/hpss_run.py <clip>.wav out/hpss/<clip>` computes three settings on the stereo file (librosa
  handles the two channels): `default` = `librosa.effects.hpss(y)` (kernel_size 31, power 2.0, mask False, margin
  1.0, n_fft 2048, hop 512); `margin3` = `margin=3.0`; `margin1-5` = `margin=(1.0, 5.0)` (harmonic margin 1,
  percussive margin 5). It also runs `librosa.onset.onset_detect` (defaults, units='time') on the mono percussive part.
  This is a light single-threaded job, so it ran with `gtr-run --nolock` (no CPU slot, no pinning, 1 thread):

| run | clip | wall s | CPU s | peak RSS MB | per setting (s, inside the script): default / margin3 / margin1-5 |
|---|---|---|---|---|---|
| r0262 | S6taps (29.4 s) | 72.47 | 26.6 | 642.9 | 33.38 / 17.47 / 16.57 |
| r0268 | S2s (29.4 s) | 53.56 | 19.8 | 570.1 | 20.81 / 14.29 / 15.53 |

  (The first setting took longer than the other two in both runs; the cause was not checked. The box's 1-minute
  load average when these unpinned runs started was 17.35 (r0262) and 19.56 (r0268) on 4 cores. Both runs had
  `OMP_NUM_THREADS`, `MKL_NUM_THREADS` and `OPENBLAS_NUM_THREADS` set to 1 per the ledger.)
  **Verifier re-run of r0262** (r0530, same command with the output under `verify/out/`, the same three variables set
  to 1, in a 2-core slot this time, load1 3.63): wall 19.60 s, CPU 18.4 s, peak RSS 559.2 MB; per setting 7.69 /
  5.64 / 5.35 s (the first setting again the longest). All six output files are sample-identical to r0262's (max
  |diff| 0; the files differ in a few header bytes) and the three onset lists are byte-identical.
- **Output format:** `harmonic.wav` and `percussive.wav` per setting, written by the script as float32 WAV, 44,100
  Hz, 2 channels, same frame count as the input, lag 0. With `margin` 1 the two parts add up to the input (residual
  -143.18 dB on S6taps); with margins above 1 they do not (residual of harmonic + percussive against the mix: -8.48 dB
  for margin3, -15.60 dB for margin1-5 on S6taps). `percussive_onsets.txt`: one onset time in seconds per line.
- **S6taps, scored** (truth stems guitar and taps; map guitar=harmonic, taps=percussive; SI-SDR / SDR / SIR / SAR dB):

| eval | setting | guitar (harmonic) | taps (percussive) | projection of true taps on percussive / of true guitar on harmonic |
|---|---|---|---|---|
| e0811 | default | 15.53 / 16.52 / 29.48 / 16.75 | 0.34 / 0.50 / 3.87 / 4.67 | 0.900 / 0.899 |
| e0858 | margin3 | 8.62 / 10.00 / 31.99 / 10.03 | 3.86 / 4.41 / 11.46 / 5.66 | 0.674 / 0.667 |
| e0893 | margin1-5 | 15.53 / 16.52 / 29.48 / 16.75 | 3.21 / 3.97 / 13.37 / 4.70 | 0.517 / 0.899 |

  With the default margin 0.102 of the true guitar's projection lands in the percussive part (0.012 with margin1-5).
  Levels (RMS dBFS, mix -18.03): default harmonic -19.03, percussive -29.91; margin3 -21.17 / -33.77; margin1-5
  -19.03 / -35.87. Full facts: `samples/librosa-hpss/stemfacts_hpss-<setting>_S6taps.json`, `hpss_report_S6taps.json`.
- **S2s (one guitar, no taps):** harmonic / percussive RMS -18.98 / -33.86 dBFS (default), -21.02 / -41.85
  (margin3), -18.98 / -45.05 (margin1-5) against a mix of -18.23 dBFS (`samples/librosa-hpss/hpss_report_S2s.json`).
  The onset detector found 48 onsets in the percussive part of every setting; S2s has no taps, so these come from the
  guitar notes.
- **Handoff test: separated percussive stem -> onset list -> tap times.** The same `librosa.onset.onset_detect` call
  (`scripts/onsets_of_stem.py`) on the mono `drums.wav` of three band models, and on the HPSS percussive parts,
  scored with `gtr-eval onsets --field taps` (an estimate is a hit within 50 ms of a true tap, each matched once;
  timing = estimated minus true, median over matched pairs). Onset lists: `samples/onsets-handoff/`.

| eval | onsets from | n onsets | F | precision | recall | matched | median timing (s) |
|---|---|---|---|---|---|---|---|
| e0815 | HPSS default, percussive | 53 | 0.753 | 0.604 | 1.000 | 32 / 32 | +0.0084 |
| e0862 | HPSS margin3, percussive | 53 | 0.753 | 0.604 | 1.000 | 32 / 32 | +0.0050 |
| e0896 | HPSS margin1-5, percussive | 53 | 0.753 | 0.604 | 1.000 | 32 / 32 | +0.0034 |
| e0919 | Demucs htdemucs, drums | 34 | 0.939 | 0.912 | 0.969 | 31 / 32 | +0.0017 |
| e0928 | Demucs htdemucs_6s, drums | 32 | 1.000 | 1.000 | 1.000 | 32 / 32 | +0.0017 |
| e0934 | Open-Unmix umxhq, drums | 82 | 0.561 | 0.390 | 1.000 | 32 / 32 | -0.0149 |

  These are 32 General MIDI drum-kit hits (side stick and bass drum) mixed into a sampled guitar, not hands on a
  guitar body (INPUTS.md caveat).
  **Independent check (verifier):** `mir_eval.onset.f_measure(truth taps, onsets, window=0.05)` called directly on
  the saved onset lists gives F / precision / recall 1.000 / 1.000 / 1.000 (e0928's list), 0.939 / 0.912 / 0.969
  (e0919), 0.753 / 0.604 / 1.000 (e0815), 0.561 / 0.390 / 1.000 (e0934) and 0.598 / 0.427 / 1.000 (e1397), and e0811
  recomputed with mir_eval's `bss_eval_sources` gives the same guitar / taps numbers as above.
- **Constraint inputs for a re-run:** `margin` (one value or a harmonic/percussive pair), `kernel_size`, `power`,
  `mask` (hard masks), `n_fft`, `hop_length`. No pitch or instrument parameters.

## Tools NOT RUN HERE, with the evidence

Checked 2026-11-10. During this lane's work the shared disk was down to 6.2 to 7.2 GB free (the "DISK LOW" lines in
the lane's saved logs read 6,188 to 7,188 MB) and the orchestrator's notice on the box read: "start no new download
or install over 200 MB unless your lane cannot finish without it; pick the smallest checkpoint a model offers".
Steps for Aaron are in `for-aaron.md`. (Verifier: every size, gate and license below was re-read from the Hugging
Face, Zenodo and GitHub-mirror APIs and READMEs on 2026-11-10 and matches, except where a note says otherwise.)

- **SAM Audio (Meta), text / visual / span-prompted separation.** Hugging Face model API, read 2026-11-10:
  `facebook/sam-audio-small` `gated: manual`, `usedStorage` 5,100,547,943 bytes; `-base` `manual`, 7,725,405,659;
  `-large` `manual`, 14,861,356,211. A request for `https://huggingface.co/facebook/sam-audio-small/resolve/main/config.json`
  without a login returned HTTP 401. Not run: the weights need an approved Hugging Face login, and the smallest
  repository is 5.1 GB against 6.2 to 7.2 GB of free disk.
- **AudioSep (text-queried).** The Hugging Face Space `Audio-AGI/AudioSep` (API, read 2026-11-10) holds
  `checkpoint/audiosep_base_4M_steps.ckpt` 1,264,844,076 bytes and `checkpoint/music_speech_audioset_epoch_15_esc_89.98.pt`
  2,352,471,003 bytes, readable without a login. Not run: 3.6 GB of checkpoints under the 200 MB download notice.
  Whether a 10 s CPU run is feasible was therefore not measured (UNVERIFIED; survey.md reports that the README picks
  the CPU when CUDA is absent). The same Space API call (verifier, 2026-11-10) reported the Space's runtime stage as
  `RUNTIME_ERROR` (requested hardware `a10g-small`). (Corrected in gap round 2: the 200 MB notice no longer applied,
  but with 7,403 MB free at 00:42 UTC on 2026-11-11 the download would have left about 3,950 MB, under the 4 GB that
  round had to keep free; still not run, and the 10 s CPU timing is still UNVERIFIED. Its route also runs a cloned
  repository's code, which the permission system refused for two other tools in that round. See "Gap round 2".)
- **Banquet (`kwatcharasupat/query-bandit`, query by example).** Zenodo record 13694558 (API, read 2026-11-10):
  license `cc-by-nc-sa-4.0`, `access_right: open` (no login), 14 checkpoints of 551,785,899 to 768,226,933 bytes
  (`ev-pre-aug.ckpt` 645,470,187). Not run: the smallest checkpoint is 552 MB, above the 200 MB notice, before the
  PaSST query encoder it also needs. (Corrected in gap round 2: the disk is no longer the reason. With room on the
  disk, running the README's `python train.py inference_byoq` from the cloned repository was refused by the
  session's permission system, "Reason: [Code from External]", 2026-11-11 00:33 UTC; see "Gap round 2". The PaSST
  query weights are 341,546,630 bytes.) The README's inference example passes `--use_cuda=true`; `train.py`'s
  `inference_byoq` has `use_cuda: bool = True` and calls `system.cpu()` when it is false (read by the verifier at
  raw.githubusercontent.com, `main`, 2026-11-10). Whether the whole path runs on a CPU was not tried (UNVERIFIED).
  The repository root has no `requirements.txt`, `environment.yml`, `setup.py` or `pyproject.toml` (HTTP 404 for
  each, same date).
- **MuS3D (Aalto) and ZeroSep.** MuS3D's checkpoint repository `remus-aalto/MuS3D` holds 19,244,794,860 bytes (Hub
  API `usedStorage`, per survey.md) and its README says "The DiT needs about 10 GB of free memory"; ZeroSep runs
  diffusion backbones (survey.md). Not run: disk. (Verifier, Hub API: of the 19.2 GB, `DiT/ema.pth` is
  18,180,101,963 bytes; the BS-Locoformer path uses `BS-Locoformer_query/model.pth` 470,401,878 bytes plus a SEG
  checkpoint, `SEG_mixemb/model.pth` 150,237,319 or `SEG_resemb/model.pth` 151,026,043 bytes, which together are
  also above the 200 MB notice.)
- **`adityalakhani/htdemucs-6s-guitar-ft` (htdemucs_6s fine-tuned on guitar).** Hub API (read 2026-11-10):
  `guitar_htdemucs_6s.pt` 329,654,071 bytes, not gated. Not run: above the 200 MB notice. (Verifier, from the repo's
  files, 2026-11-10: card metadata `license: apache-2.0`, `datasets: MoisesDB`; its `inference.py` reads and writes
  audio with soundfile and takes `--device auto|cuda|cpu`, so a CPU run is possible in its code; its
  `requirements.txt` pins `demucs==4.0.1`.) (Corrected in gap round 2: run here on S4, R2, S6taps and S2s, r0636 to
  r0644, through a script that follows its `inference.py` with demucs 4.1.0; see "Gap round 2".)
- **Demucs in the browser.** `free-music-demixer` (sevagh): its README calls it "An archived snapshot ... no longer
  maintained" and "Model weights are not included" (survey.md). `demucs-rs`: its README names Metal, Vulkan and
  WebGPU back ends; the box has no GPU (survey.md). Not run here. Instead the `demucs-onnx` package's htdemucs_6s
  ONNX file was run with ONNX Runtime on the CPU (section below). The same package's `browser.py` writes an
  onnxruntime-web demo whose default model is the htdemucs-ft vocals ONNX file ("fp16weights variant (166 MB)", per
  its docstring) and lists the htdemucs-ft vocals and drums files and the 4-stem htdemucs file; another model URL can
  be passed with `browser-demo --model-url` (read from the installed package by the verifier). The browser path was
  not tested.
- **Larger RoFormer checkpoints** (Mel-Band RoFormer "Kim" vocals 913,106,900 bytes; `model_mel_band_roformer_ep_3005`
  1,007,816,988 bytes, sizes from HTTP HEAD on the audio-separator mirror): not downloaded (200 MB notice). The
  Mel-Band RoFormer architecture was run with the 45 MB becruily guitar checkpoint instead (below).
- **SCNet:** not in the audio-separator 0.48.0 model list (`samples/audio-separator/model_catalogue_0.48.0.json`
  has no entry containing "scnet"); MSST lists SCNet checkpoints. The trial agent did not try them (time); the
  verifier ran the 42 MB "SCNet Small" checkpoint through MSST (section "SCNet Small (MUSDB18)" below).
- **demucs-infer, bs-roformer-infer, melband-roformer-infer (OpenMIRLab), PolUVR:** repackagings of models already
  run here through demucs, audio-separator and MSST; not tried, to keep the CPU slots for other tools.
- **Gaborformer (`sevagh/gaborformer`, 4 stems, no guitar stem)** (added in gap round 2): not run. It has no PyPI
  package, and installing the cloned repository was refused by the session's permission system ("Reason: [Code from
  External]", 2026-11-11 00:21 UTC); details under "Gap round 2". Steps for Aaron: `for-aaron.md` item 8.

## Demucs 4.0.1 with the current torchaudio (I/O check only, no separation)

Some tools pin an earlier Demucs release (MSST's `requirements.txt` lists `demucs==4.0.0`; the verifier found that
`adityalakhani/htdemucs-6s-guitar-ft`'s `requirements.txt` pins `demucs==4.0.1`), so
the reader and writer of PyPI `demucs` 4.0.1 were checked against torchaudio 2.11.1 without loading a model
(`scripts/demucs401_io_check.py`, light job, not timed; venv deleted afterwards, freeze in
`samples/demucs/uv-pip-freeze-demucs-4.0.1-iocheck.txt`).

- Install: `uv pip install demucs==4.0.1` pulled torch 2.15.0+cpu, torchaudio 2.11.1+cpu, openunmix 1.3.0,
  dora-search 0.1.13.
- `demucs.separate.load_track` (the CLI's reader, ffmpeg first) read `S4.wav`: shape (2, 1708495), float32.
- `demucs.audio.save_audio` (the CLI's writer) failed: "ImportError TorchCodec is required for
  save_with_torchcodec. Please install torchcodec to use this function." (raised in demucs `audio.py` line 260 ->
  torchaudio `__init__.py` line 178 -> `_torchcodec.py` line 248).
- Fix: `uv pip install torchcodec` (0.17.0+cpu). Saving then works, with two warnings from torchaudio: "The
  'encoding' parameter is not fully supported by TorchCodec AudioEncoder." and "The 'bits_per_sample' parameter is
  not directly supported by TorchCodec AudioEncoder."
- Consequence, measured: `save_audio(..., as_float=True, bits_per_sample=32)` (what `--float32` asks for),
  `bits_per_sample=24` (`--int24`) and `bits_per_sample=16` all wrote the same 176,478-byte file for one second of
  stereo audio, and soundfile reads all three as PCM_16. With demucs 4.0.1 + torchaudio 2.11 + torchcodec 0.17,
  `--float32` and `--int24` therefore give 16-bit files. Demucs 4.1.0 writes WAV itself (no torchaudio) and is
  checked with `--float32` in the option runs below.
- **Verifier:** the saved `scripts/demucs401_io_check.py` covers only the 16-bit save, so the three-way check was
  re-done in a venv re-created from the saved freeze (identical freeze) with `scripts/verify-trials-demucs401-io.py`
  (r0544, light, `--nolock`; r0543 before it exited 1 because that script first imported soundfile, which the frozen
  venv does not have): `load_track` gave (2, 1708495) float32; int16, int24 and float32 requests each wrote 176,478
  bytes with WAV format tag 1 (PCM) and 16 bits, read back as PCM_16 by soundfile, each with the two torchcodec
  warnings quoted above; the process had `libtorchcodec_core6.so` and the system's `libavformat.so.60.16.100` loaded.
  The traceback lines quoted above match the installed files (demucs `audio.py` line 260 is the `ta.save(...)` call,
  torchaudio `__init__.py` line 178 `return save_with_torchcodec(`, `_torchcodec.py` line 248 `raise ImportError(`).

## Spleeter 2.4.2 (Deezer), 4stems model

- **What:** TensorFlow spectrogram-mask separation with pretrained 2-, 4- and 5-stem models, PyPI `spleeter` 2.4.2
  (uploaded 2025-04-03, requires Python >=3.8, <3.12), https://github.com/deezer/spleeter. Tried 2026-11-10.
- **License:** LICENSE "MIT License / Copyright (c) 2019-present, Deezer SA."; README: "The code of **Spleeter** is
  [MIT-licensed](LICENSE)." and "If you plan to use **Spleeter** on copyrighted material, make sure you get proper
  authorization from right owners beforehand." (https://raw.githubusercontent.com/deezer/spleeter/master/README.md
  and `/LICENSE`, read 2026-11-10). The README states no separate license for the pretrained models.
- **Install (worked):** spleeter 2.4.2 pins `tensorflow==2.12.1` (PyPI metadata), whose Linux wheel is 585.9 MB.
  To save disk the CPU-only build was used instead: `uv venv --python 3.11 venv-spleeter`, then
  `uv pip install tensorflow-cpu==2.12.1 "ffmpeg-python>=0.2.0,<0.3.0" "httpx[http2]>=0.19.0,<0.20.0"
  "typer>=0.3.2,<0.4.0" tensorflow-io-gcs-filesystem==0.32.0 "pandas>=1.3.0,<2.0.0" "norbert>=0.2.1,<0.3.0"
  "numpy<2.0.0"` (the other declared requirements, copied from the metadata) and `uv pip install --no-deps
  spleeter==2.4.2`. Result: tensorflow-cpu 2.12.1 (231.8 MB wheel), keras 2.12.0, numpy 1.24.3, pandas 1.5.3. Venv
  1.7 GB by du (trial agent's figure; the venv was deleted before the verifier's check). Freeze:
  `samples/spleeter/uv-pip-freeze.txt`. No error. The trial agent reports that TensorFlow printed "This TensorFlow
  binary is optimized to use available CPU instructions in performance-critical operations."; that message is not in
  the lane's saved logs (UNVERIFIED).
- **Model:** `4stems.tar.gz` (146,308,147 bytes) from
  `https://github.com/deezer/spleeter/releases/download/v1.4.0/4stems.tar.gz`, fetched and checksum-validated by
  spleeter's own `ModelProvider` into `MODEL_PATH`; extracted `model.data-00000-of-00001` 157,228,152 bytes (trial
  agent's figure; the model was deleted). The download happened before batch A and its log was not saved; the three
  messages the trial agent quoted ("Downloading model archive ...", "Validating archive checksum", "Extracting
  downloaded 4stems archive") are the ones `spleeter/model/provider/github.py` logs at lines 145, 154 and 158 of the
  2.4.2 wheel (read by the verifier). (2stems is 73,109,797 bytes and 5stems 182,803,368 bytes; not downloaded. All
  three archive sizes re-read by HTTP HEAD, 2026-11-10.)
- **Runs** (`MODEL_PATH=models/spleeter spleeter separate -p spleeter:4stems -o out/spleeter-4stems <clip>.wav`,
  defaults otherwise: codec wav, no `--mwf`, `-d` 600 s maximum duration; `scripts/batch_A.sh` section 3, inside
  batch A, 2 cores):

| run | clip (length) | wall s | CPU s | peak RSS MB | load1 at start |
|---|---|---|---|---|---|
| r0419 | S4 (38.7 s) | 21.46 | 15.6 | 1808.9 | 7.41 |
| r0421 | S6taps (29.4 s) | 14.47 | 13.3 | 1592.9 | 7.31 |
| r0422 | R2 (36.0 s) | 12.88 | 14.4 | 1701.4 | 7.21 |

- **Output format:** `out/spleeter-4stems/<input stem>/{vocals,drums,bass,other}.wav` (template
  `{filename}/{instrument}.{codec}`), written through ffmpeg: 44,100 Hz, 2 channels, PCM_16, frame count equal to the
  input's; each file is 34 bytes larger than the input WAV of the same length (6,834,058 vs 6,834,024 bytes for S4);
  with equal frame counts the extra bytes are in the header (spleeter writes through ffmpeg; verifier: the extra
  chunk is a 34-byte `LIST`/`INFO` chunk with `ISFT` = "Lavf60.16.100"). Sum of the stems
  against the mix: lag 0, residual -30.28 dB (S4), -31.92 dB (S6taps), -29.92 dB (R2). The venv and the model were
  deleted after the runs (disk); the trial agent reports that `uv cache clean tensorflow-cpu jaxlib jax tensorboard
  keras libclang` then freed 904.2 MiB of the shared cache (that command's output was not saved: UNVERIFIED).
  **Not re-run by the verifier:** re-installing TensorFlow (a 221.1 MiB tensorflow-cpu download, venv 1.7 GB) was
  over the orchestrator's 200 MB notice, which was in force again during the check (6.7 to 6.9 GB free). The saved
  outputs were re-read instead (frames, levels, residuals, projections and all three scorings: no difference).
- **S4** (e1394; map guitar=other, lead=vocals; SI-SDR / SDR / SIR / SAR dB): drums 3.75 / 4.21 / 15.85 / 4.63; bass
  2.74 / 4.79 / 10.68 / 6.44; guitar (other) -1.40 / -1.07 / -0.39 / 10.53; lead (vocals) -8.20 / -4.41 / 13.54 /
  -4.15. Lead projection: other 0.8668, vocals 0.1115; guitar projection: other 0.8571. Stem levels (mix -17.37
  dBFS): other -19.28, bass -25.85, drums -30.56, vocals -32.24 dBFS.
- **S6taps** (e1395; map guitar=other, taps=drums): guitar 21.79 / 22.25 / 26.10 / 24.58; taps 7.93 / 9.32 / 23.25 /
  9.52. Taps projection: drums 0.821, other 0.188. Levels: other -18.23, drums -32.90, vocals -59.84, bass -121.52
  dBFS. Onsets of `drums.wav` (`scripts/onsets_of_stem.py`) against the 32 taps (e1397, 50 ms window): 75 onsets,
  F 0.598, precision 0.427, recall 1.000, median timing -0.0140 s.
- **R2** (e1396; drums + bass + other summed against the artist's instrumental, vocals against `vocals_derived`):
  instrumental 10.62 / 11.17 / 19.79 / 11.86; vocals 12.54 / 13.03 / 19.61 / 14.16.
- **Input facts:** reads through ffmpeg (`spleeter.audio.ffmpeg.FFMPEGProcessAudioAdapter`); `-s` offset and `-d`
  duration (default 600 s, so longer files are cut unless `-d` is raised).
- **Independent check (verifier):** e1395 recomputed with mir_eval directly: guitar 21.79 / 22.25 / 26.10 / 24.58,
  taps 7.93 / 9.32 / 23.25 / 9.52, the same as gtr-eval.
- **Constraint inputs for a re-run:** `-p spleeter:2stems|4stems|5stems` (5stems adds piano; no guitar stem), `--mwf`
  (multichannel Wiener filtering), `-s` / `-d`, `-c` codec, `-b` bitrate, `-f` filename template. No pitch or
  tuning parameters.

## Demucs 4.1.0, further runs (batch A): solo-guitar recordings, R2, option checks, whole song

Because the shared CPU slots were queued (the trial agent counted 15 to 20 jobs waiting from about 21:05 UTC; the
ledger shows up to 8, see the top of this file), the remaining runs were grouped into batch
jobs: each batch is one `gtr-run` job holding one 2-core slot (`scripts/batch_A.sh`, `batch_B.sh`, `batch_C.sh`), and
inside it every item is started with `gtr-run --nolock`, which gives each item its own ledger line (wall, CPU, peak
RSS, input hash). The ledger shows `cores: null` for those items because `--nolock` records no pinning; the batch log
prints the inherited CPU affinity at its start: "batch A start 2026-11-10T22:28:01Z affinity: pid 29424's current
affinity list: 0,1 nproc=2 OMP_NUM_THREADS=2 TF_NUM_INTRAOP_THREADS=2". Batch A waited from 21:33 to 22:28 for
its slot.

- **Real solo classical guitar (R3a, R3b, R3c, 18 s each), RMS level of each stem** (no truth stems):

| run | model | clip | wall s | CPU s | stems, RMS dBFS (mix level) | residual of stem sum vs mix |
|---|---|---|---|---|---|---|
| r0409 | htdemucs | R3a | 20.47 | 34.0 | other -24.57, vocals -71.24, drums -73.92, bass -75.18 (mix -24.58) | -39.69 dB |
| r0410 | htdemucs_6s | R3a | 14.13 | 24.3 | guitar -24.64, other -63.19, vocals -67.01, piano -75.07, bass -75.04, drums -75.16 | -29.11 dB |
| r0412 | htdemucs | R3b | 19.51 | 33.0 | other -31.28, bass -45.98, drums -88.21, vocals -92.57 (mix -30.97) | -38.16 dB |
| r0413 | htdemucs_6s | R3b | 14.88 | 26.0 | guitar -31.32, bass -46.91, other -94.40, vocals -94.21, drums -94.69, piano -101.36 | -26.32 dB |
| r0414 | htdemucs | R3c | 44.84 | 44.0 | other -17.84, drums -60.77, vocals -74.46, bass -80.54 (mix -17.83) | -42.77 dB |
| r0418 | htdemucs_6s | R3c | 46.44 | 45.4 | guitar -17.86, vocals -67.15, drums -71.33, piano -86.15, bass -89.20, other -89.96 | -30.00 dB |

  On these three real nylon-string recordings htdemucs_6s put the guitar in `guitar` (within 0.4 dB of the mix
  level); on the synthesized steel guitar S2s it put it in `piano` (first-pass table above). Every file: 44,100 Hz,
  2 channels, PCM_16, same frame count as the input, stem sum at lag 0 (`samples/demucs/stemfacts_<model>_R3?.json`).
- **R2 (real band excerpt, 36 s):** stems kept in `out/<model>/R2/`. Drums + bass + other (+ guitar + piano for
  htdemucs_6s) summed into `derived_instrumental_sum.wav` and scored against the artist's instrumental; `vocals.wav`
  against `vocals_derived` (SI-SDR / SDR / SIR / SAR dB):

| run | eval | model | wall s | CPU s | peak RSS MB | instrumental | vocals | stem levels, RMS dBFS (mix -10.27) |
|---|---|---|---|---|---|---|---|---|
| r0424 | e1398 | htdemucs | 82.62 | 78.9 | 1207.1 | 11.41 / 12.08 / 21.44 / 12.65 | 13.42 / 13.73 / 19.43 / 15.14 | vocals -12.95, other -18.69, bass -20.23, drums -22.77 |
| r0428 | e1399 | htdemucs_6s | 62.02 | 60.5 | 1300.4 | 10.77 / 11.23 / 20.82 / 11.77 | 13.42 / 13.74 / 19.88 / 14.99 | vocals -13.02, guitar -19.36, bass -20.08, drums -23.21, other -34.92, piano -37.30 |
| r0435 | e1400 | htdemucs_ft | 289.33 | 297.8 | 1795.3 | 10.81 / 11.33 / 21.46 / 11.81 | 13.57 / 13.85 / 19.63 / 15.24 | vocals -12.85, other -18.79, bass -19.93, drums -23.30 |
| r0447 | e1401 | mdx_extra | 204.85 | 169.4 | 3772.1 | 11.26 / 11.86 / 20.99 / 12.46 | 13.47 / 13.77 / 19.43 / 15.19 | vocals -13.13, other -18.99, bass -19.50, drums -24.30 |

  INPUTS.md lists "That the song has bass and drums is UNVERIFIED"; the measured `bass` stems sit 9.2 to 10.0 dB
  and the `drums` stems 12.5 to 14.0 dB below the mix level in all four models. That is a level of model output, not
  a listening check.
- **Option checks** (`scripts/batch_A.sh` section 5): `--two-stems` on the whole S4, everything else on the first
  10.000 s of S4 (`inputs/S4_0-10s/S4_0-10s.wav`, cut with `sox ... trim 0 441000s`, sha256 `d8f369e6...b1ea`). Scores
  use `gtr-eval stems --max-seconds 10` against the S4 truth (map guitar=other, lead=vocals; SI-SDR / SDR dB):

| run | option | wall s | CPU s | peak RSS MB | output | eval: drums / bass / guitar / lead SI-SDR, SDR |
|---|---|---|---|---|---|---|
| r0454 | none (htdemucs, base) | 32.47 | 27.8 | 1087.7 | 4 x WAV PCM_16, 1,764,044 bytes | e1408: 8.81, 9.10 / 5.22, 7.75 / 4.34, 5.11 / 5.52, 6.37 |
| r0457 | `--shifts 2` | 37.88 | 42.1 | 1094.6 | same format | e1409: 9.05, 9.36 / 4.95, 7.59 / 4.15, 4.90 / 5.54, 6.37 |
| r0458 | `--overlap 0.1` | 11.55 | 18.4 | 1083.9 | same format | e1410: 8.99, 9.27 / 5.16, 7.72 / 4.24, 4.98 / 5.58, 6.36 |
| r0459 | `--segment 4` | 18.90 | 32.2 | 1071.5 | same format | e1411: 7.89, 8.08 / 3.47, 6.03 / 3.55, 4.25 / 5.61, 6.38 |
| r0460 | `--segment 10` | 2.08 | 2.0 | 490.3 | exit 1: "Cannot use a Transformer model with a longer segment than it was trained for. Maximum segment is: 7.8" | none |
| r0461 | `-j 2` | 10.27 | 17.5 | 1632.3 | same format | e1412: 8.89, 9.20 / 5.24, 7.79 / 4.27, 5.07 / 5.36, 6.22 |
| r0462 | `--mp3` | 11.52 | 18.5 | 1096.3 | 4 x MP3, 320 kb/s, 44.1 kHz stereo, 401,240 bytes each | not scored (see below) |
| r0463 | `--float32` | 12.17 | 18.7 | 1090.1 | 4 x WAV FLOAT, 3,528,056 bytes | e1413: 8.95, 9.24 / 5.34, 7.65 / 4.33, 5.07 / 5.62, 6.47 |
| r0450 | `-n htdemucs_6s --two-stems guitar` (whole S4) | 109.70 | 71.2 | 1304.8 | `guitar.wav`, `no_guitar.wav`, PCM_16 | e1414 (guitar only, `--sdr-mode single`): SI-SDR 1.61, SDR 3.26 |

  The base run took more CPU time (27.8 s) than the `--mp3`, `--float32` and `-j 2` runs (17.5 to 18.7 s), which do
  the same separation with a different writer or with 2 parallel jobs; the cause of that spread was not isolated (it
  ran first, and the box's 1-minute load average at the start of these runs was 5.96 to 10.26). One run per option:
  these timings are not averages. **The output is not identical from run to run:** `demucs/apply.py` draws a random
  time offset when `shifts` > 0 (line 245, `offset = random.randint(0, max_shift)`; the CLI default is `--shifts 1`).
  Measured with `scripts/compare_runs.py`: `other.wav` of the base run against the `-j 2` run differs by
  max |diff| 0.0549, difference level -20.74 dB; against the `--float32` run -20.49 dB; the htdemucs_6s `guitar.wav`
  of the first-pass S4 run (r0021) against the `--two-stems guitar` run (r0450) -13.10 dB, max |diff| 0.0874. The
  first-pass guitar stem scored alone gives SI-SDR 1.89 / SDR 3.36 (e1415) against 1.61 / 3.26 for the two-stems run.
  (Difference level here and below, as in `scripts/compare_runs.py`: 10 log10(|a - b|^2 / |a|^2) with a = the first
  file named. Recomputed by the verifier with separate code: -20.74, -20.49 and -13.10 dB, max |diff| 0.0549, 0.0559
  and 0.0874.)
  **MP3 output:** read back with soundfile (libsndfile) each MP3 has 442,368 frames, 1,368 more than the input, and
  the stems' sum lines up with the mix at a lag of +1105 samples (late), so MP3 stems are not sample-aligned with the
  input as decoded here. (Verifier: ffmpeg decodes the same 442,368 frames; `soundfile.info()` reports 442,747 frames
  for these files, so the 10.04 s in the media list below is the header's figure, not the decoded length of
  10.031 s. The verifier's re-run of r0462, r0526 (cores 2-3, wall 11.7 s), again gave 442,368 frames per stem and a
  stem-sum lag of +1105 samples; its stems differ from r0462's by -16.97 to -23.92 dB because of the random shift.)
  **Float output:** `--float32` files read as FLOAT (peak of `other.wav` 0.577).
  **`--segment 10`:** the verifier's re-run of r0460 (r0527) exited 1 with the same message.
- **Whole song (R2full, 228.5 s) on 2 cores:** r0472 htdemucs: wall 255.55 s, CPU 347.1 s, peak RSS 1798.0 MB,
  load1 at start 5.38. r0477 htdemucs_6s: wall 163.00 s, CPU 251.0 s, peak RSS 2163.8 MB, load1 5.98. Outputs: 10,076,073
  frames per stem (same as the input), PCM_16, stem sum at lag 0, residual -25.54 dB (htdemucs) and -23.04 dB
  (htdemucs_6s); stem levels (RMS dBFS) htdemucs vocals -15.75, other -18.69, bass -21.23, drums -24.81;
  htdemucs_6s vocals -15.81, guitar -19.25, bass -20.86, drums -24.52, piano -44.65, other -45.22. The batch that
  held the slot is r0478 (wall 1514.33 s for all of batch A after waiting 3270.9 s for the slot). A 4-core
  (`--all-cores`) whole-song timing was not attempted: it needs both slots at once, and with jobs queued for the
  slots (see the top of this file) it would have held one slot idle while waiting for the other. (Corrected in gap
  round 2: run then: htdemucs r0659 263.90 s and r0669 363.56 s, htdemucs_6s r0660 109.55 s on 4 cores, and htdemucs
  r0677 277.63 s on 2 cores in the same session; see "Gap round 2" for the box load during those runs.)
- **Clipping guard visible in the real-song stems:** on R2 and R2full the `drums` and `vocals` stems of every Demucs
  model peak at exactly -0.09 dBFS (0.990 of full scale). `demucs/audio.py` `prevent_clip` with the default
  `--clip-mode rescale` does `wav = wav / max(1.01 * wav.abs().max(), 1)`, which gives that peak whenever a stem
  would have clipped; such a stem is scaled down as a whole, so its level relative to the other stems changes
  (the README says the same: "This can however break the relative volume between stems.").

## Demucs guitar LoRA (`barvarvara/demucs-guitar-lora`, PEFT adapter on htdemucs)

- **What:** a LoRA adapter (r=8, alpha=16, target modules `linear1`, `linear2`, `out_proj`, `peft_version` 0.19.1 in
  `adapter_config.json`) for Demucs `htdemucs`. The model card (https://huggingface.co/barvarvara/demucs-guitar-lora,
  read 2026-11-10, card metadata `license: mit`) says, in Russian: "Дообученная модель Demucs v4 (htdemucs) для
  извлечения акустической гитары методом LoRA." ("Demucs v4 (htdemucs) fine-tuned with LoRA to extract acoustic
  guitar.") It also gives "r=8, alpha=16, подвыборка 30%, 10 эпох, AdamW + CosineAnnealing" (a 30 % subsample, 10
  epochs) without naming the data set, and does not say which of the four output sources carries the guitar
  (verifier re-read the card, 2026-11-10).
- **Install:** `uv pip install peft soundfile` into the Demucs 4.1.0 venv (added peft 0.21.2, transformers 5.22.2,
  accelerate 1.15.0). Files: `adapter_model.safetensors` 1,974,280 bytes (sha256 `b285eda8...c8d7`) and
  `adapter_config.json` 1,091 bytes from the model repo. No error.
- **Runs** (`scripts/demucs_lora.py`, which follows the card: `PeftModel.from_pretrained(get_model('htdemucs').models[0],
  adapter)`, then `merge_and_unload()` and `demucs.apply.apply_model` with the CLI defaults shifts=1, overlap 0.25,
  and the CLI's normalisation (mono mean and std; demucs 4.1.0's `api.py` adds 1e-8 to the std, the script does
  not); writes PCM_16 WAVs, clipped to [-1, 1]); inside batch C, 2 cores:

| run | clip | wall s | CPU s | peak RSS MB | sources | stem levels, RMS dBFS |
|---|---|---|---|---|---|---|
| r0467 | S4 | 54.93 | 69.3 | 1363.8 | drums, bass, other, vocals | other -20.83, bass -25.04, vocals -25.76, drums -28.68 (mix -17.37) |
| r0470 | S2s | 71.50 | 71.0 | 1349.0 | drums, bass, other, vocals | other -18.31, drums -48.43, bass -76.03, vocals -81.10 (mix -18.23) |

  The script reported load+merge 0.9 s / separate 43.8 s (S4) and 1.1 s / 65.8 s (S2s).
- **S4 scored** (e1416, map guitar=other, lead=vocals; SI-SDR / SDR / SIR / SAR dB): drums 7.80 / 8.07 / 16.16 /
  8.91; bass 7.86 / 9.69 / 22.10 / 9.98; guitar (other) 1.94 / 2.12 / 3.65 / 8.95; lead (vocals) 0.93 / 3.64 /
  12.52 / 4.48. Projection of the true guitar: other 0.864, vocals 0.052, drums 0.042 (htdemucs without the
  adapter, r0019: other 0.883, vocals 0.056, drums 0.015). On S2s the `drums` stem is -48.43 dBFS with the adapter
  and -77.25 dBFS without it (r0060). Output: 44,100 Hz, 2 channels, PCM_16, same length as the input, stem sum lag 0
  (residual -31.63 dB on S4, -36.87 dB on S2s). Facts: `samples/demucs-guitar-lora/`.
- **Verifier re-run of r0467** (r0529, output under `verify/out/`, cores 2-3, load1 3.12): wall 34.82 s, CPU 58.5 s,
  peak RSS 1295.7 MB. Not sample-identical (shifts=1 draws a random offset): difference levels -18.29 (drums), -19.51
  (bass), -15.72 (other) and -11.91 dB (vocals). Scored like e1416 (e1576): drums 7.80 / 8.06 / 16.24 / 8.88, bass
  7.60 / 9.53 / 21.90 / 9.81, guitar (other) 2.40 / 2.57 / 4.44 / 8.47, lead (vocals) 2.06 / 3.92 / 13.12 / 4.68.
  e1416 recomputed with mir_eval directly gives the e1416 numbers above.
- **Constraint inputs:** those of Demucs (the adapter changes weights only).

## demucs-onnx 0.3.4 (StemSplit): htdemucs_6s as ONNX, fp16 weights, ONNX Runtime on the CPU

- **What:** the wheel's METADATA summary: "Run and export HT-Demucs / Demucs music source separation as ONNX. Pure
  numpy + onnxruntime inference (no PyTorch). Supports htdemucs_ft (4-stem bag), htdemucs (single-file 4-stem), and
  htdemucs_6s (6-stem with guitar + piano). ..."; PyPI `demucs-onnx` 0.3.4 (uploaded 2026-05-22). Its
  `browser.py` ("Browser-runtime helpers: ``onnxruntime-web`` config snippets ...") writes a browser demo whose
  default model is StemSplit's htdemucs-ft vocals ONNX file; other Hugging Face ONNX URLs can be given (read from the
  package, not run; see "Demucs in the browser" above). License: the wheel's LICENSE
  reads "MIT License / Copyright (c) 2026 StemSplit"; the Hugging Face card of `StemSplitio/htdemucs-6s-onnx` has
  `license: mit` (Hub API, read 2026-11-10). For the underlying Meta weights see the Demucs license quote above.
- **Install:** `uv pip install demucs-onnx==0.3.4` into the MSST venv (added onnxruntime 1.31.1, huggingface-hub
  2.4.0). Model: `htdemucs_6s_fp16weights.onnx` 136,428,532 bytes from `StemSplitio/htdemucs-6s-onnx` (fetched with
  `hf_hub_download` before the run; the fp32 file is 258,159,781 bytes and was not fetched). No error.
- **Run:** r0471, `demucs-onnx separate S4.wav out --model htdemucs_6s --small --providers cpu -v` (inside batch C, 2
  cores): wall 56.27 s, CPU 112.7 s, **peak RSS 6204.5 MB** (the PyTorch htdemucs_6s run on the same clip, r0021,
  peaked at 1349.6 MB). (Corrected in gap round 2: not a 2-core figure. demucs-onnx leaves ONNX Runtime's thread
  count unset, and with that default the re-run r0610 had ORT worker threads pinned to CPUs 1, 2 and 3 although the
  job's slot was CPUs 0-1; with 2 threads, r0612, S4 took 61.33 s wall. See "Gap round 2".)
- **Output:** `bass.wav`, `drums.wav`, `guitar.wav`, `other.wav`, `piano.wav`, `vocals.wav`, 44,100 Hz, 2 channels,
  PCM_16, 6,834,024 bytes each, same length as the input, stem sum lag 0, residual -12.05 dB.
- **S4 scored** (e1417, map guitar=guitar, lead=vocals): drums 8.91 / 9.61 / 21.95 / 9.90; bass 7.48 / 9.88 / 20.98 /
  10.27; guitar 1.04 / 2.75 / 15.29 / 3.12; lead 6.87 / 7.66 / 15.03 / 8.68. Projection of the true guitar: guitar
  0.303, piano 0.273, vocals 0.091 (PyTorch htdemucs_6s, r0021: guitar 0.358, piano 0.232, vocals 0.093). Its
  `guitar.wav` against the PyTorch run's `guitar.wav`: 10 log10(|onnx - pytorch|^2 / |pytorch|^2) = -12.41 dB
  (-11.32 dB relative to the ONNX file's energy), max |diff| 0.115. This is not a parity test of the ONNX export: the
  PyTorch CLI run draws a random shift (shifts=1), while demucs-onnx has none. (Correction by the verifier: the trial
  text said both runs draw a random shift. `demucs_onnx/inference.py` has no random offset: a fixed quarter-segment
  overlap-add with a triangular window over 7.8 s segments, and the log of r0471 prints "chunks: 7 x 343,980
  samples (7.8 s)".)
- **Verifier re-run of r0471** (r0548, output under `verify/out/`, cores 2-3, load1 3.33; the venv re-created from
  `samples/msst/uv-pip-freeze-venv-msst.txt`, identical freeze): wall 50.44 s, CPU 109.1 s, peak RSS 6204.5 MB
  (corrected in gap round 2: not a 2-core figure either, same default ORT threads; its CPU time is 2.16 x its wall
  time). All six stems are sample-identical to r0471's, and the re-scoring (e1577) equals e1417. e1417 recomputed with mir_eval
  directly gives the same numbers.
- **Constraint inputs:** `--model`, `--stem` / `--stems`, `--precision fp32|fp16weights` (`--small`), `--providers
  auto|cpu|coreml|cuda|dml|wasm`, `--mix-stems`, `--karaoke`, `--mp3`.

## ZFTurbo Music-Source-Separation-Training (PyPI `msst` 0.1.0): becruily Mel-Band RoFormer guitar, BS-RoFormer-SW

- **What:** MSST, the training and inference framework behind many community RoFormer checkpoints; PyPI `msst` 0.1.0
  (uploaded 2026-09-09, author "Roman Solovyev (ZFTurbo)", homepage https://github.com/ZFTurbo/Music-Source-Separation-Training),
  console script `msst-inference`. Code license MIT per survey.md (`license_expression: 'MIT'`; verifier: the PyPI
  metadata says `MIT`, and the repository's LICENSE reads "MIT License / Copyright (c) 2024 Roman Solovyev (ZFTurbo)",
  https://raw.githubusercontent.com/ZFTurbo/Music-Source-Separation-Training/main/LICENSE, read 2026-11-10).
- **Install (worked) and one refusal:** a `git clone --depth 1` of the repository (head `1d4b3c4`, 2026-11-10; the
  verifier's `git ls-remote` shows the same head) was made; the trial agent reports that running its `inference.py`
  from inside the clone was refused by its session's permission check ("Code from External"; no log of that kept),
  so the clone was deleted and the PyPI package was used instead: `uv venv --python 3.11
  venv-msst`; `uv pip install torch==2.15.0 numpy scipy soundfile librosa ml_collections omegaconf beartype
  rotary_embedding_torch einops "hyper_connections==0.1.11" matplotlib tqdm pyyaml packaging` (the imports of the
  inference path; the repository's full `requirements.txt` also lists wandb, bitsandbytes, wxpython, transformers and
  more); then `uv pip install --no-deps msst==0.1.0`, because the package declares `torch<2.12,>=2.0.1` and the box
  already had torch 2.15.0 in the shared cache (installing 2.11 would have been a second torch). It ran with torch
  2.15.0+cpu; this combination is outside the package's declared range. Deleted after the runs. Freeze (taken after
  demucs-onnx was added to the same venv): `samples/msst/uv-pip-freeze-venv-msst.txt`. (Correction by the verifier:
  the trial text gave the venv as "95 MB by du". Re-created from that freeze, the venv measures 1.4 GB by `du` alone;
  `du` counts hard-linked files once per call, so listing several venvs in one `du` call shows much smaller figures
  for the later ones: `du -sh venv-*` printed 95M for `venv-uvr` that way.)
- **Checkpoints:** `becruily_guitar.ckpt` 45,142,183 bytes (sha256 `83472bbf...a83c`) and `config_guitar_becruily.yaml`
  from https://huggingface.co/becruily/mel-band-roformer-guitar (not gated; Hub API lists no license tag; the config
  gives `instruments: [Guitar, Other]`, `target_instrument: Guitar`, `num_stems: 1`, `dim 256`, `depth 4`,
  `num_bands 60`, chunk 485,100 samples, inference `num_overlap: 2`). BS-RoFormer-SW: the same
  `BS-Roformer-SW.ckpt` (699,412,152 bytes) and `BS-Roformer-SW.yaml` that audio-separator downloaded (next section).
- **Runs** (`msst-inference --model_type <type> --config_path <yaml> --start_check_point <ckpt> --input_folder <dir
  with one clip> --store_dir <out> --force_cpu --disable_detailed_pbar`; defaults otherwise: `--pcm_type FLOAT`, no
  TTA, bigshifts 1; inside batch C, 2 cores; "Elapsed time" is what msst printed):

| run | model | clip | wall s | CPU s | peak RSS MB | msst "Elapsed time" s | model load s |
|---|---|---|---|---|---|---|---|
| r0473 | becruily Mel-Band RoFormer guitar | S4_0-10s (10.0 s) | 87.16 | 110.1 | 1835.0 | 78.95 | 3.03 |
| r0480 | becruily Mel-Band RoFormer guitar | S2s (29.4 s) | 211.79 | 343.0 | 1798.3 | 204.40 | 2.83 |
| r0491 | becruily Mel-Band RoFormer guitar | S4 (38.7 s) | 289.53 | 443.7 | 1818.9 | 281.98 | 2.91 |
| r0492 | BS-RoFormer-SW (6 stems) | S4_0-10s (10.0 s) | 156.64 | 246.5 | 2734.0 | 146.78 | 5.15 |

  Batch C itself is r0493 (cores 2-3, waited 4080.5 s for its slot, wall 951.71 s).
- **Output format:** `<store_dir>/<input file stem>/<instrument>.wav`, float32 WAV (FLOAT), 44,100 Hz, 2 channels,
  same frame count as the input. The guitar model writes only `Guitar.wav` (its `target_instrument`; the "Other"
  part is written only with `--extract_instrumental`, not used here). BS-RoFormer-SW writes `bass`, `drums`, `other`,
  `vocals`, `guitar`, `piano`.
- **becruily guitar, measured:** on S4 `Guitar.wav` is -39.19 dBFS RMS (mix -17.37); projection of the true guitar on
  it 0.0773 (bass 0.0030, drums 0.0084, lead 0.0087); `gtr-eval stems --map guitar=Guitar.wav --sdr-mode single`
  (e1425): SI-SDR -2.65 dB, SDR -1.08 dB. First 10 s of S4 (e1418, `--max-seconds 10`): SI-SDR -4.25, SDR -1.67;
  `Guitar.wav` -51.18 dBFS, true-guitar projection 0.0209 (recomputed by the verifier). On S2s (one steel guitar, mix
  -18.23 dBFS) `Guitar.wav` is -49.83 dBFS. On these FluidR3_GM steel-guitar renders the guitar stem's level is 21.8
  (S4) and 31.6 dB (S2s) below the mix level, and the projection of the true guitar on it is 0.0773 (S4). It was not
  run on the real recordings R3a to R3c (time).
  **Verifier re-run of r0473** (r0547, output under `verify/out/`, cores 2-3, load1 3.44): wall 67.64 s, CPU 104.3 s,
  peak RSS 1845.1 MB; `Guitar.wav` is sample-identical to r0473's. e1425 recomputed with mir_eval directly: SI-SDR
  -2.65, SDR -1.08 dB.
- **BS-RoFormer-SW through MSST, first 10 s of S4** (truth trimmed to 10 s, `--max-seconds 10`): the GM "Voice Oohs"
  lead went to `other` (projection 0.910), `vocals` and `piano` are at -114.45 and -111.17 dBFS; true guitar 0.925 in
  `guitar`. e1427 with the map drums, bass, guitar=guitar, lead=other: drums 13.63 / 14.06 / 25.30 / 14.41, bass
  14.17 / 15.06 / 22.81 / 15.88, guitar 12.36 / 13.25 / 18.02 / 15.08, lead (= other) 13.59 / 15.31 / 24.00 / 15.96
  (SI-SDR / SDR / SIR / SAR dB). Against audio-separator's run of the same checkpoint on the same file (r0489) the
  four stems that carry sound (bass, drums, guitar, other) differ by -22.70 to -23.21 dB (difference level relative
  to audio-separator's file; -22.67 to -23.15 dB relative to MSST's), max |diff| 0.037 to 0.072 (recomputed by the
  verifier; `piano` and `vocals` are near-silent in both). Which processing difference causes this was not isolated.
  What the two codes do (read by the verifier in the installed packages): MSST's `demix` takes the config's
  `audio.chunk_size` (588,800 samples) and `inference.num_overlap` (2); audio-separator 0.48.0 derives the Roformer
  chunk length from the model's `stft_hop_length` and `dim_t` (`mdxc_separator.py`), uses a Hamming window, and
  takes the overlap from the model config when `--mdxc_overlap` is not given, so 2 here as well. audio-separator's
  `--normalization 0.9` only scales a signal whose peak is above 0.9 (`spec_utils.normalize`), and neither this
  input (`S4_0-10s` peaks at 0.815) nor any of its stems (peaks 0.0000 to 0.609) is above 0.9, so it did not change
  these files. (Correction by the verifier: the trial text named the 0.9 normalisation and MSST's overlap of 2 as
  differences between the two runs.)
- **Constraint inputs for a re-run:** `--model_type`, `--config_path` (chunk size, overlap and instruments are in the
  YAML), `--extract_instrumental`, `--use_tta`, `--bigshifts`, `--pcm_type`, `--flac_file`, `--lora_checkpoint_peft`
  / `--lora_checkpoint_loralib`, `--filename_template`. No pitch or tuning parameters.

## SCNet Small (MUSDB18) through PyPI `msst` 0.1.0 (run by the verifier)

- **What:** SCNet ("SCNet: Sparse Compression Network for Music Source Separation", the title the README of
  https://github.com/starrytong/SCNet gives for its official implementation), as the "SCNet Small (by starrytong)"
  checkpoint in ZFTurbo's `docs/pretrained_models.md` (4 stems: drums, bass, other, vocals; no guitar stem). Not in
  audio-separator 0.48.0's catalogue (see "NOT RUN HERE"); the trial agent skipped it "for lack of time". Run here
  by `verify-trials-source-separation`, 2026-11-10.
- **License:** MSST's LICENSE: "MIT License / Copyright (c) 2024 Roman Solovyev (ZFTurbo)"
  (https://raw.githubusercontent.com/ZFTurbo/Music-Source-Separation-Training/main/LICENSE, read 2026-11-10). SCNet's
  LICENSE: "MIT License / Copyright (c) 2024 starrytong" (https://raw.githubusercontent.com/starrytong/SCNet/main/LICENSE,
  read 2026-11-10). No license for the checkpoint itself is stated in `pretrained_models.md` (searched for "licen",
  2026-11-10); the file names say `musdb18` and the row reports "MUSDB test" scores, but the training data is not
  stated there, and the weights' license is UNVERIFIED.
- **Install:** none beyond the MSST venv above (re-created by the verifier from the saved freeze; `msst/models/scnet`
  ships with the package). Checkpoint `scnet_checkpoint_musdb18.ckpt` 42,434,986 bytes (sha256 `1bc0d1ab...e2aa`) and
  `config_musdb18_scnet.yaml` 1,739 bytes from
  `https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/download/v.1.0.6/` (the links in that table
  row), kept in `/home/user/gtr/lanes/source-separation/verify/models/scnet/`. Config: `chunk_size: 485100`,
  `num_overlap: 4`, `normalize: true`, `dims [4, 32, 64, 128]`, `nfft 4096`, `hop_size 1024`.
- **Runs** (`msst-inference --model_type scnet --config_path config_musdb18_scnet.yaml --start_check_point
  scnet_checkpoint_musdb18.ckpt --input_folder <dir with one clip> --store_dir verify/out/msst-scnet-musdb18
  --force_cpu --disable_detailed_pbar`; `scripts/verify-trials-reruns.sh wave3-scnet`; cores 2-3; the output folder
  was then moved to `out/msst-scnet-musdb18/` and scored there):

| run | clip | wall s | CPU s | peak RSS MB | load1 at start | msst "Elapsed time" s | model load s |
|---|---|---|---|---|---|---|---|
| r0559 | S4 (38.7 s) | 109.10 | 197.1 | 3372.2 | 4.09 | 106.08 | 0.13 |
| r0560 | S6taps (29.4 s) | 98.94 | 165.5 | 3333.7 | 3.76 | 95.76 | 0.13 |

  Each run printed two torch `UserWarning`s ("A window was not provided. A rectangular window will be applied ...")
  from `torch.stft` / `torch.istft` as called by `msst/models/scnet/scnet.py`.
- **Output format:** `out/msst-scnet-musdb18/<clip>/{drums,bass,other,vocals}.wav`, float32 WAV (FLOAT), 44,100 Hz,
  2 channels, frame count equal to the input; stem sum at lag 0, residual -36.06 dB (S4) and -36.07 dB (S6taps).
  Facts: `samples/msst/stemfacts_scnet-musdb18_<clip>.json`.
- **S4** (e1596; map drums, bass, guitar=other, lead=vocals; SI-SDR / SDR / SIR / SAR dB): drums 9.61 / 11.78 /
  22.88 / 12.15; bass 7.27 / 8.50 / 18.19 / 9.06; guitar (other) 2.23 / 2.39 / 3.86 / 9.31; lead (vocals) 2.45 /
  4.29 / 16.67 / 4.64. Projection of the true lead: other 0.504, vocals 0.470; of the true guitar: other 0.884.
  Stem levels (mix -17.37 dBFS): other -20.73, bass -25.41, vocals -26.59, drums -29.39 dBFS.
- **S6taps** (e1597; map guitar=other, taps=drums): guitar 21.73 / 21.93 / 23.82 / 26.48; taps 7.57 / 11.13 / 23.61 /
  11.40. Projection of the true taps: drums 0.797, other 0.213; of the true guitar: other 0.995, drums 0.003. Levels
  (mix -18.03): other -18.24, drums -33.08, vocals -73.43, bass -75.70 dBFS. Onsets of `drums.wav`
  (`scripts/onsets_of_stem.py`, `samples/onsets-handoff/scnet-musdb18_S6taps_drums_onsets.txt`) against the 32 taps
  (e1595, 50 ms window): 47 onsets, F 0.810, precision 0.681, recall 1.000, 32 / 32 matched, median timing
  -0.0057 s.
- **Constraint inputs for a re-run:** those of `msst-inference` (above); chunk size and overlap are in the YAML. No
  pitch or tuning parameters.

## python-audio-separator 0.48.0 and the UVR model zoo (VR, MDX-Net, Demucs, MDX23C, BS-RoFormer, BS-RoFormer-SW)

- **What:** a CLI and Python package that runs Ultimate Vocal Remover's model families and downloads their
  checkpoints; PyPI `audio-separator` 0.48.0 (uploaded 2026-10-29), https://github.com/nomadkaraoke/python-audio-separator.
- **License:** LICENSE "MIT License / Copyright (c) 2023 karaokenerds"; README: "This project is licensed under the MIT
  [License](LICENSE)." and "**Please Note:** If you choose to integrate this project into some other project using the
  default model or any other model trained as part of the [UVR] project, please honor the MIT license by providing
  credit to UVR and its developers!" (raw LICENSE and README.md on `main`, read 2026-11-10). No per-model license is
  in the catalogue JSON.
- **Install (worked):** `uv venv --python 3.11 venv-uvr && uv pip install "audio-separator[cpu]==0.48.0"` (torch
  2.15.0+cpu, torchvision 0.29.2+cpu, onnxruntime 1.31.1, onnx-weekly 1.24.0.dev20261102, onnx2torch-py313 1.6.0,
  librosa 0.11.0, numpy 2.4.6, diffq 0.2.4, rotary-embedding-torch 0.6.5, pydub 0.25.1, samplerate 0.1.0). Venv 1.4 GB
  by du (hard-linked from the shared cache). No error. At run time it logged "No hardware acceleration could be
  configured, running in CPU mode" and found "ffmpeg version 6.1.1-3ubuntu5".
- **Model catalogue:** `audio-separator -l --list_format json` (`samples/audio-separator/model_catalogue_0.48.0.json`,
  80,286 bytes): 169 entries: VR 29, MDX 39, Demucs 4, MDXC 97 (MDX23C and the RoFormers). Default model (`--help`):
  `model_bs_roformer_ep_317_sdr_12.9755.ckpt`. Entries whose stems name a guitar: `htdemucs_6s.yaml`; the entry
  `BS-Roformer-SW.ckpt` lists no stems in the catalogue, and its YAML says `instruments: ['bass', 'drums', 'other',
  'vocals', 'guitar', 'piano']` (`samples/audio-separator/BS-Roformer-SW.yaml`). No entry contains "SCNet". Downloads:
  the code tries `https://github.com/nomadkaraoke/python-audio-separator/releases/download/model-configs/<file>` first
  and the original UVR release URL second (`separator.py`, `download_model_files`); for the Demucs `.th` file the
  catalogue's `download_files` give `https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/5c90dfd2-34c22ccb.th`,
  which the same code tries after the mirror (verifier: both hosts answer HTTP HEAD with 54,996,327 bytes; which host
  served each file was not logged). Files used (bytes):
  `1_HP-UVR.pth` 126,792,647; `UVR-MDX-NET-Inst_HQ_3.onnx` 66,759,214; `5c90dfd2-34c22ccb.th` (htdemucs_6s)
  54,996,327; `MDX23C-8KFFT-InstVoc_HQ.ckpt` 448,101,203; `model_bs_roformer_ep_317_sdr_12.9755.ckpt` 639,331,213;
  `BS-Roformer-SW.ckpt` 699,412,152 (sha256 of each in `samples/audio-separator/model-files-sha256.txt`). The three
  largest were deleted after the runs for disk space.
- **Runs** (`scripts/batch_B.sh`: `audio-separator -m <model> --model_file_dir models/uvr --output_dir <out>
  --output_format WAV --custom_output_names '<lower-case names>' <clip>.wav`, every other option at its default:
  `--normalization 0.9`, MDX segment 256 / overlap 0.25, VR window 512 / aggression 5, Demucs shifts 2 / overlap 0.25,
  MDXC overlap from the model config; inside batch B, 2 cores; "separation" is the tool's own "Separation duration"
  line):

| run | architecture: model | clip | wall s | CPU s | peak RSS MB | separation (tool) | stems written |
|---|---|---|---|---|---|---|---|
| r0481 | VR: `1_HP-UVR.pth` | S4 (38.7 s) | 109.83 | 159.4 | 2198.2 | 1:43 | instrumental, vocals |
| r0487 | MDX-Net: `UVR-MDX-NET-Inst_HQ_3.onnx` | S4 | 86.42 | 153.0 | 3160.8 | 1:15 | instrumental, vocals |
| r0490 | Demucs: `htdemucs_6s.yaml` | S4 | 68.34 | 96.3 | 1723.9 | 1:02 | bass, drums, other, vocals, guitar, piano |
| r0489 | MDXC RoFormer: `BS-Roformer-SW.ckpt` | S4_0-10s (10.0 s) | 110.34 | 184.5 | 2354.6 | 1:40 | bass, drums, other, vocals, guitar, piano |
| r0496 | MDXC MDX23C: `MDX23C-8KFFT-InstVoc_HQ.ckpt` | S4_0-10s | 502.83 | 771.1 | 2230.6 | 8:15 | instrumental, vocals |
| r0498 | MDXC BS-RoFormer: `model_bs_roformer_ep_317_sdr_12.9755.ckpt` | S4_0-10s | 170.47 | 300.6 | 2227.5 | 2:42 | instrumental, vocals |
| r0502 | VR: `1_HP-UVR.pth` | R2 (36.0 s) | 88.22 | 137.1 | 2018.5 | 1:22 | instrumental, vocals |
| r0503 | MDX-Net: `UVR-MDX-NET-Inst_HQ_3.onnx` | R2 | 76.06 | 148.8 | 3165.8 | 1:05 | instrumental, vocals |

  (Corrected in gap round 2: the two MDX-Net rows, r0487 and r0503, are not 2-core figures. That model runs through
  ONNX Runtime with no thread count set, and the re-run r0615 of r0487 had ORT worker threads pinned to CPUs 1, 2 and
  3 while the job's slot was CPUs 0-1; with 2 threads, r0619, S4 took 66.38 s wall. See "Gap round 2". In the
  installed package only `mdx_separator.py` calls `ort.InferenceSession`; the other rows run in PyTorch.)
  The RoFormer and MDX23C models were run on the first 10 s of S4 only. Extrapolating r0496 linearly to the 228.5 s
  song (an extrapolation, not a measurement): 502.83 s x 228.5 / 10 = 11,490 s, about 3.2 hours on 2 cores;
  r0498: 170.47 x 22.85 = 3,895 s; r0489: 110.34 x 22.85 = 2,521 s.
- **Output format:** one WAV per stem, 44,100 Hz, 2 channels, PCM_16 ("Detected input bit depth: 16-bit" ... "Writing
  output with 16-bit depth", "Using pydub for writing"). The default `--normalization 0.9` ("Max peak amplitude to
  normalize input and output audio to", `--help`) scales a signal down to a peak of 0.9 only when its peak is above
  0.9 (`spec_utils.normalize`: `if maxv > max_peak: wave *= max_peak / maxv`): R2 (input peak 0.989) gave stems
  that peak at -0.92 dBFS = 0.90, while the S4 input (peak 0.891) and its stems (peaks -1.41 dBFS and lower) were not
  scaled. On R2 the stem-sum residuals are -14.71 / -13.39 dB against -37.71 / -34.39 dB on S4 (next lines); whether
  the scaling accounts for that was not isolated (verifier). Frame count equal to the input for MDX-Net, Demucs, MDX23C
  and the RoFormers (files 34 bytes larger than the input WAV: a `LIST`/`INFO` chunk with `ISFT` "Lavf60.16.100");
  **the VR model's files are shorter: 463 frames short on S4 (1,708,032 vs 1,708,495) and 400 short on R2**, still
  aligned at lag 0. Residual of the stem sum against the mix: VR -37.71 dB (S4), MDX-Net -34.39 dB (S4), Demucs 6s
  -12.16 dB (S4), BS-RoFormer-SW -36.86 dB, MDX23C -68.24 dB, BS-RoFormer -72.07 dB (first 10 s of S4), VR -14.71 dB
  and MDX-Net -13.39 dB (R2).
  **Verifier re-run of r0481** (r0531, cores 2-3, load1 3.67): wall 84.6 s, CPU 138.1 s, peak RSS 2052.2 MB; both
  files sample-identical to r0481's, again 1,708,032 frames. e1421 recomputed with mir_eval directly: instrumental
  7.54 / 7.64 / 8.69 / 14.88, lead 4.72 / 6.14 / 19.10 / 6.42, as below.
- **S4, scored.** For the two-stem models a reference `instrumental` = drums + bass + guitar truth stems
  (`inputs/S4_truth_2stem/instrumental.wav`, made with `scripts/sum_stems.py`, sha256 `a1b467a8...309a`) and `lead`
  = the truth lead stem; SI-SDR / SDR / SIR / SAR dB:

| eval | model | scope | scores |
|---|---|---|---|
| e1421 | VR `1_HP-UVR` | S4 | instrumental 7.54 / 7.64 / 8.69 / 14.88; lead (= vocals) 4.72 / 6.14 / 19.10 / 6.42 |
| e1422 | MDX-Net `Inst_HQ_3` | S4 | instrumental 3.18 / 3.28 / 3.46 / 18.64; lead -3.16 / -1.92 / 1.68 / 2.82 |
| e1433 | VR `1_HP-UVR` | first 10 s | instrumental 7.45 / 8.14 / 8.99 / 16.18; lead 4.26 / 6.57 / 16.82 / 7.09 |
| e1434 | MDX-Net `Inst_HQ_3` | first 10 s | instrumental 3.17 / 3.76 / 3.77 / 37.75; lead -3.42 / -3.04 / -2.96 / 19.43 |
| e1429 | MDX23C | first 10 s | instrumental 3.17 / 3.77 / 3.77 / 49.98; lead -10.35 / -7.49 / -0.79 / -3.03 |
| e1431 | BS-RoFormer (viperx 1297) | first 10 s | instrumental SI-SDR 3.16; `vocals.wav` is all zeros, so mir_eval refused the SDR ("All the estimated sources should be non-silent ...") |
| e1426 | Demucs `htdemucs_6s` | S4 | drums 9.05 / 9.78 / 21.91 / 10.08; bass 7.28 / 9.76 / 21.38 / 10.10; guitar 1.56 / 3.33 / 14.71 / 3.81; lead 7.96 / 8.54 / 15.24 / 9.71 |
| e1420 | BS-RoFormer-SW | first 10 s, lead mapped to `other` | drums 14.06 / 14.39 / 25.49 / 14.76; bass 14.59 / 15.53 / 24.42 / 16.14; guitar 13.60 / 14.33 / 19.45 / 15.97; lead 14.77 / 16.34 / 24.83 / 17.01 |
| e1423 | BS-RoFormer-SW | first 10 s, lead mapped to `vocals` | same drums / bass / guitar; lead -45.57 / -33.26 / -17.25 / -15.82 |

  For comparison on the same 10 s, PyTorch Demucs `htdemucs_6s` (first-pass r0021 output, e1424): drums 9.01 / 9.66,
  bass 5.75 / 8.56, guitar -1.63 / 1.59, lead 6.95 / 8.68 (SI-SDR / SDR).
  **Where the GM "Voice Oohs" lead went:** VR `vocals` 0.516 of its projection (instrumental 0.470); MDX-Net `vocals`
  0.169 (instrumental 0.808); MDX23C `vocals` 0.0019 and BS-RoFormer `vocals` 0 (`vocals.wav` -67.52 dBFS and all
  zeros); BS-RoFormer-SW `other` 0.923, `vocals` 0 (-111.73 dBFS); Demucs 6s `vocals` 0.834. **Where the true
  guitar went:** BS-RoFormer-SW `guitar` 0.939 (first 10 s); Demucs 6s through audio-separator `guitar` 0.329, `piano`
  0.228 (S4).
- **R2** (artist's instrumental and `vocals_derived`): VR (e1435) instrumental 10.96 / 11.52 / 17.90 / 12.73, vocals
  12.98 / 13.34 / 19.44 / 14.61; MDX-Net (e1439) instrumental 12.58 / 13.00 / 24.54 / 13.33, vocals 14.40 / 14.60 /
  20.89 / 15.80. The VR files are 400 frames shorter than the reference; gtr-eval trims to the shortest length.
- **gtr-eval note:** for the all-zero `vocals.wav` (e1431) gtr-eval wrote `"si_sdr_db": "inf"` for the lead. Its
  formula gives 0/0 when the estimate is all zeros; "inf" there is not a measurement of separation quality.
  (Verifier: `vocals.wav` is all zeros, 441,000 x 2 samples; `si_sdr` in `gtr_eval.py` (line 2156) returns `inf`
  when the residual energy is 0 and checks that before the target energy, which is also 0 here.) (Gap round 2: the
  same with gtr-eval 0.12.1, e1836, where `si_sdr` is at line 2221; see "Gap round 2".)
- **Constraint inputs for a re-run:** `-m` (model), `--single_stem`, `--extra_models` + `--ensemble_algorithm` /
  `--ensemble_preset`, `--normalization`, `--amplification`, `--sample_rate`, `--chunk_duration`, and per-family
  settings (`--mdx_segment_size`, `--mdx_overlap`, `--vr_window_size`, `--vr_aggression`, `--vr_enable_tta`,
  `--demucs_shifts`, `--demucs_overlap`, `--mdxc_overlap`, `--mdxc_pitch_shift`). No tuning or note-range inputs;
  `--mdxc_pitch_shift` shifts the audio's pitch during processing.

## demucs.cpp (sevagh, commit 4edae49), htdemucs_6s from ggml f16 weights

- **What:** "C++17 library that implements inference for the Demucs v4 hybrid transformer and Demucs v3 hybrid
  models", Eigen-based, no PyTorch (README of https://github.com/sevagh/demucs.cpp; clone of 2026-11-10, head
  `4edae497a114de1ccb17ac9b4a2b8fc0144714d7`, committed 2026-11-06). The clone's LICENSE reads "MIT License /
  Copyright (c) 2023 Sevag H". README: "Demixing quality is practically identical to PyTorch as shown in the [SDR
  scores doc]" (the author's claim; not checked here beyond the one S4 run below).
- **Get and build:** `git clone --depth 1 https://github.com/sevagh/demucs.cpp` and `git submodule update --init
  --depth 1 vendor/eigen vendor/libnyquist vendor/googletest` (Eigen from gitlab.com; `vendor/demucs`, only needed for
  converting weights, skipped); `.git` folders deleted afterwards. Source tree 85 MB (trial agent's figure; the source
  tree was deleted after the build, the build folder and binaries remain). Weights: the pre-converted
  `ggml-model-htdemucs-6s-f16.bin` 54,855,129 bytes (sha256 `09704f4c...e856`) from the Hugging Face dataset
  `Retrobear/demucs.cpp` (card `license: mit`; it lists the origin URLs as Meta's
  `dl.fbaipublicfiles.com/demucs/hybrid_transformer/*.th` files).
- **First build failed** (r0465 configure exit 0; r0466 `cmake --build ... --target demucs.cpp.main
  demucs_mt.cpp.main -j2`, exit 2 after 22.03 s): GCC 13.3.0 stopped in the vendored Eigen,
  `Eigen/src/Core/arch/AVX512/PacketMathFP16.h:116:25: error: invalid 'static_cast' from type 'const Eigen::half' to
  type '_Float16'` (and at 216:39: "invalid user-defined conversion from 'const Eigen::half' to '_Float16'
  [-fpermissive]"). The project's CMakeLists.txt hard-codes `-march=native` in
  `CMAKE_CXX_FLAGS_RELEASE`, and on this box `g++ -march=native` turns on `-mavx512fp16` (checked with `g++
  -march=native -E -v -`; verifier: `g++ -march=native -Q --help=target` gives `-march=sapphirerapids` and
  `-mavx512fp16 [enabled]`). Flags used: `-DUSE_OPENBLAS=OFF` (Eigen + OpenMP path, OpenBLAS is not installed here).
- **Second build worked** (inside batch B): a 1-line compiler wrapper `scripts/gxx_no_avx512fp16.sh` (`exec g++ "$@"
  -mno-avx512fp16`) passed as `-DCMAKE_CXX_COMPILER`, fresh build directory: configure r0504 (1.10 s), build r0507:
  wall 113.27 s, CPU 192.0 s, peak RSS 989.6 MB, exit 0; binaries `demucs.cpp.main` 3,787,928 bytes and
  `demucs_mt.cpp.main` 3,821,088 bytes.
- **Runs** (`demucs_mt.cpp.main <ggml-model-htdemucs-6s-f16.bin> <clip>.wav <out dir> 2`, 2 threads, inside batch B):

| run | clip | wall s | CPU s | peak RSS MB | load1 at start |
|---|---|---|---|---|---|
| r0508 | S4_0-10s (10.0 s) | 66.36 | 130.4 | 3470.0 | 2.74 |
| r0509 | S4 (38.7 s) | 132.69 | 260.5 | 3596.6 | 2.40 |

  (The PyTorch `demucs -n htdemucs_6s` run on S4, r0021: wall 36.37 s, CPU 50.0 s, peak RSS 1349.6 MB.)
- **Output format:** `<out dir>/target_<index>_<source>.wav`: `target_0_drums`, `target_1_bass`, `target_2_other`,
  `target_3_vocals`, `target_4_guitar`, `target_5_piano`; float32 WAV (FLOAT), 44,100 Hz, 2 channels, 13,668,016
  bytes each for S4, frame count equal to the input, stem sum at lag 0 (residual -12.10 dB). For the 10 s clip
  (r0508) the program printed "Input samples: 441000", "Length in seconds: 10", "Number of channels: 2",
  "demucs_model_load returned true", "Starting Demucs (6-source) inference" and per-thread progress lines (for S4,
  r0509: "Input samples: 1708495", "Length in seconds: 38.7414").
- **S4 scored** (e1446; map drums, bass, guitar=target_4_guitar, lead=target_3_vocals; SI-SDR / SDR / SIR / SAR dB):
  drums 8.91 / 9.66 / 22.04 / 9.94; bass 7.16 / 9.58 / 20.78 / 9.96; guitar 0.02 / 1.51 / 15.08 / 1.84; lead 8.06 /
  8.61 / 15.06 / 9.86. Projection of the true guitar: guitar 0.286, piano 0.277, vocals 0.093; of the lead: vocals
  0.832. Its guitar stem against the PyTorch htdemucs_6s guitar stem (r0021): 10 log10(|cpp - pytorch|^2 /
  |pytorch|^2) = -5.35 dB (-4.24 dB relative to the demucs.cpp file's energy), max |diff| 0.215 (recomputed by the
  verifier). The PyTorch run draws a random shift; demucs.cpp's output was the same on a second run (below).
- **Verifier re-run of r0508** (r0541, output under `verify/out/`, cores 2-3, load1 3.49): wall 69.13 s, CPU 134.2 s,
  peak RSS 3487.6 MB; all six `target_*` files are sample-identical to r0508's. The build folder's `CMakeCache.txt`
  records `CMAKE_CXX_COMPILER` = the wrapper script and `USE_OPENBLAS:BOOL=OFF`; the binaries are 3,787,928 and
  3,821,088 bytes. e1446 recomputed with mir_eval directly gives the same 16 numbers.
- **Input facts:** WAV read through the vendored libnyquist; 44.1 kHz stereo used here. Other rates not tried.
- **Constraint inputs:** model file (4-source, 6-source, fine-tuned or v3 drivers), thread count (`demucs_mt`). None
  for pitch or tuning.

## Gap round 2

Added 2026-11-11 (from 00:20 UTC) by `gapfill-source-separation`, to close the gaps the `completeness-critic` listed
for this lane (`GAPS.md`, rows S1 and S2) and to run the tools the first round left out because of the disk notice.
Disk at the start: 8.6 GB free (`df -h /`, 00:20 UTC); `env.sh` still printed the "DISK LOW" notice quoted under "NOT
RUN HERE" (it is printed below 9,000 MB). The orchestrator's task for this round asked for these runs as long as 4 GB
stays free, one tool at a time, deleting each venv and its weights afterwards; the free disk is quoted below wherever
a download was made or considered. Same scoring, file layout and conventions as the sections above.

### Gaborformer (`sevagh/gaborformer`): NOT RUN HERE, installing the cloned repository was refused

- **What:** a 4-stem model (vocals, drums, bass, other; no guitar stem): NSGT front end and a BS-RoFormer-style
  network; sources and licenses in `survey.md`, section "Gaborformer". Weights (Hub API with `blobs=true`, read
  2026-11-11, not gated): `gaborformer-fp16.safetensors` 533,469,856 bytes, `gaborformer-fp32.safetensors`
  1,066,666,912 bytes, `gaborformer.pt` 1,067,423,581 bytes. There is no PyPI package
  (`https://pypi.org/pypi/gaborformer/json` answered HTTP 404 on 2026-11-11); the README installs from a clone:
  `git clone https://github.com/sevagh/gaborformer.git`, `cd gaborformer`, `python -m pip install -e .`.
- **What was done** (2026-11-11, 00:20 to 00:22 UTC): `git clone --depth 1 https://github.com/sevagh/gaborformer.git`
  (head `123a1c9`, committed 2026-11-08; 40 MB with `.git`); `uv venv --python 3.11 venv-gaborformer`; `uv pip install
  torch==2.15.0 numpy soundfile "soxr>=0.3.7" safetensors "huggingface_hub>=1.2,<2"` (the dependencies its
  `pyproject.toml` declares; installed torch 2.15.0+cpu, huggingface-hub 1.33.0, soxr 1.1.0, safetensors 0.8.0 without
  error); then `uv pip install --no-deps <the clone>`, which the session's permission system refused: "Permission for
  this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]." It was not retried
  another way. Afterwards `importlib.util.find_spec('gaborformer')` was `None` in that venv; the weights were not
  downloaded and no separation ran. The clone and the venv were deleted; the files read from the clone
  (`gaborformer/separate.py`, `gaborformer/pretrained.py`, `weights/README.md`) are kept under
  `/home/user/gtr/lanes/source-separation/gap2/fetched/gaborformer-web/`.
- **Read from the clone, not run** (for the steps and the handoffs): console script `gaborformer` =
  `gaborformer.separate:main`; options `--weights`, `--offline`, `--revision`, `--out`, `--precision bf16|fp16|fp32`
  (default `bf16`, "CUDA autocast dtype for the forward pass"), `--overlap` (default 0.5), `--compile`, `--batch-size`
  (default 8), `--cpu`. `separate()`'s docstring: "on the CPU the model runs in fp32"; `load_model`: "Weights load
  into an fp32 model whatever the file's dtype". Chunk length 352,800 samples (8.0 s at 44.1 kHz, `config.json` on the
  Hub). Input: soundfile, with an ffmpeg fallback, resampled to 44.1 kHz with soxr `quality="HQ"`, mono duplicated to
  stereo. Output: `<out>/<input name>/{vocals,drums,bass,other}.wav`, written with `sf.write(..., 44100,
  subtype="FLOAT")`. `pretrained.py` pins Hub revision `d0fccf6e32214d5e8a5a1d0501d0d53a2f82d85c` and refuses a file
  whose SHA-256 is not `cd586fa4...8c4a` (fp16).
- **Steps for Aaron:** `for-aaron.md`, item 8.

### ONNX Runtime threads: demucs-onnx and audio-separator's MDX-Net, re-run with a thread probe

- **The question** (`GAPS.md` row S2): both packages build their ONNX Runtime (ORT) session without a thread count.
  demucs-onnx 0.3.4 `demucs_onnx/inference.py` `_make_session` (lines 194 to 199): `sess_opts = ort.SessionOptions()`,
  `sess_opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL`, then `ort.InferenceSession(...)`.
  audio-separator 0.48.0 `separator/architectures/mdx_separator.py` lines 115 to 123: when `self.segment_size ==
  self.dim_t` it makes `ort.SessionOptions()`, sets only `log_severity_level`, and calls `ort.InferenceSession`
  (`UVR-MDX-NET-Inst_HQ_3.onnx` has `mdx_dim_t_set` 8 in `models/uvr/mdx_model_data.json`, 2^8 = 256 = the default
  segment size; the batch B log of r0487 has no "Model converted from onnx to pytorch" warning, which that code logs
  on the other branch). ONNX Runtime's threading page
  (https://onnxruntime.ai/docs/performance/tune-performance/threading.html, read 2026-11-11): "By default with
  intra_op_num_threads=0 or not set, each session will start with the main thread on the 1st core (not affinitized).
  Then extra threads per additional physical core are created, and affinitized to that core (1 or 2 logical
  processors)." and, for an explicit count, "there will be no affinity set to any of the created thread". `lscpu` on
  this box: 4 CPUs, 1 thread per core, 4 cores per socket. (`gtr-run` sets `OMP_NUM_THREADS=2` and pins the process
  to the slot; the default runs below had both and still started three ORT worker threads, two of them allowed only
  on CPUs outside the slot.)
- **What was run** (`scripts/gap2_ort_reruns.sh`, 2026-11-11 00:26 to 00:31 UTC, each a `gtr-run` job in the 2-core
  slot 0-1, S4): the first-round commands again, each wrapped in `scripts/gap2_thread_probe.py`, which reads
  `/proc/<pid>/task/*/status` (`Cpus_allowed_list`) and `/proc/<pid>/task/*/stat` (field 39, the CPU a thread last
  ran on; fields 14 and 15, its CPU time) every 0.25 s for the whole process tree; and the same commands with ORT's
  intra-op thread count set to 2 by `scripts/gap2_ort_threads.py`, which replaces `onnxruntime.InferenceSession` with
  a subclass that sets `sess_options.intra_op_num_threads = 2` before the tool is imported (the tool's files are not
  changed). New venv for demucs-onnx: `venv-ort` = `demucs-onnx==0.3.4 onnxruntime==1.31.1 numpy==2.4.6
  huggingface-hub==2.4.0 soundfile==0.14.0 soxr==1.1.0 tqdm==4.70.1` (the versions of `samples/msst/uv-pip-freeze-venv-msst.txt`,
  without the MSST packages); audio-separator ran from the existing `venv-uvr`.

| run | tool, model | ORT intra-op threads | wall s | CPU s | CPU / wall | peak RSS MB | load1 | threads seen at once (max) | CPU s by the thread's allowed CPUs (probe) |
|---|---|---|---|---|---|---|---|---|---|
| r0610 | demucs-onnx, htdemucs_6s fp16weights | default (not set) | 57.80 | 98.95 | 1.71 | 8051.0 | 3.16 | 7 | CPUs 0-1: 31.87; CPU 1 only: 22.74; CPU 2 only: 21.99; CPU 3 only: 21.76 |
| r0612 | demucs-onnx, htdemucs_6s fp16weights | 2 | 61.33 | 71.12 | 1.16 | 6203.9 | 5.97 | 5 | CPUs 0-1: 70.49 |
| r0615 | audio-separator, `UVR-MDX-NET-Inst_HQ_3.onnx` | default (not set) | 85.76 | 142.58 | 1.66 | 3166.0 | 6.63 | 15 | CPUs 0-1: 56.92; CPU 1 only: 28.34; CPU 2 only: 28.19; CPU 3 only: 27.87 |
| r0619 | audio-separator, `UVR-MDX-NET-Inst_HQ_3.onnx` | 2 | 66.38 | 93.76 | 1.41 | 3166.6 | 6.13 | 13 | CPUs 0-1: 92.60 |

  With the default setting each run had three ORT worker threads, each allowed on exactly one CPU (1, 2 and 3), from
  about 1.0 s (demucs-onnx) or 8.4 s (audio-separator) after the start until 1.0 to 1.5 s before the end; the threads
  allowed only on CPU 2 or CPU 3, which belong to the other slot, used 43.75 s (demucs-onnx) and 56.06 s
  (audio-separator) of CPU time, and field 39 of their `stat` (the CPU a thread last ran on) read 2 or 3 in every
  sample (`samples/gap2-ort/probe_*_S4.json`). With 2 threads every thread of the process stayed allowed on CPUs
  0-1. The probe's own CPU time (0.46 to 0.75 s per run) is included in the CPU column (it runs inside the job). The
  "CPU s by allowed CPUs" column is summed per thread from `/proc` at the last sample before exit; the CPU column is
  `gtr-run`'s rusage. (Verifier, round 2: the thread pattern was seen again with a separately written probe in the
  re-runs r0713 (= r0615), r0718 (= r0610) and r0719 (= r0612). r0610's peak RSS of 8051.0 MB was not reproduced:
  r0718, with the same freeze and the same default threads, peaked at 6203.9 MB, the figure of r0471, r0548 and r0612.
  See the verification log at the end.)
- **Output:** all stems of all four runs are sample-identical (max |diff| 0) to the first-round files of r0471
  (`out/demucs-onnx-htdemucs_6s-fp16/S4/`) and r0487 (`out/uvr/UVR-MDX-NET-Inst_HQ_3/S4/`)
  (`samples/gap2-ort/compare_with_first_round.txt`, `scripts/compare_runs.py`), so the scores e1417 and e1422 hold for
  these runs and they were not scored again; the duplicate files were deleted.
- **What this means for the first-round figures:** r0471 (56.27 s), r0548 (50.44 s, which the verifier ran in slot
  2-3), r0487 (86.42 s) and r0503 (76.06 s) ran with the same packages and the same default thread setting, so their
  ORT worker threads were not confined to the 2-core slot either (not observed for those runs: no probe ran then;
  r0548's CPU time is 2.16 x its wall time, above what 2 cores give). They are not 2-core figures. A 2-core figure for
  S4 is r0612 (demucs-onnx, 61.33 s) and r0619 (MDX-Net, 66.38 s). The same note is added next to each of the four
  timings above. The venv `venv-ort` (151 MB by `du`, hard-linked from the shared cache) was deleted afterwards
  (freeze: `samples/demucs-onnx/uv-pip-freeze-venv-ort.txt`).

### Banquet (`kwatcharasupat/query-bandit`): NOT RUN HERE, running the cloned repository's code was refused

- **What was done** (2026-11-11, 00:31 to 00:33 UTC; 7.8 GB free before): `git clone --depth 1
  https://github.com/kwatcharasupat/query-bandit.git` (head `79ed5bb`, 2025-07-29; 103 MB with `.git`). The repository
  has no package metadata, so a venv was made with the packages its code imports, from PyPI: `uv venv --python 3.11
  venv-banquet`; `uv pip install torch==2.15.0 torchaudio==2.11.1 torchcodec==0.17.0 pytorch_lightning torchmetrics
  torch_audiomentations omegaconf numpy pandas librosa scikit-learn tqdm fire hear21passt timm` (74 packages resolved
  without error, among them pytorch-lightning 2.6.6, torchmetrics 1.9.0, torch-audiomentations 0.12.0, hear21passt
  0.0.26, timm 1.0.31, omegaconf 2.4.0, librosa 0.11.0; 1.4 GB by `du`, hard-linked from the shared cache; freeze:
  `samples/banquet/uv-pip-freeze-not-run.txt`). Then the README's command, from the clone, with CPU and a checkpoint
  path that did not exist yet (to check that the code imports before downloading 552 MB): `CONFIG_ROOT=./config
  venv-banquet/bin/python train.py inference_byoq --ckpt_path=/nonexistent.ckpt --input_path=S4.wav
  --output_path=.../S4_guitar.wav --query_path=S4/stems/guitar.wav --batch_size=1 --use_cuda=false`. The session's
  permission system refused it: "Permission for this action was denied by the Claude Code auto mode classifier.
  Reason: [Code from External]." Nothing ran; it was not retried another way, and no weights were downloaded (the
  smallest checkpoints, `ev-pre-fz.ckpt`, `vdbgp-pre-fz.ckpt`, `vdb-pre-fz.ckpt` and the two `-bal` ones, are
  551,785,899 bytes each, Zenodo API 2026-11-11; the PaSST query weights the code would fetch on first use,
  `openmic-passt-s-f128-10sec-p16-s10-ap.85.pt`, are 341,546,630 bytes by HTTP HEAD). The clone and the venv were
  deleted (1.5 GB); copies of the files read are in
  `/home/user/gtr/lanes/source-separation/gap2/fetched/query-bandit/`.
- **What a query is, and what comes back** (read from that code, head `79ed5bb`; not run): the query is the audio
  file given as `--query_path` (anything `torchaudio.load` reads), resampled to 44.1 kHz if needed and cut or repeated
  to exactly 10 s (441,000 samples; `assert query_length_seconds == 10.0`). The separator never sees the query audio
  itself: `core/models/e2e/querier/passt.py` averages its channels to mono (`torch.mean(qaudio, dim=1)`), resamples
  it to 32 kHz, takes PaSST's mel spectrogram cut to 998 frames, and keeps the 768-number embedding of the PaSST model
  `get_basic_model(mode="embed_only", arch="openmic")` (the paper: "a PaSST model [27] trained on the OpenMIC-2018
  dataset"), projected to the conditioning size and applied to the separator through FiLM layers (model class
  `PasstFiLMConditionedBandit`, `additive_film: true`, `multiplicative_film: true` in `config/models/bandit-query.yml`). The mixture is cut into overlapping chunks (default test config
  `config/data/moisesdb-test.yml`: `chunk_size_seconds: 6.0`, `hop_size_seconds: 0.5`, `batch_size: 12`; for S4's
  1,708,495 samples that is 111 chunks by the formula in `core/models/ebase.py` `chunked_inference`), each chunk is
  separated with the same query embedding, and the chunks are overlap-added with a Hann window and trimmed to the
  mixture's length. What comes back is one waveform, the estimate of "the stem that sounds like the query", with
  the mixture's channels and length, resampled back to the mixture's rate when that is not 44.1 kHz, and written with
  `ta.save(output_path, estimate, fsm)` to `--output_path`. One call gives one stem; another stem needs another call with another query.
  `inference_byoq`'s default config is `./expt/bandit-everything-test.yml` and its default `stem_name` is "target".
- **Steps for Aaron:** `for-aaron.md`, item 3 (same route; its "Not run here" reason corrected, and a note added for
  the case that the run asks for the `DATA_ROOT` variable, which `config/data/moisesdb-test.yml` reads).

### `adityalakhani/htdemucs-6s-guitar-ft` (htdemucs_6s fine-tuned on guitar), through the steps of its `inference.py`

- **What:** a fine-tune of Demucs `htdemucs_6s` meant to give a guitar stem (card, license and the author's numbers:
  `survey.md`, "Models that output a guitar stem"; card metadata `license: apache-2.0`, `datasets: MoisesDB`, Hub API
  read 2026-11-11, repo sha `9d3ade8`, not gated). Repository files: `guitar_htdemucs_6s.pt` 329,654,071 bytes,
  `inference.py` 9,062, `config.yaml` 1,218, `requirements.txt` 162 (pins `demucs==4.0.1`).
- **Download** (2026-11-11 00:35 UTC; 6.9 GB free before, 6.6 GB after): `curl -L
  https://huggingface.co/adityalakhani/htdemucs-6s-guitar-ft/resolve/main/guitar_htdemucs_6s.pt` (12.4 s); SHA-256
  `4fde369e...260e`, equal to the Hub's LFS hash. Loaded with `torch.load(..., weights_only=True)`: a training
  snapshot with `epoch` 60, `model_state_dict` (525 tensors, 27,414,996 parameters, all float32: the parameter count
  of the stock `htdemucs_6s` above), `optimizer_state_dict`, `scaler_state_dict`, `val_loss` 0.2439 and `val_sdr_db`
  6.0798. The file was deleted after the runs.
- **How it was run:** the repository's `inference.py` was read, not run. `scripts/gap2_guitar_ft.py` does its steps
  with the lane's existing `venv-demucs` (demucs 4.1.0, torch 2.15.0+cpu; freeze
  `samples/htdemucs-6s-guitar-ft/uv-pip-freeze-venv-demucs.txt`): `get_model("htdemucs_6s")`, the snapshot's
  `model_state_dict` with every key prefixed `models.0.` (the script's rule for keys that do not match the
  `BagOfModels` wrapper; "<All keys matched successfully>"), audio read with soundfile, no input normalisation (the
  Demucs CLI normalises by the mix's mean and standard deviation; this script, like the repository's, does not),
  `apply_model(..., shifts=1, segment=7.8, overlap=0.25)`, output clamped to [-1, 1], written as PCM_24. It writes all
  six sources (the repository's script writes only source 4, `guitar`). Differences from the repository's script:
  demucs 4.1.0 instead of the pinned 4.0.1, no resampling step (all inputs are 44.1 kHz), and Python's random
  generator seeded with 0 (the random shift of `shifts=1`). The stock `htdemucs_6s` weights were run through the same
  script as a control (no `--checkpoint`). Driver `scripts/gap2_guitar_ft_runs.sh`; each run a `gtr-run` job, 2
  cores:

| run | weights | clip (length) | cores | wall s | CPU s | peak RSS MB | load1 | script: load / separate s |
|---|---|---|---|---|---|---|---|---|
| r0636 | guitar-ft | S4 (38.7 s) | 2-3 | 25.98 | 44.8 | 1606.5 | 1.48 | 0.99 / 22.94 |
| r0637 | guitar-ft | R2 (36.0 s) | 2-3 | 31.66 | 48.8 | 1644.9 | 2.38 | 0.86 / 28.69 |
| r0638 | stock htdemucs_6s, same script | S4 | 2-3 | 32.37 | 48.6 | 1280.4 | 3.66 | 2.16 / 28.21 |
| r0640 | guitar-ft | S6taps (29.4 s) | 2-3 | 22.45 | 39.2 | 1566.9 | 4.28 | 1.08 / 19.52 |
| r0642 | guitar-ft | S2s (29.4 s) | 0-1 | 22.28 | 39.0 | 1576.6 | 3.97 | 1.14 / 19.26 |
| r0644 | stock htdemucs_6s, same script | S6taps | 0-1 | 22.31 | 38.0 | 1210.0 | 3.55 | 1.03 / 19.19 |

- **Output format:** `out/htdemucs-6s-guitar-ft/<clip>/` and `out/htdemucs_6s-via-ft-script/<clip>/`:
  `drums`, `bass`, `other`, `vocals`, `guitar`, `piano` `.wav`, 44,100 Hz, 2 channels, PCM_24, frame count equal to
  the input's, stem sum at lag 0; residual of the stem sum against the mix -11.13 dB (guitar-ft S4), -8.40 (S6taps),
  -5.70 (S2s), -12.44 (R2); stock through the script -12.34 (S4), -12.16 (S6taps) (`scripts/stem_facts.py`;
  `samples/htdemucs-6s-guitar-ft/stemfacts_*.json`, `run_info_*.json`). The R2 `vocals.wav` of the fine-tune has 40
  of its 3,175,200 samples at full scale (the clamp; the script does not rescale as the Demucs CLI's `--clip-mode
  rescale` does). Scoring: `scripts/gap2_score_guitar_ft.sh`, one `gtr-run` job (r0645, 2 cores, wall 55.07 s),
  gtr-eval 0.12.0 (the first round used 0.11.1).
- **S4** (map drums, bass, guitar=guitar, lead=vocals; SI-SDR / SDR / SIR / SAR dB):

| eval | weights | drums | bass | guitar | lead |
|---|---|---|---|---|---|
| e1831 | guitar-ft | 7.98 / 8.58 / 22.44 / 8.79 | 7.85 / 9.02 / 20.95 / 9.35 | 6.10 / 6.35 / 10.43 / 8.87 | 7.85 / 8.31 / 14.22 / 9.76 |
| e1832 | stock, same script | 8.99 / 9.71 / 21.95 / 10.00 | 7.27 / 9.80 / 21.31 / 10.15 | 1.73 / 3.40 / 14.65 / 3.89 | 8.15 / 8.72 / 15.11 / 9.99 |

  (First round, stock htdemucs_6s through the Demucs CLI, e0095: guitar 1.89 / 3.36 / 14.40 / 3.87.) Projection
  <est, true>/<true, true> of the true stems (mono): guitar-ft: true guitar 0.898 in `guitar` (stock through the
  script: 0.345 in `guitar`, 0.218 in `piano`); the guitar-ft `guitar` stem also holds 0.121 of the true bass, 0.147
  of the true drums and 0.161 of the true lead; the true bass is 0.312 in `bass` (stock 0.7555) and the true drums
  0.477 in `drums` (stock 0.890); the lead 0.822 in `vocals` (stock 0.846). Stem levels, RMS dBFS (mix -17.37):
  guitar-ft guitar -21.69, vocals -23.04, bass -33.03, drums -34.45, other -68.88, piano -74.38; stock through the
  script vocals -22.83, bass -25.30, guitar -28.71, drums -29.21, piano -31.20, other -73.14.
- **S6taps** (map guitar=guitar, taps=drums): guitar-ft (e1833) guitar 3.02 / 4.07 / 17.70 / 4.33, taps 2.91 /
  11.22 / 24.92 / 11.42; stock through the script (e1834) guitar -7.75 / 0.34 / 29.56 / 0.35, taps 7.17 / 10.58 /
  25.57 / 10.73 (first round, stock through the Demucs CLI, e0119: guitar -8.05 / 1.64 / 29.82 / 1.65, taps 6.98 /
  10.87 / 26.26 / 11.01). Projections: guitar-ft true guitar 0.5465 in `guitar`, 0.177 in `piano`; true taps 0.413 in
  `drums`, 0.240 in `guitar`; stock true guitar 0.0635 in `guitar`, 0.755 in `piano`; true taps 0.8025 in `drums`.
- **S2s** (one synthesized steel guitar, no truth stems; mix -18.23 dBFS): guitar-ft piano -24.55, guitar -36.63,
  bass -52.44, other -55.54, vocals -59.18, drums -60.49 dBFS.
- **R2** (e1835; drums + bass + other + guitar + piano summed into `derived_instrumental_sum.wav` against the artist's
  instrumental, `vocals` against `vocals_derived`): instrumental 6.78 / 7.75 / 19.39 / 8.11, vocals 13.21 / 13.54 /
  18.85 / 15.11 (stock htdemucs_6s through the CLI, e1399: 10.77 / 11.23 / 20.82 / 11.77 and 13.42 / 13.74 / 19.88 /
  14.99). Stem levels (mix -10.27 dBFS): vocals -12.42, guitar -18.80, drums -26.06, bass -27.28, other -61.95, piano
  -67.90.
- **Constraint inputs** (the repository's `inference.py`): `--checkpoint`, `--device auto|cuda|cpu`, `--shifts`,
  `--overlap`; the segment is fixed at 7.8 s in its code. No pitch or tuning parameters.

### AudioSep: NOT RUN HERE, the 4 GB of free disk this round had to keep would not have stayed free

- **Disk, measured** (2026-11-11 00:42 UTC): 7,403 MB free (`df -BM /`; `df -h /` printed 6.6 to 8.6 GB between
  00:20 and 00:42 UTC while other lanes worked). The two checkpoints in the Hugging Face Space `Audio-AGI/AudioSep`
  (API with `blobs=true`, same time) are `checkpoint/audiosep_base_4M_steps.ckpt` 1,264,844,076 bytes and
  `checkpoint/music_speech_audioset_epoch_15_esc_89.98.pt` 2,352,471,003 bytes, 3,617,315,079 bytes (3,450 MB in
  `df -BM` units) together. After the download about 3,950 MB would have been left: under the 4 GB this round's task
  set as the floor, and under the 4,500 MB below which `env.sh` prints "DISK CRITICAL ... No download over 100 MB".
  Nothing was downloaded, so no AudioSep run, and no timing, exists from this box. The Space's runtime stage was
  still `RUNTIME_ERROR` (same API call). At the end of the round (01:06 UTC) 7,695 MB were free, which would have
  left about 4,245 MB: above 4 GiB, still under the 4,500 MB line of `env.sh`.
- **The code route:** there is no PyPI package (`https://pypi.org/pypi/audiosep/json` and `audio-sep`: HTTP 404,
  2026-11-11); the README runs `from pipeline import build_audiosep, inference` from a clone of the repository, the
  same kind of step (running a cloned repository's code) that the permission system refused for Gaborformer and
  Banquet above ("Reason: [Code from External]"). It was not attempted for AudioSep: at 00:42 the disk condition had
  already failed, and the permission system had refused that kind of step twice in this round.
- **Read from a clone** (`git clone --depth 1`, head `944583f`, 2024-11-26, 8.3 MB; deleted, copies of the files read
  in `/home/user/gtr/lanes/source-separation/gap2/fetched/audiosep/`): `pipeline.py` defines `build_audiosep` and
  `separate_audio(model, audio_file, text, output_file, device='cuda', use_chunk=False)`, and no function named
  `inference`, although the README's example imports `inference` from `pipeline` (as written, that import would
  fail; not run). `separate_audio` loads the input with `librosa.load(audio_file, sr=32000, mono=True)`, embeds the
  text with `model.query_encoder.get_query_embed(modality='text', text=[text], ...)`, and writes one mono 16-bit WAV
  at 32 kHz. `models/clap_encoder.py` defaults to `pretrained_path='checkpoint/music_speech_audioset_epoch_15_esc_89.98.pt'`,
  so the 2.35 GB CLAP file is needed besides the separator checkpoint.
- **Steps for Aaron:** `for-aaron.md`, item 2 (the function name in its local route corrected to `separate_audio`).

### Demucs 4.1.0 on the whole song R2full with all 4 cores (`gtr-run --all-cores`)

- **What was run:** the command of the 2-core runs r0472 and r0477, `demucs -n <htdemucs|htdemucs_6s> -d cpu -o <out>
  R2full.wav` (only the output folder changed), as `gtr-run --all-cores` jobs: both slots, CPUs 0-3,
  `OMP_NUM_THREADS=4` (`scripts/gap2_allcores_r2full.sh`). Because the first 4-core htdemucs run took longer than the
  2-core one, htdemucs was run once more with 4 cores and once with 2 cores in the same session, each with
  `scripts/gap2_box_sampler.py` recording every 2 s how busy each CPU of the box was and how much of that CPU time was
  the Demucs process (`scripts/gap2_allcores_repeat.sh`; summaries
  `samples/demucs-allcores/boxsampler_htdemucs_R2full_<n>cores_repeat.json`).

| run | model | cores | started (UTC) | wall s | CPU s | peak RSS MB | load1 at start | CPU s used by other processes during the run (sampler) |
|---|---|---|---|---|---|---|---|---|
| r0472 (first round) | htdemucs | 2 (inside batch A) | 2026-11-10 22:46 | 255.55 | 347.1 | 1798.0 | 5.38 | not recorded |
| r0659 | htdemucs | 4 | 2026-11-11 00:43 | 263.90 | 684.6 | 1776.6 | 0.98 | not recorded |
| r0669 | htdemucs | 4 | 2026-11-11 00:51 | 363.56 | 819.0 | 1740.2 | 2.63 | 622.0 of 1,438.1 busy CPU s in 368.8 s; mean load1 6.50 |
| r0677 | htdemucs | 2 (CPUs 2-3) | 2026-11-11 00:57 | 277.63 | 356.8 | 1763.8 | 5.25 | 723.5 of 1,079.1 busy CPU s in 284.6 s; mean load1 6.26 |
| r0477 (first round) | htdemucs_6s | 2 (inside batch A) | 2026-11-10 22:50 | 163.00 | 251.0 | 2163.8 | 5.98 | not recorded |
| r0660 | htdemucs_6s | 4 | 2026-11-11 00:47 | 109.55 | 334.0 | 2176.1 | 6.22 | not recorded |

  During r0669 the four CPUs were busy 97.4 to 97.9 % of the time (mean of the 2 s samples), and processes other than
  Demucs used 622.0 CPU seconds, an average of 1.7 CPUs; during r0677 other processes used 723.5 CPU seconds, an
  average of 2.5 CPUs (the box was shared with other lanes' unpinned work; the `gtr-run` ledger lines of other lanes
  that overlap r0659 are four short `--nolock` runs of under 3 s). With 4 cores the htdemucs runs used about twice
  the CPU time of the 2-core runs for the same song (684.6 and 819.0 s against 347.1 and 356.8 s); htdemucs_6s used
  334.0 s against 251.0 s. Why the CPU time grew was not isolated. One run per setting except htdemucs (two 4-core,
  two 2-core runs): these are single measurements on a shared box, not averages.
- **Output:** each run wrote its stems as 44,100 Hz, 2 channel PCM_16 WAVs of 10,076,073 frames (the input's), stem
  sum at lag 0; r0659: residual -25.74 dB, stem levels vocals -15.80, other -18.64, bass -21.25, drums -24.61 dBFS;
  r0660: residual -22.01 dB, vocals -15.76, guitar -19.20, bass -20.93, drums -25.08, other -46.49, piano -49.95 dBFS
  (first round, 2 cores: -25.54 and -23.04 dB; the stems differ from run to run because of the random shift,
  `--shifts 1`). Facts: `samples/demucs-allcores/stemfacts_<model>_R2full_4cores.json`. The audio of these four
  re-runs (r0659, r0660, r0669, r0677; 693 MB) was deleted after the facts were taken; the first-round stems stay in
  `out/htdemucs/R2full/` and `out/htdemucs_6s/R2full/`.

### Known issue in gtr-eval (recorded, tool not changed): SI-SDR "inf" for an all-zero estimate

- e1431 (gtr-eval 0.11.1, first round) scored the BS-RoFormer `vocals.wav` of the first 10 s of S4, which is all
  zeros, and wrote `"si_sdr_db": "inf"` for the lead (see the audio-separator section). The same scoring was run again
  with the current tool (r0688, 2 cores; e1836): the result file records gtr-eval 0.12.1 (the run's label says 0.12.0,
  the version `gtr-eval --version` had printed earlier in this round; 0.12.1 changed only `f0`, per its README) and
  again has `"si_sdr_db": "inf"` for the lead, `3.164122` for the instrumental, and in `processing` mir_eval's refusal "All the
  estimated sources should be non-silent (not all-zeros) ...; SDR not reported"
  (`samples/scores/gap2_gtreval_0.12.1_rerun_of_e1431.json`). In `gtr_eval.py` 0.12.1, `si_sdr` (line 2221) removes
  the means, computes `alpha = <est, ref> / <ref, ref>`, `tgt = alpha * ref`, `res = est - tgt`, and returns
  `float("inf")` when `<res, res>` is 0 before it checks whether `<tgt, tgt>` is 0 (which returns `-inf`). For an
  all-zero estimate both are 0, so the value written is "inf"; it is not a measurement of separation quality. In the
  eval ledger, the scorings that name this lane's folders and hold an infinite value are e1431, the verifier's re-run
  of it (e1564) and e1836; in `samples/scores/` only the files of e1431 and e1836 hold one.

### What gap round 2 changed outside this section

- `trials.md`: notes "(corrected in gap round 2: ...)" at the top of the file (4-core runs), at the demucs-onnx run
  r0471 and its verifier re-run r0548, under the audio-separator table (r0487, r0503), at the whole-song paragraph of
  "Demucs 4.1.0, further runs", at the gtr-eval note of the audio-separator section, and in "Tools NOT RUN HERE"
  (Banquet, AudioSep and the guitar fine-tune corrected; Gaborformer added); the handoff list and "Media kept outside
  git" list the new folders.
- `for-aaron.md`: item 2 (AudioSep: reason, and `separate_audio` instead of the README's `inference`), item 3
  (Banquet: reason, what the query is, `DATA_ROOT` note), item 5 (the guitar fine-tune ran here) and a new item 8
  (Gaborformer).
- `survey.md`: Gaborformer (packaging, file sizes, output format), Banquet (query path and output in the code, PaSST
  weights), AudioSep (`separate_audio`), the tool list's "Runnable here?" cells of these tools.
- `tools.json`: the entries of Gaborformer, Banquet, AudioSep, the guitar fine-tune, demucs-onnx, MDX-Net,
  python-audio-separator and Demucs, by `scripts/gap2_update_tools_json.py`.
- Venvs made and deleted in this round: `venv-gaborformer`, `venv-ort`, `venv-banquet`; `venv-demucs`, `venv-uvr`
  and `venv-librosa` (from the first round) were used and kept. Weights downloaded: only `guitar_htdemucs_6s.pt`
  (deleted). Free disk at the end of the round: 7,695 MB (`df -BM /`, 01:06 UTC); this round's own files outside
  `out/` take 488 KB (`gap2/`: copies of the files read, logs).

## Stems available for other lanes (handoffs)

All under `/home/user/gtr/lanes/source-separation/out/`, 44.1 kHz stereo WAV, same length and alignment as the input
clip unless noted. Guitar-bearing stems for transcription lanes: `htdemucs_6s/<clip>/guitar.wav` (S4, S6taps, S2s,
R2, R2full, R3a, R3b, R3c), `htdemucs/<clip>/other.wav` (S4, S6taps, S2s, R2, R2full, R3a, R3b, R3c),
`uvr/BS-Roformer-SW/S4_0-10s/guitar.wav` and `msst-bs-roformer-sw/S4_0-10s/guitar.wav` (first 10 s of S4 only),
`msst-becruily-guitar/<clip>/Guitar.wav` (float32; S4, S4_0-10s, S2s), `demucs.cpp-htdemucs_6s/S4/target_4_guitar.wav`
(float32), `msst-scnet-musdb18/<clip>/other.wav` (float32; S4, S6taps; that model has no guitar stem),
`htdemucs-6s-guitar-ft/<clip>/guitar.wav` (PCM_24; S4, R2, S6taps, S2s; gap round 2) and
`htdemucs_6s-via-ft-script/<clip>/guitar.wav` (PCM_24; S4, S6taps; the stock weights through the same script). Bass for
bass-line lanes: `<model>/<clip>/bass.wav` from htdemucs, htdemucs_6s, htdemucs_ft, mdx_extra, umxhq, umxl,
spleeter-4stems, msst-scnet-musdb18. Percussion for tap lanes: `<model>/S6taps/drums.wav` (htdemucs,
htdemucs_6s, umxhq, spleeter-4stems, msst-scnet-musdb18 (float32)) and `hpss/S6taps/<setting>/percussive.wav`
(float32), with onset lists already scored against the taps in `samples/onsets-handoff/`. Caveats per tool: VR
(`uvr/1_HP-UVR`) files are 463 (S4) and 400 (R2) frames shorter than the input; Demucs `--mp3` files are 1,368
frames longer and 1105 samples late as decoded by libsndfile (and by ffmpeg, same frame count);
`derived_instrumental_sum.wav` files are sums made here for scoring, not tool output. Other lanes' runs that already
used these stems as input are in the eval ledger (for example e0161 to e0170, e0950 and e0965, by the
fingerstyle-voices-taps lane).

## Media kept outside git

Every audio file this lane produced, in `/home/user/gtr/lanes/source-separation/out/` (listed by
`scripts/media_list.py` at 2026-11-10 23:20 UTC; durations from the file headers). Inputs are the shared clips
(INPUTS.md) except `inputs/S4_0-10s` (first 441,000 samples of S4, `sox ... trim 0
441000s`) and `inputs/S4_truth_2stem/instrumental.wav` (drums + bass + guitar truth stems of S4, float32), all made
here from the S4 files (synthesized for this research; INPUTS.md gives the license).

| folder under out/ | files | size | duration (s) | format |
|---|---|---|---|---|
| `demucs-guitar-lora/S2s` | bass.wav, drums.wav, other.wav, vocals.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-guitar-lora/S4` | bass.wav, drums.wav, other.wav, vocals.wav | 27.3 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-onnx-htdemucs_6s-fp16/S4` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 41.0 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-options/base-10s/htdemucs/S4_0-10s` | bass.wav, drums.wav, other.wav, vocals.wav | 7.1 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-options/float32-10s/htdemucs/S4_0-10s` | bass.wav, drums.wav, other.wav, vocals.wav | 14.1 MB | 10.0 | 44100 Hz / 2 ch / FLOAT |
| `demucs-options/jobs2-10s/htdemucs/S4_0-10s` | bass.wav, drums.wav, other.wav, vocals.wav | 7.1 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-options/mp3-10s/htdemucs/S4_0-10s` | bass.mp3, drums.mp3, other.mp3, vocals.mp3 | 1.6 MB | 10.04 | 44100 Hz / 2 ch / MPEG_LAYER_III |
| `demucs-options/overlap0.1-10s/htdemucs/S4_0-10s` | bass.wav, drums.wav, other.wav, vocals.wav | 7.1 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-options/segment4-10s/htdemucs/S4_0-10s` | bass.wav, drums.wav, other.wav, vocals.wav | 7.1 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-options/shifts2-10s/htdemucs/S4_0-10s` | bass.wav, drums.wav, other.wav, vocals.wav | 7.1 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `demucs-options/two-stems-guitar/htdemucs_6s/S4` | guitar.wav, no_guitar.wav | 13.7 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `demucs.cpp-htdemucs_6s/S4` | target_0_drums.wav, target_1_bass.wav, target_2_other.wav, target_3_vocals.wav, target_4_guitar.wav, target_5_piano.wav | 82.0 MB | 38.741 | 44100 Hz / 2 ch / FLOAT |
| `demucs.cpp-htdemucs_6s/S4_0-10s` | target_0_drums.wav, target_1_bass.wav, target_2_other.wav, target_3_vocals.wav, target_4_guitar.wav, target_5_piano.wav | 21.2 MB | 10.0 | 44100 Hz / 2 ch / FLOAT |
| `hpss/S2s/default` | harmonic.wav, percussive.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `hpss/S2s/margin1-5` | harmonic.wav, percussive.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `hpss/S2s/margin3` | harmonic.wav, percussive.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `hpss/S6taps/default` | harmonic.wav, percussive.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `hpss/S6taps/margin1-5` | harmonic.wav, percussive.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `hpss/S6taps/margin3` | harmonic.wav, percussive.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `htdemucs/R2` | bass.wav, derived_instrumental_sum.wav, drums.wav, other.wav, vocals.wav | 38.1 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_16 |
| `htdemucs/R2full` | bass.wav, drums.wav, other.wav, vocals.wav | 161.2 MB | 228.482 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs/R3a` | bass.wav, drums.wav, other.wav, vocals.wav | 12.7 MB | 18.0 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs/R3b` | bass.wav, drums.wav, other.wav, vocals.wav | 12.7 MB | 18.0 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs/R3c` | bass.wav, drums.wav, other.wav, vocals.wav | 12.7 MB | 18.0 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs/S2s` | bass.wav, drums.wav, other.wav, vocals.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs/S4` | bass.wav, drums.wav, other.wav, vocals.wav | 27.3 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs/S6taps` | bass.wav, drums.wav, other.wav, vocals.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/R2` | bass.wav, derived_instrumental_sum.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 50.8 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/R2full` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 241.8 MB | 228.482 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/R3a` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 19.1 MB | 18.0 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/R3b` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 19.1 MB | 18.0 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/R3c` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 19.1 MB | 18.0 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/S2s` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 31.1 MB | 29.357 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/S4` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 41.0 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_6s/S6taps` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 31.1 MB | 29.357 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_ft/R2` | bass.wav, derived_instrumental_sum.wav, drums.wav, other.wav, vocals.wav | 38.1 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_16 |
| `htdemucs_ft/S4` | bass.wav, drums.wav, other.wav, vocals.wav | 27.3 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `mdx_extra/R2` | bass.wav, derived_instrumental_sum.wav, drums.wav, other.wav, vocals.wav | 38.1 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_16 |
| `mdx_extra/S4` | bass.wav, drums.wav, other.wav, vocals.wav | 27.3 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `msst-becruily-guitar/S2s` | Guitar.wav | 10.4 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `msst-becruily-guitar/S4` | Guitar.wav | 13.7 MB | 38.741 | 44100 Hz / 2 ch / FLOAT |
| `msst-becruily-guitar/S4_0-10s` | Guitar.wav | 3.5 MB | 10.0 | 44100 Hz / 2 ch / FLOAT |
| `msst-bs-roformer-sw/S4_0-10s` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 21.2 MB | 10.0 | 44100 Hz / 2 ch / FLOAT |
| `msst-scnet-musdb18/S4` (verifier) | bass.wav, drums.wav, other.wav, vocals.wav | 54.7 MB | 38.741 | 44100 Hz / 2 ch / FLOAT |
| `msst-scnet-musdb18/S6taps` (verifier) | bass.wav, drums.wav, other.wav, vocals.wav | 41.4 MB | 29.357 | 44100 Hz / 2 ch / FLOAT |
| `spleeter-4stems/R2` | bass.wav, derived_instrumental_sum.wav, drums.wav, other.wav, vocals.wav | 38.1 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_16 |
| `spleeter-4stems/S4` | bass.wav, drums.wav, other.wav, vocals.wav | 27.3 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `spleeter-4stems/S6taps` | bass.wav, drums.wav, other.wav, vocals.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / PCM_16 |
| `umxhq/R2` | bass.wav, derived_instrumental_sum.wav, drums.wav, other.wav, vocals.wav | 38.1 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_16 |
| `umxhq/S4` | bass.wav, drums.wav, other.wav, vocals.wav | 27.3 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `umxhq/S6taps` | bass.wav, drums.wav, other.wav, vocals.wav | 20.7 MB | 29.357 | 44100 Hz / 2 ch / PCM_16 |
| `umxl/R2` | bass.wav, derived_instrumental_sum.wav, drums.wav, other.wav, vocals.wav | 38.1 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_16 |
| `umxl/S4` | bass.wav, drums.wav, other.wav, vocals.wav | 27.3 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/1_HP-UVR/R2` | instrumental.wav, vocals.wav | 12.7 MB | 35.991 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/1_HP-UVR/S4` | instrumental.wav, vocals.wav | 13.7 MB | 38.731 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/BS-Roformer-SW/S4_0-10s` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 10.6 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/MDX23C-8KFFT-InstVoc_HQ/S4_0-10s` | instrumental.wav, vocals.wav | 3.5 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/UVR-MDX-NET-Inst_HQ_3/R2` | instrumental.wav, vocals.wav | 12.7 MB | 36.0 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/UVR-MDX-NET-Inst_HQ_3/S4` | instrumental.wav, vocals.wav | 13.7 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/htdemucs_6s/S4` | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 41.0 MB | 38.741 | 44100 Hz / 2 ch / PCM_16 |
| `uvr/model_bs_roformer_ep_317_sdr_12.9755/S4_0-10s` | instrumental.wav, vocals.wav | 3.5 MB | 10.0 | 44100 Hz / 2 ch / PCM_16 |
| `htdemucs-6s-guitar-ft/R2` (gap round 2) | bass.wav, derived_instrumental_sum.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 69.9 MB | 36.0 | 44100 Hz / 2 ch / FLOAT; 44100 Hz / 2 ch / PCM_24 |
| `htdemucs-6s-guitar-ft/S2s` (gap round 2) | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 46.6 MB | 29.357 | 44100 Hz / 2 ch / PCM_24 |
| `htdemucs-6s-guitar-ft/S4` (gap round 2) | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 61.5 MB | 38.741 | 44100 Hz / 2 ch / PCM_24 |
| `htdemucs-6s-guitar-ft/S6taps` (gap round 2) | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 46.6 MB | 29.357 | 44100 Hz / 2 ch / PCM_24 |
| `htdemucs_6s-via-ft-script/S4` (gap round 2) | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 61.5 MB | 38.741 | 44100 Hz / 2 ch / PCM_24 |
| `htdemucs_6s-via-ft-script/S6taps` (gap round 2) | bass.wav, drums.wav, guitar.wav, other.wav, piano.wav, vocals.wav | 46.6 MB | 29.357 | 44100 Hz / 2 ch / PCM_24 |

Total: 1669.0 MB in 236 files (trial agent's list; recounted by the verifier before the SCNet run: 236 files,
1669.0 MB). With the verifier's two SCNet folders: 1765.1 MB in 244 files. With the six gap round 2 folders
(`scripts/media_list.py`, 2026-11-11 00:52 UTC): 2097.8 MB in 281 files. The gap round 2 re-runs whose audio was
deleted after the facts were taken (the ONNX Runtime thread re-runs r0610, r0612, r0615 and r0619, sample-identical
to first-round files; the four whole-song timing runs r0659, r0660, r0669 and r0677) are not listed. The MP3 row's 10.04 s is the header's
figure (`soundfile.info`: 442,747 frames); the files decode to 442,368 frames (10.031 s). The verifier's re-run
outputs (duplicates of runs above) were written to `/home/user/gtr/lanes/source-separation/verify/out/` and are not
listed here.


## Verification log (verify-trials-source-separation, 2026-11-11)

Work done 2026-11-10 23:23 UTC to 2026-11-11 00:10 UTC by `verify-trials-source-separation`, on the same box. Scripts
added: `scripts/verify-trials-reruns.sh`, `verify-trials-gtreval-rerun.py`, `verify-trials-audio-check.py`,
`verify-trials-demucs401-io.py`. Results: `samples/verify-trials/` (`facts.json`, `diffs.json`, `metrics.json`,
`gtreval_rerun_compare.txt`, `rerun_*.json`).

**What was checked**

- Run ledger: all 64 run ids cited (r0019 to r0510) exist with lane `source-separation`; every wall, CPU, peak RSS,
  load1, cores and exit code quoted in the tables matches the ledger. The three non-zero exits (r0051, r0460, r0466)
  are written up as failures. The commands match the recorded `cmd_str`.
- gtr-eval: all 55 eval ids cited exist; every number quoted matches the stored result. All 56 scorings the trial
  agent made (the 55 plus e1419, not cited) were re-run with the same arguments into new files (batch r0536, evals
  e1514 to e1569): metrics, counts, options and the sha256 of every estimate and reference file are identical. (The
  trial agent's closing summary counted 68 gtr-eval runs; 12 of the 68 ledger lines that name this lane's folders,
  e0161 to e0170, e0950 and e0965, score this lane's stems against references in, and write their results to, the
  fingerstyle-voices-taps lane's folder.)
- Independent recomputation with mir_eval 0.8.2 called directly and separate SI-SDR code (`verify-trials-audio-check.py
  metrics`, r0555): e0389 (Open-Unmix), e0073 (Demucs), e0811 (HPSS), e1395 (Spleeter), e1416 (LoRA), e1417
  (demucs-onnx), e1425 and e1427 (MSST), e1421 (audio-separator), e1446 (demucs.cpp), and the onset F-measures of
  e0815, e0919, e0928, e0934 and e1397: every value equal to gtr-eval's at two decimals.
- Stem facts: every value in the 48 `stemfacts_*.json` files (frames, subtype, bytes, RMS, peak, stem-sum residual
  and lag, projections) recomputed from the audio with separate code (r0553): no mismatch. Difference levels between
  runs recomputed (r0550): all match, with the reference energy made explicit where the text was ambiguous.
- Files: every `samples/` and `scripts/` path named exists; `out/` holds the 236 audio files (1669.0 MB) listed;
  MP3, FLOAT, PCM_16 and frame-count statements re-read (and the WAV chunk layout of the 34-byte-larger files).
- Re-runs through `gtr-run` with "verify" labels (outputs in `/home/user/gtr/lanes/source-separation/verify/out/`
  unless moved): Demucs r0524 (= r0019), r0525 (= r0099), r0526 (= r0462), r0527 (= r0460, exit 1 as recorded);
  LoRA r0529 (= r0467); HPSS r0530 (= r0262); audio-separator VR r0531 (= r0481); demucs.cpp r0541 (= r0508);
  Open-Unmix r0539 (= r0085); MSST r0547 (= r0473); demucs-onnx r0548 (= r0471); Demucs 4.0.1 writer check r0544
  (r0543 exited 1: the verifier's script imported soundfile, which that frozen venv lacks; fixed and re-run as
  r0544). Sample-identical to the original: Open-Unmix, HPSS, VR, demucs.cpp, MSST becruily, demucs-onnx. Different
  from run to run (random shift, shifts=1): PyTorch Demucs and the LoRA run, by -10.89 to -22.60 dB, with the scores
  of the re-runs in e1575 and e1576. The re-created venvs (`venv-umx`, `venv-msst`, `venv-demucs401`) were
  installed from the saved freezes and gave identical `uv pip freeze` output.
- NOT RUN HERE: every size, gate, HTTP status and license id re-read on 2026-11-10 from the Hugging Face API (models,
  Space, dataset), Zenodo API, HTTP HEAD on the release mirrors and the raw READMEs; all match. The two quoted
  log lines of the disk notice match `env.sh` and the saved logs.
- Licenses quoted in this file re-fetched and compared word for word: Open-Unmix LICENSE and README, Demucs README
  (including the "License" section) and `docs/release.md`, Spleeter LICENSE and README, audio-separator LICENSE and
  README, demucs.cpp LICENSE and README, the demucs-onnx wheel's LICENSE (re-downloaded from PyPI), the Hub license
  tags of the LoRA, StemSplit and Retrobear repositories, and the LoRA card. All match.
- Judging language: removed "least of all" and "clean"; "So ... returned a small part of the guitar" replaced by
  the measured levels; for-aaron.md's "Easiest route" replaced.
- No secrets, no personal data, no file over 300 KB and no audio or video under this lane's docs folder (largest:
  `survey.md`, 121 KB).

**What was changed (corrections)**

- demucs-onnx: the text said both the ONNX and the PyTorch runs draw a random shift; demucs-onnx has none (fixed
  overlap-add), and its re-run is sample-identical. `browser.py`'s default browser model is the htdemucs-ft vocals
  ONNX file, not the htdemucs_6s file.
- MSST vs audio-separator BS-RoFormer-SW: the stated causes (0.9 normalisation, MSST's overlap of 2) were not
  differences between the two runs; replaced by what each code does; the -22.70 to -23.21 dB range applies to the
  four non-silent stems.
- MSST venv "95 MB by du": an artifact of `du` over several hard-linked venvs; 1.4 GB measured alone.
- audio-separator `--normalization 0.9`: it limits peaks above 0.9 only (R2 scaled, S4 not); the text said
  "peak-normalised". The Demucs `.th` file is tried from the audio-separator mirror before `dl.fbaipublicfiles.com`.
- "Queued 15 to 20 jobs deep": attributed to the trial agent; the ledger shows at most 8 waiting jobs at once.
- demucs 4.1.0 and numpy: the metadata lists numpy only for macOS x86_64 (not "does not declare").
- Facts added: which FFmpeg libraries torchcodec loads (was UNVERIFIED), AudioSep Space `RUNTIME_ERROR`, Banquet's
  CPU branch and missing requirements file, the guitar-ft repo's CPU option and `demucs==4.0.1` pin, MP3 header
  vs decoded length, Spleeter's log lines located in its source, difference-level reference energies, the second
  Eigen error line, demucs.cpp printouts per run.
- Marked as the trial agent's unverifiable figures: Spleeter venv 1.7 GB, its extracted model size, the TensorFlow
  start-up message, the 904.2 MiB cache cleanup, the demucs.cpp source tree size, the "Code from External" refusal.
- Run by the verifier: SCNet Small (MUSDB18) through MSST on S4 and S6taps (r0559, r0560; e1596, e1597, onset
  handoff e1595; e1593 and e1594 are the same scorings made before the folder was moved to `out/`), new section
  above, added to the stem index and the media list.
- for-aaron.md: Banquet step 2 pointed to an install section the README does not have (replaced with the package
  list from the code's imports); SAM Audio's README section is "Setup", not "Installation"; AudioSep got a local
  route from its README because the Space reported a runtime error; the guitar-ft item got the commands from its
  model card; ZeroSep got steps from its README; R2's SAM Audio prompt changed from `electric guitar` to `guitar`
  (R2's instruments are not known).

**Still UNVERIFIED**

- Spleeter was not re-run (re-installing TensorFlow was over the 200 MB disk notice); its outputs and scores were
  re-read. The htdemucs_ft, mdx_extra and umxl parameter counts were not re-counted (weights deleted). The trial
  agent's queue-depth count, the "Code from External" refusal, the TensorFlow message and the cache-cleanup figure
  have no saved log. Whether AudioSep and Banquet run on a CPU in practice, whether `sam-audio-small` fits in 8 GB,
  and the SCNet checkpoint's license remain open.

**Disk:** the verifier's re-run outputs were deleted after the comparisons (the numbers are in `samples/verify-trials/`);
the SCNet outputs were kept in `out/msst-scnet-musdb18/`; the re-created venvs were deleted; the SCNet checkpoint
(42 MB) is kept in `verify/models/scnet/`.

## Verification log (verify-gapfill-source-separation, round 2, 2026-11-11)

Work started 2026-11-11 01:08 UTC by `verify-gapfill-source-separation`, on the same box, to check what
`gapfill-source-separation` added in "Gap round 2" and its edits to `survey.md`, `for-aaron.md` and `tools.json`.
The baseline for "what gap round 2 changed" is the repository's commit `d2e9a17` (2026-11-11 00:19 UTC, before that
round), compared read-only with `git diff`. Scripts added: `scripts/verify-gap2-*`. Results: `samples/verify-gap2/`.
Items are appended as they are finished.

**Re-runs**

- `adityalakhani/htdemucs-6s-guitar-ft` (r0636): NOT RE-RUN. The checkpoint was downloaded again into
  `verify-gap2/models/guitar-ft/` (2026-11-11 01:12 UTC, 12.6 s; 329,654,071 bytes; SHA-256 `4fde369e...260e`, equal
  to the Hub's LFS hash and to the hash `gtr-run` logged for r0636's input), but the command that would have run
  `scripts/verify-gap2-guitar-ft-rerun.sh` (the r0636 command with a new output folder) was refused by the session's
  permission system: "Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code
  from External]." (01:13 UTC). It was not retried another way; nothing ran (no log, no ledger line), and the
  checkpoint was deleted at once. The fine-tune's outputs that r0636 to r0644 left in `out/` were checked instead
  (below).
- audio-separator MDX-Net with ONNX Runtime's default threads (r0615): re-run as r0713 (`scripts/verify-gap2-ort-rerun.sh`,
  2 cores, slot 0-1, started 01:14:40 UTC, load1 0.82), watched by a probe written for this check
  (`scripts/verify-gap2-thread-probe.py`, 0.5 s interval; `samples/verify-gap2/probe_mdx-default_S4_verify.json`):
  wall 36.65 s, CPU 98.8 s (2.70 x wall), peak RSS 3168.9 MB, exit 0. Three worker threads were each allowed on
  exactly one CPU, 1, 2 and 3, from 7.5 s after the start to 1.5 s before the end, and the CPU each last ran on read
  1, 2 and 3 in all 55 samples; the threads allowed only on CPU 2 or CPU 3 used 21.27 s and 21.21 s of CPU time. The
  same pattern as r0615. Both output stems are sample-identical (max |diff| 0) to r0487's first-round files; the
  re-run's audio was deleted. The wall time differs from r0615 (85.76 s) on the same command: a single run on a
  shared box.
- demucs-onnx with ONNX Runtime's default threads (r0610) and with 2 intra-op threads (r0612): re-run as r0718 and
  r0719 (`scripts/verify-gap2-onnx-rerun.sh`, `verify-gap2-onnx2-rerun.sh`; both 2 cores, slot 0-1, load1 0.55 and
  1.24) in a venv re-created from `samples/demucs-onnx/uv-pip-freeze-venv-ort.txt` (identical `uv pip freeze`; 151 MB
  by `du`, deleted afterwards), each watched by `scripts/verify-gap2-thread-probe.py`
  (`samples/verify-gap2/probe_onnx-default_S4_verify.json`, `probe_onnx-ort2_S4_verify.json`). r0718 (default):
  wall 29.12 s, CPU 80.1 s (2.75 x wall), peak RSS 6203.9 MB; three worker threads each allowed on exactly one CPU (1,
  2, 3) from 1.0 s after the start to 0.5 s before the end, the CPU each last ran on read 1, 2 and 3 in all 55
  samples, and the threads on CPU 2 and CPU 3 used 17.63 s and 17.60 s of CPU time. r0719 (2 threads; the wrapper
  printed `intra_op_num_threads=2` for the one session): wall 36.10 s, CPU 60.8 s, peak RSS 6204.0 MB; every thread
  allowed on CPUs 0-1 in every sample (one worker thread besides the main thread). All six stems of both runs are
  sample-identical to r0471's first-round files; the audio was deleted. This confirms the gap round's thread
  findings with a second probe. Not reproduced: r0610's peak RSS of 8051.0 MB. r0718, with the same freeze and the
  same default threads, peaked at 6203.9 MB, as did r0471 and r0548 (6204.5 MB) and r0612 (6203.9 MB). Why r0610 used
  1.8 GB more was not determined. The gap round's table is left as the ledger has it, and a note was added below it.
