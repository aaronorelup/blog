# Lane 10, hosted-apis: survey of hosted services and APIs

Agent: docs-hosted-apis. Started 2026-11-10 (date from `date -u +%F`). Everything below was read from the live
pages on 2026-11-10 unless a line says otherwise. Raw copies of most pages fetched with curl are kept outside the
repo in `/home/user/gtr/lanes/hosted-apis/raw/` (not committed). This file records facts and quotes only.

Marks used in the tool list:

- `RUNNABLE`: can be called or run from the CPU-only research box without an account (public endpoint, or a
  local program).
- `CALLABLE-WITH-KEY`: an HTTP API that needs an account and API key (or a paid balance); nothing in it needs a
  local GPU, because the compute runs on the provider's side.
- `NO-PUBLIC-API`: no developer API was found on the vendor's own pages on 2026-11-10.

## Tool list

First pass written in the first 15 minutes from web search results; each line is re-checked in its own section
below, and the section is what counts. "pending" means the section has not been written yet.

1. Music.AI (formerly the Moises developer platform), REST API at `api.music.ai/v1`, workflows built from modules
   (stems incl. guitar, chords, beats, key...). https://music.ai/docs/ . CALLABLE-WITH-KEY. pending
2. Klangio API (Klangio GmbH), transcription to MIDI / MusicXML / Guitar Pro 5 / PDF, chord recognition with times.
   https://api-docs.klang.io . CALLABLE-WITH-KEY. pending
3. LALAL.AI API v1, stem separation incl. electric and acoustic guitar. https://www.lalal.ai/api/ . CALLABLE-WITH-KEY. pending
4. AudioShake Tasks API, stem separation incl. guitar. https://developer.audioshake.ai . CALLABLE-WITH-KEY. pending
5. Fadr API, stems plus MIDI per stem, chord progression, key and tempo. https://fadr.com/docs/api . CALLABLE-WITH-KEY. pending
6. MVSEP API, many separation algorithms (Demucs, MDX, RoFormer, guitar models). https://mvsep.com/full_api . CALLABLE-WITH-KEY. pending
7. Replicate hosted models: All-In-One music structure (sakemin, cwalo, erickluis00 forks), Demucs (several
   uploads), triadmusic chord-detection-cnn-lstm, others. https://replicate.com . CALLABLE-WITH-KEY. pending
8. fal.ai hosted models: `fal-ai/demucs` and others. https://fal.ai/models/fal-ai/demucs . CALLABLE-WITH-KEY. pending
9. Hugging Face Inference Providers and public Spaces (Gradio apps wrapping Basic Pitch, Demucs, All-In-One...),
   callable with `gradio_client`. https://huggingface.co/docs . RUNNABLE for public Spaces (anonymous quota). pending
10. Soundslice data API (slices, notation upload of MusicXML / Guitar Pro / PowerTab / TuxGuitar, recordings,
    syncpoints). https://www.soundslice.com/help/data-api/ . CALLABLE-WITH-KEY. pending
11. Flat.io (Flat for Education / Tutteo) REST API v2: import MusicXML or MIDI, export. https://flat.io/developers/docs/api/ .
    CALLABLE-WITH-KEY. pending
12. Songsterr: JSON endpoints used by its site (no documented developer program found yet). https://www.songsterr.com . pending
13. Hooktheory API (Trends: chord-progression statistics). https://www.hooktheory.com/api/trends/docs . CALLABLE-WITH-KEY (free account). pending
14. Chordify: consumer service; no developer API found by search. https://chordify.net . NO-PUBLIC-API (to confirm). pending
15. Google Gemini API: audio and video input to a multimodal LLM. https://ai.google.dev/gemini-api/docs . CALLABLE-WITH-KEY. pending
16. Other multimodal LLM APIs that take audio and/or video (OpenAI audio models, Alibaba Qwen-Omni, Amazon Nova,
    Anthropic Claude for comparison). CALLABLE-WITH-KEY. pending
17. YouTube Terms of Service, YouTube API Services terms and Developer Policies (rules on downloading and storing
    audiovisual content). https://www.youtube.com/t/terms . pending
