// lib/session.js: an Ask token verifies only as minted, with its key, before it expires.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mint, verify } from '../../worker/lib/session.js';

const env = { SESSION_KEY: 'test-key-one' };
const other = { SESSION_KEY: 'test-key-two' };
const flip = (s, i) => s.slice(0, i) + (s[i] === 'A' ? 'B' : 'A') + s.slice(i + 1);

test('a minted token verifies, with 128 random bits of its own', async () => {
  const now = Date.now();
  const a = await mint(env, now);
  const b = await mint(env, now);
  const claims = await verify(env, a.token, now + 1000);
  assert.deepEqual(claims, { s: claims.s, e: a.exp });
  assert.equal(a.exp, now + 30 * 60e3);
  assert.equal(claims.s.length, 22);
  assert.notEqual(claims.s, (await verify(env, b.token, now)).s);
});

test('an expired token does not verify', async () => {
  const { token, exp } = await mint(env);
  assert.equal(await verify(env, token, exp), null);
});

test('an altered, re-keyed or malformed token does not verify', async () => {
  const { token } = await mint(env);
  const [body, sig] = token.split('.');
  const later = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, 'base64url')), e: Date.now() + 864e5 }))
    .toString('base64url');
  for (const bad of [`${later}.${sig}`, `${body}.${flip(sig, 0)}`, `${flip(body, 2)}.${sig}`, body, `${token}.x`, '',
    `${body}.${sig.slice(1)}`, `${body}.${'!'.repeat(43)}`, `${body}.${sig}=`, undefined]) {
    assert.equal(await verify(env, bad), null, String(bad));
  }
  assert.equal(await verify(other, token), null);
});

test('with SESSION_KEY unset or empty no token is minted or accepted, and no empty key is ever imported', async (t) => {
  const { token, exp } = await mint(env);
  const imports = t.mock.method(crypto.subtle, 'importKey');
  for (const none of [{}, { SESSION_KEY: undefined }, { SESSION_KEY: null }, { SESSION_KEY: '' }]) {
    await assert.rejects(mint(none), { message: 'SESSION_KEY is not set' });
    await assert.rejects(verify(none, token), { message: 'SESSION_KEY is not set' });
  }
  assert.equal(imports.mock.callCount(), 0, 'a runtime that takes a zero-length HMAC key is never asked to');
  assert.equal(await verify({}, 'not a token'), null, 'a malformed token is still just not a token');
  assert.deepEqual(await verify(env, token), { s: (await verify(env, token)).s, e: exp }, 'the real key still verifies after');
});
