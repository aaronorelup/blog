# Source separation and stem isolation: survey

Lane `source-separation`, written by `docs-source-separation` on 2026-11-10 (date from `date -u +%F`).
Primary sources only: PyPI JSON (`https://pypi.org/pypi/<name>/json`), repository files read through shallow
`git clone` or `raw.githubusercontent.com`, model cards on Hugging Face, papers on arXiv. Every date below was read
on 2026-11-10. "last commit" = the committer date of the default branch's head in a `git clone --depth 1` made on
2026-11-10. Nothing in this file was run as a separation job; trials are in `trials.md` (the `try-source-separation`
agent).

RUNNABLE = the project's own docs or packaging show a CPU code path, so it looks runnable on this CPU-only Linux
box. It is a reading of the docs, not a test.

Quoting convention: text in quotation marks is copied from the cited source. Inside documentation quotes, Markdown
link targets are sometimes shortened to `[text]` and "..." marks omitted words; license clauses are copied without
such changes except "..." where a long clause is cut. Repository files were read from `git clone --depth 1` copies
whose LICENSE files were byte-compared with `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/LICENSE` on
2026-11-10 (all matched). Working copies, fetched pages and scripts are under
`/home/user/gtr/lanes/source-separation/docs-agent/` (not in git).

Checked on 2026-11-10 by `verify-docs-source-separation`, who re-fetched every cited source (copies under
`/home/user/gtr/lanes/source-separation/verify-docs/`, scripts `scripts/verify-docs-*`) and corrected this file in
place. What changed is listed in the "Verification log" at the end.

## Tool list

First pass written in the first minutes so the try agent could pick tools up; updated at the end of the survey.
Sections below give the details and sources. "Guitar stem" marks tools that output one.

