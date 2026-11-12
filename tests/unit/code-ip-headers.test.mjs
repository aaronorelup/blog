// Nothing in the Worker reads a visitor's IP address (CLAUDE.md), under any of the headers Cloudflare hands it in:
// CF-Connecting-IP and Turnstile's remoteip were the only spellings the code rule knew, so X-Forwarded-For, X-Real-IP
// and True-Client-IP, which carry the same address, passed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runChecks } from '../../scripts/check/run.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ip-'));
const put = (rel, text) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
put('worker/forwarded.js', "export const who = (request) => request.headers.get('X-Forwarded-For')?.split(',')[0];\n");
put('worker/real.js', "export const who = (request) => request.headers.get('x-real-ip');\n");
put('worker/client.js', "export const who = (request) => request.headers.get('True-Client-IP');\n");
put('worker/clean.js', "export const where = (request) => request.cf?.country ?? request.headers.get('X-Forwarded-Proto');\n");
put('src/data/media-manifest.json', '{}');
put('src/data/never-publish.json', '[]');
put('public/_redirects', '');
test.after(() => fs.rmSync(root, { recursive: true }));

test("a Worker file that reads the visitor's IP from X-Forwarded-For, X-Real-IP or True-Client-IP is reported", () => {
  const reported = runChecks({ root }).filter((i) => i.rule === 'code' && /IP address/.test(i.message));
  assert.deepEqual(reported.map((i) => [i.file, i.severity]).sort(), [
    ['worker/client.js', 'error'], ['worker/forwarded.js', 'error'], ['worker/real.js', 'error'],
  ]);
});
