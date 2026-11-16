#!/usr/bin/env python3
"""Measure the second window (everything after the first measurement ended), write costs/agent-metrics-window2.json,
   the cost keys of post/_fills.json, and the second-window section of costs/COSTS.md.
   python3 cost_fill.py [--until ISO]"""
import json, subprocess, sys, os, datetime
SP = os.path.dirname(os.path.abspath(__file__))
DOCS = '/home/user/blog/docs/guitar-tab-research'
W1_END = '2026-11-11T01:26:31.433Z'
S2_START = datetime.datetime(2026, 11, 12, 3, 45, tzinfo=datetime.timezone.utc)
PRICE = {  # per million tokens: input, write 5 min, write 1 h, cache read, output
    'claude-opus-5-5': (4, 5, 8, 0.20, 20), 'claude-sonnet-5-5': (2, 2.5, 4, 0.10, 10), 'claude-fable-5-2': (8, 10, 16, 0.20, 40)}
NAME = {'claude-opus-5-5': 'Claude Opus 5.5', 'claude-sonnet-5-5': 'Claude Sonnet 5.5', 'claude-fable-5-2': 'Claude Fable 5.2'}
SHORT = {'claude-opus-5-5': 'opus-5-5', 'claude-sonnet-5-5': 'sonnet-5-5', 'claude-fable-5-2': 'fable-5-2'}
args = ['node', os.path.expanduser('~/.claude/skills/agent-metrics/scripts/measure-agents.mjs'), '--json', '--since', W1_END]
if '--until' in sys.argv: args += ['--until', sys.argv[sys.argv.index('--until') + 1]]
raw = subprocess.run(args, cwd='/home/user/blog', capture_output=True, text=True, check=True).stdout
w2 = json.loads(raw)
open(f'{DOCS}/costs/agent-metrics-window2.json', 'w').write(json.dumps(w2, indent=1))
w1 = json.load(open(f'{DOCS}/costs/agent-metrics.json'))
def cost(by):
    lo = hi = 0.0; parts = {}
    for m, v in by.items():
        pi, w5, w60, cr, po = PRICE[m]
        base = v['input'] * pi / 1e6 + v['cacheRead'] * cr / 1e6 + v['output'] * po / 1e6
        l, h = base + v['cacheCreate'] * w5 / 1e6, base + v['cacheCreate'] * w60 / 1e6
        parts[m] = (v['cacheRead'] * cr / 1e6, v['output'] * po / 1e6, v['cacheCreate'] * w5 / 1e6, v['cacheCreate'] * w60 / 1e6, l, h)
        lo += l; hi += h
    return lo, hi, parts
b1, b2 = w1['window']['byModel'], w2['window']['byModel']
lo1, hi1, p1 = cost(b1); lo2, hi2, p2 = cost(b2)
a1 = {r['model']: r['agents'] for r in w1['bill']['perModel']}
aall = {r['model']: r['agents'] for r in w2['bill']['perModel']}      # the bill is cumulative for the session
a2 = {m: aall.get(SHORT[m], 0) - a1.get(SHORT[m], 0) for m in PRICE}
a2['claude-fable-5-2'] = 0                                           # the same directing agent
n2 = sum(a2.values())
tot = lambda k: sum(v[k] for v in b1.values()) + sum(v[k] for v in b2.values())
until = datetime.datetime.fromisoformat(w2['window']['until'].replace('Z', '+00:00'))
hours = (until - S2_START).total_seconds() / 3600
r10 = lambda x: '$' + format(int(round(x / 10.0) * 10), ',')
rows = []
for m in ('claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-2'):
    v = b2.get(m)
    if not v: continue
    agents = str(a2[m]) if m != 'claude-fable-5-2' else 'the same 1'
    rows.append(f"| Second | {NAME[m]} | {agents} | {v['output']:,} | {v['cacheRead']:,} | {v['cacheCreate']:,} |")
