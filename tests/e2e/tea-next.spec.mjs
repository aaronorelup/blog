// The tea room being rebuilt, page-level (5.1, 5.2, 5.3), at /labs/tea-room/engine/ until the swap (piece 6a renames this file
// tea.spec.mjs and changes the address in tea/base.mjs). Every expectation comes from the picks, the registry and
// the copy, so the rows hold whatever the owner picks. The live notebook only ever warns (tea/base.mjs).
import fs from 'node:fs';
import matter from 'gray-matter';
import { CHAPTERS, PICKS, TEA, expect, live, sections, settle, test, undecoded, watchConsole } from './tea/base.mjs';

const roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'][n];
const squash = (s) => s.replace(/\s+/g, ' ').trim();
const numeral = (id) => (id === 'hero' ? '' : roman(CHAPTERS.filter((c) => c.id !== 'hero').findIndex((c) => c.id === id) + 1));

test('tea-next-1 the sections are the picks\' chapters in order, each with its anchor, its h2 and one statement, listed alike in the hero slip, the bookmark and the tab', async ({ page }) => {
  await page.goto(TEA);
  const secs = await page.locator('[data-room-chapter]').evaluateAll((all) => all.map((s) => ({
    id: s.dataset.roomChapter, anchor: s.querySelector(':scope > .room-anchor')?.id,
    h2: s.querySelector('h2')?.textContent, said: s.querySelector('h2 + p.room-statement')?.textContent,
  })));
  expect(secs.map((s) => s.id)).toEqual(CHAPTERS.map((c) => c.id));
  for (const [i, s] of secs.entries()) {
    const c = CHAPTERS[i];
    expect(s.anchor).toBe(c.dom);
    if (c.id === 'hero') continue;
    expect(squash(s.h2)).toBe(c.title);
    expect(squash(s.said ?? '').length).toBeGreaterThan(0);
  }
  const rest = CHAPTERS.filter((c) => c.id !== 'hero');
  const slip = await page.locator('.room-slip-index a').evaluateAll((as) => as.map((a) => [a.getAttribute('href'), a.textContent]));
  expect(slip.map(([h]) => h)).toEqual(rest.map((c) => `#${c.dom}`));
  slip.forEach(([, t], i) => expect(squash(t)).toBe(`${numeral(rest[i].id)} ${rest[i].title}`));
  for (const list of ['.room-bookmark-list', '.room-tab-list']) {
    const got = await page.locator(`${list} a`).evaluateAll((as) => as.map((a) => [a.getAttribute('href'), [...a.children].map((c) => c.textContent).join(' ')]));
    expect(got.map(([h]) => h)).toEqual(CHAPTERS.map((c) => `#${c.dom}`));
    got.forEach(([, t], i) => expect(squash(t)).toBe(squash(`${numeral(CHAPTERS[i].id)} ${CHAPTERS[i].title}`)));
  }
});

