import { defineConfig } from 'astro/config';
import { markdownProcessor } from './scripts/build/markdown.mjs';
import statsPages from './scripts/build/stats-pages.mjs';
import devStatsFixture from './scripts/build/dev-stats-fixture.mjs';
import loreThumbs from './scripts/lore-thumbs.mjs';
import media from './scripts/media/integration.mjs';
import pagefind from './scripts/build/pagefind.mjs';
import verifyDist from './scripts/build/verify-dist.mjs';
import { fileURLToPath } from 'node:url';

// public/, found from this file rather than the working directory (the dev server is often started from
// the folder above with --root blog). Astro, the post-images plugin and build code (src/lib/paths.js reads
// the __PUBLIC_DIR__ define) all get this one value.
const publicDir = fileURLToPath(new URL('./public/', import.meta.url));

// Only main may reach the site. Workers Builds builds every branch pushed to GitHub, and on
// 2026-10-08 it deployed one to production: a cloud session had branched from the stale
// `master` (2026-08-02), so the live site went back two months until it was rolled back.
// Failing the build is what stops the deploy. Local builds don't set WORKERS_CI.
const ciBranch = process.env.WORKERS_CI ? process.env.WORKERS_CI_BRANCH : null;
if (ciBranch && ciBranch !== 'main') {
  throw new Error(
    `Not building "${ciBranch}" on Cloudflare: only main deploys aaronorelup.com. ` +
      'Rebase the branch onto main and merge it there (see CLAUDE.md).',
  );
}

export default defineConfig({
  site: 'https://aaronorelup.com',
  publicDir,
  // Every stylesheet is a <link>, never inlined: a file the homepage overlay can adopt from a fetched page.
  build: { inlineStylesheets: 'never' },
  // Whitespace between inline elements kept as one space (the default, 'jsx', drops it).
  compressHTML: true,
  // statsPages: dist/stats-pages.txt, the public pages /api/stats may name (worker/stats/index.js).
  // loreThumbs: small copies of the lore course's pictures for its index cards (scripts/lore-thumbs.mjs).
  // media: no video or audio in public/ outside courses/, nothing over 25 MiB (docs/MEDIA.md).
  // pagefind: the ledger's words index, dist/pagefind/ (scripts/build/pagefind.mjs).
  // verifyDist: the frozen contracts over dist/, last so every file is written (scripts/build/verify-dist.mjs).
  integrations: [statsPages(), loreThumbs(), media(), pagefind(), verifyDist()],
  markdown: {
    // Both themes, emitted as CSS custom properties rather than a baked-in
    // background — prose.css picks one based on the day/night mode. A single
    // theme here hardcodes `background-color` inline on <pre>, which beat the
    // palette and left every code block white in night mode.
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
    // The remark/rehype pipeline, not 7's default Sätteri, which runs no rehype plugins. Ours: pictures sized,
    // headings' ids, then the one text extraction every feature reads (scripts/build/markdown.mjs).
    processor: markdownProcessor({ publicDir }),
  },
  vite: {
    // CSS minified by esbuild, as before Vite 8: its default, Lightning CSS, rewrites custom properties' colours
    // (rgba(240, 192, 106, .2) to #f0c06a33), and the /stats canvas reads those tokens as rgba() strings.
    build: { cssMinify: 'esbuild' },
    define: { __PUBLIC_DIR__: JSON.stringify(publicDir) },
    plugins: [devStatsFixture()],
  },
});
