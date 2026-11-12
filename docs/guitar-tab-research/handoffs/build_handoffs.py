#!/usr/bin/env python3
"""Build handoffs.json and the generated blocks of HANDOFFS.md from the lanes' tools.json files, the run
ledger and the curated edge list below.

    python3 -I build_handoffs.py

Reads:  lanes/<lane>/tools.json (through count_tools.py), the run ledger (/home/user/gtr/ledger/runs.jsonl,
        or ledger/runs.jsonl.gz in this folder's parent when the box is gone).
Writes: ../handoffs.json, and the text between the "BEGIN GENERATED" and "END GENERATED" markers of
        ../HANDOFFS.md (everything else in HANDOFFS.md is written by hand and left alone).

Stage of a tool: the stage of its lane (guitar-tab -> string and fret assignment, and so on), replaced by
STAGE_OVERRIDES where the tool's own function, as its lane describes it, belongs to another stage (a pointer
entry, a file format, a runtime, an app). A tool used by lanes at several stages sits in one table and is
listed under "also used at this stage" in the others (ALSO_STAGES).

Edges: the EDGES list, written by hand from the lanes' handoffs_out records, the chains lane's trials.md and
the web-tab-render lane's format matrix. "tested" means a run in which the receiving tool read the sending
tool's output (run ids and eval ids given); "docs" means both halves come from documentation or code reading.
"""
import gzip
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import count_tools as C  # noqa: E402

LEDGER_LIVE = "/home/user/gtr/ledger/runs.jsonl"
LEDGER_GZ = os.path.join(DOCS, "ledger", "runs.jsonl.gz")

STAGES = [
    ("input", "Input: audio file, video file, link"),
    ("separation", "Source separation"),
    ("notes", "Notes and melody"),
    ("chords", "Chords, beat, downbeat, tempo, key, tuning"),
    ("tab", "String and fret assignment"),
    ("fingerstyle", "Fingerstyle voices and taps"),
    ("video", "Video hands and fretboard"),
    ("formats", "Tab file formats (readers, writers, converters, desktop editors)"),
    ("render", "Rendering, editing and playback in the browser"),
    ("sync", "Metronome and sync"),
    ("corrections", "User corrections that re-run analysis"),
    ("other", "Not a step of their own: hosts, runtimes, platforms, client libraries, general-purpose models, apps listed without being read"),
]
STAGE_IDX = {k: i for i, (k, _) in enumerate(STAGES)}
STAGE_TITLE = dict(STAGES)
SHORT = {"input": "input", "separation": "separation", "notes": "notes", "chords": "chords/beat/key", "tab": "string+fret",
         "fingerstyle": "voices/taps", "video": "video", "formats": "tab formats", "render": "browser render/play",
         "sync": "metronome/sync", "corrections": "corrections", "other": "hosts/runtimes"}

LANE_DEFAULT = {"source-separation": "separation", "audio-to-notes": "notes", "chords-beats-key": "chords",
                "guitar-tab": "tab", "fingerstyle-voices-taps": "fingerstyle", "video-hands-fretboard": "video",
                "web-tab-render": "render", "browser-audio-sync": "sync", "apps-survey": "other", "hosted-apis": "other"}
LANE_AB = {"source-separation": "ss", "audio-to-notes": "a2n", "chords-beats-key": "cbk", "guitar-tab": "gt",
           "fingerstyle-voices-taps": "fvt", "video-hands-fretboard": "vhf", "web-tab-render": "web",
           "browser-audio-sync": "bas", "apps-survey": "apps", "hosted-apis": "api"}

# id (exact) or unique id prefix -> stage
STAGE_OVERRIDES = {
    "input": ["sox", "yt-dlp", "ffmpeg", "ffmpeg-wasm", "mediabunny", "mp4box-js", "web-demuxer", "libav-js",
              "libavjs-webcodecs-polyfill", "webcodecs", "remotion-media-parser", "remotion-webcodecs", "audio-decode",
              "alexanderolsen-libsamplerate-js", "youtube-terms", "polymap"],
    "separation": ["demucs-web", "demucs-wasm", "demucs-js", "monteslu", "webnn-stem-separator", "ghilda",
                   "spleeter-2-stem-onnx", "musicai-api", "fadr-api", "replicate-ryan5453", "fal-ai-fal-ai-demucs",
                   "hf-space-nakas", "hf-space-akhaliq", "hf-space-lpeterl", "elevenlabs-stem", "soundverse", "ripx-daw",
                   "guitar-string-separation"],
    "notes": ["basic-pitch-for-the-browser", "basic-pitch-onnx-model", "magenta-js", "pitchy", "pitchfinder", "aubiojs",
              "fnaught", "hf-space-hugging-apps-muscriptor", "hf-space-teamup-tech-transkun", "hf-space-hmjz100",
              "hf-space-richhiey", "musicgpt", "pianoconvert", "tencent", "mureka", "klangio-transcription-studio",
              "anthemscore-web", "scorecloud", "midi-guitar", "klangio-siblings"],
    "chords": ["madmom", "beat-this-onnx", "hooktheory-api", "replicate-sakemin", "replicate-triadmusic",
               "hf-space-taejunkim", "chordu", "positive-grid", "fender-studio-jam", "tonal-tonal"],
    "tab": ["klangio-api", "tabtify", "audio2guitar", "tabgenius", "fretwise", "rifftotab", "guitarconvert", "cesure-mcp",
            "notehound", "practice-pro", "fretting-transformer", "a-machine-learning-approach"],
    "video": ["sam2", "taptotab", "guifir", "asmar", "paleari", "synchronize-dual-hands", "mediapipe-studio",
              "guitar-learning", "chordar", "roboflow-hosted", "youtube-guitar-tab-parser", "aapa-autotabs", "grabtab"],
    "formats": ["pyguitarpro", "music21", "musescore", "tuxguitar", "guitar-pro-8", "dadagp", "keyjockey", "kk9293",
                "guitarpro-parser", "apollotab", "score-parser", "guitarpro-rust", "musicbird-gpx-parser",
                "musicbird-gp-parser", "dart-gp", "guitar-pro-api", "tonejs-midi", "power-tab-editor", "slimtab",
                "tuitar", "haya-tab", "holm-asciitabs", "abjad", "chordpro-reference"],
    "render": ["alphatab", "smplr", "spessasynth", "js-synthesizer", "fluidsynth", "webaudiofont", "midiplayerjs", "howler",
               "eztab-mcp", "cesure", "ultimate-guitar", "fingerstylepal", "guitarflow", "expressive-guitar-synthesis",
               "visual-guitar-tab-comparison"],
    "sync": ["web-audio-api", "yousician", "transcribe"],
    "other": ["onnxruntime", "transformers-js", "tensorflow-js", "litert-js", "webgpu", "webnn-web-neural", "cross-origin-isolation",
              "natten", "vamp-python", "libqm-dsp", "vamp-plugin-pack", "vamp-sdk", "sonic-visualiser", "sonic-annotator",
              "audacity", "replicate", "hugging-face-inference-providers", "gradio-client", "wavespeedai",
              "vercel-ai-gateway", "google-gemini", "xiaomi", "meta-muse", "bytedance-seed", "xai-language", "deepseek",
              "openai-audio", "anthropic-claude", "alibaba", "mistral", "amazon-nova", "elevenlabs-speech", "xai-speech",
              "musicai-sdk", "audioshake-pypi", "replicate-python", "fal-client", "elevenlabs-python", "soundsliceapi",
              "ibm-ilog", "itext", "magnjorg", "meyda", "audiomotion-analyzer", "webmidi", "elemaudio-core",
              "elemaudio-web-renderer", "grame-faustwasm", "csound-browser", "rnbo-js", "webaudiomodules-api",
              "node-web-audio-api", "rocksmith", "fender-play", "fender-tune", "gibson-app", "riffstation", "fender-songs",
              "fender-studio-pro-8", "samplab", "beatstorapon"],
}
# Stages, other than a tool's own, at which a lane used or documented it (shown under "also used at this stage").
ALSO_STAGES = {
    "librosa": ["notes", "chords", "fingerstyle"], "madmom": ["notes", "fingerstyle"], "aubio": ["chords", "fingerstyle"],
    "essentia": ["chords", "fingerstyle"], "demucs": ["chords", "fingerstyle"], "open-unmix": ["fingerstyle"],
    "spleeter": ["chords"], "music21": ["chords", "fingerstyle", "tab"], "alphatab": ["formats", "sync"],
    "musescore": ["tab"], "tuxguitar": ["tab"], "guitar-pro-8": ["tab"], "lilypond": ["formats"],
    "qm-vamp": ["fingerstyle"], "omnizart": ["chords", "fingerstyle"], "onsets-frames": ["fingerstyle"],
    "deep-salience": ["fingerstyle"], "klangio-api": ["notes", "chords"], "musicai-api": ["chords"],
    "moises": ["chords", "sync"], "soundslice": ["sync"], "web-audio-beat-detector": ["sync"],
    "realtime-bpm-analyzer": ["sync"], "sam2": ["separation"], "tutts": ["render"], "tart": ["fingerstyle"],
    "strumming-directions": ["fingerstyle"], "anthemscore": ["tab"], "ableton": ["fingerstyle"],
    "klangio-siblings": ["fingerstyle"], "ripx-daw": ["notes"], "transcribe": ["notes"], "beat-this": ["tab"],
    "basic-pitch": ["tab"],
}

CALL = {"python": "Python", "cli": "CLI", "http": "HTTP", "wasm": "WASM", "js-browser": "browser JS",
        "desktop-gui": "desktop", "mobile-app": "phone app", "vamp-plugin": "Vamp plugin", "onnx": "ONNX file", "go": "Go",
        "js-node": "Node.js", "javascript": "JS", "mcp": "MCP"}


def clean(s):
    return " ".join(str(s).split())


def cut(s, n):
    s = clean(s)
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"


def md(s):
    return clean(s).replace("|", "\\|")


# ----------------------------------------------------------------------------------------------- ledger
def load_ledger():
    if os.path.exists(LEDGER_LIVE):
        lines = open(LEDGER_LIVE).read().splitlines()
        src = LEDGER_LIVE
    else:
        lines = gzip.open(LEDGER_GZ, "rt").read().splitlines()
        src = "ledger/runs.jsonl.gz"
    led = {}
    for l in lines:
        if l.strip():
            r = json.loads(l)
            led[r["id"]] = r
    return led, src


CLIP_RX = re.compile(r"/gtr/inputs/([A-Za-z0-9]+)/(?:stems/([A-Za-z_]+)\.wav)?")
LANE_INPUT_RX = re.compile(r"/lanes/[a-z-]+/inputs/([A-Za-z0-9_]+)/")


CLIP_IDS = ["S1", "S2n", "S2s", "S3", "S4", "S5capo2", "S5dropd", "S6taps", "S7flat30", "R1a", "R1b", "R1c", "R2", "R2full",
            "R3a", "R3b", "R3c", "RT1", "R3a_cu", "S4_10s"]


def clips_of(run):
    """Test clips a ledger run read, from its input paths (a clip id as a folder or a file-name stem)."""
    out = []
    for i in run.get("inputs", []):
        p = i.get("path", "")
        m = CLIP_RX.search(p)
        if m:
            c = m.group(1) + (" " + m.group(2) + " stem" if m.group(2) else "")
        else:
            c = None
            for part in reversed(p.split("/")):
                stem = part.split(".")[0]
                if stem in CLIP_IDS or any(stem.startswith(k + "_") for k in CLIP_IDS):
                    c = stem
                    break
        if c and c not in out:
            out.append(c)
    return out


def is_batch(L):
    """A ledger run that covers several jobs: 'batch' in its tool name or label (not 'inside batch', which marks one
    job of a batch with a line of its own), 'N clips' in its label, or a video-lane group job ('group C1: ...')."""
    label = L.get("label", "").lower()
    if "inside batch" in label:
        return False
    return "batch" in L.get("tool", "").lower() or re.search(r"\bbatch\b", label) is not None or \
        re.search(r"\b\d+ clips\b", label) is not None or re.match(r"(verify: )?group [a-z]\d", label) is not None


def is_install(L):
    return re.search(r"pip install|install only|\bbuild\b|uv pip install", L.get("label", "").lower()) is not None


def tool_match(node_id, L):
    """Whether the ledger line's tool field names this tool (a token of four or more letters of its id)."""
    tool = re.sub(r"[^a-z0-9]", "", L.get("tool", "").lower())
    return any(len(tok) >= 4 and tok in tool for tok in node_id.split("-"))


# runs to show for tools whose first-choice ledger line is not a run of the tool on a clip
WHERE_PREFER = {}
# where-it-ran text written by hand, from the lane's own record, where the ledger line alone would mislead
WHERE_TEXT = {"vercel-ai-gateway": "API: the route of the MiMo, Muse Spark and Seed rows (r0024, r0028, r0086 and others); "
                                   "its Google models were refused with HTTP 403 (r0022, r0023)",
              # verification pass 2026-11-12: the two rows below were corrected from the lanes' run records
              "webgpu": "not run; steps for Aaron (bas): no WebGPU adapter in headless Chromium (requestAdapter() returned "
                        "null in the environment probes r0042 and r0050; r0313 skipped its WebGPU section)",
              "ipt-libipt-ipt-vamp-plugin-with-eguitar-ircam-ts": "here (the eguitar_ircam.ts model only, through "
                        "torch.jit.load; ipt~, libipt and the Vamp plugin were not run): 3 inputs (S6taps …), 13.4 s, 2 cores, r0643"}
# code-licence cells written by hand where the lane's SPDX field says more than its survey supports (verification pass)
CODE_LICENCE_TEXT = {
    "libkeyfinder-and-keyfinder-cli": "GPL-3.0-or-later for libkeyfinder (README: 'version 3 or later'); keyfinder-cli: "
                                      "its LICENSE is the GPL v3 text, 'or later' UNVERIFIED (a source-file notice would settle it)",
    "hf-space-hmjz100-mt3": "the Space's code was not read; magenta/mt3, which the Space is named after: Apache-2.0",
}


def label_clips(L):
    label = L.get("label", "")
    return [c for c in CLIP_IDS if re.search(r"(?<![A-Za-z0-9])" + re.escape(c) + r"(?![A-Za-z0-9])", label)]


# ----------------------------------------------------------------------------------------------- nodes
def resolve_prefix(ids, key):
    if key in ids:
        return key
    hits = [i for i in ids if i.startswith(key)]
    if len(hits) != 1:
        raise SystemExit(f"prefix {key!r} matches {len(hits)} ids: {hits[:5]}")
    return hits[0]


