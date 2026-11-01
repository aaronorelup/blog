// Compares two builds of the site, page by page, for refactors that must change nothing a reader sees.
// `node scripts/tools/dist-diff.mjs <old-dist> <new-dist>` prints TEXT (visible words), MARKUP (the element tree),
// ASSETS (the set of script and link tags, wherever they sit), CHANGED (other files), ADDED and REMOVED. _astro
// hashes, Astro's scoped-style ids and whitespace are ignored; live paths and version.json are left out.
// Build both sides from the same src/content (P step 1). Exits 1 on any difference but ASSETS.
import fs from 'node:fs';
import path from 'node:path';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { toText } from 'hast-util-to-text';
import { SKIP, visit } from 'unist-util-visit';
import { isLive, isLivePath } from '../../src/data/exempt.js';

const TEXTUAL = /\.(html|json|xml|txt|css|vtt|svg|md|webmanifest)$/;
const SKIPPED = (rel) => rel.startsWith('_astro/') || rel === 'version.json' || isLivePath(rel);
const unhash = (s) => s.replace(/(\/_astro\/[^"'\s)]*?)\.[A-Za-z0-9_-]{8}(\.[a-z0-9]+)/g, '$1.*$2');

// The contract files name the live notebooks too: their lines, keys and feed items are left out like their files.
function withoutLive(f, s) {
  if (f.endsWith('.txt')) return s.split('\n').filter((l) => !isLivePath(l)).join('\n');
  if (f.endsWith('.xml')) {
    return s.replace(/<(item|url)>[\s\S]*?<\/\1>/g, (b) => ([...b.matchAll(/https:\/\/aaronorelup\.com(\/[^<"\s]*)/g)]
      .some(([, p]) => isLivePath(p)) ? '' : b));
  }
  if (!f.endsWith('.json')) return s;
  const prune = (v) => (v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).filter(([k]) => !isLive(k) && !isLivePath(k)).map(([k, x]) => [k, prune(x)]))
    : v);
  return JSON.stringify(prune(JSON.parse(s)), null, 1);
}

const filesOf = (dir) => new Set(fs.readdirSync(dir, { recursive: true }).map(String)
  .filter((f) => fs.statSync(path.join(dir, f)).isFile()).map((f) => f.split(path.sep).join('/')).filter((f) => !SKIPPED(f)));

// A page as three comparable parts: its words, its element tree, and its script and link tags as a sorted list.
function pageOf(html) {
  const tree = fromHtml(unhash(html));
  const assets = [];
  visit(tree, 'element', (el, i, parent) => {
    if (el.tagName === 'script' || el.tagName === 'link') {
      assets.push(toHtml(el));
      parent.children.splice(i, 1);
      return [SKIP, i];
    }
    for (const k of Object.keys(el.properties)) if (k.startsWith('dataAstroCid')) delete el.properties[k];
    if (Array.isArray(el.properties.className)) {
      el.properties.className = el.properties.className.filter((c) => !/^astro-[a-z0-9]{8}$/i.test(c));
    }
    if (el.tagName === 'pre' || el.tagName === 'textarea') return SKIP;
  });
  visit(tree, 'text', (t, i, parent) => {
    if (parent.tagName === 'pre' || parent.tagName === 'textarea') return;
    t.value = t.value.replace(/\s+/g, ' ');
    if (t.value === ' ' && parent.type === 'element' && !['p', 'span', 'a', 'li', 'b', 'i', 'em', 'strong'].includes(parent.tagName)) {
      parent.children.splice(i, 1);
      return [SKIP, i];
    }
  });
  return {
    text: toText(tree).replace(/\s+/g, ' ').trim(),
    markup: toHtml(tree),
    assets: assets.sort().join('\n'),
  };
}

// Where two strings first part, with a little context on each side.
function parting(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const near = (s) => JSON.stringify(s.slice(Math.max(0, i - 60), i + 80));
  return `\n    old: ${near(a)}\n    new: ${near(b)}`;
}

function compare(oldDir, newDir) {
  const [a, b] = [filesOf(oldDir), filesOf(newDir)];
  const out = [];
  for (const f of [...a].filter((f) => !b.has(f)).sort()) out.push(['REMOVED', f, '']);
  for (const f of [...b].filter((f) => !a.has(f)).sort()) out.push(['ADDED', f, '']);
  for (const f of [...a].filter((f) => b.has(f)).sort()) {
    const [pa, pb] = [path.join(oldDir, f), path.join(newDir, f)];
    if (!TEXTUAL.test(f)) {
      if (fs.statSync(pa).size !== fs.statSync(pb).size) out.push(['CHANGED', f, '']);
      continue;
    }
    const [sa, sb] = [fs.readFileSync(pa, 'utf8'), fs.readFileSync(pb, 'utf8')];
    if (sa === sb) continue;
    if (!f.endsWith('.html')) {
      const [ca, cb] = [unhash(withoutLive(f, sa)), unhash(withoutLive(f, sb))];
      if (ca !== cb) out.push(['CHANGED', f, parting(ca, cb)]);
      continue;
    }
    const [x, y] = [pageOf(sa), pageOf(sb)];
    if (x.text !== y.text) out.push(['TEXT', f, parting(x.text, y.text)]);
    else if (x.markup !== y.markup) out.push(['MARKUP', f, parting(x.markup, y.markup)]);
    if (x.assets !== y.assets) out.push(['ASSETS', f, parting(x.assets, y.assets)]);
  }
  return out;
}

const [oldDir, newDir] = process.argv.slice(2);
if (!oldDir || !newDir) throw new Error('usage: dist-diff.mjs <old-dist> <new-dist>');
const diffs = compare(path.resolve(oldDir), path.resolve(newDir));
for (const [kind, f, detail] of diffs) console.log(`${kind.padEnd(7)} ${f}${detail}`);
const counts = Object.entries(Object.groupBy(diffs, ([k]) => k)).map(([k, v]) => `${v.length} ${k}`).join(', ');
console.log(diffs.length ? counts : 'no differences');
process.exitCode = diffs.some(([k]) => k !== 'ASSETS') ? 1 : 0;
