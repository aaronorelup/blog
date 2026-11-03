// <ao-listen>: a set of clips with one player: a clip row picks and plays, A/B switches to the reference at the same
// moment and back, the spectrogram seeks (click and arrows), and keys drive the list.
import { test, expect } from '../fixtures.mjs';
import { openFirst, pagesWith, expectPlaying, playing, clock, seekTo, contentChanges } from '../helpers.mjs';

// The first set whose every clip runs 4 s or more, so none ends under a test (many are one-line sound bites), among
// the sets the element has built (a single clip stays a plain figure, with no list).
let at = null;
const listen = (page) => page.locator('ao-listen').nth(at.i);
const current = (page) => listen(page).locator('.ao-listen-list button[aria-current="true"] b');
// The audio of the clip the element shows, found by its title.
const audioOf = (page, title) => listen(page).locator('figure').filter({ has: page.locator('figcaption b', { hasText: title }) }).locator('audio').first();
const ready = (page) => listen(page).evaluate((el) => Promise.all([...el.querySelectorAll('audio')].map((a) => {
  a.muted = true; a.preload = 'metadata';
  return a.readyState ? 0 : new Promise((r) => { a.addEventListener('loadedmetadata', r, { once: true }); a.load(); });
})));

// Click the spectrogram of the playing clip a and, in the 'seeked' handler of that seek, press Pause with the clip
// reporting no data ahead (readyState 2, HAVE_CURRENT_DATA), as WebKit's does when a seek on a slow network ends
// before the data after it has come (a phone with media delayed 150-400 ms, about one seek in six); with replay, a
// play() right after it, as WebKit's comes 3-5 ms later. Resolves whether the clip was playing, done seeking, as
// Pause was pressed.
const pauseAtSeekedWithoutData = async (page, a, replay) => {
  await a.evaluate((m, replay) => {
    m._pausedAtSeeked = new Promise((r) => m.addEventListener('seeked', () => {
      const real = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'readyState').get;
      Object.defineProperty(m, 'readyState', { configurable: true, get: () => Math.min(real.call(m), m.HAVE_CURRENT_DATA) });
      const was = !m.paused && !m.seeking;
      m.closest('ao-listen').querySelector('.ao-listen-bar button').click();
      delete m.readyState;
      if (replay) m.play().catch(() => {});
      r(was);
    }, { once: true }));
  }, replay);
  const spec = listen(page).locator('.ao-listen-spec');
  const box = await spec.boundingBox();
  await spec.click({ position: { x: box.width * 0.15, y: box.height / 2 } });
  return a.evaluate((m) => m._pausedAtSeeked);
};

test.beforeEach(async ({ page }) => {
  const urls = at ? [at.url] : pagesWith('ao-listen');
  const i = await openFirst(page, urls, (p) => p.locator('ao-listen').evaluateAll((els) => {
    // WebKit on Linux reports a duration of 0 for some 10-30 s clips when a page loads many at once (on a busy box,
    // a long set in about one page load in two, origin/main's build too), and a reload doesn't mend it: such a clip
    // is measured from its decoded bytes.
    const ctx = new AudioContext();
    const decoded = (a) => fetch(a.currentSrc).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((d) => d.duration);
    const length = (a) => (a.readyState ? Promise.resolve(a.duration) : new Promise((r) => {
      a.addEventListener('loadedmetadata', () => r(a.duration), { once: true }); a.preload = 'metadata'; a.load();
    })).then((d) => (d > 0 ? d : decoded(a)));
    const shortest = (el) => (el.querySelector('.ao-listen-list')
      ? Promise.all([...el.querySelectorAll('audio')].map(length)).then((d) => Math.min(...d)) : 0);
    return Promise.all(els.map(shortest)).then((mins) => mins.findIndex((d) => d >= 4));
  }));
  at = { url: page.url(), i };
  await listen(page).scrollIntoViewIfNeeded();
  await ready(page);
});

