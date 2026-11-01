// The frozen contracts of the built site (ARCHITECTURE.md), as pure checks: each takes a built file's contents and
// returns its problems. check(dist, listed) runs them all over a dist/ (verify-dist and npm test call it).
// `node scripts/build/contracts.mjs [dist]` checks a build; `--baseline` rewrites tests/baseline/urls.txt from it.
// Live notebooks (src/data/exempt.js) never fail a check here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { isLive, isLivePath } from '../../src/data/exempt.js';
import { isListed } from '../../src/data/listed.js';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SITE = 'https://aaronorelup.com';
export const BASELINE = path.join(ROOT, 'tests/baseline/urls.txt');
export const CONTRACT_FILES = ['/ledger/previews.json', '/media-sizes.json', '/rss.xml', '/stats-pages.txt', '/version.json'];

// The slugs of the posts readers can browse, from the content itself.
export function listedSlugs(postsDir = path.join(ROOT, 'src/content/posts')) {
  return new Set(fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
    .filter((f) => isListed(matter(fs.readFileSync(path.join(postsDir, f), 'utf8')).data))
    .map((f) => f.slice(0, -3)));
}

// A live notebook is left out of both sides: whatever its fleet pushes, it never fails a contract.
const sameSet = (what, got, want) => {
  const missing = [...want].filter((s) => !got.has(s) && !isLive(s));
  const extra = [...got].filter((s) => !want.has(s) && !isLive(s));
  return [...missing.map((s) => `${what}: ${s} is missing`), ...extra.map((s) => `${what}: ${s} should not be there`)];
};

// /ledger/previews.json = { posts: { slug: card } }, its keys exactly the listed posts.
export function previewsProblems(json, listed) {
  const posts = json?.posts;
  if (!posts || typeof posts !== 'object' || Array.isArray(posts)) return ['previews.json: no { posts: { … } } object'];
  const bad = Object.entries(posts).filter(([s, c]) => !isLive(s) && (typeof c?.id !== 'string' || typeof c?.title !== 'string'))
    .map(([s]) => `previews.json: the card for ${s} has no id or title`);
  return [...sameSet('previews.json', new Set(Object.keys(posts)), listed), ...bad];
}

// /stats-pages.txt names no unlisted post, and nothing under /ledger/<slug>/ but a listed post's notes page.
export function statsPagesProblems(text, listed) {
  const problems = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\/ledger\/([^/]+)\/(.*)$/);
    if (!m || isLive(m[1])) continue;
    const [, slug, rest] = m;
    if (!listed.has(slug)) problems.push(`stats-pages.txt: ${line} is not a listed post`);
    else if (rest && rest !== 'notes/') problems.push(`stats-pages.txt: ${line} is deeper than a post or its notes`);
  }
  return problems;
}

// Every RSS guid is https://aaronorelup.com/ledger/<slug>/, one per listed post.
export function rssProblems(xml, listed) {
  const guids = [...xml.matchAll(/<guid[^>]*>([^<]*)<\/guid>/g)].map((m) => m[1]);
  const slugs = new Set();
  const bad = [];
  for (const g of guids) {
    const m = g.match(/^https:\/\/aaronorelup\.com\/ledger\/([^/]+)\/$/);
    if (isLivePath(g)) continue;
    if (!m) bad.push(`rss.xml: guid ${g} is not ${SITE}/ledger/<slug>/`);
    else if (slugs.has(m[1])) bad.push(`rss.xml: ${m[1]} appears twice`);
    else slugs.add(m[1]);
  }
  return [...bad, ...sameSet('rss.xml', slugs, listed)];
}

// Every path of the baseline is still answered: built, or the source of a redirect. Live paths are left out.
export function baselineProblems(baseline, isBuilt, redirectSources) {
  return baseline.filter((p) => !isLivePath(p) && !isBuilt(p) && !redirectSources.has(p) && !redirectSources.has(p.replace(/\/$/, '')))
    .map((p) => `baseline: ${p} is neither built nor redirected`);
}

export const readBaseline = (file = BASELINE) =>
  fs.readFileSync(file, 'utf8').split('\n').filter((l) => l && !l.startsWith('#'));

const redirectSourcesOf = (text) => new Set(text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => l.split(/\s+/)[0]));

export function check(dist, listed = listedSlugs()) {
  const read = (p) => fs.readFileSync(path.join(dist, p), 'utf8');
  const isBuilt = (p) => fs.existsSync(path.join(dist, p.endsWith('/') ? p + 'index.html' : p));
  return [
    ...previewsProblems(JSON.parse(read('ledger/previews.json')), listed),
    ...statsPagesProblems(read('stats-pages.txt'), listed),
    ...rssProblems(read('rss.xml'), listed),
    ...baselineProblems(readBaseline(), isBuilt, redirectSourcesOf(read('_redirects'))),
  ];
}

// The baseline of a build: every page Astro builds (the lore course's per-entry pages excepted: the series repo
// publishes those), every page copied from public/ that a post links, iframes or plays, and the contract files.
// Pages from public/ that nothing links are left out, and so is every live path.
export function baselineOf(dist) {
  const pages = fs.readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith('index.html'))
    .map((f) => '/' + f.split(path.sep).join('/').replace(/index\.html$/, ''));
  const fromPublic = (p) => fs.existsSync(path.join(ROOT, 'public', p, 'index.html'));
  const linked = new Set();
  for (const p of pages.filter((p) => /^\/ledger\/[^/]+\/(notes\/)?$/.test(p) && !fromPublic(p))) {
    for (const m of fs.readFileSync(path.join(dist, p, 'index.html'), 'utf8').matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
      linked.add(m[1].endsWith('/') ? m[1] : m[1] + '/');
    }
  }
  const publisher = /^\/courses\/i-love-my-evening-television\/(characters|episodes|things)\/[^/]+\/$/;
  const keep = pages.filter((p) => (fromPublic(p) ? linked.has(p) : !publisher.test(p)));
  return [...keep, ...CONTRACT_FILES].filter((p) => !isLivePath(p)).sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const dist = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(ROOT, 'dist'));
  if (args.includes('--baseline')) {
    const lines = baselineOf(dist);
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, '# Every page and contract file of the pre-W0 build that must keep answering (scripts/build/contracts.mjs).\n' +
      '# Rewritten only by `node scripts/build/contracts.mjs --baseline`, never to make a check pass.\n' + lines.join('\n') + '\n');
    console.log(`wrote ${lines.length} paths to ${path.relative(ROOT, BASELINE)}`);
  } else {
    const problems = check(dist);
    for (const p of problems) console.error(p);
    console.log(problems.length ? `${problems.length} contract problems` : 'contracts hold');
    process.exitCode = problems.length ? 1 : 0;
  }
}
