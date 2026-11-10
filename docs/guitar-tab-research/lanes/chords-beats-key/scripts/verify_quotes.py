"""verify-docs-chords-beats-key: check every double-quoted string in survey.md against the live sources of its section.

Usage: python3 -I verify_quotes.py SURVEY CACHE_DIR OUT_TSV [--refetch]
Each section ("## " heading) has a list of source URLs (the ones the survey cites, plus source files it cites by
path). Every URL is fetched once with curl into CACHE_DIR; HTML is reduced to text. A quote is split on "...",
"[...]" and the ellipsis character, and each piece is searched in every source of the section after collapsing
whitespace ("ws"), and then after also unifying quote marks and dashes and dropping markdown/RST markup ("loose").
Output columns: section, status (WS / LOOSE / MISSING / FETCH-FAIL), source where found, the quote.
A MISSING line is not a verdict: nested quotes in code snippets split badly, so every MISSING line is read by hand."""
import hashlib, html, html.parser, json, os, re, subprocess, sys

RAW = "https://raw.githubusercontent.com/"
def gh(repo, branch, *paths):
    return [f"{RAW}{repo}/{branch}/{p}" for p in paths]

BT = gh("CPJKU/beat_this", "main", "README.md", "LICENSE", "beat_this/inference.py", "beat_this/utils.py", "hubconf.py")
HARMONIX = gh("urinieto/harmonixset", "main", "LICENSE", "README.md")
BEATNET = gh("mjhydri/BeatNet", "main", "README.md", "LICENSE")
ALLIN1 = gh("mir-aidj/all-in-one", "main", "README.md", "LICENSE", "src/allin1/demix.py", "src/allin1/models/loaders.py",
            "pyproject.toml") + ["https://huggingface.co/api/models/taejunkim/allinone",
                                  "https://huggingface.co/taejunkim/allinone/raw/main/README.md"]
MADMOM = gh("CPJKU/madmom", "main", "LICENSE", "README.rst", "madmom/features/chords.py", "madmom/features/downbeats.py",
            "madmom/features/key.py", "madmom/features/tempo.py", "madmom/features/beats.py") + \
         gh("CPJKU/madmom_models", "master", "README.rst", "LICENSE") + ["https://pypi.org/pypi/madmom/json"]
NNLS = gh("c4dm/nnls-chroma", "master", "README", "COPYING", "chromamethods.cpp") + ["https://www.vamp-plugins.org/download.html"]
QM = gh("c4dm/qm-vamp-plugins", "master", "README.md", "COPYING")
VAMP = gh("c4dm/vampy-host", "master", "README.rst", "COPYING.rst") + ["https://pypi.org/pypi/vamp/json"]
CHORDEXT = gh("ohollo/chord-extractor", "master", "README.md", "LICENSE", "chord_extractor/extractors.py",
              "chord_extractor/base.py") + ["https://pypi.org/pypi/chord-extractor/json"]
AUTOCHORD = gh("cjbayron/autochord", "main", "README.md", "LICENSE", "src/autochord/__init__.py",
               "model-development/dataloader.py") + ["https://pypi.org/pypi/autochord/json"]
BTC = gh("jayg996/BTC-ISMIR19", "master", "README.md", "LICENSE", "test.py", "run_config.yaml")
CREMA = gh("bmcfee/crema", "main", "README.md", "LICENSE.md") + ["https://pypi.org/pypi/crema/json"]
LV = gh("music-x-lab/ISMIR2019-Large-Vocabulary-Chord-Recognition", "master", "README.MD", "LICENSE") + \
     ["https://pypi.org/pypi/lv-chordia/json"]
CHORDMINI = gh("ptnghia-j/ChordMiniApp", "main", "README.md", "LICENSE")
OMNI = gh("Music-and-Culture-Technology-Lab/omnizart", "main", "README.md", "LICENSE", "omnizart/chord/app.py",
          "omnizart/chord/inference.py", "omnizart/defaults/chord.yaml", "omnizart/beat/app.py", "pyproject.toml") + \
       ["https://pypi.org/pypi/omnizart/json"]
