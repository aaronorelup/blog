# Source separation: what Aaron has to run himself

Written 2026-11-10 by `try-source-separation`. Each item below could not be run on the research box (4 CPU cores,
no GPU, about 6 GB of free disk shared by 20 agents). The reason is in `trials.md` under "NOT RUN HERE". The laptop
is assumed to be Windows 11 with an 8 GB RTX 4070.

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

Not run here: the weights are gated (a Hugging Face account and Meta's manual approval) and the smallest model
repository is 5.1 GB.

1. Easiest route, no install: open https://aidemos.meta.com/segment-anything/editor/segment-audio in Chrome. (The
   research agents did not open this page; if it needs a Meta login or does not take uploads, skip to step 3.)
2. Upload `S4.wav`, type the prompt `acoustic guitar`, run, download the result. Repeat with `R2.wav` (prompt
   `electric guitar`) and `R3a.wav` (prompt `guitar`). Send back the files and the exact prompts.
3. Local route (only if the demo is not usable): create a Hugging Face account, open
   https://huggingface.co/facebook/sam-audio-small and press the button to request access; wait for the approval
   email. Then follow the "Installation" and "Usage" parts of https://github.com/facebookresearch/sam-audio in a
   Python 3.11 environment with CUDA PyTorch. Whether `sam-audio-small` fits in 8 GB of GPU memory is not known
   (UNVERIFIED): note it if it runs out of memory.

## 2. AudioSep, text-queried separation

Not run here: its two checkpoint files are 1.26 GB and 2.35 GB (3.6 GB together) and the disk notice on the box
forbids downloads over 200 MB.

1. No install: open the Hugging Face Space https://huggingface.co/spaces/Audio-AGI/AudioSep in Chrome. If it says
   it is sleeping or building, wait or try later (free Spaces can be slow or off).
2. Upload `S4.wav`, enter the text `acoustic guitar`, run, download the output. Then `R3a.wav` with `classical
   guitar`, and `S6taps.wav` with `guitar` and again with `knocking` (to see whether the taps come out).
3. Send back the files and the prompts. The output should be one mono file at 32 kHz (that is what the code
   writes, per the survey); say if it is something else.

## 3. Banquet (query-by-example: "give me the stem that sounds like this clip")

Not run here: the smallest checkpoint is 552 MB (the recommended `ev-pre-aug.ckpt` is 645 MB) plus the PaSST query
model, and the README shows a CUDA flag only.

1. Install Git and Miniconda for Windows if they are not installed.
2. In an "Anaconda Prompt": `git clone https://github.com/kwatcharasupat/query-bandit` then `cd query-bandit` and
   follow the README's install section.
3. Download `ev-pre-aug.ckpt` from https://zenodo.org/records/13694558 into the folder.
4. Use `S3.wav` (strummed steel guitar alone) as the query and `S4.wav` as the mixture:
   `set CONFIG_ROOT=./config` then
   `python train.py inference_byoq --ckpt_path=ev-pre-aug.ckpt --input_path=S4.wav --output_path=out\S4_guitar.wav --query_path=S3.wav --batch_size=4 --use_cuda=true`
   (batch size 4 instead of the README's 12 because the README says 12 "usually fits on a RTX 4090", which has more
   memory than the laptop's 4070).
5. Repeat with `--input_path=R2.wav` and the same query. Send back both outputs, the console text and the time.

## 4. Big RoFormer models on a whole song, on the GPU

Run here only on 10 s pieces of `S4` on the CPU (see `trials.md`); the whole song on a GPU gives the time a user
would wait. The same Python package as on the box, with the GPU build of PyTorch.

1. Install Python 3.11 from python.org (tick "Add python.exe to PATH").
2. In "Command Prompt": `py -3.11 -m venv sep` then `sep\Scripts\activate` then
   `pip install "audio-separator[gpu]"` (this pulls a CUDA PyTorch; if `audio-separator -e` later says CUDA is not
   available, install PyTorch with the command from https://pytorch.org for "Stable, Windows, Pip, CUDA").
3. Run, one after another, and time each:
   `audio-separator -m BS-Roformer-SW.ckpt --output_format WAV R2full.wav`
   `audio-separator -m BS-Roformer-SW.ckpt --output_format WAV S4.wav`
   `audio-separator -m model_bs_roformer_ep_317_sdr_12.9755.ckpt --output_format WAV R2full.wav`
   `audio-separator -m htdemucs_6s.yaml --output_format WAV R2full.wav`
   The first run of each model downloads it (about 700 MB, 640 MB and 55 MB).
4. Send back all output files, the console text of each run (it prints its own timings) and the Task Manager GPU
   screenshot.

## 5. `adityalakhani/htdemucs-6s-guitar-ft` (htdemucs_6s fine-tuned for guitar)

Not run here: its checkpoint is 330 MB, over the box's 200 MB download limit during the disk notice.

1. In the `sep` environment from item 4: `pip install demucs huggingface_hub`.
2. Download the files from https://huggingface.co/adityalakhani/htdemucs-6s-guitar-ft (the model card explains
   `inference.py`; read it first and follow its usage line).
3. Run it on `S4.wav`, `R2.wav` and `S2s.wav`. Send back the guitar stem (and any other stems it writes), the exact
   command and the time.

## 6. Demucs in the browser (WebGPU)

Not run here: the box has no GPU, and the `demucs-rs` README names Metal, Vulkan and WebGPU back ends only.

1. Open https://nikhilunni.github.io/demucs-rs/ in Chrome on the laptop (not opened by the research agents).
2. Load `S4.wav`, choose the 6-stem model (`htdemucs_6s`) if offered, run, and time it with a stopwatch. Then
   `R2full.wav` (the whole song).
3. Download the stems. Send back the files, the times, and a screenshot of `chrome://gpu` (top section).

## 7. MuS3D and ZeroSep (research systems)

Not run here: MuS3D's checkpoint repository is 19.2 GB and its README says "The DiT needs about 10 GB of free
memory"; ZeroSep runs diffusion models. Both are optional: only if Aaron wants to see blind stem discovery. Follow
the README of https://github.com/REMUS-Aalto/Mus3D (`bash inference.sh song.wav --separator bslocoformer`, which
does not use the 10 GB DiT) on `R2.wav`, and send back the output folder including `trace.txt`.
