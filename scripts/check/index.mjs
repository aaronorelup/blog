// The post and code checker. `npm run check [-- <paths>]` runs every rule at its full level (paths narrow the report).
// `npm run build` runs it with --deploy first: there only the deploy rules stop the build, and the rest are counted
// as warnings. --strict fails on warnings too, except those a live notebook or a HELD post (src/data/exempt.js) may
// keep. ARCHITECTURE.md ("Build checks") lists the rules; run.mjs holds the levels.
import path from 'node:path';
import { isHeld, isLivePath } from '../../src/data/exempt.js';
import { ROOT, runChecks } from './run.mjs';

const args = process.argv.slice(2);
const deploy = args.includes('--deploy');
const strict = args.includes('--strict');
const mayWarn = (file) => isLivePath(file) || isHeld(path.basename(file, '.md'));
const only = args.filter((a) => !a.startsWith('--'))
  .map((a) => path.relative(ROOT, path.resolve(a)).split(path.sep).join('/'));

const started = performance.now();
const issues = runChecks({ deploy })
  .map((i) => (strict && i.severity === 'warn' && !mayWarn(i.file) ? { ...i, severity: 'error' } : i))
  .filter((i) => !only.length || only.some((p) => i.file === p || i.file.startsWith(p + '/')))
  .sort((a, b) => a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0));
const errors = issues.filter((i) => i.severity === 'error');
const warnings = issues.filter((i) => i.severity === 'warn');

const show = (i) => console.log(`${i.severity.padEnd(5)} ${i.file}${i.line ? ':' + i.line : ''}  ${i.message}  [${i.rule}]`);
if (deploy) {
  errors.forEach(show);
  const byRule = Object.groupBy(warnings, (i) => i.rule);
  for (const [rule, list] of Object.entries(byRule)) {
    console.log(`warn  ${rule}: ${list.length} in ${new Set(list.map((i) => i.file)).size} files (npm run check lists them)`);
  }
} else {
  issues.forEach(show);
}
const ms = Math.round(performance.now() - started);
console.log(`check${deploy ? ' --deploy' : ''}${strict ? ' --strict' : ''}: ${errors.length} errors, ${warnings.length} warnings (${ms} ms)`);
process.exit(errors.length ? 1 : 0);
