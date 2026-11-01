// npm run ask:pin: writes the pack starts the last build computed (dist/ask/manifest.json's starts) into
// src/data/ask-packs.json, so each pack's range stays put and a doc that grows re-misses only its own pack. Run it
// when a build prints "unpinned pack boundaries", after npm run build, and commit the file (docs/ASK.md).
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('../../dist/ask/manifest.json', import.meta.url), 'utf8'));
const file = new URL('../../src/data/ask-packs.json', import.meta.url);
const before = JSON.parse(fs.readFileSync(file, 'utf8')).starts;
fs.writeFileSync(file, `${JSON.stringify({ starts: manifest.starts })}\n`);
console.log(`ask-packs.json: starts ${JSON.stringify(before)} -> ${JSON.stringify(manifest.starts)}`);
