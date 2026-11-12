# Lane 2, chords-beats-key: steps for Aaron

Written 2026-11-10 by try-chords-beats-key. These are the tools this lane could not run on the cloud box (reasons in
`trials.md`, section "Not run here"). Each block says which test clips to use, what to do on a Windows PC (an NVIDIA
GPU with CUDA is used only where a step says so), and what to send back. The clips are the shared test inputs
(`S3.wav`, `S4.wav`, `R1a.wav`, ...); their contents and ground truth are described in
`docs/guitar-tab-research/inputs/INPUTS.md`. Every clip id below means
the file `<id>.wav` (44.1 kHz; stereo, mono for R1a to R1c).

Anything marked UNVERIFIED was not checked against the product or repository today; the step may need adjusting.

## 1. Sonic Visualiser with the Vamp Plugin Pack (QM key detector, QM bar-and-beat tracker, Chordino in a GUI)

Covers: the QM Vamp plugins (not run here) and a GUI check of Chordino / NNLS Chroma (run here through Python).
Gap round 1: the QM plugins still could not be obtained on the Linux box (trials.md, "Gap round 1"); these steps stand.

1. Download Sonic Visualiser 5.2.1, "64-bit Windows installer", from https://www.sonicvisualiser.org/download.html and
   install it (the page says "No plugins are included with Sonic Visualiser itself").
2. Download the Vamp Plugin Pack Windows installer from https://www.vamp-plugins.org/pack.html ("Use this if you have
   64-bit Windows and are using 64-bit Vamp host applications") and run it; accept the Queen Mary and Matthias Mauch
   plugin libraries.
