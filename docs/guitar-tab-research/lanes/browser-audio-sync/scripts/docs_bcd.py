#!/usr/bin/env python3
"""docs-browser-audio-sync: print browser support rows from MDN browser-compat-data (BCD).

Usage: python3 -I docs_bcd.py OUTDIR  feature.path [feature.path ...]
  feature.path like api.AudioContext.outputLatency or javascript.builtins.SharedArrayBuffer
Reads https://raw.githubusercontent.com/mdn/browser-compat-data/main/<area>/<Name>.json (saved into OUTDIR).
Prints, per browser, the first support statement's version_added, plus flags/partial/prefix notes, as stored in BCD.
"""
import json
import os
import sys
import urllib.request

BROWSERS = ["chrome", "edge", "firefox", "safari", "chrome_android", "safari_ios"]
BASE = "https://raw.githubusercontent.com/mdn/browser-compat-data/main/"


def load(outdir, parts):
    if parts[0] == "javascript":
        rel = "/".join(parts[:3]) + ".json"
        keypath = parts
    else:
        rel = "/".join(parts[:2]) + ".json"
        keypath = parts
    path = os.path.join(outdir, rel.replace("/", "_"))
    if not os.path.exists(path):
        with urllib.request.urlopen(BASE + rel, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
    with open(path) as f:
        data = json.load(f)
    node = data
    for k in keypath:
        node = node[k]
    return BASE + rel, node


def fmt(stmt):
    if isinstance(stmt, str):
        return stmt  # e.g. "mirror": BCD source data copies the upstream browser's value
    if isinstance(stmt, list):
        return " | ".join(fmt(s) for s in stmt[:2])
    v = stmt.get("version_added")
    bits = [str(v)]
    if stmt.get("version_removed"):
        bits.append(f"removed {stmt['version_removed']}")
    if stmt.get("partial_implementation"):
        bits.append("partial")
    if stmt.get("flags"):
        bits.append("flag")
    if stmt.get("prefix"):
        bits.append(f"prefix {stmt['prefix']}")
    if stmt.get("alternative_name"):
        bits.append(f"as {stmt['alternative_name']}")
    if stmt.get("notes"):
        n = stmt["notes"] if isinstance(stmt["notes"], str) else " / ".join(stmt["notes"])
        bits.append("note: " + n[:160])
    return " ".join(bits)


def main():
    outdir = sys.argv[1]
    os.makedirs(outdir, exist_ok=True)
    for feat in sys.argv[2:]:
        try:
            src, node = load(outdir, feat.split("."))
        except Exception as e:  # noqa: BLE001
            print(f"{feat}: ERROR {e!r}")
            continue
        c = node.get("__compat", {})
        sup = c.get("support", {})
        status = c.get("status", {})
        row = "; ".join(f"{b} {fmt(sup[b])}" for b in BROWSERS if b in sup)
        print(f"{feat} [{src}] status={status}: {row}")


if __name__ == "__main__":
    main()
