// The agent layer's text, as pure functions over post, card, note, research, course and project values: /llms.txt,
// /llms-full.txt, the Markdown twins /ledger/<slug>.md and /ledger/<slug>/notes.md, and the note for agents each page
// carries (components/chrome/AgentNote.astro). Only a listed post that is no live notebook has a twin (twinPosts); a
// live notebook gives its title, address and summary only, and an unlisted post or a draft appears nowhere here.
import { isLive } from '../data/exempt.js';
import { PROJECTS, TOPICS } from '../data/taxonomy.js';
import { isoDay } from './dates.js';
import { isListed, ledgerOrder } from './posts.js';

export const SITE = 'https://aaronorelup.com';
const byOf = (voice) => (voice === 'claude' ? 'Claude' : 'Aaron');
const end = (text) => text.replace(/\s*$/, '\n');

// The posts that get a twin, in ledger order, and the notes whose post does.
export const twinPosts = (posts) => ledgerOrder(posts.filter((p) => isListed(p.data) && !isLive(p.id)));
export const twinNotes = (posts, notes) => twinPosts(posts).filter((p) => notes.has(p.id)).map((p) => [p, notes.get(p.id)]);

export const stripComments = (md) => md.replace(/<!--[\s\S]*?-->[ \t]*\n?/g, '');
// Root-relative links and media (href, src, poster, data-url and Markdown's ](/…)) become absolute; //host is left.
export const absolutize = (md) => md
  .replace(/(\s(?:href|src|poster|data-url)=["'])\/(?!\/)/g, `$1${SITE}/`)
  .replace(/(\]\()\/(?!\/)/g, `$1${SITE}/`);
const body = (md) => end(absolutize(stripComments(md ?? '')).replace(/^\s+/, ''));

const meta = (post) => [post.data.id, isoDay(post.data.date), TOPICS[post.data.topic]?.label,
  post.data.project?.map((k) => PROJECTS[k]?.label).join(', ')].filter(Boolean);
const stop = (s) => (/[.!?…]$/.test(s) ? s : `${s}.`);
const cardLines = (card) => [card?.verdict && `**${stop(card.verdict)}**${card.takeaway ? ` ${card.takeaway}` : ''}`,
  !card?.verdict && card?.takeaway, ...(card?.points ?? []).map((p) => `- ${p}`)].filter(Boolean);

export function postTwin(post, card) {
  const short = cardLines(card);
  return [`<!-- Canonical: ${SITE}/ledger/${post.id}/ -->`, `# ${post.data.title}`,
    `${meta(post).join(' · ')} · by ${byOf(post.data.voice)}`, `> ${post.data.summary}`,
    ...(short.length ? [short.join('\n')] : []), body(post.body)].join('\n\n');
}

export function notesTwin(note, post) {
  return [`<!-- Canonical: ${SITE}/ledger/${post.id}/notes/ -->`, `# ${note.data.title}`,
    `${post.data.id} notes · ${isoDay(post.data.date)} · by ${byOf(note.data.voice)} · the short version: ${SITE}/ledger/${post.id}.md`,
    `> ${note.data.summary}`, body(note.body)].join('\n\n');
}

const LIVE = 'live notebook, updated all day';

// A size as agents weigh a fetch: 1.6 MB, 48 KB; and about how many tokens that much text is (4 bytes a token).
export const sizeOf = (bytes) => (bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`);
const tokensOf = (bytes) => `about ${bytes >= 4e5 ? Math.round(bytes / 4e4) * 10 : Math.max(1, Math.round(bytes / 4e3))}k tokens`;

// A lesson's text on one line: cut at the last sentence end within max characters, or at a word, marked, when that
// would keep less than half.
export function clip(text, max = 150) {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const sentence = s.slice(0, max + 1).match(/^.*[.!?…](?=\s)/)?.[0];
  return sentence?.length >= max / 2 ? sentence : `${s.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

// A project's main link as /llms.txt may give it: an https link as it is, a built page of the site (a post's only if
// it is listed), and anything else (#proj-reel, a download, a hidden post, none) the projects page that holds it.
export function projectLink(link, listed) {
  const href = typeof link === 'string' && link.startsWith(`${SITE}/`) ? link.slice(SITE.length) : link;
  if (typeof href === 'string' && href.startsWith('https://')) return href;
  const page = typeof href === 'string' && /^\/(?!\/)[^\s?#]*\/$/.test(href) && !href.split('/').includes('..');
  const post = page && href.match(/^\/ledger\/([^/]+)\/$/);
  if (!page || (href.startsWith('/ledger/') && !(post && listed.has(post[1])))) return `${SITE}/projects/`;
  return `${SITE}${href}`;
}

// The sections past the ledger. courses: [{ code, title, tagline, href, counts: courseCounts(), minutes, lessons:
// [{ id, title, loc, duration, legacy, text }] }], only lessons whose page is built; now: { date, summary } or null;
// about: { description, social: [{ label, href }] }; projects: [{ name, line, href, chip }], in page order.
const outOf = (n) => (n.legacy
  ? `${n.out} of ${n.lessons} new lessons out, ${n.legacy} legacy (made before the 2026-10-12 rebuild)`
  : `${n.out} of ${n.lessons} lessons out`);
const courseLine = (c) => `- [${c.title}](${SITE}${c.href}): ${c.code}. ${stop(c.tagline)} ${outOf(c.counts)}, ${c.minutes} to watch.`;
const lessonLine = (l) => `  - [${l.id} ${l.title}](${SITE}${l.loc}): `
  + `${stop([l.duration, l.legacy && 'legacy'].filter(Boolean).join(', ') || 'lesson')}${l.text ? ` ${clip(l.text)}` : ''}`;
const projectLine = (p, listed) => `- [${p.name}](${projectLink(p.href, listed)}): ${p.line}${p.chip ? ` (${p.chip})` : ''}`;
const said = (about) => (about?.description ? `. In his words: "${about.description}"` : '.');
function moreSections({ courses, now, about, projects, listed }) {
  const lines = (...l) => l.flat().join('\n');
  return [
    '## Courses', lines(`- [Courses](${SITE}/courses/): short narrated lessons, drawn in code, out a lesson at a time; `
      + 'locked lessons are not listed.', courses.flatMap((c) => [courseLine(c), ...c.lessons.map(lessonLine)])),
    '## Now', `- [Now](${SITE}/now/): what Aaron is working on${now ? `, updated ${now.date}. ${now.summary}` : '.'}`,
    '## About', lines(`- [About](${SITE}/about/): who Aaron is${said(about)} Contact: his email and profiles are on `
      + 'the About page.', about?.social?.length ? `- Profiles: ${about.social.map((s) => `[${s.label}](${s.href})`).join(', ')}` : []),
    '## Projects', lines(`- [Projects](${SITE}/projects/): everything Aaron has made or is making, by what you can do `
      + 'with it.', projects.map((p) => projectLine(p, listed))),
  ];
}

// /llms.txt (llmstxt.org): the index. posts: the listed posts; notes: notesBySlug(); research: the documents; the
// rest as moreSections() takes them; fullBytes: /llms-full.txt's size.
export function llmsTxt({ posts, notes, research, cardOf, courses = [], now = null, about = null, projects = [], fullBytes = null }) {
  const listed = ledgerOrder(posts.filter((p) => isListed(p.data)));
  const postLine = (p) => (isLive(p.id)
    ? `- [${p.data.id} ${p.data.title}](${SITE}/ledger/${p.id}/): ${isoDay(p.data.date)}, ${LIVE}. ${p.data.summary}`
    : `- [${p.data.id} ${p.data.title}](${SITE}/ledger/${p.id}.md): ${isoDay(p.data.date)}, ${TOPICS[p.data.topic]?.label}. ${cardOf(p).takeaway ?? p.data.summary}`);
  return [
    '# Aaron Orelup',
    '> The tea house: Aaron Orelup\'s notes on learning AI (agents, AI video, games, 3D), filed as a ledger of posts, AO-###.',
    'Agents: HTML here is chrome-heavy; every listed post has a Markdown twin at /ledger/<slug>.md, its making-of at '
      + '/ledger/<slug>/notes.md. Whole corpus, one file: /llms-full.txt. Retrieval: GET /api/search (below). Cite the '
      + `canonical ${SITE}/ledger/<slug>/ plus the AO id. No auth; robots.txt allows everything.`,
    '## Posts', listed.map(postLine).join('\n'),
    '## Notes', twinNotes(posts, notes).map(([p, n]) =>
      `- [${n.data.title}](${SITE}/ledger/${p.id}/notes.md): the making-of of ${p.data.id}. ${n.data.summary}`).join('\n'),
    '## Research', research.map((d) => `- [${d.data.title}](${SITE}/research/${d.id}.md): ${d.data.summary}`).join('\n'),
    ...moreSections({ courses, now, about, projects, listed: new Set(listed.map((p) => p.id)) }),
    '## Machine endpoints',
    [`- [RSS](${SITE}/rss.xml): every listed post, newest first`,
      `- [Sitemap](${SITE}/sitemap.xml): every public page`,
      `- [Post cards](${SITE}/ledger/previews.json): {posts:{slug:{id, title, topic, mins, verdict, takeaway, points, ...}}, projects:{key:label}}`,
      `- GET ${SITE}/api/search?q=<text>: 200 {v, hits:[{id, title, url, slug, kind, anchor, heading, text, score}]}, the best `
        + '2 chunks of each of the best 8 posts; url is the page to cite (with #anchor), id its AO id; kind post|notes; '
        + 'anchor \'\' is the top of the page, short the short version. 400 when q is under 3 or over 200 '
        + 'characters; 429 past 600 a minute, or 20 a minute for one query; 503 when the search flag is off or the daily cap '
        + 'is spent, until 00:00 UTC. No token.',
      '- POST /api/ask: Turnstile-gated, for people in a browser only.'].join('\n'),
    '## Optional',
    `- [Everything in one file](${SITE}/llms-full.txt): every post and notes twin above, ledger order`
      + (fullBytes ? `; ${sizeOf(fullBytes)}, ${tokensOf(fullBytes)}. Try /api/search or a post's .md twin first.` : ''),
  ].join('\n\n') + '\n';
}

// /llms-full.txt: every twin in ledger order, each post followed by its notes; a live notebook by its summary only.
export function llmsFullTxt({ posts, notes, cardOf }) {
  const listed = ledgerOrder(posts.filter((p) => isListed(p.data)));
  const parts = listed.map((p) => (isLive(p.id)
    ? `# ${p.data.title}\n\n${p.data.id} · ${isoDay(p.data.date)} · ${LIVE}: ${SITE}/ledger/${p.id}/\n\n> ${p.data.summary}\n`
    : [postTwin(p, cardOf(p)), notes.has(p.id) && notesTwin(notes.get(p.id), p)].filter(Boolean).join('\n\n---\n\n')));
  const head = `# Aaron Orelup: every listed post, in full\n\n> Markdown twins of every listed post and its notes page, newest first. `
    + `Index: ${SITE}/llms.txt. Canonical pages: ${SITE}/ledger/<slug>/.\n`;
  return [head, ...parts].join('\n\n---\n\n');
}

// The note for agents on every page, plain text: md is this page's twin (a site path) where it has one, newest the
// newest listed posts (on / and /ledger/), extra any more clauses, full /llms-full.txt's size (sizeOf). Names only paths
// the build writes (contracts.mjs), so the size carries no '/'.
export function agentNote({ md, newest = [], extra = [], full = '' } = {}) {
  return [`AGENTS: HTML here is chrome-heavy. Machine mirror: /llms.txt (index) /llms-full.txt (corpus, md${full ? `, ~${full}` : ''})`,
    md && `${md} (this page, md)`, '/ledger/previews.json /rss.xml /sitemap.xml.',
    'GET /api/search?q=<3-200 chars> -> JSON chunks, no auth. /api/ask: Turnstile, browsers only.', ...extra,
    newest.length && `Newest: ${newest.map((p) => `${p.data.id} /ledger/${p.id}/ ${isoDay(p.data.date)}`).join(' | ')}.`,
    'Ids: AO-###. Cite canonical URLs.'].filter(Boolean).join(' ');
}
