// The ledger's search box and Ask Goobie (src/scripts/search/, src/scripts/post/highlight.js): "/" focuses it and
// nothing loads before it is focused; Pagefind's words come fast, with heading-anchored excerpts; its index holds the
// listed posts and their notes and nothing else; the meaning half (/api/search) joins without a session and fails
// silently; a result opens its post with the passage marked; Ask keeps the box's words, selected, loads Turnstile only
// once opened and switched on, asks once at a time, links its [n] (a notes passage on the notes page), numbered by post
// with each link's card naming its passage, and shows related posts; { ask: false } hides the switch. /api/* answers
// come from fixtures/api.json; Turnstile is a stub. search-*.
import fs from 'node:fs';
import matter from 'gray-matter';
import { isLive } from '../../src/data/exempt.js';
import { test, expect } from './fixtures.mjs';

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
    await page.route('**/api/ask', async (route) => {   // slow enough to see the pending state
      await new Promise((r) => setTimeout(r, 700));
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

  // Aaron's two answers of 2026-11-01 (D1 ask_cache), word for word, the first with a cite of another post (a run with a
  // space in it) and one of a notes page added: [4][5], [4], [5] and [1] are all passages of one post.
  const ANSWERS = [{
    answer: "Aaron's post on long AI films is closest. MiniMax-H3 makes six seconds a go [4][5]. Saved latents chain clips [4]. " +
      'Films ran 13 minutes [5]. Free memory before every clip [1]. A script folded the paper puppet [7] [2]. ' +
      'Only a screenshot caught the black cards [9].',
    cites: [
      { n: 1, slug: 'every-ai-film-so-far', kind: 'post', anchor: 'what-held-across-all-of-it', heading: 'What held across all of it', title: 'Making long AI films' },
      { n: 2, slug: 'paper-jefrie', kind: 'post', anchor: '', heading: '', title: 'Paper' },
      { n: 4, slug: 'every-ai-film-so-far', kind: 'post', anchor: 'how-the-chaining-works', heading: 'How the chaining works', title: 'Making long AI films' },
      { n: 5, slug: 'every-ai-film-so-far', kind: 'post', anchor: '', heading: '', title: 'Making long AI films' },
      { n: 7, slug: 'paper-jefrie', kind: 'post', anchor: 'where-the-idea-came-from', heading: 'Where the idea came from', title: 'Paper' },
      { n: 9, slug: 'characters-in-inscryption', kind: 'notes', anchor: 'how-to-play-it', heading: 'How to play it', title: 'My characters in Inscryption: the making-of notes' }],
    related: ['every-ai-film-so-far', 'paper-jefrie', 'ai-rigging-vs-a-script'], cached: true,
    reads: "Aaron's post on long AI films is closest. MiniMax-H3 makes six seconds a go [1]. Saved latents chain clips [1]. " +
      'Films ran 13 minutes [1]. Free memory before every clip [1]. A script folded the paper puppet [2]. ' +
      'Only a screenshot caught the black cards [3].',
    links: [
      ['[1]', 'every-ai-film-so-far', '', 'how-the-chaining-works', 'How the chaining works'],
      ['[1]', 'every-ai-film-so-far', '', 'how-the-chaining-works', 'How the chaining works'],
      ['[1]', 'every-ai-film-so-far', '', '', 'the opening'],
      ['[1]', 'every-ai-film-so-far', '', 'what-held-across-all-of-it', 'What held across all of it'],
      ['[2]', 'paper-jefrie', '', 'where-the-idea-came-from', 'Where the idea came from'],
      ['[3]', 'characters-in-inscryption', 'notes/', 'how-to-play-it', 'How to play it, in the full making-of']],
  }, {
    answer: 'Closest is the paper Jefrie post [4]. Rigging tools lost to a script [5]. Start with [4] then [5].',
    cites: [
      { n: 4, slug: 'paper-jefrie', kind: 'post', anchor: 'where-the-idea-came-from', heading: 'Where the idea came from', title: 'Paper' },
      { n: 5, slug: 'ai-rigging-vs-a-script', kind: 'post', anchor: '', heading: '', title: 'Rigging' }],
    related: ['paper-jefrie', 'ai-rigging-vs-a-script', 'every-ai-film-so-far'], cached: true,
    reads: 'Closest is the paper Jefrie post [1]. Rigging tools lost to a script [2]. Start with [1] then [2].',
    links: [
      ['[1]', 'paper-jefrie', '', 'where-the-idea-came-from', 'Where the idea came from'],
      ['[2]', 'ai-rigging-vs-a-script', '', '', 'the opening'],
      ['[1]', 'paper-jefrie', '', 'where-the-idea-came-from', 'Where the idea came from'],
      ['[2]', 'ai-rigging-vs-a-script', '', '', 'the opening']],
  }];

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
      // Any other link's card is as it was: no line.
      await page.locator('.ask-related .row-link').first().hover();
      await expect(card.locator('.lp-title')).toHaveText(posts[reply.related[0]].title);
      await expect(card.locator('.lp-line')).toBeHidden();
      await page.mouse.move(5, 5);
      await expect(card).not.toHaveClass(/lp-on/);
    }
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