def main_entry(g):
    def score(e):
        t = e["tool"]
        return (C.ran_here(t) or C.ran_elsewhere(t), len(t.get("runs") or []), len(t.get("outputs") or []),
                len(t.get("inputs") or []), len(t.get("what") or ""))
    return max(g["entries"], key=score)


REASONS = [
    (("pointer", "covered by the", "belongs to the", "context only", "see the apps-survey", "named in the handoff facts",
      "covered in lanes/", "not covered in this lane", "in-browser analysis belongs", "covers it",
      "is the web-tab-render lane", "by the web-tab-render lane", "lane covers"), "pointer to another lane"),
    (("a file format, not a program",), "a file format"),
    (("permission system", "permission for this action", "auto mode classifier"), "refused by the session's permission system"),
    (("no-code", "no code", "paper only", "no repository link", "no code link", "research paper", "code not available",
      "placeholder", "linked repository empty", "no product, app or code"), "no code found"),
    (("no weights", "no released weights", "weights published: no", "weights published: none", "no trained weights",
      "no checkpoints", "no published checkpoint", "no pretrained", "weights are not included", "model are not in",
      "trained models are not"), "no weights found"),
    (("needs-account", "api token", "api key", "no account", "key store", "credits", "account needed",
      "needs an account", "needs a key"), "needs an account or key"),
    (("repackaging",), "repackages a tool run here"),
    (("ran only as", "not run on its own", "ran inside"), "ran only inside another tool"),
    (("time available", "lack of time", "for time", "not reached", "not attempted", "to keep the cpu slots"), "not reached in the time"),
    (("not surveyed", "not examined", "survey only", "not covered", "search results only", "not read", "not researched",
      "npm search", "no trial recorded", "not checked", "looked at only as far as", "via msst", "newer architecture",
      "named as a vamp host", "only pointed to", "listed in survey.md as one line", "added by the verification pass",
      "no run recorded", "no run of it is recorded", "not run (survey.md)"), "survey listing only"),
    (("no reason recorded", "no reason beyond"), "no reason recorded"),
    (("no gpu", "gpu"), "needs a GPU (or WebGPU)"),
    (("desktop install", "desktop app", "gui step", "windows and macos", "macos or windows", "apple devices",
      "no linux"), "desktop app"),
    (("phone app", "ios app", "mobile app", "coming soon"), "phone app"),
    (("web service",), "web service"),
    (("disk",), "disk space"),
]


def short_reason(r):
    if not r:
        return "no reason recorded"
    t = r.lower()
    for keys, label in REASONS:
        if any(k in t for k in keys):
            return label
    return cut(r, 70)


def build_nodes(tools, led):
    ids = [g["id"] for g in tools]
    stage_of = {}
    for stage, keys in STAGE_OVERRIDES.items():
        for k in keys:
            stage_of[resolve_prefix(ids, k)] = stage
    also = {resolve_prefix(ids, k): v for k, v in ALSO_STAGES.items()}
    nodes = []
    for g in tools:
        me = main_entry(g)
        t = me["tool"]
        kind = t.get("kind")
        if g["id"] in stage_of:
            stage = stage_of[g["id"]]
        elif kind == "file-format":
            stage = "formats"
        else:
            stage = LANE_DEFAULT[g["lanes"][0]]
        calls = []
        for e in g["entries"]:
            for c in e["tool"].get("callable_via") or []:
                c = "python" if c.startswith("python") else c
                if c not in calls:
                    calls.append(c)
        spdx = []
        for e in g["entries"]:
            code = e["tool"]["license"].get("code")
            if isinstance(code, dict) and code.get("spdx") and code["spdx"] not in spdx:
                spdx.append(code["spdx"])
        w = t["license"].get("weights")
        if not isinstance(w, dict):
            wtxt = "—"
        elif w.get("spdx"):
            wtxt = w["spdx"]
        elif w.get("quote"):
            wtxt = '"' + cut(w["quote"], 48) + '"'
        else:
            wtxt = "none quoted"
        node = {
            "id": g["id"], "name": g["name"], "stage": stage, "lane": me["lane"], "lanes": g["lanes"],
            "status": g["status"], "callable_via": calls, "also_stages": [s for s in also.get(g["id"], []) if s != stage],
            "also_for_aaron": g["also_for_aaron"], "kind": kind,
            "_input": (t.get("inputs") or [""])[0] or "", "_output": "; ".join((t.get("outputs") or [])[:2]),
            "_code": CODE_LICENCE_TEXT.get(g["id"]) or ("; ".join(spdx) if spdx else "—"), "_weights": wtxt,
            "_where": where_ran(g, led),
            "_reason_full": t.get("not_run_reason") or "",
        }
        nodes.append(node)
    return nodes


def where_ran(g, led):
    status = g["status"]
    if g["id"] in WHERE_TEXT:
        return WHERE_TEXT[g["id"]]
    if status in ("ran-here", "ran-elsewhere"):
        want_here = status == "ran-here"
        cands = []
        for order, e in enumerate(g["entries"]):
            t = e["tool"]
            ok = C.ran_here(t) if want_here else C.ran_elsewhere(t)
            if not ok:
                continue
            for r in t.get("runs") or []:
                rid = r.get("run_id")
                L = led.get(rid)
                if not L:
                    continue
                cl = clips_of(L)
                score = (rid == WHERE_PREFER.get(g["id"]), L.get("exit_code") == 0, not is_install(L), tool_match(g["id"], L),
                         not is_batch(L), len(cl) > 0, L.get("n_cores") == 2, len(cl) == 1, -order)
                cands.append((score, rid, L, cl, t.get("tried_how") or ""))
        if not cands:
            return "ran (no ledger line found)"
        cands.sort(key=lambda x: x[0], reverse=True)
        score, rid, L, cl, how = cands[0]
        lc = label_clips(L)
        if len(lc) > len(cl):
            cl = lc
        if is_batch(L):
            m = re.search(r"\b(\d+) clips\b", L.get("label", ""))
            clip = f"batch of {m.group(1)} clips" if m else "batch run"
        elif len(cl) == 1:
            clip = cl[0]
        elif cl:
            clip = f"{len(cl)} inputs ({cl[0]} …)"
        else:
            clip = "no test-clip file among the ledger inputs"
        lab = L.get("label", "").lower()
        cores = "2 cores" if L.get("n_cores") == 2 else ("4 cores" if L.get("n_cores") == 4 else
                                                         ("2-core slot of a batch" if "2-core slot" in lab else "not pinned"))
        exit_note = "" if L.get("exit_code") == 0 else f", exit {L.get('exit_code')}"
        if want_here:
            where = "here (headless Chromium)" if "chromium" in lab else "here"
            if is_install(L):
                return f"installed or built here ({L['wall_s']:.1f} s, {cores}, {rid}); no ledger run of its own on a clip"
            return f"{where}: {clip}, {L['wall_s']:.1f} s, {cores}, {rid}{exit_note}"
        kind = "public Space" if "public-space" in how else "API"
        return f"{kind}: {clip}, {L['wall_s']:.1f} s wall, {rid}{exit_note}"
    me = main_entry(g)
    reason = short_reason(me["tool"].get("not_run_reason"))
    if status == "for-aaron":
        lanes = ", ".join(LANE_AB[l] for l in g["lanes"] if any(e["tool"].get("for_aaron") for e in g["entries"] if e["lane"] == l))
        return f"not run; steps for Aaron ({lanes}): {reason}"
    return f"not run: {reason}"


# ----------------------------------------------------------------------------------------------- edges
EDGES = []


def E(frm, to, out, inp, glue, typ, ev, kind="data", joint=None):
    """kind: data (X's output handed to Y), target-runs-source (Y runs X itself), source-runs-target (X runs Y
    itself), join (two outputs lined up by time), format-read (Y read a file in format X), format-write (X wrote
    format Y)."""
    EDGES.append({"from": frm, "to": to, "out": out, "inp": inp, "glue": glue, "type": typ, "evidence": ev,
                  "kind": kind, "joint": joint})


A = "lanes/apps-survey/survey.md Handoff facts"
H = "lanes/hosted-apis/tools.json handoffs_out"
KLANGIO_IN = "https://api-docs.klang.io/docs/getting-started/basic-job-workflow"
KLANGIO_GLUE = "Klangio's docs list no accepted audio formats (UNVERIFIED which stem files it takes; one call per format would settle it)"
BAS = "lanes/browser-audio-sync/survey.md Handoff fact "
SS = "lanes/source-separation/survey.md Handoff facts"
VHF = "lanes/video-hands-fretboard/survey.md Handoff fact "
GT = "lanes/guitar-tab/survey.md Handoff facts"
FVT = "lanes/fingerstyle-voices-taps/survey.md Handoff "
WEB = "lanes/web-tab-render/trials.md Format matrix"
CH = "lanes/chains/trials.md"

# --- input -> next stages
E("yt-dlp", "klangio-api", "an audio-only file (`-x, --extract-audio`; WAV in r0126)", "the multipart `file` of POST /transcription",
  KLANGIO_GLUE, "docs", ["yt-dlp README", KLANGIO_IN, "r0126 tested the yt-dlp half only"])
E("yt-dlp", "lalal", "an audio-only file", "an upload as application/octet-stream, up to 10 GB", "none documented", "docs",
  ["yt-dlp README", "https://www.lalal.ai/api/v1/openapi.json"])
E("yt-dlp", "mvsep", "an audio-only file", "the `audiofile` field", "none documented", "docs", ["yt-dlp README", "https://mvsep.com/full_api"])
E("sox", "basic-pitch", "a WAV, 44.1 kHz, 2 channels, 16-bit, shifted +30 cents (`sox S7flat30.wav S7flat30.plus30c.wav pitch 30`)",
  "an audio file path", "none; the shift stands in for a 'the guitar is 30 cents flat' correction, since Basic Pitch has no tuning input",
  "tested", ["r0319: Basic Pitch read `inputs/S7flat30.plus30c.wav` (SHA-256 31f6f3a9…), a SoX output made on 2026-11-10 without a ledger line (e1203)",
             "r0602: the same SoX command re-run with a ledger line; its output (SHA-256 4f54aac7…) differs from that file by at most 2 in "
             "16-bit sample units (SoX's default dither)", "lanes/audio-to-notes/trials.md (gap round 2, A2)"])
E("mediabunny", "mediapipe-hand", "decoded video samples: `VideoSample.toVideoFrame()` (a WebCodecs VideoFrame) and `timestamp` in seconds",
  "`detectForVideo(videoFrame, timestampMs)` in runningMode VIDEO", "`Math.round(timestamp * 1000)`", "tested",
  ["r0314, r0329 (headless Chromium, R3 clips)", BAS + "10"])
E("webcodecs", "mediapipe-hand", "a VideoFrame, timestamp in microseconds", "`detectForVideo(videoFrame, timestampMs)` (VideoFrame is a TexImageSource)",
  "timestamp / 1000, documented only (Handoff fact 10); the runs timed each frame with Mediabunny's `timestamp` in seconds instead, "
  "`Math.round(s.timestamp * 1000)`", "tested",
  ["r0314, r0329: a VideoFrame made by Mediabunny's `toVideoFrame()` was accepted by `detectForVideo` (WebCodecs reached through "
   "Mediabunny: the same runs as Mediabunny's edge; `lanes/browser-audio-sync/scripts/pages/mediapipe.html`)", BAS + "10"])
E("yt-dlp", "ffmpeg", "the stream of the chosen format and the requested section",
  "the input of the section download (`--download-sections`) and of the WAV conversion (`-x --audio-format wav`)",
  "called by yt-dlp itself ('-x, --extract-audio ... (requires ffmpeg and ffprobe)', yt-dlp README)", "tested",
  ["r0126 (211.61 KiB fetched, 'only the section, through ffmpeg'; a WAV, 48 kHz mono)", "r0323 (verifier re-run, byte-identical WAV)",
   "lanes/hosted-apis/trials.md (yt-dlp; 'ffmpeg 6.1.1 (box)', gap H2)"], kind="source-runs-target")
for dst, runs in (("xiaomi-mimo", ["r0107 (R3a)", "verifier r0360 (R3b) and r0391 (R3c), frames made with the same command"]),
                  ("bytedance-seed", ["r0127 (R3a)"]), ("meta-muse-spark", ["r0129 (R3a)"])):
    E("ffmpeg", dst, "18 JPEG frames at 1 fps (`ffmpeg -vf fps=1 -q:v 3`)",
      "`image_url` parts of one chat request through the Vercel AI Gateway, each after a text label 'Frame at t = <k>.0 s:'",
      "no audio goes in this way; the R3a frames were made without a ledger line and re-made byte-identical in r0600", "tested",
      runs + ["lanes/hosted-apis/trials.md trial (c), 'As still frames instead'"], joint=("input", "other"))
WA_DEC = "an AudioBuffer from `decodeAudioData` in an OfflineAudioContext at 44.1 kHz ('which resamples to its own rate', trials.md)"
E("web-audio-api", "basic-pitch-for-the-browser", WA_DEC + ", rendered through an `OfflineAudioContext(1, n, 22050)`: mono, 22,050 Hz",
  "`evaluateModel` on a mono 22,050 Hz AudioBuffer", "the downmix and the resampling are the browser's (the render)", "tested",
  ["r0270 (S1, S2n)", "r0451 (verifier re-run on S1)", "lanes/browser-audio-sync/trials.md (Basic Pitch, input handling); `scripts/pages/basicpitch.html`"],
  joint=("input", "notes"))
E("web-audio-api", "essentia-js", WA_DEC, "`arrayToVector` of a mono Float32Array (RhythmExtractor2013, KeyExtractor, TonalExtractor)",
  "the channels averaged to mono by the page's own loop", "tested", ["r0314 (S3, S4, S1)", "`lanes/browser-audio-sync/scripts/pages/essentia.html`"],
  joint=("input", "chords"))
E("web-audio-api", "demucs-web", "an AudioBuffer from `decodeAudioData` in an `OfflineAudioContext(2, 1, 44100)`",
  "`separate(left, right)`: two Float32Arrays at 44.1 kHz", "`getChannelData(0)` and `getChannelData(1)`", "tested",
  ["r0329 (S4_10s)", "`lanes/browser-audio-sync/scripts/pages/demucs.html`"], joint=("input", "separation"))
E("htmlvideoelement", "mediapipe-hand", "`metadata.mediaTime` (seconds) for each presented frame", "`detectForVideo(frame, timestampMs)` with monotonic timestamps",
  "`timestampMs = mediaTime * 1000`", "docs", [BAS + "9"])
