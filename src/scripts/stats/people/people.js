// Chapter 03, "What do people read, and where are they?" (#st-people). The answer sentence, then
// two figures: what people read (reading.js) and where they were (the map in map.js, with the
// list beside it, which is the part a screen reader or a keyboard uses).
//
// Mounted lazily by main.js when the chapter comes near, or at once when a route points here:
//   #/read, #/read/<slug>, #/read/sources, #/read/stayed
//   #/where, #/where/<ISO2>, #/where/bots, #/where/scanners
// Toggles and picks replace the hash (the reader's Back button isn't filled with them); the
// router echoes each one back through go(), which recognises its own and does nothing.
import '../../../styles/stats/people.css';
import { createReading } from './reading.js';
import { createMap } from './map.js';
import { CENTROIDS, continentOf } from './geo.js';

const h = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

// Cloudflare's codes for "no country" (XX) and the Tor network (T1), and anything else geo.js
// doesn't know, have no place on a map: they are counted under "Not placed", never drawn.
const WHERE_MODES = {
  person: {
    label: 'People', one: 'page', many: 'pages', color: 'var(--st-person)', sub: null,
    rows: (v) => v.countries.people,
  },
  bot: {
    label: 'Named bots', one: 'file', many: 'files', color: 'var(--st-bot)', sub: 'bots',
    rows: (v) => v.botCountries,
  },
  scanner: {
    label: 'Scanners', one: 'knock', many: 'knocks', color: 'var(--st-scanner)', sub: 'scanners',
    rows: (v) => v.probeCountries,
  },
};

// What a phone's map calls the countries whose full names are too wide for the room it has.
// The list beside the map always uses the full name.
const SHORT_NAMES = { US: 'US', GB: 'UK', AE: 'UAE' };

// A post title short enough for the answer's lede: whole when it is short, else its first sentence
// when that is a sensible length, else cut at a word; a cut title ends in an ellipsis. A full stop
// at the end goes (a closing quote and a comma follow it); a question mark stays.
export function shortTitle(s, max = 52) {
  const t = String(s || '').trim().replace(/\s+/g, ' ');
  const bare = (x) => x.replace(/[.,;:]+$/, '');
  if (t.length <= max) return bare(t);
  const first = /^(.{20,}?[.?!])\s/.exec(t);
  if (first && first[1].length <= max) return bare(first[1]) + '…';
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  // never end on a little word ("because a…"): it reads as a typo rather than a cut
  const words = (sp > 20 ? cut.slice(0, sp) : cut).replace(/[\s,;:–—-]+$/, '')
    .replace(/\s+(a|an|the|of|to|and|or|but|with|in|on|for|by|at)$/i, '');
  return bare(words) + '…';
}

// Wait for a smooth scroll to settle before opening a card: a popover closes when the panel
// scrolls, so one opened mid-flight would vanish at once. Returns a cancel function: the wait
// belongs to one route, and a reader who presses Back or follows another link before it ends
// must not get the card over wherever they went.
function afterScroll(root, fn) {
  if (!root) { fn(); return () => {}; }
  let last = root.scrollTop, still = 0, waited = 0, timer = 0;
  const tick = () => {
    waited += 50;
    if (root.scrollTop === last) still++; else { still = 0; last = root.scrollTop; }
    if (still >= 3 || waited > 2000) { timer = 0; fn(); } else timer = setTimeout(tick, 50);
  };
  timer = setTimeout(tick, 50);
  return () => { if (timer) clearTimeout(timer); timer = 0; };
}