test('listen-1 a clip row selects that clip and plays it', async ({ page }) => {
  const rows = listen(page).locator('.ao-listen-list button');
  await rows.nth(1).click();
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true');
  const title = await current(page).textContent();
  await expect(listen(page).locator('.ao-listen-now b')).toHaveText(title);
  await expectPlaying(audioOf(page, title));
  await expect(listen(page).locator('.ao-listen-bar button').first()).toHaveText('Pause');
  await seekTo(audioOf(page, title), 2);
  await expect(listen(page).locator('.ao-listen-clock')).toHaveText(/^0:0[2-9] \/ \d+:\d\d$/);
  await listen(page).locator('.ao-listen-bar button').first().click();
  await expectPlaying(audioOf(page, title), false);
  await expect(listen(page).locator('.ao-listen-bar button').first()).toHaveText('Play');
});

// WebKit's player plays a clip again once a seek that began while it played is done, even after pause(): listen-1
// on the phone caught it on a loaded box, a Pause pressed mid-seek and the clip going on. Here the seek is certain
// to be running when Pause is pressed, and the play that WebKit makes when it ends is a script's play().
test('listen-1b a Pause pressed while a seek is still running holds once the seek is done', async ({ page }) => {
  const rows = listen(page).locator('.ao-listen-list button');
  await rows.nth(1).click();
  const title = (await current(page).textContent()).trim();
  await expectPlaying(audioOf(page, title));
  // In one task: the seek, Pause while it is still seeking, then the play.
  const seeking = await listen(page).evaluate((el, t) => {
    const a = [...el.querySelectorAll('figure')].find((f) => f.querySelector('figcaption b')?.textContent.trim() === t).querySelector('audio');
    a.currentTime = 2;
    const was = a.seeking;
    el.querySelector('.ao-listen-bar button').click();
    a.play().catch(() => {});
    return was;
  }, title);
  expect(seeking).toBe(true);
  // Read the frame after the seek is done (a clip left playing would still be playing then, 18 s from its end).
  const paused = await audioOf(page, title).evaluate((a) => new Promise((r) => {
    const read = () => requestAnimationFrame(() => r(a.paused));
    if (a.seeking) a.addEventListener('seeked', read, { once: true }); else read();
  }));
  expect(paused).toBe(true);
  await expect(listen(page).locator('.ao-listen-bar button').first()).toHaveText('Play');
  // And a Pause pressed as a spectrogram seek made while playing ends, before the clip has data to play, with WebKit's
  // play of it just after.
  await listen(page).locator('.ao-listen-bar button').first().click();
  await expectPlaying(audioOf(page, title));
  expect(await pauseAtSeekedWithoutData(page, audioOf(page, title), true)).toBe(true);
  expect(await audioOf(page, title).evaluate((a) => new Promise((r) => requestAnimationFrame(() => r(a.paused))))).toBe(true);
  await expect(listen(page).locator('.ao-listen-bar button').first()).toHaveText('Play');
});

