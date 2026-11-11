// The share cards of the listed pages that aren't posts: the pages of data/pages.js, each Now snapshot and each
// research document. A card is the post card (lib/og/card.js) with the page's own words: its <title> up to the first
// " · " as the title and the rest above it, and its description under it. A research document carries its id as a
// post does. No other page has one here.
// Read by both layouts (the meta tag, by the page's address) and pages/og/page/[name].jpg.js (the files).
import { PAGES, nowTitle } from '../../data/pages.js';
import { nowSnapshots, research, slugOf } from '../content.js';
import { shortDate } from '../dates.js';
import { pageImage } from './image.js';

const GLYPH = 'house';   // the site's own glyph, as on public/og/default.jpg

// '/now/2026-11-08/' → 'now-2026-11-08'; '/' → 'home'.
const nameOf = (pathname) => pathname.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'home';

// 'The Ledger · Aaron Orelup' → the title 'The Ledger' under 'Aaron Orelup'.
function titled(pathname, title, description) {
  const [head, ...rest] = title.split(' · ');
  return [pathname, { name: nameOf(pathname), eyebrow: rest.join(' · '), title: head, line: description, glyph: GLYPH }];
}

let pages;   // once a build; `astro dev` reads the content again each time

// → Map(pathname → { name, eyebrow, title, line, glyph }), what pageImage draws.
export function sharePages() {
  if (import.meta.env.DEV) return list();
  pages ??= list();
  return pages;
}

async function list() {
  return new Map([
    ...Object.entries(PAGES).map(([pathname, { title, description }]) => titled(pathname, title, description)),
    ...(await nowSnapshots()).map((snap) => titled(`/now/${snap.id}/`, nowTitle(shortDate(new Date(snap.id))), snap.data.summary)),
    ...(await research()).map((doc) => [`/research/${slugOf(doc)}/`, { name: nameOf(`/research/${slugOf(doc)}/`),
      eyebrow: `${doc.data.id} · ${PAGES['/research/'].title.split(' · ')[0]}`, title: doc.data.title, line: doc.data.summary, glyph: GLYPH }]),
  ]);
}

// → the address of the card of the page at `pathname` ('/about/'; '/about' in dev), or undefined: it has none.
export async function shareImage(pathname) {
  const page = (await sharePages()).get(pathname.endsWith('/') ? pathname : `${pathname}/`);
  return page && (await pageImage(page)).path;
}
