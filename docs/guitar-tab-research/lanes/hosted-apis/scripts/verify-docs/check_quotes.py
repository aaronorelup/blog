#!/usr/bin/env python3
"""check_quotes.py SURVEY.md RAWDIR OUT.json

Pulls every double-quoted string out of SURVEY.md (code spans kept whole, nested quotes handled),
normalises it (curly quotes, NBSP, markdown bold/code/link marks, whitespace), splits it on "..."
ellipses, and looks for every fragment, in order, in every page saved in RAWDIR (pandoc text,
BeautifulSoup text of the HTML, and all string values of JSON or YAML files). Writes one record per
quote: survey line, section, quote, pages where it was found exactly, and the best fuzzy score
when it was not. Written by verify-docs-hosted-apis, 2026-11-10. Run with python -I.
"""
import glob
import html
import json
import os
import re
import sys
import unicodedata

import yaml
from bs4 import BeautifulSoup
from rapidfuzz import fuzz

MD_LINK = re.compile(r"\[([^\]]+)\]\((?:[^)]+)\)")


def norm(s: str) -> str:
    s = html.unescape(s)
    s = unicodedata.normalize("NFKC", s)
    for a, b in (("‘", "'"), ("’", "'"), ("“", '"'), ("”", '"'),
                 (" ", " "), ("​", ""), ("′", "'"), ("­", "")):
        s = s.replace(a, b)
    s = MD_LINK.sub(r"\1", s)
    s = s.replace("**", "").replace("`", "")
    s = re.sub(r"\\([\\\"'*_\[\]()#.!-])", r"\1", s)  # markdown / JSON backslash escapes
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def strings_of(obj, out):
    if isinstance(obj, str):
        out.append(obj)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            out.append(str(k))
            strings_of(v, out)
    elif isinstance(obj, list):
        for v in obj:
            strings_of(v, out)


def page_texts(rawdir):
    pages = {}
    for meta in sorted(glob.glob(os.path.join(rawdir, "*.meta"))):
        name = os.path.basename(meta)[:-5]
        raw_p = os.path.join(rawdir, name + ".raw")
        txt_p = os.path.join(rawdir, name + ".txt")
        variants = []
        try:
            raw = open(raw_p, "rb").read().decode("utf-8", "replace")
        except OSError:
            continue
        variants.append(raw)
        if os.path.exists(txt_p):
            variants.append(open(txt_p, "rb").read().decode("utf-8", "replace"))
        head = raw[:600].lower()
        if "<html" in head or "<!doctype html" in head:
            try:
                variants.append(BeautifulSoup(raw, "lxml").get_text(" "))
            except Exception:
                pass
        else:
            parsed = None
            try:
                parsed = json.loads(raw)
            except Exception:
                try:
                    parsed = yaml.safe_load(raw)
                except Exception:
                    parsed = None
            if isinstance(parsed, (dict, list)):
                acc = []
                strings_of(parsed, acc)
                variants.append("\n".join(acc))
        pages[name] = {"url": open(meta).read().split()[-2] if len(open(meta).read().split()) > 4 else open(meta).read().split()[-1],
                       "texts": [norm(v) for v in variants]}
    return pages


def logical_lines(md_lines):
    """Join wrapped markdown lines into one logical line per bullet or paragraph."""
    cur, start = None, 0
    for i, line in enumerate(md_lines, 1):
        new_item = (not line.strip()) or re.match(r"^\s*(- |\d+\. |#)", line) or not line.startswith(" ")
        if new_item:
            if cur is not None:
                yield start, cur
            cur, start = (line if line.strip() else None), i
        else:
            cur = (cur + " " + line.strip()) if cur is not None else line.strip()
    if cur is not None:
        yield start, cur


def extract_quotes(md_lines):
    """Return (line_no, section, quote) for each top-level double-quoted string."""
    out = []
    section = ""
    for i, line in logical_lines(md_lines):
        if line.startswith("## "):
            section = line[3:].strip()
            continue
        # protect code spans
        spans = []

        def keep(m):
            spans.append(m.group(0))
            return "\x00%d\x00" % (len(spans) - 1)

        prot = re.sub(r"`[^`]*`", keep, line)
        stack = []
        start = None
        for j, ch in enumerate(prot):
            if ch != '"':
                continue
            prev = prot[j - 1] if j > 0 else " "
            nxt = prot[j + 1] if j + 1 < len(prot) else " "
            opener = (prev in " ([{:/-—" or j == 0) and not nxt.isspace()
            if not stack:
                if opener:
                    stack.append(j)
                    start = j
            else:
                if opener and prev == " " and (nxt.isalnum()):
                    stack.append(j)  # nested quote inside a quote
                else:
                    stack.pop()
                    if not stack:
                        q = prot[start + 1:j]
                        q = re.sub(r"\x00(\d+)\x00", lambda m: spans[int(m.group(1))], q)
                        out.append((i, section, q))
        # quotes that run to the next line are rare; flag them
        if stack:
            q = prot[start + 1:]
            q = re.sub(r"\x00(\d+)\x00", lambda m: spans[int(m.group(1))], q)
            out.append((i, section, q + " <<UNCLOSED>>"))
    return out


def fragments(q):
    nq = norm(q)
    nq = nq.replace("<<UNCLOSED>>", "")
    parts = re.split(r"\s*\.\.\.\s*|\s*\[\.\.\.\]\s*", nq)
    return [p.strip(" ;,") for p in parts if len(p.strip(" ;,")) >= 4]


def find_in_order(frags, text):
    pos = 0
    for f in frags:
        k = text.find(f, pos)
        if k < 0:
            return False
        pos = k + len(f)
    return True


def main():
    survey, rawdir, outp = sys.argv[1], sys.argv[2], sys.argv[3]
    pages = page_texts(rawdir)
    lines = open(survey, encoding="utf-8").read().split("\n")
    results = []
    for ln, sec, q in extract_quotes(lines):
        frags = fragments(q)
        rec = {"line": ln, "section": sec, "quote": q, "found": [], "found_ci": [], "best": None}
        if not frags:
            rec["skip"] = "too short"
            results.append(rec)
            continue
        for name, p in pages.items():
            if any(find_in_order(frags, t) for t in p["texts"]):
                rec["found"].append(name)
            else:
                variants = [frags, [re.sub(r"\[(\w{1,12})\]", r"\1", f) for f in frags]]
                if any(find_in_order(v, t) for v in variants[1:] for t in p["texts"]):
                    rec["found"].append(name + "(brackets)")
                elif any(find_in_order([f.lower() for f in frags], t.lower()) for t in p["texts"]):
                    rec["found_ci"].append(name)
        if not rec["found"] and not rec["found_ci"]:
            best = (0, None, None)
            longest = max(frags, key=len)
            for name, p in pages.items():
                for t in p["texts"]:
                    if len(longest) > 5000:
                        continue
                    al = fuzz.partial_ratio_alignment(longest, t, score_cutoff=best[0])
                    if al and al.score > best[0]:
                        best = (al.score, name, t[al.dest_start:al.dest_end])
            rec["best"] = {"score": round(best[0], 1), "page": best[1], "text": best[2]}
        results.append(rec)
    json.dump(results, open(outp, "w"), indent=1, ensure_ascii=False)
    n = len(results)
    nf = sum(1 for r in results if r["found"])
    nci = sum(1 for r in results if not r["found"] and r["found_ci"])
    nsk = sum(1 for r in results if r.get("skip"))
    print(f"quotes={n} exact={nf} case-insensitive-only={nci} too-short={nsk} not-found={n-nf-nci-nsk}")


if __name__ == "__main__":
    main()
