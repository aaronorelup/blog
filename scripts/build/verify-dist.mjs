// After every build (astro:build:done): the frozen contracts over dist/ (scripts/build/contracts.mjs) stop the
// deploy when one breaks, and the page-weight budgets (scripts/tools/budgets.mjs) are printed, never failing it.
import { fileURLToPath } from 'node:url';
import { check as checkContracts } from './contracts.mjs';
import { format, measure } from '../tools/budgets.mjs';

export default function verifyDist() {
  return {
    name: 'verify-dist',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const broken = checkContracts(dist);
        if (broken.length) throw new Error(`A frozen contract broke (ARCHITECTURE.md, "Contracts"):\n- ${broken.join('\n- ')}`);
        logger.info(`budgets, gzipped (npm test fails on them from W4):\n${format(measure(dist))}`);
      },
    },
  };
}
