# Lane 5, fingerstyle-voices-taps: survey of tools and research

Agent: docs-fingerstyle-voices-taps. Started 2026-11-10 (date from `date -u +%F`). Scope: one guitar played
fingerstyle, split into melody, bass and percussive taps (body hits, slaps, tapping); playing-technique detection on
guitar; drum transcription models that could be pointed at body percussion; symbolic voice separation. Everything
below was read from the live source on 2026-11-10 unless a line says otherwise. This file records facts and quotes
only; it does not rank or recommend. Tools in it were not run by this agent (the try agent's results are in
`trials.md`).

How dates and versions were read: PyPI versions and upload dates from `https://pypi.org/pypi/<package>/json`; the
last commit of a repository from a blobless `git clone --depth 1` (`git log -1 --format=%cI`), done with
`scripts/repo_facts.sh`; files inside a repository from those clones (`git show HEAD:<file>`) or from
`https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`. github.com web pages and api.github.com answer
403 through this box's proxy, so GitHub release pages were not read unless a line says so. Web pages were saved as
text with `scripts/page_text.py`, papers as PDF and converted with `pdftotext`, Zenodo records read through
`https://zenodo.org/api/records/<id>`, Hugging Face model metadata through `https://huggingface.co/api/models/<id>`
and model cards through `https://huggingface.co/<id>/raw/main/README.md`. The raw copies are kept outside the repo
in `/home/user/gtr/lanes/fingerstyle-voices-taps/raw/` (not committed). The three scripts named here are this
agent's; the other files in `scripts/` belong to the try agent.

Marks used in the tool list:

- `RUNNABLE`: published code that installs from PyPI or a public repository and whose own docs do not require a GPU,
  so it looks runnable on the CPU-only research box.
- `NO-CODE`: no published code was found (paper or dataset only).
- `DESKTOP` / `SERVICE`: commercial program or hosted service.

## Tool list

First pass written from web search results in the first minutes, then re-checked; each line now points to its own
section below, and the section is what counts. Dates: "PyPI x.y.z YYYY-MM-DD" is the latest release and its upload
date; "commit YYYY-MM-DD" is the last commit on the default branch on 2026-11-10. License shorthand here is only a
pointer; the quoted clauses are in the sections.

### Harmonic-percussive separation and NMF (signal level)

1. librosa `effects.hpss` / `decompose.hpss` (median-filter HPSS; `margin` > 1 leaves a residual) and
   `decompose.decompose` (NMF through scikit-learn). PyPI 1.0.0 2026-08-11 (needs Python >= 3.12), commit
   2026-11-10. ISC. https://github.com/librosa/librosa . RUNNABLE.
2. Essentia (MTG, UPF): no HPSS algorithm in its algorithm reference; onset algorithms below. PyPI 2.1b6.dev1438
   2026-05-19, commit 2026-11-05. AGPL-3.0 (its licensing page refers to a commercial licence from MTG).
   https://github.com/MTG/essentia . RUNNABLE.
3. libnmfd (AudioLabs Erlangen: NMF, NMF deconvolution, drum-extraction demos). PyPI 1.0.0 2024-08-09 (only
   release), commit 2024-08-09. MIT. https://github.com/groupmm/libnmfd . RUNNABLE.
