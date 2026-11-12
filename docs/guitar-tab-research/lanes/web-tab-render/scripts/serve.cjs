// Minimal static file server for the web-tab-render trials (no dependencies).
// Usage: node serve.cjs [port]   (default 8765)
// Routes:  /nm/...     -> /home/user/gtr/lanes/web-tab-render/web/node_modules/...
//          /pages/...  -> this folder's pages/ (the test pages written for the trials)
//          /inputs/... -> /home/user/gtr/inputs/... (shared inputs, read only)
//          /lane/...   -> /home/user/gtr/lanes/web-tab-render/... (generated files: alphaTex, MusicXML, MEI ...)
//          /web/...    -> /home/user/gtr/lanes/web-tab-render/web/... (built editors etc.)
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = parseInt(process.argv[2] || '8765', 10);
const LANE = '/home/user/gtr/lanes/web-tab-render';
const routes = {
  '/nm/': path.join(LANE, 'web', 'node_modules'),
  '/pages/': path.join(__dirname, 'pages'),
  '/inputs/': '/home/user/gtr/inputs',
  '/lane/': LANE,
  '/web/': path.join(LANE, 'web'),
};
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.cjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.otf': 'font/otf',
  '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject', '.xml': 'application/xml', '.musicxml': 'application/xml',
  '.mei': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.sf2': 'application/octet-stream',
  '.sf3': 'application/octet-stream', '.gp5': 'application/octet-stream', '.gp': 'application/octet-stream',
  '.mid': 'audio/midi', '.wav': 'audio/wav', '.map': 'application/json',
};
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const prefix = Object.keys(routes).find((p) => url.startsWith(p));
  if (!prefix) { res.writeHead(404); return res.end('no route'); }
  const base = routes[prefix];
  const file = path.normalize(path.join(base, url.slice(prefix.length)));
  if (!file.startsWith(base)) { res.writeHead(403); return res.end('forbidden'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(port, '127.0.0.1', () => console.log('serving on http://127.0.0.1:' + port));
