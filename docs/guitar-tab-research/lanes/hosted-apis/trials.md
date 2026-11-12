# Lane 10, hosted-apis: trials

Agent: try-hosted-apis. Date: 2026-11-10 (from `date -u +%F`). Box: 4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU.
Checked, corrected and partly re-run by verify-trials-hosted-apis the same day: the corrections are listed in the
verification log at the end (C1 to C10), and the verifier's own runs are marked as such where they appear.

What this file is: every hosted service this lane could call from the box, what went in, what came back, how long
it took, what it cost. Facts only; numbers against ground truth carry their gtr-eval id (scorer gtr-eval 0.11.1,
ledger `/home/user/gtr/eval/ledger/evals.jsonl`) and their definition.

Conventions for the whole file:

- **Timings.** Every remote call was wrapped in `gtr-run --nolock` (logged in `/home/user/gtr/ledger/runs.jsonl`,
  run ids below; no CPU slot taken because the work runs on the provider's side). "wall" in the tables below is the
  round trip the call's script measured itself (`time.time()` around the HTTP request or the Space job, saved as
  `wall_s` in each call's `meta.json` or `record.json`), from sending the request to having the whole answer,
  including upload and queueing. The ledger's `wall_s` for the same run is longer because it also counts Python
  start-up, reading the key, the gateway model-list fetch and writing the files: by 0.99 to 2.78 s for the gateway,
  xAI and Space calls, and by 7.5 to 45.1 s for the four ElevenLabs runs, whose scripts also read the credit counter
  before and after the call (r0064 14.45 s, r0108 31.05 s, r0189 37.85 s, r0194 51.83 s in the ledger). The wall
  figures given in running text for r0013, r0016, r0126, r0323 and the scoring runs (r0089 and the verifier's) are
  the ledger's own, since those runs have no script-side timing. Local CPU time of these runs was 0.2 to 1.1 s
  each (4.3 s for r0141, whose client decoded four WAV files) and says nothing about the service. Four stem-scoring runs went through gtr-run: r0089 in a CPU slot (2 cores), and r0173, r0192
  and r0217 with `--nolock` and `OMP_NUM_THREADS=1` (ledger: `locked` false, no core list; 4.6 to 18.6 s of CPU
  each), so those three wall-clock figures are not 2-core figures. (The trial agent wrote that this followed a wait
  for a slot behind other lanes' jobs; a wait that ends in a `--nolock` run leaves no ledger line, so that part is
  not checkable.) The other gtr-eval scorings (notes, chords, tempo, key, beats, tuning) were run directly; each
  takes about a second.
- **Keys.** Read at run time inside the scripts with `getkey.py`, sent only in a request header, never printed or
  written. Of the key names in the key store (`getkey.py --list`, names only, filtered for this lane's services), only
  these belong to services in this lane: `GEMINI_API_KEY`, `VERCEL_AI_GATEWAY_API_KEY`, `XAI_API_KEY`,
  `DEEPSEEK_API_KEY`, `ELEVENLABS_API_KEY`. No account was created anywhere.
- **Uploads.** Only synthesized clips (S*) and freely licensed clips were sent to any service: R2 (CC BY 4.0), R3a
  (CC BY-SA 4.0) and, in the last three calls, R1c (GuitarSet, CC BY 4.0), plus files derived from them. The
  verifier also sent 1 fps frames of R3b (CC0 1.0) and R3c (CC BY 3.0), per the inputs manifest.
- **Money.** Each paid call's cost is computed from the usage the response reports and the published price
  (ElevenLabs: the credits the account counter measured times an assumed price per credit, UNVERIFIED, see that
  section), and appended to `samples/spend.jsonl` (copy of `/home/user/gtr/lanes/hosted-apis/out/spend.jsonl`). A call is refused
  by the script when spent + the call's worst case would pass 2 USD for that service or 10 USD in total
  (`scripts/llm_common.py`). Totals are at the end of this file.
- **Inputs used:** the shared set in `/home/user/gtr/inputs/` (manifest `INPUTS.md`, READY 2026-11-10T20:28:01Z).
  R3b and R3c were not in the shared set when the video trials ran (r0077 to r0129, 21:04 to 21:13 UTC): the
  manifest says the `inputs-video` agent added them between 20:52 and 21:35 UTC, and their files are dated 21:21 to
  21:27 UTC (marker `READY-VIDEO` 21:29:15 UTC). The trial agent's video trials used R3a only; the verifier later
  sent frames of R3b and R3c (no capo, per the manifest) to MiMo (trial (c), r0360 and r0391).
- Scripts are in `scripts/`, small outputs in `samples/<tool>/`. Audio and video outputs are listed at the end.

## Google Gemini API, direct (generativelanguage.googleapis.com), models `gemini-4-carbon` and `gemini-3.5-flash-lite`

- What it is: Google's hosted multimodal LLM API; audio and video go in, text comes out. Called over REST with
  `requests` 2.34.2 (no SDK), Interactions API `POST https://generativelanguage.googleapis.com/v1beta/interactions`
  with header `Api-Revision: 2026-05-20` (the form the docs show on 2026-11-10), and the legacy
  `models/<id>:generateContent` / `:countTokens` endpoints for the probes.
- Install: `uv venv --python 3.11 /home/user/gtr/lanes/hosted-apis/venv-apis` then
  `uv pip install requests gradio_client soundfile numpy yt-dlp` (111 MB on disk per the trial agent, 102 MB when
  the verifier rebuilt it from the freeze file; freeze in
  `samples/venv-apis.freeze.txt`; the venv was deleted after the trials for disk space and is rebuilt from that file
  with `uv pip install -r`). No model weights are downloaded by anything in this lane.
- Models listed by the key (`GET v1beta/models`, run 2026-11-10 20:52 UTC): 62 models, saved as
  `samples/gemini/models_list.json`. Picked: `gemini-4-carbon` (the pricing page: "Our most capable
  reasoning model"; the model page lists "Inputs Text, Image, Video, Audio, and PDF"; the model list gives it
  `version` "3.0" and `outputTokenLimit` 32768) and `gemini-3.5-flash-lite` (model version string
  `3.5-flash-lite-07-2026`; its page lists the same inputs; the pricing page: "A cost-efficient model, optimized for
  high-volume agentic tasks, translation, and simple data processing").
- Prices read 2026-11-10 from https://aistudio.google.com/docs/pricing (where https://ai.google.dev/gemini-api/docs/pricing
  redirects): `gemini-4-carbon` Standard paid tier input "$2.00 through November 30, 2026. $4.00 starting December 1,
  2026.", output "(including thinking tokens)" "$10.00 through November 30, 2026. $20.00 starting December 1, 2026."
  per 1M tokens, and "Gemini 4 Carbon is not available on the Free tier."; `gemini-3.5-flash-lite` input "$0.30
  (text / image / video / audio)", output "$2.50", free tier "Free of charge".

### Run 1: S3 chords, `gemini-3.5-flash-lite` (r0013): NOT RUN, HTTP 402

- Command: `gtr-run ... --nolock -- venv-apis/bin/python -I scripts/gemini_trial.py --model gemini-3.5-flash-lite
  --media /home/user/gtr/inputs/S3/S3.mono.wav --mime audio/wav --prompt scripts/prompts/chords_prompt.txt
  --schema scripts/prompts/chords_schema.json --out samples/gemini/S3_chords_flash-lite`.
- Answer (wall 2.17 s, saved in `samples/gemini/S3_chords_flash-lite/response.json`):
  `"code": 402, "message": "Your prepayment credits are depleted. Please go to AI Studio at https://ai.studio/projects
  to manage your project and billing. ...", "status": "RESOURCE_EXHAUSTED"`. The response reports no token usage. The ledger shows
  exit code 1 for r0013: the body is a JSON list holding the error object, which the script did not expect after
  saving it (`AttributeError: 'list' object has no attribute 'get'`).
- Probe (r0014, `scripts/gemini_probe.py`, `samples/gemini/probe/probe_gemini-3.5-flash-lite.json`): a one-word text
  prompt to the legacy `generateContent` endpoint got the same HTTP 402, so the block is on the project, not on one
  endpoint or on audio. The billing page (https://aistudio.google.com/docs/billing.md, read 2026-11-10): "When your
  Prepay credit balance on the billing account hits $0, all API keys in all projects linked to that billing account
  will stop working simultaneously. Requests then fail with an HTTP 402 Payment Required error until you add credits."
  and "The minimum purchase is $5."
- Re-run by the verifier (r0300, 21:49 UTC, the r0014 command with a new output folder,
  `samples/verify-trials/gemini/probe/`): `countTokens` HTTP 200 (TEXT 4 + AUDIO 769 = 773 tokens, as in r0014),
  `generateContent` HTTP 402 with the same message. The key was still out of credit at that time.
- Consequence: trials (a) to (d) were not run on Gemini directly. The same prompts were sent to the models the Vercel
  AI Gateway key could reach (next section). The scripts are ready for a re-run once credits are added: see
  `for-aaron.md`.

### What did run on the Gemini key: `countTokens` (no charge)

`scripts/gemini_count_tokens.py` (r0016, wall 9.76 s for 10 calls) sent each trial input inline and recorded what
the model's tokenizer counts it as (`samples/gemini/probe/count_tokens.json`). These are the input sizes a re-run
would be billed for, before the prompt text:

| clip, file | seconds | `gemini-4-carbon` | `gemini-3.5-flash-lite` |
|---|---|---|---|
| S3, `S3.mono.wav` (WAV 16-bit 44.1 kHz mono, 2,116,844 bytes) | 24.000 | AUDIO 625 + TEXT 31 = 656 | AUDIO 769 |
| S4, `S4.mono.wav` | 38.741 | AUDIO 1009 + TEXT 31 = 1040 | AUDIO 1240 |
| S2n, `S2n.mono.wav` | 29.357 | AUDIO 764 + TEXT 31 = 795 | AUDIO 940 |
| S5capo2, `S5capo2.mono.wav` | 29.357 | AUDIO 764 + TEXT 31 = 795 | AUDIO 940 |
| R3a, `R3a.mp4` (H.264 640x480 + AAC, 2,368,626 bytes) | 18.0 | VIDEO 1350 + AUDIO 540 + TEXT 31 = 1921 | VIDEO 1292 + AUDIO 577 = 1869 |

The request carried no text part; Carbon still reports 31 TEXT tokens. Flash-Lite's audio counts are 32.0 tokens
per second (769 / 24.0 s), the rate the audio page states ("32 tokens per second of audio (1 minute = 1,920
tokens)"); Carbon's are 26.0 per second (625 / 24.0 s). Input formats accepted by `countTokens`: WAV (`audio/wav`)
and MP4 (`video/mp4`) sent inline as base64. The audio page lists WAV, MP3, AIFF, AAC, OGG, FLAC, MPEG, M4A, L16,
Opus, ALAW, MULAW and WebM, "Maximum request size is 20 MB total" for inline data, "Downsampled to 16 Kbps" and
"Multi-channel audio combined to single channel".

- Output format facts (from the API reference, not observed here because generation was blocked): an interaction
  object with `status`, `steps[]` (a `model_output` step holds `content[]` of `{type: "text", text}`), and `usage`
  with `total_input_tokens`, `input_tokens_by_modality[]`, `total_output_tokens`, `total_thought_tokens`,
  `total_tool_use_tokens`, `total_cached_tokens`, `total_tokens`. JSON output is requested with
  `response_format: {type: "text", mime_type: "application/json", schema: {...}}`.
- Constraint inputs that matter for a human-in-the-loop re-run: everything goes through the prompt text (capo,
  tuning, tempo, key hints); `generation_config.thinking_level` (`low`, `medium`, `high`; Carbon defaults to
  `medium`); `max_output_tokens`; for video, `processing` with `fps` and `start_offset` / `end_offset`.

## Vercel AI Gateway (OpenAI-compatible Chat Completions) with the models its free tier allows: `xiaomi/mimo-v2.6-flash`, `meta/muse-spark-open`, `bytedance/seed-2.1-turbo`

- What it is: Vercel's hosted router to many model providers, one key, OpenAI-style endpoints at
  `https://ai-gateway.vercel.sh/v1`. Its public model list `GET https://ai-gateway.vercel.sh/v1/models` (no key) had
  506 model ids on 2026-11-10 with per-token prices and input modalities. Called with `requests` (no SDK),
  `scripts/gateway_trial.py`. Audio goes in as a Chat Completions `file` part with a base64 data URL; the gateway's
  audio page (https://vercel.com/docs/ai-gateway/inputs-and-tools/audio-input.md, "last_updated: 2026-09-08", read
  2026-11-10): "The Chat Completions endpoint rejects `input_audio` parts. Use `file` with a model that accepts audio."
- Why these models: the key is on the gateway's free tier. Every Google model asked for, and three other models with
  audio or video input, were refused before running (r0022, r0023; `samples/vercel-gateway/probe_models.json`), with
  HTTP 403 `"Free tier users do not have access to this model. Upgrade to paid credits at ... for unrestricted access."`:
  `google/gemini-3.5-flash-lite`, `google/gemini-4-carbon`, `google/gemini-3.8-flash`, `xiaomi/mimo-v2.6-pro`,
  `alibaba/qwen3.8-27b`, `moonshotai/kimi-k3`. Allowed (HTTP 200 to a one-line text prompt): `meta/muse-spark-open`,
  `xiaomi/mimo-v2.6-flash`, `bytedance/seed-2.1-turbo`. The pricing page
  (https://vercel.com/docs/ai-gateway/pricing.md, read 2026-11-10): "The free tier includes a subset of models, not
  the full catalog." and "Once you purchase credits, your account transitions to the paid tier and the monthly free
  credit no longer applies."
- The catalog entries (read from `/v1/models` at run time): `xiaomi/mimo-v2.6-flash` input `text, audio, image,
  video`, USD 0.00000014 per input token and 0.00000028 per output token, description "MiMo V2.6 Flash is Xiaomi's
  efficient multimodal reasoning model ..."; `meta/muse-spark-open` input `text, audio, image, video`, 0.00000125 /
  0.00000425, description "Muse Spark Open is Meta’s open-weight reasoning model ... This provider also documents
  audio and video input with text output.", served by baseten, fireworks, modal, nebius or togetherai;
  `bytedance/seed-2.1-turbo` input `text, image, video`, 0.0000005 / 0.0000025, no `response_format` in its
  `supported_parameters` (so its schema went into the prompt text).
- Prompts: the same four prompts written for Gemini, `scripts/prompts/` (`chords_*`, `notes_*`, `video_*`,
  `capo_*`, each a prompt text plus a JSON schema sent as `response_format: {type: "json_schema", ...}`). Default
  reasoning settings (no `reasoning` field sent), `max_tokens` 24576.
- Each call's directory under `samples/vercel-gateway/<clip>_<trial>_<model>[_<provider>]/` holds `request.json`
  (body with the base64 replaced by the file's sha256 and size), `response.json` (raw), `answer.json`, `meta.json`
  and the `eval_*.json` results.

### Trial (a): chords, tempo and key, S3 and S4 (`scripts/score_answer.sh chords`)

| run | model (provider) | clip | wall s | prompt / completion (reasoning) tokens | cost USD (response's `usage.cost`) | answer |
|---|---|---|---|---|---|---|
| r0028 | mimo-v2.6-flash (xiaomi) | S3 | 33.0 | 331 / 993 (637) | 0.00032438 | `0.00-2.44 G, 2.44-4.86 Em, 4.86-7.28 C, 7.28-9.70 D`, the same four again to 19.38, then `G` 19.38-21.80 and `G` 21.80-24.00; 99 BPM; G major; 4/4 |
| r0052 | mimo-v2.6-flash (xiaomi) | S4 | 55.4 | 423 / 2216 (1559) | 0.0006797 | `0.00-4.00 N`, then 2 s chords `D A Bm G D A G A Bm G D A G A D A G A`, `40.00-44.50 D` (the file is 38.741 s); 120 BPM; D major; 4/4 |
| r0024 | muse-spark-open (baseten) | S3 | 6.72 | 616 / 951 (885) | 0.00467095 | chords `[0.0-0.0 N]` only; 107 BPM; D minor; 4/4 |
| r0034 | muse-spark-open (fireworks only) | S3 | 0.85 | none | none | HTTP 400 from the provider, the second of "2 request validation errors": `Extra inputs are not permitted, field: 'messages[0].content.list[...][0].input_audio'` |
| r0036 | muse-spark-open (togetherai only) | S3 | 2.16 | 615 / 539 (0) | 0.0029363 | `0.00-2.10 N`, then `Eb Bb Cm Ab` repeated in 2.1-2.25 s segments up to 37.15 s (the file is 24.0 s); 110 BPM; Eb major |
| r0041 | muse-spark-open (togetherai only) | S4 | 2.71 | 800 / 61 (0) | 0.00113605 | every field is the string `"TOO_MANY_TOKENS"`; not scored |

Scores (truth S3, `S3.chords.lab`: `N` 0-2.5 s, then 2.5 s each `G Em Am7 D7 G Em`, then `C` 17.5-18.75, `D7`
18.75-20.0, `G` 20.0-24.0; 96 BPM; G major. Truth S4: `N` 0-4.14 s, then 2.07 s each `D A Bm G D A G A Bm G D A Bm G`,
then `Em7` and `A7` (1.03 s each) and `D` 35.17-38.74 s; 116 BPM; D major). Chord numbers are `mir_eval.chord`
weighted accuracies (share of the clip's duration, gtr-eval `chords`); tempo is |est - truth| / truth with a 4 %
tolerance; key is `mir_eval.key.weighted_score`.

| run | clip | chords root / majmin / sevenths | tempo est vs truth | key |
|---|---|---|---|---|
| r0028 (mimo) | S3 | 0.193 / 0.193 / 0.167 (e0018) | 99 vs 96, +3.1 %, within 4 % (e0019) | G major, exact, 1.0 (e0020) |
| r0052 (mimo) | S4 | 0.589 / 0.589 / 0.563 (e0058) | 120 vs 116, +3.4 %, within 4 % (e0059) | D major, exact, 1.0 (e0060) |
| r0024 (muse, baseten) | S3 | 0.104 / 0.104 / 0.104 (e0064) | 107 vs 96, +11.5 % (e0065) | D minor, 0.0 (e0066) |
| r0036 (muse, togetherai) | S3 | 0.0875 / 0.0875 / 0.0875 (e0061) | 110 vs 96, +14.6 % (e0062) | Eb major, 0.0 (e0063) |

Facts behind the Muse Spark Open rows: the baseten answer's `message.reasoning` text begins "We have audio recording
but we cannot hear it? The message shows musical notes characters but no actual audio file provided." The togetherai
answers carry no reasoning text. With the same prompt text through togetherai, S3 (24.0 s) gave 615 prompt tokens and
S4 (38.741 s) 800: 185 more tokens for 14.741 s more audio (12.55 tokens per second), so on that route the prompt
token count grew with the length of the audio; `usage.prompt_tokens_details.audio_tokens` was 0 in every gateway
response, for every model. MiMo's prompt tokens grew by 92 from S3 to S4 (6.2 tokens per extra second of audio) with
the same prompt text.

Re-run by the verifier (r0302, 21:49 UTC): the r0028 request again (its `request.json` is byte-identical to
r0028's), output in `samples/verify-trials/vercel-gateway/verify_S3_chords_mimo-v2.6-flash/`. HTTP 200 from
`xiaomi`, wall 34.6 s, 331 prompt tokens (320 of them reported as cached) and 1,218 completion tokens (932
reasoning), `usage.cost` 0.000343476 USD. The answer differs from r0028's: `0.0-2.5 N`, then `G Em Am7 D7 G Em C D7`
in 2.3 s segments from 2.5 to 20.9 s and `G` 20.9-24.0; 120 BPM; G major; 4/4. Scores: chords root / majmin /
sevenths 0.781 / 0.781 / 0.781 (e1189), tempo 120 vs 96, +25.0 %, outside 4 % (e1190), key G major, 1.0 (e1191).
So for the same request MiMo's S3 chord root accuracy was 0.193 in r0028 and 0.781 in r0302, and its tempo 99 and
120 BPM.

### Trial (b): notes of S2n (`gtr-eval notes`, onset within 50 ms and pitch within 50 cents)

| run | model (provider) | wall s | tokens prompt / completion (reasoning) | cost USD | notes returned | onset-only P / R / F1 | onset+offset F1 | eval |
|---|---|---|---|---|---|---|---|---|
| r0076 | mimo-v2.6-flash (xiaomi) | 156.7 | 333 / 6314 (5520) | 0.00181454 | 29 | 0.034 / 0.011 / 0.017 (1 of 90 truth notes matched) | 0.0 | e0067 |
| r0082 | muse-spark-open (togetherai) | 1.77 | 649 / 28 (0) | 0.00080705 | 0 (`{"recording_secs": 0, "notes": []}`) | 0 / 0 / 0 | 0 | e0068 |

MiMo's first 10 notes as (onset s, offset s, MIDI pitch): (0.02, 1.52, 43), (0.02, 1.52, 55), (0.02, 1.52, 59),
(0.02, 1.52, 62), (0.53, 0.98, 62), (0.99, 1.44, 64), (1.48, 1.93, 62), (1.96, 2.41, 60), (2.44, 3.94, 48),
(2.44, 3.94, 55). The first truth note of S2n is at 2.143 s (after the silent count-in bar). With `--chroma`
(octave ignored) the F1 is also 0.017.

### Trial (c): R3a video: capo, frets covered by the fretting hand, tuning

- As video, all three models: refused before running. Chat Completions `file` part `video/mp4` (r0077 mimo, routed
  to 7 providers in turn, `xiaomi` first; r0083 muse, sent with `--only togetherai`, 1 provider; r0086 seed, 1
  provider, `bytedance`): HTTP 400 `"'file part media type video/mp4' functionality not supported."`. Responses
  endpoint with an `input_video` part, the form the video-input page lists for OpenResponses (r0098 mimo,
  `scripts/gateway_video_responses.py`): HTTP 400 `"'file part media type video/*' functionality not supported."`
  after 7 provider attempts. Verifier re-runs (outputs in `samples/verify-trials/vercel-gateway/`): r0083 again
  (r0303) gave the same HTTP 400 from `togetherai`; the same MP4 request to Muse Spark Open with no provider
  restriction (r0304) was refused with the same message by all five of its providers in turn (`baseten`,
  `fireworks`, `togetherai`, `nebius`, `modal`).
- As still frames instead (`scripts/gateway_frames_trial.py`): 18 JPEG frames of `R3a.mp4` taken with
  `ffmpeg -vf fps=1 -q:v 3` (files `f_01.jpg` to `f_18.jpg`, sent as t = 0 to 17 s, 531,261 bytes in all, kept
  outside git; the verifier re-extracted them with that command and got 18 byte-identical files), each sent as an
  `image_url` part after a text label "Frame at t = <k>.0 s:", then the video prompt (with one sentence in front
  saying the images are frames at one per second, labelled with their times); `max_tokens` 16384. No audio goes in
  this way.

| run | model (provider) | wall s | tokens prompt / completion (reasoning) | cost USD | capo | tuning | fretting hand spans (lowest-highest fret) |
|---|---|---|---|---|---|---|---|
| r0107 | mimo-v2.6-flash (xiaomi) | 163.6 | 5904 / 5745 (5387) | 0.00243516 | `no` | `cannot_tell` | 0-6 s: 2-8; 7-14 s: 2-12; 15-17 s: 3-6 |
| r0127 | seed-2.1-turbo (bytedance), schema in prompt | 166.0 | 23707 / 11146 (10715) | 0.0397185 | `no` | `cannot_tell` | 0-6.5, 6.5-14.5, 14.5-17 s: visible, frets `null` |
| r0129 | muse-spark-open (fireworks) | 9.84 | 7631 / 1320 (943) | 0.01514875 | `no` | `cannot_tell` | 0-7, 7-15, 15-18 s: visible, frets `null` (the 7-15 s note says "approx. 2nd-7th fret region") |

There is no truth for R3a. What the manifest says about the picture: a medium shot of the seated player from 0 to
7.27 s (neck and fretting hand at the upper right), a wide shot of the stage with the player small in frame from 7.27
to 14.65 s, the medium shot again from 14.65 s; nylon-string classical guitar; no capo or tap video was found for the
set. MiMo's evidence text for "no capo": "The front view (e.g., t=7.0s) clearly shows the nut and upper fretboard with
no capo clamped on the neck."

Run by the verifier: the same frames question to MiMo for R3b and R3c, the two video clips that joined the shared
set after the trial ran (frames made with the same `ffmpeg -vf fps=1 -q:v 3` command, 18 per clip at the clips'
1920x1080, kept under `/home/user/gtr/lanes/hosted-apis/verify/frames/`; outputs in
`samples/verify-trials/vercel-gateway/verify_R3b_frames_mimo-v2.6-flash/` and `..._R3c_...`; script
`scripts/verify-trials/batch_frames_r3bc.sh`). Neither clip has a truth file; the manifest's descriptions say "No
capo." for both, for R3b that the fretting hand is "in the low positions in the frames looked at (one every 3 s)",
with "frets 2-4 under the fingers" on the frame at 9 s of the excerpt (209 s of the original), and for R3c that "the
hand is near the nut" on the frame at 10 s of the excerpt (232 s of the original).

| run | clip (frames, bytes) | wall s | tokens prompt / completion (reasoning) | cost USD | capo | tuning | fretting hand spans (lowest-highest fret) |
|---|---|---|---|---|---|---|---|
| r0360 | R3b (18, 1,565,337) | 47.5 | 37224 / 8332 (7813) | 0.00754432 | `no` | `cannot_tell` | 0-3 s: 7-10; 4-11 s: 1-3; 12 s: `null` ("in motion (blurred)"); 13-16 s: 7-10; 17 s: 5-7 |
| r0391 | R3c (18, 1,735,015) | 123.8 | 37224 / 4446 (4010) | 0.00645624 | `no` | `cannot_tell` | 0-7 s: 1-3; 7-10 s: 5-8; 10-14 s: 1-3; 14-17 s: 5-8; 17 s: 2-4 |

Each answer departs from the requested schema in one field although `response_format` carried the schema: R3b gives `visible` as
the string `"yes"` (the schema says boolean), and R3c puts the tuning under the key `value` instead of `tuning`.

### Trial (d): S5capo2 audio only, "is a capo used?" (`gtr-eval tuning --est-capo`, `gtr-eval key`)

| run | model (provider) | wall s | tokens | cost USD | answer | capo vs truth 2 | key vs truth A major |
|---|---|---|---|---|---|---|---|
| r0080 | mimo-v2.6-flash (xiaomi) | 12.9 | 310 / 187 (113) | 0.00009576 | `capo_used: yes, capo_fret: 2, key: A major`; evidence "The piece has a distinct, bright, and slightly compressed tone characteristic of a capo. ..." | equal (e0069) | exact, 1.0 (e0070) |
| r0084 | muse-spark-open (togetherai) | 1.76 | 627 / 57 (0) | 0.0009028 | `capo_used: no, capo_fret: null, key: C minor` | not equal, 0 vs 2 (e0071) | 0.0 (e0072) |

The first table row is one answer to one request. The same S5capo2 request was then sent twice more, and the capo
question was also put to S2n (no capo) as a control (second batch, `scripts/run_gateway_batch2.sh`, MiMo only):

| run | clip | wall s | tokens prompt / completion (reasoning) | cost USD | answer | capo vs truth | key vs truth |
|---|---|---|---|---|---|---|---|
| r0080 | S5capo2 (1st) | 12.9 | 310 / 187 (113) | 0.00009576 | yes, fret 2, A major | 2 = 2 (e0069) | A major, 1.0 (e0070) |
| r0196 | S5capo2 (2nd) | 89.7 | 310 / 2561 (2467) | 0.0007253568 | no, null, A major; evidence "... open chord shapes. The distinct ringing and natural pitch of the open A, D, and low E bass strings indicate that no capo is being used ..." | 0 vs 2 (e0419) | A major, 1.0 (e0420) |
| r0203 | S5capo2 (3rd) | 94.0 | 310 / 3087 (2993) | 0.0008726368 | yes, fret 2, B major; evidence "... standard open chord shapes (A, D, A, E), but the resulting pitches are a whole step higher (B, E, B, F#) ..." | 2 = 2 (e0421) | B major vs A major, 0.0 (e0422) |
| r0182 | S2n (control, truth capo 0, G major) | 14.0 | 310 / 253 (182) | 0.00011424 | no, null, G major | 0 = 0 (e0395) | G major, 1.0 (e0396) |

### Trial (e), added here: open-string tuning, tuning offset and capo from audio (MiMo only)

Prompt `scripts/prompts/tuning_prompt.txt` asks for `open_strings_midi` (six MIDI numbers, low to high, without a
capo), `tuning_name`, `offset_cents` from A4 = 440 Hz, `capo_fret`; scored with `gtr-eval tuning` (`--est-cents`,
`--est-capo`, `--est-tuning-midi`).

| run | clip (truth) | wall s | tokens prompt / completion (reasoning) | cost USD | answer | gtr-eval |
|---|---|---|---|---|---|---|
| r0210 | S5dropd (drop D [38,45,50,55,59,64], 0 cents, no capo) | 22.1 | 399 / 791 (677) | 0.00027734 | [40,45,50,55,59,64] "Standard", -15 cents, capo 0 | low string 2 semitones off, other five equal; offset -15 vs 0 cents; capo equal (e0423) |
| r0212 | S7flat30 (standard, -30 cents) | 31.3 | 366 / 956 (833) | 0.00031892 | [40,45,50,55,59,64] "standard", -10 cents, capo 0 | tuning equal; offset -10 vs -30 cents (difference +20); capo equal (e0424) |
| r0213 | S2n (standard, 0 cents; control) | 14.4 | 399 / 1451 (1316) | 0.00046214 | [40,45,50,55,59,64] "standard", 0 cents, capo 0 | tuning equal; offset 0 vs 0; capo equal (e0425) |

- Output format facts: OpenAI chat-completion JSON. `choices[0].message.content` is a string holding the JSON
  answer; `choices[0].message.reasoning` is the model's reasoning text when the route returns it (present for MiMo,
  Seed, and Muse via baseten and via fireworks; absent for Muse via togetherai);
  `choices[0].message.provider_metadata.gateway.routing.finalProvider` names the provider that served it;
  `usage` has `prompt_tokens`, `completion_tokens` (reasoning included), `completion_tokens_details.reasoning_tokens`,
  `prompt_tokens_details` (`cached_tokens`, `audio_tokens`, `video_tokens`), `cost`, `market_cost`, `gateway_cost`
  in USD.
- Input format facts: WAV 16-bit 44.1 kHz mono up to 3.4 MB (S4) went in as a data URL in a `file` part; MP4 video
  as a `file` part was refused for all three free-tier models (for Muse Spark Open on all five providers, r0304);
  JPEG frames as `image_url` parts were accepted.
- Constraint inputs for a re-run: only the prompt text (capo, tuning, key or tempo hints), `reasoning.effort`, and
  `providerOptions.gateway.only` / `order` to choose the provider.

## ElevenLabs Stem Separation API, `six_stems_v1`

- What it is: ElevenLabs' hosted music stem splitter, `POST https://api.elevenlabs.io/v1/music/stem-separation`
  (multipart form). API reference https://elevenlabs.io/docs/api-reference/music/separate-stems.md and the OpenAPI
  spec https://api.elevenlabs.io/openapi.json (both read 2026-11-10): form fields `file` (required),
  `stem_variation_id` (enum `two_stems_v1`, `six_stems_v1`; default `six_stems_v1`), `sign_with_c2pa`; query
  `output_format` (default `mp3_44100_128`; "MP3 with 192kbps bitrate requires you to be subscribed to Creator tier or
  above. PCM with 44.1kHz sample rate requires you to be subscribed to Pro tier or above."), `enable_logging`.
  Response: "ZIP archive containing separated audio stems. Each stem is provided as a separate audio file in the
  requested output format." The page also says: "This endpoint might have high latency, depending on the length of
  the audio file."
- Call: `scripts/elevenlabs_call.py stems /home/user/gtr/inputs/S4/S4.wav <out> --variation six_stems_v1
  --format mp3_44100_192` (r0064). Input: `S4.wav`, WAV 16-bit 44.1 kHz stereo, 6,834,024 bytes, 38.741 s.
- Result: HTTP 200, request round trip 6.98 s (the run's wall of 14.45 s also holds two account reads and a 3 s
  wait). A ZIP of 5,586,876 bytes with six files, `drums.mp3`, `vocals.mp3`, `piano.mp3`, `guitar.mp3`, `bass.mp3`, `other.mp3`,
  each 931,048 bytes, MP3 192 kb/s, 44.1 kHz, 2 channels, 38.791833 s (`samples/elevenlabs/S4_six_stems/record.json`).
- Re-run by the verifier (r0315, 21:51 UTC, the r0064 command with new output folders; record in
  `samples/verify-trials/elevenlabs/verify_S4_six_stems/`): HTTP 200, request round trip 6.87 s, 1,065 credits, a ZIP
  of 5,586,876 bytes whose six MP3s are byte-identical (same SHA-256) to r0064's; only the ZIP container bytes
  differ. The scores below therefore hold for the re-run's output too.
- Cost: the response carried no cost header. The account's used-credit counter (`GET /v1/user/subscription`,
  `character_count`; only differences are written here, not the account's own figures) was read at 21:01:33 UTC,
  before the call (which started at 21:02:44); the script's own read 3 s after the call saw no change; a read at
  21:05:00 UTC was 1,065 higher. No other ElevenLabs call was made from this lane between those reads (another agent
  using the same account in that window would also show up in the difference). The two later stem calls, measured
  by polling, came to the same rate per second of audio (table below), and the verifier's re-run of this call on S4
  (r0315, polling) measured 1,065 credits again. The API price page (https://elevenlabs.io/pricing/api, read
  2026-11-10) lists no stem separation rate; for the spend cap the call is counted at 1,065 x 0.00022 USD = 0.2343 USD.
  UNVERIFIED: the 0.00022 USD per credit (22 USD per 100,000 credits) is the trial script's own assumption
  (`USD_PER_CREDIT_EST` in `scripts/elevenlabs_call.py`); no page read in this lane states a USD price per credit, so
  every ElevenLabs USD figure in this file is an estimate on that assumption. A published per-credit price, or the
  account's billing page, would settle it.
- Timing of the stems: decoded with ffmpeg to 44.1 kHz WAV, the sum of the six stems lies 1,105 samples (25.06 ms)
  after the input mix (cross-correlation of the mono sum with the mono mix over the first 20 s,
  `scripts/stem_alignment.py`). After cutting the first 1,105 samples of every stem (`ffmpeg -af
  atrim=start_sample=1105`) the lag is 0 and the RMS of (mix - sum of stems) is -45.59 dBFS against a mix RMS of
  -17.44 dBFS. Stem levels (RMS of the mono decode): guitar -22.39, other -22.67, bass -24.22, drums -29.25, piano
  -108.32, vocals -112.58 dBFS.
- Scores (gtr-eval `stems`, e0057, scoring run r0089 on 2 cores, wall 17.36 s, peak 931 MB): delay-trimmed stems,
  mono, 38.741 s, mapping truth `drums`=drums.mp3, `bass`=bass.mp3, `guitar`=guitar.mp3, `lead`=other.mp3 (the S4
  lead is a General MIDI "Voice Oohs" line; the service's vocals stem is at -112.58 dBFS). SI-SDR is gtr-eval's
  scale-invariant SDR; SDR, SIR, SAR are `mir_eval.separation.bss_eval_sources` over the whole clip, all four stems
  in one call.

| truth stem | estimate file | SI-SDR dB | SDR dB | SIR dB | SAR dB |
|---|---|---|---|---|---|
| drums | drums.mp3 | 13.43 | 13.91 | 25.29 | 14.25 |
| bass | bass.mp3 | 15.16 | 15.77 | 26.16 | 16.20 |
| guitar | guitar.mp3 | 13.70 | 13.89 | 20.83 | 14.91 |
| lead | other.mp3 | 15.76 | 16.60 | 27.55 | 16.97 |

Re-scored by the verifier: the delay-trimmed WAVs remade with the recipe at the end of this file have the same
SHA-256 as the ones scored in e0057, e0391 and e0426, and `gtr-eval stems` on them with the same mappings gave
identical metrics and counts (e1315, e1316, e1317; scoring runs r0339, r0340, r0342, `--nolock`,
`OMP_NUM_THREADS=1`). SI-SDR written out separately in numpy (`scripts/verify-trials/si_sdr_check.py`): S4 guitar
13.6999, S4 lead (other.mp3) 15.7550, S6taps guitar 26.7740, R2 vocals 15.4436 dB, the same as gtr-eval's to the
second decimal.

### Two more `six_stems_v1` calls: S6taps (guitar plus percussion taps) and R2 (a real band song)

| run | input | request round trip s | credits (counter difference) | counted USD | ZIP bytes | stems (each MP3 192 kb/s 44.1 kHz stereo) |
|---|---|---|---|---|---|---|
| r0064 | S4.wav, 38.741 s | 6.98 | 1,065 | 0.2343 | 5,586,876 | 6 files, 931,048 bytes, 38.791833 s |
| r0189 | S6taps.wav, 29.357 s | 6.10 | 807 | 0.17754 | 4,232,688 | 6 files, 705,350 bytes, 29.387750 s |
| r0194 | R2.wav, 36.000 s | 6.78 | 990 | 0.2178 | 5,191,902 | 6 files, 865,219 bytes, 36.048958 s |

The three credit differences are 27.49, 27.49 and 27.50 credits per second of input audio. For r0189 and r0194 the
script polled the counter every 5 s until it changed (after the r0064 delay).

- S6taps (truth stems `guitar` and `taps`, the latter General MIDI side stick and bass drum standing in for body
  taps): the same 1,105-sample delay; stem levels guitar -18.50, drums -32.33 dBFS, the other four at -117 dBFS or
  lower (bass -123.11, other -117.34, piano -129.49, vocals -131.28). gtr-eval `stems` (e0391, run r0192), delay
  trimmed, `guitar`=guitar.mp3, `taps`=drums.mp3: guitar SI-SDR 26.77, SDR 27.01, SIR 33.56, SAR 28.10 dB; taps
  SI-SDR 13.23, SDR 14.15, SIR 26.26, SAR 14.43 dB.
- R2 (truth "stems" are the artist's own instrumental and the song minus it, `vocals_derived`; see the manifest):
  the same 1,105-sample delay; stem levels vocals -12.78, guitar -19.20, bass -19.91, drums -22.62, other -100.47,
  piano -107.44 dBFS (mix -10.42). After the trim, the RMS of (mix - sum of the six stems), mono, over the 36.000 s
  of the input, is -38.69 dBFS (S4: -45.59; S6taps: -47.44). (The trial agent's figure here was -15.40 dBFS; the
  verifier recomputed it from the stems remade with the recipe at the end of this file, byte-identical to the ones
  scored, with `scripts/verify-trials/check_stem_levels.py`, and got -38.69; before the trim it is -6.86.) gtr-eval
  `stems` (e0426, run r0217), `vocals_derived`=vocals.mp3 and `instrumental`= the sum of the other five stems
  (`ffmpeg amix=inputs=5:normalize=0`): vocals SI-SDR 15.44, SDR 15.67, SIR 22.23, SAR 16.77 dB;
  instrumental SI-SDR 13.59, SDR 14.05, SIR 25.42, SAR 14.39 dB.

- Output format facts, for handoffs: a ZIP; one MP3 per stem named `<stem>.mp3` (six names fixed by
  `six_stems_v1`); stereo; the sample rate requested; decoded with ffmpeg 6.1.1, each MP3 starts 1,105 samples late and
  is longer than the input (S4 by 2,225 samples, S6taps by 1,350, R2 by 2,160 at 44.1 kHz), so a tool that compares
  stems with the input sample by sample needs the trim.
- Input format facts: a stereo 16-bit 44.1 kHz WAV of 6.8 MB was accepted.
- Constraint inputs for a re-run: `stem_variation_id` only (two or six stems); no instrument prompt, no time range.

## ElevenLabs Speech to Text, `scribe_v3`, on R2 (sung lyrics)

- What it is: ElevenLabs' transcription API, `POST https://api.elevenlabs.io/v1/speech-to-text`, multipart form.
  The OpenAPI spec lists `model_id`, `file` or `source_url` ("Supports hosted video or audio files, YouTube video URLs,
  TikTok video URLs, and other video hosting services."), `language_code`, `tag_audio_events` (default true),
  `timestamps_granularity` (`none`, `word`, `character`), `diarize`, `keyterms` and more.
- Call: `scripts/elevenlabs_call.py stt /home/user/gtr/inputs/R2/R2.wav <out> --model scribe_v3` (r0108) with
  `timestamps_granularity=word`, `tag_audio_events=true`, `diarize=false`; no `seed` or `temperature` sent. Input
  `R2.wav` (36.000 s, CC BY 4.0 song: "I Want to Destroy Something Beautiful" by Josh Woodward,
  https://www.joshwoodward.com/, CC BY 4.0).
- Result: HTTP 200, request round trip 0.92 s (ledger wall 31.05 s, which includes the credit-counter polling);
  response header `character-cost: 11`; the credit counter rose by 11. Counted at max(11 x 0.00022, 36 s x the API
  price page's Scribe v3 rate, "$0.20" "Price per hour") = 0.00242 USD. Output JSON (5,856 bytes,
  `samples/elevenlabs/R2_stt_scribe_v3/stt.json`): keys `language_code` (`eng`), `language_probability` (0.98),
  `text`, `words` (32 entries of type `word` and 31 of type `spacing`, each with `text`, `start`, `end`, `logprob`;
  no `audio_event` entries), `transcription_id`, `audio_duration_secs` (36.0). Text: "'Cause I've been trying to find
  out if an angel bends or breaks. Or shatters like a stone. I want to destroy something beautiful for you. I want to
  destroy for you." First words: 'Cause 0.82-1.48 s, I've 1.62-1.80, been 1.94-2.16, trying 2.32-2.68.
- Re-run by the verifier (r0318, 21:51 UTC, same command and settings;
  `samples/verify-trials/elevenlabs/verify_R2_stt_scribe_v3/`): HTTP 200, request round trip 1.24 s, 11 credits. The transcript differs from r0108's: "I wanna destroy" in both
  places where r0108 has "I want to destroy", so 30 `word` and 29 `spacing` entries; `language_probability` 0.972;
  the first four words have the same times. The OpenAPI spec's `seed` field says: "If specified, our system will make
  a best effort to sample deterministically, such that repeated requests with the same seed and parameters should
  return the same result. Determinism is not guaranteed."; its `temperature` field: "If omitted, we will use a
  temperature based on the model you selected which is usually 0." (https://api.elevenlabs.io/openapi.json, saved
  copy read 2026-11-10).
- There is no lyric truth for R2, so nothing is scored.

## xAI speech to text, `grok-voice-transcribe-2.0`, on R2

- What it is: xAI's transcription endpoint `POST https://api.x.ai/v1/stt` (docs
  https://docs.x.ai/developers/model-capabilities/audio/speech-to-text.md, read 2026-11-10): multipart form, `file`
  last, optional `language`, `format`, `diarize`, `keyterm`, `filler_words`, `vad_threshold`, `multichannel`; the
  response has `text`, `duration`, `words[]` with `text`, `start`, `end`. Price
  (https://docs.x.ai/developers/pricing.md): "Speech to Text | $0.10 / hr (REST), $0.20 / hr (Streaming)".
- Call: `scripts/xai_stt.py /home/user/gtr/inputs/R2/R2.wav <out> en` (r0105), model `grok-voice-transcribe-2.0`,
  `language=en`. HTTP 200 in 5.75 s. Counted cost 36 s x 0.10 USD/h = 0.001 USD.
- Output (`samples/xai/R2_stt/response.json`): `language` `en`, `duration` 36.0, 30 words with times. Text: "Cause I've
  been trying to find out if an angel bends or breaks. All shadows like a stone. I wanna destroy something beautiful
  for you. I wanna destroy for you." First words: Cause 0.84-1.361 s, I've 1.361-1.641, been 1.901-2.121.
- Re-run by the verifier (r0306, 21:50 UTC, same command; `samples/verify-trials/xai/verify_R2_stt/`): HTTP 200 in
  1.11 s; the response JSON is identical to r0105's.
- No lyric truth exists for R2; the ElevenLabs r0108 transcript and this one differ in the second line ("Or shatters
  like a stone." against "All shadows like a stone."), in "want to" against "wanna" (twice) and in the leading
  apostrophe of "'Cause"; the ElevenLabs re-run r0318 also has "wanna", so it differs from this one only in the
  second line and that apostrophe (word-level diff of the `text` fields).

## xAI chat models and DeepSeek: no audio or video input (no trial)

- `GET https://api.x.ai/v1/language-models` with the xAI key (2026-11-10, `samples/xai/models_xai_deepseek.json`,
  `scripts/list_models_xai_deepseek.py`) lists 8 language models (`grok-4.20-0309-non-reasoning`,
  `grok-4.20-0309-reasoning`, `grok-4.20-multi-agent-0309`, `grok-4.3`, `grok-4.5`, `grok-4.6`, `grok-4.7`,
  `grok-build-0.1`), every one with `input_modalities` `["text", "image"]`. `/v1/models` adds image and video
  generation models (`grok-imagine-*`). The docs index (https://docs.x.ai/llms.txt, read 2026-11-10) lists Voice pages
  for Speech to Speech, Text to Speech and Speech to Text; only the Speech to Text page was read and tried (above).
  Because no listed language model takes audio or video, the chord, note, capo and video trials were not sent to xAI.
- `GET https://api.deepseek.com/models` with the DeepSeek key lists `deepseek-flash` (`input_modalities`
  `["text", "image"]`) and `deepseek-v4-pro` (`["text"]`). No audio or video input, so no DeepSeek trial was run.
- Re-run by the verifier (r0307, 21:50 UTC, same script; `samples/verify-trials/xai/models_xai_deepseek.json`): the
  same model ids and input modalities from all three endpoints.

## Hugging Face Inference Providers: no call possible without a token

- `POST https://router.huggingface.co/v1/chat/completions` and
  `POST https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3`, sent without a token on
  2026-11-10: both answered HTTP 401 with an HTML page (the verifier sent both again with curl at 22:00 UTC: HTTP 401,
  `text/html`, both). No Hugging Face token exists in the key store, so nothing was sent to Inference Providers.

## yt-dlp 2026.10.26 (taking audio from a video link)

- What it is: the command-line downloader; PyPI `yt-dlp==2026.10.26`, installed in `venv-apis` with `uv pip`. The
  wheel's metadata: `License-Expression: Unlicense`; its LICENSE file begins "This is free and unencumbered software
  released into the public domain."
- Run (r0126): the archive.org source item of R3a (CC BY-SA 4.0), not YouTube.
  `yt-dlp -F https://archive.org/details/scm-422828-crescendo313-drh-meredithconn` listed three formats: `0` mp3
  (19.23 MiB, "derivative"), `1` ogv 400x300 (124.90 MiB), `2` mp4 640x480 (166.96 MiB), and printed `WARNING: "asr"
  field is not numeric - forcing int conversion, there is an error in extractor`. Then
  `yt-dlp -f 0 --download-sections "*400-418" -x --audio-format wav -o "R3a_ytdlp_400-418.%(ext)s" <same URL>`:
  wall 10.9 s; it fetched 211.61 KiB (only the section, through ffmpeg) and wrote `R3a_ytdlp_400-418.wav`, PCM
  16-bit, 48,000 Hz, 1 channel, 18.013 s, 1,729,374 bytes (kept outside git). Note: the shared clip `R3a.wav` was
  cut from the item's MP4 (AAC 44.1 kHz stereo); the item's MP3 derivative that yt-dlp picked here is 48 kHz mono.
- Re-run by the verifier (r0323, 21:53 UTC, same command in a new folder): wall 18.03 s, 211.61 KiB fetched, and a
  WAV byte-identical (same SHA-256) to r0126's.
- YouTube was not contacted. The YouTube Terms of Service (https://www.youtube.com/static?template=terms&hl=en&gl=US,
  "Dated: December 15, 2023", read 2026-11-10) say, under the restrictions: "You are not allowed to: access,
  reproduce, download, distribute, transmit, broadcast, display, sell, license, alter, modify or otherwise use any
  part of the Service or any Content except: (a) as expressly authorized by the Service; or (b) with prior written
  permission from YouTube and, if applicable, the respective rights holders;" and "access the Service using any
  automated means (such as robots, botnets or scrapers) except (a) in the case of public search engines, in
  accordance with YouTube’s robots.txt file; or (b) with YouTube’s prior written permission;".
- Constraint inputs that matter here: `--download-sections "*<start>-<end>"` fetches only a time range; `-f` picks a
  format; `-x --audio-format wav` converts with ffmpeg.

## Hugging Face public Spaces, called with `gradio_client` and no token

- What it is: demo apps on Hugging Face that expose a Gradio API; `gradio_client` 2.7.2 (in `venv-apis`) calls them
  from Python. Spaces were found with `https://huggingface.co/api/spaces?search=<q>&sort=likes&direction=-1` and their
  hardware read from `https://huggingface.co/api/spaces/<id>/runtime` just before each call (2026-11-10). Endpoints
  and parameters were read with `Client(id).view_api()` (`scripts/hf_space_view.py`, saved in
  `samples/hf-spaces/spaces_api.json`). Calls: `scripts/hf_space_call.py` (submit, poll the job status every second,
  copy returned files); `scripts/hf_space_call_old.py` with `gradio_client` 0.5.3 for a Gradio 3 Space (venv
  `venv-gc-old`, Python 3.10, `uv pip install "gradio_client==0.5.3" "websockets<12" requests`, 13 MB; freeze in
  `samples/venv-gc-old.freeze.txt`; deleted after use). Each call's `record.json` (Space id, Space
  commit sha, hardware, status changes with times, wall-clock, result) is in `samples/hf-spaces/<call>/`.
- Searched and not in a running stage on 2026-11-10 (stage from the runtime API): `akhaliq/demucs` RUNTIME_ERROR,
  `ahk-d/Spleeter-HT-Demucs-Stem-Separation-2025` RUNTIME_ERROR ("Memory limit exceeded (16Gi)"),
  `owiedotch/demucs-stem-separation`, `kajise/Demucs_v4-FT_4s`, `Thafx/Demucs_v4_2s_HT`, `Kevin676/Demucs_v4`,
  `sparanoid/demucs-gpu`, `Hmjz100/MT3`, `akhaliq/sam-audio-large` RUNTIME_ERROR, `njolnir/Dia-Beat-This` BUILD_ERROR.
  (The trial agent gave no stage for six of them; the verifier read all ten at 21:58 UTC: every one RUNTIME_ERROR
  except `njolnir/Dia-Beat-This` BUILD_ERROR, the six with these error messages: owiedotch and kajise "Scheduling
  failure: unable to schedule", Thafx a Python traceback in `gr.Interface(`, Kevin676 "Exit code: 128. Reason:
  failed to create containerd task", sparanoid "Exit code: ?", Hmjz100/MT3 "Exit code: 1" with a numpy traceback.)
  No Space for Basic Pitch with a Gradio API was found (search "basic-pitch": two static pages and two Docker apps);
  no audio chord-recognition Space was found (`ksangk/chord-demo`, the top "chord" result that was running, is an
  image-material demo whose endpoint returns "Basecolor" images). Authors `CPJKU` (Beat This!) and `spotify` have no
  such Spaces.

| call | Space (commit) | hardware | input | wall s | what came back |
|---|---|---|---|---|---|
| r0112 | `mimbres/YourMT3` (5e66c1ea) `/process_audio` | zero-a10g | S2n.mono.wav | 5.32 | HTML (7,498 chars) with a MIDI player; the MIDI is inline as `data:audio/midi;base64,...` (1,175 bytes once decoded) |
| r0164 | `mimbres/YourMT3-cpu` (bd69fbac) `/process_audio` | cpu-basic | S2n.mono.wav | 31.18 | the same kind of HTML; MIDI 1,177 bytes, not byte-identical to r0112's |
| r0118 | `teamup-tech/Beat-This` (8f2aa339) `/process` | cpu-basic | S4.wav | 12.59 | a WAV "Audio with Beats" (6,834,024 bytes, kept outside git) and a `pyharp.LabelList` of 68 labels `beat` / `downbeat` with `t` in seconds |
| r0119 | `nakas/demucs_playground` (d924a6d3) `/predict` | cpu-basic | S4.wav | 1.67 | `ValueError('Unknown protocol: ws')` from gradio_client 2.7.2 (the Space runs Gradio 3 with `enable_queue=True`) |
| r0141 | same, with gradio_client 0.5.3 | cpu-basic | S4.wav | 172.46 (processing 4.26 to 167.45 s) | four WAVs, `vocals`, `bass`, `drums`, `other`, each 16-bit 44.1 kHz stereo, 38.741383 s (sample count equal to the input) |
| r0116 | `hugging-apps/muscriptor-music-transcription` (a00afb21) `/transcribe`, instruments `["acoustic_guitar"]` | zero-a10g | S2n.mono.wav | 3.17 | `AppError('You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens')` |
| r0162 | `lpeterl/sam-audio-webui` (f4c65453) `/process`, `sam-audio-small`, prompt "acoustic guitar", chunk 30 s | zero-a10g | S4.wav | 3.15 | the same ZeroGPU AppError |

No job reported a queue position (`rank` and `queue_size` stayed empty in every status update). The two ZeroGPU
refusals came after one successful ZeroGPU call from this box (r0112); whether other agents on the box used ZeroGPU
quota in the same window is not known.

Re-runs by the verifier (21:49 to 21:53 UTC, the recorded commands with new output folders under
`/home/user/gtr/lanes/hosted-apis/verify/hf-spaces/`; the Space commits read before each call were the same as in
the table):

| run | re-run of | wall s | what came back, compared with the trial's output |
|---|---|---|---|
| r0305 | r0164, YourMT3-cpu on S2n | 26.46 | MIDI 1,177 bytes, byte-identical (same SHA-256) to r0164's |
| r0308 | r0118, Beat-This on S4 | 6.89 | the same 68 beat times and 18 downbeat times; the click WAV byte-identical to r0118's |
| r0309 | r0116, Muscriptor on S2n | 3.57 | the same ZeroGPU "runs limit" AppError |
| r0311 | r0112, YourMT3 (ZeroGPU) on S2n | 3.42 | refused this time: `AppError("'You have exceeded your ZeroGPU quota (90s requested vs. 79s left). Try again in 15:33:27. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens'")` |
| r0322 | r0141, demucs_playground (gradio_client 0.5.3) on S4 | 155.50 (processing 4.32 to 149.49 s) | four WAVs of the same size, sample rate and length, but all four differ from r0141's in content (different SHA-256); scores below |

Which model each Space runs, from the Space's own `app.py` (read 2026-11-10): YourMT3 and YourMT3-cpu,
`model_name = 'YPTF.MoE+Multi (noPS)'`, precision `'16'` on the ZeroGPU Space and `'16' if torch.cuda.is_available()
else '32'` on the CPU Space; Beat-This, `beat_this.inference.File2Beats` with checkpoint `final0.ckpt`, `dbn=False`;
demucs_playground, `python3 -m demucs.separate -n mdx_extra_q -d cpu` (it writes the upload to `test.wav` first).

Scores:

- YourMT3 (r0112) on S2n, all MIDI tracks pooled (126 notes in three tracks: "Acoustic Piano" program 0, 15 notes;
  "Electric Piano" program 2, 58; "Guitar (clean)" program 24, 53; no pitch bends; no tempo event in the file,
  so readers use the MIDI default of 120 BPM): onset-only
  P 0.627, R 0.878, F1 0.731 (79 of 90 truth notes matched); onset+offset F1 0.657; chroma (octave ignored) onset-only
  F1 0.806; recall by voice: melody 42/42, bass 37/48; matched onsets: median +3.3 ms, 95th percentile 8.8 ms (e0110).
  Guitar track only (`--midi-programs 24-31`, 53 notes): onset-only P 0.981, R 0.578, F1 0.727; onset+offset F1 0.671
  (e0111). YourMT3-cpu (r0164): the same note counts per track; onset-only P 0.627, R 0.878, F1 0.731; onset+offset
  F1 0.667 (e0277).
- Beat-This (r0118) on S4: 68 beats, 18 of them labelled `downbeat` (taken as beats too). First beats 0.52, 1.06,
  1.56, 2.08, 2.60 s; the truth's first beat is 2.069 s (the audible count-in bar; the first bar is silent). Beat
  F-measure 0.956 (65 of 68 within 70 ms), CMLt and AMLt 0.956, matched beats median +12.4 ms; downbeats F-measure
  0.971 (17 of 17 truth downbeats, 18 estimated) (e0160).
- demucs_playground (r0141) on S4: the stems sum back to the mix with lag 0 and a residual RMS of -51.59 dBFS (mix
  -17.44). Stem levels: other -21.10, bass -26.28, vocals -26.59, drums -29.42 dBFS. gtr-eval `stems` (e0360, run
  r0173), mapping truth `drums`=drums, `bass`=bass, `guitar`=other, `lead`=vocals (the model has no guitar stem; the
  S4 lead is a "Voice Oohs" line):

| truth stem | estimate | SI-SDR dB | SDR dB | SIR dB | SAR dB |
|---|---|---|---|---|---|
| drums | drums.wav | 8.49 | 8.92 | 19.20 | 9.40 |
| bass | bass.wav | 5.29 | 8.06 | 20.50 | 8.36 |
| guitar | other.wav | 2.94 | 3.10 | 4.27 | 10.75 |
| lead | vocals.wav | 6.37 | 7.55 | 16.70 | 8.21 |

- The verifier's re-run of this Space (r0322) returned different sample values (above); scored the same way (e1331,
  scoring run r0344, `--nolock`), SI-SDR / SDR / SIR / SAR in dB: drums 8.46 / 8.90 / 19.16 / 9.38, bass 5.31 /
  8.10 / 20.69 / 8.39, guitar (other.wav) 3.07 / 3.23 / 4.50 / 10.51, lead (vocals.wav) 6.42 / 7.58 / 16.73 / 8.24.
  The Space's `app.py` runs `python3 -m demucs.separate -n mdx_extra_q -d cpu test.wav -o out` with no `--shifts`
  or seed option.

- Output format facts, for handoffs: YourMT3 Spaces return an HTML string, not a file; the MIDI has to be cut out
  of its `data:audio/midi;base64,` URL; it is a format-1 MIDI file, 480 ticks per quarter note, an empty first track
  and then one track per predicted instrument with a General MIDI program (4 tracks in all for S2n and for the S4
  guitar stem, 2 for R1c), no tempo event, every note at velocity 100. Beat-This returns pyharp labels (`t`, `label` in
  {`beat`, `downbeat`}, `amplitude`, `color`) and a click-mixed WAV at the input's sample rate. demucs_playground
  returns four WAV file paths.
- Input format facts: WAV 44.1 kHz (mono 16-bit for S2n.mono.wav, stereo 16-bit for S4.wav) was accepted by all
  four Spaces that ran; YourMT3-cpu also took an MP3 (the handoff below).
- Constraint inputs: none for YourMT3 and Beat-This through these endpoints (the audio file is the only parameter);
  Muscriptor takes an `instruments` list (35 values including `acoustic_guitar`, `clean_electric_guitar`,
  `distorted_electric_guitar`, `acoustic_bass`, `electric_bass`, `drums`), `use_sampling` and `temperature`, and its
  API lists four returns: "Download MIDI file" (a file path), "Summary", "MIDI playback & visualization" and "Piano
  roll (per instrument)";
  SAM Audio takes a model size, an audio or video file, a text `prompt` and `chunk_duration`.

## A real recording with truth: R1c (GuitarSet, bossa nova comping, 28.235 s) through three of the services above

| run | service | wall s | what came back | numbers against the R1c truth |
|---|---|---|---|---|
| r0245 | HF Space `mimbres/YourMT3-cpu`, `R1c.mono.wav` | 31.34 | MIDI 1,043 bytes, one track "Guitar (clean)" program 24, 129 notes | onset-only P 0.922, R 0.804, F1 0.859 (119 of 148); onset+offset F1 0.693; chroma onset-only F1 0.859; matched onsets median -5.2 ms (e0690) |
| r0246 | HF Space `teamup-tech/Beat-This`, `R1c.wav` | 5.69 | 56 beats, 14 of them downbeats; first beats 0.00, 0.52, 1.02, 1.52, 2.04 s | beats F-measure 1.0 (56 of 56 within 70 ms), CMLt 1.0, matched median +11.3 ms; downbeats F-measure 1.0 (14 of 14) (e0693) |
| r0248 | Vercel AI Gateway, `xiaomi/mimo-v2.6-flash` (xiaomi), chords prompt, `R1c.mono.wav` | 52.4 | `G D C G C G D C G` in 3 s segments from 0.00 to 28.00 (first 3.5 s, last 3.5 s); 84 BPM; G major; 357 / 866 tokens (589 reasoning); 0.00029246 USD | chords root / majmin / sevenths 0.474 (e0696; truth: 2.017 s segments `G D Em Bm C G C D G D Em Bm C G`); tempo 84 vs 119, -29.4 %, outside 4 % at every factor (e0699); key G major, exact (e0702) |

## Services in this lane NOT RUN HERE (no account or key; nothing was signed up for)

For every row except the two Gemini rows, the key store holds no key (checked with `getkey.py --list`, names
only); the Gemini rows have a key that was refused for billing reasons. This lane's rules allow paid calls only
with keys already in the key store, so no account was created. Their request formats, prices and terms are in
`survey.md`; the steps for Aaron, with the first request to make, are in `for-aaron.md`.

| service | what it would have been tried for | why not run here (evidence) |
|---|---|---|
| Music.AI (Moises' API platform) | chords, beats, guitar stems on S4 | API key from a music.ai account needed ("The API key should be included in the Authorization header of each request.", https://music.ai/docs/api/reference/, as quoted in survey.md) |
| Klangio API | guitar transcription to Guitar Pro / MIDI / MusicXML on S2n; chords on S3 | key in header `kl-api-key` from an account at https://auth.klang.io/register; free "Basic" tier is "Max 15s audio duration" (15 s excerpts were made for it, see Media) |
| LALAL.AI API | guitar stem of S4 | header `X-License-Key` from a paid license (https://www.lalal.ai/api/v1/openapi.json) |
| AudioShake Tasks API | guitar stem of S4 | header `x-api-key` from a developer account ("10 free credits" on sign-up) |
| Fadr API | stems, MIDI, chords, key, tempo of S4 | "Usage of the Fadr API requires a Fadr Plus subscription" (Fadr's API overview page, as quoted in survey.md) |
| MVSEP API | "MVSep Guitar" (render_id 31) on S4 | `api_token` from an mvsep.com account; the public algorithm list (`GET https://mvsep.com/api/app/algorithms`, no token, 126 entries) was read |
| Replicate | `ryan5453/demucs`, `sakemin/all-in-one-music-structure-analyzer`, `triadmusic/chord-detection-cnn-lstm` | "All API requests must include a valid API token in the `Authorization` request header." (https://replicate.com/docs/reference/http.md) |
| fal.ai | `fal-ai/demucs` (htdemucs_6s, guitar stem) | header `Authorization: Key $FAL_KEY`; also needs the audio at a URL (`audio_url`) |
| Hugging Face ZeroGPU Spaces (Muscriptor, SAM Audio, Transkun) | notes of S2n, guitar from S4 | anonymous ZeroGPU quota refused (r0116, r0162); the error says "Authenticate with a Hugging Face token for more quota" |
| Gemini API direct | trials (a) to (d) | key works, prepaid balance at 0: HTTP 402 (r0013, r0014) |
| Gemini through the Vercel AI Gateway | trials (a) to (d) | gateway key on the free tier: HTTP 403 for every Google model (r0022, r0023) |
| Soundslice data API | upload S2n.gp5 plus audio, sync points | "API keys are only available to paying Soundslice customers — either in the Teacher or Licensing plans." (Soundslice data API docs, as quoted in survey.md) |
| Flat.io API | import S2n.gp5, export MusicXML | "Personal Access Tokens or OAuth2" (spec intro); no Flat account |
| Hooktheory Trends API | chord-progression statistics | Bearer token from `POST users/auth` with a hooktheory.com username and password |
| Songsterr | looking up an existing tab | no documented developer API; robots.txt has `Disallow: /api/` (survey.md); not called |
| Chordify | chords from a link | no developer API found; the site answered HTTP 403 to this box (survey.md); not called |
| StemSplit API (row added by the verifier) | guitar stem of S4 (`SIX_STEMS`) | `Authorization: Bearer <API key>` (survey.md); no StemSplit key in the key store (the verifier's `getkey.py --list` check, names only, 2026-11-10) |
| MusicGPT `POST /v1/audio_to_midi` (row added by the verifier) | notes of S2n as MIDI | API key needed (survey.md); no MusicGPT key in the key store (same check) |
| Alibaba Qwen-Omni and OpenAI audio models (rows added by the verifier) | the chord, note and capo prompts of trials (a), (b), (d) | no Alibaba Cloud (DashScope) or OpenAI key in the key store (same check); the gateway's free tier refused the Qwen model asked for (`alibaba/qwen3.8-27b`, r0023) |
| Mureka Music Transcription on fal.ai (row added in gap round 2) | MusicXML of S4, timestamped lyrics of R2 | `Authorization: Key $FAL_KEY` needed; no fal key in the key store (`getkey.py --list`, names only, 2026-11-11); `for-aaron.md` section 15 |

## Tested handoff: ElevenLabs guitar stem (MP3) into the YourMT3 Space (MIDI), scored against S4

- Chain: ElevenLabs `six_stems_v1` on S4 (r0064) gave `guitar.mp3` (MP3 192 kb/s, 44.1 kHz stereo, 38.79 s); that file,
  unchanged, was sent to `mimbres/YourMT3-cpu` `/process_audio` (r0231, cpu-basic, wall 66.90 s; the Space accepted
  the MP3). The MIDI cut out of the returned HTML (3,974 bytes, `samples/hf-spaces/yourmt3cpu_S4_elguitar/`) has 516
  notes in three tracks: "Acoustic Piano" program 0, 218 notes; "Electric Piano" program 2, 37; "Guitar (clean)"
  program 24, 261.
- Scored with `gtr-eval notes --voice chord` against the 369 truth notes of the strummed guitar (truth voices
  `drums`, `bass` and `melody` left out; estimated notes matching those voices count as unmatched). All tracks
  pooled: onset-only P 0.647, R 0.905, F1 0.755 (334 matched); onset+offset F1 0.658; chroma onset-only F1 0.798;
  matched onsets median +23.4 ms late, 95th percentile 34.5 ms (e0522). The same with `--time-shift -0.025057`
  (the 1,105-sample delay of the ffmpeg-decoded stems measured above): onset-only F1 0.755, onset+offset F1 0.667,
  matched onsets median -1.7 ms (e0525).
- Handoff facts: the stem service's MP3, decoded with ffmpeg 6.1.1, starts 1,105 samples (25.06 ms) after the input,
  and the transcriber's matched onsets come out a median 23.4 ms late (-1.7 ms after the 25.057 ms shift); the
  YourMT3 Space returns its MIDI inside HTML, so a program has to cut the `data:audio/midi;base64,` URL out before
  handing the MIDI on.

## Gap round 2

Agent: gapfill-hosted-apis, 2026-11-11 (from `date -u +%F`), started 00:12 UTC. It worked through the five
hosted-apis rows of `GAPS.md` (H1 to H5) in order; what stays open is listed in `survey.md`, "Gap round 2". Terms
and prices it read are in `survey.md` (sections marked "added in gap round 2"); this section holds what it ran.
Nothing in this round was paid for: no call here costs money, the spend file is unchanged (0.959949 USD for the
lane), and no key was read (Cesure's MCP server was called without an account). Scripts are in `scripts/gap2/` and
`scripts/gap2_update_tools_json.py`.

### ffmpeg 6.1.1 (box): the lane's preparation steps, logged (gap H2)

- What it is: the box's `ffmpeg 6.1.1-3ubuntu5` (Ubuntu package). In the first round it cut the 15-second excerpts
  (`ffmpeg -i <clip>.wav -t 15.0 -c:a pcm_s16le <clip>_0-15s.wav`, recorded with their sha256 in
  `/home/user/gtr/lanes/hosted-apis/inputs/README.md`), extracted the 1 fps frames of trial (c), decoded and trimmed
  the ElevenLabs stems (`scripts/stem_alignment.py`, the recipe under "Media kept outside git") and mixed R2's
  non-vocal stems (`amix`). None of these steps was run through gtr-run: the ledger has no `hosted-apis` line whose
  tool is ffmpeg or whose command starts with `ffmpeg` (checked 2026-11-11 over all 70 earlier lines of the lane).
  ffmpeg did run inside the yt-dlp runs r0126 and r0323 (yt-dlp's `--download-sections` and `-x --audio-format wav`
  call it).
- Logged now, both with `--nolock` (sub-second file preparation, no CPU slot taken; unpinned, so not a 2-core
  figure):

| run | command | inputs | wall s | CPU s | peak MB | result |
|---|---|---|---|---|---|---|
| r0599 | `scripts/gap2/ffmpeg_excerpts.sh`: the recorded `-t 15.0` command for S2n, S3, S4 into a new folder | `S2n.wav`, `S3.wav`, `S4.wav` | 0.29 | 0.29 | 50.2 | three WAVs of 2,646,078 bytes whose sha256 equal the ones in `inputs/README.md` (ae989edd..., 4ac9b8e8..., 7e9784c8...); the copies were deleted after the check |
| r0600 | `scripts/gap2/ffmpeg_frames_r3a.sh`: `ffmpeg -i R3a.mp4 -vf fps=1 -q:v 3 f_%02d.jpg` into a new folder | `R3a.mp4` (2,368,626 bytes) | 0.61 | 0.78 | 79.7 | 18 JPEGs, 531,261 bytes in all, each byte-identical to `out/frames/R3a/`; the copies were deleted after the check |

- The stem decoding and trimming were remade by the first round's verifier with byte-identical results (verification
  log, item 3) but are still not ledger runs.
- Re-run by verify-gapfill-hosted-apis, each script unchanged, in a CPU slot (2 cores): r0661 (re-run of r0599,
  0.36 s): the three SHA-256 equal those in `inputs/README.md`; r0662 (re-run of r0600, 0.57 s): 18 JPEGs, 531,261
  bytes, all byte-identical to `out/frames/R3a/`. The copies were deleted.

### gradio_client: which runs used it (gap H2)

Every Hugging Face Space call in this file went through `gradio_client` (`scripts/hf_space_call.py` with 2.7.2 in
`venv-apis`, `scripts/hf_space_call_old.py` with 0.5.3 in `venv-gc-old`). By run id, from the ledger's commands:

| gradio_client | runs that returned a result | runs refused or failed |
|---|---|---|
| 2.7.2 | r0112 (YourMT3), r0164, r0231, r0245 (YourMT3-cpu), r0118, r0246 (Beat-This); verifier r0305, r0308 | r0116 (Muscriptor, ZeroGPU quota), r0162 (SAM Audio, ZeroGPU quota), r0119 (demucs_playground: `ValueError('Unknown protocol: ws')`); verifier r0309, r0311 (ZeroGPU quota) |
| 0.5.3 | r0141 (demucs_playground); verifier r0322 | none |

`tools.json` now lists these runs under its `gradio_client` entry.

### Entries that were counted as tried without output (gap H2)

`tools.json` had `tried: true` for three services that gave no analysis output: the Space
`hugging-apps/muscriptor-music-transcription` (r0116, r0309: ZeroGPU quota), the Space `lpeterl/sam-audio-webui`
(r0162: ZeroGPU quota) and the Google Gemini API (r0013, r0014, r0300: HTTP 402 on every generation request; only
`countTokens` answered, in r0016 and in the `countTokens` step of the probes r0014 and r0300, with input token
counts). (Corrected by verify-gapfill-hosted-apis: this had read "whose every call was refused before any output"
and "only `countTokens`, r0016, answered".) They are now `tried: false` with `tried_how` null; the run
records and refusal texts are kept, and `for-aaron.md` sections 1 (Gemini) and 3 (the ZeroGPU Spaces) still hold the
steps. The sections above already called these calls refused; their text is unchanged.

### Cesure MCP server (`https://api.cesure.app/mcp`): initialize and tools/list without an account (gap H5)

- What it is: the remote MCP server of Cesure, a tab, staff and piano-roll editor (apps-survey lane, "Cesure"). Its
  assistants page (https://cesure.app/assistants, read 2026-11-11) says "You add Cesure once, as a custom connector,
  with this address:" `https://api.cesure.app/mcp`. Terms and formats are in `survey.md`, "Cesure MCP server".
- Install: none. `scripts/gap2/cesure_mcp_probe.py` uses the Python standard library (`python3 -I`, Python 3.13.18).
- Run r0622 (`--nolock`, a remote call; local CPU 0.09 s; wall 2.46 s by the ledger; peak 23.4 MB):
  `gtr-run --lane hosted-apis --tool cesure-mcp --label "..." --nolock -- python3 -I scripts/gap2/cesure_mcp_probe.py samples/cesure-mcp`.
  No account, no key, no cookie; `User-Agent: research-probe/0.1 (MCP client, no account)`. It sent, over MCP's
  Streamable HTTP transport (JSON-RPC 2.0 by POST): `initialize` (protocol version 2025-06-18, client name
  "research-probe"), `notifications/initialized`, `tools/list`; then `GET /.well-known/oauth-protected-resource`. No
  `tools/call` was sent, so no draft was created. Every request and response is in `samples/cesure-mcp/probe.json`,
  the tool list in `samples/cesure-mcp/tools_list.json` (25,420 bytes).

| step | HTTP | round trip s | what came back |
|---|---|---|---|
| `initialize` | 200 | 0.600 | `application/json`, 1,663 bytes: `protocolVersion` "2025-06-18"; `capabilities` `tools` and `resources` (both `listChanged` false); `serverInfo` name "cesure", version "1.0.0", title "Cesure"; an `instructions` text; no `Mcp-Session-Id` header; `X-Ratelimit-Limit: 3000` |
| `notifications/initialized` | 202 | 0.664 | empty body |
| `tools/list` | 200 | 0.493 | 19,822 bytes, 14 tools (below) |
| `GET /.well-known/oauth-protected-resource` | 404 | 0.635 | empty body |

- The 14 tools, with the `securitySchemes` each declares in its `_meta` (`noauth`: callable without an account;
  `oauth2`: with a linked Cesure account) and its MCP annotations:

| tool | title | required inputs (other inputs) | securitySchemes | readOnlyHint / destructiveHint |
|---|---|---|---|---|
| `create_score` | Create a score | `score` (a .cesure text) | noauth, oauth2 | false / false |
| `import_score` | Import a score | `score` (.cesure text, AlphaTex, or an "Open in Cesure" link) | noauth, oauth2 | false / false |
| `read_score` | Read measures | `draft` (`track`, `from`, `to`) | noauth, oauth2 | true / false |
| `edit_measures` | Edit measures | `draft`, `from`, `to`, `measures` (`track`) | noauth, oauth2 | false / true |
| `transpose` | Transpose | `draft`, `semitones` (-24 to 24) (`notesOffTheNeck`: `retune_lowest_string` or `change_octave`; `harmonicsOffTheNeck`: `keep_harmonic` or `play_fretted`) | noauth, oauth2 | false / true |
| `refinger` | Place the notes again | `draft` (`track`; `mode`: `auto`, `standard`, `optimized`; `searchCapo` boolean, default false) | noauth, oauth2 | false / true |
| `undo_last_change` | Undo the last change | `draft` | noauth, oauth2 | false / true |
| `open_in_cesure` | Open in Cesure | `draft` | noauth, oauth2 | true / false |
| `search_catalog` | Search the catalog | none (`query`, `language`: en, fr, es) | noauth | true / false |
| `list_my_scores` | List my scores | none (`offset`) | oauth2 | true / false |
| `read_my_score` | Open one of my scores | `id` | oauth2 | false / false |
| `save_new_score` | Save as a new score | `draft` (`title`) | oauth2 | false / false |
| `update_my_score` | Save over my score | `draft` | oauth2 | false / true |
| `organize_my_scores` | Organize my scores | none (`create_tags`, `add`, `remove`, `delete_unused_tags`) | oauth2 | false / true |

- Drafts without an account: the server accepted `initialize` and `tools/list` with no credentials, and the eight
  draft tools (create, import, read, edit, transpose, refinger, undo, open) declare `noauth` among their schemes; the
  five library tools declare only `oauth2`. The `instructions` text: "A draft is kept 14 days after the last call
  that touches it. Each tool that opens or changes a draft answers with a short link that opens it in Cesure, the
  web app, with no account." Whether a `create_score` call is in fact served without an account was not tested
  (the probe sent no `tools/call`): UNVERIFIED until one call.
- Input format facts (tool descriptions, saved in `tools_list.json`): a score is written as .cesure text, e.g.
  `{"version":2,"score":{"title":"Song","tempo":96,"tracks":[{"name":"Guitar","instrument":"GUITAR","measures":[...]}]}}`;
  in a measure each voice is a string of beats, "beat = content.duration[{d | tu 3}]; content = fret.string[{note
  props}] | pitch | (note note …) | r"; "Strings from 1 (the highest); x as fret mutes."; "a track without tuning is a
  guitar in standard tuning; tuning lists the open strings from string 1"; "Every measure must read and fill its time
  signature, or nothing is created and the refusal names each fault with its place." The format page
  (https://cesure.app/format, "This is version 2.") gives each track a `capo` field: "Capo position in frets. Fret
  numbers stay relative to the capo; only the sounding pitch moves."
- Output format facts: a draft id that the other tools take; "No tool gives the whole score back: each answers with a
  summary, and read_score reads measures, 200 at most a call." (`instructions`); `read_score` returns .cesure measures;
  `open_in_cesure` declares a UI resource `ui://cesure/player-0.8.3+ac6e74d` in its `_meta`.
- Constraints accepted, as the descriptions state them (none exercised here): `refinger` "Place the notes of the draft
  again on the neck (string and fret), keeping their pitches: mode auto, standard (lowest frets) or optimized (fewest
  hand moves); searchCapo lets it choose a capo."; `edit_measures`: "A note may be written by its pitch (E4, Bb3) in
  place of fret.string: Cesure chooses its string and fret, and never moves a note written with its string."; a
  track `tuning` and `capo`; `transpose` "retune_lowest_string tunes the lowest string of the track down to the lowest
  of those it carries (4 semitones at most)". No audio goes in: the assistants page says "No audio. Turning a
  recording into a tab happens in the app, from a sound."
- Failures: none; the OAuth metadata path answered 404.
- Re-run by verify-gapfill-hosted-apis: r0655 (`--nolock`, a remote call, 2.26 s by the ledger), output in
  `/home/user/gtr/lanes/hosted-apis/verify-gap2/cesure-mcp/` (outside git): the same four HTTP codes and byte counts,
  a `tools_list.json` byte-identical to the one above, and all four response bodies equal to r0622's.

## Survey tool list: what else was checked for a run

From `survey.md` "## Tool list" (docs-hosted-apis, read 2026-11-10 21:20 UTC): every entry marked
CALLABLE-WITH-KEY at that time is in the NOT RUN table above. The verify-docs agent later added entries (StemSplit,
ElevenLabs, Vercel AI Gateway, MusicGPT, Qwen-Omni); ElevenLabs and the gateway were called here, and the verifier
added rows for the others to the NOT RUN table. `teamup-tech/Transkun` (a ZeroGPU Space, RUNNING on `zero-a10g` at
21:58 UTC) was not called after two ZeroGPU refusals (r0116, r0162); the verifier's ZeroGPU re-runs (r0309, r0311)
were refused too, so the verifier did not call it either. ChordMini (the survey: its docs URL answered HTTP 402),
GetSongBPM (HTTP 403 to this box, survey) and Cyanite were not checked for a run here. Spotify's Audio Features /
Audio Analysis endpoints are closed to new apps (survey, Spotify blog); not called.

## Money spent (from `samples/spend.jsonl`)

| service | calls logged | USD counted | how counted |
|---|---|---|---|
| Google Gemini API (direct) | 0 billed (402 and countTokens only) | 0 | nothing was generated |
| Vercel AI Gateway (free tier) | 22 (3 access probes and 19 trial calls that returned usage; refused calls cost nothing and are not logged) | 0.074782 | per call the larger of (tokens x the gateway's list price) and the response's `usage.cost`; the sum of `usage.cost` alone is 0.073938. The account is on the gateway's free tier (the 403 messages say so) |
| ElevenLabs | 4 calls (5 lines: one correction line for r0064) | 0.63206 | 2,873 credits measured (1,065 + 807 + 990 stem separation, 11 speech to text) x 0.00022 USD, an estimate (the per-credit price is UNVERIFIED, see the stem separation section); the speech-to-text call at the larger of that and the published per-hour rate |
| xAI | 1 | 0.001 | 36 s x 0.10 USD per hour (published REST rate) |
| DeepSeek | 0 | 0 | no audio or video input; only the free model list was read |
| Hugging Face Spaces, yt-dlp | 0 | 0 | free public endpoints |
| total | | 0.707842 | caps: 2 USD per service, 10 USD in all |

The verifier's calls appended six more lines to the same file (tags starting `verify_`): gateway r0302
0.000387 USD, r0360 (R3b frames) 0.007544 USD and r0391 (R3c frames) 0.006456 USD, xAI r0306 0.001 USD, ElevenLabs
r0315 0.2343 USD (1,065 credits) and r0318 0.00242 USD (11 credits), 0.252107 USD in all, counted the same way. The
file's totals are now gateway 0.089169, ElevenLabs 0.86878, xAI 0.002, all services 0.959949 USD. The verifier's
refused calls (r0303, r0304: HTTP 400) and free calls (r0300, r0307, the Space re-runs, yt-dlp r0323) cost nothing
and are not in the file. Gap round 2 (2026-11-11) made no paid call (r0599 and r0600 are local ffmpeg steps, r0622 a
free MCP probe) and added no line to the file; the totals are unchanged.

## Media kept outside git

All under `/home/user/gtr/lanes/hosted-apis/` (not in the repo; for the orchestrator to file in the studio library).
Licenses follow the input: S clips synthesized for this research (see the inputs manifest), R2 CC BY 4.0 (Josh
Woodward, "I Want to Destroy Something Beautiful"), R3a CC BY-SA 4.0 (Mark Andersen / Seattle Community Media).

| file(s) | bytes | duration | what it is |
|---|---|---|---|
| `out/elevenlabs/S4_six_stems/stems/{bass,drums,guitar,other,piano,vocals}.mp3` and `stems.zip` (5,586,876) | 931,048 each | 38.791833 s | ElevenLabs `six_stems_v1` of S4, MP3 192 kb/s 44.1 kHz stereo (r0064); 1,105 samples late against the input when decoded with ffmpeg 6.1.1 |
| `out/elevenlabs/S6taps_six_stems/stems/*.mp3` and `stems.zip` (4,232,688) | 705,350 each | 29.387750 s | the same for S6taps (r0189) |
| `out/elevenlabs/R2_six_stems/stems/*.mp3` and `stems.zip` (5,191,902) | 865,219 each | 36.048958 s | the same for R2 (r0194) |
| `out/hf-spaces/demucs_S4_old/named/{bass,drums,other,vocals}.wav` | 6,834,024 each | 38.741383 s | HF Space `nakas/demucs_playground` (mdx_extra_q) stems of S4, 16-bit 44.1 kHz stereo (r0141) |
| `out/hf-spaces/beatthis_S4/files/beat-this_audio-with-beats.wav` | 6,834,024 | 38.741383 s | HF Space `teamup-tech/Beat-This`: S4 with beat clicks mixed in (r0118) |
| `out/hf-spaces/beatthis_R1c/files/beat-this_audio-with-beats.wav` | 2,490,396 | 28.235283 s | the same for R1c (r0246; GuitarSet CC BY 4.0) |
| `out/yt-dlp/R3a_ytdlp_400-418.wav` | 1,729,374 | 18.012979 s | yt-dlp audio of 400-418 s of the R3a archive.org item, 16-bit 48 kHz mono (r0126) |
| `inputs/S2n_0-15s.wav`, `inputs/S3_0-15s.wav`, `inputs/S4_0-15s.wav` | 2,646,078 each | 15.000 s | first 15 s of S2n, S3, S4 (`ffmpeg -t 15.0`), for 15-second free tiers; documented in `inputs/README.md` there (sha256 ae989edd..., 4ac9b8e8..., 7e9784c8...); not a ledger run when made, re-made byte-identical through gtr-run in gap round 2 (r0599) |
| `out/frames/R3a/f_01.jpg` ... `f_18.jpg` | 531,261 bytes in all | stills | the 18 frames (1 per second, sent as t = 0 to 17 s) of trial (c) |
| `verify/hf-spaces/demucs_S4_old/named/{bass,drums,other,vocals}.wav` | 6,834,024 each | 38.741383 s | the verifier's re-run r0322 of the demucs_playground Space on S4 (content differs from r0141's) |
| `verify/frames/R3b/f_01.jpg` ... `f_18.jpg`, `verify/frames/R3c/f_01.jpg` ... `f_18.jpg` | 1,565,337 and 1,735,015 bytes in all | stills | the frames the verifier sent in r0360 and r0391 (R3b CC0 1.0, R3c CC BY 3.0 Culture Vannin) |

The delay-trimmed float WAVs used for scoring were deleted after scoring (disk); they are remade from the MP3s with
`ffmpeg -i <stem>.mp3 -ar 44100 -c:a pcm_f32le x.wav` then `ffmpeg -i x.wav -af "atrim=start_sample=1105,asetpts=PTS-STARTPTS" -c:a pcm_f32le <stem>.wav`
(`scripts/stem_alignment.py` does the first step and measures the lag). Their sha256 are in the `est.files` of each
`eval_stems.json`. The verifier remade all eight scored files this way (for R2, `sum_non_vocal.wav` with
`ffmpeg -i bass.wav -i drums.wav -i guitar.wav -i other.wav -i piano.wav -filter_complex "amix=inputs=5:normalize=0"`)
and got the same SHA-256 for every one.

## Verification log (verify-trials-hosted-apis, 2026-11-10)

Checked by an independent agent against the run ledger, the scoring ledger, the saved outputs and the saved source
pages; numbers recomputed; representative calls re-run with labels starting "verify". Verifier scripts are in
`scripts/verify-trials/`, small outputs in `samples/verify-trials/`, larger ones under
`/home/user/gtr/lanes/hosted-apis/verify/` (outside git).

What was checked, and how:

1. Run ledger. All 49 run ids cited for the trials (r0013 to r0248) have a `hosted-apis` line in
   `/home/user/gtr/ledger/runs.jsonl`; each line's command, input and label match the call described. Every exit
   code is 0 except r0013 (1), which the text already described as a failed call. The "wall" figures in the tables
   matched the scripts' own `wall_s` in `meta.json` / `record.json` for all 34 calls that have one (they are not the
   ledger's `wall_s`; the Timings convention now says so). r0089: cores [0, 1], 17.36 s, 930.9 MB; r0173, r0192,
   r0217: `locked` false, 18.64, 4.69, 4.56 CPU s.
2. Files. Every sample file named exists and was opened: Gemini model list (62 models), the 10 `countTokens`
   results, every gateway `answer.json` (chord sequences, the 29 MiMo notes and the empty Muse answer, capo and
   tuning answers, the three frame answers), `meta.json` token counts and costs, the four MIDI files (format,
   480 ticks per quarter, tracks, programs, notes per track, no tempo event, velocity 100), the Beat-This beat lists
   (68/18 and 56/14), the ElevenLabs ZIP and MP3 sizes and durations, both speech-to-text JSONs (word counts), the
   yt-dlp WAV, the spend file (totals recomputed), and the R3a frames (re-extracted with the recorded ffmpeg command:
   18 byte-identical files).
3. gtr-eval. All 38 cited non-stem scorings were re-run with their exact arguments: identical metrics and counts
   (e1236 to e1273; `scripts/verify-trials/rescore_ledger.py`, summary in
   `samples/verify-trials/rescore/ledger/rescore_summary.json`). The four stem scorings were re-run from WAVs
   remade with the recipe above, byte-identical to the ones scored: identical (e1315, e1316, e1317, e1328; scoring
   runs r0339, r0340, r0342, r0343, all `--nolock` with `OMP_NUM_THREADS=1` after a slot-waiting attempt waited
   15 minutes behind other lanes' jobs). Independent recomputation outside gtr-eval
   (`scripts/verify-trials/recompute_mir_eval.py` with mir_eval 0.8.2, `si_sdr_check.py`, `check_stem_levels.py`):
   chord root and sevenths for MiMo on S3, S4, R1c; key and tempo deviation; onset-only P / R / F1 and matched counts
   for MiMo on S2n, YourMT3 on S2n (all tracks and programs 24-31), YourMT3-cpu on S2n and R1c, and the handoff;
   beat and downbeat F-measure for Beat-This on S4 and R1c; SI-SDR of six stems; the stem lags, levels and residuals.
   All equal to the reported figures except the R2 residual (corrected, item C3 below).
4. Re-runs (each a recorded command with a new output folder, through gtr-run `--nolock`, label "verify: ..."):
   Gemini probe r0300 (still HTTP 402); gateway r0302 (MiMo on S3: a different answer, root 0.781 instead of 0.193),
   r0303 and r0304 (MP4 refused again, on all five Muse providers); xAI speech to text r0306 (identical JSON); xAI and
   DeepSeek model lists r0307 (identical); ElevenLabs stems r0315 (six byte-identical MP3s, 1,065 credits) and speech
   to text r0318 (11 credits, a different transcript); Spaces r0305 (YourMT3-cpu, byte-identical MIDI), r0308
   (Beat-This, identical beats and WAV), r0309 and r0311 (ZeroGPU refusals), r0322 (demucs_playground, different
   sample values, SI-SDR within 0.13 dB of r0141's, e1331, scoring run r0344); yt-dlp r0323 (byte-identical WAV).
   Not through gtr-run: the two Hugging Face router URLs with curl (HTTP 401, 22:00 UTC) and the runtime stage of
   every Space named (21:58 UTC). Run by the verifier, not a re-run: MiMo on 1 fps frames of R3b (r0360) and R3c
   (r0391), clips that joined the shared set after the trial ran.
5. NOT RUN reasons. The key store's names (`getkey.py --list`, names only) hold no key for any service in that table;
   the Gemini 402 and the gateway 403s were reproduced (r0300; the 403 bodies are in `probe_models.json` and
   `S3_chords_gemini-3.5-flash-lite/response.json`); the ZeroGPU refusals were reproduced (r0309, r0311). The quoted
   reasons were found in `survey.md` or in the saved source pages (Replicate's sentence in its saved `http.md`).
6. Quotes in `trials.md` (Gemini pricing, billing and audio pages, the Vercel audio and pricing pages, the ElevenLabs
   reference and OpenAPI spec, the xAI pricing page, the YouTube terms, the yt-dlp wheel's license) were compared
   with the copies saved under `/home/user/gtr/lanes/hosted-apis/dl/web/` at the time of the trials (not re-fetched
   live; the verify-docs agent re-fetches live pages): all found, apart from the ElevenLabs "$0.20 per hour", which
   the page prints as "$0.20" and "Price per hour" (fixed).
7. Judging language, secrets, personal data, sizes: see C9 and C10 below. No file in this folder is over 300 KB; no
   audio, video or image file is in it (2.3 MB in all after this check); no key-like string was found.

What was changed in `trials.md`:

- C1. Timings: "wall" defined as the scripts' own round trip, with the ledger differences; the claim that r0173 had
  waited for a slot marked as not checkable from the ledger.
- C2. Inputs: "R3b and R3c do not exist in the shared set" was true when the video trials ran but not later the same
  day; replaced with the times from the manifest and the files.
- C3. ElevenLabs R2: the residual (mix minus the sum of the six trimmed stems) was given as -15.40 dBFS; recomputed:
  -38.69 dBFS (-6.86 before the trim).
- C4. Trial (c): r0083 (Muse, MP4) had been sent with `--only togetherai`, so "refused for all three models" rested
  on one of Muse's five providers; the verifier's r0304 showed all five refuse. The frame files are `f_01.jpg` to
  `f_18.jpg` (not `f_00` to `f_17`) and total 531,261 bytes (not 576 KB).
- C5. YourMT3 output format: the R1c MIDI has 2 tracks, not 4.
- C6. Gateway output format: `message.reasoning` is also returned for Seed and for Muse via fireworks.
- C7. ElevenLabs cost: the USD per credit (0.00022) is the trial script's assumption, now marked UNVERIFIED wherever
  it is used; the account's absolute credit-counter values were removed (also from
  `samples/elevenlabs/S4_six_stems/record.json`); only differences remain.
- C8. Speech to text: `diarize=false` added to the settings; the comparison of the transcripts corrected (they also
  differ in the apostrophe of "'Cause").
- C9. Wording: "the flagship", "the current small one" and "not usable" replaced with plain facts; "decoder delay"
  (an interpretation) replaced with the measured offset of the ffmpeg-decoded stems.
- C10. Added: the verifier's re-run results in each section, the R3b and R3c frame runs (r0360, r0391, in trial
  (c)), the stages of six Spaces the trial listed without one,
  four NOT RUN rows (StemSplit, MusicGPT, Qwen-Omni, OpenAI audio), the corrected survey-list paragraph, the
  verifier's spend (0.252107 USD in all, of which 0.014000 USD for the R3b and R3c frame calls), and the verifier's
  media rows.

What was changed in `for-aaron.md`:

- Gemini: the billing-page quote extended; the December 2026 price change added; "wait a few minutes" replaced by
  waiting for the purchase to show; the verifier's r0300 result added.
- Vercel: the top-up steps as the docs give them; UNVERIFIED note that the gateway lists no audio input for the two
  Google models.
- Hugging Face: heading no longer says a token "unblocks" the GPU pages; "a read token is the smallest" removed;
  the verifier's ZeroGPU refusals added.
- Klangio: access by application, the demo-transcription and output-format quota sentences added.
- Music.AI: UNVERIFIED note on individual keys (from `survey.md`); the workflow input name (`inputUrl` vs
  `inputFileUrl`).
- LALAL.AI: "buy a plan or pack" corrected to the Pro plan or a top-up pack (llms.txt quote); key location UNVERIFIED.
- AudioShake: the sign-up URL the quickstart gives; the billing quotes made verbatim.
- Fadr: the polling call as the docs give it; "Easier by hand" reworded.
- MVSEP: "$3 60 credits" (not a verbatim quote) and the `is_demo` description replaced with the docs' wording.
- Replicate: "billing is per second" and "the URLs need the same Authorization header" replaced with what the pages
  say (hardware prices per second, approximate cost per run, files served by `replicate.delivery`).
- Soundslice: the audio file named (`S2n.wav`); Flat: the import-conversion sentence added; Vercel and Hooktheory:
  a "send back" line added; a note at the top that the file was checked.

Still UNVERIFIED after this check:

- The USD price of an ElevenLabs credit (all ElevenLabs USD figures rest on 0.00022 USD per credit).
- That r0173 waited for a CPU slot before running with `--nolock` (no ledger trace either way).
- The original `venv-apis` size (111 MB); the verifier's rebuild from the freeze file is 102 MB.
- Klangio's `outputs` array encoding and `json` contents, whether fal accepts `data:` URLs, Music.AI's
  "Bearer" prefix and whether individuals still get keys, LALAL.AI's key location, the Hugging Face token type the
  ZeroGPU quota needs, whether the gateway passes WAV to Google models, whether Replicate downloads need the token:
  each needs the first real call or the account page.
- Quotes were checked against the trial-time saved copies, not re-fetched live.

Disk: `venv-apis` and `venv-gc-old` were rebuilt from the saved freeze files for the re-runs (that rebuild itself
checks the freeze files) and deleted afterwards; the remade float WAVs (433 MB) and the byte-identical re-run copies
were deleted; the demucs re-run WAVs, the R3b and R3c frames and the re-run records are kept under
`/home/user/gtr/lanes/hosted-apis/verify/`.

## Verification log (verify-gapfill-hosted-apis, round 2, 2026-11-11)

An independent check of what gap round 2 added: the section "Gap round 2" above, the gap-round-2 parts of
`survey.md` and `for-aaron.md`, `tools.json`, `samples/cesure-mcp/`, `samples/gap2/` and `scripts/gap2/`. The text
checked is commit d90f43e against d2e9a17 (the commit before the round; `git diff`, read only). Date from
`date -u +%F`; work from 00:41 to about 01:10 UTC. This check spent nothing and read no key value.

What was checked, and how:

1. Run ledger. r0599, r0600 and r0622 are `hosted-apis` lines with the commands, inputs (sizes and SHA-256), wall,
   CPU (user + system), peak memory and exit code 0 the text gives; all three are `locked` false with no cores, as
   stated (`--nolock`). The 70 earlier lines of the lane hold no `ffmpeg` tool and no command containing `ffmpeg`;
   the yt-dlp commands r0126 and r0323 carry `--download-sections` and `-x --audio-format wav`. All 15 Space runs in
   the `gradio_client` table use the client script and venv the table gives (`hf_space_call.py` in `venv-apis`,
   gradio-client 2.7.2 in `samples/venv-apis.freeze.txt`; `hf_space_call_old.py` in `venv-gc-old`, 0.5.3), and the
   `wall_s` listed for them in `tools.json` equals the `wall_s` of each run's `record.json` (14 runs; r0119 has no
   record on disk, its 1.67 s is the first round's table figure). Every run id the round cites (36) is a
   `hosted-apis` line. The round cites no eval id and scored nothing, so there was no scoring to re-run.
2. Re-runs, labels starting "verify", in CPU slots unless said: r0661 re-ran `scripts/gap2/ffmpeg_excerpts.sh`
   (2 cores, cores 0-1, 0.36 s wall after 267.5 s waiting for a slot): the three SHA-256 equal those in
   `inputs/README.md` (ae989edd..., 4ac9b8e8..., 7e9784c8...). r0662 re-ran `scripts/gap2/ffmpeg_frames_r3a.sh`
   (2 cores, 0.57 s): 18 JPEGs, 531,261 bytes, all 18 byte-identical to `out/frames/R3a/`. The copies (8.2 MB) were
   deleted. r0655 re-ran the Cesure probe into `/home/user/gtr/lanes/hosted-apis/verify-gap2/cesure-mcp/`
   (`--nolock`: a read-only remote protocol call with no local work, as r0622; 2.26 s): HTTP 200, 202, 200 and 404,
   1,663 and 19,822 bytes; `tools_list.json` byte-identical to `samples/cesure-mcp/tools_list.json` and all four
   response bodies equal to r0622's. No `tools/call` was sent.
3. Files. The two Cesure tables were recounted from `tools_list.json` and `probe.json`: 14 tools, and every title,
   required and other input, enum value (`mode`, `notesOffTheNeck`, `harmonicsOffTheNeck`, `language`), the semitone
   bounds -24 to 24, `securitySchemes`, `readOnlyHint` / `destructiveHint`, the `ui://cesure/player-0.8.3+ac6e74d`
   resource and the quoted descriptions and `instructions` match. `samples/gap2/quotes_check.tsv`: 314 lines, 283
   found, 31 NOT FOUND, in the five kinds `survey.md` names (8 heading references, 1 menu label, 2 shell fragments,
   1 apps-survey quote, 19 spans paired across two quotes). `samples/spend.jsonl` is unchanged since 2026-11-10
   22:12 UTC (34 lines, 0.95994905 USD; 25 gateway lines, `is_byok` false in all 25). Key store (`getkey.py --list`,
   counted, no name printed): 26 names, none containing "fal" or "mureka", none for OpenAI, AWS, Alibaba or MusicGPT.
4. Quotes, against the live pages, not the round's saved copies: 63 pages fetched again 00:46 to 00:53 UTC with
   `scripts/verify-gap2/fetch_pages.sh` (status list `samples/verify-gap2/fetch_status.tsv`; all HTTP 200 except the
   gated Muse `LICENSE`, 401 as the text says). `scripts/verify-gap2/check_quotes_live.py` took 402 quoted strings
   from the round's added lines and new `tools.json` strings and searched each page's raw text, tag-stripped text,
   pandoc text and JSON/JavaScript-unescaped text (`samples/verify-gap2/quotes_live.tsv`): 365 found; every quote
   taken from a page was found on the page the text cites (the other hits are code fragments, field names and short
   words that match many pages). The 37 not found: 27 spans of prose paired across two separate quotes (their inner
   quotes were then checked one by one, e.g. Qwen "$11", "$8.3", "$44", "1 million tokens"; OpenAI's
   `/v1/chat/completions` row "No" and "30 days"; the gateway's `no_training` / `zdr` values: all found), 2 shell
   fragments, the menu label "Web page, complete", "Free tier" twice (in `samples/vercel-gateway/probe_models.json`,
   a 403 body, not a web page), 3 quotes of the record's own earlier text, and "Sorry, you have been blocked" twice,
   which no fetched page holds (item 9). Section numbers were read in the page text: Vercel AI Product Terms § 1, §
   2, § 6.2, § 8.1, § 8.4, Terms of Service § 3, § 4, Notices § 4 and § 6 (every provider URL given); MiMo agreement
   § 3.8.1, § 4.1, § 4.4, § 4.5 (the one "train" of the English text) and § 5.1, in chunk 1995, which the docs bundle
   loads for the user-agreement route, and the platform footer's link to mimo.mi.com (platform bundle); BytePlus
   Terms § 4 and AI terms § 2.1, § 3.2, § 3.3 (`MDContent`); Meta Exhibit C "Hosted Platform Access" and its
   definition; Muse license § 2 to § 4 and Exhibit A (`cardData.extra_gated_prompt`); AWS § 50.1, § 50.2, § 50.3, §
   50.10 (Nova 2 Omni), § 50.12.2; Alibaba § 4.48.1 d) and e) (not the similar clauses of another product lower on
   the page). Facts that are not quotes, also re-read: the Hugging Face API fields of the three repositories, the
   gateway model list fields, the MiMo provider list (on the `.md` model page), the fal OpenAPI document (paths,
   "1.0.0", `title` `maxLength` 50, `zip_url` required), the Mureka terms page (no text without scripts), no "mureka"
   in https://fal.ai/llms.txt, gradio_client's PyPI license fields, Flat's "Preferred formats", Nova 1 and Nova 2
   modality tables, the OpenAI pages (no audio tokens per second on the four pages named).
5. Code, weights and data licenses: gradio_client's Apache-2.0 is under `code`, the MiMo `license: mit` and the Muse
   Model License under `weights`; one weights clause was filed as a service term (V8).
6. Judging words, secrets, personal data, sizes: no judging word outside quotation marks in the round's added text or
   new `tools.json` strings; no key-like string or IP address in the new files; no audio or video in this folder;
   largest file `tools.json`, 261,284 bytes after this check.
7. Earlier parts of the record: the round only added lines or appended parenthetical corrections (git diff); the
   headings, tables and the 2026-11-10 verification logs of `trials.md` and `survey.md` are unchanged.

What was changed:

- V1 `survey.md`, gateway data handling: "every MiMo call here was served by `xiaomi`" corrected: the MP4 calls
  r0077 and r0098 were tried on `xiaomi` and six other providers and refused by all seven (`providerAttempts`).
- V2 `survey.md`, Seed: "both calls served by `bytedance`" corrected: r0086 (MP4) was refused by `bytedance` with
  HTTP 400; r0127 answered.
- V3 `survey.md`, Mureka: the schemas are the OpenAPI components `ApiSongTranscribeInput` and
  `ApiSongTranscribeOutput`; `TranscribeMusicInput` and `TranscribeMusicOutput` are their `title` fields.
- V4 `survey.md`, "Gap round 2" log: the tool list items extended are 16, 26 and 27 (it said 26 and 28).
- V5 `survey.md`: tool list item 30 also names r0306; the `is_byok` sentence also cites `credentialType` "system"
  in every saved `providerAttempts` entry (46 entries in the 30 saved gateway `response.json` files, refused calls
  included).
- V6 `trials.md`, "Entries that were counted as tried without output": `countTokens` also answered inside the probes
  r0014 and r0300 (773 tokens for S3); "whose every call was refused before any output" replaced.
- V7 `for-aaron.md`: section 14 quotes the xAI FAQ answer exactly, under its question, and its step 2 no longer
  names a browser menu entry ("Web page, complete" is neither a PDF nor a text format); section 15 says where
  `S4.wav` and `R2.wav` come from.
- V8 `tools.json` (`scripts/verify-gap2/update_tools_json.py`): the Muse Model License grant moved from
  `service_terms` into `weights.note`; MiMo `gateway_data_flags` corrected as V1; a correction line on Gemini as V6;
  the runs r0661 and r0662 (ffmpeg) and r0655 (Cesure) added.
- V9 `trials.md`: the re-runs r0661, r0662 and r0655 are noted at the end of the ffmpeg and Cesure subsections.
- Added: `scripts/verify-gap2/` (URL list, fetch script, quote checker, tools.json update) and
  `samples/verify-gap2/` (fetch status, quote results). Page copies stay outside git in
  `/home/user/gtr/lanes/hosted-apis/verify-gap2/`.

What stays unverified:

8. Everything the round lists as UNVERIFIED (`survey.md`, "Gap round 2"): xAI's and OpenAI's terms texts, OpenAI
   audio tokens per second, which MiMo checkpoint Xiaomi serves, whether a gateway route is a "Hosted Platform",
   Mureka's terms and its ZIP contents, whether Cesure serves `create_score` without an account, the gateway key's
   Vercel plan, Nova prices and Nova 2 Omni's inputs.
9. The HTTP 403 answers of the x.ai terms pages (and the "Sorry, you have been blocked" text), the web-fetch 403 and
   the Internet Archive's 429: this check's one status request (curl, body discarded) for the three x.ai pages and
   OpenAI's Services Agreement was refused by the box's permission system ("[Bot Check Circumvention]") and not
   retried. The x.ai claims rest on the round's note `raw/gap2-xai-403-note.txt`; the OpenAI one on its saved copy
   (`raw/gap2-openai-services-agreement.meta`: 403, 9,838 bytes; the body holds "Enable JavaScript and cookies to
   continue").
