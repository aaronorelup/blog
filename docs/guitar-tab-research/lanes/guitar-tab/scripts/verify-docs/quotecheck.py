#!/usr/bin/env python3
"""Check quoted text against saved source files.

Input: a JSON file with a list of checks {"id", "src" (path or list of paths), "quote", "kind"}.
A quote may contain " ... " (or "...") to mark omitted text; each fragment must appear, in order.
Levels: STRICT = whitespace-normalised match; LOOSE = also ignores markdown emphasis/backticks,
typographic quote and dash differences and case; else NOT FOUND with the longest matching prefix.
"""
import html
import json
import re
import sys


def to_text(path):
    raw = open(path, encoding="utf-8", errors="replace").read()
    if path.endswith(".json") and not path.endswith("instruments.json"):
        try:
            data = json.loads(raw)
            parts = []

            def walk(x):
                if isinstance(x, dict):
                    for v in x.values():
                        walk(v)
                elif isinstance(x, list):
                    for v in x:
                        walk(v)
                elif isinstance(x, str):
                    parts.append(x)
            walk(data)
            raw = "\n".join(parts)
        except Exception:
            pass
    if path.endswith((".html", ".htm", ".json")) and "<" in raw and ">" in raw:
        raw = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", raw)
        raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    raw = html.unescape(raw)
    return raw


def norm_strict(s):
    s = s.replace(" ", " ")
    return re.sub(r"\s+", " ", s).strip()


def norm_loose(s):
    s = norm_strict(s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace("‐", "-").replace("‑", "-")
    s = s.replace("…", "...")
    s = re.sub(r"[*_`\\]", "", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)  # markdown links -> text
    s = re.sub(r"\s+", " ", s)
    return s.lower().strip()


def fragments(q):
    parts = re.split(r"\s*(?:\.\.\.|…)\s*", q)
    return [p for p in parts if p.strip()]


def find_in_order(text, frags):
    pos = 0
    for f in frags:
        i = text.find(f, pos)
        if i < 0:
            return False, f
        pos = i + len(f)
    return True, None


def longest_prefix(text, frag):
    lo, hi = 0, len(frag)
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if frag[:mid] in text:
            lo = mid
        else:
            hi = mid - 1
    return frag[:lo]


def main():
    checks = json.load(open(sys.argv[1]))
    out = []
    for c in checks:
        srcs = c["src"] if isinstance(c["src"], list) else [c["src"]]
        text = ""
        for s in srcs:
            try:
                text += "\n" + to_text(s)
            except FileNotFoundError:
                text += ""
        st = norm_strict(text)
        lo = norm_loose(text)
        q = c["quote"]
        fr = fragments(q)
        ok, _ = find_in_order(st, [norm_strict(f) for f in fr])
        if ok:
            res, detail = "STRICT", ""
        else:
            ok2, miss = find_in_order(lo, [norm_loose(f) for f in fr])
            if ok2:
                res, detail = "LOOSE", ""
            else:
                res = "NOT-FOUND"
                detail = "missing fragment: %r ; longest prefix found: %r" % (miss[:120], longest_prefix(lo, miss)[-80:])
        out.append((c["id"], c.get("kind", ""), res, detail))
        print("%-28s %-8s %-9s %s" % (c["id"], c.get("kind", ""), res, detail))
    n = len(out)
    print("TOTAL %d  STRICT %d  LOOSE %d  NOT-FOUND %d" % (
        n, sum(1 for o in out if o[2] == "STRICT"), sum(1 for o in out if o[2] == "LOOSE"),
        sum(1 for o in out if o[2] == "NOT-FOUND")))


if __name__ == "__main__":
    main()
