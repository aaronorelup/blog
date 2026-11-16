#!/usr/bin/env python3
"""verify-gapfill-audio-to-notes, round 2: recount the CREPE Notes facts of gap round 2 item A3 from the files
(f0 inputs, MIDI files, logs), independently of scripts/gap2/crepenotes_facts.py, and compare the samples copies
with the box outputs. Run with the gtr-eval venv's python (mido, pretty_midi, numpy)."""
import csv, glob, hashlib, os, re, sys
import mido, numpy as np
OUT = '/home/user/gtr/lanes/audio-to-notes/out'
SAM = '/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/samples/crepe-notes'
CLIPS = ['S1', 'R1b', 'S4lead']; CFGS = ['tcfull', 'tctiny', 'tcfullz']
SRC = {'tcfull': 'torchcrepe-full', 'tctiny': 'torchcrepe-tiny', 'tcfullz': 'torchcrepe-full'}
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
def read(p):
    with open(p) as f:
        r = list(csv.reader(f))
    return r[0], np.array([[float(x) for x in row] for row in r[1:]])
print('# f0 inputs: header, rows, values against the torchcrepe source, frames set to 0 Hz')
for cfg in CFGS:
    for c in CLIPS:
        h, a = read(f'{OUT}/crepe-notes/{cfg}/{c}.f0in.csv')
        hs, s = read(f'{OUT}/{SRC[cfg]}/f0/{c}.f0.csv')
        same_t = np.allclose(a[:, 0], s[:, 0]); same_c = np.array_equal(a[:, 2], s[:, 2])
        if cfg == 'tcfullz':
            low = s[:, 2] < 0.21
            ok = np.array_equal(a[low, 1], np.zeros(low.sum())) and np.array_equal(a[~low, 1], s[~low, 1])
            print(cfg, c, h, len(a), 'src header', hs, 'times same', same_t, 'conf same', same_c,
                  'zeroed where conf<0.21 and equal elsewhere', ok, 'zeroed', int(low.sum()), 'of', len(a))
        else:
            print(cfg, c, h, len(a), 'src header', hs, 'all values same', same_t and same_c and np.array_equal(a[:, 1], s[:, 1]))
print('# MIDI facts')
lo, hi = 999, -1
for cfg in CFGS:
    for c in CLIPS:
        p = f'{OUT}/crepe-notes/{cfg}/{c}.{cfg}.mid'
        m = mido.MidiFile(p)
        notes = []; progs = set(); tempos = []; bends = 0; ccs = 0; other = set()
        for tr in m.tracks:
            on = {}
            t = 0
            for msg in tr:
                t += msg.time
                if msg.type == 'note_on' and msg.velocity > 0:
                    on.setdefault(msg.note, []).append((t, msg.velocity))
                elif msg.type in ('note_off',) or (msg.type == 'note_on' and msg.velocity == 0):
                    st, v = on[msg.note].pop(0); notes.append((st, t, msg.note, v))
                elif msg.type == 'program_change': progs.add(msg.program)
                elif msg.type == 'set_tempo': tempos.append(round(mido.tempo2bpm(msg.tempo), 3))
                elif msg.type == 'pitchwheel': bends += 1
                elif msg.type == 'control_change': ccs += 1
                elif msg.is_meta: other.add(msg.type)
        vel = [n[3] for n in notes]; pit = [n[2] for n in notes]
        lo = min(lo, min(vel)); hi = max(hi, max(vel))
        logp = f'{OUT}/crepe-notes/{cfg}/{c}.{cfg}.log'
        tun = re.search(r'Tuning offset: ([-0-9.e]+) cents', open(logp).read()).group(1)
        same = sha(p) == sha(f'{SAM}/midi/{c}.{cfg}.mid') and sha(logp) == sha(f'{SAM}/logs/{c}.{cfg}.log') and \
            sha(f'{OUT}/crepe-notes/{cfg}/{c}.{cfg}.notes-score.json') == sha(f'{SAM}/scores/{c}.{cfg}.notes-score.json')
        print(cfg, c, 'type', m.type, 'tpq', m.ticks_per_beat, 'tracks', len(m.tracks), 'programs', sorted(progs), 'tempo', tempos,
              'notes', len(notes), 'velocity', min(vel), max(vel), 'pitch bends', bends, 'CC', ccs, 'pitch 0 notes', pit.count(0),
              'notes >= MIDI 90', sum(p_ >= 90 for p_ in pit), 'max pitch', max(pit), 'tuning printed', tun,
              'sample copies identical (mid, log, score)', same)
print('velocity range over the nine files', lo, hi)
print('# per-call GNU time lines (run log)')
w = []; r = []
for line in open(f'{SAM}/logs/run-crepenotes-r0616.log'):
    mm = re.match(r'time (\S+) (\S+) wall ([0-9.]+) s user ([0-9.]+) s sys ([0-9.]+) s maxrss (\d+) KiB exit (\d+)', line)
    if mm: w.append(float(mm.group(3))); r.append(int(mm.group(6)) / 1024)
print('calls', len(w), 'wall', min(w), max(w), 'peak RSS MiB', round(min(r), 1), round(max(r), 1), 'sum of walls', round(sum(w), 2))
