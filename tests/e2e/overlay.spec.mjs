// The homepage overlay (src/scripts/home/overlay/): a card grows into the panel, which fetches each view from its real
// page on intent and mounts a fresh copy; rows, cross-links, notes and search results open in it with no document
// load, the components work again on every swap, history and Esc drive it, it stops players on close, the scene stops
// drawing under it, and anything it can't do in place (a failed fetch, a lost chunk, another build) ends on the real
// page. The selectors the overlay contract names (0.3) are the ones below; INVENTORY rows overlay-*.
import sharp from 'sharp';
import { test, expect } from './fixtures.mjs';
import { pageWith, pagesWhere, play, expectPlaying } from './helpers.mjs';
import { SOCIAL } from '../../src/data/site.js';

const PANEL = '#panel-screen';
const READER = '[data-panel-host] [data-post-article]';
const panel = (page) => page.locator(PANEL);
const reader = (page) => page.locator(READER);
const view = (page, key) => panel(page).locator(`[data-panel-view="${key}"] h1`).first();
const isOpen = (page) => expect(panel(page)).toHaveAttribute('aria-hidden', 'false');
const isClosed = (page) => expect(panel(page)).toHaveAttribute('aria-hidden', 'true');
const modelPost = pageWith('ao-model');
const gamePost = pageWith('ao-game');
const demoPost = pageWith('ao-demo', (a) => a.name === 'synthid');
const slugOf = (url) => url.split('/')[2];
const exactly = (url) => new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
test.describe.configure({ mode: 'default' });

// The homepage, with a marker on its window: if the marker survives, no document was loaded.
// ?tier=low pins the scene's cheapest animated rung: the overlay is the same, and software WebGL keeps up.
async function home(page, tier = 'low') {
  await page.goto(`/?tier=${tier}`);
  await expect(page.locator('#stop-rail [data-goto]').first()).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => { window.__sameDocument = true; });
}
// A navigation under way destroys the old document's context: that, too, means another document.
const sameDocument = (page) => page.evaluate(() => window.__sameDocument === true).catch(() => false);

