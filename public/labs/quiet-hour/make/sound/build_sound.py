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
    a broadcast mix would), the maker's voice, the bench foley (punch ticks, ratchet, chalk, dial taps, crank creak)
    and, in the coda, the last bet held as a pad.
  Room bus, stereo, not through the speaker: house hum (follows the cue's hum flag), a wall-clock tick on every bar
    line, a faint tube whine, tear crackle, spoon chatter.
Mix: one fixed master gain, the same for every ending, and an offline peak limiter at -1.5 dBTP.

The voice must be heard: under every line the programme dips (DUCK_DB at least, deeper for a line whose bed is loud)
until the line's K-weighted loudness is VOICE_TARGET_LU above the programme under it; the build then measures every
line against the whole bed under it (programme, foley, room) and FAILS if any is under VOICE_MIN_LU.
The bench must be heard: every ratchet click, chalk stroke, dial tap and every punch tick of a pick with p >= 0.5 is
measured in its own band against everything else in that band at that moment, and raised (up to FOLEY_MAX_BOOST_DB)
until it is FOLEY_TARGET_DB above it; the build FAILS if one is still masked.

The first 60 s (frames 0 to 1439, samples 0 to 2,879,999) come out bit-identical in every ending whose cues and
programme agree there, because nothing in the chain looks ahead across a bar line: the filters are causal, the room
response is convolved one bar at a time, and the limiter decides each bar from that bar and what came before.

The build FAILS (and renames its output .FAILED.wav) if true peak is above -1 dBTP, short-term loudness is above -13
LUFS anywhere, integrated loudness is outside -18 to -15 LUFS, a line or a bench sound is masked, or the length is
not 4,800,000 samples.
numpy and scipy only. Every random number is drawn from a generator seeded by (SEED, layer, index).
"""
import argparse
import hashlib
import json
import os
import sys

import numpy as np
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, sosfilt, resample_poly

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
DUCK_DB = 9.0              # the programme dips at least this much under the maker's voice, as a broadcast mix would
DUCK_MAX_DB = 30.0
DUCK_PREROLL_S = 0.06      # the dip starts this long before the line's first sound (the line is placed by a cue)
DUCK_ATTACK_S = 0.04
DUCK_RELEASE_S = 0.5
VOICE_TARGET_LU = 6.0      # each line's dip is deepened until the line is this far above the programme under it,
                           # both K-weighted (LU) and in the speech band (dB)
VOICE_MIN_LU = 4.0         # ... and the build fails if a line ends up less than this above the whole bed under it
SPEECH_BAND = (300.0, 3400.0)   # a small speaker's speech band, for the second (reported) margin
FOLEY_TARGET_DB = 3.0      # a bench sound must be this far above everything else in its band, in its window
FOLEY_MAX_BOOST_DB = 22.0
PUNCH_CHECK_P = 0.5        # punch ticks are levelled by p by design; the ones with p >= this must be heard
# per bench sound: the band it is heard in (after the speaker's 5.5 kHz low-pass) and its window
# (window None = the whole sound; clicks are judged by their strongest 3 ms in it, the chalk scrape over all of it)
FOLEY_BANDS = {'punch': ((3000, 5400), 0.006), 'ratchet': ((2500, 5400), None), 'chalk': ((1500, 5400), None),
               'tap': ((2500, 5400), 0.03)}
BAR = FPB * SPF            # 60,000 samples: the room response and the limiter work one bar at a time
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
        'stepChanged': [bool(v) for v in col('stepChanged')],
        'hum': [bool(v) for v in col('humOn')],
        'tear': [float(v) if num(v) else 0.0 for v in col('tear')],
        'spoon': [bool(v) for v in col('spoonChatter')],
        'humLevelPerFrame': c.get('perFrame', {}).get('humLevel'),
    }
    cues['lines'] = sorted(({'id': l['id'], 'variant': l.get('variant'), 'text': l['text'], 'frame': int(l['frame'])}
                            for l in c['lines']), key=lambda l: l['frame'])
    cues['knobTurns'] = [{'frame': int(t['frame']), 'frames': int(t['frames']), 'note': int(t['note'])} for t in c['knobTurns']]
    cues['taps'] = sorted(int(f) for t in c['dialTaps'] if t.get('performed') for f in t['contacts'])
    cues['chalk'] = {'frame': int(c['chalk']['frame']), 'frames': int(c['chalk']['frames']),
                     'tickFrames': int(c['chalk'].get('tickFrames', c['chalk']['frames']))}
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


def duck_gain(spans, depths):
    """The programme's own mix dips under the presenter, as a broadcast mix would: from DUCK_PREROLL_S before each
    line's first sample to its last, by that line's depth (dB), with attack and release smoothing on 10 ms blocks.
    Keyed only by where the cues placed the lines."""
    blk = SR // 100
    m = N // blk
    tgt = np.zeros(m)
    pre = int(DUCK_PREROLL_S * SR)
    for (s0, s1), d in zip(spans, depths):
        a, b = max(0, (s0 - pre) // blk), min(m, -(-s1 // blk))
        tgt[a:b] = np.maximum(tgt[a:b], d)
    a_at = np.exp(-1 / (DUCK_ATTACK_S * 100))
    a_re = np.exp(-1 / (DUCK_RELEASE_S * 100))
    sm = np.empty(m)
    st = 0.0
    for i in range(m):
        a = a_at if tgt[i] > st else a_re
        st = a * st + (1 - a) * tgt[i]
        sm[i] = st
    g_db = np.interp(np.arange(N), np.arange(m) * blk + blk / 2, -sm)
    return 10 ** (g_db / 20)


# ---------------------------------------------------------------- measuring what is heard
def kpower_blocks(st, a, b, hop=SR // 10):
    """K-weighted power (summed over channels) of stereo st[a:b] in blocks of `hop` samples."""
    z = bs1770.kweight(st[a:b])
    m = (b - a) // hop
    return (z[:m * hop] ** 2).sum(axis=1).reshape(m, hop).mean(axis=1)


def band_power_blocks(st, a, b, lo, hi, hop=SR // 10):
    x = st[a:b].mean(axis=1) if st.ndim == 2 else st[a:b]
    y = sosfilt(butter(4, [lo, hi], btype='bandpass', fs=SR, output='sos'), x)
    m = (b - a) // hop
    return (y[:m * hop] ** 2).reshape(m, hop).mean(axis=1)


def line_margin(voice_st, bed_st, s0, s1):
    """How far a line stands above the bed under it: the K-weighted loudness of the voice over its spoken 100 ms
    blocks (within 20 dB of its loudest block), minus the bed's over the same blocks (LU). Also the same in the
    small speaker's speech band (dB). Both measured on what leaves the speaker, before the limiter."""
    pre = int(0.1 * SR)                     # start a little early so a short line has whole blocks
    a = max(0, s0 - pre // 2)
    b = min(N, max(s1, a + 3 * pre))
    pv = kpower_blocks(voice_st, a, b)
    pb = kpower_blocks(bed_st, a, b)
    on = pv > pv.max() / 100
    lu = 10 * np.log10(pv[on].sum() / max(pb[on].sum(), 1e-30))
    sv = band_power_blocks(voice_st, a, b, *SPEECH_BAND)
    sb = band_power_blocks(bed_st, a, b, *SPEECH_BAND)
    son = sv > sv.max() / 100
    sp = 10 * np.log10(sv[son].sum() / max(sb[son].sum(), 1e-30))
    return float(lu), float(sp), int(on.sum())


def event_margin(ev_mono, bed_mono, s, n, lo, hi, click):
    """A bench sound against everything else, in its own band (dB). A scrape (click=False) is measured over its whole
    window. A click is heard by its peak against what is there at that instant, so for a click each 3 ms on one of its
    clicks (within 6 dB of its strongest) is compared with the bed in the same 3 ms, and the clearest one counts: a
    ratchet is heard if one of its three clicks is."""
    a = max(0, s - 1000)
    b = min(N, s + n + 1000)
    sos = butter(4, [lo, hi], btype='bandpass', fs=SR, output='sos')
    e = sosfilt(sos, ev_mono[a:b])[s - a:s - a + n]
    d = sosfilt(sos, bed_mono[a:b])[s - a:s - a + n]
    if click:
        w = int(0.003 * SR)
        ce = np.concatenate([[0.0], np.cumsum(e * e)])
        cd = np.concatenate([[0.0], np.cumsum(d * d)])
        k = np.arange(0, max(1, n - w + 1), 24)
        ee = ce[k + w] - ce[k]
        dd = np.maximum(cd[k + w] - cd[k], 1e-30)
        at = ee >= ee.max() / 4                  # the 3 ms windows on one of its clicks (within 6 dB of the strongest)
        return float(10 * np.log10((ee[at] / dd[at]).max()))
    return float(10 * np.log10((e * e).sum() / max((d * d).sum(), 1e-30)))


# ---------------------------------------------------------------- the speaker chain
def speaker_chain(mono):
    """The TV: band-limit (160 Hz to 5.5 kHz), a little presence, a cabinet resonance, then a short cabinet-and-room
    response that turns the mono speaker into a stereo room sound. Linear and causal, so it adds no delay at its
    direct path (verified by the sync proof)."""
    sos = np.vstack([butter(4, 160, btype='highpass', fs=SR, output='sos'),
                     butter(4, 5500, btype='lowpass', fs=SR, output='sos'),
                     peaking(2800, 3.0, 0.9), peaking(190, 2.5, 1.4), peaking(900, -1.5, 1.2)])
    y = sosfilt(sos, mono)
    return block_convolve(y, room_ir())


def block_convolve(y, ir):
    """Convolution by overlap-add, one bar (60,000 samples) of input per FFT. Each block's FFT sees only its own bar,
    so the output up to any bar line depends only on the input up to it (one FFT over the whole film would round
    differently whenever anything later differs)."""
    L = len(ir)
    nfft = 1 << int(np.ceil(np.log2(BAR + L - 1)))
    H = np.fft.rfft(ir, nfft, axis=0)
    out = np.zeros((len(y) + L - 1, ir.shape[1]))
    for k in range(0, len(y), BAR):
        seg = y[k:k + BAR]
        Y = np.fft.irfft(np.fft.rfft(seg, nfft)[:, None] * H, nfft, axis=0)[:len(seg) + L - 1]
        out[k:k + len(seg) + L - 1] += Y
    return out[:len(y)]


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
    """The brass punch: a sharp click high in the speaker's band (3 to 5.4 kHz, where a music-box pluck has least of
    its own attack) and a small thunk, level by the pick's probability."""
    n = int(0.03 * SR)
    click = band(r.standard_normal(n), 3000, 5400) * decay(n, 0.0008)
    th = np.sin(2 * np.pi * 420 * np.arange(n) / SR) * decay(n, 0.006)
    return (0.30 * click + 0.045 * th) * p


def ratchet(frames, r):
    """The knob's ratchet while it turns: three pawl clicks spread through the turn (the cue says how many frames it
    takes), the first a sixth of the way in, so the clicks fall between the punch at the note's start and the next
    note; each a little softer."""
    span = frames * SPF
    n = span + int(0.02 * SR)
    out = np.zeros(n)
    for j, a in enumerate((1.0, 0.85, 0.7)):
        m = int(0.012 * SR)
        k = band(r.standard_normal(m), 2500, 7000) * decay(m, 0.0012)
        k += 0.4 * np.sin(2 * np.pi * (1900 + 120 * j) * np.arange(m) / SR) * decay(m, 0.003)
        add(out, int((2 * j + 1) * span / 6), a * k)
    return out * 0.05


def chalk(frames, tick_frames, r):
    """Chalk as long as the cue says: the tick, one firm stroke over its frames, then the number written beside it,
    lighter and in short grains, over the rest. Bright scraping noise."""
    n = frames * SPF
    x = band(r.standard_normal(n), 1500, 6500, 2)
    grain = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 37 * np.arange(n) / SR + r.uniform(0, 6.28)))
    k = max(1, min(frames, tick_frames)) * SPF
    env = np.zeros(n)
    env[:k] = np.sin(np.pi * np.arange(k) / k) ** 0.5
    if n > k:
        env[k:] = 0.35 * np.sin(np.pi * np.arange(n - k) / (n - k)) ** 0.7 * grain[k:]
    return x * env * 0.035


