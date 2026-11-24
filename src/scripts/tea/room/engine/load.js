// Plates, as they come near (2.9). A scene's pictures are fetched when the reader is within one and a half chapters
// of it, for the composition in use only (a desktop never fetches the phone's plates; a turn of the device fetches
// the other's when it is needed), and the scene on screen first: its still, then its plates, then its neighbours'.
// Each is decoded off the main thread; when the last has decoded, every flat gets its picture in one frame. Until
// then a flat holds BLANK (a picture of nothing) and the picture under the back plate holds the still's inlined
// preview, then the still: so a scene that is on before its plates have come shows its room, never the night
// ground, and never a broken box. A picture that fails is never given to its element: its scene stays as it was
// and is asked for again after a wait that doubles (2 s to 32 s), and at once when the browser is back online.
// Loading changes which picture an element holds, never where it is or whether it is shown. A scene more than two
// chapters away gives its pictures back. The screens' plate comes straight after first paint.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const img = (src) => new Promise((done) => {
  const i = new Image();
  i.decoding = 'async';
  i.src = src;
  i.decode().then(() => done(true), () => done(false));
});

export function loader(doc, onReady) {
  const state = new Map(); // `${scene}|${comp}` -> { s: 'loading' | 'ready' | 'failed', tries, at }
  const first = new WeakMap(); // an element -> what it held in the markup (BLANK, or the still's preview)
  const plates = (groups, comp) => groups.flatMap((g) => [...g.querySelectorAll(`:scope > .room-comp[data-comp="${comp}"] img[data-src]`)]);
  const has = (el) => el.getAttribute('src') === el.dataset.src;
  const keep = (el) => { if (!first.has(el)) first.set(el, el.getAttribute('src') ?? BLANK); };
  let online = 0; // bumped when the browser comes back online: every failed scene is asked again at once
  addEventListener('online', () => { online++; onReady(null); });

  // Fetches one scene's pictures for one composition. Resolves when its still has come (or failed), so the next
  // scene waits for it: the one on screen goes first.
  function want(key, comp, groups) {
    const id = `${key}|${comp}`;
    const st = state.get(id);
    if (st && (st.s !== 'failed' || (performance.now() < st.at && st.online === online))) return Promise.resolve();
    const tries = (st?.tries ?? 0) + 1;
    const me = { s: 'loading', tries };
    state.set(id, me);
    const els = plates(groups, comp);
    els.forEach(keep);
    const under = els.filter((el) => el.classList.contains('room-under'));
    const stillCame = Promise.all(under.map(async (el) => { if (!has(el) && (await img(el.dataset.src)) && state.get(id) === me) el.src = el.dataset.src; }));
    stillCame.then(() => Promise.all(els.map((el) => img(el.dataset.src)))).then((ok) => {
      if (state.get(id) !== me) return;
      if (!ok.every(Boolean)) {
        state.set(id, { s: 'failed', tries, online, at: performance.now() + Math.min(32_000, 1000 * 2 ** tries) });
        setTimeout(() => onReady(null), Math.min(32_000, 1000 * 2 ** tries) + 50);
        return;
      }
      requestAnimationFrame(() => {
        if (state.get(id) !== me) return;
        for (const el of els) if (!has(el)) el.src = el.dataset.src;
        me.s = 'ready';
        onReady(key);
      });
    });
    return stillCame;
  }

  function giveBack(key, comp, groups) {
    const id = `${key}|${comp}`;
    if (!state.has(id)) return;
    state.delete(id);
    for (const el of plates(groups, comp)) if (first.has(el) && el.getAttribute('src') !== first.get(el)) el.src = first.get(el);
  }

  // Called on every frame with the chapter index the frame is in and the scene that is on: near scenes load (that
  // one first, then the rest by distance), far ones give their pictures back, in every composition.
  function near(i, on, L, page) {
    const groupsOf = (key) => page.scenes[key]?.groups ?? [];
    const wanted = [];
    L.chapters.forEach((c, j) => {
      const d = Math.abs(j - i);
      for (const p of c.parts) {
        if (d <= 1.5) wanted.push([p.key === on ? -1 : d, p.key]);
        else if (d > 2) for (const comp of ['d', 'p']) giveBack(p.key, comp, groupsOf(p.key));
      }
    });
    wanted.sort((a, b) => a[0] - b[0]);
    const [[, head], ...rest] = wanted;
    const go = want(head, L.comp, groupsOf(head));
    go.then(() => { for (const [, k] of rest) want(k, L.comp, groupsOf(k)); });
  }

  // the screens' plate: the painter's upright one on a frame narrower than three fifths of its height (a phone)
  function shared() {
    const upright = matchMedia('(max-aspect-ratio: 3/5)').matches;
    for (const el of doc.querySelectorAll('.room-screen-plate[data-src]')) {
      const src = upright && el.dataset.srcP ? el.dataset.srcP : el.dataset.src;
      if (el.getAttribute('src') !== src) el.src = src;
    }
  }

  const ready = (key, comp) => state.get(`${key}|${comp}`)?.s === 'ready';

  // Every picture the frame shows has decoded, for painting too (an <img decoding="async"> may be complete and not
  // yet painted): the scene that is on, what its ports hold, the screens and the shadow. An element's picture is
  // asked to decode once for each address it holds; until that answers, the frame is not settled.
  const painted = new WeakMap(); // img -> the address whose decode() has answered, or { src } while it is asked
  let before = new Set();         // the pictures shown at the last ask: one that was not is asked again (a picture
  // under display: none may have been dropped by the browser, and is decoded again before it is painted)
  function decoded(key, comp, page) {
    if (!ready(key, comp)) return false;
    const E = page.scenes[key];
    const shown = (el) => el && !el.closest('[hidden]') && el.offsetParent !== null;
    const imgs = [...E.groups.flatMap((g) => [...g.querySelectorAll(`:scope > .room-comp[data-comp="${comp}"] img`)]),
      ...['l', 'r'].flatMap((s) => [page.screens[s].plate, page.screens[s].shadow])].filter(shown);
    const now = new Set(imgs);
    let all = true;
    for (const el of imgs) {
      if (!el.getAttribute('src')) { all = false; continue; }
      const src = el.currentSrc || el.src;
      if (!before.has(el) && painted.get(el) === src) painted.delete(el);
      const got = painted.get(el);
      if (got === src) continue;
      all = false;
      if (got?.src !== src) {
        const p = { src };
        painted.set(el, p);
        el.decode().catch(() => {}).then(() => { if (painted.get(el) === p) painted.set(el, src); });
      }
    }
    before = now;
    return all;
  }

  return { near, shared, decoded, ready, failed: (key, comp) => state.get(`${key}|${comp}`)?.s === 'failed' };
}