4. scikit-learn `decomposition.NMF` (librosa's default decomposer). PyPI 1.9.1 2026-09-10. BSD-3-Clause. RUNNABLE.
5. torchnmf (PyTorch NMF). PyPI 0.3.5 2023-07-09. MIT per PyPI classifier. https://github.com/yoyololicon/pytorch-NMF .
6. nussl (HPSS, REPET and other separation classes). README: "**NUSSL IS DEPRECATED**". PyPI 1.1.9 2021-04-02,
   commit 2024-12-09. MIT. https://github.com/nussl/nussl .

### Onset detection (where taps and plucks start)

7. librosa `onset.onset_strength` / `onset_detect` / `onset_backtrack` (spectral flux, optional SuperFlux-style max
   filter). As item 1. RUNNABLE.
8. madmom (CPJKU): `CNNOnsetProcessor`, `RNNOnsetProcessor`, `SpectralOnsetProcessor` (SuperFlux),
   `OnsetPeakPickingProcessor`; CLI `CNNOnsetDetector`, `OnsetDetector`, `OnsetDetectorLL`, `SuperFlux`,
   `SuperFluxNN`, `ComplexFlux`. PyPI 0.16.1 2018-11-14 (sdist only); repository 0.17.dev0, commit 2024-08-25. Code
   BSD; model files CC BY-NC-SA 4.0. https://github.com/CPJKU/madmom . RUNNABLE (builds from source).
9. aubio: `aubioonset` / `aubio onset` CLI and `aubio.onset` Python (energy, hfc, complex, phase, specdiff, kl, mkl,
   specflux). PyPI 0.4.9 2019-02-08; repository 0.5.0-alpha, commit 2026-04-10. GPL-3.0-or-later.
   https://github.com/aubio/aubio . RUNNABLE (CLI on the box).
10. Essentia `OnsetDetection`, `OnsetDetectionGlobal`, `Onsets`, `OnsetRate`, `SuperFluxExtractor`. As item 2. RUNNABLE.
11. SuperFlux reference script (Böck). Commit 2014-11-02. BSD-style header. https://github.com/CPJKU/SuperFlux . RUNNABLE.
11b. QM Vamp Plugins "Note onset detector" (C4DM, Queen Mary). v1.8 January 2020, commit 2021-06-02. GPL-2.0 (QM
    Innovation offers other terms). https://github.com/c4dm/qm-vamp-plugins . RUNNABLE (Vamp host needed).

### Drum and percussion transcription (candidates for guitar-body taps)

12. ADTOF (Zehren et al.): 5-class drum transcription, Keras/TensorFlow, weights in the repository. Not on PyPI;
    commit 2025-09-18. README and LICENSE: CC BY-NC-SA 4.0 (setup.py classifier says GPLv3). Training data: ADTOF
    datasets, "internal non-commercial use", on request. https://github.com/MZehren/ADTOF .
13. ADTOF-pytorch (repository owner `xavriley`): PyTorch port with bundled converted weights, CLI `adtof`. Version 0.1.0, commit
    2025-11-11. No license file. https://github.com/xavriley/ADTOF-pytorch . RUNNABLE.
14. Omnizart `drum` mode (MCTLab): MIDI with kick, snare, hi-hat. PyPI 0.6.3 2026-05-31, commit 2026-05-31. Code MIT;
    weights from a 2021 release asset; training set "Pop" not downloadable.
    https://github.com/Music-and-Culture-Technology-Lab/omnizart . RUNNABLE.
15. Magenta Onsets and Frames, drums checkpoint trained on E-GMD (CC BY 4.0 data). Repository "currently inactive
    (archived, read only)"; checkpoint dated 2020-03-28; PyPI magenta 2.1.4 2022-08-01. Apache-2.0 code.
    https://github.com/magenta/magenta .
16. ADT_STR (Melucci, Merialdo, Akama; arXiv 2601.09520): drum MIDI with onsets, pitches, velocities, 26 classes,
    trained on synthesized audio. v1.0.0, commit 2026-09-19; weights on Hugging Face `Pierfrancesco/adt-str`.
    CC BY-SA 4.0 (GitHub). https://github.com/pier-maker92/ADT_STR . RUNNABLE (PyTorch).
17. Inverse Drum Machine (Torres, Peeters, Richard; IEEE TASLP 2025): drum separation with internal transcription
    and a manual onset override. Commit 2026-01-16, weights in the repository. Apache-2.0; trained on StemGMD
    (CC BY 4.0). https://github.com/bernardo-torres/inverse-drum-machine . RUNNABLE (CPU fallback in the example).
18. LarsNet (Mezza et al. 2024): 5-stem drum separator; weights 562 MB "licensed under CC BY-NC 4.0"; no code
    license file. Commit 2024-09-10. https://github.com/polimi-ispl/larsnet . RUNNABLE (`-d cpu` default).
19. drumsep (Goyeneche): Demucs-based 4-stem drum separator, weights from Google Drive. Commit 2025-11-03. MIT
    code. https://github.com/inagoy/drumsep . The MDX23C "DrumSep" model by aufr33 and jarredou is in the
    source-separation lane's survey.
20. ADTLib (Southall): kick, snare, hi-hat onsets and a drum tab. PyPI 2.1.2 2018-01-17, commit 2018-01-17. BSD,
    plus a "Free for non-commercial use" PyPI classifier. https://github.com/CarlSouthall/ADTLib .
21. Separate-and-Detect (Hugging Face `ddman1101/Separate-and-Detect`, 2026-07-31): latent-diffusion drum
    transcription and stem generation checkpoints; MIT on the card; code repository not linked. Riley and Dixon,
    arXiv 2509.24853 (2025): ADTOF plus drum stem separators to 7 classes and velocities.
22. STRUM (arXiv 2605.12135, 2026-05-12): audio-to-Clone-Hero-chart pipeline with a drum onset detector and
    classifier; the code link in the paper record is a placeholder. NO-CODE located.
23. Hi-Drum (project page https://hanguang9527.github.io/drum): self-supervised encoder plus a Qwen decoder for drum
    scores; no code link on the page. NO-CODE located.
24. Multi-instrument transcribers with a drum track (MT3, YourMT3+): in the audio-to-notes lane's survey.
25. Ableton Live "Convert Drums to New MIDI Track" (kick, snare, hi-hat; "tapping on a surface"). DESKTOP.
26. Klangio Drum2Notes (MIDI, MusicXML, PDF from audio or a YouTube link). SERVICE.

### Percussive guitar and playing-technique detection

27. Martelloni, McPherson, Barthet, ISMIR 2023 (arXiv 2307.07426): guitar body percussion taxonomy, CNN and VAE
    classifiers (kick vs non-kick; heel, thumb, fingers, nails; 5 body locations). Dataset GPercRep "currently not
    public". NO-CODE.
28. AG-PT-set (Stefani, Turchet; paper with Giudici, Audio Mostly 2024): acoustic steel-string recordings of 12
    techniques, 4 percussive (kick, snare-A, tom, snare-B) and 8 pitched; 8 of the 12 have onsets labelled at the
    millisecond level. Zenodo 2023-11-20, CC BY 4.0.
29. ExpressiveGuitar-TechniqueClassifier (Stefani): notebooks that classify 8 classes (the same 8 names as
    AG-PT-set's labelled techniques) from pre-computed feature vectors; trained models not in the repository.
    Commit 2024-10-30. GPL-3.0.
    https://github.com/domenicostefani/ExpressiveGuitar-TechniqueClassifier .
30. TART (Gupta et al., arXiv 2510.02597 and 2609.11904, ISMIR 2026): audio-to-tab with a 9-class technique
    classifier that includes "kick drum" and "snare drum" body hits. No code link in either paper. NO-CODE located.
31. EG-IPT dataset (19 electric guitar techniques, Zenodo 2025-04-13, CC BY 4.0) and the `eguitar_ircam.ts`
    TorchScript model (14 classes incl. `palmstrike`, `muted`, `bend`, `vibrato`; Hugging Face
    `nbrochec/ipt_models`, 2026-09-23, CC BY-NC 4.0), run by `ipt~` (Max/MSP), `libipt` (C) or the IPT Vamp plugin.
    Training code `ipt_recognition` (CC BY-NC 4.0). RUNNABLE (TorchScript on CPU; not yet confirmed).
32. guitar_style_dataset (Mitsou et al., Data in Brief 2023/2024): 549 smartphone videos with audio, 9 electric
    techniques incl. tapping. Zenodo 2023-11-06, CC BY 4.0, 14.25 GB.
33. SpectroFusionNet (Scientific Reports 2025, doi 10.1038/s41598-025-00287-w): spectrogram-fusion classifier for
    those 9 classes; the article's data statement points to the guitar_style_dataset; no code link found. NO-CODE located.
34. IDMT-SMT-Guitar (Fraunhofer IDMT; plucking and expression styles incl. bending, slide, vibrato, harmonics,
    dead-notes). Zenodo 2023-01-17, CC BY-NC-ND 4.0. Also IDMT-SMT-Chords (same date and license).
35. Guitar-TECHS (Pedroza et al., ICASSP 2025): electric guitar techniques, excerpts, chords, scales, with MIDI
    labels. Zenodo 2025-04-06, CC BY 4.0.
36. GOAT (Loth et al., ISMIR 2025): 5.9 h electric guitar DI audio with Guitar Pro tabs incl. techniques; where the
    data is published was not found today.
37. Procedural fingerpicking data (Murgul, Heizmann, AIMC 2025, arXiv 2508.07987): synthetic fingerpicking via
    Karplus-Strong; release not checked.

### Symbolic voice separation (notes to melody and bass)

38. partitura `musicanalysis.estimate_voices` (Chew and Wu's contig mapping). PyPI 1.9.0 2026-05-25, commit
    2026-05-25. Apache-2.0. https://github.com/CPJKU/partitura . RUNNABLE.
39. music21 `makeVoices`, `voicesToParts`, `chordify` (split by overlap; no perceptual voice separation found).
    PyPI 10.5.2 2026-10-28, commit 2026-11-08. BSD-3-Clause. https://github.com/cuthbertLab/music21 . RUNNABLE.
40. Cluster and Separate / piano_svsep (Foscarin, Karystinaios, Nakamura, Widmer, ISMIR 2024): GNN voice and staff
    prediction, pretrained checkpoint in the repository, MusicXML in, MEI out. Commit 2026-03-09. MIT.
    https://github.com/CPJKU/piano_svsep . RUNNABLE (PyTorch).
41. vocsep_ijcai2023 (Karystinaios, Foscarin, Widmer, IJCAI 2023): voice separation as link prediction; no weights in
    the repository; needs a WANDB account. Commit 2023-10-18. MIT. https://github.com/manoskary/vocsep_ijcai2023 .
42. McLeod and Steedman HMM voice separation (Java, MIDI in and out). Commit 2020-08-26. MIT.
    https://github.com/apmcleod/voice-splitting . RUNNABLE (Java).
42b. MidiBERT-Piano melody extraction (Chou, Chen; arXiv 2107.05223): MIDI in, melody MIDI out, fine-tuned on POP909
    (melody, bridge, accompaniment); checkpoints on Google Drive; "No gpu is needed for evaluation". Commit
    2024-04-10. MIT. https://github.com/wazenmai/MIDI-BERT . RUNNABLE.

### Melody and bass from audio (pitch salience)

43. Deep Salience (Bittner et al., ISMIR 2017): `bass`, `melody1-3`, `multif0`, `pitch`, `vocal` Keras weights in
    the repository; CSV of time and Hz. Commit 2019-11-22; its replicate.yaml pins Python 2.7.15 and TensorFlow
    1.12.0. MIT code; trained with MedleyDB (CC BY-NC-SA 4.0, "non-commercial research use only").
    https://github.com/rabitt/ismir2017-deepsalience .
44. Guitar string separation, Bastas, Katsouros, Maragos (IEEE TASLP 2025): a 6-string Wave-U-Net (the repository
    also has a `demucs` folder) that splits one guitar recording into per-string stems; training code only, no
    trained weights in the repository.
    Commit 2026-02-06. MIT. https://github.com/gbastas/deep-guitar-separation .

---

# Sections, one per tool

Abbreviations: "clone" = the blobless clone made by `scripts/repo_facts.sh` on 2026-11-10; "PyPI JSON" =
`https://pypi.org/pypi/<package>/json` read 2026-11-10 by `scripts/pypi_facts.py` (output kept outside the repo in
`/home/user/gtr/lanes/fingerstyle-voices-taps/raw/pypi_facts_1.txt`).

## librosa (HPSS, NMF, onsets)

- What: README: "`librosa` is a Python library for audio and music signal processing." (librosa development team,
  per LICENSE.md). Repository
  https://github.com/librosa/librosa (default branch `main`, last commit 2026-11-10 `6c9fe7c`, from the clone).
  Latest PyPI release 1.0.0, uploaded 2026-08-11, `requires_python` ">=3.12" (PyPI JSON).
- Docs note: on 2026-11-10 the per-function pages under `https://librosa.org/doc/latest/generated/` answered 404
  (`librosa.effects.hpss.html`, `librosa.decompose.hpss.html`, `librosa.onset.onset_detect.html`), and
  `https://librosa.org/doc/1.0.0/generated/librosa.effects.hpss.html` answered 503, while
  `https://librosa.org/doc/0.11.0/generated/librosa.effects.hpss.html` answered 200. The facts below were read from the
  docstrings in the 1.0.0 source: `https://raw.githubusercontent.com/librosa/librosa/1.0.0/librosa/effects.py`,
  `.../decompose.py`, `.../onset.py`.
- How a program calls it: Python only (no CLI, no HTTP). Signatures in 1.0.0:
  - `librosa.effects.hpss(y, *, kernel_size=31, power=2.0, mask=False, margin=1.0, n_fft=2048, hop_length=None, win_length=None, window='hann', center=True, pad_mode='constant')`:
    "Decompose an audio time series into harmonic and percussive components. This function automates the
    STFT->HPSS->ISTFT pipeline, and ensures that the output waveforms have equal length to the input waveform ``y``."
    Also `librosa.effects.harmonic(...)` and `librosa.effects.percussive(...)` with the same parameters.
  - `librosa.decompose.hpss(S, *, kernel_size=31, power=2.0, mask=False, margin=1.0)` on a spectrogram:
    "If ``margin = 1.0``, decomposes an input spectrogram ``S = H + P`` where ``H`` contains the harmonic
    components, and ``P`` contains the percussive components. If ``margin > 1.0``, decomposes an input spectrogram
    ``S = H + P + R`` where ``R`` contains residual components not included in ``H`` or ``P``." Cited methods:
    Fitzgerald (DAFx 2010) and Driedger, Müller, Disch (ISMIR 2014). `mask=True` returns the masks:
    "Masking matrices contain non-negative real values that can be used to measure the assignment of energy from
    ``S`` into harmonic or percussive components."
  - `librosa.decompose.decompose(S, *, n_components=None, transformer=None, sort=False, fit=True, **kwargs)`:
    "Given a spectrogram ``S``, produce a decomposition into ``components`` and ``activations`` such that
    ``S ~= components.dot(activations)``. By default, this is done with with non-negative matrix factorization
    (NMF), but any `sklearn.decomposition`-type object will work." With `transformer=None`: "If None, use
    `sklearn.decomposition.NMF`". `sort=True`: "components are sorted by ascending peak frequency."
  - `librosa.onset.onset_strength(*, y=None, sr=22050, S=None, lag=1, max_size=1, ref=None, detrend=False, center=True, feature=None, aggregate=None, **kwargs)`:
    "Compute a spectral flux onset strength envelope." Setting `max_size` > 1 gives the local max filtering of
    Böck and Widmer (DAFx 2013), the SuperFlux idea.
  - `librosa.onset.onset_detect(*, y=None, sr=22050, onset_envelope=None, hop_length=512, backtrack=False, energy=None, units='frames', normalize=True, sparse=True, **kwargs)`:
    "Locate note onset events by picking peaks in an onset strength envelope. The `peak_pick` parameters were chosen
    by large-scale hyper-parameter optimization over the dataset provided by [#]_." with the footnote
    "https://github.com/CPJKU/onset_db". `units` is one of "{'frames', 'samples', 'time'}".
  - `librosa.onset.onset_backtrack(events, energy)`: "Backtrack detected onset events to the nearest preceding local
    minimum of an energy function."
- Input: a NumPy array (`y`, "Multi-channel is supported") plus `sr`; file decoding is a separate call
  (`librosa.load`). Output: `hpss` returns two waveforms of the input's length (or masks); `decompose.hpss` returns
  `H`, `P` spectrograms; `onset_detect` returns frame indices, sample indices or times in seconds (per `units`), or a
  dense boolean array with `sparse=False`. No pitch, velocity or confidence per onset; the envelope from
  `onset_strength` is the only strength value.
- Constraints for a re-run: kernel sizes and margins (separation strength), hop length, `backtrack`, `units`, the
  peak-picking keyword arguments passed through `**kwargs` to `librosa.util.peak_pick`. Nothing guitar-specific.
- Access needs: CPU only; no model weights.
- License facts:
  a. Code: ISC. LICENSE.md in the clone (`git show HEAD:LICENSE.md`; same text at
     https://raw.githubusercontent.com/librosa/librosa/main/LICENSE.md), read 2026-11-10: "Permission to use, copy, modify,
     and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above
     copyright notice and this permission notice appear in all copies." PyPI JSON: license field "ISC", classifier
     "License :: OSI Approved :: ISC License (ISCL)".
  b. Weights: none (signal processing).
  c. Training data: none. `onset_detect`'s peak-picking defaults were tuned on CPJKU/onset_db (above). That
     repository holds annotation files only; its README says "It does not include the audio files. If no download
     link is given below, the data must be obtained by the original author." No license file found in
     https://github.com/CPJKU/onset_db (top-level file list from the clone, last commit 2013-03-29) on 2026-11-10.
  d. Service terms: not applicable.

## Essentia (onset algorithms; no HPSS algorithm found)

- What: README: "Essentia is an open-source C++ library for audio analysis and audio-based music information
  retrieval released under the Affero GPLv3 license."; "To use in Python (Linux `x86_64`, `i686`): `pip install
  essentia` or `pip install essentia-tensorflow`." Music Technology Group (MTG), Universitat Pompeu Fabra (licensing
  page). Repository
  https://github.com/MTG/essentia (branch `master`, last commit 2026-11-05 `23ae7ba`, clone). PyPI `essentia`
  2.1b6.dev1438 uploaded 2026-05-19, wheels only, `license_expression` "AGPL-3.0-only"; `essentia-tensorflow` same
  version and date (PyPI JSON). Docs title "Essentia 2.1-beta6-dev documentation".
- HPSS: the algorithm reference https://essentia.upf.edu/algorithms_reference.html, read 2026-11-10, lists no
  algorithm named HPSS or harmonic-percussive separation. It lists `HpsModelAnal`, "Computes the harmonic plus
  stochastic model analysis", and `HarmonicMask`, "Applies a spectral mask to remove a pitched source component from
  the signal" (different methods from median-filter HPSS).
- Onset algorithms listed there: `OnsetDetection`, `OnsetDetectionGlobal` ("Computes various onset detection
  functions"), `Onsets` ("Computes onset positions given various onset detection functions"), `OnsetRate`
  ("Computes the number of onsets per second and their position in time for an audio signal"),
  `SuperFluxExtractor` ("Detects onsets given an audio signal using SuperFlux algorithm"), `SuperFluxNovelty`,
  `SuperFluxPeaks`, `NoveltyCurve`, `AudioOnsetsMarker`.
- How a program calls it: Python `import essentia.standard as es` (standard mode) or `essentia.streaming`; C++.
  - `OnsetDetection` (https://essentia.upf.edu/reference/std_OnsetDetection.html): inputs "spectrum (vector_real)"
    and "phase (vector_real)"; output "onsetDetection (real) - the value of the detection function in the current
    frame"; parameter "method (string ∈ {hfc, complex, complex_phase, flux, melflux, rms}, default = hfc)". The page
    says of HFC: "the High Frequency Content detection function which accurately detects percussive events".
  - `Onsets` (https://essentia.upf.edu/reference/std_Onsets.html): inputs a matrix of detection functions and their
    weights; output "onsets (vector_real) - the onset positions [s]"; "This algorithm has been optimized for a
    frameRate of 44100.0/512.0."
  - `SuperFluxExtractor` (https://essentia.upf.edu/reference/std_SuperFluxExtractor.html): input "signal
    (vector_real) - the audio input signal"; output "onsets (vector_real) - the onsets times"; parameters
    `combine` (default 20 ms), `frameSize` 2048, `hopSize` 256, `ratioThreshold` 16, `sampleRate` 44100,
    `threshold` 0.05. "This implementation is based on the available reference implementation in python [2]" with
    [2] https://github.com/CPJKU/SuperFlux .
- Input: audio as float vectors (Essentia's loaders decode files); Output: onset times in seconds, no labels.
- Constraints for a re-run: detection method, frame and hop size, thresholds, `combine` window.
- Access needs: CPU; PyPI wheels.
- License facts:
  a. Code: AGPL-3.0. COPYING.txt in the clone begins "GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007".
     The licensing page https://essentia.upf.edu/licensing_information.html, read 2026-11-10: "Essentia is available
     under an open licence, Affero GPLv3, for non-commercial applications, thus it is possible to test the library
     before deciding to licence it under a comercial licence." and "Contact Music Technology Group (UPF) for more
     information about licensing conditions and for consulting how Essentia can suit your application."
     Same page on dependencies: "Some Essentia library algorithms use third-party libraries with licenses such as
     GPL, LGPL, and others for which UPF is not able to provide full sublicensing rights to third parties. If a third
     party plans to release a product based on Essentia, it needs to make sure to have cleared the rights over the
     required libraries for itself." It names FFTW ("used by FFT and IFFT algorithms, it can be replaced by more
     permissive Kiss FFT or Accelerate").
  b. Weights: the onset algorithms above use no model. For Essentia's separate models the same page says: "All the
     models are available under the CC BY-NC-SA 4.0 license for non-commercial use, and are also available under a
     proprietary license upon request."
  c. Training data: not applicable to the onset algorithms.
  d. Service terms: not applicable.

## madmom (CNN, RNN and SuperFlux onset detection)

- What: README: "Madmom is an audio signal processing library written in Python with a strong focus on music
  information retrieval (MIR) tasks." Copyright holders per LICENSE: "Department of Computational Perception,
  Johannes Kepler University, Linz, Austria and Austrian Research Institute for Artificial Intelligence (OFAI),
  Vienna, Austria". Repository https://github.com/CPJKU/madmom (branch `main`, last commit 2024-08-25 `27f032e`, clone);
  `setup.py` there sets `version = '0.17.dev0'`; `pyproject.toml` build requirements include `"cython>=0.25"` and
  `"numpy>2"`. Latest PyPI release 0.16.1, uploaded 2018-11-14, source distribution only (PyPI JSON). The models
  live in a git submodule, https://github.com/CPJKU/madmom_models (last commit 2022-01-06 `7e3dc1b`, clone;
  folders `onsets/2013`, `onsets/2014` among others).
- How a program calls it:
  - CLI programs in `bin/` of the clone, onset-related: `CNNOnsetDetector`, `OnsetDetector`, `OnsetDetectorLL`,
    `SuperFlux`, `SuperFluxNN`, `ComplexFlux`, `LogFiltSpecFlux`, `SpectralOnsetDetection`. The help text of
    `bin/CNNOnsetDetector`: "$ CNNOnsetDetector single INFILE [-o OUTFILE]" and "$ CNNOnsetDetector batch
    [-o OUTPUT_DIR] [-s OUTPUT_SUFFIX] FILES"; default output suffix `.onsets.txt`.
  - Python (`madmom/features/onsets.py` in the clone): `CNNOnsetProcessor()` "Processor to get a onset activation
    function from a CNN" (Schlüter and Böck, 2013), activation "sampled with 100 frames per second";
    `RNNOnsetProcessor(online=False)` "Processor to get a onset activation function from multiple RNNs", `online`
    "Choose networks suitable for online onset detection, i.e. use unidirectional RNNs";
    `SpectralOnsetProcessor(onset_method=...)` "implements most of the common onset detection functions based on the
    magnitude or phase information of a spectrogram" (cites Böck and Widmer, DAFx 2013, the SuperFlux paper);
    `OnsetPeakPickingProcessor(threshold, smooth, pre_avg, post_avg, pre_max, post_max, combine, delay, online, fps)`
    returning "onsets : numpy array Detected onsets [seconds]."
  - Docs: https://madmom.readthedocs.io/en/latest/modules/features/onsets.html (page title "madmom 0.17.dev0
    documentation"); on 2026-11-10 the fetched page text held the navigation only, so the docstrings above were read
    from the source.
- Input: audio file path or signal; Output: activation function at 100 fps, then onset times in seconds. The CLI
  writes them with `write_onsets = write_events` (`madmom/io/__init__.py`, clone): "Write the events to a file, one
  event per line." with default `fmt='%.3f'`. No class labels.
- Constraints for a re-run: peak-picking threshold, smoothing, `combine`, online/offline mode.
- Access needs: CPU. Building needs Cython and NumPy (above).
- License facts:
  a. Code: LICENSE in the clone, read 2026-11-10: "Unless indicated otherwise (either in the file directly or a
     LICENCE file inside any directory), all source code files are published under this license:" followed by a
     BSD-style text: "Redistribution and use in source and binary forms, with or without modification, are permitted
     provided that the following conditions are met:". PyPI JSON: license field "BSD, CC BY-NC-SA", classifiers
     "License :: Free for non-commercial use" and "License :: OSI Approved :: BSD License".
  b. Weights: same LICENSE file: "All model and data files are distributed under the following license: Creative
     Commons Attribution-NonCommercial-ShareAlike 4.0" ... "NonCommercial: You must not use the material for
     commercial purposes." ... "If you want to include any of these files (or a variation or modification thereof)
     or technology which utilises them in a commercial product, please contact Gerhard Widmer at [e-mail address in
     the file]. Please note that pickled Processors (i.e. saved models) fall into this category." The models
     repository's LICENSE (https://github.com/CPJKU/madmom_models, clone) says "All files in this repository are
     distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0".
     In `madmom/features/onsets.py` (clone), `RNNOnsetProcessor` imports `ONSETS_RNN, ONSETS_BRNN` and
     `CNNOnsetProcessor` imports `ONSETS_CNN` from `madmom.models` (the model files); `SpectralOnsetProcessor`
     (spectral flux, SuperFlux and the other spectral functions) computes from the spectrogram.
  c. Training data: the docstrings name the papers (Schlüter and Böck 2013; Eyben, Böck, Schuller, Graves 2010;
     Böck, Arzt, Krebs, Schedl 2012) but not the training sets. UNVERIFIED which audio the shipped onset models were
     trained on; the papers would settle it. CPJKU/onset_db (see librosa) holds the annotations of the Böck set; its
     README says of the `sb_*` files "Please contact me to get access to this data."
  d. Service terms: not applicable.

## aubio (onset CLI and Python)

- What: README: "aubio is a library to label music and sounds. It listens to audio signals and attempts to detect
  events." It has "A python module" and "command line tools" (README). Repository https://github.com/aubio/aubio (branch `master`, last commit 2026-04-10 `ad5cf97`;
  its `VERSION` file reads major 0, minor 5, patch 0, status "-alpha"). Latest PyPI release 0.4.9, uploaded
  2019-02-08, source distribution only (PyPI JSON). Docs: "aubio 0.4.9 documentation",
  https://aubio.org/manual/latest/cli.html . The box has `/usr/bin/aubio` and `/usr/bin/aubioonset`.
- How a program calls it (https://aubio.org/manual/latest/cli.html, read 2026-11-10):
  - `aubioonset [[-i] source] [-o sink] [-r rate] [-B win] [-H hop] [-O method] [-t thres] [-T time-format] [-s sil] [-m] [-f] [-j] [-N miditap-note] [-V miditap-velo] [-v] [-h]`.
    "When started with an input source (-i/--input), the detected onset times are given on the console, in
    seconds." Methods: "default, energy, hfc, complex, phase, specdiff, kl, mkl, specflux"; "default  Default
    distance, currently hfc"; hfc: "The resulting function is efficient at detecting percussive onsets."
    `-t`: "Values are typically in the range [0.001, 0.900]. Lower threshold values imply more onsets detected."
    and "Defaults to 0.3." `-M, --minioi`: "Defaults to 0.020". `-s, --silence`: "Defaults to -90.0."
    `-B` defaults to 512, `-H` to 256.
  - The `aubio onset` sub-command on the same page lists "-M <value>, --minioi <value>  minimum Inter-Onset Interval
    (default: 12ms)" and "-s <value>, --silence <value>  silence threshold, in dB (default: -70)" (defaults differ
    from `aubioonset`'s as printed on the page).
  - Python, as in `python/demos/demo_onset.py` (clone): `from aubio import source, onset`;
    `s = source(filename, samplerate, hop_s)`; `o = onset("default", win_s, hop_s, samplerate)`; per hop, after a
    detection, `o.get_last_s()` gives the onset time in seconds and `o.get_last()` in samples (units from
    `src/onset/onset.h`: "onset detection timestamps (in samples)" and "(in seconds)").
- Input: audio files decoded by aubio's sources (depends on build); Output: onset times in seconds (or samples or
  ms with `-T`), one per line. `-o` writes an audio file with a "short wood-block like sound" at each onset.
- Constraints for a re-run: method, threshold, minimum inter-onset interval, silence gate, buffer and hop size.
- Access needs: CPU; already installed on the box.
- License facts:
  a. Code: GPL-3.0-or-later. COPYING in the clone begins "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"; the
     CLI page's man text says "either version 3 of the License, or (at your option) any later version." PyPI JSON
     classifier "License :: OSI Approved :: GNU General Public License v3 or later (GPLv3+)".
  b-d. No weights, no training data, no service.

## SuperFlux reference implementation

- What: "Python reference implementation of the SuperFlux onset detection algorithm" (README), Sebastian Böck and
  Gerhard Widmer, DAFx-13, plus the local group delay weighting of their ISMIR 2013 paper. Repository
  https://github.com/CPJKU/SuperFlux (branch `master`, last commit 2014-11-02 `0a85f89`, clone). Files:
  `SuperFlux.py`, `ComplexFlux.py`, `README.md`.
- How a program calls it: "`SuperFlux.py input.wav` processes the audio file and writes the detected onsets to a
  file named `input.superflux.txt`." (README). The same algorithm is in madmom (`SuperFlux` program) and Essentia
  (`SuperFluxExtractor`), above.
- License facts: a. No LICENSE file in the top-level listing; the header of `SuperFlux.py` (clone) reads
  "Copyright (c) 2012 - 2014 Sebastian Böck [...] All rights reserved. Redistribution and use in source and binary
  forms, with or without modification, are permitted provided that the following conditions are met:" (BSD-style).
  b-d. None.

## NMF libraries: libnmfd, scikit-learn NMF, torchnmf, nussl

- libnmfd: "libnmfd: Music Processing Applications of Nonnegative Matrix Factorization" (README), López-Serrano,
  Dittmar, Özer, Müller, International Audio Laboratories Erlangen. https://github.com/groupmm/libnmfd (branch
  `main`, last commit 2024-08-09 `3831eb7`, clone); PyPI 1.0.0 uploaded 2024-08-09, the only release,
  `requires_python` "<4.0,>=3.8" (PyPI JSON). README: "The first variant, called nonnegative matrix factor
  deconvolution (NMFD), extends the original NMF algorithm to the convolutive case, enforcing the temporal order of
  spectral templates. The second variant, called diagonal NMF, supports the development of sparse diagonal
  structures in the activation matrix." Demo notebooks in the clone include
  `demo_drum_extraction_kam_nmf_perc_threshold.ipynb`, `demo_drum_extraction_kam_nmf_score_informed.ipynb` and
  `demo_drum_sound_separation_nmf.ipynb`. Call: `pip install libnmfd`, Python import `libnmfd` (subpackages `core`,
  `dsp`, `utils`). License: LICENSE (clone) "MIT License", "Permission is hereby granted, free of charge, to any
  person obtaining a copy of this software [...]"; README: "The code for this toolbox is published under an [MIT
  licence](LICENCE)." No weights.
- scikit-learn `sklearn.decomposition.NMF`: the default NMF behind `librosa.decompose.decompose` (librosa docstring
  above). PyPI 1.9.1 uploaded 2026-09-10, `license_expression` "BSD-3-Clause" (PyPI JSON). Class docs not re-read
  today.
- torchnmf: "A pytorch package for Non-negative Matrix Factorization" (PyPI summary), home page
  https://github.com/yoyololicon/pytorch-NMF ; PyPI 0.3.5 uploaded 2023-07-09, classifier "License :: OSI Approved ::
  MIT License" (PyPI JSON). The Inverse Drum Machine repository lists it as an optional dependency group
  (`poetry install --with nmf # Install nmf dependencies (e.g. TorchNMF)`). Repository and LICENSE not read today:
  UNVERIFIED beyond the PyPI classifier.
- nussl: object-oriented source separation library (Interactive Audio Lab); its README lists "Primitive Methods:
  Repetition (REPET, 2DFT), Harmonic/Percussive, Vocal melody extraction, Timbre clustering" and the call
  `nussl.separation.primitive.HPSS(...)`. README, clone of https://github.com/nussl/nussl (branch `master`, last
  commit 2024-12-09 `17368d4`): "**NUSSL IS DEPRECATED** [...] There will be no further any updates, bug fixes, or
  answers for open issues. We're leaving the code here as is for reference and educational purposes." PyPI 1.1.9
  uploaded 2021-04-02. License: LICENSE.md "MIT License" (clone), "Permission is hereby granted, free of charge, to
  any person obtaining a copy of this software [...]".

## ADTOF (drum transcription, Keras/TensorFlow)

- What: material for Zehren, Alunno, Bientinesi, "ADTOF: A large dataset of non-synthetic music for automatic drum
  transcription" (ISMIR 2021) and "High-Quality and Reproducible Automatic Drum Transcription from Crowdsourced Data"
  (Signals 2023, https://doi.org/10.3390/signals4040042) (README). Repository https://github.com/MZehren/ADTOF
  (branch `master`, last commit 2025-09-18 `b3968fb`, clone). Not on PyPI (`https://pypi.org/pypi/adtof/json` answered
  404). `setup.py`: name "ADTOF", version "2.0"; dependencies include `tensorflow>=2.13.0`, `madmom` from git and
  `tapcorrect` from git. README: "This repository has been tested on macOS Ventura with **Python 3.10**."
- Weights: a TensorFlow checkpoint in the repository tree, `adtof/models/Frame_RNN_adtofAll_0.data-00000-of-00001`
  and `.index` (clone listing).
- How a program calls it: README: "The easiest way to test the trained model is our [Colab Notebook]" or locally
  "with this [Jupyter Notebook](/bin/drumTranscriptor.ipynb)"; `pip3 install .` installs the dependencies. No CLI
  for transcription is documented in the README.
- Output: five drum classes; the README's dataset figure caption: "Each sample consists of an input (400 frames, 84
  bins, 1 channel) and a target (400 Frames, 5 classes)." The PyTorch port (next section) maps the five outputs to
  MIDI pitches `LABELS_5 = [35, 38, 47, 42, 49]`.
- Author measurements: see ADTOF-pytorch below for figures on MDBDrums++; the papers were not read today.
- License facts:
  a. Code: conflicting statements in the repository. README: "The content of this repository is licensed under a
     [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License]" and LICENSE (clone) begins
     "Attribution-NonCommercial-ShareAlike 4.0 International". `setup.py` (clone) carries the classifier
     "License :: OSI Approved :: GNU General Public License v3 (GPLv3)". Read 2026-11-10.
  b. Weights: in the same repository, so under the README statement above (CC BY-NC-SA 4.0).
  c. Training data: the ADTOF datasets, Zenodo record https://zenodo.org/records/10084511 ("ADTOF datasets",
     published 2023-11-08, access "restricted", no license field in the record metadata), read 2026-11-10 through
     `https://zenodo.org/api/records/10084510`: "a copy of the ADTOF datasets is available upon request here. Please
     indicate your academic affiliation and the intended use of the data." and "Conditions of use: The provided
     datasets are offered free of charge for internal non-commercial use. No reverse engineering. Do not
     redistribute, modify, or disassemble the datasets." The README describes how they were built from "rhythm video
     game charts" downloaded "For example, from [Rhythm Gaming World]" and adds ":warning: we are not affiliated with
     Rhythm Gaming World and we do not control any material, possibly copyrighted, linked there." Which subsets the
     shipped `Frame_RNN_adtofAll_0` checkpoint was trained on is not stated in the README: UNVERIFIED (the Signals
     2023 paper would settle it).
  d. Service terms: not applicable.

## ADTOF-pytorch (PyTorch port of ADTOF's Frame_RNN)

- What: "Automatic transcription of drum audio to MIDI, using minimal dependencies (torch, librosa, pretty_midi)."
  and "This repo is a pytorch port of [ADTOF]" (README). Repository https://github.com/xavriley/ADTOF-pytorch (branch
  `main`, last commit 2025-11-11 `85c192e`, clone); `pyproject.toml`: name "adtof-pytorch", version "0.1.0",
  `requires-python = ">=3.9"`, dependencies `torch`, `librosa`, `pretty_midi`, `numpy`. Linked from the ADTOF README:
  "It only requires pytorch to be installed (no tensorflow, keras or madmom)."
- Weights: `src/adtof_pytorch/data/adtof_frame_rnn_pytorch_weights.pth`, bundled; README: "we reimplement the model
  in Pytorch and convert the weights directly from the offically released weights (see `convert_weights.py`)."
- How a program calls it (README): CLI `adtof --audio input.wav --out output.mid --thresholds 0.22,0.24,0.32,0.22,0.30 --fps 100 --device cuda`;
  Python `from adtof_pytorch import transcribe_to_midi; transcribe_to_midi("input.wav", "output.mid")`. CLI options
  in `src/adtof_pytorch/cli.py`: `--audio` (file or directory), `--out`, `--out-suffix` (default
  `_adtof-pt.mid`), `--threshold`, `--thresholds`, `--fps` (default 100), `--weights`, `--device` (default
  `cuda`, help text "Device to use for inference").
- Input: audio loaded with `librosa.load(..., sr=44100)` (`audio.py`, `sample_rate: int = 44100`, `fps: int = 100`).
  Output: a MIDI file; `post_processing.py` writes `pretty_midi.Note(velocity=int(velocity), pitch=int(pitch), ...)`
  with a fixed `velocity: int = 100` default, pitches from `LABELS_5 = [35, 38, 47, 42, 49]`. Names of those General
  MIDI drum notes, from pretty_midi's `DRUM_MAP`
  (https://raw.githubusercontent.com/craffel/pretty-midi/main/pretty_midi/constants.py , read 2026-11-10; index 0 is
  note 35 per `utilities.py`): 35 "Acoustic Bass Drum", 38 "Acoustic Snare", 47 "Low-Mid Tom", 42 "Closed Hi Hat",
  49 "Crash Cymbal 1" (the repository itself does not name them). Onset times only; no confidence in the MIDI.
- Constraints for a re-run: per-class peak-picking thresholds (`--thresholds`), fps.
- Author measurements (README, on the MDBDrums++ dataset): "ADTOF (original) | 88.68 | 89.90 | 88.74" and
  "ADTOF-pytorch | 88.26 | 89.83 | 88.51" (Recall | Precision | F-measure).
- License facts:
  a. Code: no license file found in the top-level listing of https://github.com/xavriley/ADTOF-pytorch (clone,
     2026-11-10); `pyproject.toml` has no license field.
  b. Weights: converted from ADTOF's released weights, which the ADTOF README places under CC BY-NC-SA 4.0 (above).
     The port's README states no license for the converted file.
  c. Training data: as ADTOF.
  d. Not a service.
- Related paper: Riley and Dixon, "Enhanced Automatic Drum Transcription via Drum Stem Source Separation" (arXiv
  2509.24853, 2025-09-29), abstract: "We describe a simple post-processing step which expands the transcription output
  from five to seven classes and furthermore, we are able to estimate MIDI velocity values based on the separated
  stems." (read through the arXiv API, 2026-11-10).

## Omnizart drum mode

- What: "Omnizart is a Python library that aims for democratizing automatic music transcription." (README), Music and
  Culture Technology Lab (MCTLab), JOSS paper https://doi.org/10.21105/joss.03391 . Repository
  https://github.com/Music-and-Culture-Technology-Lab/omnizart (branch `main`, last commit 2026-05-31 `bcd8cb4`,
  clone). PyPI 0.6.3 uploaded 2026-05-31, sdist only, `requires_python` ">=3.8" (PyPI JSON). CHANGELOG: "0.6.3 -
  2026-05-31 ... Replaced the heavy PyTorch-based external CLI dependencies on Spleeter/Demucs with a lightweight,
  in-code `sherpa-onnx` backend." and "0.6.0 - 2026-05-30 **Major compatibility upgrade supporting Python versions
  up to 3.14.**"; the previous entry is "0.5.0 - 2021-12-09".
- README note on the drum model: "The current implementation for the drum model has unknown bugs, preventing loss
  convergence when training from scratch. Fortunately, you can still enjoy drum transcription with the provided
  checkpoints." README: "Currently, Omnizart is **incompatible for ARM-based MacOS** system".
- How a program calls it: CLI `pip install omnizart`, `omnizart download-checkpoints`,
  `omnizart drum transcribe <path/to/audio.wav>` (README); docs
  https://music-and-culture-technology-lab.github.io/omnizart-doc/drum/cli.html: "omnizart drum transcribe [OPTIONS]
  INPUT_AUDIO", "-o, --output <output> Path to output the prediction file (could be MIDI, CSV, …, etc.)". Python
  `omnizart.drum.app.DrumTranscription().transcribe(input_audio, model_path=None, output='./')` returning
  "midi: pretty_midi.PrettyMIDI The transcribed drum notes." (docs .../drum/api.html). Docker image
  `mctlab/omnizart:latest` (README).
- Weights: `omnizart download-checkpoints` fetches the variables file from
  `https://github.com/Music-and-Culture-Technology-Lab/omnizart/releases/download/checkpoints-20211001/drum_keras@variables.data-00000-of-00001`
  (`omnizart/cli/cli.py` in the clone); the graph files sit in the repository under
  `omnizart/checkpoints/drum/drum_keras/`.
- Input: "Path to the raw audio file (.wav)". Output (api.html): "Currently the model predicts 13 classes of different
  drum sets, and 3 of them will be written to the MIDI file." In `omnizart/drum/inference.py` (clone) the three are
  written as `pretty_midi.Note(velocity=100, pitch=pitch, start=onset, end=onset + 0.05)` with pitch 35 (bass drum
  activation), 38 (snare) and 42 (hi-hat); thresholds `bass_drum_th=0.85, snare_th=1.2, hihat_th=0.17` (api.html).
- License facts:
  a. Code: LICENSE (clone) "MIT License", "Copyright (c) 2020 MCTLab", "Permission is hereby granted, free of charge,
     to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in
     the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software". PyPI license field "MIT".
  b. Weights: no separate license statement for the checkpoints was found in the README, the drum docs pages or
     `cli.py` read on 2026-11-10; they are release assets of the same repository.
  c. Training data: docs api.html: `generate_feature` "Currently only supports Pop dataset" and
     "omnizart.constants.datasets.PopStructure The only supported dataset for drum transcription."; reference "I-Chieh
     Wei, Chih-Wei Wu, Li Su. "Improving Automatic Drum Transcription Using Large-Scale Audio-to-MIDI Aligned Data""
     (marked "(in submission)" on the page). In `omnizart/constants/datasets.py` (clone) the table marks "Pop" as not
     downloadable and `PopStructure`'s folders are named `01_ytd_audio/...` and `05_align_mid/...`. No license for the
     Pop dataset was found: UNVERIFIED.
  d. Not a service (a Replicate page `breezewhite/omnizart` is linked from the README; not read).

## Magenta Onsets and Frames, drums checkpoint (E-GMD)

- What: Google Magenta's transcription model; README of
  https://github.com/magenta/magenta/tree/main/magenta/models/onsets_frames_transcription (read as raw file
  2026-11-10): "State of the art piano and drum transcription models, including velocity estimation." Status line:
  "This repository is currently inactive and serves only as a supplement to the papers mentioned below. For our
  current transcription work, see the [MT3 blog post] and [MT3 GitHub repository]". The top-level magenta README:
  "This repository is currently inactive (archived, read only)". Last commit of `magenta/magenta` 2026-01-05
  `c15687e` (clone). PyPI `magenta` 2.1.4 uploaded 2022-08-01 (PyPI JSON).
