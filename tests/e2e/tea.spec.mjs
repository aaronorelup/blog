// The tea room (/tea/: src/pages/tea/, src/components/tea/, src/scripts/tea/rail.js), the whole site on one chaptered
// page from the main site's own files: every chapter, the same posts, projects, courses, Now and About as their own
// pages, links that resolve both ways, the SEO switch as shipped, the rail, no script needed, the shared day/night
// choice. Posts land on main all day, so every expectation comes from the build or the source, never typed in; chapters
// are reached by their anchors, never by pixel offsets, so this holds once the 3D hero pins the top. INVENTORY tea-*.
import fs from 'node:fs';
import matter from 'gray-matter';
import { test, expect } from './fixtures.mjs';
import { START_HERE } from '../../src/data/picks.js';
import { NAV } from '../../src/data/site.js';
import { TOPICS } from '../../src/data/taxonomy.js';
import { CHAPTERS, COPY, TEA_BASE, TEA_SEO, teaSeo } from '../../src/data/tea.js';

const TEA = `${TEA_BASE}/`;
const here = (p) => new URL(`../../${p}`, import.meta.url);
const files = (d, ext) => fs.readdirSync(here(d)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length));
// Never on the page: drafts (not built at all) and unlisted posts (built at their URL, in no list).
const HIDDEN = files('src/content/posts/', '.md')
  .map((slug) => ({ slug, data: matter(fs.readFileSync(here(`src/content/posts/${slug}.md`), 'utf8')).data }))
  .filter(({ data }) => data.draft === true || data.unlisted === true);
const NOTES = files('src/content/notes/', '.md');
const PROJECT_FILES = files('src/content/projects/', '.yaml');

const plural = (n, [one, many]) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n];
const squash = (s) => s.replace(/\s+/g, ' ').trim();
const bare = (s) => s.replace(/\s+/g, '');   // the words, whatever whitespace the markup put between blocks
const toChapter = (page, id) => page.locator(`#${id}`).evaluate((s) => s.scrollIntoView({ block: 'start', behavior: 'instant' }));
const marked = (page) => page.locator('[data-tea-link][aria-current]')
  .evaluateAll((as) => as.map((a) => `${a.dataset.teaLink}=${a.getAttribute('aria-current')}`));

// The main ledger's own list: every listed post's slug and topic, in its order (ledger-1 holds it to the posts).
async function ledgerRows(page) {
  await page.goto('/ledger/');
  return page.locator('#panel-scroll [data-ledger-entry]')
    .evaluateAll((as) => as.map((a) => ({ slug: a.dataset.ledgerEntry, topic: a.closest('[data-topic]').dataset.topic })));
}

test('tea-1 /tea/ loads with every chapter, in order, listed in the hero and the rail with their numerals', async ({ page }) => {
  expect((await page.goto(TEA)).status()).toBe(200);
  await expect(page.locator('.tea-hero h1')).toHaveText(COPY.title);
  expect(await page.locator('[data-tea-chapter]').evaluateAll((ss) => ss.map((s) => `${s.id}=${s.dataset.teaChapter}`)))
    .toEqual(CHAPTERS.map((c) => `${c.id}=${c.id}`));
  const toc = await page.locator('.tea-toc a').evaluateAll((as) => as.map((a) => [a.getAttribute('href'),
    a.querySelector('.tea-toc-name').textContent, a.querySelector('.tea-toc-num').textContent]));
  const rail = await page.locator('[data-tea-link]').evaluateAll((as) => as.map((a) => [a.getAttribute('href'),
    a.querySelector('.tea-rail-name').textContent, a.querySelector('.tea-rail-num').textContent]));
  const want = CHAPTERS.map((c, i) => [`#${c.id}`, c.label, roman(i + 1)]);
  expect(toc).toEqual(want);
  expect(rail).toEqual(want);
  for (const [i, c] of CHAPTERS.entries()) {
    const chapter = page.locator(`#${c.id}`);
    await expect(chapter).toBeVisible();
    await expect(chapter.locator(`#${c.id}-title`)).toHaveText(c.word);
    await expect(chapter.locator('.tea-open .tea-lede')).toHaveText(c.lede);
    await expect(chapter.locator('.tea-noren')).toHaveText(roman(i + 1));
  }
});

