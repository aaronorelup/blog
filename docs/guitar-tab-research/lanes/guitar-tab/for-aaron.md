# guitar-tab lane: what Aaron can run himself

Written 2026-11-10 by `try-guitar-tab`. These are the guitar-tab tools that did not run on the research box (no GPU,
and the session could not install code straight from GitHub repositories; see `trials.md`, "Tools NOT RUN here").
The steps are written for a Windows computer with an NVIDIA GPU (CUDA), or for the tool's own app; none of them was
tried from the research box.

Where the files come from:

- Audio clips (`S2n.wav`, `S5capo2.wav`, `S5dropd.wav`, `R1a.wav` ...): the shared test inputs, described in
  `docs/guitar-tab-research/inputs/INPUTS.md`. The audio is not in git; per `PLAN.md` the orchestrator files audio in
  your studio library. The R1 clips can also be cut from GuitarSet (Zenodo record 3371780): R1a is the first 29.159 s
  of `02_SS2-107-Ab_comp_mic.wav`, R1b the first 29.333 s of `04_Rock1-90-C#_solo_mic.wav`, R1c the first 28.235 s of
  `00_BN3-119-G_comp_mic.wav` (from `INPUTS.md`).
- MIDI files for the MIDI-to-tab tools: `docs/guitar-tab-research/lanes/guitar-tab/samples/lane-inputs/<id>.merged.mid`
  (in git, under 2 KB each). These are the exact notes of each clip in one track.
- The correct answers (string and fret of every note) are in `docs/guitar-tab-research/inputs/<id>/<id>.truth.json`
  and `<id>.tab.txt`. Send the outputs back; the scoring is done on the box with `gtr-eval tab`.

General setup once: install Python 3.11 from python.org (tick "Add python.exe to PATH"), install Git for Windows
(git-scm.com), then in a Command Prompt run `pip install uv`.

## 1. Guitab (audio to Guitar Pro 5 with strings and frets)

What it is: a model that turns a solo steel-string fingerstyle recording into a `.gp5` tab
(https://github.com/DanieleMorotti/guitab, version 1.2.0; weights CC BY-NC-SA 4.0, non-commercial, per its README and
model card). The README says a 4-minute song "takes well under a minute and 1–2 GB of GPU memory". The code is MIT
licensed (README).

Option A, no install (browser version): open https://danielemorotti.github.io/guitab/ in Chrome or Edge. (The page's
HTML was fetched from the research box on 2026-11-10 but it was not run there. The README says it gives "the same .gp5
as the Python pipeline, **byte for byte**" at 22.05 kHz, and "Audio at other sample rates is resampled by the browser
instead of librosa, so its results are close but not identical"; the shared clips are 44.1 kHz.) The control names
below are from that page's HTML: an Upload button, a Capo stepper (0 to 12, "Capo 0 = no capo") and a Transcribe
button ("Upload or record a recording and press Transcribe").

1. Upload `S2s.wav` (steel string). Leave every setting at its default (Capo 0). Press Transcribe.
2. Save the `.gp5` it offers. Time how long it took (a phone stopwatch is fine).
3. Repeat with `S5capo2.wav` twice: once with Capo 0 and once with the Capo stepper at 2.
4. Repeat with `R1a.wav`, `R1b.wav`, `R1c.wav` (real recordings) and `S3.wav` (strummed chords), defaults.

