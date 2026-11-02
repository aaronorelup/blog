// The ledger's search box and Ask RAG Goobie (src/scripts/search/, src/scripts/post/highlight.js): "/" focuses it and
// nothing loads before it is focused, and text typed before its module runs is still searched; Pagefind's words come
// fast, with heading-anchored excerpts; its index holds the listed posts and their notes and nothing else; the meaning
// half (/api/search) joins without a session and fails silently; a result opens its post with the passage marked; Ask
// keeps the box's words, selected, cycles example questions in the empty box, loads Turnstile only once opened and
// switched on, asks once at a time, shows its steps as the answer's stream comes, links its [n] (a notes passage on
// the notes page), numbered by post with each link's card naming its passage and, on a phone, each a 44 px tap target,
// and shows related posts; { ask: false } hides the switch. /api/* answers come from fixtures/api.json and
// fixtures/answers.mjs (Ask's as event streams); Turnstile is a stub. search-*.
import fs from 'node:fs';
import matter from 'gray-matter';
import { ABOUT_POST, EXAMPLES } from '../../src/data/ask.js';
import { isLive } from '../../src/data/exempt.js';
import { test, expect, sse, streamOf } from './fixtures.mjs';
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
// The box's module has mounted (box.js sets data-ready): only then does the switch answer a click.
const ready = (page) => expect(page.locator('[data-search][data-ready]')).toHaveCount(1);
const openAsk = async (page) => {
  await ready(page);
  await page.locator('[data-mode="ask"]').click();
  await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
};
const ASK_LABEL = 'Ask RAG Goobie about anything Aaron has written';
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
  // A wall-clock check: its own Playwright project runs it after the parallel ones, on a quiet box (playwright.config.mjs).
  test('search-2 "gpu" lists the words half within 150 ms of the index, each passage under its heading', { tag: '@timing' }, async ({ page }) => {
    // It times the code: Pagefind's search, the passages and the drawing of the first ones. Pagefind's files come from
    // memory after the first load, so no request's trip is in it (~125 ms each from this box to the live site, through
    // its proxy). The best of three fresh loads: on a box running other suites, one alone measures the box.
    const files = new Map();
    await page.route('**/pagefind/**', async (route) => {
      const key = new URL(route.request().url()).pathname;
      if (!files.has(key)) {
        const r = await route.fetch();
        files.set(key, { status: r.status(), headers: r.headers(), body: await r.body() });
      }
      return route.fulfill(files.get(key));
    });
    // The time from the index to the first drawn results, read when the page marks them (no polling meanwhile).
    const drawn = () => page.evaluate(() => new Promise((resolve) => {
      const done = () => {
        const [index, shown] = ['search:index', 'search:results'].map((n) => performance.getEntriesByName(n)[0]?.startTime);
        return shown !== undefined && (resolve(shown - index), true);
      };
      if (!done()) new PerformanceObserver(done).observe({ type: 'mark' });
    }));
    await page.goto('/ledger/');
    await input(page).fill('gpu');
    await drawn();
    const times = [];
    for (let i = 0; i < 3; i++) {
      await page.goto('/ledger/');
      await input(page).fill('gpu');   // typed before the index is in: searched the moment it is
      times.push(await drawn());
    }
    expect(Math.min(...times)).toBeLessThan(150);
    await expect(results(page)).toHaveCount(6);   // every passage in: the words half brings 6 pages
    await expect(page.locator('.results')).not.toHaveAttribute('aria-busy');
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
    await expect(page.locator('.results:not([aria-busy]) .row').first()).toBeVisible();   // the words half whole
    expect(await page.locator('.results .row-link').evaluateAll((as, s) =>
      as.filter((a) => a.getAttribute('href').startsWith(`/ledger/${s}/`)).length, slug)).toBe(0);
  }
});