test('tea-2 the posts are the ledger’s listed posts, each once under its topic, and every count is the real one', async ({ page, request }) => {
  const rows = await ledgerRows(page);
  const listed = rows.map((r) => r.slug);
  const previews = (await (await request.get('/ledger/previews.json')).json()).posts;
  expect(new Set(listed)).toEqual(new Set(Object.keys(previews)));
  await page.goto('/courses/');
  const courses = await page.locator('.cv-row:not(.cv-locked)').count();
  await page.goto(TEA);
  const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  const linked = (re) => [...new Set(hrefs.map((h) => h.match(re)?.[1]).filter(Boolean))].sort();
  expect(linked(/^\/ledger\/([^/?#]+)\/$/)).toEqual([...listed].sort());
  // notes pages: every listed post's own and nothing else, linked from each card and index row of a post that has one
  expect(linked(/^\/ledger\/([^/?#]+)\/notes\/$/)).toEqual(listed.filter((s) => NOTES.includes(s)).sort());
  const items = await page.locator('#ledger :is(.tea-row, .tea-card)').evaluateAll((rs) => rs.map((r) => [
    r.querySelector('.tea-stretch').getAttribute('href').split('/')[2],
    r.querySelector(':is(.tea-row-notes, .tea-card-notes)')?.getAttribute('href') ?? null]));
  expect(items.length).toBe(listed.length);
  for (const [slug, notes] of items) expect(notes, slug).toBe(NOTES.includes(slug) ? `/ledger/${slug}/notes/` : null);
  // the hero's one counter line, and the ledger chapter's way out, counted from the build and the source
  await expect(page.locator('.tea-counter')).toHaveText([plural(listed.length, COPY.counter.posts),
    plural(PROJECT_FILES.length, COPY.counter.projects), plural(courses, COPY.counter.courses)].join(' · '));
  await expect(page.locator('#ledger .tea-more a[href="/ledger/"]')).toContainText(plural(listed.length, COPY.postCount));
  // every listed post once in the ledger chapter, under its topic, with its AO id; each topic's pill counts its group
  const ids = await page.locator('#ledger :is(.tea-card-meta, .tea-row-meta) > span:first-child').allTextContents();
  expect(ids.sort()).toEqual(listed.map((s) => previews[s].id).sort());
  for (const key of Object.keys(TOPICS)) {
    const want = rows.filter((r) => r.topic === key).map((r) => `/ledger/${r.slug}/`).sort();
    const group = page.locator(`#ledger #topic-${key}`);
    await expect(group).toHaveCount(want.length ? 1 : 0);
    if (!want.length) continue;
    expect((await group.locator('.tea-stretch').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).sort()).toEqual(want);
    await expect(group.locator('.tea-group-count')).toHaveText(plural(want.length, COPY.postCount));
    await expect(page.locator(`#ledger .tea-pills a[href="#topic-${key}"] .tea-pill-n`)).toHaveText(String(want.length));
  }
  // Start here: the ledger's own picks, in its order
  const picks = await page.locator('#start .tea-stretch').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(picks).toEqual(START_HERE.filter((s) => listed.includes(s)).map((s) => `/ledger/${s}/`));
});

test('tea-3 projects, courses, Now and About show what their own pages show', async ({ page }) => {
  // the projects page: each section's cards, in order
  await page.goto('/projects/');
  const keys = await page.locator('.proj-jump-link').evaluateAll((as) => as.map((a) => a.getAttribute('href').replace('#proj-', '')));
  const sections = {};
  for (const key of keys) sections[key] = await page.locator(`#proj-${key} :is(.proj-name, .proj-line-name)`).allTextContents();
  expect(Object.values(sections).flat().length).toBe(PROJECT_FILES.length);
  await page.goto('/courses/');
  const courses = await page.locator('.cv-row:not(.cv-locked)').evaluateAll((as) => as.map((a) => [a.getAttribute('href'), a.querySelector('h2').textContent]));
  await page.goto('/now/');
  const now = await page.evaluate(() => {
    const parts = [];
    for (const el of document.querySelector('.pc-prose').children) { if (el.id === 'now-history') break; parts.push(el.textContent); }
    return [document.querySelector('.page-kicker').textContent, parts.join('')];
  });
  await page.goto('/about/');
  // About as /about/ shows it under its title: the lede and the prose (the tea room's chapter word is the title)
  const about = await page.locator('[data-panel-view="about"] .page').evaluate((p) => {
    const rest = p.cloneNode(true);
    rest.querySelector('.page-title')?.remove();
    return rest.textContent;
  });
  expect(bare(about).length).toBeGreaterThan(1000);

  await page.goto(TEA);
  for (const [key, names] of Object.entries(sections)) {
    const shown = await page.locator(`#tea-proj-${key} :is(.tea-card-title, .tea-row-title)`).allTextContents();
    expect(shown.map((s) => s.replace(/\s*↗$/, '')), key).toEqual(names);
    await expect(page.locator(`#projects .tea-pills a[href="#tea-proj-${key}"] .tea-pill-n`)).toHaveText(String(names.length));
  }
  expect(await page.locator('.tea-plate-title a').evaluateAll((as) => as.map((a) => [a.getAttribute('href'), a.textContent]))).toEqual(courses);
  await expect(page.locator('.tea-sheet-kicker')).toHaveText(now[0]);
  expect(bare(await page.locator('.tea-prose').textContent())).toBe(bare(now[1]));
  expect(bare(await page.locator('.tea-about-text .page').textContent())).toBe(bare(about));
});

test('tea-4 every internal link and picture on /tea/ resolves in the build', async ({ page, request }) => {
  await page.goto(TEA);
  const { refs, ids } = await page.evaluate(() => ({
    refs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
      .concat([...document.querySelectorAll('img[src]')].map((i) => i.getAttribute('src'))),
    ids: [...document.querySelectorAll('[id]')].map((e) => e.id),
  }));
  const inside = [...new Set(refs)].filter((r) => !/^([a-z]+:|\/\/)/i.test(r));
  expect(inside.length).toBeGreaterThan(100);
  for (const r of inside.filter((r) => r.startsWith('#'))) expect(ids, r).toContain(decodeURIComponent(r.slice(1)));
  // each address once; a link to an anchor on another page needs that id there
  const fetched = new Map();
  for (const r of inside.filter((r) => !r.startsWith('#'))) {
    const u = new URL(r, 'http://tea.test');
    if (!fetched.has(u.pathname)) {
      const res = await request.get(u.pathname);
      const html = (res.headers()['content-type'] || '').includes('text/html');
      fetched.set(u.pathname, { status: res.status(), body: html ? await res.text() : '' });
    }
    const got = fetched.get(u.pathname);
    expect(got.status, r).toBe(200);
    if (u.hash) expect(got.body, r).toContain(`id="${decodeURIComponent(u.hash.slice(1))}"`);
  }
});

test('tea-5 no draft or unlisted post shows on the page: no slug anywhere, no title or id of its own outside Now’s and About’s words', async ({ page, request }) => {
  const html = await (await request.get(TEA)).text();
  for (const { slug } of HIDDEN) expect(html, slug).not.toMatch(new RegExp(`(^|[^a-z0-9-])${slug}([^a-z0-9-]|$)`));
  // an id a listed post also carries (two posts filed under one AO number) tells nothing, so only the others count
  const listedIds = new Set(Object.values((await (await request.get('/ledger/previews.json')).json()).posts).map((p) => p.id));
  await page.goto(TEA);
  // All the page says, its text and every attribute (alt text, titles, addresses), but Now and About: those are the
  // main site's own words, which tea-3 holds equal to /now/ and /about/, not a list of posts.
  const said = squash(await page.evaluate(() => {
    const doc = document.documentElement.cloneNode(true);
    for (const el of doc.querySelectorAll('.tea-prose, .tea-about-text')) el.remove();
    return [doc.textContent, ...[...doc.querySelectorAll('*')].flatMap((e) => [...e.attributes].map((a) => a.value))].join('\n');
  }));
  expect(said.length).toBeGreaterThan(10_000);
  // each place it is said, with a little of what is around it
  const at = (re) => [...said.matchAll(new RegExp(re, 'g'))].map((m) => said.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40));
  const literal = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const { data } of HIDDEN) {
    if (!listedIds.has(data.id)) expect(at(`(?<![A-Za-z0-9-])${data.id}(?![0-9])`), data.id).toEqual([]);
    expect(at(literal(squash(data.title))), data.title).toEqual([]);
  }
});

test(`tea-6 canonical, robots and the sitemap are what the shipped switch says ('${TEA_SEO}'), and /tea/ is in no feed or index`, async ({ page, request }) => {
  const seo = teaSeo(TEA_SEO);
  await page.goto('/ledger/');
  const site = new URL(await page.locator('link[rel="canonical"]').getAttribute('href')).origin;
  const self = new URL(TEA, site).href;
  await page.goto(TEA);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new URL(seo.canonical ?? TEA, site).href);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(seo.noindex ? 1 : 0);
  if (seo.noindex) await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /\bnoindex\b/);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap.includes(`<loc>${self}</loc>`)).toBe(seo.inSitemap);
  // never a feed item, never in the words index (Pagefind reads only [data-pagefind-body])
  expect(await (await request.get('/rss.xml')).text()).not.toContain(`>${self}<`);
  await expect(page.locator('[data-pagefind-body]')).toHaveCount(0);
  // nor in semantic search or Ask: each holds the listed posts and their notes pages, and nothing else
  // (src/lib/search/docs.js, src/lib/ask/docs.js)
  const listed = new Set(Object.keys((await (await request.get('/ledger/previews.json')).json()).posts));
  const search = Object.keys((await (await request.get('/search/manifest.json')).json()).docs);
  const ask = Object.values((await (await request.get('/ask/manifest.json')).json()).docs).map((d) => d.slug);
  expect(Math.min(search.length, ask.length)).toBeGreaterThan(0);
  expect(search.filter((k) => !/^(post|notes):/.test(k) || !listed.has(k.replace(/^\w+:/, '')))).toEqual([]);
  expect(ask.filter((slug) => !listed.has(slug))).toEqual([]);
});

test('tea-7 the main site reaches the tea room: the panel footer, and the homepage gate leaving at once', async ({ page }) => {
  await page.goto('/about/');
  const foot = page.locator(`.pc-bar-foot a[href="${TEA}"]`);
  await expect(foot).toHaveCount(1);
  await foot.click();
  await expect(page).toHaveURL(new RegExp(`${TEA}$`));
  await expect(page.locator('.tea-hero h1')).toHaveText(COPY.title);
  // The gate card's link is data-no-fly: no flight out through the torii first, which would hold the click.
  await page.goto('/?tier=low');
  await expect(page.locator('#stop-rail [data-goto]').first()).toBeVisible({ timeout: 20_000 });
  const gate = page.locator(`section[data-wp] a[href="${TEA}"]`);
  await expect(gate).toHaveCount(1);
  await expect(gate).toHaveAttribute('data-no-fly', '');
  await page.keyboard.press('End');
  await expect.poll(() => gate.evaluate((a) => a.closest('section').inert), { timeout: 20_000 }).toBe(false);
  await page.waitForTimeout(3500);   // the scene's last flight settles (home.spec's settle)
  await page.evaluate(() => addEventListener('click', (e) => sessionStorage.setItem('tea-held', String(e.defaultPrevented))));
  const box = await gate.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(new RegExp(`${TEA}$`));
  expect(await page.evaluate(() => sessionStorage.getItem('tea-held'))).toBe('false');
});

test('tea-8 the tea room leads back to the main site: hero, rail and footer, and the footer carries the main nav', async ({ page }) => {
  await page.goto(TEA);
  for (const part of ['.tea-hero-box', '.tea-rail', '.tea-foot']) await expect(page.locator(`${part} a[href="/"]`)).toHaveCount(1);
  const nav = await page.locator('.tea-foot-nav a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  for (const n of NAV) expect(nav).toContain(n.href);
  await page.locator('.tea-hero-box a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#stop-rail')).toBeAttached();
});

test('tea-9 the rail marks the chapter being read; a chapter reached by its anchor shows its opener', async ({ page }) => {
  await page.goto(TEA);
  await expect.poll(() => marked(page)).toEqual([]);   // the hero: no chapter yet
  // Frames can come seconds apart (a 3D hero drawn in software beside other tests), so this waits for what the page
  // does and where it ends, never for a frame of the fade or the glide.
  const slow = { timeout: 30_000 };
  for (const c of CHAPTERS) {
    await toChapter(page, c.id);
    await expect.poll(() => marked(page), slow).toEqual([`${c.id}=true`]);
    // its opener is shown: the one-time fade was set off (or it never waited), and the fade ends fully shown
    const opener = page.locator(`#${c.id} > .tea-open`);
    await expect.poll(() => opener.evaluate((o) => o.classList.contains('is-in') || !o.classList.contains('is-waiting')), slow).toBe(true);
    expect(await opener.evaluate((o) => { for (const a of o.getAnimations()) a.finish(); return getComputedStyle(o).opacity; })).toBe('1');
  }
  // a rail link (a pill on the phone's strip) takes the reader to its chapter, and it is marked
  const back = CHAPTERS[1].id;
  await page.locator(`[data-tea-link="${back}"]`).click();
  await expect(page).toHaveURL(new RegExp(`#${back}$`));
  await expect.poll(() => marked(page), slow).toEqual([`${back}=true`]);
  await expect.poll(() => page.locator(`#${back}`).evaluate((s) => s.getBoundingClientRect().top <= innerHeight / 3), slow).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => marked(page), slow).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('tea-10 every chapter and every link is there and visible, nothing waiting to fade in', async ({ page, isMobile }) => {
    await page.goto(TEA);
    for (const c of CHAPTERS) await expect(page.locator(`#${c.id}`)).toBeVisible();
    expect(await page.locator('.tea-reveal').evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length)).toBe(0);
    const links = await page.locator('a[href]').evaluateAll((as) => as.map((a) => {
      let o = 1;
      for (let e = a; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
      return { href: a.getAttribute('href'), shown: a.getClientRects().length > 0 && getComputedStyle(a).visibility === 'visible' && o > 0.99 };
    }));
    const shown = new Set(links.filter((l) => l.shown).map((l) => l.href));
    const hidden = links.filter((l) => !l.shown).map((l) => l.href);
    // A wide window shows every link. A phone's strip leaves out the rail's title and utilities, and the hero and the
    // footer carry those addresses, so no address is out of reach.
    if (!isMobile) expect(hidden).toEqual([]);
    expect(hidden.filter((h) => !shown.has(h))).toEqual([]);
  });
});

test('tea-11 day or night, chosen on either view, is what the other one opens in', async ({ page }) => {
  const mode = () => page.evaluate(() => document.documentElement.dataset.mode || 'night');
  const ground = () => page.evaluate(() => [getComputedStyle(document.body).backgroundColor,
    getComputedStyle(document.documentElement).getPropertyValue(`--${document.documentElement.dataset.mode || 'night'}-page`).trim()]);
  await page.goto('/about/');
  expect(await mode()).toBe('night');
  await page.locator('#mode-toggle').click();
  await expect.poll(mode).toBe('day');
  await page.goto(TEA);
  expect(await mode()).toBe('day');
  const [day, dayToken] = await ground();
  expect(day).toBe(dayToken);
  await toChapter(page, CHAPTERS[0].id);   // past the hero, where a phone's strip holds the switch (over the hero too: tea-hero-5)
  await page.locator('#mode-toggle').click();
  await expect.poll(mode).toBe('night');
  const [night, nightToken] = await ground();
  expect([night, night === day]).toEqual([nightToken, false]);
  await page.goto('/about/');
  expect(await mode()).toBe('night');
});

test('tea-12 the keyboard starts at the skip link, which takes it past the hero and the rail into the first chapter', async ({ page }) => {
  await page.goto(TEA);
  expect(await page.locator('[tabindex]').evaluateAll((els) => els.filter((e) => e.tabIndex > 0).length)).toBe(0);
  await page.keyboard.press('Tab');
  const skip = page.locator('.tea-skip');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveText(COPY.skip);
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.closest('[data-tea-chapter]')?.id ?? null)).toBe(CHAPTERS[0].id);
});

