// Pagefind's index of the ledger, written into dist/pagefind/ once the pages are (astro:build:done). Only what carries
// data-pagefind-body is indexed: a listed post's or listed notes page's text (PostView, notes.astro), so unlisted
// posts, the ledger page and the easter-egg pages under public/ledger/ are out by construction, and every result URL
// is a /ledger/ page. src/scripts/search/keyword.js loads it. Lenient (SOFT) until one green main build has written
// it: until then a failure logs, the build goes on without an index, and the search box goes without its words half.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOFT = true;
const GLOB = 'ledger/**/*.html';

async function writeIndex(dist) {
  const { createIndex, close } = await import('pagefind');
  try {
    const { index, errors } = await createIndex({});
    if (errors.length) throw new Error(errors.join('; '));
    const added = await index.addDirectory({ path: dist, glob: GLOB });
    if (added.errors.length) throw new Error(added.errors.join('; '));
    const written = await index.writeFiles({ outputPath: path.join(dist, 'pagefind') });
    if (written.errors.length) throw new Error(written.errors.join('; '));
    return added.page_count;
  } finally {
    await close();
  }
}

export default function pagefind() {
  return {
    name: 'pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          logger.info(`pagefind: ${await writeIndex(fileURLToPath(dir))} pages indexed into /pagefind/`);
        } catch (e) {
          if (!SOFT) throw e;
          logger.warn(`pagefind: no index written (${e.message}); search runs on meaning alone`);
        }
      },
    },
  };
}
