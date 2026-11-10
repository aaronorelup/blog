#!/usr/bin/env python3
"""make_synth.py - build the synthesized test clips S1, S2n, S2s, S3, S4, S5capo2, S5dropd, S6taps, S7flat30.

Every piece is written below as data (bar, beat, length, string, fret, voice). From that data this script writes,
for each clip, into OUT/<id>/:
  <id>.mid         the MIDI that was rendered (type 1, 960 ticks per quarter note, one constant tempo)
  <id>.wav         FluidSynth 2.3.4 with /usr/share/sounds/sf2/FluidR3_GM.sf2: 44.1 kHz, 16-bit, stereo
  <id>.mono.wav    the same audio as (L+R)/2
  <id>.truth.json  ground truth in the shared schema (times in seconds from the first audio sample)
  <id>.notes.csv, <id>.beats.txt, <id>.chords.lab, <id>.tab.txt
  <id>.gp5         S2n, S5capo2, S5dropd only: Guitar Pro 5 file written with PyGuitarPro, re-read and compared
  stems/*.wav      S4 and S6taps only: each part rendered alone, same length and same gain as the mix
and OUT/_checks/synth_checks.json with every sanity check (durations, levels, renderer latency, onset alignment,
re-render from the truth JSON, stems sum, GP5 round trip, detune measurement).

Every clip starts with one bar of count-in (silent, except S4 where a side stick clicks the four beats), so the
first note is not at sample 0 and the MIDI bar lines line up with the music.

Usage: python make_synth.py OUT_DIR
"""
import json
import math
import os
import subprocess
import sys
import tempfile

import mido
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gtr_common import note_name, tab_text, write_beats, write_json, write_lab, write_notes_csv  # noqa: E402

SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
SR = 44100
PPQ = 960
STD = [40, 45, 50, 55, 59, 64]      # E2 A2 D3 G3 B3 E4, string 6 to string 1
DROPD = [38, 45, 50, 55, 59, 64]    # D2 A2 D3 G3 B3 E4
TAIL_S = 1.5                        # silence/decay kept after the last bar ends
PEAK = 10 ** (-1.0 / 20)            # every mix is scaled so its peak sample is -1 dBFS; stems get the mix's gain
GAP_S = 0.010                       # a note ends 10 ms before the next note on the same string / next written note
FLUID = ["fluidsynth", "-ni", "-q", "-T", "wav", "-O", "float", "-r", str(SR), "-g", "0.5", "-R", "1", "-C", "0",
         "-o", "synth.polyphony=1024"]
SILENCE = 1e-6                      # FluidSynth float output carries ~1e-8 of reverb DC/noise even when silent

# General MIDI programs (0-based, as sent in the MIDI program-change message)
NYLON, STEEL, EBASS_FINGER, VOICE_OOHS = 24, 25, 33, 53
# General MIDI percussion keys (channel 10)
GM_KICK_ACOUSTIC, GM_KICK, GM_SIDE_STICK, GM_SNARE, GM_HAT_CLOSED, GM_CRASH = 35, 36, 37, 38, 42, 49

HARTE = {"G": "G:maj", "C": "C:maj", "D": "D:maj", "A": "A:maj", "E": "E:maj", "Em": "E:min", "Am7": "A:min7",
         "D7": "D:7", "Bm": "B:min", "Em7": "E:min7", "A7": "A:7", "G320033": "G:maj"}

# Chord shapes: {string: fret}; strings not listed are not played.
SHAPES = {
    "G": {6: 3, 5: 2, 4: 0, 3: 0, 2: 0, 1: 3},          # 320003
    "G320033": {6: 3, 5: 2, 4: 0, 3: 0, 2: 3, 1: 3},    # 320033
    "Em": {6: 0, 5: 2, 4: 2, 3: 0, 2: 0, 1: 0},         # 022000
    "Am7": {5: 0, 4: 2, 3: 0, 2: 1, 1: 0},              # x02010
    "D7": {4: 0, 3: 2, 2: 1, 1: 2},                     # xx0212
    "C": {5: 3, 4: 2, 3: 0, 2: 1, 1: 0},                # x32010
    "D": {4: 0, 3: 2, 2: 3, 1: 2},                      # xx0232
    "A": {5: 0, 4: 2, 3: 2, 2: 2, 1: 0},                # x02220
    "Bm": {5: 2, 4: 4, 3: 4, 2: 3, 1: 2},               # x24432
    "Em7": {6: 0, 5: 2, 4: 2, 3: 0, 2: 3, 1: 0},        # 022030
    "A7": {5: 0, 4: 2, 3: 0, 2: 2, 1: 0},               # x02020
}

FLUID_LICENSE = ("FluidR3_GM.sf2 (Debian package fluid-soundfont-gm 3.1-5.3) by Frank Wen, MIT license. "
                 "/usr/share/doc/fluid-soundfont-gm/copyright: \"I hereby release Fluid under the MIT license, as "
                 "described in COPYING.\"")


def pitch_of(tuning, capo, string, fret):
    return tuning[6 - string] + capo + fret


class Piece:
    """A piece written as data. Times are in beats from the start of the MIDI file (bar 0 = count-in)."""

    def __init__(self, bpm):
        self.bpm = bpm
        self.notes = []   # dict(on, off, pitch, vel, voice, string, fret, track, nominal, written)
        self.taps = []    # dict(on, off, key, vel, kind, track)

    def tick(self, beat):
        return int(round(beat * PPQ))

    def s2t(self, seconds):
        return int(round(seconds * self.bpm / 60.0 * PPQ))

    def t2s(self, tick):
        return tick * 60.0 / (self.bpm * PPQ)

    def add(self, beat, dur, pitch, vel, voice, track, string=None, fret=None, legato_to=None):
        on = self.tick(beat)
        off = self.tick(beat + dur) - self.s2t(GAP_S)
        self.notes.append(dict(on=on, off=off, pitch=pitch, vel=vel, voice=voice, string=string, fret=fret,
                               track=track, nominal=beat, written=dur))


# ----------------------------------------------------------------------------------------------- the music

