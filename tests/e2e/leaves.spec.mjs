// The leaves room (/leaves/) and its door on the homepage (scripts/home/leaves-door.js): select exactly "leaves" in
// the hero's "the leaves change" and the room opens; it brews a cup that reads the next entry's number, is noindex and
// in no list, stores nothing, sends nothing off the site, and leaves by Esc, its pill or Back. INVENTORY leaves-*.
import { test, expect } from './fixtures.mjs';

// Console errors and uncaught exceptions on every page of a test, checked at its end.
function watch(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

// Selects `word` (its nth match) inside `root`, as a long-press or a keyboard would leave it, and returns its rect.
function select(page, word, root = '.home-card-hero .home-lede', nth = 0, release = true) {
  return page.evaluate(({ word, root, nth, release }) => {
    const hosts = [...document.querySelectorAll(root)];
    let seen = 0;
    for (const host of hosts) {
      const walk = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const re = new RegExp(`\\b${word}\\b`, 'g');
        for (let m = re.exec(n.data); m; m = re.exec(n.data)) {
          if (seen++ < nth) continue;
          const range = document.createRange();
          range.setStart(n, m.index); range.setEnd(n, m.index + word.length);
          const r = range.getBoundingClientRect();
          if (release) {
            getSelection().setBaseAndExtent(n, m.index, n, m.index + word.length);
            document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
          }
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
      }
    }
    return null;
  }, { word, root, nth, release });
}

// The homepage with its module run (it drops html.no-js first, and binds the door in the same turn).
async function home(page) {
  await page.goto('/?tier=low');
  await expect(page.locator('.home-card-hero .home-lede').nth(1)).toContainText('leaves change');
  await page.waitForFunction(() => !document.documentElement.classList.contains('no-js'));
}

// The door navigates 720 ms after the selection; leaves-2 holds it to 3 s on a quiet box (@timing), the rest allow
// for a box whose cores the scene's software WebGL saturates.
async function room(page, timeout = 10_000) {
  await page.waitForURL('**/leaves/**', { timeout, waitUntil: 'commit' });
  await page.waitForFunction(() => window.__leaves, null, { timeout: 10_000 });
}

const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

test('leaves-1 the homepage pays nothing for the room, and other words open nothing', async ({ page }) => {
  const errors = watch(page);
  const asked = [];
  page.on('request', (r) => asked.push(new URL(r.url()).pathname));
  await home(page);
  await page.waitForLoadState('networkidle');
  const html = await (await page.request.get('/leaves/')).text();
  const chunk = /src="(\/_astro\/[^"]+\.js)"/.exec(html)[1];
  expect(asked.filter((p) => p.startsWith('/leaves') || p === chunk)).toEqual([]);
  await select(page, 'change');
  await select(page, 'leaves change');
  await select(page, 'Welcome');
  await select(page, 'the', '.home-card:not(.home-card-hero)');
  await select(page, 'Aaron', '.home-h1');
  await page.waitForTimeout(1200);
  expect(new URL(page.url()).pathname).toBe('/');
  expect(asked.filter((p) => p.startsWith('/leaves'))).toEqual([]);
  expect(errors).toEqual([]);
});

test('leaves-2 a double-click on the word opens the room within 3 s, and the hash is gone @timing', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a phone long-presses (leaves-3)');
  const errors = watch(page);
  await home(page);
  const at = await select(page, 'leaves', '.home-card-hero .home-lede', 0, false);
  await page.mouse.dblclick(at.x, at.y);
  await room(page, 3000);
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
  expect(new URL(page.url()).pathname).toBe('/leaves/');
  expect(errors).toEqual([]);
});

test('leaves-3 a finished selection of the word (a long-press, a keyboard) opens the room', async ({ page }) => {
  const errors = watch(page);
  await home(page);
  await select(page, 'leaves');
  await room(page);
  expect(new URL(page.url()).pathname).toBe('/leaves/');
  expect(errors).toEqual([]);
});

