# fingerstyle-voices-taps: steps for Aaron

These are the tools of this lane that did not run on the research box, with the reason in `trials.md`. Each list is
written step by step for a Windows PC with an NVIDIA GPU. The clips are the shared test clips (on the research box in
`/home/user/gtr/inputs/`; the audio is not in git, so ask the orchestrator for a copy). Every clip id below (S6taps,
S2s, R3a ...) is a folder there; `<inputs>` below means wherever that folder is on your PC.

Common setup used by several lists (do it once):

1. Install Python 3.11 for Windows from https://www.python.org/downloads/windows/ (tick "Add python.exe to PATH" on
   the first screen).
2. Install Git for Windows from https://git-scm.com/download/win (all defaults).
3. Open "Terminal" (Windows key, type Terminal, Enter). Every line in a grey box below is typed there and run with
   Enter.
4. Make a work folder: `mkdir C:\gtr` then `cd C:\gtr`.
5. For PyTorch with your GPU, the command on https://pytorch.org/get-started/locally/ for "Stable, Windows, Pip,
   Python, CUDA 12.x" is the one to use where a list below says "install PyTorch".

What to send back, every time: the output files named in the list, a screenshot of the Terminal window after the
run (it shows errors and timings), and how many seconds the run took. To time a command, put
`Measure-Command { ... }` around it and note `TotalSeconds`, for example
`Measure-Command { adtof --audio <inputs>\S6taps\S6taps.wav --out S6taps_mix.mid --device cuda }`.

## 1. ADTOF-pytorch (drum transcription on the taps)

Not run here: this session's permission policy refused both installing the cloned repository and running its source
(trials.md, "ADTOF-pytorch").

1. In Terminal: `cd C:\gtr`, then `git clone https://github.com/xavriley/ADTOF-pytorch`, then `cd ADTOF-pytorch`.
2. `python -m venv venv` then `venv\Scripts\activate` (the prompt now starts with `(venv)`).
3. Install PyTorch (common setup step 5), then `pip install -e .` (the README's install line).
4. Run it on four files, one line each (replace `<inputs>` with the folder path of the shared clips; the form is
   the README's `adtof --audio input.wav --out output.mid ... --device cuda`):
   - `adtof --audio <inputs>\S6taps\S6taps.wav --out S6taps_mix.mid --device cuda`
   - `adtof --audio <inputs>\S6taps\stems\taps.wav --out S6taps_tapsonly.mid --device cuda`
   - `adtof --audio <inputs>\S2s\S2s.wav --out S2s_notaps.mid --device cuda`
   - `adtof --audio <inputs>\R3a\R3a.wav --out R3a.mid --device cuda`
5. Send back: the four `.mid` files, the screenshot, the seconds (timing as in the note at the top). Run time: no
   figure in its README; not measured here. No cost. License note: the repository has no license file; the weights
   are converted from ADTOF, whose README says "The content of this repository is licensed under a Creative Commons
   Attribution-NonCommercial-ShareAlike 4.0 International License" (survey.md).

## 2. ADTOF, original Keras version (same model family)

Not run here: in gap round 1 (23:16 UTC) the install from its repository, `uv pip install "tensorflow==2.15.1"
"adtof @ git+https://github.com/MZehren/ADTOF@b3968fb..."`, was refused by the session's permission system ("[Code
from External]") (trials.md, "Gap round 1"). (The first round's reason, TensorFlow 2.12.1 on the box and the disk
notice, no longer applies.)

1. Open the Colab notebook linked in the README of https://github.com/MZehren/ADTOF ("The easiest way to test the
   trained model is our Colab Notebook", per its README). It needs a Google account.
2. In Colab, upload `S6taps.wav`, `stems\taps.wav` (rename it `S6taps_taps.wav`), `S2s.wav` and `R3a.wav` with the
   folder icon on the left.
3. Follow the notebook's cells, pointing its audio path at each file in turn.
4. Send back: the MIDI or text file each run writes (download from the folder pane), and a screenshot of the last
   cell's output. No cost (free Colab). License: CC BY-NC-SA 4.0 per the README.
