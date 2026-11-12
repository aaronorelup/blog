# Print name, latest version, upload time of that version, license fields, requires_python, project URLs
# from saved PyPI JSON files. Usage: python3 -I pypi_facts.py <json files...>
import json, sys
for path in sys.argv[1:]:
    d = json.load(open(path))
    i = d["info"]; v = i["version"]
    files = d["releases"].get(v, [])
    up = min((f["upload_time_iso_8601"] for f in files), default="?")
    first = min((f["upload_time_iso_8601"] for fs in d["releases"].values() for f in fs), default="?")
    lic = (i.get("license") or "").strip().replace("\n", " ")[:80]
    le = i.get("license_expression")
    cls = [c for c in i.get("classifiers", []) if c.startswith("License")]
    print(f'{i["name"]}\t{v}\t{up}\tfirst:{first}\tlicense:{lic!r}\texpr:{le}\t{cls}\treq_py:{i.get("requires_python")}\t{i.get("home_page") or (i.get("project_urls") or {})}')