Option B, installed on the computer (the README's steps; the README: "Every command takes `--device
auto|cuda|mps|cpu`. The default, `auto`, uses an NVIDIA GPU if present, else the Apple GPU, else the CPU."):

1. In a Command Prompt: `git clone https://github.com/DanieleMorotti/guitab` then `cd guitab`.
2. `uv venv .venv --python 3.11`
3. `uv pip install --python .venv\Scripts\python.exe -r requirements.txt` then
   `uv pip install --python .venv\Scripts\python.exe -e . --no-deps`
4. To use the GPU, check the torch build: `.venv\Scripts\python.exe -c "import torch; print(torch.cuda.is_available())"`
   must print `True`. If it prints `False`, install the CUDA build of torch as pytorch.org describes, then repeat (the
   README: "for another CUDA version or a CPU-only build, install `torch` first as described on pytorch.org").
5. Run, one clip at a time: `.venv\Scripts\guitab --audio S2s.wav --out_dir out\S2s` (the first run downloads the
   weights by itself).
6. Capo test: `.venv\Scripts\guitab --audio S5capo2.wav --out_dir out\S5capo2_nocapo` and
   `.venv\Scripts\guitab --audio S5capo2.wav --out_dir out\S5capo2_capo2 --capo 2`.
7. Other clips: S2n, S3, S5dropd, R1a, R1b, R1c (defaults). Guitab has no tuning option (none in the README's option
   list; `guitab/guitar.py` begins "Guitar constants shared by the whole pipeline (standard tuning)."), so S5dropd
   shows what happens to the low D notes.

Send back: every `.gp5` and `.tokens.txt` file (keep the folder names), how long each clip took, and a screenshot of the
settings if you used the browser version.

## 2. The real `hf_midi_transcription` command (Riley et al. guitar note models)

What it is: the authors' own command for the guitar models (GAPS and François Leduc checkpoints,
https://github.com/xavriley/hf_midi_transcription; weights https://huggingface.co/xavriley/midi-transcription-models,
card license MIT). The box ran the François Leduc checkpoint (`guitar-fl.pth`) through Kong's PyPI package and a few
lines of its own (see `trials.md`) on S2n and R1c; the GAPS checkpoint (`guitar-gaps.pth`, the CLI's default for
`guitar`) ran on the box on S2n only, in the verifier's run (`trials.md`, Riley section). The runs below give the
authors' own pipeline on S2n and R1c for comparison with the box's runs, and GAPS results for S3, R1b and R1c. Notes
only: it gives no strings or frets.

1. `git clone https://github.com/xavriley/hf_midi_transcription` then `cd hf_midi_transcription`.
2. `uv venv .venv --python 3.11` then `uv pip install --python .venv\Scripts\python.exe -e .`
3. Check the torch build: `.venv\Scripts\python.exe -c "import torch; print(torch.cuda.is_available())"` must print
   `True` for `--device cuda`. If it prints `False`, install the CUDA build of torch as pytorch.org describes, then
   repeat.
4. Run: `.venv\Scripts\midi_transcription S2n.wav S2n_gaps.mid --instrument guitar --device cuda --verbose` and the
   same for `S3.wav`, `R1b.wav`, `R1c.wav`. The CLI accepts only `saxophone`, `bass`, `guitar`, `piano` for
   `--instrument` (`guitar` uses `guitar-gaps.pth`, downloaded on first use); for the François Leduc model download
   `guitar-fl.pth` from the Hugging Face page into the same folder and add `--checkpoint guitar-fl.pth` to the S2n and
   R1c commands (output names `S2n_fl.mid`, `R1c_fl.mid`).

Send back: the `.mid` files, and the console text of each run. With `--verbose` the CLI prints a `Checkpoint:` line
(the path given, or `auto-selected`), and a run without `--checkpoint` (when no `guitar-gaps.pth` is in the current
folder) prints `Downloading guitar model from xavriley/midi-transcription-models...` and the path of the file it uses
(read from `cli.py` and `model.py` at commit `96f6797`).

## 3. Noise2Fret (diffusion model, audio to tab)

