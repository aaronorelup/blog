"""Summarize npm registry documents saved by curl (https://registry.npmjs.org/<pkg>).

Usage: python3 -I npm_summary.py <dir with *.json>
Prints one line per package: name, dist-tags.latest, publish time of that version, license field
of that version, repository URL, number of versions, time.modified, and whether the package is deprecated.
"""
import json
import pathlib
import sys

d = pathlib.Path(sys.argv[1])
for f in sorted(d.glob("*.json")):
    try:
        doc = json.loads(f.read_text())
    except Exception as e:  # noqa: BLE001
        print(f"{f.name}\tUNREADABLE {e}")
        continue
    if "error" in doc and "name" not in doc:
        print(f"{f.name}\tnot found ({doc.get('error')})")
        continue
    name = doc.get("name")
    latest = doc.get("dist-tags", {}).get("latest")
    tags = doc.get("dist-tags", {})
    t = doc.get("time", {})
    v = doc.get("versions", {}).get(latest, {})
    lic = v.get("license")
    repo = v.get("repository") or doc.get("repository")
    if isinstance(repo, dict):
        repo = repo.get("url")
    dep = v.get("deprecated")
    print(
        f"{name}\tlatest={latest}\tpublished={t.get(latest)}\tlicense={lic}\trepo={repo}"
        f"\tversions={len(doc.get('versions', {}))}\tmodified={t.get('modified')}\tcreated={t.get('created')}"
        f"\tdeprecated={dep}\ttags={tags}"
    )
