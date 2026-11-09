// Contract files and the pages built from them: RSS guids and /version.json's shape, /stats drawn from /api/stats
// (mocked: 200 from fixtures/stats-200.json, 503 not-connected), where a link into a post lands, and the Now page's
// dated snapshots. INVENTORY rows pages-*.
import { test, expect } from './fixtures.mjs';
import { allDefined, pagesWhere, watchContent } from './helpers.mjs';

test('pages-1 the RSS feed has one item per listed post, guid = the post URL', async ({ request }) => {
  const previews = await (await request.get('/ledger/previews.json')).json();
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const guids = [...(await res.text()).matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((m) => m[1]);
  expect(guids.sort()).toEqual(Object.keys(previews.posts).map((s) => `https://aaronorelup.com/ledger/${s}/`).sort());
});

test('pages-2 /version.json says which build this is', async ({ request }) => {
  const v = await (await request.get('/version.json')).json();
  const previews = await (await request.get('/ledger/previews.json')).json();
  expect(Object.keys(v).sort()).toEqual(['branch', 'built', 'commit', 'newest', 'posts']);
  expect(v.commit).toMatch(/^[0-9a-f]{40}$/);
  expect(typeof v.branch).toBe('string');
  expect(v.built).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  expect(v.posts).toBe(Object.keys(previews.posts).length);
  expect(Object.keys(v.newest).sort()).toEqual(['date', 'id', 'slug']);
  expect(previews.posts[v.newest.slug].id).toBe(v.newest.id);
});

test.describe('/stats with the numbers', () => {
  test('pages-3 /stats draws the snapshot', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/stats');
    await expect(page.locator('#st-top')).toBeVisible();
    await expect(page.locator('.st-state-lede')).toHaveCount(0);
    await expect(page.locator('#st-top')).toContainText(/\d/);
    expect(errors).toEqual([]);
  });
});

// What the doorway's sort does to the content of its pile buttons, counted from the page's first script on (the sort
// can start as the page loads, when its piles are on screen at once) and from the moment the sort runs: { nodes,
// text } as contentChanges() counts them, with a pile button replaced counted as a node.
const GATE = `(() => {
  const n = window.__gate = { ran: false, nodes: 0, text: 0 };
  const inLabel = (x) => (x.nodeType === 1 ? x : x.parentElement)?.closest('.st-gate-label');
  const label = (x) => x.nodeType === 1 && (x.matches('.st-gate-label') || !!x.querySelector('.st-gate-label'));
  new MutationObserver((rs) => rs.forEach((m) => {
    if (m.type === 'attributes') { n.ran ||= m.target.classList.contains('st-gate-running'); return; }
    if (!n.ran) return;
    if (m.type === 'characterData') { if (inLabel(m.target)) n.text++; return; }
    if (inLabel(m.target) || [...m.addedNodes, ...m.removedNodes].some(label)) n.nodes++;
  })).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });
})();`;

// The doorway's sort counts each pile up as its dots land, and a range change rolls the lede's figures: numbers inside
// buttons, changed in their own text node, never by a node replaced (on WebKit a tap on a button whose text node is
// replaced between press and release fires no click).
test.describe('/stats numbers that move', () => {
  test('pages-6 the sort counts the piles up in place: their buttons keep their text nodes', async ({ page }) => {
    await page.addInitScript(GATE);
    await page.goto('/stats');
    await page.locator('.st-gate-label').first().scrollIntoViewIfNeeded();
    await expect(page.locator('.st-gate-running')).toHaveCount(1);
    await expect(page.locator('.st-gate-running')).toHaveCount(0, { timeout: 30_000 });   // the whole sort
    const n = await page.evaluate(() => window.__gate);
    expect(n.ran).toBe(true);
    expect(n.nodes).toBe(0);
    expect(n.text).toBeGreaterThan(0);
  });

  test('pages-7 a range change rolls the lede\'s figures in place: their buttons keep their text nodes', async ({ page }) => {
    await page.goto('/stats');
    const prov = page.locator('#st-top .st-prov');
    await expect(prov.first()).toBeVisible();
    const before = await prov.allTextContents();
    const changes = await watchContent(prov);
    await page.locator('.st-pill', { hasText: '7 days' }).click();
    await expect.poll(() => prov.allTextContents()).not.toEqual(before);
    await expect(page.locator('#st-top .st-prov .st-tab')).toHaveCount(0);   // the roll (450 ms), to its end
    const n = await changes.read();
    expect(n.nodes).toBe(0);
    expect(n.text).toBeGreaterThan(0);
  });
});