for src in ("mediabunny", "webcodecs"):
    E(src, "basic-pitch-for-the-browser", "WebCodecs AudioData, samples as a Float32Array through `copyTo`",
      "`evaluateModel` on mono 22,050 Hz samples (it throws 'Input audio buffer is not at correct sample rate!' or '... not mono!')",
      "downmix to mono and resample to 22,050 Hz", "docs", [BAS + "12", BAS + "13"])
E("ffmpeg-wasm", "basic-pitch-for-the-browser", "`exec([... '-ac', '1', '-ar', '22050' ...])` writes a mono 22,050 Hz audio file into its in-memory file system",
  "`evaluateModel` on a mono 22,050 Hz AudioBuffer",
  "the two flags convert; `readFile` then returns the file's bytes, which still have to become a mono 22,050 Hz AudioBuffer "
  "(`decodeAudioData` resamples to its context's rate, `lanes/browser-audio-sync/trials.md`); the lane's ffmpeg.wasm page wrote a WAV at "
  "the input's rate and fed no transcriber (`scripts/pages/ffmpegwasm.html`)", "docs", [BAS + "12"])

# --- source separation -> notes
E("demucs", "basic-pitch", "htdemucs_6s: six WAVs `drums bass other vocals guitar piano`.wav, PCM_16, stereo, 44.1 kHz",
  "an audio file path; Basic Pitch loads it with librosa at 22,050 Hz mono itself",
  "the stem is picked by file name (`guitar.wav`); the 4-stem htdemucs has no guitar stem (it put 0.961 of S6taps' energy in `other`), "
  "and on the solo-guitar S2s and S6taps htdemucs_6s put 0.826 and 0.623 of the energy in `piano`",
  "tested", ["r0021 + r0054 -> r0243 (S4, S6taps; e0652: 233 of 369 S4 guitar notes matched)", "r0428 -> r0511 (R2, chains lane)",
             "lanes/fingerstyle-voices-taps/trials.md (energy shares)"])
E("becruily-mel-band-roformer-guitar", "basic-pitch", "one WAV `Guitar.wav` (capital G), float32 stereo, the model's only target (run through MSST `msst-inference`)",
  "an audio file path", "the guitar file is picked by a per-tool name rule (`Guitar.wav` here, `guitar.wav` for Demucs); MSST needs an input folder, a config and a checkpoint",
  "tested", ["r0491 -> r0511 (S4; e1447: 229 of 369)", CH + " chain A"])
E("python-audio-separator", "basic-pitch", "one file per stem, FLAC by default from the CLI and WAV by default from the Python `Separator`; `separate()` returns the written paths; `--single_stem Guitar` with htdemucs_6s.yaml or BS-Roformer-SW.ckpt",
  "a .flac or .wav path", "none documented", "docs", [SS, "https://raw.githubusercontent.com/spotify/basic-pitch/main/README.md"])
E("audiosep", "basic-pitch", "one mono 16-bit WAV at 32 kHz", "a .wav path", "none documented", "docs", [SS, "Basic Pitch README"])
E("demucs", "crepe", "stereo 44.1 kHz WAV stems", "a WAV file, resampled to 16 kHz", "CREPE is a monophonic pitch tracker", "docs",
  ["lanes/audio-to-notes/tools.json (Demucs handoffs_out)", "CREPE README"])
E("demucs", "swiftf0", "stereo 44.1 kHz WAV stems", "`detect_file`: WAV, FLAC, OGG, MP3, AIFF; mixed to mono and resampled to 16 kHz", "none documented", "docs",
  ["lanes/audio-to-notes/tools.json (Demucs handoffs_out)", "SwiftF0 README"])
E("demucs", "game-generative", "`vocals.wav`", "dirty or separated voice (GAME README)", "none documented", "docs", ["lanes/audio-to-notes/tools.json (Demucs handoffs_out)"])
E("demucs", "some-openvpi", "`vocals.wav`", "`python infer.py --model CKPT_PATH --wav WAV_PATH`", "none documented", "docs",
  ["lanes/audio-to-notes/tools.json (Demucs handoffs_out)", "SOME README"])
ELEVEN_TIMING = ("the stems arrive inside a ZIP; decoded with ffmpeg 6.1.1 each starts 1,105 samples (25.06 ms) late and is 2,225 samples "
                 "longer than S4, so it is trimmed by 1,105 samples (or its times shifted by -25.06 ms) before it is lined up with the mix or "
                 "another stream")
E("elevenlabs-stem", "yourmt3", "`guitar.mp3` of six_stems_v1 (MP3 192 kb/s, 44.1 kHz, stereo, 38.79 s)",
  "an audio upload to `/process_audio` of the Space mimbres/YourMT3-cpu",
  "the MIDI comes back inside HTML as a `data:audio/midi;base64,` URL and is cut out; " + ELEVEN_TIMING +
  ": YourMT3's matched onsets came out a median 23.4 ms late (e0522) and -1.7 ms after a 25.057 ms shift (e0525)",
  "tested", ["r0064 -> r0231 (S4: 516 notes, 334 of 369 truth guitar notes, e0522)",
             "lanes/hosted-apis/trials.md ('Timing of the stems', 'Output format facts, for handoffs')"])
E("demucs-web", "basic-pitch-for-the-browser", "four stems as `{ left: Float32Array, right: Float32Array }` (stereo 44.1 kHz)",
  "mono 22,050 Hz samples", "downmix and resample; the 4-stem model has no guitar stem", "docs", [BAS + "14"])
E("demucs-rs", "basic-pitch-for-the-browser", "stems as Float32Array (the 6-stem model adds a guitar stem)", "mono 22,050 Hz samples",
  "downmix and resample", "docs", [BAS + "14"])
E("stemsplit-demucs-onnx", "basic-pitch-for-the-browser", "the guitar row of the 6-stem output, a Float32Array at 44.1 kHz",
  "mono 22,050 Hz samples",
  "the graph takes and returns fixed 7.8 s segments, `(1, 2, 343980)` in and `(1, 6, 2, 343980)` out: longer audio is cut into "
  "343,980-sample segments joined by overlap-add (`infer.py` `separate`, overlap a quarter segment); then row 4 (guitar) is taken, "
  "downmixed and resampled to 22,050 Hz", "docs", ["lanes/browser-audio-sync/survey.md section 55 (not run as a pipeline)"])
# result lifetimes of the hosted services (lanes/hosted-apis/survey.md Handoff facts, 'Result lifetimes that bound such chains')
LIFE = {"musicai-api": "Music.AI keeps pay-as-you-go results in '48h temporary storage'",
        "lalal": "LALAL.AI: 'A task stays here for 24 hours after it finishes'",
        "audioshake": "AudioShake's output download links 'expire after one hour'",
        "klangio-api": "Klangio: 'Results will be available for 14 days'"}
LIFE_EV = "lanes/hosted-apis/survey.md Handoff facts (result lifetimes)"
for src, out in [("musicai-api", "`acoustic_guitar` / `electric_guitar` and `rhythm_guitars` / `solo_guitars` stems"),
                 ("lalal", "`guitar` / `electric_guitar` / `acoustic_guitar` stems (mp3, wav, flac, aac, ogg)"),
                 ("audioshake", "`guitar` / `guitar_electric` / `guitar_acoustic` stems (wav, mp3, flac, aiff, mp4)"),
                 ("fadr-api", "electric and acoustic guitar stems (`melodic-stem`)"),
                 ("mvsep", "guitar stems of sep_type 31 / 66 / 81 / 101 (mp3, wav, flac, m4a)"),
                 ("fal-ai-fal-ai-demucs", "the `guitar` stem of htdemucs_6s (wav or mp3)"),
                 ("elevenlabs-stem", "`guitar.mp3` of six_stems_v1 (r0064)"),
                 ("stemsplit-api", "the `SIX_STEMS` guitar stem")]:
    extra = LIFE.get(src) or (ELEVEN_TIMING if src == "elevenlabs-stem" else None)
    E(src, "klangio-api", out, "the multipart `file` of /transcription?model=guitar", KLANGIO_GLUE + ("; " + extra if extra else ""), "docs",
      [H, KLANGIO_IN] + ([LIFE_EV] if src in LIFE else []) + (["lanes/hosted-apis/trials.md ('Timing of the stems')"] if src == "elevenlabs-stem" else []))
MOISES_FMT = "Moises's stem download file format was not read: UNVERIFIED (apps fact 11)"
E("moises", "klangio-guitar2tabs", "an isolated guitar stem (audio)", "an audio upload (.wav, .mp3, .flac ...)",
  "Guitar2Tabs' store page warns of bad results when several instruments play; " + MOISES_FMT, "docs",
  [A + " line 11", "https://klang.io/help/file-limitations/"])
E("moises", "songsterr", "an isolated guitar stem (audio)", "'upload an audio file' (Songsterr help)", MOISES_FMT, "docs",
  [A + " line 11", "https://www.songsterr.com/help"])

# --- separation -> separation (hosted chains)
for dst, inp, url in [("musicai-api", "a job's `inputUrl`", "https://music.ai/docs/api/reference/"),
                      ("fal-ai-fal-ai-demucs", "`audio_url`", "https://fal.ai/models/fal-ai/demucs/llms.txt"),
                      ("mvsep", "`url` with `remote_type` direct", "https://mvsep.com/full_api"),
                      ("replicate", "an HTTP or data URL", "https://api.replicate.com/openapi.json")]:
    E("audioshake", dst, "a per-target download link ('Output download links expire after one hour.')", inp, "the link expires after one hour",
      "docs", [H, "https://developer.audioshake.ai/quickstart.md", url])
E("demucs", "banquet", "a guitar stem file", "`inference_byoq --query_path=...` (resampled to 44.1 kHz, cut or tiled to 10 s)", "none documented",
  "docs", [SS])

# --- separation -> fingerstyle (taps)
E("demucs", "librosa", "`drums.wav` of htdemucs / htdemucs_6s (PCM_16, stereo, 44.1 kHz)", "`librosa.load` as mono, then `onset.onset_detect(units='time')`",
  "the stem is loaded as mono; S6taps' taps are General MIDI drum hits, not hands on a guitar body", "tested",
  ["r0404 (verifier re-run through gtr-run; the lane's own onset run was not timed)",
   "htdemucs_6s drums: 32 onsets, 32 of 32 taps (e0171 fingerstyle lane, e0928 source-separation lane)",
   "4-stem htdemucs drums: 34 onsets, 31 of 32 taps, precision 0.912 (e0173, e0919)",
   "RT1 (no truth): Demucs r0554 (htdemucs_6s) and r0556 (htdemucs), librosa onsets on their drums stems r0557 (351 and 1,078 onsets), "
   "verifier re-run of r0554 r0571"], joint=("separation", "fingerstyle"))
E("open-unmix", "librosa", "`drums.wav` of umxhq", "`onset.onset_detect` on the stem loaded as mono", "as above", "tested",
  ["r0404", "e0934 (82 onsets; 32 of 32 taps, precision 0.390)"], joint=("separation", "fingerstyle"))
E("spleeter", "librosa", "`drums.wav` of the 4stems model", "`onset.onset_detect` on the stem loaded as mono", "as above", "tested",
  ["e1397 (75 onsets; 32 of 32 taps, precision 0.427); the onset step has no run-ledger line"], joint=("separation", "fingerstyle"))
E("scnet", "librosa", "`drums.wav` of SCNet (MUSDB18 small)", "`onset.onset_detect` on the stem loaded as mono", "as above", "tested",
  ["e1595 (47 onsets; 32 of 32 taps, precision 0.681); the onset step has no run-ledger line"], joint=("separation", "fingerstyle"))
for dst in ("larsnet", "drumsep"):
    E("demucs", dst, "the htdemucs_6s drums stem of S6taps", "a drum-mixture WAV for drum-part separation", "none documented", "docs",
      ["lanes/fingerstyle-voices-taps/for-aaron.md lists 9 and 10"], joint=("separation", "fingerstyle"))

# --- built-in chains (one tool calls another itself)
E("demucs", "allin1", "htdemucs stems (bass, drums, other, vocals)", "All-In-One's own demix step (`python -m demucs.separate --name htdemucs`) before its networks",
  "called by All-In-One itself", "tested", ["r0521, r0563, r0576 (All-In-One runs, each with its htdemucs step)", "lanes/chords-beats-key/trials.md (All-In-One 1.1.0)"],
  kind="target-runs-source")
E("madmom", "allin1", "spectrograms of the four stems", "the input of All-In-One's 8 networks", "called by All-In-One itself", "tested",
  ["r0521", "lanes/chords-beats-key/trials.md (All-In-One 1.1.0)"], kind="target-runs-source")
E("spleeter", "beat-transformer", "Spleeter stems", "Beat Transformer's `preprocessing/demixing.py`", "called by Beat Transformer itself", "docs",
  ["Beat-Transformer README (lanes/chords-beats-key/tools.json)"], kind="target-runs-source")
E("madmom", "beatnet", "`DBNDownBeatTrackingProcessor(beats_per_bar=[2, 3, 4], fps=50)`", "BeatNet's offline mode decodes its activations with madmom's DBN",
  "called by BeatNet itself", "tested", ["r0361", "lanes/chords-beats-key/trials.md (BeatNet 1.1.3)"], kind="target-runs-source")
E("madmom", "beat-this", "the DBN with madmom's default parameters", "`--dbn` post-processing", "called by Beat This! itself", "docs",
  ["Beat This! README (lanes/chords-beats-key/tools.json)"], kind="target-runs-source")
E("chordino", "autochord", "NNLS Chroma output `bothchroma` (24 bins: bass and treble chromagram)",
  "autochord's Bi-LSTM-CRF input, via `vamp.collect(..., 'nnls-chroma:nnls-chroma', output='bothchroma')`", "called by autochord itself", "tested",
  ["r0337 (autochord on 9 clips)", "NNLSChroma.cpp lines 167-173; autochord/__init__.py lines 97-98 (lanes/chords-beats-key/tools.json)"], kind="target-runs-source")
E("chord-extractor", "chordino", "the decoded audio (or a MIDI file rendered to audio by timidity, documented only)", "the Chordino Vamp plugin through vamp 1.1.0",
  "chord-extractor is the Python host", "tested", ["r0215 (13 clips, audio input)", "chord-extractor README (the timidity route)"], kind="source-runs-target")
E("madmom", "crepe-notes", "`CNNOnsetProcessor` onsets", "repeated-note splitting inside CREPE Notes (off with `--disable-splitting`)",
  "called by CREPE Notes itself", "tested", ["r0616 (log: 'Running onset detection...')"], kind="target-runs-source", joint=("notes", "notes"))
