// /sitemap.xml: every page a search engine or an AI crawler should know about, so they stop
// guessing. Before 2026-10-17 there was none and the request 404'd (38 times in 30 days, by the
// analytics in AO-057). Listed posts only (isListed): an unlisted post carries noindex and must
// not be handed to a crawler here any more than it appears in a list.
import { getCollection } from 'astro:content';
import { isListed } from '../data/listed.js';

const PAGES = ['/', '/ledger/', '/projects/', '/about/', '/courses/', '/courses/the-hidden-curriculum/', '/research/'];
const day = (d) => d.toISOString().slice(0, 10);

export async function GET(context) {
  const site = String(context.site || 'https://aaronorelup.com').replace(/\/$/, '');
  const posts = (await getCollection('posts', ({ data }) => isListed(data)))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || b.data.id.localeCompare(a.data.id));
  const research = await getCollection('research');
  const newest = posts.length ? day(posts[0].data.date) : null;

  const urls = [
    ...PAGES.map((p) => ({ loc: p, lastmod: p === '/' || p === '/ledger/' ? newest : null })),
    ...research.map((doc) => ({ loc: `/research/${doc.slug}/`, lastmod: null })),
    ...posts.map((post) => ({ loc: `/ledger/${post.slug}/`, lastmod: day(post.data.date) })),
  ];
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${site}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
