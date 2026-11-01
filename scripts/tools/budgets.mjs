// Page-weight budgets (ARCHITECTURE.md section 6), gzipped, without fonts and media, each measured on something
// content can't grow. `node scripts/tools/budgets.mjs [dist]` prints them and, once ENFORCE is on (W4), fails on
// any over budget by 20%. verify-dist prints the same rows after every build and never fails on them.
// Live notebooks are left out. T1.2 adds the per-element rows, T2.4 read-aloud's.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { visit, SKIP } from 'unist-util-visit';
import { isLivePath } from '../../src/data/exempt.js';

export const ENFORCE = false;   // W4 sets true
const KB = 1024;
const PROSE = ['pc-prose', 'prose'];   // the post body's class: pc-prose until T2.1 names it prose

const gz = (text) => zlib.gzipSync(text).length;
const parse = (file) => fromHtml(fs.readFileSync(file, 'utf8'));

// The tree without every element the test picks out.
function without(tree, test) {
  visit(tree, 'element', (el, i, parent) => {
    if (!test(el)) return undefined;
    parent.children.splice(i, 1);
    return [SKIP, i];
  });
  return tree;
}

// The bytes a page loads up front: its local stylesheets, and its module scripts with their static imports.
function assets(dist, tree) {
  const css = new Set();
  const js = new Set();
  visit(tree, 'element', (el) => {
    const { href, src, rel = [] } = el.properties;
    if (el.tagName === 'link' && rel.includes('stylesheet') && href?.startsWith('/_astro/')) css.add(href);
    if (el.tagName === 'script' && src?.startsWith('/_astro/')) js.add(src);
  });
  for (const src of js) {
    const text = fs.readFileSync(path.join(dist, src), 'utf8');
    for (const m of text.matchAll(/(?:^|[;}\n])\s*(?:import|export)\s*(?:[\w*{}\s,$]*from\s*)?["'](\.\.?\/[^"']+)["']/g)) {
      js.add(path.posix.join(path.posix.dirname(src), m[1]));
    }
  }
  const bytes = (set) => [...set].reduce((n, f) => n + gz(fs.readFileSync(path.join(dist, f))), 0);
  return { css: bytes(css), js: bytes(js) };
}

export function measure(dist) {
  const rows = [];
  const row = (name, bytes, budget, where = '') => rows.push({ name, bytes, budget, where });

  const posts = fs.readdirSync(path.join(dist, 'ledger'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !isLivePath(`dist/ledger/${e.name}/`) && fs.existsSync(path.join(dist, 'ledger', e.name, 'index.html')))
    .map((e) => e.name);
  const worst = posts.map((slug) => {
    const tree = parse(path.join(dist, 'ledger', slug, 'index.html'));
    const { css, js } = assets(dist, tree);
    const html = gz(toHtml(without(tree, (el) => (el.properties.className ?? []).some((c) => PROSE.includes(c)))));
    return { slug, html, css, js, total: html + css + js };
  }).sort((a, b) => b.total - a.total)[0];
  row('post page minus its prose', worst.total, 20 * KB, worst.slug);
  row('  chrome HTML', worst.html, 4 * KB);
  row('  CSS', worst.css, 15 * KB);
  row('  JS up front', worst.js, 8 * KB);

  const ledger = parse(path.join(dist, 'ledger', 'index.html'));
  const isRow = (el) => el.properties.dataLedgerEntry !== undefined;
  let count = 0;
  visit(ledger, 'element', (el) => { count += isRow(el); });
  const full = gz(toHtml(ledger));
  const chrome = gz(toHtml(without(ledger, isRow)));
  row('/ledger/ chrome HTML', chrome, 6 * KB);
  row('/ledger/ per row', Math.round((full - chrome) / count), 220, `${count} rows`);

  const home = parse(path.join(dist, 'index.html'));
  const { css, js } = assets(dist, home);
  const html = gz(toHtml(home));
  row('homepage before the scene', html + css + js, 30 * KB);
  row('  HTML', html, 12 * KB);
  row('  entry JS', js, 12 * KB);
  return rows;
}

const size = (b) => (b < KB ? `${b} B` : `${(b / KB).toFixed(1)} KB`).padStart(8);
export const format = (rows) => rows.map(({ name, bytes, budget, where }) =>
  `${name.padEnd(28)} ${size(bytes)}  budget ${size(budget)}` +
  `${bytes > budget ? `  ${Math.round((bytes / budget - 1) * 100)}% over` : ''}${where ? `  (${where})` : ''}`).join('\n');

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = measure(path.resolve(process.argv[2] ?? 'dist'));
  console.log(format(rows));
  if (ENFORCE && rows.some((r) => r.bytes > r.budget * 1.2)) process.exit(1);
}