HT = gh("Tsung-Ping/Harmony-Transformer", "master", "README.md") + gh("Tsung-Ping/Harmony-Transformer-v2", "master", "README.md")
ACR = gh("KimLeekyung/ACR_seq2seq", "main", "README.md")
PYACE = gh("tangkk/pyace", "master", "LICENSE")
LIBROSA = gh("librosa/librosa", "main", "LICENSE.md", "librosa/beat.py", "librosa/feature/rhythm.py",
             "librosa/core/pitch.py", "librosa/version.py") + ["https://pypi.org/pypi/librosa/json"]
ESS = ["https://essentia.upf.edu/models.html", "https://essentia.upf.edu/licensing_information.html"] + \
      [f"https://essentia.upf.edu/reference/std_{n}.html" for n in
       ("KeyExtractor", "TuningFrequency", "RhythmExtractor2013", "ChordsDetection", "TempoCNN")] + \
      gh("MTG/essentia", "master", "COPYING.txt") + gh("MTG/essentia.js", "master", "LICENSE") + \
      ["https://pypi.org/pypi/essentia/json"]
AUBIO = gh("aubio/aubio", "master", "README.md", "COPYING") + ["https://pypi.org/pypi/aubio/json"]
TEMPOCNN = gh("hendriks73/tempo-cnn", "main", "README.rst", "LICENSE") + ["https://pypi.org/pypi/tempocnn/json"]
DEEPR = gh("bleugreen/deeprhythm", "main", "README.md", "LICENSE") + ["https://pypi.org/pypi/deeprhythm/json"]
BTF = gh("zhaojw1998/Beat-Transformer", "main", "README.md", "LICENSE")
BEAST = gh("WildHoneyPie/BEAST", "main", "README.md", "LICENSE")
RTBPM = gh("dlepaux/realtime-bpm-analyzer", "main", "readme.md", "license.md") + ["https://registry.npmjs.org/realtime-bpm-analyzer"]
KEYF = gh("mixxxdj/libkeyfinder", "main", "README.md", "LICENSE") + gh("EvanPurkhiser/keyfinder-cli", "main", "README.md", "LICENSE")
SKEY = gh("deezer/skey", "main", "README.md", "LICENSE")
M21 = gh("cuthbertLab/music21", "master", "LICENSE", "music21/analysis/discrete.py", "music21/converter/subConverters.py") + \
      ["https://pypi.org/pypi/music21/json"]
TUNING = gh("edhulme/guitar-tuning-classification", "main", "README.md") + \
         ["https://hajim.rochester.edu/ece/sites/zduan/teaching/ece477/projects/2023/DeclanParker_McCormackChew_FinalReport.pdf"]

SECTIONS = {  # heading prefix -> sources
    "Beat This!": BT + gh("CPJKU/beat_this_annotations", "main", "README.md") + HARMONIX +
                  ["https://zenodo.org/api/records/3371780"],
    "BeatNet": BEATNET, "All-In-One": ALLIN1 + HARMONIX, "madmom": MADMOM + BT + BEATNET + ALLIN1,
    "Chordino": NNLS, "QM Vamp": QM, "vamp (Python": VAMP + CHORDEXT, "chord-extractor": CHORDEXT,
    "autochord": AUTOCHORD + NNLS, "BTC": BTC, "CREMA": CREMA, "lv-chordia": LV + CHORDMINI, "ChordMini": CHORDMINI,
    "Omnizart": OMNI, "Harmony Transformer": HT, "ACR_seq2seq": ACR, "ChordFormer": PYACE, "librosa": LIBROSA,
    "Essentia": ESS, "aubio": AUBIO, "tempo-cnn": TEMPOCNN, "DeepRhythm": DEEPR, "Beat Transformer": BTF,
    "BEAST": BEAST, "realtime-bpm-analyzer": RTBPM, "libKeyFinder": KEYF, "S-KEY": SKEY, "music21": M21,
    "Guitar open-string": TUNING + ["file:///home/user/blog/docs/guitar-tab-research/PRIOR.md"],
    "Hosted services in": [],
}
ALL = sorted({u for v in SECTIONS.values() for u in v})
SECTIONS["Handoff facts"] = ALL
SECTIONS["Sections"] = ALL  # the "Common license texts" block sits under "# Sections"

