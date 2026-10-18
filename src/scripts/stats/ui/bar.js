// The sticky range bar and the eyebrow above the H1. Three pills pick the days the whole page
// counts (30 days, 7 days, the latest day); a fourth appears for a day picked elsewhere (time
// travel from the growing chart, a route), with a drawn close mark that goes back to 30 days.
// Questions sits on the right. While the bar is stuck, wide screens get a quiet line on its left
// that keeps the answer in view after the hero has scrolled away.
import { day as fmtDay, num, range, utcStamp } from '../core/fmt.js';
import { motion } from '../core/motion.js';
import { closeSVG } from './glyph.js';

const sameRange = (a, b) => a && b && a.kind === b.kind && (a.kind === 'day' ? a.d === b.d : a.n === b.n);

/**
 * @param {HTMLElement} bar  [data-st-bar]
 * @param {*} ctx            the page context (snap, views, store, router)
 * @param {{onQuestions:(opener:HTMLElement)=>void, prefetchQuestions:()=>void}} hooks
 */
export function mountBar(bar, ctx, { onQuestions, prefetchQuestions } = {}) {
  const { snap, views, store } = ctx;
  const days = snap.days;
  const latest = days.length ? days[days.length - 1].d : null;
  const total = days.length;

  bar.removeAttribute('aria-disabled');
  const row = document.createElement('div');
  row.className = 'st-bar-row';
  const now = document.createElement('p');
  now.className = 'st-bar-now';
  now.dataset.stBarNow = '';
  now.setAttribute('aria-hidden', 'true');
  const group = document.createElement('div');
  group.className = 'st-pills';
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', 'Which days to show');
  const ask = document.createElement('button');
  ask.type = 'button';
  ask.className = 'st-pill st-pill-ask';
  ask.setAttribute('aria-haspopup', 'dialog');
  const askWide = document.createElement('span');
  askWide.className = 'st-ask-wide';
  askWide.textContent = 'All questions';
  // 'Questions' on phones (base.css swaps the two)
  const askNarrow = document.createElement('span');
  askNarrow.className = 'st-ask-narrow';
  askNarrow.textContent = 'Questions';
  ask.setAttribute('aria-label', 'All questions');
  ask.append(askWide, askNarrow);
  ask.addEventListener('click', () => onQuestions?.(ask));
  ask.addEventListener('pointerenter', () => prefetchQuestions?.(), { once: true });
  ask.addEventListener('focus', () => prefetchQuestions?.(), { once: true });
  row.append(now, group, ask);
  bar.replaceChildren(row);

  // the pill set this filing allows
  const defs = [];
  const def30 = ctx.agg.clampRange(snap, { kind: 'last', n: 30 });
  if (total > 1) {
    defs.push({ id: 'all', range: def30, label: total < 30 ? `All ${total} days` : '30 days', aria: total < 30 ? `All ${total} days gathered` : 'Last 30 days' });
  }
  if (total > 7) defs.push({ id: 'week', range: { kind: 'last', n: 7 }, label: '7 days', aria: 'Last 7 days' });
  if (latest) {
    defs.push({ id: 'latest', range: { kind: 'last', n: 1 }, label: fmtDay(latest, 'short'), aria: fmtDay(latest, 'short') + ', the latest day' });
  }

  // A pill's name starts with the words it shows ("Sat 17 Oct, the latest day"), so a voice user
  // who says what they see reaches it (WCAG 2.5.3); under 400px "17 Oct" is still inside it.
  // A day pill's weekday is its own span, which base.css drops under 400px ("17 Oct"), so three
  // range pills, a picked day and Questions still share one row on a 360px phone.
  const dayLabel = (iso, into) => {
    const t = fmtDay(iso, 'short'); // "Wed 30 Sep"
    const sp = t.indexOf(' ');
    const wd = document.createElement('span');
    wd.className = 'st-pill-wd';
    wd.textContent = sp > 0 ? t.slice(0, sp) : '';
    into.replaceChildren(wd, sp > 0 ? t.slice(sp + 1) : t);
  };

  const pills = defs.map((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'st-pill' + (d.id === 'latest' ? ' st-pill-latest' : '');
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', d.aria);
    if (d.id === 'latest') { const t = document.createElement('span'); dayLabel(latest, t); b.append(t); } else b.textContent = d.label;
    b.addEventListener('click', () => choose(d.range));
    group.append(b);
    return { def: d, el: b };
  });

  // the picked-day pill (built when needed)
  const picked = document.createElement('button');
  picked.type = 'button';
  picked.className = 'st-pill st-pill-picked';
  picked.setAttribute('role', 'radio');
  const pickedText = document.createElement('span');
  const pickedX = document.createElement('span');
  pickedX.className = 'st-pill-x';
  pickedX.append(closeSVG(10));
  picked.append(pickedText, pickedX);
  picked.hidden = true;
  group.append(picked);
  pickedX.addEventListener('click', (e) => { e.stopPropagation(); choose(def30); });
  picked.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); choose(def30); }
  });

  function choose(range) {
    store.set({ range, unit: 'pages' }, { push: false, source: 'bar' });
  }

  // a day range for the latest day is the latest pill; any other day gets the picked pill
  const isLatest = (r) => (r.kind === 'last' && r.n === 1) || (r.kind === 'day' && r.d === latest);

  function radios() {
    return [...pills.map((p) => p.el), picked].filter((b) => !b.hidden);
  }

  function draw(state) {
    const r = state.range;
    let checked = null;
    for (const p of pills) {
      const on = p.def.id === 'latest' ? isLatest(r) : sameRange(p.def.range, r);
      p.el.setAttribute('aria-checked', on ? 'true' : 'false');
      if (on) checked = p.el;
    }
    const showPicked = r.kind === 'day' && r.d !== latest;
    picked.hidden = !showPicked;
    pills.find((p) => p.def.id === 'latest')?.el.classList.toggle('is-replaced', showPicked);
    if (showPicked) {
      dayLabel(r.d, pickedText);
      picked.setAttribute('aria-label', fmtDay(r.d, 'short') + ', picked day. Press Delete to go back to ' + (total < 30 ? `all ${total} days` : '30 days'));
      picked.setAttribute('aria-checked', 'true');
      checked = picked;
    }
    // roving tabindex: only the checked radio is in the tab order
    for (const b of radios()) b.tabIndex = b === checked ? 0 : -1;
    if (!checked && radios()[0]) radios()[0].tabIndex = 0;

    const v = views.get(r);
    const lead = r.kind === 'day' || (r.kind === 'last' && r.n === 1) ? v.phrase.short
      : v.phrase.eyebrow.charAt(0) + v.phrase.eyebrow.slice(1).toLowerCase();
    now.textContent = v.pages.total
      ? `${lead} · people ${range(v.people)} of ${num(v.pages.total)} pages`
      : '';
    eyebrow(v);
  }

  // arrows move between the radios and select, as a radiogroup should
  group.addEventListener('keydown', (e) => {
    const list = radios();
    const i = list.indexOf(document.activeElement);
    if (i < 0) return;
    let j = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % list.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + list.length) % list.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = list.length - 1;
    if (j < 0) return;
    e.preventDefault();
    list[j].focus();
    list[j].click();
  });

  // ---------- the eyebrow ----------
  const eyebrowEl = document.querySelector('[data-st-eyebrow]');
  function eyebrow(v) {
    if (!eyebrowEl) return;
    // "SUN 18 OCT, 00:24 UTC". Phones drop the time but keep "UTC": a bare date is read as the
    // reader's own, and west of UTC the filing's date is often tomorrow.
    const stamp = utcStamp(snap.builtAt);
    const m = /^(.*?)(, [^ ]+)? UTC$/.exec(stamp);
    const date = m ? m[1] : stamp;
    const time = m && m[2] ? m[2] : '';
    const a = document.createElement('span');
    a.textContent = `${v.phrase.eyebrow} · FILED ${date}`;
    const b = document.createElement('span');
    b.className = 'st-eyebrow-time';
    b.textContent = time;
    const parts = [a, b, m ? ' UTC' : ''];
    if (snap.ageHours > 36) {
      const daysAgo = Math.max(2, Math.round(snap.ageHours / 24));
      const s = document.createElement('span');
      s.className = 'st-eyebrow-stale';
      s.textContent = ` · FILED ${daysAgo} DAYS AGO: TODAY'S FILING HASN'T COME IN YET`;
      parts.push(s);
    }
    eyebrowEl.replaceChildren(...parts);
  }

  // ---------- stuck detection ----------
  // A 1px sentinel sits just above the bar; once it has scrolled out of #panel-scroll the bar is
  // pinned, and gets its hairline.
  const sentinel = document.querySelector('[data-st-sentinel]');
  let io = null;
  if (sentinel && typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(([e]) => {
      const stuck = !e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0) + 1;
      bar.classList.toggle('is-stuck', stuck);
    }, { root: document.getElementById('panel-scroll'), threshold: [0, 1] });
    io.observe(sentinel);
  }

  // ---------- partial coverage ----------
  const cov = document.querySelector('[data-st-coverage]');
  if (cov) {
    const { days: have, wanted } = snap.coverage;
    if (have < wanted) {
      cov.textContent = `Still gathering: ${have} of ${wanted} days so far.`;
      cov.hidden = false;
    }
  }

  draw(store.get());
  const off = store.subscribe((s, p) => {
    if (!sameRange(s.range, p.range)) draw(s);
  });

  return {
    update() {},
    destroy() { off(); io?.disconnect(); },
    /** for motion-free screenshots and tests */
    get height() { return bar.getBoundingClientRect().height; },
    reduced: () => motion.reduced,
  };
}
