#!/usr/bin/env python3
"""docs-browser-audio-sync: read npm registry metadata for a list of packages.

Usage: python3 -I docs_npm_meta.py OUT.json pkg1 pkg2 ...

For each package it fetches https://registry.npmjs.org/<pkg> (the full packument, which carries the
per-version publish times) and keeps only: latest dist-tag, its publish time, the packument's last
modified time, license, unpacked size and file count of the latest version, repository, homepage,
description and any deprecation message. Nothing else is stored. Network errors are recorded, not hidden.
"""
import json
import sys
import urllib.error
import urllib.parse
import urllib.request


def fetch(pkg):
    url = "https://registry.npmjs.org/" + urllib.parse.quote(pkg, safe="@")
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "research-script"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            doc = json.load(r)
    except urllib.error.HTTPError as e:
        return {"package": pkg, "url": url, "error": f"HTTP {e.code}"}
    except Exception as e:  # noqa: BLE001 - record any failure as data
        return {"package": pkg, "url": url, "error": repr(e)}
    tags = doc.get("dist-tags", {})
    latest = tags.get("latest")
    times = doc.get("time", {})
    man = doc.get("versions", {}).get(latest, {}) if latest else {}
    dist = man.get("dist", {})
    repo = man.get("repository") or doc.get("repository")
    if isinstance(repo, dict):
        repo = repo.get("url")
    lic = man.get("license") or doc.get("license")
    if isinstance(lic, dict):
        lic = lic.get("type")
    return {
        "package": pkg,
        "url": url,
        "latest": latest,
        "latest_published": times.get(latest),
        "dist_tags": tags,
        "packument_modified": times.get("modified"),
        "created": times.get("created"),
        "license_field": lic,
        "unpacked_size_bytes": dist.get("unpackedSize"),
        "file_count": dist.get("fileCount"),
        "repository": repo,
        "homepage": man.get("homepage") or doc.get("homepage"),
        "description": man.get("description") or doc.get("description"),
        "deprecated": man.get("deprecated"),
        "n_versions": len(doc.get("versions", {})),
        "dependencies": sorted((man.get("dependencies") or {}).keys()),
    }


def main():
    out = sys.argv[1]
    rows = [fetch(p) for p in sys.argv[2:]]
    with open(out, "w") as f:
        json.dump(rows, f, indent=1)
    for r in rows:
        if "error" in r:
            print(f"{r['package']}: ERROR {r['error']}")
        else:
            dep = " DEPRECATED" if r["deprecated"] else ""
            print(f"{r['package']}\t{r['latest']}\t{(r['latest_published'] or '')[:10]}\t"
                  f"{r['license_field']}\t{r['unpacked_size_bytes']}\t{r['repository']}{dep}")


if __name__ == "__main__":
    main()
