// The lore course's drawings, as SVG strings drawn at build time from lore.json: a person's lifeline on the
// warped Y axis (a sheet's "On the Y axis" strip) and the whole series on one axis (the timeline page). The axis
// is lorekit.js's (the lesson engine's), so a page and a lesson put every year in the same place.
import {
  EPISODES, CHARACTERS, THINGS, LORE, axis, fmtY, ageAt, placement, epVars, esc, TIERS, UNRELEASED, urlOf, weaker, entity, epNumber,
} from './lore.js';

/** Presentation attributes don't take var(): move fill/stroke/font-family values that use one into style="". */
export function cssify(svg) {
  return svg.replace(/<([a-zA-Z]+)(\s[^<>]*?)?(\/?)>/g, (m, tag, attrs = '', close) => {
    if (!attrs || !attrs.includes('var(')) return m;
    const moved = [];
    let rest = attrs.replace(/\s(fill|stroke|font-family)="(var\([^"]*\))"/g, (x, k, v) => {
      moved.push(`${k}:${v}`);
      return '';
    });
    if (!moved.length) return m;
    if (/\sstyle="/.test(rest)) rest = rest.replace(/\sstyle="([^"]*)"/, (x, v) => ` style="${moved.join(';')};${v}"`);
    else rest += ` style="${moved.join(';')}"`;
    return `<${tag}${rest}${close}>`;
  });
}

const DASH = { steel: '', fact: '', egg: '', running: '6 4', idea: '1.2 4.2', open: '3 3' };
const f1 = (n) => Math.round(n * 10) / 10;

/** A line in a tier's style (steel = two thin lines, running dashed, idea dotted). */
function tierLine(x1, y1, x2, y2, tier, color, w = 2) {
  if (tier === 'steel') {
    return `<line x1="${f1(x1)}" y1="${f1(y1 - 2.2)}" x2="${f1(x2)}" y2="${f1(y2 - 2.2)}" stroke="${color}" stroke-width="1.3"/>` +
      `<line x1="${f1(x1)}" y1="${f1(y1 + 2.2)}" x2="${f1(x2)}" y2="${f1(y2 + 2.2)}" stroke="${color}" stroke-width="1.3"/>`;
  }
  const d = DASH[tier] || '';
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${color}" stroke-width="${w}"${d ? ` stroke-dasharray="${d}"` : ''}${tier === 'idea' ? ' stroke-linecap="round"' : ''}/>`;
}

/** A tier mark at (x, y), radius r (the same six shapes as the chips). */
export function tierDot(x, y, tier, color, r = 5, title = '') {
  const t = title ? `<title>${esc(title)}</title>` : '';
  const X = f1(x), Y = f1(y);
  switch (tier) {
    case 'steel':
      return `<g>${t}<circle cx="${X}" cy="${Y}" r="${f1(r * 0.55)}" fill="${color}"/><circle cx="${X}" cy="${Y}" r="${f1(r * 1.15)}" fill="none" stroke="${color}" stroke-width="1.4"/></g>`;
    case 'egg':
      return `<g>${t}<ellipse cx="${X}" cy="${f1(y + r * 0.08)}" rx="${f1(r * 0.75)}" ry="${f1(r)}" fill="${color}"/></g>`;
    case 'running':
      return `<g>${t}<circle cx="${X}" cy="${Y}" r="${r}" fill="var(--pc-tile)" stroke="${color}" stroke-width="1.7" stroke-dasharray="2.6 2"/></g>`;
    case 'idea':
      return `<g>${t}<circle cx="${X}" cy="${Y}" r="${r}" fill="var(--pc-tile)" stroke="${color}" stroke-width="2" stroke-dasharray="0.01 2.9" stroke-linecap="round"/></g>`;
    case 'open':
      return `<g>${t}<circle cx="${X}" cy="${Y}" r="${r}" fill="var(--pc-tile)" stroke="${color}" stroke-width="1.4"/><text x="${X}" y="${f1(y + r * 0.45)}" text-anchor="middle" font-size="${f1(r * 1.3)}" font-weight="700" fill="${color}" font-family="Karla, sans-serif">?</text></g>`;
    default:
      return `<g>${t}<circle cx="${X}" cy="${Y}" r="${r}" fill="${color}"/></g>`;
  }
}

