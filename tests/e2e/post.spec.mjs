// The post page (src/components/post/, src/scripts/views/post.js, src/scripts/post/): the short version, the
// contents list, folded details and deep links, Read next, older and newer, the byline, the share card, the RSS
// categories, a wide picture holding its place, and Reload and Back keeping the reader's place. INVENTORY rows post-*.
import fs from 'node:fs';
import matter from 'gray-matter';
import sharp from 'sharp';
import { test, expect } from './fixtures.mjs';
import { allDefined, pagesWhere, pagesWith, targets } from './helpers.mjs';
import { PROJECTS, TOPICS } from '../../src/data/taxonomy.js';

const LIVE_SITE = 'https://aaronorelup.com';
const front = (slug, dir = 'posts') =>
  matter(fs.readFileSync(new URL(`../../src/content/${dir}/${slug}.md`, import.meta.url), 'utf8')).data;
const postUrls = pagesWhere((p) => p.kind === 'post');
const slugOf = (url) => url.split('/')[2];
const desktopOnly = (info) => test.skip(info.project.name !== 'desktop', 'reads built files: one project is enough');

// The listed posts (previews.json's keys, ledger order from /ledger/), live notebooks left out of what is opened.
async function ledger(request) {
  const { posts } = await (await request.get('/ledger/previews.json')).json();
  const html = await (await request.get('/ledger/')).text();
  const order = [...html.matchAll(/<a class="row-link" href="\/ledger\/([^/]+)\/"/g)].map((m) => m[1]);
  return { posts, order, open: order.filter((s) => postUrls.includes(`/ledger/${s}/`)) };
}

// Each page's article, parsed in the browser: what a test reads of it.
async function read(page, request, urls, pick) {
  const out = {};
  for (const url of urls) out[url] = await page.evaluate(pick, await (await request.get(url)).text());
  return out;
}

test('post-1 the short version is the post\'s card in previews.json, and #short lands on it', async ({ page, request }, info) => {
  desktopOnly(info);
  const { posts, open } = await ledger(request);
  await page.goto('/404');
  const shorts = await read(page, request, open.map((s) => `/ledger/${s}/`), (html) => {
    const box = new DOMParser().parseFromString(html, 'text/html').getElementById('short');
    const text = (sel) => box?.querySelector(sel)?.textContent;
    return box && { verdict: text('.short-verdict'), takeaway: text('.short-takeaway'),
      points: [...box.querySelectorAll('.short-points li')].map((li) => li.textContent) };
  });
  for (const slug of open) {
    const { verdict, takeaway, points = [] } = posts[slug];
    expect(shorts[`/ledger/${slug}/`], slug).toEqual(takeaway ? { verdict, takeaway, points } : null);
  }
});

test('post-2 Read next: three listed posts, never the post itself; older and newer follow the ledger', async ({ page, request }, info) => {
  desktopOnly(info);
  const { posts, order, open } = await ledger(request);
  await page.goto('/404');
  const feet = await read(page, request, open.map((s) => `/ledger/${s}/`), (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const hrefs = (sel) => [...doc.querySelectorAll(sel)].map((a) => a.getAttribute('href').split('/')[2]);
    return { related: hrefs('.rel-link'), older: hrefs('.post-nav-link:not(.is-newer)')[0] ?? null,
      newer: hrefs('.post-nav-link.is-newer')[0] ?? null, threads: doc.querySelectorAll('[data-series]').length };
  });
  for (const slug of open) {
    const f = feet[`/ledger/${slug}/`];
    expect(f.related, slug).toHaveLength(3);
    expect(f.related.filter((s) => s === slug || !posts[s]), slug).toEqual([]);
    const i = order.indexOf(slug);
    expect([f.newer, f.older], slug).toEqual([order[i - 1] ?? null, order[i + 1] ?? null]);
    expect(f.threads, slug).toBe(0);
  }
});

test('post-3 a long post has a contents list: sticky beside the text on a wide screen, marking the heading read; a closed <details> on a phone', async ({ page }, info) => {
  const url = pagesWhere((p) => p.kind === 'post' && Object.keys(p.ao).length === 0)
    .find((u) => fs.readFileSync(new URL(`../../dist${u}index.html`, import.meta.url), 'utf8').includes('class="toc"'));
  await page.goto(url);
  const toc = page.locator('.toc');
  if (info.project.name === 'phone') {
    await expect(toc).toHaveJSProperty('open', false);
    expect(await toc.evaluate((t) => t.compareDocumentPosition(document.querySelector('.pc-prose')) & 4)).toBe(4);
    return;
  }
  await expect(toc).toHaveJSProperty('open', true);
  expect(await toc.evaluate((t) => getComputedStyle(t).position)).toBe('sticky');
  const third = page.locator('.toc-list a').nth(2);
  const id = decodeURIComponent((await third.getAttribute('href')).slice(1));
  await page.locator(`[id="${id}"]`).evaluate((h) => {
    const s = document.getElementById('panel-scroll');
    s.scrollTop += h.getBoundingClientRect().top - s.getBoundingClientRect().top - 10;
  });
  await expect(third).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.toc-list a[aria-current]')).toHaveCount(1);
  const box = await toc.boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeLessThan(900);
  await page.goto(pagesWhere((p) => p.kind === 'post').find((u) => !fs.readFileSync(
    new URL(`../../dist${u}index.html`, import.meta.url), 'utf8').includes('class="toc"')));
  await expect(page.locator('.toc')).toHaveCount(0);
});

