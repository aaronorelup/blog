// Read-aloud karaoke (src/scripts/read-aloud/): Listen plays the recording of this version, the word being read is
// marked at every speed, a click on a word starts there, the browser's own voice reads what isn't recorded, a video
// pauses the reading, in the homepage's reader Listen works and ao-stop stops it, and a post that is never recorded
// (unlisted, a live notebook) offers the browser's voice alone. Recordings are fixtures made here from the build's
// /read/<slug>.json (silent audio, a word every 200 ms); INVENTORY rows read-*.
import { test, expect } from './fixtures.mjs';
import { loneMedia, pagesWhere, play, expectPlaying } from './helpers.mjs';

const POST = '/ledger/what-drives-claude-code-cost/';
const SHORT = '/ledger/why-im-starting-this/';
const NEVER = '/ledger/storm-bell-pop-up/'; // unlisted, so never recorded
const VIDEO_POST = pagesWhere((p) => p.kind === 'post' && p.lone >= 1)[0];
const slugOf = (url) => url.split('/')[2];
const WORD = 200; // ms

// Silent 8 kHz mono WAV of the given length.
function wav(seconds) {
  const n = Math.ceil(seconds * 8000);
  const b = Buffer.alloc(44 + n, 128);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(8000, 24); b.writeUInt32LE(8000, 28);
  b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34); b.write('data', 36); b.writeUInt32LE(n, 40);
  return b;
}

