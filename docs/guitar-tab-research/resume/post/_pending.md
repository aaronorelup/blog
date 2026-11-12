<details><summary>The outputs still to upload, section by section</summary>

**Splitting a song into instruments**

~~~text
All ten checked present at 01:12 UTC on 2026-11-11, and again at 04:30 UTC on 2026-11-12 after the box restarted, with the same sizes and durations. Nothing new to add: the verifier's later re-runs (r0713, r0718, r0719, r0725, r0728) deleted their audio after the checks, and nothing under `out/` is newer than this list. All are 44.1 kHz stereo WAV. R2 is an excerpt of Josh Woodward's "I Want to Destroy Something Beautiful", CC BY 4.0, so a caption on an R2 stem must credit him.

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
~~~

**Turning sound into notes**

~~~text
- `/home/user/gtr/lanes/audio-to-notes/out/sox/S7flat30.plus30c.r0602.wav`: S7flat30 (the S3 chords rendered 30 cents flat) shifted up 30 cents with SoX 14.4.2, run r0602. 24.00 s, 44.1 kHz, 2 channels, 16-bit, 4,233,644 bytes. Exists (checked 2026-11-12, SHA-256 4f54aac7...ed91933b, as `trials.md` "Media kept outside git" records). The file Basic Pitch actually read in run r0319 is the same command's output from the day before, `/home/user/gtr/lanes/audio-to-notes/inputs/S7flat30.plus30c.wav` (24.00 s, 4,233,644 bytes, also present on 2026-11-12 with SHA-256 31f6f3a9...42c42eef as recorded, but under `inputs/`, not `out/`). The two differ only by SoX's dither (at most 2 in 16-bit units).
- No new file since the gap rounds: the verifier's re-run of the same SoX command (run r0691) wrote audio that was deleted afterwards (`trials.md`, "Verification log (verify-gapfill-audio-to-notes, round 2, 2026-11-11)": "the re-run's SoX audio ... were deleted afterwards"), and `/home/user/gtr/lanes/audio-to-notes/verify-gap2/sox/` is empty (checked 2026-11-12). A search of `/home/user/gtr/lanes/audio-to-notes/` for WAV, MP3, FLAC, OGG, M4A, MP4, MOV and WebM files on 2026-11-12 found only the two files above, besides symlinks to the shared inputs.
- Nothing else to hear or watch: no tool in this step wrote audio or video (`trials.md`, "Media kept outside git"). Basic Pitch's `--sonify-midi` was not used. The transcribers wrote MIDI, CSV and NPZ files. The `.wav` entries in `out/onsets-frames/` and `out/crepe-notes/<cfg>/` are symlinks to the shared input clips, not outputs.
~~~

**Chords, beat, key and tuning**

~~~text
None. This lane wrote no audio or video. Checked at 01:21 UTC on 2026-11-11: `/home/user/gtr/lanes/chords-beats-key/out/` holds only 981 `.txt`, 413 `.json`, 130 `.lab`, 11 `.jams` and 1 `.jsonl` files (9.3 MB), with no audio or video file. Checked again at 05:20 UTC on 2026-11-12, after the third round: `out/` holds only 1,031 `.txt`, 425 `.json`, 130 `.lab`, 11 `.jams` and 1 `.jsonl` files (9.6 MB), and a search of the whole `/home/user/gtr/lanes/chords-beats-key/` folder for wav, mp3, flac, ogg, m4a, aif, mp4, webm, mov, avi and gif files finds none. All-In-One's Demucs stems were deleted at the end of each run, as allin1 does by default, and its click-track option (`sonify`) wasn't run. The LiveChord refiner writes text and JSON only, under `out/livechord/` and `out/livechord_cli/`. trials.md, "Media kept outside git", says the same, the gap-round verifier found no audio file left under `out/`, and the third round's verifier found no audio file written by that round. Nothing to add or remove.
~~~

**Choosing the string and fret**

~~~text
None. This lane wrote no audio or video files (trials.md, "Media kept outside git"), and `/home/user/gtr/lanes/guitar-tab/out/` holds no audio or video file (checked 2026-11-10: its folders hold JSON, text, TSV, LilyPond, CSV, GP5, MIDI and PNG files only). Gap round 2 wrote none either (trials.md, same section), and neither `/home/user/gtr/lanes/guitar-tab/gap2/` nor `/home/user/gtr/lanes/guitar-tab/verify-gap2/` holds a file with an audio or video extension (checked 2026-11-12). The 5 PNG files in `gap2/` are images inside the gtrsnipe repository clone, not outputs.
~~~