5. Local alternative (what was refused here): Python 3.10, `git clone https://github.com/MZehren/ADTOF`, `cd ADTOF`,
   `python -m venv venv`, `venv\Scripts\activate`, `pip install "tensorflow==2.15.1"` then `pip install .` (the
   README's line; `setup.py` asks for `tensorflow>=2.13.0` and installs madmom and tapcorrect from GitHub). Then in
   `python`, the two cells of `bin/drumTranscriptor.ipynb`:
   `from adtof.model.model import Model`,
   `model, hparams = Model.modelFactory(modelName="Frame_RNN", scenario="adtofAll", fold=0)`,
   `model.predictFolder(r"<inputs>\S6taps\*.wav", r"C:\gtr\adtof_out", **hparams)`; the same with
   `<inputs>\S6taps\stems\taps.wav` and `<inputs>\S2s\S2s.wav`. Send back the `.mid` files in `C:\gtr\adtof_out`.

## 3. Omnizart drum mode

Not run here: in gap round 1 (23:18 UTC) the install `uv pip install "omnizart==0.6.3" "tensorflow==2.15.1"
"tf-keras==2.15.1"` (PyPI, Python 3.10) was refused by the session's permission system before it ran (trials.md, "Gap
round 1"). (The first round's reason, no TensorFlow on the box and the disk notice, no longer applies.)

1. `cd C:\gtr`, `python -m venv omnizart-venv`, `omnizart-venv\Scripts\activate` (Python 3.10 or 3.11; the current
   release 0.6.3 asks for `tensorflow>=2.5.0` and `tf-keras` on Python below 3.14).
2. `pip install omnizart` then `omnizart download-checkpoints` (both lines are in its README). Two of its
   dependencies, madmom 0.16.1 and vamp 1.1.0, are source packages whose `setup.py` imports NumPy (madmom also
   Cython) without declaring it (read here, not built here). If `pip install omnizart` stops while building one of them
   with "No module named 'numpy'" or "No module named 'Cython'", run `pip install "numpy<2" "Cython<3" setuptools
   wheel` and then `pip install --no-build-isolation omnizart`. Building them needs a C/C++ compiler (on Windows,
   "Microsoft C++ Build Tools"). The README also offers a Docker image, `docker pull mctlab/omnizart:latest`.
3. `omnizart drum transcribe <inputs>\S6taps\S6taps.wav -o S6taps_omnizart.mid` (`-o` / `--output` is the output
   option of the transcribe command in its source), then the same for `<inputs>\S6taps\stems\taps.wav`
   (`-o S6taps_tapsonly_omnizart.mid`), `<inputs>\S2s\S2s.wav` (`-o S2s_omnizart.mid`) and `<inputs>\R3a\R3a.wav`
   (`-o R3a_omnizart.mid`).
4. Send back: the four `.mid` files, the screenshot, the seconds. The README warns "Currently, Omnizart is
   **incompatible for ARM-based MacOS** system"; it says nothing about Windows. If `pip install omnizart` fails, send
   the last 30 lines of the error.

## 4. Cluster and Separate (piano_svsep), GNN voice and staff separation

Not run here: in gap round 1 (23:25 UTC) the install of the clone into its own venv, `uv pip install --find-links
https://data.pyg.org/whl/torch-2.8.0+cpu.html ./piano_svsep`, was refused by the session's permission system ("[Code
from External]") (trials.md, "Gap round 1"). (The first round's reason, the disk notice against a second torch
version, no longer applies.) Its `predict.py` reads the score with partitura (`pt.load_score`; "Partitura can handle
different formats such as musicxml, mei, etc.") and writes MEI for a `--save_path` ending in `.mei` or MusicXML for one
ending in `.musicxml`.

1. `cd C:\gtr`, `git clone https://github.com/CPJKU/piano_svsep`, `cd piano_svsep`, `python -m venv venv`,
   `venv\Scripts\activate`.
2. Install PyTorch (common step 5), then `pip install .` (the README's install line). Its `setup.py` lists
   `torch==2.8.0`, `torch_geometric`, `torch-scatter`, `partitura==1.8.0` and `scikit-learn==1.6.0`, so pip replaces
   any other torch version with 2.8.0; picking 2.8.0 in step 5 (pytorch.org lists older versions under "Previous
   PyTorch Versions") avoids that.
3. Copy `S2n_truth_merged_single_track.musicxml` from this folder's `samples/voice-split/` into `C:\gtr\piano_svsep`.
   It holds the S2n notes as one part; it carries music21's own voice numbers (1 and 2) where music21 split
   overlapping notes, made without the truth labels. The README says the input may have "potentially random voice
   and staff assignments".
4. `python launch_scripts/predict.py --model_path pretrained_models/model.ckpt --score_path S2n_truth_merged_single_track.musicxml --save_path S2n_pred.mei`
   (the README's command with these file names).
5. Send back: `S2n_pred.mei` and the screenshot. The orchestrator scores which notes went to which voice and staff.

## 5. McLeod and Steedman voice separation (Java)

Not run here: compiling the cloned repository was refused by this session's permission policy when the verifier
tried it (trials.md).

1. Install a Java JDK (for example Temurin 21 from https://adoptium.net/).
2. Open "Git Bash" (installed with Git for Windows; Windows key, type Git Bash, Enter). Then:
   `cd /c/gtr`, `git clone https://github.com/apmcleod/voice-splitting`, `cd voice-splitting`.
3. Build: the repository's `Makefile` runs these three lines, which can be typed in Git Bash as they are:
   `mkdir -p bin`, `javac -d bin -cp src src/*/*/*.java`, `javac -d bin -cp src src/*/*/*/*.java`.
4. Copy `S2n_truth_merged_single_track.mid` from this folder's `samples/voice-split/` into `/c/gtr/voice-splitting`,
   then run the README's quick-start command:
   `java -cp bin voicesplitting.voice.hmm.HmmVoiceSplittingModelTester -w voice S2n_truth_merged_single_track.mid`
   (it writes the voices as new MIDI files into the folder `voice`).
5. Send back: the files in the `voice` folder and the screenshot.

## 6. ADT_STR (drum transcription, 2026)

Not run here: in gap round 1 (23:20 UTC) its README's install, `uv pip install -r pyproject.toml` into a Python 3.12
venv, was refused by the session's permission system ("[Code from External]") (trials.md, "Gap round 1"). Its weights
are 289 MB per variant on Hugging Face and its install brings its own PyTorch stack (`torch==2.8.0`). On a machine
without CUDA it runs on the CPU by itself (`select_inference_device()`: "Prefer CUDA, then Apple MPS, else CPU.").

1. `cd C:\gtr`, `git clone https://github.com/pier-maker92/ADT_STR`, `cd ADT_STR`.
2. Follow the README: it uses `uv` (`pip install uv`, then `uv venv .venv --python 3.12` and
   `uv pip install -r pyproject.toml`), then `.venv\Scripts\activate`. Its `pyproject.toml` pins `torch==2.8.0` and
   `torchaudio==2.8.0` and lists `huggingface-hub`.
3. The README's checkpoints (`setting-tau-0.4`, `0.6`, `0.8`) are not in the GitHub repository; they are in the
   Hugging Face repository `Pierfrancesco/adt-str`, folder `setting-tau-0.8` (`model.safetensors`, 289,134,056 bytes,
   plus `config.json` and `adt_config.yaml`). Download them with
   `python -c "from huggingface_hub import snapshot_download; snapshot_download('Pierfrancesco/adt-str', allow_patterns=['setting-tau-0.8/*'], local_dir=r'C:\gtr\adt-str-hf')"`.
4. For each of `S6taps.wav`, `stems\taps.wav`, `S2s.wav`, `R3a.wav` run the README's command with the downloaded
   folder as the checkpoint (the README says the checkpoint "can be either ... a local checkpoint name under
   `checkpoints/` ... [or] a direct path to a checkpoint directory"):
   `python inference --checkpoint C:\gtr\adt-str-hf\setting-tau-0.8 --input <file> --output_path outputs`
   (`inference` is a file in the repository, next to `inference.py`).
5. Send back: the MIDI files from `outputs` and the screenshot. License: CC BY-SA 4.0 per its GitHub README.

## 7. Inverse Drum Machine (drum separation with a manual onset override)

Not run here: cloned repository (list 1). Of interest for the app because its README says "To override the
transcription, you can pass a dictionary with the onsets to the `separate` function".

1. `cd C:\gtr`, `git clone https://github.com/bernardo-torres/inverse-drum-machine`, `cd inverse-drum-machine`.
2. Its README asks for a Python 3.10+ environment and Poetry: install Poetry as the README's link
   https://python-poetry.org/docs/ describes, then run `poetry install` in this folder. The pretrained model
   `idm-44-train-kits` is inside the repository (`pretrained/idm-44-train-kits/`).
3. Make a file `run_idm.py` in that folder (Notepad, save as "All files") with the README's two examples combined,
   the S6taps path filled in, and the override filled from the `taps` list of `S6taps.truth.json` (`thump` as `KD`,
   `slap` as `SD`):

   ```python
   import torch
   from idm.inference import load_model, separate
   device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
   model, name = load_model('idm-44-train-kits', device, log_dir="pretrained")
   print(model.train_classes)
   audio = r"<inputs>\S6taps\S6taps.wav"
   separate(audio, model, output_dir=r"C:\gtr\idm_out\as_is", masking='wiener', alpha=1.0)
   onsets = {
       'KD': [2.143, 6.161, 10.446, 10.714, 14.732, 19.018, 19.286, 23.304],
       'SD': [2.679, 3.75, 4.821, 5.893, 6.964, 8.036, 9.107, 10.179, 11.25, 12.321, 13.393, 14.464, 15.536,
              16.607, 17.679, 18.75, 19.821, 20.893, 21.964, 23.036, 24.107, 25.179, 26.25, 27.321],
   }
   separate(audio, model, output_dir=r"C:\gtr\idm_out\override", masking='wiener', alpha=1.0, onsets=onsets)
   ```

   (`separate` writes its stems to `output_dir` by default: `save_to_disk: bool = True` in `idm/inference.py`.)
4. `poetry run python run_idm.py`
5. Send back: the stem WAVs in `C:\gtr\idm_out` (they go to your studio library, not git), the printed class list
   and the screenshot.

## 8. A real recording with body taps (no clip in the shared set has one)

One freely licensed candidate was found but could not be downloaded from the box, and one more file is listed
whose content is unknown:

1. Freesound sound 674811, "guitar body kick" by leaving.february, "Sound when hitting acoustic guitar body with a
   thumb in 105bpm", 18.285 s, WAV 44.1 kHz 24-bit stereo, license "Creative Commons 0" (page read 2026-11-10;
   https://freesound.org/people/leaving.february/sounds/674811/). The box got HTTP 403 from freesound.org and the
   download link needs a login. Steps: log in to Freesound (free account), open the page, press Download, send back
   the WAV.
2. Wikimedia Commons "File:Erik Mongrain-AirTap.ogv", 180.2 s, 320x240, license "CC BY-SA 2.5". Its description
   says "Erik Mongrain demonstrating the lap-tapping technique with his song AirTap!" (notes tapped on the fretboard
   with the guitar on the lap); it does not mention hits on the guitar body, and whether the video has any was not
   checked (the file could not be downloaded). The box got HTTP 429 (too many requests) from upload.wikimedia.org. Steps: open
   https://commons.wikimedia.org/wiki/File:Erik_Mongrain-AirTap.ogv , use "Download" on the right, send back the file.

With either file back, the orchestrator can run this lane's HPSS, onset and Demucs-drums steps on it.

## 9. LarsNet (5-stem drum separation: kick, snare, toms, hi-hat, cymbals)

Not run here: in gap round 1 its dependencies installed, but running its `separate.py` was refused by the session's
permission system ("[Code from External]", 23:22 UTC), so its 562 MB checkpoint was not downloaded (trials.md, "Gap
round 1"). (The first round's reason, the disk notice, no longer applies.)

1. `cd C:\gtr`, `git clone https://github.com/polimi-ispl/larsnet`, `cd larsnet`, `python -m venv venv`,
   `venv\Scripts\activate`, install PyTorch with torchaudio (common step 5), then `pip install soundfile pyyaml tqdm`.
   (The README lists no install command; the repository's `requirements.txt` is a conda export for "platform:
   linux-64". The packages above are what `separate.py`, `larsnet.py` and `unet.py` import besides torch and
   torchaudio.)
2. Download the checkpoints from the Google Drive link in its README (562 MB, "licensed under CC BY-NC 4.0"). The
   README says: "unzip the folder and place it in the project directory".
3. Make a folder `C:\gtr\larsnet_in` and copy into it: `S6taps\stems\taps.wav` (rename `S6taps_taps.wav`) and, if the
   orchestrator gives it to you, the Demucs drums stem of S6taps (`htdemucs_6s\S6taps\drums.wav` from the
   source-separation lane, rename `S6taps_htdemucs6s_drums.wav`).
4. `python separate.py -i C:\gtr\larsnet_in -o C:\gtr\larsnet_out -d cuda:0` (the README's options).
5. Send back: the folder `C:\gtr\larsnet_out` (audio goes to your studio library, not git) and the screenshot. The
   question it answers: does the side-stick "slap" land in Snare and the bass-drum "thump" in Kick Drum.

## 10. drumsep (Demucs-based 4-stem drum separation)

Not run here: in gap round 1 the checkpoint `49469ca8.th` (167,400,043 bytes, Google Drive id
`1-Dm666ScPkg8Gt2-lK3Ua0xOudWHZBGC`) was downloaded and a Demucs 4.1.0 environment built, but running
`demucs --repo model -o <out> -n 49469ca8 <file>` (the one command of its `drumsep` script) was refused by the session's
permission system ("[Code from External]", 23:24 UTC) (trials.md, "Gap round 1"). Its four stems are named `bombo`,
`redoblante`, `platillos`, `toms` inside the checkpoint.

1. The README's no-install route: its "drumsep Notebook" link (Google Colab, needs a Google account). Upload
   `S6taps\stems\taps.wav` and, if the orchestrator gives it to you, the source-separation lane's htdemucs_6s drums
   stem of S6taps (`htdemucs_6s\S6taps\drums.wav`, renamed `S6taps_htdemucs6s_drums.wav`) there, run the cells,
   download the four WAVs of each.
2. The README's command-line route is written "With Linux": clone `https://github.com/inagoy/drumsep`, then
   `bash drumsepInstall`, then `bash drumsep "<PATH_IN>" "<PATH_OUT>"`. On Windows that needs a Linux shell such as
   WSL; it has not been tried in Git Bash. The scripts only do this, which also works in Terminal: `pip install
   demucs`, put the file from https://drive.google.com/uc?id=1-Dm666ScPkg8Gt2-lK3Ua0xOudWHZBGC (`49469ca8.th`) into
   a folder `model`, then `demucs --repo model -o drumsep_out -n 49469ca8 <file>` for each input.
3. Send back: the four WAVs it writes per input (`bombo` = kick, `redoblante` = snare, `platillos` = cymbals, `toms`)
   and the screenshot. The orchestrator measures the level of each stem and which stem holds the side-stick "slap" and
   the bass-drum "thump" times of `S6taps.truth.json`.

## 11. Deep Salience (bass line and melody salience from audio)

Not run here: its `replicate.yaml` pins Python 2.7.15 and TensorFlow 1.12.0; the box has no Python 2.7.

1. Install Docker Desktop for Windows (https://www.docker.com/products/docker-desktop/), start it.
2. Copy `S2n.wav` and `S2s.wav` into `C:\gtr`. In Terminal: `cd C:\gtr`,
   `git clone https://github.com/rabitt/ismir2017-deepsalience`, then
   `docker run -it --rm -v C:\gtr:/work python:2.7 bash`.
3. Inside that window: `pip install tensorflow==1.12.0 keras==2.0.3 librosa==0.5.0` (the versions in its
   `replicate.yaml`), then `mkdir -p /work/ds_out` (the script does not create its output folder), then
   `cd /work/ismir2017-deepsalience/predict` (the script loads `weights/<task>.h5` relative to the current folder,
   and the weights are in `predict/weights/`), then
   `python predict_on_audio.py /work/S2n.wav bass /work/ds_out -f singlef0` and the same with `melody2` instead of
   `bass`; repeat for `/work/S2s.wav`.
4. Send back: the CSV files in `C:\gtr\ds_out` and the screenshot. If step 3's install fails, send the error lines.

## 12. Magenta Onsets and Frames, drums checkpoint (E-GMD)

Not run here: needs the Magenta package (repository "currently inactive (archived, read only)"), whose last PyPI
release, 2.1.4 from 2022-08-01, pins `tensorflow==2.9.1`; no venv on the box has that version (trials.md).

1. Its README links an "Onsets and Frames Colab Notebook" "for both piano and drum transcription models"
   (https://github.com/magenta/magenta/tree/main/magenta/models/onsets_frames_transcription). Open it in Google Colab
   (free, needs a Google account) and choose the drums model there; the README's drums checkpoint is
   `e-gmd_checkpoint.zip` (25,658,703 bytes) and its command uses `--config="drums"`.
2. Run it on `S6taps.wav`, `stems\taps.wav` and `S2s.wav`.
3. Send back: the MIDI files and a screenshot of the cell output. If the environment setup fails in Colab, send the
   error; the package is from 2022.