def ode_to_joy():
    """'Ode to Joy' theme (Beethoven, Symphony No. 9, 1824), D major, 16 bars, second-position fingering."""
    seq = [  # one list per bar: (sounding MIDI pitch, beats)
        [(66, 1), (66, 1), (67, 1), (69, 1)], [(69, 1), (67, 1), (66, 1), (64, 1)],
        [(62, 1), (62, 1), (64, 1), (66, 1)], [(66, 1.5), (64, 0.5), (64, 2)],
        [(66, 1), (66, 1), (67, 1), (69, 1)], [(69, 1), (67, 1), (66, 1), (64, 1)],
        [(62, 1), (62, 1), (64, 1), (66, 1)], [(64, 1.5), (62, 0.5), (62, 2)],
        [(64, 1), (64, 1), (66, 1), (62, 1)], [(64, 1), (66, 0.5), (67, 0.5), (66, 1), (62, 1)],
        [(64, 1), (66, 0.5), (67, 0.5), (66, 1), (64, 1)], [(62, 1), (64, 1), (57, 2)],
        [(66, 1), (66, 1), (67, 1), (69, 1)], [(69, 1), (67, 1), (66, 1), (64, 1)],
        [(62, 1), (62, 1), (64, 1), (66, 1)], [(64, 1.5), (62, 0.5), (62, 2)],
    ]
    finger = {57: (3, 2), 62: (2, 3), 64: (1, 0), 66: (1, 2), 67: (1, 3), 69: (1, 5)}
    return seq, finger


# 'Twinkle, Twinkle, Little Star' / 'Ah! vous dirai-je, maman', G major, melody in the G3-E4 octave.
TWINKLE_MELODY = [
    [(55, 1), (55, 1), (62, 1), (62, 1)], [(64, 1), (64, 1), (62, 2)],
    [(60, 1), (60, 1), (59, 1), (59, 1)], [(57, 1), (57, 1), (55, 2)],
    [(62, 1), (62, 1), (60, 1), (60, 1)], [(59, 1), (59, 1), (57, 2)],
    [(62, 1), (62, 1), (60, 1), (60, 1)], [(59, 1), (59, 1), (57, 2)],
    [(55, 1), (55, 1), (62, 1), (62, 1)], [(64, 1), (64, 1), (62, 2)],
    [(60, 1), (60, 1), (59, 1), (59, 1)], [(57, 1), (57, 1), (55, 2)],
]
TWINKLE_HARMONY = [("G", "G"), ("C", "G"), ("C", "G"), ("D", "G"), ("G", "C"), ("G", "D"),
                   ("G", "C"), ("G", "D"), ("G", "G"), ("C", "G"), ("C", "G"), ("D", "G")]
TWINKLE_MEL_FINGER = {55: (3, 0), 57: (3, 2), 59: (2, 0), 60: (2, 1), 62: (2, 3), 64: (1, 0)}
# Alternating thumb bass per half bar: (string, fret) for the root (first beat) and the alternate (second beat).
BASS_STD = {"G": [(6, 3), (4, 0)], "C": [(5, 3), (4, 2)], "D": [(4, 0), (5, 0)]}
BASS_DROPD = {"G": [(6, 5), (4, 0)], "C": [(5, 3), (4, 2)], "D": [(6, 0), (5, 0)]}


def build_twinkle(bpm, tuning, capo, bass_map):
    p = Piece(bpm)
    for bar, notes in enumerate(TWINKLE_MELODY, start=1):
        pos = 0.0
        for pitch0, dur in notes:
            s, f = TWINKLE_MEL_FINGER[pitch0]
            vel = 96 if pos == 0 else (90 if pos == 2 else 86)
            p.add(bar * 4 + pos, dur, pitch_of(tuning, capo, s, f), vel, "melody", "melody", s, f)
            pos += dur
    for bar, halves in enumerate(TWINKLE_HARMONY, start=1):
        for h, chord in enumerate(halves):
            for k, (s, f) in enumerate(bass_map[chord]):
                beat = bar * 4 + 2 * h + k
                p.add(beat, 1, pitch_of(tuning, capo, s, f), 74 if k == 0 else 68, "bass", "bass", s, f)
    chords = []
    for bar, halves in enumerate(TWINKLE_HARMONY, start=1):
        for h, chord in enumerate(halves):
            chords.append((bar * 4 + 2 * h, chord))
    return p, chords, 12


def strum_part(p, progression, pattern, last_bar, shapes, tuning, capo, base_vel, voice, track,
               down_spread_s=0.025, up_spread_s=0.020, up_strings=(1, 2, 3)):
    """progression: {bar: [(beat_in_bar_from, chord), ...]}; pattern: [(beat_in_bar, 'D'|'U')].
    The last bar gets one down strum on beat 1 that rings for the whole bar."""
    strums = []  # (start_tick, chord, [(string, tick)], nominal_beat, vel)
    for bar in sorted(progression):
        segs = progression[bar]
        pat = [(0.0, "D")] if bar == last_bar else pattern
        for pos, direction in pat:
            chord = [c for (b0, c) in segs if b0 <= pos][-1]
            shape = shapes[chord]
            if direction == "D":
                strings = sorted(shape, reverse=True)       # low string first
                spread = down_spread_s
                vel = base_vel + (10 if pos == 0 else 0)
            else:
                strings = sorted(s for s in shape if s in up_strings)  # high string first
                spread = up_spread_s
                vel = base_vel - 16
            t0 = p.tick(bar * 4 + pos)
            step = spread / max(1, len(strings) - 1)
            hits = [(s, t0 + p.s2t(i * step)) for i, s in enumerate(strings)]
            strums.append((t0, chord, hits, bar * 4 + pos, vel))
    end_tick = p.tick((last_bar + 1) * 4)
    gap = p.s2t(GAP_S)
    for k, (t0, chord, hits, nominal, vel) in enumerate(strums):
        for i, (s, on) in enumerate(hits):
            end = end_tick
            for (t1, chord1, hits1, _, _) in strums[k + 1:]:
                if chord1 != chord:
                    end = t1
                    break
                again = [tt for (ss, tt) in hits1 if ss == s]
                if again:
                    end = again[0]
                    break
            fret = shapes[chord][s]
            p.notes.append(dict(on=on, off=end - gap, pitch=pitch_of(tuning, capo, s, fret), vel=max(1, vel - i),
                                voice=voice, string=s, fret=fret, track=track, nominal=nominal, written=None))
    return strums


STRUM_PATTERN = [(0, "D"), (1, "D"), (1.5, "U"), (2.5, "U"), (3, "D"), (3.5, "U")]
S3_PROGRESSION = {1: [(0, "G")], 2: [(0, "Em")], 3: [(0, "Am7")], 4: [(0, "D7")], 5: [(0, "G")], 6: [(0, "Em")],
                  7: [(0, "C"), (2, "D7")], 8: [(0, "G")]}


