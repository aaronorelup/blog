// The homepage overlay: a card grows into the ledger, rows and cross-links swap posts in with no document load, the
// components work again on every swap, history and Esc drive it, it stops players on close, and anything it can't
// do in place (a failed fetch, a lost chunk) ends on the real page. The selectors the overlay contract names (0.3)
// are the ones below; INVENTORY rows overlay-*.
import sharp from 'sharp';
import { test, expect } from './fixtures.mjs';
import { pageWith, pagesWhere, play, expectPlaying } from './helpers.mjs';

const PANEL = '#panel-screen';
const READER = '[data-view="reader"]';
const panel = (page) => page.locator(PANEL);
const reader = (page) => page.locator(READER);
const isOpen = (page) => expect(panel(page)).toHaveAttribute('aria-hidden', 'false');
const isClosed = (page) => expect(panel(page)).toHaveAttribute('aria-hidden', 'true');
const modelPost = pageWith('ao-model');
const gamePost = pageWith('ao-game');
const demoPost = pageWith('ao-demo', (a) => a.name === 'synthid');
const slugOf = (url) => url.split('/')[2];
test.describe.configure({ mode: 'default' });

// The homepage, with a marker on its window: if the marker survives, no document was loaded.
// ?tier=low pins the scene's cheapest animated rung: the overlay is the same, and software WebGL keeps up.
async function home(page) {
  await page.goto('/?tier=low');
  await expect(page.locator('#stop-rail [data-goto]').first()).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => { window.__sameDocument = true; });
}
// A navigation under way destroys the old document's context: that, too, means another document.
const sameDocument = (page) => page.evaluate(() => window.__sameDocument === true).catch(() => false);

// Walk the scene to the card that links to the ledger, then click its link: the card grows into the panel.
async function openLedger(page) {
  const card = page.locator('section[data-wp]').filter({ has: page.locator('a[href="/ledger"]') }).first();
  for (let k = 0; k < 6 && await card.evaluate((s) => s.inert); k++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(3000);
  }
  const link = card.locator('a[href="/ledger"]').first();
  const box = await link.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await isOpen(page);
  await expect(page).toHaveURL(/\/ledger$/);
}
const row = (page, url) => panel(page).locator(`[data-view="ledger"] [data-ledger-entry="${slugOf(url)}"]`).first();
async function openRow(page, url) {
  await row(page, url).click();
  await expect(page).toHaveURL(new RegExp(url + '$'));
  await expect(reader(page)).toHaveAttribute('data-slug', slugOf(url));
  await expect(reader(page).locator('h1, h2').first()).toBeVisible();
}
const allDefined = (page) => reader(page).evaluate((r) => r.querySelectorAll(':not(:defined)').length);
async function modelRenders(page) {
  const m = reader(page).locator('ao-model').first();
  await m.locator('.ao-model-load').click();
  const canvas = m.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 30_000 });
  await expect.poll(async () => {
    const { channels } = await sharp(await canvas.screenshot()).stats();
    return Math.max(...channels.slice(0, 3).map((c) => c.stdev));
  }, { timeout: 30_000 }).toBeGreaterThan(4);
}

test('overlay-1 a card grows into the ledger, with no document load', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await expect(panel(page).locator('[data-view="ledger"]')).toBeVisible();
  const from = await page.locator('section[data-wp]').filter({ has: page.locator('a[href="/ledger"]') }).first()
    .locator(':scope > *').first().boundingBox();
  await expect.poll(async () => {
    const b = await page.locator('#panel-card').boundingBox();
    return b.width * b.height;
  }).toBeGreaterThan(from.width * from.height * 1.5);
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-2 a row opens its post in the panel, with no document load', async ({ page }) => {
  await home(page);
  await openLedger(page);
  await openRow(page, modelPost);
  expect(await sameDocument(page)).toBe(true);
});

test('overlay-3 post A, post B, back to A and on to C: every component works on every swap', async ({ page }) => {
  test.setTimeout(180_000);
  await home(page);
  await openLedger(page);
  await openRow(page, modelPost);
  expect(await allDefined(page)).toBe(0);
  await modelRenders(page);
  await reader(page).locator('[data-close-reader]').first().click();
  await openRow(page, gamePost);
  expect(await allDefined(page)).toBe(0);
  await reader(page).locator('ao-game .ao-game-load').first().click();
  await expect(reader(page).locator('ao-game iframe')).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/ledger$/);
  await page.goBack();
  await expect(reader(page)).toHaveAttribute('data-slug', slugOf(modelPost));
  expect(await allDefined(page)).toBe(0);
  await modelRenders(page);
  await page.goForward();
  await page.goForward();
  await expect(reader(page)).toHaveAttribute('data-slug', slugOf(gamePost));
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
  // Broken on main: openPost's import('./post-components.js') has no fallback, so the post stays un-upgraded.
  // T1.2's lazy() navigates to the real page instead (INVENTORY overlay-4).
  test.fail();
  await page.route('**/_astro/post-components.*.js', (r) => r.abort(), { times: 1 });
  await home(page);
  await openLedger(page);
  await row(page, modelPost).click();
  await expect(page).toHaveURL(new RegExp(modelPost + '$'));
  await expect.poll(() => page.evaluate(() => !!customElements.get('ao-model')), { timeout: 10_000 }).toBe(true);
});

test('overlay-5 a link to another post inside a post stays in the panel', async ({ page }) => {
  await home(page);
  await openLedger(page);
  const from = pagesWhere((p) => p.kind === 'post' && p.posts.length > 0)[0];
  await openRow(page, from);
  // The reader holds the article's insides, so the links are the reader's own.
  const href = await reader(page).locator('a[href^="/ledger/"]').filter({ visible: true }).evaluateAll((as) =>
    as.map((a) => a.getAttribute('href')).find((h) => /^\/ledger\/[^/?#]+\/?$/.test(h)));
  await reader(page).locator(`a[href="${href}"]`).filter({ visible: true }).first().click();
  await expect(reader(page)).toHaveAttribute('data-slug', href.split('/')[2]);
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
  await expect(reader(page)).toHaveAttribute('data-slug', slugOf(modelPost));
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
  await expect(panel(page).locator('[data-view="ledger"]')).toBeVisible();
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
