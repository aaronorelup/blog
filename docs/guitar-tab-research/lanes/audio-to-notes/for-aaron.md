# Lane audio-to-notes: steps for Aaron

Written 2026-11-10 by `try-audio-to-notes`, checked and corrected the same day by `verify-trials-audio-to-notes`
(the changes are listed in the "Verification log" at the end of `trials.md`). These are the tools of this lane that
did not run on the cloud box (the reasons are in `trials.md`). Each entry says what to run on Aaron's Windows PC, in
the product's own app, or on its web page, which test clip to use, and what to send back.

**The clips.** Use the shared test clips by id. The audio files are on the research box under
`/home/user/gtr/inputs/<id>/<id>.wav` (PLAN.md has the orchestrator file the audio in the studio library; the truth
files are in `docs/guitar-tab-research/inputs/<id>/`). The ones used below:

- `S1.wav` single-note melody (nylon guitar, 30 s); `S2n.wav` two-voice fingerstyle (nylon, 29 s);
  `S3.wav` strummed chords (steel, 24 s); `S4.wav` band mix (39 s) and `S4/stems/lead.wav` (the lead line alone,
  called `S4lead.wav` below);
- `R1b.wav` real guitar solo (GuitarSet, 29 s); `R1c.wav` real bossa nova comping (GuitarSet, 28 s);
- `R2.wav` real band excerpt with singing (36 s, no truth).

**What to send back, for every tool** (put it in one folder per tool, named after the tool):

1. The output files exactly as the tool wrote them (MIDI `.mid`, CSV, JSON), renamed `<clip>.<tool>.<ext>`, for
   example `S2n.yourmt3.mid`.
2. How long each clip took (a stopwatch is fine) and on what (PC CPU, PC GPU, or the web service).
3. A screenshot of the settings you used and of the result.
4. The version number shown by the tool (in its About box, its download page, or its `--version` output).

The research agents then score the files against the truth with `gtr-eval`, the same way as the box runs.

What the entries have in common: a sign-in or download form, a GPU, a desktop app, a build or code run that the
trial session's permissions refused, or a download larger than the shared box's disk allowed.

---

## 1. YourMT3+ (multi-instrument transcription), in its web demo

Not run here: the demo refused the box's anonymous call for lack of free GPU quota ("You have exceeded your ZeroGPU
quota (90s requested vs. 79s left). Try again in 6:54:35. Authenticate with a Hugging Face token for more quota").

1. Sign in to Hugging Face at https://huggingface.co (the quota message above says "Authenticate with a Hugging Face
   token for more quota").
2. Open https://huggingface.co/spaces/mimbres/YourMT3 . Its page prints the model name (on 2026-11-10 the Space's
   `app.py` set `model_name = 'YPTF.MoE+Multi (noPS)'`).
