# Lane 10, hosted-apis: survey of hosted services and APIs

Agent: docs-hosted-apis. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from the live
pages on 2026-11-10 unless a line says otherwise. Raw copies of most pages fetched with curl are kept outside the
repo in `/home/user/gtr/lanes/hosted-apis/raw/` (not committed). This file records facts and quotes only.

Checked and corrected in place by verify-docs-hosted-apis on 2026-11-10: every page was fetched again (copies in
`/home/user/gtr/lanes/hosted-apis/verify-docs/raw/`, not committed) and every quoted string was searched for on it
with `scripts/verify-docs/check_quotes.py`. What changed, and the tally, is in "## Verification log" at the end.
Sections added by the checker are marked "(added by verify-docs)".

Marks used in the tool list:

- `RUNNABLE`: can be called or run from the CPU-only research box without an account (public endpoint, or a
  local program).
- `CALLABLE-WITH-KEY`: an HTTP API that needs an account and API key (or a paid balance); nothing in it needs a
  local GPU, because the compute runs on the provider's side.
- `NO-PUBLIC-API`: no developer API was found on the vendor's own pages on 2026-11-10.

## Tool list

First pass written in the first 15 minutes from web search results, then updated after each section was written.
The section for each tool is what counts; dates are the dates printed on the pages read on 2026-11-10.

1. Music.AI (Moises' API platform; its terms grant feedback rights to "Moises"). REST `https://api.music.ai/v1`,
   jobs run workflows built from modules (guitar stems, guitar parts, chords, beats, sections, metronome).
   https://music.ai/docs/ . Terms "Last updated: May 02, 2025". CALLABLE-WITH-KEY. Section written.
2. Klangio API (Klangio GmbH): transcription to MusicXML / Guitar Pro 5 / MIDI / PDF, chords with times, beats,
   strums, 4- or 6-stem separation. https://api-docs.klang.io , spec `info.version` 0.2.0. CALLABLE-WITH-KEY (free
   "Basic" tier: 50 requests, 15 s max audio). Section written.
3. LALAL.AI API v1 (OmniSale GmbH): stem separation incl. `guitar`, `electric_guitar`, `acoustic_guitar`.
   https://www.lalal.ai/api/v1/openapi.json (version 1.1.0); terms "Last updated: July 30, 2026". CALLABLE-WITH-KEY.
   Section written.
4. AudioShake Tasks API: stem separation incl. `guitar`, `guitar_electric`, `guitar_acoustic`. https://developer.audioshake.ai ;
   MSA "Effective October 1, 2026". CALLABLE-WITH-KEY (10 free credits on sign-up). Section written.
5. Fadr API: 4 stems plus MIDI per stem, chord progression, key and tempo; melodic split incl. electric and acoustic
   guitar. https://fadr.com/docs/api ; docs dated "Aug 19, 2023" / "Aug 22, 2023", API terms "Sep 5, 2023".
   CALLABLE-WITH-KEY (Fadr Plus). Section written.
6. MVSEP API: 126 separation algorithms incl. guitar, acoustic, electric and lead/rhythm guitar models.
   https://mvsep.com/full_api , spec version 1.1.1; terms "Effective Date: October 19, 2026". CALLABLE-WITH-KEY
   (registered free accounts: "Limited" API access). Section written.
7. Replicate hosted models: `sakemin/all-in-one-music-structure-analyzer` (A100), `ryan5453/demucs` (A100; its
   latest version, created 2026-10-03, serves `htdemucs` only, four stems, no guitar stem),
   `triadmusic/chord-detection-cnn-lstm` (T4). https://replicate.com ; terms "Last Update: April 1, 2026".
   CALLABLE-WITH-KEY. Section written (input/output schemas read from the JSON embedded in each model page).
8. fal.ai `fal-ai/demucs` (htdemucs_6s default, guitar stem, "$0.0007 per seconds"). https://fal.ai/models/fal-ai/demucs ;
   terms "Last Updated: September 8, 2026". CALLABLE-WITH-KEY. Section written. The upstream Demucs README says the
   license of the weights "is not clear" (quoted in the Replicate section).
9. Hugging Face Inference Providers (no music task listed) and public Spaces via `gradio_client`. On 2026-11-10
   `taejunkim/all-in-one`, `akhaliq/demucs`, `Hmjz100/MT3` were in RUNTIME_ERROR; `teamup-tech/Transkun` was RUNNING
   (zero-a10g). RUNNABLE for a public Space that is running (anonymous use is rate limited). Section written; the
   Spaces the try agent called (YourMT3, Beat-This, demucs_playground) are in `trials.md`.
10. Soundslice data API: slices, notation upload (MusicXML, Guitar Pro, PowerTab, TuxGuitar; special permission),
    MusicXML export, recordings incl. YouTube, syncpoints. https://www.soundslice.com/help/data-api/ .
    CALLABLE-WITH-KEY (Teacher or Licensing plans). Section written.
11. Flat.io REST API v2: import MusicXML / MIDI / Guitar Pro / PowerTab and more; export MusicXML, MIDI, MP3, WAV,
    sync points. https://flat.io/developers/docs/openapi.yaml (version 2.26.2). CALLABLE-WITH-KEY (personal token or
    OAuth2); Flat's help page also lists a remote MCP server. Section written (no API-specific terms or API price
    page was found; the Embed and Individual terms are quoted).
12. Songsterr: no documented developer API (`/a/wa/api` "Page not found!", robots.txt `Disallow: /api/`); ai.txt
    "Last updated: 2026-11-09". NO-PUBLIC-API. Section written.
13. Hooktheory API (Trends: next-chord probabilities and songs per progression). https://www.hooktheory.com/api/trends/docs .
    CALLABLE-WITH-KEY (hooktheory.com account; 10 requests per 10 s). Section written.
14. Chordify: site answered HTTP 403 to this box; no developer API found by search. NO-PUBLIC-API (UNVERIFIED).
    Section written.
15. Google Gemini API: audio (32 tokens/s on the docs page, 9.5 h max) and video (1 fps default, custom `fps`,
    YouTube URLs) in, text out. https://ai.google.dev/gemini-api/docs (on 2026-11-10 every `ai.google.dev/gemini-api/`
    URL cited here redirected to the same path under https://aistudio.google.com/docs/); terms "Effective March 23,
    2026". CALLABLE-WITH-KEY. Section written.
16. Other multimodal LLM APIs: OpenAI audio in Chat Completions (`gpt-audio-1.5`, `input_audio`) partly read;
    Claude Messages API (no audio or video content block in its reference), Alibaba Qwen-Omni (audio and video in),
    xAI and DeepSeek (text and image only, from the try agent's model listing) read by verify-docs; Amazon Nova not
    read. CALLABLE-WITH-KEY. Section written.
17. YouTube Terms of Service ("Dated: December 15, 2023"), YouTube API Services Terms and Developer Policies (pages
    "Last updated 2026-11-06 UTC"). Section written (quotes only).
18. yt-dlp 2026.10.26 (PyPI upload 2026-10-26), Unlicense; PyInstaller executables GPLv3+. RUNNABLE. Section written.
19. ChordMini: docs URL answered HTTP 402 on 2026-11-10. UNVERIFIED. Section written.
20. StemSplit API (`SIX_STEMS` includes guitar; takes YouTube URLs). https://stemsplit.io . CALLABLE-WITH-KEY.
    Section added by verify-docs.
21. Moises consumer app: terms "Last Updated: October 7, 2026" do not mention YouTube. Section written.
22. Spotify Web API Audio Features / Audio Analysis: closed to new apps from 2024-11-27 (Spotify blog). Section written.
23. GetSongBPM API (tempo and key looked up by title). https://getsongbpm.com/api (answered HTTP 403 to this box on
    2026-11-10). Not researched.
24. Cyanite API (offered inside Music.AI as "Music metadata (By Cyanite)"). Not researched as a separate API.
25. ElevenLabs Stem Separation API (`two_stems_v1`, `six_stems_v1` with a `guitar` stem) and Speech to Text.
    https://elevenlabs.io/docs/api-reference/music/separate-stems ; terms "Last Updated: 09 October 2026".
    CALLABLE-WITH-KEY. Section added by verify-docs (the try agent called it: `trials.md`, r0064).
26. Vercel AI Gateway: one OpenAI-compatible endpoint in front of many model providers; audio as a `file` part.
    https://vercel.com/docs/ai-gateway . CALLABLE-WITH-KEY. Section added by verify-docs (the try agent called it).
27. MusicGPT API `POST /v1/audio_to_midi` (audio file or YouTube URL in; MIDI, optional sonified WAV and note-event
    CSV out). https://docs.musicgpt.com . CALLABLE-WITH-KEY. Section added by verify-docs (price and terms not read).
28. Alibaba Cloud Model Studio Qwen-Omni (`qwen3.8-omni-flash` and others): text, image, audio and video in.
    https://help.aliyun.com/en/model-studio/qwen-omni . CALLABLE-WITH-KEY. Listed in "Other multimodal LLM APIs".

## Klangio API

- What it is: Klangio GmbH (Karlsruhe, Germany) sells music transcription apps (Guitar2Tabs, Piano2Notes,
  Sing2Notes, Transcription Studio, a VST3 plugin) and a separate developer API, "Klangio Transcription API".
  Docs: https://api-docs.klang.io (Docusaurus site, sitemap lists 22 pages); machine-readable spec:
  https://api.klang.io/openapi.json (OpenAPI 3.1.0, `info.version` "0.2.0", build hash
  cc0679b7b548132de5915bc7d02ecc9b91c132b0 in its description). Read 2026-11-10.
- How a program calls it: HTTPS, API key in header `kl-api-key` (docs "Basic Job Workflow"). Account at
  https://auth.klang.io/register, key in the dashboard https://api-dashboard.klang.io. Pattern: `POST` a multipart
  upload (field `file`) to a job endpoint, then poll `GET https://api.klang.io/job/{job_id}/status` or pass
  `webhook_url`, then `GET https://api.klang.io/job/{job_id}/{format}`. Status values in the spec: `IN_QUEUE`,
  `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`, `TIMED_OUT`; the Basic Job Workflow page lists four of them
  (`IN_QUEUE`, `IN_PROGRESS`, `FAILED`, `COMPLETED`), and the status response can carry an `error` string. The create
  response carries `job_id`, `creation_date`, `deletion_date`, `status_endpoint_url` (docs example); a transcription
  job's response also carries `gen_xml`, `gen_midi`, `gen_midi_quant`, `gen_gp5`, `gen_pdf` (spec and the
  transcription page's example). The docs sitemap names the host `docs-api.klang.io`; the `api-docs.klang.io` URLs
  cited here answered HTTP 200 directly, and `docs-api.klang.io` could not be reached through this box's proxy (502).
