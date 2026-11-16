#!/usr/bin/env python3
"""vq.py - fetch a source and check quoted text against it, verbatim with whitespace collapsed.

  vq.py fetch URL NAME          download URL to WEB/NAME.raw (curl through the session proxy), write
                                WEB/NAME.txt (text: BeautifulSoup for HTML, pdftotext for PDF, as-is otherwise)
                                and print the HTTP status, content type and sizes.
  vq.py check NAME QUOTEFILE    QUOTEFILE holds quotes separated by lines that are exactly '---'. Each quote is
                                checked against WEB/NAME.txt (and WEB/NAME.raw when the raw file is text).
  vq.py checkfile PATH QUOTEFILE  same, against a local file (for example a file from a clone).

Result per quote:
  EXACT     the quote occurs in the source once all whitespace runs are collapsed to one space.
  EXACT-SEG the quote contains '...' elisions and every segment occurs, in order.
  TYPO      occurs only after typographic folding (curly quotes to straight, dashes to '-', NBSP to space,
            markdown ** and backslash escapes removed). Reported separately: not verbatim.
  NO        does not occur; the closest window of the source (by shared word 4-grams) is printed.
"""
import html, os, re, subprocess, sys

WEB = os.environ.get("VQ_WEB", "/home/user/gtr/lanes/video-hands-fretboard/verify/web")
UA = "Mozilla/5.0 (X11; Linux x86_64) research-fetch"


def fetch(url, name):
    os.makedirs(WEB, exist_ok=True)
    raw = os.path.join(WEB, name + ".raw")
    r = subprocess.run(["curl", "-sSL", "--max-time", "90", "-A", UA, "-o", raw, "-w",
                        "%{http_code} %{content_type} %{url_effective}", url], capture_output=True, text=True)
    info = r.stdout.strip() or r.stderr.strip()
    txt = os.path.join(WEB, name + ".txt")
    data = open(raw, "rb").read() if os.path.exists(raw) else b""
    if data[:4] == b"%PDF":
        subprocess.run(["pdftotext", "-layout", raw, txt])
        subprocess.run(["pdftotext", raw, txt + ".flow"])  # non-layout, better for running text
    elif b"<html" in data[:5000].lower() or b"<!doctype html" in data[:5000].lower():
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(data, "html.parser")
        for t in soup(["script", "style", "noscript"]):
            t.decompose()
        open(txt, "w").write(soup.get_text(" "))
        open(txt + ".nosep", "w").write(soup.get_text(""))
    else:
        open(txt, "wb").write(data)
    print(f"{name} | {info} | raw {len(data)} B | {url}")


NORM_MAP = {"‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-",
            " ": " ", "…": "...", "‑": "-", "­": "", "​": ""}


def ws(s):
    return re.sub(r"\s+", " ", s).strip()


def typo(s):
    for a, b in NORM_MAP.items():
        s = s.replace(a, b)
    s = s.replace("**", "").replace("\\", "")
    return ws(s)


def load_sources(paths):
    out = []
    for p in paths:
        if not os.path.exists(p):
            continue
        b = open(p, "rb").read()
        if b[:4] == b"%PDF":
            continue
        t = b.decode("utf-8", "replace")
        out.append(ws(t))
        if "<" in t[:2000] and ">" in t[:2000]:
            out.append(ws(html.unescape(t)))
    return out


def best_window(text, quote):
    tw = text.split(" ")
    qw = quote.split(" ")
    if len(qw) < 4:
        return "(quote too short for window search)"
    idx = {}
    for i in range(len(tw) - 3):
        idx.setdefault(" ".join(tw[i:i + 4]).lower(), []).append(i)
    votes = {}
    for j in range(len(qw) - 3):
        for i in idx.get(" ".join(qw[j:j + 4]).lower(), []):
            votes[i - j] = votes.get(i - j, 0) + 1
    if not votes:
        return "(no shared 4-word run found)"
    s, v = max(votes.items(), key=lambda kv: kv[1])
    s = max(0, s - 3)
    return f"[{v} shared 4-grams] " + " ".join(tw[s:s + len(qw) + 6])


def check(sources, quotes):
    res = []
    for q in quotes:
        qn = ws(q)
        if not qn:
            continue
        verdict = None
        if any(qn in s for s in sources):
            verdict = "EXACT"
        else:
            segs = [x for x in re.split(r"\s*(?:\.\.\.|…)\s*", qn) if len(x) >= 4]
            if len(segs) > 1:
                ok = True
                for s in sources:
                    pos, ok = 0, True
                    for seg in segs:
                        k = s.find(seg, pos)
                        if k < 0:
                            ok = False
                            break
                        pos = k + len(seg)
                    if ok:
                        break
                if ok:
                    verdict = "EXACT-SEG"
            if verdict is None:
                tq = typo(qn)
                tsegs = [x for x in re.split(r"\s*\.\.\.\s*", tq) if len(x) >= 4]
                for s in sources:
                    ts = typo(s)
                    if all(seg in ts for seg in tsegs):
                        verdict = "TYPO"
                        break
        if verdict is None:
            # PDF artifacts: ligatures and end-of-line hyphenation ("recog- nize"); then case-insensitive
            def pdfn(x):
                for a, b in (("\ufb01", "fi"), ("\ufb02", "fl"), ("\ufb00", "ff"), ("\ufb03", "ffi"), ("\ufb04", "ffl")):
                    x = x.replace(a, b)
                return re.sub(r"(\w)- (\w)", r"\1\2", typo(x))
            pq = [x for x in re.split(r"\s*\.\.\.\s*", pdfn(qn)) if len(x) >= 4]
            for s in sources:
                ps = pdfn(s)
                if all(seg in ps for seg in pq):
                    verdict = "PDFNORM"
                    break
                if all(seg.lower() in ps.lower() for seg in pq):
                    verdict = "CASE"
                    break
        if verdict is None:
            verdict = "NO"
        line = f"{verdict:9} | {qn[:160]}"
        if verdict == "NO":
            line += "\n          closest: " + best_window(typo(max(sources, key=len)) if sources else "", typo(qn))[:600]
        res.append((verdict, line))
    return res


def read_quotes(path):
    t = open(path).read()
    return [q.strip() for q in re.split(r"^---\s*$", t, flags=re.M) if q.strip()]


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "fetch":
        fetch(sys.argv[2], sys.argv[3])
    elif cmd in ("check", "checkfile"):
        if cmd == "check":
            n = sys.argv[2]
            paths = [os.path.join(WEB, n + ".txt"), os.path.join(WEB, n + ".txt.nosep"), os.path.join(WEB, n + ".txt.flow"),
                     os.path.join(WEB, n + ".raw")]
        else:
            paths = [sys.argv[2]]
        srcs = load_sources(paths)
        if not srcs:
            print("NO SOURCE TEXT for", paths)
            sys.exit(2)
        for v, line in check(srcs, read_quotes(sys.argv[3])):
            print(line)
