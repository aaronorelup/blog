# Lane 2, chords-beats-key: steps for Aaron

Written 2026-11-10 by try-chords-beats-key. These are the tools this lane could not run on the cloud box (reasons in
`trials.md`, section "Not run here"). Each block says which test clips to use, what to do on the Windows 11 laptop
(RTX 4070, 8 GB), and what to send back. The clips are the shared test inputs (`S3.wav`, `S4.wav`, `R1a.wav`, ...);
their contents and ground truth are described in `docs/guitar-tab-research/inputs/INPUTS.md`. Every clip id below means
the stereo file `<id>.wav`.

Anything marked UNVERIFIED was not checked against the product or repository today; the step may need adjusting.

## 1. Sonic Visualiser with the Vamp Plugin Pack (QM key detector, QM bar-and-beat tracker, Chordino in a GUI)

Covers: the QM Vamp plugins (not run here) and a GUI check of Chordino / NNLS Chroma (run here through Python).

1. Download Sonic Visualiser 5.2.1, "64-bit Windows installer", from https://www.sonicvisualiser.org/download.html and
   install it (the page says "No plugins are included with Sonic Visualiser itself").
2. Download the Vamp Plugin Pack Windows installer from https://www.vamp-plugins.org/pack.html ("Use this if you have
   64-bit Windows and are using 64-bit Vamp host applications") and run it; accept the Queen Mary and Matthias Mauch
   plugin libraries.
3. Open `S3.wav` in Sonic Visualiser. From the Transform menu (menu name from memory, UNVERIFIED), run in turn:
   the Queen Mary key detector, bar-and-beat tracker and tempo-and-beat tracker, and Chordino (its chord estimate
   output), each with default settings (the exact plugin names in the menu were not checked, UNVERIFIED; the QM README
   lists "Beat tracker and tempo estimator" and "Key estimator and tonal change detector", per survey.md).
4. For each result layer, export it (File menu, export annotation layer; UNVERIFIED wording) as CSV.
5. Repeat for `S4.wav`, `S7flat30.wav`, `R1a.wav`, `R1b.wav`, `R2.wav`.
6. Send back: the CSV files named `<clip>_<plugin>.csv`, and one screenshot of S3 with all layers visible. Time: about
   20 minutes. Cost: free (Sonic Visualiser is GPL v2 or later per its download page).

## 2. BTC (Bi-directional Transformer for chord recognition)

Not run here because the session refused to execute code from the cloned repository. The lane's wrapper script is
ready: `docs/guitar-tab-research/lanes/chords-beats-key/scripts/btc_run.py`.

1. Install Python 3.11 for Windows from python.org (tick "Add python.exe to PATH") and Git for Windows.
2. Open PowerShell in an empty folder and run:
   `git clone https://github.com/jayg996/BTC-ISMIR19`
   `py -3.11 -m venv btc`
   `btc\Scripts\activate`
   `pip install torch librosa==0.11.0 mir_eval pyyaml pretty_midi pandas soundfile`
   (this installs the CPU build of PyTorch, which is enough for 30-second clips; the GPU build comes from the selector
   on pytorch.org).
3. Copy `btc_run.py` from the blog repository into the same folder and the clips into a `clips` folder.
4. Run, for each of S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2, R2full:
   `python btc_run.py --audio clips\S3.wav --outdir out\S3 --repo BTC-ISMIR19`
5. Send back: the whole `out` folder (each clip has `chords_btc_majmin.lab`, `chords_btc_largevoca.lab`,
   `timings_btc.json`), and the text printed in PowerShell. Time: about 15 minutes plus install.
6. License note for the record: the repository's LICENSE is MIT (quoted in survey.md); the README says the training
   audio came "from online music service providers".

## 3. S-KEY (Deezer key detection)

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

The libkeyfinder README says maintenance passed to the Mixxx DJ software team (survey.md). Whether Mixxx 2.5.6 uses
libKeyFinder for its key column was not checked today (UNVERIFIED).

1. Install Mixxx 2.5.6 for Windows from https://www.mixxx.org/download/ (free; "There is no official paid or "pro"
   version of Mixxx").
2. Open Preferences and find the key detection settings; take a screenshot of the available detectors.
3. Add the clips folder to the library, select all clips, and run Analyze.
4. Send back: a screenshot of the library with the Key and BPM columns for S3, S4, S2n, S5capo2, S7flat30, R1a, R1b,
   R1c, R2, and the preferences screenshot.

## 5. All-In-One (allin1): beats, downbeats, BPM and song sections

1. Python 3.10 or 3.11; install PyTorch with CUDA from pytorch.org's selector.
2. NATTEN: the allin1 README says it is "Required for Linux and Windows"; follow the NATTEN install page for a build
   matching the installed PyTorch and CUDA (UNVERIFIED whether a Windows build exists for current versions).
3. `pip install git+https://github.com/CPJKU/madmom` then `pip install allin1` (both from the allin1 README).
4. Run `allin1 clips\S4.wav -o out` and the same for R1a, R1c, R2 and R2full. Each run first separates stems with
   Demucs, so the time includes separation.
5. Send back: the JSON files in `out` (keys `bpm`, `beats`, `downbeats`, `beat_positions`, `segments`), and the
   printed time for R2full (the whole song, 228.5 s).

## 6. tempo-cnn (global tempo)

1. Python 3.9, 3.10 or 3.11 (PyPI says `<3.12,>=3.9`): `pip install tempocnn` (it installs TensorFlow 2.17.0).
2. For each of S3, S4, S2n, S7flat30, R1a, R1b, R1c, R2, R2full: `tempo -i clips\S3.wav` (command form quoted in
   survey.md from the README).
3. Send back: the printed tempo per clip and the time each took.

## 7. Omnizart chord

1. Install Docker Desktop for Windows.
2. `docker run -it -v <clips folder>:/clips mctlab/omnizart:latest` (image name from the Omnizart README, quoted in
   survey.md; the mount syntax is standard Docker).
3. Inside the container: `omnizart download-checkpoints`, then `omnizart chord transcribe /clips/S3.wav` (README
   commands); repeat for S4, S2n, R1a, R1b, R1c, R2.
4. Send back: the MIDI and CSV files it writes (CSV fields `chord`, `start`, `end` per survey.md) and the run times.

## 8. Beat Transformer (beats and downbeats after Spleeter separation)

1. The README offers a Google Colab notebook for new music (survey.md). Open the repository page
   https://github.com/zhaojw1998/Beat-Transformer (address from survey.md),
   follow the Colab link, upload `S4.wav`, `R1a.wav` and `R2.wav`, and run all cells.
2. Send back: the beat and downbeat times it prints or saves, and a screenshot of the last cell.

## 9. Guitar open-string tuning classifier (Hulme et al.)

Research code; the README describes evaluation scripts and keeps models and test sets on Google Drive (survey.md). The
evaluation code's five classes are DADGAD, Drop D, Open D, Open G and Standard.

1. Only if you want to try it: clone https://github.com/edhulme/guitar-tuning-classification, `pip install tensorflow
   matplotlib scikit-learn seaborn` (README), download the models from the README's Google Drive link.
2. Run its classifier on `S5dropd.wav` (truth: Drop D) and `S2n.wav` (truth: Standard). How to feed a new file is not
   documented in the README (UNVERIFIED).
3. Send back: the predicted class for each clip, or the error message if it cannot take a new file.

## Not worth Aaron's time

- Harmony Transformer v1 / v2 and ACR_seq2seq: no released weights (survey.md).
- ChordMini: needs Firebase and Gemini keys for the full app (survey.md).
- BEAST: evaluation script for preprocessed GTZAN data only.