3. Open `S3.wav` in Sonic Visualiser. The Sonic Visualiser reference manual (version 4.1,
   https://sonicvisualiser.org/doc/reference/4.1/en/, read 2026-11-10) says installed Vamp plugins appear "in the
   Analysis section of the Transform menu". From there run in turn, each with default settings, the Queen Mary plugins
   "Key Detector", "Bar and Beat Tracker" and "Tempo and Beat Tracker" (names from the QM plugin documentation,
   https://vamp-plugins.org/plugin-doc/qm-vamp-plugins.html) and Chordino (its chord estimate output). How 5.2.1 labels
   the menu entries was not checked (UNVERIFIED).
4. For each result layer, make it the current layer and use File, Export Annotation Layer (the 4.1 manual: "use File →
   Export Annotation Layer. The file type will be determined from the extension you use when naming the file: .csv for
   comma-separated files"); name each file with `.csv`.
5. Repeat for `S4.wav`, `S7flat30.wav`, `R1a.wav`, `R1b.wav`, `R2.wav`.
6. Send back: the CSV files named `<clip>_<plugin>.csv`, and one screenshot of S3 with all layers visible. Time: about
   20 minutes (estimate). Cost: free (Sonic Visualiser is GPL v2 or later per its download page).

## 2. BTC (Bi-directional Transformer for chord recognition)

Not run here because the session refused to execute code from the cloned repository. The lane's wrapper script is
ready: `docs/guitar-tab-research/lanes/chords-beats-key/scripts/btc_run.py`.

1. Install Python 3.11 for Windows from python.org (tick "Add python.exe to PATH") and Git for Windows.
2. Open PowerShell in an empty folder and run:
   `git clone https://github.com/jayg996/BTC-ISMIR19`
   `py -3.11 -m venv btc`
   `btc\Scripts\activate`
   `pip install torch librosa==0.11.0 mir_eval pyyaml pretty_midi pandas soundfile`
   (on Windows the PyPI `torch` wheel is a CPU build, UNVERIFIED; the lane's wrapper runs BTC on the CPU either way;
   a CUDA build comes from the selector on pytorch.org).
3. Copy `btc_run.py` from the blog repository into the same folder and the clips into a `clips` folder.
4. Run, for each of S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2, R2full:
   `python btc_run.py --audio clips\S3.wav --outdir out\S3 --repo BTC-ISMIR19`
5. Send back: the whole `out` folder (each clip has `chords_btc_majmin.lab`, `chords_btc_largevoca.lab`,
   `timings_btc.json`), and the text printed in PowerShell. Time: about 15 minutes plus install (estimate).
6. License note for the record: the repository's LICENSE is MIT (quoted in survey.md); the README says the training
   audio came "from online music service providers".

## 3. S-KEY (Deezer key detection)

Gap round 1: the same weights ran here through a community ONNX export (trials.md, "Gap round 1"), so the record has
S-KEY keys for the ten clips of step 3 and R2full. These steps run Deezer's own PyTorch code, which would show whether
the two give the same labels; optional.

1. With the same Python 3.11 and Git: `git clone https://github.com/deezer/skey`, `cd skey`, `pip install poetry`,
   `poetry install`.
2. Run the command the README gives, once per clip: `poetry skey ..\clips\S3.wav --device cpu` (quoted from the
   README; if poetry rejects it, `poetry run skey ...` is the usual form, UNVERIFIED). Use the GPU with
   `--device cuda` if PyTorch with CUDA is installed.
3. Clips: S3, S4, S2n, S5capo2, S5dropd, S7flat30, R1a, R1b, R1c, R2.
4. Send back: the printed key for each clip (or the `prediction/predictions.csv` it writes when given a folder, per
   `skey/key_detection.py` as read in survey.md) and how long each run took.
5. License note: the README says "You may use the model weights only for non-commercial research purposes" (quoted in
   survey.md).

## 4. libKeyFinder (through Mixxx, UNVERIFIED route)

The libkeyfinder README says maintenance passed to the Mixxx DJ software team (survey.md). Mixxx's source on its `2.5`
branch (raw.githubusercontent.com/mixxxdj/mixxx/2.5/, read 2026-11-10) has `option(KEYFINDER "KeyFinder support" ON)`
in `CMakeLists.txt`, linking libKeyFinder (minimum version 2.2.4), and a key analyzer plugin named "KeyFinder"
(`src/analyzer/plugins/analyzerkeyfinder.cpp`, id `keyfinder:2`). Whether the Windows 2.5.6 installer was built with it
was not checked (UNVERIFIED; the Preferences screenshot in step 2 shows it).

1. Install Mixxx 2.5.6 for Windows from https://www.mixxx.org/download/ (free; "There is no official paid or "pro"
   version of Mixxx").
2. Open Options, Preferences, Key Detection (the Mixxx 2.5 manual, section 13.5, says Mixxx re-analyses tracks "if you
   select a different key detection plugin"); take a screenshot of the available detectors.
3. Add the clips folder to the library, select all clips, and run Analyze.
4. Send back: a screenshot of the library with the Key and BPM columns for S3, S4, S2n, S5capo2, S7flat30, R1a, R1b,
   R1c, R2, and the preferences screenshot.

Added in gap round 1: Ubuntu's own Mixxx 2.4.0 package was built without KeyFinder (its binary has no "keyfinder"
string and has the Queen Mary key detector's strings; survey.md), so with that package this route would offer only the
Queen Mary detector (UNVERIFIED: Mixxx was not run). The command-line route, which the
box's permission system refused to build here (trials.md, "Gap round 1"), in WSL (Ubuntu) on the same PC:

5. `sudo apt install cmake g++ libfftw3-dev pkg-config libavcodec-dev libavformat-dev libavutil-dev libswresample-dev`
   (cmake and libfftw3-dev from the libkeyfinder README; the ffmpeg libraries for keyfinder-cli, whose README asks for
   "ffmpeg" and "libkeyfinder"; the exact ffmpeg package list is UNVERIFIED).
6. `git clone --branch 2.2.8 https://github.com/mixxxdj/libkeyfinder`, `cd libkeyfinder`,
   `cmake -DCMAKE_INSTALL_PREFIX=$HOME/kf -DBUILD_TESTING=OFF -S . -B build`, `cmake --build build --parallel 4`,
   `cmake --install build` (README commands, with the README's `-DBUILD_TESTING=OFF` option).
7. `git clone https://github.com/EvanPurkhiser/keyfinder-cli`, `cd keyfinder-cli`,
   `cmake -DCMAKE_INSTALL_PREFIX=$HOME/kf -DCMAKE_PREFIX_PATH=$HOME/kf -S . -B build`, `cmake --build build`,
   `cmake --install build` (README commands; `-DCMAKE_PREFIX_PATH` so it finds the libkeyfinder just installed,
   UNVERIFIED).
8. For each of S3, S4, S2n, S5capo2, S5dropd, S7flat30, R1a, R1b, R1c, R2full: `time $HOME/kf/bin/keyfinder-cli
   S3.wav` (its README: "`A` is equivalent to A Major. Sharps are not used."; how a minor key is printed is not shown
   there, UNVERIFIED).
9. Send back: the printed key and the `time` line for each clip.

## 5. All-In-One (allin1): beats, downbeats, BPM and song sections

Ran here in gap round 1 on the CPU (trials.md, "Gap round 1"; 2 cores, R2full included), so nothing is needed for the
record. The steps below are only for a GPU timing to set beside the CPU one. (Changed in gap round 1: the NATTEN facts
below were read on 2026-11-10; see survey.md, All-In-One.)

1. Python 3.8 or newer (PyPI `allin1` 1.1.0: `requires_python` ">=3.8"); install PyTorch (the README: "Visit PyTorch
   and install the appropriate version for your system"; the CUDA build from pytorch.org's selector uses the GPU).
2. NATTEN: the allin1 README (read 2026-11-10) says "Install NATTEN (Required for Linux and Windows; macOS will
   auto-install)" and, for Windows, "Build from source": `pip install ninja`, `git clone https://github.com/SHI-Labs/NATTEN`,
   `cd NATTEN`, `make`. allin1 1.1.0 imports `natten1dqkrpb`, `natten1dav`, `natten2dqkrpb` and `natten2dav`, which NATTEN
   dropped in 0.17.5 (NATTEN changelog), so after the clone check out a release that still has them, for example
   `git checkout v0.17.4` (0.17.3 is what ran here; 0.17.4 did not import on Python 3.9 but should on 3.10 or newer,
   UNVERIFIED). Whether that build works with the installed PyTorch and CUDA on Windows was not checked (UNVERIFIED).
3. `pip install git+https://github.com/CPJKU/madmom` then `pip install allin1` (both from the allin1 README).
4. Run `allin1 clips\S4.wav -o out` and the same for R1a, R1c, R2 and R2full. Each run first separates stems with
   Demucs, so the time includes separation.
5. Send back: the JSON files in `out` (the README's example shows the keys `path`, `bpm`, `beats`, `downbeats`,
   `beat_positions`, `segments`), and how long the R2full run took (the whole song, 228.5 s of audio).

## 6. tempo-cnn (global tempo)

Ran here in gap round 1 (trials.md, "Gap round 1": eight tempo models and the meter model on ten clips), so nothing is
needed for the record; the steps stay for a run on a Windows PC.

1. Python 3.9, 3.10 or 3.11 (PyPI says `<3.12,>=3.9`): `pip install tempocnn` (it installs TensorFlow 2.17.0).
2. For each of S3, S4, S2n, S7flat30, R1a, R1b, R1c, R2, R2full: `tempo -i clips\S3.wav` (command form quoted in
   survey.md from the README).
3. Send back: the printed tempo per clip and the time each took.

## 7. Omnizart chord

Not run here: the verifier's chord-only install of the PyPI sdist was refused by the session's permission classifier
("Code from External"; trials.md, "Not run here"). Gap round 1: one attempt with the 0.5.0 wheel on Python 3.8
(TensorFlow 2.5.0) failed while building madmom 0.16.1 from the copy of its sdist in the box's shared cache, which held a
C file generated earlier by Cython 3.3.1 (trials.md, "Gap round 1"). The steps below use the project's Docker image
instead.

1. Install Docker Desktop for Windows.
2. `docker pull mctlab/omnizart:latest`, then `docker run -it -v <clips folder>:/clips mctlab/omnizart:latest bash` (the
   README, read 2026-11-10, gives `docker pull mctlab/omnizart:latest` and `docker run -it mctlab/omnizart:latest bash`;
   the `-v` mount is standard Docker).
3. Inside the container: `omnizart download-checkpoints`, then `omnizart chord transcribe /clips/S3.wav` (README
   commands); repeat for S4, S2n, R1a, R1b, R1c, R2. In the 0.6.3 source, `download-checkpoints` fetches ten checkpoint
   files from the GitHub release `checkpoints-20211001` of Music-and-Culture-Technology-Lab/omnizart; the chord one
   (`chord_v1@variables.data-00000-of-00001`) is 44,242,072 bytes. Whether the Docker image already contains them was
   not checked.
4. Send back: the MIDI and CSV files it writes (CSV fields `chord`, `start`, `end` per survey.md) and the run times.

## 8. Beat Transformer (beats and downbeats after Spleeter separation)

1. The README (raw.githubusercontent.com/zhaojw1998/Beat-Transformer/main/README.md, read 2026-11-10) says "To quickly
   test our model with your own music, welcome to our Google Colab" and links
   https://colab.research.google.com/drive/1IdrpMO1AivWmy-Bm8ktmMy14ED9jllux. Open it, upload `S4.wav`, `R1a.wav` and
   `R2.wav`, and run all cells.
2. Send back: the beat and downbeat times it prints or saves, and a screenshot of the last cell.

## 9. Guitar open-string tuning classifier (Hulme et al.)

Gap round 1: a new search found no other open-string tuning or capo detector from audio with published weights or a
package (survey.md), so this remains the only candidate; the steps stand.

Research code; the README describes evaluation scripts and keeps models and test sets on Google Drive (survey.md). The
evaluation code's five classes are DADGAD, Drop D, Open D, Open G and Standard.

1. Only if you want to try it: clone https://github.com/edhulme/guitar-tuning-classification, `pip install tensorflow
   matplotlib scikit-learn seaborn` (README), download the models from the README's Google Drive link.
2. Run its classifier on `S5dropd.wav` (truth: Drop D) and `S2n.wav` (truth: Standard). The README (read 2026-11-10)
   documents evaluation on its own test sets ("Run model evaluation on synthetic data", "on authentic data", with
   `eval_synthetic_songs.py` and `eval_authentic_songs.py`) and training; it gives no command for classifying a new audio
   file, so this step needs code that is not in the repository.
3. Send back: the predicted class for each clip, or the error message if it cannot take a new file.

## 10. STONE (Deezer, ISMIR 2024): key signature, and key and mode (added in gap round 2)

Not run here (not attempted): STONE installs from its cloned repository (no PyPI package), the kind of step this box's
permission system refused each time this lane tried one (trials.md, "Not run here"), and its pinned torch 2.0.0 and
tensorflow 2.12 downloads (195 MB and 586 MB) are over the 200 MB the shared disk allowed (trials.md, "Gap round 2").
Facts below are from the repository at commit 0c5f72d (2025-10-24), read 2026-11-11 and again 2026-11-12: the
README, `pyproject.toml`, `Dockerfile`, `inference.py` and the file list. The README says Python 3.10 and Poetry, and
gives a Docker route; `pyproject.toml` pins torch 2.0.0, torchaudio 2.0.1 and tensorflow 2.12.*, and `inference.py`
imports both PyTorch and TensorFlow and sets `device = "cpu"` (line 167), so a GPU is not used for inference.

1. Install Git for Windows and Docker Desktop for Windows.
2. In PowerShell: `git clone https://github.com/deezer/stone`, `cd stone`, `docker build . -t stone:latest` (README:
   "docker build . -t <image-name>:<tag>"; the Dockerfile starts from `nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04`
   and runs `poetry install --no-root`).
3. Make a folder `clips` inside the `stone` folder and copy `S3.wav`, `S4.wav`, `R1a.wav`, `R1b.wav`, `R1c.wav` and
   `R2.wav` into it (only these: `inference.py` reads every `*.wav` in the folder it is given).
4. Start the container with the README's command, `docker run -ti --gpus all -v ./:/workspace/ --entrypoint bash
   stone:latest` (`--gpus all` may be left out, since inference runs on the CPU; in PowerShell, `-v ${PWD}:/workspace/`
   is the usual form if `./` is refused, UNVERIFIED).
5. Inside the container, from `/workspace`, run both checkpoints, timing each (`time` in bash):
   `time poetry run python -m inference ckpt/semisupervised_ks_mode.pt clips -e wav -tt ks_mode`
   `time poetry run python -m inference ckpt/semitone_ks.pt clips -e wav -tt ks`
   The README's text calls the first checkpoint `semisupervised_key_mode.pt`; the file in `ckpt/` is
   `semisupervised_ks_mode.pt` (764,986 bytes; `semitone_ks.pt` is 1,307,770 bytes, sizes from
   raw.githubusercontent.com). The README says the command writes `results/<ckpt_name>/results.npz`; `inference.py`
   writes `clips/results/<ckpt_name>/values.npz` (lines 170 and 217-220).
6. Turn the class numbers into labels with this lane's `scripts/stone_npz_labels.py` (numpy only; it applies the two
   mappings printed in the README's "Mapping" section): copy it into the `stone` folder, then in the container
   `poetry run python stone_npz_labels.py clips/results/semisupervised_ks_mode/values.npz ks_mode` and
   `poetry run python stone_npz_labels.py clips/results/semitone_ks/values.npz ks`.
7. Send back: both `values.npz` files, the two `.labels.tsv` files the script writes, the console output and the two
   `time` lines. Truth keys: S3 G major, S4 D major, R1a Ab minor, R1b C# major, R1c G major; R2 none (the artist's page
   lists D# minor, per INPUTS.md). License: no LICENSE file and no license statement in the repository (survey.md,
   STONE).

## 11. key-cnn (Hendrik Schreiber): global key (added in gap round 2)

Not run here (not attempted): key-cnn installs from its cloned repository (no PyPI project `keycnn` or `key-cnn`), the
kind of step this box's permission system refused each time this lane tried one (trials.md, "Not run here"). Facts below
are from the repository at commit 9715d6f (2020-07-30), read 2026-11-11 and again 2026-11-12: the README
("Clone this repo and run ``setup.py install`` using Python 3.6"), `setup.py` (it requires `numpy==1.16.0`,
`tensorflow==1.15.2`, `librosa==0.6.2`, `jams>=0.3.1`, `matplotlib>=3.0.0`, `h5py>=2.7.0`) and `bin/key` (default
model `deepspec`, which `keycnn/classifier.py` maps to `deepspec_k16`, a 3,659,832-byte `.h5` file in the repository;
`deepsquare` maps to `deepsquare_k8`, 3,712,064 bytes). PyPI has TensorFlow 1.15.2 wheels for Windows for Python 3.5,
3.6 and 3.7 (`cp35`, `cp36`, `cp37` `win_amd64`) and numpy 1.16.0 Windows wheels for Python 2.7, 3.5, 3.6 and 3.7, so
3.7 is the newest Python that has both (PyPI JSON, read 2026-11-11 and 2026-11-12; corrected on 2026-11-12, the
2026-11-11 text said "only for Python 3.6 and 3.7").

1. Install Python 3.7.9, "Windows x86-64 executable installer", from python.org
   (https://www.python.org/ftp/python/3.7.9/python-3.7.9-amd64.exe answered HTTP 200 on 2026-11-11), and Git.
2. In PowerShell, in an empty folder: `py -3.7 -m venv keycnn`, `keycnn\Scripts\activate`, `git clone
   https://github.com/hendriks73/key-cnn.git`, `cd key-cnn`, then the README's `python setup.py install` (if it fails
   while fetching dependencies, `pip install .` installs the same `setup.py` with pip, UNVERIFIED). If loading the
   model then fails with an h5py error, `pip install "h5py<3"` (UNVERIFIED).
3. Copy the clips into a `clips` folder, make an empty `out` folder (`bin/key` does not create it), and run, for the
   default model and for the README's `deepsquare` example
   (`--mirex` prints "tonic<TAB>mode"; `-d` and `-e` write one result file per clip, per `bin/key`):
   `python ..\keycnn\Scripts\key --mirex -d out -e .deepspec.txt -i clips\S3.wav clips\S4.wav clips\R1a.wav
   clips\R1b.wav clips\R1c.wav clips\R2.wav` and the same with `-m deepsquare` and `-e .deepsquare.txt` (`setup.py`
   installs `bin/key` as a script without a `.py` ending, so on Windows it may have to be started with `python` and
   its path as here, UNVERIFIED). Time each command (`Measure-Command { ... }` in PowerShell).
4. Send back: the `out` folder (one file per clip and model), the console output and the two times. License: AGPL-3.0
   for "Source code and models" (README; survey.md, key-cnn).

## 12. BeatNet+ (Heydari and Duan, TISMIR 2024): beats and downbeats (added in gap round 2)

Not run here (not attempted): BeatNet+ installs from its cloned repository (`pip install -e .`; no PyPI project), the
kind of step this box's permission system refused each time this lane tried one (trials.md, "Not run here"). Facts below
are from the repository at commit bb90eb0 (2026-04-13), read 2026-11-11 and again 2026-11-12: the README,
`setup.py` (`python_requires='>=3.8'`; numpy, cython, librosa, scipy, mido, pytest, madmom>=0.16.1, torch, matplotlib,
tensorboard, pyyaml) and `src/BeatNetPlus/inference.py`. The three weight files are in `src/BeatNetPlus/models/`
(`generic_weights.pt` 3,072,825 bytes, `generic_main_weights.pt` 3,072,890, `af_non_percussive_weights.pt` 3,073,019).
madmom 0.16.1 has to be compiled; the steps below use WSL (Ubuntu) and the install that worked for BeatNet on this box
(trials.md, BeatNet: Python 3.9 avoids the madmom edits the BeatNet+ README's "Troubleshooting" lists for Python >= 3.10;
that README also says "Alternatively, use Python 3.9 where these aliases still exist.").

1. In WSL (Ubuntu): `sudo apt install git build-essential`, then install uv (https://docs.astral.sh/uv/).
2. `uv venv --python 3.9 bnp`, `source bnp/bin/activate`, `uv pip install "numpy==1.23.5" "scipy<1.11" mido "cython<3"
   "setuptools<81" wheel soundfile`, `uv pip install --no-build-isolation madmom==0.16.1`, `uv pip install torch
   "librosa==0.10.2.post1" matplotlib pyyaml tensorboard "numpy==1.23.5"` (naming numpy again keeps it at 1.23.5; for a
   CPU-only torch add uv's `--torch-backend cpu` to that command, which this box sets with `UV_TORCH_BACKEND=cpu`).
   (Changed on 2026-11-12: the 2026-11-11 text asked to hold numpy without naming it in the command, and suggested
   `--index-url https://download.pytorch.org/whl/cpu`, which would also send numpy and librosa to that index.)
3. `git clone https://github.com/mjhydri/BeatNet-Plus.git`, `cd BeatNet-Plus` (the README writes `cd beatnet_plus`; the
   clone's folder is `BeatNet-Plus`), `uv pip install --no-deps -e .` (README: `pip install -e .`; `--no-deps` keeps
   the numpy and madmom above).
4. Copy this lane's `scripts/beatnetplus_run.py` into the clone and the clips into `clips/`, then for each of S3, S4,
   R1a, R1b, R1c and R2: `python beatnetplus_run.py --audio clips/S3.wav --outdir out/S3`. It runs `generic_weights.pt`
   and `af_non_percussive_weights.pt`, each in online mode (particle filter) and offline mode (madmom DBN), with the
   README's `BeatNetPlusInference(...)` and `process(...)` calls, and writes beat and downbeat files and
   `timings_bnp.json`. The script was written here and not run (no BeatNet+ code ran on this box).
5. Send back: the whole `out` folder and the console output. License: no license file and no license statement in the
   repository (survey.md, BeatNet+); the README's training data include MUSDB18 ("other-nc") and the RWC databases.

## 13. AudioEstimate (Hugging Face `DionTimmer/audioestimate-1.0`): key and BPM (added in gap round 2)

Not run here: the model's files sit behind a manual access request ("You need to agree to share your Hugging Face
information to access this model"), a consent step this lane does not take for you, and no public inference code was
found (no PyPI project, no public GitHub repository under the names tried; survey.md, AudioEstimate). The card says the
model "is used by the AudioEstimate Python package and Electron desktop app".

1. While logged in to Hugging Face, open https://huggingface.co/DionTimmer/audioestimate-1.0 and read the access
   conditions.
   Request access only if you accept them; the gate is "manual", so the author approves each request.
2. Send back: the conditions text (copy or screenshot) and whether access was granted. If it was, download the four
   small files `README.md`, `config.yaml`, `metrics.json` and `VERSION.md` (`model.pt` is 37,738,542 bytes and is not
   needed yet) and send them, with any link you find to the AudioEstimate Python package or desktop app. With those the
   lane can tell whether `model.pt` can be run on the test clips (S3, S4, R1a, R1b, R1c, R2) and under what license.

## 14. mixedkey (Go module, v0.1.0): key from mono PCM (added in gap round 2)

Not run here: the box has Go 1.24.7, but the `go get` and `go build` of the module were refused by the box's permission
system ("Reason: [Code from External]"; trials.md, "Gap round 2"). The lane's glue program is ready:
`docs/guitar-tab-research/lanes/chords-beats-key/scripts/gap2/mixedkey_run/main.go` (standard library only; it reads
16-bit PCM WAV files, mixes to mono, runs the four key profiles). It parses (`gofmt -e`) and uses only names defined in
mixedkey v0.1.0, but it was never compiled, so a first build may need a small fix (UNVERIFIED).

1. Install Go 1.24 or later for Windows from https://go.dev/dl/ (mixedkey's README: "Requires Go 1.24 or later.").
2. In PowerShell, in an empty folder `mixedkey_run`, copy `main.go` there, then run:
   `go mod init mixedkeyrun`
   `go get github.com/cabbagekobe/mixedkey@v0.1.0`
   `go build -o mixedkey_run.exe .`
3. Copy the clips into a `clips` folder and make an empty `out` folder (the program does not create it), then run once,
   timed: `Measure-Command { .\mixedkey_run.exe out clips\S3.wav clips\S4.wav clips\S2n.wav clips\S5capo2.wav
   clips\S5dropd.wav clips\S7flat30.wav clips\R1a.wav clips\R1b.wav clips\R1c.wav clips\R2.wav }`.
4. Send back: the `out` folder (per clip `<clip>.mixedkey.json` and four `<clip>.key_mixedkey_<profile>.txt` files),
   the console output and the `Measure-Command` time; if the build fails, the error text. Truth keys: S3 G major, S4 D
   major, S2n G major, S5capo2 A major, S5dropd G major, S7flat30 G major, R1a Ab minor, R1b C# major, R1c G major; R2
   none (the artist's page lists D# minor, per INPUTS.md). License: MIT (survey.md, mixedkey).

## Nothing to run (no released model or needs keys)

- Harmony Transformer v1 / v2 and ACR_seq2seq: no released weights (survey.md).
- ChordMini: needs Firebase and Gemini keys for the full app (survey.md).
- BEAST: evaluation script for preprocessed GTZAN data only.

## Gap round 1 note (gapfill-chords-beats-key, 2026-11-11)

Sections 1, 3, 4, 5, 6, 7 and 9 gained gap-round notes (what ran here since, and the new WSL route for libKeyFinder in
section 4). They were written after the verification log below and were then checked by verify-gapfill-chords-beats-key
on 2026-11-11 (log at the end of trials.md): the libkeyfinder and keyfinder-cli README commands and quotes in section 4
match the READMEs (main, and libkeyfinder's tag 2.2.8 has the same build commands), and the NATTEN changelog line in
section 5 matches. No step was changed; three notes were reworded (section 3: which clips the ONNX run covered; section 4:
the Mixxx remark is about Ubuntu's package, not Linux in general; section 7: "a stale copy" replaced by what the cached
copy held).

## Gap round 2 note (gapfill-chords-beats-key, 2026-11-11 and 2026-11-12)

Sections 10 (STONE), 11 (key-cnn) and 12 (BeatNet+) were written on 2026-11-11 by the first start of this round, which
was cut off at the run's stop, and were checked on 2026-11-12 against the same files fetched again (all unchanged; HEAD
commits unchanged). Changed then: the "Not run here" line of each (these three were not attempted, and why); section
11's TensorFlow 1.15.2 wheel list (Python 3.5, 3.6 and 3.7, not only 3.6 and 3.7) and the `deepsquare` model file;
section 12's third install command (numpy named so it stays at 1.23.5, and uv's `--torch-backend cpu` instead of a
PyTorch index URL). Sections 13 (AudioEstimate, gated) and 14 (mixedkey, whose build was refused here) were added on
2026-11-12. Not yet checked by a second agent.

## Verification log (verify-trials-chords-beats-key, 2026-11-10)

Each step was re-read against its source on 2026-11-10: the Sonic Visualiser download page and 4.1 reference manual,
the Vamp Plugin Pack page and the QM plugin documentation, the BTC, S-KEY, allin1, tempo-cnn (README.rst), Omnizart,
Beat Transformer and Hulme READMEs on raw.githubusercontent.com, the Mixxx download page, the Mixxx 2.5 manual (13.5 Key
Detection) and Mixxx's `2.5` branch source, PyPI JSON for allin1, tempocnn and omnizart, and the lane's `btc_run.py`.
Changed: the machine description at the top (no hardware details); step 1's menu and export instructions now quote the
4.1 manual and the QM plugin names come from the plugin documentation (two UNVERIFIED notes resolved, one narrowed to the
5.2.1 menu labels); step 4 adds what Mixxx's source shows about KeyFinder and the Preferences path from the manual; step
5's Python requirement now comes from PyPI (">=3.8"; "3.10 or 3.11" had no source) and the NATTEN text quotes the
README's Windows build steps; step 7 adds `bash` to the README's `docker run` command and the checkpoint facts from the
0.6.3 source; step 8 links the Colab notebook given in the README; step 9's UNVERIFIED note replaced by what the README
documents. Still UNVERIFIED: the Sonic Visualiser 5.2.1 menu labels, `poetry run skey` as a fallback, whether PyPI's
`torch` for Windows is a CPU build, whether Mixxx 2.5.6 for Windows includes KeyFinder, whether NATTEN builds on Windows
with the installed PyTorch and CUDA, and whether the Omnizart Docker image already holds its checkpoints.
