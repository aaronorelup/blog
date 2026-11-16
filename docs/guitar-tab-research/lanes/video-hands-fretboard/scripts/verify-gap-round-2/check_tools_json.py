"""Check tools.json after gap round 2 (verify-gapfill, round 2).
Usage: python3 -I check_tools_json.py <tools.json> <baseline tools.json> <ledger runs.jsonl> <steps dir with *.steps.times.tsv>
- every runs[].run_id is null or a ledger id of this lane; prints exit code / wall / cores / peak against the ledger
  (group jobs: against the step's line in <group>.steps.times.tsv)
- lists tools added or removed and fields dropped since the baseline."""
import csv, glob, json, os, re, sys
cur = json.load(open(sys.argv[1])); base = json.load(open(sys.argv[2]))
led = {}
for l in open(sys.argv[3]):
    d = json.loads(l); led[d['id']] = d
steps = {}
for f in glob.glob(os.path.join(sys.argv[4], '*.steps.times.tsv')):
    grp = os.path.basename(f).split('.')[0]
    rows = list(csv.reader(open(f), delimiter='\t'))
    hdr = rows[0]
    for r in rows[1:]:
        rec = dict(zip(hdr, r))
        steps.setdefault((grp, rec.get('step') or rec.get('name') or r[0]), []).append(rec)
GROUP = {'C1': 'r0408', 'B1': 'r0448', 'V1': 'r0495', 'V2': 'r0497'}
bt = {t['name']: t for t in base['tools']}; ct = {t['name']: t for t in cur['tools']}
print('tools: baseline', len(bt), 'now', len(ct), '| added', sorted(set(ct) - set(bt)), '| removed', sorted(set(bt) - set(ct)))
for n in sorted(set(bt) & set(ct)):
    lost = set(bt[n]) - set(ct[n])
    if lost:
        print('FIELDS DROPPED', n, lost)
    if bt[n].get('tried') != ct[n].get('tried') or bt[n].get('tried_how') != ct[n].get('tried_how'):
        print('tried changed:', n, (bt[n].get('tried'), bt[n].get('tried_how')), '->', (ct[n].get('tried'), ct[n].get('tried_how')))
bad = 0; nruns = 0
for t in cur['tools']:
    for r in t.get('runs') or []:
        nruns += 1
        rid = r.get('run_id'); st = r.get('step')
        if rid is None:
            print('null run_id:', t['name'], '| step', st, '| note', (r.get('note') or '')[:120]); continue
        if not re.fullmatch(r'r\d{4}', str(rid)) or rid not in led:
            print('NOT A LEDGER ID:', t['name'], rid); bad += 1; continue
        L = led[rid]
        if L['lane'] != 'video-hands-fretboard':
            print('OTHER LANE:', t['name'], rid, L['lane'])
        if st:
            grp, sname = st.split('/', 1)
            if GROUP.get(grp) != rid:
                print('GROUP/RUN MISMATCH', t['name'], rid, st); bad += 1
            recs = steps.get((grp, sname))
            if not recs:
                print('STEP NOT IN times.tsv', t['name'], rid, st); bad += 1; continue
            rec = recs[-1]
            w = float(rec.get('wall_s') or rec.get('wall') or 'nan'); ex = int(rec.get('exit') or rec.get('exit_code') or -99)
            kb = float(rec.get('max_rss_kb') or 'nan')
            msg = []
            if r.get('exit_code') is not None and r['exit_code'] != ex:
                if not any(int(x.get('exit') or x.get('exit_code') or -99) == r['exit_code'] for x in recs):
                    msg.append('exit %s vs tsv %s' % (r['exit_code'], ex))
            if r.get('wall_s') is not None and all(abs(r['wall_s'] - float(x.get('wall_s') or x.get('wall') or 'nan')) > 0.06 for x in recs):
                msg.append('wall %s vs tsv %s' % (r['wall_s'], [x.get('wall_s') or x.get('wall') for x in recs]))
            if r.get('peak_mb') is not None:
                cands = [float(x.get('max_rss_kb')) / 1024 for x in recs] + [float(x.get('max_rss_kb')) / 1000 for x in recs]
                if all(abs(r['peak_mb'] - c) > 0.11 for c in cands):
                    msg.append('peak %s vs tsv MiB %s' % (r['peak_mb'], [round(c, 1) for c in cands]))
            if msg:
                print('STEP VALUES', t['name'], rid, st, msg); bad += 1
        else:
            msg = []
            if r.get('exit_code') is not None and r['exit_code'] != L['exit_code']:
                msg.append('exit %s vs ledger %s' % (r['exit_code'], L['exit_code']))
            if r.get('wall_s') is not None and abs(r['wall_s'] - L['wall_s']) > 0.06:
                msg.append('wall %s vs ledger %s' % (r['wall_s'], L['wall_s']))
            if r.get('peak_mb') is not None and abs(r['peak_mb'] - L['max_rss_mb']) > 0.11:
                msg.append('peak %s vs ledger %s' % (r['peak_mb'], L['max_rss_mb']))
            lc = L.get('n_cores')
            if r.get('cores') not in (lc, None) and not (lc is None and r.get('cores') in ('nolock', 'unpinned', 0)):
                msg.append('cores %s vs ledger %s' % (r.get('cores'), lc))
            if msg:
                print('RUN VALUES', t['name'], rid, msg); bad += 1
print('runs checked', nruns, 'problems', bad)
