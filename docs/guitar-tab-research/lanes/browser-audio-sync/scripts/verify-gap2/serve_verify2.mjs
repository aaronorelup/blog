// Local static server for the gap-round-2 pages of browser-audio-sync (a copy of ../serve.mjs with other roots).
// - Same headers as serve.mjs: COOP/COEP/CORP so pages are cross-origin isolated (SharedArrayBuffer, ONNX Runtime Web
//   threads); ?coi=0 on a page URL serves it without the isolation headers.
// - Roots: /gpages/ = scripts/gap2/pages, /pages/ = scripts/pages (for common.js), /nm/ = the gap round's own
//   node_modules (node-gap2: onnxruntime-web 1.31.1, @techstark/opencv-js 5.0.0-release.1), /laneinputs/, /dl/,
//   /inputs/ (shared clips), /frames/ (decoded video frames for the OpenCV.js page).
// - POST /upload/<tool>/<name> writes the body to /home/user/gtr/lanes/browser-audio-sync/out/<tool>/<name>.
// - Every request is logged to stdout with its path and status (which .wasm file a page loaded is read from this log).
// Usage: node serve_gap2.mjs <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const LANE = '/home/user/gtr/lanes/browser-audio-sync'; const VER = path.join(LANE, 'verify-gap2');   // verifier copy: /nm/, /dl/, /frames/ and uploads point into verify-gap2/
const HERE = '/home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/scripts/gap2';
const ROOTS = {
  '/gpages/': path.join(HERE, 'pages'),
  '/pages/': path.join(HERE, '..', 'pages'),
  '/nm/': path.join(VER, 'node', 'node_modules'),
  '/inputs/': '/home/user/gtr/inputs',
  '/laneinputs/': path.join(LANE, 'inputs'),
  '/dl/': path.join(VER, 'dl'),
  '/frames/': path.join(VER, 'frames'),
};
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.wasm': 'application/wasm', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.webm': 'video/webm', '.bin': 'application/octet-stream',
  '.onnx': 'application/octet-stream', '.css': 'text/css', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.raw': 'application/octet-stream', '.data': 'application/octet-stream',
};
const port = Number(process.argv[2] || 18766);

function headers(coi, extra = {}) {
  const h = { 'Cache-Control': 'no-store', 'Cross-Origin-Resource-Policy': 'cross-origin', ...extra };
  if (coi) { h['Cross-Origin-Opener-Policy'] = 'same-origin'; h['Cross-Origin-Embedder-Policy'] = 'require-corp'; }
  return h;
}
const log = (req, code, extra = '') => console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${code}${extra}`);

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const coi = u.searchParams.get('coi') !== '0';
  if (req.method === 'POST' && u.pathname.startsWith('/upload/')) {
    const parts = u.pathname.split('/').slice(2);
    if (parts.length !== 2 || !parts.every((p) => /^[A-Za-z0-9_.-]+$/.test(p)) || parts.some((p) => p.startsWith('.'))) {
      res.writeHead(400, headers(coi)); res.end('bad name'); log(req, 400); return;
    }
    const dir = path.join(VER, 'out', parts[0]);
    fs.mkdirSync(dir, { recursive: true });
    const ws = fs.createWriteStream(path.join(dir, parts[1]));
    req.pipe(ws);
    ws.on('finish', () => { res.writeHead(200, headers(coi)); res.end('ok'); log(req, 200); });
    ws.on('error', (e) => { res.writeHead(500, headers(coi)); res.end(String(e)); log(req, 500); });
    return;
  }
  const root = Object.keys(ROOTS).find((r) => u.pathname.startsWith(r));
  if (!root) { res.writeHead(404, headers(coi)); res.end('not found'); log(req, 404); return; }
  const rel = decodeURIComponent(u.pathname.slice(root.length));
  const file = path.normalize(path.join(ROOTS[root], rel));
  if (!file.startsWith(path.normalize(ROOTS[root]))) { res.writeHead(403, headers(coi)); res.end('forbidden'); log(req, 403); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, headers(coi)); res.end('not found'); log(req, 404); return; }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, headers(coi, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' }));
    log(req, 200, ` ${st.size}`);
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
}).listen(port, '127.0.0.1', () => console.log(`serving on http://127.0.0.1:${port}`));
