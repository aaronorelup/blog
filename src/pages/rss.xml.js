import rss from '@astrojs/rss';
import { listedPosts, slugOf } from '../lib/content.js';
import { ledgerOrder } from '../lib/posts.js';

export async function GET(context) {
  return rss({
    title: 'Aaron Orelup — the ledger',
    description: 'Notes on learning AI — agents, automation, and whatever breaks along the way.',
    site: context.site,
    // Posts moved from /posts/<slug>/ to /ledger/<slug>/ with the tea house redesign.
    // Old links 301 to the new ones (see public/_redirects), but the feed's guids are
    // derived from the link, so anyone subscribed before the move sees each entry once
    // more. With the feed this young that's cheaper than carrying a guid shim forever.
    items: ledgerOrder(await listedPosts()).map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
      categories: post.data.tags,
      link: `/ledger/${slugOf(post)}/`,
    })),
  });
}