**Melody, bass and taps from one guitar**

~~~text
All twelve entries' files checked present at 04:37 UTC on 2026-11-12 (the first nine also at 00:02 UTC on 2026-11-11). Float32 files are 44.1 kHz mono, except the libfmp parts (10 to 12), which are 22,050 Hz mono. The others are 16-bit 44.1 kHz stereo.

1. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-hpss/S6taps/m4/percussive.wav`: librosa HPSS percussive part of S6taps at margin 4 (r0031), float32, 29.357 s, 5,178,680 bytes.
2. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-hpss/S6taps/m4/harmonic.wav`: the harmonic part from the same split (r0031), float32, 29.357 s, 5,178,680 bytes.
3. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/libnmfd/S6taps/kam_percussive.wav`: libnmfd KAM percussive part of S6taps (r0238), float32, 29.357 s, 5,178,680 bytes.
4. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/libnmfd/S6taps/nmf_percussive.wav`: libnmfd KAM plus NMFD percussive part with the 0.25 threshold (r0238), float32, 29.357 s, 5,178,680 bytes.
5. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-nmf/S6taps/nmf_k16_oracle_taps.wav`: scikit-learn NMF k = 16 components of S6taps grouped with the answer key (r0296), float32, 29.357 s, 5,178,680 bytes. Any caption must say the grouping used the answer key.
6. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/demucs-real/htdemucs_6s/R3b/bass.wav`: Demucs htdemucs_6s bass stem of R3b, the real home recording (-16.2 dB from the mix) (r0327), 18.000 s, 3,175,244 bytes.
7. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/demucs-real/htdemucs/R3c/drums.wav`: Demucs htdemucs drums stem of R3c, the real lesson video, which has no taps seen in its frames (-42.5 dB from the mix, peak -23.5 dBFS, 55 librosa onsets) (r0330), 18.000 s, 3,175,244 bytes.
8. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap1-RT1/demucs/htdemucs_6s/RT1/drums.wav`: Demucs htdemucs_6s drums stem of RT1, the real recording tagged tapping (-40.0 dB from the mix, 351 librosa onsets, its loudest moments at 0:31.8, 1:05.8, 1:08.4, 1:10.4 and 3:25.8) (r0554), 233.509 s, 41,190,956 bytes. Not listened to. RT1 is CC BY 3.0, so a caption must credit Chris Smuck. These figures are one run's. A second run of the same command (r0571, its stems deleted after the check) gave -37.3 dB, 23 librosa onsets and 7 of 180 peaks above -40 dBFS (0:31.8, 1:05.8, 1:08.3, 1:10.4, 2:00.8, 2:18.8, 3:25.8), so any caption must say the figures differ between two runs of one command.
9. Outside this lane's `out/` folder, the source-separation lane's file: `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S6taps/drums.wav`, Demucs htdemucs_6s drums stem of S6taps (r0054), the one whose librosa onsets were the 32 taps, 29.357 s, 5,178,644 bytes.
10. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta2/percussive.wav`: libfmp `hrps` percussive part of S6taps at beta 2 (r0620), float32, 22,050 Hz, 29.357 s, 2,589,380 bytes. Its onset list starts with the excerpt in the libfmp entry.
11. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta2/residual.wav`: the residual part from the same split (r0620), float32, 22,050 Hz, 29.357 s, 2,589,380 bytes.
12. The other 14 libfmp parts of S6taps (r0620), each float32, 22,050 Hz, 29.357 s, 2,589,380 bytes: `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/{hps_binary,hps_soft}/{harmonic,percussive}.wav`, `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta2/harmonic.wav` and `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta{1.1,4,32}/{harmonic,percussive,residual}.wav`.
~~~

**Reading hands and the fretboard from video**

