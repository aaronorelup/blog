// The hover card fits the window it opens in (src/scripts/cards/render.js place(), PREVIEWS.md): on a short window it
// steps down a size rather than run off the screen or cut off its own last lines, keeping clear of the link's words,
// for a RAG Goobie cite (with its "RAG Goobie cites:" line), a related row under the answer and a ledger row alike, by day and
// by night; at 1440x900 the cites' and related rows' cards stay full size. Ask gives Aaron's two answers of 2026-11-01
// (fixtures/answers.mjs) on a kept session, so no Turnstile loads. Desktop only: a phone gets no card (ledger-4). cards-*.
import { ANSWERS } from './fixtures/answers.mjs';
import { test, expect, sse, streamOf } from './fixtures.mjs';

test.skip(({ isMobile }) => isMobile, 'phones never get a card (ledger-4)');

const card = (page) => page.locator('.lp-card');
const input = (page) => page.locator('.search-input');

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('ao-ask', JSON.stringify({ token: 'kept', exp: Date.now() + 3600e3 })));
});

async function openLedger(page, mode) {
  await page.addInitScript((m) => localStorage.setItem('scene-mode', m), mode);
  await page.goto('/ledger/');
  expect(await page.evaluate(() => document.documentElement.dataset.mode ?? 'night')).toBe(mode);
}

// The open card once it has settled: inside the window whole, all of its words shown (none cut off by its own box),
// clear of the words of the link it opened from; and its size (render.js SIZES, '' for full).
async function fit(page, link) {
  await expect.poll(() => card(page).evaluate((c) => getComputedStyle(c).transform)).toBe('none');
  return link.evaluate((a) => {
    const c = document.querySelector('.lp-card.lp-on');
    const r = c.getBoundingClientRect();
    const words = document.createRange();
    words.selectNodeContents(a);
    const clear = [...words.getClientRects()].every((w) => w.right <= r.left || w.left >= r.right || w.bottom <= r.top || w.top >= r.bottom);
    return { inside: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth,
      whole: c.scrollHeight <= c.clientHeight, clear, size: c.className.replace(/\blp-(card|on)\b/g, '').trim() };
  });
}

// On a short window the answer and its rows don't fit on screen together: the link is scrolled into view with no card
// open (a scroll closes a card, PREVIEWS.md), then pointed at.
async function hover(page, link) {
  await page.mouse.move(5, 5);
  await expect(page.locator('.lp-card.lp-on')).toHaveCount(0);
  await link.scrollIntoViewIfNeeded();
  await link.hover();
}

// Each answer's cites and related rows, hovered in turn: the card each opens, settled. A cite's card is its post's with
// the line naming its passage; a related row's has its post's title and no line.
async function askedCards(page, posts) {
  const replies = [...ANSWERS];
  await page.route('**/api/ask', (route) => route.fulfill(sse(streamOf(replies.shift()))));
  await expect(page.locator('[data-search][data-ready]')).toHaveCount(1);
  await page.locator('[data-mode="ask"]').click();
  await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
  const seen = [];
  for (const [i, reply] of ANSWERS.entries()) {
    await input(page).fill(`What did Aaron find, question ${i}?`);
    await input(page).press('Enter');
    await expect(page.locator('.ask-text')).toHaveText(reply.reads);
    for (const [j, [n, slug, , , where]] of reply.links.entries()) {
      const link = page.locator('.ask-cite').nth(j);
      await hover(page, link);
      await expect(card(page).locator('.lp-line')).toHaveText(`RAG Goobie cites: ${where}`);
      await expect(card(page).locator('.lp-line')).toBeVisible();
      await expect(card(page).locator('.lp-title')).toHaveText(posts[slug].title);
      seen.push([`answer ${i} cite ${j} ${n}`, await fit(page, link)]);
    }
    for (const [j, slug] of reply.related.entries()) {
      const link = page.locator('.ask-related .row-link').nth(j);
      await hover(page, link);
      await expect(card(page).locator('.lp-title')).toHaveText(posts[slug].title);
      await expect(card(page).locator('.lp-line')).toBeHidden();
      seen.push([`answer ${i} related ${slug}`, await fit(page, link)]);
    }
  }
  return seen;
}

