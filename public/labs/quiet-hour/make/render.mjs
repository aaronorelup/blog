#!/usr/bin/env node
// Render THE QUIET HOUR frame by frame in headless Chromium (software WebGL), exactly.
//
//   node make/render.mjs --ending main --from 0 --to 2159 --width 1280 --height 720 --shards 3 --out <dir>
//   node make/render.mjs join --in <dir> --audio <48k.wav> --out film.mp4      (adds the 240-frame black coda)
//
// render: serves this lab folder from a tiny local static server, opens index.html?render=1 in K
//   separate browser instances (--shards), waits for window.QH.ready, then pulls chunks of the frame
//   range from one queue. Each frame: QH.renderFrame(f), gl.readPixels in the same task (so no
//   preserveDrawingBuffer), POST the raw RGBA to the server. The server hashes it (sha256 of the
//   top-down RGBA rows) and pipes it into that chunk's ffmpeg, which writes a lossless segment
//   (FFV1 .mkv, default) or PNG frames (--format png). <out>/log.json gets every frame's time and hash.
// join: checks the frames are contiguous from 0, concatenates the segments, pads 240 black coda
//   frames, muxes the WAV (padded with silence to 100 s) and writes H.264 yuv420p (+faststart) + AAC.
//
// Options: --quality final|draft  --chunk 60  --format ffv1|png  --order forward|reverse|shuffle
//          --mount /url/prefix=<dir or file> (overlay a path; repeatable)  --timeout 120000
// Needs: Playwright with its Chromium (the box's global install), ffmpeg on PATH. No other deps.

import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FPS = 24, PROGRAMME_FRAMES = 2160, CODA_FRAMES = 240, TOTAL_FRAMES = 2400;

// ---- Playwright from the box's global install --------------------------------------------------
export function loadPlaywright() {
  const req = createRequire(import.meta.url);
  const roots = [...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean),
    '/usr/local/lib/node_modules_global', '/opt/node22/lib/node_modules', '/usr/lib/node_modules', '/usr/local/lib/node_modules'];
  // the global install first: it is the one whose browsers are on this box (a repo's own newer
  // playwright may want a browser build that was never downloaded)
  for (const r of [...roots, undefined]) {
    try { return req(r ? req.resolve('playwright', { paths: [r] }) : 'playwright'); } catch { /* next */ }
  }
  throw new Error('playwright not found (install it globally, or set NODE_PATH)');
}

// Software WebGL on SwiftShader, pinned, so every launch draws the same bytes.
export const CHROMIUM_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  '--disable-gpu-rasterization', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text'];

// ---- args --------------------------------------------------------------------------------------
export function parseArgs(argv) {
  const a = { _: [], mount: [] };
  for (let i = 0; i < argv.length; i++) {
    const s = argv[i];
    if (!s.startsWith('--')) { a._.push(s); continue; }
    const k = s.slice(2), v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    if (k === 'mount') a.mount.push(v); else a[k] = v;
  }
  return a;
}

// ---- the static server + frame sink ------------------------------------------------------------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.css': 'text/css', '.bin': 'application/octet-stream' };
export async function startServer({ root = LAB, mounts = [] } = {}) {
  const sinks = new Map();
  const mountList = mounts.map((m) => { const [prefix, dir] = m.split('='); return [prefix, path.resolve(dir)]; })
    .sort((x, y) => y[0].length - x[0].length);
  const srv = http.createServer((req, rsp) => {
    const u = new URL(req.url, 'http://x');
    if (req.method === 'POST' && u.pathname === '/frame') {
      const parts = []; req.on('data', (d) => parts.push(d));
      req.on('end', async () => {
        const sink = sinks.get(u.searchParams.get('chunk'));
        if (!sink) { rsp.writeHead(410); return rsp.end(); }
        try { await sink(Buffer.concat(parts), +u.searchParams.get('f')); rsp.end('ok'); }
        catch (e) { console.error('[sink]', e.message); rsp.writeHead(500); rsp.end(e.message); }
      });
      return;
    }
    let file = null, p = decodeURIComponent(u.pathname);
    for (const [prefix, dir] of mountList) if (p === prefix || p.startsWith(prefix.endsWith('/') ? prefix : prefix + '/')) {
      file = fs.statSync(dir, { throwIfNoEntry: false })?.isFile() ? dir : path.join(dir, p.slice(prefix.length)); break;
    }
    if (!file) { file = path.join(root, p.endsWith('/') ? p + 'index.html' : p); if (!file.startsWith(root)) { rsp.writeHead(403); return rsp.end(); } }
    fs.readFile(file, (e, b) => {
      if (e) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }); rsp.end(b);
    });
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  return { srv, sinks, url: `http://127.0.0.1:${srv.address().port}`, close: () => new Promise((r) => srv.close(r)) };
}

