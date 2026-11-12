// Freezes a built page into a folder of public/ that later builds never change (node scripts/tools/tea-freeze.mjs
// <page> <folder> [--assets <folder>] [--dist dist]), e.g. `/tea/ public/labs/tea-room/v2`: the page's HTML, and every
// file it loads or its scripts fetch later, copied under <folder>/assets/ (or --assets, to share one) and pointed there.
// Links to other pages stay live, video stays at /media/. The copy says noindex, carries ao-frozen for ao-build, and
// stats-pages.mjs leaves it out of /api/stats. Run it on a fresh `npm run build` of the commit that is live.
import fs from 'node:fs';
import path from 'node:path';
import { isLivePath } from '../../src/data/exempt.js';

const SITE = 'https://aaronorelup.com';
const VIDEO = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac|m3u8|ts)$/i;
const SCANNED = /\.(js|mjs|css|json|svg)$/i;
// Bare file names in a JSON file or a script (a manifest's "tv_rig.glb"), resolved against the file that names them.
const FILEISH = /^[\w@][\w@.-]*(\/[\w@.-]+)*\.[a-z0-9]{2,5}$/i;

export function usage() {
  return 'Usage: node scripts/tools/tea-freeze.mjs <page, e.g. /tea/> <folder under public/, e.g. public/labs/tea-room/v2>' +
    ' [--assets <folder under public/>] [--dist dist]';
}

// The address a folder under public/ answers at: public/labs/tea-room/v1 → /labs/tea-room/v1
export function addressOf(folder) {
  const rel = path.relative('public', folder).split(path.sep).join('/');
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`not a folder under public/: ${folder}`);
  return '/' + rel.replace(/\/+$/, '');
}

// Every quoted string or url(...) in a script, stylesheet or JSON file: [match index, the string, its quote].
const STRINGS = /(["'`])((?:(?!\1)[^\\\n]|\\.){1,300}?)\1|url\(\s*(["']?)([^"')\s]+)\3\s*\)/g;

