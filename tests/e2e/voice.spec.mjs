// Ask by voice (src/scripts/search/hear.js): the microphone beside the Ask box shows only while Ask is open, switched
// on ({ voice: true }) and the browser can record; hear.js loads on its first press; a press records (Chromium's fake
// microphone), shows the recording state, the seconds and the line that the audio is thrown away; a second press, or
// 30 s, sends it once to POST /api/ask/hear with the Ask token, and the text that comes back goes in the box and is
// asked through /api/ask like typed words. Recording needs Chromium's fake devices (the desktop project's launch
// options in playwright.config.mjs), so those run on desktop only.
// /api/* answers come from fixtures/api.json; Turnstile is a stub. voice-*.
import fs from 'node:fs';
import { test, expect } from './fixtures.mjs';

const SHAPES = JSON.parse(fs.readFileSync(new URL('./fixtures/api.json', import.meta.url), 'utf8'));
const HEARD = SHAPES['hear-200'].json.text;
const TURNSTILE = `(() => {
  let opts = null;
  const solve = () => setTimeout(() => opts.callback('XXXX.DUMMY.TOKEN.XXXX'), 30);
  window.turnstile = { render(el, o) { opts = o; solve(); return 'w1'; }, reset() { solve(); } };
  window[new URL(document.currentScript.src).searchParams.get('onload')]();
})();`;

const mic = (page) => page.locator('[data-mic]');
const input = (page) => page.locator('.search-input');
const openAsk = async (page) => {
  await expect(page.locator('[data-search][data-ready]')).toHaveCount(1);
  await page.locator('[data-mode="ask"]').click();
  await expect(page.locator('[data-mode="ask"]')).toHaveAttribute('aria-pressed', 'true');
};

// Every /api/ request as "POST /api/ask/hear", with its headers and body; and whether hear.js has loaded.
async function watch(page, context) {
  await context.route('https://challenges.cloudflare.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: TURNSTILE }));
  const seen = { api: [], sent: [], hearJs: false };
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (/\/hear\.[\w-]+\.js$/.test(u.pathname)) seen.hearJs = true;
    if (!u.pathname.startsWith('/api/')) return;
    seen.api.push(`${r.method()} ${u.pathname}`);
    if (r.method() === 'POST') seen.sent.push({ path: u.pathname, headers: r.headers(), body: r.postDataBuffer() });
  });
  return seen;
}

test.describe('recording', () => {
  test.beforeEach(({ browserName }) => test.skip(browserName !== 'chromium', "Chromium's fake microphone"));

  test('voice-1 the microphone shows once Ask opens, records with a timer, and what it hears is asked', async ({ page, context }) => {
    const seen = await watch(page, context);
    await page.goto('/ledger/');
    await expect(page.locator('[data-search][data-ready]')).toHaveCount(1);
    await expect(mic(page)).toBeHidden();
    await openAsk(page);
    await expect(mic(page)).toBeVisible();
    await expect(mic(page)).toHaveAttribute('aria-label', 'Ask by voice');
    await expect(page.locator('[data-voice-line]')).toBeHidden();
    expect(seen.hearJs).toBe(false);

    await mic(page).click();
    await expect(mic(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(mic(page)).toHaveAttribute('aria-label', 'Stop recording');
    await expect(page.locator('[data-voice-line]')).toHaveText('Your recording is turned into text, then thrown away. 30 seconds at most.');
    await expect(page.locator('[data-mic-time]')).toHaveText('0:01', { timeout: 5_000 });
    expect(seen.hearJs).toBe(true);
    await mic(page).click();

    await expect(input(page)).toHaveValue(HEARD);
    await expect(page.locator('.ask-text')).toBeVisible();
    await expect(mic(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-voice-line]')).toBeHidden();
    const hear = seen.sent.filter((s) => s.path === '/api/ask/hear');
    expect(hear).toHaveLength(1);
    expect(hear[0].headers['content-type']).toMatch(/^audio\/webm/);
    expect(hear[0].headers['x-ao-session']).toBe(SHAPES['session-mint'].json.token);
    expect(hear[0].body.length).toBeGreaterThan(1000);
    const asked = seen.sent.filter((s) => s.path === '/api/ask');
    expect(asked.map((s) => JSON.parse(s.body.toString()))).toEqual([{ q: HEARD }]);
    expect(seen.api.indexOf('POST /api/ask/hear')).toBeLessThan(seen.api.indexOf('POST /api/ask'));

    // Back to Search: the microphone goes.
    await page.locator('[data-mode="search"]').click();
    await expect(mic(page)).toBeHidden();
  });

  test('voice-2 a recording stops on its own at 30 seconds and is sent', async ({ page, context }) => {
    const seen = await watch(page, context);
    await page.clock.install();
    await page.goto('/ledger/');
    await openAsk(page);
    await mic(page).click();
    await expect(mic(page)).toHaveAttribute('aria-pressed', 'true');
    await page.clock.fastForward(29_000);
    await expect(mic(page)).toHaveAttribute('aria-pressed', 'true');
    await page.clock.fastForward(1_500);
    await expect(input(page)).toHaveValue(HEARD);
    expect(seen.sent.filter((s) => s.path === '/api/ask/hear')).toHaveLength(1);
  });

  for (const [shape, line] of [['hear-empty', 'RAG Goobie didn’t catch that. Try again, or type it.'],
    ['hear-429', 'RAG Goobie has had a lot of questions this minute. Try again shortly.']]) {
    test.describe(shape, () => {
      test.use({ api: { '/api/ask/hear': shape } });
      test(`voice-3 ${shape}: one line, nothing asked, and the microphone works again`, async ({ page, context }) => {
        const seen = await watch(page, context);
        await page.goto('/ledger/');
        await openAsk(page);
        await mic(page).click();
        await expect(mic(page)).toHaveAttribute('aria-pressed', 'true');
        await mic(page).click();
        await expect(page.locator('.ask-note')).toHaveText(line);
        await expect(mic(page)).toBeEnabled();
        await expect(mic(page)).toHaveAttribute('aria-pressed', 'false');
        expect(seen.api).not.toContain('POST /api/ask');
      });
    });
  }
});

test('voice-4 no microphone where the browser has no MediaRecorder', async ({ page, context }) => {
  await watch(page, context);
  await page.addInitScript(() => { delete window.MediaRecorder; });
  await page.goto('/ledger/');
  await openAsk(page);
  await expect(page.locator('.search-go')).toBeVisible();
  await expect(mic(page)).toBeHidden();
});

test.describe('voice switched off', () => {
  test.use({ api: { '/api/session': 'session-novoice' } });
  test('voice-5 { voice: false } leaves Ask typed only', async ({ page, context }) => {
    await watch(page, context);
    await page.goto('/ledger/');
    await openAsk(page);
    await expect(page.locator('.search-go')).toBeVisible();
    await expect(mic(page)).toBeHidden();
  });
});
