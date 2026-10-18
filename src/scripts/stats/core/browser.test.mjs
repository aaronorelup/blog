// node --test src/scripts/stats/core/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { browserAge, newestMajor, readYou, classifyYou } from './browser.js';

test('browser ages, from the release cadence', () => {
  const c = browserAge('Chrome 124', '2026-10-17');
  assert.equal(c.year, 2024);
  assert.equal(c.month, 4);
  assert.equal(browserAge('Chrome 131 on Android', '2026-10-17').year, 2024);
  assert.equal(browserAge('Edge 99', '2026-10-17').year, 2022);
  const s = browserAge('Safari on iOS 13', '2026-10-17');
  assert.equal(s.year, 2019);
  assert.equal(s.text, 'from 2019');
  assert.equal(s.tag, 'from 2019 · 7 years');
  assert.equal(browserAge('Safari 15 on macOS', '2026-10-17').year, 2021);
  assert.ok(browserAge('Firefox 133', '2026-10-17').year === 2024);
  assert.equal(browserAge('Other old browsers', '2026-10-17'), null);
  assert.equal(browserAge('Safari on iOS 21', '2026-10-17'), null); // never shipped
});

test('newest versions at a date', () => {
  assert.ok([152, 153].includes(newestMajor('chrome', '2026-10-17')));
  assert.equal(newestMajor('safari', '2026-10-17'), 27);
  assert.equal(newestMajor('safari', '2025-03-01'), 18);
});

test('reading and sorting the reader', () => {
  const chrome = readYou({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' });
  assert.equal(chrome.browser, 'Chrome');
  assert.equal(chrome.major, 141);
  assert.equal(chrome.os, 'Windows');
  assert.equal(classifyYou(chrome, '2026-10-17').kind, 'person');
  const old = readYou({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' });
  const r = classifyYou(old, '2026-10-17');
  assert.equal(r.kind, 'stale');
  assert.ok(r.behind >= 28);
  const iphone = readYou({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1' });
  assert.equal(iphone.browser, 'Safari');
  assert.equal(iphone.os, 'iOS');
  assert.equal(iphone.mobile, true);
  assert.equal(classifyYou(iphone, '2026-10-17').kind, 'stale');
  // estimation slop never calls a nearly-current reader old
  const nearly = readYou({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
  assert.equal(classifyYou(nearly, '2026-10-17').kind, 'person');
  const bot = readYou({ webdriver: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36' });
  assert.equal(bot.headless, true);
  const rb = classifyYou(bot, '2026-10-17');
  assert.equal(rb.kind, 'agent');
  assert.equal(rb.steps.find((s) => s.q === 'program').yes, true);
});

test('Safari is aged in years across the jump from 18 to 26', () => {
  const ua = (v) => `Mozilla/5.0 (iPhone; CPU iPhone OS ${v}_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${v}.6 Mobile/15E148 Safari/604.1`;
  // iOS 18 (2024): two years old in October 2026, which the Worker files as a person (3+ years is stale)
  const s18 = classifyYou(readYou({ userAgent: ua(18) }), '2026-10-17');
  assert.equal(s18.kind, 'person');
  assert.equal(s18.behind, 2);
  assert.equal(s18.steps.find((s) => s.q === 'old').why, '18 is from 2024, about 2 years old');
  const s26 = classifyYou(readYou({ userAgent: ua(26) }), '2026-10-17');
  assert.equal(s26.kind, 'person');
  assert.equal(s26.steps.find((s) => s.q === 'old').why, '26 is from 2025, about a year old');
  assert.equal(classifyYou(readYou({ userAgent: ua(26) }), '2026-03-01').steps.find((s) => s.q === 'old').why, '26 is current');
  const s15 = classifyYou(readYou({ userAgent: ua(15) }), '2026-10-17');
  assert.equal(s15.kind, 'stale');
  assert.equal(s15.steps.find((s) => s.q === 'old').why, '15 is from 2021, about 5 years old');
});

test('Chrome before 94 shipped every six weeks', () => {
  assert.equal(browserAge('Chrome 78', '2026-10-17').year, 2019);
  assert.equal(browserAge('Chrome 60', '2026-10-17').year, 2017);
  assert.equal(browserAge('Chrome 87', '2026-10-17').year, 2020);
  assert.equal(browserAge('Chrome 94', '2026-10-17').year, 2021);
});
