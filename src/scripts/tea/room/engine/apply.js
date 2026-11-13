// The only writer to the stage, the slots, the set pieces' elements, the screens and the index's mark (2.5). It
// writes the frame frame() worked out, every value on every frame, on or off: a group's `hidden`, a flat's and a
// port's transform, opacity and `hidden`, a slot's place or OFF, a piece's values or its rest. It may skip a write
// that would repeat the last one, and it does nothing else by memory. Every number is written rounded (px to a
// hundredth, scales to a hundred-thousandth), so state() reads back exactly what was written.
// bind() finds the elements once for a layout; place() writes what a layout fixes (rest rects, sizes, fills).

const px = (v) => Math.round(v * 100) / 100;
const sc = (v) => Math.round(v * 1e5) / 1e5;
const tf = (tx, ty, k) => `translate(${px(tx)}px, ${px(ty)}px) scale(${sc(k)})`;

// The skip-a-repeat memory: the last string written to each element's property. Writes only; never read to decide
// a value.
const last = new WeakMap();
function put(el, prop, value) {
  if (!el) return;
  let m = last.get(el);
  if (!m) last.set(el, (m = {}));
  if (m[prop] === value) return;
  m[prop] = value;
  if (prop === 'hidden') el.hidden = value;
  else if (prop.startsWith('--')) el.style.setProperty(prop, value);
  else if (prop.startsWith('data-') || prop.startsWith('aria-')) value === null ? el.removeAttribute(prop) : el.setAttribute(prop, value);
  else if (prop === 'src') el.src = value;
  else el.style[prop] = value;
}
export const forget = (el) => last.delete(el);

const flatsIn = (root) => {
  const out = [];
  for (const el of root.querySelectorAll(':scope > .room-flat[data-i]')) out[+el.dataset.i] = el;
  return out;
};
const portsIn = (root) => {
  const out = [];
  for (const el of root.querySelectorAll(':scope > .room-port')) out[+el.dataset.port] = el;
  return out;
};

// Every element the engine writes, for the composition in use.
export function bind(doc, L) {
  const comp = (g) => g.querySelector(`:scope > .room-comp[data-comp="${L.comp}"]`);
  const scenes = {};
  for (const key of L.sceneKeys) {
    const groups = [...doc.querySelectorAll(`.room-group[data-scene="${key}"]`)];
    const comps = groups.map(comp);
    const flats = [];
    const ports = [];
    let under = null;
    for (const c of comps) {
      flatsIn(c).forEach((el, i) => { if (el) flats[i] = el; });
      portsIn(c).forEach((el, j) => {
        if (!el) return;
        const inner = el.querySelector(':scope > .room-port-in');
        const deep = portsIn(inner).map((p) => p && { el: p, inner: p.querySelector(':scope > .room-port-in'), still: p.querySelector('.room-port-still') });
        ports[j] = { el, inner, flats: flatsIn(inner), deep };
      });
      under ||= c.querySelector(':scope > .room-under');
    }
    scenes[key] = { groups, flats, ports, under };
  }
  const slots = L.slots.map((k) => doc.querySelector(`[data-room-chapter="${L.chapters[k.chapter].id}"] [data-room-slot="${k.name}"]`));
  const pieces = L.chapters.map((c) => Object.fromEntries(Object.keys(c.rest).map((el) =>
    [el, doc.querySelector(`[data-room-chapter="${c.id}"] [data-room-piece="${el}"]`)])));
  const screen = (s) => {
    const el = doc.querySelector(`.room-screen[data-screen="${s}"]`);
    return { el, shadow: el?.querySelector('.room-screen-shadow'), plate: el?.querySelector('.room-screen-plate') };
  };
  return {
    scenes, slots, pieces, screens: { l: screen('l'), r: screen('r') },
    index: doc.querySelector('[data-room-index]'), links: [...doc.querySelectorAll('[data-room-link]')],
    nows: [...doc.querySelectorAll('[data-room-now]')], canvas: doc.querySelector('.room-ambient'),
  };
}