// The hold ends: a play the element didn't make, once WebKit's own would have come, is the reader's (a media key,
// the lock screen, headphones) and plays. Three Pauses of the clip picked before it is under way: as its 'playing'
// is fired, mid-seek (the one that holds), after a seek while paused, Play and Pause in one task, and as a seek made
// while playing ends with no data yet to play (held too).
test('listen-1c a play from outside the page after a held Pause plays', async ({ page }) => {
  const rows = listen(page).locator('.ao-listen-list button');
  const title = (await rows.nth(1).locator('b').textContent()).trim();
  const a = audioOf(page, title);
  const pause = listen(page).locator('.ao-listen-bar button').first();
  const playsAfter = async () => {
    // A second after any seek is done, WebKit's play (if it came) has been held, and the clip is still paused.
    expect(await a.evaluate((m) => new Promise((r) => {
      const later = () => setTimeout(() => r(m.paused), 1000);
      if (m.seeking) m.addEventListener('seeked', later, { once: true }); else later();
    }))).toBe(true);
    await a.evaluate((m) => { m.play().catch(() => {}); });
    await expectPlaying(a);
    await expect(pause).toHaveText('Pause');
  };
  const started = await listen(page).evaluate((el, t) => new Promise((r) => {
    const m = [...el.querySelectorAll('figure')].find((f) => f.querySelector('figcaption b')?.textContent.trim() === t).querySelector('audio');
    m.addEventListener('playing', () => {
      const paused = m.paused;
      el.querySelector('.ao-listen-bar button').click();
      r(paused);
    }, { once: true });
    [...el.querySelectorAll('.ao-listen-list button')][1].click();
  }), title);
  expect(started).toBe(false);
  await playsAfter();
  const seeking = await a.evaluate((m) => {
    m.currentTime = 2;
    const was = m.seeking;
    m.closest('ao-listen').querySelector('.ao-listen-bar button').click();
    return was;
  });
  expect(seeking).toBe(true);
  await playsAfter();
  // And one pressed before the clip is under way, after a seek while paused: Play and Pause in one task.
  await pause.click();
  await expectPlaying(a, false);
  const waiting = await a.evaluate((m) => new Promise((r) => {
    m.currentTime = 1;
    m.addEventListener('seeked', () => {
      const bar = m.closest('ao-listen').querySelector('.ao-listen-bar button');
      bar.click();
      const was = !m.paused;
      bar.click();
      r(was);
    }, { once: true });
  }));
  expect(waiting).toBe(true);
  await playsAfter();
  // And one pressed as a spectrogram seek made while playing ends, before the clip has data to play.
  expect(await pauseAtSeekedWithoutData(page, a, false)).toBe(true);
  await playsAfter();
});

test('listen-2 A/B switches to the reference at the same moment, and back', async ({ page }) => {
  const rows = listen(page).locator('.ao-listen-list button');
  const ab = listen(page).locator('.ao-listen-bar button').nth(1);
  // Start on a clip that isn't the reference.
  for (let i = 0; i < await rows.count(); i++) {
    await rows.nth(i).click();
    if (!(await ab.isDisabled())) break;
  }
  const first = await current(page).textContent();
  const a = audioOf(page, first);
  await expectPlaying(a);
  // A moment well into the clip, set rather than waited for: WebKit on Linux can hold a playing clip's clock still.
  await seekTo(a, 2);
  await expect.poll(() => clock(a)).toBeGreaterThan(1.9);
  await ab.click();
  await expect(ab).toHaveAttribute('aria-pressed', 'true');
  const refTitle = await current(page).textContent();
  expect(refTitle).not.toBe(first);
  const ref = audioOf(page, refTitle);
  await expectPlaying(ref);
  // The clip left stays paused, past the moment WebKit plays a clip paused before it was under way (as its seek ends,
  // which can be a second after the click, or at once).
  expect(await a.evaluate((m) => new Promise((r) => {
    const later = () => setTimeout(() => r(!m.paused && !m.ended), 500);
    if (m.seeking) m.addEventListener('seeked', later, { once: true }); else later();
  }))).toBe(false);
  // The reference picks up where the clip was (it would be near 0 from the start).
  const [ta, tr, end] = [await clock(a), await clock(ref), await ref.evaluate((m) => m.duration)];
  expect(tr).toBeGreaterThan(Math.min(ta, end) - 0.2);
  expect(tr - ta).toBeLessThan(3);
  await ab.click();
  await expect(current(page)).toHaveText(first);
  await expect(ab).toHaveAttribute('aria-pressed', 'false');
});

