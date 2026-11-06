// <ao-demo>: the per-post demos, loaded as their own chunk. synthid (AO-0 claude-text-watermark) has five parts, cf
// (who-visits-a-new-website) two, goobie-lab (three-ways-to-search-my-blog) four; /cdn-cgi/trace and /api/reads are
// answered by the fixtures, goobie-lab's live tools by the build's own /ask/ files and /rss.xml.
import fs from 'node:fs';
import { test, expect } from '../fixtures.mjs';
import { open, pagesWith, pageWith } from '../helpers.mjs';

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

// goobie-lab's post (AO-078) is a draft, so no built page has it: until it's out its four parts are mounted into the
// first built page with an <ao-demo>, with the demo's own stylesheet, as the post's article would hold them.
const LAB_CSS = fs.readFileSync(new URL('../../../src/elements/ao-demo/demos/goobie-lab/style.css', import.meta.url), 'utf8');
async function openLab(page) {
  const own = pagesWith('ao-demo', (a) => a.name === 'goobie-lab');
  if (own.length) return open(page, own[0]);
  await open(page, pageWith('ao-demo'));
  return page.evaluate((css) => {
    const prose = document.querySelector('[data-post-article] .pc-prose, [data-post-article] .prose');
    for (const part of ['agent', 'rag', 'context', 'windows']) {
      const d = document.createElement('ao-demo');
      d.setAttribute('name', 'goobie-lab');
      d.setAttribute('part', part);
      d.textContent = `The goobie-lab ${part} part needs JavaScript.`;
      prose.prepend(d);
    }
    const style = document.createElement('style');
    style.textContent = css;
    prose.prepend(style);
  }, LAB_CSS);
}
const lab = (page, part) => page.locator(`ao-demo[name="goobie-lab"][part="${part}"] > .gl`);
const slide = (range, value) => range.evaluate((r, v) => { r.value = String(v === 'max' ? r.max : v); r.dispatchEvent(new Event('input', { bubbles: true })); }, value);

test.describe('goobie-lab', () => {
  test.beforeEach(async ({ page }) => openLab(page));

  test('demo-lab-1 windows: the three ways, each with its map, in-context seeing every post and RAG a few', async ({ page }) => {
    const d = lab(page, 'windows');
    await expect(d.locator('.gl-way')).toHaveCount(3);
    const posts = await d.locator('.gl-way-context .gl-post').count();
    expect(posts).toBeGreaterThan(50);
    await expect(d.locator('.gl-way-context .gl-post.is-seen')).toHaveCount(posts);
    const rag = await d.locator('.gl-way-rag .gl-post.is-seen').count();
    expect(rag).toBeGreaterThan(0);
    expect(rag).toBeLessThan(posts / 4);
    await expect(d.locator('.gl-way-agent .gl-post.is-seen').first()).toBeAttached();
  });

  test('demo-lab-2 context: another question redraws the answer, and a blog past the window no longer fits', async ({ page }) => {
    const d = lab(page, 'context');
    const answer = d.locator('.gl-answer');
    const before = await answer.textContent();
    await d.locator('button.gl-q[aria-pressed="false"]').first().click();
    await expect(answer).not.toHaveText(before);
    await expect(d.locator('button.gl-q[aria-pressed="true"]')).toHaveCount(1);
    const out = d.locator('.gl-grow-out');
    await expect(out).toContainText('of the window');
    await slide(d.locator('.gl-grow input[type=range]'), 'max');
    await expect(out).toContainText('no longer fits');
  });

  test('demo-lab-3 rag: the k slider moves the cut and the window, and a chunk opens', async ({ page }) => {
    const d = lab(page, 'rag');
    await expect(d.locator('.gl-hit.is-in')).toHaveCount(8);
    const meter = d.locator('.gl-meter-text');
    const before = await meter.textContent();
    await slide(d.locator('.gl-k input[type=range]'), 3);
    await expect(d.locator('.gl-hit.is-in')).toHaveCount(3);
    await expect(meter).not.toHaveText(before);
    await expect(d.locator('.gl-k .gl-note')).toContainText('top 8');
    const chunk = d.locator('details.gl-chunk').first();
    await chunk.locator('summary').click();
    await expect(chunk.locator('p')).toBeVisible();
  });

  test('demo-lab-4 agent: Next, Back and Show every turn step through, the answer and grade at the last', async ({ page }) => {
    const d = lab(page, 'agent');
    await expect(d.locator('.gl-turn')).toHaveCount(1);
    await expect(d.locator('.gl-answer')).toHaveCount(0);
    await d.getByRole('button', { name: 'Next turn' }).click();
    await expect(d.locator('.gl-turn')).toHaveCount(2);
    await d.getByRole('button', { name: 'Back' }).click();
    await expect(d.locator('.gl-turn')).toHaveCount(1);
    await d.getByRole('button', { name: 'Show every turn' }).click();
    await expect(d.locator('.gl-answer')).toBeVisible();
    await expect(d.locator('.gl-grade')).toContainText('key facts');
    await expect(d.getByRole('button', { name: 'Next turn' })).toBeDisabled();
  });

  test('demo-lab-5 agent: a recorded tool call runs again live on the site and says whether it matches', async ({ page }) => {
    const call = lab(page, 'agent').locator('.gl-call').first();
    await call.getByRole('button', { name: 'Run this call live' }).click();
    await expect(call.locator('.gl-live')).toContainText(/(Same as|Different from) the recorded run/);
    await expect(call.locator('.gl-live')).toContainText('posts');
  });

  test('demo-lab-6 agent: the playground searches the reader\'s words as plain text; cites link to passages', async ({ page }) => {
    const d = lab(page, 'agent');
    const form = d.locator('form.gl-play');
    await form.locator('input.gl-input').fill('graphics card');
    await form.getByRole('button', { name: 'Run' }).click();
    await expect(form.locator('.gl-play-out')).toContainText('matches in');
    await form.locator('input.gl-input').fill('(');
    await form.getByRole('button', { name: 'Run' }).click();
    await expect(form.locator('.gl-play-out')).toContainText('for /\\(/i');
    await d.getByRole('button', { name: 'Show every turn' }).click();
    await expect(d.locator('.gl-answer a.gl-cite').first()).toHaveAttribute('href', /^\/ledger\/[a-z0-9-]+\/(notes\/)?(#[a-z0-9-]+)?$/);
  });
});