test('search-5 a result opens its post with the passage marked and in view; a click clears it', async ({ page }) => {
  await page.goto('/ledger/');
  await input(page).fill('gpu');
  // Both halves in (the words half's passages all drawn, so the list is no longer busy, and the meaning half's own hit
  // there), so the link read is the link clicked.
  await expect(page.locator('.results:not([aria-busy]) .row-link[href^="/ledger/characters-in-inscryption/notes/"]')).toBeVisible();
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
  await ready(page);
  await page.locator('[data-mode="ask"]').click();
  await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(1000);
  await page.waitForTimeout(500);
  await expect(page.locator('[data-search-out] .results')).toHaveCount(0);
  expect(seen.api.filter((a) => a === 'GET /api/search')).toEqual([]);
});

// The words half asks Pagefind for its pages' fragments in rank order, so the nth fragment asked for is the nth page.
for (const [when, slow] of [['as they come', 0], ['with the 2nd page slow', 2], ['with the 1st page slow, so the meaning half draws first', 1]]) {
  test(`search-26 rows on screen never move or change while the rest arrive (${when}), and a click lands on the row read`, async ({ page, isMobile }) => {
    let asked = 0;
    await page.route('**/pagefind/fragment/**', async (route) => {
      if (++asked === slow) await new Promise((r) => setTimeout(r, 1500));
      await route.fallback();
    });
    await page.goto('/ledger/');
    await ready(page);
    // Every change to the list: no row is ever taken out, and each draw's links begin with the last draw's.
    await page.evaluate(() => {
      const out = document.querySelector('[data-search-out]');
      Object.assign(window, { draws: [], removed: 0 });
      new MutationObserver((ms) => {
        for (const m of ms) for (const n of m.removedNodes) if (n.nodeType === 1 && (n.matches('.row') || n.querySelector('.row'))) window.removed++;
        window.draws.push([...out.querySelectorAll('.results .row-link')].map((a) => a.getAttribute('href')));
      }).observe(out, { childList: true, subtree: true });
    });
    await input(page).fill('gpu');
    // The third row, read as a reader reaches it, the pointer on its link.
    await expect.poll(() => results(page).count()).toBeGreaterThanOrEqual(3);
    const link = results(page).nth(2).locator('.row-link');
    if (isMobile) await link.scrollIntoViewIfNeeded();
    const href = await link.getAttribute('href');
    const box = await link.boundingBox();
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
    if (!isMobile) await page.mouse.move(x, y);
    // Everything in: the words half's passages (the list no longer busy) and the meaning half's own page.
    await expect(page.locator('.results:not([aria-busy]) .row-link[href^="/ledger/characters-in-inscryption/notes/"]')).toBeAttached();
    expect(await link.boundingBox()).toEqual(box);
    expect(await page.evaluate(([px, py]) => document.elementFromPoint(px, py)?.closest('.row-link')?.getAttribute('href'), [x, y])).toBe(href);
    const { draws, removed } = await page.evaluate(() => ({ draws: window.draws.filter((d) => d.length), removed: window.removed }));
    expect(removed).toBe(0);
    for (let i = 1; i < draws.length; i++) expect(draws[i].slice(0, draws[i - 1].length)).toEqual(draws[i - 1]);
    if (slow) expect(new Set(draws.map((d) => d.length)).size).toBeGreaterThan(1);   // the rows did come in turn
    if (slow === 1) expect(draws[0].some((h) => h.startsWith('/ledger/characters-in-inscryption/notes/'))).toBe(true);
    await (isMobile ? page.touchscreen.tap(x, y) : page.mouse.click(x, y));
    await expect(page).toHaveURL((u) => u.pathname + u.search + u.hash === href);
  });
}

test.describe('without the meaning half', () => {
  test.use({ api: { '/api/search': 'search-503' } });
  test('search-7 a failed meaning call leaves the words half and says nothing', async ({ page }) => {
    await page.goto('/ledger/');
    const answered = page.waitForResponse('**/api/search?**');
    await input(page).fill('gpu');
    await answered;
    // The words half whole: every passage drawn, so the list is no longer busy.
    await expect(page.locator('.results:not([aria-busy]) .row').first()).toBeVisible();
    expect(await results(page).count()).toBeGreaterThan(3);
    await expect(page.locator('.search-none')).toHaveCount(0);
  });
});

