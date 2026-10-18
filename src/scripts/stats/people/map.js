// The "Where are they?" map: a quiet dotted world (geo.js LAND) under one sunflower of dots per
// country. Each dot is the same number of pages, so a country's cluster has the area its count
// deserves, and the eye reads "most of it is here" without a legend.
//
// Two halves. The top of the file is pure layout (unit, spirals, relaxation, labels) and runs in
// Node for the tests. createMap() at the bottom is the SVG and its interactions; nothing in it
// runs at import time.
//
// Why these choices:
// - One unit for the whole map, from the same ladder the gate uses (1, 2, 5, 10, …), the smallest
//   that keeps the dot count readable (≤ 420 dots, ≤ 260 on a phone) and the biggest cluster under
//   16% of the map's height, so the United States can't swallow North America.
// - A country with fewer pages than one dot still shows: a crumb, a smaller fainter dot, because
//   "someone read from Nigeria" is worth seeing even at one page.
// - Clusters that would overlap are pushed apart (80 rounds, with a spring back to where they
//   belong). One that had to move more than 6px keeps a hairline to its true place.
// - The SVG is aria-hidden. The list beside the map is the accessible version of everything here.

import { CENTROIDS, CONTINENT_LABELS, landPoints } from './geo.js';
import { fitBox } from './equal-earth.js';

export const LADDER = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
export const LAT_MIN = -57;
export const LAT_MAX = 79;
const GOLDEN = (137.508 * Math.PI) / 180;

/** Whole dots for a value at unit u; under one unit is a crumb (0 dots). */
export const dotsFor = (v, u) => (v >= u ? Math.max(1, Math.round(v / u)) : 0);

/**
 * The smallest unit from the ladder that keeps the total dots under `cap` and the largest cluster's
 * radius under `maxR`. Past the end of the ladder it keeps doubling, so it always answers.
 */
export function pickMapUnit(values, { cap, pitch, maxR, ladder = LADDER }) {
  const max = values.reduce((m, v) => Math.max(m, v), 0);
  const fits = (u) => {
    let total = 0;
    for (const v of values) total += dotsFor(v, u);
    return total <= cap && sunflowerRadius(dotsFor(max, u), pitch) <= maxR;
  };
  for (const u of ladder) if (fits(u)) return u;
  let u = ladder[ladder.length - 1];
  while (!fits(u)) u *= 2;
  return u;
}

/** Radius of the centre of the outermost dot of a k-dot sunflower. */
export const sunflowerRadius = (k, pitch) => (k > 0 ? 0.55 * pitch * Math.sqrt(k - 0.5) : 0);

/**
 * Offsets of k dots: dot i at radius 0.55·p·√(i + ½), angle i × 137.508°. The half step (the spec
 * says √i) keeps dot 0 off the exact centre, where it would half cover dot 1; with it the closest
 * two dots are 0.85·p apart, so dots of radius 0.36·p never touch.
 */
export function sunflower(k, pitch) {
  const out = new Array(k);
  for (let i = 0; i < k; i++) {
    const r = 0.55 * pitch * Math.sqrt(i + 0.5), a = i * GOLDEN;
    out[i] = [r * Math.cos(a), r * Math.sin(a)];
  }
  return out;
}

/**
 * Push overlapping circles apart, then pull each a tenth of the way back to its anchor, `iters`
 * times; a few last rounds without the spring settle what the spring undid. Big clusters weigh
 * more, so Germany nudges Belgium rather than the other way round. Mutates x, y.
 */
