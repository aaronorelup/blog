// Writes dist/stats-pages.txt after every build: every public page of the site, one path per
// line, as the address it answers at. worker/stats.js reads it to decide which paths /api/stats
// may show, so a page that people read appears by its own address and nothing else does: not a
// path someone typed or forged into a Web Analytics beacon, and never an unlisted post.
//
// Unlisted posts (isListed in src/data/listed.js) still build at /ledger/<slug>/, so they are left
// out here, along with any page whose path carries an unlisted slug (a media page named after
// it). The listed posts are the /ledger/<slug>/ lines, taken from the build's own
// /ledger/previews.json, which lists exactly those. The same pages are in the sitemap and the
// public repository already; this file only puts them in one place for the Worker.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Pages that nothing on the site links to: an episode of I Love My Evening Television shows each
// address for a few frames and nowhere else. They answer by URL, carry noindex (in the page and in
// public/_headers), and stay out of this list, so /stats never names them. The older ones sit under
// a post (/ledger/<slug>/<page>/) and the depth rule below already drops them; these don't.
export const HIDDEN = ['/sorry/'];

export function listPages(dist) {
  const previews = JSON.parse(fs.readFileSync(path.join(dist, 'ledger', 'previews.json'), 'utf8'));
  const listed = new Set(Object.keys(previews.posts || {}));
  if (!listed.size) throw new Error('stats-pages: previews.json lists no posts');
  // Every post the build made a page for, listed or not.
  const built = fs.readdirSync(path.join(dist, 'ledger'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dist, 'ledger', e.name, 'index.html')))
    .map((e) => e.name.toLowerCase());
  const unlisted = new Set(built.filter((s) => !listed.has(s)));

  const pages = [];
  const walk = (dir, rel) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('_') || e.name.startsWith('.')) continue; // _astro bundles, dotfiles
      const r = rel + '/' + e.name;
      if (e.isDirectory()) walk(path.join(dir, e.name), r);
      else if (e.name === 'index.html') pages.push(rel + '/');
      else if (/\.html$/.test(e.name) && r !== '/404.html') pages.push(r.replace(/\.html$/, '')); // served without .html
    }
  };
  walk(dist, '');
  const named = (p) => {
    const low = p.toLowerCase();
    return low.split('/').some((s) => unlisted.has(s)) || low.split(/[^a-z0-9-]+/).some((w) => unlisted.has(w));
  };
  return pages
    .filter((p) => !/^\/ledger\/[^/]+\//.test(p) || listed.has(p.split('/')[2]))
    .filter((p) => !/^\/ledger\/[^/]+\/./.test(p)) // nothing deeper than a post's own page
    .filter((p) => !named(p))
    .filter((p) => !HIDDEN.some((h) => p.toLowerCase() === h || p.toLowerCase().startsWith(h)))
    .filter((p) => /^\/[\x21-\x7e]*$/.test(p) && p.length <= 160)
    .sort();
}

export default function statsPages() {
  return {
    name: 'stats-pages',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const pages = listPages(dist);
        fs.writeFileSync(path.join(dist, 'stats-pages.txt'),
          '# The public pages of aaronorelup.com, for /api/stats (scripts/stats-pages.mjs).\n' + pages.join('\n') + '\n');
        logger.info(`stats-pages.txt: ${pages.length} pages`);
      },
    },
  };
}
