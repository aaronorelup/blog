#!/usr/bin/env python3
"""Verifier's independent recomputation of one or more numbers per tool, written without gtr-eval's code.

Run with the scorer's environment (it has mir_eval 0.8.2, pretty_midi, PyGuitarPro 0.11):
  /home/user/gtr/eval/venv/bin/python -I independent_metrics.py > independent_metrics.txt
MIDI files: notes of every track pooled with pretty_midi, onset-only precision/recall/F1 with
mir_eval.transcription.precision_recall_f1_overlap(onset_tolerance=0.05, pitch_tolerance=50, offset_ratio=None).
Tab files: pairs from mir_eval.transcription.match_notes (same tolerances, offset_ratio=None), then the share of pairs
with the same string and fret. Guitar Pro files are read here with PyGuitarPro and timed from the ticks (960 per
quarter) and the song tempo, first measure at 0 s; MusicXML is read here with ElementTree.
"""
import json, sys, math
import numpy as np
import mir_eval, pretty_midi
import xml.etree.ElementTree as ET
import guitarpro

L = '/home/user/gtr/lanes/web-tab-render/out/'
I = '/home/user/gtr/inputs/'


def hz(m):
    return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)


def truth(cid):
    return json.load(open(f'{I}{cid}/{cid}.truth.json'))


def ref_arrays(t):
    ns = [n for n in t['notes'] if n.get('voice') != 'drums']
    iv = np.array([[n['onset'], max(n['offset'], n['onset'] + 1e-3)] for n in ns])
    return ns, iv, np.array([n['pitch'] for n in ns])


def midi_scores(cid, path, shift=0):
    t = truth(cid); ns, riv, rp = ref_arrays(t)
    pm = pretty_midi.PrettyMIDI(path)
    est = [(n.start, max(n.end, n.start + 1e-3), n.pitch + shift) for ins in pm.instruments if not ins.is_drum for n in ins.notes]
    eiv = np.array([[a, b] for a, b, _ in est]); ep = np.array([p for _, _, p in est])
    P, R, F, _ = mir_eval.transcription.precision_recall_f1_overlap(riv, hz(rp), eiv, hz(ep), onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)
    P2, R2, F2, _ = mir_eval.transcription.precision_recall_f1_overlap(riv, hz(rp), eiv, hz(ep), onset_tolerance=0.05, pitch_tolerance=50.0)
    return f'n_est={len(est)} onset P={P:.3f} R={R:.3f} F1={F:.3f}; onset+offset F1={F2:.3f}'


def tab_scores(cid, notes):
    """notes: list of dicts onset, pitch, string, fret"""
    t = truth(cid); ns, riv, rp = ref_arrays(t)
    ns_pos = [n for n in ns if n.get('string')]
    est = [n for n in notes if n.get('string') and n.get('fret') is not None]
    if not est:
        return 'no estimated note with string and fret'
    eiv = np.array([[n['onset'], n['onset'] + 0.1] for n in est]); ep = np.array([n['pitch'] for n in est])
    riv2 = np.array([[n['onset'], n['onset'] + 0.1] for n in ns_pos]); rp2 = np.array([n['pitch'] for n in ns_pos])
    pairs = mir_eval.transcription.match_notes(riv2, hz(rp2), eiv, hz(ep), onset_tolerance=0.05, pitch_tolerance=50.0, offset_ratio=None)
    same = sum(1 for i, j in pairs if ns_pos[i]['string'] == est[j]['string'] and ns_pos[i]['fret'] == est[j]['fret'])
    sd = {}
    for i, j in pairs:
        k = est[j]['string'] - ns_pos[i]['string']; sd[k] = sd.get(k, 0) + 1
    return f'truth={len(ns_pos)} est={len(est)} matched={len(pairs)} same string+fret={same} string diffs={dict(sorted(sd.items()))}'


def json_notes(path, use_capo_tuning=True):
    d = json.load(open(path))
    tun = d.get('tuning_midi'); capo = d.get('capo') or 0
    out = []
    for n in d['notes']:
        p = n.get('pitch')
        if p is None and tun and n.get('string'):
            p = tun[len(tun) - n['string']] + capo + n['fret']
        out.append({'onset': n['onset'], 'pitch': p, 'string': n.get('string'), 'fret': n.get('fret')})
    return out


