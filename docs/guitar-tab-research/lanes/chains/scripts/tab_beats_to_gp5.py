"""Chain A glue: a string/fret note list + a beat tracker's beats and downbeats + a chord recogniser's labels
-> one Guitar Pro 5 file (PyGuitarPro 0.11), with the beat grid used to turn seconds into rhythm.

usage: python tab_beats_to_gp5.py <tab.gtreval.json> <beats file> <out.gp5> [--downbeats FILE | --beat-numbers]
                                  [--chords LAB] [--title T]
  <tab.gtreval.json>: {"tuning_midi", "capo", "notes": [{onset s, pitch, string, fret}]} (run_tuttut.py output)
  <beats file>: one beat time (s) per line, first column; with --beat-numbers the second column is the beat number in
                the bar and 1 marks a downbeat (madmom's DBNDownBeatTracker layout); otherwise --downbeats gives a file
                of downbeat times (Beat This! layout: two files).
  --chords: a .lab file (start end label); Harte labels ("B:min") are written as "Bm", plain labels as they are.

What it does (every choice here is this glue's, not a tool's):
 1. Beat grid. The tracked beats are kept as they are. Beats are added before the first tracked beat at the median
    inter-beat interval (IBI) until the first one is at or before 0 s + IBI/2, and after the last one until every note
    is covered. GP5 time 0 is the first beat of that grid; its time in the audio is written as "gp_time_zero_s"
    (pass it as gtr-eval's --time-shift when reading the GP5 back).
 2. Bars. A bar starts at each downbeat (a beat within 35 ms of a downbeat time); beats before the first downbeat form
    one first bar. Each bar gets the time signature <its number of beats>/4.
 3. Rhythm. Each beat interval is cut into four 16ths; a note goes to the nearest 16th of the beat interval it falls
    in. One note per string per 16th is written (the first in the list); the rest are counted as dropped.
 4. Tempo (--tempo): "median" = one song tempo round(60 / median IBI) BPM; "span" = one song tempo
    round(60 x (n - 1) / (last tracked beat - first tracked beat)); "perbar" = song tempo as "span" plus a GP5
    mix-table tempo change on the first beat of every bar, round(60 / mean IBI of that bar's grid beats). GP5 stores
    tempos as integers. GP5 playback times follow these tempos while the bars follow the tracked beats: the
    difference between the two is reported.
 5. Chords. Each chord segment that is not N is attached, as a GP chord name without a diagram, to the 16th nearest
    its start; a later chord on the same 16th replaces the earlier one (counted).
Also writes <out>.readback.json: the GP5 beat times and chord changes as a player at that tempo would place them,
and <out>.beats.txt / <out>.downbeats.txt / <out>.chords.lab in audio time (GP5 time + gp_time_zero_s) for gtr-eval.
"""
import argparse, json, re
import numpy as np
import guitarpro as gp

ap = argparse.ArgumentParser()
ap.add_argument("tab"); ap.add_argument("beats"); ap.add_argument("out")
ap.add_argument("--downbeats"); ap.add_argument("--beat-numbers", action="store_true")
ap.add_argument("--chords"); ap.add_argument("--title", default="")
ap.add_argument("--tempo", choices=["median", "span", "perbar"], default="median")
a = ap.parse_args()

d = json.load(open(a.tab))
tun = d.get("tuning_midi", [40, 45, 50, 55, 59, 64]); capo = int(d.get("capo", 0) or 0)
notes = sorted(d["notes"], key=lambda n: (n["onset"], n["string"]))
rows = [l.split() for l in open(a.beats) if l.strip() and re.match(r"^-?[0-9.]", l.strip())]
beats = [float(r[0]) for r in rows]
if a.beat_numbers:
    downs = [float(r[0]) for r in rows if len(r) > 1 and int(float(r[1])) == 1]
elif a.downbeats:
    downs = [float(l.split()[0]) for l in open(a.downbeats) if l.strip() and re.match(r"^-?[0-9.]", l.strip())]
else:
    downs = []
ibi = float(np.median(np.diff(beats)))
grid = list(beats); n_pre = 0
while grid[0] - ibi > -ibi / 2:
    grid.insert(0, grid[0] - ibi); n_pre += 1
last_note = max(n["onset"] for n in notes) if notes else grid[-1]
n_post = 0
while grid[-1] <= last_note:
    grid.append(grid[-1] + ibi); n_post += 1
t0 = grid[0]
is_down = [any(abs(g - x) <= 0.035 for x in downs) for g in grid]
bars = []
for i in range(len(grid) - 1):           # the last grid point only closes the last beat interval
    if not bars or (is_down[i] and len(bars[-1]) > 0):
        bars.append([])
    bars[-1].append(i)

slots = {}; dropped = 0
for n in notes:
    j = int(np.searchsorted(grid, n["onset"], side="right") - 1)
    j = min(max(j, 0), len(grid) - 2)
    s = int(round((n["onset"] - grid[j]) / (grid[j + 1] - grid[j]) * 4))
    if s >= 4:
        j, s = j + 1, 0
    j = min(j, len(grid) - 2)
    if n["string"] in slots.setdefault((j, s), {}):
        dropped += 1; continue
    slots[(j, s)][n["string"]] = n["fret"]


def chord_name(lab):
    if lab in ("N", "X"):
        return None
    m = re.match(r"^([A-G][#b]?):?(.*)$", lab)
    if not m:
        return lab
    root, q = m.groups()
    q = q.split("/")[0]
    return root + {"": "", "maj": "", "min": "m", "7": "7", "maj7": "maj7", "min7": "m7", "dim": "dim",
                   "aug": "aug", "sus4": "sus4", "sus2": "sus2", "hdim7": "m7b5", "dim7": "dim7"}.get(q, q)


