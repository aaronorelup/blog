"""verify-gapfill-chords-beats-key, round 2: look up every double-quoted passage that gap round 2 added to trials.md,
survey.md and for-aaron.md (the lines `git diff` shows as added against HEAD) in the sources the verifier fetched again
(/home/user/gtr/lanes/chords-beats-key/verify-gap2/raw/, plus the LiveChord wheel and Hub files there).

Text is compared after: HTML tags removed and entities decoded; PDF text from pdftotext (plain and -layout), with
line-end hyphens joined both ways; curly quotes made straight; whitespace collapsed. A passage containing "..." or
" ... " is split there and each part is looked up. Prints the passages not found, for reading by hand.
Run: python3 -I check_quotes.py
"""
import glob
import html
import json
import os
import re
import subprocess

RAW = "/home/user/gtr/lanes/chords-beats-key/verify-gap2/raw"
REPO = "/home/user/blog"
LANE = "docs/guitar-tab-research/lanes/chords-beats-key"


def norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace(" ", " ").replace(" ", " ").replace(" ", " ")
    return re.sub(r"\s+", " ", s).strip()


pool = []
for p in glob.glob(RAW + "/**/*", recursive=True):
    if os.path.isdir(p) or p.endswith((".pdf", ".safetensors", ".whl", ".gz", ".h5", ".pkl")):
        continue
    try:
        t = open(p, encoding="utf-8", errors="replace").read()
    except OSError:
        continue
    if p.endswith((".html", ".htm")) or "<html" in t[:2000].lower():
        t2 = re.sub(r"(?is)<(script|style).*?</\1>", " ", t)
        t2 = html.unescape(re.sub(r"(?s)<[^>]+>", " ", t2))
        pool.append(norm(t2))
    if p.endswith(".json"):
        try:
            d = json.loads(t)
            pool.append(norm(json.dumps(d, ensure_ascii=False)))
            if isinstance(d, dict) and isinstance(d.get("info"), dict):
                pool.append(norm(d["info"].get("description") or ""))
                pool.append(norm(d["info"].get("summary") or ""))
        except ValueError:
            pass
    pool.append(norm(t))
    if p.endswith(".txt"):
        pool.append(norm(re.sub(r"-\n", "", t)))
        pool.append(norm(re.sub(r"-\n", "-", t)))
POOL = "\n".join(pool)

diff = subprocess.run(["git", "-C", REPO, "diff", "-U0", "aa1c1d0", "--", LANE + "/trials.md", LANE + "/survey.md",
                       LANE + "/for-aaron.md"], capture_output=True, text=True).stdout
cur = None
hunks = []  # (file, [added lines]) per contiguous run of added lines
for line in diff.splitlines():
    if line.startswith("+++ "):
        cur = line[6:]
    elif line.startswith("@@"):
        hunks.append((cur, []))
    elif line.startswith("+") and not line.startswith("+++") and hunks:
        hunks[-1][1].append(line[1:])
# an opening quote follows a line start, a space or an opening bracket; a closing quote is followed by a space,
# punctuation or a line end; inline code spans are removed first (they hold code, not quotations)
QUOTE = re.compile(r'(?:(?<=^)|(?<=[\s(\[:;,]))"([^"]{12,}?)"(?=[\s).,;:\]]|$)')
found, missing = [], []
for f, lines in hunks:
    text = norm(re.sub(r"`[^`]*`", "`code`", " ".join(lines)))
    for q in QUOTE.findall(text):
        parts = [x.strip(" .") for x in re.split(r"\.\.\.|…", q) if len(x.strip(" .")) >= 8]
        if not parts:
            continue
        if all(norm(x) in POOL for x in parts):
            found.append((os.path.basename(f), q))
        else:
            missing.append((os.path.basename(f), q))
print("quoted passages found:", len(found))
print("not found as written (check by hand):", len(missing))
for f, q in missing:
    print("--", f, "|", q[:400])
