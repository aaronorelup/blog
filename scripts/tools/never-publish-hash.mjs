// npm run never-publish:hash [-- <list>]: hashes the private never-publish list (default: the agent kit's
// skills/blog-post/never-publish.txt; one term per line, # comments) into src/data/never-publish.json, which
// scripts/check/never-publish.mjs reads. It prints counts and line numbers, never a term.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash, termKey } from '../check/never-publish.mjs';

const list = process.argv[2] ?? path.join(os.homedir(), 'agent-kit/skills/blog-post/never-publish.txt');
const out = fileURLToPath(new URL('../../src/data/never-publish.json', import.meta.url));

const lines = fs.readFileSync(list, 'utf8').split('\n').map((l, i) => [l.trim(), i + 1]).filter(([l]) => l && !l.startsWith('#'));
const bad = lines.filter(([l]) => !termKey(l)).map(([, n]) => n);
if (bad.length) {
  console.error(`${list}: lines ${bad.join(', ')} are neither a host or URL nor 1 to 3 words`);
  process.exit(1);
}
const hashes = [...new Set(lines.map(([l]) => hash(termKey(l))))].sort();
fs.writeFileSync(out, JSON.stringify(hashes, null, 2) + '\n');
console.log(`${path.relative(process.cwd(), out)}: ${hashes.length} hashes from ${lines.length} terms`);
