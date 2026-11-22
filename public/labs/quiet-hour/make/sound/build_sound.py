"""The Quiet Hour: the whole soundtrack of one ending, offline, from the cue file and the frozen voice.

    python build_sound.py --ending main --cues <cues-main.json> --out <dir>
        [--programme <published 48 kHz WAV>] [--voice <frozen voice dir>] [--sync-proof]

Reads ONLY: the cue file (written by ../cues.mjs from the log and the film's rules), the ending's published audio
(Fable 5.2's programme, decoded to 48 kHz, sample 0 = programme 00:00) and the frozen voice files. Nothing here reads
the log or knows a rule of the run: every sound below is placed by a cue. The ending's name only picks which published
file to open; no code path depends on it.

Grid: 24 fps, 2,000 samples a frame at 48 kHz, a note is 5 frames (10,000 samples), a bar 30 frames (60,000 samples).
The programme is frames 0 to 2159, the coda (black) frames 2160 to 2399; the output is exactly 4,800,000 samples,
48 kHz stereo, 24-bit.

Layers (film bible section 5):
  TV bus, mono, through the speaker chain: the programme (through a static compressor, and dipped under the voice as
    a broadcast mix would: 9 dB, or more where that is needed to keep the voice clear of it), the maker's voice, the
    bench foley (punch ticks, a ratchet click on every knob turn, the chalk tick, dial taps, crank creak) and, in the
    coda, the last bet held as a pad.
  Room bus, stereo, not through the speaker: house hum (follows the cue's hum flag), a wall-clock tick on every bar
    line, a faint tube whine, tear crackle, spoon chatter.
Mix: one fixed master gain, the same for every ending (so the first 20:00 are the same bytes in all four), and an
offline peak limiter. The build FAILS (and renames its output .FAILED.wav) if true peak is above -1 dBTP, short-term
loudness is above -13 LUFS anywhere, integrated loudness is outside -18 to -15 LUFS, any line of the voice is less
than 4 LU over everything under it, or the length is not 4,800,000 samples.
numpy and scipy only. Every random number is drawn from a generator seeded by (SEED, layer, index).
"""
import argparse
import hashlib
import json
import os
import sys

import numpy as np
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import bs1770  # noqa: E402
from wav24 import read_wav, write_wav24  # noqa: E402

SR = 48000
FPS = 24
SPF = SR // FPS            # 2000 samples per frame
FPN = 5                    # frames per note
SPN = SPF * FPN            # 10,000 samples per note
FPB = 30                   # frames per bar
NOTES = 432
PROG_FRAMES = NOTES * FPN  # 2160
FRAMES = 2400
N = FRAMES * SPF           # 4,800,000
SEED = 87

# The published programmes (input selection only).
PUBLISHED = {'main': 'fable-training-run', 'alone': 'fable-training-run-left-alone',
             'x3': 'fable-training-run-held-3x', 'x10': 'fable-training-run-held-10x'}

# ---- authored constants (film bible section 9: the speaker chain and the mix are authored) ----
COMP_THRESHOLD_DB = -17.0  # detector level (1 s K-weighted RMS of the band-limited programme, dBFS) where it starts
COMP_RATIO = 10.0
COMP_KNEE_DB = 3.0
COMP_WINDOW_BLOCKS = 100   # 1 s detector window, in 10 ms blocks
COMP_ATTACK_S = 0.03
COMP_RELEASE_S = 0.4
VOICE_DB = 1.5             # gain on the frozen voice (its speech sits at -20 dBFS RMS)
DUCK_DB = 9.0              # the programme dips at least this much under the maker's voice, as a broadcast mix would,
VOICE_OVER_BED_LU = 4.0    # and by as much more as keeps its level (below) this far under the line's own level,
DUCK_MAX_DB = 24.0         # up to this much
DUCK_PRE_S = 0.12          # the dip is in place when a line starts: it comes down over this long before it,
DUCK_TAIL_S = 0.10         # starts back this long before the frozen take ends (its last 150 ms are silence)
DUCK_RELEASE_S = 0.30      # and is back up this long after that
BED_HOLD_S = 1.0           # the programme's level for the dip: 10 ms RMS, rising at once, falling with this time constant
VOICE_MARGIN_MIN_LU = 4.0  # the build fails if a line of the voice is less than this over everything under it
MASTER_GAIN_DB = -3.7      # one fixed master gain for every ending (a per-ending normaliser would let the end of
                           # the log change the level of the opening); chosen so all four meet the caps
