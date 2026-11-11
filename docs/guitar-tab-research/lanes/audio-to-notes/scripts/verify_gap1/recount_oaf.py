import mido, pretty_midi, glob
O = '/home/user/gtr/lanes/audio-to-notes/out/onsets-frames/'
for c in ['S1', 'S2n', 'R1c', 'S4guitar']:
    f = O + c + '.wav.midi'
    mf = mido.MidiFile(f)
    tempos = [m.tempo for tr in mf.tracks for m in tr if m.type == 'set_tempo']
    progs = [m.program for tr in mf.tracks for m in tr if m.type == 'program_change']
    ccs = [m for tr in mf.tracks for m in tr if m.type == 'control_change']
    pbs = [m for tr in mf.tracks for m in tr if m.type == 'pitchwheel']
    pm = pretty_midi.PrettyMIDI(f)
    notes = sorted([n for i in pm.instruments for n in i.notes], key=lambda n: (n.start, n.end))
    vel = [n.velocity for n in notes]
    print(c, 'type', mf.type, 'tpq', mf.ticks_per_beat, 'tracks', len(mf.tracks), 'tempos(us/beat)', tempos, 'program_change', progs,
          'instruments', [(i.program, i.is_drum) for i in pm.instruments], 'cc', len(ccs), 'pb', len(pbs), 'notes', len(notes), 'vel', (min(vel), max(vel)))
    if c == 'S2n':
        print('  first10', ', '.join('%.3f-%.3f %d %d' % (n.start, n.end, n.pitch, n.velocity) for n in notes[:10]))
