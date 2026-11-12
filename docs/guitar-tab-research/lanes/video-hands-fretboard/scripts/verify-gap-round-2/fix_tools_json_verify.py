"""Round-2 verifier's edits to tools.json (verify-gapfill-video-hands-fretboard, 2026-11-11).
Each edit asserts the text it replaces, so a re-run on an already edited file stops instead of editing twice.
Usage: python3 -I fix_tools_json_verify.py <tools.json>"""
import json, sys
path = sys.argv[1]
d = json.load(open(path, encoding='utf-8'))
T = {t['name']: t for t in d['tools']}

def tool(prefix):
    hits = [t for n, t in T.items() if n.startswith(prefix)]
    assert len(hits) == 1, (prefix, [h['name'] for h in hits])
    return hits[0]

# 1. pytorch-openpose: the ControlNet __init__.py opens with '# Openpose' before the two lines quoted.
t = tool('pytorch-openpose')
note = t['license']['weights']['note']
old = "begins '# Original from CMU https://github.com/CMU-Perceptual-Computing-Lab/openpose' and '# 2nd Edited by https://github.com/Hzzone/pytorch-openpose'"
assert old in note
t['license']['weights']['note'] = note.replace(old, "opens with the comment lines '# Openpose', '# Original from CMU https://github.com/CMU-Perceptual-Computing-Lab/openpose' and '# 2nd Edited by https://github.com/Hzzone/pytorch-openpose' (corrected by the round-2 verifier: it said the file begins with the last two)")

# 2. ViTPose: the HF LFS sha256 equals the trial file's sha256.
t = tool('ViTPose (ViTPose-s whole-body ONNX')
w = t['license']['weights']
assert 'sha256' not in w.get('note', '')
w['note'] = ("Added by the round-2 verifier (HF API ?blobs=true, read 2026-11-11): the LFS sha256 of "
             "onnx/wholebody/vitpose-s-wholebody.onnx is ccac893a8ad6da7d43f9655047acf48e482e66922db7f4273a3b615cea989127, "
             "the sha256 trials.md gives for the file the trial ran.")

# 3. YOLO-World: the weights r0650 ran came from the ultralytics/assets release v8.4.0; the CLIP text encoder's terms stay unread.
t = tool('YOLO-World')
assert t['license']['weights'] is None
t['license']['weights'] = {
    'name': 'yolov8s-worldv2.pt from the ultralytics/assets release v8.4.0 (the file run r0650 ran); that repository\'s LICENSE is AGPL-3.0 (the OpenAI CLIP ViT-B/32 text encoder file: terms not read, see unverified)',
    'quote': 'GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007',
    'url': 'https://raw.githubusercontent.com/ultralytics/assets/main/LICENSE',
    'note': ('Added by the round-2 verifier, read 2026-11-11 (identical file on master). The release page itself was not read '
             '(github.com web pages answer 403 from the box); the release download URL '
             'https://github.com/ultralytics/assets/releases/download/v8.4.0/yolov8s-worldv2.pt served 25,923,032 bytes with '
             'sha256 9b2c17ab6124a913e9b3a5c170617920d91b0f01111a8479da69f00e2cf27792, the file r0650 ran (downloaded, hashed, deleted).'),
}

# 4. OWLv2: the 'what' line still said the model ran only on the Space.
t = tool('OWLv2 (google/owlv2-base-patch16-ensemble)')
old = "because its 619,918,824-byte weights were over the box's 200 MB download limit."
assert t['what'].endswith(old)
t['what'] = t['what'] + " (added by the round-2 verifier: in gap round 2 it also ran on the box's CPU with transformers 5.22.2; runs r0632 and r0634 failed, r0639 gave scored boxes; the weights were fetched for that run and deleted after it.)"

d['updated'] = d['updated'].rstrip(')') + '; verifier edits: scripts/verify-gap-round-2/fix_tools_json_verify.py)'
open(path, 'w', encoding='utf-8').write(json.dumps(d, indent=1, ensure_ascii=False))
print('ok')