def tap(r):
    """A fingertip on the dial glass: a short knock and two small glass modes, bright, above the music box's own
    fundamentals."""
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 3170 * t) * decay(n, 0.007) + 0.6 * np.sin(2 * np.pi * 4630 * t) * decay(n, 0.004)
         + 0.8 * band(r.standard_normal(n), 1200, 5000) * decay(n, 0.0015))
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
    h = int(LIMIT_HALF_S * SR)
    ctx = 8 * h                              # it remembers the end of the bar before; it never looks past the bar line
    out = np.empty_like(x)
    gmin, steps = 1.0, []
    prev = 1.0
    for s in range(0, len(x), BAR):
        a, e = max(0, s - ctx), min(len(x), s + BAR)
        seg = x[a:e]
        pk = np.abs(resample_poly(seg, 4, 1, axis=0)).max(axis=1).reshape(-1, 4).max(axis=1)
        need = np.minimum(1.0, ceil / np.maximum(pk, 1e-12))
        g = uniform_filter1d(minimum_filter1d(need, 4 * h + 1, mode='nearest'), 2 * h + 1, mode='nearest')
        g = np.minimum(g, 1.0)[s - a:]
        out[s:e] = x[s:e] * g[:, None]
        gmin = min(gmin, float(g.min()))
        if s and abs(g[0] - prev) > 1e-9:
            steps.append((s, round(float(20 * np.log10(g[0] / prev)), 3)))
        prev = g[-1]
    return out, float(20 * np.log10(gmin)), steps


