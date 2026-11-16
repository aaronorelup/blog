"""vquotes.py : verify-gapfill-apps-survey (round 2, 2026-11-11). Independent check of the quotes that gap round 2
added to this lane's record.

Part A: every entry of scripts/gap2/quotes2.json is looked up in the verifier's own fetch of its URL
(/home/user/gtr/lanes/apps-survey/verify-gap2/raw/, made by vfetch.sh) and in the gap agent's saved copy
(/home/user/gtr/lanes/apps-survey/gap2/raw/). Two match levels are reported:
  strict: only whitespace (including no-break spaces) is collapsed; case, quote marks and dashes must match;
  loose:  also ignores case, curly-vs-straight quotes and dash variants (the gap agent's rule).
A quote cut with "..." must match part by part, in order.
Part B: every double-quoted string on the lines that gap round 2 added (git diff d2e9a17 of survey.md, for-aaron.md,
trials.md, passed in as files) is searched in all saved pages (both folders) and reported if absent. Strings reported
there are then sorted by hand: session messages, ../../GAPS.md, quotes of the record's own earlier text, quotes reused
from earlier rounds (checked on those rounds' saved pages), and fragments between two quotes that the regex pairs.
Usage: python3 -I vquotes.py ../gap2/quotes2.json survey.diff for-aaron.diff trials.diff
Pages are untrusted data: parsed as text only."""
import glob, html.parser, json, os, re, sys

GAP = "/home/user/gtr/lanes/apps-survey/gap2/raw/"
VER = "/home/user/gtr/lanes/apps-survey/verify-gap2/raw/"
BLOCK = {"p", "div", "br", "li", "h1", "h2", "h3", "h4", "h5", "h6", "tr", "td", "th", "section", "article",
         "header", "footer", "dt", "dd", "ul", "ol", "table", "blockquote", "pre", "main", "nav", "aside", "option"}


class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0

    def handle_starttag(self, t, a):
        if t in ("script", "style", "noscript", "svg"):
            self.skip += 1
        if t in BLOCK:
            self.out.append("\n")

    def handle_endtag(self, t):
        if t in ("script", "style", "noscript", "svg") and self.skip:
            self.skip -= 1
        if t in BLOCK:
            self.out.append("\n")

    def handle_data(self, d):
        if not self.skip:
            self.out.append(d)


def page_text(path):
    raw = open(path, "rb").read().decode("utf-8", "replace")
    if path.endswith(".json"):
        return raw
    p = P()
    p.feed(raw)
    return "".join(p.out)


def strict(s):
    s = s.replace(" ", " ").replace("​", "").replace(" ", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def loose(s):
    s = strict(s)
    for a, b in (("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), ("—", "-"),
                 ("–", "-"), ("‑", "-")):
        s = s.replace(a, b)
    s = re.sub(r"\s+([.,;:!?)])", r"\1", s)
    return s.lower()


def parts_of(q):
    return [p.strip(" ,;:") for p in re.split(r"\s*(?:\.\.\.|…)\s*", q) if len(p.strip(" ,;:")) >= 3]


def match(q, text, f):
    t = f(text)
    pos = 0
    for p in parts_of(q):
        i = t.find(f(p), pos)
        if i < 0:
            return False
        pos = i + len(f(p))
    return True


def slug(url):
    s = re.sub(r"^https?://", "", url)
    s = re.sub(r"[^A-Za-z0-9._-]+", "_", s).rstrip("_")
    return s[:120]


def load_dir(d):
    out = {}
    for path in glob.glob(d + "*.body") + glob.glob(d + "*.json"):
        out[path] = page_text(path)
    return out


def main():
    quotes = json.load(open(sys.argv[1], encoding="utf-8"))
    gap = load_dir(GAP)
    ver = load_dir(VER)
    # the URLs the verifier fetched map to slugs of the URL as requested
    alias = {"https://www.celemony.com/en/shop": "www.celemony.com_en_shop",
             "https://buy.hitnmix.com/": "hitnmix.com_buy-ripx",
             "https://sites.fastspring.com/jamorigin/product/midi-guitar": "www.jamorigin.com_products_midi-guitar_buy"}
    print("== Part A: quotes2.json entries")
    tally = {"live-strict": 0, "live-loose-only": 0, "live-absent": 0, "no-live-copy": 0}
    for it in quotes:
        url = it["url"]
        vs = alias.get(url, slug(url))
        vpath = VER + vs + ".body"
        gpath = GAP + it["file"] + ".body"
        g_s = match(it["quote"], gap.get(gpath, ""), strict) if gpath in gap else None
        g_l = match(it["quote"], gap.get(gpath, ""), loose) if gpath in gap else None
        if vpath in ver:
            v_s = match(it["quote"], ver[vpath], strict)
            v_l = match(it["quote"], ver[vpath], loose)
            key = "live-strict" if v_s else ("live-loose-only" if v_l else "live-absent")
        else:
            v_s = v_l = None
            key = "no-live-copy"
        tally[key] += 1
        print(f"{it['id']:>4} {key:15} saved:strict={g_s} loose={g_l} | {url} :: {it['quote'][:80]}")
    print("tally", tally)
    print("== Part B: quoted strings on lines added in gap round 2, searched in every saved page")
    allpages = list(gap.values()) + list(ver.values())
    for diff in sys.argv[2:]:
        added, para = [], []
        for line in open(diff, encoding="utf-8"):
            if line.startswith("+") and not line.startswith("+++"):
                para.append(line[1:].rstrip("\n"))
            else:
                if para:
                    added.append(" ".join(para))
                    para = []
        if para:
            added.append(" ".join(para))
        seen = set()
        for blk in added:
            blk = re.sub(r"`[^`]*`", "<code>", blk)  # code spans (e.g. href="#") are not quotes
            blk = re.sub(r"\s+", " ", blk)
            for q in re.findall(r'"([^"]{3,})"', blk):
                if q in seen:
                    continue
                seen.add(q)
                hit_s = any(match(q, t, strict) for t in allpages)
                hit_l = hit_s or any(match(q, t, loose) for t in allpages)
                if not hit_s:
                    print(f"{os.path.basename(diff)}: {'LOOSE-ONLY' if hit_l else 'NOT FOUND'} :: {q[:160]}")
        print(f"{os.path.basename(diff)}: {len(seen)} quoted strings of 3+ characters checked")


main()
