# guitar-tab lane: what Aaron can run himself

Written 2026-11-10 by `try-guitar-tab`. These are the guitar-tab tools that did not run on the research box (no GPU,
and the session could not install code straight from GitHub repositories; see `trials.md`, "Tools NOT RUN here").
The steps are written for a Windows 11 laptop with an 8 GB RTX 4070, or for the tool's own app; none of them was
tried from the research box.

Where the files come from:

- Audio clips (`S2n.wav`, `S5capo2.wav`, `S5dropd.wav`, `R1a.wav` ...): the shared test inputs, described in
  `docs/guitar-tab-research/inputs/INPUTS.md`. The audio is not in git; the orchestrator files it in your studio library.
- MIDI files for the MIDI-to-tab tools: `docs/guitar-tab-research/lanes/guitar-tab/samples/lane-inputs/<id>.merged.mid`
  (in git, under 2 KB each). These are the exact notes of each clip in one track.
- The correct answers (string and fret of every note) are in `docs/guitar-tab-research/inputs/<id>/<id>.truth.json`
  and `<id>.tab.txt`. Send the outputs back; the scoring is done on the box with `gtr-eval tab`.

General setup once (about 10 minutes): install Python 3.11 from python.org (tick "Add python.exe to PATH"), install
Git for Windows (git-scm.com), then in a Command Prompt run `pip install uv`.

## 1. Guitab (audio to Guitar Pro 5 with strings and frets)

What it is: a model that turns a solo steel-string fingerstyle recording into a `.gp5` tab
(https://github.com/DanieleMorotti/guitab, version 1.2.0; weights CC BY-NC-SA 4.0, non-commercial, per its README and
model card). The README says a 4-minute song "takes well under a minute and 1–2 GB of GPU memory". Free.

Option A, no install (browser version): open https://danielemorotti.github.io/guitab/ in Chrome or Edge. (Not opened
from the research box. The README says it gives "the same .gp5 as the Python pipeline, **byte for byte**" at 22.05 kHz,
and "Audio at other sample rates is resampled by the browser instead of librosa, so its results are close but not
identical"; the shared clips are 44.1 kHz.)

1. Load `S2s.wav` (steel string). Leave every setting at its default. Press Transcribe.
2. Save the `.gp5` it offers. Time how long it took (a phone stopwatch is fine).
3. Repeat with `S5capo2.wav` twice: once with capo 0 and once with the capo set to 2.
4. Repeat with `R1a.wav`, `R1b.wav`, `R1c.wav` (real recordings) and `S3.wav` (strummed chords), defaults.

Option B, on the laptop (needs the GPU and the steps from the README):

1. In a Command Prompt: `git clone https://github.com/DanieleMorotti/guitab` then `cd guitab`.
2. `uv venv .venv --python 3.11`
3. `uv pip install --python .venv\Scripts\python.exe -r requirements.txt` then
   `uv pip install --python .venv\Scripts\python.exe -e . --no-deps`
4. Check the GPU build of torch: `.venv\Scripts\python.exe -c "import torch; print(torch.cuda.is_available())"` must
   print `True`. If it prints `False`, install the CUDA build of torch as pytorch.org describes, then repeat.
5. Run, one clip at a time: `.venv\Scripts\guitab --audio S2s.wav --out_dir out\S2s` (the first run downloads the
   weights by itself).
6. Capo test: `.venv\Scripts\guitab --audio S5capo2.wav --out_dir out\S5capo2_nocapo` and
   `.venv\Scripts\guitab --audio S5capo2.wav --out_dir out\S5capo2_capo2 --capo 2`.
7. Other clips: S2n, S3, S5dropd, R1a, R1b, R1c (defaults). Guitab has no tuning option (its code is standard tuning
   only), so S5dropd shows what happens to the low D notes.

Send back: every `.gp5` and `.tokens.txt` file (keep the folder names), how long each clip took, and a screenshot of the
settings if you used the browser version.

## 2. The real `hf_midi_transcription` command (Riley et al. guitar note models)

