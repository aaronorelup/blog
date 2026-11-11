"""Compare two gap-round-2 open-vocabulary results.json files box by box (prompt, score, box), ignoring timing
fields (init_s, infer_s). Usage: python3 -I compare_results.py <a.json> <b.json>"""
import json, sys
a = json.load(open(sys.argv[1])); b = json.load(open(sys.argv[2]))
for k in sorted(set(a) | set(b)):
    if k not in ('images', 'init_s') and a.get(k) != b.get(k):
        print('header differs:', k, a.get(k), b.get(k))
bi = {im['id']: im for im in b['images']}
ndiff = 0
for im in a['images']:
    o = bi.get(im['id'])
    if o is None:
        print('missing', im['id']); ndiff += 1; continue
    x = sorted((d['prompt'], d['score'], tuple(d['box_image'])) for d in im['boxes'])
    y = sorted((d['prompt'], d['score'], tuple(d['box_image'])) for d in o['boxes'])
    same = x == y and im['per_prompt'] == o['per_prompt'] and im['labels_outside_prompt_list'] == o['labels_outside_prompt_list']
    print(im['id'], len(x), len(y), 'identical' if same else 'DIFFERENT')
    if not same:
        ndiff += 1
print('views:', len(a['images']), 'differing:', ndiff, '| init_s', a.get('init_s'), b.get('init_s'))