function createWhere(fig, ctx) {
  const { fmt, ui, agg } = ctx;
  const M = ctx.motion || {};
  const reduced = () => !!(M.motion && M.motion.reduced);

  const fq = h('h3', 'st-fq', 'Where are they?');
  const fa = h('p', 'st-fa');
  const toggle = h('div', 'st-ppl-toggle');
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Whose places to show');
  const btns = Object.entries(WHERE_MODES).map(([key, m]) => {
    const b = h('button', 'st-pill st-ppl-pill');
    b.type = 'button';
    b.dataset.mode = key;
    b.setAttribute('aria-pressed', 'false');
    b.append(ui.glyph.glyphSVG(key, { size: 11 }), h('span', '', m.label));
    toggle.append(b);
    return b;
  });
  const grid = h('div', 'st-ppl-wgrid');
  const mapCol = h('div', 'st-ppl-mapcol');
  const mapHost = h('div', 'st-ppl-maphost');
  const mapKey = h('p', 'st-ppl-mapkey');
  mapKey.setAttribute('aria-hidden', 'true');
  mapCol.append(mapHost, mapKey);
  const listCol = h('div', 'st-ppl-listcol');
  const contHost = h('div', 'st-ppl-cont');
  const contHead = h('p', 'st-ppl-subhead', 'By continent');
  const listHead = h('p', 'st-ppl-subhead', 'By country');
  const listHost = h('div', 'st-ppl-clist');
  const unplacedBtn = h('button', 'st-ppl-unplaced');
  unplacedBtn.type = 'button';
  listCol.append(contHead, contHost, listHead, listHost, unplacedBtn);
  grid.append(mapCol, listCol);
  const note = h('p', 'st-ppl-note', 'Cloudflare places visitors by their internet address; this page never sees the address. A VPN moves people.');
  const tools = h('div', 'st-ppl-tools');
  fig.append(fq, fa, toggle, grid, note, tools);

  let view = null, mode = 'person', userPicked = false, rows = [], total = 0;
  let bars = null, toolsApi = null, entered = false, selfRoute = null, lit = null;

  const map = createMap(mapHost, {
    reduced,
    // on a phone the longest names the map is likely to need go short, so the leaders fit
    names: (c, phone) => (phone && SHORT_NAMES[c]) || fmt.country(c),
    fmtN: (n) => fmt.num(n),
    onHover: (code) => lightRow(code),
    onPick: (code) => pick(code, { from: 'map' }),
  });
  map.prepare();

  const m = () => WHERE_MODES[mode];
  const unit = (n) => fmt.plural(Math.round(n), m().one, m().many);
  const named = () => rows.filter((r) => CENTROIDS[r.code]);
  const unplacedRows = () => rows.filter((r) => !CENTROIDS[r.code]);

  function writeFa() {
    const list = named();
    const lead = list[0];
    const k = list.length;
    const sh = lead && total ? fmt.frac(lead.n / total) : '';
    let s;
    if (!rows.length) {
      s = mode === 'person' ? `No people to place ${view.phrase.long}.`
        : mode === 'bot' ? `No named bots came ${view.phrase.long}.` : `No scanners knocked ${view.phrase.long}.`;
    } else if (!lead) {
      s = `Cloudflare couldn't place any of them ${view.phrase.long}.`;
    } else if (mode === 'person') {
      s = k === 1 && rows.length === 1
        ? `Everyone who read was in ${fmt.countryIn(lead.code)}.`
        : list[1] && list[1].n === lead.n
          ? `People in ${fmt.num(k)} ${fmt.plural(k, 'country', 'countries')} read something, none ahead of the rest.`
          : `People in ${fmt.num(k)} ${fmt.plural(k, 'country', 'countries')} read something; ${fmt.countryIn(lead.code)} leads with ${sh}.`;
    } else if (mode === 'bot') {
      s = `Named bots came from ${fmt.num(k)} ${fmt.plural(k, 'country', 'countries')}, mostly from buildings full of rented computers; ${fmt.countryIn(lead.code)} sent ${sh} of their files.`;
    } else {
      s = `Scanners knocked from ${fmt.num(k)} ${fmt.plural(k, 'country', 'countries')}; ${fmt.countryIn(lead.code)} sent ${sh} of the knocks.`;
    }
    if (mode !== 'person' && !userPicked && !(view.countries.people || []).length) s = `No people to place ${view.phrase.long}. ` + s;
    fa.textContent = s;
  }

  function writeKey() {
    mapKey.replaceChildren();
    const lay = map.layout;
    if (!lay || !lay.clusters.length) return;
    // each mark stays on one line with its words, however the key wraps
    const item = (cls, text) => {
      const it = h('span', 'st-ppl-kitem');
      it.append(h('span', cls), h('span', '', text));
      mapKey.append(it);
    };
    item(`st-ppl-kdot is-${mode}`, `Each dot = ${fmt.num(lay.unit)} ${unit(lay.unit)}`);
    if (lay.clusters.some((c) => c.dots === 0)) item(`st-ppl-kdot is-crumb is-${mode}`, `fewer than ${fmt.num(lay.unit)}`);
    if (lay.clusters.some((c) => c.moved > 6)) item('st-ppl-kline', 'moved aside to make room');
  }

  function writeList() {
    const list = named();
    const opts = {
      rows: list.map((r) => ({ key: r.code, label: fmt.country(r.code), value: r.n })),
      color: m().color, unit: m().many, top: 8, total,
      label: `Countries, by ${m().many}`,
      onSelect: (row, li) => {
        // from the keyboard, focus goes into the card (Escape brings it back to the row)
        const focus = kbd;
        kbd = false;
        pick(row.key, { from: 'list', anchor: li.querySelector('.st-bars-hit') || li, focus });
      },
    };
    if (!bars) bars = ui.bars.rankedBars(listHost, opts);
    else bars.update(opts);
    listHost.hidden = !list.length;
    listHead.hidden = !list.length;
    const un = unplacedRows();
    const unN = un.reduce((s, r) => s + r.n, 0);
    unplacedBtn.hidden = unN <= 0;
    unplacedBtn.replaceChildren(h('span', '', 'Not placed'), h('span', 'st-ppl-unval', `${fmt.num(unN)} ${unit(unN)}`));
    unplacedBtn.setAttribute('aria-label', `Not placed: ${fmt.num(unN)} ${unit(unN)}. What this means`);
    // continents: one 100% bar, darkest to lightest
    const parts = agg.continentRollup(rows, continentOf).map((c) => ({
      key: c.key,
      label: c.key === 'XX' ? 'Not placed' : ctx.words.CONTINENTS[c.key] || c.key,
      value: c.n,
      ...(c.key === 'XX' ? { color: 'var(--pc-quiet)', opacity: 0.5 } : { color: m().color }),
    }));
    contHead.hidden = parts.length < 2;
    contHost.hidden = parts.length < 2;
    if (parts.length >= 2) ui.split.splitBar(contHost, { parts, unit: m().many, height: 12, label: 'By continent' });
    else contHost.replaceChildren();
  }

  function writeTools() {
    if (toolsApi) toolsApi.destroy();
    tools.replaceChildren();
    const Unit = m().many[0].toUpperCase() + m().many.slice(1);
    const twin = ui.table.tableTwin({
      caption: `Where ${mode === 'person' ? 'people' : mode === 'bot' ? 'named bots' : 'scanners'} were, ${view.phrase.long}`,
      cols: [{ key: 'c', label: 'Country' }, { key: 'n', label: Unit, num: true }, { key: 's', label: 'Share' }],
      rows: rows.map((r) => ({ c: CENTROIDS[r.code] ? fmt.country(r.code) : `Not placed (${fmt.country(r.code)})`, n: r.n, s: fmt.pct(total ? r.n / total : 0) })),
    });
    toolsApi = ui.table.figureTools(tools, { table: twin, route: { ch: 'where', sub: m().sub, item: null }, router: ctx.router });
  }

  function drawMap({ animate = false, crossfade = false } = {}) {
    map.draw(rows.filter((r) => CENTROIDS[r.code]), mode, { animate, crossfade, tween: M.tween });
    writeKey();
  }

  function render({ crossfade = false } = {}) {
    rows = (m().rows(view) || []).filter((r) => r.n > 0);
    total = rows.reduce((s, r) => s + r.n, 0);
    for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    writeFa();
    writeList();
    writeTools();
    lit = null;
    if (entered) drawMap({ crossfade });
  }

  function setMode(next, { route = true } = {}) {
    if (next === mode) return;
    if (ui.pop.closePop) ui.pop.closePop();
    mode = next;
    render({ crossfade: true });
    if (route && ctx.router) {
      selfRoute = m().sub || '';
      ctx.router.go({ ch: 'where', sub: m().sub, item: null }, { push: false, scroll: false });
    }
  }
  toggle.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    userPicked = true;
    setMode(b.dataset.mode);
  });

  // ---- the two-way light between the map and the list ----
  function lightRow(code) {
    lit = code;
    for (const li of listHost.querySelectorAll('li[data-key]')) li.classList.toggle('is-lit', li.dataset.key === code);
  }
  const lightBoth = (code) => { map.light(code); lightRow(code); };
  listHost.addEventListener('pointerover', (ev) => {
    if (ev.pointerType === 'touch') return;
    const li = ev.target.closest('li[data-key]');
    if (li && li.dataset.key !== lit) lightBoth(li.dataset.key);
  });
  listHost.addEventListener('pointerleave', (ev) => { if (ev.pointerType !== 'touch') lightBoth(null); });
  let kbd = false;
  listHost.addEventListener('keydown', (ev) => { kbd = ev.key === 'Enter' || ev.key === ' '; });
  listHost.addEventListener('pointerdown', () => { kbd = false; });
  listHost.addEventListener('focusin', (ev) => {
    const li = ev.target.closest('li[data-key]');
    if (li) lightBoth(li.dataset.key);
  });

  // ---- a country's card ----
  function cardFor(code) {
    const r = rows.find((x) => x.code === code);
    const name = fmt.country(code);
    const find = (list) => (list || []).find((x) => x.code === code);
    const body = [];
    if (!r) {
      body.push(mode === 'person'
        ? `No pages by people from ${fmt.countryIn(code)} ${view.phrase.long}.`
        : `Nothing from ${fmt.countryIn(code)} ${view.phrase.long}.`);
    } else {
      const share = fmt.pct(total ? r.n / total : 0);
      body.push(mode === 'person' ? `${fmt.num(r.n)} ${unit(r.n)} by people (${share})`
        : mode === 'bot' ? `${fmt.num(r.n)} ${unit(r.n)} from named bots (${share})`
          : `${fmt.num(r.n)} ${unit(r.n)} by scanners (${share})`);
    }
    const extra = [];
    if (mode === 'person') {
      const rum = find(view.countries.rum);
      if (rum && rum.n > 0) extra.push(`Cloudflare's counter: ${rum.n >= 100 ? 'about ' : ''}${fmt.approx(rum.n)} page ${fmt.plural(Math.round(rum.n), 'load', 'loads')}`);
      const b = find(view.botCountries);
      if (b) extra.push(`Named bots from here: ${fmt.num(b.n)} ${fmt.plural(b.n, 'file', 'files')}`);
    } else {
      const p = find(view.countries.people);
      extra.push(p ? `People from here: ${fmt.num(p.n)} ${fmt.plural(p.n, 'page', 'pages')}` : 'No people from here in these days.');
    }
    const card = ui.pop.cardBody({ title: name, body });
    if (extra.length) {
      const ul = h('ul', 'st-ppl-cardlist');
      for (const x of extra) ul.append(h('li', '', x));
      card.append(ul);
    }
    return { card, name };
  }

  function pick(code, { from = 'map', anchor = null, focus = false, routed = false } = {}) {
    lightBoth(code);
    const { card, name } = cardFor(code);
    const at = anchor || map.anchor(code) || map.svg;
    ui.pop.openPop(at, card, { kind: 'card', label: name, pinned: true, focus });
    if (!routed && ctx.router && mode === 'person' && /^[A-Z]{2}$/.test(code)) {
      selfRoute = code;
      ctx.router.go({ ch: 'where', sub: code, item: null }, { push: false, scroll: false });
    }
  }

  unplacedBtn.addEventListener('click', (ev) => {
    const un = unplacedRows();
    const n = un.reduce((s, r) => s + r.n, 0);
    const tor = un.find((r) => r.code === 'T1');
    const body = [`Cloudflare couldn't say where ${fmt.num(n)} ${unit(n)} came from.`];
    if (tor) body.push(`${fmt.num(tor.n)} of them came through the Tor network, which hides it on purpose.`);
    ui.pop.openPop(unplacedBtn, ui.pop.cardBody({ title: 'Not placed', body }), { kind: 'card', label: 'Not placed', pinned: true, focus: ev.detail === 0 });
  });

  // First sight: the clusters grow out of the land. Before that only the land is drawn.
  const offEnter = ui.observe.onEnter(fig, () => {
    if (entered) return;
    entered = true;
    drawMap({ animate: !reduced() });
  }, { threshold: 0.25 });

  function update(v) {
    view = v;
    if (!userPicked) mode = (v.countries.people || []).length ? 'person' : (v.botCountries || []).length ? 'bot' : 'person';
    if (ui.pop.closePop) ui.pop.closePop();
    render({ crossfade: true });
  }

  // Routes: #/where, #/where/<ISO2>, #/where/bots, #/where/scanners.
  function go(sub) {
    const echo = selfRoute;
    selfRoute = null;
    if (echo !== null && (sub || '') === echo) return;
    if (sub === 'bots') { userPicked = true; setMode('bot', { route: false }); return; }
    if (sub === 'scanners') { userPicked = true; setMode('scanner', { route: false }); return; }
    if (!sub) { if (mode !== 'person' && (view.countries.people || []).length) setMode('person', { route: false }); return; }
    const code = String(sub).toUpperCase();
    if (!/^[A-Z][A-Z0-9]$/.test(code)) return;
    if (mode !== 'person' && (view.countries.people || []).length) setMode('person', { route: false });
    if (!entered) { entered = true; drawMap(); }
    cancelWait();
    cancelWait = afterScroll(ctx.scrollRoot, () => {
      cancelWait = () => {};
      // the address may have moved on while the scroll settled (Back, another link)
      if (!stillHere(code)) return;
      // A country with a cluster: card on the cluster, two rings. One without: the card on the map.
      pick(code, { routed: true });
      map.pulse(code);
    });
  }

  // A pending card belongs to #/where/<code>. Any route to somewhere else drops it (the bus hears
  // every route before go() runs, so a new #/where/<code> starts its own wait after this).
  let cancelWait = () => {};
  const stillHere = (code) => {
    const r = ctx.router && ctx.router.current ? ctx.router.current() : null;
    return !r || (r.ch === 'where' && String(r.sub || '').toUpperCase() === code);
  };
  const offRoute = ctx.bus && ctx.bus.on
    ? ctx.bus.on('route', (e) => {
      const r = e && e.route;
      if (!r || r.ch !== 'where' || !r.sub) cancelWait();
      else if (!/^[A-Z][A-Z0-9]$/.test(String(r.sub).toUpperCase())) cancelWait();
    })
    : null;

  return {
    update,
    go,
    destroy() {
      cancelWait();
      if (typeof offRoute === 'function') offRoute();
      offEnter();
      if (toolsApi) toolsApi.destroy();
      if (bars) bars.destroy();
      map.destroy();
      fig.replaceChildren();
    },
  };
}

