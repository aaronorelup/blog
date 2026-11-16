"""Gap round 2 (gapfill-hosted-apis, 2026-11-11): write this round's facts into tools.json.

usage: python3 -I gap2_update_tools_json.py <tools.json>
Idempotent: sets fields of existing entries by name and adds new entries once; keeps the file's formatting
(json.dumps(indent=2, ensure_ascii=False) plus a trailing newline). Every value comes from survey.md / trials.md as
written in gap round 2; quotes were copied from the pages saved under /home/user/gtr/lanes/hosted-apis/raw/gap2-*.
"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path))
by = {t["name"]: t for t in d["tools"]}
G2 = "gap round 2 (gapfill-hosted-apis, 2026-11-11)"


def note(t, text):
    t.setdefault("corrections", [])
    if text not in t["corrections"]:
        t["corrections"].append(text)


def drop_unverified(t, needle):
    t["unverified"] = [u for u in t.get("unverified", []) if needle not in u]


def add_unverified(t, text):
    t.setdefault("unverified", [])
    if text not in t["unverified"]:
        t["unverified"].append(text)


# ---------------------------------------------------------------- gap 1: terms of the services that were called
V_AIPT = "https://vercel.com/legal/ai-product-terms.md"
V_TOS = "https://vercel.com/legal/terms.md"
V_NLI = "https://vercel.com/legal/notices-and-license-information.md"
vg = by["Vercel AI Gateway"]
base_terms = [s for s in vg["license"]["service_terms"] if s["url"] == "https://vercel.com/docs/ai-gateway/pricing.md"]
vg["license"]["service_terms"] = base_terms + [
    {"topic": "Provider terms per model", "quote": "AI Gateway is available on all plans. Your use of each AI provider is subject to their terms listed on each model's page", "url": "https://vercel.com/docs/ai-gateway.md", "read": "2026-11-11"},
    {"topic": "AI Product Terms version", "quote": "Last Updated March 17, 2026", "url": V_AIPT, "read": "2026-11-11", "note": "\"Effective Date March 31, 2026\""},
    {"topic": "License grant (AI Product Terms § 2)", "quote": "Vercel grants Customer a non-exclusive, non-transferable, revocable, limited license (without the right to sublicense), solely for the Term, to (a) access and use the AI Products and Services; and (b) use any associated Documentation in connection with authorized uses of the AI Products and Services, in all cases of (a)-(b), solely for Customer's personal or internal business use purposes.", "url": V_AIPT, "read": "2026-11-11"},
    {"topic": "Ownership of inputs and outputs (§ 6.2)", "quote": "As between you and Vercel, and to the extent permitted by applicable law, you own Customer Content and Vercel assigns to you Vercel's rights, if any, in the Output.", "url": V_AIPT, "read": "2026-11-11"},
    {"topic": "Hobby or Pro plan content (§ 6.2)", "quote": "If you use the AI Products and Services under a Hobby or Pro plan, your Customer Content forms part of Your Content, as defined in Section 3 of the Terms of Service and is subject to the license granted to Vercel under Section 3.", "url": V_AIPT, "read": "2026-11-11"},
    {"topic": "Third-party providers (§ 8.1)", "quote": "AI Gateway enables you to interact with your selected third-party AI providers. Any Customer Content provided to or received from such Non-Vercel Service is subject to the terms and conditions and privacy notices of the applicable third party.", "url": V_AIPT, "read": "2026-11-11"},
    {"topic": "Enterprise subscription only (§ 8.4)", "quote": "Vercel represents and warrants that it shall not use AI Gateway Customer Content to train or improve the AI Products and Services.", "url": V_AIPT, "read": "2026-11-11"},
    {"topic": "Model Training on Hobby or trial Pro plans (Terms of Service § 3, \"Last Updated October 19, 2026\")", "quote": "In addition, if you are on a Hobby plan or trial Pro plan, you agree that we may use Your Content to train our artificial intelligence (“AI”) and machine learning models, and we may share Your Content with third parties for the purpose of developing and improving their products, including training and improving their AI and machine learning models", "url": V_TOS, "read": "2026-11-11"},
    {"topic": "Model Training opt-out (Terms of Service § 3)", "quote": "If you are on a paid Pro plan, Model Training is not enabled by default and you may opt in to Model Training. You may opt-out of Model Training at any time by adjusting your Team account settings or by upgrading to an Enterprise plan.", "url": V_TOS, "read": "2026-11-11"},
    {"topic": "Hobby plan use (Terms of Service § 4)", "quote": "You shall only use the Services under a Hobby plan for your personal or non-commercial use.", "url": V_TOS, "read": "2026-11-11"},
    {"topic": "Provider terms list (NLI § 6, \"Last Updated February 26, 2026\")", "quote": "Non-Vercel Services in the AI Gateway are provided subject to any applicable terms the customer has agreed to with respect to the third-party AI service provider, or the terms below, as applicable:", "url": V_NLI, "read": "2026-11-11", "note": "links Xiaomi, ByteDance, Baseten, Fireworks, Together AI, Modal, Nebius, Google, xAI and others"},
    {"topic": "Gateway retention (docs, not the contract)", "quote": "AI Gateway uses zero data retention by default. It permanently deletes your prompts and responses after requests complete.", "url": "https://vercel.com/docs/ai-gateway/security-and-compliance.md", "read": "2026-11-11"},
    {"topic": "No-training providers (docs)", "quote": "The following providers currently support no training on prompt data on AI Gateway.", "url": "https://vercel.com/docs/ai-gateway/security-and-compliance/disallow-prompt-training.md", "read": "2026-11-11", "note": "the table marks Baseten, ByteDance, Fireworks, Modal, Nebius and Together AI, among others; Xiaomi is not in it"},
    {"topic": "No-training and ZDR controls (docs)", "quote": "Per-request no-training controls add no cost on any plan. ZDR requires Pro or Enterprise.", "url": "https://vercel.com/kb/guide/control-ai-provider-data.md", "read": "2026-11-11"},
]
drop_unverified(vg, "Vercel's gateway terms were not read")
add_unverified(vg, "Which Vercel plan the gateway key's team is on was not checked from this box; the HTTP 403 bodies of r0022 and r0023 name the gateway's \"Free tier\"")
vg["request_options_sent"] = "the trial scripts sent neither `disallowPromptTraining` nor `zeroDataRetention`; only `providerOptions.gateway.only` / `order` when `--only` was given; `usage.is_byok` false in all 25 gateway lines of samples/spend.jsonl"
note(vg, "corrected in " + G2 + ": \"Vercel's gateway terms were not read\" removed; AI Product Terms, Terms of Service, Notices and License Information and the data-handling docs quoted (survey.md, Vercel AI Gateway)")

mimo = by["xiaomi/mimo-v2.6-flash (via Vercel AI Gateway)"]
XUA = "https://platform.xiaomimimo.com/#/docs/terms/user-agreement"
mimo["license"]["weights"] = {
    "name": "Hugging Face XiaomiMiMo/MiMo-V2.6-Flash-RL (and -MOPD), not gated",
    "quote": "license: mit",
    "url": "https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/raw/main/README.md",
    "read": "2026-11-11",
    "note": "model card front matter; no LICENSE file in either repository; which checkpoint the `xiaomi` API serves is not stated (UNVERIFIED)",
}
mimo["license"]["service_terms"] = [
    {"topic": "Gateway model page", "quote": "Your use is subject to Xiaomi's Terms & Privacy Policies.", "url": "https://vercel.com/ai-gateway/models/mimo-v2.6-flash", "read": "2026-11-11"},
    {"topic": "Xiaomi MiMo Service Agreement version", "quote": "Our Service Agreement was updated on July 7, 2026.", "url": XUA, "read": "2026-11-11", "note": "script-rendered page; English text read from https://mimo.mi.com/static/1995.8b548d0e0b571f7c.chunk.js as data"},
    {"topic": "Customer data (§ 4.1)", "quote": "Xiaomi acts as a Processor in data processing activities, and you are the Data Controller. The data you upload, store, process, download, distribute, or otherwise handle through our services constitutes your business data, over which you retain full control.", "url": XUA, "read": "2026-11-11"},
    {"topic": "Intellectual property (§ 5.1)", "quote": "The intellectual property rights owned by both parties before using the Service shall remain with each party and will not be transferred as a result of the performance of this Agreement by both parties. For the avoidance of doubt, the ownership and intellectual property rights of the Xiaomi MiMo model belong to Xiaomi, including but not limited to model parameters, algorithms, code, framework structure, etc.", "url": XUA, "read": "2026-11-11"},
    {"topic": "Generated content (§ 3.8.1)", "quote": "The content generated by this product does not represent the product/service itself or the views of Xiaomi.", "url": XUA, "read": "2026-11-11"},
    {"topic": "Data location (§ 4.4)", "quote": "When providing services outside the Chinese Mainland, Xiaomi will store the relevant data on servers located in Europe and Singapore.", "url": XUA, "read": "2026-11-11"},
]
mimo["gateway_data_flags"] = "model list 2026-11-11: no_training \"some\", zdr \"none\"; Xiaomi not in the gateway's no-training table; all MiMo calls here served by `xiaomi`"
drop_unverified(mimo, "The model's own license, weights and training data are not stated in the reports")
add_unverified(mimo, "Which MiMo V2.6 Flash checkpoint the `xiaomi` provider serves; the model's training data was not read")
add_unverified(mimo, "No clause on training models with customer inputs was found in the English Xiaomi MiMo Service Agreement (the word \"train\" occurs only in § 4.5, staff training)")
note(mimo, "corrected in " + G2 + ": weights license and Xiaomi's terms quoted (survey.md, \"The three models called through the gateway\")")

muse = by["meta/muse-spark-open (via Vercel AI Gateway)"]
MUSE_API = "https://huggingface.co/api/models/meta-models/Muse-Spark-Open-816B-A42B"
muse["license"]["weights"] = {
    "name": "Muse Model License (Hugging Face meta-models/Muse-Spark-Open-816B-A42B, gated \"manual\", card license_name muse-model-license)",
    "quote": "Meta claims no ownership of outputs generated by the Software.",
    "url": MUSE_API,
    "read": "2026-11-11",
    "note": "license text read from the gate prompt in the Hub API answer (the repository files answer HTTP 401 without a token); \"Release date: October 15, 2026\"; § 2 requires \"Built with Muse Spark Open\" to be displayed; § 3 requires a separate agreement for a \"Model as a Service\" business above \"twenty (20) million US dollars\" of revenue in twelve months",
}
muse["license"]["service_terms"] = [
    {"topic": "Gateway model page", "quote": "Your use is subject to Meta's Terms & Privacy Policies.", "url": "https://vercel.com/ai-gateway/models/muse-spark-open", "read": "2026-11-11", "note": "links https://dev.meta.ai/legal/terms-of-service and lists the terms of fireworks, baseten, togetherai, modal and nebius under Legal"},
    {"topic": "Meta Model API Terms scope (\"Last updated: October 9, 2026\")", "quote": "These Terms apply when you access or use the application programming interface we make available (“Meta Model API”)", "url": "https://dev.meta.ai/legal/terms-of-service", "read": "2026-11-11"},
    {"topic": "Meta Model API Terms, Exhibit C (Hosted Platform Access)", "quote": "Meta does not receive or process your Content, including Inputs or Outputs, in connection with your access to the Meta Materials through a Hosted Platform. Meta does not use such Content to train, develop, evaluate, or improve Meta’s artificial intelligence models, products, or services in connection with that access.", "url": "https://dev.meta.ai/legal/terms-of-service", "read": "2026-11-11"},
    {"topic": "Muse Model License grant", "quote": "Permission is hereby granted, free of charge, to any person (the \"Licensee\") accessing or obtaining a copy of this software, including the model, code, model weights, parameters, configuration files, and associated documentation files (the “Software”), to deal in the Software without restriction", "url": MUSE_API, "read": "2026-11-11"},
]
muse["gateway_data_flags"] = "model list 2026-11-11: no_training \"all\", zdr \"all\"; Baseten, Fireworks, Modal, Nebius and Together AI are in the gateway's no-training table"
drop_unverified(muse, "Weights and training data of the model are not stated in the reports")
add_unverified(muse, "Whether a gateway route through Baseten, Together AI or Fireworks counts as a \"Hosted Platform\" under Exhibit C of Meta's Model API Terms; the model's training data was not read")
note(muse, "corrected in " + G2 + ": weights license and the linked terms quoted (survey.md, \"The three models called through the gateway\")")

seed = by["bytedance/seed-2.1-turbo (via Vercel AI Gateway)"]
BP_AI = "https://docs.byteplus.com/en/docs/legal/AI-Services-terms"
seed["license"]["service_terms"] = [
    {"topic": "Gateway model page", "quote": "Your use is subject to ByteDance's Terms & Privacy Policies.", "url": "https://vercel.com/ai-gateway/models/seed-2.1-turbo", "read": "2026-11-11"},
    {"topic": "BytePlus Terms of Service § 4 (\"Last Updated: August 23, 2022\")", "quote": "Unless otherwise agreed, you hereby grant to BytePlus and its affiliates a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, sub-licensable, and transferable right and license without any license fee to access and use any data collected from you, or stored or uploaded by you, during your access to or use of the Services, for any purposes relating to our operation and provision of the Services.", "url": "https://docs.byteplus.com/en/docs/legal/docs-terms-of-service", "read": "2026-11-11"},
    {"topic": "BytePlus General Terms for AI Services § 2.1 (\"Last updated: August 28, 2026\")", "quote": "As between you and BytePlus, you retain your rights in Input. To the extent permitted by applicable law, as between you and BytePlus, you own the Output generated in response to your Input, and BytePlus does not claim ownership of such Output.", "url": BP_AI, "read": "2026-11-11"},
    {"topic": "BytePlus General Terms for AI Services § 3.2", "quote": "BytePlus may retain and process data relating to your use of the AI Services as necessary to provide and maintain the AI Services and protect them from fraud, abuse, and security threats", "url": BP_AI, "read": "2026-11-11"},
    {"topic": "BytePlus General Terms for AI Services § 3.3", "quote": "Except for feedback that you voluntarily provide for service improvement, or where you otherwise separately consent or agree in writing, BytePlus will not use your Customer Data to train the foundation models underlying the AI Services.", "url": BP_AI, "read": "2026-11-11"},
]
seed["gateway_data_flags"] = "model list 2026-11-11: no_training \"all\", zdr \"none\"; ByteDance is in the gateway's no-training table; not tagged open-weights"
drop_unverified(seed, "Weights and training data of the model are not stated in the reports")
add_unverified(seed, "Training data of Seed 2.1 Turbo was not read; no weights were looked for")
note(seed, "corrected in " + G2 + ": BytePlus terms quoted (survey.md, \"The three models called through the gateway\")")

xs = by["xAI Speech to Text (grok-voice-transcribe-2.0)"]
xs["license"]["service_terms"] = [
    {"topic": "Which terms govern the API (docs FAQ)", "quote": "for our Enterprise Terms of Service and Data Processing Addendum", "url": "https://docs.x.ai/developers/faq/general.md", "read": "2026-11-11", "note": "the FAQ points to https://x.ai/legal ; that page and https://x.ai/legal/terms-of-service-enterprise answered HTTP 403 (Cloudflare block page) to curl and to the web-fetch tool on 2026-11-11, so the terms' own clauses were not read"},
    {"topic": "Training (docs FAQ, not the contract)", "quote": "SpaceXSI never trains on your API inputs or outputs without your explicit permission.", "url": "https://docs.x.ai/developers/faq/security.md", "read": "2026-11-11"},
    {"topic": "Retention (docs FAQ, not the contract)", "quote": "By default, all API requests and responses are stored on our servers (encrypted at rest) for 30 days for auditing purposes in the event of suspected abuse or misuse. SpaceXSI does not train on this data, and it is automatically deleted after 30 days.", "url": "https://docs.x.ai/developers/faq/security.md", "read": "2026-11-11"},
]
drop_unverified(xs, "xAI's terms were not read")
add_unverified(xs, "xAI's Enterprise Terms of Service (output ownership, data use): the page answered HTTP 403 to the box on 2026-11-11; for-aaron.md section 14 asks Aaron to save it")
add_unverified(xs, "The `x-zero-data-retention` response header the docs describe was not saved for r0105 or r0306")
xs["for_aaron"] = True
note(xs, "corrected in " + G2 + ": \"xAI's terms were not read\" replaced by the docs FAQ quotes and the HTTP 403 record (survey.md, xAI Speech to Text API)")

# ---------------------------------------------------------------- gap 2: tried flags, gradio_client runs, ffmpeg runs
for name, why in (
    ("HF Space hugging-apps/muscriptor-music-transcription", "every call (r0116, r0309) was refused for anonymous ZeroGPU quota before any output"),
    ("HF Space lpeterl/sam-audio-webui", "its one call (r0162) was refused for anonymous ZeroGPU quota before any output"),
    ("Google Gemini API", "every generation request (r0013, r0014, r0300) got HTTP 402; only countTokens (r0016) answered, with input token counts"),
):
    t = by[name]
    t["tried"] = False
    t["tried_how"] = None
    note(t, "corrected in " + G2 + ": tried set to false because " + why + "; the run records are kept as attempt facts")


def space_run(rid, gc, space, inp, wall, outcome, verifier=False):
    m = {"space": space, "gradio_client": gc, "outcome": outcome}
    if verifier:
        m["note"] = "verifier re-run"
    return {"run_id": rid, "input_id": inp, "cores": None, "wall_s": wall, "peak_mb": None, "exit_code": 0,
            "output_files": [], "metrics": m}


gc = by["gradio_client"]
gc["runs"] = [
    space_run("r0112", "2.7.2", "mimbres/YourMT3", "S2n", 5.32, "HTML with the MIDI inline (1,175 bytes decoded)"),
    space_run("r0116", "2.7.2", "hugging-apps/muscriptor-music-transcription", "S2n", 3.17, "refused: ZeroGPU runs limit"),
    space_run("r0118", "2.7.2", "teamup-tech/Beat-This", "S4", 12.59, "click WAV and 68 beat/downbeat labels"),
    space_run("r0119", "2.7.2", "nakas/demucs_playground", "S4", 1.67, "failed: ValueError('Unknown protocol: ws') (Gradio 3 Space)"),
    space_run("r0162", "2.7.2", "lpeterl/sam-audio-webui", "S4", 3.15, "refused: ZeroGPU runs limit"),
    space_run("r0164", "2.7.2", "mimbres/YourMT3-cpu", "S2n", 31.18, "HTML with the MIDI inline (1,177 bytes)"),
    space_run("r0231", "2.7.2", "mimbres/YourMT3-cpu", "ElevenLabs guitar.mp3 of S4", 66.90, "HTML with the MIDI inline (3,974 bytes)"),
    space_run("r0245", "2.7.2", "mimbres/YourMT3-cpu", "R1c", 31.34, "HTML with the MIDI inline (1,043 bytes)"),
    space_run("r0246", "2.7.2", "teamup-tech/Beat-This", "R1c", 5.69, "click WAV and 56 beat/downbeat labels"),
    space_run("r0305", "2.7.2", "mimbres/YourMT3-cpu", "S2n", 26.46, "MIDI byte-identical to r0164's", True),
    space_run("r0308", "2.7.2", "teamup-tech/Beat-This", "S4", 6.89, "the same beats as r0118", True),
    space_run("r0309", "2.7.2", "hugging-apps/muscriptor-music-transcription", "S2n", 3.57, "refused: ZeroGPU runs limit", True),
    space_run("r0311", "2.7.2", "mimbres/YourMT3", "S2n", 3.42, "refused: ZeroGPU quota (90s requested vs. 79s left)", True),
    space_run("r0141", "0.5.3", "nakas/demucs_playground", "S4", 172.46, "four WAV stems"),
    space_run("r0322", "0.5.3", "nakas/demucs_playground", "S4", 155.50, "four WAV stems, sample values differ from r0141's", True),
]
gc["license"]["code"] = {
    "name": "gradio_client",
    "quote": "Apache-2.0",
    "url": "https://pypi.org/pypi/gradio_client/2.7.2/json",
    "read": "2026-11-11",
    "note": "PyPI license_expression of 2.7.2; 0.5.3 has only the classifier \"License :: OSI Approved :: Apache Software License\" (https://pypi.org/pypi/gradio_client/0.5.3/json)",
}
drop_unverified(gc, "gradio_client's license was not read in this lane")
gc["runs_note"] = "wall_s is the round trip the calling script measured (record.json), not the ledger's wall_s; no CPU slot was taken (--nolock)"
note(gc, "corrected in " + G2 + ": the Space-call run ids are now listed under runs (trials.md, Gap round 2)")

ff = by["ffmpeg"]
ff["url"] = "https://ffmpeg.org"
ff["runs"] = [
    {"run_id": "r0599", "input_id": "S2n, S3, S4", "cores": None, "wall_s": 0.29, "peak_mb": 50.2, "exit_code": 0,
     "output_files": [],
     "metrics": {"command": "scripts/gap2/ffmpeg_excerpts.sh: ffmpeg -i <clip>.wav -t 15.0 -c:a pcm_s16le <clip>_0-15s.wav", "nolock": True,
                 "result": "three WAVs of 2,646,078 bytes with the sha256 recorded in /home/user/gtr/lanes/hosted-apis/inputs/README.md; copies deleted after the check"}},
    {"run_id": "r0600", "input_id": "R3a", "cores": None, "wall_s": 0.61, "peak_mb": 79.7, "exit_code": 0,
     "output_files": [],
     "metrics": {"command": "scripts/gap2/ffmpeg_frames_r3a.sh: ffmpeg -i R3a.mp4 -vf fps=1 -q:v 3 f_%02d.jpg", "nolock": True,
                 "result": "18 JPEGs, 531,261 bytes, each byte-identical to out/frames/R3a/; copies deleted after the check"}},
]
ff["inputs"] = ["WAV and MP4 files of the shared set; MP3 stems from ElevenLabs"]
ff["outputs"] = ["WAV excerpts (PCM 16-bit), JPEG frames, float WAVs of decoded and trimmed stems"]
drop_unverified(ff, "No ffmpeg run has its own run id in these reports")
add_unverified(ff, "The first round's ffmpeg steps (excerpts, frames, stem decoding, amix) were not ledger runs; the excerpts and frames were re-made and logged in gap round 2 (r0599, r0600), the stem decoding was remade by the first verifier but not logged")
note(ff, "corrected in " + G2 + ": the excerpt cuts and the R3a frame extraction were not logged in the first round; re-run through gtr-run --nolock as r0599 and r0600 with byte-identical outputs")

# ---------------------------------------------------------------- gap 3: OpenAI, Qwen-Omni, MusicGPT, Amazon Nova
oa = by["OpenAI audio in Chat Completions (gpt-audio-1.5)"]
oa["version"] = "gpt-audio-1.5 (model page read 2026-11-11: \"128,000 context window\", \"16,384 max output tokens\")"
oa["inputs"] = [
    "`input_audio` content part (base64); `input_audio.format`: \"The format of the encoded audio data. Currently supports \"wav\" and \"mp3\".\" (https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create.md)",
    "model page modalities: Text \"Input and output\", Image \"Not supported\", Audio \"Input and output\", Video \"Not supported\"",
]
oa["outputs"] = ["text and audio (model page: Audio \"Input and output\")"]
oa["pricing"] = ("Per 1M tokens (https://developers.openai.com/api/docs/pricing.md and the model page, read 2026-11-11): "
                 "\"| gpt-audio-1.5 | Audio | $32.00 | $64.00 | - |\" and \"| gpt-audio-1.5 | Text | $2.50 | $10.00 | - |\" "
                 "(columns Model, Modality, Input, Output, Cached input)")
oa["license"]["service_terms"] = [
    {"topic": "Training on API data (docs, not the contract)", "quote": "Your data is your data. As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in to share data with us).", "url": "https://developers.openai.com/api/docs/guides/your-data.md", "read": "2026-11-11", "note": "its table gives /v1/chat/completions \"No\" for data used for training and \"30 days\" abuse monitoring retention"},
]
oa["unverified"] = [
    "Audio tokens per second of input: not stated on the model page, the pricing page or the two audio guides read 2026-11-11",
    "OpenAI's Services Agreement (https://openai.com/policies/services-agreement/) answered HTTP 403 to curl and to the web-fetch tool on 2026-11-11; no clause quoted",
    "\"The Responses API docs currently describe text and image inputs with text outputs. For this audio-chat pattern, use Chat Completions with an audio-capable model.\"",
]
note(oa, "corrected in " + G2 + ": formats, modalities and prices read and quoted (survey.md, Other multimodal LLM APIs); token rate and terms still UNVERIFIED")

qw = by["Alibaba Cloud Model Studio Qwen-Omni"]
QPR = "https://www.alibabacloud.com/help/en/model-studio/model-pricing"
qw["pricing"] = ("Per million tokens, \"Last Updated:Nov 07, 2026\" (" + QPR + ", read 2026-11-11): qwen3.8-omni-flash Singapore "
                 "\"International\": input \"$0.15\", cache-hit input \"$0.016\", output \"$0.47\"; qwen3.5-omni-plus \"International\": "
                 "input \"$1.4\" (text, image, video) and \"$11\" (audio), output \"$8.3\" (text) and \"$44\" (text + audio), free quota "
                 "\"1 million tokens\" (Singapore only). Audio tokens: \"Qwen3.8-Omni-Flash: Input audio formula: Total tokens = Audio "
                 "duration (seconds) * 7.\" (https://help.aliyun.com/en/model-studio/qwen-omni)")
QT = "https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-product-terms-of-service-v-3-8-0"
qw["license"]["service_terms"] = [
    {"topic": "Output ownership (Product Terms § 4.48.1 e, \"Last Updated:Oct 19, 2026\")", "quote": "Model Studio does not claim ownership of any Intellectual Property Rights in the Output.", "url": QT, "read": "2026-11-11"},
    {"topic": "Training on customer content (§ 4.48.1 e)", "quote": "Alibaba Cloud will not use your Member Content to develop or improve the models on Model Studio, unless you separately provide your consent.", "url": QT, "read": "2026-11-11"},
    {"topic": "Competing products (§ 4.48.1 d, among what \"you shall not\" do)", "quote": "use Model Studio, AI models provided through Model Studio (including any Output of such AI models) to train or develop products or services that compete with Alibaba Cloud and/or its affiliates’ products and services, unless expressly authorised by us", "url": QT, "read": "2026-11-11"},
]
qw["unverified"] = []
note(qw, "corrected in " + G2 + ": \"Price and terms: not read\" closed (survey.md, Other multimodal LLM APIs)")

mg = by["MusicGPT API (audio_to_midi)"]
mg["pricing"] = ("Audio to MIDI (https://docs.musicgpt.com/api-documentation/index/pricing.md, read 2026-11-11): \"$0.005 + $0.0037/min\" "
                 "(Pro Plan), \"$0.007 + $0.005/min\" (Plus Plan), \"$0.014 + $0.01/min\" (Pay as You Go); \"+/min: Additional cost per "
                 "minute (60s increments)\"; \"Max input audio length: 8 minutes.\"")
mg["license"]["service_terms"] = [
    {"topic": "Commercial rights (Terms § 3.1, \"Effective date: 01 Jan 2025\")", "quote": "Users on paid plans have full commercial rights to their generated content.", "url": "https://musicgpt.com/terms-of-service", "read": "2026-11-11"},
    {"topic": "Licence to MusicGPT (§ 3.1)", "quote": "By using the Service, you grant MusicGPT a royalty-free, non-exclusive, and perpetual license to use, showcase, and distribute generated music for improving the Service, marketing, and training purposes.", "url": "https://musicgpt.com/terms-of-service", "read": "2026-11-11"},
    {"topic": "Uploads (§ 3.2)", "quote": "You retain ownership of uploaded files but grant us a license to process them as necessary for providing the Service.", "url": "https://musicgpt.com/terms-of-service", "read": "2026-11-11"},
]
mg["unverified"] = [
    "The model behind audio_to_midi: the page says only \"AI-driven audio analysis and transcription\"",
    "Whether the consumer Terms of Service govern API use (no separate API terms in the docs index)",
    "Output-only fact: the MIDI output has no accepting tool verified in this lane",
]
note(mg, "corrected in " + G2 + ": price and terms read and quoted (survey.md, MusicGPT API)")

nv = by["Amazon Nova"]
nv["what"] = ("Amazon's foundation models on Amazon Bedrock. Inputs (read 2026-11-11): Nova v1 Premier, Pro, Lite \"Text, Image, Video\", "
              "Micro \"Text\", Sonic \"Speech\"; Nova 2 Lite \"Text, images, video, documents\", Nova 2 Sonic \"Speech, text\", Nova "
              "Multimodal Embeddings \"Text, images, documents, video, audio\" (embeddings out). No model on those pages takes music audio "
              "and returns text.")
nv["url"] = "https://docs.aws.amazon.com/nova/latest/nova2-userguide/what-is-nova-2.html"
nv["not_run_reason"] = "no AWS key in the key store; no listed Nova model takes general audio and returns text (Nova 2 Lite takes video)"
nv["inputs"] = ["Nova 2 Lite: text, images, video, documents; Nova 2 Sonic: speech, text"]
nv["outputs"] = ["text (Lite), speech and text (Sonic), embeddings (Multimodal Embeddings)"]
nv["license"]["service_terms"] = [
    {"topic": "Output (AWS Service Terms § 50.2, \"Last Updated: November 5, 2026\")", "quote": "The output that you generate using AI Services is Your Content.", "url": "https://aws.amazon.com/service-terms/", "read": "2026-11-11"},
    {"topic": "Bedrock abuse detection (§ 50.12.2)", "quote": "For certain models identified on the Bedrock abuse detection page, as part of providing the Service, Amazon Bedrock stores Service inputs and outputs for up to 30 days (unless otherwise required by law) solely to detect activity that violates our, or third-party model providers’, terms of service or use policies.", "url": "https://aws.amazon.com/service-terms/", "read": "2026-11-11"},
]
nv["unverified"] = ["Prices were not read", "AWS Service Terms § 50.10 name an \"Amazon Nova 2 Omni\"; no page about it was read, so its inputs are not known"]
note(nv, "corrected in " + G2 + ": \"not read\" closed: input modalities and AWS Service Terms read (survey.md, Other multimodal LLM APIs)")

# ---------------------------------------------------------------- gap 4: Mureka Music Transcription on fal.ai (new)
FAL_TOS = "https://fal.ai/legal/terms-of-service"
mureka = {
    "name": "Mureka Music Transcription (fal.ai mureka/api/song/transcribe)",
    "kind": "api",
    "what": "Hosted transcription endpoint from Mureka (\"Mureka is developed by Skywork AI Pte. Ltd.\", https://www.mureka.ai/llms.txt) sold through fal.ai: \"Transcribes generated or uploaded music into a downloadable archive that can include MusicXML, PDF sheet music, and timestamped lyrics.\"",
    "url": "https://fal.ai/models/mureka/api/song/transcribe/llms.txt",
    "version": "queue OpenAPI \"1.0.0\" (https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=mureka/api/song/transcribe); model page date 2026-09-15T14:29:09.708Z; read 2026-11-11",
    "tried": False,
    "tried_how": None,
    "runs": [],
    "not_run_reason": "needs a fal key (`Authorization: Key $FAL_KEY`); the key store has none (getkey.py --list, names only, 26 names, checked 2026-11-11); nothing was signed up for",
    "for_aaron": True,
    "callable_via": ["http", "python", "javascript"],
    "inputs": [
        "exactly one of `song_id`, `upload_audio_id` or `audio_url`: \"Public HTTPS URL or data URI for an MP3, WAV, or M4A file between 10 seconds and 10 minutes and no larger than 100 MB. Provide exactly one audio source.\"",
        "optional `title` (string, maxLength 50)",
    ],
    "outputs": ["`zip_url` (required): \"The generated transcription archive.\"; contents per input not documented beyond \"can include MusicXML, PDF sheet music, and timestamped lyrics\""],
    "constraints_accepted": ["none: no instrument, tuning, capo, key or tempo field in the input schema"],
    "license": {
        "code": None,
        "weights": None,
        "training_data": [],
        "service_terms": [
            {"topic": "Model page licence type", "quote": "Commercial use", "url": "https://fal.ai/models/mureka/api/song/transcribe", "read": "2026-11-11", "note": "badge on the page; embedded data licenseType commercial; termsOfService https://fal.ai/legal/terms-of-service"},
            {"topic": "fal Terms: third-party models (\"Last Updated: September 8, 2026\")", "quote": "Your access to and use of such Third-Party Materials may be subject to additional terms, conditions, and policies (including terms of service or privacy policies of the providers of such Third-Party Materials).", "url": FAL_TOS, "read": "2026-11-11"},
            {"topic": "fal Terms: competing models (among what \"You may not\" do)", "quote": "use or access any Third-Party Materials or any outputs derived from such materials to develop, modify, fine-tune, or improve any products or services that compete with those Third Party Materials, including to develop, fine-tune, or train any artificial intelligence or machine learning algorithms or models", "url": FAL_TOS, "read": "2026-11-11"},
        ],
    },
    "pricing": "\"Billing is calculated per transcribed song. Your request will cost **$0.20** per song. For **$1** you can transcribe **5 songs**.\" (llms.txt)",
    "handoffs_out": [],
    "unverified": [
        "What the ZIP holds for a given input (MusicXML parts, PDF, lyrics; whether there is a guitar part, tablature or MIDI)",
        "Mureka's own terms (https://www.mureka.ai/terms is script-rendered; text not read)",
        "Model and training data",
    ],
    "added": G2,
}
d["tools"] = [t for t in d["tools"] if t["name"] != mureka["name"]] + [mureka]
by[mureka["name"]] = mureka

# ---------------------------------------------------------------- gap 5: Cesure MCP server (new, probed read-only)
NO_AUTH_DRAFT = ["create_score", "import_score", "read_score", "edit_measures", "transpose", "refinger",
                 "undo_last_change", "open_in_cesure"]
cesure = {
    "name": "Cesure MCP server (api.cesure.app/mcp)",
    "kind": "api",
    "what": "Remote MCP server of the Cesure tab editor: writes, imports, reads, edits, transposes and re-fingers tablature drafts and searches a catalog; \"No audio. Turning a recording into a tab happens in the app, from a sound.\" (https://cesure.app/assistants)",
    "url": "https://api.cesure.app/mcp",
    "version": "serverInfo \"cesure\" \"1.0.0\", MCP protocol \"2025-06-18\" (initialize answer, 2026-11-11)",
    "tried": False,
    "tried_how": None,
    "probe": "MCP initialize and tools/list without an account (r0622): protocol answers only, no score processed",
    "runs": [
        {"run_id": "r0622", "input_id": None, "cores": None, "wall_s": 2.46, "peak_mb": 23.4, "exit_code": 0,
         "output_files": ["samples/cesure-mcp/probe.json", "samples/cesure-mcp/tools_list.json"],
         "metrics": {"nolock": True, "initialize_http": 200, "initialized_http": 202, "tools_list_http": 200,
                     "tools": 14, "session_id_returned": False, "oauth_protected_resource_http": 404,
                     "round_trips_s": {"initialize": 0.6, "notifications/initialized": 0.664, "tools/list": 0.493},
                     "tools_call_sent": False}},
    ],
    "not_run_reason": "no tools/call was sent (the gap round asked for a read-only probe), so no draft was created or edited",
    "for_aaron": False,
    "callable_via": ["mcp", "http"],
    "inputs": [
        "create_score: `score`, a .cesure text (version 2 JSON; notes as fret.string or by pitch; \"Strings from 1 (the highest); x as fret mutes.\")",
        "import_score: `score`, \".cesure text, AlphaTex, or Open in Cesure link, verbatim\"",
        "the other draft tools take `draft` (the id a previous tool gave)",
    ],
    "outputs": [
        "a draft id, a summary and a short link that opens the draft in the web app; read_score returns .cesure measures, \"200 at most a call\"; no tool returns the whole score in one answer",
    ],
    "constraints_accepted": [
        "refinger: `mode` auto, standard (\"lowest frets\"), optimized (\"fewest hand moves\"); `searchCapo` (\"lets it choose a capo\")",
        "notes written with their string are kept: \"never moves a note written with its string\" (edit_measures description)",
        "track `tuning` (open strings from string 1) and `capo` (format v2, https://cesure.app/format)",
        "transpose: `semitones` -24 to 24; `notesOffTheNeck` retune_lowest_string (\"4 semitones at most\") or change_octave",
    ],
    "license": {
        "code": None,
        "weights": None,
        "training_data": [],
        "service_terms": [
            {"topic": "Personal use (terms, no date on the page)", "quote": "The app is designed for personal use.", "url": "https://cesure.app/terms", "read": "2026-11-11"},
            {"topic": "Linked assistants", "quote": "What that assistant does with your scores falls under its provider's own terms.", "url": "https://cesure.app/terms", "read": "2026-11-11"},
        ],
    },
    "pricing": None,
    "handoffs_out": [],
    "tools_and_auth": {
        "noauth and oauth2": NO_AUTH_DRAFT,
        "noauth only": ["search_catalog"],
        "oauth2 only": ["list_my_scores", "read_my_score", "save_new_score", "update_my_score", "organize_my_scores"],
    },
    "unverified": [
        "Whether create_score is in fact served without an account: the tools declare noauth, but no tools/call was sent",
    ],
    "added": G2,
}
d["tools"] = [t for t in d["tools"] if t["name"] != cesure["name"]] + [cesure]
by[cesure["name"]] = cesure

out = json.dumps(d, indent=2, ensure_ascii=False) + "\n"
open(path, "w").write(out)
print("tools:", len(d["tools"]))
