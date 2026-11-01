// The self-hosted fonts: Google's own woff2 slices of the site's families, only those holding a code point the site's
// pages show (the latin slice always), saved in public/fonts/ under content-hashed names. Writes their @font-face
// rules to src/styles/fonts.css and src/data/fonts.json (the preload, each face's range, the code points no family
// has). Run it after a build whenever misses() reports any: `node scripts/tools/fonts.mjs [dist]` (needs the network).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isLivePath } from '../../src/data/exempt.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = path.join(ROOT, 'public/fonts');
const CSS = path.join(ROOT, 'src/styles/fonts.css');
const JSON_FILE = path.join(ROOT, 'src/data/fonts.json');
// The families and weights the pages ask for (tokens.css; JetBrains Mono is the lore course's --mono).
const GOOGLE = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&family=Karla:wght@400;600' +
  '&family=JetBrains+Mono:wght@400;500;700&display=swap';
// Google picks the font format from the user agent; this one gets woff2.
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const PRELOAD = { family: 'Karla', slice: 'latin' };   // the body font

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const entity = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

// Every code point in the pages Astro built (they carry the ao-build meta) and in the scripts and stylesheets they
// load, which draw text of their own. The live notebooks' pages count only when `live` is set.
export function codePoints(dist, { live = true } = {}) {
  const found = new Set();
  for (const file of walk(dist)) {
    const rel = path.relative(dist, file);
    const asset = rel.startsWith('_astro/') && /\.(js|css)$/.test(rel);
    if (!asset && !rel.endsWith('.html')) continue;
    if (!live && isLivePath(rel)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (!asset && !text.includes('<meta name="ao-build"')) continue;
    for (const ch of asset ? text : entity(text)) found.add(ch.codePointAt(0));
  }
  return found;
}

// "U+0000-00FF, U+0131" → [[0, 255], [305, 305]]
const parseRange = (range) => range.split(',').map((r) => {
  const [a, b = a] = r.trim().slice(2).split('-');
  return [parseInt(a, 16), parseInt(b, 16)];
});
const within = (ranges, c) => ranges.some(([a, b]) => c >= a && c <= b);
// Sorted code points → "U+0142, U+2190-2192"
const hex = (c) => c.toString(16).toUpperCase().padStart(4, '0');
const toRange = (cps) => cps.reduce((runs, c) => {
  const run = runs.at(-1);
  if (run && c === run[1] + 1) run[1] = c;
  else runs.push([c, c]);
  return runs;
}, []).map(([a, b]) => (a === b ? `U+${hex(a)}` : `U+${hex(a)}-${hex(b)}`)).join(', ');

// Display code points that no self-hosted face covers and that the tool has not recorded as missing from every
// family: a new character on a page. Live notebooks never count.
export function misses(dist) {
  const { faces, lacking } = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const ranges = faces.flatMap((f) => parseRange(f.range));
  return [...codePoints(dist, { live: false })].filter((c) => !within(ranges, c) && !lacking.includes(c)).sort((a, b) => a - b);
}

// Google's stylesheet as faces: family, weight, url, range and a slice name ("latin", or the file's own number).
function parse(css) {
  return [...css.matchAll(/(?:\/\* ([\w-]+) \*\/\s*)?@font-face \{([^}]+)\}/g)].map(([, name, body]) => {
    const url = body.match(/url\(([^)]+)\)/)[1];
    return {
      family: body.match(/font-family: '([^']+)'/)[1],
      weight: Number(body.match(/font-weight: (\d+)/)[1]),
      url,
      range: body.match(/unicode-range: ([^;]+);/)[1],
      slice: name || url.match(/\.(\d+)\.woff2$/)[1],
    };
  });
}

async function main(dist) {
  const used = codePoints(dist);
  const all = parse(await (await fetch(GOOGLE, { headers: { 'User-Agent': UA } })).text())
    .map((f) => ({ ...f, ranges: parseRange(f.range) }));
  // Where faces of one family and weight overlap, the browser takes the one declared last, as Google orders them:
  // a slice is kept only for a code point no later slice covers.
  // Google's latin slices keep their whole range; any other slice is narrowed to the code points it serves.
  const groups = [...Map.groupBy(all, (f) => `${f.family} ${f.weight}`).values()];
  const serves = new Map(all.filter((f) => f.slice === 'latin').map((f) => [f, null]));
  for (const c of [...used].sort((a, b) => a - b)) {
    for (const group of groups) {
      const last = group.findLast((f) => within(f.ranges, c));
      if (last && last.slice !== 'latin') serves.set(last, [...(serves.get(last) ?? []), c]);
    }
  }
  const faces = all.filter((f) => serves.has(f)).map((f) => ({ ...f, range: serves.get(f) ? toRange(serves.get(f)) : f.range }));
  const lacking = [...used].filter((c) => !all.some((f) => within(f.ranges, c))).sort((a, b) => a - b);

  // One file per url: a variable family (Karla, JetBrains Mono) serves every weight from one file.
  const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
  const files = new Map();
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of faces) {
    if (files.has(f.url)) continue;
    const bytes = Buffer.from(await (await fetch(f.url)).arrayBuffer());
    const shared = faces.filter((g) => g.url === f.url).length > 1;
    const name = `${slug(f.family)}${shared ? '' : `-${f.weight}`}-${f.slice}.` +
      `${crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8)}.woff2`;
    fs.writeFileSync(path.join(OUT, name), bytes);
    files.set(f.url, `/fonts/${name}`);
  }

  const rules = faces.map((f) => `@font-face {\n  font-family: '${f.family}';\n  font-style: normal;\n` +
    `  font-weight: ${f.weight};\n  font-display: swap;\n  src: url('${files.get(f.url)}') format('woff2');\n` +
    `  unicode-range: ${f.range};\n}`);
  fs.writeFileSync(CSS, '/* Written by scripts/tools/fonts.mjs: Google\'s slices of the site\'s fonts, self-hosted. */\n' +
    rules.join('\n') + '\n');
  const preload = files.get(faces.find((f) => f.family === PRELOAD.family && f.slice === PRELOAD.slice).url);
  fs.writeFileSync(JSON_FILE, JSON.stringify({
    preload,
    faces: faces.map((f) => ({ family: f.family, weight: f.weight, file: files.get(f.url), range: f.range })),
    lacking,
  }, null, 1) + '\n');
  console.log(`${faces.length} faces in ${files.size} files; ${lacking.length} code points no family has`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main(path.resolve(process.argv[2] ?? 'dist'));
