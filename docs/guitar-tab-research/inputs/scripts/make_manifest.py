#!/usr/bin/env python3
"""make_manifest.py - write /home/user/gtr/inputs/INPUTS.md from the clips on disk and copy the small files
(.json .mid .csv .txt .lab .gp5, the scripts, the check reports) to docs/guitar-tab-research/inputs/.

Usage: python make_manifest.py INPUTS_DIR DOCS_INPUTS_DIR NOTES_MD
NOTES_MD is a markdown file with the hand-written sections (sources, licenses, caveats); it is appended verbatim.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys

IDS = ["S1", "S2n", "S2s", "S3", "S4", "S5capo2", "S5dropd", "S6taps", "S7flat30",
       "R1a", "R1b", "R1c", "R2", "R2full", "R3a", "R3b", "R3c"]
MEDIA = (".wav", ".mp4", ".webm", ".flac", ".mp3", ".ogv", ".ogg", ".mov", ".mkv", ".mpeg", ".mpg")
SMALL = (".json", ".mid", ".csv", ".txt", ".lab", ".gp5")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration:stream=codec_type,codec_name,sample_rate,channels,width,height,r_frame_rate",
                          "-of", "json", path], capture_output=True, text=True).stdout
    return json.loads(out or "{}")


def main():
    root, docs, notes_md = sys.argv[1], sys.argv[2], sys.argv[3]
    rows, shas, present, missing = [], [], [], []
    for cid in IDS:
        d = os.path.join(root, cid)
        tj = os.path.join(d, cid + ".truth.json")
        if not os.path.exists(tj):
            missing.append(cid)
            continue
        present.append(cid)
        t = json.load(open(tj))
        files = []
        for dp, _, fns in os.walk(d):
            for fn in sorted(fns):
                files.append(os.path.relpath(os.path.join(dp, fn), d))
        files.sort()
        media = [f for f in files if f.lower().endswith(MEDIA)]
        small = [f for f in files if f.lower().endswith(SMALL)]
        for f in media:
            shas.append((f"{cid}/{f}", os.path.getsize(os.path.join(d, f)), sha256(os.path.join(d, f))))
        p = probe(os.path.join(d, t["audio"]))
        a = [s for s in p.get("streams", []) if s.get("codec_type") == "audio"][0]
        truthy = []
        if t["notes"]:
            truthy.append(f"{len(t['notes'])} notes")
        if t["beats"]:
            truthy.append(f"{len(t['beats'])} beats")
        if t["chords"]:
            truthy.append(f"{len(t['chords'])} chord segments")
        if t["taps"]:
            truthy.append(f"{len(t['taps'])} taps")
        if t["stems"]:
            truthy.append("stems: " + ", ".join(t["stems"]))
        src = t["source"]
        rows.append("| {id} | {files} | {dur:.3f} s | {sr} Hz / {ch} ch | {what} | {truth} | {url} | {lic}: \"{quote}\" | {attr} |".format(
            id=cid, files="<br>".join(f"`{f}`" for f in media + small), dur=float(p["format"]["duration"]),
            sr=a.get("sample_rate"), ch=a.get("channels"), what=t["what"].replace("|", "/"),
            truth=", ".join(truthy) if truthy else "none (no ground truth)",
            url=src.get("url") or "synthesized here (no URL)", lic=src.get("license", "").replace("|", "/"),
            quote=src.get("license_quote", "").replace("|", "/"), attr=src.get("attribution", "").replace("|", "/")))
        # copy small files
        for f in small:
            dst = os.path.join(docs, cid, f)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(d, f), dst)
    # checks
    os.makedirs(os.path.join(docs, "_checks"), exist_ok=True)
    for fn in sorted(os.listdir(os.path.join(root, "_checks"))):
        if fn.endswith(".json"):
            shutil.copy2(os.path.join(root, "_checks", fn), os.path.join(docs, "_checks", fn))
    with open(notes_md) as f:
        notes = f.read()
    head = notes.split("<!-- TABLE -->")[0]
    tail = notes.split("<!-- TABLE -->")[1]
    out = [head.rstrip(), "",
           "| id | files (in /home/user/gtr/inputs/&lt;id&gt;/) | duration | sample rate / channels | what it is | truth | source URL | license (quoted clause) | attribution |",
           "|---|---|---|---|---|---|---|---|---|"] + rows
    out += ["", f"Clips present: {len(present)} ({', '.join(present)}). Not present: "
            f"{', '.join(missing) if missing else 'none'} (reasons below).", "", tail.strip(), "",
            "## sha256 of every audio and video file", "", "| file | bytes | sha256 |", "|---|---|---|"]
    out += [f"| `{f}` | {b} | `{h}` |" for f, b, h in shas]
    text = "\n".join(out) + "\n"
    with open(os.path.join(root, "INPUTS.md"), "w") as f:
        f.write(text)
    with open(os.path.join(docs, "INPUTS.md"), "w") as f:
        f.write(text)
    print("present", present, "missing", missing, "media files", len(shas))


if __name__ == "__main__":
    main()