// ---- one browser with the film loaded ------------------------------------------------------------
export async function openFilm(chromium, url, { width, height, ending, quality = 'final', timeout = 120000 }) {
  const browser = await chromium.launch({ args: CHROMIUM_ARGS });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => { errors.push(e.message); console.error('[page]', e.message); });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/GPU stall due to ReadPixels/.test(m.text())) console.error(`[console.${m.type()}]`, m.text()); });
  page.setDefaultTimeout(timeout);
  await page.goto(`${url}/index.html?render=1&w=${width}&h=${height}&ending=${ending}&quality=${quality}`);
  await page.waitForFunction(() => window.QH && window.QH.ready, null, { timeout });
  const info = await page.evaluate(() => window.QH.ready);
  return { browser, page, info, errors };
}

// in the page: render, read back in the same task, send the raw bytes (bottom-up rows)
export const CAPTURE_IN_PAGE = async ([f, url]) => {
  window.QH.renderFrame(f);
  const gl = window.QH.gl, w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
  if (!window.__qhBuf || window.__qhBuf.length !== w * h * 4) window.__qhBuf = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, window.__qhBuf);
  if (url) { const r = await fetch(url, { method: 'POST', body: window.__qhBuf }); if (!r.ok) throw new Error('sink ' + r.status); }
  return [w, h];
};