| Tool | Kind | Release / last commit (read 2026-11-10) | Runnable here? |
|---|---|---|---|
| Demucs v4 (`htdemucs`, `htdemucs_ft`, `htdemucs_6s` with guitar and piano stems, `hdemucs_mmi`, `mdx`, `mdx_extra`, `mdx_q`, `mdx_extra_q`) | fixed-stem models + CLI + Python API. Guitar stem (`htdemucs_6s`) | PyPI `demucs` 4.1.0 uploaded 2026-07-11, homepage `github.com/adefossez/demucs`; `adefossez/demucs` last commit 2026-10-26; `facebookresearch/demucs` last commit 2023-11-16 (README: "not maintained anymore") | RUNNABLE |
| demucs-infer (OpenMIRLab) | inference-only repackaging of Demucs | PyPI `demucs-infer` 4.4.0 uploaded 2026-10-05; README: "OpenMIRLab no longer publishes new versions to PyPI." (install from git) | RUNNABLE |
| Spleeter (Deezer) | fixed-stem models (2, 4, 5 stems; piano, no guitar) + CLI + Python API, TensorFlow | PyPI `spleeter` 2.4.2 uploaded 2025-04-03 (requires Python <3.12, >=3.8); `deezer/spleeter` last commit 2026-10-28 | RUNNABLE (Python 3.8 to 3.11) |
| Open-Unmix (`umxl`, `umxhq`, `umx`) | fixed-stem models (4) + CLI + Python API | PyPI `openunmix` 1.3.0 uploaded 2024-04-16; `sigsep/open-unmix-pytorch` last commit 2024-04-16 | RUNNABLE |
| python-audio-separator (`audio-separator`) with the UVR model zoo (VR Arch, MDX-Net, MDX23C, RoFormer, Demucs, SCNet) | CLI + Python API + model downloader. Guitar stem via `htdemucs_6s.yaml` and `BS-Roformer-SW.ckpt` | PyPI `audio-separator` 0.48.0 uploaded 2026-10-29; `nomadkaraoke/python-audio-separator` last commit 2026-10-29 | RUNNABLE (`audio-separator[cpu]`) |
| Ultimate Vocal Remover GUI (UVR5) | desktop GUI around the same model families | `Anjok07/ultimatevocalremovergui` last commit 2026-10-06 | desktop app only |
| Music-Source-Separation-Training (MSST, ZFTurbo) | training + inference for the 24 `--model_type` keys its README lists (the code accepts more, e.g. `moises_light`), published checkpoints. Guitar stem via HTDemucs 6s and the 53-stem release `v1.0.21` (asset `mvsep_mega_model_bs_roformer_53_stems_v1.ckpt`, 1,368,919,887 bytes) | last commit 2026-11-10; PyPI `msst` 0.1.0 uploaded 2026-09-09 | RUNNABLE (`force_cpu`); docs: `torch>=2.0.1,<2.12` |
| BS-RoFormer / Mel-Band RoFormer (lucidrains implementation) | architecture code only, no weights | PyPI `BS-RoFormer` 1.4.1 uploaded 2026-11-04 | code only |
| bs-roformer-infer, melband-roformer-infer (OpenMIRLab) | inference packages for community RoFormer checkpoints. Guitar stem (BS-RoFormer-SW default) | PyPI 0.1.5 each, uploaded 2026-07-12; repos last commit 2026-10-05; READMEs: "OpenMIRLab no longer publishes new versions to PyPI." | RUNNABLE (`cpu` device) |
| BSRoformer.cpp (`chenmozhijin/BSRoformer.cpp`) | C++ / ggml runner for BS-RoFormer and Mel-RoFormer checkpoints converted to GGUF. Guitar stem with the BS-RoFormer-SW GGUF | branch `master` last commit 2026-06-16 | README: "Supports CPU/GPU (CUDA, Vulkan) acceleration" (not run here) |
| BS-RoFormer-SW (6 stems), becruily Mel-Band RoFormer guitar, `adityalakhani/htdemucs-6s-guitar-ft`, `barvarvara/demucs-guitar-lora` | community checkpoints. Guitar stem | HF repos created 2026-04-23 (SW mirror), 2025-05-20, 2026-07-19, 2026-05-23 | through audio-separator / MSST / demucs (all four run here; the guitar fine-tune in gap round 2, `trials.md`) |
| SCNet (Tong et al., ICASSP 2024) | 4-stem model, code + checkpoint | `starrytong/SCNet` last commit 2025-09-08 | via MSST / audio-separator |
| MDX23C / TFC-TDF-Net v3 (KUIELab, SDX 2023) | model family | `kuielab/sdx23` last commit 2023-05-17 | via MSST / audio-separator |
| MVSEP-MDX23 ensemble (ZFTurbo; README: "Model won 3rd place in challenge (Leaderboard C)" of SDX 2023) | ensemble inference script, 4 stems | last commit 2025-04-05; no LICENSE file | `--cpu` flag ("Can be very slow") |
| VR Architecture (`tsurumeso/vocal-remover`) | vocal / instrumental models behind UVR "VR Arch" | `develop` last commit 2026-09-10 | via audio-separator |
| Newer architectures in MSST: SubRoformer (arXiv 2611.08130, 2026-11-05, weights `archimickey/SubRoformer`), Dynamic Band Splitting (arXiv 2610.14993, 2026-10-10), BS-Mamba2 (arXiv 2508.14556), DTTNet, BS PolarFormer | research models | see MSST section | via MSST |
| Banquet (`kwatcharasupat/query-bandit`) | query-by-example separator (ISMIR 2024). Guitar stem by query (acoustic, clean electric, distorted electric) | last commit 2025-07-29; weights Zenodo 2024-09-05 | code has a CPU branch (`use_cuda=False` calls `system.cpu()` in `train.py`); not run here (gap round 2: running the clone's `train.py` was refused by the box's permission system, `trials.md`) |
| AudioSep (`Audio-AGI/AudioSep`) | text-queried separation of general sounds, 32 kHz mono | last commit 2024-11-26 | README picks CPU when CUDA is absent |
| SAM Audio (Meta) | text / visual / time-span prompted separation; gated weights (500M to 3B parameters) | `facebookresearch/sam-audio` last commit 2026-05-26; HF repos created 2025-12-12 | "CUDA-compatible GPU (recommended)"; 5.1 to 14.9 GB downloads |
| MuS3D (Aalto) | blind stem discovery + query separators (DiT from SAM Audio, BS-Locoformer); static 6-stem baseline with guitar | `REMUS-Aalto/Mus3D` last commit 2026-10-14; arXiv 2609.30912 (2026-09-25) | DiT "needs about 10 GB of free memory"; CPU via `CUDA_VISIBLE_DEVICES=` |
| ZeroSep | training-free text-guided separation with diffusion models | `WikiChao/ZeroSep` last commit 2025-11-03 | loads a text-guided diffusion backbone (AudioLDM, AudioLDM2 or Tango, per README); not checked |
| librosa HPSS (`librosa.decompose.hpss`, `librosa.effects.hpss`) | harmonic / percussive split, no learning | PyPI `librosa` 1.0.0 uploaded 2026-08-11 (requires Python >=3.12) | RUNNABLE |
| nussl | PyPI summary "A flexible sound source separation library." | PyPI `nussl` 1.1.9 uploaded 2021-04-02 (last release); README: "**NUSSL IS DEPRECATED**" | not checked |
| asteroid | PyPI summary "PyTorch-based audio source separation toolkit" | PyPI 0.7.0 uploaded 2023-10-12 (last release); `asteroid-team/asteroid` last commit 2026-11-03 | not checked |
| torchaudio `HDEMUCS_HIGH_MUSDB_PLUS`, `HDEMUCS_HIGH_MUSDB` | Hybrid Demucs (v3) pipelines inside torchaudio, 4 stems, no guitar | `pytorch/audio` main read 2026-11-10 | not checked |
| Gaborformer (`sevagh/gaborformer`) | 4-stem model (NSGT front end + BS-RoFormer-style network), released 2026-11-08 | `sevagh/gaborformer` last commit 2026-11-08; HF repo created 2026-11-08 | docs: "CPU inference is also supported" (not run here: installing the clone was refused by the box's permission system in gap round 2, `trials.md`) |
| Moises-Light (`crlandsc/moises-light`) | unofficial implementation of the architecture in "Moises-Light: Resource-efficient Band-split U-Net for Music Source Separation" (Hung et al., WASPAA 2025, per its README), code only; MSST key `moises_light` | PyPI `moises-light` 0.1.5 uploaded 2026-04-09 | architecture code, no weights named |
| demucs.cpp (sevagh) | C++ CPU inference of Demucs v3 / v4 incl. `htdemucs_6s` | last commit 2026-11-06 | RUNNABLE (compile) |
| free-music-demixer (sevagh) | in-browser WASM demo of demucs.cpp; README: "archived snapshot ... no longer maintained" | last commit 2026-11-06 | browser; weights not included |
| demucs.onnx (sevagh) | ONNX export of htdemucs + C++ runner | last commit 2026-02-08 | RUNNABLE (compile) |
| demucs-onnx (StemSplit) + `StemSplitio/*` ONNX repos | ONNX export, Python and `onnxruntime-web`. Guitar stem (`htdemucs_6s`) | PyPI `demucs-onnx` 0.3.4 uploaded 2026-05-22 | RUNNABLE |
| BS-RoFormer-SW ONNX (`elicwhite/bs-roformer-sw-6stem-onnx`) | browser-oriented ONNX export, 4 s chunks. Guitar stem | HF repo created 2026-05-23 | ONNX Runtime (CPU / WASM / WebGPU per card) |
| demucs-rs | Rust Demucs: native CLI (Metal / Vulkan), WASM + WebGPU, DAW plugin, and an MCP server (`demucs --mcp`). Guitar stem (`htdemucs_6s`) | `nikhilunni/demucs-rs` last commit 2026-10-19 | README prerequisites: "A GPU with Metal (macOS), Vulkan (Linux/Windows), or WebGPU (browser) support" |
| PolUVR (Politrees) | fork of python-audio-separator | PyPI `PolUVR` 1.11.0 uploaded 2025-09-28 | RUNNABLE |
| mlx-audio-separator | Apple Silicon (MLX) port | PyPI 0.1.20 uploaded 2026-10-02 | not here (Apple Silicon) |
| Hosted: MVSEP (incl. "Mega 53-stem Model"), LALAL.AI, Moises / Music.AI (lead and rhythm guitar), AudioShake, StemSplit, Spleeter Pro | services | hosted-apis lane | not here |

Not a separation tool despite the name: PyPI `uvr` (Oorteo, 0.2.6) is a runner for `uv` scripts (its README).

## Training datasets that recur below (read once, cited from the tool sections)

### MUSDB18 and MUSDB18-HQ
- 150 full songs (100 train, 50 test), four stems: drums, bass, other ("the rest of the accompaniment"), vocals,
  stereo 44.1 kHz. MUSDB18 is AAC in Native Instruments stems `.mp4`; MUSDB18-HQ is uncompressed wav.
  Zenodo records https://zenodo.org/records/1117372 (MUSDB18, published 2017-12-17) and
  https://zenodo.org/records/3338373 (MUSDB18-HQ, published 2019-08-01), read 2026-11-10 through
  `https://zenodo.org/api/records/<id>`. Zenodo license id on both records: `other-nc`.
- License clause, MUSDB18 record: "MUSDB18 is provided for educational purposes only and the material contained in
  them should not be used for any commercial purpose without the express permission of the copyright holders:"
  followed by "100 tracks were derived from The ‘Mixing Secrets’ Free Multitrack Download Library", "46 tracks are
  taken from the MedleyDB licensed under Creative Commons (BY-NC-SA 4.0)", "2 tracks were kindly provided by Native
  Instruments originally part of their stems pack", "2 tracks a from from the Canadian rock band The Easton Ellises as
  part of the heise stems remix competition, licensed under Creative Commons (BY-NC-SA 3.0)."
  (https://zenodo.org/records/1117372, read 2026-11-10)
  The first item continues: "Please refer to this original resource for any question regarding your rights on your use
  of the DSD100 data."
- License clause, MUSDB18-HQ record: "MUSDBHQ: is provided for educational purposes only and the material contained
  in them should not be used for any commercial purpose without the express permission of the copyright holders:"
  with the same four sources; its first item reads "100 tracks are taken from the DSD100 data set, which is itself
  derived from The ‘Mixing Secrets’ Free Multitrack Download Library. Please refer to this original resource for any
  question regarding your rights on your use of the DSD100 data." (https://zenodo.org/records/3338373, read
  2026-11-10; re-read through `https://zenodo.org/api/records/3338373` by the verifier on 2026-11-10)
- Code to read it: `musdb` (PyPI 0.4.3, uploaded 2025-05-28, license field `MIT`), repository
  https://github.com/sigsep/sigsep-mus-db (MIT, "Copyright (c) 2015, 2016, 2017 Fabian-Robert Stöter").

### MoisesDB
- Paper: Pereira, Araújo, Korzeniowski, Vogl, "Moisesdb: A dataset for source separation beyond 4-stems",
  https://arxiv.org/abs/2307.15913. Loader repository https://github.com/moises-ai/moises-db (last commit
  2025-02-03). Its README says the data is downloaded from https://music.ai/research/ ("Please download the dataset at
  our research [website](https://music.ai/research/)").
- The repository's `LICENSE` file is the full text of "Attribution-NonCommercial-ShareAlike 4.0 International"
  (https://raw.githubusercontent.com/moises-ai/moises-db/main/LICENSE, read 2026-11-10). The README front matter
  says `license: other`, `license_name: cc-by-nc-sa-4.0`, `license_link: https://creativecommons.org/licenses/by-nc-sa/4.0/`
  (https://raw.githubusercontent.com/moises-ai/moises-db/main/README.md, read 2026-11-10).
- Download page terms (https://music.ai/research/, read 2026-11-10 by the verifier): "MoisesDB is offered free of
  charge for non-commercial research use only and includes baseline performance results for two publicly available
  source separation methods." The page's "Download" control was not followed, so any terms shown at download time
  were not read (UNVERIFIED).

## Demucs v4 (Hybrid Transformer Demucs)
- What: waveform + spectrogram hybrid U-Net with a cross-domain Transformer (Rouard, Massa, Défossez, "Hybrid
  Transformers for Music Source Separation", ICASSP 2023, https://arxiv.org/abs/2211.08553). Made at Meta AI.
- Repositories: https://github.com/facebookresearch/demucs (last commit 2023-11-16, head e976d93). Its README says:
  "**Important:** As I am no longer working at Meta, **this repository is not maintained anymore**. I've created a
  fork at [github.com/adefossez/demucs](https://github.com/adefossez/demucs)."
  https://github.com/adefossez/demucs (last commit 2026-10-26, head 829d218) says: "**This is the officially
  maintained Demucs** now that I (Alexandre Défossez) have left Meta to join [Kyutai](...). Note that I'm not
  actively working on Demucs anymore, so expect slow replies and no new feature for now."
- Version: PyPI `demucs` 4.1.0 uploaded 2026-07-11 (homepage `github.com/adefossez/demucs`). Release notes
  (`docs/release.md`): "V4.1.0, 11th of July 2026": `pyproject.toml` packaging, "Minimum supported Python version is
  now 3.10, and torch 2.1", "**Removed torchaudio for inference**: audio decoding now goes through
  [sphn](https://github.com/kyutai-labs/sphn) with a fallback on ffmpeg for other formats.", "**Pretrained models are now hosted on the HuggingFace hub** (as safetensors ...)". The loader
  (`demucs/hf.py`) uses `DEFAULT_NAMESPACE = "adefossez"`; the Hub lists 11 repos under `adefossez/`
  (`HTDemucs`, `HTDemucs-6s`, `HTDemucs-ft`, `Demucs-hdemucs_mmi`, `Demucs-mdx`, `Demucs-mdx_extra`,
  `Demucs-mdx_extra_q`, `Demucs-mdx_q`, three `Demucs-repro_mdx_a*`), created 2026-07-11 (Hub API
  `https://huggingface.co/api/models?author=adefossez`, read 2026-11-10). Older checkpoints remain at
  `https://dl.fbaipublicfiles.com/demucs/...` (the loader falls back to "the legacy AWS repo").
- Models (README "Separating tracks"): "`htdemucs`: first version of Hybrid Transformer Demucs. Trained on MusDB + 800
  songs. Default model." / "`htdemucs_ft`: fine-tuned version of `htdemucs`, separation will take 4 times more time
  but might be a bit better." / "`htdemucs_6s`: 6 sources version of `htdemucs`, with `piano` and `guitar` being added
  as sources. Note that the `piano` source is not working great at the moment." / "`hdemucs_mmi`: Hybrid Demucs v3,
  retrained on MusDB + 800 songs." / "`mdx`: trained only on MusDB HQ" / "`mdx_extra`: trained with extra training
  data (**including MusDB test set**)" / "`mdx_q`, `mdx_extra_q`: quantized version of the previous models."
  Earlier in the README: "We are also releasing an experimental 6 sources model, that adds a `guitar` and `piano`
  source. Quick testing seems to show okay quality for `guitar`, but a lot of bleeding and artifacts for the `piano`
  source." Stems: 4 (drums, bass, other, vocals); `htdemucs_6s` adds guitar and piano (6). No lead / rhythm or
  acoustic / electric split.
- How a program calls it:
  - CLI: `demucs [-n MODEL] [--two-stems=STEM] [--mp3 [--mp3-bitrate N] | --flac | --int24 | --float32]
    [--segment SECONDS] [--shifts N] [--overlap 0.25] [-j JOBS] [-d cpu] [--clip-mode clamp] FILE ...`
    (README; the README offers `uvx demucs MY_TRACK.mp3` "with no install step at all"). Sources differ on
    dependencies: PyPI 4.1.0 `requires_dist` lists numpy only as `numpy<2; sys_platform == "darwin" and
    platform_machine == "x86_64"` (https://pypi.org/pypi/demucs/json, read 2026-11-10), and trials.md records that on
    this Linux box, after `uv pip install demucs==4.1.0`, the first `demucs --help` failed with "ModuleNotFoundError: No
    module named 'numpy'" until numpy was installed. `uvx demucs` itself was not run here.
  - Python: `import demucs.api; separator = demucs.api.Separator(model="htdemucs_6s"); origin, separated =
    separator.separate_audio_file("file.mp3")` or `separator.separate_tensor(wav, sr)`; `demucs.api.save_audio(...)`;
    `demucs.api.list_models()`. `separate_tensor` takes "Waveform of the audio. Should have 2 dimensions, the first is
    each audio channel" and returns "A tuple, whose first element is the original wave and second element is a dict,
    whose keys are the name of stems and values are separated waves" (`docs/api.md`). Also
    `demucs.separate.main([...CLI args...])`.
  - Runs on CPU: "If you do not have enough memory on your GPU, simply add `-d cpu` to the command line to use the
    CPU. With Demucs, processing time should be roughly equal to 1.5 times the duration of the track." GPU memory:
    "at least 3GB of RAM on your GPU ... about 7GB of RAM will be required if you use the default arguments".
    "the Hybrid Transformer models only support a maximum segment length of 7.8 seconds." (README)
- Input: "All audio formats supported by [sphn] can be processed directly (wav, flac, mp3, ogg, aac...). Other formats
  are handled through `ffmpeg` when it is installed" and "Audio is resampled on the fly if necessary." No length
  limit is stated; long files are processed in segments.
- Output: "Separated tracks are stored in the `separated/MODEL_NAME/TRACK_NAME` folder. There you will find four
  stereo wav files sampled at 44.1 kHz: `drums.wav`, `bass.wav`, `other.wav`, `vocals.wav`"; "The output will be a
  wav file encoded as int16" unless `--float32`/`--int24`/`--mp3`/`--flac`. "Demucs will automatically rescale each
  output stem so as to avoid clipping. This can however break the relative volume between stems." (README).
  `htdemucs_6s` additionally writes `guitar` and `piano` (its training sidecar `5c90dfd2.json` has
  `"sources": ["drums", "bass", "other", "vocals", "guitar", "piano"]` under `training_args.dset`). Output is audio
  only: no notes, no confidence. Run here: `demucs -n htdemucs_6s -d cpu -o .../out S4.wav` (run r0021, exit 0) wrote
  `out/htdemucs_6s/S4/{drums,bass,other,vocals,guitar,piano}.wav`, each 2 channels, 44100 Hz, PCM_16, same frame count
  as the input (`soxi` by the verifier; `samples/demucs/stemfacts_htdemucs_6s_S4.json` by the try agent).
- Controls a human-in-the-loop re-run could change: model (`-n`), target stem (`--two-stems=STEM`, with
  `--other-method add|minus|none` for the complement, listed under the "V4.1.0" heading of `docs/release.md`), `--segment`, `--shifts`,
  `--overlap`, clip mode. No pitch, tuning, key or instrument-range input.
- Access: runs on a CPU box (docs above). No account. Model download from the Hugging Face Hub (ungated) or
  `dl.fbaipublicfiles.com`.
- LICENSE FACTS
  - a. Code: MIT. "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
    associated documentation files (the "Software"), to deal in the Software without restriction, including without
    limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
    Software" ("Copyright (c) Meta Platforms, Inc. and affiliates.") — https://raw.githubusercontent.com/adefossez/demucs/main/LICENSE
    and https://raw.githubusercontent.com/facebookresearch/demucs/main/LICENSE (identical bytes), read 2026-11-10.
  - b. Weights: the maintained fork's README, section "License": "Demucs code is released under the MIT license as
    found in the [LICENSE](LICENSE) file. The license of the weights is not clear: MusDB contains some data that were
    only usable for research purpose. I sadly cannot help granting a license, both coming from Meta custom data, or
    from the original MusDB data. The 6 source variant of htdemucs was trained only on Meta internal dataset, which
    likely means CC-NC-BY license is applicable, as it was the case for all models released by FAIR. Do not write me
    to ask about it, I won't be able to clarify the situation further, either for MusDB or Meta internal dataset."
    (https://raw.githubusercontent.com/adefossez/demucs/main/README.md, read 2026-11-10). The archived Meta README
    says only: "Demucs is released under the MIT license as found in the [LICENSE](LICENSE) file."
    (https://raw.githubusercontent.com/facebookresearch/demucs/main/README.md, read 2026-11-10). The Hub model cards
    `adefossez/HTDemucs`, `adefossez/HTDemucs-6s`, `adefossez/HTDemucs-ft` carry no `license` field (card metadata
    has only `tags`) and their README text has no license sentence (https://huggingface.co/adefossez/HTDemucs-6s,
    read 2026-11-10).
  - c. Training data: README: "It has been trained on the [MUSDB HQ] dataset + an extra training dataset of 800
    songs." For `htdemucs_6s` the README says "trained only on Meta internal dataset" (quoted above); the training
    sidecar `5c90dfd2.json` on the Hub lists `dset.musdb: /checkpoint/defossez/datasets/musdbhq`,
    `dset.wav: /checkpoint/defossez/datasets/mmi44_6_goodclean/` and a `test_mapping` that maps guitar and piano to
    index 2 (other) (https://huggingface.co/adefossez/HTDemucs-6s/raw/main/5c90dfd2.json, read 2026-11-10). MUSDB18-HQ
    clause: see the datasets section above.
- Author measurements: "The model achieves a SDR of 9.00 dB on the MUSDB HQ test set. Moreover, when using sparse
  attention kernels to extend its receptive field and per source fine-tuning, we achieve state-of-the-art 9.20 dB of
  SDR." (README; the sparse model "is not provided"). README table "Comparison of accuracy" ("`Overall SDR` is the mean
  of the SDR for each of the 4 sources"; the test set is not named next to the table): "HT Demucs f.t. (v4) | hybrid |
  800 songs | 9.0". ZFTurbo's table "Multi-stem models" lists HTDemucs4 (6 stems) on the MVSep "Multisong" set as
  "bass: 11.22, drums: 10.22 vocals: 8.05 other: --- piano: --- guitar: ---" (https://raw.githubusercontent.com/ZFTurbo/Music-Source-Separation-Training/main/docs/pretrained_models.md, read 2026-11-10); no guitar SDR is given there.

## Spleeter (Deezer)
- What: U-Net spectrogram-mask models in TensorFlow, from Deezer Research. Paper: Hennequin et al., "Spleeter: a fast
  and efficient music source separation tool with pre-trained models", JOSS (repository `paper.md`). Repository
  https://github.com/deezer/spleeter (branch `master`, last commit 2026-10-28 "Update README.md", head 6f2c8a2).
  PyPI `spleeter` 2.4.2 uploaded 2025-04-03, `requires_python <3.12,>=3.8`; CHANGELOG 2.4.2: "Dependecy upgrades
  and adding support for python 3.11 (dropping 3.7)". Weights are fetched from the repository's GitHub release
  `v1.4.0` (`LATEST_RELEASE: str = "v1.4.0"` in `spleeter/model/provider/github.py`).
- Models and stems (README): "Vocals (singing voice) / accompaniment separation (2 stems)", "Vocals / drums / bass /
  other separation (4 stems)", "Vocals / drums / bass / piano / other separation (5 stems)". Configs `2stems`,
  `4stems`, `5stems` and `-16kHz` variants (`spleeter/resources/*.json`: `"sample_rate":44100`, `"F":1024` for the
  standard models, `"F":1536` for `4stems-16kHz`). No guitar stem.
- How a program calls it:
  - CLI: `spleeter separate -p spleeter:4stems -o OUTPUT_DIR FILE` (README quick start uses `spleeter:2stems`).
    Options in `spleeter/options.py`: `--offset/-s` (default 0.0), `--duration/-d` (default `600.0`, help: "Set a
    maximum duration for processing audio (only separate offset + duration first seconds of the input file)"),
    `--codec/-c` (`wav`, `mp3`, `ogg`, `m4a`, `wma`, `flac`), `--bitrate/-b` (default `128k`),
    `--filename_format` (default `{filename}/{instrument}.{codec}`), `--mwf` ("Whether to use multichannel Wiener
    filtering for separation").
  - Python: `spleeter.separator.Separator(...)`; `separate(waveform: np.ndarray, audio_descriptor: Optional[str] = "")`
    returns a `Dict` (docstring: "Separated waveforms."); `separate_to_file(audio_descriptor, destination, audio_adapter=None, offset=0,
    duration=600.0, codec=Codec.WAV, ...)` (`spleeter/separator.py`).
  - Needs: "You need first to install `ffmpeg` and `libsndfile`" (README). "Training and inference are implemented
    in Tensorflow which makes it possible to run the code on Central Processing Unit (CPU) or GPU." (`paper.md`)
- Input: anything ffmpeg decodes (default adapter `spleeter.audio.ffmpeg.FFMPEGProcessAudioAdapter`); by default only
  the first 600 s are separated (the `--duration` default above). Output: one file per instrument
  (`vocals.wav` and `accompaniment.wav` for 2 stems, per the README), audio only.
- Controls for a re-run: model (`-p`), offset and duration, Wiener filtering (`--mwf`). No pitch, tuning or instrument
  hints.
- LICENSE FACTS
  - a. Code: MIT, "Copyright (c) 2019-present, Deezer SA." with the standard grant "Permission is hereby granted, free of
    charge, to any person obtaining a copy of this software ..." (https://raw.githubusercontent.com/deezer/spleeter/master/LICENSE,
    read 2026-11-10). README: "The code of **Spleeter** is [MIT-licensed](LICENSE)."
  - b. Weights: `paper.md`: "Spleeter [@spleeter] source code and pre-trained models are available on
    [github](https://www.github.com/deezer/spleeter) and distributed under a MIT license."
    (https://raw.githubusercontent.com/deezer/spleeter/master/paper.md, read 2026-11-10). The README's license section
    names only the code. The README also has a section headed "Agents", about automated requests that LLM-based
    agents send to the maintainers [passage omitted: its wording is addressed to AI agents] (README, read 2026-11-10).
    README "Disclaimer": "If you plan to use **Spleeter** on copyrighted material, make sure you get proper
    authorization from right owners beforehand."
  - c. Training data: "The models were trained on Deezer's internal datasets (noteworthily the Bean dataset that was
    used in [@deezerICASSP2019])" and "Note that we cannot release the training data for copyright reasons, and thus,
    sharing pre-trained models were the only way to make these results available to the community." and "while it was
    not trained, validated or optimized in any way with musdb18 data" (`paper.md`). The Demucs README table lists
    Spleeter's extra data as "25k songs".
  - d. Deezer sells a separate commercial product: "Check out our commercial version : [Spleeter
    Pro](https://www.deezer-techservices.com/solutions/spleeter/)" (README). Its terms were not read (hosted-apis lane).
- Author measurements: "Spleeter is able to separate the whole musdb18 test dataset (about $3$ hours and $27$ minutes
  of audio) into $4$ stems in less than $2$ minutes, including model loading time (about $15$ seconds), and audio wav
  files export, using a single GeForce RTX 2080 GPU, and a double Intel Xeon Gold 6134 CPU @ 3.20GHz" (`paper.md`, the
  `$` signs are its LaTeX markup). Demucs README table "Comparison of accuracy": Spleeter "Overall SDR" 5.9, extra
  data "25k songs" (the test set is not named next to the table).

## Open-Unmix (`umxl`, `umxhq`, `umx`, `umxse`)
- What: a three-layer bidirectional LSTM on magnitude spectrograms, one model per target, from Inria / sigsep
  (Stöter, Uhlich, Liutkus, Mitsufuji, JOSS 2019). Repository https://github.com/sigsep/open-unmix-pytorch (branch
  `master`, last commit 2024-04-16, head fb672c9). PyPI `openunmix` 1.3.0 uploaded 2024-04-16, `requires_python >=3.9`.
- Models (README "Pre-trained models"): "__`umxl` (default)__ trained on private stems dataset of compressed stems.
  __Note, that the weights are only licensed for non-commercial use (CC BY-NC-SA 4.0).__"; "__`umxhq`__ trained on
  [MUSDB18-HQ] which comprises the same tracks as in MUSDB18 but un-compressed which yield in a full bandwidth of
  22050 Hz."; "__`umx`__ is trained on the regular [MUSDB18] which is bandwidth limited to 16 kHz do to AAC
  compression."; "__`umxse`__ speech enhancement model is trained on the 28-speaker version of the
  [Voicebank+DEMAND corpus]". Stems: vocals, drums, bass, other. No guitar stem.
- How a program calls it:
  - CLI: `umx input_file.wav` ("To separate audio files (`wav`, `flac`, `ogg` - but not `mp3`) files just run").
    Parameters in `docs/inference.md`.
  - Python: `separator = openunmix.umxl(...)`, or `torch.hub.load('sigsep/open-unmix-pytorch', 'umxl', device=device)`;
    then `estimates = separator(audio, ...)` on "`audio` (torch.Tensor of shape `(channels, length)`, provided as at a
    sampling rate `separator.sample_rate`)"; one-liner `from openunmix.predict import separate; estimates =
    separate(audio, ...)`. `models.Separator` takes "A time domain signal tensor of shape `(nb_samples, nb_channels,
    nb_timesteps)`"; the `*_spec` variants take magnitude spectrograms. (README)
  - "Due to its recurrent nature, the model can be trained and evaluated on arbitrary length of audio signals. Since
    the model takes information from past and future simultaneously, the model cannot be used in an online/real-time
    manner." (README). The PyPI version "uses [torchaudio] to load and save audio files".
- Controls for a re-run: choice of model and targets; Wiener filtering parameters are in `docs/inference.md` (not
  read here). No pitch or instrument hints.
- LICENSE FACTS
  - a. Code: MIT, "Copyright (c) 2019 Inria (Fabian-Robert Stöter, Antoine Liutkus)", grant "Permission is hereby
    granted, free of charge, to any person obtaining a copy of this software ..."
    (https://raw.githubusercontent.com/sigsep/open-unmix-pytorch/master/LICENSE, read 2026-11-10).
  - b. Weights: `umxl` on Zenodo record https://zenodo.org/records/5069601 ("Open-Unmix-Pytorch UMX-L", 2021-07-05):
    license id `cc-by-nc-sa-4.0`; the README sentence quoted above says "only licensed for non-commercial use (CC
    BY-NC-SA 4.0)". `umxhq`: https://zenodo.org/records/3370489 ("Open-Unmix-Pytorch UMX-HQ", 2019-08-14): license id
    `mit-license`. `umx`: https://zenodo.org/records/3370486 (2019-08-14): license id `mit-license`. `umxse`:
    https://zenodo.org/records/3786908 ("Open-Unmix for Speech Enhancement (UMX SE)", 2020-05-05): license id
    `mit-license`. (Zenodo API, read 2026-11-10)
  - c. Training data: `umxl`: "private stems dataset of compressed stems" (README); `umxhq`: MUSDB18-HQ; `umx`:
    MUSDB18 (both "provided for educational purposes only", see the datasets section).
- Author measurements (README table "Scores (Median of frames, Median of tracks)", under the heading "Results compared
  to SiSEC 2018 (SDR/Vocals)"; the README does not name the test set next to the table): SDR vocals 6.32 / 6.25 /
  7.21, bass 5.23 / 5.07 / 6.02, drums 5.73 / 6.04 / 7.15, other 4.02 / 4.28 / 4.89 for UMX / UMXHQ / UMXL.
- Run here (try agent; ledger and trials.md): `umx --model umxhq --no-cuda` on S4 exited 1 as run r0051 with
  "ImportError: TorchCodec is required for load_with_torchcodec. Please install torchcodec to use this function."
  (trials.md: torchaudio 2.11.1 routes `load` and `save` through torchcodec) and exited 0 as run r0085 after
  `uv pip install torchcodec`; `umx --model umxl` on S4 (run r0101, exit 0) wrote four wav files (`bass`, `drums`,
  `other`, `vocals`) under `--outdir/S4/`, each 2 channels, 44100 Hz, 16-bit PCM (`soxi` by the verifier; trials.md
  reports the same format for every run). This agrees with the README's torchaudio note above.

## python-audio-separator (`audio-separator`) and the UVR model zoo
- What: a CLI and Python wrapper around the separation code of Ultimate Vocal Remover (UVR). README: "Audio Separator
  is a Python package that allows you to separate an audio file into various stems, using models trained by @Anjok07
  for use with [Ultimate Vocal Remover]" and "this repo is just a CLI/Python package wrapper to simplify running those
  models programmatically". Maintainer Andrew Beveridge (@beveradb). Repository
  https://github.com/nomadkaraoke/python-audio-separator (last commit 2026-10-29, head 4dd3477 "feat: download models
  from our mirror first and verify SHA-256 (v0.48.0)"); PyPI `audio-separator` 0.48.0 uploaded 2026-10-29
  (`requires_python !=3.14.1,>=3.10`; PyPI project URLs point at `github.com/karaokenerds/python-audio-separator`).
- Architectures it runs (README and `audio_separator/models.json`): VR Arch (`.pth`), MDX-Net (`.onnx`), MDXC /
  MDX23C and RoFormer (`.ckpt` + `.yaml`: BS-RoFormer, Mel-Band RoFormer), Demucs (`.yaml`). The model list is built
  at run time from UVR's list `https://raw.githubusercontent.com/TRvlvr/application_data/main/filelists/download_checks.json`
  plus the package's own `audio_separator/models.json` (`separator.py` lines 732-805). On 2026-11-10 UVR's list held
  27 VR, 30 MDX-Net, 24 Demucs, 1 MDX23, 1 MDX23C, 8 RoFormer, 11 "other_network_list_new" entries plus VIP lists
  (9 MDX-Net, 2 MDX23C); the package's own list added 2 VR, 1 MDX-Net, 2 MDX23C and 84 RoFormer entries.
- Stems beyond vocals / instrumental (from `audio_separator/models-scores.json`, 115 scored models, and
  `models.json`): the `htdemucs_6s.yaml` entry of `models-scores.json` has `"stems": ["vocals", "drums", "bass",
  "guitar", "piano", "other"]` (median scores only for vocals, drums and bass); "Roformer Model:
  BS Roformer SW by jarredou" (`BS-Roformer-SW.ckpt`, unscored in the scores file); `17_HP-Wind_Inst-UVR.pth`
  (woodwinds); `MDX23C-DrumSep-aufr33-jarredou.ckpt` (kick, snare, toms, hh, ride, crash); 4-stem Demucs and the
  `kuielab_*` drums / bass / other models; plus de-reverb, de-echo, denoise, crowd, male / female and aspiration
  models. No guitar-only model and no lead / rhythm or acoustic / electric split is in either list (searched for
  "guitar", "piano", "6s", "SW").
- How a program calls it:
  - CLI: `audio-separator FILE [-m MODEL_FILENAME] [--output_format FLAC|WAV|MP3...] [--output_dir DIR]
    [--model_file_dir DIR] [--single_stem STEM] [--sample_rate 44100] [--chunk_duration SECONDS] [--list_models
    [--list_filter=guitar] [--list_format json]]`. Default model: "default: model_bs_roformer_ep_317_sdr_12.9755.yaml";
    default output format "FLAC" in the CLI help, "WAV" in the Python parameter list; `--single_stem` example values
    "Instrumental, Vocals, Drums, Bass, Guitar, Piano, Other"; model files cached in `/tmp/audio-separator-models/` by
    default. (README "Usage")
  - Python: `from audio_separator.separator import Separator; separator = Separator(output_dir='output');
    separator.load_model(model_filename='htdemucs_6s.yaml'); output_files = separator.separate('audio.wav')`
    (returns the list of written file paths); a list of models in `load_model` makes an ensemble (`avg_wave`,
    `uvr_max_spec`, `uvr_min_spec`, ...). (README "Python API Usage")
  - HTTP: "Audio Separator includes a remote API client that allows you to connect to a deployed Audio Separator API
    service ... The API uses asynchronous processing with job polling" (README "Remote API Usage"; "To deploy Audio Separator as an API on modal.com
    ... please see ... audio_separator/remote/README.md", not read here). You host it yourself.
  - Install for this box: `pip install "audio-separator[cpu]"` (README "No hardware acceleration, CPU only");
    README "Requirements": "Python >= 3.10 (Python 3.14.1 is not supported)" and "Libraries: torch, onnx, onnxruntime,
    numpy, librosa, requests, six, tqdm, pydub". README precision table: "CPU | MelBand RoFormer, BS-RoFormer | `fp32`, or `autocast`
    when available | Supported with both precision modes". Long files: "`--chunk_duration` option automatically splits
    large files into smaller chunks ... merges the results ... with simple concatenation".
- Input: a file path, a list of paths, or a directory (`separator.separate('path/to/audio_directory')` in the README).
  Output: one audio file per stem, file names
  carry the stem name (custom names via `custom_output_names`, e.g. `"Guitar": "guitar_output"`), sample rate 44100 by
  default. Audio only.
- Controls for a re-run: model filename, single stem, ensemble of models and algorithm, chunk length, sample rate,
  normalization / amplification, `--invert_spect`. No pitch or tuning inputs.
- Where the weights come from (README "Where Models Are Downloaded From"): "Each file is fetched from the
  [audio-separator models release](https://github.com/nomadkaraoke/python-audio-separator/releases/tag/model-configs)
  first, with the original source (the UVR model repo, or Meta's CDN for Demucs) as a fallback. UVR VIP models are
  still fetched from Anjok07's repo first." `separator.py` names the hosts:
  `https://github.com/TRvlvr/model_repo/releases/download/all_public_uvr_models` (public),
  `https://github.com/Anjok0109/ai_magic/releases/download/v5` (VIP) and the package's `model-configs` release.
  For VIP models it logs: "is a VIP model, intended by Anjok07 for access by paying subscribers only." Every file is
  checked against SHA-256 values in `audio_separator/model-checksums.json`. On 2026-11-10 a `curl -I -L` of
  `.../TRvlvr/model_repo/releases/download/all_public_uvr_models/model_bs_roformer_ep_317_sdr_12.9755.ckpt` returned
  200 (639,331,213 bytes) and `.../python-audio-separator/releases/download/model-configs/BS-Roformer-SW.ckpt` returned
  200 (699,412,152 bytes).
- Model families and their makers (as the sources state):
  - VR Arch: UVR README credits "[tsurumeso] - Developed the original VR Architecture code." UVR's README says "UVR's
    core developers trained all of the models provided in this package (except for the Demucs v3 and v4 4-stem
    models)." Original code: https://github.com/tsurumeso/vocal-remover (MIT, "Copyright (c) 2019 tsurumeso", branch
    `develop` last commit 2026-09-10).
  - MDX-Net: "[Kuielab & Woosung Choi] - Developed the original MDX-Net AI code." (UVR README). KUIELab's MDX 2021
    code: https://github.com/kuielab/mdx-net (MIT, "Copyright (c) 2020 KINoAI", last commit 2021-08-22). The
    `kuielab_a_*` / `kuielab_b_*` ONNX models in the list carry KUIELab's name.
  - MDX23C: "[ZFTurbo] - Created & trained the weights for the new MDX23C models." (UVR README). The TFC-TDF-Net v3
    code of KUIELab's SDX 2023 entry is https://github.com/kuielab/sdx23 (MIT, "Copyright (c) 2023 IELab@ Korea
    University", branch `mdx_AB`, last commit 2023-05-17).
  - RoFormer: BS-RoFormer (Lu, Wang, Kong, Hung, https://arxiv.org/abs/2309.02612) and Mel-Band RoFormer (Wang, Lu,
    Won, https://arxiv.org/abs/2310.01809) architectures. MSST's README lists both with "[Repository](https://github.com/lucidrains/BS-RoFormer)" and
    "Thanks to [@lucidrains](https://github.com/lucidrains) for recreating the RoFormer models based on papers." The checkpoints are
    community-trained: the list names viperx, Kimberley Jensen, unwa, Gabox, becruily, aufr33, anvuew, Sucial,
    SYH99999, jarredou, frazer.
  - Demucs: Meta's checkpoints (see the Demucs section).
- LICENSE FACTS
  - a. Code: MIT, "Copyright (c) 2023 karaokenerds", "Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software ..." (https://raw.githubusercontent.com/nomadkaraoke/python-audio-separator/main/LICENSE,
    read 2026-11-10). README: "This project is licensed under the MIT [License](LICENSE)." followed by the list item
    "**Please Note:** If you choose to integrate this project into some other project using the default model or any
    other model trained as part of the [UVR](https://github.com/Anjok07/ultimatevocalremovergui) project, please honor
    the MIT license by providing credit to UVR and its developers!"
  - b. Weights: no per-model license file or field was found in `models.json`, `models-scores.json`,
    `model-checksums.json`, UVR's `download_checks.json`, or `TRvlvr/model_repo` (its tree holds `README.rd`, whose text is
    "model_repo", and `update_patches.txt`; `https://raw.githubusercontent.com/TRvlvr/application_data/main/LICENSE`
    returned 404 on 2026-11-10). The UVR README statement applies to "our models": "For all third-party application
    developers who wish to use our models, please honor the MIT license by providing credit to UVR and its developers."
    (https://raw.githubusercontent.com/Anjok07/ultimatevocalremovergui/master/README.md, read 2026-11-10). For
    individual community checkpoints, see the RoFormer and guitar-model sections.
  - c. Training data: not stated per model in these lists. UNVERIFIED for each UVR-trained model; reading each
    model's original announcement would settle it.
- Author measurements: `models-scores.json` stores per-track SDR / SIR / SAR / ISR for 115 models (e.g. the
  `1_HP-UVR.pth` entry has track "A Classic Education - NightOwl" vocals SDR 5.24871); the README's example list
  prints "htdemucs_6s.yaml Demucs vocals (9.7), drums (8.5), bass (10.0), guitar, piano, other" (no guitar SDR).
  The evaluation set behind these numbers is not named in the README (UNVERIFIED; the track names match MUSDB18
  track titles).

## Ultimate Vocal Remover GUI (UVR5)
- Desktop application around the same model zoo; README sections "Windows Installation", "MacOS Installation" (v5.6
  `.dmg` downloads for arm64 and x86_64) and "Linux Installation (Updated Instructions)" ("for Debian & Arch-based Linux
  systems"). Repository
  https://github.com/Anjok07/ultimatevocalremovergui (branch `master`, last commit 2026-10-06 "Revise README for
  Ultimate Vocal Remover GUI v5.6", head a5f8845). README header: "DEVELOPMENT UPDATE - October 6th, 2026: Please see
  the following issue for the latest UVR development update! - [Issue 2399]" (issue not read: github.com pages
  return 403 here).
- How a program calls it: no programmatic interface is documented in the README (GUI). `audio-separator` (above)
  is a Python package that wraps UVR's separation code.
- LICENSE FACTS: README: "The **Ultimate Vocal Remover GUI** code is [MIT-licensed](LICENSE)." and "**Please
  Note:** For all third-party application developers who wish to use our models, please honor the MIT license by
  providing credit to UVR and its developers." The linked file is missing: the tree at head a5f8845 has no LICENSE
  file and `https://raw.githubusercontent.com/Anjok07/ultimatevocalremovergui/master/LICENSE` returned 404 on
  2026-11-10. README also: "This project is 100% open-source and free for anyone to use and modify as they wish."

## Music-Source-Separation-Training (MSST, ZFTurbo)
- What: training, validation and inference code for many separation architectures, plus a list of published
  checkpoints. README: "Repository for training models for music source separation. Repository is based on [kuielab
  code] for [SDX23 challenge] ... Brought to you by [MVSep.com](https://mvsep.com)." Paper: Solovyev, Kiselev,
  Stempkovskiy, Gabruseva, "Music-Source-Separation-Training (MSST): A Unified Framework for Training and Evaluating
  Music Demixing Models", https://arxiv.org/abs/2607.23395 (submitted 2026-07-25). Repository
  https://github.com/ZFTurbo/Music-Source-Separation-Training (last commit 2026-11-10, head 1d4b3c4). PyPI `msst` 0.1.0
  uploaded 2026-09-09 (`license_expression: 'MIT'`, `requires_python <3.14,>=3.10`).
- Architectures (`--model_type` keys, README): `mdx23c`, `htdemucs`, `segm_models`, `torchseg`, `bs_roformer`,
  `mel_band_roformer`, `mel_roformer_official`, `bs_roformer_official`, `swin_upernet`, `bandit`, `scnet`, `bandit_v2`,
  `apollo`, `bs_mamba2`, `conformer`, `dttnet`, `bs_conformer`, `scnet_tran`, `scnet_masked`, `sub_roformer`
  (SubRoformer, https://arxiv.org/abs/2611.08130, submitted 2026-11-05, "[Official weights](https://huggingface.co/archimickey/SubRoformer/tree/main)"),
  `dbs_bsrnn` / `dbs_mel_roformer` / `dbs_bs_roformer` (Dynamic Band Splitting, https://arxiv.org/abs/2610.14993,
  submitted 2026-10-10), `vit_mel_roformer`.
- Published checkpoints with stems beyond four (`docs/pretrained_models.md`): "HTDemucs4 (6 stems) | bass / drums /
  vocals / other / piano / guitar" (Meta's weights URL); drum-kit splits "DrumSep htdemucs (by inagoy) | kick / snare /
  cymbals / toms" and "DrumSep mdx23c (by jarredou) | kick / snare / toms / hh / cymbals"; "BandIt Plus | speech / music
  / effects". No guitar-only checkpoint is in that list (read 2026-11-10).
- How a program calls it:
  - CLI (after `pip install msst`): `msst inference --model_type bs_roformer --config_path CONFIG.yaml
    --start_check_point MODEL.ckpt --input_folder IN/ --store_dir OUT/ [--force_cpu] [--use_tta] [--flac_file]
    [--pcm_type PCM_16|PCM_24|FLOAT] [--filename_template ...]` (`docs/cli.md`). Repository script form:
    `python inference.py --model_type ... --config_path ... --start_check_point ... --input_folder ... --store_dir ...`
    (README).
  - Python: `msst.inference(model_type=..., config_path=..., checkpoint_path=..., input_folder=..., output_folder=...,
    force_cpu=True)` "returns the paths it wrote"; `with msst.Separator(...) as separator: stems =
    separator.separate_file("a.wav")` where "`separate` and `separate_file` return a dictionary from stem name to a
    NumPy array shaped `(channels, samples)`" and "Input is resampled when `sample_rate` differs from
    `separator.sample_rate`" (`docs/python_api.md`).
  - CPU: "`force_cpu=True` takes precedence over CUDA availability." and "If CUDA is not available and CPU was not
    explicitly requested, inference falls back to CPU." (`docs/compatibility.md`). "MSST supports CPython 3.10, 3.11,
    3.12, and 3.13" and "`torch>=2.0.1,<2.12`" (same file). Training notes: "All batch sizes in config are adjusted to
    use with single NVIDIA A6000 48GB." (README)
- Input: "MSST first filters folder entries by extension, then asks librosa/SoundFile to decode and resample them"
  (`.wav`, `.flac`, `.aif(f)`, `.mp3` and others listed in `docs/compatibility.md`). Output: WAV (default subtype
  `FLOAT`; `PCM_24`, `PCM_16`) or FLAC (`PCM_24` default, `PCM_16`); names from `{relative_path}/{instr}`. Audio only.
- Controls for a re-run: checkpoint and config, TTA, `bigshifts`, `extract_instrumental`, LoRA weights. No pitch or
  tuning inputs.
- LICENSE FACTS
  - a. Code: MIT, "Copyright (c) 2024 Roman Solovyev (ZFTurbo)", "Permission is hereby granted, free of charge, to any
    person obtaining a copy of this software ..." (https://raw.githubusercontent.com/ZFTurbo/Music-Source-Separation-Training/main/LICENSE,
    read 2026-11-10).
  - b. Weights: `docs/pretrained_models.md` lists configs and weight links but no license per checkpoint, and the
    README has no sentence about a weights license (both read 2026-11-10). Many listed checkpoints are hosted outside
    the repository (Meta's `dl.fbaipublicfiles.com`, `TRvlvr/model_repo`, personal Hugging Face accounts); see the
    Demucs and community-checkpoint sections for what those hosts state.
  - c. Training data: the list marks a group "Models in this list were trained only on MUSDB18HQ dataset (100 songs
    train data). These weights are useful for fine-tuning." (MDX23C, DTTNet, SCNet variants, BS Roformer, BS Conformer)
    and "BS Mamba2 (Trained on MUSDB18 only)". For the other checkpoints the list does not name the training data.
- Author measurements (`docs/pretrained_models.md`): SDR per stem on MUSDB18 test and on MVSep's "Multisong" set,
  e.g. table "Multi-stem models (MUSDB18HQ)", row "SCNet XL IHF": "MUSDB test avg: 10.08 (bass: 9.23, drums: 11.81
  vocals: 11.42 other: 7.88)"; table "Multi-stem models", row "HTDemucs4" (stems "bass / drums / vocals / other"):
  "Multisong avg: 9.16 (bass: 11.76, drums: 10.88 vocals: 8.24 other: 5.74)". Benchmark paper cited by the README:
  "Evaluation Platform and Benchmarks for Music Source Separation", TISMIR 9(1) 625-639, 2026 (not read).
- Model types in the code: `utils/settings.py` (head 1d4b3c4) also accepts keys the README list does not name, among
  them `moises_light` (its config `configs/config_musdb18_moises_light.yaml` points to
  https://github.com/crlandsc/moises-light), `mel_band_conformer`, `scnet_roformer`, `scnet_unofficial` and
  experimental keys. "BS PolarFormer" is a checkpoint row in `docs/pretrained_models.md` ("vocals / other", release
  `v1.0.20`), not a `--model_type` key in the README. Release tags `v1.0.22` and `v1.0.23` also exist
  (`git ls-remote`, 2026-11-10); their notes were not read (github.com release pages return 403 here).

## SAM Audio (Meta, "Segment Anything Model for Audio")
- What: a flow-matching Diffusion Transformer that separates one target sound from a mixture given a text, visual
  (video mask) or time-span prompt, and returns target + residual. Paper: Shi et al., "SAM Audio: Segment Anything in
  Audio", https://arxiv.org/abs/2512.18099 (submitted 2025-12-19). Repository https://github.com/facebookresearch/sam-audio
  (last commit 2026-05-26, head bb4c699). Models on Hugging Face: `facebook/sam-audio-small`, `-base`, `-large`, and
  `-small-tv`, `-base-tv`, `-large-tv` ("better specifically on correctness of target sound as well as visual
  prompting"), plus `facebook/sam-audio-judge` (README). Hub API (read 2026-11-10): all seven repos (small, base,
  large, small-tv, base-tv, large-tv, judge) are `gated: manual`, card license `other` / `sam-license`; `usedStorage`
  5,100,547,943 bytes (small), 7,725,405,659 (base), 14,861,356,211 (large). Parameter counts in the paper's Table 8
  ("Total params"): 500M / 1B / 3B for SAM Audio-Small / -Base / -Large; "Parameter counts exclude the PE visual
  encoder, the T5 text encoder, and the DAC-VAE audio codec." It depends on `facebook/pe-av-large` (Hub card license
  `apache-2.0`, not gated).
- How a program calls it (README):
  - Python only: `from sam_audio import SAMAudio, SAMAudioProcessor; model =
    SAMAudio.from_pretrained("facebook/sam-audio-large"); processor = SAMAudioProcessor.from_pretrained(...); batch =
    processor(audios=[file], descriptions=["<description>"]); result = model.separate(batch, predict_spans=False,
    reranking_candidates=1)`; outputs `result.target` and `result.residual` saved at `processor.audio_sampling_rate`.
    The model card's "Output Format" section on https://huggingface.co/facebook/sam-audio-large (page HTML re-read
    directly by the verifier on 2026-11-10) says "Both are list[torch.Tensor] where each tensor is a 1D waveform".
  - Prompts: text ("To match training, please use lowercase noun-phrase/verb-phrase (NP/VP) format for text"), visual
    (`masked_videos=processor.mask_videos([frames], [mask])`), span (`anchors=[[["+", 6.3, 7.0]]]`). Options
    `predict_spans=True` and `reranking_candidates=k` (ranked by CLAP, the Judge model, or ImageBind).
  - Needs: "Python >= 3.11", "CUDA-compatible GPU (recommended)" (README). Paper, appendix paragraph "Latency": "Our
    default inference configuration uses 16 ODE steps with the midpoint solver. For text prompting, each separation on
    SAM Audio-Large takes approximately 7.3 s for a 10-second input on one A100 GPU". Section 3.4 ("Longform audio
    separation with Multi-diffusion"): "Processing arbitrarily long audio in a single forward pass is infeasible due to
    GPU memory limits."
- Input: audio file path or tensor (or video for visual prompts). Audio is encoded "into a T × C sequence at 25 Hz with
  C = 128" by a DAC-VAE; training clips "are capped at 30 seconds and randomly chunked when longer" (paper). Sample
  rate in the code (head bb4c699): `DACVAEConfig(..., sample_rate: int = 48_000)` (`sam_audio/model/config.py`) and
  `batch_audio(audios, audio_sampling_rate: int = 48_000)`, which resamples a file input and downmixes every input
  with `wav.mean(0)` (`sam_audio/processor.py`); `processor.audio_sampling_rate` is set from the checkpoint config's codec
  `sample_rate`. The checkpoint `config.json` is gated and was not read, so the rate a released checkpoint sets is
  UNVERIFIED; the code default is 48 kHz mono.
- Controls a human-in-the-loop re-run could use: the text description (e.g. "acoustic guitar"), a time span where the
  target sounds, a video mask over the guitar or a hand, the number of reranking candidates.
- Access: gated, "manual" approval. The model page (https://huggingface.co/facebook/sam-audio-large, HTML re-read
  directly by the verifier on 2026-11-10) shows the heading "You need to agree to share your Hugging Face information
  to access this model" and the text "The information you provide will be collected, stored, processed and shared in
  accordance with the [Meta Privacy Policy](https://www.facebook.com/privacy/policy/)." Its gate form (card metadata
  `extra_gated_fields`) asks for First Name, Last Name, Date of birth, Country, Affiliation and Job title, records
  `geo: ip_location`, and has the checkbox "By clicking Submit below I accept the terms of the license and acknowledge
  that the information I provide will be collected stored processed and shared in accordance with the Meta Privacy
  Policy". README: "please request access to the checkpoints on the SAM Audio Hugging Face
  [repo](https://huggingface.co/facebook/sam-audio-large). Once accepted, you need to be authenticated to download the
  checkpoints." A web demo is linked at https://aidemos.meta.com/segment-anything/editor/segment-audio (not opened).
  Aaron would need a Hugging Face account and an approved access request; the README lists a CUDA-compatible GPU as
  "recommended".
- LICENSE FACTS (code and weights are both "SAM Materials" under one license)
  - a + b. "SAM License / Last Updated: November 19, 2025" (https://raw.githubusercontent.com/facebookresearch/sam-audio/main/LICENSE,
    read 2026-11-10). Definition: "“SAM Materials” means, collectively, Documentation and the models, software and
    algorithms, including machine-learning model code, trained model weights, inference-enabling code, training-enabling
    code, fine-tuning enabling code, and other elements of the foregoing distributed by Meta". Grant: "You are granted
    a non-exclusive, worldwide, non-transferable and royalty-free limited license under Meta’s intellectual property or
    other rights owned by Meta embodied in the SAM Materials to use, reproduce, distribute, copy, create derivative
    works of, and make modifications to the SAM Materials." Redistribution: "If you distribute or make the SAM
    Materials, or any derivative works thereof, available to a third party, you may only do so under the terms of this
    Agreement and you shall provide a copy of this Agreement with any such SAM Materials." Field-of-use: "You agree not
    to use, or permit others to use, SAM Materials for any activities subject to the International Traffic in Arms
    Regulations (ITAR) or end uses prohibited by Trade Controls, including those related to military or warfare
    purposes, nuclear industries or applications, espionage, or the development or use of guns or illegal weapons."
    Also: "Your use of the SAM Materials will not involve or encourage others to reverse engineer, decompile or discover
    the underlying components of the SAM Materials." Outputs appear in the warranty disclaimer: "THE SAM MATERIALS AND
    ANY OUTPUT AND RESULTS THEREFROM ARE PROVIDED ON AN “AS IS” BASIS". Ownership: "with respect to any derivative
    works and modifications of the SAM Materials that are made by you, as between you and Meta, you are and will be
    the owner of such derivative works and modifications." Changes: "Meta may modify this Agreement from time to time
    ... All such changes will be effective immediately." The license text contains no sentence that names commercial
    use, either to allow or to forbid it (the words "commercial" and "non-commercial" do not appear in it).
  - c. Training data (paper): "our training data come from (1) a large-scale, medium-quality audio–video corpus
    (about ∼1M hours) and (2) a collection of small- to medium-scale high-quality audio datasets"; music: "We utilized
    internal high-quality music data with clear instrument stems ... This datasets contains 10,610 unique music
    compositions over a total of 536 hours. Each music composition consists of multiple instruments (e.g. drums, bass,
    guitars) and vocal tracks." and "We utilized internal data that has ∼20K hours of clean music". No dataset license
    is stated for the internal data.
- Author measurements: README table of "overall subjective evaluation scores": Instr(pro) 4.24 / 4.27 / 4.49 and Music
  4.11 / 3.87 / 4.22 for small / base / large. Paper: "text-based instrument separation significantly lags behind
  domain-specific methods like Demucs" (said of prior text-prompted systems, in the introduction).

## AudioSep ("Separate Anything You Describe")
- What: language-queried separation of general sounds: a query network (paper section III-A "QueryNet"; the Space ships
  a CLAP checkpoint `music_speech_audioset_epoch_15_esc_89.98.pt` and `models/CLAP/`) conditions a separation network
  (section III-B "SeparationNet").
  Paper: Liu et al., https://arxiv.org/abs/2308.05037 (v1 2023-08-09, v3 2024-12-01). Repository
  https://github.com/Audio-AGI/AudioSep (last commit 2024-11-26, head 944583f). Weights: "Download [model
  weights](https://huggingface.co/spaces/Audio-AGI/AudioSep/tree/main/checkpoint) at `checkpoint/`" (README); the
  Space holds `checkpoint/audiosep_base_4M_steps.ckpt` and `checkpoint/music_speech_audioset_epoch_15_esc_89.98.pt`
  (Space API, last modified 2023-10-15). A copy is at `nielsr/audiosep-demo` (`pytorch_model.bin`, created
  2023-10-15). Also hosted at Replicate `cjwbw/audiosep` (badge in README; hosted-apis lane).
- How a program calls it (README): Python only, from a clone of the repository:
  `from pipeline import build_audiosep, inference; model = build_audiosep(config_yaml='config/audiosep_base.yaml',
  checkpoint_path='checkpoint/audiosep_base_4M_steps.ckpt', device=device); inference(model, audio_file, text,
  output_file, device)`; or `AudioSep.from_pretrained("nielsr/audiosep-demo", ss_model=ss_model)`; "Use chunk-based
  inference to save memory: `inference(..., use_chunk=True)`". Device line in the README: `torch.device('cuda' if
  torch.cuda.is_available() else 'cpu')`. Install is by `conda env create -f environment.yml`. (Gap round 2, read
  2026-11-11 at head 944583f: `pipeline.py` has no function named `inference`; its separation function is
  `def separate_audio(model, audio_file, text, output_file, device='cuda', use_chunk=False):`. No PyPI package:
  `https://pypi.org/pypi/audiosep/json` returns HTTP 404.)
- Input: an audio file and a free-text query (e.g. "acoustic guitar"; the Space ships `examples/acoustic_guitar.wav`).
  "AudioSep processes the audio at 32 kHz sampling rate" (README); `config/audiosep_base.yaml`: `sampling_rate: 32000`.
  `pipeline.py` loads the input with `librosa.load(audio_file, sr=32000, mono=True)` and writes the result with
  `write(output_file, 32000, np.round(sep_segment * 32767).astype(np.int16))`: one mono 16-bit wav at 32 kHz. Only the
  target is written.
- Controls for a re-run: the text query; chunking.
- LICENSE FACTS
  - a. Code: MIT, "Copyright (c) Xubo Liu", "Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software ..." (https://raw.githubusercontent.com/Audio-AGI/AudioSep/main/LICENSE, read 2026-11-10).
  - b. Weights: the Hugging Face Space that hosts the checkpoint has card metadata `license: mit` (Space API
    `https://huggingface.co/api/spaces/Audio-AGI/AudioSep`, read 2026-11-10); the `nielsr/audiosep-demo` copy has card
    metadata `license: apache-2.0` and Hub API `gated: False`. No weights license sentence was found in the GitHub
    README. No access gate was met: the Space file list and the model repo were readable without an account.
  - c. Training data (paper section IV-A "Training datasets"): AudioSet, VGGSound, AudioCaps, Clotho v2, WavCaps.
    WavCaps dataset card: "Only academic uses are allowed for WavCaps dataset. By downloading audio clips through the
    links provided in the json files, you agree that you will use the audios for research purposes only." and "The
    models we provided are created under a UK data copyright exemption for non-commercial research."
    (https://huggingface.co/datasets/cvssp/WavCaps/raw/main/README.md, card license field `cc-by-4.0`, read
    2026-11-10). Terms of the other sets, read by the verifier on 2026-11-10:
    AudioSet: "The dataset is made available by Google Inc. under a Creative Commons Attribution 4.0 International (CC
    BY 4.0) license, while the ontology is available under a Creative Commons Attribution-ShareAlike 4.0 International
    (CC BY-SA 4.0) license." (https://research.google.com/audioset/download.html; the paper says its clips were
    downloaded from YouTube). VGGSound: "The VGG-Sound dataset is available to download for commercial/research
    purposes under a Creative Commons Attribution 4.0 International License. The copyright remains with the original
    owners of the video." (https://www.robots.ox.ac.uk/~vgg/data/vggsound/). AudioCaps: the README of
    https://github.com/cdjkim/audiocaps says "The code and the dataset are free to use for academic purposes only.",
    while the same repository's `LICENSE` file is MIT ("Copyright (c) 2019 AudioCaps authors"); the AudioSep paper
    describes AudioCaps clips as "sourced from AudioSet". Clotho: Zenodo record https://zenodo.org/records/4783391 ("Clotho dataset", 2021-05-26, license id
    `other-at`): the audio and metadata "are under the corresponding licences (mostly CreativeCommons with attribution)
    of Freesound [1] platform" and the captions "are under the Tampere University licence, described in the LICENCE
    file (mainly a non-commercial with attribution licence)". Which Clotho record AudioSep's "Clotho v2" came from was
    not checked.
- Author measurements (v3 PDF abstract, https://arxiv.org/pdf/2308.05037v3; the abstract on the arXiv listing page
  has no numbers): "Signal-to-Distortion Ratio Improvement (SDRi) of 7.74 dB across 527 sound classes of the
  AudioSet; ... 10.51 dB on the MUSIC dataset" (MUSIC: "536 video recordings of people playing a musical instrument
  from 11 instrument classes such as accordion, acoustic guitar, and cello").

## Banquet (`query-bandit`, query-by-example separation)
- What: one band-split encoder and one decoder; the target stem is chosen by a query audio clip embedded with a PaSST
  instrument-recognition model. Paper: Watcharasupat and Lerch, "A Stem-Agnostic Single-Decoder System for Music
  Source Separation Beyond Four Stems", ISMIR 2024, https://arxiv.org/abs/2406.18747 (v2 2024-08-26). Repository
  https://github.com/kwatcharasupat/query-bandit (last commit 2025-07-29, head 79ed5bb). Weights: Zenodo
  https://zenodo.org/records/13694558 ("Model Weights for ...", published 2024-09-05), 14 checkpoints of 552 to 768 MB
  (e.g. `ev-pre-aug.ckpt` 645,470,187 bytes, `vdbgp-pre-aug.ckpt`, `bandit-vdbo.ckpt`); README: "If you are not sure,
  use `ev-pre-aug.ckpt`."
- Guitar: the paper's `q:vdbgp` setup extends the queries "to also include acoustic guitar, clean electric guitar,
  distorted electric guitar, grand piano, and electric piano"; abstract: "The query-based setup allows for the
  separation of narrow instrument classes such as clean acoustic guitars".
- How a program calls it (README): CLI from a clone, `export CONFIG_ROOT="./config"; python train.py inference_byoq
  --ckpt_path=CKPT --input_path=MIX.wav --output_path=OUT/guitar.wav --query_path=QUERY.wav --batch_size=12
  --use_cuda=true`. "Batch size of 12 _usually_ fits on a RTX 4090." The README does not say whether
  `--use_cuda=false` runs on CPU; the code does have the branch: `inference_byoq(..., use_cuda: bool = True)` ends in
  `if use_cuda: system.cuda()` / `else: system.cpu()` (`train.py`, head 79ed5bb, read by the verifier). Not run here.
- Input: the mixture (MoisesDB audio is "stereo format at 44.1 kHz") and a query clip: "each query signal is downmixed
  to mono and downsampled to 32 kHz before being fed to PaSST" (paper section 3). In `inference_byoq` both files are
  loaded with torchaudio and resampled to 44.1 kHz (`assert model_fs == 44100`), and the query is cut or tiled to 10 s
  (`assert query_length_seconds == 10.0, "Only 10s queries are supported at the moment."`; "Query is longer than ...
  Truncating." / "Query is shorter than ... Tiling."). Output: one stem estimate per call, "of the “same” stem type as
  the query signal" (paper section 3), resampled back to the mixture's rate and written with `ta.save(output_path,
  estimate, fsm)` to `--output_path`.
- Query and output in the code (gap round 2, read 2026-11-11 from a clone at head 79ed5bb; not run, see `trials.md`):
  `core/models/e2e/querier/passt.py` averages the query's channels (`x = torch.mean(qaudio, dim=1)`), resamples it to
  32 kHz, cuts PaSST's mel spectrogram to 998 frames and uses the embedding of
  `get_basic_model(mode="embed_only", arch="openmic")`, whose weights hear21passt 0.0.26 downloads from
  `https://github.com/kkoutini/PaSST/releases/download/v0.0.5/openmic-passt-s-f128-10sec-p16-s10-ap.85.pt`
  (341,546,630 bytes, HTTP HEAD 2026-11-11). The default test config `config/data/moisesdb-test.yml` sets
  `chunk_size_seconds: 6.0`, `hop_size_seconds: 0.5`, `batch_size: 12` and `fs: 44100` under `inference_kwargs`, and
  `chunked_inference` (`core/models/ebase.py`) overlap-adds the chunk estimates with a Hann window and trims the result
  to the mixture's length (`output[None, :, 0, 2*overlap: n_samples + 2*overlap, 0]`). hear21passt: PyPI 0.0.26,
  license field `Apache-2.0`, requires `timm >=0.4.12`, `torchaudio >=0.7.0` (PyPI JSON, 2026-11-11).
- Controls a human-in-the-loop re-run could use: the query clip itself (for example a few seconds of the user's own
  guitar, or of the guitar part isolated elsewhere in the song).
- LICENSE FACTS
  - a. Code: MIT, "Copyright (c) 2024 Karn Watcharasupat" (https://raw.githubusercontent.com/kwatcharasupat/query-bandit/main/LICENSE,
    read 2026-11-10). The README opens with a request: "If you've **benefited commercially from this work**, which
    we've poured significant effort into and released under permissive licenses, we hope you've found it valuable!"
    and "we strongly urge commercial entities that have gained from this software to consider making voluntary
    contributions to music-related non-profit organizations of your choice." The weights (b. below) are not under a
    permissive license: their Zenodo record says `cc-by-nc-sa-4.0`.
  - b. Weights: Zenodo record 13694558 license id `cc-by-nc-sa-4.0`, `access_right: open` (no account needed to
    download) (Zenodo API, read 2026-11-10).
  - c. Training data: "This work utilizes the MoisesDB dataset [25], which consists of 240 songs from 47 artists, in
    stereo format at 44.1 kHz." (paper section 4). MoisesDB clause: see the datasets section (CC BY-NC-SA 4.0). The
    query encoder is "a PaSST model [27] trained on the OpenMIC-2018 dataset"; OpenMIC-2018's Zenodo record
    https://zenodo.org/records/1432913 (2018-09-23) has license id `cc-by-4.0` (Zenodo API, read by the verifier on
    2026-11-10). The paper itself (not the weights) is licensed on its arXiv page through a "view license" link to
    http://creativecommons.org/licenses/by-nc-sa/4.0/ (https://arxiv.org/abs/2406.18747, read 2026-11-10).
- Author measurements: abstract (v1 wording on the README): "On the MoisesDB dataset, Banquet, at only 24.9 M
  trainable parameters, approached the performance level of the significantly more complex 6-stem Hybrid Transformer
  Demucs on VDBO stems and outperformed it on guitar and piano." Conclusion (v2): "state-of-the-art for guitar and
  piano, and at least 7.4 dB SNR for vocals".

## MuS3D (Music Source Separation via Stem Discovery, Aalto University)
- What: blind separation without a stem list. "A stem embedding generator (SEG), a Transformer trained with
  conditional flow matching, runs recursively: at each iteration it generates a query embedding (PaSST, reduced to 128
  dimensions with PCA) ... Each query is passed to a query-conditioned separator that extracts that source: a DiT
  fine-tuned from SAM-Audio large, or a BS-Locoformer." (README). Paper: Kallinen, Moliner, Juvela, Välimäki,
  https://arxiv.org/abs/2609.30912 (submitted 2026-09-25). Repository https://github.com/REMUS-Aalto/Mus3D (last
  commit 2026-10-14, head 308a785). Checkpoints: https://huggingface.co/remus-aalto/MuS3D (created 2026-10-14, not
  gated, `usedStorage` 19,244,794,860 bytes): `SEG_mixemb`, `SEG_resemb`, `DiT` ("based on SAM-Audio (large, ~2.2B
  parameters) ... fine-tuned from the public SAM-Audio weights"), `BS-Locoformer_query`, `BS-Locoformer_static` ("a
  static 6-stem (VDBGPO) separator" = vocals, drums, bass, guitar, piano, other), and classifiers.
- How a program calls it (README): `bash inference.sh song.wav --out output/inference` or `bash inference.sh song.wav
  --separator bslocoformer --level track`; options `--separator {dit,bslocoformer}`, `--level {stem,track}`
  ("instrument groups or individual instruments"), `--seg_steps`, `--sep_steps`, `--max_steps`, `--seed`, `--device`.
  "A 10 s segment (centred by default, or `--start <s>`) is decomposed recursively". Requires "Python >= 3.13 and
  [uv]". "The DiT needs about 10 GB of free memory; use `CUDA_VISIBLE_DEVICES=` to run on CPU if the GPU is busy."
  "The DiT separator is mono (the DAC-VAE has no stereo mode)."
- Output: "`mixture.wav`, one `<name>.wav` per discovered source (`<name>_2.wav` for repeats), and `trace.txt` with
  the extraction order and each step's stop cosine." Names come from the stem classifier (MoisesDB taxonomy).
- Controls for a re-run: separator choice, stem vs track level, segment start, number of steps, seed.
- LICENSE FACTS (sources conflict on the DiT weights; both quoted)
  - a. Code: `LICENSE` is MIT, "Copyright (c) 2026 V. Valtteri Kallinen, Eloi Moliner, Lauri Juvela, Vesa Välimäki
    (Aalto University)"; `LICENSE-APACHE` is Apache 2.0 (https://raw.githubusercontent.com/REMUS-Aalto/Mus3D/main/LICENSE
    and `.../LICENSE-APACHE`, read 2026-11-10). README "License": "The code is released under the MIT License
    ([LICENSE](LICENSE)), except the DiT separator in `src/query_conditioned_dit/` and its checkpoints, which derive from
    SAM-Audio and are distributed under the SAM License
    ([src/query_conditioned_dit/LICENSE](src/query_conditioned_dit/LICENSE)). Using them means accepting that license,
    including acknowledging the SAM Materials in publications. The BS-Locoformer code ... derives from tf-locoformer
    (Apache-2.0, [LICENSE-APACHE](LICENSE-APACHE)) and spectral_feature_compression (MIT)"
    (https://raw.githubusercontent.com/REMUS-Aalto/Mus3D/main/README.md, read 2026-11-10). The file
    https://raw.githubusercontent.com/REMUS-Aalto/Mus3D/main/src/query_conditioned_dit/LICENSE is byte-identical to
    SAM Audio's LICENSE ("SAM License / Last Updated: November 19, 2025"; `cmp` by the verifier, 2026-11-10).
  - Codec used by the DiT: `src/query_conditioned_dit/codec.py` loads "`facebook/dacvae-watermarked` -- the same codec
    SAM-Audio uses. 48 kHz, mono, hop 1920 -> 25 latent frames/s, latent dim 128." That Hub repo is not gated and its
    card metadata says `license: apache-2.0`, while its card text says "This project is licensed under the SAM License -
    see the [LICENSE](LICENSE) file for details." and, under "Watermarking": "The DAC-VAE decoder has been integrated
    with [Audioseal](https://github.com/facebookresearch/audioseal) to ensure all audios generated contain watermarks
    that are verifiable independently." (https://huggingface.co/facebook/dacvae-watermarked/raw/main/README.md and Hub
    API, read 2026-11-10). Whether SAM Audio's own checkpoints use this watermarked decoder was not confirmed from SAM
    Audio's files (its `sam_audio/model/codec.py` builds `dacvae.DACVAE(...)` from the gated checkpoint config):
    UNVERIFIED.
  - b. Weights: Hugging Face card: "The model weights are released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)."
    with metadata `license: cc-by-4.0` (https://huggingface.co/remus-aalto/MuS3D/raw/main/README.md, read
    2026-11-10). The GitHub README sentence above puts the DiT checkpoints under the SAM License.
  - c. Training data (README "Data"): "Training uses MoisesDB (with the [Banquet splits]), supplemented with 125 songs
    from MedleyDB and 10 from AlbumDB, organized to match the MoisesDB taxonomy." MoisesDB: CC BY-NC-SA 4.0 (datasets
    section); MedleyDB's terms are cited in the MUSDB18 record as "Creative Commons (BY-NC-SA 4.0)"; AlbumDB terms not
    read (UNVERIFIED). The DiT also inherits SAM Audio's pre-training (see that section).
- Author measurements: not read (the paper tables are reproduced by `evaluation/reproduce_tables.py`; the paper PDF
  was not opened). UNVERIFIED.

## Demucs outside Python: C++, ONNX, Rust, and in-browser builds
All of these run Meta's Demucs weights (v4, and v3 `hdemucs_mmi` in demucs.cpp) or conversions of them. The weights' own license situation is in the
Demucs section; each project's statements about weights are quoted here.

### demucs.cpp (Sevag H.)
- "C++17 library that implements inference for the [Demucs v4 hybrid transformer] and [Demucs v3 hybrid] models";
  "It uses only the standard library (C++17) and the header-only library [Eigen] ... It was designed for low-memory
  environments by sacrificing the speed of the Torch implementation." Weights for "`hdemucs_mmi`, `htdemucs`,
  `htdemucs_6s`, and `htdemucs_ft`" are converted to ggml files (`python ./scripts/convert-pth-to-ggml.py
  ./ggml-demucs`, flag `--six-source` for the 6-stem model) or downloaded pre-converted from
  https://huggingface.co/datasets/Retrobear/demucs.cpp. CLI programs `demucs.cpp.main`, `demucs_ft.cpp.main`,
  `demucs_mt.cpp.main` (multi-threaded), `demucs_v3.cpp.main`; build with CMake + OpenBLAS / OpenMP. "Demixing quality is
  practically identical to PyTorch as shown in the [SDR scores doc]." Repository https://github.com/sevagh/demucs.cpp
  (last commit 2026-11-06, head 4edae49). Listed ggml sizes: `ggml-model-htdemucs-6s-f16.bin` 53M,
  `ggml-model-hdemucs_mmi-v3-f16.bin` 160M (README).
- License: MIT, "Copyright (c) 2023 Sevag H" (https://raw.githubusercontent.com/sevagh/demucs.cpp/main/LICENSE, read
  2026-11-10). RUNNABLE here (CPU, compile with CMake).

### free-music-demixer (Sevag H., in-browser WASM)
- README (2026-11-06 head c8581c4): "An archived snapshot of an early demo of client-side music demixing (music source
  separation) in the browser, using the Demucs v4 hybrid transformer model compiled to WebAssembly. It is provided
  as-is and is no longer maintained." "Model weights are not included. The demo loads ONNX Runtime model files (for
  example `htdemucs.ort.gz`) from a local `web/models/` folder, which you provide yourself." "the weights of Demucs v4
  `htdemucs` and `htdemucs_6s` are 81 MB and 53 MB respectively, stored as float16." Timings in the README:
  "'Georgia Wonder - Siren' (takes ~41 minutes)" and "~9 minutes with 8 workers" (browser, machine not stated).
- License: "While the WASM modules and JavaScript in this repo are licensed under MIT, the AI model weights and other
  website assets are proprietary and not covered by the MIT license." (https://raw.githubusercontent.com/sevagh/free-music-demixer/main/README.md,
  read 2026-11-10). `LICENSE`: MIT, "Copyright (c) 2023 Sevag H".

### demucs.onnx (Sevag H.)
- "ONNX inference for the [Demucs v4 hybrid transformer] model"; the STFT / iSTFT are moved outside the network so it
  exports to ONNX, and C++ code runs it with ONNX Runtime; "you can also leverage the different ONNX execution
  providers e.g. CUDA, GPUs, WebGPU, WebNN." Repository https://github.com/sevagh/demucs.onnx (last commit 2026-02-08).
  License MIT, "Copyright (c) 2024 Sevag H" (raw LICENSE, read 2026-11-10).

### demucs-onnx (StemSplit, Python + onnxruntime-web)
- "Run and export HT-Demucs / Demucs music source separation as ONNX — Python, browser, iOS, and Android. Pure numpy +
  onnxruntime ..." PyPI `demucs-onnx` 0.3.4 uploaded 2026-05-22 (`requires_python >=3.11`); repository
  https://github.com/StemSplit/demucs-onnx (last commit 2026-05-22). CLI: `demucs-onnx separate song.mp3 stems/
  --model htdemucs_6s` ("6-stem mode with guitar + piano"), `--stem vocals`, `--providers cuda|coreml`; Python:
  `from demucs_onnx import separate, separate_stem; stems = separate("song.mp3")` (README). Pre-built ONNX repos on
  Hugging Face under `StemSplitio/` (11 repos listed on 2026-11-10, including `StemSplitio/htdemucs-6s-onnx`, all with
  card tag `license:mit`). StemSplit also runs a hosted service (stemsplit.io; hosted-apis lane).
- License: code MIT, "Copyright (c) 2026 StemSplit" (raw LICENSE, read 2026-11-10). README: "This package is
  **MIT-licensed**, matching the original HT-Demucs." and, of the ONNX repos, "All MIT-licensed and parity-verified to
  < 1e-3 vs PyTorch fp32." These MIT tags on converted weights are the converter's statement; the Demucs maintainer's
  own statement on the weights is quoted in the Demucs section ("The license of the weights is not clear").

### demucs-rs (Rust, native CLI + WebGPU in the browser + DAW plugin)
- "A native Rust implementation of [HTDemucs v4] ... using GPU-accelerated inference via [Burn]"; "Runs as a **native
  CLI** (Metal on macOS, Vulkan on Linux/Windows), entirely **in the browser** via WebAssembly + WebGPU, or as a **DAW
  plugin** (VST3/CLAP, macOS)". Browser demo: https://nikhilunni.github.io/demucs-rs/ (not opened). Models:
  `htdemucs` (84 MB), `htdemucs_6s` ("drums, bass, other, vocals, guitar, piano", 84 MB), `htdemucs_ft` (333 MB),
  "downloaded automatically from Hugging Face on first use". CLI: `demucs [OPTIONS] [INPUT]` with input "WAV, AIFF,
  FLAC, MP3, OGG, M4A/AAC — stereo or mono, any sample rate", `-m, --model <MODEL>` ("htdemucs, htdemucs_6s,
  htdemucs_ft"), `-s, --stems <STEMS>` ("Stems to extract, comma-separated"), `-o, --output <OUTPUT> [default:
  ./stems/]`, `--mcp` ("Run as an MCP server over stdio"). MCP tools (README "Use as an MCP server"): "`separate_stems` —
  `{ input, model?, stems?, output_dir? }`. `input` and `output_dir` must be absolute paths" and it "Returns a text
  summary plus `structuredContent` with the written stem paths"; "`list_models` — model metadata plus a `cached`
  flag". "The WebAssembly build is significantly slower than the native CLI due to WebGPU overhead and WASM
  constraints." Repository https://github.com/nikhilunni/demucs-rs (last commit 2026-10-19, "Add MCP server support to
  demucs CLI (#12)"). README prerequisites (section "Development Setup"): "A GPU with Metal (macOS), Vulkan
  (Linux/Windows), or WebGPU (browser) support"; no CPU backend is named in the README.
- License: Apache-2.0 ("Licensed under the [Apache License, Version 2.0](LICENSE)", README; LICENSE file is the
  Apache 2.0 text), read 2026-11-10.

## BS-RoFormer and Mel-Band RoFormer: code packages and community checkpoints
- Architectures: BS-RoFormer (Lu, Wang, Kong, Hung, https://arxiv.org/abs/2309.02612; abstract: "The BS-RoFormer
  system trained on MUSDB18HQ and 500 extra songs ranked the first place in the MSS track of Sound Demixing Challenge
  (SDX23). Benchmarking a smaller version of BS-RoFormer on MUSDB18HQ, we achieve state-of-the-art result without extra
  training data, with 9.80 dB of average SDR.") and Mel-Band
  RoFormer (Wang, Lu, Won, https://arxiv.org/abs/2310.01809). The paper authors' weights are not released in any
  source read here; the public checkpoints are community-trained. MSST's README links "Bandsplit/Mel Roformer official"
  to https://github.com/asriverwang/BS-RoFormer (last commit 2026-04-06): its README describes PyTorch code whose
  `separator.py` takes a required `--model_ckpt_path`, names no weights download, and its tree has no LICENSE file
  (`https://raw.githubusercontent.com/asriverwang/BS-RoFormer/main/LICENSE` returned 404 on 2026-11-10).
- lucidrains/BS-RoFormer: "Implementation of Band Split Roformer, SOTA Attention network for music source separation
  out of ByteDance AI Labs." Architecture only. PyPI `BS-RoFormer` 1.4.1 uploaded 2026-11-04; repository
  https://github.com/lucidrains/BS-RoFormer (last commit 2026-11-04). License MIT, "Copyright (c) 2023 Phil Wang"
  (raw LICENSE, read 2026-11-10).
- openmirlab/bs-roformer-infer and openmirlab/melband-roformer-infer: inference-only packages with a model registry
  and SHA-256-checked downloads. Install `pip install "bs-roformer-infer @ git+https://github.com/openmirlab/bs-roformer-infer.git"`
  (PyPI 0.1.5, uploaded 2026-07-12; both READMEs: "OpenMIRLab no longer publishes new versions to PyPI. Any existing
  PyPI releases are historical snapshots."); CLI `bs-roformer-infer --input_folder songs --device cuda`; "`device` accepts
  `None` (legacy default), `auto`, `cpu`, `cuda`, or `cuda:N`." Default model of bs-roformer-infer: BS-RoFormer-SW,
  6 stems (vocals, drums, bass, guitar, piano, other), "~700 MB"; default of melband-roformer-infer: "MelBand Roformer
  Kim" vocals model "~913 MB". Licenses MIT, "Copyright (c) 2025 OpenMIRLab" (raw LICENSE files, read 2026-11-10).
  The bs-roformer-infer README records host churn: "the original `jarredou` Hugging Face account behind the default
  BS-RoFormer-SW checkpoint was deleted (discovered 2026-06), and 9 of the other 10 registry models' fallback URLs (the
  dead upstream `TRvlvr/model_repo` GitHub repo) were found 404ing in a 2026-07-12 audit." (On 2026-11-10 two
  `TRvlvr/model_repo` release URLs, `.../all_public_uvr_models/model_bs_roformer_ep_317_sdr_12.9755.ckpt` (639,331,213
  bytes) and `.../all_public_uvr_models/htdemucs_ft.yaml` (149 bytes), answered 200 to `curl -I -L` here, re-checked
  by the verifier.)
- BSRoformer.cpp (https://github.com/chenmozhijin/BSRoformer.cpp, branch `master`, last commit 2026-06-16): "pure
  C++ inference engine for the **BS Roformer** and **Mel-Band-Roformer** audio source separation models, built on the
  [GGML](https://github.com/ggerganov/ggml) tensor library"; "Supports CPU/GPU (CUDA, Vulkan) acceleration"; models in
  GGUF ("Download pre-converted model files from [BSRoformer-GGUF](https://huggingface.co/chenmozhijin/BSRoformer-GGUF)"
  or convert with `scripts/convert_to_gguf.py`); CLI `./bs_roformer-cli <model.gguf> <input.wav> <output.wav>
  [options]` (README, read from a `git clone --depth 1` on 2026-11-10). License: MIT, "Copyright (c) 2026 沉默の金 ..."
  (LICENSE, same clone; e-mail address omitted here). The mirror card `FractalSurfer/BS-RoFormer-SW-6stem` ships a
  q8_0 GGUF of BS-RoFormer-SW for it and says "The GGML/`BSRoformer.cpp` CLI writes them as `stem_0 … stem_5`" in
  the order "**`bass, drums, other, vocals, guitar, piano`**". Not run here.
- License fields on the Hugging Face cards that host the common community checkpoints (Hub API, read 2026-11-10;
  "none" = no `license:` tag on the card):

| Host | Checkpoints | Card license tag |
|---|---|---|
| `KimberleyJSN/melbandroformer` | Mel-Band RoFormer vocals ("Kim") | `mit` |
| `becruily/mel-band-roformer-guitar`, `-vocals`, `-instrumental`, `-karaoke`, `-invert-clean`, `bs-roformer-karaoke` | guitar, vocals, instrumental, karaoke | none |
| `becruily/mel-band-roformer-deux`, `becruily/bs-roformer-delimit` | | `cc-by-nc-4.0` |
| `pcunwa/*` (unwa: Kim FT, Inst, InstVoc Duality, big, Revive, Resurrection, HyperACE, Leap, ...) | vocals / instrumental | none (13 repos) |
| `anvuew/dereverb_mel_band_roformer`, `dereverb_bs_roformer`, `karaoke_bs_roformer`, `BS-RoFormer`, ... | de-reverb, karaoke | `gpl-3.0` |
| `Sucial/Aspiration_Mel_Band_Roformer`, `Dereverb-Echo_Mel_Band_Roformer`, `Chorus_Male_Female_BS_Roformer` | | `cc-by-nc-sa-4.0` |
| `GaboxR67/MelBandRoformers` (Gabox vocals / instrumental series) | | none |
| `Politrees/UVR_resources` (mirror of UVR / community files) | | `mit` |
| `enerjazzer/BS-ROFO-SW-Fixed` (current host of BS-RoFormer-SW) | 6-stem incl. guitar | `unknown` |
| Other copies of BS-RoFormer-SW: `FractalSurfer/BS-RoFormer-SW-6stem` (mirror + q8_0 GGUF), `Noshibest/BS-Roformer-SW` (created 2026-11-10), `lumabeat/bs-roformer-sw` (float16 safetensors for MLX), `Acapellas/bs-roformer-sw-6stem-FP16-FP32-onnx`, `elicwhite/bs-roformer-sw-6stem-onnx` | the same 6-stem checkpoint or conversions of it | `unknown`, `mit`, `other` (`license_name: unknown`), `mit`, `mit` respectively |
| `archimickey/SubRoformer` (paper authors' weights, linked by MSST) | | none |

- Training data of these community checkpoints: not stated on the cards read (UNVERIFIED per checkpoint).
- The card tags of copies of one checkpoint differ from each other (row above). The texts of three of those cards
  say no license was stated for the weights: `FractalSurfer/BS-RoFormer-SW-6stem`: "Upstream declares **no license**
  (`license: unknown`). This mirror grants no additional rights"; `lumabeat/bs-roformer-sw`: "**Unknown.** The
  original trainer is unknown and no license was stated with the checkpoint"; `elicwhite/bs-roformer-sw-6stem-onnx`
  (tag `mit`): "The pretrained weights themselves were [rehosted by jarredou][1] without a stated license." (cards
  read through `https://huggingface.co/<repo>/raw/main/README.md` and the Hub API, 2026-11-10).
- SubRoformer's code repository https://github.com/ArchiMickey/SubRoformer (last commit 2026-11-06) has an MIT
  `LICENSE` ("Copyright (c) 2026 ArchiMickey"), and its README says "The models are trained on **100 MUSDB18-HQ
  songs** and **500 additional internal songs**." The weights repo `archimickey/SubRoformer` has no license tag and
  no README (`/raw/main/README.md` returned 404 on 2026-11-10).

## Models that output a guitar stem (as of 2026-11-10)
| Model | Stems | Weights host and stated license | Training data as stated |
|---|---|---|---|
| Demucs `htdemucs_6s` | drums, bass, other, vocals, guitar, piano | Meta / `adefossez/HTDemucs-6s`; maintainer: "The license of the weights is not clear ... likely means CC-NC-BY" (Demucs section) | "trained only on Meta internal dataset" (Demucs README); the guitar fine-tune card below says "trained on MUSDB18-HQ" |
| BS-RoFormer-SW ("BS Roformer SW by jarredou") | vocals, drums, bass, guitar, piano, other (ONNX card stem order "0: bass 1: drums 2: other 3: vocals 4: guitar 5: piano") | `enerjazzer/BS-ROFO-SW-Fixed` card `license: unknown`, text "Edited version of that checkpoint to allow its use with UVR and MSST."; original `jarredou/BS-ROFO-SW-Fixed` returned HTTP 401 on 2026-11-10 (Hub API body `{"error":"Invalid username or password."}`; the user page https://huggingface.co/jarredou returned 404); mirrored in audio-separator's `model-configs` release (699,412,152 bytes) and in the other copies listed in the RoFormer section, with differing card tags | not stated. bs-roformer-infer: "we have not verified who trained the weights ... Do not treat this package's MIT code license as a grant for commercial use of this checkpoint." ONNX card (`elicwhite/bs-roformer-sw-6stem-onnx`, card tag `mit`): "The pretrained weights themselves were [rehosted by jarredou][1] without a stated license. The original rehost owner has confirmed they were not involved in training and have no provenance information. Use accordingly." |
| becruily Mel-Band RoFormer guitar | `instruments: [Guitar, Other]` (`config_guitar_becruily.yaml`, `sample_rate: 44100`, `num_stems: 1`) | `becruily/mel-band-roformer-guitar` (created 2025-05-20, `becruily_guitar.ckpt` 45,142,183 bytes); no license tag; `README.md` returns 404 (no model card) | not stated |
| `adityalakhani/htdemucs-6s-guitar-ft` | htdemucs_6s with guitar fine-tuning ("GUITAR_STEM_INDEX = 4") | card `license: apache-2.0`; "This model is released under the **Apache 2.0** license. The base `htdemucs_6s` weights (Meta AI) are released under MIT. MoisesDB data is used in compliance with Moises.ai's research licensing terms; raw audio data is not redistributed." | "MoisesDB v0.1 ... Split: 216 songs training / 24 songs validation"; card evaluation table: guitar SDR 8.73 dB for this model vs 8.42 for stock `htdemucs_6s` on its "24-track held-out split of **MoisesDB v0.1**" (author's numbers; the card's `model-index` names the metric "Guitar SDR (dB)", and the Hub API's parsed `model-index` marks it `"verified": false`) |
| `barvarvara/demucs-guitar-lora` | LoRA adapter on `htdemucs` for acoustic guitar (card, in Russian: "для извлечения акустической гитары методом LoRA") | card `license: mit` (created 2026-05-23) | not stated |
| Banquet (`vdbgp-*` checkpoints) | query-selected stem; queries include "acoustic guitar, clean electric guitar, distorted electric guitar" | Zenodo 13694558 `cc-by-nc-sa-4.0` | MoisesDB (CC BY-NC-SA 4.0) |
| MuS3D `BS-Locoformer_static` and the query models | static "6-stem (VDBGPO)"; query models name stems from the MoisesDB taxonomy | HF card CC BY 4.0; GitHub README puts the DiT under the SAM License | MoisesDB + 125 MedleyDB + 10 AlbumDB songs |
| SAM Audio | any text-described target, e.g. "guitar" | SAM License (gated) | internal multitrack music (10,610 compositions, 536 hours) and more |
| AudioSep | any text-described target | Space card `mit` | AudioSet, VGGSound, AudioCaps, Clotho v2, WavCaps |
| ZFTurbo open-source 53-stem model (MSST release tag `v1.0.21`) | 53 instrument stems; the MVSEP page's SDR table has guitar, acoustic-guitar, electric-guitar and dobro rows for the open-source model | release https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/tag/v1.0.21 (git tag `v1.0.21` = commit ea7eb9c per `git ls-remote`). Asset `mvsep_mega_model_bs_roformer_53_stems_v1.ckpt`: named by the cards `lumabeat/mvsep-mega53-guitar` and `Audante/mvsep-mega53-bs-roformer-int8`, and `curl -I -L` of `.../releases/download/v1.0.21/mvsep_mega_model_bs_roformer_53_stems_v1.ckpt` returned 200, 1,368,919,887 bytes, Last-Modified 2026-04-20 (verifier, 2026-11-10). The release page itself (full asset list, any license note) returns 403 here: UNVERIFIED. No weights-specific license text was found; the repository LICENSE is MIT. Third-party statements: `lumabeat/mvsep-mega53-guitar` (guitar head only, float16, card tag `mit`): "The weights are published in an MIT-licensed repository (Copyright (c) 2024 Roman Solovyev (ZFTurbo)), with no separate statement for them; this repository follows that."; `Audante/mvsep-mega53-bs-roformer-int8` (card tag `mit`): "**This is not an official release.**" | not stated on the MVSEP page or the two cards read |
| Hosted only (not open weights): Moises / Music.AI lead and rhythm guitar, LALAL.AI, MVSEP guitar models incl. MVSEP's newer "Mega 53-stem Model", AudioShake | | hosted-apis lane | |

- MVSEP's page for its hosted "Mega 53-stem Model" (https://mvsep.com/algorithms/135; page HTML re-read directly by
  the verifier on 2026-11-10) says in "Note 4" "This model differs from our previously published open-source model and
  is an improved version of it", links "published open-source model" to the `v1.0.21` release above, and its comparison
  table lists "Open-source model SDR" / "New model SDR" for guitar 2,5661 / 2,6164, acoustic-guitar 5,0024 / 5,0797,
  electric-guitar 8,1543 / 8,1856, dobro 7,6562 / 8,2290 (decimal commas as on the page; evaluation set not named).
  "Note 1" says "The model outputs only those instruments that were detected in the musical composition. Instruments
  that are not present in the track are not included in the output."; "Note 2" says "Individual models for each
  instrument generally produce better results than this multimodel." (MVSEP's own statement); "Note 3" says results
  are saved with "FLAC is used instead of WAV".
- No open model found that separates lead from rhythm guitar or acoustic from electric guitar inside one guitar stem
  (searches on 2026-11-10: Hugging Face model search "guitar", "BS-Roformer-SW"; web searches for lead / rhythm guitar
  separation 2025-2026; the verifier repeated a web search and the Hub searches "guitar", "roformer", "demucs",
  "separation", "stem" sorted by creation date and found none either). The hosted split exists at Moises: its page
  https://moises.ai/blog/moises-news/new-guitar-separation-models/ (title "New Guitar Isolation: Lead, Rhythm,
  Electric, and Acoustic Guitars", dated "Wed, Apr 24, 2024", read 2026-11-10) says "Now, you can separate Lead Guitar
  from Rhythm Guitar, as well as Acoustic from Electric.", "Either of these options splits guitars into 2 tracks,
  making a total of 6 tracks, along with Vocals, Bass, Drums, and Others." and "Our new separation capabilities are
  available for both Premium and Pro users". Prices and terms: hosted-apis / apps-survey lanes.

## SCNet (Sparse Compression Network)
- Paper: Tong et al., "SCNet: Sparse Compression Network for Music Source Separation", ICASSP 2024,
  https://arxiv.org/abs/2401.13276. Code: https://github.com/starrytong/SCNet (last commit 2025-09-08). Four stems.
- Call: `python -m scnet.inference --input_dir IN --output_dir OUT --checkpoint_path CKPT.th` (README). Checkpoint:
  "The model checkpoint was trained on the MUSDB dataset. You can download it from the following link: [Download Model
  Checkpoint](https://drive.google.com/file/d/1CdEIIqsoRfHn1SJ7rccPfyYioW3BlXcW/view?usp=sharing)" (README). More
  SCNet checkpoints (Small, Large, XL, XL IHF, Masked, Tran) are in MSST's list, marked "trained only on MUSDB18HQ";
  four are in UVR's list (`SCnet: 4-stems ...`), loadable through audio-separator.
- License: code MIT, "Copyright (c) 2024 starrytong" (raw LICENSE, read 2026-11-10). No separate weights license
  sentence in the README. Training data: MUSDB / MUSDB18-HQ ("educational purposes only", datasets section).
- Author numbers (MSST `docs/pretrained_models.md`, table "Multi-stem models (MUSDB18HQ)", MUSDB test avg SDR): row
  "SCNet Large (by [starrytong](https://github.com/starrytong))": "MUSDB test avg: 9.70"; row "SCNet XL IHF": "MUSDB
  test avg: 10.08".

## MDX23C / TFC-TDF-Net v3 and the MVSEP-MDX23 ensemble
- KUIELab's SDX 2023 code (TFC-TDF-Net v3): https://github.com/kuielab/sdx23 (branch `mdx_AB`, last commit 2023-05-17),
  MIT, "Copyright (c) 2023 IELab@ Korea University". MSST's README: "MDX23C based on [KUIELab TFC TDF v3
  architecture]". Checkpoints: MSST list (`MDX23C | vocals / other`, MUSDB18HQ-only 4-stem `MDX23C`), UVR list
  (`MDX23C-8KFFT-InstVoc_HQ.ckpt`, VIP `MDX23C-8KFFT-InstVoc_HQ_2.ckpt`), drum-kit model by aufr33 and jarredou.
- ZFTurbo's MVSEP-MDX23 ensemble: "Model for [Sound demixing challenge 2023: Music Demixing Track - MDX'23]. Model
  perform separation of music into 4 stems "bass", "drums", "vocals", "other". Model won 3rd place in challenge
  (Leaderboard C)." "Model based on [Demucs4], [MDX] neural net architectures and some MDX weights from [Ultimate
  Vocal Remover] project". Call: `python inference.py --input_audio mixture1.wav --output_folder ./results/ [--cpu]`
  ("`--cpu` - choose CPU instead of GPU for processing. Can be very slow."). Repository
  https://github.com/ZFTurbo/MVSEP-MDX23-music-separation-model (last commit 2025-04-05). No LICENSE file at the top
  of the tree (tree at head 765bd31: `.gitignore`, `README.md`, `demucs3`, `demucs4`, `gui.py`, `images`,
  `inference.py`, `models`, `requirements.txt`, `web-ui.py`; `.../main/LICENSE` returned 404 on 2026-11-10) and no
  license sentence in the README (read 2026-11-10).

## VR Architecture (`tsurumeso/vocal-remover`)
- Vocal remover code by tsurumeso; UVR's "VR Arch" models build on it ("[tsurumeso] - Developed the original VR
  Architecture code", UVR README). Repository https://github.com/tsurumeso/vocal-remover (branch `develop`, last
  commit 2026-09-10). License MIT, "Copyright (c) 2019 tsurumeso" (raw LICENSE, read 2026-11-10). Outputs vocal /
  instrumental (and, in UVR's VR list, de-echo, de-reverb, denoise, woodwinds models). No guitar model. Run through
  audio-separator (`.pth` files).

## librosa HPSS (harmonic / percussive split, no learned model)
- Functions (librosa main branch, head 6c9fe7c, 2026-11-10): `librosa.decompose.hpss(S, *, kernel_size=31,
  power=2.0, mask=False, margin=1.0)`: "Median-filtering harmonic percussive source separation (HPSS). If ``margin =
  1.0``, decomposes an input spectrogram ``S = H + P`` where ``H`` contains the harmonic components, and ``P`` contains
  the percussive components. If ``margin > 1.0``, decomposes an input spectrogram ``S = H + P + R``" (references
  Fitzgerald 2010; Driedger, Müller, Disch 2014). `librosa.effects.hpss(y, *, kernel_size=31, power=2.0, mask=False,
  margin=1.0, ...) -> tuple[np.ndarray, np.ndarray]`: "Decompose an audio time series into harmonic and percussive
  components. This function automates the STFT->HPSS->ISTFT pipeline"; also `librosa.effects.harmonic(y)` and
  `librosa.effects.percussive(y)`. Input: a NumPy waveform `y` ("np.ndarray [shape=(..., n)]"); output: a harmonic
  and a percussive waveform (`decompose.hpss` returns spectrograms, or masks with `mask=True`). Runs on CPU (NumPy).
- Relevance: one way to split fingerstyle body taps (percussive) from pitched notes (harmonic); the
  fingerstyle-voices-taps lane covers it as a tap detector.
- Version: PyPI `librosa` 1.0.0 uploaded 2026-08-11, `requires_python >=3.12`. License ISC: "## ISC License /
  Copyright (c) 2013--2026, librosa development team. / Permission to use, copy, modify, and/or distribute this software
  for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission
  notice appear in all copies." (https://raw.githubusercontent.com/librosa/librosa/main/LICENSE.md, read 2026-11-10).

## ZeroSep (training-free, text-guided diffusion)
- "ZeroSep is a **training-free** audio source separation framework that repurposes pre-trained text-guided diffusion
  models for zero-shot separation."; "**Model‐agnostic**: works with AudioLDM, AudioLDM2, Tango, or any text-guided
  diffusion backbone" (README). Paper https://arxiv.org/abs/2505.23625 (badge "ArXiv 2025"; not opened). Repository
  https://github.com/WikiChao/ZeroSep (last commit 2025-11-03). Call: `python separate.py --input FILE.wav --target
  "man speech"` or a Gradio `python demo.py`; environment `conda create -n zerosep python=3.9`. Licence: code MIT,
  "Copyright (c) 2025 Chao Huang" (raw LICENSE, read 2026-11-10). The diffusion backbones it loads (AudioLDM,
  AudioLDM2, Tango) carry their own licenses, not read here (UNVERIFIED). No music-specific or guitar-specific result
  was read.

## Gaborformer (Sevag Hanssian, released 2026-11-08; added by the verifier)
- What (Hugging Face card https://huggingface.co/sevagh/gaborformer, read 2026-11-10): "Gaborformer is a **music stem
  separation model**"; it "combines an invertible, multi-resolution **nonstationary Gabor transform** ... with a
  **BS-RoFormer-style network** ..., building on [Phil Wang's PyTorch implementation][lucidrains]." Four stems:
  "a single model separates **vocals, drums, bass, and other**". "The model has **266.6M parameters** and **533 MB**
  FP16 weights." The card also says "Gaborformer was developed with substantial AI coding assistance". No guitar stem.
- Repository https://github.com/sevagh/gaborformer (last commit 2026-11-08, head 123a1c9); Hub repo created
  2026-11-08 with `gaborformer-fp16.safetensors`, `gaborformer-fp32.safetensors`, `gaborformer.pt`, `config.json`.
- How a program calls it (card and `docs/usage.md`): from a clone, `python -m pip install -e .` then `gaborformer
  song.wav --out separated` ("The CLI creates `separated/song/` with four stem WAVs. Inputs are automatically resampled
  to 44.1 kHz; M4A/AAC requires system FFmpeg"); `--cpu` "to select CPU inference", `--batch-size 1` "to reduce memory
  use"; "Requires Python 3.10+ and PyTorch 2.4+"; "CPU inference is also supported" (`docs/usage.md`). Not run here.
  (Gap round 2, read 2026-11-11: no PyPI package, `https://pypi.org/pypi/gaborformer/json` returns HTTP 404;
  `pyproject.toml` declares `license = "MIT"`, `requires-python = ">=3.10"` and `dependencies = ["torch>=2.4", "numpy",
  "soundfile", "soxr>=0.3.7", "safetensors", "huggingface_hub>=1.2,<2"]`; Hub file sizes with `blobs=true`:
  `gaborformer-fp16.safetensors` 533,469,856 bytes, `gaborformer-fp32.safetensors` 1,066,666,912,
  `gaborformer.pt` 1,067,423,581; `docs/usage.md`: "Output goes to `separated/song/{vocals,drums,bass,other}.wav` as
  44.1 kHz stereo, 32-bit float audio." `separate.py` (head 123a1c9): "on the CPU the model runs in fp32". Installing
  the clone was refused by the box's permission system: `trials.md`, "Gap round 2".)
- LICENSE FACTS
  - a. Code: MIT, "Copyright (c) 2026 Sevag Hanssian" and "Copyright (c) 2023 Phil Wang"
    (https://raw.githubusercontent.com/sevagh/gaborformer/main/LICENSE, read 2026-11-10).
  - b. Weights: Hub card metadata `license: other`, `license_name: gaborformer-noncommercial`; the Hub repo's
    `LICENSE`: "The pretrained weights in this directory are released for non-commercial use only. They were trained
    exclusively on MUSDB18-HQ." (https://huggingface.co/sevagh/gaborformer/raw/main/LICENSE, read 2026-11-10). GitHub
    README "License": "Code: [MIT](LICENSE). Pretrained weights: [non-commercial use only](weights/LICENSE), trained
    exclusively on [MUSDB18-HQ](https://sigsep.github.io/datasets/musdb.html)."
  - c. Training data: MUSDB18-HQ ("Trained exclusively on the standard **86-track training subset of MUSDB18-HQ**",
    card); MUSDB18-HQ clause in the datasets section.
- Author measurements (card abstract): "achieves **11.46 dB average cSDR** on the **50-track test set**" of
  MUSDB18-HQ.

## Toolkits and wrappers (older or adjacent)
- nussl: PyPI `nussl` 1.1.9 uploaded 2021-04-02 (the last release); summary "A flexible sound source separation
  library."; license field `MIT`; homepage https://github.com/interactiveaudiolab/nussl. Its README (head 17368d4,
  2024-12-09 "Deprecation notice in README.md", read 2026-11-10): "**NUSSL IS DEPRECATED** <br /> There will be no
  further any updates, bug fixes, or answers for open issues. We're leaving the code here as is for reference and
  educational purposes." Which methods it ships was not read (UNVERIFIED).
- asteroid: PyPI 0.7.0 uploaded 2023-10-12 (the last release); summary "PyTorch-based audio source separation
  toolkit"; license field `MIT`; repository https://github.com/asteroid-team/asteroid last commit 2026-11-03, LICENSE
  MIT "Copyright (c) 2019 Pariente Manuel". Its README's model list (ConvTasNet, DPRNN and others) points to speech
  recipes (`egs/wham`, `egs/wsj0-mix-var`); music recipes were not looked for.
- torchaudio pipelines (https://raw.githubusercontent.com/pytorch/audio/main/src/torchaudio/pipelines/_source_separation_pipeline.py,
  read 2026-11-10): `HDEMUCS_HIGH_MUSDB_PLUS` ("*Hybrid Demucs* ... trained on both training and test sets of MUSDB-HQ
  ... and an additional 150 extra songs from an internal database that was specifically produced for Meta.") and
  `HDEMUCS_HIGH_MUSDB` ("trained on the training set of MUSDB-HQ"), both `sources=["drums", "bass", "other",
  "vocals"]`, `_sample_rate=44100`; both names are still exported by `torchaudio/pipelines/__init__.py` on `main`. No
  weights license is stated in that file; torchaudio's own license was not read here.
- Moises-Light (https://github.com/crlandsc/moises-light, last commit 2026-05-01; PyPI `moises-light` 0.1.5 uploaded
  2026-04-09, license field `MIT`): "This is an unofficial PyTorch implementation of the Moises-Light architecture
  from ["Moises-Light: Resource-efficient Band-split U-Net for Music Source Separation"](https://arxiv.org/abs/2510.06785)
  (Hung et al., WASPAA 2025)" and "This is an independent implementation — the paper does not release code." Model
  call: `model = MoisesLight(**configs['paper_large'])`; `y = model(x)  # [1, 4, 2, 264600] = [batch, stems,
  channels, samples]`. No pretrained weights are named in the README. LICENSE: MIT, "Copyright (c) 2026 Christopher
  Landschoot". MSST accepts it as `--model_type moises_light`.
- PolUVR (Politrees): PyPI 1.11.0 uploaded 2025-09-28; LICENSE is MIT with "Copyright (c) 2023 karaokenerds" (the same
  holder as audio-separator); repository https://github.com/Politrees/PolUVR (last commit 2025-09-29).
- mlx-audio-separator: PyPI 0.1.20 uploaded 2026-10-02, "MLX-native audio stem separation for Apple Silicon"; MIT,
  "Copyright (c) 2024-2026 ssmall256". Not runnable on this Linux box (MLX targets Apple Silicon).
- demucs-infer (OpenMIRLab): "Inference-only distribution of Demucs for PyTorch 2.x"; "The original [Demucs]
  repository by Meta AI Research is **no longer actively maintained** ... it pins `torchaudio<2.1`". PyPI 4.4.0 uploaded
  2026-10-05 (README: "OpenMIRLab no longer publishes new versions to PyPI. Any existing PyPI releases are historical
  snapshots."); install `pip install "demucs-infer @ git+https://github.com/openmirlab/demucs-infer.git"`. License MIT,
  "Copyright (c) Meta Platforms, Inc. and affiliates. (Original Demucs) Copyright (c) 2025 Bo-Yu Chen". It uses Meta's
  weights from `dl.fbaipublicfiles.com` ("demucs-infer hosts no mirror").
- `uvr` on PyPI (Oorteo, 0.2.6) is not a separation tool: its README describes "Streamlined Script Execution with
  `uvr`", a runner for `uv` scripts. Listed here only because the name collides.

## Handoff facts
Each line: what X outputs (with the source for that half), and what Y accepts (with the source for that half). These
are documented interfaces unless a run id is given; measured handoffs belong in `trials.md`. Lines were checked by the
verifier on 2026-11-10 against the sources named in them.

- Demucs `htdemucs_6s` writes `separated/htdemucs_6s/TRACK/guitar.wav` (stereo wav, 44.1 kHz, int16 by default;
  https://raw.githubusercontent.com/adefossez/demucs/main/README.md; with `-o` the root changes, as in run r0021, whose
  `guitar.wav` is 2 channels, 44100 Hz, PCM_16), which Basic Pitch accepts as an input path: "`basic-pitch` accepts all
  sound files that are compatible with its version of [`librosa`], including:" ... "`.wav`" and "the channels of the
  input will be down-mixed to mono" (https://raw.githubusercontent.com/spotify/basic-pitch/main/README.md).
- Demucs Python API returns `(origin, separated)` where `separated` is "a dict, whose keys are the name of stems and
  values are separated waves", and `demucs.api.save_audio(source, path, samplerate=separator.samplerate)` writes one
  of them to a file (https://raw.githubusercontent.com/adefossez/demucs/main/docs/api.md); Basic Pitch's documented
  Python call is `predict(<input-audio-path>)`, a file path (Basic Pitch README), so the in-memory stem goes through
  `save_audio` first.
- python-audio-separator writes one file per stem, FLAC by default from the CLI (`--output_format`, "(default:
  FLAC)"; the Python `Separator` default is "`Default: WAV`") and `output_files = separator.separate(...)` returns the
  written paths (https://raw.githubusercontent.com/nomadkaraoke/python-audio-separator/main/README.md), which Basic
  Pitch accepts (`.flac` and `.wav` are in its list, Basic Pitch README).
- python-audio-separator `--single_stem SINGLE_STEM` ("Output only single stem, e.g. Instrumental, Vocals, Drums,
  Bass, Guitar, Piano, Other", README CLI help) with a 6-stem model such as `htdemucs_6s.yaml` or `BS-Roformer-SW.ckpt`
  (both in its model lists) is documented to write only that stem, as FLAC by default from the CLI; Basic Pitch
  accepts `.flac` (Basic Pitch README). Not tested with these two models here.
- MSST `Separator.separate_file(path)` returns "a dictionary from stem name to a NumPy array shaped `(channels,
  samples)`" at `separator.sample_rate`
  (https://raw.githubusercontent.com/ZFTurbo/Music-Source-Separation-Training/main/docs/python_api.md), which
  `librosa.effects.hpss(y)` accepts as `y : np.ndarray [shape=(..., n)]`
  (https://raw.githubusercontent.com/librosa/librosa/main/librosa/effects.py) for a harmonic / percussive split of a
  guitar stem (taps vs notes).
- `librosa.effects.hpss(y)` returns `tuple[np.ndarray, np.ndarray]` (harmonic, percussive waveforms)
  (https://raw.githubusercontent.com/librosa/librosa/main/librosa/effects.py), and `librosa.onset.onset_detect(*, y:
  np.ndarray | None = None, sr: float = 22050, ...)` takes a waveform `y` and returns onsets in "frames", "samples" or
  "time" (`units : {'frames', 'samples', 'time'}`,
  https://raw.githubusercontent.com/librosa/librosa/main/librosa/onset.py); other onset detectors for the next step are
  in `lanes/fingerstyle-voices-taps/survey.md`.
- A guitar stem from any separator (a file torchaudio can load) can be the query clip for Banquet:
  `--query_path=/path/to/query/file/random-guitar.wav`
  (https://raw.githubusercontent.com/kwatcharasupat/query-bandit/main/README.md); `inference_byoq` in `train.py`
  resamples it to 44.1 kHz and cuts or tiles it to 10 s (head 79ed5bb), and the paper: "each query signal is downmixed
  to mono and downsampled to 32 kHz before being fed to PaSST" (https://arxiv.org/abs/2406.18747v2).
- Beat times in seconds from the chords-beats-key lane, e.g. Beat This!, whose `.beats` file has "each line has a time
  in seconds, a tab, and a beat number (1 = downbeat)" (https://raw.githubusercontent.com/CPJKU/beat_this/main/beat_this/utils.py),
  or `librosa.onset.onset_detect(..., units='time')` (librosa `onset.py`, above), map onto SAM Audio's span prompt,
  which takes seconds: `processor(audios=[audio], descriptions=["car honking"], anchors=[[["+", 6.3, 7.0]]])`
  (https://raw.githubusercontent.com/facebookresearch/sam-audio/main/README.md).
- SAM 2 gives per-frame masks: "`for frame_idx, object_ids, masks in predictor.propagate_in_video(state):`"
  (https://raw.githubusercontent.com/facebookresearch/sam2/main/README.md); SAM Audio's visual prompt takes
  `masked_videos=processor.mask_videos([frames], [mask])` (SAM Audio README), and `mask_videos(videos, masks)` accepts,
  per video, a file path (decoded with torchcodec `VideoDecoder`) or a tensor for both the video and the mask, and
  returns `[v * m.eq(0) for v, m in zip(video, video_mask, strict=False)]`
  (https://raw.githubusercontent.com/facebookresearch/sam-audio/main/sam_audio/processor.py, head bb4c699): pixels where
  the mask is non-zero are set to 0. Turning SAM 2's per-frame, per-object masks into one tensor of the video's shape
  with the polarity that code expects was not tested (UNVERIFIED).
- A user's correction "this is acoustic guitar" maps onto a text query: SAM Audio ("please use lowercase
  noun-phrase/verb-phrase (NP/VP) format for text", README) and AudioSep (`inference(model, audio_file, text,
  output_file, device)`, https://raw.githubusercontent.com/Audio-AGI/AudioSep/main/README.md; corrected in gap round
  2: that is the README's name, and the function in `pipeline.py` at head 944583f is `separate_audio` with the same
  first five arguments). AudioSep writes one mono
  16-bit wav at 32 kHz (`write(output_file, 32000, np.round(sep_segment * 32767).astype(np.int16))`,
  https://raw.githubusercontent.com/Audio-AGI/AudioSep/main/pipeline.py), which Basic Pitch accepts (`.wav`, Basic
  Pitch README).
- In the browser: StemSplit's ONNX exports run under `onnxruntime-web` ("a copy-pasteable `onnxruntime-web` path for
  the browser", https://raw.githubusercontent.com/StemSplit/demucs-onnx/main/README.md), and the BS-RoFormer-SW ONNX
  export documents its tensors: inputs `spec_real`, `spec_imag`, "Outputs (both shape `[1, 6, 2, 1025, T]`, float32)",
  traced at "176400 samples (4 s @ 44.1 kHz, T=345)" with the STFT done by the caller
  (https://huggingface.co/elicwhite/bs-roformer-sw-6stem-onnx/raw/main/README.md); the browser-audio-sync lane covers
  ONNX Runtime Web itself.

## Not covered
Found during the verifier's completeness search on 2026-11-10 (web search, Hugging Face Hub searches "guitar",
"roformer", "demucs", "separation", "stem" and the `audio-to-audio` tag sorted by creation date, MSST's code and
release tags). Each was looked at only as far as the line says; none was run.

- SepGen (Tel Aviv University and Google), https://arxiv.org/abs/2610.11361 (2026-10-08), weights
  https://huggingface.co/AviadDahan/SepGen-Separation: audio-video separation of captioned sources as a LoRA on the
  LTX-2.5 22B model; card metadata `license_name: ltx-2.x-community-license-agreement` (license text not read).
- GuitarDuets, https://arxiv.org/abs/2507.01172 (2025-07-01): a dataset of real and synthesized classical guitar
  duets and Demucs adapted to separate two guitars of the same timbre; code and weights not looked for.
- Score-Informed SS on Guitars, https://github.com/jackyhsiung/Score-Informed-SS-on-Guitars (branch `master`, last
  commit 2020-11-09): code for the paper "Monaural Score-Informed Source Separation of Sound Mixtures of Two Guitars",
  a "score-informed version of Open-Unmix" (README); no LICENSE file in its tree.
- guitar_source_separation, https://github.com/LukeSutor/guitar_source_separation (last commit 2022-06-15): its
  README and LICENSE are Open-Unmix's (MIT, Inria); no guitar weights are named in the README.
- Mini-BS-RoFormer-V2.5-46.2M, https://huggingface.co/HiDolen/Mini-BS-RoFormer-V2.5-46.2M (created 2026-10-10, card
  tag `mit`, dataset tag `CLAPv2/MUSDB18-HQ`): 4 stems ("bass, drums, other, and vocals"), 44.1 kHz, loaded with
  `transformers` `AutoModel`; a GGUF copy is `cstr/mini-bs-roformer-GGUF`.
- Music Source Restoration (ICASSP 2026 MSR Challenge) systems, e.g. https://arxiv.org/abs/2603.16926 and DTT-BSR
  https://arxiv.org/abs/2602.19825: recovering unprocessed stems from mastered mixes; code and weights not looked for.
- Dynamic Band Splitting's own repository, https://github.com/JusperLee/Dynamic-Band-Splitting (last commit
  2026-10-15; its LICENSE file is the Apache License 2.0 text): the released checkpoints `JusperLee/DBS-BSRNN-DnR` and
  `JusperLee/DBS-TIGER-DnR` return `music, sfx, speech` in its README example; no music-stem checkpoint is named.
- Band-Split RNN (BSRNN): appears only as a row of the Demucs README's "Comparison of accuracy" table; no code
  source was looked for.
- StemDeck, a desktop stem splitter: a web-search result for
  https://bedroomproducersblog.com/2026/08/19/stemdeck-stem-splitter/ describes it as a free local app using
  `htdemucs_6s`; the page was not opened (apps-survey lane).
- STEMMA (https://huggingface.co/hoyso48/STEMMA-MOSS-Music, arXiv 2610.11884): card pipeline tag
  `audio-text-to-text`, "fine-tuned on STEMMA-Instruct for multi-audio music reasoning"; listed only because its name
  matched the "stem" search.

## Verification log (verify-docs-source-separation, 2026-11-10)
Method: every URL cited in this file was fetched again on 2026-11-10 (raw GitHub files, Hugging Face Hub API and
`/raw/` card files, Zenodo API, PyPI JSON, arXiv API and abstract pages, the paper PDFs converted with `pdftotext`, the
MVSEP, music.ai and Moises pages); repository heads and dates came from blob-less `git clone --depth 1` copies. A
script (`scripts/verify-docs-quotes.py`) looked up every double-quoted string of the file in those copies, and every
string it could not match was checked by hand. Copies: `/home/user/gtr/lanes/source-separation/verify-docs/`
(fetch logs with HTTP codes and times in each folder's `_fetch_log.tsv`). Scripts: `scripts/verify-docs-*`.

Tally, quoted license and terms clauses (LICENSE files, license sections, dataset terms, model-card license text,
gate text) as the file stood before this check:
- Checked: 74. Confirmed verbatim, whitespace aside: 66 (one of them, the Spleeter README's "Agents" section, was
  then replaced by a description because its wording is addressed to AI agents). Confirmed as rendered text but with
  Markdown link markup dropped, markup restored: 4 (SAM Audio README access sentence, SAM gate privacy sentence,
  MuS3D README license paragraph, the ONNX card's "[rehosted by jarredou][1]"). Corrected: 4 (python-audio-separator
  README license sentence, which joined a sentence and a list item and dropped a link; SAM gate heading, which has no
  final period on the page; "License: CC BY-NC-SA 4.0", which is not text on the arXiv page, where the paper's
  license is a "view license" link to the CC BY-NC-SA 4.0 deed; a quoted "no license file found at ..." that was this
  file's own note, not a source). Unverifiable: 0. Every license id and tag cited from Zenodo (6 records), the Hub
  (about 70 repositories) and PyPI (17 packages) matched.
- Other quotes corrected to the source text: 8 (Spleeter `paper.md` speed sentence, whose `$3$`-style LaTeX and
  middle part had been dropped; the `htdemucs_6s` stem list in python-audio-separator, which is JSON in
  `models-scores.json`, not a Python list; the `htdemucs_6s` sidecar `sources` list; MSST's "HTDemucs4" table row,
  whose stems column had been dropped; AudioSep's numbers, which are "(SDRi) of ..." in the v3 PDF abstract and not in
  the arXiv listing abstract; SAM Audio's parameter counts, which are cells of the paper's Table 8; the Basic Pitch
  README sentence, which has a comma before "including"; the guitar fine-tune card's "Guitar SDR (dB) 8.73", which is
  a metric name and a value, with `"verified": false` coming from the Hub API, not the card).
- Two quotes that had been read "through a summarising fetch" were re-read in the page HTML and confirmed: SAM Audio's
  "Both are list[torch.Tensor] where each tensor is a 1D waveform" and the MVSEP page's Note 4 and SDR table.

Other facts corrected: Spleeter's `separate()` default (`audio_descriptor: Optional[str] = ""`); the MUSDB18-HQ
source list (its first item differs from MUSDB18's); the Demucs and Open-Unmix score tables do not name their test
set; SAM Audio has seven gated repos, not five, and its README calls a GPU "recommended"; the "two TRvlvr URLs" note
(re-checked two `TRvlvr/model_repo` URLs); `jarredou` (model API 401, user page 404); Demucs `uvx` versus the missing
numpy dependency that trials.md hit (both stated with sources).

Versions and dates: all 17 PyPI versions, upload dates and Python bounds, the heads and commit dates of the 35
repositories cited, 14 arXiv ids, titles, authors and dates, and 6 Zenodo records matched the file as written.
Added: OpenMIRLab's three READMEs say "OpenMIRLab no longer publishes new versions to PyPI."; nussl's README says it
is deprecated; MSST has release tags `v1.0.22` and `v1.0.23` and code-only model keys.

UNVERIFIED items settled or narrowed: MoisesDB download-page terms (quoted); SAM Audio output rate (code default 48
kHz mono; the gated checkpoint config was not read); Banquet CPU path (code branch exists, not run); demucs-rs CPU
path (README prerequisites name a GPU); MSST `v1.0.21` asset name and size (HEAD request; the release page is still
403 here and no other route to it was available); terms of AudioSet, VGGSound,
AudioCaps, Clotho and OpenMIC-2018 (quoted). Still UNVERIFIED: AlbumDB terms, the ZeroSep backbones' licenses, the
training data of the UVR and community checkpoints, MuS3D's numbers, whether SAM Audio's checkpoints use the
watermarked DAC-VAE, the rate a released SAM Audio checkpoint sets, SAM 2 mask conversion for `mask_videos`.

Missing license and data facts added: `facebook/dacvae-watermarked` (tag `apache-2.0`, text "licensed under the SAM
License", and an AudioSeal watermark "to ensure all audios generated contain watermarks"); MuS3D's DiT LICENSE is byte-identical to SAM Audio's; Banquet's
README "released under permissive licenses" next to its `cc-by-nc-sa-4.0` weights; differing card tags on copies of
BS-RoFormer-SW (`unknown`, `mit`, `other`); AudioCaps README "academic purposes only" next to its MIT LICENSE; `umxse`
Zenodo license; Gaborformer's non-commercial weights; SubRoformer's code license and training-data sentence.

Tools added: 4 with sources and quoted licenses (Gaborformer section; BSRoformer.cpp; torchaudio `HDEMUCS_*`
pipelines; Moises-Light), plus the official BS-RoFormer code repository, MVSEP Mega 53 conversions and SubRoformer's
code repository inside existing sections; 10 entries under "Not covered".

Links fixed: 6 (arXiv license, `jarredou` status, and the 4 restored Markdown links above).

Handoff facts: 12 lines (the docs agent's summary said 13). Kept with sources tightened: 6. Fixed: 5 (an unsourced
"in-memory transcriber" half replaced by `save_audio` + Basic Pitch's path input; the `--single_stem` line given a
receiving half; the onset-detector half sourced to librosa's `onset.py`; the beat-times half sourced to Beat This!
`utils.py`; the SAM 2 mask line sourced on both sides, with the mask conversion marked UNVERIFIED). Deleted: 1 (the
Demucs rescale caveat, which had no receiving half; the fact stays in the Demucs section). Output formats agree with
trials.md and the run outputs where both exist: Demucs (r0021: stereo 44.1 kHz PCM_16) and Open-Unmix (r0101).

Pricing and terms pages: this file quotes no prices. Pages with terms were re-read on 2026-11-10: the SAM Audio gate
(page HTML), the MVSEP algorithm page, music.ai/research, the Moises guitar page. Spleeter Pro, LALAL.AI, AudioShake
and the other services stay with the hosted-apis lane.

Judging language: the remaining words such as "state-of-the-art", "better", "SOTA", "won" are inside quotes with
their source named; two unquoted phrases were rewritten ("SDX 2023 3rd place" now quoted from its README; "heavy" for
ZeroSep replaced by what it loads).

## Gap round 2 additions (gapfill-source-separation, 2026-11-11)
Facts added in place, each marked "gap round 2" and dated, read from PyPI JSON, the Hugging Face API, HTTP HEAD and
shallow clones (copies under `/home/user/gtr/lanes/source-separation/gap2/fetched/`): Gaborformer (no PyPI package;
`pyproject.toml` license and dependencies; Hub file sizes; output format; CPU path in fp32), Banquet (how the query
becomes a PaSST embedding, the chunking and the output in the code; the PaSST `openmic` weights URL and size;
hear21passt's PyPI facts), AudioSep (the README's `inference` is `separate_audio` in `pipeline.py`; no PyPI package),
the "Runnable here?" cells of these tools and of the guitar fine-tune, and one handoff line (AudioSep's function
name). What ran or was refused on the box is in `trials.md`, "Gap round 2".