INTEGRATED_RANGE = (-18.0, -15.0)   # 'about -16 LUFS integrated': the short-term cap binds first, so it lands near -17
CAP_TP = -1.0
CAP_ST = -13.0
LIMIT_DBTP = -1.5          # the master peak limiter's ceiling (true peak, 4x oversampled)
LIMIT_HALF_S = 0.005       # its gain moves over 10 ms windows, centred on the peak
SYNTH = {'lo': 57, 'P': 30, 'halo': 0.3, 'master': 0.5, 'sr': 44100}   # the published synth's pad rule (synth.js)
RINGOUT_S = 2.5            # the published ring-out after 30:00
PAD_HOLD_FADE_S = 0.6      # the published pad fades out over 0.6 s after the last note; the held pad fades in over it
PAD_DECAY_S = 6.0          # the held bet decays to silence over 6 s after the ring-out


def rng(layer, i=0):
    return np.random.default_rng([SEED, layer, i])


def note_start(g):
    return g * SPN


def frame_sample(f):
    return int(f) * SPF


# ---------------------------------------------------------------- cues
def load_cues(path):
    """Read a cue file written by make/cues.mjs (format quiet-hour-cues/1) into plain lists."""
    c = json.load(open(path))
    if c.get('format') != 'quiet-hour-cues/1':
        raise SystemExit('unknown cue format %r' % c.get('format'))
    grid = {'fps': FPS, 'noteFrames': FPN, 'barFrames': FPB, 'programmeFrames': PROG_FRAMES, 'totalFrames': FRAMES,
            'samplesPerFrameAt48k': SPF}
    for k, v in grid.items():
        if c.get(k) != v:
            raise SystemExit('cue file grid %s=%s, expected %s' % (k, c.get(k), v))
    pn = c['perNote']

    def col(name):
        v = pn[name]
        if len(v) != NOTES:
            raise SystemExit('cue column %s has %d notes, expected %d' % (name, len(v), NOTES))
        return v

    num = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool) and v == v
    cues = {
        'pickKind': [str(k) for k in col('pickKind')],
        'p': [float(v) if num(v) else None for v in col('pickP')],
        'hum': [bool(v) for v in col('humOn')],
        'tear': [float(v) if num(v) else 0.0 for v in col('tear')],
        'spoon': [bool(v) for v in col('spoonChatter')],
        'humLevelPerFrame': c.get('perFrame', {}).get('humLevel'),
    }
    cues['lines'] = sorted(({'id': l['id'], 'variant': l.get('variant'), 'text': l['text'], 'frame': int(l['frame'])}
                            for l in c['lines']), key=lambda l: l['frame'])
    cues['knobTurns'] = [{'frame': int(t['frame']), 'frames': int(t['frames']), 'note': int(t['note'])} for t in c['knobTurns']]
    cues['taps'] = sorted(int(f) for t in c['dialTaps'] if t.get('performed') for f in t['contacts'])
    cues['chalk'] = {'frame': int(c['chalk']['frame']), 'frames': int(c['chalk']['tickFrames'])}   # the hand's tick
    bet = c['coda']['bet']
    if len(bet) < SYNTH['P']:
        raise SystemExit('cue file has no coda bet')
    cues['bet'] = [float(v) if num(v) else float('nan') for v in bet]
    return cues


# ---------------------------------------------------------------- small DSP helpers
def peaking(f0, gain_db, q):
    """RBJ peaking biquad as an sos row."""
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    al = np.sin(w) / (2 * q)
    b = np.array([1 + al * A, -2 * np.cos(w), 1 - al * A])
    a = np.array([1 + al / A, -2 * np.cos(w), 1 - al / A])
    return np.concatenate([b / a[0], a / a[0]])[None, :]


def band(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='bandpass', fs=SR, output='sos'), x)


def add(buf, start, sig):
    """Mix sig into buf from sample `start`, clipped to the buffer."""
    if start >= len(buf) or start + len(sig) <= 0:
        return
    a = max(0, start)
    b = min(len(buf), start + len(sig))
    buf[a:b] += sig[a - start:b - start]


def decay(n, tau_s):
    return np.exp(-np.arange(n) / (tau_s * SR))