// The ledger's rows at the top, the middle and the foot of the window: every row whole on screen at three scrolls.
async function rowCards(page, posts) {
  const rows = page.locator('#panel-scroll [data-month] [data-ledger-entry]');
  const seen = [];
  for (const k of [0, 1, 2]) {
    await page.evaluate((k) => {
      const s = document.getElementById('panel-scroll');
      s.scrollTop += document.querySelector('[data-month]').getBoundingClientRect().top - 60 + k * innerHeight * 0.9;
    }, k);
    const onScreen = await rows.evaluateAll((as) => as.map((a, i) => [i, a.closest('.row').getBoundingClientRect()])
      .filter(([, r]) => r.top >= 0 && r.bottom <= innerHeight).map(([i]) => i));
    expect(onScreen.length).toBeGreaterThan(1);
    for (const i of onScreen) {
      const link = rows.nth(i);
      const slug = await link.getAttribute('data-ledger-entry');
      await link.hover();
      await expect(card(page).locator('.lp-meta')).toContainText(posts[slug].id);
      seen.push([`row ${slug}`, await fit(page, link)]);
    }
    await page.mouse.move(5, 5);
    await expect(card(page)).not.toHaveClass(/lp-on/);
  }
  return seen;
}

for (const viewport of [{ width: 1366, height: 657 }, { width: 1024, height: 600 }]) {
  for (const mode of ['day', 'night']) {
    test.describe(`${viewport.width}x${viewport.height} by ${mode}`, () => {
      test.use({ viewport });
      test(`cards-1 on a short window every card shows whole (${viewport.width}x${viewport.height}, ${mode})`, async ({ page, request }) => {
        const { posts } = await (await request.get('/ledger/previews.json')).json();
        await openLedger(page, mode);
        const seen = [...await askedCards(page, posts), ...await rowCards(page, posts)];
        for (const [what, got] of seen) expect(got, what).toEqual({ inside: true, whole: true, clear: true, size: got.size });
        // Stepping down only as far as it has to: many keep their picture, full size or as a thumbnail.
        expect(seen.filter(([, got]) => !got.size.includes('lp-compact')).length).toBeGreaterThan(5);
      });
    });
  }
}

test('cards-2 at 1440x900 a cite\'s and a related row\'s card are full size, and every card shows whole', async ({ page, request }) => {
  const { posts } = await (await request.get('/ledger/previews.json')).json();
  await openLedger(page, 'night');
  const asked = await askedCards(page, posts);
  for (const [what, got] of asked) expect(got, what).toEqual({ inside: true, whole: true, clear: true, size: '' });
  for (const [what, got] of await rowCards(page, posts)) expect(got, what).toEqual({ inside: true, whole: true, clear: true, size: got.size });
});

// A link taken out of the page while its card is open (the next answer replacing the one it was in) gets no
// pointerout. cards-2 caught it: the next answer put no link under the pointer, and the card stayed open after the
// pointer left. Here the related row gives way to a blank row of its height, then the pointer moves off.
test('cards-3 a card whose link leaves the page closes at the pointer\'s next move', async ({ page }) => {
  await page.route('**/api/ask', (route) => route.fulfill(sse(streamOf(ANSWERS[0]))));
  await openLedger(page, 'night');
  await expect(page.locator('[data-search][data-ready]')).toHaveCount(1);
  await page.locator('[data-mode="ask"]').click();
  await input(page).fill('What did Aaron find?');
  await input(page).press('Enter');
  await expect(page.locator('.ask-text')).toHaveText(ANSWERS[0].reads);
  const link = page.locator('.ask-related .row-link').last();
  await hover(page, link);
  await expect(card(page)).toHaveClass(/lp-on/);
  await link.evaluate((a) => {
    const row = a.closest('li');
    row.replaceWith(Object.assign(document.createElement('li'), { style: `height: ${row.offsetHeight}px` }));
  });
  await page.mouse.move(5, 5);
  await expect(card(page)).not.toHaveClass(/lp-on/);
});
