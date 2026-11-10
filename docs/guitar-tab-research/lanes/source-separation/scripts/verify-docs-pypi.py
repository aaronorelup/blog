# verify-docs-source-separation: print version, upload time of that version, yanked flag, requires_python and
# license fields from saved PyPI JSON files (https://pypi.org/pypi/<name>/json).  Run with python3 -I.
# Usage: python3 -I verify-docs-pypi.py DIR
import json, os, sys

d = sys.argv[1]
for f in sorted(os.listdir(d)):
    if not (f.startswith('pypi_') and f.endswith('.json')):
        continue
    try:
        j = json.load(open(os.path.join(d, f)))
    except Exception as e:
        print(f, 'ERR', e)
        continue
    info = j.get('info', {})
    ver = info.get('version')
    files = j.get('releases', {}).get(ver, []) or j.get('urls', [])
    up = min((x.get('upload_time_iso_8601') or '') for x in files) if files else None
    yanked = [x.get('yanked') for x in files]
    all_up = sorted(((min((x.get('upload_time_iso_8601') or '') for x in fl), v)
                     for v, fl in j.get('releases', {}).items() if fl))
    newest = all_up[-1] if all_up else None
    lic = (info.get('license') or '')[:60].replace('\n', ' ')
    print(f"{info.get('name')} | info.version {ver} | uploaded {up} | yanked {yanked} | newest upload {newest} | "
          f"requires_python {info.get('requires_python')!r} | license {lic!r} | license_expression "
          f"{info.get('license_expression')!r} | summary {info.get('summary')!r} | project_urls {info.get('project_urls')}")
