# Lane 10, hosted-apis: what Aaron can run (or unlock) himself

Written 2026-11-10 by try-hosted-apis; checked the same day by verify-trials-hosted-apis (its changes are listed in
the verification log at the end of `trials.md`). Every service below either needs an account or key that does not exist yet,
or an existing key that is out of credit. Nothing was signed up for. Each section says: how to get the key (store it
in your key store, the `/save-api-key` way, under the name given, so an agent can run the trial later), the free
tier or trial, the exact first request (a curl command; the key is read into a shell variable first and never
echoed), and what to send back. Prices and limits are as the vendors' pages showed them on 2026-11-10 (quoted in
`survey.md` and `trials.md`); they change.

**Where the clips are.** The shared test clips (S2n, S3, S4, R2, ...) and the 15-second excerpts made for this
lane (`S2n_0-15s.wav`, `S3_0-15s.wav`, `S4_0-15s.wav`) are on the research box under `/home/user/gtr/inputs/` and
`/home/user/gtr/lanes/hosted-apis/inputs/`; the orchestrator files them in your studio library with the other media
of this research. Ask an agent for "the S4 clip of the guitar-tab research" if you run something by hand. Only
upload the synthesized clips (S1 to S7) or the freely licensed ones (R2 CC BY 4.0, R3a CC BY-SA 4.0) to any
service; the GuitarSet clips (R1) are CC BY 4.0 too, but no trial here needs them.

**What to send back, every time:** the downloaded result files (MIDI, MusicXML, Guitar Pro, JSON, stems) as they
come, the exact settings you picked, how long it took (start to finish, by the clock), and what it cost (the
charge or credits shown afterwards). A screenshot of the result page helps when the service shows something it does
not let you download.

## 1. Google Gemini API: top up the existing key's prepaid credit (unblocks the ready-made trials)

The key in the store works (it lists models and counts tokens) but every generation request returns HTTP 402
"Your prepayment credits are depleted" (`trials.md`, run r0013).

1. Open https://aistudio.google.com/billing in the browser, signed in with the Google account the key belongs to.
2. Click **Buy credits** and buy the minimum, 5 USD (the billing page: "To purchase credits, go to the AI Studio
   Billing page and select **Buy credits**. The minimum purchase is $5."; its FAQ adds that the purchase dialog
   shows the minimum "required for your region and tier level"). Do not turn on auto-reload.
3. When the purchase shows as done on the Billing page, tell an agent: "Gemini credits are topped up; run the
   hosted-apis Gemini trials." (A free re-check by the verifier at 21:49 UTC on 2026-11-10, r0300, still got HTTP 402.)
   The agent runs `scripts/gemini_trial.py` for `gemini-4-carbon` and `gemini-3.5-flash-lite` on S3 and S4
   (chords, tempo, key), S2n (notes), R3a (capo, frets, tuning) and S5capo2 (capo), 10 calls, capped at 2 USD by
   the script. The input side is small (656 to 1,921 tokens per file before the prompt text, measured with
   `countTokens`); the output side
   (thinking included) decides the cost: at most 24,576 output tokens per call, i.e. at most 0.25 USD per Carbon
   call and 0.06 USD per Flash-Lite call at the prices read on 2026-11-10. The pricing page lists Carbon at "$2.00
   through November 30, 2026. $4.00 starting December 1, 2026." (input) and "$10.00 through November 30, 2026.
   $20.00 starting December 1, 2026." (output), so a Carbon call from December 2026 costs up to about twice that.
4. Send back: nothing; the agent saves the answers, scores and costs. (For the agent: rebuild the Python environment
   with `uv venv --python 3.11 <dir>` and `uv pip install -r samples/venv-apis.freeze.txt`; the prompts are in
   `scripts/prompts/`, the scoring helper is `scripts/score_answer.sh`.)

## 2. Vercel AI Gateway: paid credits (optional; unlocks Gemini and other models through the same gateway key)

The gateway key is on the free tier, which refused every Google model with HTTP 403 "Free tier users do not have
access to this model" (`trials.md`, r0022 and r0023).

