// The site's own links go straight to the canonical address, with its trailing slash: /ledger answers with a 307 to
// /ledger/, a round trip on every click and every crawl. The NAV, and every quoted section path in the code that
// renders pages. Files other repos write (src/data/courses, src/data/lore) and post prose are not this code's.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import test from 'node:test';
import { NAV } from '../../src/data/site.js';

const ROOT = new URL('../../', import.meta.url).pathname;
const DIRS = ['src/components', 'src/pages', 'src/data', 'src/scripts', 'src/layouts'];
const NOT_OURS = ['src/data/courses', 'src/data/lore'];
const SECTIONS = ['ledger', 'courses', 'projects', 'about', 'stats', 'now', 'research'];
const BARE = new RegExp(`['"\`]/(${SECTIONS.join('|')})(?=['"\`?#])`, 'g');

function* files(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (NOT_OURS.includes(relative(ROOT, p))) continue;
    if (e.isDirectory()) yield* files(p);
    else if (/\.(astro|js|mjs|ts|json)$/.test(e.name)) yield p;
  }
}

test('every NAV link ends with a slash', () => {
  for (const n of NAV) assert.match(n.href, /^\/[a-z-]+\/$/, `${n.key}: ${n.href}`);
});

test('no quoted section path in the site code lacks its trailing slash', () => {
  const found = [];
  for (const dir of DIRS) {
    for (const f of files(join(ROOT, dir))) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        for (const m of line.matchAll(BARE)) found.push(`${relative(ROOT, f)}:${i + 1} ${m[0]}`);
      });
    }
  }
  assert.deepEqual(found, []);
});
