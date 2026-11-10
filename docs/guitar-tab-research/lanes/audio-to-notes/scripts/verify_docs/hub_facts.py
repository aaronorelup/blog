"""Re-read Hugging Face and PyPI facts quoted in survey.md (verify-docs-audio-to-notes, 2026-11-10).

Hugging Face: https://huggingface.co/api/{models|datasets|spaces}/<id>?blobs=true -> license tag (cardData and
tags), gated, lastModified, and the size of each file named. PyPI: https://pypi.org/pypi/<pkg>/json -> latest
version, upload time of that version's first file, first upload ever, license fields, requires_python.
Run: python3 -I hub_facts.py > out.txt
"""
import json
import urllib.request

UA = {"User-Agent": "research-link-checker"}

HF = [
    ("models", "ChiTu/FCPE"),
    ("datasets", "lars1234/pitch-benchmark"),
    ("models", "maxrmorrison/fcnf0-plus-plus"),
    ("models", "gudgud1014/MR-MT3"),
    ("models", "MuScriptor/muscriptor-small"),
    ("models", "MuScriptor/muscriptor-medium"),
    ("models", "MuScriptor/muscriptor-large"),
    ("models", "DamRsn/muscriptor-gguf"),
    ("models", "lj1995/VoiceConversionWebUI"),
    ("spaces", "mimbres/YourMT3"),
    ("spaces", "cwitkowitz/timbre-trap"),
    ("datasets", "loubb/aria-midi"),
]
WANT = ("rmvpe", "fcpe", "ddsp", ".pt", ".pth", ".ckpt", ".safetensors", ".gguf", ".onnx", "license", "readme")

PYPI = ["basic-pitch", "crepe", "torchcrepe", "librosa", "pesto-pitch", "torchfcpe", "swift-f0", "penn", "aubio",
        "essentia", "essentia-tensorflow", "muscriptor", "omnizart", "piano-transcription-inference", "transkun",
        "crepe-notes", "aria-amt", "rmvpe", "timbre-trap", "hft-transformer", "sheetsage", "mt3", "neuralnote"]


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)


for kind, rid in HF:
    try:
        d = get(f"https://huggingface.co/api/{kind}/{rid}?blobs=true")
    except Exception as e:  # noqa: BLE001
        print(f"HF {kind}/{rid}\tERROR {e}")
        continue
    card = d.get("cardData") or {}
    lic_tags = [t for t in d.get("tags", []) if t.startswith("license:")]
    files = [(s["rfilename"], s.get("size")) for s in d.get("siblings", [])
             if any(w in s["rfilename"].lower() for w in WANT)]
    print(f"HF {kind}/{rid}\tcard.license={card.get('license')!r}\ttags={lic_tags}\tgated={d.get('gated')!r}\t"
          f"private={d.get('private')!r}\tlastModified={d.get('lastModified')}\tsdk={d.get('sdk', card.get('sdk'))}\t"
          f"nfiles={len(d.get('siblings', []))}")
    for name, size in files[:40]:
        print(f"    {name}\t{size}")

for pkg in PYPI:
    try:
        d = get(f"https://pypi.org/pypi/{pkg}/json")
    except Exception as e:  # noqa: BLE001
        print(f"PYPI {pkg}\tERROR {e}")
        continue
    info, rel = d["info"], d["releases"]
    ver = info["version"]
    up = min((f["upload_time_iso_8601"] for f in rel.get(ver, [])), default="?")
    first = min((f["upload_time_iso_8601"] for fl in rel.values() for f in fl), default="?")
    lic = (info.get("license") or "").strip().replace("\n", " ")[:90]
    cls = [c for c in info.get("classifiers", []) if c.startswith("License")]
    yanked = [v for v, fl in rel.items() if fl and all(f.get("yanked") for f in fl)]
    print(f"PYPI {pkg}\t{ver}\tuploaded={up}\tfirst={first}\tnreleases={len(rel)}\tlicense={lic!r}\t"
          f"license_expression={info.get('license_expression')!r}\tclassifiers={cls}\t"
          f"requires_python={info.get('requires_python')!r}\tyanked={yanked}")