# ---------------------------------------------------------------- the programme and its compressor
def compressor_gain(mono):
    """A static compressor: fixed threshold, ratio and knee on the loudness of the band-limited programme
    (K-weighted, 1 s RMS), with attack and release smoothing on 10 ms blocks. Returns the per-sample linear gain."""
    det = sosfilt(butter(2, [160, 5500], btype='bandpass', fs=SR, output='sos'), mono)
    det = bs1770.kweight(det[:, None])[:, 0]
    blk = SR // 100
    m = len(det) // blk
    pw = (det[:m * blk].reshape(m, blk) ** 2).mean(1)
    c = np.concatenate([[0.0], np.cumsum(pw)])
    w = COMP_WINDOW_BLOCKS
    idx = np.arange(m)
    lo = np.maximum(0, idx - w + 1)
    rms = (c[idx + 1] - c[lo]) / (idx + 1 - lo)
    lvl = 10 * np.log10(rms + 1e-12)
    over = lvl - COMP_THRESHOLD_DB
    k = COMP_KNEE_DB / 2
    red = np.where(over <= -k, 0.0,
                   np.where(over >= k, over * (1 - 1 / COMP_RATIO),
                            (1 - 1 / COMP_RATIO) * (over + k) ** 2 / (4 * k)))
    a_at = np.exp(-1 / (COMP_ATTACK_S * 100))
    a_re = np.exp(-1 / (COMP_RELEASE_S * 100))
    sm = np.empty(m)
    s = 0.0
    for i in range(m):
        a = a_at if red[i] > s else a_re
        s = a * s + (1 - a) * red[i]
        sm[i] = s
    g_db = np.interp(np.arange(len(mono)), idx * blk + blk / 2, -sm)
    return 10 ** (g_db / 20), lvl, sm


def held_pad(bet, start, n_hold_fade, n_ring, n_decay):
    """The last note's bet held after the programme, by the published synth's pad rule: every pitch at an energy
    equal to its probability (amplitude sqrt(p)), sine plus 0.12 of its octave, at the synth's halo and master gain.
    Phase-locked to the published pad, so it continues it: it fades in over the 0.6 s the published pad fades out,
    holds to the end of the ring-out, then decays to silence over PAD_DECAY_S. Mono (the speaker is mono)."""
    P, lo = SYNTH['P'], SYNTH['lo']
    total = n_ring + n_decay
    t = (start + np.arange(total)) / SR
    x = np.zeros(total)
    for i in range(P):
        p = bet[i]
        if not (p == p) or p <= 0:
            continue
        f = 440 * 2 ** ((lo + i - 69) / 12)
        pan = -0.7 + 1.4 * i / (P - 1)
        g = 0.5 * (np.cos((pan + 1) * np.pi / 4) + np.sin((pan + 1) * np.pi / 4)) * SYNTH['halo']
        ph = 2 * np.pi * f * (t + 1 / SYNTH['sr'])          # the published pad's phase: it advances before it sounds
        x += g * np.sqrt(p) * (np.sin(ph) + 0.12 * np.sin(2 * ph))
    env = np.ones(total)
    env[:n_hold_fade] = np.arange(n_hold_fade) / n_hold_fade
    k = np.arange(n_decay)
    env[n_ring:] = np.exp(-6.9 * k / n_decay) * (1 - k / n_decay)    # -60 dB by the end, and exactly 0 there
    return x * env * SYNTH['master']


def bed_level(bed_st):
    """The programme's level as the room hears it, for the dip under the voice: K-weighted power of both channels in
    1 ms blocks, a 10 ms mean, rising at once and falling slowly (BED_HOLD_S). Causal: block k holds nothing that
    sounds after it, so what happens after 20:00 cannot reach back before it."""
    z = bs1770.kweight(bed_st)
    p = (z * z).sum(axis=1)
    blk = SR // 1000
    m = len(p) // blk
    pb = p[:m * blk].reshape(m, blk).mean(axis=1)
    c = np.concatenate([[0.0], np.cumsum(pb)])
    idx = np.arange(m)
    lo = np.maximum(0, idx - 9)
    p10 = (c[idx + 1] - c[lo]) / (idx + 1 - lo)
    fall = np.exp(-1.0 / (BED_HOLD_S * 1000))
    env = np.empty(m)
    e = 0.0
    for i in range(m):
        e = max(p10[i], e * fall)
        env[i] = e
    return env


def voice_dip(spans, voice_st, env):
    """How far the programme dips under the maker's voice, in dB per sample. Under a line it dips DUCK_DB, or as far
    as it takes to hold its level (bed_level, as known 1 ms earlier) VOICE_OVER_BED_LU under that line's own
    K-weighted level, up to DUCK_MAX_DB. The dip comes down before the line starts and goes back up after it ends.
    Keyed only by where the cues put the lines, the frozen takes and the programme so far."""
    blk = SR // 1000
    zv = bs1770.kweight(voice_st)
    cv = np.concatenate([[0.0], np.cumsum((zv * zv).sum(axis=1))])
    known = np.concatenate([[0.0], env[:-1]])
    dip = np.zeros(N)
    for a, b in spans:
        allowed = (cv[b] - cv[a]) / (b - a) / 10 ** (VOICE_OVER_BED_LU / 10)
        a0 = max(0, a - int(DUCK_PRE_S * SR))
        b1 = max(a, b - int(DUCK_TAIL_S * SR))
        b2 = min(N, b1 + int(DUCK_RELEASE_S * SR))
        k0, k1 = a0 // blk, (b2 + blk - 1) // blk
        need = 10 * np.log10(np.maximum(known[k0:k1], 1e-30) / allowed)
        need = np.repeat(np.clip(need, DUCK_DB, DUCK_MAX_DB), blk)[a0 - k0 * blk:b2 - k0 * blk]
        w = np.ones(b2 - a0)
        if a > a0:
            w[:a - a0] = 0.5 - 0.5 * np.cos(np.pi * np.arange(a - a0) / (a - a0))
        if b2 > b1:
            w[b1 - a0:] = 0.5 + 0.5 * np.cos(np.pi * np.arange(b2 - b1) / (b2 - b1))
        dip[a0:b2] = np.maximum(dip[a0:b2], w * need)
    k = SR // 500                                # a 2 ms running mean of what came before, so the 1 ms steps do not zip
    c = np.concatenate([np.zeros(k), np.cumsum(dip)])
    return (c[k:] - c[:-k]) / k


