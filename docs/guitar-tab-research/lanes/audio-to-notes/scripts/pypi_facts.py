"""Print the latest version, its upload date, the first release date, the license fields and
requires_python for each PyPI package named on the command line, read from https://pypi.org/pypi/<pkg>/json.
Used by the docs-audio-to-notes agent. Run with python3 -I."""
import json
import sys
import urllib.request

for pkg in sys.argv[1:]:
    try:
        with urllib.request.urlopen(f"https://pypi.org/pypi/{pkg}/json", timeout=30) as r:
            d = json.load(r)
    except Exception as e:  # noqa: BLE001
        print(f"{pkg}\tERROR {e}")
        continue
    info = d["info"]
    ver = info["version"]
    files = d["releases"].get(ver, [])
    up = min((f["upload_time_iso_8601"] for f in files), default="?")
    first = min(
        (f["upload_time_iso_8601"] for fl in d["releases"].values() for f in fl),
        default="?",
    )
    lic = (info.get("license") or "").strip().replace("\n", " ")[:80]
    lexp = info.get("license_expression") or ""
    classifiers = [c for c in info.get("classifiers", []) if c.startswith("License")]
    print(
        f"{pkg}\t{ver}\tlatest_upload={up}\tfirst_upload={first}\tlicense={lic!r}\t"
        f"license_expression={lexp!r}\tclassifiers={classifiers}\trequires_python={info.get('requires_python')!r}\t"
        f"nreleases={len(d['releases'])}"
    )
