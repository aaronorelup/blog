# fingerstyle-voices-taps: steps for Aaron

These are the tools of this lane that did not run on the research box, with the reason in `trials.md`. Each list is
written for a Windows 11 laptop with an 8 GB RTX 4070 and no programming background. The clips are the shared test
clips (on the research box in `/home/user/gtr/inputs/`; the audio is not in git, so ask the orchestrator for a copy).
Every clip id below (S6taps, S2n ...) is a folder there; `<inputs>` below means wherever that folder is on your
laptop.

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
run (it shows errors and timings), and how many seconds the run took (the lists say how to see that).

## 1. ADTOF-pytorch (drum transcription on the taps)

Not run here: this session's permission policy refused both installing the cloned repository and running its source
(trials.md, "ADTOF-pytorch").

1. In Terminal: `cd C:\gtr`, then `git clone https://github.com/xavriley/ADTOF-pytorch`, then `cd ADTOF-pytorch`.
2. `python -m venv venv` then `venv\Scripts\activate` (the prompt now starts with `(venv)`).
3. Install PyTorch (common setup step 5), then `pip install -e .`
4. Run it on four files, one line each (replace `<inputs>` with the folder path of the shared clips):
   - `adtof --audio <inputs>\S6taps\S6taps.wav --out S6taps_mix.mid --device cuda`
   - `adtof --audio <inputs>\S6taps\stems\taps.wav --out S6taps_tapsonly.mid --device cuda`
   - `adtof --audio <inputs>\S2s\S2s.wav --out S2s_notaps.mid --device cuda`
   - `adtof --audio <inputs>\R3a\R3a.wav --out R3a.mid --device cuda`
5. To time a run, put `Measure-Command { ... }` around it, for example
   `Measure-Command { adtof --audio <inputs>\S6taps\S6taps.wav --out S6taps_mix.mid --device cuda }` and note
   `TotalSeconds`.
6. Send back: the four `.mid` files, the screenshot, the seconds. Run time: no figure in its README; not measured
   here. No cost. License note for you: the repository has no license file; the weights are converted from ADTOF, whose
   repository says CC BY-NC-SA 4.0 (survey.md).

## 2. ADTOF, original Keras version (same model family)

Not run here: needs TensorFlow, which no venv on the box has, and the orchestrator's disk notice forbade new installs
over 200 MB (trials.md).

1. Open the Colab notebook linked at the top of https://github.com/MZehren/ADTOF ("The easiest way to test the
   trained model is our Colab Notebook", per its README). It needs a Google account.
2. In Colab, upload `S6taps.wav`, `stems\taps.wav` (rename it `S6taps_taps.wav`), `S2s.wav` and `R3a.wav` with the
   folder icon on the left.
3. Follow the notebook's cells, pointing its audio path at each file in turn.
4. Send back: the MIDI or text file each run writes (download from the folder pane), and a screenshot of the last
   cell's output. No cost (free Colab). License: CC BY-NC-SA 4.0 per the README.

## 3. Omnizart drum mode

Not run here: needs TensorFlow (`tensorflow>=2.5.0` in its PyPI requirements); no TensorFlow on the box and the
orchestrator's disk notice forbade new installs over 200 MB (trials.md).

1. `cd C:\gtr`, `python -m venv omnizart-venv`, `omnizart-venv\Scripts\activate`.
2. `pip install omnizart` then `omnizart download-checkpoints`.
3. `omnizart drum transcribe <inputs>\S6taps\S6taps.wav -o S6taps_omnizart.mid`, then the same for
   `<inputs>\S6taps\stems\taps.wav` (`-o S6taps_tapsonly_omnizart.mid`), `<inputs>\S2s\S2s.wav` and
   `<inputs>\R3a\R3a.wav`.
4. Send back: the four `.mid` files, the screenshot, the seconds (step 5 of list 1 shows how). The README warns
   "Currently, Omnizart is **incompatible for ARM-based MacOS** system"; Windows on Intel/AMD is not excluded there.
   If `pip install omnizart` fails, send the last 30 lines of the error.