test('tea-next-2 each chapter shows exactly its shelves\' posts, in order, each once, and its one closing link; no other post link', async ({ page }) => {
  await page.goto(TEA);
  const all = [];
  for (const c of CHAPTERS) {
    const want = Object.entries(PICKS.shelves).filter(([k]) => k.startsWith(`${c.id}/`)).flatMap(([, s]) => s.picks)
      .filter((p) => p.startsWith('p-')).map((p) => `/ledger/${p.slice(2)}/`);
    const got = await page.locator(`[data-room-chapter="${c.id}"] a[href^="/ledger/"]`).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    const posts = got.filter((h) => /^\/ledger\/[^/?]+\/$/.test(h));
    if (c.id !== 'projects') expect(posts, c.id).toEqual(want);
    if (c.kind === 'topic') expect(got.filter((h) => h.startsWith('/ledger/?topic=')), c.id).toHaveLength(1);
    all.push(...posts);
  }
  // the machines: each its own address in the lab; projects: one link to each picked project
  const machines = (PICKS.shelves['tv/machines']?.picks ?? []).map((m) => `/labs/teardown/${m.slice(2)}/`);
  if (CHAPTERS.some((c) => c.id === 'tv')) {
    const got = await page.locator('[data-room-chapter="tv"] a[href^="/labs/teardown/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(got).toEqual(machines);
  }
  if (CHAPTERS.some((c) => c.id === 'projects')) {
    const picked = Object.entries(PICKS.shelves).filter(([k]) => k.startsWith('projects/')).flatMap(([, s]) => s.picks);
    expect(await page.locator('[data-room-chapter="projects"] .room-slip-title a').count()).toBe(picked.length);
  }
  const outside = await page.locator('a[href^="/ledger/"]:not([data-room-chapter] a)').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(outside.filter((h) => /^\/ledger\/[^/?]+\/$/.test(h))).toEqual([]);
});

test('tea-next-3 courses: the two courses, their names and links', async ({ page }) => {
  await page.goto(TEA);
  const sec = page.locator('[data-room-chapter="courses"]');
  // COURSES (src/data/courses.js imports JSON the way only the build reads, so its two hrefs and titles are read as text)
  const src = fs.readFileSync(new URL('../../src/data/courses.js', import.meta.url), 'utf8').split('export const NEXT_COURSE')[0];
  const COURSES = [...src.matchAll(/href: '([^']+)',\s*title: '([^']+)'/g)].map(([, href, title]) => ({ href, title }));
  expect(COURSES).toHaveLength(2);
  for (const c of COURSES) await expect(sec.locator(`a[href="${c.href}"]`)).toContainText(c.title);
});

test('tea-next-9 the index marks the chapter whose section holds the scroll position', async ({ page, isMobile }) => {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  for (const s of await sections(page)) {
    await page.evaluate((y) => scrollTo(0, y), Math.round(s.top + s.height / 2));
    await settle(page);
    const list = isMobile ? '.room-tab-list' : '.room-bookmark-list';
    await expect(page.locator(`${list} a[aria-current="true"]`)).toHaveAttribute('data-room-link', s.id);
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('tea-next-10 the page is book mode: every chapter, word, picture and link shows, no stage, no empty section', async ({ page }) => {
    await page.goto(TEA);
    await expect(page.locator('html')).not.toHaveAttribute('data-room', /./);
    await expect(page.locator('.room-stage').first()).toBeHidden();
    for (const c of CHAPTERS) {
      const sec = page.locator(`[data-room-chapter="${c.id}"]`);
      expect((await sec.boundingBox()).height, c.id).toBeGreaterThan(200);
      if (c.id !== 'hero') await expect(sec.locator('h2')).toBeVisible();
      await expect(sec.locator('.room-still img')).toHaveCount(1);
      for (const a of await sec.locator('a[href]').all()) await expect(a).toBeVisible();
    }
  });
});

test('tea-next-12 one h1, the hero\'s; each chapter\'s first heading its h2; the first Tab is the skip link; nine Tab stops are in the frame with a ring', async ({ page }) => {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  await expect(page.locator('h1')).toHaveCount(1);
  for (const c of CHAPTERS.filter((x) => x.id !== 'hero')) {
    const first = page.locator(`[data-room-chapter="${c.id}"] :is(h1, h2, h3, h4)`).first();
    await expect(first).toHaveAttribute('id', `${c.dom}-title`);
  }
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveClass(/room-skip/);
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    await settle(page);
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { inside: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth, ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 };
    });
    expect(f, `Tab stop ${i + 2}`).toEqual({ inside: true, ring: true });
  }
});

test('tea-next-14 under 1024 px the tab shows the current numeral and short name whole; its sheet lists every chapter and closes on a choice', async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 900, height: 900 });
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const target = CHAPTERS[2];
  await page.locator('.room-tab > summary').click();
  await expect(page.locator('.room-tab-list a')).toHaveCount(CHAPTERS.length);
  for (const a of await page.locator('.room-tab-list a').all()) expect((await a.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.locator(`.room-tab-list a[data-room-link="${target.id}"]`).click();
  await expect(page.locator('.room-tab')).not.toHaveAttribute('open', '');
  await settle(page);
  const now = page.locator(`.room-tab-now[data-room-now="${target.id}"]`);
  await expect(now).toBeVisible();
  expect(squash(await now.textContent())).toBe(`${numeral(target.id)} ${target.short}`);
  const box = await now.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
});

