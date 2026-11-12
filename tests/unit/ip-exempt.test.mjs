// scripts/check/code.mjs skips the files grandfathered.mjs's KEEP names, and with them its rule that nothing under
// worker/ reads a visitor's IP address. This pins which Worker files that is (the three of worker/stats/, and no
// other), puts the same three through the rule as if they were not exempt, and pins what /api/stats asks
// Cloudflare's analytics for: a user agent, a path, a country, a device, an hour, never an address. A new exempt
// file, a new dimension or an address in any of them trips one of these.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { covers, KEEP, UNTIL } from '../../scripts/check/grandfathered.mjs';
import { runChecks } from '../../scripts/check/run.mjs';
import { coreQuery, LITE, totalsQuery, windowQuery, WINDOWS } from '../../worker/stats/shape.js';

const WORKER = new URL('../../worker/', import.meta.url);
const EXEMPT = ['worker/stats/index.js', 'worker/stats/shape.js', 'worker/stats/stats.sql'];
const read = (file) => fs.readFileSync(new URL(file.slice('worker/'.length), WORKER), 'utf8');
const IP_RULE = "reads the visitor's IP address: never key anything on it";

test('the code rule skips worker/stats/ and no other part of the Worker', () => {
  const files = fs.readdirSync(WORKER, { recursive: true }).map((f) => 'worker/' + String(f).split(path.sep).join('/'))
    .filter((f) => fs.statSync(new URL(f.slice('worker/'.length), WORKER)).isFile()).sort();
  const skipped = (list) => files.filter((f) => list.some((p) => covers(p, f)));
  assert.deepEqual(skipped(KEEP), EXEMPT);
  assert.deepEqual(KEEP.filter((p) => p.startsWith('worker')), ['worker/stats/**']);
  assert.deepEqual(skipped(Object.keys(UNTIL)), []);
});

test("none of the exempt files reads a visitor's IP: the rule passes them as it would any other Worker file", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'exempt-'));
  t.after(() => fs.rmSync(root, { recursive: true }));
  const put = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  put('src/data/media-manifest.json', '{}');
  put('src/data/never-publish.json', '[]');
  put('public/_redirects', '');
  // The real files under a folder the rule does read, a file that does read an address beside them, and the same
  // file where it is exempt.
  const asChecked = (file) => file.replace('worker/stats/', 'worker/checked/');
  for (const file of EXEMPT) put(asChecked(file), read(file));
  put('worker/checked/peek.js', "export const who = (request) => request.headers.get('CF-Connecting-IP');\n");
  put('worker/stats/peek.js', "export const who = (request) => request.headers.get('CF-Connecting-IP');\n");

  const code = runChecks({ root }).filter((i) => i.rule === 'code');
  const messages = (file) => code.filter((i) => i.file === file).map((i) => i.message);
  assert.deepEqual(messages('worker/checked/peek.js'), [IP_RULE]);
  for (const file of EXEMPT) assert.ok(!messages(asChecked(file)).includes(IP_RULE), file);
  // The rule did read them: shape.js is over the 400-line ceiling it is also exempt from.
  assert.match(messages('worker/checked/shape.js').join('\n'), /over the 400-line ceiling/);
  // What the exemption costs: under worker/stats/ the same line goes unreported, so the tests here stand in.
  assert.deepEqual(messages('worker/stats/peek.js'), []);
});

test('no exempt file names a header, a field or an analytics dimension that carries an address', () => {
  const ADDRESS = /CF-Connecting-IP|True-Client-IP|X-Forwarded-For|X-Real-IP|remoteip|remote_addr|client_?ip|clientRequestIP|originIP|\bipv?[46]?\s*[:=]/i;
  for (const file of EXEMPT) assert.doesNotMatch(read(file), ADDRESS, file);
});

test('/api/stats asks the analytics for these dimensions and no other', () => {
  const tags = { zone: 'a'.repeat(32), account: 'b'.repeat(32), site: 'c'.repeat(32) };
  const day = '2026-11-10';
  const asked = (query) => [...new Set([...query.matchAll(/dimensions\{([^}]*)\}/g)].flatMap((m) => m[1].trim().split(/\s+/)))].sort();
  const core = ['clientCountryName', 'clientRequestPath', 'countryName', 'deviceType', 'edgeResponseContentTypeName', 'edgeResponseStatus',
    'refererHost', 'requestPath', 'userAgent', 'verifiedBotCategory'];
  assert.deepEqual(asked(coreQuery(day, tags)), core);
  assert.deepEqual(asked(coreQuery(day, tags, LITE)), core);
  for (const n of WINDOWS) {
    assert.deepEqual(asked(windowQuery(day, n - 1, n, tags)), ['clientCountryName', 'clientDeviceType', 'clientRequestPath', 'datetimeHour', 'userAgent'], `${n} windows`);
  }
  assert.deepEqual(asked(totalsQuery('2026-08-02', day, '2026-10-11', tags)), ['date', 'deviceType']);
  for (const query of [coreQuery(day, tags), windowQuery(day, 0, 1, tags), totalsQuery('2026-08-02', day, '2026-10-11', tags)]) {
    assert.doesNotMatch(query, /ip\b|IP[A-Z]|address/, 'a query names an address');
  }
});
