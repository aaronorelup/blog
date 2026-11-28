# Verifier (gap round 1): does scripts/gap1_score_svsep.py read MEI, the format for-aaron.md list 4 asks Aaron to send
# back? Writes the two-part truth MusicXML of the scorer's self-test (gap1/svsep/selftest/<clip>_truth_two_parts.musicxml)
# as MEI with partitura's save_mei (the writer piano_svsep's predict.py calls), merging the two parts into one part
# with two staves the way predict.py merges parts, then scores both MEI files with gap1_score_svsep.score().
# usage: python vsvsep_mei.py <selftest dir> <out dir> <clip> [<clip> ...]
import json
import os
import sys

import partitura as pt

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from gap1_score_svsep import score  # noqa: E402

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
res = {'partitura': pt.__version__}
for clip in sys.argv[3:]:
    xml = os.path.join(src, f'{clip}_truth_two_parts.musicxml')
    s = pt.load_score(xml)
    r = {}
    # (a) each part saved as its own MEI file is not what predict.py writes; (b) predict.py merges parts into one
    merged = pt.score.merge_parts(s.parts)
    mei = os.path.join(out, f'{clip}_truth_merged.mei')
    pt.save_mei(merged, mei)
    na = merged.note_array(include_staff=True)
    r['merged_part_staffs'] = sorted(set(int(x) for x in na['staff']))
    r['merged_part_voices'] = sorted(set(int(x) for x in na['voice']))
    try:
        sc = score(mei, clip)
        r['score_of_mei'] = {k: sc[k] for k in ('n_notes_read',)}
        for rule in ('staff_rule', 'voice_rule'):
            r['score_of_mei'][rule] = {k: sc[rule][k] for k in ('groups', 'n_matched', 'n_right_voice')}
    except Exception as e:  # report, do not hide
        r['score_of_mei_error'] = repr(e)[:500]
    res[clip] = r
print(json.dumps(res, indent=1))