test('tea-next-17 an address with a chapter lands on its opening frame in one step: the screens open, its word in view; #ledger lands on the first topic', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ys = [];
    const f = () => { window.__ys.push(Math.round(scrollY)); requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  const c = CHAPTERS[4];
  await page.goto(`${TEA}?still=1#${c.dom}`);
  await settle(page);
  const end = await page.evaluate(() => Math.round(scrollY));
  expect(await page.evaluate((end) => window.__ys.filter((y) => y > 0 && Math.abs(y - end) > 2), end)).toEqual([]);
  const state = await page.evaluate(() => window.__room.state());
  expect(state.on).toBe(`${c.id}/main`);
  expect(state.screens.every((s) => !s.shown)).toBe(true);
  const word = await page.evaluate(() => {
    const w = document.querySelector(`.room-group:not([hidden]) .room-comp[data-comp="${document.documentElement.dataset.comp}"] .room-word`);
    const r = w?.getBoundingClientRect();
    return r && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
  });
  expect(word).toBe(true);
  const topic = CHAPTERS.find((x) => x.kind === 'topic');
  await page.goto(`${TEA}?still=1#ledger`);
  await settle(page);
  expect((await page.evaluate(() => window.__room.state())).on).toBe(`${topic.id}/main`);
});

test('tea-next-13 no console message, no sideways scroll, and every picture in reach has decoded, at every chapter\'s opening frame and every half screen', async ({ page }) => {
  test.setTimeout(300_000);
  const problems = watchConsole(page);
  const heavy = [];
  page.on('request', (r) => { if (/\.glb(\?|$)|\/three\.|GLTFLoader/.test(r.url())) heavy.push(r.url()); });
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const secs = await sections(page);
  const vh = secs[0].vh;
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const ys = [...secs.map((s, i) => Math.round(s.top + (i === 1 ? 0 : 0.5 * s.vh))), ...Array.from({ length: Math.floor(max / (vh / 2)) + 1 }, (_, i) => Math.round(i * vh / 2))];
  const bad = [];
  for (const y of ys) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await settle(page);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) bad.push(`${y}: sideways`);
    const u = await undecoded(page);
    if (u.length) bad.push(`${y}: ${u.join(', ')}`);
  }
  expect(bad).toEqual([]);
  expect(problems).toEqual([]);
  expect(heavy, 'no three and no model before the 3D chapter asks (the stub never does)').toEqual([]);
});

test('tea-next-8 the room leads back to the main site: one link to / in the hero slip, in the index as shown, and in the footer, which carries the main nav', async ({ page }) => {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  await expect(page.locator('.room-title-slip a[href="/"]')).toHaveCount(1);
  // under 1024 px the index's way back is in the tab's sheet: open it
  if (await page.locator('.room-tab > summary').isVisible()) await page.locator('.room-tab > summary').click();
  const shown = await page.locator('.room-index a[href="/"]').evaluateAll((as) => as.filter((a) => a.getClientRects().length && getComputedStyle(a).display !== 'none' && !a.closest('details:not([open])')).length);
  expect(shown).toBe(1);
  await expect(page.locator('.tea-foot a[href="/"]')).toHaveCount(1);
  const { NAV } = await import('../../src/data/site.js');
  for (const n of NAV) await expect(page.locator(`.tea-foot-nav a[href="${n.href}"]`)).toHaveCount(1);
});

test('tea-next-24 the page\'s planned places are its real ones: the screens are fully shut at every section\'s top from the third chapter on', async ({ page, isMobile }) => {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  for (const s of (await sections(page)).slice(2)) {
    await page.evaluate((y) => scrollTo(0, Math.round(y)), s.top);
    await settle(page);
    expect(await page.evaluate(() => window.__room.frame.screens.shut), s.id).toBe(1);
  }
});

test('tea-next-18 head and tail: each chapter\'s first paper begins 1.2 vh in (1.0 after the hero) and its last ends 0.6 vh before its end (1.6 when last); the screens are shut when the footer comes in', async ({ page }) => {
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const got = await page.evaluate(() => [...document.querySelectorAll('[data-room-chapter]')].map((s) => {
    const top = s.getBoundingClientRect().top + scrollY;
    const papers = [...s.querySelectorAll('.room-paper')].map((p) => p.getBoundingClientRect()).map((r) => [r.top + scrollY - top, r.bottom + scrollY - top]);
    return { id: s.dataset.roomChapter, h: s.getBoundingClientRect().height, first: Math.min(...papers.map((p) => p[0])), last: Math.max(...papers.map((p) => p[1])) };
  }));
  const vh = await page.evaluate(() => document.querySelector('.room-lvh').getBoundingClientRect().height);
  got.forEach((c, i) => {
    if (i === 0 || !Number.isFinite(c.first)) return;
    expect(c.first / vh, `${c.id} head`).toBeGreaterThanOrEqual((i === 1 ? 1.0 : 1.2) - 0.005);
    expect((c.h - c.last) / vh, `${c.id} tail`).toBeGreaterThanOrEqual((i === got.length - 1 ? 1.6 : 0.6) - 0.005);
  });
  const foot = await page.evaluate(() => document.querySelector('.room-end').getBoundingClientRect().top + scrollY - innerHeight);
  await page.evaluate((y) => scrollTo(0, Math.ceil(y)), foot);
  await settle(page);
  expect((await page.evaluate(() => window.__room.frame.screens.shut))).toBe(1);
});

