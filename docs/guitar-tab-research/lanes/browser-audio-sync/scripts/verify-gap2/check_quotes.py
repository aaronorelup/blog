"""Verifier (round 2): find every double-quoted string in the given survey.md line range / tools.json entries and look it up
in the live sources (whitespace normalised; HTML reduced to text). Prints each quote with the sources that contain it."""
import html, json, re, sys
F = '/home/user/gtr/lanes/browser-audio-sync/verify-gap2/fetch'; W = '/home/user/gtr/lanes/browser-audio-sync/verify-gap2/dl/demucs-onnx/whl'
def norm(s): return re.sub(r'\s+', ' ', s).strip()
def htmltext(s):
    s = re.sub(r'(?s)<(script|style)[^>]*>.*?</\1>', ' ', s); s = re.sub(r'<[^>]+>', ' ', s); return html.unescape(s)
src = {
 'card': open(f'{F}/hf_readme.md').read(), 'infer.py': open(f'{F}/hf_infer.py').read(), 'requirements': open(f'{F}/hf_requirements.txt').read(),
 'guide_html_text': htmltext(open(f'{F}/browser_guide.html').read()), 'guide_html_raw': open(f'{F}/browser_guide.html').read(),
 'demucs_readme': open(f'{F}/demucs_README.md').read(), 'signalsmith': open(f'{F}/signalsmith_README.md').read(),
 'wheel_browser.py': open(f'{W}/demucs_onnx/browser.py').read(), 'wheel_inference.py': open(f'{W}/demucs_onnx/inference.py').read(),
 'wheel_LICENSE': open(f'{W}/demucs_onnx-0.3.4.dist-info/licenses/LICENSE').read(), 'wheel_METADATA': open(f'{W}/demucs_onnx-0.3.4.dist-info/METADATA').read(),
 'pypi_json': open('/home/user/gtr/lanes/browser-audio-sync/verify-gap2/dl/demucs-onnx/pypi.json').read(),
 'ort_large': htmltext(open(f'{F}/ort_large_models.html').read()), 'ort_env': htmltext(open(f'{F}/ort_env_flags.html').read()),
 'interface_5.x': open(f'{F}/interface_5.x.h').read(), 'interface_4.x': open(f'{F}/interface_4.x.h').read(),
}
N = {k: norm(v) for k, v in src.items()}
# also a markdown-stripped card (no ** or `), for quotes written without the markup
N['card_plain'] = norm(src['card'].replace('**', '').replace('`', ''))
N['guide_plain'] = norm(src['guide_html_text'].replace('`', ''))
text = open(sys.argv[1]).read()
if sys.argv[1].endswith('.json'):
    d = json.load(open(sys.argv[1])); names = sys.argv[2:]
    text = '\n'.join(json.dumps(t, ensure_ascii=False) for t in d['tools'] if t['name'] in names).replace('\\"', '"')
else:
    lines = text.splitlines(); a, b = int(sys.argv[2]), int(sys.argv[3]); text = '\n'.join(lines[a - 1:b])
qs = re.findall(r'"([^"]{6,})"', norm(text))
for q in qs:
    hits = [k for k, v in N.items() if norm(q) in v]
    print(('OK   ' if hits else 'MISS ') + q[:150] + ('...' if len(q) > 150 else ''), '->', hits)
