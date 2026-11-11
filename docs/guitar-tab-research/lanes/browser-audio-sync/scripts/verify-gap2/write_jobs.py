"""Verifier (round 2): write /frames/jobs.json for opencvjs.html from the reference's JSON (same fields as the gap round's jobs.json)."""
import json, sys
ref = json.load(open(sys.argv[1])); out = sys.argv[2]
jobs = []
for lab, d in ref['frames'].items():
    clip = lab.rsplit('_f', 1)[0]; n = int(lab.rsplit('_f', 1)[1]); ext = d['file'].rsplit('.', 1)[1]
    h, w = d['shape'][:2]
    quads = {'handquad': [float(v) for p in d['hand_quad']['quad'] for v in p]}
    if 'sam_quad' in d: quads['samquad'] = [float(v) for p in d['sam_quad']['quad'] for v in p]
    jobs.append({'label': lab, 'clip': clip, 'n': n, 'img': f'/frames/{clip}/f_{n + 1:04d}.{ext}', 'raw': f'/frames/{clip}/f_{n + 1:04d}.rgb',
                 'w': w, 'h': h, 'size': d['rect_size'], 'quads': quads})
json.dump(jobs, open(out, 'w'), indent=1)
print(len(jobs), 'jobs')
