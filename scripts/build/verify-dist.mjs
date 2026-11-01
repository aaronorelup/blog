// After every build (astro:build:done): the frozen contracts over dist/ (scripts/build/contracts.mjs) and RAG
// Goobie's files (ask-dist.mjs) stop the deploy when one breaks, and the page-weight budgets
// (scripts/tools/budgets.mjs) are printed, never failing it. The last build's Ask manifest is read before Astro empties dist.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { askCheck } from './ask-dist.mjs';
import { check as checkContracts, listedSlugs } from './contracts.mjs';
import { fontMisses, format, measure } from '../tools/budgets.mjs';

export default function verifyDist() {
  let prev = null;   // the last build's /ask/manifest.json
  return {
    name: 'verify-dist',
    hooks: {
      'astro:config:done': ({ config }) => {
        const file = new URL('ask/manifest.json', config.outDir);
        if (fs.existsSync(file)) prev = JSON.parse(fs.readFileSync(file, 'utf8'));
      },
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const broken = checkContracts(dist);
        if (broken.length) throw new Error(`A frozen contract broke (ARCHITECTURE.md, "Contracts"):\n- ${broken.join('\n- ')}`);
        const ask = askCheck(dist, listedSlugs(), prev);
        if (ask.problems.length) throw new Error(`RAG Goobie's files are wrong (docs/ASK.md):\n- ${ask.problems.join('\n- ')}`);
        for (const line of ask.warnings) logger.warn(line);
        for (const line of ask.lines) logger.info(line);
        logger.info(`budgets, gzipped (npm test fails on them from W4):\n${format(measure(dist))}`);
        const fonts = fontMisses(dist);
        if (fonts) logger.warn(fonts);
      },
    },
  };
}
