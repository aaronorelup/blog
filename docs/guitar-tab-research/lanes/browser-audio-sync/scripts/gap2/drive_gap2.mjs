// Playwright driver for the gap-round-2 pages (based on ../drive.mjs), with a /proc sampler.
// Usage: node drive_gap2.mjs <page path+query> <result.json> [--timeout s] [--port p] [--arg <chromium flag>]...
//        [--sample-ms 500]
// - Opens the page in the pre-installed headless Chromium (Playwright 1.63.0), waits for window.__done, saves
//   window.__result. Requests to hosts other than 127.0.0.1 are aborted and listed (no cache in this round).
// - Every --sample-ms ms it reads /proc for every process descended from this node process (Chromium's browser,
//   zygote, renderer, GPU and utility processes): per process the --type, VmRSS, VmHWM (the kernel's peak RSS of that
//   process), thread count, Cpus_allowed_list and utime+stime; for renderer processes also every thread's name
//   (comm), utime+stime, the CPU it last ran on (field 39 of /proc/<pid>/task/<tid>/stat) and its Cpus_allowed_list.
//   The sampler runs in this node process, i.e. inside the same CPU slot as Chromium when started under gtr-run.
// - The page may print "PHASE <name> <epoch ms>" with console.log. For every pair <x>_start / <x>_end the result gives
//   each process's CPU seconds between them (cumulative CPU linearly interpolated between samples) and CPU / wall.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const args = process.argv.slice(2);
const pagePath = args[0], outFile = args[1];
let timeout = 900, port = 18766, sampleMs = 500; const extra = [];
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--timeout') timeout = Number(args[++i]);
  else if (args[i] === '--arg') extra.push(args[++i]);
  else if (args[i] === '--port') port = Number(args[++i]);
  else if (args[i] === '--sample-ms') sampleMs = Number(args[++i]);
}
const TICK = Number(execSync('getconf CLK_TCK').toString().trim()) || 100;
const rd = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };
const statusField = (txt, key) => { const m = txt && new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(txt); return m ? m[1].trim() : null; };
function parseStat(txt) {   // fields after the ')' that closes comm; index k-3 holds field k of proc(5)
  if (!txt) return null;
  const r = txt.slice(txt.lastIndexOf(')') + 2).split(' ');
  return { ppid: Number(r[1]), utime: Number(r[11]), stime: Number(r[12]), threads: Number(r[17]), processor: Number(r[36]) };
}
function descendants(root) {
  const kids = new Map();
  for (const d of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(d)) continue;
    const s = parseStat(rd(`/proc/${d}/stat`)); if (!s) continue;
    if (!kids.has(s.ppid)) kids.set(s.ppid, []);
    kids.get(s.ppid).push(Number(d));
  }
  const out = []; const q = [root];
  while (q.length) { const p = q.shift(); for (const c of kids.get(p) || []) { out.push(c); q.push(c); } }
  return out;
}
const procs = new Map();      // pid -> {type, first_ms, last_ms, series: [[ms, cpu_ticks, rss_kb]], hwm_kb, max_threads, allowed:Set}
const threads = new Map();    // "pid/tid" -> {pid, tid, name, ticks, processors:Set, allowed:Set}
let nSamples = 0, sampleCostMs = 0;
function sample() {
  const t0 = Date.now();
  for (const pid of descendants(process.pid)) {
    const st = parseStat(rd(`/proc/${pid}/stat`)); const status = rd(`/proc/${pid}/status`);
    if (!st || !status) continue;
    let p = procs.get(pid);
    if (!p) {
      let cmd = (rd(`/proc/${pid}/cmdline`) || '').split('\0').filter((a) => a);
      if (cmd.length === 1) cmd = cmd[0].split(' ');   // Chromium rewrites its argv into one space-separated string
      const ty = (cmd.find((a) => a.startsWith('--type=')) || '').slice(7) || (cmd[0].includes('chrom') || cmd[0].includes('headless') ? 'browser' : path.basename(cmd[0] || '?'));
      const util = (cmd.find((a) => a.startsWith('--utility-sub-type=')) || '').slice(19);
      p = { pid, type: util ? `${ty}:${util}` : ty, exe: path.basename(cmd[0] || ''), first_ms: t0, series: [], hwm_kb: 0, max_threads: 0, allowed: new Set() };
      procs.set(pid, p);
    }
    const rss = Number((statusField(status, 'VmRSS') || '0').split(' ')[0]);
    const hwm = Number((statusField(status, 'VmHWM') || '0').split(' ')[0]);
    p.last_ms = t0; p.series.push([t0, st.utime + st.stime, rss]);
    p.hwm_kb = Math.max(p.hwm_kb, hwm); p.max_threads = Math.max(p.max_threads, st.threads);
    p.allowed.add(statusField(status, 'Cpus_allowed_list'));
    if (p.type === 'renderer') {
      let tids = []; try { tids = fs.readdirSync(`/proc/${pid}/task`); } catch { /* gone */ }
      for (const tid of tids) {
        const ts = parseStat(rd(`/proc/${pid}/task/${tid}/stat`)); if (!ts) continue;
        const key = `${pid}/${tid}`;
        let th = threads.get(key);
        if (!th) { th = { pid, tid: Number(tid), name: (rd(`/proc/${pid}/task/${tid}/comm`) || '').trim(), ticks: 0, processors: new Set(), allowed: new Set(), first_ms: t0 }; threads.set(key, th); }
        th.ticks = ts.utime + ts.stime; th.processors.add(ts.processor); th.last_ms = t0;
        th.allowed.add(statusField(rd(`/proc/${pid}/task/${tid}/status`), 'Cpus_allowed_list'));
      }
    }
  }
  nSamples++; sampleCostMs += Date.now() - t0;
}
function cpuAt(series, ms) {   // cumulative CPU ticks at time ms, linear between samples
  if (!series.length || ms <= series[0][0]) return series.length ? series[0][1] : 0;
  for (let i = 1; i < series.length; i++) {
    if (series[i][0] >= ms) { const [a, ca] = series[i - 1], [b, cb] = series[i]; return ca + (cb - ca) * (ms - a) / (b - a || 1); }
  }
  return series[series.length - 1][1];
}