// Walk the scene to the card that links to href and give back its link's centre.
async function cardLink(page, href) {
  const card = page.locator('section[data-wp]').filter({ has: page.locator(`a[href="${href}"]`) }).first();
  for (let k = 0; k < 6 && await card.evaluate((s) => s.inert); k++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(3000);
  }
  const box = await card.locator(`a[href="${href}"]`).first().boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
// Click the card's link: the card grows into the panel.
async function openFrom(page, href) {
  const { x, y } = await cardLink(page, href);
  await page.mouse.click(x, y);
  await isOpen(page);
  await expect(page).toHaveURL(new RegExp(href + '$'));
  await expect(view(page, href.slice(1))).toBeVisible();
}
const openLedger = (page) => openFrom(page, '/ledger');
// The ledger's module has run on the copy in the panel (views/ledger.js): "/" then focuses its search box.
async function ledgerMounted(page) {
  const input = panel(page).locator('.search-input');
  await expect.poll(async () => {
    await page.keyboard.press('/');
    return input.evaluate((i) => i === document.activeElement);
  }).toBe(true);
}

// A page's title, as the overlay shows it while that page is in the panel.
const titles = new Map();
async function titleOf(page, url) {
  if (!titles.has(url)) {
    const html = await (await page.request.get(url)).text();
    titles.set(url, await page.evaluate((h) => new DOMParser().parseFromString(h, 'text/html').title, html));
  }
  return titles.get(url);
}
// The reader shows the post at url: the address and the title are that post's, its heading is in view.
async function reading(page, url) {
  await expect(page).toHaveURL(exactly(url));
  await expect(page).toHaveTitle(await titleOf(page, url));
  await expect(reader(page).locator('h1').first()).toBeVisible();
}
const row = (page, url) => panel(page).locator(`[data-panel-view="ledger"] [data-ledger-entry="${slugOf(url)}"]`).first();
async function openRow(page, url) {
  await row(page, url).click();
  await reading(page, url);
}
// Each component is its own chunk, loaded once the post is in the reader: give them a moment.
const allDefined = (page) => expect.poll(() => reader(page).evaluate((r) => r.querySelectorAll(':not(:defined)').length)).toBe(0);
async function modelRenders(page) {
  const m = reader(page).locator('ao-model').first();
  await m.locator('.ao-model-load').click();
  const canvas = m.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  await expect.poll(async () => {
    const { channels } = await sharp(await canvas.screenshot()).stats();
    return Math.max(...channels.slice(0, 3).map((c) => c.stdev));
  }, { timeout: 60_000 }).toBeGreaterThan(4);
}

test('overlay-1 a card grows into the ledger, with no document load', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await expect(view(page, 'ledger')).toBeVisible();
  const from = await page.locator('section[data-wp]').filter({ has: page.locator('a[href="/ledger"]') }).first()
    .locator(':scope > *').first().boundingBox();
  await expect.poll(async () => {
    const b = await page.locator('#panel-card').boundingBox();
    return b.width * b.height;
  }).toBeGreaterThan(from.width * from.height * 1.5);
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-2 a row opens its post in the panel, with no document load, its pictures enhanced', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await openRow(page, modelPost);
  // The post's view module runs enhance(root) on the copy the overlay mounted: its pictures open the viewer.
  await reader(page).locator('img[role=button]').first().click();
  await expect(page.locator('dialog.ao-lb')).toBeVisible();
  // Esc is the viewer's: it closes, and the panel stays.
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.ao-lb')).toBeHidden();
  await isOpen(page);
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-3 post A, post B, back to A and on to C: every component works on every swap', async ({ page }) => {
  test.setTimeout(240_000);
  await home(page);
  await openLedger(page);
  await openRow(page, modelPost);
  await allDefined(page);
  await modelRenders(page);
  await reader(page).locator('[data-close-reader]').first().click();
  await openRow(page, gamePost);
  await allDefined(page);
  await reader(page).locator('ao-game .ao-game-load').first().click();
  await expect(reader(page).locator('ao-game iframe')).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/ledger$/);
  await page.goBack();
  await reading(page, modelPost);
  await allDefined(page);
  await modelRenders(page);
  await page.goForward();
  await page.goForward();
  await reading(page, gamePost);
  await expect(reader(page).locator('ao-game iframe')).toHaveCount(0);
  await reader(page).locator('ao-game .ao-game-load').first().click();
  await expect(reader(page).locator('ao-game iframe')).toHaveCount(1);
  await reader(page).locator('[data-close-reader]').first().click();
  await openRow(page, demoPost);
  const d = reader(page).locator('ao-demo[part="tournament"]');
  const bracket = d.locator('.sid-bracket');
  const before = await bracket.innerHTML();
  await d.locator('.sid-word.swap').first().click();
  await expect.poll(() => bracket.innerHTML()).not.toBe(before);
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-4 a lost component chunk still ends on a working post', async ({ page }) => {
  // A deploy since the homepage loaded: the first chunk the post's view module asks for is gone, so mountView's lazy()
  // opens the real page, which comes from the new build and names new chunks. Here those are the same files under
  // ?deploy=2 (WebKit would otherwise hand the real page the failure it keeps for the old name). Vite 8 quotes a
  // dynamic import's specifier with backticks, the others with double quotes.
  await home(page);
  await openLedger(page);
  let lost = null;
  await page.route(/\/_astro\/[^/?]+\.js$/, (r) => {
    lost = new URL(r.request().url()).pathname;
    return r.fulfill({ status: 404, body: '' });
  }, { times: 1 });
  const renamed = (text) => text.replace(/((?:src=|from|import\()\s*["'`](?:\/_astro\/|\.\/)[^"'`]+\.js)(["'`])/g, '$1?deploy=2$2');
  await page.route(`**${modelPost}`, async (r) => {
    if (r.request().resourceType() !== 'document') return r.fallback();
    const response = await r.fetch();
    return r.fulfill({ response, body: renamed(await response.text()) });
  });
  await page.route(/\/_astro\/[^/]+\.js\?deploy=2$/, async (r) => {
    const response = await r.fetch({ url: r.request().url().replace('?deploy=2', '') });
    return r.fulfill({ response, body: renamed(await response.text()) });
  });
  await row(page, modelPost).click();
  await expect.poll(() => sameDocument(page)).toBe(false);
  expect(lost).toMatch(/^\/_astro\//);
  await expect(page).toHaveURL(new RegExp(modelPost + '$'));
  await expect.poll(() => page.evaluate(() => !!customElements.get('ao-model')), { timeout: 10_000 }).toBe(true);
});

test('overlay-4b a lost post component chunk opens the real page at once, without a reload first', async ({ page }) => {
  // The view module loads, then a component's own chunk is gone: enhance() gets the post's real page as its fallback
  // (views/post.js), so lazy() navigates there instead of reloading (a reload sets ao-reloaded, once a session).
  await home(page);
  await openLedger(page);
  let lost = null;
  await page.route(/\/_astro\/element\.[^/?]+\.js$/, (r) => {
    lost = new URL(r.request().url()).pathname;
    return r.fulfill({ status: 404, body: '' });
  }, { times: 1 });
  const renamed = (text) => text.replace(/((?:src=|from|import\()\s*["'`](?:\/_astro\/|\.\/)[^"'`]+\.js)(["'`])/g, '$1?deploy=2$2');
  await page.route(`**${modelPost}`, async (r) => {
    if (r.request().resourceType() !== 'document') return r.fallback();
    const response = await r.fetch();
    return r.fulfill({ response, body: renamed(await response.text()) });
  });
  await page.route(/\/_astro\/[^/]+\.js\?deploy=2$/, async (r) => {
    const response = await r.fetch({ url: r.request().url().replace('?deploy=2', '') });
    return r.fulfill({ response, body: renamed(await response.text()) });
  });
  await row(page, modelPost).click();
  await expect.poll(() => sameDocument(page)).toBe(false);
  expect(lost).toMatch(/^\/_astro\/element\./);
  await expect(page).toHaveURL(new RegExp(modelPost + '$'));
  await expect.poll(() => page.evaluate(() => !!customElements.get('ao-model')), { timeout: 10_000 }).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem('ao-reloaded'))).toBe(null);
});

test('overlay-5 a link to another post inside a post stays in the panel', async ({ page }) => {
  await home(page);
  await openLedger(page);
  const from = pagesWhere((p) => p.kind === 'post' && p.posts.length > 0)[0];
  await openRow(page, from);
  const href = await reader(page).locator('a[href^="/ledger/"]').filter({ visible: true }).evaluateAll((as) =>
    as.map((a) => a.getAttribute('href')).find((h) => /^\/ledger\/[^/?#]+\/?$/.test(h)));
  await reader(page).locator(`a[href="${href}"]`).filter({ visible: true }).first().click();
  await reading(page, href);
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-6 Esc closes to the scene, Back reopens the post, Forward closes it again', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await openRow(page, modelPost);
  await page.keyboard.press('Escape');
  await isClosed(page);
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await isOpen(page);
  await reading(page, modelPost);
  await page.goForward();
  await isClosed(page);
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-7 Back to the ledger and Back to the tea house', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await openRow(page, modelPost);
  await reader(page).locator('[data-close-reader]').first().click();
  await expect(page).toHaveURL(/\/ledger$/);
  await expect(view(page, 'ledger')).toBeVisible();
  await panel(page).locator('[data-panel-home]').first().click();
  await isClosed(page);
});

test('overlay-8 closing the panel stops what plays in it (ao-stop)', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await openRow(page, pageWith('ao-compare', (a) => 'sync' in a));
  const v = reader(page).locator('ao-compare[sync] video').first();
  await play(v);
  await expectPlaying(v);
  await page.keyboard.press('Escape');
  await expectPlaying(v, false);
});

test('overlay-9 a post the panel can’t fetch opens as its real page', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await page.route(`**${modelPost}`, (r) => (r.request().resourceType() === 'fetch' ? r.abort() : r.fallback()));
  await row(page, modelPost).click();
  await expect(page).toHaveURL(new RegExp(modelPost + '$'));
  await expect.poll(() => sameDocument(page)).toBe(false);
  await expect(page.locator('[data-post-article] ao-model').first()).toBeVisible();
});

test('overlay-10 a deep link to a post is its real page, components working', async ({ page }) => {
  await page.goto(modelPost);
  await expect(page.locator('[data-post-article]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.querySelectorAll('[data-post-article] :not(:defined)').length)).toBe(0);
});

test('overlay-11 the ledger’s copy button puts the feed’s address on the clipboard', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await home(page);
  await openLedger(page);
  await ledgerMounted(page);
  const copy = panel(page).locator('#feed-copy');
  await copy.click();
  await expect(copy).toHaveText('copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(new URL('/rss.xml', page.url()).href);
  await expect(copy).toHaveText('copy', { timeout: 5000 });
});

test('overlay-12 a view is fetched on intent only: never on idle, and on the pointer going down', async ({ page }) => {
  const fetched = [];
  page.on('request', (r) => {
    const { pathname } = new URL(r.url());
    if (r.resourceType() === 'fetch' && /^\/(ledger|courses|projects|about)\/?$/.test(pathname)) fetched.push(pathname);
  });
  await home(page);
  await page.waitForTimeout(4000);
  expect(fetched).toEqual([]);
  const { x, y } = await cardLink(page, '/ledger');
  expect(fetched).toEqual([]);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await expect.poll(() => fetched).toEqual(['/ledger/']);
  await page.mouse.up();
  await isOpen(page);
  await expect(view(page, 'ledger')).toBeVisible();
  expect(fetched).toEqual(['/ledger/']);
});

test('overlay-13 the homepage asks for no picture of a view it isn’t showing', async ({ page }) => {
  const asked = [];
  page.on('request', (r) => r.resourceType() === 'image' && asked.push(new URL(r.url()).pathname));
  await home(page);
  await page.waitForTimeout(5000);
  const shown = await page.evaluate(() => [...document.querySelectorAll('img, link[rel="icon"]')]
    .map((el) => new URL(el.currentSrc || el.src || el.href).pathname));
  expect(asked.filter((p) => !shown.includes(p))).toEqual([]);
});

test('overlay-14 Courses brings its own stylesheet, put before the homepage’s', async ({ page }) => {
  const sheetsOf = async (url) => [...(await (await page.request.get(url)).text())
    .matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
  const own = await sheetsOf('/');
  const brought = (await sheetsOf('/courses/')).filter((h) => !own.includes(h));
  expect(brought.length).toBeGreaterThan(0);
  const linked = () => page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.href).pathname));
  await home(page);
  expect((await linked()).filter((h) => brought.includes(h))).toEqual([]);
  await openFrom(page, '/courses');
  await expect(view(page, 'courses')).toBeVisible();
  const now = await linked();
  for (const h of brought) {
    expect(now.indexOf(h)).toBeGreaterThan(-1);
    expect(now.indexOf(h)).toBeLessThan(now.indexOf(own[0]));
  }
  // Its rules apply: a course row is laid out by courses.css, as on /courses/.
  await expect(panel(page).locator('.cv-row').first()).toHaveCSS('display', 'grid');
});

test('overlay-15 opening and closing every view leaves the homepage’s colours as they were', async ({ page }) => {
  await home(page);
  const colours = async () => (await page.mouse.move(1, 1), page.evaluate(() => [document.body, ...document.querySelectorAll(
    'section[data-wp] > div, section[data-wp] h1, section[data-wp] h2, section[data-wp] p, section[data-wp] a')]
    .map((el) => { const s = getComputedStyle(el); return `${s.color} ${s.backgroundColor} ${s.borderTopColor}`; })));
  const before = await colours();
  await openLedger(page);
  for (const key of ['projects', 'courses', 'about', 'ledger']) {
    await panel(page).locator(`a[data-nav="${key}"]`).click();
    await expect(view(page, key)).toBeVisible();
  }
  await openRow(page, modelPost);
  await page.keyboard.press('Escape');
  await isClosed(page);
  await expect.poll(colours).toEqual(before);
});

test('overlay-16 a page from another build opens as the real page', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await page.route(`**${modelPost}`, async (r) => {
    if (r.request().resourceType() !== 'fetch') return r.fallback();
    const response = await r.fetch();
    const body = (await response.text()).replace(/(<meta name="ao-build" content=")[^"]*/, '$1another-build');
    return r.fulfill({ response, body });
  });
  await row(page, modelPost).click();
  await expect.poll(() => sameDocument(page)).toBe(false);
  await expect(page).toHaveURL(new RegExp(modelPost + '$'));
  await expect(page.locator('[data-post-article] ao-model').first()).toBeVisible();
});

test('overlay-17 Back, or ← LEDGER, from a post finds the ledger filtered and scrolled as it was left', async ({ page }) => {
  await home(page);
  await openLedger(page);
  // The topic with the most posts, so its list scrolls.
  const value = await panel(page).locator('[data-chip="topic"]').evaluateAll((cs) => cs
    .map((c) => [c.dataset.value, Number(c.textContent.match(/\d+(?=\s*$)/)[0])]).sort((a, b) => b[1] - a[1])[0][0]);
  const chip = panel(page).locator(`[data-chip="topic"][data-value="${value}"]`);
  await chip.click();
  await expect(page).toHaveURL(new RegExp(`/ledger/?\\?topic=${value}$`));
  const rows = panel(page).locator('[data-panel-view="ledger"] .row:not([hidden])');
  const count = await rows.count();
  const last = rows.nth(count - 1).locator('[data-ledger-entry]');
  await last.scrollIntoViewIfNeeded();
  const scroll = await page.locator('#panel-scroll').evaluate((s) => s.scrollTop);
  expect(scroll).toBeGreaterThan(100);
  const href = await last.getAttribute('href');
  const asLeft = async () => {
    await expect(page).toHaveURL(new RegExp(`\\?topic=${value}$`));
    await expect(chip).toHaveAttribute('aria-current', 'true');
    await expect(rows).toHaveCount(count);
    await expect.poll(() => page.locator('#panel-scroll').evaluate((s) => s.scrollTop)).toBe(scroll);
  };
  // The filter was set after this ledger was mounted: "← LEDGER" (data-close-reader) finds it all the same.
  await last.click();
  await reading(page, href);
  await reader(page).locator('[data-close-reader]').first().click();
  await asLeft();
  await last.click();
  await reading(page, href);
  await page.goBack();
  await asLeft();
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-18 a search result opens in the panel with its passage marked', async ({ page }) => {
  await home(page);
  await openLedger(page);
  const input = panel(page).locator('.search-input');
  await input.click();
  await input.fill('gpu');
  // Both halves in (the words half's passages all drawn, so the list is no longer busy, and the meaning half's own hit
  // there), so the link read is the link clicked.
  await expect(panel(page).locator('.results:not([aria-busy]) .row-link[href^="/ledger/characters-in-inscryption/notes/"]')).toBeVisible();
  const hit = panel(page).locator('[data-search-out] a[href*="?hl="]').first();
  const href = await hit.getAttribute('href');
  await hit.click();
  await expect(page).toHaveURL(exactly(href));
  await expect(reader(page).locator('mark.hl').first()).toBeInViewport();
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-19 a post’s notes open in the panel', async ({ page }) => {
  const notes = pagesWhere((p) => p.kind === 'notes');
  await home(page);
  await openLedger(page);
  // The first listed post whose text links to its notes.
  let url = null;
  for (const n of notes) {
    const post = n.replace(/notes\/$/, '');
    if (await row(page, post).count() && (await (await page.request.get(post)).text()).includes(`href="${n}"`)) { url = n; break; }
  }
  await openRow(page, url.replace(/notes\/$/, ''));
  await reader(page).locator(`a[href="${url}"]`).first().click();
  await reading(page, url);
  await expect(panel(page).locator('[data-panel-view="notes"]')).toBeVisible();
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-20 the scene draws nothing while the panel covers it, and again once it closes', async ({ page }) => {
  // The high rung keeps petals falling, so an uncovered scene draws every frame.
  await home(page, 'high');
  const drawn = () => page.evaluate(() => new Promise((done) => {
    const info = window.__homeScene.renderer.info.render;
    const from = info.frame;
    setTimeout(() => done(info.frame - from), 1000);
  }));
  expect(await drawn()).toBeGreaterThan(0);
  await openFrom(page, '/projects');
  await page.waitForTimeout(800);
  expect(await drawn()).toBe(0);
  await page.keyboard.press('Escape');
  await isClosed(page);
  expect(await drawn()).toBeGreaterThan(0);
});

test('overlay-21 a project’s own page leaves at once from the panel, with no flight', async ({ page }) => {
  await home(page);
  await openFrom(page, '/projects');
  const start = panel(page).locator('.proj-card a.proj-btn[href^="/courses/"]').first();
  await expect(start).toHaveAttribute('data-no-fly');
  const href = await start.getAttribute('href');
  // A flight closes the panel first; a session note survives the navigation to tell.
  await page.evaluate(() => new MutationObserver(() => {
    if (document.getElementById('panel-screen').getAttribute('aria-hidden') === 'true') sessionStorage.setItem('flew', '1');
  }).observe(document.getElementById('panel-screen'), { attributes: true }));
  await start.click();
  await expect(page).toHaveURL(new RegExp(href + '$'));
  expect(await page.evaluate(() => sessionStorage.getItem('flew'))).toBe(null);
});

test('overlay-22 Ask works again in a ledger mounted afresh', async ({ page, context }) => {
  // Turnstile as a stub that solves at once, and counts where it was drawn.
  await context.route('https://challenges.cloudflare.com/**', (route) => route.fulfill({ contentType: 'text/javascript', body: `(() => {
    let opts = null;
    window.__boxes = [];
    window.turnstile = { render(el, o) { opts = o; window.__boxes.push(el); setTimeout(() => opts.callback('XXXX.DUMMY.TOKEN.XXXX'), 30); return 'w' + window.__boxes.length; },
      reset() { setTimeout(() => opts.callback('XXXX.DUMMY.TOKEN.XXXX'), 30); }, remove() {} };
    window[new URL(document.currentScript.src).searchParams.get('onload')]();
  })();` }));
  const ask = async () => {
    await ledgerMounted(page);
    await panel(page).locator('[data-mode="ask"]').click();
    await expect(panel(page).locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
    await panel(page).locator('.search-input').fill('What did renting a GPU cost?');
    await panel(page).locator('.search-input').press('Enter');
    await expect(panel(page).locator('.ask-text, .ask-note').first()).toBeVisible();
  };
  await home(page);
  await openLedger(page);
  await ask();
  await page.evaluate(() => sessionStorage.removeItem('ao-ask'));   // the next question needs a new solve
  await page.keyboard.press('Escape');
  await isClosed(page);
  await page.goBack();
  await expect(view(page, 'ledger')).toBeVisible();
  await ask();
  // The second widget went into the box on screen, not the one that left with the old ledger.
  expect(await page.evaluate(() => window.__boxes.map((b) => b.isConnected))).toEqual([false, true]);
});

test('overlay-23 a view opened just after scrolling a post opens at its top, not at the post’s place', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await openRow(page, modelPost);
  await allDefined(page);
  // Scrolled, and About asked for at once: the post keeps its place in history 200 ms after a scroll, About arrives
  // later than that.
  await page.route('**/about/', async (r) => { await new Promise((done) => setTimeout(done, 1000)); return r.fallback(); });
  expect(await page.locator('#panel-scroll').evaluate((s) => {
    s.scrollTop = 1500;
    document.querySelector('#panel-screen a[data-nav="about"]').click();
    return s.scrollTop;
  })).toBeGreaterThan(0);
  await expect(view(page, 'about')).toBeVisible();
  expect(await page.locator('#panel-scroll').evaluate((s) => s.scrollTop)).toBe(0);
  expect(await page.evaluate(() => history.state?.scroll)).toBeUndefined();
});

test('overlay-24 no view brings a second copy of the site’s rules: the homepage already links them', async ({ page }) => {
  await home(page);
  const adopted = [];
  page.on('request', (r) => r.resourceType() === 'stylesheet' && adopted.push(new URL(r.url()).pathname));
  // Linked sheets: a post's article carries its components' own CSS in a <style> of its own (ElementStyles).
  const sheets = () => page.evaluate(() => [...document.styleSheets].filter((s) => s.href).length);
  const before = await sheets();
  await openLedger(page);
  for (const key of ['projects', 'about', 'ledger']) {
    await panel(page).locator(`a[data-nav="${key}"]`).click();
    await expect(view(page, key)).toBeVisible();
  }
  await openRow(page, modelPost);
  await allDefined(page);
  expect(adopted).toEqual([]);
  expect(await sheets()).toBe(before);
});

test('overlay-25 a view in the panel has the colours it has on its own page, by day and by night', async ({ page }) => {
  const SEL = ['[data-panel-view]', '.view-title', '.view-intro', '.row', '.row [data-ledger-entry]', '.search-input',
    '#panel-inner', '.pc-nav', '.pc-copy', '.pc-foot'];
  const colours = (pre) => page.evaluate(([pre, sel]) => sel.map((s) => {
    const c = getComputedStyle(document.querySelector(pre + s));
    return `${s} ${c.color} ${c.borderTopColor}`;
  }), [pre, SEL]);
  // The search box, focused: the bar lights up, the input draws no box of its own. The bar's colour eases in, so it
  // is read once its transition has ended (getAnimations() starts it if it hasn't yet).
  const focused = async (pre) => {
    await page.locator(pre + '.search-input').focus();
    return page.locator(pre + '.search-input').evaluate(async (i) => {
      const bar = i.closest('.search-bar');
      await Promise.all(bar.getAnimations().map((a) => a.finished));
      return [getComputedStyle(i).outlineStyle, getComputedStyle(bar).borderTopColor];
    });
  };
  for (const mode of ['day', 'night']) {
    await page.goto('/ledger/');
    await page.evaluate((m) => localStorage.setItem('scene-mode', m), mode);
    await page.reload();
    const own = [await colours(''), await focused('')];
    await home(page);
    await openLedger(page);
    expect([await colours('#panel-screen '), await focused('#panel-screen ')]).toEqual(own);
  }
});

test('overlay-26 while the panel is up the day/night switch sits in its header, clear of the card’s corner', async ({ page }) => {
  const box = (sel) => page.locator(sel).first().boundingBox();
  const inside = (a, b) => a.x >= b.x && a.y >= b.y && a.x + a.width <= b.x + b.width && a.y + a.height <= b.y + b.height;
  const apart = (a, b) => a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
  await home(page);
  const closed = await box('#mode-toggle');
  await openLedger(page);
  await expect.poll(async () => inside(await box('#mode-toggle'), await box('#panel-screen .pc-bar-top'))).toBe(true);
  expect(apart(await box('#mode-toggle'), await box('#panel-screen .pc-home'))).toBe(true);
  expect(apart(await box('#mode-toggle'), await box('#panel-screen .pc-navs-o'))).toBe(true);
  // It still switches, over the panel.
  const pressed = await page.locator('#mode-toggle').getAttribute('aria-pressed');
  await page.locator('#mode-toggle').click();
  await expect(page.locator('#mode-toggle')).not.toHaveAttribute('aria-pressed', pressed);
  await page.keyboard.press('Escape');
  await isClosed(page);
  await expect.poll(() => box('#mode-toggle')).toEqual(closed);
});

test('overlay-27 on a phone the panel’s footer is two short lines, every link kept', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the footer is one line on a wide window');
  await home(page);
  await openLedger(page);
  const foot = panel(page).locator('.pc-bar-foot');
  const { height } = await foot.boundingBox();
  expect(height / page.viewportSize().height).toBeLessThan(0.1);
  for (const a of await foot.locator('a').all()) await expect(a).toBeInViewport();
  expect(await foot.locator('a').count()).toBe(SOCIAL.length + 1);   // the feed and every elsewhere
});
