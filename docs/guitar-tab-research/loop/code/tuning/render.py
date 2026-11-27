#!/usr/bin/env python3
"""render.py <notes.csv> <out.wav> [--t0 S --t1 S] [--program 24] [--mix video.mp4]

Plays a note list (onset,offset,pitch; any subset you choose, e.g. a CSV you write with the notes you want to hear)
with FluidSynth (the FluidR3_GM sound font; General MIDI program 24 = nylon guitar, 25 = steel guitar, 0-based) as a
44.1 kHz WAV. With --t0/--t1 only the notes with onsets in that stretch are played and time 0 of the WAV is --t0 on
the recording's clock. --mix: the left channel is the recording's sound over the same stretch, the right channel the
rendering, so the two can be compared (you cannot listen: run a note list against it, or look with spectro.py).
"""
import argparse, csv, os, struct, subprocess, sys, tempfile

SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
TPS = 960  # ticks per second (tempo 1 s per quarter, 960 ticks per quarter)


def vlq(n):
    out = [n & 0x7F]; n >>= 7
    while n:
        out.append(0x80 | (n & 0x7F)); n >>= 7
    return bytes(reversed(out))


def write_mid(notes, path, program):
    ev = []
    for on, off, p in notes:
        ev.append((int(round(on * TPS)), 1, bytes([0x90, p, 90])))
        ev.append((int(round(max(off, on + 0.05) * TPS)), 0, bytes([0x80, p, 0])))
    ev.sort(key=lambda e: (e[0], e[1]))
    trk = vlq(0) + bytes([0xFF, 0x51, 3]) + (1000000).to_bytes(3, "big") + vlq(0) + bytes([0xC0, program])
    last = 0
    for t, _, b in ev:
        trk += vlq(t - last) + b; last = t
    trk += vlq(TPS) + bytes([0xFF, 0x2F, 0])
    with open(path, "wb") as fh:
        fh.write(b"MThd" + struct.pack(">IHHH", 6, 0, 1, TPS) + b"MTrk" + struct.pack(">I", len(trk)) + trk)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("notes"); ap.add_argument("out")
    ap.add_argument("--t0", type=float, default=0.0); ap.add_argument("--t1", type=float, default=1e9)
    ap.add_argument("--program", type=int, default=24); ap.add_argument("--mix")
    a = ap.parse_args()
    notes = []
    with open(a.notes) as fh:
        for r in csv.DictReader(fh):
            on = float(r["onset"]); off = float(r.get("offset") or on + 0.5); p = int(round(float(r["pitch"])))
            if a.t0 <= on < a.t1:
                notes.append((on - a.t0, off - a.t0, p))
    if not notes:
        sys.exit("no notes in that stretch")
    dur = (min(a.t1, a.t0 + max(n[1] for n in notes) + 1.5)) - a.t0
    with tempfile.TemporaryDirectory() as td:
        mid, wav = os.path.join(td, "n.mid"), os.path.join(td, "r.wav")
        write_mid(notes, mid, a.program)
        subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.6", "-r", "44100", "-F", wav, SF2, mid], check=True,
                       capture_output=True)
        if a.mix:
            subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-ss", str(a.t0), "-t", str(dur), "-i", a.mix,
                            "-i", wav, "-filter_complex",
                            f"[0:a]aformat=channel_layouts=mono,aresample=44100,apad,atrim=0:{dur}[l];"
                            f"[1:a]pan=mono|c0=0.5*c0+0.5*c1,aresample=44100,apad,atrim=0:{dur}[r];[l][r]join=inputs=2:channel_layout=stereo[o]",
                            "-map", "[o]", a.out], check=True)
        else:
            subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", wav, "-t", str(dur), a.out], check=True)
    print(f"{a.out}: {len(notes)} notes, {dur:.2f} s" + (" (left: recording, right: rendering)" if a.mix else ""))


if __name__ == "__main__":
    main()
