// Runs every rule over a repo and gives each issue its severity for this run. A rule files an issue at one of three
// levels: 'deploy' fails npm run build and npm run check, 'check' fails only npm run check, 'warn' never fails.
// Anything in a live notebook (src/data/exempt.js) is at most a warning, at either level.
import { fileURLToPath } from 'node:url';
import { isLivePath } from '../../src/data/exempt.js';
import { loadRepo } from './repo.mjs';
import frontmatter from './frontmatter.mjs';
import prose from './prose.mjs';
import neverPublish from './never-publish.mjs';
import links from './links.mjs';
import elements from './elements.mjs';
import assets from './assets.mjs';
import code from './code.mjs';
import teaPicks from './tea-picks.mjs';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const RULES = { frontmatter, prose, 'never-publish': neverPublish, links, elements, assets, code, 'tea-picks': teaPicks };

const severity = (level, file, deploy) =>
  level === 'warn' || (deploy && level === 'check') || isLivePath(file) ? 'warn' : 'error';

export function runChecks({ root = ROOT, deploy = false } = {}) {
  const repo = loadRepo(root);
  const issues = [];
  for (const [rule, run] of Object.entries(RULES)) {
    run(repo, (file, line, message, level) =>
      issues.push({ rule, file, line, message, severity: severity(level, file, deploy) }));
  }
  return issues;
}