def line_margins(spans, voice_out, rest_out):
    """Per line: the K-weighted loudness of the voice alone and of everything else in the final mix, over the line's
    own samples, and the difference (LU)."""
    out = []
    cs = []
    for x in (voice_out, rest_out):
        z = bs1770.kweight(x)
        cs.append(np.concatenate([[0.0], np.cumsum((z * z).sum(axis=1))]))
    for a, b in spans:
        lv, lr = (-0.691 + 10 * np.log10(max((c[b] - c[a]) / (b - a), 1e-30)) for c in cs)
        out.append((float(lv), float(lr), float(lv - lr)))
    return out


# ---------------------------------------------------------------- the speaker chain
def speaker_chain(mono):
    """The TV: band-limit (160 Hz to 5.5 kHz), a little presence, a cabinet resonance, then a short cabinet-and-room
    response that turns the mono speaker into a stereo room sound. Linear and causal, so it adds no delay at its
    direct path (verified by the sync proof)."""
    sos = np.vstack([butter(4, 160, btype='highpass', fs=SR, output='sos'),
                     butter(4, 5500, btype='lowpass', fs=SR, output='sos'),
                     peaking(2800, 3.0, 0.9), peaking(190, 2.5, 1.4), peaking(900, -1.5, 1.2)])
    y = sosfilt(sos, mono)
    ir = room_ir()
    out = np.stack([fftconvolve(y, ir[:, 0])[:len(y)], fftconvolve(y, ir[:, 1])[:len(y)]], axis=1)
    return out


def room_ir():
    """Direct sound at sample 0 on both sides, six early reflections per side (3 to 19 ms), and a soft decorrelated
    tail (about 0.3 s to -60 dB) low-passed like a carpeted living room."""
    n = int(0.4 * SR)
    ir = np.zeros((n, 2))
    ir[0] = [1.0, 1.0]
    taps = [((3.1, 0.32), (3.7, 0.30)), ((5.3, 0.22), (6.1, 0.24)), ((8.2, 0.16), (7.4, 0.17)),
            ((11.9, 0.12), (12.8, 0.11)), ((15.4, 0.09), (16.6, 0.10)), ((18.7, 0.07), (19.3, 0.07))]
    for (dl, gl), (dr, gr) in taps:
        ir[int(dl * SR / 1000), 0] += gl
        ir[int(dr * SR / 1000), 1] += gr
    for ch in range(2):
        noise = rng(1, ch).standard_normal(n)
        tail = sosfilt(butter(2, 3000, fs=SR, output='sos'), noise) * np.exp(-6.9 * np.arange(n) / (0.3 * SR))
        tail[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir[:, ch] += 0.035 * tail
    return ir


# ---------------------------------------------------------------- bench foley (into the TV)
def punch(p, r):
    """The brass punch: a dry 2 ms click and a small thunk, level by the pick's probability."""
    n = int(0.03 * SR)
    click = band(r.standard_normal(n), 1800, 4500) * decay(n, 0.0015)
    th = np.sin(2 * np.pi * 420 * np.arange(n) / SR) * decay(n, 0.006)
    return (0.55 * click + 0.45 * th) * 0.10 * p


def ratchet(r):
    """Three pawl clicks 17 ms apart, the third softest."""
    n = int(0.08 * SR)
    out = np.zeros(n)
    for j, (d, a) in enumerate(((0.0, 1.0), (0.017, 0.8), (0.034, 0.55))):
        m = int(0.012 * SR)
        k = band(r.standard_normal(m), 2500, 7000) * decay(m, 0.0012)
        k += 0.4 * np.sin(2 * np.pi * (1900 + 120 * j) * np.arange(m) / SR) * decay(m, 0.003)
        add(out, int(d * SR), a * k)
    return out * 0.05


def chalk(frames, r):
    """A chalk stroke as long as the cue says: bright scraping noise in short grains."""
    n = frames * SPF
    x = band(r.standard_normal(n), 1500, 6500, 2)
    grain = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 37 * np.arange(n) / SR + r.uniform(0, 6.28)))
    env = np.sin(np.pi * np.arange(n) / n) ** 0.5
    return x * grain * env * 0.035


