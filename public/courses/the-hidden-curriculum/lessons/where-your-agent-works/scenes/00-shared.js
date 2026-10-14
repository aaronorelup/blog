/* 01.02 Where your agent works — shared drawing (window.M)
   The lesson's one metaphor: ONE WORKER, YOUR HOUSE OF ROOMS, AND THE VENDOR'S BUILDING ACROSS TOWN.
     - the MODEL is one WORKER: a gold sparkle tile (M.worker) who can stand in any room;
     - YOUR COMPUTER is a HOUSE (M.house): a warm card with a roof, SHELVES along the top inside wall
       (Documents, Projects, Photos, Finances: Finances has a terracotta ring = never connected) and
       three ROOMS: the front COUNTER (Chat, behind a dashed glass partition), the back OFFICE (Cowork,
       desk and in-tray) and the WORKSHOP (Code, a bench with a terminal and code tiles);
       door pills Chat / Cowork / Code fuse into one 'Claude' door (merge);
     - the HATCH is a small square in the house's right wall (the brand's square element); it glows only
       while "desktop app open" is true, and M.hatchLine runs the gold path through it;
     - the ROAD (M.road) runs across town to the VENDOR'S BUILDING (M.vendor): cooler, greyer, cloud and
       server on its roof; it gains the back office, a spare workshop and a logbook;
     - anything that crosses the road is a dashed COPY (M.copy, M.bundle), never the original;
     - dated source cards (M.dated), "as of" pills, "where the picture breaks" tags, pointer chips to
       other lessons, toggles, the credit line and the keep-this rows are shared too.
   Every scene draws these with the functions below so they look identical across the lesson.

   Only functions and constants: no SCENE() calls. Pure functions of their arguments (no Date.now, no
   Math.random, no state between frames). K.ctx() is read on every call because the runtime swaps canvases.
   Colours: gold (C.head) = the worker, lit rooms, the hatch path, copies in transit; cream (C.strong) = text
   to read; terracotta (C.accent) = never connected, stale, failures, "where the picture breaks";
   C.soft grey = dimmed, the vendor's own fittings. Pink is never used here (title and end card petals only). */