/** 1-D label layout (lorekit.js L.spread): centres that keep `gap` between labels, inside [min, max]. */
export function spread(items, min, max, gap = 8) {
  const n = items.length, c = items.map((it) => it.x);
  for (let pass = 0; pass < 80; pass++) {
    let moved = false;
    for (let i = 0; i + 1 < n; i++) {
      const need = (items[i].w + items[i + 1].w) / 2 + gap, have = c[i + 1] - c[i];
      if (have < need - 0.5) { const d = (need - have) / 2; c[i] -= d; c[i + 1] += d; moved = true; }
    }
    for (let i = 0; i < n; i++) {
      const lo = min + items[i].w / 2, hi = max - items[i].w / 2;
      if (c[i] < lo) { c[i] = lo; moved = true; }
      if (c[i] > hi) { c[i] = hi; moved = true; }
    }
    if (!moved) break;
  }
  return c;
}

const TC = (t) => `var(--t-${t})`;
const epPlaced = () => EPISODES.map((e) => ({ e, p: placement(e) })).filter((x) => x.p);
const FOCUS = () => epPlaced().map(({ p }) => [p.min - 2, p.max + 2]);

function axisLayer(ax, y, { labels = true, h = 0 } = {}) {
  let s = `<line x1="${ax.X0}" y1="${y}" x2="${ax.X1}" y2="${y}" stroke="var(--pc-line2)" stroke-width="1.5"/>`;
  for (const br of ax.breaks) {
    const mx = (br.x0 + br.x1) / 2;
    s += `<rect x="${f1(mx - 7)}" y="${y - 6}" width="14" height="12" fill="var(--pc-bg)"/>` +
      `<path d="M${f1(mx - 7)} ${y + 6} l5 -12 M${f1(mx + 2)} ${y + 6} l5 -12" stroke="var(--pc-quiet)" stroke-width="1.4"/>`;
  }
  for (const t of ax.ticks) {
    const x = ax.x(t);
    s += `<line x1="${f1(x)}" y1="${y}" x2="${f1(x)}" y2="${y + 5}" stroke="var(--pc-quiet)" stroke-width="1"/>`;
    if (h) s += `<line x1="${f1(x)}" y1="${y - h}" x2="${f1(x)}" y2="${y}" stroke="var(--pc-line)" stroke-width="1" stroke-dasharray="2 4"/>`;
    if (labels) s += `<text class="svgm" x="${f1(x)}" y="${y + 18}" text-anchor="middle" font-size="11"${t === 0 ? ' font-weight="700" style="fill:var(--pc-strong)"' : ''}>${fmtY(t)}</text>`;
  }
  return s;
}

/**
 * A sheet's lifeline: the person on the warped axis from birth, each episode as a column in its colour with
 * the age there (in the weaker tier of the birth year and the episode's placement), the person's own dated
 * lines as marks on the line. Returns '' when the entity has no birth year.
 */
