#!/usr/bin/env python3
"""Usage: pypi_facts.py pkg [pkg ...]
Reads https://pypi.org/pypi/<pkg>/json and prints the latest version, the upload time of its first file,
the license field, the license classifiers, requires_python, and the number of releases."""
import json, sys, urllib.request
for p in sys.argv[1:]:
    try:
        with urllib.request.urlopen(f"https://pypi.org/pypi/{p}/json", timeout=30) as f:
            d = json.load(f)
    except Exception as e:
        print(f"== {p}: ERROR {e}"); continue
    i = d["info"]; files = d.get("urls") or []
    up = min((u["upload_time_iso_8601"] for u in files), default="?")
    lic = (i.get("license") or "").strip().replace("\n", " ")[:120]
    lexp = i.get("license_expression")
    cls = [c for c in i.get("classifiers", []) if c.startswith("License")]
    kinds = sorted({u["packagetype"] for u in files})
    print(f"== {p} {i['version']} uploaded={up} license_field={lic!r} license_expression={lexp!r} classifiers={cls} requires_python={i.get('requires_python')!r} files={kinds} n_releases={len(d.get('releases', {}))}")
