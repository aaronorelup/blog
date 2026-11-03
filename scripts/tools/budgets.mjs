// Page-weight budgets (ARCHITECTURE.md section 6), gzipped, without fonts and media, each measured on something
// content can't grow. `node scripts/tools/budgets.mjs [dist]` prints them and fails on any over budget by 20%, as
// npm test does (tests/unit/budgets.test.mjs); verify-dist prints the same rows after every build and never fails.
// Live notebooks are left out. fontMisses() lists display code points the self-hosted fonts miss: the command fails
// on any, verify-dist warns.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { visit, SKIP } from 'unist-util-visit';
import { isLivePath } from '../../src/data/exempt.js';
import { misses, toRange } from './fonts.mjs';

const KB = 1024;
const PROSE = ['pc-prose', 'prose'];   // the post body's class: pc-prose until T2.1 names it prose

const gz = (text) => zlib.gzipSync(text).length;
// The rows more than 20% over their budget: what fails npm test and this command.
export const failing = (rows) => rows.filter((r) => r.bytes > r.budget * 1.2);
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

const bytes = (dist, set) => [...set].reduce((n, f) => n + gz(fs.readFileSync(path.join(dist, f))), 0);

// The scripts a load of `js` (a set of /_astro/ paths) runs: them and their static imports, all the way down. The
// minifier quotes a specifier with double quotes or backticks (Vite 8).
function closure(dist, js) {
  for (const src of js) {
    const text = fs.readFileSync(path.join(dist, src), 'utf8');
    for (const m of text.matchAll(/(?:^|[;}\n])\s*(?:import|export)\s*(?:[\w*{}\s,$]*from\s*)?["'`](\.\.?\/[^"'`]+)["'`]/g)) {
      js.add(path.posix.join(path.posix.dirname(src), m[1]));
    }
  }
  return js;
}

// The bytes a page loads up front: its local stylesheets, and its module scripts with their static imports, and its
// view's module (views/<data-panel-view>.js), which mountView imports as soon as the page has parsed.
function assets(dist, tree) {
  const css = new Set();
  const js = new Set();
  let view = null;
  visit(tree, 'element', (el) => {
    const { href, src, rel = [], dataPanelView } = el.properties;
    if (el.tagName === 'link' && rel.includes('stylesheet') && href?.startsWith('/_astro/')) css.add(href);
    if (el.tagName === 'script' && src?.startsWith('/_astro/')) js.add(src);
    view ??= dataPanelView ?? null;
  });
  closure(dist, js);
  const viewChunk = new RegExp(`"\\./${view}\\.js":\\(\\)=>[^"]*?import\\([\`"]\\./([^\`"]+)[\`"]\\)`);
  for (const src of view ? [...js] : []) {
    const m = fs.readFileSync(path.join(dist, src), 'utf8').match(viewChunk);
    if (m) closure(dist, js.add(path.posix.join(path.posix.dirname(src), m[1])));
  }
  return { css: bytes(dist, css), js: bytes(dist, js), scripts: js };
}

// What each post component adds on the posts that use it: the chunk the registry imports for its tag, with the
// chunks that one imports beyond the post's up-front JS, plus its CSS as ElementStyles inlines it (one minified
// sheet a line, in the post's sorted tag order; ao-demo's are its demos', which aren't measured here).
const ELEMENT_KB = { 'ao-series': 10, 'ao-game': 10 };   // every other element: 6
function elementWeights(dist, pages, upFront) {
  const js = {};
  for (const f of fs.readdirSync(path.join(dist, '_astro')).filter((n) => n.endsWith('.js'))) {
    const text = fs.readFileSync(path.join(dist, '_astro', f), 'utf8');
    for (const [, tag, chunk] of text.matchAll(/"\.\/(ao-[a-z0-9-]+)\/element\.js":\(\)=>[^"]*?import\([`"]\.\/([^`"]+)[`"]\)/g)) {
      const own = [...closure(dist, new Set([`/_astro/${chunk}`]))].filter((s) => !upFront.has(s));
      js[tag] = bytes(dist, own);
    }
  }
  const css = {};
  for (const tree of pages) {
    const keys = new Set();
    let sheets = null;
    visit(tree, 'element', (el) => {
      if (el.tagName.startsWith('ao-')) keys.add(el.tagName === 'ao-demo' ? `ao-demo/${el.properties.name}` : el.tagName);
      if (el.tagName === 'style' && el.properties.dataAo !== undefined) sheets = el.children[0].value.split('\n');
    });
    const tags = [...keys].sort();
    if (sheets?.length === tags.length) tags.forEach((t, i) => { css[t] = gz(sheets[i]); });
  }
  return Object.keys(js).map((tag) => ({ tag, bytes: js[tag] + (css[tag] ?? 0), budget: (ELEMENT_KB[tag] ?? 6) * KB }));
}

export function measure(dist) {
  const rows = [];
  const row = (name, bytes, budget, where = '') => rows.push({ name, bytes, budget, where });

  const posts = fs.readdirSync(path.join(dist, 'ledger'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !isLivePath(`dist/ledger/${e.name}/`) && fs.existsSync(path.join(dist, 'ledger', e.name, 'index.html')))
    .map((e) => e.name);
  const pages = [];
  const upFront = new Set();
  const worst = posts.map((slug) => {
    const tree = parse(path.join(dist, 'ledger', slug, 'index.html'));
    pages.push(structuredClone(tree));
    const { css, js, scripts } = assets(dist, tree);
    for (const s of scripts) upFront.add(s);
    // The post's components' CSS, inlined in the article, is theirs (the element row), not the page's chrome.
    const html = gz(toHtml(without(tree, (el) => (el.properties.className ?? []).some((c) => PROSE.includes(c))
      || (el.tagName === 'style' && el.properties.dataAo !== undefined))));
    return { slug, html, css, js, total: html + css + js };
  }).sort((a, b) => b.total - a.total)[0];
  row('post page minus its prose', worst.total, 20 * KB, worst.slug);
  row('  chrome HTML', worst.html, 4 * KB);
  row('  CSS', worst.css, 15 * KB);
  row('  JS up front', worst.js, 8 * KB);
  const element = elementWeights(dist, pages, upFront).sort((a, b) => b.bytes / b.budget - a.bytes / a.budget)[0];
  if (element) row('an element, JS + CSS', element.bytes, element.budget, `${element.tag}, the nearest its budget`);
  // What Listen loads: the chunk that marks the word read (the ao-read highlight) and its imports beyond the up-front JS.
  const marks = (f) => /highlights\.set\([`"]ao-read[`"]/.test(fs.readFileSync(path.join(dist, '_astro', f), 'utf8'));
  const reader = fs.readdirSync(path.join(dist, '_astro')).find((f) => f.endsWith('.js') && marks(f));
  const listen = [...closure(dist, new Set([`/_astro/${reader}`]))].filter((s) => !upFront.has(s));
  row('read-aloud on, JS', bytes(dist, listen), 8 * KB);

  const ledger = parse(path.join(dist, 'ledger', 'index.html'));
  // A row is the ledger's li.row, which holds its data-ledger-entry link; Start here and the rest are chrome.
  const isRow = (el) => (el.properties.className ?? []).includes('row');
  let count = 0;
  visit(ledger, 'element', (el) => (isRow(el) ? (count += 1, SKIP) : undefined));
  const full = gz(toHtml(ledger));
  const chrome = gz(toHtml(without(ledger, isRow)));
  row('/ledger/ chrome HTML', chrome, 6 * KB);
  // 360 B, not section 6's 220: since T2.2 each row carries its card (verdict, takeaway, points) for phones. Its text
  // alone gzips to 302 B a row in the page, its markup adds about 50, and a row without the card is 132.
  row('/ledger/ per row', Math.round((full - chrome) / count), 360, `${count} rows`);

  const home = parse(path.join(dist, 'index.html'));
  const { css, js } = assets(dist, home);
  const html = gz(toHtml(home));
  row('homepage before the scene', html + css + js, 30 * KB);
  row('  HTML', html, 12 * KB);
  row('  entry JS', js, 12 * KB);
  return rows;
}

// One line naming the code points the fonts miss, or '' when there are none.
export function fontMisses(dist) {
  const cps = misses(dist);
  return cps.length ? `${cps.length} display code points the self-hosted fonts miss: ${toRange(cps)} ` +
    '(run node scripts/tools/fonts.mjs)' : '';
}

const size = (b) => (b < KB ? `${b} B` : `${(b / KB).toFixed(1)} KB`).padStart(8);
export const format = (rows) => rows.map(({ name, bytes, budget, where }) =>
  `${name.padEnd(28)} ${size(bytes)}  budget ${size(budget)}` +
  `${bytes > budget ? `  ${Math.round((bytes / budget - 1) * 100)}% over` : ''}${where ? `  (${where})` : ''}`).join('\n');

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dist = path.resolve(process.argv[2] ?? 'dist');
  const rows = measure(dist);
  const fonts = fontMisses(dist);
  console.log(format(rows) + (fonts ? `\n${fonts}` : ''));
  if (fonts || failing(rows).length) process.exit(1);
}