1. In your Vercel dashboard, open the **AI Gateway** section in the sidebar, click the button in the upper right
   corner that shows your AI Gateway Credits balance, pick the amount, then **Continue to Payment** and **Confirm and
   Pay** (the steps on https://vercel.com/docs/ai-gateway/pricing , "Top up your AI Gateway Credits").
2. Tell an agent: "Vercel AI Gateway now has paid credits; re-run the hosted-apis gateway trials with
   google/gemini-4-carbon and google/gemini-3.5-flash-lite." The same script (`scripts/gateway_trial.py`) is used,
   so the results line up with the free-tier models already tried. UNVERIFIED: the gateway's own model list
   (`GET https://ai-gateway.vercel.sh/v1/models`, read 2026-11-10) gives both Google models the input modalities
   `text`, `image`, `pdf`, `video`, without `audio`, so whether the gateway passes a WAV `file` part to them is not
   known until the first call; the video question would go as frames (MP4 `file` parts were refused for the three
   free-tier models, `trials.md`). The direct Gemini route (section 1) takes WAV and MP4 (`countTokens` accepted
   both, r0016).
3. Note from the pricing page: "Once you purchase credits, your account transitions to the paid tier and the
   monthly free credit no longer applies."
4. Send back: nothing; the agent re-runs the trials and saves the answers, scores and costs.

## 3. Hugging Face: a free access token (the GPU demo pages' error message asks for one)

Two public demo pages on Hugging Face that run on shared GPUs ("ZeroGPU") answered "You have exceeded your ZeroGPU
runs limit. Authenticate with a Hugging Face token for more quota" without a token: the Muscriptor transcription
page and the SAM Audio separation page (`trials.md`). In the verifier's re-runs (21:50 UTC) Muscriptor refused
again and the ZeroGPU YourMT3 page, which had answered once, refused too ("You have exceeded your ZeroGPU quota (90s
requested vs. 79s left). Try again in 15:33:27. ...").

1. Sign in at https://huggingface.co (free account), open https://huggingface.co/settings/tokens and create a new
   token named `research-spaces` (which token type or account plan the ZeroGPU quota needs is UNVERIFIED; the error
   text says only "Authenticate with a Hugging Face token for more quota").
2. Store it as `HF_TOKEN`.
3. Tell an agent: "HF_TOKEN is stored; run the ZeroGPU Spaces from the hosted-apis lane": 
   `hugging-apps/muscriptor-music-transcription` on S2n with instrument `acoustic_guitar`, `lpeterl/sam-audio-webui`
   on S4 with the prompt "acoustic guitar", and `teamup-tech/Transkun` on S2n (listed in `survey.md`).
4. Send back: nothing.

## 4. Klangio API (guitar transcription to Guitar Pro, MIDI, MusicXML; chords; beats)

- Key: register at https://auth.klang.io/register, then copy the API key from https://api-dashboard.klang.io. Store
  it as `KLANGIO_API_KEY`. The API page says access is by an application form ("Apply now", `survey.md`), so the
  key may come only after Klangio accepts the application.
- Free tier (https://klang.io/api/): Basic "$ 0" monthly, "50 requests included", "Max 15s audio duration", "1
  request per minute". So use the 15-second excerpts. The docs also say: "For a testing account a demo
  transcription is created by default." and "Use as little output formats as possible. Multiple formats may inflict
  additional quota costs for a transcription job." (`survey.md`), so the first call below, with four formats, may
  cost more than one request of quota, and on a testing account may return a demo transcription; write down which.
- First requests (an agent runs these; one per minute):

```bash
KLANGIO_API_KEY=$(python3 ~/.claude/bin/getkey.py KLANGIO_API_KEY)
# guitar transcription of the first 15 s of S2n, all score formats
curl -sS -X POST "https://api.klang.io/transcription?model=guitar&title=S2n" \
  -H "kl-api-key: $KLANGIO_API_KEY" \
  -F "file=@S2n_0-15s.wav" -F "outputs=gp5" -F "outputs=midi" -F "outputs=mxml" -F "outputs=json"
# -> {"job_id": ...}; then poll, then fetch each format
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" https://api.klang.io/job/<job_id>/status
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.gp5  https://api.klang.io/job/<job_id>/gp5
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.mid  https://api.klang.io/job/<job_id>/midi
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.xml  https://api.klang.io/job/<job_id>/xml
curl -sS -H "kl-api-key: $KLANGIO_API_KEY" -o S2n_klangio.json https://api.klang.io/job/<job_id>/json
# chords (extended: key, chords, strums) of the first 15 s of S3
curl -sS -X POST "https://api.klang.io/chord-recognition-extended?vocabulary=full" \
  -H "kl-api-key: $KLANGIO_API_KEY" -F "file=@S3_0-15s.wav"
```

- `outputs` is an array form field in the spec; sending it as repeated form fields, as above, is the usual
  multipart form of an array (UNVERIFIED for this API until the first call).
- Send back (or let the agent keep): the .gp5, .mid, .xml and .json files and the chord JSON. The agent scores
  notes and string/fret against S2n's truth (first 15 s) and chords against S3's. Whether the `json` output holds
  string and fret per note is not documented (UNVERIFIED until this call).
- In the web app instead (no API key): Guitar2Tabs at https://klang.io/guitar2tabs/ , upload `S2n_0-15s.wav`,
  download whatever it offers on your plan (Guitar Pro, MIDI, MusicXML or PDF) and send it back with a screenshot
  of the tab.

## 5. Music.AI (Moises' developer platform: chords, beats, guitar stems)

- Key: create an account at https://music.ai , open the dashboard, create an API key; store it as `MUSICAI_API_KEY`.
  UNVERIFIED whether an individual account can still get a key: a third-party README quoted in `survey.md` says
  "MUSIC.ai no longer provide individual API key, only business plan", while the pricing page read the same day
  lists a pay-as-you-go plan. If the dashboard offers no key, send back a screenshot of what it shows instead.
- Plan (https://music.ai/pricing/, as quoted in `survey.md`): "Pay as you go $0" with per-module prices, among them
  "Transcription - Chords $0.04 / min", "Transcription - Beats $0.03 / min" and "Stem separation - Guitar stems
  (Acoustic guitar, Electric guitar) $0.1 / min"; for the 38.7-second S4 that is about 0.11 USD for the three modules
  if billed by the exact duration (whether a started minute is rounded up is not in the lines quoted).
  The FAQ: "Pay-as-you-go and Professional members must purchase credits up front".
- In the dashboard, build one workflow from the modules **Chords**, **Beats** and **Guitar Stems** (input: one audio
  URL) and note its slug, for example `guitar-research`, and the name of its input: the API reference says `params`
  "must match the workflow's input schema"; its job examples use `inputUrl`, the module pages `inputFileUrl`
  (`survey.md`). Use that name in the job request below.
- First request (an agent runs it):

```bash
MUSICAI_API_KEY=$(python3 ~/.claude/bin/getkey.py MUSICAI_API_KEY)
# the docs line quoted in survey.md puts the key in the Authorization header; whether a "Bearer " prefix is needed is UNVERIFIED
curl -sS -H "Authorization: $MUSICAI_API_KEY" https://api.music.ai/v1/upload      # -> uploadUrl, downloadUrl
curl -sS -X PUT -H "Content-Type: audio/wav" --data-binary @S4.wav "<uploadUrl>"
curl -sS -X POST https://api.music.ai/v1/job -H "Authorization: $MUSICAI_API_KEY" -H "Content-Type: application/json" \
  -d '{"name": "S4 guitar research", "workflow": "<your workflow slug>", "params": {"inputUrl": "<downloadUrl>"}}'
curl -sS -H "Authorization: $MUSICAI_API_KEY" https://api.music.ai/v1/job/<job id>   # until status SUCCEEDED
```

- Send back: the job's `result` JSON and the files it links (chord map, beat map, acoustic and electric guitar
  stems). The agent scores chords, beats and the guitar stem against S4's truth.
- Terms note (quoted in `survey.md`): free "Evaluation Access" output is for "internal testing and evaluation".

## 6. LALAL.AI (stem separation with guitar stems)

- Key: LALAL.AI's llms.txt (quoted in `survey.md`): "API access is available with the Pro plan or any minute top-up
  pack - no subscription required" and "API requests consume Fast-queue minutes." So buy the Pro plan or a minute
  top-up pack at https://www.lalal.ai/pricing/ , then copy the license key that the API reads from the
  `X-License-Key` header (where the account pages show it was not read here: UNVERIFIED); store it as
  `LALALAI_LICENSE_KEY`.
- First request (OpenAPI spec https://www.lalal.ai/api/v1/openapi.json):

```bash
LALALAI_LICENSE_KEY=$(python3 ~/.claude/bin/getkey.py LALALAI_LICENSE_KEY)
curl -sS -X POST https://www.lalal.ai/api/v1/upload/ -H "X-License-Key: $LALALAI_LICENSE_KEY" \
  -H "Content-Type: application/octet-stream" -H "Content-Disposition: attachment; filename=S4.wav" \
  --data-binary @S4.wav                                   # -> {"id": <source id>, ...}
curl -sS -X POST https://www.lalal.ai/api/v1/split/stem_separator/ -H "X-License-Key: $LALALAI_LICENSE_KEY" \
  -H "Content-Type: application/json" -d '{"source_id": "<source id>", "presets": {"stem": "guitar"}}'
curl -sS -X POST https://www.lalal.ai/api/v1/check/ -H "X-License-Key: $LALALAI_LICENSE_KEY" \
  -H "Content-Type: application/json" -d '{"task_ids": ["<task id>"]}'   # then download the result URLs
```

- From the spec (`StemSeparatorSplitterPresetsV1`, `CheckV1Request`): `stem` is one of `vocals`, `drum`, `piano`,
  `bass`, `guitar`, `electric_guitar`, `acoustic_guitar`, `synthesizer`, `strings`, `wind`; "'guitar' is available
  only with andromeda"; `splitter` defaults to `auto`; `/check/` takes `{"task_ids": [...]}`. Send back: the guitar
  stem and the "no guitar" remainder.

## 7. AudioShake (stem separation incl. guitar, acoustic and electric guitar)

- Key: sign up at https://dashboard.audioshake.ai/auth/sign-up/ (the sign-up link the quickstart gives); the
  quickstart says "You'll get 10 free credits to start building immediately." Store the key as
  `AUDIOSHAKE_API_KEY`. Credits are "charged per minute of source audio, per target model" and "Duration is always
  rounded up to the nearest minute" (billing page), so S4 (39 s) with one target costs 1 credit (the `guitar` model is listed at
  1.0 credits per minute).
- First request (quickstart https://developer.audioshake.ai/quickstart.md; a local file is uploaded first and the
  task refers to its `assetId`):

```bash
AUDIOSHAKE_API_KEY=$(python3 ~/.claude/bin/getkey.py AUDIOSHAKE_API_KEY)
# 1) upload S4.wav with the "Upload File" endpoint of the docs -> assetId
# 2) start the task
curl -sS -X POST https://api.audioshake.ai/tasks -H "x-api-key: $AUDIOSHAKE_API_KEY" -H "Content-Type: application/json" \
  -d '{"assetId": "<assetId>", "targets": [{"model": "guitar", "formats": ["wav"]}]}'
curl -sS -H "x-api-key: $AUDIOSHAKE_API_KEY" https://api.audioshake.ai/tasks/<task-id>   # output links expire after one hour
```

- Or `pip install audioshake` (official client and CLI, per the quickstart). Send back: the guitar stem WAV.

## 8. Fadr (stems plus MIDI per stem, chords, key, tempo)

- Key: "Usage of the Fadr API requires a Fadr Plus subscription, which costs $10/mo or $100/yr." Create the key in
  the Fadr account; store it as `FADR_API_KEY`.
- Flow (https://fadr.com/docs/api, pages dated 2023): `POST https://api.fadr.com/assets/upload2` (presigned upload
  URL) -> `PUT` the file -> `POST /assets` -> `POST /assets/analyze/stem` -> poll the task until it is done (the
  endpoint list has `GET /tasks/:_id`; the tutorial waits 5 s between `POST /tasks/query` calls) ->
  `GET /assets/download/<id>/<type>` for each stem and MIDI file. Header: `Authorization: Bearer $FADR_API_KEY`.
- By hand instead: the Fadr web app (https://fadr.com), upload `S4.wav`, export all stems and all MIDI, and send them
  back with the chord list, key and tempo it shows (screenshot).

## 9. MVSEP (126 separation algorithms; several guitar models)

- Key: register at https://mvsep.com (the plans table, quoted in `survey.md`, gives registered free accounts API
  access "Limited"; the lowest-priced credit pack in that table is $3 for 60 credits), copy the API token; store it as
  `MVSEP_API_TOKEN`.
- First request (https://mvsep.com/full_api; `sep_type` is the `render_id` from
  https://mvsep.com/api/app/algorithms, where "MVSep Guitar (guitar, other)" has render_id 31 and its `add_opt1`
  lists model versions such as "3": "MelRoformer (2024.06, SDR: 7.02)", an author-reported figure). Leave `is_demo`
  out: the docs describe it as "should the separation be published to demo page, defaults to false".

```bash
MVSEP_API_TOKEN=$(python3 ~/.claude/bin/getkey.py MVSEP_API_TOKEN)
curl -sS -X POST https://mvsep.com/api/separation/create -F "api_token=$MVSEP_API_TOKEN" \
  -F "audiofile=@S4.wav" -F "sep_type=31" -F "add_opt1=3" -F "output_format=1"     # -> data.hash
curl -sS "https://mvsep.com/api/separation/get?hash=<hash>"                         # until status done; download files
```

- Send back: the guitar and other WAVs.

## 10. Replicate (hosted Demucs, All-In-One structure analysis, chord detection)

- Key: sign in at https://replicate.com , create a token at https://replicate.com/account/api-tokens; store it as
  `REPLICATE_API_TOKEN`. The pricing page lists hardware by the second (https://replicate.com/pricing, as quoted in
  `survey.md`: "Nvidia T4 GPU gpu-t4 $0.000225/sec $0.81/hr"; the A100 (40GB) that two of these model pages name
  is not on it), and each model page gives an approximate cost per run: `ryan5453/demucs` "costs approximately
  $0.0050 to run on Replicate", the all-in-one analyzer "approximately $0.062", the chord model "approximately
  $0.022" (`survey.md`). The current `ryan5453/demucs` version serves `htdemucs` only, four stems, no guitar stem.
- First request (HTTP API docs https://replicate.com/docs/reference/http.md: "Files should be passed as HTTP URLs
  or data URLs."; model inputs from https://replicate.com/ryan5453/demucs/llms.txt: `audio` required, `model`
  "(this deployment serves htdemucs)", `format`, `isolate_stem`, `shifts`, ...):

```bash
REPLICATE_API_TOKEN=$(python3 ~/.claude/bin/getkey.py REPLICATE_API_TOKEN)
python3 - <<'EOF' > body.json
import base64, json
print(json.dumps({"input": {"audio": "data:audio/wav;base64," + base64.b64encode(open("S4.wav", "rb").read()).decode(), "format": "wav"}}))
EOF
curl -sS -X POST -H "Prefer: wait" -H "Authorization: Bearer $REPLICATE_API_TOKEN" -H "Content-Type: application/json" \
  --data-binary @body.json https://api.replicate.com/v1/models/ryan5453/demucs/predictions
```

- The output is an object with `bass`, `drums`, `other`, `vocals` file URLs (the model's output schema also lists
  `no_bass`, `no_drums`, `no_other`, `no_vocals`, for `isolate_stem`); the HTTP API docs say "Output files are served
  by `replicate.delivery` and its subdomains" (whether a download needs the token is not stated in the lines read).
  Then the same for `sakemin/all-in-one-music-structure-analyzer` on S4 and
  `triadmusic/chord-detection-cnn-lstm` on S3 (their input fields: read each model's `/llms.txt` first). Send back:
  the outputs and the "predict time" each prediction reports.

## 11. fal.ai (hosted Demucs with a guitar stem)

- Key: sign up at https://fal.ai , create a key in the dashboard; store it as `FAL_KEY`. Price on the model page:
  "$0.0007 per seconds".
- The endpoint takes a URL, not an upload: `audio_url` (required), `model` (default `"htdemucs_6s"`), `stems`,
  `output_format` (default `"mp3"`). The file has to be reachable at a URL first (fal's client libraries can upload
  files; whether a `data:` URL is accepted is UNVERIFIED).

```bash
FAL_KEY=$(python3 ~/.claude/bin/getkey.py FAL_KEY)
curl -sS -X POST https://fal.run/fal-ai/demucs -H "Authorization: Key $FAL_KEY" -H "Content-Type: application/json" \
  -d '{"audio_url": "<URL of S4.wav>", "model": "htdemucs_6s", "output_format": "wav"}'
```

- Send back: the six stems.

## 12. Soundslice, Flat.io, Hooktheory (notation and chord data, not audio analysis)

- **Soundslice data API:** "API keys are only available to paying Soundslice customers — either in the Teacher or
  Licensing plans." Uploading notation through the API is "only available by special permission". By hand: in the
  Soundslice web app, create a slice from `S2n.gp5` (in `docs/guitar-tab-research/inputs/S2n/`), attach the S2n
  audio (`S2n.wav`), sync it, and send back a screenshot plus the time it took to sync.
- **Flat.io API:** auth is "Personal Access Tokens or OAuth2" (the spec's intro); create a personal access token in
  the Flat account and store it as `FLAT_TOKEN`.
  First request: import `S2n.gp5` with `POST https://api.flat.io/v2/scores` (`ScoreCreationFileImport`; the spec
  lists `.gp5` among the accepted Guitar Pro formats, under "Also supported (converted to MusicXML on import, some
  notation details may be lost)"), then export it as MusicXML; send back the MusicXML.
- **Hooktheory Trends API:** an account at hooktheory.com; the token comes from `POST
  https://api.hooktheory.com/v1/users/auth` with the username and password and "expires about an hour after it is
  issued". First request: `GET https://api.hooktheory.com/v1/trends/nodes?cp=1,5` with `Authorization: Bearer
  <activkey>` (the chords that most often follow I-V). Store the username and password as `HOOKTHEORY_USER` and
  `HOOKTHEORY_PASSWORD` if an agent should call it; send back nothing, the agent saves the JSON.

## 13. Not for this lane

Chordify, Songsterr and the consumer Moises app have no developer API that `survey.md` could find (Songsterr's
robots.txt disallows `/api/`); they belong to the apps-survey lane's steps.

## 14. xAI's API terms: save the page (added in gap round 2, 2026-11-11)

The speech-to-text calls (r0105, r0306) went straight to xAI's API with the xAI key. xAI's docs FAQ
(https://docs.x.ai/developers/faq/general.md), under "Where are your Terms of Service and Privacy Policy?", points to
https://x.ai/legal "for our Enterprise Terms of Service and Data Processing Addendum", but
https://x.ai/legal/terms-of-service-enterprise answered HTTP 403 (a Cloudflare "Sorry, you have been blocked"
page) to the research box and to the agent's web-fetch tool on 2026-11-11, so no clause from it is quoted
(`survey.md`, "xAI Speech to Text API").

1. In a browser, open https://x.ai/legal/terms-of-service-enterprise (and, if it is a separate page, the Data
   Processing Addendum linked from https://x.ai/legal).
2. Save each page as a PDF (print the page to a PDF printer) or copy its whole text into a `.txt` file.
3. Send back: the saved files and the date you saved them. An agent then quotes the clauses on who owns API
   outputs, whether inputs and outputs are used for training, and retention, into `survey.md`.

## 15. Mureka Music Transcription on fal.ai (added in gap round 2, 2026-11-11; 0.40 USD)

A hosted endpoint that turns a song into a ZIP that "can include MusicXML, PDF sheet music, and timestamped lyrics"
(`survey.md`, "Mureka Music Transcription on fal.ai"). The key store has no fal key, so it was not called here.

- Key: sign up at https://fal.ai , add a little credit, create a key in the dashboard; store it as `FAL_KEY`. Price on
  the model page: "$0.20" per song, so the two calls below cost 0.40 USD. (The same key also unlocks section 11.)
- Inputs: S4 (synthesized band mix, 38.741 s, `S4.wav`) and R2 (Josh Woodward's CC BY 4.0 song excerpt, 36.000 s,
  `R2.wav`). Both are inside the endpoint's limits ("between 10 seconds and 10 minutes and no larger than 100 MB"),
  and `audio_url` takes a data URI, so no upload host is needed.
- First requests (an agent runs these, from a folder holding copies of `/home/user/gtr/inputs/S4/S4.wav` and
  `/home/user/gtr/inputs/R2/R2.wav`; the key is read into a variable and never echoed):

```bash
FAL_KEY=$(python3 ~/.claude/bin/getkey.py FAL_KEY)
for c in S4 R2; do
python3 - "$c" <<'PY' > body_$c.json
import base64, json, sys
c = sys.argv[1]
b = base64.b64encode(open(f"{c}.wav", "rb").read()).decode()
print(json.dumps({"audio_url": "data:audio/wav;base64," + b, "title": c}))
PY
curl -sS -X POST https://fal.run/mureka/api/song/transcribe -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" --data-binary @body_$c.json -o result_$c.json   # -> {"zip_url": "..."}
done
```

- Then download each `zip_url`. Send back (or let the agent keep): both ZIPs as they come, the time each call took and
  the charge shown in the fal dashboard. The agent lists what each ZIP holds (MusicXML parts, PDF, lyrics), converts
  the S4 MusicXML to notes and scores them against S4's truth with `gtr-eval notes` (all parts, then the guitar part
  if there is one), and compares R2's timestamped lyrics with the two speech-to-text transcripts in `trials.md`.