def build_s3(bpm):
    p = Piece(bpm)
    strum_part(p, S3_PROGRESSION, STRUM_PATTERN, 8, SHAPES, STD, 0, 84, "chord", "guitar")
    chords = [(bar * 4 + b0, c) for bar, segs in sorted(S3_PROGRESSION.items()) for (b0, c) in segs]
    return p, chords, 8


S4_PROGRESSION = {1: "D", 2: "A", 3: "Bm", 4: "G320033", 5: "D", 6: "A", 7: "G320033", 8: "A", 9: "Bm",
                  10: "G320033", 11: "D", 12: "A", 13: "Bm", 14: "G320033", 15: None, 16: "D"}
S4_LEAD = {  # bar: [(beat, beats, pitch)]
    1: [(1, 1, 66), (2, 1, 69), (3, 1, 71)], 2: [(0, 2, 69), (2, 2, 64)],
    3: [(1, 1, 66), (2, 1, 62), (3, 1, 66)], 4: [(0, 3, 67)],
    5: [(1, 1, 66), (2, 1, 69), (3, 1, 74)], 6: [(0, 2, 73), (2, 2, 69)],
    7: [(1, 1, 71), (2, 1, 69), (3, 1, 67)], 8: [(0, 3, 64)],
    9: [(0, 2, 74), (2, 1, 73), (3, 1, 71)], 10: [(0, 2, 71), (2, 1, 69), (3, 1, 67)],
    11: [(0, 3, 69), (3, 1, 66)], 12: [(0, 4, 64)],
    13: [(0, 2, 74), (2, 1, 73), (3, 1, 71)], 14: [(0, 2, 71), (2, 2, 74)],
    15: [(0, 1, 71), (1, 1, 67), (2, 1, 69), (3, 1, 73)], 16: [(0, 4, 74)],
}
BASS_ROOT = {"D": 38, "A": 33, "Bm": 35, "G320033": 31, "Em7": 40, "A7": 33}


def build_s4(bpm):
    """Bar 0 is silent, bar 1 is the side-stick count-in, the song is bars 2-17 (S4_* tables use song bars 1-16)."""
    O = 1
    p = Piece(bpm)
    prog = {b + O: ([(0, c)] if c else [(0, "Em7"), (2, "A7")]) for b, c in S4_PROGRESSION.items()}
    strum_part(p, prog, STRUM_PATTERN, 16 + O, SHAPES, STD, 0, 72, "chord", "guitar")
    # bass (electric bass, finger), string/fret not given (not the guitar)
    for bar in range(1, 17):
        c = S4_PROGRESSION[bar]
        if bar == 16:
            line = [(0, 4, 38)]
        elif c is None:
            line = [(0, 1.5, 40), (1.5, 0.5, 40), (2, 1.5, 33), (3.5, 0.5, 33)]
        else:
            r = BASS_ROOT[c]
            line = [(0, 1.5, r), (1.5, 0.5, r), (2, 1, r + 7), (3, 1, r + 12)]
        for b, d, pitch in line:
            p.add((bar + O) * 4 + b, d, pitch, 96 if b == 0 else 84, "bass", "bass")
    # lead line standing in for a singer (GM program 53, Voice Oohs)
    for bar, line in S4_LEAD.items():
        for b, d, pitch in line:
            on = p.tick((bar + O) * 4 + b)
            off = p.tick((bar + O) * 4 + b + d) - p.s2t(0.06)
            p.notes.append(dict(on=on, off=off, pitch=pitch, vel=100 if b == 0 else 92, voice="melody",
                                string=None, fret=None, track="lead", nominal=(bar + O) * 4 + b, written=d))
    # drums: count-in on the side stick, kick/snare/closed hi-hat groove, a snare fill, crashes
    def hit(beat, key, vel):
        on = p.tick(beat)
        p.notes.append(dict(on=on, off=on + p.tick(0.25), pitch=key, vel=vel, voice="drums", string=None,
                            fret=None, track="drums", nominal=beat, written=0.25))
    for b in range(4):
        hit(O * 4 + b, GM_SIDE_STICK, 80)
    for bar in range(1, 16):
        base = (bar + O) * 4
        chorus = bar >= 9
        fill = bar == 8
        for k in range(8):
            pos = k * 0.5
            if fill and pos >= 3:
                continue
            if pos == 0 and bar in (9, 13):
                hit(base, GM_CRASH, 100)
                continue
            hit(base + pos, GM_HAT_CLOSED, 72 if k % 2 == 0 else 56)
        for pos in ([0, 2, 2.5] if chorus else [0, 2]):
            hit(base + pos, GM_KICK, 100)
        for pos in ([1] if fill else [1, 3]):
            hit(base + pos, GM_SNARE, 96)
        if fill:
            for pos, vel in [(3, 70), (3.25, 76), (3.5, 84), (3.75, 96)]:
                hit(base + pos, GM_SNARE, vel)
    hit((16 + O) * 4, GM_KICK, 100)
    hit((16 + O) * 4, GM_CRASH, 100)
    chords = [(bar * 4 + b0, c) for bar, segs in sorted(prog.items()) for (b0, c) in segs]
    return p, chords, 16 + O


def add_taps(p):
    """S6taps: percussive hits standing in for guitar-body taps (GM percussion, channel 10).
    'slap'  = GM key 37 (Side Stick) on beats 2 and 4 of bars 1-12 (these coincide with bass notes);
    'thump' = GM key 35 (Acoustic Bass Drum) on beat 1 of bars 1, 5, 9 (with a bass note) and on the
              'and' of beat 4 of bars 2, 4, 6, 8, 10 (between notes)."""
    def tap(beat, key, vel, kind):
        on = p.tick(beat)
        p.taps.append(dict(on=on, off=on + p.tick(0.25), key=key, vel=vel, kind=kind, track="taps"))
    for bar in range(1, 13):
        for pos in (1, 3):
            tap(bar * 4 + pos, GM_SIDE_STICK, 78, "slap")
    for bar in (1, 5, 9):
        tap(bar * 4, GM_KICK_ACOUSTIC, 88, "thump")
    for bar in (2, 4, 6, 8, 10):
        tap(bar * 4 + 3.5, GM_KICK_ACOUSTIC, 88, "thump")


