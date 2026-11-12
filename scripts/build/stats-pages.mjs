// Writes dist/stats-pages.txt after every build: every public page of the site, one path per line, as the
// address it answers at. worker/stats/index.js shows only these paths in /api/stats: never an unlisted post, nor a
// page whose path carries an unlisted slug, nor anything deeper than a listed post's /ledger/<slug>/ and its
// /ledger/<slug>/notes/, nor a frozen copy (ao-frozen, scripts/tools/tea-freeze.mjs). The listed posts are the ones
// the build's own /ledger/previews.json lists.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A page kept as it was on a day (tea-freeze.mjs): never named in /api/stats, under its own address or another.
const frozen = (file) => fs.readFileSync(file, 'utf8').split('</head>')[0].includes('<meta name="ao-frozen"');

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
      else if (e.name === 'index.html') { if (!frozen(path.join(dir, e.name))) pages.push(rel + '/'); }
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
    .filter((p) => !/^\/ledger\/[^/]+\/./.test(p) || /^\/ledger\/[^/]+\/notes\/$/.test(p)) // a post's page and its notes, nothing deeper
    .filter((p) => !named(p))
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
          '# The public pages of aaronorelup.com, for /api/stats (scripts/build/stats-pages.mjs).\n' + pages.join('\n') + '\n');
        logger.info(`stats-pages.txt: ${pages.length} pages`);
      },
    },
  };
}
