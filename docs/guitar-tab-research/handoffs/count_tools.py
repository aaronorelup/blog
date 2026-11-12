#!/usr/bin/env python3
"""Count the tools the ten lanes looked at, from their tools.json files.

Counting rule (also printed by this script): a tool is one entry of kind other than "dataset" in any
lane's tools.json, with entries in several lanes (or several entries naming the same software, model or
service) merged into one tool by the ALIASES table below; its status is "ran-here" if any merged entry
has tried=true with tried_how containing "local-cpu" or "browser-headless", else "ran-elsewhere" if any
has tried=true (tried_how "public-space" or "api"), else "for-aaron" if any has for_aaron=true, else
"not-runnable" (not run here or elsewhere and on no list for Aaron, whatever the reason). STATUS_OVERRIDES below
sets the status by hand where that rule misreads a lane's record (WebGPU: its tried=true is an environment probe that
found no adapter).

Usage: python3 count_tools.py            prints the counts
       python3 count_tools.py --json     prints the merged tool list as JSON (used by build_handoffs.py)

Reads only lanes/<lane>/tools.json. Writes nothing.
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LANES_DIR = os.path.join(os.path.dirname(HERE), "lanes")
LANES = ["source-separation", "audio-to-notes", "chords-beats-key", "guitar-tab", "fingerstyle-voices-taps",
         "video-hands-fretboard", "web-tab-render", "browser-audio-sync", "apps-survey", "hosted-apis"]

# (id, display name, [(lane, regex matched from the start of the entry's name), ...])
# Entries that name the same software, model or service in different lanes (or a pointer to another
# lane's entry) are merged. Everything not listed here is a tool of its own.
ALIASES = [
    ("demucs", "Demucs v4 (htdemucs, htdemucs_ft, htdemucs_6s, mdx_extra)", [
        ("source-separation", r"Demucs v4"), ("audio-to-notes", r"Demucs$"), ("chords-beats-key", r"Demucs \(htdemucs\)"),
        ("fingerstyle-voices-taps", r"Demucs \(htdemucs, htdemucs_6s\)"), ("browser-audio-sync", r"Demucs \(Meta HTDemucs\)"),
        ("hosted-apis", r"Demucs \(upstream\)")]),
    ("demucs-onnx-sevagh", "demucs.onnx (sevagh)", [
        ("source-separation", r"demucs\.onnx \(sevagh\)"), ("browser-audio-sync", r"sevagh/demucs\.onnx and demucs\.cpp")]),
    ("free-music-demixer", "free-music-demixer (sevagh, in-browser WASM)", [
        ("source-separation", r"free-music-demixer"), ("browser-audio-sync", r"free-music-demixer")]),
    ("demucs-rs", "demucs-rs (nikhilunni)", [("source-separation", r"demucs-rs"), ("browser-audio-sync", r"demucs-rs")]),
    ("stemsplit-demucs-onnx", "demucs-onnx (StemSplit) / StemSplitio htdemucs ONNX exports", [
        ("source-separation", r"demucs-onnx \(StemSplit\)"), ("browser-audio-sync", r"htdemucs_6s ONNX export")]),
    ("stemsplit-api", "StemSplit (hosted service and API)", [
        ("source-separation", r"StemSplit \(stemsplit"), ("hosted-apis", r"StemSplit API")]),
    ("spleeter", "Spleeter", [("source-separation", r"Spleeter \(4stems"), ("chords-beats-key", r"Spleeter$")]),
    ("open-unmix", "Open-Unmix (umxhq, umxl)", [
        ("source-separation", r"Open-Unmix \(umxhq, umxl\)"), ("fingerstyle-voices-taps", r"Open-Unmix \(umxhq\)"),
        ("apps-survey", r"Open-Unmix$")]),
    ("librosa", "librosa (HPSS, onsets, pyin, beat_track, estimate_tuning)", [
        ("source-separation", r"librosa \(HPSS"), ("audio-to-notes", r"librosa\.pyin"), ("chords-beats-key", r"librosa$"),
        ("fingerstyle-voices-taps", r"librosa$")]),
    ("madmom", "madmom", [("audio-to-notes", r"madmom$"), ("chords-beats-key", r"madmom$"),
                          ("fingerstyle-voices-taps", r"madmom \(")]),
    ("aubio", "aubio", [("audio-to-notes", r"aubio$"), ("chords-beats-key", r"aubio$"),
                        ("fingerstyle-voices-taps", r"aubio \(aubioonset\)"), ("browser-audio-sync", r"aubio \(C library")]),
    ("essentia", "Essentia", [("audio-to-notes", r"Essentia$"), ("chords-beats-key", r"Essentia \("),
                              ("fingerstyle-voices-taps", r"Essentia \(")]),
    ("essentia-js", "essentia.js", [("chords-beats-key", r"essentia\.js"), ("browser-audio-sync", r"essentia\.js")]),
    ("basic-pitch", "Spotify Basic Pitch (Python)", [
        ("audio-to-notes", r"Spotify Basic Pitch"), ("chords-beats-key", r"Basic Pitch \(audio-to-notes"),
        ("guitar-tab", r"Basic Pitch \(from"), ("fingerstyle-voices-taps", r"Basic Pitch$"),
        ("hosted-apis", r"Basic Pitch \(spotify"), ("apps-survey", r"basic-pitch \(Spotify\)")]),
    ("basicpitch-io", "basicpitch.io (Basic Pitch web demo)", [
        ("audio-to-notes", r"basicpitch\.io"), ("browser-audio-sync", r"Basic Pitch web demo")]),
    ("mt3", "MT3 (Magenta)", [("audio-to-notes", r"MT3 \(Magenta\)"), ("hosted-apis", r"MT3 \(magenta/mt3\)"),
                              ("fingerstyle-voices-taps", r"MT3 / YourMT3")]),
    ("yourmt3", "YourMT3+ (and its Hugging Face Spaces)", [
        ("audio-to-notes", r"YourMT3\+"), ("hosted-apis", r"YourMT3 \(HF Spaces")]),
    ("transkun", "Transkun", [("audio-to-notes", r"Transkun$"), ("hosted-apis", r"Transkun$")]),
    ("allin1", "All-In-One (allin1)", [("chords-beats-key", r"All-In-One \(allin1\)"), ("hosted-apis", r"All-In-One \(mir-aidj")]),
    ("beat-this", "Beat This! (CPJKU)", [
        ("chords-beats-key", r"Beat This!$"), ("guitar-tab", r"Beat This! \(CPJKU; Foscarin"),
        ("browser-audio-sync", r"Beat This! \(CPJKU/beat_this"), ("hosted-apis", r"Beat This! \(HF Space")]),
    ("sonic-visualiser", "Sonic Visualiser", [("audio-to-notes", r"Sonic Visualiser"), ("chords-beats-key", r"Sonic Visualiser")]),
    ("sonic-annotator", "Sonic Annotator", [("audio-to-notes", r"Sonic Annotator"), ("chords-beats-key", r"Sonic Annotator"),
                                            ("fingerstyle-voices-taps", r"Sonic Annotator")]),
    ("vamp-sdk", "Vamp plugin SDK (vamp-simple-host)", [("audio-to-notes", r"vamp-simple-host"), ("chords-beats-key", r"Vamp plugin SDK")]),
    ("qm-vamp", "QM Vamp Plugins", [("chords-beats-key", r"QM Vamp Plugins"), ("fingerstyle-voices-taps", r"QM Vamp Plugins")]),
    ("omnizart", "Omnizart", [("audio-to-notes", r"Omnizart$"), ("chords-beats-key", r"Omnizart \(chord"),
                              ("fingerstyle-voices-taps", r"Omnizart drum")]),
    ("onsets-frames", "Onsets and Frames (Magenta)", [("audio-to-notes", r"Onsets and Frames \(Magenta\)"),
                                                      ("fingerstyle-voices-taps", r"Magenta Onsets and Frames")]),
    ("piano-transcription", "ByteDance piano transcription (piano_transcription_inference)", [
        ("audio-to-notes", r"ByteDance piano"), ("guitar-tab", r"piano-transcription-inference")]),
    ("deep-salience", "Deep Salience", [("audio-to-notes", r"Deep Salience"), ("fingerstyle-voices-taps", r"Deep Salience$")]),
    ("music21", "music21", [("audio-to-notes", r"music21$"), ("chords-beats-key", r"music21$"), ("guitar-tab", r"music21 \(tablature"),
                            ("fingerstyle-voices-taps", r"music21$"), ("web-tab-render", r"music21$")]),
    ("alphatab", "alphaTab (@coderline/alphatab)", [
        ("audio-to-notes", r"alphaTab$"), ("guitar-tab", r"alphaTab$"), ("web-tab-render", r"alphaTab \(@coderline"),
        ("browser-audio-sync", r"alphaTab$"), ("apps-survey", r"alphaTab$")]),
    ("alphatex", "alphaTex (format)", [("web-tab-render", r"alphaTex \(format\)"), ("apps-survey", r"alphaTex$")]),
    ("musescore", "MuseScore Studio (mscore command line, desktop)", [
        ("audio-to-notes", r"MuseScore 4$"), ("guitar-tab", r"MuseScore \(built-in"), ("web-tab-render", r"MuseScore Studio \(mscore")]),
    ("guitar-pro-8", "Guitar Pro 8", [("guitar-tab", r"Guitar Pro 8 \(built-in"), ("web-tab-render", r"Guitar Pro 8$"),
                                      ("apps-survey", r"Guitar Pro 8$")]),
    ("tuxguitar", "TuxGuitar", [("guitar-tab", r"TuxGuitar \(built-in"), ("web-tab-render", r"TuxGuitar \(helge17"),
                                ("apps-survey", r"TuxGuitar$")]),
    ("pyguitarpro", "PyGuitarPro", [("guitar-tab", r"PyGuitarPro$"), ("web-tab-render", r"PyGuitarPro$")]),
    ("lilypond", "LilyPond (TabStaff automatic tablature)", [("guitar-tab", r"LilyPond automatic"), ("web-tab-render", r"LilyPond \(TabStaff\)")]),
    ("tuttut", "tuttut", [("guitar-tab", r"tuttut \(Nathan"), ("fingerstyle-voices-taps", r"tuttut$")]),
    ("tutts", "tutts and tutts-alphatab", [("guitar-tab", r"tutts \(Madison"), ("web-tab-render", r"tutts and tutts-alphatab")]),
    ("chordsheetjs", "ChordSheetJS", [("web-tab-render", r"ChordSheetJS \(chordsheetjs\)"), ("apps-survey", r"ChordSheetJS$")]),
    ("soundfont-player", "soundfont-player (npm)", [("web-tab-render", r"soundfont-player \(npm\)"), ("browser-audio-sync", r"soundfont-player$")]),
    ("abcjs", "abcjs", [("web-tab-render", r"abcjs$"), ("browser-audio-sync", r"abcjs and osmd-audio-player")]),
    ("web-audio-api", "Web Audio API (AudioContext clock, start(when) scheduling)", [
        ("chords-beats-key", r"Web Audio API \(AudioContext"), ("browser-audio-sync", r"Web Audio API clock")]),
    ("realtime-bpm-analyzer", "realtime-bpm-analyzer (npm)", [("chords-beats-key", r"realtime-bpm-analyzer"),
                                                             ("browser-audio-sync", r"realtime-bpm-analyzer")]),
    ("web-audio-beat-detector", "web-audio-beat-detector (npm)", [("chords-beats-key", r"web-audio-beat-detector"),
                                                                 ("browser-audio-sync", r"web-audio-beat-detector")]),
    ("mediapipe-hand", "MediaPipe Hand Landmarker (Tasks API, Python and @mediapipe/tasks-vision)", [
        ("video-hands-fretboard", r"MediaPipe Hand Landmarker \(Tasks API\)"),
        ("browser-audio-sync", r"MediaPipe Tasks Vision \(HandLandmarker"), ("apps-survey", r"MediaPipe hand landmarker \(@mediapipe")]),
    ("ml5", "ml5.js (handPose)", [("video-hands-fretboard", r"ml5\.js handPose"), ("browser-audio-sync", r"ml5\.js$")]),
    ("opencv", "OpenCV (Python; OpenCV.js in the browser)", [("video-hands-fretboard", r"OpenCV \(Canny"),
                                                            ("browser-audio-sync", r"OpenCV\.js")]),
    ("onnxruntime", "ONNX Runtime (Python; onnxruntime-web)", [("video-hands-fretboard", r"ONNX Runtime \(onnxruntime"),
                                                              ("browser-audio-sync", r"ONNX Runtime Web")]),
    ("sam2", "Segment Anything 2 / 2.1 (SAM 2)", [("source-separation", r"SAM 2 \(Segment Anything Model 2\)"),
                                                 ("video-hands-fretboard", r"Segment Anything 2\.1")]),
    ("taptotab", "TapToTab (Ghaleb et al.)", [("apps-survey", r"TapToTab$"), ("guitar-tab", r"TapToTab \(Ghaleb"),
                                             ("video-hands-fretboard", r"TapToTab \(Ghaleb")]),
    ("guifir", "GuiFiR (hand pose from guitar video)", [("guitar-tab", r"GuiFiR \(An"), ("video-hands-fretboard", r"GuiFiR \(Weakly")]),
    ("paleari", "Paleari, Huet, Schutz, Slock: A Multimodal Approach to Music Transcription", [
        ("guitar-tab", r"Paleari"), ("video-hands-fretboard", r"Paleari")]),
    ("asmar", "Asmar, Seoud, Bilodeau: RGB-D video reading of guitar fingering", [("guitar-tab", r"Asmar"),
                                                                                  ("video-hands-fretboard", r"Asmar")]),
    ("tart", "TART (technique-aware audio-to-tablature)", [("guitar-tab", r"TART \(Technique"),
                                                          ("fingerstyle-voices-taps", r"TART \(technique")]),
    ("strum", "STRUM (spectral transcription and rhythm model)", [("guitar-tab", r"STRUM:"), ("fingerstyle-voices-taps", r"STRUM$")]),
    ("strumming-directions", "Joint Transcription of Acoustic Guitar Strumming Directions", [
        ("guitar-tab", r"Joint Transcription of Acoustic Guitar Strumming"),
        ("fingerstyle-voices-taps", r"Joint Transcription of Acoustic Guitar Strumming")]),
    ("fretting-transformer", "Fretting-Transformer", [("chords-beats-key", r"Fretting-Transformer"), ("guitar-tab", r"Fretting-Transformer")]),
    ("klangio-guitar2tabs", "Klangio Guitar2Tabs", [("guitar-tab", r"Klangio Guitar2Tabs"), ("apps-survey", r"Klangio Guitar2Tabs")]),
    ("klangio-api", "Klangio API", [("audio-to-notes", r"Klangio$"), ("chords-beats-key", r"Klangio$"), ("guitar-tab", r"Klangio API"),
                                    ("hosted-apis", r"Klangio API")]),
    ("klangio-siblings", "Klangio sibling apps (Piano2Notes, Drum2Notes, ...)", [
        ("apps-survey", r"Klangio sibling"), ("fingerstyle-voices-taps", r"Klangio Drum2Notes")]),
    ("musicai-api", "Music.AI API", [("audio-to-notes", r"Music\.AI$"), ("chords-beats-key", r"Music\.AI \(Moises\)"),
                                     ("guitar-tab", r"Music\.AI$"), ("hosted-apis", r"Music\.AI API")]),
    ("moises", "Moises (app)", [("source-separation", r"Moises / Music\.AI"), ("hosted-apis", r"Moises \(consumer"),
                                ("apps-survey", r"Moises$")]),
    ("lalal", "LALAL.AI (API)", [("source-separation", r"LALAL\.AI$"), ("hosted-apis", r"LALAL\.AI API")]),
    ("audioshake", "AudioShake (Tasks API)", [("source-separation", r"AudioShake$"), ("hosted-apis", r"AudioShake Tasks API")]),
    ("mvsep", "MVSEP (site and API)", [("source-separation", r"MVSEP \(incl"), ("hosted-apis", r"MVSEP API")]),
    ("chordify", "Chordify", [("chords-beats-key", r"Chordify"), ("apps-survey", r"Chordify"), ("hosted-apis", r"Chordify")]),
    ("chord-ai", "Chord ai", [("chords-beats-key", r"Chord ai"), ("apps-survey", r"Chord ai")]),
    ("yamaha-chord-tracker", "Yamaha Chord Tracker", [("chords-beats-key", r"Yamaha Chord Tracker"), ("apps-survey", r"Yamaha Chord Tracker")]),
    ("capo-app", "Capo (SuperMegaUltraGroovy)", [("chords-beats-key", r"Capo \(Mac and iOS"), ("apps-survey", r"Capo \(SuperMegaUltraGroovy\)")]),
    ("cyanite", "Cyanite (app and API)", [("chords-beats-key", r"Cyanite$"), ("hosted-apis", r"Cyanite API")]),
    ("getsongbpm", "GetSongBPM API", [("chords-beats-key", r"GetSongBPM API"), ("hosted-apis", r"GetSongBPM API")]),
    ("spotify-web-api", "Spotify Web API (audio features and analysis)", [("chords-beats-key", r"Spotify Web API"),
                                                                          ("hosted-apis", r"Spotify Web API")]),
    ("chordmini", "ChordMini (ChordMiniApp)", [("chords-beats-key", r"ChordMini \(ChordMiniApp\)"), ("hosted-apis", r"ChordMini$")]),
    ("anthemscore", "AnthemScore (desktop)", [("audio-to-notes", r"AnthemScore$"), ("guitar-tab", r"AnthemScore$"),
                                              ("apps-survey", r"AnthemScore 6")]),
    ("melodyne", "Melodyne", [("audio-to-notes", r"Melodyne$"), ("apps-survey", r"Melodyne 5")]),
    ("songsterr", "Songsterr (and Songsterr AI)", [("guitar-tab", r"Songsterr$"), ("apps-survey", r"Songsterr AI"), ("hosted-apis", r"Songsterr$")]),
    ("songscription", "Songscription", [("guitar-tab", r"Songscription"), ("apps-survey", r"Songscription"), ("hosted-apis", r"Songscription")]),
    ("note2tabs", "Note2Tabs", [("guitar-tab", r"Note2Tabs"), ("apps-survey", r"Note2Tabs")]),
    ("soundslice", "Soundslice (player, embed and data API)", [("web-tab-render", r"Soundslice$"), ("apps-survey", r"Soundslice$"),
                                                              ("hosted-apis", r"Soundslice data API")]),
    ("flat", "Flat.io (embed and API)", [("web-tab-render", r"Flat\.io embed"), ("hosted-apis", r"Flat\.io API")]),
    ("ableton", "Ableton Live (Convert to MIDI)", [("audio-to-notes", r"Ableton Live"), ("fingerstyle-voices-taps", r"Ableton Live")]),
    ("cesure-mcp", "Cesure MCP server / connector", [("apps-survey", r"Cesure MCP connector"), ("hosted-apis", r"Cesure MCP server")]),
    ("tabbers", "Tabbers (You Just Play)", [("apps-survey", r"Tabbers$"), ("video-hands-fretboard", r"You Just Play / Tabbers")]),
    ("replicate", "Replicate (hosted models)", [("hosted-apis", r"Replicate$"), ("chords-beats-key", r"Replicate-hosted")]),
    ("nussl", "nussl", [("source-separation", r"nussl$"), ("fingerstyle-voices-taps", r"nussl$")]),
    ("swiftf0", "SwiftF0", [("audio-to-notes", r"SwiftF0$"), ("browser-audio-sync", r"SwiftF0 browser demo")]),
    ("keyjockey", "keyjockey (npm)", [("guitar-tab", r"keyjockey"), ("web-tab-render", r"keyjockey")]),
    ("eztab-mcp", "@hidechae/eztab-mcp (EZTab MCP server)", [("guitar-tab", r"@hidechae/eztab-mcp"), ("web-tab-render", r"@hidechae/eztab-mcp")]),
]

COUNTING_RULE = (
    "A tool is one entry of kind other than \"dataset\" in a lane's tools.json, with entries that name the same "
    "software, model or service (in several lanes, or as a pointer to another lane) merged by the alias table in "
    "handoffs/count_tools.py; its status is ran-here if any merged entry has tried=true with tried_how containing "
    "local-cpu or browser-headless, else ran-elsewhere if any has tried=true (public-space or api), else for-aaron if "
    "any has for_aaron=true, else not-runnable (not run anywhere and on no list for Aaron). One exception, set by hand "
    "in the verification pass of 2026-11-12 (STATUS_OVERRIDES in count_tools.py): WebGPU has tried=true for an "
    "environment probe in which requestAdapter() returned null, so nothing ran on it; it is counted as for-aaron.")

# Status set by hand where the mechanical rule above misreads a lane's record: id -> (status, reason).
STATUS_OVERRIDES = {
    "webgpu": ("for-aaron", "tried=true marks the environment probe r0042 (and r0050), in which requestAdapter() returned "
                            "null ('No available adapters.'); r0313 skipped its WebGPU section; the lane's not_run_reason "
                            "says no adapter was found and for_aaron is true"),
}


def slug(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower().replace("+", " plus ")).strip("-")
    return s[:48].strip("-")


def load_entries():
    entries = []
    for lane in LANES:
        path = os.path.join(LANES_DIR, lane, "tools.json")
        data = json.load(open(path))
        for i, t in enumerate(data["tools"]):
            entries.append({"lane": lane, "index": i, "tool": t})
    return entries


def ran_here(t):
    return bool(t.get("tried")) and any(k in (t.get("tried_how") or "") for k in ("local-cpu", "browser-headless"))


def ran_elsewhere(t):
    return bool(t.get("tried")) and any(k in (t.get("tried_how") or "") for k in ("public-space", "api"))


def merge():
    entries = load_entries()
    compiled = [(aid, name, [(lane, re.compile(rx)) for lane, rx in pats]) for aid, name, pats in ALIASES]
    groups = {}          # id -> {"id","name","entries"}
    order = []
    alias_hits = {aid: 0 for aid, _, _ in ALIASES}
    datasets = []
    for e in entries:
        t = e["tool"]
        if t.get("kind") == "dataset":
            datasets.append(e)
            continue
        gid = None
        for aid, name, pats in compiled:
            for lane, rx in pats:
                if lane == e["lane"] and rx.match(t["name"]):
                    gid, gname = aid, name
                    break
            if gid:
                break
        if gid:
            alias_hits[gid] += 1
        else:
            gname = t["name"]
            gid = slug(t["name"])
            if gid in groups and groups[gid]["entries"][0]["lane"] != e["lane"]:
                gid = slug(e["lane"][:6] + "-" + t["name"])
            while gid in groups:   # two unaliased entries with the same slug
                gid = gid + "-2"
        if gid not in groups:
            groups[gid] = {"id": gid, "name": gname, "entries": []}
            order.append(gid)
        groups[gid]["entries"].append(e)
    tools = []
    for gid in order:
        g = groups[gid]
        ts = [x["tool"] for x in g["entries"]]
        if any(ran_here(t) for t in ts):
            status = "ran-here"
        elif any(ran_elsewhere(t) for t in ts):
            status = "ran-elsewhere"
        elif any(t.get("for_aaron") for t in ts):
            status = "for-aaron"
        else:
            status = "not-runnable"
        if gid in STATUS_OVERRIDES:
            status = STATUS_OVERRIDES[gid][0]
        g["status"] = status
        g["also_for_aaron"] = status in ("ran-here", "ran-elsewhere") and any(t.get("for_aaron") for t in ts)
        g["lanes"] = []
        for x in g["entries"]:
            if x["lane"] not in g["lanes"]:
                g["lanes"].append(x["lane"])
        tools.append(g)
    return tools, datasets, alias_hits


def dataset_key(name):
    n = name.lower()
    n = re.split(r" \(|:| and derived| v\d", n)[0]
    return re.sub(r"[^a-z0-9]+", "", n)


def main():
    tools, datasets, alias_hits = merge()
    unused = [a for a, n in alias_hits.items() if n < 2]
    if "--json" in sys.argv:
        out = []
        for g in tools:
            out.append({"id": g["id"], "name": g["name"], "status": g["status"], "lanes": g["lanes"],
                        "entries": [[x["lane"], x["index"], x["tool"]["name"]] for x in g["entries"]]})
        json.dump(out, sys.stdout, indent=1)
        return
    n_entries = sum(len(g["entries"]) for g in tools)
    by = {}
    for g in tools:
        by[g["status"]] = by.get(g["status"], 0) + 1
    print("Counting rule:", COUNTING_RULE)
    print()
    print("entries in the ten tools.json files:", n_entries + len(datasets))
    print("  of kind dataset (not counted as tools):", len(datasets),
          "-> distinct dataset names (normalized):", len({dataset_key(d['tool']['name']) for d in datasets}))
    print("  other entries:", n_entries, "-> tools after merging:", len(tools))
    print("  merged tools (two or more entries):", sum(1 for g in tools if len(g["entries"]) > 1))
    for s in ("ran-here", "ran-elsewhere", "for-aaron", "not-runnable"):
        print(f"  {s}: {by.get(s, 0)}")
    print("  ran here or elsewhere and also with steps for Aaron:", sum(1 for g in tools if g["also_for_aaron"]))
    print()
    print("entries per lane (all kinds / datasets):")
    for lane in LANES:
        a = sum(1 for g in tools for x in g["entries"] if x["lane"] == lane)
        d = sum(1 for x in datasets if x["lane"] == lane)
        print(f"  {lane}: {a + d} / {d}")
    if unused:
        print()
        print("ALIAS GROUPS MATCHING FEWER THAN TWO ENTRIES (check the patterns):", unused)


if __name__ == "__main__":
    main()
