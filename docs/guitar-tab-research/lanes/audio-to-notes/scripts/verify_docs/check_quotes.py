"""Re-fetch every URL named in quotes.txt and check that each quote appears in it.

verify-docs-audio-to-notes, 2026-11-10. Run with:  python3 -I check_quotes.py quotes.txt out.tsv
Fetched copies go to /home/user/gtr/lanes/audio-to-notes/verify-docs/fetched/ (outside the repo, untrusted data).

Result per quote:
  EXACT  every part of the quote (parts split on " ... ", the survey's own elision mark) is in the page, in order,
         after collapsing whitespace (HTML tags stripped, entities decoded, PDF line-end hyphens tried both ways)
  LOOSE  found only after also folding case, curly quotes, dashes and markdown marks (* _ ` \\): a typography or
         markup difference to correct
  FAIL   not found; the context column shows the page text around the longest common run, to find the real text
  FETCH  the URL did not return 200
"""
import difflib
import hashlib
import html
import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser

CACHE = "/home/user/gtr/lanes/audio-to-notes/verify-docs/fetched"
SURVEY = "/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/survey.md"
UA = "Mozilla/5.0 (X11; Linux x86_64) research-link-checker"


def parse(path):
    recs, cur = [], None
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if line.startswith("### "):
            qid, kind, sec, url = line[4:].split(" ", 3)
            cur = {"id": qid, "kind": kind, "sec": sec, "url": url.strip(), "q": ""}
            recs.append(cur)
        elif line.startswith("#") or cur is None:
            continue
        else:
            cur["q"] += " " + line
    for r in recs:
        r["q"] = " ".join(r["q"].split())
    return recs


def fetch(url):
    os.makedirs(CACHE, exist_ok=True)
    key = hashlib.sha1(url.encode()).hexdigest()[:16]
    body, meta = os.path.join(CACHE, key + ".body"), os.path.join(CACHE, key + ".meta")
    if not os.path.exists(meta):
        out = subprocess.run(
            ["curl", "-sS", "-L", "--max-time", "90", "-A", UA, "-o", body,
             "-w", "%{http_code}\t%{content_type}\t%{url_effective}", url],
            capture_output=True, text=True)
        with open(meta, "w") as f:
            f.write(out.stdout + "\t" + out.stderr.strip().replace("\n", " ") + "\t" + url)
    code, ctype, eff = (open(meta).read().split("\t") + ["", "", ""])[:3]
    return code, ctype, body if os.path.exists(body) else None


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.skip = [], 0

    INLINE = ("a", "em", "strong", "span", "code", "b", "i", "sup", "sub", "abbr", "kbd", "tt", "u", "small")

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.skip += 1
        if tag not in self.INLINE:
            self.parts.append(" ")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript") and self.skip:
            self.skip -= 1
        if tag not in self.INLINE:
            self.parts.append(" ")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def to_texts(url, ctype, path):
    raw = open(path, "rb").read()
    if raw[:5] == b"%PDF-":
        t = subprocess.run(["pdftotext", "-enc", "UTF-8", path, "-"], capture_output=True, text=True).stdout
        # PDF line-end hyphenation: try the joined word and the hyphenated word
        return [re.sub(r"-\s*\n\s*", "", t), re.sub(r"-\s*\n\s*", "-", t), t]
    t = raw.decode("utf-8", "replace")
    if url.endswith(".ipynb"):
        try:
            nb = json.loads(t)
            t = "\n".join("".join(c.get("source", [])) for c in nb.get("cells", []))
        except Exception:  # noqa: BLE001
            pass
    if "html" in ctype or t.lstrip()[:15].lower().startswith(("<!doctype", "<html")):
        p = Text()
        p.feed(t)
        return ["".join(p.parts), t]
    return [t]


def norm(s):
    s = html.unescape(s).replace(" ", " ").replace("​", "")
    return " ".join(s.split())


def loose(s):
    s = norm(s)
    s = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", s)      # markdown link or image -> its text
    s = re.sub(r"<[^>]{1,300}>", " ", s)                      # inline HTML inside markdown
    s = re.sub(r"^\s*>\s*|\s>\s(?=\[!)", " ", s)
    s = s.lower()
    for a, b in (("“", '"'), ("”", '"'), ("‘", "'"), ("’", "'"), ("–", "-"),
                 ("—", "-"), ("−", "-"), ("…", "...")):
        s = s.replace(a, b)
    s = re.sub(r"[*_`\\#]", "", s)
    s = " ".join(s.split())
    s = re.sub(r" ([,.;:)!?])", r"\1", s).replace("( ", "(")
    return s


def found_in_order(parts, doc):
    pos = 0
    for p in parts:
        i = doc.find(p, pos)
        if i < 0:
            return False
        pos = i + len(p)
    return True


def context(q, doc):
    sm = difflib.SequenceMatcher(None, q, doc, autojunk=False)
    m = sm.find_longest_match(0, len(q), 0, len(doc))
    start = max(0, m.b - m.a - 40)
    return doc[start:start + len(q) + 80], m.size


def main():
    recs = parse(sys.argv[1])
    survey_n, survey_l = norm(open(SURVEY, encoding="utf-8").read()), loose(open(SURVEY, encoding="utf-8").read())
    rows = []
    for r in recs:
        code, ctype, path = fetch(r["url"])
        q = r["q"]
        in_survey = "yes" if norm(q) in survey_n or loose(q) in survey_l else "no"
        if code != "200" or not path:
            rows.append([r["id"], r["kind"], r["sec"], r["url"], code, "FETCH", in_survey, ""])
            continue
        texts = to_texts(r["url"], ctype, path)
        parts_n = [norm(p) for p in q.split(" ... ")]
        parts_l = [loose(p) for p in q.split(" ... ")]
        res, ctx = "FAIL", ""
        if any(found_in_order(parts_n, norm(t)) for t in texts):
            res = "EXACT"
        elif any(found_in_order(parts_l, loose(t)) for t in texts):
            res = "LOOSE"
        if res != "EXACT":
            best = max((context(loose(q), loose(t)) for t in texts), key=lambda x: x[1])
            ctx = best[0]
        rows.append([r["id"], r["kind"], r["sec"], r["url"], code, res, in_survey, ctx.replace("\t", " ")])
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        f.write("id\tkind\tsection\turl\thttp\tresult\tquote_in_survey\tcontext_if_not_exact\n")
        for row in rows:
            f.write("\t".join(row) + "\n")
    tally = {}
    for row in rows:
        tally[(row[1], row[5])] = tally.get((row[1], row[5]), 0) + 1
    print(json.dumps({f"{k[0]}:{k[1]}": v for k, v in sorted(tally.items())}))


if __name__ == "__main__":
    main()