for src, flag in (("pesto", "pesto"), ("penn", "penn")):
    E(src, "crepe-notes", "f0 per frame (run by CREPE Notes)", f"`--pitch-tracker {flag}`", "called by CREPE Notes itself", "docs",
      ["CREPE Notes README (lanes/audio-to-notes/tools.json)"], kind="target-runs-source")
E("basic-pitch", "guitartab-hsu", "MIDI notes", "GuitarTab runs Basic Pitch first for audio input", "the GuitarTab model needs a checkpoint the user trains",
  "docs", [GT + " 6"], kind="target-runs-source")
E("beat-this", "guitab", "beat activations", "Guitab's beat grid ('the beats come from the Beat This! activation together with the model's own onset probabilities'); `--tempo 90` replaces it",
  "called by Guitab itself", "docs", [GT + " 10"], kind="target-runs-source")
E("muscriptor-kyutai", "musescore", "score.mid and score.musicxml", "`--format sheets` (PDF scores and a tablature PDF) needs MuseScore 4 or newer",
  "called by MuScriptor itself", "docs", ["MuScriptor README (lanes/audio-to-notes/tools.json)"], kind="source-runs-target")
E("guitab", "alphatab", "gp5", "Guitab's local web app shows its tab 'in an alphaTab viewer with playback ... metronome, count-in, loop'",
  "used by Guitab's own web app", "docs", [GT + " 7, 10"], kind="source-runs-target")

# --- notes -> notes (pitch contour to note events)
E("torchcrepe", "essentia", "f0 in Hz on a 10 ms grid (frames with periodicity below 0.21 set to 0 Hz)",
  "`PitchContourSegmentation` pitch contour [Hz] plus the signal (hopSize=441, sampleRate=44100)",
  "notes with a NaN MIDI pitch dropped (the first attempt, r0338, exited 1)", "tested", ["r0341 (e1324-e1326)"])
E("pesto", "essentia", "f0 in Hz on a 10 ms grid, every frame voiced", "`PitchContourSegmentation` as above", "as above", "tested", ["r0341 (e1321-e1323)"])
E("fcpe", "essentia", "f0 in Hz on a 10 ms grid, 0 Hz for unvoiced frames", "`PitchContourSegmentation` as above", "as above", "tested",
  ["r0341 (e1318-e1320)"])
E("crepe", "essentia", "`<name>.f0.csv`: time, frequency, confidence (10 ms)", "`PitchContourSegmentation` pitch contour [Hz]", "none documented", "docs",
  ["lanes/audio-to-notes/survey.md Handoff facts", "Essentia algorithm reference"])
E("swiftf0", "essentia", "PitchResult: timestamps, pitch_hz, confidence, loudness_db (frames 16 ms apart in r0321)",
  "`PitchContourSegmentation` pitch contour [Hz] with a hopSize", "none documented; r0341 passed the 10 ms contours with "
  "`hopSize=441, sampleRate=44100` (10 ms)", "docs", ["lanes/audio-to-notes/survey.md Handoff facts", "lanes/audio-to-notes/trials.md (r0321, r0341)"])
E("librosa", "essentia", "pYIN f0 per frame in Hz (23.2 ms frames in r0321: hop 512 at 22,050 Hz)", "`PitchContourSegmentation` pitch contour [Hz] with a hopSize",
  "none documented; r0341 passed the 10 ms contours with `hopSize=441, sampleRate=44100` (10 ms)", "docs",
  ["lanes/audio-to-notes/survey.md Handoff facts", "lanes/audio-to-notes/trials.md (r0321, r0341)"], joint=("notes", "notes"))
E("torchcrepe", "crepe-notes", "f0 CSV `time_s,frequency_hz,confidence` (10 ms)", "`--f0 <path>`: a CSV read with `np.genfromtxt(names=True)`, columns frequency and confidence",
  "the header renamed to `time,frequency,confidence`; values unchanged", "tested", ["r0616 (e1781-e1791)"])
E("crepe", "crepe-notes", "`<name>.f0.csv` with header time,frequency,confidence", "`--f0 <path>`, or the file found next to the audio", "none", "docs",
  ["crepe_notes/cli.py at 5390b17 (lanes/audio-to-notes/tools.json)"])

# --- notes -> chords (key)
E("basic-pitch", "music21", "MIDI: type 1, 220 ticks per quarter, one tempo of 120 BPM (a fixed default)",
  "`music21.converter.parse` of a .mid; `Stream.analyze('key')` returns a key.Key", "none", "tested",
  ["r0237 (key analysis of r0234's MIDI, chords-beats-key lane)"], joint=("notes", "chords"))

# --- notes -> string and fret assignment
BPMIDI = ("MIDI: type 1, 220 ticks per quarter, one tempo of 120 BPM (a fixed default, not the song's), velocity-0 note-ons as note-offs; "
          "pitch bends only for notes that overlap no other note (139 messages in r0243's S4 file, none in r0511's four; r0589, r0590), "
          "bend values for every note in the note-events CSV")
TUTTUT_OUT = ("its own JSON (`Tab.to_json`: measures of events with `time` in seconds, each note with `degree`, `octave`, a 0-based `string` "
              "counted from the thinnest and `fret`) and an ASCII tab (`Tab.to_ascii`); the lane's `run_tuttut.py` flattens the JSON to "
              "onset, pitch, string (index + 1) and fret")
E("basic-pitch", "tuttut", BPMIDI, "a MIDI file read with pretty_midi; all non-drum notes pooled",
  "merged to one track (`merge_midi.py`); tuttut moves out-of-range notes by octaves and leaves out notes of chords it cannot finger; it writes " + TUTTUT_OUT,
  "tested", ["r0240 (8 clips; e0646-e0743)", "r0301 (R3a), r0479 (R3b, R3c)", "r0514 (S4 stems, R2; e1450, e1452)", "r0528 (Drop D, e1511)"])
TUTTS_GLUE = ("`run_tutts.py` gives tutts `startBeats` and `durationBeats` = MIDI ticks / ticks per quarter at the file's tempo, so a 'beat' "
              "is a quarter note of the MIDI's 120 BPM placeholder (0.5 s), not a beat of the music, and maps tutts' events back to seconds")
E("basic-pitch", "tutts", BPMIDI, "notes as `{midi, startBeats, durationBeats}`",
  "the same merge; " + TUTTS_GLUE + "; chords it cannot finger are written as empty events",
  "tested", ["r0240 (e0648 and others in that lane's table)", "lanes/guitar-tab/scripts/run_tutts.py"])
E("basic-pitch", "lilypond", BPMIDI, "LilyPond `.ly` text",
  "the lane's `run_lilypond_tab.py` groups notes within 30 ms and writes them as 16th chords; notes with 'No string for pitch' are left out; with no fret limit given, frets up to 30 (r0240) and 33 (r0514) were written",
  "tested", ["r0240", "r0301, r0479", "r0514 (e1451, e1453)", "r0528 (e1512, e1513)"])
E("basic-pitch", "tabsynth", BPMIDI, "a note list in Hz and seconds", "MIDI note number to Hz; notes with no candidate position were dropped silently",
  "tested", ["r0240 (e0650 and others)"])
E("basic-pitch", "tayuya", BPMIDI, "MIDI, one track at a time",
  "velocity-0 note_on rewritten as note_off (r0242), else twice as many notes; it stopped with UnboundLocalError on files with notes above D6",
  "tested", ["r0240, r0242 (e0653, e0656 and others)"])
RILEY = "MIDI on 88 piano keys from A0, velocity-0 note-ons as note-offs (no string output)"
E("riley-et-al", "tuttut", RILEY, "a MIDI file", "velocity-0 note-ons rewritten as note-offs, merged to one track", "tested",
  ["r0326, r0332 (guitar-fl.pth; e1225, e1275)", "r0500, r0506 (guitar-gaps.pth, verifier; e1430-e1444)"])
E("riley-et-al", "lilypond", RILEY, "LilyPond `.ly` text (the same glue as for Basic Pitch)", "the same preparation", "tested",
  ["r0356 (e1344, e1345)", "r0500, r0506 (e1432-e1445)"])
E("riley-et-al", "gtrsnipe", RILEY, "`gtrsnipe -i input.mid -o out.tab`", "none documented", "docs", [GT + " 2"])
for dst, inp in (("tutts", "`{midi, startBeats, durationBeats}`"), ("tabsynth", "notes in Hz and seconds"), ("tayuya", "MIDI, one track at a time")):
    if dst == "tutts":
        E("riley-et-al", dst, RILEY, inp, "the seconds-to-beats step of the Basic Pitch edge (`run_tutts.py`); the Riley et al. MIDI files have "
          "384 ticks per quarter and one tempo of 120 BPM (header of `out/hf-midi-transcription/S2n.guitar-fl.mid`, guitar-tab lane, read "
          "in the verification pass)", "docs", [GT + " 3-5", "lanes/guitar-tab/scripts/run_tutts.py"])
        continue
    E("riley-et-al", dst, RILEY, inp, "none documented beyond the note list", "docs", [GT + " 3-5"])
BPTS = "note events `pitchMidi`, `startTimeSeconds`, `durationSeconds`, `amplitude`, `pitchBends`, or a MIDI file (`generateFileData`)"
E("basic-pitch-for-the-browser", "tuttut", BPTS, "`tuttut-cli <source.mid> <output_dir>`", "write a MIDI file first", "docs", [BAS + "3"])
E("basic-pitch-for-the-browser", "gtrsnipe", BPTS, "`gtrsnipe -i input.mid -o out.tab`", "write a MIDI file first", "docs", [BAS + "3"])
E("basic-pitch-for-the-browser", "scorify", BPTS, "a note list arranged 'onto a fretted instrument with tunings'", "none documented", "docs", [BAS + "3"])

# --- notes -> fingerstyle voices
BPCSV = "note-events CSV `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend...`"
E("basic-pitch", "partitura", BPCSV, "onset, offset, pitch (`estimate_voices`, through the fingerstyle lane's `voice_split.py`)",
  "partitura returned 8 voices on transcribed notes; the lane's rule labels one voice melody", "tested",
  ["r0258, r0260, r0263, r0265 (fingerstyle lane, notes of r0252)", "r0513 (chain B)"])
E("basic-pitch", "music21", BPCSV, "a single-track MIDI parsed by music21 for the lane's voice rule M1",
  "M1 writes its MIDI at a tempo (the truth tempo, 112 BPM, in chain B); on S2s 122 of 174 notes were not found back in music21's parse and took the default label bass",
  "tested", ["r0258, r0260, r0263, r0265", "r0513 (chain B)"], joint=("notes", "fingerstyle"))
E("librosa", "basic-pitch", "the HPSS harmonic part: `harmonic.wav`, float32, stereo, 44.1 kHz", "an audio file path (Basic Pitch downmixes and resamples itself)",
  "none; from the harmonic part 7 of 48 bass notes were lost on S6taps and 4 of 48 on S2s", "tested",
  ["r0262, r0268 -> r0511 (e1448, e1449)", CH + " chain B"])
E("librosa", "basic-pitch", "onset times (s) of the HPSS percussive part (53 on S6taps, no tap or note label)",
  "Basic Pitch note onsets of the harmonic part, within 50 ms (`chainB_taps.py`)",
  "a join by time, not an input: the 5 onsets with no note were the 5 tap-only events; the 27 taps that sound with a bass note looked the same as the 21 plain notes",
  "tested", ["r0540 (with r0262 and r0511)"], kind="join", joint=("fingerstyle", "fingerstyle"))
for src in ("librosa", "aubio", "essentia", "madmom"):
    E(src, "inverse-drum-machine", "onset times in seconds", "onsets as a dict `{'KD': [...], 'SD': [...]}`", "each onset needs a drum-class label",
      "docs", [FVT + "4"], joint=("fingerstyle", "fingerstyle"))
E("librosa", "adtof-pytorch", "the percussive part as a WAV file", "`--audio input.wav`", "none documented", "docs", [FVT + "2"], joint=("fingerstyle", "fingerstyle"))
E("librosa", "omnizart", "a WAV file", "`omnizart drum transcribe <path/to/audio.wav>`", "none documented", "docs", [FVT + "3"], joint=("fingerstyle", "fingerstyle"))
E("partitura", "cluster-and-separate", "a quantized score as MusicXML (`save_musicxml`)", "`predict.py --score_path <file>.musicxml`", "none documented", "docs", [FVT + "8"])
E("basic-pitch", "midibert", "MIDI, 220 ticks per quarter (the lane's files)", "`extract.py --input_path <midi> --ckpt <melody checkpoint> --cpu`",
  "rewrite the MIDI at 480 ticks per beat: MidiBERT's preprocessing works in raw ticks as if every file had 480 per beat and assumes 4/4; "
  "r0656 wrote such files (Basic Pitch notes at 120 BPM, and at the truth tempo 112 BPM); MidiBERT itself was not run (no checkpoint the "
  "published code loads)", "docs", [FVT + "8b", "lanes/fingerstyle-voices-taps/trials.md (MidiBERT-Piano, gap F3; r0656)"], joint=("notes", "fingerstyle"))
E("music21", "cluster-and-separate", "MusicXML (the lane's S2n_truth_merged_single_track.musicxml, 90 pitches)", "`--score_path`",
  "file prepared for Aaron's list; piano_svsep not run", "docs", [FVT + "8", "lanes/fingerstyle-voices-taps/trials.md"], joint=("fingerstyle", "fingerstyle"))

# --- fingerstyle -> string and fret
E("music21", "tuttut", "a voice label per note (rule M1 on music21's parse of Basic Pitch notes)", "one MIDI file per run: tuttut has no voice input",
  "labels carried around tuttut and joined back by onset (2.5 ms) and pitch class; running the voices separately put both voices on one string at once more often (29 against 23 collisions on S6taps)",
  "tested", ["r0515 (M1 labels: e1460-e1465 on S6taps, e1472-e1477 on S2s; e1466-e1471 between them score B1 labels)", CH + " chain B"],
  joint=("fingerstyle", "tab"))
E("partitura", "tuttut", "voice numbers per note", "per-voice MIDI files (an extra step partitura does not document)", "write one MIDI per voice", "docs",
  [FVT + "13"])
E("mcleod", "tuttut", "a voice per note (not written as one MIDI file per voice)", "per-voice MIDI files", "write one MIDI per voice", "docs", [FVT + "13"])