3. In the `Upload audio` tab, load `S4.wav` and press `Transcribe`. Wait for the MIDI player to appear.
4. Click the `Download MIDI` link above the player (the Space's `html_helper.py` writes that link) and save the file
   as `S4.yourmt3.mid`.
5. Repeat with `S2n.wav`, `R1c.wav` and `R2.wav` (one at a time; each clip is under 40 s).
6. Send back the four `.mid` files, a screenshot of the page with the model name, and the time each one took.

If the quota runs out: the Space's page links a Colab notebook (its `app.py`, as written: "For acadmic reproduction
purpose, we strongly recommend to use [Colab Demo](https://colab.research.google.com/drive/1AgOVEBfZknDkjmSRA7leoa81a2vrnhBG?usp=sharing)
with multiple checkpoints."). That notebook was not opened by this lane.

Cost: the Space runs on ZeroGPU hardware (`zero-a10g`, Hugging Face API, 2026-11-10); this lane saw no price.

Added in gap round 1 (2026-11-10). The hosted-apis lane transcribed S2n and R1c through the CPU copy of the Space,
`mimbres/YourMT3-cpu` (runs r0164 and r0245 in its `trials.md`), so the web steps above are optional. What is still missing is a local
CPU run: on the box, running the Space's code was not attempted because the session's permission system refused
running code from cloned repositories twice in that round (MT3, mt3-pytorch; `trials.md`, "Tools not run here"). Its
default checkpoint is 561,544,628 bytes. If you want that timing on your PC (CPU, no GPU needed): the CPU Space
(https://huggingface.co/spaces/mimbres/YourMT3-cpu, commit bd69fbac) is a Gradio app (`sdk_version: 4.39.0`,
`app_file: app.py`) whose `app.py` sets `precision = '16' if torch.cuda.is_available() else '32'`. A coding agent on
the PC can clone it (`git clone https://huggingface.co/spaces/mimbres/YourMT3-cpu`, with Git LFS for the
checkpoints), install its `requirements.txt` plus `gradio==4.39.0`, start `python app.py`, transcribe `S2n.wav` and
`R1c.wav` in the browser page it opens, and note the seconds per clip and the CPU model. Send back the two `.mid`
files, the times and the CPU name. (That this works on Windows is UNVERIFIED; the ZeroGPU Space's own `app.py`
calls `model.to("cuda")`, so use the CPU Space.)

## 2. MT3 (Google Magenta multi-instrument transcription), in its official Colab notebook

Not run here: MT3 runs on JAX/T5X and its notebook copies the checkpoints from Google Cloud Storage
(`gs://mt3/checkpoints`); installing its stack was over the box's disk limit, and the community Space `akhaliq/MT3`
was in RUNTIME_ERROR. (corrected in gap round 1: the disk limit no longer applied. The notebook's install step, `pip
install ... -e .` of the cloned `magenta/mt3` repository with `jax[cpu]`, was refused by the session's permission
system ("[Code from External]"), and so was running the PyTorch port `kunato/mt3-pytorch` from its clone;
`trials.md`, "Tools not run here".) The Colab steps below are unchanged.

1. Open the notebook linked from MT3's README:
   https://colab.research.google.com/github/magenta/mt3/blob/main/mt3/colab/music_transcription_with_transformers.ipynb
   and sign in with a Google account. (The notebook says it "sends basic usage data to Google Analytics".)
2. Its own instructions: "Make sure to use a GPU runtime, click: Runtime >> Change Runtime Type >> GPU".
3. Run the cells from the top in order (the ▶ on the left of each cell): `Setup Environment`, `Imports and
   Definitions`, then `Load Model` with `MODEL` set to `mt3` (the notebook: "choose either `ismir2021` for piano
   transcription or `mt3` for multi-instrument transcription").
4. Run `Upload Audio` and choose `S4.wav`; run `Transcribe Audio` (the notebook: "it may take a few minutes depending
   on the length of the audio"); run `Download MIDI Transcription`, which downloads `transcribed.mid`. Rename it
   `S4.mt3.mid`.
5. Repeat step 4 for `S2n.wav` and `R1c.wav`. If time allows, run `Load Model` again with `ismir2021` and transcribe
   `S2n.wav` once more (name it `S2n.mt3-ismir2021.mid`).
6. Send back the `.mid` files, a screenshot of the `Load Model` cell, and how long `Transcribe Audio` took per clip.

Cost: not checked by this lane (whether a GPU runtime is offered on the Colab tier used on the day is UNVERIFIED).

## 3. NeuralNote (desktop app and plugin)

Not run here: it is a desktop plugin and standalone app, and its README describes no command-line use (README, read
2026-11-10). The README says v2 transcribes with MuScriptor models that are downloaded from within NeuralNote the
first time it is opened ("about 210 MB for `small`, 620 MB for `medium` and 2.7 GB for `large`") and that "A GPU is
strongly recommended for the `medium` and `large` models".

1. Download `NeuralNote_Installer_Windows_x64.exe` from https://github.com/DamRsn/NeuralNote/releases (the README:
   "It is not code signed, so Windows may warn you before running it for the first time").
2. Install it and open the Standalone app. Download the `small` model when the app offers the models (and `medium`
   for a second run if you like). Note the device shown under Settings > Compute device (Auto, a GPU, or the CPU).
3. Drop `S2n.wav` on the window. In the left panel select the instrument (guitar), or `Automatic`. Click
   `Transcribe`.
4. When it finishes, save the MIDI file (README: "save the MIDI file to your computer"). Note which model size was
   used.
5. Repeat with `S4.wav` (`Automatic`) and `R1c.wav` (guitar).
6. Send back the `.mid` files, a screenshot of the window after each transcription, the compute device, and the time
   each took.

## 4. CREPE (the original TensorFlow package)

Not run here: it needs TensorFlow (the 2.15.0 Linux wheel for Python 3.11 is 475,258,658 bytes), over the box's
disk limit. The same CREPE weights did run here through torchcrepe and through Essentia's CREPE models. (corrected in
gap round 1: the disk limit no longer applied. PyPI has crepe 0.0.16 only as a source archive, and building it on the
box stopped first with "ModuleNotFoundError: No module named 'pkg_resources'" and, with `setuptools<81`, with "HTTP
Error 403: Forbidden" when its `setup.py` downloaded the weights from `https://github.com/marl/crepe/raw/models/`,
an address the box cannot reach; installing the source with the weights put in place by hand was refused by the
session's permission system. `trials.md`, "Tools not run here".)

1. Install Python 3.11 from https://www.python.org/downloads/windows/ (tick "Add python.exe to PATH").
2. Open "Command Prompt" and type: `py -3.11 -m pip install crepe tensorflow`. crepe's `setup.py` downloads its
   five weight files from github.com during this install, so the PC needs to reach github.com. If the install stops
   with "No module named 'pkg_resources'" (what happened on the box), run `py -3.11 -m pip install "setuptools<81"
   wheel` and then `py -3.11 -m pip install --no-build-isolation crepe` (this second route was not tried on the box:
   UNVERIFIED).
3. Put `S1.wav` and `R1b.wav` in one folder, `cd` into it, and run each file with both model sizes (the README's
   form, `python -m crepe audio_file.wav`, and its `--model-capacity {tiny|small|medium|large|full}` option):
   `py -3.11 -m crepe S1.wav --model-capacity tiny`, rename the `S1.f0.csv` it writes to `S1.crepe-tiny.f0.csv`, then
   `py -3.11 -m crepe S1.wav --model-capacity full` and rename to `S1.crepe-full.f0.csv`; the same for `R1b.wav`.
   (The README's default step is 10 ms; `--viterbi` adds "Viterbi smoothing" and can be a third run if time allows.)
4. Per the README each run writes `<name>.f0.csv` (columns `time,frequency,confidence`) next to the file.
5. If it stops with a TensorFlow or Keras error, run `py -3.11 -m pip install "tensorflow<2.16"` and try again
   (which TensorFlow versions crepe 0.0.16 works with was not checked here).
6. Send back the four `.f0.csv` files, the output of `py -3.11 -m pip show crepe tensorflow` (versions), any error
   text, and the time each run took.

## 5. MELODIA (Vamp plugin), with its Linux build under WSL2

Not run here: the download page (https://www.upf.edu/web/mtg/melodia) answered the box with HTTP 403 (a Cloudflare
"Just a moment..." page). The docs lane read the page earlier the same day: the download is behind a "DOWNLOAD FORM"
and the plug-in "is offered free of charge for non-commercial use only". The same algorithm ran here inside Essentia
(`PredominantPitchMelodia`).

Why the Linux build: on the docs lane's saved copy of that page, the Windows build needs the "Microsoft Visual C++
2010 Redistributable Package (x86)" and goes into "C:\Program Files (x86)\Vamp Plugins\" on a 64-bit Windows, while
the Sonic Visualiser download page (5.2.1, read 2026-11-10) offers Windows (64-bit) only. Whether that Windows plugin
loads in a 64-bit Vamp host was not tested (UNVERIFIED). The page's Linux file is "MTG-MELODIA 1.0 (Linux
32/64-bit).zip", to be copied to `/usr/local/lib/vamp`.

1. Open an Ubuntu window under WSL2 (Microsoft Store: "Ubuntu") and run `sudo apt install vamp-examples unzip`. This
   gives the command-line host `vamp-simple-host` (on the research box, Ubuntu 24.04, package `vamp-examples`
   2.10.0; its default plugin search path includes `/usr/local/lib/vamp`).
2. Fill in the MTG download form, download the Linux zip, unzip it, and copy the files it contains:
   `sudo mkdir -p /usr/local/lib/vamp && sudo cp <the unzipped files> /usr/local/lib/vamp/`.
3. Run `vamp-simple-host -l`: the MELODIA plugins must be listed. Copy `S4.wav`, `S4lead.wav` and `R2.wav` into the
   Ubuntu home folder.
4. Once per clip: `vamp-simple-host mtg-melodia:melodia S4.wav -o S4.melodia.txt` (the plugin key
   `mtg-melodia:melodia` is the one the MELODIA author's script `audio_to_midi_melodia.py` uses; with no output named,
   `vamp-simple-host` writes the plugin's first output).
5. Send back the three `.txt` files, the text printed by `vamp-simple-host -l`, and any error text.

## 6. pYIN notes (Vamp plugin) through Tony

Not run here: building the pYIN Vamp plugin from its source was refused by the trial session's permission settings
(code from an external source). Tony is the desktop app built on pYIN that shows the pitch track and the notes (its
page: "a free, open-source application for Windows, Linux, and Mac").

1. Install Tony for Windows from https://www.sonicvisualiser.org/tony/ (the source is `sonic-visualiser/tony`).
2. Open `S1.wav`. Tony analyses it on opening (its page: "Tony automatically analyses the" audio) and shows the pitch
   curve and the note blocks.
3. Menu File > `Export Note Data...` ("Export note data to a CSV, RDF, layer XML, or MIDI file"; choose CSV), then
   File > `Export Pitch Track Data...` (CSV). The menu names are from Tony's source, `main/MainWindow.cpp`, read
   2026-11-10.
4. Repeat with `R1b.wav` and `S4lead.wav`.
5. Send back the note and pitch CSV files, the Tony version (from its About box), and a screenshot of `S1.wav` in Tony.

## 7. Omnizart (music and vocal transcription)

Not run here: Omnizart 0.6.3 requires TensorFlow (`tensorflow>=2.5.0` for Python below 3.14, PyPI metadata), over
the box's disk limit, so no install attempt was made. Whether it installs on Windows is UNVERIFIED (it also depends
on madmom, whose only PyPI files are source archives, and on vamp). (corrected in gap round 1: one install attempt
was made on the box, Omnizart 0.5.0 with its pinned `tensorflow==2.5.0` on Python 3.8, and it stopped while building
`vamp` 1.1.0 from source: "ModuleNotFoundError: No module named 'numpy'"; `trials.md`, "Tools not run here". On the
PC the same can happen with `vamp` or `madmom`; send the error text if it does.)

Colab route (the README's badge link):
https://colab.research.google.com/github/Music-and-Culture-Technology-Lab/omnizart/blob/master/colab.ipynb (the README
also links a Replicate page, not opened here). The notebook's upload cell is titled `Upload MP3 File` and converts the
upload from MP3 with ffmpeg, so convert the clips to MP3 first (for example `ffmpeg -i S2n.wav -b:a 320k S2n.mp3`).
Its `Environment Setup` cell installs Python 3.8 with apt; whether that still works on the current Colab is
UNVERIFIED.

1. Run `Environment Setup` (the notebook: "Don't restart the session when the pop up window ask you to! Just press
   cancel and continue."), then `Upload MP3 File` with `S2n.mp3`.
2. In `Transcribe`, set `mode` to `music-piano` (the notebook: "transcribe piano solo clips"), run it, then run
   `Download MIDI`; run `Transcribe` again with `music-assemble` ("transcribe classical assemble pieces") and download
   again. The notebook's mode list has no guitar entry.
3. Repeat with `S4.mp3` (`music-assemble`) and `R2.mp3` (`vocal`).
4. Send back the `.mid` files, named with the mode, and any error text.

Local route (README commands), if the Colab setup fails: install Python 3.11 as in entry 4, step 1; in Command
Prompt `py -3.11 -m pip install omnizart`, then `omnizart download-checkpoints`, then in the folder with the clips
`omnizart music transcribe S2n.wav`, `omnizart music transcribe S4.wav` and `omnizart vocal transcribe R2.wav`. Send
back the `.mid` files it writes, the full text of any error, and `py -3.11 -m pip show omnizart`. If the install
fails, send the error text: that is a result too.

## 8. Sheet Sage (lead sheet: melody and chords)

Not run here: its README says "ensure you are running Linux and have Docker installed", and the one-time setup
downloads "a ~4GB Docker container"; its Jukebox mode needs "a GPU w/ at least 12GB memory and CUDA installed", so
with a smaller GPU only the default mode applies. Its models are CC BY-NC-SA 3.0 (README).

1. The README covers Linux only. On Windows the nearest setup is WSL2 with Ubuntu (Microsoft Store: "Ubuntu") and
   Docker Desktop with the WSL2 backend; that Sheet Sage works that way is UNVERIFIED.
2. In the Ubuntu window run the README's one-time setup:
   `ROOT=https://raw.githubusercontent.com/chrisdonahue/sheetsage/main; wget $ROOT/prepare.sh && wget $ROOT/sheetsage.sh && chmod +x *.sh && ./prepare.sh`
3. Copy `R2.wav` and `S4.wav` into the Ubuntu home folder and run `./sheetsage.sh R2.wav` and
   `./sheetsage.sh --beats_per_minute_hint 116 S4.wav` (S4 is 116 BPM in its truth file; the README gives
   `--beats_per_minute_hint` for a tempo detected at twice or half the real one).
4. Send back the `output/<UUID>` folder of each run (README: "a PDF with the lead sheet (along with the corresponding
   LilyPond file), and a MIDI file containing audio-aligned melody and harmony") and the time each took.

## 9. RMVPE (pitch tracker)

Nothing to do: it ran on the box in gap round 1 (`rmvpe-onnx` 0.2.3 with `rmvpe.onnx`, runs r0516 and r0517;
`trials.md`, "Gap round 1"). The old reason (the per-download disk limit) no longer applies. The `--help` question is
answered there: `rmvpe-onnx predict` writes a file only with `--csv <path>` (columns `time,frequency,confidence`)
and otherwise prints a summary; `--plot` also shows an interactive plotly figure (its `--help`: "Show an interactive
pitch plot after inference").

## 10. Timbre-Trap (multi-pitch), MR-MT3, hFT-Transformer, Onsets and Frames: research code

These need a programmer's setup (git, Python, the repositories' own scripts). Not run here: Timbre-Trap's code and
checkpoint (`tt-orig.pt`, 11,353,410 bytes, from the Space `cwitkowitz/timbre-trap`, which was in RUNTIME_ERROR)
were downloaded, but running the cloned repository and loading its pickled checkpoint was refused by the trial
session's permission settings; MR-MT3's README installs TensorFlow 2.11, t5 0.9.3 and ddsp (over the disk limit);
hFT-Transformer is a piano model whose README lists GPU machines and whose checkpoints are CC BY-NC-SA 4.0 (two piano
models, Transkun and ByteDance, ran here instead); Onsets and Frames lives in the `magenta/magenta` repository, which
the docs lane reports as archived. One concrete job: have a coding agent on the PC run Timbre-Trap's
`model.transcribe()` on `S2n.wav`, `S3.wav` and `R1c.wav` with the README's settings and save the multi-pitch frames
as JSON in the layout of this lane's Essentia multi-pitch outputs (`{"times": [...], "freqs_hz": [[...], ...]}`);
send back those files. The others are optional.

Corrected in gap round 1 (2026-11-10): MR-MT3's disk reason no longer applies; it was not attempted because the
session's permission system refused running code from cloned repositories twice in that round (MT3's install and the
PyTorch port `kunato/mt3-pytorch`), and its `inference.py` calls `.cuda()` without a device check. Onsets and Frames
now has its own entry in `trials.md` ("Gap round 1"): Magenta's MAESTRO checkpoint with Magenta's own transcribe
script, from the PyPI package `magenta` 2.1.4 (the PyTorch port publishes no checkpoint). Two more optional coding-agent
jobs on the PC, both with a CUDA GPU or with the code changed to run on the CPU: (a) MR-MT3: clone
https://github.com/gudgud96/MR-MT3, take `mt3.pth` or `slakh_f1_0.65.pth` from the Hugging Face repo
`gudgud1014/MR-MT3`, run `InferenceHandler(...).inference(...)` from `inference.py` on `S2n.wav`, `S4.wav` and
`R1c.wav`; (b) mt3-pytorch: clone https://github.com/kunato/mt3-pytorch (its `pretrained/mt3.pth` is a Git LFS file
of 183,672,643 bytes) and run the README's `InferenceHandler('./pretrained').inference('<clip>.wav')` on the same
clips; its `requirements.txt` pins `ddsp==3.3.4`, whose dependency `crepe` downloads weights from github.com at
install time. Send back the `.mid` files, the time per clip and the GPU or CPU used.

## 11. MuScriptor (Kyutai and Mirelo), new in the docs lane's survey

Not run here: the weights are gated on Hugging Face (`MuScriptor/muscriptor-small`: `gated: auto`, sign-in and
acceptance), and no Hugging Face token was available on the box. NeuralNote v2 (entry 3) uses MuScriptor models, so
entry 3 covers it in an app. The docs lane reports a hosted UI at https://muscriptor.kyutai.org (named in
MuScriptor's README; not opened by this lane): if it is open, upload `S4.wav`, `S2n.wav` and `R1c.wav` and send back
the MIDI (and MusicXML or tab PDF, if offered) with a screenshot of the settings.

## 12. PENN (FCNF0++ pitch tracker), new in the docs lane's survey

Not run here: it installed, but `import penn` failed because its decoder package torbi 1.4.1 ships compiled files
only for torch 2.6 to 2.11 and the box's torch is 2.15 ("Could not find any lib files matching version pt215cpu";
run r0399, reproduced by the verifier in run r0423). The torbi 1.4.1 Windows wheel holds compiled files for the same
torch versions (`_C.pt26cpu.pyd` to `_C.pt211cu130.pyd`, listed by the verifier).

1. With Python 3.11 installed: `py -3.11 -m pip install "torch<2.12" "torchaudio<2.12" penn`
   (keeps torch at a version torbi has files for).
2. In the folder with `S1.wav`, `R1b.wav` and `S4lead.wav`, run the README's command line on the CPU (the README:
   "--gpu GPU The index of the gpu to perform inference on. Defaults to CPU"):
   `py -3.11 -m penn --files S1.wav R1b.wav S4lead.wav`. On the box the package fetched its checkpoint
   (107,245,425 bytes, Hugging Face `maxrmorrison/fcnf0-plus-plus`) on first use. Adding `--gpu 0` needs a CUDA
   build of torch; whether the command in step 1 installs one on Windows is UNVERIFIED.
3. Send back the files it writes next to each WAV (`S1-pitch.pt` and `S1-periodicity.pt` and so on, PyTorch tensor
   files, per `penn/core.py`), the output of `py -3.11 -m pip show penn torbi torch`, any error text, and the time
   each file took.