~~~text
All four exist (checked with ls and ffprobe on 2026-11-10, and again on 2026-11-12: the same byte counts, durations and frame sizes, one H.264 video stream each). H.264, no audio. Gap round 2 made no audio or video: a search of `/home/user/gtr/lanes/video-hands-fretboard/` on 2026-11-12 for mp4, wav, mp3, webm, mov, avi, gif, m4a, flac and ogg files finds nothing dated after 2026-11-10 22:28 UTC, and its capo input C1 is a still JPEG. Nothing to add or remove. Made by drawing run r0227 (R3a_cu, R3a) and by steps `overlay-video_R3b_mediapipe` and `overlay-video_R3c_mediapipe` of group run r0408 (R3b, R3c).

1. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3a_cu_mediapipe_hands.mp4`: R3a_cu with MediaPipe Hand Landmarker's landmarks drawn (output of r0078). 10.01 s, 925,707 bytes, 640x480. CC BY-SA 4.0 derivative.
2. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3a_mediapipe_hands_full.mp4`: R3a full frame with MediaPipe Hand Landmarker's landmarks (output of r0071). Shows the detection on the sheet music in the wide shot. 18.02 s (ffprobe 18.018 s), 927,653 bytes, 640x480. CC BY-SA 4.0 derivative.
3. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3c_mediapipe_hands_960.mp4`: R3c at 960x540 with MediaPipe Hand Landmarker's landmarks on both hands (group C1 output). 18.00 s, 940,447 bytes. R3c is CC BY 3.0, "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb, via Wikimedia Commons.
4. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3b_mediapipe_hands_960.mp4`: R3b at 960x540 with MediaPipe Hand Landmarker's landmarks (group C1 output), where the picking-hand fingers at the left edge are never found. 18.00 s, 1,608,746 bytes. CC0.

Left out: `/home/user/gtr/lanes/video-hands-fretboard/out/sam2/R3a_cu_f150-179.mp4` (1.00 s, 395,005 bytes) is the 30-frame input given to SAM 2.1 video mode, not an output.
~~~

**Showing, editing and playing a tab in the browser**

~~~text
All four files exist (checked 2026-11-10 with ffprobe, and again on 2026-11-12 with the same sizes and durations). Gap round 2 made no audio or video (trials.md, "Files of this round"). All are WAV, 44.1 kHz, 2 channels, 32-bit float, so they need converting for the web. Listed in trials.md, "Media kept outside git".