- Weights: "For drum transcription, use the [checkpoint](https://storage.googleapis.com/magentadata/models/onsets_frames_transcription/e-gmd_checkpoint.zip)
  trained on the [E-GMD dataset]". HTTP headers of that file on 2026-11-10: `content-length: 25658703`,
  `last-modified: Sat, 28 Mar 2020 00:10:03 GMT`.
- How a program calls it (README): `onsets_frames_transcription_transcribe --model_dir="${MODEL_DIR}" --config="drums" <drums_recording1.wav, ...>`
  after setting up the Magenta environment (described in Magenta's top-level README; its TensorFlow version was not
  read today: UNVERIFIED).
- Output: MIDI with velocity ("including velocity estimation"). Exact drum pitch set not read today: UNVERIFIED.
- License facts:
  a. Code: LICENSE of `magenta/magenta` (clone) begins "Copyright 2016 The Magenta Team.  All rights reserved." then
     "Apache License"; PyPI license field "Apache 2".
  b. Weights: no separate license statement next to the checkpoint link in the README read 2026-11-10.
  c. Training data: E-GMD, https://magenta.tensorflow.org/datasets/e-gmd , read 2026-11-10: "E-GMD contains 444 hours
     of audio from 43 drum kits" and "The dataset is made available by Google LLC under a Creative Commons
     Attribution 4.0 International (CC BY 4.0) License."
  d. Not a service.

