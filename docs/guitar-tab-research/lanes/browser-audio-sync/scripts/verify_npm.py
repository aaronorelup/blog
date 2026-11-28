#!/usr/bin/env python3
"""verify-docs-browser-audio-sync: re-read npm facts independently of the docs agent.

Usage: python3 -I verify_npm.py OUTDIR pkg@version [pkg@version ...]
For each package: reads https://registry.npmjs.org/<pkg> (full document) and records dist-tags.latest, the publish
time of the named version and of latest, the version's declared licence, dist.unpackedSize, dist.fileCount and the
repository field into OUTDIR/registry.jsonl. Then lists the published files with https://unpkg.com/<pkg>@<ver>/?meta
and saves README*, LICENSE*, LICENCE*, COPYING*, NOTICE* (any depth <= 3) and package.json into OUTDIR/files/<pkg>@<ver>/.
Downloaded files are untrusted data: they are only read, never executed or imported.
"""
import json, os, re, subprocess, sys, urllib.parse
from datetime import datetime, timezone

PAT = re.compile(r"^(license|licence|copying|notice|readme)", re.I)

def curl(url):
    r = subprocess.run(["curl", "-sS", "-L", "--compressed", "--max-time", "300", "-A", "research-verifier",
                        "-w", "\n%{http_code}", url], capture_output=True)
    body, _, code = r.stdout.rpartition(b"\n")
    return int(code or 0), body

def walk(node, out):
    # unpkg ?meta: either {"files":[{"path":..}]} (flat) or nested {"type":"directory","files":[...]}
    for f in node.get("files", []) or []:
        if f.get("type") == "directory":
            walk(f, out)
        else:
            out.append((f.get("path") or f.get("name"), f.get("size")))

def main():
    out = sys.argv[1]
    os.makedirs(os.path.join(out, "files"), exist_ok=True)
    reg = open(os.path.join(out, "registry.jsonl"), "a")
    for spec in sys.argv[2:]:
        name, ver = spec.rsplit("@", 1)
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        code, body = curl("https://registry.npmjs.org/" + name.replace("/", "%2F"))
        rec = {"spec": spec, "read_utc": now, "registry_http": code}
        try:
            doc = json.loads(body)
            v = doc.get("versions", {}).get(ver, {})
            latest = doc.get("dist-tags", {}).get("latest")
            rec.update({
                "latest": latest, "time_ver": doc.get("time", {}).get(ver), "time_latest": doc.get("time", {}).get(latest),
                "license_ver": v.get("license"), "unpacked": (v.get("dist") or {}).get("unpackedSize"),
                "fileCount": (v.get("dist") or {}).get("fileCount"), "repository": v.get("repository"),
                "author": v.get("author"), "deprecated": v.get("deprecated"),
                "license_latest": doc.get("versions", {}).get(latest, {}).get("license"),
                "n_versions": len(doc.get("versions", {})),
            })
            del doc
        except Exception as e:  # noqa: BLE001
            rec["error"] = repr(e)[:200]
        reg.write(json.dumps(rec) + "\n"); reg.flush()
        print(json.dumps(rec)[:400])
        base = f"https://unpkg.com/{name}@{ver}"
        code, body = curl(base + "/?meta")
        d = os.path.join(out, "files", name.replace("/", "__") + "@" + ver)
        os.makedirs(d, exist_ok=True)
        try:
            meta = json.loads(body)
        except Exception as e:  # noqa: BLE001
            print(f"{spec}\tmeta ERROR http {code} {e!r}"[:300]); continue
        files = []
        walk(meta, files)
        with open(os.path.join(d, "_files.tsv"), "w") as f:
            f.write("\n".join(f"{p}\t{s}" for p, s in files))
        want = [p for p, _ in files if p and PAT.match(os.path.basename(p)) and p.count("/") <= 3]
        want += ["/package.json"]
        for p in sorted(set(want)):
            c, data = curl(base + urllib.parse.quote(p))
            with open(os.path.join(d, p.strip("/").replace("/", "__")), "wb") as f:
                f.write(data)
            print(f"{spec}\t{p}\t{c}\t{len(data)}")

if __name__ == "__main__":
    main()