- Basic Job Workflow page: "Depending on your current subscription billing status, creating a job may inflict quota
  costs. For a testing account a demo transcription is created by default."
- Errors page (https://api-docs.klang.io/docs/getting-started/error-descriptions , read by verify-docs 2026-11-10):
  "Audio file format could not be parsed!", "Audio file must be longer than 5 seconds!", and for beat tracking "this
  error may occur if the audio is a-rhythmic, has a tempo outside the 40-300 bpm range". Which input audio formats
  parse is not listed on the docs pages read (the File Formats pages describe outputs only): UNVERIFIED.
- Endpoints in openapi.json: `/transcription`, `/source-separation`, `/beat-tracking`, `/chord-recognition`,
  `/chord-recognition-extended`, `/strum-recognition`, `/lead-sheet`, and results `/job/{job_id}/{status|xml|gp5|midi|midi_quant|pdf|json|audio}`.
- Inputs and hints:
  - `/transcription`: query `model` (required; enum in spec: `piano`, `guitar`, `bass`, `vocal`, `universal`, `lead`,
    `detect`, `drums`, `multi`, `wind`, `string`, `piano_arrangement`; the docs' model-selection table lists eleven of
    these and not `multi`), `title`, `composer` (max 120 chars each),
    `webhook_url`; form field `outputs` (array; spec enum `mxml`, `midi`, `pdf`, `gp5`, `json`, `midi_quant`).
    No tuning, capo, key, tempo or note-range parameter appears in the spec's `/transcription` parameters or body schema.
  - Docs: "Guitar Pro 5 ... is available only if you choose the guitar or bass model for transcriptions."
    (https://api-docs.klang.io/docs/file-formats/guitar-pro)
  - Model selection page (https://api-docs.klang.io/docs/advanced-usage/transcription-model-selection): `guitar`
    "Optimized for audio consisting mainly of guitar."; `lead` "Will extract the overall melody and chords played in
    the audio."
  - `/chord-recognition` and `/chord-recognition-extended`: query `vocabulary` (required). The docs page lists "the
    following two options", `major-minor` and `full` (the full vocabulary's regex allows maj, min, dim, aug, min6, maj6,
    min7, maj7, minmaj7, 7, dim7, hdim7, sus2, sus4; N = no chord, X = unknown); the spec's enum has a third value,
    `root`, which the docs page does not describe.
  - `/source-separation`: `model` `four-stems` (default: vocals, bass, drums, other) or `six-stems` (adds piano and guitar); `output` `wav` (default) or mp3.
  - `/lead-sheet`: body `file` plus optional `lyrics` (plain text); query `infer_lyrics`.
- Outputs (docs, quoted field shapes):
  - Chords: "The job result is a json array, containing only triplet entries [<start_time_in_seconds>, <end_time_in_seconds>, <chord_name>] with the type [float, float, string]." Example labels `"N"`, `"E:maj"`, `"D#:maj"`.
    (https://api-docs.klang.io/docs/jobs/chord-recognition-requests)
  - Chords extended: an object with `key` (regex `^[A-G](?:#{1}|b{1})?\s+(?:major|minor)$`, example "A minor"), `chords` (same triplets) and `strums`: "[<time_stamp_in_seconds>, <strum_direction>] with the type [float, string]" where direction is "U" or "D".
  - Beat tracking: "a json array, containing tuples in the format [<beat_timestamp_in_seconds>, <downbeat>] with the type [float, float]" where the second value counts the beat in the bar (1.0 to 4.0 for 4/4).
  - Transcription: MusicXML (`xml` result path), Guitar Pro 5, MIDI, quantized MIDI, PDF. "Results will be available for 14 days." (https://api-docs.klang.io/docs/jobs/transcription-requests). The MIDI page (https://api-docs.klang.io/docs/file-formats/midi): MIDI "contains the un-quantized note events detected in your audio"; `midi_quant` is the quantized version. The PDF page (https://api-docs.klang.io/docs/file-formats/pdf) names LilyPond as the renderer of the PDF sheet.
  - Separation audio: WAV "Uncompressed 16-bit PCM audio", stereo, 44.1 kHz, or MP3 128 kbps stereo 44.1 kHz; fetched per stem with `/job/{job_id}/audio?stem_type=<stem>`.
  - Per-note JSON with string and fret: not documented in the docs pages; the spec lists a `json` value in the transcription output enum without describing its fields, and the transcription page's list of output formats ("mxml (MusicXML)", "gp5 (Guitar Pro 5)", "midi", "midi_quant (quantized)", "pdf") and the Basic Job Workflow results table (`json` marked only for chord, extended chord, beat and strum jobs) do not list `json` for transcription (UNVERIFIED what it contains; settled by one paid call).
- Limits and price (https://klang.io/api/ , read 2026-11-10): Basic "$ 0" monthly: "50 requests included", "No additional requests", "Max 15s audio duration", "1 request per minute". Startup "$ 99" monthly: "500 requests included", "$0.20 each other request", "Max 300s audio duration", "2 request per second". Business "$ 499" monthly: "3000 requests included", "$0.17 each other request", "Max 300s audio duration", "5 request per second". Enterprise "Contact Sales": "10,000 requests included", "$0.10 each other request", "Max 600s audio duration", "10 request per second". Access is by application form ("Apply now"). Docs: "Use as little output formats as possible. Multiple formats may inflict additional quota costs for a transcription job." (transcription page) and "The six-stems model inflicts higher quota costs than four-stems model!" (https://api-docs.klang.io/docs/file-formats/audio)
- Terms (General Terms of Use, https://klang.io/terms/ , read 2026-11-10; no "last updated" date was found on the page; section numbers checked by verify-docs). The API itself has separate terms that were not found on a public page:
  - "API access and Bulk Transcription are not included in the subscription plans; they are offered exclusively as separate business services subject to separate terms and require separate registration." (§ 5.2.3)
  - Training on inputs: "We do not use the content uploaded by you to train our AI models or for any other purposes beyond the provision of the Klangio Services in accordance with these Terms of Use. The uploaded content will not be passed on to third parties. You may request that your uploaded content be deleted after we have provided the Klangio Services." (§ 8.1)
  - Links: "If you submit a link to an external audio source (e.g., a YouTube, Instagram or TikTok video), the audio is retrieved via the respective platform interface (e.g., the YouTube Data API), processed temporarily for the creation of the transcription and deleted upon completion; we do not maintain a permanent copy or cache of such content." (§ 8.1)
  - Commercial use (consumer services): "The use of Klangio Services and Apps is intended exclusively for private, non-commercial purposes, subject to the exception described below. Commercial use is permitted exclusively for original musical compositions created by the user, provided that the output is based on full transcriptions rather than a demo transcription (see § 5.2.1)." (§ 12.4)
  - Outputs and training: "Transcriptions may only be used by you in accordance with applicable laws, in particular copyright laws. They must not be used to train music transcription AI systems or similar technologies." (§ 12.5)
  - Rights in uploads: "You warrant that you are the owner of (or are otherwise entitled to use or exercise) all necessary rights to any content uploaded by you ... This may include, without limitation, all necessary rights to modify files and YouTube videos you submit." (§ 8.3)
- Training data of Klangio's models: not stated on the pages read.

## Music.AI (Moises' API platform)

- What it is: Music AI's developer platform (its terms grant feedback rights to "Moises", and the upload example
  URL in the API reference is on a `storage.googleapis.com/moises/` bucket); REST API plus SDKs
  (Node.js, Python), a CLI and a desktop client (docs sitemap https://music.ai/sitemap.xml lists
  `/docs/sdk/nodejs/`, `/docs/sdk/python/`, `/docs/clients/cli/`, `/docs/clients/desktop/`). An older developer
  site, https://developer-legacy.moises.ai , appeared in search results (not read). Read 2026-11-10.
- How a program calls it (https://music.ai/docs/api/reference/): base `https://api.music.ai/v1`; "The API key
  should be included in the Authorization header of each request." Steps: `GET /upload` returns
  `uploadUrl` and `downloadUrl` ("URL to upload the file to. This URL is temporary."); `POST /job` with JSON
  `{"name", "workflow" (slug), "params" (must match the workflow's input schema, e.g. "inputUrl"), "metadata"}`
  returns `{"id"}`; `GET /job/:id` returns `status` (`QUEUED`, `STARTED`, `SUCCEEDED`, `FAILED`) and `result`
  ("Processing results (URLs to output files) when status is SUCCEEDED"); `GET /job/:id/status`; `DELETE /job/:id`;
  `GET /workflow` lists workflows. A job runs a workflow, which the customer composes from modules
  (https://music.ai/modules/). The module pages name the input `inputFileUrl`, while the API reference's job examples
  pass `"params": {"inputUrl": ...}`; the reference says params "must match the workflow's input schema".
  Python SDK on PyPI: `musicai-sdk` 1.0.4 (uploaded 2026-07-17, license MIT; https://pypi.org/pypi/musicai-sdk/json,
  read by verify-docs).
- Modules relevant here, with their documented input and outputs (module pages, read 2026-11-10):
  - Chords (https://music.ai/modules/transcription/chords/): input `inputFileUrl`; outputs `key` ("Detected root key of the audio (e.g., C Major, A minor).") and `chordMap` ("Timeline of Chord annotations extracted from the input audio file. Each annotation specifies the chord's start time, end time, and multiple Chord classes."). The page describes classes "Complex Jazz, Simple Jazz, Complex Pop, and Simple Pop" and "bass detection".
  - Beats (https://music.ai/modules/transcription/beats/): outputs `bpm` (number) and `beatMap` ("JSON containing beat annotations extracted from the input audio. Each annotation specifies the beat's start time and beat number.").
  - Guitar Stems (https://music.ai/modules/stem-separation/guitar-stems/): outputs `acoustic_guitar`, `electric_guitar`, `other`.
  - Guitar Parts (https://music.ai/modules/stem-separation/guitar-parts/): outputs `rhythm_guitars`, `solo_guitars`, `other`.
  - Also listed in the sitemap: Sections, Metronome (generator), Instruments detection, Vocal pitch tracker, Musical stems (per-instrument incl. Guitars), Pitch shift, Tempo (effects).
  - File formats page (https://music.ai/docs/api/file-formats/): audio "Include all audio formats, such as WAV, MP3, OGG, FLAC, etc."; video "Include all video formats, such as AVI, MP4, MKV, etc."; chord JSON shape shown as `{"start": 0, "end": 10, "chord": "C"}`, beats as `{"start": 0, "end": 10, "bpm": 120}`. The Beats module page describes each beat annotation as having "the beat's start time and beat number"; the two pages show different beat shapes and no live output was seen (no Music.AI call was made).
  - No note-level transcription module (notes, MIDI, tab) appears in the module sitemap read 2026-11-10. No module page read lists a tuning, capo or key hint among its inputs (inputs shown: the audio URL only).
- Price (https://music.ai/pricing/, read 2026-11-10): plans "Pay as you go $0" ("48h temporary storage", "2 concurrent processing jobs"), "Professional $25 USD Billed monthly" ("10 concurrent processing jobs", "$25 credit included every month (limited offer)", "100GB permanent storage", "5% discount on all modules"), "Business / Enterprise" ("Contact us"). A third-party README (ChordMini, https://raw.githubusercontent.com/ptnghia-j/ChordMiniApp/main/README.md, read by verify-docs 2026-11-10, undated) says "Music.ai API (deprecated - MUSIC.ai no longer provide individual API key, only business plan)"; the Music.AI pricing page read the same day lists the pay-as-you-go plan. Whether an individual can still get a key: UNVERIFIED (a sign-up attempt would settle it). Pay-as-you-go module prices: "Transcription - Chords $0.04 / min", "Transcription - Beats $0.03 / min", "Transcription - Sections $0.04 / min", "Stem separation - Guitar stems (Acoustic guitar, Electric guitar) $0.1 / min", "Stem separation - Guitar parts (Rhythm guitars, Solo guitars) $0.1 / min", "Stem separation - Musical stems (Guitars) $0.07 / min", "Stem separation - Musical stems (Bass) $0.07 / min", "Generators - Metronome $0.002 / min", "Classification - Instruments detection $0.02 / min", "Classification - Music metadata (By Cyanite) $0.15 / min". FAQ: "Pay-as-you-go and Professional members must purchase credits up front and cannot have a negative credit balance."
- Terms (https://music.ai/terms/, "Last updated: May 02, 2025", read 2026-11-10):
  - Licence scope: "a non-exclusive, non-transferable, non-sublicensable, revocable, limited license to use the Service ... on a computer or device that you own or control solely for your own internal business or individual purpose." (§ (d) Limited License)
  - Restrictions: "you shall not ... (ii) use any robot, spider, site search/retrieval application, or other manual or automatic device to retrieve, index, “scrape,” “data mine,” or in any way reproduce or circumvent the navigational structure or presentation of our website, the Service or the Music.AI Materials, (iii) use any Output to train artificial intelligence or machine learning models either as sole input or as part of a wider training dataset unless otherwise explicitly authorized by us in writing, or (iv) use the Service, the Music.AI Materials, Output, or any portion thereof as the basis for developing a competitive solution (or contract with a third-party to do so), or allow third-parties to use or exploit the Service separate from your product(s) or services without Music.AI’s express written consent." (§ (e))
  - Outputs: "Subject to these Terms, You may use the Service to generate results and outputs (“Output”), for example data, text, audio, video, and artificial intelligence models. These Terms will apply to your use of the Service as well as your use of any Output you create, generate, or otherwise receive from use of the Service." (§ (b) Output of the Service)
  - Free use: "If you are accessing or making use of the Service on a no-fee, trial, or evaluation basis (the “Evaluation Access”), you may use the Service and any Output solely for internal testing and evaluation to determine whether to purchase the Service from us." (§ (c))
  - Training on inputs: "THIS LICENSE IS GRANTED SOLELY FOR THE PURPOSE OF DELIVERING THE SERVICE TO YOU AND DOES NOT INCLUDE ANY RIGHTS FOR US TO USE YOUR CUSTOMER CONTENT TO TRAIN OR FINE-TUNE ARTIFICIAL INTELLIGENCE OR MACHINE LEARNING MODELS UNLESS YOU HAVE EXPRESSLY AUTHORIZED SUCH USE IN WRITING OR VIA AN ELECTRONIC OPT-IN MECHANISM." Clause (a) "Customer Content" of the same terms also says: "We may use the Customer Content to provide the Service to you, to improve or develop our products and services, and, subject to Section 7(f) below (Personal Data Processing), as otherwise described in our Privacy Policy".
  - Retention: "we are under no obligation to store, maintain, or provide you with copies of any Customer Content you provide or any Outputs you generate using the Service, and we reserve the right to delete any such Customer Content and Outputs at any time without notice to you."
- Training data, as stated by the vendor (FAQ https://music.ai/docs/faq/): "Music AI only trains on licensed materials."

## LALAL.AI API

- What it is: stem separation and voice processing service by OmniSale GmbH. Public API v1, OpenAPI spec
  https://www.lalal.ai/api/v1/openapi.json (`info.version` "1.1.0", title "LALAL.AI API"); human docs
  https://www.lalal.ai/api/v1/docs/ (a JavaScript page; the spec was read instead); official Python examples
  named in https://www.lalal.ai/llms.txt as https://github.com/OmniSaleGmbH/lalalai (not read). llms.txt
  ("Last updated: 2026-07-14") says "there is no official SDK - REST + OpenAPI only". Read 2026-11-10.
- How a program calls it (spec): header auth `X-License-Key` (securityScheme `ApiKeyHeaderAuth`). Flow:
  `POST /api/v1/upload/` with the raw bytes as `application/octet-stream` and header
  `Content-Disposition: attachment; filename=<name>` ("Uploads a file, up to 10 GB."), response `id`, `name`,
  `size`, `duration` (seconds, integer), `expires` (Unix time; "The file is deleted at the `expires` time from the
  response."); then `POST /api/v1/split/stem_separator/` (one stem) or `POST /api/v1/split/multistem/` (several)
  with JSON `{"source_id", "presets": {...}}`; then `POST /api/v1/check/` with task ids; then download the result
  URLs; `POST /api/v1/delete/` removes source and results. Batch variants exist (`/api/v1/split/batch/...`).
- Request fields (spec, `StemSeparatorSplitterPresetsV1`): `stem` enum `vocals`, `drum`, `piano`, `bass`,
  `guitar`, `electric_guitar`, `acoustic_guitar`, `synthesizer`, `strings`, `wind` ("'guitar' extracts all guitars
  into one track, 'electric_guitar' and 'acoustic_guitar' extract only one kind of guitar. 'guitar' is available
  only with andromeda."); `splitter` (`andromeda`, `perseus`, `orion`, `phoenix`, `lyra`, `lynx`, or `auto`);
  `encoder_format` (`mp3`, `wav`, `flac`, `aac`, `ogg`; "If None - convert to source file format."); `extraction_level`;
  `dereverb_enabled`. Multistem `stem_list`: any subset of `vocals`, `drum`, `piano`, `bass`, `electric_guitar`,
  `acoustic_guitar` (max 6). No musical hints (tuning, key, tempo) exist; the task is audio in, audio out.
- Response (spec): a done task carries `tracks`, each `{type: "stem"|"back", label, url, name, size, waveform,
  playlist_file}`, plus `duration`. `/check/`: "Pass all your `task_ids` in one request, up to 200: the limit is
  30 requests per minute." and "A task stays here for 24 hours after it finishes."
- Price (https://www.lalal.ai/pricing/, read 2026-11-10; llms.txt says prices are "shown in your regional
  currency", and the page rendered USD for this fetch): Lite "$7.5 /mo$90 billed annually", Pro "$15/mo$180 billed annually";
  "Pro is the better choice if you need more Fast Queue minutes, access to the VST plugin, local processing in the
  desktop app, or API access."; top-ups "Master with 750 minutes for $50, Premium with 3000 minutes for $190, and
  Enterprise with 5000 minutes for $300"; minutes are "total file length × number of stem separation types".
  llms.txt: "API access is available with the Pro plan or any minute top-up pack - no subscription required" and
  "API requests consume Fast-queue minutes."
- Terms (https://www.lalal.ai/terms-and-conditions/ , "Last updated: July 30, 2026", read 2026-11-10; the URL first
  cited here, https://www.lalal.ai/terms-of-service/, redirected to it on 2026-11-10 and serves the same text):
  - "You agree not to reproduce, duplicate, copy, sell, trade, resell or exploit for any commercial purposes, any portion of the Service, use of the Service, or access to the Service unless you otherwise have an agreement with us which specifically grants you such right(s)."
  - "You are solely responsible for the usage and distribution of uploaded audio files and “end-result” audio files. ... The Service doesn’t store or distribute any copyrighted content."
- Privacy policy (https://www.lalal.ai/privacy-policy/, read 2026-11-10): "the OmniSale GMBH does not assume the rights to any uploaded audio and video data, does not use user files for artificial intelligence training or other content, does not share copyrighted materials and other uploaded media files with third parties".
- Training data of the separation models: not stated on the pages read.

## AudioShake API (Tasks API)

- What it is: stem separation, lyric transcription and content analysis by AudioShake, Inc. (Delaware). Docs
  https://developer.audioshake.ai (Mintlify; index at https://developer.audioshake.ai/llms.txt; OpenAPI at
  `/api-reference/openapi.json`, not read). A Python client and CLI: "`pip install audioshake` gives you an
  official client and CLI that handle upload, polling, and download in one call" (quickstart). There is also an
  on-device "Local Inference SDK" (listed in llms.txt; not read). The older Jobs API has a migration page
  ("Migrating from Jobs"). Read 2026-11-10.
- How a program calls it (https://developer.audioshake.ai/quickstart.md): header `x-api-key`;
  `POST https://api.audioshake.ai/tasks` with JSON `{"url": "<media URL>" | "assetId": "<id>", "targets": [{"model": "guitar", "formats": ["wav"]}, ...]}`;
  `GET https://api.audioshake.ai/tasks/<task-id>`; "Each completed target includes an `output` array with download
  links." and "Output download links expire after one hour." Local files go through Upload File first
  (returns `assetId`); FAQ: "Uploaded Assets expire after 72 hours." Webhooks are documented.
- `GET https://api.audioshake.ai/models` is public ("Unauthenticated requests return default app config values")
  and returned JSON on 2026-11-10 with per-model `id`, `category`, `creditsPerMinute`, input formats and
  `outputFormats` (raw copy kept outside the repo).
- Models relevant here (https://developer.audioshake.ai/models.md): `guitar` "All guitar-family parts together
  (acoustic + electric)." 1.0 credits/min; `guitar_electric` "Electric guitar only (clean or distorted)." 1.0;
  `guitar_acoustic` "Acoustic/plucked guitar-family sources (acoustic guitar, banjo, lute)." 1.0; `bass` 1.0;
  `other-x-guitar` "Everything except vocals, drums, bass, and guitar." 1.0; `residual` "Everything not covered by
  the task's other targets." 1.0. No note, chord, beat or tab output is listed; outputs are audio (or JSON/SRT/TXT
  for the lyric and music-detection models).
- Formats (https://developer.audioshake.ai/api-reference/formats.md): input WAV, AIFF, FLAC, MP3, AAC/M4A
  ("Supports up to 192kHz sample rate"), video MP4/MOV ("Only the audio stream is processed — video content is
  ignored."); output `wav`, `mp3`, `flac`, `aiff`, `mp4`. "Multi-channel or surround formats (e.g. 5.1) are not supported".
- Limits: "The AudioShake API allows **60 requests per second**." (rate-limits page). "Maximum input length for
  `transcription` and `alignment` is 45 minutes." (models page; no separation length limit was stated on the pages read).
- Price: "Credits are charged **per minute of source audio, per target model**. Duration is always rounded up to
  the nearest minute." (billing page). Quickstart: "You'll get 10 free credits to start building immediately."
  The dollar price of a credit is not stated on the docs pages read, and https://www.audioshake.ai/pricing
  returned HTTP 404 on 2026-11-10 (UNVERIFIED: the dashboard purchase page would settle it).
- Terms (Master Service Agreement, https://www.audioshake.ai/terms , "Effective October 1, 2026", read 2026-11-10):
  - Use: "Customer and End Users shall use the Audioshake Platform solely for Customer’s internal business purposes as contemplated by this Agreement and shall not: ... (vi) lease, distribute, license, sell or otherwise commercially exploit the Audioshake Platform or make the Audioshake Platform available to any third party; (vii) use the Audioshake Platform for time sharing or service bureau purposes or otherwise for the benefit of a third party" (§ 3.1)
  - Ownership: "As between Customer and Audioshake, Customer shall retain all rights, title and interests in and to all Content." where "“Content” means any content uploaded by Customer or an End User to the Audioshake Platform, and any outputs derived from such content." (§ 8.1, § 1.7)
  - Use of content: "You hereby grant Audioshake the right to (i) reproduce and use such information, Content and data to improve and enhance the Audioshake Platform and for other development, diagnostic and corrective purposes in connection with the Audioshake Platform and other Audioshake offerings ... For the purpose of clarity, Audioshake will not sell your Content, and will not use your Content to train, or provide your Content to any third party to train, any AI model or system designed to generate new, original musical compositions or sound recordings." (§ 5.3)
- Training data of the separation models: not stated on the pages read.

## Fadr API

- What it is: the API of Fadr (web stem splitter; footer "Made with 💛 by Pebble", site version "v6.2"). Docs:
  https://fadr.com/docs/api (dated "Aug 19, 2023"), https://fadr.com/docs/api-endpoints,
  https://fadr.com/docs/api-stems-tutorial, https://fadr.com/docs/api-billing ("Aug 22, 2023"). API terms
  https://fadr.com/api-terms (dated "Sep 5, 2023"). The docs pages carry 2023 dates. On 2026-11-10 at 21:18 UTC
  (verify-docs, no key) `GET https://api.fadr.com/` answered HTTP 200 `{"title":"Welcome to the Fadr API!"}` and
  `GET https://api.fadr.com/tasks/000000000000000000000000` answered HTTP 401 `{"msg":"Token invalid or expired."}`:
  the host answers; whether the documented endpoints behave as documented is UNVERIFIED (one call with a Plus key
  would settle it). Read 2026-11-10.
- How a program calls it: base `https://api.fadr.com`; "Attach an API key to all of your requests as the
  Authorization header in the following format: `Authorization: "Bearer [API Key]"`" (api-authentication page).
  Flow (endpoints page): `POST /assets/upload2` returns a presigned S3 upload URL; `PUT` the file to it with its
  MIME type; `POST /assets` creates the asset; `POST /assets/analyze/stem` creates a stem task with `stemType`;
  poll `GET /tasks/:_id` (or `POST /tasks/query` with `_ids`, as in the tutorial) "at 5 second intervals"; then
  `GET /assets/download/:_id/:type` returns a presigned download URL for each id in the asset's `stems` or `midi` arrays.
- What comes out (endpoints page): main `stemType` "separates a complete song into four primary stems, vocals,
  bass, drums, and melodies" plus an "instrumental" sum, with "Extraction of a unique MIDI file for the vocal,
  drums, bass, and melody stems.", "Detection of the song's chord progression, represented in MIDI and CSV format",
  and "Detection of the song's Key and Tempo, which will be stored in all of the related asset's metaData fields."
  (example metaData `"tempo": 140`, `"key": "B:min"`). The overview page says "midi of each stem except for drums,
  the chord progression as txt and midi" (the two pages differ on drums MIDI and on CSV vs txt; both quoted).
  `"melodic-stem"` "separates a melodic stem into six new stems: piano, electric guitar, acoustic guitar,
  strings, wind, and other melodies"; `"drum-stem"` gives kick, snare and other drums; `"vocal-stem"` lead and
  background vocals. Tutorial: "Stems usually take around 10-20 seconds, and the remainder usually takes another
  10-20 seconds." No tuning, capo or key hint parameter is documented.
- Price: "Usage of the Fadr API requires a Fadr Plus subscription, which costs $10/mo or $100/yr. Your
  subscription pays for your first $10 of API usage every month." (overview). Billing page: "Create Stem Task
  US$0.05 per minute of audio". The Fadr Plus page (https://fadr.com/plus, read 2026-11-10) shows a comparison
  table row "☁️ API Price (per 100 minutes per stem)" with "$1" in the Fadr column. The two Fadr pages state the
  price in different units; both are quoted as found.
- Terms (https://fadr.com/api-terms, read 2026-11-10):
  - Inputs: "Fadr does not acquire any ownership of any intellectual property rights in the content that you submit to our API through your API Client, except as expressly provided in the Terms. For the sole purpose of enabling Fadr to provide, secure, and improve the API (and the related service(s)) and only in accordance with the applicable Fadr privacy policies, you give Fadr a perpetual, irrevocable, worldwide, sublicensable, royalty-free, and non-exclusive license to Use content submitted, posted, or displayed to or from the API through your API Client. "Use" means use, host, store, modify, communicate, and publish."
  - API ownership: "Fadr does not acquire ownership in your API Clients, and by using our API, you do not acquire ownership of any rights in our API or the content that is accessed through our API."
  - Returned content: "Unless expressly permitted by the content owner or by applicable law, you will not, and will not permit your end users or others acting on your behalf to, do the following with content returned from the API: 1. Scrape, build databases, or otherwise create permanent copies of such content, or keep cached copies longer than permitted by the cache header; 2. Copy, translate, modify, create a derivative work of, sell, lease, lend, convey, distribute, publicly display, or sublicense to any third party; ..."
  - Training on inputs: no clause naming model training was found on https://fadr.com/api-terms.

## MVSEP API

- What it is: a web service that runs many music source separation models (Demucs, MDX23C, BS-RoFormer,
  MelBand-RoFormer, SCNet, MVSep's own models) with an HTTP API. Operator per the terms: "Sole Proprietor (YTT)
  "Elmurodov Olimjon Ermat o'g'li"". API docs https://mvsep.com/full_api ; OpenAPI
  https://mvsep.com/misc/mvsep-openapi-spec.json (`info.version` "1.1.1"); live algorithm list (public, no key)
  https://mvsep.com/api/app/algorithms (126 entries on 2026-11-10). Read 2026-11-10.
- How a program calls it (full_api): `POST https://mvsep.com/api/separation/create` with form fields
  `api_token`, `audiofile` (binary) or `url` (+ `remote_type`: direct, mega, drive, dropbox), `sep_type`
  ("defaults to 20"), `add_opt1..3` (model options), `output_format` (0 mp3 320 kbps default; 1 wav 16-bit;
  2 flac 16-bit; 3 m4a; 4 wav 32-bit; 5 flac 24-bit), `webhook_url`, `is_demo`, or `preset_id`. Then
  `GET https://mvsep.com/api/separation/get?hash=<hash>`; `status` one of `not_found`, `waiting`, `processing`,
  `done`, `failed`, `distributing`, `merging`; when done `data` has `algorithm`, `output_format`, `input_file`,
  `files` ("the output audios download details"). Regions: "All regions share one account database, so the same
  account, API key and job hashes work everywhere" (de, de2, sg; hk deprecated). "Premium users can request
  unlimited concurrent jobs, while non-Premium users can only request 1 concurrent job." (The search snippet
  that said "up to 10 concurrent jobs" did not match the page read today.) Official examples repo named in
  search results: ZFTurbo/MVSep-API-Examples (not read).
- Guitar-related algorithms in the live list (render id, name): 31 "MVSep Guitar (guitar, other)", 66 "MVSep
  Acoustic Guitar (acoustic-guitar, other)", 81 "MVSep Electric Guitar (electric-guitar, other)", 101 "MVSep
  Lead/Rhythm Guitar (lead-guitar, rhythm-guitar)", 124 "MVSep Pedal Steel Guitar", 63 "BS Roformer SW (vocals,
  bass, drums, guitar, piano, other)", 30 "Ensemble All-In (vocals, bass, drums, piano, guitar, lead/back vocals,
  other)", 20 "Demucs4 HT (vocals, drums, bass, other)", 41 "MVSep Bass (bass, other)".
- Author-reported numbers (MVSEP's own option labels on https://mvsep.com/full_api for sep_type 31, add_opt1):
  "0 - mdx23c (2023.08, SDR: 4.78)", "2 - mdx23c (2024.06, SDR: 6.34)", "3 - MelRoformer (2024.06, SDR: 7.02)",
  "5 - BSRoformer (viperx, SDR: 7.16)", "6 - Ensemble (BS + Mel, SDR: 7.51)", "7 - BS Roformer SW (SDR: 9.05)
  (default)"; for 101: "0 - Two-stage model (SDR: 9.21) (default)", "1 - One-stage model (SDR: 9.02)". The full_api
  page does not name the test set. The English description of render id 31 in https://mvsep.com/api/app/algorithms
  (read by verify-docs 2026-11-10) says "The model was compared with the Demucs4HT model (6 stems) on a guitar
  validation set." and gives a table in which Demucs4HT (6 stems) has guitar SDR 5.22 and BS Roformer SW 9.05; the
  Russian description of the same entry adds "30 треков" (30 tracks). The validation set's tracks and source are not
  named on the pages read.
- Inputs and hints: audio only; no musical hints. Output: audio files only (no notes, chords or tab).
- Limits and price (https://mvsep.com/plans, read 2026-11-10): Unregistered and Registered free: "Max File Length
  10 min", "Max File Size 100 MB", "Daily Separations 50", "Concurrent Jobs 1"; "API Access" "—" (unregistered),
  "Limited" (registered), "Full" (Premium). Premium: "Max File Length 100 min", "Max File Size 1000 MB". "Standard
  models use 1 credit per minute of audio." Credit packs: "$3 60 credits $0.05 per minute", "$5 200 credits",
  "$10 600 credits", "$30 2,000 credits", "$50 4,000 credits", "$100 8,500 credits $0.0118 per minute". The
  algorithm list carries a `price_coefficient` per model (e.g. 6 for "Ensemble All-In", 1 for "MVSep Guitar").
- Terms (https://mvsep.com/terms, "Effective Date: October 19, 2026", read 2026-11-10):
  - "The Operator does not claim ownership over uploaded content or generated outputs. You retain ownership of uploaded content and generated outputs, subject to applicable third-party rights."
  - "Processed outputs generated through the Service may be used commercially by You, provided You possess the necessary rights to the original submitted content. This applies to every model on the Service unless the Operator explicitly states otherwise for a specific model."
  - "Some models are provided under licenses that permit non-commercial use only (for example, CC BY-NC 4.0). Each such model is marked with a notice naming its license on the model's page, in the model selector and on its results. For a model so marked: (a) its outputs may be used for non-commercial purposes only; (b) it is provided free of charge, and no Credits or Premium benefits apply to it; and (c) it is available only through the website, not through the API, the mobile applications, batch pro[cessing] ..." (text continues on the page). In the live algorithm list read 2026-11-10, 0 of 126 entries had a non-null `nc_license` field.
  - No clause naming retention periods or model training on uploads was found on /terms (privacy page not read).

## Google Gemini API (audio and video input)

- What it is: Google's multimodal LLM API. The audio and video pages read describe audio and video in and text
  out (the audio page points to "Structured output" to "Get transcription results in JSON format"); neither page
  documents a MIDI, MusicXML or tab output, so notes, chords or tab would come back as text the prompt asks for. Docs read 2026-11-10:
  https://ai.google.dev/gemini-api/docs/audio , https://ai.google.dev/gemini-api/docs/video-understanding ,
  https://ai.google.dev/gemini-api/docs/pricing , terms https://ai.google.dev/gemini-api/terms .
- How a program calls it: the pages carry code tabs for Python, JavaScript, Go, Java and REST; files over the
  inline size go through the Files API ("Use the [Files API](/docs/files) for files larger than 20 MB." on the
  audio page; the audio page also states "Maximum request size is 20 MB total (including prompts and all files)"
  for inline data). The audio page links an "Interactions API reference" for MIME types; the video page's agentic
  examples use `interaction.steps`.
- Audio input (audio page, "Technical details about audio"): formats `audio/wav`, `audio/mp3`, `audio/aiff`,
  `audio/aac`, `audio/ogg`, `audio/flac`, `audio/mpeg`, `audio/m4a`, `audio/l16`, `audio/opus`, `audio/alaw`,
  `audio/mulaw`, `audio/webm`. "**Tokens**: 32 tokens per second of audio (1 minute = 1,920 tokens)";
  "**Max length**: 9.5 hours of audio per prompt"; "**Resolution**: Downsampled to 16 Kbps"; "**Channels**:
  Multi-channel audio combined to single channel"; "**Non-speech**: Gemini understands non-speech sounds
  (birdsong, sirens, etc.)".
- Video input (video page): input methods "File API ... 20GB (paid) / 2GB (free)", "Cloud Storage Registration
  ... 2GB (per file ...)", "Inline Data ... < 100MB", "YouTube URLs ... Public YouTube videos." Formats
  `video/mp4`, `video/mpeg`, `video/mov`, `video/avi`, `video/x-flv`, `video/mpg`, `video/webm`, `video/wmv`,
  `video/3gpp`. Sampling: "the model samples the video at a rate of **1 frame per second** (FPS). This default
  sampling rate works well for most content, but note that it may miss details in videos with rapid motion or
  quick scene changes." A custom rate is set with an `fps` value in the `processing` object (example `"fps": 0.5`);
  "These customization options are only supported when processing the video in `"static"` mode." No maximum fps
  value was stated on the page. Static mode: "Audio is processed at 1Kbps (single channel). Timestamps are added
  every second." Token calculation (static mode): "If `media_resolution` is set to low, frames are tokenized at
  66 tokens per frame. Otherwise, frames are tokenized at 258 tokens per frame.", "Audio: 32 tokens per second.",
  "Total: Approximately 100 tokens per second of video at default (low) media resolution, or approximately 300
  tokens per second of video at high media resolution." Length: "Models with a 1M context window can process
  videos up to 3 hours long by default (at low media resolution), or up to 1 hour long at high media resolution."
  An opt-in "agentic" mode (`"processing": "agentic"`) is listed for "Gemini 4 Carbon, Gemini 4 Argon, 3.8 Flash,
  3.6 Flash, 3.5 Flash Lite".
- YouTube links (video page): "Preview: The YouTube URL feature is in preview and is available at no charge.
  Pricing and rate limits are likely to change."; "For the free tier, you can't upload more than 8 hours of
  YouTube video per day."; "You can only upload public videos (not private or unlisted videos)."
- Hints for a re-run: only the text prompt (and system instructions); there are no tuning, capo or tempo
  parameters in the API.
- Price (pricing page, read 2026-11-10; "Paid Tier, per 1M tokens in USD"): Gemini 3.5 Flash-Lite input "$0.30
  (text / image / video / audio)"; Gemini 3.8 Flash input "$0.75 through December 31, 2026. $1.50 starting January
  1, 2027.", output "$3.75 through December 31, 2026. $7.50 starting January 1, 2027."; free tier "Free of
  charge" on both. Arithmetic from those quoted numbers (not a measured bill): one minute of audio = 1,920 tokens
  = USD 0.000576 at $0.30/1M; one minute of video at ~100 tokens/s = ~6,000 tokens = ~USD 0.0018 at $0.30/1M,
  before output tokens.
- Terms (Gemini API Additional Terms of Service, https://ai.google.dev/gemini-api/terms , "Effective March 23, 2026", read 2026-11-10):
  - "You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom. You may not use the Services to develop models that compete with the Services (e.g., Gemini API or Google AI Studio)."
  - Outputs: "Some of our Services allow you to generate original content. Google won't claim ownership over that content. You acknowledge that Google may generate the same or similar content for others and that we reserve all rights to do so."
  - Free use: "When you use Unpaid Services, including, for example, Google AI Studio and the unpaid quota on Gemini API, Google uses the content you submit to the Services and any generated responses to provide, improve, and develop Google products and services and machine learning technologies ... To help with quality and improve our products, human reviewers may read, annotate, and process your API input and output."
  - Paid use: "When you use Paid Services, including, for example, the paid quota of the Gemini API, Google doesn't use your prompts (including associated system instructions, cached content, and files such as images, videos, or documents) or responses to improve our products ... For Paid Services, Google logs prompts and responses for a limited period of time, solely for detecting and preventing violations of the Prohibited Use Policy".
  - "Your access to Gemini API is a "Paid Service" only when accessing the API through a Cloud Project associated with an active billing account."

## YouTube terms (taking audio from a video link)

Quotes only; no reading of what they mean for this project. Read 2026-11-10.

- YouTube Terms of Service (https://www.youtube.com/t/terms?hl=en&gl=US , "Dated: December 15, 2023", "Effective as
  of December 15, 2023"), "Permissions and Restrictions":
  - "You may access and use the Service as made available to you, as long as you comply with this Agreement and applicable law. You may view or listen to Content for your personal, non-commercial use. You may also show YouTube videos through the embeddable YouTube player."
  - "The following restrictions apply to your use of the Service. You are not allowed to: 1. access, reproduce, download, distribute, transmit, broadcast, display, sell, license, alter, modify or otherwise use any part of the Service or any Content except: (a) as expressly authorized by the Service; or (b) with prior written permission from YouTube and, if applicable, the respective rights holders;"
  - "2. circumvent, disable, fraudulently engage with, or otherwise interfere with any part of the Service (or attempt to do any of these things), including security-related features or features that (a) prevent or restrict the copying or other use of Content or (b) limit the use of the Service or Content;"
  - "3. access the Service using any automated means (such as robots, botnets or scrapers) except (a) in the case of public search engines, in accordance with YouTube’s robots.txt file; or (b) with YouTube’s prior written permission;"
  - "9. use the Service to view or listen to Content other than for personal, non-commercial use (for example, you may not publicly screen videos or stream music from the Service);"
- YouTube API Services Terms of Service (https://developers.google.com/youtube/terms/api-services-terms-of-service ,
  page "Last updated 2026-11-06 UTC"): "16.3 No Licenses or Rights to Patents or Content. Without limiting the
  generality of the foregoing, no rights or licenses are granted under any patents owned or controlled by YouTube or
  its Affiliates, and no rights or licenses are granted to reproduce or distribute audiovisual content or make
  audiovisual content available in any manner other than through the use of the YouTube API Service".
- YouTube API Services Developer Policies (https://developers.google.com/youtube/terms/developer-policies , page
  "Last updated 2026-11-06 UTC"):
  - Section "1. Audiovisual Content": "You and your API Clients must not, and must not encourage, enable, or require others to: a. download, import, backup, cache, or store copies of YouTube audiovisual content without YouTube's prior written approval, b. make content available for offline playback, or c. use any aspect of the YouTube API Services to facilitate or promote copyright infringement or the exploitation of copyright-infringing materials."
  - "I. Additional Prohibitions": "7. separate, isolate, or modify the audio or video components of any YouTube audiovisual content made available as part of, or in connection with, YouTube API Services. For example, you must not apply alternate audio tracks to videos;" and "8. promote separately the audio or video components of any YouTube audiovisual content made available as part of, or in connection with, the YouTube API Services;"
- Gemini API (https://ai.google.dev/gemini-api/docs/video-understanding , read 2026-11-10) accepts public YouTube
  URLs as video input; see the Gemini section for the quoted limits.

## yt-dlp

- What it is: "a feature-rich command-line audio/video downloader with support for thousands of sites"; "a fork of
  youtube-dl based on the now inactive youtube-dlc" (README, https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/README.md).
  Latest PyPI release 2026.10.26, uploaded 2026-10-26T22:25:24 (https://pypi.org/pypi/yt-dlp/json). Read 2026-11-10.
- How a program calls it: CLI, e.g. `yt-dlp -x --audio-format wav <URL>`; README: "-x, --extract-audio Convert video
  files to audio-only files (requires ffmpeg and ffprobe)". Also usable from Python (the README's embedding examples use `import yt_dlp`). README:
  "While all the other dependencies are optional, `ffmpeg`, `ffprobe`, `yt-dlp-ejs` and a supported JavaScript
  runtime/engine are highly recommended"; "yt-dlp-ejs - Required for full YouTube support."; "A JavaScript
  runtime/engine like deno (recommended), node.js, bun, or QuickJS is also required to run yt-dlp-ejs." RUNNABLE
  on a CPU box (no GPU involved); whether YouTube downloads work from this box was not tested by this agent.
- License (LICENSE, https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/LICENSE , read 2026-11-10): SPDX
  Unlicense. "This is free and unencumbered software released into the public domain. Anyone is free to copy,
  modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled
  binary, for any purpose, commercial or non-commercial, and by any means."
- README "Licensing": "While yt-dlp is licensed under the Unlicense, many of the release files contain code from
  other projects with different licenses. Most notably, the PyInstaller-bundled executables include GPLv3+ licensed
  code, and as such the combined work is licensed under GPLv3+." and "The git repository, the PyPI source
  distribution and the PyPI built distribution (wheel) only contain code licensed under the Unlicense." ffmpeg:
  "License depends on the build".
- The yt-dlp license covers the program's code; the YouTube terms above are YouTube's terms for its own service.
  Both are quoted here as found.

## Songsterr

- What it is (terms, https://www.songsterr.com/a/wa/terms , read 2026-11-10): "Songsterr is an archive of guitar,
  bass and drum tabs with more than 80,000 songs." Operated by "Guitar Tabs LLC" / "Guitartabs LLC" (both
  spellings appear). Paid plan: "Our paid plan (Songsterr Plus) unlocks advanced features, including Pause-Free
  Sync with Original Audio, Playback Speed, Print, AI Transcription of Full Tabs, Download (Guitar Pro, MIDI, MP3
  and WAV), Solo & Mute, Loop, Pitch Shift, Voice Control, and an ad-free experience."
- Developer API: none documented. https://www.songsterr.com/a/wa/api returned "Page not found!" on 2026-11-10.
  robots.txt (https://www.songsterr.com/robots.txt) has `Disallow: /api/`, and `Content-Signal: search=yes,
  ai-input=yes, ai-train=no`, `Content-Usage: train-ai=n`. Third-party directories and wrappers describe
  undocumented JSON endpoints (`/a/ra/songs.json?pattern=`, `/api/songs?pattern=`); those pages were seen only as
  search results and the endpoints were not called by this agent (UNVERIFIED).
- Automated access: "You may not use, and may not instruct, enable, or permit any automated tool, script, browser
  extension, or AI agent to use, any means to circumvent, disable, or bypass paid (Plus) features, or to modify,
  automate, or interfere with the Service or its tab player to obtain functionality equivalent to a paid feature
  without an active subscription. Independent tools that do not modify, automate, or interfere with the Service or
  its tab player are not restricted by this section." (terms)
- https://www.songsterr.com/ai.txt ("Last updated: 2026-11-09"): "AI model training: NOT permitted. Do not use
  Songsterr content (tabs, notation, song metadata, lyrics, audio, API responses) to train, fine-tune or evaluate AI
  models, or to build datasets for that purpose." and "Allowed on a user's behalf, with or without a subscription:
  - open and view a tab, including its title, artist, tuning and notes - play, pause, and move the playback position
  within a tab - explain how to play the tab - build independent tools that do not modify, automate, or interfere
  with this site or its tab player".
- YouTube: "Some content on the Service may use a video player embedded from YouTube, using YouTube API services.
  When interacting with such content, you agree to be bound by the YouTube Terms of Service and the Google Privacy
  Policy." (terms). Search results (heise.de, app listing; not read) say Songsterr's AI transcription takes a
  YouTube link; UNVERIFIED from a primary page.

## Chordify

- https://chordify.net/pages/terms-and-conditions/ and https://chordify.net/pages/about/ answered HTTP 403 to
  both curl and the web-fetch tool on 2026-11-10 (the site, not the proxy). No developer API page was found by
  search. How Chordify handles YouTube links could not be quoted from a primary page today: UNVERIFIED. Search
  results (App Store listing, a 2013 TNW article; not read) describe pasting YouTube links to get chords.

## Moises (consumer app) and YouTube links

- Moises Terms of Use (https://moises.ai/terms/ , "Last Updated: October 7, 2026", read 2026-11-10): the word
  "YouTube" does not occur in the page text. Relevant clauses:
  - "10.1 ... the Service may allow you to upload content to the Service from a third-party service."
  - "11.2 Ownership and Limitations. You (or if you are acting on behalf of an Organization, your Organization) retain(s) all rights, title, and interest in and to the User Content ... to the extent allowed in your jurisdiction you ... retain(s) all rights, title, and interest in and to your Output you generate using the Platform."
  - "11.4 NO TRAINING. WE DO NOT USE YOUR USER CONTENT OR OUTPUT TO TRAIN AI MODELS WITHOUT YOUR PERMISSION."
  - "14.2 use the Service or any content, information, or data obtained from the Service for purposes of informing, training, or developing (or as input to, either on its own or as part of a larger data set) artificial intelligence or machine learning technologies, services, or algorithms, except through functionality expressly provided by Moises through the Service to train a custom model;" (in the list of prohibited uses)
- No Moises help-center page about YouTube import was read (search found none). UNVERIFIED.
- Klangio's terms (quoted in the Klangio section) state that Klangio retrieves audio for YouTube links "via the
  respective platform interface (e.g., the YouTube Data API)".

## Replicate (hosted community models)

- What it is: a hosted inference service; each model page shows hardware, a typical time, an approximate price,
  and links to the upstream code and license. Model pages read 2026-11-10 (curl, server-rendered text):
  - `sakemin/all-in-one-music-structure-analyzer` (https://replicate.com/sakemin/all-in-one-music-structure-analyzer):
    "286.3K runs"; "This model costs approximately $0.062 to run on Replicate, or 16 runs per $1, but this varies
    depending on your inputs."; "This model runs on Nvidia A100 (40GB) GPU hardware. Predictions typically complete
    within 54 seconds." Links: GitHub https://github.com/mir-aidj/all-in-one , paper https://arxiv.org/abs/2307.16425 ,
    license link to the upstream LICENSE. Forks seen in search results only: `cwalo/all-in-one-music-structure-analysis`,
    `erickluis00/all-in-one-audio` (not read).
  - `ryan5453/demucs` (https://replicate.com/ryan5453/demucs): "2.2M runs"; "costs approximately $0.0050 to run on
    Replicate, or 200 runs per $1"; "runs on Nvidia A100 (40GB) GPU hardware. Predictions typically complete within 5
    seconds."; versions listed include "htdemucs_ft" and "mdx_extra_q"; "Model updated 1 month, 1 week ago". Links:
    https://github.com/adefossez/demucs , https://github.com/ryan5453/demucs-cog , paper https://arxiv.org/abs/2111.03600 .
  - `triadmusic/chord-detection-cnn-lstm` (https://replicate.com/triadmusic/chord-detection-cnn-lstm): "1.3K runs";
    "costs approximately $0.022 to run on Replicate, or 45 runs per $1"; "runs on Nvidia T4 GPU hardware.
    Predictions typically complete within 99 seconds." No GitHub or license link was found in the page HTML.
    Search result snippet (not the page): "Return a downloadable .lab file in addition to JSON output" (UNVERIFIED).
  - No Basic Pitch model on Replicate turned up in search (UNVERIFIED; Replicate's search was not queried directly).
- How a program calls it: each model page links "Playground", "API", "Examples", "README" and "Versions"; the
  per-model `/api` page (call pattern, input and output schema) is rendered by JavaScript and was not readable with
  curl. Auth scheme, client libraries and field names: UNVERIFIED here (Replicate's API docs were not read; the
  try agent's calls or the `/api` page in a browser would settle them).
- Hardware prices (https://replicate.com/pricing , read 2026-11-10): "Nvidia T4 GPU gpu-t4 $0.000225/sec $0.81/hr";
  "Nvidia L40S GPU gpu-l40s $0.000975/sec $3.51/hr"; "Nvidia A100 (80GB) GPU gpu-a100-large $0.001400/sec $5.04/hr";
  "CPU cpu $0.000100/sec $0.36/hr". The A100 (40GB) named on the model pages is not listed on the pricing page.
- Code licenses of the upstream projects (read 2026-11-10): mir-aidj/all-in-one "MIT License ... Copyright (c) 2023
  Taejun Kim" (https://raw.githubusercontent.com/mir-aidj/all-in-one/main/LICENSE); adefossez/demucs "MIT License
  ... Copyright (c) Meta Platforms, Inc. and affiliates." (https://raw.githubusercontent.com/adefossez/demucs/main/LICENSE);
  ryan5453/demucs-cog "MIT License" with copyright lines for Meta Platforms, Phil Wang (2023) and Roman Solovyev
  (ZFTurbo) (2024) (https://raw.githubusercontent.com/ryan5453/demucs-cog/main/LICENSE). Weights and training data of
  these models belong to the source-separation and chords-beats lanes.
- Terms (https://replicate.com/terms , "Last Update: April 1, 2026", read 2026-11-10):
  - "As between Customer and Replicate, Customer owns and will continue to own all rights, title, and interest, including all Intellectual Property Rights, in and to its applicable Customer Data" where "“Customer Data” means Customer Inputs and Outputs."
  - "Customer hereby grants Replicate a worldwide, non-exclusive, non-sublicensable (except for the purposes of making the Marketplace Models available to Customer and for purposes of the provision of the Services), royalty-free, license to use, publish, reproduce, copy, store, host, transmit, modify, process, make available, create derivative works of, and display its Customer Data to the extent necessary to provide the Output, train and generate Customer Derivative Models, provide the Services under these Terms, and create and compile Resultant Data."
  - "Any Community Model you download, access, or use from us or another User, is at your own risk and subject to these Terms and/or the terms accompanying such Community Model."

## fal.ai (hosted models)

- `fal-ai/demucs` (https://fal.ai/models/fal-ai/demucs/llms.txt , read 2026-11-10): "SOTA stemming model for voice,
  drums, bass, guitar and more."; endpoint `https://fal.run/fal-ai/demucs`; "**Price**: $0.0007 per seconds";
  header `Authorization: Key $FAL_KEY`; Python client `pip install fal-client` and `fal_client.subscribe("fal-ai/demucs", arguments={...})`.
  Input: `audio_url` (required); `model` default "htdemucs_6s", options "htdemucs", "htdemucs_ft", "htdemucs_6s",
  "hdemucs_mmi", "mdx", "mdx_extra", "mdx_q", "mdx_extra_q"; `stems` (default all six: vocals, drums, bass, other,
  guitar, piano); `segment_length`; `shifts` (1 to 10); `overlap` (0 to 1, default 0.25); `output_format` "wav" or
  "mp3" (default "mp3"). Output: `File` objects `vocals`, `drums`, `bass`, `other`, `guitar` ("only available for 6s
  models"), `piano`. The page's "Example Response" is `{}`.
- Other music-analysis models: the site-wide index https://fal.ai/llms.txt lists, under "Audio and speech", text to
  speech, voice clone and speech-to-text models; no transcription-to-notes, chord or beat model is listed there
  (the index is a curated subset; a full catalogue search was not done: UNVERIFIED that none exists).
- Terms (https://fal.ai/terms , "Last Updated: September 8, 2026", read 2026-11-10):
  - "Company grants you a limited, non-exclusive, non-transferable, revocable right to access and use the Sites and the Services in accordance with these Terms and applicable Documentation for your own personal or internal business use."
  - Customer Solutions clause: "Company hereby grants Customer a limited, non-exclusive, non-transferable, non-sublicensable, license to access and use Company’s API materials as part of the Documentation solely to (A) develop an interface or integration between the Customer Solution and the Services and (B) access the Services using such interface or integration to provide Customer Input and obtain Output Content".
  - "Customer hereby grants Company a non-exclusive, non-sublicensable, royalty-free license to reproduce, use, access, store, display, adapt, translate, modify, create derivative works from, and otherwise process any Customer Input to provide the Services." and "Customer owns and retains all right, title, and interest in and to the Customer Input."
  - Usage data: "Company may generate, collect, store, use, transfer, and/or disclose to third parties Usage Data and use Usage Data to perform data analytics; to monitor, improve, and support the Services; to design, develop, and offer Company products, services, and AI models; and for any other lawful purpos[e]".

## Hugging Face Inference Providers and public Spaces

- Inference Providers (https://huggingface.co/docs/inference-providers/index , read 2026-11-10): the navigation
  lists "Inference Tasks: Chat Completion, Feature Extraction, Text to Image, Text to Video" plus "Other Tasks", and
  providers "Baseten, Cerebras, Cohere, DeepInfra, Fal AI, Featherless AI, Fireworks, Groq, HF Inference, Novita,
  Nscale, OVHcloud AI Endpoints, Public AI, Replicate, Scaleway, Together, WaveSpeedAI, Z.ai". No music
  transcription, stem separation, chord or beat task appears in that task list (the "Other Tasks" sub-pages were not opened: UNVERIFIED in detail).
- Public Spaces as APIs (Gradio Python client guide, https://www.gradio.app/guides/getting-started-with-the-python-client ,
  read 2026-11-10): `from gradio_client import Client; client = Client("owner/space")`; "While you can use any public
  Space as an API, you may get rate limited by Hugging Face if you make too many requests. For unlimited usage of a
  Space, simply duplicate the Space to create a private Space, and then use it to make as many requests as you'd
  like!"; "if the original Space uses GPUs, your private Space will as well, and your Hugging Face account will get
  billed based on the price of the GPU."
- Spaces found with the Hub API (`https://huggingface.co/api/spaces?search=<q>&sort=likes`), with runtime stage
  read from `https://huggingface.co/api/spaces/<id>/runtime` on 2026-11-10 (stage at that moment, not a guarantee):
  - `taejunkim/all-in-one` (gradio, Space card license "mit", lastModified 2023-10-09): stage `RUNTIME_ERROR`, requested hardware `t4-small`.
  - `akhaliq/demucs` (203 likes, lastModified 2022-12-25): `RUNTIME_ERROR`, `cpu-basic`.
  - `ahk-d/Spleeter-HT-Demucs-Stem-Separation-2025` (lastModified 2025-09-12): `RUNTIME_ERROR`, `cpu-basic`.
  - `Hmjz100/MT3` (lastModified 2025-08-23) and `Hmjz100/YouTube-to-MT3` (2025-03-24): `RUNTIME_ERROR`, `cpu-basic`.
  - `Richhiey/basic_pitch_fastapi` (docker, lastModified 2024-11-21): `SLEEPING`, `cpu-basic`.
  - `teamup-tech/Transkun` (lastModified 2026-11-03): `RUNNING` on `zero-a10g`.
  - Other names returned by the searches (stage not checked): `SegerEnd/basic-pitch-wasm` (static, 2026-10-14),
    `koseimusic/basicpitch` (docker, 2026-06-13), `nakas/demucs_playground`, `kajise/Demucs_v4-FT_4s`,
    `Lollikit/TranskunGUI`, `allensu123/transkun-online`, and several small "guitar tab" Spaces from 2025 to 2026
    (`Haskami/guitar-tab-ai`, `JonathanJH/guitar-tabs-ai`, `JAEJUN99/guitar-tab`, `nutgh/beatpath-guitar-tab`).
- Licenses: each Space carries its own card license (e.g. "mit" on taejunkim/all-in-one) and the models it wraps keep
  their own licenses; Hugging Face's own Terms of Service were not read in this pass (UNVERIFIED).

## Soundslice data API

- What it is: Soundslice (synced notation and tab player) offers a REST "data API" for slices (scores), their
  notation, recordings and syncpoints. Docs https://www.soundslice.com/help/data-api/ , read 2026-11-10. A Python
  client `soundsliceapi` exists on PyPI (seen in search results; not read).
- Access: "API keys are only available to paying Soundslice customers — either in the Teacher or Licensing plans."
  "A Soundslice API key consists of two strings — an application ID and associated password." "For each API call,
  you’ll need to authenticate with your API key, using HTTP Basic Authentication." (https://www.soundslice.com/pricing/
  returned 404 on 2026-11-10, so plan prices were not read: UNVERIFIED.)
- Endpoints (docs): `POST /api/v1/slices/` (create), `GET /api/v1/slices/`, `GET /api/v1/slices/SCOREHASH/`,
  `GET /api/v1/slices/SCOREHASH/notation-file/` ("the original uploaded notation file ... (e.g., MusicXML, GPX, etc.)"),
  `POST /api/v1/slices/SCOREHASH/notation-file/` then a `PUT` of the raw file to the returned URL ("This API method is
  only available by special permission." ... "upload a slice’s notation from one of our supported formats: MusicXML,
  Guitar Pro, PowerTab or TuxGuitar. It does not support our PDF/image scan feature"), `GET /api/v1/slices/SCOREHASH/musicxml/`
  ("Generates MusicXML for the slice ... uses our own MusicXML exporting algorithm based on the slice’s current
  notation"), `POST /api/v1/slices/SCOREHASH/recordings/`, `GET|POST /api/v1/recordings/RECORDING_ID/syncpoints/`.
- Recording `source` values: "2 — MP3 uploaded to Soundslice", "4 — Video uploaded to Soundslice", "3 — Video URL",
  "8 — MP3 URL", "1 — YouTube video" (`source_data`: "The URL or ID of the YouTube video."), 6 Vimeo, 7 Wistia, 9 Mux.
- Syncpoint format (docs): "syncpoints are stored as a simple JSON array. Example: [[0, 0], [1, 0.57], [1, 0.8, 240], [2, 1.3]]";
  value 1 "The zero-based bar number in the slice, as an integer" (repeats expanded); value 2 "Timecode in the audio,
  in seconds, as a float."; value 3 optional "a number (integer or float) between 0 and 480, where 0 is the start of
  the bar and 480 is the end of the bar."; value 4 optional hide-playhead flag. `crop_start` / `crop_end` in seconds.
- Terms (https://www.soundslice.com/terms/ , read 2026-11-10): "7.5 Copyright in User Generated Content. You retain
  any intellectual property rights in the content you upload or post to the Service. You hereby grant Soundslice a
  worldwide, non-exclusive, royalty-free license (with the right to sublicense) to use, copy, reproduce, process,
  adapt, modify, publish, transmit, display and distribute such Content in any and all media or distribution methods
  (now known or later developed)." and "7.6 YouTube. Some content on the Service may use a video player embedded from
  YouTube, using YouTube API services. When interacting with such content, you agree to be bound by the YouTube Terms
  of Service and the Google Privacy Policy."

## Flat.io API (Flat Platform REST API v2)

- What it is: REST API of the Flat online notation editor. OpenAPI spec https://flat.io/developers/docs/openapi.yaml
  (`info.version` 2.26.2, title "Flat API"), read 2026-11-10. Auth: "Personal Access Tokens or OAuth2" (spec intro).
  `termsOfService: https://flat.io/legal` in the spec.
- Import (`POST /v2/scores`, `ScoreCreationFileImport`): "Preferred formats: MusicXML: `.xml`, `.musicxml`, `.mxl`
  (compressed) ... This is the only format that preserves all notation data ... MIDI: `.mid`, `.midi` ... Only
  preserves pitch, timing, and instrument data; notation details are lost." "Also supported (converted to MusicXML
  on import, some notation details may be lost): Guitar Pro: `.gp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, `.gtp`; MuseScore
  ...; Finale ...; ABC notation ...; PowerTab: `.ptb`; Capella ...; MEI: `.mei`". Binary payloads may be Base64 with
  `dataEncoding`. A blank score can be created with options to "enable TABs, Chord grids".
- Export ("Get a score revision data"): "Flat JSON `json`, MusicXML `mxl`/`xml`, ABC notation `abc`, MP3 `mp3`, WAV
  `wav`, MIDI `midi`, Flat `flat`, a thumbnail of the first page `thumbnail.png` or auto sync points
  `synchronizationPoints`." The spec also documents OMR (PDF/image to MusicXML) jobs.
- Terms: https://flat.io/legal ("User content and ownership": "We do not claim ownership over your User Content")
  read 2026-11-10; the developer API and embed terms page (https://flat.io/legal/en/general/developers-api-embed/)
  is rendered by JavaScript and showed "The app could not be loaded." to curl: API terms and API pricing UNVERIFIED.

## Hooktheory API (Trends)

- What it is: chord-progression statistics from Hooktheory's TheoryTab database. Docs
  https://www.hooktheory.com/api/trends/docs , read 2026-11-10. Base `https://api.hooktheory.com/v1/`.
- Auth: "You authenticate to the Hooktheory API by providing an HTTP Bearer Token ... retrieved through the API with
  your hooktheory.com username and password" (`POST users/auth`, token in `activkey`). "Token lifetime changed in 2026.
  The activkey is now a short-lived token that expires about an hour after it is issued".
- Limits: "The Hooktheory API limits requests to 10 every 10 seconds." "Over the limit the API answers 429 with a
  Retry-After header."
- Endpoints and output: `GET trends/nodes?cp=4,1` returns nodes `{ "chord_ID", "chord_HTML", "probability",
  "child_path" }` ("Each node contains a chord and the frequency with which it occurs in the database"; chords are
  Roman numerals relative to the key); `GET trends/songs?cp=4,1` returns `{ "artist", "song", "section", "url" }`,
  "paginated to 20 results per page". No audio input; no per-song chord or melody data is returned (only links).
- Terms (https://www.hooktheory.com/terms , "Last updated October, 2026"): "4. Anti-Scraping Policy – Public Display
  and Use. Except as expressly authorized by Hooktheory (e.g., via a written data license or API terms), no third
  party may copy, scrape, bulk-download, text-and-data mine, or redistribute the website including the TheoryTab
  database or any substantial portion of it (including using it to train, fine-tune, or evaluate models). You may not
  circumvent or bypass rate limits, access controls, or other technical measures." Separate API terms were not found
  on the docs page (UNVERIFIED).

## Other multimodal LLM APIs (audio or video in)

- OpenAI (read 2026-11-10): the "Audio and voice" guide (https://developers.openai.com/api/docs/guides/audio) routes
  "Audio input or output in an existing chat app" to "Audio in Chat Completions". That page
  (https://developers.openai.com/api/docs/guides/audio-chat-completions): "include audio in the modalities array and
  use an audio model, like gpt-audio-1.5." and "The Responses API docs currently describe text and image inputs with
  text outputs. For this audio-chat pattern, use Chat Completions with an audio-capable model." Audio goes in as a
  content part `{"type": "input_audio", "input_audio": {"data": <base64>, "format": "wav"}}` (code examples on the
  page). Token rates per second of audio, the full list of accepted input formats, video input, prices and OpenAI's
  terms were not read in this pass: UNVERIFIED.
- Anthropic Claude, Alibaba Qwen-Omni, Amazon Nova and other audio- or video-capable LLM APIs: not read in this pass
  (UNVERIFIED; their official docs pages would settle input formats, sampling and price).

## Spotify Web API (audio features and audio analysis)

- Spotify's developer blog post "Posted November 27, 2024" (https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api ,
  read 2026-11-10): "Effective today, new Web API use cases will no longer be able to access or use the following
  endpoints and functionality in their third-party applications. Applications with existing extended mode Web API
  access that were relying on these endpoints remain unaffected by this change." The list includes "Audio Features"
  and "Audio Analysis" (what those endpoints returned was not read on this page), and the change applies to "New
  apps that are registered on or after today's date".

## ChordMini

- https://chord-mini-app.vercel.app/docs answered HTTP 402 with a 78-byte plain-text body on 2026-11-10; the
  documented API (seen only in a search-result snippet: a `/api/recognize-chords` endpoint accepting MP3, WAV, FLAC,
  M4A and OGG, "10-minute processing timeout") could not be read: UNVERIFIED. The project's source repository was not
  read (belongs to the chords-beats lane).

## Not researched in this pass

- StemSplit API (https://stemsplit.io), GetSongBPM API (https://getsongbpm.com/api), Cyanite API (https://cyanite.ai,
  also offered inside Music.AI as "Music metadata (By Cyanite)" at "$0.15 / min", with a Music.AI terms clause that
  its Output must not be used "to train artificial intelligence or machine learning" models), Beatstorapon API,
  WaveSpeedAI, Songscription (search results say it is a consumer app). Listed so a gap-filler can pick them up.

## Handoff facts

One line per fact: "X outputs <format>, which Y accepts as <input>", with the page that supports each half (all read
2026-11-10). These are format matches from the docs, not tested runs; tested runs are in `trials.md`.

Inside this lane:

- yt-dlp outputs audio-only files ("-x, --extract-audio Convert video files to audio-only files (requires ffmpeg and ffprobe)", https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/README.md), which Klangio accepts as a multipart `file` upload (https://api-docs.klang.io/docs/getting-started/basic-job-workflow), LALAL.AI as an `application/octet-stream` upload "up to 10 GB" (https://www.lalal.ai/api/v1/openapi.json) and MVSEP as `audiofile` (https://mvsep.com/full_api).
- Gemini accepts a public YouTube URL directly as video input, with no download step on the caller's side ("You can only upload public videos (not private or unlisted videos).", https://ai.google.dev/gemini-api/docs/video-understanding).
- AudioShake outputs per-target download links that "expire after one hour" (https://developer.audioshake.ai/quickstart.md), which Music.AI accepts as a job's `inputUrl` (https://music.ai/docs/api/reference/), fal-ai/demucs as `audio_url` (https://fal.ai/models/fal-ai/demucs/llms.txt), MVSEP as `url` with `remote_type` "direct" (https://mvsep.com/full_api) and AudioShake itself as `url` (quickstart).
- Result lifetimes that bound such chains: Klangio "Results will be available for 14 days." (transcription docs); LALAL.AI "A task stays here for 24 hours after it finishes." (openapi.json); Music.AI pay-as-you-go "48h temporary storage" (https://music.ai/pricing/); AudioShake "Uploaded Assets expire after 72 hours." (https://developer.audioshake.ai/faq.md).
- Guitar stems: LALAL.AI outputs `guitar` / `electric_guitar` / `acoustic_guitar` stems (openapi.json), AudioShake `guitar` / `guitar_electric` / `guitar_acoustic` (https://developer.audioshake.ai/models.md), Music.AI `acoustic_guitar` / `electric_guitar` and `rhythm_guitars` / `solo_guitars` (module pages), MVSEP sep_type 31 / 66 / 81 / 101 (https://mvsep.com/full_api), fal-ai/demucs `guitar` with `htdemucs_6s` (llms.txt), Klangio `guitar` with `six-stems` (https://api-docs.klang.io/docs/file-formats/audio), Fadr electric and acoustic guitar via `"melodic-stem"` (https://fadr.com/docs/api-endpoints); any of these audio files is accepted by Klangio `/transcription?model=guitar` as the `file` upload (https://api-docs.klang.io/docs/advanced-usage/transcription-model-selection).
- Klangio `/transcription` with `model=guitar` outputs Guitar Pro 5 (`gp5`; "available only if you choose the guitar or bass model", https://api-docs.klang.io/docs/file-formats/guitar-pro), which Flat imports (`.gp5`, "converted to MusicXML on import, some notation details may be lost", https://flat.io/developers/docs/openapi.yaml) and Soundslice accepts as notation upload ("MusicXML, Guitar Pro, PowerTab or TuxGuitar"; endpoint "only available by special permission", https://www.soundslice.com/help/data-api/).
- Klangio outputs MusicXML (`xml` result path) and MIDI (https://api-docs.klang.io/docs/getting-started/basic-job-workflow), which Flat imports as its "Preferred formats" (openapi.yaml) and Soundslice accepts (MusicXML) (data API docs).
- Flat exports a score as MP3, WAV, MIDI, MusicXML and `synchronizationPoints` (openapi.yaml, "Get a score revision data"): a rendered audio track of a corrected tab for reference playback.
- Klangio beat tracking outputs `[beat_time_in_seconds, beat_number_in_bar]` with 1.0 on each downbeat (https://api-docs.klang.io/docs/jobs/beat-tracking-request); Soundslice syncpoints take `[zero_based_bar, time_in_seconds, optional_position_0_to_480]` (https://www.soundslice.com/help/data-api/). Music.AI beats give `bpm` plus `beatMap` with each beat's start time and beat number (https://music.ai/modules/transcription/beats/).
- Klangio chord recognition outputs `[start_s, end_s, "Root:quality"]` (e.g. "E:maj") and, in the extended job, a `key` such as "A minor" (https://api-docs.klang.io/docs/jobs/chord-recognition-extended-requests); Hooktheory `trends/nodes` takes Roman-numeral child paths relative to the key (`cp=4,1`) and returns next-chord `probability` values (https://www.hooktheory.com/api/trends/docs). Converting between them needs the key.
- Soundslice accepts a YouTube video as a recording (`source` 1, `source_data` "The URL or ID of the YouTube video.") and syncs notation to it by syncpoints (data API docs); Songsterr and Soundslice both state that embedded YouTube players bind the viewer to the YouTube Terms of Service (their terms pages).

To neighbouring lanes:

- Stems (all services above) are WAV/MP3/FLAC audio files, which the audio-to-notes and guitar-tab lanes' local transcribers take as audio input (see those lanes' survey.md for the accepting half).
- Klangio strum recognition outputs `[time_s, "U"|"D"]` per strum (https://api-docs.klang.io/docs/jobs/strum-recognition-requests): picking-direction events from audio, a counterpart to the video-hands-fretboard lane's picking-hand tracking.
- Fadr's stem task outputs MIDI per stem, chord progression MIDI, and `key` / `tempo` in asset metadata (https://fadr.com/docs/api-endpoints); MIDI is the input of the guitar-tab lane's string-and-fret assigners (see that lane for the accepting half).
- User constraints: none of the hosted transcription or separation request schemas read here (Klangio, Music.AI module inputs, LALAL.AI, AudioShake, MVSEP, fal-ai/demucs, Fadr) has a tuning, capo, key or tempo field. Gemini and OpenAI audio models take free-text prompts, the only place such a constraint can be stated to them (Gemini audio and video pages; OpenAI audio-chat page).