## ADT_STR (drum transcription trained on synthesized audio, 2026)

- What: "ADT_STR is an automatic drum transcription model. Given an input audio file, the model predicts a drum MIDI
  sequence containing note onsets, pitches, and velocities." (README). Paper: Melucci, Merialdo, Akama, "Towards
  Realistic Synthetic Data for Automatic Drum Transcription", arXiv 2601.09520, 2026-01-14. Repository
  https://github.com/pier-maker92/ADT_STR (branch `main`, last commit 2026-09-19 `77dbef2`, clone); README
  "Version: `v1.0.0`". Hugging Face model repository `Pierfrancesco/adt-str` (created 2026-09-17, last modified
  2026-09-17, read through `https://huggingface.co/api/models/Pierfrancesco/adt-str`), files include
  `setting-tau-0.4|0.6|0.8/model.safetensors`, `adt_transcriber.py`, `inference.py`.
- How a program calls it (README): Python
  `transcriber = ADTTranscriber.from_pretrained(repo_dir, variant="setting-tau-0.8")` then
  `midi_path = transcriber.transcribe("path/to/audio.wav", output_dir="outputs")`; CLI
  `python inference --checkpoint setting-tau-0.8 --input path/to/audio.wav --output_path outputs/inference_tau08`,
  which "writes a MIDI file named after the input audio stem". Install: `uv venv .venv --python 3.12`,
  `uv pip install -r pyproject.toml`; "The core inference dependencies include PyTorch, TorchAudio, TorchCodec,
  Transformers, SafeTensors, OmegaConf, PrettyMIDI, NumPy, and tqdm."
- Input: "The default audio configuration uses 24 kHz audio and 2.56-second chunks." Output: MIDI with onsets,
  pitches, velocities; "We consolidate the original 47 percussion notes into 26 distinct instrument classes".
- Author measurements: "The figure below reports F1 scores on ENST and MDB across the full drum instrument
  vocabulary." with "a 50 ms tolerance window" (numbers are in an image, not transcribed here). Abstract: "We
  evaluate our model on the ENST and MDB test sets, where it achieves new state-of-the-art results" (authors' claim).
- License facts:
  a. Code: LICENSE (clone) "Creative Commons Attribution-ShareAlike 4.0 International" and
     "SPDX-License-Identifier: CC-BY-SA-4.0"; README: "This work is licensed under the [Creative Commons
     Attribution-ShareAlike 4.0 International License]".
  b. Weights: the Hugging Face model card (`https://huggingface.co/Pierfrancesco/adt-str/raw/main/README.md`, 68
     lines, read 2026-11-10) has no license field in its metadata and no license text; the GitHub README's license
     line above is the only license statement found.
  c. Training data: abstract: "Our primary contribution is a semi-supervised method to automatically curate a large
     and diverse corpus of one-shot drum samples from unlabeled audio sources. We then use this corpus to synthesize a
     high-quality dataset from MIDI files alone". Which sample sources and MIDI files, and their licenses: UNVERIFIED
     (the paper's data section would settle it).
  d. Not a service.

## Inverse Drum Machine (IDM, 2025)

- What: "The Inverse Drum Machine: Source Separation Through Joint Transcription and Analysis-by-Synthesis", Torres,
  Peeters, Richard, IEEE TASLP 2025, doi 10.1109/TASLPRO.2025.3629286 (README citation); arXiv 2505.03337 (v2
  2025-09-30). Repository https://github.com/bernardo-torres/inverse-drum-machine (branch `main`, last commit
  2026-01-16 `4566568`, clone). README: "The model jointly trains for Automatic Drum Transcription (ADT) and One-shot
  drum Sample Synthesis (OSS) in an end-to-end manner."
- Weights: in the repository tree, `pretrained/idm-44-train-kits/checkpoints/val-epoch=518-global_step=0.ckpt`
  (clone listing); README TODO list: "[x] Model weights", "[ ] Evaluation code".
