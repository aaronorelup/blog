"""Shared helpers for the test-input scripts (make_synth.py, make_guitarset.py).

Writes the side files that every clip gets next to its <id>.truth.json:
  <id>.notes.csv   onset,offset,pitch,velocity,voice,string,fret
  <id>.beats.txt   one beat per line: time, beat number in the bar
  <id>.chords.lab  start end label
  <id>.tab.txt     ASCII tab, six lines per system, bar lines, one column per 16th note
  <id>.mid         (make_guitarset.py only; make_synth.py writes the MIDI it renders)
"""
import csv
import json

NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def note_name(p):
    return f"{NAMES[p % 12]}{p // 12 - 1}"


def write_json(path, obj):
    with open(path, "w") as f:
        json.dump(obj, f, indent=1)
        f.write("\n")


def write_notes_csv(path, notes):
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["onset", "offset", "pitch", "velocity", "voice", "string", "fret"])
        for n in notes:
            w.writerow([f"{n['onset']:.6f}", f"{n['offset']:.6f}", n["pitch"],
                        "" if n["velocity"] is None else n["velocity"], n["voice"],
                        "" if n["string"] is None else n["string"], "" if n["fret"] is None else n["fret"]])


def write_beats(path, beats, beat_numbers):
    with open(path, "w") as f:
        for t, b in zip(beats, beat_numbers):
            f.write(f"{t:.6f}\t{b}\n")


def write_lab(path, chords):
    with open(path, "w") as f:
        for c in chords:
            f.write(f"{c['start']:.6f}\t{c['end']:.6f}\t{c['label']}\n")


def tab_text(header_lines, tuning_midi, events, bar_starts_s, beats_per_bar=4, cols_per_beat=4, bars_per_line=4,
             first_bar_number=1):
    """ASCII tab.

    events: list of (bar_index, position_in_bar_in_beats, string, fret); bar_index counts from 0 for the first bar
    drawn. bar_starts_s: start time in seconds of each drawn bar (printed above each system).
    Returns (text, collisions) where collisions counts notes that fell on an occupied string/column.
    """
    nbars = len(bar_starts_s)
    ncols = beats_per_bar * cols_per_beat
    grid = [[["--"] * ncols for _ in range(6)] for _ in range(nbars)]
    collisions = 0
    for bar, pos, string, fret in events:
        if bar < 0 or bar >= nbars:
            continue
        col = int(round(pos * cols_per_beat))
        col = min(max(col, 0), ncols - 1)
        row = string - 1  # string 1 (highest) on top
        cell = f"{fret}" if fret >= 10 else f"{fret}-"
        if grid[bar][row][col] != "--":
            collisions += 1
            continue
        grid[bar][row][col] = cell
    labels = [note_name(tuning_midi[6 - s]) for s in range(1, 7)]
    width = max(len(x) for x in labels)
    out = list(header_lines)
    out.append("")
    for b0 in range(0, nbars, bars_per_line):
        bars = range(b0, min(nbars, b0 + bars_per_line))
        out.append("   ".join(f"bar {first_bar_number + b} @ {bar_starts_s[b]:.3f}s" for b in bars))
        for row in range(6):
            line = labels[row].rjust(width) + "|"
            for b in bars:
                line += "".join(grid[b][row]) + "|"
            out.append(line)
        out.append("")
    return "\n".join(out) + "\n", collisions
