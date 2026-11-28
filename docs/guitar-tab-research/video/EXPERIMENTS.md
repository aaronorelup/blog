# Experiment matrix for the guitar-tab video

Stage-1 scout `tools-scout`, 2026-11-24. Turns the research behind AO-082 (`src/content/posts/guitar-tab-tools.md`,
this folder's parent) into the experiments the video runs on three songs (capo / unusual tuning / neither). Every
technique, with its command, input, output, score and what the viewer sees and hears, is one entry of
[experiments.json](experiments.json) (74 entries; the variables in its commands are defined under Conventions below).
Numbers quoted as "before" are the research's own runs: `rNNNN` = run ledger, `eNNNN` = scoring ledger (both gzipped in
`../ledger/`), `Tnn` = test in `../FOR_AARON.md`.

Priority: **A** = run on all three songs and show in the film; **B** = run on the 30 s segment (or one song) and show in a
montage or table; **C** = name in the film, run only if time allows.

## The matrix at a glance

| Step | Techniques | box | runpod | api | not possible | A (film) |
|---|---|---|---|---|---|---|
| 1 Separation (and is it useful on solo guitar?) | 8 | 6 | 1 | 1 | 0 | sep-00, 01, 03, 04, 06 |
| 2 Sound to notes | 9 | 5 | 2 | 2 | 0 | n-01, 02, 03, 05 |
| 3 Melody, bass, taps | 6 | 5 | 1 | 0 | 0 | v-01 |
| 4 Chords, beat, bars, tempo, key | 8 | 6 | 1 | 1 | 0 | c-01, 02, 03, 04 |
| 5 Tuning and capo | 8 | 4 | 1 | 3 | 0 | t-01, 02, 03, 05, 07 |
| 6 String and fret | 10 | 8 | 1 | 0 | 1 | f-01, 02, 03, 06, 07 |
| 7 Hands, fretboard, capo from video | 9 | 6 | 1 | 2 | 0 | w-01, 02, 04, 05 |
| 8 Sound and video together | 3 | 3 | 0 | 0 | 0 | y-01, 02, 03 |
| 9 Tab file, drawing, playback | 5 | 5 | 0 | 0 | 0 | o-01, 02, 03, 04 |
| 10 Hosted services, whole job in one call | 8 | 0 | 0 | 4 | 4 | (all B/C) |
| **All** | **74** | **48** | **8** | **13** | **5** | 35 A, 20 B, 19 C |

"api" includes public Hugging Face Spaces, web apps driven by headless Chromium, paid APIs and Opus 5.5 looking at
frames. The 8 runpod entries are the GPU route; sep-04 also runs on the box on a 30 s segment.

## Conventions

```bash
G=/home/user/gtv; R=/home/user/blog/docs/guitar-tab-research; L=$R/lanes
export UV_CACHE_DIR=/home/user/gtr/cache/uv UV_LINK_MODE=hardlink UV_TORCH_BACKEND=cpu \
       HF_HOME=/home/user/gtr/cache/hf TORCH_HOME=/home/user/gtr/cache/torch   # reuse the research's caches (see Disk)
S=<song id>                                   # e.g. capo1, tuning1, plain1
V=$G/songs/$S/$S.mp4                          # the video as downloaded
A=$G/songs/$S/$S.wav                          # ffmpeg -i $V -vn -ac 2 -ar 44100 -c:a pcm_s16le $A
M=$G/songs/$S/$S.mono.wav                     # ffmpeg -i $A -ac 1 $M
SEG=$G/songs/$S/$S.seg30.wav                  # ffmpeg -ss <t0> -t 30 -i $A -c:a pcm_s16le $SEG   (one t0 per song, the most guitar-dense 30 s)
SEGM=$G/songs/$S/$S.seg30.mono.wav; SEGV=$G/songs/$S/$S.seg30.mp4   # same t0
O=$G/experiments/$S/<experiment id>           # one folder per experiment and song
TR=$G/truth/$S/$S.truth.json                  # TR30 = the same cropped to the segment (crop_truth.py, Scoring)
T=$G/tools/venv-torch/bin; BP=$G/tools/venv-bp/bin; MM=$G/tools/venv-madmom/bin; CX=$G/tools/venv-chordext/bin
VID=$G/tools/venv-video/bin; UL=$G/tools/venv-ultra/bin; API=$G/tools/venv-api/bin
EVAL=/home/user/gtr/bin/gtr-eval              # gtr-eval 0.12.1; its venv survives and it ran here today (check-truth S5capo2: 975 checks, 0 mismatches)
```

The research's inputs were 16-bit 44.1 kHz stereo WAV plus a mono copy; the commands assume the same. Run timed jobs as
the research did, through `$R/scripts/gtr-run` (2-core slots), so minutes stay comparable. `minutes_per_song` in the
JSON is for a 4-minute song on 2 cores of this box, scaled from the measured rates; for runpod and api entries it is an
estimate unless the evidence field gives a measurement.

## Installs (box)

All of these were dry-run on 2026-11-24 against the surviving cache (`uv pip install --dry-run`): every set resolves,
and almost every package is already in `/home/user/gtr/cache/uv`, so with hard links a venv costs little new disk.