# ----------------------------------------------------------------------------------------------- MIDI + audio

def write_midi(path, piece, tracks, end_tick, key_sig, only=None):
    """tracks: list of dict(name, channel, program, pan, reverb, bend). only: set of track names to keep notes for."""
    mf = mido.MidiFile(type=1, ticks_per_beat=PPQ)
    t0 = mido.MidiTrack()
    mf.tracks.append(t0)
    t0.append(mido.MetaMessage("track_name", name="tempo map", time=0))
    t0.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(piece.bpm), time=0))
    t0.append(mido.MetaMessage("time_signature", numerator=4, denominator=4, time=0))
    if key_sig:
        t0.append(mido.MetaMessage("key_signature", key=key_sig, time=0))
    t0.append(mido.MetaMessage("end_of_track", time=end_tick))
    for tr in tracks:
        if only is not None and tr["name"] not in only:
            continue
        ch = tr["channel"]
        msgs = [(0, 0, mido.MetaMessage("track_name", name=tr["name"]))]
        if ch != 9:
            msgs.append((0, 1, mido.Message("program_change", channel=ch, program=tr["program"])))
        for cc, val in [(7, 100), (11, 127), (10, tr.get("pan", 64)), (91, tr.get("reverb", 30)), (93, 0)]:
            msgs.append((0, 2, mido.Message("control_change", channel=ch, control=cc, value=val)))
        if tr.get("bend") is not None:
            # RPN 0 (pitch-bend range) = 2 semitones 0 cents, then null RPN, then the bend itself
            for cc, val in [(101, 0), (100, 0), (6, 2), (38, 0), (101, 127), (100, 127)]:
                msgs.append((0, 3, mido.Message("control_change", channel=ch, control=cc, value=val)))
            msgs.append((0, 4, mido.Message("pitchwheel", channel=ch, pitch=tr["bend"])))
        for n in piece.notes:
            if n["track"] == tr["name"]:
                msgs.append((n["on"], 6, mido.Message("note_on", channel=ch, note=n["pitch"], velocity=n["vel"])))
                msgs.append((n["off"], 5, mido.Message("note_off", channel=ch, note=n["pitch"], velocity=0)))
        for n in piece.taps:
            if n["track"] == tr["name"]:
                msgs.append((n["on"], 6, mido.Message("note_on", channel=ch, note=n["key"], velocity=n["vel"])))
                msgs.append((n["off"], 5, mido.Message("note_off", channel=ch, note=n["key"], velocity=0)))
        msgs.append((end_tick, 7, mido.Message("control_change", channel=ch, control=110, value=0)))
        msgs.sort(key=lambda x: (x[0], x[1]))
        mt = mido.MidiTrack()
        last = 0
        for tick, _, m in msgs:
            mt.append(m.copy(time=tick - last))
            last = tick
        mt.append(mido.MetaMessage("end_of_track", time=0))
        mf.tracks.append(mt)
    mf.save(path)


def render(mid_path, n_samples, tmpdir):
    out = os.path.join(tmpdir, os.path.basename(mid_path) + ".f32.wav")
    subprocess.run(FLUID + ["-F", out, SF2, mid_path], check=True, capture_output=True)
    x, sr = sf.read(out, dtype="float64", always_2d=True)
    os.remove(out)
    assert sr == SR and x.shape[1] == 2, (sr, x.shape)
    raw_len = len(x)
    if len(x) < n_samples:
        x = np.vstack([x, np.zeros((n_samples - len(x), 2))])
    return x[:n_samples], raw_len


def first_nonzero(x):
    idx = np.nonzero(np.max(np.abs(x), axis=1) > SILENCE)[0]
    return int(idx[0]) if len(idx) else None


def write_wavs(base, x):
    sf.write(base + ".wav", x, SR, subtype="PCM_16")
    sf.write(base + ".mono.wav", x.mean(axis=1), SR, subtype="PCM_16")


def latency_test(tmpdir):
    """Render single nylon-guitar notes at known, deliberately off-grid times and find the first non-zero sample."""
    res = []
    for k in range(17):
        p = Piece(100)
        tick = 0 if k == 0 else 960 + 2 * (k - 1)   # tick 0, then 16 note-ons 2 ticks (~1.25 ms) apart
        p.notes.append(dict(on=tick, off=tick + 480, pitch=55, vel=100, voice="melody", string=None, fret=None,
                            track="t", nominal=0, written=1))
        mid = os.path.join(tmpdir, f"lat{k}.mid")
        write_midi(mid, p, [dict(name="t", channel=0, program=NYLON, reverb=0)], tick + 960, None)
        x, _ = render(mid, SR * 3, tmpdir)
        expected = p.t2s(tick) * SR
        res.append(dict(note_tick=tick, expected_sample=round(expected, 2), first_nonzero_sample=first_nonzero(x),
                        late_samples=round(first_nonzero(x) - expected, 2)))
    lates = [r["late_samples"] for r in res]
    return dict(method="17 renders of one nylon G3 note (program 24, 100 BPM): note-on at tick 0, then at ticks 960, "
                       "962, ... 990; lateness = first output sample above 1e-6 minus note-on time x 44100. The "
                       "tick-0 render gives the sample's own attack delay; the spread of the others shows the "
                       "64-sample block on which FluidSynth starts notes",
                renders=res, late_samples_min=min(lates), late_samples_max=max(lates),
                late_ms_mean=round(float(np.mean(lates)) / SR * 1000, 3))


def onset_check(mono, truth_onsets):
    """librosa onset detection (hop 128) matched to truth onsets grouped within 35 ms (a strum is one group)."""
    import librosa
    det = librosa.onset.onset_detect(y=mono.astype(np.float32), sr=SR, hop_length=128, units="time", backtrack=False)
    groups = []
    for t in sorted(truth_onsets):
        if not groups or t - groups[-1][-1] > 0.035:
            groups.append([t])
        else:
            groups[-1].append(t)
    starts = np.array([g[0] for g in groups])
    diffs = []
    used = set()
    for t in starts:
        if len(det) == 0:
            break
        j = int(np.argmin(np.abs(det - t)))
        if abs(det[j] - t) <= 0.05 and j not in used:
            used.add(j)
            diffs.append(det[j] - t)
    diffs = np.array(diffs) * 1000
    return dict(method="librosa.onset.onset_detect(hop_length=128, backtrack=False) on the mono mix; truth onsets "
                       "within 35 ms grouped (first onset of the group used); match = nearest detection within 50 ms",
                truth_groups=len(starts), detections=int(len(det)), matched=int(len(diffs)),
                median_ms=round(float(np.median(diffs)), 2) if len(diffs) else None,
                p10_ms=round(float(np.percentile(diffs, 10)), 2) if len(diffs) else None,
                p90_ms=round(float(np.percentile(diffs, 90)), 2) if len(diffs) else None)


