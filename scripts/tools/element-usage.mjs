// Every post component, media block and standalone page the built site uses, read as HTML trees (prose that
// merely mentions `<ao-cues>` doesn't count). `node scripts/tools/element-usage.mjs [dist]` scans posts, notes
// and every page from public/, writes tests/e2e/targets.json (the e2e specs read it) and fails on a defined tag
// with no instance. `--diff <old> <new...>` (all .md, or all built .html) fails on any ao-*, video, audio or
// iframe block of the old post that the new files don't carry byte for byte, and shows where an edited one parts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { find, html as schema } from 'property-information';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import { visitParents } from 'unist-util-visit-parents';
import { isLivePath } from '../../src/data/exempt.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (...p) => path.join(ROOT, ...p);
const TARGETS = at('tests/e2e/targets.json');
const SITE = 'https://aaronorelup.com';
const BLOCKS = new Set(['video', 'audio', 'iframe']);

const filesUnder = (dir, test) => fs.readdirSync(dir, { recursive: true }).map(String)
  .filter((f) => test(f)).map((f) => path.join(dir, f)).sort();

// The tags the site defines: one customElements.define per tag, wherever the module sits.
function definedTags() {
  const tags = new Set();
  for (const f of filesUnder(at('src'), (f) => f.endsWith('.js'))) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/customElements\.define\(\s*['"](ao-[a-z0-9-]+)['"]/g)) tags.add(m[1]);
  }
  return [...tags].sort();
}

const attrsOf = (el) => Object.fromEntries(Object.entries(el.properties).map(([k, v]) =>
  [find(schema, k).attribute, Array.isArray(v) ? v.join(' ') : v === true ? '' : String(v)]));

const findArticle = (tree) => {
  let found = null;
  visit(tree, 'element', (el) => {
    if (el.properties.dataPostArticle !== undefined) { found = el; return false; }
  });
  return found;
};

// A built HTML page's URL path, and what it is: a post, its notes, or a page copied from public/.
function pageOf(dist, file) {
  const rel = path.relative(dist, file).split(path.sep).join('/');
  const url = '/' + rel.replace(/(^|\/)index\.html$/, '$1');
  if (fs.existsSync(at('public', rel))) return { url, kind: 'public' };
  const m = url.match(/^\/ledger\/([^/]+)\/(notes\/)?$/);
  if (m && fs.existsSync(at('src/content/posts', m[1] + '.md'))) return { url, kind: m[2] ? 'notes' : 'post' };
  return null;
}

// The public/ page a same-origin href lands on, or null.
function publicPageOf(href, base) {
  const u = new URL(href, SITE + base);
  if (u.origin !== SITE) return null;
  const p = decodeURIComponent(u.pathname);
  const file = p.endsWith('/') ? p + 'index.html' : p.endsWith('.html') ? p : p + '/index.html';
  if (!fs.existsSync(at('public', file))) return null;
  return { path: p.endsWith('.html') || p.endsWith('/') ? p : p + '/', href: u.pathname + u.search };
}

// The post a same-origin href opens (/ledger/<slug>/), or null.
function postOf(href, base) {
  if (!href) return null;
  const u = new URL(href, SITE + base);
  const m = u.origin === SITE && u.pathname.match(/^\/ledger\/([^/]+)\/?$/);
  return m && fs.existsSync(at('src/content/posts', m[1] + '.md')) ? `/ledger/${m[1]}/` : null;
}

function scan(dist) {
  const tags = Object.fromEntries(definedTags().map((t) => [t, []]));
  const pages = {};
  const standalone = {};
  for (const file of filesUnder(dist, (f) => f.endsWith('.html'))) {
    const page = pageOf(dist, file);
    if (!page) continue;
    const tree = fromHtml(fs.readFileSync(file, 'utf8'));
    const root = page.kind === 'public' ? tree : findArticle(tree) || tree;
    const live = isLivePath(page.url);
    const info = { kind: page.kind, live, ao: {}, video: 0, audio: 0, lone: 0, iframe: 0, dataFull: 0, posts: [] };
    const link = (href, via) => {
      const target = page.kind !== 'public' && href && publicPageOf(href, page.url);
      if (!target) return;
      const s = (standalone[target.path] ||= { live: isLivePath(target.path), hrefs: new Set(), from: new Set(), via: new Set() });
      s.hrefs.add(target.href); s.from.add(page.url); s.via.add(via);
    };
    visitParents(root, 'element', (el, parents) => {
      const name = el.tagName;
      if ((name === 'video' || name === 'audio') && !parents.some((p) => p.tagName?.startsWith('ao-'))) info.lone++;
      if (name.startsWith('ao-')) {
        info.ao[name] = (info.ao[name] || 0) + 1;
        (tags[name] ||= []).push({ page: page.url, live, attrs: attrsOf(el) });
        if (name === 'ao-game') link(el.properties.src, 'ao-game');
      }
      if (BLOCKS.has(name)) info[name]++;
      if (name === 'iframe') link(el.properties.src, 'iframe');
      if (name === 'img' && el.properties.dataFull !== undefined) info.dataFull++;
      if (name === 'a') {
        link(el.properties.href, 'a');
        const other = page.kind !== 'public' && postOf(el.properties.href, page.url);
        if (other && other !== page.url && !info.posts.includes(other)) info.posts.push(other);
      }
    });
    if (Object.keys(info.ao).length || info.video || info.audio || info.iframe || info.dataFull || info.posts.length) {
      pages[page.url] = info;
    }
  }
  const sets = (o) => Object.fromEntries(Object.entries(o).sort().map(([k, v]) =>
    [k, { live: v.live, hrefs: [...v.hrefs].sort(), from: [...v.from].sort(), via: [...v.via].sort() }]));
  const list = (test) => Object.keys(pages).filter((p) => test(pages[p]));
  return {
    tags,
    pages,
    multiMedia: list((p) => p.video + p.audio > 1),
    iframes: list((p) => p.iframe > 0),
    dataFull: list((p) => p.dataFull > 0),
    standalone: sets(standalone),
  };
}

function runScan(dist) {
  const targets = scan(dist);
  fs.mkdirSync(path.dirname(TARGETS), { recursive: true });
  fs.writeFileSync(TARGETS, JSON.stringify(targets, null, 2) + '\n');
  const empty = [];
  for (const [tag, uses] of Object.entries(targets.tags)) {
    const pages = new Set(uses.map((u) => u.page));
    if (!uses.length) empty.push(tag);
    console.log(`${tag.padEnd(14)} ${String(uses.length).padStart(3)} on ${pages.size} page(s)`);
  }
  console.log(`${targets.multiMedia.length} pages with several videos or audio, ${targets.iframes.length} with iframes, ` +
    `${targets.dataFull.length} with data-full pictures, ${Object.keys(targets.standalone).length} standalone pages linked`);
  console.log(`wrote ${path.relative(ROOT, TARGETS)}`);
  if (empty.length) {
    console.error(`no instance of: ${empty.join(', ')}`);
    process.exitCode = 1;
  }
}

// Every ao-*, video, audio and iframe block of a file, outermost only, serialised as written.
function blocksOf(file) {
  const src = fs.readFileSync(file, 'utf8');
  let tree;
  if (file.endsWith('.md')) {
    const md = unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeRaw);
    tree = md.runSync(md.parse(matter(src).content));
  } else {
    const doc = fromHtml(src);
    tree = findArticle(doc) || doc;
  }
  const out = [];
  visit(tree, 'element', (el) => {
    if (!el.tagName.startsWith('ao-') && !BLOCKS.has(el.tagName)) return;
    out.push(toHtml(el));
    return SKIP;
  });
  return out;
}

