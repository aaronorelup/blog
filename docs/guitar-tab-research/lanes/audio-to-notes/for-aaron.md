# Lane audio-to-notes: steps for Aaron

Written 2026-11-10 by `try-audio-to-notes`. These are the tools of this lane that did not run on the cloud box (the
reasons are in `trials.md`). Each entry says what to run on the Windows 11 laptop (RTX 4070, 8 GB) or in the
product's own app or web page, which test clip to use, and what to send back.

**The clips.** Use the shared test clips by id. The audio files are on the research box under
`/home/user/gtr/inputs/<id>/<id>.wav` (the orchestrator files the audio in the studio library; the truth files are in
`docs/guitar-tab-research/inputs/<id>/`). The ones used below:

- `S1.wav` single-note melody (nylon guitar, 30 s); `S2n.wav` two-voice fingerstyle (nylon, 29 s);
  `S3.wav` strummed chords (steel, 24 s); `S4.wav` band mix (39 s) and `S4/stems/lead.wav` (the lead line alone);
- `R1b.wav` real guitar solo (GuitarSet, 29 s); `R1c.wav` real bossa nova comping (GuitarSet, 28 s);
- `R2.wav` real band excerpt with singing (36 s, no truth).

**What to send back, for every tool** (put it in one folder per tool, named after the tool):

1. The output files exactly as the tool wrote them (MIDI `.mid`, CSV, JSON), renamed `<clip>.<tool>.<ext>`, for
   example `S2n.yourmt3.mid`.
2. How long each clip took (a stopwatch is fine) and on what (laptop CPU, laptop GPU, or the web service).
3. A screenshot of the settings you used and of the result.
4. The version number shown by the tool (in its About box, its download page, or its `--version` output).

The research agents then score the files against the truth with `gtr-eval`, the same way as the box runs.

What the entries have in common: a sign-in or download form, a GPU, a desktop app, a build or code run that this
session's permissions refused, or a download larger than the shared box's disk allowed.

---

## 1. YourMT3+ (multi-instrument transcription), in its web demo

Not run here: the demo refused the box's anonymous call for lack of free GPU quota ("You have exceeded your ZeroGPU
quota (90s requested vs. 79s left). Try again in 6:54:35. Authenticate with a Hugging Face token for more quota").

1. Make a free Hugging Face account at https://huggingface.co and sign in (signed-in users get more of the free GPU
   time, per the message above).
2. Open https://huggingface.co/spaces/mimbres/YourMT3 . It shows the model name it uses (on 2026-11-10 the app code
   set `YPTF.MoE+Multi (noPS)`).
3. Upload `S4.wav` and start the transcription. Wait for the MIDI player to appear.
4. Save the MIDI file from the player (if there is no download button, take a screenshot of the player and say so).
5. Repeat with `S2n.wav`, `R1c.wav` and `R2.wav` (one at a time; each clip is under 40 s).
6. Send back the four `.mid` files, a screenshot of the page with the model name, and the time each one took.

Cost: no price is shown for the demo; it runs on Hugging Face's shared ZeroGPU quota.

## 2. MT3 (Google Magenta multi-instrument transcription), in its official Colab notebook

Not run here: MT3 runs on JAX/T5X with checkpoints on Google Cloud Storage; installing its stack was over the box's
disk limit, and there is no official Hugging Face demo (the community Space `akhaliq/MT3` was in RUNTIME_ERROR).

1. Open the notebook linked from MT3's README:
   https://colab.research.google.com/github/magenta/mt3/blob/main/mt3/colab/music_transcription_with_transformers.ipynb
   and sign in with a Google account.
2. Menu Runtime > Change runtime type > pick a GPU, then Save.
3. Run the cells from the top in order (the triangle on each cell). The README says the notebook offers two
   checkpoints, "the piano transcription model" (ISMIR 2021) and "the multi-instrument transcription model" (ICLR
   2022): pick the multi-instrument one; keep the other defaults.
4. When the upload cell runs, upload `S4.wav`. Run the transcription cell, then the cell that downloads the MIDI.
5. Repeat the upload and transcription for `S2n.wav` and `R1c.wav`. If time allows, run once more with the piano
   model on `S2n.wav`.
6. Send back the `.mid` files, a screenshot of the model choice, and how long the transcription cell took.

Cost: free Colab tier (GPU availability varies).