def measure_f0(x, t0, t1, f_lo, f_hi):
    """Frequency of the strongest spectral peak between f_lo and f_hi in [t0, t1], Hann window, zero-padded
    FFT to 2^20 points, parabolic interpolation on the log magnitude."""
    seg = x[int(t0 * SR):int(t1 * SR)].mean(axis=1)
    seg = seg * np.hanning(len(seg))
    nfft = 1 << 20
    spec = np.abs(np.fft.rfft(seg, nfft))
    freqs = np.fft.rfftfreq(nfft, 1 / SR)
    lo, hi = np.searchsorted(freqs, f_lo), np.searchsorted(freqs, f_hi)
    k = lo + int(np.argmax(spec[lo:hi]))
    a, b, c = np.log(spec[k - 1:k + 2] + 1e-20)
    d = 0.5 * (a - c) / (a - 2 * b + c)
    return float((k + d) * SR / nfft)


# ----------------------------------------------------------------------------------------------- GP5

def gp5_write_and_check(path, title, piece, last_bar, tuning, capo, program):
    import guitarpro as gp
    song = gp.Song()
    song.title = title
    song.artist = "Traditional (18th-century French melody), arranged for this test set"
    song.tempo = int(piece.bpm)
    song.measureHeaders = []
    for i in range(last_bar + 1):
        h = gp.MeasureHeader(number=i + 1, start=gp.Duration.quarterTime * (1 + 4 * i))
        h.timeSignature = gp.TimeSignature(numerator=4, denominator=gp.Duration(value=4))
        song.addMeasureHeader(h)
    track = song.tracks[0]
    track.name = "Guitar"
    track.offset = capo
    track.strings = [gp.GuitarString(n, tuning[6 - n]) for n in range(1, 7)]
    track.channel.instrument = program
    track.measures = [gp.Measure(track, h) for h in song.measureHeaders]
    durs = {4: (1, False), 3: (2, True), 2: (2, False), 1.5: (4, True), 1: (4, False), 0.5: (8, False), 0.25: (16, False)}

    def rest_fill(voice, length):
        for d in (4, 2, 1, 0.5, 0.25):
            while length >= d - 1e-9:
                b = gp.Beat(voice, status=gp.BeatStatus.rest)
                b.duration = gp.Duration(value=durs[d][0], isDotted=durs[d][1])
                voice.beats.append(b)
                length -= d

    for m_idx, measure in enumerate(track.measures):
        for v_idx, vname in enumerate(["melody", "bass"]):
            voice = measure.voices[v_idx]
            evs = sorted((n for n in piece.notes if n["voice"] == vname and int(n["nominal"] // 4) == m_idx),
                         key=lambda n: n["nominal"])
            pos = 0.0
            for n in evs:
                rel = n["nominal"] - m_idx * 4
                if rel > pos + 1e-9:
                    rest_fill(voice, rel - pos)
                b = gp.Beat(voice, status=gp.BeatStatus.normal)
                b.duration = gp.Duration(value=durs[n["written"]][0], isDotted=durs[n["written"]][1])
                b.notes.append(gp.Note(b, value=n["fret"], string=n["string"], type=gp.NoteType.normal))
                voice.beats.append(b)
                pos = rel + n["written"]
            if pos < 4 - 1e-9:
                rest_fill(voice, 4 - pos)
    gp.write(song, path, version=(5, 1, 0))
    # re-open and compare
    song2 = gp.parse(path)
    t2 = song2.tracks[0]
    got = set()
    for measure in t2.measures:
        for voice in measure.voices:
            for beat in voice.beats:
                for note in beat.notes:
                    pos = (beat.start - gp.Duration.quarterTime) / gp.Duration.quarterTime
                    pitch = t2.strings[note.string - 1].value + t2.offset + note.value
                    got.add((round(pos, 4), note.string, note.value, pitch))
    want = set((round(n["nominal"], 4), n["string"], n["fret"], n["pitch"]) for n in piece.notes)
    return dict(file=os.path.basename(path), tempo=song2.tempo, capo_read_back=t2.offset,
                tuning_read_back=[t2.strings[6 - s].value for s in range(6, 0, -1)][::-1] if False else
                [t2.strings[n - 1].value for n in range(6, 0, -1)],
                notes_written=len(want), notes_read=len(got), matching=len(want & got),
                missing=sorted(want - got)[:10], extra=sorted(got - want)[:10],
                method="PyGuitarPro 0.11 guitarpro.parse(); note position = (beat.start - 960) / 960 quarter notes; "
                       "pitch = string value + track offset (capo) + fret; compared with the truth as sets of "
                       "(position, string, fret, pitch)")


# ----------------------------------------------------------------------------------------------- one clip

def make_clip(out_root, cid, piece, chords_beats, last_bar, meta, tracks, stems=None, gp5=None, checks=None,
              beats_from_bar=1, tmpdir=None):
    d = os.path.join(out_root, cid)
    os.makedirs(d, exist_ok=True)
    bar_end_tick = piece.tick((last_bar + 1) * 4)
    end_tick = bar_end_tick + piece.s2t(TAIL_S)
    duration = piece.t2s(end_tick)
    n_samples = int(round(duration * SR))
    duration = n_samples / SR
    mid = os.path.join(d, cid + ".mid")
    write_midi(mid, piece, tracks, end_tick, meta.get("key_sig"))
    mix, raw_len = render(mid, n_samples, tmpdir)
    gain = PEAK / np.max(np.abs(mix))
    stem_arrays = {}
    if stems:
        os.makedirs(os.path.join(d, "stems"), exist_ok=True)
        for sname, tnames in stems.items():
            smid = os.path.join(tmpdir, f"{cid}_{sname}.mid")
            write_midi(smid, piece, tracks, end_tick, meta.get("key_sig"), only=set(tnames))
            stem_arrays[sname], _ = render(smid, n_samples, tmpdir)
    write_wavs(os.path.join(d, cid), mix * gain)
    stem_rel = {}
    for sname, arr in stem_arrays.items():
        sf.write(os.path.join(d, "stems", sname + ".wav"), arr * gain, SR, subtype="PCM_16")
        stem_rel[sname] = f"stems/{sname}.wav"

    t2s = piece.t2s
    notes = sorted(piece.notes, key=lambda n: (n["on"], n["pitch"]))
    jnotes = [dict(onset=round(t2s(n["on"]), 6), offset=round(t2s(n["off"]), 6), pitch=int(n["pitch"]),
                   velocity=int(n["vel"]), voice=n["voice"], string=n["string"], fret=n["fret"]) for n in notes]
    beats, nums = [], []
    for bar in range(beats_from_bar, last_bar + 1):
        for b in range(4):
            beats.append(round(t2s(piece.tick(bar * 4 + b)), 6))
            nums.append(b + 1)
    downbeats = [t for t, k in zip(beats, nums) if k == 1]
    chords = []
    if chords_beats:
        first = round(t2s(piece.tick(chords_beats[0][0])), 6)
        if first > 0:
            chords.append(dict(start=0.0, end=first, label="N"))
        for i, (b, c) in enumerate(chords_beats):
            st = round(t2s(piece.tick(b)), 6)
            en = round(t2s(piece.tick(chords_beats[i + 1][0])), 6) if i + 1 < len(chords_beats) else round(duration, 6)
            lab = HARTE[c]
            if chords and chords[-1]["label"] == lab:
                chords[-1]["end"] = en
            else:
                chords.append(dict(start=st, end=en, label=lab))
    taps = [dict(time=round(t2s(t["on"]), 6), kind=t["kind"]) for t in sorted(piece.taps, key=lambda t: t["on"])]
    truth = dict(id=cid, title=meta["title"], what=meta["what"], audio=cid + ".wav", duration_s=round(duration, 6),
                 sample_rate=SR, channels=2, tempo_bpm=float(piece.bpm), time_signature="4/4", key=meta["key"],
                 tuning_midi=meta["tuning"], capo=meta["capo"], tuning_offset_cents=meta.get("cents", 0),
                 notes=jnotes, beats=beats, downbeats=downbeats, chords=chords, taps=taps, stems=stem_rel,
                 source=meta["source"])
    write_json(os.path.join(d, cid + ".truth.json"), truth)
    write_notes_csv(os.path.join(d, cid + ".notes.csv"), jnotes)
    write_beats(os.path.join(d, cid + ".beats.txt"), beats, nums)
    write_lab(os.path.join(d, cid + ".chords.lab"), chords)
    # ASCII tab of the guitar part (bars 1..last_bar; the count-in bar is not drawn)
    gnotes = [n for n in notes if n["string"] is not None]
    events = [(int(n["nominal"] // 4) - 1, n["nominal"] - int(n["nominal"] // 4) * 4, n["string"], n["fret"])
              for n in gnotes]
    header = [f"{cid}: {meta['title']}", meta["what"],
              "Tuning (string 6 to 1, without capo): " + " ".join(note_name(p) for p in meta["tuning"]) +
              (f"   Capo: fret {meta['capo']} (fret numbers below are counted from the capo)" if meta["capo"] else
               "   Capo: none"),
              f"Tempo {piece.bpm} BPM, 4/4. One column = one 16th note. Bars are numbered from the MIDI file's first bar = bar 0 (the count-in, not drawn)."
              " Strummed chords are written at the strum's beat."]
    if meta.get("cents"):
        header.append(f"Detuned: every note sounds {meta['cents']} cents from the written pitch.")
    bar_starts = [round(t2s(piece.tick(b * 4)), 3) for b in range(1, last_bar + 1)]
    txt, collisions = tab_text(header, meta["tuning"], events, bar_starts)
    with open(os.path.join(d, cid + ".tab.txt"), "w") as f:
        f.write(txt)

    # ---- checks
    c = dict(id=cid, duration_s=round(duration, 6), samples=n_samples, fluidsynth_rendered_samples=raw_len,
             gain_applied=round(float(gain), 6))
    x16, _ = sf.read(os.path.join(d, cid + ".wav"), dtype="float64", always_2d=True)
    c["wav_read_back"] = dict(samples=len(x16), channels=x16.shape[1], peak_dbfs=round(20 * math.log10(np.max(np.abs(x16))), 2),
                              rms_dbfs=round(20 * math.log10(np.sqrt(np.mean(x16 ** 2))), 2),
                              samples_at_full_scale=int(np.sum(np.abs(x16) >= 32767 / 32768)))
    fnz = first_nonzero(mix)
    first_on = min(n["on"] for n in piece.notes)
    c["first_note_on_s"] = round(t2s(first_on), 6)
    c["first_nonzero_sample"] = fnz
    c["first_nonzero_minus_first_note_ms"] = round((fnz / SR - t2s(first_on)) * 1000, 3) if fnz is not None else None
    c["tab_collisions"] = collisions
    # re-render from the truth JSON: rebuild a MIDI from the JSON times only and compare with the rendered mix
    back = Piece(piece.bpm)
    voice_track = meta["voice_track"]
    for jn in truth["notes"]:
        back.notes.append(dict(on=back.s2t(jn["onset"]), off=back.s2t(jn["offset"]), pitch=jn["pitch"],
                               vel=jn["velocity"], voice=jn["voice"], string=None, fret=None,
                               track=voice_track[jn["voice"]], nominal=0, written=0))
    for tp, src in zip(truth["taps"], sorted(piece.taps, key=lambda t: t["on"])):
        on = back.s2t(tp["time"])
        back.taps.append(dict(on=on, off=on + back.tick(0.25), key=src["key"], vel=src["vel"], kind=tp["kind"],
                              track="taps"))
    bmid = os.path.join(tmpdir, cid + "_fromtruth.mid")
    write_midi(bmid, back, tracks, end_tick, meta.get("key_sig"))
    y, _ = render(bmid, n_samples, tmpdir)
    a, b = mix.mean(axis=1), y.mean(axis=1)
    nfft = 1 << int(math.ceil(math.log2(2 * len(a))))
    xc = np.fft.irfft(np.fft.rfft(a, nfft) * np.conj(np.fft.rfft(b, nfft)), nfft)
    maxlag = int(0.1 * SR)
    lags = np.concatenate([np.arange(0, maxlag + 1), np.arange(-maxlag, 0)])
    vals = np.concatenate([xc[:maxlag + 1], xc[-maxlag:]])
    c["rerender_from_truth"] = dict(
        method="MIDI rebuilt from the truth JSON (seconds -> ticks at the clip tempo, same channels/programs), "
               "rendered again, cross-correlated with the clip's own render (mono, +/-100 ms)",
        best_lag_samples=int(lags[int(np.argmax(vals))]),
        max_abs_difference_relative_to_peak=round(float(np.max(np.abs(mix - y)) / np.max(np.abs(mix))), 9))
    c["onsets"] = onset_check(mix.mean(axis=1) * gain, [n["onset"] for n in truth["notes"]] +
                              [t["time"] for t in truth["taps"]])
    if stems:
        s = sum(stem_arrays.values())
        c["stems_sum_vs_mix"] = dict(
            max_abs_difference_relative_to_mix_peak=round(float(np.max(np.abs(s - mix)) / np.max(np.abs(mix))), 9),
            stem_rms_dbfs={k: round(20 * math.log10(np.sqrt(np.mean((v * gain) ** 2)) + 1e-12), 2)
                           for k, v in stem_arrays.items()})
    if gp5:
        c["gp5"] = gp5_write_and_check(os.path.join(d, cid + ".gp5"), meta["title"], piece, last_bar, meta["tuning"],
                                       meta["capo"], gp5)
    if checks is not None:
        checks[cid] = c
    return truth, mix, gain


def main():
    out = os.path.abspath(sys.argv[1])
    os.makedirs(os.path.join(out, "_checks"), exist_ok=True)
    checks = {}
    tmpdir = tempfile.mkdtemp(prefix="synth_")
    checks["_renderer_latency"] = latency_test(tmpdir)
    checks["_versions"] = dict(fluidsynth=subprocess.run(["fluidsynth", "--version"], capture_output=True,
                                                         text=True).stdout.splitlines()[0],
                               soundfont=SF2, numpy=np.__version__, mido=mido.version_info if hasattr(mido, "version_info") else "1.3.3")

    def src(score_text):
        return dict(kind="synthesized", url=None,
                    license=score_text + " Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and "
                                         "FluidR3_GM.sf2 (MIT license).",
                    license_quote="I hereby release Fluid under the MIT license, as described in COPYING.",
                    attribution="Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license).")

    TWINKLE_PD = ("Melody: 'Ah! vous dirai-je, maman' (the tune of 'Twinkle, Twinkle, Little Star'), an anonymous "
                  "18th-century French melody (Mozart's variations on it, K. 265, date from the early 1780s); public "
                  "domain because of its age. Two-voice guitar arrangement written for this test set.")

    # S1: Ode to Joy, nylon, 144 BPM
    seq, finger = ode_to_joy()
    p1 = Piece(144)
    for bar, notes in enumerate(seq, start=1):
        pos = 0.0
        for pitch, dur in notes:
            s, f = finger[pitch]
            p1.add(bar * 4 + pos, dur, pitch, 96 if pos == 0 else (90 if pos == 2 else 84), "melody", "melody", s, f)
            pos += dur
    make_clip(out, "S1", p1, [], 16, dict(
        title="Ode to Joy (theme), single-note melody, nylon guitar",
        what="Synthesized single-note melody, no chords: the 16-bar 'Ode to Joy' theme in D major on nylon guitar "
             "(GM program 24), 144 BPM, after one silent count-in bar.",
        key="D major", key_sig="D", tuning=STD, capo=0,
        source=src("Melody: 'Ode to Joy' theme from Ludwig van Beethoven's Symphony No. 9 (1824); Beethoven died "
                   "in 1827, so the composition is in the public domain."),
        voice_track={"melody": "melody"}),
        [dict(name="melody", channel=0, program=NYLON)], checks=checks, tmpdir=tmpdir)

    # S2n / S2s: Twinkle two voices, standard tuning, 112 BPM
    meta2 = dict(key="G major", key_sig="G", tuning=STD, capo=0, source=src(TWINKLE_PD),
                 voice_track={"melody": "melody", "bass": "bass"})
    p2, ch2, lb2 = build_twinkle(112, STD, 0, BASS_STD)
    tracks_n = [dict(name="melody", channel=0, program=NYLON), dict(name="bass", channel=1, program=NYLON)]
    tracks_s = [dict(name="melody", channel=0, program=STEEL), dict(name="bass", channel=1, program=STEEL)]
    make_clip(out, "S2n", p2, ch2, lb2, dict(meta2, title="Twinkle (Ah! vous dirai-je, maman), fingerstyle, nylon",
              what="Synthesized fingerstyle: alternating thumb bass plus a melody on top, one guitar, standard tuning, "
                   "no capo, G major, 112 BPM, nylon guitar (GM program 24). Same notes as S2s."),
              tracks_n, gp5=NYLON, checks=checks, tmpdir=tmpdir)
    make_clip(out, "S2s", p2, ch2, lb2, dict(meta2, title="Twinkle (Ah! vous dirai-je, maman), fingerstyle, steel",
              what="Synthesized fingerstyle: the S2n notes rendered with steel-string guitar (GM program 25)."),
              tracks_s, checks=checks, tmpdir=tmpdir)

    # S3: strummed chords, steel, 96 BPM
    p3, ch3, lb3 = build_s3(96)
    meta3 = dict(title="Strummed progression G Em Am7 D7 G Em C-D7 G, steel guitar",
                 what="Synthesized strummed chords, 8 bars, steel guitar (GM program 25), 96 BPM, G major; each down "
                      "strum spreads low-to-high over 25 ms, each up strum (top three strings) high-to-low over 20 ms.",
                 key="G major", key_sig="G", tuning=STD, capo=0,
                 source=src("Chord progression and strum pattern written for this test set."),
                 voice_track={"chord": "guitar"})
    make_clip(out, "S3", p3, ch3, lb3, meta3, [dict(name="guitar", channel=0, program=STEEL)], checks=checks,
              tmpdir=tmpdir)

    # S7flat30: S3 with a -30 cent pitch bend (bend range 2 semitones -> -1229/8192 * 200 cents = -30.005 cents)
    bend = -int(round(30 / 200 * 8192))
    meta7 = dict(meta3, title="S3 detuned 30 cents flat", cents=-30,
                 what=f"Synthesized: the S3 notes rendered 30 cents flat with a MIDI pitch bend of {bend} (bend range "
                      "2 semitones, set with RPN 0) on the guitar channel from time 0; no tempo change.")
    p7, ch7, lb7 = build_s3(96)
    make_clip(out, "S7flat30", p7, ch7, lb7, meta7, [dict(name="guitar", channel=0, program=STEEL, bend=bend)],
              checks=checks, tmpdir=tmpdir)

    # S4: band, 116 BPM
    p4, ch4, lb4 = build_s4(116)
    tracks4 = [dict(name="drums", channel=9, program=0, pan=64), dict(name="bass", channel=1, program=EBASS_FINGER),
               dict(name="guitar", channel=2, program=STEEL, pan=52), dict(name="lead", channel=3, program=VOICE_OOHS, pan=76)]
    make_clip(out, "S4", p4, ch4, lb4, dict(
        title="Band: drums, bass, strummed guitar, lead line (singer stand-in)",
        what="Synthesized band, D major, 116 BPM: one silent bar, one side-stick count-in bar, then 16 bars of drums (channel 10), electric "
             "bass (GM program 33), strummed steel guitar (program 25), lead line on Voice Oohs (program 53) standing "
             "in for a singer. Mix plus each stem alone under stems/.",
        key="D major", key_sig="D", tuning=STD, capo=0,
        source=src("Song (chords, bass line, lead melody, drum part) written for this test set."),
        voice_track={"drums": "drums", "bass": "bass", "chord": "guitar", "melody": "lead"}),
        tracks4, stems={"drums": ["drums"], "bass": ["bass"], "guitar": ["guitar"], "lead": ["lead"]},
        checks=checks, beats_from_bar=1, tmpdir=tmpdir)

    # S5capo2 / S5dropd
    p5, ch5, lb5 = build_twinkle(112, STD, 2, BASS_STD)
    ch5 = [(b, {"G": "A", "C": "D", "D": "E"}[c]) for b, c in ch5]
    make_clip(out, "S5capo2", p5, ch5, lb5, dict(
        title="S2 with a capo on fret 2", key="A major", key_sig="A", tuning=STD, capo=2, source=src(TWINKLE_PD),
        voice_track={"melody": "melody", "bass": "bass"},
        what="Synthesized: the S2 tab played with a capo on fret 2 (same strings and frets counted from the capo, "
             "sounds 2 semitones higher, A major), nylon guitar (program 24), 112 BPM."),
        tracks_n, gp5=NYLON, checks=checks, tmpdir=tmpdir)
    p6, ch6, lb6 = build_twinkle(112, DROPD, 0, BASS_DROPD)
    make_clip(out, "S5dropd", p6, ch6, lb6, dict(
        title="S2 in Drop D, bass re-fingered", key="G major", key_sig="G", tuning=DROPD, capo=0, source=src(TWINKLE_PD),
        voice_track={"melody": "melody", "bass": "bass"},
        what="Synthesized: the S2 piece in Drop D (D2 A2 D3 G3 B3 E4), nylon (program 24), 112 BPM. Melody unchanged; "
             "bass re-fingered: G2 moves to string 6 fret 5, and the D-chord root moves down an octave from D3 "
             "(string 4 open) to D2 (string 6 open)."),
        tracks_n, gp5=NYLON, checks=checks, tmpdir=tmpdir)

    # S6taps: S2s + percussion stand-ins for body taps
    p8, ch8, lb8 = build_twinkle(112, STD, 0, BASS_STD)
    add_taps(p8)
    tracks8 = tracks_s + [dict(name="taps", channel=9, program=0)]
    make_clip(out, "S6taps", p8, ch8, lb8, dict(
        title="S2s with percussive hits standing in for guitar-body taps", key="G major", key_sig="G", tuning=STD,
        capo=0, source=src(TWINKLE_PD), voice_track={"melody": "melody", "bass": "bass"},
        what="Synthesized: the S2s notes (steel, program 25) plus General MIDI percussion standing in for body taps: "
             "kind 'slap' = GM key 37 Side Stick (beats 2 and 4, bars 1-12), kind 'thump' = GM key 35 Acoustic Bass "
             "Drum (beat 1 of bars 1, 5, 9 and the 'and' of beat 4 in bars 2, 4, 6, 8, 10)."),
        tracks8, stems={"guitar": ["melody", "bass"], "taps": ["taps"]}, checks=checks, tmpdir=tmpdir)

    # detune measurement: last bar of S3 vs S7flat30 (open G chord ringing), peak near G4 = 392 Hz
    x3, _ = sf.read(os.path.join(out, "S3", "S3.wav"), dtype="float64", always_2d=True)
    x7, _ = sf.read(os.path.join(out, "S7flat30", "S7flat30.wav"), dtype="float64", always_2d=True)
    pp = Piece(96)
    t0 = pp.t2s(pp.tick(8 * 4)) + 0.3
    t1 = t0 + 2.0
    f3 = measure_f0(x3, t0, t1, 370, 410)
    f7 = measure_f0(x7, t0, t1, 370, 410)
    f3b = measure_f0(x3, t0, t1, 185, 205)
    f7b = measure_f0(x7, t0, t1, 185, 205)
    checks["S7flat30"]["detune_measurement"] = dict(
        method=f"strongest spectral peak in [370, 410] Hz and in [185, 205] Hz of the final G chord, {t0:.3f}-{t1:.3f} s, "
               "Hann window, FFT zero-padded to 2^20, parabolic interpolation; cents = 1200*log2(f_S7/f_S3)",
        S3_peak_hz=round(f3, 3), S7_peak_hz=round(f7, 3), cents_392=round(1200 * math.log2(f7 / f3), 2),
        S3_peak2_hz=round(f3b, 3), S7_peak2_hz=round(f7b, 3), cents_196=round(1200 * math.log2(f7b / f3b), 2),
        S3_vs_equal_tempered_G4_cents=round(1200 * math.log2(f3 / 391.995), 2),
        bend_value=bend, bend_nominal_cents=round(bend / 8192 * 200, 3))
    with open(os.path.join(out, "_checks", "synth_checks.json"), "w") as f:
        json.dump(checks, f, indent=1, default=str)
    print(json.dumps({k: {kk: v.get(kk) for kk in ("duration_s", "first_nonzero_minus_first_note_ms")}
                      for k, v in checks.items() if not k.startswith("_")}, indent=0))
    print("latency", checks["_renderer_latency"]["late_samples_min"], checks["_renderer_latency"]["late_samples_max"])


if __name__ == "__main__":
    main()