// One file the page needs, as a URL path of the build, or null: a page, video, a remote or missing file is not one.
function localFile(dist, ref, base) {
  if (!ref || /^(data|blob|mailto|tel|javascript|https?):|^\/\/|^#/i.test(ref)) return null;
  let p;
  if (ref.startsWith('_astro/')) p = '/' + ref; // Vite's preload list names its chunks without the leading slash
  else if (ref.startsWith('/')) p = ref;
  else if (ref.startsWith('./') || ref.startsWith('../') || FILEISH.test(ref)) p = new URL(ref, SITE + base).pathname;
  else return null;
  p = decodeURI(p.split(/[?#]/)[0]);
  if (p.endsWith('/') || /\.html?$/.test(p) || VIDEO.test(p)) return null;
  const file = path.resolve(dist, '.' + p);
  return file.startsWith(path.resolve(dist)) && fs.existsSync(file) && fs.statSync(file).isFile() ? p : null;
}

// The attributes of one start tag, in order, with their raw text so the tag can be put back as it was.
const ATTRS = /(\s+)([^\s=/>]+)(?:(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
const TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
const RAW = /(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi;

// Which attribute values of a tag name files the page loads. A link the reader follows (a, area, a link to the feed,
// the canonical address) is not one; og:url and canonical are pointed at the copy apart.
function loads(tag, attrs, name) {
  const rel = (attrs.find((a) => a.name === 'rel')?.value || '').toLowerCase();
  if (tag === 'a' || tag === 'area' || tag === 'form' || tag === 'base') return false;
  if (tag === 'link' && name === 'href') return !/\b(canonical|alternate|next|prev|author|me)\b/.test(rel);
  if (tag === 'meta') return false;
  return ['src', 'href', 'srcset', 'poster', 'data', 'content'].includes(name) || name.startsWith('data-');
}

function parseAttrs(text) {
  return [...text.matchAll(ATTRS)].map((m) => ({ raw: m[0], space: m[1], name: m[2].toLowerCase(), eq: m[3],
    value: m[4] ?? m[5] ?? m[6], quote: m[4] !== undefined ? '"' : m[5] !== undefined ? "'" : '' }));
}

const srcsetParts = (v) => v.split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean);

// Every file a stylesheet, script or JSON file names (scan) and the same text pointed at the copy (rewrite).
function scanText(dist, text, base) {
  const found = new Set();
  for (const m of text.matchAll(STRINGS)) {
    const p = localFile(dist, m[2] ?? m[4], base);
    if (p) found.add(p);
  }
  return found;
}

// A string in a script or stylesheet pointed at the copy: a file of the copy, Vite's "_astro/…" preload names, or
// a folder the copy holds whole that a script joins a name to ('/tea/hero/' + m; foldersOf). Relative names need nothing: the tree is
// kept as it was.
function rewriteText(text, map, dirs, base, dist) {
  return text.replace(STRINGS, (whole, q, s, uq, us) => {
    const ref = s ?? us;
    const p = localFile(dist, ref, base);
    let to = null;
    if (p && map.has(p) && (ref.startsWith('/') || ref.startsWith('_astro/'))) {
      to = ref.startsWith('_astro/') ? map.get(p).slice(1) : map.get(p) + ref.slice(p.length);
    } else if (ref.startsWith('/') && dirs.has(ref)) to = dirs.get(ref);
    if (to === null) return whole;
    return s !== undefined ? q + to + q : whole.replace(us, to);
  });
}

// The HTML pointed at the copy: tags' file attributes, inline scripts and styles, the head's own address.
function rewriteHtml(html, { map, dirs, base, dist, address, from, commit }) {
  const text = (t) => rewriteText(t, map, dirs, base, dist);
  const swap = (ref) => {
    const p = localFile(dist, ref, base);
    return p && map.has(p) && ref.startsWith('/') ? map.get(p) + ref.slice(p.length) : ref;
  };
  const tagOf = (whole, name, attrText) => {
    const tag = name.toLowerCase();
    const attrs = parseAttrs(attrText);
    const named = attrs.find((a) => a.name === 'property' || a.name === 'name')?.value;
    const rel = attrs.find((a) => a.name === 'rel')?.value;
    if (tag === 'meta' && named === 'ao-build') {
      return `<meta name="ao-frozen" content="${from} at ${attrs.find((a) => a.name === 'content').value}">`;
    }
    let changed = false;
    const parts = attrs.map((a) => {
      if (a.value === undefined) return a.raw;
      let v = a.value;
      if ((tag === 'meta' && named === 'og:url' && a.name === 'content') || (tag === 'link' && rel === 'canonical' && a.name === 'href')) {
        v = SITE + address + '/';
      } else if (a.name === 'style') v = text(v);
      else if (loads(tag, attrs, a.name)) {
        v = a.name === 'srcset' ? v.replace(/([^\s,]+)(\s|,|$)/g, (m, ref, end) => swap(ref) + end) : swap(v);
      }
      if (v === a.value) return a.raw;
      changed = true;
      return `${a.space}${a.name}${a.eq}${a.quote}${v}${a.quote}`;
    });
    return changed ? `<${name}${parts.join('')}${whole.slice(1 + name.length + attrText.length)}` : whole;
  };
  const raws = [];
  let out = html.replace(RAW, (whole, open, tag, body, close) => {
    raws.push(open.replace(TAG, tagOf) + text(body) + close);
    return `\u0000${raws.length - 1}\u0000`;
  });
  out = out.replace(TAG, tagOf).replace(/\u0000(\d+)\u0000/g, (m, i) => raws[Number(i)]);
  if (!/<meta name="robots" content="[^"]*\bnoindex\b/.test(out)) {
    out = out.replace(/(<meta name="viewport"[^>]*>)/, '$1 <meta name="robots" content="noindex">');
  }
  if (!out.includes('<meta name="ao-frozen"')) {
    out = out.replace('</head>', `<meta name="ao-frozen" content="${from} at ${commit}"></head>`);
  }
  return out;
}

// Every file the page loads, followed through its stylesheets, scripts and JSON files.
export function filesOf(dist, html, page) {
  const want = new Set();
  for (const [, , , body] of html.matchAll(RAW)) for (const p of scanText(dist, body, page)) want.add(p);
  for (const [, tag, attrText] of html.replace(RAW, '$1$4').matchAll(TAG)) {
    const attrs = parseAttrs(attrText);
    for (const a of attrs) {
      if (a.value === undefined) continue;
      if (a.name === 'style') { for (const p of scanText(dist, a.value, page)) want.add(p); continue; }
      if (!loads(tag.toLowerCase(), attrs, a.name)) continue;
      for (const ref of a.name === 'srcset' ? srcsetParts(a.value) : [a.value]) {
        const p = localFile(dist, ref, page);
        if (p) want.add(p);
      }
    }
  }
  const queue = [...want];
  while (queue.length) {
    const p = queue.shift();
    if (!SCANNED.test(p)) continue;
    for (const q of scanText(dist, fs.readFileSync(path.join(dist, p), 'utf8'), p)) {
      if (!want.has(q)) { want.add(q); queue.push(q); }
    }
  }
  return [...want].sort();
}

// The folders of the copy that a script may join a name to ('/tea/hero/' + m): each copied file's folder, two levels
// deep or more (never '/' or '/fonts/'), and only when the copy holds every file the build has there, so any name
// joined to it is a file of the copy. A folder the copy holds in part ('/media/previews/': other posts' previews)
// stays live, and so does any folder under /media/ or /read/: their video and audio live in R2 (docs/MEDIA.md), so
// dist/ cannot show the folder whole. Returns [rewritten, left live].
function foldersOf(files, assets, assetsAt, dist) {
  const dirs = new Map(), live = [];
  const have = new Set(files);
  for (const d of new Set(files.map((f) => f.slice(0, f.lastIndexOf('/') + 1)))) {
    if (d.split('/').length <= 3) continue;
    if (/^\/(media|read)\//.test(d)) { live.push(`${d} (video and audio live in R2)`); continue; }
    const all = fs.readdirSync(path.join(dist, d), { withFileTypes: true }).filter((e) => e.isFile()).map((e) => d + e.name);
    if (all.every((f) => have.has(f) || fs.existsSync(path.join(assets, f)))) dirs.set(d, assetsAt + d);
    else live.push(`${d} (the copy holds ${all.filter((f) => have.has(f)).length} of its ${all.length} files)`);
  }
  return [dirs, live];
}

export function freeze({ page, folder, assets = path.join(folder, 'assets'), dist = 'dist', log = console.log }) {
  if (!/^\/[\w./-]*\/$/.test(page)) throw new Error(`a page is its address, with the slashes: /tea/, not ${page}`);
  const source = path.join(dist, page, 'index.html');
  if (!fs.existsSync(source)) throw new Error(`no ${source}: run npm run build first`);
  for (const p of [page, folder, assets]) if (isLivePath(p)) throw new Error(`${p} is a live notebook's (src/data/exempt.js)`);
  const address = addressOf(folder);
  const assetsAt = addressOf(assets);
  const target = path.join(folder, 'index.html');
  if (fs.existsSync(target)) throw new Error(`${target} exists: a frozen copy is never written over. Pick a new folder`);
  const html = fs.readFileSync(source, 'utf8');
  const commit = html.match(/<meta name="ao-build" content="([^"]*)"/)?.[1];
  if (!commit) throw new Error(`${source} has no ao-build meta: not a page Astro built (already frozen?)`);

  const files = filesOf(dist, html, page);
  const map = new Map(files.map((f) => [f, assetsAt + f]));
  const [dirs, live] = foldersOf(files, assets, assetsAt, dist);
  let added = 0, kept = 0, bytes = 0;
  const plan = files.map((f) => {
    const from = path.join(dist, f);
    const body = SCANNED.test(f)
      ? Buffer.from(rewriteText(fs.readFileSync(from, 'utf8'), map, dirs, f, dist))
      : fs.readFileSync(from);
    const to = path.join(assets, f);
    if (fs.existsSync(to)) {
      if (!fs.readFileSync(to).equals(body)) throw new Error(`${to} exists with other bytes: frozen files never change`);
      kept++;
      return null;
    }
    return { to, body };
  }).filter(Boolean);
  const out = rewriteHtml(html, { map, dirs, base: page, dist, address, from: page, commit });
  for (const { to, body } of plan) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, body);
    added++; bytes += body.length;
  }
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(target, out);
  bytes += Buffer.byteLength(out);
  log(`${page} (build ${commit.slice(0, 8)}) frozen at ${address}/: ${files.length} files under ${assetsAt}/ ` +
    `(${added} written, ${kept} already there), ${bytes} bytes written`);
  for (const [d, to] of dirs) log(`  folder ${d} → ${to}`);
  for (const d of live) log(`  folder ${d} left live: a script naming it still reaches the site`);
  return { files, address, assetsAt, bytes };
}

// What a frozen copy still names of the site's build files outside itself: a quoted or url() path into /_astro/,
// /fonts/ or /tea/hero/ (or Vite's bare "_astro/…") in its page or any text file it copied. Empty when it is whole.
const LEAK = /[("'`=]\s*(?:\/(?:_astro|fonts|tea\/hero)\/|_astro\/)[^"'`)\s]*/g;
export function outside(files) {
  return files.flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(LEAK)].map((m) => `${f}: ${m[0]}`));
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf('--' + k); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const assets = opt('assets'), dist = opt('dist') || 'dist';
  const [page, folder] = args;
  if (!page || !folder) { console.error(usage()); process.exit(1); }
  try {
    const out = assets || path.join(folder, 'assets');
    const { files } = freeze({ page, folder, assets: out, dist });
    const left = outside([path.join(folder, 'index.html'), ...files.filter((f) => SCANNED.test(f)).map((f) => path.join(out, f))]);
    if (left.length) { console.error('still outside the copy:\n  ' + left.join('\n  ')); process.exit(1); }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