// ---------------------------------------------------------------------------------------------

export async function mount(el, ctx) {
  const { fmt, ui } = ctx;
  const q = (sel) => el.querySelector(sel);
  const answer = q('[data-st-answer]');
  const context = q('[data-st-context]');
  let body = q('[data-st-body]');
  const follow = q('[data-st-follow]');
  if (!body) { body = h('div', 'st-body'); el.append(body); }
  body.replaceChildren();

  const figRead = h('figure', 'st-fig st-ppl-read');
  figRead.id = 'st-read';
  const figWhere = h('figure', 'st-fig st-ppl-where');
  figWhere.id = 'st-where';
  body.append(figRead, figWhere);

  const reading = createReading(figRead, ctx);
  const where = createWhere(figWhere, ctx);

  if (context) {
    context.textContent = "Every count here is a page sent to people, Aaron's own visits included. "
      + "Each day keeps only its 40 most-read pages, so a page read now and then can drop off a day's list.";
  }
  if (follow && ui.followups) {
    ui.followups.followups(follow, [
      { label: 'Phones or computers?', href: '#/top/person' },
      { label: 'When do they read?', href: '#/when' },
      { label: 'Why is the people count a range?', href: '#/how/range' },
    ]);
  }

  function writeAnswer(v) {
    if (!answer) return;
    const posts = (v.paths || []).filter((r) => r.kind === 'post');
    const top = posts[0];
    const ppl = v.countries.people || [];
    const pTotal = ppl.reduce((s, r) => s + r.n, 0);
    const parts = [];
    if (!(v.pages.person > 0)) {
      parts.push('No pages went to ', { kind: 'person', label: 'people' }, ` ${v.phrase.long}, so there's nothing to rank or place.`);
      ui.sentence.render(answer, parts, { id: 'st-people-answer' });
      return;
    }
    if (top) {
      // Only the AO number is the link (it still brings the post's hover card); the title follows
      // in quotes, cut short, because a whole twenty-word title in the lede outweighs the answer
      // it sits in. The rows below carry it in full.
      parts.push('The most-read post was ', { link: top.href, label: top.id }, ` (“${shortTitle(top.label)}”), with `);
      if (top.partial) parts.push('at least ');
      parts.push({ num: top.n, key: 'top' }, ` ${fmt.plural(top.n, 'page', 'pages')} by `, { kind: 'person', label: 'people' }, '.');
    } else {
      const home = (v.paths || []).find((r) => r.path === '/');
      const ledger = (v.paths || []).find((r) => r.path === '/ledger/');
      parts.push({ kind: 'person', label: 'People' }, ' mostly opened the homepage (', { num: home ? home.n : 0, key: 'home' }, ' pages)');
      if (ledger) parts.push(' and the list of posts (', { num: ledger.n, key: 'ledger' }, ')');
      parts.push('; no single post stood out.');
    }
    const placed = ppl.filter((r) => r.code !== 'XX' && r.code !== 'T1');
    const c1 = placed[0];
    if (c1) {
      const share = pTotal ? c1.n / pTotal : 0;
      // Name the runners-up only when they're ahead of the next country: on a quiet day eleven
      // countries tie at one page, and naming two of them would make up an order.
      const cands = placed.slice(1, 3);
      const cutoff = placed[3] ? placed[3].n : -1;
      const named = cands.filter((c) => c.n > cutoff).map((c) => fmt.countryIn(c.code));
      const others = placed.length - 1 - named.length;
      const then = named.length === cands.length ? named
        : [...named, `${fmt.num(others)} other ${fmt.plural(others, 'country', 'countries')}`];
      const tail = then.length ? `, then ${fmt.list(then)}` : '';
      if (placed[1] && placed[1].n === c1.n) parts.push(` Readers were spread over ${fmt.num(placed.length)} countries, none ahead of the rest.`);
      else if (placed.length === 1 && ppl.length === 1) parts.push(` Everyone who read was in ${fmt.countryIn(c1.code)}.`);
      else if (share >= 0.5) parts.push(` Most readers were in ${fmt.countryIn(c1.code)} (${fmt.frac(share)})${tail}.`);
      else parts.push(` Readers were spread out: ${fmt.countryIn(c1.code)} led with ${fmt.frac(share)}${tail}.`);
    }
    ui.sentence.render(answer, parts, { id: 'st-people-answer' });
  }

  const viewOf = (state) => ctx.views.get(state.range);
  let key = null;
  function render(state) {
    const v = viewOf(state);
    if (v.key === key) return;
    key = v.key;
    writeAnswer(v);
    reading.update(v);
    where.update(v);
  }
  render(ctx.store.get());

  return {
    update(state) { render(state); },
    go(route) {
      if (!route) return;
      if (route.ch === 'read') reading.go(route.sub);
      else if (route.ch === 'where') where.go(route.sub);
    },
    destroy() {
      reading.destroy();
      where.destroy();
    },
  };
}