test('tea-13 no console error and no sideways scroll, at 1440 and 390 wide, by day and by night; every picture loads', async ({ page, isMobile }) => {
  test.setTimeout(150_000);
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  const sizes = isMobile ? [page.viewportSize()] : [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
  for (const mode of ['night', 'day']) {
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto(TEA);
      await page.evaluate((m) => localStorage.setItem('scene-mode', m), mode);
      await page.reload();
      expect(await page.evaluate(() => document.documentElement.dataset.mode || 'night')).toBe(mode);
      expect(await page.evaluate(() => [document.documentElement, document.body].map((e) => getComputedStyle(e).overflowX)))
        .toEqual(['visible', 'visible']);   // nothing hides a sideways scroll from the check below
      const broken = await page.locator('img').evaluateAll(async (imgs) => {
        for (const i of imgs) i.loading = 'eager';
        await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
        return imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src'));
      });
      expect(broken).toEqual([]);
      for (const at of ['top', ...CHAPTERS.map((c) => c.id)]) {
        await toChapter(page, at);
        const [wide, room] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        expect(wide, `${mode} ${size.width} #${at}`).toBeLessThanOrEqual(room);
      }
    }
  }
  expect(errors).toEqual([]);
});

// Where a pill of the strip sits once the strip has held still for `quiet` ms (the current one, or the one with focus):
// whole inside the strip and clear of its fading end (the mask's opaque share, read from the CSS), with room round it
// for its focus ring when it shows one (the strip clips what spills out).
const pillPlace = (page, quiet, which = '[data-tea-link][aria-current="true"]') => page.evaluate(async ([quiet, which]) => {
  const strip = document.querySelector('[data-tea-strip]');
  for (let last = -1; last !== strip.scrollLeft;) {
    last = strip.scrollLeft;
    await new Promise((ok) => setTimeout(ok, quiet));
  }
  const s = strip.getBoundingClientRect();
  const mask = getComputedStyle(strip).maskImage || getComputedStyle(strip).webkitMaskImage || '';
  const fade = s.left + (s.width * Number(/(\d+(?:\.\d+)?)%/.exec(mask)?.[1] ?? 100)) / 100;
  const el = which === ':focus' ? document.activeElement : document.querySelector(which);
  const a = el.getBoundingClientRect();
  const c = getComputedStyle(el);
  const ring = c.outlineStyle === 'none' ? 0 : parseFloat(c.outlineWidth) + parseFloat(c.outlineOffset);
  const shown = a.left - ring >= s.left - 0.5 && a.right + ring <= fade + 0.5 && a.top - ring >= s.top - 0.5 && a.bottom + ring <= s.bottom + 0.5;
  return { shown, pill: [a.left, a.right].map(Math.round), ring, fade: Math.round(fade), strip: [s.left, s.right].map(Math.round) };
}, [quiet, which]);