test('tea-next-19 no layout shift from load to settled and through a scripted scroll', async ({ page }) => {
  await page.addInitScript(() => {
    window.__shift = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__shift += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(TEA);
  await settle(page);
  for (const s of [0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
    await page.evaluate((s) => scrollTo(0, Math.round(s * (document.documentElement.scrollHeight - innerHeight))), s);
    await settle(page);
  }
  expect(await page.evaluate(() => window.__shift)).toBe(0);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('tea-next-20 the page is book mode, nothing runs or plays, and two frames 700 ms apart are the same at six places', async ({ page }) => {
    await page.goto(TEA);
    await expect(page.locator('html')).not.toHaveAttribute('data-room', /./);
    for (const s of [0, 0.15, 0.35, 0.55, 0.75, 0.95]) {
      await page.evaluate((s) => scrollTo(0, Math.round(s * (document.documentElement.scrollHeight - innerHeight))), s);
      await page.waitForTimeout(400);
      const a = await page.screenshot();
      await page.waitForTimeout(700);
      expect(Buffer.compare(a, await page.screenshot()), `at ${s}`).toBe(0);
      expect(await page.evaluate(() => document.getAnimations().filter((x) => x.playState === 'running').length)).toBe(0);
      expect(await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.paused).length)).toBe(0);
    }
  });
});

test('tea-next-21 Save-Data: book mode, and no request for a loop, a film, three or a model', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }));
  const asked = [];
  page.on('request', (r) => { if (/\.(mp4|webm|glb)(\?|$)|three/.test(r.url())) asked.push(r.url()); });
  await page.goto(TEA);
  await expect(page.locator('html')).not.toHaveAttribute('data-room', /./);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  expect(asked).toEqual([]);
});

test('tea-next-22 the closed index (the bookmark, under 1024 px the tab) covers no text at any chapter\'s rest places', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(`${TEA}?still=1`);
  await settle(page);
  const wide = await page.evaluate(() => innerWidth >= 1024);
  const box = await page.locator(wide ? '.room-bookmark-face' : '.room-tab-face').boundingBox();
  const places = await page.evaluate(() => [...document.querySelectorAll('[data-room-chapter]')].flatMap((s) => {
    const top = s.getBoundingClientRect().top + scrollY;
    const vh = document.querySelector('.room-lvh').getBoundingClientRect().height;
    return [top + 0.5 * vh, ...[...s.querySelectorAll('[data-room-mark]')].map((m) => m.getBoundingClientRect().top + scrollY - vh * 0.5)];
  }));
  const hits = [];
  for (const y of places) {
    await page.evaluate((y) => scrollTo(0, Math.max(0, Math.round(y))), y);
    await settle(page);
    hits.push(...await page.evaluate((b) => {
      const meets = (r) => r.width > 0 && r.height > 0 && r.left < b.x + b.width && r.right > b.x && r.top < b.y + b.height && r.bottom > b.y;
      const out = [];
      const texts = [...document.querySelectorAll(`.room-paper, .room-group:not([hidden]) .room-comp[data-comp="${document.documentElement.dataset.comp}"] > .room-word`)]
        .filter((el) => !el.closest('[hidden]') && !el.closest('.room-index'));
      for (const el of texts) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          for (const r of range.getClientRects()) if (meets(r)) out.push(`${scrollY}: "${n.textContent.trim().slice(0, 30)}"`);
        }
      }
      return out;
    }, box));
  }
  expect(hits).toEqual([]);
});

