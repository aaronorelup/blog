"""verify-docs-web-tab-render: registry facts, README head and LICENSE file of npm packages found by the
completeness search. Usage: python3 -I new_tools.py <outdir> <npm package> ...  (TSV to stdout)"""
import json, os, re, subprocess, sys, urllib.parse, urllib.request
out = sys.argv[1]
def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "research-verifier/1.0"}), timeout=60) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b""
for name in sys.argv[2:]:
    safe = name.replace("/", "__")
    code, raw = get("https://registry.npmjs.org/" + urllib.parse.quote(name, safe="@"))
    d = json.loads(raw); open(os.path.join(out, safe + ".npm.json"), "wb").write(raw)
    lat = d["dist-tags"]["latest"]; v = d["versions"][lat]
    repo = (v.get("repository") or {}).get("url", "") if isinstance(v.get("repository"), dict) else (v.get("repository") or "")
    m = re.search(r"github\.com[/:]([^/]+)/([^/.#]+)", repo or "")
    lic_file, branch, head = "", "", ""
    if m:
        gh = f"https://github.com/{m.group(1)}/{m.group(2)}"
        r = subprocess.run(["git", "ls-remote", "--symref", gh, "HEAD"], capture_output=True, text=True, timeout=60)
        mm = re.search(r"refs/heads/(\S+)\s+HEAD", r.stdout); branch = mm.group(1) if mm else ""
        head = r.stdout.split("\n")[1].split("\t")[0][:7] if r.stdout.count("\n") >= 2 else ""
        for fn in ("LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "COPYING"):
            c, body = get(f"https://raw.githubusercontent.com/{m.group(1)}/{m.group(2)}/{branch}/{fn}")
            if c == 200:
                open(os.path.join(out, safe + ".LICENSE.txt"), "wb").write(body)
                lic_file = f"{fn}: " + " ".join(body.decode("utf-8", "replace").split())[:160]
                break
        c, body = get(f"https://raw.githubusercontent.com/{m.group(1)}/{m.group(2)}/{branch}/README.md")
        if c == 200: open(os.path.join(out, safe + ".README.md"), "wb").write(body)
    readme = (d.get("readme") or "")
    if readme: open(os.path.join(out, safe + ".npm-readme.md"), "w").write(readme)
    print("\t".join([name, lat, d["time"].get(lat, "")[:10], str(v.get("license")), d["time"].get("created", "")[:10],
                     str(len(d.get("versions", {}))), repo, branch, head, (v.get("description") or "")[:120], lic_file or "no LICENSE file found"]))
