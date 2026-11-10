// /sitemap.xml: every page a search engine or an AI crawler should know about, so they stop
// guessing. Before 2026-10-17 there was none and the request 404'd (38 times in 30 days, by the
// analytics in AO-057). Listed posts and their notes only (isListed): an unlisted post carries noindex
// and must not be handed to a crawler here any more than it appears in a list.
import { listedPosts, notesBySlug, nowSnapshots, research, slugOf } from '../lib/content.js';
import { ledgerOrder } from '../lib/posts.js';
import { isoDay } from '../lib/dates.js';
import lore from '../data/lore/lore.json';
import { TEA_BASE, teaSeo } from '../data/tea.js';

const LORE = '/courses/i-love-my-evening-television';
const PAGES = [
  '/', '/ledger/', '/projects/', '/about/', '/courses/', '/courses/the-hidden-curriculum/', '/research/',
  // C-02, the lore course: its pages and one per episode, character and thing
  ...['', 'world/', 'timeline/', 'episodes/', 'characters/', 'things/', 'eggs/', 'threads/', 'questions/', 'steel/'].map((p) => `${LORE}/${p}`),
  ...(lore.episodes || []).map((e) => `${LORE}/episodes/${e.id}/`),
  ...(lore.characters || []).map((e) => `${LORE}/characters/${e.id}/`),
  ...(lore.things || []).map((e) => `${LORE}/things/${e.id}/`),
  // the tea room, only when its SEO switch says index
  ...(teaSeo().inSitemap ? [`${TEA_BASE}/`] : []),
];

export async function GET(context) {
  const site = String(context.site || 'https://aaronorelup.com').replace(/\/$/, '');
  const posts = ledgerOrder(await listedPosts());
  const notes = await notesBySlug();
  const newest = posts.length ? isoDay(posts[0].data.date) : null;
  const snaps = await nowSnapshots();   // newest first; a snapshot's id is its date

  const urls = [
    ...PAGES.map((p) => ({ loc: p, lastmod: p === '/' || p === '/ledger/' ? newest : null })),
    ...(snaps.length ? [{ loc: '/now/', lastmod: snaps[0].id }] : []),
    ...snaps.map((s) => ({ loc: `/now/${s.id}/`, lastmod: s.id })),
    ...(await research()).map((doc) => ({ loc: `/research/${slugOf(doc)}/`, lastmod: null })),
    ...posts.flatMap((post) => {
      const page = { loc: `/ledger/${slugOf(post)}/`, lastmod: isoDay(post.data.date) };
      return notes.has(slugOf(post)) ? [page, { ...page, loc: `${page.loc}notes/` }] : [page];
    }),
  ];
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${site}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
