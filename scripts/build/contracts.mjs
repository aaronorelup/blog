// The frozen contracts of the built site (ARCHITECTURE.md), as pure checks: each takes a built file's contents and
// returns its problems. check(dist, listed) runs them all over a dist/ (verify-dist and npm test call it).
// `node scripts/build/contracts.mjs [dist]` checks a build; `--baseline` rewrites tests/baseline/urls.txt from it.
// Live notebooks (src/data/exempt.js) never fail a check here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import matter from 'gray-matter';
import { isLive, isLivePath } from '../../src/data/exempt.js';
import { OG } from '../../src/data/limits.js';
import { OWNER } from '../../src/data/site.js';
import { isListed } from '../../src/lib/posts.js';

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

// The slugs of the posts Claude wrote as "I" (voice: claude): their pages say "Written by Claude".
export function claudeSlugs(postsDir = path.join(ROOT, 'src/content/posts')) {
  return new Set(fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
    .filter((f) => matter(fs.readFileSync(path.join(postsDir, f), 'utf8')).data.voice === 'claude')
    .map((f) => f.slice(0, -3)));
}

// The posts whose notes page Claude wrote as "I" (a note's own voice: claude), keyed by the note's post. A note's
// voice may differ from its post's (AO-067's notes are Claude's), and its page's byline follows the note.
export function claudeNotes(notesDir = path.join(ROOT, 'src/content/notes')) {
  return new Set(fs.readdirSync(notesDir).filter((f) => f.endsWith('.md'))
    .map((f) => matter(fs.readFileSync(path.join(notesDir, f), 'utf8')).data)
    .filter((d) => d.voice === 'claude' && d.post).map((d) => d.post));
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

// The <link> and <meta> tags of a page's head, and one attribute of a tag.
const headTags = (html) => {
  const end = html.indexOf('</head>');
  return (end < 0 ? html : html.slice(0, end)).match(/<(?:link|meta)\b[^>]*>/g) || [];
};
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

// A page names its own address once as <link rel="canonical"> and once as og:url (chrome/Head.astro), and both are
// https://aaronorelup.com<pathname>: what a search engine indexes and what a shared link counts against.
export function shareUrlProblems(html, pathname) {
  const tags = headTags(html);
  const want = SITE + pathname;
  return [
    ['canonical', tags.filter((t) => attr(t, 'rel') === 'canonical').map((t) => attr(t, 'href'))],
    ['og:url', tags.filter((t) => attr(t, 'property') === 'og:url').map((t) => attr(t, 'content'))],
  ].filter(([, got]) => got.length !== 1 || got[0] !== want)
    .map(([what, got]) => `${pathname}: ${what} is ${got.length ? got.join(', ') : 'missing'}, not ${want}`);
}

// The type and pixel size of a JPEG or PNG, from its bytes: { type, width, height }, or null for anything else.
export function imageSize(buf) {
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) return { type: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  for (let i = 2; i + 9 <= buf.length && buf[i] === 0xff;) {
    const m = buf[i + 1];
    if (m === 0xff) i += 1;                                           // a fill byte
    else if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {   // a frame header
      return { type: 'jpeg', width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    } else if (m === 0x01 || (m >= 0xd0 && m <= 0xd8)) i += 2;        // a marker with no length
    else i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

// What X asks of a summary_large_image picture: no smaller than 300 by 157, no larger than 4096 by 4096.
const X_CARD = { min: [300, 157], max: [4096, 4096] };

// A page that shares a picture shares one that works (chrome/Head.astro): its og:image is there once, a JPEG or PNG of
// this build at https://aaronorelup.com/<path>, and the page has one twitter:card, summary_large_image. A card the
// build draws or keeps (/og/…) is a JPEG, exactly OG.width by OG.height; any other picture is a size X shows large.
// A page with no og:image passes: which pages share a picture is not a contract. sizeOf(path) → { type, width,
// height }, or null: no such JPEG or PNG in the build.
export function shareImageProblems(html, pathname, sizeOf) {
  const tags = headTags(html);
  const images = tags.filter((t) => attr(t, 'property') === 'og:image').map((t) => attr(t, 'content'));
  if (!images.length) return [];
  const cards = tags.filter((t) => attr(t, 'name') === 'twitter:card').map((t) => attr(t, 'content'));
  const problems = [];
  if (cards.length !== 1 || cards[0] !== 'summary_large_image') {
    problems.push(`${pathname}: it has an og:image, and its twitter:card is ${cards.length ? cards.join(', ') : 'missing'}, not summary_large_image`);
  }
  if (images.length !== 1) return [...problems, `${pathname}: og:image is there ${images.length} times`];
  const [image] = images;
  if (!image.startsWith(SITE + '/')) return [...problems, `${pathname}: og:image ${image} is not under ${SITE}/`];
  const file = decodeURIComponent(new URL(image).pathname);
  const size = sizeOf(file);
  if (!size) return [...problems, `${pathname}: og:image ${file} is not a JPEG or PNG of this build`];
  const { type, width: w, height: h } = size;
  const card = file.startsWith('/og/');
  if (card && type !== 'jpeg') problems.push(`${pathname}: og:image ${file} is a ${type}, not a JPEG`);
  if (card ? w !== OG.width || h !== OG.height
    : w < X_CARD.min[0] || h < X_CARD.min[1] || w > X_CARD.max[0] || h > X_CARD.max[1]) {
    problems.push(`${pathname}: og:image ${file} is ${w}×${h}` + (card ? `, not ${OG.width}×${OG.height}`
      : `, outside ${X_CARD.min.join('×')} to ${X_CARD.max.join('×')}`));
  }
  return problems;
}

// A listed page carries exactly one JSON-LD block (chrome/Head.astro, lib/jsonld.js): it parses into an @graph whose
// node of the given type (a post's BlogPosting, a notes page's Article, /about/'s ProfilePage) has the page's canonical,
// https://aaronorelup.com<pathname>, as url, beside the owner's Person with his profiles (sameAs). Its byline never
// contradicts the page: the owner publishes every post, and is its author except on one Claude wrote (byClaude; the
// page says "Written by Claude"), which names none. Every {@id} it refers to is in the graph, but for the WebSite
// (the homepage's) and the post a notes page is part of.
const PERSON = SITE + OWNER.about + '#person';
const refsOf = (v) => (Array.isArray(v) ? v.flatMap(refsOf) : v && typeof v === 'object'
  ? (Object.keys(v).length === 1 && typeof v['@id'] === 'string' ? [v['@id']] : Object.values(v).flatMap(refsOf)) : []);
export function jsonLdProblems(html, pathname, byClaude = false, type = 'BlogPosting') {
  const blocks = [...html.matchAll(/<script\b[^>]*\stype="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length !== 1) return [`${pathname}: ${blocks.length} JSON-LD blocks, not 1`];
  const want = SITE + pathname;
  let data;
  try { data = JSON.parse(blocks[0]); } catch (e) { return [`${pathname}: its JSON-LD block does not parse (${e.message})`]; }
  const graph = Array.isArray(data?.['@graph']) ? data['@graph'] : [];
  const node = graph.find((n) => n?.['@type'] === type);
  if (!node) return [`${pathname}: its JSON-LD has no @graph with a ${type}`];
  const problems = node.url === want ? [] : [`${pathname}: its JSON-LD url is ${node.url ?? 'missing'}, not ${want}`];
  const person = graph.find((n) => n?.['@type'] === 'Person' && n['@id'] === PERSON);
  if (person?.name !== OWNER.name || !person.sameAs?.length) problems.push(`${pathname}: its JSON-LD has no Person ${PERSON} with sameAs`);
  const owner = { '@type': 'Person', '@id': PERSON, name: OWNER.name, url: SITE + OWNER.about };
  if (type === 'ProfilePage') {
    if (node.mainEntity?.['@id'] !== PERSON) problems.push(`${pathname}: its ProfilePage is not about ${PERSON}`);
  } else {
    if (node.publisher?.['@id'] !== PERSON) problems.push(`${pathname}: its JSON-LD publisher is not ${PERSON}`);
    if (byClaude && node.author !== undefined) problems.push(`${pathname}: Claude wrote it, but its JSON-LD names an author`);
    if (!byClaude && !isDeepStrictEqual(node.author, owner)) {
      problems.push(`${pathname}: its JSON-LD author is ${JSON.stringify(node.author) ?? 'missing'}, not ${JSON.stringify(owner)}`);
    }
  }
  const known = new Set([...graph.map((n) => n?.['@id']), SITE + '/#website', type === 'Article' ? want.replace(/notes\/$/, '') : null]);
  for (const id of refsOf(graph).filter((id) => !known.has(id))) problems.push(`${pathname}: its JSON-LD refers to ${id}, which it never names`);
  return problems;
}

// The agent layer (src/lib/agent-text.js): /llms.txt and /llms-full.txt name no post outside `listed` but a live
// notebook, and no unlisted slug at all; every link of /llms.txt is built (an /api/ route aside); no unlisted post or
// live notebook has a Markdown twin. files: { llms, full, twins: ['<slug>.md', '<slug>/notes.md', …], unlisted }.
export function agentFilesProblems({ llms, full, twins = [], unlisted = new Set() }, listed, isBuilt) {
  const problems = new Set();
  for (const [name, text] of [['llms.txt', llms], ['llms-full.txt', full]]) {
    if (typeof text !== 'string') { problems.add(`${name}: it was not built`); continue; }
    for (const [, slug] of text.matchAll(/\/ledger\/([a-z0-9][a-z0-9-]*)(?=\/|\.md\b|#|\)|\s|$)/g)) {
      if (!listed.has(slug) && !isLive(slug)) problems.add(`${name}: names /ledger/${slug}, not a listed post`);
    }
    for (const slug of unlisted) if (text.includes(slug)) problems.add(`${name}: names the unlisted ${slug}`);
  }
  for (const [, p] of (llms ?? '').matchAll(/https:\/\/aaronorelup\.com(\/[^\s)<>"'#?]*)/g)) {
    if (!p.startsWith('/api/') && !isBuilt(p)) problems.add(`llms.txt: links ${p}, which is not built`);
  }
  for (const rel of twins) {
    const slug = rel.replace(/(\/notes)?\.md$/, '');
    if (!listed.has(slug) || isLive(slug)) problems.add(`/ledger/${rel}: a Markdown twin of no listed post`);
  }
  return [...problems];
}

// The note for agents (components/chrome/AgentNote.astro) names only paths the build has (an /api/ route aside). A page
// without one passes.
export function agentNoteProblems(html, pathname, isBuilt) {
  const note = html.match(/<div class="ao-agent" aria-hidden="true"(?: data-nosnippet)?>([^<]*)<\/div>/);
  if (!note) return [];
  return [...note[1].matchAll(/(?:^|\s)(\/[^\s<&]*)/g)].map((m) => m[1].replace(/[.,:;)]+$/, ''))
    .filter((p) => !p.startsWith('/api/') && !isBuilt(p)).map((p) => `${pathname}: its note for agents names ${p}, which is not built`);
}

// The pages the sitemap lists, as paths: the pages whose share pictures check() looks at.
export const sitemapPaths = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1])
  .filter((loc) => loc.startsWith(SITE + '/')).map((loc) => loc.slice(SITE.length));

// Every path of the baseline is still answered: built, or the source of a redirect. Live paths are left out.
export function baselineProblems(baseline, isBuilt, redirectSources) {
  return baseline.filter((p) => !isLivePath(p) && !isBuilt(p) && !redirectSources.has(p) && !redirectSources.has(p.replace(/\/$/, '')))
    .map((p) => `baseline: ${p} is neither built nor redirected`);
}

export const readBaseline = (file = BASELINE) =>
  fs.readFileSync(file, 'utf8').split('\n').filter((l) => l && !l.startsWith('#'));

const redirectSourcesOf = (text) => new Set(text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => l.split(/\s+/)[0]));

export function check(dist, listed = listedSlugs(), byClaude = claudeSlugs(), notesByClaude = claudeNotes()) {
  const read = (p) => fs.readFileSync(path.join(dist, p), 'utf8');
  const isBuilt = (p) => fs.existsSync(path.join(dist, p.endsWith('/') ? p + 'index.html' : p));
  const sizeOf = (p) => {
    const file = path.join(dist, p);
    return file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile() ? imageSize(fs.readFileSync(file)) : null;
  };
  const maybe = (p) => (fs.existsSync(path.join(dist, p)) ? read(p) : undefined);
  const ledger = fs.readdirSync(path.join(dist, 'ledger'), { withFileTypes: true });
  const twins = [...ledger.filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => e.name),
    ...ledger.filter((e) => e.isDirectory() && fs.existsSync(path.join(dist, 'ledger', e.name, 'notes.md'))).map((e) => `${e.name}/notes.md`)];
  const unlisted = new Set(ledger.filter((e) => e.isDirectory() && !listed.has(e.name) && !isLive(e.name)
    && fs.existsSync(path.join(dist, 'ledger', e.name, 'index.html'))).map((e) => e.name));
  const notePages = [...new Set(['/', '/ledger/', '/stats/', ...sitemapPaths(read('sitemap.xml'))])]
    .filter((p) => p.endsWith('/') && !isLivePath(p) && isBuilt(p));
  return [
    ...agentFilesProblems({ llms: maybe('llms.txt'), full: maybe('llms-full.txt'), twins, unlisted }, listed, isBuilt),
    ...notePages.flatMap((p) => agentNoteProblems(read(`${p.slice(1)}index.html`), p, isBuilt)),
    ...previewsProblems(JSON.parse(read('ledger/previews.json')), listed),
    ...statsPagesProblems(read('stats-pages.txt'), listed),
    ...rssProblems(read('rss.xml'), listed),
    ...[...listed].filter((s) => !isLive(s) && isBuilt(`/ledger/${s}/`))
      .map((s) => [read(`ledger/${s}/index.html`), `/ledger/${s}/`, byClaude.has(s)])
      .flatMap(([html, pathname, claude]) => [...shareUrlProblems(html, pathname), ...jsonLdProblems(html, pathname, claude)]),
    ...[...listed].filter((s) => !isLive(s) && isBuilt(`/ledger/${s}/notes/`))
      .flatMap((s) => jsonLdProblems(read(`ledger/${s}/notes/index.html`), `/ledger/${s}/notes/`, notesByClaude.has(s), 'Article')),
    ...jsonLdProblems(read('about/index.html'), '/about/', false, 'ProfilePage'),
    // Not the course pages: other repos write their data (CLAUDE.md), and a picture of theirs must never stop a deploy.
    ...sitemapPaths(read('sitemap.xml'))
      .filter((p) => p.endsWith('/') && !isLivePath(p) && !p.startsWith('/courses/') && isBuilt(p))
      .flatMap((p) => shareImageProblems(read(`${p.slice(1)}index.html`), p, sizeOf)),
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