```bash
# venv-torch: Demucs, Beat This!, lv-chordia, Transkun, piano-transcription-inference (guitar models), amt-tools (TabCNN),
# tuttut, tabsynth, tayuya, PyGuitarPro, partitura, music21, librosa 0.11. Merges the research's venv-demucs, venv-piano,
# venv-amt, venv-beatthis, venv-lvchordia, venv-sym, venv-core (same torch 2.15.0+cpu in all). Dry run: 167 packages,
# 13 to download (sox 1.5.0 among them). Not yet imported together: if an import fails, split back to the research's venvs.
uv venv --python 3.11 $G/tools/venv-torch && uv pip install --python $G/tools/venv-torch/bin/python \
  torch==2.15.0 torchaudio==2.11.1 demucs==4.1.0 numpy soundfile beat-this==1.1.0 piano-transcription-inference==0.0.6 \
  torchlibrosa amt-tools==0.3.2 resampy onnxruntime==1.31.1 transkun==2.0.1 "setuptools<81" lv-chordia==1.1.0 \
  librosa==0.11.0 mir_eval pretty_midi pyguitarpro==0.11 tuttut==0.0.7 tabsynth==1.0.6 tayuya==0.0.4 mido \
  partitura==1.9.0 music21==10.5.2 matplotlib
# venv-bp: Basic Pitch (a2n trials, "Install that worked (Python 3.10)"). Dry run: 51 packages, 1 download.
uv venv --python 3.10 $G/tools/venv-bp && uv pip install --python $G/tools/venv-bp/bin/python \
  "basic-pitch[onnx]==0.4.0" matplotlib "setuptools<81" "numpy<2"
# venv-madmom: madmom 0.16.1 only builds on Python 3.9 (cbk trials, route 3). Dry run: 0 downloads.
uv venv --python 3.9 $G/tools/venv-madmom && uv pip install --python $G/tools/venv-madmom/bin/python \
  "numpy==1.23.5" "scipy<1.11" mido "cython<3" "setuptools<81" wheel soundfile \
  && uv pip install --python $G/tools/venv-madmom/bin/python --no-build-isolation madmom==0.16.1
# venv-chordext: Chordino / NNLS Chroma / NNLS Tuning through chord-extractor (builds vamp 1.1.0). Dry run: 0 downloads.
uv venv --python 3.11 $G/tools/venv-chordext && uv pip install --python $G/tools/venv-chordext/bin/python numpy "setuptools<81" wheel \
  && uv pip install --python $G/tools/venv-chordext/bin/python --no-build-isolation chord-extractor==0.1.3
# venv-video: MediaPipe 1.2.2 + OpenCV 5 + rtmlib. Pin opencv to the cached 5.0.0.93 (unpinned it pulls 5.1.0.95).
# libgles2 and libegl1 (needed by MediaPipe, vhf trials) are installed already.
uv venv --python 3.11 $G/tools/venv-video && uv pip install --python $G/tools/venv-video/bin/python \
  mediapipe==1.2.2 opencv-contrib-python==5.0.0.93 rtmlib==0.0.16 onnxruntime==1.31.1
# venv-ultra: Ultralytics (SAM 2.1, YOLOE) + transformers (OWLv2). Dry run: 62 packages, 15 downloads; OWLv2 weights ~0.6 GB more.
uv venv --python 3.11 $G/tools/venv-ultra && uv pip install --python $G/tools/venv-ultra/bin/python \
  ultralytics==8.4.209 transformers==5.22.2 torch==2.15.0 torchvision
# venv-api: the hosted-apis lane's scripts (requests; getkey from ~/.claude/bin) and gradio_client for Spaces.
uv venv --python 3.11 $G/tools/venv-api && uv pip install --python $G/tools/venv-api/bin/python requests gradio_client==2.7.2
# node: alphaTab, scorify, tutts (npm cache ~/.npm holds them; or reuse the old node_modules, see below)
mkdir -p $G/tools/node && (cd $G/tools/node && npm install --no-audit --no-fund @coderline/alphatab@1.9.0 scorify@0.4.0 tutts@0.1.0)
# weights (small): guitar models, guitar fine-tune of htdemucs_6s, TabCNN
mkdir -p $G/tools/models && cd $G/tools/models
curl -L -C - -O https://huggingface.co/xavriley/midi-transcription-models/resolve/main/guitar-gaps.pth      # ~99 MB
curl -L -C - -O https://huggingface.co/xavriley/midi-transcription-models/resolve/main/guitar-fl.pth        # ~99 MB
curl -L -C - -O https://huggingface.co/adityalakhani/htdemucs-6s-guitar-ft/resolve/main/guitar_htdemucs_6s.pt  # 329,654,071 bytes
# TabCNN: Zenodo record 11406378 (3,345,122 bytes, md5 ce168b2cd426f81a2a78499214e40605): file link from https://zenodo.org/api/records/11406378
```

Already on the box: ffmpeg 6.1.1, FluidSynth 2.3.4 + FluidR3_GM, LilyPond 2.24.3, MuseScore 3.2.3 (`mscore3`), TuxGuitar
1.5.6, SoX, aubio, Playwright Chromium, Python 3.9/3.10/3.11 (uv) and 3.12/3.13. Reusable files of the research still
on disk: Demucs htdemucs and htdemucs_6s weights (`/home/user/gtr/cache/hf`), Beat This! final0/small0 and rtmlib ONNX
models (`/home/user/gtr/cache/torch`), `hand_landmarker.task` (`/home/user/gtr/lanes/video-hands-fretboard/dl/mediapipe/`),
becruily guitar checkpoint and config (`/home/user/gtr/lanes/source-separation/models/msst/`), alphaTab 1.9.0 and the
other renderers' `node_modules` (`/home/user/gtr/lanes/web-tab-render/web/`, 215 MB, which `serve_chains.cjs` serves),
`node-scorify` and `node-tutts` (`/home/user/gtr/lanes/guitar-tab/`).