// Only the clip picked plays: a play of the clip A/B or a row left is never the element's (WebKit's player makes one
// when it was paused before it was under way, as late as its own seek's end, a second on), so it is paused at once
// while the clip picked plays on. Here that play is a script's play() of the clip left, soon after the click and
// well after it.
for (const via of ['A/B', 'a row']) {
  test(`listen-2b a play of the clip ${via} left is paused at once, and the clip picked plays on`, async ({ page }) => {
    const rows = listen(page).locator('.ao-listen-list button');
    const ab = listen(page).locator('.ao-listen-bar button').nth(1);
    for (let i = 0; i < await rows.count(); i++) {
      await rows.nth(i).click();
      if (!(await ab.isDisabled())) break;
    }
    for (const after of [100, 700]) {
      const first = (await current(page).textContent()).trim();
      await expectPlaying(audioOf(page, first));
      // In the page: the click, then the clip left's play() `after` ms on; read it a moment after its 'play'.
      const left = await listen(page).evaluate((el, [via, after]) => new Promise((r) => {
        const rows = [...el.querySelectorAll('.ao-listen-list button')];
        const k = rows.findIndex((b) => b.getAttribute('aria-current') === 'true');
        const m = [...el.querySelectorAll(':scope > figure')].filter((f) => f.querySelector('audio'))[k].querySelector('audio');
        if (via === 'A/B') el.querySelectorAll('.ao-listen-bar button')[1].click(); else rows[(k + 1) % rows.length].click();
        setTimeout(() => {
          let played = false;
          m.addEventListener('play', () => { played = true; }, { once: true });
          m.play().catch(() => {});
          setTimeout(() => r({ played, paused: m.paused }), 250);
        }, after);
      }), [via, after]);
      expect(left).toEqual({ played: true, paused: true });
      const now = (await current(page).textContent()).trim();
      expect(now).not.toBe(first);
      await expectPlaying(audioOf(page, now));
      await expect(listen(page).locator('.ao-listen-bar button').first()).toHaveText('Pause');
      expect(await audioOf(page, first).evaluate((m) => m.paused)).toBe(true);
      // A/B back, for the next round to leave the clip it started on again.
      if (via === 'A/B') await ab.click();
    }
  });
}

test('listen-3 the spectrogram seeks on click and with the arrow keys', async ({ page }) => {
  const spec = listen(page).locator('.ao-listen-spec');
  const box = await spec.boundingBox();
  await spec.click({ position: { x: box.width * 0.5, y: box.height / 2 } });
  await expect.poll(() => spec.getAttribute('aria-valuenow').then(Number)).toBeGreaterThan(40);
  const a = audioOf(page, await current(page).textContent());
  const t = await clock(a);
  await spec.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => clock(a)).toBeGreaterThan(t + 0.3);
});

test('listen-4 with the list focused: arrows pick a clip and keep playing, space toggles, C flips A/B', async ({ page }) => {
  const list = listen(page).locator('.ao-listen-list');
  const rows = list.locator('button');
  const ab = listen(page).locator('.ao-listen-bar button').nth(1);
  await list.focus();
  await page.keyboard.press('ArrowDown');
  await expect(rows.nth(1)).toHaveAttribute('aria-current', 'true');
  const a = audioOf(page, await current(page).textContent());
  await expectPlaying(a);
  await page.keyboard.press(' ');
  await expectPlaying(a, false);
  await page.keyboard.press(' ');
  await expectPlaying(a);
  const pressed = await ab.getAttribute('aria-pressed');
  if (await ab.isDisabled()) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('c');
  await expect(ab).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('C');
  await expect(ab).toHaveAttribute('aria-pressed', pressed);
});

// While a clip plays the element redraws its playhead and clock every frame, never the Play/Pause button: on WebKit a
// tap on a button whose text node is replaced between its press and its release fires no click (the label rewritten
// each frame lost 11 of 450 Pause clicks on the phone). Pausing still changes it.
test('listen-5 the Play/Pause button is never rewritten while a clip plays; pausing changes it', async ({ page }) => {
  const btn = listen(page).locator('.ao-listen-bar button').first();
  await listen(page).locator('.ao-listen-list button').nth(1).click();
  const a = audioOf(page, (await current(page).textContent()).trim());
  await expectPlaying(a);
  await expect(btn).toHaveText('Pause');
  expect(await contentChanges(btn, 1000)).toEqual({ nodes: 0, text: 0 });
  expect(await playing(a)).toBe(true);
  const changes = contentChanges(btn, 1000);
  await btn.click();
  await expect(btn).toHaveText('Play');
  const { nodes, text } = await changes;
  expect(nodes + text).toBeGreaterThan(0);
});