## 3. NeuralNote (desktop app and plugin)

Not run here: it is a desktop plugin and standalone app with no command line (README, read 2026-11-10). Its README
says v2 transcribes with MuScriptor models it downloads on first start (about 210 MB `small`, 620 MB `medium`,
2.7 GB `large`) and that "A GPU is strongly recommended for the `medium` and `large` models".

1. Download `NeuralNote_Installer_Windows_x64.exe` from https://github.com/DamRsn/NeuralNote/releases (the README
   says Windows may warn because it is not code signed).
2. Install it and open the Standalone app. When it asks, download the `small` model (and `medium` if the GPU works).
3. Drop `S2n.wav` on the window. In the left panel pick the instrument (guitar) or `Automatic`. Click `Transcribe`.
4. When it finishes, save the MIDI file. Note which model size was used.
5. Repeat with `S4.wav` (instrument `Automatic`) and `R1c.wav` (guitar).
6. Send back the `.mid` files, a screenshot of the window after each transcription, and the time each took.

## 4. CREPE (the original TensorFlow package)

Not run here: it needs TensorFlow (the Linux wheel is 475 MB), over the box's disk limit. The same CREPE weights did
run here through torchcrepe and through Essentia's CREPE models.

1. Install Python 3.11 from https://www.python.org/downloads/windows/ (tick "Add python.exe to PATH").
2. Open "Command Prompt" and type: `py -3.11 -m pip install crepe tensorflow`
3. Put `S1.wav`, `R1b.wav` and `S4/stems/lead.wav` (rename it `S4lead.wav`) in one folder, `cd` into it, and run
   once per file (the README's form): `py -3.11 -m crepe S1.wav --viterbi`, then the same for `R1b.wav` and
   `S4lead.wav`. (`--viterbi` turns on its smoothing; the default step is 10 ms.)
4. Per the README it writes `S1.f0.csv` (columns `time,frequency,confidence`) next to each file.
5. If it stops with a TensorFlow or Keras error, run `py -3.11 -m pip install "tensorflow<2.16"` and try again
   (which TensorFlow versions crepe 0.0.16 works with was not checked here).
6. Send back the three `.f0.csv` files, the output of `py -3.11 -m pip show crepe tensorflow` (versions), any error
   text, and the time each file took.

## 5. MELODIA (Vamp plugin) in Sonic Visualiser

Not run here: the download page (https://www.upf.edu/web/mtg/melodia) answered HTTP 403 to the box. The docs lane
reports a download form and "free of charge for non-commercial use only". The same algorithm ran here inside
Essentia (`PredominantPitchMelodia`).

1. Install Sonic Visualiser for Windows from https://www.sonicvisualiser.org/download.html .
2. Download the MELODIA plugin for Windows 64-bit from the MTG page above (fill in the form), unzip it, and copy the
   plugin files it contains (the `.dll`, and any `.cat` or `.n3` file next to it) into
   `C:\Program Files\Vamp Plugins` (create the folder if needed).
3. Open `S4.wav` in Sonic Visualiser. In the Transform menu find MELODIA (listed by plugin name or by maker, MTG)
   and its melody output. Keep the defaults and click OK.
4. Menu File > Export Annotation Layer, save as `S4.melodia.csv`.
5. Repeat with `S4lead.wav` and `R2.wav`.
6. Send back the CSV files and a screenshot of the plugin's settings dialog.

## 6. pYIN notes (Vamp plugin) through Tony

Not run here: building the pYIN Vamp plugin from its source was refused by this session's permission settings
(code from an external source). Tony is the desktop app built on pYIN that shows the pitch track and the notes.

1. Install Tony for Windows from https://www.sonicvisualiser.org/tony/ (the source is `sonic-visualiser/tony`).
2. Open `S1.wav`. Tony analyses it on opening and shows the pitch curve and note blocks.
3. Export the notes (menu File > Export Note Data, or the closest item) as CSV, and the pitch track the same way.
4. Repeat with `R1b.wav` and `S4lead.wav`.
5. Send back the note and pitch CSV files, the Tony version (Help > About), and a screenshot of `S1.wav` in Tony.

## 7. Omnizart (music and vocal transcription)

Not run here: Omnizart 0.6.3 requires TensorFlow (`tensorflow>=2.5.0`), over the box's disk limit, so no install
attempt was made. Whether it installs on Windows is UNVERIFIED (it also depends on madmom and vamp).

Route without a local install: the README links a Colab notebook,
https://colab.research.google.com/github/Music-and-Culture-Technology-Lab/omnizart/blob/master/colab.ipynb (and a
Replicate page). In Colab: sign in, run the cells in order, upload `S2n.wav`, choose the `music` mode, download the
MIDI; repeat with `S4.wav`, and with `R2.wav` in the `vocal` mode. Local route (README commands):

1. Install Python 3.11 as in step 4.1. In Command Prompt: `py -3.11 -m pip install omnizart`
2. Run `omnizart download-checkpoints`.
3. In the folder with the clips: `omnizart music transcribe S2n.wav` and `omnizart music transcribe S4.wav`, then
   `omnizart vocal transcribe R2.wav`.
4. Send back the `.mid` files it writes, the full text of any error, and `py -3.11 -m pip show omnizart`.
   If the install fails, send the error text: that is a result too.

## 8. Sheet Sage (lead sheet: melody and chords)

Not run here: its README requires Linux with Docker and a ~4 GB container; its Jukebox mode needs "a GPU w/ at least
12GB memory" (the laptop has 8 GB), so only the default mode applies. Its models are CC BY-NC-SA 3.0 (README).

1. Install WSL2 with Ubuntu (Microsoft Store: "Ubuntu") and Docker Desktop with the WSL2 backend.
2. In the Ubuntu window run the README's one-time setup:
   `ROOT=https://raw.githubusercontent.com/chrisdonahue/sheetsage/main; wget $ROOT/prepare.sh && wget $ROOT/sheetsage.sh && chmod +x *.sh && ./prepare.sh`
3. Copy `R2.wav` and `S4.wav` into the Ubuntu home folder and run `./sheetsage.sh R2.wav` and
   `./sheetsage.sh --beats_per_minute_hint 116 S4.wav`.
4. Send back everything it writes (lead sheet PDF, MIDI, any JSON) and the time each took.

## 9. RMVPE (pitch tracker)

Not run here: the pip package `rmvpe-onnx` 0.2.3 downloads `rmvpe.onnx` (361,688,443 bytes) from the Hugging Face
repo `lj1995/VoiceConversionWebUI`, over the box's per-download disk limit.

1. With Python 3.11 installed: `py -3.11 -m pip install "rmvpe-onnx[cli]"`
2. Run its command-line tool on `S1.wav`, `R1b.wav` and `S4lead.wav` (the package's README at
   https://github.com/NewComer00/rmvpe-onnx shows the command; it downloads the model on first use).
3. Send back the pitch files it writes and the time per clip.

## 10. Timbre-Trap (multi-pitch), MR-MT3, hFT-Transformer, Onsets and Frames: research code

These need a programmer's setup (git, Python, the repositories' own scripts). Not run here: Timbre-Trap's code and
checkpoint (`tt-orig.pt`, 11.35 MB, from the Space `cwitkowitz/timbre-trap`, which was in RUNTIME_ERROR) were
downloaded, but running the cloned repository and loading its pickled checkpoint was refused by this session's
permission settings; MR-MT3's README installs TensorFlow 2.11, t5 0.9.3 and ddsp (over the disk limit);
hFT-Transformer is a piano model whose README lists GPU machines and whose checkpoints are CC BY-NC-SA 4.0 (two
piano models, Transkun and ByteDance, ran here instead); Onsets and Frames lives in the `magenta/magenta` repository,
which the docs lane reports as archived. Suggested: ask a coding agent on the laptop to run Timbre-Trap's
`model.transcribe()` on `S2n.wav`, `S3.wav` and `R1c.wav` (README settings) and to save the multi-pitch frames as
JSON; send back those files. The others are optional.

## 11. MuScriptor (Kyutai and Mirelo), new in the docs lane's survey

Not run here: the weights are gated on Hugging Face (sign-in and acceptance), and the box has no Hugging Face token.
NeuralNote v2 (entry 3) uses MuScriptor models, so entry 3 covers it in an app. The docs lane lists a web demo at
`muscriptor.kyutai.org` (not opened by this agent): if it is open, upload `S4.wav`, `S2n.wav` and `R1c.wav` and send
back the MIDI (and MusicXML or tab PDF, if offered) with a screenshot of the settings.