test.describe('Ask RAG Goobie', () => {
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

    await openAsk(page);
    await expect(page.locator('[data-mode="ask"]')).toHaveText('Ask RAG Goobie');
    await expect(input(page)).toHaveAttribute('placeholder', ASK_LABEL);
    await expect(page.locator('.search-goobie')).toBeVisible();
    await expect.poll(() => seen.api.includes('POST /api/session')).toBe(true);
    expect(seen.api.indexOf('GET /api/session')).toBeLessThan(seen.api.indexOf('POST /api/session'));
    expect(seen.turnstile).toHaveLength(1);

    const reply = SHAPES['ask-200'].sse.at(-1);
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
    await expect(page.locator('.ask-fine')).toHaveText("RAG Goobie answers from Aaron's posts only and can be wrong.");
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
    await openAsk(page);
    await expect(input(page)).toBeFocused();
    expect(await input(page).evaluate((el) => [el.value, el.selectionStart, el.selectionEnd])).toEqual(['rented gpu', 0, 10]);
    await page.keyboard.type('What does a rented GPU cost?');
    await expect(input(page)).toHaveValue('What does a rented GPU cost?');
  });

  test.describe('citing a notes passage', () => {
    test.use({ api: { '/api/ask': 'ask-notes' } });
    test('search-13 a cite of a notes passage opens the notes page at it; a post passage, the post', async ({ page, context }) => {
      await watch(page, context);
      const reply = SHAPES['ask-notes'].sse.at(-1);
      const notes = reply.cites.find((c) => c.kind === 'notes' && c.anchor);
      await page.goto('/ledger/');
      await openAsk(page);
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
    await page.route('**/api/ask', (route) => route.fulfill(sse(streamOf(replies.shift()))));
    await page.goto('/ledger/');
    await openAsk(page);
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
        await expect(card.locator('.lp-line')).toHaveText(`RAG Goobie cites: ${where}`);
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
        await expect(card.locator('.lp-line')).toHaveText('RAG Goobie cites: the opening');
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
    await page.route('**/api/ask', (route) => route.fulfill(sse(streamOf(reply))));
    await page.goto('/ledger/');
    await openAsk(page);
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
    test('search-9 { ask: false } hides the switch, says RAG Goobie is resting, and loads no Turnstile', async ({ page, context }) => {
      const seen = await watch(page, context);
      await page.goto('/ledger/');
      await ready(page);
      await page.locator('[data-mode="ask"]').click();
      await expect(page.locator('[data-search-note]')).toHaveText('RAG Goobie is resting.');
      await expect(page.locator('.search-modes')).toBeHidden();
      await expect(input(page)).toHaveAttribute('placeholder', 'Search the ledger');
      expect(seen.api).toEqual(['GET /api/session']);
      expect(seen.turnstile).toEqual([]);
    });
  });

  test('search-12 a Turnstile challenge left unsolved says so and frees the button', async ({ page, context }) => {
    const seen = await watch(page, context, UNSOLVED);
    await page.goto('/ledger/');
    await openAsk(page);
    await input(page).fill('How much faster is a rented GPU than my laptop?');
    await input(page).press('Enter');
    await expect(page.locator('.ask-note')).toHaveText('The check that this is a person didn’t finish. Try again in a minute.');
    await expect(page.locator('.search-go')).toBeEnabled();
    await expect(page.locator('.search')).not.toHaveClass(/is-thinking/);
    expect(seen.api).toEqual(['GET /api/session']);
  });

  for (const [shape, line] of [['ask-resting', 'RAG Goobie is resting. These posts are closest.'],
    ['ask-busy', 'RAG Goobie has had a lot of questions this minute. Try again shortly.']]) {
    test.describe(shape, () => {
      test.use({ api: { '/api/ask': shape } });
      test(`search-10 ${shape}: the closest posts under one line`, async ({ page, context }) => {
        await watch(page, context);
        await page.goto('/ledger/');
        await openAsk(page);
        await input(page).fill('a question with no good answer');
        await input(page).press('Enter');
        await expect(page.locator('.ask-note')).toHaveText(line);
        await expect(page.locator('.ask-related .row')).toHaveCount(SHAPES[shape].sse.at(-1).related.length);
        await expect(page.locator('.ask-steps')).toHaveCount(0);
        await expect(page.locator('.ask-text, .ask-fine')).toHaveCount(0);
      });
    });
  }
});

