import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isListed } from '../data/listed.js';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => isListed(data));
  return rss({
    title: 'Aaron Orelup — the ledger',
    description: 'Notes on learning AI — agents, automation, and whatever breaks along the way.',
    site: context.site,
    // Posts moved from /posts/<slug>/ to /ledger/<slug>/ with the tea house redesign.
    // Old links 301 to the new ones (see public/_redirects), but the feed's guids are
    // derived from the link, so anyone subscribed before the move sees each entry once
    // more. With the feed this young that's cheaper than carrying a guid shim forever.
    items: posts
      .sort(
        (a, b) =>
          b.data.date.valueOf() - a.data.date.valueOf() || b.data.id.localeCompare(a.data.id),
      )
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
        categories: post.data.tags,
        link: `/ledger/${post.slug}/`,
      })),
  });
}