def tap(r):
    """A fingertip on the dial glass: a knock with two glass modes."""
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 1150 * t) * decay(n, 0.02) + 0.5 * np.sin(2 * np.pi * 2730 * t) * decay(n, 0.012)
         + 0.6 * band(r.standard_normal(n), 300, 2500) * decay(n, 0.003))
    return x * 0.06


def creak(r):
    """The crank: a soft stick-slip creak of a third of a second."""
    n = int(0.33 * SR)
    t = np.arange(n) / SR
    rate = 23 + 4 * r.uniform()
    pulses = (np.sin(2 * np.pi * rate * t + r.uniform(0, 6.28)) > 0.6).astype(float)
    x = band(r.standard_normal(n), 550, 1500) * (0.3 + 0.7 * pulses)
    return x * np.hanning(n) * 0.012


# ---------------------------------------------------------------- the room (stereo, not through the speaker)
def pan(x, p):
    """Equal-power pan, p in [-1, 1]."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def hum_env(hum):
    """The hum's gain per sample: 0 from the first sample of any note whose hum flag is off (a 2 ms fade, so it
    stops dead with no tail), and back up linearly over 2 s while the flag is on. Held at the last note's state
    through the coda."""
    flags = np.repeat(np.array(hum, dtype=bool), SPN)
    flags = np.concatenate([flags, np.full(N - len(flags), flags[-1])])
    blk = 80                               # 1.67 ms (a note is 125 blocks)
    m = N // blk
    f = flags[::blk][:m]
    env = np.empty(m)
    s = 1.0 if f[0] else 0.0
    up = blk / (2.0 * SR)
    for i in range(m):
        s = min(1.0, s + up) if f[i] else 0.0
        env[i] = s
    e = np.repeat(env, blk)
    # the 2 ms steps down are linear within their block
    return np.convolve(e, np.ones(blk) / blk, mode='full')[:N]


def house_hum(hum):
    """Low pink noise under 250 Hz plus a faint 50 Hz with two harmonics, slightly different on each side."""
    out = np.zeros((N, 2))
    t = np.arange(N) / SR
    mains = 0.6 * np.sin(2 * np.pi * 50 * t) + 0.3 * np.sin(2 * np.pi * 100 * t + 0.7) + 0.12 * np.sin(2 * np.pi * 150 * t + 1.9)
    for ch in range(2):
        w = rng(10, ch).standard_normal(N)
        W = np.fft.rfft(w)
        fr = np.fft.rfftfreq(N, 1 / SR)
        W[1:] /= np.sqrt(fr[1:])
        W[0] = 0
        pink = np.fft.irfft(W, N)
        pink = sosfilt(butter(2, [25, 250], btype='bandpass', fs=SR, output='sos'), pink)
        pink /= np.sqrt((pink ** 2).mean())
        out[:, ch] = 0.0040 * pink + 0.0016 * mains
    return out * hum_env(hum)[:, None]


def clock_tick(i):
    """A wall-clock tick: a hard click and a short brass resonance; alternate ticks a little lower (tick, tock)."""
    r = rng(20, i)
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    f = 3150 if i % 2 == 0 else 2780
    x = (band(r.standard_normal(n), 2000, 9000) * decay(n, 0.0008)
         + 0.5 * np.sin(2 * np.pi * f * t) * decay(n, 0.010) + 0.25 * np.sin(2 * np.pi * 1210 * t) * decay(n, 0.006))
    return x * 0.022 * 10 ** (r.uniform(-0.8, 0.8) / 20)


def tube_whine(tv_on):
    """The line-output transformer: a 15.6 kHz whine, very faint, while the set is on."""
    t = np.arange(N) / SR
    x = 0.0011 * np.sin(2 * np.pi * 15625 * t)
    return np.stack([x, x * 0.9], axis=1) * tv_on[:, None]


def crackle(g, tear, r):
    """Tear crackle for one note: about 14 x tear crackles, each a fraction of a millisecond, level with tear."""
    out = np.zeros((SPN + 2000, 2))
    count = int(14 * tear + r.uniform())
    for _ in range(count):
        n = int(r.uniform(0.0002, 0.0015) * SR) + 2
        x = sosfilt(butter(2, 2200, btype='highpass', fs=SR, output='sos'), r.standard_normal(n)) * np.hanning(n)
        add(out, int(r.uniform(0, SPN)), pan(x * 0.06 * tear * r.uniform(0.3, 1.0), r.uniform(-0.25, 0.25)))
    return out


def spoon(g, r):
    """The teaspoon chattering in its saucer for one note: small metal impacts at about 20 a second."""
    out = np.zeros(SPN + 4000)
    t = r.uniform(0, 0.01)
    while t < SPN / SR:
        n = int(0.025 * SR)
        k = np.arange(n) / SR
        x = (np.sin(2 * np.pi * 3870 * k) * decay(n, 0.006) + 0.6 * np.sin(2 * np.pi * 6110 * k) * decay(n, 0.004)
             + 0.4 * np.sin(2 * np.pi * 8930 * k) * decay(n, 0.003))
        add(out, int(t * SR), x * 0.006 * r.uniform(0.4, 1.0))
        t += r.uniform(0.035, 0.065)
    return pan(out, -0.45)


# ---------------------------------------------------------------- voice
def load_voice(vdir):
    man = json.load(open(os.path.join(vdir, 'manifest.json')))
    by_text = {}
    for ln in man['lines']:
        path = os.path.join(vdir, ln['file'])
        data = open(path, 'rb').read()
        if hashlib.sha256(data).hexdigest() != ln['sha256']:
            raise SystemExit('frozen voice file changed: ' + ln['file'])
        x = read_wav(path)
        by_text[ln['text']] = (x if x.ndim == 1 else x.mean(axis=1), ln)
    return by_text


def peak_limit(x):
    """A look-ahead peak limiter, offline: the gain each sample needs to keep its 4x-oversampled peak under the
    ceiling, then a minimum over 4h+1 samples and a mean over 2h+1 (centred), which never lets the gain rise above
    what any sample needs. Mostly it does nothing; it only shaves the maker's consonants and the hardest plucks."""
    ceil = 10 ** (LIMIT_DBTP / 20)
    pk = np.abs(resample_poly(x, 4, 1, axis=0)).max(axis=1).reshape(-1, 4).max(axis=1)
    need = np.minimum(1.0, ceil / np.maximum(pk, 1e-12))
    h = int(LIMIT_HALF_S * SR)
    g = uniform_filter1d(minimum_filter1d(need, 4 * h + 1, mode='nearest'), 2 * h + 1, mode='nearest')
    g = np.minimum(g, 1.0)
    return x * g[:, None], g