const rect = (el, r) => {
  if (!el) return;
  put(el, 'left', `${px(r.x)}px`); put(el, 'top', `${px(r.y)}px`);
  put(el, 'width', `${px(r.w)}px`); put(el, 'height', `${px(r.h)}px`);
};
const portRest = (p) => p.hole ?? p.door;

// What a layout fixes: every flat at its rest rect, every port at its clip's rest rect, the fills, the slots' base
// sizes, the screens' size and place, the ambient canvas.
export function place(page, L) {
  for (const key of L.sceneKeys) {
    const S = L.scenes[key], E = page.scenes[key];
    S.flats.forEach((f, i) => {
      rect(E.flats[i], f.rest);
      if (f.fill && E.flats[i]) put(E.flats[i], 'background', f.fill);
    });
    const back = S.flats.findIndex((f) => f.r >= 1 && !f.through);
    if (E.under && back >= 0) rect(E.under, S.flats[back].rest);
    S.ports.forEach((p, j) => {
      const e = E.ports[j];
      if (!e) return;
      rect(e.el, portRest(p));
      const T = L.scenes[p.to];
      if (!T) return;
      T.flats.forEach((g, i) => {
        rect(e.flats[i], g.rest);
        if (g.fill && e.flats[i]) put(e.flats[i], 'background', g.fill);
      });
      T.ports.forEach((q, i) => { if (e.deep[i]) rect(e.deep[i].el, portRest(q)); });
    });
  }
  page.slots.forEach((el, i) => { if (el) { put(el, 'width', `${px(L.slots[i].rest.w)}px`); put(el, 'height', `${px(L.slots[i].rest.h)}px`); } });
  const w = 0.52 * L.vw, h = 1.16 * L.vh;
  for (const [s, x] of [['l', 0], ['r', L.vw - w]]) {
    const e = page.screens[s].el;
    if (!e) continue;
    put(e, 'width', `${px(w)}px`); put(e, 'height', `${px(h)}px`); put(e, 'left', `${px(x)}px`);
  }
  if (page.canvas) {
    const dpr = Math.min(2, devicePixelRatio || 1);
    page.canvas.width = Math.round(L.vw * dpr); page.canvas.height = Math.round(L.vh * dpr);
    put(page.canvas, 'width', `${L.vw}px`); put(page.canvas, 'height', `${L.vh}px`);
  }
}

function flat(el, v) {
  if (!el) return;
  put(el, 'transform', tf(v.tx, v.ty, v.k));
  put(el, 'opacity', String(Math.round(v.o * 1000) / 1000));
  put(el, 'hidden', !v.shown);
}

// A port: its element maps its clip's rest rect onto the clip; the element inside it maps the scene behind (in
// window px) onto the screen: screen = (x, y) + k * point. Two transforms, no layout.
function port(e, v, R0) {
  if (!e?.el) return;
  const shown = v.shown && v.clip && v.clip.w > 0 && R0.w > 0;
  put(e.el, 'hidden', !shown);
  if (!shown) return;
  const kc = v.clip.w / R0.w;
  put(e.el, 'transform', tf(v.clip.x - R0.x, v.clip.y - R0.y, kc));
  put(e.el, 'opacity', String(Math.round(v.o * 1000) / 1000));
  put(e.inner, 'transform', tf((v.x - v.clip.x) / kc, (v.y - v.clip.y) / kc, v.k / kc));
}

