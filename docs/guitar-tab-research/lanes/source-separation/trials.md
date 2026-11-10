# Source separation: trials

Lane `source-separation`, agent `try-source-separation`, started 2026-11-10 20:52 UTC. Everything below was run on the
shared box (4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU). Timed runs went through `gtr-run`, which pins a job to
one slot of 2 cores unless the run says 4 cores (`--all-cores`); every run id (r0xxx) is a line in
`/home/user/gtr/ledger/runs.jsonl`, every scoring id (e0xxx) a line in the gtr-eval ledger. Estimated stems are in
`/home/user/gtr/lanes/source-separation/out/<model>/<clip>/` for other lanes to use.

How stems are scored (where truth exists, S4 and S6taps): `gtr-eval stems` averages every signal to mono, resamples to
44.1 kHz if needed, trims to the shortest length, then reports SI-SDR (computed by gtr-eval: mean removed,
target = (<est,ref>/<ref,ref>) ref, 10 log10(|target|^2/|est-target|^2)) and mir_eval 0.8.2
`bss_eval_sources` SDR / SIR / SAR (512-tap filter, whole signal, one joint call over all scored stems). No time
alignment is searched. These are measurements on one synthesized clip, not a ranking.

Scripts are in `scripts/`, small text samples in `samples/<tool>/`. Audio stays outside git (list at the end).

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
  (du; mostly torch, hard-linked from the shared uv cache). Freeze: `samples/openunmix/uv-pip-freeze.txt`. The venv
  was deleted afterwards for disk space.
- **Dead end:** without torchcodec the first run (r0051, exit 1, 2.91 s) stopped in `openunmix/data.py`
  `torchaudio.load(path)`: "ImportError: TorchCodec is required for load_with_torchcodec. Please install torchcodec
  to use this function." (torchaudio 2.11 routes `load` and `save` through torchcodec). Installing torchcodec fixed
  it; torchcodec used the box's system FFmpeg 6.1.1 libraries. No other change was needed.
- **Weights downloaded** (torch hub cache, fetched on first use from Zenodo): `umxhq` = 4 files of 35,637,796 bytes
  (`bass-8d85a5bd.pth`, `drums-9619578f.pth`, `other-b52fbbf7.pth`, `vocals-b62c91ce.pth`) from
  `https://zenodo.org/records/3370489/files/...`; `umxl` = 4 files of 113,101,348 bytes (`bass-2ca1ce51.pth`,
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

  load1 is the box's 1-minute load average when the run started (from the ledger); above 4 there were more runnable
  processes than cores on the box. Other lanes' jobs that do not go through `gtr-run` are not pinned, so a pinned
  run's wall-clock is not a clean single-tenant figure; CPU time is given beside it.
- **Output format:** one WAV per target, `vocals.wav`, `drums.wav`, `bass.wav`, `other.wav`, in
  `<outdir>/<input file stem>/`; read back with soundfile: 44,100 Hz, 2 channels, PCM_16, frame count equal to the
  input's (difference 0 on every file of every run); the sum of the four stems against the input mix: best lag 0
  samples, residual -39.85 dB (umxhq, S4), -22.22 dB (umxl, S4), -42.83 dB (umxhq, S6taps), -35.35 dB (umxhq, R2),
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
  (raised from `demucs/transformer.py` line 14, `import numpy as np`): demucs 4.1.0 does not declare numpy as a
  dependency and none of its dependencies pulled it in. Fix: `uv pip install numpy` (2.4.6). No torchaudio
  problem exists in 4.1.0 because it no longer uses torchaudio for inference; the older-version problem is shown
  under Open-Unmix (same torchaudio 2.11 load/save change). Venv 1.1 GB by du (hard-linked from the shared uv
  cache; this figure also includes `peft` and `transformers`, added later for the LoRA trial below).
- **Weights** (downloaded unauthenticated from Hugging Face by `get_model` on first use; script
  `scripts/demucs_fetch_models.py`; the hub printed "Warning: You are sending unauthenticated requests to the HF Hub"):
  `adefossez/HTDemucs` `955717e8.safetensors` 84,025,440 bytes; `adefossez/HTDemucs-6s` `5c90dfd2.safetensors`
  54,885,744 bytes; `adefossez/HTDemucs-ft` 4 x 84,025,440 bytes (`f7e0c4bc`, `d12395a8`, `92cfc3b6`, `04573f0d`);
  `adefossez/Demucs-mdx_extra` `a1d90b5c`, `5d2d6c55` (167,309,720 bytes each), `e51eebcc`, `cfa93e08` (167,317,416
  bytes each); plus one small `<name>.yaml` per repo. What the loaded models report:

| model | sources | sub-models | segment (s) | parameters | sample rate / channels |
|---|---|---|---|---|---|
| htdemucs | drums, bass, other, vocals | 1 HTDemucs | 7.8 | 41,984,456 | 44,100 / 2 |
| htdemucs_6s | drums, bass, other, vocals, guitar, piano | 1 HTDemucs | 7.8 | 27,414,996 | 44,100 / 2 |
| htdemucs_ft | drums, bass, other, vocals | 4 HTDemucs, bag weights one-hot (one specialist per source) | 7.8 | 167,937,824 | 44,100 / 2 |
| mdx_extra | drums, bass, other, vocals | 4 HDemucs (v3), equal bag weights | 44.0 | 334,543,632 | 44,100 / 2 |

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
  the stems against the input mix (mono, `scripts/stem_facts.py`): best lag 0 samples in every run; residual
  10 log10(|mix - sum|^2/|mix|^2) = -32.14 dB (htdemucs S4), -12.76 dB (htdemucs_6s S4), -17.55 dB (htdemucs_ft S4),
  -34.73 dB (mdx_extra S4), -39.05 dB (htdemucs S6taps), -12.59 dB (htdemucs_6s S6taps), -44.67 dB (htdemucs S2s),
  -16.18 dB (htdemucs_6s S2s). So the stems do not add back exactly to the mix, least of all with htdemucs_6s.
  Per-run facts: `samples/demucs/stemfacts_<model>_<clip>.json`.
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
  `--float32`, `--flac`, `--mp3` (`--mp3-bitrate`, `--mp3-preset`), `--filename` template, `--repo` / `-s` for local
  models, `hf://namespace/name` for models on the hub. Python API: `demucs.api` and
  `demucs.separate.main([...])`. No pitch, key, tuning or instrument-range parameters.

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
  load average when these unpinned runs started was 17.35 (r0262) and 19.56 (r0268) on 4 cores.)
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
- **Constraint inputs for a re-run:** `margin` (one value or a harmonic/percussive pair), `kernel_size`, `power`,
  `mask` (hard masks), `n_fft`, `hop_length`. No pitch or instrument parameters.

