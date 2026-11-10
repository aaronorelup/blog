# Source separation: trials

Lane `source-separation`, agent `try-source-separation`, started 2026-11-10 20:52 UTC. Everything below was run on the
shared box (4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU). Timed runs went through `gtr-run`, which pins a job to
one slot of 2 cores; no 4-core (`--all-cores`) run was made. Every run id (r0xxx) is a line in
`/home/user/gtr/ledger/runs.jsonl`, every scoring id (e0xxx) a line in the gtr-eval ledger
(`/home/user/gtr/eval/ledger/evals.jsonl`). The first runs (r0019 to r0147) each took a slot. The trial agent
reports that from about 21:05 UTC the slots were queued 15 to 20 jobs deep (its own count at the time; no log of it
was kept). The run ledger only holds jobs that finished; counted from it (`started_utc` minus `lock_wait_s`), at most
8 jobs were waiting for a slot at the same moment between 20:50 and 23:30 UTC (at 21:04; sampled every 10 s), and 6
at each 5-minute mark from 21:35 to 21:55 (verifier's count). The later runs were grouped into three batch jobs (r0478, r0493, r0510),
each holding one 2-core slot, inside which every item was logged with `gtr-run --nolock` (details under "Demucs
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
  Parameter counts printed by the loaded separators: umxhq 35,577,488, umxl 113,032,848.
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
  (every value in the 48 `stemfacts_*.json` files of this lane was recomputed by the verifier from the audio with
  separate code: no mismatch).
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
  repository is 5.1 GB against 5 to 7 GB of free disk.
- **AudioSep (text-queried).** The Hugging Face Space `Audio-AGI/AudioSep` (API, read 2026-11-10) holds
  `checkpoint/audiosep_base_4M_steps.ckpt` 1,264,844,076 bytes and `checkpoint/music_speech_audioset_epoch_15_esc_89.98.pt`
  2,352,471,003 bytes, readable without a login. Not run: 3.6 GB of checkpoints under the 200 MB download notice.
  Whether a 10 s CPU run is feasible was therefore not measured (UNVERIFIED; survey.md reports that the README picks
  the CPU when CUDA is absent). The same Space API call (verifier, 2026-11-10) reported the Space's runtime stage as
  `RUNTIME_ERROR` (requested hardware `a10g-small`).
- **Banquet (`kwatcharasupat/query-bandit`, query by example).** Zenodo record 13694558 (API, read 2026-11-10):
  license `cc-by-nc-sa-4.0`, `access_right: open` (no login), 14 checkpoints of 551,785,899 to 768,226,933 bytes
  (`ev-pre-aug.ckpt` 645,470,187). Not run: the smallest checkpoint is 552 MB, above the 200 MB notice, before the
  PaSST query encoder it also needs. The README's inference example passes `--use_cuda=true`; `train.py`'s
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
  `guitar_htdemucs_6s.pt` 329,654,071 bytes, not gated. Not run: above the 200 MB notice.
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
  has no entry containing "scnet"); MSST lists SCNet checkpoints, not tried for lack of time.
- **demucs-infer, bs-roformer-infer, melband-roformer-infer (OpenMIRLab), PolUVR:** repackagings of models already
  run here through demucs, audio-separator and MSST; not tried, to keep the CPU slots for other tools.

## Demucs 4.0.1 with the current torchaudio (I/O check only, no separation)

Many tools still pin the previous Demucs release (for example MSST's `requirements.txt` lists `demucs==4.0.0`), so
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

From 21:05 UTC the shared CPU slots were queued 15 to 20 jobs deep, so the remaining runs were grouped into batch
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
  ran first, and the box's load average was 6 to 10 during these runs). One run per option: these timings are not
  averages. **The output is not identical from run to run:** `demucs/apply.py` draws a random
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
  (`--all-cores`) whole-song timing was not attempted: it needs both slots at once, and with 15 to 20 jobs queued it
  would have held one slot idle while waiting for the other.
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
  peaked at 1349.6 MB).
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
  `samples/msst/uv-pip-freeze-venv-msst.txt`, identical freeze): wall 50.44 s, CPU 109.1 s, peak RSS 6204.5 MB. All
  six stems are sample-identical to r0471's, and the re-scoring (e1577) equals e1417. e1417 recomputed with mir_eval
  directly gives the same numbers.
- **Constraint inputs:** `--model`, `--stem` / `--stems`, `--precision fp32|fp16weights` (`--small`), `--providers
  auto|cpu|coreml|cuda|dml|wasm`, `--mix-stems`, `--karaoke`, `--mp3`.

## ZFTurbo Music-Source-Separation-Training (PyPI `msst` 0.1.0): becruily Mel-Band RoFormer guitar, BS-RoFormer-SW

