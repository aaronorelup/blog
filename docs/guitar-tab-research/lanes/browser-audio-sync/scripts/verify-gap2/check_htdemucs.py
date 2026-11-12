"""Independent recomputation of the htdemucs_6s numbers in trials.md "Gap round 2" (verifier, round 2)."""
import hashlib, json, os, sys
import numpy as np
import soundfile as sf

OUT = '/home/user/gtr/lanes/browser-audio-sync/out'
IN = '/home/user/gtr/lanes/browser-audio-sync/inputs/S4_10s'
ST = ['drums', 'bass', 'other', 'vocals', 'guitar', 'piano']
res = {}

def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()

# 1. hashes against stems_sha256.txt
listed = {}
for line in open('/home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/samples/htdemucs-6s-onnx-web/stems_sha256.txt'):
    h, p = line.split(None, 1); listed[p.strip()] = h
res['sha_mismatch'] = [p for p, h in listed.items() if sha(p) != h]
res['sha_checked'] = len(listed)

def rd(p):
    a, sr = sf.read(p, dtype='float32', always_2d=True); return a, sr

web = lambda t, s: f'{OUT}/htdemucs6s-web/S4_10s_{t}_optdisabled_{s}.wav'
# 2. identity of t1/t4 vs t2 (decoded samples)
ident = {}
for s in ST:
    a2, _ = rd(web('t2', s))
    for t in ('t1', 't4'):
        a, _ = rd(web(t, s)); ident[f'{t}_{s}'] = bool(a.shape == a2.shape and np.array_equal(a, a2))
res['identical_to_t2'] = ident
# 3. format, peak, RMS (both channels), sum of stems minus mix
mix, sr = sf.read(f'{IN}/S4_10s.wav', dtype='float32', always_2d=True)
info = {}
tot = np.zeros_like(mix, dtype=np.float64)
for s in ST:
    a, sra = rd(web('t2', s)); i = sf.info(web('t2', s))
    tot += a.astype(np.float64)
    info[s] = {'frames': a.shape[0], 'ch': a.shape[1], 'sr': sra, 'subtype': i.subtype, 'peak': round(float(np.max(np.abs(a))), 4),
               'rms_dbfs': round(float(10 * np.log10(np.mean(a.astype(np.float64) ** 2))), 2)}
res['stems_t2'] = info
res['sum_minus_mix_db_soundfile_mix'] = round(float(10 * np.log10(np.sum((tot - mix) ** 2) / np.sum(mix.astype(np.float64) ** 2))), 2)
dec, _ = rd(f'{OUT}/htdemucs6s-web/S4_10s_decoded_by_chromium.wav')
res['sum_minus_mix_db_chromium_mix'] = round(float(10 * np.log10(np.sum((tot - dec) ** 2) / np.sum(dec.astype(np.float64) ** 2))), 3)
# 4. projection of the true guitar (mono, <est,ref>/<ref,ref>)
g, _ = sf.read(f'{IN}/stems/guitar.wav', dtype='float64', always_2d=True); g = g.mean(1); gg = float(g @ g)
def proj(path):
    e, _ = sf.read(path, dtype='float64', always_2d=True); e = e.mean(1); return round(float(e @ g) / gg, 4)
res['proj_browser'] = {s: proj(web('t2', s)) for s in ST}
res['proj_native'] = {s: proj(f'{OUT}/htdemucs6s-native/{s}.wav') for s in ST}
res['proj_demucsweb'] = {s: proj(f'{OUT}/demucs/t2/S4_10s_{s}.wav') for s in ['drums', 'bass', 'other', 'vocals']}
for k in ('proj_browser', 'proj_native', 'proj_demucsweb'): res[k]['sum'] = round(sum(v for kk, v in res[k].items() if kk != 'sum'), 4)
# 5. parity table: 10 log10(sum (a-b)^2 / sum b^2), max |a-b|
def cmp(pa, pb):
    a, _ = rd(pa); b, _ = rd(pb); d = a.astype(np.float64) - b.astype(np.float64)
    e = float(np.sum(d ** 2)); r = float(np.sum(b.astype(np.float64) ** 2))
    return (round(10 * np.log10(e / r), 1) if e > 0 else 'identical', float(f'{np.max(np.abs(d)):.2g}'))
nat = lambda d, s: f'{OUT}/{d}/{s}.wav'
rows = {
  'browser_vs_native_all_r0596': lambda s: cmp(web('t2', s), nat('htdemucs6s-native', s)),
  'browser_vs_native_disabled_r0603': lambda s: cmp(web('t2', s), nat('htdemucs6s-native-optdisabled', s)),
  'browser_vs_native_disabled_chromiuminput_r0611': lambda s: cmp(web('t2', s), nat('htdemucs6s-native-chromiuminput-optdisabled', s)),
  'native_chromiuminput_r0611_vs_soundfile_r0603': lambda s: cmp(nat('htdemucs6s-native-chromiuminput-optdisabled', s), nat('htdemucs6s-native-optdisabled', s)),
  'native_disabled_r0603_vs_all_r0596': lambda s: cmp(nat('htdemucs6s-native-optdisabled', s), nat('htdemucs6s-native', s)),
}
res['parity'] = {k: {s: f(s) for s in ST} for k, f in rows.items()}
# 6. decode rule: Chromium's floats vs the 16-bit integers
i16, _ = sf.read(f'{IN}/S4_10s.wav', dtype='int16', always_2d=True)
x = i16.astype(np.int64)
rule = np.where(x < 0, (x.astype(np.float64) / 32768.0).astype(np.float32), (x.astype(np.float32) * np.float32(1 / 32767)).astype(np.float32))
res['decode'] = {'n': int(x.size), 'n_differ_from_rule': int(np.count_nonzero(rule != dec)),
                 'n_positive': int(np.count_nonzero(x > 0)), 'n_zero': int(np.count_nonzero(x == 0)), 'n_negative': int(np.count_nonzero(x < 0)),
                 'n_differ_from_div32768': int(np.count_nonzero((x / 32768.0).astype(np.float32) != dec)),
                 'soundfile_float32_equals_div32768': bool(np.array_equal(mix, (x / 32768.0).astype(np.float32))),
                 'dec_format': [sf.info(f'{OUT}/htdemucs6s-web/S4_10s_decoded_by_chromium.wav').subtype, dec.shape]}
pos = x > 0
res['decode']['ratio_pos_median'] = float(np.median(dec[pos].astype(np.float64) / mix[pos].astype(np.float64)))
res['decode']['32768/32767'] = 32768 / 32767
# 7. the S4_10s cut and input facts
res['input'] = {'frames': mix.shape[0], 'ch': mix.shape[1], 'sr': sr, 'sum_sq_chromium': float(np.sum(dec.astype(np.float64) ** 2)), 'peak_chromium': float(np.max(np.abs(dec)))}
print(json.dumps(res, indent=1))