- How a program calls it (README): `from idm.inference import load_model, separate`;
  `model, name = load_model('idm-44-train-kits', device, log_dir="pretrained")`;
  `stems = separate(drum_loop_44_1khz, model, output_dir=output_dir, masking='wiener', alpha=1.0)`; Poetry install,
  "Python 3.10+". The example picks `cuda` if available, else `cpu`.
- Input: a path read with `sf.read` or a tensor, resampled to the model's `sampling_rate` (default 44100) inside
  `separate` (`idm/inference.py`, clone). Output: one WAV per drum class (`sf.write(output_path /
  f"{class_name}.wav", ...)`); the model's transcription onsets are internal. Human-in-the-loop hook, README: "The
  modular architecture allows for optional external information, such as corrected transcriptions, to be provided at
  inference time." and "To override the transcription, you can pass a dictionary with the onsets to the `separate`
  function" (example keys `'KD'`, `'SD'`, `'HH_CHH'`); `idm/utils.py` `convert_onset_dict_to_activations`: values
  are lists "containing onset times in seconds". README caveat: "if the drum loop is too far from the training
  distribution, the separation quality will be bad."
- License facts:
  a. Code: LICENSE (clone) "Apache License Version 2.0, January 2004".
  b. Weights: in the same repository; no separate statement found in the README.
  c. Training data: StemGMD (configs/data/multitrack-stem-gmd.yaml in the clone; abstract: "Experiments on the
     StemGMD dataset"). StemGMD on Zenodo, https://zenodo.org/records/7860223 ("StemGMD: A Large-Scale Audio Dataset of
     Isolated Drum Stems for Deep Drums Demixing - part 1", published 2023-04-24), license metadata `cc-by-4.0`,
     access "open" (Zenodo API, 2026-11-10).
  d. Not a service.

## Drum stem separators that feed a drum transcriber: LarsNet, drumsep

- LarsNet: "a new deep drums demixing model that can separate five stems from a stereo drum mixture faster than
  real-time" (README of https://github.com/polimi-ispl/larsnet , branch `main`, last commit 2024-09-10 `17d631f`,
  clone). Paper: Mezza, Giampiccolo, Bernardini, Sarti, "Toward deep drum source separation", Pattern Recognition
  Letters 183 (2024), doi 10.1016/j.patrec.2024.04.026. Stems: "Kick Drum", "Snare", "Tom-Toms", "Hi-Hat", "Cymbals".
  Call: `python separate.py -i <folder> [-o <out>] [-w <alpha>] [-d cpu|cuda:0]`, "specify the device using the `-d`
  option (default: `cpu`)". Weights: "Pretrained LarsNet model checkpoints can be found [here] (562 MB) licensed
  under CC BY-NC 4.0." (Google Drive link). Code license: no license file found in the top-level listing of
  https://github.com/polimi-ispl/larsnet on 2026-11-10. Training data: StemGMD, "**StemGMD is freely available on
  [Zenodo](https://zenodo.org/records/7860223) under the CC-BY 4.0 license.**" (README; Zenodo metadata `cc-by-4.0`).
  README: "We are working toward releasing the scripts for fine-tuning and training LarsNet from scratch."
- drumsep: "Drum separation based on a [Hybrid Demucs] model." (README of https://github.com/inagoy/drumsep , branch
  `main`, last commit 2025-11-03 `c1cea3f`, clone); from the thesis "Separación de fuentes en grabaciones de batería
  mediante aprendizaje automático" (2022). Input "an audio file (mp3, wav, flac, or ogg)"; output 4 audio files
  "Bombo (Kick)", "Redoblante (Snare)", "Platillos (Cymbals)", "Toms". Call: `bash drumsepInstall` then
  `bash drumsep "<PATH_IN>" "<PATH_OUT>"`; the install script runs `pip install demucs` and downloads the model with
  `gdown 1-Dm666ScPkg8Gt2-lK3Ua0xOudWHZBGC` (Google Drive id). Code license: LICENSE "MIT License", "Copyright (c)
  2024 Iñaki Goyeneche". Weights license and training data: not stated in the README: UNVERIFIED.
- Riley and Dixon (arXiv 2509.24853, above) combine ADTOF with "several drum kit *stem* separation models in the open
  source community" to go from five to seven classes and estimate velocities.

## Older and minor drum transcribers: ADTLib; STRUM

- ADTLib (Carl Southall): "The algorithms return both a .txt file of kick drum, snare
  drum, and hi-hat onsets and an automatically generated drum tabulature." (README of
  https://github.com/CarlSouthall/ADTLib , last commit 2018-01-17 `8e429f3`, clone). PyPI ADTLib 2.1.2 uploaded
  2018-01-17, sdist only (PyPI JSON). Call: CLI `ADT Drum.wav`; Python `from ADTLib import ADT; out=ADT(['Drum.wav'])`.
  Needs `madmom` and `tensorflow` (README). License: LICENSE.txt "Copyright (c) 2017, CarlSouthall" BSD-style,
  "Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
  following conditions are met:"; PyPI classifiers include "License :: Free for non-commercial use" and "License ::
  OSI Approved :: BSD License" (both, as listed). Weights and training data licenses: not stated in the README.
- STRUM (Opria, arXiv 2605.12135, 2026-05-12): "an audio-to-chart pipeline that converts raw recordings into
  playable Clone Hero / YARG charts" with "a two-stage CRNN onset detector and a six-model ensemble classifier for
  drums"; abstract: "Code, model weights, and the full benchmark manifest are released." The arXiv comment field gives
  the code location as the placeholder "https://github.com/<your-github-username>/autocharter", so no repository
  could be located from the paper record on 2026-11-10. Authors' figures: "drums onset F1 = 0.838 ... at a +/- 100 ms
  tolerance with per-song global offset search" on their 30-song benchmark.
- Separate-and-Detect (Hugging Face `ddman1101/Separate-and-Detect`, created 2026-07-31, modified 2026-08-13): model
  card: "the pretrained **OB+TB** checkpoint of **Separate-and-Detect: Unified Drum Transcription and Stem Generation
  via Latent Diffusion**", "Architecture: Latent Diffusion Model (MSG-LD)", files `msgld_ob.ckpt`, `msgld_obtb.ckpt`;
  "The checkpoint can then be loaded using the code provided in the official GitHub repository." (no repository URL
  given on the card). License on the card: metadata `license: mit` and "This repository is released under the MIT
  License." Paper and training data: not located today: UNVERIFIED.

## Research: percussive fingerstyle guitar (body hits), Martelloni, McPherson, Barthet 2023

- What: "Real-time Percussive Technique Recognition and Embedding Learning for the Acoustic Guitar", Andrea
  Martelloni, Andrew P. McPherson, Mathieu Barthet (author block: Queen Mary University of London, Imperial College,
  Queen Mary University of London), arXiv 2307.07426 (2023-07-13),
  comment "Accepted at the 24th Int. Society for Music Information Retrieval Conf., Milan, Italy, 2023". Abstract:
  "We develop RT-MIR techniques aimed at augmenting percussive fingerstyle, which blends acoustic guitar playing with
  guitar body percussion." and "We introduce a taxonomy of guitar body percussion based on hand part and location."
  Read from the arXiv PDF (`https://arxiv.org/pdf/2307.07426`, text extracted with pdftotext) on 2026-11-10.
- Models in the paper: PercCNN, PercVAE (CNN jointly trained with a VAE) and TablaCNN (a tabla transcription
  model). Output layers (Table 3): "2-class Kick - K (heel), Non-Kick - NK (all others)"; "4-class Heel - H, Thumb
  - T, Fingers - F, Nails - N"; a hierarchical "4-class + 5-class" output adding location "Soundhole, Upper Bout,
  Lower Bout, Upper Side, Lower Side".
- Dataset: "This was used to create the labelled dataset GPercRep by producing 50 examples (one hit per second) of
  each combination of taxonomy attributes" ... "Each combination was repeated at four dynamics levels (p, mp, mf,
  f)." ... "the dataset has 3,157 examples extracted from 52 minutes and 37 seconds of audio at 44.1 kHz. The
  dataset is currently not public." Recording guitar: "a six-channel output made out of one magnetic pickup and five
  piezo sensors". Two further test sets are named GPercHeel and GPercPat.
- Code and weights: the only GitHub link in the extracted PDF text is "https://github.com/acids-ircam/nn_tilde" (a
  footnote, a third-party tool), so no code or weights release by the authors was found in the paper on 2026-11-10.
- Author measurements: Table 4 reports F-measures per network on GPercRep, GPercHeel and GPercPat; on the 4-class
  (hand part) task the text says "Uniformly across the tests, the networks yield an F-measure around 90% for
  GPercRep." On 2-class kick versus non-kick: "All networks are able to precisely discriminate between kicks and
  non-kicks with an F-measure above 99%." On GPercPat ("a snippet of real-world guitar percussion patterns", "85 hits
  in one minute of audio", recorded with "a different audio interface"): "the test on GPercPat exposes a
  generalisation problem: despite performing data augmentation during training, all networks show a bias toward
  non-kicks. PercCNN and PercVAE return only non-kicks in the dataset" and "This result may suggest that the networks
  still overfit to the extent that they are very sensitive to the way that the data is acquired." GPercHeel is "601
  heel hits". (Authors' words; full table not transcribed here.)
- License facts: no code, weights or data released (above). NO-CODE.

## AG-PT-set and ExpressiveGuitar-TechniqueClassifier (Stefani, Turchet; acoustic guitar, pitched and percussive)

- Dataset: "AG-PT-set: Acoustic Guitar Playing Technique dataset", Zenodo https://zenodo.org/records/10159492
  (creators "Domenico, Stefani", "Luca, Turchet", "Creative, Intelligent, and Multisensory Interactions Laboratory";
  published 2023-11-20, license metadata `cc-by-4.0`, access open; Zenodo API, read 2026-11-10). Description: "It
  contains 15 hours and 55 minutes of monophonic recordings of 12 expressive guitar playing techniques (pitched and
  percussive)." ... "10 hours and 4 minutes of recordings encompassing 8 of the 12 techniques have been labeled,
  meaning that onsets were identified at the millisecond level" ... "32,592 individual notes have been labeled.
  Recordings were performed by 6 players on 7 different acoustic steel-string guitars". Percussive classes as
  described there: "Kick technique (*percussive*): producing a sound that resembles a kick drum by hitting the lower
  right part of the top of the guitar body; Snare-A technique (*percussive*): producing a sound by hitting the lower
  right side of the guitar body; Tom technique (*percussive*): producing a sound by hitting the area of the guitar
  body near the top of the end of the fretboard, using the thumb; Snare-B technique (*percussive*): producing a
  sound by hitting the muted strings over the end of the fretboard". Pitched classes: natural harmonics, palm mute,
  pick near bridge, pick over the soundhole, bending, hammer-on, staccato, vibrato; "Techniques 1 through 8 have been
  meticulously labeled." Paper cited by TART (below) as Stefani, Giudici, Turchet, "On the importance of temporally
  precise onset annotations for real-time music information retrieval: Findings from the AG-PT-set dataset", Audio
  Mostly 2024, doi 10.1145/3678299.3678325 (not read).
- Code: https://github.com/domenicostefani/ExpressiveGuitar-TechniqueClassifier (branch `main`, last commit
  2024-10-30 `2ce1eb6`, clone). README: "The Jupyter notebook loads a dataset of feature vectors extracted from
  **pitched** and **percussive** sounds recorded with many acoustic guitars." Classes: "0. **Kick** (Palm on lower
  body) 1. **Snare 1** (All fingers on lower side) 2. **Tom** (Thumb on higher body) 3. **Snare 2** (Fingers on the
  muted strings, over the end of the fingerboard)" then "Natural Harmonics", "Palm Mute", "Pick Near Bridge", "Pick
  Over the Soundhole". Contents: `expressive-technique-classifier-phase3.ipynb`, `guitarists_touch.ipynb`,
  `run_grid_search.py`, `data/phase3/data_links.txt` (four Google Drive links to feature files). The four
  `phase3results/*samples_window.tflite` entries are symbolic links (git mode 120000) to absolute paths on the
  author's machine, so the trained models are not in the repository. `requirements.txt` is a conda export
  (`_tflow_select=2.1.0=gpu`, Python 3.8 builds). The classifier takes pre-computed feature vectors, not audio; the
  feature extractor is not in this repository.
- License facts: a. Code: LICENSE (clone) "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007". b. Weights: not
  published in the repository (above). c. Data: AG-PT-set, CC BY 4.0 per its Zenodo metadata. d. Not a service.

## TART: technique-aware audio-to-tablature (2025, 2026)

- What: Gupta, Park, Guzman, Gowda, Konduri, Lian, Netzorg, Anumanchipalli, "TART: A Modular Tool for
  Technique-Aware Audio-to-Tablature Guitar Transcription", arXiv 2609.11904 (2026-09-10, comment "ISMIR 2026"); an
  earlier version "TART: A Comprehensive Tool for Technique-Aware Audio-to-Tab Guitar Transcription", arXiv
  2510.02597 (2025-10-02). Abstract of 2609.11904: "a modular four-stage audio-to-tablature pipeline consisting of
  (1) an audio-to-MIDI transcription model, (2) an expressive technique classifier, (3) an audio-conditioned T5
  encoder-decoder for string-fret assignment, and (4) an automated tablature generator." Its first sentence names
  "expressive techniques such as slides, bends, and percussive hits".
