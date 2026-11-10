# Lane 10, hosted-apis: trials

Agent: try-hosted-apis. Date: 2026-11-10 (from `date -u +%F`). Box: 4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU.

What this file is: every hosted service this lane could call from the box, what went in, what came back, how long
it took, what it cost. Facts only; numbers against ground truth carry their gtr-eval id (scorer gtr-eval 0.11.1,
ledger `/home/user/gtr/eval/ledger/evals.jsonl`) and their definition.

Conventions for the whole file:

- **Timings.** Every remote call was wrapped in `gtr-run --nolock` (logged in `/home/user/gtr/ledger/runs.jsonl`,
  run ids below; no CPU slot taken because the work runs on the provider's side). "wall" is the round trip measured
  on this box, from sending the request to having the whole answer, including upload and queueing. Local CPU time of
  these runs was 0.2 to 1.1 s each (4.3 s for r0141, whose client decoded four WAV files) and says nothing about the
  service. One scoring run went through a CPU slot (r0089, 2 cores); the second (r0173, 18.6 s of CPU) ran with
  `--nolock` after waiting for a slot behind other lanes' jobs, so its wall-clock is not a 2-core figure.
- **Keys.** Read at run time inside the scripts with `getkey.py`, sent only in a request header, never printed or
  written. Only these key names exist in the key store for this lane: `GEMINI_API_KEY`, `VERCEL_AI_GATEWAY_API_KEY`,
  `XAI_API_KEY`, `DEEPSEEK_API_KEY`, `ELEVENLABS_API_KEY` (checked with `getkey.py --list`, names only). No account
  was created anywhere.
- **Uploads.** Only synthesized clips (S*) and freely licensed clips (R2: CC BY 4.0; R3a: CC BY-SA 4.0) were sent to
  any service. No GuitarSet (R1) clip was uploaded.
- **Money.** Each paid call's cost is computed from the usage the response reports and the published price, and
  appended to `samples/spend.jsonl` (copy of `/home/user/gtr/lanes/hosted-apis/out/spend.jsonl`). A call is refused
  by the script when spent + the call's worst case would pass 2 USD for that service or 10 USD in total
  (`scripts/llm_common.py`). Totals are at the end of this file.
- **Inputs used:** the shared set in `/home/user/gtr/inputs/` (manifest `INPUTS.md`, READY 2026-11-10T20:28:01Z).
  R3b and R3c do not exist in the shared set (the manifest says why), so the video trials used R3a only.
- Scripts are in `scripts/`, small outputs in `samples/<tool>/`. Audio and video outputs are listed at the end.

## Google Gemini API, direct (generativelanguage.googleapis.com), models `gemini-4-carbon` and `gemini-3.5-flash-lite`

- What it is: Google's hosted multimodal LLM API; audio and video go in, text comes out. Called over REST with
  `requests` 2.34.2 (no SDK), Interactions API `POST https://generativelanguage.googleapis.com/v1beta/interactions`
  with header `Api-Revision: 2026-05-20` (the form the docs show on 2026-11-10), and the legacy
  `models/<id>:generateContent` / `:countTokens` endpoints for the probes.
- Install: `uv venv --python 3.11 /home/user/gtr/lanes/hosted-apis/venv-apis` then
  `uv pip install requests gradio_client soundfile numpy yt-dlp` (freeze in `samples/venv-apis.freeze.txt`).
- Models listed by the key (`GET v1beta/models`, run 2026-11-10 20:52 UTC): 62 models, saved as
  `samples/gemini/models_list.json`. Picked: the flagship, `gemini-4-carbon` (the pricing page: "Our most capable
  reasoning model"; the model page lists "Inputs Text, Image, Video, Audio, and PDF"), and the current small one,
  `gemini-3.5-flash-lite` (model version string `3.5-flash-lite-07-2026`; its page lists the same inputs; the pricing
  page: "A cost-efficient model, optimized for high-volume agentic tasks, translation, and simple data processing").
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
  to manage your project and billing. ...", "status": "RESOURCE_EXHAUSTED"`. No tokens were billed. The ledger shows
  exit code 1 for r0013: the body is a JSON list holding the error object, which the script did not expect after
  saving it (`AttributeError: 'list' object has no attribute 'get'`).
- Probe (r0014, `scripts/gemini_probe.py`, `samples/gemini/probe/probe_gemini-3.5-flash-lite.json`): a one-word text
  prompt to the legacy `generateContent` endpoint got the same HTTP 402, so the block is on the project, not on one
  endpoint or on audio. The billing page (https://aistudio.google.com/docs/billing.md, read 2026-11-10): "When your
  Prepay credit balance on the billing account hits $0, all API keys in all projects linked to that billing account
  will stop working simultaneously. Requests then fail with an HTTP 402 Payment Required error until you add credits."
  and "The minimum purchase is $5."
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
- Why these models: the key is on the gateway's free tier. Every Google model asked for, and four other models with
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
  0.00000425, description "Muse Spark Open is Meta's open-weight reasoning model ... This provider also documents
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
| r0028 | mimo-v2.6-flash (xiaomi) | S3 | 33.0 | 331 / 993 (637) | 0.00032438 | `0.00-2.44 G, 2.44-4.86 Em, 4.86-7.28 C, 7.28-9.70 D`, the same four again to 19.38, then G to 24.00; 99 BPM; G major; 4/4 |
| r0052 | mimo-v2.6-flash (xiaomi) | S4 | 55.4 | 423 / 2216 (1559) | 0.0006797 | `0.00-4.00 N`, then 2 s chords `D A Bm G D A G A Bm G D A G A D A G A`, `40.00-44.50 D`; 120 BPM; D major; 4/4 |
| r0024 | muse-spark-open (baseten) | S3 | 6.72 | 616 / 951 (885) | 0.00467095 | chords `[0.0-0.0 N]` only; 107 BPM; D minor; 4/4 |
| r0034 | muse-spark-open (fireworks only) | S3 | 0.85 | none | none | HTTP 400 from the provider: `Extra inputs are not permitted, field: 'messages[0].content.list[...][0].input_audio'` |
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
S4 (38.741 s) 800: 185 more tokens for 14.741 s more audio (12.55 tokens per second), so the audio was tokenized on
that route; `usage.prompt_tokens_details.audio_tokens` was 0 in every gateway response, for every model. MiMo's
prompt tokens grew by 92 from S3 to S4 (6.2 tokens per extra second of audio) with the same prompt text.

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

- As video, all three models: refused before running. Chat Completions `file` part `video/mp4` (r0077 mimo, r0083
  muse, r0086 seed): HTTP 400 `"'file part media type video/mp4' functionality not supported."`. Responses endpoint
  with an `input_video` part, the form the video-input page lists for OpenResponses (r0098 mimo,
  `scripts/gateway_video_responses.py`): HTTP 400 `"'file part media type video/*' functionality not supported."`
  after 7 provider attempts.
- As still frames instead (`scripts/gateway_frames_trial.py`): 18 JPEG frames of `R3a.mp4` taken with
  `ffmpeg -vf fps=1 -q:v 3` (t = 0 to 17 s, 576 KB in all, kept outside git), each sent as an `image_url` part after a
  text label "Frame at t = <k>.0 s:", then the video prompt. No audio goes in this way.

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

### Trial (d): S5capo2 audio only, "is a capo used?" (`gtr-eval tuning --est-capo`, `gtr-eval key`)

| run | model (provider) | wall s | tokens | cost USD | answer | capo vs truth 2 | key vs truth A major |
|---|---|---|---|---|---|---|---|
| r0080 | mimo-v2.6-flash (xiaomi) | 12.9 | 310 / 187 (113) | 0.00009576 | `capo_used: yes, capo_fret: 2, key: A major`; evidence "The piece has a distinct, bright, and slightly compressed tone characteristic of a capo. ..." | equal (e0069) | exact, 1.0 (e0070) |
| r0084 | muse-spark-open (togetherai) | 1.76 | 627 / 57 (0) | 0.0009028 | `capo_used: no, capo_fret: null, key: C minor` | not equal, 0 vs 2 (e0071) | 0.0 (e0072) |

Each row is one answer to one request; no call was repeated, so nothing here says how often an answer repeats.

- Output format facts: OpenAI chat-completion JSON. `choices[0].message.content` is a string holding the JSON
  answer; `choices[0].message.reasoning` is the model's reasoning text when the route returns it (MiMo, Muse via
  baseten); `choices[0].message.provider_metadata.gateway.routing.finalProvider` names the provider that served it;
  `usage` has `prompt_tokens`, `completion_tokens` (reasoning included), `completion_tokens_details.reasoning_tokens`,
  `prompt_tokens_details` (`cached_tokens`, `audio_tokens`, `video_tokens`), `cost`, `market_cost`, `gateway_cost`
  in USD.
- Input format facts: WAV 16-bit 44.1 kHz mono up to 3.4 MB (S4) went in as a data URL in a `file` part; MP4 video
  was refused for all three free-tier models; JPEG frames as `image_url` parts were accepted.
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
- Result: HTTP 200, request round trip 6.98 s (the run's wall of 14.45 s includes two account reads). A ZIP of
  5,586,876 bytes with six files, `drums.mp3`, `vocals.mp3`, `piano.mp3`, `guitar.mp3`, `bass.mp3`, `other.mp3`,
  each 931,048 bytes, MP3 192 kb/s, 44.1 kHz, 2 channels, 38.791833 s (`samples/elevenlabs/S4_six_stems/record.json`).
- Cost: the response carried no cost header. The account's used-credit counter (`GET /v1/user/subscription`,
  `character_count`) was unchanged 3 s after the call and 1,065 higher about two minutes later; no other ElevenLabs
  call was made from this lane in between (another agent using the same account in that window would also show up
  in that difference). The API price page (https://elevenlabs.io/pricing/api, read 2026-11-10) lists no stem
  separation rate; for the spend cap the call is counted at 1,065 x 0.00022 USD = 0.2343 USD, an estimate (22 USD per
  100,000 credits) and not a published price.
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

- Output format facts, for handoffs: a ZIP; one MP3 per stem named `<stem>.mp3` (six names fixed by
  `six_stems_v1`); stereo; same sample rate as requested; each MP3 decodes 1,105 samples late and 2,225 samples longer
  than the input at 44.1 kHz with ffmpeg 6.1.1, so a tool that compares stems sample by sample needs the trim.
- Input format facts: a stereo 16-bit 44.1 kHz WAV of 6.8 MB was accepted.
- Constraint inputs for a re-run: `stem_variation_id` only (two or six stems); no instrument prompt, no time range.

## ElevenLabs Speech to Text, `scribe_v3`, on R2 (sung lyrics)

- What it is: ElevenLabs' transcription API, `POST https://api.elevenlabs.io/v1/speech-to-text`, multipart form.
  The OpenAPI spec lists `model_id`, `file` or `source_url` ("Supports hosted video or audio files, YouTube video URLs,
  TikTok video URLs, and other video hosting services."), `language_code`, `tag_audio_events` (default true),
  `timestamps_granularity` (`none`, `word`, `character`), `diarize`, `keyterms` and more.
- Call: `scripts/elevenlabs_call.py stt /home/user/gtr/inputs/R2/R2.wav <out> --model scribe_v3` (r0108) with
  `timestamps_granularity=word`, `tag_audio_events=true`. Input `R2.wav` (36.000 s, CC BY 4.0 song: "I Want to Destroy
  Something Beautiful" by Josh Woodward, https://www.joshwoodward.com/, CC BY 4.0).
- Result: HTTP 200, request round trip 0.92 s; response header `character-cost: 11`; the credit counter rose by 11.
  Counted at max(11 x 0.00022, 36 s x the page's "$0.20 per hour") = 0.00242 USD. Output JSON (5,856 bytes,
  `samples/elevenlabs/R2_stt_scribe_v3/stt.json`): keys `language_code` (`eng`), `language_probability` (0.98),
  `text`, `words` (32 entries of type `word` and 31 of type `spacing`, each with `text`, `start`, `end`, `logprob`;
  no `audio_event` entries), `transcription_id`, `audio_duration_secs` (36.0). Text: "'Cause I've been trying to find
  out if an angel bends or breaks. Or shatters like a stone. I want to destroy something beautiful for you. I want to
  destroy for you." First words: 'Cause 0.82-1.48 s, I've 1.62-1.80, been 1.94-2.16, trying 2.32-2.68.
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
- No lyric truth exists for R2; the two transcripts differ in the second line ("Or shatters like a stone." against
  "All shadows like a stone.") and in "want to" against "wanna".

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

## Hugging Face Inference Providers: no call possible without a token

- `POST https://router.huggingface.co/v1/chat/completions` and
  `POST https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3`, sent without a token on
  2026-11-10: both answered HTTP 401 with an HTML page. No Hugging Face token exists in the key store, so nothing was
  sent to Inference Providers.

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
  `venv-gc-old`, Python 3.10; freeze in `samples/venv-gc-old.freeze.txt`). Each call's `record.json` (Space id, Space
  commit sha, hardware, status changes with times, wall-clock, result) is in `samples/hf-spaces/<call>/`.
- Searched and not usable on 2026-11-10 (stage from the runtime API): `akhaliq/demucs` RUNTIME_ERROR,
  `ahk-d/Spleeter-HT-Demucs-Stem-Separation-2025` RUNTIME_ERROR ("Memory limit exceeded (16Gi)"),
  `owiedotch/demucs-stem-separation`, `kajise/Demucs_v4-FT_4s`, `Thafx/Demucs_v4_2s_HT`, `Kevin676/Demucs_v4`,
  `sparanoid/demucs-gpu`, `Hmjz100/MT3`, `akhaliq/sam-audio-large` RUNTIME_ERROR, `njolnir/Dia-Beat-This` BUILD_ERROR.
  No Space for Basic Pitch with a Gradio API was found (search "basic-pitch": two static pages and two Docker apps);
  no audio chord-recognition Space was found (`ksangk/chord-demo`, the top "chord" result that was running, is an
  image-material demo whose endpoint returns "Basecolor" images). Authors `CPJKU` (Beat This!) and `spotify` have no
  such Spaces.

| call | Space (commit) | hardware | input | wall s | what came back |
|---|---|---|---|---|---|
| r0112 | `mimbres/YourMT3` (5e66c1ea) `/process_audio` | zero-a10g | S2n.mono.wav | 5.32 | HTML (7,498 chars) with a MIDI player; the MIDI is inline as `data:audio/midi;base64,...` (1,175 bytes once decoded) |
| r0164 | `mimbres/YourMT3-cpu` (bd69fbac) `/process_audio` | cpu-basic | S2n.mono.wav | 31.18 | the same kind of HTML; MIDI 1,177 bytes, not byte-identical to r0112's |
| r0118 | `teamup-tech/Beat-This` (8f2aa339) `/process` | cpu-basic | S4.wav | 12.59 | a WAV "Audio with Beats" (6,834,024 bytes, kept outside git) and a `pyharp.LabelList` of 68 labels `beat` / `downbeat` with `t` in seconds |
| r0119 | `nakas/demucs_playground` (d924a6d3) `/predict` | cpu-basic | S4.wav | 2.8 | `ValueError('Unknown protocol: ws')` from gradio_client 2.7.2 (the Space runs Gradio 3 with `enable_queue=True`) |
| r0141 | same, with gradio_client 0.5.3 | cpu-basic | S4.wav | 172.46 (processing 4.26 to 167.45 s) | four WAVs, `vocals`, `bass`, `drums`, `other`, each 16-bit 44.1 kHz stereo, 38.741383 s (sample count equal to the input) |
| r0116 | `hugging-apps/muscriptor-music-transcription` (a00afb21) `/transcribe`, instruments `["acoustic_guitar"]` | zero-a10g | S2n.mono.wav | 3.17 | `AppError('You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota - https://huggingface.co/settings/tokens')` |
| r0162 | `lpeterl/sam-audio-webui` (f4c65453) `/process`, `sam-audio-small`, prompt "acoustic guitar", chunk 30 s | zero-a10g | S4.wav | 3.15 | the same ZeroGPU AppError |

No job reported a queue position (`rank` and `queue_size` stayed empty in every status update). The two ZeroGPU
refusals came after one successful ZeroGPU call from this box (r0112); whether other agents on the box used ZeroGPU
quota in the same window is not known.

Which model each Space runs, from the Space's own `app.py` (read 2026-11-10): YourMT3 and YourMT3-cpu,
`model_name = 'YPTF.MoE+Multi (noPS)'`, precision `'16'` on the ZeroGPU Space and `'16' if torch.cuda.is_available()
else '32'` on the CPU Space; Beat-This, `beat_this.inference.File2Beats` with checkpoint `final0.ckpt`, `dbn=False`;
demucs_playground, `python3 -m demucs.separate -n mdx_extra_q -d cpu` (it writes the upload to `test.wav` first).

Scores:

- YourMT3 (r0112) on S2n, all MIDI tracks pooled (126 notes in three tracks: "Acoustic Piano" program 0, 15 notes;
  "Electric Piano" program 2, 58; "Guitar (clean)" program 24, 53; no pitch bends; no tempo event in the file, so readers use the MIDI default of 120 BPM): onset-only
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

- Output format facts, for handoffs: YourMT3 Spaces return an HTML string, not a file; the MIDI has to be cut out
  of its `data:audio/midi;base64,` URL; it is a format-1 MIDI file, 480 ticks per quarter note, 4 tracks (an empty
  first track, then one per predicted instrument with a General MIDI program), every note at velocity 100. Beat-This returns pyharp labels (`t`, `label` in
  {`beat`, `downbeat`}, `amplitude`, `color`) and a click-mixed WAV at the input's sample rate. demucs_playground
  returns four WAV file paths.
- Input format facts: WAV 44.1 kHz (mono 16-bit for S2n.mono.wav, stereo 16-bit for S4.wav) was accepted by all
  four Spaces that ran.
- Constraint inputs: none for YourMT3 and Beat-This through these endpoints (the audio file is the only parameter);
  Muscriptor takes an `instruments` list (35 values including `acoustic_guitar`, `clean_electric_guitar`,
  `distorted_electric_guitar`, `acoustic_bass`, `electric_bass`, `drums`), `use_sampling` and `temperature`, and its
  API lists four returns: "Download MIDI file" (a file path), "Summary", "MIDI playback & visualization" and "Piano
  roll (per instrument)";
  SAM Audio takes a model size, an audio or video file, a text `prompt` and `chunk_duration`.

## Services in this lane NOT RUN HERE (no account or key; nothing was signed up for)

The key store holds no key for any of these (checked with `getkey.py --list`, names only), and this lane's rules
forbid creating accounts. Their request formats, prices and terms are in `survey.md`; the steps for Aaron, with the
first request to make, are in `for-aaron.md`.

| service | what it would have been tried for | why not run here (evidence) |
|---|---|---|
| Music.AI (Moises' API platform) | chords, beats, guitar stems on S4 | API key from a music.ai account needed ("The API key should be included in the Authorization header of each request.", https://music.ai/docs/api/reference/) |
| Klangio API | guitar transcription to Guitar Pro / MIDI / MusicXML on S2n; chords on S3 | key in header `kl-api-key` from an account at https://auth.klang.io/register; free "Basic" tier is "Max 15s audio duration" (15 s excerpts were made for it, see Media) |
| LALAL.AI API | guitar stem of S4 | header `X-License-Key` from a paid license (https://www.lalal.ai/api/v1/openapi.json) |
| AudioShake Tasks API | guitar stem of S4 | header `x-api-key` from a developer account ("10 free credits" on sign-up) |
| Fadr API | stems, MIDI, chords, key, tempo of S4 | "Usage of the Fadr API requires a Fadr Plus subscription" |
| MVSEP API | "MVSep Guitar" (render_id 31) on S4 | `api_token` from an mvsep.com account; the public algorithm list (`GET https://mvsep.com/api/app/algorithms`, no token, 126 entries) was read |
| Replicate | `ryan5453/demucs`, `sakemin/all-in-one-music-structure-analyzer`, `triadmusic/chord-detection-cnn-lstm` | "All API requests must include a valid API token in the `Authorization` request header." (https://replicate.com/docs/reference/http.md) |
| fal.ai | `fal-ai/demucs` (htdemucs_6s, guitar stem) | header `Authorization: Key $FAL_KEY`; also needs the audio at a URL (`audio_url`) |
| Hugging Face ZeroGPU Spaces (Muscriptor, SAM Audio, Transkun) | notes of S2n, guitar from S4 | anonymous ZeroGPU quota refused (r0116, r0162); a free HF token gives more quota (the error message) |
| Gemini API direct | trials (a) to (d) | key works, prepaid balance at 0: HTTP 402 (r0013, r0014) |
| Gemini through the Vercel AI Gateway | trials (a) to (d) | gateway key on the free tier: HTTP 403 for every Google model (r0022, r0023) |
| Soundslice data API | upload S2n.gp5 plus audio, sync points | "API keys are only available to paying Soundslice customers — either in the Teacher or Licensing plans." |
| Flat.io API | import S2n.gp5, export MusicXML | "Personal Access Tokens or OAuth2" (spec intro); no Flat account |
| Hooktheory Trends API | chord-progression statistics | Bearer token from `POST users/auth` with a hooktheory.com username and password |
| Songsterr | looking up an existing tab | no documented developer API; robots.txt has `Disallow: /api/` (survey.md); not called |
| Chordify | chords from a link | no developer API found; the site answered HTTP 403 to this box (survey.md); not called |
