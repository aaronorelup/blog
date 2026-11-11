"""Recount the gap-round-2 open-vocabulary results.json files (verify-gapfill, round 2).
Usage: python3 -I recount_openvocab.py <results.json> [<results.json> ...]
Prints per view: infer_s, per-prompt counts (>= the file's floor, >= 0.25) and top score recomputed
from the 'boxes' list (not from the stored per_prompt summary), every 'capo' box, labels outside the
prompt list, and whether the stored per_prompt summary agrees with the recount."""
import json, sys

def r(x):
    return round(x, 4)

for path in sys.argv[1:]:
    d = json.load(open(path))
    floor = d.get('low_threshold', d.get('score_floor'))
    print('=====', path)
    print('tool', d.get('tool'), 'model', d.get('model'), 'floor', floor, 'init_s', d.get('init_s'),
          'load_s', d.get('load_s'), 'keys', [k for k in d if k not in ('images',)])
    prompts = d['prompts']
    infers = []
    for im in d['images']:
        infers.append(im.get('infer_s'))
        boxes = im.get('boxes', [])
        line = [im['id'], 'infer_s=%s' % im.get('infer_s'), 'nboxes=%d' % len(boxes)]
        mism = []
        for p in prompts:
            bs = [b for b in boxes if b['prompt'] == p]
            n_floor = sum(1 for b in bs if b['score'] >= floor)
            n25 = sum(1 for b in bs if b['score'] >= 0.25)
            top = max([b['score'] for b in bs], default=None)
            line.append('%s:%d/%d top=%s' % (p, n_floor, n25, top))
            pp = im.get('per_prompt', {}).get(p)
            if pp is not None:
                if pp.get('n_ge_low') != n_floor or pp.get('n_ge_0.25') != n25:
                    mism.append((p, pp.get('n_ge_low'), pp.get('n_ge_0.25'), n_floor, n25))
        print('  ' + ' | '.join(line))
        others = [b for b in boxes if b['prompt'] not in prompts]
        if others:
            print('    outside prompt list:', [(b['prompt'], b['score'], b['box_image']) for b in others])
        if im.get('labels_outside_prompt_list'):
            print('    stored labels_outside_prompt_list:', im['labels_outside_prompt_list'])
        for b in boxes:
            if b['prompt'] == 'capo':
                print('    capo box:', b['score'], b['box_image'])
        if mism:
            print('    PER_PROMPT MISMATCH:', mism)
    vals = [x for x in infers if x is not None]
    if vals:
        print('  infer_s range', min(vals), max(vals))