test('post-4 ?hl= opens the folded details holding the term and marks it; a #target in a closed <details> opens it', async ({ page }) => {
  // A section with a <details> whose text has a long word, on a post without components (quick to load).
  const url = pagesWhere((p) => p.kind === 'post' && Object.keys(p.ao).length === 0)
    .find((u) => /<h2 id="[^"]+"[^>]*>[^]*?<details>/.test(fs.readFileSync(new URL(`../../dist${u}index.html`, import.meta.url), 'utf8')));
  await page.goto(url);
  const [anchor, word] = await page.evaluate(() => {
    for (const d of document.querySelectorAll('.pc-prose details')) {
      let h = d.previousElementSibling;
      while (h && h.tagName !== 'H2') h = h.previousElementSibling;
      const w = h && d.querySelector('p')?.textContent.match(/[A-Za-z]{7,}/)?.[0];
      if (w) return [h.id, w];
    }
  });
  await page.goto(`${url}?hl=${encodeURIComponent(word)}#${anchor}`);
  const mark = page.locator('details mark.hl').first();
  await expect(mark).toBeVisible();
  expect(await mark.evaluate((m) => m.closest('details').open)).toBe(true);
  await page.goto(url);
  await page.evaluate(() => {
    const d = document.querySelector('.pc-prose details');
    d.open = false;
    d.insertAdjacentHTML('beforeend', '<p id="inside-a-fold">x</p>');
    location.hash = 'inside-a-fold';
  });
  await expect.poll(() => page.evaluate(() => document.querySelector('.pc-prose details').open)).toBe(true);
});

test('post-5 the header: icon (or the topic glyph), id, date, minutes, topic and project filters; the byline on Claude\'s pages only', async ({ page, request }, info) => {
  desktopOnly(info);
  const claude = postUrls.find((u) => front(slugOf(u)).voice === 'claude');
  const aaron = postUrls.find((u) => !front(slugOf(u)).voice && targets.pages[`${u}notes/`]);
  await page.goto('/404');
  const heads = await read(page, request, [claude, aaron, `${aaron}notes/`], (html) => {
    const h = new DOMParser().parseFromString(html, 'text/html').querySelector('.post-head');
    return { by: h.querySelector('.post-by')?.textContent ?? null, icon: h.querySelector('img.post-icon')?.getAttribute('srcset'),
      line: h.querySelector('.post-line').textContent.replace(/\s+/g, ' ').trim(),
      chips: [...h.querySelectorAll('.chip')].map((a) => a.getAttribute('href')) };
  });
  expect(heads[claude].by).toMatch(/Claude/);
  expect(heads[aaron].by).toBeNull();
  expect(heads[`${aaron}notes/`].by === null).toBe(front(slugOf(aaron), 'notes').voice !== 'claude');
  const { id, topic } = front(slugOf(aaron));
  expect(heads[aaron].icon).toBe(`/media/icons/${id}-96.webp 96w, /media/icons/${id}.webp 256w`);
  expect(heads[aaron].line).toMatch(new RegExp(`^${id} · \\w{3} \\d\\d, \\d{4} · \\d+ min$`));
  expect(heads[aaron].chips[0]).toBe(`/ledger/?topic=${topic}`);
});

test('post-6 an unlisted post: noindex, no share card, no short version, its topic glyph for an icon, no unlisted post in Read next', async ({ page, request }) => {
  const { posts } = await ledger(request);
  const unlisted = postUrls.find((u) => !posts[slugOf(u)]);
  await page.goto(unlisted);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  await expect(page.locator('#short')).toHaveCount(0);
  await expect(page.locator('.post-icon.is-glyph svg')).toBeVisible();
  for (const a of await page.locator('.rel-link').all()) expect(posts[(await a.getAttribute('href')).split('/')[2]]).toBeTruthy();
});