def gp_notes(path):
    s = guitarpro.parse(path)
    tr = s.tracks[0]; tun = {st.number: st.value for st in tr.strings}; capo = tr.offset
    sec_per_tick = 60.0 / s.tempo / 960
    first = s.measureHeaders[0].start
    out = []
    for m in tr.measures:
        for v in m.voices:
            for b in v.beats:
                for n in b.notes:
                    if n.type == guitarpro.NoteType.tie or n.type == guitarpro.NoteType.dead:
                        continue
                    out.append({'onset': (b.start - first) * sec_per_tick, 'pitch': tun[n.string] + capo + n.value, 'string': n.string, 'fret': n.value})
    return out, capo, [tun[k] for k in sorted(tun)]


STEP = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def mxl_tab_notes(path):
    """partwise MusicXML: first part with <string>/<fret>; time from durations/divisions and the first sound tempo."""
    root = ET.parse(path).getroot()
    for part in root.findall('part'):
        if part.find('.//technical/fret') is None:
            continue
        tempo = 120.0; div = 1; t = 0.0; out = []; tuning = {}; capo = 0; last_onset = 0.0
        for meas in part.findall('measure'):
            for el in meas:
                if el.tag == 'attributes':
                    if el.find('divisions') is not None: div = int(el.find('divisions').text)
                    for st in el.findall('.//staff-tuning'):
                        oc = int(st.find('tuning-octave').text); al = st.find('tuning-alter')
                        tuning[int(st.get('line'))] = 12 * (oc + 1) + STEP[st.find('tuning-step').text] + (int(float(al.text)) if al is not None else 0)
                    if el.find('.//capo') is not None: capo = int(el.find('.//capo').text)
                elif el.tag == 'direction' or el.tag == 'sound':
                    snd = el if el.tag == 'sound' else el.find('sound')
                    if snd is not None and snd.get('tempo'): tempo = float(snd.get('tempo'))
                elif el.tag == 'backup':
                    t -= int(el.find('duration').text) / div * 60 / tempo
                elif el.tag == 'forward':
                    t += int(el.find('duration').text) / div * 60 / tempo
                elif el.tag == 'note':
                    dur = el.find('duration'); d = int(dur.text) / div * 60 / tempo if dur is not None else 0
                    chord = el.find('chord') is not None
                    on = last_onset if chord else t
                    if not chord: last_onset = t; t += d
                    if el.find('rest') is not None or el.find('.//tie[@type="stop"]') is not None:
                        continue
                    fr = el.find('.//technical/fret'); sg = el.find('.//technical/string')
                    pe = el.find('pitch')
                    p = 12 * (int(pe.find('octave').text) + 1) + STEP[pe.find('step').text] + (int(float(pe.find('alter').text)) if pe.find('alter') is not None else 0)
                    if fr is None or sg is None: continue
                    out.append({'onset': on, 'pitch': p, 'string': int(sg.text), 'fret': int(fr.text)})
        return out, tuning, capo
    return [], {}, 0


rows = []
def row(tool, what, val):
    rows.append((tool, what, val)); print(f'{tool} | {what} | {val}', flush=True)

