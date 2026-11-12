// The code's shape, under src/, worker/ and scripts/ (never public/: other people's pages): at most 400 lines a
// file; no browser JS imports CSS; no style= in components, layouts or pages; astro:content only through
// src/lib/content.js, src/content.config.ts and src/schemas/; nothing in worker/ reads a visitor's IP address.
// grandfathered.mjs lists the exemptions, and this flags any UNTIL line that no longer exempts anything.
import { covers, KEEP, UNTIL } from './grandfathered.mjs';

const MAX_LINES = 400;
const CODE = /\.(?:js|mjs|cjs|ts|astro|css|sql)$/;
const CSS_IMPORT = /\bimport\s*(?:\(\s*)?(?:[^'"();]*?\bfrom\s*)?['"][^'"]+\.css(?:\?[^'"]*)?['"]/;
const STYLE_ATTR = /(?<![\w.-])style\s*=\s*["'{]/;
const IP = /CF-Connecting-IP|X-Forwarded-For|X-Real-IP|True-Client-IP|remoteip/i;
const CONTENT_API = /['"]astro:content['"]/;
const MAY_USE_CONTENT_API = (f) => f === 'src/lib/content.js' || f === 'src/content.config.ts' || f.startsWith('src/schemas/');

function problems(file, text) {
  const found = [];
  const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  if (lines > MAX_LINES) found.push(`${lines} lines, over the ${MAX_LINES}-line ceiling: split it`);
  if (/^src\/(elements|scripts)\//.test(file) && CSS_IMPORT.test(text)) found.push('browser JS imports CSS: link it from the page, or inline it into the article (ARCHITECTURE.md)');
  if (/^src\/(components|layouts|pages)\/.*\.astro$/.test(file) && STYLE_ATTR.test(text)) found.push('an inline style=: use a class');
  if (file.startsWith('src/') && CONTENT_API.test(text) && !MAY_USE_CONTENT_API(file)) found.push('imports astro:content: go through src/lib/content.js');
  if (file.startsWith('worker/') && IP.test(text)) found.push("reads the visitor's IP address: never key anything on it");
  return found;
}

export default function code(repo, report) {
  const files = ['src', 'worker', 'scripts'].flatMap((d) => repo.list(d, (f) => CODE.test(f) && !f.startsWith('src/content/')));
  const used = new Set();
  for (const file of files) {
    const found = problems(file, repo.read(file));
    if (!found.length || KEEP.some((p) => covers(p, file))) continue;
    const until = Object.keys(UNTIL).find((p) => covers(p, file));
    if (until) used.add(until);
    else for (const message of found) report(file, null, message, 'check');
  }
  for (const [pattern, task] of Object.entries(UNTIL)) {
    if (!used.has(pattern)) {
      report('scripts/check/grandfathered.mjs', null, `${pattern} (${task}) no longer exempts anything: delete its line`, 'check');
    }
  }
}