What it is: the authors' own command for the guitar models (GAPS and François Leduc checkpoints,
https://github.com/xavriley/hf_midi_transcription; weights https://huggingface.co/xavriley/midi-transcription-models,
card license MIT). The box ran the François Leduc checkpoint (`guitar-fl.pth`) through Kong's PyPI package and a few
lines of its own (see `trials.md`); the GAPS checkpoint (`guitar-gaps.pth`, the CLI's default for `guitar`) waited over
an hour for a CPU slot and did not run, so the GAPS runs below are the only ones there will be. Running the authors'
command on S2n and R1c also lets the box's FL results be compared. Notes only: it gives no strings or frets.

1. `git clone https://github.com/xavriley/hf_midi_transcription` then `cd hf_midi_transcription`.
2. `uv venv .venv --python 3.11` then `uv pip install --python .venv\Scripts\python.exe -e .`
3. Run: `.venv\Scripts\midi_transcription S2n.wav S2n_gaps.mid --instrument guitar --device cuda` and the same for
   `S3.wav`, `R1b.wav`, `R1c.wav`. The CLI accepts only `saxophone`, `bass`, `guitar`, `piano` for `--instrument`
   (`guitar` uses `guitar-gaps.pth`); for the François Leduc model download `guitar-fl.pth` from the Hugging Face page
   and add `--checkpoint guitar-fl.pth` to the S2n and R1c commands (output names `S2n_fl.mid`, `R1c_fl.mid`).

Send back: the `.mid` files, and the console text of one run (it prints the checkpoint it used).

## 3. Noise2Fret (diffusion model, audio to tab)

What it is: https://github.com/RiccardoVib/Noise2Fret (MIT); checkpoints on Zenodo record 23361924 (CC BY 4.0, two zip
files of about 111 MB). Its README has no command for one audio file: inference goes through its training scripts with
`TRAIN_MODEL=False` over a dataset folder that its preprocessing scripts build from GuitarSet or GOAT. Running it on
the shared clips therefore needs a small new script, which is not a non-programmer task.

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
5. Capo: run `.venv\Scripts\gtrsnipe --help > help.txt`; if it lists a capo option, run S5capo2 with and without it.

Send back: the `.tab` files and `help.txt`.

## 5. String assignment in desktop tab editors (TuxGuitar, MuseScore with FretPath, Guitar Pro 8)

What it is: what these programs do when they import a MIDI file onto a guitar tab staff. The MIDI-to-Tab paper
(arXiv 2408.05024) compares its model with MuseScore, Guitar Pro 8 and TuxGuitar, and the Fretting-Transformer paper
(arXiv 2506.14223) with TuxGuitar and Guitar Pro (their arXiv HTML pages, read 2026-11-10). TuxGuitar and
MuseScore are free; Guitar Pro 8 is paid (only if you already own it).

TuxGuitar (free, tuxguitar.app; the menu names below were not checked against the current version, so if they differ,
use the program's MIDI import, its track tuning and capo settings, and its Guitar Pro 5 export):

1. File > Import > MIDI, choose `S2n.merged.mid`. Keep the default import settings; take a screenshot of the import
   dialog.
2. File > Export > Guitar Pro 5 (`.gp5`) as `S2n_tuxguitar.gp5`.
3. Repeat for `S3`, `R1a`, `R1b`, `R1c`, `S5capo2`, `S5dropd`. For `S5dropd`, also once with the track's tuning set to
   Drop D (Track > Properties > Tuning) before export, as `S5dropd_tuxguitar_dropD.gp5`; for `S5capo2`, once with the
   capo set to 2, as `S5capo2_tuxguitar_capo2.gp5`.

MuseScore 4 with the FretPath plugin (https://github.com/knoguchi/fretpath; per the docs lane's survey GPL v3 and
MuseScore Studio 4.4 or later): install it as its README describes, import `S2n.merged.mid`, add a linked tablature staff, run the plugin,
export MusicXML (`.musicxml`). Repeat for the clips above.

Send back: every `.gp5` / `.musicxml` file and the screenshots of the import and plugin settings.

## Nothing to run (no trained model is published)

TabCNN's original code, FretNet, guitar-transcription-with-inhibition, Fretting-Transformer, MIDI-to-Tab, TART,
Audio2Tab and GuitarTab publish code or papers but no trained model that the research found (sources in `trials.md`).
Running them means training them first. The research did not find, in the papers read, a statement that training
them on one 8 GB GPU is practical, so no training steps are listed here.
