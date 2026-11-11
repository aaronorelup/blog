# Source separation: what Aaron has to run himself

Written 2026-11-10 by `try-source-separation`, checked and corrected on 2026-11-10/11 (UTC) by
`verify-trials-source-separation` (what changed is listed at the end of `trials.md`). Each item below could not be run
on the research box (4 CPU cores, no GPU, 6 to 7 GB of free disk shared by about 20 agents during the work). The
reason is in `trials.md` under "NOT RUN HERE". The laptop is assumed to be Windows 11 with an 8 GB RTX 4070.

**The test clips** (all made or licensed for this research, described in `docs/guitar-tab-research/inputs/INPUTS.md`):
`S4.wav` (38.7 s synthesized band: drums, bass, strummed steel guitar, a "Voice Oohs" lead; the true stems exist, so
results can be scored), `S6taps.wav` (29.4 s, one steel guitar plus percussive taps, true stems exist), `S2s.wav`
(29.4 s, one synthesized steel guitar), `S3.wav` (24 s, strummed steel guitar alone), `R2.wav` (36 s real band song
with singing, CC BY 4.0) and `R2full.wav` (the whole song, 3:48), `R3a.wav` (18 s real classical guitar, CC BY-SA
4.0). They are on the research box under `/home/user/gtr/inputs/<id>/`; ask the orchestrator for the files if they
are not on the laptop yet.

**What to send back for every item:** the output audio files exactly as the tool wrote them (do not convert or
rename; zip the folder), a screenshot of the tool's window or console at the end of the run, how long it took (the
tool's own timer, or a phone stopwatch from clicking Start to the files appearing), the tool's version number, and
for the GPU items a screenshot of Task Manager > Performance > GPU while it runs (it shows "Dedicated GPU memory").

## 1. SAM Audio (Meta), text-prompted separation

Not run here: the weights are gated (Hugging Face reports `gated: manual` for all three repositories: a Hugging Face
account and a request that Meta approves) and the smallest model repository is 5.1 GB.

1. Route without an install: open https://aidemos.meta.com/segment-anything/editor/segment-audio in Chrome. (The
   research agents did not open this page; the link is from the survey. If it needs a Meta login or does not take
   uploads, go to step 3.)
2. Upload `S4.wav`, type the prompt `acoustic guitar`, run, download the result. Repeat with `R2.wav` (prompt
   `guitar`; which guitars R2 contains is not known) and `R3a.wav` (prompt `guitar`). Send back the files and the
   exact prompts.
3. Local route (only if the demo is not usable): create a Hugging Face account, open
   https://huggingface.co/facebook/sam-audio-small and press the button to request access; wait for the approval
   email. Then follow the "Setup" and "Usage" sections of the README at https://github.com/facebookresearch/sam-audio
   (it asks for Python 3.11 or newer, `pip install .` in the cloned repository, and `hf auth login` with an access
   token before the checkpoints download), in a Python 3.11 environment with CUDA PyTorch. Whether
   `sam-audio-small` fits in 8 GB of GPU memory is not known (UNVERIFIED): note it if it runs out of memory.

## 2. AudioSep, text-queried separation

Not run here: its two checkpoint files are 1.26 GB and 2.35 GB (3.6 GB together) and the disk notice on the box
forbids downloads over 200 MB.

1. No install: open the Hugging Face Space https://huggingface.co/spaces/Audio-AGI/AudioSep in Chrome. On
   2026-11-10 the Hugging Face API reported this Space's runtime stage as `RUNTIME_ERROR`, so the page may show an
   error instead of the app; if it does, go to step 4.
2. Upload `S4.wav`, enter the text `acoustic guitar`, run, download the output. Then `R3a.wav` with `classical
   guitar`, and `S6taps.wav` with `guitar` and again with `knocking` (to see whether the taps come out).
3. Send back the files and the prompts. The output should be one mono file at 32 kHz (that is what the code
   writes, per the survey); say if it is something else.