// RAG Goobie's stream held by the test: /api/ask answers at once and each window.__askStep(n) sends the next n events
// of window.__ask (all of them, then the end, with no n).
const HELD = `(() => {
  const real = window.fetch;
  let ctrl = null;
  window.__ask = [];
  window.__askStep = (n = Infinity) => {
    for (let i = 0; i < n && window.__ask.length; i++) ctrl.enqueue(new TextEncoder().encode('data: ' + JSON.stringify(window.__ask.shift()) + '\\n\\n'));
    if (!window.__ask.length) ctrl.close();
  };
  window.fetch = (u, o) => (String(u).includes('/api/ask')
    ? Promise.resolve(new Response(new ReadableStream({ start(c) { ctrl = c; } }), { headers: { 'Content-Type': 'text/event-stream' } }))
    : real(u, o));
})();`;
const step = (page, n) => page.evaluate((k) => window.__askStep(k ?? undefined), n ?? null);

test.describe('Ask RAG Goobie at work', () => {
  test('search-17 the steps show in order, with titles from previews.json, then the answer and its summary', async ({ page, context, request }) => {
    await watch(page, context);
    await page.addInitScript(HELD);
    const { posts } = await (await request.get('/ledger/previews.json')).json();
    const events = SHAPES['ask-200'].sse;
    const read = events.find((e) => e.t === 'read');
    await page.goto('/ledger/');
    await openAsk(page);
    await page.evaluate((e) => { window.__ask = e; }, events);
    await input(page).fill('How much faster is a rented GPU?');
    await input(page).press('Enter');
    await expect(page.locator('.ask')).toHaveAttribute('aria-busy', 'true');
    const lines = [
      'Reading the catalog of 71 posts...',
      'Read the catalog of 71 posts: picked 3 (AI video & film, 3D & animation)',
      'Searched 5 ways: 312 passages from 41 posts, 9 look closely related',
      `Reading all 71 posts in full, starting with ${posts[read.focus[0]].title}, ${posts[read.focus[1]].title} and 4 more`,
      'Writing...',
    ];
    for (const [i, text] of lines.entries()) {
      await step(page, 1);
      await expect(page.locator('.ask-step')).toHaveText(lines.slice(0, i + 1));
      await expect(page.locator('.ask-step.is-done')).toHaveCount(i);
      await expect(page.locator('.ask [role="status"]')).toHaveText(text);
    }
    await step(page);
    const reply = events.at(-1);
    await expect(page.locator('.ask-text')).toHaveText(reply.answer.replace(/(\[\d+\])+/g, '[1]'));
    await expect(page.locator('.ask-steps')).toHaveCount(0);
    await expect(page.locator('.ask-summary')).toHaveText('Read all 71 posts in full · 309k tokens, 99.9% from cache · 5.2 s · $0.0025');
    await expect(page.locator('.ask')).not.toHaveAttribute('aria-busy', /.*/);
    await expect(page.locator('.ask-fine')).toHaveText("RAG Goobie answers from Aaron's posts only and can be wrong.");
    expect(await page.locator('.ask-fine a').count()).toBe(0);   // no "How RAG Goobie works" before that post is listed
  });

  test.describe('a cached answer', () => {
    test.use({ api: { '/api/ask': 'ask-cached' } });
    test('search-18 a cached answer is one event, said to be from the answer cache', async ({ page, context }) => {
      await watch(page, context);
      await page.goto('/ledger/');
      await openAsk(page);
      await input(page).fill('How much faster is a rented GPU?');
      await input(page).press('Enter');
      await expect(page.locator('.ask-summary')).toHaveText('Answered before, from the answer cache · 0.1 s');
      await expect(page.locator('.ask-text')).toHaveText(SHAPES['ask-cached'].sse[0].answer.replace(/(\[\d+\])+/g, '[1]'));
    });
  });

  test('search-19 words typing in are cited as they come, never a raw mark, and end as the answer\'s render', async ({ page, context }) => {
    await watch(page, context);
    await page.addInitScript(HELD);
    const events = streamOf(ANSWERS[0], ANSWERS[0].related);
    await page.goto('/ledger/');
    await openAsk(page);
    await page.evaluate((e) => { window.__ask = e; }, events);
    await input(page).fill('What did Aaron find?');
    await input(page).press('Enter');
    const before = events.findIndex((e) => e.t === 'text');
    await step(page, before + 4);   // the first words, two cites and the words that use them
    await expect(page.locator('.ask-text a.ask-cite').first()).toBeVisible();
    expect(await page.locator('.ask-text').textContent()).not.toMatch(/\[\d+\.\w+\]/);
    const partial = await page.locator('.ask-text').textContent();
    expect(ANSWERS[0].reads.startsWith(partial.trimEnd())).toBe(true);
    await step(page);
    await expect(page.locator('.ask-text')).toHaveText(ANSWERS[0].reads);
    expect(await citeLinks(page)).toEqual(ANSWERS[0].links.map(([n, slug, notes, anchor]) => [n, `/ledger/${slug}/${notes}`, anchor]));
  });

  test('search-20 the empty Ask box cycles example questions every 4 s; typing stops it, Search restores its own', async ({ page, context }) => {
    await watch(page, context);
    await page.addInitScript(() => { Math.random = () => 0.99; });   // the random first example is the last one
    await page.clock.install();
    await page.goto('/ledger/');
    await openAsk(page);
    const box = input(page);
    await expect(box).toHaveAttribute('placeholder', ASK_LABEL);
    const seen = [];
    for (let i = 0; i < 3; i++) {
      await page.clock.runFor(4000);
      seen.push(await box.getAttribute('placeholder'));
      await expect(box).toHaveAttribute('aria-label', ASK_LABEL);
    }
    // From the random example the list loops in order: past the last example, the default line, then the first.
    expect(seen).toEqual([EXAMPLES.at(-1), ASK_LABEL, EXAMPLES[0]]);
    await box.fill('my own question');
    const held = await box.getAttribute('placeholder');
    await page.clock.runFor(12000);
    await expect(box).toHaveAttribute('placeholder', held);
    await box.fill('');
    await page.clock.runFor(4000);
    await expect(box).not.toHaveAttribute('placeholder', held);
    await page.locator('[data-mode="search"]').click();
    await expect(box).toHaveAttribute('placeholder', 'Search the ledger');
    await page.clock.runFor(8000);
    await expect(box).toHaveAttribute('placeholder', 'Search the ledger');
    await expect(box).toHaveAttribute('aria-label', 'Search the ledger');
  });

  test('search-21 under reduced motion the Ask box shows the first example and never changes it', async ({ page, context }) => {
    await watch(page, context);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/ledger/');
    await openAsk(page);
    await expect(input(page)).toHaveAttribute('placeholder', EXAMPLES[0]);
    await page.clock.runFor(12000);
    await expect(input(page)).toHaveAttribute('placeholder', EXAMPLES[0]);
    await expect(input(page)).toHaveAttribute('aria-label', ASK_LABEL);
  });

  test('search-22 the Ask button shows the how-it-works post\'s card once that post is listed, and none before', async ({ page, context, isMobile }) => {
    await watch(page, context);
    const button = page.locator('[data-mode="ask"]');
    const card = page.locator('.lp-card');
    await page.goto('/ledger/');
    await ready(page);
    await button.hover();
    await page.waitForTimeout(400);
    await expect(page.locator('.lp-card.lp-on')).toHaveCount(0);
    // The post listed: previews.json has its card.
    await page.route('**/ledger/previews.json', async (route) => {
      const json = await (await route.fetch()).json();
      json.posts[ABOUT_POST] = { ...json.posts['renting-a-gpu'], id: 'AO-099', title: 'How RAG Goobie works' };
      await route.fulfill({ json });
    });
    await page.goto('/ledger/');
    await ready(page);
    if (isMobile) {
      await button.tap();
      await page.waitForTimeout(400);
      await expect(page.locator('.lp-card.lp-on')).toHaveCount(0);
      return;
    }
    await button.hover();
    await expect(card).toHaveClass(/lp-on/);
    await expect(card.locator('.lp-title')).toHaveText('How RAG Goobie works');
    await expect(card.locator('.lp-line')).toHaveText('How RAG Goobie works');
    await page.mouse.move(5, 5);
    await expect(card).not.toHaveClass(/lp-on/);
    await page.locator('[data-mode="search"]').focus();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(card).toHaveClass(/lp-on/);
  });

  test('search-23 words typed before the box\'s module has run are still searched', async ({ page }) => {
    let letGo;
    const held = new Promise((r) => { letGo = r; });
    await page.route(/\/_astro\/ledger\.[^/]+\.js$/, async (route) => { await held; await route.fallback(); });
    await page.goto('/ledger/', { waitUntil: 'domcontentloaded' });
    await input(page).fill('gpu');
    await expect(page.locator('[data-search][data-ready]')).toHaveCount(0);
    letGo();
    await expect(results(page).first()).toBeVisible();
    await expect(page.locator('.results')).toHaveAttribute('aria-label', 'Results for gpu');
  });

  test('search-24 the line under the box says how many posts RAG Goobie reads, in Ask only', async ({ page, context, request }) => {
    await watch(page, context);
    const { posts } = await (await request.get('/ledger/previews.json')).json();
    await page.goto('/ledger/');
    const line = page.locator('[data-ask-line]');
    await expect(line).toBeHidden();
    await openAsk(page);
    await expect(line).toHaveText(`RAG Goobie reads all ${Object.keys(posts).length} of Aaron's posts before answering.`);
    await page.locator('[data-mode="search"]').click();
    await expect(line).toBeHidden();
  });
});

