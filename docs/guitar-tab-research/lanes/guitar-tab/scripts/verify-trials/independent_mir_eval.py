#!/usr/bin/env python3
"""Independent recomputation (verify-trials-guitar-tab) of one gtr-eval number per tool, with mir_eval called
directly and none of gtr-eval's code. Run with the gtr-eval venv's Python (mir_eval 0.8.2):
  /home/user/gtr/eval/venv/bin/python -I independent_mir_eval.py
Prints, for each case, the number recomputed here next to the number stored for the cited eval id."""
import csv, json
import numpy as np
import mir_eval

OUT = '/home/user/gtr/lanes/guitar-tab/out'
INP = '/home/user/gtr/inputs'
LED = {}
for line in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    d = json.loads(line)
    LED[d['id']] = d['result']


def hz(m):
    return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)


def truth(clip):
    return json.load(open(f'{INP}/{clip}/{clip}.truth.json'))


def tab_score(clip, est_notes, est_tuning, est_capo):
    """match_notes(onset 50 ms, 50 cents, offsets ignored); then same string and same fret (from each side's capo)."""
    t = truth(clip)
    tn = [n for n in t['notes'] if n.get('string') is not None]
    ref_iv = np.array([[n['onset'], max(n['offset'], n['onset'] + 1e-3)] for n in tn])
    ref_p = hz([n['pitch'] for n in tn])
    ep = []
    for n in est_notes:
        p = n.get('pitch')
        if p is None:
            p = est_tuning[6 - n['string']] + est_capo + n['fret']
        ep.append(p)
    est_iv = np.array([[n['onset'], n['onset'] + 0.1] for n in est_notes])
    m = mir_eval.transcription.match_notes(ref_iv, ref_p, est_iv, hz(ep), onset_tolerance=0.05,
                                           pitch_tolerance=50.0, offset_ratio=None)
    same = sum(1 for i, j in m if (tn[i]['string'], tn[i]['fret']) == (est_notes[j]['string'], est_notes[j]['fret']))
    return len(tn), len(est_notes), len(m), same / len(m) if m else float('nan')


def gtreval_file(path):
    d = json.load(open(path))
    return d['notes'], d.get('tuning_midi', [40, 45, 50, 55, 59, 64]), d.get('capo', 0)


def show(label, eid, mine, stored):
    ok = all(abs(a - b) < 1e-4 if isinstance(a, float) else a == b for a, b in zip(mine, stored))
    print(f"{'SAME' if ok else 'DIFF'}  {label} [{eid}]  recomputed {mine}  stored {stored}")


def stored_tab(eid):
    r = LED[eid]
    return (r['counts']['n_truth'], r['counts']['n_est'], r['counts']['n_matched'],
            round(r['metrics']['same_string_and_fret_fraction_of_matched'], 4))


cases = [
    ('tuttut R1c default', 'e0052', 'R1c', f'{OUT}/tuttut/R1c.truthmidi.gtreval.json'),
    ('tuttut S5dropd Drop D', 'e0048', 'S5dropd', f'{OUT}/tuttut/S5dropd.truthmidi.dropD.gtreval.json'),
    ('tayuya R1a', 'e0135', 'R1a', f'{OUT}/tayuya/R1a.truthmidi.gtreval.json'),
    ('LilyPond R1c default', 'e0184', 'R1c', f'{OUT}/lilypond/R1c.truthmidi.gtreval.json'),
    ('LilyPond S5capo2 raised tuning', 'e0179', 'S5capo2', f'{OUT}/lilypond/S5capo2.truthmidi.capo2.gtreval.json'),
    ('tabsynth R1a groups', 'e0385', 'R1a', f'{OUT}/tabsynth/R1a.truthmidi.groups.gtreval.json'),
    ('tutts R1c quantizeGrid 1/16', 'e0411', 'R1c', f'{OUT}/tutts/R1c.truthmidi.q16.gtreval.json'),
    ('SynthTab finetuned/GuitarSet R1c', 'e0205', 'R1c', f'{OUT}/synthtab/R1c.finetuned_GuitarSet.gtreval.json'),
    ('SynthTab-Pretrained S2n', 'e0863', 'S2n', f'{OUT}/synthtab/S2n.SynthTab-Pretrained.gtreval.json'),
    ('Basic Pitch -> tuttut R1c', 'e0727', 'R1c', f'{OUT}/handoff-bp/tuttut/R1c.bp.gtreval.json'),
    ('Basic Pitch -> LilyPond S3', 'e0670', 'S3', f'{OUT}/handoff-bp/lilypond/S3.bp.gtreval.json'),
    ('guitar-fl -> tuttut R1c', 'e1275', 'R1c', f'{OUT}/hf-midi-transcription/tuttut/R1c.guitar-fl.gtreval.json'),
]
for label, eid, clip, path in cases:
    notes, tun, capo = gtreval_file(path)
    n_t, n_e, n_m, frac = tab_score(clip, notes, tun, capo)
    show(label, eid, (n_t, n_e, n_m, round(frac, 4)), stored_tab(eid))

# Note transcription (onset-only F1) for the Riley guitar-fl MIDI and the SynthTab decoded notes
import pretty_midi
for label, eid, clip, mid in [('guitar-fl notes S2n', 'e1224', 'S2n', f'{OUT}/hf-midi-transcription/S2n.guitar-fl.mid'),
                              ('guitar-fl notes R1c', 'e1274', 'R1c', f'{OUT}/hf-midi-transcription/R1c.guitar-fl.mid')]:
    pm = pretty_midi.PrettyMIDI(mid)
    en = [n for i in pm.instruments if not i.is_drum for n in i.notes]
    t = truth(clip)['notes']
    p, r, f, _ = mir_eval.transcription.precision_recall_f1_overlap(
        np.array([[n['onset'], n['offset']] for n in t]), hz([n['pitch'] for n in t]),
        np.array([[n.start, max(n.end, n.start + 1e-3)] for n in en]), hz([n.pitch for n in en]),
        onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)
    s = LED[eid]['metrics']['onset_only']
    show(label, eid, (len(en), round(p, 4), round(r, 4), round(f, 4)),
         (LED[eid]['counts']['n_est'], round(s['precision'], 4), round(s['recall'], 4), round(s['f1'], 4)))

# Frame-level tab F1 (gtr-eval's own definition, README: per frame, |est set & ref set| summed over frames)
for label, eid, clip, csvp in [('SynthTab finetuned R1c frames', 'e0236', 'R1c', f'{OUT}/synthtab/R1c.finetuned_GuitarSet.frames.csv'),
                               ('SynthTab-Pretrained R1a frames', 'e0912', 'R1a', f'{OUT}/synthtab/R1a.SynthTab-Pretrained.frames.csv')]:
    t = [n for n in truth(clip)['notes'] if n.get('string') is not None]
    hits = n_est = n_ref = 0
    for row in csv.DictReader(open(csvp)):
        tt = float(row['time'])
        est = {(s, int(row[f's{s}'])) for s in range(1, 7) if int(row[f's{s}']) >= 0}
        ref = {(n['string'], n['fret']) for n in t if n['onset'] <= tt < n['offset']}
        hits += len(est & ref); n_est += len(est); n_ref += len(ref)
    P, R = hits / n_est, hits / n_ref
    show(label, eid, (round(2 * P * R / (P + R), 4),), (round(LED[eid]['metrics']['tab_f1'], 4),))
