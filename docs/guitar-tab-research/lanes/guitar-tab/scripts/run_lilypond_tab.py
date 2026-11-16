"""LilyPond automatic tablature (TabStaff string/fret selection, LilyPond 2.24.3) on the notes of one MIDI file.

Glue code (guitar-tab lane), in three steps:
 1. Read the MIDI notes (pretty_midi, all non-drum instruments pooled) and group them into chords: a note joins the
    current group when its onset is within --chord-window seconds (default 0.03) of the group's first onset.
 2. Write a .ly file: one TabStaff, each group written as one 16th-note chord in order (LilyPond chooses strings per
    chord/moment, so the written rhythm does not change the choice). The TabStaff gets stringTunings, minimumFret,
    restrainOpenStrings, maximumFretStretch from the options; --strings pins given notes with LilyPond's own string
    syntax (note\\N). tablatureFormat is set to a Scheme procedure that writes (moment, string number, fret) to a
    TSV file and then calls LilyPond's own fret-number-tablature-format, so the printed tab is unchanged.
 3. Run lilypond (PNG output of the first systems is kept as a picture), read the TSV back, give each logged note the
    onset of its group (moment * 16 = group index) and write <name>.gtreval.json (pitch = tuning + capo + fret).
usage: python run_lilypond_tab.py in.mid outdir --name N [--tuning 40,45,50,55,59,64] [--capo-as-tuning 0]
       [--minimum-fret 0] [--restrain-open] [--max-stretch 4] [--chord-window 0.03]
"""
import argparse, json, subprocess, time, os
from pathlib import Path
import pretty_midi

NAMES = ["c", "cis", "d", "dis", "e", "f", "fis", "g", "gis", "a", "ais", "b"]
def ly_pitch(m):
    o = m // 12 - 4          # MIDI 48 = c (no mark), 60 = c'
    return NAMES[m % 12] + ("'" * o if o > 0 else "," * (-o))

ap = argparse.ArgumentParser()
ap.add_argument("midi"); ap.add_argument("outdir"); ap.add_argument("--name", required=True)
ap.add_argument("--tuning", default="40,45,50,55,59,64"); ap.add_argument("--capo-as-tuning", type=int, default=0)
ap.add_argument("--minimum-fret", type=int, default=0); ap.add_argument("--restrain-open", action="store_true")
ap.add_argument("--max-stretch", type=int, default=4); ap.add_argument("--chord-window", type=float, default=0.03)
ap.add_argument("--png", action="store_true")
ap.add_argument("--pin", action="append", default=[], help="G:P:S = in chord group G (0-based), write MIDI pitch P with LilyPond's string mark \\S")
a = ap.parse_args()
out = Path(a.outdir); out.mkdir(parents=True, exist_ok=True)
tun = [int(x) + a.capo_as_tuning for x in a.tuning.split(",")]          # low -> high, raised by the capo if given
pm = pretty_midi.PrettyMIDI(a.midi)
notes = sorted([(n.start, n.pitch) for i in pm.instruments if not i.is_drum for n in i.notes])
groups = []
for on, p in notes:
    if groups and on - groups[-1][0] <= a.chord_window:
        groups[-1][1].append(p)
    else:
        groups.append([on, [p]])
pins = {}
for spec in a.pin:
    g, pp, ss = (int(x) for x in spec.split(":")); pins[(g, pp)] = ss
events = []
for gi, (on, ps) in enumerate(groups):
    ps = sorted(ps)
    names = [ly_pitch(p) + (f"\\{pins[(gi, p)]}" if (gi, p) in pins else "") for p in ps]
    events.append(("<" + " ".join(names) + ">16") if len(ps) > 1 else (names[0] + "16"))
tsv = (out / f"{a.name}.lilylog.tsv").resolve()
tuning_ly = " ".join(ly_pitch(p) for p in tun)
ly = f'''\\version "2.24.3"
#(define gtr-log (open-output-file "{tsv}"))
#(define (logging-tab-format context string-number fret-number)
   (let ((m (ly:context-current-moment context)))
     (format gtr-log "~a\\t~a\\t~a\\n" (ly:moment-main m) string-number fret-number)
     (force-output gtr-log)
     (fret-number-tablature-format context string-number fret-number)))
music = {{ \\cadenzaOn {" ".join(events)} }}
\\score {{
  \\new TabStaff \\with {{
    stringTunings = \\stringTuning <{tuning_ly}>
    tablatureFormat = #logging-tab-format
    minimumFret = #{a.minimum_fret}
    restrainOpenStrings = ##{"t" if a.restrain_open else "f"}
    maximumFretStretch = #{a.max_stretch}
  }} {{ \\music }}
  \\layout {{ }}
}}
'''
lyf = out / f"{a.name}.ly"; lyf.write_text(ly)
if tsv.exists(): tsv.unlink()
t0 = time.time()
cmd = ["lilypond", "--loglevel=WARNING", "-o", str(out / a.name)] + (["--png", "-dresolution=70"] if a.png else ["-dno-print-pages"]) + [str(lyf)]
p = subprocess.run(cmd, capture_output=True, text=True)
t1 = time.time()
(out / f"{a.name}.lilypond.stderr.txt").write_text(p.stderr)
rows = [l.split("\t") for l in tsv.read_text().splitlines()] if tsv.exists() else []
res = []
for mom, s, f in rows:
    num, _, den = mom.partition("/")
    idx = int(round(float(num) / float(den or 1) * 16))
    s, f = int(s), int(f)
    res.append({"onset": round(groups[idx][0], 6), "pitch": tun[6 - s] + f, "string": s, "fret": f})
res.sort(key=lambda n: (n["onset"], n["string"]))
json.dump({"tool": "LilyPond 2.24.3 TabStaff automatic strings", "tuning_midi": [int(x) for x in a.tuning.split(",")],
           "capo": a.capo_as_tuning, "settings": vars(a), "n_groups": len(groups), "n_notes_in": len(notes), "notes": res},
          open(out / f"{a.name}.gtreval.json", "w"), indent=1)
warn = [l for l in p.stderr.splitlines() if "warning" in l.lower()]
print(f"{a.name}: notes in {len(notes)}, chord groups {len(groups)}, tab notes logged {len(res)}, lilypond exit {p.returncode}, "
      f"{t1-t0:.2f}s, warnings {len(warn)}: {warn[:2]}")