**Scripts that need a small change for new songs** (they were written for the research's clip ids): the video lane's
`run_mediapipe_hands.py`, `run_rtmlib.py`, `make_overlay_video.py`, `run_opencv_lines.py` (frame counts, fps, readers in
`vhf_common.py`, `SAMPLE_FRAMES`), `chainD_join.py` (25 fps written in), `voice_split.py` (loads truth by clip id),
`lowest_pitch_basicpitch.py` and `gap2_ipt_classify.py` (research paths), `gap2_run_scorify.py` (its node folder).
`chains/scripts/video_lane_copy/` shows the pattern the chains lane used. Read frames straight from the MP4: never dump
every frame of a 4-minute 1080p video to disk (about 6,000 JPEGs, over 1 GB).

## Step 1. Separation, and whether it helps on solo guitar

| id | tool | on | min/song | measured before | viewer sees / hears |
|---|---|---|---|---|---|
| sep-00 | no separation (control) | box | 0 | S6taps: notes from the mix 90/90, from the HPSS harmonic part 83/90 (e0512, e1448) | the same piano roll with and without a separator / the mix |
| sep-01 | Demucs 4.1.0 htdemucs_6s | box | 3.0 | S4: 0.358 of the guitar in `guitar`, 0.232 in `piano` (r0021); solo S2s: guitar went to `piano` (-19.06 vs -42.15 dBFS, r0099) | stem meters, the guitar landing in `piano` / guitar.wav and piano.wav solo |
| sep-02 | Demucs htdemucs (4 stems) | box | 4.5 | S4 `other` held 0.883 of the guitar (r0019) | stem meters / other.wav |
| sep-03 | htdemucs_6s guitar fine-tune (adityalakhani) | box | 2.7 | S4 guitar 6.10 dB SI-SDR vs 1.73 stock; S6taps 0.5465 in `guitar` vs 0.0635 | guitar stem vs sep-01 / A/B |
| sep-04 | BS-RoFormer-SW, audio-separator 0.48.0 | runpod (box: 30 s) | 2 (GPU est.) | S4 10 s: guitar 13.60 dB, 0.939 of the guitar (e1420); CPU 110 s per 10 s (r0489) | the cleanest stem / A/B |
| sep-05 | becruily Mel-Band RoFormer guitar (msst 0.1.0) | box, 30 s | 4 per 30 s | synthesized S4: -2.65 dB (e1425); never tried on a real recording | Guitar.wav |
| sep-06 | ElevenLabs six_stems_v1 | api | 1.5 | S4 guitar stem -> YourMT3: 334/369 notes (e0522), the best S4 chain | stem meters / its guitar stem |
| sep-07 | librosa HPSS | box | 3.3 | S6taps: taps 0.900 in `percussive` (e0811) | harmonic vs percussive spectrogram / percussive.wav |

```bash
$T/demucs -n htdemucs_6s -d cpu -o $O $A                                    # sep-01: r0021, r0477 (whole song 163.0 s, 2 cores), r0660 (109.6 s, 4 cores)
$T/demucs -n htdemucs -d cpu -o $O $A                                       # sep-02: r0019, r0472 (255.6 s)
$T/python -I $L/source-separation/scripts/gap2_guitar_ft.py --input $A --outdir $O --checkpoint $G/tools/models/guitar_htdemucs_6s.pt   # sep-03: r0636 (S4 25.98 s)
audio-separator -m BS-Roformer-SW.ckpt --output_dir $O --output_format FLAC $A   # sep-04: r0489 (box form, WAV, 10 s); pod: pip install "audio-separator[gpu]==0.48.0"
$G/tools/venv-msst/bin/msst-inference --model_type mel_band_roformer --config_path /home/user/gtr/lanes/source-separation/models/msst/config_guitar_becruily.yaml \
  --start_check_point /home/user/gtr/lanes/source-separation/models/msst/becruily_guitar.ckpt --input_folder <dir with $SEG> --store_dir $O --force_cpu --disable_detailed_pbar   # sep-05: r0491
$API/python -I $L/hosted-apis/scripts/elevenlabs_call.py stems $A $O --variation six_stems_v1 --format mp3_44100_192 --samples $O/record   # sep-06: r0064
$T/python -I $L/source-separation/scripts/hpss_run.py $A $O                 # sep-07: r0262
```

Scored downstream: Basic Pitch (n-01) on each guitar stem vs on the mix, `gtr-eval notes` against the same truth. On a
solo-guitar song also transcribe htdemucs_6s's `piano.wav`. Real recordings have no true stems, so `gtr-eval stems`
applies only if a song comes with a multitrack. Keep stems as 16-bit FLAC and only guitar, piano and other.

## Step 2. Sound to notes

| id | tool | on | min/song | measured before (onset F1, 50 ms, 50 cents) | viewer sees / hears |
|---|---|---|---|---|---|
| n-01 | Basic Pitch 0.4.0 | box | 1.0 | R1a 0.712, R1b 0.781, R1c 0.789 (e0486, e0488, e0489) | piano roll over the truth (hits green, misses red, extras grey) / the notes played on a guitar sound, then the original |
| n-02 | guitar-gaps.pth (Riley et al.) | box | 4.2 | R1b 0.878, R1c 0.871 (e1437, e1438); training may include GuitarSet (UNVERIFIED) | as n-01 |
| n-03 | guitar-fl.pth (Riley et al.) | box | 4.1 | R1c 0.890 (e1274) | as n-01 |
| n-04 | Transkun 2.0.1 (piano model) | box (segment) | 19 | R1a 0.693, R1b 0.803, R1c 0.831 | as n-01 |
| n-05 | YourMT3+ CPU Space | api | 5.5 | R1c 0.859 (e0690); S2n 79/90 (126 notes) | as n-01 |
| n-06 | YourMT3+ on a GPU | runpod | 2 (est.) | not run (ZeroGPU quota, T23) | as n-01 |
| n-07 | MT3 (Magenta) | runpod | 3 (est.) | not run (install refused, T24) | as n-01 |
| n-08 | MiMo v2.6 Flash asked for notes | api | 3 | S2n 1 of 90, F1 0.017 (e0067) | the cautionary roll |
| n-09 | SwiftF0 -> notes (single lines only) | box | 0.3 | R1b lead 0.769 (e0151) | pitch curve |

```bash
$BP/basic-pitch $O $A --save-midi --save-note-events --model-serialization tflite   # n-01 (CLI form of run_basic_pitch_cli.sh; research runs r0234, r0264)
#   dropped tuning: add --minimum-frequency 73.4 --maximum-frequency 1319 (r0349; a standard range cut the D2 notes, e0544)
$T/python -I $L/guitar-tab/scripts/run_hfmt_guitar.py $G/tools/models/guitar-gaps.pth $M $O/$S.guitar-gaps   # n-02: r0499, r0505
$T/python -I $L/guitar-tab/scripts/run_hfmt_guitar.py $G/tools/models/guitar-fl.pth $M $O/$S.guitar-fl       # n-03: r0494 (R1c 28.97 s)
$T/transkun $SEG $O/$S.transkun.mid --device cpu                                                              # n-04: as run_piano.py (r0216)
$API/python -I $L/hosted-apis/scripts/hf_space_call.py mimbres/YourMT3-cpu /process_audio $O/<piece> '["file:<30 s piece>"]'   # n-05: r0245, then cut the base64 MIDI out of the HTML and join the pieces
$API/python -I $L/hosted-apis/scripts/gateway_trial.py --model xiaomi/mimo-v2.6-flash --media $SEGM --mime audio/wav \
  --prompt $L/hosted-apis/scripts/prompts/notes_prompt.txt --schema $L/hosted-apis/scripts/prompts/notes_schema.json --out $O   # n-08: r0076
```

## Step 3. Melody, bass and taps from one guitar (for the fingerstyle song)

| id | tool | on | min/song | measured before | viewer sees / hears |
|---|---|---|---|---|---|
| v-01 | voice split by pitch threshold B1 (MIDI >= 55 = melody) and lowest note B2 | box | 0.1 | S6taps B1 83/83, S2s 86/86 right; B2 80, 83 (r0513) | two-colour roll / bass alone, melody alone |
| v-02 | partitura estimate_voices 1.9.0 | box | 0.1 | 41/83 right, 8 voices returned (r0513) | a score tool's 8 "voices" |
| v-03 | taps: onsets of the HPSS percussive part | box | 0.2 | 53 onsets, all 32 taps among them, precision 0.604 (e0815); timing alone separated only 5 tap-only events (r0540) | ticks on the waveform / a click per tap |
| v-04 | taps: onsets of Demucs's drums stem | box | 0.2 | 32 onsets, one on each of the 32 taps (e0928) | as v-03 |
| v-05 | EG-IPT playing-technique classifier (ipt~) | box | 0.5 | no truth (r0643) | technique labels on the timeline |
| v-06 | ADTOF-pytorch | runpod | 1 (est.) | not run (T84) | tap hits by class |

```bash
$T/python -I $L/fingerstyle-voices-taps/scripts/voice_split.py $S <n-01 notes csv> $O        # v-01, v-02: r0513 (loads truth by clip id: see Installs)
$T/python -I $L/source-separation/scripts/onsets_of_stem.py <sep-07 percussive.wav | sep-01 drums.wav> $O/taps.txt   # v-03, v-04
```

Scored: `gtr-eval notes --voice melody` / `--voice bass` (recall by voice) and `gtr-eval onsets --field taps` (needs taps
in the truth). If no chosen song has body taps, v-03 to v-06 are shown on S6taps from the research instead.

## Step 4. Chords, beat, bars, tempo, key

| id | tool | on | min/song | measured before | viewer sees / hears |
|---|---|---|---|---|---|
| c-01 | Beat This! 1.1.0 (final0) | box | 1.4 | S4 65/68 beats, downbeats 17/17 (e1494) | beat ticks, bar lines vs truth / a click track over the song |
| c-02 | madmom 0.16.1 (downbeats, CNN chords, key) | box | 3.6 | S4 beats 65/68, downbeats 17/17 (e1492); chords right 37.16 of 38.74 s (e1495) | chord timeline vs truth / clicks |
| c-03 | Chordino + NNLS Tuning (chord-extractor 0.1.3) | box | 1.1 | S4 34.34 of 38.74 s (e1496); S7flat30 tuning -32.3 c vs -30 (e0580) | chord timeline |
| c-04 | lv-chordia 1.1.0 | box | 1.6 | capo clip S5capo2 majmin 0.946 (e1770), best on that clip | chord timeline with sevenths |
| c-05 | All-In-One 1.1.0 (beats, sections) | box (slow) | 16 | 9 clips in 1854.6 s (r0563) | song sections as blocks |
| c-06 | MiMo v2.6 Flash chords, tempo, key | api | 1.5 | S4 majmin 0.589, key exact (r0052); S3 0.193 then 0.781 on an identical request (r0028, r0302) | its timeline next to c-02 |
| c-07 | Essentia KeyExtractor / TonalExtractor | box | 0.3 | S7flat30 roots fixed with tuningFrequency 432.45 (r0324) | key readout |
| c-08 | BTC (ISMIR 2019) | runpod | 1 | not run (clone refused, T59) | chord timeline |

```bash
$T/python -I $L/chords-beats-key/scripts/beatthis_run.py --audio $A --outdir $O     # c-01: r0397
$MM/python -I $L/chords-beats-key/scripts/madmom_run.py --audio $A --outdir $O      # c-02: r0072 (S4, all stages 35.1 s)
$CX/python -I $L/chords-beats-key/scripts/chordino_run.py --audio $A --outdir $O    # c-03: r0215
$T/python -I $L/chords-beats-key/scripts/lvchordia_run.py --audio $A --outdir $O    # c-04: r0398
$API/python -I $L/hosted-apis/scripts/gateway_trial.py --model xiaomi/mimo-v2.6-flash --media $SEGM --mime audio/wav \
  --prompt $L/hosted-apis/scripts/prompts/chords_prompt.txt --schema $L/hosted-apis/scripts/prompts/chords_schema.json --out $O   # c-06: r0052
```

Tempo for the tab: the chains glue's "span" rule, round(60 x (n - 1) / (last - first beat)), gave 116 BPM = truth on S4;
the "median" rule gave 115 and moved the 16th grid up to 0.295 s by the end (r0520). Use span or per-bar tempo.

## Step 5. Tuning and capo

No tool the research ran outputs a capo or an open-string tuning from audio. The film shows that gap and what does
work around it.

| id | tool | on | min/song | measured before | viewer sees / hears |
|---|---|---|---|---|---|
| t-01 | tuning offset, librosa.estimate_tuning | box | 0.2 | S7flat30 -31 c vs -30 (e0266) | tuner needle vs truth / open strings at that offset |
| t-02 | lowest recurring notes -> lowered 6th string | box (glue) | 0.1 | S5dropd: the 4 D2 notes found, plus one spurious C1 at 0 s | histogram of lowest notes / the D2 notes |
| t-03 | MiMo v2.6 Flash "capo? tuning?" from audio, asked 3 times | api | 1.5 | capo 2 right in 2 of 3 identical requests (r0080, r0196, r0203); Drop D answered "Standard" (r0210) | its three answers side by side |
| t-04 | MiMo on frames (1 fps) | api | 2.5 | "no capo" right on R3a/b/c; tuning always "cannot_tell" (r0107, r0360, r0391) | frames with its answer |
| t-05 | OWLv2 text query "capo" | box | 4 | capo still: top 0.2539, capo-less frames up to 0.3682 (r0639); YOLOE, YOLO-World, Grounding DINO: 0 boxes (r0628, r0650, r0648) | capo boxes, true and false |
| t-06 | SAM 3 "capo" / "fretboard" | runpod | 3 (est.) | not run: gated, needs a Hugging Face token (T33) | masks on neck and capo |
| t-07 | Opus 5.5 looking at frames | api | 2 | not run in the research | the frames with Claude's answer |
| t-08 | capo = sounding chord root - fingered shape root (glue) | box | 0.2 | documented only: every chord tool named S5capo2's G/C shapes by their sound, A/D | "sounds A, shape G => capo 2" |

```bash
$T/python -I $L/chords-beats-key/scripts/librosa_run.py --audio $A --outdir $O     # t-01 (estimate_tuning)
$API/python -I $L/hosted-apis/scripts/gateway_trial.py --model xiaomi/mimo-v2.6-flash --media $SEGM --mime audio/wav \
  --prompt $L/hosted-apis/scripts/prompts/capo_prompt.txt --schema $L/hosted-apis/scripts/prompts/capo_schema.json --out $O/try1   # t-03: r0080 (x3; tuning_prompt.txt: r0210)
ffmpeg -i $SEGV -vf fps=1 -q:v 3 $O/frames/f_%02d.jpg && $API/python -I $L/hosted-apis/scripts/gateway_frames_trial.py xiaomi/mimo-v2.6-flash $O/frames \
  $L/hosted-apis/scripts/prompts/video_prompt.txt $L/hosted-apis/scripts/prompts/video_schema.json $O              # t-04: r0360
$UL/python -I $L/video-hands-fretboard/scripts/gap-round-2/run_openvocab_images.py owlv2 $O <weights dir> NAME=<frame.png> ...   # t-05: r0639
ffmpeg -i $V -vf "fps=1/10,scale=640:-1,tile=4x3" $O/sheet.jpg                    # t-07: contact sheet for Opus, plus neck/headstock crops
```

Scored: `gtr-eval tuning --truth $TR --est-cents <c> --est-capo <k> --est-tuning-midi <6 numbers>`.

## Step 6. String and fret

Each assigner is scored twice: on the truth notes (the assigner alone) and on n-01/n-02 notes (the real chain).

| id | tool | on | min/song | measured before (same string and fret / matched) | viewer sees / hears |
|---|---|---|---|---|---|
| f-01 | tuttut 0.0.7 | box | 0.1 | R1c truth 0.811 (e0052), Basic Pitch notes 0.795 (e0727); capo told 0 -> 90/90 (e0732); Drop D 0.837 -> 0.956 (e0733) | tab vs truth tab, errors red; fret-vs-time plot |
| f-02 | scorify 0.4.0 (capoFret, per-string tuning) | box | 0.2 | truth notes: S5capo2 0.9889 (e1816), S5dropd 0.9111 (e1818), R1c 0.858 (e1814) | as f-01 |
| f-03 | LilyPond 2.24.3 TabStaff | box | 0.7 | R1c truth 0.872 (e0184), Basic Pitch notes 0.790 (e0729); frets up to 33 unless limited | engraved tab |
| f-04 | tabsynth 1.0.6 | box | 0.1 | R1b truth 0.786 (e0386) | as f-01 |
| f-05 | tayuya 0.0.4 | box | 0.1 | R1c truth 0.176 (e0139) | as f-01 |
| f-06 | TabCNN, GuitarProFX weights (audio straight to string and fret) | box | 1.1 | R1b 65/70 matched, 0.985 right (e1733); R1c 1.0 of 119 (e1736); R1a only 56/189 matched (e1730); GuitarSet in its training; standard tuning only | fretboard lighting up per frame |
| f-07 | Guitab 1.2.0, browser version (audio -> GP5, capo stepper) | box (headless Chromium) | 5 (est.) | not run (T27) | its GP5 drawn |
| f-08 | Guitab, Python on a GPU | runpod | 1 | README: 4-min song "well under a minute and 1-2 GB of GPU memory" | as f-07 |
| f-09 | gtrsnipe 0.8.3 | not possible | - | install from repo refused; not on PyPI (T83) | - |
| f-10 | SynthTab TabCNNx4 (no GuitarSet) | box | 2 | R1c notes F1 0.5 (e0922), 0.744 right (e0883) | as f-06 |

```bash
$T/python -I $L/guitar-tab/scripts/run_tuttut.py <notes.mid> $O --name $S --tuning 40,45,50,55,59,64 --capo <k> --nfrets 20   # f-01: r0240 (capo = raised open strings)
$T/python -I $L/guitar-tab/scripts/gap2_run_scorify.py <notes.mid> $O --name $S --capo <k> --tuning <6 MIDI>                  # f-02: r0621
$T/python -I $L/guitar-tab/scripts/run_lilypond_tab.py <notes.mid> $O --name $S --tuning <...> --capo-as-tuning <k> --png       # f-03: r0240, r0528 (--pin G:P:S)
$T/python -I $L/guitar-tab/scripts/run_tabsynth.py <notes.mid> $O --name $S --mode notes --max-fret 15                         # f-04: r0186
$T/python -I $L/guitar-tab/scripts/gap2_run_tabcnn.py --backend amt --model $G/tools/models/tabcnn-zenodo/<file> $M $O/$S      # f-06: r0592 (ONNX form: r0591)
```

Notes into the assigners: one-track MIDI (`$L/guitar-tab/scripts/merge_midi.py`). Basic Pitch writes a fixed 120 BPM
and velocity-0 note-ons; only the seconds survive (chains A).

## Step 7. Hands, fretboard and capo from the video

| id | tool | on | min/song | measured before | viewer sees / hears |
|---|---|---|---|---|---|
| w-01 | MediaPipe Hand Landmarker 1.2.2 | box | 5 | R3b fretting hand in 445/450 frames; wide shot R3a: a second "hand" on the sheet music in 215/221 frames | (with w-02) |
| w-02 | overlay video of the landmarks | box | 3 | - | the skeleton tracking the player |
| w-03 | RTMPose hand (rtmlib 0.0.16) | box (segment) | 17 | 75-80 s per 18 s clip (r0408) | second skeleton next to MediaPipe |
| w-04 | fret grid: hand-set neck quad, OpenCV LSD lines, 12-TET fit | box | 2 | R3b frets 8-19, RMS 3.52 px; numbering may be 1 fret off (chain D) | straightened neck with fret numbers |
| w-05 | fingertip -> (string, fret) cell | box | 0.5 | R3c f225: s2 f2, s3 f3, s3 f3, s1 f4 (r0532) | "s4 f3" dots on the neck |
| w-06 | SAM 2.1 tiny neck mask -> quad | box | 3 | one frame (r0400), ~100 s per image | neck mask |
| w-07 | CoTracker3 tracking the neck through a shot | runpod | 5 (est.) | 90 frames in 136.5 s on the box (r0448): ~3 h per song | points riding on the neck |
| w-08 | WiLoR 3D hand mesh (HF Space) | api | 2 | not run (T32); a pod needs a MANO account | 3D hand on a still |
| w-09 | Roboflow guitar-neck / fret models | api | - | not run: account and key not in the store (T36) | - |

```bash
$VID/python -I $L/video-hands-fretboard/scripts/run_mediapipe_hands.py $S full /home/user/gtr/lanes/video-hands-fretboard/dl/mediapipe/hand_landmarker.task $O   # w-01: r0408
$VID/python -I $L/video-hands-fretboard/scripts/make_overlay_video.py $S <w-01 jsonl> 'MediaPipe hands' $O/$S.hands.mp4                                          # w-02
$VID/python -I $L/video-hands-fretboard/scripts/run_rtmlib.py $S full hand $O                                                                                     # w-03: r0408
$VID/python -I $L/video-hands-fretboard/scripts/run_opencv_lines.py $O --clip $S --frames <f1,f2,f3> --quad x1,y1,x2,y2,x3,y3,x4,y4 --size 1200,130                # w-04: r0214, r0532
$VID/python -I $L/video-hands-fretboard/scripts/handoff_fingertip_to_cell.py <w-01 jsonl> <w-04 json> $O $S <frame>                                               # w-05: r0402, r0532
```

One neck quad per camera shot (set by hand, or by an agent looking at a frame). The research held one quad for a whole
fixed-camera clip; a performance video with a moving guitar needs per-shot quads or w-07. The fretting hand is
MediaPipe's "Left" for a right-handed player in an unmirrored video; a mirrored video swaps the labels.

## Step 8. Sound and video together

| id | tool | on | min/song | measured before | viewer sees / hears |
|---|---|---|---|---|---|
| y-01 | audio-video clock check (ffprobe start times, cross-correlation) | box | 0.2 | R3c lag 0 (r0609); picture-to-sound sync never checked | one line: "lag 0 ms" |
| y-02 | onsets x fingertip cells (chain D join) | box | 0.1 | R3b: 129/129 onsets had a cell; pitch = a fingertip cell's 28 times (36 with frets -1), open string 65 (r0533, r0546) | each note flashing on the neck at its onset |
| y-03 | video-constrained string and fret (new glue: video cells become LilyPond pins / scorify soft pins) | box | 0.5 | never run: no tool takes video positions (HANDOFFS section 4) | audio-only tab vs audio+video tab, differences highlighted |

```bash
$VID/python -I $L/chains/scripts/chainD_join.py $S <w-01 jsonl> <n-01 notes csv> <w-05 handoff json> $O/$S.join.json   # y-02: r0533
```

y-03 is the experiment that answers "does the video help": same notes, same assigner, with and without the pins,
`gtr-eval tab` before and after.

## Step 9. Tab file, drawing, playback

| id | tool | on | min/song | measured before | viewer sees / hears |
|---|---|---|---|---|---|
| o-01 | PyGuitarPro 0.11 + `tab_beats_to_gp5.py` (bars, tempo, chords) | box | 0.1 | S4 read-back 223/369 notes, 210 right with the span tempo (e1497); 57 with the median tempo (e1486) | - |
| o-02 | alphaTab 1.9.0 render, lazy loading off | box | 0.5 | 18 of 18 bars drawn (r0523; 8 with lazy loading on, r0522) | the finished tab, bar by bar |
| o-03 | alphaTab player / exportAudio + metronome | box | 5 | clicks 10.1-11.5 ms before truth beats = the GP5 time-0 offset (r0535) | a cursor moving through the tab / the tab played, with clicks |
| o-04 | FluidSynth 2.3.4 + FluidR3_GM, program 24/25 | box | 0.2 | the research's synthesized clips | every transcription and tab, heard |
| o-05 | MuseScore 3.2.3 CLI | box | 0.2 | its MusicXML has no TAB staff (e0141) | a second engraving |

```bash
$T/python -I $L/chains/scripts/tab_beats_to_gp5.py <tab.gtreval.json> <beats.txt> $O/$S.gp5 --downbeats <downbeats.txt> --chords <chords.lab> --tempo span --title $S   # o-01: r0520
node $L/chains/scripts/serve_chains.cjs 8791 &   # serves /nm/ (old node_modules), /cpages/, /chains/ (= /home/user/gtr/lanes/chains): add a /gtv/ route or copy the GP5 there
node $L/web-tab-render/scripts/shot.cjs 'http://127.0.0.1:8791/cpages/alphatab_chains.html?lazy=0&file=/chains/<path>.gp5' $O/$S 'window.__rendered === true' 60000 1240   # o-02: r0523
node $L/browser-audio-sync/scripts/drive.mjs '/cpages/chainE.html?gp=<gp5>&beats=<beats>&gp0=<offset>&tag=$S' $O/$S.result.json --port 8791 --timeout 300   # o-03: r0535
fluidsynth -ni -F $O/$S.wav -r 44100 /usr/share/sounds/sf2/FluidR3_GM.sf2 <file.mid>   # o-04
```

GP5 has no field for where its time 0 sits in the audio: carry the offset the glue prints into `gtr-eval --time-shift`
and into any cursor drawn over the video. Chord names written without fingerings draw as empty diagrams (chains A).

## Step 10. Hosted services that do the whole job in one call

| id | service | on | needs | status |
|---|---|---|---|---|
| f-07 | Guitab browser version (counted in step 6) | box | nothing | not run; audio -> GP5 with capo |
| h-01 | Klangio Guitar2Tabs web app, free tier | api (headless Chromium) | no account; stop at any rights/consent box | not run (T06) |
| h-02 | Fretwise, guest access | api (headless Chromium) | 3 free a month | not run (T18) |
| h-03 | MiMo v2.6 Flash, one prompt for notes, chords, capo, tuning | api | VERCEL_AI_GATEWAY_API_KEY (free tier) | see n-08, c-06, t-03 |
| h-04 | Klangio API | not possible | API key by application, not in the store | T44 |
| h-05 | Songsterr AI | not possible | account by e-mail; full songs paid | T08 |
| h-06 | AnthemScore Web | not possible | rights checkbox the permission system refused to tick | refusal row 33 |
| h-07 | AAPA AutoTabs (tab from a video) | not possible | account sign-up | T11 |
| h-08 | Gemini API (audio and video in one request) | api, blocked | GEMINI_API_KEY is stored but its prepaid balance was 0: HTTP 402 (r0013) | needs a top-up (T55) |

Free tiers cap the audio (15 to 60 s), so the hosted runs use the 30 s segment and `TR30`.

## What cannot run on this box, and why

| technique | why not here | route |
|---|---|---|
| BS-RoFormer-SW / big RoFormers on whole songs (sep-04) | CPU: 110 s per 10 s of audio, about 44 min per song | RunPod (below); 30 s on the box |
| YourMT3+ local (n-06), MT3 (n-07) | running the cloned code and the PyPI `yourmt3` / `mt3-infer` CLIs was refused ([Code from External]); anonymous ZeroGPU quota | CPU Space (n-05); RunPod |
| Guitab Python (f-08), gtrsnipe (f-09), BTC (c-08), ADTOF-pytorch (v-06) | install or run from a clone refused | Guitab browser (f-07); RunPod for Guitab/BTC/ADTOF; gtrsnipe laptop only (T83) |
| SAM 3 (t-06) | gated with manual approval; no Hugging Face token in the key store | RunPod after a token and approval; ZeroGPU Space for short clips |
| WiLoR / HaMeR (w-08) | MANO model needs a registered account (non-commercial licence, "No Distribution") | Space on stills |
| CoTracker3 on a whole song (w-07) | about 3 h per song on CPU | RunPod |
| All-In-One (c-05) | runs, but ~16 min per song and NATTEN built from source | box on one song, or RunPod |
| Roboflow models (w-09), Klangio API (h-04), AudioShake, LALAL.AI, MVSEP, Fadr, Music.AI | account or API key not in the key store | Aaron's tests T36, T44-T52, T57, T58 |
| AnthemScore Web (h-06), Songsterr AI (h-05), AAPA AutoTabs (h-07), Songscription, audio2guitar, GuitarConvert, Note2Tabs, RiffToTab, Cesure | rights boxes the permission system will not tick, or sign-ups | Aaron (T07-T19) |
| Gemini (h-08) | key stored, balance 0 (HTTP 402) | top-up by Aaron (T55) |

The permission system refused 33 "[Code from External]" steps in the research (`../FOR_AARON.md`, section 7). Commands
sent to a pod with `exec-pod` may draw the same refusal: if one does, note it and use the route in the last column.

**Keys** (names from `getkey.py --list`, 2026-11-24). In the store and usable: `ELEVENLABS_API_KEY`, `RUNPOD_API_KEY`,
`VERCEL_AI_GATEWAY_API_KEY` (free tier: only mimo-v2.6-flash, muse-spark-open, seed-2.1-turbo answered), `GEMINI_API_KEY`
(balance 0), `XAI_API_KEY` (no audio input in the research). Not in the store: a Hugging Face token (SAM 3, MuScriptor,
ZeroGPU quota), Klangio, Roboflow, AudioShake, LALAL.AI, MVSEP, Fadr, Music.AI keys, a MANO account.

## RunPod plan (planned only: no pod was created)

**GPU** (live `list-gpu-types` read, 2026-11-24, Secure cloud, pods, CUDA >= 12.8):

| GPU | VRAM | $/hr secure | stock (data centers) |
|---|---|---|---|
| RTX 4090 (pick) | 24 GB | 0.89 | LOW: EU-RO-1, US-IL-1 |
| RTX A6000 (fallback 1) | 48 GB | 0.69 | LOW: EU-SE-1 |
| A40 (fallback 2) | 48 GB | 0.59 | LOW: EU-SE-1 |
| L4 | 24 GB | 0.69 | LOW: EU-RO-1, EUR-IS-2, US-MO-2 |
| L40S | 48 GB | 1.09 | LOW: OC-AU-1 only (not US-MO-1 today) |
| H100 SXM | 80 GB | 4.39 | MEDIUM |

Every job below is inference with a checkpoint under 1 GB (Guitab's README: 1-2 GB of GPU memory), except SAM 3, whose memory need was not read (24 GB expected to suffice: UNVERIFIED). No network volume: Aaron's
`comfyui-h3-vault` is for the H3 stack and writing to it needs his OK; a pod with container disk only leaves nothing
behind when terminated. The MiniMax-H3 EU licence rule does not apply to these models.

**Image**: official template `runpod-torch-v280`, image `runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404` (PyTorch
2.8.0, CUDA 12.8.1, Ubuntu 24.04, JupyterLab on 8888, SSH 22; live `list-public-templates` read). Container disk 60 GB
(pip packages ~15 GB, models ~3 GB, songs and outputs < 2 GB).

**Create** (with `mcp__runpod__create-pod`; read `describe-tool create-pod` first for the live schema; name from the
runpod-render rule `h3-<session tag>-<label>`):
`{"name":"h3-<tag>-gtv-gpu","templateId":"runpod-torch-v280","cloud":"SECURE","gpu":{"id":"NVIDIA GeForce RTX 4090","count":1,"minCudaVersion":"12.8"},"disk":60,"ports":["8888/http","22/tcp"],"env":{"JUPYTER_PASSWORD":"<random, made in a script, never printed>"}}`

**Shell and files**: commands through `mcp__runpod__exec-pod` (argv, at most 25 s per call: start long jobs with
`nohup ... > /workspace/log/<job>.log 2>&1 &` and poll). The pod fetches the songs itself (`pip install yt-dlp`, same
source URLs and format ids as `$G/songs`), or the box PUTs files through the Jupyter contents API on
`https://<pod>-8888.proxy.runpod.net` (token = JUPYTER_PASSWORD, as the runpod/pytorch start script passes it: check on
first boot). Results back: MIDI/JSON as `base64` on exec-pod's stdout (1 MiB cap per call); FLAC stems through Jupyter
`/files/<path>`. Terminate with `delete-pod`, then `get-pod` must 404.

| job | priority | commands on the pod | est. minutes (3 songs) |
|---|---|---|---|
| setup | - | `pip install "audio-separator[gpu]==0.48.0" yt-dlp soundfile`; fetch the 3 songs; ffmpeg to 44.1 kHz WAV | 15 |
| sep-04 BS-RoFormer-SW | A | `audio-separator -m BS-Roformer-SW.ckpt --output_dir out/$S --output_format FLAC in/$S.wav` (699 MB model on first run) | 10 |
| f-08 Guitab | C | `git clone https://github.com/DanieleMorotti/guitab && pip install -r guitab/requirements.txt && pip install -e guitab --no-deps`; `guitab --audio in/$S.wav --out_dir out/$S --capo <k> --device cuda` | 10 |
| n-06 YourMT3+ | C | `git lfs install && git clone https://huggingface.co/spaces/mimbres/YourMT3 && pip install -r YourMT3/requirements.txt`; its transcribe routine per song | 20 |
| w-07 CoTracker3 | B | `git clone https://github.com/facebookresearch/co-tracker && pip install -e co-tracker`; checkpoint `scaled_offline.pth`; track quad corners per shot | 15 |
| c-08 BTC | C | `git clone https://github.com/jayg996/BTC-ISMIR19`; `python btc_run.py --audio in/$S.wav --outdir out/$S --repo BTC-ISMIR19` (copy of `$L/chords-beats-key/scripts/btc_run.py`) | 5 |
| t-06 SAM 3 | B | only if a Hugging Face token with SAM 3 access is added to the key store | 10 |

All minutes are estimates: the research rented no GPU. One session of about 1.5 h on the RTX 4090 is about $1.35; cap
it at $5. `pod_boot.py --max-hours` belongs to the ComfyUI template, so arm a safety stop in the pod right after boot
(`nohup sh -c 'sleep 10800; runpodctl stop pod $RUNPOD_POD_ID' >/dev/null 2>&1 &`; that runpodctl and the variable are
present in this image is UNVERIFIED: check on first boot) and terminate with `delete-pod` as soon as results are pulled.
The A-priority job alone (setup + sep-04) is about 25 min, about $0.40.

## Scoring

All numbers come from `gtr-eval` (`$R/scripts/gtr-eval/README.md`): `$EVAL <subcommand> --truth $TR --est <file>`,
one JSON line per run, logged with an eval id. `--truth` takes a path (or a clip id under `/home/user/gtr/inputs/`).

| step | subcommand and numbers | truth fields used |
|---|---|---|
| 1 separation | `notes` of n-01 on each stem minus on the mix (onset F1); `stems` (SI-SDR) only with true stems | notes; stems |
| 2 notes | `notes`: onset P/R/F1 (50 ms, 50 cents), onset+offset F1, recall by voice, `--chroma` | notes (onset, offset, pitch, voice) |
| 3 voices, taps | `notes --voice melody` and `--voice bass`; `onsets --field taps` (50 ms) | notes.voice; taps |
| 4 beat, chords, tempo, key | `beats` (F at 70 ms, CMLt, AMLt; downbeats with `--downbeat-col 2` or `--downbeats-est`); `tempo` (4 %); `chords` (root, majmin, sevenths share of time); `key` (weighted score) | beats, downbeats, tempo_bpm, chords, key |
| 5 tuning, capo | `tuning --est-cents --est-capo --est-tuning-midi` | tuning_offset_cents, capo, tuning_midi |
| 6 string, fret | `tab`: same string and fret / matched and / truth, string confusion; `tab-frames` for f-06; `--ignore-time` matches by note order if timing is unsure | notes.string, notes.fret, tuning_midi, capo |
| 7, 8 video | new `score_video_cells.py` (below); capo via `tuning --est-capo` | notes + `<S>.video.json` |
| 9 tab file | `tab` on the GP5 read back with `--time-shift <GP5 time 0>`; `beats` on the read-back | as 6 |
| last chapter | `tab`, `notes`, `chords`, `beats`, `tuning` on `answer.json` | all |

**The truth file**, one per song, `$G/truth/$S/$S.truth.json`, exactly the research's schema (`../inputs/INPUTS.md`), with
the song's WAV next to it (`check-truth` checks that the audio exists):

```json
{"id": "<S>", "title": "...", "what": "...", "audio": "<S>.wav", "duration_s": 0.0, "sample_rate": 44100, "channels": 2,
 "tempo_bpm": 0.0, "time_signature": "4/4", "key": "A major",
 "tuning_midi": [40, 45, 50, 55, 59, 64], "capo": 2, "tuning_offset_cents": 0,
 "notes": [{"onset": 2.142857, "offset": 2.668527, "pitch": 57, "velocity": null, "voice": "melody", "string": 3, "fret": 0}],
 "beats": [2.142857], "downbeats": [2.142857],
 "chords": [{"start": 0.0, "end": 2.142857, "label": "N"}, {"start": 2.142857, "end": 4.285714, "label": "A:maj"}],
 "taps": [], "stems": {}, "source": {"kind": "video", "url": "...", "license": "...", "license_quote": "...", "attribution": "..."}}
```

- Times in seconds from the first sample of `<S>.wav`. `pitch` = sounding MIDI number. `tuning_midi` = open strings
  low to high (string 6 to 1) without the capo; `fret` counted from the capo, so pitch = `tuning_midi[6 - string] +
  capo + fret` (check-truth tests every note). `voice` is melody, bass, chord or lead. Chords are Harte labels covering
  0 to `duration_s` (`N` where nothing is played). `key` is "<tonic> major|minor". `downbeats` is a subset of `beats`.
- Side files the research wrote per clip and gtr-eval reads too: `<S>.notes.csv`, `<S>.beats.txt` (time, beat number),
  `<S>.chords.lab`, `<S>.mid`, `<S>.gp5`, `<S>.tab.txt`. `gtr-eval selftest --all-inputs` style check: each must score
  1.0 against the JSON.
- **Timing the tab.** A published tab is in its own tempo; the recording drifts. Align before scoring: render the tab's
  notes (FluidSynth), DTW on chroma between render and recording (`librosa.sequence.dtw`), map every note, beat and chord
  boundary, then snap each onset to a Basic Pitch onset of the same pitch within 60 ms. Check: Basic Pitch against the
  aligned truth should land near its R1 range (onset F1 0.7-0.8); far lower means the alignment failed. Where timing
  stays unsure, score strings and frets with `tab --ignore-time` (note order only).
- **Segment truth.** `crop_truth.py <truth> <t0> <dur> <out>` (new, about 30 lines): keep notes, beats, taps with onset in
  [t0, t0+dur), shift by -t0, clip offsets and chord segments, set `duration_s` and `audio`.
- **Video truth** (new, optional) `<S>.video.json`: `{"fps", "av_offset_s", "mirrored", "capo_fret", "shots": [{"start_s",
  "end_s", "neck_quad_px": [8 numbers in run_opencv_lines.py --quad order], "frets_visible": [lo, hi]}],
  "labelled_frames": [{"t_s", "fingertips": {"index": [string, fret_from_nut] | null, "middle": ..., "ring": ..., "pinky": ...}}]}`,
  two labelled frames per shot (as T116).
- **`score_video_cells.py`** (new, about 60 lines, from `chainD_join.py`): for every truth note with fret > 0, take the
  frame nearest its onset and ask whether a fingertip's cell (w-05) equals (string, fret + capo) counted from the nut,
  exactly and within 1 fret. Output: fretted notes, exact hits, +-1 hits, per shot. Plus fret-numbering error against
  `labelled_frames`.
- **Song choice, from the scoring side**: the guitar models were trained on GuitarSet, GAPS and the Francois Leduc set,
  so recordings from those sets would flatter them. A fingerstyle song with a bass line gives step 3 a truth (`voice`
  from the tab's two voices); a singer-guitarist recording gives step 1 a mix to separate.

## The last chapter: Opus 5.5 recreates each tab, with and without tools

**Blind protocol**
- Inputs: `$G/blind/<blind id>/video.mp4` only (`ffmpeg -i $V -map_metadata -1 -c copy`; blind ids, no titles anywhere).
- Hide the answers for the duration: pack `$G/truth/`, `$G/experiments/` and `$G/songs/` into an archive encrypted with a
  passphrase the orchestrator generates and never writes to disk (`gpg --symmetric --batch --passphrase-fd 0`), delete
  the clear copies, restore after. The blind session gets no web search or fetch; hosted calls only through the kit's
  wrappers. Audit its transcript afterwards for reads of those paths or tab sites; a hit voids that run.
- Same model (Opus 5.5), effort and wall-clock cap per song (e.g. 90 min) in both arms.
- Output in both arms, `$G/blind/<id>/<arm>/answer.json`: `{"tuning_midi", "capo", "tuning_offset_cents", "tempo_bpm",
  "key", "notes": [{"onset", "offset", "pitch", "string", "fret"}], "beats", "downbeats", "chords": [{"start", "end",
  "label"}]}` (gtr-eval reads this object for `tab`, `notes`, `beats` and `chords`), plus `answer.gp5` and a short
  `HOW.md`. Scored as above; both answers rendered (o-04, o-02) and played against the original.
- **Without tools**: Python 3 with numpy, scipy, soundfile; ffmpeg/ffprobe; FluidSynth; PyGuitarPro; the answer
  validator. No MIR or ML packages, no models, no hosted APIs. It may write its own DSP and look at frames it extracts.

**With tools**: one folder `$G/tools/kit/` (wrappers that take a path and write to a given folder, plus `TOOLS.md` with
each tool's input, output, measured accuracy and known failure modes from the research). No new installs: it reuses
the venvs above.

| tool | why it is in |
|---|---|
| ffmpeg/ffprobe + frame and contact-sheet helper | every step starts from the video; Opus reads capo, hand position and shots from frames itself |
| Demucs 4.1.0 (htdemucs 4-stem `other`; htdemucs_6s guitar fine-tune) | only for a voice or band mix: `other` kept 0.88 of the guitar on S4; on solo guitar htdemucs_6s moves the guitar to `piano`, so the doc says skip it |
| Basic Pitch 0.4.0 | fast notes with onsets (onset F1 0.71-0.79 on real GuitarSet clips), note CSV, a frequency range for dropped tunings |
| guitar-gaps.pth / guitar-fl.pth (Riley et al.) | guitar-trained, the best onset F1 measured on real guitar (0.87-0.89) |
| TabCNN, GuitarProFX weights | the only tool that hears strings: matched notes on the right string 0.96-1.0 on GuitarSet (training overlap; standard tuning only) |
| Beat This! 1.1.0 | beats and downbeats (S4 65/68, downbeats 17/17) for bars and tempo |
| madmom 0.16.1 | second downbeat tracker plus CNN chords (37.2 of 38.7 s on S4) and key |
| lv-chordia 1.1.0 | chords including sevenths; best on the capo clip (0.946) |
| librosa tuning estimate + lowest-note rule | tuning offset in cents (-31 vs -30) and dropped low string (Drop D found) |
| MediaPipe Hand Landmarker + fret-grid and fingertip-cell scripts + chain D join | where the fretting hand is and which cells fingertips cover at each onset |
| scorify 0.4.0 | string and fret with capoFret and per-string tuning (0.99 on the capo clip's truth notes) and soft pins |
| tuttut 0.0.7 and LilyPond 2.24.3 | second and third assigners; LilyPond takes hard pins (\N) and a fret limit |
| PyGuitarPro + `tab_beats_to_gp5.py`, alphaTab render, FluidSynth | write a GP5 with bars, tempo and chords, look at it, hear it |
| self-check by synthesis | render the answer, transcribe the render with Basic Pitch, compare with the original's transcription through gtr-eval `notes` (estimate vs estimate, never the truth) |
| MiMo v2.6 Flash wrapper (optional) | a cheap second opinion on capo, tuning and key (right on the capo in 2 of 3 tries, $0.0001 a call) |

## Disk

`df -h /` on 2026-11-24: 8.1 GB free when this scout finished (8.8 GB when it started: other stage-1 work is writing). Keep 3 GB free,
so about 5 GB is usable.

| item | new disk |
|---|---|
| venvs torch, bp, madmom, chordext, video, api (hard links into the old uv cache; 0 to 13 downloads each) | ~0.3 GB |
| venv-ultra + OWLv2 weights (t-05, w-06) | ~0.9 GB |
| weights: guitar-gaps, guitar-fl, guitar_htdemucs_6s.pt, TabCNN | ~0.55 GB |
| node packages (npm cache, or reuse the old node_modules) | ~0.05 GB |
| optional: venv-msst (sep-05, cached), venv-essentia (cached) | ~0.05 GB |
| optional: venv-allin1 (torch 2.5.1 not cached, NATTEN build) | ~1 GB |
| optional on the box: venv-uvr + BS-RoFormer-SW (better on RunPod) | ~0.8 GB |
| media and outputs per song (4 min 1080p video, WAVs, FLAC stems, landmarks, overlays) | ~0.7 GB, ~2.1 GB for 3 |
| **A set (installs + 3 songs)** | **~3.9 GB** |
| **everything on the box** | **~5.7 GB** (needs a clean-up step first) |

Order:
1. Build the venvs first, with `UV_CACHE_DIR=/home/user/gtr/cache/uv` and hard links. Do not prune or delete that cache
   before: it holds torch 2.15.0+cpu, Demucs, Basic Pitch, madmom, MediaPipe, Ultralytics, transformers, Essentia and
   the rest (590 entries, 8.0 GB).
2. Download the small weights; then songs and truth.
3. Run song by song. After scoring each song: stems to 16-bit FLAC (guitar, piano, other only), delete WAV stems, HPSS
   variants other than `default`, and any frame dumps; keep MIDI, JSON, FLAC and overlays.
4. venv-ultra and OWLv2 only when t-05/w-06 run; remove the OWLv2 weights after if space is short.
5. RunPod brings back only MIDI/JSON and FLAC stems (~50 MB per song).
6. Before the film renders, free space in this order: `npm cache clean --force` once node packages are in place
   (~0.95 GB); `/root/.cache/uv` (~0.46 GB); then `UV_CACHE_DIR=/home/user/gtr/cache/uv uv cache clean <pkg>` for what
   no venv uses (essentia_tensorflow 0.61 GB, duplicate llvmlite, scipy and numpy builds, opencv 4.11, polars) or the whole
   old cache (frees the part not hard-linked into venvs, roughly 5 GB). Never delete `/home/user/gtr/eval` (gtr-eval's
   venv) or `/home/user/gtr/inputs` (the research's clips and truths, useful for calibration). `/home/user/gtr/lanes`
   (1.9 GB, the research's raw outputs; its media are also in the studio library) and `/home/user/land` (2.3 GB, another
   checkout) are not this job's to delete.
