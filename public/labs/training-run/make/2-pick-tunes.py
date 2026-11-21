"""Step 2. Keep the major-key tunes that fit the grid, move them all to D, drop repeats, and hold some out.

    python 2-pick-tunes.py out/raw_tunes.json out/tunes.json

The held-out tunes are drawn only from tunes with no near twin: less than a quarter of a tune's 8-note windows may
turn up in any one other tune. ../tunes.json is this file's output without the titles."""
import json, sys, random, collections
HOLD, REST = -1, -2
raw = json.load(open(sys.argv[1]))
SEED = 2000            # 20:00
TARGET_PC = 2          # everything is moved to D major
TARGET_MEAN = 71.0
ok = [r for r in raw if 'tokens' in r]
stats = dict(parsed=len(ok), six_eight_total=len(raw))
ok = [r for r in ok if r['mode'] == 'major']
stats['major'] = len(ok)
ok = [r for r in ok if r['offgrid'] <= 0.10 * max(1, r['onsets'])]
stats['on_grid'] = len(ok)
ok = [r for r in ok if 72 <= len(r['tokens']) <= 288]
stats['length_ok'] = len(ok)
for r in ok:
    pit = [t for t in r['tokens'] if t >= 0]
    base = (TARGET_PC - r['tonic']) % 12
    mean = sum(pit) / len(pit)
    best = min((base + 12 * k for k in (-2, -1, 0, 1)), key=lambda s: abs(mean + s - TARGET_MEAN))
    r['shift'] = best
    r['norm'] = [t + best if t >= 0 else t for t in r['tokens']]
hist = collections.Counter(t for r in ok for t in r['norm'] if t >= 0)
tot = sum(hist.values())
LO, HI = 57, 86          # A3 .. D6 after transposing
kept = []
for r in ok:
    pit = [t for t in r['norm'] if t >= 0]
    if min(pit) >= LO and max(pit) <= HI:
        kept.append(r)
stats['in_range'] = len(kept)
ok = kept
# exact duplicates (same notes after transposing)
seen = {}
uniq = []
for r in ok:
    k = tuple(r['norm'])
    if k in seen:
        continue
    seen[k] = 1
    uniq.append(r)
stats['unique'] = len(uniq)
ok = uniq
# near-duplicates: share of a tune's 8-note windows that also occur in one other tune
def grams(seq, n=8):
    return set(tuple(seq[i:i + n]) for i in range(len(seq) - n + 1))
G = [grams(r['norm']) for r in ok]
maxov = []
for i, gi in enumerate(G):
    m = 0.0
    for j, gj in enumerate(G):
        if i != j:
            o = len(gi & gj) / len(gi)
            if o > m:
                m = o
    maxov.append(m)
for r, m in zip(ok, maxov):
    r['max_overlap'] = round(m, 4)
clean = [i for i, m in enumerate(maxov) if m < 0.25]
stats['no_near_twin'] = len(clean)
rng = random.Random(SEED)
rng.shuffle(clean)
n_held = round(0.1 * len(ok))
held_idx = set(clean[:n_held])
P = HI - LO + 1
def enc(t):
    return t - LO if t >= 0 else (P if t == HOLD else P + 1)
def pack(r, i):
    return dict(id=i, title=r['title'], source=r['source'], key=r['keyfield'], shift=r['shift'], q0=r['q0'],
                max_overlap=r['max_overlap'], tokens=[enc(t) for t in r['norm']])
train = [pack(r, i) for i, r in enumerate(ok) if i not in held_idx]
held = [pack(r, i) for i, r in enumerate(ok) if i in held_idx]
stats.update(train=len(train), held=len(held), train_tokens=sum(len(t['tokens']) for t in train),
             held_tokens=sum(len(t['tokens']) for t in held))
out = dict(seed=SEED, lo=LO, hi=HI, P=P, HOLD=P, REST=P + 1, PAD=P + 2, stats=stats, train=train, held=held)
json.dump(out, open(sys.argv[2], 'w'))
print(json.dumps(stats))
print('pitch histogram (share %):', {k: round(100 * v / tot, 2) for k, v in sorted(hist.items())})
print('held-out max overlap with any other tune: max', max(t['max_overlap'] for t in held))
ov = sorted(maxov)
print('overlap quantiles all tunes', [round(ov[int(len(ov) * q)], 2) for q in (0.25, 0.5, 0.75, 0.9, 0.99)])
print('by source train', collections.Counter(t['source'] for t in train), 'held', collections.Counter(t['source'] for t in held))
print('shift counts', collections.Counter(r['shift'] for r in ok).most_common())