test('tea-14 on a narrow window the strip keeps the chapter being read, and the pill the keyboard is on, whole in view', async ({ page, isMobile }) => {
  test.setTimeout(150_000);
  if (!isMobile) await page.setViewportSize({ width: 390, height: 844 });
  // With reduced motion rail.js moves the strip at once, which pins the placement down. With motion the strip glides
  // there, and WebKit starts that glide up to about 0.7 s late, so that pass waits for the pill to arrive and stay.
  for (const motion of ['reduce', 'no-preference']) {
    const settled = async (which, what) => {
      if (motion !== 'reduce') await expect.poll(async () => (await pillPlace(page, 200, which)).shown, { timeout: 10_000 }).toBe(true);
      const at = await pillPlace(page, motion === 'reduce' ? 100 : 1000, which);
      expect(at.shown, `${motion}, ${what}: pill ${at.pill} (ring ${at.ring}) in strip ${at.strip}, faded from ${at.fade}`).toBe(true);
    };
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto(TEA);
    // the chapters overflow the strip, so it scrolls: the case this is about
    expect(await page.locator('[data-tea-strip]').evaluate((s) => s.scrollWidth > s.clientWidth)).toBe(true);
    for (const c of [...CHAPTERS, ...CHAPTERS.slice(0, -1).reverse()]) {
      await toChapter(page, c.id);
      await expect.poll(() => marked(page)).toEqual([`${c.id}=true`]);
      await settled(undefined, c.id);
    }
    // the keyboard: Tab from "Main site" through the pills; each comes whole into view, its focus ring and all
    await page.locator('.tea-rail-back').focus();
    for (const c of CHAPTERS) {
      await page.keyboard.press('Tab');
      await expect(page.locator(`[data-tea-link="${c.id}"]`)).toBeFocused();
      await settled(':focus', `Tab to ${c.id}`);
    }
  }
});