4. Local route (the README's "Setup" and "Inference" sections, https://github.com/Audio-AGI/AudioSep): in a Miniconda
   prompt, `git clone https://github.com/Audio-AGI/AudioSep.git`, `cd AudioSep`, `conda env create -f
   environment.yml`, `conda activate AudioSep`. Download `audiosep_base_4M_steps.ckpt` and
   `music_speech_audioset_epoch_15_esc_89.98.pt` from the Space's `checkpoint/` folder
   (https://huggingface.co/spaces/Audio-AGI/AudioSep/tree/main/checkpoint) into the repository's `checkpoint/` folder.
   Then run the README's Python example (`build_audiosep(config_yaml='config/audiosep_base.yaml',
   checkpoint_path='checkpoint/audiosep_base_4M_steps.ckpt', device=device)` then `inference(model, audio_file, text,
   output_file, device)`) once per file and prompt from step 2; the README's example picks the GPU when CUDA is
   available. Send back the outputs, the prompts and the time per file.

## 3. Banquet (query-by-example: "give me the stem that sounds like this clip")

Not run here: running the cloned repository's `train.py` was refused by the research box's permission system
("[Code from External]", gap round 2, `trials.md`); the first round had stopped earlier because of the disk notice
(corrected in gap round 2). The smallest checkpoint is 552 MB (`ev-pre-aug.ckpt`, the one the README names for "If
you are not sure", is 645 MB), plus the PaSST query model (342 MB, downloaded by the code on first use). The README's
example runs on CUDA (`--use_cuda=true`); `train.py` also has a CPU branch (`--use_cuda=false`), not tried here.
What the query is and what comes back (read from the code): the query file is cut or repeated to 10 s, averaged to
mono and reduced by PaSST to one embedding; the output is one stem with the mixture's channels, length and sample
rate.

1. Install Git and Miniconda for Windows if they are not installed.
2. In an "Anaconda Prompt": `git clone https://github.com/kwatcharasupat/query-bandit` then `cd query-bandit`. The
   README has no install section and the repository has no requirements file (checked 2026-11-10). The code imports
   these packages: torch, torchaudio, pytorch_lightning, torchmetrics, torch_audiomentations, omegaconf, numpy,
   pandas, librosa, scikit-learn, tqdm, fire and hear21passt (the PaSST query model). In a new Python environment,
   install PyTorch with CUDA first (the command https://pytorch.org shows for "Stable, Windows, Pip, Python, CUDA"),
   then `pip install pytorch_lightning torchmetrics torch_audiomentations omegaconf numpy pandas librosa
   scikit-learn tqdm fire hear21passt` (the versions this resolved to on the research box, Python 3.11 with CPU torch,
   are in `samples/banquet/uv-pip-freeze-not-run.txt`). If the first run stops with "TorchCodec is required for load_with_torchcodec"
   (or `save_with_torchcodec`), `pip install torchcodec` and run again: torchaudio 2.11 needed it on the research box
   (`trials.md`, Open-Unmix), and `train.py` uses `torchaudio.load` and `torchaudio.save`. Note any other module the
   first run asks for.
3. Download `ev-pre-aug.ckpt` from https://zenodo.org/records/13694558 into the folder.
4. Use `S3.wav` (strummed steel guitar alone) as the query and `S4.wav` as the mixture:
   `set CONFIG_ROOT=./config` then
   `python train.py inference_byoq --ckpt_path=ev-pre-aug.ckpt --input_path=S4.wav --output_path=out\S4_guitar.wav --query_path=S3.wav --batch_size=4 --use_cuda=true`
   (batch size 4 instead of the README's 12 because the README says 12 "usually fits on a RTX 4090", which has more
   memory than the laptop's 8 GB 4070). The code truncates or repeats the query to 10 s. If the run stops with an
   error that names `DATA_ROOT` (the default config's data file reads `${oc.env:DATA_ROOT}`), run `set DATA_ROOT=.`
   and start it again; note it in what you send back.
5. Repeat with `--input_path=R2.wav` and the same query. Send back both outputs, the console text and the time.

## 4. Big RoFormer models on a whole song, on the GPU

Run here only on 10 s pieces of `S4` on the CPU: on 2 CPU cores the 10 s took 110 s (BS-RoFormer-SW), 170 s
(BS-RoFormer) and 503 s (MDX23C) (`trials.md`, runs r0489, r0498, r0496). The whole song on a GPU gives the time a
user would wait. The same Python package as on the box, with a GPU build of PyTorch.

1. Install Python 3.11 from python.org (tick "Add python.exe to PATH").
2. In "Command Prompt": `py -3.11 -m venv sep` then `sep\Scripts\activate`. Install PyTorch first with the command
   that https://pytorch.org shows for "Stable, Windows, Pip, Python, CUDA". Then `pip install "audio-separator[gpu]"`
   (its `gpu` extra adds `onnxruntime-gpu`, per the package metadata). Run `audio-separator -e` (`--env_info`) and check that the printed environment mentions CUDA;
   screenshot it.
3. Run, one after another, and time each (`--output_format WAV` because the default output format is FLAC):
   `audio-separator -m BS-Roformer-SW.ckpt --output_format WAV R2full.wav`
   `audio-separator -m BS-Roformer-SW.ckpt --output_format WAV S4.wav`
   `audio-separator -m model_bs_roformer_ep_317_sdr_12.9755.ckpt --output_format WAV R2full.wav`
   `audio-separator -m htdemucs_6s.yaml --output_format WAV R2full.wav`
   The first run of each model downloads it (about 700 MB, 640 MB and 55 MB).
4. Send back all output files, the console text of each run (it prints its own "Load model duration" and
   "Separation duration") and the Task Manager GPU screenshot.

## 5. `adityalakhani/htdemucs-6s-guitar-ft` (htdemucs_6s fine-tuned for guitar)

Run here in gap round 2, on the CPU (`trials.md`, "Gap round 2": r0636 to r0644, scored as e1831 to e1835), but not
with the repository's own `inference.py`: its steps were run by a script with demucs 4.1.0 instead of the pinned
4.0.1. (The first round's reason, the 330 MB checkpoint during the disk notice, is no longer the reason; corrected in
gap round 2.) This item is now only needed for the repository's own script as written, and for a GPU timing.

1. From https://huggingface.co/adityalakhani/htdemucs-6s-guitar-ft/tree/main download `guitar_htdemucs_6s.pt`,
   `inference.py` and `requirements.txt` into one folder.
2. In a new Python environment (as in item 4: CUDA PyTorch from pytorch.org first), in that folder:
   `pip install -r requirements.txt` (it lists torch, torchaudio, `demucs==4.0.1`, soundfile and tqdm).
3. Run `python inference.py --input S4.wav --output S4_guitar.wav`, then the same with `R2.wav` and `S2s.wav` (the
   script reads and writes with soundfile, uses the GPU when CUDA is available, writes only the guitar stem, and
   takes `--device cpu` to force the CPU; the model card shows these usage lines).
4. Send back the three guitar stems, the exact commands, the console text and the time of each.

## 6. Demucs in the browser (WebGPU)

Not run here: the box has no GPU, and the `demucs-rs` README names Metal, Vulkan and WebGPU back ends only (its
prerequisites list "A GPU with Metal (macOS), Vulkan (Linux/Windows), or WebGPU (browser) support").

1. Open https://nikhilunni.github.io/demucs-rs/ in Chrome on the laptop (not opened by the research agents).
2. Load `S4.wav`, choose the 6-stem model (`htdemucs_6s`) if offered, run, and time it with a stopwatch. Then
   `R2full.wav` (the whole song).
3. Download the stems. Send back the files, the times, and a screenshot of `chrome://gpu` (top section).

## 7. MuS3D and ZeroSep (research systems)

Not run here: MuS3D's checkpoint repository is 19.2 GB and its README says "The DiT needs about 10 GB of free
memory"; ZeroSep runs diffusion models. Both are optional; MuS3D "separates a music mixture without being told which
sources it contains" (its README).

- **MuS3D.** Its entry point is a bash script and its README asks for Python 3.13 or newer and uv, so on Windows
  it needs WSL (Windows Subsystem for Linux, Ubuntu). In WSL, follow the "Installation" section of the README of
  https://github.com/REMUS-Aalto/Mus3D (`uv sync`), download from https://huggingface.co/remus-aalto/MuS3D into
  `checkpoints/` the `BS-Locoformer_query`, `SEG_mixemb`, `SEG_resemb` and `classifiers` folders (the 18.2 GB
  `DiT/ema.pth` is the checkpoint of the DiT separator, the README's default `--separator dit`; whether
  `inference.sh` asks for it or for anything else with `--separator bslocoformer` was not checked), then run
  `bash inference.sh R2.wav --separator bslocoformer`. The
  README says it decomposes one 10 s segment, centred by default (`--start <s>` picks another). Send back the output
  folder including `trace.txt`, and the time it took.
- **ZeroSep.** From its README (https://github.com/WikiChao/ZeroSep): `git clone https://github.com/WikiChao/ZeroSep.git`,
  `cd ZeroSep`, optionally `conda create -n zerosep python=3.9` and `conda activate zerosep`, then
  `pip install -r requirements.txt`. Then `cd code` and run `python separate.py --input <path to>\S4.wav --target
  "acoustic guitar" --output_dir results` (the README runs `separate.py` and the Gradio app `demo.py` from the
  `code` folder; its defaults: model `cvssp/audioldm-s-full-v2`, 50 steps). Send back the `results` folder, the exact
  command and the time.

## 8. Gaborformer (4 stems: vocals, drums, bass, other; added in gap round 2)

Not run here: it has no PyPI package, and installing the cloned repository was refused by the research box's
permission system ("[Code from External]", `trials.md`, "Gap round 2"). It has no guitar stem (its four stems are
vocals, drums, bass and other). Its weights are licensed for non-commercial use only (`survey.md`, "Gaborformer").

1. Install Git and Python 3.11 if they are not installed. In "Command Prompt": `git clone
   https://github.com/sevagh/gaborformer.git`, `cd gaborformer`, `py -3.11 -m venv venv`, `venv\Scripts\activate`.
2. Install PyTorch with CUDA first (the command https://pytorch.org shows for "Stable, Windows, Pip, Python, CUDA";
   the README asks for "Python 3.10+ and PyTorch 2.4+"), then `python -m pip install -e .` (the README's install).
3. Run `gaborformer S4.wav --out separated`, then `gaborformer R2.wav --out separated` and `gaborformer S6taps.wav
   --out separated`. The first run downloads the 533 MB FP16 checkpoint from Hugging Face and checks its SHA-256 (per
   `docs/usage.md`). If it runs out of GPU memory, add `--batch-size 1` (the docs: "Use `--batch-size 1` to reduce
   memory use"); if it stops with an error about bf16, add `--precision fp16` ("for CUDA GPUs without BF16 support").
4. For a CPU figure next to the GPU one, run `gaborformer S4.wav --cpu --out separated-cpu` once.
5. Send back the `separated` folders (four float32 WAVs per clip: `vocals`, `drums`, `bass`, `other`), the exact
   commands, the console text, the time of each run, and the Task Manager GPU screenshot.
