// What the specs share: the pages element-usage found in dist/ (targets.json), and small media helpers that act
// through the page (play, mute, clocks, scrolling a player away). Live notebooks are never picked as targets.
import fs from 'node:fs';
import { expect } from './fixtures.mjs';

export const targets = JSON.parse(fs.readFileSync(new URL('./targets.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(new URL('../../src/data/media-manifest.json', import.meta.url), 'utf8'));
// The smallest mp4 in R2, for specs that need a plain player of their own.
export const smallVideo = Object.entries(manifest).filter(([p]) => p.endsWith('.mp4'))
  .sort((a, b) => a[1].bytes - b[1].bytes)[0][0];

// Every non-live page using a tag, in order, optionally only where an instance's attributes match.
export const pagesWith = (tag, match = () => true) =>
  [...new Set(targets.tags[tag].filter((u) => !u.live && match(u.attrs)).map((u) => u.page))];
export const pageWith = (tag, match) => pagesWith(tag, match)[0];
// The page whose instance of a tag carries the fewest media bytes: big films make slow tests.
const bytesOf = (src) => manifest[src]?.bytes ?? (fs.statSync(new URL('../../public' + src, import.meta.url), { throwIfNoEntry: false })?.size || 0);
export const lightestWith = (tag, match = () => true) => targets.tags[tag].filter((u) => !u.live && match(u.attrs))
  .map((u) => [u.page, u.media.reduce((n, src) => n + bytesOf(src), 0)]).sort((a, b) => a[1] - b[1])[0][0];
export const pagesWhere = (test) => Object.entries(targets.pages).filter(([, p]) => !p.live && test(p)).map(([u]) => u);

// Every post component on the page is defined: each tag is its own module, loaded only where it is used.
export const allDefined = (page) => page.waitForFunction(() =>
  [...document.querySelectorAll(':not(:defined)')].every((n) => !n.localName.startsWith('ao-')));

// Open a page and wait until its post components are defined. A post may fold a component into a closed <details>
// (its working, its questions); those are opened so it can be tested, unless they hold media: opening those would
// start every film in them loading, and WebKit queues a page's media behind its few connections.
export async function open(page, url) {
  await page.goto(url);
  await allDefined(page);
  await page.evaluate(() => {
    for (const d of document.querySelectorAll('[data-post-article] details')) {
      const parts = [...d.querySelectorAll('*')];
      if (parts.some((n) => n.localName.startsWith('ao-')) && !d.querySelector('video, audio, iframe')) d.open = true;
    }
  });
}

// Open each page in turn until pick(page) finds what a test needs (anything but null, false or -1), and return it.
export async function openFirst(page, urls, pick) {
  for (const url of urls) {
    await open(page, url);
    const found = await pick(page);
    if (found !== null && found !== false && found !== -1) return found;
  }
  throw new Error('none of these pages has it: ' + urls.join(' '));
}

// A muted player off screen is paused at once (that is core-4), so a player is brought into view first. Clips
// loop, so a short one never ends under a test.
export const play = (media, { muted = true } = {}) => media.evaluate((m, muted) => {
  (m.closest('ao-listen') || m).scrollIntoView({ block: 'center' });
  m.muted = muted;
  m.loop = true;
  return m.play();
}, muted);
export const playing = (media) => media.evaluate((m) => !m.paused && !m.ended);
export const clock = (media) => media.evaluate((m) => m.currentTime);
// Media stream from the live site beside three other workers: give them time.
export const expectPlaying = (media, on = true) => expect.poll(() => playing(media), { timeout: 45_000 }).toBe(on);
export const seekTo = (media, t) => media.evaluate((m, t) => { m.currentTime = t; }, t);

export const inView = (el) => el.evaluate((n) => {
  const r = n.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight;
});

// Scroll the element's own scroller (#panel-scroll on panel pages) until it is well off screen, above or below.
export async function scrollAway(el) {
  await el.evaluate((n) => {
    let s = n.parentElement;
    while (s && !(s.scrollHeight > s.clientHeight && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement;
    s ||= document.scrollingElement;
    const r = n.getBoundingClientRect();
    const top = r.top + s.scrollTop;
    s.scrollTop = top > innerHeight * 1.5 ? 0 : top + r.height + innerHeight * 1.5;
  });
  await expect.poll(() => inView(el)).toBe(false);
}
export const scrollBack = (el) => el.evaluate((n) => n.scrollIntoView({ block: 'center' }));

// The media of a page that sit in no component (a "lone" player).
export const loneMedia = (page) => page.locator('xpath=//*[@data-post-article]//*[(local-name()="video" or ' +
  'local-name()="audio") and not(ancestor::*[starts-with(local-name(), "ao-")])]');

// What a page does to the content of the controls a locator matches over ms: { nodes, text } MutationObserver records
// of their children (childList: a node of one replaced, as setting textContent or innerHTML does even to the same
// words) and of their text changed in place (characterData), over each one's subtree. On WebKit a tap whose press
// lands on a text node that is replaced before its release fires no click (<ao-listen>'s Pause, rewritten every
// frame, lost 11 of 450 clicks).
export const contentChanges = (controls, ms = 1000) => controls.evaluateAll((els, ms) => new Promise((r) => {
  const n = { nodes: 0, text: 0 };
  const count = (rs) => rs.forEach((m) => { if (m.type === 'childList') n.nodes++; else n.text++; });
  const o = new MutationObserver(count);
  for (const el of els) o.observe(el, { childList: true, characterData: true, subtree: true });
  setTimeout(() => { count(o.takeRecords()); o.disconnect(); r(n); }, ms);
}), ms);
