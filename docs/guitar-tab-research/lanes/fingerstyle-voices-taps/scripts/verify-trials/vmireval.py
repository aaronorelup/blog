# Verifier: independent recomputation of one metric per tool with mir_eval directly (not through gtr-eval).
import json, csv, warnings, numpy as np, soundfile as sf, mir_eval
warnings.filterwarnings('ignore')
L = '/home/user/gtr/lanes/fingerstyle-voices-taps/out/'; S = '/home/user/gtr/lanes/source-separation/out/'; I = '/home/user/gtr/inputs/'
def mono(p):
    y, sr = sf.read(p, always_2d=True); return y.mean(axis=1), sr
def sisdr(est, ref):
    est = est - est.mean(); ref = ref - ref.mean(); a = np.dot(est, ref) / np.dot(ref, ref); t = a * ref
    return 10 * np.log10(np.sum(t ** 2) / np.sum((est - t) ** 2))
ref, _ = mono(I + 'S6taps/stems/taps.wav')
for name, p in [('HPSS m4 percussive (e0033 3.68)', L + 'librosa-hpss/S6taps/m4/percussive.wav'),
                ('libnmfd KAM percussive (e0622 -1.95)', L + 'libnmfd/S6taps/kam_percussive.wav'),
                ('NMF oracle k16 taps (e1138 4.10)', L + 'librosa-nmf/S6taps/nmf_k16_oracle_taps.wav')]:
    e, _ = mono(p); n = min(len(e), len(ref)); print(name, 'SI-SDR %.2f' % sisdr(e[:n], ref[:n]))
e, _ = mono(S + 'htdemucs_6s/S6taps/drums.wav'); n = min(len(e), len(ref))
sdr, sir, sar, _ = mir_eval.separation.bss_eval_sources(ref[None, :n], e[None, :n], compute_permutation=False)
print('htdemucs_6s drums vs taps (e0170 SI 6.98, SDR 10.87): SI-SDR %.2f SDR %.2f' % (sisdr(e[:n], ref[:n]), sdr[0]))
T = json.load(open(I + 'S2n/S2n.truth.json'))
def hz(m): return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)
ri = np.array([[n['onset'], n['offset']] for n in T['notes']]); rp = hz([n['pitch'] for n in T['notes']])
rows = list(csv.reader(open(L + 'basic-pitch/S2n.mono_basic_pitch.csv')))[1:]
ei = np.array([[float(r[0]), float(r[1])] for r in rows]); ep = hz([float(r[2]) for r in rows])
P, R, F, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, ep, onset_tolerance=0.05, pitch_tolerance=50, offset_ratio=None)
print('Basic Pitch S2n notes (e0734 0.657/1.000/0.793): %.3f/%.3f/%.3f' % (P, R, F))
bass = [n for n in T['notes'] if n['voice'] == 'bass']
bi = np.array([[n['onset'], n['offset']] for n in bass]); bp = hz([n['pitch'] for n in bass])
rows = list(csv.reader(open(L + 'voice-split/S2n_basicpitch/B1_threshold_T55.bass.csv')))[1:]
ei = np.array([[float(r[0]), float(r[1])] for r in rows]); ep = hz([float(r[2]) for r in rows])
P, R, F, _ = mir_eval.transcription.precision_recall_f1_overlap(bi, bp, ei, ep, onset_tolerance=0.05, pitch_tolerance=50, offset_ratio=None)
print('B1 T55 bass-labelled vs truth bass, S2n (e0744 0.727/1.000/0.842): %.3f/%.3f/%.3f' % (P, R, F))
def ref_f0(clip, voice):
    t = json.load(open(I + f'{clip}/{clip}.truth.json')); grid = np.arange(0, t['duration_s'], 0.01); f = np.zeros_like(grid)
    for n in sorted([n for n in t['notes'] if n['voice'] == voice], key=lambda n: n['onset']):
        f[(grid >= n['onset']) & (grid < n['offset'])] = hz(n['pitch'])
    return grid, f
def est_f0(p):
    r = list(csv.reader(open(p)))[1:]; return np.array([float(x[0]) for x in r]), np.array([float(x[1]) for x in r])
for clip, voice, p, claim in [('S2s', 'melody', L + 'essentia-melodia/S2s.melodia0.csv', 'e0487 RPA 0.796'),
                               ('S2n', 'bass', L + 'bass-lowpass-pyin/S2n/f0_150_0.csv', 'e0564 RPA 0.800')]:
    rt, rf = ref_f0(clip, voice); et, ef = est_f0(p)
    m = mir_eval.melody.evaluate(rt, rf, et, ef)
    print(f'{clip} {voice} f0 ({claim}): voicing recall %.3f RPA %.3f RCA %.3f' % (m['Voicing Recall'], m['Raw Pitch Accuracy'], m['Raw Chroma Accuracy']))
R1 = json.load(open(I + 'R1c/R1c.truth.json')); on = sorted(n['onset'] for n in R1['notes']); g = []
for t in on:
    if g and t - g[-1] <= 0.001: continue
    g.append(t)
est = np.loadtxt(L + 'R1c-onsets/madmom_CNNOnsetDetector.txt')
F, P, R = mir_eval.onset.f_measure(np.array(g), est, window=0.05)
print('R1c madmom CNN vs %d onset groups (e1281 0.732/0.511/0.602): %.3f/%.3f/%.3f' % (len(g), P, R, F))
