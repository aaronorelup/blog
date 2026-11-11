"""Verifier (round 2): run a command and sample /proc for its whole process tree every 0.25 s.
usage: python3 thread_probe.py <out.json> -- <command...>
Per thread: name, Cpus_allowed_list (all values seen), the CPUs it last ran on (stat field 39, all values seen), its
CPU time (utime + stime, last sample). Started under gtr-run, it runs inside the job's slot like the command."""
import json, os, subprocess, sys, time
out = sys.argv[1]; cmd = sys.argv[sys.argv.index('--') + 1:]
TICK = os.sysconf('SC_CLK_TCK')
def rd(p):
    try: return open(p).read()
    except OSError: return None
def stat(txt):
    r = txt[txt.rindex(')') + 2:].split(' ')
    return {'ppid': int(r[1]), 'cpu': (int(r[11]) + int(r[12])) / TICK, 'processor': int(r[36])}
def tree(root):
    kids = {}
    for d in os.listdir('/proc'):
        if d.isdigit():
            t = rd(f'/proc/{d}/stat')
            if t: kids.setdefault(stat(t)['ppid'], []).append(int(d))
    out, q = [root], [root]
    while q:
        for c in kids.get(q.pop(), []): out.append(c); q.append(c)
    return out
p = subprocess.Popen(cmd); t0 = time.time(); th = {}; n = 0
while p.poll() is None:
    for pid in tree(p.pid):
        try: tids = os.listdir(f'/proc/{pid}/task')
        except OSError: continue
        for tid in tids:
            s = rd(f'/proc/{pid}/task/{tid}/stat'); st = rd(f'/proc/{pid}/task/{tid}/status')
            if not s or not st: continue
            s = stat(s); allowed = [l.split(':', 1)[1].strip() for l in st.splitlines() if l.startswith('Cpus_allowed_list')][0]
            k = f'{pid}/{tid}'
            e = th.setdefault(k, {'pid': pid, 'tid': int(tid), 'name': (rd(f'/proc/{pid}/task/{tid}/comm') or '').strip(), 'allowed': set(), 'processors': set(), 'first_s': round(time.time() - t0, 2)})
            e['allowed'].add(allowed); e['processors'].add(s['processor']); e['cpu_s'] = s['cpu']; e['last_s'] = round(time.time() - t0, 2)
    n += 1; time.sleep(0.25)
rc = p.wait()
res = {'cmd': cmd, 'exit_code': rc, 'wall_s': round(time.time() - t0, 2), 'samples': n, 'probe_cpus_allowed': rd('/proc/self/status').split('Cpus_allowed_list:')[1].split()[0],
       'threads': sorted(({**e, 'allowed': sorted(e['allowed']), 'processors': sorted(e['processors'])} for e in th.values()), key=lambda e: -e.get('cpu_s', 0))}
by = {}
for e in res['threads']: by[','.join(e['allowed'])] = round(by.get(','.join(e['allowed']), 0) + e.get('cpu_s', 0), 2)
res['cpu_s_by_allowed_list'] = by
json.dump(res, open(out, 'w'), indent=1)
print(json.dumps({'exit_code': rc, 'cpu_s_by_allowed_list': by, 'n_threads': len(res['threads'])}))
sys.exit(rc)
