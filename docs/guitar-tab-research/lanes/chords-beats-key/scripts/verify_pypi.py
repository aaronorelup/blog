"""verify-docs-chords-beats-key: re-read PyPI JSON for each package (independent of the survey's copies).
Prints: name, latest version, upload time of that version's first file, first-ever upload, requires_python,
license field (first 80 chars), license_expression, License classifiers. Usage: python3 -I verify_pypi.py out_dir name..."""
import json, subprocess, sys, os
out = sys.argv[1]
for name in sys.argv[2:]:
    path = os.path.join(out, name + ".json")
    r = subprocess.run(["curl", "-sS", "-L", "-o", path, "-w", "%{http_code}", f"https://pypi.org/pypi/{name}/json"],
                       capture_output=True, text=True)
    code = r.stdout.strip()
    if code != "200":
        print(f"{name}\tHTTP {code}"); continue
    d = json.load(open(path))
    info = d["info"]; rel = d.get("releases", {})
    v = info["version"]
    up = min((f["upload_time_iso_8601"] for f in rel.get(v, [])), default="?")
    allup = sorted(f["upload_time_iso_8601"] for files in rel.values() for f in files)
    first = allup[0] if allup else "?"
    last = allup[-1] if allup else "?"
    lic = (info.get("license") or "").replace("\n", " ")[:80]
    cls = [c for c in info.get("classifiers", []) if c.startswith("License")]
    print("\t".join([name, v, up, "first:" + first, "lastfile:" + last, "py:" + str(info.get("requires_python")),
                     "license:" + repr(lic), "expr:" + str(info.get("license_expression")), "cls:" + "; ".join(cls),
                     "home:" + str(info.get("home_page")), "urls:" + json.dumps(info.get("project_urls"))]))
