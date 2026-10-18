// node --test src/scripts/stats/how/
// The Sieve's visitors stop at the right question, and "You" agrees with the hero's verdict.
import test from 'node:test';
import assert from 'node:assert/strict';
import { samples, youSample, resultSentence, decidedAt, GATES } from './samples.js';
import { readYou, classifyYou } from '../core/browser.js';

const THROUGH = '2026-10-17';
const by = Object.fromEntries(samples(THROUGH).map((s) => [s.key, s]));

test('each sample stops at the right gate', () => {
  assert.equal(decidedAt(by.googlebot), 0);
  assert.equal(decidedAt(by['chatgpt-user']), 0);
  assert.equal(decidedAt(by.env), 1);
  assert.equal(decidedAt(by.curl), 2);
  assert.equal(decidedAt(by.iphone), 3);
  assert.equal(decidedAt(by.chrome), -1);
  for (const s of Object.values(by)) {
    const at = decidedAt(s);
    assert.equal(s.kind, at < 0 ? 'person' : GATES[at].kind, s.key);
    // answers stop at the first yes
    assert.equal(s.answers.length, at < 0 ? 4 : at + 1, s.key);
  }
});

test('result sentences read the way the spec says', () => {
  assert.equal(resultSentence(by.googlebot), 'Googlebot: Badge? yes. Counted as a named bot.');
  assert.equal(resultSentence(by.curl), 'curl: Badge? no. Wrong door? no. A program? yes. Counted with scripts and agents.');
  assert.match(resultSentence(by.chrome), /Old browser\? no\. Probably a person\. Cloudflare's counter ran in it\.$/);
  assert.match(by.iphone.why, /^iOS 13 is from 2019, about 7 years old\./);
  assert.match(by.chrome.line2, /^Chrome 15\d on Windows · 200 OK$/);
});

const nav = (ua, extra = {}) => ({ userAgent: ua, ...extra });
const CHROME_NOW = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const CHROME_OLD = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36';
const HEADLESS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36';

test('You: the same verdict as core/browser.classifyYou, for a current, an old and a headless browser', () => {
  for (const ua of [CHROME_NOW, CHROME_OLD, HEADLESS]) {
    const n = nav(ua);
    const s = youSample(THROUGH, null, n);
    const res = classifyYou(readYou(n), THROUGH);
    assert.equal(s.kind, res.kind, ua);
    const at = decidedAt(s);
    assert.equal(at < 0 ? 'person' : GATES[at].kind, res.kind, ua);
  }
  const now = youSample(THROUGH, true, nav(CHROME_NOW));
  assert.match(now.why, /^Your browser says it's Chrome 152 on Windows\. At the gate: Badge\? no\. Wrong door\? no\. A program\? no\. Old browser\? no: 152 is about current\. You'd be counted as probably a person\./);
  assert.match(now.why, /Nothing was sent anywhere; your browser read its own name\.$/);
  assert.equal(youSample(THROUGH, null, nav(CHROME_OLD)).kind, 'stale');
  assert.equal(youSample(THROUGH, null, nav(HEADLESS)).kind, 'agent');
  assert.equal(youSample(THROUGH, null, nav(CHROME_NOW, { webdriver: true })).kind, 'agent');
});