// The recording the cron would write for this build of the post, one word every WORD ms, served with its audio.
async function recorded(page, request, url) {
  const slug = slugOf(url);
  const doc = await (await request.get(`/read/${slug}.json`)).json();
  const parts = doc.sections.map((s) => {
    let t = 0;
    const words = s.blocks.flatMap(([r, , text]) => [...text.matchAll(/\S+/g)].map((m) => {
      t += WORD;
      return [r, m.index, m.index + m[0].length, t - WORD, t - 20];
    }));
    return { src: `/read/${slug}/${s.hash}.mp3`, dur: t + 300, words };
  });
  const rec = { v: 1, hash: doc.hash, parts };
  await page.route(`**/read/${slug}/${doc.hash}.json`, (r) => r.fulfill({ json: rec }));
  // In byte ranges, as R2 serves them, so the browser can seek.
  await page.route(`**/read/${slug}/*.mp3`, (r) => {
    const body = wav(parts.find((p) => r.request().url().endsWith(p.src)).dur / 1000);
    const [, a, b] = /bytes=(\d+)-(\d*)/.exec(r.request().headers().range ?? '') ?? [];
    if (a === undefined) return r.fulfill({ body, contentType: 'audio/wav', headers: { 'Accept-Ranges': 'bytes' } });
    const end = b ? Math.min(Number(b), body.length - 1) : body.length - 1;
    return r.fulfill({ status: 206, body: body.subarray(Number(a), end + 1), contentType: 'audio/wav',
      headers: { 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${a}-${end}/${body.length}` } });
  });
  return rec;
}
const unrecorded = (page, url) => page.route(`**/read/${slugOf(url)}/*.json`, (r) => r.fulfill({ json: { ready: false } }));

// What the reader is doing, read in one go: the recording's clock, the marked word and block.
const state = (page) => page.evaluate(() => {
  const bar = document.querySelector('.ra-bar');
  const a = bar?.aoClock();
  const [range] = CSS.highlights.get('ao-read') ?? [];
  return { t: a?.currentTime, src: a && new URL(a.src).pathname, paused: a?.paused, rate: a?.playbackRate,
           playing: bar?.aoPlaying(), word: range?.toString(), block: document.querySelector('.ra-on')?.dataset.r };
});
// The words a part says around time t (seconds): the one started by then, and the one before it.
const wordsAt = (rec, src, t) => {
  const part = rec.parts.find((p) => p.src === src);
  const i = part.words.findLastIndex((w) => w[3] <= t * 1000);
  return [i, i - 1].filter((k) => k >= 0).map((k) => part.words[k]);
};
const textOf = (page, [r, c0, c1]) => page.locator(`[data-r="${r}"]`).first().evaluate(
  (el, [c0, c1]) => el.textContent.replace(/\s+/g, ' ').trim().slice(c0, c1), [c0, c1]);
async function marksWhatPlays(page, rec) {
  const s = await state(page);
  expect(s.paused).toBe(false);
  const near = await Promise.all(wordsAt(rec, s.src, s.t).map((w) => textOf(page, w)));
  expect(near).toContain(s.word);
}

const listen = (page) => page.locator('[data-read-aloud]').first();
// The screen point of display character c of block r (its text collapsed and trimmed, as the build counts it), once
// the block is scrolled to the middle as a reader would: a wheel turn, so the page stops following the reading.
const pointOf = (page, r, c) => page.locator(`[data-r="${r}"]`).first().evaluate((el, c) => {
  el.dispatchEvent(new WheelEvent('wheel', { bubbles: true }));
  el.scrollIntoView({ block: 'center' });
  let seen = -1, gap = false;
  for (const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n = { node: null }; (n.node = w.nextNode());) {
    for (let i = 0; i < n.node.data.length; i++) {
      if (/\s/.test(n.node.data[i])) { gap = true; continue; }
      seen += gap && seen >= 0 ? 2 : 1;
      gap = false;
      if (seen !== c) continue;
      const range = document.createRange();
      range.setStart(n.node, i);
      range.setEnd(n.node, i + 1);
      const b = range.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    }
  }
  return null;
}, c);

// The fifth word of a paragraph in the recording's fourth part, its paragraph's words and its part.
function midParagraph(rec) {
  const part = rec.parts[3];
  const paragraph = Object.values(Object.groupBy(part.words, (w) => w[0]))
    .find((ws) => typeof ws[0][0] === 'number' && ws.length > 8);
  return { part, paragraph, target: paragraph[4] };
}

test('read-1 Listen plays the recording; the word read is marked at 1x and 2x; the four speeds set playbackRate', async ({ page, request }) => {
  const rec = await recorded(page, request, POST);
  await page.goto(POST);
  await expect(listen(page)).toBeVisible();
  await listen(page).click();
  await expect(page.locator('[data-post-article].karaoke .ra-bar')).toBeVisible();
  await expect(page.locator('.ra-note')).toHaveText('Click any word to start there.');
  await expect(page.locator('.ra-voice [data-voice="recorded"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await state(page)).t, { timeout: 5000 }).toBeGreaterThan(0.5);
  expect((await state(page)).block).toBe('t');
  for (let k = 0; k < 3; k++) { await marksWhatPlays(page, rec); await page.waitForTimeout(450); }
  const speed = page.locator('.ra-speed');
  for (const [label, rate] of [['1.25x', 1.25], ['1.5x', 1.5], ['2x', 2]]) {
    await speed.click();
    await expect(speed).toHaveText(label);
    expect((await state(page)).rate).toBe(rate);
  }
  for (let k = 0; k < 3; k++) { await marksWhatPlays(page, rec); await page.waitForTimeout(450); }
  await speed.click();
  await expect(speed).toHaveText('1x');
  expect((await state(page)).rate).toBe(1);
  await page.locator('.ra-play').click();
  await expect.poll(async () => (await state(page)).paused).toBe(true);
  await page.locator('.ra-close').click();
  await expect(page.locator('.ra-bar')).toHaveCount(0);
  await expect(page.locator('[data-post-article]')).not.toHaveClass(/karaoke/);
});

test('read-2 a click on a word mid-paragraph starts there within a second, within 0.3 s of the word', async ({ page, request }) => {
  const rec = await recorded(page, request, POST);
  await page.goto(POST);
  await listen(page).click();
  await expect.poll(async () => (await state(page)).playing).toBe(true);
  const { part, paragraph, target } = midParagraph(rec);
  const box = await pointOf(page, target[0], target[1] + 1);
  // Timed in the page: the click, the first moment the reading plays in the word's part, and the first word marked
  // in the word's block (read on every frame, so a slow runner can't let the reading move on before it is seen).
  await page.evaluate(([src, r]) => {
    const a = document.querySelector('.ra-bar').aoClock();
    addEventListener('click', () => { window.__clicked = performance.now(); }, { capture: true, once: true });
    const seen = () => {
      if (window.__start || !window.__clicked || a.paused || a.readyState < 2 || !a.src.endsWith(src)) return;
      window.__start = { t: a.currentTime, after: performance.now() - window.__clicked };
    };
    for (const type of ['playing', 'seeked', 'timeupdate']) a.addEventListener(type, seen);
    (function first() {
      const [range] = CSS.highlights.get('ao-read') ?? [];
      if (window.__clicked && range?.startContainer.parentElement.closest('[data-r]').dataset.r === r) {
        window.__first = range.toString();
      } else requestAnimationFrame(first);
    })();
  }, [part.src, String(target[0])]);
  await page.mouse.click(box.x, box.y);
  const start = await expect.poll(() => page.evaluate(() => window.__start), { timeout: 5000 }).toBeTruthy()
    .then(() => page.evaluate(() => window.__start));
  expect(start.after).toBeLessThan(1000);
  expect(Math.abs(start.t - target[3] / 1000)).toBeLessThan(0.3);
  await expect.poll(async () => (await state(page)).block).toBe(String(target[0]));
  expect([await textOf(page, target), await textOf(page, paragraph[5])]).toContain(await page.evaluate(() => window.__first));
});

test('read-2b a click on a word while the first part of the recording is still loading reads and marks from there', async ({ page, request }) => {
  const rec = await recorded(page, request, POST);
  // The first part comes late, so the click lands while the reading's first play() is still waiting on it.
  await page.route(`**${rec.parts[0].src}`, async (r) => { await new Promise((ok) => setTimeout(ok, 2000)); await r.fallback(); });
  await page.goto(POST);
  const { target } = midParagraph(rec);
  await listen(page).click();
  await expect(page.locator('.ra-bar')).toBeVisible();
  const box = await pointOf(page, target[0], target[1] + 1);
  await page.mouse.click(box.x, box.y);
  await expect.poll(async () => (await state(page)).block).toBe(String(target[0]));
  await expect(page.locator('.ra-play')).toHaveAttribute('aria-label', 'Pause');
  expect((await state(page)).playing).toBe(true);
});

// A stand-in for Chromium's voice: window.__said lists the utterances, and window.__step() says the next word of the
// one being said (its boundary event), then ends it, as a real voice would.
const standInVoice = (page) => page.addInitScript(() => {
  const said = (window.__said = []);
  let now = null;
  window.speechSynthesis.cancel = () => { now = null; };
  window.speechSynthesis.speak = (u) => {
    said.push({ text: u.text, rate: u.rate });
    now = { u, words: [...u.text.matchAll(/\S+/g)], i: 0 };
    u.onstart?.({});
  };
  window.__step = () => {
    const { u, words, i } = now;
    now.i++;
    if (i < words.length) u.onboundary?.({ name: 'word', charIndex: words[i].index, charLength: words[i][0].length });
    else { now = null; u.onend?.({}); }
  };
});

test('read-3 with no recording of this version, the browser voice reads, marks the word, takes the speed and a click', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'read-3b checks the real voice in WebKit');
  await standInVoice(page);
  await unrecorded(page, SHORT);
  await page.goto(SHORT);
  await listen(page).click();
  await expect(page.locator('.ra-note')).toHaveText('The recording of this version is on its way.');
  await expect(page.locator('.ra-voice [data-voice="speech"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.ra-voice [data-voice="recorded"]')).toBeDisabled();
  const title = await page.locator('[data-r="t"]').innerText();
  await expect.poll(() => page.evaluate(() => window.__said.length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__said[0].text)).toBe(title);
  await page.evaluate(() => { window.__step(); window.__step(); });
  expect((await state(page)).word).toBe(title.split(' ')[1]);
  expect((await state(page)).block).toBe('t');
  for (const _ of title.split(' ')) await page.evaluate(() => window.__step()); // the title's last words, its end
  await expect.poll(() => page.evaluate(() => window.__said.length)).toBe(2);
  expect(await page.evaluate(() => window.__said[1].text)).toBe(await page.locator('[data-r="s"]').innerText());
  await page.locator('.ra-speed').click();
  await expect.poll(() => page.evaluate(() => window.__said.at(-1).rate)).toBe(1.25);
  // A click on the second paragraph's third word: the next utterance starts with it.
  const words = (await page.locator('[data-r="1"]').evaluate((el) => el.textContent)).trim().split(/\s+/);
  const box = await pointOf(page, '1', words.slice(0, 2).join(' ').length + 2);
  await page.mouse.click(box.x, box.y);
  await expect.poll(() => page.evaluate(() => window.__said.at(-1).text.split(' ').slice(0, 2).join(' ')))
    .toBe(words.slice(2, 4).join(' '));
});

test('read-3b the real browser voice reads a post with no recording (WebKit)', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'Chromium runs the stand-in voice (read-3)');
  await unrecorded(page, SHORT);
  await page.goto(SHORT);
  await listen(page).click();
  await expect(page.locator('.ra-voice [data-voice="speech"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => speechSynthesis.speaking || speechSynthesis.pending), { timeout: 5000 }).toBe(true);
  await expect(page.locator('.ra-bar .ra-play')).toHaveAttribute('aria-label', 'Pause');
  await page.locator('.ra-play').click();
  await expect.poll(() => page.evaluate(() => speechSynthesis.speaking)).toBe(false);
});

test('read-4 a video starting pauses the reading, the reading starting pauses the video, and ao-stop stops it', async ({ page, request }) => {
  await recorded(page, request, VIDEO_POST);
  await page.goto(VIDEO_POST);
  await listen(page).click();
  await expect.poll(async () => (await state(page)).playing).toBe(true);
  const v = loneMedia(page).first();
  await play(v);
  await expectPlaying(v);
  await expect.poll(async () => (await state(page)).paused).toBe(true);
  expect((await state(page)).playing).toBe(false);
  await page.locator('.ra-play').click();
  await expect.poll(async () => (await state(page)).paused).toBe(false);
  await expectPlaying(v, false);
  // ao-stop (the homepage closing its panel) stops the reading too.
  await page.evaluate(() => document.dispatchEvent(new Event('ao-stop')));
  await expect.poll(async () => (await state(page)).paused).toBe(true);
  expect((await state(page)).playing).toBe(false);
});

test('read-5 in the homepage reader Listen works, and closing the panel (ao-stop) stops it', async ({ page, request }) => {
  await recorded(page, request, POST);
  await page.goto('/?tier=low');
  await expect(page.locator('#stop-rail [data-goto]').first()).toBeVisible({ timeout: 20_000 });
  const card = page.locator('section[data-wp]').filter({ has: page.locator('a[href="/ledger"]') }).first();
  for (let k = 0; k < 6 && await card.evaluate((s) => s.inert); k++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(3000);
  }
  const link = card.locator('a[href="/ledger"]').first();
  const at = await link.boundingBox();
  await page.mouse.click(at.x + at.width / 2, at.y + at.height / 2);
  await expect(page.locator('#panel-screen')).toHaveAttribute('aria-hidden', 'false');
  await page.locator(`#panel-screen [data-panel-view="ledger"] [data-ledger-entry="${slugOf(POST)}"]`).first().click();
  const reader = page.locator('[data-panel-host] [data-post-article]');
  await expect(reader).toHaveAttribute('data-slug', slugOf(POST));
  await reader.locator('[data-read-aloud]').click();
  await expect(reader.locator('.ra-bar')).toBeVisible();
  await expect.poll(async () => (await state(page)).t, { timeout: 5000 }).toBeGreaterThan(0.3);
  // Closing the panel stops the reading: ao-stop pauses it, and unmounting the view closes the reader and its bar.
  const audio = await page.evaluateHandle(() => document.querySelector('.ra-bar').aoClock());
  await page.keyboard.press('Escape');
  await expect(page.locator('#panel-screen')).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => audio.evaluate((a) => a.paused)).toBe(true);
});

test('read-6 the build lists the posts it records, never the live notebook or an unlisted post; a version not recorded answers 200 ready: false', async ({ page, request }) => {
  const index = await (await request.get('/read/index.json')).json();
  for (const slug of ['teardown-lab', slugOf(NEVER)]) {
    expect(index.posts[slug]).toBeUndefined();
    expect((await request.get(`/read/${slug}.json`)).status()).toBe(404);
  }
  expect(index.posts[slugOf(POST)].hash).toBe(await (async () => {
    await page.goto(POST);
    return listen(page).getAttribute('data-read-hash');
  })());
  const missing = await page.evaluate(() => fetch('/read/why-im-starting-this/00000000.json').then(async (r) => [r.status, await r.json()]));
  expect(missing).toEqual([200, { ready: false }]);
});

test('read-7 a post that is never recorded offers the browser voice alone, with no word of a recording', async ({ page, browserName }) => {
  const real = browserName === 'webkit'; // WebKit's own voice; Chromium's stand-in, as in read-3
  if (!real) await standInVoice(page);
  const asked = [];
  page.on('request', (r) => { if (new URL(r.url()).pathname.startsWith('/read/')) asked.push(r.url()); });
  await page.goto(NEVER);
  await expect(listen(page)).toBeVisible();
  expect(await listen(page).getAttribute('data-read-hash')).toBeNull();
  await listen(page).click();
  await expect(page.locator('.ra-bar')).toBeVisible();
  await expect(page.locator('.ra-voice')).toBeHidden();
  await expect(page.locator('.ra-note')).toHaveText('Click any word to start there.');
  if (real) {
    await expect.poll(() => page.evaluate(() => speechSynthesis.speaking || speechSynthesis.pending), { timeout: 5000 }).toBe(true);
  } else {
    await expect.poll(() => page.evaluate(() => window.__said.length)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.__said[0].text)).toBe(await page.locator('[data-r="t"]').innerText());
  }
  await expect(page.locator('.ra-play')).toHaveAttribute('aria-label', 'Pause');
  expect(asked).toEqual([]);
});
