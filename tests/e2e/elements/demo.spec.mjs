// <ao-demo>: the per-post demos, loaded as their own chunk. synthid (AO-0 claude-text-watermark) has five parts, cf
// (who-visits-a-new-website) two; /cdn-cgi/trace and /api/reads are answered by the fixtures.
import { test, expect } from '../fixtures.mjs';
import { open, pageWith } from '../helpers.mjs';

const demo = (page, name, part) => page.locator(`ao-demo[name="${name}"][part="${part}"]`);
const mounted = (d) => expect(d.locator(':scope > .sid, :scope > .cfd, :scope > div').first()).toBeVisible();

test.describe('synthid', () => {
  test.beforeEach(async ({ page }) => open(page, pageWith('ao-demo', (a) => a.name === 'synthid')));

  test('demo-synthid-1 tournament: changing a word redraws the tournament', async ({ page }) => {
    const d = demo(page, 'synthid', 'tournament');
    await mounted(d);
    const bracket = d.locator('.sid-bracket');
    const before = await bracket.innerHTML();
    await d.locator('.sid-word.swap').first().click();
    await expect.poll(() => bracket.innerHTML()).not.toBe(before);
    const key = d.locator('.sid-keyrow button[aria-pressed="false"]').first();
    const pairs = await d.locator('.sid-pairs').innerHTML();
    await key.click();
    await expect.poll(() => d.locator('.sid-pairs').innerHTML()).not.toBe(pairs);
  });

  test('demo-synthid-2 certain: removing the long tail changes the pairs', async ({ page }) => {
    const d = demo(page, 'synthid', 'certain');
    await mounted(d);
    const pairs = d.locator('.sid-pairs');
    const before = await pairs.innerHTML();
    await d.locator('.sid-check input[type=checkbox]').check();
    await expect.poll(() => pairs.innerHTML()).not.toBe(before);
    const other = d.locator('.sid-row button[aria-pressed="false"]').first();
    const now = await pairs.innerHTML();
    await other.click();
    await expect.poll(() => pairs.innerHTML()).not.toBe(now);
  });

  test('demo-synthid-3 detect: checking fewer words changes the score', async ({ page }) => {
    const d = demo(page, 'synthid', 'detect');
    await mounted(d);
    const line = d.locator('.sid-score-line');
    const before = await line.textContent();
    await d.locator('input[type=range]').evaluate((r) => { r.value = r.min; r.dispatchEvent(new Event('input', { bubbles: true })); });
    await expect(line).not.toHaveText(before);
  });

  test('demo-synthid-4 edit: typing or an edit button rescores the letter, Reset brings it back', async ({ page }) => {
    const d = demo(page, 'synthid', 'edit');
    await mounted(d);
    const status = d.locator('.sid-status');
    const area = d.locator('textarea.sid-area');
    const line = d.locator('.sid-score-line');
    const before = await line.textContent();
    await area.fill('A short letter of my own, with none of the original wording left in it at all, to see the score fall.');
    await expect(status).toContainText('Your edits.');
    await expect(line).not.toHaveText(before);
    await d.getByRole('button', { name: 'Reset' }).click();
    await expect(status).toHaveText('Back to Claude’s original letter.');
    await expect(line).toHaveText(before);
    const i = await d.locator('.sid-btn').evaluateAll((bs) => bs.findIndex((b) => !b.hasAttribute('aria-pressed') && b.textContent !== 'Reset'));
    const edit = d.locator('.sid-btn').nth(i);
    await edit.click();
    await expect(edit).toHaveAttribute('aria-pressed', 'true');
    await expect(edit).toBeDisabled();
    await expect(line).not.toHaveText(before);
  });

  test('demo-synthid-5 book: pointing at the chart shows the readout', async ({ page }) => {
    const d = demo(page, 'synthid', 'book');
    await mounted(d);
    const svg = d.locator('svg.sid-chart');
    await svg.scrollIntoViewIfNeeded();
    const box = await svg.boundingBox();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect(d.locator('.sid-tip')).toBeVisible();
    await expect(d.locator('.sid-tip b')).toContainText('of the words');
    await page.mouse.move(0, 0);
    await expect(d.locator('.sid-tip')).toBeHidden();
  });
});

test.describe('cf', () => {
  test.beforeEach(async ({ page }) => open(page, pageWith('ao-demo', (a) => a.name === 'cf')));

  test('demo-cf-1 you: asks the edge and lays out the visit, the address masked until shown', async ({ page }) => {
    const d = demo(page, 'cf', 'you');
    await d.getByRole('button', { name: 'Show what Cloudflare saw of me' }).click();
    const trace = d.locator('.cfd-trace');
    await expect(trace).toContainText('Data centre');
    await expect(trace).toContainText('United States');
    const ip = trace.locator('dt', { hasText: 'IP address' }).locator('xpath=following-sibling::dd/b/span');
    await expect(ip).toHaveText('203.0.•••.•••');
    await trace.getByRole('button', { name: 'show' }).click();
    await expect(ip).toHaveText('203.0.113.7');
    await expect(d.getByRole('button', { name: 'Ask again' })).toBeVisible();
  });

  test('demo-cf-2 count: shows the live count, and an automated browser is not counted', async ({ page }) => {
    const d = demo(page, 'cf', 'count');
    await expect(d).toContainText('5');
    await expect(d).toContainText('Not counted: this browser says it is automated.');
  });
});
