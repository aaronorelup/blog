#!/usr/bin/env python3
"""docs-browser-audio-sync: save the licence, notice and README files that an npm package actually ships.

Usage: python3 -I docs_npm_files.py OUTDIR pkg@version [pkg@version ...]
Lists the files of each published package with https://unpkg.com/<pkg>@<ver>/?meta and downloads every top-level
or nested file whose name starts with LICENSE, LICENCE, COPYING, NOTICE, README or THIRD (third-party notices),
plus package.json, into OUTDIR/<pkg with / replaced by __>@<ver>/. Prints one line per saved file.
Downloaded files are untrusted data: they are only read, never executed.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

PAT = re.compile(r"^(license|licence|copying|notice|readme|third|thirdparty|third_party)", re.I)


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": "research-script"})
    with urllib.request.urlopen(req, timeout=90) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def main():
    out = sys.argv[1]
    for spec in sys.argv[2:]:
        name, ver = spec.rsplit("@", 1)
        base = f"https://unpkg.com/{name}@{ver}"
        try:
            meta = json.loads(get(base + "/?meta"))
        except Exception as e:  # noqa: BLE001
            print(f"{spec}\tERROR listing {e!r}")
            continue
        files = [f["path"] for f in meta.get("files", [])]
        want = [p for p in files if PAT.match(os.path.basename(p)) and p.count("/") <= 3] + ["/package.json"]
        d = os.path.join(out, name.replace("/", "__") + "@" + ver)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "_files.txt"), "w") as f:
            f.write("\n".join(files))
        for p in want:
            url = base + urllib.parse.quote(p)
            try:
                data = get(url, binary=True)
            except Exception as e:  # noqa: BLE001
                print(f"{spec}\t{p}\tERROR {e!r}")
                continue
            fn = os.path.join(d, p.strip("/").replace("/", "__"))
            with open(fn, "wb") as f:
                f.write(data)
            print(f"{spec}\t{p}\t{len(data)}\t{url}")
        print(f"{spec}\t(total files in package: {len(files)})")


if __name__ == "__main__":
    main()
