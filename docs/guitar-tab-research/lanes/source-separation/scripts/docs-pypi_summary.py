import json, sys, os
d = sys.argv[1]
for f in sorted(os.listdir(d)):
    if not f.endswith('.json'): continue
    try:
        j = json.load(open(os.path.join(d, f)))
    except Exception as e:
        print(f, 'ERR', e); continue
    info = j.get('info', {})
    ver = info.get('version')
    rels = j.get('releases', {})
    times = []
    for v, files in rels.items():
        for fl in files:
            t = fl.get('upload_time_iso_8601') or fl.get('upload_time')
            if t: times.append((t, v))
    times.sort()
    latest_upload = times[-1] if times else None
    first_upload = times[0] if times else None
    cur_files = rels.get(ver, [])
    cur_time = min((fl.get('upload_time_iso_8601') or '') for fl in cur_files) if cur_files else None
    lic = info.get('license')
    if lic and len(lic) > 80: lic = lic[:80].replace('\n',' ') + '...'
    lic_expr = info.get('license_expression')
    classifiers = [c for c in info.get('classifiers', []) if c.startswith('License')]
    print(f"{info.get('name')} | version {ver} uploaded {cur_time} | first release {first_upload} | newest upload {latest_upload} | requires_python {info.get('requires_python')} | license field: {lic!r} | license_expression: {lic_expr!r} | classifiers: {classifiers} | home: {info.get('home_page')} | urls: {info.get('project_urls')}")