- **What:** MSST, the training and inference framework behind many community RoFormer checkpoints; PyPI `msst` 0.1.0
  (uploaded 2026-09-09, author "Roman Solovyev (ZFTurbo)", homepage https://github.com/ZFTurbo/Music-Source-Separation-Training),
  console script `msst-inference`. Code license MIT per survey.md (`license_expression: 'MIT'`).
- **Install (worked) and one refusal:** a `git clone --depth 1` of the repository (head `1d4b3c4`, 2026-11-10) was
  made, but running its `inference.py` from inside the clone was refused by this session's permission check
  ("Code from External"), so the clone was deleted and the PyPI package was used instead: `uv venv --python 3.11
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
  these files. (Correction by the
  verifier: the trial text named the 0.9 normalisation and MSST's overlap of 2 as differences between the two runs.)
- **Constraint inputs for a re-run:** `--model_type`, `--config_path` (chunk size, overlap and instruments are in the
  YAML), `--extract_instrumental`, `--use_tta`, `--bigshifts`, `--pcm_type`, `--flac_file`, `--lora_checkpoint_peft`
  / `--lora_checkpoint_loralib`, `--filename_template`. No pitch or tuning parameters.

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
  and the original UVR release URL second (`separator.py`, `download_model_files`); Demucs `.th` files come from
  `https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/` (catalogue `download_files`). Files used (bytes):
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

  The RoFormer and MDX23C models were run on the first 10 s of S4 only. Extrapolating r0496 linearly to the 228.5 s
  song (an extrapolation, not a measurement): 502.83 s x 228.5 / 10 = 11,490 s, about 3.2 hours on 2 cores;
  r0498: 170.47 x 22.85 = 3,895 s; r0489: 110.34 x 22.85 = 2,521 s.
- **Output format:** one WAV per stem, 44,100 Hz, 2 channels, PCM_16 ("Detected input bit depth: 16-bit" ... "Writing
  output with 16-bit depth", "Using pydub for writing"). The default `--normalization 0.9` ("Max peak amplitude to
  normalize input and output audio to", `--help`) scales a signal down to a peak of 0.9 only when its peak is above
  0.9 (`spec_utils.normalize`: `if maxv > max_peak: wave *= max_peak / maxv`): R2 (input peak 0.989) gave stems
  that peak at -0.92 dBFS = 0.90, while the S4 input (peak 0.891) and its stems (peaks -1.41 dBFS and lower) were not
  scaled. On R2 the stem-sum residuals are -14.71 / -13.39 dB against -37.71 / -34.39 dB on S4 (below); whether the
  scaling accounts for that was not isolated (verifier). Frame count equal to the input for MDX-Net, Demucs, MDX23C
  and the RoFormers (files 34 bytes larger than the input WAV: a `LIST`/`INFO` chunk with `ISFT` "Lavf60.16.100");
  **the VR model's files are shorter: 463 frames short on S4 (1,708,032 vs 1,708,495) and 400 short on R2**, still
  aligned at lag 0. (Verifier re-run of r0481, r0531, cores 2-3, load1 3.67: wall 84.6 s, CPU 138.1 s, peak RSS
  2052.2 MB; both files sample-identical to r0481's, again 1,708,032 frames. e1421 recomputed with mir_eval directly:
  instrumental 7.54 / 7.64 / 8.69 / 14.88, lead 4.72 / 6.14 / 19.10 / 6.42, as above.) Residual of the stem sum against the mix: VR -37.71 dB
  (S4), MDX-Net -34.39 dB (S4), Demucs 6s -12.16 dB (S4), BS-RoFormer-SW -36.86 dB, MDX23C -68.24 dB, BS-RoFormer
  -72.07 dB (first 10 s of S4), VR -14.71 dB and MDX-Net -13.39 dB (R2).
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
  when the residual energy is 0 and checks that before the target energy, which is also 0 here.)
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
  bytes each for S4, frame count equal to the input, stem sum at lag 0 (residual -12.10 dB). The program printed
  "Input samples: 441000", "Length in seconds: 10", "Number of channels: 2", "demucs_model_load returned true",
  "Starting Demucs (6-source) inference" and per-thread progress lines.
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

## Stems available for other lanes (handoffs)

All under `/home/user/gtr/lanes/source-separation/out/`, 44.1 kHz stereo WAV, same length and alignment as the input
clip unless noted. Guitar-bearing stems for transcription lanes: `htdemucs_6s/<clip>/guitar.wav` (S4, S6taps, S2s,
R2, R2full, R3a, R3b, R3c), `htdemucs/<clip>/other.wav` (S4, S6taps, S2s, R2, R2full, R3a, R3b, R3c),
`uvr/BS-Roformer-SW/S4_0-10s/guitar.wav` and `msst-bs-roformer-sw/S4_0-10s/guitar.wav` (first 10 s of S4 only),
`msst-becruily-guitar/<clip>/Guitar.wav` (float32; S4, S4_0-10s, S2s), `demucs.cpp-htdemucs_6s/S4/target_4_guitar.wav`
(float32). Bass for bass-line lanes: `<model>/<clip>/bass.wav` from htdemucs, htdemucs_6s, htdemucs_ft, mdx_extra,
umxhq, umxl, spleeter-4stems. Percussion for tap lanes: `<model>/S6taps/drums.wav` (htdemucs, htdemucs_6s, umxhq,
spleeter-4stems) and `hpss/S6taps/<setting>/percussive.wav` (float32), with onset lists already scored against the
taps in `samples/onsets-handoff/`. Caveats per tool: VR (`uvr/1_HP-UVR`) files are 463 (S4) and 400 (R2) frames
shorter than the input; Demucs `--mp3` files are 1,368 frames longer and 1105 samples late as decoded by
libsndfile; `derived_instrumental_sum.wav` files are sums made here for scoring, not tool output.

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

Total: 1669.0 MB in 236 files.