1. `/home/user/gtr/lanes/web-tab-render/out/alphatab-player/S2n_plain.export.wav`: alphaTab 1.9.0's `api.exportAudio()` of S2n.gp5 with its bundled SONiVOX sound bank, click off (run r0128). The known S2n tab played back by alphaTab. 27.858 s, 9,828,396 bytes.
2. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.plain.wav`: the first 4 s of the same export (run r0328). 4.005 s, 1,413,164 bytes.
3. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.changeTrackTranspositionPitch.wav`: the same 4 s exported after `api.changeTrackTranspositionPitch(tracks, 2)`. Its first melody note measured 195.78 Hz, the same as file 2 (run r0328). 4.005 s, 1,413,164 bytes.
4. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.exportOption.wav`: the same 4 s exported with `trackTranspositionPitches` set to `{0: 2}`. Its first melody note measured 219.75 Hz, two semitones up (run r0328). 4.005 s, 1,413,164 bytes.
~~~

**Metronome and sync in the browser**

~~~text
All checked on 2026-11-12 with `ffprobe` and `stat`: every file exists. All are 44.1 kHz 32-bit float WAV.

1. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_interval_busy100.wav`: the setInterval click track with the page busy, no clip (r0199). Mono, 62.04 s, 10,944,044 bytes.
2. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_lookahead_busy100.wav`: the look-ahead loop's click track with the page busy, no clip (r0199). Mono, 61.96 s, 10,930,220 bytes.
3. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_tone_busy100.wav`: Tone.js's click track with the page busy, no clip (r0199). Mono, 61.93 s, 10,925,100 bytes. The file still holds the recorder's 128-frame slip, so from 17.07 s on its clicks sit 2.902 ms later than played.
4. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_worklet_busy100.wav`: the AudioWorklet click track with the page busy, no clip (r0199). Mono, 62.00 s, 10,936,876 bytes.
5. `/home/user/gtr/lanes/browser-audio-sync/out/sync/sync_s4_element_busy0.wav`: S4 played in an `<audio>` element with clicks booked on its 68 beats, Web Audio (r0150). 2 channels, channel 0 S4 as it arrived in the graph and channel 1 the clicks. 39.40 s, 13,899,820 bytes.
6. `/home/user/gtr/lanes/browser-audio-sync/out/alphatab/S2n_alphatab_live_countin_metronome.wav`: alphaTab 1.9.0's count-in and click while playing `S2n.gp5`, guitar muted (r0269). Mono, 8.41 s, 1,483,820 bytes.
7. `/home/user/gtr/lanes/browser-audio-sync/out/synths/S2n_jssynth.wav`: S2n's 90 notes played by js-synthesizer 1.13.0 with FluidR3_GM (r0225). 2 channels, 32.11 s, 11,328,556 bytes.
8. `/home/user/gtr/lanes/browser-audio-sync/out/synths/S2n_smplr.wav`: S2n's 90 notes played by smplr 1.2.0 with the FluidR3_GM nylon guitar sounds (r0229). 2 channels, 31.18 s, 11,000,876 bytes.
9. `/home/user/gtr/lanes/browser-audio-sync/out/stretch/S1_element_0p75_pp1.wav`: S1 at 0.75x through an `<audio>` element with `preservesPitch` true (r0225). 2 channels, 40.27 s, 14,208,044 bytes.
10. `/home/user/gtr/lanes/browser-audio-sync/out/stretch/S1_element_0p75_pp0.wav`: the same at 0.75x with `preservesPitch` false (r0225). 2 channels, 40.31 s, 14,221,356 bytes.
11. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_drums.wav`: the drums stem htdemucs_6s made of S4_10s in ONNX Runtime Web 1.31.1, 2 threads, graph optimization `disabled` (r0597, gap round 2). 2 channels, 10.00 s, 3,528,044 bytes.
12. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_bass.wav`: the bass stem of the same run (r0597). 2 channels, 10.00 s, 3,528,044 bytes.
13. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_other.wav`: the `other` stem of the same run (r0597), RMS -80.25 dBFS. 2 channels, 10.00 s, 3,528,044 bytes.
14. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_vocals.wav`: the `vocals` stem of the same run, paired with S4's lead line (r0597). 2 channels, 10.00 s, 3,528,044 bytes.
15. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_guitar.wav`: the guitar stem of the same run (r0597). 2 channels, 10.00 s, 3,528,044 bytes.
16. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_piano.wav`: the piano stem of the same run (r0597). 2 channels, 10.00 s, 3,528,044 bytes.

Not listed, also on disk: the 1-thread and 4-thread stem sets in the same folder (`S4_10s_t1_optdisabled_*.wav`, r0613, and `S4_10s_t4_optdisabled_*.wav`, r0607), sample-identical to items 11 to 16. The native demucs-onnx stems of r0596, r0603 and r0611 in `out/htdemucs6s-native/`, `out/htdemucs6s-native-optdisabled/` and `out/htdemucs6s-native-chromiuminput-optdisabled/`, six each, 2 channels, 10.00 s, 3,528,088 bytes each. `out/htdemucs6s-web/S4_10s_decoded_by_chromium.wav`, S4_10s as Chrome decoded it (r0608). S4 was synthesized for the test set. The htdemucs_6s weights' license is in the license table of *Metronome and sync in the browser*.
~~~

**Tools handing off to each other**

~~~text
All three under `/home/user/gtr/lanes/chains/out/chainE/`, checked present on 2026-11-11 with ffprobe. Derived from S4 (synthesized for the test set, see INPUTS.md). alphaTab 1.9.0 made the renders with its bundled SONiVOX SoundFont, `sonivox.sf2` (`scripts/pages/chainE.html` line 26), whose license the web-tab-render survey quotes as `Copyright (c) 2004-2006 Sonic Network Inc. Licensed under the Apache License, Version 2.0` (`web-tab-render/survey.md`, section "SoundFonts used by the web players above"). No credit decision was made here. It is left to the media step. No video was made in this lane.

1. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_alphatab_guitar_only.wav`: alphaTab 1.9.0's `exportAudio` render of the chain A file `S4.madmom.span.gp5` with the metronome at volume 0, the tab from the full-song chain played back at 116 BPM. 37.760 s, 2 channels float32, 44.1 kHz, 13,321,772 bytes (run r0535).
2. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_alphatab_metronome_only.wav`: the same render with the guitar track at volume 0, alphaTab's metronome alone, 73 clicks. 37.760 s, 2 channels float32, 44.1 kHz, 13,321,772 bytes (run r0535).
3. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_capture.wav`: the chain E page's capture, 3 channels: the guitar render, the clicks at madmom's tracked beats, and alphaTab's metronome, all on one `AudioContext` clock. 38.650 s (38.649615), 3 channels float32, 44.1 kHz, 20,453,420 bytes (run r0535).
~~~

