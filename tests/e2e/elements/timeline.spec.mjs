// <ao-timeline>: one rail per lane, every event on its lane, and view buttons that dim what a party couldn't see.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

test('timeline-1 lanes become a legend and each event sits on its rail', async ({ page }) => {
  await open(page, pageWith('ao-timeline'));
  const el = page.locator('ao-timeline').first();
  const lanes = (await el.getAttribute('lanes')).split('|').map((p) => p.split(':')[0].trim());
  await expect(el.locator('.ao-tl-legend li')).toHaveCount(lanes.length);
  const rows = await el.locator(':scope > ol > li').evaluateAll((lis) => lis.map((li) => ({
    lane: li.dataset.lane, idx: +li.dataset.laneIdx, on: [...li.querySelectorAll('.ao-tl-rail i')].findIndex((i) => i.classList.contains('on')),
    who: !!li.querySelector('.ao-tl-who'),
  })));
  expect(rows.length).toBeGreaterThan(0);
  for (const r of rows) {
    expect(r.on).toBe(r.idx);
    expect(r.idx).toBe(Math.max(0, lanes.indexOf(r.lane)));
    expect(r.who).toBe(true);
  }
});

test('timeline-2 a view button dims the events outside that view, Everything brings them back', async ({ page }) => {
  await open(page, pageWith('ao-timeline', (a) => a.views));
  const el = page.locator('ao-timeline[views]').first();
  const buttons = el.locator('.ao-tl-views button');
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(el).toHaveAttribute('filtered', '');
  const key = (await el.getAttribute('views')).split('|')[0].split(':')[0].trim();
  const wrong = await el.locator(':scope > ol > li').evaluateAll((lis, key) => lis.filter((li) =>
    li.classList.contains('ao-tl-out') === (li.dataset.in || '').split(/\s+/).includes(key)).length, key);
  expect(wrong).toBe(0);
  await buttons.first().click();
  await expect(el.locator('.ao-tl-out')).toHaveCount(0);
  await expect(el).not.toHaveAttribute('filtered', '');
});
