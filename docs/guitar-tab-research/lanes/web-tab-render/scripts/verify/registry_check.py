"""verify-docs-web-tab-render: re-read npm, PyPI and crates.io metadata for every package the survey names.
Usage: python3 -I registry_check.py <outdir>   (downloads go to <outdir>, a TSV summary to stdout)"""
import json, sys, os, urllib.request, urllib.parse
out = sys.argv[1]
NPM = ["@coderline/alphatab", "@coderline/alphatab-vite", "@coderline/alphatab-webpack", "@coderline/alphatab-monaco",
       "@coderline/alphatab-language-server", "@coderline/alphatab-react", "@coderline/alphatab-ui", "@coderline/alphaskia",
       "vexflow", "vextab", "vexchords", "opensheetmusicdisplay", "osmd-audio-player", "abcjs", "verovio", "webmscore",
       "chordsheetjs", "svguitar", "tonal", "react-guitar", "react-guitar-sound", "@moonwave99/fretboard.js",
       "@tombatossals/chords-db", "@tombatossals/react-chords", "jtab", "abc2svg", "flat-embed", "flat-api",
       "guitarpro-parser", "@jbfullstack/score-parser", "@musicbird/gpx-parser", "soundfont-player"]
PYPI = ["PyGuitarPro", "music21", "verovio", "lilypond", "abjad", "python-ly", "ApolloTab"]
CRATES = ["guitarpro"]
def get(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "research-verifier/1.0", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
            code = r.status
    except urllib.error.HTTPError as e:
        return e.code, None
    open(path, "wb").write(data)
    return code, json.loads(data)
print("registry\tpackage\thttp\tlatest\tlatest_published\tlicense\tdeprecated\tn_versions\tfirst_published\tother_tags")
for p in NPM:
    code, d = get("https://registry.npmjs.org/" + urllib.parse.quote(p, safe="@"), os.path.join(out, "npm", p.replace("/", "__") + ".json"))
    if not d:
        print(f"npm\t{p}\t{code}"); continue
    tags = d.get("dist-tags", {}); lat = tags.get("latest"); v = d.get("versions", {}).get(lat, {})
    t = d.get("time", {})
    lic = v.get("license") if not isinstance(v.get("license"), dict) else v["license"].get("type")
    print(f"npm\t{p}\t{code}\t{lat}\t{t.get(lat)}\t{lic}\t{v.get('deprecated')}\t{len(d.get('versions', {}))}\t{t.get('created')}\t{ {k:x for k,x in tags.items() if k!='latest'} }")
for p in PYPI:
    code, d = get(f"https://pypi.org/pypi/{p}/json", os.path.join(out, "pypi", p + ".json"))
    if not d:
        print(f"pypi\t{p}\t{code}"); continue
    i = d["info"]; ver = i["version"]; files = d.get("urls", [])
    up = min((f["upload_time_iso_8601"] for f in files), default=None)
    print(f"pypi\t{p}\t{code}\t{ver}\t{up}\tlicense={i.get('license')!r} expr={i.get('license_expression')!r}\tyanked={i.get('yanked')}\t{len(d.get('releases', {}))}\t\trequires_python={i.get('requires_python')}")
for p in CRATES:
    code, d = get(f"https://crates.io/api/v1/crates/{p}", os.path.join(out, "crates_" + p + ".json"))
    if not d:
        print(f"crates\t{p}\t{code}"); continue
    c = d["crate"]; vs = d.get("versions", [])
    newest = c.get("max_stable_version") or c.get("newest_version")
    vv = next((x for x in vs if x["num"] == newest), {})
    print(f"crates\t{p}\t{code}\t{newest}\t{vv.get('created_at')}\t{vv.get('license')}\t{vv.get('yanked')}\t{len(vs)}\t{c.get('created_at')}\trepo={c.get('repository')}")
