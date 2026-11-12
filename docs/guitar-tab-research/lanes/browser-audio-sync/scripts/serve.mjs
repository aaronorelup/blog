// Local static server for the browser-audio-sync trials.
// - Serves fixed roots only (no directory listing), with COOP/COEP/CORP headers so pages are cross-origin isolated
//   (needed for SharedArrayBuffer, i.e. ONNX Runtime Web threads and ffmpeg.wasm core-mt). ?coi=0 on a page URL
//   serves that page without the isolation headers, to measure the non-isolated case.
// - POST /upload/<tool>/<name> writes the request body to /home/user/gtr/lanes/browser-audio-sync/out/<tool>/<name>.
// Usage: node serve.mjs <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const LANE = '/home/user/gtr/lanes/browser-audio-sync';
const SCRIPTS = path.dirname(url.fileURLToPath(import.meta.url));
const ROOTS = {
  '/pages/': path.join(SCRIPTS, 'pages'),
  '/nm/': path.join(LANE, 'node', 'node_modules'),
  '/build/': path.join(LANE, 'work', 'build'),
  '/inputs/': '/home/user/gtr/inputs',
  '/laneinputs/': path.join(LANE, 'inputs'),
  '/dl/': path.join(LANE, 'dl'),
  '/out/': path.join(LANE, 'out'),
};
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.wasm': 'application/wasm', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.webm': 'video/webm', '.bin': 'application/octet-stream',
  '.sf2': 'application/octet-stream', '.sf3': 'application/octet-stream', '.gp5': 'application/octet-stream', '.mid': 'audio/midi',
  '.onnx': 'application/octet-stream', '.task': 'application/octet-stream', '.css': 'text/css', '.txt': 'text/plain',
  '.csv': 'text/plain', '.png': 'image/png', '.data': 'application/octet-stream', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
  '.lab': 'text/plain', '.gp': 'application/octet-stream', '.raw': 'application/octet-stream',
};
const port = Number(process.argv[2] || 8765);

function headers(coi, extra = {}) {
  const h = { 'Cache-Control': 'no-store', 'Cross-Origin-Resource-Policy': 'cross-origin', ...extra };
  if (coi) { h['Cross-Origin-Opener-Policy'] = 'same-origin'; h['Cross-Origin-Embedder-Policy'] = 'require-corp'; }
  return h;
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const coi = u.searchParams.get('coi') !== '0';
  if (req.method === 'POST' && u.pathname.startsWith('/upload/')) {
    const parts = u.pathname.split('/').slice(2);
    if (parts.length !== 2 || !parts.every((p) => /^[A-Za-z0-9_.-]+$/.test(p)) || parts.some((p) => p.startsWith('.'))) {
      res.writeHead(400, headers(coi)); res.end('bad name'); return;
    }
    const dir = path.join(LANE, 'out', parts[0]);
    fs.mkdirSync(dir, { recursive: true });
    const ws = fs.createWriteStream(path.join(dir, parts[1]));
    req.pipe(ws);
    ws.on('finish', () => { res.writeHead(200, headers(coi)); res.end('ok'); });
    ws.on('error', (e) => { res.writeHead(500, headers(coi)); res.end(String(e)); });
    return;
  }
  const root = Object.keys(ROOTS).find((r) => u.pathname.startsWith(r));
  if (!root) { res.writeHead(404, headers(coi)); res.end('not found'); return; }
  const rel = decodeURIComponent(u.pathname.slice(root.length));
  const file = path.normalize(path.join(ROOTS[root], rel));
  if (!file.startsWith(ROOTS[root])) { res.writeHead(403, headers(coi)); res.end('forbidden'); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, headers(coi)); res.end('not found'); return; }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {   // media elements ask for byte ranges
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] ? Number(m[1]) : 0;
      let end = m && m[2] ? Number(m[2]) : st.size - 1;
      if (start >= st.size) { res.writeHead(416, headers(coi, { 'Content-Range': `bytes */${st.size}` })); res.end(); return; }
      end = Math.min(end, st.size - 1);
      res.writeHead(206, headers(coi, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1,
        'Content-Range': `bytes ${start}-${end}/${st.size}` }));
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, headers(coi, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' }));
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
}).listen(port, '127.0.0.1', () => console.log(`serving on http://127.0.0.1:${port}`));
