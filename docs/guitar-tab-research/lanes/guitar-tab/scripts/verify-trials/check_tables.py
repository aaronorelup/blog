#!/usr/bin/env python3
"""Compare every number in the markdown tables of trials.md that carry gtr-eval ids with the result
stored for that id in the eval ledger. Verifier script (verify-trials-guitar-tab).
Usage: check_tables.py <trials.md>
Prints one line per mismatch, and a count of the cells checked."""
import json, re, sys

led = {}
for line in open('/home/user/gtr/eval/ledger/evals.jsonl'):
    d = json.loads(line)
    led[d['id']] = d['result']


def f4(x):
    return f"{x:.4f}"


def sdc(r):
    c = r['metrics'].get('string_difference_counts', {})
    return {int(k): v for k, v in c.items()}


def parse_sdc(cell):
    out = {}
    for k, v in re.findall(r'([-+]?\d+):\s*(\d+)', cell):
        out[int(k)] = int(v)
    return out


lines = open(sys.argv[1]).read().splitlines()
checked = 0
problems = []
i = 0
while i < len(lines):
    if lines[i].startswith('|') and i + 1 < len(lines) and re.match(r'^\|[-| ]+\|$', lines[i + 1]):
        header = [h.strip() for h in lines[i].strip('|').split('|')]
        j = i + 2
        while j < len(lines) and lines[j].startswith('|'):
            cells = [c.strip() for c in lines[j].strip('|').split('|')]
            row = dict(zip(header, cells))
            # which column holds the tab/notes eval ids
            idcol = next((h for h in header if h in ('eval id', 'tab eval id')), None)
            if idcol is None:
                j += 1
                continue
            ids = re.findall(r'e\d{4}', row[idcol])
            if not ids:
                j += 1
                continue

            def parts(h):
                v = row.get(h)
                if v is None:
                    return None
                v = v.replace(' each', '')
                ps = [p.strip() for p in re.split(r'\s/\s', v)]
                if len(ps) == 1:
                    ps = ps * len(ids)
                return ps

            for k, eid in enumerate(ids):
                r = led[eid]
                c = r['counts']
                m = r['metrics']
                for h in header:
                    p = parts(h)
                    if p is None or k >= len(p):
                        continue
                    val = p[k]
                    hl = h.lower()
                    exp = None
                    if hl in ('truth notes', 'truth'):
                        exp = str(c['n_truth'])
                        got = re.match(r'\d+', val).group(0) if re.match(r'\d+', val) else val
                    elif hl in ('est notes', 'tab notes written', 'tab notes out', 'out'):
                        exp = str(c['n_est'])
                        got = val
                    elif hl.startswith('matched'):
                        exp = str(c['n_matched'])
                        got = val
                    elif hl == 'same string+fret / matched':
                        exp = f4(m['same_string_and_fret_fraction_of_matched'])
                        got = val.split(' ')[0]
                        mm = re.search(r'\((.*?)([0-9.]+)\)', val)
                        if mm:
                            label, num = mm.group(1), mm.group(2)
                            if 'nut' in label:
                                e2 = f4(m['same_string_and_absolute_fret_fraction_of_matched'])
                            else:
                                e2 = f4(m['same_string_fraction_of_matched'])
                            checked += 1
                            if e2 != num:
                                problems.append(f"line {j+1} {eid} [{h} paren '{label.strip()}'] text {num} ledger {e2}")
                    elif hl == 'same string / matched':
                        exp = f4(m['same_string_fraction_of_matched'])
                        got = val
                    elif hl == 'same string+fret / truth':
                        exp = f4(m['same_string_and_fret_fraction_of_truth'])
                        got = val
                    elif hl.startswith('string diff counts'):
                        if 'identical' in val:
                            continue
                        checked += 1
                        if parse_sdc(val) != sdc(r):
                            problems.append(f"line {j+1} {eid} [string diffs] text {parse_sdc(val)} ledger {sdc(r)}")
                        continue
                    elif hl.startswith('notes eval id'):
                        mm = re.match(r'(e\d{4}):\s*([0-9.]+)\s*\(([0-9.]+)\s*/\s*([0-9.]+)\)', row[h])
                        if mm and k == 0:
                            nr = led[mm.group(1)]['metrics']['onset_only']
                            for lab, t, e in (('F1', mm.group(2), f4(nr['f1'])), ('P', mm.group(3), f4(nr['precision'])), ('R', mm.group(4), f4(nr['recall']))):
                                checked += 1
                                if t != e:
                                    problems.append(f"line {j+1} {mm.group(1)} [notes {lab}] text {t} ledger {e}")
                        continue
                    elif hl.startswith('tab-frames eval id'):
                        mm = re.match(r'(e\d{4})[^:]*:\s*([0-9.]+),\s*([0-9.]+)', row[h])
                        if mm and k == 0:
                            fr = led[mm.group(1)]['metrics']
                            for lab, t, e in (('tab F1', mm.group(2), f4(fr['tab_f1'])), ('pitch F1', mm.group(3), f4(fr['pitch_f1']))):
                                checked += 1
                                if t != e:
                                    problems.append(f"line {j+1} {mm.group(1)} [frames {lab}] text {t} ledger {e}")
                        continue
                    else:
                        continue
                    checked += 1
                    if got != exp:
                        problems.append(f"line {j+1} {eid} [{h}] text '{got}' ledger '{exp}'")
            j += 1
        i = j
    else:
        i += 1
print('cells checked', checked)
for p in problems:
    print(p)
print('mismatches', len(problems))
