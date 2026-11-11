<!-- RUNDOWN -->
- **Of 74 entries on my agents' list for this step, 10 sent back results.** Three of the ten were asked for the notes of a 90-note clip I synthesized. Xiaomi's MiMo model returned 29 notes, and 1 of the 90 was among them. Meta's Muse Spark Open returned none. A free demo page running YourMT3, a model that writes down the notes it hears, returned 126, and 79 of the 90 were among them. Sixteen services needed an account or an access key I didn't have.

<!-- SECTION -->
## Services an agent can call over the internet

This step sends the audio to someone else's server through an API, the way one program talks to another, and gets notes, beats or separated instrument tracks back. My agents' list for it has 74 entries, from paid services and free demo pages to models, datasets and code libraries. Ten of them sent back results on 12 of my test clips. Nine of those ten ran on someone else's computers, not on the box, the cloud computer my agents used. Three of the ten were asked for the notes of S2n, a 29-second fingerstyle clip I synthesized so every note is known. It has a bass line played with the thumb and a melody on top. MiMo, an AI model from Xiaomi, returned 29 notes, and 1 of the 90 played notes was among them. Muse Spark Open, a Meta model, returned no notes. A free demo page running YourMT3, a model that writes down the notes it hears, returned 126 notes, and 79 of the 90 were among them. Sixteen services needed an account or an access key I didn't have. None of the transcription or track-splitting request formats my agents read has a field for capo, tuning, the song's key or its tempo. A capo is a clamp across the strings that raises every note.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/hosted-apis-beatthis-s4.webp" alt="Two rows of tick marks over a 0 to 38 second axis. The top row, Played, has 68 cream ticks starting after a shaded silent first bar, with a tall tick every fourth beat. The bottom row, the demo page's answer, has 68 blue ticks at the same spacing. Its first three sit inside the shaded silent bar and its last one comes about 1.5 seconds before the top row's last."><figcaption><b><code>Beat This!</code> on S4</b><span class="ao-meta">S4, a band mix I synthesized. Its 68 played beats on top, the 68 the demo page returned below.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/hosted-apis-mimo-s3-chords.webp" alt="Three rows of labelled boxes over a 0 to 24 second axis. Played: none, G, Em, Am7, D7, G, Em, C, D7, G, most boxes 2.5 seconds long. Answer 1: G, Em, C, D, G, Em, C, D, G, G, starting at 0 seconds. Answer 2: none, G, Em, Am7, D7, G, Em, C, D7, G, most boxes 2.3 seconds long."><figcaption><b>MiMo's chords for S3, asked twice</b><span class="ao-meta">S3, 24 seconds of strummed chords I synthesized. The second answer came back for the exact same request.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/hosted-apis-mimo-s2n-notes.webp" alt="A piano roll of S2n, time from 0 to 29 seconds across, pitch from below C3 to above C6 up the side. Cream outlines mark the 90 played notes from about 2 seconds to the end. MiMo's 29 notes are violet bars, all before 8.5 seconds, and notes of the same pitch that overlap share one bar. Six bars, holding eight notes, start before the first played note."><figcaption><b>MiMo's notes for S2n</b><span class="ao-meta">S2n, a fingerstyle clip I synthesized. Played notes outlined, MiMo's filled.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/hosted-apis-yourmt3-s2n-notes.webp" alt="The same piano roll with YourMT3's 126 notes as filled bars in three colors, one per MIDI track: Acoustic Piano 15, Electric Piano 58 and a guitar track 53. Filled bars sit in or beside the cream outlines of the played notes through the whole clip, and nine orange notes, drawn as seven bars, sit around C6, above every played note."><figcaption><b>YourMT3's notes for S2n</b><span class="ao-meta">The CPU demo page's MIDI file, a list of notes with start times. Played notes outlined, one color per track.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Nine of these ran on the provider's hardware. So for them there's no time on 2 of the box's cores and no memory figure, only the round trip from sending the file to having the whole answer. For every note count below, a played note is among the returned notes when one of them starts within 50 ms of it and sits within 50 cents of its pitch. A cent is a hundredth of a semitone, and a semitone is one fret.

