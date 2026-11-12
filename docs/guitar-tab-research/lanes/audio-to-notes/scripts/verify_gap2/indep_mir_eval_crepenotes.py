#!/usr/bin/env python3
"""verify-gapfill-audio-to-notes, round 2: onset-only and onset+offset F1 of the nine CREPE Notes MIDI files with the
verifier's own code (pretty_midi + mir_eval.transcription, not gtr-eval). Truth notes from <clip>.truth.json;
S4lead against the S4 truth notes with voice 'melody'. Run with the gtr-eval venv's python."""
import json
import numpy as np, pretty_midi, mir_eval
TRUTH = {'S1': ('S1', None), 'R1b': ('R1b', None), 'S4lead': ('S4', 'melody')}
OUT = '/home/user/gtr/lanes/audio-to-notes/out/crepe-notes'
hz = lambda m: 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)
for cfg in ['tcfull', 'tctiny', 'tcfullz']:
    for clip, (tid, voice) in TRUTH.items():
        t = json.load(open(f'/home/user/gtr/inputs/{tid}/{tid}.truth.json'))
        tn = [n for n in t['notes'] if (voice is None or n['voice'] == voice) and n['voice'] != 'drums']
        ri = np.array([[n['onset'], n['offset']] for n in tn]); rp = hz([n['pitch'] for n in tn])
        pm = pretty_midi.PrettyMIDI(f'{OUT}/{cfg}/{clip}.{cfg}.mid')
        en = [n for ins in pm.instruments for n in ins.notes]
        ei = np.array([[n.start, max(n.end, n.start + 0.001)] for n in en]); ep = hz([n.pitch for n in en])
        p, r, f, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, ep, onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)
        _, _, f2, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, ep, onset_tolerance=0.05, pitch_tolerance=50.0)
        print(cfg, clip, 'truth', len(tn), 'est', len(en), 'P %.3f R %.3f F1 %.3f onset+offset F1 %.3f' % (p, r, f, f2))