chords = {}; chord_overwritten = 0; chord_segments = []
if a.chords:
    for l in open(a.chords):
        p = l.split()
        if len(p) < 3:
            continue
        st, lab = float(p[0]), p[2]
        name = chord_name(lab)
        chord_segments.append((st, float(p[1]), lab))
        if name is None:
            continue
        j = int(np.searchsorted(grid, st, side="right") - 1); j = min(max(j, 0), len(grid) - 2)
        s = int(round((st - grid[j]) / (grid[j + 1] - grid[j]) * 4))
        if s >= 4:
            j, s = j + 1, 0
        if (j, s) in chords:
            chord_overwritten += 1
        chords[(j, s)] = name

if a.tempo == "median":
    tempo = int(round(60.0 / ibi))
else:
    tempo = int(round(60.0 * (len(beats) - 1) / (beats[-1] - beats[0])))
bar_tempo = []
for bar in bars:
    if a.tempo == "perbar":
        bar_tempo.append(int(round(60.0 * len(bar) / (grid[bar[-1] + 1] - grid[bar[0]]))))
    else:
        bar_tempo.append(tempo)
song = gp.Song(); song.title = a.title; song.tempo = tempo
track = song.tracks[0]; track.name = "guitar"
track.strings = [gp.GuitarString(i + 1, tun[5 - i]) for i in range(6)]
track.offset = capo
headers = song.measureHeaders
for bi, bar in enumerate(bars):
    if bi > 0:
        h = gp.MeasureHeader(); h.number = bi + 1
        h.start = headers[-1].start + headers[-1].length
        song.addMeasureHeader(h)
    headers[bi].timeSignature.numerator = len(bar)
    headers[bi].timeSignature.denominator.value = 4
for t in song.tracks:
    while len(t.measures) < len(bars):
        t.measures.append(gp.Measure(t, headers[len(t.measures)]))
written = 0; chords_written = 0
for bi, bar in enumerate(bars):
    voice = track.measures[bi].voices[0]; voice.beats.clear()
    for j in bar:
        for s in range(4):
            beat = gp.Beat(voice, duration=gp.Duration(value=16))
            if (j, s) in slots:
                beat.status = gp.BeatStatus.normal
                for string, fret in sorted(slots[(j, s)].items()):
                    beat.notes.append(gp.Note(beat, value=fret, string=string, type=gp.NoteType.normal)); written += 1
            else:
                beat.status = gp.BeatStatus.rest
            if a.tempo == "perbar" and j == bar[0] and s == 0:
                beat.effect.mixTableChange = gp.MixTableChange(tempo=gp.MixTableItem(value=bar_tempo[bi], duration=0))
            if (j, s) in chords:
                beat.effect.chord = gp.Chord(length=6, name=chords[(j, s)], firstFret=0, strings=[-1] * 6)
                chords_written += 1
            voice.beats.append(beat)
gp.write(song, a.out)

# read-back view: where a player at the GP5 tempo(s) puts each beat and chord change (audio time = GP5 time + t0)
order = [j for bar in bars for j in bar]
qb = [60.0 / bar_tempo[bi] for bi, bar in enumerate(bars) for _ in bar]      # seconds per beat, per grid beat
gp_start = [t0]
for x in qb:
    gp_start.append(gp_start[-1] + x)
pos = {j: k for k, j in enumerate(order)}
gp_time = lambda j, s: gp_start[pos[j]] + s * qb[pos[j]] / 4
gp_beat_times = gp_start[:-1]
with open(a.out + ".beats.txt", "w") as f:
    f.writelines(f"{x:.6f}\n" for x in gp_beat_times)
with open(a.out + ".downbeats.txt", "w") as f:
    for bar in bars:
        f.write(f"{gp_time(bar[0], 0):.6f}\n")
ch_items = sorted((gp_time(j, s), name) for (j, s), name in chords.items())
with open(a.out + ".chords.lab", "w") as f:
    if ch_items and ch_items[0][0] > 0:
        f.write(f"0.000000\t{ch_items[0][0]:.6f}\tN\n")
    end_t = gp_start[-1]
    for i, (st, name) in enumerate(ch_items):
        en = ch_items[i + 1][0] if i + 1 < len(ch_items) else end_t
        f.write(f"{st:.6f}\t{en:.6f}\t{name}\n")
note_shift = []
for (j, s), strs in slots.items():
    t_grid = grid[j] + s * (grid[j + 1] - grid[j]) / 4
    t_gp = gp_time(j, s)
    note_shift.append(t_gp - t_grid)
rep = {"tab": a.tab, "beats": a.beats, "downbeats": a.downbeats, "beat_numbers": a.beat_numbers, "chords": a.chords,
       "tempo_mode": a.tempo, "median_ibi_s": round(ibi, 6), "gp5_tempo_bpm": tempo, "bar_tempos_bpm": sorted(set(bar_tempo)), "gp_time_zero_s": round(t0, 6),
       "tracked_beats": len(beats), "downbeats_given": len(downs), "beats_added_before": n_pre,
       "beats_added_after": n_post, "bars": len(bars), "bar_beat_counts": [len(b) for b in bars],
       "notes_in": len(notes), "notes_written": written, "notes_dropped_same_string_same_16th": dropped,
       "chord_segments_in": len(chord_segments), "chords_written": chords_written,
       "chords_replaced_on_same_16th": chord_overwritten,
       "gp_minus_grid_time_of_16th_slots_s": {"median": round(float(np.median(note_shift)), 6),
                                              "max_abs": round(float(np.max(np.abs(note_shift))), 6)} if note_shift else None}
json.dump(rep, open(a.out + ".readback.json", "w"), indent=1)
print(json.dumps(rep))
