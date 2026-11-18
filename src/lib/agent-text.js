// The agent layer's text, as pure functions over post, card, note and research values: /llms.txt, /llms-full.txt,
// the Markdown twins /ledger/<slug>.md and /ledger/<slug>/notes.md, and the note for agents each page carries
// (components/chrome/AgentNote.astro). Only a listed post that is no live notebook has a twin (twinPosts); a live
// notebook gives its title, address and summary only, and an unlisted post or a draft appears nowhere here.
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

// /llms.txt (llmstxt.org): the index. posts: the listed posts; notes: notesBySlug(); research: the documents.
export function llmsTxt({ posts, notes, research, cardOf }) {
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
    '## Machine endpoints',
    [`- [RSS](${SITE}/rss.xml): every listed post, newest first`,
      `- [Sitemap](${SITE}/sitemap.xml): every public page`,
      `- [Post cards](${SITE}/ledger/previews.json): {posts:{slug:{id, title, topic, mins, verdict, takeaway, points, ...}}, projects:{key:label}}`,
      `- GET ${SITE}/api/search?q=<text>: 200 {v, hits:[{slug, kind, anchor, heading, text, score}]}, the best 2 chunks of each `
        + 'of the best 8 posts; kind post|notes; anchor \'\' is the top of the page, short the short version. A hit\'s page is '
        + `${SITE}/ledger/<slug>/ (plus notes/ when kind is notes), then #<anchor>. 400 when q is under 3 or over 200 `
        + 'characters; 429 past 600 a minute, or 20 a minute for one query; 503 when the search flag is off or the daily cap '
        + 'is spent, until 00:00 UTC. No token.',
      '- POST /api/ask: Turnstile-gated, for people in a browser only.'].join('\n'),
    '## Optional',
    [`- [Everything in one file](${SITE}/llms-full.txt): every post and notes twin above, ledger order`,
      `- [About](${SITE}/about/)`, `- [Now](${SITE}/now/)`, `- [Projects](${SITE}/projects/)`, `- [Courses](${SITE}/courses/)`].join('\n'),
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
// newest listed posts (on / and /ledger/), extra any more clauses. Names only paths the build writes (contracts.mjs).
export function agentNote({ md, newest = [], extra = [] } = {}) {
  return ['AGENTS: HTML here is chrome-heavy. Machine mirror: /llms.txt (index) /llms-full.txt (corpus, md)',
    md && `${md} (this page, md)`, '/ledger/previews.json /rss.xml /sitemap.xml.',
    'GET /api/search?q=<3-200 chars> -> JSON chunks, no auth. /api/ask: Turnstile, browsers only.', ...extra,
    newest.length && `Newest: ${newest.map((p) => `${p.data.id} /ledger/${p.id}/ ${isoDay(p.data.date)}`).join(' | ')}.`,
    'Ids: AO-###. Cite canonical URLs.'].filter(Boolean).join(' ');
}
