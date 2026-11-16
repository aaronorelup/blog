"""gap round 2: compare two folders of Guitar Pro 5 files note by note with PyGuitarPro (tempo, tuning, capo
(Track.offset), and for every measure and beat: beat status, duration and the (string, fret) of each note).
The song title is printed but not compared. usage: python gap2_compare_gp5.py <dir A> <dir B> <file names...>"""
import sys, os
import guitarpro as gp

def content(path):
    s = gp.parse(path)
    t = s.tracks[0]
    beats = []
    for m in t.measures:
        for b in m.voices[0].beats:
            beats.append((b.status.name, b.duration.value, tuple(sorted((n.string, n.value) for n in b.notes))))
    return {"tempo": s.tempo, "tuning": [st.value for st in t.strings], "capo": t.offset,
            "n_notes": sum(len(b[2]) for b in beats), "beats": beats}, s.title

a, b, names = sys.argv[1], sys.argv[2], sys.argv[3:]
for n in names:
    ca, ta = content(os.path.join(a, n)); cb, tb = content(os.path.join(b, n))
    print(f"{n}: identical content {ca == cb}; notes {ca['n_notes']} / {cb['n_notes']}; tempo {ca['tempo']}; "
          f"tuning {ca['tuning']}; capo {ca['capo']}; titles {ta!r} / {tb!r}")