# --- fingerstyle -> playback
for src in ("adtof-pytorch", "omnizart", "adt-str"):
    E(src, "fluidsynth", "a MIDI drum track (pretty_midi Instrument, is_drum=True)", "a General MIDI file played with FluidR3_GM", "none documented",
      "docs", [FVT + "14"], joint=("fingerstyle", "render"))

# --- chords, beats -> chords, beats
for src, ev in (("madmom", "DBN downbeat tracker"), ("beat-this", "final0")):
    E(src, "livechord", f"beat and downbeat times in seconds, two lists ({ev})", "`refine()` priors together with the audio file", "none", "tested",
      ["r0727 (S3, S4, R1a, R1b, R1c; e1837-e1856)", "r0729 (R2full)"])
E("chordino", "qm-vamp", "NNLS Tuning: one label at 0 s holding the concert pitch in Hz", "the Key Detector's 'Tuning Frequency' parameter", "none documented",
  "docs", ["lanes/chords-beats-key/survey.md Handoff facts (20)"])
E("chordino", "essentia", "the concert pitch in Hz (NNLS Tuning)", "KeyExtractor `tuningFrequency`", "none documented", "docs",
  ["lanes/chords-beats-key/survey.md Handoff facts (20)"], joint=("chords", "chords"))
E("beat-this", "essentia", "beat times in seconds", "`ChordsDetectionBeats` ticks (one chord per segment between two ticks) with HPCP frames", "none documented",
  "docs", ["lanes/chords-beats-key/survey.md Handoff facts (19)"], joint=("chords", "chords"))
E("librosa", "vamp-python", "the decoded audio array of `librosa.load`", "`vamp.collect(data, rate, plugin)`", "none", "docs",
  ["https://raw.githubusercontent.com/c4dm/vampy-host/master/README.rst"], joint=("chords", "other"))
E("beat-this", "sonic-visualiser", "a `.beats` TSV (time in seconds, tab, beat number)", "an annotation import", "Sonic Visualiser's own documentation was not read",
  "docs", ["Beat This! README"])
E("tempo-cnn", "jams", "one tempo (BPM) and a meter per file", "a JAMS tempo annotation (`--jams`)", "none", "docs", ["tempocnn/commands.py (lanes/chords-beats-key/survey.md handoff fact 26)"])
SPANS = ("beat and onset times are instants, while the span prompt takes [start, end] pairs; no rule for making spans from instants is "
         "in the lane files (UNVERIFIED)")
E("beat-this", "sam-audio-meta", "beat times in seconds", "SAM Audio's span prompt `anchors=[[['+', start, end]]]` (seconds)", SPANS, "docs", [SS],
  joint=("chords", "separation"))
E("librosa", "sam-audio-meta", "`onset_detect(..., units='time')` times", "SAM Audio's span prompt (seconds)", SPANS, "docs", [SS],
  joint=("fingerstyle", "separation"))

# --- chords, beats -> tab file (GP5) and sync
def gp5glue(figures):
    return ("`tab_beats_to_gp5.py`: the grid extended before the first and after the last tracked beat, a bar started at each grid beat "
            "within 35 ms of a downbeat, four 16ths per beat, an integer song tempo by one of three rules (" + figures + ")")


GP5_SONG = ("a GP5 song: bars, beats with note values (960 ticks per quarter), one integer song tempo plus optional integer mix-table tempo "
            "changes on beats, chord names on beats")
E("madmom", "pyguitarpro", "`downbeats.txt` (time<TAB>beat number, 10 ms grid) and CNN chord `.lab` (Harte labels such as `D:maj`)", GP5_SONG,
  gp5glue("median-interval rule 115 BPM: 57 of 369 notes matched after read-back, e1486; span rule 116 BPM: 223, e1497; per-bar "
          "mix-table tempo changes, 115 to 117 BPM: 223, e1500") +
  "; Harte label to name (`B:min` -> `Bm`); PyGuitarPro raised GPException on a chord with `firstFret` unset", "tested",
  ["r0520 (e1486, e1488, e1490, e1492, e1495, e1497-e1502)", "r0566 (the GPException, verifier)"], joint=("chords", "formats"))
E("beat-this", "pyguitarpro", "`final0_beats.txt` and `final0_downbeats.txt` (seconds)", "the same GP5 bars and beats",
  gp5glue("median-interval rule 115 BPM: 53 of 369, e1487; span rule 116 BPM: 223, e1503; per-bar tempo changes: 223, e1506") +
  "; Beat This! put 3 beats in S4's silent first bar, so the file starts with a 1-beat and a 3-beat bar", "tested",
  ["r0520 (e1487, e1489, e1494, e1503-e1507)"], joint=("chords", "formats"))
E("chordino", "pyguitarpro", "a `.lab` of plain chord names (`D`, `Bm`), first segment at 0.372 s", "GP5 chords on beats (name, root, fingering fields)",
  "each segment start moved to the nearest 16th; names written with `firstFret` 0 and no fingering, so alphaTab drew empty diagrams", "tested",
  ["r0520 (e1496, e1505)"], joint=("chords", "formats"))
E("madmom", "web-audio-api", "tracked beat times in seconds on the audio's clock", "`AudioScheduledSourceNode.start(when)` on one AudioContext",
  "context time = start + (beat time - GP5 time 0); the -0.01 s offset came from chain A's glue (a GP5 file has no field for it)", "tested",
  ["r0535 (65 clicks scheduled, 65 found at their frames; analysis r0538)", CH + " chain E"], joint=("chords", "sync"))
E("web-audio-beat-detector", "web-audio-api", "`guess()`: the rounded BPM and the offset of the first beat (s)", "click times `start(t0 + offset + n * 60 / bpm)`",
  "none", "docs", [BAS + "7"], joint=("chords", "sync"))
E("beat-this-onnx", "alphatab", "beat and downbeat activations at 50 fps, made into seconds by the host's peak picking or DBN",
  "sync points `{ barIndex, barPosition, barOccurence, millisecondOffset }`",
  "downbeat k at t seconds -> `{ barIndex: k, barPosition: 0, barOccurence: 0, millisecondOffset: 1000 * t }` when the score's bars match the recording's one to one (repeats need barOccurence)",
  "docs", [BAS + "6"], joint=("chords", "sync"))
E("beat-this-onnx", "web-audio-api", "beat times in seconds of media time", "`start(when)` at context time `t0 + (m - m0) / r` at playback rate r", "none", "docs",
  [BAS + "8"], joint=("chords", "sync"))
E("beat-this-onnx", "signalsmith", "beat times in seconds of media time", "`schedule({ output, input, rate })` (output = context time, input = buffer position)",
  "none", "docs", [BAS + "8"], joint=("chords", "sync"))
E("beat-this", "soundslice", "beat and downbeat labels (`t` seconds, `label`) from the Space teamup-tech/Beat-This",
  "syncpoints `[zero_based_bar, time_in_seconds, optional_position_0_to_480]`", "one syncpoint per downbeat", "docs",
  ["r0118 tested the Space half only", "https://www.soundslice.com/help/data-api/"], joint=("chords", "sync"))
E("klangio-api", "soundslice", "beat-tracking JSON `[beat_time_in_seconds, beat_number_in_bar]` (1.0 on each downbeat)", "syncpoints as above",
  "one syncpoint per downbeat; the upload endpoint is 'only available by special permission'; " + LIFE["klangio-api"], "docs",
  ["https://api-docs.klang.io/docs/jobs/beat-tracking-request", "https://www.soundslice.com/help/data-api/", LIFE_EV], joint=("chords", "sync"))
E("musicai-api", "soundslice", "beatMap JSON (each beat's start time and beat number) with `bpm`", "syncpoints as above",
  "one syncpoint per downbeat; " + LIFE["musicai-api"], "docs",
  ["https://music.ai/modules/transcription/beats/", "https://www.soundslice.com/help/data-api/", LIFE_EV], joint=("chords", "sync"))
E("klangio-api", "hooktheory-api", "chord JSON `[start_s, end_s, 'Root:quality']` and, in the extended job, `key`", "a chord path `cp` of Roman numerals relative to the key",
  "the key is needed to convert; " + LIFE["klangio-api"], "docs",
  ["https://api-docs.klang.io/docs/jobs/chord-recognition-extended-requests", "https://www.hooktheory.com/api/trends/docs", LIFE_EV],
  joint=("chords", "chords"))

# --- string and fret -> tab files
E("tuttut", "pyguitarpro", "its own JSON (`Tab.to_json`: `tuning` from the thinnest string; `measures[].events[]` with `time` in seconds, "
  "`time_ticks`, `measure_timing` and `notes[]` of `degree`, `octave`, `string` (0 = thinnest), `fret`; no durations; bars from the MIDI's "
  "time signature at Basic Pitch's 120 BPM placeholder, 20 measures on S4) and an ASCII tab with bar lines (`Tab.to_ascii`)",
  "a PyGuitarPro song written as GP5 (`Track.strings` = tuning, `Track.offset` = capo)",
  "the guitar-tab lane's `run_tuttut.py` flattens the JSON to `{onset, pitch (from degree and octave), string = index + 1, fret}` "
  "(`<name>.gtreval.json`), the file the GP5 glue reads; a tempo and a grid are needed to turn seconds into note values: a fixed 16th grid at a given tempo (`gtreval_to_gp5.py`) or a beat tracker's grid (`tab_beats_to_gp5.py`); one note per string per 16th (17 of 342 S4 notes dropped)",
  "tested", ["e0430-e0432, e1088, e1090, e1092 (2026-11-10 glue runs without ledger lines; re-run r0586 gave identical content)", "r0520 (chain A)"])
E("lilypond", "pyguitarpro", "string and fret per note read from LilyPond's log (the lane's Scheme hook)", "GP5 through the same glue", "as above", "tested",
  ["e0433 (S5dropd, Drop D: 90 of 90 after the GP5 round trip; re-run r0586)"])
E("tutts", "alphatab", "`tab.data` JSON ('the renderer-neutral result'); tutts-alphatab writes alphaTex", "alphaTex", "a 'thin adapter' (`packages/alphatab`)",
  "docs", [GT + " 4", "lanes/web-tab-render/tools.json (tutts-alphatab)"], joint=("tab", "render"))
E("guitab", "pyguitarpro", "`<name>.gp5`", "`guitarpro.parse(...)`", "none", "docs", [GT + " 7"])
for dst in ("tuxguitar", "musescore", "guitar-pro-8"):
    E("guitab", dst, "`<name>.gp5`", "a Guitar Pro 5 file", "none", "docs", ["Guitab README: 'a tab you can open in Guitar Pro, TuxGuitar, MuseScore or any online gp5 player'"])
E("guitab", "dadagp", "`.tokens.txt` (DadaGP's header tokens; notes as `note:s<string>:f<fret>` without DadaGP's instrument prefix)", "`dadagp.py decode`",
  "whether DadaGP's decoder reads Guitab's files was not tested", "docs", [GT + " 7"])
E("dadagp", "guitartab-hsu", "DadaGP token text (`.tokens.txt`)", "`src/dadagp_parser.py`", "none", "docs", [GT + " 11"], joint=("formats", "tab"))
E("amt-tools", "jams", "per-string stacked notes -> (string, fret) per note (`stacked_notes_to_frets`) -> JAMS (`write_stacked_notes_jams`)", "a JAMS file",
  "no Guitar Pro or MusicXML writer in those repositories", "docs", [GT + " 14"])
E("fretpath", "musicxml-4-0", "MusicXML exported from MuseScore after FretPath", "MusicXML with string and fret", "none", "docs",
  ["lanes/guitar-tab/for-aaron.md step 5"])
E("gtrsnipe", "vextab", "`.vex` (VexTab text); also `.abc`, `.mid` and ASCII `.tab`", "VexTab text", "the renderer half was not read", "docs", [GT + " 15"])
E("gtrsnipe", "abcjs", "`.abc`", "ABC text", "the guitar-tab lane did not read the renderer half; abcjs's guitar tab takes ABC at written "
  "pitch, one octave above sounding (web-tab-render r0239, r0241); whether gtrsnipe's `.abc` is at written or sounding pitch is UNVERIFIED "
  "(one gtrsnipe run would settle it)", "docs", [GT + " 15", "lanes/web-tab-render/trials.md (abcjs runs)"])
E("from-midi-to-rich", "music21", "MusicXML (per the paper; no code found)", "music21's MusicXML reader", "none", "docs", [GT + " 16"])
E("tuxguitar", "ascii-tab-informal", "ASCII tab", "—", "no times; the tuning only as one letter per string line ('D|' for Drop D's sixth "
  "string, no octave); no capo field; read back by note order", "tested",
  ["e0461, e0468, e0475 (90 of 90 by order)", WEB], kind="format-write")
E("crepe-notes", "musescore", "a .mid file", "a MIDI file on the command line (`-o` export)", "none", "docs", ["lanes/audio-to-notes/survey.md Handoff facts", "https://musescore.org/en/handbook/4/command-line-usage"])
E("transkun", "musescore", "a MIDI file", "a MIDI file on the command line", "none", "docs", ["lanes/audio-to-notes/survey.md Handoff facts"])
E("basic-pitch", "musescore", "a MIDI file", "a MIDI file on the command line (`-o`, `-M`)", "none", "docs", ["https://musescore.org/en/handbook/4/command-line-usage"])
for src in ("swiftf0", "aubio", "essentia"):
    E(src, "musescore", "note events, written as MIDI by the lane's `notes_csv_to_midi.py` (program 24, velocity 80, 120 BPM)", "a MIDI file on the command line",
      "notes CSV to MIDI by the lane's script", "docs", ["lanes/audio-to-notes/tools.json handoffs_out"])
E("muscriptor-kyutai", "alphatab", "`score.musicxml`", "MusicXML import (MIDI is not among alphaTab's importers)", "none", "docs", ["https://alphatab.net/docs/introduction"])
E("yourmt3", "flat", "MIDI, cut out of the Space's HTML `data:audio/midi;base64,` URL", "import of `.mid` / `.midi`", "decode the data URL to a .mid file",
  "docs", ["r0112 tested the Space half", "https://flat.io/developers/docs/openapi.yaml"])
E("mureka", "flat", "MusicXML inside the `zip_url` archive", "MusicXML import", "what the ZIP holds is UNVERIFIED until one call", "docs",
  ["https://fal.ai/models/mureka/api/song/transcribe/llms.txt", "https://flat.io/developers/docs/openapi.yaml"])
E("klangio-api", "flat", "Guitar Pro 5 (`gp5`), MusicXML (`xml`) and MIDI", "import ('Preferred formats'; gp5 'converted to MusicXML on import, some notation details may be lost')",
  LIFE["klangio-api"], "docs", ["https://api-docs.klang.io/docs/file-formats/guitar-pro", "https://flat.io/developers/docs/openapi.yaml", LIFE_EV])