test.describe('/stats without the numbers', () => {
  test.use({ api: { '/api/stats': 'stats-503' } });
  test('pages-4 /stats says the numbers are not connected', async ({ page }) => {
    await page.goto('/stats');
    await expect(page.locator('.st-state-lede')).toContainText("The numbers aren't connected right now.");
  });
});

// Each post component loads its own chunk; on a slow line it draws after the load event, when the browser has already
// scrolled to the link's heading, and a chart is shorter than the table it replaces. The chunks are held back here.
test('pages-5 a link lands on its heading, or its passage, once the components above have drawn', async ({ page }) => {
  const url = pagesWhere((p) => p.ao['ao-series'] && p.ao['ao-bars'])[0];
  await page.goto(url);
  const [id, hs] = await page.evaluate(() => {
    const h = [...document.querySelectorAll('[data-post-article] h2[id]')].at(-1);
    let p = h.nextElementSibling;
    while (p.tagName !== 'P') p = p.nextElementSibling;
    return [h.id, p.textContent.trim().split(/\s+/).slice(0, 5).join(' ')];
  });
  await page.goto('about:blank');
  await page.route('**/_astro/element.*.js', async (r) => {
    await new Promise((ok) => setTimeout(ok, 1000));
    await r.continue();
  });
  const heading = page.locator(`[id="${id}"]`);
  const top = () => heading.evaluate((h) => Math.round(h.getBoundingClientRect().top));
  await page.goto(`${url}#${id}`);
  await allDefined(page);
  await page.waitForTimeout(300);
  const landed = await top();
  await heading.evaluate((h) => h.scrollIntoView());
  expect(landed).toBe(await top());
  await page.goto(`${url}?hs=${encodeURIComponent(hs)}#${id}`);
  await allDefined(page);
  await expect.poll(() => page.locator('mark.hl').first().evaluate((m) => {
    const r = m.getBoundingClientRect();
    const s = document.getElementById('panel-scroll').getBoundingClientRect();
    return r.top >= s.top && r.bottom <= s.bottom;
  })).toBe(true);
});

// The Now page: /now is the newest snapshot of src/content/now/, its History links every snapshot by date, newest
// first, and each dated page shows that snapshot, marks its own row and points back to /now.
test('pages-8 /now shows the newest snapshot, and its History opens every dated one', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // The snapshot's own text: the prose before History.
  const snapshot = () => page.locator('.pc-prose').evaluate((prose) => {
    const parts = [];
    for (const el of prose.children) { if (el.id === 'now-history') break; parts.push(el.textContent.trim()); }
    return parts.join('\n');
  });
  const rows = page.locator('#now-history + ul > li');

  await page.goto('/now');
  await expect(page.locator('#panel-inner')).toHaveAttribute('data-active-view', 'now');
  await expect(page.locator('.page-title')).toHaveText('Now + Setup');
  const current = await snapshot();
  expect(current.length).toBeGreaterThan(0);
  const links = rows.locator('a');
  const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  await expect(rows).toHaveCount(hrefs.length);
  for (const href of hrefs) expect(href).toMatch(/^\/now\/\d{4}-\d\d-\d\d\/$/);
  expect(hrefs).toEqual([...new Set(hrefs)].sort().reverse());
  await expect(page.locator('.page-kicker')).toHaveText(`Updated ${await links.first().textContent()}`);

  for (const [i, href] of hrefs.entries()) {
    await page.goto(href);
    const own = page.locator('#now-history + ul > li[aria-current="page"]');
    await expect(own).toHaveCount(1);
    await expect(own.locator('a')).toHaveCount(0);
    await expect(rows.locator('a')).toHaveCount(hrefs.length - 1);
    await expect(page.locator('.page-kicker')).toHaveText(`Snapshot of ${await own.locator('strong').textContent()}`);
    await expect(page.locator('.page-lede a[href="/now"]')).toBeVisible();
    if (i === 0) expect(await snapshot()).toBe(current);
  }
  expect(errors).toEqual([]);
});
