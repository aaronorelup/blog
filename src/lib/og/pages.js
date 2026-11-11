// The share cards of the listed pages that aren't posts: the pages of data/pages.js, each Now snapshot, each research
// document and each listed post's notes page. A card is the post card (lib/og/card.js) with the page's own words: its
// <title> up to the first " · " as the title and the rest above it, and its description under it. A research document
// and a notes page carry their id as a post does, and a notes page its post's icon. No other page has one here.
// Read by both layouts (the meta tag, by the page's address) and pages/og/page/[name].jpg.js (the files).
import { isLive } from '../../data/exempt.js';
import { PAGES, nowTitle } from '../../data/pages.js';
import { TOPICS } from '../../data/taxonomy.js';
import { listedPosts, notesBySlug, nowSnapshots, research, slugOf } from '../content.js';
import { shortDate } from '../dates.js';
import { pageImage } from './image.js';

const GLYPH = 'house';   // the site's own glyph, as on public/og/default.jpg

// '/ledger/touch-move/notes/' → 'ledger-touch-move-notes'; '/' → 'home'.
const nameOf = (pathname) => pathname.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'home';

// 'The Ledger · Aaron Orelup' → the title 'The Ledger' under 'Aaron Orelup'.
function titled(pathname, title, description) {
  const [head, ...rest] = title.split(' · ');
  return [pathname, { name: nameOf(pathname), eyebrow: rest.join(' · '), title: head, line: description, glyph: GLYPH }];
}

let pages;   // once a build; `astro dev` reads the content again each time

// → Map(pathname → { name, eyebrow, title, line, glyph, post? }), what pageImage draws.
export function sharePages() {
  if (import.meta.env.DEV) return list();
  pages ??= list();
  return pages;
}

async function list() {
  const notes = await notesBySlug();
  return new Map([
    ...Object.entries(PAGES).map(([pathname, { title, description }]) => titled(pathname, title, description)),
    ...(await nowSnapshots()).map((snap) => titled(`/now/${snap.id}/`, nowTitle(shortDate(new Date(snap.id))), snap.data.summary)),
    ...(await research()).map((doc) => [`/research/${slugOf(doc)}/`, { name: nameOf(`/research/${slugOf(doc)}/`),
      eyebrow: `${doc.data.id} · ${PAGES['/research/'].title.split(' · ')[0]}`, title: doc.data.title, line: doc.data.summary, glyph: GLYPH }]),
    ...(await listedPosts()).filter((post) => notes.has(slugOf(post)) && !isLive(post.data.id)).map((post) => {
      const { id, topic } = post.data;
      const note = notes.get(slugOf(post));
      const pathname = `/ledger/${slugOf(post)}/notes/`;
      return [pathname, { name: nameOf(pathname), eyebrow: `${id} · ${TOPICS[topic].label}`, title: note.data.title,
        line: note.data.summary, glyph: TOPICS[topic].glyph, post }];
    }),
  ]);
}

// → the address of the card of the page at `pathname` ('/about/'; '/about' in dev), or undefined: it has none.
export async function shareImage(pathname) {
  const page = (await sharePages()).get(pathname.endsWith('/') ? pathname : `${pathname}/`);
  return page && (await pageImage(page)).path;
}
