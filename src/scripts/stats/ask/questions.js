// The Questions index: every question the page can answer, grouped, each with its answer for
// the range the bar is on, computed the moment the sheet opens. Tapping one closes the sheet and
// takes the reader to where the page shows it (a pushed route, so Back comes back).
//
// Loaded on first open (and prefetched when a pointer or focus reaches an All questions button),
// so it costs nothing to a reader who never asks.
//
// The sheet is a modal dialog: focus moves in and is trapped there, Escape or the scrim closes
// it and gives focus back to whatever opened it. On a wide screen it slides in from the right
// under the site header; on a phone it is a bottom sheet with a handle, and a swipe down closes
// it. The filter is a filter, not an answerer: it keeps the questions whose words (or their
// synonyms, so "google" finds the search questions) start with what was typed.
import '../../../styles/stats/ask.css';
import { GROUPS, questionList, matches, synonymMap } from './answers.js';
import { closeSVG, searchSVG } from './icons.js';

const WIDE = '(min-width: 640px)';
const FINE = '(hover: hover) and (pointer: fine)';
const NONE_TEXT = "Nothing matches; these numbers can't see clicks, searches or who anyone is. Try 'bots', 'phone' or 'busiest'.";

// Where a route lands, for moving focus there once the page has scrolled (DESIGN §D.8).
const CH_EL = { top: 'st-top', machines: 'st-machines', growing: 'st-growing', read: 'st-read', where: 'st-where', when: 'st-when', speed: 'st-speed', how: 'st-how' };

let sheet = null;   // built once, reused

export function open(ctx, opener) {
  if (!sheet) sheet = build(ctx);
  sheet.show(opener || document.activeElement);
  return sheet;
}
export function close() { if (sheet) sheet.hide(true); }