# alphaTab
row('alphaTab', 'S5capo2.gp5 model notes vs truth (cf. e0008)', tab_scores('S5capo2', json_notes(L + 'alphatab-node/S5capo2.est.json')))
row('alphaTab', 'S5dropd GP7 export re-read (cf. e0015)', tab_scores('S5dropd', json_notes(L + 'alphatab-node/S5dropd.export.gp.est.json')))
row('alphaTab', 'S2n.alphatab.mid notes (cf. e0007)', midi_scores('S2n', L + 'alphatab-node/S2n.alphatab.mid'))
row('alphaTab', 'reference 2-staff MusicXML import, S5capo2 (cf. e0847)', tab_scores('S5capo2', json_notes(L + 'alphatab-import/ref2staff_capo.est.json')))
# music21
n, tun, capo = mxl_tab_notes(L + 'music21/S2n.music21.musicxml')
row('music21', 'S2n.music21.musicxml string/fret vs truth (cf. e0191); staff-tuning read=%s' % (tun or 'none'), tab_scores('S2n', n))
# reference MusicXML
n, tun, capo = mxl_tab_notes(L + 'musicxml-from-truth/S5capo2.truth.musicxml')
row('reference MusicXML', 'S5capo2.truth.musicxml (cf. e0196); capo=%s tuning=%s' % (capo, [tun[k] for k in sorted(tun)]), tab_scores('S5capo2', n))
# Verovio
row('Verovio', 'S2n_mei.mid (cf. e0307)', midi_scores('S2n', L + 'verovio/S2n_mei.mid'))
row('Verovio', 'S2n_mxl2staff.mid (cf. e0324)', midi_scores('S2n', L + 'verovio/S2n_mxl2staff.mid'))
row('Verovio', 'S5capo2 MEI export read with capo 0 (cf. e0365)', tab_scores('S5capo2', json_notes(L + 'verovio/S5capo2_mxl2staff.export.mei.json')))
row('Verovio', 'S5capo2 MEI export read with capo 2 (cf. e0366)', tab_scores('S5capo2', json_notes(L + 'verovio/S5capo2_mxl2staff.export.mei.capo2.json')))
# MuseScore 3.2.3
row('MuseScore 3.2.3', 'S5capo2.mid (cf. e0374)', midi_scores('S5capo2', L + 'musescore3/S5capo2.mid'))
row('MuseScore 3.2.3', 'S5capo2.mid +2 semitones (cf. e0376)', midi_scores('S5capo2', L + 'musescore3/S5capo2.mid', shift=2))
n, tun, capo = mxl_tab_notes(L + 'musescore3/ref2staff_capo_mxl.out.musicxml')
row('MuseScore 3.2.3', 'S5capo2 reference MusicXML round trip (cf. e0368); capo in file=%s' % capo, tab_scores('S5capo2', n))
# LilyPond
row('LilyPond', 'S2n auto strings (cf. e0399)', tab_scores('S2n', json_notes(L + 'lilypond/S2n_auto.tab.json')))
row('LilyPond', 'S5capo2 auto strings, raised tuning (cf. e0415)', tab_scores('S5capo2', json_notes(L + 'lilypond/S5capo2_auto_capotuning.tab.json')))
row('LilyPond', 'S2n_auto.midi (cf. e0400)', midi_scores('S2n', L + 'lilypond/S2n_auto.midi'))
# TuxGuitar
for f, cid, ev in [('S2n.tg.gp5', 'S2n', 'e0457'), ('S5capo2.tg.gp4', 'S5capo2', 'e0465'), ('S5dropd.tg.gp3', 'S5dropd', 'e0473'), ('alphatabgp7.tg.gp5', 'S2n', 'e0479')]:
    n, capo, tun = gp_notes(L + 'tuxguitar/' + f)
    row('TuxGuitar 1.5.6', f'{f} read here with PyGuitarPro (cf. {ev}); capo={capo} tuning={tun}', tab_scores(cid, n))
row('TuxGuitar 1.5.6', 'S2n.tg.mid (cf. e0462)', midi_scores('S2n', L + 'tuxguitar/S2n.tg.mid'))
# PyGuitarPro
for f, ev in [('S2n.pgp.gp5', 'e0574'), ('S2n.pgp.gp4', 'e0578')]:
    n, capo, tun = gp_notes(L + 'pyguitarpro/' + f)
    row('PyGuitarPro 0.11', f'{f} (cf. {ev})', tab_scores('S2n', n))
# webmscore
row('webmscore 1.2.1', 'S5capo2_gp5.mid (cf. e0999)', midi_scores('S5capo2', L + 'webmscore/S5capo2_gp5.mid'))
n, tun, capo = mxl_tab_notes(L + 'webmscore/ref2staff_mxl.musicxml')
row('webmscore 1.2.1', 'reference 2-staff MusicXML round trip (cf. e1009); staff-tuning written=%s' % [tun[k] for k in sorted(tun)], tab_scores('S2n', n))
# guitarpro-parser
row('guitarpro-parser 2.0.0', 'S5dropd.gp5 (cf. e1105)', tab_scores('S5dropd', json_notes(L + 'guitarpro-parser/S5dropd_gp5.est.json')))
# abcjs: no times; compare the multiset of (string, fret, pitch) with the truth
t = truth('S2n'); e = json_notes(L + 'abcjs/S2n_written.tab.json')
from collections import Counter
row('abcjs 6.7.2', 'S2n written-pitch read-back, multiset of (string, fret, pitch) equal to the truth (cf. e0638)',
    Counter((n['string'], n['fret'], n['pitch']) for n in t['notes']) == Counter((n['string'], n['fret'], n['pitch']) for n in e))
