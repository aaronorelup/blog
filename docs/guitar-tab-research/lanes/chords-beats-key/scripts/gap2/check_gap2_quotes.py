"""Gap round 2: find every double-quoted string (20+ characters) that this round added to the lane's record and look it
up in this round's copies of the sources, after normalising whitespace, typographic quotes and markdown link syntax.

Usage: python3 -I check_gap2_quotes.py
Added text = lines that `git diff HEAD` shows as added for the four record files (read-only git). Sources = every file
under /home/user/gtr/lanes/chords-beats-key/raw/gap2/ (text, HTML reduced to text, PDF text from pdftotext) and the
lane's earlier raw folders for quotes that this round only repeats. Prints the quotes not found, for checking by hand.
"""
import glob
import html
import json
import os
import re
import subprocess

LANE = "docs/guitar-tab-research/lanes/chords-beats-key"
RAW = "/home/user/gtr/lanes/chords-beats-key/raw"


def norm(s):
    s = html.unescape(s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)        # markdown links -> text
    s = s.replace("`", "").replace("**", "").replace("\\_", "_")
    s = re.sub(r"\s+([,.;:)])", r"\1", s)                 # space before punctuation (HTML link markup)
    s = re.sub(r"\n\s*//", " ", s)                       # Go comment markers at line starts
    s = re.sub(r"\s+", " ", s)
    return s.strip().lower()


def added_text():
    out = []
    for f in ("survey.md", "trials.md", "for-aaron.md"):
        d = subprocess.run(["git", "-C", "/home/user/blog", "diff", "HEAD", "--", "%s/%s" % (LANE, f)],
                           capture_output=True, text=True).stdout
        out.append("\n".join(l[1:] for l in d.splitlines() if l.startswith("+") and not l.startswith("+++")))
    return "\n".join(out)


def sources():
    texts = []
    for p in glob.glob(RAW + "/**/*", recursive=True):
        if not os.path.isfile(p) or os.path.getsize(p) > 3_000_000 or "/.git/" in p:
            continue
        if p.endswith(".pdf"):
            continue
        try:
            t = open(p, encoding="utf-8", errors="replace").read()
        except Exception:
            continue
        if p.endswith((".html", ".htm")) or "<html" in t[:2000].lower():
            t = re.sub(r"<[^>]+>", " ", t)
        if p.endswith(".json"):
            try:
                t = t + " " + json.dumps(json.loads(t), ensure_ascii=False)
            except Exception:
                pass
        texts.append(norm(t))
    return texts


def main():
    add = added_text()
    # pair quote marks only inside one paragraph (a run of added lines up to a blank line, a bullet or a table row);
    # a paragraph with an odd number of quote marks is reported as unbalanced instead of being paired
    paras = re.split(r"\n\s*\n|\n(?=\s*- )|\n(?=\|)|\n(?=\s*\d+\. )", add)
    quotes, unbalanced = [], []
    for para in paras:
        flat = re.sub(r"\s*\n\s*", " ", para)
        if flat.count('"') % 2:
            unbalanced.append(flat[:160])
            continue
        pos = [i for i, ch in enumerate(flat) if ch == '"']
        for a, b in zip(pos[0::2], pos[1::2]):      # pair the marks in order: 1st with 2nd, 3rd with 4th, ...
            if b - a - 1 >= 20:
                quotes.append(flat[a + 1:b])
    print("paragraphs with an odd number of quote marks: %d" % len(unbalanced))
    for u in unbalanced:
        print(" ~", u)
    src = sources()
    big = " \n ".join(src)
    missing = []
    for q in sorted(set(quotes)):
        nq = norm(q)
        if nq in big:
            continue
        # allow quotes whose " ... " elisions join two found parts
        parts = [p.strip() for p in re.split(r"\.\.\.|…", nq) if len(p.strip()) > 12]
        if parts and all(p in big for p in parts):
            continue
        missing.append(q)
    print("quoted strings checked: %d; not found in this round's raw copies: %d" % (len(set(quotes)), len(missing)))
    for q in missing:
        print(" -", q[:220])


if __name__ == "__main__":
    main()
