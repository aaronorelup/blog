<!-- RUNDOWN -->
- **16 of the 60 tools my agents listed for splitting a song into instruments ran on the cloud box, and 4 of the models that ran write a separate guitar track.** Demucs's six-track model put a synthesized steel-string guitar into its piano track in 2 of 2 runs, and three real nylon-string guitar recordings into its guitar track.

<!-- SECTION -->
## Splitting a song into instruments

Before an app reads the notes of a full song, it can split the recording into stems, one instrument's track each, so the guitar comes on its own. My agents listed 60 tools, models and services for this, plus 4 training datasets, and 16 of the 60 ran on the cloud box. They ran on S4, a 39-second band I synthesized so I have each instrument's true track, on R2, 36 seconds of a real band song with singing, and on fingerstyle guitar clips. Four of the models that ran write a guitar stem. Demucs's six-stem model put the guitar of S2s, a 29-second fingerstyle piece I synthesized on a steel-string sound, into its piano stem in 2 of 2 runs, and the guitar of three real 18-second nylon-string recordings into its guitar stem. On 2 processor cores it split the whole song R2 comes from, 228.5 seconds long, in 163 seconds.

<details><summary>Every tool that ran, what went in and what came out</summary>

Sixteen entries from the list, A to Z. Every run was on the cloud box, on 2 of its 4 processor cores unless the entry says otherwise, with about 20 agents sharing the machine. So each time is one run on a busy box. None of it cost money beyond the cloud session. Every input was a 16-bit WAV at 44.1 kHz in stereo, and every output is a WAV at 44.1 kHz in stereo unless an entry says otherwise. Each tool's options are at their defaults unless the entry names them. The verifier is one of the agents that checked every run, and some runs it repeated are below.

The clips. S4 is 38.7 seconds of a band I synthesized: drums, an electric bass, a strummed steel-string guitar and a lead line on the General MIDI sound Voice Oohs, standing in for a singer, with each instrument's true track saved. Some runs used its first 10.0 seconds. S6taps is 29.4 seconds of a fingerstyle piece I synthesized on a steel-string sound, with 32 drum-kit hits standing in for taps on the guitar's body, and its true guitar and taps tracks. S2s is the same piece without the taps and has no true tracks. R2 is 36 seconds of a real band song with singing, and R2full is the whole 228.5-second song. For R2 there's the artist's own instrumental version, and my agents made a vocal track by subtracting it from the song. R3a, R3b and R3c are the sound of three real 18-second videos of a nylon-string guitar played with the fingers, with no true tracks.

The measurements:

- SI-SDR (scale-invariant signal-to-distortion ratio), in decibels (dB). It compares the part of a stem that copies the true track with everything else in the stem, other instruments and sound the tool added. A higher number means less of everything else. Tools without a guitar stem had `other` compared with the true guitar and `vocals` with the lead line. On R2, every stem but `vocals` was summed and compared with the artist's instrumental, and `vocals` with the subtracted vocal track.
- Where a sound went: the share of a true track found in an output stem, 1 being all of it, measured by projecting the stem onto the true track.
- Levels in dBFS, decibels below the loudest sound a WAV file can hold, for clips with no true tracks.

Every stem here is a WAV file, the kind Basic Pitch, a note transcriber my audio-to-notes agents ran, takes as a file path.

