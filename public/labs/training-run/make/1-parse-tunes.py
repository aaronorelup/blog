"""Step 1. Parse every 6/8 tune in four old fiddle collections (they ship as ABC text inside music21's corpus) into
an eighth-note grid: one number per eighth note = a MIDI pitch (a note starts here), HOLD (-1) or REST (-2).

    pip install music21
    python 1-parse-tunes.py <path to music21/corpus> out/raw_tunes.json

To use your own tunes, point it at any folders of ABC files (SOURCES below), or change parse() to read MIDI or
MusicXML: music21's converter.parse() reads those too."""
import sys, re, glob, json, os, warnings
from multiprocessing import Pool
warnings.filterwarnings('ignore')
CORPUS = sys.argv[1]
OUT = sys.argv[2]
SOURCES = ['ryansMammoth', 'oneills1850', 'airdsAirs', 'miscFolk']
HOLD, REST = -1, -2

def split_tunes(path):
    txt = open(path, encoding='latin-1').read()
    return [p for p in re.split(r'(?m)^(?=X:)', txt) if p.startswith('X:')]

def field(t, f):
    m = re.search(r'(?m)^%s:\s*([^\n%%]*)' % f, t)
    return m.group(1).strip() if m else ''

def parse(job):
    src, fname, idx, t = job
    from music21 import converter, note, chord, stream, key
    info = dict(source=src, file=fname, index=idx, title=field(t, 'T'), rhythm=field(t, 'R'), keyfield=field(t, 'K'))
    try:
        s = converter.parseData(t, format='abc')
        p = s.parts[0] if len(s.parts) else s
        keys = list(p.recurse().getElementsByClass(key.Key))
        if not keys:
            return dict(info, reject='no key')
        if len(set((k.tonic.pitchClass, k.mode) for k in keys)) > 1:
            return dict(info, reject='key change')
        k = keys[0]
        info.update(tonic=k.tonic.pitchClass, mode=k.mode, sharps=k.sharps)
        measures = list(p.getElementsByClass(stream.Measure))
        if len(measures) < 8:
            return dict(info, reject='short')
        pad0 = float(measures[0].paddingLeft or 0.0)
        ev = []          # (onset, end, pitch or None for rest, tie_continuation)
        aligned = total = 0
        for m in measures:
            mo = float(m.offset) + pad0
            if float(m.duration.quarterLength) >= 3.0 - 1e-6:      # only whole bars vote: pickups and the short bar before them pair up
                total += 1
                if abs(mo / 3.0 - round(mo / 3.0)) < 1e-6:
                    aligned += 1
            for n in m.notesAndRests:
                d = float(n.duration.quarterLength)
                if d <= 0:
                    continue          # grace notes
                on = mo + float(n.offset)
                if isinstance(n, note.Rest):
                    ev.append((on, on + d, None, False))
                else:
                    if isinstance(n, chord.Chord):
                        pit = max(x.midi for x in n.pitches)     # double stop: keep the top string
                    else:
                        pit = n.pitch.midi
                    cont = n.tie is not None and n.tie.type in ('stop', 'continue')
                    ev.append((on, on + d, pit, cont))
        if total < 8 or aligned / total < 0.9:
            return dict(info, reject='bars do not line up', aligned=aligned, bars=total)
        ev.sort()
        end = max(e[1] for e in ev)
        g0 = int(round(ev[0][0] / 0.5))
        g1 = int(round(end / 0.5))
        toks = []
        offgrid = onsets = 0
        j = 0
        sounding_until = -1.0
        for e in ev:
            if e[2] is not None and not e[3]:
                onsets += 1
                if abs(e[0] / 0.5 - round(e[0] / 0.5)) > 1e-6:
                    offgrid += 1
        byon = {}
        for e in ev:
            if abs(e[0] / 0.5 - round(e[0] / 0.5)) < 1e-6:
                byon.setdefault(int(round(e[0] / 0.5)), e)
        cur_end = -1.0      # end time of the note currently ringing
        for g in range(g0, g1):
            tt = g * 0.5
            e = byon.get(g)
            if e is not None and e[2] is not None and not e[3]:
                toks.append(e[2]); cur_end = e[1]
            elif e is not None and e[2] is not None and e[3]:
                toks.append(HOLD); cur_end = e[1]
            elif e is not None and e[2] is None:
                toks.append(REST); cur_end = -1.0
            else:
                # nothing starts exactly here: is anything still ringing?
                ring = cur_end > tt + 1e-6
                if not ring:
                    # an off-grid note may be sounding (ornament): look it up
                    for x in ev:
                        if x[2] is not None and x[0] < tt and x[1] > tt + 1e-6:
                            ring = True; break
                toks.append(HOLD if ring else REST)
        info.update(tokens=toks, q0=g0 - 6 if pad0 > 0 else g0, bars=total, offgrid=offgrid, onsets=onsets)
        return info
    except Exception as ex:
        return dict(info, reject='parse error: ' + type(ex).__name__)

if __name__ == '__main__':
    jobs = []
    for src in SOURCES:
        for f in sorted(glob.glob(os.path.join(CORPUS, src, '*.abc'))):
            for i, t in enumerate(split_tunes(f)):
                m = field(t, 'M')
                if m == '6/8':
                    jobs.append((src, os.path.basename(f), i, t))
    print('6/8 tunes to parse:', len(jobs), flush=True)
    with Pool(4) as pool:
        res = pool.map(parse, jobs, chunksize=8)
    json.dump(res, open(OUT, 'w'))
    ok = [r for r in res if 'tokens' in r]
    print('parsed', len(ok), 'rejected', len(res) - len(ok))
    import collections
    print(collections.Counter(r.get('reject') for r in res if 'reject' in r).most_common())
