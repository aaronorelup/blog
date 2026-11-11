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