export function flipRows(buf, w, h) {
  const o = Buffer.allocUnsafe(buf.length), row = w * 4;
  for (let y = 0; y < h; y++) buf.copy(o, (h - 1 - y) * row, y * row, (y + 1) * row);
  return o;
}
export const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// ---- render ------------------------------------------------------------------------------------
function ffmpegFor(outDir, lo, W, H, format) {
  const input = ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-'];
  const args = format === 'png'
    ? [...input, '-start_number', String(lo), path.join(outDir, 'frames', '%06d.png')]
    : [...input, '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'rgb24', '-g', '1', '-slices', '4', '-threads', '1', path.join(outDir, 'seg', `seg_${String(lo).padStart(6, '0')}.mkv`)];
  return spawn('nice', ['-n', '5', 'ffmpeg', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
}

export async function render(opts) {
  const ending = opts.ending || 'main', W = +(opts.width || 1280), H = +(opts.height || 720);
  const FROM = +(opts.from ?? 0), TO = +(opts.to ?? PROGRAMME_FRAMES - 1);   // inclusive
  const SHARDS = +(opts.shards || 3), CHUNK = +(opts.chunk || 60), format = opts.format || 'ffv1';
  const OUT = path.resolve(opts.out || `render-${ending}`), quality = opts.quality || 'final', timeout = +(opts.timeout || 120000);
  fs.mkdirSync(path.join(OUT, format === 'png' ? 'frames' : 'seg'), { recursive: true });
  const { chromium } = loadPlaywright();
  const server = await startServer({ mounts: opts.mount || [] });

  let chunks = [];
  for (let lo = FROM; lo <= TO; lo += CHUNK) chunks.push([lo, Math.min(TO + 1, lo + CHUNK)]);
  if (opts.order === 'reverse') chunks.reverse();
  if (opts.order === 'shuffle') chunks = chunks.map((c, i) => [c, crypto.createHash('md5').update(String(i)).digest()[0]]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  const queue = [...chunks], frames = {}, t0 = Date.now(); let done = 0, info = null;

  async function renderChunk(w, [lo, hi]) {
    const id = `${lo}`, ff = ffmpegFor(OUT, lo, W, H, format);
    const closed = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
    let expect = lo;
    server.sinks.set(id, (buf, f) => {
      if (f !== expect) throw new Error(`frame ${f} arrived, expected ${expect}`);
      if (buf.length !== W * H * 4) throw new Error(`frame ${f}: ${buf.length} bytes, expected ${W * H * 4}`);
      expect++;
      const top = flipRows(buf, W, H);
      frames[f] = { ...(frames[f] || {}), sha256: sha256(top) };
      return new Promise((r) => (ff.stdin.write(top) ? r() : ff.stdin.once('drain', r)));
    });
    try {
      for (let f = lo; f < hi; f++) {
        const a = process.hrtime.bigint();
        await w.page.evaluate(CAPTURE_IN_PAGE, [f, `/frame?chunk=${id}&f=${f}`]);
        frames[f].ms = Number(process.hrtime.bigint() - a) / 1e6;
      }
    } catch (e) { ff.kill('SIGKILL'); server.sinks.delete(id); throw e; }
    ff.stdin.end(); await closed; server.sinks.delete(id);
  }
  async function worker(k) {
    let w = null;
    while (queue.length) {
      const c = queue.shift();
      for (let attempt = 1; ; attempt++) {
        try {
          w ||= await openFilm(chromium, server.url, { width: W, height: H, ending, quality, timeout });
          info ||= w.info;
          await renderChunk(w, c);
          done += c[1] - c[0];
          const s = (Date.now() - t0) / 1000;
          console.log(`[shard ${k}] ${ending} frames ${c[0]}-${c[1] - 1} ok | ${done}/${TO - FROM + 1} | ${(done / s).toFixed(2)} fps | eta ${Math.round((TO - FROM + 1 - done) / (done / s))} s`);
          break;
        } catch (e) {
          console.error(`[shard ${k}] chunk ${c[0]} attempt ${attempt} failed: ${e.message}`);
          if (w) { await w.browser.close().catch(() => {}); w = null; }
          if (attempt >= 2) throw e;
        }
      }
    }
    if (w) await w.browser.close();
  }
  await Promise.all(Array.from({ length: Math.min(SHARDS, chunks.length) }, (_, k) => worker(k)));
  await server.close();
  const wallS = (Date.now() - t0) / 1000, list = Object.keys(frames).map(Number).sort((a, b) => a - b);
  const ms = list.map((f) => frames[f].ms).sort((a, b) => a - b);
  const log = {
    ending, width: W, height: H, from: FROM, to: TO, shards: SHARDS, chunk: CHUNK, format, quality, order: opts.order || 'forward',
    info, wallSeconds: +wallS.toFixed(1), fps: +((TO - FROM + 1) / wallS).toFixed(3),
    msPerFrame: { median: +ms[ms.length >> 1].toFixed(1), p90: +ms[Math.floor(ms.length * 0.9)].toFixed(1), mean: +(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(1) },
    load: fs.readFileSync('/proc/loadavg', 'utf8').trim(),
    chunks: chunks.map(([lo, hi]) => ({ from: lo, to: hi - 1, file: format === 'png' ? null : `seg/seg_${String(lo).padStart(6, '0')}.mkv` })).sort((a, b) => a.from - b.from),
    frames: list.map((f) => ({ f, ms: +frames[f].ms.toFixed(1), sha256: frames[f].sha256 })),
  };
  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 1));
  console.log(`rendered ${ending} ${FROM}..${TO} at ${W}x${H} in ${wallS.toFixed(1)} s (${log.fps} fps, median ${log.msPerFrame.median} ms/frame per shard) -> ${OUT}`);
  return log;
}

// ---- join: segments + 240 black coda frames + audio -> mp4 -----------------------------------
export function join(opts) {
  const IN = path.resolve(opts.in), OUT = path.resolve(opts.out || path.join(IN, 'film.mp4'));
  const log = JSON.parse(fs.readFileSync(path.join(IN, 'log.json'), 'utf8'));
  const fr = log.frames.map((x) => x.f);
  for (let i = 0; i < fr.length; i++) if (fr[i] !== log.from + i) throw new Error(`frames not contiguous at ${log.from + i}`);
  if (log.from !== 0 && !opts.partial) throw new Error(`frames start at ${log.from}, not 0 (pass --partial to allow)`);
  const n = fr.length, coda = opts.coda === undefined ? CODA_FRAMES : +opts.coda, seconds = (n + coda) / FPS;
  let input;
  if (log.format === 'png') input = ['-framerate', String(FPS), '-start_number', String(log.from), '-i', path.join(IN, 'frames', '%06d.png')];
  else {
    const list = path.join(IN, 'segments.txt');
    fs.writeFileSync(list, log.chunks.map((c) => `file '${path.join(IN, c.file)}'`).join('\n') + '\n');
    input = ['-f', 'concat', '-safe', '0', '-r', String(FPS), '-i', list];
  }
  const audio = opts.audio ? ['-i', path.resolve(opts.audio)] : [];
  const vf = `tpad=stop=${coda}:stop_mode=add:color=black,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`;
  const args = ['-v', 'error', '-y', ...input, ...audio, '-map', '0:v', ...(opts.audio ? ['-map', '1:a', '-af', `apad=whole_dur=${seconds}`, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000'] : []),
    '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', opts.preset || 'slow', '-crf', String(opts.crf || 17), '-tune', 'film',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-t', seconds.toFixed(6), '-movflags', '+faststart', OUT];
  const a = Date.now();
  execFileSync('nice', ['-n', '5', 'ffmpeg', ...args], { stdio: 'inherit' });
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-show_entries', 'stream=codec_type,codec_name,pix_fmt,nb_read_packets,duration,sample_rate', '-of', 'json', OUT]).toString());
  console.log(`joined ${n} frames + ${coda} black -> ${OUT} (${(fs.statSync(OUT).size / 1048576).toFixed(1)} MB, ${((Date.now() - a) / 1000).toFixed(1)} s)`);
  console.log(JSON.stringify(probe.streams));
  return probe;
}

// ---- CLI ---------------------------------------------------------------------------------------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  const run = a._[0] === 'join' ? async () => join(a) : () => render(a);
  run().catch((e) => { console.error(e); process.exit(1); });
}