// Lets main.js mount it like any other lazy module if it prefers; the sheet is created on open.
export async function mount(el, ctx) {
  return { update() {}, go() { open(ctx, null); }, destroy() { if (sheet) sheet.hide(false); } };
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function build(ctx) {
  // The synonyms live in core/words (DESIGN §C.4), already loaded with the page.
  const syn = synonymMap(ctx.words && ctx.words.SYNONYMS);
  const reduced = () => ctx.motion.reduced;

  const wrap = el('div', 'st-ask-layer');
  wrap.setAttribute('data-st-sheet', '');
  wrap.hidden = true;
  const scrim = el('div', 'st-ask-scrim');
  const box = el('div', 'st-ask-sheet');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', 'st-ask-title');

  const grab = el('div', 'st-ask-grab');
  grab.setAttribute('aria-hidden', 'true');
  grab.append(el('span'));

  const top = el('div', 'st-ask-top');
  const title = el('h2', 'st-ask-title', 'All questions');
  title.id = 'st-ask-title';
  title.tabIndex = -1;
  const x = el('button', 'st-ask-x');
  x.type = 'button';
  x.setAttribute('aria-label', 'Close the questions');
  x.append(closeSVG(18));
  const forLine = el('p', 'st-ask-for');
  const field = el('div', 'st-ask-field');
  const label = el('label', 'st-sr', 'Filter the questions');
  label.htmlFor = 'st-ask-q';
  const input = el('input', 'st-ask-input');
  input.id = 'st-ask-q';
  input.type = 'search';
  input.placeholder = 'Filter: try google, phone, attack';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.setAttribute('enterkeyhint', 'search');
  field.append(label, searchSVG(16), input);
  const count = el('p', 'st-ask-count');
  count.setAttribute('aria-live', 'polite');
  top.append(title, x, forLine, field, count);

  const list = el('div', 'st-ask-list');
  const none = el('p', 'st-ask-none', NONE_TEXT);
  none.hidden = true;
  // The no-match line lives inside the list, right under the count line where the reader is
  // looking: as the list's sibling it sat under the list's flex-grown empty height, at the foot of
  // the sheet, behind a phone's keyboard.
  box.append(grab, top, list);
  wrap.append(scrim, box);
  document.body.append(wrap);

  let items = [];
  let opener = null;
  let isOpen = false;
  let countT = 0;
  let closing = [];   // the slide-out animations of a close still in progress
  let entry = 0;      // the history entry this sheet pushed (its state's stAsk), 0 when none
  let pickRun = 0;    // the latest pick, so a newer one (or the reader) cancels an older focus hand-off

  function render() {
    items = questionList(ctx);
    const view = ctx.views.get(ctx.store.get().range);
    forLine.textContent = `Each answer is for ${view.phrase.long.replace(/^(in|on) /, '')}.`;
    list.replaceChildren();
    for (const g of GROUPS) {
      const sec = el('section', 'st-ask-group');
      const gid = 'st-ask-g-' + g.toLowerCase().replace(/\W+/g, '-');
      const h = el('h3', 'st-ask-gh', g);
      h.id = gid;
      const ul = el('ul', 'st-ask-qs');
      ul.setAttribute('aria-labelledby', gid);
      for (const it of items.filter((i) => i.group === g)) {
        const li = el('li');
        const b = el('button', 'st-ask-q');
        b.type = 'button';
        b.append(el('span', 'st-ask-qq', it.q), el('span', 'st-ask-qa', it.a));
        b.addEventListener('click', () => pick(it));
        it.li = li;
        li.append(b);
        ul.append(li);
      }
      sec.append(h, ul);
      list.append(sec);
    }
    list.append(none);
    filter(false);
  }

  function filter(announce = true) {
    const q = input.value.trim();
    let shown = 0;
    for (const it of items) {
      const ok = matches(it, q, syn);
      it.li.hidden = !ok;
      if (ok) shown++;
    }
    for (const sec of list.querySelectorAll('.st-ask-group')) sec.hidden = ![...sec.querySelectorAll('li')].some((li) => !li.hidden);
    none.hidden = shown > 0;
    clearTimeout(countT);
    const text = q ? `${shown} of ${items.length} questions` : `${items.length} questions`;
    // Announce after typing pauses, not on every key.
    if (announce) countT = setTimeout(() => { count.textContent = text; }, 350);
    else count.textContent = text;
  }

  function focusables() {
    return [...box.querySelectorAll('button, input, a[href]')].filter((n) => !n.disabled && n.offsetParent !== null && !n.closest('[hidden]'));
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); hide(true); return; }
    if (e.key === 'Tab') {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  }

  // The page behind shouldn't scroll under the scrim.
  const stop = (e) => { if (!box.contains(e.target)) e.preventDefault(); };

  function place() {
    const root = document.getElementById('panel-scroll');
    if (!root || !matchMedia(WIDE).matches) { box.style.top = box.style.right = box.style.bottom = ''; return; }
    const r = root.getBoundingClientRect();
    box.style.top = Math.max(0, r.top) + 'px';
    box.style.bottom = Math.max(0, innerHeight - r.bottom) + 'px';
    box.style.right = Math.max(0, innerWidth - r.right) + 'px';
  }

  function show(from) {
    opener = from && from !== document.body ? from : null;
    render();
    place();
    if (isOpen) return;
    isOpen = true;
    // A close still sliding out would hide the sheet again when it ends; stop it here.
    for (const a of closing) a.cancel();
    closing = [];
    wrap.hidden = false;
    box.style.transform = '';
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('wheel', stop, { passive: false });
    wrap.addEventListener('touchmove', stop, { passive: false });
    addEventListener('resize', place);
    if (opener) opener.setAttribute('aria-expanded', 'true');
    pushEntry();
    if (!reduced()) {
      const wide = matchMedia(WIDE).matches;
      box.animate(wide
        ? [{ transform: 'translateX(28px)', opacity: 0 }, { transform: 'none', opacity: 1 }]
        : [{ transform: 'translateY(100%)' }, { transform: 'none' }],
      { duration: wide ? 260 : 320, easing: ctx.motion.CSS_EASE ? ctx.motion.CSS_EASE.std : 'cubic-bezier(.4,0,.2,1)' });
      scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'linear' });
    }
    // A keyboard or mouse reader lands in the filter; a phone lands on the title, so the
    // on-screen keyboard doesn't jump up over the questions.
    requestAnimationFrame(() => (matchMedia(FINE).matches ? input : title).focus({ preventScroll: true }));
  }

  // A sheet opened from a button gets its own history entry (#/ask, keeping the range, unit and
  // clock in the address), so Back, and on Android the system back gesture, closes the sheet and
  // nothing else. Without it Back went to the page before /stats, or yanked the page underneath
  // back to an earlier route. Written straight into history rather than through router.go: the
  // router's last-seen address stays the page's own, so when Back pops this entry the router sees
  // nothing new and leaves the page where it was, and the popstate below closes the sheet.
  // A sheet opened by the address itself (#/ask arrived at, or Forward) already has its entry.
  function pushEntry() {
    entry = 0;
    const r = ctx.router.current && ctx.router.current();
    if ((r && r.ch === 'ask') || typeof history === 'undefined') return;
    const mark = Date.now();
    try {
      history.pushState({ ...(history.state || {}), stAsk: mark }, '', location.pathname + location.search + ctx.router.href({ ch: 'ask', sub: null, item: null }));
      entry = mark;
    } catch { /* a sandbox that refuses history writes: the sheet still opens, Back just leaves */ }
  }
  const onEntry = () => !!entry && !!history.state && history.state.stAsk === entry;
  addEventListener('popstate', () => {
    if (isOpen && entry && !onEntry()) { entry = 0; hide(true); }
  });

  // leaveEntry: the caller deals with the sheet's history entry itself (a pick replaces it).
  function hide(restore, { leaveEntry = false } = {}) {
    if (!isOpen) return;
    isOpen = false;
    // Closed from inside (X, Escape, scrim, swipe): take back the entry the sheet pushed, so the
    // next Back doesn't land on a #/ask that reopens it. The router ignores that pop, as above.
    if (entry && !leaveEntry) {
      const mine = onEntry();
      entry = 0;
      if (mine) history.back();
    }
    document.removeEventListener('keydown', onKey, true);
    wrap.removeEventListener('wheel', stop);
    wrap.removeEventListener('touchmove', stop);
    removeEventListener('resize', place);
    if (opener) opener.setAttribute('aria-expanded', 'false');
    // Hidden only if it is still closed when the slide ends: a quick reopen inside those 200 ms
    // (a second tap on Questions) must not be undone by the close that came before it.
    const done = () => { closing = []; if (!isOpen) { wrap.hidden = true; box.style.transform = ''; } };
    if (reduced()) done();
    else {
      const wide = matchMedia(WIDE).matches;
      const from = box.style.transform || 'none';
      const out = box.animate(wide
        ? [{ transform: from, opacity: 1 }, { transform: 'translateX(28px)', opacity: 0 }]
        : [{ transform: from }, { transform: 'translateY(100%)' }],
      { duration: 200, easing: 'cubic-bezier(.4,0,1,1)' });
      closing = [out, scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'linear' })];
      // Only this close's own ending counts; one cancelled by a reopen settles late and is ignored.
      const end = () => { if (closing[0] === out) done(); };
      out.finished.then(end, end);
    }
    // If the sheet was opened by #/ask, leave the address on the page it sits over.
    const r = ctx.router.current && ctx.router.current();
    if (r && r.ch === 'ask') ctx.router.go('#/top', { push: false, scroll: false });
    if (restore && opener && opener.isConnected) opener.focus({ preventScroll: true });
  }

  function pick(it) {
    const run = ++pickRun;
    // The sheet's own history entry becomes the answer's, so Back from the answer returns to
    // where the reader was before opening the sheet, not to the sheet.
    const hadEntry = entry && onEntry();
    entry = 0;
    hide(false, { leaveEntry: true });
    // Focus waits on the opener while the page moves, never on <body> (where the next Tab
    // would start again at "Skip to content"); it moves on once the answer is there.
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    // The answers are worded in pages, so the pick lands in pages, whatever unit the page was left
    // in (a Show me or the sorted chart's Files pill switches the whole page to files), unless the
    // route names its own unit (the scanner spike's files).
    ctx.router.go(it.route, { push: !hadEntry, params: /[?&]u=/.test(it.route) ? undefined : { u: 'pages' } });
    // The reader taking over (a key, a tap) ends the hand-off: focus is theirs from then on.
    const cancel = () => { if (pickRun === run) pickRun++; };
    document.addEventListener('keydown', cancel, { capture: true, once: true });
    document.addEventListener('pointerdown', cancel, { capture: true, once: true });
    const started = performance.now();
    // "Am I in here?" walks a guest past the four questions before its result opens.
    const patience = /^#\/top\/you\b/.test(it.route) ? 7000 : 4000;
    // Focus follows the reader to the answer once it exists: a chapter that wasn't mounted when
    // the question was picked has no figure to land on yet, and a pile's drawer opens a moment
    // after its route. So the target is looked for again until it turns up.
    const scroller = document.getElementById('panel-scroll');
    let lastTop = NaN;
    const tick = () => {
      if (pickRun !== run) return;
      // "Still": the scroll hasn't moved since the last look, so what's in view is where it landed.
      const top = scroller ? scroller.scrollTop : 0;
      const still = top === lastTop;
      lastTop = top;
      const deep = landing(it.route, still);
      if (!deep && performance.now() - started < patience) { setTimeout(tick, 120); return; }
      document.removeEventListener('keydown', cancel, { capture: true });
      document.removeEventListener('pointerdown', cancel, { capture: true });
      const now = document.activeElement;
      // A module that already put focus inside its answer (an opened row) keeps it there.
      if (deep && deep.at !== document.body && deep.at.contains(now) && now !== document.body) {
        if (it.term) explainTerm(it.term, deep.h);
        return;
      }
      const target = deep ? deep.h : fallback(it.route);
      if (target && target !== now) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      } else if (!target && (!now || now === document.body) && opener && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
      if (it.term) explainTerm(it.term, target);
    };
    setTimeout(tick, reduced() ? 0 : 650);
  }

  // What a screen reader should hear first where a route lands: the question heading of the
  // sub-route's figure (#st-{sub}) or of the chapter, the title of a pile's or the You drawer,
  // the page's question for the top. Null while that isn't on the page yet; otherwise { at, h }:
  // the region the answer is in, and the heading in it that takes focus.
  const HEAD = '.st-q, .st-fq, h2, h3';
  const KINDS = ['person', 'bot', 'scanner', 'agent', 'stale'];
  const mountedCh = (n) => !!(n && n.closest('[data-st-mounted]'));
  function landing(route, still = true) {
    const m = /^#\/(\w+)(?:\/([^/?]+))?/.exec(route);
    if (!m) return null;
    const [, ch, sub] = m;
    if (ch === 'top') {
      if (sub === 'you' || KINDS.includes(sub)) {
        const at = document.querySelector(`[data-st-drawer][data-open="true"][data-key="${sub}"] .st-gate-drawer[data-kind="${sub}"]`);
        const h = at && at.querySelector('.st-gate-dtitle');
        return h ? { at, h } : null;
      }
      // The replay scrolls to the piles, past the page's question; the section is what's in view.
      const top = document.getElementById('st-top');
      if (sub) return top ? { at: top, h: top } : null;
      const h1 = document.getElementById('st-h1');
      return h1 ? { at: h1, h: h1 } : null;
    }
    // The sub-route's own figure when it has one (#st-filed). A sub-route without one (a pinned
    // day, a country) lands somewhere inside its chapter that the chapter's module scrolls to, so
    // once the chapter is drawn and the scroll has come to rest, it is the first figure heading in
    // view there; failing that, the chapter itself.
    const chEl = document.getElementById(CH_EL[ch]);
    const own = sub && document.getElementById('st-' + sub);
    if (own) {
      // Its heading, unless the module scrolled on past it to a row it opened (ChatGPT's): then
      // that row, which is what's on screen.
      if (!still) return null;
      const h = own.matches(HEAD) ? own : own.querySelector(HEAD) || own;
      if (inView(h)) return { at: own, h };
      const row = [...own.querySelectorAll('[aria-expanded="true"]')].find(inView);
      return row ? { at: own, h: row } : null;
    }
    if (!chEl || (sub && (!mountedCh(chEl) || !still))) return null;
    if (sub) {
      const seen = [...chEl.querySelectorAll('.st-fq, .st-q')].find(inView);
      return seen ? { at: seen.closest('figure') || chEl, h: seen } : null;
    }
    return { at: chEl, h: chEl.matches(HEAD) ? chEl : chEl.querySelector(HEAD) || chEl };
  }

  // When the deeper target never turned up: the chapter as the server drew it (its kicker and
  // question are always there), but only if it is on screen; otherwise none, and focus stays on
  // the opener rather than on a heading the reader can't see.
  const SECTION = { read: 'st-people', where: 'st-people', when: 'st-rhythm', speed: 'st-rhythm' };
  function fallback(route) {
    const m = /^#\/(\w+)/.exec(route);
    if (!m) return null;
    const sec = document.getElementById(CH_EL[m[1]] || '') || document.getElementById(SECTION[m[1]] || '');
    const h = sec && (m[1] === 'top' ? sec : sec.querySelector(HEAD));
    return h && inView(h) ? h : null;
  }
  // In view and not under the site header or the sticky bar: the point at its middle is its own.
  function inView(n) {
    const r = n.getBoundingClientRect();
    if (!r.height) return false;
    const x = Math.min(innerWidth - 1, Math.max(0, r.left + Math.min(r.width / 2, 40)));
    const y = r.top + Math.min(r.height / 2, 12);
    if (y < 0 || y >= innerHeight) return false;
    const hit = document.elementFromPoint(x, y);
    return !!hit && (n === hit || n.contains(hit));
  }

  // "What is a page versus a file?" lands on the hero and opens the definition card on the
  // first "pages" there, the way a tap on the dotted word would.
  function explainTerm(key, fallback) {
    const btn = [...document.querySelectorAll('#st-top .st-term')].find((b) => /\bpages?\b/i.test(b.textContent));
    const text = termText(ctx.words, key);
    if (!text) return;
    const anchor = btn || fallback;
    if (!anchor) return;
    const body = ctx.ui.pop.cardBody ? ctx.ui.pop.cardBody({ title: 'Page', body: text }) : text;
    ctx.ui.pop.openPop(anchor, body, { kind: 'card', label: 'What "page" means', placement: 'auto', focus: !!btn });
  }

  // Back (or any route) while the sheet is open moves the page underneath it, so the sheet goes
  // too, the way Back dismisses a bottom sheet on a phone. #/ask itself is what opens it.
  if (ctx.bus) ctx.bus.on('route', ({ route } = {}) => { if (isOpen && route && route.ch !== 'ask') hide(true); });

  x.addEventListener('click', () => hide(true));
  scrim.addEventListener('click', () => hide(true));
  input.addEventListener('input', () => filter(true));
  input.addEventListener('keydown', (e) => {
    // Enter picks the only question left, so a typed filter can be finished from the keyboard.
    if (e.key === 'Enter') {
      const left = items.filter((i) => !i.li.hidden);
      if (left.length === 1) { e.preventDefault(); pick(left[0]); }
    }
  });

  // Swipe down to close, from the handle or the top of the sheet (not from inside the list,
  // which needs its own scrolling).
  let drag = null;
  const startDrag = (e) => {
    if (matchMedia(WIDE).matches || e.button || e.target.closest('input, button')) return;
    drag = { y: e.clientY, t: performance.now(), dy: 0, id: e.pointerId };
    try { box.setPointerCapture(e.pointerId); } catch { /* a synthetic pointer: moves still reach the sheet */ }
    box.classList.add('st-ask-dragging');
  };
  const moveDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag.dy = Math.max(0, e.clientY - drag.y);
    box.style.transform = `translateY(${drag.dy}px)`;
  };
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const v = drag.dy / Math.max(1, performance.now() - drag.t);
    const shut = drag.dy > 90 || (drag.dy > 36 && v > 0.5);
    box.classList.remove('st-ask-dragging');
    drag = null;
    if (shut) hide(true);
    else if (box.style.transform) {
      const from = box.style.transform;
      box.style.transform = '';
      if (!reduced()) box.animate([{ transform: from }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.4,0,.2,1)' });
    }
  };
  grab.addEventListener('pointerdown', startDrag);
  top.addEventListener('pointerdown', startDrag);
  box.addEventListener('pointermove', moveDrag);
  box.addEventListener('pointerup', endDrag);
  box.addEventListener('pointercancel', endDrag);

  return { show, hide, get open() { return isOpen; }, el: wrap };
}

// words.TERMS may hold a string or { body } per key.
function termText(words, key) {
  const t = words && words.TERMS && (words.TERMS[key] || words.TERMS[key + 's']);
  if (!t) return 'One web page: a post, the list of posts, the homepage. The pictures and videos inside it aren\'t extra pages; they\'re files.';
  return typeof t === 'string' ? t : t.body || t.text || t.def || '';
}