- Technique classifier (2609.11904 PDF, read 2026-11-10): "The label space T consists of the classes listed in Table
  2: bend, hammer-on/pull-off, harmonics, kick drum, palm muting, picking/no technique, slide, snare drum, and
  vibrato." Per note: "we extract the audio chunk spanning the note's duration" ... "(sample rate 22.05 kHz, FFT
  window 1024). Each frame stacks 40 MFCCs, 40 log-mel bands, and 12 chroma coefficients into a 92-dimensional
  vector"; "a temporal CNN-BiLSTM"; "approximately 160,000 parameters in total." Training data: "We consolidate five
  publicly available guitar technique datasets into a single unified training set: IDMT-SMT-Chords [9],
  Guitar-TECHS [16], AGPT [8], EG-IPT [10], and Magcil [7]."
- Author measurements (Table 2, "Per-class results on the unified dataset test set"): F1 "Kick Drum ... 98.1%",
  "Snare Drum ... 99.3%", "Palm Muting ... 97.9%", "Hammer/Pull-off ... 97.4%", "Harmonics ... 94.9%", "Slide ...
  94.7%", "Bend ... 93.8%", "Vibrato ... 89.4%", "Macro Avg ... 95.9%" (support 11,372). Abstract: "Averaged across
  these four benchmarks, TART achieves 81.35% audio-to-MIDI F50 ... 71.8% string-fret Tab F1 ... and 54.08%
  end-to-end Tab F1."
- Code and weights: no repository link was found in the text of either PDF (searched for "github", "code",
  "available", "release" on 2026-11-10). NO-CODE found. UNVERIFIED whether code exists elsewhere; the authors'
  project pages would settle it.
- License facts: the 2609.11904 PDF's first-page footer says the paper is "Licensed under a Creative Commons
  Attribution 4.0 International License (CC BY 4.0)" (the paper text, not software). The training sets' licenses are
  in the dataset sections of this file: IDMT-SMT-Chords is CC BY-NC-ND 4.0 (below).

## EG-IPT dataset and ipt~ / libipt / ipt_models (electric guitar playing techniques, IRCAM)

- Paper and code: Fiorini, Brochec, Borg, Pasini, "Introducing EG-IPT and ipt~: a novel electric guitar dataset and a
  new Max/MSP object for real-time classification of instrumental playing techniques", NIME 2025 (README of
  https://github.com/nbrochec/nime2025 , branch `main`, last commit 2025-05-11 `74bafe9`, clone). The notebook
  trains a model and exports "a TorchScript `.ts` model for real-time usage"; README asks for "**Python 3.11.11**".
- Dataset: "EG-IPT Dataset (Electric Guitar Instrumental Playing Techniques)", Zenodo
  https://zenodo.org/records/15205644 (published 2025-04-13, version 1, license metadata `cc-by-4.0`, access open):
  "It contains 52,320 monophonic audio files, totaling 28 hours, 22 minutes, and 56 seconds of high-resolution
  recordings (96kHz / 24-bit), and amounts to 29.77 GB of data. The dataset covers 19 distinct electric guitar
  techniques, captured through isolated single-note performances by a professional guitarist."
- Pretrained model: Hugging Face `nbrochec/ipt_models` (created and modified 2026-09-23; card metadata
  `license: cc-by-nc-4.0`), file `eguitar_ircam.ts`. Card: "A model takes `(batch, 1, segment_length)` float32 raw
  audio and returns logits `(batch, num_classes)`; it exports `get_sr()`, `get_seglen()` and `get_classnames()`.
  Exported with torch 2.4.1". Model card `cards/eguitar_ircam.md` in https://github.com/DYCI2/ipt_models (last commit
  2026-09-23 `23e8472`, read as raw file): sample rate "8000 Hz", segment length "7168 samples (896 ms, latency
  floor)", "Classes | 14", "Parameters | 3,360,398", "Size | 14.1 MB", "Forward pass | 3.7 ms (Apple Silicon, CPU, 1
  thread)". Classes 0-13: `behind-nut`, `bend`, `bottleneck`, `glissando`, `legato`, `muted`, `palmstrike`,
  `scratch`, `snap-pizz`, `staccato`, `sustained`, `tremolo`, `trill`, `vibrato`. "Training ... Dataset: EG-IPT";
  "TODO: evaluation metrics" (no metrics on the card).
- How a program calls it: in Max/MSP, `ipt~ eguitar_ircam.ts` (card); ipt~ requirements (README of
  https://github.com/nbrochec/ipt_tilde , last commit 2026-11-10 `f72de8e`): "macOS 10.13 or later with an Apple
  Silicon processor ... **or** Windows 10/11 on an x64 CPU with AVX2" and "Max 8.6 or later / Max 9.0.3 or later".
  The C library https://github.com/nbrochec/libipt (last commit 2026-09-17) is "the standalone C library behind ipt~,
  to use it in your own project" (ipt~ README). A Vamp plugin, https://github.com/Ircam-Partiels/ipt-vamp-plugin (last
  commit 2026-10-23), installs from that repository's Releases page "for your operating system". The `.ts` file is a
  TorchScript module, so Python with `torch.jit.load` on Linux is a possible caller: this is an inference from the
  card's description of the file format, not a documented route (UNVERIFIED until the try agent loads it).
- Training code: https://github.com/nbrochec/ipt_recognition (branch `dev`, last commit 2026-04-18), "train your own
  playing techniques recognition model" (ipt~ README).
- License facts (all read 2026-11-10):
  a. Code: ipt_tilde LICENSE begins "Attribution-NonCommercial 4.0 International"; README "This project is released
     under a CC-BY-NC-4.0 license." nime2025 LICENSE: "This work is licensed under the Creative Commons
     Attribution-NonCommercial 4.0 International License." with "NonCommercial — You may not use the material for
     commercial purposes." ipt_recognition LICENSE begins "Attribution-NonCommercial 4.0 International". libipt
     LICENCE begins "Attribution-NonCommercial 4.0 International"; README: "libipt is distributed under CC BY-NC 4.0,
     inherited from ipt_tilde, which it incorporates. Commercial use is not permitted. (The wrapper code in include/,
     src/, examples/ is additionally available under MIT, but the built library as a whole remains CC BY-NC 4.0.)"
     ipt-vamp-plugin: no license file found in its top-level listing and no license text in its README.
  b. Weights: `nbrochec/ipt_models` card "## License CC-BY-NC-4.0." and metadata `cc-by-nc-4.0`; DYCI2/ipt_models
     LICENSE begins "Attribution-NonCommercial 4.0 International".
  c. Training data: EG-IPT, CC BY 4.0 per Zenodo metadata (above).
  d. Not a service.

## Other guitar playing-technique datasets (for training or testing a technique detector)

All read through the Zenodo API (`https://zenodo.org/api/records/<id>`) on 2026-11-10 unless stated.

- IDMT-SMT-Guitar (Fraunhofer IDMT), https://zenodo.org/records/7544110 , version 1.0.0, published 2023-01-17,
  license metadata `cc-by-nc-nd-4.0`, access open. "The first contains all introduced playing techniques (plucking
  styles: finger-style, muted, picked; expression styles: normal, bending, slide, vibrato, harmonics, dead-notes)"
  ... "about 4700 note events with monophonic and polyphonic structure." "The recordings are provided in one channel
  RIFF WAVE format with 44100 Hz sample rate." Annotations "stored in XML format".
- IDMT-SMT-Chords, https://zenodo.org/records/7544213 , version 1.0.0, published 2023-01-17, license metadata
  `cc-by-nc-nd-4.0`: "16 MIDI generated audio files" of chord classes (used in TART's technique training set).
- Guitar-TECHS (Pedroza, Abreu, Corey, Roman, ICASSP 2025, arXiv 2501.03720), https://zenodo.org/records/14963133 ,
  published 2025-04-06, license metadata `cc-by-4.0`, access open. Abstract: "a variety of guitar techniques, musical
  excerpts, chords, and scales" with "two stereo microphones: an egocentric microphone positioned on the performer's
  head and an exocentric microphone placed in front of the performer" plus direct input and amplifier recordings;
  "All signals and MIDI labels are properly synchronized."
- guitar_style_dataset (Mitsou, Petrogianni, Vakalaki, Nikou, Psallidas, Giannakopoulos, "A multimodal dataset for
  electric guitar playing technique recognition", Data in Brief 52 (2023) 109842; full text read through Europe PMC
  `https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10698518/fullTextXML`): "549 video samples in MP4 format, and
  their respective audio samples in WAV format, covering nine different electric guitar techniques"; the nine:
  alternate picking, legato, "Tapping: using the fingertips of both the fretting and picking hand on the fretboard to
  fret notes", sweep picking, vibrato, hammer-on, pull-off, slide, bend. Data: "Repository name:
  guitar_style_dataset Data identification number: 10.5281/zenodo.10075352"; Zenodo record 10075352
  "magcil/guitar_style_dataset: Initial Release", v1.0.0, published 2023-11-06, license metadata `cc-by-4.0`, one file
  `magcil/guitar_style_dataset-v1.0.0.zip` of 14,251,969,884 bytes. The article itself: "This is an open access
  article under the CC BY-NC-ND license".
- GOAT (Loth, Sarmento, Sarkar, Guo, Barthet, Sandler, ISMIR 2025, arXiv 2509.22655): "5.9 hours of unique
  high-quality direct input audio recordings of electric guitars" ... "Each recording is annotated using guitar
  tablatures, a guitar-specific symbolic format supporting string and fret numbers, as well as numerous playing
  techniques." Zenodo record 17706552 (license `cc-by-4.0`) holds the conference paper PDF only (resource type
  "Conference paper", file `000076.pdf`); where the dataset files are published and under which license:
  UNVERIFIED (not found today).
- Procedural fingerpicking data: Murgul and Heizmann, "Exploring Procedural Data Generation for Automatic Acoustic
  Guitar Fingerpicking Transcription", arXiv 2508.07987 (AIMC 2025): "knowledge-based fingerpicking tablature
  composition, MIDI performance rendering, physical modeling using an extended Karplus-Strong algorithm, and audio
  augmentation"; code and data release not checked: UNVERIFIED.

## Other items checked: SpectroFusionNet, Hi-Drum

- SpectroFusionNet: "SpectroFusionNet a CNN approach utilizing spectrogram fusion for electric guitar play
  recognition", Scientific Reports, https://www.nature.com/articles/s41598-025-00287-w (read 2026-11-10). Abstract:
  spectrograms "(MFCC), Continuous Wavelet Transform (CWT), and Gammatone" processed by "lightweight models
  (MobileNetV2, InceptionV3, ResNet50)", fused features fed "into nine machine learning classifiers"; authors' figure:
  "MFCC-Gammatone late fusion provided the best classification performance, achieving 99.12% accuracy, 100%
  precision, and 100% recall across 9 distinct guitar sound" classes. "Data availability: The Guitar style dataset
  analysed in this study are available in https://zenodo.org/records/10075352." No code link was found in the page
  text (searched "github", "code availab"); the Zenodo data link above is the only repository link found. NO-CODE
  located.
- Hi-Drum: project page https://hanguang9527.github.io/drum (read 2026-11-10): "we propose Hi-Drum, a novel paradigm
  combining a self-supervised music understanding model and a Large Language Model (LLM), integrated with a
  Hierarchical Drum Module (HDM)" and "sequence modeling is performed by the Qwen decoder". No code, weights or paper
  link was found in the page text or among the page's HTML `href` links (which point to CSS files, an HTML MIDI
  player, BandLab, a Native Instruments manual and the page theme). NO-CODE located.

## partitura `estimate_voices` (symbolic voice separation, VoSA)

- What: README: "**Partitura** is a Python package for handling symbolic musical information. It supports loading
  from and exporting to *MusicXML* and *MIDI* files." Repository https://github.com/CPJKU/partitura (branch
  `main`, last commit 2026-05-25 `427ff87`, clone); PyPI 1.9.0 uploaded 2026-05-25, `requires_python` ">=3.10"
  (PyPI JSON).
- How a program calls it: `partitura.musicanalysis.estimate_voices(note_info, monophonic_voices=True)` (signature in
  `partitura/musicanalysis/voice_separation.py`, clone). Docstring: "Voice estimation using the voice separation
  algorithm proposed in [6]_." with "[6] Chew, E. and Wu, Xiaodan (2004) "Separating Voices in Polyphonic Music: A
  Contig Mapping Approach"". The docstring's description of `monophonic_voices` ends "Defaults to False." while the
  signature's default is `True` (both as written in the source).
- Input: "Note information as a `Part` or `PerformedPart` instances or as a structured array" (the fields of the
  `note_array` properties); "If the array contains onset and duration information of both score and performance,
  (e.g., containing both `onset_beat` and `onset_sec`), the score information will be preferred." A MIDI file loads
  through `load_score_midi`, `load_performance_midi` or `midi_to_notearray` (names exported in
  `partitura/__init__.py`, clone; their docstrings were not read today).
- Output: "voice : numpy array Voice for each note in the notearray. (The voices start with 1, as is the MusicXML
  convention)." Limitation in the docstring: "Handle grace notes correctly. The current version simply deletes all
  grace notes."
- Constraints for a re-run: `monophonic_voices` only; no "number of voices" or pitch-range argument in the signature.
- License facts: a. LICENSE (clone) "Apache License Version 2.0, January 2004"; PyPI license field "Apache 2.0".
  b-d. No weights, no training data, no service.

