// The ledger's search box and Ask Goobie (src/scripts/search/, src/scripts/post/highlight.js): "/" focuses it and
// nothing loads before it is focused; Pagefind's words come fast, with heading-anchored excerpts; its index holds the
// listed posts and their notes and nothing else; the meaning half (/api/search) joins without a session and fails
// silently; a result opens its post with the passage marked; Ask keeps the box's words, selected, loads Turnstile only
// once opened and switched on, asks once at a time, links its [n] (a notes passage on the notes page), numbered by post
// with each link's card naming its passage and, on a phone, each a 44 px tap target, and shows related posts;
// { ask: false } hides the switch. /api/* answers come from fixtures/api.json and fixtures/answers.mjs; Turnstile is a
// stub. search-*.
import fs from 'node:fs';
import matter from 'gray-matter';
import { isLive } from '../../src/data/exempt.js';
import { test, expect } from './fixtures.mjs';
import { ANSWERS } from './fixtures/answers.mjs';

const SHAPES = JSON.parse(fs.readFileSync(new URL('./fixtures/api.json', import.meta.url), 'utf8'));
const POSTS = new URL('../../src/content/posts/', import.meta.url);
const UNLISTED = fs.readdirSync(POSTS).filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: f.slice(0, -3), ...matter(fs.readFileSync(new URL(f, POSTS), 'utf8')).data }))
  .filter((p) => p.unlisted && !p.draft);
// Cloudflare's Turnstile, as a stub: render() solves at once with the test response, and onload is called.
const TURNSTILE = `(() => {
  let opts = null;
  const solve = () => setTimeout(() => opts.callback('XXXX.DUMMY.TOKEN.XXXX'), 30);
  window.turnstile = { render(el, o) { opts = o; solve(); return 'w1'; }, reset() { solve(); } };
  window[new URL(document.currentScript.src).searchParams.get('onload')]();
})();`;

const input = (page) => page.locator('.search-input');
const results = (page) => page.locator('.results .row');
const words = (s) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu).join(' ');
// Goobie's links as they read: [label, page path, anchor] each.
const citeLinks = (page) => page.locator('.ask-cite').evaluateAll((as) => as.map((a) => {
  const u = new URL(a.getAttribute('href'), location.href);
  return [a.textContent, u.pathname, u.hash.slice(1)];
}));

// A challenge nobody solves: Turnstile gives up on it (timeout-callback), each time it is rendered or reset.
const UNSOLVED = `(() => {
  let opts = null;
  const giveUp = () => setTimeout(() => opts['timeout-callback'](), 30);
  window.turnstile = { render(el, o) { opts = o; giveUp(); return 'w1'; }, reset() { giveUp(); } };
  window[new URL(document.currentScript.src).searchParams.get('onload')]();
})();`;

// Every request to Turnstile and to /api/, as "GET /api/session" or the Turnstile URL.
async function watch(page, context, stub = TURNSTILE) {
  const seen = { turnstile: [], api: [] };
  await context.route('https://challenges.cloudflare.com/**', (route) => {
    seen.turnstile.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: stub });
  });
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith('/api/')) seen.api.push(`${r.method()} ${u.pathname}`);
  });
  return seen;
}

test('search-1 "/" focuses the box, and nothing of search loads before it is focused', async ({ page, context }) => {
  const seen = await watch(page, context);
  const pagefind = [];
  page.on('request', (r) => r.url().includes('/pagefind/') && pagefind.push(r.url()));
  await page.goto('/ledger/');
  await page.waitForLoadState('networkidle');
  expect([pagefind, seen.api, seen.turnstile]).toEqual([[], [], []]);
  await page.keyboard.press('/');
  await expect(input(page)).toBeFocused();
  await page.keyboard.type('a/b');   // inside the box "/" is a character
  await expect(input(page)).toHaveValue('a/b');
  await expect.poll(() => pagefind.some((u) => u.endsWith('/pagefind/pagefind.js'))).toBe(true);
});