## Tools NOT RUN HERE, with the evidence

Checked 2026-11-10. During this lane's work the shared disk was down to 5 to 7 GB free and the orchestrator's notice
on the box read: "start no new download or install over 200 MB unless your lane cannot finish without it; pick the
smallest checkpoint a model offers". Steps for Aaron are in `for-aaron.md`.

- **SAM Audio (Meta), text / visual / span-prompted separation.** Hugging Face model API, read 2026-11-10:
  `facebook/sam-audio-small` `gated: manual`, `usedStorage` 5,100,547,943 bytes; `-base` `manual`, 7,725,405,659;
  `-large` `manual`, 14,861,356,211. A request for `https://huggingface.co/facebook/sam-audio-small/resolve/main/config.json`
  without a login returned HTTP 401. Not run: the weights need an approved Hugging Face login, and the smallest
  repository is 5.1 GB against 5 to 7 GB of free disk.
- **AudioSep (text-queried).** The Hugging Face Space `Audio-AGI/AudioSep` (API, read 2026-11-10) holds
  `checkpoint/audiosep_base_4M_steps.ckpt` 1,264,844,076 bytes and `checkpoint/music_speech_audioset_epoch_15_esc_89.98.pt`
  2,352,471,003 bytes, readable without a login. Not run: 3.6 GB of checkpoints under the 200 MB download notice.
  Whether a 10 s CPU run is feasible was therefore not measured (UNVERIFIED).
- **Banquet (`kwatcharasupat/query-bandit`, query by example).** Zenodo record 13694558 (API, read 2026-11-10):
  license `cc-by-nc-sa-4.0`, `access_right: open` (no login), 14 checkpoints of 551,785,899 to 768,226,933 bytes
  (`ev-pre-aug.ckpt` 645,470,187). Not run: the smallest checkpoint is 552 MB, above the 200 MB notice, before the
  PaSST query encoder it also needs. CPU support (`--use_cuda=false`) is UNVERIFIED.
- **MuS3D (Aalto) and ZeroSep.** MuS3D's checkpoint repository `remus-aalto/MuS3D` holds 19,244,794,860 bytes (Hub
  API `usedStorage`, per survey.md) and its README says "The DiT needs about 10 GB of free memory"; ZeroSep runs
  diffusion backbones (survey.md). Not run: disk.
- **`adityalakhani/htdemucs-6s-guitar-ft` (htdemucs_6s fine-tuned on guitar).** Hub API (read 2026-11-10):
  `guitar_htdemucs_6s.pt` 329,654,071 bytes, not gated. Not run: above the 200 MB notice.
- **Demucs in the browser.** `free-music-demixer` (sevagh): its README calls it "An archived snapshot ... no longer
  maintained" and "Model weights are not included" (survey.md). `demucs-rs`: its README names Metal, Vulkan and
  WebGPU back ends; the box has no GPU (survey.md). Not run here. An ONNX build of htdemucs_6s that also loads in
  onnxruntime-web (`demucs-onnx`, below) was run on the CPU instead.
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