**Services an agent can call over the internet**

~~~text
All checked present on the box (sizes and durations from `ls` and ffprobe, matching trials.md "Media kept outside git"). Rechecked 2026-11-12 with `stat` after gap round 2: all nine still present with the same byte sizes. Gap round 2 made no new audio or video (its ffmpeg copies, r0599 and r0600, were deleted after the check, and its Cesure output is JSON: trials.md "Gap round 2"), so nothing was added here. Licenses follow the input: S clips synthesized for this research, R2 CC BY 4.0 ("I Want to Destroy Something Beautiful" by Josh Woodward, credit required), R1c GuitarSet CC BY 4.0 (credit required).

1. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S4_six_stems/stems/guitar.mp3`: ElevenLabs `six_stems_v1` guitar stem of S4 (r0064). MP3 192 kb/s 44.1 kHz stereo, 38.79 s, 931,048 bytes.
2. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S4_six_stems/stems/other.mp3`: ElevenLabs `other` stem of S4, the one the lead line was measured in (r0064). 38.79 s, 931,048 bytes.
3. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/demucs_S4_old/named/other.wav`: Demucs `mdx_extra_q` Space `other` stem of S4, the one the guitar was measured in (r0141). WAV 16-bit 44.1 kHz stereo, 38.74 s, 6,834,024 bytes.
4. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S6taps_six_stems/stems/guitar.mp3`: ElevenLabs guitar stem of S6taps (r0189). 29.39 s, 705,350 bytes.
5. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S6taps_six_stems/stems/drums.mp3`: ElevenLabs drums stem of S6taps, the one the taps were measured in (r0189). 29.39 s, 705,350 bytes.
6. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/R2_six_stems/stems/vocals.mp3`: ElevenLabs vocals stem of R2 (r0194). 36.05 s, 865,219 bytes. Needs the R2 credit.
7. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/R2_six_stems/stems/guitar.mp3`: ElevenLabs guitar stem of R2 (r0194). 36.05 s, 865,219 bytes. Needs the R2 credit.
8. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/beatthis_S4/files/beat-this_audio-with-beats.wav`: Beat This! Space, S4 with its beat clicks mixed in (r0118). WAV, 38.74 s, 6,834,024 bytes.
9. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/beatthis_R1c/files/beat-this_audio-with-beats.wav`: Beat This! Space, R1c with its beat clicks mixed in (r0246). WAV, 28.24 s, 2,490,396 bytes. Needs the GuitarSet credit.
~~~

**Apps that already do some of this**

~~~text
None. No tool in this lane produced audio or video (`trials.md`, "Media kept outside git": "No tool in this lane produced audio or video."). `/home/user/gtr/lanes/apps-survey/out/` holds only `anthemscore-web/` (r0055's error output `explore_S2s/run.out`, and the logs, page captures and PNG screenshots of r0062 in `explore_S2s_b/` and r0226 in `verify_S2s/`) and `clips-mp3/`, which is MP3 copies of the shared input clips made for apps that need MP3, not tool output. If the post wants the input that went in, the uploaded file was the WAV `/home/user/gtr/inputs/S2s/S2s.wav`. Its MP3 copy exists at `/home/user/gtr/lanes/apps-survey/out/clips-mp3/S2s.mp3` (705,977 bytes, 29.388 s by ffprobe, which counts the MP3's encoder delay and padding, checked 2026-11-10). Checked again on 2026-11-11 after gap round 2, which installed and ran no tool and added no ledger run (`trials.md`, "Gap round 2" and the round-2 verification log): `out/` holds the same folders and files, all dated 2026-11-10, `S2s.mp3` is still 705,977 bytes, and no audio, video or image file under `/home/user/gtr/lanes/apps-survey/` is newer than 2026-11-10 23:31 UTC, when this fragment was first written (the 337 newer files are the page copies, headers, error logs, text copies and JSON lookups of gap round 2 and its checker, 210 in `gap2/` and 127 in `verify-gap2/`). Nothing to add or remove.
~~~

</details>