What it is: https://github.com/RiccardoVib/Noise2Fret (MIT); checkpoints on Zenodo record 23361924 (CC BY 4.0, two zip
files of about 111 MB). Its README has no command for one audio file: inference goes through its training scripts with
`TRAIN_MODEL=False` over a dataset folder that its preprocessing scripts build from GuitarSet or GOAT ("To run
inference only on an existing pre-trained model, set the "train_model" flag to False. In this case, ensure you have
the existing model and dataset (to use for inference) both in their respective directories"). Running it on the
shared clips therefore needs a new script that the repository does not contain.

What would settle it: an inference script from the authors for a single audio file. If you want to ask them, the
question is "is there a way to run the published checkpoints on one WAV file and get the tablature out?". Nothing to
send back until then.

The same holds for **Guitar-Transcription-CNN-MTL** (weights at https://huggingface.co/MehmetErenn0/guitar-transcription-cnn-mtl,
card license MIT; code https://github.com/ErenReyhanlioglu/Guitar-Transcription): its README runs inference through
`evaluate.py` over GuitarSet features made by `extract_features.py`, fold by fold, not on a single file.

## 4. gtrsnipe (MIDI to tab with tuning options)

What it is: https://github.com/scottvr/gtrsnipe, a MIDI / ASCII tab converter with a Viterbi fretboard mapper and named
or custom tunings (`--tuning`, `--tuning-pitches`). License, per the docs lane: PolyForm Noncommercial 1.0.0 plus a
paid commercial licence.

1. `git clone https://github.com/scottvr/gtrsnipe` then `cd gtrsnipe`, `uv venv .venv --python 3.11`,
   `uv pip install --python .venv\Scripts\python.exe -e .`
2. Copy the files from `samples/lane-inputs/` next to it.
3. Run: `.venv\Scripts\gtrsnipe -i S2n.merged.mid -o S2n.tab`, the same for `S3`, `R1a`, `R1b`, `R1c`.
4. Drop D: `.venv\Scripts\gtrsnipe -i S5dropd.merged.mid -o S5dropd_std.tab` and
   `.venv\Scripts\gtrsnipe -i S5dropd.merged.mid -o S5dropd_dropD.tab --tuning-pitches D2,A2,D3,G3,B3,E4`.
5. Capo: `.venv\Scripts\gtrsnipe -i S5capo2.merged.mid -o S5capo2_nocapo.tab` and
   `.venv\Scripts\gtrsnipe -i S5capo2.merged.mid -o S5capo2_capo2.tab --capo 2` (the option exists at commit
   `a9be933`, `gtrsnipe/arguments.py`: "Specify a capo position. All fret numbers will be relative to the capo.").
6. `.venv\Scripts\gtrsnipe --help > help.txt` (the options above were read at commit `a9be933`, dated 2026-11-10,
   the day these steps were written; the help text shows the version you install).

Send back: the `.tab` files and `help.txt`.

## 5. String assignment in desktop tab editors (TuxGuitar, MuseScore with FretPath, Guitar Pro 8)

What it is: what these programs do when they import a MIDI file onto a guitar tab staff. The MIDI-to-Tab paper
(arXiv 2408.05024) compares its model with MuseScore, Guitar Pro 8 and TuxGuitar, and the Fretting-Transformer paper
(arXiv 2506.14223) with TuxGuitar and Guitar Pro (their arXiv HTML pages, read 2026-11-10). TuxGuitar (LGPL-2.1) and
MuseScore Studio (GPL-3.0) are open source per the web-tab-render lane's survey; Guitar Pro 8's full version is listed
at "$69.95" per the apps-survey lane's survey (include it only if you already own it).

TuxGuitar (tuxguitar.app; the menu names below were not checked against the current version, so if they differ,
use the program's MIDI import, its track tuning and capo settings, and its Guitar Pro 5 export. In the TuxGuitar 1.5.6
installed on the research box, its language file names the menus File > Import > Import MIDI, File > Export and
Track > Properties, the tuning dialog has Presets, Strings and an Offset field, and its Guitar Pro plugin contains a
"Guitar Pro 5" writer; the program itself was not opened):

1. File > Import > MIDI, choose `S2n.merged.mid`. Keep the default import settings; take a screenshot of the import
   dialog.
2. File > Export > Guitar Pro 5 (`.gp5`) as `S2n_tuxguitar.gp5`.
3. Repeat for `S3`, `R1a`, `R1b`, `R1c`, `S5capo2`, `S5dropd`. For `S5dropd`, also once with the track's tuning set to
   Drop D (Track > Properties > Tuning) before export, as `S5dropd_tuxguitar_dropD.gp5`; for `S5capo2`, once with the
   capo set to 2, as `S5capo2_tuxguitar_capo2.gp5`.

MuseScore 4 with the FretPath plugin (https://github.com/knoguchi/fretpath; per the docs lane's survey GPL v3 and
MuseScore Studio 4.4 or later). The steps below follow its README (commit `5e4fb42`):

1. Download the repository (GitHub's Code > Download ZIP), copy the folder to `Documents\MuseScore4\Plugins` and
   restart MuseScore; enable the plugin in Home > Plugins.
2. Open `S2n.merged.mid` in MuseScore.
3. Open the Instruments panel (I), search "tablature" and add "Classical Guitar (tablature)" (the README: "The plugin
   treats the last staff as the TAB target").
4. Plugins > Composing/arranging tools > FretPath, keep "Write to TAB staff" (the default), press Run.
5. Export MusicXML (`.musicxml`) as `S2n_fretpath.musicxml`. Repeat for the clips above; for `S5dropd`, the README says
   alternate tunings "are read automatically from the instrument's string data", so set the tab staff's strings to
   Drop D before Run for a second file `S5dropd_fretpath_dropD.musicxml`.

Send back: every `.gp5` / `.musicxml` file and the screenshots of the import and plugin settings.

## Nothing to run (no trained model is published)

TabCNN's original code, FretNet, guitar-transcription-with-inhibition, Fretting-Transformer, MIDI-to-Tab, TART,
Audio2Tab and GuitarTab publish code or papers but no trained model that the research found (sources in `trials.md`;
Audio2Tab's README says under "Checkpoints": "We will host a checkpoint here soon!"). Running them means training them
first; no training steps are listed here.
