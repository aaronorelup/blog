# Lane 2, chords-beats-key: survey of chord, beat, tempo, key and tuning tools

Agent: docs-chords-beats-key. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from the
live pages on 2026-11-10 unless a line says otherwise. Raw copies of files fetched with curl or git (LICENSE
files, READMEs, PyPI JSON) are kept outside the repo in `/home/user/gtr/lanes/chords-beats-key/raw/` (not
committed). This file records facts and quotes only; it does not rank or recommend.

Marks used in the tool list:

- `RUNNABLE`: looks installable and runnable on the CPU-only Linux research box (pip / apt / npm package or a
  repository with CPU inference code and released weights). Whether it actually ran is in `trials.md`, not here.
- `NEEDS-ACCOUNT`: a hosted service or API that needs an account or key.
- `NO-CODE-FOUND`: a paper or product with no public code or API found on 2026-11-10.

## Tool list

First pass written in the first 15 minutes from web search results. Each line is re-checked in its own section
below, and the section is what counts. "pending" means the section has not been written yet. Dates are filled
in from the repositories and package indexes as each section is written.

### Chord recognition

1. Chordino and NNLS Chroma (Vamp plugins, Matthias Mauch, C4DM Queen Mary University of London), host with
   Sonic Annotator CLI, Sonic Visualiser, or the `vamp` Python host. RUNNABLE. pending
2. madmom chord recognisers (`DeepChromaChordRecognitionProcessor`, `CNNChordFeatureProcessor` +
   `CRFChordRecognitionProcessor`), CPJKU / JKU Linz. RUNNABLE (Python 3.11 with a source build). pending
3. autochord (cjbayron), Bi-LSTM-CRF on NNLS chroma, PyPI `autochord`. RUNNABLE (TensorFlow). pending
4. chord-extractor (ohollo), Python wrapper around Chordino with multiprocessing, PyPI `chord-extractor`. RUNNABLE. pending
5. BTC, Bi-directional Transformer for Chord recognition (jayg996/BTC-ISMIR19, ISMIR 2019). RUNNABLE (PyTorch, weights in repo). pending
6. CREMA, convolutional-recurrent chord model (bmcfee/crema). RUNNABLE (old Keras/TensorFlow pins). pending
7. lv-chordia, PyPI package of the ISMIR 2019 large-vocabulary chord transcription model (Jiang et al.). RUNNABLE. pending
8. ChordMini (ptnghia-j/ChordMiniApp), web app combining chord models (BTC variants, Chord-CNN-LSTM) and beat trackers. pending
9. Essentia `ChordsDetection` / `ChordsDetectionBeats` (HPCP templates), MTG UPF. RUNNABLE (`pip install essentia`). pending
10. Omnizart chord (Harmony Transformer based), Music-and-Culture-Technology-Lab. RUNNABLE? (old Python pins). pending
11. Harmony Transformer and Harmony Transformer v2 (Tsung-Ping Chen, Li Su). pending
12. ACR_seq2seq (KimLeekyung), seq2seq Transformer chord recognition, arXiv 2025/2026. pending
13. ChordFormer (Akram et al., arXiv 2502.11840, 2025). pending (code link not yet found)
14. BMACE, bidirectional Mamba chord model (Yuan, Devaney, arXiv 2601.02101). pending (code link not yet found)
15. QM Vamp Plugins (Chromagram, Key Detector, Tempo and Beat Tracker, Bar and Beat Tracker, Tonal Change). RUNNABLE. pending

### Beat, downbeat and tempo

16. madmom beat / downbeat / tempo (`RNNBeatProcessor` + `DBNBeatTrackingProcessor`, `RNNDownBeatProcessor` +
    `DBNDownBeatTrackingProcessor`, `TempoEstimationProcessor`). RUNNABLE. pending
17. librosa `beat.beat_track`, `feature.tempo` (`beat.tempo`), `beat.plp`, onset tools. RUNNABLE. pending
18. Beat This! (CPJKU/beat_this, ISMIR 2024), beats and downbeats without a DBN. RUNNABLE (PyTorch, CPU allowed). pending
19. BeatNet (mjhydri/BeatNet, ISMIR 2021) and BeatNet+ (TISMIR 2024). RUNNABLE (BeatNet). pending
20. All-In-One / `allin1` (mir-aidj/all-in-one, WASPAA 2023): tempo, beats, downbeats, sections, labels. RUNNABLE? (needs madmom, natten, Demucs). pending
21. Essentia `RhythmExtractor2013`, `PercivalBpmEstimator`, `TempoCNN` (TensorFlow models). RUNNABLE. pending
22. aubio `tempo` / `aubio beat` CLI and Python. RUNNABLE (installed on the box). pending
23. tempo-cnn (hendriks73/tempo-cnn, Schreiber and Müller). RUNNABLE? (TensorFlow pins). pending
24. Beat Transformer (zhaojw1998/Beat-Transformer, ISMIR 2022), uses Spleeter stems. pending
25. BEAST (WildHoneyPie/BEAST, ICASSP 2024), online beat and downbeat tracking with a streaming Transformer. pending
26. realtime-bpm-analyzer (npm, dlepaux), tempo in the browser through Web Audio. RUNNABLE (browser / Node). pending
27. essentia.js (WASM build of Essentia for the browser). RUNNABLE (browser / Node). pending

### Key and tuning

28. librosa `estimate_tuning`, `pitch_tuning` (tuning offset in fractions of a bin; no key estimator in librosa). RUNNABLE. pending
29. Essentia `KeyExtractor` / `Key` (profile types incl. `edma`, `bgate`, `temperley`), `TuningFrequency`,
    `TuningFrequencyExtractor`. RUNNABLE. pending
30. madmom key (`CNNKeyRecognitionAudioProcessor`, Korzeniowski and Widmer 2018). RUNNABLE. pending
31. libKeyFinder (mixxxdj/libkeyfinder) and keyfinder-cli (EvanPurkhiser/keyfinder-cli). RUNNABLE (C++ build or distro package). pending
32. S-KEY (deezer/skey, ICASSP 2025), self-supervised major/minor key model. RUNNABLE (PyTorch). pending
33. music21 key analysis on symbolic notes (`Stream.analyze('key')`, Krumhansl-Schmuckler and variants). RUNNABLE. pending
34. Guitar open-string tuning classification from audio (Hulme et al., DLfM 2024, edhulme/guitar-tuning-classification);
    University of Rochester ECE 477 student reports (2019, 2023). pending
35. Capo position from audio: pending (no dedicated paper or code found in the first search)

### Hosted services and products in this category (terms in the hosted-apis lane where it covers them)

36. Music.AI (Moises) modules for chords, beats, key (hosted-apis lane covers the API terms). NEEDS-ACCOUNT. pending
37. Klangio API chord recognition (hosted-apis lane). NEEDS-ACCOUNT. pending
38. Spotify Web API `audio-features` / `audio-analysis` (key, mode, tempo, time signature, beats, bars):
    restricted for new apps from 2024-11-27. NEEDS-ACCOUNT. pending
39. GetSongBPM API (tempo and key looked up by song name, not computed from audio). NEEDS-ACCOUNT. pending
40. Cyanite (GraphQL API with key and BPM among its tags). NEEDS-ACCOUNT. pending
41. Replicate-hosted All-In-One and chord models (hosted-apis lane). NEEDS-ACCOUNT. pending
42. Chordify, Chord ai, Tunebat (consumer apps; no public developer API found in the first search; apps-survey lane). pending