export function lifelineSvg(ent) {
  const born = ent.born?.year ? ent.born : null;
  if (!born) return '';
  const own = (ent.sections || []).flatMap((s) => s.bullets).filter((b) => b.year);
  const eps = epPlaced();
  const yrs = [0, born.year.min, ...eps.flatMap(({ p }) => [p.min, p.max]), ...own.map((b) => b.year.min)];
  if (ent.died?.year) yrs.push(ent.died.year.min);
  const W = 600, X0 = 24, X1 = W - 24;
  const ax = axis(yrs, X0, X1, { tickGap: 44, cap: 6, maxGap: 10, pad: 3, focus: FOCUS(), mul: 3 });
  const LY = 98, AY = 128, H = 150;
  let s = '';
  // episode columns; their labels and the ages spread apart above, each tied to its column by a leader
  const labels = eps.map(({ e, p }) => {
    const x0 = ax.x(p.min), x1 = ax.x(p.max);
    return { e, p, x0, x1, x: (x0 + x1) / 2, w: 50 };
  });
  const lx = spread(labels, X0, X1, 6);
  labels.forEach((L, i) => {
    const wcol = Math.max(8, L.x1 - L.x0);
    const inIt = (ent.episodes || []).includes(L.e.id);
    const X = lx[i];
    s += `<g style="${epVars(L.e.id)}" opacity="${inIt ? 1 : 0.55}">`;
    s += `<rect x="${f1(L.x - wcol / 2)}" y="70" width="${f1(wcol)}" height="${AY - 70}" rx="3" fill="var(--ep)" opacity="${inIt ? 0.22 : 0.1}"/>`;
    s += `<a href="${urlOf(L.e.id)}"><rect x="${f1(X - 16)}" y="4" width="32" height="19" rx="4" fill="none" stroke="var(--ep)" stroke-width="1.5"${UNRELEASED.has(L.e.id) ? ' stroke-dasharray="3 2"' : ''}/>` +
      `<text x="${f1(X)}" y="18" text-anchor="middle" font-size="12" font-weight="700" font-family="var(--mono)" fill="var(--ep)">${L.e.id}</text></a>`;
    const age = ageAt(born, L.e);
    if (age) {
      s += `<text class="svgt" x="${f1(X)}" y="42" text-anchor="middle" font-size="14" font-weight="${inIt ? 700 : 400}" style="fill:var(--pc-strong)">${esc(age.text.replace('about ', '~'))}</text>`;
      s += tierDot(X, 56, age.tier, TC(age.tier), 4.2, `Age at Episode ${epNumber(L.e.id)}: ${age.text} (${TIERS[age.tier].name})`);
    }
    s += `<line x1="${f1(X)}" y1="${age ? 63 : 25}" x2="${f1(L.x)}" y2="70" stroke="var(--ep)" stroke-width="1"/>`;
    s += `</g>`;
  });
  // the life
  const bx = ax.x(born.year.min);
  const ex = ent.died?.year ? ax.x(ent.died.year.max) : X1;
  s += tierLine(bx, LY, ex, LY, born.tier || 'running', 'var(--pc-strong)', 2);
  if (!ent.died?.year) s += `<path d="M${X1 - 2} ${LY - 5} l6 5 l-6 5" fill="none" stroke="var(--pc-strong)" stroke-width="1.6"/>`;
  s += tierDot(bx, LY, born.tier || 'running', TC(born.tier || 'running'), 6, `Born ${born.year.text} (${TIERS[born.tier || 'running'].name})`);
  s += `<text class="svgt" x="${f1(bx)}" y="${LY - 12}" text-anchor="${bx < X0 + 40 ? 'start' : 'middle'}" font-size="11" style="fill:var(--pc-soft)">${ent.group === 'thing' ? 'from' : 'born'} ${esc(born.year.text)}</text>`;
  for (const b of own) {
    if (b.year.min === born.year.min) continue;
    s += tierDot(ax.x(b.year.min), LY, b.tier, TC(b.tier), 3.6, `${b.year.text}: ${b.text}`);
  }
  s += axisLayer(ax, AY);
  return cssify(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ent.title)}'s life on the Y axis: born ${esc(born.year.text)}, and the age at each episode">${s}</svg>`);
}

/** Which people get a row on the timeline page's lifelines: everyone with a birth year. */
/** Which lives get a row on the timeline page: every character with a birth year. */
export const LIVES = CHARACTERS.filter((e) => e.born?.year).sort((a, b) => a.born.year.min - b.born.year.min || a.title.localeCompare(b.title));

