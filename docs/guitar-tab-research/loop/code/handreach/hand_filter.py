#!/usr/bin/env python3
"""hand_filter.py <notes.csv> <hand_window.csv> --tuning <6 MIDI, string 6 to 1> --capo N [--out kept.csv]
   [--removed removed.csv] [--max-fret 24] [--quiet]
The hand filter of the LOOP session (one filter, used unchanged by every lane): a note is REMOVED when, at its onset,
no fretted place inside the hand-reach window and no open string plays its pitch. Lost rows (or rows with no window)
keep everything: the hand gives no constraint there.
  notes.csv        a CSV with a header and at least the columns onset, offset, pitch (seconds, seconds, MIDI; extra
                   columns are kept as they are), e.g. a note model's notes or chain-2's notes.
  hand_window.csv  hand_window.py's output: t, lo, hi, conf, lost (frets counted from the capo; open strings are not
                   part of lo..hi and are always allowed); readers ignore the extra columns. The row nearest the
                   note's onset is used.
  --tuning         the open strings as MIDI numbers, string 6 first, e.g. 40,45,50,55,59,64 (standard).
  --capo           the capo fret (0 = none). A place is (string, fret from the capo): pitch = open + capo + fret.
  --max-fret       the highest fret from the capo a place may use (default 24; the window is clipped to 1..24).
Writes the kept notes to --out and the removed ones to --removed (same columns as the input, in input order) and prints
one JSON line: notes, kept, removed, lost_onsets (notes whose onset falls in a lost row)."""
import argparse, bisect, csv, json, sys


def load_window(path):
    """Rows of hand_window.csv as (times, windows): a window is (lo, hi) or None when lost or empty."""
    T, W = [], []
    with open(path) as fh:
        for r in csv.DictReader(fh):
            T.append(float(r["t"]))
            lost = str(r.get("lost", "0")).strip() == "1" or str(r.get("lo", "")).strip() == ""
            W.append(None if lost else (int(float(r["lo"])), int(float(r["hi"]))))
    return T, W


def window_at(T, W, t):
    """The window of the row nearest time t (None = no constraint)."""
    j = bisect.bisect_left(T, t)
    if j <= 0: return W[0]
    if j >= len(T): return W[-1]
    return W[j] if abs(T[j] - t) < abs(t - T[j - 1]) else W[j - 1]


def allowed(pitch, w, tuning, capo, max_fret=24):
    """True when the hand allows the pitch: no window (lost), an open string plays it, or a fretted place lies inside."""
    if w is None:
        return True
    for op in tuning:
        fr = pitch - (op + capo)
        if fr == 0:
            return True
        if 1 <= fr <= max_fret and w[0] <= fr <= w[1]:
            return True
    return False


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("notes"); ap.add_argument("window")
    ap.add_argument("--tuning", required=True); ap.add_argument("--capo", type=int, required=True)
    ap.add_argument("--out", default=None); ap.add_argument("--removed", default=None)
    ap.add_argument("--max-fret", type=int, default=24); ap.add_argument("--quiet", action="store_true")
    a = ap.parse_args(argv)
    tuning = [int(x) for x in a.tuning.replace(" ", ",").split(",") if x != ""]
    if len(tuning) != 6:
        sys.exit("--tuning needs 6 MIDI numbers, string 6 to 1")
    T, W = load_window(a.window)
    with open(a.notes) as fh:
        rd = csv.DictReader(fh); cols = rd.fieldnames; notes = list(rd)
    kept, removed, lost = [], [], 0
    for r in notes:
        on = float(r["onset"]); p = int(round(float(r["pitch"])))
        w = window_at(T, W, on)
        lost += w is None
        (kept if allowed(p, w, tuning, a.capo, a.max_fret) else removed).append(r)
    for path, rows in ((a.out, kept), (a.removed, removed)):
        if path:
            with open(path, "w", newline="") as fh:
                wr = csv.DictWriter(fh, fieldnames=cols); wr.writeheader(); wr.writerows(rows)
    res = {"notes": len(notes), "kept": len(kept), "removed": len(removed), "lost_onsets": lost}
    if not a.quiet:
        print(json.dumps(res))
    return res, kept, removed


if __name__ == "__main__":
    main()
