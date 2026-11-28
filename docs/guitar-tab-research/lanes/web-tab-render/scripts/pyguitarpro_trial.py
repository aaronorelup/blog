#!/usr/bin/env python3
"""PyGuitarPro trial: read a Guitar Pro 3/4/5 file, list what the model holds, write it back as GP3, GP4 and GP5,
and write an edited copy (one note moved to another string and fret, the capo and the tuning changed) the way a
human-in-the-loop correction would.

Usage: python -I pyguitarpro_trial.py <in.gp5> <out_dir> <tag>
"""
import json
import os
import sys
import time

import guitarpro


def notes_of(song, track_index=0):
    track = song.tracks[track_index]
    out = []
    for measure in track.measures:
        for vi, voice in enumerate(measure.voices):
            for beat in voice.beats:
                for n in beat.notes:
                    if n.type == guitarpro.NoteType.tie or n.type == guitarpro.NoteType.dead:
                        continue
                    out.append({'measure': measure.number, 'voice': vi, 'tick': beat.start, 'string': n.string,
                                'fret': n.value, 'velocity': n.velocity,
                                'pitch': track.strings[n.string - 1].value + track.offset + n.value})
    return out


def main():
    src, out_dir, tag = sys.argv[1], sys.argv[2], sys.argv[3]
    t0 = time.time()
    song = guitarpro.parse(src)
    t_read = time.time() - t0
    tr = song.tracks[0]
    info = {
        'pyguitarpro': guitarpro.__version__ if hasattr(guitarpro, '__version__') else None,
        'version_string': song.versionTuple if hasattr(song, 'versionTuple') else None,
        'title': song.title, 'artist': song.artist, 'tempo': song.tempo, 'measureHeaders': len(song.measureHeaders),
        'tracks': [{'name': t.name, 'strings': [(s.number, s.value) for s in t.strings], 'offset_capo': t.offset,
                    'channel_instrument': t.channel.instrument, 'measures': len(t.measures),
                    'voices_per_measure': len(t.measures[0].voices) if t.measures else None} for t in song.tracks],
        'read_s': round(t_read, 4),
    }
    notes = notes_of(song)
    info['notes'] = len(notes)
    info['first5'] = notes[:5]
    written = {}
    for ver, ext in [((5, 1, 0), 'gp5'), ((4, 0, 0), 'gp4'), ((3, 0, 0), 'gp3')]:
        path = os.path.join(out_dir, f'{tag}.pgp.{ext}')
        t1 = time.time()
        try:
            guitarpro.write(song, path, version=ver)
            back = guitarpro.parse(path)
            written[ext] = {'bytes': os.path.getsize(path), 'write_s': round(time.time() - t1, 4),
                            'reread_notes': len(notes_of(back)), 'reread_capo': back.tracks[0].offset,
                            'reread_tuning': [s.value for s in back.tracks[0].strings]}
        except Exception as e:  # noqa: BLE001
            written[ext] = {'error': f'{type(e).__name__}: {e}'}
    info['written'] = written
    # an edit: first melody note of bar 1 (G3, string 3 open) moved to string 4 fret 5 (same pitch); capo 1; Drop D
    edited = guitarpro.parse(src)
    et = edited.tracks[0]
    beat = et.measures[1].voices[0].beats[0]
    before = (beat.notes[0].string, beat.notes[0].value)
    beat.notes[0].string, beat.notes[0].value = 4, 5
    et.offset = 1
    et.strings[5].value = 38
    epath = os.path.join(out_dir, f'{tag}.pgp.edited.gp5')
    guitarpro.write(edited, epath)
    eb = guitarpro.parse(epath)
    eb_beat = eb.tracks[0].measures[1].voices[0].beats[0]
    info['edit'] = {'note_before_string_fret': before, 'note_after_string_fret': (eb_beat.notes[0].string, eb_beat.notes[0].value),
                    'capo_after': eb.tracks[0].offset, 'tuning_after': [s.value for s in eb.tracks[0].strings],
                    'file': epath, 'bytes': os.path.getsize(epath)}
    json.dump(info, open(os.path.join(out_dir, f'{tag}.pyguitarpro.json'), 'w'), indent=1, default=str)
    print(json.dumps(info, default=str)[:1500])


if __name__ == '__main__':
    main()
