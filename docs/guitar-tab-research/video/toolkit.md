# Toolkit for the guitar-tab film

What is installed on the box for the experiments, and whether it reproduces the research.

## Sound

Installed 2026-11-25 under `/home/user/gtv/tools/` with the commands of `EXPERIMENTS.md` "Installs (box)"; detail,
exact commands and pins in `/home/user/gtv/tools/INSTALLED.md` ("Sound").

- **venv-torch** (Python 3.11): torch 2.15.0+cpu, Demucs 4.1.0, Beat This! 1.1.0, lv-chordia 1.1.0, Transkun 2.0.1,
  piano-transcription-inference 0.0.6, amt-tools 0.3.2, librosa 0.11.0, PyGuitarPro 0.11, tuttut 0.0.7, tabsynth 1.0.6,
  tayuya 0.0.4, partitura 1.9.0, music21 10.5.2. All import together: no split was needed.
- **venv-bp** (3.10): Basic Pitch 0.4.0 (tflite and onnx). **venv-madmom** (3.9): madmom 0.16.1.
  **venv-chordext** (3.11): chord-extractor 0.1.3 with vamp 1.1.0 (Chordino, NNLS Chroma, NNLS Tuning).
- **Weights** (`tools/models/`): guitar-gaps.pth, guitar-fl.pth, guitar_htdemucs_6s.pt (329,654,071 B),
  TabCNN Zenodo 11406378 (`tabcnn-zenodo/`, md5 checked).

Smoke test, one research clip per tool, scored with gtr-eval 0.12.1 against the number in the lane's trials.md:

| tool | clip | smoke | research | |
|---|---|---|---|---|
| Demucs htdemucs_6s | S4 | guitar SI-SDR 0.50 dB (e1857), repeat 1.25 dB (e1876) | 1.89 dB (e0095) | differs: random shift (`--shifts 1`) |
| htdemucs_6s guitar fine-tune | S4 | 6.10 dB (e1858) | 6.10 (e1831) | same |
| Basic Pitch | R1c | onset F1 0.790 (e1859) | 0.790 (e0489) | same |
| guitar-gaps / guitar-fl | R1b / R1c | 0.878 (e1861) / 0.890 (e1862) | 0.878 (e1437) / 0.890 (e1274) | same |
| Transkun | R1b | 0.803 (e1875) | 0.803 (e0435) | same |
| Beat This! / madmom beats | S4 | 0.956 (e1863) / 0.977 (e1864) | e1494 / e1492 | same |
| madmom CNN / Chordino / lv-chordia chords | S4, S4, S5capo2 | majmin 0.959 / 0.886 / 0.946 (e1865-e1867) | e1495 / e1496 / e1770 | same |
| librosa tuning | S7flat30 | -31 c (e1868) | -31 c (e0266) | same |
| TabCNN | R1c | 119 matched, all right string and fret (e1869) | e1736 | same |
| tuttut / tabsynth on truth notes | R1c / R1b | 0.811 (e1870) / 0.786 (e1871) | e0052 / e0386 | same |
| PyGuitarPro GP5 round trip | S4 | 223 of 369, 0.942 (e1874) | e1497 | same |

Every tool reproduces the research to the printed digit except Demucs, whose default random time shift moves the S4
guitar stem by up to 1.4 dB from run to run (two runs here: 0.50 and 1.25 dB; research 1.89 dB). Compare Demucs results
only with `--shifts 0` or over several runs.

## Picture and output

Installed under `/home/user/gtv/tools/` on 2026-11-25:

- `venv-video`: MediaPipe 1.2.2, OpenCV contrib 5.0.0.93, rtmlib 0.0.16, onnxruntime 1.31.1.
- `venv-api`: requests 2.34.2, gradio_client 2.7.2.
- `node/`: alphaTab 1.9.0, scorify 0.4.0, tutts 0.1.0 (from the npm cache).
- `venv-ultra`: Ultralytics 8.4.209, transformers 5.22.2, torch 2.15.0+cpu. Installed because 5.5 GB of disk was free. No model weights fetched yet (SAM 2.1, YOLOE, OWLv2 download on first use).

Shared scripts in `tools/bin/`: `crop_truth.py` (segment truth), `score_video_cells.py` (fingertip cells against the
tab: exact and within one fret, per shot, plus labelled frames), `notes2wav.py` (any note file gtr-eval reads, played
by FluidSynth on its own timeline, alone, mixed left/right with the recording, or alternating), `result.py`
(result.json write, validate, collect), `frames.py` (frames and a timed contact sheet), `vhf/` (the research's video
scripts reading frames straight from the MP4), `scorify_arrange.py`, `serve_gtv.cjs` and `shot.cjs`.

Smoke tests against the research's numbers:

| test | here | research |
|---|---|---|
| MediaPipe hands, R3c, 450 frames | both hands in 450/450, mean score 0.9885 (r0731) | 450/450, 0.989 |
| fret grid and fingertip cells, R3c frame 225, same neck outline | 14 line clusters, RMS 7.65 px; 4 of 5 fingertip cells the same, the pinky one string off (r0732) | 13 clusters, RMS 5.33 px (r0532) |
| alphaTab, `S4.madmom.span.gp5` | 18 bars, 1200 x 2353 px (r0749) | 18 bars, 1200 x 2353 px (r0523) |
| scorify, S1 and S5capo2 (capo 2) truth | same string and fret 1.0 (e1872) and 0.9889 (e1873) | 1.0000 (e1808), 0.9889 (e1816) |
| notes2wav, S1 truth | first rendered onset 6.4 ms after the first note | (new) |

The fret-grid difference comes from the frames: the research decoded them to JPEG files first, these scripts decode
the MP4 directly, and the line detector finds two more clusters. The pinky tip lies 0.6 px from the line between two
string lanes.