## 4. Cluster and Separate (piano_svsep), GNN voice and staff separation

Not run here: its `setup.py` pins `torch==2.8.0`; the box already has a different torch and the orchestrator's disk
notice forbids a second torch version; the package is not on PyPI, so it also means running a cloned repository
(trials.md).

1. `cd C:\gtr`, `git clone https://github.com/CPJKU/piano_svsep`, `cd piano_svsep`, `python -m venv venv`,
   `venv\Scripts\activate`.
2. Install PyTorch (common step 5), then `pip install .`
3. Copy `S2n_truth_merged_single_track.musicxml` from this folder's `samples/voice-split/` into `C:\gtr\piano_svsep`
   (it is the S2n notes as one part, with no voice information).
4. `python launch_scripts/predict.py --model_path pretrained_models/model.ckpt --score_path S2n_truth_merged_single_track.musicxml --save_path S2n_pred.mei`
5. Send back: `S2n_pred.mei` and the screenshot. The orchestrator scores which notes went to which voice and staff.

## 5. McLeod and Steedman voice separation (Java)

Not run here: it means compiling and running a cloned repository; not attempted after the refusals in list 1.

1. Install a Java JDK (for example Temurin 21 from https://adoptium.net/).
2. `cd C:\gtr`, `git clone https://github.com/apmcleod/voice-splitting`, then follow its README's build and run
   commands with the MIDI file `S2n_truth_merged_single_track.mid` from `samples/voice-split/`.
3. Send back: the output MIDI or text file and the screenshot.

## 6. ADT_STR (drum transcription, 2026)

Not run here: code is a cloned repository (see list 1) and its install brings its own PyTorch stack.

1. `cd C:\gtr`, `git clone https://github.com/pier-maker92/ADT_STR`, `cd ADT_STR`.
2. Follow the README: it uses `uv` (`pip install uv`, then `uv venv .venv --python 3.12` and
   `uv pip install -r pyproject.toml`).
3. Run the README's command for each of `S6taps.wav`, `stems\taps.wav`, `S2s.wav`, `R3a.wav`:
   `python inference --checkpoint setting-tau-0.8 --input <file> --output_path outputs` (written this way in its README).
4. Send back: the MIDI files from `outputs` and the screenshot. License: CC BY-SA 4.0 per its GitHub README.

## 7. Inverse Drum Machine (drum separation with a manual onset override)

Not run here: cloned repository (list 1). Of interest for the app because its README says "To override the
transcription, you can pass a dictionary with the onsets to the `separate` function".

1. Clone `https://github.com/bernardo-torres/inverse-drum-machine`, install with Poetry as its README says.
2. Run its README example on `S6taps.wav`, once as is and once with the onsets override filled from
   `S6taps.truth.json` (`taps` list: `thump` as `KD`, `slap` as `SD`).
3. Send back: the stem WAVs it writes (they go to your studio library, not git) and the screenshot.

## 8. A real recording with body taps (no clip in the shared set has one)

Two freely licensed candidates were found but could not be downloaded from the box:

1. Freesound sound 674811, "guitar body kick" by leaving.february, "Sound when hitting acoustic guitar body with a
   thumb in 105bpm", 18.285 s, license "Creative Commons 0" (page read 2026-11-10 through the web reader;
   https://freesound.org/people/leaving.february/sounds/674811/). The box got HTTP 403 from freesound.org and the
   download link needs a login. Steps: log in to Freesound (free account), open the page, press Download, send back
   the WAV.
2. Wikimedia Commons "File:Erik Mongrain-AirTap.ogv", Erik Mongrain demonstrating "the lap-tapping technique",
   180.2 s, 320x240, license "CC BY-SA 2.5" (Commons API, read 2026-11-10). The box got HTTP 429 (too many requests)
   from upload.wikimedia.org. Steps: open https://commons.wikimedia.org/wiki/File:Erik_Mongrain-AirTap.ogv , use
   "Download" on the right, send back the file.

With either file back, the orchestrator can run this lane's HPSS, onset and Demucs-drums steps on real taps.

## 9. LarsNet (5-stem drum separation: kick, snare, toms, hi-hat, cymbals)

Not run here: its checkpoint is 562 MB (survey.md), above the 200 MB limit in the orchestrator's disk notice.

1. `cd C:\gtr`, `git clone https://github.com/polimi-ispl/larsnet`, `cd larsnet`, `python -m venv venv`,
   `venv\Scripts\activate`, install PyTorch (common step 5), then install what its README lists.
2. Download the checkpoints from the Google Drive link in its README (562 MB, "licensed under CC BY-NC 4.0") and
   unpack them where the README says.
3. Make a folder `C:\gtr\larsnet_in` and copy into it: `S6taps\stems\taps.wav` (rename `S6taps_taps.wav`) and, if the
   orchestrator gives it to you, the Demucs drums stem of S6taps (`htdemucs_6s\S6taps\drums.wav` from the
   source-separation lane, rename `S6taps_htdemucs6s_drums.wav`).
4. `python separate.py -i C:\gtr\larsnet_in -o C:\gtr\larsnet_out -d cuda:0`
5. Send back: the folder `C:\gtr\larsnet_out` (audio goes to your studio library, not git) and the screenshot. The
   question it answers: does the side-stick "slap" land in Snare and the bass-drum "thump" in Kick Drum.

## 10. drumsep (Demucs-based 4-stem drum separation)

Not run here: weights come from Google Drive through `gdown` (survey.md); not attempted.

1. Install Git for Windows' "Git Bash" (comes with Git), open Git Bash, `cd /c/gtr`,
   `git clone https://github.com/inagoy/drumsep`, `cd drumsep`, then `bash drumsepInstall` (per its README).
2. `bash drumsep "<inputs>/S6taps/stems/taps.wav" "/c/gtr/drumsep_out"`
3. Send back: the four WAVs it writes (Bombo/kick, Redoblante/snare, Platillos/cymbals, Toms) and the screenshot.

## 11. Deep Salience (bass line and melody salience from audio)

Not run here: its `replicate.yaml` pins Python 2.7.15 and TensorFlow 1.12.0; the box has no Python 2.7.

1. Install Docker Desktop for Windows (https://www.docker.com/products/docker-desktop/), start it.
2. In Terminal: `cd C:\gtr`, `git clone https://github.com/rabitt/ismir2017-deepsalience`, then
   `docker run -it --rm -v C:\gtr:/work python:2.7 bash`.
3. Inside that window: `cd /work/ismir2017-deepsalience`, `pip install tensorflow==1.12.0 keras==2.0.3 librosa==0.5.0`
   (the versions in its `replicate.yaml`), copy `S2n.wav` and `S2s.wav` into `/work`, then
   `python predict/predict_on_audio.py /work/S2n.wav bass /work/ds_out -f singlef0` and the same with `melody2`
   instead of `bass`; repeat for `S2s.wav`.
4. Send back: the CSV files in `C:\gtr\ds_out` and the screenshot. If step 3's install fails, send the error lines.

## 12. Magenta Onsets and Frames, drums checkpoint (E-GMD)

Not run here: needs the archived Magenta TensorFlow 1 environment (survey.md).

1. In Google Colab (free), open a new notebook and follow the "Onsets and Frames" instructions at
   https://github.com/magenta/magenta/tree/main/magenta/models/onsets_frames_transcription , using the drums
   checkpoint `e-gmd_checkpoint.zip` linked there and `--config="drums"`.
2. Run it on `S6taps.wav`, `stems\taps.wav` and `S2s.wav`.
3. Send back: the MIDI files and a screenshot of the cell output. If the environment setup fails in Colab, send the
   error; this one is old and may not install any more.
