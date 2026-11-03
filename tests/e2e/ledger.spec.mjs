// The ledger page (src/components/ledger/) and the hover card (src/scripts/cards/): every listed post once under its
// month, newest first; rows that hold one line of title and two of summary on a phone; the chips, their counts and
// their balanced lines; Start here; the stamp that opens a short version with no request; on a desktop, pointing at or
// focusing a post link opens its card from /ledger/previews.json (the icon where a card has no still), on /stats too;
// a phone never gets one; the feed's copy button. INVENTORY rows ledger-*.
import { START_HERE } from '../../src/data/picks.js';
import { test, expect } from './fixtures.mjs';

const rows = (page) => page.locator('#panel-scroll [data-ledger-entry]');
const card = (page) => page.locator('.lp-card');

test('ledger-1 every listed post appears once, newest first', async ({ page, request }) => {
  const previews = await (await request.get('/ledger/previews.json')).json();
  const rss = await (await request.get('/rss.xml')).text();
  const dated = [...rss.matchAll(/<guid[^>]*>https:\/\/aaronorelup\.com\/ledger\/([^/]+)\/<\/guid>.*?<pubDate>([^<]+)<\/pubDate>/gs)]
    .map(([, slug, d]) => ({ slug, t: Date.parse(d), id: previews.posts[slug].id }));
  const want = dated.sort((a, b) => b.t - a.t || b.id.localeCompare(a.id)).map((p) => p.slug);
  await page.goto('/ledger/');
  const got = await rows(page).evaluateAll((as) => as.map((a) => a.getAttribute('data-ledger-entry')));
  expect(got).toEqual(want);
  expect(new Set(got)).toEqual(new Set(Object.keys(previews.posts)));
  // Each under the month it was filed in.
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const months = Object.fromEntries(dated.map((p) => [p.slug, month.format(p.t)]));
  const shown = await rows(page).evaluateAll((as) => as.map((a) => [a.dataset.ledgerEntry, a.closest('[data-month]').querySelector('.month').textContent]));
  for (const [slug, m] of shown) expect(m, slug).toBe(months[slug]);
});

test.describe('the hover card', () => {
  test('ledger-2 pointing at a post opens its card, leaving and Escape close it', async ({ page, request, isMobile }) => {
    test.skip(isMobile, 'phones never get a card (ledger-4)');
    const previews = await (await request.get('/ledger/previews.json')).json();
    await page.goto('/ledger/');
    const r = rows(page).nth(2);
    const slug = await r.getAttribute('data-ledger-entry');
    await r.hover();
    await expect(card(page)).toHaveClass(/lp-on/);
    // A row shows its own title beside the card, so the card names the post by id.
    await expect(card(page).locator('.lp-meta')).toContainText(previews.posts[slug].id);
    await expect(card(page).locator('.lp-verdict')).toHaveText(previews.posts[slug].verdict || '');
    await page.mouse.move(5, 5);
    await expect(card(page)).not.toHaveClass(/lp-on/);
    await rows(page).nth(3).hover();
    await expect(card(page)).toHaveClass(/lp-on/);
    await page.keyboard.press('Escape');
    await expect(card(page)).not.toHaveClass(/lp-on/);
  });

  test('ledger-3 keyboard focus on a post link opens its card, and its picture loads', async ({ page, isMobile }) => {
    test.skip(isMobile, 'phones never get a card (ledger-4)');
    await page.goto('/ledger/');
    await page.waitForLoadState('networkidle');
    await rows(page).first().focus();
    await expect(card(page)).toHaveClass(/lp-on/);
    const img = card(page).locator('.lp-img');
    if (await img.getAttribute('src')) await expect(img).toHaveClass(/lp-ready/);
  });

  test('ledger-4 a phone gets no card', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'phone only');
    await page.goto('/ledger/');
    await rows(page).first().dispatchEvent('pointerover');
    await page.waitForTimeout(400);
    await expect(card(page)).toHaveCount(0);
  });

  test('ledger-5 a post link inside a post opens the card too', async ({ page, isMobile }) => {
    test.skip(isMobile, 'phones never get a card (ledger-4)');
    await page.goto('/ledger/');
    const slug = await rows(page).first().getAttribute('data-ledger-entry');
    await page.goto(`/ledger/${slug}/`);
    // The hover card's module is a dynamic import the load event doesn't wait for, and a pointer that comes to rest on
    // the link before the module listens gets no card until it moves.
    await page.waitForLoadState('networkidle');
    // A link to a post, /ledger/<slug>/: not the header's ledger filters (?topic=) or a notes page.
    const links = page.locator('[data-post-article] a[href^="/ledger/"]');
    const i = await links.evaluateAll((as) => as.findIndex((a) => /^\/ledger\/[^/?#]+\/$/.test(a.getAttribute('href'))
      && a.checkVisibility()));
    const link = links.nth(i);
    await link.scrollIntoViewIfNeeded();
    await link.hover();
    await expect(card(page)).toHaveClass(/lp-on/);
    await expect(card(page).locator('.lp-title')).not.toBeEmpty();
  });
});