fills_path = f'{SP}/post/_fills.json'
fills = json.load(open(fills_path)) if os.path.exists(fills_path) else {}
half = round(hours * 2) / 2
fills.update({
    'ALL_AGENTS': str(139 + n2), 'S2_AGENTS': str(n2),
    'S2_HOURS': {2.0:'two',2.5:'two and a half',3.0:'three',3.5:'three and a half',4.0:'four',4.5:'four and a half',5.0:'five',5.5:'five and a half',6.0:'six'}.get(half, f'{hours:.1f}'),
    'ALL_OUTPUT_M': f"{tot('output') / 1e6:.1f}", 'ALL_CACHE_B': f"{tot('cacheRead') / 1e9:.1f}",
    'ALL_LOW': r10(lo1 + lo2), 'ALL_HIGH': r10(hi1 + hi2), 'S2_LOW': r10(lo2), 'S2_HIGH': r10(hi2),
    'ALL_INPUT': f"{tot('input'):,}", 'S2_ROWS': '\n'.join(rows)})
json.dump(fills, open(fills_path, 'w'), indent=1)
print('window 2:', w2['window']['since'], '->', w2['window']['until'], 'files', w2['window']['files'], 'messages', w2['window']['messages'])
print('second-sitting sub-agents', n2, a2, 'hours since 03:45 UTC', round(hours, 2))
print(f'window 1 ${lo1:,.2f} to ${hi1:,.2f} | window 2 ${lo2:,.2f} to ${hi2:,.2f} | all ${lo1+lo2:,.2f} to ${hi1+hi2:,.2f}')
for k in ('ALL_AGENTS','S2_AGENTS','S2_HOURS','ALL_OUTPUT_M','ALL_CACHE_B','ALL_LOW','ALL_HIGH','S2_LOW','S2_HIGH','ALL_INPUT'): print(' ', k, '=', fills[k])
print(fills['S2_ROWS'])
# COSTS.md: replace or append the second-window section
cp = f'{DOCS}/costs/COSTS.md'; c = open(cp, encoding='utf-8').read()
MARK = '\n## The second sitting\n'
c = c.split(MARK)[0].rstrip('\n') + '\n'
sec = [MARK.strip('\n'), '',
 f"Measured the same way for everything after the first window: {w2['window']['since']} to {w2['window']['until']}",
 f"(raw output: [`agent-metrics-window2.json`](agent-metrics-window2.json)). The window holds the orchestrator's last stretch of the",
 f"first sitting (assembling and publishing the post, to about 01:50 UTC on 2026-11-11) and the whole second sitting, which",
 f"began at about 03:45 UTC on 2026-11-12. {n2} more agents ran in it ({a2['claude-opus-5-5']} on Opus 5.5, {a2['claude-sonnet-5-5']} on Sonnet 5.5), directed by the same Fable 5.2",
 f"orchestrator. {w2['window']['messages']:,} assistant messages in {w2['window']['files']} transcripts.", '',
 '| Model | More agents | Output tokens | Cache reads | Cache writes | Uncached input |', '|---|---|---|---|---|---|']
for m in ('claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-2'):
    v = b2.get(m)
    if v: sec.append(f"| {NAME[m]} | {a2[m] if m != 'claude-fable-5-2' else '0 (the same orchestrator)'} | {v['output']:,} | {v['cacheRead']:,} | {v['cacheCreate']:,} | {v['input']:,} |")
t2 = {k: sum(v[k] for v in b2.values()) for k in ('output', 'cacheRead', 'cacheCreate', 'input')}
sec += [f"| Total | {n2} | {t2['output']:,} | {t2['cacheRead']:,} | {t2['cacheCreate']:,} | {t2['input']:,} |", '',
 'At the same list prices:', '', '| Model | Cache reads | Output | Cache writes (5 min to 1 h price) | Total |', '|---|---|---|---|---|']
for m in ('claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-2'):
    if m in p2:
        cr, po, wl, wh, l, h = p2[m]
        sec.append(f"| {NAME[m].replace('Claude ', '')} | ${cr:,.2f} | ${po:,.2f} | ${wl:,.2f} to ${wh:,.2f} | ${l:,.2f} to ${h:,.2f} |")
sec += [f"| All | | | | ${lo2:,.0f} to ${hi2:,.0f} |", '',
 f"Both windows together: {139 + n2} agents, {tot('output'):,} output tokens, {tot('cacheRead'):,} cache-read tokens,",
 f"{tot('cacheCreate'):,} cache-write tokens, {tot('input'):,} uncached input tokens: ${lo1 + lo2:,.0f} to ${hi1 + hi2:,.0f} at API list prices.",
 'Uncached input is included in each total at the input price. Like the first sitting, this ran on the Claude subscription and',
 'was not billed this way.', '']
open(cp, 'w', encoding='utf-8').write(c + '\n' + '\n'.join(sec))