18. yt-dlp (audio from a video link), local command-line program. https://github.com/yt-dlp/yt-dlp . RUNNABLE. pending
19. ChordMini (open-source chord app with a documented HTTP API). https://chord-mini-app.vercel.app/docs . pending
20. StemSplit API (stem separation). https://stemsplit.io . CALLABLE-WITH-KEY. pending
21. Moises consumer app (how it handles YouTube links; its API is Music.AI). https://moises.ai . pending
22. Spotify Web API audio features / audio analysis (tempo, key, beats, sections) and its 2024 restriction for
    new apps. https://developer.spotify.com . pending
23. GetSongBPM API (tempo and key looked up by title, not computed from audio). https://getsongbpm.com/api . pending
24. Cyanite API (BPM, key and tags computed from audio). https://cyanite.ai . pending

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
  `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`, `TIMED_OUT`. The create response carries `job_id`,
  `creation_date`, `deletion_date`, `status_endpoint_url` (docs example).
- Endpoints in openapi.json: `/transcription`, `/source-separation`, `/beat-tracking`, `/chord-recognition`,
  `/chord-recognition-extended`, `/strum-recognition`, `/lead-sheet`, and results `/job/{job_id}/{status|xml|gp5|midi|midi_quant|pdf|json|audio}`.
- Inputs and hints:
  - `/transcription`: query `model` (required; enum in spec: `piano`, `guitar`, `bass`, `vocal`, `universal`, `lead`,
    `detect`, `drums`, `multi`, `wind`, `string`, `piano_arrangement`), `title`, `composer` (max 120 chars each),
    `webhook_url`; form field `outputs` (array; spec enum `mxml`, `midi`, `pdf`, `gp5`, `json`, `midi_quant`).
    No tuning, capo, key, tempo or note-range parameter appears in the spec's `/transcription` parameters or body schema.
  - Docs: "Guitar Pro 5 ... is available only if you choose the guitar or bass model for transcriptions."
    (https://api-docs.klang.io/docs/file-formats/guitar-pro)
  - `/chord-recognition` and `/chord-recognition-extended`: query `vocabulary` (required), `major-minor` or `full`
    (the full vocabulary's regex allows maj, min, dim, aug, min6, maj6, min7, maj7, minmaj7, 7, dim7, hdim7, sus2, sus4; N = no chord, X = unknown).
  - `/source-separation`: `model` `four-stems` (default: vocals, bass, drums, other) or `six-stems` (adds piano and guitar); `output` `wav` (default) or mp3.
  - `/lead-sheet`: body `file` plus optional `lyrics` (plain text); query `infer_lyrics`.
- Outputs (docs, quoted field shapes):
  - Chords: "The job result is a json array, containing only triplet entries [<start_time_in_seconds>, <end_time_in_seconds>, <chord_name>] with the type [float, float, string]." Example labels `"N"`, `"E:maj"`, `"D#:maj"`.
    (https://api-docs.klang.io/docs/jobs/chord-recognition-requests)
  - Chords extended: an object with `key` (regex `^[A-G](?:#{1}|b{1})?\s+(?:major|minor)$`, example "A minor"), `chords` (same triplets) and `strums`: "[<time_stamp_in_seconds>, <strum_direction>] with the type [float, string]" where direction is "U" or "D".
  - Beat tracking: "a json array, containing tuples in the format [<beat_timestamp_in_seconds>, <downbeat>] with the type [float, float]" where the second value counts the beat in the bar (1.0 to 4.0 for 4/4).
  - Transcription: MusicXML (`xml` result path), Guitar Pro 5, MIDI, quantized MIDI, PDF. "Results will be available for 14 days."
  - Separation audio: WAV "Uncompressed 16-bit PCM audio", stereo, 44.1 kHz, or MP3 128 kbps stereo 44.1 kHz; fetched per stem with `/job/{job_id}/audio?stem_type=<stem>`.
  - Per-note JSON with string and fret: not documented in the docs pages; the spec lists a `json` value in the transcription output enum without describing its fields (UNVERIFIED what it contains; settled by one paid call).
- Limits and price (https://klang.io/api/ , read 2026-11-10): Basic "$ 0" monthly: "50 requests included", "No additional requests", "Max 15s audio duration", "1 request per minute". Startup "$ 99" monthly: "500 requests included", "$0.20 each other request", "Max 300s audio duration", "2 request per second". Business "$ 499" monthly: "3000 requests included", "$0.17 each other request", "Max 300s audio duration", "5 request per second". Enterprise "Contact Sales": "10,000 requests included", "$0.10 each other request", "Max 600s audio duration", "10 request per second". Access is by application form ("Apply now"). Docs: "Use as little output formats as possible. Multiple formats may inflict additional quota costs for a transcription job." and "The six-stems model inflicts higher quota costs than four-stems model!"
- Terms (General Terms of Use, https://klang.io/terms/ , read 2026-11-10). The API itself has separate terms that were not found on a public page:
  - "API access and Bulk Transcription are not included in the subscription plans; they are offered exclusively as separate business services subject to separate terms and require separate registration." (§ 5.2.3)
  - Training on inputs: "We do not use the content uploaded by you to train our AI models or for any other purposes beyond the provision of the Klangio Services in accordance with these Terms of Use. The uploaded content will not be passed on to third parties. You may request that your uploaded content be deleted after we have provided the Klangio Services." (§ 8.1)
  - Links: "If you submit a link to an external audio source (e.g., a YouTube, Instagram or TikTok video), the audio is retrieved via the respective platform interface (e.g., the YouTube Data API), processed temporarily for the creation of the transcription and deleted upon completion; we do not maintain a permanent copy or cache of such content." (§ 8.1)
  - Commercial use (consumer services): "The use of Klangio Services and Apps is intended exclusively for private, non-commercial purposes, subject to the exception described below. Commercial use is permitted exclusively for original musical compositions created by the user, provided that the output is based on full transcriptions rather than a demo transcription (see § 5.2.1)." (§ 12.4)
  - Outputs and training: "Transcriptions may only be used by you in accordance with applicable laws, in particular copyright laws. They must not be used to train music transcription AI systems or similar technologies." (§ 12.5)
  - Rights in uploads: "You warrant that you are the owner of (or are otherwise entitled to use or exercise) all necessary rights to any content uploaded by you ... This may include, without limitation, all necessary rights to modify files and YouTube videos you submit." (§ 8.3)
- Training data of Klangio's models: not stated on the pages read.

## Music.AI (Moises' API platform)

- What it is: the developer platform of Moises (the terms grant feedback rights to "Moises"); REST API plus SDKs
  (Node.js, Python), a CLI and a desktop client (docs sitemap https://music.ai/sitemap.xml lists
  `/docs/sdk/nodejs/`, `/docs/sdk/python/`, `/docs/clients/cli/`, `/docs/clients/desktop/`). An older developer
  site still answers at https://developer-legacy.moises.ai (seen in search results only, not read). Read 2026-11-10.
- How a program calls it (https://music.ai/docs/api/reference/): base `https://api.music.ai/v1`; "The API key
  should be included in the Authorization header of each request." Steps: `GET /upload` returns
  `uploadUrl` and `downloadUrl` ("URL to upload the file to. This URL is temporary."); `POST /job` with JSON
  `{"name", "workflow" (slug), "params" (must match the workflow's input schema, e.g. "inputUrl"), "metadata"}`
  returns `{"id"}`; `GET /job/:id` returns `status` (`QUEUED`, `STARTED`, `SUCCEEDED`, `FAILED`) and `result`
  ("Processing results (URLs to output files) when status is SUCCEEDED"); `DELETE /job/:id`; `GET /workflow` lists
  workflows. A job runs a workflow, which the customer composes from modules (https://music.ai/modules/).
- Modules relevant here, with their documented input and outputs (module pages, read 2026-11-10):
  - Chords (https://music.ai/modules/transcription/chords/): input `inputFileUrl`; outputs `key` ("Detected root key of the audio (e.g., C Major, A minor).") and `chordMap` ("Timeline of Chord annotations extracted from the input audio file. Each annotation specifies the chord's start time, end time, and multiple Chord classes."). The page describes classes "Complex Jazz, Simple Jazz, Complex Pop, and Simple Pop" and "bass detection".
  - Beats (https://music.ai/modules/transcription/beats/): outputs `bpm` (number) and `beatMap` ("JSON containing beat annotations extracted from the input audio. Each annotation specifies the beat's start time and beat number.").
  - Guitar Stems (https://music.ai/modules/stem-separation/guitar-stems/): outputs `acoustic_guitar`, `electric_guitar`, `other`.
  - Guitar Parts (https://music.ai/modules/stem-separation/guitar-parts/): outputs `rhythm_guitars`, `solo_guitars`, `other`.
  - Also listed in the sitemap: Sections, Metronome (generator), Instruments detection, Vocal pitch tracker, Musical stems (per-instrument incl. Guitars), Pitch shift, Tempo (effects).
  - File formats page (https://music.ai/docs/api/file-formats/): audio "Include all audio formats, such as WAV, MP3, OGG, FLAC, etc."; video "Include all video formats, such as AVI, MP4, MKV, etc."; chord JSON shape shown as `{"start": 0, "end": 10, "chord": "C"}`, beats as `{"start": 0, "end": 10, "bpm": 120}`.
  - No note-level transcription module (notes, MIDI, tab) appears in the module sitemap read 2026-11-10. No module page read lists a tuning, capo or key hint among its inputs (inputs shown: the audio URL only).
- Price (https://music.ai/pricing/, read 2026-11-10): plans "Pay as you go $0" ("48h temporary storage", "2 concurrent processing jobs"), "Professional $25 USD Billed monthly" ("10 concurrent processing jobs", "$25 credit included every month (limited offer)", "100GB permanent storage", "5% discount on all modules"), "Business / Enterprise Contact us". Pay-as-you-go module prices: "Transcription - Chords $0.04 / min", "Transcription - Beats $0.03 / min", "Transcription - Sections $0.04 / min", "Stem separation - Guitar stems (Acoustic guitar, Electric guitar) $0.1 / min", "Stem separation - Guitar parts (Rhythm guitars, Solo guitars) $0.1 / min", "Stem separation - Musical stems (Guitars) $0.07 / min", "Stem separation - Musical stems (Bass) $0.07 / min", "Generators - Metronome $0.002 / min", "Classification - Instruments detection $0.02 / min", "Classification - Music metadata (By Cyanite) $0.15 / min". FAQ: "Pay-as-you-go and Professional members must purchase credits up front and cannot have a negative credit balance."
- Terms (https://music.ai/terms/, "Last updated: May 02, 2025", read 2026-11-10):
  - Licence scope: "a non-exclusive, non-transferable, non-sublicensable, revocable, limited license to use the Service ... on a computer or device that you own or control solely for your own internal business or individual purpose." (§ (d) Limited License)
  - Restrictions: "you shall not ... (ii) use any robot, spider, site search/retrieval application, or other manual or automatic device to retrieve, index, “scrape,” “data mine,” or in any way reproduce or circumvent the navigational structure or presentation of our website, the Service or the Music.AI Materials, (iii) use any Output to train artificial intelligence or machine learning models either as sole input or as part of a wider training dataset unless otherwise explicitly authorized by us in writing, or (iv) use the Service, the Music.AI Materials, Output, or any portion thereof as the basis for developing a competitive solution (or contract with a third-party to do so), or allow third-parties to use or exploit the Service separate from your product(s) or services without Music.AI’s express written consent." (§ (e))
  - Outputs: "Subject to these Terms, You may use the Service to generate results and outputs (“Output”), for example data, text, audio, video, and artificial intelligence models. These Terms will apply to your use of the Service as well as your use of any Output you create, generate, or otherwise receive from use of the Service." (§ (b) Output of the Service)
  - Free use: "If you are accessing or making use of the Service on a no-fee, trial, or evaluation basis (the “Evaluation Access”), you may use the Service and any Output solely for internal testing and evaluation to determine whether to purchase the Service from us." (§ (c))
  - Training on inputs: "THIS LICENSE IS GRANTED SOLELY FOR THE PURPOSE OF DELIVERING THE SERVICE TO YOU AND DOES NOT INCLUDE ANY RIGHTS FOR US TO USE YOUR CUSTOMER CONTENT TO TRAIN OR FINE-TUNE ARTIFICIAL INTELLIGENCE OR MACHINE LEARNING MODELS UNLESS YOU HAVE EXPRESSLY AUTHORIZED SUCH USE IN WRITING OR VIA AN ELECTRONIC OPT-IN MECHANISM." The same section also says: "We may use the Customer Content to provide the Service to you, to improve or develop our products and services, and, subject to Section 7(f) below (Personal Data Processing), as otherwise described in our Privacy Policy".
  - Retention: "we are under no obligation to store, maintain, or provide you with copies of any Customer Content you provide or any Outputs you generate using the Service, and we reserve the right to delete any such Customer Content and Outputs at any time without notice to you."
- Training data, as stated by the vendor (FAQ https://music.ai/docs/faq/): "Music AI only trains on licensed materials."