class Text(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.out = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"): self.skip += 1
        if tag in ("p", "br", "li", "div", "tr", "h1", "h2", "h3", "h4", "dt", "dd"): self.out.append("\n")
    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip: self.skip -= 1
    def handle_data(self, data):
        if not self.skip: self.out.append(data)

def fetch(url, cache, refetch):
    key = hashlib.sha1(url.encode()).hexdigest()[:16]
    body, meta = os.path.join(cache, key + ".body"), os.path.join(cache, key + ".meta")
    if url.startswith("file://"):
        return open(url[7:], encoding="utf-8", errors="replace").read(), "200"
    if refetch or not os.path.exists(meta):
        r = subprocess.run(["curl", "-sS", "-L", "--max-time", "60", "-A", "Mozilla/5.0 (research check)", "-o", body,
                            "-w", "%{http_code}", url], capture_output=True, text=True)
        json.dump({"url": url, "code": r.stdout.strip(), "err": r.stderr.strip()[:200]}, open(meta, "w"))
    m = json.load(open(meta))
    if m["code"] != "200" or not os.path.exists(body):
        return None, m["code"]
    raw = open(body, "rb").read()
    if raw[:4] == b"%PDF":
        txt = subprocess.run(["pdftotext", "-layout", body, "-"], capture_output=True, text=True).stdout
        return txt, "200"
    t = raw.decode("utf-8", errors="replace")
    if url.endswith("/json") or url.startswith("https://registry.npmjs.org") or "/api/" in url:
        try:  # JSON: search the dump with unescaped strings
            return json.dumps(json.loads(t), ensure_ascii=False), "200"
        except Exception:
            pass
    if "<html" in t[:2000].lower() or "<!doctype html" in t[:2000].lower():
        p = Text(); p.feed(t); t = html.unescape("".join(p.out))
    return t, "200"

def ws(s):
    return re.sub(r"\s+", " ", s).strip()

def loose(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("–", "-").replace("—", "-").replace(" ", " ").replace("∈", "in")
    s = re.sub(r"\\(.)", r"\1", s)
    s = re.sub(r"[`*]", "", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    return ws(s)

def pieces(q):
    parts = re.split(r"\[\.\.\.\]|\.\.\.|…", q)
    return [p.strip(" ,;") for p in parts if len(p.strip(" ,;")) >= 3]

def main():
    survey, cache, out = sys.argv[1:4]
    refetch = "--refetch" in sys.argv
    os.makedirs(cache, exist_ok=True)
    texts, codes = {}, {}
    for u in ALL:
        t, c = fetch(u, cache, refetch)
        codes[u] = c
        if t is not None:
            texts[u] = (ws(t), loose(t))
    lines = open(survey, encoding="utf-8").read().split("\n")
    sec, blocks, cur = None, [], []
    for ln in lines:
        m = re.match(r"^#{1,2} (.*)", ln)
        if m:
            if cur: blocks.append((sec, " ".join(cur)))
            sec, cur = m.group(1), []
            continue
        if re.match(r"^\s*(- |\d+\. )", ln) and cur:  # a new bullet or numbered line starts a new block
            blocks.append((sec, " ".join(cur))); cur = []
        cur.append(ln.strip())
    if cur: blocks.append((sec, " ".join(cur)))
    rows = []
    for sec, text in blocks:
        if sec is None: continue
        srcs = next((v for k, v in SECTIONS.items() if sec.startswith(k)), None)
        if srcs is None: continue
        for q in re.findall(r'"([^"]+)"', text):
            ps = pieces(q)
            if not ps: continue
            status, where = "WS", []
            for p in ps:
                hit = next((u for u in srcs if u in texts and ws(p) in texts[u][0]), None)
                if hit: where.append(hit); continue
                hit = next((u for u in srcs if u in texts and loose(p) in texts[u][1]), None)
                if hit:
                    where.append(hit); status = "LOOSE" if status == "WS" else status; continue
                status = "MISSING"; where.append("-"); break
            rows.append((sec[:28], status, ";".join(sorted(set(where)))[:160], q[:300]))
    with open(out, "w") as f:
        f.write("section\tstatus\tfound_in\tquote\n")
        for r in rows: f.write("\t".join(r) + "\n")
        f.write("\n# fetch status\n")
        for u in ALL: f.write(f"{codes[u]}\t{u}\n")
    from collections import Counter
    print(Counter(r[1] for r in rows)); print("fetch non-200:", [u for u in ALL if codes[u] != "200"])

main()
