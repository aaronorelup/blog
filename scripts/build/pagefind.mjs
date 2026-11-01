// Pagefind's index of the ledger, written into dist/pagefind/ once the pages are (astro:build:done). Only what carries
// data-pagefind-body is indexed: a listed post's or listed notes page's text (PostView, notes.astro), so unlisted
// posts, the ledger page and the easter-egg pages under public/ledger/ are out by construction, and every result URL
// is a /ledger/ page. src/scripts/search/keyword.js loads it. A failure fails the build (it landed lenient until the
// first main build, eb3705c, had written the index in Workers Builds).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GLOB = 'ledger/**/*.html';

async function writeIndex(dist) {
  const { createIndex, close } = await import('pagefind');
  try {
    const { index, errors } = await createIndex({});
    if (errors.length) throw new Error(errors.join('; '));
    const added = await index.addDirectory({ path: dist, glob: GLOB });
    if (added.errors.length) throw new Error(added.errors.join('; '));
    const out = path.join(dist, 'pagefind');
    const written = await index.writeFiles({ outputPath: out });
    if (written.errors.length) throw new Error(written.errors.join('; '));
    // added.page_count counts every file the glob read; the entry file counts the pages in the index.
    const { languages } = JSON.parse(fs.readFileSync(path.join(out, 'pagefind-entry.json'), 'utf8'));
    return Object.values(languages).reduce((n, l) => n + l.page_count, 0);
  } finally {
    await close();
  }
}

export default function pagefind() {
  return {
    name: 'pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        logger.info(`pagefind: ${await writeIndex(fileURLToPath(dir))} pages in the index, written to /pagefind/`);
      },
    },
  };
}