test.describe('the words half alone', () => {
  test.use({ api: { '/api/search': 'search-503' } });
  test('search-2 "gpu" lists the words half within 150 ms of the index, each passage under its heading', async ({ page }) => {
    // The best of three fresh loads: on a box running other suites, one alone measures the box.
    const times = [];
    for (let i = 0; i < 3; i++) {
      await page.goto('/ledger/');
      await input(page).fill('gpu');   // typed before the index is in: searched the moment it is
      await expect(results(page).first()).toBeVisible();
      const [index, shown] = await page.evaluate(() => ['search:index', 'search:results']
        .map((n) => performance.getEntriesByName(n)[0].startTime));
      times.push(shown - index);
    }
    expect(Math.min(...times)).toBeLessThan(150);
    const rows = await results(page).evaluateAll((rs) => rs.map((r) => ({
      href: r.querySelector('.row-link').getAttribute('href'),
      where: r.querySelector('.row-meta')?.textContent ?? '',
      marks: r.querySelectorAll('.result-text mark').length,
    })));
    expect(rows.length).toBeGreaterThan(3);
    for (const r of rows) {
      expect(r.href).toMatch(/^\/ledger\/[^/?#]+\/(notes\/)?\?hl=gpu&hs=[^#]+(#.+)?$/);
      if (r.href.includes('#')) expect(r.where).toMatch(/^in: /);
    }
    expect(rows.filter((r) => r.marks > 0).length).toBeGreaterThan(3);
    expect(rows.some((r) => r.href.includes('#'))).toBe(true);
  });
});

test('search-3 the index holds the listed posts and their notes, every one a /ledger/ page that exists', async ({ page, request }) => {
  await page.goto('/ledger/');
  const urls = await page.evaluate(async () => {
    const pagefind = await import('/pagefind/pagefind.js');
    const all = await pagefind.search(null);
    return Promise.all(all.results.map(async (r) => (await r.data()).url));
  });
  const previews = await (await request.get('/ledger/previews.json')).json();
  const want = [];
  for (const slug of Object.keys(previews.posts)) {
    want.push(`/ledger/${slug}/`);
    if ((await request.get(`/ledger/${slug}/notes/`)).ok()) want.push(`/ledger/${slug}/notes/`);
  }
  const steady = (list) => list.filter((u) => !isLive(u.split('/')[2])).sort();
  expect(steady(urls)).toEqual(steady(want));
  for (const u of urls) {
    expect(u).toMatch(/^\/ledger\/[^/]+\/(notes\/)?$/);
    expect((await request.get(u)).status(), u).toBe(200);
  }
});

test('search-4 no unlisted post can be found by its title', async ({ page }) => {
  expect(UNLISTED.length).toBeGreaterThan(0);
  await page.goto('/ledger/');
  for (const { slug, title } of UNLISTED) {
    await input(page).fill(title);
    await expect(results(page).first()).toBeVisible();
    expect(await page.locator('.results .row-link').evaluateAll((as, s) =>
      as.filter((a) => a.getAttribute('href').startsWith(`/ledger/${s}/`)).length, slug)).toBe(0);
  }
});

test('search-5 a result opens its post with the passage marked and in view; a click clears it', async ({ page }) => {
  await page.goto('/ledger/');
  await input(page).fill('gpu');
  // Both halves in (each draws the list once), so the link read is the link clicked.
  await expect.poll(() => page.evaluate(() => performance.getEntriesByName('search:results').length)).toBe(2);
  const first = page.locator('.results .row-link').first();
  const hs = new URL(await first.getAttribute('href'), 'https://x').searchParams.get('hs');
  await first.click();
  await page.waitForURL(/\?hl=gpu/);
  const mark = page.locator('mark.hl').first();
  await expect(mark).toBeVisible();
  expect(words((await page.locator('mark.hl').allTextContents()).join(' '))).toContain(words(hs));
  await expect.poll(() => mark.evaluate((m) => {
    const r = m.getBoundingClientRect();
    const s = document.getElementById('panel-scroll').getBoundingClientRect();
    return r.top >= s.top && r.bottom <= s.bottom;
  })).toBe(true);
  expect(await page.evaluate(() => document.querySelector('.pc-card').scrollTop)).toBe(0);
  await page.locator('[data-post-article] h1').click();
  await expect(page.locator('mark.hl')).toHaveCount(0);
});

test('search-6 the meaning half joins the list once typing stops, with no session', async ({ page, context }) => {
  const seen = await watch(page, context);
  const asked = [];
  page.on('request', (r) => r.url().includes('/api/search') && asked.push(new URL(r.url()).searchParams.get('q')));
  await page.goto('/ledger/');
  await input(page).focus();
  await page.keyboard.type('gpu', { delay: 80 });
  // A hit only the meaning half has (fixtures/api.json search-200) shows up.
  await expect(page.locator('.results .row-link[href^="/ledger/characters-in-inscryption/notes/"]')).toBeVisible();
  expect(asked).toEqual(['gpu']);
  expect(seen.api.filter((a) => a.includes('/api/session'))).toEqual([]);
  expect(seen.turnstile).toEqual([]);
});

test('search-11 a search still answering when Ask opens draws nothing there and asks no meaning', async ({ page, context }) => {
  const seen = await watch(page, context);
  await page.goto('/ledger/');
  await input(page).focus();
  await expect.poll(() => page.evaluate(() => performance.getEntriesByName('search:index').length)).toBe(1);
  // From here the page's timers wait on a paused clock, so Ask opens inside the meaning half's 400 ms and Pagefind's
  // debounce however busy the box is; then both pass.
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 100);
  await input(page).fill('gpu');
  await page.locator('[data-mode="ask"]').click();
  await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(1000);
  await page.waitForTimeout(500);
  await expect(page.locator('[data-search-out] .results')).toHaveCount(0);
  expect(seen.api.filter((a) => a === 'GET /api/search')).toEqual([]);
});

test.describe('without the meaning half', () => {
  test.use({ api: { '/api/search': 'search-503' } });
  test('search-7 a failed meaning call leaves the words half and says nothing', async ({ page }) => {
    await page.goto('/ledger/');
    const answered = page.waitForResponse('**/api/search?**');
    await input(page).fill('gpu');
    await answered;
    await expect(results(page).first()).toBeVisible();
    expect(await results(page).count()).toBeGreaterThan(3);
    await expect(page.locator('.search-none')).toHaveCount(0);
  });
});

test.describe('Ask Goobie', () => {
  test('search-8 Ask loads Turnstile only once opened, asks once at a time, and links its sources', async ({ page, context }) => {
    const seen = await watch(page, context);
    // The first question is held until the test lets it go, so its pending state and a second Enter during it are
    // seen however slow the box is. A fixed delay (it was 700 ms) let the answer come back first on a loaded box,
    // and that second Enter then rightly asked again.
    let letGo;
    const held = new Promise((r) => { letGo = r; });
    let asked = 0;
    await page.route('**/api/ask', async (route) => {
      if (++asked === 1) await held;
      await route.fallback();
    });
    await page.goto('/ledger/');
    await input(page).fill('gpu');
    await expect(results(page).first()).toBeVisible();
    expect(seen.turnstile).toEqual([]);

    await page.locator('[data-mode="ask"]').click();
    await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(input(page)).toHaveAttribute('placeholder', 'Ask Goobie about anything Aaron has written');
    await expect(page.locator('.search-goobie')).toBeVisible();
    await expect.poll(() => seen.api.includes('POST /api/session')).toBe(true);
    expect(seen.api.indexOf('GET /api/session')).toBeLessThan(seen.api.indexOf('POST /api/session'));
    expect(seen.turnstile).toHaveLength(1);

    const reply = SHAPES['ask-200'].json;
    await input(page).fill('How much faster is a rented GPU than my laptop?');
    await input(page).press('Enter');
    await expect(page.locator('.search-go')).toBeDisabled();
    await expect(page.locator('.search')).toHaveClass(/is-thinking/);
    await input(page).press('Enter');   // a second Enter while one is out sends nothing
    await expect(page.locator('.search')).toHaveClass(/is-thinking/);
    letGo();
    // Every cite is a passage of one post, so each reads [1], and a run of them ([1][2], [1][3]) shows once.
    await expect(page.locator('.ask-text')).toHaveText(reply.answer.replace(/(\[\d+\])+/g, '[1]'));
    await expect(page.locator('.search-go')).toBeEnabled();
    expect(seen.api.filter((a) => a === 'POST /api/ask')).toHaveLength(1);
    await expect(page.locator('.ask-fine')).toHaveText("Goobie answers from Aaron's posts only and can be wrong.");
    expect(await page.locator('.ask-related .row-link').evaluateAll((as) => as.map((a) => a.getAttribute('href'))))
      .toEqual(reply.related.map((s) => `/ledger/${s}/`));

    // Each link goes to its own passage: a run, to its first.
    const post = '/ledger/renting-a-gpu/';
    expect(await citeLinks(page)).toEqual([['[1]', post, 'short'], ['[1]', post, ''], ['[1]', post, 'short'],
      ['[1]', post, 'the-first-night-it-was-barely-faster']]);
    for (const href of await page.locator('.ask-cite').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) {
      expect(href).toMatch(/^\/ledger\/renting-a-gpu\/\?hl=[^#]+(#.+)?$/);
    }
    // A second question uses the same session; no second solve.
    await input(page).fill('What did the first night cost?');
    await input(page).press('Enter');
    await expect.poll(() => seen.api.filter((a) => a === 'POST /api/ask').length).toBe(2);
    expect(seen.api.filter((a) => a === 'POST /api/session')).toHaveLength(1);
    expect(seen.turnstile).toHaveLength(1);

    // A citation opens its passage with the question's words marked.
    await expect(page.locator('.search-go')).toBeEnabled();
    await page.locator('.ask-cite[href$="#the-first-night-it-was-barely-faster"]').click();
    await page.waitForURL(/#the-first-night-it-was-barely-faster$/);
    await expect(page.locator('mark.hl').first()).toBeVisible();
  });

  test('search-14 opening Ask keeps the typed words, selected, so typing replaces them', async ({ page, context }) => {
    await watch(page, context);
    await page.goto('/ledger/');
    await input(page).fill('rented gpu');
    await page.locator('[data-mode="ask"]').click();
    await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(input(page)).toBeFocused();
    expect(await input(page).evaluate((el) => [el.value, el.selectionStart, el.selectionEnd])).toEqual(['rented gpu', 0, 10]);
    await page.keyboard.type('What does a rented GPU cost?');
    await expect(input(page)).toHaveValue('What does a rented GPU cost?');
  });

  test.describe('citing a notes passage', () => {
    test.use({ api: { '/api/ask': 'ask-notes' } });
    test('search-13 a cite of a notes passage opens the notes page at it; a post passage, the post', async ({ page, context }) => {
      await watch(page, context);
      const reply = SHAPES['ask-notes'].json;
      const notes = reply.cites.find((c) => c.kind === 'notes' && c.anchor);
      await page.goto('/ledger/');
      await page.locator('[data-mode="ask"]').click();
      await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
      await input(page).fill('What went wrong making the Inscryption cards?');
      await input(page).press('Enter');
      // One post, its notes included: every run reads [1] and goes to its first passage, [5] to the notes page.
      await expect(page.locator('.ask-text')).toHaveText(reply.answer.replace(/(\[\d+\])+/g, '[1]'));
      const post = `/ledger/${notes.slug}/`;
      expect(await citeLinks(page)).toEqual([['[1]', post, 'short'], ['[1]', post, 'short'], ['[1]', post, 'short'],
        ['[1]', post, 'short'], ['[1]', `${post}notes/`, notes.anchor]]);
      await page.locator(`.ask-cite[href*="/notes/"][href$="#${notes.anchor}"]`).click();
      await page.waitForURL(new RegExp(`/ledger/${notes.slug}/notes/\\?hl=[^#]+#${notes.anchor}$`));
      await expect(page.locator(`[data-post-article] [id="${notes.anchor}"]`)).toHaveCount(1);
      await expect(page.locator('mark.hl').first()).toBeVisible();
    });
  });

  test('search-15 cites are numbered by post with no gaps, and each one\'s card names its post and passage', async ({ page, context, request, isMobile }) => {
    await watch(page, context);
    const { posts } = await (await request.get('/ledger/previews.json')).json();
    const replies = [...ANSWERS];
    await page.route('**/api/ask', (route) => route.fulfill({ json: replies.shift() }));
    await page.goto('/ledger/');
    await page.locator('[data-mode="ask"]').click();
    await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
    for (const [i, reply] of ANSWERS.entries()) {
      await input(page).fill(`What did Aaron find, question ${i}?`);
      await input(page).press('Enter');
      await expect(page.locator('.ask-text')).toHaveText(reply.reads);
      expect(await citeLinks(page)).toEqual(reply.links.map(([n, slug, notes, anchor]) => [n, `/ledger/${slug}/${notes}`, anchor]));
      const cites = page.locator('.ask-cite');
      // No native tooltip doubling the card; a screen reader hears the source, its post and its passage.
      expect(await cites.evaluateAll((as) => as.filter((a) => a.hasAttribute('title')).length)).toBe(0);
      for (const [j, [n, slug, , , where]] of reply.links.entries()) {
        await expect(cites.nth(j)).toHaveAttribute('aria-label', `Source ${n.slice(1, -1)}: ${posts[slug].title}, ${where}`);
      }
      if (isMobile) continue;   // phones never get a card (ledger-4)
      const card = page.locator('.lp-card');
      for (const [j, [, slug, , , where]] of reply.links.entries()) {
        await cites.nth(j).hover();
        await expect(card).toHaveClass(/lp-on/);
        await expect(card.locator('.lp-title')).toHaveText(posts[slug].title);
        await expect(card.locator('.lp-line')).toHaveText(`Goobie cites: ${where}`);
        await expect(card.locator('.lp-meta')).toContainText(posts[slug].id);
      }
      if (i === 0) {
        // From one cite of a post straight to another only the line changes: its loop plays on, never from the start.
        expect(posts['every-ai-film-so-far'].loop).toBeTruthy();
        const video = card.locator('.lp-video');
        await cites.nth(0).hover();
        await expect(video).toHaveClass(/lp-ready/);
        await expect.poll(() => video.evaluate((v) => v.currentTime > 0.5 && v.currentTime < v.duration / 2)).toBe(true);
        const at = await video.evaluate((v) => v.currentTime);
        await cites.nth(2).hover();
        await expect(card.locator('.lp-line')).toHaveText('Goobie cites: the opening');
        expect(await video.evaluate((v) => v.currentTime)).toBeGreaterThan(at);
      }
      // Any other link's card is as it was: no line.
      await page.locator('.ask-related .row-link').first().hover();
      await expect(card.locator('.lp-title')).toHaveText(posts[reply.related[0]].title);
      await expect(card.locator('.lp-line')).toBeHidden();
      await page.mouse.move(5, 5);
      await expect(card).not.toHaveClass(/lp-on/);
    }
  });

  test('search-16 on a phone each cite is a 44 px target that covers no other cite, and the answer\'s lines stay put', async ({ page, context, isMobile }) => {
    await watch(page, context);
    // Aaron's first answer, which has a run with a space ([1] [2]) and two cites one above the other, and a run of two
    // posts with nothing between ([7][9] reads [2][3]).
    const reply = { ...ANSWERS[0], answer: `${ANSWERS[0].answer} Paper or film [7][9].` };
    await page.route('**/api/ask', (route) => route.fulfill({ json: reply }));
    await page.goto('/ledger/');
    await page.locator('[data-mode="ask"]').click();
    await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
    await input(page).fill('What did Aaron find?');
    await input(page).press('Enter');
    await expect(page.locator('.ask-text')).toContainText('Paper or film [2][3].');
    await page.locator('.ask-text').evaluate((p) => p.scrollIntoView({ block: 'center' }));
    // Each cite's box; how far a tap on it reaches from its middle (h, w); whether a tap anywhere on its number is its
    // own; and whether another cite sits within 22 px of it (a run, or one on the line below).
    const where = () => page.locator('.ask-text').evaluate((p) => [...p.querySelectorAll('.ask-cite')].map((a, i, all) => {
      const r = a.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hits = (px, py) => document.elementFromPoint(px, py)?.closest('.ask-cite') === a;
      const reach = (step) => { let k = 0; while (k < 40 && hits(...step(k + 0.5))) k++; return k; };
      const near = all.some((o) => {
        const q = o.getBoundingClientRect();
        return o !== a && q.left < r.right + 22 && q.right > r.left - 22 && q.top < r.bottom + 22 && q.bottom > r.top - 22;
      });
      return { box: [r.left, r.top, r.width, r.height], p: p.getBoundingClientRect().height, near,
        h: r.height + reach((k) => [x, r.top - k]) + reach((k) => [x, r.bottom + k]),
        w: r.width + reach((k) => [r.left - k, y]) + reach((k) => [r.right + k, y]),
        own: [[x, y], [r.left + 3, y], [r.right - 3, y], [x, r.top + 2], [x, r.bottom - 2]].every(([px, py]) => hits(px, py)) };
    }));
    const cites = await where();
    if (isMobile) expect(cites.filter((c) => !c.near).length).toBeGreaterThan(3);
    for (const [i, c] of cites.entries()) {
      expect(c.own, `cite ${i}`).toBe(true);
      // A desktop's cite is its own box (give or take the pixel the scan starts on), as it always was.
      if (!isMobile) {
        expect(c.h, `cite ${i}`).toBeLessThanOrEqual(c.box[3] + 2);
        expect(c.w, `cite ${i}`).toBeLessThanOrEqual(c.box[2] + 2);
      } else if (!c.near) {
        // Cites closer together than that share the room between them.
        expect(c.h, `cite ${i}`).toBeGreaterThanOrEqual(44);
        expect(c.w, `cite ${i}`).toBeGreaterThanOrEqual(44);
      }
    }
    // The bigger target moves nothing: every cite and the answer's height are where they are without it.
    const off = await page.addStyleTag({ content: '.ask-cite { position: static !important } .ask-cite::before { content: none !important }' });
    expect((await where()).map((c) => [c.box, c.p])).toEqual(cites.map((c) => [c.box, c.p]));
    if (!isMobile) return;
    // A tap under a cite's number, off its box, opens its passage.
    await off.evaluate((s) => s.remove());
    const href = await page.locator('.ask-cite').first().evaluate((a) => a.href);
    const [left, top, width, height] = cites[0].box;
    await page.touchscreen.tap(left + width / 2, top + height + 12);
    await page.waitForURL(href);
  });

  test.describe('switched off', () => {
    test.use({ api: { '/api/session': 'session-off' } });
    test('search-9 { ask: false } hides the switch, says Goobie is resting, and loads no Turnstile', async ({ page, context }) => {
      const seen = await watch(page, context);
      await page.goto('/ledger/');
      await page.locator('[data-mode="ask"]').click();
      await expect(page.locator('[data-search-note]')).toHaveText('Goobie is resting.');
      await expect(page.locator('.search-modes')).toBeHidden();
      await expect(input(page)).toHaveAttribute('placeholder', 'Search the ledger');
      expect(seen.api).toEqual(['GET /api/session']);
      expect(seen.turnstile).toEqual([]);
    });
  });

  test('search-12 a Turnstile challenge left unsolved says so and frees the button', async ({ page, context }) => {
    const seen = await watch(page, context, UNSOLVED);
    await page.goto('/ledger/');
    await page.locator('[data-mode="ask"]').click();
    await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
    await input(page).fill('How much faster is a rented GPU than my laptop?');
    await input(page).press('Enter');
    await expect(page.locator('.ask-note')).toHaveText('The check that this is a person didn’t finish. Try again in a minute.');
    await expect(page.locator('.search-go')).toBeEnabled();
    await expect(page.locator('.search')).not.toHaveClass(/is-thinking/);
    expect(seen.api).toEqual(['GET /api/session']);
  });

  for (const [shape, line] of [['ask-resting', 'Goobie is resting. These posts are closest.'],
    ['ask-not-found', 'Nothing Aaron has written covers that yet. These posts come closest.']]) {
    test.describe(shape, () => {
      test.use({ api: { '/api/ask': shape } });
      test(`search-10 ${shape}: the closest posts under one line`, async ({ page, context }) => {
        await watch(page, context);
        await page.goto('/ledger/');
        await page.locator('[data-mode="ask"]').click();
        await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
        await input(page).fill('a question with no good answer');
        await input(page).press('Enter');
        await expect(page.locator('.ask-note')).toHaveText(line);
        await expect(page.locator('.ask-related .row')).toHaveCount(SHAPES[shape].json.related.length);
        await expect(page.locator('.ask-text, .ask-fine')).toHaveCount(0);
      });
    });
  }
});