**`Beat This!`, on the Hugging Face Space `teamup-tech/Beat-This`** ([Space](https://huggingface.co/spaces/teamup-tech/Beat-This)). A beat and downbeat tracker (a downbeat is the first beat of a bar). A Space is a demo page that runs a model on Hugging Face's servers. The Space's code, `app.py`, runs `beat_this.inference.File2Beats` with the saved model file `final0.ckpt` and `dbn=False`. That's the code as of commit `8f2aa339`, a saved version of the Space.

- In: S4 as a stereo WAV, `S4.wav`. It's a 38.7-second band mix I synthesized, with drums, bass, strummed guitar and a lead line. Also R1c as `R1c.wav`, 28 seconds of a real bossa nova guitar take from the GuitarSet dataset, which comes with its notes annotated.
- Command or settings: endpoint `/process`, the address on the Space that a program calls. It was called with `gradio_client` 2.7.2, a Python library for calling Spaces, and no Hugging Face access token (`scripts/hf_space_call.py`). The audio file is the only input.
- Out: a WAV of the input with clicks mixed in, and a `pyharp.LabelList` of labels `beat` or `downbeat`, each with a time `t` in seconds. On S4 it returned 68 beats, 18 of them downbeats. 65 of the 68 landed within 70 ms of one of the clip's 68 played beats, a median 12.4 ms after them, and all 17 played downbeats were matched (e0160). Its first beats were at 0.52, 1.06 and 1.56 seconds. The first played beat is at 2.069 seconds, after a silent bar. On R1c it returned 56 beats, all 56 within 70 ms of the 56 annotated ones, and 14 of 14 downbeats (e0693).
- Time: ran on the Space's `cpu-basic` hardware. Round trip 12.59 s for S4 (r0118) and 5.69 s for R1c (r0246). The verifier's re-run on S4 (r0308, 6.89 s) returned the same 68 beat times and the same click WAV, byte for byte. Free.
- Takes as a hint: none.
- Hands off to: not tried. Soundslice, a player that shows music notation and tab in sync with a recording, lines the two up with sync points. Its docs give a sync point as `[zero_based_bar, time_in_seconds, optional_position_0_to_480]`, so downbeat times give one sync point per bar.

**`bytedance/seed-2.1-turbo`, through the Vercel AI Gateway** ([gateway](https://vercel.com/docs/ai-gateway)). A ByteDance model. The gateway is a router that reaches many AI model providers with one key, and its catalog lists this model with input `text, image, video`. My gateway key is on the free tier, which allowed this model.

- In: R3a, an 18-second excerpt of a real classical guitar concert video. It went in first as the MP4 file, then as 18 JPEG frames, one per second. The frames were made on the box with ffmpeg, an audio and video tool, using `ffmpeg -vf fps=1 -q:v 3`.
- Command or settings: a Chat Completions request, the chat format the gateway takes, to `https://ai-gateway.vercel.sh/v1`. Each frame went in as an `image_url` part after a label, `Frame at t = <k>.0 s:`, then the video prompt. My agents asked for the answer as JSON, a structured text format, in a layout set by a schema. A schema is the list of fields the answer has to fill. This model lists no `response_format` setting, which carried the schema for the other models, so the schema went into the prompt text (`scripts/gateway_frames_trial.py` with `--schema-in-prompt`). `max_tokens` was 16384, a cap on the tokens it may write. A token is the unit these models read, write and charge by.
- Out: the MP4 was refused before running, HTTP 400 `'file part media type video/mp4' functionality not supported.` (r0086). From the frames it answered `capo` `no`, `tuning` `cannot_tell`, and three spans, 0-6.5, 6.5-14.5 and 14.5-17 s (r0127). In each span the fretting hand, the one pressing the strings, is visible and its frets are `null`, meaning no value. R3a has no list of what was really played to count against.
- Time: ran on the provider `bytedance`. Round trip 166.0 s (r0127). It read 23,707 tokens and wrote 11,146, and 10,715 of those were its reasoning before the answer. The call cost 0.0397185 USD.
- Takes as a hint: only what's written in the prompt.
- Hands off to: not tried. The answer is a JSON string inside the chat reply.

**Demucs `mdx_extra_q`, on the Hugging Face Space `nakas/demucs_playground`** ([Space](https://huggingface.co/spaces/nakas/demucs_playground), [Demucs](https://github.com/adefossez/demucs)). A stem splitter. A stem is one instrument's track pulled out of a mix. The Space's `app.py` runs `python3 -m demucs.separate -n mdx_extra_q -d cpu test.wav -o out`, at Space commit `d924a6d3`. It makes four stems and has no guitar stem.

- In: S4 as a stereo WAV, `S4.wav`.
- Command or settings: endpoint `/predict`. With `gradio_client` 2.7.2 the call stopped at `ValueError('Unknown protocol: ws')` (r0119), because the Space runs version 3 of Gradio, the interface a program calls on these demo pages. With `gradio_client` 0.5.3 it went through (r0141, `scripts/hf_space_call_old.py`).
- Out: four WAV files, `vocals`, `bass`, `drums` and `other`, in the same format as the input and exactly as long. My agents measured each against S4's true tracks as SI-SDR, a figure in decibels (dB) for how much of a stem is the true instrument against everything else in it. A higher number means less of anything else. Drums 8.49 dB, bass 5.29 dB, and the lead line 6.37 dB, measured in `vocals`. There's no guitar stem, so the guitar was measured in `other`, at 2.94 dB (e0360). The verifier's re-run (r0322) came back with four files of the same size and length, each with different audio from the first run's. They measured 8.46, 5.31, 6.42 and 3.07 dB (e1331).
- Time: ran on the Space's `cpu-basic` hardware. Round trip 172.46 s, with processing from 4.26 to 167.45 s (r0141). The re-run took 155.50 s (r0322). Free.
- Takes as a hint: none.
- Hands off to: not tried. The Space returns four WAV file paths.

**ElevenLabs Speech to Text, model `scribe_v3`** ([API spec](https://api.elevenlabs.io/openapi.json)). ElevenLabs' transcription service, used here on sung words.

- In: R2, a 36-second excerpt of a real band song with singing, as `R2.wav`. It's "I Want to Destroy Something Beautiful" by Josh Woodward, shared under CC BY 4.0, a license that allows reuse with credit.
- Command or settings: `scripts/elevenlabs_call.py stt /home/user/gtr/inputs/R2/R2.wav <out> --model scribe_v3`, which sends `POST https://api.elevenlabs.io/v1/speech-to-text` with `timestamps_granularity=word`, `tag_audio_events=true` and `diarize=false`. It sent no `seed` or `temperature`, the settings that steer how random the answer is.
- Out: JSON with the fields `language_code`, `language_probability`, `text`, `words` and `audio_duration_secs`. It gave the language as `eng` with a probability of 0.98 and the length as 36.0 seconds. Each word has a `text`, `start`, `end` and `logprob`. It wrote 32 words, `'Cause I've been trying to find out if an angel bends or breaks. Or shatters like a stone. I want to destroy something beautiful for you. I want to destroy for you.` The verifier sent the same request (r0318) and got `I wanna destroy` in both places where the first answer had `I want to destroy`. R2 has no checked copy of its lyrics, so nothing was counted.
- Time: ran on ElevenLabs' side. Round trip 0.92 s (r0108) and 1.24 s (r0318). 11 credits each time, and the first answer reported the same, `character-cost: 11`. ElevenLabs' API price page lists Scribe v3 at `$0.20` per hour. The dollar price of a credit wasn't verified.
- Takes as a hint: `language_code` and `keyterms`, plus `seed` and `temperature`. ElevenLabs' published API spec ends its note on `seed` with `Determinism is not guaranteed.` Nothing about music.
- Hands off to: not tried. Each word comes with its start and end in seconds.

**ElevenLabs Stem Separation, `six_stems_v1`** ([docs](https://elevenlabs.io/docs/api-reference/music/separate-stems)). ElevenLabs' stem splitter, six stems.

- In: S4 as `S4.wav`, a stereo WAV of 6,834,024 bytes. Also S6taps, the S2n notes on steel strings with drum sounds standing in for taps on the guitar body, and R2, each as a WAV.
- Command or settings: `scripts/elevenlabs_call.py stems /home/user/gtr/inputs/S4/S4.wav <out> --variation six_stems_v1 --format mp3_44100_192`, which sends `POST https://api.elevenlabs.io/v1/music/stem-separation`.
- Out: a ZIP of six stereo MP3 files, `drums.mp3`, `vocals.mp3`, `piano.mp3`, `guitar.mp3`, `bass.mp3` and `other.mp3`. Decoded with ffmpeg 6.1.1, every stem starts 25.06 ms after the input, so my agents cut that off before measuring. They measured SI-SDR against S4's true tracks. The guitar came to 13.70 dB, the drums 13.43 dB, the bass 15.16 dB, and the lead line, measured in `other.mp3`, 15.76 dB (e0057). On S6taps the guitar came to 26.77 dB, and the taps, measured in `drums.mp3`, 13.23 dB (e0391). R2 comes with the artist's own instrumental. `vocals.mp3` measured 15.44 dB against the song minus that instrumental, and the other five stems added together measured 13.59 dB against the instrumental itself (e0426). The verifier's re-run on S4 (r0315) returned the same six MP3s, byte for byte.
- Time: ran on ElevenLabs' side. Round trip 6.98 s for S4 (r0064), 6.10 s for S6taps (r0189) and 6.78 s for R2 (r0194). The account's credit counter went up 1,065, 807 and 990 credits, 27.49 to 27.50 credits per second of audio. The price page lists no rate for stem separation, and the dollar price of a credit wasn't verified.
- Takes as a hint: `stem_variation_id` only, two stems or six. No instrument prompt, no time range.
- Hands off to: tried. The S4 `guitar.mp3`, unchanged, went to the YourMT3 CPU Space, `mimbres/YourMT3-cpu` (r0231), which returned 516 notes. 334 of the 369 notes of the strummed guitar part were among them, a median 23.4 ms after the played notes (e0522). Shifted by the stems' 25.057 ms offset, the median was 1.7 ms before them (e0525).

**MiMo V2.6 Flash, `xiaomi/mimo-v2.6-flash`, through the Vercel AI Gateway** ([gateway](https://vercel.com/docs/ai-gateway)). A Xiaomi model that the gateway's catalog lists with input `text, audio, image, video`. The free tier allowed it. It answers in text, so my agents asked for JSON here too.

- In: the audio clips as mono WAV files. S3, 24 seconds of strummed chords I synthesized, plus S4 and R1c, for chords, tempo and key. S2n for notes. S5capo2, the S2n piece with a capo on fret 2, and S2n for a capo. For tuning, S5dropd, the S2n piece in Drop D, where the lowest string is tuned down to D. Also S7flat30, the S3 chords tuned 30 cents flat, and S2n again. And 18 JPEG frames each, one per second, of R3a, R3b and R3c, three 18-second real guitar videos.
- Command or settings: a Chat Completions request to `https://ai-gateway.vercel.sh/v1`, as for Seed. The audio went in as a `file` part, written out as text in a base64 data URL, with a prompt and a JSON schema in `response_format`. Reasoning stayed at its default settings, and `max_tokens` was 24576, or 16384 for frames. The scripts are `scripts/gateway_trial.py` and `scripts/gateway_frames_trial.py`, and the prompts are in `scripts/prompts/`.
- Out: a chat reply whose `choices[0].message.content` holds the JSON answer.
  - Chords of S3 (r0028): `G Em C D` twice from 0.00 to 19.38 s, then `G` to the end. 99 BPM (beats per minute), G major. The clip has no chord for its first 2.5 s, then `G Em Am7 D7 G Em C D7 G`, at 96 BPM in G major. The answer's chord had the same root as the played chord for 4.6 of the 24 seconds (e0018). A chord's root is the note it's named after. The verifier sent the exact same request again (r0302) and got no chord to 2.5 s, then `G Em Am7 D7 G Em C D7` in 2.3 s steps and `G` from 20.9 s, at 120 BPM in G major. That's the same root for 18.75 of the 24 seconds (e1189).
  - Chords of S4 (r0052): no chord to 4.00 s, then 2-second chords `D A Bm G D A G A Bm G D A G A D A G A`, and a last `D` from 40.00 to 44.50 s in a 38.741 s file. 120 BPM against the clip's 116, and D major, the clip's key. The same root for 22.8 of the 38.7 seconds (e0058).
  - Chords of R1c (r0248): `G D C G C G D C G`, the first and last 3.5 s long and the seven between 3 s each. 84 BPM against the annotated 119, and G major, the annotated key. The same root for 13.4 of the 28.2 seconds (e0696).
  - Notes of S2n (r0076): 29 notes, all between 0.02 and 8.42 s. One of the 90 played notes was among them (e0067). The first played note is at 2.143 s.
  - Capo, the same S5capo2 request three times: fret 2 (r0080), no capo (r0196) and fret 2 (r0203), with the key as A major, A major and B major. The clip has a capo on fret 2 and is in A major. On S2n, which has no capo, it answered no capo and G major (r0182), as in the clip.
  - Tuning: my agents asked for the six open strings as MIDI note numbers, lowest string first. For S5dropd it answered standard tuning, `[40,45,50,55,59,64]`, at -15 cents. The clip is Drop D, `[38,45,50,55,59,64]`, at 0 cents (r0210). For S7flat30 it answered standard at -10 cents, and the clip is standard at -30 cents (r0212). For S2n it answered standard at 0 cents, as in the clip (r0213). All three answers said no capo, as in the clips.
  - Frames, asking about a capo and the frets under the fretting hand. For R3a (r0107) it answered no capo, tuning `cannot_tell`, frets 2-8 from 0 to 6 s, 2-12 from 7 to 14 s and 3-6 from 15 to 17 s. For R3b (r0360), no capo, frets 7-10 at 0-3 s, 1-3 at 4-11 s, none given at 12 s, 7-10 at 13-16 s and 5-7 at 17 s. For R3c (r0391), no capo, frets 1-3 at 0-7 s, 5-8 at 7-10 s, 1-3 at 10-14 s, 5-8 at 14-17 s and 2-4 at 17 s. None of the three videos has a list of what was really played. The written description of my test clips says `No capo.` for R3b and R3c. It describes R3b at 9 s with `frets 2-4 under the fingers` and R3c at 10 s with `the hand is near the nut`. Two answers each broke the requested layout in one field. R3b gave `visible` as the string `"yes"`, and R3c put the tuning under `value`.
  - The MP4 of R3a was refused before running, HTTP 400 `'file part media type video/mp4' functionality not supported.` (r0077), and so was the gateway's other endpoint, Responses, with an `input_video` part (r0098).
- Time: ran on the provider `xiaomi`. Round trips from 12.9 s (r0080) to 163.6 s (r0107). From 0.00009576 USD (r0080) to 0.00754432 USD (r0360) a call. The catalog price is 0.00000014 USD per input token and 0.00000028 USD per output token.
- Takes as a hint: only what's written in the prompt, plus `reasoning.effort` and the provider choice, `providerOptions.gateway.only` or `order`.
- Hands off to: not tried.

**Muse Spark Open, `meta/muse-spark-open`, through the Vercel AI Gateway** ([gateway](https://vercel.com/docs/ai-gateway)). A Meta model. The gateway's catalog lists it with input `text, audio, image, video`. Five providers run it, baseten, fireworks, modal, nebius and togetherai. The free tier allowed it.

- In: S3 and S4 for chords, S2n for notes and S5capo2 for a capo, as WAV. R3a as the MP4, then as the 18 frames.
- Command or settings: the same prompts, schemas and settings as MiMo. Some calls named one provider with `providerOptions.gateway.only`.
- Out:
  - Chords of S3 through baseten (r0024): one entry, `N` (no chord) from 0.0 to 0.0 s, 107 BPM, D minor. Its reasoning text begins `We have audio recording but we cannot hear it? The message shows musical notes characters but no actual audio file provided.` The same root as the played chord for 2.5 of the 24 seconds, the silent start (e0064).
  - The same through fireworks (r0034): HTTP 400, `Extra inputs are not permitted, field: 'messages[0].content.list[...][0].input_audio'`.
  - The same through togetherai (r0036): no chord to 2.10 s, then `Eb Bb Cm Ab` over and over up to 37.15 s in a 24.0 s file, 110 BPM, Eb major. The same root for 2.1 of the 24 seconds (e0061).
  - Chords of S4 through togetherai (r0041): every field was the string `TOO_MANY_TOKENS`.
  - Notes of S2n through togetherai (r0082): `{"recording_secs": 0, "notes": []}`, no notes (e0068).
  - Capo of S5capo2 through togetherai (r0084): no capo and C minor. The clip has a capo on fret 2 and is in A major.
  - R3a as MP4 was refused by all five providers with the same HTTP 400 as MiMo (r0083, and the verifier's r0303 and r0304). From the frames through fireworks (r0129): no capo, tuning `cannot_tell`, frets `null` in all three spans, with a note on 7-15 s, `approx. 2nd-7th fret region`.
- Time: ran on the providers' side. Round trips from 1.76 s (r0084) to 9.84 s (r0129) for the calls that answered. From 0.00080705 USD (r0082) to 0.01514875 USD (r0129) a call. The catalog price is 0.00000125 USD per input token and 0.00000425 USD per output token.
- Takes as a hint: only what's written in the prompt, plus the provider choice.
- Hands off to: not tried.

**xAI Speech to Text, model `grok-voice-transcribe-2.0`** ([docs](https://docs.x.ai/developers/model-capabilities/audio/speech-to-text)). xAI's transcription service.

- In: R2 as `R2.wav`.
- Command or settings: `scripts/xai_stt.py /home/user/gtr/inputs/R2/R2.wav <out> en`, which sends `POST https://api.x.ai/v1/stt` with `language=en`.
- Out: JSON with `text`, `duration` (36.0) and 30 `words`, each with `start` and `end`. The text reads `Cause I've been trying to find out if an angel bends or breaks. All shadows like a stone. I wanna destroy something beautiful for you. I wanna destroy for you.` The verifier's re-run (r0306) returned identical JSON. Against ElevenLabs' first transcript it differs in the second line, `All shadows like a stone.` against `Or shatters like a stone.`, in `wanna` against `want to` twice, and in the apostrophe of `'Cause`. There's no checked copy of the lyrics, so nothing was counted.
- Time: ran on xAI's side. Round trip 5.75 s (r0105) and 1.11 s (r0306). At the published `$0.10 / hr (REST)`, the 36 seconds come to 0.001 USD a call.
- Takes as a hint: `language`, `format`, `diarize`, `keyterm`, `filler_words`, `vad_threshold` and `multichannel`. Nothing about music.
- Hands off to: not tried. Each word comes with its start and end in seconds.

**YourMT3, on the Hugging Face Spaces `mimbres/YourMT3` and `mimbres/YourMT3-cpu`** ([Space](https://huggingface.co/spaces/mimbres/YourMT3), [CPU Space](https://huggingface.co/spaces/mimbres/YourMT3-cpu)). A model that writes down the notes it hears, one track per instrument. Both Spaces' `app.py` load `model_name = 'YPTF.MoE+Multi (noPS)'`, at commits `5e66c1ea` (GPU) and `bd69fbac` (CPU).

- In: S2n as `S2n.mono.wav` and R1c as `R1c.mono.wav`, both mono WAV files. The ElevenLabs guitar stem of S4 as MP3.
- Command or settings: endpoint `/process_audio`, called with `gradio_client` 2.7.2 and no access token (`scripts/hf_space_call.py`). The audio file is the only input.
- Out: an HTML string with a MIDI player. The MIDI sits inside the HTML as a `data:audio/midi;base64,` URL that a program has to cut out. It's a multi-track MIDI file, format 1, that splits each quarter note into 480 steps. It starts with an empty track, then has one track per instrument it predicted. No tempo is written in it, and every note has the same loudness, velocity 100.
  - S2n on the CPU Space (r0164): 126 notes in three tracks, `Acoustic Piano` 15, `Electric Piano` 58 and `Guitar (clean)` 53. 79 of the 90 played notes were among them, a median 3.3 ms after the played notes. That's all 42 melody notes and 37 of the 48 bass notes (e0277). The GPU Space (r0112) returned the same number of notes per track, again with 79 of the 90 (e0110). The `Guitar (clean)` track alone had 53 notes, and 52 of the played notes were among them (e0111).
  - R1c on the CPU Space (r0245): 129 notes in one `Guitar (clean)` track. 119 of the 148 annotated notes were among them, a median 5.2 ms before them (e0690).
  - The ElevenLabs guitar stem of S4 on the CPU Space (r0231): 516 notes, with 334 of the 369 guitar notes among them, as in the ElevenLabs entry.
- Time: ran on the Spaces' hardware. On the CPU Space, `cpu-basic`, it took 31.18 s for S2n (r0164), 31.34 s for R1c (r0245) and 66.90 s for the 38.79 s stem (r0231). On the GPU Space it took 5.32 s for S2n (r0112). That Space runs on `zero-a10g`, Hugging Face's shared graphics cards, called ZeroGPU. The verifier's re-run on the CPU Space (r0305) returned the same MIDI file, byte for byte. Its re-run on the GPU Space (r0311) was refused with `You have exceeded your ZeroGPU quota (90s requested vs. 79s left). Try again in 15:33:27.` Free.
- Takes as a hint: none.
- Hands off to: tried as the receiver of the ElevenLabs guitar stem. Cut out of the HTML, its MIDI is a `.mid` file. Flat, an online music notation editor, lists `.mid` among the files it imports, according to its docs (not tried).

**yt-dlp 2026.10.26** ([repository](https://github.com/yt-dlp/yt-dlp)). A command-line downloader for audio and video from links. It's the one tool in this list that ran on the box itself.

- In: the archive.org page of the concert video R3a was cut from (CC BY-SA 4.0). YouTube wasn't contacted.
- Command or settings: `yt-dlp -F` on the page listed three formats, then `yt-dlp -f 0 --download-sections '*400-418' -x --audio-format wav -o 'R3a_ytdlp_400-418.%(ext)s' https://archive.org/details/scm-422828-crescendo313-drh-meredithconn`.
- Out: `R3a_ytdlp_400-418.wav`, a mono WAV of 18.013 s and 1,729,374 bytes. It downloaded only the 18-second section and printed `WARNING: "asr" field is not numeric - forcing int conversion, there is an error in extractor`. The verifier's re-run (r0323) wrote the same WAV, byte for byte.
- Time: 10.9 s from start to finish, with the processor busy for 1.05 s of it, and a peak of 64.5 MB of memory (r0126). Timed runs here were pinned to 2 of the box's 4 cores, and this one ran without that, so it isn't a 2-core figure. The re-run took 18.03 s (r0323). Free.
- Takes as a hint: none. It takes a time range (`--download-sections`) and a format (`-f`).
- Hands off to: not tried. Klangio, which sells music transcription apps, and the stem splitters LALAL.AI and MVSEP take an uploaded audio file, according to their docs.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

"Steps for me" means my agents wrote me instructions to run it myself. They're in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/hosted-apis).

- **Alibaba Cloud Model Studio, Qwen-Omni.** No Alibaba Cloud key in my key store, and the gateway's free tier refused the Qwen model asked for, `alibaba/qwen3.8-27b` (r0023). Steps for me: none.
- **Amazon Nova.** Not read, so whether its models take audio or video isn't known. Steps for me: none.
- **Anthropic Claude Messages API.** Its API reference documents no audio or video input, so it wasn't tried. Steps for me: none.
- **AudioShake Tasks API.** Needs a key from a developer account (sign-up gives `10 free credits`), and I have none. Steps for me: yes.
- **Basic Pitch, as a hosted demo.** No Space with a Gradio API, the interface a program calls, turned up for it. The search found only two static pages and two Docker apps, Spaces of other kinds, and `Richhiey/basic_pitch_fastapi` was `SLEEPING`. Steps for me: none.
- **Beatstorapon API.** Not researched. Steps for me: none.
- **Chordify.** No developer API found, and its pages answered HTTP 403 to the box. Steps for me: none.
- **ChordMini.** Its docs page answered HTTP 402, so its hosted API couldn't be read. Steps for me: none.
- **Cyanite API.** Not read as its own API. Music.AI offers it inside its platform. Steps for me: none.
- **Datasets: MAESTRO, MUSDB18-HQ and the Harmonix Set.** Listed for what models were trained on, not something to run.
- **DeepSeek API.** Its two models take text, or text and images, and no audio or video, so it wasn't tried. Steps for me: none.
- **Fadr API.** `Usage of the Fadr API requires a Fadr Plus subscription`, and I have no key. Steps for me: yes.
- **fal.ai `fal-ai/demucs`.** Needs a key, and the audio at a web address (`audio_url`). Steps for me: yes.
- **Flat.io API.** Needs a personal access token or an OAuth2 sign-in, and I have no Flat account. Steps for me: yes.
- **GetSongBPM API.** Answered HTTP 403 to the box. Not researched. Steps for me: none.
- **Google Gemini API.** The key lists models and counts tokens for free, but every request for an answer came back HTTP 402 Payment Required (r0013, r0014, and the verifier's r0300). Through the Vercel AI Gateway, the free tier refused every Google model with HTTP 403 (r0022, r0023). Steps for me: yes, for both routes.
- **Hooktheory API (Trends).** Needs a hooktheory.com account. Steps for me: yes.
- **Hugging Face Inference Providers.** Answered HTTP 401 without an access token, and I have no Hugging Face access token. Steps for me: none.
- **Hugging Face Space `akhaliq/demucs`.** `RUNTIME_ERROR` when my agents looked. Steps for me: none.
- **Hugging Face Space `Hmjz100/MT3`, named after MT3, a multi-instrument music transcription project.** Its code wasn't read. `RUNTIME_ERROR`, `Exit code: 1` with a Python error. Steps for me: none.
- **Hugging Face Space `hugging-apps/muscriptor-music-transcription`.** Refused twice (r0116, r0309) with `You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota`. Steps for me: yes.
- **Hugging Face Space `lpeterl/sam-audio-webui`, SAM Audio.** The same refusal (r0162). Steps for me: yes.
- **Hugging Face Space `taejunkim/all-in-one`, a demo of All-In-One.** `RUNTIME_ERROR`. Steps for me: none.
- **Hugging Face Space `teamup-tech/Transkun`.** Running on a shared GPU, but not called after the GPU refusals above. Steps for me: yes.
- **Hugging Face Spaces, eight more found by search:** `ahk-d/Spleeter-HT-Demucs-Stem-Separation-2025`, `owiedotch/demucs-stem-separation`, `kajise/Demucs_v4-FT_4s`, `Thafx/Demucs_v4_2s_HT`, `Kevin676/Demucs_v4`, `sparanoid/demucs-gpu`, `akhaliq/sam-audio-large` and `njolnir/Dia-Beat-This`. All `RUNTIME_ERROR` except the last, `BUILD_ERROR`, when the verifier read them. Steps for me: none.
- **Klangio API.** Needs a key from an account, and the free tier is `Max 15s audio duration`, so my agents cut 15-second excerpts for it. Steps for me: yes.
- **LALAL.AI API.** Needs a key from a paid license. Steps for me: yes.
- **Mistral audio (Voxtral).** Its audio docs describe speech to text and text to speech, and don't describe music understanding. Not tried. Steps for me: none.
- **Moises, the consumer app.** No developer API for the app was read. Music.AI is its API platform. Steps for me: none.
- **Music.AI API.** Its docs say `The API key should be included in the Authorization header of each request.`, and I have no music.ai account. Steps for me: yes.
- **MusicGPT API, `audio_to_midi`.** Needs an API key, and I have none. Steps for me: none.
- **MVSEP API.** Needs an `api_token` from an mvsep.com account. Only its public list of 126 algorithms was read. Steps for me: yes.
- **OpenAI audio in Chat Completions, `gpt-audio-1.5`.** No OpenAI key in my key store. Steps for me: none.
- **PianoConvert API.** Its help page answered HTTP 404. Steps for me: none.
- **Replicate, with `ryan5453/demucs`, `sakemin/all-in-one-music-structure-analyzer` and `triadmusic/chord-detection-cnn-lstm`.** Every request needs an API token, and I have none. Steps for me: yes.
- **Roboflow hosted inference.** Page not read. Steps for me: none.
- **Songscription.** No developer API page found. Steps for me: none.
- **Songsterr.** No documented developer API, and its `robots.txt`, the file where a site tells automated programs what not to fetch, has `Disallow: /api/`. Not called. Steps for me: none.
- **Soundslice data API.** API keys only come with its paid Teacher or Licensing plans. Steps for me: yes.
- **Soundverse enterprise API.** Pages not read. Steps for me: none.
- **Spotify Web API, Audio Features and Audio Analysis.** Closed to new apps since November 27, 2024, per Spotify's developer blog. Steps for me: none.
- **StemSplit API.** Needs an API key, and I have none. Steps for me: none.
- **Tencent Smart Music, Vocal To Midi.** The page answered but wasn't read. Steps for me: none.
- **The vendors' Python clients**, `musicai-sdk`, `audioshake`, `replicate`, `fal-client` and `soundsliceapi`. Not installed, for lack of keys. The ElevenLabs calls went straight to its web API, not through the `elevenlabs` package.
- **Vercel AI Gateway, the rest of its catalog.** The free tier refused `xiaomi/mimo-v2.6-pro`, `moonshotai/kimi-k3` and the Google and Qwen models with HTTP 403 (r0022, r0023). Steps for me: yes.
- **WaveSpeedAI.** Not researched. Steps for me: none.
- **xAI language models.** All eight take text and images only, so the chord, note, capo and video questions weren't sent. Steps for me: none.
- **YouTube.** Not contacted. The yt-dlp run used an archive.org page. Steps for me: none.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| `Beat This!` Space | Not read in this lane | Not read | Not read |
| `bytedance/seed-2.1-turbo` | Hosted model. Its license and Vercel's gateway terms weren't read | Not read | Not read |
| Demucs `mdx_extra_q` Space | MIT, per the Demucs [`README.md`](https://raw.githubusercontent.com/adefossez/demucs/main/README.md): `Demucs code is released under the MIT license as found in the LICENSE file.` The Space's own license wasn't read | Unclear, per the same `README.md`: `The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.` | The `README.md` on `mdx_extra`: `trained with extra training data (**including MusDB test set**)`. [MUSDB18-HQ](https://zenodo.org/records/3338373): `MUSDBHQ: is provided for educational purposes only and the material contained in them should not be used for any commercial purpose without the express permission of the copyright holders` |
| ElevenLabs Speech to Text and Stem Separation | Hosted service under the [Terms of Service](https://elevenlabs.io/terms-of-use), `Last Updated: 09 October 2026`, which say `Except as expressly set forth herein, as between you and ElevenLabs, you retain all rights in and to your Output.` | Not read | Not read |
| MiMo V2.6 Flash | Hosted model. Its license and Vercel's gateway terms weren't read | Not read | Not read |
| Muse Spark Open | Hosted model. Its license and Vercel's gateway terms weren't read | Not read | Not read |
| xAI Speech to Text | Hosted service. xAI's terms weren't read | Not read | Not read |
| YourMT3 Spaces | Not read in this lane | Not read | Not read |
| yt-dlp 2026.10.26 | Unlicense, per its [`LICENSE`](https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/LICENSE): `This is free and unencumbered software released into the public domain.` Its [`README.md`](https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/README.md) adds that `the PyInstaller-bundled executables include GPLv3+ licensed code, and as such the combined work is licensed under GPLv3+.` It also says `The git repository, the PyPI source distribution and the PyPI built distribution (wheel) only contain code licensed under the Unlicense.` The wheel is the package my agents installed | No model | No model |

Every clause above, and the terms of the services that didn't run, is quoted with its source in `survey.md` in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/hosted-apis).

</details>

<!-- IMAGES -->
All four were drawn with Pillow 12.3.0 by `/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/draw_hosted_apis.py`, 1280 x 720 WebP, quality 90, on the ao-compare frame color `#15141f`. Each draws one tool output from the lane's `samples/` folder over the clip's truth file from `docs/guitar-tab-research/inputs/<id>/`, the same truth files gtr-eval scored against (SHA-256 checked by the script: S2n `dad55e25...`, S3 `fde659ef...`, S4 `127bec79...`). I opened each one and the alt text describes only what it shows. The bar counts in alt 3 and alt 4 were rechecked with a pixel scan of the WebP files (`/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/scan_bars.py`).

1. Source: `docs/guitar-tab-research/lanes/hosted-apis/samples/hf-spaces/beatthis_S4/beats.json` (r0118), over `docs/guitar-tab-research/inputs/S4/S4.beats.txt` and `S4.truth.json` (`duration_s`).
   Wrote: `/home/user/blog/public/media/guitar-tab-tools/hosted-apis-beatthis-s4.webp` (1280 x 720, 24,230 bytes).
   Alt: Two rows of tick marks over a 0 to 38 second axis. The top row, Played, has 68 cream ticks starting after a shaded silent first bar, with a tall tick every fourth beat. The bottom row, the demo page's answer, has 68 blue ticks at the same spacing. Its first three sit inside the shaded silent bar and its last one comes about 1.5 seconds before the top row's last.
   Caption: `<b><code>Beat This!</code> on S4</b>` / S4, a band mix I synthesized. Its 68 played beats on top, the 68 the demo page returned below.
2. Source: `docs/guitar-tab-research/lanes/hosted-apis/samples/vercel-gateway/S3_chords_mimo-v2.6-flash/answer.json` (r0028) and `docs/guitar-tab-research/lanes/hosted-apis/samples/verify-trials/vercel-gateway/verify_S3_chords_mimo-v2.6-flash/answer.json` (r0302), over `docs/guitar-tab-research/inputs/S3/S3.chords.lab`. Harte labels shown as G, Em, Am7, D7, C, and N shown as "none".
   Wrote: `/home/user/blog/public/media/guitar-tab-tools/hosted-apis-mimo-s3-chords.webp` (1280 x 720, 33,682 bytes).
   Alt: Three rows of labelled boxes over a 0 to 24 second axis. Played: none, G, Em, Am7, D7, G, Em, C, D7, G, most boxes 2.5 seconds long. Answer 1: G, Em, C, D, G, Em, C, D, G, G, starting at 0 seconds. Answer 2: none, G, Em, Am7, D7, G, Em, C, D7, G, most boxes 2.3 seconds long.
   Caption: `<b>MiMo's chords for S3, asked twice</b>` / S3, 24 seconds of strummed chords I synthesized. The second answer came back for the exact same request.
3. Source: `docs/guitar-tab-research/lanes/hosted-apis/samples/vercel-gateway/S2n_notes_mimo-v2.6-flash/answer.json` (r0076), over the 90 notes of `docs/guitar-tab-research/inputs/S2n/S2n.truth.json`.
   Wrote: `/home/user/blog/public/media/guitar-tab-tools/hosted-apis-mimo-s2n-notes.webp` (1280 x 720, 21,994 bytes).
   Alt: A piano roll of S2n, time from 0 to 29 seconds across, pitch from below C3 to above C6 up the side. Cream outlines mark the 90 played notes from about 2 seconds to the end. MiMo's 29 notes are violet bars, all before 8.5 seconds, and notes of the same pitch that overlap share one bar. Six bars, holding eight notes, start before the first played note.
   Caption: `<b>MiMo's notes for S2n</b>` / S2n, a fingerstyle clip I synthesized. Played notes outlined, MiMo's filled.
4. Source: `docs/guitar-tab-research/lanes/hosted-apis/samples/hf-spaces/yourmt3cpu_S2n/yourmt3cpu_S2n.mid` (r0164, no tempo event, read at the MIDI default of 120 BPM, as gtr-eval's reader does), over the same S2n truth notes. Same pitch range (MIDI 42 to 87) and time range as picture 3.
   Wrote: `/home/user/blog/public/media/guitar-tab-tools/hosted-apis-yourmt3-s2n-notes.webp` (1280 x 720, 30,544 bytes).
   Alt: The same piano roll with YourMT3's 126 notes as filled bars in three colors, one per MIDI track: Acoustic Piano 15, Electric Piano 58 and a guitar track 53. Filled bars sit in or beside the cream outlines of the played notes through the whole clip, and nine orange notes, drawn as seven bars, sit around C6, above every played note.
   Caption: `<b>YourMT3's notes for S2n</b>` / The CPU demo page's MIDI file, a list of notes with start times. Played notes outlined, one color per track.

<!-- PENDING MEDIA -->
All checked present on the box (sizes and durations from `ls` and ffprobe, matching trials.md "Media kept outside git"). Licenses follow the input: S clips synthesized for this research, R2 CC BY 4.0 ("I Want to Destroy Something Beautiful" by Josh Woodward, credit required), R1c GuitarSet CC BY 4.0 (credit required).

1. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S4_six_stems/stems/guitar.mp3`: ElevenLabs `six_stems_v1` guitar stem of S4 (r0064). MP3 192 kb/s 44.1 kHz stereo, 38.79 s, 931,048 bytes.
2. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S4_six_stems/stems/other.mp3`: ElevenLabs `other` stem of S4, the one the lead line was measured in (r0064). 38.79 s, 931,048 bytes.
3. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/demucs_S4_old/named/other.wav`: Demucs `mdx_extra_q` Space `other` stem of S4, the one the guitar was measured in (r0141). WAV 16-bit 44.1 kHz stereo, 38.74 s, 6,834,024 bytes.
4. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S6taps_six_stems/stems/guitar.mp3`: ElevenLabs guitar stem of S6taps (r0189). 29.39 s, 705,350 bytes.
5. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S6taps_six_stems/stems/drums.mp3`: ElevenLabs drums stem of S6taps, the one the taps were measured in (r0189). 29.39 s, 705,350 bytes.
6. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/R2_six_stems/stems/vocals.mp3`: ElevenLabs vocals stem of R2 (r0194). 36.05 s, 865,219 bytes. Needs the R2 credit.
7. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/R2_six_stems/stems/guitar.mp3`: ElevenLabs guitar stem of R2 (r0194). 36.05 s, 865,219 bytes. Needs the R2 credit.
8. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/beatthis_S4/files/beat-this_audio-with-beats.wav`: Beat This! Space, S4 with its beat clicks mixed in (r0118). WAV, 38.74 s, 6,834,024 bytes.
9. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/beatthis_R1c/files/beat-this_audio-with-beats.wav`: Beat This! Space, R1c with its beat clicks mixed in (r0246). WAV, 28.24 s, 2,490,396 bytes. Needs the GuitarSet credit.

<!-- NUMBERS -->
Counts and scope
- 74 entries on the lane's list: `tools.json`, `tools` array length (kinds: api 50, library 7, open-source 5, research-model 5, commercial-app 4, dataset 3). Called "my agents' list for this step", not a list of hosted services, because of those kinds.
- 10 tools that sent back results (classification for this fragment): Beat This! Space, `bytedance/seed-2.1-turbo`, Demucs Space `nakas/demucs_playground`, ElevenLabs Speech to Text, ElevenLabs Stem Separation, MiMo, Muse Spark Open, xAI Speech to Text, YourMT3 Spaces, yt-dlp. `tools.json` has 16 entries with `tried: true`. The other 6 are `gradio_client` 2.7.2 and 0.5.3 (the Python client for every Space call) and ffmpeg 6.1.1 (made the R3a frames with `ffmpeg -vf fps=1 -q:v 3` and decoded the ElevenLabs stems), helpers that ran on the box (`tools.json` `tried_how` `public-space` and `local-cpu`) and are not counted among the ten, then Vercel AI Gateway (the route for three of the ten), Gemini (HTTP 402), Muscriptor and SAM Audio Spaces (ZeroGPU refusals).
- yt-dlp "the one tool in this list that ran on the box itself": `tools.json` `tried_how` `local-cpu`, ledger r0126. ffmpeg also ran on the box but is not in the list, and the Seed entry says so ("The frames were made on the box with ffmpeg"): trials.md trial (c), `tools.json` ffmpeg `what`.
- "nine of those ten ran on someone else's computers": every remote call ran with `gtr-run --nolock`, work on the provider's side (trials.md "Conventions", Timings). yt-dlp ran on the box (`tools.json` `tried_how` `local-cpu`).
- "the box, the cloud computer my agents used": ENVIRONMENT.md title "The box every trial ran on" and "one Claude Code cloud session container".
- 12 test clips with results: S2n, S3, S4, S5capo2, S5dropd, S6taps, S7flat30, R1c, R2, R3a, R3b, R3c (trials.md trial sections and run tables).
- The three of the ten asked for S2n's notes, given in alphabetical order in the rundown and the opening: MiMo r0076, 29 notes, 1 of 90 (e0067). Muse Spark Open r0082, `{"recording_secs": 0, "notes": []}` (e0068). YourMT3 r0164 (CPU) and r0112 (GPU), 126 notes, 79 of 90 (e0277, e0110). Muscriptor was asked too (r0116) and refused, so it isn't one of the ten.
- "A Meta model", "an AI model from Xiaomi": the gateway catalog descriptions in trials.md (`Muse Spark Open is Meta’s open-weight reasoning model`, `MiMo V2.6 Flash is Xiaomi's efficient multimodal reasoning model`).
- S2n "a bass line played with the thumb and a melody on top": INPUTS.md S2n ("alternating thumb bass plus a melody on top").
- Note-matching rule stated once at the top of the details (start within 50 ms, pitch within 50 cents): `definitions.onset_only` of every cited notes scoring, e0067, e0068, e0110, e0111, e0277, e0522, e0525, e0690 (all `onset_tolerance=0.05, pitch_tolerance=50.0`), and trials.md trial (b) heading.
- "a semitone is one fret": INPUTS.md S5capo2 (capo on fret 2, "sounds 2 semitones higher").
- Sixteen services that needed an account or key not in the key store: Music.AI, Klangio, LALAL.AI, AudioShake, Fadr, MVSEP, Replicate, fal.ai, Soundslice, Flat.io, Hooktheory, StemSplit, MusicGPT, OpenAI audio, Alibaba Qwen-Omni, Hugging Face Inference Providers (`tools.json` `not_run_reason` of each, trials.md "Services in this lane NOT RUN HERE").
- No capo, tuning, key or tempo field in the transcription or separation request formats read: survey.md "Handoff facts", "Constraint inputs" paragraph. The Spaces that ran: trials.md "Constraint inputs: none for YourMT3 and Beat-This", `tools.json` demucs_playground `constraints_accepted` "none through this endpoint".
- Clip lengths in the prose: S2n 29-second (29.357 s), S3 24 seconds (24.000 s), S4 38.7-second (38.741 s), R1c 28 seconds (28.235 s), R2 36-second (36.000 s), R3a, R3b, R3c 18-second (18.000 s): INPUTS.md clip table. R3a CC BY-SA 4.0, R2 CC BY 4.0 (Josh Woodward), R1c GuitarSet CC BY 4.0: INPUTS.md.
- Space hardware `cpu-basic` (Beat-This, demucs_playground, YourMT3-cpu) and `zero-a10g` (YourMT3, Muscriptor, SAM Audio, Transkun): trials.md Spaces table and survey.md Spaces list.
- "no time on 2 of the box's cores": ENVIRONMENT.md "How runs were timed" (two slots of 2 cores, every timed job pinned to one).
- 48 lines in the "didn't run" block plus 10 tools that ran, 2 helpers and the gateway cover all 74 entries (Replicate's 4 entries, 3 datasets, 6 client libraries and the upstream MT3, Transkun, All-In-One and Basic Pitch entries are folded into lines, Demucs upstream is the Demucs Space entry).
- Format details cut from the In and Out lines (16-bit, 44.1 kHz, PCM, 48,000 Hz, 211.61 KiB) as jargon that doesn't change the takeaway. "stereo" and "mono" kept. Demucs "in the same format as the input and exactly as long": trials.md Spaces table r0141 ("each 16-bit 44.1 kHz stereo, 38.741383 s (sample count equal to the input)").

Beat This! (trials.md Hugging Face Spaces section and table, tools.json)
- commit `8f2aa339`, `final0.ckpt` (the checkpoint, called "the saved model file"), `dbn=False`, `beat_this.inference.File2Beats`, read from the Space's `app.py`: trials.md "Which model each Space runs".
- 68 beats, 18 downbeats, 65 of 68 within 70 ms, median +12.4 ms, 17 of 17 downbeats: e0160 (`n_matched` 65, `median_s` 0.012414, downbeats `n_truth` 17 `n_est` 18 `n_matched` 17).
- First beats 0.52, 1.06, 1.56 s, first truth beat 2.069 s: trials.md Scores, Beat-This, `beats.json`.
- R1c 56 beats, 56 of 56, 14 of 14: e0693.
- 12.59 s r0118, 5.69 s r0246, 6.89 s r0308 (same beat times, click WAV byte-identical): trials.md tables.
- 38.7-second S4: INPUTS.md S4 38.741 s. 28 seconds R1c: INPUTS.md 28.235 s.
- Soundslice "a player that shows music notation and tab in sync with a recording": survey.md Soundslice section ("synced notation and tab player") and "Handoff facts" (Soundslice "syncs notation to it by syncpoints"). `[zero_based_bar, time_in_seconds, optional_position_0_to_480]` and "so downbeat times give one syncpoint per bar": survey.md "Handoff facts", tools.json Beat This! `handoffs_out` ("Downbeat times give one syncpoint per bar").
- `gradio_client` 2.7.2, "a Python library for calling Spaces": trials.md "Hugging Face public Spaces", `tools.json` gradio_client `what` ("Python client that calls a public Hugging Face Space as an API").

bytedance/seed-2.1-turbo
- input `text, image, video`, no `response_format` (which carried the schema for MiMo and Muse, trials.md "a JSON schema sent as `response_format`"): trials.md gateway catalog paragraph and Prompts line.
- "Chat Completions, the chat format the gateway takes": trials.md gateway section ("OpenAI-compatible Chat Completions").
- HTTP 400 message (r0086): trials.md trial (c).
- `ffmpeg -vf fps=1 -q:v 3` on the box, 18 frames, label `Frame at t = <k>.0 s:`, `max_tokens` 16384: trials.md trial (c), `tools.json` ffmpeg (`local-cpu`).
- `--schema-in-prompt`: ledger r0127 `cmd_str`.
- capo `no`, tuning `cannot_tell`, spans 0-6.5, 6.5-14.5, 14.5-17 s, visible, frets `null`: trials.md trial (c) table r0127.
- 166.0 s, 23,707 prompt tokens, 11,146 completion tokens (10,715 reasoning), 0.0397185 USD: trials.md trial (c) table r0127. Completion tokens include reasoning: trials.md "Output format facts".

Demucs Space
- commit `d924a6d3`, `python3 -m demucs.separate -n mdx_extra_q -d cpu test.wav -o out`: trials.md Spaces table and scores paragraph.
- `ValueError('Unknown protocol: ws')` r0119, `gradio_client` 0.5.3 r0141, Gradio 3: trials.md Spaces table. "the interface a program calls on these demo pages": trials.md "demo apps on Hugging Face that expose a Gradio API".
- SI-SDR definition: gtr-eval's scale-invariant SDR (trials.md ElevenLabs Scores), formula in e0426 `definitions.si_sdr_db`, put in plain words.
- 8.49 / 5.29 / 6.37 / 2.94 dB: e0360 (trials.md demucs table). 8.46 / 5.31 / 6.42 / 3.07 dB: e1331 (trials.md, r0322 re-run: "four WAVs of the same size, sample rate and length, but all four differ from r0141's in content").
- 172.46 s, processing 4.26 to 167.45 s, r0141. 155.50 s, r0322: trials.md tables.

ElevenLabs Speech to Text
- Link: `https://api.elevenlabs.io/openapi.json`, the `tools.json` `url` of this entry. The earlier docs page link was in no lane file, so it was replaced.
- `scripts/elevenlabs_call.py stt /home/user/gtr/inputs/R2/R2.wav <out> --model scribe_v3`, settings, no `seed` or `temperature`: trials.md ElevenLabs Speech to Text section. "the settings that steer how random the answer is": the OpenAPI `seed` and `temperature` quotes in trials.md.
- `eng`, 0.98, 36.0, 32 words, the text, word fields: trials.md and `samples/elevenlabs/R2_stt_scribe_v3/stt.json`.
- `I wanna destroy` (r0318): trials.md re-run paragraph.
- 0.92 s r0108, 1.24 s r0318, 11 credits, `character-cost: 11` (a response header): trials.md.
- `$0.20` per hour (Scribe v3): trials.md ("$0.20" "Price per hour", corrected by the verifier, log item 6). Dollar price per credit: UNVERIFIED in trials.md, so no USD figure is given.
- `Determinism is not guaranteed.`: trials.md re-run paragraph (OpenAPI `seed`).
- R2 song name, artist, CC BY 4.0: INPUTS.md R2, trials.md.

ElevenLabs Stem Separation
- `scripts/elevenlabs_call.py stems /home/user/gtr/inputs/S4/S4.wav <out> --variation six_stems_v1 --format mp3_44100_192`: trials.md.
- S4.wav 6,834,024 bytes, stereo: trials.md.
- six file names, stereo MP3: trials.md.
- 25.06 ms offset (1,105 samples), ffmpeg 6.1.1: trials.md "Timing of the stems" and output format facts.
- S4 SI-SDR guitar 13.70, drums 13.43, bass 15.16, lead (other.mp3) 15.76: e0057. S6taps guitar 26.77, taps (drums.mp3) 13.23: e0391.
- R2 pairing: e0426 `--map vocals_derived=vocals.wav instrumental=sum_non_vocal.wav`, so `vocals.mp3` 15.44 dB against `vocals_derived` (the song minus the artist's instrumental) and the sum of the other five stems 13.59 dB against `instrumental` (the artist's own instrumental version): INPUTS.md R2, trials.md R2 bullet. The earlier wording read the pairing backwards and was fixed.
- r0315 six byte-identical MP3s: trials.md.
- 6.98 s r0064, 6.10 s r0189, 6.78 s r0194, 1,065 / 807 / 990 credits, 27.49, 27.49, 27.50 credits per second: trials.md table. No stem separation rate on the price page: trials.md.
- Handoff: r0231 went to `mimbres/YourMT3-cpu` (ledger r0231 `cmd_str`), 516 notes, 334 of 369, median +23.4 ms (e0522), shift 25.057 ms gives -1.7 ms (e0525): trials.md "Tested handoff".

MiMo V2.6 Flash (trials.md Vercel AI Gateway section)
- input `text, audio, image, video`, price 0.00000014 / 0.00000028 USD per token: trials.md catalog entries.
- mono WAV in a `file` part as a base64 data URL: trials.md "Input format facts" and gateway section. `max_tokens` 24576, 16384 for frames: trials.md.
- S3 r0028: `G Em C D` twice 0.00 to 19.38 s, then G: trials.md table (answer `0.00-2.44 G` ... `19.38-21.80` and `21.80-24.00` G), 99 BPM, G major. Truth: N 0-2.5, G Em Am7 D7 G Em, C, D7, G, 96 BPM, G major: trials.md Scores paragraph.
- 4.6 of 24 s: e0018 `root` 0.192917 x 24.000 s truth span = 4.630 s (also checked by hand from the two label lists: 0.63 s of D at 18.75-19.38 s plus 4.00 s of G at 20-24 s). "root, the note the chord is named after": plain definition of mir_eval's root comparison.
- r0302, "the exact same request" (its `request.json` is byte-identical to r0028's): N to 2.5 s, `G Em Am7 D7 G Em C D7` in 2.3 s segments, G 20.9-24.0, 120 BPM, G major: trials.md. 18.75 of 24 s: e1189 `root` 0.78125 x 24.000 s = 18.75 s.
- S4 r0052: answer from trials.md table, which matches `samples/vercel-gateway/S4_chords_mimo-v2.6-flash/answer.json`. SOURCE CONFLICT: `tools.json` r0052 `answer` lists 24 chords (`D A Bm G D A G A Bm G D A G A Bm G D A G A D A G A`), six more than the saved answer file and trials.md (18). The file and trials.md were used. 120 vs 116 BPM, D major: e0059, e0060. 22.8 of 38.7 s: e0058 `root` 0.58923 x 38.741383 s = 22.83 s.
- R1c r0248: `G D C G C G D C G`, 84 vs 119 BPM, G major: trials.md R1c table, e0699, e0702. Segment lengths from `samples/vercel-gateway/R1c_chords_mimo-v2.6-flash/answer.json` (0-3.5, then seven of 3 s, then 24.5-28.0) and trials.md ("first 3.5 s, last 3.5 s"). 13.4 of 28.2 s: e0696 `root` 0.473958 x 28.235283 s = 13.38 s.
- S2n notes r0076: 29 notes, 1 of 90: e0067. Onsets 0.02 to 7.75 s, last offset 8.42 s: `samples/vercel-gateway/S2n_notes_mimo-v2.6-flash/answer.json`. First truth note 2.143 s: trials.md trial (b) (2.142857 in S2n.notes.csv).
- Capo: r0080 fret 2 A major (e0069, e0070), r0196 no capo A major (e0419, e0420), r0203 fret 2 B major (e0421, e0422), r0182 no capo G major (e0395, e0396): trials.md trial (d) tables.
- Tuning: "the six open strings as MIDI note numbers, lowest string first": trials.md trial (e) (`open_strings_midi`, "six MIDI numbers, low to high"). r0210 `[40,45,50,55,59,64]` -15 cents vs `[38,45,50,55,59,64]` 0 (e0423), r0212 -10 vs -30 (e0424), r0213 0 vs 0 (e0425), capo 0 in all three: trials.md trial (e).
- Frames r0107, r0360, r0391 fret spans, `cannot_tell`, the two schema departures: trials.md trial (c) tables and the paragraph under them. "The written description of my test clips" is the inputs manifest, INPUTS.md: `No capo.` (R3b and R3c rows), `frets 2-4 under the fingers` (R3b, frame at 209 s of the original, 9 s of the excerpt), `the hand is near the nut` (R3c, 232 s, 10 s of the excerpt): INPUTS.md and trials.md trial (c) verifier paragraph.
- r0077 and r0098 HTTP 400: trials.md trial (c).
- Round trips 12.9 s (r0080) to 163.6 s (r0107), costs 0.00009576 (r0080) to 0.00754432 USD (r0360): trials.md tables.
- `reasoning.effort`, `providerOptions.gateway.only` / `order`: trials.md "Constraint inputs for a re-run".

Muse Spark Open
- providers baseten, fireworks, modal, nebius, togetherai, input `text, audio, image, video`, 0.00000125 / 0.00000425 USD per token, `Meta’s open-weight reasoning model`: trials.md catalog entries.
- r0024: `0.0-0.0 N`, 107 BPM, D minor, reasoning quote: trials.md table and "Facts behind the Muse Spark Open rows". 2.5 of 24 s: e0064 `root` 0.104167 x 24 s.
- r0034 HTTP 400 message: trials.md table.
- r0036: N to 2.10 s, `Eb Bb Cm Ab` to 37.15 s, 24.0 s file, 110 BPM, Eb major: trials.md table. 2.1 of 24 s: e0061 `root` 0.0875 x 24 s.
- r0041 `TOO_MANY_TOKENS`, r0082 `{"recording_secs": 0, "notes": []}` (e0068), r0084 no capo, C minor (e0071, e0072): trials.md tables.
- r0083, r0303, r0304 MP4 refusals, all five providers: trials.md trial (c).
- r0129 frames: `null` frets, `approx. 2nd-7th fret region`: trials.md trial (c) table.
- Round trips 1.76 s (r0084) to 9.84 s (r0129), costs 0.00080705 (r0082) to 0.01514875 USD (r0129): trials.md tables.

xAI Speech to Text
- `scripts/xai_stt.py /home/user/gtr/inputs/R2/R2.wav <out> en`, `POST https://api.x.ai/v1/stt`, `language=en`: trials.md.
- 36.0, 30 words, the text: trials.md and `samples/xai/R2_stt/response.json`.
- Differences against ElevenLabs r0108: trials.md last paragraph of the xAI section.
- 5.75 s r0105, 1.11 s r0306, `$0.10 / hr (REST)` quoted from "Speech to Text | $0.10 / hr (REST), $0.20 / hr (Streaming)", 0.001 USD: trials.md.
- parameter list: trials.md (docs paragraph).

YourMT3
- commits `5e66c1ea`, `bd69fbac`, `model_name = 'YPTF.MoE+Multi (noPS)'`: trials.md table and "Which model each Space runs".
- MIDI format facts (format 1, 480 ticks per quarter note, empty first track, one track per predicted instrument, no tempo event, velocity 100): trials.md output format facts, put in plain words.
- r0164: 126 notes, 15 / 58 / 53, 79 of 90, median +3.3 ms, melody 42 of 42, bass 37 of 48: e0277 (`recall_by_voice`, `median_s` 0.003274). r0112 same counts: e0110. Guitar track 53 notes, 52 matched: e0111 (`n_est` 53, `n_matched` 52).
- r0245: 129 notes, one track, 119 of 148, median -5.2 ms: e0690, trials.md R1c table.
- r0231 on `mimbres/YourMT3-cpu`: 516, 334 of 369: e0522, ledger r0231.
- 31.18 s r0164, 31.34 s r0245, 66.90 s r0231, 5.32 s r0112: trials.md tables. 38.79 s stem: trials.md handoff section.
- r0305 byte-identical MIDI, r0311 refusal text: trials.md verifier table.
- Flat "an online music notation editor" (survey.md Flat section, "the Flat online notation editor") imports `.mid`: survey.md "Handoff facts" and Flat import list ("MIDI: `.mid`, `.midi`"), docs, not tested.

yt-dlp
- 2026.10.26: trials.md, survey.md.
- command: ledger r0126 `cmd_str` (without the venv path `/home/user/gtr/lanes/hosted-apis/venv-apis/bin/`), trials.md gives the same command with double quotes.
- three formats listed by `-F`: trials.md.
- mono WAV, 18.013 s, 1,729,374 bytes, only the section fetched, warning text: trials.md.
- 10.9 s wall, 1.05 s CPU (`cpu_user_s` 0.88 + `cpu_sys_s` 0.17), 64.5 MB (`max_rss_mb`), `locked` false and `cores` null (not pinned): ledger r0126. Timed runs pinned to 2 of 4 cores: ENVIRONMENT.md. 18.03 s: ledger r0323 and trials.md.
- Klangio "sells music transcription apps", LALAL.AI "stem separation and voice processing service", MVSEP "a web service that runs many music source separation models": survey.md "What it is" lines. All three accept audio uploads: survey.md "Handoff facts" (docs).

Didn't run (tools.json `not_run_reason` and `for_aaron` per entry, trials.md NOT RUN table, survey.md)
- `10 free credits` (AudioShake), `Usage of the Fadr API requires a Fadr Plus subscription`, `Max 15s audio duration` (Klangio), `The API key should be included in the Authorization header of each request.` (Music.AI), `Disallow: /api/` in `robots.txt` (Songsterr): tools.json and trials.md NOT RUN table.
- Alibaba Qwen-Omni: r0023 only. SOURCE CONFLICT: `tools.json` Vercel AI Gateway `runs` lists all six refused models under r0022, but the ledger has r0022 as one `gateway_trial.py --model google/gemini-3.5-flash-lite` call on S3 (refused, `samples/vercel-gateway/S3_chords_gemini-3.5-flash-lite/response.json`) and r0023 as the `gateway_probe.py` call that named `alibaba/qwen3.8-27b` and the other four (`probe_models.json`). trials.md's NOT RUN row and `tools.json`'s Qwen-Omni `not_run_reason` give r0023. The ledger and trials.md were used. "(r0022, r0023)" stays on the Gemini and "rest of its catalog" lines, which include a Google model from r0022.
- Gemini HTTP 402, r0013, r0014, r0300, HTTP 403 r0022, r0023: trials.md Gemini and gateway sections. "HTTP 402 Payment Required" is the billing page's wording, quoted in trials.md ("Requests then fail with an HTTP 402 Payment Required error until you add credits."). The response body's own message about the account's prepaid balance is left out, as a fact about Aaron's account money (rule 5).
- `You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota`: trials.md Spaces table (r0116), r0309, r0162 same error.
- Space stages `RUNTIME_ERROR`, `SLEEPING`, `BUILD_ERROR`, `Exit code: 1`, the eight extra Space ids: trials.md Spaces paragraph (verifier read at 21:58 UTC). "a Python error" for trials.md's "numpy traceback".
- MT3 "a multi-instrument music transcription project": `tools.json` MT3 `what`. "named after MT3", "Its code wasn't read": survey.md (``the project the `Hmjz100/MT3` Space is named after`` and `the Space's code was not read`) and `tools.json` Hmjz100/MT3 `unverified`.
- Basic Pitch: "two static pages and two Docker apps", no Gradio API: trials.md Spaces paragraph, survey.md Spaces list.
- Flat.io "Personal Access Tokens or OAuth2": survey.md Flat section.
- 126 MVSEP algorithms: trials.md NOT RUN table.
- HTTP 401 (Inference Providers), 402 (ChordMini), 403 (Chordify, GetSongBPM), 404 (PianoConvert): trials.md and tools.json.
- Spotify closed to new apps, blog "Posted November 27, 2024": survey.md Spotify section.
- xAI eight language models, `["text", "image"]`, DeepSeek two models: trials.md "xAI chat models and DeepSeek".
- Refused gateway models `xiaomi/mimo-v2.6-pro`, `alibaba/qwen3.8-27b`, `moonshotai/kimi-k3` and the three Google ids: trials.md gateway section.

Licenses (survey.md sections Replicate, yt-dlp, ElevenLabs, tools.json `license`)
- Demucs MIT quote, weights quote, `mdx_extra` training quote: survey.md Replicate section, "Weights and training data". MUSDB18-HQ quote and Zenodo record 3338373: same section.
- ElevenLabs `Last Updated: 09 October 2026` and the 4(c)(ii) output clause: survey.md ElevenLabs section.
- yt-dlp Unlicense quote, GPLv3+ quote, and the README sentence on the git repository and PyPI wheel, now quoted in full instead of paraphrased: survey.md yt-dlp section, `tools.json` yt-dlp `service_terms` ("README Licensing: git and PyPI"). "The wheel is the package my agents installed": trials.md (PyPI `yt-dlp==2026.10.26` installed with `uv pip`, wheel metadata `License-Expression: Unlicense`).
- "Not read" cells: tools.json `unverified` for Beat This!, YourMT3, MiMo, Muse, Seed ("not stated in the reports"), Vercel gateway terms and xAI terms ("not read"), Demucs Space card license ("not read in this lane").

Pictures and media
- 1280 x 720, file sizes 24,230 / 33,682 / 21,994 / 30,544 bytes: `ls` after rendering.
- Beats picture: 68 truth beats 2.069 to 36.724 s, 68 Beat This! beats 0.52 to 35.2 s: `S4.beats.txt`, `beats.json`.
- YourMT3 picture: 9 Electric Piano notes at MIDI 83 to 86 (4.30 to 8.19 s and 23.58 to 24.57 s), above the highest played note, MIDI 64 (E4): read from `yourmt3cpu_S2n.mid` and `S2n.truth.json`. Two pairs at MIDI 83 run back to back (4.30-4.83 and 4.83-5.37 s, 7.50-8.03 and 8.03-8.19 s), so the nine notes draw as seven bars. A pixel scan of the WebP finds seven orange bars there (x 310-347, 349-386, 388-406, 408-426, 429-452, 1023-1040, 1042-1058).
- Chords picture: played boxes 2.5 s except C and D7 (1.25 s each) and the last G (4.0 s), from `S3.chords.lab`. Answer 2 boxes 2.3 s except none (2.5 s) and the last G (3.1 s), from the r0302 `answer.json`.
- MiMo notes picture: 8 of 29 notes start before 2.143 s (onsets 0.02 x4, 0.53, 0.99, 1.48, 1.96): `answer.json`. The three MIDI 62 notes (0.02-1.52, 0.53-0.98, 1.48-1.93 s) overlap and draw as one bar, so the eight draw as six bars. A pixel scan of the WebP finds six violet bars starting left of x 229, the x of 2.143 s.
- Pending media durations 38.791833, 38.741383, 29.387750, 36.048958, 28.235283 s and byte sizes: trials.md "Media kept outside git", rechecked with ffprobe and `stat`.