test('tea-15 one h1, the hero’s title; each chapter’s word an h2; About’s sections under its chapter; no level skipped', async ({ page }) => {
  await page.goto(TEA);
  const outline = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((hs) => hs.map((h) => ({
    level: Number(h.tagName[1]), text: h.textContent.trim(), id: h.id, chapter: h.closest('[data-tea-chapter]')?.id ?? null })));
  expect(outline.filter((h) => h.level === 1).map((h) => h.text)).toEqual([COPY.title]);
  expect(outline[0]).toMatchObject({ level: 1, text: COPY.title });
  for (const c of CHAPTERS) {
    expect(outline.find((h) => h.id === `${c.id}-title`), c.id).toMatchObject({ level: 2, text: c.word, chapter: c.id });
    // the chapter's word is the first heading in it
    expect(outline.find((h) => h.chapter === c.id)?.id, c.id).toBe(`${c.id}-title`);
  }
  // About's own sections sit one rank under its chapter, with no title of their own (the chapter names it)
  const about = outline.filter((h) => h.chapter === 'about' && h.id !== 'about-title');
  expect(about.length).toBeGreaterThan(0);
  expect(about.filter((h) => h.level !== 3)).toEqual([]);
  expect(outline.filter((h, i) => i > 0 && h.level > outline[i - 1].level + 1)).toEqual([]);
});