(function () {
  'use strict';
  const K = window.K, C = K.C;
  const G = () => K.ctx();
  const clamp01 = (v) => K.clamp(+v || 0);
  const pick = (v, d) => (v == null ? d : v);

  // ---------------------------------------------------------------- palette
  const P = {
    house: K.mixColor(C.tile, C.head, 0.05),         // your house: warm
    houseEdge: K.mixColor(C.line2, C.head, 0.25),
    roof: K.mixColor(C.tile, C.head, 0.12),
    room: K.mixColor(C.page, C.tile, 0.55),
    wall: K.mixColor(C.line2, C.head, 0.18),
    wood: K.mixColor(C.tile, C.head, 0.22),           // counter, desk, bench
    woodTop: K.mixColor(C.line2, C.head, 0.55),
    shelf: K.mixColor(C.line2, C.head, 0.35),
    vendor: K.mixColor(C.tile, '#5C6688', 0.07),     // the vendor's building: cooler, greyer than your house
    vendorEdge: K.mixColor(C.line2, '#8F9AC4', 0.12),
    vendorRoom: K.mixColor(C.page, '#5C6688', 0.05),
    road: K.rgba(C.line2, 0.35),
    lit: C.head, never: C.accent, dim: C.soft, text: C.strong, label: C.body,
  };
  const T = {
    label: { font: 'ui', weight: 600, size: 26 },
    labelBig: { font: 'ui', weight: 600, size: 30 },
    mono: { font: 'mono', weight: 600, size: 26 },
    eyebrow: { font: 'ui', weight: 600, size: 24, tracking: 3, upper: true },
    read: { font: 'read', size: 30 },
  };
  const ASOF = 'as of 2026-10-14 · moves monthly';

  // ---------------------------------------------------------------- layout (1920x1080; safe x 80-1840, y 130-930)
  // The wide street, in canvas pixels at scale 1 (storyboard numbers). M.street maps all of it with one {x, y, s}.
  const L = {
    safe: { x0: 80, y0: 130, x1: 1840, y1: 930 },
    house: { x: 110, y: 250, w: 940, h: 600 },        // card; roof apex 100 px above
    road: { x0: 1050, x1: 1840, y: 860 },
    vendor: { x: 1360, y: 230, w: 460, h: 620 },
    // inside the house (local px, origin = house card top-left)
    shelfBand: 130,                                     // shelves y 0-130, rooms below
    walls: [310, 620],
    floor: 590,
    rooms: { chat: [0, 310], cowork: [310, 620], code: [620, 940] },
    doorY: 548,
    shelfNames: ['Documents', 'Projects', 'Photos', 'Finances'],
    hatch: { x: 922, y: 170, w: 36, h: 80 },
    guest: { x: 940, y: 330, w: 170, h: 260 },         // WSL annex, grows out of the right wall beside the workshop
    // inside the vendor building (local)
    vslots: { cowork: [28, 54, 404, 250], code: [28, 322, 404, 226] },
    vlog: [230, 586],
  };

  // ---------------------------------------------------------------- small helpers
  const xf = (o) => {
    const x = pick(o.x, 0), y = pick(o.y, 0), s = pick(o.s, 1);
    return { x, y, s, at: (lx, ly) => [x + lx * s, y + ly * s], len: (v) => v * s };
  };
  function label(s, x, y, o = {}) {
    return K.text(s, x, y, { ...T.label, color: o.color || P.label, align: o.align || 'center', alpha: o.alpha, size: o.size || 26, weight: o.weight || 600, italic: o.italic, font: o.font || 'ui' });
  }
  /** pill whose LEFT edge is at x (K.pill is centred); same options as K.pill; returns its width */
  function pillL(s, x, y, o = {}) {
    const size = o.size || 26;
    const to = { size, font: o.font || 'ui', weight: o.weight || 600, tracking: o.tracking, upper: o.upper };
    const is = o.icon ? size * 1.05 : 0, gap = o.icon ? size * 0.4 : 0;
    const w = Math.max(K.measure(s, to) + is + gap + size * 1.6, o.w || 0);
    const al = o.align || 'left', x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
    K.pill(s, x0 + w / 2, y, o);
    return w;
  }
  /** point at progress k (0..1, by length) along a polyline [[x, y], ...] */
  function along(pts, k) {
    k = clamp01(k);
    const seg = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let L0 = tot * k;
    for (let i = 0; i < seg.length; i++) {
      if (L0 <= seg[i] || i === seg.length - 1) { const f = seg[i] ? K.clamp(L0 / seg[i]) : 1; return [K.lerp(pts[i][0], pts[i + 1][0], f), K.lerp(pts[i][1], pts[i + 1][1], f)]; }
      L0 -= seg[i];
    }
    return pts[pts.length - 1].slice();
  }
  /** rounded-rect outline that draws itself (k 0..1), starting top-left, clockwise */
  function outline(x, y, w, h, r, k, o = {}) {
    k = clamp01(k); if (k <= 0) return;
    if (k >= 1) {
      const g = G(); g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha; if (o.dash) g.setLineDash(o.dash);
      g.lineWidth = o.w || 2; g.strokeStyle = o.color || C.line2; K.rr(x, y, w, h, r); g.stroke(); g.restore(); return;
    }
    const pts = [[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r], [x + r, y]];
    K.path(pts, { k, head: false, tension: 0, color: o.color || C.line2, w: o.w || 2, dash: o.dash, alpha: o.alpha });
  }
  /** a dashed rounded rect (a copy, an empty slot) */
  function dashedRR(x, y, w, h, r, o = {}) {
    const g = G(); g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.fill) { K.rr(x, y, w, h, r); g.fillStyle = o.fill; g.fill(); }
    g.setLineDash(o.dash || [10, 8]); g.lineWidth = o.w || 2.5; g.strokeStyle = o.color || C.head; K.rr(x, y, w, h, r); g.stroke(); g.restore();
  }

  // ---------------------------------------------------------------- the worker (the model)
  /** the one worker, centred at (x, y). o: {s 96, alpha, dim 0..1 (greys out), glow 0..1, bob (default true),
   *  walk 0..1 (a stepping sway while it travels), tag (label under it), badge (pill above it: 'new model',
   *  'skips approvals'), badgeColor, shadow (default true)}; returns {x, y, top, bottom} */
  function worker(t, x, y, o = {}) {
    const s = o.s || 96, a = clamp01(pick(o.alpha, 1)), dim = clamp01(o.dim);
    const geo = { x, y, top: y - s / 2, bottom: y + s / 2 };
    if (a <= 0.002) return geo;
    const walk = clamp01(o.walk);
    const bob = (o.bob === false ? 0 : K.wave(t, 2.2, s * 0.03)) + walk * Math.abs(K.wave(t, 9, s * 0.06));
    const rot = walk * K.wave(t, 9, 0.06, 0.4);
    const g = G();
    K.layer(a, () => {
      if (o.shadow !== false) { g.save(); g.beginPath(); g.ellipse(x, y + s * 0.6, s * 0.36 * (1 - bob / s), s * 0.07, 0, 0, 7); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill(); g.restore(); }
      const col = K.mixColor(C.head, C.soft, dim);
      const gl = clamp01(o.glow) * (1 - dim);
      if (gl > 0) K.glow(x, y - bob, s * 1.3, C.head, 0.22 * gl);
      K.at(x, y - bob, 1, rot, () => {
        K.iconTile('sparkle', 0, 0, s, { color: col, glow: gl * 0.8, stroke: K.mixColor(K.mixColor(C.line2, C.head, 0.45), C.line2, dim), fill: K.mixColor(C.tile, C.page, dim * 0.4) });
      });
      if (o.badge) K.pill(o.badge, x, y - bob - s / 2 - 30, { size: 26, color: o.badgeColor || C.page, fill: o.badgeColor ? C.tile : C.head, stroke: o.badgeColor || C.head });
      if (o.tag) label(o.tag, x, y + s / 2 + 52, { color: dim > 0.5 ? C.soft : P.label });
    });
    return geo;
  }

  // ---------------------------------------------------------------- a room (shared by the house and the vendor)
  /** one room's interior, in its own box (current transform). kind 'chat' | 'cowork' | 'code'.
   *  o: {lit 0..1 (0.8), alpha, dashed (outline only: a copy), door (pill text at the bottom, e.g. 'Cowork'),
   *  fill, gear (an angle: a turning gear top-right = still working), tray (files in the in-tray, default 2),
   *  sign (default true: the room's icon at the top)}. Returns anchors in the same space:
   *  {spot (where the worker stands), sign, furniture, tray, bench, door} */
  function room(kind, x, y, w, h, o = {}) {
    const a = clamp01(pick(o.alpha, 1)), lit = clamp01(pick(o.lit, 0.8));
    const cx = x + w / 2, fy = y + h * (o.door ? 0.6 : 0.64);
    const geo = { spot: [cx, y + h * (o.door ? 0.36 : 0.4)], sign: [cx, y + 46], furniture: [cx, fy], tray: [x + w * 0.8, fy - 34], bench: [cx, fy], door: [cx, y + h - 34] };
    if (a <= 0.002) return geo;
    const g = G();
    K.layer(a, () => {
      if (o.dashed) { dashedRR(x, y, w, h, 16, { fill: K.rgba(C.head, 0.05) }); }
      else {
        g.save(); K.rr(x, y, w, h, 16); g.fillStyle = o.fill || P.room; g.fill(); g.clip();
        if (lit > 0) {
          const gr = g.createRadialGradient(cx, y + h * 0.3, 10, cx, y + h * 0.3, Math.max(w, h) * 0.75);
          gr.addColorStop(0, K.rgba(C.head, 0.16 * lit)); gr.addColorStop(1, K.rgba(C.head, 0));
          g.fillStyle = gr; g.fillRect(x, y, w, h);
        }
        g.restore();
      }
      const ink = K.mixColor(C.soft, C.head, lit), ca = 0.35 + 0.65 * lit;
      const icon = kind === 'chat' ? 'chat' : kind === 'cowork' ? 'clock' : 'terminal';
      if (o.sign !== false) K.icon(icon, geo.sign[0], geo.sign[1], 44, { color: ink, alpha: ca, w: 2.6 });
      // furniture: a counter, a desk or a bench, seen front-on
      const fw = w * (kind === 'code' ? 0.8 : 0.72), fx = cx - fw / 2, th = 20;
      K.layer(ca, () => {
        if (o.dashed) { dashedRR(fx, fy, fw, th, 6, { color: C.head, alpha: 0.9 }); }
        else {
          g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
          K.rr(fx, fy, fw, th, 6); g.fillStyle = P.wood; g.fill(); g.restore();
          K.line(fx + 6, fy + 1, fx + fw - 6, fy + 1, { color: P.woodTop, w: 3 });
        }
        if (kind === 'chat') {           // counter front panel + two stools
          if (!o.dashed) { g.save(); K.rr(fx + 10, fy + th, fw - 20, h * 0.1, 4); g.fillStyle = K.mixColor(P.room, P.wood, 0.5); g.fill(); g.restore(); }
          for (const sx of [cx - fw * 0.22, cx + fw * 0.22]) { g.save(); g.beginPath(); g.ellipse(sx, fy + th + h * 0.1 + 18, 18, 7, 0, 0, 7); g.strokeStyle = ink; g.lineWidth = 2.5; g.stroke(); g.restore(); }
        } else if (kind === 'cowork') {  // desk legs + an in-tray of files
          K.line(fx + 16, fy + th, fx + 16, fy + th + h * 0.12, { color: P.woodTop, w: 4 });
          K.line(fx + fw - 16, fy + th, fx + fw - 16, fy + th + h * 0.12, { color: P.woodTop, w: 4 });
          const [tx, ty] = geo.tray, n = pick(o.tray, 2);
          for (let i = 0; i < n; i++) K.file(tx - 4 + i * 6, ty - 6 - i * 7, 40, { alpha: 0.95 });
          g.save(); K.rr(tx - 30, ty + 10, 60, 14, 4); g.fillStyle = P.woodTop; g.fill(); g.restore();
        } else {                          // bench legs + terminal and code tiles on it
          K.line(fx + 20, fy + th, fx + 10, fy + th + h * 0.12, { color: P.woodTop, w: 5 });
          K.line(fx + fw - 20, fy + th, fx + fw - 10, fy + th + h * 0.12, { color: P.woodTop, w: 5 });
          const ts = Math.min(52, w * 0.15);
          K.iconTile('terminal', cx - fw * 0.28, fy - ts / 2 - 4, ts, { color: ink, r: 8 });
          K.iconTile('code', cx + fw * 0.28, fy - ts / 2 - 4, ts, { color: K.mixColor(C.soft, C.accent, lit), r: 8 });
        }
      });
      if (o.gear != null) K.at(x + w - 34, y + 34, 1, o.gear, () => K.icon('gear', 0, 0, 40, { color: C.head, w: 2.6 }));
      if (o.door) K.pill(o.door, geo.door[0], geo.door[1], { size: o.doorSize || 26, color: lit > 0.5 ? C.strong : C.body, stroke: lit > 0.5 ? K.mixColor(C.line2, C.head, 0.6) : C.line2 });
    });
    return geo;
  }

  // ---------------------------------------------------------------- your house (your computer)
  /** your computer as a house of rooms. o: {x, y, s (house card top-left in canvas px; default the wide street's
   *  110, 250, 1), alpha, k (build 0..1: outline and roof draw, then fills), shelves (0..1 staggered fill),
   *  rooms {chat, cowork, code} (lit 0..1 each; a number sets all three; default 0.8), office (1 = the back
   *  office is home, 0 = moved: an empty dashed slot), glass (0..1 the counter's dashed partition), reach (0..1 the
   *  workshop's dotted reach arrow up to Projects), merge (0..1 three door pills fuse into one 'Claude' door),
   *  doors (default true), hatch (0..1 open/glow), workFolder (0..1 a fifth folder 'Claude-work' joins the
   *  shelves), shelfFocus (a folder name: the others dim), shelfAlpha {name: alpha}, guest (0..1 the WSL annex
   *  grows on the left wall), front (0..1 an opaque front wall over the rooms), walls (0..1 the inside walls,
   *  drawn over the front wall), dark (0..1 lights out: laptop closed), title (eyebrow, default 'YOUR COMPUTER')}.
   *  Returns canvas-space anchors: {x, y, s, w, h, at(lx, ly), roofTop, rooms: {chat|cowork|code: {x, y, w, h, cx,
   *  cy, spot, door, sign, tray, bench}}, folders: {name: {x, y}}, hatch: {x, y, w, h, cx, cy}, door (the merged
   *  door), guest: {x, y, w, h, cx, cy}} */
  function house(t, o = {}) {
    const m = xf({ x: pick(o.x, L.house.x), y: pick(o.y, L.house.y), s: o.s });
    const W = L.house.w, H = L.house.h, a = clamp01(pick(o.alpha, 1)), k = clamp01(pick(o.k, 1));
    const lits = typeof o.rooms === 'number' ? { chat: o.rooms, cowork: o.rooms, code: o.rooms } : { chat: 0.8, cowork: 0.8, code: 0.8, ...(o.rooms || {}) };
    const office = clamp01(pick(o.office, 1)), merge = clamp01(o.merge), wf = clamp01(o.workFolder);
    const fill = K.clamp((k - 0.45) / 0.55);
    // folder slots: 4, or 5 once the dedicated folder joins (it slides in between Projects and Photos)
    const names = wf > 0 ? ['Documents', 'Projects', 'Claude-work', 'Photos', 'Finances'] : L.shelfNames;
    const xs4 = [130, 360, 590, 820], xs5 = [110, 290, 470, 650, 830];
    const fx = (n) => {
      if (wf <= 0) return xs4[L.shelfNames.indexOf(n)];
      const i5 = names.indexOf(n), i4 = L.shelfNames.indexOf(n);
      return i4 < 0 ? xs5[i5] : K.lerp(xs4[i4], xs5[i5], K.ease.io(wf));
    };
    const roomBox = (n) => { const [x0, x1] = L.rooms[n]; return [x0 + 10, L.shelfBand + 4, x1 - x0 - 20, L.floor - L.shelfBand - 4]; };
    // text stays >= 26 px on screen: labels are drawn at 26 / s locally, and hidden below s 0.6 (o.labels: false hides
    // them at any size, true forces them)
    const showLabels = o.labels === true || (o.labels !== false && m.s >= 0.6), ls = 26 / Math.min(1, m.s);
    const geo = { x: m.x, y: m.y, s: m.s, w: W * m.s, h: H * m.s, at: m.at, roofTop: m.at(W / 2, -100), rooms: {}, folders: {} };
    for (const n of ['chat', 'cowork', 'code']) {
      const [rx, ry, rw, rh] = roomBox(n), cx = rx + rw / 2;
      const p = (lx, ly) => m.at(lx, ly);
      geo.rooms[n] = { x: p(rx, ry)[0], y: p(rx, ry)[1], w: rw * m.s, h: rh * m.s, cx: p(cx, 0)[0], cy: p(0, ry + rh / 2)[1],
        spot: p(cx, ry + rh * 0.4), door: p(cx, L.doorY), sign: p(cx, ry + 46), tray: p(rx + rw * 0.8, ry + rh * 0.64 - 34), bench: p(cx, ry + rh * 0.64) };
    }
    names.forEach((n) => { geo.folders[n] = { x: m.at(fx(n), 48)[0], y: m.at(0, 48)[1] }; });
    const hb = L.hatch; geo.hatch = { x: m.at(hb.x, 0)[0], y: m.at(0, hb.y)[1], w: hb.w * m.s, h: hb.h * m.s, cx: m.at(hb.x + hb.w / 2, 0)[0], cy: m.at(0, hb.y + hb.h / 2)[1] };
    geo.door = { x: m.at(W / 2, 0)[0], y: m.at(0, L.doorY)[1] };
    const gb = L.guest; geo.guest = { x: m.at(gb.x, 0)[0], y: m.at(0, gb.y)[1], w: gb.w * m.s, h: gb.h * m.s, cx: m.at(gb.x + gb.w / 2, 0)[0], cy: m.at(0, gb.y + gb.h / 2)[1] };
    if (a <= 0.002) return geo;
    const g = G();
    K.layer(a, () => K.at(m.x, m.y, m.s, 0, () => {
      // WSL annex (a guest room growing out of the right wall, beside the workshop)
      const gk = clamp01(o.guest);
      if (gk > 0) {
        const gw = gb.w * K.ease.out(gk), ac = K.mixColor(C.line2, C.head, 0.5);
        K.card(gb.x - 30, gb.y, gw + 30, gb.h, { r: 18, fill: P.room, stroke: ac });
        g.save(); g.globalAlpha *= gk; g.beginPath(); g.moveTo(gb.x - 6, gb.y - 44); g.lineTo(gb.x + gw + 10, gb.y + 4); g.lineTo(gb.x - 6, gb.y + 4); g.closePath();
        g.fillStyle = P.roof; g.fill(); g.lineWidth = 3; g.strokeStyle = ac; g.lineJoin = 'round'; g.stroke(); g.restore();
        K.icon('terminal', gb.x + gw / 2, gb.y + gb.h * 0.45, 56, { color: C.head, alpha: gk, w: 2.6 });
      }
      // body + roof
      K.layer(fill, () => {
        K.card(0, 0, W, H, { r: 24, fill: P.house, stroke: false });
        g.save(); g.beginPath(); g.moveTo(-14, 4); g.lineTo(W / 2, -100); g.lineTo(W + 14, 4); g.closePath(); g.fillStyle = P.roof; g.fill(); g.restore();
      });
      outline(0, 0, W, H, 24, k / 0.7, { color: P.houseEdge, w: 2.5 });
      K.path([[-14, 4], [W / 2, -100], [W + 14, 4]], { k: K.clamp(k / 0.5), head: false, tension: 0, color: P.houseEdge, w: 3 });
      if (showLabels) K.eyebrow(o.title || 'YOUR COMPUTER', W / 2, -38, { ...T.eyebrow, size: 24 / Math.min(1, m.s), color: C.head, align: 'center', alpha: fill });
      if (fill <= 0) return;
      K.layer(fill, () => {
        // shelves: plank + folders
        K.line(18, 118, W - 18, 118, { color: P.shelf, w: 4 });
        const focus = o.shelfFocus, fa = o.shelfAlpha || {};
        names.forEach((n, i) => {
          const sk = n === 'Claude-work' ? K.ease.out(K.clamp(wf * 1.6 - 0.6)) : K.ease.out(K.clamp(pick(o.shelves, 1) * 4.2 - i * 0.8));
          const al = sk * pick(fa[n], focus && focus !== n ? 0.28 : 1);
          if (al <= 0.002) return;
          const x0 = fx(n);
          K.layer(al, () => {
            K.folder(x0, 48 + (1 - sk) * 10, 70, { name: showLabels && !(wf > 0 && focus && focus !== n) ? n : null, nameSize: ls, color: n === 'Claude-work' ? C.head : undefined });
            if (n === 'Finances') outline(x0 - 84, 2, 168, 112, 14, 1, { color: P.never, w: 2.5 });
          });
        });
        // rooms
        for (const n of ['chat', 'cowork', 'code']) {
          const [rx, ry, rw, rh] = roomBox(n);
          if (n === 'cowork' && office < 1) {
            dashedRR(rx, ry, rw, rh, 16, { color: C.line2, alpha: 1 - office * 0.5, fill: K.rgba(C.page, 0.35) });
            room(n, rx, ry, rw, rh, { lit: lits[n], alpha: office });
          } else room(n, rx, ry, rw, rh, { lit: lits[n] });
        }
        // the counter's glass partition (no file access)
        const gl = clamp01(o.glass);
        if (gl > 0) {
          const [rx, ry, rw] = roomBox('chat');
          K.line(rx + 14, ry + 8, rx + rw - 14, ry + 8, { k: gl, color: C.body, w: 3, dash: [12, 9], alpha: 0.85 });
          K.layer(gl * 0.5, () => { g.save(); g.fillStyle = K.rgba(C.body, 0.06); g.fillRect(rx + 14, ry + 2, rw - 28, 14); g.restore(); });
        }
        // the workshop's reach, up to Projects
        const rk = clamp01(o.reach);
        if (rk > 0) {
          const px = fx('Projects'), bx = L.rooms.code[0] + 90;
          K.path([[bx, L.floor - 200], [bx - 20, 172], [px + 70, 152], [px, 128]], { k: rk, color: C.head, w: 5, dash: [2, 13], headSize: 18, tension: 0.35 });
        }
        // front wall (05) and inside walls
        const fr = clamp01(o.front);
        if (fr > 0) { g.save(); g.globalAlpha *= fr; K.rr(4, L.shelfBand, W - 8, L.floor - L.shelfBand + 6, 12); g.fillStyle = P.house; g.fill(); g.restore(); }
        const wk = o.walls == null ? 1 : clamp01(o.walls);
        for (const wx of L.walls) K.line(wx, L.shelfBand, wx, L.floor + 6, { k: wk, color: P.wall, w: 3, alpha: fr > 0 ? 0.85 : 1 });
        K.line(10, L.shelfBand, W - 10, L.shelfBand, { color: P.wall, w: 2, alpha: 0.6 });
        // doors: three pills, or one merged 'Claude' door
        if (o.doors !== false) {
          const mk = K.ease.io(merge);
          [['chat', 'Chat'], ['cowork', 'Cowork'], ['code', 'Code']].forEach(([n, s]) => {
            const [rx, , rw] = roomBox(n), dx = K.lerp(rx + rw / 2, W / 2, mk), al = 1 - K.clamp((merge - 0.45) / 0.2);
            if (al > 0.002 && !(n === 'cowork' && office <= 0)) K.pill(showLabels ? s : '', dx, L.doorY, { size: 26, w: showLabels ? 0 : 90, alpha: al * (n === 'cowork' ? Math.max(office, merge > 0 ? 1 : 0) : 1), color: lits[n] > 0.5 ? C.strong : C.body, stroke: lits[n] > 0.5 ? K.mixColor(C.line2, C.head, 0.6) : C.line2 });
          });
          const ma = K.clamp((merge - 0.5) / 0.2);
          if (ma > 0) K.pill(showLabels ? 'Claude' : '', W / 2, L.doorY, { size: Math.max(30, 26 / Math.min(1, m.s)), w: 300, alpha: ma, color: C.page, fill: C.head, stroke: C.head, glow: 0.6 * ma });
        }
        // the hatch (square, the brand's one square element)
        const hk = clamp01(o.hatch);
        if (hk > 0) K.glow(hb.x + hb.w / 2, hb.y + hb.h / 2, 90, C.head, 0.3 * hk);
        K.card(hb.x, hb.y, hb.w, hb.h, { r: 4, fill: K.mixColor(C.page, C.head, 0.75 * hk), stroke: K.mixColor(C.line2, C.head, 0.4 + 0.6 * hk), shadow: false, lw: 2.5 });
      });
      // lights out
      const dk = clamp01(o.dark);
      if (dk > 0) { g.save(); g.globalAlpha *= dk * 0.62; K.rr(-2, -2, W + 4, H + 4, 24); g.fillStyle = C.page; g.fill(); g.restore(); }
    }));
    return geo;
  }

  // ---------------------------------------------------------------- the road
  /** the road across town. o: {x0, x1, y (default the wide street's 1050-1840 at 860), k (draw progress),
   *  alpha, label (default 'across town'; false hides it), labelX} */
  function road(t, o = {}) {
    const x0 = pick(o.x0, L.road.x0), x1 = pick(o.x1, L.road.x1), y = pick(o.y, L.road.y), k = clamp01(pick(o.k, 1)), a = clamp01(pick(o.alpha, 1));
    if (a <= 0.002 || k <= 0) return { x0, x1, y };
    const g = G();
    K.layer(a, () => {
      g.save(); g.fillStyle = P.road; g.fillRect(x0, y - 14, (x1 - x0) * k, 28); g.restore();
      K.line(x0, y - 14, x1, y - 14, { k, color: C.line2, w: 1.5 });
      K.line(x0, y + 14, x1, y + 14, { k, color: C.line2, w: 1.5 });
      K.line(x0 + 10, y, x1 - 10, y, { k, color: K.mixColor(C.line2, C.head, 0.25), w: 3, dash: [14, 12] });
      if (o.label !== false) label(o.label || 'across town', pick(o.labelX, (x0 + x1) / 2), y + 52, { color: C.soft, alpha: K.clamp(k * 2 - 1), weight: 400, italic: true });
    });
    return { x0, x1, y };
  }

  // ---------------------------------------------------------------- the vendor's building
  /** the vendor's building across town (its words stay >= 26 px on screen, like the house's). o: {x, y, s (card top-left; default 1360, 230, 1), alpha, k (build 0..1),
   *  name (eyebrow, default "ANTHROPIC'S SERVERS"), roofIcons (default ['cloud', 'server']), office (0..1 the back
   *  office in its top slot), officeLit, spare (0..1 the spare workshop, bottom slot), spareLit, gear (an angle:
   *  the spare workshop's gear keeps turning), logbook (0..1), logGlow (0..1), slots (0..1 empty slots shown dashed),
   *  doors (default true: room labels 'Cowork' / 'cloud session'), labels (as M.house: hidden below s 0.6)}. Returns canvas anchors: {x, y, w, h, at,
   *  office: {x, y, w, h, cx, cy, spot}, spare: {...}, logbook: {x, y}, roof: {x, y}} */
  function vendor(t, o = {}) {
    const m = xf({ x: pick(o.x, L.vendor.x), y: pick(o.y, L.vendor.y), s: o.s });
    const W = L.vendor.w, H = L.vendor.h, a = clamp01(pick(o.alpha, 1)), k = clamp01(pick(o.k, 1));
    const slot = (n) => { const [sx, sy, sw, sh] = L.vslots[n], p = m.at(sx, sy); return { x: p[0], y: p[1], w: sw * m.s, h: sh * m.s, cx: p[0] + sw * m.s / 2, cy: p[1] + sh * m.s / 2, spot: m.at(sx + sw / 2, sy + sh * 0.47) }; };
    const geo = { x: m.x, y: m.y, w: W * m.s, h: H * m.s, at: m.at, office: slot('cowork'), spare: slot('code'), logbook: { x: m.at(L.vlog[0], 0)[0], y: m.at(0, L.vlog[1])[1] }, roof: { x: m.at(W / 2, 0)[0], y: m.y } };
    if (a <= 0.002 || k <= 0) return geo;
    const fill = K.clamp((k - 0.45) / 0.55);
    const showLabels = o.labels === true || (o.labels !== false && m.s >= 0.6), ls = 26 / Math.min(1, m.s);
    K.layer(a, () => K.at(m.x, m.y, m.s, 0, () => {
      K.layer(fill, () => K.card(0, 0, W, H, { r: 10, fill: P.vendor, stroke: false }));
      outline(0, 0, W, H, 10, k / 0.7, { color: P.vendorEdge, w: 2.5 });
      K.line(-10, 0, W + 10, 0, { k: K.clamp(k / 0.5), color: P.vendorEdge, w: 4 });
      if (fill <= 0) return;
      K.layer(fill, () => {
        const icons = o.roofIcons || ['cloud', 'server'];
        icons.forEach((n, i) => K.icon(n, W / 2 + (i - (icons.length - 1) / 2) * 120, -34, 56, { color: C.body, w: 2.6 }));
        if (showLabels) K.eyebrow(o.name || "ANTHROPIC'S SERVERS", W / 2, -88, { ...T.eyebrow, size: 24 / Math.min(1, m.s), color: C.body, align: 'center' });
        const sl = clamp01(o.slots);
        for (const n of ['cowork', 'code']) {
          const [sx, sy, sw, sh] = L.vslots[n];
          if (sl > 0) dashedRR(sx, sy, sw, sh, 16, { color: C.line2, alpha: sl, fill: K.rgba(C.page, 0.3) });
        }
        const ok = clamp01(o.office);
        if (ok > 0) { const [sx, sy, sw, sh] = L.vslots.cowork; room('cowork', sx, sy, sw, sh, { alpha: ok, lit: pick(o.officeLit, 0.8), fill: P.vendorRoom, door: o.doors === false || !showLabels ? null : 'Cowork', doorSize: ls }); }
        const sk = clamp01(o.spare);
        if (sk > 0) { const [sx, sy, sw, sh] = L.vslots.code; room('code', sx, sy, sw, sh, { alpha: sk, lit: pick(o.spareLit, 0.8), fill: P.vendorRoom, gear: o.gear, door: o.doors === false || !showLabels ? null : 'cloud session', doorSize: ls }); }
        const lk = clamp01(o.logbook);
        if (lk > 0) {
          const [lx, ly] = L.vlog, lg = clamp01(o.logGlow);
          K.layer(lk, () => {
            if (lg > 0) K.glow(lx, ly, 70, C.head, 0.35 * lg);
            K.icon('book', lx - 64, ly, 40, { color: K.mixColor(C.body, C.head, lg), w: 2.6 });
            if (showLabels) label('logbook', lx - 34, ly + 9, { align: 'left', size: ls, color: K.mixColor(C.body, C.head, lg) });
          });
        }
      });
    }));
    return geo;
  }

  // ---------------------------------------------------------------- the whole street
  /** the wide street: house + road + vendor, mapped together by {x, y, s} (default 0, 0, 1 = the storyboard's
   *  canvas numbers). o.house / o.road / o.vendor pass options through (o.vendor: false hides the building,
   *  o.road: false hides the road). Returns {house, road, vendor, at(wx, wy)} (canvas anchors) */
  function street(t, o = {}) {
    const m = xf(o), at = (wx, wy) => m.at(wx, wy);
    const rd = o.road === false ? null : o.road || {};
    let r = null;
    if (rd) {
      const p0 = at(pick(rd.x0, L.road.x0), pick(rd.y, L.road.y)), p1 = at(pick(rd.x1, L.road.x1), 0);
      r = road(t, { ...rd, x0: p0[0], x1: p1[0], y: p0[1], labelX: rd.labelX != null ? at(rd.labelX, 0)[0] : undefined });
    }
    const v = o.vendor === false ? null : vendor(t, { ...(o.vendor || {}), x: at(L.vendor.x, 0)[0], y: at(0, L.vendor.y)[1], s: m.s });
    const h = house(t, { ...(o.house || {}), x: at(L.house.x, 0)[0], y: at(0, L.house.y)[1], s: m.s });
    return { house: h, road: r, vendor: v, at };
  }

  // ---------------------------------------------------------------- the hatch path
  /** the gold path from the vendor's back office, over the road, in through the hatch, to a folder.
   *  hg = M.house(...) result, vg = M.vendor(...) result. o: {k (draw progress), on (0..1: 1 gold = desktop app
   *  open, 0 grey), to (folder name, default 'Projects'), w, from ('office' | 'spare')} ; returns the waypoints */
  function hatchLine(hg, vg, o = {}) {
    const fromSlot = vg[o.from || 'office'], f = hg.folders[o.to || 'Projects'] || hg.folders.Projects;
    const hx = hg.hatch.cx, hy = hg.hatch.cy;
    const under = hg.at(0, 152)[1];          // just under the shelf plank, above the room signs
    const pts = [[fromSlot.x + 6, fromSlot.cy], [K.lerp(hx, fromSlot.x, 0.5), K.lerp(hy, fromSlot.cy, 0.5) - 30 * hg.s], [hx + 24 * hg.s, hy], [hx - 36 * hg.s, hy],
      [hx - 110 * hg.s, under], [f.x + 70 * hg.s, under], [f.x, f.y + 80 * hg.s]];   // ends on the plank under the folder's name
    const on = clamp01(pick(o.on, 1)), k = clamp01(pick(o.k, 1));
    if (k <= 0) return pts;
    const col = K.mixColor(C.line2, C.head, on);
    K.path(pts, { k, color: col, w: (o.w || 5) * Math.max(0.6, hg.s), headSize: 18 * Math.max(0.6, hg.s), tension: 0.45, alpha: 0.5 + 0.5 * on });
    return pts;
  }

  // ---------------------------------------------------------------- copies that cross the road
  /** a dashed copy of a file (never the original) centred at (x, y), size s (as K.file). o: {alpha, name, color,
   *  stamp (true = a small 'copy' tag), never (terracotta: a copy that should not have crossed)} */
  function copy(x, y, s, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return;
    const col = o.never ? C.accent : (o.color || C.head);
    const w = s * 0.78, h = s, fold = s * 0.24, x0 = x - w / 2, y0 = y - h / 2, g = G();
    K.layer(a, () => {
      g.save(); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w - fold, y0); g.lineTo(x0 + w, y0 + fold); g.lineTo(x0 + w, y0 + h); g.lineTo(x0, y0 + h); g.closePath();
      g.fillStyle = K.rgba(col, 0.08); g.fill(); g.setLineDash([7, 6]); g.lineWidth = Math.max(2, s * 0.03); g.strokeStyle = col; g.stroke();
      g.beginPath(); g.moveTo(x0 + w - fold, y0); g.lineTo(x0 + w - fold, y0 + fold); g.lineTo(x0 + w, y0 + fold); g.stroke(); g.setLineDash([]);
      for (let i = 0; i < 3; i++) K.line(x0 + w * 0.2, y0 + h * (0.4 + i * 0.13), x0 + w * (i === 2 ? 0.55 : 0.78), y0 + h * (0.4 + i * 0.13), { color: K.rgba(col, 0.7), w: Math.max(2, s * 0.025) });
      g.restore();
      if (o.stamp) pillL('copy', x + w / 2 + 12, y0 + 18, { size: 26, font: 'mono', color: C.page, fill: col, stroke: col });
      if (o.name) K.text(o.name, x, y + h / 2 + 34, { ...T.mono, color: o.never ? C.accent : C.body, align: 'center' });
    });
  }
  /** a bundle (a parcel of copies on its way across the road), centred at (x, y), width s.
   *  o: {alpha, label (mono, under it), never (terracotta outline)} */
  function bundle(x, y, s, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return;
    const col = o.never ? C.accent : C.head, w = s, h = s * 0.7, g = G();
    K.layer(a, () => {
      g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
      K.rr(x - w / 2, y - h / 2, w, h, 10); g.fillStyle = K.mixColor(C.tile, C.head, 0.12); g.fill(); g.restore();
      dashedRR(x - w / 2, y - h / 2, w, h, 10, { color: col, w: 2.5 });
      K.line(x, y - h / 2, x, y + h / 2, { color: col, w: 3, alpha: 0.7 });
      K.line(x - w / 2, y, x + w / 2, y, { color: col, w: 3, alpha: 0.7 });
      if (o.label) K.text(o.label, x, y + h / 2 + 36, { ...T.mono, color: C.body, align: 'center' });
    });
  }

  // ---------------------------------------------------------------- dated cards and chips
  /** a dated source card: eyebrow = publisher · date (gold, wraps), body = the source's own words (Georgia),
   *  optional footer pill (mono 26; footer: true = 'as of 2026-10-14 · moves monthly').
   *  o: {eyebrow, body, size (30), quote (wrap body in curly quotes), italic, footer, alpha, stale (terracotta
   *  outline + stamp text, e.g. 'stale for Pro and Max'), glow, measure (true = only return the height)}.
   *  Returns the card's height. */
  function dated(x, y, w, o = {}) {
    const size = o.size || 30, pad = 32, lh = size * 1.36;
    const body = o.body == null ? '' : o.quote ? '“' + o.body + '”' : o.body;
    const eb = o.eyebrow ? K.wrap(String(o.eyebrow).toUpperCase(), w - pad * 2, T.eyebrow) : [];
    const lines = body ? K.wrap(body, w - pad * 2, { ...T.read, size, italic: o.italic }) : [];
    const footer = o.footer === true ? ASOF : o.footer;
    const ebH = eb.length ? eb.length * 32 + 14 : 0, bodyH = lines.length ? lines.length * lh - (lh - size) : 0;
    const h = pad * 2 + ebH + bodyH + (footer ? 70 : 0) + (o.stale ? 60 : 0);
    if (o.measure) return h;
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return h;
    K.layer(a, () => {
      K.card(x, y, w, h, { r: 24, glow: o.glow, stroke: o.stale ? C.accent : C.line2, lw: o.stale ? 2.5 : 1.5 });
      eb.forEach((ln, i) => K.text(ln, x + pad, y + pad + 20 + i * 32, { ...T.eyebrow, color: C.head }));
      lines.forEach((ln, i) => K.text(ln, x + pad, y + pad + ebH + size * 0.8 + i * lh, { ...T.read, size, italic: o.italic, color: C.strong }));
      let fy = y + pad + ebH + bodyH;
      if (footer) { pillL(footer, x + pad, fy + 42, { size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel }); fy += 70; }
      if (o.stale) pillL(o.stale, x + pad, fy + 38, { size: 26, color: C.accent, fill: C.tile, stroke: C.accent });
    });
    return h;
  }
  /** the dated pill alone: 'as of 2026-10-14 · moves monthly' (or o.text), left edge at x; returns its width */
  function asOf(x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    return pillL(o.text || ASOF, x, y, { size: 26, font: 'mono', weight: 400, color: C.body, fill: C.panel, alpha: a, align: o.align });
  }
  /** terracotta eyebrow 'WHERE THE PICTURE BREAKS' with a warning glyph, left at (x, y) (o.align 'center') */
  function breaks(x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    const s = o.text || 'where the picture breaks', tw = K.measure(s.toUpperCase(), { ...T.eyebrow, size: 26 }), w = tw + 44;
    const x0 = o.align === 'center' ? x - w / 2 : x;
    K.icon('warning', x0 + 15, y - 9, 30, { color: C.accent, alpha: a, w: 2.6 });
    K.text(s, x0 + 44, y, { ...T.eyebrow, size: 26, color: C.accent, alpha: a });
    return w;
  }
  /** pointer chip to the lesson that owns a topic: '→ the lesson on keys'. Describe the lesson by what it teaches,
   *  never by number. o: {alpha, align ('left' | 'center' | 'right')}; returns its width */
  function pointer(text, x, y, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    return pillL('→ ' + text, x, y, { size: 26, color: C.body, fill: C.panel, stroke: K.mixColor(C.line2, C.head, 0.3), alpha: a, align: o.align });
  }
  /** a drawn settings toggle: track + knob, left edge at x, centre y. on 0..1 (gold when on). o: {label (30 px,
   *  right of it), alpha, struck (0..1 a terracotta line through the label: a removed option)}; returns width */
  function toggle(x, y, on, o = {}) {
    const a = clamp01(pick(o.alpha, 1)); if (a <= 0.002) return 0;
    on = clamp01(on);
    const tw = 84, th = 44, g = G();
    let w = tw;
    K.layer(a, () => {
      g.save(); K.rr(x, y - th / 2, tw, th, th / 2); g.fillStyle = K.mixColor(C.panel, C.head, on * 0.85); g.fill();
      g.lineWidth = 2; g.strokeStyle = K.mixColor(C.line2, C.head, on); g.stroke();
      g.beginPath(); g.arc(x + K.lerp(th / 2, tw - th / 2, K.ease.io(on)), y, th / 2 - 6, 0, 7); g.fillStyle = on > 0.5 ? C.page : C.body; g.fill(); g.restore();
      if (o.label) {
        const lw = K.text(o.label, x + tw + 20, y + 10, { ...T.labelBig, color: C.strong });
        if (o.struck) K.line(x + tw + 14, y, x + tw + 26 + lw, y, { k: clamp01(o.struck), color: C.accent, w: 4 });
        w += 20 + lw;
      }
    });
    return w;
  }

  // ---------------------------------------------------------------- title card and end card
  const lessonDef = () => window.__lesson || {};
  // the end card's short bodies (storyboard 15); lesson.js keep[i][1] (the page's longer wording) with o.full
  const KEEP = [
    'The model may be shared; the reach never is.',
    "Yours, a box inside it, a machine down the line, or the vendor's cloud working on a copy.",
    'Training and memory settings, one dedicated folder; for work data, whoever owns it.',
  ];
  /** the credit line from lesson.js credits. o: {ids (default the narrated five: S249, S209, S102, S184, S207),
   *  lead (default 'Built on'), more (default true: '· all N sources and dates on the lesson page'), align
   *  ('left' | 'center'), size (26), color (C.soft), alpha, measure}. Anthropic's pages group into one entry.
   *  Returns the height of the wrapped line(s). */
  function credits(x, y, w, o = {}) {
    const cr = lessonDef().credits || [];
    const ids = o.ids || ['S249', 'S209', 'S102', 'S184', 'S207'];
    const parts = [], groups = {};
    ids.forEach((id) => {
      const c = cr.find((e) => e.id === id); if (!c) return;
      const m = /^(.*?) \((.*)\)$/.exec(c.who), base = m ? m[1] : c.who, sub = m ? m[2] : null;
      if (base === 'Anthropic' && sub) { if (!groups[base]) { groups[base] = []; parts.push(base); } if (!groups[base].includes(sub)) groups[base].push(sub); }
      else parts.push(c.who);
    });
    const names = parts.map((p) => (groups[p] ? `${p} (${groups[p].join(', ')})` : p));
    let s = `${pick(o.lead, 'Built on')} ${names.join(' · ')}`;
    if (o.more !== false && cr.length) s += ` · all ${cr.length} sources and dates on the lesson page`;
    const to = { font: 'ui', weight: 400, size: o.size || 26 }, lh = (o.size || 26) * 1.4;
    const lines = K.wrap(s, w, to);
    if (o.measure) return lines.length * lh;
    const a = clamp01(pick(o.alpha, 1));
    if (a > 0.002) lines.forEach((ln, i) => K.text(ln, o.align === 'center' ? x + w / 2 : x, y + i * lh, { ...to, color: o.color || C.soft, align: o.align === 'center' ? 'center' : 'left', alpha: a }));
    return lines.length * lh;
  }
  /** one keep-this row: bold lead (Zen Maru 40 gold) from lesson.js keep[i][0] and body (Georgia 30): the end card's
   *  short line M.KEEP[i] (o.full: lesson.js keep[i][1]; o.lead / o.body override). o: {k (0..1 reveal: rises 16 px
   *  and fades), gap (28 px after it)}. Returns its height including the gap, so rows stack with y += M.keep(...). */
  function keep(i, x, y, w, o = {}) {
    const kp = (lessonDef().keep || [])[i] || ['', ''];
    const lead = pick(o.lead, kp[0]), body = pick(o.body, o.full ? kp[1] : KEEP[i] || kp[1]);
    const k = clamp01(pick(o.k, 1));
    const lines = K.wrap(body, w, { ...T.read, size: 30 });
    const h = 52 + lines.length * 42 + (o.gap == null ? 28 : o.gap);
    if (k <= 0.002) return h;
    K.layer(k, () => K.at(0, (1 - K.ease.out(k)) * 16, 1, 0, () => {
      K.title(lead, x, y + 36, { size: 40, weight: 700, tracking: -0.5 });
      lines.forEach((ln, j) => K.text(ln, x, y + 52 + 30 + j * 42, { ...T.read, size: 30, color: C.body }));
    }));
    return h;
  }

  window.M = {
    P, T, L, ASOF, KEEP,
    worker, room, house, road, vendor, street, hatchLine,
    copy, bundle, dated, asOf, breaks, pointer, toggle, credits, keep,
    along, pillL, outline, dashedRR, label,
  };
})();