## music21 (stream tools that split overlapping notes into voices)

- What: README: "`music21` -- A Toolkit for Computer-Aided Musical Analysis and Computational Musicology",
  "Copyright © 2006-2026 Michael Scott Asato Cuthbert". Repository
  https://github.com/cuthbertLab/music21 (branch `master`, last commit 2026-11-08 `8bfcfc4`, clone;
  `music21/_version.py` on master reads `__version__ = '11.0.0b18'`). PyPI 10.5.2 uploaded 2026-10-28,
  `requires_python` ">=3.11", `license_expression` "BSD-3-Clause" (PyPI JSON).
- What it has for voices (docstrings in `music21/stream/base.py` on master, read as raw file 2026-11-10):
  - `Stream.makeVoices(*, inPlace=False, fillGaps=True)`: "If this Stream has overlapping Notes or Chords, this
    method will isolate all overlaps in unique Voices, and place those Voices in the Stream."
  - `Stream.voicesToParts(*, separateById=False)`: "If this Stream defines one or more voices, extract each into a
    Part, returning a Score."
  - `Stream.chordify(...)`: "Create a chordal reduction of polyphonic music, where each change to a new pitch results
    in a new chord."
  - `Stream.flattenUnnecessaryVoices(*, force=False, inPlace=False)`.
  No perceptual voice-separation (melody versus bass) algorithm was found among these docstrings; `makeVoices`
  splits by overlap. A search of the whole package for other voice-separation code was not done: UNVERIFIED that
  none exists.
- I/O: MIDI and MusicXML reading and writing through `converter.parse` and `stream.write` were not re-read today:
  UNVERIFIED here (music21's own docs would settle it).
- License facts: a. LICENSE (clone): "Copyright (c) 2006-2026 Michael Scott Asato Cuthbert" and "Redistribution and
  use in source and binary forms, with or without modification, are permitted provided that the following
  conditions are met:" (BSD-3-Clause per PyPI). b-d. None.

## Cluster and Separate / piano_svsep (GNN voice and staff prediction, ISMIR 2024)

- What: "Official implementation of the ISMIR 2024 paper "Cluster and Separate: A GNN Approach to Voice and Staff
  Prediction for Score Engraving, by Francesco Foscarin, Emmanouil Karystinaios, Eita Nakamura, and Gerhard Widmer""
  (README of https://github.com/CPJKU/piano_svsep , branch `main`, last commit 2026-03-09 `1462e7c`, clone); arXiv
  2407.21030. Abstract: "We focus on piano music and support homophonic voices, i.e., voices that can contain chords,
  and cross-staff voices" and "All code and pre-trained models are available at https://github.com/CPJKU/piano_svsep".
- Weights: `pretrained_models/model.ckpt` in the repository tree (clone listing).
- How a program calls it (README): install PyTorch, then `pip install .`; prediction
  `python launch_scripts/predict.py --model_path pretrained_models/model.ckpt --score_path artifacts/test_score.musicxml --save_path artifacts/test_score_pred.mei`.
  README badges: "Python_3.8+", "PyTorch_2.0+".
- Input and output: "input a musical score (with potentially random voice and staff assignments). The system will
  then return a MEI version of the same musical score with newly produced voice and staff information." The paper
  abstract: notes "from a quantized symbolic music piece (e.g., a MIDI file)". Input must be quantized; README: "Our
  system is supposed to be run in the final stage of a transcription or generation process, where a musical score is
  *almost* ready".
- License facts: a. LICENSE (clone) "MIT License", "Copyright (c) 2024 Institute of Computational Perception",
  "Permission is hereby granted, free of charge, to any person obtaining a copy of this software [...]".
  b. Weights: in the same repository; no separate statement found in the README.
  c. Training data: README: "Unfortunately, the `jpop` dataset we used in our paper is not public, therefore the
  results of the paper are not entirely reproducible." and the training default is now "`dcml` only". The license of
  the DCML corpora used was not read today: UNVERIFIED. The shipped checkpoint is described as "This uses the pretrained model
  we use for the evaluation in our paper", and the README says the paper used "both `dcml` and `jpop` datasets"; that
  the checkpoint was therefore trained with `jpop` is an inference from those two lines: UNVERIFIED.
  d. Not a service.

## vocsep_ijcai2023 (voice separation as link prediction)

- What: Karystinaios, Foscarin, Widmer, "Musical Voice Separation as Link Prediction: Modeling a Musical Perception
  Task as a Multi-Trajectory Tracking Problem", arXiv 2304.14848 (2023-04-28), comment "Accepted at the 32nd
  International Joint Conference on Artificial Intelligence (IJCAI-23)". Code: https://github.com/manoskary/vocsep_ijcai2023
  (branch `main`, last commit 2023-10-18 `82152a9`, clone; the earlier guess `manoskary/vocsep` did not resolve).
  Abstract: "Our approach builds a graph from a musical piece, by creating one node for every note, and separates the
  melodic trajectories by predicting a link between two notes if they are consecutive in the same voice/stream."
- How a program calls it (README): `pip install -r requirements.txt` ("The requirements installs the cpu version of
  Pytorch and Pytorch-Scatter"), `python -m main.py`; "This project depends on [WANDB] therfore you will need an
  account to run the code." No pretrained-weight file appears in the repository listing (clone).
- Author measurements (README table, F1 of "GMMT+LA"): Inventions 0.997, Sinfonias 0.985, WTC I 0.976, WTC II 0.972,
  Haydn 0.872; McLeod's method on the same rows: 0.992, 0.982, 0.964, 0.964, 0.781.
- License facts: a. LICENSE (clone) "MIT License", "Copyright (c) 2023 Emmanouil Karystinaios". b. No weights in the
  repository. c. Training data: the README's results table names Inventions, Sinfonias, WTC I, WTC II and Haydn; which
  corpora trained which model, and their licenses, were not read: UNVERIFIED. d. Not a service.

## McLeod and Steedman HMM voice separation (Java)

- What: "This is the code and data from my 2016 Journal of New Music Research paper" (McLeod and Steedman,
  "HMM-Based Voice Separation of MIDI Performance", JNMR 45(1), 2016). "The goal of this project is to have a Java
  program which is able to split MIDI performance data into monophonic voices." Repository
  https://github.com/apmcleod/voice-splitting (branch `master`, last commit 2020-08-26 `ea80457`, clone).
- How a program calls it (README): build with `make`, then
  `java -cp bin voicesplitting.voice.hmm.HmmVoiceSplittingModelTester -w voice FILES` "will write the resulting
  voices of the given FILES into new MIDI files in the voice directory"; "Add `-l` if the MIDI files are live
  performance (unquantized) MIDI."; "`-M INT` flag to set the maximum number of voices to output"; GUI
  `java -cp bin voicesplitting.gui.VoiceSplittingGUI`.
- Input: MIDI (quantized or live). Output: MIDI with "voices divided by both channel and track."
- License facts: a. `License` file (clone): "Copyright (c) 2015 Andrew McLeod" then the MIT grant "Permission is
  hereby granted, free of charge, to any person obtaining a copy of this software [...]"; README: "You are free to
  use this software as is allowed by the [MIT License]". b-d. No weights or service.

## MidiBERT-Piano melody extraction (MIDI in, melody MIDI out)

- What: official repository for "MidiBERT-Piano: Large-scale Pre-training for Symbolic Music Understanding" (arXiv
  2107.05223), authors Yi-Hui (Sophia) Chou and I-Chun (Bronwin) Chen (README of https://github.com/wazenmai/MIDI-BERT ,
  default branch `CP`, last commit 2024-04-10 `0b93558`, clone). README: "extract melody (mid to mid) using
  pre-trained MidiBERT-Piano".
- Weights: README: "Please download the [checkpoints](https://drive.google.com/drive/folders/...)" with
  `result/finetune/melody_default/model_best.ckpt` among them; "(Note: we only provide checkpoints for models in CP
  representations)"; "*No gpu is needed for evaluation*".
- How a program calls it: `scripts/melody_extraction.sh` runs
  `python3 melody_extraction/midibert/extract.py --input=$song_path --ckpt=$model_path --cpu --bridge=False`;
  `extract.py` arguments include `--input_path` ("path to the input midi file"), `--output_path` ("path to the output
  midi file"), `--ckpt`, `--bridge` ("View bridge as melody (True) or accompaniment (False)"), `--cpu`.
- Input and output: MIDI in, "the predicted melody midi file" out (`extract.py` docstring: "Given path to input midi
  file, save the predicted melody midi file.").
- Training data, `extract.py` docstring: "Please note that the model is trained on pop909 dataset (containing 3
  classes: melody, bridge, accompaniment)". POP909 (https://github.com/music-x-lab/POP909-Dataset , last commit
  2020-08-28, clone): README "MELODY track for the main melody, BRIDGE track for the sub-melody, and PIANO track for
  the accompaniment"; LICENSE "MIT License", "Copyright (c) 2020 Music X Lab".
- License facts: a. LICENSE (clone) "MIT License", "Copyright (c) MidiBERT-Piano development team"; the README also
  shows an "ARXIV LICENSE" badge linking to arXiv's non-exclusive distribution licence (for the paper). b. No
  separate licence statement next to the checkpoint link. c. POP909 MIT (above); the pre-training corpora named in
  `Data/CP_data/` (e.g. ASAP, EMOPIA files) were not checked: UNVERIFIED. d. Not a service.

## QM Vamp Plugins: note onset detector (Vamp, for Sonic Visualiser or Sonic Annotator)

- What: "Audio feature extraction plugins in [Vamp format] from the [Centre for Digital Music] at Queen Mary,
  University of London", including "Note onset detector" (README of https://github.com/c4dm/qm-vamp-plugins , branch
  `master`, last commit 2021-06-02 `c918afc`, clone; CHANGELOG top entry "QM Vamp Plugins v1.8 (January 2020)").
  Plugin docs: https://vamp-plugins.org/plugin-doc/qm-vamp-plugins.html (named in the README; not read today).
- How a program calls it: as a Vamp plugin inside a Vamp host; "Ready-to-use binary builds of these plugins are
  provided for common platforms"; Linux build `make -f build/linux/Makefile.linux64` after `./repoint install`
  (README). The host program Sonic Annotator was not checked today (`c4dm/sonic-annotator` did not resolve as a
  GitHub repository on 2026-11-10).
- License facts: a. COPYING (clone) "GNU GENERAL PUBLIC LICENSE Version 2, June 1991"; README "Licence": "These
  plugins are provided under the terms of the GNU General Public License.  You may install and use the plugin
  binaries without fee for any purpose commercial or non-commercial. You may also modify and redistribute the
  plugins in source or binary form, provided you comply with the terms given by the GNU General Public License." and
  "If you wish to use this code in a proprietary application or product for which the terms of the GPL are not
  appropriate, please contact QM Innovation https://www.qminnovation.co.uk/ for licensing terms." b-d. No model
  weights, data or service.

## Deep Salience (bass, melody and multi-f0 salience from polyphonic audio)

- What: companion code for Bittner, McFee, Salamon, Li, Bello, "Deep Salience Representations for F0 Estimation in
  Polyphonic Music", ISMIR 2017 (README of https://github.com/rabitt/ismir2017-deepsalience , branch `master`, last
  commit 2019-11-22 `4b2ff44`, clone).
- Weights in the repository tree: `predict/weights/bass.h5`, `melody1.h5`, `melody2.h5`, `melody3.h5`,
  `multif0.h5`, `pitch.h5`, `vocal.h5` (clone listing); `predict/predict_on_audio.py` has
  `TASKS = ['bass', 'melody1', 'melody2', 'melody3', 'multif0', 'pitch', 'vocal']`.