**adityalakhani/htdemucs-6s-guitar-ft** ([link](https://huggingface.co/adityalakhani/htdemucs-6s-guitar-ft)). Demucs's six-stem model, htdemucs_6s, fine-tuned by its author to give a guitar stem. The file is a training snapshot from epoch 60 with 27,414,996 parameters, the same count as the stock model.

- In: S4, R2, S6taps and S2s.
- Command or settings: my agents read the repository's `inference.py` and ran its steps in their own script, with Demucs 4.1.0 in place of the `demucs==4.0.1` it pins: `get_model("htdemucs_6s")`, the snapshot's weights, then `apply_model(..., shifts=1, segment=7.8, overlap=0.25)`, the output clamped to [-1, 1] and written as 24-bit WAV. Python's random generator was seeded with 0. The stock htdemucs_6s ran through the same script as a control.
- Out: six stems, drums, bass, other, vocals, guitar and piano, where the repository's script writes only the guitar. On S4 its guitar stem measured 6.10 dB SI-SDR against the true guitar, and the stock model's 1.73 dB through the same script. The guitar stem held 0.898 of the true guitar, along with 0.121 of the true bass, 0.147 of the true drums and 0.161 of the lead line. The stock model put 0.345 of the guitar in `guitar` and 0.218 in `piano`. With the fine-tune the true bass was 0.312 in `bass` (stock 0.7555) and the true drums 0.477 in `drums` (stock 0.890). On S6taps, 0.5465 of the true guitar was in `guitar` and 0.177 in `piano` (stock 0.0635 and 0.755). On S2s, `piano` was at -24.55 dBFS and `guitar` at -36.63 dBFS, with the mix at -18.23 dBFS. On R2 the summed instrumental measured 6.78 dB and `vocals` 13.21 dB. 40 of the 3,175,200 samples in its R2 `vocals.wav` sit at full scale, from the clamp.
- Time: S4 25.98 s, peak memory 1,606.5 MB (r0636). R2 31.66 s (r0637), S6taps 22.45 s (r0640), S2s 22.28 s (r0642). The stock control took 32.37 s on S4 (r0638).
- Takes as a hint: none of capo, tuning, note range, tempo or key. The repository's script takes `--checkpoint`, `--device auto|cuda|cpu`, `--shifts` and `--overlap`.
- Hands off to: not tried here. Steps for me to run the repository's own script on a GPU exist (item 5).

**audio-separator 0.48.0** ([link](https://github.com/nomadkaraoke/python-audio-separator)). A command-line tool and Python package that runs the model families of Ultimate Vocal Remover (UVR), a desktop app for splitting songs, and downloads their files. Six models ran through it. VR Architecture, MDX-Net, MDX23C and BS-RoFormer-SW have their own entries, and the other two are here.

- In: S4, its first 10.0 s, and R2.
- Command or settings: `audio-separator -m <model> --model_file_dir models/uvr --output_dir <out> --output_format WAV --custom_output_names '<lower-case names>' <clip>.wav`, everything else at its defaults, among them `--normalization 0.9`. Its model list (`audio-separator -l --list_format json`) held 169 models: VR 29, MDX 39, Demucs 4 and MDXC 97, the last being MDX23C and the RoFormers. Two of them name a guitar: `htdemucs_6s.yaml` in the list, and `BS-Roformer-SW.ckpt` in its YAML.
- Out: one 16-bit WAV per stem. Demucs htdemucs_6s through it on S4 measured drums 9.05, bass 7.28, guitar 1.56 and lead 7.96 dB SI-SDR, with 0.329 of the true guitar in `guitar` and 0.228 in `piano` (r0490). Its default model, the BS-RoFormer `model_bs_roformer_ep_317_sdr_12.9755.ckpt`, wrote an instrumental and vocals for the first 10 s of S4 (r0498). The instrumental measured 3.16 dB against drums, bass and guitar together. Its `vocals.wav` is all zeros, 441,000 x 2 samples, and mir_eval, an audio measuring library my agents used next to their own SI-SDR code, stopped on it with `All the estimated sources should be non-silent ...`. The `--normalization 0.9` default scales a file down only when its peak is above 0.9. R2 peaks at 0.989 and its stems came out peaking at 0.90, while S4 and its stems weren't scaled.
- Time: htdemucs_6s on S4 68.34 s, peak 1,723.9 MB (r0490). The BS-RoFormer on the 10 s, 170.47 s, peak 2,227.5 MB (r0498). In a straight line that rate comes to 3,895 s for the 228.5-second song, my agents' extrapolation, not a measurement.
- Takes as a hint: none of capo, tuning, note range, tempo or key. It takes `-m` (model), `--single_stem`, ensembles of several models, `--chunk_duration`, settings per model family, and `--mdxc_pitch_shift`, which shifts the audio's pitch while it works.
- Hands off to: not tried here. From the command line it writes FLAC by default, which Basic Pitch also takes. Whole-song runs of three of its models on a GPU are in the steps for me (item 4).

**barvarvara/demucs-guitar-lora** ([link](https://huggingface.co/barvarvara/demucs-guitar-lora)). A LoRA adapter, a small file that adjusts a trained model, for Demucs's htdemucs. Its model card says, in Russian, that it's htdemucs fine-tuned with LoRA to extract acoustic guitar. It doesn't name its training data or say which of the four stems carries the guitar.

- In: S4 and S2s.
- Command or settings: my agents' script follows the card: `PeftModel.from_pretrained(get_model('htdemucs').models[0], adapter)`, then `merge_and_unload()` and `demucs.apply.apply_model` with the command line's defaults, shifts 1 and overlap 0.25. The adapter is 1,974,280 bytes.
- Out: drums, bass, other and vocals, 16-bit. On S4: drums 7.80, bass 7.86, guitar (`other`) 1.94 and lead (`vocals`) 0.93 dB SI-SDR (e1416). The true guitar was 0.864 in `other`, 0.052 in `vocals` and 0.042 in `drums`, against 0.883, 0.056 and 0.015 for htdemucs without the adapter (r0019). On S2s the `drums` stem was at -48.43 dBFS with the adapter and -77.25 dBFS without it (r0060). The verifier's second run of S4 measured guitar 2.40 dB (r0529), since Demucs's random shift makes runs differ.
- Time: S4 54.93 s, peak 1,363.8 MB (r0467). S2s 71.50 s (r0470). The second S4 run took 34.82 s (r0529).
- Takes as a hint: Demucs's options. The adapter only changes weights.
- Hands off to: not tried here.

**becruily Mel-Band RoFormer guitar** ([link](https://huggingface.co/becruily/mel-band-roformer-guitar)). A community-trained checkpoint, a file of trained weights, for the Mel-Band RoFormer design. It writes one stem, the guitar. It's 45,142,183 bytes, and its page has no model card.

- In: S4, its first 10.0 s, and S2s, through MSST (its own entry below).
- Command or settings: `msst-inference --model_type <type> --config_path <yaml> --start_check_point <ckpt> --input_folder <dir with one clip> --store_dir <out> --force_cpu --disable_detailed_pbar` with `mel_band_roformer`, `config_guitar_becruily.yaml` and `becruily_guitar.ckpt`.
- Out: `Guitar.wav`, 32-bit float. On S4 it's at -39.19 dBFS against -17.37 dBFS for the mix, holds 0.0773 of the true guitar and measures -2.65 dB SI-SDR (e1425). On the first 10 s it's at -51.18 dBFS and holds 0.0209 of the guitar. On S2s it's at -49.83 dBFS against -18.23 dBFS for the mix. It wasn't run on R3a to R3c, for lack of time.
- Time: S4 289.53 s, peak 1,818.9 MB (r0491). The 10 s took 87.16 s (r0473) and S2s 211.79 s (r0480). The verifier's re-run of the 10 s took 67.64 s and wrote the same samples (r0547).
- Takes as a hint: none. Its config sets a 485,100-sample chunk and an overlap of 2.
- Hands off to: my chains agents gave its S4 `Guitar.wav` to Basic Pitch (r0511). It returned 406 notes, and 229 of the 369 strummed-guitar notes were among them, start within 50 ms and pitch within 50 cents (e1447).

**BS-RoFormer-SW** ([link](https://huggingface.co/enerjazzer/BS-ROFO-SW-Fixed)). A community-trained six-stem checkpoint for the BS-RoFormer design, 699,412,152 bytes. The cards my agents read don't name who trained it.

- In: the first 10.0 s of S4, through audio-separator and through MSST.
- Command or settings: `audio-separator -m BS-Roformer-SW.ckpt` with the settings in that entry (r0489), and `msst-inference` with `--model_type bs_roformer`, `BS-Roformer-SW.yaml` and the same checkpoint (r0492).
- Out: bass, drums, other, vocals, guitar and piano, 16-bit from audio-separator and 32-bit float from MSST. Through audio-separator: drums 14.06, bass 14.59 and guitar 13.60 dB SI-SDR (e1420), with 0.939 of the true guitar in `guitar`. The lead line went to `other`, 0.923 of it, measuring 14.77 dB there, and `vocals` held 0 of it, at -111.73 dBFS. Through MSST: drums 13.63, bass 14.17, guitar 12.36 and lead (`other`) 13.59 dB (e1427), with 0.910 of the lead in `other` and 0.925 of the guitar in `guitar`. The two runs' stems differ by -22.70 to -23.21 dB, the level of their difference against audio-separator's files, and what causes it wasn't isolated.
- Time: 110.34 s for the 10 s through audio-separator, peak 2,354.6 MB (r0489), and 156.64 s through MSST, peak 2,734.0 MB (r0492). In a straight line, r0489's rate comes to 2,521 s for the 228.5-second song, an extrapolation, not a measurement.
- Takes as a hint: none. Chunk size and overlap come from its YAML.
- Hands off to: not tried here. A whole-song run on a GPU is in the steps for me (item 4).

**Demucs 4.1.0** ([link](https://github.com/adefossez/demucs)). A source separator first made at Meta, in the version from its author's own repository. Four of its models ran. htdemucs, htdemucs_ft (a set of four fine-tuned htdemucs, one per stem) and mdx_extra (four models of the older version 3) write drums, bass, other and vocals. htdemucs_6s adds guitar and piano.

- In: S4, S6taps, S2s, R2, R2full, R3a, R3b and R3c, and the first 10 s of S4 for checks of its options.
- Command or settings: `demucs -n <model> -d cpu -o out <clip>.wav`, everything else at its defaults (`--shifts 1`, `--overlap 0.25`, 16-bit WAV, `--clip-mode rescale`). After `uv pip install demucs==4.1.0` the first `demucs --help` stopped with `ModuleNotFoundError: No module named 'numpy'`, because the package lists numpy only for macOS on x86_64. Installing numpy fixed it.
- Out: one 16-bit WAV per stem, as long as the input. On S4, htdemucs measured drums 9.09, bass 7.65, guitar (`other`) 2.45 and lead (`vocals`) 1.79 dB SI-SDR (e0073). htdemucs_ft measured 9.78, 8.51, 4.65 and 4.97 dB (e0074), mdx_extra 8.91, 5.67, 3.69 and 6.58 dB (e0075), and htdemucs_6s, with its own guitar stem, 8.99, 7.40, 1.89 and 7.94 dB (e0095). `other` held 0.883 of the true guitar with htdemucs, 0.897 with htdemucs_ft and 0.870 with mdx_extra. htdemucs_6s put 0.358 of it in `guitar`, 0.232 in `piano`, 0.093 in `vocals` and 0.001 in `other`. `vocals` held 0.522 of the lead line with htdemucs, 0.648 with htdemucs_ft, 0.650 with mdx_extra and 0.837 with htdemucs_6s. On S2s, htdemucs_6s put the guitar in `piano` at -19.06 dBFS, with `guitar` at -42.15 dBFS and the mix at -18.23 dBFS (r0099), and the verifier's re-run gave -19.07 and -41.72 dBFS (r0525). htdemucs put it in `other`, at -18.24 dBFS (r0060). On R3a, R3b and R3c, htdemucs_6s put the sound in `guitar`, within 0.4 dB of the mix level (r0410, r0413, r0418). On S6taps, htdemucs_6s put 0.767 of the true guitar in `piano` and 0.056 in `guitar`, and 0.790 of the taps in `drums` (r0054). htdemucs put the guitar in `other`, at 20.72 dB against the true guitar, and 0.741 of the taps in `drums`, at 5.67 dB against the true taps (r0053). On R2 the summed instrumental measured 11.41 dB with htdemucs, 10.81 with htdemucs_ft, 11.26 with mdx_extra and 10.77 with htdemucs_6s, and `vocals` 13.42, 13.57, 13.47 and 13.42 dB (e1398 to e1401).

  Checks of its options: two runs of one command give different files, because Demucs shifts the audio by a random amount by default. The verifier's re-run of htdemucs on S4 measured guitar 2.77 and lead 2.54 dB, against 2.45 and 1.79 the first time (r0524). `--two-stems guitar` with htdemucs_6s wrote `guitar.wav` and `no_guitar.wav`, and that guitar measured 1.61 dB (r0450). `--segment 10` stopped with `Cannot use a Transformer model with a longer segment than it was trained for. Maximum segment is: 7.8` (r0460, and again in r0527). With `--mp3`, each stem decodes to 1,368 more frames than the input, a frame being one sample per channel, and their sum lines up with the mix 1105 samples late (r0462). On R2 and R2full the `drums` and `vocals` stems of every model peak at exactly -0.09 dBFS. That's `--clip-mode rescale`, which scales a whole stem down when it would clip and so changes its level next to the other stems.

- Time: on S4, htdemucs 38.86 s with peak memory 1,253.6 MB (r0019), htdemucs_6s 36.37 s and 1,349.6 MB (r0021), htdemucs_ft 131.84 s and 1,825.4 MB (r0029), mdx_extra 114.44 s and 3,909.8 MB (r0049). The whole 228.5-second song took 255.55 s with htdemucs, peak 1,798.0 MB (r0472), and 163.00 s with htdemucs_6s, peak 2,163.8 MB (r0477). In a later round my agents ran the whole song on all 4 cores. htdemucs_6s took 109.55 s (r0660). htdemucs took 263.90 s and 363.56 s in two 4-core runs (r0659, r0669) and 277.63 s in a second 2-core run (r0677). During r0669 and r0677 other processes on the box used an average of 1.7 and 2.5 CPUs. With 4 cores htdemucs used about twice the CPU time of the 2-core runs, and why wasn't isolated.
- Takes as a hint: none of capo, tuning, note range, tempo or key. It takes `-n` (model), `--two-stems STEM` (one stem and the rest), `--segment` (at most 7.8 s for the Transformer models), `--shifts`, `--overlap` and the output format.
- Hands off to: librosa's onset detector, run on the S6taps `drums` stems, found 34 onsets with htdemucs, with 31 of the 32 taps within 50 ms of one (e0919), and 32 onsets with htdemucs_6s, one within 50 ms of each of the 32 taps (e0928). My audio-to-notes agents gave the htdemucs_6s guitar stems to Basic Pitch (r0243). From S4's it returned 342 notes, with 233 of the 369 strummed-guitar notes among them, start within 50 ms and pitch within 50 cents (e0652). From S6taps's it returned 96, with 41 of the 90 played notes among them (e0660). My fingerstyle agents compared the S2s and S6taps stems with the bass line, the melody and the taps alone (e0161 to e0170).

**demucs-onnx 0.3.4** ([link](https://github.com/StemSplit/demucs-onnx)). StemSplit's package that runs Demucs as ONNX, an open file format for trained models, through ONNX Runtime and without PyTorch.

- In: S4.
- Command or settings: `demucs-onnx separate S4.wav out --model htdemucs_6s --small --providers cpu -v` (r0471), which used the 136,428,532-byte `htdemucs_6s_fp16weights.onnx`.
- Out: bass, drums, guitar, other, piano and vocals, 16-bit, 6,834,024 bytes each. On S4: drums 8.91, bass 7.48, guitar 1.04 and lead 6.87 dB SI-SDR (e1417), with 0.303 of the true guitar in `guitar`, 0.273 in `piano` and 0.091 in `vocals`. It has no random shift, and every re-run wrote the same samples (r0548, r0610, r0612).
- Time: ONNX Runtime picks its own thread count. With that default it ran worker threads on cores outside the job's 2-core slot (r0610), so the first time, 56.27 s (r0471), isn't a 2-core figure. With 2 threads set, S4 took 61.33 s (r0612). Peak memory was 6,204.5 MB (r0471), where PyTorch Demucs with htdemucs_6s peaked at 1,349.6 MB on the same clip (r0021).
- Takes as a hint: none. `--model`, `--stem` or `--stems`, `--precision fp32|fp16weights` and `--providers auto|cpu|coreml|cuda|dml|wasm`.
- Hands off to: not tried here. Its `browser.py` writes a demo for onnxruntime-web, ONNX Runtime in a browser, which wasn't tested.

**demucs.cpp** ([link](https://github.com/sevagh/demucs.cpp)), commit `4edae49`. A C++ program that runs Demucs without PyTorch, from weights converted to ggml files.

- In: S4 and its first 10 s.
- Command or settings: built with CMake. The first build stopped in its bundled Eigen library with `Eigen/src/Core/arch/AVX512/PacketMathFP16.h:116:25: error: invalid 'static_cast' from type 'const Eigen::half' to type '_Float16'` (r0466). The project builds with `-march=native`, which on this box turns on `-mavx512fp16`. A one-line compiler wrapper adding `-mno-avx512fp16` got the second build through in 113.27 s (r0507). Then `demucs_mt.cpp.main <ggml-model-htdemucs-6s-f16.bin> <clip>.wav <out dir> 2`, 2 threads, with the ready-converted 54,855,129-byte weights.
- Out: `target_0_drums.wav` to `target_5_piano.wav`, 32-bit float. On S4: drums 8.91, bass 7.16, guitar 0.02 and lead 8.06 dB SI-SDR (e1446), with 0.286 of the true guitar in `guitar`, 0.277 in `piano` and 0.093 in `vocals`. A second run of the 10 s wrote the same samples (r0541).
- Time: S4 132.69 s, peak 3,596.6 MB (r0509), and the 10 s 66.36 s (r0508). PyTorch Demucs took 36.37 s and 1,349.6 MB on S4 (r0021).
- Takes as a hint: none. The model file and the thread count.
- Hands off to: not tried here.

**librosa 1.0.0, HPSS** ([link](https://github.com/librosa/librosa)). librosa is a Python audio library. Its HPSS splits a recording into a harmonic part, held pitched sound, and a percussive part, short hits, by filtering the spectrogram, with no trained model.

- In: S6taps and S2s.
- Command or settings: `librosa.effects.hpss(y)` at its defaults (kernel_size 31, power 2.0, margin 1.0), then with `margin=3.0` and with `margin=(1.0, 5.0)`, followed by `librosa.onset.onset_detect` at its defaults on the percussive part.
- Out: `harmonic.wav` and `percussive.wav`, 32-bit float, and a text file of onset times in seconds. On S6taps the harmonic part measured 15.53 dB SI-SDR against the true guitar at the default and with margin (1.0, 5.0), and 8.62 dB with margin 3. The percussive part measured 0.34, 3.86 and 3.21 dB against the true taps, in the order default, margin 3, margin (1.0, 5.0). At margin 1 the two parts add up to the input. The onset detector found 53 onsets in the percussive part at all three settings, with all 32 taps within 50 ms of one (e0815, e0862, e0896). On S2s, which has no taps, it found 48 onsets at every setting, from the guitar notes.
- Time: the first runs were single-threaded outside the 2-core slots on a busy box, 72.47 s for S6taps (r0262) and 53.56 s for S2s (r0268). The verifier's re-run of S6taps in a 2-core slot took 19.60 s, peak 559.2 MB, and wrote the same samples (r0530).
- Takes as a hint: none musical. `margin`, `kernel_size`, `power`, `mask`, `n_fft` and `hop_length`.
- Hands off to: the onset lists above. My chains agents gave the harmonic parts of S6taps and S2s to Basic Pitch (r0511) and joined the S6taps notes with the percussive onsets (r0540).

**MDX-Net, `UVR-MDX-NET-Inst_HQ_3.onnx`** ([link](https://github.com/kuielab/mdx-net)). UVR's MDX-Net models build on KUIELab's MDX 2021 code. This one writes an instrumental and vocals. It's 66,759,214 bytes and ran through audio-separator.

- In: S4 and R2.
- Command or settings: `audio-separator -m UVR-MDX-NET-Inst_HQ_3.onnx` with the settings in that entry.
- Out: `instrumental.wav` and `vocals.wav`, 16-bit. On S4 the instrumental measured 3.18 dB SI-SDR against drums, bass and guitar together, and `vocals` -3.16 dB against the lead line (e1422). `vocals` held 0.169 of the lead and the instrumental 0.808. On R2: instrumental 12.58 and vocals 14.40 dB (e1439).
- Time: it runs through ONNX Runtime with no thread count set, so the first times, 86.42 s on S4 (r0487) and 76.06 s on R2 (r0503), aren't 2-core figures. With 2 threads set, S4 took 66.38 s, peak 3,166.6 MB (r0619).
- Takes as a hint: none. `--mdx_segment_size` and `--mdx_overlap`.
- Hands off to: not tried here.

**MDX23C, `MDX23C-8KFFT-InstVoc_HQ.ckpt`** ([link](https://github.com/kuielab/sdx23)). KUIELab's TFC-TDF-Net v3 design from the SDX 2023 challenge, with weights that UVR's README credits to ZFTurbo. This one writes an instrumental and vocals. It's 448,101,203 bytes and ran through audio-separator.

- In: the first 10.0 s of S4.
- Command or settings: `audio-separator -m MDX23C-8KFFT-InstVoc_HQ.ckpt` with the settings in that entry.
- Out: `instrumental.wav` and `vocals.wav`, 16-bit. The instrumental measured 3.17 dB SI-SDR and `vocals` -10.35 dB against the lead line (e1429). `vocals` held 0.0019 of the lead, at -67.52 dBFS.
- Time: 502.83 s for the 10 s, peak 2,230.6 MB (r0496). In a straight line that's 11,490 s, about 3.2 hours on 2 cores, for the 228.5-second song, an extrapolation, not a measurement.
- Takes as a hint: none. audio-separator's options.
- Hands off to: not tried here.

**MSST, Music-Source-Separation-Training (PyPI `msst` 0.1.0)** ([link](https://github.com/ZFTurbo/Music-Source-Separation-Training)). ZFTurbo's code for training and running many separation designs, behind many community checkpoints. Three checkpoints ran through it, becruily's guitar model, BS-RoFormer-SW and SCNet Small, each with its own entry.

- In: S4, its first 10.0 s, S2s and S6taps.
- Command or settings: `msst-inference --model_type <type> --config_path <yaml> --start_check_point <ckpt> --input_folder <dir with one clip> --store_dir <out> --force_cpu --disable_detailed_pbar`, everything else at its defaults. My trial agent reports that running the repository's `inference.py` from a clone was refused by its session's permission check, with no log kept. So my agents installed the PyPI package with `--no-deps` next to torch 2.15.0, outside its declared `torch<2.12,>=2.0.1`.
- Out: one 32-bit float WAV per instrument, as `<store_dir>/<input file stem>/<instrument>.wav`.
- Time: in the three model entries.
- Takes as a hint: none musical. `--model_type`, `--config_path` (chunk size, overlap and instruments are in the YAML), `--extract_instrumental`, `--use_tta` and LoRA weights.
- Hands off to: its Python `Separator` returns a NumPy array per stem, which librosa's HPSS takes. That's documented, not run.

**Open-Unmix 1.3.0, models umxhq and umxl** ([link](https://github.com/sigsep/open-unmix-pytorch)). A separator from Inria and sigsep with one network per stem: vocals, drums, bass and other.

- In: S4, R2 and S6taps.
- Command or settings: `umx --model <umxhq|umxl> --no-cuda --outdir out/<model> <clip>.wav`, everything else at its defaults. The first run stopped with `ImportError: TorchCodec is required for load_with_torchcodec. Please install torchcodec to use this function.` (r0051), because torchaudio 2.11 reads and writes audio through torchcodec. Installing torchcodec fixed it.
- Out: `vocals.wav`, `drums.wav`, `bass.wav` and `other.wav`, 16-bit. On S4, umxhq measured drums 3.58, bass 2.58, guitar (`other`) -1.99 and lead (`vocals`) -39.95 dB SI-SDR (e0076), and umxl 4.31, 5.02, -0.88 and -27.53 dB (e0371). Both put the lead line in `other`, 0.9805 of it with umxhq and 0.9053 with umxl, and 0.0001 and 0.0008 of it in `vocals`, which sat at -66.97 and -55.89 dBFS. `other` held 0.8502 and 0.8886 of the true guitar. On S6taps, umxhq measured guitar 17.89 dB and taps 2.71 dB (e0389). On R2: instrumental 9.72 (umxhq) and 10.76 dB (umxl), vocals 11.76 and 12.73 dB (e0397, e0398).
- Time: on S4, umxhq 28.82 s, peak 1,617.1 MB (r0085), and umxl 127.36 s, peak 1,991.2 MB (r0101). The verifier's re-run of r0085 took 19.54 s and wrote the same samples (r0539).
- Takes as a hint: none musical. `--targets`, `--residual`, `--niter` (how many filter passes), `--start` and `--duration`.
- Hands off to: librosa's onset detector on umxhq's S6taps `drums` stem found 82 onsets, with all 32 taps within 50 ms of one (e0934). My fingerstyle agents compared its S6taps stems with the bass line, the melody and the taps (e0950, e0965).

**SCNet Small, MUSDB18 checkpoint** ([link](https://github.com/starrytong/SCNet)). SCNet is a four-stem separator design from an ICASSP 2024 paper. This checkpoint, `scnet_checkpoint_musdb18.ckpt` (42,434,986 bytes), is from MSST's list, and the verifier ran it through MSST.

- In: S4 and S6taps.
- Command or settings: `msst-inference --model_type scnet --config_path config_musdb18_scnet.yaml --start_check_point scnet_checkpoint_musdb18.ckpt --input_folder <dir with one clip> --store_dir verify/out/msst-scnet-musdb18 --force_cpu --disable_detailed_pbar`.
- Out: drums, bass, other and vocals, 32-bit float. On S4: drums 9.61, bass 7.27, guitar (`other`) 2.23 and lead (`vocals`) 2.45 dB SI-SDR (e1596). The lead was 0.504 in `other` and 0.470 in `vocals`, and the guitar 0.884 in `other`. On S6taps: guitar 21.73 and taps 7.57 dB (e1597). Each run printed two torch warnings, `A window was not provided. A rectangular window will be applied ...`.
- Time: S4 109.10 s, peak 3,372.2 MB (r0559), and S6taps 98.94 s (r0560).
- Takes as a hint: none musical. MSST's options, with `chunk_size: 485100` and `num_overlap: 4` in its YAML.
- Hands off to: librosa's onset detector on its S6taps `drums` stem found 47 onsets, with all 32 taps within 50 ms of one (e1595).

**Spleeter 2.4.2, 4stems model** ([link](https://github.com/deezer/spleeter)). Deezer's TensorFlow separator with ready-made 2-, 4- and 5-stem models. The 5-stem one adds piano, and none has a guitar stem.

- In: S4, S6taps and R2.
- Command or settings: `MODEL_PATH=models/spleeter spleeter separate -p spleeter:4stems -o out/spleeter-4stems <clip>.wav`, everything else at its defaults. Spleeter 2.4.2 pins `tensorflow==2.12.1`, whose Linux wheel is 585.9 MB, so my agents installed `tensorflow-cpu==2.12.1` in its place. By default it separates only the first 600 s of a file.
- Out: `vocals.wav`, `drums.wav`, `bass.wav` and `other.wav`, 16-bit. On S4: drums 3.75, bass 2.74, guitar (`other`) -1.40 and lead (`vocals`) -8.20 dB SI-SDR (e1394). The lead was 0.8668 in `other` and 0.1115 in `vocals`, and the guitar 0.8571 in `other`. On S6taps: guitar 21.79 and taps 7.93 dB (e1395). On R2: instrumental 10.62 and vocals 12.54 dB (e1396).
- Time: S4 21.46 s, peak 1,808.9 MB (r0419). S6taps 14.47 s (r0421) and R2 12.88 s (r0422). The verifier didn't re-run it, since reinstalling TensorFlow was over the 200 MB download limit in force then, and re-read the saved outputs instead.
- Takes as a hint: none musical. `-p spleeter:2stems|4stems|5stems`, `--mwf` (multichannel Wiener filtering), and `-s` and `-d` (offset and duration).
- Hands off to: librosa's onset detector on its S6taps `drums` stem found 75 onsets, with all 32 taps within 50 ms of one (e1397).

**VR Architecture, `1_HP-UVR.pth`** ([link](https://github.com/tsurumeso/vocal-remover)). UVR's VR models build on tsurumeso's vocal remover code. This one writes an instrumental and vocals. It's 126,792,647 bytes and ran through audio-separator.

- In: S4 and R2.
- Command or settings: `audio-separator -m 1_HP-UVR.pth` with the settings in that entry.
- Out: `instrumental.wav` and `vocals.wav`, 16-bit, 463 frames shorter than the input on S4 (1,708,032 against 1,708,495) and 400 frames shorter on R2, still lined up with the mix at the start. On S4 the instrumental measured 7.54 dB SI-SDR and `vocals` 4.72 dB against the lead line (e1421). `vocals` held 0.516 of the lead and the instrumental 0.470. On R2: instrumental 10.96 and vocals 12.98 dB (e1435).
- Time: S4 109.83 s, peak 2,198.2 MB (r0481), and R2 88.22 s (r0502). The verifier's re-run on S4 took 84.6 s and wrote the same samples (r0531).
- Takes as a hint: none. `--vr_window_size`, `--vr_aggression` and `--vr_enable_tta`.
- Hands off to: not tried here.

The full record, every run and every quote, is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/source-separation).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

44 of the 60 tools on the list didn't run here, and none of the 4 datasets was downloaded. Two limits come up. In the first round the shared disk had 6.2 to 7.2 GB free, and the orchestrator, the agent running the whole project, asked every agent to start no download or install over 200 MB unless its work couldn't finish without it. In a later round to fill gaps, the session's permission policy refused two steps that used a cloned repository's code, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].`

- **asteroid.** A separation toolkit whose README model list points to speech recipes. Whether it runs here wasn't checked. No steps.
- **AudioSep.** Its two checkpoint files are 1.26 GB and 2.35 GB. In the first round that was over the 200 MB limit. In the later round the download would have left about 3,950 MB free, under the 4 GB that round had to keep, and its route runs a cloned repository's code. Nothing was downloaded. Steps for me: item 2.
- **AudioShake.** A hosted service, left to my hosted-apis agents. No steps.
- **Band-Split RNN (BSRNN).** It appears only as a row in the Demucs README's comparison table, and no code was looked for. No steps.
- **Banquet (query-bandit).** Running the README's `python train.py inference_byoq` from the cloned repository was refused by the session's permission policy, and no weights were downloaded. Its smallest checkpoint is 552 MB, plus a 342 MB model for the query clip. Steps for me: item 3.
- **BS PolarFormer.** A checkpoint listed in MSST, not run, with no reason recorded. No steps.
- **BS-Mamba2.** A design listed in MSST, not run, with no reason recorded. No steps.
- **BS-RoFormer and Mel-Band RoFormer code (lucidrains).** Architecture code with no weights. The two designs ran here with community checkpoints. No steps.
- **bs-roformer-infer and melband-roformer-infer (OpenMIRLab).** Repackagings of models already run here through audio-separator and MSST, not tried, to keep the CPU slots for other tools. No steps.
- **BS-RoFormer-SW ONNX (elicwhite).** A conversion of BS-RoFormer-SW, not run, with no reason recorded. No steps.
- **BSRoformer.cpp.** A C++ runner for RoFormer checkpoints, not run, with no reason recorded. No steps.
- **demucs-infer (OpenMIRLab).** A repackaging of Demucs, not tried, to keep the CPU slots for other tools. No steps.
- **demucs-rs.** The box has no GPU, and its README names Metal, Vulkan and WebGPU back ends only: `A GPU with Metal (macOS), Vulkan (Linux/Windows), or WebGPU (browser) support`. Steps for me: item 6, its browser demo.
- **demucs.onnx (sevagh).** No run recorded. The survey lists it as runnable after compiling. No steps.
- **DTTNet.** A design listed in MSST, not run, with no reason recorded. No steps.
- **Dynamic Band Splitting.** No music-stem checkpoint is named. Its released checkpoints return `music, sfx, speech`. No steps.
- **free-music-demixer.** An in-browser Demucs demo. Its README says `It is provided as-is and is no longer maintained.` and `Model weights are not included.` No steps.
- **Gaborformer.** It has no PyPI package, and installing the cloned repository was refused by the session's permission policy. Its weights weren't downloaded. Steps for me: item 8.
- **guitar_source_separation (LukeSutor).** Its README and LICENSE are Open-Unmix's, and it names no guitar weights. No steps.
- **LALAL.AI.** A hosted service, left to my hosted-apis agents. No steps.
- **Mini-BS-RoFormer-V2.5-46.2M.** A four-stem model the verifier found in a last search, looked at only as far as its model card. No steps.
- **mlx-audio-separator.** It's built on MLX, which targets Apple Silicon, so it can't run on this Linux box. No steps.
- **Moises / Music.AI.** A hosted service, left to my hosted-apis and apps-survey agents. No steps.
- **Moises-Light.** Architecture code, with no weights named in its README. No steps.
- **MuS3D.** Its checkpoint repository is 19.2 GB, and its README says `The DiT needs about 10 GB of free memory`. Not run, for disk. Steps for me: item 7.
- **musdb (Python package).** A reader for the MUSDB18 datasets, not run. No steps.
- **Music Source Restoration systems.** Research on recovering unprocessed stems from mastered mixes. Code and weights weren't looked for. No steps.
- **MVSEP.** A hosted service, left to my hosted-apis agents. No steps.
- **MVSEP-MDX23 ensemble.** No run recorded. No steps.
- **nussl.** Its README says `NUSSL IS DEPRECATED`. Whether it runs here wasn't checked. No steps.
- **PolUVR.** A fork of audio-separator, not tried, to keep the CPU slots for other tools. No steps.
- **SAM 2.** A video model that gives a mask per frame. It appears in the survey only as a possible source of video masks for SAM Audio. No steps.
- **SAM Audio.** Its weights are gated on Hugging Face (`gated: manual`, so a Hugging Face account and a request that Meta approves), and the smallest model repository is 5.1 GB. Steps for me: item 1.
- **`Score-Informed-SS-on-Guitars`.** Code for a paper on separating two guitars with help from the written music. Only its README was read, and its tree has no LICENSE file. No steps.
- **SepGen.** An audio and video separation model, a LoRA on the LTX-2.5 22B model, looked at only as far as its paper and card. No steps.
- **Spleeter Pro.** Deezer's commercial version of Spleeter, left to my hosted-apis agents. Its terms weren't read. No steps.
- **StemDeck.** A desktop app that a web-search result says uses htdemucs_6s. The page wasn't opened, and the app is left to my apps-survey agents. No steps.
- **STEMMA.** A music reasoning model, audio in and text out, listed only because its name matched a search for stem. No steps.
- **StemSplit (hosted service).** A hosted service, left to my hosted-apis agents. Its separate open package, demucs-onnx, ran. No steps.
- **SubRoformer.** A design listed in MSST, not run, with no reason recorded. No steps.
- **torchaudio HDEMUCS pipelines.** Demucs version 3 inside torchaudio, four stems, no guitar. Whether they run here wasn't checked. No steps.
- **Ultimate Vocal Remover GUI (UVR5).** A desktop app. Its model families ran here through audio-separator. No steps.
- **ZeroSep.** It runs text-guided diffusion models (AudioLDM, AudioLDM2 or Tango, per its README). Not run, for disk. Steps for me: item 7.
- **ZFTurbo open-source 53-stem model.** Not run. Its release page answers HTTP 403 from the box, so its full file list and any license note weren't read. Its checkpoint is 1,368,919,887 bytes. No steps.

Datasets, none downloaded:

- **GuitarDuets.** Real and synthesized classical guitar duets, from a paper that adapts Demucs to separate two guitars that sound alike. No steps.
- **MoisesDB.** 240 songs from 47 artists, with stems beyond the usual four. No steps.
- **MUSDB18.** 150 songs with four stems, drums, bass, other and vocals, compressed. No steps.
- **MUSDB18-HQ.** The same 150 songs as uncompressed WAV. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| adityalakhani/htdemucs-6s-guitar-ft | ran in my agents' script on Demucs 4.1.0 (MIT) | Apache-2.0 (model card). The card calls the base htdemucs_6s weights MIT, while Demucs's maintainer writes that their license isn't clear | MoisesDB v0.1, 216 songs for training and 24 for validation. MoisesDB's loader repository is CC BY-NC-SA 4.0, and its download page says `MoisesDB is offered free of charge for non-commercial research use only and includes baseline performance results for two publicly available source separation methods.` ([source](https://music.ai/research/)) |
| audio-separator | MIT | no license per model in its lists. UVR's README asks apps that use its models to credit UVR ([source](https://raw.githubusercontent.com/Anjok07/ultimatevocalremovergui/master/README.md)) | not stated per model |
| barvarvara/demucs-guitar-lora | loaded by Demucs's code (MIT) | MIT (model card) | not stated on the card |
| becruily Mel-Band RoFormer guitar | ran in MSST (MIT) | no license tag and no model card | not stated |
| BS-RoFormer-SW | ran in audio-separator and MSST (MIT) | none stated. Its current host's card says `license: unknown`, and copies carry `unknown`, `mit` or `other`. The bs-roformer-infer README says `Do not treat this package's MIT code license as a grant for commercial use of this checkpoint.` ([source](https://github.com/openmirlab/bs-roformer-infer)) | not stated |
| Demucs | MIT | Its maintainer's README says `The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.` and `The 6 source variant of htdemucs was trained only on Meta internal dataset, which likely means CC-NC-BY license is applicable, as it was the case for all models released by FAIR.` ([source](https://raw.githubusercontent.com/adefossez/demucs/main/README.md)) | htdemucs: MUSDB HQ plus 800 more songs. MUSDB18-HQ's terms: `MUSDBHQ: is provided for educational purposes only and the material contained in them should not be used for any commercial purpose without the express permission of the copyright holders:` ([source](https://zenodo.org/records/3338373)). htdemucs_6s: Meta's internal dataset |
| demucs-onnx | MIT | StemSplit's ONNX copies are tagged `license:mit`, the converter's statement. The weights are Meta's, as for Demucs | as Demucs htdemucs_6s |
| demucs.cpp | MIT | the ggml file's host, `Retrobear/demucs.cpp`, is tagged `license: mit`. The weights are Meta's, as for Demucs | as Demucs htdemucs_6s |
| librosa | ISC | none, no trained model | none |
| MDX-Net | MIT (KUIELab's mdx-net) | trained by UVR's developers, no license per model | not stated |
| MDX23C | MIT (KUIELab's sdx23) | weights by ZFTurbo per UVR's README, no license per model | not stated |
| MSST | MIT | no license per checkpoint in its list | named for some checkpoints only |
| Open-Unmix | MIT | umxhq: MIT (Zenodo license id). umxl: `__Note, that the weights are only licensed for non-commercial use (CC BY-NC-SA 4.0).__` ([source](https://raw.githubusercontent.com/sigsep/open-unmix-pytorch/master/README.md)) | umxhq: MUSDB18-HQ, under the terms quoted for Demucs. umxl: a private dataset of compressed stems |
| SCNet Small | MIT (SCNet and MSST) | not stated in MSST's list, not verified | not stated for this checkpoint in MSST's list, and its file names say `musdb18` |
| Spleeter | MIT | MIT, per its paper | Deezer's internal datasets, not released |
| VR Architecture | MIT (tsurumeso's vocal-remover) | trained by UVR's developers, no license per model | not stated |

Every clause, quoted with its link and the date it was read, is in [`survey.md`](https://github.com/aaronorelup/blog/blob/main/docs/guitar-tab-research/lanes/source-separation/survey.md).

</details>

<!-- IMAGES -->
None. This lane's `samples/` folder holds JSON, YAML and text files only, no pictures, so the section has no `<ao-compare>` block and nothing was written under `/home/user/blog/public/media/guitar-tab-tools/`.

<!-- PENDING MEDIA -->
All ten checked present at 01:12 UTC on 2026-11-11. All are 44.1 kHz stereo WAV. R2 is an excerpt of Josh Woodward's "I Want to Destroy Something Beautiful", CC BY 4.0, so a caption on an R2 stem must credit him.

1. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S4/guitar.wav`: Demucs htdemucs_6s guitar stem of S4, the synthesized band (r0021). It holds 0.358 of the true guitar. 38.741 s, 16-bit, 6,834,024 bytes.
2. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S4/piano.wav`: the piano stem of the same run (r0021), which holds 0.232 of the true guitar. 38.741 s, 16-bit, 6,834,024 bytes.
3. `/home/user/gtr/lanes/source-separation/out/htdemucs/S4/other.wav`: Demucs htdemucs `other` stem of S4 (r0019), which holds 0.883 of the true guitar and 0.456 of the lead line. 38.741 s, 16-bit, 6,834,024 bytes.
4. `/home/user/gtr/lanes/source-separation/out/htdemucs-6s-guitar-ft/S4/guitar.wav`: the guitar fine-tune's guitar stem of S4 (r0636), which holds 0.898 of the true guitar. 38.741 s, 24-bit, 10,251,014 bytes.
5. `/home/user/gtr/lanes/source-separation/out/uvr/BS-Roformer-SW/S4_0-10s/guitar.wav`: BS-RoFormer-SW guitar stem of the first 10 s of S4, through audio-separator (r0489), which holds 0.939 of the true guitar. 10.000 s, 16-bit, 1,764,078 bytes.
6. `/home/user/gtr/lanes/source-separation/out/msst-becruily-guitar/S4/Guitar.wav`: becruily Mel-Band RoFormer guitar stem of S4 through MSST (r0491), at -39.19 dBFS, holding 0.0773 of the true guitar. 38.741 s, 32-bit float, 13,668,048 bytes.
7. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S2s/piano.wav`: Demucs htdemucs_6s piano stem of S2s, the synthesized steel-string guitar alone, where the guitar went (r0099, -19.06 dBFS). 29.357 s, 16-bit, 5,178,644 bytes.
8. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/R2/guitar.wav`: Demucs htdemucs_6s guitar stem of R2, the real band song (r0428, -19.36 dBFS). 36.000 s, 16-bit, 6,350,444 bytes. Credit Josh Woodward.
9. `/home/user/gtr/lanes/source-separation/out/htdemucs-6s-guitar-ft/R2/guitar.wav`: the guitar fine-tune's guitar stem of R2 (r0637, -18.80 dBFS). 36.000 s, 24-bit, 9,525,644 bytes. Credit Josh Woodward.
10. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S6taps/drums.wav`: Demucs htdemucs_6s drums stem of S6taps, whose 32 onsets each fell within 50 ms of one of the 32 taps (r0054, e0928). 29.357 s, 16-bit, 5,178,644 bytes.

<!-- NUMBERS -->
Counts and clips (RUNDOWN, SECTION, block intros)
- 64 entries in tools.json: 60 tools, models and services (research-model 26, open-source 18, library 9, api 4, commercial-app 3) plus 4 datasets (GuitarDuets, MoisesDB, MUSDB18, MUSDB18-HQ): tools.json `tools[].kind`, file as rewritten at 00:52:13 UTC on 2026-11-11.
- 16 tried, 44 not tried, 0 datasets tried: tools.json `tools[].tried` (00:52 and 01:07 UTC versions, same counts). Sources disagreed earlier: the tools.json of 00:12 UTC marked `adityalakhani/htdemucs-6s-guitar-ft` as not tried and gave the first-round disk reasons for Banquet, AudioSep and Gaborformer. trials.md "Gap round 2" (r0636 to r0644, e1831 to e1835), survey.md tool list row 41 and for-aaron.md item 5 say the fine-tune ran, and the current tools.json agrees. The gap-round text is used.
- 4 models that ran write a guitar stem (htdemucs_6s, BS-RoFormer-SW, becruily Mel-Band RoFormer guitar, the htdemucs_6s guitar fine-tune): trials.md sections for each, survey.md "Models that output a guitar stem". The LoRA writes drums, bass, other, vocals (trials.md, LoRA table).
- "2 of 2 runs" piano: r0099 piano -19.06, guitar -42.15 dBFS and r0525 piano -19.07, guitar -41.72 dBFS, mix -18.23: trials.md Demucs "S2s" bullet and "Verifier re-runs".
- Three real nylon-string recordings into `guitar`, within 0.4 dB of the mix level: r0410 guitar -24.64 (mix -24.58), r0413 -31.32 (-30.97), r0418 -17.86 (-17.83): trials.md "Real solo classical guitar (R3a, R3b, R3c)" table and the sentence under it.
- 163 seconds for the whole song, 228.5 s, htdemucs_6s, 2 cores: r0477 wall 163.00 s, trials.md "Whole song (R2full, 228.5 s)". INPUTS.md row R2full 228.482 s.
- S4 38.741 s ("39-second" in the main read, rounded, and "38.7 seconds" in the details, as trials.md writes "S4 (38.7 s)"), drums, electric bass (GM program 33), strummed steel guitar (program 25), lead on Voice Oohs (program 53) standing in for a singer, true stems drums, bass, guitar, lead: INPUTS.md row S4. 369 strummed-guitar notes: evals.jsonl e0652 `n_truth` 369 with `--voice chord` (INPUTS.md: S4 chord voice = strummed guitar).
- First 10.0 s of S4 (441,000 samples, cut with sox): trials.md "Option checks" and "Media kept outside git".
- S6taps 29.357 s, S2s notes plus 32 GM taps (side stick, acoustic bass drum), true stems guitar and taps, 90 notes: INPUTS.md row S6taps and "S6taps taps". "29.4 seconds": trials.md "S6taps (29.4 s)".
- S2s 29.357 s, steel-string (program 25), no truth stems: INPUTS.md row S2s, trials.md "S2s (one synthesized steel-string guitar, no truth stems)". "29-second" in the main read.
- R2 36.000 s, real band song with singing, artist's instrumental, vocals_derived = song minus instrumental: INPUTS.md row R2. R2full 228.482 s: row R2full. Josh Woodward, "I Want to Destroy Something Beautiful", CC BY 4.0: INPUTS.md row R2.
- R3a, R3b, R3c 18.000 s each, nylon strings, played with the fingers, no ground truth: INPUTS.md rows R3a to R3c and "Caveats".
- 4 processor cores, 2-core slots: ENVIRONMENT.md "Hardware" and "How runs were timed". About 20 agents sharing the box: trials.md header ("The box was shared with about 20 agents throughout"). No cost beyond the cloud session: ENVIRONMENT.md "Cost".
- 16-bit 44.1 kHz stereo inputs: INPUTS.md "How the synthesized clips were made" ("written as 16-bit PCM"), R2/R3 rows and "Sources" (16-bit 44.1 kHz stereo WAV).
- SI-SDR definition (mean removed, target = projection, 10 log10 of target energy over the rest), the four-stem map (`other` = guitar, `vocals` = lead), R2 instrumental sum and `vocals_derived`, projection <est, ref>/<ref, ref> on mono signals: trials.md header paragraph `How stems are scored` and the R2 bullets.
- Basic Pitch takes a WAV path: survey.md "Handoff facts", first line.
- "fingerstyle guitar clips": S2s and S6taps (synthesized fingerstyle, INPUTS.md rows S2s and S6taps) and R3a to R3c (real guitar played with the fingers, INPUTS.md rows R3a to R3c).
- mir_eval next to gtr-eval's own SI-SDR code, the refusal text: trials.md header paragraph on scoring (SI-SDR computed by gtr-eval, SDR / SIR / SAR by mir_eval 0.8.2) and the e1431 row.

adityalakhani/htdemucs-6s-guitar-ft (trials.md "Gap round 2", guitar-ft subsection, not re-checked by a verifier yet. The eval ledger and samples/htdemucs-6s-guitar-ft/stemfacts_*.json give the same values)
- epoch 60, 27,414,996 parameters, same as stock htdemucs_6s: trials.md "Download" bullet.
- `demucs==4.0.1` pin, Demucs 4.1.0 used, `get_model("htdemucs_6s")`, `apply_model(..., shifts=1, segment=7.8, overlap=0.25)`, clamp [-1, 1], PCM_24, seed 0, stock control: trials.md "How it was run".
- S4 guitar 6.10 (e1831), stock 1.73 (e1832). Projections 0.898, 0.121 bass, 0.147 drums, 0.161 lead, stock 0.345 / 0.218, bass 0.312 (stock 0.7555), drums 0.477 (stock 0.890): trials.md S4 bullet (stemfacts: 0.8977, 0.1207, 0.1466, 0.161, 0.3447, 0.2181, 0.3117, 0.7555, 0.4774, 0.8903).
- S6taps 0.5465 guitar, 0.177 piano, stock 0.0635 and 0.755: trials.md S6taps bullet (e1833, e1834).
- S2s piano -24.55, guitar -36.63, mix -18.23 dBFS: trials.md S2s bullet.
- R2 instrumental 6.78, vocals 13.21 (e1835). 40 of 3,175,200 samples at full scale: trials.md "Output format".
- Times r0636 25.98 s / 1,606.5 MB, r0637 31.66 s, r0640 22.45 s, r0642 22.28 s, r0638 32.37 s: trials.md table and runs.jsonl.
- `--checkpoint`, `--device auto|cuda|cpu`, `--shifts`, `--overlap`: trials.md "Constraint inputs". Steps item 5: for-aaron.md item 5.
- These evals ran on gtr-eval 0.12.0, the first round's on 0.11.1: trials.md "Output format".

audio-separator
- 0.48.0, command, `--normalization 0.9` default: trials.md audio-separator "Runs". 169 entries, VR 29, MDX 39, Demucs 4, MDXC 97, `htdemucs_6s.yaml`, `BS-Roformer-SW.ckpt` YAML with guitar: trials.md "Model catalogue".
- htdemucs_6s through it on S4: 9.05 / 7.28 / 1.56 / 7.96 (e1426), guitar 0.329, piano 0.228: trials.md audio-separator table `S4, scored` and "Where the true guitar went". r0490 68.34 s, 1,723.9 MB.
- BS-RoFormer `model_bs_roformer_ep_317_sdr_12.9755.ckpt` default: trials.md "Model catalogue" ("Default model (`--help`)"). r0498 170.47 s, 2,227.5 MB. Instrumental SI-SDR 3.16, `vocals.wav` all zeros, 441,000 x 2 samples, `All the estimated sources should be non-silent ...`: e1431 row and "gtr-eval note".
- 3,895 s extrapolation: trials.md, "r0498: 170.47 x 22.85 = 3,895 s".
- R2 input peak 0.989, stems peak 0.90, S4 not scaled: trials.md "Output format".
- `--single_stem`, ensembles, `--chunk_duration`, `--mdxc_pitch_shift` shifts the pitch: trials.md "Constraint inputs". FLAC CLI default, Basic Pitch takes `.flac`: survey.md "Handoff facts". Item 4: for-aaron.md item 4.

barvarvara/demucs-guitar-lora
- card in Russian, acoustic guitar, no data set named, no stem named: trials.md LoRA "What". 1,974,280 bytes: trials.md "Install".
- `PeftModel.from_pretrained(get_model('htdemucs').models[0], adapter)`, `merge_and_unload()`, `demucs.apply.apply_model`, shifts 1, overlap 0.25: trials.md "Runs".
- e1416 7.80 / 7.86 / 1.94 / 0.93. Projections 0.864 / 0.052 / 0.042, r0019 0.883 / 0.056 / 0.015. S2s drums -48.43 vs -77.25 (r0060). r0529 guitar 2.40 (e1576): trials.md LoRA bullets `S4 scored` and "Verifier re-run".
- r0467 54.93 s / 1,363.8 MB, r0470 71.50 s, r0529 34.82 s: trials.md table, runs.jsonl.

becruily Mel-Band RoFormer guitar
- 45,142,183 bytes, no license tag, no model card (README 404), chunk 485,100 samples, `num_overlap: 2`: trials.md MSST "Checkpoints", survey.md guitar-stem table.
- `mel_band_roformer`, `config_guitar_becruily.yaml`, `becruily_guitar.ckpt`: runs.jsonl r0473 and r0491 `cmd_str`. Command template: trials.md MSST "Runs".
- S4 -39.19 dBFS (mix -17.37), projection 0.0773, e1425 SI-SDR -2.65. First 10 s -51.18 dBFS, 0.0209. S2s -49.83 dBFS (mix -18.23). Not run on R3a to R3c (time): trials.md "becruily guitar, measured".
- r0491 289.53 s / 1,818.9 MB, r0473 87.16 s, r0480 211.79 s, r0547 67.64 s sample-identical: trials.md table and verifier re-run.
- Basic Pitch hand-off: runs.jsonl r0511 (chains lane, inputs include `msst-becruily-guitar/S4/Guitar.wav`), evals.jsonl e1447 (`n_est` 406, `n_truth` 369, `n_matched_onset_only` 229, onset tolerance 0.05 s, pitch tolerance 50 cents per the e0652 definitions).

BS-RoFormer-SW
- 699,412,152 bytes: tools.json version, trials.md "Model catalogue". Trainer not stated: survey.md guitar-stem table (cards quoted there).
- r0489 through audio-separator, r0492 `--model_type bs_roformer` with `BS-Roformer-SW.yaml`: runs.jsonl `cmd_str`.
- e1420 drums 14.06, bass 14.59, guitar 13.60, lead (other) 14.77. Guitar 0.939, lead other 0.923, vocals 0 (-111.73 dBFS): trials.md audio-separator S4 table and "Where the GM Voice Oohs lead went".
- e1427 drums 13.63, bass 14.17, guitar 12.36, lead (other) 13.59, lead 0.910 in other, guitar 0.925: trials.md MSST "BS-RoFormer-SW through MSST".
- -22.70 to -23.21 dB difference relative to audio-separator's files, cause not isolated: same bullet (verifier-corrected text).
- r0489 110.34 s / 2,354.6 MB, r0492 156.64 s / 2,734.0 MB, 2,521 s extrapolation: trials.md tables and "r0489: 110.34 x 22.85 = 2,521 s".

Demucs
- 4.1.0, homepage adefossez/demucs, htdemucs_ft one-hot bag of 4 HTDemucs, mdx_extra 4 HDemucs (v3): trials.md Demucs "What" and model table.
- Command and defaults `--shifts 1`, `--overlap 0.25`, int16, `--clip-mode rescale`: trials.md "Runs, first pass".
- `ModuleNotFoundError: No module named 'numpy'`, numpy listed only for macOS on x86_64: trials.md "Install" (verifier-corrected wording).
- e0073 9.09 / 7.65 / 2.45 / 1.79, e0074 9.78 / 8.51 / 4.65 / 4.97, e0075 8.91 / 5.67 / 3.69 / 6.58, e0095 8.99 / 7.40 / 1.89 / 7.94: trials.md Demucs bullet `S4, scored`.
- Guitar in other 0.883 / 0.897 / 0.870, htdemucs_6s 0.358 / 0.232 / 0.093 / 0.001. Lead in vocals 0.522 / 0.648 / 0.650 / 0.837: trials.md S4 projection paragraph.
- S2s r0099 piano -19.06, guitar -42.15, mix -18.23, r0525 -19.07 / -41.72, htdemucs other -18.24 (r0060): trials.md "S2s" and "Verifier re-runs".
- S6taps htdemucs_6s guitar 0.767 piano, 0.056 guitar, taps 0.790 drums. htdemucs guitar SI-SDR 20.72 (e0116), taps 0.741 in drums, taps SI-SDR 5.67: trials.md S6taps table and paragraph.
- R2 e1398 htdemucs 11.41 / 13.42, e1399 htdemucs_6s 10.77 / 13.42, e1400 htdemucs_ft 10.81 / 13.57, e1401 mdx_extra 11.26 / 13.47: trials.md R2 table.
- r0524 guitar 2.77, lead 2.54 (e1575), random shift: trials.md "Verifier re-runs". r0450 `--two-stems guitar`, guitar SI-SDR 1.61 (e1414): option-check table. `--segment 10` message, r0460 and r0527: option-check table and verifier note. `--mp3` 1,368 more frames, +1105 samples: "MP3 output". -0.09 dBFS peaks, rescale: "Clipping guard".
- Times r0019 38.86 / 1,253.6, r0021 36.37 / 1,349.6, r0029 131.84 / 1,825.4, r0049 114.44 / 3,909.8, r0472 255.55 / 1,798.0, r0477 163.00 / 2,163.8: trials.md tables, runs.jsonl.
- Max segment 7.8 for Transformer models: trials.md model table and r0460 message.
- Onset hand-off e0919 34 onsets, 31 of 32 matched, e0928 32 and 32: trials.md handoff table, evals.jsonl `counts`.
- Basic Pitch hand-off: runs.jsonl r0243 (audio-to-notes lane, inputs `htdemucs_6s/S4/guitar.wav` and `htdemucs_6s/S6taps/guitar.wav`), evals.jsonl e0652 (`n_est` 342, `n_truth` 369, `n_matched_onset_only` 233, definition `onset_tolerance=0.05`, `pitch_tolerance=50.0`) and e0660 (`n_est` 96, `n_truth` 90, matched 41).
- Fingerstyle comparisons e0161 to e0170: trials.md "Stems available for other lanes" and evals.jsonl argv (bass, melody and taps references).
- 4-core whole-song runs: r0660 htdemucs_6s 109.55 s, r0659 htdemucs 263.90 s, r0669 htdemucs 363.56 s, second 2-core htdemucs run r0677 277.63 s, other processes an average of 1.7 CPUs (r0669) and 2.5 CPUs (r0677), about twice the CPU time (684.6 and 819.0 s against 347.1 and 356.8 s), cause not isolated: trials.md "Gap round 2", subsection "Demucs 4.1.0 on the whole song R2full with all 4 cores", added at 01:07 UTC on 2026-11-11 and not yet re-checked by a verifier. Sources disagreed until then: the trials.md header said "no 4-core (`--all-cores`) run was made", and it now carries the gap-round correction. The main read keeps the 2-core figure (163 seconds, r0477).

demucs-onnx
- 0.3.4, command, `htdemucs_6s_fp16weights.onnx` 136,428,532 bytes: trials.md demucs-onnx "Install" and "Run".
- 6 stems, PCM_16, 6,834,024 bytes each: "Output". e1417 8.91 / 7.48 / 1.04 / 6.87, guitar 0.303, piano 0.273, vocals 0.091: demucs-onnx bullet `S4 scored`.
- No random shift, re-runs sample-identical: verifier correction in the demucs-onnx bullet `S4 scored`, "Verifier re-run of r0471", gap round 2 "Output" (r0610 and r0612 identical to r0471).
- r0471 56.27 s not a 2-core figure, r0612 61.33 s with 2 threads, ORT threads on CPUs outside the slot in r0610: trials.md "Gap round 2", ONNX Runtime threads table. Peak 6,204.5 MB (r0471) vs 1,349.6 MB (r0021): "Run".
- Options `--model`, `--stem` / `--stems`, `--precision fp32|fp16weights`, `--providers auto|cpu|coreml|cuda|dml|wasm`: "Constraint inputs". `browser.py`, not tested: "NOT RUN HERE", "Demucs in the browser".

demucs.cpp
- commit 4edae49, ggml weights 54,855,129 bytes: trials.md demucs.cpp "What" and "Get and build".
- First build error text and `-march=native` / `-mavx512fp16`: "First build failed" (r0466, exit 2). Wrapper `-mno-avx512fp16`, r0507 113.27 s: "Second build worked".
- `demucs_mt.cpp.main <ggml-model-htdemucs-6s-f16.bin> <clip>.wav <out dir> 2`: "Runs".
- e1446 8.91 / 7.16 / 0.02 / 8.06, guitar 0.286, piano 0.277, vocals 0.093: demucs.cpp bullet `S4 scored`. r0541 sample-identical to r0508: verifier re-run.
- r0509 132.69 s / 3,596.6 MB, r0508 66.36 s, r0021 36.37 s / 1,349.6 MB: tables.

librosa HPSS
- 1.0.0, `librosa.effects.hpss(y)`, kernel_size 31, power 2.0, margin 1.0, `margin=3.0`, `margin=(1.0, 5.0)`, onset_detect defaults: trials.md HPSS "Runs".
- Float32 output, margin 1 parts add up (residual -143.18 dB): "Output format".
- e0811 guitar 15.53 / taps 0.34, e0858 8.62 / 3.86, e0893 15.53 / 3.21: HPSS table `S6taps, scored`.
- 53 onsets, 32 of 32 matched, e0815, e0862, e0896: handoff table, evals.jsonl e0815 `counts`. S2s 48 onsets: "S2s (one guitar, no taps)".
- r0262 72.47 s, r0268 53.56 s, unpinned, 1 thread. r0530 19.60 s, 559.2 MB, sample-identical: run table and verifier re-run.
- Chains hand-off: runs.jsonl r0511 (inputs `hpss/S6taps/default/harmonic.wav`, `hpss/S2s/default/harmonic.wav`) and r0540 (chain B, HPSS percussive onsets).

MDX-Net
- `UVR-MDX-NET-Inst_HQ_3.onnx` 66,759,214 bytes, KUIELab's MDX 2021 code: trials.md "Model catalogue" file sizes, survey.md audio-separator "Model families".
- e1422 instrumental 3.18, lead -3.16, vocals 0.169, instrumental 0.808. e1439 R2 12.58 / 14.40: trials.md audio-separator.
- r0487 86.42 s, r0503 76.06 s not 2-core figures, r0619 66.38 s / 3,166.6 MB with 2 threads: trials.md gap round 2 correction and table.

MDX23C
- 448,101,203 bytes, TFC-TDF-Net v3, SDX 2023, ZFTurbo weights per UVR README: trials.md "Model catalogue", survey.md.
- e1429 instrumental 3.17, lead -10.35, vocals 0.0019, -67.52 dBFS: trials.md audio-separator.
- r0496 502.83 s / 2,230.6 MB, 11,490 s, about 3.2 hours: trials.md table and extrapolation.

MSST
- PyPI `msst` 0.1.0, refusal of the clone's `inference.py` (trial agent's report, no log), `--no-deps`, torch 2.15.0, declared `torch<2.12,>=2.0.1`: trials.md MSST "Install".
- Command template, float32 output, `<store_dir>/<input file stem>/<instrument>.wav`: "Runs", "Output format".
- `Separator` returns NumPy arrays, librosa HPSS takes them: survey.md "Handoff facts".

Open-Unmix
- 1.3.0, command, `ImportError: TorchCodec ...` (r0051): trials.md Open-Unmix.
- e0076 3.58 / 2.58 / -1.99 / -39.95, e0371 4.31 / 5.02 / -0.88 / -27.53. Lead in other 0.9805 / 0.9053, vocals 0.0001 / 0.0008, vocals stem -66.97 / -55.89 dBFS. Guitar in other 0.8502 / 0.8886: "S4" bullet.
- e0389 guitar 17.89, taps 2.71: "S6taps". e0397 9.72 / 11.76, e0398 10.76 / 12.73: "R2".
- r0085 28.82 s / 1,617.1 MB, r0101 127.36 s / 1,991.2 MB, r0539 19.54 s sample-identical: run table and verifier re-run.
- e0934 82 onsets, 32 of 32: handoff table and evals.jsonl. e0950, e0965: trials.md "Stems available for other lanes", evals.jsonl argv.

SCNet Small
- ICASSP 2024: survey.md SCNet. `scnet_checkpoint_musdb18.ckpt` 42,434,986 bytes, `chunk_size: 485100`, `num_overlap: 4`: trials.md SCNet "Install".
- Command: trials.md SCNet "Runs" (copied as written there).
- e1596 9.61 / 7.27 / 2.23 / 2.45, lead other 0.504, vocals 0.470, guitar other 0.884. e1597 21.73 / 7.57: "S4", "S6taps". Warning text: "Runs".
- r0559 109.10 s / 3,372.2 MB, r0560 98.94 s: table.
- e1595 47 onsets, 32 of 32: "S6taps" bullet and evals.jsonl.

Spleeter
- 2.4.2, 2/4/5 stems, 5 adds piano, no guitar: trials.md Spleeter, survey.md Spleeter. `tensorflow==2.12.1` pin, 585.9 MB wheel, `tensorflow-cpu==2.12.1` used: "Install". 600 s default: "Input facts".
- Command: "Runs". e1394 3.75 / 2.74 / -1.40 / -8.20, lead other 0.8668, vocals 0.1115, guitar other 0.8571. e1395 21.79 / 7.93. e1396 10.62 / 12.54.
- r0419 21.46 s / 1,808.9 MB, r0421 14.47 s, r0422 12.88 s. Not re-run by the verifier (200 MB notice): "Not re-run by the verifier".
- e1397 75 onsets, 32 of 32 (evals.jsonl `n_est` 75, `n_matched` 32).

VR Architecture
- `1_HP-UVR.pth` 126,792,647 bytes: trials.md "Model catalogue". 463 frames short on S4 (1,708,032 vs 1,708,495), 400 on R2, lag 0: "Output format".
- e1421 7.54 / 4.72, vocals 0.516, instrumental 0.470. e1435 10.96 / 12.98.
- r0481 109.83 s / 2,198.2 MB, r0502 88.22 s, r0531 84.6 s sample-identical.

What didn't run (tools.json `not_run_reason` and `for_aaron`, 00:52 version, with trials.md "Tools NOT RUN HERE" and "Gap round 2", survey.md and for-aaron.md)
- 6.2 to 7.2 GB free, 200 MB notice: trials.md "Tools NOT RUN HERE" opening. 4 GB floor: trials.md "Gap round 2" opening and AudioSep subsection. Refusal text `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].`: trials.md Gaborformer and Banquet subsections (two refusals in the gap round).
- AudioSep 1.26 GB and 2.35 GB, about 3,950 MB left: for-aaron.md item 2, trials.md AudioSep subsection. Item 2.
- Banquet `python train.py inference_byoq` refused, 552 MB, 342 MB query model: for-aaron.md item 3, trials.md Banquet subsection. Item 3.
- demucs-rs README quote: tools.json `not_run_reason`, survey.md demucs-rs. Item 6.
- Dynamic Band Splitting `music, sfx, speech`: survey.md "Not covered".
- free-music-demixer quotes: survey.md free-music-demixer.
- Gaborformer no PyPI package (HTTP 404), install refused: trials.md Gaborformer subsection. Item 8.
- MuS3D 19.2 GB, `The DiT needs about 10 GB of free memory`: tools.json, trials.md. Item 7.
- nussl `NUSSL IS DEPRECATED`: survey.md "Toolkits and wrappers".
- SAM Audio `gated: manual`, 5.1 GB: tools.json, for-aaron.md item 1.
- SepGen LTX-2.5 22B: survey.md "Not covered".
- ZeroSep AudioLDM, AudioLDM2 or Tango, not run for disk: survey.md ZeroSep, trials.md. Item 7.
- ZFTurbo 53-stem release page 403, 1,368,919,887 bytes: tools.json, survey.md tool list and guitar-stem table.
- MUSDB18 150 songs, four stems, AAC (compressed), MUSDB18-HQ uncompressed: survey.md "MUSDB18 and MUSDB18-HQ".

Licenses (survey.md LICENSE FACTS per tool, tools.json `license`)
- guitar-ft card Apache-2.0, base weights called MIT by the card vs Demucs maintainer: tools.json `unverified` and `license.weights`. MoisesDB v0.1, 216 / 24 songs: survey.md guitar-stem table. MoisesDB LICENSE CC BY-NC-SA 4.0 and the download-page quote: survey.md "MoisesDB".
- audio-separator MIT, no per-model license, UVR credit request: survey.md audio-separator LICENSE FACTS.
- LoRA card `license: mit`: trials.md LoRA "What". becruily no tag, no card: survey.md guitar-stem table.
- BS-RoFormer-SW `license: unknown`, copies `unknown`, `mit`, `other`, bs-roformer-infer quote: survey.md RoFormer table and guitar-stem table. Link: tools.json bs-roformer-infer `url` and BS-RoFormer-SW `training_data` url.
- Demucs MIT and the two README quotes: survey.md Demucs LICENSE FACTS b. MUSDB HQ + 800 songs, htdemucs_6s Meta internal dataset: survey.md Demucs c. MUSDBHQ quote: survey.md datasets section.
- demucs-onnx MIT, StemSplitio `license:mit`: survey.md demucs-onnx. demucs.cpp MIT, Retrobear `license: mit`: survey.md and trials.md demucs.cpp.
- librosa ISC: survey.md librosa HPSS. MDX-Net (KINoAI), MDX23C (IELab@ Korea University), VR (tsurumeso) MIT: survey.md audio-separator "Model families". MSST MIT, no per-checkpoint license: survey.md MSST.
- Open-Unmix MIT, umxhq Zenodo `mit-license`, umxl quote: survey.md Open-Unmix LICENSE FACTS.
- SCNet MIT (starrytong), MSST MIT, checkpoint license UNVERIFIED, training data not stated in `pretrained_models.md`, file names say `musdb18`: trials.md SCNet "License". Sources differ: survey.md (MSST section c and SCNet section) says MSST's list marks its SCNet checkpoints `trained only on MUSDB18HQ`, while the verifier's SCNet section in trials.md says the training data of this checkpoint is not stated there. The verifier's text is used.
- Spleeter MIT, models MIT per `paper.md`, Deezer internal datasets not released: survey.md Spleeter LICENSE FACTS.

Pending media
- Paths, durations, sizes: checked on disk with `stat` and `soxi` on 2026-11-11 (sizes 6,834,024, 10,251,014, 1,764,078, 13,668,048, 5,178,644, 6,350,444, 9,525,644 bytes, durations 38.741383, 10.000000, 29.357143, 36.000000 s). Projections and levels as cited above (r0021, r0019, r0636, r0489, r0491, r0099, r0428 guitar -19.36 dBFS from trials.md R2 table, r0637 guitar -18.80 dBFS from trials.md guitar-ft R2 bullet, r0054 / e0928).
- htdemucs `other` holds 0.456 of the lead: trials.md S4 lead projection (htdemucs other 0.456).