function runDiff(oldFile, newFiles) {
  const pool = new Map();
  for (const b of newFiles.flatMap(blocksOf)) pool.set(b, (pool.get(b) || 0) + 1);
  const old = blocksOf(oldFile);
  const missing = old.filter((b) => {
    const n = pool.get(b) || 0;
    if (n) pool.set(b, n - 1);
    return !n;
  });
  const added = [...pool].flatMap(([b, n]) => Array(n).fill(b));
  const head = (b) => b.split('\n')[0].slice(0, 160);
  const startTag = (b) => b.slice(0, b.indexOf('>') + 1);
  console.log(`${oldFile}: ${old.length} blocks, ${missing.length} missing from ${newFiles.join(' + ')}`);
  for (const b of missing) {
    // A new block that opens the same way is this one edited: show where the two first part.
    const i = added.findIndex((a) => startTag(a) === startTag(b));
    if (i < 0) { console.log(`  MISSING ${head(b)}`); continue; }
    const [a] = added.splice(i, 1);
    let at = 0;
    while (a[at] === b[at]) at++;
    const near = (s) => JSON.stringify(s.slice(Math.max(0, at - 40), at + 60));
    console.log(`  CHANGED ${head(b)}\n    old: ${near(b)}\n    new: ${near(a)}`);
  }
  for (const b of added) console.log(`  added   ${head(b)}`);
  if (missing.length) process.exitCode = 1;
}

const args = process.argv.slice(2);
if (args[0] === '--diff') {
  if (args.length < 3) throw new Error('usage: element-usage.mjs --diff <old> <new...>');
  runDiff(args[1], args.slice(2));
} else {
  runScan(path.resolve(args[0] || at('dist')));
}