const consoleLines = []; const external = []; const phases = [];
const t0 = Date.now();
const timer = setInterval(sample, sampleMs);
const launchArgs = ['--autoplay-policy=no-user-gesture-required', ...extra];
const browser = await chromium.launch({ headless: true, args: launchArgs });
const version = browser.version();
const context = await browser.newContext();
const page = await context.newPage();
page.on('console', (m) => {
  const txt = m.text(); consoleLines.push(`[${((Date.now() - t0) / 1000).toFixed(3)}] ${m.type()}: ${txt}`);
  const ph = /^PHASE (\S+) ([\d.]+)$/.exec(txt); if (ph) phases.push({ name: ph[1], epoch_ms: Number(ph[2]) });
});
page.on('pageerror', (e) => consoleLines.push(`[${((Date.now() - t0) / 1000).toFixed(3)}] pageerror: ${e.message}`));
await context.route('**/*', async (route) => {
  const u = route.request().url();
  if (u.startsWith(`http://127.0.0.1:${port}/`) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
  external.push({ url: u, aborted: true });
  return route.abort();
});
let result = null, status = 'ok';
try {
  await page.goto(`http://127.0.0.1:${port}${pagePath}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__done === true, null, { timeout: timeout * 1000, polling: 500 });
  result = await page.evaluate(() => window.__result);
} catch (e) {
  status = 'driver error: ' + String(e.message || e).split('\n')[0];
  try { result = await page.evaluate(() => window.__result || window.__partial || null); } catch (e2) { /* page gone */ }
}
sample();
clearInterval(timer);
const wall = (Date.now() - t0) / 1000;
await browser.close();

// summaries
const procOut = [...procs.values()].map((p) => ({
  pid: p.pid, type: p.type, exe: p.exe, seen_s: [(p.first_ms - t0) / 1000, (p.last_ms - t0) / 1000],
  cpu_s: (p.series[p.series.length - 1][1] - p.series[0][1]) / TICK, cpu_s_total_at_last_sample: p.series[p.series.length - 1][1] / TICK,
  max_rss_mb_sampled: Math.max(...p.series.map((s) => s[2])) / 1024, vmhwm_mb: p.hwm_kb / 1024, max_threads: p.max_threads,
  cpus_allowed_list: [...p.allowed],
}));
const phaseOut = [];
for (const s of phases.filter((x) => x.name.endsWith('_start'))) {
  const base = s.name.slice(0, -6); const e = phases.find((x) => x.name === `${base}_end` && x.epoch_ms >= s.epoch_ms);
  if (!e) continue;
  const w = (e.epoch_ms - s.epoch_ms) / 1000;
  const per = [...procs.values()].map((p) => ({ pid: p.pid, type: p.type, cpu_s: (cpuAt(p.series, e.epoch_ms) - cpuAt(p.series, s.epoch_ms)) / TICK }))
    .filter((x) => x.cpu_s > 0.005);
  const tot = per.reduce((a, b) => a + b.cpu_s, 0);
  const ren = per.filter((x) => x.type === 'renderer').reduce((a, b) => a + b.cpu_s, 0);
  phaseOut.push({ phase: base, wall_s: w, cpu_s_all_processes: tot, cpu_per_wall_all: tot / w, cpu_s_renderer: ren, cpu_per_wall_renderer: ren / w, per_process: per });
}
const thrOut = [...threads.values()].filter((t) => t.ticks > 0).sort((a, b) => b.ticks - a.ticks).map((t) => ({
  pid: t.pid, tid: t.tid, name: t.name, cpu_s: t.ticks / TICK, processors_seen: [...t.processors].sort(), cpus_allowed_list: [...t.allowed],
}));
const out = {
  page: pagePath, status, browser_version: version, launch_args: launchArgs, driver_wall_s: wall,
  driver_cpus_allowed_list: statusField(rd('/proc/self/status'), 'Cpus_allowed_list'), clk_tck: TICK,
  sampler: { interval_ms: sampleMs, samples: nSamples, mean_sample_cost_ms: nSamples ? sampleCostMs / nSamples : null },
  external_requests: external, phases, phase_cpu: phaseOut, processes: procOut, renderer_threads: thrOut,
  processors_seen_by_renderer_threads: [...new Set(thrOut.flatMap((t) => t.processors_seen))].sort(),
  result,
};
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
fs.writeFileSync(outFile + '.console.txt', consoleLines.join('\n') + '\n');
console.log(`${status} wall=${wall.toFixed(1)}s -> ${outFile}`);
process.exit(status === 'ok' ? 0 : 1);