test('post-7 every listed post shares an absolute 1200x630 JPEG card under 150 KB, as an article', async ({ page, request }, info) => {
  desktopOnly(info);
  const { open } = await ledger(request);
  await page.goto('/404');
  const metas = await read(page, request, open.map((s) => `/ledger/${s}/`), (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const meta = (k) => doc.querySelector(`meta[property="${k}"], meta[name="${k}"]`)?.content;
    return { image: meta('og:image'), type: meta('og:type'), time: meta('article:published_time'), card: meta('twitter:card') };
  });
  for (const slug of open) {
    const m = metas[`/ledger/${slug}/`];
    expect(m.image, slug).toMatch(new RegExp(`^${LIVE_SITE}/og/${slug}\\.jpg\\?v=[0-9a-f]{8}$`));
    expect([m.type, m.card], slug).toEqual(['article', 'summary_large_image']);
    expect(m.time, slug).toMatch(/^\d{4}-\d\d-\d\dT/);
    const res = await request.get(new URL(m.image).pathname);
    const jpg = await res.body();
    expect(jpg.length, slug).toBeLessThan(150 * 1024);
    const { format, width, height } = await sharp(jpg).metadata();
    expect([format, width, height], slug).toEqual(['jpeg', 1200, 630]);
  }
});

test('post-8 RSS categories are each post\'s topic label, then its project labels', async ({ request }, info) => {
  desktopOnly(info);
  const { posts } = await ledger(request);
  const items = [...(await (await request.get('/rss.xml')).text()).matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const labels = new Set(Object.values(PROJECTS).map((p) => p.label.replace(/&/g, '&amp;')));
  for (const item of items) {
    const slug = item.match(/<guid[^>]*>[^<]*\/ledger\/([^/]+)\//)[1];
    const cats = [...item.matchAll(/<category>([^<]*)<\/category>/g)].map((m) => m[1]);
    expect(cats[0], slug).toBe(TOPICS[posts[slug].topic].label.replace(/&/g, '&amp;'));
    expect(cats.slice(1).filter((c) => !labels.has(c)), slug).toEqual([]);
  }
});

test('post-9 a wide picture in <ao-compare> holds its own ratio before it loads, so the page never jumps', async ({ page }) => {
  const url = pagesWith('ao-compare').find((u) => u.endsWith('/notes/')) ?? pagesWith('ao-compare')[0];
  await page.route('**/*.webp', async (r) => { await new Promise((ok) => setTimeout(ok, 4000)); await r.continue(); });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await allDefined(page);
  const ratios = await page.locator('ao-compare > figure.wide > img').evaluateAll((imgs) => imgs.filter((i) => !i.complete)
    .map((i) => [i.getBoundingClientRect().height / i.getBoundingClientRect().width, i.height / i.width,
      i.getAttribute('height') / i.getAttribute('width')]));
  expect(ratios.length).toBeGreaterThan(0);
  for (const [shown, , attr] of ratios) expect(Math.abs(shown - attr)).toBeLessThan(0.02);
});

test('post-10 Reload and Back put the reader back where they were on a long post with components, with or without the page cache', async ({ page }) => {
  test.slow();
  const url = pagesWhere((p) => p.kind === 'post' && Object.keys(p.ao).length >= 2)[0];
  const scroller = page.locator('#panel-scroll');
  const at = () => scroller.evaluate((s) => s.scrollTop);
  const there = async (y) => expect.poll(async () => Math.abs((await at()) - y), { timeout: 15_000 }).toBeLessThan(40);
  await page.goto(url);
  await allDefined(page);
  const y = await scroller.evaluate((s) => { s.scrollTop = Math.round(s.scrollHeight * 0.55); return s.scrollTop; });
  await page.waitForTimeout(200);
  await page.reload();
  await allDefined(page);
  await there(y);
  for (const cached of [true, false]) {
    if (!cached) {
      await page.route(url, async (r) => {
        const res = await r.fetch();
        await r.fulfill({ response: res, headers: { ...res.headers(), 'cache-control': 'no-store' } });
      });
      await page.goto(url);
      await allDefined(page);
      await scroller.evaluate((s, y) => { s.scrollTop = y; }, y);
      await page.waitForTimeout(200);
    }
    await page.goto('/ledger/');
    await page.goBack();
    await allDefined(page);
    await there(y);
  }
});

test('post-11 the notes page: the post view without its short version, Listen, Read next or older/newer, its way back the short version', async ({ page }) => {
  const url = pagesWhere((p) => p.kind === 'notes')[0];
  await page.goto(url);
  await expect(page.locator('[data-panel-view="notes"][data-post-article]')).toHaveCount(1);
  await expect(page.locator('#short, .rel, .post-nav, .notes-link')).toHaveCount(0);
  await expect(page.locator('.post-back')).toHaveAttribute('href', url.replace(/notes\/$/, ''));
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
});