test('ledger-6 the copy button on the ledger page puts the feed’s address on the clipboard', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only in Playwright');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/ledger/');
  await page.locator('#feed-copy').click();
  await expect(page.locator('#feed-copy')).toHaveText('copied', { timeout: 3000 });
});

test('ledger-7 on a phone a title is one line and a summary at most two', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone only (390 px)');
  await page.goto('/ledger/');
  const sizes = await page.locator('[data-month] .row').evaluateAll((rs) => rs.map((r) => {
    const line = (el) => parseFloat(getComputedStyle(el).lineHeight);
    const [title, summary] = [r.querySelector('.row-link'), r.querySelector('.row-summary')];
    return { title: title.getBoundingClientRect().height / line(title), summary: summary.getBoundingClientRect().height / line(summary) };
  }));
  for (const { title, summary } of sizes) {
    expect(title).toBeLessThan(1.5);
    expect(summary).toBeLessThan(2.5);
  }
});

test.describe('the chips', () => {
  const visible = (page) => page.locator('[data-month] .row:visible');

  test('ledger-8 a chip shows as many rows as it counts, and the All chip all of them', async ({ page }) => {
    await page.goto('/ledger/');
    const total = await page.locator('[data-month] .row').count();
    for (const chip of await page.locator('.chip').all()) {
      await chip.click();
      const n = Number(await chip.locator('.chip-n').textContent());
      await expect(visible(page)).toHaveCount(n);
      await expect(chip).toHaveAttribute('aria-current', 'true');
      // Every month left on screen has a row in it.
      expect(await page.locator('[data-month]:visible').evaluateAll((ms) => ms.every((m) => m.querySelector('.row:not([hidden])')))).toBe(true);
    }
    await page.locator('.chip[data-chip=""]').click();
    await expect(visible(page)).toHaveCount(total);
  });

  test('ledger-9 ?topic=video opens filtered, and a chip keeps the rest of the address', async ({ page }) => {
    await page.goto('/ledger/?topic=video&from=x');
    const chip = page.locator('.chip[data-chip="topic"][data-value="video"]');
    await expect(chip).toHaveAttribute('aria-current', 'true');
    await expect(visible(page)).toHaveCount(Number(await chip.locator('.chip-n').textContent()));
    expect(await visible(page).evaluateAll((rs) => rs.every((r) => r.dataset.topic === 'video'))).toBe(true);
    const project = page.locator('.chip[data-chip="project"]').first();
    await project.click();
    const url = new URL(page.url());
    expect(url.searchParams.get('from')).toBe('x');
    expect(url.searchParams.get('topic')).toBeNull();
    expect(url.searchParams.get('project')).toBe(await project.getAttribute('data-value'));
    await project.click();   // the lit chip again: everything
    expect(new URL(page.url()).search).toBe('?from=x');
    await expect(page.locator('.chip[data-chip=""]')).toHaveAttribute('aria-current', 'true');
  });
});

