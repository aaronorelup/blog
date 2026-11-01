// The lore hidden pages (in-world pages an episode points to for a few frames) and their list, src/data/hidden-pages.json,
// which the hub post renders. A page says it is one with <meta name="ao:hidden" content="lore">. Every marked page under
// public/ is listed and every entry is a marked page with the robots noindex line, so the hub can't fall behind; a model
// copy (scripts/tools/hidden-models.mjs) keeps noindex and drops the lab's line. The entries' text gets the voice rules.
import { hits } from './prose.mjs';
import { liner } from './text.mjs';

export const FILE = 'src/data/hidden-pages.json';
export const MARK = /<meta\s+name=["']ao:hidden["']\s+content=["']lore["']\s*\/?>/i;
const ROBOTS = /<meta\s+name=["']robots["']\s+content=["'][^"']*\bnoindex\b[^"']*["']/i;
const ADDRESS = /^\/[a-z0-9][a-z0-9/_-]*\/$/;
const STATUS = new Set(['attached', 'not yet attached']);
const REQUIRED = ['title', 'episode', 'page', 'story'];
const FIX = 'node scripts/tools/hidden-models.mjs';

const urlOf = (file) => file.slice('public'.length).replace(/index\.html$/, '');

// The problems of one listed page's files: its page, and its model copy when it has one.
function fileProblems(repo, { address, model }) {
  const out = [];
  const page = `public${address}index.html`;
  if (!repo.exists(page)) return [`there is no ${page}`];
  const html = repo.read(page);
  if (!MARK.test(html)) out.push(`${page} has no <meta name="ao:hidden" content="lore">`);
  if (!ROBOTS.test(html)) out.push(`${page} has no robots noindex line`);
  if (model) {
    const copy = `public${address}model/index.html`;
    if (!repo.exists(copy)) return [...out, `no model copy at ${copy}: ${FIX}`];
    const m = repo.read(copy);
    if (!ROBOTS.test(m)) out.push(`${copy} has no robots noindex line: ${FIX}`);
    if (/not canon/i.test(m)) out.push(`${copy} still carries the lab's "not canon" line: ${FIX}`);
  }
  return out;
}

// The problems of one entry's fields.
function entryProblems(p) {
  const out = REQUIRED.filter((k) => typeof p[k] !== 'string' || !p[k].trim()).map((k) => `no ${k}`);
  if (!STATUS.has(p.status)) out.push(`status is "attached" or "not yet attached", not "${p.status}"`);
  const pinned = typeof p.attached?.at === 'string' && typeof p.attached?.how === 'string';
  if (p.status === 'attached' && !pinned) out.push('attached, so it needs attached.at (the timecode) and attached.how (what shows the address)');
  if (p.status === 'not yet attached' && p.attached) out.push('not yet attached, so attached must be null');
  return out;
}

export default function hidden(repo, report) {
  const marked = new Map(repo.list('public', (f) => f.endsWith('.html'))
    .filter((f) => MARK.test(repo.read(f))).map((f) => [urlOf(f), f]));
  if (!repo.exists(FILE)) {
    for (const f of marked.values()) report(f, null, `a lore hidden page, but there is no ${FILE} to list it in`, 'deploy');
    return;
  }
  const raw = repo.read(FILE);
  let pages;
  try {
    ({ pages } = JSON.parse(raw));
  } catch (error) {
    report(FILE, null, `does not parse: ${error.message}`, 'deploy');
    return;
  }
  if (!Array.isArray(pages)) {
    report(FILE, null, 'no "pages" list', 'deploy');
    return;
  }

  const line = liner(raw);
  const listed = new Set();
  for (const p of pages) {
    const i = raw.indexOf(`"address": ${JSON.stringify(p.address)}`);
    const where = i < 0 ? null : line(i);
    const say = (message, level = 'deploy') => report(FILE, where, `${p.address ?? '(no address)'}: ${message}`, level);
    if (typeof p.address !== 'string' || !ADDRESS.test(p.address)) {
      say('the address must be a site path ending in /');
      continue;
    }
    if (listed.has(p.address)) say('listed twice');
    listed.add(p.address);
    for (const problem of [...entryProblems(p), ...fileProblems(repo, p)]) say(problem);
    for (const text of [p.title, p.page, p.story, p.attached?.how].filter((t) => typeof t === 'string')) {
      for (const what of hits(text).keys()) say(`${what} (WRITING.md: the hub post shows this text)`, 'check');
    }
  }

  for (const [url, f] of marked) {
    if (!listed.has(url)) report(f, null, `a lore hidden page that ${FILE} doesn't list: add it, so the hub shows it`, 'deploy');
  }
  const roots = [...marked.keys()];
  for (const f of repo.list('public/ledger', (x) => x.endsWith('index.html'))) {
    if (!roots.some((r) => urlOf(f).startsWith(r))) {
      report(f, null, `a page under public/ledger/ with no ao:hidden marker: if an episode points to it (or will), mark it and list it in ${FILE}`, 'warn');
    }
  }
}
