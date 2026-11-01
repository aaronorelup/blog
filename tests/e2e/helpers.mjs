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
export const pagesWhere = (test) => Object.entries(targets.pages).filter(([, p]) => !p.live && test(p)).map(([u]) => u);

// Open a page and wait until the post components module has defined its tags.
export async function open(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => !!customElements.get('ao-compare'));
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
export const expectPlaying = (media, on = true) => expect.poll(() => playing(media), { timeout: 30_000 }).toBe(on);
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
