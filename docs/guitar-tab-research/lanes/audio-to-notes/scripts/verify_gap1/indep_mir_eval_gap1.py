"""verify-gapfill-audio-to-notes: independent mir_eval recomputation of a few gap-round numbers (not via gtr-eval)."""
import csv, json
import numpy as np, pretty_midi, mir_eval
G = '/home/user/gtr/lanes/audio-to-notes/out/'
def truth(cid, voice=None):
    T = json.load(open('/home/user/gtr/inputs/%s/%s.truth.json' % (cid, cid)))
    return [n for n in T['notes'] if (voice is None and n['voice'] != 'drums') or n['voice'] == voice], T
for cid, est, voice in [('S1', 'S1.wav.midi', None), ('R1c', 'R1c.wav.midi', None), ('S4', 'S4guitar.wav.midi', 'chord')]:
    notes, _ = truth(cid, voice)
    ri = np.array([[n['onset'], n['offset']] for n in notes]); rp = mir_eval.util.midi_to_hz(np.array([n['pitch'] for n in notes], float))
    pm = pretty_midi.PrettyMIDI(G + 'onsets-frames/' + est); en = [x for i in pm.instruments for x in i.notes]
    ei = np.array([[x.start, x.end] for x in en]); ep = mir_eval.util.midi_to_hz(np.array([x.pitch for x in en], float))
    p, r, f, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, ep, onset_tolerance=0.05, offset_ratio=None)
    print('O&F', cid, 'onset-only P %.3f R %.3f F1 %.3f' % (p, r, f))
for cid, f0, voice in [('S1', 'S1.f0.csv', 'melody'), ('S4', 'S4lead.f0.csv', 'melody'), ('R1b', 'R1b.f0.csv', 'lead')]:
    notes, T = truth(cid, voice)
    t = np.arange(0, T['duration_s'], 0.01); ref = np.zeros(len(t))
    for n in sorted(notes, key=lambda n: n['onset']):
        ref[(t >= n['onset']) & (t < n['offset'])] = 440 * 2 ** ((n['pitch'] - 69) / 12)
    rows = list(csv.reader(open(G + 'rmvpe/f0/' + f0)))[1:]
    et = np.array([float(x[0]) for x in rows]); ef = np.array([float(x[1]) for x in rows])
    rv, rc, ev, ec = mir_eval.melody.to_cent_voicing(t, ref, et, ef)
    print('RMVPE', f0, 'RPA %.3f RCA %.3f' % (mir_eval.melody.raw_pitch_accuracy(rv, rc, ev, ec), mir_eval.melody.raw_chroma_accuracy(rv, rc, ev, ec)))
