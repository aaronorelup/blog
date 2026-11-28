"""List every audio file this lane produced under /home/user/gtr/lanes/source-separation/out/ as a markdown table
(folder, files, size, duration, sample rate / channels / subtype) for the "Media kept outside git" section.
Usage: python -I media_list.py"""
import os, glob
import soundfile as sf

ROOT = "/home/user/gtr/lanes/source-separation/out"
rows = {}
for p in sorted(glob.glob(os.path.join(ROOT, "**", "*.*"), recursive=True)):
    if not p.lower().endswith((".wav", ".flac", ".mp3")):
        continue
    d = os.path.relpath(os.path.dirname(p), ROOT)
    try:
        i = sf.info(p)
        fmt = f"{i.samplerate} Hz / {i.channels} ch / {i.subtype}"
        dur = i.frames / i.samplerate
    except Exception as e:  # mp3 or unreadable
        fmt, dur = f"(soundfile: {type(e).__name__})", None
    r = rows.setdefault(d, {"files": [], "bytes": 0, "durs": set(), "fmts": set()})
    r["files"].append(os.path.basename(p)); r["bytes"] += os.path.getsize(p)
    if dur is not None:
        r["durs"].add(round(dur, 3))
    r["fmts"].add(fmt)
total = 0
print("| folder under out/ | files | size | duration (s) | format |")
print("|---|---|---|---|---|")
for d, r in rows.items():
    total += r["bytes"]
    print(f"| `{d}` | {', '.join(r['files'])} | {r['bytes']/1e6:.1f} MB | {', '.join(str(x) for x in sorted(r['durs']))} | {'; '.join(sorted(r['fmts']))} |")
print(f"\nTotal: {total/1e6:.1f} MB in {sum(len(r['files']) for r in rows.values())} files.")