/**
 * The timeline page's chart: the episodes on the warped axis, then one row per life (born ... now), with the age
 * at each episode the person is in. Wide by design; on a phone it scrolls inside its frame.
 */
export function seriesChartSvg() {
  const eps = epPlaced();
  const yrs = [0, ...eps.flatMap(({ p }) => [p.min, p.max]), ...LIVES.map((e) => e.born.year.min)];
  const W = 1080, NAMEW = 176, X0 = NAMEW + 22, X1 = W - 30;
  const ax = axis(yrs, X0, X1, { tickGap: 40, cap: 6, maxGap: 12, pad: 2, focus: FOCUS(), mul: 4 });
  const ROW = 28, AXY = 104, TOP = AXY + 52;
  const H = TOP + LIVES.length * ROW + 10;
  let s = '';
  const labels = eps.map(({ e, p }) => ({ e, p, x0: ax.x(p.min), x1: ax.x(p.max), x: (ax.x(p.min) + ax.x(p.max)) / 2, w: Math.max(e.title.length * 8.4, p.text.length * 7) + 10 }));
  const lx = spread(labels, X0 - 40, X1 + 20, 10);
  labels.forEach((L, i) => {
    const wcol = Math.max(14, L.x1 - L.x0);
    const un = UNRELEASED.has(L.e.id);
    const tier = L.e.year?.tier || 'running';
    s += `<g style="${epVars(L.e.id)}">`;
    s += `<rect x="${f1(L.x - wcol / 2)}" y="${AXY}" width="${f1(wcol)}" height="${H - AXY - 6}" rx="4" fill="var(--ep)" opacity="0.12"/>`;
    if (L.x1 - L.x0 > 2) s += tierLine(L.x0, AXY, L.x1, AXY, tier, 'var(--ep)', 4);
    s += tierDot(L.x, AXY, tier, 'var(--ep)', 5.5, `Episode ${epNumber(L.e.id)}, ${L.e.title}: ${L.p.text} (${TIERS[tier].name})`);
    s += `<a href="${urlOf(L.e.id)}"><text x="${f1(lx[i])}" y="18" text-anchor="middle" font-size="13" font-weight="700" font-family="var(--mono)" fill="var(--ep)">${L.e.id}</text>` +
      `<text class="svgs" x="${f1(lx[i])}" y="38" text-anchor="middle" font-size="15">${esc(L.e.title)}</text>` +
      `<text class="svgm" x="${f1(lx[i])}" y="55" text-anchor="middle" font-size="11">${esc(L.p.text)}</text>` +
      (un ? `<text class="svgt" x="${f1(lx[i])}" y="70" text-anchor="middle" font-size="10.5" font-style="italic" style="fill:var(--pc-soft)">not released yet</text>` : '') + `</a>`;
    s += `<line x1="${f1(lx[i])}" y1="${un ? 76 : 62}" x2="${f1(L.x)}" y2="${AXY - 8}" stroke="var(--ep)" stroke-width="1"/>`;
    s += `</g>`;
  });
  s += axisLayer(ax, AXY + 14, { labels: true });
  LIVES.forEach((ent, i) => {
    const y = TOP + i * ROW;
    const born = ent.born;
    const bx = ax.x(born.year.min);
    const name = ent.title.length > 25 ? ent.title.slice(0, 24) + '…' : ent.title;
    s += `<g class="life">`;
    if (i % 2 === 0) s += `<rect x="0" y="${y - ROW / 2}" width="${W}" height="${ROW}" fill="var(--glass)"/>`;
    s += `<a href="${urlOf(ent.id)}"><text class="svgt" x="${NAMEW}" y="${y + 4.5}" text-anchor="end" font-size="13.5" style="fill:var(--pc-strong)">${esc(name)}</text></a>`;
    const ex = ent.died?.year ? ax.x(ent.died.year.max) : X1;
    s += tierLine(bx, y, ex, y, born.tier || 'running', 'var(--pc-soft)', 1.6);
    s += tierDot(bx, y, born.tier || 'running', TC(born.tier || 'running'), 4.8, `${ent.title}: born ${born.year.text} (${TIERS[born.tier || 'running'].name})`);
    const chips = labels
      .filter((L) => (ent.episodes || []).includes(L.e.id))
      .map((L) => ({ L, age: ageAt(born, L.e) }))
      .filter((c) => c.age)
      .map((c) => ({ ...c, t: c.age.text.replace('about ', '~'), x: c.L.x, w: c.age.text.replace('about ', '~').length * 7.4 + 14 }));
    const cx = spread(chips, X0, X1 + 10, 3);
    chips.forEach((c, k) => {
      const dashed = ['running', 'idea', 'open'].includes(c.age.tier);
      s += `<g style="${epVars(c.L.e.id)}"><rect x="${f1(cx[k] - c.w / 2)}" y="${y - 9.5}" width="${f1(c.w)}" height="19" rx="9.5" fill="var(--pc-bg)" stroke="var(--ep)" stroke-width="1.4"${dashed ? ' stroke-dasharray="3 2"' : ''}><title>${esc(`${ent.title} at Episode ${epNumber(c.L.e.id)}: ${c.age.text} (${TIERS[c.age.tier].name})`)}</title></rect>` +
        `<text x="${f1(cx[k])}" y="${y + 4}" text-anchor="middle" font-size="11.5" font-weight="700" font-family="var(--mono)" fill="var(--pc-strong)">${esc(c.t)}</text></g>`;
    });
    s += `</g>`;
  });
  return { svg: cssify(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The episodes and every character with a birth year on one axis, with each one's age at the episodes they are in">${s}</svg>`), ax };
}

/** A small axis for an episode page: the four episodes, this one lit. */
export function placementSvg(code) {
  const eps = epPlaced();
  const W = 680, X0 = 24, X1 = W - 24, AY = 66, H = 100;
  const ax = axis([0, ...eps.flatMap(({ p }) => [p.min, p.max])], X0, X1, { tickGap: 40, cap: 6, maxGap: 10, pad: 6, focus: FOCUS(), mul: 3 });
  let s = '';
  const labels = eps.map(({ e, p }) => ({ e, p, x: (ax.x(p.min) + ax.x(p.max)) / 2, x0: ax.x(p.min), x1: ax.x(p.max), w: code ? 34 : 96 }));
  const lx = spread(labels, X0, X1, 6);
  labels.forEach((L, i) => {
    const me = !code || L.e.id === code;
    const tier = L.e.year?.tier || 'running';
    s += `<g style="${epVars(L.e.id)}" opacity="${me ? 1 : 0.45}">`;
    if (L.x1 - L.x0 > 2) s += tierLine(L.x0, AY, L.x1, AY, tier, 'var(--ep)', me ? 6 : 4);
    s += tierDot(L.x, AY, tier, 'var(--ep)', me ? 7 : 5, `Episode ${epNumber(L.e.id)}: ${L.p.text} (${TIERS[tier].name})`);
    s += `<a href="${urlOf(L.e.id)}"><text x="${f1(lx[i])}" y="${me ? 30 : 34}" text-anchor="middle" font-size="${me ? 14 : 12}" font-weight="700" font-family="var(--mono)" fill="var(--ep)">${L.e.id}</text></a>`;
    if (me) s += `<text class="svgm" x="${f1(lx[i])}" y="46" text-anchor="middle" font-size="11" style="fill:var(--pc-strong)">${esc(L.p.text)}</text>`;
    s += `</g>`;
  });
  s += axisLayer(ax, AY + 14, { labels: true });
  return cssify(`<svg viewBox="0 0 ${W} ${H + 12}" role="img" aria-label="Where Episode ${epNumber(code)} sits on the Y axis">${s}</svg>`);
}

export { weaker, entity };