export function relax(cs, { iters = 80, spring = 0.1, gap = 3, bounds = null } = {}) {
  const n = cs.length;
  const clamp = (c) => {
    if (!bounds) return;
    c.x = Math.min(bounds.right - c.r, Math.max(bounds.left + c.r, c.x));
    c.y = Math.min(bounds.bottom - c.r, Math.max(bounds.top + c.r, c.y));
  };
  const push = () => {
    for (let i = 0; i < n; i++) {
      const a = cs[i];
      for (let j = i + 1; j < n; j++) {
        const b = cs[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const min = a.r + b.r + gap;
        if (d >= min) continue;
        if (d < 1e-6) { // same spot: split them along a fixed direction so the result never varies
          const ang = (i * 7 + j * 13) % 360 * (Math.PI / 180);
          dx = Math.cos(ang); dy = Math.sin(ang); d = 1;
        }
        const over = min - d, ux = dx / d, uy = dy / d;
        const wa = a.r * a.r + 1, wb = b.r * b.r + 1;
        const ka = wb / (wa + wb), kb = wa / (wa + wb);
        a.x -= ux * over * ka; a.y -= uy * over * ka;
        b.x += ux * over * kb; b.y += uy * over * kb;
      }
    }
    for (const c of cs) clamp(c);
  };
  for (let t = 0; t < iters; t++) {
    push();
    for (const c of cs) { c.x += (c.ax - c.x) * spring; c.y += (c.ay - c.y) * spring; }
  }
  for (let t = 0; t < 12; t++) push();
  return cs;
}

const rectsHit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
// gap between a circle's edge and a rectangle (negative when they overlap)
const edgeGap = (c, r) => {
  const nx = Math.max(r.x, Math.min(c.x, r.x + r.w)), ny = Math.max(r.y, Math.min(c.y, r.y + r.h));
  return Math.hypot(c.x - nx, c.y - ny) - c.r;
};
const circleHitsRect = (c, r, pad = 1) => edgeGap(c, r) < pad;

/**
 * Direct labels for the biggest clusters, placed in rank order so a lesser country can never take
 * the room the leaders need. Each label tries rings of spots around its cluster (beside, above,
 * below, the diagonals; the outer rings joined to the cluster by a hairline) and takes the
 * cheapest one that stays on the map, keeps off every cluster of dots and off earlier labels.
 *
 * Crumbs (a country under one dot) are soft obstacles: a spot that covers one costs more than a
 * spot one ring further out, but isn't ruled out. Treating them as walls is what left the United
 * States with nowhere to go on a phone but across its own dots, and Germany and the United
 * Kingdom with no label at all, in a Europe peppered with crumbs. A label that fits nowhere is
 * skipped (the list still names it).
 */
export function placeLabels(cs, { max = 6, measure, bounds, h = 13 }) {
  const placed = [];
  const solid = cs.filter((c) => c.dots > 0);
  const crumbs = cs.filter((c) => c.dots === 0);
  const top = solid.slice().sort((a, b) => b.n - a.n).slice(0, max);
  const RINGS = [5, 13, 26, 42];
  for (const c of top) {
    const w = measure(c.text) + 2;
    const tries = [];
    RINGS.forEach((gap, ring) => {
      const d = (c.r + gap) * Math.SQRT1_2;
      const lead = gap > 13; // far enough out that a hairline has to say whose label it is
      for (const t of [
        { x: c.x + c.r + gap, y: c.y - h / 2, anchor: 'start' },
        { x: c.x - c.r - gap - w, y: c.y - h / 2, anchor: 'end' },
        { x: c.x - w / 2, y: c.y - c.r - gap - h + 1, anchor: 'middle' },
        { x: c.x - w / 2, y: c.y + c.r + gap - 1, anchor: 'middle' },
        { x: c.x + d, y: c.y - d - h, anchor: 'start' },
        { x: c.x - d - w, y: c.y - d - h, anchor: 'end' },
        { x: c.x + d, y: c.y + d, anchor: 'start' },
        { x: c.x - d - w, y: c.y + d, anchor: 'end' },
      ]) tries.push({ ...t, ring, lead });
    });
    let best = null;
    for (const t of tries) {
      const r = { x: t.x, y: t.y, w, h };
      if (r.x < bounds.left || r.x + r.w > bounds.right || r.y < bounds.top || r.y + r.h > bounds.bottom) continue;
      if (solid.some((o) => circleHitsRect(o, r))) continue;
      // a label must sit nearer its own cluster than any other, or it reads as the neighbour's;
      // one out on a hairline only has to keep clear, since the line says whose it is
      const own = edgeGap(c, r);
      const clear = t.lead ? 3 : Math.min(own, 8);
      if (solid.some((o) => o !== c && edgeGap(o, r) < clear)) continue;
      // labels keep a little air between them, so two never read as one block
      const roomy = { x: r.x - 3, y: r.y - 4, w: r.w + 6, h: r.h + 8 };
      if (placed.some((p) => rectsHit(p.rect, roomy))) continue;
      const covered = crumbs.reduce((k, o) => k + (circleHitsRect(o, r, 0.5) ? 1 : 0), 0);
      const cost = t.ring + covered * 1.5;
      if (!best || cost < best.cost) best = { t, r, cost };
      if (cost === 0) break;
    }
    if (!best) continue;
    const { t, r } = best;
    placed.push({ code: c.code, rect: r, anchor: t.anchor, text: c.text, lead: t.lead ? { x: c.x, y: c.y, r: c.r } : null });
  }
  return placed;
}

/**
 * Everything the map draws, for one population, as plain numbers.
 * rows: [{code, n}] desc. Codes with no place on the map are returned in `unplaced`.
 */
export function layoutMap(rows, { width, height, phone = false, label = (code, n) => `${code} ${n}`, measure = (s) => s.length * 6.3 }) {
  const box = fitBox(width, height, { latMin: LAT_MIN, latMax: LAT_MAX, pad: 4 });
  const pitch = phone ? 4 : 5;
  const dotR = pitch * 0.36;
  const crumbR = dotR * 0.8;
  const placedRows = [], unplaced = [];
  for (const r of rows) {
    const c = CENTROIDS[r.code];
    if (!c || !(r.n > 0) || c[0] < LAT_MIN || c[0] > LAT_MAX) unplaced.push(r); else placedRows.push(r);
  }
  const unit = pickMapUnit(placedRows.map((r) => r.n), {
    cap: phone ? 260 : 420, pitch, maxR: height * 0.16 - dotR,
  });
  const bounds = { left: 0, top: 0, right: width, bottom: height };
  const cs = placedRows.map((r) => {
    const [lat, lon] = CENTROIDS[r.code];
    const [ax, ay] = box.project(lat, lon);
    const dots = dotsFor(r.n, unit);
    const r0 = dots > 0 ? sunflowerRadius(dots, pitch) + dotR : crumbR;
    return { code: r.code, n: r.n, ax, ay, x: ax, y: ay, r: r0, dots, text: label(r.code, r.n) };
  });
  relax(cs, { bounds });
  for (const c of cs) c.moved = Math.hypot(c.x - c.ax, c.y - c.ay);
  // a phone names fewer countries, so the leaders get the little room there is
  const labels = placeLabels(cs, { max: phone ? 4 : 6, measure, bounds: { left: 2, top: 2, right: width - 2, bottom: height - 2 } });
  return { box, pitch, dotR, crumbR, unit, clusters: cs, labels, unplaced, width, height };
}

// ---------------------------------------------------------------------------------------------
// The SVG. Everything below touches the DOM.

const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (name, attrs = {}) => {
  const e = document.createElementNS(SVGNS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
};
const f1 = (v) => Math.round(v * 10) / 10;

let measureCtx = null;
function measureText(s) {
  try {
    measureCtx = measureCtx || document.createElement('canvas').getContext('2d');
    measureCtx.font = '600 11px Karla, system-ui, sans-serif';
    return measureCtx.measureText(s).width;
  } catch (e) {
    return s.length * 6.3;
  }
}

/**
 * createMap(host, { reduced(), names(code, phone) → string, onHover(code|null), onPick(code) })
 * → { draw(rows, kind, { animate }), light(code|null), pulse(code), anchor(code), layout, destroy() }
 * kind is 'person' | 'bot' | 'scanner' and only picks the colour.
 */
export function createMap(host, { reduced = () => false, names = (c) => c, fmtN = String, onHover = () => {}, onPick = () => {} } = {}) {
  const svg = svgEl('svg', { class: 'st-ppl-map', 'aria-hidden': 'true', focusable: 'false' });
  const land = svgEl('path', { class: 'st-ppl-land' });
  const conts = svgEl('g', { class: 'st-ppl-conts' });
  const fx = svgEl('g', { class: 'st-ppl-fx' });
  const defs = svgEl('defs');
  svg.append(defs, land, conts, fx);
  host.append(svg);

  let W = 0, H = 0, phone = false;
  let layer = null, lay = null, lastRows = null, lastKind = 'person';
  let lit = null, grow = null, ringT = 0;
  const uid = 'p' + Math.random().toString(36).slice(2, 8);

  function size() {
    const w = Math.round(host.clientWidth || 600);
    phone = w < 520;
    const h = Math.round(w * (phone ? 0.49 : 0.5));
    if (w === W && h === H) return false;
    W = w; H = h;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', String(W));
    svg.setAttribute('height', String(H));
    const box = fitBox(W, H, { latMin: LAT_MIN, latMax: LAT_MAX, pad: 4 });
    let d = '';
    for (const [lat, lon] of landPoints()) {
      const [x, y] = box.project(lat, lon);
      d += `M${f1(x)} ${f1(y)}h0`;
    }
    land.setAttribute('d', d);
    land.setAttribute('stroke-width', String(phone ? 2 : 2.8));
    conts.replaceChildren();
    for (const key in CONTINENT_LABELS) {
      const [lat, lon] = CONTINENT_LABELS[key];
      const [x, y] = box.project(lat, lon);
      const t = svgEl('text', { x: f1(x), y: f1(y), 'text-anchor': 'middle', 'data-cont': key });
      t.textContent = CONT_NAMES[key];
      conts.append(t);
    }
    return true;
  }

  // Continent names step aside for clusters: a label that touches one is hidden for this layout.
  function hideCoveredContinents() {
    if (!lay) return;
    for (const t of conts.children) {
      let bb;
      try { bb = t.getBBox(); } catch (e) { continue; }
      const r = { x: bb.x - 3, y: bb.y - 2, w: bb.width + 6, h: bb.height + 4 };
      const hit = lay.clusters.some((c) => circleHitsRect(c, r, 2)) || lay.labels.some((l) => rectsHit(l.rect, r));
      t.classList.toggle('is-hidden', hit);
    }
  }

  function buildLayer(rows, kind) {
    lay = layoutMap(rows, {
      width: W, height: H, phone,
      label: (code, n) => `${names(code, phone)} ${fmtN(n)}`,
      measure: measureText,
    });
    const g = svgEl('g', { class: `st-ppl-layer is-${kind}` });
    const leaders = svgEl('g', { class: 'st-ppl-leaders' });
    const labels = svgEl('g', { class: 'st-ppl-labels' });
    g.append(leaders);
    defs.replaceChildren();
    lay.clusters.forEach((c, i) => {
      if (c.moved > 6) {
        // a hairline from the cluster's edge back to where the country really is
        const ux = (c.ax - c.x) / c.moved, uy = (c.ay - c.y) / c.moved;
        leaders.append(
          svgEl('line', { x1: f1(c.x + ux * c.r), y1: f1(c.y + uy * c.r), x2: f1(c.ax), y2: f1(c.ay), 'data-code': c.code }),
          svgEl('circle', { cx: f1(c.ax), cy: f1(c.ay), r: 1.3, 'data-code': c.code }),
        );
      }
      const cg = svgEl('g', { class: 'st-ppl-cl', 'data-code': c.code, transform: `translate(${f1(c.x)} ${f1(c.y)})` });
      if (c.dots > 0) {
        // a disc of the page's colour under the dots, so the land grid doesn't show through
        cg.append(svgEl('circle', { class: 'st-ppl-bg', r: f1(c.r + 1.5) }));
        let d = '';
        for (const [dx, dy] of sunflower(c.dots, lay.pitch)) d += `M${f1(dx)} ${f1(dy)}h0`;
        cg.append(svgEl('path', { class: 'st-ppl-dots', d, 'stroke-width': f1(lay.dotR * 2) }));
      } else {
        cg.append(svgEl('circle', { class: 'st-ppl-crumb', r: f1(lay.crumbR) }));
      }
      // an invisible disc, so the cluster's bounding box (the popover's anchor) is its full size
      cg.append(svgEl('circle', { class: 'st-ppl-hit', r: f1(Math.max(c.r, 6)) }));
      c.el = cg; c.i = i;
      g.append(cg);
    });
    for (const l of lay.labels) {
      if (l.lead) {
        // a label set further out points back at its cluster
        const r = l.rect, c = l.lead;
        const nx = Math.max(r.x, Math.min(c.x, r.x + r.w)), ny = Math.max(r.y, Math.min(c.y, r.y + r.h));
        const d = Math.hypot(nx - c.x, ny - c.y) || 1;
        labels.append(svgEl('line', {
          class: 'st-ppl-lead', 'data-code': l.code,
          x1: f1(c.x + ((nx - c.x) / d) * (c.r + 2)), y1: f1(c.y + ((ny - c.y) / d) * (c.r + 2)),
          x2: f1(nx - ((nx - c.x) / d) * 2), y2: f1(ny - ((ny - c.y) / d) * 2),
        }));
      }
      const t = svgEl('text', {
        x: f1(l.anchor === 'start' ? l.rect.x : l.anchor === 'end' ? l.rect.x + l.rect.w : l.rect.x + l.rect.w / 2),
        y: f1(l.rect.y + l.rect.h - 2.5), 'text-anchor': l.anchor, 'data-code': l.code,
      });
      t.textContent = l.text;
      labels.append(t);
    }
    g.append(labels);
    return g;
  }

  // Clusters grow out along their spirals: a clip circle per cluster widens from the centre, and
  // because a sunflower fills from the inside out, that reveals the dots in the order they were
  // laid. One tween drives them all; the biggest start first.
  function growIn(motionTween) {
    if (!lay || reduced() || !motionTween) return;
    const cs = lay.clusters.slice().sort((a, b) => b.n - a.n);
    const items = cs.map((c, rank) => {
      const id = `${uid}-${c.code}`;
      const cp = svgEl('clipPath', { id });
      const circ = svgEl('circle', { r: 0 });
      cp.append(circ);
      defs.append(cp);
      c.el.setAttribute('clip-path', `url(#${id})`);
      return { c, circ, delay: Math.min(rank * 40, 300), R: c.r + 2 };
    });
    if (grow) grow.cancel();
    const DUR = 600, TOTAL = 900;
    grow = motionTween({
      from: 0, to: TOTAL, dur: TOTAL, ease: (t) => t,
      onUpdate(ms) {
        for (const it of items) {
          const p = Math.min(1, Math.max(0, (ms - it.delay) / DUR));
          const e = 1 - Math.pow(1 - p, 3);
          it.circ.setAttribute('r', f1(it.R * e));
        }
      },
      onDone() {
        for (const it of items) it.c.el.removeAttribute('clip-path');
        defs.replaceChildren();
        grow = null;
      },
    });
  }

  function draw(rows, kind, { animate = false, crossfade = false, tween } = {}) {
    size();
    lastRows = rows; lastKind = kind;
    const old = layer;
    layer = buildLayer(rows, kind);
    svg.insertBefore(layer, fx);
    hideCoveredContinents();
    lit = null;
    svg.classList.remove('is-focus');
    if (old) {
      if (crossfade && !reduced()) {
        // a crossfade, never a morph: these are different populations, not the same dots moving
        layer.classList.add('is-in');
        old.classList.add('is-out');
        requestAnimationFrame(() => requestAnimationFrame(() => layer && layer.classList.remove('is-in')));
        setTimeout(() => old.remove(), 340);
      } else old.remove();
    }
    if (animate) growIn(tween);
    return lay;
  }

  function redrawIfResized() {
    if (!lastRows) return;
    if (size()) {
      if (grow) { grow.cancel(); grow = null; }
      const old = layer;
      layer = buildLayer(lastRows, lastKind);
      svg.insertBefore(layer, fx);
      if (old) old.remove();
      hideCoveredContinents();
      if (lit) light(lit, true);
    }
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => redrawIfResized()) : null;
  if (ro) ro.observe(host);

  function light(code, force = false) {
    if (code === lit && !force) return;
    lit = code;
    svg.classList.toggle('is-focus', !!code);
    if (!layer) return;
    for (const el of layer.querySelectorAll('[data-code]')) el.classList.toggle('is-lit', el.getAttribute('data-code') === code);
  }

  // Pointing finds the nearest cluster within 22px (or its own radius): small crumbs are still
  // easy to hit with a thumb, and nothing needs a pixel-perfect aim.
  function nearest(ev) {
    if (!lay) return null;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return null;
    const k = W / rect.width;
    const x = (ev.clientX - rect.left) * k, y = (ev.clientY - rect.top) * k;
    let best = null, bd = Infinity;
    for (const c of lay.clusters) {
      const d = Math.hypot(c.x - x, c.y - y) - c.r;
      const reach = 22 * k;
      if (d < reach && d < bd) { bd = d; best = c; }
    }
    return best;
  }
  const onMove = (ev) => {
    if (ev.pointerType === 'touch') return;
    const c = nearest(ev);
    svg.style.cursor = c ? 'pointer' : '';
    const code = c ? c.code : null;
    if (code !== lit) { light(code); onHover(code); }
  };
  const onLeave = (ev) => {
    if (ev.pointerType === 'touch') return;
    if (lit) { light(null); onHover(null); }
  };
  const onClick = (ev) => {
    const c = nearest(ev);
    if (c) { light(c.code); onPick(c.code); }
  };
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerleave', onLeave);
  svg.addEventListener('click', onClick);

  // Two rings out of the cluster when a link lands on a country; a still outline for 1.5 s under
  // reduced motion.
  function pulse(code) {
    const c = lay && lay.clusters.find((x) => x.code === code);
    if (!c) return;
    clearTimeout(ringT);
    fx.replaceChildren();
    const ring = svgEl('circle', { cx: f1(c.x), cy: f1(c.y), r: f1(c.r + 5), class: reduced() ? 'st-ppl-ring is-still' : 'st-ppl-ring' });
    fx.append(ring);
    ringT = setTimeout(() => ring.remove(), reduced() ? 1500 : 1300);
  }

  const anchor = (code) => {
    const c = lay && lay.clusters.find((x) => x.code === code);
    return c ? c.el : null;
  };

  return {
    draw, light, pulse, anchor,
    /** Draw the land alone (before the clusters' first entrance), so the space is never blank. */
    prepare() { size(); },
    get drawn() { return !!layer; },
    get layout() { return lay; },
    get svg() { return svg; },
    destroy() {
      if (ro) ro.disconnect();
      if (grow) grow.cancel();
      clearTimeout(ringT);
      svg.remove();
    },
  };
}

const CONT_NAMES = { NA: 'NORTH AMERICA', SA: 'SOUTH AMERICA', EU: 'EUROPE', AF: 'AFRICA', AS: 'ASIA', OC: 'OCEANIA' };