test.describe('on a 360 px Android phone', () => {
  test.use({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  test('search-25 a cite ending a line flush makes no sideways scroll', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'the Android profile is Chromium');
    await watch(page, context);
    const reply = { ...ANSWERS[1] };
    await page.route('**/api/ask', (route) => route.fulfill(sse(streamOf(reply))));
    await page.goto('/ledger/');
    await openAsk(page);
    await input(page).fill('What did Aaron find?');
    await input(page).press('Enter');
    await expect(page.locator('.ask-text')).toHaveText(reply.reads);
    // The answer's paragraph narrowed a pixel at a time, its right side kept at the panel's, until a cite ends a line
    // flush with it.
    const flush = await page.locator('.ask-text').evaluate((p) => {
      const pr = getComputedStyle(p).paddingRight;
      const full = p.clientWidth - parseFloat(pr);
      for (let w = full; w > full - 160; w--) {
        Object.assign(p.style, { boxSizing: 'content-box', width: `${w}px`, marginLeft: `calc(100% - ${w}px - ${pr})` });
        const edge = p.getBoundingClientRect().left + w;
        if ([...p.querySelectorAll('.ask-cite')].some((a) => edge - a.getBoundingClientRect().right < 0.5)) return w;
      }
      return 0;
    });
    expect(flush).toBeGreaterThan(0);
    const over = await page.evaluate(() => [document.scrollingElement, document.getElementById('panel-scroll')]
      .filter(Boolean).map((el) => el.scrollWidth - el.clientWidth));
    expect(over.every((x) => x <= 0)).toBe(true);
  });
});
