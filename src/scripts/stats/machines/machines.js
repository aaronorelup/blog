// 01 · Which machines? Four shelves under one question: the bots that say who they are (the
// library), the scanners trying doors that were never here (the locked doors), the programs with
// no browser window (the workshop) and the browsers too old to be true (the costume rack).
//
// The chapter's answer says which shelf is fullest and who the busiest single machine was; the
// tabs open each shelf. A tab is part of the address (#/machines/scanners), replaced rather than
// pushed, so Back leaves the chapter instead of walking back through every tab tried.
//
// main.js mounts this lazily when the section nears the screen (or a route names it). Everything
// here is drawn from ctx.views (core/view.js); no raw days are merged in this folder.
import '../../../styles/stats/machines.css';
import { h, clear, animate } from './dom.js';
import { TABS, TAB_KEYS, tabOf, answerModel } from './model.js';
import { browserAge } from '../core/browser.js';
import { createBots } from './bots.js';
import { createScanners } from './scanners.js';
import { createScripts } from './scripts.js';
import { createOld } from './old.js';

const PANELS = { bots: createBots, scanners: createScanners, scripts: createScripts, old: createOld };

// The kind words as the answer says them, when words.KINDS doesn't carry a long name.
const KIND_SAID = { bot: 'bots that say who they are', scanner: 'scanners', agent: 'scripts and agents', stale: 'out-of-date browsers' };

// ctx.ui.* are module namespaces; pick the named export, or the module itself if it's a function.
const pick = (mod, name) => (mod && typeof mod[name] === 'function' ? mod[name] : typeof mod === 'function' ? mod : null);

