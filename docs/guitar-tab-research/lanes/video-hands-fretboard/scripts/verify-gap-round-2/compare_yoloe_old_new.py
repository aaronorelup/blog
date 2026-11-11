"""Compare the eight R3a / R3a_cu views of a gap-round-2 results.json (box_image) with the trial's
out/yoloe/results.json (box_full). Usage: python3 -I compare_yoloe_old_new.py <old.json> <new.json>"""
import json, sys
old = json.load(open(sys.argv[1]))
new = json.load(open(sys.argv[2]))
def key_old(im):
    clip, fr, mode = im['clip'], im['frame'], im['mode']
    if clip == 'R3a_cu':
        return 'R3a_cu_f%04d' % fr
    return 'R3a_f%04d_%s' % (fr, 'crop' if mode == 'crop' else 'full')
newd = {im['id']: im for im in new['images']}
nd = 0
for im in old['images']:
    k = key_old(im)
    n = newd.get(k)
    if n is None:
        print('missing in new:', k); nd += 1; continue
    ob = sorted((b['prompt'], b['score'], tuple(b['box_full'])) for b in im['boxes'])
    nb = sorted((b['prompt'], b['score'], tuple(b['box_image'])) for b in n['boxes'])
    same = ob == nb
    print(k, 'old', len(ob), 'new', len(nb), 'identical' if same else 'DIFFERENT')
    if not same:
        nd += 1
        print('  old', ob); print('  new', nb)
print('views differing:', nd)