test('ledger-14 a chip row that wraps balances its lines: never one chip alone on the last', async ({ page }) => {
  await page.goto('/ledger/');
  const lines = await page.locator('.chip-list').evaluateAll((lists) => lists.map((l) => {
    const perLine = new Map();
    for (const c of l.querySelectorAll('.chip')) {
      const top = Math.round(c.getBoundingClientRect().top);
      perLine.set(top, (perLine.get(top) ?? 0) + 1);
    }
    return [...perLine.values()];
  }));
  expect(lines).toHaveLength(2);
  for (const counts of lines) expect(counts.length === 1 || counts.at(-1) > 1, counts.join('/')).toBe(true);
});

test('ledger-10 Start here shows its five posts, each with icon, title and stamp', async ({ page }) => {
  await page.goto('/ledger/');
  const cards = page.locator('.start-cards > .post-card');
  await expect(cards).toHaveCount(5);
  expect(await cards.locator('.post-card-link').evaluateAll((as) => as.map((a) => a.getAttribute('href'))))
    .toEqual(START_HERE.map((s) => `/ledger/${s}/`));
  for (const card of await cards.all()) {
    await expect(card.locator('.post-card-icon')).toBeVisible();
    await expect(card.locator('.stamp')).not.toBeEmpty();
  }
});

test('ledger-11 the stamp opens a row’s short version in place, with no request', async ({ page, isMobile }) => {
  // On a laptop the hover card fetches its text once the page is idle (cards/hover.js), which a busy box can put
  // after networkidle: that fetch is the card's, not the stamp's, so it is waited for first.
  const cards = isMobile ? null : page.waitForResponse('**/ledger/previews.json');
  await page.goto('/ledger/');
  await cards;
  await page.waitForLoadState('networkidle');
  const requests = [];   // fetches and page loads (row icons load as rows scroll into view)
  page.on('request', (r) => ['fetch', 'xhr', 'document'].includes(r.resourceType()) && requests.push(r.url()));
  const row = page.locator('[data-month] .row').filter({ has: page.locator('.row-card') }).nth(1);
  await row.locator('.stamp').click();
  await expect(row.locator('.row-card')).toHaveAttribute('open', '');
  await expect(row.locator('.row-takeaway')).toBeVisible();
  expect(page.url()).toMatch(/\/ledger\/$/);
  expect(requests).toEqual([]);
});

test('ledger-12 a card with no still shows the post’s icon instead', async ({ page, request, isMobile }) => {
  test.skip(isMobile, 'phones never get a card (ledger-4)');
  const previews = await (await request.get('/ledger/previews.json')).json();
  const [slug] = Object.entries(previews.posts).find(([, c]) => c.icon && c.image);
  await page.route('**/ledger/previews.json', async (route) => {
    const json = await (await route.fetch()).json();
    delete json.posts[slug].image;
    delete json.posts[slug].loop;
    await route.fulfill({ json });
  });
  await page.goto('/ledger/');
  await page.locator(`[data-ledger-entry="${slug}"]`).hover();
  await expect(card(page)).toHaveClass(/lp-on/);
  await expect(card(page).locator('.lp-media')).toBeHidden();
  await expect(card(page).locator('.lp-icon')).toBeVisible();
  expect(await card(page).locator('.lp-icon').getAttribute('src')).toMatch(/^\/media\/icons\/AO-\d+-96\.webp$/);
});

test('ledger-13 a post link on /stats opens its card', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones never get a card (ledger-4)');
  await page.goto('/stats');
  // The chapter of growing posts draws its links once it comes into view.
  await page.locator('#st-growing').scrollIntoViewIfNeeded();
  const link = page.locator('#st-growing a[href^="/ledger/"]').first();
  await link.scrollIntoViewIfNeeded();
  await link.hover();
  await expect(card(page)).toHaveClass(/lp-on/);
});