E("klangio-api", "soundslice", "Guitar Pro 5 and MusicXML", "notation upload ('MusicXML, Guitar Pro, PowerTab or TuxGuitar')",
  "the endpoint is 'only available by special permission'; " + LIFE["klangio-api"], "docs", ["https://www.soundslice.com/help/data-api/", LIFE_EV])

# apps that write tab files, and apps that read them (documented by the apps-survey lane, Handoff facts 1-13 and 24-27).
# Each edge names only the formats both sides document: the sender's export list against the receiver's import list.
APP_IN = {
    "guitar-pro-8": ({"gp": "Guitar Pro", "musicxml": "MusicXML", "midi": "MIDI"},
                     "imports of .gp5, .gp, MusicXML and MIDI (https://www.guitar-pro.com/c/14-guitar-pro-features)"),
    "tabtify": ({"gp": "Guitar Pro", "musicxml": "MusicXML", "midi": "MIDI"},
                "'GP3, GP4, GP5, GPX, and GP', 'MusicXML files including XML and MXL' and MIDI uploads (https://tabtify.com/)"),
    "soundslice": ({"gp": "Guitar Pro", "musicxml": "MusicXML"},
                   "'Import MusicXML and Guitar Pro files'; no MIDI import is listed (https://www.soundslice.com/plans/)"),
    "rifftotab": ({"gp": "Guitar Pro", "musicxml": "MusicXML", "alphatex": "alphaTex", "midi": "MIDI"},
                  "'Opens Guitar Pro, MusicXML and alphaTex files' and '.mid or .midi' (https://rifftotab.com/)"),
    "cesure": ({"gp": "Guitar Pro", "musicxml": "MusicXML", "alphatex": "alphaTex", "midi": "MIDI"},
               "'Import MIDI, MusicXML, Guitar Pro (.gp, .gp3, .gp4, .gp5) and AlphaTex' (https://cesure.app/)"),
    "alphatab": ({"alphatex": "alphaTex"}, "alphaTex, 'a plain-text notation format for alphaTab' (https://alphatab.net/docs/alphatex/introduction)"),
    "chordsheetjs": ({"chordpro": "ChordPro"}, "`new ChordSheetJS.ChordProParser()` (README)"),
}
FMT_ORDER = ["gp", "musicxml", "alphatex", "midi", "chordpro"]
APP_OUT = [  # sender, its export formats, its export list as the lane quotes it, URL, receivers, apps-survey Handoff facts
    ("klangio-guitar2tabs", {"gp", "musicxml", "midi"}, "a Guitar Pro file, MusicXML (nominal tempo) and quantized or unquantized MIDI",
     "https://klang.io/help/download-formats/", ["guitar-pro-8", "tabtify", "soundslice", "rifftotab", "cesure"], "1-3, 10, 25"),
    ("klangio-transcription-studio", {"gp"}, "a Guitar Pro file", "https://klang.io/help/download-formats/",
     ["guitar-pro-8", "tabtify", "soundslice", "rifftotab", "cesure"], "1, 10"),
    ("songsterr", {"gp", "midi"}, "Guitar Pro or MIDI download (a Plus feature)", "https://www.songsterr.com/help",
     ["guitar-pro-8", "tabtify", "soundslice", "rifftotab", "cesure"], "4, 10"),
    ("songscription", {"midi", "musicxml", "gp"}, "MIDI, MusicXML, PDF and Guitar Pro export", "https://www.songscription.ai/pricing",
     ["guitar-pro-8", "tabtify", "soundslice", "rifftotab", "cesure"], "5, 10"),
    ("tabtify", {"alphatex", "gp"}, "alphaTex (.alphatex) and Guitar Pro (.gp)", "https://tabtify.com/", ["alphatab", "cesure", "rifftotab"], "7, 10"),
    ("anthemscore", {"musicxml", "midi"}, "MusicXML and MIDI", "https://lunaverus.com/compareEditions", ["guitar-pro-8", "tabtify", "soundslice"], "6"),
    ("anthemscore-web", {"musicxml", "midi"}, "MusicXML and MIDI", "https://lunaverus.com/compareEditions", ["guitar-pro-8", "tabtify", "soundslice"], "6"),
    ("chordify", {"midi"}, "the chords as a MIDI file", "https://apps.apple.com/us/app/id1073624757", ["guitar-pro-8", "tabtify"], "9"),
    ("chord-ai", {"midi"}, "'midified audio as a midi file'", "https://apps.apple.com/us/app/id1446177109", ["guitar-pro-8", "tabtify", "rifftotab"], "13"),
    ("chord-ai", {"chordpro"}, "Text and ChordPro export (release notes 6.2.9)", "https://apps.apple.com/us/app/id1446177109", ["chordsheetjs"], "8"),
    ("capo-app", {"midi"}, "audio-synchronized MIDI of the chord and note entries the user made (Mac only)",
     "https://supermegaultragroovy.com/products/capo/mac/", ["guitar-pro-8", "tabtify", "rifftotab"], "27"),
    ("melodyne", {"midi"}, "'Audio-to-MIDI - export notes to a MIDI file'", "https://www.celemony.com/en/melodyne/melodyne-5-editions",
     ["guitar-pro-8", "tabtify", "rifftotab"], "27"),
    ("ripx-daw", {"midi"}, "MIDI ('Print Audio to Midi')", "https://hitnmix.com/ripx-daw/", ["guitar-pro-8", "tabtify", "rifftotab"], "27"),
    ("fretwise", {"midi", "musicxml", "gp"}, "PDF, MIDI, MusicXML and Guitar Pro exports", "https://fretwise.ai/pricing",
     ["guitar-pro-8", "tabtify", "rifftotab", "cesure"], "10, 26"),
    ("guitarconvert", {"midi", "musicxml"}, "PDF, MIDI and MusicXML", "https://latouchemusicale.com/en/apps/guitarconvert/", ["guitar-pro-8", "tabtify"], "26"),
    ("cesure", {"midi", "musicxml", "alphatex"}, "MIDI, MusicXML, AlphaTex and PDF export", "https://cesure.app/",
     ["alphatab", "guitar-pro-8", "tabtify", "soundslice", "rifftotab"], "24"),
]
APP_NOTES = {"chordify": "the MIDI file's layout (one note per chord tone, durations) is not documented on the pages read: UNVERIFIED (apps fact 9)"}


def or_list(xs):
    return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " or " + xs[-1]


for src, fmts, out_all, url, dsts, facts in APP_OUT:
    for dst in dsts:
        acc, quote = APP_IN[dst]
        both = [acc[f] for f in FMT_ORDER if f in fmts and f in acc]
        E(src, dst, or_list(both) + " export", quote, APP_NOTES.get(src, "none documented"), "docs", [f"{A} {facts}", url])
E("cesure-mcp", "cesure", "a `.cesure` score", "the assistant opens the score in Cesure", "none documented", "docs", [A + " 24", "https://cesure.app/"])

# --- tab files -> readers and the browser (tested in the web-tab-render lane unless marked docs)
E("pyguitarpro", "alphatab", "GP5 (the test set's S2n / S5capo2 / S5dropd.gp5 and chain A's files, all written with PyGuitarPro 0.11)",
  "Guitar Pro 3-8 import (file URL or bytes)",
  "a GP5 holds one integer song tempo plus optional integer mix-table tempo changes on beats, and no audio offset; with lazy loading on, "
  "a headless full-page screenshot drew 8 of 18 bars", "tested",
  ["e0004, e0008, e0012 (90 of 90 with string, fret, tuning and capo)", "r0522, r0523 (chain A)", "r0535 (chain E)",
   "e0805 (PyGuitarPro's GP3: 42 of 90, the second voice not written)"])
TRUTH_GP5 = "GP5 (the test set's truth {}.gp5, written with PyGuitarPro 0.11)"
E("pyguitarpro", "musescore", TRUTH_GP5.format("S2n / S5capo2 / S5dropd"), "`mscore3 -o` to MusicXML, MIDI or MuseScore's own `.mscx`",
  "the MusicXML has no TAB staff and no string/fret, while the `.mscx` export of the same file keeps a part 'Guitar' with a TAB staff (r0125); "
  "the capo became a staff text (r0176); the MIDI of the capo file sounds 2 semitones low", "tested",
  ["MusicXML: r0120, r0176, r0177 (e0141, gtr-eval exit 1: 'MusicXML has no part with <string>/<fret> technical marks')",
   "MIDI: r0122, r0190, r0191 (e0145, e0374, e0376, e0378)", "`.mscx`: r0125", WEB])
E("pyguitarpro", "tuxguitar", TRUTH_GP5.format("S2n / S5capo2 / S5dropd"), "the TuxGuitar format plugins (headless)", "none", "tested",
  ["e0457-e0459, e0464-e0466, e0471-e0473 (written back as GP5/GP4/GP3: 90 of 90)", WEB])
E("pyguitarpro", "webmscore", TRUTH_GP5.format("S2n / S5capo2"), "a Guitar Pro file",
  "the MusicXML it writes has no TAB staff and no string/fret; its MIDI keeps every pitch", "tested",
  ["r0288, r0289", "e0990, e0995 (MusicXML; gtr-eval exit 1: no <string>/<fret> marks)", "e0992, e0999 (MIDI)", WEB])
E("pyguitarpro", "guitarpro-parser", TRUTH_GP5.format("S2n / S5capo2 / S5dropd"), "`parse` under Node", "none", "tested",
  ["r0294, r0295, r0297 (e1101, e1103, e1105: 90 of 90 with tuning and capo)", WEB])
for dst in ("power-tab-editor", "apollotab", "guitarpro-rust"):
    E("pyguitarpro", dst, "GP5", "a Guitar Pro reader", "none", "docs", ["lanes/web-tab-render/survey.md parser table"])
E("alphatab", "tuxguitar", "`.gp` (Guitar Pro 7 ZIP, alphaTab's export)", "the gpx v7 reader", "none", "tested",
  ["r0224 (e0477: 90 of 90)", "e0479-e0481 (then written as GP5/GP4/GP3)"], joint=("formats", "formats"))
E("alphatab", "webmscore", "`.gp` (Guitar Pro 7 ZIP)", "a Guitar Pro file",
  "the MusicXML it writes has no <string>/<fret> (e1002, gtr-eval exit 1); its MIDI keeps the pitches (e1006: 90 of 90)", "tested",
  ["r0290 (e1002, e1006)", WEB], joint=("formats", "render"))
E("alphatab", "musescore", "`.gp` (Guitar Pro 7 ZIP)", "MuseScore 3.2.3's command line", "refused: 'unknown file suffix <gp>'", "tested", ["r0178 (exit 1)"],
  joint=("formats", "formats"))
E("alphatab", "guitarpro-parser", "`.gp` (Guitar Pro 7 ZIP)", "`parse`", "refused: 'staff 1 of track 0 has a FretCount property without <Number>'", "tested",
  ["r0298 (exit 1)"], joint=("formats", "formats"))
E("alphatab", "soundslice", "Guitar Pro (.gp)", "notation upload", "none documented", "docs", ["https://www.soundslice.com/help/data-api/"], joint=("formats", "render"))
E("alphatab", "flat", "Standard MIDI File 1.0 (format 0, 960 ticks per quarter; e0007)", "MIDI import", "only the alphaTab half was run", "docs",
  ["e0007", "https://flat.io/developers/docs/openapi.yaml"], joint=("formats", "render"))
E("alphatab", "tab-flow", "alphaTex text", "`.atex` files", "none documented", "docs", ["lanes/web-tab-render/survey.md"], joint=("formats", "render"))
E("tuxguitar", "alphatab", "GP3 / GP4 written by TuxGuitar; also MusicXML", "Guitar Pro and MusicXML import",
  "GP3/GP4: 90 of 90; TuxGuitar's MusicXML: tuning read one octave high (MIDI 52 to 76), 7 of 90 notes matched, none on the truth "
  "string and fret (e0860)", "tested",
  ["e0799, e0802 (GP3, GP4)", "r0277 (MusicXML; e0860)"])
E("tuxguitar", "guitarpro-parser", "GP3 written by TuxGuitar", "`parse`", "none", "tested", ["r0299 (e1110: 90 of 90)"])
E("tuxguitar", "lilypond", "a LilyPond `.ly` export (LilyPond 2.14 syntax)", "LilyPond 2.24.3", "compiles only after `convert-ly -e`", "tested",
  ["r0230 (exit 1)", "r0232"], joint=("formats", "tab"))
E("music21", "opensheetmusicdisplay", "MusicXML with a TAB staff and no `<staff-tuning>`", "MusicXML", "none", "tested", ["r0161 (drawn with string and fret)"])
E("music21", "alphatab", "MusicXML with no `<staff-tuning>`", "MusicXML import", "read as one staff with showTablature false and no string or fret", "tested",
  ["r0278 (e0908)"])
E("music21", "musescore", "MusicXML with no `<staff-tuning>`", "MusicXML", "six `<staff-tuning>` written as C-1; 4 of 90 on the truth string and fret", "tested",
  ["r0181 (e0369)"])
E("musescore", "opensheetmusicdisplay", "MusicXML exported from a GP5", "MusicXML", "drawn with no TAB staff (the export has none)", "tested", ["r0163"])
E("musescore", "verovio", "MusicXML exported from a GP5 (S2n.gp5)", "MusicXML, converted to MEI",
  "MEI with one standard staff and no tab (the export has no TAB staff)", "tested", ["r0168", "lanes/web-tab-render/trials.md (Verovio runs)"])
E("musescore", "alphatab", "MusicXML exported from a GP5", "MusicXML import", "read with no string or fret", "tested", ["e0792"])
E("musicxml-4-0", "alphatab", "MusicXML with a TAB staff, `<staff-tuning>` and `<capo>` (written from the truth by the lane)", "MusicXML import",
  "none", "tested", ["e0843, e0847, e0852 (90 of 90 with tuning and capo)"], kind="format-read")
E("musicxml-4-0", "opensheetmusicdisplay", "MusicXML with a TAB staff", "MusicXML", "the capo is not drawn", "tested", ["r0158, r0159, r0160"], kind="format-read")
E("musicxml-4-0", "verovio", "MusicXML with a TAB staff", "MusicXML, converted to MEI tab", "`<capo>` not carried into the MEI", "tested",
  ["r0166 (e0363)", "r0174 (capo; e0365 0 of 90 with capo 0, e0366 90 of 90 with the capo supplied by hand)"], kind="format-read")
