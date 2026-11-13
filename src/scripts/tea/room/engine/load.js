// Plates, as they come near (2.9). A scene's pictures are fetched when the reader is within one and a half chapters
// of it: its still first (the picture under its back plate while the rest come), then every plate, its ports'
// plates and stills included, each decoded off the main thread; when the last has decoded, every flat gets its
// picture in one frame. Loading changes which picture an element holds, never where it is or whether it is shown.
// A scene more than two chapters away gives its pictures back. The screens' plate comes straight after first paint.
const img = (src) => new Promise((done) => {
  const i = new Image();
  i.decoding = 'async';
  i.src = src;
  i.decode().then(() => done(true), () => done(false));
});

export function loader(doc, onReady) {
  const state = new Map(); // scene key -> 'loading' | 'ready'
  const plates = (groups) => groups.flatMap((g) => [...g.querySelectorAll('img[data-src], img.room-flat[src], img.room-port-still')]);
  const urlOf = (el) => el.dataset.src ?? el.getAttribute('src');

  async function want(key, groups) {
    if (state.get(key)) return;
    state.set(key, 'loading');
    const els = plates(groups);
    const under = els.filter((el) => el.classList.contains('room-under'));
    await Promise.all(under.map((el) => img(urlOf(el))));
    for (const el of under) if (!el.getAttribute('src')) el.src = urlOf(el);
    await Promise.all(els.map((el) => img(urlOf(el))));
    if (state.get(key) !== 'loading') return;
    requestAnimationFrame(() => {
      for (const el of els) if (el.getAttribute('src') !== urlOf(el)) el.src = urlOf(el);
      state.set(key, 'ready');
      onReady(key);
    });
  }

  function giveBack(key, groups) {
    if (!state.get(key)) return;
    state.delete(key);
    for (const el of plates(groups)) if (el.dataset.src) el.removeAttribute('src');
  }

  // Called on every frame with the chapter index the frame is in: near scenes load, far ones give their pictures
  // back. L.chapters[i].parts name each chapter's scenes.
  function near(i, L, page) {
    L.chapters.forEach((c, j) => {
      const d = Math.abs(j - i);
      for (const p of c.parts) {
        const groups = page.scenes[p.key]?.groups ?? [];
        if (d <= 1.5) want(p.key, groups);
        else if (d > 2) giveBack(p.key, groups);
      }
    });
  }

  function shared() {
    for (const el of doc.querySelectorAll('.room-screen-plate[data-src]')) if (!el.getAttribute('src')) el.src = el.dataset.src;
  }

  // Every picture the frame shows has decoded, for painting too (an <img decoding="async"> may be complete and not
  // yet painted): the scene that is on, what its ports hold, the screens and the shadow. An element's picture is
  // asked to decode once for each address it holds; until that answers, the frame is not settled.
  const painted = new WeakMap(); // img -> the address whose decode() has answered, or { src } while it is asked
  let before = new Set();         // the pictures shown at the last ask: one that was not is asked again (a picture
  // under display: none may have been dropped by the browser, and is decoded again before it is painted)
  function decoded(key, page) {
    if (state.get(key) !== 'ready') return false;
    const E = page.scenes[key];
    const shown = (el) => el && !el.closest('[hidden]') && el.offsetParent !== null;
    const imgs = [...E.groups.flatMap((g) => [...g.querySelectorAll('img')]),
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

  return { near, shared, decoded, ready: (key) => state.get(key) === 'ready' };
}