- How a program calls it: README: "To compute output from these models, run the script predict/predict_on_audio.py".
  Arguments in that script: positional `audio_fpath`, `task`, `save_dir`; `-f, --output_format` (singlef0, multif0
  or salience, per `compute_output`'s docstring "specify whehter to save output as singlef0, multif0 or salience");
  `-t, --threshold` ("Amplitude threshold"); `-n, --use_neg`. Audio is loaded with `librosa.load(audio_fpath, sr=SR)`
  with `SR = 22050`.
- Output: tab-separated CSV files named `<name>_<task>_singlef0.csv` (time, frequency per row) or
  `<name>_<task>_multif0.csv` (time then all frequencies above threshold), or the salience matrix. Times in seconds
  and frequencies in Hz (docstring: "List of time stamps in seconds", "List of frequency values in Hz").
- Runtime stack: `requirements.txt` lists `keras>=2.0.3`, `librosa>=0.5.0`, `pescador`, `mir_eval`, `medleydb`;
  `replicate.yaml` in the repository pins `tensorflow==1.12.0`, `keras==2.0.3`, `librosa==0.5.0` and
  `python_version: 2.7.15`.
- License facts:
  a. Code: LICENSE (clone) "MIT License", "Copyright (c) 2017 Rachel Bittner".
  b. Weights: in the same repository; no separate statement found.
  c. Training data: the `medleydb` dependency and `replicate.yaml`'s `test_set: medleydb_melody1` point to MedleyDB
     (which subsets trained each model is in the paper: UNVERIFIED here). MedleyDB downloads page
     https://medleydb.weebly.com/downloads.html , read 2026-11-10: "MedleyDB is offered free of charge for
     non-commercial research use only under the terms of the Creative Commons Attribution Noncommercial License." and
     "MedleyDB by R. Bittner et. al. is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
     International License." and "while redistribution of the data is technically allowed under this license, we ask
     that you do not republish the dataset in full or in part without our consent." Zenodo record 1649325 ("MedleyDB
     Audio") shows access "restricted" and no license field.
  d. Not a service.

## Guitar string separation (per-string stems from one guitar): Bastas, Katsouros, Maragos 2025

- What: "Separate and Transcribe: Deep Guitar String Separation and its Application for Tablature Transcription
  Enhancement", IEEE Transactions on Audio, Speech and Language Processing, vol. 33, pp. 4184-4195, 2025, DOI
  10.1109/TASLPRO.2025.3614466 (author PDF
  https://robotics.ntua.gr/wp-content/uploads/sites/2/2025_Bastas_Deep-Guitar-StringSeparation-TablatureTranscription_TASLP_final.pdf ,
  read 2026-11-10). Abstract: "Guitar string separation constitutes a source separation task in which the individual
  stems to be retrieved are the signals produced by each distinct guitar string." The paper's experiments use
  "datasets: GuitarSet and DadaGP" and say "We relied on a publicly available implementation" of Wave-U-Net
  (footnote https://github.com/f90/Wave-U-Net-Pytorch); it says it creates "two new datasets that are also made
  publicly available" (footnote 3, a Google Drive folder).
- Code: footnote 4: "The source code is available at: https://github.com/gbastas/deep-guitar-separation" (branch
  `main`, last commit 2026-02-06 `9ab017e`, clone). Top-level folders: `Tab-estimator`, `TabCNN`,
  `Wave-U-Net-Pytorch-6string`, `demucs`, `datasets`, `data-manipulation-code`. README prediction command:
  `python predict.py --load_model checkpoints/{checkpoint_dir}/best_checkpoint_<N> --input path/to/wav --cuda`.
  Training commands in the README pass `--cuda`. Trained checkpoints: the repository listing holds only result CSV
  files under `Wave-U-Net-Pytorch-6string/mycheckpoints/` (no model files), so a user trains first.
- Input and output: a guitar WAV in, six per-string audio stems out (one per string, per the abstract's
  definition); bass versus melody would then follow string membership, which is an inference, not a documented
  feature.
- License facts: a. LICENSE (clone) "MIT License", "Copyright (c) 2025 gbastas". b. No weights published in the
  repository. c. Training data: GuitarSet, downloaded from https://zenodo.org/record/3371780 per the README (its
  license is quoted in the guitar-tab lane's survey), and audio rendered from DadaGP tablatures (DadaGP's terms are
  in the guitar-tab lane's survey). d. Not a service.
- Earlier NMF baseline named in that README: the "Senvaitytite train-test split" repository
  https://github.com/daliasen/GuitarStringSeparation-MF-NMF-NMFD (last commit 2019-04-02, clone) contains only
  `basesMIDI.csv`, `testSet.csv` and `trainSet.csv`; no code and no license file found on 2026-11-10.

## Commercial: desktop and hosted drum-to-notes

- Ableton Live, "13.4 Convert Drums to New MIDI Track" (Live 12 Reference Manual,
  https://www.ableton.com/en/live-manual/12/converting-audio-to-midi/ , read 2026-11-10): "This command extracts the
  rhythms from unpitched, percussive audio and places them into a clip on a new MIDI track. The command also attempts
  to identify kick, snare and hihat sounds" ... "Convert Drums works well with recorded breakbeats, but also with your
  own recordings such as beatboxing or tapping on a surface." and "The Convert Drums command, for example, works best
  with unaccompanied drum breaks; if other instruments are present, their notes will be detected as well." The user
  can correct the input: "you can “tune” the results of the conversion by adding, moving, or deleting transient
  markers in the audio clip before running any of the Convert commands." DESKTOP (a command inside Live). Which Live
  editions include it and the price were not on this page: UNVERIFIED (Ableton's edition comparison page would
  settle it). No API.
- Klangio Drum2Notes (https://klang.io/drum2notes/ , read 2026-11-10): "Record, Upload or use a YouTube Link of Music
  to turn the Drums into Sheet Music, MIDI and MusicXML within seconds."; "Polyphonic - Detects and writes down snare,
  toms, bass drum and different cymbals, even when played simultaneously."; "Export your notes as sheet music PDFs,
  quantized or unquantized MIDI files and MusicXML." SERVICE. `https://klang.io/pricing/` answered 404 on 2026-11-10.
  The Klangio developer API (request format, terms, price) is documented in the hosted-apis lane's survey
  (`../hosted-apis/survey.md`, section "Klangio API").

## Access needs (what a person would need beyond this CPU box), from the sections above

- Nothing beyond a Linux CPU machine and Python, per the projects' own docs: librosa, Essentia (PyPI wheels),
  aubio, madmom (source build with Cython and NumPy), SuperFlux, libnmfd, scikit-learn, partitura, music21,
  ADTOF-pytorch (pass `--device cpu`; its CLI default is `cuda`), Omnizart (`omnizart download-checkpoints` fetches
  weights from a GitHub release), Inverse Drum Machine (its example falls back to CPU), LarsNet (`-d` default `cpu`;
  a 562 MB weights download from Google Drive), MidiBERT-Piano ("No gpu is needed for evaluation"; checkpoints from
  Google Drive), McLeod voice-splitting (a Java toolchain and `make`).
- An old software stack: ADTOF (README "tested on macOS Ventura with **Python 3.10**", TensorFlow >= 2.13 and
  madmom from git); Deep Salience (`replicate.yaml` pins Python 2.7.15, TensorFlow 1.12.0, Keras 2.0.3); Magenta
  Onsets and Frames (the archived Magenta package, PyPI 2.1.4 from 2022-08-01; drums checkpoint dated 2020-03-28).
- An account: vocsep_ijcai2023 ("This project depends on [WANDB] therfore you will need an account to run the
  code."); Klangio Drum2Notes (web sign-up; prices not read today).
- Specific desktop software: ipt~ needs "macOS 10.13 or later with an Apple Silicon processor ... **or** Windows
  10/11 on an x64 CPU with AVX2" and "Max 8.6 or later / Max 9.0.3 or later"; the IPT Vamp plugin installs from its
  Releases page per operating system; Ableton Live for "Convert Drums to New MIDI Track" (edition and price not
  read today).
- A GPU or training run first: Bastas et al. string separation ships no trained weights and its README's training
  commands pass `--cuda`; ADT_STR's training uses Hugging Face `Trainer`/Accelerate (inference is documented without
  a GPU requirement); Stefani's classifier needs its feature files downloaded and the model retrained (the `.tflite`
  entries are dangling links).
- Data access by request or not public: ADTOF datasets ("available upon request", "internal non-commercial use");
  GPercRep ("currently not public"); piano_svsep's `jpop` set ("not public"); Omnizart's "Pop" drum set (not
  downloadable per `datasets.py`).

## Handoff facts

One line per fact: "X outputs ..., which Y accepts as ...", with the source of each half. Sources are sections above
unless a URL is given. "(not run)" means the pairing is from the documents only; the try agent's `trials.md` holds
what was actually chained.

Inside this lane:

1. `librosa.effects.hpss` outputs two NumPy waveforms (harmonic, percussive) of the input's length (librosa 1.0.0
   docstring, `effects.py`), which `librosa.onset.onset_detect(y=..., sr=..., units='time')` accepts as `y`
   (`onset.py`), returning onset times in seconds. The try agent chained these (trials.md, run r0031).
2. The percussive waveform, once written to a WAV file (the try agent wrote `percussive.wav` files in run r0031),
   is an audio file, which ADTOF-pytorch
   accepts as `--audio input.wav` (loaded with `librosa.load(..., sr=44100)`, `audio.py`) and turns into a MIDI file
   with General MIDI pitches 35, 38, 47, 42, 49 at velocity 100 (`post_processing.py`) (not run).
3. The same WAV is accepted by `omnizart drum transcribe <path/to/audio.wav>` (README; docs "Path to the raw audio
   file (.wav)"), which writes MIDI with pitches 35, 38, 42, velocity 100, 0.05 s notes (`omnizart/drum/inference.py`)
   (not run).
4. Any of the onset detectors (`aubioonset`: "the detected onset times are given on the console, in seconds"; madmom `OnsetPeakPickingProcessor` returns
   "Detected onsets [seconds]"; Essentia `Onsets` "the onset positions [s]"; librosa with `units='time'`) output
   plain lists of seconds, which the Inverse Drum Machine's `separate(..., onsets={'KD': [...], 'SD': [...], ...})`
   accepts as a per-class onset override (IDM README; "onset times in seconds" per `idm/utils.py`) (not run). This is the one documented "user
   correction re-runs the model" hook found in this lane's drum tools.
5. The harmonic waveform written to WAV is "a compatible audio file" for Basic Pitch, which "will generate a MIDI file,
   complete with pitch bends" and can save "note events as a CSV file" (`--save-note-events`), with
   `<minimum-frequency>` and `<maximum-frequency>` limits in Hz (README,
   https://raw.githubusercontent.com/spotify/basic-pitch/main/README.md , read 2026-11-10) (audio-to-notes lane).
6. A MIDI file (from Basic Pitch or any transcriber) is accepted by partitura's `load_performance_midi` /
   `load_score_midi` / `midi_to_notearray` (exported in `partitura/__init__.py`, clone), whose result is accepted by
   `partitura.musicanalysis.estimate_voices(note_info, monophonic_voices=...)`, which outputs "Voice for each note in
   the notearray" (1-based integers) (not run).
7. A MIDI file is accepted by McLeod's `HmmVoiceSplittingModelTester -w voice FILES` (`-l` for unquantized "live
   performance" MIDI, `-M INT` maximum voices), which writes MIDI with "voices divided by both channel and track"
   (README) (not run).
8. A quantized score in MusicXML (e.g. written by partitura's `save_musicxml`, exported in `partitura/__init__.py`)
   is accepted by piano_svsep's
   `predict.py --score_path ... .musicxml`, which outputs MEI "with newly produced voice and staff information"
   (README) (not run). Input must be quantized (paper abstract: "a quantized symbolic music piece").
8b. A MIDI file is accepted by MidiBERT-Piano's `extract.py --input_path <midi> --ckpt <melody checkpoint> --cpu`,
    which saves "the predicted melody midi file" (`extract.py` docstring); its `--bridge` flag decides whether
    POP909's "bridge" class counts as melody (not run).
9. music21 `Stream.makeVoices()` outputs a stream whose overlapping notes sit in separate `Voice` objects, which
   `Stream.voicesToParts()` accepts and turns into "a Score" with one `Part` per voice (docstrings, `stream/base.py`)
   (not run).
10. Deep Salience `predict_on_audio.py <audio> bass <dir> -f singlef0` outputs a tab-separated CSV of time (s) and
    frequency (Hz) per frame for the bass line, and the `melody1|2|3` tasks the same for the melody
    (`predict_on_audio.py`); a frequency-to-MIDI-pitch step (not part of the tool) is needed before any MIDI consumer
    (not run).
11. Raw audio resampled to 8 kHz and cut into float32 segments of 7168 samples is the input `eguitar_ircam.ts`
    accepts (`(batch, 1, segment_length)`), and it outputs logits over 14 technique classes including `palmstrike`,
    `muted`, `bend`, `legato`, `vibrato` (model card) (not run).

To and from neighbouring lanes:

12. Demucs `htdemucs_6s` "adds a `guitar` and `piano` source" (Demucs README,
    https://raw.githubusercontent.com/facebookresearch/demucs/main/README.md , read 2026-11-10), and that guitar stem
    is an audio file, which `librosa.effects.hpss` (after `librosa.load`) and every onset detector above accept
    (source-separation lane to this lane) (not run here).
13. A per-voice MIDI file (one voice per file, from step 7 or a split by step 6's voice numbers) matches what tuttut
    accepts: "Converts MIDI files to guitar tabs." and "The tool works best for single-channel, single-instrument MIDI
    files" (README, https://raw.githubusercontent.com/natecdr/tuttut/main/README.md , read 2026-11-10); tuttut takes a
    tuning ("It can handle any tuning for any number of strings") (this lane to guitar-tab lane) (not run).
14. The drum MIDI files are written as drum tracks: ADTOF-pytorch `pretty_midi.Instrument(program=program,
    is_drum=is_drum)` with default `is_drum: bool = True` (`post_processing.py`); Omnizart
    `pretty_midi.Instrument(program=1, is_drum=True, name="drums")` (`omnizart/drum/inference.py`); ADT_STR
    `pretty_midi.Instrument(program=0, is_drum=True)` (`adt_transcriber.py`). A General MIDI synthesizer such as the
    box's FluidSynth with FluidR3_GM (PLAN.md) is the kind of player that takes a drum track (to web-tab-render /
    browser-audio-sync lanes) (not run).
15. User constraints, by tool, as documented above: ADTOF-pytorch per-class thresholds (`--thresholds`); Omnizart
    drum thresholds `bass_drum_th`, `snare_th`, `hihat_th` (API docs); IDM onset override (step 4); aubio threshold,
    minimum inter-onset interval and silence gate; librosa HPSS kernel and margin; partitura `monophonic_voices`;
    McLeod `-M` maximum voices; Basic Pitch frequency limits; tuttut tuning. No tool in this lane takes a capo or a
    tuning directly; the frequency limits and voice counts are the closest constraints.