E("musicxml-4-0", "musescore", "MusicXML with a TAB staff", "MusicXML", "TAB staff and string/fret kept, but `<capo>` dropped and frets re-counted from the nut", "tested",
  ["r0179 (e0367)", "r0180 (e0368: 0 of 90)"], kind="format-read")
E("musicxml-4-0", "webmscore", "the reference 2-staff MusicXML", "MusicXML", "staff tuning written one octave high; 0 of 90 on string and fret", "tested",
  ["e1009"], kind="format-read")
E("mei-format", "verovio", "MEI tab (written from the truth by the lane)", "MEI", "none", "tested", ["e0361, e0362 (90 of 90)"], kind="format-read")
E("alphatex", "alphatab", "alphaTex written from the truth JSON", "`tex()` / `{ tex: true }`", "none", "tested",
  ["r0043, r0045, r0046 (e0024, e0026, e0028)"], kind="format-read")
E("abc-format", "abcjs", "ABC written from the S2n, S5capo2 and S5dropd truth", "`renderAbc` with the tablature option (strings chosen by abcjs)",
  "the ABC written one octave above sounding pitch (abcjs's guitar tuning is written pitch): at sounding pitch 42 of 90 positions were drawn "
  "as '?' (r0239), one octave up all 90 were drawn (r0241)", "tested",
  ["r0239, r0241 (S2n; e0638, e1332)", "r0244 (S5capo2 with `capo: 2`, e0655, e1333; S5dropd with a Drop D `tuning`, e0659, e1334)",
   "read back by note order: 88 of 90 with gtr-eval's default 50 ms chord window, 90 of 90 with `--chord-window 0.01` (a setting of the "
   "scoring tool on the read-back's pseudo-onsets, not of abcjs)"], kind="format-read")
E("chordpro-format", "chordsheetjs", "ChordPro with `{start_of_tab}` blocks", "`ChordProParser`", "tab blocks travel as opaque text", "tested", ["r0251"],
  kind="format-read")
E("coderline-alphatab-monaco", "alphatab", "alphaTex edited in Monaco with the language server", "alphaTex", "none", "tested",
  ["r0614 (redrawn)", "r0618 (the .gp export read back with the edits; e1780)"])
for dst, fmt in (("alphatab", "MusicXML (API export)"), ("opensheetmusicdisplay", "MusicXML"), ("musescore", "MusicXML"), ("verovio", "MusicXML")):
    E("soundslice", dst, fmt, "MusicXML", "account needed", "docs", ["lanes/web-tab-render/survey.md Handoff facts"])
FLAT_API = ("https://flat.io/developers/docs/openapi.yaml (GET /scores/{score}/revisions/{revision}/{format}: json, mxl, xml, abc, "
            "mp3, wav, midi, flat, thumbnail.png, synchronizationPoints; read 2026-11-12)")
for dst in ("alphatab", "opensheetmusicdisplay", "verovio"):
    E("flat", dst, "MusicXML export (`xml` or `mxl`)", "MusicXML (its inputs in lanes/web-tab-render/tools.json list no MIDI)",
      "account needed", "docs",
      ["lanes/web-tab-render/survey.md Handoff facts (Flat line: 'the MusicXML by alphaTab, OSMD, Verovio and MuseScore')", FLAT_API])
for dst in ("musescore", "webmscore"):
    E("flat", dst, "MusicXML (and MIDI) export", "MusicXML or MIDI", "account needed", "docs",
      ["lanes/web-tab-render/survey.md Handoff facts", FLAT_API])
E("flat", "soundslice", "an MP3 export", "a recording (`source` 2, MP3 uploaded, or 8, MP3 URL)", "none documented", "docs",
  ["https://flat.io/developers/docs/openapi.yaml", "https://www.soundslice.com/help/data-api/"], joint=("render", "sync"))
E("abjad", "lilypond", "LilyPond `.ly` text", "LilyPond input", "none documented", "docs", ["lanes/web-tab-render/survey.md (LilyPond section)"], joint=("formats", "tab"))
E("holm-asciitabs", "alphatab", "`.gp`, written through alphaTab", "Guitar Pro import", "none documented", "docs", ["lanes/web-tab-render/tools.json"])
for dst in ("alphatab", "tuxguitar", "musescore", "webmscore", "guitarpro-parser", "pyguitarpro"):
    E("audio2tab", dst, "`.gp5` ('Whisper-small fine-tuned to .gp5')", "a Guitar Pro 5 file", "none documented; not run with Audio2Tab's output",
      "docs", ["lanes/web-tab-render/survey.md Handoff facts (To and from neighbouring lanes)", "lanes/guitar-tab/survey.md (Audio2Tab (Loth))"])
E("danzw777", "alphatab", "alphaTex", "alphaTex", "none documented", "docs", ["lanes/web-tab-render/tools.json (depends on @coderline/alphatab and alphaskia)"])

# --- browser playback and sync
E("alphatab", "web-audio-api", "`exportAudio`: float stereo 44.1 kHz chunks (a metronome-only and a guitar-only render)",
  "AudioBuffers started with `start(when)` on the page's AudioContext",
  "alphaTab's real-time player uses its own AudioContext (the browser lane tapped its nodes, r0269); the GP5 time zero (-0.01 s) passed on the page URL",
  "tested", ["r0535 (73 metronome clicks; alphaTab's clicks 10.1 to 11.5 ms before the truth beats; analysis r0538)", CH + " chain E"], joint=("render", "sync"))
E("alphatab", "wavesurfer", "position events in milliseconds and in MIDI ticks, plus metronome events", "`setTime(seconds)`", "`setTime(ms / 1000)`", "docs",
  [BAS + "17"], joint=("render", "sync"))
E("htmlmediaelement", "alphatab", "an `<audio>`/`<video>` element with `playbackRate` and `preservesPitch`", "an external media source (`IExternalMediaHandler`)",
  "run at playback rate 1 (the page set no other rate): `updatePosition(audio.currentTime * 1000)` on every animation frame; the guide's form "
  "for other rates, `updatePosition((media.currentTime / media.playbackRate) * 1000)` and seeking with `media.currentTime = (time * "
  "media.playbackRate) / 1000`, was not run", "tested",
  ["r0261: an `<audio>` element playing S2n.wav drove alphaTab's external-media handler; alphaTab called `seekTo`, `play` and `pause`, and "
   "all 504 checked position events equalled the media time", "r0441 (verifier re-run: all 562 checked equal)",
   "lanes/browser-audio-sync/trials.md ('External media mode')", BAS + "15", "https://alphatab.net/docs/guides/audio-video-sync"])
E("youtube-iframe", "alphatab", "`player.getCurrentTime()` (seconds)", "`api.player.output.updatePosition(ms)`", "`* 1000`", "docs", [BAS + "16"])
E("signalsmith", "web-audio-api", "`schedule({ output, input, rate })`: output = context time, input = buffer position", "the shared AudioContext clock of the metronome",
  "none", "docs", [BAS + "8"])
E("basic-pitch-for-the-browser", "tonejs-midi", "notes `midi`, `time`, `duration`, `velocity` plus pitch bends (`generateFileData`, not exported from the package entry)",
  "a MIDI file read back as notes and `track.pitchBends`", "build the file with @tonejs/midi `addNote` / `addPitchBend`", "docs", [BAS + "1"])
E("tonejs-midi", "smplr", "notes with `midi`, `time` and `duration` in seconds, `velocity` 0-1", "`start({ note, velocity, time, duration })`, velocity 0-127",
  "scale velocity to 0-127; the smplr half ran on truth notes (r0229), not on @tonejs/midi output", "docs", [BAS + "2"])

# --- video -> video
E("mediapipe-hand", "opencv", "21 landmarks per hand: x, y normalized to the frame (`lm_norm_view`), full-frame pixels (`lm_px_full`), metres (`world_m`); one JSONL record per frame, t_s = n / 25",
  "`cv2.perspectiveTransform` points shaped (N, 1, 2), through a homography from a neck quad",
  "the neck quad is set by hand per clip; a 12-TET fret model is fitted to LSD lines; six equal string lanes; the fretting hand is MediaPipe's 'Left' label",
  "tested", ["r0172, r0218 (R3a_cu frame 150), r0402 (R3b frame 225); verifier r0485, r0486", "r0532, r0533 (chain D: R3c, all frames)"])
E("mediapipe-hand", "pytorch-openpose", "hand boxes made from the 21 points (a square, 1.5 x the longer side of their box)", "the OpenPose hand model's crop",
  "'Left' crops mirrored in r0448", "tested", ["r0336 (boxes from MediaPipe run r0078)", "r0448 (boxes from r0075)"])
E("sam2", "opencv", "a mask: as its minimum-area rectangle (4 corners), or as an 8-bit single-channel binary image",
  "the neck quad of `run_opencv_lines.py`, or `HoughLinesP` input", "mask to rectangle", "tested", ["r0400 (mask quad, R3a_cu frame 150)", VHF + "5"])
E("sam2", "cotracker3", "a mask", "`segm_mask` (B, 1, H, W) with `grid_size` ('computed only for the mask')", "none", "docs", [VHF + "9a"])
E("segment-anything-3", "opencv", "per-instance masks", "an 8-bit binary image for `HoughLinesP`", "mask to image", "docs", [VHF + "5"])
E("segment-anything-3", "cotracker3", "masks", "`segm_mask` with `grid_size`", "none", "docs", [VHF + "9a"])
E("cotracker3", "opencv", "`pred_tracks` (x, y in pixels) per frame", "`findHomography` point correspondences (frame 0 template against frame t)", "none", "docs",
  [VHF + "6"])
E("tapir", "opencv", "per-point tracks", "`findHomography` point correspondences", "none", "docs", [VHF + "6"])
E("rtmlib", "opencv", "keypoints (instances x 21 x 2, image pixels)", "`perspectiveTransform` points",
  "reshape to (21, 1, 2) (a plain (N, 2) array raises an assertion in cv2 5.0.0); choose the fretting hand some other way, since rtmlib's "
  "Hand mode has no left/right label (chain D used MediaPipe's 'Left')",
  "docs", [VHF + "2", "lanes/video-hands-fretboard/tools.json (rtmlib outputs)", CH + " chain D, failure note 5"])
E("hamer", "opencv", "`pred_keypoints_2d` relative to the hand crop, with the crop's centre and size", "`perspectiveTransform` points", "crop-to-frame mapping (`cam_crop_to_full`)",
  "docs", [VHF + "7"])
E("wilor-mini", "opencv", "`wilor_preds['pred_keypoints_2d']` of `predict()` (3D joints projected to image pixels), with `hand_bbox` and `is_right`",
  "`perspectiveTransform` points", "none documented (WiLoR-mini repackages WiLoR's inference; WiLoR's own demo writes images and meshes)",
  "docs", [VHF + "7", "lanes/video-hands-fretboard/tools.json (WiLoR, WiLoR-mini)"])
for src, out in (("owlv2", "boxes: through transformers `results['boxes']` (xmin, ymin, xmax, ymax) with scores; through the Space that ran, "
                           "each box as a mask image with no score"), ("grounding-dino", "boxes (cx, cy, w, h), normalized"),
                 ("yolo-world", "`result.boxes.xyxy`")):
    E(src, "rtmlib", out, "`RTMPose.__call__(image, bboxes=[...])` (xyxy pixels)",
      {"grounding-dino": "scale by image size and `box_convert(cxcywh -> xyxy)`",
       "owlv2": "none for the transformers route; from the Space, mask to bounding box (as the video lane's script did)"}.get(src, "none"),
      "docs", [VHF + "3"] + (["lanes/video-hands-fretboard/tools.json (OWLv2 outputs)"] if src == "owlv2" else []))
E("grounding-dino", "sam2", "boxes", "box prompts: `add_new_points_or_box(state, ..., box=box)` (Grounded-SAM-2 scripts)", "none", "docs", [VHF + "4"])
E("mediapipe-hand", "guitar-learning", "hand landmarks", "fretboard coordinates through a four-point homography (nut ends and 12th-fret ends clicked)", "four clicks per video",
  "docs", [A + " line 19"])
E("mediapipe-hand", "chordar", "fingertip landmarks", "a (string, fret) label per fingertip, with ArUco markers on the instrument", "printed markers needed", "docs",
  [A + " line 20"])

# --- video <-> audio (cross-feedback)
E("mediapipe-hand", "basic-pitch", "per-frame landmarks on a 40 ms grid (t_s = n / 25)", "Basic Pitch note onsets and offsets in seconds",
  "a join by time, not an input: nearest frame = round(onset x 25), every onset within 20 ms of a frame; the A/V alignment was taken from "
  "the containers (both streams start at 0 s), not measured in chain D; r0609 found R3c.wav and the mp4's own audio track aligned at lag 0 "
  "by cross-correlation, and whether picture and sound are in sync was not checked",
  "tested", ["r0533, r0546 (chain D, R3b and R3c)", "r0609 (video lane, R3c picking hand)"], kind="join", joint=("video", "notes"))
E("opencv", "gtrsnipe", "a fret position read from video (fingertips through the fretboard homography)", "`--max-fret` or `--capo`", "none documented", "docs",
  [VHF + "10", GT])
VID_JOIN = "join the video frames to the note onsets by time (nearest frame = round(onset x 25), chain D)"
E("opencv", "lilypond", "string and fret positions read from video", "per-note string marks (`c4\\5`) and `\\set TabStaff.minimumFret = #5`",
  "documented in pieces, not run end to end: " + VID_JOIN + "; a pin names its note by chord group and pitch, so the notes are first "
  "grouped within 30 ms (`run_lilypond_tab.py --pin <group>:<pitch>:<string>`, chain C, failure note 3)",
  "docs", [VHF + "10", GT, CH + " chains C and D"])
E("opencv", "fretpath", "string numbers read from video", "string-number annotations, which FretPath keeps as hard constraints",
  "not run: " + VID_JOIN + "; FretPath runs inside MuseScore and reads the annotations on the score's notes (README)", "docs",
  [VHF + "10", GT, CH + " chain D"])
E("sam2", "sam-audio-meta", "per-frame, per-object masks of the player or instrument in the video", "SAM Audio's visual prompt (`processor.mask_videos([frames], [mask])`, "
  "which sets the pixels where the mask is non-zero to 0)",
  "SAM 2's per-frame, per-object masks made into one mask tensor of the video's shape, with the polarity `mask_videos` expects: not "
  "tested (UNVERIFIED)", "docs", [SS])