export function apply(f, page, L) {
  for (const g of f.groups) for (const el of page.scenes[g.key].groups) put(el, 'hidden', g.hidden);
  const S = L.scenes[f.on], E = page.scenes[f.on];
  f.flats.forEach((v, i) => flat(E.flats[i], v));
  const back = S.flats.findIndex((g) => g.r >= 1 && !g.through);
  if (E.under && back >= 0) flat(E.under, f.flats[back]);
  f.ports.forEach((v, j) => {
    const e = E.ports[j];
    if (!e) return;
    port(e, v, portRest(S.ports[j]));
    if (!v.shown) return;
    v.inner.flats.forEach((g, i) => flat(e.flats[i], g));
    const T = L.scenes[S.ports[j].to];
    v.inner.ports.forEach((q, i) => {
      const d = e.deep[i];
      if (!d) return;
      port(d, q, portRest(T.ports[i]));
      if (q.still && d.still) {
        rect(d.still, q.still);
      }
    });
  });
  f.slots.forEach((v, i) => {
    const el = page.slots[i];
    if (!el) return;
    if (v.on) {
      put(el, 'transform', tf(v.x, v.y, v.w / L.slots[i].rest.w));
      put(el, 'opacity', String(Math.round(v.o * 1000) / 1000));
      put(el, 'pointerEvents', 'auto'); put(el, 'data-off', null);
    } else {
      put(el, 'opacity', '0'); put(el, 'pointerEvents', 'none'); put(el, 'data-off', '');
    }
  });
  f.pieces.forEach((p, i) => {
    const els = page.pieces[i];
    for (const [el, props] of Object.entries(p.values)) {
      for (const [prop, v] of Object.entries(props)) {
        if (typeof v === 'number') put(els[el], `--${prop}`, String(Math.round(v * 1e4) / 1e4));
        else put(els[el], `data-${prop}`, v);
      }
    }
  });
  screens(f.screens, page.screens, L);
  index(f.index, page);
}

function screens(s, E, L) {
  const open = s.shut <= 0;
  for (const [side, x, local] of [['l', s.left, s.shadow?.lx], ['r', s.right, s.shadow?.rx]]) {
    const e = E[side];
    if (!e.el) continue;
    put(e.el, 'data-open', open ? '' : null);
    put(e.el, 'transform', `translateX(${px(x)}px)`);
    put(e.el, 'backgroundColor', s.field);
    if (s.shadow) {
      put(e.shadow, 'src', new URL(s.shadow.src, location.href).href);
      put(e.shadow, 'transform', `translate(${px(local - s.shadow.w)}px, ${px(s.shadow.y - s.shadow.h)}px) scale(${sc((3 * s.shadow.w) / 100)}, ${sc((3 * s.shadow.h) / 100)})`);
    }
    put(e.shadow, 'hidden', !s.shadow);
  }
}

function index(ix, page) {
  put(page.index, 'data-on', ix.id);
  for (const a of page.links) put(a, 'aria-current', a.dataset.roomLink === ix.id ? 'true' : null);
  for (const n of page.nows) put(n, 'data-current', n.dataset.roomNow === ix.id ? '' : null);
}

// The frame as written, read back from the page (window.__room.state()): what each element holds, never what the
// engine meant to write. Loading and what a video does are not part of it.
export function readBack(page, L, on) {
  const tfOf = (el) => (el ? { t: el.style.transform, o: el.style.opacity, shown: !el.hidden } : null);
  const E = page.scenes[on];
  return {
    on,
    groups: L.sceneKeys.map((k) => [k, ...page.scenes[k].groups.map((g) => g.hidden)]),
    flats: E.flats.map(tfOf),
    // a hidden port's contents are not written while it is hidden, so they are not part of the state
    ports: E.ports.map((p) => p && (p.el.hidden ? { shown: false } : { ...tfOf(p.el), inner: p.inner.style.transform,
      flats: p.flats.map(tfOf), deep: p.deep.map((d) => d && (d.el.hidden ? { shown: false } : { ...tfOf(d.el), inner: d.inner.style.transform })) })),
    slots: page.slots.map((el) => el && { off: el.hasAttribute('data-off'), t: el.style.transform, o: el.style.opacity }),
    pieces: page.pieces.map((els) => Object.fromEntries(Object.entries(els).map(([k, el]) => [k, el ? el.getAttribute('style') : null]))),
    screens: ['l', 'r'].map((s) => {
      const e = page.screens[s];
      return { shown: !e.el.hasAttribute('data-open'), t: e.el.style.transform, field: e.el.style.backgroundColor,
        shadow: e.shadow.hidden ? null : { src: e.shadow.getAttribute('src'), t: e.shadow.style.transform } };
    }),
    index: page.index?.dataset.on ?? null,
  };
}
