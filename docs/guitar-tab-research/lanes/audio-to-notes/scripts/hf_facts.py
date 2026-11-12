"""For each Hugging Face repo id given as kind:id (kind = models, datasets or spaces), fetch
https://huggingface.co/api/<kind>/<id>?blobs=true and the raw README.md, save both under
/home/user/gtr/lanes/audio-to-notes/fetched/hf/, and print: license tags, gated flag, lastModified,
and the file list with sizes. Used by the docs-audio-to-notes agent. Run with python3 -I."""
import json
import os
import sys
import urllib.error
import urllib.request

OUT = "/home/user/gtr/lanes/audio-to-notes/fetched/hf"
os.makedirs(OUT, exist_ok=True)


def get(url):
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b""
    except Exception as e:  # noqa: BLE001
        return str(e), b""


for arg in sys.argv[1:]:
    kind, rid = arg.split(":", 1)
    safe = rid.replace("/", "__")
    code, body = get(f"https://huggingface.co/api/{kind}/{rid}?blobs=true")
    prefix = {"models": "", "datasets": "datasets/", "spaces": "spaces/"}[kind]
    rcode, readme = get(f"https://huggingface.co/{prefix}{rid}/raw/main/README.md")
    open(f"{OUT}/{kind}__{safe}.api.json", "wb").write(body)
    open(f"{OUT}/{kind}__{safe}.README.md", "wb").write(readme)
    print(f"== {kind}/{rid}: api HTTP {code}, README HTTP {rcode} ({len(readme)} bytes)")
    if not body:
        continue
    d = json.loads(body)
    card = d.get("cardData") or {}
    lic_tags = [t for t in d.get("tags", []) if t.startswith("license:")]
    print(f"   license(card)={card.get('license')!r} license_name={card.get('license_name')!r} "
          f"tags={lic_tags} gated={d.get('gated')!r} lastModified={d.get('lastModified')} "
          f"datasets(card)={card.get('datasets')!r}")
    for s in d.get("siblings", [])[:40]:
        print(f"   {s.get('size')}\t{s.get('rfilename')}")