export async function mount(el, ctx) {
  const { fmt, words, motion, router, store, views, agg } = ctx;
  const reduced = () => !!(motion && motion.reduced);
  const slot = (sel, tag, cls) => el.querySelector(sel) || el.appendChild(h(tag, { class: cls }));
  const answerEl = slot('[data-st-answer]', 'p', 'st-answer');
  const contextEl = slot('[data-st-context]', 'p', 'st-context');
  const bodyEl = slot('[data-st-body]', 'div', 'st-body');
  const followEl = slot('[data-st-follow]', 'nav', 'st-follow');
  clear(bodyEl);

  const glyph = (kind, size = 12) => {
    const f = pick(ctx.ui.glyph, 'glyphSVG');
    try { return f ? f(kind, { size }) : null; } catch (e) { return null; }
  };
  const ageOf = (label) => { try { return browserAge(label, ctx.snap.through); } catch (e) { return null; } };
  const famOf = (path) => {
    try { const f = words.probeFamily && words.probeFamily(path); if (f) return f; } catch (e) { /* fall through */ }
    return { key: 'other', name: 'Other doors', hoped: 'a page that doesn’t exist here.', house: '' };
  };
  const keyOf = (range) => (agg && agg.rangeKey ? agg.rangeKey(range) : JSON.stringify(range));

  let state = store.get();
  let view = views.get(state.range);
  let current = null;          // the tab shown
  const panels = {};           // key → { el, api, drawn: rangeKey|null, shownOnce }

  // ---------- the shared helpers each shelf gets ----------
  const api = {
    ctx, fmt, words, glyph, ageOf, famOf, reduced,
    num: (n) => fmt.num(n),
    ranked: pick(ctx.ui.bars, 'rankedBars'),
    // the shelf's own part of the address, replaced (filters and opened rows aren't history)
    replace(item) {
      try { router.go({ ch: 'machines', sub: current, item: item || null }, { push: false, scroll: false }); } catch (e) { /* router not ready */ }
    },
    route: (item) => ({ ch: 'machines', sub: current, item: item || null }),
    // a card from ui/pop in the house style, anchored to the thing that opened it. A second
    // press on the same thing closes it; a keyboard press (click with detail 0) moves focus in.
    card(anchor, spec, label, ev) {
      const pop = ctx.ui.pop || {};
      if (pop.isOpenFor && pop.isOpenFor(anchor)) { pop.closePop(); return null; }
      const node = pop.cardBody ? pop.cardBody(spec) : h('div', null, [spec.title, ...[].concat(spec.body || []), spec.meta].filter(Boolean).map((t) => h('p', null, t)));
      return pop.openPop ? pop.openPop(anchor, node, { kind: 'card', label, placement: 'auto', focus: !!ev && ev.detail === 0 }) : null;
    },
    // the figure's "Show the numbers · Copy link · Copy as CSV" row, with its table twin
    tools(container, caption, cols, rows, item) {
      const twin = pick(ctx.ui.table, 'tableTwin');
      const tools = pick(ctx.ui.table, 'figureTools');
      if (!twin) return null;
      const t = twin({ caption, cols, rows });
      if (tools) tools(container, { table: t, route: api.route(item), router });
      else container.append(t.el);
      return t;
    },
    term(key, label) {
      const f = pick(ctx.ui.term, 'term');
      try { return f ? f(key, label) : label; } catch (e) { return label; }
    },
    // smooth-scroll a target into view inside #panel-scroll, under the sticky bar, then pulse it
    reveal(target) {
      const root = ctx.scrollRoot || document.getElementById('panel-scroll');
      if (!root || !target) return;
      const bar = document.querySelector('[data-st-bar]');
      const barH = bar ? bar.getBoundingClientRect().height : 0;
      const r = target.getBoundingClientRect(), rr = root.getBoundingClientRect();
      if (r.top < rr.top + barH + 8 || r.bottom > rr.bottom - 8) {
        const top = r.top - rr.top + root.scrollTop - barH - 24;
        root.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
      }
      if (motion && motion.pulse) motion.pulse(target);
    },
  };

  // ---------- the tabs ----------
  const tablist = h('div', { class: 'st-mach-tabs', role: 'tablist', 'aria-label': 'Four kinds of machine' });
  const counts = {};
  const tabs = {};
  for (const t of TABS) {
    counts[t.key] = h('span', { class: 'st-mach-tabn' }, fmt.num(view.pages[t.kind] || 0));
    tabs[t.key] = h('button', {
      type: 'button', role: 'tab', id: 'st-mach-tab-' + t.key, class: 'st-mach-tab',
      'aria-controls': 'st-mach-panel-' + t.key, 'aria-selected': 'false', tabindex: '-1',
      onclick: () => select(t.key, { user: true }),
    }, h('span', { class: 'st-mach-tabglyph', 'aria-hidden': 'true' }, glyph(t.kind, 12)),
    h('span', { class: 'st-mach-tabname' }, t.name), counts[t.key]);
    tablist.append(tabs[t.key]);
  }
  // arrows move and activate (automatic activation): one shelf per key press, Home/End to the ends
  tablist.addEventListener('keydown', (e) => {
    const i = TAB_KEYS.indexOf(current);
    let j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % TAB_KEYS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + TAB_KEYS.length) % TAB_KEYS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = TAB_KEYS.length - 1;
    if (j == null) return;
    e.preventDefault();
    select(TAB_KEYS[j], { user: true });
    tabs[TAB_KEYS[j]].focus();
  });

  const stage = h('div', { class: 'st-mach-stage' });
  for (const t of TABS) {
    const p = h('div', {
      class: 'st-mach-panel', role: 'tabpanel', id: 'st-mach-panel-' + t.key,
      'aria-labelledby': 'st-mach-tab-' + t.key, hidden: true, dataset: { tab: t.key },
    });
    stage.append(p);
    panels[t.key] = { el: p, api: null, drawn: null, shownOnce: false };
  }
  bodyEl.append(tablist, stage);

  // Where a tab's address lands. The router scrolls a route to #st-{sub} when that element exists,
  // else to the chapter heading; landing on the heading put the shelf a chip asked about ("Does AI
  // read this site?", "What are scanners after?") under the bots answer and below a phone's fold.
  // So while the address names one of these tabs, the tablist carries that id, and the route lands
  // with the tabs just under the sticky bar and the shelf's own sentence first. It is set from the
  // route event, which fires before the router looks the target up, and taken off for any other
  // address: #/where/bots and #/where/scanners use the same words and must still go to the map.
  const aimAt = (route) => {
    const on = !!(route && route.ch === 'machines' && tabOf(route.sub));
    if (on) tablist.id = 'st-' + route.sub;
    else tablist.removeAttribute('id');
  };
  aimAt(store.get().route);
  const offRoute = ctx.bus && ctx.bus.on ? ctx.bus.on('route', (e) => aimAt(e && e.route)) : null;

  // ---------- answer, context, follow-ups ----------
  function drawAnswer() {
    const a = answerModel(view, { words, ageOf, famOf });
    const render = pick(ctx.ui.sentence, 'render');
    const phrase = view.phrase ? view.phrase.long : '';
    let parts;
    if (!a) {
      parts = ['No machines asked for pages ' + phrase + '.'];
    } else {
      const kindLabel = KIND_SAID[a.kind] || ((words.KINDS && words.KINDS[a.kind] && words.KINDS[a.kind].long) || a.kind).toLowerCase();
      // "Most" only when it is most; under half, it's the largest share, said so
      parts = [a.share > 0.5 ? 'Most of the machine pages went to ' : 'The largest share of the machine pages went to ',
        { kind: a.kind, label: kindLabel }, ': ', { num: a.n, key: 'n' }];
      const m = a.member;
      const least = m && m.partial ? 'at least ' : '';
      const pagesWord = a.n === 1 ? ' page' : ' pages';
      if (!m) {
        parts.push('.');
      } else if (m.unit === 'pages') {
        parts.push('. The busiest single one was ', { b: m.name }, ', ' + m.say + ', with ' + least,
          { num: m.n, key: 'm' }, (m.n === 1 ? ' page' : ' pages') + '.');
      } else if (m.of >= m.n && m.of > 0) {
        // A program is counted in files and a door in knocks. Said beside the kind's pages, "199
        // files" read as more than the 104 pages of the kind that holds it, so the kind is given
        // in the member's unit too and the member is measured against that.
        if (m.unit === 'files') {
          parts.push(pagesWord + '. In all they asked for ', { num: m.of, key: 'of' }, ' files; ', { b: m.name }, ', ' + m.say + ', asked for ',
            { num: m.n, key: 'm' }, ' of them.');
        } else {
          parts.push(pagesWord + '. In all they knocked ', { num: m.of, key: 'of' }, ' times; the most-tried door was ', { b: m.name }, ', ' + m.say + ', with ' + least,
            { num: m.n, key: 'm' }, m.n === 1 ? ' knock.' : ' knocks.');
        }
      } else {
        // no total in the member's unit to measure against: at least name both units
        parts.push(pagesWord + '. The busiest single one was ', { b: m.name }, ', ' + m.say + ', with ' + least,
          { num: m.n, key: 'm' }, m.unit === 'files' ? ' files.' : ' knocks.');
      }
    }
    if (render) {
      try { render(answerEl, parts, { id: 'machines' }); return; } catch (e) { /* fall back to text */ }
    }
    answerEl.textContent = parts.map((p) => (typeof p === 'string' ? p : p.label || p.b || (p.num != null ? fmt.num(p.num) : ''))).join('');
  }

  function drawContext() {
    clear(contextEl);
    contextEl.append('Each kind has its own shelf. Counts are ', api.term('page', 'pages'), ' unless they say ',
      api.term('file', 'files'), '; one page usually brings 5 to 20 files with it.');
  }

  function drawFollow() {
    const f = pick(ctx.ui.followups, 'followups');
    const items = [
      { label: 'Where do they run from?', href: '#/where/bots' },
      { label: 'Is it growing?', href: '#/growing' },
      { label: 'How do you tell them apart?', href: '#/how' },
    ];
    if (f) f(followEl, items);
    else { clear(followEl); for (const it of items) followEl.append(h('a', { href: it.href }, '→ ' + it.label)); }
  }

  // ---------- switching shelves ----------
  function ensure(key) {
    const p = panels[key];
    if (!p.api) p.api = PANELS[key](p.el, api, TABS.find((t) => t.key === key));
    const k = keyOf(state.range);
    if (p.drawn !== k) {
      p.api.render(view, { first: p.drawn == null });
      p.drawn = k;
    }
    return p;
  }

  function select(key, { user = false, item, animateIt = true } = {}) {
    if (!tabOf(key)) key = 'bots';
    const changed = key !== current;
    const prev = current;
    current = key;
    for (const t of TAB_KEYS) {
      const on = t === key;
      tabs[t].setAttribute('aria-selected', String(on));
      tabs[t].tabIndex = on ? 0 : -1;
      tabs[t].classList.toggle('is-on', on);
      panels[t].el.hidden = !on;
    }
    const p = ensure(key);
    if (changed) {
      if (prev && animateIt) enterPanel(p.el);
      if (!p.shownOnce) { p.shownOnce = true; p.api.shown && p.api.shown(); }
      if (user) api.replace(null);
    }
    if (item !== undefined && p.api.go) p.api.go(item);
  }

  // 220 ms crossfade; the shelf's parts rise 8px, 40 ms apart
  function enterPanel(panel) {
    if (reduced()) return;
    animate(panel, [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.4,0,.2,1)' }, false);
    [...panel.children].slice(0, 8).forEach((c, i) => {
      animate(c, [{ transform: 'translateY(8px)' }, { transform: 'none' }],
        { duration: 220, delay: i * 40, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }, false);
    });
  }

  function drawCounts(tween) {
    for (const t of TABS) {
      const n = view.pages[t.kind] || 0;
      if (tween && motion && motion.tweenNumber) motion.tweenNumber(counts[t.key], n, { fmt: fmt.num });
      else counts[t.key].textContent = fmt.num(n);
      tabs[t.key].setAttribute('aria-label', `${t.long}: ${fmt.num(n)} ${n === 1 ? 'page' : 'pages'}`);
    }
  }

  drawAnswer();
  drawContext();
  drawFollow();
  drawCounts(false);
  const initial = state.route && state.route.ch === 'machines' && tabOf(state.route.sub) ? state.route.sub : 'bots';
  select(initial, { animateIt: false });

  return {
    update(next, prev) {
      state = next;
      if (prev && keyOf(next.range) === keyOf(prev.range)) return;   // nothing this chapter shows changed
      view = views.get(next.range);
      drawAnswer();
      drawCounts(true);
      // the visible shelf redraws now; the others when they're next opened
      ensure(current);
    },
    go(route) {
      if (!route || route.ch !== 'machines') return;
      const key = tabOf(route.sub) ? route.sub : (current || 'bots');
      select(key, { item: tabOf(route.sub) ? route.item || null : undefined });
    },
    onMode() {
      for (const k of TAB_KEYS) panels[k].api && panels[k].api.onMode && panels[k].api.onMode();
    },
    destroy() {
      if (typeof offRoute === 'function') offRoute();
      for (const k of TAB_KEYS) panels[k].api && panels[k].api.destroy && panels[k].api.destroy();
      clear(bodyEl);
    },
  };
}
