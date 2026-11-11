# verify-gapfill-web-tab-render (round 2): check every quote of gap round 2 against the LIVE source (fetched now),
# not against the gap filler's saved copies. Input: the gap filler's list (samples/verify/gap2_quote_check.tsv: result,
# source, quote) plus quotes it did not list. Output TSV: result, live source, quote.
import csv, html, json, re, subprocess, sys, os, urllib.request
OUT = '/home/user/gtr/lanes/web-tab-render/verify-gap2/live'
REC = '/home/user/blog/docs/guitar-tab-research/lanes/web-tab-render'
ALPHATAB_SHA = 'ec751a23f2e1f9601abb3ce2022300001c096565'
NM = '/home/user/gtr/lanes/web-tab-render/web/node_modules'
NPMX = '/home/user/gtr/lanes/web-tab-render/verify-gap2/npm'
LIVE = {
  'fetched/gap2/abcjs/visual_render-abc-options.html': 'https://docs.abcjs.net/visual/render-abc-options.html',
  'fetched/gap2/abcjs/visual_dragging.html': 'https://docs.abcjs.net/visual/dragging.html',
  'fetched/gap2/abcjs/visual_click-listener.html': 'https://docs.abcjs.net/visual/click-listener.html',
  'fetched/gap2/npm/_coderline_alphatab-monaco.json': 'https://registry.npmjs.org/@coderline/alphatab-monaco',
  'fetched/gap2/npm/_coderline_alphatab-language-server.json': 'https://registry.npmjs.org/@coderline/alphatab-language-server',
  'fetched/gap2/alphatab/packages_monaco_README.md': 'https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/README.md',
  'fetched/gap2/alphatab/packages_monaco_LICENSE': 'https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/LICENSE',
  'fetched/gap2/npm/alphatab-language-server-1.9.0_README.md': 'file://' + NPMX + '/alphatab-language-server/package/README.md',
  'fetched/gap2/npm/alphatab-language-server-1.9.0_LICENSE': 'file://' + NPMX + '/alphatab-language-server/package/LICENSE',
  'fetched/gap2/alphatab/packages_ui_src_editor_monaco-env.ts': f'https://raw.githubusercontent.com/CoderLine/alphaTab/{ALPHATAB_SHA}/packages/ui/src/editor/monaco-env.ts',
  'fetched/gap2/alphatab/packages_ui_src_editor_use-score-document.ts': f'https://raw.githubusercontent.com/CoderLine/alphaTab/{ALPHATAB_SHA}/packages/ui/src/editor/use-score-document.ts',
  'web/node_modules/abcjs/src/write/draw/selectables.js': 'file://' + NM + '/abcjs/src/write/draw/selectables.js',
  'web/node_modules/verovio/dist/types/verovio-toolkit.d.ts': 'file://' + NM + '/verovio/dist/types/verovio-toolkit.d.ts',
  'fetched/gap2/haya-tab/main_README.md': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/README.md',
  'fetched/gap2/haya-tab/eb0466a_docs_ARCHITECTURE.md': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/eb0466a93d728a8402e914000babe7d4e06eca78/docs/ARCHITECTURE.md',
  'fetched/gap2/haya-tab/eb0466a_CHANGELOG.md': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/eb0466a93d728a8402e914000babe7d4e06eca78/CHANGELOG.md',
  'fetched/gap2/haya-tab/eb0466a_frontend_package.json': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/eb0466a93d728a8402e914000babe7d4e06eca78/frontend/package.json',
  'fetched/gap2/haya-tab/eb0466a_internal_app_app_files.go': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/eb0466a93d728a8402e914000babe7d4e06eca78/internal/app/app_files.go',
  'fetched/gap2/haya-tab/eb0466a_go.mod': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/eb0466a93d728a8402e914000babe7d4e06eca78/go.mod',
  'fetched/gap2/haya-tab/main_LICENSE': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/LICENSE',
  'fetched/gap2/haya-tab/main_NOTICE': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/NOTICE',
}
cache = {}
def fetch(url):
    if url in cache: return cache[url]
    if url.startswith('file://'):
        b = open(url[7:], 'rb').read()
    else:
        p = subprocess.run(['curl', '-sS', '-L', '--max-time', '40', url], capture_output=True)
        b = p.stdout
    fn = re.sub(r'[^A-Za-z0-9._-]+', '_', url)[-150:]
    open(os.path.join(OUT, fn), 'wb').write(b)
    cache[url] = b.decode('utf-8', 'replace')
    return cache[url]
def norm_text(t, is_html):
    if is_html:
        t = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', t)
        t = re.sub(r'(?s)<[^>]+>', ' ', t)
    t = html.unescape(t)
    t = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', t)   # markdown links -> text
    t = t.replace('**', '').replace('`', '')
    t = re.sub(r'\s+', ' ', t)
    return t
def norm_q(q):
    q = html.unescape(q).replace('**', '').replace('`', '')
    return re.sub(r'\s+', ' ', q).strip()
def check(src_label, url, quote):
    raw = fetch(url)
    is_html = url.endswith('.html')
    if url.startswith('https://registry.npmjs.org/'):
        d = json.loads(raw)
        hay = ' '.join([d.get('description') or ''] + [v.get('description') or '' for v in d.get('versions', {}).values()][-3:])
    else:
        hay = raw
    if quote in hay: return 'EXACT'
    hq = norm_q(quote); ht = norm_text(hay, is_html)
    if hq in ht: return 'EXACT_AFTER_WHITESPACE_OR_MARKUP'
    # space-insensitive (HTML text split across tags)
    if re.sub(r'\s', '', hq) in re.sub(r'\s', '', ht): return 'EXACT_IGNORING_SPACES'
    return 'NOT_FOUND'
rows = []
with open(os.path.join(REC, 'samples/verify/gap2_quote_check.tsv')) as f:
    r = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
    next(r)
    for res, src, quote in r:
        url = LIVE.get(src)
        if not url:
            rows.append(('NO_LIVE_SOURCE_MAPPED', src, quote)); continue
        rows.append((check(src, url, quote), url, quote))
extra = [
  ('https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/README.md', 'Upload TAB'),
  ('https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/README.md', 'Open with Inner Viewer'),
  ('https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/README.md', 'HAYA-TAB helps musicians:'),
  ('https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/LICENSE', 'Mozilla Public License Version 2.0'),
]
for url, q in extra:
    rows.append((check('extra', url, q), url, q))
with open(os.path.join(REC, 'samples/verify/gap2_verify_live_quotes.tsv'), 'w') as f:
    f.write('result\tlive source (fetched 2026-11-11 by verify-gapfill-web-tab-render)\tquote\n')
    for row in rows: f.write('\t'.join(row) + '\n')
from collections import Counter
print(Counter(r[0] for r in rows))
for r in rows:
    if r[0] not in ('EXACT', 'EXACT_AFTER_WHITESPACE_OR_MARKUP', 'EXACT_IGNORING_SPACES'): print(r)