test('leaves-4 the room renders, is noindex and in no list, stores nothing and sends nothing away', async ({ page, baseURL }) => {
  const errors = watch(page);
  const away = [];
  page.on('request', (r) => { if (new URL(r.url()).origin !== new URL(baseURL).origin) away.push(r.url()); });
  await page.goto('/');
  const store = () => page.evaluate(() => JSON.stringify([{ ...localStorage }, { ...sessionStorage }, document.cookie]));
  const before = await store();
  await page.goto('/leaves/');
  await page.waitForFunction(() => window.__leaves && window.__leaves.state().t > 3, null, { timeout: 20_000 });
  const spread = await page.evaluate(() => {
    const cv = document.querySelector('.lv-canvas'), ctx = cv.getContext('2d'), v = [];
    for (let j = 1; j <= 9; j++) for (let i = 1; i <= 9; i++) {
      const [r, g, b] = ctx.getImageData(Math.floor(cv.width * i / 10), Math.floor(cv.height * j / 10), 1, 1).data;
      v.push((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255);
    }
    const m = v.reduce((a, b) => a + b, 0) / v.length;
    return v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length;
  });
  expect(spread).toBeGreaterThan(0.002);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  for (const list of ['/sitemap.xml', '/stats-pages.txt']) expect(await (await page.request.get(list)).text()).not.toContain('/leaves');
  await page.goto('/');
  expect(await store()).toBe(before);
  expect(away).toEqual([]);
  expect(errors).toEqual([]);
});

test('leaves-5 skip brews to rest: the loop stops and the slip reads the next entry', async ({ page }) => {
  const errors = watch(page);
  await page.goto('/leaves/');
  await page.waitForFunction(() => window.__leaves);
  await page.evaluate(() => window.__leaves.skip());
  const st = await page.evaluate(() => window.__leaves.state());
  expect(st.phase).toBe('rest');
  expect(st.running).toBe(false);
  const next = await page.evaluate(() => JSON.parse(document.getElementById('leaves-data').textContent).next);
  await expect(page.locator('.lv-slip')).toBeVisible();
  await expect(page.locator('.lv-slip')).toContainText(next);
  await expect(page.locator('.lv-alt')).toContainText(`read ${next.slice(3)}.`);
  expect(errors).toEqual([]);
});

for (const mode of ['day', 'night']) {
  test(`leaves-6 the ${mode} room is on the ${mode}'s own ground`, async ({ page }) => {
    const errors = watch(page);
    if (mode === 'day') await page.addInitScript(() => localStorage.setItem('scene-mode', 'day'));
    await page.goto('/leaves/');
    await page.waitForFunction(() => window.__leaves && window.__leaves.state().t > 0.8);
    const corner = await page.evaluate(() => [...document.querySelector('.lv-canvas').getContext('2d').getImageData(2, 2, 1, 1).data]);
    if (mode === 'day') expect(lum(corner)).toBeGreaterThan(0.8); else expect(lum(corner)).toBeLessThan(0.15);
    expect(errors).toEqual([]);
  });
}

test('leaves-7 under reduced motion the room is a finished still life at once', async ({ page }) => {
  const errors = watch(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/leaves/');
  await expect(page.locator('.lv-slip')).toBeVisible({ timeout: 1000 });
  expect(await page.evaluate(() => window.__leaves.state().running)).toBe(false);
  const lit = await page.evaluate(() => {
    const cv = document.querySelector('.lv-canvas'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let lo = 1, hi = 0;
    for (let k = 0; k < d.length; k += 4 * 997) { const l = (d[k] + d[k + 1] + d[k + 2]) / 765; lo = Math.min(lo, l); hi = Math.max(hi, l); }
    return hi - lo;
  });
  expect(lit).toBeGreaterThan(0.2);
  expect(errors).toEqual([]);
});

test('leaves-8 a leaf names its entry on hover or tap', async ({ page, isMobile }) => {
  const errors = watch(page);
  await page.goto('/leaves/');
  await page.waitForFunction(() => window.__leaves);
  await page.evaluate(() => window.__leaves.skip());
  const ids = await page.evaluate(() => JSON.parse(document.getElementById('leaves-data').textContent).leaves.map((l) => l.id));
  let named = '';
  for (const id of ids.slice(0, 6)) {
    const at = await page.evaluate((id) => window.__leaves.pointOf(id), id);
    if (isMobile) await page.touchscreen.tap(at.x, at.y); else await page.mouse.move(at.x, at.y);
    await page.waitForTimeout(250);
    named = await page.locator('.lv-label').textContent();
    if (named.includes('AO-0')) break;
  }
  expect(named).toContain('AO-0');
  await expect(page.locator('.lv-label')).toBeVisible();
  expect(errors).toEqual([]);
});

test('leaves-9 Esc and the pill each take the guest back home, and nothing of the door is left there', async ({ context }) => {
  const logs = [];
  // each way out from a fresh tab, so the second never starts on a page the first restored from the cache
  for (const leave of [(page) => page.keyboard.press('Escape'), (page) => page.locator('.lv-leave').click()]) {
    const page = await context.newPage();
    logs.push(watch(page));
    await home(page);
    await select(page, 'leaves');
    await room(page);
    await leave(page);
    await page.waitForURL((u) => u.pathname === '/', { timeout: 5000 });
    await expect(page.locator('.home-card-hero .home-lede').nth(1)).toContainText('In AI the leaves change every month.');
    expect(await page.evaluate(() => [...document.body.children].filter((e) => getComputedStyle(e).position === 'fixed'
      && /^(98|99)$/.test(getComputedStyle(e).zIndex)).length)).toBe(0);
  }
  expect(logs.flat()).toEqual([]);
});

test('leaves-10 the room fits the screen: no sideways scroll, pills a thumb can hit', async ({ page }) => {
  const errors = watch(page);
  await page.goto('/leaves/');
  await page.waitForFunction(() => window.__leaves);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const pill of ['.lv-leave', '.lv-sound']) expect((await page.locator(pill).boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.locator('.lv-sound').click();
  await expect(page.locator('.lv-sound')).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});
