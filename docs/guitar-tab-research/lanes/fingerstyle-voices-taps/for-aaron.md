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
5. Local alternative (what was refused here; not tried anywhere in this research): Python 3.10, `git clone https://github.com/MZehren/ADTOF`, `cd ADTOF`,
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
   wheel` and then `pip install --no-build-isolation omnizart` (this workaround was not tried anywhere in this
   research). Building them needs a C/C++ compiler (on Windows,
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
3. Copy `S2n_truth_merged_single_track.musicxml` and `S5dropd_truth_merged_single_track.musicxml` from this folder's
   `samples/voice-split/` into `C:\gtr\piano_svsep`. Each holds a clip's 90 notes as one part; they carry music21's
   own voice numbers (1 and 2) where music21 split overlapping notes, made without the truth labels. The README says
   the input may have "potentially random voice and staff assignments".
4. `python launch_scripts/predict.py --model_path pretrained_models/model.ckpt --score_path S2n_truth_merged_single_track.musicxml --save_path S2n_pred.mei`
   (the README's command with these file names), then the same with `S5dropd` in both file names.
5. Send back: `S2n_pred.mei`, `S5dropd_pred.mei` and the screenshot. The orchestrator scores them with
   `scripts/gap1_score_svsep.py S2n_pred.mei S2n` (and `S5dropd`), which counts the notes put in the right voice the
   way partitura and music21 were counted (trials.md, "Gap round 1").

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
without CUDA its code picks the CPU by itself (`select_inference_device()`: "Prefer CUDA, then Apple MPS, else CPU.";
read, not run).

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

Gap round 1 (2026-11-10): the Freesound page and a preview address of sound 674811 answered HTTP 403 to the box again,
so step 1 above still needs you. The box did get one CC BY 3.0 recording from archive.org, now this lane's input RT1:
Chris Smuck, "With A New Tuning, You Can Fly" (2007), https://archive.org/details/ChrisSmuckWithANewTuningYouCanFly ,
keywords "Acoustic, Tapping, Fingerstyle". Nobody has listened to it: whether its "tapping" is on the fretboard or on the
guitar body is not known (trials.md, "Gap round 1").

3. Listen to RT1 (the MP3 on that page, 3:53). Write down whether it has hits on the guitar body and, if it does, the
   times of a few of them (minutes:seconds) and what kind they are (thumb on the top, palm on the bridge, fingers on the
   side ...). Send back that list. It would be the first real tap truth for this lane, and the onset and Demucs outputs
   made here can then be checked against it. For reference, the loudest peaks of the Demucs drums stems made from RT1
   are at 0:31.8, 1:05.8, 1:08.4, 1:10.4 and 3:25.8 (htdemucs_6s) and 0:49.9 (htdemucs); a second htdemucs_6s run
   (the verifier's) had loud peaks at the same five times and also at 2:00.8 and 2:18.8; what sound is there is not
   known.
4. One more candidate was found and not downloaded because its license is the Public Domain Mark 1.0, not CC0 or CC BY:
   https://archive.org/details/RacerSessions-DannyGodinez11082015 (a steel-string acoustic set whose description says
   "imaginative fingerstyle and percussive textures", with live looping and echo/reverb). Whether to use it is your
   call; if yes, say which file and which minutes.

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
   WSL; it has not been tried in Git Bash. The scripts only do the following, which can also be typed by hand in
   Terminal (not tried anywhere in this research): `pip install demucs`, put the file from
   https://drive.google.com/uc?id=1-Dm666ScPkg8Gt2-lK3Ua0xOudWHZBGC (`49469ca8.th`) into a folder `model`, then
   `demucs --repo model -o drumsep_out -n 49469ca8 <file>` for each input.
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

## 13. MidiBERT-Piano melody extraction (splits a MIDI file into melody and accompaniment)

Not run here (gap round 2, trials.md "Gap round 2"): there is no checkpoint its published code can load. The README's
Google Drive folder answers "Error 404 (Not Found)"; in the repository's issue #18 the owner re-uploaded two
checkpoints in June 2026, whose input layer has six token fields where the published code has four (read here from the
first 128 KB of the 1.34 GB file), and wrote on 2026-10-12 "it appears the original model checkpoint has been lost".
So this list starts with a check, and only goes on if something new has been published.

1. Open https://github.com/wazenmai/MIDI-BERT/issues/18 and read any comment after 12 October 2026. If none gives
   either the code for the six-field checkpoints or a checkpoint for the published code, stop and send back "nothing
   new in issue 18". If one does, note which files it names and go on.
2. Install Python 3.9 for Windows from python.org (issue #11, a collaborator: "Python 3.8 and 3.9 works fine for me").
   In Terminal: `cd C:\gtr`, `git clone https://github.com/wazenmai/MIDI-BERT`, `cd MIDI-BERT`, `py -3.9 -m venv
   venv`, `venv\Scripts\activate`.
3. `pip install -r requirements.txt` (the README's line; it pins `torchaudio==0.9.0`, `transformers==4.8.2`,
   `scikit_learn==0.24.2`), then `pip install "numpy<1.24"` (the code uses `np.int`, which NumPy 1.24 removed; this
   step was not tried anywhere in this research). If the issue named new code files, put them in place now.
4. Put the melody checkpoint at `result\finetune\melody_default\model_best.ckpt` (the README's layout).
5. Copy the six MIDI files from this folder's `samples/midibert/` into `C:\gtr\MIDI-BERT`: `S2n_truth_merged_480tpb.mid`,
   `S5dropd_truth_merged_480tpb.mid` (the 90 notes of each clip in one track), `S2n_basicpitch_480tpb.mid`,
   `S5dropd_basicpitch_480tpb.mid` (Basic Pitch's notes from the audio, at Basic Pitch's 120 bpm) and
   `S2n_basicpitch_112bpm_480tpb.mid`, `S5dropd_basicpitch_112bpm_480tpb.mid` (the same notes at the clip's 112 bpm).
   They are written at 480 ticks per beat because the code assumes that resolution.
6. In Terminal (PowerShell): `$env:PYTHONPATH = "."` (the README's `set PYTHONPATH='.'` is for the old cmd window),
   then run all six with one line:
   `Get-ChildItem *_480tpb.mid | ForEach-Object { python melody_extraction/midibert/extract.py --input_path $_.Name --output_path ($_.BaseName + "_melody.mid") --ckpt result/finetune/melody_default/model_best.ckpt --cpu --bridge False }`
   (`--bridge False` counts only the "melody" class as melody, as the README's `scripts/melody_extraction.sh` does).
7. Send back: the six `*_melody.mid` files, the screenshot and the seconds; or, if it stops, the last 30 lines of the
   error. The orchestrator scores them with `scripts/gap2_midibert.py score <name>_melody.mid <name>.mid <clip>`, which
   counts the notes put in the right voice the way partitura, music21 and piano_svsep were counted.

Optional, to confirm the mismatch itself: download `melody_model_best.ckpt` (1.34 GB) from the June 2026 folder,
https://drive.google.com/drive/folders/1MniVSDTdB0Vv0Ey_MllnN9mAEK279eQN , use it in step 4 with the published code,
run step 6, and send back the error text (an error naming `in_linear.weight` or `word_emb.4` would confirm it).

## 14. QM Vamp "Note Onset Detector" on the taps clip (Sonic Visualiser)

Not run here: the Queen Mary plugin library is not on the box and could not be obtained by the chords-beats-key lane
either (trials.md, "Gap round 2"). This uses the same two installs as the chords-beats-key lane's list 1
(`docs/guitar-tab-research/lanes/chords-beats-key/for-aaron.md`); if you did that list, skip to step 2.

1. Install Sonic Visualiser and the Vamp Plugin Pack as in steps 1 and 2 of the chords-beats-key lane's list 1
   (Sonic Visualiser 5.2.1 "64-bit Windows installer" from https://www.sonicvisualiser.org/download.html ; the Vamp
   Plugin Pack Windows installer from https://www.vamp-plugins.org/pack.html , with the Queen Mary plugins ticked).
2. Open `<inputs>\S6taps\S6taps.wav` in Sonic Visualiser. In the Transform menu, Analysis section, pick the Queen
   Mary "Note Onset Detector" and its output "Note Onsets" (system identifier
   `vamp:qm-vamp-plugins:qm-onsetdetector`), and run it with its default settings. How Sonic Visualiser 5.2.1 labels
   these menu entries was not checked (UNVERIFIED).
3. Run it three more times on the same file, each time changing only "Onset Detection Function Type" in the
   plugin's settings window: "Spectral Difference", "Phase Deviation", "Broadband Energy Rise" (the default is
   "Complex Domain"; the four names are from the plugin's documentation).
4. For each of the four result layers: make it the current layer, then File, Export Annotation Layer, and save it as
   `S6taps_qm_<type>.csv` (type: complex, specdiff, phase, broadband).
5. Do steps 2 to 4 again for `<inputs>\S6taps\stems\taps.wav` (save as `S6taps-tapsstem_qm_<type>.csv`) and for
   `<inputs>\S2s\S2s.wav` (the same notes without taps; save as `S2s_qm_<type>.csv`).
6. Send back the twelve CSV files and one screenshot of S6taps with its four layers. The orchestrator takes the time
   column and scores each file with `gtr-eval onsets --truth S6taps --est <times> --field taps` and `--field notes`
   and with `scripts/classify_onset_files.py S6taps <times>`, as for the other onset detectors in this lane. Time:
   about 15 minutes (estimate). Cost: free.

## 15. ADTLib (kick, snare, hi-hat onsets and a drum tab, 2018)

Not run here (trials.md, "Gap round 2"): its code imports `tensorflow.contrib`, which only TensorFlow 1.x has, and the
last TensorFlow 1.x release (1.15.5) has wheels only for Python 3.6 and 3.7; the box has no Python older than 3.8.
Docker gives a Python 3.7 system without touching your own Python. Nothing in this list was tried anywhere in this
research.

1. Install Docker Desktop for Windows (https://www.docker.com/products/docker-desktop/) and start it (as in list 11).
2. Copy into `C:\gtr`: `<inputs>\S6taps\S6taps.wav`, `<inputs>\S6taps\stems\taps.wav` (rename it `S6taps_taps.wav`) and
   `<inputs>\S2s\S2s.wav`.
3. In Terminal: `docker run -it --rm -v C:\gtr:/work python:3.7 bash` (Docker Hub lists the `python:3.7` tag, last
   updated 2023-09-21).
4. Inside that window, one line at a time:
   `pip install "numpy==1.18.5" cython`
   `pip install --no-build-isolation "madmom==0.16.1"` (madmom 0.16.1 is a source package whose `setup.py` imports
   numpy and Cython while it builds)
   `pip install "tensorflow==1.15.5" "h5py<=2.10.0"`
   `pip install "ADTLib==2.1.2"`
5. `mkdir -p /work/adt_out`, `cd /work`, then `ADT -od /work/adt_out S6taps.wav S6taps_taps.wav S2s.wav` (its usage
   page: "ADT [-h] [-od {None,dir}] [-o {yes,no}] [-ot {yes,no}] [I [I ...]]"; it writes the onset times to a `.txt`
   file and a drum tab to a PDF).
6. Send back: everything in `C:\gtr\adt_out` (and any `.txt` or `.pdf` it wrote into `C:\gtr`), the screenshot and the
   seconds; if an install line fails, its last 30 lines. The orchestrator scores the kick and snare times against the
   `thump` and `slap` taps of `S6taps.truth.json` with `gtr-eval onsets`.

## 16. Separate-and-Detect (five drum stems by latent diffusion, then onsets per stem, 2026)

Not run here (trials.md, "Gap round 2"): one checkpoint and its two MusicLDM parts are about 6.4 GB, its inference
config asks for a GPU (`accelerator: "gpu"`), and it runs from a cloned repository. Its environment files are conda
files for Linux with CUDA 11.6 builds of PyTorch, so these steps use a Linux system with an NVIDIA GPU: WSL2 (Ubuntu)
on your PC, or a rented Linux GPU machine. How much GPU memory it needs is not stated in its README. Nothing in this
list was tried anywhere in this research.

1. In the Linux terminal, install Miniconda (https://docs.conda.io/en/latest/miniconda.html), then:
   `git clone https://github.com/ddman1101/Separate-and-detect`, `cd Separate-and-detect`,
   `conda env create -f musicldm_env.yml`, `conda env create -f onset_detect.yml` (the README's two lines).
2. The README's madmom fix: in `<conda env path>/lib/python3.10/site-packages/madmom/processors.py` of the
   `onset_detect` environment, change line 23 from `from collections import MutableSequence` to `from collections.abc
   import MutableSequence`.
3. Download into the repository folder (about 6.4 GB):
   `wget https://huggingface.co/ddman1101/Separate-and-Detect/resolve/main/msgld_obtb.ckpt`,
   `wget https://zenodo.org/record/10643148/files/vae-ckpt.ckpt`,
   `wget https://zenodo.org/record/10643148/files/hifigan-ckpt.ckpt` (the README's commands, without `-P checkpoints/`
   so that all three sit where the config's default paths point after step 5).
4. `mkdir test_data` and copy `S6taps.wav`, `S6taps\stems\taps.wav` (renamed `S6taps_taps.wav`) and `S2s.wav` into it.
5. Point the single-audio config at this folder: `sed -i "s#/PATH/TO/PROJECT#$PWD#g"
   config/MSG-LD/integrated_musicldm_test_inference.yaml` (its paths, such as `resume_from_checkpoint:
   /PATH/TO/PROJECT/msgld_obtb.ckpt`, `reload_from_ckpt: "/PATH/TO/PROJECT/vae-ckpt.ckpt"` and `demucs_input_root:
   /PATH/TO/PROJECT/test_data`, all start with that placeholder).
6. `conda activate musicldm_env`, then
   `CUDA_VISIBLE_DEVICES=0 python integrated_train.py --config config/MSG-LD/integrated_musicldm_test_inference.yaml --separate_only`
   (the README's single-audio separation command; it runs Demucs first when its output folder does not exist yet).
7. Find the `val_0` folder the run wrote (the README's example path is `inference_outputs/val_0/mix/<name>.wav`, with
   `stem_0` to `stem_4` beside `mix`; where this config writes it was not checked). Then `conda activate onset_detect`
   and for each file in `val_0/mix/`:
   `python single_audio_onset_detection.py --input_audio <full path>/val_0/mix/<name>.wav --output_dir ./transcription_results`
8. Send back: the `*_transcription.txt` files (lines `timestamp    drum_type`, types Kick, Snare, Toms, Hi_Hats,
   Cymbals), the five stem WAVs of each input (they go to your studio library, not git), the terminal output and the
   seconds each step took. The orchestrator scores the Kick and Snare lines against the `thump` and `slap` taps of
   `S6taps.truth.json`.