# ---------------------------------------------------------------- build
def place_voice(cues, voice):
    """Every line at its cue's first sample; a later line cuts one still playing ("Goodnight." cuts anything)."""
    vo = np.zeros(N)
    spans, events = [], []
    starts = [frame_sample(l['frame']) for l in cues['lines']]
    for j, ln in enumerate(cues['lines']):
        if ln['text'] not in voice:
            raise SystemExit('no frozen voice for line %s: %r' % (ln['id'], ln['text']))
        x = voice[ln['text']][0] * 10 ** (VOICE_DB / 20)
        s0 = starts[j]
        nxt = starts[j + 1] if j + 1 < len(starts) else N
        if s0 + len(x) > nxt:
            x = x[:max(0, nxt - s0)].copy()
            f = min(len(x), SR // 50)
            x[len(x) - f:] *= np.linspace(1, 0, f)
        add(vo, s0, x)
        spans.append((s0, min(N, s0 + len(x))))
        events.append((s0, 'voice', ln['id'] + ('-' + ln['variant'] if ln.get('variant') else '')))
    return vo, spans, events


def foley_instances(cues):
    """Every bench sound the cues place: (category, sample, signal, window samples, p or None)."""
    inst = []
    for g in range(NOTES):                       # the punch: every pick but REST (a pencil dot), level by its p
        if cues['pickKind'][g] != 'rest' and cues['p'][g] is not None:
            p = min(1.0, max(0.0, cues['p'][g]))
            inst.append(('punch', note_start(g), punch(p, rng(30, g)), p))
    turned = set()
    for i, t in enumerate(cues['knobTurns']):    # the ratchet: on every knob turn, at the frame the knob starts to move
        inst.append(('ratchet', frame_sample(t['frame']), ratchet(t['frames'], rng(31, i)), None))
        turned.add(t['note'])
    for g in range(NOTES):                       # a step change the engine gave no knob turn of its own (should not happen)
        if cues['stepChanged'][g] and g not in turned and g + 1 not in turned:
            inst.append(('ratchet', note_start(g), ratchet(3, rng(31, 1000 + g)), None))
    ch = cues['chalk']
    inst.append(('chalk', frame_sample(ch['frame']), chalk(ch['frames'], ch['tickFrames'], rng(32, 0)), None))
    for i, f in enumerate(cues['taps']):
        inst.append(('tap', frame_sample(f), tap(rng(33, i)), None))
    for b in range(PROG_FRAMES // FPB):          # the crank creaks once a turn while the programme runs
        inst.append(('creak', frame_sample(b * FPB + 12), creak(rng(34, b)), None))
    return inst


def foley_stems(inst, gains):
    stems = {k: np.zeros(N) for k in ('punch', 'ratchet', 'chalk', 'tap', 'creak')}
    for i, (k, s, x, _) in enumerate(inst):
        add(stems[k], s, x * gains[i])
    return stems


def build(cues, programme, voice, sync_proof=False):
    events = []                         # every placed sound: (sample, layer, name) for the plots and the proofs
    mg = 10 ** (MASTER_GAIN_DB / 20)
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
    tv = prog * gain
    # the voice, and the programme's chain output before any dip (the chain is linear: the dip is applied after it,
    # which is the same as before it to within the room response's 0.4 s; it is re-chained once the depths are known)
    vo, spans, ev = place_voice(cues, voice)
    events += ev
    vo_st = speaker_chain(vo) * mg
    # room (not through the speaker)
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
    room = room * mg
    # 1. the dip under each line: deepened until the line is VOICE_TARGET_LU above the programme under it. Decided
    #    from the programme alone (not the foley or room), so a line's depth depends only on the music under it.
    depths = [DUCK_DB] * len(spans)
    prog_st0 = speaker_chain(tv) * mg            # the dip moves slowly against the room's 0.4 s, so for choosing the
    for it in range(6):                          # depths it is applied after the chain; the mix re-chains exactly
        prog_st = prog_st0 * duck_gain(spans, depths)[:, None]
        short = False
        for j, (s0, s1) in enumerate(spans):
            lu, sp, _ = line_margin(vo_st, prog_st, s0, s1)
            worst = min(lu, sp)
            if worst < VOICE_TARGET_LU and depths[j] < DUCK_MAX_DB:
                depths[j] = min(DUCK_MAX_DB, depths[j] + np.ceil((VOICE_TARGET_LU - worst + 0.25) * 2) / 2)
                short = True
        if not short:
            break
    duck = duck_gain(spans, depths)
    # 2. bench foley, each kind on its own stem through the speaker; every check is in its own band and window
    inst = foley_instances(cues)
    fgain = [1.0] * len(inst)
    tv_only = speaker_chain(tv * duck) * mg
    foley_log = []
    f_st, dirty = {}, set(['punch', 'ratchet', 'chalk', 'tap', 'creak'])
    for it in range(7):
        adjust = it < 6                          # the last pass only measures
        stems = foley_stems(inst, fgain)
        for k in sorted(dirty):
            f_st[k] = speaker_chain(stems[k]) * mg
        dirty = set()
        total = tv_only + vo_st + room + sum(f_st.values())
        tot_m = total.mean(axis=1)
        mono = {k: v.mean(axis=1) for k, v in f_st.items()}
        changed = False
        foley_log = []
        for i, (kind, s, x, p) in enumerate(inst):
            if kind not in FOLEY_BANDS:
                continue
            (lo, hi), win = FOLEY_BANDS[kind]
            n = len(x) if win is None else int(win * SR)
            n = min(n, N - s)
            # this instance alone (the chain is linear and causal: its stem contribution is the stem's within the
            # window minus any other instance of the same kind, which never overlap within a window)
            mine = mono[kind]
            m = event_margin(mine, tot_m - mine, s, n, lo, hi, kind != 'chalk')
            must = kind != 'punch' or (p is not None and p >= PUNCH_CHECK_P)
            if must and adjust and m < FOLEY_TARGET_DB and fgain[i] < 10 ** (FOLEY_MAX_BOOST_DB / 20):
                up = 10 ** ((FOLEY_TARGET_DB - m + 0.5) / 20)
                fgain[i] = min(10 ** (FOLEY_MAX_BOOST_DB / 20), fgain[i] * up)
                changed = True
                dirty.add(kind)
            foley_log.append({'kind': kind, 'sample': s, 'frame': s / SPF, 'p': p, 'checked': must,
                              'marginDb': round(m, 2), 'boostDb': round(20 * np.log10(fgain[i]), 2)})
        if not changed:
            break
    fo_st = sum(f_st.values())
    for i, (kind, s, x, p) in enumerate(inst):
        if kind in ('ratchet', 'chalk', 'tap'):
            events.append((s, 'foley', kind))
    # 3. the mix: one master gain (already applied to every stem), then the limiter
    mix = tv_only + vo_st + fo_st + room
    out, limit_db, steps = peak_limit(mix)
    clicks = np.zeros(N)
    if sync_proof:
        for b in range(FRAMES // FPB):
            clicks[frame_sample(b * FPB)] = 0.5
        out = out + speaker_chain(clicks) * mg
    # 4. what is heard: every line against everything else under it
    bed = tv_only + fo_st + room
    margins = []
    for j, (s0, s1) in enumerate(spans):
        ln = cues['lines'][j]
        lu, sp, nb = line_margin(vo_st, bed, s0, s1)
        lu_p, _, _ = line_margin(vo_st, tv_only, s0, s1)
        margins.append({'id': ln['id'], 'text': ln['text'], 'frame': ln['frame'], 'sample': s0, 'playedSamples': s1 - s0,
                        'duckDb': depths[j], 'marginLU': round(lu, 2), 'marginOverProgrammeLU': round(lu_p, 2),
                        'speechBandMarginDb': round(sp, 2), 'blocks': nb})
    info = {'limiterMaxReduction_dB': round(-limit_db, 2), 'limiterBarSteps_dB': steps, 'humMaxDiffVsEngine': hum_check,
            'mixGain_dB': round(MASTER_GAIN_DB, 3),
            'compressor': {'thresholdDb': COMP_THRESHOLD_DB, 'ratio': COMP_RATIO, 'maxReduction_dB': round(float(red.max()), 2)},
            'detector_dB_per_10ms': np.round(det_db, 2).tolist(), 'reduction_dB_per_10ms': np.round(red, 2).tolist(),
            'voiceMargins': margins, 'foley': foley_log,
            'stems': {'programme': tv_only, 'voice': vo_st, 'foley': fo_st, 'room': room}}
    return out, sorted(events), info


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--ending', required=True, choices=sorted(PUBLISHED))
    ap.add_argument('--cues', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--programme', help='published programme WAV (48 kHz, sample 0 = 00:00)')
    ap.add_argument('--voice', help='frozen voice dir (with manifest.json)')
    ap.add_argument('--sync-proof', action='store_true', help='also put a click on every bar line through the speaker')
    ap.add_argument('--stems', action='store_true', help='also write the TV and room stems')
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
           'limiterBarSteps_dB': info['limiterBarSteps_dB'],
           'voiceMargins': info['voiceMargins'], 'voiceMinLU': VOICE_MIN_LU,
           'foley': info['foley'], 'foleyTargetDb': FOLEY_TARGET_DB,
           'events': [{'sample': s, 'frame': s / SPF, 'layer': l, 'what': w} for s, l, w in events]}
    json.dump(rep, open(os.path.join(a.out, stem + '.json'), 'w'), indent=1)
    json.dump({'shortTerm': m['shortTerm'], 'detector_dB_per_10ms': info['detector_dB_per_10ms'],
               'reduction_dB_per_10ms': info['reduction_dB_per_10ms']}, open(os.path.join(a.out, stem + '.curves.json'), 'w'))
    bad = []
    if m['truePeak_dBTP'] > CAP_TP:
        bad.append('true peak %.2f dBTP > %.1f' % (m['truePeak_dBTP'], CAP_TP))
    if m['shortTermMaxLUFS'] > CAP_ST:
        bad.append('short-term %.2f LUFS > %.1f (window ending %.1f s)' % (m['shortTermMaxLUFS'], CAP_ST, m['shortTermMaxEndsAt_s']))
    if not INTEGRATED_RANGE[0] <= m['integratedLUFS'] <= INTEGRATED_RANGE[1]:
        bad.append('integrated %.2f LUFS outside %s' % (m['integratedLUFS'], INTEGRATED_RANGE))
    for v in info['voiceMargins']:
        if min(v['marginLU'], v['speechBandMarginDb']) < VOICE_MIN_LU:
            bad.append('line %s at frame %d only %.2f LU (%.2f dB in the speech band) above its bed' % (
                v['id'], v['frame'], v['marginLU'], v['speechBandMarginDb']))
    for f in info['foley']:
        if f['checked'] and f['marginDb'] < FOLEY_TARGET_DB - 0.05:
            bad.append('%s at frame %.1f masked (%.2f dB in band)' % (f['kind'], f['frame'], f['marginDb']))
    print(json.dumps({'wav': wav, 'sha256': sha, **{k: v for k, v in m.items() if k != 'shortTerm'}}))
    if bad:
        os.replace(wav, wav[:-4] + '.FAILED.wav')
        raise SystemExit('BUILD CHECK BROKEN (kept as %s.FAILED.wav): %s' % (stem, '; '.join(bad)))


if __name__ == '__main__':
    main()