# ---------------------------------------------------------------- build
def build(cues, programme, voice, sync_proof=False):
    events = []                         # every placed sound: (sample, layer, name) for the plots and the proofs
    # programme: the published stereo audio, mono for the speaker
    prog = np.zeros(N)
    pm = programme.mean(axis=1) if programme.ndim == 2 else programme
    prog[:min(N, len(pm))] = pm[:N]
    # the coda pad joins the programme before the compressor
    s_end = PROG_FRAMES * SPF
    n_fade = int(PAD_HOLD_FADE_S * SR)
    n_ring = int(RINGOUT_S * SR)
    n_decay = int(PAD_DECAY_S * SR)
    pad = held_pad(cues['bet'], s_end, n_fade, n_ring, n_decay)
    add(prog, s_end, pad)
    events += [(s_end, 'coda', 'pad held'), (s_end + n_ring, 'coda', 'pad decays'), (s_end + n_ring + n_decay, 'coda', 'pad silent')]
    gain, det_db, red = compressor_gain(prog)
    bed = prog * gain
    # voice
    vo = np.zeros(N)
    spans = []
    starts = [frame_sample(l['frame']) for l in cues['lines']]
    for j, ln in enumerate(cues['lines']):
        if ln['text'] not in voice:
            raise SystemExit('no frozen voice for line %s: %r' % (ln['id'], ln['text']))
        x = voice[ln['text']][0] * 10 ** (VOICE_DB / 20)
        s0 = starts[j]
        nxt = starts[j + 1] if j + 1 < len(starts) else N
        if s0 + len(x) > nxt:                       # a later line cuts it ("Goodnight." cuts anything playing)
            x = x[:max(0, nxt - s0)].copy()
            f = min(len(x), SR // 50)
            x[len(x) - f:] *= np.linspace(1, 0, f)
        add(vo, s0, x)
        spans.append((s0, s0 + len(x)))
        events.append((s0, 'voice', ln['id'] + ('-' + ln['variant'] if ln.get('variant') else '')))
    # bench foley
    fo = np.zeros(N)
    for g in range(NOTES):                       # the punch: every pick but REST (a pencil dot), level by its p
        if cues['pickKind'][g] != 'rest' and cues['p'][g] is not None:
            add(fo, note_start(g), punch(min(1.0, max(0.0, cues['p'][g])), rng(30, g)))
    for i, t in enumerate(cues['knobTurns']):    # the ratchet: on every knob turn, at the frame the knob starts to move
        add(fo, frame_sample(t['frame']), ratchet(rng(31, i)))
        events.append((frame_sample(t['frame']), 'foley', 'ratchet'))
    ch = cues['chalk']                           # the chalk tick, as long as the hand draws it
    add(fo, frame_sample(ch['frame']), chalk(ch['frames'], rng(32, 0)))
    events.append((frame_sample(ch['frame']), 'foley', 'chalk'))
    for i, f in enumerate(cues['taps']):
        add(fo, frame_sample(f), tap(rng(33, i)))
        events.append((frame_sample(f), 'foley', 'tap'))
    for b in range(PROG_FRAMES // FPB):          # the crank creaks once a turn while the programme runs
        add(fo, frame_sample(b * FPB + 12), creak(rng(34, b)))
    # through the speaker. The chain is linear, so each layer can go through it alone, and the dip under the voice
    # can be set from the programme as it is heard.
    voice_st = speaker_chain(vo)
    fo_st = speaker_chain(fo)
    dip_db = voice_dip(spans, voice_st, bed_level(speaker_chain(bed)))
    bed_st = speaker_chain(bed * 10 ** (-dip_db / 20))
    click_st = None
    if sync_proof:
        clicks = np.zeros(N)
        for b in range(FRAMES // FPB):
            clicks[frame_sample(b * FPB)] = 0.5
        click_st = speaker_chain(clicks)
    # room
    room = house_hum(cues['hum'])
    hum_check = None
    if cues.get('humLevelPerFrame'):             # cross-check against the engine's own per-frame hum level
        env = hum_env(cues['hum'])
        mine = env[np.arange(PROG_FRAMES) * SPF + SPF - 1]
        theirs = np.array(cues['humLevelPerFrame'], dtype=float)
        hum_check = round(float(np.abs(mine - theirs).max()), 4)
    for b in range(FRAMES // FPB):
        s0 = frame_sample(b * FPB)
        add(room, s0, pan(clock_tick(b), 0.05))
        events.append((s0, 'room', 'tick'))
    tv_on = np.ones(N)
    k = np.arange(n_decay)
    tv_on[s_end + n_ring:s_end + n_ring + n_decay] = 1 - k / n_decay
    tv_on[s_end + n_ring + n_decay:] = 0
    room += tube_whine(tv_on)
    for g in range(NOTES):
        if cues['tear'][g] > 0:
            add(room, note_start(g), crackle(g, cues['tear'][g], rng(40, g)))
        if cues['spoon'][g]:
            add(room, note_start(g), spoon(g, rng(41, g)))
            events.append((note_start(g), 'room', 'spoon'))
    mg = 10 ** (MASTER_GAIN_DB / 20)
    voice_m = voice_st * mg
    rest_m = (bed_st + fo_st + room) * mg
    out, lim = peak_limit(voice_m + rest_m)
    lines = []
    for ln, (a, b), (lv, lr, margin) in zip(cues['lines'], spans, line_margins(spans, voice_m * lim[:, None], rest_m * lim[:, None])):
        hold = dip_db[a:max(a + 1, b - int(DUCK_TAIL_S * SR))]
        lines.append({'id': ln['id'], 'text': ln['text'], 'frame': ln['frame'], 'seconds': round((b - a) / SR, 4),
                      'voiceLUFS': round(lv, 2), 'underItLUFS': round(lr, 2), 'marginLU': round(margin, 2),
                      'dip_dB': [round(float(hold.min()), 2), round(float(hold.max()), 2)]})
    if sync_proof:
        out = out + click_st * mg
    info = {'limiterMaxReduction_dB': round(float(-20 * np.log10(lim.min())), 2), 'humMaxDiffVsEngine': hum_check,
            'mixGain_dB': MASTER_GAIN_DB, 'lines': lines,
            'compressor': {'thresholdDb': COMP_THRESHOLD_DB, 'ratio': COMP_RATIO, 'maxReduction_dB': round(float(red.max()), 2)},
            'detector_dB_per_10ms': np.round(det_db, 2).tolist(), 'reduction_dB_per_10ms': np.round(red, 2).tolist(),
            'dip_dB_per_10ms': np.round(dip_db[:N // 480 * 480].reshape(-1, 480).max(axis=1), 2).tolist(),
            'stems': {'voice': voice_m, 'programme': bed_st * mg, 'foley': fo_st * mg, 'room': room * mg}}
    return out, sorted(events), info


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--ending', required=True, choices=sorted(PUBLISHED))
    ap.add_argument('--cues', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--programme', help='published programme WAV (48 kHz, sample 0 = 00:00)')
    ap.add_argument('--voice', help='frozen voice dir (with manifest.json)')
    ap.add_argument('--sync-proof', action='store_true', help='also put a click on every bar line through the speaker')
    ap.add_argument('--stems', action='store_true', help='also write the voice, programme, foley and room stems (before the limiter)')
    a = ap.parse_args()
    # inputs default to the film's work dir: QUIET_HOUR_WORK, else the folder two above the cue file (<work>/build/cues)
    work = os.environ.get('QUIET_HOUR_WORK') or os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(a.cues))))
    prog_path = a.programme or os.path.join(work, 'data-fable', 'audio', PUBLISHED[a.ending] + '.48k.wav')
    voice_dir = a.voice or os.path.join(work, 'build', 'voice', 'frozen')
    cues = load_cues(a.cues)
    programme = read_wav(prog_path)
    voice = load_voice(voice_dir)
    out, events, info = build(cues, programme, voice, a.sync_proof)
    if out.shape != (N, 2):
        raise SystemExit('length %s, expected %d x 2' % (out.shape, N))
    m = bs1770.measure(out)
    os.makedirs(a.out, exist_ok=True)
    stem = 'soundtrack-%s%s' % (a.ending, '-syncproof' if a.sync_proof else '')
    wav = os.path.join(a.out, stem + '.wav')
    write_wav24(wav, out, SR)
    sha = hashlib.sha256(open(wav, 'rb').read()).hexdigest()
    if a.stems:
        for k, v in info['stems'].items():
            write_wav24(os.path.join(a.out, '%s.stem-%s.wav' % (stem, k), ), v, SR)
    rep = {'ending': a.ending, 'cues': os.path.abspath(a.cues), 'programme': os.path.abspath(prog_path),
           'samples': int(out.shape[0]), 'sampleRate': SR, 'sha256': sha, 'loudness': {k: v for k, v in m.items() if k != 'shortTerm'},
           'caps': {'truePeak_dBTP': CAP_TP, 'shortTermMax_LUFS': CAP_ST, 'integratedRange_LUFS': INTEGRATED_RANGE},
           'mixGain_dB': info['mixGain_dB'], 'compressor': info['compressor'],
           'humMaxDiffVsEngine': info['humMaxDiffVsEngine'], 'limiterMaxReduction_dB': info['limiterMaxReduction_dB'],
           'voice': {'minMarginLU': VOICE_MARGIN_MIN_LU, 'about': 'per line: loudness of the voice alone, of everything else under it, '
                     'the difference, and the least and most the programme was dipped under it', 'lines': info['lines']},
           'events': [{'sample': s, 'frame': s / SPF, 'layer': l, 'what': w} for s, l, w in events]}
    json.dump(rep, open(os.path.join(a.out, stem + '.json'), 'w'), indent=1)
    json.dump({'shortTerm': m['shortTerm'], 'detector_dB_per_10ms': info['detector_dB_per_10ms'],
               'reduction_dB_per_10ms': info['reduction_dB_per_10ms'], 'dip_dB_per_10ms': info['dip_dB_per_10ms']},
              open(os.path.join(a.out, stem + '.curves.json'), 'w'))
    bad = []
    if m['truePeak_dBTP'] > CAP_TP:
        bad.append('true peak %.2f dBTP > %.1f' % (m['truePeak_dBTP'], CAP_TP))
    if m['shortTermMaxLUFS'] > CAP_ST:
        bad.append('short-term %.2f LUFS > %.1f (window ending %.1f s)' % (m['shortTermMaxLUFS'], CAP_ST, m['shortTermMaxEndsAt_s']))
    if not INTEGRATED_RANGE[0] <= m['integratedLUFS'] <= INTEGRATED_RANGE[1]:
        bad.append('integrated %.2f LUFS outside %s' % (m['integratedLUFS'], INTEGRATED_RANGE))
    low = [ln for ln in info['lines'] if ln['marginLU'] < VOICE_MARGIN_MIN_LU]
    if low:
        bad.append('voice under %.1f LU over what is under it: %s' % (VOICE_MARGIN_MIN_LU, ', '.join(
            '%s at frame %d (%.2f)' % (ln['id'], ln['frame'], ln['marginLU']) for ln in low)))
    print(json.dumps({'wav': wav, 'sha256': sha, **{k: v for k, v in m.items() if k != 'shortTerm'},
                      'voiceMarginMinLU': min(ln['marginLU'] for ln in info['lines']) if info['lines'] else None}))
    if bad:
        os.replace(wav, wav[:-4] + '.FAILED.wav')
        raise SystemExit('CHECK FAILED (kept as %s.FAILED.wav): %s' % (stem, '; '.join(bad)))


if __name__ == '__main__':
    main()