def build_edges(nodes):
    ids = [n["id"] for n in nodes]
    by = {n["id"]: n for n in nodes}
    out = []
    for e in EDGES:
        f = resolve_prefix(ids, e["from"])
        t = resolve_prefix(ids, e["to"])
        joint = e["joint"] or (by[f]["stage"], by[t]["stage"])
        out.append({"from": f, "to": t, "format": f"{e['out']} -> {e['inp']}", "glue": e["glue"],
                    "evidence_type": e["type"], "evidence": e["evidence"], "kind": e["kind"], "joint": list(joint),
                    "_out": e["out"], "_inp": e["inp"]})
    return out


# ----------------------------------------------------------------------------------------------- markdown
def call_text(calls):
    if not calls:
        return "—"
    labels = [CALL.get(c, c) for c in calls]
    if set(calls) <= {"desktop-gui", "mobile-app"}:
        return ", ".join(labels) + " only"
    return ", ".join(labels)


STATUS_WORD = {"ran-here": "ran here", "ran-elsewhere": "ran elsewhere", "for-aaron": "steps for Aaron", "not-runnable": "not run"}


def stage_tables(nodes):
    lines = []
    by_stage = {k: [] for k, _ in STAGES}
    for n in nodes:
        by_stage[n["stage"]].append(n)
    for i, (key, title) in enumerate(STAGES, 1):
        ns = sorted(by_stage[key], key=lambda n: n["name"].lower())
        also = sorted([n for n in nodes if key in n["also_stages"]], key=lambda n: n["name"].lower())
        cnt = {s: sum(1 for n in ns if n["status"] == s) for s in STATUS_WORD}
        lines.append(f"### 1.{i} {title}")
        lines.append("")
        lines.append(f"{len(ns)} tools: {cnt['ran-here']} ran here, {cnt['ran-elsewhere']} ran elsewhere (public Space or API), "
                     f"{cnt['for-aaron']} not run with steps for Aaron, {cnt['not-runnable']} not run with nothing for Aaron. "
                     f"{len(also)} {'tool' if len(also) == 1 else 'tools'} with {'its' if len(also) == 1 else 'their'} own table elsewhere "
                     f"{'is' if len(also) == 1 else 'are'} also used at this stage.")
        lines.append("")
        if key == "corrections":
            lines.append("No lane entry has re-running the analysis under a user's correction as its own function, so this stage has no table "
                         "of its own. The tools that take a correction as an input, with the parameter and what happened when it was used, "
                         "are in section 3.")
            lines.append("")
            continue
        if ns:
            lines.append("| Tool | Lanes | How an agent calls it | Input | Output | Where it ran | Code licence | Weights licence |")
            lines.append("|---|---|---|---|---|---|---|---|")
            for n in ns:
                name = md(n["name"]) + (" (also steps for Aaron)" if n["also_for_aaron"] else "")
                lanes = ", ".join(LANE_AB[l] for l in n["lanes"])
                lines.append("| " + " | ".join([
                    name, lanes, md(call_text(n["callable_via"])), md(cut(n["_input"], 64)) or "—", md(cut(n["_output"], 84)) or "—",
                    md(n["_where"]), md(n["_code"] if n["id"] in CODE_LICENCE_TEXT else cut(n["_code"], 60)),
                    md(n["_weights"])]) + " |")
            lines.append("")
        if also:
            lines.append("Also used at this stage: " + "; ".join(f"{md(n['name'])} (table 1.{1 + STAGE_IDX[n['stage']]})" for n in also) + ".")
            lines.append("")
    return "\n".join(lines)


def edge_line(e, by):
    X = md(by[e["from"]]["name"])
    Y = md(by[e["to"]]["name"])
    out, inp, glue = md(e["_out"]), md(e["_inp"]), md(e["glue"])
    ev = "; ".join(md(x) for x in e["evidence"])
    tag = "TESTED" if e["evidence_type"] == "tested" else "DOCS"
    if e["kind"] == "target-runs-source":
        s = f"**{Y}** runs **{X}** itself: {X} gives {out}, which {Y} takes as {inp}."
    elif e["kind"] == "source-runs-target":
        s = f"**{X}** runs **{Y}** itself: {X} passes {out}, which {Y} takes as {inp}."
    elif e["kind"] == "join":
        s = f"**{X}** and **{Y}** lined up by time (neither takes the other's output as input): {out}, joined with {inp}."
    elif e["kind"] == "format-write":
        s = f"**{X}** writes **{Y}**: {out}."
    elif e["kind"] == "format-read":
        s = f"A file in **{X}** ({out}) is read by **{Y}** as {inp}."
    else:
        s = f"**{X}** outputs {out}, which **{Y}** accepts as {inp}."
    if glue and glue not in ("none", "—"):
        s += f" Glue: {glue}."
    else:
        s += " Glue: none."
    return f"- {s} {tag}: {ev}."


def edges_md(edges, by):
    groups = {}
    for e in edges:
        groups.setdefault(tuple(e["joint"]), []).append(e)
    lines = []
    for jt in sorted(groups, key=lambda j: (STAGE_IDX[j[0]], STAGE_IDX[j[1]])):
        es = groups[jt]
        nt = sum(1 for e in es if e["evidence_type"] == "tested")
        lines.append(f"### {STAGE_TITLE[jt[0]].split(' (')[0].split(':')[0]} -> {STAGE_TITLE[jt[1]].split(' (')[0].split(':')[0]}")
        lines.append("")
        lines.append(f"{len(es)} edges, {nt} tested, {len(es) - nt} from documentation only.")
        lines.append("")
        for e in sorted(es, key=lambda e: (e["evidence_type"] != "tested", by[e["from"]]["name"].lower(), by[e["to"]]["name"].lower())):
            lines.append(edge_line(e, by))
        lines.append("")
    return "\n".join(lines)


def counts_md(nodes, datasets, edges, tools):
    n_entries = sum(len(g["entries"]) for g in tools)
    by = {s: sum(1 for n in nodes if n["status"] == s) for s in STATUS_WORD}

    def tk(kind):
        return sum(1 for e in edges if e["evidence_type"] == "tested" and e["kind"] == kind)
    lines = [
        f"Counting rule: {C.COUNTING_RULE}",
        "",
        "| | count |",
        "|---|---|",
        f"| entries in the ten tools.json files | {n_entries + len(datasets)} |",
        f"| of which kind dataset (not tools; listed below the table) | {len(datasets)} |",
        f"| other entries | {n_entries} |",
        f"| **tools after merging** | **{len(nodes)}** |",
        f"| tools made of two or more merged entries | {sum(1 for g in tools if len(g['entries']) > 1)} |",
        f"| ran here (this box, 2 CPU cores or headless Chromium) | {by['ran-here']} |",
        f"| ran elsewhere only (public Hugging Face Space or a paid or free API) | {by['ran-elsewhere']} |",
        f"| not run, with steps for Aaron | {by['for-aaron']} |",
        f"| not run, with nothing for Aaron to run | {by['not-runnable']} |",
        f"| ran here or elsewhere and also have steps for Aaron | {sum(1 for n in nodes if n['also_for_aaron'])} |",
        f"| edges in handoffs.json | {len(edges)} ({sum(1 for e in edges if e['evidence_type'] == 'tested')} tested, "
        f"{sum(1 for e in edges if e['evidence_type'] == 'docs')} from documentation only) |",
        f"| tested edges by kind | {tk('data')} data handoffs; {tk('target-runs-source') + tk('source-runs-target')} where one tool runs "
        f"the other itself; {tk('join')} joins by time; {tk('format-read')} format-read and {tk('format-write')} format-write (reader and "
        f"writer tests on files the lanes made from the ground truth, not on another tool's output) |",
        "",
        "Reasons recorded for the tools not run with nothing for Aaron (a keyword digest of each tool's `not_run_reason`, rule in "
        "`build_handoffs.py`):",
        "",
        "| reason | tools |",
        "|---|---|",
    ]
    rc = {}
    for n in nodes:
        if n["status"] == "not-runnable":
            r = short_reason(n["_reason_full"])
            if r not in [lbl for _, lbl in REASONS]:
                r = "other reasons (see the tool's row)"
            rc[r] = rc.get(r, 0) + 1
    for r, c in sorted(rc.items(), key=lambda x: -x[1]):
        lines.append(f"| {r} | {c} |")
    lines.append("")
    lines.append("Tools per stage (each tool counted once, in its own stage):")
    lines.append("")
    lines.append("| stage | tools | ran here | ran elsewhere | steps for Aaron | not run |")
    lines.append("|---|---|---|---|---|---|")
    for key, title in STAGES:
        ns = [n for n in nodes if n["stage"] == key]
        c = {s: sum(1 for n in ns if n["status"] == s) for s in STATUS_WORD}
        lines.append(f"| {title.split(' (')[0].split(':')[0]} | {len(ns)} | {c['ran-here']} | {c['ran-elsewhere']} | {c['for-aaron']} | {c['not-runnable']} |")
    lines.append("")
    keys = {}
    for d in datasets:
        keys.setdefault(C.dataset_key(d["tool"]["name"]), []).append(d)
    lines.append(f"Datasets ({len(datasets)} entries, {len(keys)} distinct names by the normalization in `count_tools.py`), not counted as tools: "
                 + "; ".join(md(v[0]["tool"]["name"]) for v in sorted(keys.values(), key=lambda v: v[0]["tool"]["name"].lower())) + ".")
    lines.append("")
    lines.append("Two of these dataset entries also name software, and are still counted as datasets by the rule above: \"Roboflow "
                 "Universe guitar projects (fretboard / guitar-neck / fret models and datasets)\" (video lane: nine projects, "
                 "`callable_via` HTTP, Python and browser JS, on the list for Aaron; the lane recorded their licences, classes and model "
                 "availability as unknown, not read; Roboflow Inference and Roboflow hosted inference are tools of their own in table 1.7), "
                 "and \"chords-db and react-chords\" (web-tab-render lane: react-chords is \"React chord diagrams\", browser JS, not run).")
    return "\n".join(lines)


def nothing_ran_md(nodes, edges):
    lines = ["**Stages and joints with nothing run here** (generated from the stage tables and the edge list).", ""]
    rows = []
    for key, title in STAGES:
        own = [n for n in nodes if n["stage"] == key]
        here = sum(1 for n in own if n["status"] == "ran-here")
        also_here = sum(1 for n in nodes if key in n["also_stages"] and n["status"] == "ran-here")
        rows.append((title.split(" (")[0].split(":")[0], len(own), here, also_here))
    zero = [r for r in rows if r[2] == 0 and r[3] == 0]
    lines.append("- Stages with no tool run here, counting tools listed under \"also used\": "
                 + ("; ".join(f"{r[0]} ({r[1]} tools of its own)" for r in zero) if zero else "none") + ".")
    groups = {}
    for e in edges:
        groups.setdefault(tuple(e["joint"]), []).append(e)
    fed = ("data", "target-runs-source", "source-runs-target", "join")   # format-read / format-write tests ran on truth files
    docs_only = [j for j, es in groups.items() if not any(e["evidence_type"] == "tested" and e["kind"] in fed for e in es)]
    docs_only.sort(key=lambda j: (STAGE_IDX[j[0]], STAGE_IDX[j[1]]))
    lines.append("- Joints with no tested edge in which one tool's output was fed to (or joined with) another (format-read and "
                 "format-write tests on files written from the truth do not count): "
                 + "; ".join(f"{SHORT[a]} -> {SHORT[b]} ({len(groups[(a, b)])})" for a, b in docs_only) + ".")
    pairs = [(STAGES[i][0], STAGES[i + 1][0]) for i in range(len(STAGES) - 3)]
    missing = [p for p in pairs if p not in groups]
    lines.append("- Neighbouring stages in the pipeline order with no edge recorded between them in either direction: "
                 + ("; ".join(f"{SHORT[a]} -> {SHORT[b]}" for a, b in missing if (b, a) not in groups) or "none") + ".")
    return "\n".join(lines)


def replace_block(text, name, body):
    rx = re.compile(r"(<!-- BEGIN GENERATED: " + name + r" -->\n)(.*?)(<!-- END GENERATED: " + name + r" -->)", re.S)
    if not rx.search(text):
        raise SystemExit(f"marker {name} missing in HANDOFFS.md")
    return rx.sub(lambda m: m.group(1) + body.rstrip() + "\n" + m.group(3), text)


def main():
    tools, datasets, _ = C.merge()
    led, led_src = load_ledger()
    nodes = build_nodes(tools, led)
    by = {n["id"]: n for n in nodes}
    edges = build_edges(nodes)
    # every run id cited as evidence of a tested edge must be in the ledger
    for e in edges:
        for ev in e["evidence"]:
            for rid in re.findall(r"\br\d{4}\b", ev):
                if rid not in led:
                    msg = f"run id {rid} cited for {e['from']} -> {e['to']} is not in the ledger ({led_src})"
                    if led_src == LEDGER_LIVE:
                        raise SystemExit(msg)
                    print("warning:", msg, "(the gzipped copy ends at r0722)")
    pub_nodes = [{k: v for k, v in n.items() if not k.startswith("_")} for n in nodes]
    pub_edges = [{k: v for k, v in e.items() if not k.startswith("_")} for e in edges]
    with open(os.path.join(DOCS, "handoffs.json"), "w") as f:
        f.write('{"generated_by": "handoffs/build_handoffs.py", "ledger": ' + json.dumps(led_src) + ',\n')
        f.write(' "stages": ' + json.dumps([{"id": k, "title": t} for k, t in STAGES]) + ',\n')
        # compact separators keep the file under the 300 KB limit for files in the blog repository
        f.write(' "nodes": [\n' + ",\n".join("  " + json.dumps(n, ensure_ascii=False, separators=(",", ":")) for n in pub_nodes) + "\n ],\n")
        f.write(' "edges": [\n' + ",\n".join("  " + json.dumps(e, ensure_ascii=False, separators=(",", ":")) for e in pub_edges) + "\n ]}\n")
    path = os.path.join(DOCS, "HANDOFFS.md")
    text = open(path).read()
    text = replace_block(text, "stages", stage_tables(nodes))
    text = replace_block(text, "edges", edges_md(edges, by))
    text = replace_block(text, "counts", counts_md(nodes, datasets, edges, tools))
    text = replace_block(text, "nothing-ran", nothing_ran_md(nodes, edges))
    open(path, "w").write(text)
    print(f"nodes {len(nodes)}, edges {len(edges)} ({sum(1 for e in edges if e['evidence_type'] == 'tested')} tested); "
          f"HANDOFFS.md {len(text.encode())} bytes; handoffs.json {os.path.getsize(os.path.join(DOCS, 'handoffs.json'))} bytes")


if __name__ == "__main__":
    main()