test('tea-next-23 the footer is today\'s: every element\'s computed style equals /tea/\'s', async ({ page }) => {
  const read = async (url) => {
    await page.goto(url);
    // /tea/'s utilities fade in once when they come into view: read both pages after that has ended
    await page.locator('.tea-foot').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    return page.evaluate(() => {
      const skip = new Set(['width', 'height', 'inline-size', 'block-size', 'perspective-origin', 'transform-origin', 'min-width', 'max-width', 'inset-block-start', 'top', 'grid-template-columns']);
      const els = [document.querySelector('.tea-utils'), ...document.querySelectorAll('.tea-utils *'), document.querySelector('.tea-foot'), ...document.querySelectorAll('.tea-foot *')];
      return els.map((el) => {
        const cs = getComputedStyle(el);
        return Object.fromEntries([...cs].filter((p) => !skip.has(p) && !p.startsWith('--')).map((p) => [p, cs.getPropertyValue(p)]));
      });
    });
  };
  const today = await read('/tea/?hero=off');
  const ours = await read(TEA);
  expect(ours.length).toBe(today.length);
  ours.forEach((s, i) => expect(s, `footer element ${i}`).toEqual(today[i]));
});

test('tea-next-16 /labs/tea-room/engine/ says noindex, and no sitemap, feed, index or other page names it', async ({ request }) => {
  const page = await request.get(TEA);
  expect(page.status()).toBe(200);
  const head = (await page.text()).split('</head>')[0];
  expect(head).toMatch(/<meta name="robots" content="[^"]*\bnoindex\b/);
  expect(head).not.toMatch(/property="og:image"|name="twitter:card"|application\/ld\+json/);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const f of ['/sitemap.xml', '/rss.xml', '/ledger/previews.json', '/search/manifest.json', '/ask/manifest.json', '/read/index.json']) {
    expect(f === '/sitemap.xml' ? sitemap : await (await request.get(f)).text(), f).not.toContain('/labs/tea-room/engine');
  }
  const pages = ['/tea/', '/404.html', ...[...sitemap.matchAll(/<loc>[a-z]+:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])];
  expect(pages.length).toBeGreaterThan(100);
  const naming = [];
  for (let i = 0; i < pages.length; i += 25) {
    await Promise.all(pages.slice(i, i + 25).map(async (p) => { if ((await (await request.get(p)).text()).includes('/labs/tea-room/engine')) naming.push(p); }));
  }
  expect(naming).toEqual([]);
});

test('tea-next-4 every internal link and picture on the page resolves (the live notebook only warns)', async ({ page, request }) => {
  await page.goto(TEA);
  const urls = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href], img[src], img[data-src], source[srcset]')]
    .map((e) => e.getAttribute('href') ?? e.getAttribute('src') ?? e.getAttribute('data-src') ?? e.getAttribute('srcset')))]);
  const ids = new Set(await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id)));
  const bad = [];
  for (const u of urls) {
    if (u.startsWith('#')) { if (!ids.has(u.slice(1))) bad.push(u); continue; }
    if (!u.startsWith('/') || u.startsWith('//')) continue;
    const r = await request.get(u.split('#')[0]);
    if (r.status() !== 200) (live(u) ? console.warn : (m) => bad.push(m))(`${r.status()} ${u}`);
  }
  expect(bad).toEqual([]);
});

test('tea-next-5 no draft or unlisted post anywhere on the page: no slug, and no title or id of its own in its text or any attribute, outside Now\'s and About\'s words', async ({ page, request }) => {
  const dir = new URL('../../src/content/posts/', import.meta.url);
  const hidden = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.slice(0, -3), data: matter(fs.readFileSync(new URL(f, dir), 'utf8')).data }))
    .filter(({ data }) => data.draft === true || data.unlisted === true);
  const html = await (await request.get(TEA)).text();
  for (const { slug } of hidden) expect(html, slug).not.toMatch(new RegExp(`(^|[^a-z0-9-])${slug}([^a-z0-9-]|$)`));
  // the page as the browser reads it (entities decoded): its text and every attribute's value, but Now and About,
  // the main site's own words, which their chapters hold equal to /now/ and /about/
  await page.goto(TEA);
  const said = squash(await page.evaluate(() => {
    const doc = document.documentElement.cloneNode(true);
    for (const el of doc.querySelectorAll('.tea-prose, .tea-about-text')) el.remove();
    return [doc.textContent, ...[...doc.querySelectorAll('*')].flatMap((e) => [...e.attributes].map((a) => a.value))].join('\n');
  }));
  expect(said.length).toBeGreaterThan(5_000);
  const at = (re) => [...said.matchAll(new RegExp(re, 'g'))].map((m) => said.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40));
  const literal = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const { data } of hidden) {
    if (data.id) expect(at(`(?<![A-Za-z0-9-])${data.id}(?![0-9])`), data.id).toEqual([]);
    if (data.title) expect(at(literal(squash(data.title))), data.title).toEqual([]);
  }
});
